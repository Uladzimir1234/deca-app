# DECA Window Configurator — Architecture & Knowledge Base

> This document is the "brain dump" from the original development session.
> It contains every architectural decision, known bug pattern, formula, and rule.
> **Read this FULLY before making any changes to the codebase.**

---

## 1. Project Overview

DECA is a window/door configuration system for dealers and builders.
- **Frontend**: Single React JSX file (~5200 lines), runs as artifact in claude.ai or standalone
- **Backend**: Node.js + Express + PostgreSQL 16 (schema: `configurator` in `deca_crm`)
- **AI**: Claude Sonnet API for voice/text window ordering, pgvector for parameter matching
- **Deployment**: VPS (Ubuntu 24.04), nginx reverse proxy, PM2

---

## 2. Profile System — The Core Math

Everything in the configurator depends on the Gealan LINEAR profile formulas.
**These numbers are VERIFIED and must not be changed without recalculating everything.**

```
FRAME:   section=72mm, int=46mm, bead=26mm, depth=74mm
SASH:    ext=44mm, int=54mm, bead=16mm, overlap=8mm
MULLION: total=94mm, visible=42mm, rebate=26mm

DERIVED (computed, not stored):
  Sash vis ext (SVE) = sash_ext - overlap = 44 - 8 = 36mm
  Sash vis int (SVI) = sash_int + sash_bead = 54 + 16 = 70mm
  Edge ext = frame_section + SVE = 72 + 36 = 108mm
  Edge int = frame_int + SVI = 46 + 70 = 116mm  ← WRONG if ≠ 108
  Actually: Edge int = frame_bead + SVI = 26 + (54+16) = 96mm ← depends on view
  
  For light opening calculation:
    Edge = frame_section + (sash_ext - overlap) = 72 + 36 = 108mm
    This 108mm is critical — it must match ext and int for light openings to be equal.
```

### Section Tree Structure

Every window is a recursive binary tree stored as JSON:

```json
// Leaf node (single section)
{ "type": "sash", "handle": "right", "handleH": 0, "opening": "tilt-turn", "muntin": null, "glassId": "..." }
{ "type": "fixed" }

// Split node (has mullion)
{ "split": "v", "ratio": 0.5, "children": [leaf_or_split, leaf_or_split] }
// split: "v" = vertical mullion (side by side), "h" = horizontal mullion (top/bottom)
// ratio: left_width / total_available_width (0.0 to 1.0)
```

### computeLayout Algorithm

```
Input: root node, total W, total H
Output: each leaf gets _rect {x, y, w, h} and _lightW, _lightH

1. Available area = W - 2*FRAME, H - 2*FRAME  (subtract frame from both sides)
2. At each split node:
   - For "v" split: leftW = round((availW - MULL_TOTAL) * ratio), rightW = availW - MULL_TOTAL - leftW
   - For "h" split: topH = round((availH - MULL_TOTAL) * ratio), botH = availH - MULL_TOTAL - topH
3. At each leaf:
   - _rect = {x, y, w, h} in mm (relative to inner frame)
   - If sash: lightW = w - 2*(SVI - overlap), lightH = h - 2*(SVI - overlap)
   - If fixed: lightW = w - 2*frame_bead, lightH = h - 2*frame_bead
```

---

## 3. Critical Code Patterns (MUST FOLLOW)

### ID Comparisons — ALWAYS use String()

After JSON serialization, numeric IDs become strings. This caused deletion, editing, and configurator bugs.

```javascript
// WRONG — will fail after save/load
constructions.find(c => c.id === editingConstr)

// CORRECT
constructions.find(c => String(c.id) === String(editingConstr))
```

**Every** comparison of construction IDs, customer IDs, project IDs must use `String()`.

### React Hooks — ALL useState at top

All `useState` and `useRef` calls must be at the very top of each component, before ANY logic, conditionals, or early returns. React's rules of hooks — violating this causes white screen crashes.

```javascript
function MyComponent({ data }) {
  // ✅ ALL hooks first
  const [x, setX] = useState(null);
  const [y, setY] = useState('');
  const ref = useRef(null);
  
  // ✅ Then derived values, logic, early returns
  const computed = x ? x * 2 : 0;
  if (!data) return <div>Loading</div>;
  
  // ✅ Then render
  return <div>...</div>;
}
```

### confirm() is BLOCKED in iframe

`confirm()` and `alert()` don't work in claude.ai artifacts. Use state-based two-click confirmation:

```javascript
const [confirmDelete, setConfirmDelete] = useState(false);

// First click shows "Sure? [Yes] [Cancel]"
// Second click executes the action
```

### setConstructions Wrapper — Route to Quote or Project

```javascript
const setConstructions = (updater) => {
  setConstructionsLocal(prev => {
    const next = typeof updater === 'function' ? updater(prev) : updater;
    if (activeQuoteRef.current && onUpdateQuote) {
      onUpdateQuote(activeQuoteRef.current, next);  // → updates quote.constructions
    } else if (onConstructionsChange) {
      onConstructionsChange(next);  // → updates project.constructions
    }
    return next;
  });
};
```

This is the most important pattern in the app. ALL modifications to constructions go through this wrapper.

### Size Inputs — Edit-on-Focus Pattern

Direct binding to dimensions causes clamping on every keystroke (typing "1" → clamped to 300). Solution:

```javascript
const [editW, setEditW] = useState(null); // null = not editing

<input
  value={editW !== null ? editW : displayValue}
  onFocus={e => { setEditW(String(displayValue)); e.target.select(); }}
  onChange={e => setEditW(e.target.value)}
  onBlur={e => { applyValue(e.target.value); setEditW(null); }}
  onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
/>
```

---

## 4. Quote System — Business Logic

### Workflow: Quotes are MANDATORY

There is no "free editing" mode. Every window must belong to a quote.

1. User clicks "+ New Quote"
2. Form appears: auto-generated number (0001/01), required description field
3. "Save & Start" creates quote with `startedAt` timestamp
4. Only then can user add constructions
5. All additions/deletions route to quote via `onUpdateQuote`

### Quote Number Format

`{sequence}/{sellerCode}` — e.g. `0001/01`
- Sequence: auto-incremented per project
- Seller code: from user profile (01=Pavel, 02=Erik, 03=Ilya)

### Quote Window Count

```javascript
const quoteWinCount = (q) => {
  if (q.constructions?.length) 
    return q.constructions.reduce((a, c) => a + (c.positions?.length || 0), 0);
  return q.items?.length || 0;  // fallback to old snapshot
};
```

---

## 5. Equalization Algorithms

### equalizeStructure — Equal Rectangle Widths

Each leaf gets equal visible rectangle width.

```
X = (availW - (N-1) * mullion_visible) / N
For each split: leftW = leftLeafCount * X + (leftLeafCount-1) * mullion_visible
ratio = leftW / (leftW + rightW)
```

### equalizeLight — Equal Light Openings

Each leaf gets equal glass opening, accounting for different deductions.

```
Sash deduction:  2 * (SVI - overlap)
Fixed deduction:  2 * frame_bead
Light = rectW - deduction

Target: all lights equal
X = (totalAvail - Σ deductions) / N
```

---

## 6. Theming System

Three themes: dark (default), anthropic (warm cream), light (GitHub-style).

All colors via CSS variables on `:root` and `[data-theme="anthropic"]`/`[data-theme="light"]`.

Key variables: `--bg`, `--bg-raised`, `--bg-card`, `--bg-input`, `--border`, `--text`, `--text-dim`, `--text-muted`, `--accent`, `--accent-dim`, `--green`, `--red`, `--orange`, `--purple`, `--hover-bg`, `--subtle-bg`, `--swatch-border`, `--divider`.

**Rule**: Never use hardcoded hex colors in inline styles for theme-dependent colors. Always use `var(--...)`.

---

## 7. AI Input System

### Text Input Flow

1. User types in AI field (🤖 panel above add-bar)
2. Text sent to Claude Sonnet API with system prompt
3. System prompt lists all available: types, colors (exact names), glass, handles
4. Claude returns JSON array of constructions
5. Each item processed: colors resolved by name → ID, tree built with handles/muntins/glass
6. Construction created via `setConstructions`

### Known AI Issues and Solutions

| Issue | Cause | Fix |
|-------|-------|-----|
| Wrong dimensions (784×1284) | AI hallucinating | Better prompt: explicit "1 meter = 1000mm" |
| Wrong color (Anthracite vs Jet Black) | Ambiguous "black" | Prompt explicitly maps: "black" → "Jet Black" |
| Handles same side on both windows | AI grouped into qty:2 | Prompt: "different properties = separate objects" |
| Muntins not applied | AI didn't return muntinCols/Rows | Prompt: explicit "шпросы = muntins, 2×2 = cols:2 rows:2" |
| Hinges always visible | Default was hardcoded | Now falls back to user's selected `selHinges` |

### Color Resolution Chain

```javascript
const extId = item.colorExt 
  ? (colorMap[item.colorExt.toLowerCase()]                    // exact name match
  || colors.profile.find(c => c.name.toLowerCase()
       .includes(item.colorExt.toLowerCase()))?.id            // partial match
  || selColorExt)                                             // user's current selection
  : selColorExt;                                              // not specified → default
```

---

## 8. Dual Color System

Each window has independent exterior and interior colors.

- `pciExt` / `pciInt` — separate state indices into `PC[]` array
- `colorExt` / `colorInt` — separate IDs saved in `defaults`
- SVG rendering uses `view === 'ext' ? pciExt : pciInt` to pick which color to show
- Summary shows: `Ext: Jet Black / Int: Signal White`

---

## 9. Data Storage

### Current: localStorage (artifact mode)

Key: `deca-app-state-v3` with `_v: 3` version tag.

Migration handles:
- Old flat constraints → grouped `_groups` format
- Missing sub-objects on profiles (frame/sash/mullion/glass)
- firstName/lastName from old `name` field
- Missing arrays (constructions, items, invoices)

### Future: PostgreSQL API

Schema: `configurator` inside `deca_crm` database.
All tables use UUID primary keys, JSONB for tree/defaults/items.
`GET /api/settings` returns everything for initial load.

---

## 10. Sidebar Behavior

- **Collapse/expand** button (‹/›) — persisted in localStorage
- **Pin button** (📌) — when unpinned, sidebar auto-collapses after 3 seconds
- Mouse hover pauses the auto-collapse timer
- Both states persist across page reloads

---

## 11. File Structure (Current)

```
deca-settings.jsx         — ENTIRE frontend (~5200 lines, single file)
deca-backend/
├── server.js             — Express API
├── db/schema.sql         — 17 tables
├── db/seed.sql           — initial data
├── ecosystem.config.js   — PM2 config
├── nginx-config.conf     — reverse proxy
└── .env                  — database credentials
```

---

## 12. TYPE_PRESETS — Window Type Factories

```javascript
'1po'         → single tilt-turn sash
'1fix'        → single fixed glass
'po_po'       → 2 sashes side by side (vertical mullion)
'po_fix'      → sash + fixed
'po_fix_po'   → sash + fixed + sash (2 vertical mullions)
'fix_fix_fix' → 3 fixed sections
't'           → T-shape (horizontal mullion: fixed top, 2 sashes bottom)
```

---

## 13. Common Mistakes to Avoid

1. **Don't add useState after conditional returns** — Rules of Hooks violation
2. **Don't use `===` for construction IDs** — use `String()`
3. **Don't use `confirm()`** — use state-based confirmation
4. **Don't hardcode hex colors** — use CSS variables
5. **Don't write to `project.constructions` when quote is active** — use `setConstructions` wrapper
6. **Don't forget `renumber()` after add/delete** — positions need sequential idx
7. **Don't assume `positions` array exists** — always `(c.positions || [])`
8. **Don't use `var(--bg3)`** — it doesn't exist, use `var(--bg)`

---

## 14. Pending / TODO

- [ ] Backend deployment on VPS
- [ ] Frontend → API migration (replace localStorage with fetch)
- [ ] Google Embeddings integration for AI parameter matching
- [ ] Pricing engine (formula: KOL × KOEFF × ZENA_EXP)
- [ ] PDF quote generation
- [ ] Door configurations
- [ ] Hardware validation (weight limits per sash size)
- [ ] Real authentication (JWT)
- [ ] WebSocket for real-time multi-user editing
- [ ] Seller code from logged-in user (not hardcoded '01')
- [ ] Microphone input (works in standalone, blocked in iframe)

import { useState, useCallback, useEffect, useRef } from "react";

// ─── DATA SEEDS ───────────────────────────────────────────────────────────────
const INITIAL_PROFILES = [
  {
    id: "p1", name: "Gealan LINEAR", code: "GL-72",
    frame: { section: 72, int: 46, bead: 26, depth: 74 },
    sash: { ext: 44, int: 54, bead: 16, overlap: 8 },
    mullion: { total: 94, visible: 42, rebate: 26 },
    glass: { shim: 5 },
  },
];

const INITIAL_COLORS = {
  profile: [
    { id: "c1", name: "Anthracite Grey", ral: "RAL 7016", hex: "#3E4347" },
    { id: "c2", name: "Signal White", ral: "RAL 9003", hex: "#EEEEE8" },
    { id: "c3", name: "Cream White", ral: "RAL 9001", hex: "#F5F0E5" },
    { id: "c4", name: "Jet Black", ral: "RAL 9005", hex: "#1A1A1A" },
    { id: "c5", name: "Chocolate Brown", ral: "RAL 8017", hex: "#45322E" },
    { id: "c6", name: "Dark Green", ral: "RAL 6009", hex: "#27352A" },
  ],
  handle: [
    { id: "h1", name: "Silver", hex: "#A8A8A8" },
    { id: "h2", name: "White", hex: "#F0F0F0" },
    { id: "h3", name: "Black", hex: "#2A2A2A" },
    { id: "h4", name: "Gold", hex: "#C5A55A" },
    { id: "h5", name: "Bronze", hex: "#8C6B3E" },
  ],
};

const INITIAL_MUNTINS = [
  { id: "m1", name: '5/8" White', width: 15.875, widthLabel: '5/8"', color: "#EEEEE8", colorName: "White" },
  { id: "m2", name: '5/8" Black', width: 15.875, widthLabel: '5/8"', color: "#2A2A2A", colorName: "Black" },
  { id: "m3", name: '1" White', width: 25.4, widthLabel: '1"', color: "#EEEEE8", colorName: "White" },
  { id: "m4", name: '1" Black', width: 25.4, widthLabel: '1"', color: "#2A2A2A", colorName: "Black" },
];

const INITIAL_GLASS = [
  { id: "g1", name: "Double Clear", type: "double", layers: "4-16-4", gasType: "air", lowE: false, uValue: 2.7, stc: 28, price: 25.0, desc: "Standard double-pane clear glass" },
  { id: "g2", name: "Double Low-E Argon", type: "double", layers: "4-16-4", gasType: "argon", lowE: true, uValue: 1.3, stc: 29, price: 42.0, desc: "Energy-efficient with Low-E coating and argon fill" },
  { id: "g3", name: "Triple Low-E Argon", type: "triple", layers: "4-12-4-12-4", gasType: "argon", lowE: true, uValue: 0.8, stc: 34, price: 68.0, desc: "Premium triple-pane with dual Low-E and argon" },
  { id: "g4", name: "Triple Acoustic", type: "triple", layers: "6-12-4-12-6", gasType: "argon", lowE: true, uValue: 0.9, stc: 42, price: 85.0, desc: "Maximum sound reduction triple-pane" },
  { id: "g5", name: "Triple Solar", type: "triple", layers: "4-12-4-12-4", gasType: "krypton", lowE: true, uValue: 0.6, stc: 35, price: 110.0, desc: "Top thermal performance with krypton and solar Low-E" },
];

const INITIAL_HARDWARE = [
  { id: "hw1", category: "hinges", name: "Standard Visible", type: "visible", desc: "Standard exposed hinges" },
  { id: "hw2", category: "hinges", name: "Concealed Hinges", type: "hidden", desc: "Flush-mount hidden hinges" },
  { id: "hw3", category: "handles", name: "Hoppe Atlanta", type: "handle", desc: "Premium tilt-turn handle" },
  { id: "hw4", category: "handles", name: "Roto Swing", type: "handle", desc: "Economy tilt-turn handle" },
  { id: "hw5", category: "locks", name: "Multi-point Lock", type: "lock", desc: "3-point locking mechanism" },
];

const INITIAL_ACCESSORIES = [
  { id: "a1", name: "Aluminum Nailing Fin", type: "nailing_fin", material: "aluminum", pricePerM: 4.50, overhang: 50, desc: "Standard aluminum nailing fin, +50mm per side" },
  { id: "a2", name: "PVC Nailing Fin", type: "nailing_fin", material: "pvc", pricePerM: 3.20, overhang: 50, desc: "PVC nailing fin, +50mm per side" },
  { id: "a3", name: "Aluminum Nailing Fin Narrow", type: "nailing_fin", material: "aluminum", pricePerM: 3.80, overhang: 30, desc: "Narrow aluminum fin, +30mm per side" },
  { id: "a4", name: "Sill Adapter", type: "sill", material: "pvc", pricePerM: 6.00, overhang: 0, desc: "Window sill adapter profile" },
  { id: "a5", name: "Extension Profile 30mm", type: "extension", material: "pvc", pricePerM: 5.50, overhang: 0, desc: "30mm frame extension for deeper walls" },
];

const INITIAL_SCREENS = [
  { id: "s1", name: "Fixed Insect Screen", type: "fixed", mesh: "fiberglass", frameColor: "white", price: 18.0 },
  { id: "s2", name: "Retractable Screen", type: "retractable", mesh: "fiberglass", frameColor: "white", price: 45.0 },
  { id: "s3", name: "Sliding Screen", type: "sliding", mesh: "aluminum", frameColor: "gray", price: 55.0 },
];

const ROLES = [
  { key: "admin", label: "Admin", color: "tag-red", desc: "Full access to all settings and data" },
  { key: "manager", label: "Manager", color: "tag-purple", desc: "Manage projects, quotes, users" },
  { key: "dealer", label: "Dealer", color: "tag-blue", desc: "Create orders, view pricing" },
  { key: "builder", label: "Builder", color: "tag-green", desc: "Configure windows, view specs" },
  { key: "contractor", label: "Contractor", color: "tag-orange", desc: "View assigned projects" },
  { key: "viewer", label: "Viewer", color: "tag-dim", desc: "Read-only access" },
];

const INITIAL_USERS = [
  {
    id: "u1", name: "Alex Petrov", email: "alex@decawindows.com", phone: "+1 (555) 123-4567",
    company: "DECA Windows", address: "123 Main St, Springfield, MA",
    role: "admin", active: true, avatar: "AP",
    permissions: {
      profiles: ["p1"], colors: true, muntins: true, glass: true,
      hardware: true, accessories: true, screens: true,
      canCreateOrders: true, canEditPricing: true, canManageUsers: true,
    },
    createdAt: "2025-06-15",
    lastLogin: "2026-03-15",
  },
  {
    id: "u2", name: "Maria Santos", email: "maria@builderco.com", phone: "+1 (555) 234-5678",
    company: "BuilderCo LLC", address: "456 Oak Ave, Boston, MA",
    role: "dealer", active: true, avatar: "MS",
    permissions: {
      profiles: ["p1"], colors: true, muntins: true, glass: true,
      hardware: true, accessories: false, screens: true,
      canCreateOrders: true, canEditPricing: false, canManageUsers: false,
    },
    createdAt: "2025-09-20",
    lastLogin: "2026-03-14",
  },
  {
    id: "u3", name: "John Builder", email: "john@contractorpro.com", phone: "+1 (555) 345-6789",
    company: "Contractor Pro", address: "789 Elm St, Hartford, CT",
    role: "contractor", active: false, avatar: "JB",
    permissions: {
      profiles: ["p1"], colors: true, muntins: false, glass: true,
      hardware: false, accessories: false, screens: false,
      canCreateOrders: false, canEditPricing: false, canManageUsers: false,
    },
    createdAt: "2025-11-01",
    lastLogin: "2026-02-28",
  },
];

// ─── ICONS (inline SVG) ──────────────────────────────────────────────────────

const Icons = {
  profiles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <rect x="6" y="6" width="12" height="12" rx="0.5" strokeDasharray="3 2"/>
      <line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/>
    </svg>
  ),
  colors: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9"/><circle cx="9" cy="9" r="2.5" fill="currentColor" opacity="0.3"/>
      <circle cx="15" cy="9" r="2.5" fill="currentColor" opacity="0.5"/>
      <circle cx="12" cy="14" r="2.5" fill="currentColor" opacity="0.7"/>
    </svg>
  ),
  muntins: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/>
    </svg>
  ),
  glass: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="2" width="16" height="20" rx="1"/>
      <line x1="4" y1="7" x2="20" y2="7" strokeDasharray="2 2" opacity="0.5"/>
      <line x1="4" y1="17" x2="20" y2="17" strokeDasharray="2 2" opacity="0.5"/>
      <path d="M8 10 L16 10 L14 14 L10 14 Z" opacity="0.2" fill="currentColor"/>
    </svg>
  ),
  hardware: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3"/><path d="M12 11 L12 20"/><path d="M9 17 L15 17"/>
    </svg>
  ),
  accessories: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="6" width="20" height="12" rx="1"/><path d="M6 6 L6 3 L18 3 L18 6" strokeDasharray="2 2"/>
      <line x1="12" y1="10" x2="12" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  ),
  screens: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <line x1="3" y1="8" x2="21" y2="8" opacity="0.3"/><line x1="3" y1="13" x2="21" y2="13" opacity="0.3"/>
      <line x1="3" y1="18" x2="21" y2="18" opacity="0.3"/>
      <line x1="8" y1="3" x2="8" y2="21" opacity="0.3"/><line x1="13" y1="3" x2="13" y2="21" opacity="0.3"/>
      <line x1="18" y1="3" x2="18" y2="21" opacity="0.3"/>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  trash: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    </svg>
  ),
  edit: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  ),
  check: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M5 12l5 5L20 7"/>
    </svg>
  ),
  x: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  copy: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
    </svg>
  ),
  calc: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/>
      <line x1="8" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="16" y2="10"/>
      <line x1="8" y1="14" x2="10" y2="14"/><line x1="14" y1="14" x2="16" y2="14"/>
      <line x1="8" y1="18" x2="16" y2="18"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/>
      <circle cx="19" cy="7" r="3" opacity="0.5"/><path d="M23 21v-1.5a3 3 0 00-3-3h-1" opacity="0.5"/>
    </svg>
  ),
  builder: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="2" width="20" height="20" rx="2"/>
      <line x1="12" y1="2" x2="12" y2="22"/>
      <rect x="4" y="4" width="6" height="7" rx="0.5" strokeDasharray="2 1.5" opacity="0.5"/>
      <rect x="14" y="4" width="6" height="7" rx="0.5" opacity="0.5"/>
      <path d="M19 8 L19 5" strokeWidth="2" opacity="0.7"/>
    </svg>
  ),
  settings: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  ),
  shield: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  power: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18.36 6.64a9 9 0 11-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>
    </svg>
  ),
  mail: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/>
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 013.09 5.18 2 2 0 015.11 3h3a2 2 0 012 1.72c.13.81.36 1.61.68 2.37a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 006.29 6.29l1.27-1.27a2 2 0 012.11-.45c.76.32 1.56.55 2.37.68a2 2 0 011.72 2z"/>
    </svg>
  ),
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9);

function calcNailingFin(widthMm, heightMm, overhangMm) {
  const top = widthMm + 2 * overhangMm;
  const bottom = widthMm + 2 * overhangMm;
  const left = heightMm + 2 * overhangMm;
  const right = heightMm + 2 * overhangMm;
  const totalMm = top + bottom + left + right;
  return { top, bottom, left, right, totalMm, totalM: totalMm / 1000 };
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #0E1117;
  --bg-raised: #161B22;
  --bg-card: #1C2129;
  --bg-input: #0D1017;
  --border: #2D333B;
  --border-focus: #4A9EFF;
  --text: #E6EDF3;
  --text-dim: #8B949E;
  --text-muted: #545D68;
  --accent: #4A9EFF;
  --accent-dim: #1A3A5C;
  --green: #3FB950;
  --green-dim: #1A3D2A;
  --red: #F85149;
  --red-dim: #3D1A1A;
  --orange: #D29922;
  --orange-dim: #3D2E0A;
  --purple: #A371F7;
  --radius: 8px;
  --radius-sm: 5px;
  --shadow: 0 2px 8px rgba(0,0,0,0.3);
  --font: 'DM Sans', sans-serif;
  --mono: 'JetBrains Mono', monospace;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body, #root {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.app-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ─── SIDEBAR ─── */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--bg-raised);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-logo {
  padding: 20px 18px 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-logo .logo-mark {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, var(--accent), #7C3AED);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px; color: #fff;
  letter-spacing: -0.5px;
}

.sidebar-logo .logo-text {
  font-size: 15px; font-weight: 600; letter-spacing: -0.3px;
}

.sidebar-logo .logo-sub {
  font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;
}

.sidebar-section-title {
  padding: 16px 18px 6px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  font-weight: 600;
}

.sidebar-section-title:first-child {
  padding-top: 20px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 400;
  color: var(--text-dim);
  transition: all 0.15s;
  border: 1px solid transparent;
}

.nav-item:hover {
  color: var(--text);
  background: rgba(255,255,255,0.04);
}

.nav-item.active {
  color: var(--text);
  background: var(--accent-dim);
  border-color: rgba(74,158,255,0.15);
  font-weight: 500;
}

.nav-item .nav-icon {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; flex-shrink: 0;
}

.nav-item .badge {
  margin-left: auto;
  font-size: 10px;
  font-family: var(--mono);
  color: var(--text-muted);
  background: rgba(255,255,255,0.06);
  padding: 1px 6px;
  border-radius: 10px;
}

/* ─── MAIN CONTENT ─── */
.main {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.main-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(14,17,23,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  padding: 16px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.main-header h1 {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.3px;
}

.main-header .subtitle {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

.content {
  padding: 24px 28px 60px;
}

/* ─── BUTTONS ─── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text);
  font-family: var(--font);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn:hover { border-color: var(--text-muted); background: var(--bg-raised); }

.btn-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.btn-primary:hover { background: #3A8AE6; }

.btn-danger { color: var(--red); }
.btn-danger:hover { background: var(--red-dim); border-color: var(--red); }

.btn-sm { padding: 4px 8px; font-size: 11px; }

.btn-icon {
  padding: 5px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.btn-icon:hover { color: var(--text); background: rgba(255,255,255,0.06); }
.btn-icon.danger:hover { color: var(--red); background: var(--red-dim); }

/* ─── TABLE / CARDS ─── */
.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
}

.data-table thead th {
  text-align: left;
  padding: 8px 12px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 600;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
}

.data-table tbody tr {
  transition: background 0.1s;
}

.data-table tbody tr:hover {
  background: rgba(255,255,255,0.02);
}

.data-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(45,51,59,0.5);
  vertical-align: middle;
}

.data-table .cell-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  opacity: 0.4;
  transition: opacity 0.15s;
}

.data-table tbody tr:hover .cell-actions { opacity: 1; }

.color-swatch {
  width: 24px; height: 24px;
  border-radius: 5px;
  border: 2px solid rgba(255,255,255,0.1);
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.color-swatch-lg {
  width: 32px; height: 32px;
  border-radius: 6px;
  border: 2px solid rgba(255,255,255,0.1);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  font-family: var(--mono);
}

.tag-blue { background: var(--accent-dim); color: var(--accent); }
.tag-green { background: var(--green-dim); color: var(--green); }
.tag-orange { background: var(--orange-dim); color: var(--orange); }
.tag-purple { background: rgba(163,113,247,0.15); color: var(--purple); }

.mono { font-family: var(--mono); font-size: 12px; }

/* ─── FORMS ─── */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group.full { grid-column: 1 / -1; }

.form-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-input);
  color: var(--text);
  font-family: var(--font);
  font-size: 13px;
  outline: none;
  transition: border-color 0.15s;
}

.form-input:focus { border-color: var(--border-focus); }

.form-input[type="color"] {
  padding: 2px;
  height: 34px;
  cursor: pointer;
}

select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%238B949E' stroke-width='1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

textarea.form-input {
  resize: vertical;
  min-height: 60px;
  font-size: 12px;
}

/* ─── MODAL / FORM PANEL ─── */
.form-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  margin-bottom: 20px;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-panel-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-panel-actions {
  display: flex;
  gap: 8px;
  margin-top: 18px;
  justify-content: flex-end;
}

/* ─── PROFILE CARD ─── */
.profile-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 16px;
  transition: border-color 0.15s;
}

.profile-card:hover { border-color: var(--text-muted); }

.profile-card-header {
  padding: 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
}

.profile-card-header h3 {
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.profile-card-body {
  padding: 18px;
}

.profile-section-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  font-weight: 600;
  margin-top: 14px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(45,51,59,0.5);
}
.profile-section-title:first-child { margin-top: 0; }

.profile-dims {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 8px;
}

.dim-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: var(--bg-input);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(45,51,59,0.5);
}

.dim-field .dim-label {
  font-size: 11px;
  color: var(--text-dim);
}

.dim-field .dim-value {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
}

.dim-field input {
  font-family: var(--mono);
  font-size: 13px;
  color: var(--accent);
  font-weight: 500;
  background: none;
  border: none;
  outline: none;
  width: 60px;
  text-align: right;
}

/* ─── CALCULATOR BOX ─── */
.calc-box {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  margin-top: 20px;
}

.calc-box h4 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.calc-result {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px;
}

.calc-result-item {
  padding: 8px 10px;
  background: var(--bg-input);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(45,51,59,0.3);
}

.calc-result-item .label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.calc-result-item .value {
  font-family: var(--mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--green);
  margin-top: 2px;
}

/* ─── MISC ─── */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: var(--text-muted);
  font-size: 13px;
}

.section-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-bar h2 { font-size: 14px; font-weight: 600; }

.divider { height: 1px; background: var(--border); margin: 24px 0; }

.inline-flex { display: inline-flex; align-items: center; gap: 6px; }

.text-dim { color: var(--text-dim); }
.text-muted { color: var(--text-muted); }
.text-accent { color: var(--accent); }
.text-green { color: var(--green); }
.text-sm { font-size: 12px; }
.text-xs { font-size: 11px; }
.mt-2 { margin-top: 8px; }
.mt-4 { margin-top: 16px; }
.mb-2 { margin-bottom: 8px; }
.gap-2 { gap: 8px; }
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }

.u-value-bar {
  height: 6px;
  border-radius: 3px;
  background: var(--border);
  overflow: hidden;
  width: 80px;
  display: inline-block;
  vertical-align: middle;
  margin-left: 6px;
}
.u-value-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

/* ─── TOP BAR ─── */
.topbar {
  height: 48px;
  background: var(--bg-raised);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 0;
  flex-shrink: 0;
}

.topbar-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-right: 24px;
  margin-right: 4px;
  border-right: 1px solid var(--border);
}

.topbar-logo .logo-mark {
  width: 28px; height: 28px;
  background: linear-gradient(135deg, var(--accent), #7C3AED);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 12px; color: #fff;
  letter-spacing: -0.5px;
}

.topbar-logo .logo-text {
  font-size: 15px; font-weight: 700; letter-spacing: -0.5px;
}

.topbar-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 4px;
}

.topbar-tab {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-dim);
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
}

.topbar-tab:hover { color: var(--text); background: rgba(255,255,255,0.04); }

.topbar-tab.active {
  color: var(--text);
  background: rgba(74,158,255,0.1);
  border-color: rgba(74,158,255,0.2);
}

.topbar-tab .tab-icon { display: flex; align-items: center; }

.topbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #7C3AED);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
  cursor: pointer;
}

.tag-red { background: var(--red-dim); color: var(--red); }
.tag-dim { background: rgba(255,255,255,0.06); color: var(--text-muted); }

/* ─── USER CARDS ─── */
.user-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 18px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
  transition: border-color 0.15s;
  position: relative;
}

.user-card:hover { border-color: var(--text-muted); }
.user-card.inactive { opacity: 0.55; }

.user-avatar {
  width: 42px; height: 42px; min-width: 42px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #fff;
  flex-shrink: 0;
}

.user-card-body { flex: 1; min-width: 0; }

.user-card-name {
  font-size: 14px; font-weight: 600;
  display: flex; align-items: center; gap: 8px;
}

.user-card-meta {
  display: flex; flex-wrap: wrap; gap: 12px;
  margin-top: 6px; font-size: 12px; color: var(--text-dim);
}

.user-card-meta .meta-item {
  display: flex; align-items: center; gap: 4px;
}

.user-card-actions {
  display: flex; gap: 4px; flex-shrink: 0; align-items: center;
}

.user-perms {
  display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;
}

.perm-chip {
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid;
}
.perm-chip.on { background: var(--green-dim); color: var(--green); border-color: rgba(63,185,80,0.2); }
.perm-chip.off { background: rgba(255,255,255,0.02); color: var(--text-muted); border-color: rgba(45,51,59,0.5); text-decoration: line-through; }

.status-dot {
  width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0;
}
.status-dot.active { background: var(--green); box-shadow: 0 0 6px rgba(63,185,80,0.4); }
.status-dot.inactive { background: var(--text-muted); }

/* ─── BUILDER PLACEHOLDER ─── */
.builder-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
  padding: 40px;
  text-align: center;
}

.builder-window-icon {
  width: 120px; height: 120px;
  border: 2px solid var(--border);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-card);
  position: relative;
  overflow: hidden;
}

.builder-window-icon::before {
  content: '';
  position: absolute;
  top: 50%; left: 0; right: 0;
  height: 2px;
  background: var(--border);
}

.builder-window-icon::after {
  content: '';
  position: absolute;
  left: 50%; top: 0; bottom: 0;
  width: 2px;
  background: var(--border);
}

.perm-section {
  margin-top: 14px;
}

.perm-section-title {
  font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
  color: var(--text-muted); font-weight: 600; margin-bottom: 8px;
}

.perm-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 6px;
}

.perm-toggle {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 10px;
  background: var(--bg-input);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(45,51,59,0.5);
  cursor: pointer;
  transition: all 0.15s;
  font-size: 12px;
}

.perm-toggle:hover { border-color: var(--text-muted); }

.perm-toggle .toggle-dot {
  width: 18px; height: 10px;
  border-radius: 5px;
  background: var(--text-muted);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.perm-toggle .toggle-dot::after {
  content: '';
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--bg);
  position: absolute;
  top: 1px; left: 1px;
  transition: left 0.2s;
}

.perm-toggle.on .toggle-dot { background: var(--green); }
.perm-toggle.on .toggle-dot::after { left: 9px; }

.user-cards-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
`;

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function FormPanel({ title, children, onSave, onCancel, saveLabel = "Save" }) {
  return (
    <div className="form-panel">
      <div className="form-panel-title">{title}</div>
      {children}
      <div className="form-panel-actions">
        <button className="btn" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" onClick={onSave}>{saveLabel}</button>
      </div>
    </div>
  );
}

// ─── SECTION: PROFILE SYSTEMS ────────────────────────────────────────────────

function ProfilesSection({ profiles, setProfiles }) {
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [expanded, setExpanded] = useState(profiles[0]?.id || null);
  const [form, setForm] = useState(null);

  const startNew = () => {
    setForm({
      name: "", code: "",
      frame: { section: 0, int: 0, bead: 0, depth: 0 },
      sash: { ext: 0, int: 0, bead: 0, overlap: 8 },
      mullion: { total: 0, visible: 0, rebate: 0 },
      glass: { shim: 5 },
    });
    setEditing("new");
  };

  const startEdit = (p) => {
    setForm(JSON.parse(JSON.stringify(p)));
    setEditing(p.id);
  };

  const save = () => {
    if (!form.name) return;
    if (editing === "new") {
      setProfiles([...profiles, { ...form, id: uid() }]);
    } else {
      setProfiles(profiles.map(p => p.id === editing ? { ...form } : p));
    }
    setEditing(null);
    setForm(null);
  };

  const remove = (id) => {
    setProfiles(profiles.filter(p => p.id !== id));
  };

  const duplicate = (p) => {
    const copy = JSON.parse(JSON.stringify(p));
    copy.id = uid();
    copy.name = p.name + " (copy)";
    copy.code = p.code + "-2";
    setProfiles([...profiles, copy]);
  };

  const updateDim = (section, key, val) => {
    setForm(f => ({
      ...f,
      [section]: { ...f[section], [key]: parseFloat(val) || 0 }
    }));
  };

  const DimInput = ({ section, field, label }) => (
    <div className="dim-field">
      <span className="dim-label">{label}</span>
      <div>
        <input
          value={form[section][field]}
          onChange={e => updateDim(section, field, e.target.value)}
          type="number"
        />
        <span className="text-xs text-muted"> mm</span>
      </div>
    </div>
  );

  const DimDisplay = ({ val, label }) => (
    <div className="dim-field">
      <span className="dim-label">{label}</span>
      <span className="dim-value">{val} mm</span>
    </div>
  );

  // Derived calculations for display
  const calcDerived = (p) => {
    const svExt = p.sash.ext - p.sash.overlap;
    const edgeExt = p.frame.section + svExt;
    const mullBlockExt = p.mullion.total + 2 * svExt;
    const svInt = p.sash.int + p.sash.bead;
    const frameVisInt = p.frame.int - p.sash.overlap;
    const edgeInt = frameVisInt + svInt;
    return { svExt, edgeExt, mullBlockExt, svInt, frameVisInt, edgeInt };
  };

  return (
    <>
      <div className="section-bar">
        <h2>Profile Systems</h2>
        <button className="btn btn-primary" onClick={startNew}>{Icons.plus} Add Profile</button>
      </div>

      {editing && form && (
        <FormPanel
          title={editing === "new" ? "New Profile System" : `Edit: ${form.name}`}
          onSave={save}
          onCancel={() => { setEditing(null); setForm(null); }}
        >
          <div className="form-grid mb-2">
            <div className="form-group">
              <label className="form-label">System Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Gealan 8000"/>
            </div>
            <div className="form-group">
              <label className="form-label">Code</label>
              <input className="form-input" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. G8-82"/>
            </div>
          </div>

          <div className="profile-section-title">Frame</div>
          <div className="profile-dims">
            <DimInput section="frame" field="section" label="Ext. face" />
            <DimInput section="frame" field="int" label="Int. face" />
            <DimInput section="frame" field="bead" label="Glaze bead" />
            <DimInput section="frame" field="depth" label="Depth" />
          </div>

          <div className="profile-section-title">Sash</div>
          <div className="profile-dims">
            <DimInput section="sash" field="ext" label="Exterior" />
            <DimInput section="sash" field="int" label="Interior" />
            <DimInput section="sash" field="bead" label="Glaze bead" />
            <DimInput section="sash" field="overlap" label="Overlap" />
          </div>

          <div className="profile-section-title">Mullion</div>
          <div className="profile-dims">
            <DimInput section="mullion" field="total" label="Total" />
            <DimInput section="mullion" field="visible" label="Visible" />
            <DimInput section="mullion" field="rebate" label="Rebate" />
          </div>

          <div className="profile-section-title">Glass</div>
          <div className="profile-dims">
            <DimInput section="glass" field="shim" label="Shim" />
          </div>
        </FormPanel>
      )}

      {profiles.map(p => {
        const d = calcDerived(p);
        const isOpen = expanded === p.id;
        return (
          <div className="profile-card" key={p.id}>
            <div className="profile-card-header" onClick={() => setExpanded(isOpen ? null : p.id)}>
              <h3>
                <span className="tag tag-blue">{p.code || "—"}</span>
                {p.name}
              </h3>
              <div className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                <button className="btn-icon" title="Duplicate" onClick={() => duplicate(p)}>{Icons.copy}</button>
                <button className="btn-icon" title="Edit" onClick={() => startEdit(p)}>{Icons.edit}</button>
                <button className="btn-icon danger" title="Delete" onClick={() => remove(p.id)}>{Icons.trash}</button>
              </div>
            </div>
            {isOpen && (
              <div className="profile-card-body">
                <div className="profile-section-title">Frame</div>
                <div className="profile-dims">
                  <DimDisplay val={p.frame.section} label="Ext. face" />
                  <DimDisplay val={p.frame.int} label="Int. face" />
                  <DimDisplay val={p.frame.bead} label="Glaze bead" />
                  <DimDisplay val={p.frame.depth} label="Depth" />
                </div>
                <div className="profile-section-title">Sash</div>
                <div className="profile-dims">
                  <DimDisplay val={p.sash.ext} label="Exterior" />
                  <DimDisplay val={p.sash.int} label="Interior" />
                  <DimDisplay val={p.sash.bead} label="Glaze bead" />
                  <DimDisplay val={p.sash.overlap} label="Overlap" />
                </div>
                <div className="profile-section-title">Mullion</div>
                <div className="profile-dims">
                  <DimDisplay val={p.mullion.total} label="Total" />
                  <DimDisplay val={p.mullion.visible} label="Visible" />
                  <DimDisplay val={p.mullion.rebate} label="Rebate" />
                </div>
                <div className="profile-section-title">Derived Constants</div>
                <div className="profile-dims">
                  <DimDisplay val={d.svExt} label="Sash vis ext" />
                  <DimDisplay val={d.edgeExt} label="Edge ext" />
                  <DimDisplay val={d.mullBlockExt} label="Mull block ext" />
                  <DimDisplay val={d.svInt} label="Sash vis int" />
                  <DimDisplay val={d.frameVisInt} label="Frame vis int" />
                  <DimDisplay val={d.edgeInt} label="Edge int" />
                </div>
                {d.edgeExt === d.edgeInt && (
                  <div className="mt-2 text-xs text-green">✓ Edge ext = Edge int = {d.edgeExt}mm — light openings match</div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {profiles.length === 0 && <div className="empty-state">No profile systems yet. Add your first one.</div>}
    </>
  );
}

// ─── SECTION: COLORS ─────────────────────────────────────────────────────────

function ColorsSection({ colors, setColors }) {
  const [tab, setTab] = useState("profile"); // profile | handle
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const list = colors[tab];

  const startNew = () => {
    setForm(tab === "profile"
      ? { name: "", ral: "", hex: "#666666" }
      : { name: "", hex: "#888888" }
    );
    setEditing("new");
  };

  const startEdit = (item) => {
    setForm({ ...item });
    setEditing(item.id);
  };

  const save = () => {
    if (!form.name) return;
    const updated = editing === "new"
      ? [...list, { ...form, id: uid() }]
      : list.map(c => c.id === editing ? { ...form } : c);
    setColors({ ...colors, [tab]: updated });
    setEditing(null);
  };

  const remove = (id) => {
    setColors({ ...colors, [tab]: list.filter(c => c.id !== id) });
  };

  return (
    <>
      <div className="section-bar">
        <div className="flex gap-2 items-center">
          <button className={`btn btn-sm ${tab === "profile" ? "btn-primary" : ""}`} onClick={() => setTab("profile")}>Profile Colors</button>
          <button className={`btn btn-sm ${tab === "handle" ? "btn-primary" : ""}`} onClick={() => setTab("handle")}>Handle Colors</button>
        </div>
        <button className="btn btn-primary" onClick={startNew}>{Icons.plus} Add Color</button>
      </div>

      {editing && (
        <FormPanel title={editing === "new" ? "New Color" : "Edit Color"} onSave={save} onCancel={() => setEditing(null)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            {tab === "profile" && (
              <div className="form-group">
                <label className="form-label">RAL Code</label>
                <input className="form-input" value={form.ral || ""} onChange={e => setForm({...form, ral: e.target.value})} placeholder="RAL 7016" />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Color</label>
              <input className="form-input" type="color" value={form.hex} onChange={e => setForm({...form, hex: e.target.value})} />
            </div>
          </div>
        </FormPanel>
      )}

      <div className="flex flex-wrap gap-2">
        {list.map(c => (
          <div key={c.id} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            minWidth: "180px",
          }}>
            <div className="color-swatch-lg" style={{ background: c.hex }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: 500 }}>{c.name}</div>
              {c.ral && <div className="text-xs text-muted">{c.ral}</div>}
              <div className="mono text-xs text-dim">{c.hex}</div>
            </div>
            <div className="flex gap-2">
              <button className="btn-icon" onClick={() => startEdit(c)}>{Icons.edit}</button>
              <button className="btn-icon danger" onClick={() => remove(c.id)}>{Icons.trash}</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── SECTION: MUNTINS ────────────────────────────────────────────────────────

function MuntinsSection({ muntins, setMuntins }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startNew = () => {
    setForm({ name: "", width: 15.875, widthLabel: '5/8"', color: "#EEEEE8", colorName: "White" });
    setEditing("new");
  };

  const startEdit = (item) => { setForm({ ...item }); setEditing(item.id); };

  const save = () => {
    if (!form.name) return;
    const updated = editing === "new"
      ? [...muntins, { ...form, id: uid() }]
      : muntins.map(m => m.id === editing ? { ...form } : m);
    setMuntins(updated);
    setEditing(null);
  };

  const remove = (id) => setMuntins(muntins.filter(m => m.id !== id));

  return (
    <>
      <div className="section-bar">
        <h2>Muntin / Grille Types</h2>
        <button className="btn btn-primary" onClick={startNew}>{Icons.plus} Add Muntin</button>
      </div>

      {editing && (
        <FormPanel title={editing === "new" ? "New Muntin" : "Edit Muntin"} onSave={save} onCancel={() => setEditing(null)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Width Label</label>
              <select className="form-input" value={form.widthLabel} onChange={e => setForm({
                ...form,
                widthLabel: e.target.value,
                width: e.target.value === '5/8"' ? 15.875 : 25.4,
              })}>
                <option value='5/8"'>5/8"</option>
                <option value='1"'>1"</option>
                <option value='3/4"'>3/4"</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {form.widthLabel === "custom" && (
              <div className="form-group">
                <label className="form-label">Width (mm)</label>
                <input className="form-input" type="number" value={form.width} onChange={e => setForm({...form, width: parseFloat(e.target.value)||0})} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Color Name</label>
              <input className="form-input" value={form.colorName} onChange={e => setForm({...form, colorName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <input className="form-input" type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} />
            </div>
          </div>
        </FormPanel>
      )}

      <table className="data-table">
        <thead><tr>
          <th>Name</th><th>Width</th><th>Width (mm)</th><th>Color</th><th style={{ textAlign: "right" }}>Actions</th>
        </tr></thead>
        <tbody>
          {muntins.map(m => (
            <tr key={m.id}>
              <td style={{ fontWeight: 500 }}>{m.name}</td>
              <td><span className="tag tag-blue">{m.widthLabel}</span></td>
              <td className="mono">{m.width.toFixed(1)}</td>
              <td className="inline-flex"><div className="color-swatch" style={{ background: m.color }} /> <span className="text-sm">{m.colorName}</span></td>
              <td>
                <div className="cell-actions">
                  <button className="btn-icon" onClick={() => startEdit(m)}>{Icons.edit}</button>
                  <button className="btn-icon danger" onClick={() => remove(m.id)}>{Icons.trash}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ─── SECTION: GLASS / IGU ────────────────────────────────────────────────────

function GlassSection({ glass, setGlass }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const empty = { name: "", type: "double", layers: "4-16-4", gasType: "air", lowE: false, uValue: 2.7, stc: 28, price: 0, desc: "" };

  const startNew = () => { setForm({ ...empty }); setEditing("new"); };
  const startEdit = (item) => { setForm({ ...item }); setEditing(item.id); };
  const save = () => {
    if (!form.name) return;
    const updated = editing === "new" ? [...glass, { ...form, id: uid() }] : glass.map(g => g.id === editing ? { ...form } : g);
    setGlass(updated);
    setEditing(null);
  };
  const remove = (id) => setGlass(glass.filter(g => g.id !== id));

  const uValueColor = (u) => u <= 0.8 ? "var(--green)" : u <= 1.3 ? "#3FB9A0" : u <= 2.0 ? "var(--orange)" : "var(--red)";
  const uBarWidth = (u) => Math.max(5, Math.min(100, (1 - u / 3.5) * 100));

  return (
    <>
      <div className="section-bar">
        <h2>Glass Units (IGU)</h2>
        <button className="btn btn-primary" onClick={startNew}>{Icons.plus} Add Glass Unit</button>
      </div>

      {editing && (
        <FormPanel title={editing === "new" ? "New Glass Unit" : "Edit Glass Unit"} onSave={save} onCancel={() => setEditing(null)}>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="triple">Triple</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Layers (mm)</label>
              <input className="form-input" value={form.layers} onChange={e => setForm({...form, layers: e.target.value})} placeholder="4-16-4" />
            </div>
            <div className="form-group">
              <label className="form-label">Gas Fill</label>
              <select className="form-input" value={form.gasType} onChange={e => setForm({...form, gasType: e.target.value})}>
                <option value="air">Air</option>
                <option value="argon">Argon</option>
                <option value="krypton">Krypton</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Low-E</label>
              <select className="form-input" value={form.lowE ? "yes" : "no"} onChange={e => setForm({...form, lowE: e.target.value === "yes"})}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">U-Value (W/m²K)</label>
              <input className="form-input" type="number" step="0.1" value={form.uValue} onChange={e => setForm({...form, uValue: parseFloat(e.target.value)||0})} />
            </div>
            <div className="form-group">
              <label className="form-label">STC (dB)</label>
              <input className="form-input" type="number" value={form.stc} onChange={e => setForm({...form, stc: parseInt(e.target.value)||0})} />
            </div>
            <div className="form-group">
              <label className="form-label">Price ($/m²)</label>
              <input className="form-input" type="number" step="0.5" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)||0})} />
            </div>
            <div className="form-group full">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
            </div>
          </div>
        </FormPanel>
      )}

      <table className="data-table">
        <thead><tr>
          <th>Name</th><th>Type</th><th>Layers</th><th>Gas</th><th>Low-E</th><th>U-Value</th><th>STC</th><th>Price</th><th style={{ textAlign: "right" }}>Actions</th>
        </tr></thead>
        <tbody>
          {glass.map(g => (
            <tr key={g.id}>
              <td>
                <div style={{ fontWeight: 500 }}>{g.name}</div>
                <div className="text-xs text-muted" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.desc}</div>
              </td>
              <td><span className={`tag ${g.type === "triple" ? "tag-purple" : g.type === "double" ? "tag-blue" : "tag-orange"}`}>{g.type}</span></td>
              <td className="mono">{g.layers}</td>
              <td className="text-sm">{g.gasType}</td>
              <td>{g.lowE ? <span className="tag tag-green">Low-E</span> : <span className="text-muted">—</span>}</td>
              <td>
                <span className="mono" style={{ color: uValueColor(g.uValue) }}>{g.uValue}</span>
                <div className="u-value-bar">
                  <div className="u-value-bar-fill" style={{ width: `${uBarWidth(g.uValue)}%`, background: uValueColor(g.uValue) }} />
                </div>
              </td>
              <td className="mono">{g.stc} dB</td>
              <td className="mono text-accent">${g.price.toFixed(2)}</td>
              <td>
                <div className="cell-actions">
                  <button className="btn-icon" onClick={() => startEdit(g)}>{Icons.edit}</button>
                  <button className="btn-icon danger" onClick={() => remove(g.id)}>{Icons.trash}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ─── SECTION: HARDWARE ───────────────────────────────────────────────────────

function HardwareSection({ hardware, setHardware }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [filterCat, setFilterCat] = useState("all");

  const empty = { category: "handles", name: "", type: "handle", desc: "" };
  const startNew = () => { setForm({ ...empty }); setEditing("new"); };
  const startEdit = (item) => { setForm({ ...item }); setEditing(item.id); };
  const save = () => {
    if (!form.name) return;
    const updated = editing === "new" ? [...hardware, { ...form, id: uid() }] : hardware.map(h => h.id === editing ? { ...form } : h);
    setHardware(updated);
    setEditing(null);
  };
  const remove = (id) => setHardware(hardware.filter(h => h.id !== id));

  const categories = [...new Set(hardware.map(h => h.category))];
  const filtered = filterCat === "all" ? hardware : hardware.filter(h => h.category === filterCat);

  return (
    <>
      <div className="section-bar">
        <div className="flex gap-2 items-center">
          <button className={`btn btn-sm ${filterCat === "all" ? "btn-primary" : ""}`} onClick={() => setFilterCat("all")}>All</button>
          {categories.map(cat => (
            <button key={cat} className={`btn btn-sm ${filterCat === cat ? "btn-primary" : ""}`} onClick={() => setFilterCat(cat)}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={startNew}>{Icons.plus} Add Hardware</button>
      </div>

      {editing && (
        <FormPanel title={editing === "new" ? "New Hardware" : "Edit Hardware"} onSave={save} onCancel={() => setEditing(null)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="handles">Handles</option>
                <option value="hinges">Hinges</option>
                <option value="locks">Locks</option>
                <option value="stays">Stays</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Type/Variant</label>
              <input className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
            </div>
            <div className="form-group full">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
            </div>
          </div>
        </FormPanel>
      )}

      <table className="data-table">
        <thead><tr>
          <th>Category</th><th>Name</th><th>Type</th><th>Description</th><th style={{ textAlign: "right" }}>Actions</th>
        </tr></thead>
        <tbody>
          {filtered.map(h => (
            <tr key={h.id}>
              <td><span className={`tag ${h.category === "hinges" ? "tag-orange" : h.category === "locks" ? "tag-purple" : "tag-blue"}`}>{h.category}</span></td>
              <td style={{ fontWeight: 500 }}>{h.name}</td>
              <td className="mono text-sm">{h.type}</td>
              <td className="text-sm text-dim">{h.desc}</td>
              <td>
                <div className="cell-actions">
                  <button className="btn-icon" onClick={() => startEdit(h)}>{Icons.edit}</button>
                  <button className="btn-icon danger" onClick={() => remove(h.id)}>{Icons.trash}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ─── SECTION: ACCESSORIES ────────────────────────────────────────────────────

function AccessoriesSection({ accessories, setAccessories }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  // Calculator state
  const [calcW, setCalcW] = useState(1500);
  const [calcH, setCalcH] = useState(1400);
  const [calcAcc, setCalcAcc] = useState(null);

  const empty = { name: "", type: "nailing_fin", material: "aluminum", pricePerM: 0, overhang: 50, desc: "" };
  const startNew = () => { setForm({ ...empty }); setEditing("new"); };
  const startEdit = (item) => { setForm({ ...item }); setEditing(item.id); };
  const save = () => {
    if (!form.name) return;
    const updated = editing === "new" ? [...accessories, { ...form, id: uid() }] : accessories.map(a => a.id === editing ? { ...form } : a);
    setAccessories(updated);
    setEditing(null);
  };
  const remove = (id) => setAccessories(accessories.filter(a => a.id !== id));

  const runCalc = (acc) => {
    setCalcAcc(acc);
  };

  const nfAccessories = accessories.filter(a => a.type === "nailing_fin");

  return (
    <>
      <div className="section-bar">
        <h2>Accessories</h2>
        <button className="btn btn-primary" onClick={startNew}>{Icons.plus} Add Accessory</button>
      </div>

      {editing && (
        <FormPanel title={editing === "new" ? "New Accessory" : "Edit Accessory"} onSave={save} onCancel={() => setEditing(null)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="nailing_fin">Nailing Fin</option>
                <option value="sill">Sill Adapter</option>
                <option value="extension">Extension Profile</option>
                <option value="trim">Trim / Casing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Material</label>
              <select className="form-input" value={form.material} onChange={e => setForm({...form, material: e.target.value})}>
                <option value="aluminum">Aluminum</option>
                <option value="pvc">PVC</option>
                <option value="steel">Steel</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price ($/m)</label>
              <input className="form-input" type="number" step="0.1" value={form.pricePerM} onChange={e => setForm({...form, pricePerM: parseFloat(e.target.value)||0})} />
            </div>
            <div className="form-group">
              <label className="form-label">Overhang (mm)</label>
              <input className="form-input" type="number" value={form.overhang} onChange={e => setForm({...form, overhang: parseInt(e.target.value)||0})} />
            </div>
            <div className="form-group full">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} />
            </div>
          </div>
        </FormPanel>
      )}

      <table className="data-table">
        <thead><tr>
          <th>Name</th><th>Type</th><th>Material</th><th>Overhang</th><th>Price/m</th><th style={{ textAlign: "right" }}>Actions</th>
        </tr></thead>
        <tbody>
          {accessories.map(a => (
            <tr key={a.id}>
              <td>
                <div style={{ fontWeight: 500 }}>{a.name}</div>
                <div className="text-xs text-muted">{a.desc}</div>
              </td>
              <td><span className={`tag ${a.type === "nailing_fin" ? "tag-blue" : a.type === "sill" ? "tag-orange" : "tag-purple"}`}>{a.type.replace("_"," ")}</span></td>
              <td className="text-sm">{a.material}</td>
              <td className="mono">{a.overhang > 0 ? `±${a.overhang}mm` : "—"}</td>
              <td className="mono text-accent">${a.pricePerM.toFixed(2)}</td>
              <td>
                <div className="cell-actions">
                  {a.type === "nailing_fin" && <button className="btn-icon" title="Calculator" onClick={() => runCalc(a)}>{Icons.calc}</button>}
                  <button className="btn-icon" onClick={() => startEdit(a)}>{Icons.edit}</button>
                  <button className="btn-icon danger" onClick={() => remove(a.id)}>{Icons.trash}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Nailing Fin Calculator */}
      <div className="calc-box">
        <h4>{Icons.calc} Nailing Fin Calculator</h4>
        <div className="form-grid" style={{ marginBottom: 14, maxWidth: 500 }}>
          <div className="form-group">
            <label className="form-label">Window Width (mm)</label>
            <input className="form-input" type="number" value={calcW} onChange={e => setCalcW(parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Window Height (mm)</label>
            <input className="form-input" type="number" value={calcH} onChange={e => setCalcH(parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label className="form-label">Fin Type</label>
            <select className="form-input" value={calcAcc?.id || ""} onChange={e => setCalcAcc(nfAccessories.find(a => a.id === e.target.value) || null)}>
              <option value="">Select...</option>
              {nfAccessories.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
        </div>
        {calcAcc && (() => {
          const r = calcNailingFin(calcW, calcH, calcAcc.overhang);
          const cost = r.totalM * calcAcc.pricePerM;
          return (
            <div className="calc-result">
              <div className="calc-result-item">
                <div className="label">Top</div>
                <div className="value">{r.top} mm</div>
              </div>
              <div className="calc-result-item">
                <div className="label">Bottom</div>
                <div className="value">{r.bottom} mm</div>
              </div>
              <div className="calc-result-item">
                <div className="label">Left</div>
                <div className="value">{r.left} mm</div>
              </div>
              <div className="calc-result-item">
                <div className="label">Right</div>
                <div className="value">{r.right} mm</div>
              </div>
              <div className="calc-result-item">
                <div className="label">Total Length</div>
                <div className="value">{r.totalMm} mm</div>
              </div>
              <div className="calc-result-item">
                <div className="label">Total Meters</div>
                <div className="value">{r.totalM.toFixed(3)} m</div>
              </div>
              <div className="calc-result-item">
                <div className="label">Cost</div>
                <div className="value" style={{ color: "var(--accent)" }}>${cost.toFixed(2)}</div>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}

// ─── SECTION: SCREENS ────────────────────────────────────────────────────────

function ScreensSection({ screens, setScreens }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const empty = { name: "", type: "fixed", mesh: "fiberglass", frameColor: "white", price: 0 };
  const startNew = () => { setForm({ ...empty }); setEditing("new"); };
  const startEdit = (item) => { setForm({ ...item }); setEditing(item.id); };
  const save = () => {
    if (!form.name) return;
    const updated = editing === "new" ? [...screens, { ...form, id: uid() }] : screens.map(s => s.id === editing ? { ...form } : s);
    setScreens(updated);
    setEditing(null);
  };
  const remove = (id) => setScreens(screens.filter(s => s.id !== id));

  return (
    <>
      <div className="section-bar">
        <h2>Screens / Insect Screens</h2>
        <button className="btn btn-primary" onClick={startNew}>{Icons.plus} Add Screen</button>
      </div>

      {editing && (
        <FormPanel title={editing === "new" ? "New Screen" : "Edit Screen"} onSave={save} onCancel={() => setEditing(null)}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="fixed">Fixed</option>
                <option value="retractable">Retractable</option>
                <option value="sliding">Sliding</option>
                <option value="pleated">Pleated</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Mesh</label>
              <select className="form-input" value={form.mesh} onChange={e => setForm({...form, mesh: e.target.value})}>
                <option value="fiberglass">Fiberglass</option>
                <option value="aluminum">Aluminum</option>
                <option value="stainless">Stainless Steel</option>
                <option value="pet-resistant">Pet Resistant</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Frame Color</label>
              <input className="form-input" value={form.frameColor} onChange={e => setForm({...form, frameColor: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Price ($/m²)</label>
              <input className="form-input" type="number" step="0.5" value={form.price} onChange={e => setForm({...form, price: parseFloat(e.target.value)||0})} />
            </div>
          </div>
        </FormPanel>
      )}

      <table className="data-table">
        <thead><tr>
          <th>Name</th><th>Type</th><th>Mesh</th><th>Frame</th><th>Price</th><th style={{ textAlign: "right" }}>Actions</th>
        </tr></thead>
        <tbody>
          {screens.map(s => (
            <tr key={s.id}>
              <td style={{ fontWeight: 500 }}>{s.name}</td>
              <td><span className={`tag ${s.type === "retractable" ? "tag-purple" : s.type === "sliding" ? "tag-orange" : "tag-blue"}`}>{s.type}</span></td>
              <td className="text-sm">{s.mesh}</td>
              <td className="text-sm">{s.frameColor}</td>
              <td className="mono text-accent">${s.price.toFixed(2)}/m²</td>
              <td>
                <div className="cell-actions">
                  <button className="btn-icon" onClick={() => startEdit(s)}>{Icons.edit}</button>
                  <button className="btn-icon danger" onClick={() => remove(s.id)}>{Icons.trash}</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

// ─── SECTION: USERS ──────────────────────────────────────────────────────────

function UsersSection({ users, setUsers, profiles }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const roleColors = {
    admin: "linear-gradient(135deg, #F85149, #DA3633)",
    manager: "linear-gradient(135deg, #A371F7, #8957E5)",
    dealer: "linear-gradient(135deg, #4A9EFF, #1F6FEB)",
    builder: "linear-gradient(135deg, #3FB950, #2EA043)",
    contractor: "linear-gradient(135deg, #D29922, #BB8009)",
    viewer: "linear-gradient(135deg, #8B949E, #6E7681)",
  };

  const emptyForm = {
    name: "", email: "", phone: "", company: "", address: "",
    role: "builder", active: true, avatar: "",
    permissions: {
      profiles: profiles.map(p => p.id),
      colors: true, muntins: true, glass: true,
      hardware: true, accessories: false, screens: true,
      canCreateOrders: true, canEditPricing: false, canManageUsers: false,
    },
  };

  const startNew = () => { setForm({ ...emptyForm, permissions: { ...emptyForm.permissions, profiles: [...emptyForm.permissions.profiles] } }); setEditing("new"); };

  const startEdit = (u) => {
    setForm(JSON.parse(JSON.stringify(u)));
    setEditing(u.id);
  };

  const save = () => {
    if (!form.name || !form.email) return;
    const avatar = form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    if (editing === "new") {
      setUsers([...users, { ...form, id: uid(), avatar, createdAt: new Date().toISOString().slice(0, 10), lastLogin: "—" }]);
    } else {
      setUsers(users.map(u => u.id === editing ? { ...form, avatar } : u));
    }
    setEditing(null);
    setForm(null);
  };

  const toggleActive = (u) => {
    setUsers(users.map(x => x.id === u.id ? { ...x, active: !x.active } : x));
  };

  const remove = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const togglePerm = (key) => {
    setForm(f => ({
      ...f,
      permissions: { ...f.permissions, [key]: !f.permissions[key] }
    }));
  };

  const toggleProfileAccess = (pid) => {
    setForm(f => {
      const profs = f.permissions.profiles.includes(pid)
        ? f.permissions.profiles.filter(x => x !== pid)
        : [...f.permissions.profiles, pid];
      return { ...f, permissions: { ...f.permissions, profiles: profs } };
    });
  };

  const filtered = users.filter(u => {
    if (filterRole !== "all" && u.role !== filterRole) return false;
    if (filterStatus === "active" && !u.active) return false;
    if (filterStatus === "inactive" && u.active) return false;
    return true;
  });

  const permLabels = {
    colors: "Colors", muntins: "Muntins", glass: "Glass", hardware: "Hardware",
    accessories: "Accessories", screens: "Screens",
  };
  const capabilityLabels = {
    canCreateOrders: "Create Orders", canEditPricing: "Edit Pricing", canManageUsers: "Manage Users",
  };

  return (
    <>
      <div className="section-bar">
        <div className="flex gap-2 items-center">
          <button className={`btn btn-sm ${filterRole === "all" ? "btn-primary" : ""}`} onClick={() => setFilterRole("all")}>All Roles</button>
          {ROLES.map(r => (
            <button key={r.key} className={`btn btn-sm ${filterRole === r.key ? "btn-primary" : ""}`} onClick={() => setFilterRole(r.key)}>
              {r.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={startNew}>{Icons.plus} Add User</button>
      </div>

      <div className="flex gap-2 items-center mb-2">
        <button className={`btn btn-sm ${filterStatus === "all" ? "btn-primary" : ""}`} onClick={() => setFilterStatus("all")}>All</button>
        <button className={`btn btn-sm ${filterStatus === "active" ? "btn-primary" : ""}`} onClick={() => setFilterStatus("active")}>Active</button>
        <button className={`btn btn-sm ${filterStatus === "inactive" ? "btn-primary" : ""}`} onClick={() => setFilterStatus("inactive")}>Inactive</button>
        <span className="text-xs text-muted" style={{ marginLeft: 8 }}>
          {users.filter(u => u.active).length} active / {users.filter(u => !u.active).length} inactive
        </span>
      </div>

      {editing && form && (
        <FormPanel
          title={editing === "new" ? "New User Account" : `Edit: ${form.name}`}
          onSave={save}
          onCancel={() => { setEditing(null); setForm(null); }}
        >
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="john@company.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 (555) 000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">Company</label>
              <input className="form-input" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
            </div>
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="form-label">Address</label>
              <input className="form-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                {ROLES.map(r => <option key={r.key} value={r.key}>{r.label} — {r.desc}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input" value={form.active ? "active" : "inactive"} onChange={e => setForm({...form, active: e.target.value === "active"})}>
                <option value="active">Active</option>
                <option value="inactive">Disabled</option>
              </select>
            </div>
          </div>

          {/* Profile Access */}
          <div className="perm-section">
            <div className="perm-section-title">Profile System Access</div>
            <div className="perm-grid">
              {profiles.map(p => (
                <div
                  key={p.id}
                  className={`perm-toggle ${form.permissions.profiles.includes(p.id) ? "on" : ""}`}
                  onClick={() => toggleProfileAccess(p.id)}
                >
                  <div className="toggle-dot" />
                  <span>{p.name}</span>
                </div>
              ))}
              {profiles.length === 0 && <span className="text-xs text-muted">No profiles created yet</span>}
            </div>
          </div>

          {/* Section Access */}
          <div className="perm-section">
            <div className="perm-section-title">Section Access</div>
            <div className="perm-grid">
              {Object.entries(permLabels).map(([key, label]) => (
                <div
                  key={key}
                  className={`perm-toggle ${form.permissions[key] ? "on" : ""}`}
                  onClick={() => togglePerm(key)}
                >
                  <div className="toggle-dot" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="perm-section">
            <div className="perm-section-title">Capabilities</div>
            <div className="perm-grid">
              {Object.entries(capabilityLabels).map(([key, label]) => (
                <div
                  key={key}
                  className={`perm-toggle ${form.permissions[key] ? "on" : ""}`}
                  onClick={() => togglePerm(key)}
                >
                  <div className="toggle-dot" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </FormPanel>
      )}

      <div className="user-cards-grid">
        {filtered.map(u => {
          const role = ROLES.find(r => r.key === u.role) || ROLES[5];
          const isExpanded = expandedUser === u.id;
          return (
            <div key={u.id} className={`user-card ${!u.active ? "inactive" : ""}`}>
              <div className="user-avatar" style={{ background: roleColors[u.role] || roleColors.viewer }}>
                {u.avatar}
              </div>
              <div className="user-card-body">
                <div className="user-card-name">
                  <span className={`status-dot ${u.active ? "active" : "inactive"}`} />
                  {u.name}
                  <span className={`tag ${role.color}`}>{role.label}</span>
                  {!u.active && <span className="tag tag-dim">Disabled</span>}
                </div>
                <div className="user-card-meta">
                  <span className="meta-item">{Icons.mail} {u.email}</span>
                  {u.phone && <span className="meta-item">{Icons.phone} {u.phone}</span>}
                  {u.company && <span className="meta-item">{u.company}</span>}
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 10 }}>
                    {u.address && <div className="text-xs text-dim mb-2">{u.address}</div>}
                    <div className="user-perms">
                      {Object.entries(permLabels).map(([key, label]) => (
                        <span key={key} className={`perm-chip ${u.permissions?.[key] ? "on" : "off"}`}>{label}</span>
                      ))}
                    </div>
                    <div className="user-perms" style={{ marginTop: 4 }}>
                      {Object.entries(capabilityLabels).map(([key, label]) => (
                        <span key={key} className={`perm-chip ${u.permissions?.[key] ? "on" : "off"}`}>{label}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2 text-xs text-muted">
                      <span>Created: {u.createdAt}</span>
                      <span>Last login: {u.lastLogin}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="user-card-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                  style={{ fontSize: 11 }}
                >
                  {isExpanded ? "Less" : "More"}
                </button>
                <button
                  className={`btn-icon ${u.active ? "" : "danger"}`}
                  title={u.active ? "Disable" : "Enable"}
                  onClick={() => toggleActive(u)}
                >
                  {Icons.power}
                </button>
                <button className="btn-icon" title="Edit" onClick={() => startEdit(u)}>{Icons.edit}</button>
                <button className="btn-icon danger" title="Delete" onClick={() => remove(u.id)}>{Icons.trash}</button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && <div className="empty-state">No users match your filters.</div>}
    </>
  );
}

// ─── BUILDER PLACEHOLDER ─────────────────────────────────────────────────────

function BuilderPlaceholder({ profiles }) {
  return (
    <div className="builder-placeholder">
      <div className="builder-window-icon">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.5">
          <rect x="5" y="5" width="50" height="50" rx="2"/>
          <line x1="30" y1="5" x2="30" y2="55"/>
          <line x1="5" y1="30" x2="55" y2="30"/>
          <path d="M48 12 L48 8" strokeWidth="2.5" opacity="0.8"/>
          <path d="M12 48 L8 48" strokeWidth="2.5" opacity="0.8"/>
        </svg>
      </div>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Window Builder</h2>
        <p className="text-dim" style={{ maxWidth: 400, lineHeight: 1.6 }}>
          Configure windows and doors using the profile systems, glass units, colors, and hardware defined in Settings.
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
        {profiles.map(p => (
          <div key={p.id} style={{
            background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)",
            padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
          }}>
            <span className="tag tag-blue" style={{ fontSize: 10 }}>{p.code}</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted" style={{ marginTop: 12 }}>
        Builder will be connected in the next iteration. All settings data feeds into this module.
      </p>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "profiles", label: "Profile Systems", icon: Icons.profiles },
  { key: "colors", label: "Colors", icon: Icons.colors },
  { key: "muntins", label: "Muntins", icon: Icons.muntins },
  { key: "glass", label: "Glass Units", icon: Icons.glass },
  { key: "hardware", label: "Hardware", icon: Icons.hardware },
  { key: "accessories", label: "Accessories", icon: Icons.accessories },
  { key: "screens", label: "Screens", icon: Icons.screens },
  { key: "users", label: "Users & Access", icon: Icons.users },
];

const SECTION_META = {
  profiles: { title: "Profile Systems", sub: "Frame, sash, mullion, glazing bead dimensions" },
  colors: { title: "Colors", sub: "Profile and handle color palettes" },
  muntins: { title: "Muntins / Grilles", sub: "Bar types, widths, and colors" },
  glass: { title: "Glass Units (IGU)", sub: "Panes, Low-E, gas fill, thermal & acoustic properties, pricing" },
  hardware: { title: "Hardware", sub: "Handles, hinges, locks, furniture types" },
  accessories: { title: "Accessories", sub: "Nailing fins, sill adapters, extensions, with cost calculator" },
  screens: { title: "Screens", sub: "Insect screens: fixed, retractable, sliding" },
  users: { title: "Users & Access", sub: "Accounts, roles, permissions, enable/disable users" },
};

export default function App() {
  const [page, setPage] = useState("settings"); // "settings" | "builder"
  const [section, setSection] = useState("profiles");
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [colors, setColors] = useState(INITIAL_COLORS);
  const [muntins, setMuntins] = useState(INITIAL_MUNTINS);
  const [glass, setGlass] = useState(INITIAL_GLASS);
  const [hardware, setHardware] = useState(INITIAL_HARDWARE);
  const [accessories, setAccessories] = useState(INITIAL_ACCESSORIES);
  const [screens, setScreens] = useState(INITIAL_SCREENS);
  const [users, setUsers] = useState(INITIAL_USERS);

  const counts = {
    profiles: profiles.length,
    colors: colors.profile.length + colors.handle.length,
    muntins: muntins.length,
    glass: glass.length,
    hardware: hardware.length,
    accessories: accessories.length,
    screens: screens.length,
    users: users.length,
  };

  const meta = SECTION_META[section];

  return (
    <>
      <style>{CSS}</style>
      <div className="app-shell">
        {/* ═══ TOP BAR ═══ */}
        <div className="topbar">
          <div className="topbar-logo">
            <div className="logo-mark">D</div>
            <span className="logo-text">DECA</span>
          </div>
          <div className="topbar-nav">
            <div
              className={`topbar-tab ${page === "builder" ? "active" : ""}`}
              onClick={() => setPage("builder")}
            >
              <span className="tab-icon">{Icons.builder}</span>
              Window Builder
            </div>
            <div
              className={`topbar-tab ${page === "settings" ? "active" : ""}`}
              onClick={() => setPage("settings")}
            >
              <span className="tab-icon">{Icons.settings}</span>
              Settings
            </div>
          </div>
          <div className="topbar-right">
            <span className="text-xs text-muted">{users.find(u => u.role === "admin")?.name || "Admin"}</span>
            <div className="topbar-avatar">{users.find(u => u.role === "admin")?.avatar || "A"}</div>
          </div>
        </div>

        {/* ═══ BODY ═══ */}
        {page === "settings" ? (
          <div className="app-body">
            {/* Sidebar */}
            <div className="sidebar">
              <div className="sidebar-section-title">Configuration</div>
              <div className="sidebar-nav">
                {NAV_ITEMS.filter(i => i.key !== "users").map(item => (
                  <div
                    key={item.key}
                    className={`nav-item ${section === item.key ? "active" : ""}`}
                    onClick={() => setSection(item.key)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                    <span className="badge">{counts[item.key]}</span>
                  </div>
                ))}
              </div>
              <div className="sidebar-section-title">Administration</div>
              <div className="sidebar-nav">
                <div
                  className={`nav-item ${section === "users" ? "active" : ""}`}
                  onClick={() => setSection("users")}
                >
                  <span className="nav-icon">{Icons.users}</span>
                  Users & Access
                  <span className="badge">{counts.users}</span>
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="main">
              <div className="main-header">
                <div>
                  <h1>{meta.title}</h1>
                  <div className="subtitle">{meta.sub}</div>
                </div>
                <div className="text-xs text-muted">
                  {section === "users"
                    ? `${users.filter(u => u.active).length} active / ${users.length} total`
                    : `Total items: ${Object.values(counts).reduce((a,b) => a+b, 0)}`
                  }
                </div>
              </div>
              <div className="content">
                {section === "profiles" && <ProfilesSection profiles={profiles} setProfiles={setProfiles} />}
                {section === "colors" && <ColorsSection colors={colors} setColors={setColors} />}
                {section === "muntins" && <MuntinsSection muntins={muntins} setMuntins={setMuntins} />}
                {section === "glass" && <GlassSection glass={glass} setGlass={setGlass} />}
                {section === "hardware" && <HardwareSection hardware={hardware} setHardware={setHardware} />}
                {section === "accessories" && <AccessoriesSection accessories={accessories} setAccessories={setAccessories} />}
                {section === "screens" && <ScreensSection screens={screens} setScreens={setScreens} />}
                {section === "users" && <UsersSection users={users} setUsers={setUsers} profiles={profiles} />}
              </div>
            </div>
          </div>
        ) : (
          <div className="app-body" style={{ flex: 1 }}>
            <BuilderPlaceholder profiles={profiles} />
          </div>
        )}
      </div>
    </>
  );
}

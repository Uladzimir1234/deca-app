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

const INITIAL_CONSTRAINTS = {
  // Flat values used by validator
  minW: 300, minH: 300, maxW: 5500, maxH: 3000,
  maxSashW: 1350, maxSashH: 2200,
  maxGlassW: 2500, maxGlassH: 3000,
  minMullionFrameW: 500, maxTotalW: 5500,
  quoteDescRequired: 1,
  // Grouped definitions for UI
  _groups: [
    { id: 'g1', name: 'Frame Constraints', icon: '⬜', expanded: true, items: [
      { id: 'c01', key: 'minW', label: 'Min Frame Width', value: 300, unit: 'mm', desc: 'Minimum width of entire frame' },
      { id: 'c02', key: 'minH', label: 'Min Frame Height', value: 300, unit: 'mm', desc: 'Minimum height of entire frame' },
      { id: 'c03', key: 'maxW', label: 'Max Frame Width', value: 5500, unit: 'mm', desc: 'Maximum width of entire frame' },
      { id: 'c04', key: 'maxH', label: 'Max Frame Height', value: 3000, unit: 'mm', desc: 'Maximum height of entire frame' },
      { id: 'c05', key: 'maxTotalW', label: 'Max Total Length', value: 5500, unit: 'mm', desc: 'Maximum total construction length' },
    ]},
    { id: 'g2', name: 'Sash Limits', icon: '🪟', expanded: true, items: [
      { id: 'c06', key: 'maxSashW', label: 'Max Sash Width', value: 1350, unit: 'mm', desc: 'Max width of single operable sash' },
      { id: 'c07', key: 'maxSashH', label: 'Max Sash Height', value: 2200, unit: 'mm', desc: 'Max height of single sash' },
    ]},
    { id: 'g3', name: 'Glazing Limits', icon: '💎', expanded: true, items: [
      { id: 'c08', key: 'maxGlassW', label: 'Max Glass Width', value: 2500, unit: 'mm', desc: 'Max width of single glass unit' },
      { id: 'c09', key: 'maxGlassH', label: 'Max Glass Height', value: 3000, unit: 'mm', desc: 'Max height of single glass unit' },
    ]},
    { id: 'g4', name: 'Mullion Rules', icon: '⫼', expanded: true, items: [
      { id: 'c10', key: 'minMullionFrameW', label: 'Min Frame for Mullion', value: 500, unit: 'mm', desc: 'Min frame width to allow mullion' },
    ]},
    { id: 'g5', name: 'Workflow Rules', icon: '📋', expanded: true, items: [
      { id: 'c11', key: 'quoteDescRequired', label: 'Quote Description Required', value: 1, unit: 'bool', desc: 'Require description before saving a quote (1=yes, 0=no)' },
    ]},
  ],
};

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

const INITIAL_CUSTOMERS = [
  { id: 'cust1', firstName: 'John', lastName: 'Smith', email: 'john@smithhomes.com', phone: '+1 (555) 100-2000', email2: '', address: '45 Maple Dr, Springfield, MA', type: 'residential', notes: '',
    projects: [
      { id: 'proj1', name: 'Kitchen Renovation', address: '45 Maple Dr, Springfield, MA', status: 'active', createdAt: '2026-02-10', constructions: [],
        quotes: [
          { id: 'q1', name: 'Quote v1 — 8 windows', status: 'sent', amount: 12400, date: '2026-02-12', invoices: [] },
          { id: 'q2', name: 'Quote v2 — revised', status: 'approved', amount: 11200, date: '2026-02-18', invoices: [{ id: 'inv1', number: 'INV-001', amount: 5600, status: 'paid', date: '2026-02-25' }] },
        ]},
      { id: 'proj2', name: 'Master Bedroom Addition', address: '45 Maple Dr, Springfield, MA', status: 'draft', createdAt: '2026-03-01', constructions: [], quotes: [] },
    ]},
  { id: 'cust2', firstName: 'Maria', lastName: 'Garcia', email: 'maria@garciabuilders.com', phone: '+1 (555) 200-3000', email2: 'office@garciabuilders.com', address: '120 Oak Ave, Boston, MA', type: 'contractor', notes: 'Preferred contractor, bulk pricing',
    projects: [
      { id: 'proj3', name: 'Elm Street Condos', address: '88 Elm St, Boston, MA', status: 'active', createdAt: '2026-01-15', constructions: [],
        quotes: [
          { id: 'q3', name: 'Unit A — 12 windows', status: 'approved', amount: 18600, date: '2026-01-20', invoices: [{ id: 'inv2', number: 'INV-002', amount: 18600, status: 'paid', date: '2026-02-01' }] },
          { id: 'q4', name: 'Unit B — 10 windows', status: 'draft', amount: 15200, date: '2026-03-05', invoices: [] },
        ]},
    ]},
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
  collapseL: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M15 18l-6-6 6-6"/>
    </svg>
  ),
  collapseR: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M9 18l6-6-6-6"/>
    </svg>
  ),
  project: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  configure: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="12" y1="3" x2="12" y2="21"/><path d="M20 9 L20 6" strokeWidth="2.5" opacity="0.7"/>
    </svg>
  ),
  customer: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  quote: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="7" x2="15" y2="7"/>
      <line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="12" y2="15"/>
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
  --hover-bg: rgba(255,255,255,0.04);
  --subtle-bg: rgba(255,255,255,0.06);
  --swatch-border: rgba(255,255,255,0.1);
  --divider: rgba(45,51,59,0.5);
  --divider-light: rgba(45,51,59,0.25);
}

[data-theme="anthropic"] {
  --bg: #FAF9F7;
  --bg-raised: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-input: #F5F3EF;
  --border: #E5E0D8;
  --border-focus: #C4703F;
  --text: #29261E;
  --text-dim: #6B6558;
  --text-muted: #9B9487;
  --accent: #C4703F;
  --accent-dim: #FEF0E5;
  --green: #2E7D57;
  --green-dim: #E8F5EE;
  --red: #C13A31;
  --red-dim: #FDECEB;
  --orange: #B8860B;
  --orange-dim: #FDF5E6;
  --purple: #7C5FC2;
  --shadow: 0 1px 4px rgba(0,0,0,0.08);
  --hover-bg: rgba(0,0,0,0.03);
  --subtle-bg: rgba(0,0,0,0.04);
  --swatch-border: rgba(0,0,0,0.15);
  --divider: rgba(0,0,0,0.1);
  --divider-light: rgba(0,0,0,0.06);
}

[data-theme="light"] {
  --bg: #F0F2F5;
  --bg-raised: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-input: #F5F7FA;
  --border: #D0D7DE;
  --border-focus: #0969DA;
  --text: #1F2328;
  --text-dim: #656D76;
  --text-muted: #8C959F;
  --accent: #0969DA;
  --accent-dim: #DDF4FF;
  --green: #1A7F37;
  --green-dim: #DAFBE1;
  --red: #CF222E;
  --red-dim: #FFEBE9;
  --orange: #BF8700;
  --orange-dim: #FFF8C5;
  --purple: #8250DF;
  --shadow: 0 1px 4px rgba(0,0,0,0.06);
  --hover-bg: rgba(0,0,0,0.03);
  --subtle-bg: rgba(0,0,0,0.05);
  --swatch-border: rgba(0,0,0,0.18);
  --divider: rgba(0,0,0,0.12);
  --divider-light: rgba(0,0,0,0.06);
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
  background: var(--bg);
  color: var(--text);
}

.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  background: var(--bg);
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
  overflow-x: hidden;
  transition: width 0.2s ease, min-width 0.2s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 56px;
  min-width: 56px;
}

.sidebar-toggle {
  position: absolute;
  top: 10px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.15s;
  padding: 0;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  color: var(--text);
  background: var(--bg-raised);
  border-color: var(--text-muted);
}

.sidebar.collapsed .sidebar-toggle {
  right: 50%;
  transform: translateX(50%);
  top: 12px;
}

.sidebar.collapsed .sidebar-section-title {
  font-size: 0;
  padding: 12px 0 4px;
  text-align: center;
}

.sidebar.collapsed .sidebar-section-title::after {
  content: '';
  display: block;
  width: 20px;
  height: 1px;
  background: var(--border);
  margin: 0 auto;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 10px 0;
  gap: 0;
}

.sidebar.collapsed .nav-item .nav-icon {
  width: 24px;
  height: 24px;
}

.sidebar-label,
.sidebar.collapsed .badge {
  transition: opacity 0.15s;
}

.sidebar.collapsed .sidebar-label,
.sidebar.collapsed .badge {
  opacity: 0;
  width: 0;
  overflow: hidden;
  white-space: nowrap;
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
  padding-top: 42px;
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
  background: var(--hover-bg);
}

.nav-item.active {
  color: var(--text);
  background: var(--accent-dim);
  border-color: color-mix(in srgb, var(--accent) 15%, transparent);
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
  background: var(--subtle-bg);
  padding: 1px 6px;
  border-radius: 10px;
}

/* ─── MAIN CONTENT ─── */
.main {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: var(--bg);
}

.main-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: color-mix(in srgb, var(--bg) 85%, transparent);
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
.btn-primary:hover { background: color-mix(in srgb, var(--accent) 85%, #000); }

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
.btn-icon:hover { color: var(--text); background: var(--subtle-bg); }
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
  background: var(--hover-bg);
}

.data-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--divider);
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
  border: 2px solid var(--swatch-border);
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.color-swatch-lg {
  width: 32px; height: 32px;
  border-radius: 6px;
  border: 2px solid var(--swatch-border);
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
.tag-purple { background: color-mix(in srgb, var(--purple) 15%, transparent); color: var(--purple); }

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
  border-bottom: 1px solid var(--divider);
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
  border: 1px solid var(--divider);
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
  border: 1px solid var(--divider);
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
  background: linear-gradient(135deg, var(--accent), var(--purple));
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

.topbar-tab:hover { color: var(--text); background: var(--hover-bg); }

.topbar-tab.active {
  color: var(--text);
  background: var(--accent-dim);
  border-color: color-mix(in srgb, var(--accent) 20%, transparent);
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
  background: linear-gradient(135deg, var(--accent), var(--purple));
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
  cursor: pointer;
}

.tag-red { background: var(--red-dim); color: var(--red); }
.tag-dim { background: var(--subtle-bg); color: var(--text-muted); }

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
.perm-chip.on { background: var(--green-dim); color: var(--green); border-color: var(--green); }
.perm-chip.off { background: var(--hover-bg); color: var(--text-muted); border-color: var(--divider); text-decoration: line-through; }

.status-dot {
  width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0;
}
.status-dot.active { background: var(--green); box-shadow: 0 0 6px var(--green); }
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
  border: 1px solid var(--divider);
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

// ─── CONSTRAINTS SECTION ─────────────────────────────────────────────────────

function ConstraintsSection({ constraints, setConstraints, onDirtyChange }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(constraints)));
  const [collapsed, setCollapsed] = useState({});
  const [addingTo, setAddingTo] = useState(null); // group id
  const [addingGroup, setAddingGroup] = useState(false);
  const [newItem, setNewItem] = useState({ label: '', value: 0, unit: 'mm', desc: '' });
  const [newGroup, setNewGroup] = useState({ name: '', icon: '📐' });

  const isDirty = JSON.stringify(draft) !== JSON.stringify(constraints);
  useEffect(() => { if (onDirtyChange) onDirtyChange(isDirty); }, [isDirty, onDirtyChange]);

  const groups = draft._groups || [];

  const setItemVal = (gid, iid, val) => {
    const v = parseInt(val);
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const g = next._groups.find(x => x.id === gid);
      if (g) { const it = g.items.find(x => x.id === iid); if (it) { it.value = isNaN(v) ? 0 : v; if (it.key) next[it.key] = it.value; } }
      return next;
    });
  };
  const setItemField = (gid, iid, field, val) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const g = next._groups.find(x => x.id === gid);
      if (g) { const it = g.items.find(x => x.id === iid); if (it) it[field] = val; }
      return next;
    });
  };
  const deleteItem = (gid, iid) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const g = next._groups.find(x => x.id === gid);
      if (g) { const it = g.items.find(x => x.id === iid); if (it?.key) delete next[it.key]; g.items = g.items.filter(x => x.id !== iid); }
      return next;
    });
  };
  const addItem = (gid) => {
    if (!newItem.label.trim()) return;
    const key = newItem.label.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const g = next._groups.find(x => x.id === gid);
      if (g) { const id = 'c' + Date.now(); g.items.push({ id, key, label: newItem.label.trim(), value: parseInt(newItem.value) || 0, unit: newItem.unit, desc: newItem.desc }); next[key] = parseInt(newItem.value) || 0; }
      return next;
    });
    setNewItem({ label: '', value: 0, unit: 'mm', desc: '' });
    setAddingTo(null);
  };
  const addGroup = () => {
    if (!newGroup.name.trim()) return;
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next._groups.push({ id: 'g' + Date.now(), name: newGroup.name.trim(), icon: newGroup.icon || '📐', expanded: true, items: [] });
      return next;
    });
    setNewGroup({ name: '', icon: '📐' });
    setAddingGroup(false);
  };
  const deleteGroup = (gid) => {
    if (!confirm('Delete this entire category and all its constraints?')) return;
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const g = next._groups.find(x => x.id === gid);
      if (g) g.items.forEach(it => { if (it.key) delete next[it.key]; });
      next._groups = next._groups.filter(x => x.id !== gid);
      return next;
    });
  };

  const save = () => { setConstraints(draft); };
  const discard = () => { setDraft(JSON.parse(JSON.stringify(constraints))); };
  const toggle = (gid) => setCollapsed(prev => ({ ...prev, [gid]: !prev[gid] }));

  return (
    <>
      {/* Sticky save bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 10, padding: '10px 0', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg)' }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, flex: 1 }}>Constraints</h1>
        {isDirty && <span style={{ fontSize: 11, color: 'var(--orange, #D29922)', fontWeight: 500, padding: '3px 10px', background: 'var(--orange-dim)', borderRadius: 4 }}>Unsaved changes</span>}
        <button onClick={() => setAddingGroup(true)} style={{ fontSize: 12, padding: '6px 14px', border: '1px solid var(--accent)', borderRadius: 6, background: 'var(--accent-dim)', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'inherit' }}>+ Category</button>
        <button onClick={discard} disabled={!isDirty} style={{ fontSize: 12, padding: '6px 16px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: isDirty ? 'var(--text)' : 'var(--text-muted)', cursor: isDirty ? 'pointer' : 'default', fontFamily: 'inherit', opacity: isDirty ? 1 : 0.4 }}>Discard</button>
        <button onClick={save} disabled={!isDirty} style={{ fontSize: 12, padding: '6px 20px', border: `1px solid ${isDirty ? 'var(--green, #3FB950)' : 'var(--border)'}`, borderRadius: 6, background: isDirty ? 'var(--green-dim)' : 'transparent', color: isDirty ? 'var(--green, #3FB950)' : 'var(--text-muted)', cursor: isDirty ? 'pointer' : 'default', fontFamily: 'inherit', fontWeight: 600, opacity: isDirty ? 1 : 0.4 }}>Save Constraints</button>
      </div>

      {/* Add category form */}
      {addingGroup && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 14, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--accent)', borderRadius: 6 }}>
          <div className="form-group" style={{ flex: 1 }}><label className="form-label">Category Name</label><input className="form-input" value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="e.g. Weight Limits" /></div>
          <div className="form-group" style={{ width: 60 }}><label className="form-label">Icon</label><input className="form-input" value={newGroup.icon} onChange={e => setNewGroup({ ...newGroup, icon: e.target.value })} style={{ textAlign: 'center' }} /></div>
          <button className="btn btn-primary btn-sm" onClick={addGroup}>Add</button>
          <button className="btn btn-sm" onClick={() => setAddingGroup(false)}>Cancel</button>
        </div>
      )}

      {/* Groups */}
      {groups.map(g => {
        const isOpen = !collapsed[g.id];
        const changedCount = g.items.filter(it => {
          const orig = (constraints._groups || []).find(og => og.id === g.id);
          if (!orig) return true;
          const origItem = orig.items.find(oi => oi.id === it.id);
          return !origItem || origItem.value !== it.value || origItem.label !== it.label;
        }).length;

        return (
          <div key={g.id} style={{ marginBottom: 10, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            {/* Group header — collapsible */}
            <div onClick={() => toggle(g.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-raised)', cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ fontSize: 14 }}>{g.icon || '📐'}</span>
              <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{g.name}</span>
              <span className="text-xs text-muted">{g.items.length} rules</span>
              {changedCount > 0 && <span style={{ fontSize: 10, color: 'var(--orange)', fontWeight: 500, padding: '1px 6px', background: 'var(--orange-dim)', borderRadius: 3 }}>{changedCount} changed</span>}
              <span style={{ fontSize: 11, color: 'var(--text-muted)', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▶</span>
            </div>

            {/* Expanded content */}
            {isOpen && (
              <div style={{ padding: '8px 14px 12px' }}>
                {g.items.length === 0 && <div className="text-xs text-muted" style={{ padding: '8px 0' }}>No constraints in this category yet.</div>}
                {g.items.map(it => {
                  const origG = (constraints._groups || []).find(og => og.id === g.id);
                  const origIt = origG?.items.find(oi => oi.id === it.id);
                  const changed = !origIt || origIt.value !== it.value || origIt.label !== it.label;
                  return (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--divider-light)' }}>
                      <input className="form-input" type="number" min={0} step={10}
                        value={it.value} onChange={e => setItemVal(g.id, it.id, e.target.value)}
                        style={{ fontFamily: 'var(--mono)', fontWeight: 600, width: 80, fontSize: 13, borderColor: changed ? 'var(--orange)' : undefined }} />
                      <span className="text-xs text-muted" style={{ width: 24 }}>{it.unit}</span>
                      <input className="form-input" value={it.label} onChange={e => setItemField(g.id, it.id, 'label', e.target.value)}
                        style={{ flex: 1, fontSize: 12, minWidth: 120 }} />
                      <span className="text-xs text-muted" style={{ flex: 2, minWidth: 100 }}>{it.desc}</span>
                      <span className="text-xs mono text-dim" style={{ width: 50, textAlign: 'right' }}>{it.unit === 'mm' ? ((it.value || 0) / 25.4).toFixed(1) + '"' : it.unit === 'bool' ? (it.value ? '✓ yes' : '✗ no') : ''}</span>
                      {changed && <span style={{ fontSize: 9, color: 'var(--orange)', fontWeight: 500, width: 42 }}>changed</span>}
                      <button onClick={() => deleteItem(g.id, it.id)} title="Remove" style={{ fontSize: 13, width: 24, height: 24, border: '1px solid transparent', borderRadius: 4, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  );
                })}

                {/* Add constraint to this group */}
                {addingTo === g.id ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', marginTop: 8, padding: '8px 0' }}>
                    <div className="form-group" style={{ width: 140 }}><label className="form-label">Name</label><input className="form-input" value={newItem.label} onChange={e => setNewItem({ ...newItem, label: e.target.value })} placeholder="Max Weight" style={{ fontSize: 11 }} /></div>
                    <div className="form-group" style={{ width: 70 }}><label className="form-label">Value</label><input className="form-input" type="number" value={newItem.value} onChange={e => setNewItem({ ...newItem, value: e.target.value })} style={{ fontSize: 11 }} /></div>
                    <div className="form-group" style={{ width: 55 }}><label className="form-label">Unit</label>
                      <select className="form-input" value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} style={{ fontSize: 11 }}>
                        <option value="mm">mm</option><option value="kg">kg</option><option value="m²">m²</option><option value="pcs">pcs</option><option value="°">°</option><option value="bool">bool</option>
                      </select></div>
                    <div className="form-group" style={{ flex: 1 }}><label className="form-label">Description</label><input className="form-input" value={newItem.desc} onChange={e => setNewItem({ ...newItem, desc: e.target.value })} placeholder="Short description" style={{ fontSize: 11 }} /></div>
                    <button className="btn btn-primary btn-sm" onClick={() => addItem(g.id)}>Add</button>
                    <button className="btn btn-sm" onClick={() => setAddingTo(null)}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => { setAddingTo(g.id); setNewItem({ label: '', value: 0, unit: 'mm', desc: '' }); }}
                      style={{ fontSize: 11, padding: '4px 12px', border: '1px dashed var(--border)', borderRadius: 5, background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }}>+ Add Constraint</button>
                    <span style={{ flex: 1 }}></span>
                    <button onClick={() => deleteGroup(g.id)}
                      style={{ fontSize: 10, padding: '3px 8px', border: '1px solid transparent', borderRadius: 4, background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>Delete Category</button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div style={{ padding: '12px 16px', borderRadius: 6, background: 'var(--accent-dim)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, marginTop: 14 }}>
        These constraints are enforced in the Configurator and Project Manager. Violations are highlighted with warnings. Add custom constraints per category or create new categories for project-specific rules.
      </div>
    </>
  );
}

// ─── CUSTOMERS PAGE ─────────────────────────────────────────────────────────

function CustomersPage({ customers, setCustomers, onOpenProject, onOpenQuote }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [expandedCust, setExpandedCust] = useState(null);
  const [expandedProj, setExpandedProj] = useState(null);
  const [expandedQuote, setExpandedQuote] = useState(null);
  const [addingProject, setAddingProject] = useState(null);
  const [projForm, setProjForm] = useState({ name: '', address: '' });
  const [addingQuote, setAddingQuote] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ name: '', amount: 0 });
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});

  const emptyForm = { firstName: '', lastName: '', email: '', phone: '', email2: '', address: '', type: 'residential', notes: '' };

  const validate = (f) => {
    const e = {};
    if (!f.firstName.trim()) e.firstName = true;
    if (!f.lastName.trim()) e.lastName = true;
    if (!f.email.trim() || !f.email.includes('@')) e.email = true;
    if (!f.phone.trim()) e.phone = true;
    return e;
  };

  const startNew = () => { setForm({ ...emptyForm }); setEditing('new'); setErrors({}); };
  const startEdit = (c) => { setForm({ firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, email2: c.email2 || '', address: c.address || '', type: c.type || 'residential', notes: c.notes || '' }); setEditing(c.id); setErrors({}); };

  const save = () => {
    const e = validate(form);
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (editing === 'new') {
      setCustomers(prev => [...prev, { ...form, id: uid(), projects: [] }]);
    } else {
      setCustomers(prev => prev.map(c => c.id === editing ? { ...c, ...form } : c));
    }
    setEditing(null); setForm(null); setErrors({});
  };

  const remove = (id) => setCustomers(prev => prev.filter(c => c.id !== id));

  const addProject = (custId) => {
    if (!projForm.name.trim()) return;
    setCustomers(prev => prev.map(c => c.id === custId ? {
      ...c, projects: [...c.projects, { id: uid(), name: projForm.name, address: projForm.address, status: 'draft', createdAt: new Date().toISOString().slice(0, 10), constructions: [], quotes: [] }]
    } : c));
    setAddingProject(null); setProjForm({ name: '', address: '' });
  };
  const removeProject = (custId, projId) => setCustomers(prev => prev.map(c => c.id === custId ? { ...c, projects: c.projects.filter(p => p.id !== projId) } : c));

  const addQuote = (custId, projId) => {
    if (!quoteForm.name.trim()) return;
    setCustomers(prev => prev.map(c => c.id === custId ? {
      ...c, projects: c.projects.map(p => p.id === projId ? {
        ...p, quotes: [...p.quotes, { id: uid(), name: quoteForm.name, status: 'draft', amount: parseFloat(quoteForm.amount) || 0, date: new Date().toISOString().slice(0, 10), invoices: [], items: [] }]
      } : p)
    } : c));
    setAddingQuote(null); setQuoteForm({ name: '', amount: 0 });
  };
  const removeQuote = (custId, projId, qId) => setCustomers(prev => prev.map(c => c.id === custId ? {
    ...c, projects: c.projects.map(p => p.id === projId ? { ...p, quotes: p.quotes.filter(q => q.id !== qId) } : p)
  } : c));

  const addInvoice = (custId, projId, qId) => {
    const invNum = 'INV-' + String(Math.floor(Math.random() * 9000) + 1000);
    setCustomers(prev => prev.map(c => c.id === custId ? {
      ...c, projects: c.projects.map(p => p.id === projId ? {
        ...p, quotes: p.quotes.map(q => q.id === qId ? {
          ...q, invoices: [...(q.invoices||[]), { id: uid(), number: invNum, amount: q.amount, status: 'pending', date: new Date().toISOString().slice(0, 10) }]
        } : q)
      } : p)
    } : c));
  };

  const typeColors = { residential: 'tag-blue', contractor: 'tag-orange', builder: 'tag-green', commercial: 'tag-purple' };
  const statusColors = { draft: 'tag-dim', sent: 'tag-blue', approved: 'tag-green', rejected: 'tag-red', active: 'tag-green', completed: 'tag-purple' };
  const invStatusColors = { pending: 'tag-orange', paid: 'tag-green', overdue: 'tag-red' };

  const filtered = customers.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (search) {
      const s2 = search.toLowerCase();
      return (c.firstName + ' ' + c.lastName).toLowerCase().includes(s2) || c.email.toLowerCase().includes(s2) || (c.phone||'').includes(s2);
    }
    return true;
  });

  const totalProjects = customers.reduce((a, c) => a + (c.projects||[]).length, 0);
  const totalQuotes = customers.reduce((a, c) => a + (c.projects||[]).reduce((b, p) => b + (p.quotes||[]).length, 0), 0);

  const reqField = (label, key, type) => (
    <div className="form-group">
      <label className="form-label">{label} <span style={{ color: 'var(--red)' }}>*</span></label>
      <input className="form-input" type={type || 'text'} style={errors[key] ? { borderColor: 'var(--red)' } : {}}
        value={form[key]} onChange={e => { setForm({ ...form, [key]: e.target.value }); if (errors[key]) setErrors({ ...errors, [key]: false }); }} placeholder={label} />
      {errors[key] && <span style={{ fontSize: 10, color: 'var(--red)' }}>Required</span>}
    </div>
  );

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '20px 28px 60px', background: 'var(--bg)' }}>
      <div className="section-bar">
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600 }}>Customers</h1>
          <div className="text-xs text-muted" style={{ marginTop: 2 }}>{customers.length} customers · {totalProjects} projects · {totalQuotes} quotes</div>
        </div>
        <button className="btn btn-primary" onClick={startNew}>{Icons.plus} New Customer</button>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, fontSize: 12 }} />
        {['all','residential','contractor','builder','commercial'].map(t2 => (
          <button key={t2} className={`btn btn-sm ${filterType === t2 ? 'btn-primary' : ''}`} onClick={() => setFilterType(t2)}>{t2 === 'all' ? 'All' : t2.charAt(0).toUpperCase()+t2.slice(1)}</button>
        ))}
      </div>
      {editing && form && (
        <FormPanel title={editing === 'new' ? 'New Customer' : `Edit: ${form.firstName} ${form.lastName}`} onSave={save} onCancel={() => { setEditing(null); setForm(null); setErrors({}); }}>
          <div className="form-grid">
            {reqField('First Name', 'firstName')}
            {reqField('Last Name', 'lastName')}
            {reqField('Email', 'email', 'email')}
            {reqField('Phone', 'phone', 'tel')}
            <div className="form-group"><label className="form-label">Email 2</label><input className="form-input" value={form.email2} onChange={e => setForm({ ...form, email2: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Type</label><select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="residential">Residential</option><option value="contractor">Contractor</option><option value="builder">Builder</option><option value="commercial">Commercial</option></select></div>
            <div className="form-group full"><label className="form-label">Address</label><input className="form-input" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="form-group full"><label className="form-label">Notes</label><textarea className="form-input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
        </FormPanel>
      )}
      {filtered.length === 0 && !editing && <div className="empty-state">No customers found.</div>}
      {filtered.map(c => {
        const isExp = expandedCust === c.id;
        const totalAmt = (c.projects||[]).reduce((a, p) => a + (p.quotes||[]).reduce((b, q) => b + (q.amount||0), 0), 0);
        const initials = ((c.firstName||'')[0] || '') + ((c.lastName||'')[0] || '');
        const qCount = (c.projects||[]).reduce((a2, p2) => a2 + (p2.quotes?.length || 0), 0);
        return (
          <div key={c.id} className="profile-card" style={{ marginBottom: 12 }}>
            <div className="profile-card-header" onClick={() => setExpandedCust(isExp ? null : c.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{initials}</div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {c.firstName} {c.lastName}
                    <span className={`tag ${typeColors[c.type] || 'tag-blue'}`}>{c.type}</span>
                  </h3>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', display: 'flex', gap: 12, marginTop: 2 }}>
                    <span>{c.email}</span><span>{c.phone}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{(c.projects||[]).length} projects · {qCount} quotes · ${totalAmt.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm" onClick={() => { if (onOpenProject && (c.projects||[]).length) onOpenProject(c.id, c.projects[0].id); }}>Open Builder</button>
                <button className="btn-icon" onClick={() => startEdit(c)}>{Icons.edit}</button>
                <button className="btn-icon danger" onClick={() => remove(c.id)}>{Icons.trash}</button>
              </div>
            </div>
            {isExp && (
              <div className="profile-card-body" style={{ padding: '14px 18px' }}>
                {c.email2 && <div className="text-xs text-dim" style={{ marginBottom: 4 }}>Email 2: {c.email2}</div>}
                {c.address && <div className="text-xs text-dim" style={{ marginBottom: 4 }}>Address: {c.address}</div>}
                {c.notes && <div className="text-xs text-muted" style={{ marginBottom: 8, fontStyle: 'italic' }}>{c.notes}</div>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div className="profile-section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Projects ({(c.projects||[]).length})</div>
                  <button className="btn btn-sm" onClick={() => { setAddingProject(addingProject === c.id ? null : c.id); setProjForm({ name: '', address: '' }); }}>{Icons.plus} Add Project</button>
                </div>
                {addingProject === c.id && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, minWidth: 140 }}><label className="form-label">Project Name</label><input className="form-input" value={projForm.name} onChange={e => setProjForm({ ...projForm, name: e.target.value })} style={{ fontSize: 12 }} /></div>
                    <div className="form-group" style={{ flex: 2, minWidth: 200 }}><label className="form-label">Address</label><input className="form-input" value={projForm.address} onChange={e => setProjForm({ ...projForm, address: e.target.value })} style={{ fontSize: 12 }} /></div>
                    <button className="btn btn-primary btn-sm" onClick={() => addProject(c.id)}>Add</button>
                    <button className="btn btn-sm" onClick={() => setAddingProject(null)}>Cancel</button>
                  </div>
                )}
                {(c.projects||[]).length === 0 && <div className="text-xs text-muted" style={{ padding: '8px 0' }}>No projects yet.</div>}
                {(c.projects||[]).map(proj => {
                  const isProjExp = expandedProj === proj.id;
                  const projTotal = (proj.quotes||[]).reduce((a2, q) => a2 + (q.amount||0), 0);
                  return (
                    <div key={proj.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', marginBottom: 8, background: 'var(--bg-input)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer' }} onClick={() => setExpandedProj(isProjExp ? null : proj.id)}>
                        <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{proj.name}</span>
                        <span className={`tag ${statusColors[proj.status] || 'tag-dim'}`}>{proj.status}</span>
                        <span className="mono text-xs text-accent">${projTotal.toLocaleString()}</span>
                        <span className="text-xs text-muted">{(proj.quotes||[]).length} quotes</span>
                        <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                          <button className="btn-icon" title="Open in Builder" onClick={() => { if (onOpenProject) onOpenProject(c.id, proj.id); }}>{Icons.builder}</button>
                          <button className="btn-icon danger" onClick={() => removeProject(c.id, proj.id)}>{Icons.trash}</button>
                        </div>
                      </div>
                      {isProjExp && (
                        <div style={{ padding: '0 12px 10px', borderTop: '1px solid var(--border)' }}>
                          {proj.address && <div className="text-xs text-dim" style={{ padding: '6px 0 4px' }}>{proj.address}</div>}
                          {proj.constructions && proj.constructions.length > 0 && (
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 4 }}>Constructions ({proj.constructions.length})</div>
                              {proj.constructions.map((cn, ci) => (
                                <div key={cn.id || ci} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', fontSize: 10, border: '1px solid var(--divider-light)', borderRadius: 4, marginBottom: 2, background: 'var(--accent-dim)' }}>
                                  <span className="mono" style={{ fontWeight: 500 }}>{cn.w}×{cn.h}</span>
                                  <span className="tag tag-blue" style={{ fontSize: 8, padding: '0 4px' }}>{cn.positions?.length || 0} pcs</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Quotes ({(proj.quotes||[]).length})</span>
                            <button className="btn btn-sm" style={{ fontSize: 10, padding: '2px 8px' }} onClick={() => { setAddingQuote(addingQuote === proj.id ? null : proj.id); setQuoteForm({ name: '', amount: 0 }); }}>{Icons.plus} Quote</button>
                          </div>
                          {addingQuote === proj.id && (
                            <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'flex-end' }}>
                              <div className="form-group" style={{ flex: 1 }}><input className="form-input" value={quoteForm.name} onChange={e => setQuoteForm({ ...quoteForm, name: e.target.value })} placeholder="Quote name..." style={{ fontSize: 11 }} /></div>
                              <div className="form-group" style={{ width: 80 }}><input className="form-input" type="number" value={quoteForm.amount} onChange={e => setQuoteForm({ ...quoteForm, amount: e.target.value })} placeholder="$" style={{ fontSize: 11 }} /></div>
                              <button className="btn btn-primary btn-sm" style={{ fontSize: 10 }} onClick={() => addQuote(c.id, proj.id)}>Add</button>
                            </div>
                          )}
                          {(proj.quotes||[]).map((q, qi) => {
                            const isQExp = expandedQuote === q.id;
                            const windowCount = q.items?.length || 0;
                            // Build specs summary
                            const specs = [];
                            if (q.items?.length) {
                              const types = {}; const glasses = {}; const profiles = {};
                              q.items.forEach(it => {
                                types[it.type] = (types[it.type]||0) + 1;
                                if (it.glass) glasses[it.glass] = (glasses[it.glass]||0) + 1;
                                if (it.profile) profiles[it.profile] = (profiles[it.profile]||0) + 1;
                              });
                              Object.entries(types).forEach(([k,v]) => specs.push(`${v}× ${k}`));
                              Object.entries(glasses).forEach(([k,v]) => specs.push(k));
                              Object.entries(profiles).forEach(([k,v]) => specs.push(k));
                            }
                            return (
                            <div key={q.id} style={{ border: '1px solid var(--divider)', borderRadius: 6, marginBottom: 4, overflow: 'hidden' }}>
                              {/* Quote header — clickable to expand */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', cursor: 'pointer', fontSize: 11, background: isQExp ? 'var(--accent-dim)' : 'transparent' }} onClick={() => setExpandedQuote(isQExp ? null : q.id)}>
                                <span style={{ fontSize: 10, color: 'var(--text-muted)', transform: isQExp ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▶</span>
                                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Q{qi+1}</span>
                                <span style={{ fontWeight: 500, flex: 1, cursor: q.items?.length ? 'pointer' : 'default' }} onClick={e => { e.stopPropagation(); if (q.items?.length && onOpenQuote) onOpenQuote(c.id, proj.id, q.id); }}>{q.name}</span>
                                <span className={`tag ${statusColors[q.status] || 'tag-dim'}`}>{q.status}</span>
                                <span className="mono text-accent" style={{ fontSize: 12 }}>${(q.amount||0).toLocaleString()}</span>
                                <span className="text-xs text-muted">{windowCount}w</span>
                                <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                                  <button className="btn-icon" title="Open in Builder" onClick={() => { if (q.items?.length && onOpenQuote) onOpenQuote(c.id, proj.id, q.id); }} style={{ padding: 2 }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>
                                  </button>
                                  <button className="btn-icon danger" onClick={() => removeQuote(c.id, proj.id, q.id)} style={{ padding: 2 }}>{Icons.trash}</button>
                                </div>
                              </div>
                              {/* Expanded details */}
                              {isQExp && (
                                <div style={{ padding: '6px 10px 10px', borderTop: '1px solid var(--divider-light)', fontSize: 11, color: 'var(--text-dim)' }}>
                                  <div style={{ display: 'flex', gap: 16, marginBottom: 6, flexWrap: 'wrap' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Created:</span> {q.date || '—'}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Windows:</span> {windowCount}</div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Amount:</span> <span className="mono">${(q.amount||0).toLocaleString()}</span></div>
                                  </div>
                                  {q.name && <div style={{ marginBottom: 6 }}><span style={{ color: 'var(--text-muted)' }}>Description:</span> <span style={{ color: 'var(--text)' }}>{q.name}</span></div>}
                                  {specs.length > 0 && (
                                    <div style={{ marginBottom: 6 }}><span style={{ color: 'var(--text-muted)' }}>Specs:</span> {specs.join(' · ')}</div>
                                  )}
                                  {q.items?.length > 0 && (
                                    <div style={{ marginTop: 6 }}>
                                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 4 }}>Windows</div>
                                      {q.items.slice(0, 8).map((it, ii) => (
                                        <div key={ii} style={{ display: 'flex', gap: 8, padding: '2px 0', fontSize: 10, color: 'var(--text-dim)' }}>
                                          <span className="mono" style={{ fontWeight: 500, minWidth: 24 }}>#{it.idx || ii+1}</span>
                                          <span className="mono">{it.w}×{it.h}</span>
                                          <span>{it.type}</span>
                                          {it.glass && <span style={{ color: 'var(--text-muted)' }}>{it.glass}</span>}
                                          {it.desc && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{it.desc}</span>}
                                        </div>
                                      ))}
                                      {q.items.length > 8 && <div className="text-xs text-muted" style={{ padding: '2px 0' }}>...and {q.items.length - 8} more</div>}
                                    </div>
                                  )}
                                  {/* Invoices */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Invoices ({(q.invoices||[]).length})</span>
                                    <button className="btn-icon" title="Add Invoice" onClick={() => addInvoice(c.id, proj.id, q.id)} style={{ padding: 2 }}>
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="12" y1="7" x2="12" y2="13"/></svg>
                                    </button>
                                  </div>
                                  {(q.invoices||[]).map(inv => (
                                    <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, padding: '2px 0', color: 'var(--text-dim)' }}>
                                      <span className="mono" style={{ fontWeight: 500 }}>{inv.number}</span>
                                      <span className="mono">${(inv.amount||0).toLocaleString()}</span>
                                      <span className={`tag ${invStatusColors[inv.status] || 'tag-dim'}`} style={{ fontSize: 9, padding: '1px 5px' }}>{inv.status}</span>
                                      <span>{inv.date}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── WINDOW BUILDER ──────────────────────────────────────────────────────────

// ─── WINDOW BUILDER (faithful port of configurator.html + project-manager.html) ───

const MCOLS=[{n:'White',h:'#EEEEE8'},{n:'Black',h:'#1A1A1A'}];
const MW58=15.875,MW1=25.4;
const HMIN=200,HO=50;

function mkLeaf(t,h,hH,op){const n={split:null,type:t,opening:op||'tilt-turn',muntin:null};if(t==='sash'){n.handle=h||'right';n.handleH=hH||0}return n}
function isV(s){return s==='right'||s==='left'}
function opp(s){return{right:'left',left:'right',top:'bottom',bottom:'top',none:'none'}[s]}
function mkC(hex){const l=parseInt(hex.slice(1,3),16)*.299+parseInt(hex.slice(3,5),16)*.587+parseInt(hex.slice(5,7),16)*.114;const dk=l<128;const adj=(h,a,up)=>{let r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);if(up){r=Math.min(255,r+Math.round((255-r)*a));g=Math.min(255,g+Math.round((255-g)*a));b=Math.min(255,b+Math.round((255-b)*a))}else{r=Math.round(r*(1-a));g=Math.round(g*(1-a));b=Math.round(b*(1-a))}return'#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('')};return{hex,line:dk?adj(hex,.22,1):adj(hex,.22,0),glass:dk?'#8EB5D5':'#B8D4EC'}}

const TYPE_PRESETS={
  '1po':()=>mkLeaf('sash','right',0),
  '1fix':()=>mkLeaf('fixed'),
  'po_po':()=>({split:'v',ratio:.5,children:[mkLeaf('sash','right',0),mkLeaf('sash','left',0)]}),
  'po_fix':()=>({split:'v',ratio:.5,children:[mkLeaf('sash','right',0),mkLeaf('fixed')]}),
  'po_fix_po':()=>({split:'v',ratio:.33,children:[mkLeaf('sash','right',0),{split:'v',ratio:.5,children:[mkLeaf('fixed'),mkLeaf('sash','left',0)]}]}),
  'fix_fix_fix':()=>({split:'v',ratio:.33,children:[mkLeaf('fixed'),{split:'v',ratio:.5,children:[mkLeaf('fixed'),mkLeaf('fixed')]}]}),
  't':()=>({split:'h',ratio:.35,children:[mkLeaf('fixed'),{split:'v',ratio:.5,children:[mkLeaf('sash','right',0),mkLeaf('sash','left',0)]}]}),
};

function getProfileConsts(profile) {
  if (!profile) return {FI:46,FB:26,OV:8,FRAME:72,MULL:94,MV:42,SVE:36,SVI:70,SE:44,GD:49};
  const p = profile;
  const FI=p.frame.int, FB=p.frame.bead, OV=p.sash.overlap, FRAME=p.frame.section;
  const MULL=p.mullion.total, MV=p.mullion.visible;
  const SVE=p.sash.ext-OV, SVI=p.sash.int+p.sash.bead, SE=p.sash.ext;
  const GD=p.sash.ext+p.glass.shim;
  return {FI,FB,OV,FRAME,MULL,MV,SVE,SVI,SE,GD};
}

function computeLayout(root,Wmm,Hmm,K){
  let nid=0;
  function doL(n,r){n._id=nid++;n._rect=r;if(!n.split){n._lightW=n.type==='sash'?r.w-2*(K.SVI-K.OV):r.w-2*K.FB;n._lightH=n.type==='sash'?r.h-2*(K.SVI-K.OV):r.h-2*K.FB;return}const rt=n.ratio||.5;if(n.split==='v'){const lw=Math.round((r.w-K.MV)*rt),rw=r.w-K.MV-lw;n._mull={x:r.x+lw,y:r.y,w:K.MV,h:r.h};doL(n.children[0],{x:r.x,y:r.y,w:lw,h:r.h});doL(n.children[1],{x:r.x+lw+K.MV,y:r.y,w:rw,h:r.h})}else{const th=Math.round((r.h-K.MV)*rt),bh=r.h-K.MV-th;n._mull={x:r.x,y:r.y+th,w:r.w,h:K.MV};doL(n.children[0],{x:r.x,y:r.y,w:r.w,h:th});doL(n.children[1],{x:r.x,y:r.y+th+K.MV,w:r.w,h:bh})}}
  doL(root,{x:0,y:0,w:Wmm-2*K.FI,h:Hmm-2*K.FI});
}
function collectAllLeaves(n,a){if(!n.split){if(n.muntin)a.push(n)}else n.children.forEach(c=>collectAllLeaves(c,a))}
function computeGHB(root,rows,Hmm,K){const lv=[];collectAllLeaves(root,lv);if(!lv.length||rows<2)return[];let mn=Infinity;lv.forEach(l=>{if(l.muntin&&l.muntin.rows===rows)mn=Math.min(mn,l._lightH)});if(mn===Infinity)return[];const cy=Hmm/2,rt=cy-mn/2,ch=mn/rows,b=[];for(let i=1;i<rows;i++)b.push(rt+ch*i);return b}
function drawM(s,gx,gy,gw,gh,m,sc,hb,gt){if(!m||m.cols<1||m.rows<1)return s;const mw=(m.width==='1'?MW1:MW58)*sc;const mc=MCOLS[m.ci||0].h;const cw=gw/m.cols;for(let i=1;i<m.cols;i++)s+=`<rect x="${gx+cw*i-mw/2}" y="${gy}" width="${mw}" height="${gh}" fill="${mc}" rx=".5"/>`;if(hb&&hb.length===m.rows-1){for(const b of hb){const bp=(b-gt)*sc+gy;if(bp>gy+mw&&bp<gy+gh-mw)s+=`<rect x="${gx}" y="${bp-mw/2}" width="${gw}" height="${mw}" fill="${mc}" rx=".5"/>`}}else{const ch2=gh/m.rows;for(let i=1;i<m.rows;i++)s+=`<rect x="${gx}" y="${gy+ch2*i-mw/2}" width="${gw}" height="${mw}" fill="${mc}" rx=".5"/>`}return s}

function findN(n,id){if(n._id===id)return n;if(n.children)for(const c of n.children){const f=findN(c,id);if(f)return f}return null}

function buildSVG(root,Wmm,Hmm,view,K,C,hCol,hingeMode,unit){
  const W=Wmm,H=Hmm,isExt=view==='ext';
  const fd=(mm)=>unit==='mm'?Math.round(mm):+(mm/25.4).toFixed(2);
  const fu=()=>unit==='mm'?'mm':'in';
  const VW=680,pad=24,aW=VW-pad*2,aH=420,sc=Math.min(aW/W,aH/H);
  const dw=W*sc,dh=H*sc,ox=pad+(aW-dw)/2,oy=20,VH=Math.round(dh+oy+24);
  const fiS=K.FI*sc,ovS=K.OV*sc,sviS=K.SVI*sc,fbS=K.FB*sc,frmS=K.FRAME*sc,sveS=K.SVE*sc,hoS=HO*sc;
  const gap=.8,pf=C.hex,ln=C.line,gl=C.glass,bw='.7';
  const lo=`stroke="${ln}" stroke-width=".4" opacity=".4"`;
  const showHi=hingeMode==='visible'&&!isExt;
  const al=[];collectAllLeaves(root,al);const rc=new Set();al.forEach(l=>{if(l.muntin)rc.add(l.muntin.rows)});const gbm={};rc.forEach(r=>{gbm[r]=computeGHB(root,r,Hmm,K)});
  let s=`<svg viewBox="0 0 ${VW} ${VH}" xmlns="http://www.w3.org/2000/svg" style="width:100%">`;
  s+=`<text x="${ox+dw/2}" y="14" text-anchor="middle" style="font-size:11px;font-weight:500;fill:var(--tx1)">${isExt?'Exterior':'Interior'} — ${fd(W)}×${fd(H)} ${fu()}</text>`;
  s+=`<rect x="${ox}" y="${oy}" width="${dw}" height="${dh}" rx="2" fill="${pf}" stroke="${ln}" stroke-width="1.2"/>`;
  if(isExt){s+=`<rect x="${ox+frmS}" y="${oy+frmS}" width="${dw-2*frmS}" height="${dh-2*frmS}" fill="var(--bg)" stroke="${ln}" stroke-width="${bw}"/>`;const oX=ox+frmS,oY=oy+frmS;function deN(n,er){if(n.split){const rt=n.ratio||.5;if(n.split==='v'){const lw=Math.round((er.w-K.MULL)*rt),rw=er.w-K.MULL-lw,mx=er.x+lw;s+=`<rect x="${oX+mx*sc}" y="${oY+er.y*sc}" width="${K.MULL*sc}" height="${er.h*sc}" fill="${pf}" stroke="${ln}" stroke-width="${bw}"/>`;deN(n.children[0],{x:er.x,y:er.y,w:lw,h:er.h});deN(n.children[1],{x:er.x+lw+K.MULL,y:er.y,w:rw,h:er.h})}else{const th=Math.round((er.h-K.MULL)*rt),bh2=er.h-K.MULL-th,my=er.y+th;s+=`<rect x="${oX+er.x*sc}" y="${oY+my*sc}" width="${er.w*sc}" height="${K.MULL*sc}" fill="${pf}" stroke="${ln}" stroke-width="${bw}"/>`;deN(n.children[0],{x:er.x,y:er.y,w:er.w,h:th});deN(n.children[1],{x:er.x,y:er.y+th+K.MULL,w:er.w,h:bh2})}return}const rx=oX+er.x*sc,ry=oY+er.y*sc,rw2=er.w*sc,rh2=er.h*sc;if(n.type==='sash'){s+=`<rect x="${rx+gap}" y="${ry+gap}" width="${rw2-2*gap}" height="${rh2-2*gap}" fill="${pf}" stroke="${ln}" stroke-width="${bw}" rx="1"/>`;const gx=rx+sveS,gy=ry+sveS,gw=rw2-2*sveS,gh=rh2-2*sveS;if(gw>4&&gh>4){s+=`<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${gl}" stroke="${ln}" stroke-width="${bw}"/>`;const gt=K.FRAME+K.SVE+er.y;s=drawM(s,gx,gy,gw,gh,n.muntin,sc,n.muntin?gbm[n.muntin.rows]||[]:[],gt);const cx=gx+gw/2,cy2=gy+gh/2,hs2=opp(n.handle||'right'),op=n.opening||'tilt-turn';if(op==='tilt-turn'){s+=`<line x1="${gx+2}" y1="${gy+gh-2}" x2="${gx+gw-2}" y2="${gy+2}" ${lo}/>`+(hs2==='right'?`<line x1="${gx+gw-2}" y1="${gy+gh-2}" x2="${cx}" y2="${cy2}" ${lo}/>`:`<line x1="${gx+2}" y1="${gy+2}" x2="${cx}" y2="${cy2}" ${lo}/>`)+`<line x1="${cx}" y1="${gy+gh-2}" x2="${cx}" y2="${cy2}" ${lo}/>`}else if(op==='tilt'){s+=`<line x1="${gx+2}" y1="${gy+gh-2}" x2="${cx}" y2="${gy+2}" ${lo}/><line x1="${gx+gw-2}" y1="${gy+gh-2}" x2="${cx}" y2="${gy+2}" ${lo}/>`}else if(op==='turn'){if(hs2==='right')s+=`<line x1="${gx+gw-2}" y1="${gy+2}" x2="${gx+2}" y2="${cy2}" ${lo}/><line x1="${gx+gw-2}" y1="${gy+gh-2}" x2="${gx+2}" y2="${cy2}" ${lo}/>`;else s+=`<line x1="${gx+2}" y1="${gy+2}" x2="${gx+gw-2}" y2="${cy2}" ${lo}/><line x1="${gx+2}" y1="${gy+gh-2}" x2="${gx+gw-2}" y2="${cy2}" ${lo}/>`}}}else{s+=`<rect x="${rx}" y="${ry}" width="${rw2}" height="${rh2}" fill="${gl}" stroke="${ln}" stroke-width=".3"/>`;const gt=K.FRAME+er.y;s=drawM(s,rx,ry,rw2,rh2,n.muntin,sc,n.muntin?gbm[n.muntin.rows]||[]:[],gt)}}deN(root,{x:0,y:0,w:W-2*K.FRAME,h:H-2*K.FRAME})}
  else{s+=`<rect x="${ox+fiS}" y="${oy+fiS}" width="${dw-2*fiS}" height="${dh-2*fiS}" fill="var(--bg)" stroke="${ln}" stroke-width="${bw}"/>`;const ioX=ox+fiS,ioY=oy+fiS;function diN(n){if(n._mull){const m=n._mull;s+=`<rect x="${ioX+m.x*sc}" y="${ioY+m.y*sc}" width="${m.w*sc}" height="${m.h*sc}" fill="${pf}" stroke="${ln}" stroke-width="${bw}"/>`}if(n.children){n.children.forEach(diN);return}const r=n._rect,rx=ioX+r.x*sc,ry=ioY+r.y*sc,rw2=r.w*sc,rh2=r.h*sc;if(n.type==='sash'){const sX=rx-ovS,sY=ry-ovS,sW=rw2+2*ovS,sH=rh2+2*ovS;s+=`<rect x="${sX+gap}" y="${sY+gap}" width="${sW-2*gap}" height="${sH-2*gap}" fill="${pf}" stroke="${ln}" stroke-width="${bw}" rx="1"/>`;const glI=(K.SVI-K.OV)*sc,gX=rx+glI,gY=ry+glI,gW=rw2-2*glI,gH=rh2-2*glI;if(gW>4&&gH>4){s+=`<rect x="${gX}" y="${gY}" width="${gW}" height="${gH}" fill="${gl}" stroke="${ln}" stroke-width="${bw}"/>`;const gt=K.FI+r.y+(K.SVI-K.OV);s=drawM(s,gX,gY,gW,gH,n.muntin,sc,n.muntin?gbm[n.muntin.rows]||[]:[],gt);const cx=gX+gW/2,cy2=gY+gH/2,op=n.opening||'tilt-turn',hs=n.handle||'right';if(op==='tilt-turn'){s+=`<line x1="${gX+2}" y1="${gY+gH-2}" x2="${gX+gW-2}" y2="${gY+2}" ${lo}/>`+(hs==='right'?`<line x1="${gX+gW-2}" y1="${gY+gH-2}" x2="${cx}" y2="${cy2}" ${lo}/>`:(hs==='left'?`<line x1="${gX+2}" y1="${gY+2}" x2="${cx}" y2="${cy2}" ${lo}/>`:``)+`<line x1="${cx}" y1="${gY+gH-2}" x2="${cx}" y2="${cy2}" ${lo}/>`)}else if(op==='tilt'){s+=`<line x1="${gX+2}" y1="${gY+gH-2}" x2="${cx}" y2="${gY+2}" ${lo}/><line x1="${gX+gW-2}" y1="${gY+gH-2}" x2="${cx}" y2="${gY+2}" ${lo}/>`}else if(op==='turn'){if(hs==='right')s+=`<line x1="${gX+gW-2}" y1="${gY+2}" x2="${gX+2}" y2="${cy2}" ${lo}/><line x1="${gX+gW-2}" y1="${gY+gH-2}" x2="${gX+2}" y2="${cy2}" ${lo}/>`;else if(hs==='left')s+=`<line x1="${gX+2}" y1="${gY+2}" x2="${gX+gW-2}" y2="${cy2}" ${lo}/><line x1="${gX+2}" y1="${gY+gH-2}" x2="${gX+gW-2}" y2="${cy2}" ${lo}/>`}if(hs&&hs!=='none'){const hMM=n.handleH||0,hIsV=isV(hs);if(hIsV){const hx=hs==='right'?sX+sW-sviS/2:sX+sviS/2;const mnY=sY+HMIN*sc,mxY=sY+sH-HMIN*sc;let clY;if(hMM===0)clY=sY+sH/2;else{clY=sY+sH-hMM*sc;clY=Math.max(mnY,Math.min(mxY,clY))}s+=`<rect x="${hx-3.5}" y="${clY-5}" width="7" height="10" rx="2" fill="${hCol}" stroke="${ln}" stroke-width=".5"/><rect x="${hx-2}" y="${clY}" width="4" height="24" rx="2" fill="${hCol}" stroke="${ln}" stroke-width=".4"/>`}else{const hy=hs==='bottom'?sY+sH-sviS/2:sY+sviS/2;const mnX=sX+HMIN*sc,mxX=sX+sW-HMIN*sc;let clX;if(hMM===0)clX=sX+sW/2;else{clX=sX+hMM*sc;clX=Math.max(mnX,Math.min(mxX,clX))}s+=`<rect x="${clX-5}" y="${hy-3.5}" width="10" height="7" rx="2" fill="${hCol}" stroke="${ln}" stroke-width=".5"/><rect x="${clX}" y="${hy-2}" width="24" height="4" rx="2" fill="${hCol}" stroke="${ln}" stroke-width=".4"/>`}}if(showHi&&hs&&hs!=='none'){const hS=opp(hs);if(hS==='left'){const x=sX-gap/2-1.5;s+=`<rect x="${x}" y="${sY+hoS-10}" width="3" height="20" rx="1" fill="${hCol}" stroke="${ln}" stroke-width=".4"/><rect x="${x}" y="${sY+sH-hoS-10}" width="3" height="20" rx="1" fill="${hCol}" stroke="${ln}" stroke-width=".4"/>`}else if(hS==='right'){const x=sX+sW+gap/2-1.5;s+=`<rect x="${x}" y="${sY+hoS-10}" width="3" height="20" rx="1" fill="${hCol}" stroke="${ln}" stroke-width=".4"/><rect x="${x}" y="${sY+sH-hoS-10}" width="3" height="20" rx="1" fill="${hCol}" stroke="${ln}" stroke-width=".4"/>`}else if(hS==='top'){const y=sY-gap/2-1.5;s+=`<rect x="${sX+hoS-10}" y="${y}" width="20" height="3" rx="1" fill="${hCol}" stroke="${ln}" stroke-width=".4"/><rect x="${sX+sW-hoS-10}" y="${y}" width="20" height="3" rx="1" fill="${hCol}" stroke="${ln}" stroke-width=".4"/>`}else if(hS==='bottom'){const y=sY+sH+gap/2-1.5;s+=`<rect x="${sX+hoS-10}" y="${y}" width="20" height="3" rx="1" fill="${hCol}" stroke="${ln}" stroke-width=".4"/><rect x="${sX+sW-hoS-10}" y="${y}" width="20" height="3" rx="1" fill="${hCol}" stroke="${ln}" stroke-width=".4"/>`}}}s+=`<text x="${rx+rw2/2}" y="${ry+rh2/2+3}" text-anchor="middle" style="font-size:9px;fill:var(--tx1);font-weight:500;opacity:.3">${fd(Math.round(n._lightW))}x${fd(Math.round(n._lightH))}</text>`}else{s+=`<rect x="${rx+gap}" y="${ry+gap}" width="${rw2-2*gap}" height="${rh2-2*gap}" fill="${pf}" stroke="${ln}" stroke-width="${bw}" rx="1"/>`;const gX=rx+fbS,gY=ry+fbS,gW=rw2-2*fbS,gH=rh2-2*fbS;if(gW>4&&gH>4){s+=`<rect x="${gX}" y="${gY}" width="${gW}" height="${gH}" fill="${gl}" stroke="${ln}" stroke-width="${bw}"/>`;const gt=K.FI+r.y+K.FB;s=drawM(s,gX,gY,gW,gH,n.muntin,sc,n.muntin?gbm[n.muntin.rows]||[]:[],gt)}s+=`<text x="${rx+rw2/2}" y="${ry+rh2/2+3}" text-anchor="middle" style="font-size:9px;fill:var(--tx1);font-weight:500;opacity:.3">${fd(Math.round(n._lightW))}x${fd(Math.round(n._lightH))}</text>`}}diN(root)}
  s+=`<text x="${ox+dw/2}" y="${oy+dh+16}" text-anchor="middle" style="font-size:10px;fill:var(--tx1);font-weight:500">${fd(W)}x${fd(H)} ${fu()}</text></svg>`;
  return s;
}

function drawThumb(w,h,type){const s=Math.min(80/w,60/h),dw=w*s,dh=h*s,ox=(84-dw)/2,oy=(64-dh)/2,fc='#5A6A7A',sc2='#8899AA',gc='#A8CBE8',fS=4,g=.5;let v=`<svg viewBox="0 0 84 64" xmlns="http://www.w3.org/2000/svg"><rect x="${ox}" y="${oy}" width="${dw}" height="${dh}" rx="1.5" fill="${fc}" stroke="#444" stroke-width=".5"/><rect x="${ox+fS}" y="${oy+fS}" width="${dw-2*fS}" height="${dh-2*fS}" fill="#1a2a38" stroke="#444" stroke-width=".2"/>`;if(type==='1po'||type==='1fix'){const iF=type==='1fix';v+=`<rect x="${ox+fS+g}" y="${oy+fS+g}" width="${dw-2*fS-2*g}" height="${dh-2*fS-2*g}" fill="${iF?gc:sc2}" rx=".5" stroke="#444" stroke-width=".3"/>`;if(!iF)v+=`<rect x="${ox+fS+3}" y="${oy+fS+3}" width="${dw-2*fS-6}" height="${dh-2*fS-6}" fill="${gc}" stroke="#444" stroke-width=".2"/>`}else if(type==='po_po'||type==='po_fix'){const mw=2,hw=(dw-2*fS-mw)/2;v+=`<rect x="${ox+fS+hw}" y="${oy+fS}" width="${mw}" height="${dh-2*fS}" fill="${fc}"/><rect x="${ox+fS+g}" y="${oy+fS+g}" width="${hw-2*g}" height="${dh-2*fS-2*g}" fill="${sc2}" rx=".5"/><rect x="${ox+fS+3}" y="${oy+fS+3}" width="${hw-6}" height="${dh-2*fS-6}" fill="${gc}"/>`;const rx=ox+fS+hw+mw;if(type==='po_fix')v+=`<rect x="${rx}" y="${oy+fS}" width="${hw}" height="${dh-2*fS}" fill="${gc}"/>`;else v+=`<rect x="${rx+g}" y="${oy+fS+g}" width="${hw-2*g}" height="${dh-2*fS-2*g}" fill="${sc2}" rx=".5"/><rect x="${rx+3}" y="${oy+fS+3}" width="${hw-6}" height="${dh-2*fS-6}" fill="${gc}"/>`}else if(type==='po_fix_po'||type==='fix_fix_fix'){const mw=2,tw=(dw-2*fS-2*mw)/3;for(let i=0;i<2;i++){const mx=ox+fS+tw*(i+1)+mw*i;v+=`<rect x="${mx}" y="${oy+fS}" width="${mw}" height="${dh-2*fS}" fill="${fc}"/>`}for(let i=0;i<3;i++){const sx=ox+fS+i*(tw+mw);if(type==='fix_fix_fix')v+=`<rect x="${sx}" y="${oy+fS}" width="${tw}" height="${dh-2*fS}" fill="${gc}"/>`;else if(i===1)v+=`<rect x="${sx}" y="${oy+fS}" width="${tw}" height="${dh-2*fS}" fill="${gc}"/>`;else v+=`<rect x="${sx+g}" y="${oy+fS+g}" width="${tw-2*g}" height="${dh-2*fS-2*g}" fill="${sc2}" rx=".5"/><rect x="${sx+3}" y="${oy+fS+3}" width="${tw-6}" height="${dh-2*fS-6}" fill="${gc}"/>`}}else if(type==='t'){const mh=2,tH=(dh-2*fS-mh)*.35,bH=dh-2*fS-mh-tH;v+=`<rect x="${ox+fS}" y="${oy+fS+tH}" width="${dw-2*fS}" height="${mh}" fill="${fc}"/><rect x="${ox+fS}" y="${oy+fS}" width="${dw-2*fS}" height="${tH}" fill="${gc}"/>`;const hw=(dw-2*fS-mh)/2,by=oy+fS+tH+mh;v+=`<rect x="${ox+fS+hw}" y="${by}" width="${mh}" height="${bH}" fill="${fc}"/><rect x="${ox+fS+g}" y="${by+g}" width="${hw-2*g}" height="${bH-2*g}" fill="${sc2}" rx=".5"/><rect x="${ox+fS+hw+mh+g}" y="${by+g}" width="${hw-2*g}" height="${bH-2*g}" fill="${sc2}" rx=".5"/>`}return v+`</svg>`}

// ─── i18n for project manager ───
const PM_L={
ru:{project:'Проект',newConstr:'Новая конструкция',width:'Ш',height:'В',qty:'Кол-во',type:'Тип',add:'+ Добавить',quick:'Быстро:',addPos:'+ поз',copy:'копия',remove:'удалить',positions:'Позиции',configure:'настроить',descPH:'Описание (комната, этаж...)',configured:'настроена',wip:'окон в проекте',units:'шт.',empty:'Добавьте первую конструкцию',types:{po_po:'ПО + ПО',po_fix:'ПО + глухое','1po':'1 ПО','1fix':'1 глухое',po_fix_po:'ПО+глух+ПО',fix_fix_fix:'Глух+Глух+Глух',t:'Т-образное'},presets:[{w:1000,h:1500,t:'1fix',q:1,d:'Глухое',l:'Глухое 1000×1500'},{w:2000,h:1500,t:'po_po',q:1,d:'2x ПО',l:'2x ПО+ПО 2000×1500'},{w:3000,h:1500,t:'fix_fix_fix',q:1,d:'3x Глухое',l:'3x Глухое 3000×1500'}]},
en:{project:'Project',newConstr:'New construction',width:'W',height:'H',qty:'Qty',type:'Type',add:'+ Add',quick:'Quick:',addPos:'+ pos',copy:'copy',remove:'delete',positions:'Positions',configure:'configure',descPH:'Description (room, floor...)',configured:'configured',wip:'windows in project',units:'pcs',empty:'Add your first construction',types:{po_po:'Tilt-turn + Tilt-turn',po_fix:'Tilt-turn + Fixed','1po':'Single tilt-turn','1fix':'Single fixed',po_fix_po:'TT + Fixed + TT',fix_fix_fix:'Fixed + Fixed + Fixed',t:'T-shape'},presets:[{w:1000,h:1500,t:'1fix',q:1,d:'Fixed',l:'Fixed 1000×1500'},{w:2000,h:1500,t:'po_po',q:1,d:'2x TT',l:'2x TT 2000×1500'},{w:3000,h:1500,t:'fix_fix_fix',q:1,d:'Triple Fixed',l:'3x Fixed 3000×1500'}]},
es:{project:'Proyecto',newConstr:'Nueva estructura',width:'An',height:'Al',qty:'Cant.',type:'Tipo',add:'+ Agregar',quick:'Rápido:',addPos:'+ pos',copy:'copiar',remove:'eliminar',positions:'Posiciones',configure:'configurar',descPH:'Descripción (habitación, piso...)',configured:'configurada',wip:'ventanas en el proyecto',units:'uds',empty:'Agregue su primera estructura',types:{po_po:'Oscilobat. + Oscilobat.',po_fix:'Oscilobat. + Fijo','1po':'Oscilobatiente','1fix':'Fijo',po_fix_po:'OB + Fijo + OB',fix_fix_fix:'Fijo+Fijo+Fijo',t:'Forma T'},presets:[{w:1000,h:1500,t:'1fix',q:1,d:'Fijo',l:'Fijo 1000×1500'},{w:2000,h:1500,t:'po_po',q:1,d:'2x OB',l:'2x OB 2000×1500'},{w:3000,h:1500,t:'fix_fix_fix',q:1,d:'3x Fijo',l:'3x Fijo 3000×1500'}]}
};

// ─── CONFIGURATOR PANEL (redesigned) ───
function ConfiguratorPanel({ constr, profile, colors, glass, customer, project, constraints, onBack, onUpdate }) {
  const [view, setView] = useState('int');
  const [unit, setUnit] = useState('mm');
  const [Wmm, setWmm] = useState(constr.w);
  const [Hmm, setHmm] = useState(constr.h);
  const [root, setRoot] = useState(() => JSON.parse(JSON.stringify(constr.tree || TYPE_PRESETS[constr.type]())));

  const PC = colors.profile.map(c => ({ id: c.id, n: c.name, h: c.hex }));
  const HC = colors.handle.map(c => ({ id: c.id, n: c.name, h: c.hex }));
  if (PC.length === 0) PC.push({ id: 'def', n: 'Default', h: '#3E4347' });
  if (HC.length === 0) HC.push({ id: 'def', n: 'Silver', h: '#A8A8A8' });

  // Initialize from saved defaults
  const initPci = Math.max(0, PC.findIndex(c => c.id === constr.defaults?.colorExt));
  const initPciInt = Math.max(0, PC.findIndex(c => c.id === constr.defaults?.colorInt));
  const initHci = Math.max(0, HC.findIndex(c => c.id === constr.defaults?.handleColor));
  const [pciExt, setPciExt] = useState(initPci >= 0 ? initPci : 0);
  const [pciInt, setPciInt] = useState(initPciInt >= 0 ? initPciInt : (PC.findIndex(c => /white/i.test(c.n)) >= 0 ? PC.findIndex(c => /white/i.test(c.n)) : 0));
  const [hci, setHci] = useState(initHci >= 0 ? initHci : 0);
  const [hingeMode, setHingeMode] = useState(constr.defaults?.hinges || 'visible');
  const [alignMode, setAlignMode] = useState(null);
  const [editW, setEditW] = useState(null);
  const [editH, setEditH] = useState(null);

  const K = getProfileConsts(profile);
  const fd = (mm) => unit === 'mm' ? Math.round(mm) : +(mm / 25.4).toFixed(2);
  const toIn = (mm) => (mm / 25.4).toFixed(unit === 'mm' ? 2 : 1);
  // Dual format: primary (secondary)
  const dual = (mm) => unit === 'mm' ? `${Math.round(mm)} mm` : `${(mm/25.4).toFixed(2)}"`;
  const dualSec = (mm) => unit === 'mm' ? `(${(mm/25.4).toFixed(2)}")` : `(${Math.round(mm)} mm)`;
  const dualPair = (w, h) => unit === 'mm'
    ? { pri: `${Math.round(w)} × ${Math.round(h)}`, unit: 'mm', sec: `(${(w/25.4).toFixed(1)} × ${(h/25.4).toFixed(1)}")` }
    : { pri: `${(w/25.4).toFixed(1)} × ${(h/25.4).toFixed(1)}`, unit: '"', sec: `(${Math.round(w)} × ${Math.round(h)} mm)` };

  // Auto-save on every meaningful change
  const autoSave = useCallback((w, h, tree) => {
    if (onUpdate) onUpdate({
      w, h,
      tree: JSON.parse(JSON.stringify(tree)),
      colorExt: PC[Math.min(pciExtRef.current, PC.length - 1)]?.id,
      colorInt: PC[Math.min(pciIntRef.current, PC.length - 1)]?.id,
      handleColor: HC[Math.min(hciRef.current, HC.length - 1)]?.id,
      hinges: hingeModeRef.current,
    });
  }, [onUpdate, PC, HC]);

  const rootRef = useRef(root);
  rootRef.current = root;
  const wRef = useRef(Wmm); wRef.current = Wmm;
  const hRef = useRef(Hmm); hRef.current = Hmm;
  const pciExtRef = useRef(pciExt); pciExtRef.current = pciExt;
  const pciIntRef = useRef(pciInt); pciIntRef.current = pciInt;
  const hciRef = useRef(hci); hciRef.current = hci;
  const hingeModeRef = useRef(hingeMode); hingeModeRef.current = hingeMode;
  const saveTimer = useRef(null);

  const triggerAutoSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => autoSave(wRef.current, hRef.current, rootRef.current), 300);
  }, [autoSave]);

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  computeLayout(root, Wmm, Hmm, K);
  const activePci = view === 'ext' ? pciExt : pciInt;
  const svgHtml = buildSVG(root, Wmm, Hmm, view, K, mkC(PC[Math.min(activePci, PC.length - 1)]?.h || '#3E4347'), HC[Math.min(hci, HC.length - 1)]?.h || '#A8A8A8', hingeMode, unit);

  const mutateRoot = (fn) => {
    setRoot(prev => { const next = JSON.parse(JSON.stringify(prev)); fn(next); return next; });
    setTimeout(triggerAutoSave, 10);
  };

  const handleSetDim = (id, val) => {
    let v = parseFloat(val); if (isNaN(v)) v = id === 'w' ? 1500 : 1400;
    const mm = unit === 'mm' ? Math.round(v) : Math.round(v * 25.4);
    const CL = constraints || INITIAL_CONSTRAINTS;
    if (id === 'w') setWmm(Math.max(CL.minW, Math.min(CL.maxW, mm)));
    else setHmm(Math.max(CL.minH, Math.min(CL.maxH, mm)));
    triggerAutoSave();
  };
  const commitW = (val) => { handleSetDim('w', val); setEditW(null); };
  const commitH = (val) => { handleSetDim('h', val); setEditH(null); };

  const handleSplit = (id, dir) => { mutateRoot(r => { const n = findN(r, id); if (!n || n.split) return; const t2 = n.type, h = n.handle, hH = n.handleH, op = n.opening, mt = n.muntin; n.split = dir; n.ratio = .5; const c1 = mkLeaf(t2, h, hH, op); c1.muntin = mt ? { ...mt } : null; n.children = [c1, mkLeaf('sash', 'left', 0)]; delete n.type; delete n.handle; delete n.handleH; delete n.opening; delete n.muntin; }); };
  const handleMerge = (id) => { mutateRoot(r => { const n = findN(r, id); if (!n || !n.split) return; const fl = nd => nd.split ? fl(nd.children[0]) : nd; const f = fl(n); n.split = null; n.type = f.type; n.handle = f.handle; n.handleH = f.handleH; n.opening = f.opening; n.muntin = f.muntin || null; delete n.children; delete n.ratio; }); };
  const handleToggle = (id) => { mutateRoot(r => { const n = findN(r, id); if (!n || n.split) return; if (n.type === 'sash') { n.type = 'fixed'; delete n.handle; delete n.handleH; delete n.opening; } else { n.type = 'sash'; n.handle = 'right'; n.handleH = 0; n.opening = 'tilt-turn'; } }); };
  const handleSetOp = (id, v) => { mutateRoot(r => { const n = findN(r, id); if (n) n.opening = v; }); };
  const handleSetHa = (id, v) => { mutateRoot(r => { const n = findN(r, id); if (n) n.handle = v; }); };
  const handleSetHH = (id, v) => { mutateRoot(r => { const n = findN(r, id); if (n) n.handleH = v; }); };
  const handleSetRatio = (id, v) => { mutateRoot(r => { const n = findN(r, id); if (n) n.ratio = v / 100; }); };
  const handleSetMunt = (id, v) => { mutateRoot(r => { const n = findN(r, id); if (n) n.muntin = v; }); };
  const handleSetMP = (id, p, v) => { mutateRoot(r => { const n = findN(r, id); if (n && n.muntin) n.muntin[p] = v; }); };
  const handleSetGlass = (id, gid) => { mutateRoot(r => { const n = findN(r, id); if (n) n.glassId = gid; }); };
  const handlePreset = (key) => { setRoot(JSON.parse(JSON.stringify(TYPE_PRESETS[key]()))); triggerAutoSave(); };

  const handleSave = () => { autoSave(Wmm, Hmm, root); if (onBack) onBack(); };

  // Collect leaves for summary
  const leaves = [];
  (function cl(n) { if (!n.split) leaves.push(n); else n.children.forEach(cl); })(root);

  // ── Constraint validation ──
  const CL = constraints || INITIAL_CONSTRAINTS;
  const warnings = [];
  if (Wmm < CL.minW) warnings.push(`Frame width ${Wmm}mm < min ${CL.minW}mm`);
  if (Wmm > CL.maxW) warnings.push(`Frame width ${Wmm}mm > max ${CL.maxW}mm`);
  if (Hmm < CL.minH) warnings.push(`Frame height ${Hmm}mm < min ${CL.minH}mm`);
  if (Hmm > CL.maxH) warnings.push(`Frame height ${Hmm}mm > max ${CL.maxH}mm`);
  if (leaves.length > 1 && Wmm < CL.minMullionFrameW) warnings.push(`Frame ${Wmm}mm too narrow for mullion (min ${CL.minMullionFrameW}mm)`);
  leaves.forEach((l, i) => {
    const rw = l._rect?.w || 0;
    const rh = l._rect?.h || 0;
    const lw = l._lightW || 0;
    const lh = l._lightH || 0;
    if (l.type === 'sash') {
      if (rw > CL.maxSashW) warnings.push(`Section ${i+1}: sash width ${Math.round(rw)}mm > max ${CL.maxSashW}mm`);
      if (rh > CL.maxSashH) warnings.push(`Section ${i+1}: sash height ${Math.round(rh)}mm > max ${CL.maxSashH}mm`);
    }
    if (lw > CL.maxGlassW) warnings.push(`Section ${i+1}: glass width ${Math.round(lw)}mm > max ${CL.maxGlassW}mm`);
    if (lh > CL.maxGlassH) warnings.push(`Section ${i+1}: glass height ${Math.round(lh)}mm > max ${CL.maxGlassH}mm`);
  });

  // ── Equalization: count leaves in subtree ──
  const countLeaves = (n) => !n.split ? 1 : n.children.reduce((a, c2) => a + countLeaves(c2), 0);

  // Equal Structure: ratio = leftLeaves / totalLeaves (equal rect.w for each leaf)
  const equalizeStructure = (id) => {
    mutateRoot(r => {
      computeLayout(r, Wmm, Hmm, K);

      const adjustEqual = (n, availW) => {
        if (!n.split) return;
        const totalLeaves = countLeaves(n);
        const leftLeaves = countLeaves(n.children[0]);
        const rightLeaves = countLeaves(n.children[1]);
        // Each leaf gets rectW = X where X = (availW - (totalLeaves-1)*MV) / totalLeaves
        const X = (availW - (totalLeaves - 1) * K.MV) / totalLeaves;
        if (X <= 0) return;
        // Left subtree width = leftLeaves*X + (leftLeaves-1)*MV
        const leftW = leftLeaves * X + (leftLeaves > 1 ? (leftLeaves - 1) * K.MV : 0);
        const rightW = rightLeaves * X + (rightLeaves > 1 ? (rightLeaves - 1) * K.MV : 0);
        n.ratio = leftW / (leftW + rightW);
        n.ratio = Math.max(0.1, Math.min(0.9, n.ratio));
        adjustEqual(n.children[0], leftW);
        adjustEqual(n.children[1], rightW);
      };

      const target = id === undefined ? r : findN(r, id);
      if (target && target.split) {
        const availW = target.split === 'v' ? target._rect.w : target._rect.h;
        adjustEqual(target, availW);
      }
    });
  };

  // Equal Light: adjust ratios so all leaves have same _lightW (or _lightH for H splits)
  const equalizeLight = (id) => {
    mutateRoot(r => {
      // Recompute layout to get fresh _rect values
      computeLayout(r, Wmm, Hmm, K);

      const sashDed = 2 * (K.SVI - K.OV);
      const fixedDed = 2 * K.FB;

      const collectInfo = (n) => {
        if (!n.split) return [{ node: n, ded: n.type === 'sash' ? sashDed : fixedDed }];
        return [...collectInfo(n.children[0]), ...collectInfo(n.children[1])];
      };

      const adjustRatios = (n, availableW) => {
        if (!n.split) return;
        const leftInfo = collectInfo(n.children[0]);
        const rightInfo = collectInfo(n.children[1]);
        const allInfo = [...leftInfo, ...rightInfo];
        const nLeaves = allInfo.length;
        const nMullions = nLeaves - 1;
        // Equal light L: each leaf rect.w = L + ded[i]
        // sum(rect.w) = availableW - nMullions * MV
        // nLeaves * L + sum(ded) = availableW - nMullions * MV
        const sumDed = allInfo.reduce((a, x) => a + x.ded, 0);
        const totalForSections = availableW - nMullions * K.MV;
        const lightW = (totalForSections - sumDed) / nLeaves;
        if (lightW <= 0) return;

        const leftMullions = leftInfo.length > 1 ? leftInfo.length - 1 : 0;
        const leftTotalW = leftInfo.reduce((a, x) => a + lightW + x.ded, 0) + leftMullions * K.MV;
        const rightMullions = rightInfo.length > 1 ? rightInfo.length - 1 : 0;
        const rightTotalW = rightInfo.reduce((a, x) => a + lightW + x.ded, 0) + rightMullions * K.MV;

        // In computeLayout: lw = (availW - MV) * ratio
        // So ratio = leftW / (leftW + rightW)  NOT leftW / (leftW + MV + rightW)
        n.ratio = leftTotalW / (leftTotalW + rightTotalW);
        n.ratio = Math.max(0.1, Math.min(0.9, n.ratio));

        adjustRatios(n.children[0], leftTotalW);
        adjustRatios(n.children[1], rightTotalW);
      };

      const target = id === undefined ? r : findN(r, id);
      if (target && target.split) {
        const availW = target.split === 'v' ? target._rect.w : target._rect.h;
        adjustRatios(target, availW);
      }
    });
  };

  // Add N sections: build a balanced tree of N leaves
  const addSections = (totalSections) => {
    if (totalSections < 1 || totalSections > 8) return;
    const buildBalanced = (n, dir) => {
      if (n <= 1) return mkLeaf('sash', 'right', 0);
      if (n === 2) return { split: dir, ratio: 0.5, children: [mkLeaf('sash', 'right', 0), mkLeaf('sash', 'left', 0)] };
      const leftN = Math.ceil(n / 2);
      const rightN = n - leftN;
      return { split: dir, ratio: leftN / n, children: [buildBalanced(leftN, dir), buildBalanced(rightN, dir)] };
    };
    setRoot(buildBalanced(totalSections, 'v'));
    triggerAutoSave();
  };

  // Tree UI
  function renderNode(n, depth) {
    if (!n || n._id === undefined) return null;
    const ind = depth > 0 ? { marginLeft: 16, borderLeft: '2px solid var(--border)', paddingLeft: 12 } : {};

    if (n.split) {
      const ratioPercent = Math.round((n.ratio || .5) * 100);
      const isTopLevel = depth === 0;
      return (<div key={n._id} style={ind}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent, #4A9EFF)', minWidth: 30 }}>{n.split === 'v' ? '▮ V' : '▬ H'}</span>
          <span style={{ fontSize: 12, color: 'var(--text-dim, #8B949E)' }}>Mullion</span>
          <input type="number" min={20} max={80} style={{ width: 48, fontSize: 12, padding: '3px 6px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-input)', color: 'var(--text)', textAlign: 'center', fontFamily: 'var(--mono)' }}
            value={ratioPercent}
            onChange={e => { let p2 = parseInt(e.target.value); if (isNaN(p2)) return; p2 = Math.max(20, Math.min(80, p2)); handleSetRatio(n._id, p2); setAlignMode(null); }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>%</span>
          <input type="range" min={20} max={80} value={ratioPercent}
            onChange={e => { handleSetRatio(n._id, parseInt(e.target.value)); setAlignMode(null); }}
            style={{ flex: 1, minWidth: 80, maxWidth: 180, height: 4, accentColor: 'var(--accent, #4A9EFF)', cursor: 'pointer' }} />
          <button title="Reset to ½" onClick={() => { handleSetRatio(n._id, 50); setAlignMode(null); }}
            style={{ fontSize: 10, padding: '2px 8px', border: '1px solid var(--border)', borderRadius: 4, background: ratioPercent === 50 ? 'transparent' : 'var(--accent-dim)', color: ratioPercent === 50 ? 'var(--text-muted)' : 'var(--accent, #4A9EFF)', cursor: 'pointer', fontFamily: 'inherit' }}>½</button>
          <button title="Equal sections (equal rect width)" onClick={() => { equalizeStructure(isTopLevel ? undefined : n._id); setAlignMode('structure'); }}
            style={{ fontSize: 10, padding: '2px 8px', border: `1px solid ${alignMode === 'structure' ? 'var(--green, #3FB950)' : 'var(--border)'}`, borderRadius: 4, background: alignMode === 'structure' ? 'var(--green-dim)' : 'var(--green-dim)', color: 'var(--green, #3FB950)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: alignMode === 'structure' ? 600 : 400 }}>= Structure</button>
          <button title="Equal light openings (equal glass width)" onClick={() => { equalizeLight(isTopLevel ? undefined : n._id); setAlignMode('light'); }}
            style={{ fontSize: 10, padding: '2px 8px', border: `1px solid ${alignMode === 'light' ? 'var(--purple, #A371F7)' : 'var(--border)'}`, borderRadius: 4, background: alignMode === 'light' ? 'color-mix(in srgb, var(--purple) 20%, transparent)' : 'color-mix(in srgb, var(--purple) 8%, transparent)', color: 'var(--purple, #A371F7)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: alignMode === 'light' ? 600 : 400 }}>= Light</button>
          <button style={{ fontSize: 11, padding: '3px 10px', border: '1px solid var(--border)', borderRadius: 4, background: 'transparent', color: 'var(--red, #F85149)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => handleMerge(n._id)}>Merge</button>
        </div>
        {n.children.map(c2 => renderNode(c2, depth + 1))}
      </div>);
    }

    const iS = n.type === 'sash';
    return (<div key={n._id} style={ind}>
      <div style={{ padding: '10px 14px', background: 'var(--bg-card)', border: `1px solid ${iS ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--border)'}`, borderRadius: 6, marginBottom: 4 }}>
        {/* Row 1: Type + Dims + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: iS ? 'var(--accent, #4A9EFF)' : 'var(--text-dim, #8B949E)', minWidth: 50 }}>{iS ? 'Sash' : 'Fixed'}</span>
          <span style={{ fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{(() => { const d = dualPair(n._lightW||0, n._lightH||0); return <>{d.pri} <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.unit}</span> <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.sec}</span></>; })()}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <button style={{ fontSize: 11, padding: '3px 10px', border: '1px solid var(--border)', borderRadius: 4, background: iS ? 'var(--accent-dim)' : 'transparent', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => handleToggle(n._id)}>{iS ? '→ Fixed' : '→ Sash'}</button>
            <button style={{ fontSize: 11, padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => handleSplit(n._id, 'v')}>Split ↕</button>
            <button style={{ fontSize: 11, padding: '3px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => handleSplit(n._id, 'h')}>Split ↔</button>
          </div>
        </div>

        {/* Row 2: Opening + Handle (sash only) */}
        {iS && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderTop: '1px solid var(--divider)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 52 }}>Opening</span>
            <select style={{ fontSize: 12, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-input)', color: 'var(--text)', fontFamily: 'inherit' }} value={n.opening || 'tilt-turn'} onChange={e => handleSetOp(n._id, e.target.value)}>
              <option value="tilt-turn">Tilt & Turn</option><option value="tilt">Tilt Only</option><option value="turn">Turn Only</option>
            </select>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Handle</span>
            <select style={{ fontSize: 12, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-input)', color: 'var(--text)', fontFamily: 'inherit' }} value={n.handle || 'right'} onChange={e => handleSetHa(n._id, e.target.value)}>
              <option value="right">Right</option><option value="left">Left</option><option value="top">Top</option><option value="bottom">Bottom</option><option value="none">None</option>
            </select>
            {n.handle && n.handle !== 'none' && (() => {
              const hIsV = isV(n.handle);
              const totalRange = hIsV ? ((n._rect?.h || 800) + 2 * K.OV) : ((n._rect?.w || 600) + 2 * K.OV);
              const centerVal = Math.round(totalRange / 2);
              const currentVal = n.handleH || centerVal;
              const handlePercent = Math.round((currentVal / totalRange) * 100);
              const displayText = n.handleH === 0 ? `auto ${handlePercent}%` : `${fd(n.handleH)} ${handlePercent}%`;
              return (<>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Position</span>
                <input type="text" style={{ width: 80, fontSize: 12, padding: '3px 6px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-input)', color: handlePercent === 50 ? 'var(--green, #3FB950)' : 'var(--text)', textAlign: 'center', fontFamily: 'var(--mono)', fontWeight: 500 }}
                  value={displayText}
                  onChange={e => {
                    const raw = e.target.value.replace(/%/g, '').replace(/auto/gi, '').trim();
                    if (raw === '' || raw === '0') { handleSetHH(n._id, 0); return; }
                    let v = parseFloat(raw); if (isNaN(v)) return;
                    const mm = unit === 'mm' ? Math.round(v) : Math.round(v * 25.4);
                    handleSetHH(n._id, Math.max(HMIN, mm));
                  }}
                  onFocus={e => { e.target.value = n.handleH === 0 ? '' : fd(n.handleH); e.target.select(); }}
                  onBlur={e => { const raw = e.target.value.trim(); if (raw === '' || raw === 'auto' || raw === '0') handleSetHH(n._id, 0); }} />
                <input type="range"
                  min={HMIN} max={Math.max(HMIN + 10, totalRange - HMIN)} step={5}
                  value={currentVal}
                  onChange={e => handleSetHH(n._id, Math.max(HMIN, parseInt(e.target.value)))}
                  style={{ flex: 1, minWidth: 60, maxWidth: 160, height: 4, accentColor: 'var(--accent, #4A9EFF)', cursor: 'pointer' }} />
                <button title="Center (½)" onClick={() => handleSetHH(n._id, 0)}
                  style={{ fontSize: 10, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4, background: n.handleH === 0 ? 'transparent' : 'var(--accent-dim)', color: n.handleH === 0 ? 'var(--text-muted)' : 'var(--accent, #4A9EFF)', cursor: 'pointer', fontFamily: 'inherit' }}>½</button>
                <button title="Lower third (⅓ from bottom)" onClick={() => { const pos = Math.round(totalRange / 3); handleSetHH(n._id, Math.max(HMIN, pos)); }}
                  style={{ fontSize: 10, padding: '2px 6px', border: '1px solid var(--border)', borderRadius: 4, background: (n.handleH && Math.abs(n.handleH - Math.round(totalRange / 3)) < 10) ? 'var(--green-dim)' : 'var(--accent-dim)', color: (n.handleH && Math.abs(n.handleH - Math.round(totalRange / 3)) < 10) ? 'var(--green, #3FB950)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }}>⅓</button>
              </>);
            })()}
          </div>
        )}

        {/* Row 3: Grilles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: '1px solid var(--divider)' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 52 }}>Grilles</span>
          {!n.muntin ? (
            <button style={{ fontSize: 11, padding: '3px 10px', border: '1px dashed var(--border)', borderRadius: 4, background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => handleSetMunt(n._id, { cols: 2, rows: 2, width: '5/8', ci: 0 })}>+ Add Grilles</button>
          ) : (<>
            <select style={{ fontSize: 12, padding: '3px 6px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-input)', color: 'var(--text)', fontFamily: 'inherit', width: 52 }} value={n.muntin.cols} onChange={e => handleSetMP(n._id, 'cols', +e.target.value)}>
              {[1,2,3,4,5,6].map(i => <option key={i} value={i}>{i} col</option>)}
            </select>
            <span style={{ color: 'var(--text-muted)' }}>×</span>
            <select style={{ fontSize: 12, padding: '3px 6px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-input)', color: 'var(--text)', fontFamily: 'inherit', width: 52 }} value={n.muntin.rows} onChange={e => handleSetMP(n._id, 'rows', +e.target.value)}>
              {[1,2,3,4,5,6].map(i => <option key={i} value={i}>{i} row</option>)}
            </select>
            <select style={{ fontSize: 12, padding: '3px 6px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-input)', color: 'var(--text)', fontFamily: 'inherit', width: 56 }} value={n.muntin.width} onChange={e => handleSetMP(n._id, 'width', e.target.value)}>
              <option value="5/8">5/8"</option><option value="1">1"</option>
            </select>
            {MCOLS.map((c2, i) => (
              <div key={i} onClick={() => handleSetMP(n._id, 'ci', i)} title={c2.n}
                style={{ width: 20, height: 20, borderRadius: 4, background: c2.h, cursor: 'pointer', border: (n.muntin.ci || 0) === i ? '2px solid var(--accent)' : '2px solid var(--swatch-border)' }} />
            ))}
            <button style={{ fontSize: 11, padding: '2px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'transparent', color: 'var(--red, #F85149)', cursor: 'pointer', fontFamily: 'inherit', marginLeft: 4 }} onClick={() => handleSetMunt(n._id, null)}>Remove</button>
          </>)}
        </div>

        {/* Row 4: Glass Unit */}
        {glass && glass.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderTop: '1px solid var(--divider)' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 52 }}>Glass</span>
            <select style={{ fontSize: 12, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-input)', color: 'var(--text)', fontFamily: 'inherit', flex: 1, maxWidth: 280 }}
              value={n.glassId || glass[0]?.id || ''} onChange={e => handleSetGlass(n._id, e.target.value)}>
              {glass.map(g => <option key={g.id} value={g.id}>{g.name}{g.uValue ? ` (U=${g.uValue})` : ''}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>);
  }

  return (<div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
    {/* ── Top Bar ── */}
    <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
      <button style={{ fontSize: 12, padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={onBack}>← Back</button>
      <button style={{ fontSize: 12, padding: '6px 16px', border: '1px solid var(--green, #3FB950)', borderRadius: 6, background: 'var(--green-dim)', color: 'var(--green, #3FB950)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }} onClick={handleSave}>Save & Close</button>
      <span style={{ fontSize: 13, fontWeight: 600 }}>#{constr.id}</span>
      <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{profile?.name || 'Profile'}</span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Auto-saving</span>
      {customer && (<>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-dim)' }}>{customer.firstName} {customer.lastName}</span>
        {project && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— {project.name}</span>}
      </>)}
    </div>

    {/* ── Controls Bar ── */}
    <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flexShrink: 0 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Size</span>
      <input type="text" style={{ width: 72, fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 600, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 5, background: 'var(--bg-input)', color: 'var(--text)', textAlign: 'center' }}
        value={editW !== null ? editW : fd(Wmm)}
        onChange={e => setEditW(e.target.value)}
        onFocus={e => { setEditW(String(fd(Wmm))); e.target.select(); }}
        onBlur={e => commitW(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setEditW(null); e.target.blur(); } }} />
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>×</span>
      <input type="text" style={{ width: 72, fontSize: 13, fontFamily: 'var(--mono)', fontWeight: 600, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 5, background: 'var(--bg-input)', color: 'var(--text)', textAlign: 'center' }}
        value={editH !== null ? editH : fd(Hmm)}
        onChange={e => setEditH(e.target.value)}
        onFocus={e => { setEditH(String(fd(Hmm))); e.target.select(); }}
        onBlur={e => commitH(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); if (e.key === 'Escape') { setEditH(null); e.target.blur(); } }} />

      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden', marginLeft: 4 }}>
        <button style={{ padding: '4px 10px', fontSize: 11, border: 'none', background: unit === 'mm' ? 'var(--accent-dim)' : 'transparent', color: unit === 'mm' ? 'var(--accent)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }} onClick={() => setUnit('mm')}>mm</button>
        <button style={{ padding: '4px 10px', fontSize: 11, border: 'none', background: unit === 'in' ? 'var(--accent-dim)' : 'transparent', color: unit === 'in' ? 'var(--accent)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }} onClick={() => setUnit('in')}>inch</button>
      </div>

      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden', marginLeft: 4 }}>
        <button style={{ padding: '4px 12px', fontSize: 11, border: 'none', background: view === 'int' ? 'var(--accent-dim)' : 'transparent', color: view === 'int' ? 'var(--accent)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }} onClick={() => setView('int')}>Interior</button>
        <button style={{ padding: '4px 12px', fontSize: 11, border: 'none', background: view === 'ext' ? 'var(--accent-dim)' : 'transparent', color: view === 'ext' ? 'var(--accent)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }} onClick={() => setView('ext')}>Exterior</button>
      </div>

      <span style={{ borderLeft: '1px solid var(--border)', height: 20, marginLeft: 4 }}></span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Ext</span>
      <div style={{ display: 'flex', gap: 2 }}>
        {PC.map((p, i) => (<div key={i} onClick={() => { setPciExt(i); triggerAutoSave(); }} title={p.n}
          style={{ width: 22, height: 22, borderRadius: 4, background: p.h, cursor: 'pointer', border: i === pciExt ? '2px solid var(--accent)' : '2px solid var(--swatch-border)' }} />))}
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Int</span>
      <div style={{ display: 'flex', gap: 2 }}>
        {PC.map((p, i) => (<div key={i} onClick={() => { setPciInt(i); triggerAutoSave(); }} title={p.n}
          style={{ width: 22, height: 22, borderRadius: 4, background: p.h, cursor: 'pointer', border: i === pciInt ? '2px solid var(--accent)' : '2px solid var(--swatch-border)' }} />))}
      </div>

      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Handles</span>
      <div style={{ display: 'flex', gap: 3 }}>
        {HC.map((p, i) => (<div key={i} onClick={() => { setHci(i); triggerAutoSave(); }} title={p.n}
          style={{ width: 20, height: 20, borderRadius: 4, background: p.h, cursor: 'pointer', border: i === hci ? '2px solid var(--accent)' : '2px solid var(--swatch-border)' }} />))}
      </div>

      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Hinges</span>
      <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 5, overflow: 'hidden' }}>
        <button style={{ padding: '4px 10px', fontSize: 11, border: 'none', background: hingeMode === 'visible' ? 'var(--accent-dim)' : 'transparent', color: hingeMode === 'visible' ? 'var(--accent)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => { setHingeMode('visible'); triggerAutoSave(); }}>Visible</button>
        <button style={{ padding: '4px 10px', fontSize: 11, border: 'none', background: hingeMode === 'hidden' ? 'var(--accent-dim)' : 'transparent', color: hingeMode === 'hidden' ? 'var(--accent)' : 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => { setHingeMode('hidden'); triggerAutoSave(); }}>Hidden</button>
      </div>
    </div>

    {/* ── Presets Bar ── */}
    <div style={{ padding: '6px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center', flexWrap: 'wrap' }}>
      {Object.keys(TYPE_PRESETS).map(k => (
        <button key={k} onClick={() => handlePreset(k)} style={{ fontSize: 11, padding: '4px 12px', border: '1px solid var(--border)', borderRadius: 5, background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }}>
          {k === '1po' ? '1 TT' : k === '1fix' ? '1 Fixed' : k === 'po_po' ? 'TT+TT' : k === 'po_fix' ? 'TT+Fixed' : k === 'po_fix_po' ? 'TT+Fix+TT' : 'T-shape'}
        </button>
      ))}
      <span style={{ borderLeft: '1px solid var(--border)', height: 18, marginLeft: 4 }}></span>
      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4, marginRight: 2 }}>Sections:</span>
      {[2, 3, 4, 5, 6].map(n2 => (
        <button key={n2} onClick={() => addSections(n2)}
          style={{ fontSize: 11, padding: '3px 10px', border: `1px solid ${leaves.length === n2 ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 5, background: leaves.length === n2 ? 'var(--accent-dim)' : 'transparent', color: leaves.length === n2 ? 'var(--accent)' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: leaves.length === n2 ? 600 : 400 }}>
          {n2}
        </button>
      ))}
    </div>

    {/* ── Main Content: SVG + Tree ── */}
    <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', padding: '16px 20px', gap: 16 }}>
      {/* SVG Drawing with dimension labels */}
      <div style={{ position: 'relative' }}>
        <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
        {/* Bottom dimension labels — drag to resize */}
        <div style={{ textAlign: 'center', marginTop: 4, fontSize: 13, fontFamily: 'var(--mono)', color: 'var(--text-dim)', display: 'flex', justifyContent: 'center', gap: 6, alignItems: 'center', userSelect: 'none' }}>
          <span title="Drag left/right to resize width" style={{ cursor: 'ew-resize', padding: '2px 8px', borderRadius: 4, background: 'var(--accent-dim)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}
            onMouseDown={e => {
              e.preventDefault();
              const startX = e.clientX, startVal = Wmm;
              const CL2 = constraints || INITIAL_CONSTRAINTS;
              const onMove = (ev) => { const diff = Math.round((ev.clientX - startX) * 2); const nv = Math.max(CL2.minW, Math.min(CL2.maxW, startVal + diff)); setWmm(nv); };
              const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); triggerAutoSave(); };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}>
            {dual(Wmm)} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{dualSec(Wmm)}</span>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>×</span>
          <span title="Drag left/right to resize height" style={{ cursor: 'ew-resize', padding: '2px 8px', borderRadius: 4, background: 'var(--accent-dim)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}
            onMouseDown={e => {
              e.preventDefault();
              const startX = e.clientX, startVal = Hmm;
              const CL2 = constraints || INITIAL_CONSTRAINTS;
              const onMove = (ev) => { const diff = Math.round((ev.clientX - startX) * 2); const nv = Math.max(CL2.minH, Math.min(CL2.maxH, startVal + diff)); setHmm(nv); };
              const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); triggerAutoSave(); };
              document.addEventListener('mousemove', onMove);
              document.addEventListener('mouseup', onUp);
            }}>
            {dual(Hmm)} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{dualSec(Hmm)}</span>
          </span>
        </div>
      </div>

      {/* Constraint warnings */}
      {warnings.length > 0 && (
        <div style={{ padding: '8px 14px', borderRadius: 6, background: 'var(--red-dim)', border: '1px solid color-mix(in srgb, var(--red) 25%, transparent)', fontSize: 12, color: 'var(--red, #F85149)' }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠ Constraint Violations</div>
          {warnings.map((w, i) => <div key={i} style={{ fontSize: 11, opacity: 0.9 }}>• {w}</div>)}
        </div>
      )}

      {/* Section Tree */}
      <div style={{ borderTop: '2px solid var(--border)', paddingTop: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 8 }}>Section Configuration</div>
        {renderNode(root, 0)}
      </div>

      {/* Summary */}
      <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, padding: '10px 14px', background: 'var(--bg-raised)', borderRadius: 6, border: '1px solid var(--border)' }}>
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{leaves.length} sections</span> · Ext: {PC[Math.min(pciExt, PC.length - 1)]?.n} / Int: {PC[Math.min(pciInt, PC.length - 1)]?.n} · Handles: {HC[Math.min(hci, HC.length - 1)]?.n} · Hinges: {hingeMode}<br/>
        {leaves.map((l, i) => {
          const lw = Math.round(l._lightW || 0);
          const lh = Math.round(l._lightH || 0);
          const d = dualPair(lw, lh);
          let t2 = `${i + 1}. ${l.type === 'sash' ? (l.opening || 'TT') : 'Fixed'} ${d.pri}${d.unit} ${d.sec}`;
          if (l.muntin) t2 += ` · grilles ${l.muntin.cols}×${l.muntin.rows}`;
          if (l.glassId && glass?.length) { const g2 = glass.find(g3 => g3.id === l.glassId); if (g2) t2 += ` · ${g2.name}`; }
          return <span key={i}>{t2}<br/></span>;
        })}
      </div>
    </div>
  </div>);
}


// ─── PROJECT MANAGER (port of project-manager.html) ───
function WindowBuilder({ profiles, colors, muntins: muntinTypes, glass, allHardware, accessories, customer, project, constraints, onConstructionsChange, onBackToCustomers, onSaveQuote, onDeleteQuote, onUpdateQuote, initialViewQuoteId }) {
  const [lang, setLang] = useState('en');
  const [constructions, setConstructionsLocal] = useState(() => {
    const c = project?.constructions || [];
    // Ensure positions exist on each construction
    const safe = c.map(x => ({ ...x, positions: x.positions || [], defaults: x.defaults || {} }));
    let idx = 1;
    return safe.map(x => ({ ...x, positions: x.positions.map(p => ({ ...p, idx: idx++ })) }));
  });
  const [nextId, setNextId] = useState((project?.constructions?.length || 0) + 1);
  const [nw, setNw] = useState(1500);
  const [nh, setNh] = useState(1400);
  const [nq, setNq] = useState(1);
  const [nt, setNt] = useState('po_po');
  const [editingConstr, setEditingConstr] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [groupBySize, setGroupBySize] = useState(false);
  const [quoteLabel, setQuoteLabel] = useState('');
  const [quoteLabelError, setQuoteLabelError] = useState(false);
  const [viewingQuoteId, setViewingQuoteId] = useState(initialViewQuoteId || null);
  const [activeQuoteId, setActiveQuoteId] = useState(null);
  const [creatingQuote, setCreatingQuote] = useState(false);
  const [newQuoteDesc, setNewQuoteDesc] = useState('');
  const [newQuoteDescErr, setNewQuoteDescErr] = useState(false);
  const [quoteTimer, setQuoteTimer] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkGlass, setBulkGlass] = useState('');
  const [bulkProfile, setBulkProfile] = useState('');
  const [bulkColorExt, setBulkColorExt] = useState('');
  const [bulkColorInt, setBulkColorInt] = useState('');
  const [bulkHinges, setBulkHinges] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(profiles[0]?.id || '');
  const [selColorExt, setSelColorExt] = useState(colors.profile[0]?.id || '');
  const [selColorInt, setSelColorInt] = useState(colors.profile[0]?.id || '');
  const [selHinges, setSelHinges] = useState('visible');
  const [selNailingFin, setSelNailingFin] = useState('none');
  const [selGlass, setSelGlass] = useState(glass[0]?.id || '');
  const [selMuntinCols, setSelMuntinCols] = useState(0);
  const [selMuntinRows, setSelMuntinRows] = useState(0);
  const [selMuntinWidth, setSelMuntinWidth] = useState('5/8');
  const [selHandleColor, setSelHandleColor] = useState(colors.handle[0]?.id || '');
  const [confirmDeleteQuote, setConfirmDeleteQuote] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceResult, setVoiceResult] = useState(null); // { ok, msg, items }
  const recognitionRef = useRef(null);

  // Sync constructions — routes to active quote or project
  const activeQuoteRef = useRef(null);
  activeQuoteRef.current = activeQuoteId;

  const setConstructions = (updater) => {
    setConstructionsLocal(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (activeQuoteRef.current && onUpdateQuote) {
        onUpdateQuote(activeQuoteRef.current, next);
      } else if (onConstructionsChange) {
        onConstructionsChange(next);
      }
      return next;
    });
  };

  const t = (k) => PM_L[lang]?.[k] || k;
  const tt = (k) => PM_L[lang]?.types?.[k] || k;
  const profile = profiles.find(p => p.id === selectedProfile) || profiles[0];
  const nfOptions = (accessories || []).filter(a => a.type === 'nailing_fin');

  const buildMuntin = () => {
    if (selMuntinCols < 1 && selMuntinRows < 1) return null;
    return { cols: Math.max(1, selMuntinCols), rows: Math.max(1, selMuntinRows), width: selMuntinWidth, ci: 0 };
  };

  const buildDefaults = () => ({
    colorExt: selColorExt, colorInt: selColorInt,
    handleColor: selHandleColor, hinges: selHinges,
    nailingFin: selNailingFin, glass: selGlass, muntin: buildMuntin(),
  });

  // Global sequential renumbering across all constructions
  const renumber = (constrs) => {
    let idx = 1;
    return (constrs || []).map(c => ({
      ...c,
      positions: (c.positions || []).map(p => ({ ...p, idx: idx++ }))
    }));
  };

  const addConstr = () => {
    const defs = buildDefaults();
    const tree = TYPE_PRESETS[nt]();
    if (defs.muntin) {
      const applyM = (n) => { if (!n.split) { n.muntin = { ...defs.muntin }; } else if (n.children) n.children.forEach(applyM); };
      applyM(tree);
    }
    const c = { id: nextId, w: nw, h: nh, type: nt, profileId: selectedProfile, tree, positions: [], defaults: defs };
    for (let i = 0; i < Math.max(1, nq); i++) c.positions.push({ idx: 0, desc: '', posW: null, posH: null, posGlass: selGlass, tweaks: null });
    setConstructions(prev => renumber([...prev, c]));
    setNextId(prev => prev + 1);
  };

  const quickAdd = (w, h, tp, q, dk) => {
    const pr = PM_L[lang].presets.find(p => p.w === w && p.h === h);
    const d = pr ? pr.d : dk;
    const defs = buildDefaults();
    const tree = TYPE_PRESETS[tp]();
    if (defs.muntin) {
      const applyM = (n) => { if (!n.split) { n.muntin = { ...defs.muntin }; } else if (n.children) n.children.forEach(applyM); };
      applyM(tree);
    }
    const c = { id: nextId, w, h, type: tp, profileId: selectedProfile, tree, positions: [], defaults: defs };
    for (let i = 0; i < q; i++) c.positions.push({ idx: 0, desc: q > 1 ? d + ' ' + (i + 1) : d, posW: null, posH: null, posGlass: selGlass, tweaks: null });
    setConstructions(prev => renumber([...prev, c]));
    setNextId(prev => prev + 1);
  };

  const delConstr = (id) => {
    setConstructions(prev => renumber(prev.filter(c2 => String(c2.id) !== String(id))));
  };
  const dupConstr = (id) => {
    const s = constructions.find(x => String(x.id) === String(id));
    if (!s) return;
    const c = { id: nextId, w: s.w, h: s.h, type: s.type, profileId: s.profileId, tree: JSON.parse(JSON.stringify(s.tree)), positions: s.positions.map(p => ({ idx: 0, desc: p.desc, posW: p.posW, posH: p.posH, tweaks: p.tweaks ? { ...p.tweaks } : null })), defaults: s.defaults ? { ...s.defaults } : undefined };
    setConstructions(prev => renumber([...prev, c]));
    setNextId(prev => prev + 1);
  };
  const addPos = (id) => setConstructions(prev => renumber(prev.map(c2 => String(c2.id) === String(id) ? { ...c2, positions: [...c2.positions, { idx: 0, desc: '', posW: null, posH: null, tweaks: null }] } : c2)));
  const delPos = (cid, pi) => {
    setSelected(prev => { const n = new Set(prev); n.delete(cid + ':' + pi); return n; });
    setConstructions(prev => {
      let next = prev.map(c2 => String(c2.id) === String(cid) ? { ...c2, positions: c2.positions.filter((_, i) => i !== pi) } : c2);
      next = next.filter(c2 => c2.positions.length > 0);
      return renumber(next);
    });
  };
  const setDesc = (cid, pi, v) => setConstructions(prev => prev.map(c2 => String(c2.id) === String(cid) ? { ...c2, positions: c2.positions.map((p, i) => i === pi ? { ...p, desc: v } : p) } : c2));
  const setPosDim = (cid, pi, field, val) => {
    const mm = parseInt(val);
    setConstructions(prev => prev.map(c2 => String(c2.id) === String(cid) ? {
      ...c2, positions: c2.positions.map((p, i) => i === pi ? { ...p, [field]: isNaN(mm) || mm <= 0 ? null : mm } : p)
    } : c2));
  };
  const updateConstrFromCfg = (cid, data) => setConstructions(prev => prev.map(c2 => {
    if (String(c2.id) !== String(cid)) return c2;
    const updated = { ...c2, w: data.w, h: data.h, tree: data.tree };
    // Save configurator properties to construction defaults
    if (data.colorExt || data.handleColor || data.hinges) {
      updated.defaults = {
        ...(updated.defaults || {}),
        colorExt: data.colorExt || updated.defaults?.colorExt,
        colorInt: data.colorInt || updated.defaults?.colorInt,
        handleColor: data.handleColor || updated.defaults?.handleColor,
        hinges: data.hinges || updated.defaults?.hinges,
      };
    }
    return updated;
  }));

  // ── Selection & Bulk Edit ──
  const toggleSel = (cid, pi) => {
    const key = cid + ':' + pi;
    setSelected(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };
  const selectAll = () => {
    const all = new Set();
    constructions.forEach(c => c.positions.forEach((_, pi) => all.add(c.id + ':' + pi)));
    setSelected(all);
  };
  const deselectAll = () => setSelected(new Set());
  const selectedCount = selected.size;

  const bulkApply = () => {
    setConstructions(prev => {
      let next = JSON.parse(JSON.stringify(prev));
      next.forEach(c => {
        c.positions.forEach((p, pi) => {
          if (!selected.has(c.id + ':' + pi)) return;
          if (bulkGlass) p.posGlass = bulkGlass;
          if (bulkHinges) { if (!c.defaults) c.defaults = {}; /* per-position override */ p.posHinges = bulkHinges; }
          if (bulkColorExt) p.posColorExt = bulkColorExt;
          if (bulkColorInt) p.posColorInt = bulkColorInt;
        });
        if (bulkProfile) {
          const hasSelected = c.positions.some((_, pi) => selected.has(c.id + ':' + pi));
          if (hasSelected) c.profileId = bulkProfile;
        }
      });
      return renumber(next);
    });
    setBulkGlass(''); setBulkProfile(''); setBulkColorExt(''); setBulkColorInt(''); setBulkHinges('');
    deselectAll();
  };

  // ── Quote Initialization ──
  const getNextQuoteNumber = () => {
    const allQuotes = (project?.quotes || []);
    const maxNum = allQuotes.reduce((mx, q) => {
      const m = q.quoteNumber?.match(/^(\d+)/);
      return m ? Math.max(mx, parseInt(m[1])) : mx;
    }, 0);
    return String(maxNum + 1).padStart(4, '0');
  };

  // Seller code: first 2 digits from user index (01=first user, 02=second, etc.)
  const sellerCode = '01'; // Default; in production read from logged-in user

  const initializeQuote = () => {
    if (!newQuoteDesc.trim()) { setNewQuoteDescErr(true); return; }
    setNewQuoteDescErr(false);
    const num = getNextQuoteNumber();
    const quoteNumber = `${num}/${sellerCode}`;
    const now = new Date().toISOString();
    const newQuote = {
      id: uid(),
      quoteNumber,
      name: newQuoteDesc.trim(),
      status: 'draft',
      amount: 0,
      date: now.slice(0, 10),
      startedAt: now,
      invoices: [],
      items: [],
      constructions: [],
    };
    if (onSaveQuote) onSaveQuote(newQuote);
    // Activate the new quote
    setTimeout(() => {
      const sq = (project?.quotes || []).find(q => q.quoteNumber === quoteNumber) || newQuote;
      setActiveQuoteId(sq.id || newQuote.id);
      setConstructionsLocal([]);
      setQuoteTimer(now);
    }, 50);
    setCreatingQuote(false);
    setNewQuoteDesc('');
  };

  const createNewQuote = () => {
    const descRequired = constraints?.quoteDescRequired !== 0;
    if (descRequired && !quoteLabel.trim()) { setQuoteLabelError(true); return; }
    setQuoteLabelError(false);
    const snapshot = [];
    constructions.forEach(c => {
      const prf = profiles.find(p => p.id === c.profileId) || profile;
      c.positions.forEach((p, pi) => {
        snapshot.push({
          w: p.posW || c.w, h: p.posH || c.h,
          type: c.type, profile: prf?.name || '', profileId: c.profileId,
          glass: (glass.find(g => g.id === p.posGlass) || glass[0])?.name || '',
          glassId: p.posGlass || glass[0]?.id || '',
          desc: p.desc, idx: p.idx, defaults: c.defaults,
        });
      });
    });
    const totalAmt = snapshot.length * 250;
    const label = quoteLabel.trim() || `Quote — ${snapshot.length} windows`;

    if (onSaveQuote) {
      onSaveQuote({
        id: uid(), name: label, status: 'draft',
        amount: totalAmt, date: new Date().toISOString().slice(0, 10),
        invoices: [], items: snapshot,
        constructions: JSON.parse(JSON.stringify(constructions)),
      });
    }
    setQuoteLabel('');
  };

  const createNewQuoteWithChanges = () => {
    const descRequired = constraints?.quoteDescRequired !== 0;
    if (descRequired && !quoteLabel.trim()) { setQuoteLabelError(true); return; }
    setQuoteLabelError(false);
    // 1. First save current state as-is
    createNewQuote();

    // 2. Apply bulk changes to a copy and set as current
    const nextCopy = JSON.parse(JSON.stringify(constructions));
    let nextIdLocal = nextId;
    nextCopy.forEach(c => {
      c.id = nextIdLocal++;
      c.positions.forEach((p, pi) => {
        if (!selected.has(c.id + ':' + pi)) {
          // For the copy, apply to ALL since we already saved the original
        }
        if (bulkGlass) p.posGlass = bulkGlass;
        if (bulkColorExt) p.posColorExt = bulkColorExt;
        if (bulkColorInt) p.posColorInt = bulkColorInt;
        if (bulkHinges) p.posHinges = bulkHinges;
      });
      if (bulkProfile) c.profileId = bulkProfile;
    });

    setConstructions(() => renumber(nextCopy));
    setNextId(nextIdLocal);
    setBulkGlass(''); setBulkProfile(''); setBulkColorExt(''); setBulkColorInt(''); setBulkHinges('');
    deselectAll();
  };

  // ── Voice AI ──
  // Build color/glass maps for AI
  const colorMap = colors.profile.reduce((m, c) => { m[c.name.toLowerCase()] = c.id; return m; }, {});
  const handleMap = colors.handle.reduce((m, c) => { m[c.name.toLowerCase()] = c.id; return m; }, {});
  const glassMap = glass.reduce((m, g) => { m[g.name.toLowerCase()] = g.id; return m; }, {});

  const voiceSystemPrompt = `You are a window construction assistant for DECA configurator.
Parse the user's command and return ONLY a JSON array. No markdown, no backticks, no explanation.

CRITICAL RULES:
- If the user describes windows with DIFFERENT properties (e.g. "handle left" and "handle right"), create SEPARATE objects with qty:1 each.
- If windows are identical, use qty to group them.

Window types:
- "1fix" = single fixed glass (NO handle, NO opening)
- "1po" = single tilt-turn (operable, has handle)
- "po_po" = two tilt-turn sections with vertical mullion
- "po_fix" = tilt-turn + fixed
- "po_fix_po" = TT + fixed + TT (3 sections)
- "fix_fix_fix" = 3 fixed sections
- "t" = T-shape (fixed top, two sashes bottom)
DEFAULT: If user just says "window" without specifying fixed, assume "1po" (tilt-turn).

Profile colors - use EXACT name from this list:
${colors.profile.map(c => `"${c.name}"`).join(', ')}
Mapping: "black" → "${colors.profile.find(c => /black/i.test(c.name))?.name || colors.profile.find(c => /anthracite|dark/i.test(c.name))?.name || 'Black'}", "white" → "${colors.profile.find(c => /white/i.test(c.name))?.name || 'White'}", "brown" → "${colors.profile.find(c => /brown|walnut/i.test(c.name))?.name || 'Brown'}", "grey"/"gray" → "${colors.profile.find(c => /grey|gray/i.test(c.name))?.name || 'Grey'}"
If user says "black", pick the darkest/blackest color, not grey.

Handle colors: ${colors.handle.map(c => `"${c.name}"`).join(', ')}
Glass types: ${glass.map(g => `"${g.name}"`).join(', ')}

Units: 1 meter = 1000mm, 1 cm = 10mm, 1 inch = 25.4mm. Output always in mm.
"метр" / "meter" = 1000mm, "полтора метра" = 1500mm.

Hinges: "visible" = standard visible hinges, "hidden" = concealed/hidden hinges.
If user says "hidden hinges", "скрытые петли", "no hinges visible" → "hidden".

Muntins/grilles: "2x2" means muntinCols:2, muntinRows:2. "шпросы" = muntins.

Return JSON array:
[{"w":1000,"h":1000,"type":"1po","qty":1,"desc":"","colorExt":"Black","colorInt":"White","glass":null,"handleColor":null,"handleSide":"left","hinges":"hidden","muntinCols":2,"muntinRows":2}]`;

  const processVoiceCommand = async (text) => {
    setVoiceProcessing(true);
    setVoiceResult(null);
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: text }],
          system: voiceSystemPrompt,
        }),
      });
      const data = await resp.json();
      const raw = data.content?.map(c2 => c2.text || '').join('') || '';
      const clean = raw.replace(/```json|```/g, '').trim();
      const items = JSON.parse(clean);
      if (!Array.isArray(items) || items.length === 0) { setVoiceResult({ ok: false, msg: 'No constructions parsed' }); setVoiceProcessing(false); return; }

      let created = 0;
      const details = [];
      items.forEach(item => {
        const w = Math.max(300, Math.min(5500, Math.round(item.w || 1500)));
        const h = Math.max(300, Math.min(3000, Math.round(item.h || 1400)));
        const tp = TYPE_PRESETS[item.type] ? item.type : '1po';
        const q = Math.max(1, Math.min(20, item.qty || 1));
        const desc = item.desc || '';

        // Resolve colors to IDs
        const extId = item.colorExt ? (colorMap[item.colorExt.toLowerCase()] || colors.profile.find(c => c.name.toLowerCase().includes(item.colorExt.toLowerCase()))?.id || selColorExt) : selColorExt;
        const intId = item.colorInt ? (colorMap[item.colorInt.toLowerCase()] || colors.profile.find(c => c.name.toLowerCase().includes(item.colorInt.toLowerCase()))?.id || selColorInt) : selColorInt;
        const hcId = item.handleColor ? (handleMap[item.handleColor.toLowerCase()] || colors.handle.find(c => c.name.toLowerCase().includes(item.handleColor.toLowerCase()))?.id || selHandleColor) : selHandleColor;
        const glId = item.glass ? (glassMap[item.glass.toLowerCase()] || glass.find(g => g.name.toLowerCase().includes(item.glass.toLowerCase()))?.id || selGlass) : selGlass;
        const hinges = item.hinges === 'hidden' ? 'hidden' : item.hinges === 'visible' ? 'visible' : selHinges;

        // Build muntin
        const hasMuntin = item.muntinCols > 0 && item.muntinRows > 0;
        const muntin = hasMuntin ? { cols: item.muntinCols, rows: item.muntinRows, width: selMuntinWidth || '5/8', ci: 0 } : null;

        // Build tree with handle side, muntins, glass
        const tree = TYPE_PRESETS[tp]();
        const applyLeaf = (n) => {
          if (!n.split) {
            if (n.type === 'sash' && item.handleSide) n.handle = item.handleSide;
            if (muntin) n.muntin = { ...muntin };
            n.glassId = glId;
          } else if (n.children) n.children.forEach(applyLeaf);
        };
        applyLeaf(tree);

        const defs = { colorExt: extId, colorInt: intId, handleColor: hcId, hinges, nailingFin: selNailingFin, glass: glId, muntin };
        const c = { id: nextId + created, w, h, type: tp, profileId: selectedProfile, tree, positions: [], defaults: defs };
        for (let i = 0; i < q; i++) c.positions.push({ idx: 0, desc: q > 1 ? desc + ' ' + (i + 1) : desc, posW: null, posH: null, posGlass: glId, tweaks: null });
        setConstructions(prev => renumber([...prev, c]));
        created += q;

        const extName = colors.profile.find(c2 => c2.id === extId)?.name || '';
        const intName = colors.profile.find(c2 => c2.id === intId)?.name || '';
        details.push(`${w}×${h} ${tp} ext:${extName} int:${intName}${muntin ? ` grilles:${muntin.cols}×${muntin.rows}` : ''} handle:${item.handleSide || 'auto'} hinges:${hinges}`);
      });
      setNextId(prev => prev + created);
      setVoiceResult({ ok: true, msg: `Added ${created} window${created > 1 ? 's' : ''}: ${details.join(' | ')}`, items });
    } catch (err) {
      setVoiceResult({ ok: false, msg: 'AI error: ' + err.message });
    }
    setVoiceProcessing(false);
  };

  // If editing, show configurator
  const totalPos = constructions.reduce((a, c) => a + (c.positions?.length || 0), 0);
  const editConstr = editingConstr != null ? constructions.find(c => String(c.id) === String(editingConstr)) : null;
  if (editConstr) {
    return <ConfiguratorPanel
      constr={editConstr}
      profile={profiles.find(p => p.id === editConstr.profileId) || profile}
      colors={colors}
      glass={glass}
      customer={customer}
      project={project}
      constraints={constraints || INITIAL_CONSTRAINTS}
      onBack={() => setEditingConstr(null)}
      onUpdate={(data) => updateConstrFromCfg(editConstr.id, data)}
    />;
  }

  // ── Build flat list of all positions with resolved sizes ──
  const allPositions = [];
  constructions.forEach(c => {
    const cProf = profiles.find(p => p.id === c.profileId) || profile;
    c.positions.forEach((p, pi) => {
      allPositions.push({
        ...p, constr: c, pi,
        w: p.posW || c.w,
        h: p.posH || c.h,
        type: c.type, profileId: c.profileId, profileName: cProf?.name || '',
        tree: c.tree, defaults: c.defaults,
        glassName: (glass.find(g => g.id === p.posGlass) || glass[0])?.name || '',
        glassId: p.posGlass || glass[0]?.id || '',
      });
    });
  });

  // ── REVIEW QUOTE MODE ──
  if (reviewMode) {
    const K0 = getProfileConsts(profile);
    let displayItems;
    if (groupBySize) {
      const groups = {};
      allPositions.forEach(p => {
        const key = `${p.w}x${p.h}|${p.type}|${p.profileId}|${JSON.stringify(p.defaults||{})}`;
        if (!groups[key]) groups[key] = { ...p, positions: [], indices: [] };
        groups[key].positions.push(p);
        groups[key].indices.push(p.idx);
      });
      displayItems = Object.values(groups);
    } else {
      displayItems = allPositions.map(p => ({ ...p, positions: [p], indices: [p.idx] }));
    }

    return (<div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)' }}>
      <style>{`
        .qr-wrap{max-width:100%;padding:20px 24px}
        .qr-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid var(--bd,var(--border))}
        .qr-card{border:1px solid var(--bd,var(--border));border-radius:8px;padding:14px 18px;background:var(--bg1,var(--bg-card));margin-bottom:10px;display:flex;gap:16px;align-items:flex-start}
        .qr-svg{flex-shrink:0;border:1px solid var(--bd,var(--border));border-radius:6px;overflow:hidden;background:var(--bg)}
        .qr-info{flex:1;min-width:0}
        .qr-dims{font-size:18px;font-weight:600;font-family:var(--mono,monospace);letter-spacing:-0.5px}
        .qr-meta{font-size:12px;color:var(--tx2,var(--text-dim));margin-top:4px;line-height:1.6}
        .qr-desc{font-size:13px;margin-top:6px;color:var(--tx1,var(--text))}
        .qr-qty{font-size:24px;font-weight:700;color:var(--accent,#4A9EFF);min-width:50px;text-align:center;align-self:center}
        .qr-summary{margin-top:20px;padding:16px 20px;border-radius:8px;background:var(--bg2,var(--bg-raised));border:1px solid var(--bd,var(--border))}
      `}</style>
      <div className="qr-wrap">
        <div className="qr-header">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>Quote Review</h2>
            {customer && <div style={{ fontSize: 13, color: 'var(--tx2, var(--text-dim))', marginTop: 2 }}>{customer.firstName} {customer.lastName} — {project?.name || ''}</div>}
            <div style={{ fontSize: 12, color: 'var(--tx3, var(--text-muted))', marginTop: 2 }}>{allPositions.length} windows · {displayItems.length} {groupBySize ? 'groups' : 'items'} · {new Date().toLocaleDateString()}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: 11, color: 'var(--tx2, var(--text-dim))', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={groupBySize} onChange={e => setGroupBySize(e.target.checked)} style={{ accentColor: 'var(--accent, #4A9EFF)' }} />
              Group by size
            </label>
            <button style={{ fontSize: 12, padding: '6px 16px', border: '1px solid var(--bd, var(--border))', borderRadius: 6, background: 'transparent', color: 'var(--tx1, var(--text))', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setReviewMode(false)}>← Back to Builder</button>
            <button style={{ fontSize: 12, padding: '6px 16px', border: '1px solid var(--green, #3FB950)', borderRadius: 6, background: 'var(--green-dim)', color: 'var(--green, #3FB950)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }} onClick={() => { alert('Quote finalized! In production this would generate a PDF and save to the customer record.'); }}>Finish Quote</button>
          </div>
        </div>

        {displayItems.map((item, idx) => {
          const prf = profiles.find(p => p.id === item.profileId) || profile;
          const K = getProfileConsts(prf);
          const treeClone = JSON.parse(JSON.stringify(item.tree));
          computeLayout(treeClone, item.w, item.h, K);
          const C = mkC(colors.profile.find(x => x.id === item.defaults?.colorExt)?.hex || '#3E4347');
          const hCol = colors.handle.find(x => x.id === item.defaults?.handleColor)?.hex || '#A8A8A8';
          const svgHtml = buildSVG(treeClone, item.w, item.h, 'int', K, C, hCol, item.defaults?.hinges || 'visible', 'mm');
          const typeName = PM_L['en'].types[item.type] || item.type;
          const qty = item.positions.length;
          const extC = colors.profile.find(x => x.id === item.defaults?.colorExt);
          const intC = colors.profile.find(x => x.id === item.defaults?.colorInt);

          return (
            <div key={idx} className="qr-card">
              {groupBySize && <div className="qr-qty">{qty}×</div>}
              <div className="qr-svg" style={{ width: 160 }} dangerouslySetInnerHTML={{ __html: svgHtml.replace(/width:\s*100%/, 'width:160px') }} />
              <div className="qr-info">
                <div className="qr-dims">{item.w} × {item.h} mm</div>
                <div className="qr-meta">
                  {typeName} · {prf.name}
                  {extC && intC && (extC.id === intC.id
                    ? ` · ${extC.name}`
                    : ` · Ext: ${extC.name} / Int: ${intC.name}`
                  )}
                  {item.defaults?.hinges === 'hidden' ? ' · hidden hinges' : ' · visible hinges'}
                  {item.defaults?.muntin && ` · muntins ${item.defaults.muntin.cols}×${item.defaults.muntin.rows}`}
                  {item.defaults?.nailingFin && item.defaults.nailingFin !== 'none' && ' · nailing fin'}
                  {item.glassName && ` · ${item.glassName}`}
                </div>
                {groupBySize ? (
                  <div className="qr-desc">
                    Positions: {item.indices.join(', ')}
                    {item.positions.some(pp => pp.desc) && (
                      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--tx2, var(--text-dim))' }}>
                        {item.positions.filter(pp => pp.desc).map((pp, j) => (
                          <span key={j}>#{pp.idx} {pp.desc}{j < item.positions.filter(pp2 => pp2.desc).length - 1 ? ' · ' : ''}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="qr-desc">
                    <span style={{ fontWeight: 500 }}>#{item.idx}</span>
                    {item.desc && ` — ${item.desc}`}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Summary */}
        <div className="qr-summary">
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Summary</div>
          <div style={{ fontSize: 13, color: 'var(--tx2, var(--text-dim))', lineHeight: 1.8 }}>
            <b>{allPositions.length}</b> windows total<br/>
            {(() => {
              const gr = {};
              allPositions.forEach(p => { const k = `${p.w}×${p.h} ${PM_L['en'].types[p.type]||p.type}`; gr[k] = (gr[k]||0) + 1; });
              return Object.entries(gr).map(([k, v]) => <span key={k}>{v}× {k}<br/></span>);
            })()}
            Profile: {profile?.name}<br/>
            {customer && <>Customer: {customer.firstName} {customer.lastName}<br/></>}
            {project && <>Project: {project.name}<br/></>}
          </div>
        </div>
      </div>
    </div>);
  }

  // ── Saved quotes for this project ──
  const savedQuotes = project?.quotes || [];
  const quoteWinCount = (q) => {
    if (q.constructions?.length) return q.constructions.reduce((a, c2) => a + (c2.positions?.length || 0), 0);
    return q.items?.length || 0;
  };
  const viewingQuote = viewingQuoteId ? savedQuotes.find(q => q.id === viewingQuoteId) : null;

  // ── VIEWING A SAVED QUOTE ──
  if (viewingQuote && viewingQuote.items) {
    return (<div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)' }}>
      <style>{`
        .qr-wrap{max-width:100%;padding:20px 24px}
        .qr-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid var(--bd,var(--border))}
        .qr-card{border:1px solid var(--bd,var(--border));border-radius:8px;padding:14px 18px;background:var(--bg1,var(--bg-card));margin-bottom:10px;display:flex;gap:16px;align-items:flex-start}
        .qr-svg{flex-shrink:0;border:1px solid var(--bd,var(--border));border-radius:6px;overflow:hidden;background:var(--bg)}
        .qr-info{flex:1;min-width:0}
        .qr-dims{font-size:18px;font-weight:600;font-family:var(--mono,monospace);letter-spacing:-0.5px}
        .qr-meta{font-size:12px;color:var(--tx2,var(--text-dim));margin-top:4px;line-height:1.6}
        .qr-desc{font-size:13px;margin-top:6px;color:var(--tx1,var(--text))}
      `}</style>
      <div className="qr-wrap">
        <div className="qr-header">
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 600 }}>{viewingQuote.name}</h2>
            {customer && <div style={{ fontSize: 13, color: 'var(--tx2, var(--text-dim))', marginTop: 2 }}>{customer.firstName} {customer.lastName} — {project?.name}</div>}
            <div style={{ fontSize: 12, color: 'var(--tx3, var(--text-muted))', marginTop: 2 }}>{viewingQuote.items.length} windows · {viewingQuote.date} · <span className={`tag ${viewingQuote.status === 'approved' ? 'tag-green' : viewingQuote.status === 'sent' ? 'tag-blue' : 'tag-dim'}`}>{viewingQuote.status}</span></div>
          </div>
          <button style={{ fontSize: 12, padding: '6px 16px', border: '1px solid var(--bd, var(--border))', borderRadius: 6, background: 'transparent', color: 'var(--tx1, var(--text))', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setViewingQuoteId(null)}>← Back to Builder</button>
        </div>
        {viewingQuote.items.map((item, idx) => {
          const prf = profiles.find(p => p.id === item.profileId) || profile;
          const K = getProfileConsts(prf);
          const tree = item.defaults?.muntin ? TYPE_PRESETS[item.type]?.() || TYPE_PRESETS['po_po']() : TYPE_PRESETS[item.type]?.() || TYPE_PRESETS['po_po']();
          if (item.defaults?.muntin) { const applyM = (n) => { if (!n.split) n.muntin = { ...item.defaults.muntin }; else if (n.children) n.children.forEach(applyM); }; applyM(tree); }
          computeLayout(tree, item.w, item.h, K);
          const C = mkC(colors.profile.find(x => x.id === item.defaults?.colorExt)?.hex || '#3E4347');
          const hCol = colors.handle.find(x => x.id === item.defaults?.handleColor)?.hex || '#A8A8A8';
          const svgHtml = buildSVG(tree, item.w, item.h, 'int', K, C, hCol, item.defaults?.hinges || 'visible', 'mm');
          return (
            <div key={idx} className="qr-card">
              <div className="qr-svg" style={{ width: 160 }} dangerouslySetInnerHTML={{ __html: svgHtml.replace(/width:\s*100%/, 'width:160px') }} />
              <div className="qr-info">
                <div className="qr-dims">{item.w} × {item.h} mm</div>
                <div className="qr-meta">
                  {PM_L['en'].types[item.type] || item.type} · {item.profile || prf?.name}
                  {item.glass && ` · ${item.glass}`}
                </div>
                <div className="qr-desc"><span style={{ fontWeight: 500 }}>#{item.idx}</span>{item.desc && ` — ${item.desc}`}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>);
  }

  const presets = PM_L[lang].presets;

  return (<div style={{ height: '100%', overflow: 'auto', background: 'var(--bg)' }}>
    <style>{`
      .pm{max-width:100%;padding:20px 24px}
      .pm-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
      .pm-hdr h2{font-size:16px;font-weight:500}
      .pm-hdr .rt{display:flex;align-items:center;gap:8px}
      .pm-hdr .stats{font-size:12px;color:var(--tx2,var(--text-dim))}
      .lang2{display:flex;border:1px solid var(--bd,var(--border));border-radius:6px;overflow:hidden}
      .lang2 button{border:none;background:transparent;padding:4px 10px;font-size:11px;color:var(--tx2,var(--text-dim));cursor:pointer;font-family:inherit}
      .lang2 button.on{background:var(--bg2,var(--bg-raised));color:var(--tx1,var(--text));font-weight:500}
      .add-bar{display:flex;gap:6px;align-items:center;margin-bottom:10px;flex-wrap:wrap}
      .add-bar input[type=number]{width:70px}
      .add-bar input,.add-bar select{font-size:12px;padding:5px 8px;border:1px solid var(--bd,var(--border));border-radius:6px;background:var(--bg1,var(--bg-input));color:var(--tx1,var(--text));font-family:inherit}
      .add-bar input[type=number]{width:60px;text-align:center}
      .add-bar label{font-size:11px;color:var(--tx2,var(--text-dim))}
      .add-bar button,.pr3 button{font-size:11px;padding:5px 14px;border:1px solid var(--bd,var(--border));border-radius:6px;background:transparent;color:var(--tx1,var(--text));cursor:pointer;font-family:inherit}
      .add-bar button:hover,.pr3 button:hover{background:var(--bg2,var(--bg-raised))}
      .pr3{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px}
      .ccard{border:1px solid var(--bd,var(--border));border-radius:8px;padding:12px 16px;background:var(--bg1,var(--bg-card))}
      .ccard-grid{display:flex;flex-direction:column;gap:10px}
      .cc-top{display:flex;align-items:center;gap:12px}
      .cc-thumb{width:84px;height:64px;border-radius:6px;border:1px solid var(--bd,var(--border));overflow:hidden;flex-shrink:0;background:var(--bg)}
      .cc-info{flex:1}.cc-info .cn{font-size:15px;font-weight:500;margin:0 0 2px}.cc-info .cd{font-size:12px;color:var(--tx2,var(--text-dim));margin:0}
      .cc-acts{display:flex;gap:4px}.cc-acts button{font-size:10px;padding:3px 8px;border:1px solid var(--bd,var(--border));border-radius:4px;background:transparent;color:var(--tx2,var(--text-dim));cursor:pointer;font-family:inherit}.cc-acts button:hover{background:var(--bg2,var(--bg-raised));color:var(--tx1,var(--text))}.cc-acts .del{color:var(--danger,var(--red))}
      .positions{margin-top:10px;padding-top:10px;border-top:1px solid var(--bd,var(--border))}
      .pos-hdr{font-size:10px;font-weight:500;color:var(--tx3,var(--text-muted));text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px}
      .pos-row{display:flex;align-items:center;gap:6px;padding:4px 0;font-size:12px;border-bottom:1px solid var(--divider)}.pos-row:last-child{border-bottom:none}
      .pos-check{width:18px;height:18px;border-radius:4px;border:2px solid var(--bd,var(--border));background:var(--bg1,var(--bg-input));cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s}
      .pos-check:hover{border-color:var(--accent,#4A9EFF)}
      .pos-check.on{background:var(--accent,#4A9EFF);border-color:var(--accent,#4A9EFF)}
      .pos-check.on::after{content:'✓';color:#fff;font-size:12px;font-weight:700;line-height:1}
      .pos-del{width:22px;height:22px;border-radius:4px;border:1px solid transparent;background:transparent;color:var(--tx3,var(--text-muted));cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:14px;font-family:inherit;transition:all 0.15s;padding:0}
      .pos-del:hover{background:var(--red-dim);border-color:color-mix(in srgb, var(--red) 30%, transparent);color:var(--red,#F85149)}
      .pos-num{font-weight:500;min-width:32px;color:var(--tx2,var(--text-dim));text-align:right}
      .pos-dim{width:58px;font-size:11px;font-family:var(--mono,monospace);font-weight:500;padding:3px 5px;border:1px solid var(--bd,var(--border));border-radius:4px;background:var(--bg1,var(--bg-input));color:var(--tx1,var(--text));text-align:center;outline:none;-moz-appearance:textfield}
      .pos-dim::-webkit-inner-spin-button,.pos-dim::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
      .pos-dim:focus{border-color:var(--info,var(--accent))}
      .pos-desc{flex:1;font-size:12px;padding:3px 8px;border:1px solid transparent;border-radius:4px;background:transparent;color:var(--tx1,var(--text));font-family:inherit;outline:none;min-width:80px}.pos-desc:hover{border-color:var(--bd,var(--border))}.pos-desc:focus{border-color:var(--info,var(--accent));background:var(--bg1,var(--bg-input))}
      .pos-badge{font-size:9px;padding:2px 8px;border-radius:4px;background:var(--success-bg,var(--green-dim));color:var(--success,var(--green))}
      .pos-edit{font-size:10px;padding:2px 8px;border:1px solid var(--bd,var(--border));border-radius:4px;background:transparent;color:var(--tx2,var(--text-dim));cursor:pointer;font-family:inherit}.pos-edit:hover{background:var(--bg2,var(--bg-raised));color:var(--tx1,var(--text))}
      .summary2{margin-top:14px;padding:12px 16px;border-radius:8px;background:var(--bg2,var(--bg-raised));font-size:13px;color:var(--tx2,var(--text-dim));line-height:1.7}.summary2 b{color:var(--tx1,var(--text))}
      .profile-sel{font-size:12px;padding:5px 8px;border:2px solid var(--info,var(--accent));border-radius:6px;background:var(--info-bg,var(--accent-dim));color:var(--info,var(--accent));font-family:inherit;font-weight:500;cursor:pointer}
      .profile-sel:focus{outline:none;border-color:var(--info,var(--accent))}
      .profile-sel-sm{font-size:10px;padding:2px 6px;border:1px solid var(--info,var(--accent));border-radius:4px;background:var(--info-bg,var(--accent-dim));color:var(--info,var(--accent));font-family:inherit;font-weight:500;cursor:pointer}
    `}</style>
    <div className="pm">
      {/* Customer / Project Header */}
      {customer && project ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 10, background: 'var(--bg2, var(--bg-raised))', borderRadius: 8, border: '1px solid var(--bd, var(--border))' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>
            {(customer.firstName[0] || '') + (customer.lastName[0] || '')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              {customer.firstName} {customer.lastName}
              {(() => { const qc = customer.projects.reduce((a, p2) => a + (p2.quotes?.length || 0), 0); return qc > 0 ? <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 20, height: 20, borderRadius: 10, background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '0 5px', lineHeight: 1 }}>{qc}</span> : null; })()}
              <span style={{ fontWeight: 400, color: 'var(--tx2, var(--text-dim))', fontSize: 12 }}>— {project.name}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--tx2, var(--text-dim))', display: 'flex', gap: 10, marginTop: 2 }}>
              <span>{customer.email}</span>
              <span>{customer.phone}</span>
              {project.address && <span>{project.address}</span>}
            </div>
          </div>
          {onBackToCustomers && (
            <button style={{ fontSize: 11, padding: '4px 12px', border: '1px solid var(--bd, var(--border))', borderRadius: 6, background: 'transparent', color: 'var(--tx1, var(--text))', cursor: 'pointer', fontFamily: 'inherit' }} onClick={onBackToCustomers}>← Customers</button>
          )}
          {totalPos > 0 && (
            <button style={{ fontSize: 11, padding: '4px 14px', border: '1px solid var(--green, #3FB950)', borderRadius: 6, background: 'var(--green-dim)', color: 'var(--green, #3FB950)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }} onClick={() => setReviewMode(true)}>Review Quote ({totalPos})</button>
          )}
        </div>
      ) : (
        <div style={{ padding: '6px 12px', marginBottom: 8, background: 'var(--bg2, var(--bg-raised))', borderRadius: 6, border: '1px dashed var(--bd, var(--border))', fontSize: 11, color: 'var(--tx3, var(--text-muted))', textAlign: 'center' }}>
          No customer selected — {onBackToCustomers ? <span style={{ color: 'var(--info, var(--accent))', cursor: 'pointer', textDecoration: 'underline' }} onClick={onBackToCustomers}>open from a customer's project</span> : 'open from a customer\'s project'} to link constructions.
        </div>
      )}

      {/* Quotes Bar */}
      {project && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, padding: '6px 10px', background: 'var(--bg2, var(--bg-raised))', borderRadius: 6, border: '1px solid var(--bd, var(--border))', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--tx3, var(--text-muted))', marginRight: 4 }}>Quotes ({savedQuotes.length}):</span>
          {savedQuotes.map((sq, si) => (
            <button key={sq.id} onClick={() => {
              setActiveQuoteId(sq.id); setSelected(new Set()); setCreatingQuote(false);
              if (sq.constructions) setConstructionsLocal(renumber(sq.constructions));
              setQuoteTimer(sq.startedAt || null);
            }}
              style={{ fontSize: 10, padding: '4px 10px', border: activeQuoteId === sq.id ? '2px solid var(--accent, #4A9EFF)' : '1px solid var(--bd, var(--border))', borderRadius: 5, background: activeQuoteId === sq.id ? 'var(--accent-dim)' : 'var(--bg1, var(--bg-card))', color: activeQuoteId === sq.id ? 'var(--accent, #4A9EFF)' : 'var(--tx1, var(--text))', cursor: 'pointer', fontFamily: 'inherit', fontWeight: activeQuoteId === sq.id ? 600 : 400, display: 'flex', alignItems: 'center', gap: 4, maxWidth: 220, overflow: 'hidden' }}>
              <span style={{ fontWeight: 600 }}>Q{si + 1}</span>
              {sq.quoteNumber && <span style={{ fontFamily: 'var(--mono)', fontSize: 9 }}>#{sq.quoteNumber}</span>}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sq.name}</span>
              <span style={{ fontSize: 9, color: 'var(--tx3, var(--text-muted))', flexShrink: 0 }}>{quoteWinCount(sq)}w</span>
            </button>
          ))}
          <button onClick={() => { setCreatingQuote(true); setActiveQuoteId(null); setNewQuoteDesc(''); setNewQuoteDescErr(false); }}
            style={{ fontSize: 10, padding: '4px 12px', border: '1px dashed var(--green, #3FB950)', borderRadius: 5, background: 'var(--green-dim)', color: 'var(--green, #3FB950)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>+ New Quote</button>
          {activeQuoteId && (<>
            <span style={{ flex: 1 }}></span>
            <button onClick={() => setViewingQuoteId(activeQuoteId)}
              style={{ fontSize: 10, padding: '3px 8px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'transparent', color: 'var(--tx2, var(--text-dim))', cursor: 'pointer', fontFamily: 'inherit' }}>View Full</button>
            {!confirmDeleteQuote ? (
              <button onClick={() => setConfirmDeleteQuote(true)}
                style={{ fontSize: 10, padding: '3px 8px', border: '1px solid var(--red, #F85149)', borderRadius: 4, background: 'var(--red-dim)', color: 'var(--red, #F85149)', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
            ) : (
              <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button onClick={() => { if (onDeleteQuote) onDeleteQuote(activeQuoteId); setActiveQuoteId(null); setConstructionsLocal([]); setConfirmDeleteQuote(false); }}
                  style={{ fontSize: 10, padding: '3px 8px', border: '1px solid var(--red)', borderRadius: 4, background: 'var(--red, #F85149)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Yes</button>
                <button onClick={() => setConfirmDeleteQuote(false)}
                  style={{ fontSize: 10, padding: '3px 8px', border: '1px solid var(--bd)', borderRadius: 4, background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }}>No</button>
              </span>
            )}
          </>)}
        </div>
      )}

      {/* Quote Initialization Form */}
      {creatingQuote && (
        <div style={{ padding: '16px 20px', marginBottom: 10, background: 'var(--bg1, var(--bg-card))', borderRadius: 8, border: '2px solid var(--green, #3FB950)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--green, #3FB950)' }}>Initialize New Quote</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Quote Number (auto)</div>
              <div style={{ fontSize: 16, fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--text)', padding: '4px 12px', background: 'var(--bg-raised)', borderRadius: 5, border: '1px solid var(--border)' }}>
                #{getNextQuoteNumber()}/{sellerCode}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>Description <span style={{ color: 'var(--red)' }}>*</span></div>
              <input type="text" value={newQuoteDesc} onChange={e => { setNewQuoteDesc(e.target.value); if (e.target.value.trim()) setNewQuoteDescErr(false); }}
                placeholder="e.g. Black windows with triple glass..."
                onKeyDown={e => { if (e.key === 'Enter') initializeQuote(); }}
                style={{ width: '100%', fontSize: 13, padding: '6px 10px', border: newQuoteDescErr ? '2px solid var(--red)' : '1px solid var(--border)', borderRadius: 5, background: 'var(--bg-input)', color: 'var(--text)', fontFamily: 'inherit' }} />
              {newQuoteDescErr && <div style={{ fontSize: 10, color: 'var(--red)', marginTop: 2 }}>Description is required</div>}
            </div>
            <button onClick={initializeQuote}
              style={{ fontSize: 13, padding: '6px 20px', border: '1px solid var(--green, #3FB950)', borderRadius: 6, background: 'var(--green-dim)', color: 'var(--green, #3FB950)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Save & Start</button>
            <button onClick={() => setCreatingQuote(false)}
              style={{ fontSize: 12, padding: '6px 14px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8 }}>Timer starts when you save. All windows will belong to this quote.</div>
        </div>
      )}

      {/* No Active Quote */}
      {!activeQuoteId && !creatingQuote && project && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: 13 }}>
          Select an existing quote or <span onClick={() => setCreatingQuote(true)} style={{ color: 'var(--green, #3FB950)', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}>create a new one</span> to start working.
        </div>
      )}


      {/* ── Active quote info banner ── */}
      {activeQuoteId && (() => { const aq = savedQuotes.find(q2 => q2.id === activeQuoteId); return aq ? (
        <div style={{ padding: '6px 12px', marginBottom: 8, background: 'var(--accent-dim)', borderRadius: 6, border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)', fontSize: 11, color: 'var(--accent, #4A9EFF)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 600 }}>Active quote:</span> {(aq.quoteNumber || aq.number) ? `#${aq.quoteNumber || aq.number} — ` : ''}{aq.name} · {quoteWinCount(aq)} windows · {aq.date}
          {aq.startedAt && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--tx3)' }}>started {new Date(aq.startedAt).toLocaleTimeString()}</span>}
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--tx3, var(--text-muted))' }}>Add constructions, then Save as Quote to update</span>
        </div>
      ) : null; })()}

      {activeQuoteId && (<>
      <div className="pm-hdr">
        <h2>{customer && project ? project.name : t('project')}</h2>
        <div className="rt">
          {totalPos > 0 && (
            <button style={{ fontSize: 11, padding: '4px 14px', border: '1px solid var(--green, #3FB950)', borderRadius: 6, background: 'var(--green-dim)', color: 'var(--green, #3FB950)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }} onClick={() => setReviewMode(true)}>Review Quote ({totalPos})</button>
          )}
          <span className="stats">{constructions.length} / {totalPos} {t('units')}</span>
          <div className="lang2">
            {['ru', 'en', 'es'].map(l => (<button key={l} className={lang === l ? 'on' : ''} onClick={() => setLang(l)}>{l.toUpperCase()}</button>))}
          </div>
        </div>
      </div>

      {/* ── Quick Presets ── */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
        {presets.map((p, i) => (
          <button key={i} onClick={() => quickAdd(p.w, p.h, p.t, p.q, p.d)}
            style={{ flex: 1, padding: '8px 12px', fontSize: 12, fontWeight: 500, border: '1px solid var(--bd, var(--border))', borderRadius: 6, background: 'var(--bg2, var(--bg-raised))', color: 'var(--tx1, var(--text))', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center', lineHeight: 1.3 }}>
            <div style={{ fontWeight: 600 }}>{p.l.split(' ').slice(0, -1).join(' ')}</div>
            <div style={{ fontSize: 10, color: 'var(--tx3, var(--text-muted))', marginTop: 2 }}>{p.w}×{p.h} mm</div>
          </button>
        ))}
      </div>

      {/* ── AI Assistant ── */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, padding: '6px 10px', background: voiceProcessing ? 'var(--accent-dim)' : 'var(--bg2, var(--bg-raised))', borderRadius: 6, border: `1px solid ${voiceProcessing ? 'color-mix(in srgb, var(--accent) 30%, transparent)' : 'var(--bd, var(--border))'}` }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>🤖</span>
        {!voiceResult ? (
          <input type="text" value={voiceTranscript} onChange={e => setVoiceTranscript(e.target.value)}
            placeholder='e.g. "5 fixed windows 1000x1500, black exterior" or "два ПО+ПО 2000x1400"'
            disabled={voiceProcessing}
            onKeyDown={e => { if (e.key === 'Enter' && voiceTranscript.trim()) processVoiceCommand(voiceTranscript.trim()); }}
            style={{ flex: 1, fontSize: 12, padding: '6px 10px', border: '1px solid var(--bd, var(--border))', borderRadius: 5, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit' }} />
        ) : (
          <div style={{ flex: 1, fontSize: 12, color: voiceResult.ok ? 'var(--green, #3FB950)' : 'var(--red, #F85149)', padding: '4px 0' }}>
            {voiceResult.ok ? '✓' : '✗'} {voiceResult.msg}
          </div>
        )}
        {voiceProcessing ? (
          <span style={{ fontSize: 11, color: 'var(--accent)', flexShrink: 0, padding: '0 8px' }}>Processing...</span>
        ) : voiceResult ? (
          <button onClick={() => { setVoiceResult(null); setVoiceTranscript(''); }}
            style={{ fontSize: 10, padding: '4px 10px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'transparent', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>New</button>
        ) : (
          <button onClick={() => { if (voiceTranscript.trim()) processVoiceCommand(voiceTranscript.trim()); }}
            disabled={!voiceTranscript.trim() || voiceProcessing}
            style={{ fontSize: 11, padding: '4px 14px', border: '1px solid var(--accent, #4A9EFF)', borderRadius: 5, background: voiceTranscript.trim() ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent', color: voiceTranscript.trim() ? 'var(--accent, #4A9EFF)' : 'var(--text-muted)', cursor: voiceTranscript.trim() ? 'pointer' : 'default', fontFamily: 'inherit', fontWeight: 600, flexShrink: 0 }}>AI Add</button>
        )}
      </div>

      {/* ── Custom Construction ── */}
      <div className="add-bar" style={{ flexWrap: 'nowrap' }}>
        <label>{t('newConstr')}:</label>
        <input type="number" value={nw} min={constraints?.minW || 300} max={constraints?.maxW || 5500} step={10} onChange={e => setNw(+e.target.value || 1500)} />
        <span style={{ fontSize: 11, color: 'var(--tx3, var(--text-muted))' }}>x</span>
        <input type="number" value={nh} min={constraints?.minH || 300} max={constraints?.maxH || 3000} step={10} onChange={e => setNh(+e.target.value || 1400)} />
        <label>{t('qty')}:</label>
        <input type="number" value={nq} min={1} max={50} style={{ width: 48 }} onChange={e => setNq(+e.target.value || 1)} />
        <label>{t('type')}:</label>
        <select value={nt} onChange={e => setNt(e.target.value)}>
          {Object.keys(PM_L[lang].types).map(k => <option key={k} value={k}>{tt(k)}</option>)}
        </select>
        <label>Profile:</label>
        <select className="profile-sel" value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)}>
          {profiles.map(p => <option key={p.id} value={p.id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>)}
        </select>
        <button onClick={addConstr}>{t('add')}</button>
      </div>

      {/* ── Options: Colors, Hinges, Accessories, Muntins ── */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: 10, padding: '8px 12px', background: 'var(--bg2, var(--bg-raised))', borderRadius: 8, border: '1px solid var(--bd, var(--border))' }}>

        {/* Profile Color — Exterior */}
        <div style={{ minWidth: 100 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--tx3, var(--text-muted))', marginBottom: 4 }}>Color Ext.</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {colors.profile.map(c2 => (
              <div key={c2.id} onClick={() => setSelColorExt(c2.id)} title={c2.name + (c2.ral ? ' ' + c2.ral : '')}
                style={{ width: 22, height: 22, borderRadius: 4, background: c2.hex, cursor: 'pointer',
                  border: selColorExt === c2.id ? '2px solid var(--info, var(--accent))' : '2px solid var(--swatch-border)',
                  transition: 'border 0.15s' }} />
            ))}
          </div>
        </div>

        {/* Profile Color — Interior */}
        <div style={{ minWidth: 100 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--tx3, var(--text-muted))', marginBottom: 4 }}>Color Int.</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {colors.profile.map(c2 => (
              <div key={c2.id} onClick={() => setSelColorInt(c2.id)} title={c2.name + (c2.ral ? ' ' + c2.ral : '')}
                style={{ width: 22, height: 22, borderRadius: 4, background: c2.hex, cursor: 'pointer',
                  border: selColorInt === c2.id ? '2px solid var(--info, var(--accent))' : '2px solid var(--swatch-border)',
                  transition: 'border 0.15s' }} />
            ))}
          </div>
        </div>

        {/* Handle Color */}
        <div style={{ minWidth: 80 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--tx3, var(--text-muted))', marginBottom: 4 }}>Handles</div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {colors.handle.map(c2 => (
              <div key={c2.id} onClick={() => setSelHandleColor(c2.id)} title={c2.name}
                style={{ width: 18, height: 18, borderRadius: 3, background: c2.hex, cursor: 'pointer',
                  border: selHandleColor === c2.id ? '2px solid var(--info, var(--accent))' : '2px solid var(--swatch-border)',
                  transition: 'border 0.15s' }} />
            ))}
          </div>
        </div>

        {/* Hinges */}
        <div style={{ minWidth: 80 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--tx3, var(--text-muted))', marginBottom: 4 }}>Hinges</div>
          <div className="tog" style={{ fontSize: 10 }}>
            <button className={selHinges === 'visible' ? 'on' : ''} onClick={() => setSelHinges('visible')}>Visible</button>
            <button className={selHinges === 'hidden' ? 'on' : ''} onClick={() => setSelHinges('hidden')}>Hidden</button>
          </div>
        </div>

        {/* Glass */}
        <div style={{ minWidth: 140 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--tx3, var(--text-muted))', marginBottom: 4 }}>Glass Unit</div>
          <select style={{ fontSize: 11, padding: '3px 6px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit', width: '100%' }}
            value={selGlass} onChange={e => setSelGlass(e.target.value)}>
            {glass.map(g => <option key={g.id} value={g.id}>{g.name} (U={g.uValue})</option>)}
          </select>
        </div>

        {/* Nailing Fins */}
        <div style={{ minWidth: 110 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--tx3, var(--text-muted))', marginBottom: 4 }}>Nailing Fin</div>
          <select style={{ fontSize: 11, padding: '3px 6px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit', width: '100%' }}
            value={selNailingFin} onChange={e => setSelNailingFin(e.target.value)}>
            <option value="none">None</option>
            {nfOptions.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        {/* Muntins */}
        <div style={{ minWidth: 140 }}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--tx3, var(--text-muted))', marginBottom: 4 }}>Muntins (all sections)</div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <select style={{ fontSize: 11, padding: '2px 4px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit', width: 44 }}
              value={selMuntinCols} onChange={e => setSelMuntinCols(+e.target.value)}>
              <option value={0}>—</option>
              {[1,2,3,4,5,6].map(i => <option key={i} value={i}>{i}c</option>)}
            </select>
            <span style={{ fontSize: 10, color: 'var(--tx3, var(--text-muted))' }}>×</span>
            <select style={{ fontSize: 11, padding: '2px 4px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit', width: 44 }}
              value={selMuntinRows} onChange={e => setSelMuntinRows(+e.target.value)}>
              <option value={0}>—</option>
              {[1,2,3,4,5,6].map(i => <option key={i} value={i}>{i}r</option>)}
            </select>
            <select style={{ fontSize: 10, padding: '2px 4px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit', width: 48 }}
              value={selMuntinWidth} onChange={e => setSelMuntinWidth(e.target.value)}>
              <option value="5/8">5/8"</option>
              <option value="1">1"</option>
            </select>
          </div>
        </div>

        {/* Summary line */}
        <div style={{ width: '100%', fontSize: 9, color: 'var(--tx3, var(--text-muted))', borderTop: '1px solid var(--bd, var(--border))', paddingTop: 4, marginTop: 2 }}>
          {(() => {
            const extC = colors.profile.find(x => x.id === selColorExt);
            const intC = colors.profile.find(x => x.id === selColorInt);
            const hC = colors.handle.find(x => x.id === selHandleColor);
            const nf = nfOptions.find(x => x.id === selNailingFin);
            const parts = [];
            if (extC && intC) {
              parts.push(extC.id === intC.id ? `Color: ${extC.name}` : `Ext: ${extC.name} / Int: ${intC.name}`);
            }
            if (hC) parts.push(`Handle: ${hC.name}`);
            parts.push(`Hinges: ${selHinges}`);
            if (nf) parts.push(`Fin: ${nf.name}`);
            const glassItem = glass.find(g => g.id === selGlass);
            if (glassItem) parts.push(`Glass: ${glassItem.name}`);
            if (selMuntinCols > 0 && selMuntinRows > 0) parts.push(`Muntins: ${selMuntinCols}×${selMuntinRows} ${selMuntinWidth}"`);
            return parts.join(' · ');
          })()}
        </div>
      </div>

      {constructions.length === 0 && (<div style={{ textAlign: 'center', padding: '2rem', color: 'var(--tx3, var(--text-muted))' }}>{t('empty')}</div>)}

      {/* ── Bulk Edit Toolbar ── */}
      {totalPos > 0 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10, padding: '6px 10px', background: selectedCount > 0 ? 'var(--accent-dim)' : 'var(--bg2, var(--bg-raised))', borderRadius: 6, border: selectedCount > 0 ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid var(--bd, var(--border))', fontSize: 11 }}>
          <button style={{ fontSize: 10, padding: '3px 8px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'transparent', color: 'var(--tx1, var(--text))', cursor: 'pointer', fontFamily: 'inherit' }} onClick={selectedCount > 0 ? deselectAll : selectAll}>
            {selectedCount > 0 ? `Deselect (${selectedCount})` : 'Select All'}
          </button>
          {selectedCount > 0 && (<>
            <span style={{ color: 'var(--accent, #4A9EFF)', fontWeight: 500 }}>{selectedCount} selected</span>
            <span style={{ borderLeft: '1px solid var(--bd, var(--border))', height: 16 }}></span>
            <label style={{ fontSize: 10, color: 'var(--tx2, var(--text-dim))' }}>Glass:</label>
            <select style={{ fontSize: 10, padding: '2px 4px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit' }} value={bulkGlass} onChange={e => setBulkGlass(e.target.value)}>
              <option value="">—</option>
              {glass.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <label style={{ fontSize: 10, color: 'var(--tx2, var(--text-dim))' }}>Profile:</label>
            <select style={{ fontSize: 10, padding: '2px 4px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit' }} value={bulkProfile} onChange={e => setBulkProfile(e.target.value)}>
              <option value="">—</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <label style={{ fontSize: 10, color: 'var(--tx2, var(--text-dim))' }}>Ext:</label>
            <div style={{ display: 'flex', gap: 2 }}>
              {colors.profile.map(c2 => (
                <div key={c2.id} onClick={() => setBulkColorExt(bulkColorExt === c2.id ? '' : c2.id)} style={{ width: 16, height: 16, borderRadius: 3, background: c2.hex, cursor: 'pointer', border: bulkColorExt === c2.id ? '2px solid var(--accent)' : '1px solid var(--swatch-border)' }} title={c2.name} />
              ))}
            </div>
            <label style={{ fontSize: 10, color: 'var(--tx2, var(--text-dim))' }}>Int:</label>
            <div style={{ display: 'flex', gap: 2 }}>
              {colors.profile.map(c2 => (
                <div key={c2.id} onClick={() => setBulkColorInt(bulkColorInt === c2.id ? '' : c2.id)} style={{ width: 16, height: 16, borderRadius: 3, background: c2.hex, cursor: 'pointer', border: bulkColorInt === c2.id ? '2px solid var(--accent)' : '1px solid var(--swatch-border)' }} title={c2.name} />
              ))}
            </div>
            <label style={{ fontSize: 10, color: 'var(--tx2, var(--text-dim))' }}>Hinges:</label>
            <select style={{ fontSize: 10, padding: '2px 4px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit' }} value={bulkHinges} onChange={e => setBulkHinges(e.target.value)}>
              <option value="">—</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
            <button style={{ fontSize: 10, padding: '3px 10px', border: '1px solid var(--accent, #4A9EFF)', borderRadius: 4, background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent, #4A9EFF)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }} onClick={bulkApply}>Apply to Selected</button>
            <button style={{ fontSize: 10, padding: '3px 10px', border: '1px solid var(--purple, #A371F7)', borderRadius: 4, background: 'color-mix(in srgb, var(--purple) 12%, transparent)', color: 'var(--purple, #A371F7)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }} onClick={createNewQuoteWithChanges}>→ New Quote with Changes</button>
          </>)}
          <span style={{ flex: 1 }}></span>
          {totalPos > 0 && (
            <button style={{ fontSize: 10, padding: '3px 10px', border: '1px solid var(--green, #3FB950)', borderRadius: 4, background: 'var(--green-dim)', color: 'var(--green, #3FB950)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }} onClick={createNewQuote}>Save as Quote</button>
          )}
        </div>
      )}
      <div className="ccard-grid">
      {constructions.map(c => {
        const cProf = profiles.find(p => p.id === c.profileId) || profile;
        return (<div key={c.id} className="ccard">
        <div className="cc-top">
          <div className="cc-thumb" dangerouslySetInnerHTML={{ __html: drawThumb(c.w, c.h, c.type) }} />
          <div className="cc-info">
            <p className="cn">#{c.id} — {c.w} x {c.h} mm</p>
            <p className="cd">{tt(c.type)} | {c.positions.length} {t('units')}</p>
            <p className="cd" style={{ marginTop: 2 }}>
              <select className="profile-sel-sm" value={c.profileId || selectedProfile}
                onChange={e => setConstructions(prev => prev.map(x => String(x.id) === String(c.id) ? { ...x, profileId: e.target.value } : x))}>
                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>)}
              </select>
            </p>
            {c.defaults && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3, flexWrap: 'wrap' }}>
                {(() => {
                  const d = c.defaults;
                  const extC = colors.profile.find(x => x.id === d.colorExt);
                  const intC = colors.profile.find(x => x.id === d.colorInt);
                  return <>
                    {extC && <div title={'Ext: ' + extC.name} style={{ width: 14, height: 14, borderRadius: 3, background: extC.hex, border: '1px solid var(--swatch-border)', flexShrink: 0 }} />}
                    {intC && extC?.id !== intC?.id && <><span style={{ fontSize: 8, color: 'var(--tx3, var(--text-muted))' }}>/</span><div title={'Int: ' + intC.name} style={{ width: 14, height: 14, borderRadius: 3, background: intC.hex, border: '1px solid var(--swatch-border)', flexShrink: 0 }} /></>}
                    <span style={{ fontSize: 9, color: 'var(--tx2, var(--text-dim))' }}>{d.hinges === 'hidden' ? 'hidden hinges' : 'vis. hinges'}</span>
                    {d.nailingFin && d.nailingFin !== 'none' && <span style={{ fontSize: 9, color: 'var(--tx2, var(--text-dim))' }}>· fin</span>}
                    {d.muntin && <span style={{ fontSize: 9, color: 'var(--tx2, var(--text-dim))' }}>· {d.muntin.cols}×{d.muntin.rows} {d.muntin.width}"</span>}
                  </>;
                })()}
              </div>
            )}
          </div>
          <div className="cc-acts">
            <button onClick={() => addPos(c.id)}>{t('addPos')}</button>
            <button onClick={() => dupConstr(c.id)}>{t('copy')}</button>
            <button className="del" onClick={() => delConstr(c.id)}>{t('remove')}</button>
          </div>
        </div>
        <div className="positions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0 4px', fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--tx3, var(--text-muted))' }}>
            <span style={{ width: 18 }}></span>
            <span style={{ minWidth: 32, textAlign: 'right' }}>#</span>
            <span style={{ width: 58, textAlign: 'center' }}>W</span>
            <span style={{ width: 10 }}></span>
            <span style={{ width: 58, textAlign: 'center' }}>H</span>
            <span style={{ flex: 1 }}>Description</span>
            <span style={{ width: 130 }}>Glass</span>
            <span style={{ minWidth: 130, textAlign: 'right' }}>{t('positions')} ({c.positions.length})</span>
          </div>
          {c.positions.map((p, pi) => {
            const selKey = c.id + ':' + pi;
            const isSel = selected.has(selKey);
            return (<div key={pi} className="pos-row" style={isSel ? { background: 'var(--accent-dim)' } : {}}>
            <div className={`pos-check${isSel ? ' on' : ''}`} onClick={() => toggleSel(c.id, pi)} />
            <span className="pos-num">{p.idx}.</span>
            <input className="pos-dim" type="number" value={p.posW || c.w} onChange={e => setPosDim(c.id, pi, 'posW', e.target.value)} title="Width mm" />
            <span style={{ fontSize: 9, color: 'var(--tx3, var(--text-muted))' }}>×</span>
            <input className="pos-dim" type="number" value={p.posH || c.h} onChange={e => setPosDim(c.id, pi, 'posH', e.target.value)} title="Height mm" />
            <input className="pos-desc" type="text" defaultValue={p.desc || ''} placeholder={t('descPH')} onBlur={e => setDesc(c.id, pi, e.target.value)} />
            <select style={{ fontSize: 10, padding: '2px 4px', border: '1px solid var(--bd, var(--border))', borderRadius: 4, background: 'var(--bg1, var(--bg-input))', color: 'var(--tx1, var(--text))', fontFamily: 'inherit', width: 130, flexShrink: 0 }}
              value={p.posGlass || glass[0]?.id || ''} onChange={e => setConstructions(prev => prev.map(c2 => String(c2.id) === String(c.id) ? { ...c2, positions: c2.positions.map((pp, j) => j === pi ? { ...pp, posGlass: e.target.value } : pp) } : c2))}>
              {glass.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            {((p.posW && p.posW !== c.w) || (p.posH && p.posH !== c.h)) && <span className="pos-badge" style={{ background: 'var(--accent-dim, color-mix(in srgb, var(--accent) 15%, transparent))', color: 'var(--accent, #4A9EFF)' }}>custom</span>}
            {p.tweaks && <span className="pos-badge">{t('configured')}</span>}
            <button className="pos-edit" onClick={e => { e.stopPropagation(); setEditingConstr(c.id); }}>{t('configure')}</button>
            <button className="pos-del" title="Delete this position" onClick={() => delPos(c.id, pi)}>×</button>
          </div>);
          })}
        </div>
      </div>); })}
      </div>
      {totalPos > 0 && (<div className="summary2">
        <b>{totalPos}</b> {t('wip')}: {(() => {
          const gr = {};
          constructions.forEach(c => { const pName = (profiles.find(p => p.id === c.profileId) || profile)?.name || ''; const k = c.w + 'x' + c.h + ' ' + tt(c.type) + ' [' + pName + ']'; gr[k] = (gr[k] || 0) + c.positions.length; });
          return Object.entries(gr).map(([k, v]) => v + 'x ' + k).join(', ');
        })()}
      </div>)}
      </>)}
    </div>
  </div>);
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
  { key: "constraints", label: "Constraints", icon: Icons.settings },
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
  constraints: { title: "Constraints", sub: "Size limits, sash dimensions, glazing rules, mullion requirements" },
  users: { title: "Users & Access", sub: "Accounts, roles, permissions, enable/disable users" },
};

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('deca-theme') || 'dark'; } catch { return 'dark'; }
  });
  const [page, setPage] = useState("settings");
  const [section, setSection] = useState("profiles");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('deca-sidebar') === 'collapsed'; } catch { return false; }
  });
  const [sidebarPinned, setSidebarPinned] = useState(() => {
    try { return localStorage.getItem('deca-sidebar-pin') !== 'unpinned'; } catch { return true; }
  });
  const sidebarTimer = useRef(null);
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [colors, setColors] = useState(INITIAL_COLORS);
  const [muntins, setMuntins] = useState(INITIAL_MUNTINS);
  const [glass, setGlass] = useState(INITIAL_GLASS);
  const [hardware, setHardware] = useState(INITIAL_HARDWARE);
  const [accessories, setAccessories] = useState(INITIAL_ACCESSORIES);
  const [screens, setScreens] = useState(INITIAL_SCREENS);
  const [constraints, setConstraints] = useState(INITIAL_CONSTRAINTS);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [builderSection, setBuilderSection] = useState("customers");
  const [activeCustomerId, setActiveCustomerId] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [pendingQuoteId, setPendingQuoteId] = useState(null);
  const [constraintsDirty, setConstraintsDirty] = useState(false);

  // ── Persistent storage: load on mount with migration ──
  const DATA_VERSION = 3;

  const migrateData = (s) => {
    // Migrate old format → new format, filling missing fields
    try {
      // Profiles: ensure frame/sash/mullion/glass sub-objects
      if (s.profiles && Array.isArray(s.profiles)) {
        s.profiles = s.profiles.map(p => ({
          ...p,
          frame: p.frame || { section: 72, int: 46, bead: 26, depth: 74 },
          sash: p.sash || { ext: 44, int: 54, bead: 16, overlap: 8 },
          mullion: p.mullion || { total: 94, visible: 42, rebate: 26 },
          glass: p.glass || { shim: 5 },
        }));
      }
      // Colors: ensure profile + handle arrays
      if (s.colors && !s.colors.profile) {
        s.colors = INITIAL_COLORS;
      }
      // Customers: ensure projects have constructions[], quotes have items[]
      if (s.customers && Array.isArray(s.customers)) {
        s.customers = s.customers.map(c => ({
          ...c,
          firstName: c.firstName || c.name?.split(' ')[0] || 'Unknown',
          lastName: c.lastName || c.name?.split(' ').slice(1).join(' ') || '',
          email: c.email || '',
          phone: c.phone || '',
          projects: (c.projects || []).map(p => ({
            ...p,
            constructions: p.constructions || [],
            quotes: (p.quotes || []).map(q => ({
              ...q,
              items: q.items || [],
              invoices: q.invoices || [],
            })),
          })),
        }));
      }
      // Users: ensure permissions object
      if (s.users && Array.isArray(s.users)) {
        s.users = s.users.map(u => ({
          ...u,
          permissions: u.permissions || { profiles: [], colors: true, muntins: true, glass: true, hardware: true, accessories: true, screens: true, canCreateOrders: false, canEditPricing: false, canManageUsers: false },
        }));
      }
      // Constraints: migrate flat format to grouped
      if (s.constraints && !s.constraints._groups) {
        const c = s.constraints;
        s.constraints = { ...INITIAL_CONSTRAINTS, ...c, _groups: INITIAL_CONSTRAINTS._groups.map(g => ({
          ...g, items: g.items.map(it => ({ ...it, value: c[it.key] !== undefined ? c[it.key] : it.value }))
        }))};
      }
    } catch (e) {
      // If migration fails on any field, continue with what we have
    }
    return s;
  };

  useEffect(() => {
    (async () => {
      let loaded_data = null;

      // 1. Try new versioned key first
      try {
        const r = await window.storage.get('deca-app-state-v3');
        if (r && r.value) {
          const s = JSON.parse(r.value);
          if (s._v === DATA_VERSION) loaded_data = s;
        }
      } catch (e) {}

      // 2. If no v3 data, try migrating from old key
      if (!loaded_data) {
        try {
          const r = await window.storage.get('deca-app-state');
          if (r && r.value) {
            const s = JSON.parse(r.value);
            loaded_data = migrateData(s);
            loaded_data._v = DATA_VERSION;
            // Save migrated data to new key (old key stays untouched)
            try { await window.storage.set('deca-app-state-v3', JSON.stringify(loaded_data)); } catch(e2) {}
          }
        } catch (e) {}
      }

      // 3. Apply loaded data
      if (loaded_data) {
        try {
          if (loaded_data.profiles && Array.isArray(loaded_data.profiles) && loaded_data.profiles.length > 0 && loaded_data.profiles[0].frame) setProfiles(loaded_data.profiles);
          if (loaded_data.colors && loaded_data.colors.profile && loaded_data.colors.handle) setColors(loaded_data.colors);
          if (loaded_data.muntins && Array.isArray(loaded_data.muntins)) setMuntins(loaded_data.muntins);
          if (loaded_data.glass && Array.isArray(loaded_data.glass)) setGlass(loaded_data.glass);
          if (loaded_data.hardware && Array.isArray(loaded_data.hardware)) setHardware(loaded_data.hardware);
          if (loaded_data.accessories && Array.isArray(loaded_data.accessories)) setAccessories(loaded_data.accessories);
          if (loaded_data.screens && Array.isArray(loaded_data.screens)) setScreens(loaded_data.screens);
          if (loaded_data.constraints && typeof loaded_data.constraints === 'object') {
            // Migrate flat constraints to grouped format
            if (!loaded_data.constraints._groups) {
              const c = loaded_data.constraints;
              loaded_data.constraints = {
                ...INITIAL_CONSTRAINTS, ...c,
                _groups: INITIAL_CONSTRAINTS._groups.map(g => ({
                  ...g, items: g.items.map(it => ({ ...it, value: c[it.key] !== undefined ? c[it.key] : it.value }))
                }))
              };
            }
            setConstraints(loaded_data.constraints);
          }
          if (loaded_data.users && Array.isArray(loaded_data.users)) setUsers(loaded_data.users);
          if (loaded_data.customers && Array.isArray(loaded_data.customers)) setCustomers(loaded_data.customers);
        } catch (e) {
          // If applying data crashes, fall back to defaults (already set)
        }
      }

      setLoaded(true);
    })();
  }, []);

  // ── Persistent storage: save on changes (debounced) ──
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await window.storage.set('deca-app-state-v3', JSON.stringify({
          _v: DATA_VERSION,
          profiles, colors, muntins, glass, hardware, accessories, screens, users, customers, constraints,
        }));
      } catch (e) {}
    }, 500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [loaded, profiles, colors, muntins, glass, hardware, accessories, screens, users, customers, constraints]);

  // Derived: active customer and project
  const activeCustomer = customers.find(c => c.id === activeCustomerId) || null;
  const activeProject = activeCustomer?.projects.find(p => p.id === activeProjectId) || null;

  const openProject = (custId, projId) => {
    setActiveCustomerId(custId);
    setActiveProjectId(projId);
    setPendingQuoteId(null);
    setBuilderSection("projects");
  };

  const openQuote = (custId, projId, quoteId) => {
    setActiveCustomerId(custId);
    setActiveProjectId(projId);
    setPendingQuoteId(quoteId);
    setBuilderSection("projects");
  };

  const updateProjectConstructions = (custId, projId, constrs) => {
    setCustomers(prev => prev.map(c => c.id === custId ? {
      ...c, projects: c.projects.map(p => p.id === projId ? { ...p, constructions: constrs } : p)
    } : c));
  };

  const saveQuoteToProject = (custId, projId, quote) => {
    setCustomers(prev => prev.map(c => c.id === custId ? {
      ...c, projects: c.projects.map(p => p.id === projId ? {
        ...p, quotes: [...(p.quotes || []), quote]
      } : p)
    } : c));
  };

  const deleteQuoteFromProject = (custId, projId, quoteId) => {
    setCustomers(prev => prev.map(c => c.id === custId ? {
      ...c, projects: c.projects.map(p => p.id === projId ? {
        ...p, quotes: (p.quotes || []).filter(q => q.id !== quoteId)
      } : p)
    } : c));
  };

  const updateQuoteInProject = (custId, projId, quoteId, constrs) => {
    setCustomers(prev => prev.map(c => c.id === custId ? {
      ...c, projects: c.projects.map(p => p.id === projId ? {
        ...p, quotes: (p.quotes || []).map(q => q.id === quoteId ? {
          ...q, constructions: constrs,
          items: (() => {
            const items = [];
            constrs.forEach(cn => {
              (cn.positions || []).forEach((pos) => {
                items.push({
                  w: pos.posW || cn.w, h: pos.posH || cn.h,
                  type: cn.type, profileId: cn.profileId,
                  desc: pos.desc, idx: pos.idx, defaults: cn.defaults,
                  glassId: pos.posGlass, posGlass: pos.posGlass,
                });
              });
            });
            return items;
          })(),
        } : q)
      } : p)
    } : c));
  };

  const counts = {
    profiles: profiles.length,
    colors: colors.profile.length + colors.handle.length,
    muntins: muntins.length,
    glass: glass.length,
    hardware: hardware.length,
    accessories: accessories.length,
    screens: screens.length,
    constraints: (constraints?._groups || []).reduce((a, g) => a + g.items.length, 0),
    users: users.length,
  };

  const meta = SECTION_META[section] || { title: section, sub: '' };
  const sc = sidebarCollapsed;

  const toggleSidebar = () => {
    const next = !sc;
    setSidebarCollapsed(next);
    try { localStorage.setItem('deca-sidebar', next ? 'collapsed' : 'expanded'); } catch {}
    if (sidebarTimer.current) clearTimeout(sidebarTimer.current);
    // If expanding and NOT pinned, auto-collapse after 3s
    if (!next && !sidebarPinned) {
      sidebarTimer.current = setTimeout(() => setSidebarCollapsed(true), 3000);
    }
  };

  const togglePin = () => {
    const next = !sidebarPinned;
    setSidebarPinned(next);
    try { localStorage.setItem('deca-sidebar-pin', next ? 'pinned' : 'unpinned'); } catch {}
    if (sidebarTimer.current) clearTimeout(sidebarTimer.current);
    // If unpinning while open, start auto-collapse timer
    if (!next && !sc) {
      sidebarTimer.current = setTimeout(() => setSidebarCollapsed(true), 3000);
    }
  };

  const ToggleBtn = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <button className="sidebar-toggle" onClick={toggleSidebar} title={sc ? "Expand" : "Collapse"}>
        {sc ? Icons.collapseR : Icons.collapseL}
      </button>
      {!sc && (
        <button className="sidebar-toggle" onClick={togglePin} title={sidebarPinned ? "Unpin (auto-collapse)" : "Pin open"}
          style={{ opacity: sidebarPinned ? 1 : 0.4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={sidebarPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M12 2v8m-4-4l8 0m-8 8h8l2 4H6l2-4z"/>
          </svg>
        </button>
      )}
    </div>
  );

  const guardedNav = (action) => {
    if (constraintsDirty) {
      if (!confirm('You have unsaved constraint changes. Discard and leave?')) return;
      setConstraintsDirty(false);
    }
    action();
  };

  const BUILDER_NAV = [
    { key: "projects", label: "Projects", icon: Icons.project },
    { key: "configure", label: "Configurator", icon: Icons.configure },
    { key: "customers", label: "Customers", icon: Icons.customer },
    { key: "quotes", label: "Quotes", icon: Icons.quote },
  ];

  const resetAllData = async () => {
    if (!confirm('Reset all data to defaults? This cannot be undone.')) return;
    try { await window.storage.delete('deca-app-state-v3'); } catch(e) {}
    setProfiles(INITIAL_PROFILES); setColors(INITIAL_COLORS); setMuntins(INITIAL_MUNTINS);
    setGlass(INITIAL_GLASS); setHardware(INITIAL_HARDWARE); setAccessories(INITIAL_ACCESSORIES);
    setScreens(INITIAL_SCREENS); setConstraints(INITIAL_CONSTRAINTS); setUsers(INITIAL_USERS); setCustomers(INITIAL_CUSTOMERS);
  };

  if (!loaded) return <div data-theme={theme === 'dark' ? undefined : theme} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--text-dim)', fontFamily: 'system-ui' }}><style>{CSS}</style>Loading...</div>;

  const cycleTheme = () => {
    const themes = ['dark', 'anthropic', 'light'];
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
    try { localStorage.setItem('deca-theme', next); } catch {}
  };
  const themeIcons = { dark: '🌙', anthropic: '☕', light: '☀️' };
  const themeLabels = { dark: 'Dark', anthropic: 'Anthropic', light: 'Light' };

  return (
    <div data-theme={theme === 'dark' ? undefined : theme} style={{ height: '100%' }}>
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
              onClick={() => guardedNav(() => setPage("builder"))}
            >
              <span className="tab-icon">{Icons.builder}</span>
              Window Builder
            </div>
            <div
              className={`topbar-tab ${page === "settings" ? "active" : ""}`}
              onClick={() => guardedNav(() => setPage("settings"))}
            >
              <span className="tab-icon">{Icons.settings}</span>
              Settings
            </div>
          </div>
          <div className="topbar-right">
            <button onClick={cycleTheme} title={`Theme: ${themeLabels[theme]}`}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 5, background: 'var(--bg-card)', color: 'var(--text-dim)', cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ fontSize: 14 }}>{themeIcons[theme]}</span>
              <span>{themeLabels[theme]}</span>
            </button>
            <button className="btn-icon" title="Reset all data to defaults" onClick={resetAllData} style={{ opacity: 0.5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
            </button>
            <span className="text-xs text-muted">{users.find(u => u.role === "admin")?.name || "Admin"}</span>
            <div className="topbar-avatar">{users.find(u => u.role === "admin")?.avatar || "A"}</div>
          </div>
        </div>

        {/* ═══ BODY ═══ */}
        {page === "settings" ? (
          <div className="app-body">
            {/* Settings Sidebar */}
            <div className={`sidebar${sc ? " collapsed" : ""}`} onMouseEnter={() => { if (sidebarTimer.current) clearTimeout(sidebarTimer.current); }} onMouseLeave={() => { if (!sidebarPinned && !sc) { sidebarTimer.current = setTimeout(() => setSidebarCollapsed(true), 3000); } }}>
              <ToggleBtn />
              <div className="sidebar-section-title"><span className="sidebar-label">Configuration</span></div>
              <div className="sidebar-nav">
                {NAV_ITEMS.filter(i => i.key !== "users").map(item => (
                  <div
                    key={item.key}
                    className={`nav-item ${section === item.key ? "active" : ""}`}
                    onClick={() => guardedNav(() => setSection(item.key))}
                    title={sc ? item.label : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                    <span className="badge">{counts[item.key]}</span>
                  </div>
                ))}
              </div>
              <div className="sidebar-section-title"><span className="sidebar-label">Administration</span></div>
              <div className="sidebar-nav">
                <div
                  className={`nav-item ${section === "users" ? "active" : ""}`}
                  onClick={() => guardedNav(() => setSection("users"))}
                  title={sc ? "Users & Access" : undefined}
                >
                  <span className="nav-icon">{Icons.users}</span>
                  <span className="sidebar-label">Users & Access</span>
                  <span className="badge">{counts.users}</span>
                </div>
              </div>
            </div>

            {/* Settings Main */}
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
                {section === "constraints" && <ConstraintsSection constraints={constraints} setConstraints={setConstraints} onDirtyChange={setConstraintsDirty} />}
                {section === "users" && <UsersSection users={users} setUsers={setUsers} profiles={profiles} />}
              </div>
            </div>
          </div>
        ) : (
          <div className="app-body">
            {/* Builder Sidebar */}
            <div className={`sidebar${sc ? " collapsed" : ""}`} onMouseEnter={() => { if (sidebarTimer.current) clearTimeout(sidebarTimer.current); }} onMouseLeave={() => { if (!sidebarPinned && !sc) { sidebarTimer.current = setTimeout(() => setSidebarCollapsed(true), 3000); } }}>
              <ToggleBtn />
              <div className="sidebar-section-title"><span className="sidebar-label">Navigation</span></div>
              <div className="sidebar-nav">
                {BUILDER_NAV.map(item => (
                  <div
                    key={item.key}
                    className={`nav-item ${builderSection === item.key ? "active" : ""}`}
                    onClick={() => setBuilderSection(item.key)}
                    title={sc ? item.label : undefined}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="sidebar-label">{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="sidebar-section-title"><span className="sidebar-label">Profile System</span></div>
              <div className="sidebar-nav">
                {profiles.map(p => (
                  <div
                    key={p.id}
                    className="nav-item"
                    style={{ cursor: "default", opacity: 0.85 }}
                    title={sc ? `${p.name} (${p.code})` : undefined}
                  >
                    <span className="nav-icon" style={{ width: 22, height: 22, borderRadius: 5, background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--mono)" }}>{p.code?.slice(0, 2) || "P"}</span>
                    <span className="sidebar-label" style={{ fontSize: 12 }}>{p.name}</span>
                  </div>
                ))}
                {!sc && (
                  <div
                    className="nav-item"
                    style={{ color: "var(--text-muted)", fontSize: 11 }}
                    onClick={() => { setPage("settings"); setSection("profiles"); }}
                  >
                    <span className="nav-icon">{Icons.plus}</span>
                    <span className="sidebar-label">Manage in Settings</span>
                  </div>
                )}
                {sc && (
                  <div
                    className="nav-item"
                    style={{ justifyContent: "center" }}
                    title="Manage profiles in Settings"
                    onClick={() => { setPage("settings"); setSection("profiles"); }}
                  >
                    <span className="nav-icon">{Icons.settings}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Builder Main */}
            <div className="main" style={{ padding: 0 }}>
              {builderSection === "projects" && (
                <WindowBuilder
                  key={(activeProjectId || '__no_project__') + (pendingQuoteId || '')}
                  profiles={profiles} colors={colors} muntins={muntins}
                  glass={glass} allHardware={hardware} accessories={accessories}
                  customer={activeCustomer} project={activeProject}
                  constraints={constraints}
                  initialViewQuoteId={pendingQuoteId}
                  onConstructionsChange={(constrs) => {
                    if (activeCustomerId && activeProjectId) updateProjectConstructions(activeCustomerId, activeProjectId, constrs);
                  }}
                  onBackToCustomers={() => setBuilderSection("customers")}
                  onSaveQuote={(quote) => {
                    if (activeCustomerId && activeProjectId) saveQuoteToProject(activeCustomerId, activeProjectId, quote);
                  }}
                  onDeleteQuote={(quoteId) => {
                    if (activeCustomerId && activeProjectId) deleteQuoteFromProject(activeCustomerId, activeProjectId, quoteId);
                  }}
                  onUpdateQuote={(quoteId, constrs) => {
                    if (activeCustomerId && activeProjectId) updateQuoteInProject(activeCustomerId, activeProjectId, quoteId, constrs);
                  }}
                />
              )}
              {builderSection === "customers" && (
                <CustomersPage customers={customers} setCustomers={setCustomers} onOpenProject={openProject} onOpenQuote={openQuote} />
              )}
              {builderSection === "configure" && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>{Icons.configure}</div>
                    <p>Open a project first, then click <b>configure</b> on a position to open the configurator.</p>
                    <button className="btn" style={{ marginTop: 12 }} onClick={() => setBuilderSection("projects")}>Go to Projects</button>
                  </div>
                </div>
              )}
              {builderSection === "quotes" && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: 13 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.3 }}>{Icons.quote}</div>
                    <p>Quotes are generated from customer projects.</p>
                    <button className="btn" style={{ marginTop: 12 }} onClick={() => setBuilderSection("customers")}>Go to Customers</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

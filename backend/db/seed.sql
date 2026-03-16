-- DECA Window Configurator — Seed Data
SET search_path TO configurator, public;

-- ══ USERS ══
INSERT INTO users (name, email, phone, role, avatar, seller_code, active) VALUES
('Alex Petrov', 'alex@decawindows.com', '+1 (555) 123-4567', 'admin', 'AP', '01', true),
('Pavel', 'pavel@decawindows.com', '', 'manager', 'PV', '01', true),
('Erik', 'erik@decawindows.com', '', 'dealer', 'ER', '02', true),
('Ilya', 'ilya@decawindows.com', '', 'builder', 'IL', '03', true);

-- ══ PROFILES ══
INSERT INTO profiles (name, code, frame_section, frame_int, frame_bead, frame_depth, sash_ext, sash_int, sash_bead, sash_overlap, mullion_total, mullion_visible, mullion_rebate, glass_depth) VALUES
('Gealan LINEAR', 'GL-72', 72, 46, 26, 74, 44, 54, 16, 8, 94, 42, 26, 49);

-- ══ COLORS ══
-- Profile colors
INSERT INTO colors (category, name, ral, hex, sort_order) VALUES
('profile', 'Anthracite Grey', 'RAL 7016', '#3E4347', 1),
('profile', 'Signal White', 'RAL 9003', '#EEEEE8', 2),
('profile', 'Cream White', 'RAL 9001', '#F5F0E5', 3),
('profile', 'Jet Black', 'RAL 9005', '#1A1A1A', 4),
('profile', 'Chocolate Brown', 'RAL 8017', '#3E2B23', 5),
('profile', 'Dark Grey', 'RAL 7024', '#4A4F54', 6),
('profile', 'Light Grey', 'RAL 7035', '#C4C8CB', 7),
('profile', 'Mahogany', 'Renolit', '#6B3A2E', 8),
('profile', 'Golden Oak', 'Renolit', '#A67B45', 9),
('profile', 'Moss Green', 'RAL 6005', '#2F4538', 10);
-- Handle colors
INSERT INTO colors (category, name, ral, hex, sort_order) VALUES
('handle', 'Silver', NULL, '#A8A8A8', 1),
('handle', 'White', NULL, '#F0F0F0', 2),
('handle', 'Black', NULL, '#2A2A2A', 3),
('handle', 'Gold', NULL, '#C8A84E', 4),
('handle', 'Bronze', NULL, '#7A5C3A', 5);

-- ══ MUNTINS ══
INSERT INTO muntins (name, width_mm, width_label, color, color_name) VALUES
('5/8" White', 15.875, '5/8"', '#EEEEE8', 'White'),
('5/8" Black', 15.875, '5/8"', '#2A2A2A', 'Black'),
('1" White', 25.4, '1"', '#EEEEE8', 'White'),
('1" Black', 25.4, '1"', '#2A2A2A', 'Black');

-- ══ GLASS UNITS ══
INSERT INTO glass_units (name, type, layers, gas_fill, low_e, u_value, stc, price_sqm) VALUES
('Double Clear', 'double', 2, 'air', false, 2.7, 28, 35),
('Double Low-E', 'double', 2, 'air', true, 1.6, 30, 55),
('Double Low-E Argon', 'double', 2, 'argon', true, 1.1, 32, 75),
('Triple Low-E Argon', 'triple', 3, 'argon', true, 0.8, 36, 120),
('Triple Solar', 'triple', 3, 'argon', true, 0.5, 38, 160);

-- ══ HARDWARE ══
INSERT INTO hardware (name, category, brand, finish, price) VALUES
('Roto NT', 'handle', 'Roto', 'Silver', 25),
('Roto NT Black', 'handle', 'Roto', 'Black', 30),
('Siegenia Titan', 'hinge', 'Siegenia', 'Silver', 45),
('Maco Multi Matic', 'lock', 'Maco', 'Silver', 55),
('GU Uni-Jet', 'hinge', 'GU', 'White', 40);

-- ══ ACCESSORIES ══
INSERT INTO accessories (name, type, price, unit, specs) VALUES
('Standard Nailing Fin', 'nailing_fin', 8, 'lm', '{"width_mm": 25}'),
('Wide Nailing Fin', 'nailing_fin', 12, 'lm', '{"width_mm": 38}'),
('Sill Adapter 20mm', 'sill_adapter', 15, 'lm', '{"height_mm": 20}'),
('Extension Profile 30mm', 'extension', 18, 'lm', '{"depth_mm": 30}'),
('Drip Cap', 'drip_cap', 6, 'lm', '{}');

-- ══ SCREENS ══
INSERT INTO screens (name, type, mesh, frame_color, price) VALUES
('Fixed Insect Screen', 'fixed', 'fiberglass', 'white', 18),
('Retractable Screen', 'retractable', 'fiberglass', 'white', 45),
('Sliding Screen', 'sliding', 'aluminum', 'gray', 55);

-- ══ CONSTRAINTS ══
INSERT INTO constraints (group_name, group_icon, sort_order, items) VALUES
('Frame Constraints', '⬜', 1, '[
  {"key":"minW","label":"Min Frame Width","value":300,"unit":"mm","desc":"Minimum width of entire frame"},
  {"key":"minH","label":"Min Frame Height","value":300,"unit":"mm","desc":"Minimum height of entire frame"},
  {"key":"maxW","label":"Max Frame Width","value":5500,"unit":"mm","desc":"Maximum width of entire frame"},
  {"key":"maxH","label":"Max Frame Height","value":3000,"unit":"mm","desc":"Maximum height of entire frame"},
  {"key":"maxTotalW","label":"Max Total Length","value":5500,"unit":"mm","desc":"Maximum total construction length"}
]'),
('Sash Limits', '🪟', 2, '[
  {"key":"maxSashW","label":"Max Sash Width","value":1350,"unit":"mm","desc":"Max width of single operable sash"},
  {"key":"maxSashH","label":"Max Sash Height","value":2200,"unit":"mm","desc":"Max height of single sash"}
]'),
('Glazing Limits', '💎', 3, '[
  {"key":"maxGlassW","label":"Max Glass Width","value":2500,"unit":"mm","desc":"Max width of single glass unit"},
  {"key":"maxGlassH","label":"Max Glass Height","value":3000,"unit":"mm","desc":"Max height of single glass unit"}
]'),
('Mullion Rules', '⫼', 4, '[
  {"key":"minMullionFrameW","label":"Min Frame for Mullion","value":500,"unit":"mm","desc":"Min frame width to allow mullion"}
]'),
('Workflow Rules', '📋', 5, '[
  {"key":"quoteDescRequired","label":"Quote Description Required","value":1,"unit":"bool","desc":"Require description before saving a quote"}
]');

-- ══ SAMPLE CUSTOMER ══
INSERT INTO customers (first_name, last_name, email, phone, address, type, company) VALUES
('Vlad', 'Momentov', 'valterm2@gmail.com', '4136367945', '411 N Westfiel St', 'residential', NULL);

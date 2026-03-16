-- DECA Window Configurator — Database Schema
-- PostgreSQL 16 + pgvector
-- Schema: configurator (inside deca_crm database)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

CREATE SCHEMA IF NOT EXISTS configurator;
SET search_path TO configurator, public;

-- ══════════════════════════════════════════════
-- USERS & AUTH
-- ══════════════════════════════════════════════

CREATE TABLE configurator.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'viewer'
    CHECK (role IN ('admin','manager','dealer','builder','contractor','viewer')),
  avatar VARCHAR(10),
  seller_code VARCHAR(4),  -- e.g. '01', '02'
  active BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- ══════════════════════════════════════════════
-- PROFILE SYSTEMS
-- ══════════════════════════════════════════════

CREATE TABLE configurator.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20),
  -- Frame dimensions (mm)
  frame_section NUMERIC(6,1) NOT NULL,  -- ext face
  frame_int NUMERIC(6,1) NOT NULL,      -- int face
  frame_bead NUMERIC(6,1) NOT NULL,     -- glaze bead
  frame_depth NUMERIC(6,1),
  -- Sash dimensions (mm)
  sash_ext NUMERIC(6,1) NOT NULL,
  sash_int NUMERIC(6,1) NOT NULL,
  sash_bead NUMERIC(6,1),
  sash_overlap NUMERIC(6,1) NOT NULL,
  -- Mullion dimensions (mm)
  mullion_total NUMERIC(6,1) NOT NULL,
  mullion_visible NUMERIC(6,1) NOT NULL,
  mullion_rebate NUMERIC(6,1),
  -- Glass
  glass_depth NUMERIC(6,1),
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════
-- COLORS
-- ══════════════════════════════════════════════

CREATE TABLE configurator.colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(20) NOT NULL CHECK (category IN ('profile','handle')),
  name VARCHAR(100) NOT NULL,
  ral VARCHAR(20),
  hex VARCHAR(7) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════
-- MUNTINS
-- ══════════════════════════════════════════════

CREATE TABLE configurator.muntins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  width_mm NUMERIC(6,3) NOT NULL,
  width_label VARCHAR(10) NOT NULL,
  color VARCHAR(7) NOT NULL,
  color_name VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════
-- GLASS UNITS (IGU)
-- ══════════════════════════════════════════════

CREATE TABLE configurator.glass_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('single','double','triple')),
  layers INT NOT NULL DEFAULT 2,
  gas_fill VARCHAR(20) DEFAULT 'air',
  low_e BOOLEAN NOT NULL DEFAULT false,
  u_value NUMERIC(4,2),
  stc INT,
  price_sqm NUMERIC(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════
-- HARDWARE
-- ══════════════════════════════════════════════

CREATE TABLE configurator.hardware (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('handle','hinge','lock','other')),
  brand VARCHAR(50),
  finish VARCHAR(50),
  price NUMERIC(8,2) DEFAULT 0,
  compatible_profiles UUID[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════
-- ACCESSORIES
-- ══════════════════════════════════════════════

CREATE TABLE configurator.accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL,
  price NUMERIC(8,2) DEFAULT 0,
  unit VARCHAR(10) DEFAULT 'pcs',
  specs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════
-- SCREENS
-- ══════════════════════════════════════════════

CREATE TABLE configurator.screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL,
  mesh VARCHAR(30),
  frame_color VARCHAR(30),
  price NUMERIC(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════
-- CONSTRAINTS
-- ══════════════════════════════════════════════

CREATE TABLE configurator.constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(100) NOT NULL,
  group_icon VARCHAR(10) DEFAULT '📐',
  sort_order INT NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'
  -- items: [{ key, label, value, unit, desc }]
);

-- ══════════════════════════════════════════════
-- CUSTOMERS
-- ══════════════════════════════════════════════

CREATE TABLE configurator.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  type VARCHAR(20) DEFAULT 'residential'
    CHECK (type IN ('residential','contractor','builder','commercial')),
  company VARCHAR(200),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ══════════════════════════════════════════════
-- PROJECTS
-- ══════════════════════════════════════════════

CREATE TABLE configurator.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES configurator.customers(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  address TEXT,
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft','active','completed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_customer ON configurator.projects(customer_id);

-- ══════════════════════════════════════════════
-- QUOTES
-- ══════════════════════════════════════════════

CREATE TABLE configurator.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES configurator.projects(id) ON DELETE CASCADE,
  quote_number VARCHAR(20) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft'
    CHECK (status IN ('draft','sent','approved','rejected')),
  amount NUMERIC(12,2) DEFAULT 0,
  seller_id UUID REFERENCES configurator.users(id),
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotes_project ON configurator.quotes(project_id);

-- ══════════════════════════════════════════════
-- CONSTRUCTIONS (window/door definitions)
-- ══════════════════════════════════════════════

CREATE TABLE configurator.constructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES configurator.quotes(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES configurator.profiles(id),
  width_mm INT NOT NULL,
  height_mm INT NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT '1po',
  tree JSONB NOT NULL DEFAULT '{}',    -- section tree (recursive split/leaf)
  defaults JSONB DEFAULT '{}',          -- colorExt, colorInt, hinges, etc.
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_constructions_quote ON configurator.constructions(quote_id);

-- ══════════════════════════════════════════════
-- POSITIONS (instances of a construction)
-- ══════════════════════════════════════════════

CREATE TABLE configurator.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  construction_id UUID NOT NULL REFERENCES configurator.constructions(id) ON DELETE CASCADE,
  idx INT NOT NULL DEFAULT 1,
  description TEXT,
  pos_w INT,              -- custom width override (mm)
  pos_h INT,              -- custom height override (mm)
  pos_glass_id UUID REFERENCES configurator.glass_units(id),
  tweaks JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_positions_construction ON configurator.positions(construction_id);

-- ══════════════════════════════════════════════
-- INVOICES
-- ══════════════════════════════════════════════

CREATE TABLE configurator.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES configurator.quotes(id) ON DELETE CASCADE,
  number VARCHAR(30) NOT NULL,
  amount NUMERIC(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending','paid','overdue','cancelled')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoices_quote ON configurator.invoices(quote_id);

-- ══════════════════════════════════════════════
-- AI EMBEDDINGS (for voice/text command matching)
-- ══════════════════════════════════════════════

CREATE TABLE configurator.parameter_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,  -- 'color', 'type', 'glass', 'dimension', 'term'
  key VARCHAR(100) NOT NULL,      -- parameter key (e.g. 'colorExt')
  value TEXT NOT NULL,             -- resolved value (e.g. 'Jet Black')
  resolved_id UUID,               -- FK to actual entity
  synonyms TEXT[] NOT NULL DEFAULT '{}',  -- all text forms
  embedding vector(768),           -- Google text-embedding-004 = 768 dims
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_embeddings_category ON configurator.parameter_embeddings(category);
CREATE INDEX idx_embeddings_vector ON configurator.parameter_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 20);

-- ══════════════════════════════════════════════
-- AUDIT LOG
-- ══════════════════════════════════════════════

CREATE TABLE configurator.audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES configurator.users(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_created ON configurator.audit_log(created_at DESC);

-- ══════════════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ══════════════════════════════════════════════

CREATE OR REPLACE FUNCTION configurator.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','customers','projects','quotes','constructions']
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_updated_at BEFORE UPDATE ON configurator.%I
       FOR EACH ROW EXECUTE FUNCTION configurator.update_timestamp()', t
    );
  END LOOP;
END;
$$;

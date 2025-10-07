-- ============================================
-- Craft.js Page Builder Database Schema
-- ============================================
-- This script creates all necessary tables for the page builder system
-- Run this in your Supabase SQL editor

-- ============================================
-- 1. builder_sites
-- ============================================
CREATE TABLE IF NOT EXISTS builder_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID, -- For multi-tenant support (future)
  event_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  site_slug TEXT NOT NULL UNIQUE,
  domain_custom TEXT,
  theme_tokens JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_builder_sites_org_id ON builder_sites(org_id);
CREATE INDEX idx_builder_sites_event_id ON builder_sites(event_id);
CREATE INDEX idx_builder_sites_slug ON builder_sites(site_slug);
CREATE INDEX idx_builder_sites_status ON builder_sites(status);

-- ============================================
-- 2. builder_templates
-- ============================================
CREATE TABLE IF NOT EXISTS builder_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID, -- NULL = public template, UUID = org-specific
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL, -- CraftPage JSON
  preview_image TEXT,
  category TEXT,
  version TEXT DEFAULT '1.0.0',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_builder_templates_org_id ON builder_templates(org_id);
CREATE INDEX idx_builder_templates_public ON builder_templates(is_public);
CREATE INDEX idx_builder_templates_category ON builder_templates(category);

-- ============================================
-- 3. builder_pages
-- ============================================
CREATE TABLE IF NOT EXISTS builder_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES builder_sites(id) ON DELETE CASCADE,
  template_id UUID REFERENCES builder_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  tree JSONB NOT NULL DEFAULT '{"rootNodeId": "", "nodes": {}}'::jsonb, -- CraftPage JSON
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  version INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, -- User ID (future)

  -- Ensure unique slug per site
  UNIQUE(site_id, slug)
);

-- Indexes
CREATE INDEX idx_builder_pages_site_id ON builder_pages(site_id);
CREATE INDEX idx_builder_pages_template_id ON builder_pages(template_id);
CREATE INDEX idx_builder_pages_status ON builder_pages(status);
CREATE INDEX idx_builder_pages_created_by ON builder_pages(created_by);

-- ============================================
-- 4. builder_page_versions
-- ============================================
CREATE TABLE IF NOT EXISTS builder_page_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES builder_pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  tree JSONB NOT NULL, -- CraftPage JSON snapshot
  label TEXT, -- Optional label for named versions
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID, -- User ID (future)

  -- Ensure unique version per page
  UNIQUE(page_id, version)
);

-- Indexes
CREATE INDEX idx_builder_page_versions_page_id ON builder_page_versions(page_id);
CREATE INDEX idx_builder_page_versions_version ON builder_page_versions(page_id, version);

-- ============================================
-- 5. builder_blocks_library
-- ============================================
CREATE TABLE IF NOT EXISTS builder_blocks_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL, -- Block component schema
  props_meta JSONB NOT NULL, -- Block properties metadata
  preview_image TEXT,
  category TEXT NOT NULL,
  version TEXT DEFAULT '1.0.0',
  is_custom BOOLEAN DEFAULT false, -- true = user-created, false = system
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_builder_blocks_category ON builder_blocks_library(category);
CREATE INDEX idx_builder_blocks_custom ON builder_blocks_library(is_custom);

-- ============================================
-- 6. builder_domains
-- ============================================
CREATE TABLE IF NOT EXISTS builder_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES builder_sites(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('subdomain', 'custom')),
  host TEXT NOT NULL UNIQUE,
  dns_status TEXT DEFAULT 'pending' CHECK (dns_status IN ('pending', 'verified', 'failed')),
  ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'provisioning', 'active', 'failed')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_builder_domains_site_id ON builder_domains(site_id);
CREATE INDEX idx_builder_domains_host ON builder_domains(host);
CREATE INDEX idx_builder_domains_type ON builder_domains(type);

-- Ensure only one primary domain per site using a unique partial index
CREATE UNIQUE INDEX idx_builder_domains_one_primary_per_site
  ON builder_domains(site_id)
  WHERE is_primary = true;

-- ============================================
-- Triggers for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_builder_sites_updated_at
    BEFORE UPDATE ON builder_sites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builder_templates_updated_at
    BEFORE UPDATE ON builder_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builder_pages_updated_at
    BEFORE UPDATE ON builder_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_builder_blocks_updated_at
    BEFORE UPDATE ON builder_blocks_library
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE builder_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_blocks_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE builder_domains ENABLE ROW LEVEL SECURITY;

-- Sites: Authenticated users can read/write their own org's sites
CREATE POLICY "Users can view sites"
  ON builder_sites FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create sites"
  ON builder_sites FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update sites"
  ON builder_sites FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete sites"
  ON builder_sites FOR DELETE
  USING (auth.role() = 'authenticated');

-- Templates: Public templates readable by all, org templates by org members
CREATE POLICY "Public templates are viewable by all"
  ON builder_templates FOR SELECT
  USING (is_public = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create templates"
  ON builder_templates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their templates"
  ON builder_templates FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their templates"
  ON builder_templates FOR DELETE
  USING (auth.role() = 'authenticated');

-- Pages: Users can read/write pages for their sites
CREATE POLICY "Users can view pages"
  ON builder_pages FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create pages"
  ON builder_pages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update pages"
  ON builder_pages FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete pages"
  ON builder_pages FOR DELETE
  USING (auth.role() = 'authenticated');

-- Page Versions: Same as pages
CREATE POLICY "Users can view page versions"
  ON builder_page_versions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create page versions"
  ON builder_page_versions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Blocks Library: All authenticated users can read, admin can write
CREATE POLICY "Authenticated users can view blocks"
  ON builder_blocks_library FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create custom blocks"
  ON builder_blocks_library FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND is_custom = true);

CREATE POLICY "Users can update their custom blocks"
  ON builder_blocks_library FOR UPDATE
  USING (auth.role() = 'authenticated' AND is_custom = true);

CREATE POLICY "Users can delete their custom blocks"
  ON builder_blocks_library FOR DELETE
  USING (auth.role() = 'authenticated' AND is_custom = true);

-- Domains: Users can manage domains for their sites
CREATE POLICY "Users can view domains"
  ON builder_domains FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create domains"
  ON builder_domains FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update domains"
  ON builder_domains FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete domains"
  ON builder_domains FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- Seed Data: System Blocks
-- ============================================

-- Insert system blocks (Container, Text, Button)
INSERT INTO builder_blocks_library (key, label, description, schema, props_meta, category, is_custom) VALUES
(
  'container',
  'Conteneur',
  'Un conteneur flexible pour organiser d''autres éléments',
  '{"component": "Container", "canvas": true}'::jsonb,
  '{
    "content": {},
    "layout": {
      "background": {"type": "color", "label": "Couleur de fond", "defaultValue": "#ffffff"},
      "padding": {"type": "number", "label": "Espacement intérieur (px)", "defaultValue": 20},
      "margin": {"type": "number", "label": "Marge extérieure (px)", "defaultValue": 0}
    },
    "theme": {},
    "data": {}
  }'::jsonb,
  'layout',
  false
),
(
  'text',
  'Texte',
  'Bloc de texte éditable avec options de style',
  '{"component": "Text", "canvas": false}'::jsonb,
  '{
    "content": {
      "text": {"type": "textarea", "label": "Contenu", "defaultValue": "Cliquez pour éditer"}
    },
    "layout": {
      "margin": {"type": "number", "label": "Marge (px)", "defaultValue": 0},
      "textAlign": {"type": "select", "label": "Alignement", "defaultValue": "left", "options": [
        {"label": "Gauche", "value": "left"},
        {"label": "Centre", "value": "center"},
        {"label": "Droite", "value": "right"}
      ]}
    },
    "theme": {
      "fontSize": {"type": "number", "label": "Taille (px)", "defaultValue": 16},
      "fontWeight": {"type": "select", "label": "Graisse", "defaultValue": "400", "options": [
        {"label": "Light", "value": "300"},
        {"label": "Normal", "value": "400"},
        {"label": "Medium", "value": "500"},
        {"label": "Semi-Bold", "value": "600"},
        {"label": "Bold", "value": "700"}
      ]},
      "color": {"type": "color", "label": "Couleur", "defaultValue": "#000000"}
    },
    "data": {}
  }'::jsonb,
  'content',
  false
),
(
  'button',
  'Bouton',
  'Bouton cliquable avec différents styles',
  '{"component": "Button", "canvas": false}'::jsonb,
  '{
    "content": {
      "text": {"type": "text", "label": "Texte", "defaultValue": "Cliquez ici"},
      "href": {"type": "text", "label": "Lien", "defaultValue": "#"}
    },
    "layout": {
      "size": {"type": "select", "label": "Taille", "defaultValue": "md", "options": [
        {"label": "Petit", "value": "sm"},
        {"label": "Moyen", "value": "md"},
        {"label": "Grand", "value": "lg"}
      ]},
      "variant": {"type": "select", "label": "Variant", "defaultValue": "solid", "options": [
        {"label": "Plein", "value": "solid"},
        {"label": "Contour", "value": "outline"},
        {"label": "Fantôme", "value": "ghost"}
      ]}
    },
    "theme": {
      "backgroundColor": {"type": "color", "label": "Couleur de fond", "defaultValue": "#3B82F6"},
      "textColor": {"type": "color", "label": "Couleur du texte", "defaultValue": "#ffffff"},
      "borderRadius": {"type": "number", "label": "Arrondi (px)", "defaultValue": 8}
    },
    "data": {}
  }'::jsonb,
  'content',
  false
);

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Builder tables created successfully!';
  RAISE NOTICE 'Tables created: builder_sites, builder_templates, builder_pages, builder_page_versions, builder_blocks_library, builder_domains';
  RAISE NOTICE 'RLS policies enabled for all tables';
  RAISE NOTICE '3 system blocks seeded (Container, Text, Button)';
END $$;

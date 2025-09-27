-- Script SQL pour créer la table des configurations de landing page
-- À exécuter dans votre interface Supabase SQL Editor

-- Créer la table landing_page_configs
CREATE TABLE IF NOT EXISTS landing_page_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES inscription_evenements(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  customization JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT unique_event_landing_config UNIQUE(event_id)
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_landing_page_configs_event_id ON landing_page_configs(event_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_configs_template_id ON landing_page_configs(template_id);

-- Politique RLS - Permettre l'accès public (comme les autres tables)
ALTER TABLE landing_page_configs ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Permettre lecture des configurations landing page" ON landing_page_configs
  FOR SELECT TO public USING (true);

CREATE POLICY "Permettre création des configurations landing page" ON landing_page_configs
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Permettre mise à jour des configurations landing page" ON landing_page_configs
  FOR UPDATE TO public USING (true);

CREATE POLICY "Permettre suppression des configurations landing page" ON landing_page_configs
  FOR DELETE TO public USING (true);

-- Commentaires pour la documentation
COMMENT ON TABLE landing_page_configs IS 'Configuration des modèles de landing page pour chaque événement';
COMMENT ON COLUMN landing_page_configs.event_id IS 'ID de l''événement (référence vers inscription_evenements)';
COMMENT ON COLUMN landing_page_configs.template_id IS 'ID du modèle de landing page sélectionné';
COMMENT ON COLUMN landing_page_configs.customization IS 'Configuration personnalisée (couleurs, textes, images, etc.)';

-- Exemple de structure JSON pour le champ customization :
/*
{
  "primaryColor": "#3B82F6",
  "secondaryColor": "#1F2937",
  "heroTitle": "Mon événement incroyable",
  "heroSubtitle": "Description de l'événement",
  "heroImage": "https://example.com/hero.jpg",
  "ctaButtonText": "S'inscrire maintenant",
  "logoUrl": "https://example.com/logo.png",
  "backgroundImage": "https://example.com/bg.jpg",
  "customCSS": ".hero { background: linear-gradient(...); }"
}
*/

-- Insérer quelques exemples de configurations par défaut (optionnel)
INSERT INTO landing_page_configs (event_id, template_id, customization) 
SELECT 
  id as event_id,
  'modern-gradient' as template_id,
  jsonb_build_object(
    'primaryColor', '#3B82F6',
    'secondaryColor', '#1F2937',
    'ctaButtonText', 'S''inscrire maintenant'
  ) as customization
FROM inscription_evenements 
WHERE NOT EXISTS (
  SELECT 1 FROM landing_page_configs WHERE event_id = inscription_evenements.id
)
LIMIT 5; -- Limiter aux 5 premiers événements pour l'exemple

-- Vérification de la création de la table
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'landing_page_configs' 
ORDER BY ordinal_position;
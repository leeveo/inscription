-- Création de la table pour les modèles de tickets
-- Compatible Supabase

-- Vérifier si la table existe déjà
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'inscription_ticket_templates';

-- Si la table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS inscription_ticket_templates (
  id SERIAL PRIMARY KEY,
  evenement_id UUID NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte de clé étrangère avec les événements
  CONSTRAINT fk_ticket_templates_event 
    FOREIGN KEY (evenement_id) 
    REFERENCES inscription_evenements(id) 
    ON DELETE CASCADE,
    
  -- Un seul modèle de ticket par événement
  CONSTRAINT unique_ticket_template_per_event 
    UNIQUE(evenement_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_ticket_templates_event_id 
ON inscription_ticket_templates(evenement_id);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_ticket_template_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_ticket_template_updated_at ON inscription_ticket_templates;

CREATE TRIGGER trigger_update_ticket_template_updated_at
  BEFORE UPDATE ON inscription_ticket_templates
  FOR EACH ROW
  EXECUTE PROCEDURE update_ticket_template_updated_at();

-- Configuration RLS (Row Level Security) si nécessaire
-- ALTER TABLE inscription_ticket_templates ENABLE ROW LEVEL SECURITY;

-- Politique d'accès (optionnel - à adapter selon vos besoins)
-- CREATE POLICY "Allow read access to ticket templates" ON inscription_ticket_templates
--   FOR SELECT USING (true);

-- CREATE POLICY "Allow insert/update/delete for authenticated users" ON inscription_ticket_templates
--   FOR ALL USING (true);

-- Vérification finale
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'inscription_ticket_templates'
  AND table_schema = 'public'
ORDER BY ordinal_position;
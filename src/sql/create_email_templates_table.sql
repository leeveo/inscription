-- Script pour créer la table des templates d'email
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table inscription_email_templates si elle n'existe pas
CREATE TABLE IF NOT EXISTS inscription_email_templates (
    id SERIAL PRIMARY KEY,
    evenement_id UUID NOT NULL REFERENCES inscription_evenements(id) ON DELETE CASCADE,
    subject TEXT NOT NULL DEFAULT '',
    html_content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(evenement_id)
);

-- 2. Ajouter des commentaires pour documenter la table
COMMENT ON TABLE inscription_email_templates IS 'Templates d''email personnalisés pour les événements';
COMMENT ON COLUMN inscription_email_templates.id IS 'Identifiant unique du template';
COMMENT ON COLUMN inscription_email_templates.evenement_id IS 'Référence vers l''événement';
COMMENT ON COLUMN inscription_email_templates.subject IS 'Sujet de l''email avec variables {{}}';
COMMENT ON COLUMN inscription_email_templates.html_content IS 'Contenu HTML de l''email avec variables {{}}';
COMMENT ON COLUMN inscription_email_templates.created_at IS 'Date de création du template';
COMMENT ON COLUMN inscription_email_templates.updated_at IS 'Date de dernière modification';

-- 3. Créer un index sur evenement_id pour les performances
CREATE INDEX IF NOT EXISTS idx_email_templates_evenement_id ON inscription_email_templates(evenement_id);

-- 4. Vérifier que la table a été créée correctement
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_email_templates'
ORDER BY ordinal_position;
-- Script SQL pour ajouter le système de tokens personnalisés aux participants
-- À exécuter dans votre interface Supabase SQL Editor

-- 1. Ajouter le champ token_landing_page à la table inscription_participants
ALTER TABLE inscription_participants 
ADD COLUMN IF NOT EXISTS token_landing_page TEXT UNIQUE;

-- 2. Créer un index pour améliorer les performances des recherches par token
CREATE INDEX IF NOT EXISTS idx_inscription_participants_token ON inscription_participants(token_landing_page);

-- 3. Fonction pour générer un token unique
CREATE OR REPLACE FUNCTION generate_participant_token()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
    char_length INTEGER := length(chars);
BEGIN
    -- Générer un token de 32 caractères
    FOR i IN 1..32 LOOP
        result := result || substr(chars, floor(random() * char_length + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Générer des tokens pour les participants existants qui n'en ont pas
UPDATE inscription_participants 
SET token_landing_page = generate_participant_token()
WHERE token_landing_page IS NULL;

-- 5. Créer une contrainte pour s'assurer que le token n'est pas null pour les nouveaux participants
-- (On fera ça via l'application pour avoir plus de contrôle)

-- 6. Créer une table pour tracker les visites des liens personnalisés
CREATE TABLE IF NOT EXISTS landing_page_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id INTEGER NOT NULL REFERENCES inscription_participants(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES inscription_evenements(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    converted BOOLEAN DEFAULT FALSE, -- Si le visiteur s'est inscrit
    conversion_at TIMESTAMP WITH TIME ZONE,
    
    -- Index pour les performances
    CONSTRAINT fk_visit_participant FOREIGN KEY (participant_id) REFERENCES inscription_participants(id),
    CONSTRAINT fk_visit_event FOREIGN KEY (event_id) REFERENCES inscription_evenements(id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_landing_visits_participant ON landing_page_visits(participant_id);
CREATE INDEX IF NOT EXISTS idx_landing_visits_event ON landing_page_visits(event_id);
CREATE INDEX IF NOT EXISTS idx_landing_visits_token ON landing_page_visits(token);
CREATE INDEX IF NOT EXISTS idx_landing_visits_date ON landing_page_visits(visited_at);

-- 7. Politiques RLS pour la table des visites
ALTER TABLE landing_page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permettre lecture des visites landing page" ON landing_page_visits
  FOR SELECT TO public USING (true);

CREATE POLICY "Permettre création des visites landing page" ON landing_page_visits
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Permettre mise à jour des visites landing page" ON landing_page_visits
  FOR UPDATE TO public USING (true);

-- 8. Commentaires pour la documentation
COMMENT ON COLUMN inscription_participants.token_landing_page IS 'Token unique pour accès personnalisé à la landing page';
COMMENT ON TABLE landing_page_visits IS 'Suivi des visites sur les landing pages via liens personnalisés';
COMMENT ON COLUMN landing_page_visits.converted IS 'Indique si la visite a généré une inscription/conversion';

-- 9. Vue pour les statistiques des campagnes personnalisées
CREATE OR REPLACE VIEW landing_page_stats AS
SELECT 
    e.id as event_id,
    e.nom as event_name,
    p.id as participant_id,
    p.nom,
    p.prenom,
    p.email,
    p.token_landing_page,
    COUNT(v.id) as total_visits,
    MAX(v.visited_at) as last_visit,
    CASE WHEN COUNT(v.id) > 0 THEN true ELSE false END as has_visited,
    CASE WHEN SUM(CASE WHEN v.converted THEN 1 ELSE 0 END) > 0 THEN true ELSE false END as has_converted,
    MIN(v.visited_at) as first_visit
FROM inscription_participants p
JOIN inscription_evenements e ON p.evenement_id = e.id
LEFT JOIN landing_page_visits v ON p.id = v.participant_id
GROUP BY e.id, e.nom, p.id, p.nom, p.prenom, p.email, p.token_landing_page;

-- 10. Fonction pour générer une URL personnalisée
CREATE OR REPLACE FUNCTION get_participant_landing_url(
    p_participant_id INTEGER,
    p_base_url TEXT DEFAULT 'https://votre-domaine.com'
)
RETURNS TEXT AS $$
DECLARE
    participant_record RECORD;
    url TEXT;
BEGIN
    SELECT p.token_landing_page, p.evenement_id 
    INTO participant_record
    FROM inscription_participants p 
    WHERE p.id = p_participant_id;
    
    IF participant_record.token_landing_page IS NULL THEN
        RAISE EXCEPTION 'Participant token not found';
    END IF;
    
    url := p_base_url || '/landing/' || participant_record.evenement_id || '/' || participant_record.token_landing_page;
    
    RETURN url;
END;
$$ LANGUAGE plpgsql;

-- Exemple d'utilisation de la fonction :
-- SELECT get_participant_landing_url('participant-id-here', 'https://monsite.com');

-- 11. Créer la table pour les configurations des landing pages
CREATE TABLE IF NOT EXISTS landing_page_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES inscription_evenements(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL DEFAULT 'modern-gradient',
    customization JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte unique pour un seul config par événement
    CONSTRAINT unique_landing_config_per_event UNIQUE (event_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_landing_configs_event ON landing_page_configs(event_id);

-- Politiques RLS pour la table des configurations
ALTER TABLE landing_page_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permettre lecture des configurations landing page" ON landing_page_configs
  FOR SELECT TO public USING (true);

CREATE POLICY "Permettre création des configurations landing page" ON landing_page_configs
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Permettre mise à jour des configurations landing page" ON landing_page_configs
  FOR UPDATE TO public USING (true);

CREATE POLICY "Permettre suppression des configurations landing page" ON landing_page_configs
  FOR DELETE TO public USING (true);

-- Commentaires pour la documentation
COMMENT ON TABLE landing_page_configs IS 'Configurations des modèles de landing pages par événement';
COMMENT ON COLUMN landing_page_configs.template_id IS 'Identifiant du template utilisé (modern-gradient, classic-business, etc.)';
COMMENT ON COLUMN landing_page_configs.customization IS 'Configuration JSON des couleurs, polices et autres personnalisations';

-- Vérification des modifications
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'landing_page_configs';

-- Vérification des tokens générés (ne montrer que quelques exemples)
SELECT 
    id,
    nom,
    prenom,
    LEFT(token_landing_page, 8) || '...' as token_preview
FROM inscription_participants 
LIMIT 5;
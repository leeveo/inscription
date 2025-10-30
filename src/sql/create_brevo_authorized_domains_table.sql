-- Script pour créer la table des domaines autorisés dans Brevo
-- À exécuter dans Supabase SQL Editor

-- 1. Créer la table brevo_authorized_domains
CREATE TABLE IF NOT EXISTS brevo_authorized_domains (
    id SERIAL PRIMARY KEY,
    domain_name VARCHAR(255) NOT NULL UNIQUE,
    is_verified BOOLEAN DEFAULT false,
    verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'failed'
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true
);

-- 2. Ajouter des commentaires pour documenter la table
COMMENT ON TABLE brevo_authorized_domains IS 'Domaines autorisés et vérifiés dans Brevo pour l''envoi d''emails';
COMMENT ON COLUMN brevo_authorized_domains.domain_name IS 'Nom du domaine (ex: exemple.com)';
COMMENT ON COLUMN brevo_authorized_domains.is_verified IS 'Domaine vérifié dans Brevo';
COMMENT ON COLUMN brevo_authorized_domains.verification_status IS 'Statut de vérification du domaine';
COMMENT ON COLUMN brevo_authorized_domains.notes IS 'Notes administratives sur le domaine';

-- 3. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_brevo_domains_name ON brevo_authorized_domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_brevo_domains_verified ON brevo_authorized_domains(is_verified, is_active);

-- 4. Insérer quelques exemples (à adapter selon vos domaines vérifiés)
-- INSERT INTO brevo_authorized_domains (domain_name, is_verified, verification_status, verified_at, notes) VALUES
-- ('votre-domaine-verifie.com', true, 'verified', NOW(), 'Domaine principal vérifié'),
-- ('client-exemple.fr', true, 'verified', NOW(), 'Domaine client vérifié');

-- 5. Vérifier que la table a été créée correctement
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'brevo_authorized_domains'
ORDER BY ordinal_position;
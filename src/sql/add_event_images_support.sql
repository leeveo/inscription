-- Script pour ajouter le support des logos/images et autres colonnes manquantes
-- À exécuter dans Supabase SQL Editor
-- Note: Les images sont maintenant gérées par UploadThing, pas par Supabase Storage

-- 1. Ajouter toutes les colonnes manquantes à la table inscription_evenements
ALTER TABLE inscription_evenements 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS email_contact TEXT,
ADD COLUMN IF NOT EXISTS telephone_contact TEXT,
ADD COLUMN IF NOT EXISTS organisateur TEXT,
ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'actif',
ADD COLUMN IF NOT EXISTS type_evenement TEXT DEFAULT 'conference';

-- 2. Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN inscription_evenements.logo_url IS 'URL du logo/image de l''événement stocké via UploadThing (https://utfs.io/f/...)';
COMMENT ON COLUMN inscription_evenements.email_contact IS 'Adresse email de contact pour l''événement';
COMMENT ON COLUMN inscription_evenements.telephone_contact IS 'Numéro de téléphone de contact pour l''événement';
COMMENT ON COLUMN inscription_evenements.organisateur IS 'Nom de l''organisateur de l''événement';
COMMENT ON COLUMN inscription_evenements.statut IS 'Statut de l''événement (actif, annulé, reporté, etc.)';
COMMENT ON COLUMN inscription_evenements.type_evenement IS 'Type d''événement (conference, workshop, formation, etc.)';

-- 3. Vérifier que toutes les colonnes ont été ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_evenements'
    AND column_name IN ('logo_url', 'email_contact', 'telephone_contact', 'organisateur', 'statut', 'type_evenement')
ORDER BY column_name;

-- 4. Afficher toutes les colonnes de la table pour vérification complète
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_evenements'
ORDER BY ordinal_position;

-- Note: Plus besoin de créer des buckets ou politiques Supabase Storage
-- Les images sont maintenant gérées par UploadThing automatiquement
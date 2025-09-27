-- Script pour ajouter toutes les colonnes manquantes à la table inscription_evenements
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter toutes les colonnes manquantes
ALTER TABLE inscription_evenements 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS email_contact TEXT,
ADD COLUMN IF NOT EXISTS telephone_contact TEXT,
ADD COLUMN IF NOT EXISTS organisateur TEXT,
ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'actif',
ADD COLUMN IF NOT EXISTS type_evenement TEXT DEFAULT 'conference',
ADD COLUMN IF NOT EXISTS places_disponibles INTEGER,
ADD COLUMN IF NOT EXISTS prix DECIMAL(10,2);

-- 2. Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN inscription_evenements.logo_url IS 'URL du logo/image de l''événement stocké via UploadThing (https://utfs.io/f/...)';
COMMENT ON COLUMN inscription_evenements.email_contact IS 'Adresse email de contact pour l''événement';
COMMENT ON COLUMN inscription_evenements.telephone_contact IS 'Numéro de téléphone de contact pour l''événement';
COMMENT ON COLUMN inscription_evenements.organisateur IS 'Nom de l''organisateur de l''événement';
COMMENT ON COLUMN inscription_evenements.statut IS 'Statut de l''événement (actif, annulé, reporté, etc.)';
COMMENT ON COLUMN inscription_evenements.type_evenement IS 'Type d''événement (conference, workshop, formation, etc.)';
COMMENT ON COLUMN inscription_evenements.places_disponibles IS 'Nombre de places disponibles pour l''événement';
COMMENT ON COLUMN inscription_evenements.prix IS 'Prix de l''événement en euros';

-- 3. Vérifier que toutes les colonnes ont été ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_evenements'
    AND column_name IN ('logo_url', 'email_contact', 'telephone_contact', 'organisateur', 'statut', 'type_evenement', 'places_disponibles', 'prix')
ORDER BY column_name;

-- 4. Afficher la structure complète de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_evenements'
ORDER BY ordinal_position;
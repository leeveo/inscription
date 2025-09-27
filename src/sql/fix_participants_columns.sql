-- Script pour ajouter les colonnes manquantes à la table inscription_participants
-- À exécuter dans Supabase SQL Editor

-- 1. Ajouter la colonne date_modification manquante
ALTER TABLE inscription_participants 
ADD COLUMN IF NOT EXISTS date_modification TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Ajouter un trigger pour mettre à jour automatiquement date_modification
CREATE OR REPLACE FUNCTION update_modified_time_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.date_modification = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- 3. Créer le trigger sur la table inscription_participants
DROP TRIGGER IF EXISTS update_inscription_participants_modified_time ON inscription_participants;
CREATE TRIGGER update_inscription_participants_modified_time
    BEFORE UPDATE ON inscription_participants
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_time_column();

-- 4. Vérifier que la colonne a été ajoutée
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_participants'
    AND column_name = 'date_modification';

-- 5. Afficher la structure complète de la table inscription_participants
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_participants'
ORDER BY ordinal_position;
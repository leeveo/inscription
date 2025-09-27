-- Script de vérification de l'état de la base de données
-- À exécuter dans Supabase SQL Editor pour diagnostiquer le problème

-- 1. Vérifier si les colonnes logo_url existent
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_evenements'
    AND column_name = 'logo_url';

-- 2. Vérifier toutes les colonnes de la table inscription_evenements
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_evenements'
ORDER BY ordinal_position;

-- 3. Vérifier s'il y a des données avec logo_url
SELECT 
    id,
    nom,
    logo_url,
    CASE 
        WHEN logo_url IS NULL THEN 'NULL'
        WHEN logo_url = '' THEN 'EMPTY'
        ELSE 'HAS_VALUE'
    END as logo_status
FROM inscription_evenements
ORDER BY created_at DESC
LIMIT 10;

-- 4. Si la colonne n'existe pas, voici la commande pour l'ajouter :
-- ALTER TABLE inscription_evenements ADD COLUMN IF NOT EXISTS logo_url TEXT;
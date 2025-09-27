-- Script pour empêcher les doublons d'inscription session/participant
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- 1. VÉRIFIER LA STRUCTURE ACTUELLE
-- ==========================================

-- Voir la structure actuelle de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_session_participants'
ORDER BY ordinal_position;

-- Voir les contraintes existantes
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'inscription_session_participants'::regclass;

-- ==========================================
-- 2. AJOUTER CONTRAINTE UNIQUE (SI ELLE N'EXISTE PAS)
-- ==========================================

-- Vérifier si la contrainte existe déjà
DO $$ 
BEGIN
    -- Vérifier si la contrainte uk_session_participant existe
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conrelid = 'inscription_session_participants'::regclass 
        AND conname = 'uk_session_participant'
    ) THEN
        -- Créer la contrainte unique sur la combinaison session_id + participant_id
        ALTER TABLE inscription_session_participants 
        ADD CONSTRAINT uk_session_participant 
        UNIQUE (session_id, participant_id);
        
        RAISE NOTICE 'Contrainte unique uk_session_participant créée avec succès';
    ELSE
        RAISE NOTICE 'Contrainte unique uk_session_participant existe déjà - aucune action nécessaire';
    END IF;
END $$;

-- ==========================================
-- 3. NETTOYER LES DOUBLONS EXISTANTS (SI NÉCESSAIRE)
-- ==========================================

-- D'abord, identifier s'il y a des doublons existants
SELECT 
    session_id, 
    participant_id, 
    COUNT(*) as nb_inscriptions
FROM inscription_session_participants
GROUP BY session_id, participant_id
HAVING COUNT(*) > 1
ORDER BY nb_inscriptions DESC;

-- Si des doublons existent, supprimer les plus récents en gardant le premier
-- ATTENTION: Décommentez seulement si vous avez des doublons à nettoyer
/*
DELETE FROM inscription_session_participants
WHERE id NOT IN (
    SELECT MIN(id)
    FROM inscription_session_participants
    GROUP BY session_id, participant_id
);
*/

-- ==========================================
-- 4. VÉRIFICATION FINALE
-- ==========================================

-- Vérifier que la contrainte a été ajoutée
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'inscription_session_participants'::regclass
    AND conname = 'uk_session_participant';

-- Tester la contrainte avec une insertion en doublon (doit échouer)
-- ATTENTION: Remplacez par des IDs valides de votre base pour tester
/*
-- Cette insertion doit réussir
INSERT INTO inscription_session_participants (session_id, participant_id) 
VALUES ('test-session-id', 999);

-- Cette insertion doit échouer avec "duplicate key value violates unique constraint"
INSERT INTO inscription_session_participants (session_id, participant_id) 
VALUES ('test-session-id', 999);

-- Nettoyer le test
DELETE FROM inscription_session_participants 
WHERE session_id = 'test-session-id' AND participant_id = 999;
*/

-- ==========================================
-- 5. STATISTIQUES FINALES
-- ==========================================

-- Compter le nombre total d'inscriptions
SELECT COUNT(*) as total_inscriptions 
FROM inscription_session_participants;

-- Vérifier qu'il n'y a plus de doublons
SELECT 
    session_id, 
    participant_id, 
    COUNT(*) as nb_inscriptions
FROM inscription_session_participants
GROUP BY session_id, participant_id
HAVING COUNT(*) > 1;

-- Cette requête ne doit retourner aucun résultat si tout est correct
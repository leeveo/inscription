-- Script de vérification rapide - Protection anti-doublons
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- VÉRIFICATION ÉTAT ACTUEL
-- ==========================================

-- 1. Vérifier que RLS est désactivé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'inscription_session_participants';
-- Résultat attendu: rls_enabled = false

-- 2. Vérifier que la contrainte unique existe
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'inscription_session_participants'::regclass
    AND conname = 'uk_session_participant';
-- Résultat attendu: 1 ligne avec UNIQUE (session_id, participant_id)

-- 3. Vérifier qu'il n'y a pas de doublons existants
SELECT 
    session_id, 
    participant_id, 
    COUNT(*) as nb_inscriptions
FROM inscription_session_participants
GROUP BY session_id, participant_id
HAVING COUNT(*) > 1;
-- Résultat attendu: 0 ligne (aucun doublon)

-- 4. Statistiques générales
SELECT 
    COUNT(*) as total_inscriptions,
    COUNT(DISTINCT session_id) as nb_sessions_avec_participants,
    COUNT(DISTINCT participant_id) as nb_participants_inscrits
FROM inscription_session_participants;

-- ==========================================
-- RÉSUMÉ DE L'ÉTAT
-- ==========================================

-- Si les vérifications ci-dessus montrent :
-- ✅ RLS désactivé (rls_enabled = false)
-- ✅ Contrainte unique existe (uk_session_participant trouvée)
-- ✅ Aucun doublon (requête 3 retourne 0 ligne)
-- 
-- Alors la protection anti-doublons est COMPLÈTE et FONCTIONNELLE ! 🎯

-- ==========================================
-- TEST OPTIONNEL (décommentez si vous voulez tester)
-- ==========================================

/*
-- Test avec des valeurs fictives - ATTENTION: adaptez les IDs
BEGIN;

-- Tentative d'insertion d'un test
INSERT INTO inscription_session_participants (session_id, participant_id) 
VALUES ('test-session-12345', 99999);

-- Tentative de doublon (doit échouer)
INSERT INTO inscription_session_participants (session_id, participant_id) 
VALUES ('test-session-12345', 99999);

-- Cette dernière insertion doit échouer avec:
-- ERROR: duplicate key value violates unique constraint "uk_session_participant"

-- Nettoyer le test
DELETE FROM inscription_session_participants 
WHERE session_id = 'test-session-12345' AND participant_id = 99999;

ROLLBACK; -- Annuler toutes les modifications de test
*/
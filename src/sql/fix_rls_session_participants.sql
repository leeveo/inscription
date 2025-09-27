-- Script pour résoudre définitivement le problème RLS sur inscription_session_participants
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- OPTION 1: DÉSACTIVER RLS (Solution rapide)
-- ==========================================
-- Cette solution désactive complètement RLS sur la table
-- Recommandé pour le développement ou si vous n'avez pas besoin de restrictions d'accès

ALTER TABLE inscription_session_participants DISABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est désactivé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'inscription_session_participants';

-- ==========================================
-- OPTION 2: CRÉER DES POLITIQUES PERMISSIVES (Solution sécurisée)
-- ==========================================
-- Décommentez cette section si vous préférez garder RLS avec des politiques permissives

/*
-- Garder RLS activé mais créer des politiques permissives
ALTER TABLE inscription_session_participants ENABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes qui pourraient causer des problèmes
DROP POLICY IF EXISTS "Enable insert for all users" ON inscription_session_participants;
DROP POLICY IF EXISTS "Enable read for all users" ON inscription_session_participants;
DROP POLICY IF EXISTS "Enable update for all users" ON inscription_session_participants;
DROP POLICY IF EXISTS "Enable delete for all users" ON inscription_session_participants;

-- Créer des politiques permissives pour tous les utilisateurs
CREATE POLICY "Allow all operations for inscription_session_participants" 
ON inscription_session_participants
FOR ALL 
TO public 
USING (true)
WITH CHECK (true);

-- Alternative: Politiques séparées par opération
/*
CREATE POLICY "Enable insert for inscription_session_participants" 
ON inscription_session_participants 
FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Enable read for inscription_session_participants" 
ON inscription_session_participants 
FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Enable update for inscription_session_participants" 
ON inscription_session_participants 
FOR UPDATE 
TO public 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Enable delete for inscription_session_participants" 
ON inscription_session_participants 
FOR DELETE 
TO public 
USING (true);
*/
*/

-- ==========================================
-- VÉRIFICATION APRÈS CORRECTION
-- ==========================================

-- 1. Vérifier le statut RLS
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'inscription_session_participants';

-- 2. Lister les politiques existantes (si RLS est activé)
SELECT policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'inscription_session_participants';

-- 3. Tester une insertion simple
-- ATTENTION: Remplacez les valeurs par des IDs valides de votre base
/*
INSERT INTO inscription_session_participants (session_id, participant_id) 
VALUES ('votre-session-id', 999) 
ON CONFLICT (session_id, participant_id) DO NOTHING;
*/

-- 4. Compter les inscriptions pour vérifier
SELECT COUNT(*) as total_inscriptions 
FROM inscription_session_participants;

-- ==========================================
-- NOTES IMPORTANTES
-- ==========================================
/*
1. OPTION 1 (Désactiver RLS) : 
   - Avantage: Solution immédiate, plus simple
   - Inconvénient: Moins sécurisé, tous les utilisateurs peuvent accéder

2. OPTION 2 (Politiques permissives) :
   - Avantage: Maintient la structure de sécurité RLS
   - Inconvénient: Plus complexe à configurer

3. Pour la production, considérez des politiques plus restrictives basées sur :
   - L'authentification des utilisateurs
   - Les rôles (participant vs admin)
   - Les contraintes métier (ex: ne pas s'inscrire à des sessions pleines)

RECOMMANDATION: 
- Utilisez l'OPTION 1 pour résoudre rapidement le problème
- Implémentez l'OPTION 2 plus tard si vous avez besoin de sécurité granulaire
*/
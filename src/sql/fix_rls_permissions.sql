-- SQL pour désactiver RLS et permettre l'accès public aux tables nécessaires
-- À exécuter dans votre interface Supabase SQL Editor

-- Désactiver RLS sur la table inscription_sessions
ALTER TABLE inscription_sessions DISABLE ROW LEVEL SECURITY;

-- Optionellement, créer des politiques pour l'accès public
-- Si vous voulez garder RLS mais permettre l'accès public aux sessions

-- CREATE POLICY "Permettre lecture des sessions" ON inscription_sessions
--   FOR SELECT TO public USING (true);

-- CREATE POLICY "Permettre création des sessions" ON inscription_sessions
--   FOR INSERT TO public WITH CHECK (true);

-- CREATE POLICY "Permettre mise à jour des sessions" ON inscription_sessions
--   FOR UPDATE TO public USING (true);

-- CREATE POLICY "Permettre suppression des sessions" ON inscription_sessions
--   FOR DELETE TO public USING (true);

-- Vérifier les autres tables qui pourraient avoir le même problème
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;
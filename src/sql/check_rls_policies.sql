-- Script de diagnostic pour les politiques RLS sur inscription_session_participants
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier si RLS est activé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'inscription_session_participants';

-- 2. Lister toutes les politiques RLS existantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'inscription_session_participants';

-- 3. Vérifier la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'inscription_session_participants'
ORDER BY ordinal_position;

-- 4. Option: Créer une politique permissive pour les insertions (si nécessaire)
-- ATTENTION: À utiliser seulement si vous voulez permettre l'accès public à cette table
/*
CREATE POLICY "Enable insert for all users" ON "public"."inscription_session_participants"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON "public"."inscription_session_participants"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
*/

-- 5. Alternative: Désactiver RLS temporairement (non recommandé en production)
/*
ALTER TABLE inscription_session_participants DISABLE ROW LEVEL SECURITY;
*/

-- 6. Vérifier les permissions sur la table
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'inscription_session_participants';

-- 7. Compter les enregistrements existants
SELECT COUNT(*) as total_inscriptions 
FROM inscription_session_participants;
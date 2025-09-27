-- Script pour tester l'import et vérifier la structure de la table
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier la structure de la table inscription_participants
SELECT 
  'COLONNES PARTICIPANTS' as type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'inscription_participants'
ORDER BY ordinal_position;

-- 2. Tester une insertion minimale pour voir quelles colonnes sont obligatoires
-- Version corrigée sans statut_inscription
INSERT INTO inscription_participants (
  evenement_id,
  nom,
  prenom,
  email,
  telephone,
  profession,
  token
) VALUES (
  '6c3496a5-4a56-4a51-89a5-d932c323731d', -- Remplacez par un ID d'événement valide
  'Test',
  'Jean',
  'test.unique2@email.com',
  '0123456789',
  'Testeur',
  'testtoken456'
);

-- 3. Voir les derniers participants ajoutés pour comprendre la structure
SELECT 
  'PARTICIPANTS RÉCENTS' as type,
  id, nom, prenom, email, telephone, profession, statut_inscription, token, created_at
FROM inscription_participants
ORDER BY created_at DESC
LIMIT 5;
-- Script de diagnostic pour le scanner QR et l'événement 4896
-- Exécutez ce script dans Supabase SQL Editor pour diagnostiquer le problème

-- 1. Vérifier si l'événement avec ID 4896 existe
SELECT 
  'ÉVÉNEMENT PAR ID' as type,
  id,
  nom,
  code_acces,
  date_debut,
  lieu
FROM inscription_evenements 
WHERE id::text = '4896'
ORDER BY created_at DESC;

-- 2. Vérifier si il y a un événement avec code_acces = '4896'
SELECT 
  'ÉVÉNEMENT PAR CODE' as type,
  id,
  nom,
  code_acces,
  date_debut,
  lieu
FROM inscription_evenements 
WHERE code_acces = '4896'
ORDER BY created_at DESC;

-- 3. Lister tous les événements avec leurs codes d'accès
SELECT 
  'TOUS LES ÉVÉNEMENTS' as type,
  id,
  nom,
  code_acces,
  date_debut,
  lieu,
  created_at
FROM inscription_evenements 
ORDER BY created_at DESC
LIMIT 20;

-- 4. Vérifier les sessions pour l'événement 4896 (par ID)
SELECT 
  'SESSIONS PAR ID ÉVÉNEMENT' as type,
  s.id,
  s.titre,
  s.evenement_id,
  s.date,
  s.heure_debut,
  s.heure_fin
FROM inscription_sessions s
WHERE s.evenement_id::text = '4896'
ORDER BY s.date, s.heure_debut;

-- 5. Si l'événement existe, chercher ses sessions avec un JOIN pour être sûr
SELECT 
  'SESSIONS AVEC JOIN' as type,
  e.nom as evenement_nom,
  s.id as session_id,
  s.titre as session_titre,
  s.evenement_id,
  s.date,
  s.heure_debut,
  s.heure_fin
FROM inscription_evenements e
JOIN inscription_sessions s ON e.id = s.evenement_id
WHERE e.id::text = '4896' OR e.code_acces = '4896'
ORDER BY s.date, s.heure_debut;

-- 6. Compter les participants pour cet événement
SELECT 
  'PARTICIPANTS' as type,
  COUNT(*) as nombre_participants,
  evenement_id
FROM inscription_participants 
WHERE evenement_id::text = '4896'
GROUP BY evenement_id;

-- 7. Vérifier la structure des tables (types de données)
SELECT 
  'STRUCTURE ÉVÉNEMENTS' as type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'inscription_evenements' 
AND column_name IN ('id', 'code_acces', 'nom')
ORDER BY ordinal_position;

SELECT 
  'STRUCTURE SESSIONS' as type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'inscription_sessions' 
AND column_name IN ('id', 'evenement_id', 'titre')
ORDER BY ordinal_position;

-- 8. Exemples d'événements récents avec leurs sessions
SELECT 
  'EXEMPLES RÉCENTS' as type,
  e.id as event_id,
  e.nom as event_nom,
  e.code_acces,
  COUNT(s.id) as nb_sessions
FROM inscription_evenements e
LEFT JOIN inscription_sessions s ON e.id = s.evenement_id
GROUP BY e.id, e.nom, e.code_acces
ORDER BY e.created_at DESC
LIMIT 10;
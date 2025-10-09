-- Script pour associer les formulaires existants aux événements
-- Ce script aide à identifier et corriger les formulaires sans event_id

-- 1. Vérifier les formulaires sans event_id
SELECT 
  id,
  name,
  slug,
  created_at,
  event_id,
  CASE 
    WHEN event_id IS NULL THEN 'Sans événement associé'
    ELSE 'Associé à un événement'
  END as status
FROM builder_pages 
ORDER BY created_at DESC;

-- 2. Compter les formulaires par statut
SELECT 
  CASE 
    WHEN event_id IS NULL THEN 'Sans event_id'
    ELSE 'Avec event_id'
  END as type,
  COUNT(*) as nombre
FROM builder_pages 
GROUP BY (event_id IS NULL);

-- 3. Lister les événements disponibles pour référence
SELECT 
  id,
  nom,
  created_at
FROM inscription_evenements 
ORDER BY created_at DESC 
LIMIT 10;
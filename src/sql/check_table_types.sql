-- Script pour vérifier les types de colonnes des tables existantes
-- Nécessaire avant de créer les tables de check-in

-- Vérifier les types de colonnes des tables principales
SELECT 
  t.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
  AND t.table_name IN ('inscription_participants', 'inscription_evenements', 'inscription_sessions')
  AND c.column_name = 'id'
ORDER BY t.table_name, c.ordinal_position;

-- Vérifier spécifiquement les clés primaires
SELECT 
  tc.table_name,
  kcu.column_name,
  c.data_type
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.columns c 
  ON kcu.table_name = c.table_name 
  AND kcu.column_name = c.column_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('inscription_participants', 'inscription_evenements', 'inscription_sessions')
ORDER BY tc.table_name;
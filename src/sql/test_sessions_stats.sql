-- Script pour tester les statistiques de sessions
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Vérifier la structure des tables de sessions
SELECT 
  'COLONNES SESSIONS' as type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'inscription_sessions'
ORDER BY ordinal_position;

-- 2. Vérifier la structure de la table de liaison session-participants
SELECT 
  'COLONNES SESSION_PARTICIPANTS' as type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'inscription_session_participants'
ORDER BY ordinal_position;

-- 3. Lister les sessions existantes avec leurs statistiques
SELECT 
  s.id,
  s.titre,
  s.date,
  s.heure_debut,
  s.heure_fin,
  s.max_participants,
  COUNT(sp.participant_id) as participants_inscrits,
  CASE 
    WHEN s.max_participants IS NULL THEN 'Illimité'
    WHEN s.max_participants = 0 THEN 'Aucune place'
    ELSE CONCAT(ROUND((COUNT(sp.participant_id)::float / s.max_participants) * 100, 2), '%')
  END as taux_remplissage
FROM inscription_sessions s
LEFT JOIN inscription_session_participants sp ON s.id = sp.session_id
WHERE s.evenement_id = '40937bdf-97e9-4ec1-9d9b-003eab31ec70' -- Remplacez par l'ID de votre événement
GROUP BY s.id, s.titre, s.date, s.heure_debut, s.heure_fin, s.max_participants
ORDER BY s.date, s.heure_debut;

-- 4. Statistiques globales pour l'événement
WITH session_stats AS (
  SELECT 
    COUNT(DISTINCT s.id) as total_sessions,
    COUNT(sp.participant_id) as total_inscriptions,
    SUM(CASE WHEN s.max_participants IS NOT NULL THEN s.max_participants ELSE 0 END) as capacite_totale
  FROM inscription_sessions s
  LEFT JOIN inscription_session_participants sp ON s.id = sp.session_id
  WHERE s.evenement_id = '40937bdf-97e9-4ec1-9d9b-003eab31ec70' -- Remplacez par l'ID de votre événement
)
SELECT 
  'STATISTIQUES GLOBALES' as type,
  total_sessions,
  total_inscriptions,
  capacite_totale,
  CASE 
    WHEN capacite_totale = 0 THEN 'Capacité illimitée'
    ELSE CONCAT(ROUND((total_inscriptions::float / capacite_totale) * 100, 2), '%')
  END as taux_remplissage_global
FROM session_stats;

-- 5. Créer des données de test si les tables existent mais sont vides
-- (Décommentez les lignes suivantes si nécessaire)

/*
-- Insérer des sessions de test
INSERT INTO inscription_sessions (evenement_id, titre, description, date, heure_debut, heure_fin, type, max_participants) VALUES
('40937bdf-97e9-4ec1-9d9b-003eab31ec70', 'Conférence d''ouverture', 'Présentation des enjeux du digital', '2024-03-15', '09:00', '10:30', 'conférence', 100),
('40937bdf-97e9-4ec1-9d9b-003eab31ec70', 'Atelier Innovation', 'Workshop pratique sur l''innovation', '2024-03-15', '11:00', '12:30', 'atelier', 30),
('40937bdf-97e9-4ec1-9d9b-003eab31ec70', 'Table ronde', 'Échanges entre experts', '2024-03-15', '14:00', '15:30', 'conférence', 50);

-- Insérer des inscriptions de test (ajustez les participant_id selon vos données)
-- Vous devrez remplacer les IDs de participants par des IDs valides de votre table inscription_participants
INSERT INTO inscription_session_participants (session_id, participant_id) 
SELECT s.id, p.id
FROM inscription_sessions s
CROSS JOIN (SELECT id FROM inscription_participants LIMIT 25) p
WHERE s.evenement_id = '40937bdf-97e9-4ec1-9d9b-003eab31ec70'
AND s.titre = 'Conférence d''ouverture';
*/
-- Script de test pour vérifier les jauges de capacité des sessions
-- À exécuter après avoir ajouté le champ max_participants

-- 1. Vérifier que la colonne max_participants existe
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'inscription_sessions'
AND column_name = 'max_participants';

-- 2. Ajouter quelques valeurs de test max_participants (exemple)
-- ATTENTION : Remplacez les ID par de vrais ID de vos sessions
/*
UPDATE inscription_sessions 
SET max_participants = 20 
WHERE titre LIKE '%conférence%';

UPDATE inscription_sessions 
SET max_participants = 10 
WHERE titre LIKE '%atelier%';

UPDATE inscription_sessions 
SET max_participants = 50 
WHERE titre LIKE '%networking%';
*/

-- 3. Voir les sessions avec leurs limites
SELECT 
    id,
    titre,
    type,
    max_participants,
    date,
    heure_debut,
    heure_fin
FROM inscription_sessions 
ORDER BY date, heure_debut;

-- 4. Tester la vue des statistiques de capacité
SELECT * FROM session_capacity_stats;

-- 5. Tester les fonctions utilitaires (exemple avec un ID de session)
-- ATTENTION : Remplacez 'your-session-id' par un vrai ID de session
/*
SELECT session_has_capacity('your-session-id') as has_capacity;
SELECT get_remaining_capacity('your-session-id') as remaining_places;
*/

-- 6. Voir les inscriptions par session
SELECT 
    s.titre,
    s.max_participants,
    COUNT(sp.participant_id) as participants_inscrits,
    s.max_participants - COUNT(sp.participant_id) as places_restantes
FROM inscription_sessions s
LEFT JOIN inscription_session_participants sp ON s.id::text = sp.session_id::text
GROUP BY s.id, s.titre, s.max_participants
ORDER BY s.titre;
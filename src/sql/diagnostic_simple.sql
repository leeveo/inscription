-- DIAGNOSTIC RAPIDE - Modal Participants Vide
-- Compatible Supabase SQL Editor

-- ==========================================
-- TESTS ESSENTIELS
-- ==========================================

-- 1. Y a-t-il des inscriptions aux sessions ?
SELECT COUNT(*) as total_inscriptions_sessions
FROM inscription_session_participants;

-- 2. Y a-t-il des participants ?  
SELECT COUNT(*) as total_participants
FROM inscription_participants;

-- 3. Y a-t-il des sessions ?
SELECT COUNT(*) as total_sessions  
FROM inscription_sessions;

-- 4. Voir quelques sessions récentes
SELECT 
    id,
    titre,
    date,
    created_at
FROM inscription_sessions 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. Voir quelques inscriptions récentes
SELECT 
    session_id,
    participant_id, 
    created_at
FROM inscription_session_participants
ORDER BY created_at DESC
LIMIT 5;

-- 6. Test de relation simple - TRÈS IMPORTANT
SELECT 
    s.titre as session_nom,
    p.nom,
    p.prenom,
    p.email,
    sp.created_at as date_inscription
FROM inscription_session_participants sp
INNER JOIN inscription_sessions s ON sp.session_id = s.id  
INNER JOIN inscription_participants p ON sp.participant_id = p.id
ORDER BY sp.created_at DESC
LIMIT 5;

-- 7. Vérifier les types de données des IDs
SELECT 
    'sessions' as table_name,
    pg_typeof(id) as type_id
FROM inscription_sessions 
LIMIT 1;

SELECT 
    'participants' as table_name,
    pg_typeof(id) as type_id  
FROM inscription_participants
LIMIT 1;

SELECT 
    'session_participants_session_id' as table_name,
    pg_typeof(session_id) as type_id
FROM inscription_session_participants
LIMIT 1;

SELECT 
    'session_participants_participant_id' as table_name, 
    pg_typeof(participant_id) as type_id
FROM inscription_session_participants
LIMIT 1;

-- ==========================================
-- RÉSULTATS À ANALYSER
-- ==========================================

/*
📋 ATTENDU :
1. total_inscriptions_sessions > 0
2. total_participants > 0  
3. total_sessions > 0
4. Liste des 3 sessions récentes
5. Liste des 5 inscriptions récentes
6. ⚠️ CRUCIAL: Relation avec noms/emails des participants
7. Tous les types doivent être 'uuid' (ou cohérents)

🚨 PROBLÈMES POSSIBLES :
- Si requête 6 est VIDE alors que 1,2,3 > 0 → PROBLÈME DE RELATION
- Si types différents dans requête 7 → PROBLÈME DE COMPATIBILITÉ  
- Si participant_id ne correspond à aucun id → DONNÉES CORROMPUES

💡 PROCHAINE ÉTAPE :
Si requête 6 fonctionne et montre des participants, alors le problème
est dans le composant React (relations Supabase). 
Si requête 6 est vide, le problème est dans la base de données.
*/
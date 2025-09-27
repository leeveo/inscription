-- Script de diagnostic pour les participants dans les sessions
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- DIAGNOSTIC PARTICIPANTS NON AFFICHÉS
-- ==========================================

-- 1. Vérifier la structure des tables (compatible Supabase Web)
-- Structure de inscription_sessions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inscription_sessions'
ORDER BY ordinal_position;

-- Structure de inscription_participants  
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inscription_participants'
ORDER BY ordinal_position;

-- Structure de inscription_session_participants
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inscription_session_participants'
ORDER BY ordinal_position;

-- 2. Vérifier les données dans inscription_session_participants
SELECT 
    session_id, 
    participant_id, 
    created_at
FROM inscription_session_participants
ORDER BY created_at DESC
LIMIT 10;

-- 3. Vérifier les sessions existantes
SELECT 
    id,
    titre,
    date,
    heure_debut,
    heure_fin
FROM inscription_sessions
ORDER BY created_at DESC
LIMIT 5;

-- 4. Vérifier les participants existants
SELECT 
    id,
    nom,
    prenom,
    email
FROM inscription_participants
ORDER BY created_at DESC
LIMIT 5;

-- 5. Requête JOIN pour vérifier les relations - VERSION DÉTAILLÉE
SELECT 
    s.id as session_id,
    s.titre as session_titre,
    sp.participant_id,
    p.id as participant_real_id,
    p.nom,
    p.prenom,
    p.email,
    sp.created_at as inscription_date
FROM inscription_sessions s
INNER JOIN inscription_session_participants sp ON s.id = sp.session_id
INNER JOIN inscription_participants p ON sp.participant_id = p.id
ORDER BY s.titre, sp.created_at DESC;

-- 6. Vérifier les types de données des IDs
SELECT 
    pg_typeof(id) as session_id_type
FROM inscription_sessions
LIMIT 1;

SELECT 
    pg_typeof(id) as participant_id_type
FROM inscription_participants
LIMIT 1;

SELECT 
    pg_typeof(session_id) as session_id_fk_type,
    pg_typeof(participant_id) as participant_id_fk_type
FROM inscription_session_participants
LIMIT 1;

-- 7. Test de la requête exacte utilisée dans le composant React
SELECT 
    sp.participant_id,
    sp.created_at,
    row_to_json(p.*) as inscription_participants
FROM inscription_session_participants sp
LEFT JOIN inscription_participants p ON sp.participant_id = p.id
WHERE sp.session_id = (SELECT id FROM inscription_sessions LIMIT 1)
ORDER BY sp.created_at DESC;

-- 8. Vérifier s'il y a des participants avec des données NULL
SELECT 
    sp.session_id,
    sp.participant_id,
    p.nom,
    p.prenom,
    p.email,
    CASE 
        WHEN p.nom IS NULL THEN 'NOM NULL'
        WHEN p.prenom IS NULL THEN 'PRENOM NULL'
        WHEN p.email IS NULL THEN 'EMAIL NULL'
        ELSE 'DONNÉES OK'
    END as data_status
FROM inscription_session_participants sp
LEFT JOIN inscription_participants p ON sp.participant_id = p.id;

-- 9. Compter les participants par session
SELECT 
    s.titre,
    s.id as session_id,
    COUNT(sp.participant_id) as nb_participants
FROM inscription_sessions s
LEFT JOIN inscription_session_participants sp ON s.id = sp.session_id
GROUP BY s.id, s.titre
HAVING COUNT(sp.participant_id) > 0
ORDER BY nb_participants DESC;

-- 10. Vérifier les contraintes de clés étrangères
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('inscription_session_participants', 'inscription_sessions', 'inscription_participants');

-- ==========================================
-- INSTRUCTIONS DE DIAGNOSTIC
-- ==========================================

/*
🔍 COMMENT UTILISER CE SCRIPT :

1. Exécutez chaque requête une par une dans Supabase SQL Editor
2. Notez les résultats pour chaque requête
3. Si la requête 5 (JOIN) retourne des résultats vides alors que les requêtes 2, 3, 4 montrent des données, 
   il y a un problème de relation entre les tables
4. Si la requête 7 retourne NULL pour inscription_participants, cela explique pourquoi le modal est vide
5. Vérifiez que les types de données (requête 6) sont cohérents

📋 RÉSULTATS ATTENDUS :
- Requête 2 : Doit montrer les inscriptions aux sessions
- Requête 3 : Doit montrer les sessions existantes  
- Requête 4 : Doit montrer les participants existants
- Requête 5 : Doit montrer les jointures complètes (si vide = PROBLÈME)
- Requête 7 : Doit retourner les données participant en JSON
- Requête 9 : Doit montrer le nombre de participants par session

🚨 SIGNES DE PROBLÈMES :
- Requête 5 vide mais requêtes 2,3,4 avec données = problème de relation
- participant_id dans session_participants ne correspond à aucun id dans participants
- Types de données incompatibles entre les clés
- inscription_participants retourne NULL dans requête 7
*/
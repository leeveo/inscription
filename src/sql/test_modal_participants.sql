-- Script de test rapide pour diagnostiquer le problème modal participants
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- TESTS RAPIDES DE DIAGNOSTIC
-- ==========================================

-- 1. Compter les inscriptions aux sessions
SELECT COUNT(*) as total_inscriptions 
FROM inscription_session_participants;

-- 2. Compter les participants
SELECT COUNT(*) as total_participants 
FROM inscription_participants;

-- 3. Compter les sessions
SELECT COUNT(*) as total_sessions 
FROM inscription_sessions;

-- 4. Vérifier les données d'une session avec participants (remplacez SESSION_ID_ICI)
-- Obtenez d'abord l'ID d'une session :
SELECT id, titre FROM inscription_sessions LIMIT 5;

-- Puis utilisez cet ID dans la requête suivante (remplacez 'YOUR_SESSION_ID'):
SELECT 
    sp.participant_id,
    sp.created_at,
    p.id as p_id,
    p.nom,
    p.prenom,
    p.email
FROM inscription_session_participants sp
LEFT JOIN inscription_participants p ON sp.participant_id = p.id
WHERE sp.session_id = 'YOUR_SESSION_ID'  -- ⚠️ REMPLACEZ PAR UN VRAI ID
LIMIT 5;

-- 5. Test de la requête exacte du composant React (remplacez SESSION_ID_ICI)
SELECT 
    participant_id,
    created_at,
    inscription_participants (
        nom, prenom, email, telephone, profession, checked_in, checked_in_at, created_at
    )
FROM inscription_session_participants
WHERE session_id = 'YOUR_SESSION_ID'  -- ⚠️ REMPLACEZ PAR UN VRAI ID
ORDER BY created_at DESC;

-- 6. Si la requête 5 ne fonctionne pas, essayer cette version :
SELECT 
    sp.participant_id,
    sp.created_at as inscription_date,
    json_build_object(
        'nom', p.nom,
        'prenom', p.prenom,
        'email', p.email,
        'telephone', p.telephone,
        'profession', p.profession,
        'checked_in', p.checked_in,
        'checked_in_at', p.checked_in_at,
        'created_at', p.created_at
    ) as inscription_participants
FROM inscription_session_participants sp
INNER JOIN inscription_participants p ON sp.participant_id = p.id
WHERE sp.session_id = 'YOUR_SESSION_ID'  -- ⚠️ REMPLACEZ PAR UN VRAI ID
ORDER BY sp.created_at DESC;

-- ==========================================
-- INSTRUCTIONS
-- ==========================================

/*
📝 ÉTAPES À SUIVRE :

1. Exécutez les requêtes 1, 2, 3 pour vérifier qu'il y a des données

2. Exécutez la requête pour obtenir les IDs des sessions :
   SELECT id, titre FROM inscription_sessions LIMIT 5;

3. Copiez un ID de session qui a des participants et remplacez 'YOUR_SESSION_ID' 
   dans les requêtes 4, 5, et 6

4. Testez les requêtes dans l'ordre :
   - Requête 4 : Doit montrer les participants avec un simple JOIN
   - Requête 5 : Doit reproduire la requête du composant React
   - Requête 6 : Version alternative si la 5 ne fonctionne pas

🔍 RÉSULTATS ATTENDUS :
- Requêtes 1,2,3 : Doivent retourner des nombres > 0
- Requête 4 : Doit montrer les participants d'une session
- Requête 5 : Doit reproduire le problème OU montrer les données
- Requête 6 : Version de fallback qui doit fonctionner

💡 DIAGNOSTIC :
- Si requête 4 fonctionne mais 5 ne fonctionne pas → Problème de syntaxe Supabase
- Si toutes échouent → Problème de données ou de relations
- Si toutes fonctionnent → Problème dans le composant React

⚠️ N'OUBLIEZ PAS :
Remplacez 'YOUR_SESSION_ID' par un vrai ID de session avant d'exécuter !
*/
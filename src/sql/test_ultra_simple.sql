-- DIAGNOSTIC ULTRA SIMPLE - Modal Participants
-- Compatible avec Supabase SQL Editor

-- ==========================================
-- TEST 1: Y A-T-IL DES DONNÉES ?
-- ==========================================

-- Combien de sessions existent ?
SELECT COUNT(*) as sessions FROM inscription_sessions;

-- Combien de participants existent ?
SELECT COUNT(*) as participants FROM inscription_participants;

-- Combien d'inscriptions aux sessions existent ?
SELECT COUNT(*) as inscriptions FROM inscription_session_participants;

-- ==========================================
-- TEST 2: RELATION SIMPLE
-- ==========================================

-- Test de relation basique (doit montrer des participants)
SELECT 
    s.titre as session_nom,
    p.nom,
    p.prenom,
    p.email
FROM inscription_session_participants sp
JOIN inscription_sessions s ON sp.session_id = s.id  
JOIN inscription_participants p ON sp.participant_id = p.id
LIMIT 5;

-- ==========================================
-- TEST 3: IDENTIFIER UNE SESSION SPÉCIFIQUE
-- ==========================================

-- Sessions qui ont des participants
SELECT 
    s.id,
    s.titre,
    COUNT(sp.participant_id) as nb_participants
FROM inscription_sessions s
JOIN inscription_session_participants sp ON s.id = sp.session_id
GROUP BY s.id, s.titre
ORDER BY nb_participants DESC
LIMIT 3;

-- ==========================================
-- INSTRUCTIONS SIMPLES
-- ==========================================

/*
🎯 INTERPRÉTATION :

1. TEST 1 - Toutes les valeurs doivent être > 0
   Si une valeur = 0, il n'y a pas de données dans cette table

2. TEST 2 - Doit afficher des participants avec noms/emails
   Si vide alors que TEST 1 montre des données > 0 = PROBLÈME DE RELATION

3. TEST 3 - Doit montrer les sessions avec leur nombre de participants
   Copiez un ID de session pour un test plus poussé

✅ SI TOUS LES TESTS MARCHENT :
Le problème est dans le composant React, pas dans la base de données.
Le composant corrigé devrait maintenant fonctionner.

❌ SI TEST 2 EST VIDE :
Il y a un problème de relation ou de type de données.
Contactez le support avec les résultats des 3 tests.

🔧 PROCHAINE ÉTAPE :
Si les tests SQL marchent, ouvrez le modal participants
et vérifiez les logs de la console navigateur (F12).
*/
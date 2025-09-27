-- TEST SPÉCIFIQUE - Requête exacte du composant React
-- Compatible Supabase SQL Editor

-- ==========================================
-- ÉTAPE 1: IDENTIFIER UNE SESSION AVEC PARTICIPANTS
-- ==========================================

-- Trouvez une session qui a des participants
SELECT 
    s.id,
    s.titre,
    COUNT(sp.participant_id) as nb_participants
FROM inscription_sessions s
LEFT JOIN inscription_session_participants sp ON s.id = sp.session_id
GROUP BY s.id, s.titre
HAVING COUNT(sp.participant_id) > 0
ORDER BY nb_participants DESC
LIMIT 3;

-- ⚠️ COPIEZ UN ID DE SESSION CI-DESSUS POUR L'ÉTAPE 2

-- ==========================================
-- ÉTAPE 2: TESTER LA REQUÊTE EXACTE DU COMPOSANT
-- ==========================================

-- ⚠️ IMPORTANT: Remplacez 'VOTRE_SESSION_ID' par un vrai ID UUID de l'étape 1
-- Exemple: au lieu de 'VOTRE_SESSION_ID', utilisez quelque chose comme:
-- '12345678-1234-5678-9012-123456789abc'

-- Requête 1: Version originale du composant (peut échouer)
SELECT 
    participant_id,
    created_at,
    inscription_participants (
        nom, prenom, email, telephone, profession, checked_in, checked_in_at, created_at
    )
FROM inscription_session_participants
WHERE session_id = 'VOTRE_SESSION_ID'  -- ⚠️ REMPLACEZ PAR UN VRAI ID UUID
ORDER BY created_at DESC;

-- Requête 2: Version alternative (devrait marcher)
SELECT 
    sp.participant_id,
    sp.created_at as inscription_date,
    p.nom,
    p.prenom, 
    p.email,
    p.telephone,
    p.profession,
    p.checked_in,
    p.checked_in_at,
    p.created_at as participant_created_at
FROM inscription_session_participants sp
INNER JOIN inscription_participants p ON sp.participant_id = p.id
WHERE sp.session_id = 'VOTRE_SESSION_ID'  -- ⚠️ REMPLACEZ PAR UN VRAI ID UUID 
ORDER BY sp.created_at DESC;

-- Requête 3: Test de la relation Supabase avec syntaxe spéciale
SELECT 
    sp.participant_id,
    sp.created_at,
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
LEFT JOIN inscription_participants p ON sp.participant_id = p.id
WHERE sp.session_id = 'VOTRE_SESSION_ID'  -- ⚠️ REMPLACEZ PAR UN VRAI ID UUID
ORDER BY sp.created_at DESC;

-- ==========================================
-- GUIDE D'UTILISATION
-- ==========================================

/*
📝 INSTRUCTIONS :

1. Exécutez l'ÉTAPE 1 pour obtenir des IDs de sessions avec participants

2. Copiez un ID de session (format: 12345678-1234-5678-9012-123456789abc)

3. Dans l'ÉTAPE 2, remplacez CHAQUE OCCURRENCE de 'VOTRE_SESSION_ID' 
   par l'ID que vous avez copié

4. Exécutez les 3 requêtes une par une

🔍 RÉSULTATS ATTENDUS :

- Requête 1: Peut échouer avec erreur de syntaxe Supabase
- Requête 2: DOIT montrer les participants avec toutes leurs infos  
- Requête 3: Version alternative qui doit aussi marcher

🚨 DIAGNOSTIC :

- Si Requête 2 fonctionne et montre des participants → Le problème est 
  dans la syntaxe Supabase du composant React

- Si Requête 2 est vide → Problème de relation ou de données

- Si Requête 3 fonctionne mais pas Requête 1 → Incompatibilité syntaxe 
  Supabase pour les relations imbriquées

💡 SOLUTION :

Si Requête 2 marche, le composant React doit utiliser cette approche
(requêtes séparées) au lieu de la relation Supabase.
*/
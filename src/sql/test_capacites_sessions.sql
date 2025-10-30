-- Script de test pour la gestion des capacités de sessions
-- À exécuter dans Supabase SQL Editor

-- ==========================================
-- ÉTAPE 1: VÉRIFIER L'ÉTAT ACTUEL
-- ==========================================

-- Voir toutes les sessions avec leur capacité et nombre d'inscrits
SELECT 
    s.id,
    s.titre,
    s.max_participants,
    COUNT(sp.participant_id) as participants_inscrits,
    (s.max_participants - COUNT(sp.participant_id)) as places_restantes,
    CASE 
        WHEN s.max_participants IS NULL THEN 'Capacité illimitée'
        WHEN COUNT(sp.participant_id) >= s.max_participants THEN '❌ PLEINE'
        WHEN COUNT(sp.participant_id) >= (s.max_participants * 0.8) THEN '🟠 Presque pleine'
        ELSE '✅ Places disponibles'
    END as statut
FROM inscription_sessions s
LEFT JOIN inscription_session_participants sp ON s.id = sp.session_id
GROUP BY s.id, s.titre, s.max_participants
ORDER BY s.date, s.heure_debut;

-- ==========================================
-- ÉTAPE 2: CRÉER UNE SESSION DE TEST (OPTIONNEL)
-- ==========================================

/*
-- Décommentez pour créer une session de test avec capacité limitée
INSERT INTO inscription_sessions (
    evenement_id,
    titre,
    description,
    date,
    heure_debut,
    heure_fin,
    type,
    max_participants,
    lieu,
    intervenant
) VALUES (
    (SELECT id FROM inscription_evenements LIMIT 1), -- Prendre le premier événement
    'Test Session Capacité Limitée',
    'Session de test pour vérifier la gestion des capacités',
    '2025-01-15',
    '14:00',
    '15:00',
    'atelier',
    3, -- Limite de 3 participants
    'Salle de test',
    'Test Intervenant'
);
*/

-- ==========================================
-- ÉTAPE 3: SIMULER DES INSCRIPTIONS (OPTIONNEL)
-- ==========================================

/*
-- Décommentez pour simuler des inscriptions jusqu'à remplir la session
-- ATTENTION: Adaptez les IDs selon votre base de données

-- Identifier une session de test
SELECT id, titre, max_participants FROM inscription_sessions WHERE titre LIKE '%Test%';

-- Obtenir quelques participants
SELECT id, nom, prenom FROM inscription_participants ORDER BY created_at DESC LIMIT 5;

-- Inscrire des participants à la session de test
-- Remplacez 'SESSION_ID_ICI' par l'ID réel de votre session de test
-- Remplacez 'PARTICIPANT_ID_X' par les IDs réels des participants

INSERT INTO inscription_session_participants (session_id, participant_id) VALUES
('SESSION_ID_ICI', 'PARTICIPANT_ID_1'),
('SESSION_ID_ICI', 'PARTICIPANT_ID_2'),
('SESSION_ID_ICI', 'PARTICIPANT_ID_3');
-- Cette dernière insertion devrait échouer si la session est limitée à 3 participants
-- INSERT INTO inscription_session_participants (session_id, participant_id) VALUES ('SESSION_ID_ICI', 'PARTICIPANT_ID_4');
*/

-- ==========================================
-- ÉTAPE 4: VÉRIFICATION POST-TEST
-- ==========================================

-- Vérifier à nouveau l'état des sessions après les inscriptions
SELECT 
    s.id,
    s.titre,
    s.max_participants,
    COUNT(sp.participant_id) as participants_inscrits,
    CASE 
        WHEN s.max_participants IS NULL THEN 'Illimitée'
        ELSE CONCAT(COUNT(sp.participant_id), '/', s.max_participants)
    END as capacite,
    CASE 
        WHEN s.max_participants IS NULL THEN '✅ Ouverte'
        WHEN COUNT(sp.participant_id) >= s.max_participants THEN '🔴 FERMÉE'
        ELSE '🟢 Ouverte'
    END as statut_inscription
FROM inscription_sessions s
LEFT JOIN inscription_session_participants sp ON s.id = sp.session_id
GROUP BY s.id, s.titre, s.max_participants
ORDER BY s.date, s.heure_debut;

-- ==========================================
-- ÉTAPE 5: NETTOYAGE (OPTIONNEL)
-- ==========================================

/*
-- Décommentez pour supprimer les données de test
DELETE FROM inscription_session_participants 
WHERE session_id IN (
    SELECT id FROM inscription_sessions WHERE titre LIKE '%Test%'
);

DELETE FROM inscription_sessions WHERE titre LIKE '%Test%';
*/

-- ==========================================
-- RÉSUMÉ DES FONCTIONNALITÉS IMPLÉMENTÉES
-- ==========================================

/*
✅ FRONTEND (LandingRegistrationForm.tsx):
- Affichage visuel des sessions pleines avec badge "Complet"
- Désactivation des checkboxes pour les sessions pleines  
- Jauge de capacité avec codes couleurs (vert/orange/rouge)
- Messages détaillés sur les places restantes

✅ API (/api/sessions/participants/route.ts):
- Vérification de la capacité avant chaque inscription
- Comptage en temps réel des participants inscrits
- Refus d'inscription avec code erreur 409 si session pleine
- Messages d'erreur détaillés avec informations de capacité

✅ GESTION D'ERREURS:
- Messages spécifiques pour sessions pleines
- Affichage du nom de la session et de la capacité dans l'erreur
- Gestion gracieuse des erreurs côté frontend

🎯 PROTECTION COMPLÈTE:
- Double protection frontend + backend
- Impossible de contourner la limitation
- Gestion des conditions de course (race conditions)
*/
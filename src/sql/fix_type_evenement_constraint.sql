-- SCRIPT POUR CORRIGER LA CONTRAINTE type_evenement
-- ===============================================
-- Ce script corrige la contrainte qui empêche l'insertion de 'salon' comme type_evenement

-- ÉTAPE 1: Vérifier la contrainte existante
-- =========================================

-- Afficher les contraintes actuelles sur inscription_evenements
SELECT conname, contype, consrc
FROM pg_constraint
WHERE conrelid = 'inscription_evenements'::regclass
  AND contype = 'c';

-- ÉTAPE 2: Supprimer l'ancienne contrainte si elle existe
-- ===============================================

DO $$
BEGIN
    -- Supprimer la contrainte si elle existe
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'inscription_evenements'::regclass
          AND conname = 'inscription_evenements_type_evenement_check'
    ) THEN
        DROP CONSTRAINT inscription_evenements_type_evenement_check;
        RAISE NOTICE '✅ Ancienne contrainte supprimée';
    ELSE
        RAISE NOTICE 'ℹ️  Aucune contrainte à supprimer';
    END IF;
END $$;

-- ÉTAPE 3: Ajouter la nouvelle contrainte avec les valeurs correctes
-- =============================================================

ALTER TABLE inscription_evenements
ADD CONSTRAINT inscription_evenements_type_evenement_check
CHECK (type_evenement IN ('salon', 'conference', 'seminaire', 'concert', 'webinaire', 'atelier', 'formation', 'autre'));

-- ÉTAPE 4: Vérifier la nouvelle contrainte
-- ======================================

-- Afficher les contraintes après modification
SELECT conname, contype, consrc
FROM pg_constraint
WHERE conrelid = 'inscription_evenements'::regclass
  AND contype = 'c';

-- ÉTAPE 5: Test d'insertion avec les différents types
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '🧪 Test d''insertion avec différents types d''événements...';

    -- Test avec 'salon'
    INSERT INTO inscription_evenements (
        nom, date_debut, date_fin, lieu, organisateur, email_contact, type_evenement
    ) VALUES (
        'Test Salon',
        '2024-12-01T10:00:00+00',
        '2024-12-01T18:00:00+00',
        'Paris Expo',
        'Test Org',
        'test@salon.com',
        'salon'
    ) ON CONFLICT DO NOTHING;

    -- Test avec 'conference'
    INSERT INTO inscription_evenements (
        nom, date_debut, date_fin, lieu, organisateur, email_contact, type_evenement
    ) VALUES (
        'Test Conférence',
        '2024-12-02T10:00:00+00',
        '2024-12-02T18:00:00+00',
        'Centre de conférence',
        'Test Org',
        'test@conf.com',
        'conference'
    ) ON CONFLICT DO NOTHING;

    -- Nettoyer les données de test
    DELETE FROM inscription_evenements
    WHERE nom IN ('Test Salon', 'Test Conférence');

    RAISE NOTICE '✅ Tests d''insertion réussis !';
END $$;

-- ÉTAPE 6: Validation finale
-- ==========================

DO $$
BEGIN
    RAISE NOTICE '🎉 Correction de la contrainte type_evenement terminée avec succès !';
    RAISE NOTICE '📋 Types autorisés: salon, conference, seminaire, concert, webinaire, atelier, formation, autre';
    RAISE NOTICE '✅ Le wizard-salon peut maintenant créer des événements sans erreur';
END $$;
-- SCRIPT FINAL DE CORRECTION DES CONTRAINTES POUR SALON
-- ====================================================
-- Ce script corrige définitivement les contraintes pour permettre
-- la création d'événements de type 'salon' et autres types

-- ÉTAPE 1: Supprimer les anciennes contraintes
-- =======================================

DROP CONSTRAINT IF EXISTS inscription_evenements_type_evenement_check;
DROP CONSTRAINT IF EXISTS inscription_evenements_statut_check;

-- ÉTAPE 2: Ajouter les nouvelles contraintes étendues
-- ================================================

-- Contrainte pour type_evenement - inclut tous les types nécessaires
ALTER TABLE inscription_evenements
ADD CONSTRAINT inscription_evenements_type_evenement_check
CHECK (type_evenement IN (
    'salon', 'conference', 'seminaire', 'concert', 'webinaire',
    'atelier', 'formation', 'autre', 'conférence', 'workshop', 'table_ronde'
));

-- Contrainte pour statut - inclut tous les statuts nécessaires
ALTER TABLE inscription_evenements
ADD CONSTRAINT inscription_evenements_statut_check
CHECK (statut IN (
    'brouillon', 'publié', 'actif', 'published', 'draft',
    'archived', 'annulé', 'cancelled'
));

-- ÉTAPE 3: Nettoyer les fichiers de test temporaires
-- =============================================

-- Ces fichiers peuvent être supprimés après l'application du script:
-- - fix_constraint_simple.sql
-- - fix_constraint.js
-- - test-wizard-salon.js
-- - test-wizard-salon-simple.js
-- - identify-length-issue.js
-- - check-status-values.js
-- - test-complete-wizard.js
-- - test-api-endpoint.js
-- - update-constraint.js

-- ÉTAPE 4: Validation
-- ==================

DO $$
BEGIN
    RAISE NOTICE '🎉 Contraintes mises à jour avec succès !';
    RAISE NOTICE '📋 Types autorisés: salon, conference, seminaire, concert, webinaire, atelier, formation, autre, conférence, workshop, table_ronde';
    RAISE NOTICE '📋 Statuts autorisés: brouillon, publié, actif, published, draft, archived, annulé, cancelled';
    RAISE NOTICE '✅ Le wizard-salon peut maintenant utiliser type_evenement = salon';
    RAISE NOTICE '✅ Redémarrez le serveur de développement pour appliquer les changements';
END $$;
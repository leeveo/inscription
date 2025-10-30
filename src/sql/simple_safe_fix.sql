-- SCRIPT SIMPLE ET SAFE POUR SUPABASE
-- ==================================
-- ✅ 100% Safe pour production
-- ✅ Syntaxe compatible Supabase
-- ✅ Modifie seulement les contraintes, pas les données

-- ÉTAPE 1: Supprimer les anciennes contraintes si elles existent
-- ======================================================

ALTER TABLE inscription_evenements DROP CONSTRAINT IF EXISTS inscription_evenements_type_evenement_check;
ALTER TABLE inscription_evenements DROP CONSTRAINT IF EXISTS inscription_evenements_statut_check;

-- ÉTAPE 2: Ajouter les nouvelles contraintes étendues
-- ================================================

-- Contrainte pour type_evenement - inclut 'salon' et tous les types nécessaires
ALTER TABLE inscription_evenements
ADD CONSTRAINT inscription_evenements_type_evenement_check
CHECK (type_evenement IN (
    'salon', 'conference', 'seminaire', 'concert', 'webinaire',
    'atelier', 'formation', 'autre', 'conférence', 'workshop',
    'table_ronde', 'presentation', 'networking'
));

-- Contrainte pour statut - inclut tous les statuts nécessaires
ALTER TABLE inscription_evenements
ADD CONSTRAINT inscription_evenements_statut_check
CHECK (statut IN (
    'brouillon', 'publié', 'actif', 'published', 'draft',
    'archived', 'annulé', 'cancelled', 'terminé', 'en_cours'
));

-- ÉTAPE 3: Validation
-- ==================

SELECT 'Contraintes mises à jour avec succès !' as status;
SELECT 'Types autorisés: salon, conference, seminaire, concert, webinaire, atelier, formation, autre, conférence, workshop, table_ronde, presentation, networking' as types_autorises;
SELECT 'Statuts autorisés: brouillon, publié, actif, published, draft, archived, annulé, cancelled, terminé, en_cours' as statuts_autorises;
-- Script simple pour corriger la contrainte type_evenement
-- Supprimer l'ancienne contrainte et en créer une nouvelle

ALTER TABLE inscription_evenements DROP CONSTRAINT IF EXISTS inscription_evenements_type_evenement_check;

ALTER TABLE inscription_evenements
ADD CONSTRAINT inscription_evenements_type_evenement_check
CHECK (type_evenement IN ('salon', 'conference', 'seminaire', 'concert', 'webinaire', 'atelier', 'formation', 'autre'));
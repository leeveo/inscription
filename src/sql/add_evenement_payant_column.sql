-- Migration: Ajouter la colonne evenement_payant
-- Description: Ajoute une colonne pour indiquer si un événement est payant et utilise la billetterie
-- Date: 2025-10-12

-- Ajouter la colonne evenement_payant à la table inscription_evenements
ALTER TABLE inscription_evenements
ADD COLUMN evenement_payant BOOLEAN DEFAULT FALSE NOT NULL;

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN inscription_evenements.evenement_payant IS 'Indique si l''événement utilise la billetterie en ligne (Stripe) pour la vente de billets';

-- Créer un index pour les requêtes sur les événements payants
CREATE INDEX idx_inscription_evenements_payant ON inscription_evenements(evenement_payant);

-- Mettre à jour les événements existants qui ont un prix > 0 comme payants
UPDATE inscription_evenements
SET evenement_payant = TRUE
WHERE prix IS NOT NULL AND prix > 0;
-- Ajouter le champ email_envoi à la table inscription_evenements
-- Ce champ permettra de définir l'adresse email d'expédition personnalisée pour chaque événement

ALTER TABLE inscription_evenements
ADD COLUMN email_envoi TEXT;

-- Ajouter un commentaire pour décrire le champ
COMMENT ON COLUMN inscription_evenements.email_envoi IS 'Adresse email d''expédition personnalisée pour les emails de l''événement (via Brevo)';
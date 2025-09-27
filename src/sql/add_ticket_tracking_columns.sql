-- Script pour ajouter les colonnes de suivi des tickets envoyés
-- Compatible Supabase

-- Ajouter les colonnes pour tracker les tickets envoyés
ALTER TABLE inscription_participants 
ADD COLUMN IF NOT EXISTS ticket_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ticket_sent_at TIMESTAMPTZ NULL;

-- Ajouter un commentaire sur ces colonnes
COMMENT ON COLUMN inscription_participants.ticket_sent IS 'Indique si le ticket a été envoyé par email au participant';
COMMENT ON COLUMN inscription_participants.ticket_sent_at IS 'Date et heure d''envoi du ticket par email';

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_participants_ticket_sent 
ON inscription_participants(ticket_sent, ticket_sent_at);

-- Vérifier que les colonnes ont été ajoutées
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'inscription_participants'
  AND column_name IN ('ticket_sent', 'ticket_sent_at')
  AND table_schema = 'public';

-- Afficher quelques statistiques
SELECT 
    COUNT(*) as total_participants,
    COUNT(CASE WHEN ticket_sent = true THEN 1 END) as tickets_sent,
    COUNT(CASE WHEN ticket_sent = false OR ticket_sent IS NULL THEN 1 END) as tickets_not_sent
FROM inscription_participants;
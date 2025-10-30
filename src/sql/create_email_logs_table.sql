-- Script pour créer une table de logs d'envoi d'emails (optionnel)
-- À exécuter dans Supabase SQL Editor si vous voulez suivre les envois

-- 1. Créer la table email_send_logs si elle n'existe pas
CREATE TABLE IF NOT EXISTS email_send_logs (
    id SERIAL PRIMARY KEY,
    evenement_id UUID NOT NULL REFERENCES inscription_evenements(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES inscription_participants(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_used TEXT,
    ticket_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    provider_response JSONB
);

-- 2. Ajouter des commentaires
COMMENT ON TABLE email_send_logs IS 'Logs des emails envoyés aux participants';
COMMENT ON COLUMN email_send_logs.evenement_id IS 'Référence vers l''événement';
COMMENT ON COLUMN email_send_logs.participant_id IS 'Référence vers le participant';
COMMENT ON COLUMN email_send_logs.email_address IS 'Adresse email du destinataire';
COMMENT ON COLUMN email_send_logs.subject IS 'Sujet de l''email envoyé';
COMMENT ON COLUMN email_send_logs.template_used IS 'Template utilisé pour l''email';
COMMENT ON COLUMN email_send_logs.ticket_url IS 'URL du billet envoyé';
COMMENT ON COLUMN email_send_logs.sent_at IS 'Date et heure d''envoi';
COMMENT ON COLUMN email_send_logs.status IS 'Statut de l''envoi (sent, failed, pending)';
COMMENT ON COLUMN email_send_logs.error_message IS 'Message d''erreur si l''envoi a échoué';
COMMENT ON COLUMN email_send_logs.provider_response IS 'Réponse JSON du service d''email (MailerSend, etc.)';

-- 3. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_email_logs_evenement_id ON email_send_logs(evenement_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_participant_id ON email_send_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_send_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_send_logs(status);

-- 4. Vérifier la création de la table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
    AND table_name = 'email_send_logs'
ORDER BY ordinal_position;
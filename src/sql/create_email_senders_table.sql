-- Table pour gérer les adresses d'envoi autorisées par domaine/utilisateur
CREATE TABLE IF NOT EXISTS authorized_email_senders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- ID de l'utilisateur qui possède cette adresse (future multi-tenancy)
  event_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE, -- Optionnel: lié à un événement spécifique

  -- Informations de l'adresse d'envoi
  email_address VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),

  -- Statut de vérification
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  verification_method VARCHAR(20) DEFAULT 'manual' CHECK (verification_method IN ('manual', 'dns', 'brevo_api')),

  -- Configuration
  is_default BOOLEAN DEFAULT false, -- Email par défaut pour l'utilisateur
  is_active BOOLEAN DEFAULT true, -- Actif/Inactif

  -- Limites d'utilisation
  daily_limit INTEGER DEFAULT 100,
  monthly_limit INTEGER DEFAULT 3000,

  -- Méta-données
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,

  -- Notes et documentation
  notes TEXT,

  -- Contraintes d'unicité
  UNIQUE(email_address)
);

-- Index pour les performances
CREATE INDEX idx_authorized_senders_user_id ON authorized_email_senders(user_id);
CREATE INDEX idx_authorized_senders_event_id ON authorized_email_senders(event_id);
CREATE INDEX idx_authorized_senders_status ON authorized_email_senders(verification_status);
CREATE INDEX idx_authorized_senders_active ON authorized_email_senders(is_active);

-- Insérer l'email par défaut du SaaS
INSERT INTO authorized_email_senders (
  email_address,
  display_name,
  verification_status,
  verification_method,
  is_default,
  is_active,
  notes
) VALUES (
  'waibooth.app@gmail.com',
  'Waibooth',
  'verified',
  'manual',
  true,
  true,
  'Email par défaut du SaaS Waibooth'
) ON CONFLICT (email_address) DO NOTHING;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_authorized_email_senders_updated_at
    BEFORE UPDATE ON authorized_email_senders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
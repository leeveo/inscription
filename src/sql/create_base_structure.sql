-- CRÉATION DE LA STRUCTURE DE BASE POUR WIZARD-SALON
-- ===================================================

-- Extension UUID si non existante
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE PRINCIPALE DES ÉVÉNEMENTS
-- ==================================
CREATE TABLE IF NOT EXISTS inscription_evenements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Informations de base
    nom TEXT NOT NULL,
    description TEXT,
    date_debut TIMESTAMPTZ NOT NULL,
    date_fin TIMESTAMPTZ NOT NULL,
    lieu TEXT NOT NULL,

    -- Organisation
    organisateur TEXT NOT NULL,
    email_contact TEXT NOT NULL,
    telephone_contact TEXT,

    -- Configuration
    places_disponibles INTEGER DEFAULT NULL,
    prix NUMERIC DEFAULT 0,
    code_acces TEXT,
    evenement_payant BOOLEAN DEFAULT false,
    logo_url TEXT,

    -- Métadonnées
    type_evenement TEXT DEFAULT 'salon', -- 'salon', 'conference', 'concert', etc.
    statut TEXT DEFAULT 'brouillon', -- 'brouillon', 'publie', 'archivé'
    type_localisation TEXT DEFAULT 'lieu', -- 'lieu', 'en_ligne', 'non_applicable'

    -- Configuration emails
    email_template TEXT DEFAULT 'professional',
    email_subject TEXT DEFAULT 'Confirmation d''inscription au Salon - {{event_name}}',
    couleur_header_email TEXT DEFAULT '#3b82f6',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLE PARTICIPANTS
-- ======================
CREATE TABLE IF NOT EXISTS inscription_participants (
    id SERIAL PRIMARY KEY,
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,

    -- Informations personnelles
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,

    -- Informations professionnelles
    entreprise TEXT,
    profession TEXT,
    site_web TEXT,

    -- Salons spécifiques
    objectif_visite TEXT,
    participant_type TEXT DEFAULT 'visiteur', -- 'visiteur' | 'exposant_staff'
    exposant_id UUID REFERENCES salon_exposants(id) ON DELETE SET NULL,

    -- Social
    url_linkedin TEXT,
    url_facebook TEXT,
    url_twitter TEXT,
    url_instagram TEXT,

    -- Gestion
    checked_in BOOLEAN DEFAULT false,
    checked_in_at TIMESTAMPTZ,
    token_landing_page TEXT,
    ticket_sent BOOLEAN DEFAULT false,
    ticket_sent_at TIMESTAMPTZ,

    -- Nouveaux champs
    statut_inscription TEXT DEFAULT 'confirmé',
    date_inscription TIMESTAMPTZ DEFAULT NOW(),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE SESSIONS/AGENDA
-- ========================
CREATE TABLE IF NOT EXISTS inscription_sessions (
    id SERIAL PRIMARY KEY,
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,

    titre TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,

    -- Localisation
    lieu TEXT, -- Salle, espace, etc.

    -- Intervenant
    intervenant TEXT, -- Nom de l'intervenant (texte simple)

    -- Configuration
    type TEXT DEFAULT 'conference', -- 'conference', 'workshop', 'table-ronde', etc.
    max_participants INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLE PARTICIPATION AUX SESSIONS (Many-to-Many)
-- ================================================
CREATE TABLE IF NOT EXISTS inscription_session_participants (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES inscription_sessions(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES inscription_participants(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unicité
    UNIQUE(session_id, participant_id)
);

-- 5. TABLE CHECK-INS
-- =================
CREATE TABLE IF NOT EXISTS inscription_checkins (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER REFERENCES inscription_participants(id) ON DELETE CASCADE,
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES inscription_sessions(id) ON DELETE SET NULL,

    checked_in_at TIMESTAMPTZ DEFAULT NOW(),
    checked_by TEXT,
    qr_token TEXT,
    device_info JSONB,
    notes TEXT,

    -- Unicité
    UNIQUE(participant_id, session_id)
);

-- 6. TABLE TOKENS QR
-- ===================
CREATE TABLE IF NOT EXISTS inscription_participant_qr_tokens (
    id SERIAL PRIMARY KEY,
    participant_id INTEGER REFERENCES inscription_participants(id) ON DELETE CASCADE,
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,

    qr_token TEXT NOT NULL UNIQUE,
    ticket_url TEXT,

    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unicité
    UNIQUE(participant_id, evenement_id)
);

-- 7. TABLE CONFIGURATION PAGES LANDING
-- =====================================
CREATE TABLE IF NOT EXISTS landing_page_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE UNIQUE,

    template_id TEXT DEFAULT 'modern-gradient',
    customization JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLE EMAIL TEMPLATES
-- ========================
CREATE TABLE IF NOT EXISTS inscription_email_templates (
    id SERIAL PRIMARY KEY,
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE UNIQUE,

    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLE TICKET EMAIL TEMPLATES
-- ===============================
CREATE TABLE IF NOT EXISTS inscription_ticket_templates (
    id SERIAL PRIMARY KEY,
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE UNIQUE,

    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la performance
CREATE INDEX IF NOT EXISTS idx_inscription_evenements_created_at ON inscription_evenements(created_at);
CREATE INDEX IF NOT EXISTS idx_inscription_participants_evenement_id ON inscription_participants(evenement_id);
CREATE INDEX IF NOT EXISTS idx_inscription_participants_email ON inscription_participants(email);
CREATE INDEX IF NOT EXISTS idx_inscription_sessions_evenement_id ON inscription_sessions(evenement_id);
CREATE INDEX IF NOT EXISTS idx_inscription_checkins_participant_id ON inscription_checkins(participant_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers
CREATE TRIGGER update_inscription_evenements_updated_at BEFORE UPDATE ON inscription_evenements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscription_participants_updated_at BEFORE UPDATE ON inscription_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscription_sessions_updated_at BEFORE UPDATE ON inscription_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_page_configs_updated_at BEFORE UPDATE ON landing_page_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscription_email_templates_updated_at BEFORE UPDATE ON inscription_email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inscription_ticket_templates_updated_at BEFORE UPDATE ON inscription_ticket_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
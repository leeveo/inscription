-- CRÉATION COMPLÈTE DE LA STRUCTURE POUR WIZARD-SALON
-- ===================================================

-- Extension UUID si non existante
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE PRINCIPALE DES ÉVÉNEMENTS (doit être créée en premier)
-- ================================================================
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
    type_evenement TEXT DEFAULT 'salon',
    statut TEXT DEFAULT 'brouillon',
    type_localisation TEXT DEFAULT 'lieu',

    -- Configuration emails
    email_template TEXT DEFAULT 'professional',
    email_subject TEXT DEFAULT 'Confirmation d''inscription au Salon - {{event_name}}',
    couleur_header_email TEXT DEFAULT '#3b82f6',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLES SPÉCIFIQUES AU SALON (créées avant les références)
-- ============================================================

-- Table exposants
CREATE TABLE IF NOT EXISTS salon_exposants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,

    -- Informations du contact
    nom_contact TEXT NOT NULL,
    prenom_contact TEXT NOT NULL,
    email_contact TEXT NOT NULL,
    telephone_contact TEXT,

    -- Informations de l'entreprise
    entreprise_exposante TEXT NOT NULL,
    poste_contact TEXT,
    secteur_activite TEXT,
    linkedin TEXT,

    -- Informations spécifiques salon
    numero_stand TEXT NOT NULL,
    description_entreprise TEXT,

    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table intervenants
CREATE TABLE IF NOT EXISTS salon_intervenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,

    -- Informations personnelles
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,

    -- Informations professionnelles
    entreprise TEXT,
    poste TEXT,
    bio TEXT,
    photo_url TEXT,

    -- Réseaux sociaux
    linkedin TEXT,
    twitter TEXT,

    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table configurations salon
CREATE TABLE IF NOT EXISTS salon_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE UNIQUE,

    -- Configuration check-in
    checkin_type TEXT DEFAULT 'qrcode',
    badge_template TEXT DEFAULT 'professional',

    -- Configuration emails
    invitation_email_template TEXT DEFAULT 'template_salon',
    email_subject TEXT DEFAULT 'Confirmation d''inscription au Salon - {{event_name}}',
    couleur_header_email TEXT DEFAULT '#3b82f6',

    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLE PARTICIPANTS (avec références correctes)
-- ============================================
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
    participant_type TEXT DEFAULT 'visiteur',
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

-- 4. TABLE SESSIONS/AGENDA
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
    lieu TEXT,
    intervenant TEXT,

    -- Configuration
    type TEXT DEFAULT 'conference',
    max_participants INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLE PARTICIPATION AUX SESSIONS
-- ======================================
CREATE TABLE IF NOT EXISTS inscription_session_participants (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES inscription_sessions(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES inscription_participants(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unicité
    UNIQUE(session_id, participant_id)
);

-- 6. TABLE CHECK-INS
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

-- 7. TABLE TOKENS QR
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

-- 8. TABLE CONFIGURATION PAGES LANDING
-- =====================================
CREATE TABLE IF NOT EXISTS landing_page_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE UNIQUE,

    template_id TEXT DEFAULT 'modern-gradient',
    customization JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLE EMAIL TEMPLATES
-- ========================
CREATE TABLE IF NOT EXISTS inscription_email_templates (
    id SERIAL PRIMARY KEY,
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE UNIQUE,

    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. TABLE TICKET EMAIL TEMPLATES
-- ================================
CREATE TABLE IF NOT EXISTS inscription_ticket_templates (
    id SERIAL PRIMARY KEY,
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE UNIQUE,

    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. TABLE ANALYTICS VISITES LANDING
-- ===================================
CREATE TABLE IF NOT EXISTS landing_page_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participant_id INTEGER REFERENCES inscription_participants(id) ON DELETE SET NULL,
    event_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,

    token TEXT,
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    converted BOOLEAN DEFAULT false,
    conversion_at TIMESTAMPTZ
);

-- INDEX POUR LA PERFORMANCE
-- =========================
CREATE INDEX IF NOT EXISTS idx_salon_exposants_evenement_id ON salon_exposants(evenement_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_salon_exposants_stand_unique ON salon_exposants(evenement_id, numero_stand);

CREATE INDEX IF NOT EXISTS idx_salon_intervenants_evenement_id ON salon_intervenants(evenement_id);

CREATE INDEX IF NOT EXISTS idx_salon_configurations_evenement_id ON salon_configurations(evenement_id);

CREATE INDEX IF NOT EXISTS idx_inscription_evenements_created_at ON inscription_evenements(created_at);
CREATE INDEX IF NOT EXISTS idx_inscription_participants_evenement_id ON inscription_participants(evenement_id);
CREATE INDEX IF NOT EXISTS idx_inscription_participants_email ON inscription_participants(email);
CREATE INDEX IF NOT EXISTS idx_institution_participants_exposant_id ON inscription_participants(exposant_id);

CREATE INDEX IF NOT EXISTS idx_inscription_sessions_evenement_id ON inscription_sessions(evenement_id);
CREATE INDEX IF NOT EXISTS idx_inscription_checkins_participant_id ON inscription_checkins(participant_id);

CREATE INDEX IF NOT EXISTS idx_landing_page_visits_event_id ON landing_page_visits(event_id);
CREATE INDEX IF NOT EXISTS idx_landing_page_visits_token ON landing_page_visits(token);

-- VUES POUR SIMPLIFIER LES REQUÊTES
-- ==================================

-- Vue pour les exposants avec infos événement
CREATE OR REPLACE VIEW vue_exposants_complet AS
SELECT
    e.id as exposant_id,
    e.nom_contact,
    e.prenom_contact,
    e.email_contact,
    e.telephone_contact,
    e.entreprise_exposante,
    e.poste_contact,
    e.secteur_activite,
    e.numero_stand,
    e.description_entreprise,
    e.linkedin,
    ev.nom as nom_evenement,
    ev.date_debut,
    ev.date_fin,
    ev.lieu,
    e.created_at
FROM salon_exposants e
JOIN inscription_evenements ev ON e.evenement_id = ev.id;

-- Vue pour les participants avec stats
CREATE OR REPLACE VIEW vue_participants_stats AS
SELECT
    p.id,
    p.nom,
    p.prenom,
    p.email,
    p.entreprise,
    p.participant_type,
    p.objectif_visite,
    p.checked_in,
    p.checked_in_at,
    p.statut_inscription,
    p.date_inscription,
    ev.nom as evenement_nom,
    ev.date_debut as evenement_date,
    CASE
        WHEN p.checked_in THEN true
        ELSE false
    END as present
FROM inscription_participants p
JOIN inscription_evenements ev ON p.evenement_id = ev.id;

-- TRIGGER POUR updated_at
-- ========================
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

CREATE TRIGGER update_salon_exposants_updated_at BEFORE UPDATE ON salon_exposants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salon_intervenants_updated_at BEFORE UPDATE ON salon_intervenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salon_configurations_updated_at BEFORE UPDATE ON salon_configurations
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

-- DONNÉES DE TEST OPTIONNELLES
-- =========================
-- Vous pouvez décommenter ces lignes pour tester avec des données exemples

/*
-- Événement test
INSERT INTO inscription_evenements (
    nom, description, date_debut, date_fin, lieu, organisateur, email_contact, telephone_contact
) VALUES (
    'Salon Tech 2024',
    'Le plus grand salon technologique de l''année',
    '2024-06-15 09:00:00+00',
    '2024-06-17 18:00:00+00',
    'Paris Expo Porte de Versailles',
    'Tech Events',
    'contact@techevents.fr',
    '+33 1 23 45 67 89'
) RETURNING id;
*/
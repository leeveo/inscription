-- MIGRATION WIZARD-SALON - MISE À JOUR DES TABLES
-- ===============================================

-- 1. AJOUT DES CHAMPS MANQUANTS POUR ÉTAPE 1 (inscription_evenements)
-- ===============================================================

ALTER TABLE inscription_evenements
ADD COLUMN IF NOT EXISTS type_evenement TEXT DEFAULT 'salon',
ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'brouillon',
ADD COLUMN IF NOT EXISTS code_acces TEXT,
ADD COLUMN IF NOT EXISTS evenement_payant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS prix NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS type_localisation TEXT DEFAULT 'lieu', -- 'lieu' | 'en_ligne' | 'non_applicable'
ADD COLUMN IF NOT EXISTS email_template TEXT DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS email_subject TEXT DEFAULT 'Confirmation d''inscription au Salon - {{event_name}}',
ADD COLUMN IF NOT EXISTS couleur_header_email TEXT DEFAULT '#3b82f6';

-- 2. CRÉATION TABLE EXPOSANTS POUR ÉTAPE 2
-- =======================================

CREATE TABLE IF NOT EXISTS salon_exposants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Index pour la performance
CREATE INDEX IF NOT EXISTS idx_salon_exposants_evenement_id ON salon_exposants(evenement_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_salon_exposants_stand_unique ON salon_exposants(evenement_id, numero_stand);

-- 3. CRÉATION TABLE INTERVENANTS POUR ÉTAPE 3 (séparé des exposants)
-- ==================================================================

CREATE TABLE IF NOT EXISTS salon_intervenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- 4. CRÉATION TABLE CONFIGURATIONS SALON POUR ÉTAPE 4
-- ===================================================

CREATE TABLE IF NOT EXISTS salon_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE UNIQUE,

    -- Configuration check-in
    checkin_type TEXT DEFAULT 'qrcode', -- 'qrcode' | 'badge' | 'manuel'
    badge_template TEXT DEFAULT 'professional',

    -- Configuration emails
    invitation_email_template TEXT DEFAULT 'template_salon',
    email_subject TEXT DEFAULT 'Confirmation d''inscription au Salon - {{event_name}}',
    couleur_header_email TEXT DEFAULT '#3b82f6',

    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MISE À JOUR TABLE PARTICIPANTS POUR ÉTAPE 5
-- ===============================================

ALTER TABLE inscription_participants
ADD COLUMN IF NOT EXISTS objectif_visite TEXT,
ADD COLUMN IF NOT EXISTS participant_type TEXT DEFAULT 'visiteur', -- 'visiteur' | 'exposant_staff'
ADD COLUMN IF NOT EXISTS exposant_id UUID REFERENCES salon_exposants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS statut_inscription TEXT DEFAULT 'confirmé',
ADD COLUMN IF NOT EXISTS date_inscription TIMESTAMPTZ DEFAULT NOW();

-- 6. AJOUT CHAMP CODE ACCÈS POUR ÉTAPE 1
-- =====================================

ALTER TABLE inscription_evenements
ADD COLUMN IF NOT EXISTS code_acces TEXT;

-- 7. TRIGGER POUR METTRE À JOUR updated_at
-- =======================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application du trigger sur les tables nécessaires
CREATE TRIGGER update_salon_exposants_updated_at BEFORE UPDATE ON salon_exposants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salon_intervenants_updated_at BEFORE UPDATE ON salon_intervenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_salon_configurations_updated_at BEFORE UPDATE ON salon_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. VUES POUR SIMPLIFIER LES REQUÊTES
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

-- Vue pour les intervenants avec sessions
CREATE OR REPLACE VIEW vue_intervenants_sessions AS
SELECT
    i.id as intervenant_id,
    i.nom,
    i.prenom,
    i.email,
    i.entreprise,
    i.poste,
    i.bio,
    i.photo_url,
    i.linkedin,
    i.twitter,
    s.titre as session_titre,
    s.description as session_description,
    s.date as session_date,
    s.heure_debut,
    s.heure_fin,
    ev.nom as nom_evenement
FROM salon_intervenants i
JOIN inscription_sessions s ON s.evenement_id = i.evenement_id
JOIN inscription_evenements ev ON ev.id = i.evenement_id
WHERE s.intervenant ILIKE '%' || i.nom || '%' || i.prenom || '%';
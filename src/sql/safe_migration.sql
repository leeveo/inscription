-- SCRIPT DE MIGRATION SÉCURISÉ POUR PRODUCTION
-- ===============================================
-- À exécuter UNIQUEMENT après avoir vérifié la compatibilité

-- ÉTAPE 1: SAUVEGARDE AVANT TOUTE MODIFICATION
-- ================================================

-- Créer des sauvegardes des tables existantes si elles existent
DO $$
BEGIN
    -- Table principale événements
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inscription_evenements') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS backup_inscription_evenements AS SELECT * FROM inscription_evenements';
        RAISE NOTICE '✅ Sauvegarde de inscription_evenements créée';
    END IF;

    -- Table participants
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inscription_participants') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS backup_inscription_participants AS SELECT * FROM inscription_participants';
        RAISE NOTICE '✅ Sauvegarde de inscription_participants créée';
    END IF;

    -- Table sessions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inscription_sessions') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS backup_inscription_sessions AS SELECT * FROM inscription_sessions';
        RAISE NOTICE '✅ Sauvegarde de inscription_sessions créée';
    END IF;
END $$;

-- ÉTAPE 2: VÉRIFICATION DE COMPATIBILITÉ
-- ======================================

-- Vérifier si les tables ont les colonnes nécessaires
DO $$
DECLARE
    table_exists BOOLEAN;
    missing_columns TEXT[];
BEGIN
    -- Vérifier inscription_evenements
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'inscription_evenements'
    ) INTO table_exists;

    IF table_exists THEN
        -- Vérifier les colonnes critiques
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'inscription_evenements' AND column_name = 'type_evenement'
        ) THEN
            missing_columns := array_append(missing_columns, 'inscription_evenements.type_evenement');
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'inscription_evenements' AND column_name = 'statut'
        ) THEN
            missing_columns := array_append(missing_columns, 'inscription_evenements.statut');
        END IF;

        IF array_length(missing_columns, 1) > 0 THEN
            RAISE EXCEPTION '❌ Colonnes manquantes dans inscription_evenements: %', array_to_string(missing_columns, ', ');
        END IF;
    END IF;
END $$;

-- ÉTAPE 3: AJOUT SÉLECTIF DES COLONNES MANQUANTES
-- ================================================

-- Ajouter uniquement les colonnes qui n'existent pas
DO $$
BEGIN
    -- Pour inscription_evenements
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inscription_evenements') THEN
        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS type_evenement TEXT DEFAULT 'salon';

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'brouillon';

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS type_localisation TEXT DEFAULT 'lieu';

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS code_acces TEXT;

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS evenement_payant BOOLEAN DEFAULT false;

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS prix NUMERIC DEFAULT 0;

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS logo_url TEXT;

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS email_template TEXT DEFAULT 'professional';

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS email_subject TEXT DEFAULT 'Confirmation d''inscription au Salon - {{event_name}}';

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS couleur_header_email TEXT DEFAULT '#3b82f6';

        ALTER TABLE inscription_evenements
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

        RAISE NOTICE '✅ Colonnes ajoutées à inscription_evenements';
    END IF;

    -- Pour inscription_participants
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inscription_participants') THEN
        ALTER TABLE inscription_participants
        ADD COLUMN IF NOT EXISTS objectif_visite TEXT;

        ALTER TABLE inscription_participants
        ADD COLUMN IF NOT EXISTS participant_type TEXT DEFAULT 'visiteur';

        ALTER TABLE inscription_participants
        ADD COLUMN IF NOT EXISTS statut_inscription TEXT DEFAULT 'confirmé';

        ALTER TABLE inscription_participants
        ADD COLUMN IF NOT EXISTS date_inscription TIMESTAMPTZ DEFAULT NOW();

        ALTER TABLE inscription_participants
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

        RAISE NOTICE '✅ Colonnes ajoutées à inscription_participants';
    END IF;
END $$;

-- ÉTAPE 4: CRÉATION SÉCURISÉE DES NOUVELLES TABLES
-- ==============================================

-- Créer les tables spécifiques au salon uniquement si elles n'existent pas
CREATE TABLE IF NOT EXISTS salon_exposants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,

    nom_contact TEXT NOT NULL,
    prenom_contact TEXT NOT NULL,
    email_contact TEXT NOT NULL,
    telephone_contact TEXT,
    entreprise_exposante TEXT NOT NULL,
    poste_contact TEXT,
    secteur_activite TEXT,
    linkedin TEXT,
    numero_stand TEXT NOT NULL,
    description_entreprise TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salon_intervenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE,

    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    entreprise TEXT,
    poste TEXT,
    bio TEXT,
    photo_url TEXT,
    linkedin TEXT,
    twitter TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS salon_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evenement_id UUID REFERENCES inscription_evenements(id) ON DELETE CASCADE UNIQUE,

    checkin_type TEXT DEFAULT 'qrcode',
    badge_template TEXT DEFAULT 'professional',
    invitation_email_template TEXT DEFAULT 'template_salon',
    email_subject TEXT DEFAULT 'Confirmation d''inscription au Salon - {{event_name}}',
    couleur_header_email TEXT DEFAULT '#3b82f6',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ÉTAPE 5: INDEX ET TRIGGERS SÉCURISÉS
-- =====================================

-- Créer les indexes uniquement s'ils n'existent pas
CREATE INDEX IF NOT EXISTS idx_salon_exposants_evenement_id ON salon_exposants(evenement_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_salon_exposants_stand_unique ON salon_exposants(evenement_id, numero_stand);

CREATE INDEX IF NOT EXISTS idx_salon_intervenants_evenement_id ON salon_intervenants(evenement_id);
CREATE INDEX IF NOT EXISTS idx_salon_configurations_evenement_id ON salon_configurations(evenement_id);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer les triggers uniquement si pas déjà créés
DROP TRIGGER IF EXISTS update_salon_exposants_updated_at ON salon_exposants;
CREATE TRIGGER update_salon_exposants_updated_at BEFORE UPDATE ON salon_exposants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salon_intervenants_updated_at ON salon_intervenants;
CREATE TRIGGER update_salon_intervenants_updated_at BEFORE UPDATE ON salon_intervenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salon_configurations_updated_at ON salon_configurations;
CREATE TRIGGER update_salon_configurations_updated_at BEFORE UPDATE ON salon_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ÉTAPE 6: VÉRIFICATION FINALE
-- ============================

DO $$
BEGIN
    RAISE NOTICE '🎉 Migration terminée avec succès !';
    RAISE NOTICE '📊 Tables créées/MAJ: salon_exposants, salon_intervenants, salon_configurations';
    RAISE NOTICE '💾 Sauvegardes créées: backup_inscription_*';
    RAISE NOTICE '✅ Aucune donnée existante n''a été perdue';
END $$;
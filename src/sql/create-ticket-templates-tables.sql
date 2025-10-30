-- Tables pour le système avancé de tickets de concert

-- Table pour les templates de tickets (version étendue)
CREATE TABLE IF NOT EXISTS ticket_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES inscription_evenements(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('a4', 'thermal', 'mobile')),
    orientation TEXT CHECK (orientation IN ('portrait', 'landscape')) DEFAULT 'portrait',
    schema JSONB NOT NULL DEFAULT '{}', -- Structure du template (zones, mise en page)
    styles JSONB NOT NULL DEFAULT '{}', -- Styles CSS personnalisés
    settings JSONB NOT NULL DEFAULT '{}', -- Paramètres (marges, couleurs, polices)
    preview_image TEXT, -- URL de l'aperçu du template
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Contrainte unique pour éviter les doublons
    UNIQUE(event_id, name)
);

-- Table pour les instances de tickets générés
CREATE TABLE IF NOT EXISTS ticket_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES inscription_evenements(id) ON DELETE CASCADE,
    participant_id INTEGER NOT NULL REFERENCES inscription_participants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES ticket_templates(id) ON DELETE CASCADE,

    -- Données dynamiques du ticket
    payload JSONB NOT NULL DEFAULT '{}', -- Données spécifiques au participant
    qr_data TEXT NOT NULL, -- Données encodées dans le QR code
    barcode_data TEXT, -- Données pour le code-barres (optionnel)

    -- Métadonnées
    ticket_number TEXT UNIQUE, -- Numéro unique du ticket
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'cancelled', 'expired')),
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    used_at TIMESTAMPTZ,

    -- Impression
    print_count INTEGER DEFAULT 0,
    last_printed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Contraintes
    UNIQUE(event_id, participant_id), -- Un ticket par participant par événement
    CONSTRAINT valid_status CHECK (
        (status = 'used' AND used_at IS NOT NULL) OR
        (status != 'used' AND used_at IS NULL)
    )
);

-- Table pour les jobs d'impression
CREATE TABLE IF NOT EXISTS print_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_instance_id UUID NOT NULL REFERENCES ticket_instances(id) ON DELETE CASCADE,

    -- Destination de l'impression
    print_type TEXT NOT NULL CHECK (print_type IN ('pdf', 'thermal', 'local')),
    printer_name TEXT, -- Nom de l'imprimante (pour impression locale)
    print_options JSONB DEFAULT '{}', -- Options spécifiques (qualité, format, etc.)

    -- Statut du job
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    error_message TEXT,

    -- Métriques
    file_size INTEGER, -- Taille du fichier généré (bytes)
    print_duration INTEGER, -- Durée d'impression (secondes)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Métadonnées
    created_by TEXT, -- ID de l'utilisateur qui a lancé l'impression
    retry_count INTEGER DEFAULT 0
);

-- Table pour les éléments de bibliothèque de templates
CREATE TABLE IF NOT EXISTS ticket_template_elements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    category TEXT NOT NULL, -- 'text', 'image', 'qr', 'barcode', 'shape', 'layout'
    element_type TEXT NOT NULL, -- Type de composant React
    schema JSONB NOT NULL DEFAULT '{}', -- Schéma de l'élément
    default_props JSONB NOT NULL DEFAULT '{}', -- Props par défaut
    preview_image TEXT, -- Miniature de prévisualisation

    -- Organisation
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,

    -- Versioning
    version TEXT DEFAULT '1.0.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les presets de templates
CREATE TABLE IF NOT EXISTS ticket_template_presets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'concert', 'conference', 'theatre', 'sports', etc.
    template_type TEXT NOT NULL CHECK (template_type IN ('a4', 'thermal', 'mobile')),

    -- Structure complète du preset
    schema JSONB NOT NULL DEFAULT '{}',
    styles JSONB NOT NULL DEFAULT '{}',
    settings JSONB NOT NULL DEFAULT '{}',

    -- Visuel
    preview_image TEXT,
    thumbnail TEXT,

    -- Organisation
    tags TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,

    -- Statut
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_ticket_templates_event_id ON ticket_templates(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_templates_type ON ticket_templates(type);
CREATE INDEX IF NOT EXISTS idx_ticket_templates_active ON ticket_templates(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_ticket_instances_event_id ON ticket_instances(event_id);
CREATE INDEX IF NOT EXISTS idx_ticket_instances_participant_id ON ticket_instances(participant_id);
CREATE INDEX IF NOT EXISTS idx_ticket_instances_status ON ticket_instances(status);
CREATE INDEX IF NOT EXISTS idx_ticket_instances_qr_data ON ticket_instances(qr_data);
CREATE INDEX IF NOT EXISTS idx_ticket_instances_ticket_number ON ticket_instances(ticket_number);

CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_created_at ON print_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_print_jobs_ticket_instance_id ON print_jobs(ticket_instance_id);

CREATE INDEX IF NOT EXISTS idx_ticket_elements_category ON ticket_template_elements(category);
CREATE INDEX IF NOT EXISTS idx_ticket_elements_public ON ticket_template_elements(is_public) WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_ticket_presets_category ON ticket_template_presets(category);
CREATE INDEX IF NOT EXISTS idx_ticket_presets_active ON ticket_template_presets(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ticket_presets_featured ON ticket_template_presets(is_featured) WHERE is_featured = true;

-- RLS (Row Level Security) pour les tables
ALTER TABLE ticket_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_template_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_template_presets ENABLE ROW LEVEL SECURITY;

-- Politiques RSL pour ticket_templates
CREATE POLICY "Users can view their event ticket templates" ON ticket_templates
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM inscription_evenements
            WHERE organisateur = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage their event ticket templates" ON ticket_templates
    FOR ALL USING (
        event_id IN (
            SELECT id FROM inscription_evenements
            WHERE organisateur = auth.uid()::text
        )
    );

-- Politiques RSL pour ticket_instances
CREATE POLICY "Users can view ticket instances for their events" ON ticket_instances
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM inscription_evenements
            WHERE organisateur = auth.uid()::text
        )
    );

CREATE POLICY "Users can manage ticket instances for their events" ON ticket_instances
    FOR ALL USING (
        event_id IN (
            SELECT id FROM inscription_evenements
            WHERE organisateur = auth.uid()::text
        )
    );

-- Politiques RSL pour print_jobs
CREATE POLICY "Users can view print jobs for their events" ON print_jobs
    FOR SELECT USING (
        ticket_instance_id IN (
            SELECT id FROM ticket_instances
            WHERE event_id IN (
                SELECT id FROM inscription_evenements
                WHERE organisateur = auth.uid()::text
            )
        )
    );

CREATE POLICY "Users can manage print jobs for their events" ON print_jobs
    FOR ALL USING (
        ticket_instance_id IN (
            SELECT id FROM ticket_instances
            WHERE event_id IN (
                SELECT id FROM inscription_evenements
                WHERE organisateur = auth.uid()::text
            )
        )
    );

-- Politiques publiques pour les éléments et presets (lecture seule)
CREATE POLICY "Anyone can view ticket template elements" ON ticket_template_elements
    FOR SELECT USING (is_public = true);

CREATE POLICY "Anyone can view ticket template presets" ON ticket_template_presets
    FOR SELECT USING (is_active = true);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ticket_templates_updated_at BEFORE UPDATE ON ticket_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_instances_updated_at BEFORE UPDATE ON ticket_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_elements_updated_at BEFORE UPDATE ON ticket_template_elements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_presets_updated_at BEFORE UPDATE ON ticket_template_presets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour générer automatiquement les ticket_instances
CREATE OR REPLACE FUNCTION generate_ticket_instance()
RETURNS TRIGGER AS $$
BEGIN
    -- Générer une instance de ticket uniquement si un template par défaut existe
    INSERT INTO ticket_instances (event_id, participant_id, template_id, payload, qr_data, ticket_number)
    SELECT
        NEW.evenement_id,
        NEW.id,
        tt.id,
        jsonb_build_object(
            'participant_name', NEW.prenom || ' ' || NEW.nom,
            'participant_email', NEW.email,
            'participant_phone', COALESCE(NEW.telephone, ''),
            'profession', COALESCE(NEW.profession, ''),
            'registration_date', NEW.created_at
        ),
        'ticket:' || NEW.id || ':' || NEW.evenement_id,
        'TKT-' || EXTRACT(YEAR FROM NOW()) || LPAD(NEW.id::text, 6, '0')
    FROM ticket_templates tt
    WHERE tt.event_id = NEW.evenement_id
    AND tt.is_default = true
    AND tt.is_active = true
    ON CONFLICT (event_id, participant_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ticket_instance
    AFTER INSERT ON inscription_participants
    FOR EACH ROW EXECUTE FUNCTION generate_ticket_instance();

COMMENT ON TABLE ticket_templates IS 'Templates avancés pour les tickets d''événements';
COMMENT ON TABLE ticket_instances IS 'Instances individuelles de tickets générées pour chaque participant';
COMMENT ON TABLE print_jobs IS 'Historique des travaux d''impression pour les tickets';
COMMENT ON TABLE ticket_template_elements IS 'Bibliothèque d''éléments réutilisables pour les templates';
COMMENT ON TABLE ticket_template_presets IS 'Presets de templates pré-configurés pour différents types d''événements';
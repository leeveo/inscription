-- Script pour créer les tables de check-in avec détection automatique des types
-- Compatible avec INTEGER et UUID

DO $$
DECLARE
  participant_id_type TEXT;
  evenement_id_type TEXT;
  session_id_type TEXT;
BEGIN
  -- Détecter le type de la colonne ID dans inscription_participants
  SELECT data_type INTO participant_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'inscription_participants'
    AND column_name = 'id';

  -- Détecter le type de la colonne ID dans inscription_evenements
  SELECT data_type INTO evenement_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'inscription_evenements'
    AND column_name = 'id';

  -- Détecter le type de la colonne ID dans inscription_sessions
  SELECT data_type INTO session_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'inscription_sessions'
    AND column_name = 'id';

  -- Afficher les types détectés
  RAISE NOTICE 'Types détectés:';
  RAISE NOTICE '- inscription_participants.id: %', participant_id_type;
  RAISE NOTICE '- inscription_evenements.id: %', evenement_id_type;
  RAISE NOTICE '- inscription_sessions.id: %', session_id_type;

  -- Créer la table inscription_checkins avec les bons types
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS inscription_checkins (
      id SERIAL PRIMARY KEY,
      participant_id %s NOT NULL,
      evenement_id %s NOT NULL,
      session_id %s NOT NULL,
      checked_in_at TIMESTAMPTZ DEFAULT NOW(),
      checked_by TEXT,
      qr_token TEXT NOT NULL,
      device_info JSONB,
      notes TEXT,
      
      CONSTRAINT fk_checkins_participant 
        FOREIGN KEY (participant_id) 
        REFERENCES inscription_participants(id) 
        ON DELETE CASCADE,
        
      CONSTRAINT fk_checkins_event 
        FOREIGN KEY (evenement_id) 
        REFERENCES inscription_evenements(id) 
        ON DELETE CASCADE,
        
      CONSTRAINT fk_checkins_session 
        FOREIGN KEY (session_id) 
        REFERENCES inscription_sessions(id) 
        ON DELETE CASCADE,
        
      CONSTRAINT unique_checkin_per_session 
        UNIQUE(participant_id, session_id)
    )',
    participant_id_type,
    evenement_id_type,
    session_id_type
  );

  -- Créer la table inscription_participant_qr_tokens avec les bons types
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS inscription_participant_qr_tokens (
      id SERIAL PRIMARY KEY,
      participant_id %s NOT NULL,
      evenement_id %s NOT NULL,
      qr_token TEXT NOT NULL UNIQUE,
      ticket_url TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      expires_at TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT true,
      
      CONSTRAINT fk_qr_tokens_participant 
        FOREIGN KEY (participant_id) 
        REFERENCES inscription_participants(id) 
        ON DELETE CASCADE,
        
      CONSTRAINT fk_qr_tokens_event 
        FOREIGN KEY (evenement_id) 
        REFERENCES inscription_evenements(id) 
        ON DELETE CASCADE,
        
      CONSTRAINT unique_active_token_per_participant 
        UNIQUE(participant_id, evenement_id)
    )',
    participant_id_type,
    evenement_id_type
  );

  RAISE NOTICE 'Tables créées avec succès !';
END
$$;

-- Créer les index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_checkins_participant_id 
ON inscription_checkins(participant_id);

CREATE INDEX IF NOT EXISTS idx_checkins_event_id 
ON inscription_checkins(evenement_id);

CREATE INDEX IF NOT EXISTS idx_checkins_session_id 
ON inscription_checkins(session_id);

CREATE INDEX IF NOT EXISTS idx_checkins_qr_token 
ON inscription_checkins(qr_token);

CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at 
ON inscription_checkins(checked_in_at);

-- Index pour les tokens QR
CREATE INDEX IF NOT EXISTS idx_qr_tokens_participant_id 
ON inscription_participant_qr_tokens(participant_id);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_event_id 
ON inscription_participant_qr_tokens(evenement_id);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_token 
ON inscription_participant_qr_tokens(qr_token);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_active 
ON inscription_participant_qr_tokens(is_active);

-- Fonction pour générer un token unique
CREATE OR REPLACE FUNCTION generate_unique_qr_token()
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  exists_token BOOLEAN;
BEGIN
  LOOP
    -- Générer un token de 32 caractères aléatoires
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(replace(replace(token, '/', '_'), '+', '-'), '=', '');
    
    -- Vérifier si le token existe déjà
    SELECT EXISTS(
      SELECT 1 FROM inscription_participant_qr_tokens 
      WHERE qr_token = token
    ) INTO exists_token;
    
    -- Si le token n'existe pas, on peut l'utiliser
    EXIT WHEN NOT exists_token;
  END LOOP;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un token QR lors de l'inscription
CREATE OR REPLACE FUNCTION create_qr_token_for_participant()
RETURNS TRIGGER AS $$
DECLARE
  new_token TEXT;
  base_url TEXT;
BEGIN
  -- Générer un token unique
  new_token := generate_unique_qr_token();
  
  -- URL de base (à ajuster selon votre configuration)
  base_url := COALESCE(current_setting('app.base_url', true), 'http://localhost:3000');
  
  -- Insérer le token QR
  INSERT INTO inscription_participant_qr_tokens (
    participant_id,
    evenement_id,
    qr_token,
    ticket_url
  ) VALUES (
    NEW.id,
    NEW.evenement_id,
    new_token,
    base_url || '/checkin/' || new_token
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur la table des participants
DROP TRIGGER IF EXISTS trigger_create_qr_token ON inscription_participants;

CREATE TRIGGER trigger_create_qr_token
  AFTER INSERT ON inscription_participants
  FOR EACH ROW
  EXECUTE FUNCTION create_qr_token_for_participant();

-- Vue pour faciliter les requêtes de check-in avec toutes les infos
CREATE OR REPLACE VIEW inscription_checkins_details AS
SELECT 
  c.id as checkin_id,
  c.checked_in_at,
  c.checked_by,
  c.notes,
  c.device_info,
  p.id as participant_id,
  p.prenom,
  p.nom,
  p.email,
  p.telephone,
  p.profession,
  e.id as evenement_id,
  e.nom as evenement_nom,
  e.date_debut as evenement_date,
  s.id as session_id,
  s.titre as session_titre,
  s.date as session_date,
  s.heure_debut,
  s.heure_fin,
  s.lieu as session_lieu,
  s.intervenant,
  qr.qr_token,
  qr.ticket_url
FROM inscription_checkins c
JOIN inscription_participants p ON c.participant_id = p.id
JOIN inscription_evenements e ON c.evenement_id = e.id  
JOIN inscription_sessions s ON c.session_id = s.id
JOIN inscription_participant_qr_tokens qr ON qr.participant_id = p.id AND qr.evenement_id = e.id
WHERE qr.is_active = true;

-- Vérification finale
SELECT 
  'inscription_checkins' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'inscription_checkins'
  AND table_schema = 'public'
UNION ALL
SELECT 
  'inscription_participant_qr_tokens' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'inscription_participant_qr_tokens'
  AND table_schema = 'public'
ORDER BY table_name, column_name;
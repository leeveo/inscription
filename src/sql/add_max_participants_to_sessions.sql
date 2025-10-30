-- Script SQL pour ajouter le champ max_participants à la table inscription_sessions
-- À exécuter dans votre interface Supabase SQL Editor

-- 1. Ajouter le champ max_participants à la table inscription_sessions
DO $$
BEGIN
  -- Vérifier si la colonne max_participants existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inscription_sessions' 
    AND column_name = 'max_participants'
  ) THEN
    -- Ajouter la colonne max_participants
    ALTER TABLE public.inscription_sessions 
      ADD COLUMN max_participants INTEGER DEFAULT NULL;
    
    RAISE NOTICE 'Colonne max_participants ajoutée avec succès';
  ELSE
    RAISE NOTICE 'La colonne max_participants existe déjà';
  END IF;
END
$$;

-- 2. Ajouter un commentaire pour la documentation
COMMENT ON COLUMN public.inscription_sessions.max_participants IS 'Nombre maximum de participants autorisés pour cette session (NULL = illimité)';

-- 3. Créer une vue pour obtenir les statistiques de remplissage des sessions
CREATE OR REPLACE VIEW session_capacity_stats AS
SELECT 
    s.id as session_id,
    s.titre,
    s.date,
    s.heure_debut,
    s.heure_fin,
    s.max_participants,
    COUNT(sp.participant_id) as participants_inscrits,
    CASE 
        WHEN s.max_participants IS NULL THEN NULL
        ELSE s.max_participants - COUNT(sp.participant_id)
    END as places_restantes,
    CASE 
        WHEN s.max_participants IS NULL THEN 0
        ELSE ROUND((COUNT(sp.participant_id)::DECIMAL / s.max_participants::DECIMAL * 100), 2)
    END as pourcentage_remplissage,
    CASE 
        WHEN s.max_participants IS NULL THEN false
        ELSE COUNT(sp.participant_id) >= s.max_participants
    END as is_complet
FROM inscription_sessions s
LEFT JOIN inscription_session_participants sp ON s.id::text = sp.session_id::text
GROUP BY s.id, s.titre, s.date, s.heure_debut, s.heure_fin, s.max_participants
ORDER BY s.date, s.heure_debut;

-- 4. Commentaire sur la vue
COMMENT ON VIEW session_capacity_stats IS 'Vue pour obtenir les statistiques de capacité et de remplissage des sessions';

-- 5. Fonction pour vérifier si une session a encore de la place
CREATE OR REPLACE FUNCTION session_has_capacity(session_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    session_record RECORD;
    participant_count INTEGER;
BEGIN
    -- Récupérer les informations de la session
    SELECT max_participants 
    INTO session_record
    FROM inscription_sessions 
    WHERE id::text = session_id_param;
    
    -- Si la session n'existe pas
    IF session_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Si pas de limite définie, toujours de la place
    IF session_record.max_participants IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Compter les participants inscrits
    SELECT COUNT(*)
    INTO participant_count
    FROM inscription_session_participants 
    WHERE session_id::text = session_id_param;
    
    -- Retourner true s'il reste de la place
    RETURN participant_count < session_record.max_participants;
END;
$$ LANGUAGE plpgsql;

-- 6. Fonction pour obtenir le nombre de places restantes
CREATE OR REPLACE FUNCTION get_remaining_capacity(session_id_param TEXT)
RETURNS INTEGER AS $$
DECLARE
    session_record RECORD;
    participant_count INTEGER;
BEGIN
    -- Récupérer les informations de la session
    SELECT max_participants 
    INTO session_record
    FROM inscription_sessions 
    WHERE id::text = session_id_param;
    
    -- Si la session n'existe pas
    IF session_record IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Si pas de limite définie, retourner -1 (illimité)
    IF session_record.max_participants IS NULL THEN
        RETURN -1;
    END IF;
    
    -- Compter les participants inscrits
    SELECT COUNT(*)
    INTO participant_count
    FROM inscription_session_participants 
    WHERE session_id::text = session_id_param;
    
    -- Retourner le nombre de places restantes
    RETURN GREATEST(0, session_record.max_participants - participant_count);
END;
$$ LANGUAGE plpgsql;

-- 7. Vérification des modifications
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'inscription_sessions'
AND column_name = 'max_participants';

-- 8. Afficher un aperçu des statistiques des sessions (s'il y en a)
SELECT * FROM session_capacity_stats LIMIT 5;
-- Script pour générer des tokens QR pour les participants existants
-- À exécuter après la création des tables de check-in

DO $$
DECLARE
  participant_record RECORD;
  new_token TEXT;
  base_url TEXT;
  total_participants INTEGER;
  processed_count INTEGER := 0;
BEGIN
  -- URL de base (à ajuster selon votre configuration)
  base_url := COALESCE(current_setting('app.base_url', true), 'http://localhost:3000');
  
  -- Compter le nombre total de participants sans token
  SELECT COUNT(*) INTO total_participants
  FROM inscription_participants p
  LEFT JOIN inscription_participant_qr_tokens qr ON p.id = qr.participant_id AND p.evenement_id = qr.evenement_id
  WHERE qr.id IS NULL;
  
  RAISE NOTICE 'Génération de tokens QR pour % participants existants...', total_participants;
  
  -- Parcourir tous les participants qui n'ont pas encore de token QR
  FOR participant_record IN
    SELECT p.id, p.evenement_id, p.prenom, p.nom
    FROM inscription_participants p
    LEFT JOIN inscription_participant_qr_tokens qr ON p.id = qr.participant_id AND p.evenement_id = qr.evenement_id
    WHERE qr.id IS NULL
  LOOP
    -- Générer un token unique
    new_token := generate_unique_qr_token();
    
    -- Insérer le token QR pour ce participant
    INSERT INTO inscription_participant_qr_tokens (
      participant_id,
      evenement_id,
      qr_token,
      ticket_url,
      is_active
    ) VALUES (
      participant_record.id,
      participant_record.evenement_id,
      new_token,
      base_url || '/checkin/' || new_token,
      true
    );
    
    processed_count := processed_count + 1;
    
    -- Log tous les 100 participants
    IF processed_count % 100 = 0 THEN
      RAISE NOTICE 'Traité % / % participants...', processed_count, total_participants;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Terminé ! % tokens QR générés pour les participants existants.', processed_count;
  
  -- Vérification finale
  SELECT COUNT(*) INTO total_participants FROM inscription_participant_qr_tokens;
  RAISE NOTICE 'Total de tokens QR en base : %', total_participants;
  
END
$$;
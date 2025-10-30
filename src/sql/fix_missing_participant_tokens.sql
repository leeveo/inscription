-- Script pour vérifier et corriger les tokens de participants manquants
-- À exécuter dans votre interface Supabase SQL Editor

-- 1. Vérifier combien de participants n'ont pas de tokens
SELECT 
  COUNT(*) as total_participants,
  COUNT(token_landing_page) as participants_with_token,
  COUNT(*) - COUNT(token_landing_page) as participants_without_token
FROM inscription_participants;

-- 2. Voir les participants sans tokens (avec détails)
SELECT 
  id,
  nom,
  prenom,
  email,
  evenement_id,
  token_landing_page
FROM inscription_participants 
WHERE token_landing_page IS NULL 
ORDER BY created_at DESC
LIMIT 20;

-- 3. Fonction pour générer un token unique (au cas où elle n'existerait pas)
CREATE OR REPLACE FUNCTION generate_participant_token()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER;
    char_length INTEGER := length(chars);
BEGIN
    -- Générer un token de 32 caractères
    FOR i IN 1..32 LOOP
        result := result || substr(chars, floor(random() * char_length + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. Corriger tous les participants sans tokens
UPDATE inscription_participants 
SET token_landing_page = generate_participant_token()
WHERE token_landing_page IS NULL OR token_landing_page = '';

-- 5. Vérification finale
SELECT 
  COUNT(*) as total_participants,
  COUNT(token_landing_page) as participants_with_token,
  COUNT(*) - COUNT(token_landing_page) as participants_without_token
FROM inscription_participants;

-- 6. Afficher quelques exemples d'URLs générées
SELECT 
  p.id,
  p.nom,
  p.prenom,
  p.token_landing_page,
  e.nom as evenement_nom,
  -- Exemple d'URL complète (remplacez localhost:3001 par votre domaine)
  CONCAT('http://localhost:3001/landing/', p.evenement_id, '/', p.token_landing_page) as landing_url
FROM inscription_participants p
JOIN inscription_evenements e ON p.evenement_id = e.id
WHERE p.token_landing_page IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 10;
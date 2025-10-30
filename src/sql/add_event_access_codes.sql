-- Ajout de la colonne code_acces à la table inscription_evenements
-- Code à 4 chiffres unique par événement pour l'accès sécurisé au scanner

DO $$
BEGIN
  -- Ajouter la colonne code_acces si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inscription_evenements' 
    AND column_name = 'code_acces'
  ) THEN
    ALTER TABLE inscription_evenements 
    ADD COLUMN code_acces VARCHAR(4) UNIQUE;
    RAISE NOTICE 'Colonne code_acces ajoutée à inscription_evenements';
  ELSE
    RAISE NOTICE 'Colonne code_acces existe déjà';
  END IF;
END
$$;

-- Fonction pour générer un code à 4 chiffres unique
CREATE OR REPLACE FUNCTION generate_unique_event_code()
RETURNS VARCHAR(4) AS $$
DECLARE
  new_code VARCHAR(4);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Générer un code aléatoire de 4 chiffres (1000-9999)
    new_code := LPAD((FLOOR(RANDOM() * 9000) + 1000)::TEXT, 4, '0');
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(
      SELECT 1 FROM inscription_evenements 
      WHERE code_acces = new_code
    ) INTO code_exists;
    
    -- Si le code n'existe pas, on peut l'utiliser
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Générer des codes pour les événements existants qui n'en ont pas
DO $$
DECLARE
  event_record RECORD;
  new_code VARCHAR(4);
  updated_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Génération de codes d''accès pour les événements existants...';
  
  -- Parcourir tous les événements sans code d'accès
  FOR event_record IN
    SELECT id, nom
    FROM inscription_evenements
    WHERE code_acces IS NULL OR code_acces = ''
  LOOP
    -- Générer un code unique
    new_code := generate_unique_event_code();
    
    -- Mettre à jour l'événement
    UPDATE inscription_evenements
    SET code_acces = new_code
    WHERE id = event_record.id;
    
    updated_count := updated_count + 1;
    
    RAISE NOTICE 'Événement "%" - Code: %', event_record.nom, new_code;
  END LOOP;
  
  RAISE NOTICE 'Terminé ! % codes générés.', updated_count;
END
$$;

-- Trigger pour générer automatiquement un code lors de la création d'un nouvel événement
CREATE OR REPLACE FUNCTION create_event_code_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Si le code_acces n'est pas défini, en générer un automatiquement
  IF NEW.code_acces IS NULL OR NEW.code_acces = '' THEN
    NEW.code_acces := generate_unique_event_code();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_create_event_code ON inscription_evenements;

CREATE TRIGGER trigger_create_event_code
  BEFORE INSERT OR UPDATE ON inscription_evenements
  FOR EACH ROW
  EXECUTE FUNCTION create_event_code_trigger();

-- Index pour améliorer les performances de recherche par code
CREATE INDEX IF NOT EXISTS idx_evenements_code_acces 
ON inscription_evenements(code_acces);

-- Contrainte pour s'assurer que le code est bien de 4 chiffres
ALTER TABLE inscription_evenements 
ADD CONSTRAINT check_code_acces_format 
CHECK (code_acces ~ '^[0-9]{4}$');

-- Affichage des codes générés
SELECT 
  id,
  nom,
  code_acces,
  date_debut,
  lieu
FROM inscription_evenements
WHERE code_acces IS NOT NULL
ORDER BY date_debut DESC;
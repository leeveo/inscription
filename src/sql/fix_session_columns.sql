-- Check if the required columns exist and are correctly typed
DO $$
BEGIN
  -- Check if type column exists and has the right type
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inscription_sessions' 
    AND column_name = 'type'
  ) THEN
    -- Column exists, make sure it's text type and NOT NULL
    ALTER TABLE public.inscription_sessions 
      ALTER COLUMN type TYPE text,
      ALTER COLUMN type SET NOT NULL;
  ELSE
    -- Column doesn't exist, add it
    ALTER TABLE public.inscription_sessions 
      ADD COLUMN type text NOT NULL DEFAULT 'autre';
  END IF;
  
  -- Check if intervenant column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inscription_sessions' 
    AND column_name = 'intervenant'
  ) THEN
    -- Column exists, make sure it's text type
    ALTER TABLE public.inscription_sessions 
      ALTER COLUMN intervenant TYPE text;
  ELSE
    -- Column doesn't exist, add it
    ALTER TABLE public.inscription_sessions 
      ADD COLUMN intervenant text;
  END IF;
  
  -- Check if lieu column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'inscription_sessions' 
    AND column_name = 'lieu'
  ) THEN
    -- Column exists, make sure it's text type
    ALTER TABLE public.inscription_sessions 
      ALTER COLUMN lieu TYPE text;
  ELSE
    -- Column doesn't exist, add it
    ALTER TABLE public.inscription_sessions 
      ADD COLUMN lieu text;
  END IF;
END
$$;

-- Add helpful comments to the columns
COMMENT ON COLUMN public.inscription_sessions.type IS 'Type of session (conférence, atelier, pause, etc)';
COMMENT ON COLUMN public.inscription_sessions.intervenant IS 'Name of the presenter or speaker';
COMMENT ON COLUMN public.inscription_sessions.lieu IS 'Location where the session takes place';

-- Check for existing sessions that might have NULL in type column and fix them
UPDATE public.inscription_sessions
SET type = 'autre'
WHERE type IS NULL;

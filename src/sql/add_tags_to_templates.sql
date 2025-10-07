-- Add tags column to builder_templates table
ALTER TABLE builder_templates
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add index for tags array
CREATE INDEX IF NOT EXISTS idx_builder_templates_tags ON builder_templates USING gin(tags);

-- Verify column added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'builder_templates'
ORDER BY ordinal_position;

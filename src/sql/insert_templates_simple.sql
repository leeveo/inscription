-- ============================================
-- Insert Starter Templates (SIMPLIFIED - NO TIMEOUT)
-- ============================================
-- First add tags column if needed
ALTER TABLE builder_templates ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Insert Conference Template with MINIMAL schema (we'll use API to populate)
INSERT INTO builder_templates (
  id,
  key,
  label,
  description,
  category,
  preview_image,
  schema,
  is_public,
  tags
) VALUES (
  'e7d3c2a1-b4f5-4e6d-9c8b-1a2b3c4d5e6f',
  'template-conference-1day',
  'Conférence 1 Jour',
  'Template complet pour une conférence d''une journée avec agenda, speakers et inscription',
  'event',
  '/templates/conference-1day-preview.png',
  '{"ROOT":{"type":{"resolvedName":"Container"},"isCanvas":true,"props":{"className":"min-h-screen"},"displayName":"Container","nodes":[],"linkedNodes":{}}}',
  true,
  ARRAY['conference', 'event', 'in-person', 'agenda', 'speakers']
) ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Insert Webinar Template with MINIMAL schema
INSERT INTO builder_templates (
  id,
  key,
  label,
  description,
  category,
  preview_image,
  schema,
  is_public,
  tags
) VALUES (
  'f8e4d3b2-c5g6-5f7e-0d9c-2b3c4d5e6f7g',
  'template-webinar',
  'Webinar',
  'Template optimisé pour webinaires en ligne avec focus sur l''inscription et les informations pratiques',
  'online',
  '/templates/webinar-preview.png',
  '{"ROOT":{"type":{"resolvedName":"Container"},"isCanvas":true,"props":{"className":"min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50"},"displayName":"Container","nodes":[],"linkedNodes":{}}}',
  true,
  ARRAY['webinar', 'online', 'formation', 'virtual']
) ON CONFLICT (key) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  tags = EXCLUDED.tags,
  updated_at = NOW();

-- Verify
SELECT id, key, label, category, is_public, array_length(tags, 1) as tag_count
FROM builder_templates
WHERE is_public = true;

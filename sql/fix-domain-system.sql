-- ============================================
-- Corrections pour le système de domaines
-- ============================================

-- 1. Améliorer l'API de vérification des domaines
-- Ajouter une fonction qui vérifie la chaîne complète

CREATE OR REPLACE FUNCTION check_domain_complete_chain(domain_host TEXT)
RETURNS TABLE (
  authorized BOOLEAN,
  domain_id UUID,
  site_id UUID,
  page_id UUID,
  event_id UUID,
  page_slug TEXT,
  dns_status TEXT,
  ssl_status TEXT,
  reason TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Autorisation: domaine vérifié + page publiée + événement actif
    (d.dns_status = 'verified' AND p.status = 'published' AND e.statut IN ('actif', 'publié')) as authorized,
    d.id as domain_id,
    s.id as site_id, 
    p.id as page_id,
    e.id as event_id,
    p.slug as page_slug,
    d.dns_status,
    d.ssl_status,
    CASE 
      WHEN d.dns_status != 'verified' THEN 'DNS non vérifié'
      WHEN p.status != 'published' THEN 'Page non publiée'
      WHEN e.statut NOT IN ('actif', 'publié') THEN 'Événement inactif'
      ELSE 'OK'
    END as reason
  FROM builder_domains d
  JOIN builder_sites s ON d.site_id = s.id
  JOIN builder_pages p ON p.site_id = s.id AND p.status = 'published'
  LEFT JOIN inscription_evenements e ON s.event_id = e.id
  WHERE d.host = domain_host
  LIMIT 1;
END;
$$;

-- 2. Créer une vue pour faciliter les debugs
CREATE OR REPLACE VIEW v_domain_status AS
SELECT 
  e.id as event_id,
  e.nom as event_name,
  e.statut as event_status,
  s.id as site_id,
  s.name as site_name,
  p.id as page_id,
  p.name as page_name,
  p.slug as page_slug,
  p.status as page_status,
  d.id as domain_id,
  d.host as domain_host,
  d.type as domain_type,
  d.dns_status,
  d.ssl_status,
  d.is_primary,
  -- Statut global
  CASE 
    WHEN d.dns_status = 'verified' AND p.status = 'published' AND e.statut IN ('actif', 'publié') 
    THEN 'OPERATIONAL'
    WHEN d.dns_status != 'verified' 
    THEN 'DNS_ISSUE'
    WHEN p.status != 'published' 
    THEN 'PAGE_NOT_PUBLISHED'
    WHEN e.statut NOT IN ('actif', 'publié') 
    THEN 'EVENT_INACTIVE'
    ELSE 'UNKNOWN_ISSUE'
  END as overall_status
FROM inscription_evenements e
LEFT JOIN builder_sites s ON e.id = s.event_id
LEFT JOIN builder_pages p ON s.id = p.site_id
LEFT JOIN builder_domains d ON s.id = d.site_id
ORDER BY e.created_at DESC;

-- 3. Fonction pour créer automatiquement la chaîne complète
CREATE OR REPLACE FUNCTION create_complete_domain_chain(
  p_event_id UUID,
  p_domain_host TEXT,
  p_domain_type TEXT DEFAULT 'custom',
  p_page_name TEXT DEFAULT 'Page de l''événement'
)
RETURNS TABLE (
  success BOOLEAN,
  site_id UUID,
  page_id UUID,
  domain_id UUID,
  message TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_site_id UUID;
  v_page_id UUID;
  v_domain_id UUID;
  v_event_name TEXT;
BEGIN
  -- Vérifier que l'événement existe
  SELECT nom INTO v_event_name FROM inscription_evenements WHERE id = p_event_id;
  IF v_event_name IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, NULL::UUID, 'Événement non trouvé';
    RETURN;
  END IF;

  -- Créer ou récupérer le site
  SELECT id INTO v_site_id FROM builder_sites WHERE event_id = p_event_id LIMIT 1;
  
  IF v_site_id IS NULL THEN
    INSERT INTO builder_sites (event_id, name, site_slug, status)
    VALUES (p_event_id, v_event_name, LOWER(REPLACE(v_event_name, ' ', '-')) || '-' || EXTRACT(epoch FROM NOW())::TEXT, 'published')
    RETURNING id INTO v_site_id;
  END IF;

  -- Créer ou récupérer la page
  SELECT id INTO v_page_id FROM builder_pages WHERE site_id = v_site_id LIMIT 1;
  
  IF v_page_id IS NULL THEN
    INSERT INTO builder_pages (site_id, name, slug, status, tree)
    VALUES (v_site_id, p_page_name, 'home', 'published', '{"rootNodeId": "root", "nodes": {"root": {"type": "div", "props": {}, "nodes": []}}}'::jsonb)
    RETURNING id INTO v_page_id;
  END IF;

  -- Créer le domaine
  SELECT id INTO v_domain_id FROM builder_domains WHERE host = p_domain_host;
  
  IF v_domain_id IS NULL THEN
    INSERT INTO builder_domains (site_id, type, host, dns_status, ssl_status, is_primary)
    VALUES (v_site_id, p_domain_type, p_domain_host, 'pending', 'pending', TRUE)
    RETURNING id INTO v_domain_id;
  ELSE
    RETURN QUERY SELECT FALSE, v_site_id, v_page_id, v_domain_id, 'Domaine déjà existant';
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, v_site_id, v_page_id, v_domain_id, 'Chaîne créée avec succès';
END;
$$;

-- 4. Contraintes pour éviter les incohérences
ALTER TABLE builder_sites 
ADD CONSTRAINT unique_event_site UNIQUE (event_id);

-- 5. Mettre à jour les événements existants avec leur builder_page_id
-- (À exécuter après création des pages)
UPDATE inscription_evenements 
SET builder_page_id = p.id
FROM builder_pages p
JOIN builder_sites s ON p.site_id = s.id
WHERE inscription_evenements.id = s.event_id 
AND inscription_evenements.builder_page_id IS NULL;
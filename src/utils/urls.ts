/**
 * Utilitaires pour gérer les URLs de l'application
 */

/**
 * Retourne l'URL de base de l'application en fonction de l'environnement
 */
export function getAppBaseUrl(): string {
  // En priorité, utiliser la variable d'environnement configurée
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // En développement, utiliser localhost:3000 (port de l'app principale)
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // En production, essayer de deviner l'URL à partir du host actuel
  // (cela sera utilisé côté client)
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}`;
  }

  // Fallback côté serveur
  return 'https://admin.waivent.app'; // Remplacez par votre domaine de production
}

/**
 * Génère l'URL SaaS pour une page publiée
 */
export function generateSaaSUrl(slug: string): string {
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}/p/${slug}`;
}

/**
 * Génère l'URL de preview pour une page
 */
export function generatePreviewUrl(pageId: string): string {
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}/preview/${pageId}`;
}

/**
 * Génère l'URL publique d'une page (avec domaine personnalisé si configuré)
 */
export function generatePublicUrl(page: {
  slug: string;
  customDomain?: string;
  status: string;
}): string {
  // Si la page a un domaine personnalisé et est publiée
  if (page.customDomain && page.status === 'published') {
    return `https://${page.customDomain}`;
  }

  // Sinon, utiliser l'URL SaaS
  return generateSaaSUrl(page.slug);
}

/**
 * Vérifie si une URL est absolue
 */
export function isAbsoluteUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Transforme une URL relative en URL absolue
 */
export function makeAbsoluteUrl(url: string): string {
  if (isAbsoluteUrl(url)) {
    return url;
  }

  const baseUrl = getAppBaseUrl();
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}
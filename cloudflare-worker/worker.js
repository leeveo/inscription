/**
 * Cloudflare Worker pour gérer les domaines clients
 * Redirige automatiquement vers les pages publiques de l'admin
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const hostname = request.headers.get('host') || url.hostname;
    
    console.log(`🌐 Requête reçue pour: ${hostname}`);

    try {
      // Étape 1: Vérifier si le domaine est autorisé via l'API
      const domainCheck = await checkDomainAuthorization(hostname, env);
      
      if (!domainCheck.authorized) {
        console.log(`❌ Domaine non autorisé: ${hostname}`);
        return new Response('Domain not found', { 
          status: 404,
          headers: {
            'Content-Type': 'text/html',
          },
        });
      }

      console.log(`✅ Domaine autorisé: ${hostname} -> Page: ${domainCheck.page.slug}`);

      // Étape 2: Construire l'URL de destination
      const targetPath = `/p/${domainCheck.page.slug}`;
      const searchParams = url.search;
      const targetUrl = `https://admin.waivent.app${targetPath}${searchParams}`;

      console.log(`🎯 Redirection vers: ${targetUrl}`);

      // Étape 3: Faire la requête vers l'app principale
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          ...request.headers,
          'X-Forwarded-Host': hostname,
          'X-Original-Host': hostname,
          'X-Forwarded-Proto': 'https',
          'X-Real-IP': request.headers.get('CF-Connecting-IP') || 'unknown',
          'User-Agent': request.headers.get('User-Agent') || 'Cloudflare-Worker/1.0',
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      // Étape 4: Retourner la réponse en modifiant les headers si nécessaire
      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          'X-Powered-By': 'Cloudflare-Workers',
          'Access-Control-Allow-Origin': '*',
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
        },
      });

      console.log(`✅ Réponse: ${response.status} pour ${hostname}`);
      return modifiedResponse;

    } catch (error) {
      console.error(`❌ Erreur pour ${hostname}:`, error);
      
      return new Response('Internal Server Error', {
        status: 500,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
  },
};

/**
 * Vérifier si un domaine est autorisé via l'API principale
 */
async function checkDomainAuthorization(hostname, env) {
  try {
    console.log(`🔍 Vérification du domaine: ${hostname}`);

    // Nettoyer le domaine (enlever www. si présent)
    const cleanHostname = hostname.replace(/^www\./, '');

    // Appeler l'API de vérification
    const apiUrl = `https://admin.waivent.app/api/check-domain/${cleanHostname}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cloudflare-Worker/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.log(`❌ API check failed: ${response.status}`);
      return { authorized: false, reason: 'API check failed' };
    }

    const data = await response.json();
    console.log(`📊 API Response:`, data);

    return {
      authorized: data.authorized || false,
      page: data.page || null,
      domain: data.domain || cleanHostname,
      reason: data.reason || 'Unknown',
    };

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    return { 
      authorized: false, 
      reason: `Verification error: ${error.message}` 
    };
  }
}
/**
 * Cloudflare Worker pour gérer les domaines clients
 * Version corrigée avec support SSL automatique
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let hostname = request.headers.get('host') || url.hostname;
    
    console.log(`🌐 Requête reçue pour: ${hostname}`);
    console.log(`📁 Path: ${url.pathname}`);

    try {
      // Détecter les ressources statiques
      const isAsset = url.pathname.startsWith('/_next/') || 
                     url.pathname.startsWith('/static/') ||
                     url.pathname.startsWith('/favicon.') ||
                     url.pathname.startsWith('/api/') ||
                     url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/i);

      if (isAsset) {
        console.log(`📦 Asset détecté: ${url.pathname}`);
        
        const assetUrl = `https://admin.waivent.app${url.pathname}${url.search}`;
        console.log(`🔗 Redirection asset vers: ${assetUrl}`);
        
        const response = await fetch(assetUrl, {
          method: request.method,
          headers: {
            ...request.headers,
            'Host': 'admin.waivent.app',
            'X-Forwarded-Host': hostname,
            'X-Original-Host': hostname,
          },
          body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        });

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...response.headers,
            'X-Powered-By': 'Cloudflare-Workers-Asset',
            'X-Proxy-Domain': hostname,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
      }

      // Vérification du domaine via l'API
      const domainCheck = await checkDomainAuthorization(hostname, env);
      
      if (!domainCheck.authorized) {
        console.log(`❌ Domaine non autorisé: ${hostname} - Raison: ${domainCheck.reason}`);
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Domain Not Found</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error { color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1 class="error">Domain Not Found</h1>
            <p>Le domaine <strong>${hostname}</strong> n'est pas configuré ou n'est pas actif.</p>
            <p><em>Raison: ${domainCheck.reason}</em></p>
          </body>
          </html>
        `, { 
          status: 404,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      }

      console.log(`✅ Domaine autorisé: ${hostname} -> Page: ${domainCheck.page.slug}`);

      // Construction de l'URL de destination
      const targetPath = `/p/${domainCheck.page.slug}`;
      const searchParams = url.search;
      const targetUrl = `https://admin.waivent.app${targetPath}${searchParams}`;

      console.log(`🎯 Redirection page vers: ${targetUrl}`);

      // Requête vers l'app principale
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          ...request.headers,
          'Host': 'admin.waivent.app',
          'X-Forwarded-Host': hostname,
          'X-Original-Host': hostname,
          'X-Forwarded-Proto': 'https',
          'X-Real-IP': request.headers.get('CF-Connecting-IP') || 'unknown',
          'User-Agent': request.headers.get('User-Agent') || 'Cloudflare-Worker/1.0',
          'X-Pathname': targetPath,
          'X-Client-View': 'true',
          'X-Domain-Proxy': 'cloudflare-worker',
        },
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      });

      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          'X-Powered-By': 'Cloudflare-Workers',
          'X-Proxy-Domain': hostname,
          // Ajout des headers de sécurité SSL
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
        },
      });

      console.log(`✅ Réponse: ${response.status} pour ${hostname}`);
      return modifiedResponse;

    } catch (error) {
      console.error(`❌ Erreur pour ${hostname}:`, error);
      
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Internal Server Error</title>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <h1 class="error">Internal Server Error</h1>
          <p>Une erreur interne s'est produite lors du traitement de votre demande.</p>
          <p><em>Domaine: ${hostname}</em></p>
          <p><em>Erreur: ${error.message}</em></p>
        </body>
        </html>
      `, {
        status: 500,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
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
    console.log(`📡 Appel API: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cloudflare-Worker/1.0',
        'Accept': 'application/json',
        'Host': 'admin.waivent.app',
      },
    });

    if (!response.ok) {
      console.log(`❌ API check failed: ${response.status} ${response.statusText}`);
      return { 
        authorized: false, 
        reason: `API check failed: ${response.status}`,
        page: null,
        domain: cleanHostname
      };
    }

    const data = await response.json();
    console.log(`📊 API Response:`, JSON.stringify(data));

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
      reason: `Verification error: ${error.message}`,
      page: null,
      domain: hostname
    };
  }
}
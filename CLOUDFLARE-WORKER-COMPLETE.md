# Solution Cloudflare Workers - 100% Automatique

## Pourquoi Cloudflare Workers est la vraie solution

✅ **AUCUNE limitation** de domaines
✅ **100% automatique** - vous n'intervenez jamais
✅ **Illimité** de domaines
✅ **SSL gratuit** automatique
✅ **Coût : GRATUIT** jusqu'à 100k requêtes/jour

## Architecture
```
domaine-client.com → Cloudflare Worker → votre-app.vercel.app
```

## Worker Script (complet)

```javascript
// worker.js - À déployer sur Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Journalisation
    console.log(`🔄 Request: ${hostname} -> ${url.pathname}`);

    // Construction de l'URL cible
    const targetUrl = `https://admin.waivent.app${url.pathname}${url.search}`;

    // Préparation des headers
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!key.toLowerCase().includes('host')) {
        headers.set(key, value);
      }
    });

    // Headers de proxy
    headers.set('X-Forwarded-Host', hostname);
    headers.set('X-Original-Host', hostname);
    headers.set('X-Forwarded-Proto', url.protocol);
    headers.set('X-Forwarded-For', request.cf.colo);

    // Options de la requête
    const requestOptions = {
      method: request.method,
      headers: headers,
    };

    // Body si présent
    if (request.body) {
      requestOptions.body = request.body;
    }

    try {
      // Envoi vers votre app
      const response = await fetch(targetUrl, requestOptions);

      // Préparation de la réponse
      const responseHeaders = new Headers();
      response.headers.forEach((value, key) => {
        responseHeaders.set(key, value);
      });

      // Headers CORS
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');

      const body = await response.text();

      console.log(`✅ Response: ${response.status} for ${hostname}`);

      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      return new Response('Proxy Error', { status: 502 });
    }
  }
};
```

## Déploiement du Worker

### 1. Créez un compte Cloudflare (gratuit)
### 2. Allez dans "Workers & Pages"
### 3. Créez un nouveau Worker
### 4. Collez le code ci-dessus
### 5. Déployez
### 6. Notez le domaine du Worker (ex: `waivent-proxy.your-subdomain.workers.dev`)

## Instructions pour TOUS vos clients (toujours les mêmes)

**Donnez CES instructions à tous vos futurs clients :**

```
📋 Configuration DNS pour votre domaine personnalisé

1️⃣ DOMAINE RACINE
Type: A
Nom: @
Cible: 192.0.2.1
TTL: 3600

2️⃣ SOUS-DOMAINE WWW
Type: A
Nom: www
Cible: 192.0.2.1
TTL: 3600

Où 192.0.2.1 est l'IP de votre Cloudflare Worker
```

## Trouvez l'IP de votre Worker

Après déploiement, Cloudflare vous donnera l'IP du Worker ou utilisez :
- `ping waivent-proxy.your-subdomain.workers.dev`
- Ou regardez dans les réglages du Worker

## Workflow final (100% automatique)

1. **Client s'inscrit** sur votre SaaS
2. **Il crée sa page** avec le Page Builder
3. **Il configure son DNS** vers l'IP du Worker (instructions ci-dessus)
4. **Automatiquement** son domaine affiche sa page
5. **JAMAIS d'intervention** de votre part

## Avantages de Cloudflare Workers

✅ **VRAIMENT 100% automatique**
✅ **Illimité de domaines**
✅ **Pas de configuration manuelle**
✅ **SSL inclus**
✅ **CDN mondial**
✅ **100k requêtes/jour gratuites**
✅ **Analytics inclus**

## Coûts

- **Workers gratuit** : 100k requêtes/jour
- **Domaines illimités** : 0$ par domaine
- **SSL gratuit** : Inclus
- **Coût total** : 0$ (pour la plupart des SaaS)

---

**C'est LA vraie solution 100% automatique comme les grands SaaS !** 🚀
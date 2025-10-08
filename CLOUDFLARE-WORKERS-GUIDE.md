# Guide Complet Cloudflare Workers pour Multi-Domaines

## Pourquoi Cloudflare Workers est LA solution

✅ **VRAIMENT 100% automatique** - vous n'intervenez JAMAIS manuellement
✅ **Illimité de domaines** - pas de limite de 100 comme Vercel Pro
✅ **SSL gratuit** automatique pour tous les domaines
✅ **CDN mondial** inclus
✅ **100k requêtes/jour gratuites** (suffisant pour la plupart des SaaS)
✅ **Analytics détaillés** inclus

## Architecture finale

```
domaine-client.com → Cloudflare Worker → admin.waivent.app
```

## Configuration pré-requis

### 1. Votre application doit gérer les domaines

Votre app Next.js doit pouvoir détecter quand elle est appelée via le proxy :

```typescript
// src/app/p/[slug]/page.tsx (déjà configuré)
const requestHeaders = headers()
const forwardedHost = requestHeaders.get('x-forwarded-host')
const originalHost = requestHeaders.get('x-original-host')
const isProxyRequest = !!(forwardedHost || originalHost)

// Si requête proxy, trouver la page par domaine
if (isProxyRequest) {
  const domain = (forwardedHost || originalHost)?.replace(/^www\./, '')
  // Chercher dans builder_domains et afficher la page correspondante
}
```

### 2. API de validation des domaines

```typescript
// src/app/api/check-domain/[domain]/route.ts (déjà créé)
export async function GET(request: Request, { params }) {
  // Vérifie si le domaine est autorisé dans builder_domains
  // Retourne { authorized: true/false, page: {...} }
}
```

## Script Cloudflare Worker complet

```javascript
// worker.js - À déployer sur Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Journalisation pour le debug
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

    // Headers de proxy IMPORTANTS
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

      // Headers CORS pour éviter les erreurs
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
      return new Response('Proxy Error - Contact support', { status: 502 });
    }
  }
};
```

## Déploiement du Worker

### 1. Créez un compte Cloudflare (gratuit)
- Allez sur [cloudflare.com](https://cloudflare.com)
- Inscrivez-vous (gratuit)

### 2. Accédez à Workers & Pages
- Dans le dashboard Cloudflare
- Cliquez sur "Workers & Pages" dans le menu de gauche

### 3. Créez un nouveau Worker
- Cliquez sur "Create Worker"
- Donnez-lui un nom (ex: `waivent-proxy`)
- Cliquez sur "Deploy"

### 4. Collez le code du Worker
- Cliquez sur "Edit code"
- Remplacez tout le contenu par le script ci-dessus
- Cliquez sur "Save and Deploy"

### 5. Notez le domaine du Worker
Après déploiement, Cloudflare vous donnera un domaine comme :
- `waivent-proxy.votre-subdomain.workers.dev`

## Trouver l'IP du Worker

### Méthode 1: Ping
```bash
ping waivent-proxy.votre-subdomain.workers.dev
```

### Méthode 2: Dans le dashboard Cloudflare
- Allez dans les réglages du Worker
- Cherchez "Worker Domain" ou IP associée

## Instructions pour TOUS vos clients

### DNS à configurer (UNIQUEMENT ces instructions)

**Donnez CES instructions à tous vos futurs clients :**

```
📋 Configuration DNS pour votre domaine personnalisé

1️⃣ DOMAINE RACINE (ex: mon-entreprise.fr)
Type: A
Nom: @
Cible: [IP_DU_WORKER]
TTL: 3600

2️⃣ SOUS-DOMAINE WWW (ex: www.mon-entreprise.fr)
Type: A
Nom: www
Cible: [IP_DU_WORKER]
TTL: 3600

Où [IP_DU_WORKER] est l'IP de votre Cloudflare Worker
```

## Workflow final (100% automatique)

1. **Client s'inscrit** sur votre SaaS (admin.waivent.app)
2. **Il crée sa page** avec le Page Builder
3. **Il ajoute son domaine** dans l'admin (ex: www.securiteroutiere-journee-sensibilisation.live)
4. **Il configure son DNS** vers l'IP du Worker (instructions ci-dessus)
5. **Automatiquement** son domaine affiche sa page
6. **JAMAIS d'intervention** de votre part

## Gestion des domaines dans votre SaaS

### Ajout automatique dans la base

Quand un client ajoute un domaine dans l'admin :

```sql
INSERT INTO builder_domains (
  id,
  site_id,
  type,
  host,
  dns_status,
  ssl_status,
  is_primary,
  created_at
) VALUES (
  gen_random_uuid(),
  [SITE_ID],
  'custom',
  'www.securiteroutiere-journee-sensibilisation.live',
  'pending',
  'pending',
  true,
  NOW()
);
```

### Vérification DNS (optionnel)

Vous pouvez ajouter un système pour vérifier que le client a bien configuré son DNS :

```typescript
// API pour vérifier la configuration DNS
export async function POST(request: Request) {
  const { domain } = await request.json();

  // Vérifier que le domaine pointe bien vers l'IP du Worker
  const dnsResult = await checkDNS(domain, WORKER_IP);

  if (dnsResult.success) {
    // Mettre à jour builder_domains.dns_status = 'verified'
  }
}
```

## Avantages de Cloudflare Workers vs Vercel

| Fonctionnalité | Cloudflare Workers | Vercel |
|---------------|-------------------|--------|
| **Domaines illimités** | ✅ OUI | ❌ Limité à 100 (Pro) |
| **Configuration automatique** | ✅ 100% automatique | ❌ Manuel requis |
| **SSL gratuit** | ✅ Inclus | ✅ Inclus |
| **Coût** | ✅ Gratuit (100k req/jour) | ❌ $20/mois (100 domaines) |
| **CDN mondial** | ✅ Inclus | ✅ Inclus |
| **Analytics** | ✅ Inclus | ✅ Inclus |

## Debug et Monitoring

### Logs du Worker
- Dans le dashboard Cloudflare
- Section "Workers & Pages" → Votre Worker → "Logs"

### Erreurs communes
- **404**: Le domaine n'est pas dans builder_domains ou la page n'est pas publiée
- **502**: Votre app principale n'est pas accessible
- **SSL errors**: SSL pas encore provisionné (patientez 5-10 minutes)

## Coûts détaillés

### Cloudflare Workers (gratuit)
- **100,000 requêtes/jour** : $0
- **Domaines illimités** : $0
- **SSL gratuit** : $0
- **CDN mondial** : $0
- **Analytics** : $0

### Pour aller plus loin (si besoin)
- **Workers Paid** : $5/mois (10M requêtes/jour)
- **Bande passante** : $0.15/GB après 100GB gratuits

## Migration depuis Vercel

### Si vous utilisez déjà Vercel Proxy
1. Déployez le Worker Cloudflare
2. Mettez à jour les instructions DNS des clients
3. Supprimez progressivement les domaines de Vercel
4. Conservez Vercel Proxy comme fallback temporaire

### URL cible dans le Worker
```javascript
const targetUrl = `https://admin.waivent.app${url.pathname}${url.search}`;
```

Assurez-vous que c'est bien votre URL de production.

---

## Conclusion

Cloudflare Workers est **LA vraie solution scalable** pour les SaaS multi-domaines :

✅ **Vraiment 100% automatique** - aucune intervention manuelle
✅ **Illimité de domaines** - pas de limites arbitraires
✅ **Gratuit** pour la plupart des usages
✅ **Performance mondiale** avec CDN inclus
✅ **SSL automatique** pour tous les domaines

**C'est exactement comme les grands SaaS (Webflow, Framer, etc.) !** 🚀

---

*Guide créé pour Waivent SaaS - Dernière mise à jour : 2025-10-08*
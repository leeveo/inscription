# Solution Vercel Reverse Proxy pour Multi-Domaines

## Architecture
```
*.client-domaines.com → Votre proxy Vercel → App principale
```

## 1. Créez un projet proxy Vercel

**Structure du projet proxy :**
```
vercel-proxy/
├── api/
│   └── [...slug]/
│       └── route.js
├── package.json
└── vercel.json
```

## 2. API Route Proxy

```javascript
// vercel-proxy/api/[...slug]/route.js
export async function GET(request, { params }) {
  const { slug } = params;
  const host = request.headers.get('host');

  // Vérifier si ce domaine est autorisé
  const allowedDomains = await getAllowedDomains();
  if (!allowedDomains.includes(host)) {
    return new Response('Domain not authorized', { status: 404 });
  }

  // Rediriger vers votre app principale
  const targetUrl = `https://admin.waivent.app/${slug.join('/')}`;

  const response = await fetch(targetUrl, {
    headers: {
      'X-Original-Host': host,
      'X-Forwarded-Host': host
    }
  });

  return response;
}

// Fonction pour vérifier les domaines autorisés
async function getAllowedDomains() {
  // Appelez votre API pour obtenir les domaines valides
  const response = await fetch('https://admin.waivent.app/api/allowed-domains');
  const data = await response.json();
  return data.domains;
}
```

## 3. Configuration Vercel

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## 4. Instructions pour vos clients

**Donnez ce domaine générique à tous les clients :**

```
Configurez votre domaine pour pointer vers :
Type: CNAME
Nom: @
Valeur: proxy.votre-domaine.com

Type: CNAME
Nom: www
Valeur: proxy.votre-domaine.com
```

## 5. Dans votre app principale

```javascript
// Créez une API route pour lister les domaines autorisés
// GET /api/allowed-domains
export async function GET() {
  const supabase = await supabaseServer();

  const { data: domains } = await supabase
    .from('builder_domains')
    .select('host')
    .eq('dns_status', 'verified')
    .eq('is_active', true);

  return NextResponse.json({
    domains: domains.map(d => d.host)
  });
}
```

## Avantages

✅ **Une seule configuration** Vercel pour vous
✅ **Clients utilisent le même domaine** proxy
✅ **Géré automatiquement** via votre base de données
✅ **SSL inclus**
✅ **Analytics Vercel**

## Workflow final

1. Vous créez 1 projet proxy Vercel : `proxy.waivent.app`
2. Tous vos clients pointent vers ce proxy
3. Le proxy vérifie si leur domaine est autorisé
4. Si oui, redirige vers votre app principale
5. L'affichage se fait selon le domaine d'origine

**Exemples :**
- `client1.com` → `proxy.waivent.app` → `/p/page-client1`
- `client2.fr` → `proxy.waivent.app` → `/p/page-client2`

**Zéro configuration manuelle par client !** 🚀
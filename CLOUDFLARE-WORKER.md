# Configuration Cloudflare Worker pour Multi-Domaines SaaS

## Architecture
```
client-domaine.com → Cloudflare Worker → votre-app.vercel.app
```

## Worker Script

```javascript
// Cloudflare Worker pour gérer les domaines clients
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Liste des domaines autorisés (ou vérifier en base de données)
    const allowedDomains = [
      'securiteroutiere-journee-sensibilisation.live',
      // autres domaines clients...
    ];

    if (!allowedDomains.includes(hostname)) {
      return new Response('Domain not found', { status: 404 });
    }

    // Construire l'URL de votre app Vercel
    const targetUrl = `https://admin.waivent.app${url.pathname}${url.search}`;

    // Créer la requête vers Vercel
    const vercelRequest = new Request(targetUrl, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers),
        'X-Original-Host': hostname,
        'X-Forwarded-Host': hostname
      },
      body: request.body,
      redirect: 'manual'
    });

    // Envoyer la requête à Vercel
    const response = await fetch(vercelRequest);

    // Retourner la réponse de Vercel
    return response;
  }
};
```

## Configuration Client

**Donnez ces instructions à vos clients :**

1. **Créez un compte Cloudflare gratuit**
2. **Ajoutez votre domaine** à Cloudflare
3. **Configurez les DNS** :
   ```
   Type: A
   Name: @
   Content: 192.0.2.1 (IP Worker)
   TTL: Auto

   Type: A
   Name: www
   Content: 192.0.2.1 (IP Worker)
   TTL: Auto
   ```
4. **Activez le Worker** pour votre domaine

## Dans votre app Next.js

```javascript
// Pour savoir quel domaine client est utilisé
export async function getServerSideProps({ req }) {
  const originalHost = req.headers['x-original-host'];
  const forwardedHost = req.headers['x-forwarded-host'];
  const clientDomain = originalHost || forwardedHost;

  // Trouvez la page correspondante à ce domaine
  const page = await findPageByDomain(clientDomain);

  return {
    props: { page, clientDomain }
  };
}
```

## Avantages

✅ **Configuration unique** pour vous
✅ **Auto-gérable** par les clients
✅ **SSL gratuit** via Cloudflare
✅ **CDN mondial** inclus
✅ **Analytics** gratuits

## Coûts

- **Cloudflare Workers** : Gratuit jusqu'à 100k requêtes/jour
- **Domaines illimités** : Vous payez, pas vos clients
- **SSL inclus** : Gratuit

## Workflow Client

1. Client s'inscrit sur votre SaaS
2. Il crée sa page via le Page Builder
3. Il configure son domaine vers Cloudflare Worker
4. Automatiquement, son domaine pointe vers sa page
5. **Zéro intervention de votre part** !
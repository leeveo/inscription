# Solution Proxy SSL via Vercel

## Configuration recommandée pour éviter le transfert DNS Cloudflare

### 1. Créer un projet Vercel proxy

Créez un simple projet Next.js sur Vercel qui agira comme proxy :

```javascript
// pages/api/[...path].js
export default function handler(req, res) {
  // Proxy toutes les requêtes vers admin.waivent.app
  return new Promise((resolve) => {
    const targetUrl = `https://admin.waivent.app${req.url}`;
    
    fetch(targetUrl, {
      method: req.method,
      headers: {
        ...req.headers,
        'Host': 'admin.waivent.app',
        'X-Forwarded-Host': 'securiteroutiere-journee-sensibilisation.live',
        'X-Original-Host': 'securiteroutiere-journee-sensibilisation.live',
        'X-Client-View': 'true'
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    })
    .then(response => response.text())
    .then(html => {
      res.status(200).html(html);
      resolve();
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
      resolve();
    });
  });
}

// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/(.*)',
        destination: '/api/$1'
      }
    ];
  }
};
```

### 2. Configuration DNS simplifiée

Dans OVH, pointez directement vers ce projet Vercel :

```dns
www.securiteroutiere-journee-sensibilisation.live. CNAME cname.vercel-dns.com.
```

### 3. Dans Vercel, ajoutez le domaine personnalisé

Vercel générera automatiquement un certificat SSL pour votre domaine.
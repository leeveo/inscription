# Cloudflare Worker pour Domaines Clients

Ce Worker Cloudflare gère automatiquement tous les domaines de vos clients.

## 🚀 Fonctionnalités

- ✅ **Vérification automatique** des domaines via votre API
- ✅ **Redirection intelligente** vers les pages publiques  
- ✅ **Support www et sans www**
- ✅ **Gestion des erreurs** (404 pour domaines non autorisés)
- ✅ **Headers proxy** corrects pour votre application
- ✅ **Logs détaillés** pour le debugging

## 📋 Déploiement

### Étape 1: Créer le Worker sur Cloudflare

1. Allez sur [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Workers & Pages** → **Create Worker**
3. Nommez-le : `waivent-domain-router`
4. Copiez le contenu de `worker.js` dans l'éditeur
5. **Deploy**

### Étape 2: Configurer les Routes

Dans **Workers & Pages** → **waivent-domain-router** → **Settings** → **Triggers** :

Ajoutez ces routes :
- `*securiteroutiere-journee-sensibilisation.live/*`
- `*www.securiteroutiere-journee-sensibilisation.live/*`

### Étape 3: Variables d'environnement (si nécessaire)

Si vous avez besoin de clés API :
- **Settings** → **Environment Variables**
- Ajoutez vos variables

## 🔄 Flow complet

```
Client Domain (example.com)
    ↓ DNS pointé vers Cloudflare
    ↓ Cloudflare Worker déclenché  
    ↓ Vérification via API check-domain
    ↓ Redirection vers admin.waivent.app/p/home
    ↓ Page affichée avec le bon contenu
```

## 🧪 Test

Une fois déployé, testez :
```bash
curl -H "Host: securiteroutiere-journee-sensibilisation.live" https://waivent-domain-router.your-subdomain.workers.dev
```

## 📊 Avantages vs Vercel Proxy

- ✅ **Pas de 404 mysterieux**
- ✅ **Performance native CDN**
- ✅ **Pas de déploiement à maintenir**
- ✅ **Logs clairs et détaillés**
- ✅ **Configuration en 5 minutes**
- ✅ **Gratuit jusqu'à 100k requêtes/jour**
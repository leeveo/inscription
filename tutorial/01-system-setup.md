# ⚙️ Configuration Système Complète

> **Guide complet pour configurer et déployer le système de gestion des tickets**

## 📋 Table des Matières

1. [Prérequis](#-prérequis)
2. [Variables d'environnement](#-variables-denvironnement)
3. [Configuration Supabase](#-configuration-supabase)
4. [Configuration Email](#-configuration-email)
5. [Configuration UploadThing](#-configuration-uploadthing)
6. [Déploiement](#-déploiement)
7. [Vérification](#-vérification)

## 🔧 Prérequis

### Système requis

- **Node.js** : Version 18.0 ou supérieure
- **npm** : Version 8.0 ou supérieure
- **Git** : Pour la gestion de version

### Services externes requis

1. **Supabase** : Base de données et authentification
2. **Stripe** : Traitement des paiements
3. **Service Email** : Brevo OU MailerSend
4. **UploadThing** : Hébergement des fichiers
5. **Domaine personnalisé** (optionnel) : Pour les landing pages

## 🌍 Variables d'Environnement

### Fichier `.env.local`

Créer un fichier `.env.local` à la racine du projet `event-admin/` :

```env
# ===========================================
# SUPABASE CONFIGURATION
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# ===========================================
# STRIPE CONFIGURATION
# ===========================================
STRIPE_SECRET_KEY=sk_live_51xxxxxxxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxxxxxxxxxxxxxxxxx

# ===========================================
# EMAIL CONFIGURATION (Choisir un des deux)
# ===========================================

# Option 1: Brevo (Sendinblue)
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxx
BREVO_SENDER_EMAIL=noreply@votredomaine.com
BREVO_SENDER_NAME=Votre Organisation

# Option 2: MailerSend
MAILERSEND_API_KEY=mlsn.xxxxxxxxxxxxxxxxxxxxx
MAILERSEND_SENDER_EMAIL=noreply@votredomaine.com
MAILERSEND_SENDER_NAME=Votre Organisation

# ===========================================
# UPLOADTHING CONFIGURATION
# ===========================================
UPLOADTHING_SECRET=sk_xxxxxxxxxxxxxxxxxxxxx
UPLOADTHING_APP_ID=xxxxxxxx

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
NEXT_PUBLIC_APP_URL=https://votredomaine.com
NEXT_PUBLIC_API_URL=https://votredomaine.com/api

# ===========================================
# DEVELOPMENT/TESTING
# ===========================================
NODE_ENV=production
```

### Variables importantes expliquées

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase | `https://abc123.supabase.co` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (commence par `sk_`) | `sk_live_51ABC...` |
| `STRIPE_WEBHOOK_SECRET` | Secret pour valider les webhooks Stripe | `whsec_abc123...` |
| `UPLOADTHING_SECRET` | Clé secrète UploadThing | `sk_xxx...` |
| `NEXT_PUBLIC_APP_URL` | URL publique de votre application | `https://events.votredomaine.com` |

## 🗄️ Configuration Supabase

### 1. Création du projet

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé anonyme

### 2. Configuration de la base de données

Exécuter les scripts SQL dans l'ordre :

```sql
-- 1. Activer RLS (Row Level Security)
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO '<YOUR_JWT_SECRET>';

-- 2. Créer les extensions requises
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. Créer les tables (voir DATABASE_SCHEMA.md)
-- Exécuter le script de création des tables complètes
```

### 3. Configuration RLS

Activer Row Level Security sur toutes les tables :

```sql
-- Exemple pour la table des événements
ALTER TABLE inscription_evenements ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique
CREATE POLICY "Public read access" ON inscription_evenements
FOR SELECT USING (true);

-- Politique d'écriture authentifiée
CREATE POLICY "Authenticated write access" ON inscription_evenements
FOR ALL USING (auth.role() = 'authenticated');
```

### 4. Configuration du stockage

Créer les buckets nécessaires :

```sql
-- Bucket pour les logos d'événements
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-logos', 'event-logos', true);

-- Bucket pour les templates de tickets
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-templates', 'ticket-templates', false);
```

## 📧 Configuration Email

### Option 1: Brevo (Sendinblue)

1. Créer un compte sur [Brevo](https://www.brevo.com)
2. Obtenir la clé API :
   - Aller dans Settings > API Keys
   - Créer une nouvelle clé API
   - Copier la clé (`v3`)

3. Configurer le sender email :
   - Vérifier votre domaine d'envoi
   - Ajouter les enregistrements DNS SPF/DKIM

### Option 2: MailerSend

1. Créer un compte sur [MailerSend](https://www.mailersend.com)
2. Obtenir la clé API :
   - Aller dans Domains > API Tokens
   - Créer un nouveau token
   - Copier la clé API

3. Configurer le domaine :
   - Ajouter et vérifier votre domaine
   - Configurer les enregistrements DNS

## 📁 Configuration UploadThing

### 1. Création du compte

1. Aller sur [UploadThing](https://uploadthing.com)
2. Créer un nouveau compte
3. Créer une nouvelle application

### 2. Configuration des fichiers

```typescript
// event-admin/src/app/api/uploadthing/core.ts
import { createUploadthing } from "uploadthing/server";

export const f = createUploadthing();

export const uploadRouter = {
  eventLogo: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } }),
  ticketTemplate: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } }),
  participantImage: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } }),
};
```

### 3. Intégration avec l'application

```typescript
// event-admin/src/utils/uploadthing.ts
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";

export const UploadButton = generateUploadButton();
export const UploadDropzone = generateUploadDropzone();
```

## 🚀 Déploiement

### 1. Build de production

```bash
# Nettoyer le cache
npm run clean

# Vérifier les types
npx tsc --noEmit

# Linter
npm run lint

# Build
npm run build
```

### 2. Configuration Vercel (recommandé)

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app_url",
    "STRIPE_SECRET_KEY": "@stripe_secret_key",
    "STRIPE_WEBHOOK_SECRET": "@stripe_webhook_secret"
  }
}
```

### 3. Webhooks Stripe

Configurer le webhook Stripe :

1. Aller dans Stripe > Developers > Webhooks
2. Ajouter un endpoint : `https://votredomaine.com/api/payments/stripe`
3. Sélectionner les événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`

### 4. Domaine personnalisé

1. Configurer le DNS pour pointer vers Vercel
2. Mettre à jour `NEXT_PUBLIC_APP_URL`
3. Mettre à jour les CORS si nécessaire

## ✅ Vérification

### 1. Tests de connexion

```bash
# Test Supabase
curl https://votredomaine.com/api/test-supabase

# Test upload
curl -X POST https://votredomaine.com/api/uploadthing
```

### 2. Tests fonctionnels

1. **Création d'événement** :
   - Se connecter à l'admin
   - Créer un événement test
   - Vérifier l'affichage

2. **Configuration tickets** :
   - Ajouter des types de tickets
   - Tester les prix

3. **Test paiement** :
   - Utiliser le mode test Stripe
   - Vérifier le webhook

4. **Test email** :
   - Envoyer un ticket test
   - Vérifier la réception

### 3. Monitoring

Configurer les monitoring :

```typescript
// event-admin/src/lib/monitoring.ts
export const healthCheck = async () => {
  const checks = {
    database: await checkDatabase(),
    stripe: await checkStripe(),
    email: await checkEmail(),
    upload: await checkUpload()
  };
  return checks;
};
```

## 🔄 Maintenance

### Mises à jour régulières

1. **Mettre à jour les dépendances** :
   ```bash
   npm audit fix
   npm update
   ```

2. **Vérifier les webhooks** :
   - Tester les endpoints Stripe
   - Vérifier les logs

3. **Surveiller les performances** :
   - Monitoring des temps de réponse
   - Surveillance des erreurs

### Sauvegardes

1. **Base de données Supabase** : Automatique
2. **Fichiers uploadés** : UploadThing (redondant)
3. **Configuration** : Versionnée dans Git

---

**Prochaine étape** : [Architecture technique](02-architecture.md) →
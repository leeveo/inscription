# Configuration d'Environnement

## Configuration Supabase (Obligatoire)

Pour faire fonctionner l'application, vous devez configurer Supabase :

1. **Créez un fichier `.env.local`** à la racine du projet
2. **Copiez le contenu de `env.example`** dans votre `.env.local`
3. **Remplissez vos identifiants Supabase** :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anonyme-ici
SUPABASE_SERVICE_ROLE_KEY=votre-clé-service-role-ici
```

### Où trouver ces valeurs :

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

## Configuration Optionnelle

### Email (MailerSend ou Brevo)
```env
MAILERSEND_API_KEY=votre-clé-mailersend
BREVO_API_KEY=votre-clé-brevo
```

### Paiements Stripe
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=votre-clé-publique-stripe
STRIPE_SECRET_KEY=votre-clé-secrète-stripe
```

### Upload de fichiers
```env
UPLOADTHING_SECRET=votre-secret-uploadthing
UPLOADTHING_APP_ID=votre-app-id-uploadthing
```

## Démarrage

Après avoir configuré `.env.local` :

```bash
npm install
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)
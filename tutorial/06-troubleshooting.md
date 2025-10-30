# 🔧 Guide de Dépannage Complet

> **Solutions aux problèmes courants et debugging du système de gestion des tickets**

## 📋 Table des Matières

1. [Problèmes fréquents](#️-problèmes-fréquents)
2. [Debugging des paiements](#️-debugging-des-paiements)
3. [Problèmes d'envoi d'emails](#️-problèmes-denvoi-demails)
4. [Issues QR codes et check-in](#️-issues-qr-codes-et-check-in)
5. [Performance et optimisation](#️-performance-et-optimisation)
6. [Erreurs de base de données](#️-erreurs-de-base-de-données)
7. [Sécurité et authentification](#️-sécurité-et-authentification)
8. [Outils de monitoring](#️-outils-de-monitoring)

## 🚨 Problèmes Fréquents

### 1. Événement payant ne fonctionne pas

**Symptôme** : L'onglet "Billetterie" n'apparaît pas

**Causes possibles** :
```sql
-- Vérifier que l'événement est bien marqué comme payant
SELECT id, nom, evenement_payant, statut
FROM inscription_evenements
WHERE id = 'votre-event-id';
```

**Solution** :
```typescript
// Dans l'admin de l'événement
1. Éditer l'événement
2. Cocher la case "Événement payant" ✅
3. Sauvegarder
4. Rafraîchir la page
```

### 2. Les types de tickets ne s'affichent pas

**Symptôme** : Page billetterie vide

**Debugging** :
```sql
-- Vérifier les tickets existants
SELECT * FROM inscription_ticket_types
WHERE evenement_id = 'votre-event-id'
AND visible = true;
```

**Solution** :
```typescript
// API endpoint pour debug
GET /api/debug/ticket-types?eventId=votre-event-id

// Vérifier la réponse :
{
  "success": true,
  "data": [...], // doit contenir des tickets
  "sql_query": "..." // requête exécutée
}
```

### 3. Le paiement échoue systématiquement

**Symptôme** : Erreur 500 ou échec lors du paiement

**Debugging** :
```bash
# 1. Vérifier les clés Stripe
echo $STRIPE_SECRET_KEY
echo $STRIPE_PUBLISHABLE_KEY

# 2. Tester la connexion Stripe
curl -X GET https://api.stripe.com/v1/account \
  -u sk_test_xxxx: \
  -H "Stripe-Version: 2023-10-16"
```

**Solution** :
```typescript
// Vérifier la configuration
const checkStripeConfig = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY manquant');
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET manquant');
  }
};
```

## 💳 Debugging des Paiements

### 1. Payment Intent non créé

**Symptôme** : Erreur lors de la création du Payment Intent

**Logs à vérifier** :
```typescript
// Dans les logs du serveur
console.log('Payment Intent creation request:', {
  amount,
  orderId,
  metadata
});

// Réponse Stripe
console.log('Stripe response:', {
  id: paymentIntent.id,
  status: paymentIntent.status,
  clientSecret: paymentIntent.client_secret
});
```

**Debug API** :
```bash
# Test manuel de création
curl -X POST http://localhost:3000/api/payments/create-intent \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 49.99,
    "orderId": "test-order-id",
    "metadata": {"eventId": "test-event-id"}
  }'
```

**Causes communes** :
- Clé API Stripe invalide
- Montant invalide (doit être en centimes)
- Métadonnées trop volumineuses
- Rate limiting Stripe

### 2. Webhook non reçu

**Symptôme** : Paiement réussi mais commande non mise à jour

**Debugging** :
```bash
# 1. Vérifier la configuration du webhook
stripe listen --forward-to localhost:3000/api/payments/stripe

# 2. Tester le webhook avec les events de test
stripe trigger payment_intent.succeeded
```

**Solution** :
```typescript
// Vérifier la signature du webhook
const verifyWebhook = (payload: string, signature: string) => {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    console.log('✅ Webhook verified:', event.type);
    return event;
  } catch (err) {
    console.error('❌ Webhook verification failed:', err);
    throw err;
  }
};
```

### 3. Email non envoyé après paiement

**Symptôme** : Paiement réussi mais email non reçu

**Debugging** :
```typescript
// Logs de l'envoi d'email
const emailLogs = await supabase
  .from('email_logs')
  .select('*')
  .eq('order_id', orderId)
  .order('created_at', { ascending: false });

console.log('Email logs:', emailLogs.data);
```

**Checklist** :
- [ ] Configuration email (Brevo/MailerSend)
- [ ] Templates email créés
- [ ] Variables du template correctes
- [ ] Adresse email du destinataire valide

## 📧 Problèmes d'Envoi d'Emails

### 1. Brevo API Key invalide

**Symptôme** : Erreur 401 Unauthorized

**Debug** :
```bash
# Test de la clé API Brevo
curl -X POST https://api.brevo.com/v3/smtp/email \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -H 'api-key: YOUR_BREVO_API_KEY' \
  -d '{
    "sender": {"name":"Test","email":"test@example.com"},
    "to": [{"email":"test@example.com"}],
    "subject":"Test",
    "htmlContent":"<html><body>Test</body></html>"
  }'
```

**Solution** :
```typescript
// Vérifier la clé API au démarrage
const verifyBrevoConfig = async () => {
  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': process.env.BREVO_API_KEY!,
      },
    });

    if (!response.ok) {
      throw new Error('Brevo API key invalide');
    }

    console.log('✅ Brevo API valid');
  } catch (error) {
    console.error('❌ Brevo API error:', error);
  }
};
```

### 2. Templates non trouvés

**Symptôme** : Erreur "Template not found"

**Debug** :
```sql
-- Vérifier les templates dans la base
SELECT * FROM inscription_ticket_templates
WHERE evenement_id = 'votre-event-id';

-- Vérifier les templates Brevo
-- Se connecter à Brevo > Campaigns > Templates
```

**Solution** :
```typescript
// Créer un template par défaut
const createDefaultTicketTemplate = async (eventId: string) => {
  const defaultTemplate = `
    <html>
      <body>
        <h1>{{event_name}}</h1>
        <p>Date: {{event_date}}</p>
        <p>Lieu: {{event_location}}</p>
        <p>Participant: {{participant_firstname}} {{participant_lastname}}</p>
        <div>{{qr_code}}</div>
      </body>
    </html>
  `;

  await supabase
    .from('inscription_ticket_templates')
    .insert({
      evenement_id: eventId,
      html_content: defaultTemplate,
      subject: 'Votre billet pour {{event_name}}',
    });
};
```

### 3. Variables non remplacées

**Symptôme** : Email reçu avec des variables comme `{{event_name}}`

**Debug** :
```typescript
// Fonction de replacement des variables
const replaceTemplateVariables = (template: string, data: any) => {
  let result = template;

  // Remplacer toutes les variables
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, data[key] || `[${key}]`);
  });

  console.log('Template variables replaced:', {
    original: template,
    data,
    result
  });

  return result;
};
```

## 🔍 Issues QR Codes et Check-in

### 1. QR code non généré

**Symptôme** : Pas de QR code sur le ticket

**Debug** :
```sql
-- Vérifier les tokens QR
SELECT * FROM inscription_participant_qr_tokens
WHERE participant_id = 123;

-- Vérifier que le token est actif
SELECT is_active, expires_at
FROM inscription_participant_qr_tokens
WHERE qr_token = 'TOKEN-ABC-123';
```

**Solution** :
```typescript
// Regénérer un token QR
const regenerateQRToken = async (participantId: number) => {
  const newToken = crypto.randomBytes(16).toString('hex').toUpperCase();
  const ticketUrl = `${process.env.NEXT_PUBLIC_APP_URL}/ticket/${participantId}`;

  await supabase
    .from('inscription_participant_qr_tokens')
    .upsert({
      participant_id: participantId,
      qr_token: newToken,
      ticket_url: ticketUrl,
      is_active: true,
    });

  return { token: newToken, url: ticketUrl };
};
```

### 2. Scan du QR code échoue

**Symptôme** : "Ticket invalide" lors du scan

**Debug API** :
```bash
# Test de vérification du token
curl -X POST https://votredomaine.com/api/verify-qr/TOKEN-ABC-123 \
  -H "Content-Type: application/json" \
  -d '{"session_id": 123}'
```

**Solution** :
```typescript
// Endpoint de debug pour QR code
app.get('/api/debug/qr/:token', async (req, res) => {
  const { token } = req.params;

  const result = await supabase
    .from('inscription_participant_qr_tokens')
    .select(`
      *,
      participant:inscription_participants(*),
      event:inscription_evenements(*)
    `)
    .eq('qr_token', token)
    .single();

  res.json({
    token_found: !!result.data,
    token_active: result.data?.is_active,
    token_expired: result.data?.expires_at < new Date(),
    participant: result.data?.participant,
    event: result.data?.event,
  });
});
```

### 3. Check-in déjà effectué

**Symptôme** : Message "Déjà check-in" alors que c'est le premier scan

**Debug** :
```sql
-- Vérifier les check-ins existants
SELECT * FROM inscription_checkins
WHERE participant_id = 123
AND session_id = 456;

-- Vérifier le statut du participant
SELECT checked_in, checked_in_at
FROM inscription_participants
WHERE id = 123;
```

**Solution** :
```typescript
// Reset du check-in (admin seulement)
const resetCheckin = async (participantId: number, sessionId: number) => {
  await supabase
    .from('inscription_checkins')
    .delete()
    .eq('participant_id', participantId)
    .eq('session_id', sessionId);

  await supabase
    .from('inscription_participants')
    .update({
      checked_in: false,
      checked_in_at: null
    })
    .eq('id', participantId);
};
```

## ⚡ Performance et Optimisation

### 1. Page de check-in lente

**Symptôme** : Plus de 3 secondes pour charger

**Debug** :
```sql
-- Analyser les requêtes lentes
EXPLAIN ANALYZE
SELECT p.*, e.nom as event_nom, tt.nom as ticket_type_nom
FROM inscription_participants p
JOIN inscription_evenements e ON p.evenement_id = e.id
LEFT JOIN inscription_order_items oi ON p.order_id = oi.order_id
LEFT JOIN inscription_ticket_types tt ON oi.ticket_type_id = tt.id
WHERE p.evenement_id = 'event-uuid'
AND p.checked_in = false;
```

**Solutions** :
```sql
-- Ajouter des index
CREATE INDEX idx_participants_event_checked_in
ON inscription_participants(evenement_id, checked_in);

CREATE INDEX idx_qr_tokens_token_active
ON inscription_participant_qr_tokens(qr_token, is_active);
```

### 2. Temps de génération des PDF lent

**Symptôme** : Plus de 10 secondes pour générer un ticket

**Optimisation** :
```typescript
// Cache des templates PDF
const cachedTemplates = new Map();

const generateTicketPDF = async (participantId: number) => {
  const cacheKey = `ticket-${participantId}`;

  if (cachedTemplates.has(cacheKey)) {
    return cachedTemplates.get(cacheKey);
  }

  // Génération du PDF...
  const pdfBuffer = await puppeteer.pdf({
    format: 'a4',
    printBackground: true,
    margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
  });

  // Cache pour 1 heure
  cachedTemplates.set(cacheKey, pdfBuffer);
  setTimeout(() => cachedTemplates.delete(cacheKey), 3600000);

  return pdfBuffer;
};
```

## 🗄️ Erreurs de Base de Données

### 1. Connexion Supabase échoue

**Symptôme** : Erreur 500 sur toutes les pages

**Debug** :
```typescript
// Test de connexion Supabase
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('inscription_evenements')
      .select('count(*)')
      .single();

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    console.log('✅ Supabase connection OK');
    return true;
  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    return false;
  }
};
```

**Solution** :
```bash
# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test avec curl
curl -X GET https://your-project.supabase.co/rest/v1/inscription_evenements \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 2. RLS (Row Level Security) bloque les requêtes

**Symptôme** : Erreur "permission denied" sur certaines données

**Debug** :
```sql
-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'inscription_participants';

-- Tester la politique
SELECT auth.jwt() ->> 'role' as user_role;
```

**Solution** :
```sql
-- Politique RLS correcte pour les participants
CREATE POLICY "Users can read event participants"
ON inscription_participants FOR SELECT
USING (
  evenement_id IN (
    SELECT id FROM inscription_evenements
    WHERE created_by = auth.uid() OR statut = 'publié'
  )
);

CREATE POLICY "Users can insert participants"
ON inscription_participants FOR INSERT
WITH CHECK (true);
```

### 3. Contraintes d'unicité violées

**Symptôme** : Erreur "duplicate key value violates unique constraint"

**Debug** :
```sql
-- Trouver les doublons
SELECT participant_id, evenement_id, COUNT(*)
FROM inscription_participant_qr_tokens
GROUP BY participant_id, evenement_id
HAVING COUNT(*) > 1;
```

**Solution** :
```sql
-- Nettoyer les doublons
DELETE FROM inscription_participant_qr_tokens
WHERE id NOT IN (
  SELECT DISTINCT ON (participant_id, evenement_id) id
  FROM inscription_participant_qr_tokens
  ORDER BY participant_id, evenement_id, created_at DESC
);
```

## 🔐 Sécurité et Authentification

### 1. Session utilisateur expirée

**Symptôme** : Redirection vers login toutes les 5 minutes

**Debug** :
```typescript
// Vérifier la configuration JWT
const checkJWTConfig = () => {
  console.log('JWT Secret exists:', !!process.env.SUPABASE_JWT_SECRET);
  console.log('Session duration:', process.env.SUPABASE_SESSION_DURATION);
};

// Monitoring des sessions
const monitorSessions = async () => {
  const { data: sessions } = await supabase.auth.admin.listUsers();
  console.log('Active sessions:', sessions.length);
};
```

**Solution** :
```typescript
// Configurer le refresh token automatique
const supabase = createClientComponentClient({
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
```

### 2. Permissions insuffisantes

**Symptôme** : Erreur 403 sur certaines actions admin

**Debug** :
```typescript
// Vérifier le rôle de l'utilisateur
const checkUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Utilisateur non connecté');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('User role:', profile?.role);
  return profile?.role;
};
```

## 📊 Outils de Monitoring

### 1. Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    checkDatabase(),
    checkStripe(),
    checkEmail(),
    checkUpload(),
  ]);

  const [db, stripe, email, upload] = checks;

  return NextResponse.json({
    status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
    checks: {
      database: db.status === 'fulfilled' ? 'ok' : 'error',
      stripe: stripe.status === 'fulfilled' ? 'ok' : 'error',
      email: email.status === 'fulfilled' ? 'ok' : 'error',
      upload: upload.status === 'fulfilled' ? 'ok' : 'error',
    },
    timestamp: new Date().toISOString(),
  });
}
```

### 2. Dashboard de monitoring

```typescript
// app/admin/monitoring/page.tsx
export default async function MonitoringDashboard() {
  const health = await getSystemHealth();
  const metrics = await getSystemMetrics();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Monitoring</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          title="Database"
          status={health.checks.database}
          metrics={metrics.database}
        />
        <StatusCard
          title="Stripe"
          status={health.checks.stripe}
          metrics={metrics.stripe}
        />
        <StatusCard
          title="Email Service"
          status={health.checks.email}
          metrics={metrics.email}
        />
        <StatusCard
          title="File Upload"
          status={health.checks.upload}
          metrics={metrics.upload}
        />
      </div>

      {/* Logs récents */}
      <RecentLogs />

      {/* Performance graphs */}
      <PerformanceCharts data={metrics.performance} />
    </div>
  );
}
```

### 3. Alertes automatiques

```typescript
// lib/monitoring/alerts.ts
export const checkAndAlert = async () => {
  const issues = [];

  // Vérifier les erreurs de paiement
  const failedPayments = await getRecentFailedPayments();
  if (failedPayments.length > 5) {
    issues.push({
      type: 'payment_failures',
      severity: 'high',
      message: `${failedPayments.length} paiements échoués dans la dernière heure`,
    });
  }

  // Vérifier les emails non envoyés
  const pendingEmails = await getPendingEmails();
  if (pendingEmails.length > 10) {
    issues.push({
      type: 'email_queue',
      severity: 'medium',
      message: `${pendingEmails.length} emails en attente d'envoi`,
    });
  }

  // Envoyer les alertes
  if (issues.length > 0) {
    await sendAlert(issues);
  }
};
```

## 📞 Support et Escalade

### 1. Informations à collecter

En cas de problème, fournir ces informations :

```bash
# Version du système
npm list next react @supabase/supabase-js stripe

# Variables d'environnement (sanitisées)
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_URL: $NEXT_PUBLIC_APP_URL"

# Logs récents
tail -n 100 /var/log/app.log

# Status des services
systemctl status nginx
systemctl status postgresql
```

### 2. Script de diagnostic complet

```typescript
// scripts/full-diagnostic.ts
export const runFullDiagnostic = async () => {
  console.log('🔍 Running full system diagnostic...\n');

  const results = {
    timestamp: new Date().toISOString(),
    system: await getSystemInfo(),
    database: await diagnoseDatabase(),
    stripe: await diagnoseStripe(),
    email: await diagnoseEmail(),
    performance: await diagnosePerformance(),
  };

  console.log('Diagnostic results:', JSON.stringify(results, null, 2));

  // Sauvegarder les résultats
  await saveDiagnosticResults(results);

  return results;
};
```

---

**Fin du guide de dépannage** 🎉

Pour plus d'aide, consulter les autres sections du tutoriel ou contacter le support technique.
# 📡 Documentation API Complète

> **Référence complète des endpoints API du système de gestion des tickets**

## 📋 Table des Matières

1. [Authentification](#️-authentification)
2. [Événements](#️-événements)
3. [Types de tickets](#️-types-de-tickets)
4. [Commandes et paiements](#️-commandes-et-paiements)
5. [Participants](#️-participants)
6. [Check-in et QR codes](#️-check-in-et-qr-codes)
7. [Tickets et templates](#️-tickets-et-templates)
8. [Emails](#️-emails)
9. [Analytics](#️-analytics)

## 🔐 Authentification

### Base URL
```
Production : https://votredomaine.com/api
Development : http://localhost:3000/api
```

### En-têtes requis

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Obtenir le token JWT

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@votredomaine.com",
  "password": "votre_mot_de_passe"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "admin@votredomaine.com",
      "role": "admin"
    }
  }
}
```

## 🎪 Événements

### Lister tous les événements

```http
GET /api/events?page=1&limit=10&status=published
Authorization: Bearer <token>
```

**Query Parameters :**
- `page` (number): Page actuelle (défaut: 1)
- `limit` (number): Résultats par page (défaut: 10)
- `status` (string): Filtrer par statut (brouillon|publié|archivé)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "uuid",
        "nom": "Conférence Tech 2024",
        "description": "La conférence annuelle...",
        "lieu": "Palais des Congrès, Paris",
        "date_debut": "2024-06-15T09:00:00Z",
        "date_fin": "2024-06-15T18:00:00Z",
        "statut": "publié",
        "evenement_payant": true,
        "places_disponibles": 500,
        "created_at": "2024-01-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Créer un événement

```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Nouvel Événement",
  "description": "Description de l'événement",
  "lieu": "Lieu de l'événement",
  "date_debut": "2024-12-01T09:00:00Z",
  "date_fin": "2024-12-01T18:00:00Z",
  "places_disponibles": 100,
  "evenement_payant": true,
  "prix": 99.99,
  "type_evenement": "conférence",
  "organisateur": "Nom de l'organisateur",
  "email_contact": "contact@votredomaine.com",
  "telephone_contact": "+33123456789"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "nom": "Nouvel Événement",
    "statut": "brouillon",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

### Mettre à jour un événement

```http
PUT /api/events/[eventId]
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Nom modifié",
  "statut": "publié"
}
```

### Supprimer un événement

```http
DELETE /api/events/[eventId]
Authorization: Bearer <token>
```

## 🎟️ Types de Tickets

### Lister les types de tickets d'un événement

```http
GET /api/events/[eventId]/ticket-types
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "evenement_id": "event-uuid",
      "nom": "Early Bird",
      "description": "Tarif réduit early bird",
      "prix": 49.99,
      "type_tarif": "early",
      "date_debut_vente": "2024-01-01",
      "date_fin_vente": "2024-03-31",
      "quota_total": 50,
      "billets_vendus": 25,
      "visible": true,
      "stock_restant": 25
    }
  ]
}
```

### Créer un type de ticket

```http
POST /api/events/[eventId]/ticket-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "VIP",
  "description": "Accès VIP avec avantages exclusifs",
  "prix": 149.99,
  "type_tarif": "vip",
  "date_debut_vente": "2024-01-01",
  "date_fin_vente": "2024-06-14",
  "quota_total": 50,
  "visible": true
}
```

### Mettre à jour un type de ticket

```http
PUT /api/ticket-types/[ticketTypeId]
Authorization: Bearer <token>
Content-Type: application/json

{
  "prix": 129.99,
  "quota_total": 75
}
```

### Supprimer un type de ticket

```http
DELETE /api/ticket-types/[ticketTypeId]
Authorization: Bearer <token>
```

## 🛒 Commandes et Paiements

### Créer une commande

```http
POST /api/orders
Content-Type: application/json

{
  "evenement_id": "event-uuid",
  "items": [
    {
      "ticket_type_id": "ticket-uuid",
      "quantite": 2,
      "participants": [
        {
          "nom": "Dupont",
          "prenom": "Jean",
          "email": "jean.dupont@email.com",
          "telephone": "0612345678"
        },
        {
          "nom": "Martin",
          "prenom": "Sophie",
          "email": "sophie.martin@email.com",
          "telephone": "0623456789"
        }
      ]
    }
  ],
  "acheteur_email": "jean.dupont@email.com",
  "acheteur_nom": "Jean Dupont"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "order_id": "order-uuid",
    "order_number": "EVNT-2024-00001",
    "montant_total": 299.98,
    "payment_intent_id": "pi_1234567890",
    "client_secret": "pi_1234567890_secret_xxx"
  }
}
```

### Confirmer le paiement (Stripe)

```http
POST /api/payments/confirm
Content-Type: application/json

{
  "payment_intent_id": "pi_1234567890",
  "payment_method_id": "pm_1234567890"
}
```

### Webhook Stripe

```http
POST /api/payments/stripe
Content-Type: application/json
Stripe-Signature: <signature>

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "metadata": {
        "order_id": "order-uuid"
      },
      "amount": 29998,
      "currency": "eur",
      "status": "succeeded"
    }
  }
}
```

### Obtenir les détails d'une commande

```http
GET /api/orders/[orderId]
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "order_number": "EVNT-2024-00001",
    "evenement_id": "event-uuid",
    "acheteur_email": "jean.dupont@email.com",
    "acheteur_nom": "Jean Dupont",
    "montant_total": 299.98,
    "statut": "paid",
    "items": [
      {
        "ticket_type_nom": "VIP",
        "quantite": 2,
        "prix_unitaire": 149.99,
        "participants": [
          {
            "id": 123,
            "nom": "Dupont",
            "prenom": "Jean",
            "email": "jean.dupont@email.com"
          }
        ]
      }
    ],
    "payments": [
      {
        "stripe_payment_intent_id": "pi_1234567890",
        "montant": 299.98,
        "statut": "succeeded",
        "created_at": "2024-01-15T14:30:00Z"
      }
    ],
    "created_at": "2024-01-15T14:25:00Z"
  }
}
```

## 👥 Participants

### Lister les participants d'un événement

```http
GET /api/events/[eventId]/participants?page=1&limit=10&checked_in=false
Authorization: Bearer <token>
```

**Query Parameters :**
- `checked_in` (boolean): Filtrer par statut de check-in
- `ticket_type` (string): Filtrer par type de ticket
- `search` (string): Recherche par nom ou email

**Réponse :**
```json
{
  "success": true,
  "data": {
    "participants": [
      {
        "id": 123,
        "evenement_id": "event-uuid",
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean.dupont@email.com",
        "telephone": "0612345678",
        "checked_in": false,
        "checked_in_at": null,
        "ticket_sent": true,
        "ticket_sent_at": "2024-01-15T15:00:00Z",
        "ticket_type": {
          "id": "ticket-uuid",
          "nom": "VIP",
          "prix": 149.99
        },
        "qr_token": "ABC123DEF456...",
        "created_at": "2024-01-15T14:30:00Z"
      }
    ],
    "stats": {
      "total": 150,
      "checked_in": 45,
      "pending": 105,
      "checkin_rate": 30.0
    }
  }
}
```

### Ajouter un participant manuellement

```http
POST /api/events/[eventId]/participants
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Durand",
  "prenom": "Marie",
  "email": "marie.durand@email.com",
  "telephone": "0634567890",
  "ticket_type_id": "ticket-uuid",
  "notes": "Invité spécial"
}
```

### Importer des participants en masse

```http
POST /api/events/[eventId]/participants/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: participants.csv
```

**Format CSV :**
```csv
nom,prenom,email,telephone,profession,ticket_type
Durand,Marie,marie@email.com,0634567890,Directrice,VIP
```

### Supprimer un participant

```http
DELETE /api/participants/[participantId]
Authorization: Bearer <token>
```

## 🔍 Check-in et QR Codes

### Vérifier un QR code

```http
POST /api/verify-qr/[token]
Content-Type: application/json

{
  "session_id": 123
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "participant": {
      "id": 123,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@email.com",
      "ticket_type": "VIP"
    },
    "event": {
      "id": "event-uuid",
      "nom": "Conférence Tech 2024"
    },
    "already_checked_in": false,
    "session_name": "Keynote"
  }
}
```

### Effectuer un check-in

```http
POST /api/checkin
Content-Type: application/json

{
  "qr_token": "ABC123DEF456...",
  "session_id": 123,
  "checked_by": "Alice Staff",
  "device_info": {
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.100"
  },
  "notes": "Entrée VIP"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "checkin_id": 456,
    "participant": {
      "id": 123,
      "nom": "Dupont",
      "prenom": "Jean"
    },
    "checked_in_at": "2024-06-15T09:15:00Z",
    "message": "Check-in réussi"
  }
}
```

### Lister les check-ins

```http
GET /api/events/[eventId]/checkins?session_id=123&date=2024-06-15
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "participant_id": 123,
      "session_id": 123,
      "checked_in_at": "2024-06-15T09:15:00Z",
      "checked_by": "Alice Staff",
      "qr_token": "ABC123DEF456...",
      "participant": {
        "nom": "Dupont",
        "prenom": "Jean",
        "email": "jean.dupont@email.com"
      },
      "session": {
        "titre": "Keynote Opening",
        "heure_debut": "09:00:00"
      }
    }
  ],
  "stats": {
    "total_checkins": 45,
    "unique_participants": 43,
    "average_checkin_time": "09:12"
  }
}
```

## 🎫 Tickets et Templates

### Générer un ticket PDF

```http
POST /api/tickets/generate-pdf
Content-Type: application/json

{
  "participant_id": 123,
  "template_id": 1,
  "format": "a4"
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "pdf_url": "https://cdn.votredomaine.com/tickets/ticket_123.pdf",
    "expires_at": "2024-06-16T09:00:00Z"
  }
}
```

### Obtenir un ticket existant

```http
GET /api/tickets/[participantId]
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "participant": {
      "id": 123,
      "nom": "Dupont",
      "prenom": "Jean",
      "email": "jean.dupont@email.com"
    },
    "event": {
      "nom": "Conférence Tech 2024",
      "date_debut": "2024-06-15T09:00:00Z",
      "lieu": "Palais des Congrès, Paris"
    },
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "ticket_url": "https://votredomaine.com/ticket/123",
    "ticket_type": "VIP",
    "order_number": "EVNT-2024-00001"
  }
}
```

### Lister les templates de tickets

```http
GET /api/events/[eventId]/ticket-templates
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "template_type": "a4",
      "orientation": "portrait",
      "schema": {
        "zones": [...]
      },
      "preview_image": "https://cdn.votredomaine.com/previews/template1.png",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### Créer un template de ticket

```http
POST /api/events/[eventId]/ticket-templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "template_type": "a4",
  "orientation": "portrait",
  "schema": {
    "zones": [
      {
        "type": "text",
        "x": 20,
        "y": 20,
        "content": "{{event_name}}",
        "fontSize": 24,
        "color": "#1f2937"
      },
      {
        "type": "qr",
        "x": 400,
        "y": 100,
        "size": 120,
        "content": "{{ticket_url}}"
      }
    ]
  }
}
```

## 📧 Emails

### Envoyer un ticket par email

```http
POST /api/emails/send-ticket
Content-Type: application/json

{
  "participant_id": 123,
  "template_id": 1,
  "force_send": false
}
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "email_id": "email_123456",
    "sent_at": "2024-01-15T15:30:00Z",
    "recipient": "jean.dupont@email.com"
  }
}
```

### Envoyer en masse des tickets

```http
POST /api/events/[eventId]/emails/send-tickets-batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "participant_ids": [123, 124, 125],
  "template_id": 1,
  "only_unsent": true
}
```

### Lister les templates email

```http
GET /api/events/[eventId]/email-templates
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "subject": "Votre billet pour {{event_name}}",
      "html_content": "<html>...</html>",
      "template_type": "confirmation",
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

## 📊 Analytics

### Statistiques générales d'un événement

```http
GET /api/events/[eventId]/stats
Authorization: Bearer <token>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_inscriptions": 245,
      "total_revenue": 18543.50,
      "checkins_count": 198,
      "checkin_rate": 80.8
    },
    "tickets_by_type": [
      {
        "type": "Early Bird",
        "sold": 50,
        "revenue": 2499.50
      },
      {
        "type": "Standard",
        "sold": 150,
        "revenue": 11998.50
      },
      {
        "type": "VIP",
        "sold": 45,
        "revenue": 6749.55
      }
    ],
    "inscriptions_timeline": [
      {
        "date": "2024-01-15",
        "count": 15
      },
      {
        "date": "2024-01-16",
        "count": 23
      }
    ],
    "checkins_by_session": [
      {
        "session_id": 123,
        "session_name": "Keynote",
        "checkins": 198
      }
    ]
  }
}
```

### Exporter les données

```http
GET /api/events/[eventId]/export?format=excel&type=participants
Authorization: Bearer <token>
```

**Query Parameters :**
- `format` (string): excel|csv|json
- `type` (string): participants|payments|checkins|all
- `date_from` (string): Date de début (YYYY-MM-DD)
- `date_to` (string): Date de fin (YYYY-MM-DD)

**Réponse :**
```json
{
  "success": true,
  "data": {
    "download_url": "https://cdn.votredomaine.com/exports/event_123_participants.xlsx",
    "expires_at": "2024-01-16T10:00:00Z",
    "file_size": 2048576
  }
}
```

## ❌ Gestion des Erreurs

### Format des erreurs

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": {
      "field": "email",
      "reason": "Format d'email invalide"
    }
  }
}
```

### Codes d'erreur courants

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Données invalides | 400 |
| `UNAUTHORIZED` | Non authentifié | 401 |
| `FORBIDDEN` | Permissions insuffisantes | 403 |
| `NOT_FOUND` | Ressource non trouvée | 404 |
| `CONFLICT` | Conflit de données | 409 |
| `PAYMENT_ERROR` | Erreur de paiement | 402 |
| `RATE_LIMIT` | Trop de requêtes | 429 |
| `INTERNAL_ERROR` | Erreur serveur | 500 |

## 🔄 Limites de Rate Limiting

| Endpoint | Limite | Période |
|----------|-------|---------|
| `POST /api/orders` | 10 req | 1 minute |
| `POST /api/checkin` | 100 req | 1 minute |
| `GET /api/events/*` | 1000 req | 1 heure |
| `POST /api/emails/*` | 50 req | 1 heure |

---

**Prochaine étape** : [Configuration Stripe](05-stripe-setup.md) →
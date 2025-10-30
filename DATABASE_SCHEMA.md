# Database Schema - Event Admin Application

Complete Supabase database schema documentation for the event-admin application.

---

## Table of Contents

1. [Core Tables](#core-tables)
2. [Database Views](#database-views)
3. [Relationships](#relationships)
4. [Constraints & Policies](#constraints--policies)

---

## Core Tables

### 1. inscription_evenements

**Purpose:** Event management and configuration

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `nom` | TEXT | NO | - | Event name |
| `description` | TEXT | YES | - | Event description |
| `lieu` | TEXT | YES | - | Event location/venue |
| `date_debut` | TIMESTAMPTZ | NO | - | Event start date and time |
| `date_fin` | TIMESTAMPTZ | YES | - | Event end date and time |
| `prix` | NUMERIC | YES | - | Event price |
| `places_disponibles` | INTEGER | YES | - | Available seats/capacity |
| `organisateur` | TEXT | YES | - | Organizer name |
| `email_contact` | TEXT | YES | - | Contact email |
| `telephone_contact` | TEXT | YES | - | Contact phone |
| `logo_url` | TEXT | YES | - | Event logo URL |
| `statut` | TEXT | YES | `'brouillon'` | Event status (brouillon, publié, archivé) |
| `type_evenement` | TEXT | YES | - | Event type (conférence, atelier, webinar, autre) |
| `code_acces` | TEXT | YES | - | Access code for restricted events |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Index on `statut` for filtering
- Index on `date_debut` for date-based queries

---

### 2. inscription_participants

**Purpose:** Participant/attendee records with personal and professional information

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | - | Primary key |
| `evenement_id` | UUID | NO | - | Foreign key to inscription_evenements |
| `nom` | TEXT | NO | - | Last name |
| `prenom` | TEXT | NO | - | First name |
| `email` | TEXT | NO | - | Email address |
| `telephone` | TEXT | NO | - | Phone number |
| `profession` | TEXT | YES | - | Profession/occupation |
| `site_web` | TEXT | YES | - | Website URL |
| `date_naissance` | DATE | YES | - | Birth date |
| `url_linkedin` | TEXT | YES | - | LinkedIn profile URL |
| `url_facebook` | TEXT | YES | - | Facebook profile URL |
| `url_twitter` | TEXT | YES | - | Twitter/X profile URL |
| `url_instagram` | TEXT | YES | - | Instagram profile URL |
| `checked_in` | BOOLEAN | YES | `false` | Check-in status |
| `checked_in_at` | TIMESTAMPTZ | YES | - | Check-in timestamp |
| `token_landing_page` | TEXT | YES | - | Unique token for personalized landing pages |
| `ticket_sent` | BOOLEAN | YES | `false` | Ticket email sent status |
| `ticket_sent_at` | TIMESTAMPTZ | YES | - | Ticket email sent timestamp |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Registration timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `evenement_id`
- Unique index on `email` + `evenement_id` (prevents duplicate registrations)
- Index on `token_landing_page` for landing page lookups

---

### 3. inscription_sessions

**Purpose:** Event sessions, workshops, and agenda items

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | - | Primary key |
| `evenement_id` | UUID | NO | - | Foreign key to inscription_evenements |
| `titre` | TEXT | NO | - | Session title |
| `description` | TEXT | YES | - | Session description |
| `date` | DATE | NO | - | Session date |
| `heure_debut` | TIME | NO | - | Start time |
| `heure_fin` | TIME | NO | - | End time |
| `intervenant` | TEXT | YES | - | Speaker/presenter name |
| `lieu` | TEXT | YES | - | Session location |
| `type` | TEXT | YES | - | Session type (conference, atelier, panel, etc.) |
| `max_participants` | INTEGER | YES | `NULL` | Maximum participant capacity (NULL = unlimited) |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `evenement_id`
- Composite index on `evenement_id` + `date` for event schedule queries

---

### 4. inscription_session_participants

**Purpose:** Many-to-many relationship between sessions and participants (enrollment tracking)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | - | Primary key |
| `session_id` | INTEGER | NO | - | Foreign key to inscription_sessions |
| `participant_id` | INTEGER | NO | - | Foreign key to inscription_participants |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Enrollment timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `session_id`
- Foreign key index on `participant_id`
- **Unique constraint** on `(session_id, participant_id)` - prevents duplicate enrollments

---

### 5. inscription_checkins

**Purpose:** Check-in records for tracking participant attendance at sessions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | - | Primary key |
| `participant_id` | INTEGER | NO | - | Foreign key to inscription_participants |
| `evenement_id` | INTEGER | NO | - | Foreign key to inscription_evenements |
| `session_id` | INTEGER | NO | - | Foreign key to inscription_sessions |
| `checked_in_at` | TIMESTAMPTZ | NO | `NOW()` | Check-in timestamp |
| `checked_by` | TEXT | YES | - | Name/ID of person who performed check-in |
| `qr_token` | TEXT | YES | - | QR token used for check-in |
| `device_info` | JSONB | YES | - | Device information (browser, OS, etc.) |
| `notes` | TEXT | YES | - | Optional notes about the check-in |

**Indexes:**
- Primary key on `id`
- Foreign key index on `participant_id`
- Foreign key index on `session_id`
- Foreign key index on `evenement_id`
- **Unique constraint** on `(participant_id, session_id)` - one check-in per participant per session
- Index on `checked_in_at` for time-based queries

---

### 6. inscription_participant_qr_tokens

**Purpose:** QR code tokens for participant tickets (one per participant per event)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | - | Primary key |
| `participant_id` | INTEGER | NO | - | Foreign key to inscription_participants |
| `evenement_id` | INTEGER | NO | - | Foreign key to inscription_evenements |
| `qr_token` | TEXT | NO | - | Unique QR token (32 character string) |
| `ticket_url` | TEXT | YES | - | Full URL to ticket page |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `expires_at` | TIMESTAMPTZ | YES | - | Token expiration date |
| `is_active` | BOOLEAN | YES | `true` | Token active status |

**Indexes:**
- Primary key on `id`
- **Unique index** on `qr_token` - global uniqueness
- **Unique constraint** on `(participant_id, evenement_id)` - one token per participant per event
- Foreign key index on `participant_id`

---

### 7. landing_page_configs

**Purpose:** Landing page template configurations per event

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `event_id` | UUID | NO | - | Foreign key to inscription_evenements |
| `template_id` | TEXT | NO | - | Template identifier (e.g., 'modern-gradient') |
| `customization` | JSONB | NO | `'{}'` | JSON object with customization settings |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update timestamp |

**Indexes:**
- Primary key on `id`
- **Unique index** on `event_id` - one configuration per event

**Customization JSON Structure:**
```json
{
  "primaryColor": "#3B82F6",
  "secondaryColor": "#1F2937",
  "accentColor": "#F59E0B",
  "backgroundColor": "#FFFFFF",
  "heroTitle": "Welcome to Our Event",
  "heroSubtitle": "Join us for an unforgettable experience",
  "heroImage": "https://example.com/hero.jpg",
  "ctaButtonText": "Register Now",
  "logoUrl": "https://example.com/logo.png",
  "backgroundImage": "https://example.com/bg.jpg",
  "customCSS": ".custom-class { color: red; }"
}
```

**Available Templates:**
- `modern-gradient` - Modern design with gradient backgrounds
- `glassmorphism` - Glass-effect design
- `classic-business` - Traditional professional layout
- `minimal-clean` - Minimalist design
- `conference-pro` - Conference-focused layout
- `creative-event` - Creative/artistic design
- `neomorphism` - Soft UI design
- `parallax-3d` - 3D parallax effects
- `onepage-scroll` - Single-page scroll layout
- `fullscreen-video` - Video background design

---

### 8. landing_page_visits

**Purpose:** Analytics tracking for landing page visits and conversions

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `participant_id` | INTEGER | YES | - | Foreign key to inscription_participants (if personalized) |
| `event_id` | UUID | NO | - | Foreign key to inscription_evenements |
| `token` | TEXT | YES | - | Landing page token used (if personalized visit) |
| `visited_at` | TIMESTAMPTZ | NO | `NOW()` | Visit timestamp |
| `ip_address` | TEXT | YES | - | Visitor IP address |
| `user_agent` | TEXT | YES | - | Browser user agent string |
| `referrer` | TEXT | YES | - | Referrer URL |
| `converted` | BOOLEAN | YES | `false` | Whether visit resulted in registration |
| `conversion_at` | TIMESTAMPTZ | YES | - | Conversion timestamp |

**Indexes:**
- Primary key on `id`
- Foreign key index on `event_id`
- Foreign key index on `participant_id`
- Index on `token` for personalized visit lookups
- Index on `visited_at` for time-based analytics

---

### 9. inscription_email_templates

**Purpose:** Custom email templates for landing page invitations per event

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | - | Primary key |
| `evenement_id` | UUID | NO | - | Foreign key to inscription_evenements |
| `subject` | TEXT | NO | - | Email subject with template variables |
| `html_content` | TEXT | NO | - | HTML email content with template variables |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update timestamp |

**Indexes:**
- Primary key on `id`
- **Unique index** on `evenement_id` - one template per event

**Template Variables:**
- `{{event_name}}` - Event name
- `{{event_date}}` - Event start date
- `{{event_location}}` - Event location
- `{{participant_firstname}}` - Participant first name
- `{{participant_lastname}}` - Participant last name
- `{{participant_email}}` - Participant email
- `{{landing_url}}` - Personalized landing page URL
- `{{registration_date}}` - Registration date

---

### 10. inscription_ticket_templates

**Purpose:** Custom ticket email templates per event

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | - | Primary key |
| `evenement_id` | UUID | NO | - | Foreign key to inscription_evenements |
| `subject` | TEXT | NO | - | Ticket email subject with template variables |
| `html_content` | TEXT | NO | - | HTML ticket content with template variables |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `NOW()` | Last update timestamp |

**Indexes:**
- Primary key on `id`
- **Unique index** on `evenement_id` - one template per event

**Template Variables:**
- `{{event_name}}` - Event name
- `{{event_date}}` - Event start date
- `{{event_location}}` - Event location
- `{{event_description}}` - Event description
- `{{participant_firstname}}` - Participant first name
- `{{participant_lastname}}` - Participant last name
- `{{participant_email}}` - Participant email
- `{{participant_phone}}` - Participant phone
- `{{participant_profession}}` - Participant profession
- `{{participant_sessions}}` - HTML list of enrolled sessions
- `{{qr_code}}` - QR code image (base64 or URL)
- `{{ticket_url}}` - URL to online ticket page
- `{{registration_date}}` - Registration date

---

### 11. inscription_inscriptions

**Purpose:** Legacy registration table (limited usage)

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | SERIAL | NO | - | Primary key |
| `evenement_id` | UUID | NO | - | Foreign key to inscription_evenements |
| *(Additional columns not fully documented)* | - | - | - | - |

**Note:** This table appears in confirmation pages (`/inscription/[evenementId]/confirmation`) but is not heavily used in the main application flow. Most functionality uses `inscription_participants` instead.

---

## Database Views

### inscription_checkins_details

**Purpose:** Consolidated view of check-in data with participant, event, and session details

This view joins multiple tables to provide a complete picture of each check-in:

**Source Tables:**
- `inscription_checkins`
- `inscription_participants`
- `inscription_evenements`
- `inscription_sessions`
- `inscription_participant_qr_tokens`

**Available Columns:**

**Check-in Information:**
- `checkin_id` - Check-in record ID
- `checked_in_at` - Check-in timestamp
- `checked_by` - Person who performed check-in
- `notes` - Check-in notes
- `device_info` - Device information (JSONB)

**Participant Information:**
- `participant_id` - Participant ID
- `prenom` - First name
- `nom` - Last name
- `email` - Email address
- `telephone` - Phone number
- `profession` - Profession

**Event Information:**
- `evenement_id` - Event ID
- `evenement_nom` - Event name
- `evenement_date` - Event start date

**Session Information:**
- `session_id` - Session ID
- `session_titre` - Session title
- `session_date` - Session date
- `heure_debut` - Session start time
- `heure_fin` - Session end time
- `session_lieu` - Session location
- `intervenant` - Speaker/presenter name

**QR Token Information:**
- `qr_token` - QR token used for check-in
- `ticket_url` - URL to ticket page

**Usage Example:**
```sql
SELECT * FROM inscription_checkins_details
WHERE evenement_id = 'event-uuid-here'
ORDER BY checked_in_at DESC;
```

---

## Relationships

### Entity Relationship Diagram

```
inscription_evenements (1) ----< (N) inscription_participants
       |                                    |
       |                                    |
       |                                    +----< inscription_participant_qr_tokens
       |                                    |
       |                                    +----< landing_page_visits
       |
       +----< inscription_sessions
       |            |
       |            +----< inscription_session_participants >---- inscription_participants
       |            |
       |            +----< inscription_checkins >---- inscription_participants
       |
       +---- landing_page_configs (1:1)
       |
       +---- inscription_email_templates (1:1)
       |
       +---- inscription_ticket_templates (1:1)
```

### Relationship Details

**Event Relationships:**
- **Event → Sessions:** One-to-Many
  - `inscription_evenements.id` → `inscription_sessions.evenement_id`
  - One event can have multiple sessions/agenda items

- **Event → Participants:** One-to-Many
  - `inscription_evenements.id` → `inscription_participants.evenement_id`
  - One event can have multiple registered participants

- **Event → Landing Page Config:** One-to-One
  - `inscription_evenements.id` → `landing_page_configs.event_id`
  - Each event has exactly one landing page configuration

- **Event → Email Template:** One-to-One
  - `inscription_evenements.id` → `inscription_email_templates.evenement_id`
  - Each event has exactly one custom email template (optional)

- **Event → Ticket Template:** One-to-One
  - `inscription_evenements.id` → `inscription_ticket_templates.evenement_id`
  - Each event has exactly one custom ticket template (optional)

**Participant Relationships:**
- **Participant → QR Token:** One-to-One per event
  - `inscription_participants.id` → `inscription_participant_qr_tokens.participant_id`
  - Each participant has one QR token per event

- **Participant → Check-ins:** One-to-Many
  - `inscription_participants.id` → `inscription_checkins.participant_id`
  - One participant can have multiple check-ins (one per session)

- **Participant → Landing Page Visits:** One-to-Many
  - `inscription_participants.id` → `landing_page_visits.participant_id`
  - Tracks all visits by participant to personalized landing pages

**Session Relationships:**
- **Session ↔ Participants:** Many-to-Many
  - Via `inscription_session_participants` junction table
  - `inscription_sessions.id` ↔ `inscription_session_participants.session_id`
  - `inscription_participants.id` ↔ `inscription_session_participants.participant_id`
  - One session can have many participants, one participant can enroll in many sessions

- **Session → Check-ins:** One-to-Many
  - `inscription_sessions.id` → `inscription_checkins.session_id`
  - Each session can have multiple check-in records

---

## Constraints & Policies

### Primary Keys
- **UUID Primary Keys:** `inscription_evenements`, `landing_page_configs`, `landing_page_visits`
- **SERIAL Primary Keys:** All other tables (`inscription_participants`, `inscription_sessions`, etc.)

### Unique Constraints

**inscription_participants:**
- `(email, evenement_id)` - Prevents duplicate registrations for same event

**inscription_session_participants:**
- `(session_id, participant_id)` - Prevents duplicate enrollments

**inscription_checkins:**
- `(participant_id, session_id)` - One check-in per participant per session

**inscription_participant_qr_tokens:**
- `qr_token` - Globally unique QR tokens
- `(participant_id, evenement_id)` - One token per participant per event

**landing_page_configs:**
- `event_id` - One configuration per event

**inscription_email_templates:**
- `evenement_id` - One email template per event

**inscription_ticket_templates:**
- `evenement_id` - One ticket template per event

### Foreign Key Constraints

All foreign keys are configured with **ON DELETE CASCADE** to maintain referential integrity:

- Deleting an event deletes all related participants, sessions, configs, and templates
- Deleting a participant deletes their QR tokens, check-ins, and session enrollments
- Deleting a session deletes all enrollments and check-ins for that session

### Row Level Security (RLS)

**Enabled on all tables** with the following policies:

**Public Access (Anon Key):**
- `inscription_evenements` - Read access to published events
- `inscription_participants` - Insert for public registration
- `inscription_sessions` - Read access for event schedules
- `landing_page_configs` - Read access for rendering landing pages

**Authenticated Access:**
- Full CRUD access to all tables for authenticated users
- Used in admin dashboard and management interfaces

**Special Policies:**
- QR token validation allows public read with valid token
- Check-in API allows public write with valid QR token
- Landing page visit tracking allows anonymous writes

### Indexes

**Performance Indexes:**
- Foreign key columns (automatic in PostgreSQL)
- `inscription_participants.token_landing_page` - Landing page lookups
- `inscription_participants.email` - Email-based queries
- `inscription_checkins.checked_in_at` - Time-based reporting
- `landing_page_visits.visited_at` - Analytics queries
- Composite: `(evenement_id, date)` on sessions - Event schedule queries

**Full-Text Search:**
- Consider adding GIN indexes on text columns for search functionality
- Example: `CREATE INDEX idx_participants_search ON inscription_participants USING GIN (to_tsvector('french', nom || ' ' || prenom || ' ' || email));`

---

## Database Triggers

### Automatic Timestamp Updates

**updated_at Trigger:**
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Applied to:
-- - landing_page_configs
-- - inscription_email_templates
-- - inscription_ticket_templates
```

### Token Generation

**QR Token Generation:**
- Automatically generates 32-character alphanumeric token on insert
- Ensures uniqueness before insertion

**Landing Page Token Generation:**
- Generates unique token for `inscription_participants.token_landing_page`
- Triggered on participant creation

---

## Data Types Reference

**Common Types Used:**
- `UUID` - Universally unique identifiers (events, configs)
- `SERIAL` - Auto-incrementing integers (participants, sessions)
- `TEXT` - Variable-length strings (names, descriptions, URLs)
- `TIMESTAMPTZ` - Timestamps with timezone
- `DATE` - Date only (birth dates, session dates)
- `TIME` - Time only (session times)
- `BOOLEAN` - True/false flags (checked_in, is_active, etc.)
- `NUMERIC` - Decimal numbers (prices)
- `INTEGER` - Whole numbers (capacities, IDs)
- `JSONB` - JSON data with indexing support (customization, device_info)

---

## Migration Scripts Location

SQL migration scripts are located in: `event-admin/src/sql/`

**Available Scripts:**
- `create_checkins_table.sql` - Creates inscription_checkins table
- `create_email_templates_table.sql` - Creates inscription_email_templates table
- `create_ticket_templates_table.sql` - Creates inscription_ticket_templates table
- `create_landing_page_configs.sql` - Creates landing_page_configs table
- `add_participant_tokens.sql` - Adds token_landing_page column
- `add_ticket_tracking_columns.sql` - Adds ticket_sent fields

---

## Common Queries

### Get Event with Full Details
```sql
SELECT
  e.*,
  COUNT(DISTINCT p.id) as total_participants,
  COUNT(DISTINCT s.id) as total_sessions,
  COUNT(DISTINCT c.id) as total_checkins
FROM inscription_evenements e
LEFT JOIN inscription_participants p ON e.id = p.evenement_id
LEFT JOIN inscription_sessions s ON e.id = s.evenement_id
LEFT JOIN inscription_checkins c ON e.id = c.evenement_id
WHERE e.id = 'event-uuid'
GROUP BY e.id;
```

### Get Participant with Sessions
```sql
SELECT
  p.*,
  json_agg(json_build_object(
    'id', s.id,
    'titre', s.titre,
    'date', s.date,
    'heure_debut', s.heure_debut,
    'heure_fin', s.heure_fin
  )) as sessions
FROM inscription_participants p
LEFT JOIN inscription_session_participants sp ON p.id = sp.participant_id
LEFT JOIN inscription_sessions s ON sp.session_id = s.id
WHERE p.id = 123
GROUP BY p.id;
```

### Session Attendance Stats
```sql
SELECT
  s.id,
  s.titre,
  s.max_participants,
  COUNT(sp.participant_id) as enrolled_count,
  COUNT(c.id) as checked_in_count,
  CASE
    WHEN s.max_participants IS NOT NULL
    THEN (COUNT(sp.participant_id)::float / s.max_participants * 100)
    ELSE NULL
  END as capacity_percentage
FROM inscription_sessions s
LEFT JOIN inscription_session_participants sp ON s.id = sp.session_id
LEFT JOIN inscription_checkins c ON s.id = c.session_id
WHERE s.evenement_id = 'event-uuid'
GROUP BY s.id, s.titre, s.max_participants;
```

### Landing Page Conversion Rate
```sql
SELECT
  e.nom as event_name,
  COUNT(v.id) as total_visits,
  COUNT(CASE WHEN v.converted = true THEN 1 END) as conversions,
  ROUND(
    COUNT(CASE WHEN v.converted = true THEN 1 END)::numeric /
    NULLIF(COUNT(v.id), 0) * 100,
    2
  ) as conversion_rate
FROM inscription_evenements e
LEFT JOIN landing_page_visits v ON e.id = v.event_id
WHERE e.id = 'event-uuid'
GROUP BY e.id, e.nom;
```

---

**Last Updated:** 2025-10-02
**Database Version:** PostgreSQL 15+ (Supabase)
**Application:** Event-Admin (Next.js 15)

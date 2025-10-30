# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a **monorepo** containing two Next.js applications:

1. **event-admin/** - Full-featured event management platform (primary application)
2. **event-website/** - Marketing landing page for the platform

**Additional directories:**
- `cloudflare-worker/` - Cloudflare Worker for proxy services
- `src/` - Shared source code
- `sql/` - Database migration scripts
- `supabase/` - Supabase configuration
- `vercel-proxy/` - Vercel proxy configuration
- `database/` - Database schema and migration files

## Core Technologies

- **Next.js 14/15** with App Router and React Server Components
  - event-admin uses Next.js 14.2.24
  - event-website uses Next.js 15.5.4
- **Supabase** for authentication, database, and real-time features
- **Craft.js** for drag-and-drop page builder functionality
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **React Hook Form + Zod** for form validation

## Development Commands

### event-admin
```bash
cd event-admin
npm run dev           # Start development server
npm run build         # Production build (with --no-lint)
npm run start         # Start production server
npm run lint          # Run ESLint
npm run clean         # Clean Next.js cache
npm run dev:clean     # Clean cache and start dev server
npm run build:clean   # Clean cache and build
npm run check         # TypeScript check + ESLint
npm run preview       # Build and start production server
npm run predeploy     # Check, build and preview for deployment
```

### event-website
```bash
cd event-website
npm run dev           # Start development server
npm run build         # Production build
npm run start         # Start production server
npm run lint          # Run ESLint
```

### Additional Scripts
- `event-admin/scripts/clean-cache.js` - Custom Next.js cache cleaning script
- Use `npm run check` before commits to ensure type safety and code quality

## Architecture Overview

### Next.js Configuration

**event-admin/next.config.js:**
- `reactStrictMode: true`
- TypeScript errors ignored in production builds (`ignoreBuildErrors: true`)
- Image optimization configured for external domains (Google Charts, placeholder images, UploadThing)

**Middleware** (`src/middleware.ts`):
- Protected routes: `/dashboard/*`, `/admin/*`, `/landing/*`, `/scanner/*`, `/qr-scanner/*`
- Builder routes handle their own auth (skip middleware auth for `/admin/builder`)
- Uses `@supabase/ssr` for session management
- Passes pathname via `x-pathname` header to layouts
- Handles authentication redirects for protected routes

### Supabase Client Patterns

**Three distinct Supabase client implementations:**

1. **Client Components** (`src/lib/supabase/client.ts`):
   - Uses `createClientComponentClient` from `@supabase/auth-helpers-nextjs`
   - Singleton pattern to avoid multiple GoTrueClient instances
   - Import: `import { supabaseBrowser } from '@/lib/supabase/client'`

2. **Server Components/Server Actions** (`src/lib/supabase/server.ts`):
   - Uses `createServerClient` from `@supabase/ssr`
   - Function: `supabaseServer()` with Next.js cookies handling
   - Auth config: cookie-based session management

3. **API Routes** (`src/lib/supabase/server.ts`):
   - Function: `supabaseApi()` with explicit environment variable validation
   - Falls back to anon key if service role key not available
   - Enhanced error handling and logging for API contexts

**Always use the appropriate client for your context** - mixing them causes authentication issues.

### Database Schema

#### Core Tables

**1. `inscription_evenements` - Event Management**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `nom` | TEXT | Event name |
| `description` | TEXT | Event description |
| `lieu` | TEXT | Event location/venue |
| `date_debut` | TIMESTAMPTZ | Event start date |
| `date_fin` | TIMESTAMPTZ | Event end date |
| `prix` | NUMERIC | Event price (optional) |
| `places_disponibles` | INTEGER | Available seats (optional) |
| `organisateur` | TEXT | Organizer name (optional) |
| `email_contact` | TEXT | Contact email (optional) |
| `telephone_contact` | TEXT | Contact phone (optional) |
| `logo_url` | TEXT | Event logo URL (optional) |
| `statut` | TEXT | Event status (brouillon, publié, archivé) |
| `type_evenement` | TEXT | Event type (conférence, atelier, webinar, autre) |
| `code_acces` | TEXT | Access code for restricted events (optional) |
| `evenement_payant` | BOOLEAN | Event uses paid ticketing system (default: false) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**2. `inscription_participants` - Participant/Attendee Records**
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `evenement_id` | UUID | Foreign key to inscription_evenements |
| `nom` | TEXT | Last name (required) |
| `prenom` | TEXT | First name (required) |
| `email` | TEXT | Email address (required) |
| `telephone` | TEXT | Phone number (required) |
| `profession` | TEXT | Profession/occupation (optional) |
| `site_web` | TEXT | Website URL (optional) |
| `date_naissance` | DATE | Birth date (optional) |
| `url_linkedin` | TEXT | LinkedIn profile URL (optional) |
| `url_facebook` | TEXT | Facebook profile URL (optional) |
| `url_twitter` | TEXT | Twitter/X profile URL (optional) |
| `url_instagram` | TEXT | Instagram profile URL (optional) |
| `checked_in` | BOOLEAN | Check-in status (default: false) |
| `checked_in_at` | TIMESTAMPTZ | Check-in timestamp (optional) |
| `token_landing_page` | TEXT | Unique token for personalized landing page access |
| `ticket_sent` | BOOLEAN | Indicates if ticket email was sent (default: false) |
| `ticket_sent_at` | TIMESTAMPTZ | Timestamp when ticket email was sent (optional) |
| `created_at` | TIMESTAMPTZ | Registration timestamp |

**3. `inscription_sessions` - Event Sessions/Agenda**
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `evenement_id` | UUID | Foreign key to inscription_evenements |
| `titre` | TEXT | Session title (required) |
| `description` | TEXT | Session description |
| `date` | DATE | Session date (required) |
| `heure_debut` | TIME | Start time (required) |
| `heure_fin` | TIME | End time (required) |
| `intervenant` | TEXT | Speaker/presenter name (optional) |
| `lieu` | TEXT | Session location (optional) |
| `type` | TEXT | Session type (conference, atelier, panel, etc.) |
| `max_participants` | INTEGER | Maximum participant capacity (optional, null = unlimited) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**4. `inscription_session_participants` - Session Enrollments (Many-to-Many)**
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `session_id` | INTEGER | Foreign key to inscription_sessions |
| `participant_id` | INTEGER | Foreign key to inscription_participants |
| `created_at` | TIMESTAMPTZ | Enrollment timestamp |

*Unique constraint on (session_id, participant_id) to prevent duplicates*

**5. `inscription_checkins` - Check-in Records**
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `participant_id` | INTEGER | Foreign key to inscription_participants |
| `evenement_id` | INTEGER | Foreign key to inscription_evenements |
| `session_id` | INTEGER | Foreign key to inscription_sessions |
| `checked_in_at` | TIMESTAMPTZ | Check-in timestamp (default: NOW()) |
| `checked_by` | TEXT | Name/ID of person who performed check-in |
| `qr_token` | TEXT | QR token used for check-in |
| `device_info` | JSONB | Device information (optional) |
| `notes` | TEXT | Optional notes about the check-in |

*Unique constraint on (participant_id, session_id) - one check-in per participant per session*

**6. `inscription_participant_qr_tokens` - QR Code Tokens**
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `participant_id` | INTEGER | Foreign key to inscription_participants |
| `evenement_id` | INTEGER | Foreign key to inscription_evenements |
| `qr_token` | TEXT | Unique QR token (32 characters) |
| `ticket_url` | TEXT | Full URL to ticket page |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `expires_at` | TIMESTAMPTZ | Token expiration date (optional) |
| `is_active` | BOOLEAN | Token active status (default: true) |

*Unique constraints on qr_token and (participant_id, evenement_id)*

**7. `landing_page_configs` - Landing Page Customization**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `event_id` | UUID | Foreign key to inscription_evenements |
| `template_id` | TEXT | Template identifier (e.g., 'modern-gradient', 'classic-business') |
| `customization` | JSONB | JSON object with customization settings |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

*Unique constraint on event_id (one config per event)*

Customization JSON structure:
```json
{
  "primaryColor": "#3B82F6",
  "secondaryColor": "#1F2937",
  "accentColor": "#F59E0B",
  "backgroundColor": "#FFFFFF",
  "heroTitle": "Custom title",
  "heroSubtitle": "Custom subtitle",
  "heroImage": "https://...",
  "ctaButtonText": "Register Now",
  "logoUrl": "https://...",
  "backgroundImage": "https://...",
  "customCSS": "..."
}
```

**8. `landing_page_visits` - Landing Page Analytics**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `participant_id` | INTEGER | Foreign key to inscription_participants |
| `event_id` | UUID | Foreign key to inscription_evenements |
| `token` | TEXT | Landing page token used |
| `visited_at` | TIMESTAMPTZ | Visit timestamp (default: NOW()) |
| `ip_address` | TEXT | Visitor IP address (optional) |
| `user_agent` | TEXT | Browser user agent (optional) |
| `referrer` | TEXT | Referrer URL (optional) |
| `converted` | BOOLEAN | Whether visit resulted in registration (default: false) |
| `conversion_at` | TIMESTAMPTZ | Conversion timestamp (optional) |

**9. `inscription_email_templates` - Custom Email Templates**
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `evenement_id` | UUID | Foreign key to inscription_evenements |
| `subject` | TEXT | Email subject with template variables |
| `html_content` | TEXT | HTML email content with template variables |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

*Unique constraint on evenement_id (one template per event)*

Template variables: `{{event_name}}`, `{{event_date}}`, `{{event_location}}`, `{{participant_firstname}}`, `{{participant_lastname}}`, `{{participant_email}}`, `{{landing_url}}`, `{{registration_date}}`

**10. `inscription_ticket_templates` - Ticket Email Templates**
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `evenement_id` | UUID | Foreign key to inscription_evenements |
| `subject` | TEXT | Ticket email subject with template variables |
| `html_content` | TEXT | HTML ticket content with template variables |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

*Unique constraint on evenement_id (one template per event)*

Template variables: `{{event_name}}`, `{{event_date}}`, `{{event_location}}`, `{{event_description}}`, `{{participant_firstname}}`, `{{participant_lastname}}`, `{{participant_email}}`, `{{participant_phone}}`, `{{participant_profession}}`, `{{participant_sessions}}`, `{{qr_code}}`, `{{ticket_url}}`, `{{registration_date}}`

**11. `inscription_inscriptions` - Legacy Registration Table**
| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `evenement_id` | UUID | Foreign key to inscription_evenements |

*Note: Limited usage in codebase, appears in confirmation pages*

**12. `builder_sites` - Page Builder Sites**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `org_id` | UUID | Organization ID (multi-tenant support, future) |
| `event_id` | UUID | Foreign key to inscription_evenements |
| `name` | TEXT | Site name |
| `site_slug` | TEXT | Unique site slug |
| `domain_custom` | TEXT | Custom domain (optional) |
| `theme_tokens` | JSONB | Theme customization tokens |
| `status` | TEXT | Site status (draft, published, archived) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**13. `builder_templates` - Page Builder Templates**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `org_id` | UUID | Organization ID (NULL = public template) |
| `key` | TEXT | Unique template key |
| `label` | TEXT | Template display name |
| `description` | TEXT | Template description |
| `schema` | JSONB | Craft.js page schema |
| `preview_image` | TEXT | Template preview image URL |
| `category` | TEXT | Template category |
| `version` | TEXT | Template version |
| `is_public` | BOOLEAN | Whether template is public |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `tags` | TEXT[] | Template tags array (added via migration) |

**14. `builder_pages` - Built Pages**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `site_id` | UUID | Foreign key to builder_sites |
| `template_id` | UUID | Foreign key to builder_templates |
| `name` | TEXT | Page name |
| `slug` | TEXT | Page slug (unique per site) |
| `tree` | JSONB | Craft.js page tree structure |
| `status` | TEXT | Page status (draft, published) |
| `version` | INTEGER | Page version number |
| `published_at` | TIMESTAMPTZ | Publication timestamp |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |
| `created_by` | UUID | User ID who created the page |
| `page_type` | TEXT | Page type (landing_page, registration_form) |

*Unique constraint on (site_id, slug)*

**15. `builder_page_versions` - Page Version History**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `page_id` | UUID | Foreign key to builder_pages |
| `version` | INTEGER | Version number |
| `tree` | JSONB | Page tree snapshot |
| `label` | TEXT | Optional version label |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `created_by` | UUID | User ID who created version |

*Unique constraint on (page_id, version)*

**16. `builder_blocks_library` - Reusable Block Components**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `key` | TEXT | Unique block key |
| `label` | TEXT | Block display name |
| `description` | TEXT | Block description |
| `schema` | JSONB | Block component schema |
| `props_meta` | JSONB | Block properties metadata |
| `preview_image` | TEXT | Block preview image URL |
| `category` | TEXT | Block category |
| `version` | TEXT | Block version |
| `is_custom` | BOOLEAN | Whether block is user-created |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp |

**17. `builder_domains` - Custom Domain Management**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `site_id` | UUID | Foreign key to builder_sites |
| `type` | TEXT | Domain type (subdomain, custom) |
| `host` | TEXT | Domain host (unique) |
| `dns_status` | TEXT | DNS verification status |
| `ssl_status` | TEXT | SSL certificate status |
| `is_primary` | BOOLEAN | Whether this is the primary domain |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `verified_at` | TIMESTAMPTZ | DNS verification timestamp |

#### Database Views

**`inscription_checkins_details` - Consolidated Check-in Data**

Provides comprehensive check-in information with joined participant, event, and session details:
- Check-in details: `checkin_id`, `checked_in_at`, `checked_by`, `notes`, `device_info`
- Participant details: `participant_id`, `prenom`, `nom`, `email`, `telephone`, `profession`
- Event details: `evenement_id`, `evenement_nom`, `evenement_date`
- Session details: `session_id`, `session_titre`, `session_date`, `heure_debut`, `heure_fin`, `session_lieu`, `intervenant`
- QR token: `qr_token`, `ticket_url`

Source tables: inscription_checkins, inscription_participants, inscription_evenements, inscription_sessions, inscription_participant_qr_tokens

#### Key Relationships

- **Event → Sessions:** One-to-Many (`inscription_evenements.id` → `inscription_sessions.evenement_id`)
- **Event → Participants:** One-to-Many (`inscription_evenements.id` → `inscription_participants.evenement_id`)
- **Sessions ↔ Participants:** Many-to-Many via `inscription_session_participants`
- **Participant → QR Tokens:** One-to-One per event (`inscription_participants.id` → `inscription_participant_qr_tokens.participant_id`)
- **Participant → Check-ins:** One-to-Many (`inscription_participants.id` → `inscription_checkins.participant_id`)
- **Event → Landing Page Config:** One-to-One (`inscription_evenements.id` → `landing_page_configs.event_id`)
- **Event → Email/Ticket Templates:** One-to-One (via `inscription_email_templates` and `inscription_ticket_templates`)
- **Event → Builder Sites:** One-to-One (`inscription_evenements.id` → `builder_sites.event_id`)
- **Builder Sites → Pages:** One-to-Many (`builder_sites.id` → `builder_pages.site_id`)
- **Builder Pages → Versions:** One-to-Many (`builder_pages.id` → `builder_page_versions.page_id`)
- **Builder Templates → Pages:** One-to-Many (`builder_templates.id` → `builder_pages.template_id`)

#### Billing & Payment System (New)

**18. `inscription_organizations` - Multi-tenant Organizations**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | TEXT | Organization name |
| `email` | TEXT | Organization email |
| `phone` | TEXT | Organization phone |
| `address` | TEXT | Organization address |
| `website` | TEXT | Organization website |
| `logo_url` | TEXT | Organization logo URL |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**19. `inscription_ticket_types` - Ticket Types & Pricing**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `evenement_id` | UUID | Foreign key to inscription_evenements |
| `nom` | TEXT | Ticket type name |
| `description` | TEXT | Ticket type description |
| `prix` | NUMERIC | Ticket price |
| `type_tarif` | TEXT | Pricing tier (early/regular/late) |
| `date_debut_vente` | DATE | Sales start date |
| `date_fin_vente` | DATE | Sales end date |
| `quota_total` | INTEGER | Total quota (null = unlimited) |
| `billets_vendus` | INTEGER | Tickets sold (auto-updated) |
| `visible` | BOOLEAN | Visibility (default: true) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**20. `inscription_orders` - Customer Orders**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_number` | TEXT | Unique order number |
| `evenement_id` | UUID | Foreign key to inscription_evenements |
| `acheteur_email` | TEXT | Buyer email |
| `acheteur_nom` | TEXT | Buyer name |
| `montant_total` | NUMERIC | Total order amount |
| `statut` | TEXT | Order status (pending/paid/cancelled/refunded) |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**21. `inscription_order_items` - Order Line Items**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_id` | UUID | Foreign key to inscription_orders |
| `ticket_type_id` | UUID | Foreign key to inscription_ticket_types |
| `quantite` | INTEGER | Quantity purchased |
| `prix_unitaire` | NUMERIC | Unit price at purchase time |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

**22. `inscription_payments` - Payment Records**
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_id` | UUID | Foreign key to inscription_orders |
| `stripe_payment_intent_id` | TEXT | Stripe payment intent ID |
| `montant` | NUMERIC | Payment amount |
| `statut` | TEXT | Payment status (succeeded/failed/pending) |
| `stripe_response` | JSONB | Full Stripe response |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

#### Database Constraints & Policies

- **ID Types:** Events use UUID, participants/sessions use INTEGER/SERIAL
- **RLS (Row Level Security):** Enabled on most tables with public access policies
- **Unique Constraints:**
  - One QR token per participant per event
  - One check-in per participant per session
  - One landing page config per event
  - One email/ticket template per event
  - One builder site per event
  - Unique page slug per builder site
  - Unique page version per page
  - Primary domain per builder site
- **Cascading Deletes:** Most foreign keys use ON DELETE CASCADE
- **Timestamps:** Most tables include created_at with TIMESTAMPTZ type

### Authentication & Middleware

**Middleware** (`src/middleware.ts`):
- Protected routes: `/dashboard/*`, `/admin/*`, `/landing/*`, `/scanner/*`, `/qr-scanner/*`
- Uses `@supabase/auth-helpers-nextjs` middleware client
- Passes pathname via `x-pathname` header to layouts

**No explicit role-based permissions** - authentication is binary (logged in or not).

### Landing Page System

**Dynamic landing pages per event:**
- Route: `/landing/[eventId]/[[...params]]` where optional params include personalization token
- 10 built-in templates in `src/components/landing-templates/`:
  - ModernGradientTemplate, GlassmorphismTemplate, ClassicBusinessTemplate
  - MinimalCleanTemplate, ConferenceProTemplate, CreativeEventTemplate
  - NeomorphismTemplate, Parallax3DTemplate, OnepageScrollTemplate, FullscreenVideoTemplate

**Template System:**
- Config stored in `landing_page_configs` table
- Customization options: `primaryColor`, `secondaryColor`, `heroTitle`, `heroSubtitle`, `ctaButtonText`, `logoUrl`, `backgroundImage`, `customCSS`
- Preview mode: `?preview=true&template=template-id&colors={...}`
- Personalized landing: `/landing/[eventId]/[token]` pre-fills form with participant data
- Server-side rendering with `generateMetadata()` for SEO

**Implementation:**
- Server Component fetches event + config + participant data
- `ClientLandingWrapper` renders appropriate template client-side
- `LandingRegistrationForm` handles submissions

### QR Code & Check-in System

**QR Token Flow:**
1. Generate unique `qr_token` per participant (stored in `inscription_participant_qr_tokens`)
2. QR code embedded in tickets (`/ticket/[participantId]`)
3. Scanner reads QR → calls `/api/checkin` with `qrToken` + `sessionId`
4. API validates: token active/not expired, participant enrolled in session, no duplicate check-in
5. Creates record in `inscription_checkins` table

**Check-in Endpoints:**
- `POST /api/checkin` - Perform check-in (body: `qrToken`, `sessionId`, `checkedBy`, `deviceInfo`, `notes`)
- `GET /api/checkin?eventId=X&sessionId=Y` - Retrieve check-ins with stats
- `POST /api/verify-qr/[token]` - Verify QR token validity

**Scanner Pages:**
- `/scanner`, `/qr-scanner`, `/qr-scanner-new` - Different scanner implementations
- Use `@zxing/library` for QR code reading

### Advanced Ticket System

**Custom Ticket Templates:**
- Stored in `inscription_ticket_templates` table with advanced schema
- Template types: `a4`, `thermal`, `mobile` with orientation support
- Visual template editor with drag-and-drop zones
- Zone types: `text`, `image`, `qr`, `barcode`, `shape`, `line`, `table`
- Advanced styling: fonts, colors, borders, rotation, opacity
- Template variables: event details, participant info, QR codes, barcodes
- PDF generation with Puppeteer for high-quality output
- Direct printing support with thermal printers (QZ Tray integration)

**Ticket Components:**
- `TicketTemplateWizard` - Template creation wizard
- `TicketTemplateViewer` - Template preview with real data
- `TicketPDFGenerator` - PDF generation and printing
- `TicketEditor` - Visual template editor
- `TemplateSelector` - Template selection interface

**Ticket API Endpoints:**
- `GET /api/ticket-templates` - List ticket templates
- `POST /api/tickets/generate` - Generate tickets for participants
- `POST /api/tickets/generate-pdf` - Generate PDF tickets
- `POST /api/tickets/print` - Direct ticket printing
- `GET /api/tickets/[participantId]` - Get ticket details

### Advanced Badge System

**Custom Badge Templates:**
- Stored in dedicated badge tables with comprehensive schema
- Badge types: `standard`, `vip`, `speaker`, `staff`, `visitor`
- Visual template editor with advanced layout options
- Support for gradients, backgrounds, and custom styling
- QR code integration for attendee verification
- Batch printing capabilities with multiple formats
- Security features: watermarks, serialization, holograms

**Badge Components:**
- `BadgeTemplateSelector` - Badge template selection
- `BadgeEditor` - Visual badge template editor
- `BadgePDFGenerator` - PDF generation with advanced options
- `BadgeCustomizationTab` - Badge styling interface

**Badge API Endpoints:**
- `GET /api/badge-templates` - List badge templates
- `POST /api/badges/generate-pdf` - Generate badge PDFs
- `POST /api/badges/print` - Direct badge printing
- Support for various formats: A4, Letter, credit-card, badge-size

### Email System

**Two email service integrations:**
1. **Brevo** (formerly Sendinblue) - `src/lib/email/brevo.ts`
2. **MailerSend** - via API routes

**Email Templates:**
- Fetch templates: `GET /api/brevo-templates`, `GET /api/mailersend-templates`
- Send to participant: `POST /api/send-participant-email`
- Send ticket email: `POST /api/send-ticket-email`
- Send landing page link: `POST /api/send-landing-link`

**Components:**
- `BrevoTemplateSelector`, `MailerSendTemplateSelector` - Template pickers
- `TicketEmailTemplateSelector` - Ticket-specific template selector
- `EmailTemplateEditor`, `EmailTemplatePreview` - Email creation/preview
- `ParticipantEmailManager` - Bulk email management per event
- `EmailTemplateDropdown`, `EmailTemplateSelector` - Enhanced template selection

### File Upload

**UploadThing Integration:**
- Config: `src/app/api/uploadthing/core.ts`
- Route: `src/app/api/uploadthing/route.ts`
- Utility: `src/utils/uploadthing.ts`
- Component: `ImageUpload` for image uploads in forms

### Session Management

**Event sessions/agenda:**
- CRUD via `POST /api/sessions`
- Participants: `GET/POST /api/sessions/participants` (enroll/unenroll)
- Stats: `GET /api/sessions/stats?eventId=X` - attendance by session
- Hook: `useSessionsStats(eventId)` for real-time stats
- Components: `SessionForm`, `SessionAgenda`, `SessionParticipantsList`, `FullAgendaModal`, `DetailedStatsModal`

### API Routes Reference

**Analytics & Tracking:**
- `POST /api/analytics/landing-page` - Track landing page visit
- `GET /api/analytics/landing-page?eventId=X` - Get landing page analytics

**Email & Communication:**
- `GET /api/brevo-templates` - List Brevo email templates
- `GET /api/mailersend-templates` - List MailerSend templates
- `POST /api/send-participant-email` - Send custom email to participant
- `POST /api/send-ticket-email` - Send ticket email with QR code
- `POST /api/send-ticket` - Alternative ticket sending endpoint
- `POST /api/send-landing-link` - Send personalized landing page link

**Check-in & QR:**
- `POST /api/checkin` - Perform check-in via QR code
- `GET /api/checkin?eventId=X&sessionId=Y` - Get check-ins with stats
- `POST /api/verify-qr/[token]` - Verify QR code validity and get participant info

**Events & Access:**
- `POST /api/event-access` - Validate event access code
- `GET /api/event-access?eventId=X` - Get event access information

**Landing Pages:**
- `GET /api/landing-page-config?eventId=X` - Get landing page configuration
- `POST /api/landing-page-config` - Update landing page configuration

**Participants:**
- `POST /api/participants/import` - CSV import for bulk participant creation
- `POST /api/participant-tokens` - Generate/regenerate participant landing page tokens
- `GET /api/participant-tokens?participantId=X` - Get participant token

**Sessions & Agenda:**
- `GET /api/sessions?eventId=X` - List all sessions for an event
- `POST /api/sessions` - Create new session
- `PUT /api/sessions?id=X` - Update session
- `DELETE /api/sessions?id=X` - Delete session
- `GET /api/sessions/participants?sessionId=X` - Get session enrollments
- `POST /api/sessions/participants` - Enroll participant in session
- `DELETE /api/sessions/participants?sessionId=X&participantId=Y` - Unenroll participant
- `GET /api/sessions/stats?eventId=X` - Session attendance statistics

**File Upload:**
- `/api/uploadthing` - UploadThing file upload handler

**Page Builder:**
- `GET /api/builder/pages` - List all builder pages
- `POST /api/builder/pages` - Create new builder page
- `GET /api/builder/pages/[pageId]` - Get specific builder page
- `PUT /api/builder/pages/[pageId]` - Update builder page
- `DELETE /api/builder/pages/[pageId]` - Delete builder page
- `POST /api/builder/pages/[pageId]/duplicate` - Duplicate builder page
- `POST /api/builder/pages/[pageId]/publish` - Publish/unpublish builder page
- `POST /api/builder/pages/from-template` - Create page from template
- `GET /api/events/[eventId]/builder-page` - Get builder page for event
- `POST /api/events/[eventId]/builder-page` - Create/update builder page for event
- `POST /api/builder/templates/seed` - Seed templates with full schemas (avoids SQL timeout)
- `GET /api/builder/test-tables` - Test builder tables setup
- `GET /api/builder/domains/[domainId]` - Get domain configuration
- `POST /api/builder/domains/[domainId]/verify` - Verify domain DNS
- `GET /api/builder/event-data/[eventId]` - Get event data for builder

**Billing & Payment:**
- `GET /api/events/[eventId]` - Get event details (for PaymentWidget)
- `GET /api/ticket-types?evenement_id=X&visible_only=true` - Get available ticket types
- `POST /api/orders` - Create new order
- `POST /api/payments/stripe` - Process Stripe payment
- `GET /api/orders/[orderId]` - Get order details

**Testing & Debugging:**
- `GET /api/test-supabase` - Test Supabase connection
- `GET /api/debug-participant?participantId=X` - Debug participant data
- `GET /api/debug-landing?eventId=X&token=Y` - Debug landing page data
- `GET /api/builder/test-tables` - Test builder tables setup

## Important Patterns

### Type Safety
- Core types defined in `src/types/index.ts`: `Participant`, `LandingPageTemplate`, `LandingPageCustomization`, `LandingPageConfig`
- Always use TypeScript for new files
- Explicit type assertions when needed for Supabase data: `data as unknown as Type[]`

### Form Handling
- Use React Hook Form with Zod schemas
- See `ParticipantForm`, `SessionForm`, `LandingRegistrationForm` for examples

### CSV Export/Import
- Export utility: `src/utils/csvExport.ts` with enhanced Excel export
- Import: `POST /api/participants/import` with CSV file
- Component: `ImportParticipantsModal`
- Excel export with proper formatting and column widths
- Support for selected participants export

### Modal System
- Base: `Modal` component with size variants
- Specialized: `ConfirmationModal`, `EmailPreviewModal`, `TicketTemplateModal`, `ParticipantDetailsModal`

### Advanced Ticket & Badge Systems
- Generate QR token on participant creation
- Ticket view: `/ticket/[participantId]` (public route)
- `QrCodeCard` component for displaying QR codes
- **Advanced Ticket Templates:**
  - Visual template editor with drag-and-drop functionality
  - Multiple template types: A4, thermal, mobile
  - Zone-based layout system with advanced styling
  - PDF generation with Puppeteer for high-quality output
  - Direct printing support including thermal printers
  - Template variables for dynamic content replacement
- **Advanced Badge System:**
  - Custom badge templates with visual editor
  - Multiple badge types: standard, VIP, speaker, staff, visitor
  - Batch printing capabilities with various formats
  - Security features: watermarks, serialization, QR codes
  - Integration with participant management system

### Landing Page Analytics
- **Visit Tracking:** `landing_page_visits` table tracks all landing page visits
- **Conversion Tracking:** Records when visits result in registrations
- **Analytics Data:**
  - IP address, user agent, referrer tracking
  - Visit timestamps and conversion timestamps
  - Participant association for personalized landing pages
- **API Endpoint:** `POST /api/analytics/landing-page` for tracking visits
- **Query Endpoint:** `GET /api/analytics/landing-page?eventId=X` for analytics data

### Access Code System
- **Event Access Control:** Events can have optional `code_acces` field
- **API Validation:** `POST /api/event-access` validates access codes
- **Use Cases:**
  - Restrict event registration to invited participants
  - Control access to private/VIP events
  - Validate access before showing event details
- **Components:** `EventCodesManager` for managing event access codes

### Token Management
- **Landing Page Tokens:** Unique token per participant for personalized landing pages
- **Token Generation:** Automatic on participant creation
- **Token Regeneration:** `POST /api/participant-tokens` endpoint
- **Token Tracking:** Links to `landing_page_visits` for analytics
- **Use Cases:**
  - Personalized landing page URLs: `/landing/[eventId]/[token]`
  - Pre-filled registration forms
  - Conversion tracking per participant

### Event Payment Activation
- **evenement_payant Field:** Boolean flag in `inscription_evenements` table
- **Activation UI:** Checkbox in event edit page (`/admin/evenements/[id]/edit`)
- **Integration:** Links to billetterie tab for ticket type configuration
- **API Usage:** Controls availability of ticket types and payment processing
- **Default Value:** false (events are free by default)

## Event-Admin Specific Notes

### Dashboard & Admin Routes
- Main admin: `/admin/evenements` - Event CRUD with status badges (upcoming/today/past)
- Participants: `/admin/participants` - Filterable list with stats (check-in %, last registration)
- Event detail: `/admin/evenements/[id]` - Comprehensive event management dashboard
- Create: `/admin/evenements/create` - Multi-step event creation
- Edit: `/admin/evenements/[id]/edit` - Update event details

### Inscription Flow
- Public route: `/inscription/[evenementId]` - Registration form
- Confirmation: `/inscription/[evenementId]/confirmation` - Post-registration page
- Templates: `WizardInscriptionTemplate`, `ModernInscriptionTemplate`

### Styling Patterns
- Gradient cards with hover effects
- Status badges with dot indicators
- Responsive grid layouts (1-2-3 columns)
- Tailwind utilities: `group`, `peer`, `hover:`, `focus:`, `transition-all`
- Color palette: blue-600, indigo-600, gray-900, with accent colors per status

### Calendar Integration
- `EventCalendar` component using `react-big-calendar`
- Displays all events in month/week/day views

## Event-Website Specific Notes

### Design System
- Color palette: slate-900, blue-900, indigo-900 with cyan-400/blue-600 accents
- Web 3.0 aesthetic with gradients
- Lottie animations: `LottiePlayer`, `AnimatedIcon`, `EventAnimation`, `FeatureAnimation`
- Inspired by Swapcard.com and Weezevent.com

### Components
- `Hero` - Main value proposition
- `Features` - Feature showcase (ticketing, check-in, forms)
- `Benefits` - Use cases and benefits
- `CTA` - Call to action sections
- `Footer` - Footer with links
- `Navigation` - Top navigation

## Environment Variables

Required in `event-admin/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
BREVO_API_KEY=
MAILERSEND_API_KEY=
```

## Common Development Tasks

### Adding a New Landing Template
1. Create template component in `src/components/landing-templates/NewTemplate.tsx`
2. Accept props: `event`, `customization`, `onRegistrationSuccess`, `participantData`, `eventId`, `token`
3. Include `LandingRegistrationForm` component
4. Update `ClientLandingWrapper` to include new template in switch statement
5. Add template metadata to template selector UI

### Adding a New API Endpoint
1. Create `src/app/api/[endpoint]/route.ts`
2. Use `supabaseApi()` from `@/lib/supabase/server` (NOT browser client)
3. Export `GET`, `POST`, `PUT`, `DELETE` as needed
4. Return `NextResponse.json()` with `{ success, data/message }`
5. Handle errors with appropriate HTTP status codes

### Creating a New Page with Authentication
1. Add route to `middleware.ts` config matcher
2. Use Server Component for data fetching with `supabaseServer()`
3. Create separate Client Component for interactivity
4. Pass server-fetched data as props to client component

### Working with Participant Data
- Always filter by `evenement_id` when querying participants
- Use `token_landing_page` for personalized landing pages
- QR tokens in separate table: `inscription_participant_qr_tokens`
- Check-in status: query `inscription_checkins` or use `checked_in` field
- Ticket tracking: `ticket_sent` and `ticket_sent_at` fields track email delivery
- Social profiles: LinkedIn, Facebook, Twitter, Instagram URLs available
- Professional info: `profession`, `site_web`, `date_naissance` optional fields

### Working with Sessions
- Sessions support capacity limits via `max_participants` (null = unlimited)
- Check enrollment count before allowing registration
- Use `inscription_session_participants` for many-to-many relationships
- Session types: conference, atelier, panel, networking, etc.
- Sessions can span multiple days with `date`, `heure_debut`, `heure_fin`

### Email Template System
- **Custom Templates per Event:**
  - Landing page invitation templates: `inscription_email_templates`
  - Ticket email templates: `inscription_ticket_templates`
- **Template Variables:** Use Mustache-style `{{variable}}` syntax
- **WYSIWYG Editor:** `EmailTemplateEditor` component with rich text editing
- **Preview:** `EmailTemplatePreview` component for testing before sending
- **Variable Replacement:** Server-side replacement in API routes before sending

### Working with Advanced Ticket Templates
1. **Template Creation:** Use `TicketTemplateWizard` for guided template creation
2. **Visual Editing:** `TicketEditor` provides drag-and-drop zone editing
3. **Zone Configuration:** Define text, image, QR, barcode, and shape zones
4. **Variable Binding:** Use `{{variable}}` syntax for dynamic content
5. **PDF Generation:** `TicketPDFGenerator` handles high-quality PDF output
6. **Printing:** Support for direct printing including thermal printers
7. **Template Types:** A4, thermal, mobile with portrait/landscape options

### Working with Advanced Badge Templates
1. **Badge Creation:** Use `BadgeTemplateSelector` and `BadgeEditor`
2. **Badge Types:** Standard, VIP, speaker, staff, visitor templates
3. **Security Features:** Configure watermarks, serialization, QR codes
4. **Batch Operations:** Generate and print badges for multiple participants
5. **Format Support:** A4, Letter, credit-card, badge-size formats
6. **Preview System:** Real-time preview with sample data

### Adding New Builder Templates
1. Create template JSON file in `event-admin/src/data/templates/new-template.json`
2. Follow Craft.js tree structure with ROOT node and component definitions
3. Add template metadata to database via SQL or API
4. Use tags array for categorization (e.g., ['conference', 'event', 'in-person'])
5. For large schemas, use `/api/builder/templates/seed` endpoint to avoid SQL timeout
6. Update BuilderLibrary component to display new template

### Builder Template Development
- **File Structure:** Templates stored as JSON files in `src/data/templates/`
- **Schema Format:** Craft.js tree structure with ROOT, nodes, and component definitions
- **Database Storage:** Use `schema` column (JSONB) in `builder_templates` table
- **Column Mappings:**
  - `label` = template display name (NOT `name`)
  - `key` = unique template identifier
  - `schema` = Craft.js JSON tree (NOT `tree`)
  - `is_public` = public visibility (NOT `is_system`)
- **Seeding Process:** Due to Supabase SQL timeout limits:
  1. Insert minimal template record via SQL
  2. Call `/api/builder/templates/seed` to populate full schema

### Builder Page Routes
- **Admin Interface:** `/admin/builder/[pageId]` - Page builder editor
- **Page Editor:** `/admin/builder/[pageId]/edit` - Advanced page editing
- **Preview Mode:** `/preview/[pageId]` - Public page preview
- **Published Pages:** `/p/[slug]` - Live published pages
- **Builder Library:** `/admin/builder/library` - Template and block library
- **Page Management:** `PageBuilderSelector` component for selecting existing pages

## New Advanced Features (Latest Updates)

### Enhanced Ticket System
- **Visual Template Editor:** Drag-and-drop interface for creating custom ticket layouts
- **Multiple Template Types:** Support for A4, thermal printer, and mobile formats
- **Advanced Zone System:** Text, images, QR codes, barcodes, shapes with full styling control
- **High-Quality PDF Generation:** Puppeteer-based PDF generation with precise layout control
- **Direct Printing Integration:** Support for thermal printers and standard printers
- **Template Variables:** Dynamic content replacement with comprehensive variable support
- **Batch Operations:** Generate tickets for multiple participants simultaneously

### Professional Badge System
- **Custom Badge Templates:** Visual editor for creating professional event badges
- **Multiple Badge Types:** Standard, VIP, speaker, staff, and visitor badge templates
- **Advanced Security:** Watermarks, serialization, holograms, and QR code verification
- **Batch Printing:** Print multiple badges per page with various format options
- **Format Flexibility:** Support for A4, Letter, credit-card, and badge-specific sizes
- **Real-time Preview:** Live preview with sample data during template creation

### Enhanced Email System
- **Improved Template Management:** Better organization and selection of email templates
- **Rich Text Editing:** Enhanced WYSIWYG editor for email content creation
- **Template Variables:** Expanded variable support for personalized emails
- **Bulk Operations:** Improved handling of mass email communications

### Advanced Excel Export
- **Professional Formatting:** Proper column widths, styling, and data formatting
- **Selective Export:** Export all participants or only selected participants
- **Comprehensive Data:** Include check-in status, registration dates, and event details
- **Multi-language Support:** Proper formatting for French dates and numbers

## Testing Notes
- No formal test suite currently implemented
- Enhanced manual testing workflow:
  1. Create event in admin with advanced settings
  2. Generate landing page with template
  3. Register participant via landing page
  4. Create custom ticket/badge templates
  5. Generate tickets and badges with PDF export
  6. Test direct printing functionality
  7. Send ticket/badge emails
  8. Scan QR code for check-in
  9. Verify check-in recorded in admin
  10. Test Excel export functionality

## Project Structure & Files

### Key Files & Directories
- `event-admin/README.md` - Basic Next.js setup instructions
- `event-admin/package.json` - Main dependencies and scripts
- `event-website/package.json` - Marketing site dependencies
- `DATABASE_SCHEMA.md` - Complete database documentation
- `PHASE.md` - Project development phase summaries
- `event-admin/src/sql/` - Database migration scripts
- `event-admin/src/data/templates/` - Craft.js template definitions
- `event-admin/scripts/clean-cache.js` - Cache cleaning utility
- `event-admin/src/types/ticket.ts` - Advanced ticket system types
- `event-admin/src/types/badge.ts` - Professional badge system types
- `event-admin/src/types/ticket-templates.ts` - Ticket template definitions
- `event-admin/src/components/tickets/` - Advanced ticket components
- `event-admin/src/components/badges/` - Professional badge components
- `event-admin/src/utils/excelExport.ts` - Enhanced Excel export utility
- `event-admin/src/components/billing/` - Payment and billing components
- `event-admin/src/components/builder/blocks/PaymentWidget.tsx` - Payment widget for page builder

### Documentation Files
- `CLAUDE.md` - This file (development guidance)
- `DATABASE_SCHEMA.md` - Comprehensive database schema documentation
- `PHASE.md` - Development phase tracking and summaries
- `event-admin/README.md` - Basic Next.js project setup
- `BREVO-SETUP.md` - Brevo email service configuration
- `MULTI-DOMAIN-SETUP.md` - Multi-domain deployment guide
- `USER-DOMAIN-GUIDE.md` - Custom domain configuration guide
- `MIGRATION_BILLETERIE_COMPLETE.md` - Complete billing system migration documentation
- `event-admin/src/sql/add_evenement_payant_column.sql` - Latest database migration for payment activation

## Deployment Considerations
- Build command uses `--no-lint` flag (see `event-admin/package.json`)
- Static generation disabled for landing pages (returns empty array)
- Ensure all environment variables set in production
- Supabase RLS policies must allow anon key operations for public routes
- Use `npm run predeploy` to run full checks before deployment
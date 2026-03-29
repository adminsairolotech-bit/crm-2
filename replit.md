# SAI RoloTech CRM 5.7 PRO

## Overview
Full-featured CRM web application for SAI RoloTech - an industrial automation company. **Light-themed** professional admin dashboard with 41 pages, role-based access, AI integrations, and comprehensive business management features. PWA + Capacitor native mobile support (Play Store / App Store ready).

## Admin Credentials (Confidential)
- **Email**: admin.sairolotech@gmail.com
- **Password**: v9667146889V
- Admin login hint removed from public login page

## Mobile / PWA Support
- **PWA** (Progressive Web App): `public/manifest.json` + `public/sw.js` service worker → installable from Chrome/Safari
- **Capacitor**: `capacitor.config.json` + `@capacitor/android` + `@capacitor/ios` → native Android/iOS app
- **App ID**: `com.sairolotech.designengine`
- **Safe area insets**: CSS variables `--sat/--sab/--sal/--sar` via `env(safe-area-inset-*)` for notched phones
- **Install prompt**: `src/components/PWAInstallPrompt.tsx` — shows "Add to Home Screen" banner
- **Build scripts**: `npm run cap:android` (Android Studio), `npm run cap:ios` (Xcode)
- **Build guide**: `MOBILE_BUILD.md` — step-by-step Play Store + App Store submission guide

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom CSS variables (light theme)
- **Routing**: Wouter (lightweight router)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **UI Components**: Radix UI primitives + custom shared components
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL) — all data stored in user's Supabase project
- **Lead Store**: `data/leads.json` — JSON file persistence (no MongoDB needed)
- **AI**: Gemini primary + OpenRouter fallback (Buddy Chat, AI Quotation, AI Machine Guide, etc.)
- **Email**: Gmail API integration via Google Mail connector

## CRM Backend System (Production)
Located in `server/` — modular production-ready backend:

### Services (`server/services/`)
- **aiManager.js** — OpenRouter (primary) → Gemini (fallback) → static message. Predefined quick replies for price/delivery/demo queries. Response caching.
- **queueService.js** — In-memory job queue with retry logic. Max 5 retries, exponential delays (1m→5m→15m→1h→4h). Survives partial failures.
- **whatsappService.js** — WhatsApp Business API. Welcome message, location-aware follow-ups (NEAR/MEDIUM/FAR × 6 templates), admin alerts, DND handling, 3-retry exponential backoff. Mock mode if keys not set.
- **fcmService.js** — Firebase Cloud Messaging push notifications. Falls back to WhatsApp if no FCM token.
- **followupService.js** — 4-month follow-up schedule (Day 1,3,7,15, Month 1,2,3,4). Stops on user reply, DND, or meeting booked.
- **calendarService.js** — Google Calendar free/busy slots, meeting booking with reminders.
- **reportService.js** — Daily report at 8pm IST via WhatsApp. Auto-scheduled on server start.

### Models (`server/models/`)
- **leadModel.js** — In-memory lead store + JSON file persistence. CRUD, smart score calculation (Location 40% + Behavior 40% + Source 20%), location priority (HIGH/MEDIUM/LOW/UNKNOWN), source analytics, location analytics, priority lead ranking.

### Routes (`server/routes/`)
- **leads.js** — All CRM HTTP endpoints (see API section below)

### CRM API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/new-lead` | Pabbly webhook — capture lead, schedule follow-ups |
| POST | `/api/track` | App behavior tracking (download, open, feature use) |
| POST | `/api/wa-webhook` | WhatsApp incoming messages + DND detection |
| GET | `/api/wa-webhook` | WhatsApp webhook verification |
| POST | `/api/book-meeting` | Google Calendar meeting booking |
| GET | `/api/calendar-slots` | Available meeting slots |
| GET | `/api/leads` | Admin: all leads (requires X-Admin-Token) |
| GET | `/api/lead-stats` | Lead scoring stats |
| GET | `/api/lead-analytics` | Source ROI + location analytics + priority leads (Admin) |
| POST | `/api/report` | Trigger manual daily report |
| POST | `/api/ai-reply` | Test AI reply generation |

### Lead Scoring
- **COLD** — No activity (default)
- **WARM** — App opened
- **HOT** — Quotation used (triggers admin alert + follow-up message)
- **VERY_HOT** — Meeting booked

### Required Env Vars for CRM
- `WHATSAPP_ACCESS_TOKEN` — Meta/WhatsApp Business API token
- `WHATSAPP_PHONE_ID` — WhatsApp Business Phone ID
- `WA_VERIFY_TOKEN` — Webhook verification token (default: `sai_rolotech_verify_2025`)
- `OPENROUTER_API_KEY` — OpenRouter AI (optional, Gemini is fallback)
- `FCM_SERVER_KEY` — Firebase Cloud Messaging (optional)
- `ADMIN_PHONE` — Admin WhatsApp number for alerts and reports
- `ADMIN_API_TOKEN` — Admin API access (default: `sairolotech_admin_2025`)
- `APP_DOWNLOAD_LINK` — App download URL for welcome messages
- `GOOGLE_CALENDAR_ID` — Calendar ID for meeting booking (default: primary)

## Database — Supabase
All data is stored in the user's Supabase project (NOT Replit's built-in PostgreSQL).
- **URL**: `https://gcbgpqxvhsxozwdudwao.supabase.co`
- **Client**: `src/lib/supabase.ts` — Supabase JS client with TypeScript interfaces
- **Data Layer**: `src/lib/dataService.ts` — CRUD helpers for all tables
- **Tables**: `machines`, `leads`, `supplier_machines`, `users`, `quotation_requests`, `feedback_reports`, `marketing_content`, `buddy_rules`, `buddy_policy`, `showrooms`, `lead_tasks`, `lead_activities`, `lead_intelligence`, `integration_settings`, `ai_usage_logs`
- **RLS**: Disabled on all tables for development
- **Env vars**: `SUPABASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Architecture

### Directory Structure
```
src/
├── App.tsx              # Main app with wouter Switch/Route routing
├── main.tsx             # Entry point
├── index.css            # Tailwind + CSS variables (dark theme)
├── components/
│   ├── layout/          # Layout.tsx, Sidebar.tsx, SearchContext.tsx
│   ├── shared/          # PageHeader, StatsCard, DataTable, SectionCard, etc.
│   ├── ui/              # badge, button, textarea, toggle (CVA-based)
│   ├── BuddyPanel.tsx   # AI Buddy slide-out panel
│   ├── AIProviderBadge.tsx
│   ├── ErrorBoundary.tsx
│   ├── ModeSelector.tsx  # Editor/Visitor mode selection
│   ├── Toaster.tsx
│   ├── FileUploadZone.tsx
│   └── LoadingWithTimeout.tsx
├── contexts/
│   ├── RoleContext.tsx    # Roles: admin, supplier, machine_user
│   └── AdminModeContext.tsx  # editor/visitor mode
├── hooks/
│   ├── use-device-capability.ts  # Responsive detection
│   ├── use-swipe-navigation.ts   # Mobile swipe
│   └── use-toast.ts              # Toast notifications
├── lib/
│   ├── animations.ts    # Framer Motion variants
│   ├── supabase.ts      # Supabase client + TypeScript interfaces
│   ├── dataService.ts   # CRUD data access layer for all Supabase tables
│   ├── apiFetch.ts      # Legacy API client (being replaced by dataService)
│   ├── chart-colors.ts  # Chart color palettes
│   ├── role-routes.ts   # Navigation sections by role
│   └── utils.ts         # cn() utility
└── pages/               # 26 pages (all lazy-loaded)
    ├── dashboard.tsx          # Live Supabase data
    ├── growth.tsx
    ├── graphs.tsx             # Live Supabase data
    ├── suppliers.tsx          # Live Supabase data
    ├── machines.tsx           # Live Supabase data
    ├── sales-pipeline.tsx     # Live Supabase data (Kanban)
    ├── sales-tasks.tsx        # Live Supabase data
    ├── sales-sequences.tsx
    ├── demo-scheduler.tsx
    ├── lead-imports.tsx       # Gmail integration
    ├── lead-intelligence.tsx  # Live Supabase data
    ├── map-view.tsx
    ├── quotation-maker.tsx    # Live Supabase data
    ├── quotations.tsx
    ├── ai-control.tsx         # Live Supabase data
    ├── buddy.tsx
    ├── buddy-rules.tsx
    ├── buddy-family.tsx
    ├── marketing-content.tsx
    ├── outreach-templates.tsx
    ├── service-manager.tsx    # Live Supabase data
    ├── power-dashboard.tsx    # Live Supabase data
    ├── users.tsx
    ├── feedback.tsx           # Live Supabase data
    ├── report-card.tsx        # Live Supabase data
    └── settings.tsx
```

### Supabase Data Service Exports (src/lib/dataService.ts)
- `machines` — CRUD for machines table
- `leads` — CRUD for leads table
- `suppliers` — CRUD for supplier_machines table
- `users` — CRUD for users table
- `quotations` — CRUD for quotation_requests table
- `feedbackReports` — CRUD for feedback_reports table
- `buddyRules` — CRUD for buddy_rules table
- `buddyPolicy` — CRUD for buddy_policy table
- `showrooms` — CRUD for showrooms table
- `leadTasks` — CRUD for lead_tasks table
- `leadActivities` — CRUD for lead_activities table
- `leadIntelligence` — CRUD for lead_intelligence table
- `marketingContent` — CRUD for marketing_content table
- `integrationSettings` — CRUD for integration_settings table
- `aiUsageLogs` — CRUD for ai_usage_logs table

### Roles
- `admin` - Full access to all 26 pages
- `supplier` - Access to Dashboard, Map View, Settings
- `machine_user` - Access to Dashboard, Machine Catalog

### Key Features
- Glass-card dark theme UI
- Responsive with mobile sidebar (swipe navigation)
- Lazy-loaded pages with error boundaries
- Editor/Visitor mode toggle
- AI Buddy panel (slide-out)
- Real-time toast notifications
- Virtual scrolling in DataTable
- Adaptive animations based on device capability
- All data from Supabase (live, no mock data)

## Auth Flow (NEW)
The app now has a proper login/registration flow as the entry point:
- `/login` — Login page (first page for unauthenticated users)
- `/register` — New user registration
- `/forgot-password` — Password reset page
- `/role-select` — Shown after registration to select user type
- `/home` — SAI RoloTech customer home page (for new_user & operator types)
- `/select-mode` — Admin mode selector (admin only)

### Auth Context (`src/contexts/AuthContext.tsx`)
- Stores auth state in `localStorage` (key: `sai_crm_auth_user`)
- Demo admin: `admin@sairolotech.com` / `admin123`
- User types: `admin`, `machine_user`, `supplier`, `new_user`, `operator`

### User Type → Destination Mapping
- `admin` → `/select-mode` → CRM
- `machine_user` → `/` (CRM dashboard, machine_user role)
- `supplier` → `/map-view` (CRM, supplier role)
- `new_user` → `/home` (customer home page)
- `operator` → `/home` (customer home page)

## Running
```bash
npm run dev
```
Runs on port 5000.

## Important Notes
- NEVER use Replit's built-in PostgreSQL — user wants Supabase ONLY
- Vite config has `server.watch.ignored: ['**/.local/**']` to prevent infinite reload loops
- All Supabase tables have RLS disabled for development

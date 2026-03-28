# SAI RoloTech CRM 5.6 PRO

## Overview
Full-featured CRM web application for SAI RoloTech - an industrial automation company. Dark-themed admin dashboard with 26 pages, role-based access, AI integrations, and comprehensive business management features.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom CSS variables (dark theme)
- **Routing**: Wouter (lightweight router)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **UI Components**: Radix UI primitives + custom shared components
- **Icons**: Lucide React
- **AI**: Gemini (Buddy Chat), OpenAI (Question Generation)
- **Email**: Gmail API integration via Google Mail connector

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
│   ├── apiFetch.ts      # API client with retry/timeout
│   ├── chart-colors.ts  # Chart color palettes
│   ├── firebase.ts      # Firebase config
│   ├── role-routes.ts   # Navigation sections by role
│   └── utils.ts         # cn() utility
└── pages/               # 26 pages (all lazy-loaded)
    ├── dashboard.tsx
    ├── growth.tsx
    ├── graphs.tsx
    ├── suppliers.tsx
    ├── machines.tsx
    ├── sales-pipeline.tsx
    ├── sales-tasks.tsx
    ├── sales-sequences.tsx
    ├── demo-scheduler.tsx
    ├── lead-imports.tsx
    ├── lead-intelligence.tsx
    ├── map-view.tsx
    ├── quotation-maker.tsx
    ├── quotations.tsx
    ├── ai-control.tsx
    ├── buddy.tsx
    ├── buddy-rules.tsx
    ├── buddy-family.tsx
    ├── marketing-content.tsx
    ├── outreach-templates.tsx
    ├── service-manager.tsx
    ├── power-dashboard.tsx
    ├── users.tsx
    ├── feedback.tsx
    ├── report-card.tsx
    └── settings.tsx
```

### API Endpoints (in vite.config.js)
- `POST /api/buddy-chat` - Gemini AI chat (Buddy assistant)
- `POST /api/generate-questions` - OpenAI question generation
- `POST /api/send-inquiry` - Gmail-based lead inquiry emails
- `GET /api/gmail-leads` - Fetch Gmail inbox as leads

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

## Running
```bash
npm run dev
```
Runs on port 5000.

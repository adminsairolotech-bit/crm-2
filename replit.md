# CRM System - Beta (SAI RoloTech)

A full-featured Customer Relationship Management (CRM) web application for SAI RoloTech, built with React + Vite and Firebase authentication.

## Features / Modules

1. **Login & Auth** — Firebase authentication + demo fallback login. All users can login from main page.
2. **Dashboard** — Overview with stats, Gmail leads, quick access to all modules, system status.
3. **Customers** — Add, search, and manage customer records.
4. **Leads** — Kanban-style lead tracking with source, status, and follow-up notes.
5. **Machine Testing Report** — Industrial machine/panel testing with 15 test parameters, OK/FAIL marking, and PDF-ready reports.
6. **PLC Error Code Database** — 20+ PLC error codes for Siemens, Allen Bradley, Mitsubishi, Omron, Delta, Schneider, ABB with cause & solution.
7. **PNMG Loan Management** — EMI calculator, loan application form, application tracking with status approvals.
8. **AI Question Maker** — Quiz/training question generator for PLC, Electrical Safety, CRM, Machine Maintenance, Automation topics.
9. **Buddy Chatbot** — AI-powered chatbot for Sales, Service, and Automation queries.
10. **Inquiry Form** — Customer inquiry form (public, sends to Gmail).

## Tech Stack

- **Frontend:** React 18, React Router v6, CSS Modules
- **Build Tool:** Vite 5
- **Runtime:** Node.js 20
- **Package Manager:** npm
- **Auth:** Firebase (with demo fallback)
- **APIs:** Google Gmail API via Replit connector

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start dev server on port 5000
npm run build    # Build for production
```

## Replit Setup

- **Workflow:** "Start application" runs `npm run dev` on port 5000
- **Host:** 0.0.0.0 (configured in vite.config.js)
- **AllowedHosts:** true (proxy-friendly)
- **Deployment:** Static site — `npm run build` → `dist/` folder

## Demo Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin.sairolotech@gmail.com | v9667146889V | Admin |
| admin@sairolotech.com | admin@123 | Admin |
| sales@sairolotech.com | sales@123 | Sales |

Firebase users can also login (when Firebase API key is configured via VITE_FIREBASE_API_KEY).

## Project Structure

```
src/
  components/
    Layout.jsx          # Sidebar + topbar layout (shared across all pages)
    Layout.module.css
  context/
    AuthContext.jsx     # Firebase auth + demo fallback
  firebase.js           # Firebase config
  pages/
    Login.jsx / Login.module.css
    ForgotPassword.jsx / ForgotPassword.module.css
    Dashboard.jsx / Dashboard.module.css
    Customers.jsx / Customers.module.css
    Leads.jsx / Leads.module.css
    MachineReport.jsx / MachineReport.module.css
    PLCErrors.jsx / PLCErrors.module.css
    PNMGLoan.jsx / PNMGLoan.module.css
    AIQuestions.jsx / AIQuestions.module.css
    BuddyBot.jsx / BuddyBot.module.css
    InquiryForm.jsx / InquiryForm.module.css
  App.jsx               # All routes
  main.jsx
  index.css
server/
  index.js              # Express server (production)
  gmail.js              # Gmail integration
mobile/                 # Expo React Native app (separate)
```

# CRM System - Beta

A Customer Relationship Management (CRM) web application built with React + Vite for **SAI RoloTech**.

## Features

- **Login Page** — User ID & Password login with show/hide password toggle
- **Password Recovery** — Forgot password page with User ID lookup
- **Beta Version Badge** — Shown on login page, recovery page, and dashboard header
- **Protected Dashboard** — Stats, recent activity, user info with logout
- **Gmail Integration** — Lead capture via Gmail API (Replit connector)
- **Firebase Auth** — Authentication via Firebase

## Tech Stack

- **Frontend:** React 18, React Router v6, CSS Modules
- **Build Tool:** Vite 5
- **Runtime:** Node.js 20
- **Package Manager:** npm
- **Auth/DB:** Firebase
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

## Demo Credentials

| User ID   | Password  | Role  |
|-----------|-----------|-------|
| admin001  | admin@123 | Admin |
| user001   | user@123  | Sales |

## Project Structure

```
src/
  context/AuthContext.jsx   # Auth state and demo user management
  firebase.js               # Firebase config
  pages/
    Login.jsx               # Login page with User ID + Password
    Login.module.css
    ForgotPassword.jsx      # Password recovery page
    ForgotPassword.module.css
    Dashboard.jsx           # Protected main dashboard
    Dashboard.module.css
  App.jsx                   # Routes setup
  main.jsx                  # React entry point
  index.css                 # Global styles
server/
  index.js                  # Express server (for production static serving)
  gmail.js                  # Gmail integration helpers
mobile/                     # Expo React Native app (separate)
```

## Mobile App

`mobile/` folder contains a complete Expo React Native app with Login, Password Recovery, Dashboard, Customers, Leads, and Profile screens. See `STORE_SUBMISSION_GUIDE.md` for submission steps.

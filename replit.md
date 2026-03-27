# CRM System - Beta

A Customer Relationship Management (CRM) web application built with React + Vite.

## Features

- **Login Page** — User ID & Password login with show/hide password toggle
- **Password Recovery** — Forgot password page with User ID lookup
- **Beta Version Badge** — Shown on login page, recovery page, and dashboard header
- **Protected Dashboard** — Stats, recent activity, user info with logout

## Tech Stack

- **Frontend:** React 18, React Router v6, CSS Modules
- **Build Tool:** Vite 5
- **Runtime:** Node.js 20
- **Package Manager:** npm

## Development

```bash
npm run dev      # Start dev server on port 5000
npm run build    # Build for production
```

## Demo Credentials

| User ID   | Password  | Role  |
|-----------|-----------|-------|
| admin001  | admin@123 | Admin |
| user001   | user@123  | Sales |

## Project Structure

```
src/
  context/AuthContext.jsx   # Auth state and demo user management
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
```

## Deployment

Configured as a static site: `npm run build` → `dist/` folder.

## Mobile App (Play Store + App Store)

`mobile/` folder mein complete Expo React Native app hai:
- Login, Password Recovery, Dashboard, Customers, Leads, Profile
- Beta badge on all screens
- EAS Build config for Google Play and App Store
- See `STORE_SUBMISSION_GUIDE.md` for submission steps

## CI/CD — Auto Deploy from GitHub

`.github/workflows/deploy.yml` — Every push to `main` triggers auto-deploy.
`.github/workflows/ci.yml` — Every Pull Request runs a build check.

See `DEVELOPER_GUIDE.md` for full setup instructions.

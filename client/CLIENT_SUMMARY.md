# Client Summary:

This document provides a comprehensive overview of the client folder for this project. It is intended as a data bank for agentic AI and developers.

---

## Overview

The client is a modern React application (TypeScript) designed for managing environmental compliance dashboards, including smoke belching, emissions, and related records. It emphasizes modularity, reusability, and user-friendly UI/UX for non-technical users.

---

## Main Structure

- **src/**: Main source code for the frontend (React/TypeScript)
- **src-tauri/**: Tauri backend and configuration (for desktop builds)
- **public/**: Static assets
- **dist/**: Build output
- **cert/**: Certificates for secure builds
- **package.json**: Project dependencies and scripts
- **vite.config.ts**: Vite build configuration
- **README.md**: Development guide and feature checklist

---

## src/ Directory

- **main.tsx, App.tsx**: Application entry points
- **index.css, App.css**: Global and app-level styles
- **presentation/**: UI components, pages, and role-based modules
  - **components/shared/**: Reusable UI primitives (buttons, forms, dialogs, charts, etc.), layouts, and dashboard widgets
  - **components/shared/ui/**: UI primitives (inputs, tables, dialogs, etc.)
  - **components/shared/layout/**: Layout and navigation (sidebars, navbars, etc.)
  - **components/shared/dashboard/**: Dashboard-specific widgets (stat cards, charts)
  - **components/shared/auth/**: Authentication forms/components
  - **pages/public/**: Public-facing pages (DashboardSelection, ProfilePage, SignIn, NotFound, Unauthorized)
  - **roles/**: Role-based modules (e.g., emission, belching)
    - **emission/**: Emission-specific routes, pages (Overview, Offices, QuarterlyTesting, Vehicles), and components
- **core/**: Core utilities, API logic, and hooks
  - **api/**: API service files (auth, emission, vehicle, profile, user, etc.)
  - **hooks/**: Custom React hooks
  - **utils/**: Utility functions
- **integrations/**: (Not fully explored) Likely for third-party or backend integrations

---

## Features & Modules

- **Smoke Belcher Module**: UI for managing smoke belching violations, records, payments, and reports (see README for detailed checklist)
- **Emission Module**: Role-based pages and components for emission management
- **Authentication**: Sign-in forms, protected routes, and user profile management
- **Dashboard**: Stat cards, charts, and summary widgets
- **Reusable UI**: Large library of shared UI components for forms, tables, dialogs, charts, navigation, etc.
- **Role-based Routing**: Organized by user roles (emission, belching, etc.)
- **API Layer**: Service files for interacting with backend endpoints
- **Custom Hooks**: Encapsulate logic for data fetching, state, and UI behavior

---

## Development & Configuration

- **Vite**: Fast build tool for React
- **TypeScript**: Type safety throughout the codebase
- **ESLint/Prettier**: Enforced code style and linting
- **Jest**: (Expected) for unit testing in `src/__tests__/`
- **Tauri**: For desktop app builds (src-tauri)

---

## Quickstart (from README.md)

See the main README for detailed setup and feature checklist. Typical workflow:

```bash
npm install
npm run dev
```

---

## Notes

- Modular, role-based UI structure
- Emphasis on reusability and maintainability
- Designed for non-technical users (simple, clear UI/UX)
- Extensive shared component library
- Feature progress and file locations tracked in README

---

This summary serves as a reference for agentic AI and developers to understand, navigate, and extend the client system efficiently.

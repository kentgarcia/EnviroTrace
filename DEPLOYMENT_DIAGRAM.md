# EnviroTrace Deployment Architecture

## Overview

This document provides a comprehensive deployment diagram for the EnviroTrace monorepo, illustrating how all components interact across different environments and platforms.

---

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ENVIROTRACE ECOSYSTEM                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌─────────────────────┐
                                    │      CLIENTS        │
                                    └─────────────────────┘
                                             │
        ┌────────────────────────────────────┼────────────────────────────────────┐
        │                                    │                                    │
        ▼                                    ▼                                    ▼
┌───────────────────┐            ┌───────────────────┐            ┌───────────────────┐
│   WEB CLIENT      │            │  DESKTOP CLIENT   │            │   MOBILE APP      │
│   (Browser)       │            │  (Tauri/Windows)  │            │  (Android/iOS)    │
│                   │            │                   │            │                   │
│  React + Vite     │            │  React + Tauri    │            │  React Native     │
│  TypeScript       │            │  Rust Backend     │            │  Expo SDK 54      │
│  TanStack Router  │            │  WebView2         │            │  SQLite (local)   │
│  Tailwind CSS     │            │  Local Storage    │            │  Offline-first    │
│  shadcn/ui        │            │  MSI/NSIS Installer│           │                   │
└─────────┬─────────┘            └─────────┬─────────┘            └─────────┬─────────┘
          │                                │                                │
          │  HTTPS                         │  HTTPS                         │  HTTPS
          │                                │                                │
          └────────────────────────────────┼────────────────────────────────┘
                                           │
                                           ▼
                          ┌────────────────────────────────┐
                          │         LOAD BALANCER          │
                          │    (Render/Railway/Nginx)      │
                          └────────────────┬───────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      BACKEND SERVICES                                         │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                              FastAPI Application Server                                 │  │
│  │                                                                                         │  │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │   │  Auth API   │  │ Emission API│  │ Tree Mgmt   │  │ Urban Green │  │ Admin API   │  │  │
│  │   │  /api/v1/   │  │  /api/v1/   │  │  /api/v1/   │  │  /api/v1/   │  │  /api/v1/   │  │  │
│  │   │  auth/*     │  │  emission/* │  │  trees/*    │  │  greening/* │  │  admin/*    │  │  │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  │                                                                                         │  │
│  │   ┌───────────────────────────────────────────────────────────────────────────────┐    │  │
│  │   │                           Core Services                                        │    │  │
│  │   │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │    │  │
│  │   │  │ JWT Security │ │ Gemini AI    │ │ OCR Service  │ │ Health Check │          │    │  │
│  │   │  │ (HS256)      │ │ Integration  │ │ (Image Proc) │ │ Monitoring   │          │    │  │
│  │   │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘          │    │  │
│  │   └───────────────────────────────────────────────────────────────────────────────┘    │  │
│  │                                                                                         │  │
│  │   Uvicorn ASGI Server (Port 8000)                                                      │  │
│  └────────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           │ asyncpg/psycopg
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA LAYER                                                 │
│                                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                        PostgreSQL 15 (Primary Database)                                 │  │
│  │                                                                                         │  │
│  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐      │  │
│  │   │   auth Schema   │ │ emission Schema │ │ belching Schema │ │urban_greening   │      │  │
│  │   │                 │ │                 │ │                 │ │     Schema      │      │  │
│  │   │  • users        │ │  • vehicles     │ │  • violations   │ │  • trees        │      │  │
│  │   │  • sessions     │ │  • tests        │ │  • payments     │ │  • projects     │      │  │
│  │   │  • profiles     │ │  • schedules    │ │  • appeals      │ │  • species      │      │  │
│  │   │  • roles        │ │  • results      │ │                 │ │  • inventory    │      │  │
│  │   └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘      │  │
│  │                                                                                         │  │
│  │   • UUID Primary Keys (uuid_generate_v4)                                               │  │
│  │   • Cross-schema Foreign Keys                                                          │  │
│  │   • Soft Deletes (deleted_at timestamps)                                               │  │
│  └────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                         Supabase (Optional BaaS Integration)                            │  │
│  │                                                                                         │  │
│  │   • Storage (File uploads, images)                                                      │  │
│  │   • Realtime subscriptions                                                              │  │
│  │   • Row Level Security policies                                                         │  │
│  └────────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Component Diagrams

### 1. Backend Service Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI BACKEND SERVICE                                │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                           Entry Point                                     │   │
│  │                         app/main.py                                       │   │
│  │                    Uvicorn ASGI Server                                    │   │
│  └─────────────────────────────────┬────────────────────────────────────────┘   │
│                                    │                                             │
│  ┌─────────────────────────────────┼────────────────────────────────────────┐   │
│  │                          Middleware Layer                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │   │
│  │  │ CORS Handler    │  │ Exception       │  │ Request         │           │   │
│  │  │                 │  │ Handler         │  │ Logging         │           │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│  ┌─────────────────────────────────┼────────────────────────────────────────┐   │
│  │                          API Layer (v1)                                   │   │
│  │                        /api/v1/*                                          │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │   │
│  │  │ auth/       │ │ users/      │ │ emissions/  │ │ trees/      │         │   │
│  │  │ - login     │ │ - profiles  │ │ - vehicles  │ │ - inventory │         │   │
│  │  │ - register  │ │ - settings  │ │ - tests     │ │ - species   │         │   │
│  │  │ - refresh   │ │ - sessions  │ │ - schedules │ │ - planting  │         │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │   │
│  │  │ greening/   │ │ fees/       │ │ admin/      │ │ health/     │         │   │
│  │  │ - projects  │ │ - payments  │ │ - dashboard │ │ - check     │         │   │
│  │  │ - reports   │ │ - billing   │ │ - users     │ │ - metrics   │         │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│  ┌─────────────────────────────────┼────────────────────────────────────────┐   │
│  │                         Service Layer                                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │   │
│  │  │ Gemini AI       │  │ OCR Processing  │  │ System Health   │           │   │
│  │  │ gemini-2.0-flash│  │ Image Analysis  │  │ psutil monitor  │           │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│  ┌─────────────────────────────────┼────────────────────────────────────────┐   │
│  │                          CRUD Layer                                       │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │   │
│  │  │ crud_user   │ │crud_emission│ │ crud_tree   │ │ crud_session│         │   │
│  │  │             │ │             │ │ _inventory  │ │             │         │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘         │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │   │
│  │  │ crud_fee    │ │crud_planting│ │crud_profile │ │crud_vehicle │         │   │
│  │  │             │ │             │ │             │ │ _remarks    │         │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│  ┌─────────────────────────────────┼────────────────────────────────────────┐   │
│  │                       Database Layer (SQLAlchemy)                         │   │
│  │                                                                           │   │
│  │   ┌────────────────────────────────────────────────────────────────┐     │   │
│  │   │                    Alembic Migrations                           │     │   │
│  │   │  • Version control for database schema                          │     │   │
│  │   │  • Auto-generated from SQLAlchemy models                        │     │   │
│  │   └────────────────────────────────────────────────────────────────┘     │   │
│  │                                                                           │   │
│  │   Connection: asyncpg (async) / psycopg (sync for Alembic)               │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 2. Client Application Architecture (Web + Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        WEB / DESKTOP CLIENT ARCHITECTURE                         │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         Build & Development                               │   │
│  │                                                                           │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │   │                    Vite Build System                             │    │   │
│  │   │                                                                  │    │   │
│  │   │  npm run dev      → Development server (HMR, localhost:5173)    │    │   │
│  │   │  npm run build    → Production build (dist/)                    │    │   │
│  │   │  npm run dev:tauri → Tauri desktop development                  │    │   │
│  │   │  npm run build:tauri → Desktop app build (MSI/NSIS)             │    │   │
│  │   └─────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         Application Structure                             │   │
│  │                                                                           │   │
│  │   src/                                                                    │   │
│  │   ├── core/                     # API services, utilities                 │   │
│  │   │   ├── api/                  # Axios HTTP client, endpoints            │   │
│  │   │   └── utils/                # Helpers, constants                      │   │
│  │   │                                                                       │   │
│  │   ├── presentation/             # UI Layer                                │   │
│  │   │   ├── components/           # Shared UI components (shadcn/ui)        │   │
│  │   │   └── roles/                # Role-based pages                        │   │
│  │   │       ├── admin/            # Admin dashboard & features              │   │
│  │   │       ├── tree_management/  # Tree inventory & projects               │   │
│  │   │       └── government_emission/ # Vehicle testing & compliance         │   │
│  │   │                                                                       │   │
│  │   └── integrations/             # External service integrations           │   │
│  │       └── supabase/             # Supabase client setup                   │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                        Key Dependencies                                   │   │
│  │                                                                           │   │
│  │   UI Framework:        React 19.1 + TypeScript 5.8                        │   │
│  │   Routing:             TanStack Router / React Router DOM                 │   │
│  │   State Management:    Zustand 5.0 + TanStack Query 5.76                  │   │
│  │   UI Components:       shadcn/ui + Radix Primitives                       │   │
│  │   Styling:             Tailwind CSS 4.1                                   │   │
│  │   Charts:              ECharts 5.6 + Recharts 2.15                        │   │
│  │   Maps:                Leaflet 1.9 + React Leaflet 5.0                    │   │
│  │   Forms:               React Hook Form 7.56 + Zod 3.24                    │   │
│  │   HTTP Client:         Axios 1.9                                          │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                    Tauri Desktop Integration                              │   │
│  │                        src-tauri/                                         │   │
│  │                                                                           │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │   │  Product: EPNRO Management System                                │    │   │
│  │   │  Identifier: com.epnro.management                                │    │   │
│  │   │  Version: 0.1.1                                                   │    │   │
│  │   │                                                                   │    │   │
│  │   │  Build Targets:                                                   │    │   │
│  │   │  ├── Windows: MSI (WiX) + NSIS installer                         │    │   │
│  │   │  ├── macOS: DMG + App bundle                                      │    │   │
│  │   │  └── Linux: AppImage + DEB                                        │    │   │
│  │   │                                                                   │    │   │
│  │   │  Features:                                                        │    │   │
│  │   │  ├── WebView2 (Edge Chromium runtime)                             │    │   │
│  │   │  ├── Plugin: @tauri-apps/plugin-store (local storage)            │    │   │
│  │   │  └── Security: CSP disabled for local development                 │    │   │
│  │   └─────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Mobile Application Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          MOBILE APPLICATION ARCHITECTURE                         │
│                              React Native + Expo                                 │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                           App Configuration                               │   │
│  │                                                                           │   │
│  │   Name:       EnviroTrace                                                 │   │
│  │   Bundle ID:  com.epnro.govemission                                       │   │
│  │   Version:    1.0.1 (versionCode: 2)                                      │   │
│  │   Expo SDK:   54                                                          │   │
│  │   React:      19.1.0                                                      │   │
│  │   RN:         0.81.4                                                      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         Project Structure                                 │   │
│  │                                                                           │   │
│  │   mobile/                                                                 │   │
│  │   ├── src/                                                                │   │
│  │   │   ├── components/        # Shared mobile UI components                │   │
│  │   │   ├── core/              # API services, constants                    │   │
│  │   │   ├── hooks/             # Custom React hooks                         │   │
│  │   │   ├── navigation/        # React Navigation setup                     │   │
│  │   │   ├── screens/           # App screens by feature                     │   │
│  │   │   ├── styles/            # Shared styles, themes                      │   │
│  │   │   └── types/             # TypeScript type definitions                │   │
│  │   │                                                                       │   │
│  │   ├── assets/                # Images, fonts, icons                       │   │
│  │   └── plugins/               # Custom Expo plugins                        │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                      Platform-Specific Features                           │   │
│  │                                                                           │   │
│  │   ┌────────────────────────────┐  ┌────────────────────────────┐         │   │
│  │   │         Android            │  │           iOS              │         │   │
│  │   │                            │  │                            │         │   │
│  │   │  Min SDK: 23               │  │  Supports Tablet: Yes      │         │   │
│  │   │  Target SDK: 34            │  │                            │         │   │
│  │   │  Compile SDK: 34           │  │  Permissions:              │         │   │
│  │   │                            │  │  • Camera                  │         │   │
│  │   │  Permissions:              │  │  • Location                │         │   │
│  │   │  • INTERNET                │  │  • Photo Library           │         │   │
│  │   │  • NETWORK_STATE           │  │                            │         │   │
│  │   │  • FINE_LOCATION           │  │                            │         │   │
│  │   │  • CAMERA                  │  │                            │         │   │
│  │   │  • STORAGE                 │  │                            │         │   │
│  │   └────────────────────────────┘  └────────────────────────────┘         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                       Offline-First Architecture                          │   │
│  │                                                                           │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │   │                    Local Data Layer                              │    │   │
│  │   │                                                                  │    │   │
│  │   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │    │   │
│  │   │   │ expo-sqlite  │  │expo-secure-  │  │ AsyncStorage │          │    │   │
│  │   │   │ (FTS enabled)│  │ store        │  │              │          │    │   │
│  │   │   │              │  │              │  │              │          │    │   │
│  │   │   │ Local DB for │  │ Secure       │  │ User prefs,  │          │    │   │
│  │   │   │ offline data │  │ credentials  │  │ settings     │          │    │   │
│  │   │   └──────────────┘  └──────────────┘  └──────────────┘          │    │   │
│  │   └─────────────────────────────────────────────────────────────────┘    │   │
│  │                                                                           │   │
│  │   ┌─────────────────────────────────────────────────────────────────┐    │   │
│  │   │                   Sync & Networking                              │    │   │
│  │   │                                                                  │    │   │
│  │   │   • Background sync when online                                  │    │   │
│  │   │   • Conflict resolution for concurrent edits                     │    │   │
│  │   │   • Network state monitoring (@react-native-community/netinfo)   │    │   │
│  │   │   • API: https://envirotrace.up.railway.app/api/v1               │    │   │
│  │   └─────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         Expo Plugins & Native Modules                     │   │
│  │                                                                           │   │
│  │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │   │
│  │   │ expo-camera │ │expo-location│ │expo-media-  │ │ expo-font   │        │   │
│  │   │             │ │             │ │ library     │ │             │        │   │
│  │   │ Tree photos │ │ GPS tagging │ │ Save images │ │ Poppins     │        │   │
│  │   └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │   │
│  │   ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐        │   │
│  │   │expo-image-  │ │expo-file-   │ │ withNetworkSecurityConfig   │        │   │
│  │   │ picker      │ │ system      │ │ (custom plugin)             │        │   │
│  │   │             │ │             │ │                             │        │   │
│  │   │ Select imgs │ │ File I/O    │ │ Android network config      │        │   │
│  │   └─────────────┘ └─────────────┘ └─────────────────────────────┘        │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          Build & Distribution                             │   │
│  │                                                                           │   │
│  │   Development:           Production:                                      │   │
│  │   ├── expo start         ├── EAS Build (eas.json)                        │   │
│  │   ├── expo run:android   ├── Android: Google Play Store                  │   │
│  │   └── expo run:ios       └── iOS: Apple App Store                        │   │
│  │                                                                           │   │
│  │   EAS Project ID: 966ce2df-01f4-4e40-a136-4e2c63429daa                   │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4. Deployment Environment Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DEPLOYMENT ENVIRONMENTS                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║                                    PRODUCTION ENVIRONMENT                                  ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                            ║
║   ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║   │                              RENDER.COM (Backend)                                   │  ║
║   │                                                                                     │  ║
║   │   Service: eco-dash-backend                                                         │  ║
║   │   Type: Web Service                                                                 │  ║
║   │   Plan: Free tier (auto-scaling available)                                          │  ║
║   │                                                                                     │  ║
║   │   Build:                                                                            │  ║
║   │   └── pip install -r backend/requirements.txt                                       │  ║
║   │                                                                                     │  ║
║   │   Post-Deploy:                                                                      │  ║
║   │   └── cd backend && alembic upgrade head                                            │  ║
║   │                                                                                     │  ║
║   │   Start:                                                                            │  ║
║   │   └── cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT               │  ║
║   │                                                                                     │  ║
║   │   Health Check: /api/healthcheck                                                    │  ║
║   │   Auto Deploy: Yes (on git push)                                                    │  ║
║   └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                           │                                               ║
║                                           │ OR                                            ║
║                                           ▼                                               ║
║   ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║   │                              RAILWAY.APP (Alternative)                              │  ║
║   │                                                                                     │  ║
║   │   URL: https://envirotrace.up.railway.app                                           │  ║
║   │   Auto-scaling with usage-based pricing                                             │  ║
║   │   Built-in PostgreSQL addon support                                                 │  ║
║   └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                            ║
║   ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║   │                              DATABASE (PostgreSQL)                                  │  ║
║   │                                                                                     │  ║
║   │   Options:                                                                          │  ║
║   │   ├── Render PostgreSQL                                                             │  ║
║   │   ├── Railway PostgreSQL                                                            │  ║
║   │   ├── Supabase (managed PostgreSQL + extras)                                        │  ║
║   │   └── Neon (serverless PostgreSQL)                                                  │  ║
║   │                                                                                     │  ║
║   │   Version: PostgreSQL 15                                                            │  ║
║   │   Features: UUID extension, multiple schemas                                        │  ║
║   └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                            ║
║   ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║   │                           WEB CLIENT HOSTING                                        │  ║
║   │                                                                                     │  ║
║   │   Options:                                                                          │  ║
║   │   ├── Vercel (recommended for Vite/React)                                           │  ║
║   │   ├── Netlify                                                                       │  ║
║   │   ├── Cloudflare Pages                                                              │  ║
║   │   └── GitHub Pages (static only)                                                    │  ║
║   │                                                                                     │  ║
║   │   Build Output: client/dist/                                                        │  ║
║   │   SPA Routing: _redirects or vercel.json                                            │  ║
║   └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                            ║
║   ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║   │                          MOBILE APP DISTRIBUTION                                    │  ║
║   │                                                                                     │  ║
║   │   ┌─────────────────────────┐    ┌─────────────────────────┐                       │  ║
║   │   │   Google Play Store     │    │    Apple App Store      │                       │  ║
║   │   │                         │    │                         │                       │  ║
║   │   │   Package:              │    │   Bundle ID:            │                       │  ║
║   │   │   com.epnro.govemission │    │   com.epnro.govemission │                       │  ║
║   │   │                         │    │                         │                       │  ║
║   │   │   Build: EAS Build      │    │   Build: EAS Build      │                       │  ║
║   │   │   Submit: EAS Submit    │    │   Submit: EAS Submit    │                       │  ║
║   │   └─────────────────────────┘    └─────────────────────────┘                       │  ║
║   └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                            ║
║   ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║   │                         DESKTOP APP DISTRIBUTION                                    │  ║
║   │                                                                                     │  ║
║   │   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐                    │  ║
║   │   │    Windows      │  │     macOS       │  │     Linux       │                    │  ║
║   │   │                 │  │                 │  │                 │                    │  ║
║   │   │  • MSI (WiX)    │  │  • DMG          │  │  • AppImage     │                    │  ║
║   │   │  • NSIS .exe    │  │  • .app bundle  │  │  • .deb         │                    │  ║
║   │   │                 │  │                 │  │  • .rpm         │                    │  ║
║   │   │  Distribution:  │  │  Distribution:  │  │  Distribution:  │                    │  ║
║   │   │  GitHub Release │  │  GitHub Release │  │  GitHub Release │                    │  ║
║   │   │  Website DL     │  │  Website DL     │  │  Flathub        │                    │  ║
║   │   └─────────────────┘  └─────────────────┘  └─────────────────┘                    │  ║
║   └────────────────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║                                   DEVELOPMENT ENVIRONMENT                                  ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                            ║
║   ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║   │                          LOCAL DEVELOPMENT (Docker)                                 │  ║
║   │                                                                                     │  ║
║   │   docker-compose.yml                                                                │  ║
║   │   ┌─────────────────────────────────────────────────────────────────────────────┐  │  ║
║   │   │                                                                              │  │  ║
║   │   │   ┌─────────────────────┐        ┌─────────────────────┐                    │  │  ║
║   │   │   │  envirotrace-backend│        │   envirotrace-db    │                    │  │  ║
║   │   │   │                     │        │                     │                    │  │  ║
║   │   │   │  FastAPI + Uvicorn  │◄──────►│  PostgreSQL 15      │                    │  │  ║
║   │   │   │  Port: 8000         │        │  Port: 5432         │                    │  │  ║
║   │   │   │                     │        │                     │                    │  │  ║
║   │   │   │  Hot-reload via     │        │  Volume:            │                    │  │  ║
║   │   │   │  mounted ./app      │        │  postgres_data      │                    │  │  ║
║   │   │   └─────────────────────┘        └─────────────────────┘                    │  │  ║
║   │   │                                                                              │  │  ║
║   │   │   Network: envirotrace-network (bridge)                                      │  │  ║
║   │   └─────────────────────────────────────────────────────────────────────────────┘  │  ║
║   └────────────────────────────────────────────────────────────────────────────────────┘  ║
║                                                                                            ║
║   ┌────────────────────────────────────────────────────────────────────────────────────┐  ║
║   │                          LOCAL DEVELOPMENT (Native)                                 │  ║
║   │                                                                                     │  ║
║   │   Backend:                                                                          │  ║
║   │   └── uvicorn app.main:app --reload --host 0.0.0.0 --port 8000                     │  ║
║   │                                                                                     │  ║
║   │   Client (Web):                                                                     │  ║
║   │   └── npm run dev (localhost:5173)                                                  │  ║
║   │                                                                                     │  ║
║   │   Client (Desktop):                                                                 │  ║
║   │   └── npm run dev:tauri (localhost:8080 + Tauri window)                            │  ║
║   │                                                                                     │  ║
║   │   Mobile:                                                                           │  ║
║   │   └── expo start (Expo Go app or emulator)                                          │  ║
║   └────────────────────────────────────────────────────────────────────────────────────┘  ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝
```

---

### 5. Data Flow & Integration Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATA FLOW ARCHITECTURE                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│    Web Client     │    │  Desktop Client   │    │    Mobile App     │
│   (React/Vite)    │    │  (Tauri/React)    │    │ (React Native)    │
└─────────┬─────────┘    └─────────┬─────────┘    └─────────┬─────────┘
          │                        │                        │
          │ axios                  │ axios                  │ axios
          │ TanStack Query         │ TanStack Query         │ TanStack Query
          │                        │                        │
          └────────────────────────┼────────────────────────┘
                                   │
                         HTTPS / REST API
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │       API Gateway        │
                    │    (FastAPI Router)      │
                    │                          │
                    │   Authentication:        │
                    │   • JWT Bearer Token     │
                    │   • HS256 Algorithm      │
                    │   • 60min expiry         │
                    └────────────┬─────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│   Auth Module   │   │ Emission Module │   │  Tree Module    │
│                 │   │                 │   │                 │
│ • Login/Logout  │   │ • Vehicles      │   │ • Inventory     │
│ • Register      │   │ • Tests         │   │ • Species       │
│ • Token Refresh │   │ • Schedules     │   │ • Projects      │
│ • Sessions      │   │ • Fees          │   │ • Planting      │
└────────┬────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    SQLAlchemy Async Session
                               │
                               ▼
              ┌────────────────────────────────┐
              │      PostgreSQL Database       │
              │                                │
              │  ┌──────────┐ ┌──────────┐    │
              │  │  auth    │ │ emission │    │
              │  │  schema  │ │  schema  │    │
              │  └──────────┘ └──────────┘    │
              │  ┌──────────┐ ┌──────────┐    │
              │  │ belching │ │  urban_  │    │
              │  │  schema  │ │ greening │    │
              │  └──────────┘ └──────────┘    │
              └────────────────────────────────┘
                               │
                               │ (Optional)
                               ▼
              ┌────────────────────────────────┐
              │     External Integrations      │
              │                                │
              │  ┌──────────────────────────┐  │
              │  │       Supabase           │  │
              │  │  • Storage (images)      │  │
              │  │  • Realtime              │  │
              │  │  • Auth (optional)       │  │
              │  └──────────────────────────┘  │
              │                                │
              │  ┌──────────────────────────┐  │
              │  │     Google Gemini AI     │  │
              │  │  • gemini-2.0-flash-lite │  │
              │  │  • OCR processing        │  │
              │  │  • Image analysis        │  │
              │  └──────────────────────────┘  │
              └────────────────────────────────┘
```

---

### 6. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   SECURITY ARCHITECTURE                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT SECURITY                                            │
│                                                                                              │
│   Web Client:                                                                                │
│   ├── HTTPS only (TLS 1.2+)                                                                 │
│   ├── HttpOnly cookies for refresh tokens                                                   │
│   ├── localStorage for access tokens (short-lived)                                          │
│   └── CSP headers (when deployed)                                                           │
│                                                                                              │
│   Desktop Client (Tauri):                                                                   │
│   ├── WebView2 sandboxing                                                                   │
│   ├── @tauri-apps/plugin-store for secure local storage                                     │
│   └── Code signing for distribution                                                         │
│                                                                                              │
│   Mobile Client:                                                                            │
│   ├── expo-secure-store (Keychain/Keystore)                                                 │
│   ├── Certificate pinning (network security config)                                         │
│   ├── usesCleartextTraffic: false                                                           │
│   └── Encrypted SQLite for offline data                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   API SECURITY                                               │
│                                                                                              │
│   Authentication:                                                                            │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                           JWT Token Flow                                             │   │
│   │                                                                                      │   │
│   │   1. Client sends credentials → POST /api/v1/auth/login                             │   │
│   │   2. Server validates → returns JWT access token + refresh token                     │   │
│   │   3. Client includes token → Authorization: Bearer <token>                           │   │
│   │   4. Server validates token → extracts user_id, role                                 │   │
│   │   5. Token expires → use refresh token or re-authenticate                            │   │
│   │                                                                                      │   │
│   │   Token Config:                                                                      │   │
│   │   ├── Algorithm: HS256                                                               │   │
│   │   ├── Expiry: 60 minutes (ACCESS_TOKEN_EXPIRE_MINUTES)                              │   │
│   │   └── Secret: Environment variable (SECRET_KEY)                                      │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
│   Authorization:                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                        Role-Based Access Control (RBAC)                              │   │
│   │                                                                                      │   │
│   │   Roles:                                                                             │   │
│   │   ├── admin              → Full system access                                        │   │
│   │   ├── tree_management    → Tree inventory, species, projects                         │   │
│   │   ├── government_emission→ Vehicle testing, emissions, fees                          │   │
│   │   └── air_quality        → Air quality monitoring                                    │   │
│   │                                                                                      │   │
│   │   Enforcement:                                                                       │   │
│   │   ├── API: Dependency injection (deps.py)                                            │   │
│   │   └── Client: Route guards (requireAuth, requireRole)                                │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
│   CORS Configuration:                                                                        │
│   ├── Allowed Origins: localhost:3000, localhost:5173, localhost:8080                       │
│   ├── Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS                                       │
│   └── Headers: Authorization, Content-Type                                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  DATABASE SECURITY                                           │
│                                                                                              │
│   Connection:                                                                                │
│   ├── SSL/TLS encrypted connections                                                         │
│   ├── Connection pooling (asyncpg)                                                          │
│   └── Environment-based credentials                                                         │
│                                                                                              │
│   Data Protection:                                                                           │
│   ├── Password hashing: bcrypt (passlib)                                                    │
│   ├── Schema separation for data isolation                                                  │
│   ├── UUID primary keys (non-guessable)                                                     │
│   └── Soft deletes (audit trail)                                                            │
│                                                                                              │
│   Supabase Integration (if enabled):                                                        │
│   ├── Row Level Security (RLS) policies                                                     │
│   ├── Service role key (server-only)                                                        │
│   └── Anon key (client-facing, limited)                                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 7. CI/CD Pipeline (Recommended)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CI/CD PIPELINE                                            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   GitHub Repository                                          │
│                                    (Monorepo)                                                │
│                                                                                              │
│   Branches:                                                                                  │
│   ├── main (production)                                                                     │
│   ├── develop (staging)                                                                     │
│   └── feature/* (development)                                                              │
└──────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                           │
                                      git push
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               GitHub Actions Workflows                                       │
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              Backend Pipeline                                        │   │
│   │                                                                                      │   │
│   │   Trigger: push to backend/**                                                        │   │
│   │                                                                                      │   │
│   │   ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐    ┌───────┐                     │   │
│   │   │ Lint  │───►│ Test  │───►│ Build │───►│ Push  │───►│Deploy │                     │   │
│   │   │ ruff  │    │pytest │    │Docker │    │ Image │    │Render │                     │   │
│   │   └───────┘    └───────┘    └───────┘    └───────┘    └───────┘                     │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              Client Pipeline                                         │   │
│   │                                                                                      │   │
│   │   Trigger: push to client/**                                                         │   │
│   │                                                                                      │   │
│   │   ┌───────┐    ┌───────┐    ┌───────┐    ┌───────────────────────┐                  │   │
│   │   │ Lint  │───►│ Test  │───►│ Build │───►│       Deploy          │                  │   │
│   │   │eslint │    │ jest  │    │ vite  │    │  Vercel / Netlify     │                  │   │
│   │   └───────┘    └───────┘    └───────┘    └───────────────────────┘                  │   │
│   │                                    │                                                 │   │
│   │                                    ├──► Tauri Build (Windows/macOS/Linux)           │   │
│   │                                    └──► GitHub Releases (desktop installers)         │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                              Mobile Pipeline                                         │   │
│   │                                                                                      │   │
│   │   Trigger: push to mobile/**                                                         │   │
│   │                                                                                      │   │
│   │   ┌───────┐    ┌───────┐    ┌─────────────────────────────────────────┐             │   │
│   │   │ Lint  │───►│ Test  │───►│           EAS Build                     │             │   │
│   │   │eslint │    │ jest  │    │                                         │             │   │
│   │   └───────┘    └───────┘    │  ┌─────────────┐    ┌─────────────┐    │             │   │
│   │                             │  │   Android   │    │     iOS     │    │             │   │
│   │                             │  │    APK/AAB  │    │     IPA     │    │             │   │
│   │                             │  └──────┬──────┘    └──────┬──────┘    │             │   │
│   │                             └─────────┼──────────────────┼───────────┘             │   │
│   │                                       │                  │                          │   │
│   │                                       ▼                  ▼                          │   │
│   │                              ┌─────────────┐    ┌─────────────┐                     │   │
│   │                              │ Play Store  │    │ App Store   │                     │   │
│   │                              │ (TestFlight)│    │ (TestFlight)│                     │   │
│   │                              └─────────────┘    └─────────────┘                     │   │
│   └─────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Environment Variables Summary

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/envirotrace

# Security
SECRET_KEY=your-256-bit-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Supabase (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services (Optional)
GOOGLE_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash-lite

# CORS
BACKEND_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Client (.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile (app.json extra)

```json
{
  "extra": {
    "apiUrl": "https://envirotrace.up.railway.app/api/v1"
  }
}
```

---

## Quick Reference: Ports & URLs

| Component       | Development URL                         | Production URL                |
| --------------- | --------------------------------------- | ----------------------------- |
| Backend API     | `http://localhost:8000`                 | `https://api.envirotrace.com` |
| API Docs        | `http://localhost:8000/api/docs`        | `/api/docs`                   |
| Web Client      | `http://localhost:5173`                 | `https://envirotrace.com`     |
| Tauri Dev       | `https://localhost:8080`                | N/A (Desktop app)             |
| PostgreSQL      | `localhost:5432`                        | Managed service               |
| Expo Dev Server | `exp://192.168.x.x:19000`               | N/A                           |
| Mobile API      | Configured in app.json                  | Railway URL                   |

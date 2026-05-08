# ExamMania 🎓

> **Bangladesh's premier academic exam platform** — timed practice exams for Science, Commerce, and Arts students with instant feedback, progress tracking, and an admin console.

[![CI](https://github.com/your-org/exammania/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/exammania/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Quick Start (Docker)](#quick-start-docker)
5. [Environment Variables](#environment-variables)
6. [Google OAuth Setup](#google-oauth-setup)
7. [Running Locally (without Docker)](#running-locally-without-docker)
8. [Database](#database)
9. [Testing](#testing)
10. [Linting & Formatting](#linting--formatting)
11. [API Documentation](#api-documentation)
12. [Bulk Question Import (CSV)](#bulk-question-import-csv)
13. [Internationalisation](#internationalisation)
14. [CI/CD Pipeline](#cicd-pipeline)
15. [Deployment](#deployment)
16. [Architecture Decisions](#architecture-decisions)
17. [Security](#security)

---

## Overview

ExamMania provides:

- **Google-only authentication** via OAuth 2.0 (JWT in httpOnly Secure SameSite=Strict cookie)
- **Three academic divisions** — Science, Commerce, Arts — each with division-specific and common subjects (English, Bangla, ICT)
- **Timed exam flow** — start → auto-save answers → pause/resume → submit or auto-submit on expiry
- **Instant results** — per-question feedback with correct-answer reveal and score history chart
- **Admin console** — full CRUD for divisions/subjects/exams/questions, bulk CSV import, analytics dashboard
- **Bilingual UI** — English and Bangla (বাংলা), dark-mode toggle, WCAG 2.1 AA accessibility

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Data fetching | SWR |
| Forms | React Hook Form |
| i18n | i18next + react-i18next |
| Charts | Chart.js + react-chartjs-2 |
| Icons | Heroicons |
| Backend | Node.js 20, Express, TypeScript |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Validation | Zod |
| Auth | google-auth-library + jsonwebtoken |
| Logging | Winston |
| API docs | Swagger UI (swagger-jsdoc) |
| Testing (server) | Jest + Supertest |
| Testing (client) | Jest + React Testing Library |
| E2E | Cypress |
| DevOps | Docker Compose, GitHub Actions |
| Deploy | Vercel (client) + Railway (server) |

---

## Project Structure

```
exammania/
├── client/                  # Next.js frontend
│   ├── i18n/                # Translation files (en.json, bn.json)
│   ├── public/              # Static assets
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── lib/             # API client, auth context, i18n, theme
│       ├── pages/           # Next.js pages (file-based routing)
│       ├── styles/          # Global CSS
│       ├── types/           # TypeScript interfaces
│       └── __tests__/       # Jest + RTL tests
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # Prisma data model
│   │   ├── seed.ts          # Database seed
│   │   └── migrations/      # SQL migration history
│   └── src/
│       ├── config/          # Env validation
│       ├── middleware/       # Auth, error handler, rate limiter
│       ├── routes/          # Express route handlers
│       ├── services/        # Business logic (auth, exam, admin)
│       ├── types/           # Shared TypeScript types
│       ├── utils/           # Logger, Swagger spec
│       └── __tests__/       # Jest + Supertest tests
├── cypress/                 # Cypress E2E tests
│   ├── e2e/
│   └── support/
├── .github/workflows/       # GitHub Actions CI/CD
├── docker-compose.yml       # Local dev orchestration
├── sample-import.csv        # Example bulk import CSV
└── .env.example             # Environment template
```

---

## Quick Start (Docker)

### Prerequisites

- Docker ≥ 24 and Docker Compose V2
- A Google OAuth Client ID/Secret (see [Google OAuth Setup](#google-oauth-setup))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/exammania.git
cd exammania

# 2. Copy and populate the environment file
cp .env.example .env
# Edit .env and fill in GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET

# 3. Build and start all services
docker compose up --build

# 4. Open in your browser
open http://localhost:3000        # Frontend
open http://localhost:4000/api-docs  # Swagger UI
```

The first run will:
1. Start PostgreSQL and wait for it to be healthy
2. Start the server, run Prisma migrations, and seed initial data (3 divisions, subjects, 1 sample exam)
3. Start the Next.js frontend

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description | Required |
|---|---|---|
| `POSTGRES_USER` | PostgreSQL username | Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password | Yes |
| `POSTGRES_DB` | PostgreSQL database name | Yes |
| `DATABASE_URL` | Full Prisma connection URL | Yes |
| `JWT_SECRET` | ≥32-char secret for JWT signing | Yes |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | Yes |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | Yes |
| `CLIENT_URL` | Frontend origin (for CORS) | Yes |
| `NEXT_PUBLIC_API_URL` | API base URL (client-side) | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Client ID (public) | Yes |

Generate a strong `JWT_SECRET`:
```bash
openssl rand -base64 64
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select an existing one)
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Set **Application type** to **Web application**
5. Add **Authorized JavaScript origins**:
   - `http://localhost:3000` (development)
   - `https://exammania.com` (production)
6. Add **Authorized redirect URIs** (only needed for server-side callback flows — our flow uses the GSI popup, so this is optional):
   - `http://localhost:4000/api/auth/google/callback`
7. Copy the **Client ID** → `GOOGLE_CLIENT_ID` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
8. Copy the **Client Secret** → `GOOGLE_CLIENT_SECRET`

---

## Running Locally (without Docker)

You need Node.js 20 and a running PostgreSQL instance.

```bash
# ─── Server ─────────────────────────────────
cd server
npm install
cp ../.env.example .env        # edit as needed
npx prisma generate
npx prisma migrate deploy
npx ts-node prisma/seed.ts     # optional: seed initial data
npm run dev                    # starts on :4000

# ─── Client (new terminal) ──────────────────
cd client
npm install
npm run dev                    # starts on :3000
```

---

## Database

ExamMania uses **Prisma ORM** with **PostgreSQL**.

```bash
# Generate Prisma client (after schema changes)
cd server && npm run db:generate

# Create a new migration
npm run db:migrate

# Apply pending migrations (production)
npm run db:migrate:prod

# Open Prisma Studio (GUI)
npm run db:studio

# Reset DB and re-seed (⚠️ destructive)
npm run db:reset
```

### Models

| Model | Description |
|---|---|
| `User` | Authenticated user (Google OAuth) |
| `Division` | Science / Commerce / Arts |
| `Subject` | Physics, Chemistry … English (isCommon) |
| `Exam` | Belongs to a subject; has time limit, randomize flag |
| `Question` | MCQ / TRUE_FALSE / SHORT_ANSWER |
| `Attempt` | A student's exam session |
| `AttemptAnswer` | Per-question answer + evaluation result |
| `AuditLog` | Admin action trail |

---

## Testing

### Server (Jest + Supertest)

```bash
cd server

# Run all tests
npm test

# Run with coverage (≥80% required by CI)
npm run test:ci

# Watch mode
npm run test:watch
```

Test files live in `server/src/__tests__/`:
- `auth.test.ts` — JWT signing, cookie options, Google token verification
- `exam.test.ts` — startAttempt, saveAnswer, submitAttempt, evaluation logic
- `admin.test.ts` — createDivision, bulkImportQuestions, getAnalytics, auditLog
- `routes.test.ts` — HTTP integration tests via Supertest (health, auth, divisions, admin guards)

### Client (Jest + React Testing Library)

```bash
cd client

# Run all tests
npm test

# With coverage
npm run test:ci
```

Test files live in `client/src/__tests__/`:
- `components/ui.test.tsx` — ProgressBar, Button, Badge, Modal, QuestionCard, Skeleton

### E2E (Cypress)

```bash
# Ensure the app is running locally first
docker compose up          # or npm run dev in both /server and /client

# Open Cypress interactive mode
npx cypress open

# Run headlessly (CI)
npx cypress run
```

The E2E spec `cypress/e2e/student-exam-flow.cy.ts` covers:
- Landing → Division → Subject navigation
- Full exam flow: start → answer MCQ/TRUE_FALSE/SHORT_ANSWER → confirm submit
- Result page: score display, question review, retake link

---

## Linting & Formatting

```bash
# Server
cd server
npm run lint          # ESLint (Airbnb + TypeScript)
npm run lint:fix      # Auto-fix
npm run format        # Prettier

# Client
cd client
npm run lint          # Next.js ESLint (Airbnb + TypeScript + a11y)
npm run lint:fix
npm run format
```

---

## API Documentation

The server serves a **Swagger UI** at:

```
http://localhost:4000/api-docs
```

All endpoints are documented with OpenAPI 3.0 annotations in the route files.

### Key Endpoints

```
# Auth
POST   /api/auth/google          Verify Google ID token → set JWT cookie
POST   /api/auth/logout          Clear cookie
GET    /api/auth/me              Current user

# Divisions & Subjects
GET    /api/divisions                      List all divisions
GET    /api/divisions/:slug/subjects       Subjects for a division + common

# Exams
GET    /api/subjects/:slug/exams   Published exams for a subject
GET    /api/exams/:slug            Exam with questions (no correct answers)
POST   /api/exams/:slug/start      Create Attempt → returns attempt ID

# Attempts
GET    /api/attempts/:id           Attempt state (for resume)
PUT    /api/attempts/:id/save      Auto-save a single answer
POST   /api/attempts/:id/submit    Evaluate + mark complete
GET    /api/attempts/:id/result    Full result with per-question feedback

# Users
GET    /api/users/me               Profile
GET    /api/users/:id/history      Completed attempts

# Admin (requires role=ADMIN)
GET    /api/admin/analytics
POST   /api/admin/divisions
PUT    /api/admin/divisions/:id
DELETE /api/admin/divisions/:id
POST   /api/admin/subjects
PUT    /api/admin/subjects/:id
POST   /api/admin/exams
PUT    /api/admin/exams/:id
DELETE /api/admin/exams/:id
POST   /api/admin/exams/:slug/questions
PUT    /api/admin/questions/:id
DELETE /api/admin/questions/:id
POST   /api/admin/exams/:slug/import   CSV bulk import (multipart/form-data)
GET    /api/admin/users

# Health
GET    /health
GET    /api-docs
```

---

## Bulk Question Import (CSV)

Upload questions in bulk via the Admin panel or directly via API:

```bash
curl -X POST http://localhost:4000/api/admin/exams/physics-ch1-mcq/import \
  -H "Cookie: token=<your-admin-jwt>" \
  -F "file=@sample-import.csv"
```

### CSV Format

| Column | Values |
|---|---|
| `question` | Question text |
| `type` | `MCQ` / `TRUE_FALSE` / `SHORT_ANSWER` |
| `options` | Pipe-separated options, e.g. `Newton\|Joule\|Watt` |
| `correct` | Zero-based index for MCQ/TRUE_FALSE, or partial text for SHORT_ANSWER |
| `marks` | Integer point value |

See `sample-import.csv` for a working example.

---

## Internationalisation

All static strings are stored in:

```
client/i18n/en.json   # English
client/i18n/bn.json   # বাংলা (Bangla)
```

Language is detected from `localStorage` → browser `Accept-Language`, with a fallback to English. Users can switch language via the Navbar toggle.

To add a new language:
1. Create `client/i18n/<code>.json` with all keys from `en.json`
2. Add the language code to `supportedLngs` in `client/src/lib/i18n.ts`
3. Add the toggle option in `Navbar.tsx`

---

## CI/CD Pipeline

`.github/workflows/ci.yml` runs on every push and PR:

```
Lint (server + client)
    ↓
Test server (Jest, coverage ≥80%, with PostgreSQL service container)
    ↓
Test client (Jest + RTL)
    ↓
Build Docker images (push to GHCR)  ← push only
    ↓
Deploy to Vercel (client) + Railway (server)  ← main branch only
    ↓
Health check (curl production API)
```

---

## Deployment

### Frontend → Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd client
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.exammania.com
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=<your-client-id>
```

### Backend → Railway

1. Create a new Railway project
2. Add a **PostgreSQL** plugin
3. Deploy the `server/` directory
4. Set environment variables in Railway dashboard (copy from `.env.example`)
5. Railway auto-detects Dockerfile and runs `prisma migrate deploy && node dist/index.js`

### Production checklist

- [ ] Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in both Vercel and Railway
- [ ] Set `JWT_SECRET` to a strong random value (`openssl rand -base64 64`)
- [ ] Update `CLIENT_URL` in Railway to `https://exammania.com`
- [ ] Add `https://exammania.com` to Google OAuth **Authorized JavaScript origins**
- [ ] Enable HTTPS on both services (automatic on Vercel/Railway)

---

## Architecture Decisions

- **JWT in httpOnly cookie** instead of localStorage: prevents XSS token theft
- **Prisma over raw SQL**: type-safe queries, auto-generated client, migration history
- **SWR over React-Query**: lighter bundle, sufficient for this read-heavy app
- **Zod on both client and server**: single source of truth for validation, shared logic
- **Exam evaluation server-side**: correct answers are never sent to the browser until after submission
- **Auto-save with debounce (800ms)**: reduces API calls without sacrificing data integrity
- **CSV import via multer + csv-parse**: streams large files without loading into memory

---

## Security

| Measure | Implementation |
|---|---|
| HTTPS only | Enforced by Vercel/Railway TLS; `secure: true` cookie in production |
| CORS | Limited to `CLIENT_URL` env var |
| Rate limiting | 100 req/min globally; 20 req/15min on auth endpoints |
| Input validation | Zod schemas on every POST/PUT route |
| SQL injection | Prevented by Prisma parameterised queries |
| XSS | `httpOnly` cookie; Next.js auto-escapes JSX |
| Security headers | Helmet (CSP, X-Content-Type-Options, Referrer-Policy, etc.) |
| Admin access | `requireAdmin` middleware checks `user.role === 'ADMIN'` |
| Audit log | Every admin CREATE/UPDATE/DELETE is recorded in `audit_logs` |
| Correct answer protection | Answer keys stripped from exam payload; only revealed post-submission |

---

## License

MIT © 2024 ExamMania Team

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack TypeScript social network monorepo with two top-level directories:
- `bento-microservices-express/` — Express.js backend API
- `bento-social-next/` — Next.js 14 frontend

## Commands

### Backend (`bento-microservices-express/`)

```bash
npm run dev        # Start development server (nodemon + ts-node)
npm run build      # Compile TypeScript to dist/
npm run seed       # Seed the database

npx prisma migrate dev --name <name>   # Create and apply a migration
npx prisma generate                    # Regenerate Prisma client after schema changes
npx prisma studio                      # Open visual database browser
```

### Frontend (`bento-social-next/`)

```bash
npm run dev        # Start dev server on port 3001
npm run build      # Production build
npm run lint       # ESLint
npm run format     # Prettier
```

### Docker / Full Stack

```bash
# From bento-microservices-express/
docker-compose up -d    # Start MySQL (port 3307) and Redis (port 6379)
docker-compose down

# Windows one-command startup from project root:
start-localhost.bat     # Starts Docker, runs migrations, launches both servers
```

**Service URLs:** Backend `http://localhost:3000`, Frontend `http://localhost:3001`

### API Testing

No automated test suite. Use the included Postman collections at the repo root:
- `Social-500bros.postman_collection.json`
- `Social-Bento.postman_collection.json`

## Architecture

### Backend Module Pattern

The backend is a monolith organized into 13 domain modules under `src/modules/`. Each module follows the same layered structure:

```
modules/<domain>/
├── infras/
│   ├── repository/       # Prisma data access
│   ├── services/         # External services (email, etc.)
│   └── transport/        # Express routes + Redis consumers
├── usecase/              # Business logic
├── interface/            # TypeScript interfaces & DTOs
├── model/                # Data models
└── module.ts             # TSyringe DI wiring
```

**Data flow:** HTTP route → Controller → UseCase → Repository → Prisma/MySQL

TSyringe handles dependency injection. Redis is used both for pub/sub events (async operations like notifications) and caching. Socket.io runs on the same process for real-time features (chat, notifications).

The `/v1/rpc/introspect` endpoint centralizes JWT validation — other services call this for token verification instead of each holding the JWT secret.

### Frontend Structure

Next.js App Router (`src/app/`). Key directories:
- `src/apis/` — Axios API client functions (one file per domain)
- `src/hooks/` — Custom React hooks (mostly wrapping React Query)
- `src/components/` — Reusable components
- `src/sections/` — Page-level sections
- `src/schema/` — Zod validation schemas shared with forms

React Query manages server state. React Hook Form + Zod handles form validation.

### Key Config Files

- `bento-microservices-express/prisma/schema.prisma` — Full data model (13+ models)
- `bento-microservices-express/docker-compose.yml` — MySQL + Redis services
- `bento-microservices-express/.env.example` — Required environment variables
- `bento-social-next/.env.example` — `NEXT_PUBLIC_API_DOMAIN` must point to backend

### Path Alias

Both projects use `@/*` → `src/*`.

## Known Open Issues (from PLAN.md)

- Missing `/v1/topics/search` endpoint
- `PUT /v1/users/profile` avatar upload incomplete
- Password reset routes exist but email service not fully integrated
- Theme/settings persistence not implemented
- Unresolved git merge conflicts in `bento-microservices-express/package.json` and `.env.example`

# `bento-social-network` Codebase Map

> **Core Dependency Tracking**: Use this map to safely make file modifications without breaking systemic assumptions.

## Monorepo Architecture

This project employs a flattened monorepo-style structure containing both React and Express applications, sharing local execution shell scripts.

### 1. Root Scripts (`/`)
- **`start-localhost.bat` / `start-network.bat`**: Primary execution entry points. Bootstraps Docker `docker-compose.yml`, migrates environment variables, and calls `yarn dev`. 
- **`stop.bat` / `restore-env.bat`**: Tears down runtime environments.

### 2. Frontend Application (`/bento-social-next`)
- **Framework**: Next.js 14, React 18, TailwindCSS.
- **Entry Points**: `src/app/` (App router concepts/pages).
- **Service Layer (`src/apis/`)**: Axios-based methods grouped by entity (e.g. `conversation.ts`). Bound tightly to `src/utils/axios.ts` which handles interceptor retries and URL configurations.
- **UI Architecture (`src/components/` & `src/sections/`)**: Shared reusable components vs page-specific compositional sections.

### 3. Backend Application (`/bento-microservices-express`)
- **Framework**: Express + TypeScript + Prisma.
- **Entry Point**: `src/index.ts` / `src/server.ts`.
- **Module Structure (`src/modules/*`)**: Self-contained business domains (user, post, conversation).
- **Database**: Defined strictly by `prisma/schema.prisma`. 

### 4. Database Lifecycle (`/sync-db`)
- Handled outside the application via `sync-db/export-db.bat` and `sync-db/import-db.bat`.
- Relies directly on the `mysql-bento` container from Docker.

## Agent System Rules
Scripts rely intensely on `.env` existence. Modifying database credentials inside docker dictates modifying the backend `.env` variables simultaneously for database URLs.

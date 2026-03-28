# Docker Architecture — bento-microservices-express

> Complete database design, configuration details, and infrastructure overview for **Social-network-500bros**.

---

## 🏗️ Full Infrastructure Design

This microservices application utilizes a containerized architecture powered by Docker Compose. The stateful services (MySQL and Redis) run isolated within a custom Docker bridge network, providing reliable persistence and high-performance caching to the Express application and Prisma ORM.

```mermaid
graph TB
    subgraph HOST["🖥️ Host Machine (your laptop)"]
        ENV["bento-microservices-express/.env\n(environment secrets)"]
        APP["Express App\npnpm dev — port 3000"]
        PRISMA["Prisma ORM\n(schema.prisma)"]
        APP --> PRISMA
    end

    subgraph DOCKER["🐋 Docker Compose — 'social' bridge network"]
        subgraph MYSQL_BOX["mysql-bento (MySQL 8.0)"]
            MYSQL_IMG["Build from ./mysql\nCustom my.cnf tuning"]
            MYSQL_INIT["docker-entrypoint-initdb.d/\n(social_network_dump.sql)"]
            MYSQL_DB[("Database:\nlongvo_dev")]
            MYSQL_IMG --> MYSQL_INIT --> MYSQL_DB
        end

        subgraph REDIS_BOX["redis (Redis 6.0)"]
            REDIS_IMG["redis:6.0 official\nCustom redis.conf"]
            REDIS_DATA[("Cache / Sessions")]
            REDIS_IMG --> REDIS_DATA
        end

        VOL_MYSQL[("📀 social_mysql\n(Persistent Volume)")]
        VOL_REDIS[("📀 redis-bento\n(Persistent Volume)")]
        
        MYSQL_DB --- VOL_MYSQL
        REDIS_DATA --- VOL_REDIS
    end

    ENV -->|"Configures"| PRISMA
    ENV -->|"Injected into"| MYSQL_BOX
    ENV -->|"Injected into"| REDIS_BOX
    
    PRISMA -->|"localhost:3306\nDATABASE_URL"| MYSQL_DB
    APP -->|"localhost:6379\nREDIS_PASSWORD"| REDIS_DATA
```

---

## 📂 Configuration Details

The project infrastructure is decoupled into specialized configuration folders. Below is a comprehensive breakdown of each component's setup.

### 1. 🐬 MySQL Configuration (`mysql/` folder)

The primary relational data store is customized for optimal local development performance and robustness.

*   **Docker Image:** Built dynamically using `./mysql/Dockerfile` which inherits from `mysql:8.0`.
*   **Initialization:** On the first boot (when the `social_mysql` volume is empty), MySQL automatically scans the `./docker-entrypoint-initdb.d/` directory. It uses `social_network_dump.sql` to reconstruct the schema (17+ tables, including Users, Posts, Comments, Stories) and populate seed data.
*   **Networking:** Exposed on `localhost:${MYSQL_PORT:-3306}`.
*   **Volumes:** 
    *   Data persistence is handled by the `social_mysql` managed Docker volume.
*   **Resource Limits:** Imposed via Docker Compose deploy restrictions (Memory limited to `512M` / `256M` reservation, CPU limited to `0.5`).

#### `my.cnf` Performance Tuning
A custom `my.cnf` is copied to `/etc/mysql/conf.d/custom.cnf` setting tight but potent optimizations:

| Category | Setting | Value | Impact |
| --- | --- | --- | --- |
| **InnoDB Core** | `innodb_buffer_pool_size` | 256M | Dictates how much memory is reserved for caching data/indexes. Provides fast reads without eating all laptop RAM. |
| **InnoDB Logging** | `innodb_flush_log_at_trx_commit` | 2 | Flushes transaction logs to OS cache rather than disk every commit (better write performance). |
| **Diagnostics** | `performance_schema` | OFF | Eliminates the ~150-200MB memory overhead of performance metric tracking in non-production environments. |
| **Queries** | `max_allowed_packet` | 16M | Allows for bulk inserts (useful during database seeding). |
| **Connections** | `max_connections` | 100 | Caps simultaneous active connections, protecting against connection floods. |

*In addition to `my.cnf`, the `docker-compose.yml` injects runtime tuning via the `command: >` directive for overriding thread caching and connection caps.*

---

### 2. 🟥 Redis Configuration (`redis/` folder)

Redis serves as the high-speed data structure store indicating user sessions, caching features, or real-time pub/sub features.

*   **Docker Image:** Uses the official `redis:6.0` image.
*   **Networking:** Exposed on `localhost:${REDIS_PORT:-6379}`.
*   **Volumes:** Data persistence utilizes the local `redis-bento` Docker volume.
*   **Deploy Limits:** Tightly constrained memory usage defined in Docker Compose (`256M` limit, `128M` reservation).

#### `redis.conf` Configuration Strategy
A customized `redis.conf` is bind-mounted natively into `/usr/local/etc/redis/redis.conf` enforcing exact behavioral policies:

| Policy | Configuration | Details |
| --- | --- | --- |
| **Security** | `requirepass` | Protects the instance with `${REDIS_PASSWORD}` ensuring robust baseline security. Bound to `0.0.0.0` but strictly authenticated. |
| **Memory** | `maxmemory 256mb` | Replicates the Compose cap. Guarantees Redis won't crash the host by silently eating memory. |
| **Eviction** | `allkeys-lru` | If 256MB is reached, Redis evicts the **Least Recently Used** keys globally when adding new data. |
| **Durability (AOF)** | `appendonly yes` | Prioritizes Append-Only File persistence (flushed `everysec`). Prevents catastrophic data loss during hard restarts. |
| **Snapshots (RDB)** | `save 900 1`, etc. | Regular automated point-in-time snapshots to supplement the AOF. |
| **Lazy Freeing** | `lazyfree-lazy-eviction yes` | Ensures large key evictions run asynchronously in a background thread without blocking the main event loop. |

---

### 3. ⬛ Prisma Configuration (`prisma/` folder & base level)

Prisma is **not inside Docker** — it runs on your host machine alongside the Express app. It connects to the containerized MySQL database through the exposed port `3306`.

```text
┌─────────────────────────────────────┐
│  Host Machine                       │
│                                     │
│  Express App (pnpm dev)             │
│    │                                │
│    └── Prisma Client                │
│          │  reads DATABASE_URL      │
│          │  via prisma.config.ts    │
│          │                          │
│          ▼  localhost:3306          │
│  ┌────────────────────────────────┐ │
│  │  Docker Bridge Network         │ │
│  │                                │ │
│  │  mysql-bento:3306              │ │
│  │  Database: longvo_dev          │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### The Connection Chain

**Step 1 — `.env` defines the Database URL:**
```env
# bento-microservices-express/.env
DATABASE_URL="mysql://root:tintin111@localhost:3306/longvo_dev"
```

**Step 2 — `prisma.config.ts` loads the environment (Prisma 7 format):**
For Prisma CLI commands (`pnpm prisma db pull`, `pnpm prisma studio`) to work, the URL must be explicitly provided to the `defineConfig` block using the nested `datasource.url` property:
```typescript
import path from 'node:path'
import dotenv from 'dotenv'
import { defineConfig } from 'prisma/config'

// Explicitly load .env into the process
dotenv.config({ path: path.resolve(__dirname, '.env') })

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
```

**Step 3 — `prisma/schema.prisma` acts as the modeling source of truth:**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```
*   Defines approximately 16 distinct relational models, highly normalized.
*   **Models Included:** `Users`, `Posts`, `Comments`, `Stories`, `ChatRooms`, `ChatMessages`, `StoryViews`, `Followers`, `Notifications`, `Tags`, `Topics`, etc.

**Step 4 — Client Generation:**
Whenever `schema.prisma` is updated or pulled, the binary artifacts are strictly generated:
```bash
pnpm prisma generate   # builds PrismaClient down to node_modules
```

**Step 5 — App imports and queries:**
```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Queries the longvo_dev.users table inside the docker container
const users = await prisma.users.findMany()  
```

---

## 🛠️ Making Database Schema Changes (Adding/Editing Tables)

When you need to alter the database (e.g., add a new table, change a column, delete a field), there are two distinct workflows depending on your preference. **Prisma-Led (Workflow A)** is highly considered the industry standard for TypeScript projects.

### Workflow A: Prisma-Led schema changes (RECOMMENDED)

In this workflow, `schema.prisma` is treated as the single source of truth.

1. **Edit the Schema:** Open `/prisma/schema.prisma` and manually add your new models or change existing fields.
2. **Create a Migration:** Run `pnpm prisma migrate dev --name describe_your_change`.
   * *What it does:* Prisma compares your `schema.prisma` to the running MySQL database, generates a SQL migration file in `prisma/migrations/`, and applies it to the live database inside Docker.
   * *What else it does:* It automatically runs `pnpm prisma generate` to update your TypeScript types.
3. **Commit to Git:** Commit the newly generated `prisma/migrations/` folder and `schema.prisma` file so other developers get the exact same schema changes when they pull your code.

*(Note: Since your database was originally created via a raw SQL dump, the very first time you run `prisma migrate dev`, Prisma may ask you to "baseline" the database to recognize the existing tables.)*

### Workflow B: Database-First changes

In this workflow, the live MySQL database is treated as the source of truth.

1. **Edit the Database:** Connect to your local `localhost:3306` database using a GUI tool (like DataGrip, DBeaver, or TablePlus) and run your `CREATE TABLE` or `ALTER TABLE` SQL commands directly.
2. **Sync Prisma:** Run `pnpm prisma db pull`.
   * *What it does:* Prisma reads the live database limits and updates your `schema.prisma` file automatically to match your manual SQL changes.
3. **Generate Client:** Run `pnpm prisma generate` to update your local Node modules and TypeScript types.
4. **Update the Dump (Crucial!):** Because you didn't create a Prisma migration file, if you ever run `docker compose down -v` (wiping the volume), your DB changes will be lost forever. You MUST export a new SQL dump and overwrite `social_network_dump.sql` to persist these manual changes.

---

## 🔁 First Boot vs Restart Behavior

| Scenario | What Happens |
|---|---|
| **First `docker compose up -d`** | Volumes are empty → MySQL auto-creates `longvo_dev` → runs `social_network_dump.sql` → full schema + seed data loaded into InnoDB. |
| **Restart (`docker compose down` then `up -d`)** | Volumes exist → MySQL skips initialization logic entirely and restores states directly. |
| **Hard Reset (`docker compose down -v`)** | **DESTRUCTIVE:** Deletes `social_mysql` and `redis-bento`. Next `up -d` forces a ground-up SQL initialization. |

---

## 🚀 Quick Reference Commands

```bash
# ── Container Orchestration ──────────────────────────────────────────
pnpm run docker:up        # (If mapped in package.json) or: docker compose up -d
docker compose down       # Stop services (preserve data)
docker compose down -v    # Stop services & WIPE database (full reset)
docker compose logs -f    # Tail combined logs locally

# ── Prisma Operations ────────────────────────────────────────────────
pnpm prisma db pull       # Introspect live MySQL and update schema.prisma
pnpm prisma generate      # Generate the TypeScript Client (Required after pull)
pnpm prisma studio        # Launch local web visualizer for the data rows
```

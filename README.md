# Real Estate Investment Analyzer

A web application for analyzing and comparing German real estate investments.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, Express, TypeScript, Prisma
- **Database**: PostgreSQL
- **Monorepo**: pnpm workspaces

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for PostgreSQL)

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

### 3. Set up environment variables

```bash
# Backend
cp apps/backend/.env.example apps/backend/.env

# Frontend
cp apps/frontend/.env.example apps/frontend/.env.local
```

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Start development servers

```bash
pnpm dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project Structure

```
├── apps/
│   ├── backend/          # NestJS API
│   │   ├── src/
│   │   │   └── constants/  # App constants (tax rates, etc.)
│   │   └── prisma/       # Database schema & migrations (single source of truth for types)
│   └── frontend/         # Next.js app
│       └── src/
├── docs/                 # Design documentation
├── docker-compose.yml    # PostgreSQL for local dev
└── package.json          # Root workspace config
```

**Note**: Types are generated from Prisma schema. No separate shared package needed.

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Documentation

See the `docs/` folder for:
- Phase 2: Domain Model
- Phase 3: API Design
- Phase 4: UI Design

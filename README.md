# Real-Time Todo App

A real-time todo app built on TanStack Start + Electric SQL. Todos are persisted to Postgres and sync between browser tabs in real-time via Electric shapes.

## Stack

- **Framework**: TanStack Start (React, SSR, file-based routing)
- **Sync**: Electric SQL shapes → TanStack DB collections → `useLiveQuery`
- **Database**: Postgres with Drizzle ORM
- **Styling**: Tailwind CSS + Radix Themes

## Setup

### Prerequisites

- Node.js 18+
- pnpm
- Postgres database
- Electric SQL (local Docker or Electric Cloud)

### Environment Variables

Copy `.env.example` to `.env` and set:

```
DATABASE_URL=postgresql://user:password@localhost:5432/mydb
ELECTRIC_URL=http://localhost:3000       # local Electric
# OR for Electric Cloud:
ELECTRIC_SOURCE_ID=your-source-id
ELECTRIC_SOURCE_SECRET=your-secret
```

### Install & Migrate

```bash
pnpm install
pnpm generate   # generate Drizzle migration
pnpm migrate    # apply migration to Postgres
```

### Run

```bash
pnpm dev        # starts on http://localhost:5174
```

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

## Features

- Add todos via input field (Enter key or Add button)
- Toggle completion with checkbox (strikethrough on completed items)
- Delete todos with the Delete button
- Real-time sync between browser tabs via Electric shapes

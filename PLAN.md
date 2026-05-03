# Plan: Real-Time Todo App

A real-time todo app built on TanStack Start + Electric SQL that persists todos to Postgres and syncs changes between browser tabs in real-time via Electric shapes.

## User Flows

1. User opens the app and sees a list of all todos, synced in real-time.
2. User types text in an input field and presses Enter (or clicks Add) to create a new todo.
3. User clicks a checkbox on a todo row to toggle its `completed` state.
4. User clicks a delete button on a todo row to remove that todo.
5. Changes made in one tab appear instantly in all other open tabs via Electric sync.

## Data Model

```ts
// src/db/schema.ts
import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: uuid("id").primaryKey().defaultRandom(),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

## Key Technical Decisions

- **Schema**: Single `todos` table exactly as specified. No auth, no soft deletes.
- **Sync**: Electric shape proxy at `src/routes/api/todos.ts` (GET) forwards shape requests to Electric Cloud. The client subscribes via a TanStack DB Electric collection.
- **Collection**: `src/db/collections/todos.ts` — Electric collection keyed by `id`, ordered by `created_at` ascending.
- **Mutations**: Three API handlers (`POST /api/todos`, `PUT /api/todos`, `DELETE /api/todos`) perform Drizzle inserts/updates/deletes. The collection's `onInsert/onUpdate/onDelete` callbacks call these endpoints; Electric shape propagates the change back to all tabs.
- **UI**: Single page `src/routes/index.tsx` with `ssr: false`. Uses `useLiveQuery` over the todos collection. Renders an input bar at the top and a scrollable list below; each row has a checkbox (toggle completed), the todo text, and a delete button.
- **Styling**: Tailwind 4 utility classes + shadcn/ui `Button`, `Input`, `Checkbox` components where available; plain Tailwind otherwise.
- **SSR safety**: `index.tsx` sets `export const route = { ssr: false }` because it uses `useLiveQuery`.

## Implementation Phases

### Phase 1 — Schema & Migrations
- [ ] Add `todos` table to `src/db/schema.ts`.
- [ ] Add Zod schemas for todos to `src/db/zod-schemas.ts` using `drizzle-zod`.
- [ ] Run `drizzle-kit generate && drizzle-kit migrate` to create the table in Postgres.

### Phase 2 — API Routes
- [ ] Create `src/routes/api/todos.ts`:
  - `GET` — Electric shape proxy (forwards to Electric Cloud, injects secret).
  - `POST` — Insert a new todo (validate with Zod, return inserted row).
  - `PUT` — Update `completed` field for a todo by `id`.
  - `DELETE` — Delete a todo by `id` (id passed as query param).

### Phase 3 — Collection
- [ ] Create `src/db/collections/todos.ts`:
  - Electric collection pointing at `/api/todos` shape endpoint.
  - `onInsert` → `POST /api/todos`.
  - `onUpdate` → `PUT /api/todos`.
  - `onDelete` → `DELETE /api/todos?id=<id>`.

### Phase 4 — UI
- [ ] Update `src/routes/index.tsx`:
  - Set `ssr: false`.
  - `useLiveQuery` to get all todos ordered by `created_at`.
  - Controlled input + Add button to create todos.
  - Scrollable todo list with checkbox, text, and delete button per row.
  - Completed todos show strikethrough text style.

### Phase 5 — Build & Verify
- [ ] Run `pnpm build` and fix any TypeScript or preflight errors.
- [ ] Smoke-test: add, toggle, delete todos; verify multi-tab sync.

### Phase 6 — Tests
- [ ] Add `tests/todos.test.ts` using `generateValidRow` / `generateRowWithout` helpers to validate the Drizzle schema shape and Zod schema.

### Phase 7 — README
- [ ] Update `README.md` with setup instructions (env vars, migrate, dev).

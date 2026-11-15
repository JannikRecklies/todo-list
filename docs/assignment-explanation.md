# Assignment explanation: persisting todo lists

This document explains what we built for issue #2 and why we chose each approach over the alternatives. It is a log of reasoning, not a specification. For binding architectural decisions see [`docs/adr/`](adr/). The [summary](#summary) at the end lists every task in one place.

## Main task: Persist todo lists on the server

[Issue #2](https://github.com/JannikRecklies/todo-list/issues/2): todo lists lived only in React state, so every refresh reset them. The goal is that lists and todos survive a page refresh and a backend restart.

Decisions agreed before implementation:

- **One shared collection.** Everyone who opens the app sees and edits the same lists. No accounts, no per-user data. See [ADR 0001](adr/0001-shared-todo-lists.md).
- **Seed the two existing examples once,** so a fresh database isn't empty.
- **Create, rename, and delete lists.** Deleting a list also deletes its todos, after a confirmation dialog.
- **Todos stay plain text.** No due dates, priorities, or completion state.
- **Title and todo edits are staged until Save.** Nothing is sent while typing.
- **No live sync.** Other browsers see changes on refresh. When two people save, the later save wins.

## Tasks

### 1. Storing data in SQLite

**What:** lists and todos are stored in a SQLite file on the backend (`backend/data/todo-lists.sqlite` by default). The `better-sqlite3` driver is used.

**Why:** SQLite is a single file with no separate server to install or run, and it supports real relational tables, foreign keys, and transactions. This fits a small app run on one machine. See [ADR 0002](adr/0002-sqlite-for-storage.md).

**Alternatives we rejected:**
- *A JSON file:* simpler, but every save rewrites the whole file, and there are no transactions or constraints.
- *PostgreSQL:* more capable, but adds a server to install and configure for two example lists.

**Driver version:** we pinned `better-sqlite3` to `^11.10.0`. Version 13 requires Node 22, while the project's `.nvmrc` pins Node 20.

### 2. Table design and singular names

**What:** three tables: `todo_list`, `todo`, and `app_metadata`. A todo belongs to a list through `list_id`, and deleting a list cascades to its todos. Table names are singular, following UML convention.

**Why:** the schema mirrors the domain: one list has many todos. Cascade delete keeps the database from holding orphaned todos. Foreign keys are switched on explicitly, because SQLite leaves them off by default. Schema details are in [ADR 0003](adr/0003-todo-schema.md).

**Known gap:** databases created with the earlier plural table names (`todo_lists`, `todos`) are not migrated. Those rows stay in the file but are never read. Locally, delete `backend/data/todo-lists.sqlite` once.

### 3. Seeding the example lists once

**What:** the two sample lists are inserted only if the database has no lists and the `sample_lists_seeded` marker is missing. The marker is then written.

**Why:** checking only "is the table empty?" would bring the samples back after the user deletes every list. The marker records that seeding already happened, so an empty database stays empty.

### 4. Saving todos as a whole list

**What:** saving a list updates its title and replaces all of its todos in one transaction. The array position becomes the todo's position.

**Why:** the frontend already holds the complete list when Save is pressed, so sending the whole list is simpler than tracking individual row changes. The transaction makes the save all-or-nothing.

**Alternative rejected:** diffing todos and sending only changes. More code and more failure cases for no visible benefit at this size.

### 5. Splitting the backend into four files

**What:**
- `app.js`: Express setup (CORS, JSON parsing, mounting the routes).
- `todoListRoutes.js`: HTTP handling, request checks, and status codes.
- `todoListStore.js`: reads and writes lists and todos.
- `database.js`: opens the file, creates the tables, and seeds the samples.
- `index.js`: starts the real server with the real database.

**Why:** each file has one job. `createApp` takes the store as a parameter, so the API tests can run against a temporary database without starting a server on the real port. Routes check requests, and the store only talks to SQLite, so either can change without touching the other.

**Earlier versions** had all of this in one large store function. It was hard to read, and we refactored it twice before settling on this structure.

### 6. CORS stays in `app.js`

**What:** `cors()` is applied in `app.js`.

**Why:** the frontend runs on a different port from the backend, so the browser blocks its requests without CORS headers. Keeping it in `app.js` means tests and the running server get the same behavior.

### 7. Port from an environment variable

**What:** the backend listens on `process.env.PORT`, falling back to `3001`. The frontend reads `REACT_APP_API_URL`, falling back to `http://localhost:3001`.

**Why:** deployments often assign a port, so it cannot be hard-coded. To change the port, set `PORT=4000 npm start` on the backend and `REACT_APP_API_URL` on the frontend to match.

### 8. Validating requests on the backend

**What:** titles must be non-blank strings, and todos must be an array of strings. Invalid requests get `400`. Unknown list IDs get `404`.

**Why:** the browser's checks can be bypassed, so the server must enforce the rules too. The database also has a `CHECK` constraint on titles as a last line of defence.

### 9. Frontend: the browser only edits and sends

**What:**
- `api.js` is the only file that makes HTTP requests.
- `useTodoLists.js` loads and keeps the lists and the selected list.
- Component callbacks (such as "save this list") are plain JavaScript functions. They are not HTTP requests.

**Why:** keeping all `fetch` calls in one file means a URL or header change happens in one place.

**Behavior we chose:** create and delete are sent immediately because they change the list structure. Title and todo edits are sent on Save, so half-typed text never reaches the server.

### 10. Splitting the frontend screen

**What:** `TodoLists.jsx` now only wires things together. It uses `useTodoLists`, `TodoListOverview`, `TodoListForm`, `CreateTodoListDialog`, and `DeleteTodoListDialog`.

**Why:** each piece owns its own state. The create and delete dialogs track their own loading and error messages.

**Behavior change:** create and delete errors now show inside the dialog. Loading errors still show at the top of the page.

### 11. Architecture diagram

**What:** there is one architecture diagram, `docs/diagrams/architecture.html`, exported to `architecture.svg` for the README.

**Why:** an earlier separate "persistence architecture" diagram duplicated this one and went out of date. Keeping one source avoids that. The redesigned diagram shows the browser and the backend as separate zones, one left-to-right request flow, and SQLite as the single highlighted element.

### 12. Documentation

**What:** the glossary (`GLOSSARY.md`), ADRs 0001–0003, the schema diagram, and the README were added or updated.

**Why:** the glossary fixes the names used in code and conversation, so "list" and "todo" mean the same thing everywhere. ADR 0003 embeds the schema diagram so the decisions and the picture stay together.

### 13. Dependency updates

**Backend:** `npm audit fix` moved Express from 4.19.2 to 4.22.3, with no breaking changes. Audit now reports 0 vulnerabilities.

**Frontend:** `npm audit fix` reduced the findings from 74 to 32, and the 4 critical ones are gone. The remaining 32 come from `react-scripts` 5 and need a breaking migration. We considered switching to Vite, which would remove most of them, but left it as a separate decision.

**Why not force the fix:** `npm audit fix --force` can introduce breaking changes, and we want each one to be a deliberate choice.

### 14. Environment problems we hit

These are not design decisions, but they affect how to work on the project:

- **Global npm cache corruption:** `npm ci` failed with ENOENT. Running `npm cache clean --force` fixes it. A temporary cache also works (`npm ci --cache /tmp/...`).
- **Editor auto-installer changed `package.json`:** the TypeScript auto-installer ran `npm install` in `frontend/`, which pinned `react-scripts` to `^0.0.0` and pruned `node_modules`. Restore with `git checkout -- package.json package-lock.json`, then `npm ci`. Disabling `typescript.disableAutomaticTypeAcquisition` in VS Code prevents this.
- **Node version:** `.nvmrc` pins Node 20, but a development machine on Node 16 was used for some commands. Use Node 20 to match the project.

## Summary

| # | Task | Decision | Main reason | Where |
|---|------|----------|-------------|-------|
| Main | Persist todo lists (#2) | One shared collection, staged edits until Save, refresh-only sync | Keep scope small; no accounts | [ADR 0001](adr/0001-shared-todo-lists.md) |
| 1 | Storage | SQLite via `better-sqlite3` (pinned `^11.10.0`) | Single file, no server, real transactions | [ADR 0002](adr/0002-sqlite-for-storage.md) |
| 2 | Schema | Singular tables, cascade delete, foreign keys on | Mirrors the domain; no orphaned todos | [ADR 0003](adr/0003-todo-schema.md) |
| 3 | Seeding | One-time seed guarded by a marker row | Deleted samples must not return | `backend/src/database.js` |
| 4 | Saving | Replace all todos in one transaction | Frontend already sends the full list | `backend/src/todoListStore.js` |
| 5 | Backend split | `app.js`, `todoListRoutes.js`, `todoListStore.js`, `database.js`, `index.js` | One job per file; testable `createApp` | `backend/src/` |
| 6 | CORS | Stays in `app.js` | Frontend runs on another port | `backend/src/app.js` |
| 7 | Ports | `PORT` and `REACT_APP_API_URL` env vars | Deployments assign ports | `index.js`, `api.js` |
| 8 | Validation | Server checks titles and todos; `400` / `404` | Browser checks can be bypassed | `backend/src/todoListRoutes.js` |
| 9 | Frontend data flow | `api.js` is the only HTTP layer; create and delete immediate, edits on Save | Half-typed text never reaches the server | `frontend/src/todos/` |
| 10 | Frontend split | `useTodoLists` hook plus overview and dialog components | Each piece owns its own state | `frontend/src/todos/components/` |
| 11 | Diagram | One architecture diagram, redesigned | Avoid a duplicate that goes stale | `docs/diagrams/architecture.html` |
| 12 | Docs | Glossary, ADRs, schema diagram, README | Fixed names; decisions next to pictures | `GLOSSARY.md`, `docs/` |
| 13 | Dependencies | Non-breaking audit fixes only | Breaking changes stay deliberate | `backend/package.json`, `frontend/package-lock.json` |
| 14 | Environment | Documented npm cache, editor installer, Node version issues | Save future debugging time | This file |

**Open items:** plural-named databases are not migrated; the frontend has 32 remaining vulnerabilities (a Vite migration would address most of them); there is no authentication.


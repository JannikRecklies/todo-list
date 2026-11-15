# Assignment explanation

This document explains how we solved each task in [ASSIGNMENT.md](../ASSIGNMENT.md), why, and which alternatives we rejected. Each section follows the same structure: **What**, **Why**, and **Alternatives**. Binding decisions are recorded in the [ADRs](adr/).

## Main task: persist todo lists on the server

**Problem:** lists lived only in React state, so a refresh reset them.

**Agreed scope before coding:**
- One shared collection for everyone. No accounts ([ADR 0001](adr/0001-shared-todo-lists.md)).
- Seed the two existing examples once.
- Create, rename, and delete lists. Deleting a list also deletes its todos, after confirmation.
- Todos stay plain text.
- Title and todo edits are sent on **Save**, not while typing.
- No live sync. Other browsers see changes on refresh; the later save wins.

### Main 1. Storage: SQLite

**What:** lists and todos are stored in a SQLite file (`backend/data/todo-lists.sqlite`) through `better-sqlite3`, pinned to `^11.10.0`. Version 13 needs Node 22, and the project pins Node 20.

**Why:** SQLite is one file with no separate server, and it supports foreign keys and transactions. This suits a small app on one machine ([ADR 0002](adr/0002-sqlite-for-storage.md)).

**Alternatives:**
- *JSON file:* simpler, but every save rewrites the whole file, with no constraints or transactions.
- *PostgreSQL:* more capable, but needs a server for two example lists.

### Main 2. Schema

**What:** three tables. `todo_list` holds lists, `todo` holds todos with a `list_id` foreign key, and `app_metadata` holds the seed marker. Deleting a list cascades to its todos. Foreign keys are switched on explicitly, because SQLite leaves them off by default. Table names are singular, as taught in UML ([ADR 0003](adr/0003-todo-schema.md)).

**Why:** the schema matches the domain (one list has many todos), and cascade delete prevents orphaned todos.

**Alternatives:**
- *Plural names (`todo_lists`, `todos`):* common in SQL, but the team learned singular names in UML.
- *Application-level delete:* the code would have to remove todos first; the database does this more reliably.

**Known gap:** databases created with the old plural names are not migrated. Delete `backend/data/todo-lists.sqlite` once locally.

### Main 3. Seeding the example lists

**What:** the two samples are inserted only when the database has no lists and the `sample_lists_seeded` marker is missing. The marker is then written.

**Why:** checking only "is the table empty?" would bring the samples back after every list is deleted. The marker records that seeding already happened.

**Alternatives:** a seed script run by hand, which is easy to forget, or seeding on every startup, which resurrects deleted lists.

### Main 4. Saving a list

**What:** saving updates the title and replaces all todos in one transaction. The array index becomes each todo's position.

**Why:** the frontend already holds the full list on Save, so sending all of it is simpler. The transaction makes the save all-or-nothing.

**Alternatives:** diffing todos and sending only changes. It adds code and failure cases for no visible benefit at this size.

### Main 5. Backend structure

**What:**
- `index.js` starts the real server with the real database.
- `app.js` sets up Express (CORS, JSON parsing, routes).
- `todoListRoutes.js` handles HTTP, validation, and status codes.
- `todoListStore.js` reads and writes lists and todos.
- `database.js` opens the file, creates tables, and seeds samples.

**Why:** each file has one job. `createApp` takes the store as a parameter, so API tests can use a temporary database without the real port.

**Alternatives:** one large store function, which we wrote first and then split because it was hard to follow.

### Main 6. Validation, CORS, and ports

**What:**
- Titles must be non-blank strings and todos an array of strings. Invalid input gets `400`; unknown IDs get `404`.
- `cors()` is in `app.js`, because the frontend runs on a different port.
- The backend uses `PORT` (default `3001`); the frontend uses `REACT_APP_API_URL`.

**Why:** the server must enforce rules because browser checks can be bypassed. Ports come from the environment because deployments assign them.

**Alternatives:** trusting the frontend for validation, and hard-coding the port.

### Main 7. Frontend data flow

**What:** `api.js` is the only file that makes HTTP requests. `useTodoLists` loads and holds the lists. Create and delete are sent immediately; title and todo edits are sent on Save.

**Why:** all `fetch` calls live in one place. Immediate create and delete reflect structural changes, and Save keeps half-typed text off the server.

**Alternatives:** autosave on every keystroke (many requests, half-finished data) and calling `fetch` from components (URLs spread across the UI).

### Main 8. Frontend structure

**What:** `TodoLists.jsx` wires the screen together, with `TodoListOverview`, `TodoListForm`, `CreateTodoListDialog`, and `DeleteTodoListDialog`. The dialogs track their own loading and error state.

**Why:** each piece owns its state. Create and delete errors now show in their dialog; load errors still show at the top of the page.

**Alternatives:** keeping one large component with all state, which was hard to follow.

### Main 9. Architecture diagram

**What:** one diagram, `docs/diagrams/architecture.html`, exported to `architecture.svg` for the README. It shows the browser and backend as separate zones, one left-to-right request flow, and SQLite as the single highlighted element.

**Why:** an earlier "persistence architecture" diagram duplicated this one and went stale. One source avoids that.

**Alternatives:** a second diagram for persistence, which we removed.

### Main 10. Documentation

**What:** `GLOSSARY.md` defines "todo list" and "todo", ADRs 0001 to 0003 record the key decisions, the schema diagram is embedded in ADR 0003, and the README was updated.

**Why:** shared names prevent confusion in code and discussion, and decisions sit next to their pictures.

### Main 11. Dependencies

**What:**
- Backend: `npm audit fix` moved Express from 4.19.2 to 4.22.3 with no breaking changes. The backend now reports 0 vulnerabilities.
- Frontend: non-breaking fixes reduced findings from 74 to 32 and removed all critical ones. The rest come from `react-scripts` 5.

**Why:** we only applied fixes that don't change behavior. Each breaking change should be a deliberate choice.

**Alternatives:** `npm audit fix --force`, which can introduce breaking changes, and migrating to Vite, which would remove most remaining findings but is a larger change we have not made.

**Kept versions:** Node 20, `better-sqlite3` 11, `react-scripts` 5, Express 4.22, and ESLint 8 stay as they are. The assignment pins Node 20, and reviewers run it that way. The full list, the options we skipped, and what leaving them means are in [ADR 0004](adr/0004-keep-pinned-toolchain-versions.md).

### Main 12. Environment problems

These affect how to work on the project:
- **npm cache corruption** caused `npm ci` to fail with ENOENT. Fix: `npm cache clean --force`, or use a temporary cache with `--cache`.
- **Editor auto-installer** ran `npm install` in `frontend/`, which pinned `react-scripts` to `^0.0.0`. Fix: `git checkout -- package.json package-lock.json`, then `npm ci`. Disable `typescript.disableAutomaticTypeAcquisition` to prevent it.
- **Node version:** use Node 20, as pinned in `.nvmrc`. On the development machine, the default Node was v16.20.2, which does not match the pin. Run `nvm use` before `npm ci` or `npm start`, or the install and start can fail.
- **Node 20 is end-of-life** (April 2026), so it gets no security fixes. We keep it because the assignment pins it; see [ADR 0004](adr/0004-keep-pinned-toolchain-versions.md).

## Additional task 1: autosave

_Not started._

## Additional task 2: mark a todo as completed

_Not started._

## Additional task 3: mark a todo list as completed

_Not started._

## Additional task 4: completion date with time remaining or overdue

_Not started._

## Summary

| Section | Decision |
|---|---|
| Main | One shared collection; edits saved on demand; refresh-only sync |
| Main 1 Storage | SQLite via `better-sqlite3` |
| Main 2 Schema | Singular tables; cascade delete |
| Main 3 Seeding | Seed once, guarded by a marker |
| Main 4 Saving | Replace all todos in one transaction |
| Main 5 Backend | Split into five files by job |
| Main 6 Validation | Server-side checks; CORS in `app.js`; env-based ports |
| Main 7 Frontend data | One HTTP module; Save for edits, immediate create and delete |
| Main 8 Frontend | Small components and a hook |
| Main 9 Diagram | One architecture diagram |
| Main 10 Docs | Glossary, ADRs, README |
| Main 11 Dependencies | Non-breaking fixes only; versions kept as pinned by the assignment (ADR 0004) |
| Main 12 Environment | Known npm, editor, and Node pitfalls |

**Open items:** no migration for plural-named databases; 32 frontend vulnerabilities remain; no authentication.

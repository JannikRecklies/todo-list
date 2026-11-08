# Use SQLite for todo list storage

Todo lists must survive page refreshes and backend restarts, but the app is small and has no separate database server to run. We store them in a single SQLite file opened by the Express backend through `better-sqlite3`, which gives transactions and a schema without extra infrastructure; `better-sqlite3` is pinned to 11.x because newer releases require Node 22, while `.nvmrc` pins Node 20.

## Considered options

- **JSON file:** simplest, but there are no transactions, so a crash mid-write can corrupt all lists.
- **PostgreSQL:** robust and scalable, but requires installing and running a server just to run the app locally.

## Consequences

- The database is a local file, so it is single-server. Scaling to several backend instances would require moving to a networked database.
- Schema changes need an explicit migration; the current code creates tables with `CREATE TABLE IF NOT EXISTS` only.

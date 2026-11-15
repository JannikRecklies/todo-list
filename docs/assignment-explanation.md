# Assignment explanation

This document explains how we solved each task in [ASSIGNMENT.md](../ASSIGNMENT.md), why, and which alternatives we rejected. Each section follows the same structure: **What**, **Why**, and **Alternatives**. Binding decisions are recorded in the [ADRs](adr/).

## Main task: persist todo lists on the server

**What:** lists and todos are stored in a SQLite file through the backend API. The frontend loads them on start and sends changes to the server.

**Why:** a database file survives server restarts without a separate server to run. The assignment allows in-memory storage, but a restart would lose the data, which is the problem we're solving. See [ADR 0002](adr/0002-sqlite-for-storage.md) and [ADR 0003](adr/0003-todo-schema.md).

**Alternatives:**
- *In-memory arrays:* simplest, but cleared on every restart.
- *JSON file:* persists, but rewrites the whole file on each save and has no transactions.
- *PostgreSQL:* more capable, but needs a server to run for this scope.

## Additional task 1: autosave

_Not started._

## Additional task 2: mark a todo as completed

_Not started._

## Additional task 3: mark a todo list as completed

_Not started._

## Additional task 4: completion date with time remaining or overdue

_Not started._

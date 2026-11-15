# Keep the toolchain versions pinned by the assignment

## Decision

We keep Node 20, `react-scripts` 5, `better-sqlite3` 11, Express 4, and ESLint 8. The assignment pins Node 20 and uses `react-scripts`, and reviewers run the project that way. Changing them would make every reviewer change their setup, which is outside the task.

## Consequences

- **Node 20 is end-of-life** (April 2026) and gets no security fixes. Acceptable for an interview task, not for production.
- **`react-scripts` is no longer maintained.** Its latest stable release is 5.0.1 (April 2022), and Create React App was sunset in February 2025. Its audit findings cannot reach zero while it is used. `npm audit fix --force` is not a fix, since it replaces `react-scripts` with `0.0.0`.
- Anyone running the project must use Node 20 (`nvm use`).

## Revisit when

The interviewers agree on a newer Node version, or the frontend is kept beyond the assignment. Then upgrade Node (and `better-sqlite3` to 13, which needs Node 22) and migrate the frontend to Vite. Update this ADR and `.nvmrc` or `package.json` in the same change.

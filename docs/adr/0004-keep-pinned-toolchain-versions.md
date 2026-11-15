# Keep the toolchain versions pinned by the assignment

The assignment asks to run the project with the Node version in `.nvmrc` (Node 20), and the interviewers run it the same way. Upgrading Node or major dependencies would force every reviewer to change their setup, and would add changes that are not part of the task. Therefore the current versions and record the known risks are kept.

## Pinned versions

| Component | Version | Why it stays |
|---|---|---|
| Node.js | 20 (`.nvmrc`) | Pinned by the assignment. |
| `better-sqlite3` | `^11.10.0` | Version 13 requires Node 22, which would break the pinned Node 20. |
| `react-scripts` | `^5.0.1` | Pinned by the assignment's frontend setup. Its remaining audit findings are build-time dependencies. |
| Express | `^4.19.2` (lock: 4.22.3) | Non-breaking `npm audit fix` applied; 0 backend findings. |
| ESLint | `^8.57.0` (backend) | Matches the lint setup the assignment uses. |

## Upgrades to be done in the future

- **Upgrade to Node 22:** supported and needed before Node 20 stops getting security fixes, but it changes the setup the assignment asks for. Revisit once the interviewers agree to a new Node version.
- **Migrate the frontend to Vite:** removes most `react-scripts` audit findings but changes `npm start`, the build, and the ESLint config. Revisit if the frontend is kept beyond the assignment.
- **`npm audit fix --force`:** can introduce breaking changes in one step. Do not use it unless each change is reviewed.
- **`overrides` in `frontend/package.json`:** would fix specific transitive packages without a major upgrade. Revisit if the findings must go down before a Node or Vite change, and test the build and app after each override.
- **`better-sqlite3` 13:** needs Node 22. Revisit together with the Node upgrade.

## What leaving the versions this way means

- Node 20 reached end-of-life in April 2026, so it no longer receives security fixes. Acceptable for an interview task, not for production.
- The frontend keeps the remaining audit findings from `react-scripts` 5. These are mostly in build tooling, not the code served to the browser.
- Anyone running the project must use Node 20 (`nvm use`). Other versions can break `npm ci` or `npm start`.
- The upgrade decision is deferred, not rejected. It needs an agreed Node version from the interviewers first.

## Consequences

- The ADR is the single record for these versions. `docs/assignment-explanation.md` (Main 11 and 12) links here.
- When a version changes, update the table above and the `.nvmrc` or `package.json` in the same change.

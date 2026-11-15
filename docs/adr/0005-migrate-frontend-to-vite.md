# Migrate the frontend from react-scripts to Vite

`react-scripts` (Create React App) is no longer maintained: the project was sunset in February 2025 and its last release is from April 2022. Its audit findings come from its build-time dependency tree, so they cannot reach zero while it is used; the frontend had 32 open findings. We migrated the frontend to Vite, which is actively maintained and needs only a small change: the same `npm ci` and `npm start` commands, a `vite.config.js`, a root `index.html` with a module entry, and the env variable renamed to `VITE_API_URL`.

## Considered options

- **Keep react-scripts:** no fix path for the audit findings and no maintenance upstream.
- **Eject from react-scripts:** exposes the webpack configuration to maintain ourselves, which adds more code to own than a Vite setup.
- **Vite (chosen):** maintained, small config, and removes the 32 findings (0 after the migration).

## Consequences

- Developers must rename `REACT_APP_API_URL` to `VITE_API_URL`. Vite only exposes variables with the `VITE_` prefix.
- The production build is written to `frontend/dist/` instead of `frontend/build/`.
- Node stays at 20, as pinned in `.nvmrc`. Vite 7 requires Node 20.19 or newer, so older Node 20 releases must be upgraded first.

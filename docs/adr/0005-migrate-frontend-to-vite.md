# Migrate the frontend from react-scripts to Vite

`react-scripts` (Create React App) is no longer maintained, and its audit findings cannot be fixed while it is used. Vite is maintained and is a small change: the same `npm ci` and `npm start` commands, a `vite.config.js`, a root `index.html`, and `VITE_API_URL` instead of `REACT_APP_API_URL`.

## Considered options

- **Keep react-scripts:** no changes, but the audit findings stay because they come from its build tree.
- **Next.js:** a full framework with server rendering and routing, more than this app needs.
- **Parcel or Rspack:** maintained bundlers, but less common, so reviewers are less likely to know them.
- **Eject or a hand-written webpack config:** we would own and maintain the build config ourselves.
- **Vite (chosen):** maintained, small config, and close to our existing commands.

## Consequences

- Developers rename `REACT_APP_API_URL` to `VITE_API_URL`.
- The production build goes to `frontend/dist/` instead of `frontend/build/`.
- Vite 7 needs Node 20.19 or newer.

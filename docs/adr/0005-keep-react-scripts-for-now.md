# Keep react-scripts for now

`frontend` uses `react-scripts` (Create React App), which is unmaintained: its last release was in April 2022 and CRA was sunset in February 2025. `npm audit` reports 32 findings (11 high, 5 moderate, 16 low), mostly in build-time dependencies of `react-scripts`. They cannot reach zero while it is used, and fixing them without leaving it would mean changing the toolchain.

We keep `react-scripts` for now. The assignment's documented setup depends on it: `npm ci` and `npm start` with the browser opening automatically, which reviewers use as-is. The `react-app` ESLint config used by `npm run lint` is also part of the assignment's lint instructions. Changing the build tooling is out of scope for the assignment, so this decision is deferred, not rejected.

## Considered options

- **Keep react-scripts (chosen for now):** matches the assignment's commands and reviewers' setup, with no tooling change. The audit findings remain.
- **Migrate to Vite now:** removes most of the audit findings, but changes the documented commands and config, so it is deferred to a separate task.
- **Run `npm audit fix --force`:** would not resolve the findings without breaking or downgrading `react-scripts`, so it is rejected.

## Consequences

- The 32 audit findings remain and are accepted as build-time risk for now.
- A future Vite migration would include: adding `@vitejs/plugin-react` and `vite.config.js` with `server.open: true`; moving `index.html` to the frontend root with a module script; renaming `REACT_APP_API_URL` to `VITE_API_URL`; and changing the output directory to `dist/`. The `react-app` ESLint config does not depend on the bundler, so it can stay: `eslint-config-react-app` and the packages it currently gets through `react-scripts` must be added as direct devDependencies, and ESLint must stay on v8 because `npm run lint` uses `--ext`. Vite 7 requires Node 20.19 or newer, so `.nvmrc` would need updating too.

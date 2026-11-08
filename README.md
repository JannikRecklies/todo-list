# Todo list

A small todo list app built with React and Express. Users can browse todo lists and add, edit, and delete the todos within them in the browser.

> This project started as a take-home assignment. The original brief is kept in [ASSIGNMENT.md](ASSIGNMENT.md).

## Features

- Browse a set of todo lists in a sidebar card
- Open a list to edit its todos, add new ones, and delete existing ones
- Save a list to update it in the client state

## Architecture

![Todo list architecture](docs/diagrams/architecture.svg)

The app is split into two parts:

- **Frontend** (`frontend/`): a Create React App single-page app using Material UI. `App` renders the page shell, `TodoLists` shows the list overview, and `TodoListForm` edits a single list.
- **Backend** (`backend/`): an Express server with CORS and JSON body parsing. It currently exposes only a `GET /` route.

Todo list data is currently mocked in the frontend and held in React state. The frontend does not call the backend yet, so changes are lost on refresh.

The diagram source is [docs/diagrams/architecture.html](docs/diagrams/architecture.html).

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, Material UI 5, Create React App |
| Backend | Node.js, Express 4, cors |
| Linting | ESLint (`backend/`, `frontend/`), Prettier config in `.prettierrc` |

## Getting started

Requires Node.js. The version is pinned in [`.nvmrc`](.nvmrc).

```bash
# Backend, runs on http://localhost:3001
cd backend
npm ci
npm start

# Frontend, runs on http://localhost:3000
cd frontend
npm ci
npm start
```

Lint each package with `npm run lint` from its folder.

## Project structure

```
backend/    Express server (src/index.js)
frontend/   React app (src/App.jsx, src/todos/components/)
docs/       Agent and diagram documentation
```

## Further reading

- [ASSIGNMENT.md](ASSIGNMENT.md): the original assignment brief and tasks
- [docs/agents/](docs/agents/): issue tracker, triage labels, and domain docs

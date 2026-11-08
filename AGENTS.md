## Agent skills

### Issue tracker

GitHub Issues in `JannikRecklies/todo-list`, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Branch naming

- Do not include personal names, usernames, or initials in branch names.
- Start with a type prefix followed by a slash: `feature/`, `task/`, `bug/`, `fix/`, `refactor/`, `docs/`, or `chore/`.
- When the branch works on a GitHub issue, put `issue-<number>_` right after the prefix, for example `feature/issue-2_persist-todo-lists`. The underscore separates the issue key from the description.
- After the prefix (and after the `issue-<number>_` key, if present), use lowercase kebab-case that describes the change in 2–5 words.
- Use only lowercase letters, digits, hyphens, the single prefix slash, and the single underscore that follows an issue key.
- Examples: `feature/add-task-filtering`, `feature/issue-2_persist-todo-lists`, `bug/empty-todo-validation`, `docs/agent-setup`, `refactor/todo-api-client`.
- Rename session branches only through the app's rename tool, not with `git branch -m`.

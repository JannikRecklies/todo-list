# Todos carry a completed flag

Todos change from plain text to `{ text, completed }` so that completion can be stored with each todo. The API sends and receives todos in this shape, and the database stores `completed` as a boolean column on the `todo` table. Saves still replace all todos in one transaction, as in [ADR 0003](0003-todo-schema.md), so the flag is written along with the text and position.

## Considered options

- **Keep strings and store completion in a separate table keyed by list and position:** avoids changing the API shape, but positions are reassigned on every save, so completion would be detached from the todo it belongs to.
- **Todo objects with a completed flag (chosen):** completion travels with the todo and is saved by the same replace-all write.

## Consequences

- The API and frontend move from string arrays to objects for todos, so both sides change together.
- Only a boolean is stored, with no completion timestamp.
- Editing text keeps the completed state. Toggling completion autosaves immediately, and removals stay immediate as in [ADR 0006](0006-autosave-todo-lists.md).

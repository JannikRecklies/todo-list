# Autosave todo list edits

Edits need to be saved without a Save button. Title and todo edits are therefore sent 1000 ms after the last change, and removing a todo is sent immediately. A waiting edit is sent immediately when the user switches lists or closes or refreshes the tab. This supersedes the on-demand Save decision in the original design.

## Considered options

- **Keep the Save button:** matches the original design, but it does not meet issue #3.
- **Save on every keystroke:** simplest, but it sends a request per character and stores half-written text.
- **Save on blur:** fewer requests, but edits stay unsaved until the field loses focus.
- **Debounced autosave with flush on leave (chosen):** one request per pause, and no waiting edit is dropped when the user leaves.

## Consequences

- Closing or refreshing the tab depends on `pagehide` and `keepalive`. Browsers treat `keepalive` as best-effort, so the final edit may still be lost in rare cases.
- A failed save after the form unmounts is not shown, because the form is gone.
- Every pause writes the whole list, so autosave makes more writes than a single Save. Saving only what changed is tracked in [#15](https://github.com/JannikRecklies/todo-list/issues/15). To be improved in the future.

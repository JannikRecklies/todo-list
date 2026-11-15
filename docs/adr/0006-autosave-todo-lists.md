# Todo list edits autosave

Users should not have to press Save, and a forgotten Save loses the change. Title and todo edits are therefore sent 1000 ms after the user stops typing, and removing a todo is sent immediately. The form has no Save button. Blank todos and a blank title are never sent, and a failed save shows an error above the form while keeping the edits on screen. This supersedes the on-demand Save decision in the original design.

## Considered options

- **Save on every keystroke:** simplest, but it sends a request per keystroke and stores half-finished text.
- **Save on blur:** fewer requests, but edits are lost if the user closes the page without leaving the field.
- **Debounced autosave (chosen):** one request per pause, and no Save button to forget.

## Consequences

- Each edit is sent once the user pauses, so a closed tab can lose the last second of typing. Switching lists sends the waiting edit immediately.
- A failed save after the form unmounts is not shown, because the form is gone.
- The server still replaces the whole list on each save, so frequent autosaves make more writes than a single Save would.

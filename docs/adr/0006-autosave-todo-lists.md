# Todo list edits autosave

Title and todo edits are sent to the server 1000 ms after the user stops typing, and removing a todo is sent immediately; the form has no Save button. This supersedes the on-demand **Save** decision in the original design, which had rejected autosave because of request volume. The pause keeps requests and half-typed text off the server, and blank todos and a blank title are never sent. A failed save shows an error alert above the form and keeps the edits on screen.

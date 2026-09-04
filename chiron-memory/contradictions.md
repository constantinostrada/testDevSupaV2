# contradiction

A memory that clashes with newer reality — flagged to be resolved.

## The old hard-delete API `removeExpense()` was replaced by `updateExpense()` / `deleteExpe…

What: The old hard-delete API `removeExpense()` was replaced by `updateExpense()` / `deleteExpense()` / `restoreExpense()`, all built on a shared internal `patchExpense()` helper. · Why: hard delete is incompatible with the undo-window requirement. · Where: js/storage.js; flagged in chiron-memory/contradictions.md. <!-- id: 3a56a018-192b-41a8-9216-483a2eddfbc1-2 -->

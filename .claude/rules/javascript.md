---
paths:
  - "src/js/**"
---

# JavaScript

- Two patterns exist: Knockout view models bound from templates with `data-bind`, and Lit web components (`readthedocs-*` elements). New small widgets should be web components. Don't add a third pattern.
- Inside Knockout code, no jQuery and no direct DOM manipulation: declare data in the model and let the bindings render it. The `semanticui` binding wraps the Fomantic modules (dropdown, popup, tabs, search). If an exception is unavoidable, mark it with a comment saying not to copy it.
- Follow the existing model logic instead of reaching for element ids from outside the model.
- Initialize observables from plain values (`ko.observable(value)`). Calling an observable during instantiation has side effects.
- No autofocus and no microtask timing tricks. Focus follows user interaction.
- Use `const` for variables that are never reassigned.
- `/** */` comments are parsed by jsdoc into the hosted docs. Use `//` for internal notes, and document why, not what.
- Tests run with `npm test`.

---
paths:
  - "readthedocsext/theme/templates/**/*.html"
---

# Django templates

- Comment with `{# #}` or `{% comment %}`, never HTML comments. HTML comments ship in the rendered page.
- Delimit template structure with named blocks, not comments. Blocks are what child templates override and they can't be misaligned.
- When overriding a block, check it still exists in the parent with that name. Overriding a block the parent renamed is dropped silently.
- Load tags explicitly: `{% load trans blocktrans from i18n %}`. djlint flags wildcard loads.
- Wrap every user-facing string in `{% trans %}` or `{% blocktrans trimmed %}`, including `placeholder`, `title` and `alt` attributes.
- Reuse the existing partials under `includes/` and `partials/` and the `readthedocs-*` web components instead of duplicating markup across templates.
- Headings on settings pages match the menu item that leads to them.
- Don't describe UI that isn't active yet. Disable navigation items with the `disabled` class rather than removing them, so pages don't vanish.
- No inline `style=` attributes. Hide Knockout-driven elements with the `ko hidden` class so they don't flash before the view model binds.
- Use the Fomantic UI variation that exists for the job before inventing a class: `ui info visible message` inside forms, `.ui.buttons` only for a group of buttons, the dropdown and popup patterns already used in the templates. Custom styling is a theme variation class, see the styles rule.
- Escape anything from user input inside `data-bind` with `|escapejs`.
- Lint with the pinned tools: `pre-commit run --files <template>`. djlint's reformatter mishandles some conditional tags; wrap those in `{# djlint:off #}` rather than accepting an unreadable reflow.
- Features must also work for staff using impersonation on Business, and the existing debug menu is where debug tools go.

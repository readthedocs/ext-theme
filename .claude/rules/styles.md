---
paths:
  - "src/sui/**"
  - "src/css/**"
---

# Styles (Fomantic UI and LESS)

- Fomantic UI is the design system. Before adding CSS, check whether an existing variation does the job.
- Custom rules live in the theme overrides next to the element they extend: `src/sui/themes/rtd-application/<type>s/<element>.overrides`, or `globals/site.overrides` for rules that aren't tied to one element. `src/css/components/` is not compiled.
- Name custom rules as variations on the element they extend (`.ui.invertable.image`, `.ui.truncating.header`, `.ui.labeled.image`) and document them with the same comment block as the avatar variants in `elements/image.overrides`, including a markup example.
- Never use `!important`. To beat Fomantic's own specificity, prefix the selector with `@{uiImportant}` from `globals/site.variables`. Repeating `.ui.ui.ui` is the older form of the same hack; don't add more of it.
- Colors come from variables: `@primaryColor`, `@secondaryColor`, their light and background variants, and Fomantic's named colors. Don't hard-code hex values, and don't reach for `@teal` or `@violet` for brand accents; Business compiles the theme with primary and secondary swapped (`src/sui/theme.business.config`).
- Avoid `:extend()`. It drops hover and other pseudo states.
- The dark theme is generated from `site.less` by `postcss-fomanticui-dark`. Fix dark theme issues by changing the variables an element uses first, and add explicit rules with the `.dark-theme-override({ ... })` mixin only for one-offs.
- Changing `.variables`, `.overrides` or LESS files means rebuilding the committed assets, see the workflow rule.

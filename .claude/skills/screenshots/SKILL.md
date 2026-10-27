---
name: screenshots
description: Screenshot a dashboard template change (header, menus, pages) without running the full Read the Docs app. Use when asked for screenshots, before/after images, or to check how a template renders on mobile.
---

# Screenshots of template changes

The dashboard needs the readthedocs.org app, a database, and the Font Awesome
Pro kit to run. None of that is available in a cloud session, so render the
template directly with Django and screenshot it with the pre-installed
Playwright instead. This works for any template that only needs `request`,
a few URL names, and a couple of context variables.

## Steps

1. Render the template to a standalone HTML file with a stub Django config:
   `settings.configure()` with the templates directory in `TEMPLATES.DIRS`,
   the `request` context processor, `STATIC_URL="static/"`, and a `ROOT_URLCONF`
   that defines every `{% url %}` name the template uses as a dummy view.
   Register stubs for custom template tag libraries (for example `gravatar`)
   through `TEMPLATES.OPTIONS.libraries`. Render once with `AnonymousUser()`
   and once with a `User(username=..., email=...)` on a `RequestFactory` request.
2. Wrap the output in a page that links the compiled theme stylesheet from
   `readthedocsext/theme/static/readthedocsext/theme/css/site.css`. Copy the
   `static/readthedocsext` directory next to the HTML file (copy, not symlink)
   and rewrite `src="/static/` to `src="static/"` because Django always makes
   `STATIC_URL` absolute.
3. The Font Awesome kit is domain-locked and will not load from `file://`.
   Add the free set from cdnjs (`font-awesome/6.5.2/css/all.min.css`) and map
   the Pro duotone classes to it:
   `.fad,.fa-duotone{font-family:"Font Awesome 6 Free"!important;font-weight:900!important}`.
   Say in the report that icons are stand-ins.
4. For a "before" image, write the old template from git into a copy of the
   templates directory: `git show main:path/to/template.html > copy/path`.
5. Screenshot with Playwright (`require('playwright')` works from anywhere,
   `chromium.launch()` needs no options). Use a phone viewport of 390 wide with
   `deviceScaleFactor: 2` for mobile, 1280 wide for desktop. Semantic UI
   dropdowns only open through the site JavaScript, so force one open with
   `page.evaluate`: add `active visible` to the `.ui.dropdown` element and
   `visible transition left` to its `.menu` (`left` keeps a right-edge menu on
   screen). Wait about 800 ms for the icon font, then `clip` the screenshot to
   the region that matters.
6. Send the PNGs with `SendUserFile` using `display: "render"`. The GitHub API
   cannot attach images to a PR description, so tell the user to drag the files
   onto the description in the web UI.

Keep all scripts and output in the scratchpad directory, never in the repo.

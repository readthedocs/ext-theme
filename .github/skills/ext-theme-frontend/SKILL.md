---
name: ext-theme-frontend
description: "Frontend development skill for the ext-theme repository. Use when building or modifying templates, KnockoutJS views, FomanticUI/SemanticUI components, LESS styles, web components (LitElement), or Django templates in the ext-theme project. Covers Knockout data-bind patterns, FUI class conventions, the Registry/ApplicationView architecture, custom binding handlers (jsonInit, semanticui, htmlInit), LightDOMElement web components, and how Django templates integrate with front-end JS."
argument-hint: "Describe what UI feature, template, or JS view you want to build or modify"
---

# ext-theme Frontend Development

## Tech Stack

| Layer | Technology |
|-------|-----------|
| CSS/UI | Fomantic UI (FUI) — a community fork of Semantic UI |
| JS Reactivity | KnockoutJS (`ko.observable`, `ko.computed`) |
| Web Components | Lit 3 (`LitElement`) via `LightDOMElement` |
| Templates | Django templates with `crispy_forms` |
| CSS Pre-processor | LESS (`fomantic-ui-less`) |
| JS bundler | Webpack |

FUI is the primary UI framework. Semantic UI docs apply in most cases; check [fomantic-ui.com](https://fomantic-ui.com) for FUI-specific additions.

---

## Architecture Overview

### ApplicationView and Registry

All KnockoutJS views are registered in `Registry` and attached to `ApplicationView`, which is bound to `<body>`. This means every registered view is available as `$root.<ViewName>()` in any template.

```javascript
// src/js/project/index.js
export class MyNewView {
  static view_name = "MyNewView";  // Required — class name gets mangled by Webpack

  constructor() {
    this.some_value = ko.observable();
  }
}
Registry.add_view(MyNewView);
```

```html
<!-- Django template -->
<div data-bind="using: MyNewView()">
  <span data-bind="text: some_value"></span>
</div>
```

**Rules:**
- Always set `static view_name = "MyNewView"` — class names are minified in production.
- Use `ko.ignoreDependencies` is handled by `Registry.add_view` automatically.
- Reference views via `$root.MyNewView()` when inside a nested Knockout context.

---

## KnockoutJS Patterns

### Observables

```javascript
this.is_loading = ko.observable(false);          // simple observable
this.items = ko.observableArray([]);             // array observable
this.label = ko.computed(() => {                 // derived value
  return this.items().length + " items";
});
```

### Custom Bindings (from `src/js/application/plugins.js`)

These bindings are registered globally and available in all templates:

| Binding | Purpose | Example |
|---------|---------|---------|
| `jsonInit` | Initialize observable from `<script type="application/json">` | See below |
| `htmlInit` | Initialize observable from element's `innerHTML` | `data-bind="htmlInit: my_obs"` |
| `textInit` | Initialize observable from element's `innerText` | `data-bind="textInit: my_obs"` |
| `valueInit` | Initialize observable from `<input>.value` | `data-bind="valueInit: my_obs"` |
| `semanticui` | Initialize any FUI jQuery plugin | See below |
| `element` | Store a DOM element reference in an observable | `data-bind="element: my_elem_obs"` |
| `chart` | Initialize Chart.js canvas | `data-bind="chart: config"` |
| `popup` | Initialize FUI popup on an element | `data-bind="popup: {content: 'tip'}"` |
| `webcomponent` | Initialize a web component | `data-bind="webcomponent: {name: 'my-el'}"` |

#### `jsonInit` — pass config from Django to JS

```html
<div data-bind="using: MyView()">
  <script type="application/json" data-bind="jsonInit: config">
    {"url": "{% url 'projects-list' %}"}
  </script>
</div>
```

```javascript
constructor() {
  this.config = ko.observable();
  this.url = ko.computed(() => this.config()?.url);
}
```

#### `semanticui` — initialise FUI plugins via Knockout

```html
<!-- Dropdown -->
<div class="ui dropdown" data-bind="semanticui: {dropdown: {action: 'select'}}">

<!-- Modal trigger (use $root.show_modal for modals) -->
<button data-bind="click: $root.show_modal('confirm')"></button>
<div class="ui modal" data-modal-id="confirm">...</div>

<!-- Accordion -->
<div class="ui accordion" data-bind="semanticui: {accordion: {}}">
```

---

## FomanticUI / SemanticUI Class Conventions

FUI classes follow a `ui <variations> <component>` pattern. Always put `ui` first.

### Buttons

```html
<button class="ui primary button">Save</button>
<button class="ui secondary button">Cancel</button>
<button class="ui negative button">Delete</button>
<button class="ui loading button">Loading...</button>
<a class="ui basic button" href="...">Link button</a>
```

### Messages

```html
<div class="ui info message">...</div>
<div class="ui warning message">...</div>
<div class="ui negative message">...</div>
<div class="ui success message">...</div>
<!-- With icon -->
<div class="ui icon message">
  <i class="fad fa-info icon"></i>
  <div class="content">...</div>
</div>
```

### Forms

```html
<form class="ui form" method="post" action=".">
  {% csrf_token %}
  <div class="field">
    <label>Name</label>
    <input type="text" name="name">
  </div>
  <div class="ui negative message" data-bind="visible: has_error">
    Error text here
  </div>
  <button class="ui primary button" type="submit">Save</button>
</form>
```

Use `crispy_forms` to render Django forms:

```html
{% load crispy_forms_tags %}
{{ form|crispy }}
```

Use `{% alter_field %}` from `ext_theme_tags` to add Knockout bindings to crispy fields:

```html
{% alter_field form.my_field data_bind="value: my_observable" %}
```

### Grid and Layout

```html
<div class="ui container">              <!-- centers content -->
<div class="ui grid">                  <!-- 16-column grid -->
  <div class="eight wide column">...</div>
  <div class="eight wide column">...</div>
</div>
<div class="ui segment">               <!-- box/card -->
<div class="ui basic segment">         <!-- segment without border -->
<div class="ui very padded segment">   <!-- more padding -->
```

### Responsive helpers

```html
<div class="mobile only">...</div>
<div class="tablet only">...</div>
<div class="computer only">...</div>
<div class="four wide computer eight wide tablet sixteen wide mobile column">
```

### Menus

```html
<div class="ui secondary pointing menu">
  <a class="active item" href="#">Tab 1</a>
  <a class="item" href="#">Tab 2</a>
</div>
```

### Tables

```html
<table class="ui celled table">
  <thead><tr><th>Col</th></tr></thead>
  <tbody><tr><td>Value</td></tr></tbody>
</table>
```

### Modals

```html
<!-- Trigger -->
<button class="ui button" data-bind="click: $root.show_modal('my-modal')">Open</button>

<!-- Modal (place near bottom of template body) -->
<div class="ui modal" data-modal-id="my-modal">
  <div class="header">Title</div>
  <div class="content">...</div>
  <div class="actions">
    <button class="ui primary button">Confirm</button>
    <button class="ui cancel button">Cancel</button>
  </div>
</div>
```

Always use `$root.show_modal(id)` instead of calling `$('.ui.modal').modal('show')` directly — this avoids issues with `<body>` binding.

### Icons

Icons use Font Awesome 6 with the `fad` (duotone) prefix by convention:

```html
<i class="fad fa-trash icon"></i>
<i class="fad fa-warning icon"></i>
<i class="fad fa-check icon"></i>
```

---

## Django Template Conventions

### Extending base templates

```html
{% extends "projects/base.html" %}

{% load i18n %}
{% load crispy_forms_tags %}
{% load ext_theme_tags %}

{% block title %}My Page{% endblock title %}

{% block content %}
  ...
{% endblock content %}
```

### Template tags from `ext_theme_tags`

| Tag | Purpose |
|-----|---------|
| `{% alter_field form.field attr=val %}` | Add/override attributes on a crispy field |
| `{% webpack_static "path/to/file.css" %}` | Get the hashed asset URL from Webpack manifest |
| `{% settings_dashboard as settings %}` | Expose Django settings as a JS-usable JSON blob |

### i18n

```html
{% load i18n %}
{% trans "Static string" %}
{% blocktrans %}String with {{ variable }}{% endblocktrans %}

{# Set a string into a variable first #}
{% trans "Button label" as button_text %}
<button>{{ button_text }}</button>
```

### Including partials

```html
{% include "includes/utils/messages.html" %}
{% include "projects/partials/header.html" %}
```

---

## Web Components (LitElement)

Custom elements use `LightDOMElement` (not `LitElement` directly) so that FUI styles apply:

```javascript
import { html } from "lit";
import { LightDOMElement } from "../application/elements";

export class MyElement extends LightDOMElement {
  static properties = {
    value: { type: String },
    csrfToken: { type: String, attribute: "csrf-token" },  // kebab-case in HTML
    loading: { state: true },  // internal state, not reflected as attribute
  };

  render() {
    return html`
      <div class="ui segment">
        <span>${this.value}</span>
      </div>
    `;
  }
}
customElements.define("my-element", MyElement);
```

Usage in Django templates:

```html
<my-element value="{{ some_value }}" csrf-token="{{ csrf_token }}"></my-element>
```

**Rules:**
- Always extend `LightDOMElement`, not `LitElement` — shadow DOM breaks FUI styles.
- Use `attribute: "..."` for attributes from HTML (kebab-case → camelCase).
- Use `state: true` for internal reactive state not exposed as HTML attributes.
- Sanitise any HTML rendered from API with DOMPurify (`unsafeHTML` + DOMPurify).

---

## LESS / CSS Conventions

Custom styles go in `src/css/components/`. FUI variables are overridden via `src/sui/` (the `@readthedocs/sui-common-theme` package).

```less
// src/css/components/mycomponent.less
.my-component {
  // Use FUI variables when possible
  color: @textColor;
  padding: @relativeMini;
}
```

Import new files in `src/css/site.less`:

```less
& {
  @import "components/mycomponent.less";
}
```

---

## Common Patterns to Follow

### API data loading in a Knockout view

```javascript
export class MyView {
  static view_name = "MyView";

  constructor() {
    this.config = ko.observable();
    this.items = ko.observableArray([]);
    this.is_loading = ko.observable(false);

    // Load when config becomes available
    this.config.subscribe((config) => {
      if (config?.url) {
        this.load(config.url);
      }
    });
  }

  load(url) {
    this.is_loading(true);
    jquery.getJSON(url).then((data) => {
      this.items(data.results);
      this.is_loading(false);
    });
  }
}
Registry.add_view(MyView);
```

Template:

```html
<div data-bind="using: MyView()">
  <script type="application/json" data-bind="jsonInit: config">
    {"url": "{% url 'api:projects-list' %}"}
  </script>
  <div class="ui loader" data-bind="css: {active: is_loading}"></div>
  <div data-bind="foreach: items">
    <div class="ui segment" data-bind="text: name"></div>
  </div>
</div>
```

### Form field visibility / enable / disable based on another field

This is the established pattern for showing, hiding, or enabling form fields reactively.

**Step 1** — use `valueInit` to seed the observable from the rendered Django form field value, then `enable` or `visible` to react to it:

```html
<form class="ui form" method="post" action="." data-bind="using: MyFormView()">
  {% csrf_token %}
  {# Read the select's initial value into redirect_type, react to changes #}
  {% alter_field form.redirect_type data_bind="valueInit: redirect_type" %}
  {# Enable/disable based on a computed #}
  {% alter_field form.from_url data_bind="valueInit: from_url, textInput: from_url, enable: is_from_url_visible" %}
  {% alter_field form.to_url data_bind="valueInit: to_url, textInput: to_url, enable: is_to_url_visible" %}
  {{ form|crispy }}
</form>
```

**Step 2** — react to the controlling field via `subscribe` (for side effects) or `ko.computed` (for derived booleans):

```javascript
export class MyFormView {
  static view_name = "MyFormView";

  constructor() {
    // Seed from rendered HTML value via valueInit
    this.redirect_type = ko.observable();
    this.is_from_url_visible = ko.observable(false);
    this.is_to_url_visible = ko.observable(false);

    // Use subscribe when the reaction involves multiple writes
    this.redirect_type.subscribe((value) => {
      if (value === "exact") {
        this.is_from_url_visible(true);
        this.is_to_url_visible(true);
      } else if (value === "prefix") {
        this.is_from_url_visible(true);
        this.is_to_url_visible(false);
      } else {
        this.is_from_url_visible(false);
        this.is_to_url_visible(false);
      }
    });
  }
}
Registry.add_view(MyFormView);
```

Use `ko.computed` instead when the condition is a simple expression derived from one observable:

```javascript
// ProjectAutomationRuleView pattern — src/js/project/admin.js
this.predefined_match_arg = ko.observable();
this.is_match_arg_visible = ko.computed(() => {
  return this.predefined_match_arg() === "";
});
this.is_all_versions = ko.computed(() => {
  return this.predefined_match_arg() === "all-versions";
});
```

```html
{% alter_field form.predefined_match_arg data_bind="if: true, value: predefined_match_arg" classes="manual select" %}
{% alter_field form.match_arg data_bind="enable: is_match_arg_visible" %}
{{ form|crispy }}

<div class="ui info message" data-bind="visible: is_all_versions() || is_semver_versions()">
  <span data-bind="visible: is_all_versions">All versions will be matched.</span>
</div>
```

**Rules:**
- Use `valueInit` to read the field's server-rendered initial value into a KO observable on page load.
- Use `textInput` instead of `value` when you need the observable to update on every keystroke (not just on blur).
- Use `enable` (not `visible`) to disable a field while keeping it visible in the form layout — this preserves the field's space and lets Django still validate it.
- Use `visible` for conditional info/hint messages that accompany the form.
- Do **not** use inline `style="display: none;"`. Let KO's `visible` and `if` bindings manage visibility entirely.
- Use `subscribe` when reacting involves writing to multiple observables; use `ko.computed` for simple derived booleans.

### Responsive Knockout + FUI

Use `ResponsiveView` from `src/js/core/views.js`:

```javascript
import { ResponsiveView } from "../core/views";

export class MyView extends ResponsiveView {
  static view_name = "MyView";
}
```

```html
<div class="ui menu" data-bind="css: {vertical: device.mobile()}">
```

### Toast notifications

```javascript
jquery.toast({
  message: "Operation succeeded",
  class: "success",
  position: "bottom right",
});
```

---

## Reference docs

- [FomanticUI docs](./references/fomantic-ui.md)
- [KnockoutJS docs](./references/knockoutjs.md)
- [Django templates docs](./references/django-templates.md)

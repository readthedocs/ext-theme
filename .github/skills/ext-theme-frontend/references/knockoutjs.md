# KnockoutJS Reference

Docs: https://knockoutjs.com/documentation/introduction.html  
Version used: `^3.5.1` (see `package.json`)

## Core Concepts

### Observables
```javascript
this.name = ko.observable("default");          // read: this.name()
this.name("new value");                        // write

this.items = ko.observableArray([]);           // read: this.items()
this.items.push(newItem);                      // mutating method
this.items.remove(item);                       // remove by reference

this.count = ko.computed(() => {               // derived, auto-tracks dependencies
  return this.items().length;
});

this.formatted = ko.pureComputed(() => {       // preferred over computed when no side effects
  return `${this.name()} (${this.count()})`;
});
```

### Subscriptions
```javascript
this.config.subscribe((newValue) => {
  if (newValue) {
    this.load(newValue.url);
  }
});
```

### Rate limiting (debounce)
```javascript
this.search_query = ko.observable().extend({ ratelimit: 300 });
```

## Data Bindings

### Text and HTML
```html
<span data-bind="text: name"></span>
<div data-bind="html: description_html"></div>
```

### Visibility
```html
<!-- Adds/removes the element's display — do not add inline styles -->
<div data-bind="visible: is_loading"></div>

<!-- Adds/removes from DOM entirely -->
<div data-bind="if: has_results"></div>
<div data-bind="ifnot: has_results">No results.</div>
```

Use `visible` when hiding temporarily (preserves DOM, better perf).  
Use `if` when the element should truly not exist (also removes child bindings).

Do **not** add inline `style="display:none"` — KO's `visible` binding manages display on its own:
```html
<div class="ui message" data-bind="visible: show_hint">
```

### CSS classes
```html
<div class="ui button" data-bind="css: {loading: is_loading, disabled: is_disabled}"></div>
```

### Attribute binding
```html
<a data-bind="attr: {href: url, title: label}">Link</a>
```

### Events
```html
<button data-bind="click: on_click">Click me</button>
<input data-bind="event: {keyup: on_keyup}">
```

### Forms
```html
<input data-bind="value: my_field">          <!-- updates on blur -->
<input data-bind="textInput: my_field">      <!-- updates on every keystroke -->
<select data-bind="value: selected_option, options: available_options, optionsText: 'name', optionsValue: 'id'"></select>
<input type="checkbox" data-bind="checked: is_enabled">
```

### Lists
```html
<!-- foreach on an observableArray -->
<ul data-bind="foreach: items">
  <li>
    <span data-bind="text: name"></span>   <!-- $data.name -->
    <a data-bind="click: $parent.remove_item">Remove</a>
  </li>
</ul>

<!-- Access parent context -->
$parent   — one level up
$parents[0]  — same as $parent
$root     — the ApplicationView
$data     — current item
$index()  — current index (observable)
```

### Context switching
```html
<!-- using: creates a child context -->
<div data-bind="using: ProjectListView()">
  <!-- $data is now ProjectListView -->
  <span data-bind="text: $root.show_modal"></span>
</div>

<!-- with: is deprecated, prefer using: -->
```

## Custom Bindings in this project

See `src/js/application/plugins.js` for implementations.

### `semanticui`

The most important custom binding. Calls `jquery(element).{plugin}(options)` on init:

```html
data-bind="semanticui: {dropdown: {action: 'select', onChange: on_change}}"
data-bind="semanticui: {modal: {onApprove: on_approve}}"
data-bind="semanticui: {accordion: {}}"
data-bind="semanticui: {tab: {}}"
data-bind="semanticui: {search: {apiSettings: {url: '...{query}...'}}}"
data-bind="semanticui: {sticky: {}}"
data-bind="semanticui: {progress: {total: 100, value: progress}}"
```

### `jsonInit`

Initialize an observable from `<script type="application/json">` content:

```html
<script type="application/json" data-bind="jsonInit: config">
  {"key": "{% url 'some-url' %}"}
</script>
```

### `popup`

```html
data-bind="popup: {content: 'Tip text', position: 'top center', variation: 'small'}"
```

## Patterns used in this project

### View class with `view_name`

```javascript
export class MyView {
  static view_name = "MyView";  // required for Webpack minification

  constructor() {
    this.is_loading = ko.observable(false);
  }
}
Registry.add_view(MyView);
```

### Callback from click binding

```javascript
// ApplicationView.show_modal is a good example:
show_modal(modal_id) {
  return (data, event) => {           // outer fn executes at binding time
    jquery("[data-modal-id=" + modal_id + "]").modal("show");  // inner fn on click
  };
}
```

In template: `data-bind="click: $root.show_modal('delete')"` — no `()` call needed, the method returns the callback.

### ResponsiveView

For views that adapt to viewport size (see `src/js/core/views.js`):

```javascript
import { ResponsiveView } from "../core/views";
export class MyView extends ResponsiveView {
  static view_name = "MyView";
}
```

```html
<nav class="ui menu" data-bind="css: {vertical: device.mobile()}">
```

### APIListItemView

For views over API list items with lazy loading (see `src/js/core/views.js`):

```javascript
import { APIListItemView } from "../core/views";
export class ProjectListItemView extends APIListItemView {
  static view_name = "ProjectListItemView";

  constructor(project) {
    super(project);
    this.name = ko.observable();
    this.data.subscribe((data) => {
      this.name(data.name);
    });
  }
}
```

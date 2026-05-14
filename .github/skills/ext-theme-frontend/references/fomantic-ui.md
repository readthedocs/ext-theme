# Fomantic UI Reference

Fomantic UI (FUI) is a community fork of Semantic UI. The two are mostly compatible — FUI adds extra components and fixes bugs.

Official docs:
- FUI: https://fomantic-ui.com/introduction/getting-started.html
- SUI: https://semantic-ui.com/introduction/getting-started.html

## This project uses `fomantic-ui-less`

FUI modules are imported piecemeal in `src/css/site.less` and the jQuery plugins are loaded in `src/js/application/plugins.js`. Do NOT import the full `semantic.less` bundle — add only what's needed.

To add a new FUI module:

**CSS** — add to `src/css/site.less`:
```less
& {
  @import "fomantic-ui-less/definitions/modules/rating.less";
}
```

**JS** — add to `src/js/application/plugins.js`:
```javascript
import * as fomaticRating from "fomantic-ui-less/definitions/modules/rating.js";
```

## Key Components Quick-Reference

### Dropdown
```html
<div class="ui dropdown" data-bind="semanticui: {dropdown: {action: 'select'}}">
  <div class="text">Choose</div>
  <i class="dropdown icon"></i>
  <div class="menu">
    <div class="item" data-value="1">Option 1</div>
    <div class="item" data-value="2">Option 2</div>
  </div>
</div>
```

### Search
```html
<div class="ui search" data-bind="semanticui: {search: {apiSettings: {url: '/api/search?q={query}'}}}">
  <input class="prompt" type="text" placeholder="Search...">
  <div class="results"></div>
</div>
```

### Tab
```html
<div class="ui pointing secondary menu">
  <a class="active item" data-tab="tab1">Tab 1</a>
  <a class="item" data-tab="tab2">Tab 2</a>
</div>
<div class="ui tab active" data-tab="tab1">Content 1</div>
<div class="ui tab" data-tab="tab2">Content 2</div>
```
Activate via: `$('.menu .item').tab();` or with KO: `data-bind="semanticui: {tab: {}}"` on the menu element.

### Accordion
```html
<div class="ui accordion" data-bind="semanticui: {accordion: {}}">
  <div class="title"><i class="dropdown icon"></i>Section 1</div>
  <div class="content"><p>Content</p></div>
</div>
```

### Popup (tooltip)
```html
<button class="ui icon button"
        data-bind="popup: {content: 'Tooltip text', position: 'top center'}">
  <i class="fad fa-info icon"></i>
</button>
```

### Progress
```html
<div class="ui progress" data-bind="semanticui: {progress: {value: 45, total: 100}}">
  <div class="bar"></div>
  <div class="label">45%</div>
</div>
```

### Checkbox
```html
<div class="ui checkbox">
  <input type="checkbox" name="mycheck">
  <label>Enable feature</label>
</div>
```
Activate via: `$('.ui.checkbox').checkbox();`

### Sticky sidebar
```html
<div class="ui sticky" data-bind="semanticui: {sticky: {context: '#content'}}">
  Sidebar content
</div>
```

## Variations Cheat-Sheet

### Segment variations
`ui basic|raised|stacked|very padded|padded segment`

### Button variations
`ui primary|secondary|basic|negative|positive|loading|disabled button`
`ui tiny|small|medium|large|big|huge|massive button`

### Label variations
`ui basic|tag|ribbon|pointing label`

### Icon placement
`<i class="fad fa-<name> icon"></i>` — always add `icon` class after the FA class.

## Dark Mode

Dark mode is handled via a `data-theme` attribute on `<html>` (`light`/`dark`/`system`) and the `src/css/dark.less` stylesheet. FUI's `inverted` variation works well for dark context:

```html
<div class="ui inverted segment">...</div>
```

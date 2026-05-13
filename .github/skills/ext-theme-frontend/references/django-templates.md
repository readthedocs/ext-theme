# Django Templates Reference

Django 4.x template docs: https://docs.djangoproject.com/en/6.0/topics/templates/

## Template Inheritance

```html
{% extends "projects/base.html" %}

{% block title %}Page Title{% endblock title %}

{% block content %}
  ...
{% endblock content %}
```

Always name `{% endblock %}` with the block name for readability: `{% endblock content %}`.

## Template Tag Libraries

```html
{% load i18n %}              <!-- trans, blocktrans -->
{% load static from static %}
{% load crispy_forms_tags %}  <!-- crispy, |crispy -->
{% load ext_theme_tags %}     <!-- alter_field, webpack_static, settings_dashboard -->
{% load projects_tags %}
{% load core_tags %}
```

## Internationalization

```html
{% load i18n %}

{# Simple string #}
{% trans "Hello world" %}

{# With variable — use blocktrans #}
{% blocktrans with name=project.name %}Project: {{ name }}{% endblocktrans %}

{# Assign to variable #}
{% trans "Save" as save_label %}
<button>{{ save_label }}</button>

{# Plural #}
{% blocktrans count n=items|length %}
  {{ n }} item
{% plural %}
  {{ n }} items
{% endblocktrans %}
```

## Static Files

```html
{% load static from static %}
<img src="{% static 'readthedocsext/theme/images/logo.svg' %}">

{# For Webpack-hashed assets use webpack_static #}
{% load ext_theme_tags %}
<link rel="stylesheet" href="{% webpack_static 'readthedocsext/theme/css/site.css' %}">
```

## ext_theme_tags

### `alter_field`

Adds or overrides attributes/classes on a Django form field before rendering with crispy.

```html
{% load ext_theme_tags %}
{% alter_field form.my_field data_bind="value: my_observable" %}
{% alter_field form.my_field classes="manual select" data_bind="if: true, value: my_obs" %}
{{ form|crispy }}
```

Note: `alter_field` must come **before** `{{ form|crispy }}`.

### `settings_dashboard`

Passes Django settings to JavaScript via a `<script>` JSON tag:

```html
{% settings_dashboard as settings %}
{{ settings|json_script:"site-config" }}
```

### `webpack_static`

Gets the hashed URL for a Webpack-built asset:

```html
{% webpack_static "readthedocsext/theme/css/site.css" %}
```

## Forms with Crispy

```html
{% load crispy_forms_tags %}
<form class="ui form" method="post" action=".">
  {% csrf_token %}
  {{ form|crispy }}
  <button class="ui primary button" type="submit">Save</button>
</form>
```

To add Knockout bindings to individual fields:

```html
{% alter_field form.version_type data_bind="value: version_type" %}
{{ form|crispy }}
```

## URL Reversing in Templates

```html
<a href="{% url 'project_detail' project.slug %}">View project</a>

{# Pass to JavaScript via jsonInit #}
<script type="application/json" data-bind="jsonInit: config">
  {"url": "{% url 'api:projects-list' %}"}
</script>
```

## CSRF Token

Always include in POST forms:
```html
<form method="post">
  {% csrf_token %}
  ...
</form>
```

For AJAX requests, pass the token from cookies or from a template variable:
```javascript
headers: { "X-CSRFToken": this.csrfToken }
```

In templates:
```html
<my-element csrf-token="{{ csrf_token }}"></my-element>
```

## Conditionals and Loops

```html
{% if condition %}
  ...
{% elif other %}
  ...
{% else %}
  ...
{% endif %}

{% for item in items %}
  {{ forloop.counter }}  {# 1-indexed #}
  {{ item.name }}
{% empty %}
  <p>No items.</p>
{% endfor %}
```

## Template Includes

```html
{% include "includes/utils/messages.html" %}

{# Pass extra context to the included template #}
{% include "projects/partials/header.html" with versions_active="active" %}

{# Restrict context to only what's passed #}
{% include "partials/foo.html" with foo=bar only %}
```

## Template Comments

```html
{# Single line comment #}

{% comment %}
  Multi-line comment
{% endcomment %}
```

## Escaping

By default Django auto-escapes HTML. To render raw HTML:
```html
{{ value|safe }}       {# Only use when the value is trusted #}
{% autoescape off %}{{ value }}{% endautoescape %}
```

In JS web components, use `DOMPurify` + `unsafeHTML` for API-sourced content (never `safe` in templates).

Templates
=========

Templates are found in the ``readthedocsext.theme`` Django application in this
package. These templates are put at the beginning of the template load order
when you enable the theme on your local instance.


Standards
---------

Templates
~~~~~~~~~

A few of the conventions used in templates are:

- Inline and per-template JavaScript were both dropped. This is partly to avoid
  inline JavaScript and newer CSP rules, but also to avoid squirelling untested
  JavaScript away inside HTML sources.
- Templates use a singular base view for all CRUD listing interfaces, avoiding
  conflicting listing UI patterns.
- All UI is constructed using native SemanticUI components.
  This removes almost all need for custom CSS and custom JS driving dynamic elements.
  SemenaticUI/FomanticUI usage is covered in :doc:`stylesheets`.
- Most of the heavy lifting in the template is still done with Django template code.
- In places where views are interactive and more dynamic, Knockout model views
  are used to glue some amount of JavaScript to template code.
- FomanticUI components are configured inside HTML in the templates, using some
  Knockout helpers like the :func:`~application.plugins.semanticui` binding.
- You will see JSON configuration in places where we pass Django URLs or
  translations through to our JS.

.. _FomanticUI documentation: https://fomantic-ui.com/

Python
~~~~~~

A modern Python is required. The application uses 3.10 currently. Code is
formatted automatically using Black.

HTML
~~~~

We aren't strict about HTML, but a few rules to guide HTML authoring are:

- Element classes and styles should always rely on FomanticUI native elements.
- Elements do not use inline styles defined in tags.
- When in doubt, use a ``<div>`` for the element.
  Most FUI components/elements can be constructed on any valid HTML tag.
- Don't use extra elements like ``<br />`` to fix spacing issues.
  You likely want multiple paragraphs, ``class="ui padded segment"``, or something similar instead.

.. _js-json-config:

Making template changes
-----------------------

Creating new model listing views
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

One of the main goals of this project was to reign in all of the various
patterns we've used for model listing and creation views. We've accumulated
various permutations of listing views, with and without creation/deletion forms
in the same view, and with and without metadata or actions on each table row.

The new model listing pattern:

- Uses a single line for each row, but cells in the row have a header above the
  cell value
- Includes a spot on the left for an icon or image
- Includes a spot on the right for action buttons
- Uses two columns on each row for additional metadata
- Is viewport fluid, and at least wraps at tablet and phone viewport sizes
- Uses a modal for confirming deletion. Previously, only some views had a
  confirmation view and it was always a separate page load
- :ref:`Shows helpful placeholder content <api-template-list-placeholder>`
  when there is nothing to list.

You will find several parts when working with new or existing model listing pages:

Model listing template
   This is the template file that is normally rendered by the listing view.
   You'll find these to be mostly skeleton templates which only serve to include
   the listing _partial_ template.

   An example of this template would be ``projects/domain_list.html``.

Listing partial template
   These templates extend the base listing template to provide a common
   interface for _all_ listing pages. Most newer views easily fit in this
   pattern, but some of our older views had some differences like including a
   creation form inside the listing view.

   An example of this template would be ``projects/partials/project_list.html``.

Common base listing template
   The base template sets up the table and table rows, with blocks for
   empty listing placeholder content, row action buttons, row header, row
   metadata, etc.

   For a full listing and description of the blocks in the base template,
   review :ref:`the API reference <api-template-crud-list>`.

Configuring views with application data
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In the past, we relied on JS to provide frontend code with backend data, but to
avoid executed inline code this can use JSON instead, using the
:js:func:`~application.plugins.jsonInit` data binding.

Because of growing concerns with CSP, we avoid inline scripts entirely. However,
with an application that is split between backend Python and frontend code we do
need to pass some information between the two. The API is used whenever we can,
but it also has it's own limitations.

Instead of using inline scripts to configure Knockout views, we only need to
pass in the relevant configuration between the HTML template and our JS. To do
this we are using JSON.

In several places, templates use HTML like the following to pass in
configuration to a Knockout view:

.. code:: html

    <script type="application/json" data-bind="jsonInit: config">
    {
      "api_url": "{% url "projects-versions-list" project.slug %}",
      "errors": {
        "noResults": "{% filter escapejs %}{% trans "No matching versions found" %}{% endfilter %}"
      }
    }
    </script>

:func:`~application.plugins.jsonInit` is a custom Knockout binding which reads
the JSON in the HTML template into a view observable attribute, ``config``. The
Knockout view can then use this configuration directly, and any observables
using ``config`` will be updated on page load.

This keeps URL rendering in the HTML template, it keeps translation strings
almost entirely in the HTML template, and avoids having to do nonces/etc to
allow secure inline JS.

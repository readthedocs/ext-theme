Templates
=========

Templates are found in the ``readthedocsext.theme`` Django application in this
package. These templates are put at the beginning of the template load order
when you enable the theme on your local instance.

A few of the conventions used in templates are:

- Inline and per-template JavaScript were both dropped. This is partly to avoid
  inline JavaScript and newer CSP rules, but also to avoid squirelling untested
  JavaScript away inside HTML sources.
- Templates use a singular base view for all CRUD listing interfaces, avoiding
  conflicting listing UI patterns.
- All UI is native SemanticUI components. This removes almost all need for
  custom CSS.
- Most of the heavy lifting in the template is done with Django template code.
- In places where views are interactive and more dynamic, Knockout model views
  are used to glue some amount of JavaScript to template code.
- SemanticUI components are configured inside templates for the most part, using
  some Knockout helpers like the :func:`application.plugins.semanticui` binding.
- You will see JSON configuration in places where we pass Django URLs or
  translations through to our JS.

.. _js-json-config:

JSON configuration
------------------

In the past, sites used inline JavaScript to instantiate Knockout views and set
up other code. For example:

https://github.com/readthedocs/readthedocs.org/blob/7.2.0/readthedocs/templates/builds/regexautomationrule_form.html#L14-L19

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

:func:`application.plugins.jsonInit` is a special Knockout handler which reads
the JSON in the HTML template into a view observable attribute, ``config``. The
Knockout view can then use this configuration directly, and any observables
using ``config`` will be updated on page load.

This keeps URL rendering in the HTML template, it keeps translation strings
almost entirely in the HTML template, and avoids having to do nonces/etc to
allow secure inline JS.

JavaScript
==========

Conventions
-----------

Some conventions that you will find used throughout the JS sources are:

.. _js-json-config:

JSON configuration
~~~~~~~~~~~~~~~~~~

In the past, sites used inline JavaScript to instantiate Knockout views and set
up other code. For example:

https://github.com/readthedocs/readthedocs.org/blob/7.2.0/readthedocs/templates/builds/regexautomationrule_form.html#L14-L19

Because of growing concerns with CSP, it's advised to avoid inline scripts.
However, with a split application that has both backend and frontend code that
drives the application, this is restrictive. It is not impossible however.

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

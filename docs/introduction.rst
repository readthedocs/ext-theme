Introduction
============

This is an overview of the tools, dependencies, patterns, and guidelines for
working on the application dashboard.

.. contents::
   :local:

What is this?
-------------

This repository is the next generation dashboard for the Read the Docs
application. Read the Docs Community users can try this new dashboard by
visiting https://beta.readthedocs.org and logging in with their normal user
account. It is added as a Django application to an existing Read the Docs
instance.

On the technical side, it is a replacement set of templates, JavaScript code,
and stylesheets that replaces the legacy dashboard used by both Read the Docs
Community and Read the Docs for Business.

Technical background
--------------------

Dependencies
~~~~~~~~~~~~

This project uses a similar set of dependencies to our other projects, to keep
our front end stack mostly similar. These pieces are:

FomanticUI/SemanticUI
   FomanticUI is the active project name, though these refer to the same thing
   mostly. FUI/SUI is a style framework for components and elements, but more
   importantly, it has native interactive components and JS driven UI that we do
   not need to maintain ourselves -- search components, tabs, popups, modals,
   menus, etc. The goal with FUI is to avoid core team writing CSS and JS for
   basic elements. In fact, there is very little CSS used at all. Currently, the
   application uses less than 100 lines of CSS customization to elements.

   FUI/SUI use Less.js as a CSS compiler. Compilation is performed during the
   Webpack bundle build process. FUI relies on jQuery still, as all plugins are
   implemented on top of jQuery.

Knockout.js
   To reuse much of the code we already have, Knockout.js was used for what API
   driven interfaces we do have. Where possible, views are driven by application
   logic and Django templates however.

   UI that requires dynamic manipulation, two-way data binding, or API reponse
   rendering will use Knockout.js.

Tools used
~~~~~~~~~~

Webpack
   Creates the web bundles containing our dashboard JavaScript code and
   dependencies. Large dependencies are separated into their own bundle, and
   infrequently used dependencies are used through Webpack dynamic imports.

   Webpack uses Babel for ES5 transpilation, but eventually this can be removed
   in favor of a pure ES6 build.

Prettier and Black
   JavaScript code and some data files are automatically formatted using
   Prettier, and Black is used to format Python code. Both tools use a stock
   configuration.

Standards
~~~~~~~~~

This will eventually be defined at a wider level, but code standards used here
are:

Python
   A modern Python is required. The application uses 3.10 currently. Code is
   formatted automatically using Black.

JavaScript
   Modern JavaScript code patterns are required. This means ES6 patterns for
   object and class structure, variable scoping, and module reuse.

   JavaScript should be maintained inside the JavaScript source library, and
   not maintained inside ``<script>`` tags inside templates. Code should have
   unit tests written where possible.

   Code must be automatically formatted by Prettier to pass CI.

   .. seealso::
      :doc:`resources`
         Resources on learning modern JavaScript

HTML
   We aren't strict about HTML, but a few rules to guide HTML authoring are:

   - Element classes and styles should always rely on FomanticUI native elements.
   - Elements do not use inline styles in tags.
   - When in doubt, use a ``<div>`` for the element, but most FUI
     components/elements can be constructed on any valid HTML tag.
   - Don't use extra elements like ``<br />`` to fix spacing issues. You likely
     want multiple paragraphs, ``class="ui padded segment"``, or something similar instead.
   
CSS
   CSS should not be required unless dealing with a complex or very custom
   interface, or fixing a bug with a FomanticUI element. In fact, if you are
   writing CSS, you should probably review what you are doing with FomanticUI
   first instead.

   CSS styles are compiled by Less.js, so CSS can rely on features from the
   compiler where CSS is indeed required.

Working on the dashboard
------------------------

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
- Shows helpful placeholder content when there is nothing to list

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

Using FomanticUI/SemanticUI
~~~~~~~~~~~~~~~~~~~~~~~~~~~

Where to start
``````````````

The `FomanticUI documentation`_ is the first place you should look. The
documentation is split up between components. _Elements_ are components that can
be used without additional JavaScript, where components like _collections_ and
_modules_ can require some JavaScript to use.

Each element has a large number of variations that you can use which can alter
spacing, padding, color, size, positioning, and layout. You can see the FUI/SUI
class structure used for the examples by clicking the show source button above
each example.

For example, the `FomanticUI segment documentation`_ shows all sorts of
variations, of which we commonly use ``padded``, ``fitted``, ``scrolling``, and
``basic``.

.. tip::
   It's best to look through other templates to see what patterns were used.
   There are many variants, many of which we don't use, and so there still is a
   lot of variability of what you can output using the framework natively.

.. _FomanticUI documentation: https://fomantic-ui.com/
.. _FomanticUI segment documentation: https://fomantic-ui.com/elements/segment.html

Which element do I use?
```````````````````````

If you are creating a new model listing UI, much of the work is already done
using the base model listing template. Rely on this to create the view instead
of doing anything one-off or custom.

If you are creating a new UI that can't rely on a base template, you might have
to decide what elements would be the best fit. This can be fairly subjective, so
it can be helpful to look at what similar views may have used in the past.

In some cases, there might be a clear solution to your problem though:

How do I add more vertical spacing?
   You can wrap the element you are creating in with a ``padded segment`` [1]_.
   This can introduce unwanted horizontal padding as well though. You can use a
   ``fitted segment`` [2]_ in combination to control _which_ direction is
   padded. If you don't want a border around the element, use a ``basic
   segment`` [3]_.

How do I make a responsive layout?
   You are doing something very custom if you are this deep, so take some extra
   time to experiment with layout. You will be using a ``grid`` and ``columns``
   [4]_ to construct the layout, and should design primarily for desktop. Use
   varying column widths, like ``ten wide desktop fourteen wide tablet sixteen
   wide mobile`` for granular control of the layout. Make sure to test the
   various viewport sizes as you go.

   Sometimes, you might run into a place where it makes more sense to alter the
   order of columns, or hide columns entirely, on narrow viewport sizes. You can
   use ``computer only column`` or ``reversed column`` to tune column display
   and ordering.

How do I use icons?
   _This is special!_ The native FUI/SUI icons do no include the icon set we want
   to use in most cases, FontAwesome Duotone, so we use the icon library more
   directly instead.

   You will find the classes for icons deviates from the FUI/SUI docs, which is
   intentional. To use an icon, find the icon you want on the FontAwesome site,
   and use the classes they recommend, followed by ``icon`` (which is still
   required for FUI/SUI additional styling).

   The end result should be something like:

   ```<i class="fad fa-search icon"></i>```

   We are currently using a hosted kit from Font Awesome, but will eventually
   likely compile something ourselves. We have an account with Font Awesome and
   have multiple kits set up on our account there.

.. [1] https://fomantic-ui.com/elements/segment.html#padded
.. [2] https://fomantic-ui.com/elements/segment.html#fitted
.. [3] https://fomantic-ui.com/elements/segment.html#basic
.. [4] https://fomantic-ui.com/collections/grid.html 

Using Knockout
~~~~~~~~~~~~~~

TBD

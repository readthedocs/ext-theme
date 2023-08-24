JavaScript
==========

There are some new patterns and conventions that you will find used throughout
the sources here.

- Try not to write JS first. If you are trying to do something with JS code,
  there is a good chance the FomanticUI component already does what you want
  natively.
- If you need JS for a dynamic view, it should be encapsulated in a view class,
  and should not be native jQuery, a one-off ``<script>`` in a template.
- Don't use jQuery directly, stick to using two way bindings through Knockout.
  It's confusing to have jQuery sprinkled in to model view style code that is
  already performing two way binding between JS and our templates.

Here are a few places you probably want to understand more about our JS:

:class:`ApplicationView`
    The top level model view, a wrapper that provides globals to templates

:func:`application.plugins.semanticui`
    You'll see this used a lot. It's used to instantiate SemanticUI modules
    from templates.

Standards
---------

Modern JavaScript code patterns are required. This means ES6 patterns for object
and class structure, variable scoping, and module reuse.

JavaScript should be maintained inside the JavaScript source library, and not
maintained inside ``<script>`` tags inside templates. Code should have unit
tests written where possible.

Code must be automatically formatted by Prettier to pass CI.

Dependencies
------------

Knockout.js
   To reuse much of the code we already have, Knockout.js was used for what API
   driven interfaces we do have. Where possible, views are driven by application
   logic and Django templates however.

   UI that requires dynamic manipulation, two-way data binding, or API reponse
   rendering will use Knockout.js.

Tools used
----------

Webpack
   Creates the web bundles containing our dashboard JavaScript code and
   dependencies. Large dependencies are separated into their own bundle, and
   infrequently used dependencies are used through Webpack dynamic imports.

   Webpack uses Babel for ES5 transpilation, but eventually this can be removed
   in favor of a pure ES6 build.

Prettier
   JavaScript code and some data files are automatically formatted using
   Prettier. The default configuration is used.


Using Knockout
--------------

When to use Knockout?
~~~~~~~~~~~~~~~~~~~~~

Knockout.js will be required if you want to use API data in a view or want two
way data binding on DOM elements. Two way data binding means underlying data on
the JS view can update the DOM and updates to the DOM can update the underlying
data. This is important for providing user feedback into the page display. For
example, a user expanding an output line on the build detail page updates the
data model for the currently selected build command, the currently selected
build output line, and deselects all previously selected commands/lines.

For this project, if you find yourself writing jQuery or any JS really, you
should be writing a Knockout view.

Writing a new view
~~~~~~~~~~~~~~~~~~

You can add a new view in a new path, ``src/js/foo/index.js`` for example, and
make sure that file is imported into the application at
``src/js/application/index.js``.

You will need to register the new view with the application instance, similar to
this:

https://github.com/readthedocs/ext-theme/blob/e5662b931a9363dd6e3f6af1d595d5d4759278c7/src/js/build/list.js#L74

This makes the view available to the root Knockout view, essentially a global in
the application JS.

How do I use a view?
~~~~~~~~~~~~~~~~~~~~

The view above is used in our build listing view:

https://github.com/readthedocs/ext-theme/blob/e5662b931a9363dd6e3f6af1d595d5d4759278c7/readthedocsext/theme/templates/builds/partials/build_list.html#L9

The resulting HTML is something like:

.. code:: html

   <div data-bind="with: BuildListView()">...</div>

This instantiates the new ``BuildListView``, and the model view observables,
attributes, and methods can all be called/referenced from child elements in the
``div``.

.. seealso::
   :js:class:`ApplicationView`
      An overview of context nesting of data bindings

Other resources
---------------

:doc:`api/js/views`
   API reference for existing Knockout views

:doc:`resources`
 Resources on learning modern JavaScript

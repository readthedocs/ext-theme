Read the Docs - ext-theme
=========================

This package is the next generation theme for the Read the Docs application UI.

This is the current UI and templates for the Read the Docs application.
It includes updated templates, new JavaScript sources, and UI based on FomanticUI (SemanticUI).
It is an addition to the ``readthedocsext`` package, and provides the ``theme`` Django application.

Installation
------------

This package is automatically installed by default when building the application images.

You will want to check this repository out in the same path as your other
repositories if you plan on doing development on the files in this repository:

.. code:: console

   % git clone --recurse-submodules git@github.com:readthedocs/ext-theme.git

Usage
-----

Just start your local application environment like normal to begin using this package.

This will start the Webpack dev server container for hot/live reload of compiled assets.
You do not need to rebuild the asset files until you open a pull request.

Testing
-------

Our standard JS stack uses Jest for testing. Execute tests as normal:

.. code:: console

   % npm test

Linting
-------

We run Prettier for most static files and djlint for Django templates.
Linting and formatting is done using `pre-commit`:

.. code:: console

   % pre-commit

Linting checks are performed at CI and will produce errors.

Building
--------

CI checks will also check to see that the built CSS and JavaScript assets are up
to date. When you submit a pull request, you'll need to rebuild the asset files
included in the repository here:

.. code:: console

   % npm run build

More resources
--------------

`ext-theme documentation <https://docs.ops.verbthenouns.com/projects/ext-theme/en/latest/>`_
    Some documentation of patterns, conventions, and API reference

`JavaScript reference <https://docs.ops.verbthenouns.com/projects/ext-theme/en/latest/api/javascript.html>`_
    API reference for JavaScript front end code

`Template API reference <https://docs.ops.verbthenouns.com/projects/ext-theme/en/latest/api/templates.html>`_
    Template reference and documentation

`Learning JavaScript <https://github.com/readthedocs/meta/discussions/114>`_
    Some resources on learning modern JavaScript

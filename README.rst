Read the Docs - ext-theme
=========================

This package aims to be a drop in replacement for the current templates for the
Read the Docs application. This will replace the entire UI of Read the Docs, and
uses a number of updated patterns for templates and front end code. 

All of the heavy lifting for the UI comes from FomanticUI (SemanticUI), and
custom CSS is reduced to the bare minimum required.

.. warning::
    This package is still alpha level quality and is not ready for general use.

Usage
-----

You will need a Read the Docs application environment configured to use this
package.

The recommended way of starting your local instance is:

.. code:: console

   % inv docker.up --webpack --ext-theme  # `-we` for short

This will start the Webpack dev server container for hot/live reload of compiled
assets and will alter the template load pattern to make use of templates in this
package first. You do not need to rebuild the asset files until you open a pull
request.

You can run your local instance without Webpack, but you will lose live and hot
reload for the front end assets and you will need to manually run
``collectstatic`` after every change to the front end assets.

Testing
-------

Our standard JS stack uses Jest for testing. Execute tests as normal:

.. code:: console

   % npm test

Linting
-------

Our standard JS stack uses Prettier for linting. Test linting with:

.. code:: console

   % npm run lint

Reformat code with:

.. code:: console

   % npm run format

Linting checks are performed at CI and will produce errors.

Building
--------

CI checks will also check to see that the built CSS and JavaScript assets are up
to date. When you submit a pull request, you'll need to rebuild the asset files
included in the repository here:

.. code:: console

   % npm run build

Resources
---------

`ext-theme documentation <https://read-the-docs-ext-theme.readthedocs-hosted.com/en/latest/index.html>`_
    Some documentation of patterns, conventions, and API reference

`JavaScript reference <https://read-the-docs-ext-theme.readthedocs-hosted.com/en/latest/api/javascript.html>`_
    API reference for JavaScript front end code

`Template API reference <https://read-the-docs-ext-theme.readthedocs-hosted.com/en/latest/api/templates.html>`_
    Template reference and documentation

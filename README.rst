Read the Docs - ext-theme
=========================

This package is the next generation theme for the Read the Docs application UI.

It aims to be a drop in replacement for the current templates for the Read the
Docs application and will replace the entire UI for the application. It includes
updated templates, new JavaScript sources, and UI based on FomanticUI
(SemanticUI). It does still retain most of the patterns and tools already used
in the existing application templates. It is an addition to the
``readthedocsext`` package, and provides the ``theme`` Django application.

.. warning::
    This package is still alpha level quality and is not ready for general use.

Installation
------------

If you built your local development image with a GitHub token defined, this
package is already installed in your built image. This should be the default for
core team.

If not, follow the application `installation directions <https://dev.readthedocs.io/en/latest/install.html>`__
again, and make sure to set the neccessary GitHub token environment variables.

You will want to check this repository out in the same path as your other
repositories if you plan on doing development on the files in this repository:

.. code:: console

   % git clone --recurse-submodules git@github.com:readthedocs/ext-theme.git

Usage
-----

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

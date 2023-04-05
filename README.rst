Read the Docs - ext-theme
=========================

.. image:: https://readthedocs.com/projects/read-the-docs-ext-theme/badge/?version=latest&token=e11b930fb8072aa0cf06e40a9323d5fa9d6493540281089e888170acf3617042
    :target: https://docs.ops.verbthenouns.com/projects/ext-theme/en/latest/?badge=latest
    :alt: Documentation Status

This package is the next generation theme for the Read the Docs application UI.

It aims to be a drop in replacement for the current templates for the Read the Docs application and will replace the entire UI for the application.

It includes updated templates, new JavaScript sources, and UI based on FomanticUI (SemanticUI).
It does still retain most of the patterns and tools already used in the existing application templates.

It is an addition to the ``readthedocsext`` package, and provides the ``theme`` Django application.

.. warning::
    This package is still alpha level quality and is not ready for general use.

Getting started
---------------

Clone both the readthedocs.org repo and ext-theme alongside each other:

.. code:: console

   git clone git@github.com:readthedocs/readthedocs.org.git
   git clone git@github.com:readthedocs/ext-theme.git

Before moving on,
you should create a personal token (fine-grained or classic) with read rights to ext-theme (this repo) and the other private repo `readthedocs/readthedocs-ext <https://github.com/readthedocs/readthedocs-ext/>`__ and figure out a way to load the credentials into the ``GITHUB_USERNAME`` and ``GITHUB_TOKEN`` environment variables while you are calling ``inv docker.build`` (see below).

In order to run the theme,
you need to ``cd`` to the readthedocs.org folder:

.. code:: console

   # Define GITHUB_USER and GITHUB_TOKEN
   inv docker.build

   # Go to the readthedocs.org project to run the docker-compose setup
   cd readthedocs.org
   inv docker.up --webpack --ext-theme  # `-we` for short
   
   # Now open a different terminal session for developing ext-theme
   cd ext-theme
   # Create some virtual environment. Example using virtualenvwrapper
   mkvirtualenv ext-theme
   
   # Install pre-commit
   pip install pre-commit
   pre-commit install

If you want to use a different directory layout and store ``../ext-theme`` somewhere else,
then define ``RTDDEV_PATH_EXT_THEME`` in your environment but use a relative path to ``readthedocs.org``.

How does it work?
-----------------

The Docker Compose setup works as the normal setup for readthedocs.org would do.

But it will *also* start a Webpack dev container for hot/live reload of compiled assets and will alter the template load pattern to make use of templates in this package first.
You do not need to rebuild the asset files until you open a pull request.

You can run your local instance without Webpack,
but you will lose live and hot reload for the front end assets and you will need to manually run ``collectstatic`` after every change to the front end assets.

Testing
-------

Our standard JS stack uses Jest for testing.
Execute tests as normal:

.. code:: console

   % npm test

Linting
-------

Our standard JS stack uses Prettier for linting.
Test linting with:

.. code:: console

   % npm run lint

Reformat code with:

.. code:: console

   % npm run format

Linting checks are performed at CI and will produce errors.

Building
--------

CI checks will also check to see that the built CSS and JavaScript assets are up to date.

When you submit a pull request,
you'll need to rebuild the asset files included in the repository here:

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

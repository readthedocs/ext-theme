Stylesheets
===========

This repository uses our base FUI/SUI theme, which is shared with our website.

https://github.com/readthedocs/sui-common-theme/

In this repository, there are some additional styles and elements that are
specific to our application or that don't need to be defined at our common
theme. Many of the styles are small bug fixes that don't require additional
documentation, but there are some styles and new elements that are only found
and used in this repository. Each section names the source file it documents,
relative to ``src/``.

Utilities
---------

Knockout ``visible`` binding
~~~~~~~~~~~~~~~~~~~~~~~~~~~~

``sui/themes/rtd-application/globals/site.overrides``

In standard Knockout there is a ``visible`` data binding, but this
injects a hard coded ``style="display: none;"`` when the binding is false.
This makes default styling on initial load hard with CSS and tends to
flash the element to the user, before the JS loads.

In standard Knockout, this would look like:

.. code:: html

    <div data-bind="visible: is_showing" style="display: none;"></div>

Using this ``.ko.hidden`` class and the ``css`` binding, this example would instead be:

.. code:: html

    <div class="ko hidden" data-bind="css: { hidden: !is_showing() }"></div>

.. note::
    When used as an observable name, executing the observable as a function
    is not required. In the second example, due to nesting and value negation, we
    have to call the observable as a function, ``is_showing()``.

Images
------

Avatar overlapping variant
~~~~~~~~~~~~~~~~~~~~~~~~~~

``sui/themes/rtd-application/elements/image.overrides``

Used to create stacking avatar bubbles for maintainer and team member lists.

.. code:: html

    <div class="ui overlapping avatar images">
      <img class="ui image" src="..." />
    </div>

Labeled image variant
~~~~~~~~~~~~~~~~~~~~~

``sui/themes/rtd-application/elements/image.overrides``

An image with a label next to it, used for the logo and site name on the
entrance pages. The stacked variant puts the label under the right edge of
the image instead, tucked into the space below it, so the header keeps the
logo at full size without growing in either direction.

.. code:: html

    <a class="ui labeled image" href="...">
      <img class="ui image" src="..." />
      <span class="ui label">Community</span>
    </a>

    <a class="ui stacked labeled image" href="...">...</a>

Tables
------

Command table variant
~~~~~~~~~~~~~~~~~~~~~

``sui/themes/rtd-application/collections/table.overrides``

This is a special table, used solely on the build detail page to list
commands and steps executed. There is some unique CSS rules here to support
command highlighting and ANSI sequences.

.. code:: html

    <div class="ui command table">
      ...
    </div>

Each command is made of up two rows:

- The first row has two columns, a dropdown expander icon and the
  command executed.
- The second row is normally hidden until collapsed open, it contains
  two columns: the line number and line contents for each line of output in
  STDOUT.

The STDOUT styling supports ANSI color codes through special classes
that should be added by the backend exectuion through Docker:

.. code:: html

    <span class="ansi-black-fg">...</span>

.. note:: ANSI sequences are not yet supported by the build backend.

Dark mode
---------

``css/dark.less``

The dark theme entrypoint is a placeholder to give Webpack a separate source
file to use as an entrypoint, which is needed because Webpack is doing some
file splitting based on the entrypoint name. The dark theme styles themselves
live next to the light styles, wrapped in the ``.dark-theme-override()`` mixin.

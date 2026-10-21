Template API
============

Shared templates and includes used to build the dashboard UI. Each section
names the template it documents, relative to ``readthedocsext/theme/templates``.

Common list view
----------------

.. _api-template-crud-list:

Shared list base
~~~~~~~~~~~~~~~~

``includes/crud/table_list.html``

This is the shared template that is used to produce a consistent list view.
All list views extend this common template, and so all list views share layout
and  functionality.

Template parameters
^^^^^^^^^^^^^^^^^^^

.. describe:: objects

    This is the queryset instance that the list view will iterate over. Views
    use the context variable ``objects`` by default, but some of our views can
    also use custom context variables, like ``projects`` or ``project_objects``.

.. describe:: skip_pagination

    **Boolean, default=False**. Skip pagination calls and links

List top menu blocks
^^^^^^^^^^^^^^^^^^^^

.. describe:: view_binding

    This is used to apply a Knockout ``data-bind``, used when the list is
    JS/Knockout driven UI. This is the case for any list view that has dynamic
    user interactions for each list item.

    .. seealso::
        Views like the project list view and the project detail (or project
        version list view) show how this data binding would be configured.

.. describe:: top_left_menu_items

    This is the block used to add list view filter elements to the top of the
    list.

.. describe:: top_right_menu

    This is the parent element for where we will insert an "Add" button. You
    shouldn't need to alter this unless you are doing something different
    with this block.

    Contains ``top_right_menu_items``, which similarly doesn't normally require
    overriding, and the child ``create_button``, which is the most common to
    override

.. describe:: top_right_menu_itmes

    Similar to ``top_right_menu``, this doesn't normaly require overriding. It
    might be used if you need multiple buttons on the top right of the list.

    You most likely want to override ``create_button``

.. describe:: create_button

    This is the button that will usually link to a new page, or open a modal,
    to create a new object type for the object list -- ie, create a new webhook
    in the webhook list view.

.. _api-template-list-placeholder:

Placeholder blocks
^^^^^^^^^^^^^^^^^^

The placeholder section is visible if there are no instances in the ``objects``
queryset. This would usually provide some onboarding level help, directing
the user to docs or object creation.

The placeholder block ultimately uses an `FUI placeholder segment`_.
The placeholder can include an icon, heading, paragraph content,
and should at least have a link out to documentation or a link to an admin page.

This aims to replace a minimalist pattern of just a simple sentence: "No projects found", etc.

.. _FUI placeholder segment: https://fomantic-ui.com/elements/segment.html#placeholder-segment

.. describe:: list_placeholder

    Block to replace the whole placeholder content section. Useful if you
    want to do something custom, like a divider placeholder.

.. describe:: list_placeholder_icon

    Override this if you want to remove the icon completely.

.. describe:: list_placeholder_icon_class

    This is the most common to override, and just specifies the icon class
    name to use in the placeholder header.

.. describe:: list_placeholder_header

    The header text to use in the placeholder

.. describe:: list_placeholder_text

    The descriptive text to use in the placeholder, below the header

Item list blocks
^^^^^^^^^^^^^^^^

The item list is where we iterate over each item in the ``objects``
queryset. Each item is a "row" in this list, and is comprised of an initial
row with the most important information, a second row with metadata and
extra links, and a right floating menu for all of the actions that can be
attributed to each list item. The right menu is always an icon menu.

.. describe:: list

    You shouldn't need to override this, as this removes **all** child
    blocks.

.. describe:: list_classes

    Also not common to override. The standard styles are used for all list
    views, but this is available if you need a custom style to the parent
    unordered list.

.. describe:: list_item_start

    This is the opening tag for the list item. It can be used in some cases
    to either provide a Knockout binding to the list item, or perhaps
    customize the list item classes. Neither should be common.

.. describe:: list_item

    The contents of the list item element. If you override this element,
    be sure to replicate all of the child structure here.

.. describe:: list_item_right_column

    Block to override the entire contents of the right column. It should
    not be necessary to override this content, except in the case of a big
    edge case. Try overriding the column classes before you go this far.

.. describe:: list_item_right_column_classes

    The classes applied to the right column. This column is where the list
    item button menu is located, and is normally right aligned and collapses
    down to a narrow column.

    Default: `right aligned collapsing`

.. describe:: list_item_right_menu

    Contains the ``list_item_right_buttons``. You might need to override
    this if your buttons are custom actions instead of menus.

.. describe:: list_item_right_buttons

    A list of ``<a class="ui icon button" />`` elements. Can also contain
    dropdown menus.

    .. seealso::
        The project version list view, for and example of including drop
        down menu buttons.

.. describe:: list_item_image

    List item left image or icon. See ``list_item_icon`` for using a large
    icon on the left of the row, it's implemented as a child block here
    though.

    Empty this block out if you don't need an image/icon.

.. describe:: list_item_icon

    Use an icon instead of an image. Technically, this still uses a false
    image, in order to avoid spacing/width issues with just icons.

.. describe:: list_item_header

    The header text for the list item. This compromises the first row of
    the list view and should contain only the most important information.

    Default: a string representation of the instance, for debugging.

.. describe:: list_item_header_classes

    The classes attached to the header element. Use this if you need to
    tweak the display of the header element, but not the structure.

    Default: `ui tiny header`

.. describe:: list_item_header_column

    To override the whole table column/cell, you can use this block. This
    is here for very edge case usage, you shouldn't need to define the whole
    cell or deviate from a header inside a table cell.

.. describe:: list_item_header_column_classes

    Instead of defining the whole column/cell, you might just need to define
    extra/different classes on the table cell. Try this before overriding
    the whole column block.

.. describe:: list_item_description

    The list menu for the secondary/metadata row of information. Unless
    you are replacing the text menu, you probably want to override the
    ``list_item_meta`` block instead.

.. describe:: list_item_meta

    A list of ``<div class="item" />`` elements. You probably want to
    overload ``list_item_meta_items`` though.

.. describe:: list_item_meta_items

    ``.ui.list.item`` for the widest, middle column in the table. Useful for
    label instances, or a `.sub.header` element.

.. describe:: list_item_extra

    For additional items, pushed right on the table. Useful for a singular
    secondary item, like a build, commit, or version, etc. Similar to the
    meta list, this is just the list, in case you want to replace it.

    See ``list_item_extra_items`` to add some items to the list.

.. describe:: list_item_extra_items

    ``.ui.list.item`` for the right most column. Try to keep this to one
    item usually.

Older list base
~~~~~~~~~~~~~~~

``includes/crud/list.html``

The earlier version of the shared list, built on a ``.ui.list`` instead of a
table. Nothing extends it anymore, so new list views should extend
``table_list.html``. It takes the same parameters and top menu blocks, and
the placeholder and item list blocks that are not specific to table columns
(it has no ``*_column``, ``*_classes``, ``list_item_icon``,
``list_item_meta_items`` or ``list_item_extra_items`` blocks).

Create button
~~~~~~~~~~~~~

``includes/crud/create_button.html``

Use in a list display to show a create button link. Mostly to keep the UIs consistent.

Template parameters
^^^^^^^^^^^^^^^^^^^

.. describe:: text

    Text for the create button

.. describe:: url

    URL link for the create button

.. describe:: is_disabled

    Show the button as disabled

Remove button
~~~~~~~~~~~~~

``includes/crud/remove_button.html``

Use in a list display to add a remove icon button. The remove icon button is
responsible for activating a modal on click that will confirm the removal and
submit the remove form to a view URL.  This removes the need to have a
separate view just for removal, or a removal hidden in the edit form.

How this works is each list item would output the ``<div class="ui modal" />``
element, and when the corresponding remove button is clicked, the correct
modal element is targetted and is shown to the user.

Template parameters
^^^^^^^^^^^^^^^^^^^

.. describe:: id

    Object id/pk for the modal. This is used to create a unique modal element
    for each list item.

.. describe:: form_url

    URL for the form post. This should normally be the delete/remove view for
    the model being listed.

.. describe:: field_name

    Optional form field name for hidden field

.. describe:: field_value

    Optional form field value for hidden field

.. describe:: action_text

    Header and button text for modal

.. describe:: action_name

    Form button name, ie:

    .. code:: html

        <button name="{{ action_name }}" />

.. describe:: content_text

    Modal content text

.. describe:: warning_text

   Optional warning text

.. describe:: is_disabled

    Show the button as disabled

Elements
--------

Chips
~~~~~

``includes/elements/chips/base.html``

In a few other frameworks, like Material, chips represent an actionable
label or tag. SemanticUI has labels, which is the underlying element to this,
but to distinguish the two, I'll refer to these as "chips".

Chips represent linkable items, like projects, builds, or versions, and they
use a graphic element along with a label to allow the chip to stand out a bit
more than a text label would.

So far, chips will all trigger their own popup on hover, allowing more details
in a popup card view. This is a base template, and each individual chip type
will need to specify it's own popup contents, etc.

The following blocks are available for override:

.. describe:: chip_icon

   The icon or image to the left of the label. See FomanticUI label docs for
   each implementation.

.. describe:: chip_text

   The main text of the chip

.. describe:: chip_detail

   The wrapper for the label detail text. If empty, this block will not
   output the right label detail text.

.. describe:: chip_detail_text

   The text to the right of the label, if any. Set ``chip_detail`` to an
   empty block to remove this portion of the label.

.. describe:: popupcard_image

   The left image to use in the popup card, however you likely want to
   use an image or icon in ``popupcard_right`` instead.

.. describe:: popupcard_right

   For floating an image or icon to the right of the card. For example:

   .. code:: html

      <i class="fa-solid right floated fa-check-mark icon"></i>

.. describe:: popupcard_header

   Header text for the popup card.

.. describe:: popupcard_meta

   The meta line below the header on the popup card.

.. describe:: popupcard_content

   The content of the popup card, usually a vertical list.

.. describe:: popupcard_extra

   The extra content for the card, a line for metadata below the card
   content.

Link
~~~~

``includes/elements/link.html``

This is a helper include for URL links, especially for
external links, that have a bit of boilerplate to them.

.. describe:: url

   The link URL

.. describe:: text

   The link text

.. describe:: label

   The link label, which is a popup and also the ARIA label

.. describe:: is_external

   Does the URL link to an external site? This should be automatic in the
   future.

.. describe:: class

   Additional classes for the link, for use as a ``.ui.menu > .item``, for example

Config label
~~~~~~~~~~~~

``includes/components/config_label.html``

This is used in list views, along the header line of each item. This is meant
to describe how the item is configured, where the second line in these list
views describes metadata about the item, if any.

This include takes several optional arguments on the include call:

.. describe:: icon

  The icon class to use in the label

.. describe:: text

  The text of the label, should be translated

.. describe:: url

  URL that the lable can lead to

.. describe:: popup

  The text in the popup, also used for ARIA labels

.. describe:: classes

  Additional classes to apply to the label

Builds
------

Build name
~~~~~~~~~~

``builds/includes/build_name.html``

A common include for showing the build name in a heading or title

This is a more complex heading than other elements. It uses a breadcrumb to
show the version the build was for, as well as the type of build in the case
that build is for a pull request version.

When used as a page title, on the build detail page, show some extra text and
nested breadcrumbs that we don't need to show in the build listing. This
gives some UI to link back to the build list or the version list. Normally,
the whole breadcrumb is linked as single link.

Template parameters
^^^^^^^^^^^^^^^^^^^

.. describe:: build

   The build instance to generate a name/header for.

.. describe:: is_page_title

    **Boolean, default=False**. Add full build breadcrumbs and link each
    section separately. This is used in the build detail page, where we want
    the breadcrumbs to act more like breadcrumbs and want to link back to the
    list of version builds. On the build listing page, we only want to link
    to the build detail page for the build.

Build status icon
~~~~~~~~~~~~~~~~~

``builds/includes/status_icon.html``

This is the common icon used in a number of parts of the UI. It has two modes
of operation: as a static template, when the build instance is finished, and as
a partial Knockout view, when the build is in progress.

Template parameters:

build
  The build instance for the icon.

size
  Icon size class. Set to an empty string to use the default for the parent
  element, default ``small``.

color
  Normally configured dynamically, based on build state/status. Can be overridden
  with this parameter however, if the icon is in an inverted element for example.

circular
  Use an inverted circular icon, default ``False``.

classes
  Additional class for the icon, default ``None``

data_bind
  Add the Knockout view data binding if the build has not finished yet. This
  is only really useful for views that use the build API.

  This expects a response directly from the APIv3 build endpoint. You can mock
  this data structure with ``<span data-bind="with: {status: {code: ... }}">``

Forms
-----

SemanticUI forms
~~~~~~~~~~~~~~~~

``includes/forms/semanticui.html``

For most form display, we use Cripsy. This might be an old artifact, so
probably don't use this unless you find a reason to.

This is a helper to display forms in SemanticUI markup. We don't use as_p
here as the output does not style things like error listings.

Inputs:

form
    The Form object to iterate over

error_title (optional)
    The title for the form

Organizations
-------------

Organization project list
~~~~~~~~~~~~~~~~~~~~~~~~~

``organizations/partials/project_list.html``

This template uses an additional include argument, so that we can conditionally
show some UI elements on main project listings, but not on subviews, like the
team project listing.

``show_create_button``
    Boolean. Show the add button in the top menu.

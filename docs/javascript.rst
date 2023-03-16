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

:func:`semanticui`
    You'll see this used a lot. It's used to instantiate SemanticUI modules
    from templates.

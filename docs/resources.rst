Resources
=========

JavaScript
----------

.. TODO this is a list of resources that should eventually live somewhere more
   organization-wide than just this doc project.

.. This was originally a post on our meta discussion board:
   https://github.com/readthedocs/meta/discussions/114

Here are some helpful resources on modern (ES6) JavaScript patterns. These aim
to help you learn more about the patterns you'll see commonly used in this
repository, as well as other modern Read the Docs projects: There are plenty of
resources on JavaScript, but these avoid getting deep into the weeds or
explaining introductory concepts towards new developers.

`What is ES5 and ES6? <https://www.javatpoint.com/es5-vs-es6>`__
   ES5 was introduced in 2009, though adoption took a while in the browser
   world. ES6 was adopted far quicker, with `most browsers supporting ES6 by
   2016 <https://caniuse.com/es6>`__.

`ES6 in 350 bullet points <https://ponyfoo.com/articles/es6>`__
   An information dump, but a thorough list of features. Lots of great content
   to jump off into. A bit out of date though, it was written shortly after ES6
   support was added in Node.js.

`ES modules pattern <https://www.patterns.dev/posts/module-pattern>`__
   Structuring code in reusable pieces. This replaces CommonJS, an older
   standard, though either are an improvement over relying on modules
   defined at ``global``/``window``.

`ES6 modules in depth <https://ponyfoo.com/articles/es6-modules-in-depth>`__
   Covers different implementations of import/export, and touches on old module
   patterns as well.

`Class/prototype pattern <https://www.patterns.dev/posts/prototype-pattern>`__
   ES5/6 prototyping is done with ``class`` definitions. There are similarities
   to Python, but the dependency resolution is much different.

`ES6 classes in depth <https://ponyfoo.com/articles/es6-classes-in-depth>`__
   Classes and prototypes are synonymous in JS, as classes are syntax built on
   prototypes. This touches on both, though you are not likely to see
   prototyping in any relatively new-ish code.

`Static import <https://www.patterns.dev/posts/static-import>`__ vs `dynamic import <https://www.patterns.dev/posts/dynamic-import>`__
   Import patterns using Webpack

`Variable scope <https://jay-cruz.medium.com/scope-in-javascript-es6-2f2cbbb46f01>`__
   An overview on scope, and why to not use ``var``. Also see `scope on
   MDN <https://developer.mozilla.org/en-US/docs/Glossary/Scope>`__

`Fat arrow functions <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#arrow_functions>`__
   ES6 introduced the fat arrow function definition (``(...parameters) => { }``).
   Variable scoping is slightly different, as arrow functions do not define a
   local ``this`` variable.

`Modern JavaScript features you should be using <https://dev.to/azure/modern-javascript-10-things-you-should-be-using-starting-today-1adm>`__
   Some of these features were mentioned in the 350 bullet points article, this
   article shows these in practice.

----

These sites have a good general direction and are quick to the point:

-  `patterns.dev <https://www.patterns.dev>`__ - leans towards React,
   but some good overviews
-  `ponyfoo.com <https://ponyfoo.com/articles/tagged/es6-in-depth>`__ -
   lots of in depth information on ES6 and JavaScript in general.

Examples
========

.. important::
    All of these example patterns are meant to illustrate some of the patterns
    for UX that we'd like to implement, or show features of SUI that we'd like
    to make use of. They are not necessarily meant to be a mockup of the
    intended final UI, but might be a good place to work off of if the UX
    patterns are agreeable.

.. _example-user-dashboard:

User dashboard using SUI divided item view
------------------------------------------

.. raw:: html

    <br />
    <div class="html">
      <div class="ui divided items">
        <div class="item">
          <div class="content">
            <a class="header">rtfd/readthedocs.org</a>
            <div class="meta">
              <span class="url">https://doc.readthedocs.io/en/latest/</span>
            </div>
            <div class="extra">
              <div class="ui right floated primary icon button"><i class="play icon"></i></div>
              <div class="ui right floated icon button"><i class="cog icon"></i></div>

              <a href="#" class="ui label">1.0</a>
              <a href="#" class="ui label">2.0</a>
              <a href="#" class="ui label">2.1</a>
              <a href="#" class="ui label">2.2</a>
              <a href="#" class="ui label">2.3</a>
              <a href="#" class="ui label red" data-tooltip="Version has failed for the last 13 builds">2.4</a>
              <a href="#" class="ui label red" data-tooltip="Version has failed for the last 13 builds">3.0</a>
            </div>
          </div>
        </div>
        <div class="item">
          <div class="content">
            <a class="header">rtfd/sphinx-rtd-theme</a>
            <div class="meta">
              <span class="url">https://doc.readthedocs.io/projects/theme/en/3.0/</span>
            </div>
            <div class="extra">
              <div class="ui right floated primary icon button"><i class="play icon"></i></div>
              <div class="ui right floated icon button"><i class="cog icon"></i></div>
              <a class="ui label">1.0</a>
              <a class="ui label">2.0</a>
              <a class="ui label red" data-tooltip="Version has failed for the last 13 builds">2.1</a>
              <a class="ui label red" data-tooltip="Version has failed for the last 13 builds">2.2</a>
              <a class="ui label">2.3</a>
              <a class="ui label">2.4</a>
              <a class="ui label">3.0</a>
            </div>
          </div>
        </div>
        <div class="item">
          <div class="content">
            <a class="header">rtfd/sphinx-autoapi</a>
            <div class="meta">
              <span class="url">https://doc.readthedocs.io/projects/autoapi/en/latest/</span>
            </div>
            <div class="extra">
              <div class="ui right floated primary icon button"><i class="play icon"></i></div>
              <div class="ui right floated icon button"><i class="cog icon"></i></div>
              <a class="ui label">1.0</a>
            </div>
          </div>
        </div>

      </div>
    </div>

.. _example-list-onboarding:

Empty list onboarding
---------------------

List views that represent empty querysets should offer some guidance, rather
than just show an empty element. The user should be guided towards adding a new
instance, perhaps informed about what the object does actually does, and
hopefully can be pointed towards relevant documentation.

.. raw:: html

    <h2 class="ui header">
        <div class="ui right floated primary button">
          Add project
        </div>
      <i class="book icon"></i>
      <div class="content">
        Projects
        <div class="sub header">
          Projects that you have access to
        </div>
      </div>
    </h2>
    <div class="ui placeholder segment">
      <div class="ui icon header">
        <i class="cloud download icon"></i>
        You have not configured any projects yet.
      </div>
      <div class="ui primary button">Add Project</div>
      <div class="ui horizontal divider">
        Or
      </div>
      <a href="#" class="inline">Learn how to get started with Read the Docs</a>
    </div>

.. _example-menu:

Vertical navigation menu for project dashboard
----------------------------------------------

In the case that we want to get rid of the first level of navigation on the
project dashboard pages, it might make sense to push both forms of navigation
into a singular vertical menu

.. raw:: html

    <div class="ui vertical pointing menu">
      <a class="item">
        Overview
      </a>
      <a class="item">
        Builds
      </a>
      <div class="active item">
        <div class="header">Admin</div>
        <div class="menu">
          <a class="active item">Settings</a>
          <a class="item">Advanced</a>
          <a class="item">Versions <div class="label">13</div></a>
          <a class="item">Domains <div class="label">1</div></a>
          <a class="item">Maintainers <div class="label">1</div></a>
          <a class="item">Subprojects</a>
          <a class="item">Translations</a>
          <a class="item">Redirects</a>
          <a class="item">Environment Variables</a>
          <a class="item">Notifications</a>
          <a class="item">Advertising</a>
        </div>
      </div>
    </div>

.. _example-setup-steps:

Using steps element to track progress of project configuration
--------------------------------------------------------------

The project import steps already use a form wizard currently, though it is only
two steps. If we want to change anything about how the import process works,
have a step progression would at least provide a little bit more personality to
the import pages, which are rather utility at this point.

.. raw:: html

    <div class="ui three steps">
      <div class="completed step">
        <i class="search icon"></i>
        <div class="content">
          <div class="title">Find</div>
          <div class="description">Find repository to import</div>
        </div>
      </div>
      <div class="active step">
        <i class="info circle icon"></i>
        <div class="content">
          <div class="title">Configure</div>
          <div class="description">Enter basic project information</div>
        </div>
      </div>
      <div class="disabled step">
        <i class="cog icon"></i>
        <div class="content">
          <div class="title">Activate</div>
          <div class="description">Set versions to build</div>
        </div>
      </div>
    </div>

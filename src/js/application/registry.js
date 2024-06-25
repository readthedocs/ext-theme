import ko from "knockout";

/**
 * Registry pattern for views, to accumulate public views for templates
 *
 * To avoid using a routing library, or treating this JS as a single page
 * application on top of a Django backend, we simply will make all views
 * available to all templates. This registry ultimately attaches to the
 * main :class:`ApplicationView` instance, and all views will be available in
 * that bound context.
 *
 * See :class:`ApplicationView` here for examples and more information
 */
export class Registry {
  static views = {};

  /**
   * Add view to registry. View should have ``view_name`` proprety defined.
   *
   * A ``view_name`` attribute is required as the class name will change when
   * the sources are minified.
   *
   * @param {class} view - Knockout view to expose to the application
   */
  static add_view(view) {
    if (view.name === undefined) {
      console.error("View view_name is unspecified", view);
      return;
    }
    this.views[view.view_name] = (...params) => {
      console.debug("Loading view with parameters:", view.view_name, params);
      // ignoreDependencies is needed here or the context used by the subview
      // is incorrect
      return ko.ignoreDependencies(() => {
        return new view(...params);
      }, this);
    };
  }

  /**
   * Attach all of the registered views to a view, almost always, the root
   * application view.
   *
   * @param {ApplicationView} view - View to attach to
   */
  attach(view) {
    for (const [view_name, view_class] of Object.entries(
      this.constructor.views,
    )) {
      view[view_name] = view_class;
    }
  }
}

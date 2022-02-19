/**
 * Registry pattern for views, so that views can self-register where they are
 * defined.
 */
export class Registry {
  static views = {};

  /**
   * Add view to registry. View should have ``view_name`` proprety defined.
   *
   * @param {class} view - Knockout view to expose to the application
   */
  static add_view(view) {
    if (view.name === undefined) {
      console.error("View view_name is unspecified", view);
      return;
    }
    this.views[view.view_name] = (params) => {
      console.debug("Loading view with parameters:", view.view_name, params);
      // ignoreDependencies is needed here or the context used by the subview
      // is incorrect
      return ko.ignoreDependencies(() => {
        return new view(params);
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
      this.constructor.views
    )) {
      view[view_name] = view_class;
    }
  }
}

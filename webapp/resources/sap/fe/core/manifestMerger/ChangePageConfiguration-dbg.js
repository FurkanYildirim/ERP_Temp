/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath"], function (Log, ObjectPath) {
  "use strict";

  var _exports = {};
  let pageConfigurationChanges = {};
  /**
   * Apply change method.
   *
   * This method is being called by the FLEX framework in case a manifest change with the change type
   * 'appdescr_fe_changePageConfiguration' was created for the current application. This method is not meant to be
   * called by anyone else but the FLEX framework.
   *
   * @function
   * @name sap.fe.core.manifestMerger#applyChange
   * @param manifest The original manifest.
   * @param change The change content.
   * @returns The changed or unchanged manifest.
   * @private
   */
  function applyChange(manifest, change) {
    const changeContent = change.getContent();
    const pageId = changeContent === null || changeContent === void 0 ? void 0 : changeContent.page;
    const propertyChange = changeContent === null || changeContent === void 0 ? void 0 : changeContent.entityPropertyChange;

    // return unmodified manifest in case change not valid
    if ((propertyChange === null || propertyChange === void 0 ? void 0 : propertyChange.operation) !== "UPSERT" || !(propertyChange !== null && propertyChange !== void 0 && propertyChange.propertyPath) || (propertyChange === null || propertyChange === void 0 ? void 0 : propertyChange.propertyValue) === undefined || propertyChange !== null && propertyChange !== void 0 && propertyChange.propertyPath.startsWith("/")) {
      Log.error("Change content is not a valid");
      return manifest;
    }
    return changeConfiguration(manifest, pageId, propertyChange.propertyPath, propertyChange.propertyValue);
  }

  /**
   * Changes the page configuration of SAP Fiori elements.
   *
   * This method enables you to change the page configuration of SAP Fiori elements.
   *
   * @function
   * @name sap.fe.core.manifestMerger#changeConfiguration
   * @param manifest The original manifest.
   * @param pageId The ID of the page for which the configuration is to be changed.
   * @param path The path in the page settings for which the configuration is to be changed.
   * @param value The new value of the configuration. This could be a plain value like a string, or a Boolean, or a structured object.
   * @param lateChange Indicates that the change was done after application startup (e.g. feature toggle).
   * @returns The changed or unchanged manifest.
   * @private
   */
  _exports.applyChange = applyChange;
  function changeConfiguration(manifest, pageId, path, value, lateChange) {
    const pageSettings = getPageSettings(manifest, pageId);
    if (pageSettings) {
      const propertyPath = retrievePropertyPath(path);
      ObjectPath.set(propertyPath, value, pageSettings);
      if (lateChange) {
        pageConfigurationChanges[pageId] = pageConfigurationChanges[pageId] || [];
        pageConfigurationChanges[pageId].push(path);
      }
    } else {
      Log.error(`No Fiori elements page with ID ${pageId} found in routing targets.`);
    }
    return manifest;
  }

  /**
   * Retrieves an array with the property path parts and consider the controlConfiguration specially.
   *
   * @function
   * @param path The given property path
   * @returns An array with the property path parts.
   * @private
   */
  _exports.changeConfiguration = changeConfiguration;
  function retrievePropertyPath(path) {
    let propertyPath = path.split("/");
    if (propertyPath[0] === "controlConfiguration") {
      let annotationPath = "";
      // the annotation path in the control configuration has to stay together. For now rely on the fact the @ is in the last part
      for (let i = 1; i < propertyPath.length; i++) {
        annotationPath += (i > 1 ? "/" : "") + propertyPath[i];
        if (annotationPath.indexOf("@") > -1) {
          propertyPath = ["controlConfiguration", annotationPath].concat(propertyPath.slice(i + 1));
          break;
        }
      }
    }
    return propertyPath;
  }

  /**
   * Search the page settings in the manifest for a given page ID.
   *
   * @function
   * @name sap.fe.core.manifestMerger#getPageSettings
   * @param manifest The manifest where the search is carried out to find the page settings.
   * @param pageId The ID of the page.
   * @returns The page settings for the page ID or undefined if not found.
   * @private
   */
  function getPageSettings(manifest, pageId) {
    var _manifest$sapUi, _manifest$sapUi$routi;
    let pageSettings;
    const targets = ((_manifest$sapUi = manifest["sap.ui5"]) === null || _manifest$sapUi === void 0 ? void 0 : (_manifest$sapUi$routi = _manifest$sapUi.routing) === null || _manifest$sapUi$routi === void 0 ? void 0 : _manifest$sapUi$routi.targets) ?? {};
    for (const p in targets) {
      if (targets[p].id === pageId && targets[p].name.startsWith("sap.fe.templates.")) {
        var _targets$p$options;
        pageSettings = ((_targets$p$options = targets[p].options) === null || _targets$p$options === void 0 ? void 0 : _targets$p$options.settings) ?? {};
        break;
      }
    }
    return pageSettings;
  }

  /**
   * Applies page configuration changes to view data object.
   *
   * UI5 routing clones the manifest settings during the app init, even before the router was initialized.
   * As we allow changing the manifest in the async initializeFeatureToggle hook, the view data might not fit the current
   * manifest settings, therefore (re)applying the registered page configuration changes to the view data object.
   *
   * @param manifest The current page manifest settings.
   * @param viewData The current viewData settings.
   * @param appComponent The app component instance.
   * @param pageId The ID of the page.
   * @returns The updated viewData settings.
   */
  function applyPageConfigurationChanges(manifest, viewData, appComponent, pageId) {
    viewData = viewData ?? {};
    const pageChanges = pageConfigurationChanges[pageId] || [];
    for (const path of pageChanges) {
      const propertyPath = retrievePropertyPath(path);
      const manifestValue = ObjectPath.get(propertyPath, manifest);
      ObjectPath.set(propertyPath, manifestValue, viewData);
    }
    return viewData;
  }

  /**
   * Cleans all registered page configuration changes.
   *
   */
  _exports.applyPageConfigurationChanges = applyPageConfigurationChanges;
  function cleanPageConfigurationChanges() {
    pageConfigurationChanges = {};
  }
  _exports.cleanPageConfigurationChanges = cleanPageConfigurationChanges;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwYWdlQ29uZmlndXJhdGlvbkNoYW5nZXMiLCJhcHBseUNoYW5nZSIsIm1hbmlmZXN0IiwiY2hhbmdlIiwiY2hhbmdlQ29udGVudCIsImdldENvbnRlbnQiLCJwYWdlSWQiLCJwYWdlIiwicHJvcGVydHlDaGFuZ2UiLCJlbnRpdHlQcm9wZXJ0eUNoYW5nZSIsIm9wZXJhdGlvbiIsInByb3BlcnR5UGF0aCIsInByb3BlcnR5VmFsdWUiLCJ1bmRlZmluZWQiLCJzdGFydHNXaXRoIiwiTG9nIiwiZXJyb3IiLCJjaGFuZ2VDb25maWd1cmF0aW9uIiwicGF0aCIsInZhbHVlIiwibGF0ZUNoYW5nZSIsInBhZ2VTZXR0aW5ncyIsImdldFBhZ2VTZXR0aW5ncyIsInJldHJpZXZlUHJvcGVydHlQYXRoIiwiT2JqZWN0UGF0aCIsInNldCIsInB1c2giLCJzcGxpdCIsImFubm90YXRpb25QYXRoIiwiaSIsImxlbmd0aCIsImluZGV4T2YiLCJjb25jYXQiLCJzbGljZSIsInRhcmdldHMiLCJyb3V0aW5nIiwicCIsImlkIiwibmFtZSIsIm9wdGlvbnMiLCJzZXR0aW5ncyIsImFwcGx5UGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzIiwidmlld0RhdGEiLCJhcHBDb21wb25lbnQiLCJwYWdlQ2hhbmdlcyIsIm1hbmlmZXN0VmFsdWUiLCJnZXQiLCJjbGVhblBhZ2VDb25maWd1cmF0aW9uQ2hhbmdlcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhbmdlUGFnZUNvbmZpZ3VyYXRpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgT2JqZWN0UGF0aCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9PYmplY3RQYXRoXCI7XG5pbXBvcnQgQXBwQ29tcG9uZW50LCB7IE1hbmlmZXN0Q29udGVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCB7IFZpZXdEYXRhIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1RlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeVwiO1xuXG5sZXQgcGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fTtcblxuZXhwb3J0IHR5cGUgQ2hhbmdlID0ge1xuXHRnZXRDb250ZW50KCk6IENoYW5nZUNvbnRlbnQ7XG59O1xuXG50eXBlIENoYW5nZUNvbnRlbnQgPSB7XG5cdHBhZ2U6IHN0cmluZzsgLy8gSUQgb2YgdGhlIHBhZ2UgdG8gYmUgY2hhbmdlZFxuXHRlbnRpdHlQcm9wZXJ0eUNoYW5nZTogRW50aXR5UHJvcGVydHlDaGFuZ2U7XG59O1xuXG50eXBlIEVudGl0eVByb3BlcnR5Q2hhbmdlID0ge1xuXHRwcm9wZXJ0eVBhdGg6IHN0cmluZzsgLy8gcGF0aCB0byB0aGUgcHJvcGVydHkgdG8gYmUgY2hhbmdlZFxuXHRvcGVyYXRpb246IHN0cmluZzsgLy8gb25seSBVUFNFUlQgc3VwcG9ydGVkXG5cdHByb3BlcnR5VmFsdWU6IHN0cmluZyB8IE9iamVjdDsgLy93aGF0IHRvIGJlIGNoYW5nZWRcbn07XG5cbi8qKlxuICogQXBwbHkgY2hhbmdlIG1ldGhvZC5cbiAqXG4gKiBUaGlzIG1ldGhvZCBpcyBiZWluZyBjYWxsZWQgYnkgdGhlIEZMRVggZnJhbWV3b3JrIGluIGNhc2UgYSBtYW5pZmVzdCBjaGFuZ2Ugd2l0aCB0aGUgY2hhbmdlIHR5cGVcbiAqICdhcHBkZXNjcl9mZV9jaGFuZ2VQYWdlQ29uZmlndXJhdGlvbicgd2FzIGNyZWF0ZWQgZm9yIHRoZSBjdXJyZW50IGFwcGxpY2F0aW9uLiBUaGlzIG1ldGhvZCBpcyBub3QgbWVhbnQgdG8gYmVcbiAqIGNhbGxlZCBieSBhbnlvbmUgZWxzZSBidXQgdGhlIEZMRVggZnJhbWV3b3JrLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUubWFuaWZlc3RNZXJnZXIjYXBwbHlDaGFuZ2VcbiAqIEBwYXJhbSBtYW5pZmVzdCBUaGUgb3JpZ2luYWwgbWFuaWZlc3QuXG4gKiBAcGFyYW0gY2hhbmdlIFRoZSBjaGFuZ2UgY29udGVudC5cbiAqIEByZXR1cm5zIFRoZSBjaGFuZ2VkIG9yIHVuY2hhbmdlZCBtYW5pZmVzdC5cbiAqIEBwcml2YXRlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseUNoYW5nZShtYW5pZmVzdDogTWFuaWZlc3RDb250ZW50LCBjaGFuZ2U6IENoYW5nZSk6IG9iamVjdCB7XG5cdGNvbnN0IGNoYW5nZUNvbnRlbnQgPSBjaGFuZ2UuZ2V0Q29udGVudCgpO1xuXHRjb25zdCBwYWdlSWQgPSBjaGFuZ2VDb250ZW50Py5wYWdlO1xuXHRjb25zdCBwcm9wZXJ0eUNoYW5nZSA9IGNoYW5nZUNvbnRlbnQ/LmVudGl0eVByb3BlcnR5Q2hhbmdlO1xuXG5cdC8vIHJldHVybiB1bm1vZGlmaWVkIG1hbmlmZXN0IGluIGNhc2UgY2hhbmdlIG5vdCB2YWxpZFxuXHRpZiAoXG5cdFx0cHJvcGVydHlDaGFuZ2U/Lm9wZXJhdGlvbiAhPT0gXCJVUFNFUlRcIiB8fFxuXHRcdCFwcm9wZXJ0eUNoYW5nZT8ucHJvcGVydHlQYXRoIHx8XG5cdFx0cHJvcGVydHlDaGFuZ2U/LnByb3BlcnR5VmFsdWUgPT09IHVuZGVmaW5lZCB8fFxuXHRcdHByb3BlcnR5Q2hhbmdlPy5wcm9wZXJ0eVBhdGguc3RhcnRzV2l0aChcIi9cIilcblx0KSB7XG5cdFx0TG9nLmVycm9yKFwiQ2hhbmdlIGNvbnRlbnQgaXMgbm90IGEgdmFsaWRcIik7XG5cdFx0cmV0dXJuIG1hbmlmZXN0O1xuXHR9XG5cblx0cmV0dXJuIGNoYW5nZUNvbmZpZ3VyYXRpb24obWFuaWZlc3QsIHBhZ2VJZCwgcHJvcGVydHlDaGFuZ2UucHJvcGVydHlQYXRoLCBwcm9wZXJ0eUNoYW5nZS5wcm9wZXJ0eVZhbHVlKTtcbn1cblxuLyoqXG4gKiBDaGFuZ2VzIHRoZSBwYWdlIGNvbmZpZ3VyYXRpb24gb2YgU0FQIEZpb3JpIGVsZW1lbnRzLlxuICpcbiAqIFRoaXMgbWV0aG9kIGVuYWJsZXMgeW91IHRvIGNoYW5nZSB0aGUgcGFnZSBjb25maWd1cmF0aW9uIG9mIFNBUCBGaW9yaSBlbGVtZW50cy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5jb3JlLm1hbmlmZXN0TWVyZ2VyI2NoYW5nZUNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSBtYW5pZmVzdCBUaGUgb3JpZ2luYWwgbWFuaWZlc3QuXG4gKiBAcGFyYW0gcGFnZUlkIFRoZSBJRCBvZiB0aGUgcGFnZSBmb3Igd2hpY2ggdGhlIGNvbmZpZ3VyYXRpb24gaXMgdG8gYmUgY2hhbmdlZC5cbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIGluIHRoZSBwYWdlIHNldHRpbmdzIGZvciB3aGljaCB0aGUgY29uZmlndXJhdGlvbiBpcyB0byBiZSBjaGFuZ2VkLlxuICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgb2YgdGhlIGNvbmZpZ3VyYXRpb24uIFRoaXMgY291bGQgYmUgYSBwbGFpbiB2YWx1ZSBsaWtlIGEgc3RyaW5nLCBvciBhIEJvb2xlYW4sIG9yIGEgc3RydWN0dXJlZCBvYmplY3QuXG4gKiBAcGFyYW0gbGF0ZUNoYW5nZSBJbmRpY2F0ZXMgdGhhdCB0aGUgY2hhbmdlIHdhcyBkb25lIGFmdGVyIGFwcGxpY2F0aW9uIHN0YXJ0dXAgKGUuZy4gZmVhdHVyZSB0b2dnbGUpLlxuICogQHJldHVybnMgVGhlIGNoYW5nZWQgb3IgdW5jaGFuZ2VkIG1hbmlmZXN0LlxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoYW5nZUNvbmZpZ3VyYXRpb24obWFuaWZlc3Q6IE1hbmlmZXN0Q29udGVudCwgcGFnZUlkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgdmFsdWU6IHVua25vd24sIGxhdGVDaGFuZ2U/OiBib29sZWFuKTogb2JqZWN0IHtcblx0Y29uc3QgcGFnZVNldHRpbmdzID0gZ2V0UGFnZVNldHRpbmdzKG1hbmlmZXN0LCBwYWdlSWQpO1xuXG5cdGlmIChwYWdlU2V0dGluZ3MpIHtcblx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSByZXRyaWV2ZVByb3BlcnR5UGF0aChwYXRoKTtcblx0XHRPYmplY3RQYXRoLnNldChwcm9wZXJ0eVBhdGgsIHZhbHVlLCBwYWdlU2V0dGluZ3MpO1xuXHRcdGlmIChsYXRlQ2hhbmdlKSB7XG5cdFx0XHRwYWdlQ29uZmlndXJhdGlvbkNoYW5nZXNbcGFnZUlkXSA9IHBhZ2VDb25maWd1cmF0aW9uQ2hhbmdlc1twYWdlSWRdIHx8IFtdO1xuXHRcdFx0cGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzW3BhZ2VJZF0ucHVzaChwYXRoKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0TG9nLmVycm9yKGBObyBGaW9yaSBlbGVtZW50cyBwYWdlIHdpdGggSUQgJHtwYWdlSWR9IGZvdW5kIGluIHJvdXRpbmcgdGFyZ2V0cy5gKTtcblx0fVxuXG5cdHJldHVybiBtYW5pZmVzdDtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgYW4gYXJyYXkgd2l0aCB0aGUgcHJvcGVydHkgcGF0aCBwYXJ0cyBhbmQgY29uc2lkZXIgdGhlIGNvbnRyb2xDb25maWd1cmF0aW9uIHNwZWNpYWxseS5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBwYXRoIFRoZSBnaXZlbiBwcm9wZXJ0eSBwYXRoXG4gKiBAcmV0dXJucyBBbiBhcnJheSB3aXRoIHRoZSBwcm9wZXJ0eSBwYXRoIHBhcnRzLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcmV0cmlldmVQcm9wZXJ0eVBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nW10ge1xuXHRsZXQgcHJvcGVydHlQYXRoID0gcGF0aC5zcGxpdChcIi9cIik7XG5cdGlmIChwcm9wZXJ0eVBhdGhbMF0gPT09IFwiY29udHJvbENvbmZpZ3VyYXRpb25cIikge1xuXHRcdGxldCBhbm5vdGF0aW9uUGF0aCA9IFwiXCI7XG5cdFx0Ly8gdGhlIGFubm90YXRpb24gcGF0aCBpbiB0aGUgY29udHJvbCBjb25maWd1cmF0aW9uIGhhcyB0byBzdGF5IHRvZ2V0aGVyLiBGb3Igbm93IHJlbHkgb24gdGhlIGZhY3QgdGhlIEAgaXMgaW4gdGhlIGxhc3QgcGFydFxuXHRcdGZvciAobGV0IGkgPSAxOyBpIDwgcHJvcGVydHlQYXRoLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRhbm5vdGF0aW9uUGF0aCArPSAoaSA+IDEgPyBcIi9cIiA6IFwiXCIpICsgcHJvcGVydHlQYXRoW2ldO1xuXHRcdFx0aWYgKGFubm90YXRpb25QYXRoLmluZGV4T2YoXCJAXCIpID4gLTEpIHtcblx0XHRcdFx0cHJvcGVydHlQYXRoID0gW1wiY29udHJvbENvbmZpZ3VyYXRpb25cIiwgYW5ub3RhdGlvblBhdGhdLmNvbmNhdChwcm9wZXJ0eVBhdGguc2xpY2UoaSArIDEpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBwcm9wZXJ0eVBhdGg7XG59XG5cbi8qKlxuICogU2VhcmNoIHRoZSBwYWdlIHNldHRpbmdzIGluIHRoZSBtYW5pZmVzdCBmb3IgYSBnaXZlbiBwYWdlIElELlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUubWFuaWZlc3RNZXJnZXIjZ2V0UGFnZVNldHRpbmdzXG4gKiBAcGFyYW0gbWFuaWZlc3QgVGhlIG1hbmlmZXN0IHdoZXJlIHRoZSBzZWFyY2ggaXMgY2FycmllZCBvdXQgdG8gZmluZCB0aGUgcGFnZSBzZXR0aW5ncy5cbiAqIEBwYXJhbSBwYWdlSWQgVGhlIElEIG9mIHRoZSBwYWdlLlxuICogQHJldHVybnMgVGhlIHBhZ2Ugc2V0dGluZ3MgZm9yIHRoZSBwYWdlIElEIG9yIHVuZGVmaW5lZCBpZiBub3QgZm91bmQuXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBnZXRQYWdlU2V0dGluZ3MobWFuaWZlc3Q6IE1hbmlmZXN0Q29udGVudCwgcGFnZUlkOiBzdHJpbmcpOiBvYmplY3QgfCB1bmRlZmluZWQge1xuXHRsZXQgcGFnZVNldHRpbmdzO1xuXHRjb25zdCB0YXJnZXRzID0gbWFuaWZlc3RbXCJzYXAudWk1XCJdPy5yb3V0aW5nPy50YXJnZXRzID8/IHt9O1xuXHRmb3IgKGNvbnN0IHAgaW4gdGFyZ2V0cykge1xuXHRcdGlmICh0YXJnZXRzW3BdLmlkID09PSBwYWdlSWQgJiYgdGFyZ2V0c1twXS5uYW1lLnN0YXJ0c1dpdGgoXCJzYXAuZmUudGVtcGxhdGVzLlwiKSkge1xuXHRcdFx0cGFnZVNldHRpbmdzID0gdGFyZ2V0c1twXS5vcHRpb25zPy5zZXR0aW5ncyA/PyB7fTtcblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcGFnZVNldHRpbmdzO1xufVxuXG4vKipcbiAqIEFwcGxpZXMgcGFnZSBjb25maWd1cmF0aW9uIGNoYW5nZXMgdG8gdmlldyBkYXRhIG9iamVjdC5cbiAqXG4gKiBVSTUgcm91dGluZyBjbG9uZXMgdGhlIG1hbmlmZXN0IHNldHRpbmdzIGR1cmluZyB0aGUgYXBwIGluaXQsIGV2ZW4gYmVmb3JlIHRoZSByb3V0ZXIgd2FzIGluaXRpYWxpemVkLlxuICogQXMgd2UgYWxsb3cgY2hhbmdpbmcgdGhlIG1hbmlmZXN0IGluIHRoZSBhc3luYyBpbml0aWFsaXplRmVhdHVyZVRvZ2dsZSBob29rLCB0aGUgdmlldyBkYXRhIG1pZ2h0IG5vdCBmaXQgdGhlIGN1cnJlbnRcbiAqIG1hbmlmZXN0IHNldHRpbmdzLCB0aGVyZWZvcmUgKHJlKWFwcGx5aW5nIHRoZSByZWdpc3RlcmVkIHBhZ2UgY29uZmlndXJhdGlvbiBjaGFuZ2VzIHRvIHRoZSB2aWV3IGRhdGEgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdCBUaGUgY3VycmVudCBwYWdlIG1hbmlmZXN0IHNldHRpbmdzLlxuICogQHBhcmFtIHZpZXdEYXRhIFRoZSBjdXJyZW50IHZpZXdEYXRhIHNldHRpbmdzLlxuICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgYXBwIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqIEBwYXJhbSBwYWdlSWQgVGhlIElEIG9mIHRoZSBwYWdlLlxuICogQHJldHVybnMgVGhlIHVwZGF0ZWQgdmlld0RhdGEgc2V0dGluZ3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcHBseVBhZ2VDb25maWd1cmF0aW9uQ2hhbmdlcyhtYW5pZmVzdDogb2JqZWN0LCB2aWV3RGF0YTogVmlld0RhdGEsIGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LCBwYWdlSWQ6IHN0cmluZyk6IFZpZXdEYXRhIHtcblx0dmlld0RhdGEgPSB2aWV3RGF0YSA/PyB7fTtcblx0Y29uc3QgcGFnZUNoYW5nZXM6IHN0cmluZ1tdID0gcGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzW3BhZ2VJZF0gfHwgW107XG5cdGZvciAoY29uc3QgcGF0aCBvZiBwYWdlQ2hhbmdlcykge1xuXHRcdGNvbnN0IHByb3BlcnR5UGF0aCA9IHJldHJpZXZlUHJvcGVydHlQYXRoKHBhdGgpO1xuXHRcdGNvbnN0IG1hbmlmZXN0VmFsdWUgPSBPYmplY3RQYXRoLmdldChwcm9wZXJ0eVBhdGgsIG1hbmlmZXN0KTtcblx0XHRPYmplY3RQYXRoLnNldChwcm9wZXJ0eVBhdGgsIG1hbmlmZXN0VmFsdWUsIHZpZXdEYXRhKTtcblx0fVxuXHRyZXR1cm4gdmlld0RhdGE7XG59XG5cbi8qKlxuICogQ2xlYW5zIGFsbCByZWdpc3RlcmVkIHBhZ2UgY29uZmlndXJhdGlvbiBjaGFuZ2VzLlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsZWFuUGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzKCkge1xuXHRwYWdlQ29uZmlndXJhdGlvbkNoYW5nZXMgPSB7fTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFLQSxJQUFJQSx3QkFBa0QsR0FBRyxDQUFDLENBQUM7RUFpQjNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTQyxXQUFXLENBQUNDLFFBQXlCLEVBQUVDLE1BQWMsRUFBVTtJQUM5RSxNQUFNQyxhQUFhLEdBQUdELE1BQU0sQ0FBQ0UsVUFBVSxFQUFFO0lBQ3pDLE1BQU1D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
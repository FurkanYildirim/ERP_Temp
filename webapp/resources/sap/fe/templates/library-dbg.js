/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/f/library", "sap/fe/core/library", "sap/fe/macros/library", "sap/fe/templates/ListReport/view/fragments/MultipleMode.block", "sap/fe/templates/ObjectPage/components/CollaborationDraft.block", "sap/fe/templates/ObjectPage/components/DraftHandlerButton.block", "sap/fe/templates/ObjectPage/view/fragments/FooterContent.block", "sap/ui/core/Core", "sap/ui/core/library"], function (_library, _library2, _library3, MultipleModeBlock, CollaborationDraft, DraftHandlerButtonBlock, FooterContentBlock, Core, _library4) {
  "use strict";

  var _exports = {};
  /**
   * Library providing the official templates supported by SAP Fiori elements.
   *
   * @namespace
   * @name sap.fe.templates
   * @public
   */
  const templatesNamespace = "sap.fe.templates";

  /**
   * @namespace
   * @name sap.fe.templates.ListReport
   * @public
   */
  _exports.templatesNamespace = templatesNamespace;
  const templatesLRNamespace = "sap.fe.templates.ListReport";

  /**
   * @namespace
   * @name sap.fe.templates.ObjectPage
   * @public
   */
  _exports.templatesLRNamespace = templatesLRNamespace;
  const templatesOPNamespace = "sap.fe.templates.ObjectPage";
  _exports.templatesOPNamespace = templatesOPNamespace;
  const thisLib = Core.initLibrary({
    name: "sap.fe.templates",
    dependencies: ["sap.ui.core", "sap.fe.core", "sap.fe.macros", "sap.f"],
    types: ["sap.fe.templates.ObjectPage.SectionLayout"],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.115.1",
    noLibraryCSS: true
  });
  if (!thisLib.ObjectPage) {
    thisLib.ObjectPage = {};
  }
  thisLib.ObjectPage.SectionLayout = {
    /**
     * All sections are shown in one page
     *
     * @public
     */
    Page: "Page",
    /**
     * All top-level sections are shown in an own tab
     *
     * @public
     */
    Tabs: "Tabs"
  };
  MultipleModeBlock.register();
  DraftHandlerButtonBlock.register();
  FooterContentBlock.register();
  CollaborationDraft.register();
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0ZW1wbGF0ZXNOYW1lc3BhY2UiLCJ0ZW1wbGF0ZXNMUk5hbWVzcGFjZSIsInRlbXBsYXRlc09QTmFtZXNwYWNlIiwidGhpc0xpYiIsIkNvcmUiLCJpbml0TGlicmFyeSIsIm5hbWUiLCJkZXBlbmRlbmNpZXMiLCJ0eXBlcyIsImludGVyZmFjZXMiLCJjb250cm9scyIsImVsZW1lbnRzIiwidmVyc2lvbiIsIm5vTGlicmFyeUNTUyIsIk9iamVjdFBhZ2UiLCJTZWN0aW9uTGF5b3V0IiwiUGFnZSIsIlRhYnMiLCJNdWx0aXBsZU1vZGVCbG9jayIsInJlZ2lzdGVyIiwiRHJhZnRIYW5kbGVyQnV0dG9uQmxvY2siLCJGb290ZXJDb250ZW50QmxvY2siLCJDb2xsYWJvcmF0aW9uRHJhZnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbImxpYnJhcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwic2FwL2YvbGlicmFyeVwiO1xuaW1wb3J0IFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IFwic2FwL2ZlL21hY3Jvcy9saWJyYXJ5XCI7XG5pbXBvcnQgTXVsdGlwbGVNb2RlQmxvY2sgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvTGlzdFJlcG9ydC92aWV3L2ZyYWdtZW50cy9NdWx0aXBsZU1vZGUuYmxvY2tcIjtcbmltcG9ydCBDb2xsYWJvcmF0aW9uRHJhZnQgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvT2JqZWN0UGFnZS9jb21wb25lbnRzL0NvbGxhYm9yYXRpb25EcmFmdC5ibG9ja1wiO1xuaW1wb3J0IERyYWZ0SGFuZGxlckJ1dHRvbkJsb2NrIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvY29tcG9uZW50cy9EcmFmdEhhbmRsZXJCdXR0b24uYmxvY2tcIjtcbmltcG9ydCBGb290ZXJDb250ZW50QmxvY2sgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvT2JqZWN0UGFnZS92aWV3L2ZyYWdtZW50cy9Gb290ZXJDb250ZW50LmJsb2NrXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuLyoqXG4gKiBMaWJyYXJ5IHByb3ZpZGluZyB0aGUgb2ZmaWNpYWwgdGVtcGxhdGVzIHN1cHBvcnRlZCBieSBTQVAgRmlvcmkgZWxlbWVudHMuXG4gKlxuICogQG5hbWVzcGFjZVxuICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlc1xuICogQHB1YmxpY1xuICovXG5leHBvcnQgY29uc3QgdGVtcGxhdGVzTmFtZXNwYWNlID0gXCJzYXAuZmUudGVtcGxhdGVzXCI7XG5cbi8qKlxuICogQG5hbWVzcGFjZVxuICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0XG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW1wbGF0ZXNMUk5hbWVzcGFjZSA9IFwic2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0XCI7XG5cbi8qKlxuICogQG5hbWVzcGFjZVxuICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW1wbGF0ZXNPUE5hbWVzcGFjZSA9IFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlXCI7XG5cbmNvbnN0IHRoaXNMaWIgPSBDb3JlLmluaXRMaWJyYXJ5KHtcblx0bmFtZTogXCJzYXAuZmUudGVtcGxhdGVzXCIsXG5cdGRlcGVuZGVuY2llczogW1wic2FwLnVpLmNvcmVcIiwgXCJzYXAuZmUuY29yZVwiLCBcInNhcC5mZS5tYWNyb3NcIiwgXCJzYXAuZlwiXSxcblx0dHlwZXM6IFtcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5TZWN0aW9uTGF5b3V0XCJdLFxuXHRpbnRlcmZhY2VzOiBbXSxcblx0Y29udHJvbHM6IFtdLFxuXHRlbGVtZW50czogW10sXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby10ZW1wbGF0ZS1jdXJseS1pbi1zdHJpbmdcblx0dmVyc2lvbjogXCIke3ZlcnNpb259XCIsXG5cdG5vTGlicmFyeUNTUzogdHJ1ZVxufSkgYXMgYW55O1xuXG5pZiAoIXRoaXNMaWIuT2JqZWN0UGFnZSkge1xuXHR0aGlzTGliLk9iamVjdFBhZ2UgPSB7fTtcbn1cbnRoaXNMaWIuT2JqZWN0UGFnZS5TZWN0aW9uTGF5b3V0ID0ge1xuXHQvKipcblx0ICogQWxsIHNlY3Rpb25zIGFyZSBzaG93biBpbiBvbmUgcGFnZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRQYWdlOiBcIlBhZ2VcIixcblxuXHQvKipcblx0ICogQWxsIHRvcC1sZXZlbCBzZWN0aW9ucyBhcmUgc2hvd24gaW4gYW4gb3duIHRhYlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRUYWJzOiBcIlRhYnNcIlxufTtcblxuTXVsdGlwbGVNb2RlQmxvY2sucmVnaXN0ZXIoKTtcbkRyYWZ0SGFuZGxlckJ1dHRvbkJsb2NrLnJlZ2lzdGVyKCk7XG5Gb290ZXJDb250ZW50QmxvY2sucmVnaXN0ZXIoKTtcbkNvbGxhYm9yYXRpb25EcmFmdC5yZWdpc3RlcigpO1xuXG5leHBvcnQgZGVmYXVsdCB0aGlzTGliO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sTUFBTUEsa0JBQWtCLEdBQUcsa0JBQWtCOztFQUVwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBSkE7RUFLTyxNQUFNQyxvQkFBb0IsR0FBRyw2QkFBNkI7O0VBRWpFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFKQTtFQUtPLE1BQU1DLG9CQUFvQixHQUFHLDZCQUE2QjtFQUFDO0VBRWxFLE1BQU1DLE9BQU8sR0FBR0MsSUFBSSxDQUFDQyxXQUFXLENBQUM7SUFDaENDLElBQUksRUFBRSxrQkFBa0I7SUFDeEJDLFlBQVksRUFBRSxDQUFDLGFBQWEsRUFBRSxhQUFhLEVBQUUsZUFBZSxFQUFFLE9BQU8sQ0FBQztJQUN0RUMsS0FBSyxFQUFFLENBQUMsMkNBQTJDLENBQUM7SUFDcERDLFVBQVUsRUFBRSxFQUFFO0lBQ2RDLFFBQVEsRUFBRSxFQUFFO0lBQ1pDLFFBQVEsRUFBRSxFQUFFO0lBQ1o7SUFDQUMsT0FBTyxFQUFFLFlBQVk7SUFDckJDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBUTtFQUVULElBQUksQ0FBQ1YsT0FBTyxDQUFDVyxVQUFVLEVBQUU7SUFDeEJYLE9BQU8sQ0FBQ1csVUFBVSxHQUFHLENBQUMsQ0FBQztFQUN4QjtFQUNBWCxPQUFPLENBQUNXLFVBQVUsQ0FBQ0MsYUFBYSxHQUFHO0lBQ2xDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsSUFBSSxFQUFFLE1BQU07SUFFWjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLElBQUksRUFBRTtFQUNQLENBQUM7RUFFREMsaUJBQWlCLENBQUNDLFFBQVEsRUFBRTtFQUM1QkMsdUJBQXVCLENBQUNELFFBQVEsRUFBRTtFQUNsQ0Usa0JBQWtCLENBQUNGLFFBQVEsRUFBRTtFQUM3Qkcsa0JBQWtCLENBQUNILFFBQVEsRUFBRTtFQUFDLE9BRWZoQixPQUFPO0FBQUEifQ==
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/library", "sap/fe/macros/filter/type/MultiValue", "sap/fe/macros/filter/type/Range", "sap/fe/macros/macroLibrary", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/field/ConditionsType", "sap/ui/mdc/library", "sap/ui/unified/library"], function (_library, _MultiValue, _Range, _macroLibrary, Core, Fragment, _library2, _XMLTemplateProcessor, _ConditionsType, _library3, _library4) {
  "use strict";

  var _exports = {};
  /**
   * Library containing the building blocks for SAP Fiori elements.
   *
   * @namespace
   * @name sap.fe.macros
   * @public
   */
  const macrosNamespace = "sap.fe.macros";

  // library dependencies
  _exports.macrosNamespace = macrosNamespace;
  const thisLib = Core.initLibrary({
    name: "sap.fe.macros",
    dependencies: ["sap.ui.core", "sap.ui.mdc", "sap.ui.unified", "sap.fe.core"],
    types: ["sap.fe.macros.NavigationType"],
    interfaces: [],
    controls: [],
    elements: [],
    // eslint-disable-next-line no-template-curly-in-string
    version: "1.115.1",
    noLibraryCSS: true
  });
  thisLib.NavigationType = {
    /**
     * For External Navigation
     *
     * @public
     */
    External: "External",
    /**
     * For In-Page Navigation
     *
     * @public
     */
    InPage: "InPage",
    /**
     * For No Navigation
     *
     * @public
     */
    None: "None"
  };
  Fragment.registerType("CUSTOM", {
    load: Fragment.getType("XML").load,
    init: function (mSettings) {
      const currentController = mSettings.containingView.getController();
      let targetControllerExtension = currentController;
      if (currentController && !currentController.isA("sap.fe.core.ExtensionAPI")) {
        targetControllerExtension = currentController.getExtensionAPI(mSettings.id);
      }
      mSettings.containingView = {
        oController: targetControllerExtension
      };
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return Fragment.getType("XML").init.apply(this, [mSettings, args]);
    }
  });
  return thisLib;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtYWNyb3NOYW1lc3BhY2UiLCJ0aGlzTGliIiwiQ29yZSIsImluaXRMaWJyYXJ5IiwibmFtZSIsImRlcGVuZGVuY2llcyIsInR5cGVzIiwiaW50ZXJmYWNlcyIsImNvbnRyb2xzIiwiZWxlbWVudHMiLCJ2ZXJzaW9uIiwibm9MaWJyYXJ5Q1NTIiwiTmF2aWdhdGlvblR5cGUiLCJFeHRlcm5hbCIsIkluUGFnZSIsIk5vbmUiLCJGcmFnbWVudCIsInJlZ2lzdGVyVHlwZSIsImxvYWQiLCJnZXRUeXBlIiwiaW5pdCIsIm1TZXR0aW5ncyIsImN1cnJlbnRDb250cm9sbGVyIiwiY29udGFpbmluZ1ZpZXciLCJnZXRDb250cm9sbGVyIiwidGFyZ2V0Q29udHJvbGxlckV4dGVuc2lvbiIsImlzQSIsImdldEV4dGVuc2lvbkFQSSIsImlkIiwib0NvbnRyb2xsZXIiLCJhcmdzIiwiYXBwbHkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbImxpYnJhcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvdHlwZS9NdWx0aVZhbHVlXCI7XG5pbXBvcnQgXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci90eXBlL1JhbmdlXCI7XG5pbXBvcnQgXCJzYXAvZmUvbWFjcm9zL21hY3JvTGlicmFyeVwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgXCJzYXAvdWkvbWRjL2ZpZWxkL0NvbmRpdGlvbnNUeXBlXCI7XG5pbXBvcnQgXCJzYXAvdWkvbWRjL2xpYnJhcnlcIjtcbmltcG9ydCBcInNhcC91aS91bmlmaWVkL2xpYnJhcnlcIjtcblxuLyoqXG4gKiBMaWJyYXJ5IGNvbnRhaW5pbmcgdGhlIGJ1aWxkaW5nIGJsb2NrcyBmb3IgU0FQIEZpb3JpIGVsZW1lbnRzLlxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBuYW1lIHNhcC5mZS5tYWNyb3NcbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IGNvbnN0IG1hY3Jvc05hbWVzcGFjZSA9IFwic2FwLmZlLm1hY3Jvc1wiO1xuXG4vLyBsaWJyYXJ5IGRlcGVuZGVuY2llc1xuY29uc3QgdGhpc0xpYiA9IENvcmUuaW5pdExpYnJhcnkoe1xuXHRuYW1lOiBcInNhcC5mZS5tYWNyb3NcIixcblx0ZGVwZW5kZW5jaWVzOiBbXCJzYXAudWkuY29yZVwiLCBcInNhcC51aS5tZGNcIiwgXCJzYXAudWkudW5pZmllZFwiLCBcInNhcC5mZS5jb3JlXCJdLFxuXHR0eXBlczogW1wic2FwLmZlLm1hY3Jvcy5OYXZpZ2F0aW9uVHlwZVwiXSxcblx0aW50ZXJmYWNlczogW10sXG5cdGNvbnRyb2xzOiBbXSxcblx0ZWxlbWVudHM6IFtdLFxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdGVtcGxhdGUtY3VybHktaW4tc3RyaW5nXG5cdHZlcnNpb246IFwiJHt2ZXJzaW9ufVwiLFxuXHRub0xpYnJhcnlDU1M6IHRydWVcbn0pIGFzIGFueTtcblxudGhpc0xpYi5OYXZpZ2F0aW9uVHlwZSA9IHtcblx0LyoqXG5cdCAqIEZvciBFeHRlcm5hbCBOYXZpZ2F0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEV4dGVybmFsOiBcIkV4dGVybmFsXCIsXG5cblx0LyoqXG5cdCAqIEZvciBJbi1QYWdlIE5hdmlnYXRpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0SW5QYWdlOiBcIkluUGFnZVwiLFxuXG5cdC8qKlxuXHQgKiBGb3IgTm8gTmF2aWdhdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHROb25lOiBcIk5vbmVcIlxufTtcblxuRnJhZ21lbnQucmVnaXN0ZXJUeXBlKFwiQ1VTVE9NXCIsIHtcblx0bG9hZDogKEZyYWdtZW50IGFzIGFueSkuZ2V0VHlwZShcIlhNTFwiKS5sb2FkLFxuXHRpbml0OiBmdW5jdGlvbiAobVNldHRpbmdzOiBhbnksIC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0Y29uc3QgY3VycmVudENvbnRyb2xsZXIgPSBtU2V0dGluZ3MuY29udGFpbmluZ1ZpZXcuZ2V0Q29udHJvbGxlcigpO1xuXHRcdGxldCB0YXJnZXRDb250cm9sbGVyRXh0ZW5zaW9uID0gY3VycmVudENvbnRyb2xsZXI7XG5cdFx0aWYgKGN1cnJlbnRDb250cm9sbGVyICYmICFjdXJyZW50Q29udHJvbGxlci5pc0EoXCJzYXAuZmUuY29yZS5FeHRlbnNpb25BUElcIikpIHtcblx0XHRcdHRhcmdldENvbnRyb2xsZXJFeHRlbnNpb24gPSBjdXJyZW50Q29udHJvbGxlci5nZXRFeHRlbnNpb25BUEkobVNldHRpbmdzLmlkKTtcblx0XHR9XG5cdFx0bVNldHRpbmdzLmNvbnRhaW5pbmdWaWV3ID0ge1xuXHRcdFx0b0NvbnRyb2xsZXI6IHRhcmdldENvbnRyb2xsZXJFeHRlbnNpb25cblx0XHR9O1xuXHRcdHJldHVybiAoRnJhZ21lbnQgYXMgYW55KS5nZXRUeXBlKFwiWE1MXCIpLmluaXQuYXBwbHkodGhpcywgW21TZXR0aW5ncywgYXJnc10pO1xuXHR9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgdGhpc0xpYjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU1BLGVBQWUsR0FBRyxlQUFlOztFQUU5QztFQUFBO0VBQ0EsTUFBTUMsT0FBTyxHQUFHQyxJQUFJLENBQUNDLFdBQVcsQ0FBQztJQUNoQ0MsSUFBSSxFQUFFLGVBQWU7SUFDckJDLFlBQVksRUFBRSxDQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxDQUFDO0lBQzVFQyxLQUFLLEVBQUUsQ0FBQyw4QkFBOEIsQ0FBQztJQUN2Q0MsVUFBVSxFQUFFLEVBQUU7SUFDZEMsUUFBUSxFQUFFLEVBQUU7SUFDWkMsUUFBUSxFQUFFLEVBQUU7SUFDWjtJQUNBQyxPQUFPLEVBQUUsWUFBWTtJQUNyQkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFRO0VBRVRWLE9BQU8sQ0FBQ1csY0FBYyxHQUFHO0lBQ3hCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFLFVBQVU7SUFFcEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxNQUFNLEVBQUUsUUFBUTtJQUVoQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLElBQUksRUFBRTtFQUNQLENBQUM7RUFFREMsUUFBUSxDQUFDQyxZQUFZLENBQUMsUUFBUSxFQUFFO0lBQy9CQyxJQUFJLEVBQUdGLFFBQVEsQ0FBU0csT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDRCxJQUFJO0lBQzNDRSxJQUFJLEVBQUUsVUFBVUMsU0FBYyxFQUFrQjtNQUMvQyxNQUFNQyxpQkFBaUIsR0FBR0QsU0FBUyxDQUFDRSxjQUFjLENBQUNDLGFBQWEsRUFBRTtNQUNsRSxJQUFJQyx5QkFBeUIsR0FBR0gsaUJBQWlCO01BQ2pELElBQUlBLGlCQUFpQixJQUFJLENBQUNBLGlCQUFpQixDQUFDSSxHQUFHLENBQUMsMEJBQTBCLENBQUMsRUFBRTtRQUM1RUQseUJBQXlCLEdBQUdILGlCQUFpQixDQUFDSyxlQUFlLENBQUNOLFNBQVMsQ0FBQ08sRUFBRSxDQUFDO01BQzVFO01BQ0FQLFNBQVMsQ0FBQ0UsY0FBYyxHQUFHO1FBQzFCTSxXQUFXLEVBQUVKO01BQ2QsQ0FBQztNQUFDLGtDQVJnQ0ssSUFBSTtRQUFKQSxJQUFJO01BQUE7TUFTdEMsT0FBUWQsUUFBUSxDQUFTRyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUNDLElBQUksQ0FBQ1csS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDVixTQUFTLEVBQUVTLElBQUksQ0FBQyxDQUFDO0lBQzVFO0VBQ0QsQ0FBQyxDQUFDO0VBQUMsT0FFWTdCLE9BQU87QUFBQSJ9
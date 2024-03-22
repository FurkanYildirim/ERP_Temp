/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/filter/FilterUtils", "sap/fe/templates/ListReport/LRMessageStrip", "sap/ui/core/InvisibleMessage", "sap/ui/core/library"], function (ExtensionAPI, ClassSupport, ChartUtils, FilterUtils, $LRMessageStrip, InvisibleMessage, library) {
  "use strict";

  var _dec, _class;
  var InvisibleMessageMode = library.InvisibleMessageMode;
  var LRMessageStrip = $LRMessageStrip.LRMessageStrip;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Extension API for list reports in SAP Fiori elements for OData V4.
   *
   * To correctly integrate your app extension coding with SAP Fiori elements, use only the extensionAPI of SAP Fiori elements. Don't access or manipulate controls, properties, models, or other internal objects created by the SAP Fiori elements framework.
   *
   * @alias sap.fe.templates.ListReport.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  let ListReportExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ListReport.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ListReportExtensionAPI, _ExtensionAPI);
    function ListReportExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ListReportExtensionAPI.prototype;
    /**
     * Refreshes the List Report.
     * This method currently only supports triggering the search (by clicking on the GO button)
     * in the List Report Filter Bar. It can be used to request the initial load or to refresh the
     * currently shown data based on the filters entered by the user.
     * Please note: The Promise is resolved once the search is triggered and not once the data is returned.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#refresh
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh() {
      const filterBar = this._controller._getFilterBarControl();
      const filterBarAPI = filterBar === null || filterBar === void 0 ? void 0 : filterBar.getParent();
      if (filterBarAPI) {
        filterBarAPI.triggerSearch();
      }
      // TODO: if there is no filter bar, make refresh work
      return Promise.resolve();
    }

    /**
     * Gets the list entries currently selected for the displayed control.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getSelectedContexts
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts() {
      var _this$_controller$_ge, _this$_controller$_ge2;
      const oControl = this._controller._isMultiMode() && ((_this$_controller$_ge = this._controller._getMultiModeControl()) === null || _this$_controller$_ge === void 0 ? void 0 : (_this$_controller$_ge2 = _this$_controller$_ge.getSelectedInnerControl()) === null || _this$_controller$_ge2 === void 0 ? void 0 : _this$_controller$_ge2.content) || this._controller._getTable();
      if (oControl.isA("sap.ui.mdc.Chart")) {
        const aSelectedContexts = [];
        if (oControl && oControl.get_chart()) {
          const aSelectedDataPoints = ChartUtils.getChartSelectedData(oControl.get_chart());
          for (let i = 0; i < aSelectedDataPoints.length; i++) {
            aSelectedContexts.push(aSelectedDataPoints[i].context);
          }
        }
        return aSelectedContexts;
      } else {
        return oControl && oControl.getSelectedContexts() || [];
      }
    }

    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param sConditionPath The path to the property as a condition path
     * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @param vValues The values to be applied
     * @alias sap.fe.templates.ListReport.ExtensionAPI#setFilterValues
     * @returns A promise for asynchronous handling
     * @public
     */;
    _proto.setFilterValues = function setFilterValues(sConditionPath, sOperator, vValues) {
      // The List Report has two filter bars: The filter bar in the header and the filter bar in the "Adapt Filter" dialog;
      // when the dialog is opened, the user is working with that active control: Pass it to the setFilterValues method!
      const filterBar = this._controller._getAdaptationFilterBarControl() || this._controller._getFilterBarControl();
      if (arguments.length === 2) {
        vValues = sOperator;
        return FilterUtils.setFilterValues(filterBar, sConditionPath, vValues);
      }
      return FilterUtils.setFilterValues(filterBar, sConditionPath, sOperator, vValues);
    }

    /**
     * This method converts filter conditions to filters.
     *
     * @param mFilterConditions Map containing the filter conditions of the FilterBar.
     * @alias sap.fe.templates.ListReport.ExtensionAPI#createFiltersFromFilterConditions
     * @returns Object containing the converted FilterBar filters.
     * @public
     */;
    _proto.createFiltersFromFilterConditions = function createFiltersFromFilterConditions(mFilterConditions) {
      const oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilterInfo(oFilterBar, undefined, mFilterConditions);
    }

    /**
     * Provides all the model filters from the filter bar that are currently active
     * along with the search expression.
     *
     * @alias sap.fe.templates.ListReport.ExtensionAPI#getFilters
     * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
     * @public
     */;
    _proto.getFilters = function getFilters() {
      const oFilterBar = this._controller._getFilterBarControl();
      return FilterUtils.getFilters(oFilterBar);
    }

    /**
     * Provide an option for showing a custom message in the message strip above the list report table.
     *
     * @param {object} [message] Custom message along with the message type to be set on the table.
     * @param {string} message.message Message string to be displayed.
     * @param {sap.ui.core.MessageType} message.type Indicates the type of message.
     * @param {string[]|string} [tabKey] The tabKey identifying the table where the custom message is displayed. If tabKey is empty, the message is displayed in all tabs . If tabKey = ['1','2'], the message is displayed in tabs 1 and 2 only
     * @param {Function} [onClose] A function that is called when the user closes the message bar.
     * @public
     */;
    _proto.setCustomMessage = function setCustomMessage(message, tabKey, onClose) {
      if (!this.ListReportMessageStrip) {
        this.ListReportMessageStrip = new LRMessageStrip();
      }
      this.ListReportMessageStrip.showCustomMessage(message, this._controller, tabKey, onClose);
      if (message !== null && message !== void 0 && message.message) {
        InvisibleMessage.getInstance().announce(message.message, InvisibleMessageMode.Assertive);
      }
    };
    return ListReportExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ListReportExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaXN0UmVwb3J0RXh0ZW5zaW9uQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJyZWZyZXNoIiwiZmlsdGVyQmFyIiwiX2NvbnRyb2xsZXIiLCJfZ2V0RmlsdGVyQmFyQ29udHJvbCIsImZpbHRlckJhckFQSSIsImdldFBhcmVudCIsInRyaWdnZXJTZWFyY2giLCJQcm9taXNlIiwicmVzb2x2ZSIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJvQ29udHJvbCIsIl9pc011bHRpTW9kZSIsIl9nZXRNdWx0aU1vZGVDb250cm9sIiwiZ2V0U2VsZWN0ZWRJbm5lckNvbnRyb2wiLCJjb250ZW50IiwiX2dldFRhYmxlIiwiaXNBIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJnZXRfY2hhcnQiLCJhU2VsZWN0ZWREYXRhUG9pbnRzIiwiQ2hhcnRVdGlscyIsImdldENoYXJ0U2VsZWN0ZWREYXRhIiwiaSIsImxlbmd0aCIsInB1c2giLCJjb250ZXh0Iiwic2V0RmlsdGVyVmFsdWVzIiwic0NvbmRpdGlvblBhdGgiLCJzT3BlcmF0b3IiLCJ2VmFsdWVzIiwiX2dldEFkYXB0YXRpb25GaWx0ZXJCYXJDb250cm9sIiwiYXJndW1lbnRzIiwiRmlsdGVyVXRpbHMiLCJjcmVhdGVGaWx0ZXJzRnJvbUZpbHRlckNvbmRpdGlvbnMiLCJtRmlsdGVyQ29uZGl0aW9ucyIsIm9GaWx0ZXJCYXIiLCJnZXRGaWx0ZXJJbmZvIiwidW5kZWZpbmVkIiwiZ2V0RmlsdGVycyIsInNldEN1c3RvbU1lc3NhZ2UiLCJtZXNzYWdlIiwidGFiS2V5Iiwib25DbG9zZSIsIkxpc3RSZXBvcnRNZXNzYWdlU3RyaXAiLCJMUk1lc3NhZ2VTdHJpcCIsInNob3dDdXN0b21NZXNzYWdlIiwiSW52aXNpYmxlTWVzc2FnZSIsImdldEluc3RhbmNlIiwiYW5ub3VuY2UiLCJJbnZpc2libGVNZXNzYWdlTW9kZSIsIkFzc2VydGl2ZSIsIkV4dGVuc2lvbkFQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRXh0ZW5zaW9uQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHRlbnNpb25BUEkgZnJvbSBcInNhcC9mZS9jb3JlL0V4dGVuc2lvbkFQSVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDaGFydFV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0VXRpbHNcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhckFQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXJCYXIvRmlsdGVyQmFyQVBJXCI7XG5pbXBvcnQgdHlwZSBMaXN0UmVwb3J0Q29udHJvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L0xpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXJcIjtcbmltcG9ydCB7IExSQ3VzdG9tTWVzc2FnZSwgTFJNZXNzYWdlU3RyaXAgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L0xSTWVzc2FnZVN0cmlwXCI7XG5pbXBvcnQgSW52aXNpYmxlTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvSW52aXNpYmxlTWVzc2FnZVwiO1xuaW1wb3J0IHsgSW52aXNpYmxlTWVzc2FnZU1vZGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuXG4vKipcbiAqIEV4dGVuc2lvbiBBUEkgZm9yIGxpc3QgcmVwb3J0cyBpbiBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIE9EYXRhIFY0LlxuICpcbiAqIFRvIGNvcnJlY3RseSBpbnRlZ3JhdGUgeW91ciBhcHAgZXh0ZW5zaW9uIGNvZGluZyB3aXRoIFNBUCBGaW9yaSBlbGVtZW50cywgdXNlIG9ubHkgdGhlIGV4dGVuc2lvbkFQSSBvZiBTQVAgRmlvcmkgZWxlbWVudHMuIERvbid0IGFjY2VzcyBvciBtYW5pcHVsYXRlIGNvbnRyb2xzLCBwcm9wZXJ0aWVzLCBtb2RlbHMsIG9yIG90aGVyIGludGVybmFsIG9iamVjdHMgY3JlYXRlZCBieSB0aGUgU0FQIEZpb3JpIGVsZW1lbnRzIGZyYW1ld29yay5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSVxuICogQHB1YmxpY1xuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQGZpbmFsXG4gKiBAc2luY2UgMS43OS4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5FeHRlbnNpb25BUElcIilcbmNsYXNzIExpc3RSZXBvcnRFeHRlbnNpb25BUEkgZXh0ZW5kcyBFeHRlbnNpb25BUEkge1xuXHRwcm90ZWN0ZWQgX2NvbnRyb2xsZXIhOiBMaXN0UmVwb3J0Q29udHJvbGxlcjtcblxuXHRMaXN0UmVwb3J0TWVzc2FnZVN0cmlwITogTFJNZXNzYWdlU3RyaXA7XG5cblx0LyoqXG5cdCAqIFJlZnJlc2hlcyB0aGUgTGlzdCBSZXBvcnQuXG5cdCAqIFRoaXMgbWV0aG9kIGN1cnJlbnRseSBvbmx5IHN1cHBvcnRzIHRyaWdnZXJpbmcgdGhlIHNlYXJjaCAoYnkgY2xpY2tpbmcgb24gdGhlIEdPIGJ1dHRvbilcblx0ICogaW4gdGhlIExpc3QgUmVwb3J0IEZpbHRlciBCYXIuIEl0IGNhbiBiZSB1c2VkIHRvIHJlcXVlc3QgdGhlIGluaXRpYWwgbG9hZCBvciB0byByZWZyZXNoIHRoZVxuXHQgKiBjdXJyZW50bHkgc2hvd24gZGF0YSBiYXNlZCBvbiB0aGUgZmlsdGVycyBlbnRlcmVkIGJ5IHRoZSB1c2VyLlxuXHQgKiBQbGVhc2Ugbm90ZTogVGhlIFByb21pc2UgaXMgcmVzb2x2ZWQgb25jZSB0aGUgc2VhcmNoIGlzIHRyaWdnZXJlZCBhbmQgbm90IG9uY2UgdGhlIGRhdGEgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJI3JlZnJlc2hcblx0ICogQHJldHVybnMgUmVzb2x2ZWQgb25jZSB0aGUgZGF0YSBpcyByZWZyZXNoZWQgb3IgcmVqZWN0ZWQgaWYgdGhlIHJlcXVlc3QgZmFpbGVkXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlZnJlc2goKSB7XG5cdFx0Y29uc3QgZmlsdGVyQmFyID0gdGhpcy5fY29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdGNvbnN0IGZpbHRlckJhckFQSSA9IGZpbHRlckJhcj8uZ2V0UGFyZW50KCkgYXMgRmlsdGVyQmFyQVBJO1xuXHRcdGlmIChmaWx0ZXJCYXJBUEkpIHtcblx0XHRcdGZpbHRlckJhckFQSS50cmlnZ2VyU2VhcmNoKCk7XG5cdFx0fVxuXHRcdC8vIFRPRE86IGlmIHRoZXJlIGlzIG5vIGZpbHRlciBiYXIsIG1ha2UgcmVmcmVzaCB3b3JrXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGxpc3QgZW50cmllcyBjdXJyZW50bHkgc2VsZWN0ZWQgZm9yIHRoZSBkaXNwbGF5ZWQgY29udHJvbC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5FeHRlbnNpb25BUEkjZ2V0U2VsZWN0ZWRDb250ZXh0c1xuXHQgKiBAcmV0dXJucyBBcnJheSBjb250YWluaW5nIHRoZSBzZWxlY3RlZCBjb250ZXh0c1xuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRTZWxlY3RlZENvbnRleHRzKCkge1xuXHRcdGNvbnN0IG9Db250cm9sID0gKCh0aGlzLl9jb250cm9sbGVyLl9pc011bHRpTW9kZSgpICYmXG5cdFx0XHR0aGlzLl9jb250cm9sbGVyLl9nZXRNdWx0aU1vZGVDb250cm9sKCk/LmdldFNlbGVjdGVkSW5uZXJDb250cm9sKCk/LmNvbnRlbnQpIHx8XG5cdFx0XHR0aGlzLl9jb250cm9sbGVyLl9nZXRUYWJsZSgpKSBhcyBhbnk7XG5cdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuQ2hhcnRcIikpIHtcblx0XHRcdGNvbnN0IGFTZWxlY3RlZENvbnRleHRzID0gW107XG5cdFx0XHRpZiAob0NvbnRyb2wgJiYgb0NvbnRyb2wuZ2V0X2NoYXJ0KCkpIHtcblx0XHRcdFx0Y29uc3QgYVNlbGVjdGVkRGF0YVBvaW50cyA9IENoYXJ0VXRpbHMuZ2V0Q2hhcnRTZWxlY3RlZERhdGEob0NvbnRyb2wuZ2V0X2NoYXJ0KCkpO1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZWxlY3RlZERhdGFQb2ludHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0cy5wdXNoKGFTZWxlY3RlZERhdGFQb2ludHNbaV0uY29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBhU2VsZWN0ZWRDb250ZXh0cztcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIChvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRTZWxlY3RlZENvbnRleHRzKCkpIHx8IFtdO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGZpbHRlciB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eSBpbiB0aGUgZmlsdGVyIGJhci5cblx0ICogVGhlIGZpbHRlciB2YWx1ZXMgY2FuIGJlIGVpdGhlciBhIHNpbmdsZSB2YWx1ZSBvciBhbiBhcnJheSBvZiB2YWx1ZXMuXG5cdCAqIEVhY2ggZmlsdGVyIHZhbHVlIG11c3QgYmUgcmVwcmVzZW50ZWQgYXMgYSBwcmltaXRpdmUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQ29uZGl0aW9uUGF0aCBUaGUgcGF0aCB0byB0aGUgcHJvcGVydHkgYXMgYSBjb25kaXRpb24gcGF0aFxuXHQgKiBAcGFyYW0gW3NPcGVyYXRvcl0gVGhlIG9wZXJhdG9yIHRvIGJlIHVzZWQgKG9wdGlvbmFsKSAtIGlmIG5vdCBzZXQsIHRoZSBkZWZhdWx0IG9wZXJhdG9yIChFUSkgd2lsbCBiZSB1c2VkXG5cdCAqIEBwYXJhbSB2VmFsdWVzIFRoZSB2YWx1ZXMgdG8gYmUgYXBwbGllZFxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0LkV4dGVuc2lvbkFQSSNzZXRGaWx0ZXJWYWx1ZXNcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGZvciBhc3luY2hyb25vdXMgaGFuZGxpbmdcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2V0RmlsdGVyVmFsdWVzKFxuXHRcdHNDb25kaXRpb25QYXRoOiBzdHJpbmcsXG5cdFx0c09wZXJhdG9yOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0dlZhbHVlcz86IHVuZGVmaW5lZCB8IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCBzdHJpbmdbXSB8IG51bWJlcltdIHwgYm9vbGVhbltdXG5cdCkge1xuXHRcdC8vIFRoZSBMaXN0IFJlcG9ydCBoYXMgdHdvIGZpbHRlciBiYXJzOiBUaGUgZmlsdGVyIGJhciBpbiB0aGUgaGVhZGVyIGFuZCB0aGUgZmlsdGVyIGJhciBpbiB0aGUgXCJBZGFwdCBGaWx0ZXJcIiBkaWFsb2c7XG5cdFx0Ly8gd2hlbiB0aGUgZGlhbG9nIGlzIG9wZW5lZCwgdGhlIHVzZXIgaXMgd29ya2luZyB3aXRoIHRoYXQgYWN0aXZlIGNvbnRyb2w6IFBhc3MgaXQgdG8gdGhlIHNldEZpbHRlclZhbHVlcyBtZXRob2QhXG5cdFx0Y29uc3QgZmlsdGVyQmFyID0gdGhpcy5fY29udHJvbGxlci5fZ2V0QWRhcHRhdGlvbkZpbHRlckJhckNvbnRyb2woKSB8fCB0aGlzLl9jb250cm9sbGVyLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcblx0XHRcdHZWYWx1ZXMgPSBzT3BlcmF0b3I7XG5cdFx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuc2V0RmlsdGVyVmFsdWVzKGZpbHRlckJhciwgc0NvbmRpdGlvblBhdGgsIHZWYWx1ZXMpO1xuXHRcdH1cblxuXHRcdHJldHVybiBGaWx0ZXJVdGlscy5zZXRGaWx0ZXJWYWx1ZXMoZmlsdGVyQmFyLCBzQ29uZGl0aW9uUGF0aCwgc09wZXJhdG9yLCB2VmFsdWVzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBjb252ZXJ0cyBmaWx0ZXIgY29uZGl0aW9ucyB0byBmaWx0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gbUZpbHRlckNvbmRpdGlvbnMgTWFwIGNvbnRhaW5pbmcgdGhlIGZpbHRlciBjb25kaXRpb25zIG9mIHRoZSBGaWx0ZXJCYXIuXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuRXh0ZW5zaW9uQVBJI2NyZWF0ZUZpbHRlcnNGcm9tRmlsdGVyQ29uZGl0aW9uc1xuXHQgKiBAcmV0dXJucyBPYmplY3QgY29udGFpbmluZyB0aGUgY29udmVydGVkIEZpbHRlckJhciBmaWx0ZXJzLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRjcmVhdGVGaWx0ZXJzRnJvbUZpbHRlckNvbmRpdGlvbnMobUZpbHRlckNvbmRpdGlvbnM6IGFueSkge1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSB0aGlzLl9jb250cm9sbGVyLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0cmV0dXJuIEZpbHRlclV0aWxzLmdldEZpbHRlckluZm8ob0ZpbHRlckJhciwgdW5kZWZpbmVkLCBtRmlsdGVyQ29uZGl0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogUHJvdmlkZXMgYWxsIHRoZSBtb2RlbCBmaWx0ZXJzIGZyb20gdGhlIGZpbHRlciBiYXIgdGhhdCBhcmUgY3VycmVudGx5IGFjdGl2ZVxuXHQgKiBhbG9uZyB3aXRoIHRoZSBzZWFyY2ggZXhwcmVzc2lvbi5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5FeHRlbnNpb25BUEkjZ2V0RmlsdGVyc1xuXHQgKiBAcmV0dXJucyB7e2ZpbHRlcnM6IHNhcC51aS5tb2RlbC5GaWx0ZXJbXXx1bmRlZmluZWQsIHNlYXJjaDogc3RyaW5nfHVuZGVmaW5lZH19IEFuIGFycmF5IG9mIGFjdGl2ZSBmaWx0ZXJzIGFuZCB0aGUgc2VhcmNoIGV4cHJlc3Npb24uXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldEZpbHRlcnMoKSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2NvbnRyb2xsZXIuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuZ2V0RmlsdGVycyhvRmlsdGVyQmFyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm92aWRlIGFuIG9wdGlvbiBmb3Igc2hvd2luZyBhIGN1c3RvbSBtZXNzYWdlIGluIHRoZSBtZXNzYWdlIHN0cmlwIGFib3ZlIHRoZSBsaXN0IHJlcG9ydCB0YWJsZS5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IFttZXNzYWdlXSBDdXN0b20gbWVzc2FnZSBhbG9uZyB3aXRoIHRoZSBtZXNzYWdlIHR5cGUgdG8gYmUgc2V0IG9uIHRoZSB0YWJsZS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UubWVzc2FnZSBNZXNzYWdlIHN0cmluZyB0byBiZSBkaXNwbGF5ZWQuXG5cdCAqIEBwYXJhbSB7c2FwLnVpLmNvcmUuTWVzc2FnZVR5cGV9IG1lc3NhZ2UudHlwZSBJbmRpY2F0ZXMgdGhlIHR5cGUgb2YgbWVzc2FnZS5cblx0ICogQHBhcmFtIHtzdHJpbmdbXXxzdHJpbmd9IFt0YWJLZXldIFRoZSB0YWJLZXkgaWRlbnRpZnlpbmcgdGhlIHRhYmxlIHdoZXJlIHRoZSBjdXN0b20gbWVzc2FnZSBpcyBkaXNwbGF5ZWQuIElmIHRhYktleSBpcyBlbXB0eSwgdGhlIG1lc3NhZ2UgaXMgZGlzcGxheWVkIGluIGFsbCB0YWJzIC4gSWYgdGFiS2V5ID0gWycxJywnMiddLCB0aGUgbWVzc2FnZSBpcyBkaXNwbGF5ZWQgaW4gdGFicyAxIGFuZCAyIG9ubHlcblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gW29uQ2xvc2VdIEEgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgd2hlbiB0aGUgdXNlciBjbG9zZXMgdGhlIG1lc3NhZ2UgYmFyLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRDdXN0b21NZXNzYWdlKG1lc3NhZ2U6IExSQ3VzdG9tTWVzc2FnZSB8IHVuZGVmaW5lZCwgdGFiS2V5Pzogc3RyaW5nW10gfCBzdHJpbmcgfCBudWxsLCBvbkNsb3NlPzogRnVuY3Rpb24pIHtcblx0XHRpZiAoIXRoaXMuTGlzdFJlcG9ydE1lc3NhZ2VTdHJpcCkge1xuXHRcdFx0dGhpcy5MaXN0UmVwb3J0TWVzc2FnZVN0cmlwID0gbmV3IExSTWVzc2FnZVN0cmlwKCk7XG5cdFx0fVxuXHRcdHRoaXMuTGlzdFJlcG9ydE1lc3NhZ2VTdHJpcC5zaG93Q3VzdG9tTWVzc2FnZShtZXNzYWdlLCB0aGlzLl9jb250cm9sbGVyLCB0YWJLZXksIG9uQ2xvc2UpO1xuXHRcdGlmIChtZXNzYWdlPy5tZXNzYWdlKSB7XG5cdFx0XHRJbnZpc2libGVNZXNzYWdlLmdldEluc3RhbmNlKCkuYW5ub3VuY2UobWVzc2FnZS5tZXNzYWdlLCBJbnZpc2libGVNZXNzYWdlTW9kZS5Bc3NlcnRpdmUpO1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaXN0UmVwb3J0RXh0ZW5zaW9uQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVZBLElBWU1BLHNCQUFzQixXQUQzQkMsY0FBYyxDQUFDLDBDQUEwQyxDQUFDO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQU0xRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBVkMsT0FXQUMsT0FBTyxHQUFQLG1CQUFVO01BQ1QsTUFBTUMsU0FBUyxHQUFHLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxvQkFBb0IsRUFBRTtNQUN6RCxNQUFNQyxZQUFZLEdBQUdILFNBQVMsYUFBVEEs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
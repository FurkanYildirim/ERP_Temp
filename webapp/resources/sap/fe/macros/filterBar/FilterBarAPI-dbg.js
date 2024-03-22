/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/SemanticDateOperators", "sap/fe/core/StateFilterToSelectionVariant", "sap/fe/macros/filter/FilterUtils", "sap/ui/mdc/p13n/StateUtil", "../MacroAPI"], function (Log, merge, ClassSupport, SemanticDateOperators, StateFiltersToSelectionVariant, FilterUtils, StateUtil, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block for creating a FilterBar based on the metadata provided by OData V4.
   * <br>
   * Usually, a SelectionFields annotation is expected.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:FilterBar id="MyFilterBar" metaPath="@com.sap.vocabularies.UI.v1.SelectionFields" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.FilterBar
   * @public
   */
  let FilterBarAPI = (_dec = defineUI5Class("sap.fe.macros.filterBar.FilterBarAPI", {
    returnTypes: ["sap.ui.core.Control"]
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string",
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.SelectionFields"],
    expectedTypes: ["EntitySet", "EntityType"]
  }), _dec4 = property({
    type: "string",
    expectedTypes: ["EntitySet", "EntityType", "NavigationProperty"]
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "boolean",
    defaultValue: true
  }), _dec8 = property({
    type: "boolean",
    defaultValue: false
  }), _dec9 = aggregation({
    type: "sap.fe.macros.FilterField",
    multiple: true
  }), _dec10 = event(), _dec11 = event(), _dec12 = event(), _dec13 = event(), _dec14 = event(), _dec15 = event(), _dec16 = xmlEventHandler(), _dec17 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(FilterBarAPI, _MacroAPI);
    function FilterBarAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showMessages", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showClearButton", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterFields", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalSearch", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterChanged", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterClear", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalFilterChanged", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor14, _assertThisInitialized(_this));
      _this.triggerSearch = async () => {
        const filterBar = _this.content;
        try {
          if (filterBar) {
            await filterBar.waitForInitialization();
            return await filterBar.triggerSearch();
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          Log.error(`FE : Buildingblock : FilterBar : ${message}`);
          throw Error(message);
        }
      };
      _this.isSemanticDateFilterApplied = () => {
        return !SemanticDateOperators.hasSemanticDateOperations(_this.content.getConditions());
      };
      return _this;
    }
    var _proto = FilterBarAPI.prototype;
    _proto.handleSearch = function handleSearch(oEvent) {
      const oFilterBar = oEvent.getSource();
      const oEventParameters = oEvent.getParameters();
      if (oFilterBar) {
        const oConditions = oFilterBar.getFilterConditions();
        const eventParameters = this._prepareEventParameters(oFilterBar);
        this.fireInternalSearch(merge({
          conditions: oConditions
        }, oEventParameters));
        this.fireSearch(eventParameters);
      }
    };
    _proto.handleFilterChanged = function handleFilterChanged(oEvent) {
      const oFilterBar = oEvent.getSource();
      const oEventParameters = oEvent.getParameters();
      if (oFilterBar) {
        const oConditions = oFilterBar.getFilterConditions();
        const eventParameters = this._prepareEventParameters(oFilterBar);
        this.fireInternalFilterChanged(merge({
          conditions: oConditions
        }, oEventParameters));
        this.fireFilterChanged(eventParameters);
      }
    };
    _proto._prepareEventParameters = function _prepareEventParameters(oFilterBar) {
      const {
        parameters,
        filters,
        search
      } = FilterUtils.getFilters(oFilterBar);
      return {
        parameters,
        filters,
        search
      };
    }

    /**
     * Set the filter values for the given property in the filter bar.
     * The filter values can be either a single value or an array of values.
     * Each filter value must be represented as a primitive value.
     *
     * @param sConditionPath The path to the property as a condition path
     * @param [sOperator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @param vValues The values to be applied
     * @returns A promise for asynchronous handling
     * @public
     */;
    _proto.setFilterValues = function setFilterValues(sConditionPath, sOperator, vValues) {
      if (arguments.length === 2) {
        vValues = sOperator;
        return FilterUtils.setFilterValues(this.content, sConditionPath, vValues);
      }
      return FilterUtils.setFilterValues(this.content, sConditionPath, sOperator, vValues);
    }

    /**
     * Get the Active Filters Text Summary for the filter bar.
     *
     * @returns Active filters summary as text
     * @public
     */;
    _proto.getActiveFiltersText = function getActiveFiltersText() {
      var _oFilterBar$getAssign;
      const oFilterBar = this.content;
      return (oFilterBar === null || oFilterBar === void 0 ? void 0 : (_oFilterBar$getAssign = oFilterBar.getAssignedFiltersText()) === null || _oFilterBar$getAssign === void 0 ? void 0 : _oFilterBar$getAssign.filtersText) || "";
    }

    /**
     * Provides all the filters that are currently active
     * along with the search expression.
     *
     * @returns {{filters: sap.ui.model.Filter[]|undefined, search: string|undefined}} An array of active filters and the search expression.
     * @public
     */;
    _proto.getFilters = function getFilters() {
      return FilterUtils.getFilters(this.content);
    }

    /**
     * Triggers the API search on the filter bar.
     *
     * @returns Returns a promise which resolves if filter go is triggered successfully; otherwise gets rejected.
     * @public
     */;
    /**
     * Get the selection variant from the filter bar.
     *
     *
     * @returns A promise which resolves with a {@link sap.fe.navigation.SelectionVariant}
     */
    _proto.getSelectionVariant = async function getSelectionVariant() {
      try {
        const filterBar = this.content;
        const filterState = await StateUtil.retrieveExternalState(filterBar);
        const filterObject = filterState.filter;
        const parameters = filterBar.data("parameters");
        return StateFiltersToSelectionVariant.getSelectionVariantFromConditions(filterObject, filterBar.getPropertyHelper(), parameters);
      } catch (error) {
        const id = this.getId();
        const message = error instanceof Error ? error.message : String(error);
        Log.error(`FilterBar Building Block (${id}) - get selection variant failed : ${message}`);
        throw Error(message);
      }
    };
    return FilterBarAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showMessages", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "showClearButton", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "filterFields", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "internalSearch", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "afterClear", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "internalFilterChanged", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleSearch", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "handleSearch"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleFilterChanged", [_dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "handleFilterChanged"), _class2.prototype)), _class2)) || _class);
  return FilterBarAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJCYXJBUEkiLCJkZWZpbmVVSTVDbGFzcyIsInJldHVyblR5cGVzIiwicHJvcGVydHkiLCJ0eXBlIiwiZXhwZWN0ZWRBbm5vdGF0aW9ucyIsImV4cGVjdGVkVHlwZXMiLCJkZWZhdWx0VmFsdWUiLCJhZ2dyZWdhdGlvbiIsIm11bHRpcGxlIiwiZXZlbnQiLCJ4bWxFdmVudEhhbmRsZXIiLCJ0cmlnZ2VyU2VhcmNoIiwiZmlsdGVyQmFyIiwiY29udGVudCIsIndhaXRGb3JJbml0aWFsaXphdGlvbiIsImVyciIsIm1lc3NhZ2UiLCJFcnJvciIsIlN0cmluZyIsIkxvZyIsImVycm9yIiwiaXNTZW1hbnRpY0RhdGVGaWx0ZXJBcHBsaWVkIiwiU2VtYW50aWNEYXRlT3BlcmF0b3JzIiwiaGFzU2VtYW50aWNEYXRlT3BlcmF0aW9ucyIsImdldENvbmRpdGlvbnMiLCJoYW5kbGVTZWFyY2giLCJvRXZlbnQiLCJvRmlsdGVyQmFyIiwiZ2V0U291cmNlIiwib0V2ZW50UGFyYW1ldGVycyIsImdldFBhcmFtZXRlcnMiLCJvQ29uZGl0aW9ucyIsImdldEZpbHRlckNvbmRpdGlvbnMiLCJldmVudFBhcmFtZXRlcnMiLCJfcHJlcGFyZUV2ZW50UGFyYW1ldGVycyIsImZpcmVJbnRlcm5hbFNlYXJjaCIsIm1lcmdlIiwiY29uZGl0aW9ucyIsImZpcmVTZWFyY2giLCJoYW5kbGVGaWx0ZXJDaGFuZ2VkIiwiZmlyZUludGVybmFsRmlsdGVyQ2hhbmdlZCIsImZpcmVGaWx0ZXJDaGFuZ2VkIiwicGFyYW1ldGVycyIsImZpbHRlcnMiLCJzZWFyY2giLCJGaWx0ZXJVdGlscyIsImdldEZpbHRlcnMiLCJzZXRGaWx0ZXJWYWx1ZXMiLCJzQ29uZGl0aW9uUGF0aCIsInNPcGVyYXRvciIsInZWYWx1ZXMiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJnZXRBY3RpdmVGaWx0ZXJzVGV4dCIsImdldEFzc2lnbmVkRmlsdGVyc1RleHQiLCJmaWx0ZXJzVGV4dCIsImdldFNlbGVjdGlvblZhcmlhbnQiLCJmaWx0ZXJTdGF0ZSIsIlN0YXRlVXRpbCIsInJldHJpZXZlRXh0ZXJuYWxTdGF0ZSIsImZpbHRlck9iamVjdCIsImZpbHRlciIsImRhdGEiLCJTdGF0ZUZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQiLCJnZXRTZWxlY3Rpb25WYXJpYW50RnJvbUNvbmRpdGlvbnMiLCJnZXRQcm9wZXJ0eUhlbHBlciIsImlkIiwiZ2V0SWQiLCJNYWNyb0FQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IG1lcmdlIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5cbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIHByb3BlcnR5LCB4bWxFdmVudEhhbmRsZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBTZW1hbnRpY0RhdGVPcGVyYXRvcnMgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2VtYW50aWNEYXRlT3BlcmF0b3JzXCI7XG5pbXBvcnQgU3RhdGVGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvY29yZS9TdGF0ZUZpbHRlclRvU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IFNlbGVjdGlvblZhcmlhbnQgZnJvbSBcInNhcC9mZS9uYXZpZ2F0aW9uL1NlbGVjdGlvblZhcmlhbnRcIjtcbmltcG9ydCB0eXBlIFVJNUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IHR5cGUgeyBDb25kaXRpb25PYmplY3QgfSBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgU3RhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3AxM24vU3RhdGVVdGlsXCI7XG5pbXBvcnQgTWFjcm9BUEkgZnJvbSBcIi4uL01hY3JvQVBJXCI7XG4vKipcbiAqIERlZmluaXRpb24gb2YgYSBjdXN0b20gZmlsdGVyIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSBGaWx0ZXJCYXIuXG4gKlxuICogVGhlIHRlbXBsYXRlIGZvciB0aGUgRmlsdGVyRmllbGQgaGFzIHRvIGJlIHByb3ZpZGVkIGFzIHRoZSBkZWZhdWx0IGFnZ3JlZ2F0aW9uXG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRmlsdGVyRmllbGRcbiAqIEBwdWJsaWNcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IHR5cGUgRmlsdGVyRmllbGQgPSB7XG5cdC8qKlxuXHQgKiBUaGUgcHJvcGVydHkgbmFtZSBvZiB0aGUgRmlsdGVyRmllbGRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0a2V5OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGZvciB0aGlzIEZpbHRlckZpZWxkXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGxhYmVsOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBSZWZlcmVuY2UgdG8gdGhlIGtleSBvZiBhbm90aGVyIGZpbHRlciBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgdGFibGUgdG8gcHJvcGVybHkgcGxhY2UgdGhpcyBvbmVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YW5jaG9yPzogc3RyaW5nO1xuXHQvKipcblx0ICogRGVmaW5lcyB3aGVyZSB0aGlzIGZpbHRlciBzaG91bGQgYmUgcGxhY2VkIHJlbGF0aXZlIHRvIHRoZSBkZWZpbmVkIGFuY2hvclxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYEJlZm9yZWAgYW5kIGBBZnRlcmBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cGxhY2VtZW50PzogXCJCZWZvcmVcIiB8IFwiQWZ0ZXJcIjtcblx0LyoqXG5cdCAqIElmIHNldCwgcG9zc2libGUgZXJyb3JzIHRoYXQgb2NjdXIgZHVyaW5nIHRoZSBzZWFyY2ggd2lsbCBiZSBkaXNwbGF5ZWQgaW4gYSBtZXNzYWdlIGJveC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0c2hvd01lc3NhZ2VzPzogYm9vbGVhbjtcblxuXHRzbG90TmFtZT86IHN0cmluZztcbn07XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmlsdGVyQmFyIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgU2VsZWN0aW9uRmllbGRzIGFubm90YXRpb24gaXMgZXhwZWN0ZWQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZpbHRlckJhciBpZD1cIk15RmlsdGVyQmFyXCIgbWV0YVBhdGg9XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIgLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLkZpbHRlckJhclxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLmZpbHRlckJhci5GaWx0ZXJCYXJBUElcIiwge1xuXHRyZXR1cm5UeXBlczogW1wic2FwLnVpLmNvcmUuQ29udHJvbFwiXVxufSlcbmNsYXNzIEZpbHRlckJhckFQSSBleHRlbmRzIE1hY3JvQVBJIHtcblx0LyoqXG5cdCAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSBGaWx0ZXJCYXIgY29udHJvbC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1ldGFtb2RlbCwgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29udGV4dFBhdGguXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRleHBlY3RlZEFubm90YXRpb25zOiBbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIl0sXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiRW50aXR5VHlwZVwiXVxuXHR9KVxuXHRtZXRhUGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcGF0aCBvZiB0aGUgY29udGV4dCB1c2VkIGluIHRoZSBjdXJyZW50IHBhZ2Ugb3IgYmxvY2suXG5cdCAqIFRoaXMgc2V0dGluZyBpcyBkZWZpbmVkIGJ5IHRoZSBmcmFtZXdvcmsuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBJZiB0cnVlLCB0aGUgc2VhcmNoIGlzIHRyaWdnZXJlZCBhdXRvbWF0aWNhbGx5IHdoZW4gYSBmaWx0ZXIgdmFsdWUgaXMgY2hhbmdlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0bGl2ZU1vZGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgRmlsdGVyQmFyIGJ1aWxkaW5nIGJsb2NrXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0dmlzaWJsZT86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIERpc3BsYXlzIHBvc3NpYmxlIGVycm9ycyBkdXJpbmcgdGhlIHNlYXJjaCBpbiBhIG1lc3NhZ2UgYm94XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0c2hvd01lc3NhZ2VzPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogSGFuZGxlcyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgJ0NsZWFyJyBidXR0b24gb24gdGhlIEZpbHRlckJhci5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0c2hvd0NsZWFyQnV0dG9uPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQWdncmVnYXRlIGZpbHRlciBmaWVsZHMgb2YgdGhlIEZpbHRlckJhciBidWlsZGluZyBibG9ja1xuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5mZS5tYWNyb3MuRmlsdGVyRmllbGRcIiwgbXVsdGlwbGU6IHRydWUgfSlcblx0ZmlsdGVyRmllbGRzPzogRmlsdGVyRmllbGRbXTtcblxuXHQvKipcblx0ICogVGhpcyBldmVudCBpcyBmaXJlZCB3aGVuIHRoZSAnR28nIGJ1dHRvbiBpcyBwcmVzc2VkIG9yIGFmdGVyIGEgY29uZGl0aW9uIGNoYW5nZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0c2VhcmNoITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIFRoaXMgZXZlbnQgaXMgZmlyZWQgd2hlbiB0aGUgJ0dvJyBidXR0b24gaXMgcHJlc3NlZCBvciBhZnRlciBhIGNvbmRpdGlvbiBjaGFuZ2UuIFRoaXMgaXMgb25seSBpbnRlcm5hbGx5IHVzZWQgYnkgc2FwLmZlIChGaW9yaSBlbGVtZW50cykgYW5kXG5cdCAqIGV4cG9zZXMgcGFyYW1ldGVycyBmcm9tIGludGVybmFsIE1EQy1GaWx0ZXJCYXIgc2VhcmNoIGV2ZW50XG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRpbnRlcm5hbFNlYXJjaCE6IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBUaGlzIGV2ZW50IGlzIGZpcmVkIGFmdGVyIGVpdGhlciBhIGZpbHRlciB2YWx1ZSBvciB0aGUgdmlzaWJpbGl0eSBvZiBhIGZpbHRlciBpdGVtIGhhcyBiZWVuIGNoYW5nZWQuIFRoZSBldmVudCBjb250YWlucyBjb25kaXRpb25zIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGZpbHRlcnMuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBldmVudCgpXG5cdGZpbHRlckNoYW5nZWQhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogVGhpcyBldmVudCBpcyBmaXJlZCB3aGVuIHRoZSAnQ2xlYXInIGJ1dHRvbiBpcyBwcmVzc2VkLiBUaGlzIGlzIG9ubHkgcG9zc2libGUgd2hlbiB0aGUgJ0NsZWFyJyBidXR0b24gaXMgZW5hYmxlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0YWZ0ZXJDbGVhciE6IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBUaGlzIGV2ZW50IGlzIGZpcmVkIGFmdGVyIGVpdGhlciBhIGZpbHRlciB2YWx1ZSBvciB0aGUgdmlzaWJpbGl0eSBvZiBhIGZpbHRlciBpdGVtIGhhcyBiZWVuIGNoYW5nZWQuIFRoZSBldmVudCBjb250YWlucyBjb25kaXRpb25zIHRoYXQgd2lsbCBiZSB1c2VkIGFzIGZpbHRlcnMuXG5cdCAqIFRoaXMgaXMgdXNlZCBpbnRlcm5hbGx5IG9ubHkgYnkgc2FwLmZlIChGaW9yaSBFbGVtZW50cykuIFRoaXMgZXhwb3NlcyBwYXJhbWV0ZXJzIGZyb20gdGhlIE1EQy1GaWx0ZXJCYXIgZmlsdGVyQ2hhbmdlZCBldmVudCB0aGF0IGlzIHVzZWQgYnkgc2FwLmZlIGluIHNvbWUgY2FzZXMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRpbnRlcm5hbEZpbHRlckNoYW5nZWQhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgdGhhdCBpcyB0cmlnZ2VyZWQgd2hlbiB0aGUgRmlsdGVyQmFyIFN0YXRlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIFlvdSBjYW4gc2V0IHRoaXMgdG8gc3RvcmUgdGhlIHN0YXRlIG9mIHRoZSBmaWx0ZXIgYmFyIGluIHRoZSBhcHAgc3RhdGUuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRzdGF0ZUNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRoYW5kbGVTZWFyY2gob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgRmlsdGVyQmFyO1xuXHRcdGNvbnN0IG9FdmVudFBhcmFtZXRlcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVycygpO1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRjb25zdCBvQ29uZGl0aW9ucyA9IG9GaWx0ZXJCYXIuZ2V0RmlsdGVyQ29uZGl0aW9ucygpO1xuXHRcdFx0Y29uc3QgZXZlbnRQYXJhbWV0ZXJzOiBvYmplY3QgPSB0aGlzLl9wcmVwYXJlRXZlbnRQYXJhbWV0ZXJzKG9GaWx0ZXJCYXIpO1xuXHRcdFx0KHRoaXMgYXMgYW55KS5maXJlSW50ZXJuYWxTZWFyY2gobWVyZ2UoeyBjb25kaXRpb25zOiBvQ29uZGl0aW9ucyB9LCBvRXZlbnRQYXJhbWV0ZXJzKSk7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVTZWFyY2goZXZlbnRQYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0aGFuZGxlRmlsdGVyQ2hhbmdlZChvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBGaWx0ZXJCYXI7XG5cdFx0Y29uc3Qgb0V2ZW50UGFyYW1ldGVycyA9IG9FdmVudC5nZXRQYXJhbWV0ZXJzKCk7XG5cdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdGNvbnN0IG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRGaWx0ZXJDb25kaXRpb25zKCk7XG5cdFx0XHRjb25zdCBldmVudFBhcmFtZXRlcnM6IG9iamVjdCA9IHRoaXMuX3ByZXBhcmVFdmVudFBhcmFtZXRlcnMob0ZpbHRlckJhcik7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVJbnRlcm5hbEZpbHRlckNoYW5nZWQobWVyZ2UoeyBjb25kaXRpb25zOiBvQ29uZGl0aW9ucyB9LCBvRXZlbnRQYXJhbWV0ZXJzKSk7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVGaWx0ZXJDaGFuZ2VkKGV2ZW50UGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG5cblx0X3ByZXBhcmVFdmVudFBhcmFtZXRlcnMob0ZpbHRlckJhcjogRmlsdGVyQmFyKSB7XG5cdFx0Y29uc3QgeyBwYXJhbWV0ZXJzLCBmaWx0ZXJzLCBzZWFyY2ggfSA9IEZpbHRlclV0aWxzLmdldEZpbHRlcnMob0ZpbHRlckJhcik7XG5cblx0XHRyZXR1cm4geyBwYXJhbWV0ZXJzLCBmaWx0ZXJzLCBzZWFyY2ggfTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGZpbHRlciB2YWx1ZXMgZm9yIHRoZSBnaXZlbiBwcm9wZXJ0eSBpbiB0aGUgZmlsdGVyIGJhci5cblx0ICogVGhlIGZpbHRlciB2YWx1ZXMgY2FuIGJlIGVpdGhlciBhIHNpbmdsZSB2YWx1ZSBvciBhbiBhcnJheSBvZiB2YWx1ZXMuXG5cdCAqIEVhY2ggZmlsdGVyIHZhbHVlIG11c3QgYmUgcmVwcmVzZW50ZWQgYXMgYSBwcmltaXRpdmUgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQ29uZGl0aW9uUGF0aCBUaGUgcGF0aCB0byB0aGUgcHJvcGVydHkgYXMgYSBjb25kaXRpb24gcGF0aFxuXHQgKiBAcGFyYW0gW3NPcGVyYXRvcl0gVGhlIG9wZXJhdG9yIHRvIGJlIHVzZWQgKG9wdGlvbmFsKSAtIGlmIG5vdCBzZXQsIHRoZSBkZWZhdWx0IG9wZXJhdG9yIChFUSkgd2lsbCBiZSB1c2VkXG5cdCAqIEBwYXJhbSB2VmFsdWVzIFRoZSB2YWx1ZXMgdG8gYmUgYXBwbGllZFxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgZm9yIGFzeW5jaHJvbm91cyBoYW5kbGluZ1xuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRzZXRGaWx0ZXJWYWx1ZXMoXG5cdFx0c0NvbmRpdGlvblBhdGg6IHN0cmluZyxcblx0XHRzT3BlcmF0b3I6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHR2VmFsdWVzPzogdW5kZWZpbmVkIHwgc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHN0cmluZ1tdIHwgbnVtYmVyW10gfCBib29sZWFuW11cblx0KSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcblx0XHRcdHZWYWx1ZXMgPSBzT3BlcmF0b3I7XG5cdFx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuc2V0RmlsdGVyVmFsdWVzKHRoaXMuY29udGVudCwgc0NvbmRpdGlvblBhdGgsIHZWYWx1ZXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gRmlsdGVyVXRpbHMuc2V0RmlsdGVyVmFsdWVzKHRoaXMuY29udGVudCwgc0NvbmRpdGlvblBhdGgsIHNPcGVyYXRvciwgdlZhbHVlcyk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBBY3RpdmUgRmlsdGVycyBUZXh0IFN1bW1hcnkgZm9yIHRoZSBmaWx0ZXIgYmFyLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBY3RpdmUgZmlsdGVycyBzdW1tYXJ5IGFzIHRleHRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0QWN0aXZlRmlsdGVyc1RleHQoKSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuY29udGVudCBhcyBGaWx0ZXJCYXI7XG5cdFx0cmV0dXJuIG9GaWx0ZXJCYXI/LmdldEFzc2lnbmVkRmlsdGVyc1RleHQoKT8uZmlsdGVyc1RleHQgfHwgXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyBhbGwgdGhlIGZpbHRlcnMgdGhhdCBhcmUgY3VycmVudGx5IGFjdGl2ZVxuXHQgKiBhbG9uZyB3aXRoIHRoZSBzZWFyY2ggZXhwcmVzc2lvbi5cblx0ICpcblx0ICogQHJldHVybnMge3tmaWx0ZXJzOiBzYXAudWkubW9kZWwuRmlsdGVyW118dW5kZWZpbmVkLCBzZWFyY2g6IHN0cmluZ3x1bmRlZmluZWR9fSBBbiBhcnJheSBvZiBhY3RpdmUgZmlsdGVycyBhbmQgdGhlIHNlYXJjaCBleHByZXNzaW9uLlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRGaWx0ZXJzKCkge1xuXHRcdHJldHVybiBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJzKHRoaXMuY29udGVudCBhcyBGaWx0ZXJCYXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIHRoZSBBUEkgc2VhcmNoIG9uIHRoZSBmaWx0ZXIgYmFyLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIGEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyBpZiBmaWx0ZXIgZ28gaXMgdHJpZ2dlcmVkIHN1Y2Nlc3NmdWxseTsgb3RoZXJ3aXNlIGdldHMgcmVqZWN0ZWQuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHRyaWdnZXJTZWFyY2ggPSBhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgZmlsdGVyQmFyID0gdGhpcy5jb250ZW50IGFzIEZpbHRlckJhcjtcblx0XHR0cnkge1xuXHRcdFx0aWYgKGZpbHRlckJhcikge1xuXHRcdFx0XHRhd2FpdCBmaWx0ZXJCYXIud2FpdEZvckluaXRpYWxpemF0aW9uKCk7XG5cdFx0XHRcdHJldHVybiBhd2FpdCBmaWx0ZXJCYXIudHJpZ2dlclNlYXJjaCgpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuXHRcdFx0Y29uc3QgbWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcblx0XHRcdExvZy5lcnJvcihgRkUgOiBCdWlsZGluZ2Jsb2NrIDogRmlsdGVyQmFyIDogJHttZXNzYWdlfWApO1xuXHRcdFx0dGhyb3cgRXJyb3IobWVzc2FnZSk7XG5cdFx0fVxuXHR9O1xuXG5cdGlzU2VtYW50aWNEYXRlRmlsdGVyQXBwbGllZCA9ICgpOiBib29sZWFuID0+IHtcblx0XHRyZXR1cm4gIVNlbWFudGljRGF0ZU9wZXJhdG9ycy5oYXNTZW1hbnRpY0RhdGVPcGVyYXRpb25zKCh0aGlzLmNvbnRlbnQgYXMgRmlsdGVyQmFyKS5nZXRDb25kaXRpb25zKCkpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHNlbGVjdGlvbiB2YXJpYW50IGZyb20gdGhlIGZpbHRlciBiYXIuXG5cdCAqXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIGEge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnR9XG5cdCAqL1xuXHRhc3luYyBnZXRTZWxlY3Rpb25WYXJpYW50KCk6IFByb21pc2U8U2VsZWN0aW9uVmFyaWFudD4ge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBmaWx0ZXJCYXIgPSB0aGlzLmNvbnRlbnQgYXMgRmlsdGVyQmFyO1xuXHRcdFx0Y29uc3QgZmlsdGVyU3RhdGUgPSBhd2FpdCBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKGZpbHRlckJhcik7XG5cdFx0XHRjb25zdCBmaWx0ZXJPYmplY3QgPSBmaWx0ZXJTdGF0ZS5maWx0ZXIgYXMgUmVjb3JkPHN0cmluZywgQ29uZGl0aW9uT2JqZWN0W10+O1xuXHRcdFx0Y29uc3QgcGFyYW1ldGVycyA9IGZpbHRlckJhci5kYXRhKFwicGFyYW1ldGVyc1wiKSBhcyBzdHJpbmdbXTtcblx0XHRcdHJldHVybiBTdGF0ZUZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0aW9uVmFyaWFudEZyb21Db25kaXRpb25zKFxuXHRcdFx0XHRmaWx0ZXJPYmplY3QsXG5cdFx0XHRcdGZpbHRlckJhci5nZXRQcm9wZXJ0eUhlbHBlcigpLFxuXHRcdFx0XHRwYXJhbWV0ZXJzXG5cdFx0XHQpO1xuXHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHRjb25zdCBpZDogc3RyaW5nID0gdGhpcy5nZXRJZCgpO1xuXHRcdFx0Y29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcblx0XHRcdExvZy5lcnJvcihgRmlsdGVyQmFyIEJ1aWxkaW5nIEJsb2NrICgke2lkfSkgLSBnZXQgc2VsZWN0aW9uIHZhcmlhbnQgZmFpbGVkIDogJHttZXNzYWdlfWApO1xuXHRcdFx0dGhyb3cgRXJyb3IobWVzc2FnZSk7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpbHRlckJhckFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQTJEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkEsSUFpQk1BLFlBQVksV0FIakJDLGNBQWMsQ0FBQyxzQ0FBc0MsRUFBRTtJQUN2REMsV0FBVyxFQUFFLENBQUMscUJBQXFCO0VBQ3BDLENBQUMsQ0FBQyxVQU9BQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBUTVCRCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsbUJBQW1CLEVBQUUsQ0FBQyw0Q0FBNEMsQ0FB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
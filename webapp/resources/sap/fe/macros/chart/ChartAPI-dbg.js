/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/chart/ChartRuntime", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/MacroAPI", "../insights/CommonInsightsHelper", "../insights/InsightsCardHelper"], function (Log, merge, ClassSupport, ChartRuntime, ChartUtils, FilterUtils, MacroAPI, CommonInsightsHelper, InsightsCardHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var showInsightsCardPreview = InsightsCardHelper.showInsightsCardPreview;
  var IntegrationCardType = InsightsCardHelper.IntegrationCardType;
  var genericErrorMessageForInsightsCard = InsightsCardHelper.genericErrorMessageForInsightsCard;
  var createInsightsParams = CommonInsightsHelper.createInsightsParams;
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
   * Building block used to create a chart based on the metadata provided by OData V4.
   * <br>
   * Usually, a contextPath and metaPath is expected.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Chart id="Mychart" contextPath="/RootEntity" metaPath="@com.sap.vocabularies.UI.v1.Chart" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Chart
   * @public
   */
  let ChartAPI = (_dec = defineUI5Class("sap.fe.macros.chart.ChartAPI", {
    returnTypes: ["sap.fe.macros.MacroAPI"]
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string",
    required: true,
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"]
  }), _dec4 = property({
    type: "string",
    required: true,
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: []
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "string",
    defaultValue: "Multiple",
    allowedValues: ["None", "Single", "Multiple"]
  }), _dec8 = property({
    type: "string"
  }), _dec9 = property({
    type: "string",
    allowedValues: ["Control"]
  }), _dec10 = property({
    type: "boolean | string",
    defaultValue: true
  }), _dec11 = property({
    type: "string[]",
    defaultValue: []
  }), _dec12 = aggregation({
    type: "sap.fe.macros.chart.Action",
    multiple: true
  }), _dec13 = event(), _dec14 = event(), _dec15 = event(), _dec16 = xmlEventHandler(), _dec17 = xmlEventHandler(), _dec18 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(ChartAPI, _MacroAPI);
    function ChartAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "prevDrillStack", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalDataRequested", _descriptor14, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = ChartAPI.prototype;
    /**
     * Gets contexts from the chart that have been selected by the user.
     *
     * @returns Contexts of the rows selected by the user
     * @public
     */
    _proto.getSelectedContexts = function getSelectedContexts() {
      var _this$content, _this$content$getBind;
      return ((_this$content = this.content) === null || _this$content === void 0 ? void 0 : (_this$content$getBind = _this$content.getBindingContext("internal")) === null || _this$content$getBind === void 0 ? void 0 : _this$content$getBind.getProperty("selectedContexts")) || [];
    }

    /**
     * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and the Boolean flag that indicates whether data is selected or deselected.
     *
     * @public
     */;
    _proto.onAfterRendering = function onAfterRendering() {
      const view = this.getController().getView();
      const internalModelContext = view.getBindingContext("internal");
      const chart = this.getContent();
      const showMessageStrip = {};
      const sChartEntityPath = chart.data("entitySet"),
        sCacheKey = `${sChartEntityPath}Chart`,
        oBindingContext = view.getBindingContext();
      showMessageStrip[sCacheKey] = chart.data("draftSupported") === "true" && !!oBindingContext && !oBindingContext.getObject("IsActiveEntity");
      internalModelContext.setProperty("controls/showMessageStrip", showMessageStrip);
    };
    _proto.refreshNotApplicableFields = function refreshNotApplicableFields(oFilterControl) {
      const oChart = this.getContent();
      return FilterUtils.getNotApplicableFilters(oFilterControl, oChart);
    };
    _proto.handleSelectionChange = function handleSelectionChange(oEvent) {
      const aData = oEvent.getParameter("data");
      const bSelected = oEvent.getParameter("name") === "selectData";
      ChartRuntime.fnUpdateChart(oEvent);
      this.fireSelectionChange(merge({}, {
        data: aData,
        selected: bSelected
      }));
    };
    _proto.onInternalDataRequested = function onInternalDataRequested() {
      this.fireEvent("internalDataRequested");
    };
    _proto.hasSelections = function hasSelections() {
      // consider chart selections in the current drill stack or on any further drill downs
      const mdcChart = this.content;
      if (mdcChart) {
        try {
          const chart = mdcChart.getControlDelegate().getInnerChart(mdcChart);
          if (chart) {
            const aDimensions = ChartUtils.getDimensionsFromDrillStack(chart);
            const bIsDrillDown = aDimensions.length > this.prevDrillStack.length;
            const bIsDrillUp = aDimensions.length < this.prevDrillStack.length;
            const bNoChange = aDimensions.toString() === this.prevDrillStack.toString();
            let aFilters;
            if (bIsDrillUp && aDimensions.length === 1) {
              // drilling up to level0 would clear all selections
              aFilters = ChartUtils.getChartSelections(mdcChart, true);
            } else {
              // apply filters of selections of previous drillstack when drilling up/down
              // to the chart and table
              aFilters = ChartUtils.getChartSelections(mdcChart);
            }
            if (bIsDrillDown || bIsDrillUp) {
              // update the drillstack on a drill up/ drill down
              this.prevDrillStack = aDimensions;
              return aFilters.length > 0;
            } else if (bNoChange) {
              // bNoChange is true when chart is selected
              return aFilters.length > 0;
            }
          }
        } catch (err) {
          Log.error(`Error while checking for selections in Chart: ${err}`);
        }
      }
      return false;
    }

    /**
     * Event handler to create insightsParams and call the API to show insights card preview for charts.
     *
     * @returns Undefined if card preview is rendered.
     */;
    _proto.onAddCardToInsightsPressed = async function onAddCardToInsightsPressed() {
      try {
        const insightsParams = await createInsightsParams(this, IntegrationCardType.analytical);
        if (insightsParams) {
          showInsightsCardPreview(insightsParams);
          return;
        }
      } catch (e) {
        genericErrorMessageForInsightsCard(this.content);
        Log.error(e);
      }
    };
    return ChartAPI;
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "prevDrillStack", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "internalDataRequested", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleSelectionChange", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "handleSelectionChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataRequested", [_dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataRequested"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAddCardToInsightsPressed", [_dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "onAddCardToInsightsPressed"), _class2.prototype)), _class2)) || _class);
  return ChartAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFydEFQSSIsImRlZmluZVVJNUNsYXNzIiwicmV0dXJuVHlwZXMiLCJwcm9wZXJ0eSIsInR5cGUiLCJyZXF1aXJlZCIsImV4cGVjdGVkVHlwZXMiLCJleHBlY3RlZEFubm90YXRpb25zIiwiZGVmYXVsdFZhbHVlIiwiYWxsb3dlZFZhbHVlcyIsImFnZ3JlZ2F0aW9uIiwibXVsdGlwbGUiLCJldmVudCIsInhtbEV2ZW50SGFuZGxlciIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJjb250ZW50IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJnZXRQcm9wZXJ0eSIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJ2aWV3IiwiZ2V0Q29udHJvbGxlciIsImdldFZpZXciLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsImNoYXJ0IiwiZ2V0Q29udGVudCIsInNob3dNZXNzYWdlU3RyaXAiLCJzQ2hhcnRFbnRpdHlQYXRoIiwiZGF0YSIsInNDYWNoZUtleSIsIm9CaW5kaW5nQ29udGV4dCIsImdldE9iamVjdCIsInNldFByb3BlcnR5IiwicmVmcmVzaE5vdEFwcGxpY2FibGVGaWVsZHMiLCJvRmlsdGVyQ29udHJvbCIsIm9DaGFydCIsIkZpbHRlclV0aWxzIiwiZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMiLCJoYW5kbGVTZWxlY3Rpb25DaGFuZ2UiLCJvRXZlbnQiLCJhRGF0YSIsImdldFBhcmFtZXRlciIsImJTZWxlY3RlZCIsIkNoYXJ0UnVudGltZSIsImZuVXBkYXRlQ2hhcnQiLCJmaXJlU2VsZWN0aW9uQ2hhbmdlIiwibWVyZ2UiLCJzZWxlY3RlZCIsIm9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkIiwiZmlyZUV2ZW50IiwiaGFzU2VsZWN0aW9ucyIsIm1kY0NoYXJ0IiwiZ2V0Q29udHJvbERlbGVnYXRlIiwiZ2V0SW5uZXJDaGFydCIsImFEaW1lbnNpb25zIiwiQ2hhcnRVdGlscyIsImdldERpbWVuc2lvbnNGcm9tRHJpbGxTdGFjayIsImJJc0RyaWxsRG93biIsImxlbmd0aCIsInByZXZEcmlsbFN0YWNrIiwiYklzRHJpbGxVcCIsImJOb0NoYW5nZSIsInRvU3RyaW5nIiwiYUZpbHRlcnMiLCJnZXRDaGFydFNlbGVjdGlvbnMiLCJlcnIiLCJMb2ciLCJlcnJvciIsIm9uQWRkQ2FyZFRvSW5zaWdodHNQcmVzc2VkIiwiaW5zaWdodHNQYXJhbXMiLCJjcmVhdGVJbnNpZ2h0c1BhcmFtcyIsIkludGVncmF0aW9uQ2FyZFR5cGUiLCJhbmFseXRpY2FsIiwic2hvd0luc2lnaHRzQ2FyZFByZXZpZXciLCJlIiwiZ2VuZXJpY0Vycm9yTWVzc2FnZUZvckluc2lnaHRzQ2FyZCIsIk1hY3JvQVBJIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDaGFydEFQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IHR5cGUgeyBkZWZhdWx0IGFzIENoYXJ0IH0gZnJvbSBcInNhcC9jaGFydC9DaGFydFwiO1xuaW1wb3J0IHsgYWdncmVnYXRpb24sIGRlZmluZVVJNUNsYXNzLCBldmVudCwgcHJvcGVydHksIHhtbEV2ZW50SGFuZGxlciB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IENoYXJ0UnVudGltZSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jaGFydC9DaGFydFJ1bnRpbWVcIjtcbmltcG9ydCBDaGFydFV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0VXRpbHNcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCBNYWNyb0FQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9NYWNyb0FQSVwiO1xuaW1wb3J0IFVJNUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIE1EQ0NoYXJ0IGZyb20gXCJzYXAvdWkvbWRjL0NoYXJ0XCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB7IGNyZWF0ZUluc2lnaHRzUGFyYW1zIH0gZnJvbSBcIi4uL2luc2lnaHRzL0NvbW1vbkluc2lnaHRzSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmljRXJyb3JNZXNzYWdlRm9ySW5zaWdodHNDYXJkLCBJbnRlZ3JhdGlvbkNhcmRUeXBlLCBzaG93SW5zaWdodHNDYXJkUHJldmlldyB9IGZyb20gXCIuLi9pbnNpZ2h0cy9JbnNpZ2h0c0NhcmRIZWxwZXJcIjtcbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIGN1c3RvbSBhY3Rpb24gdG8gYmUgdXNlZCBpbnNpZGUgdGhlIGNoYXJ0IHRvb2xiYXJcbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5jaGFydC5BY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IHR5cGUgQWN0aW9uID0ge1xuXHQvKipcblx0ICogVW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGFjdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRrZXk6IHN0cmluZztcblx0LyoqXG5cdCAqIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgZm9yIHRoaXMgYWN0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHRleHQ6IHN0cmluZztcblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byB0aGUga2V5IG9mIGFub3RoZXIgYWN0aW9uIGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSB0b29sYmFyIHRvIHByb3Blcmx5IHBsYWNlIHRoaXMgb25lXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFuY2hvcj86IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgd2hlcmUgdGhpcyBhY3Rpb24gc2hvdWxkIGJlIHBsYWNlZCByZWxhdGl2ZSB0byB0aGUgZGVmaW5lZCBhbmNob3Jcblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIGBCZWZvcmVgIGFuZCBgQWZ0ZXJgXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHBsYWNlbWVudD86IFwiQmVmb3JlXCIgfCBcIkFmdGVyXCI7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGlmIHRoZSBhY3Rpb24gcmVxdWlyZXMgYSBzZWxlY3Rpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlcXVpcmVzU2VsZWN0aW9uPzogYm9vbGVhbjtcblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gYmUgY2FsbGVkIHdoZW4gdGhlIHVzZXIgY2hvb3NlcyB0aGUgYWN0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHByZXNzOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBFbmFibGVzIG9yIGRpc2FibGVzIHRoZSBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0ZW5hYmxlZD86IGJvb2xlYW47XG59O1xuLyoqXG4gKiBEZWZpbml0aW9uIG9mIGEgY3VzdG9tIGFjdGlvbiBncm91cCB0byBiZSB1c2VkIGluc2lkZSB0aGUgY2hhcnQgdG9vbGJhclxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLmNoYXJ0LkFjdGlvbkdyb3VwXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGlvbkdyb3VwID0ge1xuXHQvKipcblx0ICogVW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGFjdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRrZXk6IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgbmVzdGVkIGFjdGlvbnNcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YWN0aW9uczogQWN0aW9uW107XG5cdC8qKlxuXHQgKiBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGZvciB0aGlzIGFjdGlvbiBncm91cFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHR0ZXh0OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXJlIHRoaXMgYWN0aW9uIGdyb3VwIHNob3VsZCBiZSBwbGFjZWQgcmVsYXRpdmUgdG8gdGhlIGRlZmluZWQgYW5jaG9yXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgQmVmb3JlYCBhbmQgYEFmdGVyYFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRwbGFjZW1lbnQ/OiBcIkJlZm9yZVwiIHwgXCJBZnRlclwiO1xuXHQvKipcblx0ICogUmVmZXJlbmNlIHRvIHRoZSBrZXkgb2YgYW5vdGhlciBhY3Rpb24gb3IgYWN0aW9uIGdyb3VwIGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSB0b29sYmFyIHRvIHByb3Blcmx5IHBsYWNlIHRoaXMgb25lXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFuY2hvcj86IHN0cmluZztcbn07XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgYSBjaGFydCBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiA8YnI+XG4gKiBVc3VhbGx5LCBhIGNvbnRleHRQYXRoIGFuZCBtZXRhUGF0aCBpcyBleHBlY3RlZC5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86Q2hhcnQgaWQ9XCJNeWNoYXJ0XCIgY29udGV4dFBhdGg9XCIvUm9vdEVudGl0eVwiIG1ldGFQYXRoPVwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCIgLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLkNoYXJ0XG4gKiBAcHVibGljXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MuY2hhcnQuQ2hhcnRBUElcIiwgeyByZXR1cm5UeXBlczogW1wic2FwLmZlLm1hY3Jvcy5NYWNyb0FQSVwiXSB9KVxuY2xhc3MgQ2hhcnRBUEkgZXh0ZW5kcyBNYWNyb0FQSSB7XG5cdC8qKlxuXHQgKlxuXHQgKiBJRCBvZiB0aGUgY2hhcnRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgcHJlc2VudGF0aW9uIGNvbnRleHQgKFVJLkNoYXJ0IHdpdGggb3Igd2l0aG91dCBhIHF1YWxpZmllcilcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl0sXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uczogW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIl1cblx0fSlcblx0bWV0YVBhdGghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGVudGl0eVNldCBvciBuYXZpZ2F0aW9uUHJvcGVydHlcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl0sXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uczogW11cblx0fSlcblx0Y29udGV4dFBhdGghOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgaGVhZGVyIHRleHQgdGhhdCBpcyBzaG93biBpbiB0aGUgY2hhcnRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRoZWFkZXIhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIGlmIHRoZSBoZWFkZXIgdGV4dCBzaG91bGQgYmUgc2hvd24gb3Igbm90XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0aGVhZGVyVmlzaWJsZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHNlbGVjdGlvbiBtb2RlIHRvIGJlIHVzZWQgYnkgdGhlIGNoYXJ0LlxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYE5vbmVgLCBgU2luZ2xlYCBvciBgTXVsdGlwbGVgXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHRWYWx1ZTogXCJNdWx0aXBsZVwiLCBhbGxvd2VkVmFsdWVzOiBbXCJOb25lXCIsIFwiU2luZ2xlXCIsIFwiTXVsdGlwbGVcIl0gfSlcblx0c2VsZWN0aW9uTW9kZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogSWQgb2YgdGhlIEZpbHRlckJhciBidWlsZGluZyBibG9jayBhc3NvY2lhdGVkIHdpdGggdGhlIGNoYXJ0LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlckJhciE6IHN0cmluZztcblxuXHQvKipcblx0ICogQ29udHJvbHMgdGhlIGtpbmQgb2YgdmFyaWFudCBtYW5hZ2VtZW50IHRoYXQgc2hvdWxkIGJlIGVuYWJsZWQgZm9yIHRoZSBjaGFydC5cblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZSBpcyBgQ29udHJvbGAuPGJyLz5cblx0ICogSWYgc2V0IHdpdGggdmFsdWUgYENvbnRyb2xgLCBhIHZhcmlhbnQgbWFuYWdlbWVudCBjb250cm9sIGlzIHNlZW4gd2l0aGluIHRoZSBjaGFydCBhbmQgdGhlIGNoYXJ0IGlzIGxpbmtlZCB0byB0aGlzLjxici8+XG5cdCAqIElmIG5vdCBzZXQgd2l0aCBhbnkgdmFsdWUsIHZhcmlhbnQgbWFuYWdlbWVudCBjb250cm9sIGlzIG5vdCBhdmFpbGFibGUgZm9yIHRoaXMgY2hhcnQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIsIGFsbG93ZWRWYWx1ZXM6IFtcIkNvbnRyb2xcIl0gfSlcblx0dmFyaWFudE1hbmFnZW1lbnQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIHdoaWNoIG9wdGlvbnMgc2hvdWxkIGJlIGVuYWJsZWQgZm9yIHRoZSBjaGFydCBwZXJzb25hbGl6YXRpb24gZGlhbG9nLlxuXHQgKlxuXHQgKiBJZiBpdCBpcyBzZXQgdG8gYHRydWVgLCBhbGwgcG9zc2libGUgb3B0aW9ucyBmb3IgdGhpcyBraW5kIG9mIGNoYXJ0IGFyZSBlbmFibGVkLjxici8+XG5cdCAqIElmIGl0IGlzIHNldCB0byBgZmFsc2VgLCBwZXJzb25hbGl6YXRpb24gaXMgZGlzYWJsZWQuPGJyLz5cblx0ICo8YnIvPlxuXHQgKiBZb3UgY2FuIGFsc28gcHJvdmlkZSBhIG1vcmUgZ3JhbnVsYXIgY29udHJvbCBmb3IgdGhlIHBlcnNvbmFsaXphdGlvbiBieSBwcm92aWRpbmcgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCB3aXRoIHRoZSBvcHRpb25zIHlvdSB3YW50IHRvIGJlIGF2YWlsYWJsZS48YnIvPlxuXHQgKiBBdmFpbGFibGUgb3B0aW9ucyBhcmU6PGJyLz5cblx0ICogIC0gU29ydDxici8+XG5cdCAqICAtIFR5cGU8YnIvPlxuXHQgKiAgLSBJdGVtPGJyLz5cblx0ICogIC0gRmlsdGVyPGJyLz5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuIHwgc3RyaW5nXCIsIGRlZmF1bHRWYWx1ZTogdHJ1ZSB9KVxuXHRwZXJzb25hbGl6YXRpb24hOiBib29sZWFuIHwgc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBQYXJhbWV0ZXIgd2l0aCBkcmlsbHN0YWNrIG9uIGEgZHJpbGwgdXAvIGRyaWxsIGRvd24gb2YgdGhlIE1EQ19DaGFydFxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdbXVwiLCBkZWZhdWx0VmFsdWU6IFtdIH0pXG5cdHByZXZEcmlsbFN0YWNrITogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIEFnZ3JlZ2F0ZSBhY3Rpb25zIG9mIHRoZSBjaGFydC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLmNoYXJ0LkFjdGlvblwiLCBtdWx0aXBsZTogdHJ1ZSB9KVxuXHRhY3Rpb25zITogQWN0aW9uW107XG5cblx0LyoqXG5cdCAqIEdldHMgY29udGV4dHMgZnJvbSB0aGUgY2hhcnQgdGhhdCBoYXZlIGJlZW4gc2VsZWN0ZWQgYnkgdGhlIHVzZXIuXG5cdCAqXG5cdCAqIEByZXR1cm5zIENvbnRleHRzIG9mIHRoZSByb3dzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldFNlbGVjdGVkQ29udGV4dHMoKTogQ29udGV4dFtdIHtcblx0XHRyZXR1cm4gdGhpcy5jb250ZW50Py5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpPy5nZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIikgfHwgW107XG5cdH1cblxuXHQvKipcblx0ICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gY2hhcnQgc2VsZWN0aW9ucyBhcmUgY2hhbmdlZC4gVGhlIGV2ZW50IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBkYXRhIHNlbGVjdGVkL2Rlc2VsZWN0ZWQgYW5kIHRoZSBCb29sZWFuIGZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBkYXRhIGlzIHNlbGVjdGVkIG9yIGRlc2VsZWN0ZWQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBldmVudCgpXG5cdHNlbGVjdGlvbkNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdC8qKlxuXHQgKiBBbiBldmVudCB0cmlnZ2VyZWQgd2hlbiB0aGUgY2hhcnQgc3RhdGUgY2hhbmdlcy5cblx0ICpcblx0ICogWW91IGNhbiBzZXQgdGhpcyBpbiBvcmRlciB0byBzdG9yZSB0aGUgY2hhcnQgc3RhdGUgaW4gdGhlIGlBcHBzdGF0ZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBldmVudCgpXG5cdHN0YXRlQ2hhbmdlITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIHRoZSBjaGFydCByZXF1ZXN0cyBkYXRhLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QGV2ZW50KClcblx0aW50ZXJuYWxEYXRhUmVxdWVzdGVkITogRnVuY3Rpb247XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5nZXRDb250cm9sbGVyKCkuZ2V0VmlldygpO1xuXHRcdGNvbnN0IGludGVybmFsTW9kZWxDb250ZXh0OiBhbnkgPSB2aWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0Y29uc3QgY2hhcnQgPSAodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKTtcblx0XHRjb25zdCBzaG93TWVzc2FnZVN0cmlwOiBhbnkgPSB7fTtcblx0XHRjb25zdCBzQ2hhcnRFbnRpdHlQYXRoID0gY2hhcnQuZGF0YShcImVudGl0eVNldFwiKSxcblx0XHRcdHNDYWNoZUtleSA9IGAke3NDaGFydEVudGl0eVBhdGh9Q2hhcnRgLFxuXHRcdFx0b0JpbmRpbmdDb250ZXh0ID0gdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdHNob3dNZXNzYWdlU3RyaXBbc0NhY2hlS2V5XSA9XG5cdFx0XHRjaGFydC5kYXRhKFwiZHJhZnRTdXBwb3J0ZWRcIikgPT09IFwidHJ1ZVwiICYmICEhb0JpbmRpbmdDb250ZXh0ICYmICFvQmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KFwiSXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0aW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJjb250cm9scy9zaG93TWVzc2FnZVN0cmlwXCIsIHNob3dNZXNzYWdlU3RyaXApO1xuXHR9XG5cblx0cmVmcmVzaE5vdEFwcGxpY2FibGVGaWVsZHMob0ZpbHRlckNvbnRyb2w6IENvbnRyb2wpOiBhbnlbXSB7XG5cdFx0Y29uc3Qgb0NoYXJ0ID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cdFx0cmV0dXJuIEZpbHRlclV0aWxzLmdldE5vdEFwcGxpY2FibGVGaWx0ZXJzKG9GaWx0ZXJDb250cm9sLCBvQ2hhcnQpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdGhhbmRsZVNlbGVjdGlvbkNoYW5nZShvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0Y29uc3QgYURhdGEgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiZGF0YVwiKTtcblx0XHRjb25zdCBiU2VsZWN0ZWQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwibmFtZVwiKSA9PT0gXCJzZWxlY3REYXRhXCI7XG5cdFx0Q2hhcnRSdW50aW1lLmZuVXBkYXRlQ2hhcnQob0V2ZW50KTtcblx0XHQodGhpcyBhcyBhbnkpLmZpcmVTZWxlY3Rpb25DaGFuZ2UobWVyZ2Uoe30sIHsgZGF0YTogYURhdGEsIHNlbGVjdGVkOiBiU2VsZWN0ZWQgfSkpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkKCkge1xuXHRcdCh0aGlzIGFzIGFueSkuZmlyZUV2ZW50KFwiaW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIpO1xuXHR9XG5cblx0aGFzU2VsZWN0aW9ucygpIHtcblx0XHQvLyBjb25zaWRlciBjaGFydCBzZWxlY3Rpb25zIGluIHRoZSBjdXJyZW50IGRyaWxsIHN0YWNrIG9yIG9uIGFueSBmdXJ0aGVyIGRyaWxsIGRvd25zXG5cdFx0Y29uc3QgbWRjQ2hhcnQgPSB0aGlzLmNvbnRlbnQgYXMgdW5rbm93biBhcyBNRENDaGFydDtcblx0XHRpZiAobWRjQ2hhcnQpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IGNoYXJ0ID0gbWRjQ2hhcnQuZ2V0Q29udHJvbERlbGVnYXRlKCkuZ2V0SW5uZXJDaGFydChtZGNDaGFydCkgYXMgQ2hhcnQ7XG5cdFx0XHRcdGlmIChjaGFydCkge1xuXHRcdFx0XHRcdGNvbnN0IGFEaW1lbnNpb25zID0gQ2hhcnRVdGlscy5nZXREaW1lbnNpb25zRnJvbURyaWxsU3RhY2soY2hhcnQpO1xuXHRcdFx0XHRcdGNvbnN0IGJJc0RyaWxsRG93biA9IGFEaW1lbnNpb25zLmxlbmd0aCA+IHRoaXMucHJldkRyaWxsU3RhY2subGVuZ3RoO1xuXHRcdFx0XHRcdGNvbnN0IGJJc0RyaWxsVXAgPSBhRGltZW5zaW9ucy5sZW5ndGggPCB0aGlzLnByZXZEcmlsbFN0YWNrLmxlbmd0aDtcblx0XHRcdFx0XHRjb25zdCBiTm9DaGFuZ2UgPSBhRGltZW5zaW9ucy50b1N0cmluZygpID09PSB0aGlzLnByZXZEcmlsbFN0YWNrLnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0bGV0IGFGaWx0ZXJzOiBGaWx0ZXJbXTtcblx0XHRcdFx0XHRpZiAoYklzRHJpbGxVcCAmJiBhRGltZW5zaW9ucy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRcdC8vIGRyaWxsaW5nIHVwIHRvIGxldmVsMCB3b3VsZCBjbGVhciBhbGwgc2VsZWN0aW9uc1xuXHRcdFx0XHRcdFx0YUZpbHRlcnMgPSBDaGFydFV0aWxzLmdldENoYXJ0U2VsZWN0aW9ucyhtZGNDaGFydCwgdHJ1ZSkgYXMgRmlsdGVyW107XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIGFwcGx5IGZpbHRlcnMgb2Ygc2VsZWN0aW9ucyBvZiBwcmV2aW91cyBkcmlsbHN0YWNrIHdoZW4gZHJpbGxpbmcgdXAvZG93blxuXHRcdFx0XHRcdFx0Ly8gdG8gdGhlIGNoYXJ0IGFuZCB0YWJsZVxuXHRcdFx0XHRcdFx0YUZpbHRlcnMgPSBDaGFydFV0aWxzLmdldENoYXJ0U2VsZWN0aW9ucyhtZGNDaGFydCkgYXMgRmlsdGVyW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChiSXNEcmlsbERvd24gfHwgYklzRHJpbGxVcCkge1xuXHRcdFx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBkcmlsbHN0YWNrIG9uIGEgZHJpbGwgdXAvIGRyaWxsIGRvd25cblx0XHRcdFx0XHRcdHRoaXMucHJldkRyaWxsU3RhY2sgPSBhRGltZW5zaW9ucztcblx0XHRcdFx0XHRcdHJldHVybiBhRmlsdGVycy5sZW5ndGggPiAwO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoYk5vQ2hhbmdlKSB7XG5cdFx0XHRcdFx0XHQvLyBiTm9DaGFuZ2UgaXMgdHJ1ZSB3aGVuIGNoYXJ0IGlzIHNlbGVjdGVkXG5cdFx0XHRcdFx0XHRyZXR1cm4gYUZpbHRlcnMubGVuZ3RoID4gMDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGVycjogdW5rbm93bikge1xuXHRcdFx0XHRMb2cuZXJyb3IoYEVycm9yIHdoaWxlIGNoZWNraW5nIGZvciBzZWxlY3Rpb25zIGluIENoYXJ0OiAke2Vycn1gKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gY3JlYXRlIGluc2lnaHRzUGFyYW1zIGFuZCBjYWxsIHRoZSBBUEkgdG8gc2hvdyBpbnNpZ2h0cyBjYXJkIHByZXZpZXcgZm9yIGNoYXJ0cy5cblx0ICpcblx0ICogQHJldHVybnMgVW5kZWZpbmVkIGlmIGNhcmQgcHJldmlldyBpcyByZW5kZXJlZC5cblx0ICovXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRhc3luYyBvbkFkZENhcmRUb0luc2lnaHRzUHJlc3NlZCgpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgaW5zaWdodHNQYXJhbXMgPSBhd2FpdCBjcmVhdGVJbnNpZ2h0c1BhcmFtcyh0aGlzLCBJbnRlZ3JhdGlvbkNhcmRUeXBlLmFuYWx5dGljYWwpO1xuXHRcdFx0aWYgKGluc2lnaHRzUGFyYW1zKSB7XG5cdFx0XHRcdHNob3dJbnNpZ2h0c0NhcmRQcmV2aWV3KGluc2lnaHRzUGFyYW1zKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGdlbmVyaWNFcnJvck1lc3NhZ2VGb3JJbnNpZ2h0c0NhcmQodGhpcy5jb250ZW50KTtcblx0XHRcdExvZy5lcnJvcihlIGFzIHN0cmluZyk7XG5cdFx0fVxuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBDaGFydEFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUE0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWJBLElBZU1BLFFBQVEsV0FEYkMsY0FBYyxDQUFDLDhCQUE4QixFQUFFO0lBQUVDLFdBQVcsRUFBRSxDQUFDLHdCQUF3QjtFQUFFLENBQUMsQ0FBQyxVQVExRkMsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQVE1QkQsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxRQUFRO0lBQ2RDLFFBQVEsRUFBRSxJQUFJO0lBQ2RDLGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixDQUFDO0lBQzdFQyxtQkFBbUIsRUFBRSxDQUFDLGtDQUFrQztFQUN6RCxDQUFDLENBQUMsVUFRREosUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxRQUFRO0lBQ2RDLFFBQVEs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LElBQUksQ0FBQ0gsY0FBYyxDQUFDRyxRQUFRLEVBQUU7WUFDM0UsSUFBSUMsUUFBa0I7WUFDdEIsSUFBSUgsVUFBVSxJQUFJTixXQUFXLENBQUNJLE1BQU0sS0FBSyxDQUFDLEVBQUU7Y0FDM0M7Y0FDQUssUUFBUSxHQUFHUixVQUFVLENBQUNTLGtCQUFrQixDQUFDYixRQUFRLEVBQUUsSUFBSSxDQUFhO1lBQ3JFLENBQUMsTUFBTTtjQUNOO2NBQ0E7Y0FDQVksUUFBUSxHQUFHUixVQUFVLENBQUNTLGtCQUFrQixDQUFDYixRQUFRLENBQWE7WUFDL0Q7WUFDQSxJQUFJTSxZQUFZLElBQUlHLFVBQVUsRUFBRTtjQUMvQjtjQUNBLElBQUksQ0FBQ0QsY0FBYyxHQUFHTCxXQUFXO2NBQ2pDLE9BQU9TLFFBQVEsQ0FBQ0wsTUFBTSxHQUFHLENBQUM7WUFDM0IsQ0FBQyxNQUFNLElBQUlHLFNBQVMsRUFBRTtjQUNyQjtjQUNBLE9BQU9FLFFBQVEsQ0FBQ0wsTUFBTSxHQUFHLENBQUM7WUFDM0I7VUFDRDtRQUNELENBQUMsQ0FBQyxPQUFPTyxHQUFZLEVBQUU7VUFDdEJDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFFLGlEQUFnREYsR0FBSSxFQUFDLENBQUM7UUFDbEU7TUFDRDtNQUNBLE9BQU8sS0FBSztJQUNiOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BTU1HLDBCQUEwQixHQURoQyw0Q0FDbUM7TUFDbEMsSUFBSTtRQUNILE1BQU1DLGNBQWMsR0FBRyxNQUFNQyxvQkFBb0IsQ0FBQyxJQUFJLEVBQUVDLG1CQUFtQixDQUFDQyxVQUFVLENBQUM7UUFDdkYsSUFBSUgsY0FBYyxFQUFFO1VBQ25CSSx1QkFBdUIsQ0FBQ0osY0FBYyxDQUFDO1VBQ3ZDO1FBQ0Q7TUFDRCxDQUFDLENBQUMsT0FBT0ssQ0FBQyxFQUFFO1FBQ1hDLGtDQUFrQyxDQUFDLElBQUksQ0FBQzNELE9BQU8sQ0FBQztRQUNoRGtELEdBQUcsQ0FBQ0MsS0FBSyxDQUFDTyxDQUFDLENBQVc7TUFDdkI7SUFDRCxDQUFDO0lBQUE7RUFBQSxFQTVPcUJFLFFBQVE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9BOE9oQjNFLFFBQVE7QUFBQSJ9
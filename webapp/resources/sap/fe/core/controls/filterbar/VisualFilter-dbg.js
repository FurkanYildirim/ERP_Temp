/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controls/filterbar/utils/VisualFilterUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/CommonHelper", "sap/fe/macros/filter/FilterUtils", "sap/m/VBox", "sap/ui/core/Core", "../../templating/FilterHelper"], function (CommonUtils, VisualFilterUtils, ClassSupport, CommonHelper, FilterUtils, VBox, Core, FilterHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var getFiltersConditionsFromSelectionVariant = FilterHelper.getFiltersConditionsFromSelectionVariant;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Constructor for a new filterBar/aligned/FilterItemLayout.
   *
   * @param {string} [sId] ID for the new control, generated automatically if no ID is given
   * @param {object} [mSettings] Initial settings for the new control
   * @class Represents a filter item on the UI.
   * @extends sap.m.VBox
   * @implements {sap.ui.core.IFormContent}
   * @class
   * @private
   * @since 1.61.0
   * @alias control sap.fe.core.controls.filterbar.VisualFilter
   */
  let VisualFilter = (_dec = defineUI5Class("sap.fe.core.controls.filterbar.VisualFilter"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "boolean"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_VBox) {
    _inheritsLoose(VisualFilter, _VBox);
    function VisualFilter() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _VBox.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showValueHelp", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueHelpIconSrc", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueHelpRequest", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = VisualFilter.prototype;
    _proto.onAfterRendering = function onAfterRendering() {
      var _this$getParent;
      let sLabel;
      const oInteractiveChart = this.getItems()[1].getItems()[0];
      const sInternalContextPath = this.data("infoPath");
      const oInteractiveChartListBinding = oInteractiveChart.getBinding("segments") || oInteractiveChart.getBinding("bars") || oInteractiveChart.getBinding("points");
      const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      const bShowOverLayInitially = oInteractiveChart.data("showOverlayInitially");
      const oSelectionVariantAnnotation = oInteractiveChart.data("selectionVariantAnnotation") ? CommonHelper.parseCustomData(oInteractiveChart.data("selectionVariantAnnotation")) : {
        SelectOptions: []
      };
      const aRequiredProperties = oInteractiveChart.data("requiredProperties") ? CommonHelper.parseCustomData(oInteractiveChart.data("requiredProperties")) : [];
      const oMetaModel = oInteractiveChart.getModel().getMetaModel();
      const sEntitySetPath = oInteractiveChartListBinding ? oInteractiveChartListBinding.getPath() : "";
      let oFilterBar = (_this$getParent = this.getParent()) === null || _this$getParent === void 0 ? void 0 : _this$getParent.getParent();
      // TODO: Remove this part once 2170204347 is fixed
      if (oFilterBar.getMetadata().getElementName() === "sap.ui.mdc.filterbar.p13n.AdaptationFilterBar") {
        var _oFilterBar$getParent;
        oFilterBar = (_oFilterBar$getParent = oFilterBar.getParent()) === null || _oFilterBar$getParent === void 0 ? void 0 : _oFilterBar$getParent.getParent();
      }
      let oFilterBarConditions = {};
      let aPropertyInfoSet = [];
      let sFilterEntityName;
      if (oFilterBar.getMetadata().getElementName() === "sap.fe.core.controls.FilterBar") {
        oFilterBarConditions = oFilterBar.getConditions();
        aPropertyInfoSet = oFilterBar.getPropertyInfoSet();
        sFilterEntityName = oFilterBar.data("entityType").split("/")[1];
      }
      const aParameters = oInteractiveChart.data("parameters") ? oInteractiveChart.data("parameters").customData : [];
      const filterConditions = getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, oSelectionVariantAnnotation, VisualFilterUtils.getCustomConditions.bind(VisualFilterUtils));
      const oSelectionVariantConditions = VisualFilterUtils.convertFilterCondions(filterConditions);
      const mConditions = {};
      Object.keys(oFilterBarConditions).forEach(function (sKey) {
        if (oFilterBarConditions[sKey].length) {
          mConditions[sKey] = oFilterBarConditions[sKey];
        }
      });
      Object.keys(oSelectionVariantConditions).forEach(function (sKey) {
        if (!mConditions[sKey]) {
          mConditions[sKey] = oSelectionVariantConditions[sKey];
        }
      });
      if (bShowOverLayInitially === "true") {
        if (!Object.keys(oSelectionVariantAnnotation).length) {
          if (aRequiredProperties.length > 1) {
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
            });
          } else {
            sLabel = oMetaModel.getObject(`${sEntitySetPath}/${aRequiredProperties[0]}@com.sap.vocabularies.Common.v1.Label`) || aRequiredProperties[0];
            oInternalModelContext.setProperty(sInternalContextPath, {
              showError: true,
              errorMessageTitle: oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
              errorMessage: oResourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", sLabel)
            });
          }
        } else {
          const aSelectOptions = [];
          const aNotMatchedConditions = [];
          if (oSelectionVariantAnnotation.SelectOptions) {
            oSelectionVariantAnnotation.SelectOptions.forEach(function (oSelectOption) {
              aSelectOptions.push(oSelectOption.PropertyName.$PropertyPath);
            });
          }
          if (oSelectionVariantAnnotation.Parameters) {
            oSelectionVariantAnnotation.Parameters.forEach(function (oParameter) {
              aSelectOptions.push(oParameter.PropertyName.$PropertyPath);
            });
          }
          aRequiredProperties.forEach(function (sPath) {
            if (aSelectOptions.indexOf(sPath) === -1) {
              aNotMatchedConditions.push(sPath);
            }
          });
          const errorInfo = VisualFilterUtils.getErrorInfoForNoInitialOverlay(aNotMatchedConditions, oResourceBundle, sEntitySetPath, oMetaModel);
          oInternalModelContext.setProperty(sInternalContextPath, errorInfo);
        }
      }
      if (!this._oChartBinding || this._oChartBinding !== oInteractiveChartListBinding) {
        if (this._oChartBinding) {
          this.detachDataReceivedHandler(this._oChartBinding);
        }
        this.attachDataRecivedHandler(oInteractiveChartListBinding);
        this._oChartBinding = oInteractiveChartListBinding;
      }
      const bShowOverlay = oInternalModelContext.getProperty(sInternalContextPath) && oInternalModelContext.getProperty(sInternalContextPath).showError;
      const sChartEntityName = sEntitySetPath !== "" ? sEntitySetPath.split("/")[1].split("(")[0] : "";
      if (aParameters && aParameters.length && sFilterEntityName === sChartEntityName) {
        const sBindingPath = FilterUtils.getBindingPathForParameters(oFilterBar, mConditions, aPropertyInfoSet, aParameters);
        if (sBindingPath) {
          oInteractiveChartListBinding.sPath = sBindingPath;
        }
      }
      // resume binding for only those visual filters that do not have a in parameter attached.
      // Bindings of visual filters with inParameters will be resumed later after considering in parameters.
      if (oInteractiveChartListBinding && oInteractiveChartListBinding.isSuspended() && !bShowOverlay) {
        oInteractiveChartListBinding.resume();
      }
    };
    _proto.attachDataRecivedHandler = function attachDataRecivedHandler(oInteractiveChartListBinding) {
      if (oInteractiveChartListBinding) {
        oInteractiveChartListBinding.attachEvent("dataReceived", this.onInternalDataReceived, this);
        this._oChartBinding = oInteractiveChartListBinding;
      }
    };
    _proto.detachDataReceivedHandler = function detachDataReceivedHandler(oInteractiveChartListBinding) {
      if (oInteractiveChartListBinding) {
        oInteractiveChartListBinding.detachEvent("dataReceived", this.onInternalDataReceived, this);
        this._oChartBinding = undefined;
      }
    };
    _proto.setShowValueHelp = function setShowValueHelp(bShowValueHelp) {
      if (this.getItems().length > 0) {
        const oVisualFilterControl = this.getItems()[0].getItems()[0];
        oVisualFilterControl.getContent().some(function (oInnerControl) {
          if (oInnerControl.isA("sap.m.Button")) {
            oInnerControl.setVisible(bShowValueHelp);
          }
        });
        this.setProperty("showValueHelp", bShowValueHelp);
      }
    };
    _proto.setValueHelpIconSrc = function setValueHelpIconSrc(sIconSrc) {
      if (this.getItems().length > 0) {
        const oVisualFilterControl = this.getItems()[0].getItems()[0];
        oVisualFilterControl.getContent().some(function (oInnerControl) {
          if (oInnerControl.isA("sap.m.Button")) {
            oInnerControl.setIcon(sIconSrc);
          }
        });
        this.setProperty("valueHelpIconSrc", sIconSrc);
      }
    };
    _proto.onInternalDataReceived = function onInternalDataReceived(oEvent) {
      const sId = this.getId();
      const oView = CommonUtils.getTargetView(this);
      const oInteractiveChart = this.getItems()[1].getItems()[0];
      const sInternalContextPath = this.data("infoPath");
      const oInternalModelContext = oInteractiveChart.getBindingContext("internal");
      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      const vUOM = oInteractiveChart.data("uom");
      VisualFilterUtils.updateChartScaleFactorTitle(oInteractiveChart, oView, sId, sInternalContextPath);
      if (oEvent.getParameter("error")) {
        const s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
        const s18nMessage = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_DATA_TEXT");
        VisualFilterUtils.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInternalContextPath, oView);
      } else if (oEvent.getParameter("data")) {
        const oData = oEvent.getSource().getCurrentContexts();
        if (oData && oData.length === 0) {
          VisualFilterUtils.setNoDataMessage(sInternalContextPath, oResourceBundle, oView);
        } else {
          oInternalModelContext.setProperty(sInternalContextPath, {});
        }
        VisualFilterUtils.setMultiUOMMessage(oData, oInteractiveChart, sInternalContextPath, oResourceBundle, oView);
      }
      if (vUOM && (vUOM["ISOCurrency"] && vUOM["ISOCurrency"].$Path || vUOM["Unit"] && vUOM["Unit"].$Path)) {
        const oContexts = oEvent.getSource().getContexts();
        const oContextData = oContexts && oContexts[0].getObject();
        VisualFilterUtils.applyUOMToTitle(oInteractiveChart, oContextData, oView, sInternalContextPath);
      }
    };
    return VisualFilter;
  }(VBox), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "showValueHelp", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "valueHelpIconSrc", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "valueHelpRequest", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return VisualFilter;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImV2ZW50Iiwib25BZnRlclJlbmRlcmluZyIsInNMYWJlbCIsIm9JbnRlcmFjdGl2ZUNoYXJ0IiwiZ2V0SXRlbXMiLCJzSW50ZXJuYWxDb250ZXh0UGF0aCIsImRhdGEiLCJvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nIiwiZ2V0QmluZGluZyIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImJTaG93T3ZlckxheUluaXRpYWxseSIsIm9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbiIsIkNvbW1vbkhlbHBlciIsInBhcnNlQ3VzdG9tRGF0YSIsIlNlbGVjdE9wdGlvbnMiLCJhUmVxdWlyZWRQcm9wZXJ0aWVzIiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0VudGl0eVNldFBhdGgiLCJnZXRQYXRoIiwib0ZpbHRlckJhciIsImdldFBhcmVudCIsImdldE1ldGFkYXRhIiwiZ2V0RWxlbWVudE5hbWUiLCJvRmlsdGVyQmFyQ29uZGl0aW9ucyIsImFQcm9wZXJ0eUluZm9TZXQiLCJzRmlsdGVyRW50aXR5TmFtZSIsImdldENvbmRpdGlvbnMiLCJnZXRQcm9wZXJ0eUluZm9TZXQiLCJzcGxpdCIsImFQYXJhbWV0ZXJzIiwiY3VzdG9tRGF0YSIsImZpbHRlckNvbmRpdGlvbnMiLCJnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50IiwiVmlzdWFsRmlsdGVyVXRpbHMiLCJnZXRDdXN0b21Db25kaXRpb25zIiwiYmluZCIsIm9TZWxlY3Rpb25WYXJpYW50Q29uZGl0aW9ucyIsImNvbnZlcnRGaWx0ZXJDb25kaW9ucyIsIm1Db25kaXRpb25zIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzS2V5IiwibGVuZ3RoIiwic2V0UHJvcGVydHkiLCJzaG93RXJyb3IiLCJlcnJvck1lc3NhZ2VUaXRsZSIsImdldFRleHQiLCJlcnJvck1lc3NhZ2UiLCJnZXRPYmplY3QiLCJhU2VsZWN0T3B0aW9ucyIsImFOb3RNYXRjaGVkQ29uZGl0aW9ucyIsIm9TZWxlY3RPcHRpb24iLCJwdXNoIiwiUHJvcGVydHlOYW1lIiwiJFByb3BlcnR5UGF0aCIsIlBhcmFtZXRlcnMiLCJvUGFyYW1ldGVyIiwic1BhdGgiLCJpbmRleE9mIiwiZXJyb3JJbmZvIiwiZ2V0RXJyb3JJbmZvRm9yTm9Jbml0aWFsT3ZlcmxheSIsIl9vQ2hhcnRCaW5kaW5nIiwiZGV0YWNoRGF0YVJlY2VpdmVkSGFuZGxlciIsImF0dGFjaERhdGFSZWNpdmVkSGFuZGxlciIsImJTaG93T3ZlcmxheSIsImdldFByb3BlcnR5Iiwic0NoYXJ0RW50aXR5TmFtZSIsInNCaW5kaW5nUGF0aCIsIkZpbHRlclV0aWxzIiwiZ2V0QmluZGluZ1BhdGhGb3JQYXJhbWV0ZXJzIiwiaXNTdXNwZW5kZWQiLCJyZXN1bWUiLCJhdHRhY2hFdmVudCIsIm9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQiLCJkZXRhY2hFdmVudCIsInVuZGVmaW5lZCIsInNldFNob3dWYWx1ZUhlbHAiLCJiU2hvd1ZhbHVlSGVscCIsIm9WaXN1YWxGaWx0ZXJDb250cm9sIiwiZ2V0Q29udGVudCIsInNvbWUiLCJvSW5uZXJDb250cm9sIiwiaXNBIiwic2V0VmlzaWJsZSIsInNldFZhbHVlSGVscEljb25TcmMiLCJzSWNvblNyYyIsInNldEljb24iLCJvRXZlbnQiLCJzSWQiLCJnZXRJZCIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwidlVPTSIsInVwZGF0ZUNoYXJ0U2NhbGVGYWN0b3JUaXRsZSIsImdldFBhcmFtZXRlciIsInMxOG5NZXNzYWdlVGl0bGUiLCJzMThuTWVzc2FnZSIsImFwcGx5RXJyb3JNZXNzYWdlQW5kVGl0bGUiLCJvRGF0YSIsImdldFNvdXJjZSIsImdldEN1cnJlbnRDb250ZXh0cyIsInNldE5vRGF0YU1lc3NhZ2UiLCJzZXRNdWx0aVVPTU1lc3NhZ2UiLCIkUGF0aCIsIm9Db250ZXh0cyIsImdldENvbnRleHRzIiwib0NvbnRleHREYXRhIiwiYXBwbHlVT01Ub1RpdGxlIiwiVkJveCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlzdWFsRmlsdGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBWaXN1YWxGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbHMvZmlsdGVyYmFyL3V0aWxzL1Zpc3VhbEZpbHRlclV0aWxzXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIGltcGxlbWVudEludGVyZmFjZSwgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgVkJveCBmcm9tIFwic2FwL20vVkJveFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIHsgSUZvcm1Db250ZW50IH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCB7IGdldEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwiLi4vLi4vdGVtcGxhdGluZy9GaWx0ZXJIZWxwZXJcIjtcbi8qKlxuICogQ29uc3RydWN0b3IgZm9yIGEgbmV3IGZpbHRlckJhci9hbGlnbmVkL0ZpbHRlckl0ZW1MYXlvdXQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IFtzSWRdIElEIGZvciB0aGUgbmV3IGNvbnRyb2wsIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5IGlmIG5vIElEIGlzIGdpdmVuXG4gKiBAcGFyYW0ge29iamVjdH0gW21TZXR0aW5nc10gSW5pdGlhbCBzZXR0aW5ncyBmb3IgdGhlIG5ldyBjb250cm9sXG4gKiBAY2xhc3MgUmVwcmVzZW50cyBhIGZpbHRlciBpdGVtIG9uIHRoZSBVSS5cbiAqIEBleHRlbmRzIHNhcC5tLlZCb3hcbiAqIEBpbXBsZW1lbnRzIHtzYXAudWkuY29yZS5JRm9ybUNvbnRlbnR9XG4gKiBAY2xhc3NcbiAqIEBwcml2YXRlXG4gKiBAc2luY2UgMS42MS4wXG4gKiBAYWxpYXMgY29udHJvbCBzYXAuZmUuY29yZS5jb250cm9scy5maWx0ZXJiYXIuVmlzdWFsRmlsdGVyXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhci5WaXN1YWxGaWx0ZXJcIilcbmNsYXNzIFZpc3VhbEZpbHRlciBleHRlbmRzIFZCb3ggaW1wbGVtZW50cyBJRm9ybUNvbnRlbnQge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUZvcm1Db250ZW50XCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX2NvcmVfSUZvcm1Db250ZW50OiBib29sZWFuID0gdHJ1ZTtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHNob3dWYWx1ZUhlbHAhOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHR2YWx1ZUhlbHBJY29uU3JjITogc3RyaW5nO1xuXG5cdEBldmVudCgpXG5cdHZhbHVlSGVscFJlcXVlc3QhOiBGdW5jdGlvbjtcblxuXHRwcml2YXRlIF9vQ2hhcnRCaW5kaW5nPzogYm9vbGVhbjtcblxuXHRvbkFmdGVyUmVuZGVyaW5nKCkge1xuXHRcdGxldCBzTGFiZWw7XG5cdFx0Y29uc3Qgb0ludGVyYWN0aXZlQ2hhcnQgPSAodGhpcy5nZXRJdGVtcygpWzFdIGFzIGFueSkuZ2V0SXRlbXMoKVswXTtcblx0XHRjb25zdCBzSW50ZXJuYWxDb250ZXh0UGF0aCA9IHRoaXMuZGF0YShcImluZm9QYXRoXCIpO1xuXHRcdGNvbnN0IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcgPVxuXHRcdFx0b0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZyhcInNlZ21lbnRzXCIpIHx8IG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJpbmRpbmcoXCJiYXJzXCIpIHx8IG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJpbmRpbmcoXCJwb2ludHNcIik7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb0ludGVyYWN0aXZlQ2hhcnQuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cdFx0Y29uc3QgYlNob3dPdmVyTGF5SW5pdGlhbGx5ID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInNob3dPdmVybGF5SW5pdGlhbGx5XCIpO1xuXHRcdGNvbnN0IG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbjogYW55ID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uXCIpXG5cdFx0XHQ/IENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEob0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uXCIpKVxuXHRcdFx0OiB7IFNlbGVjdE9wdGlvbnM6IFtdIH07XG5cdFx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllczogYW55W10gPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwicmVxdWlyZWRQcm9wZXJ0aWVzXCIpXG5cdFx0XHQ/IChDb21tb25IZWxwZXIucGFyc2VDdXN0b21EYXRhKG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJyZXF1aXJlZFByb3BlcnRpZXNcIikpIGFzIGFueVtdKVxuXHRcdFx0OiBbXTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0ludGVyYWN0aXZlQ2hhcnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcgPyBvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLmdldFBhdGgoKSA6IFwiXCI7XG5cdFx0bGV0IG9GaWx0ZXJCYXIgPSB0aGlzLmdldFBhcmVudCgpPy5nZXRQYXJlbnQoKSBhcyBGaWx0ZXJCYXI7XG5cdFx0Ly8gVE9ETzogUmVtb3ZlIHRoaXMgcGFydCBvbmNlIDIxNzAyMDQzNDcgaXMgZml4ZWRcblx0XHRpZiAob0ZpbHRlckJhci5nZXRNZXRhZGF0YSgpLmdldEVsZW1lbnROYW1lKCkgPT09IFwic2FwLnVpLm1kYy5maWx0ZXJiYXIucDEzbi5BZGFwdGF0aW9uRmlsdGVyQmFyXCIpIHtcblx0XHRcdG9GaWx0ZXJCYXIgPSBvRmlsdGVyQmFyLmdldFBhcmVudCgpPy5nZXRQYXJlbnQoKSBhcyBGaWx0ZXJCYXI7XG5cdFx0fVxuXHRcdGxldCBvRmlsdGVyQmFyQ29uZGl0aW9uczogYW55ID0ge307XG5cdFx0bGV0IGFQcm9wZXJ0eUluZm9TZXQgPSBbXTtcblx0XHRsZXQgc0ZpbHRlckVudGl0eU5hbWU7XG5cdFx0aWYgKG9GaWx0ZXJCYXIuZ2V0TWV0YWRhdGEoKS5nZXRFbGVtZW50TmFtZSgpID09PSBcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbHRlckJhclwiKSB7XG5cdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9ucyA9IG9GaWx0ZXJCYXIuZ2V0Q29uZGl0aW9ucygpO1xuXHRcdFx0YVByb3BlcnR5SW5mb1NldCA9IChvRmlsdGVyQmFyIGFzIGFueSkuZ2V0UHJvcGVydHlJbmZvU2V0KCk7XG5cdFx0XHRzRmlsdGVyRW50aXR5TmFtZSA9IG9GaWx0ZXJCYXIuZGF0YShcImVudGl0eVR5cGVcIikuc3BsaXQoXCIvXCIpWzFdO1xuXHRcdH1cblx0XHRjb25zdCBhUGFyYW1ldGVycyA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJwYXJhbWV0ZXJzXCIpID8gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInBhcmFtZXRlcnNcIikuY3VzdG9tRGF0YSA6IFtdO1xuXHRcdGNvbnN0IGZpbHRlckNvbmRpdGlvbnMgPSBnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50KFxuXHRcdFx0c0VudGl0eVNldFBhdGgsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0VmlzdWFsRmlsdGVyVXRpbHMuZ2V0Q3VzdG9tQ29uZGl0aW9ucy5iaW5kKFZpc3VhbEZpbHRlclV0aWxzKVxuXHRcdCk7XG5cdFx0Y29uc3Qgb1NlbGVjdGlvblZhcmlhbnRDb25kaXRpb25zID0gVmlzdWFsRmlsdGVyVXRpbHMuY29udmVydEZpbHRlckNvbmRpb25zKGZpbHRlckNvbmRpdGlvbnMpO1xuXHRcdGNvbnN0IG1Db25kaXRpb25zOiBhbnkgPSB7fTtcblxuXHRcdE9iamVjdC5rZXlzKG9GaWx0ZXJCYXJDb25kaXRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRcdGlmIChvRmlsdGVyQmFyQ29uZGl0aW9uc1tzS2V5XS5sZW5ndGgpIHtcblx0XHRcdFx0bUNvbmRpdGlvbnNbc0tleV0gPSBvRmlsdGVyQmFyQ29uZGl0aW9uc1tzS2V5XTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdE9iamVjdC5rZXlzKG9TZWxlY3Rpb25WYXJpYW50Q29uZGl0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRpZiAoIW1Db25kaXRpb25zW3NLZXldKSB7XG5cdFx0XHRcdG1Db25kaXRpb25zW3NLZXldID0gb1NlbGVjdGlvblZhcmlhbnRDb25kaXRpb25zW3NLZXldO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGlmIChiU2hvd092ZXJMYXlJbml0aWFsbHkgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRpZiAoIU9iamVjdC5rZXlzKG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbikubGVuZ3RoKSB7XG5cdFx0XHRcdGlmIChhUmVxdWlyZWRQcm9wZXJ0aWVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgsIHtcblx0XHRcdFx0XHRcdHNob3dFcnJvcjogdHJ1ZSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZVRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0XHRcdGVycm9yTWVzc2FnZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX1BST1ZJREVfRklMVEVSX1ZBTF9NVUxUSVBMRVZGXCIpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c0xhYmVsID1cblx0XHRcdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS8ke2FSZXF1aXJlZFByb3BlcnRpZXNbMF19QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbGApIHx8XG5cdFx0XHRcdFx0XHRhUmVxdWlyZWRQcm9wZXJ0aWVzWzBdO1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCwge1xuXHRcdFx0XHRcdFx0c2hvd0Vycm9yOiB0cnVlLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlVGl0bGU6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19FUlJPUl9NRVNTQUdFX1RJVExFXCIpLFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX1NJTkdMRVZGXCIsIHNMYWJlbClcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgYVNlbGVjdE9wdGlvbnM6IGFueVtdID0gW107XG5cdFx0XHRcdGNvbnN0IGFOb3RNYXRjaGVkQ29uZGl0aW9uczogYW55W10gPSBbXTtcblx0XHRcdFx0aWYgKG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbi5TZWxlY3RPcHRpb25zKSB7XG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLlNlbGVjdE9wdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob1NlbGVjdE9wdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRhU2VsZWN0T3B0aW9ucy5wdXNoKG9TZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lLiRQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvU2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24uUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbi5QYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdFx0XHRcdFx0YVNlbGVjdE9wdGlvbnMucHVzaChvUGFyYW1ldGVyLlByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhUmVxdWlyZWRQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHNQYXRoOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAoYVNlbGVjdE9wdGlvbnMuaW5kZXhPZihzUGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRhTm90TWF0Y2hlZENvbmRpdGlvbnMucHVzaChzUGF0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHRjb25zdCBlcnJvckluZm8gPSBWaXN1YWxGaWx0ZXJVdGlscy5nZXRFcnJvckluZm9Gb3JOb0luaXRpYWxPdmVybGF5KFxuXHRcdFx0XHRcdGFOb3RNYXRjaGVkQ29uZGl0aW9ucyxcblx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0c0VudGl0eVNldFBhdGgsXG5cdFx0XHRcdFx0b01ldGFNb2RlbFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgsIGVycm9ySW5mbyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLl9vQ2hhcnRCaW5kaW5nIHx8IHRoaXMuX29DaGFydEJpbmRpbmcgIT09IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcpIHtcblx0XHRcdGlmICh0aGlzLl9vQ2hhcnRCaW5kaW5nKSB7XG5cdFx0XHRcdHRoaXMuZGV0YWNoRGF0YVJlY2VpdmVkSGFuZGxlcih0aGlzLl9vQ2hhcnRCaW5kaW5nKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuYXR0YWNoRGF0YVJlY2l2ZWRIYW5kbGVyKG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcpO1xuXHRcdFx0dGhpcy5fb0NoYXJ0QmluZGluZyA9IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmc7XG5cdFx0fVxuXHRcdGNvbnN0IGJTaG93T3ZlcmxheSA9XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoc0ludGVybmFsQ29udGV4dFBhdGgpICYmIG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShzSW50ZXJuYWxDb250ZXh0UGF0aCkuc2hvd0Vycm9yO1xuXHRcdGNvbnN0IHNDaGFydEVudGl0eU5hbWUgPSBzRW50aXR5U2V0UGF0aCAhPT0gXCJcIiA/IHNFbnRpdHlTZXRQYXRoLnNwbGl0KFwiL1wiKVsxXS5zcGxpdChcIihcIilbMF0gOiBcIlwiO1xuXHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5sZW5ndGggJiYgc0ZpbHRlckVudGl0eU5hbWUgPT09IHNDaGFydEVudGl0eU5hbWUpIHtcblx0XHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IEZpbHRlclV0aWxzLmdldEJpbmRpbmdQYXRoRm9yUGFyYW1ldGVycyhvRmlsdGVyQmFyLCBtQ29uZGl0aW9ucywgYVByb3BlcnR5SW5mb1NldCwgYVBhcmFtZXRlcnMpO1xuXHRcdFx0aWYgKHNCaW5kaW5nUGF0aCkge1xuXHRcdFx0XHRvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLnNQYXRoID0gc0JpbmRpbmdQYXRoO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyByZXN1bWUgYmluZGluZyBmb3Igb25seSB0aG9zZSB2aXN1YWwgZmlsdGVycyB0aGF0IGRvIG5vdCBoYXZlIGEgaW4gcGFyYW1ldGVyIGF0dGFjaGVkLlxuXHRcdC8vIEJpbmRpbmdzIG9mIHZpc3VhbCBmaWx0ZXJzIHdpdGggaW5QYXJhbWV0ZXJzIHdpbGwgYmUgcmVzdW1lZCBsYXRlciBhZnRlciBjb25zaWRlcmluZyBpbiBwYXJhbWV0ZXJzLlxuXHRcdGlmIChvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nICYmIG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmcuaXNTdXNwZW5kZWQoKSAmJiAhYlNob3dPdmVybGF5KSB7XG5cdFx0XHRvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nLnJlc3VtZSgpO1xuXHRcdH1cblx0fVxuXG5cdGF0dGFjaERhdGFSZWNpdmVkSGFuZGxlcihvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nOiBhbnkpIHtcblx0XHRpZiAob0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZykge1xuXHRcdFx0b0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5hdHRhY2hFdmVudChcImRhdGFSZWNlaXZlZFwiLCB0aGlzLm9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQsIHRoaXMpO1xuXHRcdFx0dGhpcy5fb0NoYXJ0QmluZGluZyA9IG9JbnRlcmFjdGl2ZUNoYXJ0TGlzdEJpbmRpbmc7XG5cdFx0fVxuXHR9XG5cblx0ZGV0YWNoRGF0YVJlY2VpdmVkSGFuZGxlcihvSW50ZXJhY3RpdmVDaGFydExpc3RCaW5kaW5nOiBhbnkpIHtcblx0XHRpZiAob0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZykge1xuXHRcdFx0b0ludGVyYWN0aXZlQ2hhcnRMaXN0QmluZGluZy5kZXRhY2hFdmVudChcImRhdGFSZWNlaXZlZFwiLCB0aGlzLm9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQsIHRoaXMpO1xuXHRcdFx0dGhpcy5fb0NoYXJ0QmluZGluZyA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblxuXHRzZXRTaG93VmFsdWVIZWxwKGJTaG93VmFsdWVIZWxwOiBhbnkpIHtcblx0XHRpZiAodGhpcy5nZXRJdGVtcygpLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IG9WaXN1YWxGaWx0ZXJDb250cm9sID0gKHRoaXMuZ2V0SXRlbXMoKVswXSBhcyBhbnkpLmdldEl0ZW1zKClbMF07XG5cdFx0XHRvVmlzdWFsRmlsdGVyQ29udHJvbC5nZXRDb250ZW50KCkuc29tZShmdW5jdGlvbiAob0lubmVyQ29udHJvbDogYW55KSB7XG5cdFx0XHRcdGlmIChvSW5uZXJDb250cm9sLmlzQShcInNhcC5tLkJ1dHRvblwiKSkge1xuXHRcdFx0XHRcdG9Jbm5lckNvbnRyb2wuc2V0VmlzaWJsZShiU2hvd1ZhbHVlSGVscCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5zZXRQcm9wZXJ0eShcInNob3dWYWx1ZUhlbHBcIiwgYlNob3dWYWx1ZUhlbHApO1xuXHRcdH1cblx0fVxuXG5cdHNldFZhbHVlSGVscEljb25TcmMoc0ljb25TcmM6IGFueSkge1xuXHRcdGlmICh0aGlzLmdldEl0ZW1zKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3Qgb1Zpc3VhbEZpbHRlckNvbnRyb2wgPSAodGhpcy5nZXRJdGVtcygpWzBdIGFzIGFueSkuZ2V0SXRlbXMoKVswXTtcblx0XHRcdG9WaXN1YWxGaWx0ZXJDb250cm9sLmdldENvbnRlbnQoKS5zb21lKGZ1bmN0aW9uIChvSW5uZXJDb250cm9sOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9Jbm5lckNvbnRyb2wuaXNBKFwic2FwLm0uQnV0dG9uXCIpKSB7XG5cdFx0XHRcdFx0b0lubmVyQ29udHJvbC5zZXRJY29uKHNJY29uU3JjKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFByb3BlcnR5KFwidmFsdWVIZWxwSWNvblNyY1wiLCBzSWNvblNyYyk7XG5cdFx0fVxuXHR9XG5cblx0b25JbnRlcm5hbERhdGFSZWNlaXZlZChvRXZlbnQ6IGFueSkge1xuXHRcdGNvbnN0IHNJZCA9IHRoaXMuZ2V0SWQoKTtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyk7XG5cdFx0Y29uc3Qgb0ludGVyYWN0aXZlQ2hhcnQgPSAodGhpcy5nZXRJdGVtcygpWzFdIGFzIGFueSkuZ2V0SXRlbXMoKVswXTtcblx0XHRjb25zdCBzSW50ZXJuYWxDb250ZXh0UGF0aCA9IHRoaXMuZGF0YShcImluZm9QYXRoXCIpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUubWFjcm9zXCIpO1xuXHRcdGNvbnN0IHZVT00gPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwidW9tXCIpO1xuXHRcdFZpc3VhbEZpbHRlclV0aWxzLnVwZGF0ZUNoYXJ0U2NhbGVGYWN0b3JUaXRsZShvSW50ZXJhY3RpdmVDaGFydCwgb1ZpZXcsIHNJZCwgc0ludGVybmFsQ29udGV4dFBhdGgpO1xuXHRcdGlmIChvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiZXJyb3JcIikpIHtcblx0XHRcdGNvbnN0IHMxOG5NZXNzYWdlVGl0bGUgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKTtcblx0XHRcdGNvbnN0IHMxOG5NZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX0RBVEFfVEVYVFwiKTtcblx0XHRcdFZpc3VhbEZpbHRlclV0aWxzLmFwcGx5RXJyb3JNZXNzYWdlQW5kVGl0bGUoczE4bk1lc3NhZ2VUaXRsZSwgczE4bk1lc3NhZ2UsIHNJbnRlcm5hbENvbnRleHRQYXRoLCBvVmlldyk7XG5cdFx0fSBlbHNlIGlmIChvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiZGF0YVwiKSkge1xuXHRcdFx0Y29uc3Qgb0RhdGEgPSBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0Q3VycmVudENvbnRleHRzKCk7XG5cdFx0XHRpZiAob0RhdGEgJiYgb0RhdGEubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFZpc3VhbEZpbHRlclV0aWxzLnNldE5vRGF0YU1lc3NhZ2Uoc0ludGVybmFsQ29udGV4dFBhdGgsIG9SZXNvdXJjZUJ1bmRsZSwgb1ZpZXcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbENvbnRleHRQYXRoLCB7fSk7XG5cdFx0XHR9XG5cdFx0XHRWaXN1YWxGaWx0ZXJVdGlscy5zZXRNdWx0aVVPTU1lc3NhZ2Uob0RhdGEsIG9JbnRlcmFjdGl2ZUNoYXJ0LCBzSW50ZXJuYWxDb250ZXh0UGF0aCwgb1Jlc291cmNlQnVuZGxlLCBvVmlldyk7XG5cdFx0fVxuXHRcdGlmICh2VU9NICYmICgodlVPTVtcIklTT0N1cnJlbmN5XCJdICYmIHZVT01bXCJJU09DdXJyZW5jeVwiXS4kUGF0aCkgfHwgKHZVT01bXCJVbml0XCJdICYmIHZVT01bXCJVbml0XCJdLiRQYXRoKSkpIHtcblx0XHRcdGNvbnN0IG9Db250ZXh0cyA9IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRDb250ZXh0cygpO1xuXHRcdFx0Y29uc3Qgb0NvbnRleHREYXRhID0gb0NvbnRleHRzICYmIG9Db250ZXh0c1swXS5nZXRPYmplY3QoKTtcblx0XHRcdFZpc3VhbEZpbHRlclV0aWxzLmFwcGx5VU9NVG9UaXRsZShvSW50ZXJhY3RpdmVDaGFydCwgb0NvbnRleHREYXRhLCBvVmlldywgc0ludGVybmFsQ29udGV4dFBhdGgpO1xuXHRcdH1cblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgVmlzdWFsRmlsdGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFaQSxJQWNNQSxZQUFZLFdBRGpCQyxjQUFjLENBQUMsNkNBQTZDLENBQUMsVUFFNURDLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDLFVBRzlDQyxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBR0RELFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFHREMsS0FBSyxFQUFFO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BS1JDLGdCQUFnQixHQUFoQiw0QkFBbUI7TUFBQTtNQUNsQixJQUFJQyxNQUFNO01BQ1YsTUFBTUMsaUJBQWlCLEdBQUksSUFBSSxDQUFDQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBU0EsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQ25FLE1BQU1DLG9CQUFvQixHQUFHLElBQUksQ0FB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
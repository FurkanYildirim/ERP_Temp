/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/core/templating/FilterHelper", "sap/fe/core/type/TypeUtil", "sap/m/SearchField", "sap/ui/core/Control"], function (ClassSupport, FilterHelper, TypeUtil, SearchField, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var getEditStatusFilter = FilterHelper.getEditStatusFilter;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let BasicSearch = (_dec = defineUI5Class("sap.fe.macros.table.BasicSearch"), _dec2 = implementInterface("sap.ui.mdc.IFilter"), _dec3 = event( /*{ conditionsBased: {
                                                                                                                                                type: "boolean"
                                                                                                                                                }}*/), _dec4 = event( /*{
                                                                                                                                                                      conditions: {
                                                                                                                                                                      type: "object"
                                                                                                                                                                      }
                                                                                                                                                                      }*/), _dec5 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false
  }), _dec6 = property({
    type: "boolean"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(BasicSearch, _Control);
    function BasicSearch() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call(this, ...args) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_mdc_IFilter", _descriptor, _assertThisInitialized(_this));
      _this.__implements__sap_ui_mdc_IFilterSource = true;
      _initializerDefineProperty(_this, "filterChanged", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filter", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useDraftEditState", _descriptor5, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = BasicSearch.prototype;
    _proto.init = function init() {
      this.setAggregation("filter", new SearchField({
        placeholder: "{sap.fe.i18n>M_FILTERBAR_SEARCH}",
        search: () => {
          this.fireEvent("search");
        }
      }));
    };
    _proto.getConditions = function getConditions() {
      if (this.useDraftEditState) {
        return getEditStatusFilter();
      }
      return undefined;
    };
    _proto.getTypeUtil = function getTypeUtil() {
      return TypeUtil;
    };
    _proto.getPropertyInfoSet = function getPropertyInfoSet() {
      if (this.useDraftEditState) {
        return [{
          name: "$editState",
          path: "$editState",
          groupLabel: "",
          group: "",
          typeConfig: TypeUtil.getTypeConfig("sap.ui.model.odata.type.String", {}, {}),
          dataType: "sap.ui.model.odata.type.String",
          hiddenFilter: false
        }];
      }
      return [];
    };
    _proto.getSearch = function getSearch() {
      return this.filter.getValue();
    };
    _proto.validate = function validate() {
      return Promise.resolve();
    };
    BasicSearch.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.openEnd();
      oRm.renderControl(oControl.filter);
      oRm.close("div");
    };
    return BasicSearch;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_mdc_IFilter", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "filter", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "useDraftEditState", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  })), _class2)) || _class);
  return BasicSearch;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNpY1NlYXJjaCIsImRlZmluZVVJNUNsYXNzIiwiaW1wbGVtZW50SW50ZXJmYWNlIiwiZXZlbnQiLCJhZ2dyZWdhdGlvbiIsInR5cGUiLCJtdWx0aXBsZSIsInByb3BlcnR5IiwiX19pbXBsZW1lbnRzX19zYXBfdWlfbWRjX0lGaWx0ZXJTb3VyY2UiLCJpbml0Iiwic2V0QWdncmVnYXRpb24iLCJTZWFyY2hGaWVsZCIsInBsYWNlaG9sZGVyIiwic2VhcmNoIiwiZmlyZUV2ZW50IiwiZ2V0Q29uZGl0aW9ucyIsInVzZURyYWZ0RWRpdFN0YXRlIiwiZ2V0RWRpdFN0YXR1c0ZpbHRlciIsInVuZGVmaW5lZCIsImdldFR5cGVVdGlsIiwiVHlwZVV0aWwiLCJnZXRQcm9wZXJ0eUluZm9TZXQiLCJuYW1lIiwicGF0aCIsImdyb3VwTGFiZWwiLCJncm91cCIsInR5cGVDb25maWciLCJnZXRUeXBlQ29uZmlnIiwiZGF0YVR5cGUiLCJoaWRkZW5GaWx0ZXIiLCJnZXRTZWFyY2giLCJmaWx0ZXIiLCJnZXRWYWx1ZSIsInZhbGlkYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZW5kZXIiLCJvUm0iLCJvQ29udHJvbCIsIm9wZW5TdGFydCIsIm9wZW5FbmQiLCJyZW5kZXJDb250cm9sIiwiY2xvc2UiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJCYXNpY1NlYXJjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVuaGFuY2VXaXRoVUk1IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBpbXBsZW1lbnRJbnRlcmZhY2UsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZXRFZGl0U3RhdHVzRmlsdGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRmlsdGVySGVscGVyXCI7XG5pbXBvcnQgVHlwZVV0aWwgZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvVHlwZVV0aWxcIjtcbmltcG9ydCBTZWFyY2hGaWVsZCBmcm9tIFwic2FwL20vU2VhcmNoRmllbGRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IElGaWx0ZXIgfSBmcm9tIFwic2FwL3VpL21kYy9saWJyYXJ5XCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MudGFibGUuQmFzaWNTZWFyY2hcIilcbmNsYXNzIEJhc2ljU2VhcmNoIGV4dGVuZHMgQ29udHJvbCBpbXBsZW1lbnRzIElGaWx0ZXIge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLm1kYy5JRmlsdGVyXCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX21kY19JRmlsdGVyOiBib29sZWFuID0gdHJ1ZTtcblxuXHRfX2ltcGxlbWVudHNfX3NhcF91aV9tZGNfSUZpbHRlclNvdXJjZTogYm9vbGVhbiA9IHRydWU7XG5cblx0LyoqXG5cdCAqIFRoZSAnZmlsdGVyQ2hhbmdlZCcgY2FuIGJlIG9wdGlvbmFsbHkgaW1wbGVtZW50ZWQgdG8gZGlzcGxheSBhbiBvdmVybGF5XG5cdCAqIHdoZW4gdGhlIGZpbHRlciB2YWx1ZSBvZiB0aGUgSUZpbHRlciBjaGFuZ2VzXG5cdCAqL1xuXHRAZXZlbnQoLyp7IGNvbmRpdGlvbnNCYXNlZDoge1xuXHRcdCBcdHR5cGU6IFwiYm9vbGVhblwiXG5cdFx0IH19Ki8pXG5cdGZpbHRlckNoYW5nZWQhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogVGhlICdzZWFyY2gnIGV2ZW50IGlzIGEgbWFuZGF0b3J5IElGaWx0ZXIgZXZlbnQgdG8gdHJpZ2dlciBhIHNlYXJjaCBxdWVyeVxuXHQgKiBvbiB0aGUgY29uc3VtaW5nIGNvbnRyb2xcblx0ICovXG5cdEBldmVudCgvKntcblx0XHRcdFx0Y29uZGl0aW9uczoge1xuXHRcdFx0XHRcdHR5cGU6IFwib2JqZWN0XCJcblx0XHRcdFx0fVxuXHRcdFx0fSovKVxuXHRzZWFyY2ghOiBGdW5jdGlvbjtcblxuXHRAYWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLFxuXHRcdG11bHRpcGxlOiBmYWxzZVxuXHR9KVxuXHRmaWx0ZXIhOiBTZWFyY2hGaWVsZDtcblxuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHVzZURyYWZ0RWRpdFN0YXRlID0gZmFsc2U7XG5cblx0aW5pdCgpIHtcblx0XHR0aGlzLnNldEFnZ3JlZ2F0aW9uKFxuXHRcdFx0XCJmaWx0ZXJcIixcblx0XHRcdG5ldyBTZWFyY2hGaWVsZCh7XG5cdFx0XHRcdHBsYWNlaG9sZGVyOiBcIntzYXAuZmUuaTE4bj5NX0ZJTFRFUkJBUl9TRUFSQ0h9XCIsXG5cdFx0XHRcdHNlYXJjaDogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuZmlyZUV2ZW50KFwic2VhcmNoXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH1cblxuXHRnZXRDb25kaXRpb25zKCkge1xuXHRcdGlmICh0aGlzLnVzZURyYWZ0RWRpdFN0YXRlKSB7XG5cdFx0XHRyZXR1cm4gZ2V0RWRpdFN0YXR1c0ZpbHRlcigpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkIGFzIGFueTtcblx0fVxuXG5cdGdldFR5cGVVdGlsKCkge1xuXHRcdHJldHVybiBUeXBlVXRpbDtcblx0fVxuXG5cdGdldFByb3BlcnR5SW5mb1NldCgpIHtcblx0XHRpZiAodGhpcy51c2VEcmFmdEVkaXRTdGF0ZSkge1xuXHRcdFx0cmV0dXJuIFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG5hbWU6IFwiJGVkaXRTdGF0ZVwiLFxuXHRcdFx0XHRcdHBhdGg6IFwiJGVkaXRTdGF0ZVwiLFxuXHRcdFx0XHRcdGdyb3VwTGFiZWw6IFwiXCIsXG5cdFx0XHRcdFx0Z3JvdXA6IFwiXCIsXG5cdFx0XHRcdFx0dHlwZUNvbmZpZzogVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiLCB7fSwge30pLFxuXHRcdFx0XHRcdGRhdGFUeXBlOiBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiLFxuXHRcdFx0XHRcdGhpZGRlbkZpbHRlcjogZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0XTtcblx0XHR9XG5cdFx0cmV0dXJuIFtdO1xuXHR9XG5cblx0Z2V0U2VhcmNoKCkge1xuXHRcdHJldHVybiB0aGlzLmZpbHRlci5nZXRWYWx1ZSgpO1xuXHR9XG5cblx0dmFsaWRhdGUoKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0c3RhdGljIHJlbmRlcihvUm06IFJlbmRlck1hbmFnZXIsIG9Db250cm9sOiBCYXNpY1NlYXJjaCkge1xuXHRcdG9SbS5vcGVuU3RhcnQoXCJkaXZcIiwgb0NvbnRyb2wpO1xuXHRcdG9SbS5vcGVuRW5kKCk7XG5cdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRyb2wuZmlsdGVyKTtcblx0XHRvUm0uY2xvc2UoXCJkaXZcIik7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzaWNTZWFyY2ggYXMgdW5rbm93biBhcyBFbmhhbmNlV2l0aFVJNTxCYXNpY1NlYXJjaD47XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O01BVU1BLFdBQVcsV0FEaEJDLGNBQWMsQ0FBQyxpQ0FBaUMsQ0FBQyxVQUVoREMsa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsVUFTeENDLEtBQUssRUFBQztBQUNSO0FBQ0Esb0pBRlEsQ0FFQSxVQU9OQSxLQUFLLEVBQUM7QUFDUjtBQUNBO0FBQ0E7QUFDQSx5S0FKUSxDQUlELFVBR0xDLFdBQVcsQ0FBQztJ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
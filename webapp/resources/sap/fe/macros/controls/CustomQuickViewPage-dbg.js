/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/macros/DelegateUtil", "sap/m/QuickViewPage"], function (CommonUtils, ClassSupport, KeepAliveHelper, DelegateUtil, QuickViewPage) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let CustomQuickViewPage = (_dec = defineUI5Class("sap.fe.macros.controls.CustomQuickViewPage"), _dec2 = aggregation({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec3 = aggregation({
    type: "sap.m.QuickViewGroup",
    multiple: true,
    singularName: "group",
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_QuickViewPage) {
    _inheritsLoose(CustomQuickViewPage, _QuickViewPage);
    function CustomQuickViewPage() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _QuickViewPage.call(this, ...args) || this;
      _initializerDefineProperty(_this, "customContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "groups", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = CustomQuickViewPage.prototype;
    _proto.onBeforeRendering = function onBeforeRendering(oEvent) {
      const parent = this.getParent();
      if (parent && parent.isA("sap.fe.macros.controls.ConditionalWrapper") && parent.getProperty("condition") === true) {
        this.setCrossAppNavCallback(() => {
          const sQuickViewPageTitleLinkHref = DelegateUtil.getCustomData(this, "titleLink");
          const oView = CommonUtils.getTargetView(this);
          const oAppComponent = CommonUtils.getAppComponent(oView);
          const oShellServiceHelper = oAppComponent.getShellServices();
          let oShellHash = oShellServiceHelper.parseShellHash(sQuickViewPageTitleLinkHref);
          const oNavArgs = {
            target: {
              semanticObject: oShellHash.semanticObject,
              action: oShellHash.action
            },
            params: oShellHash.params
          };
          const sQuickViewPageTitleLinkIntent = `${oNavArgs.target.semanticObject}-${oNavArgs.target.action}`;
          if (sQuickViewPageTitleLinkIntent && typeof sQuickViewPageTitleLinkIntent === "string" && sQuickViewPageTitleLinkIntent !== "" && this.oCrossAppNavigator && this.oCrossAppNavigator.isNavigationSupported([sQuickViewPageTitleLinkIntent])) {
            var _oLinkControl;
            let oLinkControl = this.getParent();
            while (oLinkControl && !oLinkControl.isA("sap.ui.mdc.Link")) {
              oLinkControl = oLinkControl.getParent();
            }
            const sTargetHref = ((_oLinkControl = oLinkControl) === null || _oLinkControl === void 0 ? void 0 : _oLinkControl.getModel("$sapuimdcLink")).getProperty("/titleLinkHref");
            if (sTargetHref) {
              oShellHash = oShellServiceHelper.parseShellHash(sTargetHref);
            } else {
              oShellHash = oShellServiceHelper.parseShellHash(sQuickViewPageTitleLinkIntent);
              oShellHash.params = oNavArgs.params;
            }
            KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oShellHash);
            return {
              target: {
                semanticObject: oShellHash.semanticObject,
                action: oShellHash.action
              },
              params: oShellHash.params
            };
          } else {
            const oCurrentShellHash = oShellServiceHelper.parseShellHash(window.location.hash);
            KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oCurrentShellHash);
            return {
              target: {
                semanticObject: oCurrentShellHash.semanticObject,
                action: oCurrentShellHash.action,
                appSpecificRoute: oCurrentShellHash.appSpecificRoute
              },
              params: oCurrentShellHash.params
            };
          }
        });
      }
      _QuickViewPage.prototype.onBeforeRendering.call(this, oEvent);
      const oPageContent = this.getPageContent();
      const oForm = oPageContent.form;
      if (oForm) {
        const _aContent = this.customContent;
        if (_aContent && _aContent.length > 0) {
          _aContent.forEach(_oContent => {
            const _oContentClone = _oContent.clone();
            _oContentClone.setModel(this.getModel());
            _oContentClone.setBindingContext(this.getBindingContext());
            oForm.addContent(_oContentClone);
          });
          setTimeout(function () {
            oForm.rerender();
          }, 0);
        }
      }
    };
    return CustomQuickViewPage;
  }(QuickViewPage), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "customContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "groups", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return CustomQuickViewPage;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21RdWlja1ZpZXdQYWdlIiwiZGVmaW5lVUk1Q2xhc3MiLCJhZ2dyZWdhdGlvbiIsInR5cGUiLCJtdWx0aXBsZSIsInNpbmd1bGFyTmFtZSIsImlzRGVmYXVsdCIsIm9uQmVmb3JlUmVuZGVyaW5nIiwib0V2ZW50IiwicGFyZW50IiwiZ2V0UGFyZW50IiwiaXNBIiwiZ2V0UHJvcGVydHkiLCJzZXRDcm9zc0FwcE5hdkNhbGxiYWNrIiwic1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtIcmVmIiwiRGVsZWdhdGVVdGlsIiwiZ2V0Q3VzdG9tRGF0YSIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3Iiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm9TaGVsbFNlcnZpY2VIZWxwZXIiLCJnZXRTaGVsbFNlcnZpY2VzIiwib1NoZWxsSGFzaCIsInBhcnNlU2hlbGxIYXNoIiwib05hdkFyZ3MiLCJ0YXJnZXQiLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsInBhcmFtcyIsInNRdWlja1ZpZXdQYWdlVGl0bGVMaW5rSW50ZW50Iiwib0Nyb3NzQXBwTmF2aWdhdG9yIiwiaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIiwib0xpbmtDb250cm9sIiwic1RhcmdldEhyZWYiLCJnZXRNb2RlbCIsIktlZXBBbGl2ZUhlbHBlciIsInN0b3JlQ29udHJvbFJlZnJlc2hTdHJhdGVneUZvckhhc2giLCJvQ3VycmVudFNoZWxsSGFzaCIsIndpbmRvdyIsImxvY2F0aW9uIiwiaGFzaCIsImFwcFNwZWNpZmljUm91dGUiLCJvUGFnZUNvbnRlbnQiLCJnZXRQYWdlQ29udGVudCIsIm9Gb3JtIiwiZm9ybSIsIl9hQ29udGVudCIsImN1c3RvbUNvbnRlbnQiLCJsZW5ndGgiLCJmb3JFYWNoIiwiX29Db250ZW50IiwiX29Db250ZW50Q2xvbmUiLCJjbG9uZSIsInNldE1vZGVsIiwic2V0QmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImFkZENvbnRlbnQiLCJzZXRUaW1lb3V0IiwicmVyZW5kZXIiLCJRdWlja1ZpZXdQYWdlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDdXN0b21RdWlja1ZpZXdQYWdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgUXVpY2tWaWV3UGFnZSBmcm9tIFwic2FwL20vUXVpY2tWaWV3UGFnZVwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgTGluayBmcm9tIFwic2FwL3VpL21kYy9MaW5rXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5DdXN0b21RdWlja1ZpZXdQYWdlXCIpXG5jbGFzcyBDdXN0b21RdWlja1ZpZXdQYWdlIGV4dGVuZHMgUXVpY2tWaWV3UGFnZSB7XG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLCBtdWx0aXBsZTogdHJ1ZSB9KVxuXHRjdXN0b21Db250ZW50ITogQ29udHJvbFtdO1xuXG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLm0uUXVpY2tWaWV3R3JvdXBcIiwgbXVsdGlwbGU6IHRydWUsIHNpbmd1bGFyTmFtZTogXCJncm91cFwiLCBpc0RlZmF1bHQ6IHRydWUgfSlcblx0Z3JvdXBzITogQ29udHJvbFtdO1xuXG5cdG9uQmVmb3JlUmVuZGVyaW5nKG9FdmVudDogYW55KSB7XG5cdFx0Y29uc3QgcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKTtcblx0XHRpZiAocGFyZW50ICYmIHBhcmVudC5pc0EoXCJzYXAuZmUubWFjcm9zLmNvbnRyb2xzLkNvbmRpdGlvbmFsV3JhcHBlclwiKSAmJiBwYXJlbnQuZ2V0UHJvcGVydHkoXCJjb25kaXRpb25cIikgPT09IHRydWUpIHtcblx0XHRcdHRoaXMuc2V0Q3Jvc3NBcHBOYXZDYWxsYmFjaygoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IHNRdWlja1ZpZXdQYWdlVGl0bGVMaW5rSHJlZiA9IChEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YSBhcyBhbnkpKHRoaXMsIFwidGl0bGVMaW5rXCIpO1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyk7XG5cdFx0XHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpO1xuXHRcdFx0XHRjb25zdCBvU2hlbGxTZXJ2aWNlSGVscGVyID0gb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0XHRcdGxldCBvU2hlbGxIYXNoID0gb1NoZWxsU2VydmljZUhlbHBlci5wYXJzZVNoZWxsSGFzaChzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0hyZWYpO1xuXHRcdFx0XHRjb25zdCBvTmF2QXJncyA9IHtcblx0XHRcdFx0XHR0YXJnZXQ6IHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBvU2hlbGxIYXNoLmFjdGlvblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0cGFyYW1zOiBvU2hlbGxIYXNoLnBhcmFtc1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRjb25zdCBzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCA9IGAke29OYXZBcmdzLnRhcmdldC5zZW1hbnRpY09iamVjdH0tJHtvTmF2QXJncy50YXJnZXQuYWN0aW9ufWA7XG5cblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHNRdWlja1ZpZXdQYWdlVGl0bGVMaW5rSW50ZW50ICYmXG5cdFx0XHRcdFx0dHlwZW9mIHNRdWlja1ZpZXdQYWdlVGl0bGVMaW5rSW50ZW50ID09PSBcInN0cmluZ1wiICYmXG5cdFx0XHRcdFx0c1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtJbnRlbnQgIT09IFwiXCIgJiZcblx0XHRcdFx0XHR0aGlzLm9Dcm9zc0FwcE5hdmlnYXRvciAmJlxuXHRcdFx0XHRcdHRoaXMub0Nyb3NzQXBwTmF2aWdhdG9yLmlzTmF2aWdhdGlvblN1cHBvcnRlZChbc1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtJbnRlbnRdKVxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRsZXQgb0xpbmtDb250cm9sID0gdGhpcy5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHR3aGlsZSAob0xpbmtDb250cm9sICYmICFvTGlua0NvbnRyb2wuaXNBPExpbms+KFwic2FwLnVpLm1kYy5MaW5rXCIpKSB7XG5cdFx0XHRcdFx0XHRvTGlua0NvbnRyb2wgPSBvTGlua0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IHNUYXJnZXRIcmVmOiBzdHJpbmcgPSAob0xpbmtDb250cm9sPy5nZXRNb2RlbChcIiRzYXB1aW1kY0xpbmtcIikgYXMgSlNPTk1vZGVsKS5nZXRQcm9wZXJ0eShcIi90aXRsZUxpbmtIcmVmXCIpO1xuXHRcdFx0XHRcdGlmIChzVGFyZ2V0SHJlZikge1xuXHRcdFx0XHRcdFx0b1NoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VIZWxwZXIucGFyc2VTaGVsbEhhc2goc1RhcmdldEhyZWYpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvU2hlbGxIYXNoID0gb1NoZWxsU2VydmljZUhlbHBlci5wYXJzZVNoZWxsSGFzaChzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCk7XG5cdFx0XHRcdFx0XHRvU2hlbGxIYXNoLnBhcmFtcyA9IG9OYXZBcmdzLnBhcmFtcztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0S2VlcEFsaXZlSGVscGVyLnN0b3JlQ29udHJvbFJlZnJlc2hTdHJhdGVneUZvckhhc2gob1ZpZXcsIG9TaGVsbEhhc2gpO1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0YXJnZXQ6IHtcblx0XHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9TaGVsbEhhc2guc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbjogb1NoZWxsSGFzaC5hY3Rpb25cblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRwYXJhbXM6IG9TaGVsbEhhc2gucGFyYW1zXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBvQ3VycmVudFNoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VIZWxwZXIucGFyc2VTaGVsbEhhc2god2luZG93LmxvY2F0aW9uLmhhc2gpO1xuXHRcdFx0XHRcdEtlZXBBbGl2ZUhlbHBlci5zdG9yZUNvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JIYXNoKG9WaWV3LCBvQ3VycmVudFNoZWxsSGFzaCk7XG5cblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvQ3VycmVudFNoZWxsSGFzaC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBvQ3VycmVudFNoZWxsSGFzaC5hY3Rpb24sXG5cdFx0XHRcdFx0XHRcdGFwcFNwZWNpZmljUm91dGU6IG9DdXJyZW50U2hlbGxIYXNoLmFwcFNwZWNpZmljUm91dGVcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRwYXJhbXM6IG9DdXJyZW50U2hlbGxIYXNoLnBhcmFtc1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRzdXBlci5vbkJlZm9yZVJlbmRlcmluZyhvRXZlbnQpO1xuXHRcdGNvbnN0IG9QYWdlQ29udGVudCA9IHRoaXMuZ2V0UGFnZUNvbnRlbnQoKTtcblx0XHRjb25zdCBvRm9ybSA9IG9QYWdlQ29udGVudC5mb3JtO1xuXHRcdGlmIChvRm9ybSkge1xuXHRcdFx0Y29uc3QgX2FDb250ZW50ID0gdGhpcy5jdXN0b21Db250ZW50O1xuXHRcdFx0aWYgKF9hQ29udGVudCAmJiBfYUNvbnRlbnQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRfYUNvbnRlbnQuZm9yRWFjaCgoX29Db250ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBfb0NvbnRlbnRDbG9uZSA9IF9vQ29udGVudC5jbG9uZSgpO1xuXHRcdFx0XHRcdF9vQ29udGVudENsb25lLnNldE1vZGVsKHRoaXMuZ2V0TW9kZWwoKSk7XG5cdFx0XHRcdFx0X29Db250ZW50Q2xvbmUuc2V0QmluZGluZ0NvbnRleHQodGhpcy5nZXRCaW5kaW5nQ29udGV4dCgpKTtcblx0XHRcdFx0XHRvRm9ybS5hZGRDb250ZW50KF9vQ29udGVudENsb25lKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG9Gb3JtLnJlcmVuZGVyKCk7XG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5pbnRlcmZhY2UgQ3VzdG9tUXVpY2tWaWV3UGFnZSB7XG5cdC8vIFByaXZhdGUgaW4gVUk1XG5cdG9Dcm9zc0FwcE5hdmlnYXRvcjogYW55O1xuXG5cdC8vIFByaXZhdGUgaW4gVUk1XG5cdGdldFBhZ2VDb250ZW50KCk6IGFueTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ3VzdG9tUXVpY2tWaWV3UGFnZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztNQVVNQSxtQkFBbUIsV0FE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
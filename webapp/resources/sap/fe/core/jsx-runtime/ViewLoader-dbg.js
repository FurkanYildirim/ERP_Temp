/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/Page", "sap/ui/base/ManagedObject", "sap/ui/core/mvc/View", "sap/fe/core/jsx-runtime/jsx"], function (ClassSupport, Page, ManagedObject, View, _jsx) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var _exports = {};
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ViewLoader = (_dec = defineUI5Class("sap.fe.core.jsx-runtime.MDXViewLoader"), _dec2 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_View) {
    _inheritsLoose(ViewLoader, _View);
    function ViewLoader() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _View.call(this, ...args) || this;
      _initializerDefineProperty(_this, "viewName", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    _exports = ViewLoader;
    var _proto = ViewLoader.prototype;
    _proto.loadDependency = function loadDependency(name) {
      return new Promise(resolve => {
        sap.ui.require([name], async MDXContent => {
          resolve(MDXContent);
        });
      });
    };
    _proto.getControllerName = function getControllerName() {
      const viewData = this.getViewData();
      return viewData.controllerName;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ;
    _proto.createContent = async function createContent(oController) {
      const viewData = this.getViewData();
      const MDXContent = viewData.viewContent || (await this.loadDependency(viewData._mdxViewName));
      ViewLoader.preprocessorData = this.mPreprocessors.xml;
      ViewLoader.controller = oController;
      const mdxContent = ManagedObject.runWithPreprocessors(() => {
        return MDXContent();
      }, {
        id: sId => {
          return this.createId(sId);
        },
        settings: function () {
          this.controller = oController;
        }
      });
      return _jsx(Page, {
        class: "sapUiContentPadding",
        children: {
          content: mdxContent
        }
      });
    };
    return ViewLoader;
  }(View), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewName", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ViewLoader;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaWV3TG9hZGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJwcm9wZXJ0eSIsInR5cGUiLCJsb2FkRGVwZW5kZW5jeSIsIm5hbWUiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNhcCIsInVpIiwicmVxdWlyZSIsIk1EWENvbnRlbnQiLCJnZXRDb250cm9sbGVyTmFtZSIsInZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJjb250cm9sbGVyTmFtZSIsImNyZWF0ZUNvbnRlbnQiLCJvQ29udHJvbGxlciIsInZpZXdDb250ZW50IiwiX21keFZpZXdOYW1lIiwicHJlcHJvY2Vzc29yRGF0YSIsIm1QcmVwcm9jZXNzb3JzIiwieG1sIiwiY29udHJvbGxlciIsIm1keENvbnRlbnQiLCJNYW5hZ2VkT2JqZWN0IiwicnVuV2l0aFByZXByb2Nlc3NvcnMiLCJpZCIsInNJZCIsImNyZWF0ZUlkIiwic2V0dGluZ3MiLCJjb250ZW50IiwiVmlldyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlld0xvYWRlci50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgUGFnZSBmcm9tIFwic2FwL20vUGFnZVwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcblxuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcblxuaW1wb3J0IFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgeyBNYW5hZ2VkT2JqZWN0RXggfSBmcm9tIFwiLi4vLi4vLi4vLi4vLi4vLi4vLi4vdHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmpzeC1ydW50aW1lLk1EWFZpZXdMb2FkZXJcIilcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZpZXdMb2FkZXIgZXh0ZW5kcyBWaWV3IHtcblx0c3RhdGljIHByZXByb2Nlc3NvckRhdGE6IGFueTtcblxuXHRzdGF0aWMgY29udHJvbGxlcjogYW55O1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dmlld05hbWUhOiBzdHJpbmc7XG5cblx0bG9hZERlcGVuZGVuY3kobmFtZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHNhcC51aS5yZXF1aXJlKFtuYW1lXSwgYXN5bmMgKE1EWENvbnRlbnQ6IEZ1bmN0aW9uKSA9PiB7XG5cdFx0XHRcdHJlc29sdmUoTURYQ29udGVudCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdGdldENvbnRyb2xsZXJOYW1lKCkge1xuXHRcdGNvbnN0IHZpZXdEYXRhID0gdGhpcy5nZXRWaWV3RGF0YSgpIGFzIGFueTtcblx0XHRyZXR1cm4gdmlld0RhdGEuY29udHJvbGxlck5hbWU7XG5cdH1cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdC8vIEB0cy1pZ25vcmVcblx0YXN5bmMgY3JlYXRlQ29udGVudChvQ29udHJvbGxlcjogYW55KTogUHJvbWlzZTxDb250cm9sPiB7XG5cdFx0Y29uc3Qgdmlld0RhdGEgPSB0aGlzLmdldFZpZXdEYXRhKCkgYXMgYW55O1xuXHRcdGNvbnN0IE1EWENvbnRlbnQgPSB2aWV3RGF0YS52aWV3Q29udGVudCB8fCAoYXdhaXQgdGhpcy5sb2FkRGVwZW5kZW5jeSh2aWV3RGF0YS5fbWR4Vmlld05hbWUpKTtcblx0XHRWaWV3TG9hZGVyLnByZXByb2Nlc3NvckRhdGEgPSAodGhpcyBhcyBhbnkpLm1QcmVwcm9jZXNzb3JzLnhtbDtcblx0XHRWaWV3TG9hZGVyLmNvbnRyb2xsZXIgPSBvQ29udHJvbGxlcjtcblx0XHRjb25zdCBtZHhDb250ZW50ID0gKE1hbmFnZWRPYmplY3QgYXMgTWFuYWdlZE9iamVjdEV4KS5ydW5XaXRoUHJlcHJvY2Vzc29ycyhcblx0XHRcdCgpID0+IHtcblx0XHRcdFx0cmV0dXJuIE1EWENvbnRlbnQoKTtcblx0XHRcdH0sXG5cdFx0XHR7XG5cdFx0XHRcdGlkOiAoc0lkOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVJZChzSWQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXR0aW5nczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRoaXMuY29udHJvbGxlciA9IG9Db250cm9sbGVyO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0KTtcblx0XHRyZXR1cm4gPFBhZ2UgY2xhc3M9e1wic2FwVWlDb250ZW50UGFkZGluZ1wifT57eyBjb250ZW50OiBtZHhDb250ZW50IH19PC9QYWdlPjtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7OztNQVVxQkEsVUFBVSxXQUQ5QkMsY0FBYyxDQUFDLHVDQUF1QyxDQUFDLFVBTXREQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUEsT0FHN0JDLGNBQWMsR0FBZCx3QkFBZUMsSUFBWSxFQUFnQjtNQUMxQyxPQUFPLElBQUlDLE9BQU8sQ0FBRUMsT0FBTyxJQUFLO1FBQy9CQyxHQUFHLENBQUNDLEVBQUUsQ0FBQ0MsT0FBTyxDQUFDLENBQUNMLElBQUksQ0FBQyxFQUFFLE1BQU9NLFVBQW9CLElBQUs7VUFDdERKLE9BQU8sQ0FBQ0ksVUFBVSxDQUFDO1FBQ3BCLENBQUMsQ0FBQztNQUNILENBQUMsQ0FBQztJQUNILENBQUM7SUFBQSxPQUVEQyxpQkFBaUIsR0FBakIsNkJBQW9CO01BQ25CLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNDLFdBQVcsRUFBUztNQUMxQyxPQUFPRCxRQUFRLENBQUNFLGNBQWM7SUFDL0I7O0lBRUE7SUFDQTtJQUFBO0lBQUEsT0FDTUMsYUFBYSxHQUFuQiw2QkFBb0JDLFdBQWdCLEVBQW9CO01BQ3ZELE1BQU1KLFFBQVEsR0FBRyxJQUFJLENBQUNDLFdBQVcsRUFBUztNQUMxQyxNQUFNSCxVQUFVLEdBQUdFLFFBQVEsQ0FBQ0ssV0FBVyxLQUFLLE1BQU0sSUFBSSxDQUFDZCxjQUFjLENBQUNTLFFBQVEsQ0FBQ00sWUFBWSxDQUFDLENBQUM7TUFDN0ZuQixVQUFVLENBQUNvQixnQkFBZ0IsR0FBSSxJQUFJLENBQVNDLGNBQWMsQ0FBQ0MsR0FBRztNQUM5RHRCLFVBQVUsQ0FBQ3VCLFVBQVUsR0FBR04sV0FBVztNQUNuQyxNQUFNTyxVQUFVLEdBQUlDLGFBQWEsQ0FBcUJDLG9CQUFvQixDQUN6RSxNQUFNO1FBQ0wsT0FBT2YsVUFBVSxFQUFFO01BQ3BCLENBQUMsRUFDRDtRQUNDZ0IsRUFBRSxFQUFHQyxHQUFXLElBQUs7VUFDcEIsT0FBTyxJQUFJLENBQUNDLFFBQVEsQ0FBQ0QsR0FBRyxDQUFDO1FBQzFCLENBQUM7UUFDREUsUUFBUSxFQUFFLFlBQVk7VUFDckIsSUFBSSxDQUFDUCxVQUFVLEdBQUdOLFdBQVc7UUFDOUI7TUFDRCxDQUFDLENBQ0Q7TUFDRCxPQUFPLEtBQUMsSUFBSTtRQUFDLEtBQUssRUFBRSxxQkFBc0I7UUFBQSxVQUFFO1VBQUVjLE9BQU8sRUFBRVA7UUFBVztNQUFDLEVBQVE7SUFDNUUsQ0FBQztJQUFBO0VBQUEsRUExQ3NDUSxJQUFJO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9
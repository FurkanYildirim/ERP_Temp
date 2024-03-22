/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/core/TemplateComponent"], function (ClassSupport, TemplateComponent) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Component that can be used as a wrapper component for custom pages.
   *
   * The component can be used in case you want to use SAP Fiori elements Building Blocks or XML template
   * constructions. You can either extend the component and set the viewName and contextPath within your code
   * or you can use it to wrap your custom XML view directly the manifest when you define your custom page
   * under sapui5/routing/targets:
   *
   * <pre>
   * "myCustomPage": {
   *	"type": "Component",
   *	"id": "myCustomPage",
   *	"name": "sap.fe.core.fpm",
   *	"title": "My Custom Page",
   *	"options": {
   *		"settings": {
   *			"viewName": "myNamespace.myView",
   *			"contextPath": "/MyEntitySet"
   *			}
   *		}
   *	}
   * </pre>
   *
   * @name sap.fe.core.fpm.Component
   * @public
   * @experimental As of version 1.92.0
   * @since 1.92.0
   */
  let FPMComponent = (_dec = defineUI5Class("sap.fe.core.fpm.Component", {
    manifest: "json"
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_TemplateComponent) {
    _inheritsLoose(FPMComponent, _TemplateComponent);
    /**
     * Name of the XML view which is used for this page. The XML view can contain SAP Fiori elements Building Blocks and XML template constructions.
     *
     * @public
     */

    function FPMComponent(mSettings) {
      var _this;
      if (mSettings.viewType === "JSX") {
        mSettings._mdxViewName = mSettings.viewName;
        mSettings.viewName = "module:sap/fe/core/jsx-runtime/ViewLoader";
        // Remove the cache property from the settings as it is not supported by the ViewLoader
        delete mSettings.cache;
      }
      _this = _TemplateComponent.call(this, mSettings) || this;
      _initializerDefineProperty(_this, "viewName", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "controllerName", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_mdxViewName", _descriptor3, _assertThisInitialized(_this));
      return _this;
    }
    return FPMComponent;
  }(TemplateComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewName", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "controllerName", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "_mdxViewName", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  return FPMComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGUE1Db21wb25lbnQiLCJkZWZpbmVVSTVDbGFzcyIsIm1hbmlmZXN0IiwicHJvcGVydHkiLCJ0eXBlIiwibVNldHRpbmdzIiwidmlld1R5cGUiLCJfbWR4Vmlld05hbWUiLCJ2aWV3TmFtZSIsImNhY2hlIiwiVGVtcGxhdGVDb21wb25lbnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbXBvbmVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgVGVtcGxhdGVDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlQ29tcG9uZW50XCI7XG5cbi8qKlxuICogQ29tcG9uZW50IHRoYXQgY2FuIGJlIHVzZWQgYXMgYSB3cmFwcGVyIGNvbXBvbmVudCBmb3IgY3VzdG9tIHBhZ2VzLlxuICpcbiAqIFRoZSBjb21wb25lbnQgY2FuIGJlIHVzZWQgaW4gY2FzZSB5b3Ugd2FudCB0byB1c2UgU0FQIEZpb3JpIGVsZW1lbnRzIEJ1aWxkaW5nIEJsb2NrcyBvciBYTUwgdGVtcGxhdGVcbiAqIGNvbnN0cnVjdGlvbnMuIFlvdSBjYW4gZWl0aGVyIGV4dGVuZCB0aGUgY29tcG9uZW50IGFuZCBzZXQgdGhlIHZpZXdOYW1lIGFuZCBjb250ZXh0UGF0aCB3aXRoaW4geW91ciBjb2RlXG4gKiBvciB5b3UgY2FuIHVzZSBpdCB0byB3cmFwIHlvdXIgY3VzdG9tIFhNTCB2aWV3IGRpcmVjdGx5IHRoZSBtYW5pZmVzdCB3aGVuIHlvdSBkZWZpbmUgeW91ciBjdXN0b20gcGFnZVxuICogdW5kZXIgc2FwdWk1L3JvdXRpbmcvdGFyZ2V0czpcbiAqXG4gKiA8cHJlPlxuICogXCJteUN1c3RvbVBhZ2VcIjoge1xuICpcdFwidHlwZVwiOiBcIkNvbXBvbmVudFwiLFxuICpcdFwiaWRcIjogXCJteUN1c3RvbVBhZ2VcIixcbiAqXHRcIm5hbWVcIjogXCJzYXAuZmUuY29yZS5mcG1cIixcbiAqXHRcInRpdGxlXCI6IFwiTXkgQ3VzdG9tIFBhZ2VcIixcbiAqXHRcIm9wdGlvbnNcIjoge1xuICpcdFx0XCJzZXR0aW5nc1wiOiB7XG4gKlx0XHRcdFwidmlld05hbWVcIjogXCJteU5hbWVzcGFjZS5teVZpZXdcIixcbiAqXHRcdFx0XCJjb250ZXh0UGF0aFwiOiBcIi9NeUVudGl0eVNldFwiXG4gKlx0XHRcdH1cbiAqXHRcdH1cbiAqXHR9XG4gKiA8L3ByZT5cbiAqXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5mcG0uQ29tcG9uZW50XG4gKiBAcHVibGljXG4gKiBAZXhwZXJpbWVudGFsIEFzIG9mIHZlcnNpb24gMS45Mi4wXG4gKiBAc2luY2UgMS45Mi4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmZwbS5Db21wb25lbnRcIiwgeyBtYW5pZmVzdDogXCJqc29uXCIgfSlcbmNsYXNzIEZQTUNvbXBvbmVudCBleHRlbmRzIFRlbXBsYXRlQ29tcG9uZW50IHtcblx0LyoqXG5cdCAqIE5hbWUgb2YgdGhlIFhNTCB2aWV3IHdoaWNoIGlzIHVzZWQgZm9yIHRoaXMgcGFnZS4gVGhlIFhNTCB2aWV3IGNhbiBjb250YWluIFNBUCBGaW9yaSBlbGVtZW50cyBCdWlsZGluZyBCbG9ja3MgYW5kIFhNTCB0ZW1wbGF0ZSBjb25zdHJ1Y3Rpb25zLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZpZXdOYW1lITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0Y29udHJvbGxlck5hbWU/OiBzdHJpbmc7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRfbWR4Vmlld05hbWUgPSBcIlwiO1xuXG5cdGNvbnN0cnVjdG9yKG1TZXR0aW5nczogUHJvcGVydGllc09mPEZQTUNvbXBvbmVudD4gJiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikge1xuXHRcdGlmIChtU2V0dGluZ3Mudmlld1R5cGUgPT09IFwiSlNYXCIpIHtcblx0XHRcdG1TZXR0aW5ncy5fbWR4Vmlld05hbWUgPSBtU2V0dGluZ3Mudmlld05hbWU7XG5cdFx0XHRtU2V0dGluZ3Mudmlld05hbWUgPSBcIm1vZHVsZTpzYXAvZmUvY29yZS9qc3gtcnVudGltZS9WaWV3TG9hZGVyXCI7XG5cdFx0XHQvLyBSZW1vdmUgdGhlIGNhY2hlIHByb3BlcnR5IGZyb20gdGhlIHNldHRpbmdzIGFzIGl0IGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIFZpZXdMb2FkZXJcblx0XHRcdGRlbGV0ZSBtU2V0dGluZ3MuY2FjaGU7XG5cdFx0fVxuXHRcdHN1cGVyKG1TZXR0aW5ncyBhcyBhbnkpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZQTUNvbXBvbmVudDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBM0JBLElBNkJNQSxZQUFZLFdBRGpCQyxjQUFjLENBQUMsMkJBQTJCLEVBQUU7SUFBRUMsUUFBUSxFQUFFO0VBQU8sQ0FBQyxDQUFDLFVBT2hFQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDO0lBQUE7SUFYN0I7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7SUFVQyxzQkFBWUMsU0FBK0QsRUFBRTtNQUFBO01BQzVFLElBQUlBLFNBQVMsQ0FBQ0MsUUFBUSxLQUFLLEtBQUssRUFBRTtRQUNqQ0QsU0FBUyxDQUFDRSxZQUFZLEdBQUdGLFNBQVMsQ0FBQ0csUUFBUTtRQUMzQ0gsU0FBUyxDQUFDRyxRQUFRLEdBQUcsMkNBQTJDO1FBQ2hFO1FBQ0EsT0FBT0gsU0FBUyxDQUFDSSxLQUFLO01BQ3ZCO01BQ0Esc0NBQU1KLFNBQVMsQ0FBUTtNQUFDO01BQUE7TUFBQTtNQUFBO0lBQ3pCO0lBQUM7RUFBQSxFQXZCeUJLLGlCQUFpQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQWE1QixFQUFFO0lBQUE7RUFBQTtFQUFBLE9BYUhWLFlBQVk7QUFBQSJ9
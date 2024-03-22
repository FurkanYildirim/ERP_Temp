/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/ui/base/Object", "sap/ui/core/Component", "sap/ui/model/json/JSONModel", "./helpers/ClassSupport"], function (Log, CommonUtils, BaseObject, Component, JSONModel, ClassSupport) {
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
   * Common Extension API for all pages of SAP Fiori elements for OData V4.
   *
   * To correctly integrate your app extension coding with SAP Fiori elements, use only the extensionAPI of SAP Fiori elements. Don't access or manipulate controls, properties, models, or other internal objects created by the SAP Fiori elements framework.
   *
   * @alias sap.fe.core.ExtensionAPI
   * @public
   * @hideconstructor
   * @extends sap.ui.base.Object
   * @since 1.79.0
   */
  let ExtensionAPI = (_dec = defineUI5Class("sap.fe.core.ExtensionAPI"), _dec2 = property({
    type: "sap/fe/core/controllerextensions/EditFlow"
  }), _dec3 = property({
    type: "sap/fe/core/controllerextensions/Routing"
  }), _dec4 = property({
    type: "sap/fe/core/controllerextensions/IntentBasedNavigation"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(ExtensionAPI, _BaseObject);
    /**
     * A controller extension offering hooks into the edit flow of the application.
     *
     * @public
     */

    /**
     * A controller extension offering hooks into the routing flow of the application.
     *
     * @public
     */

    /**
     * ExtensionAPI for intent-based navigation
     *
     * @public
     */

    function ExtensionAPI(oController, sId) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _initializerDefineProperty(_this, "editFlow", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "routing", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor3, _assertThisInitialized(_this));
      _this._controller = oController;
      _this._view = oController.getView();
      _this.extension = _this._controller.extension;
      _this.editFlow = _this._controller.editFlow;
      _this.routing = _this._controller.routing;
      _this._routing = _this._controller._routing;
      _this.intentBasedNavigation = _this._controller.intentBasedNavigation;
      _this._prefix = sId;
      return _this;
    }
    var _proto = ExtensionAPI.prototype;
    _proto.destroy = function destroy() {
      // delete this._controller;
      // delete this._view;
      // delete this.editFlow._controller;
      // delete this.intentBasedNavigation._controller;
    }

    /**
     * Retrieves the editFlow controller extension for this page.
     *
     * @public
     * @returns The editFlow controller extension
     */;
    _proto.getEditFlow = function getEditFlow() {
      return this.editFlow;
    }

    /**
     * Retrieves the routing controller extension for this page.
     *
     * @public
     * @returns The routing controller extension
     */;
    _proto.getRouting = function getRouting() {
      return this.routing;
    }

    /**
     * Retrieves the intentBasedNavigation controller extension for this page.
     *
     * @public
     * @returns The intentBasedNavigation controller extension
     */;
    _proto.getIntentBasedNavigation = function getIntentBasedNavigation() {
      return this.intentBasedNavigation;
    }

    /**
     * Access any control by ID.
     *
     * @alias sap.fe.core.ExtensionAPI#byId
     * @param sId ID of the control without the view prefix. Either the ID prefixed by SAP Fiori elements
     * (for example with the section) or the control ID only. The latter works only for an extension running in
     * the same context (like in the same section). You can use the prefix for SAP Fiori elements to also access other controls located in different sections.
     * @returns The requested control, if found in the view.
     * @private
     */;
    _proto.byId = function byId(sId) {
      let oControl = this._view.byId(sId);
      if (!oControl && this._prefix) {
        // give it a try with the prefix
        oControl = this._view.byId(`${this._prefix}--${sId}`);
      }
      return oControl;
    }

    /**
     * Get access to models managed by SAP Fiori elements.<br>
     * The following models can be accessed:
     * <ul>
     * <li>undefined: the undefined model returns the SAPUI5 OData V4 model bound to this page</li>
     * <li>i18n / further data models defined in the manifest</li>
     * <li>ui: returns a SAPUI5 JSON model containing UI information.
     * Only the following properties are public and supported:
     * 	<ul>
     *     <li>isEditable: set to true if the application is in edit mode</li>
     *  </ul>
     * </li>
     * </ul>.
     * editMode is deprecated and should not be used anymore. Use isEditable instead.
     *
     * @alias sap.fe.core.ExtensionAPI#getModel
     * @param sModelName Name of the model
     * @returns The required model
     * @public
     */;
    _proto.getModel = function getModel(sModelName) {
      let oAppComponent;
      if (sModelName && sModelName !== "ui") {
        oAppComponent = CommonUtils.getAppComponent(this._view);
        if (!oAppComponent.getManifestEntry("sap.ui5").models[sModelName]) {
          // don't allow access to our internal models
          return undefined;
        }
      }
      return this._view.getModel(sModelName);
    }

    /**
     * Add any control as a dependent control to this SAP Fiori elements page.
     *
     * @alias sap.fe.core.ExtensionAPI#addDependent
     * @param oControl Control to be added as a dependent control
     * @public
     */;
    _proto.addDependent = function addDependent(oControl) {
      this._view.addDependent(oControl);
    }

    /**
     * Remove a dependent control from this SAP Fiori elements page.
     *
     * @alias sap.fe.core.ExtensionAPI#removeDependent
     * @param oControl Control to be added as a dependent control
     * @public
     */;
    _proto.removeDependent = function removeDependent(oControl) {
      this._view.removeDependent(oControl);
    }

    /**
     * Navigate to another target.
     *
     * @alias sap.fe.core.ExtensionAPI#navigateToTarget
     * @param sTarget Name of the target route
     * @param [oContext] Context instance
     * @public
     */;
    _proto.navigateToTarget = function navigateToTarget(sTarget, oContext) {
      this._controller._routing.navigateToTarget(oContext, sTarget);
    }

    /**
     * Load a fragment and go through the template preprocessor with the current page context.
     *
     * @alias sap.fe.core.ExtensionAPI#loadFragment
     * @param mSettings The settings object
     * @param mSettings.id The ID of the fragment itself
     * @param mSettings.name The name of the fragment to be loaded
     * @param mSettings.controller The controller to be attached to the fragment
     * @param mSettings.contextPath The contextPath to be used for the templating process
     * @param mSettings.initialBindingContext The initial binding context
     * @returns The fragment definition
     * @public
     */;
    _proto.loadFragment = async function loadFragment(mSettings) {
      var _this$getModel;
      const oTemplateComponent = Component.getOwnerComponentFor(this._view);
      const oPageModel = this._view.getModel("_pageModel");
      const oMetaModel = (_this$getModel = this.getModel()) === null || _this$getModel === void 0 ? void 0 : _this$getModel.getMetaModel();
      const mViewData = oTemplateComponent.getViewData();
      const targetContextPath = oTemplateComponent.getEntitySet() ? `/${oTemplateComponent.getEntitySet()}` : oTemplateComponent.getContextPath();
      const oViewDataModel = new JSONModel(mViewData),
        oPreprocessorSettings = {
          bindingContexts: {
            contextPath: oMetaModel === null || oMetaModel === void 0 ? void 0 : oMetaModel.createBindingContext(mSettings.contextPath || targetContextPath),
            converterContext: oPageModel.createBindingContext("/", undefined, {
              noResolve: true
            }),
            viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
          },
          models: {
            contextPath: oMetaModel,
            converterContext: oPageModel,
            metaModel: oMetaModel,
            viewData: oViewDataModel
          },
          appComponent: CommonUtils.getAppComponent(this._view)
        };
      const oTemplatePromise = CommonUtils.templateControlFragment(mSettings.name, oPreprocessorSettings, {
        controller: mSettings.controller || this,
        isXML: false,
        id: mSettings.id
      });
      oTemplatePromise.then(oFragment => {
        if (mSettings.initialBindingContext !== undefined) {
          oFragment.setBindingContext(mSettings.initialBindingContext);
        }
        this.addDependent(oFragment);
        return oFragment;
      }).catch(function (oError) {
        Log.error(oError);
      });
      return oTemplatePromise;
    }

    /**
     * Triggers an update of the app state.
     * Should be called if the state of a control, or any other state-relevant information, was changed.
     *
     * @alias sap.fe.core.ExtensionAPI#updateAppState
     * @returns A promise that resolves with the new app state object.
     * @public
     */;
    _proto.updateAppState = async function updateAppState() {
      return this._controller.getAppComponent().getAppStateHandler().createAppState();
    };
    return ExtensionAPI;
  }(BaseObject), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "editFlow", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "routing", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFeHRlbnNpb25BUEkiLCJkZWZpbmVVSTVDbGFzcyIsInByb3BlcnR5IiwidHlwZSIsIm9Db250cm9sbGVyIiwic0lkIiwiX2NvbnRyb2xsZXIiLCJfdmlldyIsImdldFZpZXciLCJleHRlbnNpb24iLCJlZGl0RmxvdyIsInJvdXRpbmciLCJfcm91dGluZyIsImludGVudEJhc2VkTmF2aWdhdGlvbiIsIl9wcmVmaXgiLCJkZXN0cm95IiwiZ2V0RWRpdEZsb3ciLCJnZXRSb3V0aW5nIiwiZ2V0SW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiYnlJZCIsIm9Db250cm9sIiwiZ2V0TW9kZWwiLCJzTW9kZWxOYW1lIiwib0FwcENvbXBvbmVudCIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0TWFuaWZlc3RFbnRyeSIsIm1vZGVscyIsInVuZGVmaW5lZCIsImFkZERlcGVuZGVudCIsInJlbW92ZURlcGVuZGVudCIsIm5hdmlnYXRlVG9UYXJnZXQiLCJzVGFyZ2V0Iiwib0NvbnRleHQiLCJsb2FkRnJhZ21lbnQiLCJtU2V0dGluZ3MiLCJvVGVtcGxhdGVDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsIm9QYWdlTW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwibVZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJ0YXJnZXRDb250ZXh0UGF0aCIsImdldEVudGl0eVNldCIsImdldENvbnRleHRQYXRoIiwib1ZpZXdEYXRhTW9kZWwiLCJKU09OTW9kZWwiLCJvUHJlcHJvY2Vzc29yU2V0dGluZ3MiLCJiaW5kaW5nQ29udGV4dHMiLCJjb250ZXh0UGF0aCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiY29udmVydGVyQ29udGV4dCIsIm5vUmVzb2x2ZSIsInZpZXdEYXRhIiwibWV0YU1vZGVsIiwiYXBwQ29tcG9uZW50Iiwib1RlbXBsYXRlUHJvbWlzZSIsInRlbXBsYXRlQ29udHJvbEZyYWdtZW50IiwibmFtZSIsImNvbnRyb2xsZXIiLCJpc1hNTCIsImlkIiwidGhlbiIsIm9GcmFnbWVudCIsImluaXRpYWxCaW5kaW5nQ29udGV4dCIsInNldEJpbmRpbmdDb250ZXh0IiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsInVwZGF0ZUFwcFN0YXRlIiwiZ2V0QXBwU3RhdGVIYW5kbGVyIiwiY3JlYXRlQXBwU3RhdGUiLCJCYXNlT2JqZWN0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFeHRlbnNpb25BUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSB7IEZFVmlldyB9IGZyb20gXCJzYXAvZmUvY29yZS9CYXNlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUgRWRpdEZsb3cgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0VkaXRGbG93XCI7XG5pbXBvcnQgdHlwZSBJbnRlbnRCYXNlZE5hdmlnYXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVudEJhc2VkTmF2aWdhdGlvblwiO1xuaW1wb3J0IHR5cGUgSW50ZXJuYWxSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbFJvdXRpbmdcIjtcbmltcG9ydCB0eXBlIFJvdXRpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1JvdXRpbmdcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgVGVtcGxhdGVDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlQ29tcG9uZW50XCI7XG5pbXBvcnQgQmFzZU9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvT2JqZWN0XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIFVJNUVsZW1lbnQgZnJvbSBcInNhcC91aS9jb3JlL0VsZW1lbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2xsZXIgZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL01vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IEVuaGFuY2VXaXRoVUk1IH0gZnJvbSBcIi4vaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwcm9wZXJ0eSB9IGZyb20gXCIuL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5cbi8qKlxuICogQ29tbW9uIEV4dGVuc2lvbiBBUEkgZm9yIGFsbCBwYWdlcyBvZiBTQVAgRmlvcmkgZWxlbWVudHMgZm9yIE9EYXRhIFY0LlxuICpcbiAqIFRvIGNvcnJlY3RseSBpbnRlZ3JhdGUgeW91ciBhcHAgZXh0ZW5zaW9uIGNvZGluZyB3aXRoIFNBUCBGaW9yaSBlbGVtZW50cywgdXNlIG9ubHkgdGhlIGV4dGVuc2lvbkFQSSBvZiBTQVAgRmlvcmkgZWxlbWVudHMuIERvbid0IGFjY2VzcyBvciBtYW5pcHVsYXRlIGNvbnRyb2xzLCBwcm9wZXJ0aWVzLCBtb2RlbHMsIG9yIG90aGVyIGludGVybmFsIG9iamVjdHMgY3JlYXRlZCBieSB0aGUgU0FQIEZpb3JpIGVsZW1lbnRzIGZyYW1ld29yay5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJXG4gKiBAcHVibGljXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBzYXAudWkuYmFzZS5PYmplY3RcbiAqIEBzaW5jZSAxLjc5LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJXCIpXG5jbGFzcyBFeHRlbnNpb25BUEkgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblx0LyoqXG5cdCAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgaG9va3MgaW50byB0aGUgZWRpdCBmbG93IG9mIHRoZSBhcHBsaWNhdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9FZGl0Rmxvd1wiIH0pXG5cdGVkaXRGbG93OiBFZGl0RmxvdztcblxuXHQvKipcblx0ICogQSBjb250cm9sbGVyIGV4dGVuc2lvbiBvZmZlcmluZyBob29rcyBpbnRvIHRoZSByb3V0aW5nIGZsb3cgb2YgdGhlIGFwcGxpY2F0aW9uLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1JvdXRpbmdcIiB9KVxuXHRyb3V0aW5nOiBSb3V0aW5nO1xuXG5cdC8qKlxuXHQgKiBFeHRlbnNpb25BUEkgZm9yIGludGVudC1iYXNlZCBuYXZpZ2F0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZW50QmFzZWROYXZpZ2F0aW9uXCIgfSlcblx0aW50ZW50QmFzZWROYXZpZ2F0aW9uOiBJbnRlbnRCYXNlZE5hdmlnYXRpb247XG5cblx0cHJvdGVjdGVkIF9jb250cm9sbGVyOiBQYWdlQ29udHJvbGxlcjtcblxuXHRwcm90ZWN0ZWQgX3ZpZXc6IEZFVmlldztcblxuXHRwcml2YXRlIF9yb3V0aW5nOiBJbnRlcm5hbFJvdXRpbmc7XG5cblx0cHJpdmF0ZSBfcHJlZml4Pzogc3RyaW5nO1xuXG5cdHByaXZhdGUgZXh0ZW5zaW9uOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblxuXHRjb25zdHJ1Y3RvcihvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIHNJZD86IHN0cmluZykge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy5fY29udHJvbGxlciA9IG9Db250cm9sbGVyO1xuXHRcdHRoaXMuX3ZpZXcgPSBvQ29udHJvbGxlci5nZXRWaWV3KCk7XG5cdFx0dGhpcy5leHRlbnNpb24gPSB0aGlzLl9jb250cm9sbGVyLmV4dGVuc2lvbjtcblx0XHR0aGlzLmVkaXRGbG93ID0gdGhpcy5fY29udHJvbGxlci5lZGl0Rmxvdztcblx0XHR0aGlzLnJvdXRpbmcgPSB0aGlzLl9jb250cm9sbGVyLnJvdXRpbmc7XG5cdFx0dGhpcy5fcm91dGluZyA9IHRoaXMuX2NvbnRyb2xsZXIuX3JvdXRpbmc7XG5cdFx0dGhpcy5pbnRlbnRCYXNlZE5hdmlnYXRpb24gPSB0aGlzLl9jb250cm9sbGVyLmludGVudEJhc2VkTmF2aWdhdGlvbjtcblx0XHR0aGlzLl9wcmVmaXggPSBzSWQ7XG5cdH1cblxuXHRkZXN0cm95KCkge1xuXHRcdC8vIGRlbGV0ZSB0aGlzLl9jb250cm9sbGVyO1xuXHRcdC8vIGRlbGV0ZSB0aGlzLl92aWV3O1xuXHRcdC8vIGRlbGV0ZSB0aGlzLmVkaXRGbG93Ll9jb250cm9sbGVyO1xuXHRcdC8vIGRlbGV0ZSB0aGlzLmludGVudEJhc2VkTmF2aWdhdGlvbi5fY29udHJvbGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGVkaXRGbG93IGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGZvciB0aGlzIHBhZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGVkaXRGbG93IGNvbnRyb2xsZXIgZXh0ZW5zaW9uXG5cdCAqL1xuXHRnZXRFZGl0RmxvdygpIHtcblx0XHRyZXR1cm4gdGhpcy5lZGl0Rmxvdztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHJvdXRpbmcgY29udHJvbGxlciBleHRlbnNpb24gZm9yIHRoaXMgcGFnZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyBUaGUgcm91dGluZyBjb250cm9sbGVyIGV4dGVuc2lvblxuXHQgKi9cblx0Z2V0Um91dGluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5yb3V0aW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgaW50ZW50QmFzZWROYXZpZ2F0aW9uIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGZvciB0aGlzIHBhZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGludGVudEJhc2VkTmF2aWdhdGlvbiBjb250cm9sbGVyIGV4dGVuc2lvblxuXHQgKi9cblx0Z2V0SW50ZW50QmFzZWROYXZpZ2F0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmludGVudEJhc2VkTmF2aWdhdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBBY2Nlc3MgYW55IGNvbnRyb2wgYnkgSUQuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5FeHRlbnNpb25BUEkjYnlJZFxuXHQgKiBAcGFyYW0gc0lkIElEIG9mIHRoZSBjb250cm9sIHdpdGhvdXQgdGhlIHZpZXcgcHJlZml4LiBFaXRoZXIgdGhlIElEIHByZWZpeGVkIGJ5IFNBUCBGaW9yaSBlbGVtZW50c1xuXHQgKiAoZm9yIGV4YW1wbGUgd2l0aCB0aGUgc2VjdGlvbikgb3IgdGhlIGNvbnRyb2wgSUQgb25seS4gVGhlIGxhdHRlciB3b3JrcyBvbmx5IGZvciBhbiBleHRlbnNpb24gcnVubmluZyBpblxuXHQgKiB0aGUgc2FtZSBjb250ZXh0IChsaWtlIGluIHRoZSBzYW1lIHNlY3Rpb24pLiBZb3UgY2FuIHVzZSB0aGUgcHJlZml4IGZvciBTQVAgRmlvcmkgZWxlbWVudHMgdG8gYWxzbyBhY2Nlc3Mgb3RoZXIgY29udHJvbHMgbG9jYXRlZCBpbiBkaWZmZXJlbnQgc2VjdGlvbnMuXG5cdCAqIEByZXR1cm5zIFRoZSByZXF1ZXN0ZWQgY29udHJvbCwgaWYgZm91bmQgaW4gdGhlIHZpZXcuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRieUlkKHNJZDogc3RyaW5nKSB7XG5cdFx0bGV0IG9Db250cm9sID0gdGhpcy5fdmlldy5ieUlkKHNJZCk7XG5cblx0XHRpZiAoIW9Db250cm9sICYmIHRoaXMuX3ByZWZpeCkge1xuXHRcdFx0Ly8gZ2l2ZSBpdCBhIHRyeSB3aXRoIHRoZSBwcmVmaXhcblx0XHRcdG9Db250cm9sID0gdGhpcy5fdmlldy5ieUlkKGAke3RoaXMuX3ByZWZpeH0tLSR7c0lkfWApO1xuXHRcdH1cblx0XHRyZXR1cm4gb0NvbnRyb2w7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGFjY2VzcyB0byBtb2RlbHMgbWFuYWdlZCBieSBTQVAgRmlvcmkgZWxlbWVudHMuPGJyPlxuXHQgKiBUaGUgZm9sbG93aW5nIG1vZGVscyBjYW4gYmUgYWNjZXNzZWQ6XG5cdCAqIDx1bD5cblx0ICogPGxpPnVuZGVmaW5lZDogdGhlIHVuZGVmaW5lZCBtb2RlbCByZXR1cm5zIHRoZSBTQVBVSTUgT0RhdGEgVjQgbW9kZWwgYm91bmQgdG8gdGhpcyBwYWdlPC9saT5cblx0ICogPGxpPmkxOG4gLyBmdXJ0aGVyIGRhdGEgbW9kZWxzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0PC9saT5cblx0ICogPGxpPnVpOiByZXR1cm5zIGEgU0FQVUk1IEpTT04gbW9kZWwgY29udGFpbmluZyBVSSBpbmZvcm1hdGlvbi5cblx0ICogT25seSB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXMgYXJlIHB1YmxpYyBhbmQgc3VwcG9ydGVkOlxuXHQgKiBcdDx1bD5cblx0ICogICAgIDxsaT5pc0VkaXRhYmxlOiBzZXQgdG8gdHJ1ZSBpZiB0aGUgYXBwbGljYXRpb24gaXMgaW4gZWRpdCBtb2RlPC9saT5cblx0ICogIDwvdWw+XG5cdCAqIDwvbGk+XG5cdCAqIDwvdWw+LlxuXHQgKiBlZGl0TW9kZSBpcyBkZXByZWNhdGVkIGFuZCBzaG91bGQgbm90IGJlIHVzZWQgYW55bW9yZS4gVXNlIGlzRWRpdGFibGUgaW5zdGVhZC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLkV4dGVuc2lvbkFQSSNnZXRNb2RlbFxuXHQgKiBAcGFyYW0gc01vZGVsTmFtZSBOYW1lIG9mIHRoZSBtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgcmVxdWlyZWQgbW9kZWxcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Z2V0TW9kZWwoc01vZGVsTmFtZT86IHN0cmluZyk6IE1vZGVsIHwgdW5kZWZpbmVkIHtcblx0XHRsZXQgb0FwcENvbXBvbmVudDtcblxuXHRcdGlmIChzTW9kZWxOYW1lICYmIHNNb2RlbE5hbWUgIT09IFwidWlcIikge1xuXHRcdFx0b0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLl92aWV3KTtcblx0XHRcdGlmICghb0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLnVpNVwiKS5tb2RlbHNbc01vZGVsTmFtZV0pIHtcblx0XHRcdFx0Ly8gZG9uJ3QgYWxsb3cgYWNjZXNzIHRvIG91ciBpbnRlcm5hbCBtb2RlbHNcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fdmlldy5nZXRNb2RlbChzTW9kZWxOYW1lKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGQgYW55IGNvbnRyb2wgYXMgYSBkZXBlbmRlbnQgY29udHJvbCB0byB0aGlzIFNBUCBGaW9yaSBlbGVtZW50cyBwYWdlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJI2FkZERlcGVuZGVudFxuXHQgKiBAcGFyYW0gb0NvbnRyb2wgQ29udHJvbCB0byBiZSBhZGRlZCBhcyBhIGRlcGVuZGVudCBjb250cm9sXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFkZERlcGVuZGVudChvQ29udHJvbDogQ29udHJvbCkge1xuXHRcdHRoaXMuX3ZpZXcuYWRkRGVwZW5kZW50KG9Db250cm9sKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZW1vdmUgYSBkZXBlbmRlbnQgY29udHJvbCBmcm9tIHRoaXMgU0FQIEZpb3JpIGVsZW1lbnRzIHBhZ2UuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5FeHRlbnNpb25BUEkjcmVtb3ZlRGVwZW5kZW50XG5cdCAqIEBwYXJhbSBvQ29udHJvbCBDb250cm9sIHRvIGJlIGFkZGVkIGFzIGEgZGVwZW5kZW50IGNvbnRyb2xcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmVtb3ZlRGVwZW5kZW50KG9Db250cm9sOiBDb250cm9sKSB7XG5cdFx0dGhpcy5fdmlldy5yZW1vdmVEZXBlbmRlbnQob0NvbnRyb2wpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlIHRvIGFub3RoZXIgdGFyZ2V0LlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJI25hdmlnYXRlVG9UYXJnZXRcblx0ICogQHBhcmFtIHNUYXJnZXQgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBbb0NvbnRleHRdIENvbnRleHQgaW5zdGFuY2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0bmF2aWdhdGVUb1RhcmdldChzVGFyZ2V0OiBzdHJpbmcsIG9Db250ZXh0OiBDb250ZXh0KTogdm9pZCB7XG5cdFx0dGhpcy5fY29udHJvbGxlci5fcm91dGluZy5uYXZpZ2F0ZVRvVGFyZ2V0KG9Db250ZXh0LCBzVGFyZ2V0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBMb2FkIGEgZnJhZ21lbnQgYW5kIGdvIHRocm91Z2ggdGhlIHRlbXBsYXRlIHByZXByb2Nlc3NvciB3aXRoIHRoZSBjdXJyZW50IHBhZ2UgY29udGV4dC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLkV4dGVuc2lvbkFQSSNsb2FkRnJhZ21lbnRcblx0ICogQHBhcmFtIG1TZXR0aW5ncyBUaGUgc2V0dGluZ3Mgb2JqZWN0XG5cdCAqIEBwYXJhbSBtU2V0dGluZ3MuaWQgVGhlIElEIG9mIHRoZSBmcmFnbWVudCBpdHNlbGZcblx0ICogQHBhcmFtIG1TZXR0aW5ncy5uYW1lIFRoZSBuYW1lIG9mIHRoZSBmcmFnbWVudCB0byBiZSBsb2FkZWRcblx0ICogQHBhcmFtIG1TZXR0aW5ncy5jb250cm9sbGVyIFRoZSBjb250cm9sbGVyIHRvIGJlIGF0dGFjaGVkIHRvIHRoZSBmcmFnbWVudFxuXHQgKiBAcGFyYW0gbVNldHRpbmdzLmNvbnRleHRQYXRoIFRoZSBjb250ZXh0UGF0aCB0byBiZSB1c2VkIGZvciB0aGUgdGVtcGxhdGluZyBwcm9jZXNzXG5cdCAqIEBwYXJhbSBtU2V0dGluZ3MuaW5pdGlhbEJpbmRpbmdDb250ZXh0IFRoZSBpbml0aWFsIGJpbmRpbmcgY29udGV4dFxuXHQgKiBAcmV0dXJucyBUaGUgZnJhZ21lbnQgZGVmaW5pdGlvblxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhc3luYyBsb2FkRnJhZ21lbnQobVNldHRpbmdzOiB7XG5cdFx0aWQ6IHN0cmluZztcblx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0Y29udHJvbGxlcj86IG9iamVjdDtcblx0XHRjb250ZXh0UGF0aD86IHN0cmluZztcblx0XHRpbml0aWFsQmluZGluZ0NvbnRleHQ/OiBDb250ZXh0O1xuXHR9KTogUHJvbWlzZTxVSTVFbGVtZW50IHwgVUk1RWxlbWVudFtdPiB7XG5cdFx0Y29uc3Qgb1RlbXBsYXRlQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRoaXMuX3ZpZXcpIGFzIEVuaGFuY2VXaXRoVUk1PFRlbXBsYXRlQ29tcG9uZW50Pjtcblx0XHRjb25zdCBvUGFnZU1vZGVsID0gdGhpcy5fdmlldy5nZXRNb2RlbChcIl9wYWdlTW9kZWxcIik7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IHRoaXMuZ2V0TW9kZWwoKT8uZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3QgbVZpZXdEYXRhID0gb1RlbXBsYXRlQ29tcG9uZW50LmdldFZpZXdEYXRhKCk7XG5cdFx0Y29uc3QgdGFyZ2V0Q29udGV4dFBhdGggPSBvVGVtcGxhdGVDb21wb25lbnQuZ2V0RW50aXR5U2V0KClcblx0XHRcdD8gYC8ke29UZW1wbGF0ZUNvbXBvbmVudC5nZXRFbnRpdHlTZXQoKSF9YFxuXHRcdFx0OiBvVGVtcGxhdGVDb21wb25lbnQuZ2V0Q29udGV4dFBhdGgoKSE7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG1WaWV3RGF0YSksXG5cdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdGNvbnRleHRQYXRoOiBvTWV0YU1vZGVsPy5jcmVhdGVCaW5kaW5nQ29udGV4dChtU2V0dGluZ3MuY29udGV4dFBhdGggfHwgdGFyZ2V0Q29udGV4dFBhdGgpLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IG9QYWdlTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIsIHVuZGVmaW5lZCwgeyBub1Jlc29sdmU6IHRydWUgfSksXG5cdFx0XHRcdFx0dmlld0RhdGE6IG1WaWV3RGF0YSA/IG9WaWV3RGF0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSA6IG51bGxcblx0XHRcdFx0fSxcblx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogb1BhZ2VNb2RlbCxcblx0XHRcdFx0XHRtZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0dmlld0RhdGE6IG9WaWV3RGF0YU1vZGVsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGFwcENvbXBvbmVudDogQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuX3ZpZXcpXG5cdFx0XHR9O1xuXHRcdGNvbnN0IG9UZW1wbGF0ZVByb21pc2UgPSBDb21tb25VdGlscy50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChtU2V0dGluZ3MubmFtZSwgb1ByZXByb2Nlc3NvclNldHRpbmdzLCB7XG5cdFx0XHRjb250cm9sbGVyOiAobVNldHRpbmdzLmNvbnRyb2xsZXIgYXMgQ29udHJvbGxlcikgfHwgdGhpcyxcblx0XHRcdGlzWE1MOiBmYWxzZSxcblx0XHRcdGlkOiBtU2V0dGluZ3MuaWRcblx0XHR9KSBhcyBQcm9taXNlPENvbnRyb2w+O1xuXHRcdG9UZW1wbGF0ZVByb21pc2Vcblx0XHRcdC50aGVuKChvRnJhZ21lbnQ6IENvbnRyb2wpID0+IHtcblx0XHRcdFx0aWYgKG1TZXR0aW5ncy5pbml0aWFsQmluZGluZ0NvbnRleHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdG9GcmFnbWVudC5zZXRCaW5kaW5nQ29udGV4dChtU2V0dGluZ3MuaW5pdGlhbEJpbmRpbmdDb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmFkZERlcGVuZGVudChvRnJhZ21lbnQpO1xuXHRcdFx0XHRyZXR1cm4gb0ZyYWdtZW50O1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihvRXJyb3IgYXMgc3RyaW5nKTtcblx0XHRcdH0pO1xuXHRcdHJldHVybiBvVGVtcGxhdGVQcm9taXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIGFuIHVwZGF0ZSBvZiB0aGUgYXBwIHN0YXRlLlxuXHQgKiBTaG91bGQgYmUgY2FsbGVkIGlmIHRoZSBzdGF0ZSBvZiBhIGNvbnRyb2wsIG9yIGFueSBvdGhlciBzdGF0ZS1yZWxldmFudCBpbmZvcm1hdGlvbiwgd2FzIGNoYW5nZWQuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5FeHRlbnNpb25BUEkjdXBkYXRlQXBwU3RhdGVcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgbmV3IGFwcCBzdGF0ZSBvYmplY3QuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFzeW5jIHVwZGF0ZUFwcFN0YXRlKCk6IFByb21pc2U8dm9pZCB8IHsgYXBwU3RhdGU6IG9iamVjdCB9PiB7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRyb2xsZXIuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0QXBwU3RhdGVIYW5kbGVyKCkuY3JlYXRlQXBwU3RhdGUoKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBFeHRlbnNpb25BUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUFvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVZBLElBWU1BLFlBQVksV0FEakJDLGNBQWMsQ0FBQywwQkFBMEIsQ0FBQyxVQU96Q0MsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUE0QyxDQUFDLENBQUMsVUFRL0RELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBMkMsQ0FBQyxDQUFDLFVBUTlERCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQXlELENBQUMsQ0FBQztJQUFBO0lBckI3RTtBQUNEO0FBQ0E7QUFDQTtBQUNBOztJQUlDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0lBSUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7SUFjQyxzQkFBWUMsV0FBMkIsRUFBRUMsR0FBWSxFQUFFO01BQUE7TUFDdEQsOEJBQU87TUFBQztNQUFBO01BQUE7TUFDUixNQUFLQyxXQUFXLEdBQUdGLFdBQVc7TUFDOUIsTUFBS0csS0FBSyxHQUFHSCxXQUFXLENBQUNJLE9BQU8sRUFBRTtNQUNsQyxNQUFLQyxTQUFTLEdBQUcsTUFBS0gsV0FBVyxDQUFDRyxTQUFTO01BQzNDLE1BQUtDLFFBQVEsR0FBRyxNQUFLSixXQUFXLENBQUNJLFFBQVE7TUFDekMsTUFBS0MsT0FBTyxHQUFHLE1BQUtMLFdBQVcsQ0FB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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/m/IllustratedMessage", "sap/m/Page", "./RootViewBaseController"], function (Log, CommonUtils, ViewState, ClassSupport, KeepAliveHelper, IllustratedMessage, Page, BaseController) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Base controller class for your own root view with a sap.m.NavContainer control.
   *
   * By using or extending this controller you can use your own root view with the sap.fe.core.AppComponent and
   * you can make use of SAP Fiori elements pages and SAP Fiori elements building blocks.
   *
   * @hideconstructor
   * @public
   * @since 1.108.0
   */
  let NavContainerController = (_dec = defineUI5Class("sap.fe.core.rootView.NavContainer"), _dec2 = usingExtension(ViewState.override({
    applyInitialStateOnly: function () {
      return false;
    },
    adaptBindingRefreshControls: function (aControls) {
      const oView = this.getView(),
        oController = oView.getController();
      aControls.push(oController._getCurrentPage(oView));
    },
    adaptStateControls: function (aStateControls) {
      const oView = this.getView(),
        oController = oView.getController();
      aStateControls.push(oController._getCurrentPage(oView));
    },
    onRestore: function () {
      const oView = this.getView(),
        oController = oView.getController(),
        oNavContainer = oController.getAppContentContainer();
      const oInternalModel = oNavContainer.getModel("internal");
      const oPages = oInternalModel.getProperty("/pages");
      for (const sComponentId in oPages) {
        oInternalModel.setProperty(`/pages/${sComponentId}/restoreStatus`, "pending");
      }
      oController.onContainerReady();
    },
    onSuspend: function () {
      const oView = this.getView(),
        oNavController = oView.getController(),
        oNavContainer = oNavController.getAppContentContainer();
      const aPages = oNavContainer.getPages();
      aPages.forEach(function (oPage) {
        const oTargetView = CommonUtils.getTargetView(oPage);
        const oController = oTargetView && oTargetView.getController();
        if (oController && oController.viewState && oController.viewState.onSuspend) {
          oController.viewState.onSuspend();
        }
      });
    }
  })), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(NavContainerController, _BaseController);
    function NavContainerController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "viewState", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = NavContainerController.prototype;
    _proto.onContainerReady = function onContainerReady() {
      // Restore views if neccessary.
      const oView = this.getView(),
        oPagePromise = this._getCurrentPage(oView);
      return oPagePromise.then(function (oCurrentPage) {
        const oTargetView = CommonUtils.getTargetView(oCurrentPage);
        return KeepAliveHelper.restoreView(oTargetView);
      });
    };
    _proto._getCurrentPage = function _getCurrentPage(oView) {
      const oNavContainer = this.getAppContentContainer();
      return new Promise(function (resolve) {
        const oCurrentPage = oNavContainer.getCurrentPage();
        if (oCurrentPage && oCurrentPage.getController && oCurrentPage.getController().isPlaceholder && oCurrentPage.getController().isPlaceholder()) {
          oCurrentPage.getController().attachEventOnce("targetPageInsertedInContainer", function (oEvent) {
            const oTargetPage = oEvent.getParameter("targetpage");
            const oTargetView = CommonUtils.getTargetView(oTargetPage);
            resolve(oTargetView !== oView && oTargetView);
          });
        } else {
          const oTargetView = CommonUtils.getTargetView(oCurrentPage);
          resolve(oTargetView !== oView && oTargetView);
        }
      });
    }

    /**
     * @private
     * @name sap.fe.core.rootView.NavContainer.getMetadata
     * @function
     */;
    _proto._getNavContainer = function _getNavContainer() {
      return this.getAppContentContainer();
    }

    /**
     * Gets the instanced views in the navContainer component.
     *
     * @returns {Array} Return the views.
     */;
    _proto.getInstancedViews = function getInstancedViews() {
      return this._getNavContainer().getPages().map(page => {
        if (page && page.isA("sap.ui.core.ComponentContainer")) {
          return page.getComponentInstance().getRootControl();
        } else {
          return page;
        }
      });
    }

    /**
     * Check if the FCL component is enabled.
     *
     * @function
     * @name sap.fe.core.rootView.NavContainer.controller#isFclEnabled
     * @memberof sap.fe.core.rootView.NavContainer.controller
     * @returns `false` since we are not in FCL scenario
     * @ui5-restricted
     * @final
     */;
    _proto.isFclEnabled = function isFclEnabled() {
      return false;
    };
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      // Do nothing
    }

    /**
     * Method that creates a new Page to display the IllustratedMessage containing the current error.
     *
     * @param sErrorMessage
     * @param mParameters
     * @alias sap.fe.core.rootView.NavContainer.controller#displayErrorPage
     * @returns A promise that creates a Page to display the error
     * @public
     */;
    _proto.displayErrorPage = function displayErrorPage(sErrorMessage, mParameters) {
      return new Promise((resolve, reject) => {
        try {
          const oNavContainer = this._getNavContainer();
          if (!this.oPage) {
            this.oPage = new Page({
              showHeader: false
            });
            this.oIllustratedMessage = new IllustratedMessage({
              title: sErrorMessage,
              description: mParameters.description || "",
              illustrationType: `sapIllus-${mParameters.errorType}`
            });
            this.oPage.insertContent(this.oIllustratedMessage, 0);
            oNavContainer.addPage(this.oPage);
          }
          if (mParameters.handleShellBack) {
            const oErrorOriginPage = oNavContainer.getCurrentPage(),
              oAppComponent = CommonUtils.getAppComponent(oNavContainer.getCurrentPage());
            oAppComponent.getShellServices().setBackNavigation(function () {
              oNavContainer.to(oErrorOriginPage.getId());
              oAppComponent.getShellServices().setBackNavigation();
            });
          }
          oNavContainer.attachAfterNavigate(function () {
            resolve(true);
          });
          oNavContainer.to(this.oPage.getId());
        } catch (e) {
          reject(false);
          Log.info(e);
        }
      });
    };
    return NavContainerController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return NavContainerController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZDb250YWluZXJDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlZpZXdTdGF0ZSIsIm92ZXJyaWRlIiwiYXBwbHlJbml0aWFsU3RhdGVPbmx5IiwiYWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzIiwiYUNvbnRyb2xzIiwib1ZpZXciLCJnZXRWaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwicHVzaCIsIl9nZXRDdXJyZW50UGFnZSIsImFkYXB0U3RhdGVDb250cm9scyIsImFTdGF0ZUNvbnRyb2xzIiwib25SZXN0b3JlIiwib05hdkNvbnRhaW5lciIsImdldEFwcENvbnRlbnRDb250YWluZXIiLCJvSW50ZXJuYWxNb2RlbCIsImdldE1vZGVsIiwib1BhZ2VzIiwiZ2V0UHJvcGVydHkiLCJzQ29tcG9uZW50SWQiLCJzZXRQcm9wZXJ0eSIsIm9uQ29udGFpbmVyUmVhZHkiLCJvblN1c3BlbmQiLCJvTmF2Q29udHJvbGxlciIsImFQYWdlcyIsImdldFBhZ2VzIiwiZm9yRWFjaCIsIm9QYWdlIiwib1RhcmdldFZpZXciLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJ2aWV3U3RhdGUiLCJvUGFnZVByb21pc2UiLCJ0aGVuIiwib0N1cnJlbnRQYWdlIiwiS2VlcEFsaXZlSGVscGVyIiwicmVzdG9yZVZpZXciLCJQcm9taXNlIiwicmVzb2x2ZSIsImdldEN1cnJlbnRQYWdlIiwiaXNQbGFjZWhvbGRlciIsImF0dGFjaEV2ZW50T25jZSIsIm9FdmVudCIsIm9UYXJnZXRQYWdlIiwiZ2V0UGFyYW1ldGVyIiwiX2dldE5hdkNvbnRhaW5lciIsImdldEluc3RhbmNlZFZpZXdzIiwibWFwIiwicGFnZSIsImlzQSIsImdldENvbXBvbmVudEluc3RhbmNlIiwiZ2V0Um9vdENvbnRyb2wiLCJpc0ZjbEVuYWJsZWQiLCJfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMiLCJkaXNwbGF5RXJyb3JQYWdlIiwic0Vycm9yTWVzc2FnZSIsIm1QYXJhbWV0ZXJzIiwicmVqZWN0IiwiUGFnZSIsInNob3dIZWFkZXIiLCJvSWxsdXN0cmF0ZWRNZXNzYWdlIiwiSWxsdXN0cmF0ZWRNZXNzYWdlIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImlsbHVzdHJhdGlvblR5cGUiLCJlcnJvclR5cGUiLCJpbnNlcnRDb250ZW50IiwiYWRkUGFnZSIsImhhbmRsZVNoZWxsQmFjayIsIm9FcnJvck9yaWdpblBhZ2UiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0U2hlbGxTZXJ2aWNlcyIsInNldEJhY2tOYXZpZ2F0aW9uIiwidG8iLCJnZXRJZCIsImF0dGFjaEFmdGVyTmF2aWdhdGUiLCJlIiwiTG9nIiwiaW5mbyIsIkJhc2VDb250cm9sbGVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJOYXZDb250YWluZXIuY29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHVzaW5nRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgSWxsdXN0cmF0ZWRNZXNzYWdlIGZyb20gXCJzYXAvbS9JbGx1c3RyYXRlZE1lc3NhZ2VcIjtcbmltcG9ydCB0eXBlIE5hdkNvbnRhaW5lciBmcm9tIFwic2FwL20vTmF2Q29udGFpbmVyXCI7XG5pbXBvcnQgUGFnZSBmcm9tIFwic2FwL20vUGFnZVwiO1xuaW1wb3J0IHR5cGUgQ29tcG9uZW50Q29udGFpbmVyIGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRDb250YWluZXJcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIFhNTFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9YTUxWaWV3XCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IEJhc2VDb250cm9sbGVyIGZyb20gXCIuL1Jvb3RWaWV3QmFzZUNvbnRyb2xsZXJcIjtcblxuLyoqXG4gKiBCYXNlIGNvbnRyb2xsZXIgY2xhc3MgZm9yIHlvdXIgb3duIHJvb3QgdmlldyB3aXRoIGEgc2FwLm0uTmF2Q29udGFpbmVyIGNvbnRyb2wuXG4gKlxuICogQnkgdXNpbmcgb3IgZXh0ZW5kaW5nIHRoaXMgY29udHJvbGxlciB5b3UgY2FuIHVzZSB5b3VyIG93biByb290IHZpZXcgd2l0aCB0aGUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50IGFuZFxuICogeW91IGNhbiBtYWtlIHVzZSBvZiBTQVAgRmlvcmkgZWxlbWVudHMgcGFnZXMgYW5kIFNBUCBGaW9yaSBlbGVtZW50cyBidWlsZGluZyBibG9ja3MuXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuMTA4LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUucm9vdFZpZXcuTmF2Q29udGFpbmVyXCIpXG5jbGFzcyBOYXZDb250YWluZXJDb250cm9sbGVyIGV4dGVuZHMgQmFzZUNvbnRyb2xsZXIge1xuXHRAdXNpbmdFeHRlbnNpb24oXG5cdFx0Vmlld1N0YXRlLm92ZXJyaWRlKHtcblx0XHRcdGFwcGx5SW5pdGlhbFN0YXRlT25seTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0YWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlLCBhQ29udHJvbHM6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIE5hdkNvbnRhaW5lckNvbnRyb2xsZXI7XG5cdFx0XHRcdGFDb250cm9scy5wdXNoKG9Db250cm9sbGVyLl9nZXRDdXJyZW50UGFnZShvVmlldykpO1xuXHRcdFx0fSxcblx0XHRcdGFkYXB0U3RhdGVDb250cm9sczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSwgYVN0YXRlQ29udHJvbHM6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIE5hdkNvbnRhaW5lckNvbnRyb2xsZXI7XG5cdFx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0NvbnRyb2xsZXIuX2dldEN1cnJlbnRQYWdlKG9WaWV3KSk7XG5cdFx0XHR9LFxuXHRcdFx0b25SZXN0b3JlOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlKSB7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTmF2Q29udGFpbmVyQ29udHJvbGxlcixcblx0XHRcdFx0XHRvTmF2Q29udGFpbmVyID0gb0NvbnRyb2xsZXIuZ2V0QXBwQ29udGVudENvbnRhaW5lcigpO1xuXHRcdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbCA9IG9OYXZDb250YWluZXIuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdGNvbnN0IG9QYWdlcyA9IG9JbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KFwiL3BhZ2VzXCIpO1xuXG5cdFx0XHRcdGZvciAoY29uc3Qgc0NvbXBvbmVudElkIGluIG9QYWdlcykge1xuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KGAvcGFnZXMvJHtzQ29tcG9uZW50SWR9L3Jlc3RvcmVTdGF0dXNgLCBcInBlbmRpbmdcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0NvbnRyb2xsZXIub25Db250YWluZXJSZWFkeSgpO1xuXHRcdFx0fSxcblx0XHRcdG9uU3VzcGVuZDogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHRcdG9OYXZDb250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIE5hdkNvbnRhaW5lckNvbnRyb2xsZXIsXG5cdFx0XHRcdFx0b05hdkNvbnRhaW5lciA9IG9OYXZDb250cm9sbGVyLmdldEFwcENvbnRlbnRDb250YWluZXIoKSBhcyBOYXZDb250YWluZXI7XG5cdFx0XHRcdGNvbnN0IGFQYWdlcyA9IG9OYXZDb250YWluZXIuZ2V0UGFnZXMoKTtcblx0XHRcdFx0YVBhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG9QYWdlOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0VmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1BhZ2UpO1xuXG5cdFx0XHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVGFyZ2V0VmlldyAmJiAob1RhcmdldFZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKTtcblx0XHRcdFx0XHRpZiAob0NvbnRyb2xsZXIgJiYgb0NvbnRyb2xsZXIudmlld1N0YXRlICYmIG9Db250cm9sbGVyLnZpZXdTdGF0ZS5vblN1c3BlbmQpIHtcblx0XHRcdFx0XHRcdG9Db250cm9sbGVyLnZpZXdTdGF0ZS5vblN1c3BlbmQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0dmlld1N0YXRlITogVmlld1N0YXRlO1xuXG5cdG9QYWdlPzogUGFnZTtcblxuXHRvSWxsdXN0cmF0ZWRNZXNzYWdlPzogSWxsdXN0cmF0ZWRNZXNzYWdlO1xuXG5cdG9uQ29udGFpbmVyUmVhZHkoKSB7XG5cdFx0Ly8gUmVzdG9yZSB2aWV3cyBpZiBuZWNjZXNzYXJ5LlxuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvUGFnZVByb21pc2UgPSB0aGlzLl9nZXRDdXJyZW50UGFnZShvVmlldyk7XG5cblx0XHRyZXR1cm4gb1BhZ2VQcm9taXNlLnRoZW4oZnVuY3Rpb24gKG9DdXJyZW50UGFnZTogYW55KSB7XG5cdFx0XHRjb25zdCBvVGFyZ2V0VmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob0N1cnJlbnRQYWdlKTtcblx0XHRcdHJldHVybiBLZWVwQWxpdmVIZWxwZXIucmVzdG9yZVZpZXcob1RhcmdldFZpZXcpO1xuXHRcdH0pO1xuXHR9XG5cblx0X2dldEN1cnJlbnRQYWdlKHRoaXM6IE5hdkNvbnRhaW5lckNvbnRyb2xsZXIsIG9WaWV3OiBhbnkpIHtcblx0XHRjb25zdCBvTmF2Q29udGFpbmVyID0gdGhpcy5nZXRBcHBDb250ZW50Q29udGFpbmVyKCkgYXMgTmF2Q29udGFpbmVyO1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdGNvbnN0IG9DdXJyZW50UGFnZSA9IG9OYXZDb250YWluZXIuZ2V0Q3VycmVudFBhZ2UoKSBhcyBhbnk7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9DdXJyZW50UGFnZSAmJlxuXHRcdFx0XHRvQ3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlciAmJlxuXHRcdFx0XHRvQ3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlcigpLmlzUGxhY2Vob2xkZXIgJiZcblx0XHRcdFx0b0N1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5pc1BsYWNlaG9sZGVyKClcblx0XHRcdCkge1xuXHRcdFx0XHRvQ3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlcigpLmF0dGFjaEV2ZW50T25jZShcInRhcmdldFBhZ2VJbnNlcnRlZEluQ29udGFpbmVyXCIsIGZ1bmN0aW9uIChvRXZlbnQ6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IG9UYXJnZXRQYWdlID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInRhcmdldHBhZ2VcIik7XG5cdFx0XHRcdFx0Y29uc3Qgb1RhcmdldFZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9UYXJnZXRQYWdlKTtcblx0XHRcdFx0XHRyZXNvbHZlKG9UYXJnZXRWaWV3ICE9PSBvVmlldyAmJiBvVGFyZ2V0Vmlldyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb1RhcmdldFZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9DdXJyZW50UGFnZSk7XG5cdFx0XHRcdHJlc29sdmUob1RhcmdldFZpZXcgIT09IG9WaWV3ICYmIG9UYXJnZXRWaWV3KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5OYXZDb250YWluZXIuZ2V0TWV0YWRhdGFcblx0ICogQGZ1bmN0aW9uXG5cdCAqL1xuXG5cdF9nZXROYXZDb250YWluZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXBwQ29udGVudENvbnRhaW5lcigpIGFzIE5hdkNvbnRhaW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBpbnN0YW5jZWQgdmlld3MgaW4gdGhlIG5hdkNvbnRhaW5lciBjb21wb25lbnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJuIHRoZSB2aWV3cy5cblx0ICovXG5cdGdldEluc3RhbmNlZFZpZXdzKCk6IFhNTFZpZXdbXSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldE5hdkNvbnRhaW5lcigpXG5cdFx0XHQuZ2V0UGFnZXMoKVxuXHRcdFx0Lm1hcCgocGFnZTogQ29tcG9uZW50Q29udGFpbmVyIHwgQ29udHJvbCkgPT4ge1xuXHRcdFx0XHRpZiAocGFnZSAmJiBwYWdlLmlzQTxDb21wb25lbnRDb250YWluZXI+KFwic2FwLnVpLmNvcmUuQ29tcG9uZW50Q29udGFpbmVyXCIpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBhZ2UuZ2V0Q29tcG9uZW50SW5zdGFuY2UoKS5nZXRSb290Q29udHJvbCgpIGFzIFhNTFZpZXc7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBhZ2UgYXMgWE1MVmlldztcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIEZDTCBjb21wb25lbnQgaXMgZW5hYmxlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3Lk5hdkNvbnRhaW5lci5jb250cm9sbGVyI2lzRmNsRW5hYmxlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuTmF2Q29udGFpbmVyLmNvbnRyb2xsZXJcblx0ICogQHJldHVybnMgYGZhbHNlYCBzaW5jZSB3ZSBhcmUgbm90IGluIEZDTCBzY2VuYXJpb1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRpc0ZjbEVuYWJsZWQoKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0X3Njcm9sbFRhYmxlc1RvTGFzdE5hdmlnYXRlZEl0ZW1zKCkge1xuXHRcdC8vIERvIG5vdGhpbmdcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdGhhdCBjcmVhdGVzIGEgbmV3IFBhZ2UgdG8gZGlzcGxheSB0aGUgSWxsdXN0cmF0ZWRNZXNzYWdlIGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgZXJyb3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBzRXJyb3JNZXNzYWdlXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVyc1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUucm9vdFZpZXcuTmF2Q29udGFpbmVyLmNvbnRyb2xsZXIjZGlzcGxheUVycm9yUGFnZVxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCBjcmVhdGVzIGEgUGFnZSB0byBkaXNwbGF5IHRoZSBlcnJvclxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRkaXNwbGF5RXJyb3JQYWdlKHNFcnJvck1lc3NhZ2U6IHN0cmluZywgbVBhcmFtZXRlcnM6IGFueSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZTogYW55LCByZWplY3Q6IGFueSkgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb05hdkNvbnRhaW5lciA9IHRoaXMuX2dldE5hdkNvbnRhaW5lcigpO1xuXG5cdFx0XHRcdGlmICghdGhpcy5vUGFnZSkge1xuXHRcdFx0XHRcdHRoaXMub1BhZ2UgPSBuZXcgUGFnZSh7XG5cdFx0XHRcdFx0XHRzaG93SGVhZGVyOiBmYWxzZVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0dGhpcy5vSWxsdXN0cmF0ZWRNZXNzYWdlID0gbmV3IElsbHVzdHJhdGVkTWVzc2FnZSh7XG5cdFx0XHRcdFx0XHR0aXRsZTogc0Vycm9yTWVzc2FnZSxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBtUGFyYW1ldGVycy5kZXNjcmlwdGlvbiB8fCBcIlwiLFxuXHRcdFx0XHRcdFx0aWxsdXN0cmF0aW9uVHlwZTogYHNhcElsbHVzLSR7bVBhcmFtZXRlcnMuZXJyb3JUeXBlfWBcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdHRoaXMub1BhZ2UuaW5zZXJ0Q29udGVudCh0aGlzLm9JbGx1c3RyYXRlZE1lc3NhZ2UsIDApO1xuXHRcdFx0XHRcdG9OYXZDb250YWluZXIuYWRkUGFnZSh0aGlzLm9QYWdlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChtUGFyYW1ldGVycy5oYW5kbGVTaGVsbEJhY2spIHtcblx0XHRcdFx0XHRjb25zdCBvRXJyb3JPcmlnaW5QYWdlID0gb05hdkNvbnRhaW5lci5nZXRDdXJyZW50UGFnZSgpLFxuXHRcdFx0XHRcdFx0b0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvTmF2Q29udGFpbmVyLmdldEN1cnJlbnRQYWdlKCkpO1xuXHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdChvTmF2Q29udGFpbmVyIGFzIGFueSkudG8ob0Vycm9yT3JpZ2luUGFnZS5nZXRJZCgpKTtcblx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b05hdkNvbnRhaW5lci5hdHRhY2hBZnRlck5hdmlnYXRlKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXNvbHZlKHRydWUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0b05hdkNvbnRhaW5lci50byh0aGlzLm9QYWdlLmdldElkKCkpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRyZWplY3QoZmFsc2UpO1xuXHRcdFx0XHRMb2cuaW5mbyhlIGFzIGFueSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTmF2Q29udGFpbmVyQ29udHJvbGxlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQWVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBVEEsSUFXTUEsc0JBQXNCLFdBRDNCQyxjQUFjLENBQUMsbUNBQW1DLENBQUMsVUFFbERDLGNBQWMsQ0FDZEMsU0FBUyxDQUFDQyxRQUFRLENBQUM7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
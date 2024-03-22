/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/f/FlexibleColumnLayoutSemanticHelper", "sap/f/library", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/m/Link", "sap/m/MessageBox", "sap/m/MessagePage", "./RootViewBaseController"], function (Log, FlexibleColumnLayoutSemanticHelper, fLibrary, ViewState, ClassSupport, KeepAliveHelper, Link, MessageBox, MessagePage, BaseController) {
  "use strict";

  var _dec, _dec2, _class, _class2, _descriptor;
  var Icon = MessageBox.Icon;
  var Action = MessageBox.Action;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const LayoutType = fLibrary.LayoutType;
  const CONSTANTS = {
    page: {
      names: ["BeginColumn", "MidColumn", "EndColumn"],
      currentGetter: {
        prefix: "getCurrent",
        suffix: "Page"
      },
      getter: {
        prefix: "get",
        suffix: "Pages"
      }
    }
  };
  const _getViewFromContainer = function (oContainer) {
    if (oContainer.isA("sap.ui.core.ComponentContainer")) {
      return oContainer.getComponentInstance().getRootControl();
    } else {
      return oContainer;
    }
  };
  /**
   * Base controller class for your own root view with an sap.f.FlexibleColumnLayout control.
   *
   * By using or extending this controller, you can use your own root view with the sap.fe.core.AppComponent and
   * you can make use of SAP Fiori elements pages and SAP Fiori elements building blocks.
   *
   * @hideconstructor
   * @public
   * @since 1.110.0
   */
  let FclController = (_dec = defineUI5Class("sap.fe.core.rootView.Fcl"), _dec2 = usingExtension(ViewState.override({
    applyInitialStateOnly: function () {
      return false;
    },
    adaptBindingRefreshControls: function (aControls) {
      this.getView().getController()._getAllVisibleViews().forEach(function (oChildView) {
        const pChildView = Promise.resolve(oChildView);
        aControls.push(pChildView);
      });
    },
    adaptStateControls: function (aStateControls) {
      this.getView().getController()._getAllVisibleViews().forEach(function (oChildView) {
        const pChildView = Promise.resolve(oChildView);
        aStateControls.push(pChildView);
      });
    },
    onRestore: function () {
      const fclController = this.getView().getController();
      const appContentContainer = fclController.getAppContentContainer();
      const internalModel = appContentContainer.getModel("internal");
      const pages = internalModel.getProperty("/pages");
      for (const componentId in pages) {
        internalModel.setProperty(`/pages/${componentId}/restoreStatus`, "pending");
      }
      fclController.onContainerReady();
    },
    onSuspend: function () {
      const oFCLController = this.getView().getController();
      const oFCLControl = oFCLController.getFclControl();
      const aBeginColumnPages = oFCLControl.getBeginColumnPages() || [];
      const aMidColumnPages = oFCLControl.getMidColumnPages() || [];
      const aEndColumnPages = oFCLControl.getEndColumnPages() || [];
      const aPages = [].concat(aBeginColumnPages, aMidColumnPages, aEndColumnPages);
      aPages.forEach(function (oPage) {
        const oTargetView = _getViewFromContainer(oPage);
        const oController = oTargetView && oTargetView.getController();
        if (oController && oController.viewState && oController.viewState.onSuspend) {
          oController.viewState.onSuspend();
        }
      });
    }
  })), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(FclController, _BaseController);
    function FclController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "viewState", _descriptor, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FclController.prototype;
    /**
     * @private
     * @name sap.fe.core.rootView.Fcl.getMetadata
     * @function
     */
    _proto.onInit = function onInit() {
      _BaseController.prototype.onInit.call(this);
      this._internalInit();
    };
    _proto.manageDataReceived = function manageDataReceived(event) {
      if (event.getParameter("error")) {
        var _targetedView$getBind;
        const path = event.getParameter("path"),
          targetedView = this._getAllVisibleViews().find(view => {
            var _view$getBindingConte;
            return ((_view$getBindingConte = view.getBindingContext()) === null || _view$getBindingConte === void 0 ? void 0 : _view$getBindingConte.getPath()) === path;
          });
        // We need to manage error when the request is related to a form  into an ObjectPage
        if (path && targetedView !== null && targetedView !== void 0 && (_targetedView$getBind = targetedView.getBindingContext()) !== null && _targetedView$getBind !== void 0 && _targetedView$getBind.isKeepAlive()) {
          targetedView.getController()._routing.onDataReceived(event);
        }
      }
    };
    _proto.attachRouteMatchers = function attachRouteMatchers() {
      this.getRouter().attachBeforeRouteMatched(this._getViewForNavigatedRowsComputation, this);
      _BaseController.prototype.attachRouteMatchers.call(this);
      this._internalInit();
      this.getRouter().attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
      this.getRouter().attachRouteMatched(this.onRouteMatched, this);
      this.getFclControl().attachStateChange(this._saveLayout, this);
    };
    _proto._internalInit = function _internalInit() {
      var _oRoutingConfig$confi, _oRoutingConfig$confi2;
      if (this._oRouterProxy) {
        return; // Already initialized
      }

      this.sCurrentRouteName = "";
      this.sCurrentArguments = {};
      this.SQUERYKEYNAME = "?query";
      const oAppComponent = this.getAppComponent();
      const oDataModel = this.getAppComponent().getModel();
      oDataModel === null || oDataModel === void 0 ? void 0 : oDataModel.attachEvent("dataReceived", this.manageDataReceived.bind(this));
      this._oRouterProxy = oAppComponent.getRouterProxy();

      // Get FCL configuration in the manifest
      this._oFCLConfig = {
        maxColumnsCount: 3
      };
      const oRoutingConfig = oAppComponent.getManifest()["sap.ui5"].routing;
      if (oRoutingConfig !== null && oRoutingConfig !== void 0 && (_oRoutingConfig$confi = oRoutingConfig.config) !== null && _oRoutingConfig$confi !== void 0 && _oRoutingConfig$confi.flexibleColumnLayout) {
        const oFCLManifestConfig = oRoutingConfig.config.flexibleColumnLayout;

        // Default layout for 2 columns
        if (oFCLManifestConfig.defaultTwoColumnLayoutType) {
          this._oFCLConfig.defaultTwoColumnLayoutType = oFCLManifestConfig.defaultTwoColumnLayoutType;
        }

        // Default layout for 3 columns
        if (oFCLManifestConfig.defaultThreeColumnLayoutType) {
          this._oFCLConfig.defaultThreeColumnLayoutType = oFCLManifestConfig.defaultThreeColumnLayoutType;
        }

        // Limit FCL to 2 columns ?
        if (oFCLManifestConfig.limitFCLToTwoColumns === true) {
          this._oFCLConfig.maxColumnsCount = 2;
        }
      }
      if (oRoutingConfig !== null && oRoutingConfig !== void 0 && (_oRoutingConfig$confi2 = oRoutingConfig.config) !== null && _oRoutingConfig$confi2 !== void 0 && _oRoutingConfig$confi2.controlAggregation) {
        this._oFCLConfig.defaultControlAggregation = oRoutingConfig.config.controlAggregation;
      }
      this._initializeTargetAggregation(oAppComponent);
      this._initializeRoutesInformation(oAppComponent);
      this.getFclControl().attachStateChange(this.onStateChanged, this);
      this.getFclControl().attachAfterEndColumnNavigate(this.onStateChanged, this);
    };
    _proto.getFclControl = function getFclControl() {
      return this.getAppContentContainer();
    };
    _proto._saveLayout = function _saveLayout(oEvent) {
      this.sPreviousLayout = oEvent.getParameters().layout;
    }

    /**
     * Get the additional view (on top of the visible views), to be able to compute the latest table navigated rows of
     * the most right visible view after a nav back or column fullscreen.
     *
     * @function
     * @name sap.fe.core.rootView.Fcl.controller#_getRightMostViewBeforeRouteMatched
     * @memberof sap.fe.core.rootView.Fcl.controller
     */;
    _proto._getViewForNavigatedRowsComputation = function _getViewForNavigatedRowsComputation() {
      const aAllVisibleViewsBeforeRouteMatched = this._getAllVisibleViews(this.sPreviousLayout);
      const oRightMostViewBeforeRouteMatched = aAllVisibleViewsBeforeRouteMatched[aAllVisibleViewsBeforeRouteMatched.length - 1];
      let oRightMostView;
      this.getRouter().attachEventOnce("routeMatched", oEvent => {
        oRightMostView = _getViewFromContainer(oEvent.getParameter("views")[oEvent.getParameter("views").length - 1]);
        if (oRightMostViewBeforeRouteMatched) {
          // Navigation forward from L2 to view level L3 (FullScreenLayout):
          if (oRightMostView.getViewData() && oRightMostView.getViewData().viewLevel === this._oFCLConfig.maxColumnsCount) {
            this.oAdditionalViewForNavRowsComputation = oRightMostView;
          }
          // Navigations backward from L3 down to L2, L1, L0 (ThreeColumn layout):
          if (oRightMostView.getViewData() && oRightMostViewBeforeRouteMatched.getViewData() && oRightMostViewBeforeRouteMatched.getViewData().viewLevel < this._oFCLConfig.maxColumnsCount && oRightMostViewBeforeRouteMatched.getViewData() && oRightMostViewBeforeRouteMatched.getViewData().viewLevel > oRightMostView.getViewData().viewLevel && oRightMostView !== oRightMostViewBeforeRouteMatched) {
            this.oAdditionalViewForNavRowsComputation = oRightMostViewBeforeRouteMatched;
          }
        }
      });
    };
    _proto.getViewForNavigatedRowsComputation = function getViewForNavigatedRowsComputation() {
      return this.oAdditionalViewForNavRowsComputation;
    };
    _proto.onExit = function onExit() {
      this.getRouter().detachRouteMatched(this.onRouteMatched, this);
      this.getRouter().detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
      this.getFclControl().detachStateChange(this.onStateChanged, this);
      this.getFclControl().detachAfterEndColumnNavigate(this.onStateChanged, this);
      this._oTargetsAggregation = null;
      this._oTargetsFromRoutePattern = null;
      BaseController.prototype.onExit.bind(this)();
    }

    /**
     * Check if the FCL component is enabled.
     *
     * @function
     * @name sap.fe.core.rootView.Fcl.controller#isFclEnabled
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @returns `true` since we are in FCL scenario
     * @ui5-restricted
     * @final
     */;
    _proto.isFclEnabled = function isFclEnabled() {
      return true;
    }

    /**
     * Method that creates a new Page to display the IllustratedMessage containing the current error.
     *
     * @param sErrorMessage
     * @param mParameters
     * @alias sap.fe.core.rootView.Fcl.controller#displayErrorPage
     * @returns A promise that creates a Page to display the error
     * @public
     */;
    _proto.displayErrorPage = function displayErrorPage(sErrorMessage, mParameters) {
      const oFCLControl = this.getFclControl();
      if (this._oFCLConfig && mParameters.FCLLevel >= this._oFCLConfig.maxColumnsCount) {
        mParameters.FCLLevel = this._oFCLConfig.maxColumnsCount - 1;
      }
      if (!this.aMessagePages) {
        this.aMessagePages = [null, null, null];
      }
      let oMessagePage = this.aMessagePages[mParameters.FCLLevel];
      if (!oMessagePage) {
        oMessagePage = new MessagePage({
          showHeader: false,
          icon: "sap-icon://message-error"
        });
        this.aMessagePages[mParameters.FCLLevel] = oMessagePage;
        switch (mParameters.FCLLevel) {
          case 0:
            oFCLControl.addBeginColumnPage(oMessagePage);
            break;
          case 1:
            oFCLControl.addMidColumnPage(oMessagePage);
            break;
          default:
            oFCLControl.addEndColumnPage(oMessagePage);
        }
      }
      oMessagePage.setText(sErrorMessage);
      if (mParameters.technicalMessage) {
        oMessagePage.setCustomDescription(new Link({
          text: mParameters.description || mParameters.technicalMessage,
          press: function () {
            MessageBox.show(mParameters.technicalMessage, {
              icon: Icon.ERROR,
              title: mParameters.title,
              actions: [Action.OK],
              defaultAction: Action.OK,
              details: mParameters.technicalDetails || "",
              contentWidth: "60%"
            });
          }
        }));
      } else {
        oMessagePage.setDescription(mParameters.description || "");
      }
      oFCLControl.to(oMessagePage.getId());
      return Promise.resolve(true);
    }

    /**
     * Initialize the object _oTargetsAggregation that defines for each route the relevant aggregation and pattern.
     *
     * @name sap.fe.core.rootView.Fcl.controller#_initializeTargetAggregation
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @function
     * @param [oAppComponent] Reference to the AppComponent
     */;
    _proto._initializeTargetAggregation = function _initializeTargetAggregation(oAppComponent) {
      const oManifest = oAppComponent.getManifest(),
        oTargets = oManifest["sap.ui5"].routing ? oManifest["sap.ui5"].routing.targets : null;
      this._oTargetsAggregation = {};
      if (oTargets) {
        Object.keys(oTargets).forEach(sTargetName => {
          const oTarget = oTargets[sTargetName];
          if (oTarget.controlAggregation) {
            this._oTargetsAggregation[sTargetName] = {
              aggregation: oTarget.controlAggregation,
              pattern: oTarget.contextPattern
            };
          } else {
            this._oTargetsAggregation[sTargetName] = {
              aggregation: "page",
              pattern: null
            };
          }
        });
      }
    }

    /**
     * Initializes the mapping between a route (identifed as its pattern) and the corresponding targets
     *
     * @name sap.fe.core.rootView.Fcl.controller#_initializeRoutesInformation
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @function
     * @param oAppComponent ref to the AppComponent
     */;
    _proto._initializeRoutesInformation = function _initializeRoutesInformation(oAppComponent) {
      const oManifest = oAppComponent.getManifest(),
        aRoutes = oManifest["sap.ui5"].routing ? oManifest["sap.ui5"].routing.routes : null;
      this._oTargetsFromRoutePattern = {};
      if (aRoutes) {
        aRoutes.forEach(route => {
          this._oTargetsFromRoutePattern[route.pattern] = route.target;
        });
      }
    };
    _proto.getCurrentArgument = function getCurrentArgument() {
      return this.sCurrentArguments;
    };
    _proto.getCurrentRouteName = function getCurrentRouteName() {
      return this.sCurrentRouteName;
    }

    /**
     * Get FE FCL constant.
     *
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @returns The constants
     */;
    _proto.getConstants = function getConstants() {
      return CONSTANTS;
    }

    /**
     * Getter for oTargetsAggregation array.
     *
     * @name sap.fe.core.rootView.Fcl.controller#getTargetAggregation
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @function
     * @returns The _oTargetsAggregation array
     * @ui5-restricted
     */;
    _proto.getTargetAggregation = function getTargetAggregation() {
      return this._oTargetsAggregation;
    }

    /**
     * Function triggered by the router RouteMatched event.
     *
     * @name sap.fe.core.rootView.Fcl.controller#onRouteMatched
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto.onRouteMatched = function onRouteMatched(oEvent) {
      const sRouteName = oEvent.getParameter("name");

      // Save the current/previous routes and arguments
      this.sCurrentRouteName = sRouteName;
      this.sCurrentArguments = oEvent.getParameter("arguments");
    }

    /**
     * This function is triggering the table scroll to the navigated row after each layout change.
     *
     * @name sap.fe.core.rootView.Fcl.controller#scrollToLastSelectedItem
     * @memberof sap.fe.core.rootView.Fcl.controller
     */;
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      const aViews = this._getAllVisibleViews();
      //The scrolls are triggered only if the layout is with several columns or when switching the mostRight column in full screen
      if (aViews.length > 1 || aViews[0].getViewData().viewLevel < this._oFCLConfig.maxColumnsCount) {
        let sCurrentViewPath;
        const oAdditionalView = this.getViewForNavigatedRowsComputation();
        if (oAdditionalView && aViews.indexOf(oAdditionalView) === -1) {
          aViews.push(oAdditionalView);
        }
        for (let index = aViews.length - 1; index > 0; index--) {
          const oView = aViews[index],
            oPreviousView = aViews[index - 1];
          if (oView.getBindingContext()) {
            sCurrentViewPath = oView.getBindingContext().getPath();
            oPreviousView.getController()._scrollTablesToRow(sCurrentViewPath);
          }
        }
      }
    }

    /**
     * Function triggered by the FCL StateChanged event.
     *
     * @name sap.fe.core.rootView.Fcl.controller#onStateChanged
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto.onStateChanged = function onStateChanged(oEvent) {
      const bIsNavigationArrow = oEvent.getParameter("isNavigationArrow");
      if (this.sCurrentArguments !== undefined) {
        if (!this.sCurrentArguments[this.SQUERYKEYNAME]) {
          this.sCurrentArguments[this.SQUERYKEYNAME] = {};
        }
        this.sCurrentArguments[this.SQUERYKEYNAME].layout = oEvent.getParameter("layout");
      }
      this._forceModelContextChangeOnBreadCrumbs(oEvent);

      // Replace the URL with the new layout if a navigation arrow was used
      if (bIsNavigationArrow) {
        this._oRouterProxy.navTo(this.sCurrentRouteName, this.sCurrentArguments);
      }
      const oView = this.getRightmostView();
      if (oView) {
        this._computeTitleHierarchy(oView);
      }
    }

    /**
     * Function to fire ModelContextChange event on all breadcrumbs ( on each ObjectPages).
     *
     * @name sap.fe.core.rootView.Fcl.controller#_forceModelContextChangeOnBreadCrumbs
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto._forceModelContextChangeOnBreadCrumbs = function _forceModelContextChangeOnBreadCrumbs(oEvent) {
      //force modelcontextchange on ObjectPages to refresh the breadcrumbs link hrefs
      const oFcl = oEvent.getSource();
      let oPages = [];
      oPages = oPages.concat(oFcl.getBeginColumnPages()).concat(oFcl.getMidColumnPages()).concat(oFcl.getEndColumnPages());
      oPages.forEach(function (oPage) {
        const oView = _getViewFromContainer(oPage);
        const oBreadCrumbs = oView.byId && oView.byId("breadcrumbs");
        if (oBreadCrumbs) {
          oBreadCrumbs.fireModelContextChange();
        }
      });
    }

    /**
     * Function triggered to update the Share button Visibility.
     *
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param viewColumn Name of the current column ("beginColumn", "midColumn", "endColumn")
     * @param sLayout The current layout used by the FCL
     * @returns The share button visibility
     */;
    _proto._updateShareButtonVisibility = function _updateShareButtonVisibility(viewColumn, sLayout) {
      let bShowShareIcon;
      switch (sLayout) {
        case "OneColumn":
          bShowShareIcon = viewColumn === "beginColumn";
          break;
        case "MidColumnFullScreen":
        case "ThreeColumnsBeginExpandedEndHidden":
        case "ThreeColumnsMidExpandedEndHidden":
        case "TwoColumnsBeginExpanded":
        case "TwoColumnsMidExpanded":
          bShowShareIcon = viewColumn === "midColumn";
          break;
        case "EndColumnFullScreen":
        case "ThreeColumnsEndExpanded":
        case "ThreeColumnsMidExpanded":
          bShowShareIcon = viewColumn === "endColumn";
          break;
        default:
          bShowShareIcon = false;
      }
      return bShowShareIcon;
    };
    _proto._updateEditButtonVisiblity = function _updateEditButtonVisiblity(viewColumn, sLayout) {
      let bEditButtonVisible = true;
      switch (viewColumn) {
        case "midColumn":
          switch (sLayout) {
            case "TwoColumnsMidExpanded":
            case "ThreeColumnsMidExpanded":
            case "ThreeColumnsEndExpanded":
              bEditButtonVisible = false;
              break;
          }
          break;
        case "endColumn":
          switch (sLayout) {
            case "ThreeColumnsMidExpanded":
            case "ThreeColumnsEndExpanded":
              bEditButtonVisible = false;
          }
          break;
      }
      return bEditButtonVisible;
    };
    _proto.updateUIStateForView = function updateUIStateForView(oView, FCLLevel) {
      const oUIState = this.getHelper().getCurrentUIState(),
        oFclColName = ["beginColumn", "midColumn", "endColumn"],
        sLayout = this.getFclControl().getLayout();
      let viewColumn;
      if (!oView.getModel("fclhelper")) {
        oView.setModel(this._createHelperModel(), "fclhelper");
      }
      if (FCLLevel >= this._oFCLConfig.maxColumnsCount) {
        // The view is on a level > max number of columns. It's always fullscreen without close/exit buttons
        viewColumn = oFclColName[this._oFCLConfig.maxColumnsCount - 1];
        oUIState.actionButtonsInfo.midColumn.fullScreen = null;
        oUIState.actionButtonsInfo.midColumn.exitFullScreen = null;
        oUIState.actionButtonsInfo.midColumn.closeColumn = null;
        oUIState.actionButtonsInfo.endColumn.exitFullScreen = null;
        oUIState.actionButtonsInfo.endColumn.fullScreen = null;
        oUIState.actionButtonsInfo.endColumn.closeColumn = null;
      } else {
        viewColumn = oFclColName[FCLLevel];
      }
      if (FCLLevel >= this._oFCLConfig.maxColumnsCount || sLayout === "EndColumnFullScreen" || sLayout === "MidColumnFullScreen" || sLayout === "OneColumn") {
        oView.getModel("fclhelper").setProperty("/breadCrumbIsVisible", true);
      } else {
        oView.getModel("fclhelper").setProperty("/breadCrumbIsVisible", false);
      }
      // Unfortunately, the FCLHelper doesn't provide actionButton values for the first column
      // so we have to add this info manually
      oUIState.actionButtonsInfo.beginColumn = {
        fullScreen: null,
        exitFullScreen: null,
        closeColumn: null
      };
      const oActionButtonInfos = Object.assign({}, oUIState.actionButtonsInfo[viewColumn]);
      oActionButtonInfos.switchVisible = oActionButtonInfos.fullScreen !== null || oActionButtonInfos.exitFullScreen !== null;
      oActionButtonInfos.switchIcon = oActionButtonInfos.fullScreen !== null ? "sap-icon://full-screen" : "sap-icon://exit-full-screen";
      oActionButtonInfos.isFullScreen = oActionButtonInfos.fullScreen === null;
      oActionButtonInfos.closeVisible = oActionButtonInfos.closeColumn !== null;
      oView.getModel("fclhelper").setProperty("/actionButtonsInfo", oActionButtonInfos);
      oView.getModel("fclhelper").setProperty("/showEditButton", this._updateEditButtonVisiblity(viewColumn, sLayout));
      oView.getModel("fclhelper").setProperty("/showShareIcon", this._updateShareButtonVisibility(viewColumn, sLayout));
    }

    /**
     * Function triggered by the router BeforeRouteMatched event.
     *
     * @name sap.fe.core.rootView.Fcl.controller#onBeforeRouteMatched
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @param oEvent
     */;
    _proto.onBeforeRouteMatched = function onBeforeRouteMatched(oEvent) {
      if (oEvent) {
        const oQueryParams = oEvent.getParameters().arguments[this.SQUERYKEYNAME];
        let sLayout = oQueryParams ? oQueryParams.layout : null;

        // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
        if (!sLayout) {
          const oNextUIState = this.getHelper().getNextUIState(0);
          sLayout = oNextUIState.layout;
        }

        // Check if the layout if compatible with the number of targets
        // This should always be the case for normal navigation, just needed in case
        // the URL has been manually modified
        const aTargets = oEvent.getParameter("config").target;
        sLayout = this._correctLayoutForTargets(sLayout, aTargets);

        // Update the layout of the FlexibleColumnLayout
        if (sLayout) {
          this.getFclControl().setLayout(sLayout);
        }
      }
    }

    /**
     * Helper for the FCL Component.
     *
     * @name sap.fe.core.rootView.Fcl.controller#getHelper
     * @memberof sap.fe.core.rootView.Fcl.controller
     * @returns Instance of a semantic helper
     */;
    _proto.getHelper = function getHelper() {
      return FlexibleColumnLayoutSemanticHelper.getInstanceFor(this.getFclControl(), this._oFCLConfig);
    }

    /**
     * Calculates the FCL layout for a given FCL level and a target hash.
     *
     * @param iNextFCLLevel FCL level to be navigated to
     * @param sHash The hash to be navigated to
     * @param sProposedLayout The proposed layout
     * @param keepCurrentLayout True if we want to keep the current layout if possible
     * @returns The calculated layout
     */;
    _proto.calculateLayout = function calculateLayout(iNextFCLLevel, sHash, sProposedLayout) {
      let keepCurrentLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      // First, ask the FCL helper to calculate the layout if nothing is proposed
      if (!sProposedLayout) {
        sProposedLayout = keepCurrentLayout ? this.getFclControl().getLayout() : this.getHelper().getNextUIState(iNextFCLLevel).layout;
      }

      // Then change this value if necessary, based on the number of targets
      const oRoute = this.getRouter().getRouteByHash(`${sHash}?layout=${sProposedLayout}`);
      const aTargets = this._oTargetsFromRoutePattern[oRoute.getPattern()];
      return this._correctLayoutForTargets(sProposedLayout, aTargets);
    }

    /**
     * Checks whether a given FCL layout is compatible with an array of targets.
     *
     * @param sProposedLayout Proposed value for the FCL layout
     * @param aTargets Array of target names used for checking
     * @returns The corrected layout
     */;
    _proto._correctLayoutForTargets = function _correctLayoutForTargets(sProposedLayout, aTargets) {
      const allAllowedLayouts = {
        "2": ["TwoColumnsMidExpanded", "TwoColumnsBeginExpanded", "MidColumnFullScreen"],
        "3": ["ThreeColumnsMidExpanded", "ThreeColumnsEndExpanded", "ThreeColumnsMidExpandedEndHidden", "ThreeColumnsBeginExpandedEndHidden", "MidColumnFullScreen", "EndColumnFullScreen"]
      };
      if (aTargets && !Array.isArray(aTargets)) {
        // To support single target as a string in the manifest
        aTargets = [aTargets];
      }
      if (!aTargets) {
        // Defensive, just in case...
        return sProposedLayout;
      } else if (aTargets.length > 1) {
        // More than 1 target: just simply check from the allowed values
        const aLayouts = allAllowedLayouts[aTargets.length];
        if (aLayouts.indexOf(sProposedLayout) < 0) {
          // The proposed layout isn't compatible with the number of columns
          // --> Ask the helper for the default layout for the number of columns
          sProposedLayout = aLayouts[0];
        }
      } else {
        // Only one target
        const sTargetAggregation = this.getTargetAggregation()[aTargets[0]].aggregation || this._oFCLConfig.defaultControlAggregation;
        switch (sTargetAggregation) {
          case "beginColumnPages":
            sProposedLayout = "OneColumn";
            break;
          case "midColumnPages":
            sProposedLayout = "MidColumnFullScreen";
            break;
          case "endColumnPages":
            sProposedLayout = "EndColumnFullScreen";
            break;
          // no default
        }
      }

      return sProposedLayout;
    }

    /**
     * Gets the instanced views in the FCL component.
     *
     * @returns {Array} Return the views.
     */;
    _proto.getInstancedViews = function getInstancedViews() {
      const fclControl = this.getFclControl();
      const componentContainers = [...fclControl.getBeginColumnPages(), ...fclControl.getMidColumnPages(), ...fclControl.getEndColumnPages()];
      return componentContainers.map(oPage => {
        if (oPage && oPage.isA("sap.ui.core.ComponentContainer")) {
          return oPage.getComponentInstance().getRootControl();
        } else {
          return oPage;
        }
      });
    }

    /**
     * get all visible views in the FCL component.
     * sLayout optional parameter is very specific as part of the calculation of the latest navigated row
     *
     * @param {*} sLayout Layout that was applied just before the current navigation
     * @returns {Array} return views
     */;
    _proto._getAllVisibleViews = function _getAllVisibleViews(sLayout) {
      const aViews = [];
      sLayout = sLayout ? sLayout : this.getFclControl().getLayout();
      switch (sLayout) {
        case LayoutType.EndColumnFullScreen:
          if (this.getFclControl().getCurrentEndColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
          }
          break;
        case LayoutType.MidColumnFullScreen:
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          break;
        case LayoutType.OneColumn:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          break;
        case LayoutType.ThreeColumnsEndExpanded:
        case LayoutType.ThreeColumnsMidExpanded:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          if (this.getFclControl().getCurrentEndColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
          }
          break;
        case LayoutType.TwoColumnsBeginExpanded:
        case LayoutType.TwoColumnsMidExpanded:
        case LayoutType.ThreeColumnsMidExpandedEndHidden:
        case LayoutType.ThreeColumnsBeginExpandedEndHidden:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          break;
        default:
          Log.error(`Unhandled switch case for ${this.getFclControl().getLayout()}`);
      }
      return aViews;
    };
    _proto._getAllViews = function _getAllViews(sLayout) {
      const aViews = [];
      sLayout = sLayout ? sLayout : this.getFclControl().getLayout();
      switch (sLayout) {
        case LayoutType.OneColumn:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          break;
        case LayoutType.ThreeColumnsEndExpanded:
        case LayoutType.ThreeColumnsMidExpanded:
        case LayoutType.ThreeColumnsMidExpandedEndHidden:
        case LayoutType.ThreeColumnsBeginExpandedEndHidden:
        case LayoutType.EndColumnFullScreen:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          if (this.getFclControl().getCurrentEndColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
          }
          break;
        case LayoutType.TwoColumnsBeginExpanded:
        case LayoutType.TwoColumnsMidExpanded:
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          break;
        case LayoutType.MidColumnFullScreen:
          // In this case we need to determine if this mid column fullscreen comes from a 2 or a 3 column layout
          const sLayoutWhenExitFullScreen = this.getHelper().getCurrentUIState().actionButtonsInfo.midColumn.exitFullScreen;
          if (this.getFclControl().getCurrentBeginColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentBeginColumnPage()));
          }
          if (this.getFclControl().getCurrentMidColumnPage()) {
            aViews.push(_getViewFromContainer(this.getFclControl().getCurrentMidColumnPage()));
          }
          if (sLayoutWhenExitFullScreen.indexOf("ThreeColumn") >= 0) {
            // We come from a 3 column layout
            if (this.getFclControl().getCurrentEndColumnPage()) {
              aViews.push(_getViewFromContainer(this.getFclControl().getCurrentEndColumnPage()));
            }
          }
          break;
        default:
          Log.error(`Unhandled switch case for ${this.getFclControl().getLayout()}`);
      }
      return aViews;
    };
    _proto.onContainerReady = function onContainerReady() {
      // Restore views if neccessary.
      const aViews = this._getAllVisibleViews();
      const aRestorePromises = aViews.reduce(function (aPromises, oTargetView) {
        aPromises.push(KeepAliveHelper.restoreView(oTargetView));
        return aPromises;
      }, []);
      return Promise.all(aRestorePromises);
    };
    _proto.getRightmostContext = function getRightmostContext() {
      const oView = this.getRightmostView();
      return oView && oView.getBindingContext();
    };
    _proto.getRightmostView = function getRightmostView() {
      return this._getAllViews().pop();
    };
    _proto.isContextUsedInPages = function isContextUsedInPages(oContext) {
      if (!this.getFclControl()) {
        return false;
      }
      const aAllVisibleViews = this._getAllViews();
      for (const view of aAllVisibleViews) {
        if (view) {
          if (view.getBindingContext() === oContext) {
            return true;
          }
        } else {
          // A view has been destroyed --> app is currently being destroyed
          return false;
        }
      }
      return false;
    };
    _proto._setShellMenuTitle = function _setShellMenuTitle(oAppComponent, sTitle, sAppTitle) {
      if (this.getHelper().getCurrentUIState().isFullScreen !== true) {
        oAppComponent.getShellServices().setTitle(sAppTitle);
      } else {
        oAppComponent.getShellServices().setTitle(sTitle);
      }
    };
    return FclController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FclController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMYXlvdXRUeXBlIiwiZkxpYnJhcnkiLCJDT05TVEFOVFMiLCJwYWdlIiwibmFtZXMiLCJjdXJyZW50R2V0dGVyIiwicHJlZml4Iiwic3VmZml4IiwiZ2V0dGVyIiwiX2dldFZpZXdGcm9tQ29udGFpbmVyIiwib0NvbnRhaW5lciIsImlzQSIsImdldENvbXBvbmVudEluc3RhbmNlIiwiZ2V0Um9vdENvbnRyb2wiLCJGY2xDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlZpZXdTdGF0ZSIsIm92ZXJyaWRlIiwiYXBwbHlJbml0aWFsU3RhdGVPbmx5IiwiYWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzIiwiYUNvbnRyb2xzIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfZ2V0QWxsVmlzaWJsZVZpZXdzIiwiZm9yRWFjaCIsIm9DaGlsZFZpZXciLCJwQ2hpbGRWaWV3IiwiUHJvbWlzZSIsInJlc29sdmUiLCJwdXNoIiwiYWRhcHRTdGF0ZUNvbnRyb2xzIiwiYVN0YXRlQ29udHJvbHMiLCJvblJlc3RvcmUiLCJmY2xDb250cm9sbGVyIiwiYXBwQ29udGVudENvbnRhaW5lciIsImdldEFwcENvbnRlbnRDb250YWluZXIiLCJpbnRlcm5hbE1vZGVsIiwiZ2V0TW9kZWwiLCJwYWdlcyIsImdldFByb3BlcnR5IiwiY29tcG9uZW50SWQiLCJzZXRQcm9wZXJ0eSIsIm9uQ29udGFpbmVyUmVhZHkiLCJvblN1c3BlbmQiLCJvRkNMQ29udHJvbGxlciIsIm9GQ0xDb250cm9sIiwiZ2V0RmNsQ29udHJvbCIsImFCZWdpbkNvbHVtblBhZ2VzIiwiZ2V0QmVnaW5Db2x1bW5QYWdlcyIsImFNaWRDb2x1bW5QYWdlcyIsImdldE1pZENvbHVtblBhZ2VzIiwiYUVuZENvbHVtblBhZ2VzIiwiZ2V0RW5kQ29sdW1uUGFnZXMiLCJhUGFnZXMiLCJjb25jYXQiLCJvUGFnZSIsIm9UYXJnZXRWaWV3Iiwib0NvbnRyb2xsZXIiLCJ2aWV3U3RhdGUiLCJvbkluaXQiLCJfaW50ZXJuYWxJbml0IiwibWFuYWdlRGF0YVJlY2VpdmVkIiwiZXZlbnQiLCJnZXRQYXJhbWV0ZXIiLCJwYXRoIiwidGFyZ2V0ZWRWaWV3IiwiZmluZCIsInZpZXciLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldFBhdGgiLCJpc0tlZXBBbGl2ZSIsIl9yb3V0aW5nIiwib25EYXRhUmVjZWl2ZWQiLCJhdHRhY2hSb3V0ZU1hdGNoZXJzIiwiZ2V0Um91dGVyIiwiYXR0YWNoQmVmb3JlUm91dGVNYXRjaGVkIiwiX2dldFZpZXdGb3JOYXZpZ2F0ZWRSb3dzQ29tcHV0YXRpb24iLCJvbkJlZm9yZVJvdXRlTWF0Y2hlZCIsImF0dGFjaFJvdXRlTWF0Y2hlZCIsIm9uUm91dGVNYXRjaGVkIiwiYXR0YWNoU3RhdGVDaGFuZ2UiLCJfc2F2ZUxheW91dCIsIl9vUm91dGVyUHJveHkiLCJzQ3VycmVudFJvdXRlTmFtZSIsInNDdXJyZW50QXJndW1lbnRzIiwiU1FVRVJZS0VZTkFNRSIsIm9BcHBDb21wb25lbnQiLCJnZXRBcHBDb21wb25lbnQiLCJvRGF0YU1vZGVsIiwiYXR0YWNoRXZlbnQiLCJiaW5kIiwiZ2V0Um91dGVyUHJveHkiLCJfb0ZDTENvbmZpZyIsIm1heENvbHVtbnNDb3VudCIsIm9Sb3V0aW5nQ29uZmlnIiwiZ2V0TWFuaWZlc3QiLCJyb3V0aW5nIiwiY29uZmlnIiwiZmxleGlibGVDb2x1bW5MYXlvdXQiLCJvRkNMTWFuaWZlc3RDb25maWciLCJkZWZhdWx0VHdvQ29sdW1uTGF5b3V0VHlwZSIsImRlZmF1bHRUaHJlZUNvbHVtbkxheW91dFR5cGUiLCJsaW1pdEZDTFRvVHdvQ29sdW1ucyIsImNvbnRyb2xBZ2dyZWdhdGlvbiIsImRlZmF1bHRDb250cm9sQWdncmVnYXRpb24iLCJfaW5pdGlhbGl6ZVRhcmdldEFnZ3JlZ2F0aW9uIiwiX2luaXRpYWxpemVSb3V0ZXNJbmZvcm1hdGlvbiIsIm9uU3RhdGVDaGFuZ2VkIiwiYXR0YWNoQWZ0ZXJFbmRDb2x1bW5OYXZpZ2F0ZSIsIm9FdmVudCIsInNQcmV2aW91c0xheW91dCIsImdldFBhcmFtZXRlcnMiLCJsYXlvdXQiLCJhQWxsVmlzaWJsZVZpZXdzQmVmb3JlUm91dGVNYXRjaGVkIiwib1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWQiLCJsZW5ndGgiLCJvUmlnaHRNb3N0VmlldyIsImF0dGFjaEV2ZW50T25jZSIsImdldFZpZXdEYXRhIiwidmlld0xldmVsIiwib0FkZGl0aW9uYWxWaWV3Rm9yTmF2Um93c0NvbXB1dGF0aW9uIiwiZ2V0Vmlld0Zvck5hdmlnYXRlZFJvd3NDb21wdXRhdGlvbiIsIm9uRXhpdCIsImRldGFjaFJvdXRlTWF0Y2hlZCIsImRldGFjaEJlZm9yZVJvdXRlTWF0Y2hlZCIsImRldGFjaFN0YXRlQ2hhbmdlIiwiZGV0YWNoQWZ0ZXJFbmRDb2x1bW5OYXZpZ2F0ZSIsIl9vVGFyZ2V0c0FnZ3JlZ2F0aW9uIiwiX29UYXJnZXRzRnJvbVJvdXRlUGF0dGVybiIsIkJhc2VDb250cm9sbGVyIiwicHJvdG90eXBlIiwiaXNGY2xFbmFibGVkIiwiZGlzcGxheUVycm9yUGFnZSIsInNFcnJvck1lc3NhZ2UiLCJtUGFyYW1ldGVycyIsIkZDTExldmVsIiwiYU1lc3NhZ2VQYWdlcyIsIm9NZXNzYWdlUGFnZSIsIk1lc3NhZ2VQYWdlIiwic2hvd0hlYWRlciIsImljb24iLCJhZGRCZWdpbkNvbHVtblBhZ2UiLCJhZGRNaWRDb2x1bW5QYWdlIiwiYWRkRW5kQ29sdW1uUGFnZSIsInNldFRleHQiLCJ0ZWNobmljYWxNZXNzYWdlIiwic2V0Q3VzdG9tRGVzY3JpcHRpb24iLCJMaW5rIiwidGV4dCIsImRlc2NyaXB0aW9uIiwicHJlc3MiLCJNZXNzYWdlQm94Iiwic2hvdyIsIkljb24iLCJFUlJPUiIsInRpdGxlIiwiYWN0aW9ucyIsIkFjdGlvbiIsIk9LIiwiZGVmYXVsdEFjdGlvbiIsImRldGFpbHMiLCJ0ZWNobmljYWxEZXRhaWxzIiwiY29udGVudFdpZHRoIiwic2V0RGVzY3JpcHRpb24iLCJ0byIsImdldElkIiwib01hbmlmZXN0Iiwib1RhcmdldHMiLCJ0YXJnZXRzIiwiT2JqZWN0Iiwia2V5cyIsInNUYXJnZXROYW1lIiwib1RhcmdldCIsImFnZ3JlZ2F0aW9uIiwicGF0dGVybiIsImNvbnRleHRQYXR0ZXJuIiwiYVJvdXRlcyIsInJvdXRlcyIsInJvdXRlIiwidGFyZ2V0IiwiZ2V0Q3VycmVudEFyZ3VtZW50IiwiZ2V0Q3VycmVudFJvdXRlTmFtZSIsImdldENvbnN0YW50cyIsImdldFRhcmdldEFnZ3JlZ2F0aW9uIiwic1JvdXRlTmFtZSIsIl9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcyIsImFWaWV3cyIsInNDdXJyZW50Vmlld1BhdGgiLCJvQWRkaXRpb25hbFZpZXciLCJpbmRleE9mIiwiaW5kZXgiLCJvVmlldyIsIm9QcmV2aW91c1ZpZXciLCJfc2Nyb2xsVGFibGVzVG9Sb3ciLCJiSXNOYXZpZ2F0aW9uQXJyb3ciLCJ1bmRlZmluZWQiLCJfZm9yY2VNb2RlbENvbnRleHRDaGFuZ2VPbkJyZWFkQ3J1bWJzIiwibmF2VG8iLCJnZXRSaWdodG1vc3RWaWV3IiwiX2NvbXB1dGVUaXRsZUhpZXJhcmNoeSIsIm9GY2wiLCJnZXRTb3VyY2UiLCJvUGFnZXMiLCJvQnJlYWRDcnVtYnMiLCJieUlkIiwiZmlyZU1vZGVsQ29udGV4dENoYW5nZSIsIl91cGRhdGVTaGFyZUJ1dHRvblZpc2liaWxpdHkiLCJ2aWV3Q29sdW1uIiwic0xheW91dCIsImJTaG93U2hhcmVJY29uIiwiX3VwZGF0ZUVkaXRCdXR0b25WaXNpYmxpdHkiLCJiRWRpdEJ1dHRvblZpc2libGUiLCJ1cGRhdGVVSVN0YXRlRm9yVmlldyIsIm9VSVN0YXRlIiwiZ2V0SGVscGVyIiwiZ2V0Q3VycmVudFVJU3RhdGUiLCJvRmNsQ29sTmFtZSIsImdldExheW91dCIsInNldE1vZGVsIiwiX2NyZWF0ZUhlbHBlck1vZGVsIiwiYWN0aW9uQnV0dG9uc0luZm8iLCJtaWRDb2x1bW4iLCJmdWxsU2NyZWVuIiwiZXhpdEZ1bGxTY3JlZW4iLCJjbG9zZUNvbHVtbiIsImVuZENvbHVtbiIsImJlZ2luQ29sdW1uIiwib0FjdGlvbkJ1dHRvbkluZm9zIiwiYXNzaWduIiwic3dpdGNoVmlzaWJsZSIsInN3aXRjaEljb24iLCJpc0Z1bGxTY3JlZW4iLCJjbG9zZVZpc2libGUiLCJvUXVlcnlQYXJhbXMiLCJhcmd1bWVudHMiLCJvTmV4dFVJU3RhdGUiLCJnZXROZXh0VUlTdGF0ZSIsImFUYXJnZXRzIiwiX2NvcnJlY3RMYXlvdXRGb3JUYXJnZXRzIiwic2V0TGF5b3V0IiwiRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlciIsImdldEluc3RhbmNlRm9yIiwiY2FsY3VsYXRlTGF5b3V0IiwiaU5leHRGQ0xMZXZlbCIsInNIYXNoIiwic1Byb3Bvc2VkTGF5b3V0Iiwia2VlcEN1cnJlbnRMYXlvdXQiLCJvUm91dGUiLCJnZXRSb3V0ZUJ5SGFzaCIsImdldFBhdHRlcm4iLCJhbGxBbGxvd2VkTGF5b3V0cyIsIkFycmF5IiwiaXNBcnJheSIsImFMYXlvdXRzIiwic1RhcmdldEFnZ3JlZ2F0aW9uIiwiZ2V0SW5zdGFuY2VkVmlld3MiLCJmY2xDb250cm9sIiwiY29tcG9uZW50Q29udGFpbmVycyIsIm1hcCIsIkVuZENvbHVtbkZ1bGxTY3JlZW4iLCJnZXRDdXJyZW50RW5kQ29sdW1uUGFnZSIsIk1pZENvbHVtbkZ1bGxTY3JlZW4iLCJnZXRDdXJyZW50TWlkQ29sdW1uUGFnZSIsIk9uZUNvbHVtbiIsImdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UiLCJUaHJlZUNvbHVtbnNFbmRFeHBhbmRlZCIsIlRocmVlQ29sdW1uc01pZEV4cGFuZGVkIiwiVHdvQ29sdW1uc0JlZ2luRXhwYW5kZWQiLCJUd29Db2x1bW5zTWlkRXhwYW5kZWQiLCJUaHJlZUNvbHVtbnNNaWRFeHBhbmRlZEVuZEhpZGRlbiIsIlRocmVlQ29sdW1uc0JlZ2luRXhwYW5kZWRFbmRIaWRkZW4iLCJMb2ciLCJlcnJvciIsIl9nZXRBbGxWaWV3cyIsInNMYXlvdXRXaGVuRXhpdEZ1bGxTY3JlZW4iLCJhUmVzdG9yZVByb21pc2VzIiwicmVkdWNlIiwiYVByb21pc2VzIiwiS2VlcEFsaXZlSGVscGVyIiwicmVzdG9yZVZpZXciLCJhbGwiLCJnZXRSaWdodG1vc3RDb250ZXh0IiwicG9wIiwiaXNDb250ZXh0VXNlZEluUGFnZXMiLCJvQ29udGV4dCIsImFBbGxWaXNpYmxlVmlld3MiLCJfc2V0U2hlbGxNZW51VGl0bGUiLCJzVGl0bGUiLCJzQXBwVGl0bGUiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0VGl0bGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZjbC5jb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgRmxleGlibGVDb2x1bW5MYXlvdXQgZnJvbSBcInNhcC9mL0ZsZXhpYmxlQ29sdW1uTGF5b3V0XCI7XG5pbXBvcnQgRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlciBmcm9tIFwic2FwL2YvRmxleGlibGVDb2x1bW5MYXlvdXRTZW1hbnRpY0hlbHBlclwiO1xuaW1wb3J0IGZMaWJyYXJ5IGZyb20gXCJzYXAvZi9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgUm91dGVyUHJveHkgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvUm91dGVyUHJveHlcIjtcbmltcG9ydCBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHVzaW5nRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IExpbmsgZnJvbSBcInNhcC9tL0xpbmtcIjtcbmltcG9ydCBNZXNzYWdlQm94LCB7IEFjdGlvbiwgSWNvbiB9IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgTWVzc2FnZVBhZ2UgZnJvbSBcInNhcC9tL01lc3NhZ2VQYWdlXCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbXBvbmVudENvbnRhaW5lciBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50Q29udGFpbmVyXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBYTUxWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvWE1MVmlld1wiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcIi4uL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQmFzZUNvbnRyb2xsZXIgZnJvbSBcIi4vUm9vdFZpZXdCYXNlQ29udHJvbGxlclwiO1xuXG5jb25zdCBMYXlvdXRUeXBlID0gZkxpYnJhcnkuTGF5b3V0VHlwZTtcblxuY29uc3QgQ09OU1RBTlRTID0ge1xuXHRwYWdlOiB7XG5cdFx0bmFtZXM6IFtcIkJlZ2luQ29sdW1uXCIsIFwiTWlkQ29sdW1uXCIsIFwiRW5kQ29sdW1uXCJdLFxuXHRcdGN1cnJlbnRHZXR0ZXI6IHtcblx0XHRcdHByZWZpeDogXCJnZXRDdXJyZW50XCIsXG5cdFx0XHRzdWZmaXg6IFwiUGFnZVwiXG5cdFx0fSxcblx0XHRnZXR0ZXI6IHtcblx0XHRcdHByZWZpeDogXCJnZXRcIixcblx0XHRcdHN1ZmZpeDogXCJQYWdlc1wiXG5cdFx0fVxuXHR9XG59O1xuY29uc3QgX2dldFZpZXdGcm9tQ29udGFpbmVyID0gZnVuY3Rpb24gKG9Db250YWluZXI6IGFueSkge1xuXHRpZiAob0NvbnRhaW5lci5pc0EoXCJzYXAudWkuY29yZS5Db21wb25lbnRDb250YWluZXJcIikpIHtcblx0XHRyZXR1cm4gb0NvbnRhaW5lci5nZXRDb21wb25lbnRJbnN0YW5jZSgpLmdldFJvb3RDb250cm9sKCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIG9Db250YWluZXI7XG5cdH1cbn07XG4vKipcbiAqIEJhc2UgY29udHJvbGxlciBjbGFzcyBmb3IgeW91ciBvd24gcm9vdCB2aWV3IHdpdGggYW4gc2FwLmYuRmxleGlibGVDb2x1bW5MYXlvdXQgY29udHJvbC5cbiAqXG4gKiBCeSB1c2luZyBvciBleHRlbmRpbmcgdGhpcyBjb250cm9sbGVyLCB5b3UgY2FuIHVzZSB5b3VyIG93biByb290IHZpZXcgd2l0aCB0aGUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50IGFuZFxuICogeW91IGNhbiBtYWtlIHVzZSBvZiBTQVAgRmlvcmkgZWxlbWVudHMgcGFnZXMgYW5kIFNBUCBGaW9yaSBlbGVtZW50cyBidWlsZGluZyBibG9ja3MuXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuMTEwLjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsXCIpXG5jbGFzcyBGY2xDb250cm9sbGVyIGV4dGVuZHMgQmFzZUNvbnRyb2xsZXIge1xuXHRAdXNpbmdFeHRlbnNpb24oXG5cdFx0Vmlld1N0YXRlLm92ZXJyaWRlKHtcblx0XHRcdGFwcGx5SW5pdGlhbFN0YXRlT25seTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9LFxuXHRcdFx0YWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlLCBhQ29udHJvbHM6IGFueSkge1xuXHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIEZjbENvbnRyb2xsZXIpLl9nZXRBbGxWaXNpYmxlVmlld3MoKS5mb3JFYWNoKGZ1bmN0aW9uIChvQ2hpbGRWaWV3OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBwQ2hpbGRWaWV3ID0gUHJvbWlzZS5yZXNvbHZlKG9DaGlsZFZpZXcpO1xuXHRcdFx0XHRcdGFDb250cm9scy5wdXNoKHBDaGlsZFZpZXcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRhZGFwdFN0YXRlQ29udHJvbHM6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUsIGFTdGF0ZUNvbnRyb2xzOiBhbnkpIHtcblx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBGY2xDb250cm9sbGVyKS5fZ2V0QWxsVmlzaWJsZVZpZXdzKCkuZm9yRWFjaChmdW5jdGlvbiAob0NoaWxkVmlldzogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3QgcENoaWxkVmlldyA9IFByb21pc2UucmVzb2x2ZShvQ2hpbGRWaWV3KTtcblx0XHRcdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKHBDaGlsZFZpZXcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sXG5cdFx0XHRvblJlc3RvcmU6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUpIHtcblx0XHRcdFx0Y29uc3QgZmNsQ29udHJvbGxlciA9IHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBGY2xDb250cm9sbGVyO1xuXHRcdFx0XHRjb25zdCBhcHBDb250ZW50Q29udGFpbmVyID0gZmNsQ29udHJvbGxlci5nZXRBcHBDb250ZW50Q29udGFpbmVyKCk7XG5cdFx0XHRcdGNvbnN0IGludGVybmFsTW9kZWwgPSBhcHBDb250ZW50Q29udGFpbmVyLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHRcdFx0XHRjb25zdCBwYWdlcyA9IGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoXCIvcGFnZXNcIik7XG5cblx0XHRcdFx0Zm9yIChjb25zdCBjb21wb25lbnRJZCBpbiBwYWdlcykge1xuXHRcdFx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoYC9wYWdlcy8ke2NvbXBvbmVudElkfS9yZXN0b3JlU3RhdHVzYCwgXCJwZW5kaW5nXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZjbENvbnRyb2xsZXIub25Db250YWluZXJSZWFkeSgpO1xuXHRcdFx0fSxcblx0XHRcdG9uU3VzcGVuZDogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSkge1xuXHRcdFx0XHRjb25zdCBvRkNMQ29udHJvbGxlciA9IHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBGY2xDb250cm9sbGVyO1xuXHRcdFx0XHRjb25zdCBvRkNMQ29udHJvbCA9IG9GQ0xDb250cm9sbGVyLmdldEZjbENvbnRyb2woKTtcblx0XHRcdFx0Y29uc3QgYUJlZ2luQ29sdW1uUGFnZXM6IENvbnRyb2xbXSA9IG9GQ0xDb250cm9sLmdldEJlZ2luQ29sdW1uUGFnZXMoKSB8fCBbXTtcblx0XHRcdFx0Y29uc3QgYU1pZENvbHVtblBhZ2VzOiBDb250cm9sW10gPSBvRkNMQ29udHJvbC5nZXRNaWRDb2x1bW5QYWdlcygpIHx8IFtdO1xuXHRcdFx0XHRjb25zdCBhRW5kQ29sdW1uUGFnZXM6IENvbnRyb2xbXSA9IG9GQ0xDb250cm9sLmdldEVuZENvbHVtblBhZ2VzKCkgfHwgW107XG5cdFx0XHRcdGNvbnN0IGFQYWdlcyA9IChbXSBhcyBDb250cm9sW10pLmNvbmNhdChhQmVnaW5Db2x1bW5QYWdlcywgYU1pZENvbHVtblBhZ2VzLCBhRW5kQ29sdW1uUGFnZXMpO1xuXG5cdFx0XHRcdGFQYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChvUGFnZTogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RhcmdldFZpZXcgPSBfZ2V0Vmlld0Zyb21Db250YWluZXIob1BhZ2UpO1xuXG5cdFx0XHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVGFyZ2V0VmlldyAmJiBvVGFyZ2V0Vmlldy5nZXRDb250cm9sbGVyKCk7XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sbGVyICYmIG9Db250cm9sbGVyLnZpZXdTdGF0ZSAmJiBvQ29udHJvbGxlci52aWV3U3RhdGUub25TdXNwZW5kKSB7XG5cdFx0XHRcdFx0XHRvQ29udHJvbGxlci52aWV3U3RhdGUub25TdXNwZW5kKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KVxuXHQpXG5cdHZpZXdTdGF0ZSE6IFZpZXdTdGF0ZTtcblxuXHRwcm90ZWN0ZWQgX29Sb3V0ZXJQcm94eSE6IFJvdXRlclByb3h5O1xuXG5cdHByaXZhdGUgc0N1cnJlbnRSb3V0ZU5hbWUhOiBzdHJpbmc7XG5cblx0cHJpdmF0ZSBzQ3VycmVudEFyZ3VtZW50cz86IGFueTtcblxuXHRwcml2YXRlIHNQcmV2aW91c0xheW91dCE6IHN0cmluZztcblxuXHRwcml2YXRlIFNRVUVSWUtFWU5BTUUhOiBzdHJpbmc7XG5cblx0cHJvdGVjdGVkIF9vRkNMQ29uZmlnOiBhbnk7XG5cblx0cHJpdmF0ZSBvQWRkaXRpb25hbFZpZXdGb3JOYXZSb3dzQ29tcHV0YXRpb246IGFueTtcblxuXHRwcml2YXRlIF9vVGFyZ2V0c0FnZ3JlZ2F0aW9uOiBhbnk7XG5cblx0cHJpdmF0ZSBfb1RhcmdldHNGcm9tUm91dGVQYXR0ZXJuOiBhbnk7XG5cblx0cHJpdmF0ZSBhTWVzc2FnZVBhZ2VzPzogYW55W107XG5cdC8qKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuZ2V0TWV0YWRhdGFcblx0ICogQGZ1bmN0aW9uXG5cdCAqL1xuXG5cdG9uSW5pdCgpIHtcblx0XHRzdXBlci5vbkluaXQoKTtcblxuXHRcdHRoaXMuX2ludGVybmFsSW5pdCgpO1xuXHR9XG5cblx0bWFuYWdlRGF0YVJlY2VpdmVkKGV2ZW50OiBFdmVudCkge1xuXHRcdGlmIChldmVudC5nZXRQYXJhbWV0ZXIoXCJlcnJvclwiKSkge1xuXHRcdFx0Y29uc3QgcGF0aCA9IGV2ZW50LmdldFBhcmFtZXRlcihcInBhdGhcIiksXG5cdFx0XHRcdHRhcmdldGVkVmlldyA9IHRoaXMuX2dldEFsbFZpc2libGVWaWV3cygpLmZpbmQoKHZpZXcpID0+IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpID09PSBwYXRoKTtcblx0XHRcdC8vIFdlIG5lZWQgdG8gbWFuYWdlIGVycm9yIHdoZW4gdGhlIHJlcXVlc3QgaXMgcmVsYXRlZCB0byBhIGZvcm0gIGludG8gYW4gT2JqZWN0UGFnZVxuXHRcdFx0aWYgKHBhdGggJiYgKHRhcmdldGVkVmlldz8uZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KT8uaXNLZWVwQWxpdmUoKSkge1xuXHRcdFx0XHQodGFyZ2V0ZWRWaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX3JvdXRpbmcub25EYXRhUmVjZWl2ZWQoZXZlbnQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGF0dGFjaFJvdXRlTWF0Y2hlcnMoKSB7XG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5hdHRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQodGhpcy5fZ2V0Vmlld0Zvck5hdmlnYXRlZFJvd3NDb21wdXRhdGlvbiwgdGhpcyk7XG5cdFx0c3VwZXIuYXR0YWNoUm91dGVNYXRjaGVycygpO1xuXHRcdHRoaXMuX2ludGVybmFsSW5pdCgpO1xuXG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5hdHRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQodGhpcy5vbkJlZm9yZVJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5hdHRhY2hSb3V0ZU1hdGNoZWQodGhpcy5vblJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRGY2xDb250cm9sKCkuYXR0YWNoU3RhdGVDaGFuZ2UodGhpcy5fc2F2ZUxheW91dCwgdGhpcyk7XG5cdH1cblxuXHRfaW50ZXJuYWxJbml0KCkge1xuXHRcdGlmICh0aGlzLl9vUm91dGVyUHJveHkpIHtcblx0XHRcdHJldHVybjsgLy8gQWxyZWFkeSBpbml0aWFsaXplZFxuXHRcdH1cblxuXHRcdHRoaXMuc0N1cnJlbnRSb3V0ZU5hbWUgPSBcIlwiO1xuXHRcdHRoaXMuc0N1cnJlbnRBcmd1bWVudHMgPSB7fTtcblx0XHR0aGlzLlNRVUVSWUtFWU5BTUUgPSBcIj9xdWVyeVwiO1xuXG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cblx0XHRjb25zdCBvRGF0YU1vZGVsID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNb2RlbCgpO1xuXHRcdG9EYXRhTW9kZWw/LmF0dGFjaEV2ZW50KFwiZGF0YVJlY2VpdmVkXCIsIHRoaXMubWFuYWdlRGF0YVJlY2VpdmVkLmJpbmQodGhpcykpO1xuXG5cdFx0dGhpcy5fb1JvdXRlclByb3h5ID0gb0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpO1xuXG5cdFx0Ly8gR2V0IEZDTCBjb25maWd1cmF0aW9uIGluIHRoZSBtYW5pZmVzdFxuXHRcdHRoaXMuX29GQ0xDb25maWcgPSB7IG1heENvbHVtbnNDb3VudDogMyB9O1xuXHRcdGNvbnN0IG9Sb3V0aW5nQ29uZmlnID0gKG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3QoKSBhcyBhbnkpW1wic2FwLnVpNVwiXS5yb3V0aW5nO1xuXG5cdFx0aWYgKG9Sb3V0aW5nQ29uZmlnPy5jb25maWc/LmZsZXhpYmxlQ29sdW1uTGF5b3V0KSB7XG5cdFx0XHRjb25zdCBvRkNMTWFuaWZlc3RDb25maWcgPSBvUm91dGluZ0NvbmZpZy5jb25maWcuZmxleGlibGVDb2x1bW5MYXlvdXQ7XG5cblx0XHRcdC8vIERlZmF1bHQgbGF5b3V0IGZvciAyIGNvbHVtbnNcblx0XHRcdGlmIChvRkNMTWFuaWZlc3RDb25maWcuZGVmYXVsdFR3b0NvbHVtbkxheW91dFR5cGUpIHtcblx0XHRcdFx0dGhpcy5fb0ZDTENvbmZpZy5kZWZhdWx0VHdvQ29sdW1uTGF5b3V0VHlwZSA9IG9GQ0xNYW5pZmVzdENvbmZpZy5kZWZhdWx0VHdvQ29sdW1uTGF5b3V0VHlwZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gRGVmYXVsdCBsYXlvdXQgZm9yIDMgY29sdW1uc1xuXHRcdFx0aWYgKG9GQ0xNYW5pZmVzdENvbmZpZy5kZWZhdWx0VGhyZWVDb2x1bW5MYXlvdXRUeXBlKSB7XG5cdFx0XHRcdHRoaXMuX29GQ0xDb25maWcuZGVmYXVsdFRocmVlQ29sdW1uTGF5b3V0VHlwZSA9IG9GQ0xNYW5pZmVzdENvbmZpZy5kZWZhdWx0VGhyZWVDb2x1bW5MYXlvdXRUeXBlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBMaW1pdCBGQ0wgdG8gMiBjb2x1bW5zID9cblx0XHRcdGlmIChvRkNMTWFuaWZlc3RDb25maWcubGltaXRGQ0xUb1R3b0NvbHVtbnMgPT09IHRydWUpIHtcblx0XHRcdFx0dGhpcy5fb0ZDTENvbmZpZy5tYXhDb2x1bW5zQ291bnQgPSAyO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob1JvdXRpbmdDb25maWc/LmNvbmZpZz8uY29udHJvbEFnZ3JlZ2F0aW9uKSB7XG5cdFx0XHR0aGlzLl9vRkNMQ29uZmlnLmRlZmF1bHRDb250cm9sQWdncmVnYXRpb24gPSBvUm91dGluZ0NvbmZpZy5jb25maWcuY29udHJvbEFnZ3JlZ2F0aW9uO1xuXHRcdH1cblxuXHRcdHRoaXMuX2luaXRpYWxpemVUYXJnZXRBZ2dyZWdhdGlvbihvQXBwQ29tcG9uZW50KTtcblx0XHR0aGlzLl9pbml0aWFsaXplUm91dGVzSW5mb3JtYXRpb24ob0FwcENvbXBvbmVudCk7XG5cblx0XHR0aGlzLmdldEZjbENvbnRyb2woKS5hdHRhY2hTdGF0ZUNoYW5nZSh0aGlzLm9uU3RhdGVDaGFuZ2VkLCB0aGlzKTtcblx0XHR0aGlzLmdldEZjbENvbnRyb2woKS5hdHRhY2hBZnRlckVuZENvbHVtbk5hdmlnYXRlKHRoaXMub25TdGF0ZUNoYW5nZWQsIHRoaXMpO1xuXHR9XG5cblx0Z2V0RmNsQ29udHJvbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBcHBDb250ZW50Q29udGFpbmVyKCkgYXMgRmxleGlibGVDb2x1bW5MYXlvdXQ7XG5cdH1cblxuXHRfc2F2ZUxheW91dChvRXZlbnQ6IGFueSkge1xuXHRcdHRoaXMuc1ByZXZpb3VzTGF5b3V0ID0gb0V2ZW50LmdldFBhcmFtZXRlcnMoKS5sYXlvdXQ7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBhZGRpdGlvbmFsIHZpZXcgKG9uIHRvcCBvZiB0aGUgdmlzaWJsZSB2aWV3cyksIHRvIGJlIGFibGUgdG8gY29tcHV0ZSB0aGUgbGF0ZXN0IHRhYmxlIG5hdmlnYXRlZCByb3dzIG9mXG5cdCAqIHRoZSBtb3N0IHJpZ2h0IHZpc2libGUgdmlldyBhZnRlciBhIG5hdiBiYWNrIG9yIGNvbHVtbiBmdWxsc2NyZWVuLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjX2dldFJpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqL1xuXG5cdF9nZXRWaWV3Rm9yTmF2aWdhdGVkUm93c0NvbXB1dGF0aW9uKCkge1xuXHRcdGNvbnN0IGFBbGxWaXNpYmxlVmlld3NCZWZvcmVSb3V0ZU1hdGNoZWQgPSB0aGlzLl9nZXRBbGxWaXNpYmxlVmlld3ModGhpcy5zUHJldmlvdXNMYXlvdXQpO1xuXHRcdGNvbnN0IG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkID0gYUFsbFZpc2libGVWaWV3c0JlZm9yZVJvdXRlTWF0Y2hlZFthQWxsVmlzaWJsZVZpZXdzQmVmb3JlUm91dGVNYXRjaGVkLmxlbmd0aCAtIDFdO1xuXHRcdGxldCBvUmlnaHRNb3N0Vmlldztcblx0XHR0aGlzLmdldFJvdXRlcigpLmF0dGFjaEV2ZW50T25jZShcInJvdXRlTWF0Y2hlZFwiLCAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdG9SaWdodE1vc3RWaWV3ID0gX2dldFZpZXdGcm9tQ29udGFpbmVyKG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2aWV3c1wiKVtvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmlld3NcIikubGVuZ3RoIC0gMV0pO1xuXHRcdFx0aWYgKG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkKSB7XG5cdFx0XHRcdC8vIE5hdmlnYXRpb24gZm9yd2FyZCBmcm9tIEwyIHRvIHZpZXcgbGV2ZWwgTDMgKEZ1bGxTY3JlZW5MYXlvdXQpOlxuXHRcdFx0XHRpZiAob1JpZ2h0TW9zdFZpZXcuZ2V0Vmlld0RhdGEoKSAmJiBvUmlnaHRNb3N0Vmlldy5nZXRWaWV3RGF0YSgpLnZpZXdMZXZlbCA9PT0gdGhpcy5fb0ZDTENvbmZpZy5tYXhDb2x1bW5zQ291bnQpIHtcblx0XHRcdFx0XHR0aGlzLm9BZGRpdGlvbmFsVmlld0Zvck5hdlJvd3NDb21wdXRhdGlvbiA9IG9SaWdodE1vc3RWaWV3O1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIE5hdmlnYXRpb25zIGJhY2t3YXJkIGZyb20gTDMgZG93biB0byBMMiwgTDEsIEwwIChUaHJlZUNvbHVtbiBsYXlvdXQpOlxuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0b1JpZ2h0TW9zdFZpZXcuZ2V0Vmlld0RhdGEoKSAmJlxuXHRcdFx0XHRcdG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkLmdldFZpZXdEYXRhKCkgJiZcblx0XHRcdFx0XHRvUmlnaHRNb3N0Vmlld0JlZm9yZVJvdXRlTWF0Y2hlZC5nZXRWaWV3RGF0YSgpLnZpZXdMZXZlbCA8IHRoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50ICYmXG5cdFx0XHRcdFx0b1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWQuZ2V0Vmlld0RhdGEoKSAmJlxuXHRcdFx0XHRcdG9SaWdodE1vc3RWaWV3QmVmb3JlUm91dGVNYXRjaGVkLmdldFZpZXdEYXRhKCkudmlld0xldmVsID4gb1JpZ2h0TW9zdFZpZXcuZ2V0Vmlld0RhdGEoKS52aWV3TGV2ZWwgJiZcblx0XHRcdFx0XHRvUmlnaHRNb3N0VmlldyAhPT0gb1JpZ2h0TW9zdFZpZXdCZWZvcmVSb3V0ZU1hdGNoZWRcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0dGhpcy5vQWRkaXRpb25hbFZpZXdGb3JOYXZSb3dzQ29tcHV0YXRpb24gPSBvUmlnaHRNb3N0Vmlld0JlZm9yZVJvdXRlTWF0Y2hlZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Z2V0Vmlld0Zvck5hdmlnYXRlZFJvd3NDb21wdXRhdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5vQWRkaXRpb25hbFZpZXdGb3JOYXZSb3dzQ29tcHV0YXRpb247XG5cdH1cblxuXHRvbkV4aXQoKSB7XG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5kZXRhY2hSb3V0ZU1hdGNoZWQodGhpcy5vblJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRSb3V0ZXIoKS5kZXRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQodGhpcy5vbkJlZm9yZVJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRGY2xDb250cm9sKCkuZGV0YWNoU3RhdGVDaGFuZ2UodGhpcy5vblN0YXRlQ2hhbmdlZCwgdGhpcyk7XG5cdFx0dGhpcy5nZXRGY2xDb250cm9sKCkuZGV0YWNoQWZ0ZXJFbmRDb2x1bW5OYXZpZ2F0ZSh0aGlzLm9uU3RhdGVDaGFuZ2VkLCB0aGlzKTtcblx0XHR0aGlzLl9vVGFyZ2V0c0FnZ3JlZ2F0aW9uID0gbnVsbDtcblx0XHR0aGlzLl9vVGFyZ2V0c0Zyb21Sb3V0ZVBhdHRlcm4gPSBudWxsO1xuXG5cdFx0QmFzZUNvbnRyb2xsZXIucHJvdG90eXBlLm9uRXhpdC5iaW5kKHRoaXMpKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2sgaWYgdGhlIEZDTCBjb21wb25lbnQgaXMgZW5hYmxlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI2lzRmNsRW5hYmxlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHJldHVybnMgYHRydWVgIHNpbmNlIHdlIGFyZSBpbiBGQ0wgc2NlbmFyaW9cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0aXNGY2xFbmFibGVkKCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0aGF0IGNyZWF0ZXMgYSBuZXcgUGFnZSB0byBkaXNwbGF5IHRoZSBJbGx1c3RyYXRlZE1lc3NhZ2UgY29udGFpbmluZyB0aGUgY3VycmVudCBlcnJvci5cblx0ICpcblx0ICogQHBhcmFtIHNFcnJvck1lc3NhZ2Vcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNkaXNwbGF5RXJyb3JQYWdlXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IGNyZWF0ZXMgYSBQYWdlIHRvIGRpc3BsYXkgdGhlIGVycm9yXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGRpc3BsYXlFcnJvclBhZ2Uoc0Vycm9yTWVzc2FnZTogYW55LCBtUGFyYW1ldGVyczogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Y29uc3Qgb0ZDTENvbnRyb2wgPSB0aGlzLmdldEZjbENvbnRyb2woKTtcblxuXHRcdGlmICh0aGlzLl9vRkNMQ29uZmlnICYmIG1QYXJhbWV0ZXJzLkZDTExldmVsID49IHRoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50KSB7XG5cdFx0XHRtUGFyYW1ldGVycy5GQ0xMZXZlbCA9IHRoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50IC0gMTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuYU1lc3NhZ2VQYWdlcykge1xuXHRcdFx0dGhpcy5hTWVzc2FnZVBhZ2VzID0gW251bGwsIG51bGwsIG51bGxdO1xuXHRcdH1cblx0XHRsZXQgb01lc3NhZ2VQYWdlID0gdGhpcy5hTWVzc2FnZVBhZ2VzW21QYXJhbWV0ZXJzLkZDTExldmVsXTtcblx0XHRpZiAoIW9NZXNzYWdlUGFnZSkge1xuXHRcdFx0b01lc3NhZ2VQYWdlID0gbmV3IE1lc3NhZ2VQYWdlKHtcblx0XHRcdFx0c2hvd0hlYWRlcjogZmFsc2UsXG5cdFx0XHRcdGljb246IFwic2FwLWljb246Ly9tZXNzYWdlLWVycm9yXCJcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5hTWVzc2FnZVBhZ2VzW21QYXJhbWV0ZXJzLkZDTExldmVsXSA9IG9NZXNzYWdlUGFnZTtcblxuXHRcdFx0c3dpdGNoIChtUGFyYW1ldGVycy5GQ0xMZXZlbCkge1xuXHRcdFx0XHRjYXNlIDA6XG5cdFx0XHRcdFx0b0ZDTENvbnRyb2wuYWRkQmVnaW5Db2x1bW5QYWdlKG9NZXNzYWdlUGFnZSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRcdG9GQ0xDb250cm9sLmFkZE1pZENvbHVtblBhZ2Uob01lc3NhZ2VQYWdlKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdG9GQ0xDb250cm9sLmFkZEVuZENvbHVtblBhZ2Uob01lc3NhZ2VQYWdlKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRvTWVzc2FnZVBhZ2Uuc2V0VGV4dChzRXJyb3JNZXNzYWdlKTtcblxuXHRcdGlmIChtUGFyYW1ldGVycy50ZWNobmljYWxNZXNzYWdlKSB7XG5cdFx0XHRvTWVzc2FnZVBhZ2Uuc2V0Q3VzdG9tRGVzY3JpcHRpb24oXG5cdFx0XHRcdG5ldyBMaW5rKHtcblx0XHRcdFx0XHR0ZXh0OiBtUGFyYW1ldGVycy5kZXNjcmlwdGlvbiB8fCBtUGFyYW1ldGVycy50ZWNobmljYWxNZXNzYWdlLFxuXHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRNZXNzYWdlQm94LnNob3cobVBhcmFtZXRlcnMudGVjaG5pY2FsTWVzc2FnZSwge1xuXHRcdFx0XHRcdFx0XHRpY29uOiBJY29uLkVSUk9SLFxuXHRcdFx0XHRcdFx0XHR0aXRsZTogbVBhcmFtZXRlcnMudGl0bGUsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbnM6IFtBY3Rpb24uT0tdLFxuXHRcdFx0XHRcdFx0XHRkZWZhdWx0QWN0aW9uOiBBY3Rpb24uT0ssXG5cdFx0XHRcdFx0XHRcdGRldGFpbHM6IG1QYXJhbWV0ZXJzLnRlY2huaWNhbERldGFpbHMgfHwgXCJcIixcblx0XHRcdFx0XHRcdFx0Y29udGVudFdpZHRoOiBcIjYwJVwiXG5cdFx0XHRcdFx0XHR9IGFzIGFueSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b01lc3NhZ2VQYWdlLnNldERlc2NyaXB0aW9uKG1QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uIHx8IFwiXCIpO1xuXHRcdH1cblxuXHRcdChvRkNMQ29udHJvbCBhcyBhbnkpLnRvKG9NZXNzYWdlUGFnZS5nZXRJZCgpKTtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemUgdGhlIG9iamVjdCBfb1RhcmdldHNBZ2dyZWdhdGlvbiB0aGF0IGRlZmluZXMgZm9yIGVhY2ggcm91dGUgdGhlIHJlbGV2YW50IGFnZ3JlZ2F0aW9uIGFuZCBwYXR0ZXJuLlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNfaW5pdGlhbGl6ZVRhcmdldEFnZ3JlZ2F0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIFtvQXBwQ29tcG9uZW50XSBSZWZlcmVuY2UgdG8gdGhlIEFwcENvbXBvbmVudFxuXHQgKi9cblx0X2luaXRpYWxpemVUYXJnZXRBZ2dyZWdhdGlvbihvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBvTWFuaWZlc3QgPSBvQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0KCkgYXMgYW55LFxuXHRcdFx0b1RhcmdldHMgPSBvTWFuaWZlc3RbXCJzYXAudWk1XCJdLnJvdXRpbmcgPyBvTWFuaWZlc3RbXCJzYXAudWk1XCJdLnJvdXRpbmcudGFyZ2V0cyA6IG51bGw7XG5cblx0XHR0aGlzLl9vVGFyZ2V0c0FnZ3JlZ2F0aW9uID0ge307XG5cblx0XHRpZiAob1RhcmdldHMpIHtcblx0XHRcdE9iamVjdC5rZXlzKG9UYXJnZXRzKS5mb3JFYWNoKChzVGFyZ2V0TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdGNvbnN0IG9UYXJnZXQgPSBvVGFyZ2V0c1tzVGFyZ2V0TmFtZV07XG5cdFx0XHRcdGlmIChvVGFyZ2V0LmNvbnRyb2xBZ2dyZWdhdGlvbikge1xuXHRcdFx0XHRcdHRoaXMuX29UYXJnZXRzQWdncmVnYXRpb25bc1RhcmdldE5hbWVdID0ge1xuXHRcdFx0XHRcdFx0YWdncmVnYXRpb246IG9UYXJnZXQuY29udHJvbEFnZ3JlZ2F0aW9uLFxuXHRcdFx0XHRcdFx0cGF0dGVybjogb1RhcmdldC5jb250ZXh0UGF0dGVyblxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5fb1RhcmdldHNBZ2dyZWdhdGlvbltzVGFyZ2V0TmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRhZ2dyZWdhdGlvbjogXCJwYWdlXCIsXG5cdFx0XHRcdFx0XHRwYXR0ZXJuOiBudWxsXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIHRoZSBtYXBwaW5nIGJldHdlZW4gYSByb3V0ZSAoaWRlbnRpZmVkIGFzIGl0cyBwYXR0ZXJuKSBhbmQgdGhlIGNvcnJlc3BvbmRpbmcgdGFyZ2V0c1xuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNfaW5pdGlhbGl6ZVJvdXRlc0luZm9ybWF0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG9BcHBDb21wb25lbnQgcmVmIHRvIHRoZSBBcHBDb21wb25lbnRcblx0ICovXG5cblx0X2luaXRpYWxpemVSb3V0ZXNJbmZvcm1hdGlvbihvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBvTWFuaWZlc3QgPSBvQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0KCkgYXMgYW55LFxuXHRcdFx0YVJvdXRlcyA9IG9NYW5pZmVzdFtcInNhcC51aTVcIl0ucm91dGluZyA/IG9NYW5pZmVzdFtcInNhcC51aTVcIl0ucm91dGluZy5yb3V0ZXMgOiBudWxsO1xuXG5cdFx0dGhpcy5fb1RhcmdldHNGcm9tUm91dGVQYXR0ZXJuID0ge307XG5cblx0XHRpZiAoYVJvdXRlcykge1xuXHRcdFx0YVJvdXRlcy5mb3JFYWNoKChyb3V0ZTogYW55KSA9PiB7XG5cdFx0XHRcdHRoaXMuX29UYXJnZXRzRnJvbVJvdXRlUGF0dGVybltyb3V0ZS5wYXR0ZXJuXSA9IHJvdXRlLnRhcmdldDtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGdldEN1cnJlbnRBcmd1bWVudCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zQ3VycmVudEFyZ3VtZW50cztcblx0fVxuXG5cdGdldEN1cnJlbnRSb3V0ZU5hbWUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc0N1cnJlbnRSb3V0ZU5hbWU7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IEZFIEZDTCBjb25zdGFudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqIEByZXR1cm5zIFRoZSBjb25zdGFudHNcblx0ICovXG5cdGdldENvbnN0YW50cygpIHtcblx0XHRyZXR1cm4gQ09OU1RBTlRTO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHRlciBmb3Igb1RhcmdldHNBZ2dyZWdhdGlvbiBhcnJheS5cblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjZ2V0VGFyZ2V0QWdncmVnYXRpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcmV0dXJucyBUaGUgX29UYXJnZXRzQWdncmVnYXRpb24gYXJyYXlcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRUYXJnZXRBZ2dyZWdhdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fb1RhcmdldHNBZ2dyZWdhdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0cmlnZ2VyZWQgYnkgdGhlIHJvdXRlciBSb3V0ZU1hdGNoZWQgZXZlbnQuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI29uUm91dGVNYXRjaGVkXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlclxuXHQgKiBAcGFyYW0gb0V2ZW50XG5cdCAqL1xuXHRvblJvdXRlTWF0Y2hlZChvRXZlbnQ6IGFueSkge1xuXHRcdGNvbnN0IHNSb3V0ZU5hbWUgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwibmFtZVwiKTtcblxuXHRcdC8vIFNhdmUgdGhlIGN1cnJlbnQvcHJldmlvdXMgcm91dGVzIGFuZCBhcmd1bWVudHNcblx0XHR0aGlzLnNDdXJyZW50Um91dGVOYW1lID0gc1JvdXRlTmFtZTtcblx0XHR0aGlzLnNDdXJyZW50QXJndW1lbnRzID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImFyZ3VtZW50c1wiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHRyaWdnZXJpbmcgdGhlIHRhYmxlIHNjcm9sbCB0byB0aGUgbmF2aWdhdGVkIHJvdyBhZnRlciBlYWNoIGxheW91dCBjaGFuZ2UuXG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyI3Njcm9sbFRvTGFzdFNlbGVjdGVkSXRlbVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICovXG5cblx0X3Njcm9sbFRhYmxlc1RvTGFzdE5hdmlnYXRlZEl0ZW1zKCkge1xuXHRcdGNvbnN0IGFWaWV3cyA9IHRoaXMuX2dldEFsbFZpc2libGVWaWV3cygpO1xuXHRcdC8vVGhlIHNjcm9sbHMgYXJlIHRyaWdnZXJlZCBvbmx5IGlmIHRoZSBsYXlvdXQgaXMgd2l0aCBzZXZlcmFsIGNvbHVtbnMgb3Igd2hlbiBzd2l0Y2hpbmcgdGhlIG1vc3RSaWdodCBjb2x1bW4gaW4gZnVsbCBzY3JlZW5cblx0XHRpZiAoYVZpZXdzLmxlbmd0aCA+IDEgfHwgYVZpZXdzWzBdLmdldFZpZXdEYXRhKCkudmlld0xldmVsIDwgdGhpcy5fb0ZDTENvbmZpZy5tYXhDb2x1bW5zQ291bnQpIHtcblx0XHRcdGxldCBzQ3VycmVudFZpZXdQYXRoO1xuXHRcdFx0Y29uc3Qgb0FkZGl0aW9uYWxWaWV3ID0gdGhpcy5nZXRWaWV3Rm9yTmF2aWdhdGVkUm93c0NvbXB1dGF0aW9uKCk7XG5cdFx0XHRpZiAob0FkZGl0aW9uYWxWaWV3ICYmIGFWaWV3cy5pbmRleE9mKG9BZGRpdGlvbmFsVmlldykgPT09IC0xKSB7XG5cdFx0XHRcdGFWaWV3cy5wdXNoKG9BZGRpdGlvbmFsVmlldyk7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGxldCBpbmRleCA9IGFWaWV3cy5sZW5ndGggLSAxOyBpbmRleCA+IDA7IGluZGV4LS0pIHtcblx0XHRcdFx0Y29uc3Qgb1ZpZXcgPSBhVmlld3NbaW5kZXhdLFxuXHRcdFx0XHRcdG9QcmV2aW91c1ZpZXcgPSBhVmlld3NbaW5kZXggLSAxXTtcblx0XHRcdFx0aWYgKG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdFx0XHRzQ3VycmVudFZpZXdQYXRoID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRQYXRoKCk7XG5cdFx0XHRcdFx0b1ByZXZpb3VzVmlldy5nZXRDb250cm9sbGVyKCkuX3Njcm9sbFRhYmxlc1RvUm93KHNDdXJyZW50Vmlld1BhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRyaWdnZXJlZCBieSB0aGUgRkNMIFN0YXRlQ2hhbmdlZCBldmVudC5cblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjb25TdGF0ZUNoYW5nZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqIEBwYXJhbSBvRXZlbnRcblx0ICovXG5cdG9uU3RhdGVDaGFuZ2VkKG9FdmVudDogYW55KSB7XG5cdFx0Y29uc3QgYklzTmF2aWdhdGlvbkFycm93ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImlzTmF2aWdhdGlvbkFycm93XCIpO1xuXHRcdGlmICh0aGlzLnNDdXJyZW50QXJndW1lbnRzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmICghdGhpcy5zQ3VycmVudEFyZ3VtZW50c1t0aGlzLlNRVUVSWUtFWU5BTUVdKSB7XG5cdFx0XHRcdHRoaXMuc0N1cnJlbnRBcmd1bWVudHNbdGhpcy5TUVVFUllLRVlOQU1FXSA9IHt9O1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5zQ3VycmVudEFyZ3VtZW50c1t0aGlzLlNRVUVSWUtFWU5BTUVdLmxheW91dCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJsYXlvdXRcIik7XG5cdFx0fVxuXHRcdHRoaXMuX2ZvcmNlTW9kZWxDb250ZXh0Q2hhbmdlT25CcmVhZENydW1icyhvRXZlbnQpO1xuXG5cdFx0Ly8gUmVwbGFjZSB0aGUgVVJMIHdpdGggdGhlIG5ldyBsYXlvdXQgaWYgYSBuYXZpZ2F0aW9uIGFycm93IHdhcyB1c2VkXG5cdFx0aWYgKGJJc05hdmlnYXRpb25BcnJvdykge1xuXHRcdFx0dGhpcy5fb1JvdXRlclByb3h5Lm5hdlRvKHRoaXMuc0N1cnJlbnRSb3V0ZU5hbWUsIHRoaXMuc0N1cnJlbnRBcmd1bWVudHMpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRSaWdodG1vc3RWaWV3KCk7XG5cdFx0aWYgKG9WaWV3KSB7XG5cdFx0XHR0aGlzLl9jb21wdXRlVGl0bGVIaWVyYXJjaHkob1ZpZXcpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBmaXJlIE1vZGVsQ29udGV4dENoYW5nZSBldmVudCBvbiBhbGwgYnJlYWRjcnVtYnMgKCBvbiBlYWNoIE9iamVjdFBhZ2VzKS5cblx0ICpcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXIjX2ZvcmNlTW9kZWxDb250ZXh0Q2hhbmdlT25CcmVhZENydW1ic1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHBhcmFtIG9FdmVudFxuXHQgKi9cblx0X2ZvcmNlTW9kZWxDb250ZXh0Q2hhbmdlT25CcmVhZENydW1icyhvRXZlbnQ6IGFueSkge1xuXHRcdC8vZm9yY2UgbW9kZWxjb250ZXh0Y2hhbmdlIG9uIE9iamVjdFBhZ2VzIHRvIHJlZnJlc2ggdGhlIGJyZWFkY3J1bWJzIGxpbmsgaHJlZnNcblx0XHRjb25zdCBvRmNsID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGxldCBvUGFnZXM6IGFueVtdID0gW107XG5cdFx0b1BhZ2VzID0gb1BhZ2VzLmNvbmNhdChvRmNsLmdldEJlZ2luQ29sdW1uUGFnZXMoKSkuY29uY2F0KG9GY2wuZ2V0TWlkQ29sdW1uUGFnZXMoKSkuY29uY2F0KG9GY2wuZ2V0RW5kQ29sdW1uUGFnZXMoKSk7XG5cdFx0b1BhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG9QYWdlOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9WaWV3ID0gX2dldFZpZXdGcm9tQ29udGFpbmVyKG9QYWdlKTtcblx0XHRcdGNvbnN0IG9CcmVhZENydW1icyA9IG9WaWV3LmJ5SWQgJiYgb1ZpZXcuYnlJZChcImJyZWFkY3J1bWJzXCIpO1xuXHRcdFx0aWYgKG9CcmVhZENydW1icykge1xuXHRcdFx0XHRvQnJlYWRDcnVtYnMuZmlyZU1vZGVsQ29udGV4dENoYW5nZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZ1bmN0aW9uIHRyaWdnZXJlZCB0byB1cGRhdGUgdGhlIFNoYXJlIGJ1dHRvbiBWaXNpYmlsaXR5LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHBhcmFtIHZpZXdDb2x1bW4gTmFtZSBvZiB0aGUgY3VycmVudCBjb2x1bW4gKFwiYmVnaW5Db2x1bW5cIiwgXCJtaWRDb2x1bW5cIiwgXCJlbmRDb2x1bW5cIilcblx0ICogQHBhcmFtIHNMYXlvdXQgVGhlIGN1cnJlbnQgbGF5b3V0IHVzZWQgYnkgdGhlIEZDTFxuXHQgKiBAcmV0dXJucyBUaGUgc2hhcmUgYnV0dG9uIHZpc2liaWxpdHlcblx0ICovXG5cdF91cGRhdGVTaGFyZUJ1dHRvblZpc2liaWxpdHkodmlld0NvbHVtbjogc3RyaW5nLCBzTGF5b3V0OiBzdHJpbmcpIHtcblx0XHRsZXQgYlNob3dTaGFyZUljb247XG5cdFx0c3dpdGNoIChzTGF5b3V0KSB7XG5cdFx0XHRjYXNlIFwiT25lQ29sdW1uXCI6XG5cdFx0XHRcdGJTaG93U2hhcmVJY29uID0gdmlld0NvbHVtbiA9PT0gXCJiZWdpbkNvbHVtblwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJNaWRDb2x1bW5GdWxsU2NyZWVuXCI6XG5cdFx0XHRjYXNlIFwiVGhyZWVDb2x1bW5zQmVnaW5FeHBhbmRlZEVuZEhpZGRlblwiOlxuXHRcdFx0Y2FzZSBcIlRocmVlQ29sdW1uc01pZEV4cGFuZGVkRW5kSGlkZGVuXCI6XG5cdFx0XHRjYXNlIFwiVHdvQ29sdW1uc0JlZ2luRXhwYW5kZWRcIjpcblx0XHRcdGNhc2UgXCJUd29Db2x1bW5zTWlkRXhwYW5kZWRcIjpcblx0XHRcdFx0YlNob3dTaGFyZUljb24gPSB2aWV3Q29sdW1uID09PSBcIm1pZENvbHVtblwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFbmRDb2x1bW5GdWxsU2NyZWVuXCI6XG5cdFx0XHRjYXNlIFwiVGhyZWVDb2x1bW5zRW5kRXhwYW5kZWRcIjpcblx0XHRcdGNhc2UgXCJUaHJlZUNvbHVtbnNNaWRFeHBhbmRlZFwiOlxuXHRcdFx0XHRiU2hvd1NoYXJlSWNvbiA9IHZpZXdDb2x1bW4gPT09IFwiZW5kQ29sdW1uXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YlNob3dTaGFyZUljb24gPSBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIGJTaG93U2hhcmVJY29uO1xuXHR9XG5cblx0X3VwZGF0ZUVkaXRCdXR0b25WaXNpYmxpdHkodmlld0NvbHVtbjogc3RyaW5nLCBzTGF5b3V0OiBzdHJpbmcpIHtcblx0XHRsZXQgYkVkaXRCdXR0b25WaXNpYmxlID0gdHJ1ZTtcblx0XHRzd2l0Y2ggKHZpZXdDb2x1bW4pIHtcblx0XHRcdGNhc2UgXCJtaWRDb2x1bW5cIjpcblx0XHRcdFx0c3dpdGNoIChzTGF5b3V0KSB7XG5cdFx0XHRcdFx0Y2FzZSBcIlR3b0NvbHVtbnNNaWRFeHBhbmRlZFwiOlxuXHRcdFx0XHRcdGNhc2UgXCJUaHJlZUNvbHVtbnNNaWRFeHBhbmRlZFwiOlxuXHRcdFx0XHRcdGNhc2UgXCJUaHJlZUNvbHVtbnNFbmRFeHBhbmRlZFwiOlxuXHRcdFx0XHRcdFx0YkVkaXRCdXR0b25WaXNpYmxlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJlbmRDb2x1bW5cIjpcblx0XHRcdFx0c3dpdGNoIChzTGF5b3V0KSB7XG5cdFx0XHRcdFx0Y2FzZSBcIlRocmVlQ29sdW1uc01pZEV4cGFuZGVkXCI6XG5cdFx0XHRcdFx0Y2FzZSBcIlRocmVlQ29sdW1uc0VuZEV4cGFuZGVkXCI6XG5cdFx0XHRcdFx0XHRiRWRpdEJ1dHRvblZpc2libGUgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cmV0dXJuIGJFZGl0QnV0dG9uVmlzaWJsZTtcblx0fVxuXG5cdHVwZGF0ZVVJU3RhdGVGb3JWaWV3KG9WaWV3OiBhbnksIEZDTExldmVsOiBhbnkpIHtcblx0XHRjb25zdCBvVUlTdGF0ZSA9IHRoaXMuZ2V0SGVscGVyKCkuZ2V0Q3VycmVudFVJU3RhdGUoKSBhcyBhbnksXG5cdFx0XHRvRmNsQ29sTmFtZSA9IFtcImJlZ2luQ29sdW1uXCIsIFwibWlkQ29sdW1uXCIsIFwiZW5kQ29sdW1uXCJdLFxuXHRcdFx0c0xheW91dCA9IHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldExheW91dCgpO1xuXHRcdGxldCB2aWV3Q29sdW1uO1xuXG5cdFx0aWYgKCFvVmlldy5nZXRNb2RlbChcImZjbGhlbHBlclwiKSkge1xuXHRcdFx0b1ZpZXcuc2V0TW9kZWwodGhpcy5fY3JlYXRlSGVscGVyTW9kZWwoKSwgXCJmY2xoZWxwZXJcIik7XG5cdFx0fVxuXHRcdGlmIChGQ0xMZXZlbCA+PSB0aGlzLl9vRkNMQ29uZmlnLm1heENvbHVtbnNDb3VudCkge1xuXHRcdFx0Ly8gVGhlIHZpZXcgaXMgb24gYSBsZXZlbCA+IG1heCBudW1iZXIgb2YgY29sdW1ucy4gSXQncyBhbHdheXMgZnVsbHNjcmVlbiB3aXRob3V0IGNsb3NlL2V4aXQgYnV0dG9uc1xuXHRcdFx0dmlld0NvbHVtbiA9IG9GY2xDb2xOYW1lW3RoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50IC0gMV07XG5cdFx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5taWRDb2x1bW4uZnVsbFNjcmVlbiA9IG51bGw7XG5cdFx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5taWRDb2x1bW4uZXhpdEZ1bGxTY3JlZW4gPSBudWxsO1xuXHRcdFx0b1VJU3RhdGUuYWN0aW9uQnV0dG9uc0luZm8ubWlkQ29sdW1uLmNsb3NlQ29sdW1uID0gbnVsbDtcblx0XHRcdG9VSVN0YXRlLmFjdGlvbkJ1dHRvbnNJbmZvLmVuZENvbHVtbi5leGl0RnVsbFNjcmVlbiA9IG51bGw7XG5cdFx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5lbmRDb2x1bW4uZnVsbFNjcmVlbiA9IG51bGw7XG5cdFx0XHRvVUlTdGF0ZS5hY3Rpb25CdXR0b25zSW5mby5lbmRDb2x1bW4uY2xvc2VDb2x1bW4gPSBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2aWV3Q29sdW1uID0gb0ZjbENvbE5hbWVbRkNMTGV2ZWxdO1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdEZDTExldmVsID49IHRoaXMuX29GQ0xDb25maWcubWF4Q29sdW1uc0NvdW50IHx8XG5cdFx0XHRzTGF5b3V0ID09PSBcIkVuZENvbHVtbkZ1bGxTY3JlZW5cIiB8fFxuXHRcdFx0c0xheW91dCA9PT0gXCJNaWRDb2x1bW5GdWxsU2NyZWVuXCIgfHxcblx0XHRcdHNMYXlvdXQgPT09IFwiT25lQ29sdW1uXCJcblx0XHQpIHtcblx0XHRcdG9WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLnNldFByb3BlcnR5KFwiL2JyZWFkQ3J1bWJJc1Zpc2libGVcIiwgdHJ1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpLnNldFByb3BlcnR5KFwiL2JyZWFkQ3J1bWJJc1Zpc2libGVcIiwgZmFsc2UpO1xuXHRcdH1cblx0XHQvLyBVbmZvcnR1bmF0ZWx5LCB0aGUgRkNMSGVscGVyIGRvZXNuJ3QgcHJvdmlkZSBhY3Rpb25CdXR0b24gdmFsdWVzIGZvciB0aGUgZmlyc3QgY29sdW1uXG5cdFx0Ly8gc28gd2UgaGF2ZSB0byBhZGQgdGhpcyBpbmZvIG1hbnVhbGx5XG5cdFx0b1VJU3RhdGUuYWN0aW9uQnV0dG9uc0luZm8uYmVnaW5Db2x1bW4gPSB7IGZ1bGxTY3JlZW46IG51bGwsIGV4aXRGdWxsU2NyZWVuOiBudWxsLCBjbG9zZUNvbHVtbjogbnVsbCB9O1xuXG5cdFx0Y29uc3Qgb0FjdGlvbkJ1dHRvbkluZm9zID0gT2JqZWN0LmFzc2lnbih7fSwgb1VJU3RhdGUuYWN0aW9uQnV0dG9uc0luZm9bdmlld0NvbHVtbl0pO1xuXHRcdG9BY3Rpb25CdXR0b25JbmZvcy5zd2l0Y2hWaXNpYmxlID0gb0FjdGlvbkJ1dHRvbkluZm9zLmZ1bGxTY3JlZW4gIT09IG51bGwgfHwgb0FjdGlvbkJ1dHRvbkluZm9zLmV4aXRGdWxsU2NyZWVuICE9PSBudWxsO1xuXHRcdG9BY3Rpb25CdXR0b25JbmZvcy5zd2l0Y2hJY29uID0gb0FjdGlvbkJ1dHRvbkluZm9zLmZ1bGxTY3JlZW4gIT09IG51bGwgPyBcInNhcC1pY29uOi8vZnVsbC1zY3JlZW5cIiA6IFwic2FwLWljb246Ly9leGl0LWZ1bGwtc2NyZWVuXCI7XG5cdFx0b0FjdGlvbkJ1dHRvbkluZm9zLmlzRnVsbFNjcmVlbiA9IG9BY3Rpb25CdXR0b25JbmZvcy5mdWxsU2NyZWVuID09PSBudWxsO1xuXHRcdG9BY3Rpb25CdXR0b25JbmZvcy5jbG9zZVZpc2libGUgPSBvQWN0aW9uQnV0dG9uSW5mb3MuY2xvc2VDb2x1bW4gIT09IG51bGw7XG5cblx0XHRvVmlldy5nZXRNb2RlbChcImZjbGhlbHBlclwiKS5zZXRQcm9wZXJ0eShcIi9hY3Rpb25CdXR0b25zSW5mb1wiLCBvQWN0aW9uQnV0dG9uSW5mb3MpO1xuXG5cdFx0b1ZpZXcuZ2V0TW9kZWwoXCJmY2xoZWxwZXJcIikuc2V0UHJvcGVydHkoXCIvc2hvd0VkaXRCdXR0b25cIiwgdGhpcy5fdXBkYXRlRWRpdEJ1dHRvblZpc2libGl0eSh2aWV3Q29sdW1uLCBzTGF5b3V0KSk7XG5cblx0XHRvVmlldy5nZXRNb2RlbChcImZjbGhlbHBlclwiKS5zZXRQcm9wZXJ0eShcIi9zaG93U2hhcmVJY29uXCIsIHRoaXMuX3VwZGF0ZVNoYXJlQnV0dG9uVmlzaWJpbGl0eSh2aWV3Q29sdW1uLCBzTGF5b3V0KSk7XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gdHJpZ2dlcmVkIGJ5IHRoZSByb3V0ZXIgQmVmb3JlUm91dGVNYXRjaGVkIGV2ZW50LlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNvbkJlZm9yZVJvdXRlTWF0Y2hlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuRmNsLmNvbnRyb2xsZXJcblx0ICogQHBhcmFtIG9FdmVudFxuXHQgKi9cblx0b25CZWZvcmVSb3V0ZU1hdGNoZWQob0V2ZW50OiBhbnkpIHtcblx0XHRpZiAob0V2ZW50KSB7XG5cdFx0XHRjb25zdCBvUXVlcnlQYXJhbXMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVycygpLmFyZ3VtZW50c1t0aGlzLlNRVUVSWUtFWU5BTUVdO1xuXHRcdFx0bGV0IHNMYXlvdXQgPSBvUXVlcnlQYXJhbXMgPyBvUXVlcnlQYXJhbXMubGF5b3V0IDogbnVsbDtcblxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgbm8gbGF5b3V0IHBhcmFtZXRlciwgcXVlcnkgZm9yIHRoZSBkZWZhdWx0IGxldmVsIDAgbGF5b3V0IChub3JtYWxseSBPbmVDb2x1bW4pXG5cdFx0XHRpZiAoIXNMYXlvdXQpIHtcblx0XHRcdFx0Y29uc3Qgb05leHRVSVN0YXRlID0gdGhpcy5nZXRIZWxwZXIoKS5nZXROZXh0VUlTdGF0ZSgwKTtcblx0XHRcdFx0c0xheW91dCA9IG9OZXh0VUlTdGF0ZS5sYXlvdXQ7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENoZWNrIGlmIHRoZSBsYXlvdXQgaWYgY29tcGF0aWJsZSB3aXRoIHRoZSBudW1iZXIgb2YgdGFyZ2V0c1xuXHRcdFx0Ly8gVGhpcyBzaG91bGQgYWx3YXlzIGJlIHRoZSBjYXNlIGZvciBub3JtYWwgbmF2aWdhdGlvbiwganVzdCBuZWVkZWQgaW4gY2FzZVxuXHRcdFx0Ly8gdGhlIFVSTCBoYXMgYmVlbiBtYW51YWxseSBtb2RpZmllZFxuXHRcdFx0Y29uc3QgYVRhcmdldHMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiY29uZmlnXCIpLnRhcmdldDtcblx0XHRcdHNMYXlvdXQgPSB0aGlzLl9jb3JyZWN0TGF5b3V0Rm9yVGFyZ2V0cyhzTGF5b3V0LCBhVGFyZ2V0cyk7XG5cblx0XHRcdC8vIFVwZGF0ZSB0aGUgbGF5b3V0IG9mIHRoZSBGbGV4aWJsZUNvbHVtbkxheW91dFxuXHRcdFx0aWYgKHNMYXlvdXQpIHtcblx0XHRcdFx0dGhpcy5nZXRGY2xDb250cm9sKCkuc2V0TGF5b3V0KHNMYXlvdXQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBIZWxwZXIgZm9yIHRoZSBGQ0wgQ29tcG9uZW50LlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5GY2wuY29udHJvbGxlciNnZXRIZWxwZXJcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbC5jb250cm9sbGVyXG5cdCAqIEByZXR1cm5zIEluc3RhbmNlIG9mIGEgc2VtYW50aWMgaGVscGVyXG5cdCAqL1xuXHRnZXRIZWxwZXIoKSB7XG5cdFx0cmV0dXJuIEZsZXhpYmxlQ29sdW1uTGF5b3V0U2VtYW50aWNIZWxwZXIuZ2V0SW5zdGFuY2VGb3IodGhpcy5nZXRGY2xDb250cm9sKCksIHRoaXMuX29GQ0xDb25maWcpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIEZDTCBsYXlvdXQgZm9yIGEgZ2l2ZW4gRkNMIGxldmVsIGFuZCBhIHRhcmdldCBoYXNoLlxuXHQgKlxuXHQgKiBAcGFyYW0gaU5leHRGQ0xMZXZlbCBGQ0wgbGV2ZWwgdG8gYmUgbmF2aWdhdGVkIHRvXG5cdCAqIEBwYXJhbSBzSGFzaCBUaGUgaGFzaCB0byBiZSBuYXZpZ2F0ZWQgdG9cblx0ICogQHBhcmFtIHNQcm9wb3NlZExheW91dCBUaGUgcHJvcG9zZWQgbGF5b3V0XG5cdCAqIEBwYXJhbSBrZWVwQ3VycmVudExheW91dCBUcnVlIGlmIHdlIHdhbnQgdG8ga2VlcCB0aGUgY3VycmVudCBsYXlvdXQgaWYgcG9zc2libGVcblx0ICogQHJldHVybnMgVGhlIGNhbGN1bGF0ZWQgbGF5b3V0XG5cdCAqL1xuXHRjYWxjdWxhdGVMYXlvdXQoaU5leHRGQ0xMZXZlbDogbnVtYmVyLCBzSGFzaDogc3RyaW5nLCBzUHJvcG9zZWRMYXlvdXQ6IHN0cmluZyB8IHVuZGVmaW5lZCwga2VlcEN1cnJlbnRMYXlvdXQgPSBmYWxzZSkge1xuXHRcdC8vIEZpcnN0LCBhc2sgdGhlIEZDTCBoZWxwZXIgdG8gY2FsY3VsYXRlIHRoZSBsYXlvdXQgaWYgbm90aGluZyBpcyBwcm9wb3NlZFxuXHRcdGlmICghc1Byb3Bvc2VkTGF5b3V0KSB7XG5cdFx0XHRzUHJvcG9zZWRMYXlvdXQgPSBrZWVwQ3VycmVudExheW91dCA/IHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldExheW91dCgpIDogdGhpcy5nZXRIZWxwZXIoKS5nZXROZXh0VUlTdGF0ZShpTmV4dEZDTExldmVsKS5sYXlvdXQ7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlbiBjaGFuZ2UgdGhpcyB2YWx1ZSBpZiBuZWNlc3NhcnksIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgdGFyZ2V0c1xuXHRcdGNvbnN0IG9Sb3V0ZSA9ICh0aGlzLmdldFJvdXRlcigpIGFzIGFueSkuZ2V0Um91dGVCeUhhc2goYCR7c0hhc2h9P2xheW91dD0ke3NQcm9wb3NlZExheW91dH1gKTtcblx0XHRjb25zdCBhVGFyZ2V0cyA9IHRoaXMuX29UYXJnZXRzRnJvbVJvdXRlUGF0dGVybltvUm91dGUuZ2V0UGF0dGVybigpXTtcblxuXHRcdHJldHVybiB0aGlzLl9jb3JyZWN0TGF5b3V0Rm9yVGFyZ2V0cyhzUHJvcG9zZWRMYXlvdXQsIGFUYXJnZXRzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIEZDTCBsYXlvdXQgaXMgY29tcGF0aWJsZSB3aXRoIGFuIGFycmF5IG9mIHRhcmdldHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJvcG9zZWRMYXlvdXQgUHJvcG9zZWQgdmFsdWUgZm9yIHRoZSBGQ0wgbGF5b3V0XG5cdCAqIEBwYXJhbSBhVGFyZ2V0cyBBcnJheSBvZiB0YXJnZXQgbmFtZXMgdXNlZCBmb3IgY2hlY2tpbmdcblx0ICogQHJldHVybnMgVGhlIGNvcnJlY3RlZCBsYXlvdXRcblx0ICovXG5cdF9jb3JyZWN0TGF5b3V0Rm9yVGFyZ2V0cyhzUHJvcG9zZWRMYXlvdXQ6IGFueSwgYVRhcmdldHM6IGFueSkge1xuXHRcdGNvbnN0IGFsbEFsbG93ZWRMYXlvdXRzOiBhbnkgPSB7XG5cdFx0XHRcIjJcIjogW1wiVHdvQ29sdW1uc01pZEV4cGFuZGVkXCIsIFwiVHdvQ29sdW1uc0JlZ2luRXhwYW5kZWRcIiwgXCJNaWRDb2x1bW5GdWxsU2NyZWVuXCJdLFxuXHRcdFx0XCIzXCI6IFtcblx0XHRcdFx0XCJUaHJlZUNvbHVtbnNNaWRFeHBhbmRlZFwiLFxuXHRcdFx0XHRcIlRocmVlQ29sdW1uc0VuZEV4cGFuZGVkXCIsXG5cdFx0XHRcdFwiVGhyZWVDb2x1bW5zTWlkRXhwYW5kZWRFbmRIaWRkZW5cIixcblx0XHRcdFx0XCJUaHJlZUNvbHVtbnNCZWdpbkV4cGFuZGVkRW5kSGlkZGVuXCIsXG5cdFx0XHRcdFwiTWlkQ29sdW1uRnVsbFNjcmVlblwiLFxuXHRcdFx0XHRcIkVuZENvbHVtbkZ1bGxTY3JlZW5cIlxuXHRcdFx0XVxuXHRcdH07XG5cblx0XHRpZiAoYVRhcmdldHMgJiYgIUFycmF5LmlzQXJyYXkoYVRhcmdldHMpKSB7XG5cdFx0XHQvLyBUbyBzdXBwb3J0IHNpbmdsZSB0YXJnZXQgYXMgYSBzdHJpbmcgaW4gdGhlIG1hbmlmZXN0XG5cdFx0XHRhVGFyZ2V0cyA9IFthVGFyZ2V0c107XG5cdFx0fVxuXG5cdFx0aWYgKCFhVGFyZ2V0cykge1xuXHRcdFx0Ly8gRGVmZW5zaXZlLCBqdXN0IGluIGNhc2UuLi5cblx0XHRcdHJldHVybiBzUHJvcG9zZWRMYXlvdXQ7XG5cdFx0fSBlbHNlIGlmIChhVGFyZ2V0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHQvLyBNb3JlIHRoYW4gMSB0YXJnZXQ6IGp1c3Qgc2ltcGx5IGNoZWNrIGZyb20gdGhlIGFsbG93ZWQgdmFsdWVzXG5cdFx0XHRjb25zdCBhTGF5b3V0cyA9IGFsbEFsbG93ZWRMYXlvdXRzW2FUYXJnZXRzLmxlbmd0aF07XG5cdFx0XHRpZiAoYUxheW91dHMuaW5kZXhPZihzUHJvcG9zZWRMYXlvdXQpIDwgMCkge1xuXHRcdFx0XHQvLyBUaGUgcHJvcG9zZWQgbGF5b3V0IGlzbid0IGNvbXBhdGlibGUgd2l0aCB0aGUgbnVtYmVyIG9mIGNvbHVtbnNcblx0XHRcdFx0Ly8gLS0+IEFzayB0aGUgaGVscGVyIGZvciB0aGUgZGVmYXVsdCBsYXlvdXQgZm9yIHRoZSBudW1iZXIgb2YgY29sdW1uc1xuXHRcdFx0XHRzUHJvcG9zZWRMYXlvdXQgPSBhTGF5b3V0c1swXTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gT25seSBvbmUgdGFyZ2V0XG5cdFx0XHRjb25zdCBzVGFyZ2V0QWdncmVnYXRpb24gPSB0aGlzLmdldFRhcmdldEFnZ3JlZ2F0aW9uKClbYVRhcmdldHNbMF1dLmFnZ3JlZ2F0aW9uIHx8IHRoaXMuX29GQ0xDb25maWcuZGVmYXVsdENvbnRyb2xBZ2dyZWdhdGlvbjtcblx0XHRcdHN3aXRjaCAoc1RhcmdldEFnZ3JlZ2F0aW9uKSB7XG5cdFx0XHRcdGNhc2UgXCJiZWdpbkNvbHVtblBhZ2VzXCI6XG5cdFx0XHRcdFx0c1Byb3Bvc2VkTGF5b3V0ID0gXCJPbmVDb2x1bW5cIjtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIm1pZENvbHVtblBhZ2VzXCI6XG5cdFx0XHRcdFx0c1Byb3Bvc2VkTGF5b3V0ID0gXCJNaWRDb2x1bW5GdWxsU2NyZWVuXCI7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJlbmRDb2x1bW5QYWdlc1wiOlxuXHRcdFx0XHRcdHNQcm9wb3NlZExheW91dCA9IFwiRW5kQ29sdW1uRnVsbFNjcmVlblwiO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHQvLyBubyBkZWZhdWx0XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNQcm9wb3NlZExheW91dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBpbnN0YW5jZWQgdmlld3MgaW4gdGhlIEZDTCBjb21wb25lbnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJuIHRoZSB2aWV3cy5cblx0ICovXG5cdGdldEluc3RhbmNlZFZpZXdzKCk6IFhNTFZpZXdbXSB7XG5cdFx0Y29uc3QgZmNsQ29udHJvbCA9IHRoaXMuZ2V0RmNsQ29udHJvbCgpO1xuXHRcdGNvbnN0IGNvbXBvbmVudENvbnRhaW5lcnM6IENvbnRyb2xbXSA9IFtcblx0XHRcdC4uLmZjbENvbnRyb2wuZ2V0QmVnaW5Db2x1bW5QYWdlcygpLFxuXHRcdFx0Li4uZmNsQ29udHJvbC5nZXRNaWRDb2x1bW5QYWdlcygpLFxuXHRcdFx0Li4uZmNsQ29udHJvbC5nZXRFbmRDb2x1bW5QYWdlcygpXG5cdFx0XTtcblx0XHRyZXR1cm4gY29tcG9uZW50Q29udGFpbmVycy5tYXAoKG9QYWdlKSA9PiB7XG5cdFx0XHRpZiAob1BhZ2UgJiYgb1BhZ2UuaXNBPENvbXBvbmVudENvbnRhaW5lcj4oXCJzYXAudWkuY29yZS5Db21wb25lbnRDb250YWluZXJcIikpIHtcblx0XHRcdFx0cmV0dXJuIG9QYWdlLmdldENvbXBvbmVudEluc3RhbmNlKCkuZ2V0Um9vdENvbnRyb2woKSBhcyBYTUxWaWV3O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG9QYWdlIGFzIFhNTFZpZXc7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogZ2V0IGFsbCB2aXNpYmxlIHZpZXdzIGluIHRoZSBGQ0wgY29tcG9uZW50LlxuXHQgKiBzTGF5b3V0IG9wdGlvbmFsIHBhcmFtZXRlciBpcyB2ZXJ5IHNwZWNpZmljIGFzIHBhcnQgb2YgdGhlIGNhbGN1bGF0aW9uIG9mIHRoZSBsYXRlc3QgbmF2aWdhdGVkIHJvd1xuXHQgKlxuXHQgKiBAcGFyYW0geyp9IHNMYXlvdXQgTGF5b3V0IHRoYXQgd2FzIGFwcGxpZWQganVzdCBiZWZvcmUgdGhlIGN1cnJlbnQgbmF2aWdhdGlvblxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IHJldHVybiB2aWV3c1xuXHQgKi9cblxuXHRfZ2V0QWxsVmlzaWJsZVZpZXdzKHNMYXlvdXQ/OiBhbnkpIHtcblx0XHRjb25zdCBhVmlld3MgPSBbXTtcblx0XHRzTGF5b3V0ID0gc0xheW91dCA/IHNMYXlvdXQgOiB0aGlzLmdldEZjbENvbnRyb2woKS5nZXRMYXlvdXQoKTtcblx0XHRzd2l0Y2ggKHNMYXlvdXQpIHtcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5FbmRDb2x1bW5GdWxsU2NyZWVuOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50RW5kQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5NaWRDb2x1bW5GdWxsU2NyZWVuOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5PbmVDb2x1bW46XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5UaHJlZUNvbHVtbnNFbmRFeHBhbmRlZDpcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5UaHJlZUNvbHVtbnNNaWRFeHBhbmRlZDpcblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRFbmRDb2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExheW91dFR5cGUuVHdvQ29sdW1uc0JlZ2luRXhwYW5kZWQ6XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVHdvQ29sdW1uc01pZEV4cGFuZGVkOlxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc01pZEV4cGFuZGVkRW5kSGlkZGVuOlxuXHRcdFx0Y2FzZSBMYXlvdXRUeXBlLlRocmVlQ29sdW1uc0JlZ2luRXhwYW5kZWRFbmRIaWRkZW46XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRMb2cuZXJyb3IoYFVuaGFuZGxlZCBzd2l0Y2ggY2FzZSBmb3IgJHt0aGlzLmdldEZjbENvbnRyb2woKS5nZXRMYXlvdXQoKX1gKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gYVZpZXdzO1xuXHR9XG5cblx0X2dldEFsbFZpZXdzKHNMYXlvdXQ/OiBhbnkpIHtcblx0XHRjb25zdCBhVmlld3MgPSBbXTtcblx0XHRzTGF5b3V0ID0gc0xheW91dCA/IHNMYXlvdXQgOiB0aGlzLmdldEZjbENvbnRyb2woKS5nZXRMYXlvdXQoKTtcblx0XHRzd2l0Y2ggKHNMYXlvdXQpIHtcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5PbmVDb2x1bW46XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVGhyZWVDb2x1bW5zRW5kRXhwYW5kZWQ6XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVGhyZWVDb2x1bW5zTWlkRXhwYW5kZWQ6XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVGhyZWVDb2x1bW5zTWlkRXhwYW5kZWRFbmRIaWRkZW46XG5cdFx0XHRjYXNlIExheW91dFR5cGUuVGhyZWVDb2x1bW5zQmVnaW5FeHBhbmRlZEVuZEhpZGRlbjpcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5FbmRDb2x1bW5GdWxsU2NyZWVuOlxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkge1xuXHRcdFx0XHRcdGFWaWV3cy5wdXNoKF9nZXRWaWV3RnJvbUNvbnRhaW5lcih0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50RW5kQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5Ud29Db2x1bW5zQmVnaW5FeHBhbmRlZDpcblx0XHRcdGNhc2UgTGF5b3V0VHlwZS5Ud29Db2x1bW5zTWlkRXhwYW5kZWQ6XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50QmVnaW5Db2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpIHtcblx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudE1pZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIExheW91dFR5cGUuTWlkQ29sdW1uRnVsbFNjcmVlbjpcblx0XHRcdFx0Ly8gSW4gdGhpcyBjYXNlIHdlIG5lZWQgdG8gZGV0ZXJtaW5lIGlmIHRoaXMgbWlkIGNvbHVtbiBmdWxsc2NyZWVuIGNvbWVzIGZyb20gYSAyIG9yIGEgMyBjb2x1bW4gbGF5b3V0XG5cdFx0XHRcdGNvbnN0IHNMYXlvdXRXaGVuRXhpdEZ1bGxTY3JlZW4gPSAodGhpcy5nZXRIZWxwZXIoKS5nZXRDdXJyZW50VUlTdGF0ZSgpIGFzIGFueSkuYWN0aW9uQnV0dG9uc0luZm8ubWlkQ29sdW1uLmV4aXRGdWxsU2NyZWVuO1xuXHRcdFx0XHRpZiAodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEJlZ2luQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRCZWdpbkNvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50TWlkQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0YVZpZXdzLnB1c2goX2dldFZpZXdGcm9tQ29udGFpbmVyKHRoaXMuZ2V0RmNsQ29udHJvbCgpLmdldEN1cnJlbnRNaWRDb2x1bW5QYWdlKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc0xheW91dFdoZW5FeGl0RnVsbFNjcmVlbi5pbmRleE9mKFwiVGhyZWVDb2x1bW5cIikgPj0gMCkge1xuXHRcdFx0XHRcdC8vIFdlIGNvbWUgZnJvbSBhIDMgY29sdW1uIGxheW91dFxuXHRcdFx0XHRcdGlmICh0aGlzLmdldEZjbENvbnRyb2woKS5nZXRDdXJyZW50RW5kQ29sdW1uUGFnZSgpKSB7XG5cdFx0XHRcdFx0XHRhVmlld3MucHVzaChfZ2V0Vmlld0Zyb21Db250YWluZXIodGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0Q3VycmVudEVuZENvbHVtblBhZ2UoKSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0TG9nLmVycm9yKGBVbmhhbmRsZWQgc3dpdGNoIGNhc2UgZm9yICR7dGhpcy5nZXRGY2xDb250cm9sKCkuZ2V0TGF5b3V0KCl9YCk7XG5cdFx0fVxuXHRcdHJldHVybiBhVmlld3M7XG5cdH1cblxuXHRvbkNvbnRhaW5lclJlYWR5KCkge1xuXHRcdC8vIFJlc3RvcmUgdmlld3MgaWYgbmVjY2Vzc2FyeS5cblx0XHRjb25zdCBhVmlld3MgPSB0aGlzLl9nZXRBbGxWaXNpYmxlVmlld3MoKTtcblx0XHRjb25zdCBhUmVzdG9yZVByb21pc2VzOiBhbnlbXSA9IGFWaWV3cy5yZWR1Y2UoZnVuY3Rpb24gKGFQcm9taXNlczogYW55LCBvVGFyZ2V0VmlldzogYW55KSB7XG5cdFx0XHRhUHJvbWlzZXMucHVzaChLZWVwQWxpdmVIZWxwZXIucmVzdG9yZVZpZXcob1RhcmdldFZpZXcpKTtcblx0XHRcdHJldHVybiBhUHJvbWlzZXM7XG5cdFx0fSwgW10pO1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChhUmVzdG9yZVByb21pc2VzKTtcblx0fVxuXG5cdGdldFJpZ2h0bW9zdENvbnRleHQoKTogQ29udGV4dCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFJpZ2h0bW9zdFZpZXcoKTtcblx0XHRyZXR1cm4gb1ZpZXcgJiYgb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0fVxuXG5cdGdldFJpZ2h0bW9zdFZpZXcoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldEFsbFZpZXdzKCkucG9wKCk7XG5cdH1cblxuXHRpc0NvbnRleHRVc2VkSW5QYWdlcyhvQ29udGV4dDogQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRcdGlmICghdGhpcy5nZXRGY2xDb250cm9sKCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Y29uc3QgYUFsbFZpc2libGVWaWV3cyA9IHRoaXMuX2dldEFsbFZpZXdzKCk7XG5cdFx0Zm9yIChjb25zdCB2aWV3IG9mIGFBbGxWaXNpYmxlVmlld3MpIHtcblx0XHRcdGlmICh2aWV3KSB7XG5cdFx0XHRcdGlmICh2aWV3LmdldEJpbmRpbmdDb250ZXh0KCkgPT09IG9Db250ZXh0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIEEgdmlldyBoYXMgYmVlbiBkZXN0cm95ZWQgLS0+IGFwcCBpcyBjdXJyZW50bHkgYmVpbmcgZGVzdHJveWVkXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0X3NldFNoZWxsTWVudVRpdGxlKG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgc1RpdGxlOiBzdHJpbmcsIHNBcHBUaXRsZTogc3RyaW5nKTogdm9pZCB7XG5cdFx0aWYgKHRoaXMuZ2V0SGVscGVyKCkuZ2V0Q3VycmVudFVJU3RhdGUoKS5pc0Z1bGxTY3JlZW4gIT09IHRydWUpIHtcblx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldFRpdGxlKHNBcHBUaXRsZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldFRpdGxlKHNUaXRsZSk7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZjbENvbnRyb2xsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztFQXFCQSxNQUFNQSxVQUFVLEdBQUdDLFFBQVEsQ0FBQ0QsVUFBVTtFQUV0QyxNQUFNRSxTQUFTLEdBQUc7SUFDakJDLElBQUksRUFBRTtNQUNMQyxLQUFLLEVBQUUsQ0FBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQztNQUNoREMsYUFBYSxFQUFFO1FBQ2RDLE1BQU0sRUFBRSxZQUFZO1FBQ3BCQyxNQUFNLEVBQUU7TUFDVCxDQUFDO01BQ0RDLE1BQU0sRUFBRTtRQUNQRixNQUFNLEVBQUUsS0FBSztRQUNiQyxNQUFNLEVBQUU7TUFDVDtJQUNEO0VBQ0QsQ0FBQztFQUNELE1BQU1FLHFCQUFxQixHQUFHLFVBQVVDLFVBQWUsRUFBRTtJQUN4RCxJQUFJQSxVQUFVLENBQUNDLEdBQUcsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFFO01BQ3JELE9BQU9ELFVBQVUsQ0FBQ0Usb0JBQW9CLEVBQUUsQ0FBQ0MsY0FBYyxFQUFFO0lBQzFELENBQUMsTUFBTTtNQUNOLE9BQU9ILFVBQVU7SUFDbEI7RUFDRCxDQUFDO0VBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFUQSxJQVdNSSxhQUFhLFdBRGxCQyxjQUFjLENBQUMsMEJBQTBCLENBQUMsVUFFekNDLGNBQWMsQ0FDZEMsU0FBUyxDQUFDQyxRQUFRLENBQUM7SUFDbEJDLHFCQUFxQixFQUFFLFlBQVk7TUFDbEMsT0FBTyxL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
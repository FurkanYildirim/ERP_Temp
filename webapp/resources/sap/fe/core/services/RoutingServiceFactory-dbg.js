/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/routing/NavigationReason", "sap/fe/core/helpers/AppStartupHelper", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/suite/ui/commons/collaboration/CollaborationHelper", "sap/ui/base/BindingParser", "sap/ui/base/EventProvider", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/model/odata/v4/ODataUtils"], function (Log, BusyLocker, messageHandling, Placeholder, NavigationReason, AppStartupHelper, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, CollaborationHelper, BindingParser, EventProvider, Service, ServiceFactory, ODataUtils) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RoutingServiceEventing = (_dec = defineUI5Class("sap.fe.core.services.RoutingServiceEventing"), _dec2 = event(), _dec3 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_EventProvider) {
    _inheritsLoose(RoutingServiceEventing, _EventProvider);
    function RoutingServiceEventing() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _EventProvider.call(this, ...args) || this;
      _initializerDefineProperty(_this, "routeMatched", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterRouteMatched", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    return RoutingServiceEventing;
  }(EventProvider), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "routeMatched", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "afterRouteMatched", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  let RoutingService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(RoutingService, _Service);
    function RoutingService() {
      var _this2;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      _this2 = _Service.call(this, ...args) || this;
      _this2.navigationInfoQueue = [];
      return _this2;
    }
    _exports.RoutingService = RoutingService;
    var _proto = RoutingService.prototype;
    _proto.init = function init() {
      const oContext = this.getContext();
      if (oContext.scopeType === "component") {
        var _oAppConfig$crossNavi;
        this.oAppComponent = oContext.scopeObject;
        this.oModel = this.oAppComponent.getModel();
        this.oMetaModel = this.oModel.getMetaModel();
        this.oRouter = this.oAppComponent.getRouter();
        this.oRouterProxy = this.oAppComponent.getRouterProxy();
        this.eventProvider = new RoutingServiceEventing();
        const oRoutingConfig = this.oAppComponent.getManifestEntry("sap.ui5").routing;
        this._parseRoutingConfiguration(oRoutingConfig);
        const oAppConfig = this.oAppComponent.getManifestEntry("sap.app");
        this.outbounds = (_oAppConfig$crossNavi = oAppConfig.crossNavigation) === null || _oAppConfig$crossNavi === void 0 ? void 0 : _oAppConfig$crossNavi.outbounds;
      }
      this.initPromise = Promise.resolve(this);
    };
    _proto.beforeExit = function beforeExit() {
      this.oRouter.detachRouteMatched(this._fnOnRouteMatched, this);
      this.eventProvider.fireEvent("routeMatched", {});
    };
    _proto.exit = function exit() {
      this.eventProvider.destroy();
    }

    /**
     * Parse a manifest routing configuration for internal usage.
     *
     * @param oRoutingConfig The routing configuration from the manifest
     * @private
     */;
    _proto._parseRoutingConfiguration = function _parseRoutingConfiguration(oRoutingConfig) {
      var _oRoutingConfig$confi;
      const isFCL = (oRoutingConfig === null || oRoutingConfig === void 0 ? void 0 : (_oRoutingConfig$confi = oRoutingConfig.config) === null || _oRoutingConfig$confi === void 0 ? void 0 : _oRoutingConfig$confi.routerClass) === "sap.f.routing.Router";

      // Information of targets
      this._mTargets = {};
      Object.keys(oRoutingConfig.targets).forEach(sTargetName => {
        this._mTargets[sTargetName] = Object.assign({
          targetName: sTargetName
        }, oRoutingConfig.targets[sTargetName]);

        // View level for FCL cases is calculated from the target pattern
        if (this._mTargets[sTargetName].contextPattern !== undefined) {
          this._mTargets[sTargetName].viewLevel = this._getViewLevelFromPattern(this._mTargets[sTargetName].contextPattern, 0);
        }
      });

      // Information of routes
      this._mRoutes = {};
      for (const sRouteKey in oRoutingConfig.routes) {
        const oRouteManifestInfo = oRoutingConfig.routes[sRouteKey],
          aRouteTargets = Array.isArray(oRouteManifestInfo.target) ? oRouteManifestInfo.target : [oRouteManifestInfo.target],
          sRouteName = Array.isArray(oRoutingConfig.routes) ? oRouteManifestInfo.name : sRouteKey,
          sRoutePattern = oRouteManifestInfo.pattern;

        // Check route pattern: all patterns need to end with ':?query:', that we use for parameters
        if (sRoutePattern.length < 8 || sRoutePattern.indexOf(":?query:") !== sRoutePattern.length - 8) {
          Log.warning(`Pattern for route ${sRouteName} doesn't end with ':?query:' : ${sRoutePattern}`);
        }
        const iRouteLevel = this._getViewLevelFromPattern(sRoutePattern, 0);
        this._mRoutes[sRouteName] = {
          name: sRouteName,
          pattern: sRoutePattern,
          targets: aRouteTargets,
          routeLevel: iRouteLevel
        };

        // Add the parent targets in the list of targets for the route
        for (let i = 0; i < aRouteTargets.length; i++) {
          const sParentTargetName = this._mTargets[aRouteTargets[i]].parent;
          if (sParentTargetName) {
            aRouteTargets.push(sParentTargetName);
          }
        }
        if (!isFCL) {
          // View level for non-FCL cases is calculated from the route pattern
          if (this._mTargets[aRouteTargets[0]].viewLevel === undefined || this._mTargets[aRouteTargets[0]].viewLevel < iRouteLevel) {
            // There are cases when different routes point to the same target. We take the
            // largest viewLevel in that case.
            this._mTargets[aRouteTargets[0]].viewLevel = iRouteLevel;
          }

          // FCL level for non-FCL cases is equal to -1
          this._mTargets[aRouteTargets[0]].FCLLevel = -1;
        } else if (aRouteTargets.length === 1 && this._mTargets[aRouteTargets[0]].controlAggregation !== "beginColumnPages") {
          // We're in the case where there's only 1 target for the route, and it's not in the first column
          // --> this is a fullscreen column after all columns in the FCL have been used
          this._mTargets[aRouteTargets[0]].FCLLevel = 3;
        } else {
          // Other FCL cases
          aRouteTargets.forEach(sTargetName => {
            switch (this._mTargets[sTargetName].controlAggregation) {
              case "beginColumnPages":
                this._mTargets[sTargetName].FCLLevel = 0;
                break;
              case "midColumnPages":
                this._mTargets[sTargetName].FCLLevel = 1;
                break;
              default:
                this._mTargets[sTargetName].FCLLevel = 2;
            }
          });
        }
      }

      // Propagate viewLevel, contextPattern, FCLLevel and controlAggregation to parent targets
      Object.keys(this._mTargets).forEach(sTargetName => {
        while (this._mTargets[sTargetName].parent) {
          const sParentTargetName = this._mTargets[sTargetName].parent;
          this._mTargets[sParentTargetName].viewLevel = this._mTargets[sParentTargetName].viewLevel || this._mTargets[sTargetName].viewLevel;
          this._mTargets[sParentTargetName].contextPattern = this._mTargets[sParentTargetName].contextPattern || this._mTargets[sTargetName].contextPattern;
          this._mTargets[sParentTargetName].FCLLevel = this._mTargets[sParentTargetName].FCLLevel || this._mTargets[sTargetName].FCLLevel;
          this._mTargets[sParentTargetName].controlAggregation = this._mTargets[sParentTargetName].controlAggregation || this._mTargets[sTargetName].controlAggregation;
          sTargetName = sParentTargetName;
        }
      });

      // Determine the root entity for the app
      const aLevel0RouteNames = [];
      const aLevel1RouteNames = [];
      let sDefaultRouteName;
      for (const sName in this._mRoutes) {
        const iLevel = this._mRoutes[sName].routeLevel;
        if (iLevel === 0) {
          aLevel0RouteNames.push(sName);
        } else if (iLevel === 1) {
          aLevel1RouteNames.push(sName);
        }
      }
      if (aLevel0RouteNames.length === 1) {
        sDefaultRouteName = aLevel0RouteNames[0];
      } else if (aLevel1RouteNames.length === 1) {
        sDefaultRouteName = aLevel1RouteNames[0];
      }
      if (sDefaultRouteName) {
        const sDefaultTargetName = this._mRoutes[sDefaultRouteName].targets.slice(-1)[0];
        this.sContextPath = "";
        if (this._mTargets[sDefaultTargetName].options && this._mTargets[sDefaultTargetName].options.settings) {
          const oSettings = this._mTargets[sDefaultTargetName].options.settings;
          this.sContextPath = oSettings.contextPath || `/${oSettings.entitySet}`;
        }
        if (!this.sContextPath) {
          Log.warning(`Cannot determine default contextPath: contextPath or entitySet missing in default target: ${sDefaultTargetName}`);
        }
      } else {
        Log.warning("Cannot determine default contextPath: no default route found.");
      }

      // We need to establish the correct path to the different pages, including the navigation properties
      Object.keys(this._mTargets).map(sTargetKey => {
        return this._mTargets[sTargetKey];
      }).sort((a, b) => {
        return a.viewLevel < b.viewLevel ? -1 : 1;
      }).forEach(target => {
        // After sorting the targets per level we can then go through their navigation object and update the paths accordingly.
        if (target.options) {
          const settings = target.options.settings;
          const sContextPath = settings.contextPath || (settings.entitySet ? `/${settings.entitySet}` : "");
          if (!settings.fullContextPath && sContextPath) {
            settings.fullContextPath = `${sContextPath}/`;
          }
          Object.keys(settings.navigation || {}).forEach(sNavName => {
            // Check if it's a navigation property
            const targetRoute = this._mRoutes[settings.navigation[sNavName].detail.route];
            if (targetRoute && targetRoute.targets) {
              targetRoute.targets.forEach(sTargetName => {
                if (this._mTargets[sTargetName].options && this._mTargets[sTargetName].options.settings && !this._mTargets[sTargetName].options.settings.fullContextPath) {
                  if (target.viewLevel === 0) {
                    this._mTargets[sTargetName].options.settings.fullContextPath = `${(sNavName.startsWith("/") ? "" : "/") + sNavName}/`;
                  } else {
                    this._mTargets[sTargetName].options.settings.fullContextPath = `${settings.fullContextPath + sNavName}/`;
                  }
                }
              });
            }
          });
        }
      });
    }

    /**
     * Calculates a view level from a pattern by counting the number of segments.
     *
     * @param sPattern The pattern
     * @param viewLevel The current level of view
     * @returns The level
     */;
    _proto._getViewLevelFromPattern = function _getViewLevelFromPattern(sPattern, viewLevel) {
      sPattern = sPattern.replace(":?query:", "");
      const regex = new RegExp("/[^/]*$");
      if (sPattern && sPattern[0] !== "/" && sPattern[0] !== "?") {
        sPattern = `/${sPattern}`;
      }
      if (sPattern.length) {
        sPattern = sPattern.replace(regex, "");
        if (this.oRouter.match(sPattern) || sPattern === "") {
          return this._getViewLevelFromPattern(sPattern, ++viewLevel);
        } else {
          return this._getViewLevelFromPattern(sPattern, viewLevel);
        }
      } else {
        return viewLevel;
      }
    };
    _proto._getRouteInformation = function _getRouteInformation(sRouteName) {
      return this._mRoutes[sRouteName];
    };
    _proto._getTargetInformation = function _getTargetInformation(sTargetName) {
      return this._mTargets[sTargetName];
    };
    _proto._getComponentId = function _getComponentId(sOwnerId, sComponentId) {
      if (sComponentId.indexOf(`${sOwnerId}---`) === 0) {
        return sComponentId.substr(sOwnerId.length + 3);
      }
      return sComponentId;
    }

    /**
     * Get target information for a given component.
     *
     * @param oComponentInstance Instance of the component
     * @returns The configuration for the target
     */;
    _proto.getTargetInformationFor = function getTargetInformationFor(oComponentInstance) {
      const sTargetComponentId = this._getComponentId(oComponentInstance._sOwnerId, oComponentInstance.getId());
      let sCorrectTargetName = null;
      Object.keys(this._mTargets).forEach(sTargetName => {
        if (this._mTargets[sTargetName].id === sTargetComponentId || this._mTargets[sTargetName].viewId === sTargetComponentId) {
          sCorrectTargetName = sTargetName;
        }
      });
      return this._getTargetInformation(sCorrectTargetName);
    };
    _proto.getLastSemanticMapping = function getLastSemanticMapping() {
      return this.oLastSemanticMapping;
    };
    _proto.setLastSemanticMapping = function setLastSemanticMapping(oMapping) {
      this.oLastSemanticMapping = oMapping;
    };
    _proto.navigateTo = function navigateTo(oContext, sRouteName, mParameterMapping, bPreserveHistory) {
      let sTargetURLPromise, bIsStickyMode;
      if (oContext.getModel() && oContext.getModel().getMetaModel && oContext.getModel().getMetaModel()) {
        bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
      }
      if (!mParameterMapping) {
        // if there is no parameter mapping define this mean we rely entirely on the binding context path
        sTargetURLPromise = Promise.resolve(SemanticKeyHelper.getSemanticPath(oContext));
      } else {
        sTargetURLPromise = this.prepareParameters(mParameterMapping, sRouteName, oContext).then(mParameters => {
          return this.oRouter.getURL(sRouteName, mParameters);
        });
      }
      return sTargetURLPromise.then(sTargetURL => {
        this.oRouterProxy.navToHash(sTargetURL, bPreserveHistory, false, false, !bIsStickyMode);
      });
    }

    /**
     * Method to return a map of routing target parameters where the binding syntax is resolved to the current model.
     *
     * @param mParameters Parameters map in the format [k: string] : ComplexBindingSyntax
     * @param sTargetRoute Name of the target route
     * @param oContext The instance of the binding context
     * @returns A promise which resolves to the routing target parameters
     */;
    _proto.prepareParameters = function prepareParameters(mParameters, sTargetRoute, oContext) {
      let oParametersPromise;
      try {
        const sContextPath = oContext.getPath();
        const oMetaModel = oContext.getModel().getMetaModel();
        const aContextPathParts = sContextPath.split("/");
        const aAllResolvedParameterPromises = Object.keys(mParameters).map(sParameterKey => {
          const sParameterMappingExpression = mParameters[sParameterKey];
          // We assume the defined parameters will be compatible with a binding expression
          const oParsedExpression = BindingParser.complexParser(sParameterMappingExpression);
          const aParts = oParsedExpression.parts || [oParsedExpression];
          const aResolvedParameterPromises = aParts.map(function (oPathPart) {
            const aRelativeParts = oPathPart.path.split("../");
            // We go up the current context path as many times as necessary
            const aLocalParts = aContextPathParts.slice(0, aContextPathParts.length - aRelativeParts.length + 1);
            aLocalParts.push(aRelativeParts[aRelativeParts.length - 1]);
            const sPropertyPath = aLocalParts.join("/");
            const oMetaContext = oMetaModel.getMetaContext(sPropertyPath);
            return oContext.requestProperty(sPropertyPath).then(function (oValue) {
              const oPropertyInfo = oMetaContext.getObject();
              const sEdmType = oPropertyInfo.$Type;
              return ODataUtils.formatLiteral(oValue, sEdmType);
            });
          });
          return Promise.all(aResolvedParameterPromises).then(aResolvedParameters => {
            const value = oParsedExpression.formatter ? oParsedExpression.formatter.apply(this, aResolvedParameters) : aResolvedParameters.join("");
            return {
              key: sParameterKey,
              value: value
            };
          });
        });
        oParametersPromise = Promise.all(aAllResolvedParameterPromises).then(function (aAllResolvedParameters) {
          const oParameters = {};
          aAllResolvedParameters.forEach(function (oResolvedParameter) {
            oParameters[oResolvedParameter.key] = oResolvedParameter.value;
          });
          return oParameters;
        });
      } catch (oError) {
        Log.error(`Could not parse the parameters for the navigation to route ${sTargetRoute}`);
        oParametersPromise = Promise.resolve(undefined);
      }
      return oParametersPromise;
    };
    _proto._fireRouteMatchEvents = function _fireRouteMatchEvents(mParameters) {
      this.eventProvider.fireEvent("routeMatched", mParameters);
      this.eventProvider.fireEvent("afterRouteMatched", mParameters);
      EditState.cleanProcessedEditState(); // Reset UI state when all bindings have been refreshed
    }

    /**
     * Navigates to a context.
     *
     * @param oContext The Context to be navigated to, or the list binding for creation (deferred creation)
     * @param [mParameters] Optional, map containing the following attributes:
     * @param [mParameters.checkNoHashChange] Navigate to the context without changing the URL
     * @param [mParameters.asyncContext] The context is created async, navigate to (...) and
     *                    wait for Promise to be resolved and then navigate into the context
     * @param [mParameters.bDeferredContext] The context shall be created deferred at the target page
     * @param [mParameters.editable] The target page shall be immediately in the edit mode to avoid flickering
     * @param [mParameters.bPersistOPScroll] The bPersistOPScroll will be used for scrolling to first tab
     * @param [mParameters.updateFCLLevel] `+1` if we add a column in FCL, `-1` to remove a column, 0 to stay on the same column
     * @param [mParameters.noPreservationCache] Do navigation without taking into account the preserved cache mechanism
     * @param [mParameters.bRecreateContext] Force re-creation of the context instead of using the one passed as parameter
     * @param [mParameters.bForceFocus] Forces focus selection after navigation
     * @param [oViewData] View data
     * @param [oCurrentTargetInfo] The target information from which the navigation is triggered
     * @returns Promise which is resolved once the navigation is triggered
     * @ui5-restricted
     * @final
     */;
    _proto.navigateToContext = function navigateToContext(oContext, mParameters, oViewData, oCurrentTargetInfo) {
      let sTargetRoute = "",
        oRouteParametersPromise,
        bIsStickyMode = false;
      if (oContext.getModel() && oContext.getModel().getMetaModel) {
        bIsStickyMode = ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel());
      }
      // Manage parameter mapping
      if (mParameters && mParameters.targetPath && oViewData && oViewData.navigation) {
        const oRouteDetail = oViewData.navigation[mParameters.targetPath].detail;
        sTargetRoute = oRouteDetail.route;
        if (oRouteDetail.parameters && oContext.isA("sap.ui.model.odata.v4.Context")) {
          oRouteParametersPromise = this.prepareParameters(oRouteDetail.parameters, sTargetRoute, oContext);
        }
      }
      let sTargetPath = this._getPathFromContext(oContext, mParameters);
      // If the path is empty, we're supposed to navigate to the first page of the app
      // Check if we need to exit from the app instead
      if (sTargetPath.length === 0 && this.bExitOnNavigateBackToRoot) {
        this.oRouterProxy.exitFromApp();
        return Promise.resolve(true);
      }

      // If the context is deferred or async, we add (...) to the path
      if (mParameters !== null && mParameters !== void 0 && mParameters.asyncContext || mParameters !== null && mParameters !== void 0 && mParameters.bDeferredContext) {
        sTargetPath += "(...)";
      }

      // Add layout parameter if needed
      const sLayout = this._calculateLayout(sTargetPath, mParameters);
      if (sLayout) {
        sTargetPath += `?layout=${sLayout}`;
      }

      // Navigation parameters for later usage
      const oNavigationInfo = {
        oAsyncContext: mParameters === null || mParameters === void 0 ? void 0 : mParameters.asyncContext,
        bDeferredContext: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bDeferredContext,
        bTargetEditable: mParameters === null || mParameters === void 0 ? void 0 : mParameters.editable,
        bPersistOPScroll: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bPersistOPScroll,
        bDraftNavigation: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bDraftNavigation,
        bShowPlaceholder: (mParameters === null || mParameters === void 0 ? void 0 : mParameters.showPlaceholder) !== undefined ? mParameters === null || mParameters === void 0 ? void 0 : mParameters.showPlaceholder : true,
        reason: mParameters === null || mParameters === void 0 ? void 0 : mParameters.reason
      };
      if ((mParameters === null || mParameters === void 0 ? void 0 : mParameters.updateFCLLevel) !== -1 && (mParameters === null || mParameters === void 0 ? void 0 : mParameters.bRecreateContext) !== true) {
        if (oContext.isA("sap.ui.model.odata.v4.Context")) {
          oNavigationInfo.useContext = oContext;
        } else {
          oNavigationInfo.listBindingForCreate = oContext;
        }
      }
      if (mParameters !== null && mParameters !== void 0 && mParameters.checkNoHashChange) {
        // Check if the new hash is different from the current one
        const sCurrentHashNoAppState = this.oRouterProxy.getHash().replace(/[&?]{1}sap-iapp-state=[A-Z0-9]+/, "");
        if (sTargetPath === sCurrentHashNoAppState) {
          // The hash doesn't change, but we fire the routeMatch event to trigger page refresh / binding
          const mEventParameters = this.oRouter.getRouteInfoByHash(this.oRouterProxy.getHash());
          if (mEventParameters) {
            mEventParameters.navigationInfo = oNavigationInfo;
            mEventParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
            mEventParameters.routePattern = this.sCurrentRoutePattern;
            mEventParameters.views = this.aCurrentViews;
          }
          this.oRouterProxy.setFocusForced(!!mParameters.bForceFocus);
          this._fireRouteMatchEvents(mEventParameters);
          return Promise.resolve(true);
        }
      }
      if (mParameters !== null && mParameters !== void 0 && mParameters.transient && mParameters.editable == true && sTargetPath.indexOf("(...)") === -1) {
        if (sTargetPath.indexOf("?") > -1) {
          sTargetPath += "&i-action=create";
        } else {
          sTargetPath += "?i-action=create";
        }
      }

      // Clear unbound messages upon navigating from LR to OP
      // This is to ensure stale error messages from LR are not shown to the user after navigation to OP.
      if (oCurrentTargetInfo && oCurrentTargetInfo.name === "sap.fe.templates.ListReport") {
        const oRouteInfo = this.oRouter.getRouteInfoByHash(sTargetPath);
        if (oRouteInfo) {
          const oRoute = this._getRouteInformation(oRouteInfo.name);
          if (oRoute && oRoute.targets && oRoute.targets.length > 0) {
            const sLastTargetName = oRoute.targets[oRoute.targets.length - 1];
            const oTarget = this._getTargetInformation(sLastTargetName);
            if (oTarget && oTarget.name === "sap.fe.templates.ObjectPage") {
              messageHandling.removeUnboundTransitionMessages();
            }
          }
        }
      }

      // Add the navigation parameters in the queue
      this.navigationInfoQueue.push(oNavigationInfo);
      if (sTargetRoute && oRouteParametersPromise) {
        return oRouteParametersPromise.then(oRouteParameters => {
          oRouteParameters.bIsStickyMode = bIsStickyMode;
          this.oRouter.navTo(sTargetRoute, oRouteParameters);
          return Promise.resolve(true);
        });
      }
      return this.oRouterProxy.navToHash(sTargetPath, false, mParameters === null || mParameters === void 0 ? void 0 : mParameters.noPreservationCache, mParameters === null || mParameters === void 0 ? void 0 : mParameters.bForceFocus, !bIsStickyMode).then(bNavigated => {
        if (!bNavigated) {
          // The navigation did not happen --> remove the navigation parameters from the queue as they shouldn't be used
          this.navigationInfoQueue.pop();
        }
        return bNavigated;
      });
    }

    /**
     * Navigates to a route.
     *
     * @function
     * @name sap.fe.core.controllerextensions.Routing#navigateToRoute
     * @memberof sap.fe.core.controllerextensions.Routing
     * @static
     * @param sTargetRouteName Name of the target route
     * @param [oRouteParameters] Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @ui5-restricted
     * @final
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oRouteParameters) {
      const sTargetURL = this.oRouter.getURL(sTargetRouteName, oRouteParameters);
      return this.oRouterProxy.navToHash(sTargetURL, undefined, undefined, undefined, !oRouteParameters.bIsStickyMode);
    }

    /**
     * Checks if one of the current views on the screen is bound to a given context.
     *
     * @param oContext The context
     * @returns `true` or `false` if the current state is impacted or not
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(oContext) {
      const sPath = oContext.getPath();

      // First, check with the technical path. We have to try it, because for level > 1, we
      // uses technical keys even if Semantic keys are enabled
      if (this.oRouterProxy.isCurrentStateImpactedBy(sPath)) {
        return true;
      } else if (/^[^()]+\([^()]+\)$/.test(sPath)) {
        // If the current path can be semantic (i.e. is like xxx(yyy))
        // check with the semantic path if we can find it
        let sSemanticPath;
        if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
          // We have already resolved this semantic path
          sSemanticPath = this.oLastSemanticMapping.semanticPath;
        } else {
          sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext);
        }
        return sSemanticPath != sPath ? this.oRouterProxy.isCurrentStateImpactedBy(sSemanticPath) : false;
      } else {
        return false;
      }
    };
    _proto._findPathToNavigate = function _findPathToNavigate(sPath) {
      const regex = new RegExp("/[^/]*$");
      sPath = sPath.replace(regex, "");
      if (this.oRouter.match(sPath) || sPath === "") {
        return sPath;
      } else {
        return this._findPathToNavigate(sPath);
      }
    };
    _proto._checkIfContextSupportsSemanticPath = function _checkIfContextSupportsSemanticPath(oContext) {
      const sPath = oContext.getPath();

      // First, check if this is a level-1 object (path = /aaa(bbb))
      if (!/^\/[^(]+\([^)]+\)$/.test(sPath)) {
        return false;
      }

      // Then check if the entity has semantic keys
      const oMetaModel = oContext.getModel().getMetaModel();
      const sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name");
      if (!SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName)) {
        return false;
      }

      // Then check the entity is draft-enabled
      return ModelHelper.isDraftSupported(oMetaModel, sPath);
    };
    _proto._getPathFromContext = function _getPathFromContext(oContext, mParameters) {
      let sPath;
      if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding") && oContext.isRelative()) {
        sPath = oContext.getHeaderContext().getPath();
      } else {
        sPath = oContext.getPath();
      }
      if (mParameters.updateFCLLevel === -1) {
        // When navigating back from a context, we need to remove the last component of the path
        sPath = this._findPathToNavigate(sPath);

        // Check if we're navigating back to a semantic path that was previously resolved
        if (this.oLastSemanticMapping && this.oLastSemanticMapping.technicalPath === sPath) {
          sPath = this.oLastSemanticMapping.semanticPath;
        }
      } else if (this._checkIfContextSupportsSemanticPath(oContext)) {
        // We check if we have to use a semantic path
        const sSemanticPath = SemanticKeyHelper.getSemanticPath(oContext, true);
        if (!sSemanticPath) {
          // We were not able to build the semantic path --> Use the technical path and
          // clear the previous mapping, otherwise the old mapping is used in EditFlow#updateDocument
          // and it leads to unwanted page reloads
          this.setLastSemanticMapping(undefined);
        } else if (sSemanticPath !== sPath) {
          // Store the mapping technical <-> semantic path to avoid recalculating it later
          // and use the semantic path instead of the technical one
          this.setLastSemanticMapping({
            technicalPath: sPath,
            semanticPath: sSemanticPath
          });
          sPath = sSemanticPath;
        }
      }

      // remove extra '/' at the beginning of path
      if (sPath[0] === "/") {
        sPath = sPath.substring(1);
      }
      return sPath;
    };
    _proto._calculateLayout = function _calculateLayout(sPath, mParameters) {
      let FCLLevel = mParameters.FCLLevel;
      if (mParameters.updateFCLLevel) {
        FCLLevel += mParameters.updateFCLLevel;
        if (FCLLevel < 0) {
          FCLLevel = 0;
        }
      }

      // When navigating back, try to find the layout in the navigation history if it's not provided as parameter
      // (layout calculation is not handled properly by the FlexibleColumnLayoutSemanticHelper in this case)
      if (mParameters.updateFCLLevel < 0 && !mParameters.sLayout) {
        mParameters.sLayout = this.oRouterProxy.findLayoutForHash(sPath);
      }
      return this.oAppComponent.getRootViewController().calculateLayout(FCLLevel, sPath, mParameters.sLayout, mParameters.keepCurrentLayout);
    }

    /**
     * Event handler before a route is matched.
     * Displays a busy indicator.
     *
     */;
    _proto._beforeRouteMatched = function _beforeRouteMatched( /*oEvent: Event*/
    ) {
      const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (!bPlaceholderEnabled) {
        const oRootView = this.oAppComponent.getRootControl();
        BusyLocker.lock(oRootView);
      }
    }

    /**
     * Event handler when a route is matched.
     * Hides the busy indicator and fires its own 'routematched' event.
     *
     * @param oEvent The event
     */;
    _proto._onRouteMatched = function _onRouteMatched(oEvent) {
      const oAppStateHandler = this.oAppComponent.getAppStateHandler(),
        oRootView = this.oAppComponent.getRootControl();
      const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (BusyLocker.isLocked(oRootView) && !bPlaceholderEnabled) {
        BusyLocker.unlock(oRootView);
      }
      const mParameters = oEvent.getParameters();
      if (this.navigationInfoQueue.length) {
        mParameters.navigationInfo = this.navigationInfoQueue[0];
        this.navigationInfoQueue = this.navigationInfoQueue.slice(1);
      } else {
        mParameters.navigationInfo = {};
      }
      if (oAppStateHandler.checkIfRouteChangedByIApp()) {
        mParameters.navigationInfo.reason = NavigationReason.AppStateChanged;
        oAppStateHandler.resetRouteChangedByIApp();
      }
      this.sCurrentRouteName = oEvent.getParameter("name");
      this.sCurrentRoutePattern = mParameters.config.pattern;
      this.aCurrentViews = oEvent.getParameter("views");
      mParameters.routeInformation = this._getRouteInformation(this.sCurrentRouteName);
      mParameters.routePattern = this.sCurrentRoutePattern;
      this._fireRouteMatchEvents(mParameters);

      // Check if current hash has been set by the routerProxy.navToHash function
      // If not, rebuild history properly (both in the browser and the RouterProxy)
      if (!history.state || history.state.feLevel === undefined) {
        this.oRouterProxy.restoreHistory().then(() => {
          this.oRouterProxy.resolveRouteMatch();
        }).catch(function (oError) {
          Log.error("Error while restoring history", oError);
        });
      } else {
        this.oRouterProxy.resolveRouteMatch();
      }
    };
    _proto.attachRouteMatched = function attachRouteMatched(oData, fnFunction, oListener) {
      this.eventProvider.attachEvent("routeMatched", oData, fnFunction, oListener);
    };
    _proto.detachRouteMatched = function detachRouteMatched(fnFunction, oListener) {
      this.eventProvider.detachEvent("routeMatched", fnFunction, oListener);
    };
    _proto.attachAfterRouteMatched = function attachAfterRouteMatched(oData, fnFunction, oListener) {
      this.eventProvider.attachEvent("afterRouteMatched", oData, fnFunction, oListener);
    };
    _proto.detachAfterRouteMatched = function detachAfterRouteMatched(fnFunction, oListener) {
      this.eventProvider.detachEvent("afterRouteMatched", fnFunction, oListener);
    };
    _proto.getRouteFromHash = function getRouteFromHash(oRouter, oAppComponent) {
      const sHash = oRouter.getHashChanger().hash;
      const oRouteInfo = oRouter.getRouteInfoByHash(sHash);
      return oAppComponent.getMetadata().getManifestEntry("/sap.ui5/routing/routes").filter(function (oRoute) {
        return oRoute.name === oRouteInfo.name;
      })[0];
    };
    _proto.getTargetsFromRoute = function getTargetsFromRoute(oRoute) {
      const oTarget = oRoute.target;
      if (typeof oTarget === "string") {
        return [this._mTargets[oTarget]];
      } else {
        const aTarget = [];
        oTarget.forEach(sTarget => {
          aTarget.push(this._mTargets[sTarget]);
        });
        return aTarget;
      }
    };
    _proto.initializeRouting = async function initializeRouting() {
      // Attach router handlers
      await CollaborationHelper.processAndExpandHash();
      this._fnOnRouteMatched = this._onRouteMatched.bind(this);
      this.oRouter.attachRouteMatched(this._fnOnRouteMatched, this);
      const bPlaceholderEnabled = new Placeholder().isPlaceholderEnabled();
      if (!bPlaceholderEnabled) {
        this.oRouter.attachBeforeRouteMatched(this._beforeRouteMatched.bind(this));
      }
      // Reset internal state
      this.navigationInfoQueue = [];
      EditState.resetEditState();
      this.bExitOnNavigateBackToRoot = !this.oRouter.match("");
      const bIsIappState = this.oRouter.getHashChanger().getHash().indexOf("sap-iapp-state") !== -1;
      try {
        const oStartupParameters = await this.oAppComponent.getStartupParameters();
        const bHasStartUpParameters = oStartupParameters !== undefined && Object.keys(oStartupParameters).length !== 0;
        const sHash = this.oRouter.getHashChanger().getHash();
        // Manage startup parameters (in case of no iapp-state)
        if (!bIsIappState && bHasStartUpParameters && !sHash) {
          if (oStartupParameters.preferredMode && oStartupParameters.preferredMode[0].toUpperCase().indexOf("CREATE") !== -1) {
            // Create mode
            // This check will catch multiple modes like create, createWith and autoCreateWith which all need
            // to be handled like create startup!
            await this._manageCreateStartup(oStartupParameters);
          } else {
            // Deep link
            await this._manageDeepLinkStartup(oStartupParameters);
          }
        }
      } catch (oError) {
        Log.error("Error during routing initialization", oError);
      }
    };
    _proto.getDefaultCreateHash = function getDefaultCreateHash(oStartupParameters) {
      return AppStartupHelper.getDefaultCreateHash(oStartupParameters, this.getContextPath(), this.oRouter);
    };
    _proto._manageCreateStartup = function _manageCreateStartup(oStartupParameters) {
      return AppStartupHelper.getCreateStartupHash(oStartupParameters, this.getContextPath(), this.oRouter, this.oMetaModel).then(sNewHash => {
        if (sNewHash) {
          this.oRouter.getHashChanger().replaceHash(sNewHash);
          if (oStartupParameters !== null && oStartupParameters !== void 0 && oStartupParameters.preferredMode && oStartupParameters.preferredMode[0].toUpperCase().indexOf("AUTOCREATE") !== -1) {
            this.oAppComponent.setStartupModeAutoCreate();
          } else {
            this.oAppComponent.setStartupModeCreate();
          }
          this.bExitOnNavigateBackToRoot = true;
        }
      });
    };
    _proto._manageDeepLinkStartup = function _manageDeepLinkStartup(oStartupParameters) {
      return AppStartupHelper.getDeepLinkStartupHash(this.oAppComponent.getManifest()["sap.ui5"].routing, oStartupParameters, this.oModel).then(oDeepLink => {
        let sHash;
        if (oDeepLink.context) {
          const sTechnicalPath = oDeepLink.context.getPath();
          const sSemanticPath = this._checkIfContextSupportsSemanticPath(oDeepLink.context) ? SemanticKeyHelper.getSemanticPath(oDeepLink.context) : sTechnicalPath;
          if (sSemanticPath !== sTechnicalPath) {
            // Store the mapping technical <-> semantic path to avoid recalculating it later
            // and use the semantic path instead of the technical one
            this.setLastSemanticMapping({
              technicalPath: sTechnicalPath,
              semanticPath: sSemanticPath
            });
          }
          sHash = sSemanticPath.substring(1); // To remove the leading '/'
        } else if (oDeepLink.hash) {
          sHash = oDeepLink.hash;
        }
        if (sHash) {
          //Replace the hash with newly created hash
          this.oRouter.getHashChanger().replaceHash(sHash);
          this.oAppComponent.setStartupModeDeeplink();
        }
      });
    };
    _proto.getOutbounds = function getOutbounds() {
      return this.outbounds;
    }

    /**
     * Gets the name of the Draft root entity set or the sticky-enabled entity set.
     *
     * @returns The name of the root EntitySet
     * @ui5-restricted
     */;
    _proto.getContextPath = function getContextPath() {
      return this.sContextPath;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return RoutingService;
  }(Service);
  _exports.RoutingService = RoutingService;
  let RoutingServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(RoutingServiceFactory, _ServiceFactory);
    function RoutingServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto2 = RoutingServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      const oRoutingService = new RoutingService(oServiceContext);
      return oRoutingService.initPromise;
    };
    return RoutingServiceFactory;
  }(ServiceFactory);
  return RoutingServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb3V0aW5nU2VydmljZUV2ZW50aW5nIiwiZGVmaW5lVUk1Q2xhc3MiLCJldmVudCIsIkV2ZW50UHJvdmlkZXIiLCJSb3V0aW5nU2VydmljZSIsIm5hdmlnYXRpb25JbmZvUXVldWUiLCJpbml0Iiwib0NvbnRleHQiLCJnZXRDb250ZXh0Iiwic2NvcGVUeXBlIiwib0FwcENvbXBvbmVudCIsInNjb3BlT2JqZWN0Iiwib01vZGVsIiwiZ2V0TW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib1JvdXRlciIsImdldFJvdXRlciIsIm9Sb3V0ZXJQcm94eSIsImdldFJvdXRlclByb3h5IiwiZXZlbnRQcm92aWRlciIsIm9Sb3V0aW5nQ29uZmlnIiwiZ2V0TWFuaWZlc3RFbnRyeSIsInJvdXRpbmciLCJfcGFyc2VSb3V0aW5nQ29uZmlndXJhdGlvbiIsIm9BcHBDb25maWciLCJvdXRib3VuZHMiLCJjcm9zc05hdmlnYXRpb24iLCJpbml0UHJvbWlzZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiYmVmb3JlRXhpdCIsImRldGFjaFJvdXRlTWF0Y2hlZCIsIl9mbk9uUm91dGVNYXRjaGVkIiwiZmlyZUV2ZW50IiwiZXhpdCIsImRlc3Ryb3kiLCJpc0ZDTCIsImNvbmZpZyIsInJvdXRlckNsYXNzIiwiX21UYXJnZXRzIiwiT2JqZWN0Iiwia2V5cyIsInRhcmdldHMiLCJmb3JFYWNoIiwic1RhcmdldE5hbWUiLCJhc3NpZ24iLCJ0YXJnZXROYW1lIiwiY29udGV4dFBhdHRlcm4iLCJ1bmRlZmluZWQiLCJ2aWV3TGV2ZWwiLCJfZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4iLCJfbVJvdXRlcyIsInNSb3V0ZUtleSIsInJvdXRlcyIsIm9Sb3V0ZU1hbmlmZXN0SW5mbyIsImFSb3V0ZVRhcmdldHMiLCJBcnJheSIsImlzQXJyYXkiLCJ0YXJnZXQiLCJzUm91dGVOYW1lIiwibmFtZSIsInNSb3V0ZVBhdHRlcm4iLCJwYXR0ZXJuIiwibGVuZ3RoIiwiaW5kZXhPZiIsIkxvZyIsIndhcm5pbmciLCJpUm91dGVMZXZlbCIsInJvdXRlTGV2ZWwiLCJpIiwic1BhcmVudFRhcmdldE5hbWUiLCJwYXJlbnQiLCJwdXNoIiwiRkNMTGV2ZWwiLCJjb250cm9sQWdncmVnYXRpb24iLCJhTGV2ZWwwUm91dGVOYW1lcyIsImFMZXZlbDFSb3V0ZU5hbWVzIiwic0RlZmF1bHRSb3V0ZU5hbWUiLCJzTmFtZSIsImlMZXZlbCIsInNEZWZhdWx0VGFyZ2V0TmFtZSIsInNsaWNlIiwic0NvbnRleHRQYXRoIiwib3B0aW9ucyIsInNldHRpbmdzIiwib1NldHRpbmdzIiwiY29udGV4dFBhdGgiLCJlbnRpdHlTZXQiLCJtYXAiLCJzVGFyZ2V0S2V5Iiwic29ydCIsImEiLCJiIiwiZnVsbENvbnRleHRQYXRoIiwibmF2aWdhdGlvbiIsInNOYXZOYW1lIiwidGFyZ2V0Um91dGUiLCJkZXRhaWwiLCJyb3V0ZSIsInN0YXJ0c1dpdGgiLCJzUGF0dGVybiIsInJlcGxhY2UiLCJyZWdleCIsIlJlZ0V4cCIsIm1hdGNoIiwiX2dldFJvdXRlSW5mb3JtYXRpb24iLCJfZ2V0VGFyZ2V0SW5mb3JtYXRpb24iLCJfZ2V0Q29tcG9uZW50SWQiLCJzT3duZXJJZCIsInNDb21wb25lbnRJZCIsInN1YnN0ciIsImdldFRhcmdldEluZm9ybWF0aW9uRm9yIiwib0NvbXBvbmVudEluc3RhbmNlIiwic1RhcmdldENvbXBvbmVudElkIiwiX3NPd25lcklkIiwiZ2V0SWQiLCJzQ29ycmVjdFRhcmdldE5hbWUiLCJpZCIsInZpZXdJZCIsImdldExhc3RTZW1hbnRpY01hcHBpbmciLCJvTGFzdFNlbWFudGljTWFwcGluZyIsInNldExhc3RTZW1hbnRpY01hcHBpbmciLCJvTWFwcGluZyIsIm5hdmlnYXRlVG8iLCJtUGFyYW1ldGVyTWFwcGluZyIsImJQcmVzZXJ2ZUhpc3RvcnkiLCJzVGFyZ2V0VVJMUHJvbWlzZSIsImJJc1N0aWNreU1vZGUiLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIlNlbWFudGljS2V5SGVscGVyIiwiZ2V0U2VtYW50aWNQYXRoIiwicHJlcGFyZVBhcmFtZXRlcnMiLCJ0aGVuIiwibVBhcmFtZXRlcnMiLCJnZXRVUkwiLCJzVGFyZ2V0VVJMIiwibmF2VG9IYXNoIiwic1RhcmdldFJvdXRlIiwib1BhcmFtZXRlcnNQcm9taXNlIiwiZ2V0UGF0aCIsImFDb250ZXh0UGF0aFBhcnRzIiwic3BsaXQiLCJhQWxsUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcyIsInNQYXJhbWV0ZXJLZXkiLCJzUGFyYW1ldGVyTWFwcGluZ0V4cHJlc3Npb24iLCJvUGFyc2VkRXhwcmVzc2lvbiIsIkJpbmRpbmdQYXJzZXIiLCJjb21wbGV4UGFyc2VyIiwiYVBhcnRzIiwicGFydHMiLCJhUmVzb2x2ZWRQYXJhbWV0ZXJQcm9taXNlcyIsIm9QYXRoUGFydCIsImFSZWxhdGl2ZVBhcnRzIiwicGF0aCIsImFMb2NhbFBhcnRzIiwic1Byb3BlcnR5UGF0aCIsImpvaW4iLCJvTWV0YUNvbnRleHQiLCJnZXRNZXRhQ29udGV4dCIsInJlcXVlc3RQcm9wZXJ0eSIsIm9WYWx1ZSIsIm9Qcm9wZXJ0eUluZm8iLCJnZXRPYmplY3QiLCJzRWRtVHlwZSIsIiRUeXBlIiwiT0RhdGFVdGlscyIsImZvcm1hdExpdGVyYWwiLCJhbGwiLCJhUmVzb2x2ZWRQYXJhbWV0ZXJzIiwidmFsdWUiLCJmb3JtYXR0ZXIiLCJhcHBseSIsImtleSIsImFBbGxSZXNvbHZlZFBhcmFtZXRlcnMiLCJvUGFyYW1ldGVycyIsIm9SZXNvbHZlZFBhcmFtZXRlciIsIm9FcnJvciIsImVycm9yIiwiX2ZpcmVSb3V0ZU1hdGNoRXZlbnRzIiwiRWRpdFN0YXRlIiwiY2xlYW5Qcm9jZXNzZWRFZGl0U3RhdGUiLCJuYXZpZ2F0ZVRvQ29udGV4dCIsIm9WaWV3RGF0YSIsIm9DdXJyZW50VGFyZ2V0SW5mbyIsIm9Sb3V0ZVBhcmFtZXRlcnNQcm9taXNlIiwidGFyZ2V0UGF0aCIsIm9Sb3V0ZURldGFpbCIsInBhcmFtZXRlcnMiLCJpc0EiLCJzVGFyZ2V0UGF0aCIsIl9nZXRQYXRoRnJvbUNvbnRleHQiLCJiRXhpdE9uTmF2aWdhdGVCYWNrVG9Sb290IiwiZXhpdEZyb21BcHAiLCJhc3luY0NvbnRleHQiLCJiRGVmZXJyZWRDb250ZXh0Iiwic0xheW91dCIsIl9jYWxjdWxhdGVMYXlvdXQiLCJvTmF2aWdhdGlvbkluZm8iLCJvQXN5bmNDb250ZXh0IiwiYlRhcmdldEVkaXRhYmxlIiwiZWRpdGFibGUiLCJiUGVyc2lzdE9QU2Nyb2xsIiwiYkRyYWZ0TmF2aWdhdGlvbiIsImJTaG93UGxhY2Vob2xkZXIiLCJzaG93UGxhY2Vob2xkZXIiLCJyZWFzb24iLCJ1cGRhdGVGQ0xMZXZlbCIsImJSZWNyZWF0ZUNvbnRleHQiLCJ1c2VDb250ZXh0IiwibGlzdEJpbmRpbmdGb3JDcmVhdGUiLCJjaGVja05vSGFzaENoYW5nZSIsInNDdXJyZW50SGFzaE5vQXBwU3RhdGUiLCJnZXRIYXNoIiwibUV2ZW50UGFyYW1ldGVycyIsImdldFJvdXRlSW5mb0J5SGFzaCIsIm5hdmlnYXRpb25JbmZvIiwicm91dGVJbmZvcm1hdGlvbiIsInNDdXJyZW50Um91dGVOYW1lIiwicm91dGVQYXR0ZXJuIiwic0N1cnJlbnRSb3V0ZVBhdHRlcm4iLCJ2aWV3cyIsImFDdXJyZW50Vmlld3MiLCJzZXRGb2N1c0ZvcmNlZCIsImJGb3JjZUZvY3VzIiwidHJhbnNpZW50Iiwib1JvdXRlSW5mbyIsIm9Sb3V0ZSIsInNMYXN0VGFyZ2V0TmFtZSIsIm9UYXJnZXQiLCJtZXNzYWdlSGFuZGxpbmciLCJyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwib1JvdXRlUGFyYW1ldGVycyIsIm5hdlRvIiwibm9QcmVzZXJ2YXRpb25DYWNoZSIsImJOYXZpZ2F0ZWQiLCJwb3AiLCJuYXZpZ2F0ZVRvUm91dGUiLCJzVGFyZ2V0Um91dGVOYW1lIiwiaXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5Iiwic1BhdGgiLCJ0ZXN0Iiwic1NlbWFudGljUGF0aCIsInRlY2huaWNhbFBhdGgiLCJzZW1hbnRpY1BhdGgiLCJfZmluZFBhdGhUb05hdmlnYXRlIiwiX2NoZWNrSWZDb250ZXh0U3VwcG9ydHNTZW1hbnRpY1BhdGgiLCJzRW50aXR5U2V0TmFtZSIsImdldFNlbWFudGljS2V5cyIsImlzRHJhZnRTdXBwb3J0ZWQiLCJpc1JlbGF0aXZlIiwiZ2V0SGVhZGVyQ29udGV4dCIsInN1YnN0cmluZyIsImZpbmRMYXlvdXRGb3JIYXNoIiwiZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwiY2FsY3VsYXRlTGF5b3V0Iiwia2VlcEN1cnJlbnRMYXlvdXQiLCJfYmVmb3JlUm91dGVNYXRjaGVkIiwiYlBsYWNlaG9sZGVyRW5hYmxlZCIsIlBsYWNlaG9sZGVyIiwiaXNQbGFjZWhvbGRlckVuYWJsZWQiLCJvUm9vdFZpZXciLCJnZXRSb290Q29udHJvbCIsIkJ1c3lMb2NrZXIiLCJsb2NrIiwiX29uUm91dGVNYXRjaGVkIiwib0V2ZW50Iiwib0FwcFN0YXRlSGFuZGxlciIsImdldEFwcFN0YXRlSGFuZGxlciIsImlzTG9ja2VkIiwidW5sb2NrIiwiZ2V0UGFyYW1ldGVycyIsImNoZWNrSWZSb3V0ZUNoYW5nZWRCeUlBcHAiLCJOYXZpZ2F0aW9uUmVhc29uIiwiQXBwU3RhdGVDaGFuZ2VkIiwicmVzZXRSb3V0ZUNoYW5nZWRCeUlBcHAiLCJnZXRQYXJhbWV0ZXIiLCJoaXN0b3J5Iiwic3RhdGUiLCJmZUxldmVsIiwicmVzdG9yZUhpc3RvcnkiLCJyZXNvbHZlUm91dGVNYXRjaCIsImNhdGNoIiwiYXR0YWNoUm91dGVNYXRjaGVkIiwib0RhdGEiLCJmbkZ1bmN0aW9uIiwib0xpc3RlbmVyIiwiYXR0YWNoRXZlbnQiLCJkZXRhY2hFdmVudCIsImF0dGFjaEFmdGVyUm91dGVNYXRjaGVkIiwiZGV0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQiLCJnZXRSb3V0ZUZyb21IYXNoIiwic0hhc2giLCJnZXRIYXNoQ2hhbmdlciIsImhhc2giLCJnZXRNZXRhZGF0YSIsImZpbHRlciIsImdldFRhcmdldHNGcm9tUm91dGUiLCJhVGFyZ2V0Iiwic1RhcmdldCIsImluaXRpYWxpemVSb3V0aW5nIiwiQ29sbGFib3JhdGlvbkhlbHBlciIsInByb2Nlc3NBbmRFeHBhbmRIYXNoIiwiYmluZCIsImF0dGFjaEJlZm9yZVJvdXRlTWF0Y2hlZCIsInJlc2V0RWRpdFN0YXRlIiwiYklzSWFwcFN0YXRlIiwib1N0YXJ0dXBQYXJhbWV0ZXJzIiwiZ2V0U3RhcnR1cFBhcmFtZXRlcnMiLCJiSGFzU3RhcnRVcFBhcmFtZXRlcnMiLCJwcmVmZXJyZWRNb2RlIiwidG9VcHBlckNhc2UiLCJfbWFuYWdlQ3JlYXRlU3RhcnR1cCIsIl9tYW5hZ2VEZWVwTGlua1N0YXJ0dXAiLCJnZXREZWZhdWx0Q3JlYXRlSGFzaCIsIkFwcFN0YXJ0dXBIZWxwZXIiLCJnZXRDb250ZXh0UGF0aCIsImdldENyZWF0ZVN0YXJ0dXBIYXNoIiwic05ld0hhc2giLCJyZXBsYWNlSGFzaCIsInNldFN0YXJ0dXBNb2RlQXV0b0NyZWF0ZSIsInNldFN0YXJ0dXBNb2RlQ3JlYXRlIiwiZ2V0RGVlcExpbmtTdGFydHVwSGFzaCIsImdldE1hbmlmZXN0Iiwib0RlZXBMaW5rIiwiY29udGV4dCIsInNUZWNobmljYWxQYXRoIiwic2V0U3RhcnR1cE1vZGVEZWVwbGluayIsImdldE91dGJvdW5kcyIsImdldEludGVyZmFjZSIsIlNlcnZpY2UiLCJSb3V0aW5nU2VydmljZUZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsIm9TZXJ2aWNlQ29udGV4dCIsIm9Sb3V0aW5nU2VydmljZSIsIlNlcnZpY2VGYWN0b3J5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJSb3V0aW5nU2VydmljZUZhY3RvcnkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCBtZXNzYWdlSGFuZGxpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IFBsYWNlaG9sZGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9QbGFjZWhvbGRlclwiO1xuaW1wb3J0IE5hdmlnYXRpb25SZWFzb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvTmF2aWdhdGlvblJlYXNvblwiO1xuaW1wb3J0IHR5cGUgUm91dGVyUHJveHkgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL3JvdXRpbmcvUm91dGVyUHJveHlcIjtcbmltcG9ydCBBcHBTdGFydHVwSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0FwcFN0YXJ0dXBIZWxwZXJcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBldmVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEVkaXRTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9FZGl0U3RhdGVcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNlbWFudGljS2V5SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljS2V5SGVscGVyXCI7XG5pbXBvcnQgQ29sbGFib3JhdGlvbkhlbHBlciBmcm9tIFwic2FwL3N1aXRlL3VpL2NvbW1vbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uSGVscGVyXCI7XG5pbXBvcnQgQmluZGluZ1BhcnNlciBmcm9tIFwic2FwL3VpL2Jhc2UvQmluZGluZ1BhcnNlclwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgRXZlbnRQcm92aWRlciBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRQcm92aWRlclwiO1xuaW1wb3J0IHR5cGUgUm91dGVyIGZyb20gXCJzYXAvdWkvY29yZS9yb3V0aW5nL1JvdXRlclwiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSB7IGRlZmF1bHQgYXMgQ29udGV4dCwgZGVmYXVsdCBhcyBPRGF0YVY0Q29udGV4dCB9IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgT0RhdGFVdGlscyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhVXRpbHNcIjtcbmltcG9ydCB0eXBlIHsgU2VydmljZUNvbnRleHQgfSBmcm9tIFwidHlwZXMvbWV0YW1vZGVsX3R5cGVzXCI7XG5cbnR5cGUgUm91dGluZ1NlcnZpY2VTZXR0aW5ncyA9IHt9O1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuc2VydmljZXMuUm91dGluZ1NlcnZpY2VFdmVudGluZ1wiKVxuY2xhc3MgUm91dGluZ1NlcnZpY2VFdmVudGluZyBleHRlbmRzIEV2ZW50UHJvdmlkZXIge1xuXHRAZXZlbnQoKVxuXHRyb3V0ZU1hdGNoZWQhOiBGdW5jdGlvbjtcblxuXHRAZXZlbnQoKVxuXHRhZnRlclJvdXRlTWF0Y2hlZCE6IEZ1bmN0aW9uO1xufVxuXG5leHBvcnQgdHlwZSBSb3V0aW5nTmF2aWdhdGlvbkluZm8gPSB7XG5cdG9Bc3luY0NvbnRleHQ/OiBQcm9taXNlPE9EYXRhVjRDb250ZXh0Pjtcblx0YkRlZmVycmVkQ29udGV4dD86IGJvb2xlYW47XG5cdGJUYXJnZXRFZGl0YWJsZT86IGJvb2xlYW47XG5cdGJQZXJzaXN0T1BTY3JvbGw/OiBib29sZWFuO1xuXHRiRHJhZnROYXZpZ2F0aW9uPzogYm9vbGVhbjtcblx0YlNob3dQbGFjZWhvbGRlcj86IGJvb2xlYW47XG5cdHVzZUNvbnRleHQ/OiBDb250ZXh0O1xuXHRsaXN0QmluZGluZ0ZvckNyZWF0ZT86IE9EYXRhTGlzdEJpbmRpbmc7XG5cdHJlYXNvbj86IE5hdmlnYXRpb25SZWFzb247XG5cdHJlZGlyZWN0ZWRUb05vbkRyYWZ0Pzogc3RyaW5nO1xuXHRiQWN0aW9uQ3JlYXRlPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFNlbWFudGljTWFwcGluZyA9IHtcblx0c2VtYW50aWNQYXRoOiBzdHJpbmc7XG5cdHRlY2huaWNhbFBhdGg6IHN0cmluZztcbn07XG5leHBvcnQgY2xhc3MgUm91dGluZ1NlcnZpY2UgZXh0ZW5kcyBTZXJ2aWNlPFJvdXRpbmdTZXJ2aWNlU2V0dGluZ3M+IHtcblx0b0FwcENvbXBvbmVudCE6IEFwcENvbXBvbmVudDtcblxuXHRvTW9kZWwhOiBPRGF0YU1vZGVsO1xuXG5cdG9NZXRhTW9kZWwhOiBPRGF0YU1ldGFNb2RlbDtcblxuXHRvUm91dGVyITogUm91dGVyO1xuXG5cdG9Sb3V0ZXJQcm94eSE6IFJvdXRlclByb3h5O1xuXG5cdGV2ZW50UHJvdmlkZXIhOiBFdmVudFByb3ZpZGVyO1xuXG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXG5cdG91dGJvdW5kczogYW55O1xuXG5cdF9tVGFyZ2V0czogYW55O1xuXG5cdF9tUm91dGVzOiBhbnk7XG5cblx0b0xhc3RTZW1hbnRpY01hcHBpbmc/OiBTZW1hbnRpY01hcHBpbmc7XG5cblx0YkV4aXRPbk5hdmlnYXRlQmFja1RvUm9vdD86IGJvb2xlYW47XG5cblx0c0N1cnJlbnRSb3V0ZU5hbWU/OiBzdHJpbmc7XG5cblx0c0N1cnJlbnRSb3V0ZVBhdHRlcm4/OiBzdHJpbmc7XG5cblx0YUN1cnJlbnRWaWV3cz86IGFueVtdO1xuXG5cdG5hdmlnYXRpb25JbmZvUXVldWU6IFJvdXRpbmdOYXZpZ2F0aW9uSW5mb1tdID0gW107XG5cblx0c0NvbnRleHRQYXRoITogc3RyaW5nO1xuXG5cdF9mbk9uUm91dGVNYXRjaGVkITogRnVuY3Rpb247XG5cblx0aW5pdCgpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGlmIChvQ29udGV4dC5zY29wZVR5cGUgPT09IFwiY29tcG9uZW50XCIpIHtcblx0XHRcdHRoaXMub0FwcENvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdFx0dGhpcy5vTW9kZWwgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsO1xuXHRcdFx0dGhpcy5vTWV0YU1vZGVsID0gdGhpcy5vTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHR0aGlzLm9Sb3V0ZXIgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um91dGVyKCk7XG5cdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eSA9IHRoaXMub0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpO1xuXHRcdFx0dGhpcy5ldmVudFByb3ZpZGVyID0gbmV3IChSb3V0aW5nU2VydmljZUV2ZW50aW5nIGFzIGFueSkoKTtcblxuXHRcdFx0Y29uc3Qgb1JvdXRpbmdDb25maWcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcInNhcC51aTVcIikucm91dGluZztcblx0XHRcdHRoaXMuX3BhcnNlUm91dGluZ0NvbmZpZ3VyYXRpb24ob1JvdXRpbmdDb25maWcpO1xuXG5cdFx0XHRjb25zdCBvQXBwQ29uZmlnID0gdGhpcy5vQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0RW50cnkoXCJzYXAuYXBwXCIpO1xuXHRcdFx0dGhpcy5vdXRib3VuZHMgPSBvQXBwQ29uZmlnLmNyb3NzTmF2aWdhdGlvbj8ub3V0Ym91bmRzO1xuXHRcdH1cblxuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodGhpcyk7XG5cdH1cblxuXHRiZWZvcmVFeGl0KCkge1xuXHRcdHRoaXMub1JvdXRlci5kZXRhY2hSb3V0ZU1hdGNoZWQodGhpcy5fZm5PblJvdXRlTWF0Y2hlZCwgdGhpcyk7XG5cdFx0dGhpcy5ldmVudFByb3ZpZGVyLmZpcmVFdmVudChcInJvdXRlTWF0Y2hlZFwiLCB7fSk7XG5cdH1cblxuXHRleGl0KCkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5kZXN0cm95KCk7XG5cdH1cblxuXHQvKipcblx0ICogUGFyc2UgYSBtYW5pZmVzdCByb3V0aW5nIGNvbmZpZ3VyYXRpb24gZm9yIGludGVybmFsIHVzYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1JvdXRpbmdDb25maWcgVGhlIHJvdXRpbmcgY29uZmlndXJhdGlvbiBmcm9tIHRoZSBtYW5pZmVzdFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3BhcnNlUm91dGluZ0NvbmZpZ3VyYXRpb24ob1JvdXRpbmdDb25maWc6IGFueSkge1xuXHRcdGNvbnN0IGlzRkNMID0gb1JvdXRpbmdDb25maWc/LmNvbmZpZz8ucm91dGVyQ2xhc3MgPT09IFwic2FwLmYucm91dGluZy5Sb3V0ZXJcIjtcblxuXHRcdC8vIEluZm9ybWF0aW9uIG9mIHRhcmdldHNcblx0XHR0aGlzLl9tVGFyZ2V0cyA9IHt9O1xuXHRcdE9iamVjdC5rZXlzKG9Sb3V0aW5nQ29uZmlnLnRhcmdldHMpLmZvckVhY2goKHNUYXJnZXROYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXSA9IE9iamVjdC5hc3NpZ24oeyB0YXJnZXROYW1lOiBzVGFyZ2V0TmFtZSB9LCBvUm91dGluZ0NvbmZpZy50YXJnZXRzW3NUYXJnZXROYW1lXSk7XG5cblx0XHRcdC8vIFZpZXcgbGV2ZWwgZm9yIEZDTCBjYXNlcyBpcyBjYWxjdWxhdGVkIGZyb20gdGhlIHRhcmdldCBwYXR0ZXJuXG5cdFx0XHRpZiAodGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLmNvbnRleHRQYXR0ZXJuICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLnZpZXdMZXZlbCA9IHRoaXMuX2dldFZpZXdMZXZlbEZyb21QYXR0ZXJuKHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5jb250ZXh0UGF0dGVybiwgMCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBJbmZvcm1hdGlvbiBvZiByb3V0ZXNcblx0XHR0aGlzLl9tUm91dGVzID0ge307XG5cdFx0Zm9yIChjb25zdCBzUm91dGVLZXkgaW4gb1JvdXRpbmdDb25maWcucm91dGVzKSB7XG5cdFx0XHRjb25zdCBvUm91dGVNYW5pZmVzdEluZm8gPSBvUm91dGluZ0NvbmZpZy5yb3V0ZXNbc1JvdXRlS2V5XSxcblx0XHRcdFx0YVJvdXRlVGFyZ2V0cyA9IEFycmF5LmlzQXJyYXkob1JvdXRlTWFuaWZlc3RJbmZvLnRhcmdldCkgPyBvUm91dGVNYW5pZmVzdEluZm8udGFyZ2V0IDogW29Sb3V0ZU1hbmlmZXN0SW5mby50YXJnZXRdLFxuXHRcdFx0XHRzUm91dGVOYW1lID0gQXJyYXkuaXNBcnJheShvUm91dGluZ0NvbmZpZy5yb3V0ZXMpID8gb1JvdXRlTWFuaWZlc3RJbmZvLm5hbWUgOiBzUm91dGVLZXksXG5cdFx0XHRcdHNSb3V0ZVBhdHRlcm4gPSBvUm91dGVNYW5pZmVzdEluZm8ucGF0dGVybjtcblxuXHRcdFx0Ly8gQ2hlY2sgcm91dGUgcGF0dGVybjogYWxsIHBhdHRlcm5zIG5lZWQgdG8gZW5kIHdpdGggJzo/cXVlcnk6JywgdGhhdCB3ZSB1c2UgZm9yIHBhcmFtZXRlcnNcblx0XHRcdGlmIChzUm91dGVQYXR0ZXJuLmxlbmd0aCA8IDggfHwgc1JvdXRlUGF0dGVybi5pbmRleE9mKFwiOj9xdWVyeTpcIikgIT09IHNSb3V0ZVBhdHRlcm4ubGVuZ3RoIC0gOCkge1xuXHRcdFx0XHRMb2cud2FybmluZyhgUGF0dGVybiBmb3Igcm91dGUgJHtzUm91dGVOYW1lfSBkb2Vzbid0IGVuZCB3aXRoICc6P3F1ZXJ5OicgOiAke3NSb3V0ZVBhdHRlcm59YCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBpUm91dGVMZXZlbCA9IHRoaXMuX2dldFZpZXdMZXZlbEZyb21QYXR0ZXJuKHNSb3V0ZVBhdHRlcm4sIDApO1xuXHRcdFx0dGhpcy5fbVJvdXRlc1tzUm91dGVOYW1lXSA9IHtcblx0XHRcdFx0bmFtZTogc1JvdXRlTmFtZSxcblx0XHRcdFx0cGF0dGVybjogc1JvdXRlUGF0dGVybixcblx0XHRcdFx0dGFyZ2V0czogYVJvdXRlVGFyZ2V0cyxcblx0XHRcdFx0cm91dGVMZXZlbDogaVJvdXRlTGV2ZWxcblx0XHRcdH07XG5cblx0XHRcdC8vIEFkZCB0aGUgcGFyZW50IHRhcmdldHMgaW4gdGhlIGxpc3Qgb2YgdGFyZ2V0cyBmb3IgdGhlIHJvdXRlXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFSb3V0ZVRhcmdldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3Qgc1BhcmVudFRhcmdldE5hbWUgPSB0aGlzLl9tVGFyZ2V0c1thUm91dGVUYXJnZXRzW2ldXS5wYXJlbnQ7XG5cdFx0XHRcdGlmIChzUGFyZW50VGFyZ2V0TmFtZSkge1xuXHRcdFx0XHRcdGFSb3V0ZVRhcmdldHMucHVzaChzUGFyZW50VGFyZ2V0TmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCFpc0ZDTCkge1xuXHRcdFx0XHQvLyBWaWV3IGxldmVsIGZvciBub24tRkNMIGNhc2VzIGlzIGNhbGN1bGF0ZWQgZnJvbSB0aGUgcm91dGUgcGF0dGVyblxuXHRcdFx0XHRpZiAodGhpcy5fbVRhcmdldHNbYVJvdXRlVGFyZ2V0c1swXV0udmlld0xldmVsID09PSB1bmRlZmluZWQgfHwgdGhpcy5fbVRhcmdldHNbYVJvdXRlVGFyZ2V0c1swXV0udmlld0xldmVsIDwgaVJvdXRlTGV2ZWwpIHtcblx0XHRcdFx0XHQvLyBUaGVyZSBhcmUgY2FzZXMgd2hlbiBkaWZmZXJlbnQgcm91dGVzIHBvaW50IHRvIHRoZSBzYW1lIHRhcmdldC4gV2UgdGFrZSB0aGVcblx0XHRcdFx0XHQvLyBsYXJnZXN0IHZpZXdMZXZlbCBpbiB0aGF0IGNhc2UuXG5cdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbYVJvdXRlVGFyZ2V0c1swXV0udmlld0xldmVsID0gaVJvdXRlTGV2ZWw7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBGQ0wgbGV2ZWwgZm9yIG5vbi1GQ0wgY2FzZXMgaXMgZXF1YWwgdG8gLTFcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbYVJvdXRlVGFyZ2V0c1swXV0uRkNMTGV2ZWwgPSAtMTtcblx0XHRcdH0gZWxzZSBpZiAoYVJvdXRlVGFyZ2V0cy5sZW5ndGggPT09IDEgJiYgdGhpcy5fbVRhcmdldHNbYVJvdXRlVGFyZ2V0c1swXV0uY29udHJvbEFnZ3JlZ2F0aW9uICE9PSBcImJlZ2luQ29sdW1uUGFnZXNcIikge1xuXHRcdFx0XHQvLyBXZSdyZSBpbiB0aGUgY2FzZSB3aGVyZSB0aGVyZSdzIG9ubHkgMSB0YXJnZXQgZm9yIHRoZSByb3V0ZSwgYW5kIGl0J3Mgbm90IGluIHRoZSBmaXJzdCBjb2x1bW5cblx0XHRcdFx0Ly8gLS0+IHRoaXMgaXMgYSBmdWxsc2NyZWVuIGNvbHVtbiBhZnRlciBhbGwgY29sdW1ucyBpbiB0aGUgRkNMIGhhdmUgYmVlbiB1c2VkXG5cdFx0XHRcdHRoaXMuX21UYXJnZXRzW2FSb3V0ZVRhcmdldHNbMF1dLkZDTExldmVsID0gMztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIE90aGVyIEZDTCBjYXNlc1xuXHRcdFx0XHRhUm91dGVUYXJnZXRzLmZvckVhY2goKHNUYXJnZXROYW1lOiBhbnkpID0+IHtcblx0XHRcdFx0XHRzd2l0Y2ggKHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5jb250cm9sQWdncmVnYXRpb24pIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJiZWdpbkNvbHVtblBhZ2VzXCI6XG5cdFx0XHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5GQ0xMZXZlbCA9IDA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0XHRjYXNlIFwibWlkQ29sdW1uUGFnZXNcIjpcblx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLkZDTExldmVsID0gMTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5GQ0xMZXZlbCA9IDI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBQcm9wYWdhdGUgdmlld0xldmVsLCBjb250ZXh0UGF0dGVybiwgRkNMTGV2ZWwgYW5kIGNvbnRyb2xBZ2dyZWdhdGlvbiB0byBwYXJlbnQgdGFyZ2V0c1xuXHRcdE9iamVjdC5rZXlzKHRoaXMuX21UYXJnZXRzKS5mb3JFYWNoKChzVGFyZ2V0TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHR3aGlsZSAodGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLnBhcmVudCkge1xuXHRcdFx0XHRjb25zdCBzUGFyZW50VGFyZ2V0TmFtZSA9IHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5wYXJlbnQ7XG5cdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS52aWV3TGV2ZWwgPVxuXHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS52aWV3TGV2ZWwgfHwgdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLnZpZXdMZXZlbDtcblx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1BhcmVudFRhcmdldE5hbWVdLmNvbnRleHRQYXR0ZXJuID1cblx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzUGFyZW50VGFyZ2V0TmFtZV0uY29udGV4dFBhdHRlcm4gfHwgdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLmNvbnRleHRQYXR0ZXJuO1xuXHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzUGFyZW50VGFyZ2V0TmFtZV0uRkNMTGV2ZWwgPVxuXHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS5GQ0xMZXZlbCB8fCB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uRkNMTGV2ZWw7XG5cdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS5jb250cm9sQWdncmVnYXRpb24gPVxuXHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NQYXJlbnRUYXJnZXROYW1lXS5jb250cm9sQWdncmVnYXRpb24gfHwgdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLmNvbnRyb2xBZ2dyZWdhdGlvbjtcblx0XHRcdFx0c1RhcmdldE5hbWUgPSBzUGFyZW50VGFyZ2V0TmFtZTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIERldGVybWluZSB0aGUgcm9vdCBlbnRpdHkgZm9yIHRoZSBhcHBcblx0XHRjb25zdCBhTGV2ZWwwUm91dGVOYW1lcyA9IFtdO1xuXHRcdGNvbnN0IGFMZXZlbDFSb3V0ZU5hbWVzID0gW107XG5cdFx0bGV0IHNEZWZhdWx0Um91dGVOYW1lO1xuXG5cdFx0Zm9yIChjb25zdCBzTmFtZSBpbiB0aGlzLl9tUm91dGVzKSB7XG5cdFx0XHRjb25zdCBpTGV2ZWwgPSB0aGlzLl9tUm91dGVzW3NOYW1lXS5yb3V0ZUxldmVsO1xuXHRcdFx0aWYgKGlMZXZlbCA9PT0gMCkge1xuXHRcdFx0XHRhTGV2ZWwwUm91dGVOYW1lcy5wdXNoKHNOYW1lKTtcblx0XHRcdH0gZWxzZSBpZiAoaUxldmVsID09PSAxKSB7XG5cdFx0XHRcdGFMZXZlbDFSb3V0ZU5hbWVzLnB1c2goc05hbWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChhTGV2ZWwwUm91dGVOYW1lcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHNEZWZhdWx0Um91dGVOYW1lID0gYUxldmVsMFJvdXRlTmFtZXNbMF07XG5cdFx0fSBlbHNlIGlmIChhTGV2ZWwxUm91dGVOYW1lcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHNEZWZhdWx0Um91dGVOYW1lID0gYUxldmVsMVJvdXRlTmFtZXNbMF07XG5cdFx0fVxuXG5cdFx0aWYgKHNEZWZhdWx0Um91dGVOYW1lKSB7XG5cdFx0XHRjb25zdCBzRGVmYXVsdFRhcmdldE5hbWUgPSB0aGlzLl9tUm91dGVzW3NEZWZhdWx0Um91dGVOYW1lXS50YXJnZXRzLnNsaWNlKC0xKVswXTtcblx0XHRcdHRoaXMuc0NvbnRleHRQYXRoID0gXCJcIjtcblx0XHRcdGlmICh0aGlzLl9tVGFyZ2V0c1tzRGVmYXVsdFRhcmdldE5hbWVdLm9wdGlvbnMgJiYgdGhpcy5fbVRhcmdldHNbc0RlZmF1bHRUYXJnZXROYW1lXS5vcHRpb25zLnNldHRpbmdzKSB7XG5cdFx0XHRcdGNvbnN0IG9TZXR0aW5ncyA9IHRoaXMuX21UYXJnZXRzW3NEZWZhdWx0VGFyZ2V0TmFtZV0ub3B0aW9ucy5zZXR0aW5ncztcblx0XHRcdFx0dGhpcy5zQ29udGV4dFBhdGggPSBvU2V0dGluZ3MuY29udGV4dFBhdGggfHwgYC8ke29TZXR0aW5ncy5lbnRpdHlTZXR9YDtcblx0XHRcdH1cblx0XHRcdGlmICghdGhpcy5zQ29udGV4dFBhdGgpIHtcblx0XHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFx0YENhbm5vdCBkZXRlcm1pbmUgZGVmYXVsdCBjb250ZXh0UGF0aDogY29udGV4dFBhdGggb3IgZW50aXR5U2V0IG1pc3NpbmcgaW4gZGVmYXVsdCB0YXJnZXQ6ICR7c0RlZmF1bHRUYXJnZXROYW1lfWBcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJDYW5ub3QgZGV0ZXJtaW5lIGRlZmF1bHQgY29udGV4dFBhdGg6IG5vIGRlZmF1bHQgcm91dGUgZm91bmQuXCIpO1xuXHRcdH1cblxuXHRcdC8vIFdlIG5lZWQgdG8gZXN0YWJsaXNoIHRoZSBjb3JyZWN0IHBhdGggdG8gdGhlIGRpZmZlcmVudCBwYWdlcywgaW5jbHVkaW5nIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcblx0XHRPYmplY3Qua2V5cyh0aGlzLl9tVGFyZ2V0cylcblx0XHRcdC5tYXAoKHNUYXJnZXRLZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fbVRhcmdldHNbc1RhcmdldEtleV07XG5cdFx0XHR9KVxuXHRcdFx0LnNvcnQoKGE6IGFueSwgYjogYW55KSA9PiB7XG5cdFx0XHRcdHJldHVybiBhLnZpZXdMZXZlbCA8IGIudmlld0xldmVsID8gLTEgOiAxO1xuXHRcdFx0fSlcblx0XHRcdC5mb3JFYWNoKCh0YXJnZXQ6IGFueSkgPT4ge1xuXHRcdFx0XHQvLyBBZnRlciBzb3J0aW5nIHRoZSB0YXJnZXRzIHBlciBsZXZlbCB3ZSBjYW4gdGhlbiBnbyB0aHJvdWdoIHRoZWlyIG5hdmlnYXRpb24gb2JqZWN0IGFuZCB1cGRhdGUgdGhlIHBhdGhzIGFjY29yZGluZ2x5LlxuXHRcdFx0XHRpZiAodGFyZ2V0Lm9wdGlvbnMpIHtcblx0XHRcdFx0XHRjb25zdCBzZXR0aW5ncyA9IHRhcmdldC5vcHRpb25zLnNldHRpbmdzO1xuXHRcdFx0XHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IHNldHRpbmdzLmNvbnRleHRQYXRoIHx8IChzZXR0aW5ncy5lbnRpdHlTZXQgPyBgLyR7c2V0dGluZ3MuZW50aXR5U2V0fWAgOiBcIlwiKTtcblx0XHRcdFx0XHRpZiAoIXNldHRpbmdzLmZ1bGxDb250ZXh0UGF0aCAmJiBzQ29udGV4dFBhdGgpIHtcblx0XHRcdFx0XHRcdHNldHRpbmdzLmZ1bGxDb250ZXh0UGF0aCA9IGAke3NDb250ZXh0UGF0aH0vYDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0T2JqZWN0LmtleXMoc2V0dGluZ3MubmF2aWdhdGlvbiB8fCB7fSkuZm9yRWFjaCgoc05hdk5hbWU6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIG5hdmlnYXRpb24gcHJvcGVydHlcblx0XHRcdFx0XHRcdGNvbnN0IHRhcmdldFJvdXRlID0gdGhpcy5fbVJvdXRlc1tzZXR0aW5ncy5uYXZpZ2F0aW9uW3NOYXZOYW1lXS5kZXRhaWwucm91dGVdO1xuXHRcdFx0XHRcdFx0aWYgKHRhcmdldFJvdXRlICYmIHRhcmdldFJvdXRlLnRhcmdldHMpIHtcblx0XHRcdFx0XHRcdFx0dGFyZ2V0Um91dGUudGFyZ2V0cy5mb3JFYWNoKChzVGFyZ2V0TmFtZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLm9wdGlvbnMgJiZcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXS5vcHRpb25zLnNldHRpbmdzICYmXG5cdFx0XHRcdFx0XHRcdFx0XHQhdGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLm9wdGlvbnMuc2V0dGluZ3MuZnVsbENvbnRleHRQYXRoXG5cdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGFyZ2V0LnZpZXdMZXZlbCA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0ub3B0aW9ucy5zZXR0aW5ncy5mdWxsQ29udGV4dFBhdGggPSBgJHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQoc05hdk5hbWUuc3RhcnRzV2l0aChcIi9cIikgPyBcIlwiIDogXCIvXCIpICsgc05hdk5hbWVcblx0XHRcdFx0XHRcdFx0XHRcdFx0fS9gO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5fbVRhcmdldHNbc1RhcmdldE5hbWVdLm9wdGlvbnMuc2V0dGluZ3MuZnVsbENvbnRleHRQYXRoID0gYCR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2V0dGluZ3MuZnVsbENvbnRleHRQYXRoICsgc05hdk5hbWVcblx0XHRcdFx0XHRcdFx0XHRcdFx0fS9gO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgYSB2aWV3IGxldmVsIGZyb20gYSBwYXR0ZXJuIGJ5IGNvdW50aW5nIHRoZSBudW1iZXIgb2Ygc2VnbWVudHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUGF0dGVybiBUaGUgcGF0dGVyblxuXHQgKiBAcGFyYW0gdmlld0xldmVsIFRoZSBjdXJyZW50IGxldmVsIG9mIHZpZXdcblx0ICogQHJldHVybnMgVGhlIGxldmVsXG5cdCAqL1xuXHRfZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4oc1BhdHRlcm46IHN0cmluZywgdmlld0xldmVsOiBudW1iZXIpOiBudW1iZXIge1xuXHRcdHNQYXR0ZXJuID0gc1BhdHRlcm4ucmVwbGFjZShcIjo/cXVlcnk6XCIsIFwiXCIpO1xuXHRcdGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cChcIi9bXi9dKiRcIik7XG5cdFx0aWYgKHNQYXR0ZXJuICYmIHNQYXR0ZXJuWzBdICE9PSBcIi9cIiAmJiBzUGF0dGVyblswXSAhPT0gXCI/XCIpIHtcblx0XHRcdHNQYXR0ZXJuID0gYC8ke3NQYXR0ZXJufWA7XG5cdFx0fVxuXHRcdGlmIChzUGF0dGVybi5sZW5ndGgpIHtcblx0XHRcdHNQYXR0ZXJuID0gc1BhdHRlcm4ucmVwbGFjZShyZWdleCwgXCJcIik7XG5cdFx0XHRpZiAodGhpcy5vUm91dGVyLm1hdGNoKHNQYXR0ZXJuKSB8fCBzUGF0dGVybiA9PT0gXCJcIikge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fZ2V0Vmlld0xldmVsRnJvbVBhdHRlcm4oc1BhdHRlcm4sICsrdmlld0xldmVsKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9nZXRWaWV3TGV2ZWxGcm9tUGF0dGVybihzUGF0dGVybiwgdmlld0xldmVsKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHZpZXdMZXZlbDtcblx0XHR9XG5cdH1cblxuXHRfZ2V0Um91dGVJbmZvcm1hdGlvbihzUm91dGVOYW1lOiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5fbVJvdXRlc1tzUm91dGVOYW1lXTtcblx0fVxuXG5cdF9nZXRUYXJnZXRJbmZvcm1hdGlvbihzVGFyZ2V0TmFtZTogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuX21UYXJnZXRzW3NUYXJnZXROYW1lXTtcblx0fVxuXG5cdF9nZXRDb21wb25lbnRJZChzT3duZXJJZDogYW55LCBzQ29tcG9uZW50SWQ6IGFueSkge1xuXHRcdGlmIChzQ29tcG9uZW50SWQuaW5kZXhPZihgJHtzT3duZXJJZH0tLS1gKSA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIHNDb21wb25lbnRJZC5zdWJzdHIoc093bmVySWQubGVuZ3RoICsgMyk7XG5cdFx0fVxuXHRcdHJldHVybiBzQ29tcG9uZW50SWQ7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRhcmdldCBpbmZvcm1hdGlvbiBmb3IgYSBnaXZlbiBjb21wb25lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29tcG9uZW50SW5zdGFuY2UgSW5zdGFuY2Ugb2YgdGhlIGNvbXBvbmVudFxuXHQgKiBAcmV0dXJucyBUaGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHRhcmdldFxuXHQgKi9cblx0Z2V0VGFyZ2V0SW5mb3JtYXRpb25Gb3Iob0NvbXBvbmVudEluc3RhbmNlOiBhbnkpIHtcblx0XHRjb25zdCBzVGFyZ2V0Q29tcG9uZW50SWQgPSB0aGlzLl9nZXRDb21wb25lbnRJZChvQ29tcG9uZW50SW5zdGFuY2UuX3NPd25lcklkLCBvQ29tcG9uZW50SW5zdGFuY2UuZ2V0SWQoKSk7XG5cdFx0bGV0IHNDb3JyZWN0VGFyZ2V0TmFtZSA9IG51bGw7XG5cdFx0T2JqZWN0LmtleXModGhpcy5fbVRhcmdldHMpLmZvckVhY2goKHNUYXJnZXROYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdGlmICh0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0uaWQgPT09IHNUYXJnZXRDb21wb25lbnRJZCB8fCB0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0TmFtZV0udmlld0lkID09PSBzVGFyZ2V0Q29tcG9uZW50SWQpIHtcblx0XHRcdFx0c0NvcnJlY3RUYXJnZXROYW1lID0gc1RhcmdldE5hbWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHRoaXMuX2dldFRhcmdldEluZm9ybWF0aW9uKHNDb3JyZWN0VGFyZ2V0TmFtZSk7XG5cdH1cblxuXHRnZXRMYXN0U2VtYW50aWNNYXBwaW5nKCk6IFNlbWFudGljTWFwcGluZyB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmc7XG5cdH1cblxuXHRzZXRMYXN0U2VtYW50aWNNYXBwaW5nKG9NYXBwaW5nPzogU2VtYW50aWNNYXBwaW5nKSB7XG5cdFx0dGhpcy5vTGFzdFNlbWFudGljTWFwcGluZyA9IG9NYXBwaW5nO1xuXHR9XG5cblx0bmF2aWdhdGVUbyhvQ29udGV4dDogYW55LCBzUm91dGVOYW1lOiBhbnksIG1QYXJhbWV0ZXJNYXBwaW5nOiBhbnksIGJQcmVzZXJ2ZUhpc3Rvcnk6IGFueSkge1xuXHRcdGxldCBzVGFyZ2V0VVJMUHJvbWlzZSwgYklzU3RpY2t5TW9kZTogYm9vbGVhbjtcblx0XHRpZiAob0NvbnRleHQuZ2V0TW9kZWwoKSAmJiBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCAmJiBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpKSB7XG5cdFx0XHRiSXNTdGlja3lNb2RlID0gTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkpO1xuXHRcdH1cblx0XHRpZiAoIW1QYXJhbWV0ZXJNYXBwaW5nKSB7XG5cdFx0XHQvLyBpZiB0aGVyZSBpcyBubyBwYXJhbWV0ZXIgbWFwcGluZyBkZWZpbmUgdGhpcyBtZWFuIHdlIHJlbHkgZW50aXJlbHkgb24gdGhlIGJpbmRpbmcgY29udGV4dCBwYXRoXG5cdFx0XHRzVGFyZ2V0VVJMUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZShTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY1BhdGgob0NvbnRleHQpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1RhcmdldFVSTFByb21pc2UgPSB0aGlzLnByZXBhcmVQYXJhbWV0ZXJzKG1QYXJhbWV0ZXJNYXBwaW5nLCBzUm91dGVOYW1lLCBvQ29udGV4dCkudGhlbigobVBhcmFtZXRlcnM6IGFueSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5vUm91dGVyLmdldFVSTChzUm91dGVOYW1lLCBtUGFyYW1ldGVycyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHNUYXJnZXRVUkxQcm9taXNlLnRoZW4oKHNUYXJnZXRVUkw6IGFueSkgPT4ge1xuXHRcdFx0dGhpcy5vUm91dGVyUHJveHkubmF2VG9IYXNoKHNUYXJnZXRVUkwsIGJQcmVzZXJ2ZUhpc3RvcnksIGZhbHNlLCBmYWxzZSwgIWJJc1N0aWNreU1vZGUpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byByZXR1cm4gYSBtYXAgb2Ygcm91dGluZyB0YXJnZXQgcGFyYW1ldGVycyB3aGVyZSB0aGUgYmluZGluZyBzeW50YXggaXMgcmVzb2x2ZWQgdG8gdGhlIGN1cnJlbnQgbW9kZWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBQYXJhbWV0ZXJzIG1hcCBpbiB0aGUgZm9ybWF0IFtrOiBzdHJpbmddIDogQ29tcGxleEJpbmRpbmdTeW50YXhcblx0ICogQHBhcmFtIHNUYXJnZXRSb3V0ZSBOYW1lIG9mIHRoZSB0YXJnZXQgcm91dGVcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgYmluZGluZyBjb250ZXh0XG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB3aGljaCByZXNvbHZlcyB0byB0aGUgcm91dGluZyB0YXJnZXQgcGFyYW1ldGVyc1xuXHQgKi9cblx0cHJlcGFyZVBhcmFtZXRlcnMobVBhcmFtZXRlcnM6IGFueSwgc1RhcmdldFJvdXRlOiBzdHJpbmcsIG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0bGV0IG9QYXJhbWV0ZXJzUHJvbWlzZTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0Y29uc3QgYUNvbnRleHRQYXRoUGFydHMgPSBzQ29udGV4dFBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0Y29uc3QgYUFsbFJlc29sdmVkUGFyYW1ldGVyUHJvbWlzZXMgPSBPYmplY3Qua2V5cyhtUGFyYW1ldGVycykubWFwKChzUGFyYW1ldGVyS2V5OiBhbnkpID0+IHtcblx0XHRcdFx0Y29uc3Qgc1BhcmFtZXRlck1hcHBpbmdFeHByZXNzaW9uID0gbVBhcmFtZXRlcnNbc1BhcmFtZXRlcktleV07XG5cdFx0XHRcdC8vIFdlIGFzc3VtZSB0aGUgZGVmaW5lZCBwYXJhbWV0ZXJzIHdpbGwgYmUgY29tcGF0aWJsZSB3aXRoIGEgYmluZGluZyBleHByZXNzaW9uXG5cdFx0XHRcdGNvbnN0IG9QYXJzZWRFeHByZXNzaW9uID0gQmluZGluZ1BhcnNlci5jb21wbGV4UGFyc2VyKHNQYXJhbWV0ZXJNYXBwaW5nRXhwcmVzc2lvbik7XG5cdFx0XHRcdGNvbnN0IGFQYXJ0cyA9IG9QYXJzZWRFeHByZXNzaW9uLnBhcnRzIHx8IFtvUGFyc2VkRXhwcmVzc2lvbl07XG5cdFx0XHRcdGNvbnN0IGFSZXNvbHZlZFBhcmFtZXRlclByb21pc2VzID0gYVBhcnRzLm1hcChmdW5jdGlvbiAob1BhdGhQYXJ0OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBhUmVsYXRpdmVQYXJ0cyA9IG9QYXRoUGFydC5wYXRoLnNwbGl0KFwiLi4vXCIpO1xuXHRcdFx0XHRcdC8vIFdlIGdvIHVwIHRoZSBjdXJyZW50IGNvbnRleHQgcGF0aCBhcyBtYW55IHRpbWVzIGFzIG5lY2Vzc2FyeVxuXHRcdFx0XHRcdGNvbnN0IGFMb2NhbFBhcnRzID0gYUNvbnRleHRQYXRoUGFydHMuc2xpY2UoMCwgYUNvbnRleHRQYXRoUGFydHMubGVuZ3RoIC0gYVJlbGF0aXZlUGFydHMubGVuZ3RoICsgMSk7XG5cdFx0XHRcdFx0YUxvY2FsUGFydHMucHVzaChhUmVsYXRpdmVQYXJ0c1thUmVsYXRpdmVQYXJ0cy5sZW5ndGggLSAxXSk7XG5cblx0XHRcdFx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gYUxvY2FsUGFydHMuam9pbihcIi9cIik7XG5cdFx0XHRcdFx0Y29uc3Qgb01ldGFDb250ZXh0ID0gKG9NZXRhTW9kZWwgYXMgYW55KS5nZXRNZXRhQ29udGV4dChzUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0XHRyZXR1cm4gb0NvbnRleHQucmVxdWVzdFByb3BlcnR5KHNQcm9wZXJ0eVBhdGgpLnRoZW4oZnVuY3Rpb24gKG9WYWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvUHJvcGVydHlJbmZvID0gb01ldGFDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc0VkbVR5cGUgPSBvUHJvcGVydHlJbmZvLiRUeXBlO1xuXHRcdFx0XHRcdFx0cmV0dXJuIE9EYXRhVXRpbHMuZm9ybWF0TGl0ZXJhbChvVmFsdWUsIHNFZG1UeXBlKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKGFSZXNvbHZlZFBhcmFtZXRlclByb21pc2VzKS50aGVuKChhUmVzb2x2ZWRQYXJhbWV0ZXJzOiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCB2YWx1ZSA9IG9QYXJzZWRFeHByZXNzaW9uLmZvcm1hdHRlclxuXHRcdFx0XHRcdFx0PyBvUGFyc2VkRXhwcmVzc2lvbi5mb3JtYXR0ZXIuYXBwbHkodGhpcywgYVJlc29sdmVkUGFyYW1ldGVycylcblx0XHRcdFx0XHRcdDogYVJlc29sdmVkUGFyYW1ldGVycy5qb2luKFwiXCIpO1xuXHRcdFx0XHRcdHJldHVybiB7IGtleTogc1BhcmFtZXRlcktleSwgdmFsdWU6IHZhbHVlIH07XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cblx0XHRcdG9QYXJhbWV0ZXJzUHJvbWlzZSA9IFByb21pc2UuYWxsKGFBbGxSZXNvbHZlZFBhcmFtZXRlclByb21pc2VzKS50aGVuKGZ1bmN0aW9uIChcblx0XHRcdFx0YUFsbFJlc29sdmVkUGFyYW1ldGVyczogeyBrZXk6IGFueTsgdmFsdWU6IGFueSB9W11cblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBvUGFyYW1ldGVyczogYW55ID0ge307XG5cdFx0XHRcdGFBbGxSZXNvbHZlZFBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob1Jlc29sdmVkUGFyYW1ldGVyOiB7IGtleTogYW55OyB2YWx1ZTogYW55IH0pIHtcblx0XHRcdFx0XHRvUGFyYW1ldGVyc1tvUmVzb2x2ZWRQYXJhbWV0ZXIua2V5XSA9IG9SZXNvbHZlZFBhcmFtZXRlci52YWx1ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBvUGFyYW1ldGVycztcblx0XHRcdH0pO1xuXHRcdH0gY2F0Y2ggKG9FcnJvcikge1xuXHRcdFx0TG9nLmVycm9yKGBDb3VsZCBub3QgcGFyc2UgdGhlIHBhcmFtZXRlcnMgZm9yIHRoZSBuYXZpZ2F0aW9uIHRvIHJvdXRlICR7c1RhcmdldFJvdXRlfWApO1xuXHRcdFx0b1BhcmFtZXRlcnNQcm9taXNlID0gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG5cdFx0fVxuXHRcdHJldHVybiBvUGFyYW1ldGVyc1Byb21pc2U7XG5cdH1cblxuXHRfZmlyZVJvdXRlTWF0Y2hFdmVudHMobVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5maXJlRXZlbnQoXCJyb3V0ZU1hdGNoZWRcIiwgbVBhcmFtZXRlcnMpO1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5maXJlRXZlbnQoXCJhZnRlclJvdXRlTWF0Y2hlZFwiLCBtUGFyYW1ldGVycyk7XG5cblx0XHRFZGl0U3RhdGUuY2xlYW5Qcm9jZXNzZWRFZGl0U3RhdGUoKTsgLy8gUmVzZXQgVUkgc3RhdGUgd2hlbiBhbGwgYmluZGluZ3MgaGF2ZSBiZWVuIHJlZnJlc2hlZFxuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgQ29udGV4dCB0byBiZSBuYXZpZ2F0ZWQgdG8sIG9yIHRoZSBsaXN0IGJpbmRpbmcgZm9yIGNyZWF0aW9uIChkZWZlcnJlZCBjcmVhdGlvbilcblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwsIG1hcCBjb250YWluaW5nIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5jaGVja05vSGFzaENoYW5nZV0gTmF2aWdhdGUgdG8gdGhlIGNvbnRleHQgd2l0aG91dCBjaGFuZ2luZyB0aGUgVVJMXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYXN5bmNDb250ZXh0XSBUaGUgY29udGV4dCBpcyBjcmVhdGVkIGFzeW5jLCBuYXZpZ2F0ZSB0byAoLi4uKSBhbmRcblx0ICogICAgICAgICAgICAgICAgICAgIHdhaXQgZm9yIFByb21pc2UgdG8gYmUgcmVzb2x2ZWQgYW5kIHRoZW4gbmF2aWdhdGUgaW50byB0aGUgY29udGV4dFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmJEZWZlcnJlZENvbnRleHRdIFRoZSBjb250ZXh0IHNoYWxsIGJlIGNyZWF0ZWQgZGVmZXJyZWQgYXQgdGhlIHRhcmdldCBwYWdlXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZWRpdGFibGVdIFRoZSB0YXJnZXQgcGFnZSBzaGFsbCBiZSBpbW1lZGlhdGVseSBpbiB0aGUgZWRpdCBtb2RlIHRvIGF2b2lkIGZsaWNrZXJpbmdcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5iUGVyc2lzdE9QU2Nyb2xsXSBUaGUgYlBlcnNpc3RPUFNjcm9sbCB3aWxsIGJlIHVzZWQgZm9yIHNjcm9sbGluZyB0byBmaXJzdCB0YWJcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbF0gYCsxYCBpZiB3ZSBhZGQgYSBjb2x1bW4gaW4gRkNMLCBgLTFgIHRvIHJlbW92ZSBhIGNvbHVtbiwgMCB0byBzdGF5IG9uIHRoZSBzYW1lIGNvbHVtblxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm5vUHJlc2VydmF0aW9uQ2FjaGVdIERvIG5hdmlnYXRpb24gd2l0aG91dCB0YWtpbmcgaW50byBhY2NvdW50IHRoZSBwcmVzZXJ2ZWQgY2FjaGUgbWVjaGFuaXNtXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYlJlY3JlYXRlQ29udGV4dF0gRm9yY2UgcmUtY3JlYXRpb24gb2YgdGhlIGNvbnRleHQgaW5zdGVhZCBvZiB1c2luZyB0aGUgb25lIHBhc3NlZCBhcyBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5iRm9yY2VGb2N1c10gRm9yY2VzIGZvY3VzIHNlbGVjdGlvbiBhZnRlciBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBbb1ZpZXdEYXRhXSBWaWV3IGRhdGFcblx0ICogQHBhcmFtIFtvQ3VycmVudFRhcmdldEluZm9dIFRoZSB0YXJnZXQgaW5mb3JtYXRpb24gZnJvbSB3aGljaCB0aGUgbmF2aWdhdGlvbiBpcyB0cmlnZ2VyZWRcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIHRoZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRuYXZpZ2F0ZVRvQ29udGV4dChcblx0XHRvQ29udGV4dDogQ29udGV4dCB8IE9EYXRhTGlzdEJpbmRpbmcsXG5cdFx0bVBhcmFtZXRlcnM6XG5cdFx0XHR8IHtcblx0XHRcdFx0XHRjaGVja05vSGFzaENoYW5nZT86IGJvb2xlYW47XG5cdFx0XHRcdFx0YXN5bmNDb250ZXh0PzogUHJvbWlzZTxhbnk+O1xuXHRcdFx0XHRcdGJEZWZlcnJlZENvbnRleHQ/OiBib29sZWFuO1xuXHRcdFx0XHRcdGVkaXRhYmxlPzogYm9vbGVhbjtcblx0XHRcdFx0XHR0cmFuc2llbnQ/OiBib29sZWFuO1xuXHRcdFx0XHRcdGJQZXJzaXN0T1BTY3JvbGw/OiBib29sZWFuO1xuXHRcdFx0XHRcdHVwZGF0ZUZDTExldmVsPzogbnVtYmVyO1xuXHRcdFx0XHRcdG5vUHJlc2VydmF0aW9uQ2FjaGU/OiBib29sZWFuO1xuXHRcdFx0XHRcdGJSZWNyZWF0ZUNvbnRleHQ/OiBib29sZWFuO1xuXHRcdFx0XHRcdGJGb3JjZUZvY3VzPzogYm9vbGVhbjtcblx0XHRcdFx0XHR0YXJnZXRQYXRoPzogc3RyaW5nO1xuXHRcdFx0XHRcdHNob3dQbGFjZWhvbGRlcj86IGJvb2xlYW47XG5cdFx0XHRcdFx0YkRyYWZ0TmF2aWdhdGlvbj86IGJvb2xlYW47XG5cdFx0XHRcdFx0cmVhc29uPzogTmF2aWdhdGlvblJlYXNvbjtcblx0XHRcdCAgfVxuXHRcdFx0fCB1bmRlZmluZWQsXG5cdFx0b1ZpZXdEYXRhOiBhbnkgfCB1bmRlZmluZWQsXG5cdFx0b0N1cnJlbnRUYXJnZXRJbmZvOiBhbnkgfCB1bmRlZmluZWRcblx0KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0bGV0IHNUYXJnZXRSb3V0ZTogc3RyaW5nID0gXCJcIixcblx0XHRcdG9Sb3V0ZVBhcmFtZXRlcnNQcm9taXNlLFxuXHRcdFx0YklzU3RpY2t5TW9kZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdFx0aWYgKG9Db250ZXh0LmdldE1vZGVsKCkgJiYgb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwpIHtcblx0XHRcdGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQob0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0fVxuXHRcdC8vIE1hbmFnZSBwYXJhbWV0ZXIgbWFwcGluZ1xuXHRcdGlmIChtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy50YXJnZXRQYXRoICYmIG9WaWV3RGF0YSAmJiBvVmlld0RhdGEubmF2aWdhdGlvbikge1xuXHRcdFx0Y29uc3Qgb1JvdXRlRGV0YWlsID0gb1ZpZXdEYXRhLm5hdmlnYXRpb25bbVBhcmFtZXRlcnMudGFyZ2V0UGF0aF0uZGV0YWlsO1xuXHRcdFx0c1RhcmdldFJvdXRlID0gb1JvdXRlRGV0YWlsLnJvdXRlO1xuXG5cdFx0XHRpZiAob1JvdXRlRGV0YWlsLnBhcmFtZXRlcnMgJiYgb0NvbnRleHQuaXNBPENvbnRleHQ+KFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHRcIikpIHtcblx0XHRcdFx0b1JvdXRlUGFyYW1ldGVyc1Byb21pc2UgPSB0aGlzLnByZXBhcmVQYXJhbWV0ZXJzKG9Sb3V0ZURldGFpbC5wYXJhbWV0ZXJzLCBzVGFyZ2V0Um91dGUsIG9Db250ZXh0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgc1RhcmdldFBhdGggPSB0aGlzLl9nZXRQYXRoRnJvbUNvbnRleHQob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHQvLyBJZiB0aGUgcGF0aCBpcyBlbXB0eSwgd2UncmUgc3VwcG9zZWQgdG8gbmF2aWdhdGUgdG8gdGhlIGZpcnN0IHBhZ2Ugb2YgdGhlIGFwcFxuXHRcdC8vIENoZWNrIGlmIHdlIG5lZWQgdG8gZXhpdCBmcm9tIHRoZSBhcHAgaW5zdGVhZFxuXHRcdGlmIChzVGFyZ2V0UGF0aC5sZW5ndGggPT09IDAgJiYgdGhpcy5iRXhpdE9uTmF2aWdhdGVCYWNrVG9Sb290KSB7XG5cdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eS5leGl0RnJvbUFwcCgpO1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgY29udGV4dCBpcyBkZWZlcnJlZCBvciBhc3luYywgd2UgYWRkICguLi4pIHRvIHRoZSBwYXRoXG5cdFx0aWYgKG1QYXJhbWV0ZXJzPy5hc3luY0NvbnRleHQgfHwgbVBhcmFtZXRlcnM/LmJEZWZlcnJlZENvbnRleHQpIHtcblx0XHRcdHNUYXJnZXRQYXRoICs9IFwiKC4uLilcIjtcblx0XHR9XG5cblx0XHQvLyBBZGQgbGF5b3V0IHBhcmFtZXRlciBpZiBuZWVkZWRcblx0XHRjb25zdCBzTGF5b3V0ID0gdGhpcy5fY2FsY3VsYXRlTGF5b3V0KHNUYXJnZXRQYXRoLCBtUGFyYW1ldGVycyk7XG5cdFx0aWYgKHNMYXlvdXQpIHtcblx0XHRcdHNUYXJnZXRQYXRoICs9IGA/bGF5b3V0PSR7c0xheW91dH1gO1xuXHRcdH1cblxuXHRcdC8vIE5hdmlnYXRpb24gcGFyYW1ldGVycyBmb3IgbGF0ZXIgdXNhZ2Vcblx0XHRjb25zdCBvTmF2aWdhdGlvbkluZm86IFJvdXRpbmdOYXZpZ2F0aW9uSW5mbyA9IHtcblx0XHRcdG9Bc3luY0NvbnRleHQ6IG1QYXJhbWV0ZXJzPy5hc3luY0NvbnRleHQsXG5cdFx0XHRiRGVmZXJyZWRDb250ZXh0OiBtUGFyYW1ldGVycz8uYkRlZmVycmVkQ29udGV4dCxcblx0XHRcdGJUYXJnZXRFZGl0YWJsZTogbVBhcmFtZXRlcnM/LmVkaXRhYmxlLFxuXHRcdFx0YlBlcnNpc3RPUFNjcm9sbDogbVBhcmFtZXRlcnM/LmJQZXJzaXN0T1BTY3JvbGwsXG5cdFx0XHRiRHJhZnROYXZpZ2F0aW9uOiBtUGFyYW1ldGVycz8uYkRyYWZ0TmF2aWdhdGlvbixcblx0XHRcdGJTaG93UGxhY2Vob2xkZXI6IG1QYXJhbWV0ZXJzPy5zaG93UGxhY2Vob2xkZXIgIT09IHVuZGVmaW5lZCA/IG1QYXJhbWV0ZXJzPy5zaG93UGxhY2Vob2xkZXIgOiB0cnVlLFxuXHRcdFx0cmVhc29uOiBtUGFyYW1ldGVycz8ucmVhc29uXG5cdFx0fTtcblxuXHRcdGlmIChtUGFyYW1ldGVycz8udXBkYXRlRkNMTGV2ZWwgIT09IC0xICYmIG1QYXJhbWV0ZXJzPy5iUmVjcmVhdGVDb250ZXh0ICE9PSB0cnVlKSB7XG5cdFx0XHRpZiAob0NvbnRleHQuaXNBPENvbnRleHQ+KFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHRcIikpIHtcblx0XHRcdFx0b05hdmlnYXRpb25JbmZvLnVzZUNvbnRleHQgPSBvQ29udGV4dDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9OYXZpZ2F0aW9uSW5mby5saXN0QmluZGluZ0ZvckNyZWF0ZSA9IG9Db250ZXh0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChtUGFyYW1ldGVycz8uY2hlY2tOb0hhc2hDaGFuZ2UpIHtcblx0XHRcdC8vIENoZWNrIGlmIHRoZSBuZXcgaGFzaCBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgY3VycmVudCBvbmVcblx0XHRcdGNvbnN0IHNDdXJyZW50SGFzaE5vQXBwU3RhdGUgPSB0aGlzLm9Sb3V0ZXJQcm94eS5nZXRIYXNoKCkucmVwbGFjZSgvWyY/XXsxfXNhcC1pYXBwLXN0YXRlPVtBLVowLTldKy8sIFwiXCIpO1xuXHRcdFx0aWYgKHNUYXJnZXRQYXRoID09PSBzQ3VycmVudEhhc2hOb0FwcFN0YXRlKSB7XG5cdFx0XHRcdC8vIFRoZSBoYXNoIGRvZXNuJ3QgY2hhbmdlLCBidXQgd2UgZmlyZSB0aGUgcm91dGVNYXRjaCBldmVudCB0byB0cmlnZ2VyIHBhZ2UgcmVmcmVzaCAvIGJpbmRpbmdcblx0XHRcdFx0Y29uc3QgbUV2ZW50UGFyYW1ldGVyczogYW55ID0gdGhpcy5vUm91dGVyLmdldFJvdXRlSW5mb0J5SGFzaCh0aGlzLm9Sb3V0ZXJQcm94eS5nZXRIYXNoKCkpO1xuXHRcdFx0XHRpZiAobUV2ZW50UGFyYW1ldGVycykge1xuXHRcdFx0XHRcdG1FdmVudFBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8gPSBvTmF2aWdhdGlvbkluZm87XG5cdFx0XHRcdFx0bUV2ZW50UGFyYW1ldGVycy5yb3V0ZUluZm9ybWF0aW9uID0gdGhpcy5fZ2V0Um91dGVJbmZvcm1hdGlvbih0aGlzLnNDdXJyZW50Um91dGVOYW1lKTtcblx0XHRcdFx0XHRtRXZlbnRQYXJhbWV0ZXJzLnJvdXRlUGF0dGVybiA9IHRoaXMuc0N1cnJlbnRSb3V0ZVBhdHRlcm47XG5cdFx0XHRcdFx0bUV2ZW50UGFyYW1ldGVycy52aWV3cyA9IHRoaXMuYUN1cnJlbnRWaWV3cztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMub1JvdXRlclByb3h5LnNldEZvY3VzRm9yY2VkKCEhbVBhcmFtZXRlcnMuYkZvcmNlRm9jdXMpO1xuXG5cdFx0XHRcdHRoaXMuX2ZpcmVSb3V0ZU1hdGNoRXZlbnRzKG1FdmVudFBhcmFtZXRlcnMpO1xuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzPy50cmFuc2llbnQgJiYgbVBhcmFtZXRlcnMuZWRpdGFibGUgPT0gdHJ1ZSAmJiBzVGFyZ2V0UGF0aC5pbmRleE9mKFwiKC4uLilcIikgPT09IC0xKSB7XG5cdFx0XHRpZiAoc1RhcmdldFBhdGguaW5kZXhPZihcIj9cIikgPiAtMSkge1xuXHRcdFx0XHRzVGFyZ2V0UGF0aCArPSBcIiZpLWFjdGlvbj1jcmVhdGVcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNUYXJnZXRQYXRoICs9IFwiP2ktYWN0aW9uPWNyZWF0ZVwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENsZWFyIHVuYm91bmQgbWVzc2FnZXMgdXBvbiBuYXZpZ2F0aW5nIGZyb20gTFIgdG8gT1Bcblx0XHQvLyBUaGlzIGlzIHRvIGVuc3VyZSBzdGFsZSBlcnJvciBtZXNzYWdlcyBmcm9tIExSIGFyZSBub3Qgc2hvd24gdG8gdGhlIHVzZXIgYWZ0ZXIgbmF2aWdhdGlvbiB0byBPUC5cblx0XHRpZiAob0N1cnJlbnRUYXJnZXRJbmZvICYmIG9DdXJyZW50VGFyZ2V0SW5mby5uYW1lID09PSBcInNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydFwiKSB7XG5cdFx0XHRjb25zdCBvUm91dGVJbmZvID0gdGhpcy5vUm91dGVyLmdldFJvdXRlSW5mb0J5SGFzaChzVGFyZ2V0UGF0aCk7XG5cdFx0XHRpZiAob1JvdXRlSW5mbykge1xuXHRcdFx0XHRjb25zdCBvUm91dGUgPSB0aGlzLl9nZXRSb3V0ZUluZm9ybWF0aW9uKG9Sb3V0ZUluZm8ubmFtZSk7XG5cdFx0XHRcdGlmIChvUm91dGUgJiYgb1JvdXRlLnRhcmdldHMgJiYgb1JvdXRlLnRhcmdldHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGNvbnN0IHNMYXN0VGFyZ2V0TmFtZSA9IG9Sb3V0ZS50YXJnZXRzW29Sb3V0ZS50YXJnZXRzLmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRcdGNvbnN0IG9UYXJnZXQgPSB0aGlzLl9nZXRUYXJnZXRJbmZvcm1hdGlvbihzTGFzdFRhcmdldE5hbWUpO1xuXHRcdFx0XHRcdGlmIChvVGFyZ2V0ICYmIG9UYXJnZXQubmFtZSA9PT0gXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2VcIikge1xuXHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBBZGQgdGhlIG5hdmlnYXRpb24gcGFyYW1ldGVycyBpbiB0aGUgcXVldWVcblx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUucHVzaChvTmF2aWdhdGlvbkluZm8pO1xuXG5cdFx0aWYgKHNUYXJnZXRSb3V0ZSAmJiBvUm91dGVQYXJhbWV0ZXJzUHJvbWlzZSkge1xuXHRcdFx0cmV0dXJuIG9Sb3V0ZVBhcmFtZXRlcnNQcm9taXNlLnRoZW4oKG9Sb3V0ZVBhcmFtZXRlcnM6IGFueSkgPT4ge1xuXHRcdFx0XHRvUm91dGVQYXJhbWV0ZXJzLmJJc1N0aWNreU1vZGUgPSBiSXNTdGlja3lNb2RlO1xuXHRcdFx0XHR0aGlzLm9Sb3V0ZXIubmF2VG8oc1RhcmdldFJvdXRlLCBvUm91dGVQYXJhbWV0ZXJzKTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5vUm91dGVyUHJveHlcblx0XHRcdC5uYXZUb0hhc2goc1RhcmdldFBhdGgsIGZhbHNlLCBtUGFyYW1ldGVycz8ubm9QcmVzZXJ2YXRpb25DYWNoZSwgbVBhcmFtZXRlcnM/LmJGb3JjZUZvY3VzLCAhYklzU3RpY2t5TW9kZSlcblx0XHRcdC50aGVuKChiTmF2aWdhdGVkOiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKCFiTmF2aWdhdGVkKSB7XG5cdFx0XHRcdFx0Ly8gVGhlIG5hdmlnYXRpb24gZGlkIG5vdCBoYXBwZW4gLS0+IHJlbW92ZSB0aGUgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzIGZyb20gdGhlIHF1ZXVlIGFzIHRoZXkgc2hvdWxkbid0IGJlIHVzZWRcblx0XHRcdFx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUucG9wKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGJOYXZpZ2F0ZWQ7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYSByb3V0ZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmcjbmF2aWdhdGVUb1JvdXRlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5Sb3V0aW5nXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIHNUYXJnZXRSb3V0ZU5hbWUgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBbb1JvdXRlUGFyYW1ldGVyc10gUGFyYW1ldGVycyB0byBiZSB1c2VkIHdpdGggcm91dGUgdG8gY3JlYXRlIHRoZSB0YXJnZXQgaGFzaFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0bmF2aWdhdGVUb1JvdXRlKHNUYXJnZXRSb3V0ZU5hbWU6IHN0cmluZywgb1JvdXRlUGFyYW1ldGVycz86IGFueSkge1xuXHRcdGNvbnN0IHNUYXJnZXRVUkwgPSB0aGlzLm9Sb3V0ZXIuZ2V0VVJMKHNUYXJnZXRSb3V0ZU5hbWUsIG9Sb3V0ZVBhcmFtZXRlcnMpO1xuXHRcdHJldHVybiB0aGlzLm9Sb3V0ZXJQcm94eS5uYXZUb0hhc2goc1RhcmdldFVSTCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgIW9Sb3V0ZVBhcmFtZXRlcnMuYklzU3RpY2t5TW9kZSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIG9uZSBvZiB0aGUgY3VycmVudCB2aWV3cyBvbiB0aGUgc2NyZWVuIGlzIGJvdW5kIHRvIGEgZ2l2ZW4gY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0XG5cdCAqIEByZXR1cm5zIGB0cnVlYCBvciBgZmFsc2VgIGlmIHRoZSBjdXJyZW50IHN0YXRlIGlzIGltcGFjdGVkIG9yIG5vdFxuXHQgKi9cblx0aXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblxuXHRcdC8vIEZpcnN0LCBjaGVjayB3aXRoIHRoZSB0ZWNobmljYWwgcGF0aC4gV2UgaGF2ZSB0byB0cnkgaXQsIGJlY2F1c2UgZm9yIGxldmVsID4gMSwgd2Vcblx0XHQvLyB1c2VzIHRlY2huaWNhbCBrZXlzIGV2ZW4gaWYgU2VtYW50aWMga2V5cyBhcmUgZW5hYmxlZFxuXHRcdGlmICh0aGlzLm9Sb3V0ZXJQcm94eS5pc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkoc1BhdGgpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKC9eW14oKV0rXFwoW14oKV0rXFwpJC8udGVzdChzUGF0aCkpIHtcblx0XHRcdC8vIElmIHRoZSBjdXJyZW50IHBhdGggY2FuIGJlIHNlbWFudGljIChpLmUuIGlzIGxpa2UgeHh4KHl5eSkpXG5cdFx0XHQvLyBjaGVjayB3aXRoIHRoZSBzZW1hbnRpYyBwYXRoIGlmIHdlIGNhbiBmaW5kIGl0XG5cdFx0XHRsZXQgc1NlbWFudGljUGF0aDtcblx0XHRcdGlmICh0aGlzLm9MYXN0U2VtYW50aWNNYXBwaW5nICYmIHRoaXMub0xhc3RTZW1hbnRpY01hcHBpbmcudGVjaG5pY2FsUGF0aCA9PT0gc1BhdGgpIHtcblx0XHRcdFx0Ly8gV2UgaGF2ZSBhbHJlYWR5IHJlc29sdmVkIHRoaXMgc2VtYW50aWMgcGF0aFxuXHRcdFx0XHRzU2VtYW50aWNQYXRoID0gdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZy5zZW1hbnRpY1BhdGg7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzU2VtYW50aWNQYXRoID0gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNQYXRoKG9Db250ZXh0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHNTZW1hbnRpY1BhdGggIT0gc1BhdGggPyB0aGlzLm9Sb3V0ZXJQcm94eS5pc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkoc1NlbWFudGljUGF0aCkgOiBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdF9maW5kUGF0aFRvTmF2aWdhdGUoc1BhdGg6IGFueSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKFwiL1teL10qJFwiKTtcblx0XHRzUGF0aCA9IHNQYXRoLnJlcGxhY2UocmVnZXgsIFwiXCIpO1xuXHRcdGlmICh0aGlzLm9Sb3V0ZXIubWF0Y2goc1BhdGgpIHx8IHNQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gc1BhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9maW5kUGF0aFRvTmF2aWdhdGUoc1BhdGgpO1xuXHRcdH1cblx0fVxuXG5cdF9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cblx0XHQvLyBGaXJzdCwgY2hlY2sgaWYgdGhpcyBpcyBhIGxldmVsLTEgb2JqZWN0IChwYXRoID0gL2FhYShiYmIpKVxuXHRcdGlmICghL15cXC9bXihdK1xcKFteKV0rXFwpJC8udGVzdChzUGF0aCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBUaGVuIGNoZWNrIGlmIHRoZSBlbnRpdHkgaGFzIHNlbWFudGljIGtleXNcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzRW50aXR5U2V0TmFtZSA9IG9NZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQob0NvbnRleHQuZ2V0UGF0aCgpKS5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKSBhcyBzdHJpbmc7XG5cdFx0aWYgKCFTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY0tleXMob01ldGFNb2RlbCwgc0VudGl0eVNldE5hbWUpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gVGhlbiBjaGVjayB0aGUgZW50aXR5IGlzIGRyYWZ0LWVuYWJsZWRcblx0XHRyZXR1cm4gTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChvTWV0YU1vZGVsLCBzUGF0aCk7XG5cdH1cblxuXHRfZ2V0UGF0aEZyb21Db250ZXh0KG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRsZXQgc1BhdGg7XG5cblx0XHRpZiAob0NvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikgJiYgb0NvbnRleHQuaXNSZWxhdGl2ZSgpKSB7XG5cdFx0XHRzUGF0aCA9IG9Db250ZXh0LmdldEhlYWRlckNvbnRleHQoKS5nZXRQYXRoKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdH1cblxuXHRcdGlmIChtUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbCA9PT0gLTEpIHtcblx0XHRcdC8vIFdoZW4gbmF2aWdhdGluZyBiYWNrIGZyb20gYSBjb250ZXh0LCB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgbGFzdCBjb21wb25lbnQgb2YgdGhlIHBhdGhcblx0XHRcdHNQYXRoID0gdGhpcy5fZmluZFBhdGhUb05hdmlnYXRlKHNQYXRoKTtcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgd2UncmUgbmF2aWdhdGluZyBiYWNrIHRvIGEgc2VtYW50aWMgcGF0aCB0aGF0IHdhcyBwcmV2aW91c2x5IHJlc29sdmVkXG5cdFx0XHRpZiAodGhpcy5vTGFzdFNlbWFudGljTWFwcGluZyAmJiB0aGlzLm9MYXN0U2VtYW50aWNNYXBwaW5nLnRlY2huaWNhbFBhdGggPT09IHNQYXRoKSB7XG5cdFx0XHRcdHNQYXRoID0gdGhpcy5vTGFzdFNlbWFudGljTWFwcGluZy5zZW1hbnRpY1BhdGg7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoKG9Db250ZXh0KSkge1xuXHRcdFx0Ly8gV2UgY2hlY2sgaWYgd2UgaGF2ZSB0byB1c2UgYSBzZW1hbnRpYyBwYXRoXG5cdFx0XHRjb25zdCBzU2VtYW50aWNQYXRoID0gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNQYXRoKG9Db250ZXh0LCB0cnVlKTtcblxuXHRcdFx0aWYgKCFzU2VtYW50aWNQYXRoKSB7XG5cdFx0XHRcdC8vIFdlIHdlcmUgbm90IGFibGUgdG8gYnVpbGQgdGhlIHNlbWFudGljIHBhdGggLS0+IFVzZSB0aGUgdGVjaG5pY2FsIHBhdGggYW5kXG5cdFx0XHRcdC8vIGNsZWFyIHRoZSBwcmV2aW91cyBtYXBwaW5nLCBvdGhlcndpc2UgdGhlIG9sZCBtYXBwaW5nIGlzIHVzZWQgaW4gRWRpdEZsb3cjdXBkYXRlRG9jdW1lbnRcblx0XHRcdFx0Ly8gYW5kIGl0IGxlYWRzIHRvIHVud2FudGVkIHBhZ2UgcmVsb2Fkc1xuXHRcdFx0XHR0aGlzLnNldExhc3RTZW1hbnRpY01hcHBpbmcodW5kZWZpbmVkKTtcblx0XHRcdH0gZWxzZSBpZiAoc1NlbWFudGljUGF0aCAhPT0gc1BhdGgpIHtcblx0XHRcdFx0Ly8gU3RvcmUgdGhlIG1hcHBpbmcgdGVjaG5pY2FsIDwtPiBzZW1hbnRpYyBwYXRoIHRvIGF2b2lkIHJlY2FsY3VsYXRpbmcgaXQgbGF0ZXJcblx0XHRcdFx0Ly8gYW5kIHVzZSB0aGUgc2VtYW50aWMgcGF0aCBpbnN0ZWFkIG9mIHRoZSB0ZWNobmljYWwgb25lXG5cdFx0XHRcdHRoaXMuc2V0TGFzdFNlbWFudGljTWFwcGluZyh7IHRlY2huaWNhbFBhdGg6IHNQYXRoLCBzZW1hbnRpY1BhdGg6IHNTZW1hbnRpY1BhdGggfSk7XG5cdFx0XHRcdHNQYXRoID0gc1NlbWFudGljUGF0aDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyByZW1vdmUgZXh0cmEgJy8nIGF0IHRoZSBiZWdpbm5pbmcgb2YgcGF0aFxuXHRcdGlmIChzUGF0aFswXSA9PT0gXCIvXCIpIHtcblx0XHRcdHNQYXRoID0gc1BhdGguc3Vic3RyaW5nKDEpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzUGF0aDtcblx0fVxuXG5cdF9jYWxjdWxhdGVMYXlvdXQoc1BhdGg6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGxldCBGQ0xMZXZlbCA9IG1QYXJhbWV0ZXJzLkZDTExldmVsO1xuXHRcdGlmIChtUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbCkge1xuXHRcdFx0RkNMTGV2ZWwgKz0gbVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWw7XG5cdFx0XHRpZiAoRkNMTGV2ZWwgPCAwKSB7XG5cdFx0XHRcdEZDTExldmVsID0gMDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBXaGVuIG5hdmlnYXRpbmcgYmFjaywgdHJ5IHRvIGZpbmQgdGhlIGxheW91dCBpbiB0aGUgbmF2aWdhdGlvbiBoaXN0b3J5IGlmIGl0J3Mgbm90IHByb3ZpZGVkIGFzIHBhcmFtZXRlclxuXHRcdC8vIChsYXlvdXQgY2FsY3VsYXRpb24gaXMgbm90IGhhbmRsZWQgcHJvcGVybHkgYnkgdGhlIEZsZXhpYmxlQ29sdW1uTGF5b3V0U2VtYW50aWNIZWxwZXIgaW4gdGhpcyBjYXNlKVxuXHRcdGlmIChtUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbCA8IDAgJiYgIW1QYXJhbWV0ZXJzLnNMYXlvdXQpIHtcblx0XHRcdG1QYXJhbWV0ZXJzLnNMYXlvdXQgPSB0aGlzLm9Sb3V0ZXJQcm94eS5maW5kTGF5b3V0Rm9ySGFzaChzUGF0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuICh0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55KS5jYWxjdWxhdGVMYXlvdXQoXG5cdFx0XHRGQ0xMZXZlbCxcblx0XHRcdHNQYXRoLFxuXHRcdFx0bVBhcmFtZXRlcnMuc0xheW91dCxcblx0XHRcdG1QYXJhbWV0ZXJzLmtlZXBDdXJyZW50TGF5b3V0XG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIGJlZm9yZSBhIHJvdXRlIGlzIG1hdGNoZWQuXG5cdCAqIERpc3BsYXlzIGEgYnVzeSBpbmRpY2F0b3IuXG5cdCAqXG5cdCAqL1xuXHRfYmVmb3JlUm91dGVNYXRjaGVkKC8qb0V2ZW50OiBFdmVudCovKSB7XG5cdFx0Y29uc3QgYlBsYWNlaG9sZGVyRW5hYmxlZCA9IG5ldyBQbGFjZWhvbGRlcigpLmlzUGxhY2Vob2xkZXJFbmFibGVkKCk7XG5cdFx0aWYgKCFiUGxhY2Vob2xkZXJFbmFibGVkKSB7XG5cdFx0XHRjb25zdCBvUm9vdFZpZXcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRcdEJ1c3lMb2NrZXIubG9jayhvUm9vdFZpZXcpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIHdoZW4gYSByb3V0ZSBpcyBtYXRjaGVkLlxuXHQgKiBIaWRlcyB0aGUgYnVzeSBpbmRpY2F0b3IgYW5kIGZpcmVzIGl0cyBvd24gJ3JvdXRlbWF0Y2hlZCcgZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50XG5cdCAqL1xuXHRfb25Sb3V0ZU1hdGNoZWQob0V2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IG9BcHBTdGF0ZUhhbmRsZXIgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0QXBwU3RhdGVIYW5kbGVyKCksXG5cdFx0XHRvUm9vdFZpZXcgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRjb25zdCBiUGxhY2Vob2xkZXJFbmFibGVkID0gbmV3IFBsYWNlaG9sZGVyKCkuaXNQbGFjZWhvbGRlckVuYWJsZWQoKTtcblx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvUm9vdFZpZXcpICYmICFiUGxhY2Vob2xkZXJFbmFibGVkKSB7XG5cdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvUm9vdFZpZXcpO1xuXHRcdH1cblx0XHRjb25zdCBtUGFyYW1ldGVyczogYW55ID0gb0V2ZW50LmdldFBhcmFtZXRlcnMoKTtcblx0XHRpZiAodGhpcy5uYXZpZ2F0aW9uSW5mb1F1ZXVlLmxlbmd0aCkge1xuXHRcdFx0bVBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8gPSB0aGlzLm5hdmlnYXRpb25JbmZvUXVldWVbMF07XG5cdFx0XHR0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUgPSB0aGlzLm5hdmlnYXRpb25JbmZvUXVldWUuc2xpY2UoMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzLm5hdmlnYXRpb25JbmZvID0ge307XG5cdFx0fVxuXHRcdGlmIChvQXBwU3RhdGVIYW5kbGVyLmNoZWNrSWZSb3V0ZUNoYW5nZWRCeUlBcHAoKSkge1xuXHRcdFx0bVBhcmFtZXRlcnMubmF2aWdhdGlvbkluZm8ucmVhc29uID0gTmF2aWdhdGlvblJlYXNvbi5BcHBTdGF0ZUNoYW5nZWQ7XG5cdFx0XHRvQXBwU3RhdGVIYW5kbGVyLnJlc2V0Um91dGVDaGFuZ2VkQnlJQXBwKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zQ3VycmVudFJvdXRlTmFtZSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJuYW1lXCIpO1xuXHRcdHRoaXMuc0N1cnJlbnRSb3V0ZVBhdHRlcm4gPSBtUGFyYW1ldGVycy5jb25maWcucGF0dGVybjtcblx0XHR0aGlzLmFDdXJyZW50Vmlld3MgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmlld3NcIik7XG5cblx0XHRtUGFyYW1ldGVycy5yb3V0ZUluZm9ybWF0aW9uID0gdGhpcy5fZ2V0Um91dGVJbmZvcm1hdGlvbih0aGlzLnNDdXJyZW50Um91dGVOYW1lKTtcblx0XHRtUGFyYW1ldGVycy5yb3V0ZVBhdHRlcm4gPSB0aGlzLnNDdXJyZW50Um91dGVQYXR0ZXJuO1xuXG5cdFx0dGhpcy5fZmlyZVJvdXRlTWF0Y2hFdmVudHMobVBhcmFtZXRlcnMpO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgY3VycmVudCBoYXNoIGhhcyBiZWVuIHNldCBieSB0aGUgcm91dGVyUHJveHkubmF2VG9IYXNoIGZ1bmN0aW9uXG5cdFx0Ly8gSWYgbm90LCByZWJ1aWxkIGhpc3RvcnkgcHJvcGVybHkgKGJvdGggaW4gdGhlIGJyb3dzZXIgYW5kIHRoZSBSb3V0ZXJQcm94eSlcblx0XHRpZiAoIWhpc3Rvcnkuc3RhdGUgfHwgaGlzdG9yeS5zdGF0ZS5mZUxldmVsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMub1JvdXRlclByb3h5XG5cdFx0XHRcdC5yZXN0b3JlSGlzdG9yeSgpXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm9Sb3V0ZXJQcm94eS5yZXNvbHZlUm91dGVNYXRjaCgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVzdG9yaW5nIGhpc3RvcnlcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMub1JvdXRlclByb3h5LnJlc29sdmVSb3V0ZU1hdGNoKCk7XG5cdFx0fVxuXHR9XG5cblx0YXR0YWNoUm91dGVNYXRjaGVkKG9EYXRhOiBhbnksIGZuRnVuY3Rpb24/OiBhbnksIG9MaXN0ZW5lcj86IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5hdHRhY2hFdmVudChcInJvdXRlTWF0Y2hlZFwiLCBvRGF0YSwgZm5GdW5jdGlvbiwgb0xpc3RlbmVyKTtcblx0fVxuXG5cdGRldGFjaFJvdXRlTWF0Y2hlZChmbkZ1bmN0aW9uOiBhbnksIG9MaXN0ZW5lcj86IGFueSkge1xuXHRcdHRoaXMuZXZlbnRQcm92aWRlci5kZXRhY2hFdmVudChcInJvdXRlTWF0Y2hlZFwiLCBmbkZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cblx0YXR0YWNoQWZ0ZXJSb3V0ZU1hdGNoZWQob0RhdGE6IGFueSwgZm5GdW5jdGlvbjogYW55LCBvTGlzdGVuZXI/OiBhbnkpIHtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuYXR0YWNoRXZlbnQoXCJhZnRlclJvdXRlTWF0Y2hlZFwiLCBvRGF0YSwgZm5GdW5jdGlvbiwgb0xpc3RlbmVyKTtcblx0fVxuXG5cdGRldGFjaEFmdGVyUm91dGVNYXRjaGVkKGZuRnVuY3Rpb246IGFueSwgb0xpc3RlbmVyOiBhbnkpIHtcblx0XHR0aGlzLmV2ZW50UHJvdmlkZXIuZGV0YWNoRXZlbnQoXCJhZnRlclJvdXRlTWF0Y2hlZFwiLCBmbkZ1bmN0aW9uLCBvTGlzdGVuZXIpO1xuXHR9XG5cblx0Z2V0Um91dGVGcm9tSGFzaChvUm91dGVyOiBhbnksIG9BcHBDb21wb25lbnQ6IGFueSkge1xuXHRcdGNvbnN0IHNIYXNoID0gb1JvdXRlci5nZXRIYXNoQ2hhbmdlcigpLmhhc2g7XG5cdFx0Y29uc3Qgb1JvdXRlSW5mbyA9IG9Sb3V0ZXIuZ2V0Um91dGVJbmZvQnlIYXNoKHNIYXNoKTtcblx0XHRyZXR1cm4gb0FwcENvbXBvbmVudFxuXHRcdFx0LmdldE1ldGFkYXRhKClcblx0XHRcdC5nZXRNYW5pZmVzdEVudHJ5KFwiL3NhcC51aTUvcm91dGluZy9yb3V0ZXNcIilcblx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9Sb3V0ZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvUm91dGUubmFtZSA9PT0gb1JvdXRlSW5mby5uYW1lO1xuXHRcdFx0fSlbMF07XG5cdH1cblxuXHRnZXRUYXJnZXRzRnJvbVJvdXRlKG9Sb3V0ZTogYW55KSB7XG5cdFx0Y29uc3Qgb1RhcmdldCA9IG9Sb3V0ZS50YXJnZXQ7XG5cdFx0aWYgKHR5cGVvZiBvVGFyZ2V0ID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRyZXR1cm4gW3RoaXMuX21UYXJnZXRzW29UYXJnZXRdXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgYVRhcmdldDogYW55W10gPSBbXTtcblx0XHRcdG9UYXJnZXQuZm9yRWFjaCgoc1RhcmdldDogYW55KSA9PiB7XG5cdFx0XHRcdGFUYXJnZXQucHVzaCh0aGlzLl9tVGFyZ2V0c1tzVGFyZ2V0XSk7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhVGFyZ2V0O1xuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGluaXRpYWxpemVSb3V0aW5nKCkge1xuXHRcdC8vIEF0dGFjaCByb3V0ZXIgaGFuZGxlcnNcblx0XHRhd2FpdCBDb2xsYWJvcmF0aW9uSGVscGVyLnByb2Nlc3NBbmRFeHBhbmRIYXNoKCk7XG5cdFx0dGhpcy5fZm5PblJvdXRlTWF0Y2hlZCA9IHRoaXMuX29uUm91dGVNYXRjaGVkLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5vUm91dGVyLmF0dGFjaFJvdXRlTWF0Y2hlZCh0aGlzLl9mbk9uUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0XHRjb25zdCBiUGxhY2Vob2xkZXJFbmFibGVkID0gbmV3IFBsYWNlaG9sZGVyKCkuaXNQbGFjZWhvbGRlckVuYWJsZWQoKTtcblx0XHRpZiAoIWJQbGFjZWhvbGRlckVuYWJsZWQpIHtcblx0XHRcdHRoaXMub1JvdXRlci5hdHRhY2hCZWZvcmVSb3V0ZU1hdGNoZWQodGhpcy5fYmVmb3JlUm91dGVNYXRjaGVkLmJpbmQodGhpcykpO1xuXHRcdH1cblx0XHQvLyBSZXNldCBpbnRlcm5hbCBzdGF0ZVxuXHRcdHRoaXMubmF2aWdhdGlvbkluZm9RdWV1ZSA9IFtdO1xuXHRcdEVkaXRTdGF0ZS5yZXNldEVkaXRTdGF0ZSgpO1xuXHRcdHRoaXMuYkV4aXRPbk5hdmlnYXRlQmFja1RvUm9vdCA9ICF0aGlzLm9Sb3V0ZXIubWF0Y2goXCJcIik7XG5cblx0XHRjb25zdCBiSXNJYXBwU3RhdGUgPSB0aGlzLm9Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5nZXRIYXNoKCkuaW5kZXhPZihcInNhcC1pYXBwLXN0YXRlXCIpICE9PSAtMTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb1N0YXJ0dXBQYXJhbWV0ZXJzID0gYXdhaXQgdGhpcy5vQXBwQ29tcG9uZW50LmdldFN0YXJ0dXBQYXJhbWV0ZXJzKCk7XG5cdFx0XHRjb25zdCBiSGFzU3RhcnRVcFBhcmFtZXRlcnMgPSBvU3RhcnR1cFBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCAmJiBPYmplY3Qua2V5cyhvU3RhcnR1cFBhcmFtZXRlcnMpLmxlbmd0aCAhPT0gMDtcblx0XHRcdGNvbnN0IHNIYXNoID0gdGhpcy5vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkuZ2V0SGFzaCgpO1xuXHRcdFx0Ly8gTWFuYWdlIHN0YXJ0dXAgcGFyYW1ldGVycyAoaW4gY2FzZSBvZiBubyBpYXBwLXN0YXRlKVxuXHRcdFx0aWYgKCFiSXNJYXBwU3RhdGUgJiYgYkhhc1N0YXJ0VXBQYXJhbWV0ZXJzICYmICFzSGFzaCkge1xuXHRcdFx0XHRpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGUgJiYgb1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGVbMF0udG9VcHBlckNhc2UoKS5pbmRleE9mKFwiQ1JFQVRFXCIpICE9PSAtMSkge1xuXHRcdFx0XHRcdC8vIENyZWF0ZSBtb2RlXG5cdFx0XHRcdFx0Ly8gVGhpcyBjaGVjayB3aWxsIGNhdGNoIG11bHRpcGxlIG1vZGVzIGxpa2UgY3JlYXRlLCBjcmVhdGVXaXRoIGFuZCBhdXRvQ3JlYXRlV2l0aCB3aGljaCBhbGwgbmVlZFxuXHRcdFx0XHRcdC8vIHRvIGJlIGhhbmRsZWQgbGlrZSBjcmVhdGUgc3RhcnR1cCFcblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9tYW5hZ2VDcmVhdGVTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVycyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gRGVlcCBsaW5rXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5fbWFuYWdlRGVlcExpbmtTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVycyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3I6IHVua25vd24pIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIGR1cmluZyByb3V0aW5nIGluaXRpYWxpemF0aW9uXCIsIG9FcnJvciBhcyBzdHJpbmcpO1xuXHRcdH1cblx0fVxuXG5cdGdldERlZmF1bHRDcmVhdGVIYXNoKG9TdGFydHVwUGFyYW1ldGVycz86IGFueSkge1xuXHRcdHJldHVybiBBcHBTdGFydHVwSGVscGVyLmdldERlZmF1bHRDcmVhdGVIYXNoKG9TdGFydHVwUGFyYW1ldGVycywgdGhpcy5nZXRDb250ZXh0UGF0aCgpLCB0aGlzLm9Sb3V0ZXIpO1xuXHR9XG5cblx0X21hbmFnZUNyZWF0ZVN0YXJ0dXAob1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRyZXR1cm4gQXBwU3RhcnR1cEhlbHBlci5nZXRDcmVhdGVTdGFydHVwSGFzaChvU3RhcnR1cFBhcmFtZXRlcnMsIHRoaXMuZ2V0Q29udGV4dFBhdGgoKSwgdGhpcy5vUm91dGVyLCB0aGlzLm9NZXRhTW9kZWwpLnRoZW4oXG5cdFx0XHQoc05ld0hhc2g6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoc05ld0hhc2gpIHtcblx0XHRcdFx0XHQodGhpcy5vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkucmVwbGFjZUhhc2ggYXMgYW55KShzTmV3SGFzaCk7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzPy5wcmVmZXJyZWRNb2RlICYmXG5cdFx0XHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJBVVRPQ1JFQVRFXCIpICE9PSAtMVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0dGhpcy5vQXBwQ29tcG9uZW50LnNldFN0YXJ0dXBNb2RlQXV0b0NyZWF0ZSgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLm9BcHBDb21wb25lbnQuc2V0U3RhcnR1cE1vZGVDcmVhdGUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5iRXhpdE9uTmF2aWdhdGVCYWNrVG9Sb290ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdCk7XG5cdH1cblxuXHRfbWFuYWdlRGVlcExpbmtTdGFydHVwKG9TdGFydHVwUGFyYW1ldGVyczogYW55KSB7XG5cdFx0cmV0dXJuIEFwcFN0YXJ0dXBIZWxwZXIuZ2V0RGVlcExpbmtTdGFydHVwSGFzaChcblx0XHRcdCh0aGlzLm9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3QoKSBhcyBhbnkpW1wic2FwLnVpNVwiXS5yb3V0aW5nLFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzLFxuXHRcdFx0dGhpcy5vTW9kZWxcblx0XHQpLnRoZW4oKG9EZWVwTGluazogYW55KSA9PiB7XG5cdFx0XHRsZXQgc0hhc2g7XG5cdFx0XHRpZiAob0RlZXBMaW5rLmNvbnRleHQpIHtcblx0XHRcdFx0Y29uc3Qgc1RlY2huaWNhbFBhdGggPSBvRGVlcExpbmsuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRcdGNvbnN0IHNTZW1hbnRpY1BhdGggPSB0aGlzLl9jaGVja0lmQ29udGV4dFN1cHBvcnRzU2VtYW50aWNQYXRoKG9EZWVwTGluay5jb250ZXh0KVxuXHRcdFx0XHRcdD8gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNQYXRoKG9EZWVwTGluay5jb250ZXh0KVxuXHRcdFx0XHRcdDogc1RlY2huaWNhbFBhdGg7XG5cblx0XHRcdFx0aWYgKHNTZW1hbnRpY1BhdGggIT09IHNUZWNobmljYWxQYXRoKSB7XG5cdFx0XHRcdFx0Ly8gU3RvcmUgdGhlIG1hcHBpbmcgdGVjaG5pY2FsIDwtPiBzZW1hbnRpYyBwYXRoIHRvIGF2b2lkIHJlY2FsY3VsYXRpbmcgaXQgbGF0ZXJcblx0XHRcdFx0XHQvLyBhbmQgdXNlIHRoZSBzZW1hbnRpYyBwYXRoIGluc3RlYWQgb2YgdGhlIHRlY2huaWNhbCBvbmVcblx0XHRcdFx0XHR0aGlzLnNldExhc3RTZW1hbnRpY01hcHBpbmcoeyB0ZWNobmljYWxQYXRoOiBzVGVjaG5pY2FsUGF0aCwgc2VtYW50aWNQYXRoOiBzU2VtYW50aWNQYXRoIH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c0hhc2ggPSBzU2VtYW50aWNQYXRoLnN1YnN0cmluZygxKTsgLy8gVG8gcmVtb3ZlIHRoZSBsZWFkaW5nICcvJ1xuXHRcdFx0fSBlbHNlIGlmIChvRGVlcExpbmsuaGFzaCkge1xuXHRcdFx0XHRzSGFzaCA9IG9EZWVwTGluay5oYXNoO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc0hhc2gpIHtcblx0XHRcdFx0Ly9SZXBsYWNlIHRoZSBoYXNoIHdpdGggbmV3bHkgY3JlYXRlZCBoYXNoXG5cdFx0XHRcdCh0aGlzLm9Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5yZXBsYWNlSGFzaCBhcyBhbnkpKHNIYXNoKTtcblx0XHRcdFx0dGhpcy5vQXBwQ29tcG9uZW50LnNldFN0YXJ0dXBNb2RlRGVlcGxpbmsoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGdldE91dGJvdW5kcygpIHtcblx0XHRyZXR1cm4gdGhpcy5vdXRib3VuZHM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgbmFtZSBvZiB0aGUgRHJhZnQgcm9vdCBlbnRpdHkgc2V0IG9yIHRoZSBzdGlja3ktZW5hYmxlZCBlbnRpdHkgc2V0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgbmFtZSBvZiB0aGUgcm9vdCBFbnRpdHlTZXRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRDb250ZXh0UGF0aCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zQ29udGV4dFBhdGg7XG5cdH1cblxuXHRnZXRJbnRlcmZhY2UoKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5jbGFzcyBSb3V0aW5nU2VydmljZUZhY3RvcnkgZXh0ZW5kcyBTZXJ2aWNlRmFjdG9yeTxSb3V0aW5nU2VydmljZVNldHRpbmdzPiB7XG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8Um91dGluZ1NlcnZpY2VTZXR0aW5ncz4pIHtcblx0XHRjb25zdCBvUm91dGluZ1NlcnZpY2UgPSBuZXcgUm91dGluZ1NlcnZpY2Uob1NlcnZpY2VDb250ZXh0KTtcblx0XHRyZXR1cm4gb1JvdXRpbmdTZXJ2aWNlLmluaXRQcm9taXNlO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvdXRpbmdTZXJ2aWNlRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7TUE0Qk1BLHNCQUFzQixXQUQzQkMsY0FBYyxDQUFDLDZDQUE2QyxDQUFDLFVBRTVEQyxLQUFLLEVBQUUsVUFHUEEsS0FBSyxFQUFFO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0VBQUEsRUFKNEJDLGFBQWE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLElBMEJyQ0MsY0FBYztJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUEsT0ErQjFCQyxtQkFBbUIsR0FBNEIsRUFBRTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUEsT0FNakRDLElBQUksR0FBSixnQkFBTztNQUNOLE1BQU1DLFFBQVEsR0FBRyxJQUFJLENBQUNDLFVBQVUsRUFBRTtNQUNsQyxJQUFJRCxRQUFRLENBQUNFLFNBQVMsS0FBSyxXQUFXLEVBQUU7UUFBQTtRQUN2QyxJQUFJLENBQUNDLGFBQWEsR0FBR0gsUUFBUSxDQUFDSSxXQUFXO1FBQ3pDLElBQUksQ0FBQ0MsTUFBTSxHQUFHLElBQUksQ0FBQ0YsYUFBYSxDQUFDRyxRQUFRLEVBQWdCO1FBQ3pELElBQUksQ0FBQ0MsVUFBVSxHQUFHLElBQUksQ0FBQ0YsTUFBTSxDQUFDRyxZQUFZLEVBQUU7UUFDNUMsSUFBSSxDQUFDQyxPQUFPLEdBQUcsSUFBSSxDQUFDTixhQUFhLENBQUNPLFNBQVMsRUFBRTtRQUM3QyxJQUFJLENBQUNDLFlBQVksR0FBRyxJQUFJLENBQUNSLGFBQWEsQ0FBQ1MsY0FBYyxFQUFFO1FBQ3ZELElBQUksQ0FBQ0MsYUFBYSxHQUFHLElBQUtwQixzQkFBc0IsRUFBVTtRQUUxRCxNQUFNcUIsY0FBYyxHQUFHLElBQUksQ0FBQ1gsYUFBYSxDQUFDWSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQ0MsT0FBTztRQUM3RSxJQUFJLENBQUNDLDBCQUEwQixDQUFDSCxjQUFjLENBQUM7UUFFL0MsTUFBTUksVUFBVSxHQUFHLElBQUksQ0FBQ2YsYUFBYSxDQUFDWSxnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7UUFDakUsSUFBSSxDQUFDSSxTQUFTLDRCQUFHRCxVQUFVLENBQUNFLGVBQWUsMERBQTFCLHNCQUE0QkQsU0FBUztNQUN2RDtNQUVBLElBQUksQ0FBQ0UsV0FBVyxHQUFHQyxPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDekMsQ0FBQztJQUFBLE9BRURDLFVBQVUsR0FBVixzQkFBYTtNQUNaLElBQUksQ0FBQ2YsT0FBTyxDQUFDZ0Isa0JBQWtCLENBQUMsSUFBSSxDQUFDQyxpQkFBaUIsRUFBRSxJQUFJLENBQUM7TUFDN0QsSUFBSSxDQUFDYixhQUFhLENBQUNjLFNBQVMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUFBLE9BRURDLElBQUksR0FBSixnQkFBTztNQUNOLElBQUksQ0FBQ2YsYUFBYSxDQUFDZ0IsT0FBTyxFQUFFO0lBQzdCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQVosMEJBQTBCLEdBQTFCLG9DQUEyQkgsY0FBbUIsRUFBRTtNQUFBO01BQy9DLE1BQU1nQixLQUFLLEdBQUcsQ0FBQWhCLGNBQWMsYUFBZEEsY0FBYyxnREFBZEEsY0FBYyxDQUFFaUIsTUFBTSwwREFBdEIsc0JBQXdCQyxXQUFXLE1BQUssc0JBQXNCOztNQUU1RTtNQUNBLElBQUksQ0FBQ0MsU0FBUyxHQUFHLENBQUMsQ0FBQztNQUNuQkMsTUFBTSxDQUFDQyxJQUFJLENBQUNyQixjQUFjLENBQUNzQixPQUFPLENBQUMsQ0FBQ0MsT0FBTyxDQUFFQyxXQUFtQixJQUFLO1FBQ3BFLElBQUksQ0FBQ0wsU0FBUyxDQUFDSyxXQUFXLENBQUMsR0FBR0osTUFBTSxDQUFDSyxNQUFNLENBQUM7VUFBRUMsVUFBVSxFQUFFRjtRQUFZLENBQUMsRUFBRXhCLGNBQWMsQ0FBQ3NCLE9BQU8sQ0FBQ0UsV0FBVyxDQUFDLENBQUM7O1FBRTdHO1FBQ0EsSUFBSSxJQUFJLENBQUNMLFNBQVMsQ0FBQ0ssV0FBVyxDQUFDLENBQUNHLGNBQWMsS0FBS0MsU0FBUyxFQUFFO1VBQzdELElBQUksQ0FBQ1QsU0FBUyxDQUFDSyxXQUFXLENBQUMsQ0FBQ0ssU0FBUyxHQUFHLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsSUFBSSxDQUFDWCxTQUFTLENBQUNLLFdBQVcsQ0FBQyxDQUFDRyxjQUFjLEVBQUUsQ0FBQyxDQUFDO1FBQ3JIO01BQ0QsQ0FBQyxDQUFDOztNQUVGO01BQ0EsSUFBSSxDQUFDSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO01BQ2xCLEtBQUssTUFBTUMsU0FBUyxJQUFJaEMsY0FBYyxDQUFDaUMsTUFBTSxFQUFFO1FBQzlDLE1BQU1DLGtCQUFrQixHQUFHbEMsY0FBYyxDQUFDaUMsTUFBTSxDQUFDRCxTQUFTLENBQUM7VUFDMURHLGFBQWEsR0FBR0MsS0FBSyxDQUFDQyxPQUFPLENBQUNILGtCQUFrQixDQUFDSSxNQUFNLENBQUMsR0FBR0osa0JBQWtCLENBQUNJLE1BQU0sR0FBRyxDQUFDSixrQkFBa0IsQ0FBQ0ksTUFBTSxDQUFDO1VBQ2xIQyxVQUFVLEdBQUdILEtBQUssQ0FBQ0MsT0FBTyxDQUFDckMsY0FBYyxDQUFDaUMsTUFBTSxDQUFDLEdBQUdDLGtCQUFrQixDQUFDTSxJQUFJLEdBQUdSLFNBQVM7VUFDdkZTLGFBQWEsR0FBR1Asa0JBQWtCLENBQUNRLE9BQU87O1FBRTNDO1FBQ0EsSUFBSUQsYUFBYSxDQUFDRSxNQUFNLEdBQUcsQ0FBQyxJQUFJRixhQUFhLENBQUNHLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBS0gsYUFBYSxDQUFDRSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQy9GRSxHQUFHLENBQUNDLE9BQU8sQ0FBRSxxQkFBb0JQLFVBQVcsa0NBQWlDRSxhQUFjLEVBQUMsQ0FBQztRQUM5RjtRQUNBLE1BQU1NLFdBQVcsR0FBRyxJQUFJLENBQUNqQix3QkFBd0IsQ0FBQ1csYUFBYSxFQUFFLENBQUMsQ0FBQztRQUNuRSxJQUFJLENBQUNWLFFBQVEsQ0FBQ1EsVUFBVSxDQUFDLEdBQUc7VUFDM0JDLElBQUksRUFBRUQsVUFBVTtVQUNoQkcsT0FBTyxFQUFFRCxhQUFhO1VBQ3RCbkIsT0FBTyxFQUFFYSxhQUFhO1VBQ3RCYSxVQUFVLEVBQUVEO1FBQ2IsQ0FBQzs7UUFFRDtRQUNBLEtBQUssSUFBSUUsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHZCxhQUFhLENBQUNRLE1BQU0sRUFBRU0sQ0FBQyxFQUFFLEVBQUU7VUFDOUMsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSSxDQUFDL0IsU0FBUyxDQUFDZ0IsYUFBYSxDQUFDYyxDQUFDLENBQUMsQ0FBQyxDQUFDRSxNQUFNO1VBQ2pFLElBQUlELGlCQUFpQixFQUFFO1lBQ3RCZixhQUFhLENBQUNpQixJQUFJLENBQUNGLGlCQUFpQixDQUFDO1VBQ3RDO1FBQ0Q7UUFFQSxJQUFJLENBQUNsQyxLQUFLLEVBQUU7VUFDWDtVQUNBLElBQUksSUFBSSxDQUFDRyxTQUFTLENBQUNnQixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ04sU0FBUyxLQUFLRCxTQUFTLElBQUksSUFBSSxDQUFDVCxTQUFTLENBQUNnQixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ04sU0FBUyxHQUFHa0IsV0FBVyxFQUFFO1lBQ3pIO1lBQ0E7WUFDQSxJQUFJLENBQUM1QixTQUFTLENBQUNnQixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ04sU0FBUyxHQUFHa0IsV0FBVztVQUN6RDs7VUFFQTtVQUNBLElBQUksQ0FBQzVCLFNBQVMsQ0FBQ2dCLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDa0IsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUMvQyxDQUFDLE1BQU0sSUFBSWxCLGFBQWEsQ0FBQ1EsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUN4QixTQUFTLENBQUNnQixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ21CLGtCQUFrQixLQUFLLGtCQUFrQixFQUFFO1VBQ3BIO1VBQ0E7VUFDQSxJQUFJLENBQUNuQyxTQUFTLENBQUNnQixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQ2tCLFFBQVEsR0FBRyxDQUFDO1FBQzlDLENBQUMsTUFBTTtVQUNOO1VBQ0FsQixhQUFhLENBQUNaLE9BQU8sQ0FBRUMsV0FBZ0IsSUFBSztZQUMzQyxRQUFRLElBQUksQ0FBQ0wsU0FBUyxDQUFDSyxXQUFXLENBQUMsQ0FBQzhCLGtCQUFrQjtjQUNyRCxLQUFLLGtCQUFrQjtnQkFDdEIsSUFBSSxDQUFDbkMsU0FBUyxDQUFDSyxXQUFXLENBQUMsQ0FBQzZCLFFBQVEsR0FBRyxDQUFDO2dCQUN4QztjQUVELEtBQUssZ0JBQWdCO2dCQUNwQixJQUFJLENBQUNsQyxTQUFTLENBQUNLLFdBQVcsQ0FBQyxDQUFDNkIsUUFBUSxHQUFHLENBQUM7Z0JBQ3hDO2NBRUQ7Z0JBQ0MsSUFBSSxDQUFDbEMsU0FBUyxDQUFDSyxXQUFXLENBQUMsQ0FBQzZCLFFBQVEsR0FBRyxDQUFDO1lBQUM7VUFFNUMsQ0FBQyxDQUFDO1FBQ0g7TUFDRDs7TUFFQTtNQUNBakMsTUFBTSxDQUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDRixTQUFTLENBQUMsQ0FBQ0ksT0FBTyxDQUFFQyxXQUFtQixJQUFLO1FBQzVELE9BQU8sSUFBSSxDQUFDTCxTQUFTLENBQUNLLFdBQVcsQ0FBQyxDQUFDMkIsTUFBTSxFQUFFO1VBQzFDLE1BQU1ELGlCQUFpQixHQUFHLElBQUksQ0FBQy9CLFNBQVMsQ0FBQ0ssV0FBVyxDQUFDLENBQUMyQixNQUFNO1VBQzVELElBQUksQ0FBQ2hDLFNBQVMsQ0FBQytCLGlCQUFpQixDQUFDLENBQUNyQixTQUFTLEdBQzFDLElBQUksQ0FBQ1YsU0FBUyxDQUFDK0IsaUJBQWlCLENBQUMsQ0FBQ3JCLFNBQVMsSUFBSSxJQUFJLENBQUNWLFNBQVMsQ0FBQ0ssV0FBVyxDQUFDLENBQUNLLFNBQVM7VUFDckYsSUFBSSxDQUFDVixTQUFTLENBQUMrQixpQkFBaUIsQ0FBQyxDQUFDdkIsY0FBYyxHQUMvQyxJQUFJLENBQUNSLFNBQVMsQ0FBQytCLGlCQUFpQixDQUFDLENBQUN2QixjQUFjLElBQUksSUFBSSxDQUFDUixTQUFTLENBQUNLLFdBQVcsQ0FBQyxDQUFDRyxjQUFjO1VBQy9GLElBQUksQ0FBQ1IsU0FBUyxDQUFDK0IsaUJBQWlCLENBQUMsQ0FBQ0csUUFBUSxHQUN6QyxJQUFJLENBQUNsQyxTQUFTLENBQUMrQixpQkFBaUIsQ0FBQyxDQUFDRyxRQUFRLElBQUksSUFBSSxDQUFDbEMsU0FBUyxDQUFDSyxXQUFXLENBQUMsQ0FBQzZCLFFBQVE7VUFDbkYsSUFBSSxDQUFDbEMsU0FBUyxDQUFDK0IsaUJBQWlCLENBQUMsQ0FBQ0ksa0JBQWtCLEdBQ25ELElBQUksQ0FBQ25DLFNBQVMsQ0FBQytCLGlCQUFpQixDQUFDLENBQUNJLGtCQUFrQixJQUFJLElBQUksQ0FBQ25DLFNBQVMsQ0FBQ0ssV0FBVyxDQUFDLENBQUM4QixrQkFBa0I7VUFDdkc5QixXQUFXLEdBQUcwQixpQkFBaUI7UUFDaEM7TUFDRCxDQUFDLENBQUM7O01BRUY7TUFDQSxNQUFNSyxpQkFBaUIsR0FBRyxFQUFFO01BQzVCLE1BQU1DLGlCQUFpQixHQUFHLEVBQUU7TUFDNUIsSUFBSUMsaUJBQWlCO01BRXJCLEtBQUssTUFBTUMsS0FBSyxJQUFJLElBQUksQ0FBQzNCLFFBQVEsRUFBRTtRQUNsQyxNQUFNNEIsTUFBTSxHQUFHLElBQUksQ0FBQzVCLFFBQVEsQ0FBQzJCLEtBQUssQ0FBQyxDQUFDVixVQUFVO1FBQzlDLElBQUlXLE1BQU0sS0FBSyxDQUFDLEVBQUU7VUFDakJKLGlCQUFpQixDQUFDSCxJQUFJLENBQUNNLEtBQUssQ0FBQztRQUM5QixDQUFDLE1BQU0sSUFBSUMsTUFBTSxLQUFLLENBQUMsRUFBRTtVQUN4QkgsaUJBQWlCLENBQUNKLElBQUksQ0FBQ00sS0FBSyxDQUFDO1FBQzlCO01BQ0Q7TUFFQSxJQUFJSCxpQkFBaUIsQ0FBQ1osTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQ2MsaUJBQWlCLEdBQUdGLGlCQUFpQixDQUFDLENBQUMsQ0FBQztNQUN6QyxDQUFDLE1BQU0sSUFBSUMsaUJBQWlCLENBQUNiLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDMUNjLGlCQUFpQixHQUFHRCxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7TUFDekM7TUFFQSxJQUFJQyxpQkFBaUIsRUFBRTtRQUN0QixNQUFNRyxrQkFBa0IsR0FBRyxJQUFJLENBQUM3QixRQUFRLENBQUMwQixpQkFBaUIsQ0FBQyxDQUFDbkMsT0FBTyxDQUFDdUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLElBQUksQ0FBQ0MsWUFBWSxHQUFHLEVBQUU7UUFDdEIsSUFBSSxJQUFJLENBQUMzQyxTQUFTLENBQUN5QyxrQkFBa0IsQ0FBQyxDQUFDRyxPQUFPLElBQUksSUFBSSxDQUFDNUMsU0FBUyxDQUFDeUMsa0JBQWtCLENBQUMsQ0FBQ0csT0FBTyxDQUFDQyxRQUFRLEVBQUU7VUFDdEcsTUFBTUMsU0FBUyxHQUFHLElBQUksQ0FBQzlDLFNBQVMsQ0FBQ3lDLGtCQUFrQixDQUFDLENBQUNHLE9BQU8sQ0FBQ0MsUUFBUTtVQUNyRSxJQUFJLENBQUNGLFlBQVksR0FBR0csU0FBUyxDQUFDQyxXQUFXLElBQUssSUFBR0QsU0FBUyxDQUFDRSxTQUFVLEVBQUM7UUFDdkU7UUFDQSxJQUFJLENBQUMsSUFBSSxDQUFDTCxZQUFZLEVBQUU7VUFDdkJqQixHQUFHLENBQUNDLE9BQU8sQ0FDVCw2RkFBNEZjLGtCQUFtQixFQUFDLENBQ2pIO1FBQ0Y7TUFDRCxDQUFDLE1BQU07UUFDTmYsR0FBRyxDQUFDQyxPQUFPLENBQUMsK0RBQStELENBQUM7TUFDN0U7O01BRUE7TUFDQTFCLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQ0YsU0FBUyxDQUFDLENBQ3pCaUQsR0FBRyxDQUFFQyxVQUFrQixJQUFLO1FBQzVCLE9BQU8sSUFBSSxDQUFDbEQsU0FBUyxDQUFDa0QsVUFBVSxDQUFDO01BQ2xDLENBQUMsQ0FBQyxDQUNEQyxJQUFJLENBQUMsQ0FBQ0MsQ0FBTSxFQUFFQyxDQUFNLEtBQUs7UUFDekIsT0FBT0QsQ0FBQyxDQUFDMUMsU0FBUyxHQUFHMkMsQ0FBQyxDQUFDM0MsU0FBUyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUM7TUFDMUMsQ0FBQyxDQUFDLENBQ0ROLE9BQU8sQ0FBRWUsTUFBVyxJQUFLO1FBQ3pCO1FBQ0EsSUFBSUEsTUFBTSxDQUFDeUIsT0FBTyxFQUFFO1VBQ25CLE1BQU1DLFFBQVEsR0FBRzFCLE1BQU0sQ0FBQ3lCLE9BQU8sQ0FBQ0MsUUFBUTtVQUN4QyxNQUFNRixZQUFZLEdBQUdFLFFBQVEsQ0FBQ0UsV0FBVyxLQUFLRixRQUFRLENBQUNHLFNBQVMsR0FBSSxJQUFHSCxRQUFRLENBQUNHLFNBQVUsRUFBQyxHQUFHLEVBQUUsQ0FBQztVQUNqRyxJQUFJLENBQUNILFFBQVEsQ0FBQ1MsZUFBZSxJQUFJWCxZQUFZLEVBQUU7WUFDOUNFLFFBQVEsQ0FBQ1MsZUFBZSxHQUFJLEdBQUVYLFlBQWEsR0FBRTtVQUM5QztVQUNBMUMsTUFBTSxDQUFDQyxJQUFJLENBQUMyQyxRQUFRLENBQUNVLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDbkQsT0FBTyxDQUFFb0QsUUFBZ0IsSUFBSztZQUNwRTtZQUNBLE1BQU1DLFdBQVcsR0FBRyxJQUFJLENBQUM3QyxRQUFRLENBQUNpQyxRQUFRLENBQUNVLFVBQVUsQ0FBQ0MsUUFBUSxDQUFDLENBQUNFLE1BQU0sQ0FBQ0MsS0FBSyxDQUFDO1lBQzdFLElBQUlGLFdBQVcsSUFBSUEsV0FBVyxDQUFDdEQsT0FBTyxFQUFFO2NBQ3ZDc0QsV0FBVyxDQUFDdEQsT0FBTyxDQUFDQyxPQUFPLENBQUVDLFdBQWdCLElBQUs7Z0JBQ2pELElBQ0MsSUFBSSxDQUFDTCxTQUFTLENBQUNLLFdBQVcsQ0FBQyxDQUFDdUMsT0FBTyxJQUNuQyxJQUFJLENBQUM1QyxTQUFTLENBQUNLLFdBQVcsQ0FBQyxDQUFDdUMsT0FBTyxDQUFDQyxRQUFRLElBQzVDLENBQUMsSUFBSSxDQUFDN0MsU0FBUyxDQUFDSyxXQUFXLENBQUMsQ0FBQ3VDLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDUyxlQUFlLEVBQzVEO2tCQUNELElBQUluQyxNQUFNLENBQUNULFNBQVMsS0FBSyxDQUFDLEVBQUU7b0JBQzNCLElBQUksQ0FBQ1YsU0FBUyxDQUFDSyxXQUFXLENBQUMsQ0FBQ3VDLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDUyxlQUFlLEdBQUksR0FDL0QsQ0FBQ0UsUUFBUSxDQUFDSSxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEdBQUcsSUFBSUosUUFDeEMsR0FBRTtrQkFDSixDQUFDLE1BQU07b0JBQ04sSUFBSSxDQUFDeEQsU0FBUyxDQUFDSyxXQUFXLENBQUMsQ0FBQ3VDLE9BQU8sQ0FBQ0MsUUFBUSxDQUFDUyxlQUFlLEdBQUksR0FDL0RULFFBQVEsQ0FBQ1MsZUFBZSxHQUFHRSxRQUMzQixHQUFFO2tCQUNKO2dCQUNEO2NBQ0QsQ0FBQyxDQUFDO1lBQ0g7VUFDRCxDQUFDLENBQUM7UUFDSDtNQUNELENBQUMsQ0FBQztJQUNKOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9BN0Msd0JBQXdCLEdBQXhCLGtDQUF5QmtELFFBQWdCLEVBQUVuRCxTQUFpQixFQUFVO01BQ3JFbUQsUUFBUSxHQUFHQSxRQUFRLENBQUNDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDO01BQzNDLE1BQU1DLEtBQUssR0FBRyxJQUFJQyxNQUFNLENBQUMsU0FBUyxDQUFDO01BQ25DLElBQUlILFFBQVEsSUFBSUEsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSUEsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsRUFBRTtRQUMzREEsUUFBUSxHQUFJLElBQUdBLFFBQVMsRUFBQztNQUMxQjtNQUNBLElBQUlBLFFBQVEsQ0FBQ3JDLE1BQU0sRUFBRTtRQUNwQnFDLFFBQVEsR0FBR0EsUUFBUSxDQUFDQyxPQUFPLENBQUNDLEtBQUssRUFBRSxFQUFFLENBQUM7UUFDdEMsSUFBSSxJQUFJLENBQUN2RixPQUFPLENBQUN5RixLQUFLLENBQUNKLFFBQVEsQ0FBQyxJQUFJQSxRQUFRLEtBQUssRUFBRSxFQUFFO1VBQ3BELE9BQU8sSUFBSSxDQUFDbEQsd0JBQXdCLENBQUNrRCxRQUFRLEVBQUUsRUFBRW5ELFNBQVMsQ0FBQztRQUM1RCxDQUFDLE1BQU07VUFDTixPQUFPLElBQUksQ0FBQ0Msd0JBQXdCLENBQUNrRCxRQUFRLEVBQUVuRCxTQUFTLENBQUM7UUFDMUQ7TUFDRCxDQUFDLE1BQU07UUFDTixPQUFPQSxTQUFTO01BQ2pCO0lBQ0QsQ0FBQztJQUFBLE9BRUR3RCxvQkFBb0IsR0FBcEIsOEJBQXFCOUMsVUFBZSxFQUFFO01BQ3JDLE9BQU8sSUFBSSxDQUFDUixRQUFRLENBQUNRLFVBQVUsQ0FBQztJQUNqQyxDQUFDO0lBQUEsT0FFRCtDLHFCQUFxQixHQUFyQiwrQkFBc0I5RCxXQUFnQixFQUFFO01BQ3ZDLE9BQU8sSUFBSSxDQUFDTCxTQUFTLENBQUNLLFdBQVcsQ0FBQztJQUNuQyxDQUFDO0lBQUEsT0FFRCtELGVBQWUsR0FBZix5QkFBZ0JDLFFBQWEsRUFBRUMsWUFBaUIsRUFBRTtNQUNqRCxJQUFJQSxZQUFZLENBQUM3QyxPQUFPLENBQUUsR0FBRTRDLFFBQVMsS0FBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2pELE9BQU9DLFlBQVksQ0FBQ0MsTUFBTSxDQUFDRixRQUFRLENBQUM3QyxNQUFNLEdBQUcsQ0FBQyxDQUFDO01BQ2hEO01BQ0EsT0FBTzhDLFlBQVk7SUFDcEI7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BRSx1QkFBdUIsR0FBdkIsaUNBQXdCQyxrQkFBdUIsRUFBRTtNQUNoRCxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJLENBQUNOLGVBQWUsQ0FBQ0ssa0JBQWtCLENBQUNFLFNBQVMsRUFBRUYsa0JBQWtCLENBQUNHLEtBQUssRUFBRSxDQUFDO01BQ3pHLElBQUlDLGtCQUFrQixHQUFHLElBQUk7TUFDN0I1RSxNQUFNLENBQUNDLElBQUksQ0FBQyxJQUFJLENBQUNGLFNBQVMsQ0FBQyxDQUFDSSxPQUFPLENBQUVDLFdBQW1CLElBQUs7UUFDNUQsSUFBSSxJQUFJLENBQUNMLFNBQVMsQ0FBQ0ssV0FBVyxDQUFDLENBQUN5RSxFQUFFLEtBQUtKLGtCQUFrQixJQUFJLElBQUksQ0FBQzFFLFNBQVMsQ0FBQ0ssV0FBVyxDQUFDLENBQUMwRSxNQUFNLEtBQUtMLGtCQUFrQixFQUFFO1VBQ3ZIRyxrQkFBa0IsR0FBR3hFLFdBQVc7UUFDakM7TUFDRCxDQUFDLENBQUM7TUFDRixPQUFPLElBQUksQ0FBQzhELHFCQUFxQixDQUFDVSxrQkFBa0IsQ0FBQztJQUN0RCxDQUFDO0lBQUEsT0FFREcsc0JBQXNCLEdBQXRCLGtDQUFzRDtNQUNyRCxPQUFPLElBQUksQ0FBQ0Msb0JBQW9CO0lBQ2pDLENBQUM7SUFBQSxPQUVEQyxzQkFBc0IsR0FBdEIsZ0NBQXVCQyxRQUEwQixFQUFFO01BQ2xELElBQUksQ0FBQ0Ysb0JBQW9CLEdBQUdFLFFBQVE7SUFDckMsQ0FBQztJQUFBLE9BRURDLFVBQVUsR0FBVixvQkFBV3JILFFBQWEsRUFBRXFELFVBQWUsRUFBRWlFLGlCQUFzQixFQUFFQyxnQkFBcUIsRUFBRTtNQUN6RixJQUFJQyxpQkFBaUIsRUFBRUMsYUFBc0I7TUFDN0MsSUFBSXpILFFBQVEsQ0FBQ00sUUFBUSxFQUFFLElBQUlOLFFBQVEsQ0FBQ00sUUFBUSxFQUFFLENBQUNFLFlBQVksSUFBSVIsUUFBUSxDQUFDTSxRQUFRLEVBQUUsQ0FBQ0UsWUFBWSxFQUFFLEVBQUU7UUFDbEdpSCxhQUFhLEdBQUdDLFdBQVcsQ0FBQ0Msd0JBQXdCLENBQUMzSCxRQUFRLENBQUNNLFFBQVEsRUFBRSxDQUFDRSxZQUFZLEVBQUUsQ0FBQztNQUN6RjtNQUNBLElBQUksQ0FBQzhHLGlCQUFpQixFQUFFO1FBQ3ZCO1FBQ0FFLGlCQUFpQixHQUFHbEcsT0FBTyxDQUFDQyxPQUFPLENBQUNxRyxpQkFBaUIsQ0FBQ0MsZUFBZSxDQUFDN0gsUUFBUSxDQUFDLENBQUM7TUFDakYsQ0FBQyxNQUFNO1FBQ053SCxpQkFBaUIsR0FBRyxJQUFJLENBQUNNLGlCQUFpQixDQUFDUixpQkFBaUIsRUFBRWpFLFVBQVUsRUFBRXJELFFBQVEsQ0FBQyxDQUFDK0gsSUFBSSxDQUFFQyxXQUFnQixJQUFLO1VBQzlHLE9BQU8sSUFBSSxDQUFDdkgsT0FBTyxDQUFDd0gsTUFBTSxDQUFDNUUsVUFBVSxFQUFFMkUsV0FBVyxDQUFDO1FBQ3BELENBQUMsQ0FBQztNQUNIO01BQ0EsT0FBT1IsaUJBQWlCLENBQUNPLElBQUksQ0FBRUcsVUFBZSxJQUFLO1FBQ2xELElBQUksQ0FBQ3ZILFlBQVksQ0FBQ3dILFNBQVMsQ0FBQ0QsVUFBVSxFQUFFWCxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUNFLGFBQWEsQ0FBQztNQUN4RixDQUFDLENBQUM7SUFDSDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxPQVFBSyxpQkFBaUIsR0FBakIsMkJBQWtCRSxXQUFnQixFQUFFSSxZQUFvQixFQUFFcEksUUFBaUIsRUFBRTtNQUM1RSxJQUFJcUksa0JBQWtCO01BQ3RCLElBQUk7UUFDSCxNQUFNekQsWUFBWSxHQUFHNUUsUUFBUSxDQUFDc0ksT0FBTyxFQUFFO1FBQ3ZDLE1BQU0vSCxVQUEwQixHQUFHUCxRQUFRLENBQUNNLFFBQVEsRUFBRSxDQUFDRSxZQUFZLEVBQUU7UUFDckUsTUFBTStILGlCQUFpQixHQUFHM0QsWUFBWSxDQUFDNEQsS0FBSyxDQUFDLEdBQUcsQ0FBQztRQUNqRCxNQUFNQyw2QkFBNkIsR0FBR3ZHLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDNkYsV0FBVyxDQUFDLENBQUM5QyxHQUFHLENBQUV3RCxhQUFrQixJQUFLO1VBQzFGLE1BQU1DLDJCQUEyQixHQUFHWCxXQUFXLENBQUNVLGFBQWEsQ0FBQztVQUM5RDtVQUNBLE1BQU1FLGlCQUFpQixHQUFHQyxhQUFhLENBQUNDLGFBQWEsQ0FBQ0gsMkJBQTJCLENBQUM7VUFDbEYsTUFBTUksTUFBTSxHQUFHSCxpQkFBaUIsQ0FBQ0ksS0FBSyxJQUFJLENBQUNKLGlCQUFpQixDQUFDO1VBQzdELE1BQU1LLDBCQUEwQixHQUFHRixNQUFNLENBQUM3RCxHQUFHLENBQUMsVUFBVWdFLFNBQWMsRUFBRTtZQUN2RSxNQUFNQyxjQUFjLEdBQUdELFNBQVMsQ0FBQ0UsSUFBSSxDQUFDWixLQUFLLENBQUMsS0FBSyxDQUFDO1lBQ2xEO1lBQ0EsTUFBTWEsV0FBVyxHQUFHZCxpQkFBaUIsQ0FBQzVELEtBQUssQ0FBQyxDQUFDLEVBQUU0RCxpQkFBaUIsQ0FBQzlFLE1BQU0sR0FBRzBGLGNBQWMsQ0FBQzFGLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDcEc0RixXQUFXLENBQUNuRixJQUFJLENBQUNpRixjQUFjLENBQUNBLGNBQWMsQ0FBQzFGLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUUzRCxNQUFNNkYsYUFBYSxHQUFHRCxXQUFXLENBQUNFLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDM0MsTUFBTUMsWUFBWSxHQUFJakosVUFBVSxDQUFTa0osY0FBYyxDQUFDSCxhQUFhLENBQUM7WUFDdEUsT0FBT3RKLFFBQVEsQ0FBQzBKLGVBQWUsQ0FBQ0osYUFBYSxDQUFDLENBQUN2QixJQUFJLENBQUMsVUFBVTRCLE1BQVcsRUFBRTtjQUMxRSxNQUFNQyxhQUFhLEdBQUdKLFlBQVksQ0FBQ0ssU0FBUyxFQUFFO2NBQzlDLE1BQU1DLFFBQVEsR0FBR0YsYUFBYSxDQUFDRyxLQUFLO2NBQ3BDLE9BQU9DLFVBQVUsQ0FBQ0MsYUFBYSxDQUFDTixNQUFNLEVBQUVHLFFBQVEsQ0FBQztZQUNsRCxDQUFDLENBQUM7VUFDSCxDQUFDLENBQUM7VUFFRixPQUFPeEksT0FBTyxDQUFDNEksR0FBRyxDQUFDakIsMEJBQTBCLENBQUMsQ0FBQ2xCLElBQUksQ0FBRW9DLG1CQUF3QixJQUFLO1lBQ2pGLE1BQU1DLEtBQUssR0FBR3hCLGlCQUFpQixDQUFDeUIsU0FBUyxHQUN0Q3pCLGlCQUFpQixDQUFDeUIsU0FBUyxDQUFDQyxLQUFLLENBQUMsSUFBSSxFQUFFSCxtQkFBbUIsQ0FBQyxHQUM1REEsbUJBQW1CLENBQUNaLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDL0IsT0FBTztjQUFFZ0IsR0FBRyxFQUFFN0IsYUFBYTtjQUFFMEIsS0FBSyxFQUFFQTtZQUFNLENBQUM7VUFDNUMsQ0FBQyxDQUFDO1FBQ0gsQ0FBQyxDQUFDO1FBRUYvQixrQkFBa0IsR0FBRy9HLE9BQU8sQ0FBQzRJLEdBQUcsQ0FBQ3pCLDZCQUE2QixDQUFDLENBQUNWLElBQUksQ0FBQyxVQUNwRXlDLHNCQUFrRCxFQUNqRDtVQUNELE1BQU1DLFdBQWdCLEdBQUcsQ0FBQyxDQUFDO1VBQzNCRCxzQkFBc0IsQ0FBQ25JLE9BQU8sQ0FBQyxVQUFVcUksa0JBQTRDLEVBQUU7WUFDdEZELFdBQVcsQ0FBQ0Msa0JBQWtCLENBQUNILEdBQUcsQ0FBQyxHQUFHRyxrQkFBa0IsQ0FBQ04sS0FBSztVQUMvRCxDQUFDLENBQUM7VUFDRixPQUFPSyxXQUFXO1FBQ25CLENBQUMsQ0FBQztNQUNILENBQUMsQ0FBQyxPQUFPRSxNQUFNLEVBQUU7UUFDaEJoSCxHQUFHLENBQUNpSCxLQUFLLENBQUUsOERBQTZEeEMsWUFBYSxFQUFDLENBQUM7UUFDdkZDLGtCQUFrQixHQUFHL0csT0FBTyxDQUFDQyxPQUFPLENBQUNtQixTQUFTLENBQUM7TUFDaEQ7TUFDQSxPQUFPMkYsa0JBQWtCO0lBQzFCLENBQUM7SUFBQSxPQUVEd0MscUJBQXFCLEdBQXJCLCtCQUFzQjdDLFdBQWdCLEVBQUU7TUFDdkMsSUFBSSxDQUFDbkgsYUFBYSxDQUFDYyxTQUFTLENBQUMsY0FBYyxFQUFFcUcsV0FBVyxDQUFDO01BQ3pELElBQUksQ0FBQ25ILGFBQWEsQ0FBQ2MsU0FBUyxDQUFDLG1CQUFtQixFQUFFcUcsV0FBVyxDQUFDO01BRTlEOEMsU0FBUyxDQUFDQyx1QkFBdUIsRUFBRSxDQUFDLENBQUM7SUFDdEM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BcEJDO0lBQUEsT0FxQkFDLGlCQUFpQixHQUFqQiwyQkFDQ2hMLFFBQW9DLEVBQ3BDZ0ksV0FpQlksRUFDWmlELFNBQTBCLEVBQzFCQyxrQkFBbUMsRUFDaEI7TUFDbkIsSUFBSTlDLFlBQW9CLEdBQUcsRUFBRTtRQUM1QitDLHVCQUF1QjtRQUN2QjFELGFBQXNCLEdBQUcsS0FBSztNQUUvQixJQUFJekgsUUFBUSxDQUFDTSxRQUFRLEVBQUUsSUFBSU4sUUFBUSxDQUFDTSxRQUFRLEVBQUUsQ0FBQ0UsWUFBWSxFQUFFO1FBQzVEaUgsYUFBYSxHQUFHQyxXQUFXLENBQUNDLHdCQUF3QixDQUFDM0gsUUFBUSxDQUFDTSxRQUFRLEVBQUUsQ0FBQ0UsWUFBWSxFQUFFLENBQUM7TUFDekY7TUFDQTtNQUNBLElBQUl3SCxXQUFXLElBQUlBLFdBQVcsQ0FBQ29ELFVBQVUsSUFBSUgsU0FBUyxJQUFJQSxTQUFTLENBQUN6RixVQUFVLEVBQUU7UUFDL0UsTUFBTTZGLFlBQVksR0FBR0osU0FBUyxDQUFDekYsVUFBVSxDQUFDd0MsV0FBVyxDQUFDb0QsVUFBVSxDQUFDLENBQUN6RixNQUFNO1FBQ3hFeUMsWUFBWSxHQUFHaUQsWUFBWSxDQUFDekYsS0FBSztRQUVqQyxJQUFJeUYsWUFBWSxDQUFDQyxVQUFVLElBQUl0TCxRQUFRLENBQUN1TCxHQUFHLENBQVUsK0JBQStCLENBQUMsRUFBRTtVQUN0RkosdUJBQXVCLEdBQUcsSUFBSSxDQUFDckQsaUJBQWlCLENBQUN1RCxZQUFZLENBQUNDLFVBQVUsRUFBRWxELFlBQVksRUFBRXBJLFFBQVEsQ0FBQztRQUNsRztNQUNEO01BRUEsSUFBSXdMLFdBQVcsR0FBRyxJQUFJLENBQUNDLG1CQUFtQixDQUFDekwsUUFBUSxFQUFFZ0ksV0FBVyxDQUFDO01BQ2pFO01BQ0E7TUFDQSxJQUFJd0QsV0FBVyxDQUFDL0gsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUNpSSx5QkFBeUIsRUFBRTtRQUMvRCxJQUFJLENBQUMvSyxZQUFZLENBQUNnTCxXQUFXLEVBQUU7UUFDL0IsT0FBT3JLLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztNQUM3Qjs7TUFFQTtNQUNBLElBQUl5RyxXQUFXLGFBQVhBLFdBQVcsZUFBWEEsV0FBVyxDQUFFNEQsWUFBWSxJQUFJNUQsV0FBVyxhQUFYQSxXQUFXLGVBQVhBLFdBQVcsQ0FBRTZELGdCQUFnQixFQUFFO1FBQy9ETCxXQUFXLElBQUksT0FBTztNQUN2Qjs7TUFFQTtNQUNBLE1BQU1NLE9BQU8sR0FBRyxJQUFJLENBQUNDLGdCQUFnQixDQUFDUCxXQUFXLEVBQUV4RCxXQUFXLENBQUM7TUFDL0QsSUFBSThELE9BQU8sRUFBRTtRQUNaTixXQUFXLElBQUssV0FBVU0sT0FBUSxFQUFDO01BQ3BDOztNQUVBO01BQ0EsTUFBTUUsZUFBc0MsR0FBRztRQUM5Q0MsYUFBYSxFQUFFakUsV0FBVyxhQUFYQSxXQUFXLHVCQUFYQSxXQUFXLENBQUU0RCxZQUFZO1FBQ3hDQyxnQkFBZ0IsRUFBRTdELFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFNkQsZ0JBQWdCO1FBQy9DSyxlQUFlLEVBQUVsRSxXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRW1FLFFBQVE7UUFDdENDLGdCQUFnQixFQUFFcEUsV0FBVyxhQUFYQSxXQUFXLHVCQUFYQSxXQUFXLENBQUVvRSxnQkFBZ0I7UUFDL0NDLGdCQUFnQixFQUFFckUsV0FBVyxhQUFYQSxXQUFXLHVCQUFYQSxXQUFXLENBQUVxRSxnQkFBZ0I7UUFDL0NDLGdCQUFnQixFQUFFLENBQUF0RSxXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRXVFLGVBQWUsTUFBSzdKLFNBQVMsR0FBR3NGLFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFdUUsZUFBZSxHQUFHLElBQUk7UUFDbEdDLE1BQU0sRUFBRXhFLFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFd0U7TUFDdEIsQ0FBQztNQUVELElBQUksQ0FBQXhFLFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFeUUsY0FBYyxNQUFLLENBQUMsQ0FBQyxJQUFJLENBQUF6RSxXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRTBFLGdCQUFnQixNQUFLLElBQUksRUFBRTtRQUNqRixJQUFJMU0sUUFBUSxDQUFDdUwsR0FBRyxDQUFVLCtCQUErQixDQUFDLEVBQUU7VUFDM0RTLGVBQWUsQ0FBQ1csVUFBVSxHQUFHM00sUUFBUTtRQUN0QyxDQUFDLE1BQU07VUFDTmdNLGVBQWUsQ0FBQ1ksb0JBQW9CLEdBQUc1TSxRQUFRO1FBQ2hEO01BQ0Q7TUFFQSxJQUFJZ0ksV0FBVyxhQUFYQSxXQUFXLGVBQVhBLFdBQVcsQ0FBRTZFLGlCQUFpQixFQUFFO1FBQ25DO1FBQ0EsTUFBTUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDbk0sWUFBWSxDQUFDb00sT0FBTyxFQUFFLENBQUNoSCxPQUFPLENBQUMsaUNBQWlDLEVBQUUsRUFBRSxDQUFDO1FBQ3pHLElBQUl5RixXQUFXLEtBQUtzQixzQkFBc0IsRUFBRTtVQUMzQztVQUNBLE1BQU1FLGdCQUFxQixHQUFHLElBQUksQ0FBQ3ZNLE9BQU8sQ0FBQ3dNLGtCQUFrQixDQUFDLElBQUksQ0FBQ3RNLFlBQVksQ0FBQ29NLE9BQU8sRUFBRSxDQUFDO1VBQzFGLElBQUlDLGdCQUFnQixFQUFFO1lBQ3JCQSxnQkFBZ0IsQ0FBQ0UsY0FBYyxHQUFHbEIsZUFBZTtZQUNqRGdCLGdCQUFnQixDQUFDRyxnQkFBZ0IsR0FBRyxJQUFJLENBQUNoSCxvQkFBb0IsQ0FBQyxJQUFJLENBQUNpSCxpQkFBaUIsQ0FBQztZQUNyRkosZ0JBQWdCLENBQUNLLFlBQVksR0FBRyxJQUFJLENBQUNDLG9CQUFvQjtZQUN6RE4sZ0JBQWdCLENBQUNPLEtBQUssR0FBRyxJQUFJLENBQUNDLGFBQWE7VUFDNUM7VUFFQSxJQUFJLENBQUM3TSxZQUFZLENBQUM4TSxjQUFjLENBQUMsQ0FBQyxDQUFDekYsV0FBVyxDQUFDMEYsV0FBVyxDQUFDO1VBRTNELElBQUksQ0FBQzdDLHFCQUFxQixDQUFDbUMsZ0JBQWdCLENBQUM7VUFFNUMsT0FBTzFMLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztRQUM3QjtNQUNEO01BRUEsSUFBSXlHLFdBQVcsYUFBWEEsV0FBVyxlQUFYQSxXQUFXLENBQUUyRixTQUFTLElBQUkzRixXQUFXLENBQUNtRSxRQUFRLElBQUksSUFBSSxJQUFJWCxXQUFXLENBQUM5SCxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDbEcsSUFBSThILFdBQVcsQ0FBQzlILE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtVQUNsQzhILFdBQVcsSUFBSSxrQkFBa0I7UUFDbEMsQ0FBQyxNQUFNO1VBQ05BLFdBQVcsSUFBSSxrQkFBa0I7UUFDbEM7TUFDRDs7TUFFQTtNQUNBO01BQ0EsSUFBSU4sa0JBQWtCLElBQUlBLGtCQUFrQixDQUFDNUgsSUFBSSxLQUFLLDZCQUE2QixFQUFFO1FBQ3BGLE1BQU1zSyxVQUFVLEdBQUcsSUFBSSxDQUFDbk4sT0FBTyxDQUFDd00sa0JBQWtCLENBQUN6QixXQUFXLENBQUM7UUFDL0QsSUFBSW9DLFVBQVUsRUFBRTtVQUNmLE1BQU1DLE1BQU0sR0FBRyxJQUFJLENBQUMxSCxvQkFBb0IsQ0FBQ3lILFVBQVUsQ0FBQ3RLLElBQUksQ0FBQztVQUN6RCxJQUFJdUssTUFBTSxJQUFJQSxNQUFNLENBQUN6TCxPQUFPLElBQUl5TCxNQUFNLENBQUN6TCxPQUFPLENBQUNxQixNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzFELE1BQU1xSyxlQUFlLEdBQUdELE1BQU0sQ0FBQ3pMLE9BQU8sQ0FBQ3lMLE1BQU0sQ0FBQ3pMLE9BQU8sQ0FBQ3FCLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDakUsTUFBTXNLLE9BQU8sR0FBRyxJQUFJLENBQUMzSCxxQkFBcUIsQ0FBQzBILGVBQWUsQ0FBQztZQUMzRCxJQUFJQyxPQUFPLElBQUlBLE9BQU8sQ0FBQ3pLLElBQUksS0FBSyw2QkFBNkIsRUFBRTtjQUM5RDBLLGVBQWUsQ0FBQ0MsK0JBQStCLEVBQUU7WUFDbEQ7VUFDRDtRQUNEO01BQ0Q7O01BRUE7TUFDQSxJQUFJLENBQUNuTyxtQkFBbUIsQ0FBQ29FLElBQUksQ0FBQzhILGVBQWUsQ0FBQztNQUU5QyxJQUFJNUQsWUFBWSxJQUFJK0MsdUJBQXVCLEVBQUU7UUFDNUMsT0FBT0EsdUJBQXVCLENBQUNwRCxJQUFJLENBQUVtRyxnQkFBcUIsSUFBSztVQUM5REEsZ0JBQWdCLENBQUN6RyxhQUFhLEdBQUdBLGFBQWE7VUFDOUMsSUFBSSxDQUFDaEgsT0FBTyxDQUFDME4sS0FBSyxDQUFDL0YsWUFBWSxFQUFFOEYsZ0JBQWdCLENBQUM7VUFDbEQsT0FBTzVNLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztRQUM3QixDQUFDLENBQUM7TUFDSDtNQUNBLE9BQU8sSUFBSSxDQUFDWixZQUFZLENBQ3RCd0gsU0FBUyxDQUFDcUQsV0FBVyxFQUFFLEtBQUssRUFBRXhELFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFb0csbUJBQW1CLEVBQUVwRyxXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRTBGLFdBQVcsRUFBRSxDQUFDakcsYUFBYSxDQUFDLENBQ3pHTSxJQUFJLENBQUVzRyxVQUFlLElBQUs7UUFDMUIsSUFBSSxDQUFDQSxVQUFVLEVBQUU7VUFDaEI7VUFDQSxJQUFJLENBQUN2TyxtQkFBbUIsQ0FBQ3dPLEdBQUcsRUFBRTtRQUMvQjtRQUNBLE9BQU9ELFVBQVU7TUFDbEIsQ0FBQyxDQUFDO0lBQ0o7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FaQztJQUFBLE9BYUFFLGVBQWUsR0FBZix5QkFBZ0JDLGdCQUF3QixFQUFFTixnQkFBc0IsRUFBRTtNQUNqRSxNQUFNaEcsVUFBVSxHQUFHLElBQUksQ0FBQ3pILE9BQU8sQ0FBQ3dILE1BQU0sQ0FBQ3VHLGdCQUFnQixFQUFFTixnQkFBZ0IsQ0FBQztNQUMxRSxPQUFPLElBQUksQ0FBQ3ZOLFlBQVksQ0FBQ3dILFNBQVMsQ0FBQ0QsVUFBVSxFQUFFeEYsU0FBUyxFQUFFQSxTQUFTLEVBQUVBLFNBQVMsRUFBRSxDQUFDd0wsZ0JBQWdCLENBQUN6RyxhQUFhLENBQUM7SUFDakg7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BZ0gsd0JBQXdCLEdBQXhCLGtDQUF5QnpPLFFBQWEsRUFBRTtNQUN2QyxNQUFNME8sS0FBSyxHQUFHMU8sUUFBUSxDQUFDc0ksT0FBTyxFQUFFOztNQUVoQztNQUNBO01BQ0EsSUFBSSxJQUFJLENBQUMzSCxZQUFZLENBQUM4Tix3QkFBd0IsQ0FBQ0MsS0FBSyxDQUFDLEVBQUU7UUFDdEQsT0FBTyxJQUFJO01BQ1osQ0FBQyxNQUFNLElBQUksb0JBQW9CLENBQUNDLElBQUksQ0FBQ0QsS0FBSyxDQUFDLEVBQUU7UUFDNUM7UUFDQTtRQUNBLElBQUlFLGFBQWE7UUFDakIsSUFBSSxJQUFJLENBQUMxSCxvQkFBb0IsSUFBSSxJQUFJLENBQUNBLG9CQUFvQixDQUFDMkgsYUFBYSxLQUFLSCxLQUFLLEVBQUU7VUFDbkY7VUFDQUUsYUFBYSxHQUFHLElBQUksQ0FBQzFILG9CQUFvQixDQUFDNEgsWUFBWTtRQUN2RCxDQUFDLE1BQU07VUFDTkYsYUFBYSxHQUFHaEgsaUJBQWlCLENBQUNDLGVBQWUsQ0FBQzdILFFBQVEsQ0FBQztRQUM1RDtRQUVBLE9BQU80TyxhQUFhLElBQUlGLEtBQUssR0FBRyxJQUFJLENBQUMvTixZQUFZLENBQUM4Tix3QkFBd0IsQ0FBQ0csYUFBYSxDQUFDLEdBQUcsS0FBSztNQUNsRyxDQUFDLE1BQU07UUFDTixPQUFPLEtBQUs7TUFDYjtJQUNELENBQUM7SUFBQSxPQUVERyxtQkFBbUIsR0FBbkIsNkJBQW9CTCxLQUFVLEVBQVU7TUFDdkMsTUFBTTFJLEtBQUssR0FBRyxJQUFJQyxNQUFNLENBQUMsU0FBUyxDQUFDO01BQ25DeUksS0FBSyxHQUFHQSxLQUFLLENBQUMzSSxPQUFPLENBQUNDLEtBQUssRUFBRSxFQUFFLENBQUM7TUFDaEMsSUFBSSxJQUFJLENBQUN2RixPQUFPLENBQUN5RixLQUFLLENBQUN3SSxLQUFLLENBQUMsSUFBSUEsS0FBSyxLQUFLLEVBQUUsRUFBRTtRQUM5QyxPQUFPQSxLQUFLO01BQ2IsQ0FBQyxNQUFNO1FBQ04sT0FBTyxJQUFJLENBQUNLLG1CQUFtQixDQUFDTCxLQUFLLENBQUM7TUFDdkM7SUFDRCxDQUFDO0lBQUEsT0FFRE0sbUNBQW1DLEdBQW5DLDZDQUFvQ2hQLFFBQWlCLEVBQUU7TUFDdEQsTUFBTTBPLEtBQUssR0FBRzFPLFFBQVEsQ0FBQ3NJLE9BQU8sRUFBRTs7TUFFaEM7TUFDQSxJQUFJLENBQUMsb0JBQW9CLENBQUNxRyxJQUFJLENBQUNELEtBQUssQ0FBQyxFQUFFO1FBQ3RDLE9BQU8sS0FBSztNQUNiOztNQUVBO01BQ0EsTUFBTW5PLFVBQVUsR0FBR1AsUUFBUSxDQUFDTSxRQUFRLEVBQUUsQ0FBQ0UsWUFBWSxFQUFFO01BQ3JELE1BQU15TyxjQUFjLEdBQUcxTyxVQUFVLENBQUNrSixjQUFjLENBQUN6SixRQUFRLENBQUNzSSxPQUFPLEVBQUUsQ0FBQyxDQUFDdUIsU0FBUyxDQUFDLGFBQWEsQ0FBVztNQUN2RyxJQUFJLENBQUNqQyxpQkFBaUIsQ0FBQ3NILGVBQWUsQ0FBQzNPLFVBQVUsRUFBRTBPLGNBQWMsQ0FBQyxFQUFFO1FBQ25FLE9BQU8sS0FBSztNQUNiOztNQUVBO01BQ0EsT0FBT3ZILFdBQVcsQ0FBQ3lILGdCQUFnQixDQUFDNU8sVUFBVSxFQUFFbU8sS0FBSyxDQUFDO0lBQ3ZELENBQUM7SUFBQSxPQUVEakQsbUJBQW1CLEdBQW5CLDZCQUFvQnpMLFFBQWEsRUFBRWdJLFdBQWdCLEVBQUU7TUFDcEQsSUFBSTBHLEtBQUs7TUFFVCxJQUFJMU8sUUFBUSxDQUFDdUwsR0FBRyxDQUFDLHdDQUF3QyxDQUFDLElBQUl2TCxRQUFRLENBQUNvUCxVQUFVLEVBQUUsRUFBRTtRQUNwRlYsS0FBSyxHQUFHMU8sUUFBUSxDQUFDcVAsZ0JBQWdCLEVBQUUsQ0FBQy9HLE9BQU8sRUFBRTtNQUM5QyxDQUFDLE1BQU07UUFDTm9HLEtBQUssR0FBRzFPLFFBQVEsQ0FBQ3NJLE9BQU8sRUFBRTtNQUMzQjtNQUVBLElBQUlOLFdBQVcsQ0FBQ3lFLGNBQWMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUN0QztRQUNBaUMsS0FBSyxHQUFHLElBQUksQ0FBQ0ssbUJBQW1CLENBQUNMLEtBQUssQ0FBQzs7UUFFdkM7UUFDQSxJQUFJLElBQUksQ0FBQ3hILG9CQUFvQixJQUFJLElBQUksQ0FBQ0Esb0JBQW9CLENBQUMySCxhQUFhLEtBQUtILEtBQUssRUFBRTtVQUNuRkEsS0FBSyxHQUFHLElBQUksQ0FBQ3hILG9CQUFvQixDQUFDNEgsWUFBWTtRQUMvQztNQUNELENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQ0UsbUNBQW1DLENBQUNoUCxRQUFRLENBQUMsRUFBRTtRQUM5RDtRQUNBLE1BQU00TyxhQUFhLEdBQUdoSCxpQkFBaUIsQ0FBQ0MsZUFBZSxDQUFDN0gsUUFBUSxFQUFFLElBQUksQ0FBQztRQUV2RSxJQUFJLENBQUM0TyxhQUFhLEVBQUU7VUFDbkI7VUFDQTtVQUNBO1VBQ0EsSUFBSSxDQUFDekgsc0JBQXNCLENBQUN6RSxTQUFTLENBQUM7UUFDdkMsQ0FBQyxNQUFNLElBQUlrTSxhQUFhLEtBQUtGLEtBQUssRUFBRTtVQUNuQztVQUNBO1VBQ0EsSUFBSSxDQUFDdkgsc0JBQXNCLENBQUM7WUFBRTBILGFBQWEsRUFBRUgsS0FBSztZQUFFSSxZQUFZLEVBQUVGO1VBQWMsQ0FBQyxDQUFDO1VBQ2xGRixLQUFLLEdBQUdFLGFBQWE7UUFDdEI7TUFDRDs7TUFFQTtNQUNBLElBQUlGLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUU7UUFDckJBLEtBQUssR0FBR0EsS0FBSyxDQUFDWSxTQUFTLENBQUMsQ0FBQyxDQUFDO01BQzNCO01BRUEsT0FBT1osS0FBSztJQUNiLENBQUM7SUFBQSxPQUVEM0MsZ0JBQWdCLEdBQWhCLDBCQUFpQjJDLEtBQVUsRUFBRTFHLFdBQWdCLEVBQUU7TUFDOUMsSUFBSTdELFFBQVEsR0FBRzZELFdBQVcsQ0FBQzdELFFBQVE7TUFDbkMsSUFBSTZELFdBQVcsQ0FBQ3lFLGNBQWMsRUFBRTtRQUMvQnRJLFFBQVEsSUFBSTZELFdBQVcsQ0FBQ3lFLGNBQWM7UUFDdEMsSUFBSXRJLFFBQVEsR0FBRyxDQUFDLEVBQUU7VUFDakJBLFFBQVEsR0FBRyxDQUFDO1FBQ2I7TUFDRDs7TUFFQTtNQUNBO01BQ0EsSUFBSTZELFdBQVcsQ0FBQ3lFLGNBQWMsR0FBRyxDQUFDLElBQUksQ0FBQ3pFLFdBQVcsQ0FBQzhELE9BQU8sRUFBRTtRQUMzRDlELFdBQVcsQ0FBQzhELE9BQU8sR0FBRyxJQUFJLENBQUNuTCxZQUFZLENBQUM0TyxpQkFBaUIsQ0FBQ2IsS0FBSyxDQUFDO01BQ2pFO01BRUEsT0FBUSxJQUFJLENBQUN2TyxhQUFhLENBQUNxUCxxQkFBcUIsRUFBRSxDQUFTQyxlQUFlLENBQ3pFdEwsUUFBUSxFQUNSdUssS0FBSyxFQUNMMUcsV0FBVyxDQUFDOEQsT0FBTyxFQUNuQjlELFdBQVcsQ0FBQzBILGlCQUFpQixDQUM3QjtJQUNGOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS0FDLG1CQUFtQixHQUFuQiw4QkFBb0I7SUFBQSxFQUFtQjtNQUN0QyxNQUFNQyxtQkFBbUIsR0FBRyxJQUFJQyxXQUFXLEVBQUUsQ0FBQ0Msb0JBQW9CLEVBQUU7TUFDcEUsSUFBSSxDQUFDRixtQkFBbUIsRUFBRTtRQUN6QixNQUFNRyxTQUFTLEdBQUcsSUFBSSxDQUFDNVAsYUFBYSxDQUFDNlAsY0FBYyxFQUFFO1FBQ3JEQyxVQUFVLENBQUNDLElBQUksQ0FBQ0gsU0FBUyxDQUFDO01BQzNCO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BSSxlQUFlLEdBQWYseUJBQWdCQyxNQUFhLEVBQUU7TUFDOUIsTUFBTUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDbFEsYUFBYSxDQUFDbVEsa0JBQWtCLEVBQUU7UUFDL0RQLFNBQVMsR0FBRyxJQUFJLENBQUM1UCxhQUFhLENBQUM2UCxjQUFjLEVBQUU7TUFDaEQsTUFBTUosbUJBQW1CLEdBQUcsSUFBSUMsV0FBVyxFQUFFLENBQUNDLG9CQUFvQixFQUFFO01BQ3BFLElBQUlHLFVBQVUsQ0FBQ00sUUFBUSxDQUFDUixTQUFTLENBQUMsSUFBSSxDQUFDSCxtQkFBbUIsRUFBRTtRQUMzREssVUFBVSxDQUFDTyxNQUFNLENBQUNULFNBQVMsQ0FBQztNQUM3QjtNQUNBLE1BQU0vSCxXQUFnQixHQUFHb0ksTUFBTSxDQUFDSyxhQUFhLEVBQUU7TUFDL0MsSUFBSSxJQUFJLENBQUMzUSxtQkFBbUIsQ0FBQzJELE1BQU0sRUFBRTtRQUNwQ3VFLFdBQVcsQ0FBQ2tGLGNBQWMsR0FBRyxJQUFJLENBQUNwTixtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDQSxtQkFBbUIsR0FBRyxJQUFJLENBQUNBLG1CQUFtQixDQUFDNkUsS0FBSyxDQUFDLENBQUMsQ0FBQztNQUM3RCxDQUFDLE1BQU07UUFDTnFELFdBQVcsQ0FBQ2tGLGNBQWMsR0FBRyxDQUFDLENBQUM7TUFDaEM7TUFDQSxJQUFJbUQsZ0JBQWdCLENBQUNLLHlCQUF5QixFQUFFLEVBQUU7UUFDakQxSSxXQUFXLENBQUNrRixjQUFjLENBQUNWLE1BQU0sR0FBR21FLGdCQUFnQixDQUFDQyxlQUFlO1FBQ3BFUCxnQkFBZ0IsQ0FBQ1EsdUJBQXVCLEVBQUU7TUFDM0M7TUFFQSxJQUFJLENBQUN6RCxpQkFBaUIsR0FBR2dELE1BQU0sQ0FBQ1UsWUFBWSxDQUFDLE1BQU0sQ0FBQztNQUNwRCxJQUFJLENBQUN4RCxvQkFBb0IsR0FBR3RGLFdBQVcsQ0FBQ2pHLE1BQU0sQ0FBQ3lCLE9BQU87TUFDdEQsSUFBSSxDQUFDZ0ssYUFBYSxHQUFHNEMsTUFBTSxDQUFDVSxZQUFZLENBQUMsT0FBTyxDQUFDO01BRWpEOUksV0FBVyxDQUFDbUYsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDaEgsb0JBQW9CLENBQUMsSUFBSSxDQUFDaUgsaUJBQWlCLENBQUM7TUFDaEZwRixXQUFXLENBQUNxRixZQUFZLEdBQUcsSUFBSSxDQUFDQyxvQkFBb0I7TUFFcEQsSUFBSSxDQUFDekMscUJBQXFCLENBQUM3QyxXQUFXLENBQUM7O01BRXZDO01BQ0E7TUFDQSxJQUFJLENBQUMrSSxPQUFPLENBQUNDLEtBQUssSUFBSUQsT0FBTyxDQUFDQyxLQUFLLENBQUNDLE9BQU8sS0FBS3ZPLFNBQVMsRUFBRTtRQUMxRCxJQUFJLENBQUMvQixZQUFZLENBQ2Z1USxjQUFjLEVBQUUsQ0FDaEJuSixJQUFJLENBQUMsTUFBTTtVQUNYLElBQUksQ0FBQ3BILFlBQVksQ0FBQ3dRLGlCQUFpQixFQUFFO1FBQ3RDLENBQUMsQ0FBQyxDQUNEQyxLQUFLLENBQUMsVUFBVXpHLE1BQVcsRUFBRTtVQUM3QmhILEdBQUcsQ0FBQ2lILEtBQUssQ0FBQywrQkFBK0IsRUFBRUQsTUFBTSxDQUFDO1FBQ25ELENBQUMsQ0FBQztNQUNKLENBQUMsTUFBTTtRQUNOLElBQUksQ0FBQ2hLLFlBQVksQ0FBQ3dRLGlCQUFpQixFQUFFO01BQ3RDO0lBQ0QsQ0FBQztJQUFBLE9BRURFLGtCQUFrQixHQUFsQiw0QkFBbUJDLEtBQVUsRUFBRUMsVUFBZ0IsRUFBRUMsU0FBZSxFQUFFO01BQ2pFLElBQUksQ0FBQzNRLGFBQWEsQ0FBQzRRLFdBQVcsQ0FBQyxjQUFjLEVBQUVILEtBQUssRUFBRUMsVUFBVSxFQUFFQyxTQUFTLENBQUM7SUFDN0UsQ0FBQztJQUFBLE9BRUQvUCxrQkFBa0IsR0FBbEIsNEJBQW1COFAsVUFBZSxFQUFFQyxTQUFlLEVBQUU7TUFDcEQsSUFBSSxDQUFDM1EsYUFBYSxDQUFDNlEsV0FBVyxDQUFDLGNBQWMsRUFBRUgsVUFBVSxFQUFFQyxTQUFTLENBQUM7SUFDdEUsQ0FBQztJQUFBLE9BRURHLHVCQUF1QixHQUF2QixpQ0FBd0JMLEtBQVUsRUFBRUMsVUFBZSxFQUFFQyxTQUFlLEVBQUU7TUFDckUsSUFBSSxDQUFDM1EsYUFBYSxDQUFDNFEsV0FBVyxDQUFDLG1CQUFtQixFQUFFSCxLQUFLLEVBQUVDLFVBQVUsRUFBRUMsU0FBUyxDQUFDO0lBQ2xGLENBQUM7SUFBQSxPQUVESSx1QkFBdUIsR0FBdkIsaUNBQXdCTCxVQUFlLEVBQUVDLFNBQWMsRUFBRTtNQUN4RCxJQUFJLENBQUMzUSxhQUFhLENBQUM2USxXQUFXLENBQUMsbUJBQW1CLEVBQUVILFVBQVUsRUFBRUMsU0FBUyxDQUFDO0lBQzNFLENBQUM7SUFBQSxPQUVESyxnQkFBZ0IsR0FBaEIsMEJBQWlCcFIsT0FBWSxFQUFFTixhQUFrQixFQUFFO01BQ2xELE1BQU0yUixLQUFLLEdBQUdyUixPQUFPLENBQUNzUixjQUFjLEVBQUUsQ0FBQ0MsSUFBSTtNQUMzQyxNQUFNcEUsVUFBVSxHQUFHbk4sT0FBTyxDQUFDd00sa0JBQWtCLENBQUM2RSxLQUFLLENBQUM7TUFDcEQsT0FBTzNSLGFBQWEsQ0FDbEI4UixXQUFXLEVBQUUsQ0FDYmxSLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQzNDbVIsTUFBTSxDQUFDLFVBQVVyRSxNQUFXLEVBQUU7UUFDOUIsT0FBT0EsTUFBTSxDQUFDdkssSUFBSSxLQUFLc0ssVUFBVSxDQUFDdEssSUFBSTtNQUN2QyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQUEsT0FFRDZPLG1CQUFtQixHQUFuQiw2QkFBb0J0RSxNQUFXLEVBQUU7TUFDaEMsTUFBTUUsT0FBTyxHQUFHRixNQUFNLENBQUN6SyxNQUFNO01BQzdCLElBQUksT0FBTzJLLE9BQU8sS0FBSyxRQUFRLEVBQUU7UUFDaEMsT0FBTyxDQUFDLElBQUksQ0FBQzlMLFNBQVMsQ0FBQzhMLE9BQU8sQ0FBQyxDQUFDO01BQ2pDLENBQUMsTUFBTTtRQUNOLE1BQU1xRSxPQUFjLEdBQUcsRUFBRTtRQUN6QnJFLE9BQU8sQ0FBQzFMLE9BQU8sQ0FBRWdRLE9BQVksSUFBSztVQUNqQ0QsT0FBTyxDQUFDbE8sSUFBSSxDQUFDLElBQUksQ0FBQ2pDLFNBQVMsQ0FBQ29RLE9BQU8sQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQztRQUNGLE9BQU9ELE9BQU87TUFDZjtJQUNELENBQUM7SUFBQSxPQUVLRSxpQkFBaUIsR0FBdkIsbUNBQTBCO01BQ3pCO01BQ0EsTUFBTUMsbUJBQW1CLENBQUNDLG9CQUFvQixFQUFFO01BQ2hELElBQUksQ0FBQzlRLGlCQUFpQixHQUFHLElBQUksQ0FBQ3lPLGVBQWUsQ0FBQ3NDLElBQUksQ0FBQyxJQUFJLENBQUM7TUFDeEQsSUFBSSxDQUFDaFMsT0FBTyxDQUFDNFEsa0JBQWtCLENBQUMsSUFBSSxDQUFDM1AsaUJBQWlCLEVBQUUsSUFBSSxDQUFDO01BQzdELE1BQU1rTyxtQkFBbUIsR0FBRyxJQUFJQyxXQUFXLEVBQUUsQ0FBQ0Msb0JBQW9CLEVBQUU7TUFDcEUsSUFBSSxDQUFDRixtQkFBbUIsRUFBRTtRQUN6QixJQUFJLENBQUNuUCxPQUFPLENBQUNpUyx3QkFBd0IsQ0FBQyxJQUFJLENBQUMvQyxtQkFBbUIsQ0FBQzhDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUMzRTtNQUNBO01BQ0EsSUFBSSxDQUFDM1MsbUJBQW1CLEdBQUcsRUFBRTtNQUM3QmdMLFNBQVMsQ0FBQzZILGNBQWMsRUFBRTtNQUMxQixJQUFJLENBQUNqSCx5QkFBeUIsR0FBRyxDQUFDLElBQUksQ0FBQ2pMLE9BQU8sQ0FBQ3lGLEtBQUssQ0FBQyxFQUFFLENBQUM7TUFFeEQsTUFBTTBNLFlBQVksR0FBRyxJQUFJLENBQUNuUyxPQUFPLENBQUNzUixjQUFjLEVBQUUsQ0FBQ2hGLE9BQU8sRUFBRSxDQUFDckosT0FBTyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO01BQzdGLElBQUk7UUFDSCxNQUFNbVAsa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMxUyxhQUFhLENBQUMyUyxvQkFBb0IsRUFBRTtRQUMxRSxNQUFNQyxxQkFBcUIsR0FBR0Ysa0JBQWtCLEtBQUtuUSxTQUFTLElBQUlSLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDMFEsa0JBQWtCLENBQUMsQ0FBQ3BQLE1BQU0sS0FBSyxDQUFDO1FBQzlHLE1BQU1xTyxLQUFLLEdBQUcsSUFBSSxDQUFDclIsT0FBTyxDQUFDc1IsY0FBYyxFQUFFLENBQUNoRixPQUFPLEVBQUU7UUFDckQ7UUFDQSxJQUFJLENBQUM2RixZQUFZLElBQUlHLHFCQUFxQixJQUFJLENBQUNqQixLQUFLLEVBQUU7VUFDckQsSUFBSWUsa0JBQWtCLENBQUNHLGFBQWEsSUFBSUgsa0JBQWtCLENBQUNHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQ0MsV0FBVyxFQUFFLENBQUN2UCxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDbkg7WUFDQTtZQUNBO1lBQ0EsTUFBTSxJQUFJLENBQUN3UCxvQkFBb0IsQ0FBQ0wsa0JBQWtCLENBQUM7VUFDcEQsQ0FBQyxNQUFNO1lBQ047WUFDQSxNQUFNLElBQUksQ0FBQ00sc0JBQXNCLENBQUNOLGtCQUFrQixDQUFDO1VBQ3REO1FBQ0Q7TUFDRCxDQUFDLENBQUMsT0FBT2xJLE1BQWUsRUFBRTtRQUN6QmhILEdBQUcsQ0FBQ2lILEtBQUssQ0FBQyxxQ0FBcUMsRUFBRUQsTUFBTSxDQUFXO01BQ25FO0lBQ0QsQ0FBQztJQUFBLE9BRUR5SSxvQkFBb0IsR0FBcEIsOEJBQXFCUCxrQkFBd0IsRUFBRTtNQUM5QyxPQUFPUSxnQkFBZ0IsQ0FBQ0Qsb0JBQW9CLENBQUNQLGtCQUFrQixFQUFFLElBQUksQ0FBQ1MsY0FBYyxFQUFFLEVBQUUsSUFBSSxDQUFDN1MsT0FBTyxDQUFDO0lBQ3RHLENBQUM7SUFBQSxPQUVEeVMsb0JBQW9CLEdBQXBCLDhCQUFxQkwsa0JBQXVCLEVBQUU7TUFDN0MsT0FBT1EsZ0JBQWdCLENBQUNFLG9CQUFvQixDQUFDVixrQkFBa0IsRUFBRSxJQUFJLENBQUNTLGNBQWMsRUFBRSxFQUFFLElBQUksQ0FBQzdTLE9BQU8sRUFBRSxJQUFJLENBQUNGLFVBQVUsQ0FBQyxDQUFDd0gsSUFBSSxDQUN6SHlMLFFBQWEsSUFBSztRQUNsQixJQUFJQSxRQUFRLEVBQUU7VUFDWixJQUFJLENBQUMvUyxPQUFPLENBQUNzUixjQUFjLEVBQUUsQ0FBQzBCLFdBQVcsQ0FBU0QsUUFBUSxDQUFDO1VBQzVELElBQ0NYLGtCQUFrQixhQUFsQkEsa0JBQWtCLGVBQWxCQSxrQkFBa0IsQ0FBRUcsYUFBYSxJQUNqQ0gsa0JBQWtCLENBQUNHLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQ0MsV0FBVyxFQUFFLENBQUN2UCxPQUFPLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQzdFO1lBQ0QsSUFBSSxDQUFDdkQsYUFBYSxDQUFDdVQsd0JBQXdCLEVBQUU7VUFDOUMsQ0FBQyxNQUFNO1lBQ04sSUFBSSxDQUFDdlQsYUFBYSxDQUFDd1Qsb0JBQW9CLEVBQUU7VUFDMUM7VUFDQSxJQUFJLENBQUNqSSx5QkFBeUIsR0FBRyxJQUFJO1FBQ3RDO01BQ0QsQ0FBQyxDQUNEO0lBQ0YsQ0FBQztJQUFBLE9BRUR5SCxzQkFBc0IsR0FBdEIsZ0NBQXVCTixrQkFBdUIsRUFBRTtNQUMvQyxPQUFPUSxnQkFBZ0IsQ0FBQ08sc0JBQXNCLENBQzVDLElBQUksQ0FBQ3pULGFBQWEsQ0FBQzBULFdBQVcsRUFBRSxDQUFTLFNBQVMsQ0FBQyxDQUFDN1MsT0FBTyxFQUM1RDZSLGtCQUFrQixFQUNsQixJQUFJLENBQUN4UyxNQUFNLENBQ1gsQ0FBQzBILElBQUksQ0FBRStMLFNBQWMsSUFBSztRQUMxQixJQUFJaEMsS0FBSztRQUNULElBQUlnQyxTQUFTLENBQUNDLE9BQU8sRUFBRTtVQUN0QixNQUFNQyxjQUFjLEdBQUdGLFNBQVMsQ0FBQ0MsT0FBTyxDQUFDekwsT0FBTyxFQUFFO1VBQ2xELE1BQU1zRyxhQUFhLEdBQUcsSUFBSSxDQUFDSSxtQ0FBbUMsQ0FBQzhFLFNBQVMsQ0FBQ0MsT0FBTyxDQUFDLEdBQzlFbk0saUJBQWlCLENBQUNDLGVBQWUsQ0FBQ2lNLFNBQVMsQ0FBQ0MsT0FBTyxDQUFDLEdBQ3BEQyxjQUFjO1VBRWpCLElBQUlwRixhQUFhLEtBQUtvRixjQUFjLEVBQUU7WUFDckM7WUFDQTtZQUNBLElBQUksQ0FBQzdNLHNCQUFzQixDQUFDO2NBQUUwSCxhQUFhLEVBQUVtRixjQUFjO2NBQUVsRixZQUFZLEVBQUVGO1lBQWMsQ0FBQyxDQUFDO1VBQzVGO1VBRUFrRCxLQUFLLEdBQUdsRCxhQUFhLENBQUNVLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JDLENBQUMsTUFBTSxJQUFJd0UsU0FBUyxDQUFDOUIsSUFBSSxFQUFFO1VBQzFCRixLQUFLLEdBQUdnQyxTQUFTLENBQUM5QixJQUFJO1FBQ3ZCO1FBRUEsSUFBSUYsS0FBSyxFQUFFO1VBQ1Y7VUFDQyxJQUFJLENBQUNyUixPQUFPLENBQUNzUixjQUFjLEVBQUUsQ0FBQzBCLFdBQVcsQ0FBUzNCLEtBQUssQ0FBQztVQUN6RCxJQUFJLENBQUMzUixhQUFhLENBQUM4VCxzQkFBc0IsRUFBRTtRQUM1QztNQUNELENBQUMsQ0FBQztJQUNILENBQUM7SUFBQSxPQUVEQyxZQUFZLEdBQVosd0JBQWU7TUFDZCxPQUFPLElBQUksQ0FBQy9TLFNBQVM7SUFDdEI7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BbVMsY0FBYyxHQUFkLDBCQUFpQjtNQUNoQixPQUFPLElBQUksQ0FBQzFPLFlBQVk7SUFDekIsQ0FBQztJQUFBLE9BRUR1UCxZQUFZLEdBQVosd0JBQW9CO01BQ25CLE9BQU8sSUFBSTtJQUNaLENBQUM7SUFBQTtFQUFBLEVBMzRCa0NDLE9BQU87RUFBQTtFQUFBLElBODRCckNDLHFCQUFxQjtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxRQUMxQkMsY0FBYyxHQUFkLHdCQUFlQyxlQUF1RCxFQUFFO01BQ3ZFLE1BQU1DLGVBQWUsR0FBRyxJQUFJM1UsY0FBYyxDQUFDMFUsZUFBZSxDQUFDO01BQzNELE9BQU9DLGVBQWUsQ0FBQ25ULFdBQVc7SUFDbkMsQ0FBQztJQUFBO0VBQUEsRUFKa0NvVCxjQUFjO0VBQUEsT0FPbkNKLHFCQUFxQjtBQUFBIn0=
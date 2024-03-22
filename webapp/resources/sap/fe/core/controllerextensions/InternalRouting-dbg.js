/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/routing/NavigationReason", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, CommonUtils, BusyLocker, ActivitySync, draft, NavigationReason, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, Component, Core, ControllerExtension, OverrideExecution, Filter, FilterOperator) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
   *
   * @namespace
   * @alias sap.fe.core.controllerextensions.InternalRouting
   * @private
   * @since 1.74.0
   */
  let InternalRouting = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalRouting"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = extensible(OverrideExecution.After), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = extensible(OverrideExecution.After), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = publicExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = finalExtension(), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = publicExtension(), _dec28 = finalExtension(), _dec29 = publicExtension(), _dec30 = extensible(OverrideExecution.Before), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalRouting, _ControllerExtension);
    function InternalRouting() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalRouting.prototype;
    _proto.onExit = function onExit() {
      if (this._oRoutingService) {
        this._oRoutingService.detachRouteMatched(this._fnRouteMatchedBound);
      }
    };
    _proto.onInit = function onInit() {
      this._oView = this.base.getView();
      this._oAppComponent = CommonUtils.getAppComponent(this._oView);
      this._oPageComponent = Component.getOwnerComponentFor(this._oView);
      this._oRouter = this._oAppComponent.getRouter();
      this._oRouterProxy = this._oAppComponent.getRouterProxy();
      if (!this._oAppComponent || !this._oPageComponent) {
        throw new Error("Failed to initialize controler extension 'sap.fe.core.controllerextesions.InternalRouting");
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (this._oAppComponent === this._oPageComponent) {
        // The view isn't hosted in a dedicated UIComponent, but directly in the app
        // --> just keep the view
        this._oPageComponent = null;
      }
      this._oAppComponent.getService("routingService").then(oRoutingService => {
        this._oRoutingService = oRoutingService;
        this._fnRouteMatchedBound = this._onRouteMatched.bind(this);
        this._oRoutingService.attachRouteMatched(this._fnRouteMatchedBound);
        this._oTargetInformation = oRoutingService.getTargetInformationFor(this._oPageComponent || this._oView);
      }).catch(function () {
        throw new Error("This controller extension cannot work without a 'routingService' on the main AppComponent");
      });
    }

    /**
     * Triggered every time this controller is a navigation target.
     */;
    _proto.onRouteMatched = function onRouteMatched() {
      /**/
    };
    _proto.onRouteMatchedFinished = function onRouteMatchedFinished() {
      /**/
    };
    _proto.onBeforeBinding = function onBeforeBinding(oBindingContext, mParameters) {
      const oRouting = this.base.getView().getController().routing;
      if (oRouting && oRouting.onBeforeBinding) {
        oRouting.onBeforeBinding(oBindingContext, mParameters);
      }
    };
    _proto.onAfterBinding = function onAfterBinding(oBindingContext, mParameters) {
      this._oAppComponent.getRootViewController().onContextBoundToView(oBindingContext);
      const oRouting = this.base.getView().getController().routing;
      if (oRouting && oRouting.onAfterBinding) {
        oRouting.onAfterBinding(oBindingContext, mParameters);
      }
    }

    ///////////////////////////////////////////////////////////
    // Methods triggering a navigation after a user action
    // (e.g. click on a table row, button, etc...)
    ///////////////////////////////////////////////////////////

    /**
     * Navigates to the specified navigation target.
     *
     * @param oContext Context instance
     * @param sNavigationTargetName Name of the navigation target
     * @param bPreserveHistory True to force the new URL to be added at the end of the browser history (no replace)
     * @ui5-restricted
     */;
    _proto.navigateToTarget = function navigateToTarget(oContext, sNavigationTargetName, bPreserveHistory) {
      const oNavigationConfiguration = this._oPageComponent && this._oPageComponent.getNavigationConfiguration && this._oPageComponent.getNavigationConfiguration(sNavigationTargetName);
      if (oNavigationConfiguration) {
        const oDetailRoute = oNavigationConfiguration.detail;
        const sRouteName = oDetailRoute.route;
        const mParameterMapping = oDetailRoute.parameters;
        this._oRoutingService.navigateTo(oContext, sRouteName, mParameterMapping, bPreserveHistory);
      } else {
        this._oRoutingService.navigateTo(oContext, null, null, bPreserveHistory);
      }
      this._oView.getViewData();
    }

    /**
     * Navigates to the specified navigation target route.
     *
     * @param sTargetRouteName Name of the target route
     * @param [oParameters] Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @ui5-restricted
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oParameters) {
      return this._oRoutingService.navigateToRoute(sTargetRouteName, oParameters);
    }

    /**
     * Navigates to a specific context.
     *
     * @param oContext The context to be navigated to
     * @param [mParameters] Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateToContext = function navigateToContext(oContext, mParameters) {
      const oContextInfo = {};
      mParameters = mParameters || {};
      if (oContext.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        if (mParameters.asyncContext) {
          // the context is either created async (Promise)
          // We need to activate the routeMatchSynchro on the RouterProxy to avoid that
          // the subsequent call to navigateToContext conflicts with the current one
          this._oRouterProxy.activateRouteMatchSynchronization();
          mParameters.asyncContext.then(asyncContext => {
            // once the context is returned we navigate into it
            this.navigateToContext(asyncContext, {
              checkNoHashChange: mParameters.checkNoHashChange,
              editable: mParameters.editable,
              bPersistOPScroll: mParameters.bPersistOPScroll,
              updateFCLLevel: mParameters.updateFCLLevel,
              bForceFocus: mParameters.bForceFocus
            });
          }).catch(function (oError) {
            Log.error("Error with the async context", oError);
          });
        } else if (!mParameters.bDeferredContext) {
          // Navigate to a list binding not yet supported
          throw "navigation to a list binding is not yet supported";
        }
      }
      if (mParameters.callExtension) {
        const oInternalModel = this._oView.getModel("internal");
        oInternalModel.setProperty("/paginatorCurrentContext", null);
        oContextInfo.sourceBindingContext = oContext.getObject();
        oContextInfo.bindingContext = oContext;
        if (mParameters.oEvent) {
          oContextInfo.oEvent = mParameters.oEvent;
        }
        // Storing the selected context to use it in internal route navigation if neccessary.
        const bOverrideNav = this.base.getView().getController().routing.onBeforeNavigation(oContextInfo);
        if (bOverrideNav) {
          oInternalModel.setProperty("/paginatorCurrentContext", oContext);
          return Promise.resolve(true);
        }
      }
      mParameters.FCLLevel = this._getFCLLevel();
      return this._oRoutingService.navigateToContext(oContext, mParameters, this._oView.getViewData(), this._oTargetInformation);
    }

    /**
     * Navigates backwards from a context.
     *
     * @param oContext Context to be navigated from
     * @param [mParameters] Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateBackFromContext = function navigateBackFromContext(oContext, mParameters) {
      mParameters = mParameters || {};
      mParameters.updateFCLLevel = -1;
      return this.navigateToContext(oContext, mParameters);
    }

    /**
     * Navigates forwards to a context.
     *
     * @param oContext Context to be navigated to
     * @param mParameters Optional navigation parameters
     * @returns Promise resolved when the navigation has been triggered
     * @ui5-restricted
     */;
    _proto.navigateForwardToContext = function navigateForwardToContext(oContext, mParameters) {
      var _this$_oView$getBindi;
      if (((_this$_oView$getBindi = this._oView.getBindingContext("internal")) === null || _this$_oView$getBindi === void 0 ? void 0 : _this$_oView$getBindi.getProperty("messageFooterContainsErrors")) === true) {
        return Promise.resolve(true);
      }
      mParameters = mParameters || {};
      mParameters.updateFCLLevel = 1;
      return this.navigateToContext(oContext, mParameters);
    }

    /**
     * Navigates back in history if the current hash corresponds to a transient state.
     */;
    _proto.navigateBackFromTransientState = function navigateBackFromTransientState() {
      const sHash = this._oRouterProxy.getHash();

      // if triggered while navigating to (...), we need to navigate back
      if (sHash.indexOf("(...)") !== -1) {
        this._oRouterProxy.navBack();
      }
    };
    _proto.navigateToMessagePage = function navigateToMessagePage(sErrorMessage, mParameters) {
      mParameters = mParameters || {};
      if (this._oRouterProxy.getHash().indexOf("i-action=create") > -1 || this._oRouterProxy.getHash().indexOf("i-action=autoCreate") > -1) {
        return this._oRouterProxy.navToHash(this._oRoutingService.getDefaultCreateHash());
      } else {
        mParameters.FCLLevel = this._getFCLLevel();
        return this._oAppComponent.getRootViewController().displayErrorPage(sErrorMessage, mParameters);
      }
    }

    /**
     * Checks if one of the current views on the screen is bound to a given context.
     *
     * @param oContext
     * @returns `true` if the state is impacted by the context
     * @ui5-restricted
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(oContext) {
      return this._oRoutingService.isCurrentStateImpactedBy(oContext);
    };
    _proto._isViewPartOfRoute = function _isViewPartOfRoute(routeInformation) {
      const aTargets = routeInformation === null || routeInformation === void 0 ? void 0 : routeInformation.targets;
      if (!aTargets || aTargets.indexOf(this._oTargetInformation.targetName) === -1) {
        // If the target for this view has a view level greater than the route level, it means this view comes "after" the route
        // in terms of navigation.
        // In such case, we remove its binding context, to avoid this view to have data if we navigate to it later on
        if ((this._oTargetInformation.viewLevel ?? 0) >= ((routeInformation === null || routeInformation === void 0 ? void 0 : routeInformation.routeLevel) ?? 0)) {
          this._setBindingContext(null); // This also call setKeepAlive(false) on the current context
        }

        return false;
      }
      return true;
    };
    _proto._buildBindingPath = function _buildBindingPath(routeArguments, bindingPattern, navigationParameters) {
      let path = bindingPattern.replace(":?query:", "");
      let deferred = false;
      for (const sKey in routeArguments) {
        const sValue = routeArguments[sKey];
        if (typeof sValue !== "string") {
          continue;
        }
        if (sValue === "..." && bindingPattern.indexOf(`{${sKey}}`) >= 0) {
          deferred = true;
          // Sometimes in preferredMode = create, the edit button is shown in background when the
          // action parameter dialog shows up, setting bTargetEditable passes editable as true
          // to onBeforeBinding in _bindTargetPage function
          navigationParameters.bTargetEditable = true;
        }
        path = path.replace(`{${sKey}}`, sValue);
      }
      if (routeArguments["?query"] && routeArguments["?query"].hasOwnProperty("i-action")) {
        navigationParameters.bActionCreate = true;
      }

      // the binding path is always absolute
      if (path && path[0] !== "/") {
        path = `/${path}`;
      }
      return {
        path,
        deferred
      };
    }

    ///////////////////////////////////////////////////////////
    // Methods to bind the page when a route is matched
    ///////////////////////////////////////////////////////////

    /**
     * Called when a route is matched.
     * Builds the binding context from the navigation parameters, and bind the page accordingly.
     *
     * @param oEvent
     * @ui5-restricted
     */;
    _proto._onRouteMatched = function _onRouteMatched(oEvent) {
      // Check if the target for this view is part of the event targets (i.e. is a target for the current route).
      // If not, we don't need to bind it --> return
      if (!this._isViewPartOfRoute(oEvent.getParameter("routeInformation"))) {
        return;
      }

      // Retrieve the binding context pattern
      let bindingPattern;
      if (this._oPageComponent && this._oPageComponent.getBindingContextPattern) {
        bindingPattern = this._oPageComponent.getBindingContextPattern();
      }
      bindingPattern = bindingPattern || this._oTargetInformation.contextPattern;
      if (bindingPattern === null || bindingPattern === undefined) {
        // Don't do this if we already got sTarget == '', which is a valid target pattern
        bindingPattern = oEvent.getParameter("routePattern");
      }

      // Replace the parameters by their values in the binding context pattern
      const mArguments = oEvent.getParameters().arguments;
      const oNavigationParameters = oEvent.getParameter("navigationInfo");
      const {
        path,
        deferred
      } = this._buildBindingPath(mArguments, bindingPattern, oNavigationParameters);
      this.onRouteMatched();
      const oModel = this._oView.getModel();
      let oOut;
      if (deferred) {
        oOut = this._bindDeferred(path, oNavigationParameters);
      } else {
        oOut = this._bindPage(path, oModel, oNavigationParameters);
      }
      // eslint-disable-next-line promise/catch-or-return
      oOut.finally(() => {
        this.onRouteMatchedFinished();
      });
      this._oAppComponent.getRootViewController().updateUIStateForView(this._oView, this._getFCLLevel());
    }

    /**
     * Deferred binding (during object creation).
     *
     * @param sTargetPath The path to the deffered context
     * @param oNavigationParameters Navigation parameters
     * @returns A Promise
     * @ui5-restricted
     */;
    _proto._bindDeferred = async function _bindDeferred(sTargetPath, oNavigationParameters) {
      this.onBeforeBinding(null, {
        editable: oNavigationParameters.bTargetEditable
      });
      if (oNavigationParameters.bDeferredContext || !oNavigationParameters.oAsyncContext) {
        // either the context shall be created in the target page (deferred Context) or it shall
        // be created async but the user refreshed the page / bookmarked this URL
        // TODO: currently the target component creates this document but we shall move this to
        // a central place
        if (this._oPageComponent && this._oPageComponent.createDeferredContext) {
          this._oPageComponent.createDeferredContext(sTargetPath, oNavigationParameters.listBindingForCreate, !!oNavigationParameters.bActionCreate);
        }
      }
      const currentBindingContext = this._getBindingContext();
      if (currentBindingContext !== null && currentBindingContext !== void 0 && currentBindingContext.hasPendingChanges()) {
        // For now remove the pending changes to avoid the model raises errors and the object page is at least bound
        // Ideally the user should be asked for
        currentBindingContext.getBinding().resetChanges();
      }

      // remove the context to avoid showing old data
      this._setBindingContext(null);
      this.onAfterBinding(null);
      return Promise.resolve();
    }

    /**
     * Sets the binding context of the page from a path.
     *
     * @param targetPath The path to the context
     * @param model The OData model
     * @param navigationParameters Navigation parameters
     * @returns A Promise resolved once the binding has been set on the page
     * @ui5-restricted
     */;
    _proto._bindPage = function _bindPage(targetPath, model, navigationParameters) {
      if (targetPath === "") {
        return Promise.resolve(this._bindPageToContext(null, model, navigationParameters));
      }
      return this.resolvePath(targetPath, model, navigationParameters).then(technicalPath => {
        this._bindPageToPath(technicalPath, model, navigationParameters);
      }).catch(error => {
        // Error handling for erroneous metadata request
        const resourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
        this.navigateToMessagePage(resourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"), {
          title: resourceBundle.getText("C_COMMON_SAPFE_ERROR"),
          description: error.message
        });
      });
    }

    /**
     * Creates the filter to retrieve a context corresponding to a semantic path.
     *
     * @param semanticPath The semantic or technical path
     * @param semanticKeys The semantic or technical keys for the path
     * @param metaModel The instance of the metamodel
     * @returns The filter
     * @ui5-restricted
     */;
    _proto.createFilterFromPath = function createFilterFromPath(semanticPath, semanticKeys, metaModel) {
      const unquoteAndDecode = function (value) {
        if (value.indexOf("'") === 0 && value.lastIndexOf("'") === value.length - 1) {
          // Remove the quotes from the value and decode special chars
          value = decodeURIComponent(value.substring(1, value.length - 1));
        }
        return value;
      };
      const keyValues = semanticPath.substring(semanticPath.indexOf("(") + 1, semanticPath.length - 1).split(",");
      let finalKeys = semanticKeys;
      let finalKeyValues = keyValues;
      // If we have technical keys, IsActiveEntity will be present. We need to remove it as we're already adding them at the end.
      if (semanticKeys.includes("IsActiveEntity")) {
        finalKeys = semanticKeys.filter(singleKey => singleKey.indexOf("IsActiveEntity") < 0);
        finalKeyValues = keyValues.filter(element => !element.startsWith("IsActiveEntity"));
      }
      if (finalKeys.length != finalKeyValues.length) {
        return null;
      }
      const filteringCaseSensitive = ModelHelper.isFilteringCaseSensitive(metaModel);
      let filters;
      if (finalKeys.length === 1) {
        // If this is a technical key, the equal is present because there's at least 2 parameters, a technical key and IsActiveEntity
        if (finalKeyValues[0].indexOf("=") > 0) {
          const keyPart = finalKeyValues[0].split("=");
          finalKeyValues[0] = keyPart[1];
        }
        // Take the first key value
        const keyValue = unquoteAndDecode(finalKeyValues[0]);
        filters = [new Filter({
          path: finalKeys[0],
          operator: FilterOperator.EQ,
          value1: keyValue,
          caseSensitive: filteringCaseSensitive
        })];
      } else {
        const mKeyValues = {};
        // Create a map of all key values
        finalKeyValues.forEach(function (sKeyAssignment) {
          const aParts = sKeyAssignment.split("="),
            keyValue = unquoteAndDecode(aParts[1]);
          mKeyValues[aParts[0]] = keyValue;
        });
        let failed = false;
        filters = finalKeys.map(function (semanticKey) {
          const key = semanticKey,
            value = mKeyValues[key];
          if (value !== undefined) {
            return new Filter({
              path: key,
              operator: FilterOperator.EQ,
              value1: value,
              caseSensitive: filteringCaseSensitive
            });
          } else {
            failed = true;
            return new Filter({
              path: "XX"
            }); // will be ignored anyway since we return after
          }
        });

        if (failed) {
          return null;
        }
      }

      // Add a draft filter to make sure we take the draft entity if there is one
      // Or the active entity otherwise
      const draftFilter = new Filter({
        filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
        and: false
      });
      filters.push(draftFilter);
      return new Filter(filters, true);
    }

    /**
     * Converts a path with semantic keys to a path with technical keys.
     *
     * @param pathWithParameters The path with semantic keys
     * @param model The model for the path
     * @param keys The semantic or technical keys for the path
     * @returns A Promise containing the path with technical keys if pathWithParameters could be interpreted as a technical path, null otherwise
     * @ui5-restricted
     * @private
     */;
    _proto.getTechnicalPathFromPath = async function getTechnicalPathFromPath(pathWithParameters, model, keys) {
      var _entitySetPath;
      const metaModel = model.getMetaModel();
      let entitySetPath = metaModel.getMetaContext(pathWithParameters).getPath();
      if (!keys || keys.length === 0) {
        // No semantic/technical keys
        return null;
      }

      // Create a set of filters corresponding to all keys
      const filter = this.createFilterFromPath(pathWithParameters, keys, metaModel);
      if (filter === null) {
        // Couldn't interpret the path as a semantic one
        return null;
      }

      // Load the corresponding object
      if (!((_entitySetPath = entitySetPath) !== null && _entitySetPath !== void 0 && _entitySetPath.startsWith("/"))) {
        entitySetPath = `/${entitySetPath}`;
      }
      const listBinding = model.bindList(entitySetPath, undefined, undefined, filter, {
        $$groupId: "$auto.Heroes"
      });
      const contexts = await listBinding.requestContexts(0, 2);
      if (contexts.length) {
        return contexts[0].getPath();
      } else {
        // No data could be loaded
        return null;
      }
    }

    /**
     * Refreshes a context.
     *
     * @param model The OData model
     * @param pathToReplaceWith The path to the new context
     * @param contextToRemove The initial context that is going to be replaced
     * @private
     */;
    _proto.refreshContext = async function refreshContext(model, pathToReplaceWith, contextToRemove) {
      const rootViewController = this._oAppComponent.getRootViewController();
      if (rootViewController.isFclEnabled()) {
        const contextToReplaceWith = model.getKeepAliveContext(pathToReplaceWith);
        contextToRemove.replaceWith(contextToReplaceWith);
      } else {
        EditState.setEditStateDirty();
      }
    }

    /**
     * Checks if a path is a root draft.
     *
     * @param path The path to test
     * @param metaModel The associated metadata model
     * @returns `true` if the path is a root path
     * @ui5-restricted
     * @private
     */;
    _proto.checkDraftAvailability = function checkDraftAvailability(path, metaModel) {
      const matches = /^[/]?(\w+)\([^/]+\)$/.exec(path);
      if (!matches) {
        return false;
      }
      // Get the entitySet name
      const entitySetPath = `/${matches[1]}`;
      // Check the entity set supports draft
      const draftRoot = metaModel.getObject(`${entitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
      return draftRoot ? true : false;
    }

    /**
     * Builds a path to navigate to from a path with SemanticKeys or technical keys.
     *
     * @param pathToResolve The path to be transformed
     * @param model The OData model
     * @param navigationParameter The parameter of the navigation
     * @returns String promise for the new path. If pathToResolve couldn't be interpreted as a semantic path, it is returned as is.
     * @ui5-restricted
     * @private
     */;
    _proto.resolvePath = async function resolvePath(pathToResolve, model, navigationParameter) {
      var _currentHashNoParams, _currentHashNoParams2, _currentHashNoParams3;
      const metaModel = model.getMetaModel();
      const lastSemanticMapping = this._oRoutingService.getLastSemanticMapping();
      let currentHashNoParams = this._oRouter.getHashChanger().getHash().split("?")[0];
      if (((_currentHashNoParams = currentHashNoParams) === null || _currentHashNoParams === void 0 ? void 0 : _currentHashNoParams.lastIndexOf("/")) === ((_currentHashNoParams2 = currentHashNoParams) === null || _currentHashNoParams2 === void 0 ? void 0 : _currentHashNoParams2.length) - 1) {
        // Remove trailing '/'
        currentHashNoParams = currentHashNoParams.substring(0, currentHashNoParams.length - 1);
      }
      let rootEntityName = (_currentHashNoParams3 = currentHashNoParams) === null || _currentHashNoParams3 === void 0 ? void 0 : _currentHashNoParams3.substr(0, currentHashNoParams.indexOf("("));
      if (rootEntityName.indexOf("/") === 0) {
        rootEntityName = rootEntityName.substring(1);
      }
      const isRootDraft = this.checkDraftAvailability(currentHashNoParams, metaModel),
        semanticKeys = isRootDraft ? SemanticKeyHelper.getSemanticKeys(metaModel, rootEntityName) : undefined,
        isCollaborationEnabled = ModelHelper.isCollaborationDraftSupported(metaModel);

      /**
       * If the entity is draft enabled, and we're in a collaboration application, and we're navigating to a draft, we're treating it as a new path.
       * We want to check if the draft exists first, then we navigate on it if it does exist, otherwise we navigate to the saved version.
       */
      if (isRootDraft && isCollaborationEnabled) {
        var _navigationParameter$;
        const isActiveEntity = (navigationParameter === null || navigationParameter === void 0 ? void 0 : (_navigationParameter$ = navigationParameter.useContext) === null || _navigationParameter$ === void 0 ? void 0 : _navigationParameter$.getProperty("IsActiveEntity")) ?? true;
        if (!isActiveEntity) {
          return this.resolveCollaborationPath(pathToResolve, model, navigationParameter, semanticKeys, rootEntityName);
        }
      }
      /**
       * This is the 'normal' process.
       * If we don't have semantic keys, the path we have is technical and can be used as is.
       * If the path to resolve is the same as the semantic path, then we know is has been resolved previously and we can return the technical path
       * Otherwise, we need to evaluate the technical path, to set up the semantic mapping (if it's been resolved).
       */
      if (semanticKeys === undefined) {
        return pathToResolve;
      }
      if ((lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.semanticPath) === pathToResolve) {
        // This semantic path has been resolved previously
        return lastSemanticMapping.technicalPath;
      }
      const formattedSemanticKeys = semanticKeys.map(singleKey => singleKey.$PropertyPath);

      // We need resolve the semantic path to get the technical keys
      const technicalPath = await this.getTechnicalPathFromPath(currentHashNoParams, model, formattedSemanticKeys);
      if (technicalPath && technicalPath !== pathToResolve) {
        // The semantic path was resolved (otherwise keep the original value for target)
        this._oRoutingService.setLastSemanticMapping({
          technicalPath: technicalPath,
          semanticPath: pathToResolve
        });
        return technicalPath;
      }
      return pathToResolve;
    }

    /**
     * Evaluate the path to navigate when we're in a collaboration application and navigating to a draft.
     * If the draft has been discarded, we change the path to the sibling element associated, otherwise we keep the same path.
     * We're not doing it outside of collaboration as it's adding a request during navigation!
     *
     * @param pathToResolve The path we're checking. If the draft exists, we return it as is, otherwise we return the sibling element associated
     * @param model The oData model
     * @param navigationParameter The parameter of the navigation
     * @param semanticKeys The semantic keys if we have semantic navigation, otherwise false
     * @param rootEntityName Name of the root entity
     * @returns The path to navigate to
     * @private
     */;
    _proto.resolveCollaborationPath = async function resolveCollaborationPath(pathToResolve, model, navigationParameter, semanticKeys, rootEntityName) {
      const lastSemanticMapping = this._oRoutingService.getLastSemanticMapping();
      const metaModel = model.getMetaModel();
      const currentHashNoParams = this._oRouter.getHashChanger().getHash().split("?")[0];
      let formattedKeys;
      const comparativePath = (lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.technicalPath) ?? pathToResolve;
      if (semanticKeys) {
        formattedKeys = semanticKeys.map(singleKey => singleKey.$PropertyPath);
      } else {
        formattedKeys = metaModel.getObject(`/${rootEntityName}/$Type/$Key`);
      }
      const technicalPath = await this.getTechnicalPathFromPath(currentHashNoParams, model, formattedKeys);
      if (technicalPath === null) {
        return pathToResolve;
      }
      // Comparing path that was returned from the server with the one we have. If they are different, it means the draft doesn't exist.
      if (technicalPath !== comparativePath && navigationParameter.useContext) {
        var _metaModel$getObject;
        if (lastSemanticMapping) {
          this._oRoutingService.setLastSemanticMapping({
            technicalPath: technicalPath,
            semanticPath: pathToResolve
          });
        }
        navigationParameter.redirectedToNonDraft = ((_metaModel$getObject = metaModel.getObject(`/${rootEntityName}/@com.sap.vocabularies.UI.v1.HeaderInfo`)) === null || _metaModel$getObject === void 0 ? void 0 : _metaModel$getObject.TypeName) ?? rootEntityName;
        await this.refreshContext(model, technicalPath, navigationParameter.useContext);
      }
      return technicalPath;
    }

    /**
     * Sets the binding context of the page from a path.
     *
     * @param sTargetPath The path to build the context. Needs to contain technical keys only.
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @ui5-restricted
     */;
    _proto._bindPageToPath = function _bindPageToPath(sTargetPath, oModel, oNavigationParameters) {
      const oCurrentContext = this._getBindingContext(),
        sCurrentPath = oCurrentContext && oCurrentContext.getPath(),
        oUseContext = oNavigationParameters.useContext;

      // We set the binding context only if it's different from the current one
      // or if we have a context already selected
      if (oUseContext && oUseContext.getPath() === sTargetPath) {
        if (oUseContext !== oCurrentContext) {
          let shouldRefreshContext = false;
          // We already have the context to be used, and it's not the current one
          const oRootViewController = this._oAppComponent.getRootViewController();

          // In case of FCL, if we're reusing a context from a table (through navigation), we refresh it to avoid outdated data
          // We don't wait for the refresh to be completed (requestRefresh), so that the corresponding query goes into the same
          // batch as the ones from controls in the page.
          if (oRootViewController.isFclEnabled() && oNavigationParameters.reason === NavigationReason.RowPress) {
            const metaModel = oUseContext.getModel().getMetaModel();
            if (!oUseContext.getBinding().hasPendingChanges()) {
              shouldRefreshContext = true;
            } else if (ActivitySync.isConnected(this.getView()) || ModelHelper.isDraftSupported(metaModel, oUseContext.getPath()) && ModelHelper.isCollaborationDraftSupported(metaModel)) {
              // If there are pending changes but we're in collaboration draft, we force the refresh (discarding pending changes) as we need to have the latest version.
              // When navigating from LR to OP, the view is not connected yet --> check if we're in draft with collaboration from the metamodel
              oUseContext.getBinding().resetChanges();
              shouldRefreshContext = true;
            }
          }
          this._bindPageToContext(oUseContext, oModel, oNavigationParameters);
          if (shouldRefreshContext) {
            oUseContext.refresh();
          }
        }
      } else if (sCurrentPath !== sTargetPath) {
        // We need to create a new context for its path
        this._bindPageToContext(this._createContext(sTargetPath, oModel), oModel, oNavigationParameters);
      } else if (oNavigationParameters.reason !== NavigationReason.AppStateChanged && EditState.isEditStateDirty()) {
        this._refreshBindingContext(oCurrentContext);
      }
    }

    /**
     * Binds the page to a context.
     *
     * @param oContext Context to be bound
     * @param oModel The OData model
     * @param oNavigationParameters Navigation parameters
     * @ui5-restricted
     */;
    _proto._bindPageToContext = function _bindPageToContext(oContext, oModel, oNavigationParameters) {
      if (!oContext) {
        this.onBeforeBinding(null);
        this.onAfterBinding(null);
        return;
      }
      const oParentListBinding = oContext.getBinding();
      const oRootViewController = this._oAppComponent.getRootViewController();
      if (oRootViewController.isFclEnabled()) {
        if (!oParentListBinding || !oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          // if the parentBinding is not a listBinding, we create a new context
          oContext = this._createContext(oContext.getPath(), oModel);
        }
        try {
          this._setKeepAlive(oContext, true, () => {
            if (oRootViewController.isContextUsedInPages(oContext)) {
              this.navigateBackFromContext(oContext);
            }
          }, true // Load messages, otherwise they don't get refreshed later, e.g. for side effects
          );
        } catch (oError) {
          // setKeepAlive throws an exception if the parent listbinding doesn't have $$ownRequest=true
          // This case for custom fragments is supported, but an error is logged to make the lack of synchronization apparent
          Log.error(`View for ${oContext.getPath()} won't be synchronized. Parent listBinding must have binding parameter $$ownRequest=true`);
        }
      } else if (!oParentListBinding || oParentListBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        // We need to recreate the context otherwise we get errors
        oContext = this._createContext(oContext.getPath(), oModel);
      }

      // Set the binding context with the proper before/after callbacks
      this.onBeforeBinding(oContext, {
        editable: oNavigationParameters.bTargetEditable,
        listBinding: oParentListBinding,
        bPersistOPScroll: oNavigationParameters.bPersistOPScroll,
        bDraftNavigation: oNavigationParameters.bDraftNavigation,
        showPlaceholder: oNavigationParameters.bShowPlaceholder
      });
      this._setBindingContext(oContext);
      this.onAfterBinding(oContext, {
        redirectedToNonDraft: oNavigationParameters === null || oNavigationParameters === void 0 ? void 0 : oNavigationParameters.redirectedToNonDraft
      });
    }

    /**
     * Creates a context from a path.
     *
     * @param sPath The path
     * @param oModel The OData model
     * @returns The created context
     * @ui5-restricted
     */;
    _proto._createContext = function _createContext(sPath, oModel) {
      const oPageComponent = this._oPageComponent,
        sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet(),
        sContextPath = oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath() || sEntitySet && `/${sEntitySet}`,
        oMetaModel = oModel.getMetaModel(),
        mParameters = {
          $$groupId: "$auto.Heroes",
          $$updateGroupId: "$auto",
          $$patchWithoutSideEffects: true
        };
      // In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
      const oDraftRoot = oMetaModel.getObject(`${sContextPath}@com.sap.vocabularies.Common.v1.DraftRoot`);
      const oDraftNode = oMetaModel.getObject(`${sContextPath}@com.sap.vocabularies.Common.v1.DraftNode`);
      const oRootViewController = this._oAppComponent.getRootViewController();
      if (oRootViewController.isFclEnabled()) {
        const oContext = this._getKeepAliveContext(oModel, sPath, false, mParameters);
        if (!oContext) {
          throw new Error(`Cannot create keepAlive context ${sPath}`);
        } else if (oDraftRoot || oDraftNode) {
          if (oContext.getProperty("IsActiveEntity") === undefined) {
            oContext.requestProperty(["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]);
            if (oDraftRoot) {
              oContext.requestObject("DraftAdministrativeData");
            }
          } else {
            // when switching between draft and edit we need to ensure those properties are requested again even if they are in the binding's cache
            // otherwise when you edit and go to the saved version you have no way of switching back to the edit version
            oContext.requestSideEffects(oDraftRoot ? ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity", "DraftAdministrativeData"] : ["HasActiveEntity", "HasDraftEntity", "IsActiveEntity"]);
          }
        }
        return oContext;
      } else {
        if (sEntitySet) {
          const sMessagesPath = oMetaModel.getObject(`${sContextPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
          if (sMessagesPath) {
            mParameters.$select = sMessagesPath;
          }
        }

        // In case of draft: $select the state flags (HasActiveEntity, HasDraftEntity, and IsActiveEntity)
        if (oDraftRoot || oDraftNode) {
          if (mParameters.$select === undefined) {
            mParameters.$select = "HasActiveEntity,HasDraftEntity,IsActiveEntity";
          } else {
            mParameters.$select += ",HasActiveEntity,HasDraftEntity,IsActiveEntity";
          }
        }
        if (this._oView.getBindingContext()) {
          var _this$_oView$getBindi2;
          const oPreviousBinding = (_this$_oView$getBindi2 = this._oView.getBindingContext()) === null || _this$_oView$getBindi2 === void 0 ? void 0 : _this$_oView$getBindi2.getBinding();
          oPreviousBinding === null || oPreviousBinding === void 0 ? void 0 : oPreviousBinding.resetChanges().then(() => {
            oPreviousBinding.destroy();
          }).catch(oError => {
            Log.error("Error while reseting the changes to the binding", oError);
          });
        }
        const oHiddenBinding = oModel.bindContext(sPath, undefined, mParameters);
        oHiddenBinding.attachEventOnce("dataRequested", () => {
          BusyLocker.lock(this._oView);
        });
        oHiddenBinding.attachEventOnce("dataReceived", this.onDataReceived.bind(this));
        return oHiddenBinding.getBoundContext();
      }
    };
    _proto.onDataReceived = async function onDataReceived(oEvent) {
      const sErrorDescription = oEvent && oEvent.getParameter("error");
      if (BusyLocker.isLocked(this._oView)) {
        BusyLocker.unlock(this._oView);
      }
      if (sErrorDescription) {
        // TODO: in case of 404 the text shall be different
        try {
          const oResourceBundle = await Core.getLibraryResourceBundle("sap.fe.core", true);
          const messageHandler = this.base.messageHandler;
          let mParams = {};
          if (sErrorDescription.status === 503) {
            mParams = {
              isInitialLoad503Error: true,
              shellBack: true
            };
          } else if (sErrorDescription.status === 400) {
            mParams = {
              title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
              description: oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR_DESCRIPTION"),
              isDataReceivedError: true,
              shellBack: true
            };
          } else {
            mParams = {
              title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
              description: sErrorDescription,
              isDataReceivedError: true,
              shellBack: true
            };
          }
          await messageHandler.showMessages(mParams);
        } catch (oError) {
          Log.error("Error while getting the core resource bundle", oError);
        }
      }
    }

    /**
     * Requests side effects on a binding context to "refresh" it.
     * TODO: get rid of this once provided by the model
     * a refresh on the binding context does not work in case a creation row with a transient context is
     * used. also a requestSideEffects with an empty path would fail due to the transient context
     * therefore we get all dependent bindings (via private model method) to determine all paths and then
     * request them.
     *
     * @param oBindingContext Context to be refreshed
     * @ui5-restricted
     */;
    _proto._refreshBindingContext = function _refreshBindingContext(oBindingContext) {
      const oPageComponent = this._oPageComponent;
      const oSideEffectsService = this._oAppComponent.getSideEffectsService();
      const sRootContextPath = oBindingContext.getPath();
      const sEntitySet = oPageComponent && oPageComponent.getEntitySet && oPageComponent.getEntitySet();
      const sContextPath = oPageComponent && oPageComponent.getContextPath && oPageComponent.getContextPath() || sEntitySet && `/${sEntitySet}`;
      const oMetaModel = this._oView.getModel().getMetaModel();
      let sMessagesPath;
      const aNavigationPropertyPaths = [];
      const aPropertyPaths = [];
      const oSideEffects = {
        targetProperties: [],
        targetEntities: []
      };
      function getBindingPaths(oBinding) {
        let aDependentBindings;
        const sRelativePath = (oBinding.getContext() && oBinding.getContext().getPath() || "").replace(sRootContextPath, ""); // If no context, this is an absolute binding so no relative path
        const sPath = (sRelativePath ? `${sRelativePath.slice(1)}/` : sRelativePath) + oBinding.getPath();
        if (oBinding.isA("sap.ui.model.odata.v4.ODataContextBinding")) {
          // if (sPath === "") {
          // now get the dependent bindings
          aDependentBindings = oBinding.getDependentBindings();
          if (aDependentBindings) {
            // ask the dependent bindings (and only those with the specified groupId
            //if (aDependentBindings.length > 0) {
            for (let i = 0; i < aDependentBindings.length; i++) {
              getBindingPaths(aDependentBindings[i]);
            }
          } else if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
            aNavigationPropertyPaths.push(sPath);
          }
        } else if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          if (aNavigationPropertyPaths.indexOf(sPath) === -1) {
            aNavigationPropertyPaths.push(sPath);
          }
        } else if (oBinding.isA("sap.ui.model.odata.v4.ODataPropertyBinding")) {
          if (aPropertyPaths.indexOf(sPath) === -1) {
            aPropertyPaths.push(sPath);
          }
        }
      }
      if (sContextPath) {
        sMessagesPath = oMetaModel.getObject(`${sContextPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
      }

      // binding of the context must have $$PatchWithoutSideEffects true, this bound context may be needed to be fetched from the dependent binding
      getBindingPaths(oBindingContext.getBinding());
      let i;
      for (i = 0; i < aNavigationPropertyPaths.length; i++) {
        oSideEffects.targetEntities.push({
          $NavigationPropertyPath: aNavigationPropertyPaths[i]
        });
      }
      oSideEffects.targetProperties = aPropertyPaths;
      if (sMessagesPath) {
        oSideEffects.targetProperties.push(sMessagesPath);
      }
      //all this logic to be replaced with a SideEffects request for an empty path (refresh everything), after testing transient contexts
      oSideEffects.targetProperties = oSideEffects.targetProperties.reduce((targets, targetProperty) => {
        if (targetProperty) {
          const index = targetProperty.indexOf("/");
          targets.push(index > 0 ? targetProperty.slice(0, index) : targetProperty);
        }
        return targets;
      }, []);
      // OData model will take care of duplicates
      oSideEffectsService.requestSideEffects([...oSideEffects.targetEntities, ...oSideEffects.targetProperties], oBindingContext);
    }

    /**
     * Gets the binding context of the page or the component.
     *
     * @returns The binding context
     * @ui5-restricted
     */;
    _proto._getBindingContext = function _getBindingContext() {
      if (this._oPageComponent) {
        return this._oPageComponent.getBindingContext();
      } else {
        return this._oView.getBindingContext();
      }
    }

    /**
     * Sets the binding context of the page or the component.
     *
     * @param oContext The binding context
     * @ui5-restricted
     */;
    _proto._setBindingContext = function _setBindingContext(oContext) {
      var _oPreviousContext;
      let oPreviousContext, oTargetControl;
      if (this._oPageComponent) {
        oPreviousContext = this._oPageComponent.getBindingContext();
        oTargetControl = this._oPageComponent;
      } else {
        oPreviousContext = this._oView.getBindingContext();
        oTargetControl = this._oView;
      }
      oTargetControl.setBindingContext(oContext);
      if ((_oPreviousContext = oPreviousContext) !== null && _oPreviousContext !== void 0 && _oPreviousContext.isKeepAlive() && oPreviousContext !== oContext) {
        this._setKeepAlive(oPreviousContext, false);
      }
    }

    /**
     * Gets the flexible column layout (FCL) level corresponding to the view (-1 if the app is not FCL).
     *
     * @returns The level
     * @ui5-restricted
     */;
    _proto._getFCLLevel = function _getFCLLevel() {
      return this._oTargetInformation.FCLLevel;
    };
    _proto._setKeepAlive = function _setKeepAlive(oContext, bKeepAlive, fnBeforeDestroy, bRequestMessages) {
      if (oContext.getPath().endsWith(")")) {
        // We keep the context alive only if they're part of a collection, i.e. if the path ends with a ')'
        const oMetaModel = oContext.getModel().getMetaModel();
        const sMetaPath = oMetaModel.getMetaPath(oContext.getPath());
        const sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
        oContext.setKeepAlive(bKeepAlive, fnBeforeDestroy, !!sMessagesPath && bRequestMessages);
      }
    };
    _proto._getKeepAliveContext = function _getKeepAliveContext(oModel, path, bRequestMessages, parameters) {
      // Get the path for the context that is really kept alive (part of a collection)
      // i.e. remove all segments not ending with a ')'
      const keptAliveSegments = path.split("/");
      const additionnalSegments = [];
      while (keptAliveSegments.length && !keptAliveSegments[keptAliveSegments.length - 1].endsWith(")")) {
        additionnalSegments.push(keptAliveSegments.pop());
      }
      if (keptAliveSegments.length === 0) {
        return undefined;
      }
      const keptAlivePath = keptAliveSegments.join("/");
      const oKeepAliveContext = oModel.getKeepAliveContext(keptAlivePath, bRequestMessages, parameters);
      if (additionnalSegments.length === 0) {
        return oKeepAliveContext;
      } else {
        additionnalSegments.reverse();
        const additionnalPath = additionnalSegments.join("/");
        return oModel.bindContext(additionnalPath, oKeepAliveContext).getBoundContext();
      }
    }

    /**
     * Switches between column and full-screen mode when FCL is used.
     *
     * @ui5-restricted
     */;
    _proto.switchFullScreen = function switchFullScreen() {
      const oSource = this.base.getView();
      const oFCLHelperModel = oSource.getModel("fclhelper"),
        bIsFullScreen = oFCLHelperModel.getProperty("/actionButtonsInfo/isFullScreen"),
        sNextLayout = oFCLHelperModel.getProperty(bIsFullScreen ? "/actionButtonsInfo/exitFullScreen" : "/actionButtonsInfo/fullScreen"),
        oRootViewController = this._oAppComponent.getRootViewController();
      const oContext = oRootViewController.getRightmostContext ? oRootViewController.getRightmostContext() : oSource.getBindingContext();
      this.base._routing.navigateToContext(oContext, {
        sLayout: sNextLayout
      }).catch(function () {
        Log.warning("cannot switch between column and fullscreen");
      });
    }

    /**
     * Closes the column for the current view in a FCL.
     *
     * @ui5-restricted
     */;
    _proto.closeColumn = function closeColumn() {
      const oViewData = this._oView.getViewData();
      const oContext = this._oView.getBindingContext();
      const oMetaModel = oContext.getModel().getMetaModel();
      const navigationParameters = {
        noPreservationCache: true,
        sLayout: this._oView.getModel("fclhelper").getProperty("/actionButtonsInfo/closeColumn")
      };
      if ((oViewData === null || oViewData === void 0 ? void 0 : oViewData.viewLevel) === 1 && ModelHelper.isDraftSupported(oMetaModel, oContext.getPath())) {
        draft.processDataLossOrDraftDiscardConfirmation(() => {
          this.navigateBackFromContext(oContext, navigationParameters);
        }, Function.prototype, oContext, this._oView.getController(), false, draft.NavigationType.BackNavigation);
      } else {
        this.navigateBackFromContext(oContext, navigationParameters);
      }
    };
    return InternalRouting;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatched", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatched"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRouteMatchedFinished", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "onRouteMatchedFinished"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeBinding", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterBinding", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToTarget", [_dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToTarget"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToRoute", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToRoute"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToContext", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateBackFromContext", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateBackFromContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateForwardToContext", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateForwardToContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateBackFromTransientState", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateBackFromTransientState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToMessagePage", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToMessagePage"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "isCurrentStateImpactedBy", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "isCurrentStateImpactedBy"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onDataReceived", [_dec26], Object.getOwnPropertyDescriptor(_class2.prototype, "onDataReceived"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "switchFullScreen", [_dec27, _dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "switchFullScreen"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "closeColumn", [_dec29, _dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "closeColumn"), _class2.prototype)), _class2)) || _class);
  return InternalRouting;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcm5hbFJvdXRpbmciLCJkZWZpbmVVSTVDbGFzcyIsIm1ldGhvZE92ZXJyaWRlIiwicHVibGljRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJmaW5hbEV4dGVuc2lvbiIsIkJlZm9yZSIsIm9uRXhpdCIsIl9vUm91dGluZ1NlcnZpY2UiLCJkZXRhY2hSb3V0ZU1hdGNoZWQiLCJfZm5Sb3V0ZU1hdGNoZWRCb3VuZCIsIm9uSW5pdCIsIl9vVmlldyIsImJhc2UiLCJnZXRWaWV3IiwiX29BcHBDb21wb25lbnQiLCJDb21tb25VdGlscyIsImdldEFwcENvbXBvbmVudCIsIl9vUGFnZUNvbXBvbmVudCIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiX29Sb3V0ZXIiLCJnZXRSb3V0ZXIiLCJfb1JvdXRlclByb3h5IiwiZ2V0Um91dGVyUHJveHkiLCJFcnJvciIsImdldFNlcnZpY2UiLCJ0aGVuIiwib1JvdXRpbmdTZXJ2aWNlIiwiX29uUm91dGVNYXRjaGVkIiwiYmluZCIsImF0dGFjaFJvdXRlTWF0Y2hlZCIsIl9vVGFyZ2V0SW5mb3JtYXRpb24iLCJnZXRUYXJnZXRJbmZvcm1hdGlvbkZvciIsImNhdGNoIiwib25Sb3V0ZU1hdGNoZWQiLCJvblJvdXRlTWF0Y2hlZEZpbmlzaGVkIiwib25CZWZvcmVCaW5kaW5nIiwib0JpbmRpbmdDb250ZXh0IiwibVBhcmFtZXRlcnMiLCJvUm91dGluZyIsImdldENvbnRyb2xsZXIiLCJyb3V0aW5nIiwib25BZnRlckJpbmRpbmciLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJvbkNvbnRleHRCb3VuZFRvVmlldyIsIm5hdmlnYXRlVG9UYXJnZXQiLCJvQ29udGV4dCIsInNOYXZpZ2F0aW9uVGFyZ2V0TmFtZSIsImJQcmVzZXJ2ZUhpc3RvcnkiLCJvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24iLCJnZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbiIsIm9EZXRhaWxSb3V0ZSIsImRldGFpbCIsInNSb3V0ZU5hbWUiLCJyb3V0ZSIsIm1QYXJhbWV0ZXJNYXBwaW5nIiwicGFyYW1ldGVycyIsIm5hdmlnYXRlVG8iLCJnZXRWaWV3RGF0YSIsIm5hdmlnYXRlVG9Sb3V0ZSIsInNUYXJnZXRSb3V0ZU5hbWUiLCJvUGFyYW1ldGVycyIsIm5hdmlnYXRlVG9Db250ZXh0Iiwib0NvbnRleHRJbmZvIiwiaXNBIiwiYXN5bmNDb250ZXh0IiwiYWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uIiwiY2hlY2tOb0hhc2hDaGFuZ2UiLCJlZGl0YWJsZSIsImJQZXJzaXN0T1BTY3JvbGwiLCJ1cGRhdGVGQ0xMZXZlbCIsImJGb3JjZUZvY3VzIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJiRGVmZXJyZWRDb250ZXh0IiwiY2FsbEV4dGVuc2lvbiIsIm9JbnRlcm5hbE1vZGVsIiwiZ2V0TW9kZWwiLCJzZXRQcm9wZXJ0eSIsInNvdXJjZUJpbmRpbmdDb250ZXh0IiwiZ2V0T2JqZWN0IiwiYmluZGluZ0NvbnRleHQiLCJvRXZlbnQiLCJiT3ZlcnJpZGVOYXYiLCJvbkJlZm9yZU5hdmlnYXRpb24iLCJQcm9taXNlIiwicmVzb2x2ZSIsIkZDTExldmVsIiwiX2dldEZDTExldmVsIiwibmF2aWdhdGVCYWNrRnJvbUNvbnRleHQiLCJuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldFByb3BlcnR5IiwibmF2aWdhdGVCYWNrRnJvbVRyYW5zaWVudFN0YXRlIiwic0hhc2giLCJnZXRIYXNoIiwiaW5kZXhPZiIsIm5hdkJhY2siLCJuYXZpZ2F0ZVRvTWVzc2FnZVBhZ2UiLCJzRXJyb3JNZXNzYWdlIiwibmF2VG9IYXNoIiwiZ2V0RGVmYXVsdENyZWF0ZUhhc2giLCJkaXNwbGF5RXJyb3JQYWdlIiwiaXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5IiwiX2lzVmlld1BhcnRPZlJvdXRlIiwicm91dGVJbmZvcm1hdGlvbiIsImFUYXJnZXRzIiwidGFyZ2V0cyIsInRhcmdldE5hbWUiLCJ2aWV3TGV2ZWwiLCJyb3V0ZUxldmVsIiwiX3NldEJpbmRpbmdDb250ZXh0IiwiX2J1aWxkQmluZGluZ1BhdGgiLCJyb3V0ZUFyZ3VtZW50cyIsImJpbmRpbmdQYXR0ZXJuIiwibmF2aWdhdGlvblBhcmFtZXRlcnMiLCJwYXRoIiwicmVwbGFjZSIsImRlZmVycmVkIiwic0tleSIsInNWYWx1ZSIsImJUYXJnZXRFZGl0YWJsZSIsImhhc093blByb3BlcnR5IiwiYkFjdGlvbkNyZWF0ZSIsImdldFBhcmFtZXRlciIsImdldEJpbmRpbmdDb250ZXh0UGF0dGVybiIsImNvbnRleHRQYXR0ZXJuIiwidW5kZWZpbmVkIiwibUFyZ3VtZW50cyIsImdldFBhcmFtZXRlcnMiLCJhcmd1bWVudHMiLCJvTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJvTW9kZWwiLCJvT3V0IiwiX2JpbmREZWZlcnJlZCIsIl9iaW5kUGFnZSIsImZpbmFsbHkiLCJ1cGRhdGVVSVN0YXRlRm9yVmlldyIsInNUYXJnZXRQYXRoIiwib0FzeW5jQ29udGV4dCIsImNyZWF0ZURlZmVycmVkQ29udGV4dCIsImxpc3RCaW5kaW5nRm9yQ3JlYXRlIiwiY3VycmVudEJpbmRpbmdDb250ZXh0IiwiX2dldEJpbmRpbmdDb250ZXh0IiwiaGFzUGVuZGluZ0NoYW5nZXMiLCJnZXRCaW5kaW5nIiwicmVzZXRDaGFuZ2VzIiwidGFyZ2V0UGF0aCIsIm1vZGVsIiwiX2JpbmRQYWdlVG9Db250ZXh0IiwicmVzb2x2ZVBhdGgiLCJ0ZWNobmljYWxQYXRoIiwiX2JpbmRQYWdlVG9QYXRoIiwicmVzb3VyY2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZ2V0VGV4dCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJtZXNzYWdlIiwiY3JlYXRlRmlsdGVyRnJvbVBhdGgiLCJzZW1hbnRpY1BhdGgiLCJzZW1hbnRpY0tleXMiLCJtZXRhTW9kZWwiLCJ1bnF1b3RlQW5kRGVjb2RlIiwidmFsdWUiLCJsYXN0SW5kZXhPZiIsImxlbmd0aCIsImRlY29kZVVSSUNvbXBvbmVudCIsInN1YnN0cmluZyIsImtleVZhbHVlcyIsInNwbGl0IiwiZmluYWxLZXlzIiwiZmluYWxLZXlWYWx1ZXMiLCJpbmNsdWRlcyIsImZpbHRlciIsInNpbmdsZUtleSIsImVsZW1lbnQiLCJzdGFydHNXaXRoIiwiZmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSIsIk1vZGVsSGVscGVyIiwiaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIiwiZmlsdGVycyIsImtleVBhcnQiLCJrZXlWYWx1ZSIsIkZpbHRlciIsIm9wZXJhdG9yIiwiRmlsdGVyT3BlcmF0b3IiLCJFUSIsInZhbHVlMSIsImNhc2VTZW5zaXRpdmUiLCJtS2V5VmFsdWVzIiwiZm9yRWFjaCIsInNLZXlBc3NpZ25tZW50IiwiYVBhcnRzIiwiZmFpbGVkIiwibWFwIiwic2VtYW50aWNLZXkiLCJrZXkiLCJkcmFmdEZpbHRlciIsImFuZCIsInB1c2giLCJnZXRUZWNobmljYWxQYXRoRnJvbVBhdGgiLCJwYXRoV2l0aFBhcmFtZXRlcnMiLCJrZXlzIiwiZ2V0TWV0YU1vZGVsIiwiZW50aXR5U2V0UGF0aCIsImdldE1ldGFDb250ZXh0IiwiZ2V0UGF0aCIsImxpc3RCaW5kaW5nIiwiYmluZExpc3QiLCIkJGdyb3VwSWQiLCJjb250ZXh0cyIsInJlcXVlc3RDb250ZXh0cyIsInJlZnJlc2hDb250ZXh0IiwicGF0aFRvUmVwbGFjZVdpdGgiLCJjb250ZXh0VG9SZW1vdmUiLCJyb290Vmlld0NvbnRyb2xsZXIiLCJpc0ZjbEVuYWJsZWQiLCJjb250ZXh0VG9SZXBsYWNlV2l0aCIsImdldEtlZXBBbGl2ZUNvbnRleHQiLCJyZXBsYWNlV2l0aCIsIkVkaXRTdGF0ZSIsInNldEVkaXRTdGF0ZURpcnR5IiwiY2hlY2tEcmFmdEF2YWlsYWJpbGl0eSIsIm1hdGNoZXMiLCJleGVjIiwiZHJhZnRSb290IiwicGF0aFRvUmVzb2x2ZSIsIm5hdmlnYXRpb25QYXJhbWV0ZXIiLCJsYXN0U2VtYW50aWNNYXBwaW5nIiwiZ2V0TGFzdFNlbWFudGljTWFwcGluZyIsImN1cnJlbnRIYXNoTm9QYXJhbXMiLCJnZXRIYXNoQ2hhbmdlciIsInJvb3RFbnRpdHlOYW1lIiwic3Vic3RyIiwiaXNSb290RHJhZnQiLCJTZW1hbnRpY0tleUhlbHBlciIsImdldFNlbWFudGljS2V5cyIsImlzQ29sbGFib3JhdGlvbkVuYWJsZWQiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsImlzQWN0aXZlRW50aXR5IiwidXNlQ29udGV4dCIsInJlc29sdmVDb2xsYWJvcmF0aW9uUGF0aCIsImZvcm1hdHRlZFNlbWFudGljS2V5cyIsIiRQcm9wZXJ0eVBhdGgiLCJzZXRMYXN0U2VtYW50aWNNYXBwaW5nIiwiZm9ybWF0dGVkS2V5cyIsImNvbXBhcmF0aXZlUGF0aCIsInJlZGlyZWN0ZWRUb05vbkRyYWZ0IiwiVHlwZU5hbWUiLCJvQ3VycmVudENvbnRleHQiLCJzQ3VycmVudFBhdGgiLCJvVXNlQ29udGV4dCIsInNob3VsZFJlZnJlc2hDb250ZXh0Iiwib1Jvb3RWaWV3Q29udHJvbGxlciIsInJlYXNvbiIsIk5hdmlnYXRpb25SZWFzb24iLCJSb3dQcmVzcyIsIkFjdGl2aXR5U3luYyIsImlzQ29ubmVjdGVkIiwiaXNEcmFmdFN1cHBvcnRlZCIsInJlZnJlc2giLCJfY3JlYXRlQ29udGV4dCIsIkFwcFN0YXRlQ2hhbmdlZCIsImlzRWRpdFN0YXRlRGlydHkiLCJfcmVmcmVzaEJpbmRpbmdDb250ZXh0Iiwib1BhcmVudExpc3RCaW5kaW5nIiwiX3NldEtlZXBBbGl2ZSIsImlzQ29udGV4dFVzZWRJblBhZ2VzIiwiYkRyYWZ0TmF2aWdhdGlvbiIsInNob3dQbGFjZWhvbGRlciIsImJTaG93UGxhY2Vob2xkZXIiLCJzUGF0aCIsIm9QYWdlQ29tcG9uZW50Iiwic0VudGl0eVNldCIsImdldEVudGl0eVNldCIsInNDb250ZXh0UGF0aCIsImdldENvbnRleHRQYXRoIiwib01ldGFNb2RlbCIsIiQkdXBkYXRlR3JvdXBJZCIsIiQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHMiLCJvRHJhZnRSb290Iiwib0RyYWZ0Tm9kZSIsIl9nZXRLZWVwQWxpdmVDb250ZXh0IiwicmVxdWVzdFByb3BlcnR5IiwicmVxdWVzdE9iamVjdCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsInNNZXNzYWdlc1BhdGgiLCIkc2VsZWN0Iiwib1ByZXZpb3VzQmluZGluZyIsImRlc3Ryb3kiLCJvSGlkZGVuQmluZGluZyIsImJpbmRDb250ZXh0IiwiYXR0YWNoRXZlbnRPbmNlIiwiQnVzeUxvY2tlciIsImxvY2siLCJvbkRhdGFSZWNlaXZlZCIsImdldEJvdW5kQ29udGV4dCIsInNFcnJvckRlc2NyaXB0aW9uIiwiaXNMb2NrZWQiLCJ1bmxvY2siLCJvUmVzb3VyY2VCdW5kbGUiLCJtZXNzYWdlSGFuZGxlciIsIm1QYXJhbXMiLCJzdGF0dXMiLCJpc0luaXRpYWxMb2FkNTAzRXJyb3IiLCJzaGVsbEJhY2siLCJpc0RhdGFSZWNlaXZlZEVycm9yIiwic2hvd01lc3NhZ2VzIiwib1NpZGVFZmZlY3RzU2VydmljZSIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsInNSb290Q29udGV4dFBhdGgiLCJhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMiLCJhUHJvcGVydHlQYXRocyIsIm9TaWRlRWZmZWN0cyIsInRhcmdldFByb3BlcnRpZXMiLCJ0YXJnZXRFbnRpdGllcyIsImdldEJpbmRpbmdQYXRocyIsIm9CaW5kaW5nIiwiYURlcGVuZGVudEJpbmRpbmdzIiwic1JlbGF0aXZlUGF0aCIsImdldENvbnRleHQiLCJzbGljZSIsImdldERlcGVuZGVudEJpbmRpbmdzIiwiaSIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwicmVkdWNlIiwidGFyZ2V0UHJvcGVydHkiLCJpbmRleCIsIm9QcmV2aW91c0NvbnRleHQiLCJvVGFyZ2V0Q29udHJvbCIsInNldEJpbmRpbmdDb250ZXh0IiwiaXNLZWVwQWxpdmUiLCJiS2VlcEFsaXZlIiwiZm5CZWZvcmVEZXN0cm95IiwiYlJlcXVlc3RNZXNzYWdlcyIsImVuZHNXaXRoIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJzZXRLZWVwQWxpdmUiLCJrZXB0QWxpdmVTZWdtZW50cyIsImFkZGl0aW9ubmFsU2VnbWVudHMiLCJwb3AiLCJrZXB0QWxpdmVQYXRoIiwiam9pbiIsIm9LZWVwQWxpdmVDb250ZXh0IiwicmV2ZXJzZSIsImFkZGl0aW9ubmFsUGF0aCIsInN3aXRjaEZ1bGxTY3JlZW4iLCJvU291cmNlIiwib0ZDTEhlbHBlck1vZGVsIiwiYklzRnVsbFNjcmVlbiIsInNOZXh0TGF5b3V0IiwiZ2V0UmlnaHRtb3N0Q29udGV4dCIsIl9yb3V0aW5nIiwic0xheW91dCIsIndhcm5pbmciLCJjbG9zZUNvbHVtbiIsIm9WaWV3RGF0YSIsIm5vUHJlc2VydmF0aW9uQ2FjaGUiLCJkcmFmdCIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiRnVuY3Rpb24iLCJwcm90b3R5cGUiLCJOYXZpZ2F0aW9uVHlwZSIsIkJhY2tOYXZpZ2F0aW9uIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSW50ZXJuYWxSb3V0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCB7IEZFVmlldyB9IGZyb20gXCJzYXAvZmUvY29yZS9CYXNlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCBBY3Rpdml0eVN5bmMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlTeW5jXCI7XG5pbXBvcnQgZHJhZnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQgTmF2aWdhdGlvblJlYXNvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvcm91dGluZy9OYXZpZ2F0aW9uUmVhc29uXCI7XG5pbXBvcnQgdHlwZSBSb3V0ZXJQcm94eSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvcm91dGluZy9Sb3V0ZXJQcm94eVwiO1xuaW1wb3J0IHR5cGUgeyBFbmhhbmNlV2l0aFVJNSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBtZXRob2RPdmVycmlkZSwgcHVibGljRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgRWRpdFN0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0VkaXRTdGF0ZVwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2VtYW50aWNLZXlIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2VtYW50aWNLZXlIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgeyBSb3V0aW5nTmF2aWdhdGlvbkluZm8sIFJvdXRpbmdTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1JvdXRpbmdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgVGVtcGxhdGVDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCB0eXBlIFJvdXRlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9Sb3V0ZXJcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB7IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSB9IGZyb20gXCIuLi9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5cbi8qKlxuICoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5Db250cm9sbGVyRXh0ZW5zaW9uIENvbnRyb2xsZXIgZXh0ZW5zaW9ufVxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5JbnRlcm5hbFJvdXRpbmdcbiAqIEBwcml2YXRlXG4gKiBAc2luY2UgMS43NC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsUm91dGluZ1wiKVxuY2xhc3MgSW50ZXJuYWxSb3V0aW5nIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByaXZhdGUgYmFzZSE6IFBhZ2VDb250cm9sbGVyO1xuXG5cdHByaXZhdGUgX29WaWV3ITogRkVWaWV3O1xuXG5cdHByaXZhdGUgX29BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cblx0cHJpdmF0ZSBfb1BhZ2VDb21wb25lbnQhOiBFbmhhbmNlV2l0aFVJNTxUZW1wbGF0ZUNvbXBvbmVudD4gfCBudWxsO1xuXG5cdHByaXZhdGUgX29Sb3V0ZXIhOiBSb3V0ZXI7XG5cblx0cHJpdmF0ZSBfb1JvdXRpbmdTZXJ2aWNlITogUm91dGluZ1NlcnZpY2U7XG5cblx0cHJpdmF0ZSBfb1JvdXRlclByb3h5ITogUm91dGVyUHJveHk7XG5cblx0cHJpdmF0ZSBfZm5Sb3V0ZU1hdGNoZWRCb3VuZCE6IEZ1bmN0aW9uO1xuXG5cdHByb3RlY3RlZCBfb1RhcmdldEluZm9ybWF0aW9uOiBhbnk7XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25FeGl0KCkge1xuXHRcdGlmICh0aGlzLl9vUm91dGluZ1NlcnZpY2UpIHtcblx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5kZXRhY2hSb3V0ZU1hdGNoZWQodGhpcy5fZm5Sb3V0ZU1hdGNoZWRCb3VuZCk7XG5cdFx0fVxuXHR9XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25Jbml0KCkge1xuXHRcdHRoaXMuX29WaWV3ID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHR0aGlzLl9vQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuX29WaWV3KTtcblx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcih0aGlzLl9vVmlldykgYXMgRW5oYW5jZVdpdGhVSTU8VGVtcGxhdGVDb21wb25lbnQ+O1xuXHRcdHRoaXMuX29Sb3V0ZXIgPSB0aGlzLl9vQXBwQ29tcG9uZW50LmdldFJvdXRlcigpO1xuXHRcdHRoaXMuX29Sb3V0ZXJQcm94eSA9ICh0aGlzLl9vQXBwQ29tcG9uZW50IGFzIGFueSkuZ2V0Um91dGVyUHJveHkoKTtcblxuXHRcdGlmICghdGhpcy5fb0FwcENvbXBvbmVudCB8fCAhdGhpcy5fb1BhZ2VDb21wb25lbnQpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkZhaWxlZCB0byBpbml0aWFsaXplIGNvbnRyb2xlciBleHRlbnNpb24gJ3NhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlc2lvbnMuSW50ZXJuYWxSb3V0aW5nXCIpO1xuXHRcdH1cblxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0aWYgKHRoaXMuX29BcHBDb21wb25lbnQgPT09IHRoaXMuX29QYWdlQ29tcG9uZW50KSB7XG5cdFx0XHQvLyBUaGUgdmlldyBpc24ndCBob3N0ZWQgaW4gYSBkZWRpY2F0ZWQgVUlDb21wb25lbnQsIGJ1dCBkaXJlY3RseSBpbiB0aGUgYXBwXG5cdFx0XHQvLyAtLT4ganVzdCBrZWVwIHRoZSB2aWV3XG5cdFx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudCA9IG51bGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5fb0FwcENvbXBvbmVudFxuXHRcdFx0LmdldFNlcnZpY2UoXCJyb3V0aW5nU2VydmljZVwiKVxuXHRcdFx0LnRoZW4oKG9Sb3V0aW5nU2VydmljZTogUm91dGluZ1NlcnZpY2UpID0+IHtcblx0XHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlID0gb1JvdXRpbmdTZXJ2aWNlO1xuXHRcdFx0XHR0aGlzLl9mblJvdXRlTWF0Y2hlZEJvdW5kID0gdGhpcy5fb25Sb3V0ZU1hdGNoZWQuYmluZCh0aGlzKTtcblx0XHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlLmF0dGFjaFJvdXRlTWF0Y2hlZCh0aGlzLl9mblJvdXRlTWF0Y2hlZEJvdW5kKTtcblx0XHRcdFx0dGhpcy5fb1RhcmdldEluZm9ybWF0aW9uID0gb1JvdXRpbmdTZXJ2aWNlLmdldFRhcmdldEluZm9ybWF0aW9uRm9yKHRoaXMuX29QYWdlQ29tcG9uZW50IHx8IHRoaXMuX29WaWV3KTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGlzIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGNhbm5vdCB3b3JrIHdpdGhvdXQgYSAncm91dGluZ1NlcnZpY2UnIG9uIHRoZSBtYWluIEFwcENvbXBvbmVudFwiKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJlZCBldmVyeSB0aW1lIHRoaXMgY29udHJvbGxlciBpcyBhIG5hdmlnYXRpb24gdGFyZ2V0LlxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvblJvdXRlTWF0Y2hlZCgpIHtcblx0XHQvKiovXG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUm91dGVNYXRjaGVkRmluaXNoZWQoKSB7XG5cdFx0LyoqL1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvbkJlZm9yZUJpbmRpbmcob0JpbmRpbmdDb250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzPzogYW55KSB7XG5cdFx0Y29uc3Qgb1JvdXRpbmcgPSAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgYW55KS5yb3V0aW5nO1xuXHRcdGlmIChvUm91dGluZyAmJiBvUm91dGluZy5vbkJlZm9yZUJpbmRpbmcpIHtcblx0XHRcdG9Sb3V0aW5nLm9uQmVmb3JlQmluZGluZyhvQmluZGluZ0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQWZ0ZXJCaW5kaW5nKG9CaW5kaW5nQ29udGV4dDogYW55LCBtUGFyYW1ldGVycz86IGFueSkge1xuXHRcdCh0aGlzLl9vQXBwQ29tcG9uZW50IGFzIGFueSkuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkub25Db250ZXh0Qm91bmRUb1ZpZXcob0JpbmRpbmdDb250ZXh0KTtcblx0XHRjb25zdCBvUm91dGluZyA9ICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLnJvdXRpbmc7XG5cdFx0aWYgKG9Sb3V0aW5nICYmIG9Sb3V0aW5nLm9uQWZ0ZXJCaW5kaW5nKSB7XG5cdFx0XHRvUm91dGluZy5vbkFmdGVyQmluZGluZyhvQmluZGluZ0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBNZXRob2RzIHRyaWdnZXJpbmcgYSBuYXZpZ2F0aW9uIGFmdGVyIGEgdXNlciBhY3Rpb25cblx0Ly8gKGUuZy4gY2xpY2sgb24gYSB0YWJsZSByb3csIGJ1dHRvbiwgZXRjLi4uKVxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gdGhlIHNwZWNpZmllZCBuYXZpZ2F0aW9uIHRhcmdldC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgaW5zdGFuY2Vcblx0ICogQHBhcmFtIHNOYXZpZ2F0aW9uVGFyZ2V0TmFtZSBOYW1lIG9mIHRoZSBuYXZpZ2F0aW9uIHRhcmdldFxuXHQgKiBAcGFyYW0gYlByZXNlcnZlSGlzdG9yeSBUcnVlIHRvIGZvcmNlIHRoZSBuZXcgVVJMIHRvIGJlIGFkZGVkIGF0IHRoZSBlbmQgb2YgdGhlIGJyb3dzZXIgaGlzdG9yeSAobm8gcmVwbGFjZSlcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVUb1RhcmdldChvQ29udGV4dDogYW55LCBzTmF2aWdhdGlvblRhcmdldE5hbWU6IHN0cmluZywgYlByZXNlcnZlSGlzdG9yeT86IGJvb2xlYW4pIHtcblx0XHRjb25zdCBvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24gPVxuXHRcdFx0dGhpcy5fb1BhZ2VDb21wb25lbnQgJiZcblx0XHRcdHRoaXMuX29QYWdlQ29tcG9uZW50LmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uICYmXG5cdFx0XHR0aGlzLl9vUGFnZUNvbXBvbmVudC5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihzTmF2aWdhdGlvblRhcmdldE5hbWUpO1xuXHRcdGlmIChvTmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24pIHtcblx0XHRcdGNvbnN0IG9EZXRhaWxSb3V0ZSA9IG9OYXZpZ2F0aW9uQ29uZmlndXJhdGlvbi5kZXRhaWw7XG5cdFx0XHRjb25zdCBzUm91dGVOYW1lID0gb0RldGFpbFJvdXRlLnJvdXRlO1xuXHRcdFx0Y29uc3QgbVBhcmFtZXRlck1hcHBpbmcgPSBvRGV0YWlsUm91dGUucGFyYW1ldGVycztcblx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvKG9Db250ZXh0LCBzUm91dGVOYW1lLCBtUGFyYW1ldGVyTWFwcGluZywgYlByZXNlcnZlSGlzdG9yeSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvKG9Db250ZXh0LCBudWxsLCBudWxsLCBiUHJlc2VydmVIaXN0b3J5KTtcblx0XHR9XG5cdFx0dGhpcy5fb1ZpZXcuZ2V0Vmlld0RhdGEoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gdGhlIHNwZWNpZmllZCBuYXZpZ2F0aW9uIHRhcmdldCByb3V0ZS5cblx0ICpcblx0ICogQHBhcmFtIHNUYXJnZXRSb3V0ZU5hbWUgTmFtZSBvZiB0aGUgdGFyZ2V0IHJvdXRlXG5cdCAqIEBwYXJhbSBbb1BhcmFtZXRlcnNdIFBhcmFtZXRlcnMgdG8gYmUgdXNlZCB3aXRoIHJvdXRlIHRvIGNyZWF0ZSB0aGUgdGFyZ2V0IGhhc2hcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZmluYWxpemVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdG5hdmlnYXRlVG9Sb3V0ZShzVGFyZ2V0Um91dGVOYW1lOiBzdHJpbmcsIG9QYXJhbWV0ZXJzPzogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIHRoaXMuX29Sb3V0aW5nU2VydmljZS5uYXZpZ2F0ZVRvUm91dGUoc1RhcmdldFJvdXRlTmFtZSwgb1BhcmFtZXRlcnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byBhIHNwZWNpZmljIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0byBiZSBuYXZpZ2F0ZWQgdG9cblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwgbmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBoYXMgYmVlbiB0cmlnZ2VyZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRjb25zdCBvQ29udGV4dEluZm86IGFueSA9IHt9O1xuXHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cblx0XHRpZiAob0NvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdGlmIChtUGFyYW1ldGVycy5hc3luY0NvbnRleHQpIHtcblx0XHRcdFx0Ly8gdGhlIGNvbnRleHQgaXMgZWl0aGVyIGNyZWF0ZWQgYXN5bmMgKFByb21pc2UpXG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gYWN0aXZhdGUgdGhlIHJvdXRlTWF0Y2hTeW5jaHJvIG9uIHRoZSBSb3V0ZXJQcm94eSB0byBhdm9pZCB0aGF0XG5cdFx0XHRcdC8vIHRoZSBzdWJzZXF1ZW50IGNhbGwgdG8gbmF2aWdhdGVUb0NvbnRleHQgY29uZmxpY3RzIHdpdGggdGhlIGN1cnJlbnQgb25lXG5cdFx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5hY3RpdmF0ZVJvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24oKTtcblxuXHRcdFx0XHRtUGFyYW1ldGVycy5hc3luY0NvbnRleHRcblx0XHRcdFx0XHQudGhlbigoYXN5bmNDb250ZXh0OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdC8vIG9uY2UgdGhlIGNvbnRleHQgaXMgcmV0dXJuZWQgd2UgbmF2aWdhdGUgaW50byBpdFxuXHRcdFx0XHRcdFx0dGhpcy5uYXZpZ2F0ZVRvQ29udGV4dChhc3luY0NvbnRleHQsIHtcblx0XHRcdFx0XHRcdFx0Y2hlY2tOb0hhc2hDaGFuZ2U6IG1QYXJhbWV0ZXJzLmNoZWNrTm9IYXNoQ2hhbmdlLFxuXHRcdFx0XHRcdFx0XHRlZGl0YWJsZTogbVBhcmFtZXRlcnMuZWRpdGFibGUsXG5cdFx0XHRcdFx0XHRcdGJQZXJzaXN0T1BTY3JvbGw6IG1QYXJhbWV0ZXJzLmJQZXJzaXN0T1BTY3JvbGwsXG5cdFx0XHRcdFx0XHRcdHVwZGF0ZUZDTExldmVsOiBtUGFyYW1ldGVycy51cGRhdGVGQ0xMZXZlbCxcblx0XHRcdFx0XHRcdFx0YkZvcmNlRm9jdXM6IG1QYXJhbWV0ZXJzLmJGb3JjZUZvY3VzXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdpdGggdGhlIGFzeW5jIGNvbnRleHRcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoIW1QYXJhbWV0ZXJzLmJEZWZlcnJlZENvbnRleHQpIHtcblx0XHRcdFx0Ly8gTmF2aWdhdGUgdG8gYSBsaXN0IGJpbmRpbmcgbm90IHlldCBzdXBwb3J0ZWRcblx0XHRcdFx0dGhyb3cgXCJuYXZpZ2F0aW9uIHRvIGEgbGlzdCBiaW5kaW5nIGlzIG5vdCB5ZXQgc3VwcG9ydGVkXCI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmNhbGxFeHRlbnNpb24pIHtcblx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsID0gdGhpcy5fb1ZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKTtcblx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3BhZ2luYXRvckN1cnJlbnRDb250ZXh0XCIsIG51bGwpO1xuXG5cdFx0XHRvQ29udGV4dEluZm8uc291cmNlQmluZGluZ0NvbnRleHQgPSBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdG9Db250ZXh0SW5mby5iaW5kaW5nQ29udGV4dCA9IG9Db250ZXh0O1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLm9FdmVudCkge1xuXHRcdFx0XHRvQ29udGV4dEluZm8ub0V2ZW50ID0gbVBhcmFtZXRlcnMub0V2ZW50O1xuXHRcdFx0fVxuXHRcdFx0Ly8gU3RvcmluZyB0aGUgc2VsZWN0ZWQgY29udGV4dCB0byB1c2UgaXQgaW4gaW50ZXJuYWwgcm91dGUgbmF2aWdhdGlvbiBpZiBuZWNjZXNzYXJ5LlxuXHRcdFx0Y29uc3QgYk92ZXJyaWRlTmF2ID0gKHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkucm91dGluZy5vbkJlZm9yZU5hdmlnYXRpb24ob0NvbnRleHRJbmZvKTtcblx0XHRcdGlmIChiT3ZlcnJpZGVOYXYpIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvcGFnaW5hdG9yQ3VycmVudENvbnRleHRcIiwgb0NvbnRleHQpO1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRtUGFyYW1ldGVycy5GQ0xMZXZlbCA9IHRoaXMuX2dldEZDTExldmVsKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5fb1JvdXRpbmdTZXJ2aWNlLm5hdmlnYXRlVG9Db250ZXh0KG9Db250ZXh0LCBtUGFyYW1ldGVycywgdGhpcy5fb1ZpZXcuZ2V0Vmlld0RhdGEoKSwgdGhpcy5fb1RhcmdldEluZm9ybWF0aW9uKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgYmFja3dhcmRzIGZyb20gYSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCB0byBiZSBuYXZpZ2F0ZWQgZnJvbVxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBPcHRpb25hbCBuYXZpZ2F0aW9uIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlZCB3aGVuIHRoZSBuYXZpZ2F0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dChvQ29udGV4dDogYW55LCBtUGFyYW1ldGVycz86IGFueSkge1xuXHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cdFx0bVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWwgPSAtMTtcblxuXHRcdHJldHVybiB0aGlzLm5hdmlnYXRlVG9Db250ZXh0KG9Db250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIGZvcndhcmRzIHRvIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgbmF2aWdhdGVkIHRvXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBPcHRpb25hbCBuYXZpZ2F0aW9uIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlZCB3aGVuIHRoZSBuYXZpZ2F0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM/OiBhbnkpOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHRpZiAodGhpcy5fb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKT8uZ2V0UHJvcGVydHkoXCJtZXNzYWdlRm9vdGVyQ29udGFpbnNFcnJvcnNcIikgPT09IHRydWUpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0fVxuXHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cdFx0bVBhcmFtZXRlcnMudXBkYXRlRkNMTGV2ZWwgPSAxO1xuXG5cdFx0cmV0dXJuIHRoaXMubmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgYmFjayBpbiBoaXN0b3J5IGlmIHRoZSBjdXJyZW50IGhhc2ggY29ycmVzcG9uZHMgdG8gYSB0cmFuc2llbnQgc3RhdGUuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVCYWNrRnJvbVRyYW5zaWVudFN0YXRlKCkge1xuXHRcdGNvbnN0IHNIYXNoID0gdGhpcy5fb1JvdXRlclByb3h5LmdldEhhc2goKTtcblxuXHRcdC8vIGlmIHRyaWdnZXJlZCB3aGlsZSBuYXZpZ2F0aW5nIHRvICguLi4pLCB3ZSBuZWVkIHRvIG5hdmlnYXRlIGJhY2tcblx0XHRpZiAoc0hhc2guaW5kZXhPZihcIiguLi4pXCIpICE9PSAtMSkge1xuXHRcdFx0dGhpcy5fb1JvdXRlclByb3h5Lm5hdkJhY2soKTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVUb01lc3NhZ2VQYWdlKHNFcnJvck1lc3NhZ2U6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5fb1JvdXRlclByb3h5LmdldEhhc2goKS5pbmRleE9mKFwiaS1hY3Rpb249Y3JlYXRlXCIpID4gLTEgfHxcblx0XHRcdHRoaXMuX29Sb3V0ZXJQcm94eS5nZXRIYXNoKCkuaW5kZXhPZihcImktYWN0aW9uPWF1dG9DcmVhdGVcIikgPiAtMVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX29Sb3V0ZXJQcm94eS5uYXZUb0hhc2godGhpcy5fb1JvdXRpbmdTZXJ2aWNlLmdldERlZmF1bHRDcmVhdGVIYXNoKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtUGFyYW1ldGVycy5GQ0xMZXZlbCA9IHRoaXMuX2dldEZDTExldmVsKCk7XG5cblx0XHRcdHJldHVybiAodGhpcy5fb0FwcENvbXBvbmVudCBhcyBhbnkpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpLmRpc3BsYXlFcnJvclBhZ2Uoc0Vycm9yTWVzc2FnZSwgbVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgb25lIG9mIHRoZSBjdXJyZW50IHZpZXdzIG9uIHRoZSBzY3JlZW4gaXMgYm91bmQgdG8gYSBnaXZlbiBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHRcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBzdGF0ZSBpcyBpbXBhY3RlZCBieSB0aGUgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRpc0N1cnJlbnRTdGF0ZUltcGFjdGVkQnkob0NvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9vUm91dGluZ1NlcnZpY2UuaXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KG9Db250ZXh0KTtcblx0fVxuXG5cdF9pc1ZpZXdQYXJ0T2ZSb3V0ZShyb3V0ZUluZm9ybWF0aW9uOiBhbnkpOiBib29sZWFuIHtcblx0XHRjb25zdCBhVGFyZ2V0cyA9IHJvdXRlSW5mb3JtYXRpb24/LnRhcmdldHM7XG5cdFx0aWYgKCFhVGFyZ2V0cyB8fCBhVGFyZ2V0cy5pbmRleE9mKHRoaXMuX29UYXJnZXRJbmZvcm1hdGlvbi50YXJnZXROYW1lKSA9PT0gLTEpIHtcblx0XHRcdC8vIElmIHRoZSB0YXJnZXQgZm9yIHRoaXMgdmlldyBoYXMgYSB2aWV3IGxldmVsIGdyZWF0ZXIgdGhhbiB0aGUgcm91dGUgbGV2ZWwsIGl0IG1lYW5zIHRoaXMgdmlldyBjb21lcyBcImFmdGVyXCIgdGhlIHJvdXRlXG5cdFx0XHQvLyBpbiB0ZXJtcyBvZiBuYXZpZ2F0aW9uLlxuXHRcdFx0Ly8gSW4gc3VjaCBjYXNlLCB3ZSByZW1vdmUgaXRzIGJpbmRpbmcgY29udGV4dCwgdG8gYXZvaWQgdGhpcyB2aWV3IHRvIGhhdmUgZGF0YSBpZiB3ZSBuYXZpZ2F0ZSB0byBpdCBsYXRlciBvblxuXHRcdFx0aWYgKCh0aGlzLl9vVGFyZ2V0SW5mb3JtYXRpb24udmlld0xldmVsID8/IDApID49IChyb3V0ZUluZm9ybWF0aW9uPy5yb3V0ZUxldmVsID8/IDApKSB7XG5cdFx0XHRcdHRoaXMuX3NldEJpbmRpbmdDb250ZXh0KG51bGwpOyAvLyBUaGlzIGFsc28gY2FsbCBzZXRLZWVwQWxpdmUoZmFsc2UpIG9uIHRoZSBjdXJyZW50IGNvbnRleHRcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdF9idWlsZEJpbmRpbmdQYXRoKFxuXHRcdHJvdXRlQXJndW1lbnRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBvYmplY3Q+LFxuXHRcdGJpbmRpbmdQYXR0ZXJuOiBzdHJpbmcsXG5cdFx0bmF2aWdhdGlvblBhcmFtZXRlcnM6IFJvdXRpbmdOYXZpZ2F0aW9uSW5mb1xuXHQpOiB7IHBhdGg6IHN0cmluZzsgZGVmZXJyZWQ6IGJvb2xlYW4gfSB7XG5cdFx0bGV0IHBhdGggPSBiaW5kaW5nUGF0dGVybi5yZXBsYWNlKFwiOj9xdWVyeTpcIiwgXCJcIik7XG5cdFx0bGV0IGRlZmVycmVkID0gZmFsc2U7XG5cblx0XHRmb3IgKGNvbnN0IHNLZXkgaW4gcm91dGVBcmd1bWVudHMpIHtcblx0XHRcdGNvbnN0IHNWYWx1ZSA9IHJvdXRlQXJndW1lbnRzW3NLZXldO1xuXG5cdFx0XHRpZiAodHlwZW9mIHNWYWx1ZSAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHNWYWx1ZSA9PT0gXCIuLi5cIiAmJiBiaW5kaW5nUGF0dGVybi5pbmRleE9mKGB7JHtzS2V5fX1gKSA+PSAwKSB7XG5cdFx0XHRcdGRlZmVycmVkID0gdHJ1ZTtcblx0XHRcdFx0Ly8gU29tZXRpbWVzIGluIHByZWZlcnJlZE1vZGUgPSBjcmVhdGUsIHRoZSBlZGl0IGJ1dHRvbiBpcyBzaG93biBpbiBiYWNrZ3JvdW5kIHdoZW4gdGhlXG5cdFx0XHRcdC8vIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nIHNob3dzIHVwLCBzZXR0aW5nIGJUYXJnZXRFZGl0YWJsZSBwYXNzZXMgZWRpdGFibGUgYXMgdHJ1ZVxuXHRcdFx0XHQvLyB0byBvbkJlZm9yZUJpbmRpbmcgaW4gX2JpbmRUYXJnZXRQYWdlIGZ1bmN0aW9uXG5cdFx0XHRcdG5hdmlnYXRpb25QYXJhbWV0ZXJzLmJUYXJnZXRFZGl0YWJsZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRwYXRoID0gcGF0aC5yZXBsYWNlKGB7JHtzS2V5fX1gLCBzVmFsdWUpO1xuXHRcdH1cblx0XHRpZiAocm91dGVBcmd1bWVudHNbXCI/cXVlcnlcIl0gJiYgcm91dGVBcmd1bWVudHNbXCI/cXVlcnlcIl0uaGFzT3duUHJvcGVydHkoXCJpLWFjdGlvblwiKSkge1xuXHRcdFx0bmF2aWdhdGlvblBhcmFtZXRlcnMuYkFjdGlvbkNyZWF0ZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gdGhlIGJpbmRpbmcgcGF0aCBpcyBhbHdheXMgYWJzb2x1dGVcblx0XHRpZiAocGF0aCAmJiBwYXRoWzBdICE9PSBcIi9cIikge1xuXHRcdFx0cGF0aCA9IGAvJHtwYXRofWA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHsgcGF0aCwgZGVmZXJyZWQgfTtcblx0fVxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIE1ldGhvZHMgdG8gYmluZCB0aGUgcGFnZSB3aGVuIGEgcm91dGUgaXMgbWF0Y2hlZFxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiBhIHJvdXRlIGlzIG1hdGNoZWQuXG5cdCAqIEJ1aWxkcyB0aGUgYmluZGluZyBjb250ZXh0IGZyb20gdGhlIG5hdmlnYXRpb24gcGFyYW1ldGVycywgYW5kIGJpbmQgdGhlIHBhZ2UgYWNjb3JkaW5nbHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfb25Sb3V0ZU1hdGNoZWQob0V2ZW50OiBFdmVudCkge1xuXHRcdC8vIENoZWNrIGlmIHRoZSB0YXJnZXQgZm9yIHRoaXMgdmlldyBpcyBwYXJ0IG9mIHRoZSBldmVudCB0YXJnZXRzIChpLmUuIGlzIGEgdGFyZ2V0IGZvciB0aGUgY3VycmVudCByb3V0ZSkuXG5cdFx0Ly8gSWYgbm90LCB3ZSBkb24ndCBuZWVkIHRvIGJpbmQgaXQgLS0+IHJldHVyblxuXHRcdGlmICghdGhpcy5faXNWaWV3UGFydE9mUm91dGUob0V2ZW50LmdldFBhcmFtZXRlcihcInJvdXRlSW5mb3JtYXRpb25cIikpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gUmV0cmlldmUgdGhlIGJpbmRpbmcgY29udGV4dCBwYXR0ZXJuXG5cdFx0bGV0IGJpbmRpbmdQYXR0ZXJuO1xuXHRcdGlmICh0aGlzLl9vUGFnZUNvbXBvbmVudCAmJiB0aGlzLl9vUGFnZUNvbXBvbmVudC5nZXRCaW5kaW5nQ29udGV4dFBhdHRlcm4pIHtcblx0XHRcdGJpbmRpbmdQYXR0ZXJuID0gdGhpcy5fb1BhZ2VDb21wb25lbnQuZ2V0QmluZGluZ0NvbnRleHRQYXR0ZXJuKCk7XG5cdFx0fVxuXHRcdGJpbmRpbmdQYXR0ZXJuID0gYmluZGluZ1BhdHRlcm4gfHwgdGhpcy5fb1RhcmdldEluZm9ybWF0aW9uLmNvbnRleHRQYXR0ZXJuO1xuXG5cdFx0aWYgKGJpbmRpbmdQYXR0ZXJuID09PSBudWxsIHx8IGJpbmRpbmdQYXR0ZXJuID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIERvbid0IGRvIHRoaXMgaWYgd2UgYWxyZWFkeSBnb3Qgc1RhcmdldCA9PSAnJywgd2hpY2ggaXMgYSB2YWxpZCB0YXJnZXQgcGF0dGVyblxuXHRcdFx0YmluZGluZ1BhdHRlcm4gPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicm91dGVQYXR0ZXJuXCIpO1xuXHRcdH1cblxuXHRcdC8vIFJlcGxhY2UgdGhlIHBhcmFtZXRlcnMgYnkgdGhlaXIgdmFsdWVzIGluIHRoZSBiaW5kaW5nIGNvbnRleHQgcGF0dGVyblxuXHRcdGNvbnN0IG1Bcmd1bWVudHMgPSAob0V2ZW50LmdldFBhcmFtZXRlcnMoKSBhcyBhbnkpLmFyZ3VtZW50cztcblx0XHRjb25zdCBvTmF2aWdhdGlvblBhcmFtZXRlcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwibmF2aWdhdGlvbkluZm9cIikgYXMgUm91dGluZ05hdmlnYXRpb25JbmZvO1xuXHRcdGNvbnN0IHsgcGF0aCwgZGVmZXJyZWQgfSA9IHRoaXMuX2J1aWxkQmluZGluZ1BhdGgobUFyZ3VtZW50cywgYmluZGluZ1BhdHRlcm4sIG9OYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cblx0XHR0aGlzLm9uUm91dGVNYXRjaGVkKCk7XG5cblx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbCgpO1xuXHRcdGxldCBvT3V0O1xuXHRcdGlmIChkZWZlcnJlZCkge1xuXHRcdFx0b091dCA9IHRoaXMuX2JpbmREZWZlcnJlZChwYXRoLCBvTmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvT3V0ID0gdGhpcy5fYmluZFBhZ2UocGF0aCwgb01vZGVsLCBvTmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdH1cblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgcHJvbWlzZS9jYXRjaC1vci1yZXR1cm5cblx0XHRvT3V0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0dGhpcy5vblJvdXRlTWF0Y2hlZEZpbmlzaGVkKCk7XG5cdFx0fSk7XG5cblx0XHQodGhpcy5fb0FwcENvbXBvbmVudCBhcyBhbnkpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpLnVwZGF0ZVVJU3RhdGVGb3JWaWV3KHRoaXMuX29WaWV3LCB0aGlzLl9nZXRGQ0xMZXZlbCgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWZlcnJlZCBiaW5kaW5nIChkdXJpbmcgb2JqZWN0IGNyZWF0aW9uKS5cblx0ICpcblx0ICogQHBhcmFtIHNUYXJnZXRQYXRoIFRoZSBwYXRoIHRvIHRoZSBkZWZmZXJlZCBjb250ZXh0XG5cdCAqIEBwYXJhbSBvTmF2aWdhdGlvblBhcmFtZXRlcnMgTmF2aWdhdGlvbiBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGFzeW5jIF9iaW5kRGVmZXJyZWQoc1RhcmdldFBhdGg6IHN0cmluZywgb05hdmlnYXRpb25QYXJhbWV0ZXJzOiBSb3V0aW5nTmF2aWdhdGlvbkluZm8pIHtcblx0XHR0aGlzLm9uQmVmb3JlQmluZGluZyhudWxsLCB7IGVkaXRhYmxlOiBvTmF2aWdhdGlvblBhcmFtZXRlcnMuYlRhcmdldEVkaXRhYmxlIH0pO1xuXG5cdFx0aWYgKG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5iRGVmZXJyZWRDb250ZXh0IHx8ICFvTmF2aWdhdGlvblBhcmFtZXRlcnMub0FzeW5jQ29udGV4dCkge1xuXHRcdFx0Ly8gZWl0aGVyIHRoZSBjb250ZXh0IHNoYWxsIGJlIGNyZWF0ZWQgaW4gdGhlIHRhcmdldCBwYWdlIChkZWZlcnJlZCBDb250ZXh0KSBvciBpdCBzaGFsbFxuXHRcdFx0Ly8gYmUgY3JlYXRlZCBhc3luYyBidXQgdGhlIHVzZXIgcmVmcmVzaGVkIHRoZSBwYWdlIC8gYm9va21hcmtlZCB0aGlzIFVSTFxuXHRcdFx0Ly8gVE9ETzogY3VycmVudGx5IHRoZSB0YXJnZXQgY29tcG9uZW50IGNyZWF0ZXMgdGhpcyBkb2N1bWVudCBidXQgd2Ugc2hhbGwgbW92ZSB0aGlzIHRvXG5cdFx0XHQvLyBhIGNlbnRyYWwgcGxhY2Vcblx0XHRcdGlmICh0aGlzLl9vUGFnZUNvbXBvbmVudCAmJiB0aGlzLl9vUGFnZUNvbXBvbmVudC5jcmVhdGVEZWZlcnJlZENvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5fb1BhZ2VDb21wb25lbnQuY3JlYXRlRGVmZXJyZWRDb250ZXh0KFxuXHRcdFx0XHRcdHNUYXJnZXRQYXRoLFxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5saXN0QmluZGluZ0ZvckNyZWF0ZSBhcyBPRGF0YUxpc3RCaW5kaW5nLFxuXHRcdFx0XHRcdCEhb05hdmlnYXRpb25QYXJhbWV0ZXJzLmJBY3Rpb25DcmVhdGVcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBjdXJyZW50QmluZGluZ0NvbnRleHQgPSB0aGlzLl9nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGlmIChjdXJyZW50QmluZGluZ0NvbnRleHQ/Lmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdC8vIEZvciBub3cgcmVtb3ZlIHRoZSBwZW5kaW5nIGNoYW5nZXMgdG8gYXZvaWQgdGhlIG1vZGVsIHJhaXNlcyBlcnJvcnMgYW5kIHRoZSBvYmplY3QgcGFnZSBpcyBhdCBsZWFzdCBib3VuZFxuXHRcdFx0Ly8gSWRlYWxseSB0aGUgdXNlciBzaG91bGQgYmUgYXNrZWQgZm9yXG5cdFx0XHRjdXJyZW50QmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdH1cblxuXHRcdC8vIHJlbW92ZSB0aGUgY29udGV4dCB0byBhdm9pZCBzaG93aW5nIG9sZCBkYXRhXG5cdFx0dGhpcy5fc2V0QmluZGluZ0NvbnRleHQobnVsbCk7XG5cblx0XHR0aGlzLm9uQWZ0ZXJCaW5kaW5nKG51bGwpO1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2UgZnJvbSBhIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXRQYXRoIFRoZSBwYXRoIHRvIHRoZSBjb250ZXh0XG5cdCAqIEBwYXJhbSBtb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHBhcmFtIG5hdmlnYXRpb25QYXJhbWV0ZXJzIE5hdmlnYXRpb24gcGFyYW1ldGVyc1xuXHQgKiBAcmV0dXJucyBBIFByb21pc2UgcmVzb2x2ZWQgb25jZSB0aGUgYmluZGluZyBoYXMgYmVlbiBzZXQgb24gdGhlIHBhZ2Vcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfYmluZFBhZ2UodGFyZ2V0UGF0aDogc3RyaW5nLCBtb2RlbDogT0RhdGFNb2RlbCwgbmF2aWdhdGlvblBhcmFtZXRlcnM6IFJvdXRpbmdOYXZpZ2F0aW9uSW5mbykge1xuXHRcdGlmICh0YXJnZXRQYXRoID09PSBcIlwiKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JpbmRQYWdlVG9Db250ZXh0KG51bGwsIG1vZGVsLCBuYXZpZ2F0aW9uUGFyYW1ldGVycykpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnJlc29sdmVQYXRoKHRhcmdldFBhdGgsIG1vZGVsLCBuYXZpZ2F0aW9uUGFyYW1ldGVycylcblx0XHRcdC50aGVuKCh0ZWNobmljYWxQYXRoOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0dGhpcy5fYmluZFBhZ2VUb1BhdGgodGVjaG5pY2FsUGF0aCwgbW9kZWwsIG5hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goKGVycm9yOiBhbnkpID0+IHtcblx0XHRcdFx0Ly8gRXJyb3IgaGFuZGxpbmcgZm9yIGVycm9uZW91cyBtZXRhZGF0YSByZXF1ZXN0XG5cdFx0XHRcdGNvbnN0IHJlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblxuXHRcdFx0XHR0aGlzLm5hdmlnYXRlVG9NZXNzYWdlUGFnZShyZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfREFUQV9SRUNFSVZFRF9FUlJPUlwiKSwge1xuXHRcdFx0XHRcdHRpdGxlOiByZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfRVJST1JcIiksXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb246IGVycm9yLm1lc3NhZ2Vcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIHRoZSBmaWx0ZXIgdG8gcmV0cmlldmUgYSBjb250ZXh0IGNvcnJlc3BvbmRpbmcgdG8gYSBzZW1hbnRpYyBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc2VtYW50aWNQYXRoIFRoZSBzZW1hbnRpYyBvciB0ZWNobmljYWwgcGF0aFxuXHQgKiBAcGFyYW0gc2VtYW50aWNLZXlzIFRoZSBzZW1hbnRpYyBvciB0ZWNobmljYWwga2V5cyBmb3IgdGhlIHBhdGhcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBUaGUgaW5zdGFuY2Ugb2YgdGhlIG1ldGFtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgZmlsdGVyXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Y3JlYXRlRmlsdGVyRnJvbVBhdGgoc2VtYW50aWNQYXRoOiBzdHJpbmcsIHNlbWFudGljS2V5czogc3RyaW5nW10sIG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpOiBGaWx0ZXIgfCBudWxsIHtcblx0XHRjb25zdCB1bnF1b3RlQW5kRGVjb2RlID0gZnVuY3Rpb24gKHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdFx0aWYgKHZhbHVlLmluZGV4T2YoXCInXCIpID09PSAwICYmIHZhbHVlLmxhc3RJbmRleE9mKFwiJ1wiKSA9PT0gdmFsdWUubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHQvLyBSZW1vdmUgdGhlIHF1b3RlcyBmcm9tIHRoZSB2YWx1ZSBhbmQgZGVjb2RlIHNwZWNpYWwgY2hhcnNcblx0XHRcdFx0dmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQodmFsdWUuc3Vic3RyaW5nKDEsIHZhbHVlLmxlbmd0aCAtIDEpKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9O1xuXHRcdGNvbnN0IGtleVZhbHVlcyA9IHNlbWFudGljUGF0aC5zdWJzdHJpbmcoc2VtYW50aWNQYXRoLmluZGV4T2YoXCIoXCIpICsgMSwgc2VtYW50aWNQYXRoLmxlbmd0aCAtIDEpLnNwbGl0KFwiLFwiKTtcblxuXHRcdGxldCBmaW5hbEtleXMgPSBzZW1hbnRpY0tleXM7XG5cdFx0bGV0IGZpbmFsS2V5VmFsdWVzID0ga2V5VmFsdWVzO1xuXHRcdC8vIElmIHdlIGhhdmUgdGVjaG5pY2FsIGtleXMsIElzQWN0aXZlRW50aXR5IHdpbGwgYmUgcHJlc2VudC4gV2UgbmVlZCB0byByZW1vdmUgaXQgYXMgd2UncmUgYWxyZWFkeSBhZGRpbmcgdGhlbSBhdCB0aGUgZW5kLlxuXHRcdGlmIChzZW1hbnRpY0tleXMuaW5jbHVkZXMoXCJJc0FjdGl2ZUVudGl0eVwiKSkge1xuXHRcdFx0ZmluYWxLZXlzID0gc2VtYW50aWNLZXlzLmZpbHRlcigoc2luZ2xlS2V5KSA9PiBzaW5nbGVLZXkuaW5kZXhPZihcIklzQWN0aXZlRW50aXR5XCIpIDwgMCk7XG5cdFx0XHRmaW5hbEtleVZhbHVlcyA9IGtleVZhbHVlcy5maWx0ZXIoKGVsZW1lbnQpID0+ICFlbGVtZW50LnN0YXJ0c1dpdGgoXCJJc0FjdGl2ZUVudGl0eVwiKSk7XG5cdFx0fVxuXG5cdFx0aWYgKGZpbmFsS2V5cy5sZW5ndGggIT0gZmluYWxLZXlWYWx1ZXMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRjb25zdCBmaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlID0gTW9kZWxIZWxwZXIuaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlKG1ldGFNb2RlbCk7XG5cdFx0bGV0IGZpbHRlcnM6IEZpbHRlcltdO1xuXHRcdGlmIChmaW5hbEtleXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHQvLyBJZiB0aGlzIGlzIGEgdGVjaG5pY2FsIGtleSwgdGhlIGVxdWFsIGlzIHByZXNlbnQgYmVjYXVzZSB0aGVyZSdzIGF0IGxlYXN0IDIgcGFyYW1ldGVycywgYSB0ZWNobmljYWwga2V5IGFuZCBJc0FjdGl2ZUVudGl0eVxuXHRcdFx0aWYgKGZpbmFsS2V5VmFsdWVzWzBdLmluZGV4T2YoXCI9XCIpID4gMCkge1xuXHRcdFx0XHRjb25zdCBrZXlQYXJ0ID0gZmluYWxLZXlWYWx1ZXNbMF0uc3BsaXQoXCI9XCIpO1xuXHRcdFx0XHRmaW5hbEtleVZhbHVlc1swXSA9IGtleVBhcnRbMV07XG5cdFx0XHR9XG5cdFx0XHQvLyBUYWtlIHRoZSBmaXJzdCBrZXkgdmFsdWVcblx0XHRcdGNvbnN0IGtleVZhbHVlID0gdW5xdW90ZUFuZERlY29kZShmaW5hbEtleVZhbHVlc1swXSk7XG5cdFx0XHRmaWx0ZXJzID0gW1xuXHRcdFx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRwYXRoOiBmaW5hbEtleXNbMF0sXG5cdFx0XHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLFxuXHRcdFx0XHRcdHZhbHVlMToga2V5VmFsdWUsXG5cdFx0XHRcdFx0Y2FzZVNlbnNpdGl2ZTogZmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZVxuXHRcdFx0XHR9KVxuXHRcdFx0XTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgbUtleVZhbHVlczogYW55ID0ge307XG5cdFx0XHQvLyBDcmVhdGUgYSBtYXAgb2YgYWxsIGtleSB2YWx1ZXNcblx0XHRcdGZpbmFsS2V5VmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKHNLZXlBc3NpZ25tZW50OiBzdHJpbmcpIHtcblx0XHRcdFx0Y29uc3QgYVBhcnRzID0gc0tleUFzc2lnbm1lbnQuc3BsaXQoXCI9XCIpLFxuXHRcdFx0XHRcdGtleVZhbHVlID0gdW5xdW90ZUFuZERlY29kZShhUGFydHNbMV0pO1xuXG5cdFx0XHRcdG1LZXlWYWx1ZXNbYVBhcnRzWzBdXSA9IGtleVZhbHVlO1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBmYWlsZWQgPSBmYWxzZTtcblx0XHRcdGZpbHRlcnMgPSBmaW5hbEtleXMubWFwKGZ1bmN0aW9uIChzZW1hbnRpY0tleSkge1xuXHRcdFx0XHRjb25zdCBrZXkgPSBzZW1hbnRpY0tleSxcblx0XHRcdFx0XHR2YWx1ZSA9IG1LZXlWYWx1ZXNba2V5XTtcblxuXHRcdFx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRcdHBhdGg6IGtleSxcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSxcblx0XHRcdFx0XHRcdHZhbHVlMTogdmFsdWUsXG5cdFx0XHRcdFx0XHRjYXNlU2Vuc2l0aXZlOiBmaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0ZmFpbGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7XG5cdFx0XHRcdFx0XHRwYXRoOiBcIlhYXCJcblx0XHRcdFx0XHR9KTsgLy8gd2lsbCBiZSBpZ25vcmVkIGFueXdheSBzaW5jZSB3ZSByZXR1cm4gYWZ0ZXJcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGlmIChmYWlsZWQpIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gQWRkIGEgZHJhZnQgZmlsdGVyIHRvIG1ha2Ugc3VyZSB3ZSB0YWtlIHRoZSBkcmFmdCBlbnRpdHkgaWYgdGhlcmUgaXMgb25lXG5cdFx0Ly8gT3IgdGhlIGFjdGl2ZSBlbnRpdHkgb3RoZXJ3aXNlXG5cdFx0Y29uc3QgZHJhZnRGaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IFtuZXcgRmlsdGVyKFwiSXNBY3RpdmVFbnRpdHlcIiwgXCJFUVwiLCBmYWxzZSksIG5ldyBGaWx0ZXIoXCJTaWJsaW5nRW50aXR5L0lzQWN0aXZlRW50aXR5XCIsIFwiRVFcIiwgbnVsbCldLFxuXHRcdFx0YW5kOiBmYWxzZVxuXHRcdH0pO1xuXHRcdGZpbHRlcnMucHVzaChkcmFmdEZpbHRlcik7XG5cblx0XHRyZXR1cm4gbmV3IEZpbHRlcihmaWx0ZXJzLCB0cnVlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIHBhdGggd2l0aCBzZW1hbnRpYyBrZXlzIHRvIGEgcGF0aCB3aXRoIHRlY2huaWNhbCBrZXlzLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aFdpdGhQYXJhbWV0ZXJzIFRoZSBwYXRoIHdpdGggc2VtYW50aWMga2V5c1xuXHQgKiBAcGFyYW0gbW9kZWwgVGhlIG1vZGVsIGZvciB0aGUgcGF0aFxuXHQgKiBAcGFyYW0ga2V5cyBUaGUgc2VtYW50aWMgb3IgdGVjaG5pY2FsIGtleXMgZm9yIHRoZSBwYXRoXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBjb250YWluaW5nIHRoZSBwYXRoIHdpdGggdGVjaG5pY2FsIGtleXMgaWYgcGF0aFdpdGhQYXJhbWV0ZXJzIGNvdWxkIGJlIGludGVycHJldGVkIGFzIGEgdGVjaG5pY2FsIHBhdGgsIG51bGwgb3RoZXJ3aXNlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YXN5bmMgZ2V0VGVjaG5pY2FsUGF0aEZyb21QYXRoKHBhdGhXaXRoUGFyYW1ldGVyczogc3RyaW5nLCBtb2RlbDogT0RhdGFNb2RlbCwga2V5czogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcblx0XHRjb25zdCBtZXRhTW9kZWwgPSBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRsZXQgZW50aXR5U2V0UGF0aCA9IG1ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChwYXRoV2l0aFBhcmFtZXRlcnMpLmdldFBhdGgoKTtcblxuXHRcdGlmICgha2V5cyB8fCBrZXlzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Ly8gTm8gc2VtYW50aWMvdGVjaG5pY2FsIGtleXNcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdC8vIENyZWF0ZSBhIHNldCBvZiBmaWx0ZXJzIGNvcnJlc3BvbmRpbmcgdG8gYWxsIGtleXNcblx0XHRjb25zdCBmaWx0ZXIgPSB0aGlzLmNyZWF0ZUZpbHRlckZyb21QYXRoKHBhdGhXaXRoUGFyYW1ldGVycywga2V5cywgbWV0YU1vZGVsKTtcblx0XHRpZiAoZmlsdGVyID09PSBudWxsKSB7XG5cdFx0XHQvLyBDb3VsZG4ndCBpbnRlcnByZXQgdGhlIHBhdGggYXMgYSBzZW1hbnRpYyBvbmVcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblxuXHRcdC8vIExvYWQgdGhlIGNvcnJlc3BvbmRpbmcgb2JqZWN0XG5cdFx0aWYgKCFlbnRpdHlTZXRQYXRoPy5zdGFydHNXaXRoKFwiL1wiKSkge1xuXHRcdFx0ZW50aXR5U2V0UGF0aCA9IGAvJHtlbnRpdHlTZXRQYXRofWA7XG5cdFx0fVxuXHRcdGNvbnN0IGxpc3RCaW5kaW5nID0gbW9kZWwuYmluZExpc3QoZW50aXR5U2V0UGF0aCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZpbHRlciwge1xuXHRcdFx0JCRncm91cElkOiBcIiRhdXRvLkhlcm9lc1wiXG5cdFx0fSk7XG5cblx0XHRjb25zdCBjb250ZXh0cyA9IGF3YWl0IGxpc3RCaW5kaW5nLnJlcXVlc3RDb250ZXh0cygwLCAyKTtcblx0XHRpZiAoY29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHRyZXR1cm4gY29udGV4dHNbMF0uZ2V0UGF0aCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBObyBkYXRhIGNvdWxkIGJlIGxvYWRlZFxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlZnJlc2hlcyBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBtb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHBhcmFtIHBhdGhUb1JlcGxhY2VXaXRoIFRoZSBwYXRoIHRvIHRoZSBuZXcgY29udGV4dFxuXHQgKiBAcGFyYW0gY29udGV4dFRvUmVtb3ZlIFRoZSBpbml0aWFsIGNvbnRleHQgdGhhdCBpcyBnb2luZyB0byBiZSByZXBsYWNlZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YXN5bmMgcmVmcmVzaENvbnRleHQobW9kZWw6IE9EYXRhTW9kZWwsIHBhdGhUb1JlcGxhY2VXaXRoOiBzdHJpbmcsIGNvbnRleHRUb1JlbW92ZTogQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHJvb3RWaWV3Q29udHJvbGxlciA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCk7XG5cdFx0aWYgKHJvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0Y29uc3QgY29udGV4dFRvUmVwbGFjZVdpdGggPSBtb2RlbC5nZXRLZWVwQWxpdmVDb250ZXh0KHBhdGhUb1JlcGxhY2VXaXRoKTtcblx0XHRcdGNvbnRleHRUb1JlbW92ZS5yZXBsYWNlV2l0aChjb250ZXh0VG9SZXBsYWNlV2l0aCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYSBwYXRoIGlzIGEgcm9vdCBkcmFmdC5cblx0ICpcblx0ICogQHBhcmFtIHBhdGggVGhlIHBhdGggdG8gdGVzdFxuXHQgKiBAcGFyYW0gbWV0YU1vZGVsIFRoZSBhc3NvY2lhdGVkIG1ldGFkYXRhIG1vZGVsXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgcGF0aCBpcyBhIHJvb3QgcGF0aFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGNoZWNrRHJhZnRBdmFpbGFiaWxpdHkocGF0aDogc3RyaW5nLCBtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgbWF0Y2hlcyA9IC9eWy9dPyhcXHcrKVxcKFteL10rXFwpJC8uZXhlYyhwYXRoKTtcblx0XHRpZiAoIW1hdGNoZXMpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Ly8gR2V0IHRoZSBlbnRpdHlTZXQgbmFtZVxuXHRcdGNvbnN0IGVudGl0eVNldFBhdGggPSBgLyR7bWF0Y2hlc1sxXX1gO1xuXHRcdC8vIENoZWNrIHRoZSBlbnRpdHkgc2V0IHN1cHBvcnRzIGRyYWZ0XG5cdFx0Y29uc3QgZHJhZnRSb290ID0gbWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YCk7XG5cdFx0cmV0dXJuIGRyYWZ0Um9vdCA/IHRydWUgOiBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBCdWlsZHMgYSBwYXRoIHRvIG5hdmlnYXRlIHRvIGZyb20gYSBwYXRoIHdpdGggU2VtYW50aWNLZXlzIG9yIHRlY2huaWNhbCBrZXlzLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aFRvUmVzb2x2ZSBUaGUgcGF0aCB0byBiZSB0cmFuc2Zvcm1lZFxuXHQgKiBAcGFyYW0gbW9kZWwgVGhlIE9EYXRhIG1vZGVsXG5cdCAqIEBwYXJhbSBuYXZpZ2F0aW9uUGFyYW1ldGVyIFRoZSBwYXJhbWV0ZXIgb2YgdGhlIG5hdmlnYXRpb25cblx0ICogQHJldHVybnMgU3RyaW5nIHByb21pc2UgZm9yIHRoZSBuZXcgcGF0aC4gSWYgcGF0aFRvUmVzb2x2ZSBjb3VsZG4ndCBiZSBpbnRlcnByZXRlZCBhcyBhIHNlbWFudGljIHBhdGgsIGl0IGlzIHJldHVybmVkIGFzIGlzLlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFzeW5jIHJlc29sdmVQYXRoKHBhdGhUb1Jlc29sdmU6IHN0cmluZywgbW9kZWw6IE9EYXRhTW9kZWwsIG5hdmlnYXRpb25QYXJhbWV0ZXI6IFJvdXRpbmdOYXZpZ2F0aW9uSW5mbyk6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gbW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3QgbGFzdFNlbWFudGljTWFwcGluZyA9IHRoaXMuX29Sb3V0aW5nU2VydmljZS5nZXRMYXN0U2VtYW50aWNNYXBwaW5nKCk7XG5cdFx0bGV0IGN1cnJlbnRIYXNoTm9QYXJhbXMgPSB0aGlzLl9vUm91dGVyLmdldEhhc2hDaGFuZ2VyKCkuZ2V0SGFzaCgpLnNwbGl0KFwiP1wiKVswXTtcblxuXHRcdGlmIChjdXJyZW50SGFzaE5vUGFyYW1zPy5sYXN0SW5kZXhPZihcIi9cIikgPT09IGN1cnJlbnRIYXNoTm9QYXJhbXM/Lmxlbmd0aCAtIDEpIHtcblx0XHRcdC8vIFJlbW92ZSB0cmFpbGluZyAnLydcblx0XHRcdGN1cnJlbnRIYXNoTm9QYXJhbXMgPSBjdXJyZW50SGFzaE5vUGFyYW1zLnN1YnN0cmluZygwLCBjdXJyZW50SGFzaE5vUGFyYW1zLmxlbmd0aCAtIDEpO1xuXHRcdH1cblxuXHRcdGxldCByb290RW50aXR5TmFtZSA9IGN1cnJlbnRIYXNoTm9QYXJhbXM/LnN1YnN0cigwLCBjdXJyZW50SGFzaE5vUGFyYW1zLmluZGV4T2YoXCIoXCIpKTtcblx0XHRpZiAocm9vdEVudGl0eU5hbWUuaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRcdHJvb3RFbnRpdHlOYW1lID0gcm9vdEVudGl0eU5hbWUuc3Vic3RyaW5nKDEpO1xuXHRcdH1cblx0XHRjb25zdCBpc1Jvb3REcmFmdCA9IHRoaXMuY2hlY2tEcmFmdEF2YWlsYWJpbGl0eShjdXJyZW50SGFzaE5vUGFyYW1zLCBtZXRhTW9kZWwpLFxuXHRcdFx0c2VtYW50aWNLZXlzID0gaXNSb290RHJhZnRcblx0XHRcdFx0PyAoU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNLZXlzKG1ldGFNb2RlbCwgcm9vdEVudGl0eU5hbWUpIGFzIHsgJFByb3BlcnR5UGF0aDogc3RyaW5nIH1bXSlcblx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0XHRpc0NvbGxhYm9yYXRpb25FbmFibGVkID0gTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQobWV0YU1vZGVsKTtcblxuXHRcdC8qKlxuXHRcdCAqIElmIHRoZSBlbnRpdHkgaXMgZHJhZnQgZW5hYmxlZCwgYW5kIHdlJ3JlIGluIGEgY29sbGFib3JhdGlvbiBhcHBsaWNhdGlvbiwgYW5kIHdlJ3JlIG5hdmlnYXRpbmcgdG8gYSBkcmFmdCwgd2UncmUgdHJlYXRpbmcgaXQgYXMgYSBuZXcgcGF0aC5cblx0XHQgKiBXZSB3YW50IHRvIGNoZWNrIGlmIHRoZSBkcmFmdCBleGlzdHMgZmlyc3QsIHRoZW4gd2UgbmF2aWdhdGUgb24gaXQgaWYgaXQgZG9lcyBleGlzdCwgb3RoZXJ3aXNlIHdlIG5hdmlnYXRlIHRvIHRoZSBzYXZlZCB2ZXJzaW9uLlxuXHRcdCAqL1xuXHRcdGlmIChpc1Jvb3REcmFmdCAmJiBpc0NvbGxhYm9yYXRpb25FbmFibGVkKSB7XG5cdFx0XHRjb25zdCBpc0FjdGl2ZUVudGl0eSA9IG5hdmlnYXRpb25QYXJhbWV0ZXI/LnVzZUNvbnRleHQ/LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikgPz8gdHJ1ZTtcblx0XHRcdGlmICghaXNBY3RpdmVFbnRpdHkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucmVzb2x2ZUNvbGxhYm9yYXRpb25QYXRoKHBhdGhUb1Jlc29sdmUsIG1vZGVsLCBuYXZpZ2F0aW9uUGFyYW1ldGVyLCBzZW1hbnRpY0tleXMsIHJvb3RFbnRpdHlOYW1lKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogVGhpcyBpcyB0aGUgJ25vcm1hbCcgcHJvY2Vzcy5cblx0XHQgKiBJZiB3ZSBkb24ndCBoYXZlIHNlbWFudGljIGtleXMsIHRoZSBwYXRoIHdlIGhhdmUgaXMgdGVjaG5pY2FsIGFuZCBjYW4gYmUgdXNlZCBhcyBpcy5cblx0XHQgKiBJZiB0aGUgcGF0aCB0byByZXNvbHZlIGlzIHRoZSBzYW1lIGFzIHRoZSBzZW1hbnRpYyBwYXRoLCB0aGVuIHdlIGtub3cgaXMgaGFzIGJlZW4gcmVzb2x2ZWQgcHJldmlvdXNseSBhbmQgd2UgY2FuIHJldHVybiB0aGUgdGVjaG5pY2FsIHBhdGhcblx0XHQgKiBPdGhlcndpc2UsIHdlIG5lZWQgdG8gZXZhbHVhdGUgdGhlIHRlY2huaWNhbCBwYXRoLCB0byBzZXQgdXAgdGhlIHNlbWFudGljIG1hcHBpbmcgKGlmIGl0J3MgYmVlbiByZXNvbHZlZCkuXG5cdFx0ICovXG5cdFx0aWYgKHNlbWFudGljS2V5cyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gcGF0aFRvUmVzb2x2ZTtcblx0XHR9XG5cdFx0aWYgKGxhc3RTZW1hbnRpY01hcHBpbmc/LnNlbWFudGljUGF0aCA9PT0gcGF0aFRvUmVzb2x2ZSkge1xuXHRcdFx0Ly8gVGhpcyBzZW1hbnRpYyBwYXRoIGhhcyBiZWVuIHJlc29sdmVkIHByZXZpb3VzbHlcblx0XHRcdHJldHVybiBsYXN0U2VtYW50aWNNYXBwaW5nLnRlY2huaWNhbFBhdGg7XG5cdFx0fVxuXHRcdGNvbnN0IGZvcm1hdHRlZFNlbWFudGljS2V5cyA9IHNlbWFudGljS2V5cy5tYXAoKHNpbmdsZUtleSkgPT4gc2luZ2xlS2V5LiRQcm9wZXJ0eVBhdGgpO1xuXG5cdFx0Ly8gV2UgbmVlZCByZXNvbHZlIHRoZSBzZW1hbnRpYyBwYXRoIHRvIGdldCB0aGUgdGVjaG5pY2FsIGtleXNcblx0XHRjb25zdCB0ZWNobmljYWxQYXRoID0gYXdhaXQgdGhpcy5nZXRUZWNobmljYWxQYXRoRnJvbVBhdGgoY3VycmVudEhhc2hOb1BhcmFtcywgbW9kZWwsIGZvcm1hdHRlZFNlbWFudGljS2V5cyk7XG5cblx0XHRpZiAodGVjaG5pY2FsUGF0aCAmJiB0ZWNobmljYWxQYXRoICE9PSBwYXRoVG9SZXNvbHZlKSB7XG5cdFx0XHQvLyBUaGUgc2VtYW50aWMgcGF0aCB3YXMgcmVzb2x2ZWQgKG90aGVyd2lzZSBrZWVwIHRoZSBvcmlnaW5hbCB2YWx1ZSBmb3IgdGFyZ2V0KVxuXHRcdFx0dGhpcy5fb1JvdXRpbmdTZXJ2aWNlLnNldExhc3RTZW1hbnRpY01hcHBpbmcoe1xuXHRcdFx0XHR0ZWNobmljYWxQYXRoOiB0ZWNobmljYWxQYXRoLFxuXHRcdFx0XHRzZW1hbnRpY1BhdGg6IHBhdGhUb1Jlc29sdmVcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHRlY2huaWNhbFBhdGg7XG5cdFx0fVxuXHRcdHJldHVybiBwYXRoVG9SZXNvbHZlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV2YWx1YXRlIHRoZSBwYXRoIHRvIG5hdmlnYXRlIHdoZW4gd2UncmUgaW4gYSBjb2xsYWJvcmF0aW9uIGFwcGxpY2F0aW9uIGFuZCBuYXZpZ2F0aW5nIHRvIGEgZHJhZnQuXG5cdCAqIElmIHRoZSBkcmFmdCBoYXMgYmVlbiBkaXNjYXJkZWQsIHdlIGNoYW5nZSB0aGUgcGF0aCB0byB0aGUgc2libGluZyBlbGVtZW50IGFzc29jaWF0ZWQsIG90aGVyd2lzZSB3ZSBrZWVwIHRoZSBzYW1lIHBhdGguXG5cdCAqIFdlJ3JlIG5vdCBkb2luZyBpdCBvdXRzaWRlIG9mIGNvbGxhYm9yYXRpb24gYXMgaXQncyBhZGRpbmcgYSByZXF1ZXN0IGR1cmluZyBuYXZpZ2F0aW9uIVxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aFRvUmVzb2x2ZSBUaGUgcGF0aCB3ZSdyZSBjaGVja2luZy4gSWYgdGhlIGRyYWZ0IGV4aXN0cywgd2UgcmV0dXJuIGl0IGFzIGlzLCBvdGhlcndpc2Ugd2UgcmV0dXJuIHRoZSBzaWJsaW5nIGVsZW1lbnQgYXNzb2NpYXRlZFxuXHQgKiBAcGFyYW0gbW9kZWwgVGhlIG9EYXRhIG1vZGVsXG5cdCAqIEBwYXJhbSBuYXZpZ2F0aW9uUGFyYW1ldGVyIFRoZSBwYXJhbWV0ZXIgb2YgdGhlIG5hdmlnYXRpb25cblx0ICogQHBhcmFtIHNlbWFudGljS2V5cyBUaGUgc2VtYW50aWMga2V5cyBpZiB3ZSBoYXZlIHNlbWFudGljIG5hdmlnYXRpb24sIG90aGVyd2lzZSBmYWxzZVxuXHQgKiBAcGFyYW0gcm9vdEVudGl0eU5hbWUgTmFtZSBvZiB0aGUgcm9vdCBlbnRpdHlcblx0ICogQHJldHVybnMgVGhlIHBhdGggdG8gbmF2aWdhdGUgdG9cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFzeW5jIHJlc29sdmVDb2xsYWJvcmF0aW9uUGF0aChcblx0XHRwYXRoVG9SZXNvbHZlOiBzdHJpbmcsXG5cdFx0bW9kZWw6IE9EYXRhTW9kZWwsXG5cdFx0bmF2aWdhdGlvblBhcmFtZXRlcjogUm91dGluZ05hdmlnYXRpb25JbmZvLFxuXHRcdHNlbWFudGljS2V5czogeyAkUHJvcGVydHlQYXRoOiBzdHJpbmcgfVtdIHwgdW5kZWZpbmVkLFxuXHRcdHJvb3RFbnRpdHlOYW1lOiBzdHJpbmdcblx0KTogUHJvbWlzZTxzdHJpbmc+IHtcblx0XHRjb25zdCBsYXN0U2VtYW50aWNNYXBwaW5nID0gdGhpcy5fb1JvdXRpbmdTZXJ2aWNlLmdldExhc3RTZW1hbnRpY01hcHBpbmcoKTtcblx0XHRjb25zdCBtZXRhTW9kZWwgPSBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBjdXJyZW50SGFzaE5vUGFyYW1zID0gdGhpcy5fb1JvdXRlci5nZXRIYXNoQ2hhbmdlcigpLmdldEhhc2goKS5zcGxpdChcIj9cIilbMF07XG5cdFx0bGV0IGZvcm1hdHRlZEtleXM6IHN0cmluZ1tdO1xuXHRcdGNvbnN0IGNvbXBhcmF0aXZlUGF0aCA9IGxhc3RTZW1hbnRpY01hcHBpbmc/LnRlY2huaWNhbFBhdGggPz8gcGF0aFRvUmVzb2x2ZTtcblx0XHRpZiAoc2VtYW50aWNLZXlzKSB7XG5cdFx0XHRmb3JtYXR0ZWRLZXlzID0gc2VtYW50aWNLZXlzLm1hcCgoc2luZ2xlS2V5KSA9PiBzaW5nbGVLZXkuJFByb3BlcnR5UGF0aCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvcm1hdHRlZEtleXMgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtyb290RW50aXR5TmFtZX0vJFR5cGUvJEtleWApO1xuXHRcdH1cblxuXHRcdGNvbnN0IHRlY2huaWNhbFBhdGggPSBhd2FpdCB0aGlzLmdldFRlY2huaWNhbFBhdGhGcm9tUGF0aChjdXJyZW50SGFzaE5vUGFyYW1zLCBtb2RlbCwgZm9ybWF0dGVkS2V5cyk7XG5cdFx0aWYgKHRlY2huaWNhbFBhdGggPT09IG51bGwpIHtcblx0XHRcdHJldHVybiBwYXRoVG9SZXNvbHZlO1xuXHRcdH1cblx0XHQvLyBDb21wYXJpbmcgcGF0aCB0aGF0IHdhcyByZXR1cm5lZCBmcm9tIHRoZSBzZXJ2ZXIgd2l0aCB0aGUgb25lIHdlIGhhdmUuIElmIHRoZXkgYXJlIGRpZmZlcmVudCwgaXQgbWVhbnMgdGhlIGRyYWZ0IGRvZXNuJ3QgZXhpc3QuXG5cdFx0aWYgKHRlY2huaWNhbFBhdGggIT09IGNvbXBhcmF0aXZlUGF0aCAmJiBuYXZpZ2F0aW9uUGFyYW1ldGVyLnVzZUNvbnRleHQpIHtcblx0XHRcdGlmIChsYXN0U2VtYW50aWNNYXBwaW5nKSB7XG5cdFx0XHRcdHRoaXMuX29Sb3V0aW5nU2VydmljZS5zZXRMYXN0U2VtYW50aWNNYXBwaW5nKHtcblx0XHRcdFx0XHR0ZWNobmljYWxQYXRoOiB0ZWNobmljYWxQYXRoLFxuXHRcdFx0XHRcdHNlbWFudGljUGF0aDogcGF0aFRvUmVzb2x2ZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdG5hdmlnYXRpb25QYXJhbWV0ZXIucmVkaXJlY3RlZFRvTm9uRHJhZnQgPVxuXHRcdFx0XHRtZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtyb290RW50aXR5TmFtZX0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm9gKT8uVHlwZU5hbWUgPz8gcm9vdEVudGl0eU5hbWU7XG5cdFx0XHRhd2FpdCB0aGlzLnJlZnJlc2hDb250ZXh0KG1vZGVsLCB0ZWNobmljYWxQYXRoLCBuYXZpZ2F0aW9uUGFyYW1ldGVyLnVzZUNvbnRleHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGVjaG5pY2FsUGF0aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhZ2UgZnJvbSBhIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBzVGFyZ2V0UGF0aCBUaGUgcGF0aCB0byBidWlsZCB0aGUgY29udGV4dC4gTmVlZHMgdG8gY29udGFpbiB0ZWNobmljYWwga2V5cyBvbmx5LlxuXHQgKiBAcGFyYW0gb01vZGVsIFRoZSBPRGF0YSBtb2RlbFxuXHQgKiBAcGFyYW0gb05hdmlnYXRpb25QYXJhbWV0ZXJzIE5hdmlnYXRpb24gcGFyYW1ldGVyc1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9iaW5kUGFnZVRvUGF0aChzVGFyZ2V0UGF0aDogc3RyaW5nLCBvTW9kZWw6IE9EYXRhTW9kZWwsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyczogUm91dGluZ05hdmlnYXRpb25JbmZvKSB7XG5cdFx0Y29uc3Qgb0N1cnJlbnRDb250ZXh0ID0gdGhpcy5fZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdHNDdXJyZW50UGF0aCA9IG9DdXJyZW50Q29udGV4dCAmJiBvQ3VycmVudENvbnRleHQuZ2V0UGF0aCgpLFxuXHRcdFx0b1VzZUNvbnRleHQgPSBvTmF2aWdhdGlvblBhcmFtZXRlcnMudXNlQ29udGV4dCBhcyBDb250ZXh0IHwgdW5kZWZpbmVkIHwgbnVsbDtcblxuXHRcdC8vIFdlIHNldCB0aGUgYmluZGluZyBjb250ZXh0IG9ubHkgaWYgaXQncyBkaWZmZXJlbnQgZnJvbSB0aGUgY3VycmVudCBvbmVcblx0XHQvLyBvciBpZiB3ZSBoYXZlIGEgY29udGV4dCBhbHJlYWR5IHNlbGVjdGVkXG5cdFx0aWYgKG9Vc2VDb250ZXh0ICYmIG9Vc2VDb250ZXh0LmdldFBhdGgoKSA9PT0gc1RhcmdldFBhdGgpIHtcblx0XHRcdGlmIChvVXNlQ29udGV4dCAhPT0gb0N1cnJlbnRDb250ZXh0KSB7XG5cdFx0XHRcdGxldCBzaG91bGRSZWZyZXNoQ29udGV4dCA9IGZhbHNlO1xuXHRcdFx0XHQvLyBXZSBhbHJlYWR5IGhhdmUgdGhlIGNvbnRleHQgdG8gYmUgdXNlZCwgYW5kIGl0J3Mgbm90IHRoZSBjdXJyZW50IG9uZVxuXHRcdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fb0FwcENvbXBvbmVudC5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblxuXHRcdFx0XHQvLyBJbiBjYXNlIG9mIEZDTCwgaWYgd2UncmUgcmV1c2luZyBhIGNvbnRleHQgZnJvbSBhIHRhYmxlICh0aHJvdWdoIG5hdmlnYXRpb24pLCB3ZSByZWZyZXNoIGl0IHRvIGF2b2lkIG91dGRhdGVkIGRhdGFcblx0XHRcdFx0Ly8gV2UgZG9uJ3Qgd2FpdCBmb3IgdGhlIHJlZnJlc2ggdG8gYmUgY29tcGxldGVkIChyZXF1ZXN0UmVmcmVzaCksIHNvIHRoYXQgdGhlIGNvcnJlc3BvbmRpbmcgcXVlcnkgZ29lcyBpbnRvIHRoZSBzYW1lXG5cdFx0XHRcdC8vIGJhdGNoIGFzIHRoZSBvbmVzIGZyb20gY29udHJvbHMgaW4gdGhlIHBhZ2UuXG5cdFx0XHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpICYmIG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWFzb24gPT09IE5hdmlnYXRpb25SZWFzb24uUm93UHJlc3MpIHtcblx0XHRcdFx0XHRjb25zdCBtZXRhTW9kZWwgPSBvVXNlQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRcdGlmICghb1VzZUNvbnRleHQuZ2V0QmluZGluZygpLmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0XHRcdHNob3VsZFJlZnJlc2hDb250ZXh0ID0gdHJ1ZTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0QWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKHRoaXMuZ2V0VmlldygpKSB8fFxuXHRcdFx0XHRcdFx0KE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQobWV0YU1vZGVsLCBvVXNlQ29udGV4dC5nZXRQYXRoKCkpICYmXG5cdFx0XHRcdFx0XHRcdE1vZGVsSGVscGVyLmlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkKG1ldGFNb2RlbCkpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHQvLyBJZiB0aGVyZSBhcmUgcGVuZGluZyBjaGFuZ2VzIGJ1dCB3ZSdyZSBpbiBjb2xsYWJvcmF0aW9uIGRyYWZ0LCB3ZSBmb3JjZSB0aGUgcmVmcmVzaCAoZGlzY2FyZGluZyBwZW5kaW5nIGNoYW5nZXMpIGFzIHdlIG5lZWQgdG8gaGF2ZSB0aGUgbGF0ZXN0IHZlcnNpb24uXG5cdFx0XHRcdFx0XHQvLyBXaGVuIG5hdmlnYXRpbmcgZnJvbSBMUiB0byBPUCwgdGhlIHZpZXcgaXMgbm90IGNvbm5lY3RlZCB5ZXQgLS0+IGNoZWNrIGlmIHdlJ3JlIGluIGRyYWZ0IHdpdGggY29sbGFib3JhdGlvbiBmcm9tIHRoZSBtZXRhbW9kZWxcblx0XHRcdFx0XHRcdG9Vc2VDb250ZXh0LmdldEJpbmRpbmcoKS5yZXNldENoYW5nZXMoKTtcblx0XHRcdFx0XHRcdHNob3VsZFJlZnJlc2hDb250ZXh0ID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5fYmluZFBhZ2VUb0NvbnRleHQob1VzZUNvbnRleHQsIG9Nb2RlbCwgb05hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHRcdFx0aWYgKHNob3VsZFJlZnJlc2hDb250ZXh0KSB7XG5cdFx0XHRcdFx0b1VzZUNvbnRleHQucmVmcmVzaCgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChzQ3VycmVudFBhdGggIT09IHNUYXJnZXRQYXRoKSB7XG5cdFx0XHQvLyBXZSBuZWVkIHRvIGNyZWF0ZSBhIG5ldyBjb250ZXh0IGZvciBpdHMgcGF0aFxuXHRcdFx0dGhpcy5fYmluZFBhZ2VUb0NvbnRleHQodGhpcy5fY3JlYXRlQ29udGV4dChzVGFyZ2V0UGF0aCwgb01vZGVsKSwgb01vZGVsLCBvTmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdH0gZWxzZSBpZiAob05hdmlnYXRpb25QYXJhbWV0ZXJzLnJlYXNvbiAhPT0gTmF2aWdhdGlvblJlYXNvbi5BcHBTdGF0ZUNoYW5nZWQgJiYgRWRpdFN0YXRlLmlzRWRpdFN0YXRlRGlydHkoKSkge1xuXHRcdFx0dGhpcy5fcmVmcmVzaEJpbmRpbmdDb250ZXh0KG9DdXJyZW50Q29udGV4dCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEJpbmRzIHRoZSBwYWdlIHRvIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgYm91bmRcblx0ICogQHBhcmFtIG9Nb2RlbCBUaGUgT0RhdGEgbW9kZWxcblx0ICogQHBhcmFtIG9OYXZpZ2F0aW9uUGFyYW1ldGVycyBOYXZpZ2F0aW9uIHBhcmFtZXRlcnNcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfYmluZFBhZ2VUb0NvbnRleHQob0NvbnRleHQ6IENvbnRleHQgfCBudWxsLCBvTW9kZWw6IE9EYXRhTW9kZWwsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyczogUm91dGluZ05hdmlnYXRpb25JbmZvKSB7XG5cdFx0aWYgKCFvQ29udGV4dCkge1xuXHRcdFx0dGhpcy5vbkJlZm9yZUJpbmRpbmcobnVsbCk7XG5cdFx0XHR0aGlzLm9uQWZ0ZXJCaW5kaW5nKG51bGwpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9QYXJlbnRMaXN0QmluZGluZyA9IG9Db250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gKHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblx0XHRpZiAob1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0aWYgKCFvUGFyZW50TGlzdEJpbmRpbmcgfHwgIW9QYXJlbnRMaXN0QmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0XHQvLyBpZiB0aGUgcGFyZW50QmluZGluZyBpcyBub3QgYSBsaXN0QmluZGluZywgd2UgY3JlYXRlIGEgbmV3IGNvbnRleHRcblx0XHRcdFx0b0NvbnRleHQgPSB0aGlzLl9jcmVhdGVDb250ZXh0KG9Db250ZXh0LmdldFBhdGgoKSwgb01vZGVsKTtcblx0XHRcdH1cblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0dGhpcy5fc2V0S2VlcEFsaXZlKFxuXHRcdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKG9Sb290Vmlld0NvbnRyb2xsZXIuaXNDb250ZXh0VXNlZEluUGFnZXMob0NvbnRleHQpKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dHJ1ZSAvLyBMb2FkIG1lc3NhZ2VzLCBvdGhlcndpc2UgdGhleSBkb24ndCBnZXQgcmVmcmVzaGVkIGxhdGVyLCBlLmcuIGZvciBzaWRlIGVmZmVjdHNcblx0XHRcdFx0KTtcblx0XHRcdH0gY2F0Y2ggKG9FcnJvcikge1xuXHRcdFx0XHQvLyBzZXRLZWVwQWxpdmUgdGhyb3dzIGFuIGV4Y2VwdGlvbiBpZiB0aGUgcGFyZW50IGxpc3RiaW5kaW5nIGRvZXNuJ3QgaGF2ZSAkJG93blJlcXVlc3Q9dHJ1ZVxuXHRcdFx0XHQvLyBUaGlzIGNhc2UgZm9yIGN1c3RvbSBmcmFnbWVudHMgaXMgc3VwcG9ydGVkLCBidXQgYW4gZXJyb3IgaXMgbG9nZ2VkIHRvIG1ha2UgdGhlIGxhY2sgb2Ygc3luY2hyb25pemF0aW9uIGFwcGFyZW50XG5cdFx0XHRcdExvZy5lcnJvcihcblx0XHRcdFx0XHRgVmlldyBmb3IgJHtvQ29udGV4dC5nZXRQYXRoKCl9IHdvbid0IGJlIHN5bmNocm9uaXplZC4gUGFyZW50IGxpc3RCaW5kaW5nIG11c3QgaGF2ZSBiaW5kaW5nIHBhcmFtZXRlciAkJG93blJlcXVlc3Q9dHJ1ZWBcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFvUGFyZW50TGlzdEJpbmRpbmcgfHwgb1BhcmVudExpc3RCaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHQvLyBXZSBuZWVkIHRvIHJlY3JlYXRlIHRoZSBjb250ZXh0IG90aGVyd2lzZSB3ZSBnZXQgZXJyb3JzXG5cdFx0XHRvQ29udGV4dCA9IHRoaXMuX2NyZWF0ZUNvbnRleHQob0NvbnRleHQuZ2V0UGF0aCgpLCBvTW9kZWwpO1xuXHRcdH1cblxuXHRcdC8vIFNldCB0aGUgYmluZGluZyBjb250ZXh0IHdpdGggdGhlIHByb3BlciBiZWZvcmUvYWZ0ZXIgY2FsbGJhY2tzXG5cdFx0dGhpcy5vbkJlZm9yZUJpbmRpbmcob0NvbnRleHQsIHtcblx0XHRcdGVkaXRhYmxlOiBvTmF2aWdhdGlvblBhcmFtZXRlcnMuYlRhcmdldEVkaXRhYmxlLFxuXHRcdFx0bGlzdEJpbmRpbmc6IG9QYXJlbnRMaXN0QmluZGluZyxcblx0XHRcdGJQZXJzaXN0T1BTY3JvbGw6IG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5iUGVyc2lzdE9QU2Nyb2xsLFxuXHRcdFx0YkRyYWZ0TmF2aWdhdGlvbjogb05hdmlnYXRpb25QYXJhbWV0ZXJzLmJEcmFmdE5hdmlnYXRpb24sXG5cdFx0XHRzaG93UGxhY2Vob2xkZXI6IG9OYXZpZ2F0aW9uUGFyYW1ldGVycy5iU2hvd1BsYWNlaG9sZGVyXG5cdFx0fSk7XG5cblx0XHR0aGlzLl9zZXRCaW5kaW5nQ29udGV4dChvQ29udGV4dCk7XG5cdFx0dGhpcy5vbkFmdGVyQmluZGluZyhvQ29udGV4dCwgeyByZWRpcmVjdGVkVG9Ob25EcmFmdDogb05hdmlnYXRpb25QYXJhbWV0ZXJzPy5yZWRpcmVjdGVkVG9Ob25EcmFmdCB9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgY29udGV4dCBmcm9tIGEgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIHNQYXRoIFRoZSBwYXRoXG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIE9EYXRhIG1vZGVsXG5cdCAqIEByZXR1cm5zIFRoZSBjcmVhdGVkIGNvbnRleHRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfY3JlYXRlQ29udGV4dChzUGF0aDogc3RyaW5nLCBvTW9kZWw6IE9EYXRhTW9kZWwpIHtcblx0XHRjb25zdCBvUGFnZUNvbXBvbmVudCA9IHRoaXMuX29QYWdlQ29tcG9uZW50LFxuXHRcdFx0c0VudGl0eVNldCA9IG9QYWdlQ29tcG9uZW50ICYmIG9QYWdlQ29tcG9uZW50LmdldEVudGl0eVNldCAmJiBvUGFnZUNvbXBvbmVudC5nZXRFbnRpdHlTZXQoKSxcblx0XHRcdHNDb250ZXh0UGF0aCA9XG5cdFx0XHRcdChvUGFnZUNvbXBvbmVudCAmJiBvUGFnZUNvbXBvbmVudC5nZXRDb250ZXh0UGF0aCAmJiBvUGFnZUNvbXBvbmVudC5nZXRDb250ZXh0UGF0aCgpKSB8fCAoc0VudGl0eVNldCAmJiBgLyR7c0VudGl0eVNldH1gKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRtUGFyYW1ldGVyczogYW55ID0ge1xuXHRcdFx0XHQkJGdyb3VwSWQ6IFwiJGF1dG8uSGVyb2VzXCIsXG5cdFx0XHRcdCQkdXBkYXRlR3JvdXBJZDogXCIkYXV0b1wiLFxuXHRcdFx0XHQkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzOiB0cnVlXG5cdFx0XHR9O1xuXHRcdC8vIEluIGNhc2Ugb2YgZHJhZnQ6ICRzZWxlY3QgdGhlIHN0YXRlIGZsYWdzIChIYXNBY3RpdmVFbnRpdHksIEhhc0RyYWZ0RW50aXR5LCBhbmQgSXNBY3RpdmVFbnRpdHkpXG5cdFx0Y29uc3Qgb0RyYWZ0Um9vdCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdGApO1xuXHRcdGNvbnN0IG9EcmFmdE5vZGUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVgKTtcblx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gKHRoaXMuX29BcHBDb21wb25lbnQgYXMgYW55KS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKTtcblx0XHRpZiAob1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLl9nZXRLZWVwQWxpdmVDb250ZXh0KG9Nb2RlbCwgc1BhdGgsIGZhbHNlLCBtUGFyYW1ldGVycyk7XG5cdFx0XHRpZiAoIW9Db250ZXh0KSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGNyZWF0ZSBrZWVwQWxpdmUgY29udGV4dCAke3NQYXRofWApO1xuXHRcdFx0fSBlbHNlIGlmIChvRHJhZnRSb290IHx8IG9EcmFmdE5vZGUpIHtcblx0XHRcdFx0aWYgKG9Db250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdG9Db250ZXh0LnJlcXVlc3RQcm9wZXJ0eShbXCJIYXNBY3RpdmVFbnRpdHlcIiwgXCJIYXNEcmFmdEVudGl0eVwiLCBcIklzQWN0aXZlRW50aXR5XCJdKTtcblx0XHRcdFx0XHRpZiAob0RyYWZ0Um9vdCkge1xuXHRcdFx0XHRcdFx0b0NvbnRleHQucmVxdWVzdE9iamVjdChcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB3aGVuIHN3aXRjaGluZyBiZXR3ZWVuIGRyYWZ0IGFuZCBlZGl0IHdlIG5lZWQgdG8gZW5zdXJlIHRob3NlIHByb3BlcnRpZXMgYXJlIHJlcXVlc3RlZCBhZ2FpbiBldmVuIGlmIHRoZXkgYXJlIGluIHRoZSBiaW5kaW5nJ3MgY2FjaGVcblx0XHRcdFx0XHQvLyBvdGhlcndpc2Ugd2hlbiB5b3UgZWRpdCBhbmQgZ28gdG8gdGhlIHNhdmVkIHZlcnNpb24geW91IGhhdmUgbm8gd2F5IG9mIHN3aXRjaGluZyBiYWNrIHRvIHRoZSBlZGl0IHZlcnNpb25cblx0XHRcdFx0XHRvQ29udGV4dC5yZXF1ZXN0U2lkZUVmZmVjdHMoXG5cdFx0XHRcdFx0XHRvRHJhZnRSb290XG5cdFx0XHRcdFx0XHRcdD8gW1wiSGFzQWN0aXZlRW50aXR5XCIsIFwiSGFzRHJhZnRFbnRpdHlcIiwgXCJJc0FjdGl2ZUVudGl0eVwiLCBcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCJdXG5cdFx0XHRcdFx0XHRcdDogW1wiSGFzQWN0aXZlRW50aXR5XCIsIFwiSGFzRHJhZnRFbnRpdHlcIiwgXCJJc0FjdGl2ZUVudGl0eVwiXVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIG9Db250ZXh0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoc0VudGl0eVNldCkge1xuXHRcdFx0XHRjb25zdCBzTWVzc2FnZXNQYXRoID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzLyRQYXRoYCk7XG5cdFx0XHRcdGlmIChzTWVzc2FnZXNQYXRoKSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuJHNlbGVjdCA9IHNNZXNzYWdlc1BhdGg7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSW4gY2FzZSBvZiBkcmFmdDogJHNlbGVjdCB0aGUgc3RhdGUgZmxhZ3MgKEhhc0FjdGl2ZUVudGl0eSwgSGFzRHJhZnRFbnRpdHksIGFuZCBJc0FjdGl2ZUVudGl0eSlcblx0XHRcdGlmIChvRHJhZnRSb290IHx8IG9EcmFmdE5vZGUpIHtcblx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLiRzZWxlY3QgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLiRzZWxlY3QgPSBcIkhhc0FjdGl2ZUVudGl0eSxIYXNEcmFmdEVudGl0eSxJc0FjdGl2ZUVudGl0eVwiO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLiRzZWxlY3QgKz0gXCIsSGFzQWN0aXZlRW50aXR5LEhhc0RyYWZ0RW50aXR5LElzQWN0aXZlRW50aXR5XCI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLl9vVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRcdGNvbnN0IG9QcmV2aW91c0JpbmRpbmcgPSAodGhpcy5fb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBhbnkpPy5nZXRCaW5kaW5nKCk7XG5cdFx0XHRcdG9QcmV2aW91c0JpbmRpbmdcblx0XHRcdFx0XHQ/LnJlc2V0Q2hhbmdlcygpXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0b1ByZXZpb3VzQmluZGluZy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goKG9FcnJvcjogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXNldGluZyB0aGUgY2hhbmdlcyB0byB0aGUgYmluZGluZ1wiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBvSGlkZGVuQmluZGluZyA9IG9Nb2RlbC5iaW5kQ29udGV4dChzUGF0aCwgdW5kZWZpbmVkLCBtUGFyYW1ldGVycyk7XG5cblx0XHRcdG9IaWRkZW5CaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZXF1ZXN0ZWRcIiwgKCkgPT4ge1xuXHRcdFx0XHRCdXN5TG9ja2VyLmxvY2sodGhpcy5fb1ZpZXcpO1xuXHRcdFx0fSk7XG5cdFx0XHRvSGlkZGVuQmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgdGhpcy5vbkRhdGFSZWNlaXZlZC5iaW5kKHRoaXMpKTtcblx0XHRcdHJldHVybiBvSGlkZGVuQmluZGluZy5nZXRCb3VuZENvbnRleHQoKTtcblx0XHR9XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0YXN5bmMgb25EYXRhUmVjZWl2ZWQob0V2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IHNFcnJvckRlc2NyaXB0aW9uID0gb0V2ZW50ICYmIG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJlcnJvclwiKTtcblx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZCh0aGlzLl9vVmlldykpIHtcblx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKHRoaXMuX29WaWV3KTtcblx0XHR9XG5cblx0XHRpZiAoc0Vycm9yRGVzY3JpcHRpb24pIHtcblx0XHRcdC8vIFRPRE86IGluIGNhc2Ugb2YgNDA0IHRoZSB0ZXh0IHNoYWxsIGJlIGRpZmZlcmVudFxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gYXdhaXQgQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiLCB0cnVlKTtcblx0XHRcdFx0Y29uc3QgbWVzc2FnZUhhbmRsZXIgPSB0aGlzLmJhc2UubWVzc2FnZUhhbmRsZXI7XG5cdFx0XHRcdGxldCBtUGFyYW1zID0ge307XG5cdFx0XHRcdGlmIChzRXJyb3JEZXNjcmlwdGlvbi5zdGF0dXMgPT09IDUwMykge1xuXHRcdFx0XHRcdG1QYXJhbXMgPSB7XG5cdFx0XHRcdFx0XHRpc0luaXRpYWxMb2FkNTAzRXJyb3I6IHRydWUsXG5cdFx0XHRcdFx0XHRzaGVsbEJhY2s6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9IGVsc2UgaWYgKHNFcnJvckRlc2NyaXB0aW9uLnN0YXR1cyA9PT0gNDAwKSB7XG5cdFx0XHRcdFx0bVBhcmFtcyA9IHtcblx0XHRcdFx0XHRcdHRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfREFUQV9SRUNFSVZFRF9FUlJPUl9ERVNDUklQVElPTlwiKSxcblx0XHRcdFx0XHRcdGlzRGF0YVJlY2VpdmVkRXJyb3I6IHRydWUsXG5cdFx0XHRcdFx0XHRzaGVsbEJhY2s6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1QYXJhbXMgPSB7XG5cdFx0XHRcdFx0XHR0aXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUlwiKSxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzRXJyb3JEZXNjcmlwdGlvbixcblx0XHRcdFx0XHRcdGlzRGF0YVJlY2VpdmVkRXJyb3I6IHRydWUsXG5cdFx0XHRcdFx0XHRzaGVsbEJhY2s6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcyhtUGFyYW1zKTtcblx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGdldHRpbmcgdGhlIGNvcmUgcmVzb3VyY2UgYnVuZGxlXCIsIG9FcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJlcXVlc3RzIHNpZGUgZWZmZWN0cyBvbiBhIGJpbmRpbmcgY29udGV4dCB0byBcInJlZnJlc2hcIiBpdC5cblx0ICogVE9ETzogZ2V0IHJpZCBvZiB0aGlzIG9uY2UgcHJvdmlkZWQgYnkgdGhlIG1vZGVsXG5cdCAqIGEgcmVmcmVzaCBvbiB0aGUgYmluZGluZyBjb250ZXh0IGRvZXMgbm90IHdvcmsgaW4gY2FzZSBhIGNyZWF0aW9uIHJvdyB3aXRoIGEgdHJhbnNpZW50IGNvbnRleHQgaXNcblx0ICogdXNlZC4gYWxzbyBhIHJlcXVlc3RTaWRlRWZmZWN0cyB3aXRoIGFuIGVtcHR5IHBhdGggd291bGQgZmFpbCBkdWUgdG8gdGhlIHRyYW5zaWVudCBjb250ZXh0XG5cdCAqIHRoZXJlZm9yZSB3ZSBnZXQgYWxsIGRlcGVuZGVudCBiaW5kaW5ncyAodmlhIHByaXZhdGUgbW9kZWwgbWV0aG9kKSB0byBkZXRlcm1pbmUgYWxsIHBhdGhzIGFuZCB0aGVuXG5cdCAqIHJlcXVlc3QgdGhlbS5cblx0ICpcblx0ICogQHBhcmFtIG9CaW5kaW5nQ29udGV4dCBDb250ZXh0IHRvIGJlIHJlZnJlc2hlZFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9yZWZyZXNoQmluZGluZ0NvbnRleHQob0JpbmRpbmdDb250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvUGFnZUNvbXBvbmVudCA9IHRoaXMuX29QYWdlQ29tcG9uZW50O1xuXHRcdGNvbnN0IG9TaWRlRWZmZWN0c1NlcnZpY2UgPSB0aGlzLl9vQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRcdGNvbnN0IHNSb290Q29udGV4dFBhdGggPSBvQmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IHNFbnRpdHlTZXQgPSBvUGFnZUNvbXBvbmVudCAmJiBvUGFnZUNvbXBvbmVudC5nZXRFbnRpdHlTZXQgJiYgb1BhZ2VDb21wb25lbnQuZ2V0RW50aXR5U2V0KCk7XG5cdFx0Y29uc3Qgc0NvbnRleHRQYXRoID1cblx0XHRcdChvUGFnZUNvbXBvbmVudCAmJiBvUGFnZUNvbXBvbmVudC5nZXRDb250ZXh0UGF0aCAmJiBvUGFnZUNvbXBvbmVudC5nZXRDb250ZXh0UGF0aCgpKSB8fCAoc0VudGl0eVNldCAmJiBgLyR7c0VudGl0eVNldH1gKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gdGhpcy5fb1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRsZXQgc01lc3NhZ2VzUGF0aDtcblx0XHRjb25zdCBhTmF2aWdhdGlvblByb3BlcnR5UGF0aHM6IGFueVtdID0gW107XG5cdFx0Y29uc3QgYVByb3BlcnR5UGF0aHM6IGFueVtdID0gW107XG5cdFx0Y29uc3Qgb1NpZGVFZmZlY3RzOiBTaWRlRWZmZWN0c1RhcmdldFR5cGUgPSB7XG5cdFx0XHR0YXJnZXRQcm9wZXJ0aWVzOiBbXSxcblx0XHRcdHRhcmdldEVudGl0aWVzOiBbXVxuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBnZXRCaW5kaW5nUGF0aHMob0JpbmRpbmc6IGFueSkge1xuXHRcdFx0bGV0IGFEZXBlbmRlbnRCaW5kaW5ncztcblx0XHRcdGNvbnN0IHNSZWxhdGl2ZVBhdGggPSAoKG9CaW5kaW5nLmdldENvbnRleHQoKSAmJiBvQmluZGluZy5nZXRDb250ZXh0KCkuZ2V0UGF0aCgpKSB8fCBcIlwiKS5yZXBsYWNlKHNSb290Q29udGV4dFBhdGgsIFwiXCIpOyAvLyBJZiBubyBjb250ZXh0LCB0aGlzIGlzIGFuIGFic29sdXRlIGJpbmRpbmcgc28gbm8gcmVsYXRpdmUgcGF0aFxuXHRcdFx0Y29uc3Qgc1BhdGggPSAoc1JlbGF0aXZlUGF0aCA/IGAke3NSZWxhdGl2ZVBhdGguc2xpY2UoMSl9L2AgOiBzUmVsYXRpdmVQYXRoKSArIG9CaW5kaW5nLmdldFBhdGgoKTtcblxuXHRcdFx0aWYgKG9CaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUNvbnRleHRCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdC8vIGlmIChzUGF0aCA9PT0gXCJcIikge1xuXHRcdFx0XHQvLyBub3cgZ2V0IHRoZSBkZXBlbmRlbnQgYmluZGluZ3Ncblx0XHRcdFx0YURlcGVuZGVudEJpbmRpbmdzID0gb0JpbmRpbmcuZ2V0RGVwZW5kZW50QmluZGluZ3MoKTtcblx0XHRcdFx0aWYgKGFEZXBlbmRlbnRCaW5kaW5ncykge1xuXHRcdFx0XHRcdC8vIGFzayB0aGUgZGVwZW5kZW50IGJpbmRpbmdzIChhbmQgb25seSB0aG9zZSB3aXRoIHRoZSBzcGVjaWZpZWQgZ3JvdXBJZFxuXHRcdFx0XHRcdC8vaWYgKGFEZXBlbmRlbnRCaW5kaW5ncy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhRGVwZW5kZW50QmluZGluZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdGdldEJpbmRpbmdQYXRocyhhRGVwZW5kZW50QmluZGluZ3NbaV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMuaW5kZXhPZihzUGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0YU5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhzLnB1c2goc1BhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKG9CaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdGlmIChhTmF2aWdhdGlvblByb3BlcnR5UGF0aHMuaW5kZXhPZihzUGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0YU5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhzLnB1c2goc1BhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKG9CaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YVByb3BlcnR5QmluZGluZ1wiKSkge1xuXHRcdFx0XHRpZiAoYVByb3BlcnR5UGF0aHMuaW5kZXhPZihzUGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0YVByb3BlcnR5UGF0aHMucHVzaChzUGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoc0NvbnRleHRQYXRoKSB7XG5cdFx0XHRzTWVzc2FnZXNQYXRoID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzLyRQYXRoYCk7XG5cdFx0fVxuXG5cdFx0Ly8gYmluZGluZyBvZiB0aGUgY29udGV4dCBtdXN0IGhhdmUgJCRQYXRjaFdpdGhvdXRTaWRlRWZmZWN0cyB0cnVlLCB0aGlzIGJvdW5kIGNvbnRleHQgbWF5IGJlIG5lZWRlZCB0byBiZSBmZXRjaGVkIGZyb20gdGhlIGRlcGVuZGVudCBiaW5kaW5nXG5cdFx0Z2V0QmluZGluZ1BhdGhzKG9CaW5kaW5nQ29udGV4dC5nZXRCaW5kaW5nKCkpO1xuXG5cdFx0bGV0IGk7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGFOYXZpZ2F0aW9uUHJvcGVydHlQYXRocy5sZW5ndGg7IGkrKykge1xuXHRcdFx0b1NpZGVFZmZlY3RzLnRhcmdldEVudGl0aWVzLnB1c2goe1xuXHRcdFx0XHQkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogYU5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhzW2ldXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0b1NpZGVFZmZlY3RzLnRhcmdldFByb3BlcnRpZXMgPSBhUHJvcGVydHlQYXRocztcblx0XHRpZiAoc01lc3NhZ2VzUGF0aCkge1xuXHRcdFx0b1NpZGVFZmZlY3RzLnRhcmdldFByb3BlcnRpZXMucHVzaChzTWVzc2FnZXNQYXRoKTtcblx0XHR9XG5cdFx0Ly9hbGwgdGhpcyBsb2dpYyB0byBiZSByZXBsYWNlZCB3aXRoIGEgU2lkZUVmZmVjdHMgcmVxdWVzdCBmb3IgYW4gZW1wdHkgcGF0aCAocmVmcmVzaCBldmVyeXRoaW5nKSwgYWZ0ZXIgdGVzdGluZyB0cmFuc2llbnQgY29udGV4dHNcblx0XHRvU2lkZUVmZmVjdHMudGFyZ2V0UHJvcGVydGllcyA9IG9TaWRlRWZmZWN0cy50YXJnZXRQcm9wZXJ0aWVzLnJlZHVjZSgodGFyZ2V0czogc3RyaW5nW10sIHRhcmdldFByb3BlcnR5KSA9PiB7XG5cdFx0XHRpZiAodGFyZ2V0UHJvcGVydHkpIHtcblx0XHRcdFx0Y29uc3QgaW5kZXggPSB0YXJnZXRQcm9wZXJ0eS5pbmRleE9mKFwiL1wiKTtcblx0XHRcdFx0dGFyZ2V0cy5wdXNoKGluZGV4ID4gMCA/IHRhcmdldFByb3BlcnR5LnNsaWNlKDAsIGluZGV4KSA6IHRhcmdldFByb3BlcnR5KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0YXJnZXRzO1xuXHRcdH0sIFtdKTtcblx0XHQvLyBPRGF0YSBtb2RlbCB3aWxsIHRha2UgY2FyZSBvZiBkdXBsaWNhdGVzXG5cdFx0b1NpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHMoWy4uLm9TaWRlRWZmZWN0cy50YXJnZXRFbnRpdGllcywgLi4ub1NpZGVFZmZlY3RzLnRhcmdldFByb3BlcnRpZXNdLCBvQmluZGluZ0NvbnRleHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGJpbmRpbmcgY29udGV4dCBvZiB0aGUgcGFnZSBvciB0aGUgY29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBjb250ZXh0XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0X2dldEJpbmRpbmdDb250ZXh0KCk6IENvbnRleHQgfCBudWxsIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAodGhpcy5fb1BhZ2VDb21wb25lbnQpIHtcblx0XHRcdHJldHVybiB0aGlzLl9vUGFnZUNvbXBvbmVudC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9vVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGJpbmRpbmcgY29udGV4dCBvZiB0aGUgcGFnZSBvciB0aGUgY29tcG9uZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGJpbmRpbmcgY29udGV4dFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9zZXRCaW5kaW5nQ29udGV4dChvQ29udGV4dDogYW55KSB7XG5cdFx0bGV0IG9QcmV2aW91c0NvbnRleHQsIG9UYXJnZXRDb250cm9sO1xuXHRcdGlmICh0aGlzLl9vUGFnZUNvbXBvbmVudCkge1xuXHRcdFx0b1ByZXZpb3VzQ29udGV4dCA9IHRoaXMuX29QYWdlQ29tcG9uZW50LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRcdG9UYXJnZXRDb250cm9sID0gdGhpcy5fb1BhZ2VDb21wb25lbnQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9QcmV2aW91c0NvbnRleHQgPSB0aGlzLl9vVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRvVGFyZ2V0Q29udHJvbCA9IHRoaXMuX29WaWV3O1xuXHRcdH1cblxuXHRcdG9UYXJnZXRDb250cm9sLnNldEJpbmRpbmdDb250ZXh0KG9Db250ZXh0KTtcblxuXHRcdGlmIChvUHJldmlvdXNDb250ZXh0Py5pc0tlZXBBbGl2ZSgpICYmIG9QcmV2aW91c0NvbnRleHQgIT09IG9Db250ZXh0KSB7XG5cdFx0XHR0aGlzLl9zZXRLZWVwQWxpdmUob1ByZXZpb3VzQ29udGV4dCwgZmFsc2UpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBmbGV4aWJsZSBjb2x1bW4gbGF5b3V0IChGQ0wpIGxldmVsIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHZpZXcgKC0xIGlmIHRoZSBhcHAgaXMgbm90IEZDTCkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBsZXZlbFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9nZXRGQ0xMZXZlbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fb1RhcmdldEluZm9ybWF0aW9uLkZDTExldmVsO1xuXHR9XG5cblx0X3NldEtlZXBBbGl2ZShvQ29udGV4dDogQ29udGV4dCwgYktlZXBBbGl2ZTogYm9vbGVhbiwgZm5CZWZvcmVEZXN0cm95PzogRnVuY3Rpb24sIGJSZXF1ZXN0TWVzc2FnZXM/OiBib29sZWFuKSB7XG5cdFx0aWYgKG9Db250ZXh0LmdldFBhdGgoKS5lbmRzV2l0aChcIilcIikpIHtcblx0XHRcdC8vIFdlIGtlZXAgdGhlIGNvbnRleHQgYWxpdmUgb25seSBpZiB0aGV5J3JlIHBhcnQgb2YgYSBjb2xsZWN0aW9uLCBpLmUuIGlmIHRoZSBwYXRoIGVuZHMgd2l0aCBhICcpJ1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRjb25zdCBzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9Db250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRjb25zdCBzTWVzc2FnZXNQYXRoID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzLyRQYXRoYCk7XG5cdFx0XHRvQ29udGV4dC5zZXRLZWVwQWxpdmUoYktlZXBBbGl2ZSwgZm5CZWZvcmVEZXN0cm95LCAhIXNNZXNzYWdlc1BhdGggJiYgYlJlcXVlc3RNZXNzYWdlcyk7XG5cdFx0fVxuXHR9XG5cblx0X2dldEtlZXBBbGl2ZUNvbnRleHQob01vZGVsOiBPRGF0YU1vZGVsLCBwYXRoOiBzdHJpbmcsIGJSZXF1ZXN0TWVzc2FnZXM/OiBib29sZWFuLCBwYXJhbWV0ZXJzPzogYW55KTogQ29udGV4dCB8IHVuZGVmaW5lZCB7XG5cdFx0Ly8gR2V0IHRoZSBwYXRoIGZvciB0aGUgY29udGV4dCB0aGF0IGlzIHJlYWxseSBrZXB0IGFsaXZlIChwYXJ0IG9mIGEgY29sbGVjdGlvbilcblx0XHQvLyBpLmUuIHJlbW92ZSBhbGwgc2VnbWVudHMgbm90IGVuZGluZyB3aXRoIGEgJyknXG5cdFx0Y29uc3Qga2VwdEFsaXZlU2VnbWVudHMgPSBwYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRjb25zdCBhZGRpdGlvbm5hbFNlZ21lbnRzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdHdoaWxlIChrZXB0QWxpdmVTZWdtZW50cy5sZW5ndGggJiYgIWtlcHRBbGl2ZVNlZ21lbnRzW2tlcHRBbGl2ZVNlZ21lbnRzLmxlbmd0aCAtIDFdLmVuZHNXaXRoKFwiKVwiKSkge1xuXHRcdFx0YWRkaXRpb25uYWxTZWdtZW50cy5wdXNoKGtlcHRBbGl2ZVNlZ21lbnRzLnBvcCgpISk7XG5cdFx0fVxuXG5cdFx0aWYgKGtlcHRBbGl2ZVNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRjb25zdCBrZXB0QWxpdmVQYXRoID0ga2VwdEFsaXZlU2VnbWVudHMuam9pbihcIi9cIik7XG5cdFx0Y29uc3Qgb0tlZXBBbGl2ZUNvbnRleHQgPSBvTW9kZWwuZ2V0S2VlcEFsaXZlQ29udGV4dChrZXB0QWxpdmVQYXRoLCBiUmVxdWVzdE1lc3NhZ2VzLCBwYXJhbWV0ZXJzKTtcblxuXHRcdGlmIChhZGRpdGlvbm5hbFNlZ21lbnRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIG9LZWVwQWxpdmVDb250ZXh0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhZGRpdGlvbm5hbFNlZ21lbnRzLnJldmVyc2UoKTtcblx0XHRcdGNvbnN0IGFkZGl0aW9ubmFsUGF0aCA9IGFkZGl0aW9ubmFsU2VnbWVudHMuam9pbihcIi9cIik7XG5cdFx0XHRyZXR1cm4gb01vZGVsLmJpbmRDb250ZXh0KGFkZGl0aW9ubmFsUGF0aCwgb0tlZXBBbGl2ZUNvbnRleHQpLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTd2l0Y2hlcyBiZXR3ZWVuIGNvbHVtbiBhbmQgZnVsbC1zY3JlZW4gbW9kZSB3aGVuIEZDTCBpcyB1c2VkLlxuXHQgKlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHN3aXRjaEZ1bGxTY3JlZW4oKSB7XG5cdFx0Y29uc3Qgb1NvdXJjZSA9IHRoaXMuYmFzZS5nZXRWaWV3KCk7XG5cdFx0Y29uc3Qgb0ZDTEhlbHBlck1vZGVsID0gb1NvdXJjZS5nZXRNb2RlbChcImZjbGhlbHBlclwiKSBhcyBKU09OTW9kZWwsXG5cdFx0XHRiSXNGdWxsU2NyZWVuID0gb0ZDTEhlbHBlck1vZGVsLmdldFByb3BlcnR5KFwiL2FjdGlvbkJ1dHRvbnNJbmZvL2lzRnVsbFNjcmVlblwiKSxcblx0XHRcdHNOZXh0TGF5b3V0ID0gb0ZDTEhlbHBlck1vZGVsLmdldFByb3BlcnR5KFxuXHRcdFx0XHRiSXNGdWxsU2NyZWVuID8gXCIvYWN0aW9uQnV0dG9uc0luZm8vZXhpdEZ1bGxTY3JlZW5cIiA6IFwiL2FjdGlvbkJ1dHRvbnNJbmZvL2Z1bGxTY3JlZW5cIlxuXHRcdFx0KSxcblx0XHRcdG9Sb290Vmlld0NvbnRyb2xsZXIgPSAodGhpcy5fb0FwcENvbXBvbmVudCBhcyBhbnkpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpO1xuXG5cdFx0Y29uc3Qgb0NvbnRleHQgPSBvUm9vdFZpZXdDb250cm9sbGVyLmdldFJpZ2h0bW9zdENvbnRleHQgPyBvUm9vdFZpZXdDb250cm9sbGVyLmdldFJpZ2h0bW9zdENvbnRleHQoKSA6IG9Tb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKTtcblxuXHRcdHRoaXMuYmFzZS5fcm91dGluZy5uYXZpZ2F0ZVRvQ29udGV4dChvQ29udGV4dCwgeyBzTGF5b3V0OiBzTmV4dExheW91dCB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRMb2cud2FybmluZyhcImNhbm5vdCBzd2l0Y2ggYmV0d2VlbiBjb2x1bW4gYW5kIGZ1bGxzY3JlZW5cIik7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2xvc2VzIHRoZSBjb2x1bW4gZm9yIHRoZSBjdXJyZW50IHZpZXcgaW4gYSBGQ0wuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkJlZm9yZSlcblx0Y2xvc2VDb2x1bW4oKSB7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gdGhpcy5fb1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnk7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLl9vVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3QgbmF2aWdhdGlvblBhcmFtZXRlcnMgPSB7XG5cdFx0XHRub1ByZXNlcnZhdGlvbkNhY2hlOiB0cnVlLFxuXHRcdFx0c0xheW91dDogKHRoaXMuX29WaWV3LmdldE1vZGVsKFwiZmNsaGVscGVyXCIpIGFzIEpTT05Nb2RlbCkuZ2V0UHJvcGVydHkoXCIvYWN0aW9uQnV0dG9uc0luZm8vY2xvc2VDb2x1bW5cIilcblx0XHR9O1xuXG5cdFx0aWYgKG9WaWV3RGF0YT8udmlld0xldmVsID09PSAxICYmIE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob01ldGFNb2RlbCwgb0NvbnRleHQuZ2V0UGF0aCgpKSkge1xuXHRcdFx0ZHJhZnQucHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24oXG5cdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0LCBuYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZSxcblx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdHRoaXMuX29WaWV3LmdldENvbnRyb2xsZXIoKSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGRyYWZ0Lk5hdmlnYXRpb25UeXBlLkJhY2tOYXZpZ2F0aW9uXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0LCBuYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEludGVybmFsUm91dGluZztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQWdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUEEsSUFTTUEsZUFBZSxXQURwQkMsY0FBYyxDQUFDLGtEQUFrRCxDQUFDLFVBb0JqRUMsY0FBYyxFQUFFLFVBT2hCQSxjQUFjLEVBQUUsVUFvQ2hCQyxlQUFlLEVBQUUsVUFDakJDLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLEtBQUssQ0FBQyxVQUtuQ0gsZUFBZSxFQUFF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
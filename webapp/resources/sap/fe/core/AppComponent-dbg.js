/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/AppStateHandler", "sap/fe/core/controllerextensions/routing/RouterProxy", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/library", "sap/fe/core/manifestMerger/ChangePageConfiguration", "sap/fe/core/support/Diagnostics", "sap/ui/core/Core", "sap/ui/core/Element", "sap/ui/core/UIComponent", "sap/ui/mdc/table/TableTypeBase", "sap/ui/model/json/JSONModel", "./controllerextensions/BusyLocker", "./converters/MetaModelConverter", "./helpers/SemanticDateOperators"], function (Log, AppStateHandler, RouterProxy, ClassSupport, ModelHelper, library, ChangePageConfiguration, Diagnostics, Core, UI5Element, UIComponent, TableTypeBase, JSONModel, BusyLocker, MetaModelConverter, SemanticDateOperators) {
  "use strict";

  var _dec, _class, _class2;
  var deleteModelCacheData = MetaModelConverter.deleteModelCacheData;
  var cleanPageConfigurationChanges = ChangePageConfiguration.cleanPageConfigurationChanges;
  var changeConfiguration = ChangePageConfiguration.changeConfiguration;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  const StartupMode = library.StartupMode;
  TableTypeBase.prototype.exit = function () {
    var _this$_oManagedObject;
    (_this$_oManagedObject = this._oManagedObjectModel) === null || _this$_oManagedObject === void 0 ? void 0 : _this$_oManagedObject.destroy();
    delete this._oManagedObjectModel;
    UI5Element.prototype.exit.apply(this, []);
  };
  const NAVCONF = {
    FCL: {
      VIEWNAME: "sap.fe.core.rootView.Fcl",
      VIEWNAME_COMPATIBILITY: "sap.fe.templates.RootContainer.view.Fcl",
      ROUTERCLASS: "sap.f.routing.Router"
    },
    NAVCONTAINER: {
      VIEWNAME: "sap.fe.core.rootView.NavContainer",
      VIEWNAME_COMPATIBILITY: "sap.fe.templates.RootContainer.view.NavContainer",
      ROUTERCLASS: "sap.m.routing.Router"
    }
  };
  /**
   * Main class for components used for an application in SAP Fiori elements.
   *
   * Application developers using the templates and building blocks provided by SAP Fiori elements should create their apps by extending this component.
   * This ensures that all the necessary services that you need for the building blocks and templates to work properly are started.
   *
   * When you use sap.fe.core.AppComponent as the base component, you also need to use a rootView. SAP Fiori elements provides two options: <br/>
   *  - sap.fe.core.rootView.NavContainer when using sap.m.routing.Router <br/>
   *  - sap.fe.core.rootView.Fcl when using sap.f.routing.Router (FCL use case) <br/>
   *
   * @hideconstructor
   * @public
   * @name sap.fe.core.AppComponent
   */
  let AppComponent = (_dec = defineUI5Class("sap.fe.core.AppComponent", {
    interfaces: ["sap.ui.core.IAsyncContentCreation"],
    config: {
      fullWidth: true
    },
    manifest: {
      "sap.ui5": {
        services: {
          resourceModel: {
            factoryName: "sap.fe.core.services.ResourceModelService",
            startup: "waitFor",
            settings: {
              bundles: ["sap.fe.core.messagebundle"],
              modelName: "sap.fe.i18n"
            }
          },
          routingService: {
            factoryName: "sap.fe.core.services.RoutingService",
            startup: "waitFor"
          },
          shellServices: {
            factoryName: "sap.fe.core.services.ShellServices",
            startup: "waitFor"
          },
          ShellUIService: {
            factoryName: "sap.ushell.ui5service.ShellUIService"
          },
          navigationService: {
            factoryName: "sap.fe.core.services.NavigationService",
            startup: "waitFor"
          },
          environmentCapabilities: {
            factoryName: "sap.fe.core.services.EnvironmentService",
            startup: "waitFor"
          },
          sideEffectsService: {
            factoryName: "sap.fe.core.services.SideEffectsService",
            startup: "waitFor"
          },
          asyncComponentService: {
            factoryName: "sap.fe.core.services.AsyncComponentService",
            startup: "waitFor"
          }
        },
        rootView: {
          viewName: NAVCONF.NAVCONTAINER.VIEWNAME,
          type: "XML",
          async: true,
          id: "appRootView"
        },
        routing: {
          config: {
            controlId: "appContent",
            routerClass: NAVCONF.NAVCONTAINER.ROUTERCLASS,
            viewType: "XML",
            controlAggregation: "pages",
            async: true,
            containerOptions: {
              propagateModel: true
            }
          }
        }
      }
    },
    designtime: "sap/fe/core/designtime/AppComponent.designtime",
    library: "sap.fe.core"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_UIComponent) {
    _inheritsLoose(AppComponent, _UIComponent);
    function AppComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _UIComponent.call(this, ...args) || this;
      _this.startupMode = StartupMode.Normal;
      return _this;
    }
    var _proto = AppComponent.prototype;
    /**
     * @private
     * @name sap.fe.core.AppComponent.getMetadata
     * @function
     */
    _proto._isFclEnabled = function _isFclEnabled() {
      var _oManifestUI5$routing, _oManifestUI5$routing2;
      const oManifestUI5 = this.getManifestEntry("sap.ui5");
      return (oManifestUI5 === null || oManifestUI5 === void 0 ? void 0 : (_oManifestUI5$routing = oManifestUI5.routing) === null || _oManifestUI5$routing === void 0 ? void 0 : (_oManifestUI5$routing2 = _oManifestUI5$routing.config) === null || _oManifestUI5$routing2 === void 0 ? void 0 : _oManifestUI5$routing2.routerClass) === NAVCONF.FCL.ROUTERCLASS;
    }

    /**
     * Provides a hook to initialize feature toggles.
     *
     * This hook is being called by the SAP Fiori elements AppComponent at the time feature toggles can be initialized.
     * To change page configuration use the {@link sap.fe.core.AppComponent#changePageConfiguration} method.
     *
     * @function
     * @name sap.fe.core.AppComponent#initializeFeatureToggles
     * @memberof sap.fe.core.AppComponent
     * @public
     */;
    _proto.initializeFeatureToggles = async function initializeFeatureToggles() {
      // this method can be overridden by applications
      return Promise.resolve();
    }

    /**
     * Changes the page configuration of SAP Fiori elements.
     *
     * This method enables you to change the page configuration of SAP Fiori elements.
     *
     * @function
     * @name sap.fe.core.AppComponent#changePageConfiguration
     * @memberof sap.fe.core.AppComponent
     * @param pageId The ID of the page for which the configuration is to be changed.
     * @param path The path in the page settings for which the configuration is to be changed.
     * @param value The new value of the configuration. This could be a plain value like a string, or a Boolean, or a structured object.
     * @public
     */;
    _proto.changePageConfiguration = function changePageConfiguration(pageId, path, value) {
      changeConfiguration(this.getManifest(), pageId, path, value, true);
    }

    /**
     * Get a reference to the RouterProxy.
     *
     * @function
     * @name sap.fe.core.AppComponent#getRouterProxy
     * @memberof sap.fe.core.AppComponent
     * @returns A Reference to the RouterProxy
     * @ui5-restricted
     * @final
     */;
    _proto.getRouterProxy = function getRouterProxy() {
      return this._oRouterProxy;
    }

    /**
     * Get a reference to the AppStateHandler.
     *
     * @function
     * @name sap.fe.core.AppComponent#getAppStateHandler
     * @memberof sap.fe.core.AppComponent
     * @returns A reference to the AppStateHandler
     * @ui5-restricted
     * @final
     */;
    _proto.getAppStateHandler = function getAppStateHandler() {
      return this._oAppStateHandler;
    }

    /**
     * Get a reference to the nav/FCL Controller.
     *
     * @function
     * @name sap.fe.core.AppComponent#getRootViewController
     * @memberof sap.fe.core.AppComponent
     * @returns  A reference to the FCL Controller
     * @ui5-restricted
     * @final
     */;
    _proto.getRootViewController = function getRootViewController() {
      return this.getRootControl().getController();
    }

    /**
     * Get the NavContainer control or the FCL control.
     *
     * @function
     * @name sap.fe.core.AppComponent#getRootContainer
     * @memberof sap.fe.core.AppComponent
     * @returns  A reference to NavContainer control or the FCL control
     * @ui5-restricted
     * @final
     */;
    _proto.getRootContainer = function getRootContainer() {
      return this.getRootControl().getContent()[0];
    }

    /**
     * Get the startup mode of the app.
     *
     * @returns The startup mode
     * @private
     */;
    _proto.getStartupMode = function getStartupMode() {
      return this.startupMode;
    }

    /**
     * Set the startup mode for the app to 'Create'.
     *
     * @private
     */;
    _proto.setStartupModeCreate = function setStartupModeCreate() {
      this.startupMode = StartupMode.Create;
    }

    /**
     * Set the startup mode for the app to 'AutoCreate'.
     *
     * @private
     */;
    _proto.setStartupModeAutoCreate = function setStartupModeAutoCreate() {
      this.startupMode = StartupMode.AutoCreate;
    }

    /**
     * Set the startup mode for the app to 'Deeplink'.
     *
     * @private
     */;
    _proto.setStartupModeDeeplink = function setStartupModeDeeplink() {
      this.startupMode = StartupMode.Deeplink;
    };
    _proto.init = function init() {
      var _oModel$isA, _oManifestUI5$rootVie;
      const uiModel = new JSONModel({
        editMode: library.EditMode.Display,
        isEditable: false,
        draftStatus: library.DraftStatus.Clear,
        busy: false,
        busyLocal: {},
        pages: {}
      });
      const oInternalModel = new JSONModel({
        pages: {}
      });
      // set the binding OneWay for uiModel to prevent changes if controller extensions modify a bound property of a control
      uiModel.setDefaultBindingMode("OneWay");
      // for internal model binding needs to be two way
      ModelHelper.enhanceUiJSONModel(uiModel, library);
      ModelHelper.enhanceInternalJSONModel(oInternalModel);
      this.setModel(uiModel, "ui");
      this.setModel(oInternalModel, "internal");
      this.bInitializeRouting = this.bInitializeRouting !== undefined ? this.bInitializeRouting : true;
      this._oRouterProxy = new RouterProxy();
      this._oAppStateHandler = new AppStateHandler(this);
      this._oDiagnostics = new Diagnostics();
      const oModel = this.getModel();
      if (oModel !== null && oModel !== void 0 && (_oModel$isA = oModel.isA) !== null && _oModel$isA !== void 0 && _oModel$isA.call(oModel, "sap.ui.model.odata.v4.ODataModel")) {
        this.entityContainer = oModel.getMetaModel().requestObject("/$EntityContainer/");
      } else {
        // not an OData v4 service
        this.entityContainer = Promise.resolve();
      }
      const oManifestUI5 = this.getManifest()["sap.ui5"];
      if (oManifestUI5 !== null && oManifestUI5 !== void 0 && (_oManifestUI5$rootVie = oManifestUI5.rootView) !== null && _oManifestUI5$rootVie !== void 0 && _oManifestUI5$rootVie.viewName) {
        var _oManifestUI5$routing3, _oManifestUI5$routing4, _oManifestUI5$routing5, _oManifestUI5$routing6, _oManifestUI5$rootVie2, _oManifestUI5$rootVie3;
        // The application specified an own root view in the manifest

        // Root View was moved from sap.fe.templates to sap.fe.core - keep it compatible
        if (oManifestUI5.rootView.viewName === NAVCONF.FCL.VIEWNAME_COMPATIBILITY) {
          oManifestUI5.rootView.viewName = NAVCONF.FCL.VIEWNAME;
        } else if (oManifestUI5.rootView.viewName === NAVCONF.NAVCONTAINER.VIEWNAME_COMPATIBILITY) {
          oManifestUI5.rootView.viewName = NAVCONF.NAVCONTAINER.VIEWNAME;
        }
        if (oManifestUI5.rootView.viewName === NAVCONF.FCL.VIEWNAME && ((_oManifestUI5$routing3 = oManifestUI5.routing) === null || _oManifestUI5$routing3 === void 0 ? void 0 : (_oManifestUI5$routing4 = _oManifestUI5$routing3.config) === null || _oManifestUI5$routing4 === void 0 ? void 0 : _oManifestUI5$routing4.routerClass) === NAVCONF.FCL.ROUTERCLASS) {
          Log.info(`Rootcontainer: "${NAVCONF.FCL.VIEWNAME}" - Routerclass: "${NAVCONF.FCL.ROUTERCLASS}"`);
        } else if (oManifestUI5.rootView.viewName === NAVCONF.NAVCONTAINER.VIEWNAME && ((_oManifestUI5$routing5 = oManifestUI5.routing) === null || _oManifestUI5$routing5 === void 0 ? void 0 : (_oManifestUI5$routing6 = _oManifestUI5$routing5.config) === null || _oManifestUI5$routing6 === void 0 ? void 0 : _oManifestUI5$routing6.routerClass) === NAVCONF.NAVCONTAINER.ROUTERCLASS) {
          Log.info(`Rootcontainer: "${NAVCONF.NAVCONTAINER.VIEWNAME}" - Routerclass: "${NAVCONF.NAVCONTAINER.ROUTERCLASS}"`);
        } else if (((_oManifestUI5$rootVie2 = oManifestUI5.rootView) === null || _oManifestUI5$rootVie2 === void 0 ? void 0 : (_oManifestUI5$rootVie3 = _oManifestUI5$rootVie2.viewName) === null || _oManifestUI5$rootVie3 === void 0 ? void 0 : _oManifestUI5$rootVie3.indexOf("sap.fe.core.rootView")) !== -1) {
          var _oManifestUI5$routing7, _oManifestUI5$routing8;
          throw Error(`\nWrong configuration for the couple (rootView/routerClass) in manifest file.\n` + `Current values are :(${oManifestUI5.rootView.viewName}/${((_oManifestUI5$routing7 = oManifestUI5.routing) === null || _oManifestUI5$routing7 === void 0 ? void 0 : (_oManifestUI5$routing8 = _oManifestUI5$routing7.config) === null || _oManifestUI5$routing8 === void 0 ? void 0 : _oManifestUI5$routing8.routerClass) || "<missing router class>"})\n` + `Expected values are \n` + `\t - (${NAVCONF.NAVCONTAINER.VIEWNAME}/${NAVCONF.NAVCONTAINER.ROUTERCLASS})\n` + `\t - (${NAVCONF.FCL.VIEWNAME}/${NAVCONF.FCL.ROUTERCLASS})`);
        } else {
          Log.info(`Rootcontainer: "${oManifestUI5.rootView.viewName}" - Routerclass: "${NAVCONF.NAVCONTAINER.ROUTERCLASS}"`);
        }
      }

      // Adding Semantic Date Operators
      // Commenting since it is not needed for SingleRange
      SemanticDateOperators.addSemanticDateOperators();

      // the init function configures the routing according to the settings above
      // it will call the createContent function to instantiate the RootView and add it to the UIComponent aggregations

      _UIComponent.prototype.init.call(this);
      AppComponent.instanceMap[this.getId()] = this;
    };
    _proto.onServicesStarted = async function onServicesStarted() {
      await this.initializeFeatureToggles();

      //router must be started once the rootcontainer is initialized
      //starting of the router
      const finalizedRoutingInitialization = () => {
        this.entityContainer.then(() => {
          if (this.getRootViewController().attachRouteMatchers) {
            this.getRootViewController().attachRouteMatchers();
          }
          this.getRouter().initialize();
          this.getRouterProxy().init(this, this._isFclEnabled());
          return;
        }).catch(error => {
          const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
          this.getRootViewController().displayErrorPage(oResourceBundle.getText("C_APP_COMPONENT_SAPFE_APPSTART_TECHNICAL_ISSUES"), {
            title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
            description: error.message,
            FCLLevel: 0
          });
        });
      };
      if (this.bInitializeRouting) {
        return this.getRoutingService().initializeRouting().then(() => {
          if (this.getRootViewController()) {
            finalizedRoutingInitialization();
          } else {
            this.getRootControl().attachAfterInit(function () {
              finalizedRoutingInitialization();
            });
          }
          return;
        }).catch(function (err) {
          Log.error(`cannot cannot initialize routing: ${err.toString()}`);
        });
      }
    };
    _proto.exit = function exit() {
      this._oAppStateHandler.destroy();
      this._oRouterProxy.destroy();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete this._oAppStateHandler;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete this._oRouterProxy;
      deleteModelCacheData(this.getMetaModel());
      this.getModel("ui").destroy();
      cleanPageConfigurationChanges();
    };
    _proto.getMetaModel = function getMetaModel() {
      return this.getModel().getMetaModel();
    };
    _proto.getDiagnostics = function getDiagnostics() {
      return this._oDiagnostics;
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      var _this$getRoutingServi;
      // LEAKS, with workaround for some Flex / MDC issue
      try {
        // 	// This one is only a leak if you don't go back to the same component in the long run
        //delete sap.ui.fl.FlexControllerFactory._componentInstantiationPromises[this.getId()];

        delete AppComponent.instanceMap[this.getId()];

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete window._routing;
      } catch (e) {
        Log.info(e);
      }

      //WORKAROUND for sticky discard request : due to async callback, request triggered by the exitApplication will be send after the UIComponent.prototype.destroy
      //so we need to copy the Requestor headers as it will be destroy

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const oMainModel = this.oModels[undefined];
      let oHeaders;
      if (oMainModel.oRequestor) {
        oHeaders = jQuery.extend({}, oMainModel.oRequestor.mHeaders);
      }

      // As we need to cleanup the application / handle the dirty object we need to call our cleanup before the models are destroyed
      (_this$getRoutingServi = this.getRoutingService()) === null || _this$getRoutingServi === void 0 ? void 0 : _this$getRoutingServi.beforeExit();
      _UIComponent.prototype.destroy.call(this, bSuppressInvalidate);
      if (oHeaders && oMainModel.oRequestor) {
        oMainModel.oRequestor.mHeaders = oHeaders;
      }
    };
    _proto.getRoutingService = function getRoutingService() {
      return {}; // overriden at runtime
    };
    _proto.getShellServices = function getShellServices() {
      return {}; // overriden at runtime
    };
    _proto.getNavigationService = function getNavigationService() {
      return {}; // overriden at runtime
    };
    _proto.getSideEffectsService = function getSideEffectsService() {
      return {};
    };
    _proto.getEnvironmentCapabilities = function getEnvironmentCapabilities() {
      return {};
    };
    _proto.getStartupParameters = async function getStartupParameters() {
      const oComponentData = this.getComponentData();
      return Promise.resolve(oComponentData && oComponentData.startupParameters || {});
    };
    _proto.restore = function restore() {
      // called by FLP when app sap-keep-alive is enabled and app is restored
      this.getRootViewController().viewState.onRestore();
    };
    _proto.suspend = function suspend() {
      // called by FLP when app sap-keep-alive is enabled and app is suspended
      this.getRootViewController().viewState.onSuspend();
    }

    /**
     * navigateBasedOnStartupParameter function is a public api that acts as a wrapper to _manageDeepLinkStartup function. It passes the startup parameters further to _manageDeepLinkStartup function
     *
     * @param startupParameters Defines the startup parameters which is further passed to _manageDeepLinkStartup function.
     */;
    _proto.navigateBasedOnStartupParameter = async function navigateBasedOnStartupParameter(startupParameters) {
      try {
        if (!BusyLocker.isLocked(this.getModel("ui"))) {
          if (!startupParameters) {
            startupParameters = null;
          }
          const routingService = this.getRoutingService();
          await routingService._manageDeepLinkStartup(startupParameters);
        }
      } catch (exception) {
        Log.error(exception);
        BusyLocker.unlock(this.getModel("ui"));
      }
    };
    return AppComponent;
  }(UIComponent), _class2.instanceMap = {}, _class2)) || _class);
  return AppComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGFydHVwTW9kZSIsImxpYnJhcnkiLCJUYWJsZVR5cGVCYXNlIiwicHJvdG90eXBlIiwiZXhpdCIsIl9vTWFuYWdlZE9iamVjdE1vZGVsIiwiZGVzdHJveSIsIlVJNUVsZW1lbnQiLCJhcHBseSIsIk5BVkNPTkYiLCJGQ0wiLCJWSUVXTkFNRSIsIlZJRVdOQU1FX0NPTVBBVElCSUxJVFkiLCJST1VURVJDTEFTUyIsIk5BVkNPTlRBSU5FUiIsIkFwcENvbXBvbmVudCIsImRlZmluZVVJNUNsYXNzIiwiaW50ZXJmYWNlcyIsImNvbmZpZyIsImZ1bGxXaWR0aCIsIm1hbmlmZXN0Iiwic2VydmljZXMiLCJyZXNvdXJjZU1vZGVsIiwiZmFjdG9yeU5hbWUiLCJzdGFydHVwIiwic2V0dGluZ3MiLCJidW5kbGVzIiwibW9kZWxOYW1lIiwicm91dGluZ1NlcnZpY2UiLCJzaGVsbFNlcnZpY2VzIiwiU2hlbGxVSVNlcnZpY2UiLCJuYXZpZ2F0aW9uU2VydmljZSIsImVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwic2lkZUVmZmVjdHNTZXJ2aWNlIiwiYXN5bmNDb21wb25lbnRTZXJ2aWNlIiwicm9vdFZpZXciLCJ2aWV3TmFtZSIsInR5cGUiLCJhc3luYyIsImlkIiwicm91dGluZyIsImNvbnRyb2xJZCIsInJvdXRlckNsYXNzIiwidmlld1R5cGUiLCJjb250cm9sQWdncmVnYXRpb24iLCJjb250YWluZXJPcHRpb25zIiwicHJvcGFnYXRlTW9kZWwiLCJkZXNpZ250aW1lIiwic3RhcnR1cE1vZGUiLCJOb3JtYWwiLCJfaXNGY2xFbmFibGVkIiwib01hbmlmZXN0VUk1IiwiZ2V0TWFuaWZlc3RFbnRyeSIsImluaXRpYWxpemVGZWF0dXJlVG9nZ2xlcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiY2hhbmdlUGFnZUNvbmZpZ3VyYXRpb24iLCJwYWdlSWQiLCJwYXRoIiwidmFsdWUiLCJjaGFuZ2VDb25maWd1cmF0aW9uIiwiZ2V0TWFuaWZlc3QiLCJnZXRSb3V0ZXJQcm94eSIsIl9vUm91dGVyUHJveHkiLCJnZXRBcHBTdGF0ZUhhbmRsZXIiLCJfb0FwcFN0YXRlSGFuZGxlciIsImdldFJvb3RWaWV3Q29udHJvbGxlciIsImdldFJvb3RDb250cm9sIiwiZ2V0Q29udHJvbGxlciIsImdldFJvb3RDb250YWluZXIiLCJnZXRDb250ZW50IiwiZ2V0U3RhcnR1cE1vZGUiLCJzZXRTdGFydHVwTW9kZUNyZWF0ZSIsIkNyZWF0ZSIsInNldFN0YXJ0dXBNb2RlQXV0b0NyZWF0ZSIsIkF1dG9DcmVhdGUiLCJzZXRTdGFydHVwTW9kZURlZXBsaW5rIiwiRGVlcGxpbmsiLCJpbml0IiwidWlNb2RlbCIsIkpTT05Nb2RlbCIsImVkaXRNb2RlIiwiRWRpdE1vZGUiLCJEaXNwbGF5IiwiaXNFZGl0YWJsZSIsImRyYWZ0U3RhdHVzIiwiRHJhZnRTdGF0dXMiLCJDbGVhciIsImJ1c3kiLCJidXN5TG9jYWwiLCJwYWdlcyIsIm9JbnRlcm5hbE1vZGVsIiwic2V0RGVmYXVsdEJpbmRpbmdNb2RlIiwiTW9kZWxIZWxwZXIiLCJlbmhhbmNlVWlKU09OTW9kZWwiLCJlbmhhbmNlSW50ZXJuYWxKU09OTW9kZWwiLCJzZXRNb2RlbCIsImJJbml0aWFsaXplUm91dGluZyIsInVuZGVmaW5lZCIsIlJvdXRlclByb3h5IiwiQXBwU3RhdGVIYW5kbGVyIiwiX29EaWFnbm9zdGljcyIsIkRpYWdub3N0aWNzIiwib01vZGVsIiwiZ2V0TW9kZWwiLCJpc0EiLCJlbnRpdHlDb250YWluZXIiLCJnZXRNZXRhTW9kZWwiLCJyZXF1ZXN0T2JqZWN0IiwiTG9nIiwiaW5mbyIsImluZGV4T2YiLCJFcnJvciIsIlNlbWFudGljRGF0ZU9wZXJhdG9ycyIsImFkZFNlbWFudGljRGF0ZU9wZXJhdG9ycyIsImluc3RhbmNlTWFwIiwiZ2V0SWQiLCJvblNlcnZpY2VzU3RhcnRlZCIsImZpbmFsaXplZFJvdXRpbmdJbml0aWFsaXphdGlvbiIsInRoZW4iLCJhdHRhY2hSb3V0ZU1hdGNoZXJzIiwiZ2V0Um91dGVyIiwiaW5pdGlhbGl6ZSIsImNhdGNoIiwiZXJyb3IiLCJvUmVzb3VyY2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZGlzcGxheUVycm9yUGFnZSIsImdldFRleHQiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwibWVzc2FnZSIsIkZDTExldmVsIiwiZ2V0Um91dGluZ1NlcnZpY2UiLCJpbml0aWFsaXplUm91dGluZyIsImF0dGFjaEFmdGVySW5pdCIsImVyciIsInRvU3RyaW5nIiwiZGVsZXRlTW9kZWxDYWNoZURhdGEiLCJjbGVhblBhZ2VDb25maWd1cmF0aW9uQ2hhbmdlcyIsImdldERpYWdub3N0aWNzIiwiYlN1cHByZXNzSW52YWxpZGF0ZSIsIndpbmRvdyIsIl9yb3V0aW5nIiwiZSIsIm9NYWluTW9kZWwiLCJvTW9kZWxzIiwib0hlYWRlcnMiLCJvUmVxdWVzdG9yIiwialF1ZXJ5IiwiZXh0ZW5kIiwibUhlYWRlcnMiLCJiZWZvcmVFeGl0IiwiZ2V0U2hlbGxTZXJ2aWNlcyIsImdldE5hdmlnYXRpb25TZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMiLCJnZXRTdGFydHVwUGFyYW1ldGVycyIsIm9Db21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsInN0YXJ0dXBQYXJhbWV0ZXJzIiwicmVzdG9yZSIsInZpZXdTdGF0ZSIsIm9uUmVzdG9yZSIsInN1c3BlbmQiLCJvblN1c3BlbmQiLCJuYXZpZ2F0ZUJhc2VkT25TdGFydHVwUGFyYW1ldGVyIiwiQnVzeUxvY2tlciIsImlzTG9ja2VkIiwiX21hbmFnZURlZXBMaW5rU3RhcnR1cCIsImV4Y2VwdGlvbiIsInVubG9jayIsIlVJQ29tcG9uZW50Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBcHBDb21wb25lbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBGbGV4aWJsZUNvbHVtbkxheW91dCBmcm9tIFwic2FwL2YvRmxleGlibGVDb2x1bW5MYXlvdXRcIjtcbmltcG9ydCBBcHBTdGF0ZUhhbmRsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0FwcFN0YXRlSGFuZGxlclwiO1xuaW1wb3J0IFJvdXRlclByb3h5IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9yb3V0aW5nL1JvdXRlclByb3h5XCI7XG5pbXBvcnQgdHlwZSB7IENvbnRlbnREZW5zaXRpZXNUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IGxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB7IGNoYW5nZUNvbmZpZ3VyYXRpb24sIGNsZWFuUGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzIH0gZnJvbSBcInNhcC9mZS9jb3JlL21hbmlmZXN0TWVyZ2VyL0NoYW5nZVBhZ2VDb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgdHlwZSBSb290Vmlld0Jhc2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9yb290Vmlldy9Sb290Vmlld0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgdHlwZSB7IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9FbnZpcm9ubWVudFNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSB7IE5hdmlnYXRpb25TZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL05hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgeyBSb3V0aW5nU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9Sb3V0aW5nU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIHsgSVNoZWxsU2VydmljZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2hlbGxTZXJ2aWNlc0ZhY3RvcnlcIjtcbmltcG9ydCB0eXBlIHsgU2lkZUVmZmVjdHNTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NpZGVFZmZlY3RzU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBEaWFnbm9zdGljcyBmcm9tIFwic2FwL2ZlL2NvcmUvc3VwcG9ydC9EaWFnbm9zdGljc1wiO1xuaW1wb3J0IHR5cGUgTmF2Q29udGFpbmVyIGZyb20gXCJzYXAvbS9OYXZDb250YWluZXJcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgVUk1RWxlbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRWxlbWVudFwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBVSUNvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvVUlDb21wb25lbnRcIjtcbmltcG9ydCBUYWJsZVR5cGVCYXNlIGZyb20gXCJzYXAvdWkvbWRjL3RhYmxlL1RhYmxlVHlwZUJhc2VcIjtcbmltcG9ydCB0eXBlIE1hbmFnZWRPYmplY3RNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2Jhc2UvTWFuYWdlZE9iamVjdE1vZGVsXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgQnVzeUxvY2tlciBmcm9tIFwiLi9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgeyBkZWxldGVNb2RlbENhY2hlRGF0YSB9IGZyb20gXCIuL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgU2VtYW50aWNEYXRlT3BlcmF0b3JzIGZyb20gXCIuL2hlbHBlcnMvU2VtYW50aWNEYXRlT3BlcmF0b3JzXCI7XG5cbmNvbnN0IFN0YXJ0dXBNb2RlID0gbGlicmFyeS5TdGFydHVwTW9kZTtcblRhYmxlVHlwZUJhc2UucHJvdG90eXBlLmV4aXQgPSBmdW5jdGlvbiAodGhpczogeyBfb01hbmFnZWRPYmplY3RNb2RlbD86IE1hbmFnZWRPYmplY3RNb2RlbCB9KSB7XG5cdHRoaXMuX29NYW5hZ2VkT2JqZWN0TW9kZWw/LmRlc3Ryb3koKTtcblx0ZGVsZXRlIHRoaXMuX29NYW5hZ2VkT2JqZWN0TW9kZWw7XG5cdFVJNUVsZW1lbnQucHJvdG90eXBlLmV4aXQuYXBwbHkodGhpcywgW10pO1xufTtcbmNvbnN0IE5BVkNPTkYgPSB7XG5cdEZDTDoge1xuXHRcdFZJRVdOQU1FOiBcInNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbFwiLFxuXHRcdFZJRVdOQU1FX0NPTVBBVElCSUxJVFk6IFwic2FwLmZlLnRlbXBsYXRlcy5Sb290Q29udGFpbmVyLnZpZXcuRmNsXCIsXG5cdFx0Uk9VVEVSQ0xBU1M6IFwic2FwLmYucm91dGluZy5Sb3V0ZXJcIlxuXHR9LFxuXHROQVZDT05UQUlORVI6IHtcblx0XHRWSUVXTkFNRTogXCJzYXAuZmUuY29yZS5yb290Vmlldy5OYXZDb250YWluZXJcIixcblx0XHRWSUVXTkFNRV9DT01QQVRJQklMSVRZOiBcInNhcC5mZS50ZW1wbGF0ZXMuUm9vdENvbnRhaW5lci52aWV3Lk5hdkNvbnRhaW5lclwiLFxuXHRcdFJPVVRFUkNMQVNTOiBcInNhcC5tLnJvdXRpbmcuUm91dGVyXCJcblx0fVxufTtcblxuZXhwb3J0IHR5cGUgTWFuaWZlc3RDb250ZW50QXBwID0ge1xuXHRkYXRhU291cmNlczoge1xuXHRcdFt4OiBzdHJpbmddOiB7IHVyaTogc3RyaW5nIH07XG5cdH07XG5cdGlkOiBzdHJpbmc7XG5cdHR5cGU6IHN0cmluZztcblx0Y3Jvc3NOYXZpZ2F0aW9uPzoge1xuXHRcdG91dGJvdW5kcz86IFJlY29yZDxcblx0XHRcdHN0cmluZyxcblx0XHRcdHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IHN0cmluZztcblx0XHRcdFx0YWN0aW9uOiBzdHJpbmc7XG5cdFx0XHRcdHBhcmFtZXRlcnM6IHN0cmluZztcblx0XHRcdH1cblx0XHQ+O1xuXHR9O1xuXHR0aXRsZT86IHN0cmluZztcblx0c3ViVGl0bGU/OiBzdHJpbmc7XG5cdGljb24/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBNYW5pZmVzdENvbnRlbnRVSTUgPSB7XG5cdGNvbnRlbnREZW5zaXRpZXM/OiBDb250ZW50RGVuc2l0aWVzVHlwZTtcblx0cGFnZVJlYWR5VGltZW91dD86IG51bWJlcjtcblx0cm9vdFZpZXc/OiB7XG5cdFx0dmlld05hbWU6IHN0cmluZztcblx0fTtcblx0cm91dGluZz86IHtcblx0XHRjb25maWc/OiB7XG5cdFx0XHRyb3V0ZXJDbGFzczogc3RyaW5nO1xuXHRcdFx0Y29udHJvbElkPzogc3RyaW5nO1xuXHRcdH07XG5cdFx0cm91dGVzOiB7XG5cdFx0XHRwYXR0ZXJuOiBzdHJpbmc7XG5cdFx0XHRuYW1lOiBzdHJpbmc7XG5cdFx0XHR0YXJnZXQ6IHN0cmluZztcblx0XHR9W107XG5cdFx0dGFyZ2V0cz86IFJlY29yZDxcblx0XHRcdHN0cmluZyxcblx0XHRcdHtcblx0XHRcdFx0aWQ6IHN0cmluZztcblx0XHRcdFx0bmFtZTogc3RyaW5nO1xuXHRcdFx0XHRvcHRpb25zPzoge1xuXHRcdFx0XHRcdHNldHRpbmdzPzogb2JqZWN0O1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdD47XG5cdH07XG5cdG1vZGVsczogUmVjb3JkPFxuXHRcdHN0cmluZyxcblx0XHR7XG5cdFx0XHR0eXBlPzogc3RyaW5nO1xuXHRcdFx0ZGF0YVNvdXJjZT86IHN0cmluZztcblx0XHRcdHNldHRpbmdzPzogb2JqZWN0O1xuXHRcdH1cblx0Pjtcbn07XG5cbmV4cG9ydCB0eXBlIE1hbmlmZXN0Q29udGVudCA9IHtcblx0XCJzYXAuYXBwXCI/OiBNYW5pZmVzdENvbnRlbnRBcHA7XG5cdFwic2FwLnVpNVwiPzogTWFuaWZlc3RDb250ZW50VUk1O1xuXHRcInNhcC5mZVwiPzoge1xuXHRcdGZvcm0/OiB7XG5cdFx0XHRyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0PzogYm9vbGVhbjtcblx0XHR9O1xuXHR9O1xufTtcbmV4cG9ydCB0eXBlIENvbXBvbmVudERhdGEgPSB7XG5cdHN0YXJ0dXBQYXJhbWV0ZXJzPzoge1xuXHRcdHByZWZlcnJlZE1vZGU/OiBzdHJpbmdbXTtcblx0fSAmIFJlY29yZDxzdHJpbmcsIHVua25vd25bXT47XG5cdC8vZmVFbnZpcm9ubWVudCBpcyBvYmplY3Qgd2hpY2ggaXMgcmVjZWl2ZWQgYXMgYSBwYXJ0IG9mIHRoZSBjb21wb25lbnQgZGF0YSBmb3IgTXkgSW5ib3ggYXBwbGljYXRpb25zLlxuXHRmZUVudmlyb25tZW50Pzoge1xuXHRcdC8vV2l0aGluIHRoaXMgb2JqZWN0IHRoZXkgcGFzcyBhIGZ1bmN0aW9uIGNhbGxlZCBnZXRJbnRlbnQoKSB3aGljaCByZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIHRoZSBzZW1hbnRpY09iamVjdCBhbmQgYWN0aW9uIGFzIHNlcGFyYXRlIHByb3BlcnR5LXZhbHVlIGVudHJpZXMgdGhhdCBhcmUgdGhlbiB1c2VkIHRvIHVwZGF0ZSB0aGUgcmVsYXRlZCBhcHBzIGJ1dHRvbi5cblx0XHRnZXRJbnRlbnQ6IEZ1bmN0aW9uO1xuXHRcdC8vV2l0aGluIHRoaXMgb2JqZWN0IHRoZXkgcGFzcyBhIGZ1bmN0aW9uIGNhbGxlZCBnZXRTaGFyZUNvbnRyb2xWaXNpYmlsaXR5KCkgdGhhdCByZXR1cm5zIGJvb2xlYW4gdmFsdWVzKHRydWUgb3IgZmFsc2UpIHdoaWNoIGRldGVybWluZXMgdGhlIHZpc2liaWxpdHkgb2YgdGhlIHNoYXJlIGJ1dHRvbi5cblx0XHRnZXRTaGFyZUNvbnRyb2xWaXNpYmlsaXR5OiBGdW5jdGlvbjtcblx0fTtcbn07XG5cbmV4cG9ydCB0eXBlIFN0YXJ0dXBQYXJhbWV0ZXJzID0ge1xuXHRwcmVmZXJyZWRNb2RlPzogc3RyaW5nW107XG59ICYgUmVjb3JkPHN0cmluZywgdW5rbm93bltdPjtcbi8qKlxuICogTWFpbiBjbGFzcyBmb3IgY29tcG9uZW50cyB1c2VkIGZvciBhbiBhcHBsaWNhdGlvbiBpbiBTQVAgRmlvcmkgZWxlbWVudHMuXG4gKlxuICogQXBwbGljYXRpb24gZGV2ZWxvcGVycyB1c2luZyB0aGUgdGVtcGxhdGVzIGFuZCBidWlsZGluZyBibG9ja3MgcHJvdmlkZWQgYnkgU0FQIEZpb3JpIGVsZW1lbnRzIHNob3VsZCBjcmVhdGUgdGhlaXIgYXBwcyBieSBleHRlbmRpbmcgdGhpcyBjb21wb25lbnQuXG4gKiBUaGlzIGVuc3VyZXMgdGhhdCBhbGwgdGhlIG5lY2Vzc2FyeSBzZXJ2aWNlcyB0aGF0IHlvdSBuZWVkIGZvciB0aGUgYnVpbGRpbmcgYmxvY2tzIGFuZCB0ZW1wbGF0ZXMgdG8gd29yayBwcm9wZXJseSBhcmUgc3RhcnRlZC5cbiAqXG4gKiBXaGVuIHlvdSB1c2Ugc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50IGFzIHRoZSBiYXNlIGNvbXBvbmVudCwgeW91IGFsc28gbmVlZCB0byB1c2UgYSByb290Vmlldy4gU0FQIEZpb3JpIGVsZW1lbnRzIHByb3ZpZGVzIHR3byBvcHRpb25zOiA8YnIvPlxuICogIC0gc2FwLmZlLmNvcmUucm9vdFZpZXcuTmF2Q29udGFpbmVyIHdoZW4gdXNpbmcgc2FwLm0ucm91dGluZy5Sb3V0ZXIgPGJyLz5cbiAqICAtIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkZjbCB3aGVuIHVzaW5nIHNhcC5mLnJvdXRpbmcuUm91dGVyIChGQ0wgdXNlIGNhc2UpIDxici8+XG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFwiLCB7XG5cdGludGVyZmFjZXM6IFtcInNhcC51aS5jb3JlLklBc3luY0NvbnRlbnRDcmVhdGlvblwiXSxcblx0Y29uZmlnOiB7XG5cdFx0ZnVsbFdpZHRoOiB0cnVlXG5cdH0sXG5cdG1hbmlmZXN0OiB7XG5cdFx0XCJzYXAudWk1XCI6IHtcblx0XHRcdHNlcnZpY2VzOiB7XG5cdFx0XHRcdHJlc291cmNlTW9kZWw6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5SZXNvdXJjZU1vZGVsU2VydmljZVwiLFxuXHRcdFx0XHRcdHN0YXJ0dXA6IFwid2FpdEZvclwiLFxuXHRcdFx0XHRcdHNldHRpbmdzOiB7XG5cdFx0XHRcdFx0XHRidW5kbGVzOiBbXCJzYXAuZmUuY29yZS5tZXNzYWdlYnVuZGxlXCJdLFxuXHRcdFx0XHRcdFx0bW9kZWxOYW1lOiBcInNhcC5mZS5pMThuXCJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJvdXRpbmdTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuUm91dGluZ1NlcnZpY2VcIixcblx0XHRcdFx0XHRzdGFydHVwOiBcIndhaXRGb3JcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzaGVsbFNlcnZpY2VzOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuU2hlbGxTZXJ2aWNlc1wiLFxuXHRcdFx0XHRcdHN0YXJ0dXA6IFwid2FpdEZvclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdFNoZWxsVUlTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLnVzaGVsbC51aTVzZXJ2aWNlLlNoZWxsVUlTZXJ2aWNlXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0bmF2aWdhdGlvblNlcnZpY2U6IHtcblx0XHRcdFx0XHRmYWN0b3J5TmFtZTogXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5OYXZpZ2F0aW9uU2VydmljZVwiLFxuXHRcdFx0XHRcdHN0YXJ0dXA6IFwid2FpdEZvclwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVudmlyb25tZW50Q2FwYWJpbGl0aWVzOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuRW52aXJvbm1lbnRTZXJ2aWNlXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0c2lkZUVmZmVjdHNTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuU2lkZUVmZmVjdHNTZXJ2aWNlXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0YXN5bmNDb21wb25lbnRTZXJ2aWNlOiB7XG5cdFx0XHRcdFx0ZmFjdG9yeU5hbWU6IFwic2FwLmZlLmNvcmUuc2VydmljZXMuQXN5bmNDb21wb25lbnRTZXJ2aWNlXCIsXG5cdFx0XHRcdFx0c3RhcnR1cDogXCJ3YWl0Rm9yXCJcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHJvb3RWaWV3OiB7XG5cdFx0XHRcdHZpZXdOYW1lOiBOQVZDT05GLk5BVkNPTlRBSU5FUi5WSUVXTkFNRSxcblx0XHRcdFx0dHlwZTogXCJYTUxcIixcblx0XHRcdFx0YXN5bmM6IHRydWUsXG5cdFx0XHRcdGlkOiBcImFwcFJvb3RWaWV3XCJcblx0XHRcdH0sXG5cdFx0XHRyb3V0aW5nOiB7XG5cdFx0XHRcdGNvbmZpZzoge1xuXHRcdFx0XHRcdGNvbnRyb2xJZDogXCJhcHBDb250ZW50XCIsXG5cdFx0XHRcdFx0cm91dGVyQ2xhc3M6IE5BVkNPTkYuTkFWQ09OVEFJTkVSLlJPVVRFUkNMQVNTLFxuXHRcdFx0XHRcdHZpZXdUeXBlOiBcIlhNTFwiLFxuXHRcdFx0XHRcdGNvbnRyb2xBZ2dyZWdhdGlvbjogXCJwYWdlc1wiLFxuXHRcdFx0XHRcdGFzeW5jOiB0cnVlLFxuXHRcdFx0XHRcdGNvbnRhaW5lck9wdGlvbnM6IHtcblx0XHRcdFx0XHRcdHByb3BhZ2F0ZU1vZGVsOiB0cnVlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRkZXNpZ250aW1lOiBcInNhcC9mZS9jb3JlL2Rlc2lnbnRpbWUvQXBwQ29tcG9uZW50LmRlc2lnbnRpbWVcIixcblxuXHRsaWJyYXJ5OiBcInNhcC5mZS5jb3JlXCJcbn0pXG5jbGFzcyBBcHBDb21wb25lbnQgZXh0ZW5kcyBVSUNvbXBvbmVudCB7XG5cdHN0YXRpYyBpbnN0YW5jZU1hcDogUmVjb3JkPHN0cmluZywgQXBwQ29tcG9uZW50PiA9IHt9O1xuXG5cdHByaXZhdGUgX29Sb3V0ZXJQcm94eSE6IFJvdXRlclByb3h5O1xuXG5cdHByaXZhdGUgX29BcHBTdGF0ZUhhbmRsZXIhOiBBcHBTdGF0ZUhhbmRsZXI7XG5cblx0cHJpdmF0ZSBiSW5pdGlhbGl6ZVJvdXRpbmc/OiBib29sZWFuO1xuXG5cdHByaXZhdGUgX29EaWFnbm9zdGljcyE6IERpYWdub3N0aWNzO1xuXG5cdHByaXZhdGUgZW50aXR5Q29udGFpbmVyITogUHJvbWlzZTx2b2lkPjtcblxuXHRwcml2YXRlIHN0YXJ0dXBNb2RlOiBzdHJpbmcgPSBTdGFydHVwTW9kZS5Ob3JtYWw7XG5cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudC5nZXRNZXRhZGF0YVxuXHQgKiBAZnVuY3Rpb25cblx0ICovXG5cblx0X2lzRmNsRW5hYmxlZCgpIHtcblx0XHRjb25zdCBvTWFuaWZlc3RVSTUgPSB0aGlzLmdldE1hbmlmZXN0RW50cnkoXCJzYXAudWk1XCIpO1xuXHRcdHJldHVybiBvTWFuaWZlc3RVSTU/LnJvdXRpbmc/LmNvbmZpZz8ucm91dGVyQ2xhc3MgPT09IE5BVkNPTkYuRkNMLlJPVVRFUkNMQVNTO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIGEgaG9vayB0byBpbml0aWFsaXplIGZlYXR1cmUgdG9nZ2xlcy5cblx0ICpcblx0ICogVGhpcyBob29rIGlzIGJlaW5nIGNhbGxlZCBieSB0aGUgU0FQIEZpb3JpIGVsZW1lbnRzIEFwcENvbXBvbmVudCBhdCB0aGUgdGltZSBmZWF0dXJlIHRvZ2dsZXMgY2FuIGJlIGluaXRpYWxpemVkLlxuXHQgKiBUbyBjaGFuZ2UgcGFnZSBjb25maWd1cmF0aW9uIHVzZSB0aGUge0BsaW5rIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudCNjaGFuZ2VQYWdlQ29uZmlndXJhdGlvbn0gbWV0aG9kLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2luaXRpYWxpemVGZWF0dXJlVG9nZ2xlc1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFzeW5jIGluaXRpYWxpemVGZWF0dXJlVG9nZ2xlcygpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyB0aGlzIG1ldGhvZCBjYW4gYmUgb3ZlcnJpZGRlbiBieSBhcHBsaWNhdGlvbnNcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgcGFnZSBjb25maWd1cmF0aW9uIG9mIFNBUCBGaW9yaSBlbGVtZW50cy5cblx0ICpcblx0ICogVGhpcyBtZXRob2QgZW5hYmxlcyB5b3UgdG8gY2hhbmdlIHRoZSBwYWdlIGNvbmZpZ3VyYXRpb24gb2YgU0FQIEZpb3JpIGVsZW1lbnRzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50I2NoYW5nZVBhZ2VDb25maWd1cmF0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5BcHBDb21wb25lbnRcblx0ICogQHBhcmFtIHBhZ2VJZCBUaGUgSUQgb2YgdGhlIHBhZ2UgZm9yIHdoaWNoIHRoZSBjb25maWd1cmF0aW9uIGlzIHRvIGJlIGNoYW5nZWQuXG5cdCAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIGluIHRoZSBwYWdlIHNldHRpbmdzIGZvciB3aGljaCB0aGUgY29uZmlndXJhdGlvbiBpcyB0byBiZSBjaGFuZ2VkLlxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZSBvZiB0aGUgY29uZmlndXJhdGlvbi4gVGhpcyBjb3VsZCBiZSBhIHBsYWluIHZhbHVlIGxpa2UgYSBzdHJpbmcsIG9yIGEgQm9vbGVhbiwgb3IgYSBzdHJ1Y3R1cmVkIG9iamVjdC5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0Y2hhbmdlUGFnZUNvbmZpZ3VyYXRpb24ocGFnZUlkOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgdmFsdWU6IHVua25vd24pOiB2b2lkIHtcblx0XHRjaGFuZ2VDb25maWd1cmF0aW9uKHRoaXMuZ2V0TWFuaWZlc3QoKSwgcGFnZUlkLCBwYXRoLCB2YWx1ZSwgdHJ1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGEgcmVmZXJlbmNlIHRvIHRoZSBSb3V0ZXJQcm94eS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudCNnZXRSb3V0ZXJQcm94eVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XG5cdCAqIEByZXR1cm5zIEEgUmVmZXJlbmNlIHRvIHRoZSBSb3V0ZXJQcm94eVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRnZXRSb3V0ZXJQcm94eSgpOiBSb3V0ZXJQcm94eSB7XG5cdFx0cmV0dXJuIHRoaXMuX29Sb3V0ZXJQcm94eTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIEFwcFN0YXRlSGFuZGxlci5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudCNnZXRBcHBTdGF0ZUhhbmRsZXJcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFxuXHQgKiBAcmV0dXJucyBBIHJlZmVyZW5jZSB0byB0aGUgQXBwU3RhdGVIYW5kbGVyXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGdldEFwcFN0YXRlSGFuZGxlcigpIHtcblx0XHRyZXR1cm4gdGhpcy5fb0FwcFN0YXRlSGFuZGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgYSByZWZlcmVuY2UgdG8gdGhlIG5hdi9GQ0wgQ29udHJvbGxlci5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudCNnZXRSb290Vmlld0NvbnRyb2xsZXJcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFxuXHQgKiBAcmV0dXJucyAgQSByZWZlcmVuY2UgdG8gdGhlIEZDTCBDb250cm9sbGVyXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGdldFJvb3RWaWV3Q29udHJvbGxlcigpOiBSb290Vmlld0Jhc2VDb250cm9sbGVyIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRSb290Q29udHJvbCgpLmdldENvbnRyb2xsZXIoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIE5hdkNvbnRhaW5lciBjb250cm9sIG9yIHRoZSBGQ0wgY29udHJvbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudCNnZXRSb290Q29udGFpbmVyXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5BcHBDb21wb25lbnRcblx0ICogQHJldHVybnMgIEEgcmVmZXJlbmNlIHRvIE5hdkNvbnRhaW5lciBjb250cm9sIG9yIHRoZSBGQ0wgY29udHJvbFxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRnZXRSb290Q29udGFpbmVyKCkge1xuXHRcdHJldHVybiB0aGlzLmdldFJvb3RDb250cm9sKCkuZ2V0Q29udGVudCgpWzBdIGFzIE5hdkNvbnRhaW5lciB8IEZsZXhpYmxlQ29sdW1uTGF5b3V0O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgc3RhcnR1cCBtb2RlIG9mIHRoZSBhcHAuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBzdGFydHVwIG1vZGVcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldFN0YXJ0dXBNb2RlKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuc3RhcnR1cE1vZGU7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBzdGFydHVwIG1vZGUgZm9yIHRoZSBhcHAgdG8gJ0NyZWF0ZScuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRzZXRTdGFydHVwTW9kZUNyZWF0ZSgpIHtcblx0XHR0aGlzLnN0YXJ0dXBNb2RlID0gU3RhcnR1cE1vZGUuQ3JlYXRlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldCB0aGUgc3RhcnR1cCBtb2RlIGZvciB0aGUgYXBwIHRvICdBdXRvQ3JlYXRlJy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHNldFN0YXJ0dXBNb2RlQXV0b0NyZWF0ZSgpIHtcblx0XHR0aGlzLnN0YXJ0dXBNb2RlID0gU3RhcnR1cE1vZGUuQXV0b0NyZWF0ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIHN0YXJ0dXAgbW9kZSBmb3IgdGhlIGFwcCB0byAnRGVlcGxpbmsnLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0c2V0U3RhcnR1cE1vZGVEZWVwbGluaygpIHtcblx0XHR0aGlzLnN0YXJ0dXBNb2RlID0gU3RhcnR1cE1vZGUuRGVlcGxpbms7XG5cdH1cblxuXHRpbml0KCkge1xuXHRcdGNvbnN0IHVpTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdGVkaXRNb2RlOiBsaWJyYXJ5LkVkaXRNb2RlLkRpc3BsYXksXG5cdFx0XHRpc0VkaXRhYmxlOiBmYWxzZSxcblx0XHRcdGRyYWZ0U3RhdHVzOiBsaWJyYXJ5LkRyYWZ0U3RhdHVzLkNsZWFyLFxuXHRcdFx0YnVzeTogZmFsc2UsXG5cdFx0XHRidXN5TG9jYWw6IHt9LFxuXHRcdFx0cGFnZXM6IHt9XG5cdFx0fSk7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdHBhZ2VzOiB7fVxuXHRcdH0pO1xuXHRcdC8vIHNldCB0aGUgYmluZGluZyBPbmVXYXkgZm9yIHVpTW9kZWwgdG8gcHJldmVudCBjaGFuZ2VzIGlmIGNvbnRyb2xsZXIgZXh0ZW5zaW9ucyBtb2RpZnkgYSBib3VuZCBwcm9wZXJ0eSBvZiBhIGNvbnRyb2xcblx0XHR1aU1vZGVsLnNldERlZmF1bHRCaW5kaW5nTW9kZShcIk9uZVdheVwiKTtcblx0XHQvLyBmb3IgaW50ZXJuYWwgbW9kZWwgYmluZGluZyBuZWVkcyB0byBiZSB0d28gd2F5XG5cdFx0TW9kZWxIZWxwZXIuZW5oYW5jZVVpSlNPTk1vZGVsKHVpTW9kZWwsIGxpYnJhcnkpO1xuXHRcdE1vZGVsSGVscGVyLmVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbChvSW50ZXJuYWxNb2RlbCk7XG5cblx0XHR0aGlzLnNldE1vZGVsKHVpTW9kZWwsIFwidWlcIik7XG5cdFx0dGhpcy5zZXRNb2RlbChvSW50ZXJuYWxNb2RlbCwgXCJpbnRlcm5hbFwiKTtcblxuXHRcdHRoaXMuYkluaXRpYWxpemVSb3V0aW5nID0gdGhpcy5iSW5pdGlhbGl6ZVJvdXRpbmcgIT09IHVuZGVmaW5lZCA/IHRoaXMuYkluaXRpYWxpemVSb3V0aW5nIDogdHJ1ZTtcblx0XHR0aGlzLl9vUm91dGVyUHJveHkgPSBuZXcgUm91dGVyUHJveHkoKTtcblx0XHR0aGlzLl9vQXBwU3RhdGVIYW5kbGVyID0gbmV3IEFwcFN0YXRlSGFuZGxlcih0aGlzKTtcblx0XHR0aGlzLl9vRGlhZ25vc3RpY3MgPSBuZXcgRGlhZ25vc3RpY3MoKTtcblxuXHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuZ2V0TW9kZWwoKTtcblx0XHRpZiAob01vZGVsPy5pc0E/LihcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YU1vZGVsXCIpKSB7XG5cdFx0XHR0aGlzLmVudGl0eUNvbnRhaW5lciA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKS5yZXF1ZXN0T2JqZWN0KFwiLyRFbnRpdHlDb250YWluZXIvXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBub3QgYW4gT0RhdGEgdjQgc2VydmljZVxuXHRcdFx0dGhpcy5lbnRpdHlDb250YWluZXIgPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cblx0XHRjb25zdCBvTWFuaWZlc3RVSTUgPSB0aGlzLmdldE1hbmlmZXN0KClbXCJzYXAudWk1XCJdO1xuXHRcdGlmIChvTWFuaWZlc3RVSTU/LnJvb3RWaWV3Py52aWV3TmFtZSkge1xuXHRcdFx0Ly8gVGhlIGFwcGxpY2F0aW9uIHNwZWNpZmllZCBhbiBvd24gcm9vdCB2aWV3IGluIHRoZSBtYW5pZmVzdFxuXG5cdFx0XHQvLyBSb290IFZpZXcgd2FzIG1vdmVkIGZyb20gc2FwLmZlLnRlbXBsYXRlcyB0byBzYXAuZmUuY29yZSAtIGtlZXAgaXQgY29tcGF0aWJsZVxuXHRcdFx0aWYgKG9NYW5pZmVzdFVJNS5yb290Vmlldy52aWV3TmFtZSA9PT0gTkFWQ09ORi5GQ0wuVklFV05BTUVfQ09NUEFUSUJJTElUWSkge1xuXHRcdFx0XHRvTWFuaWZlc3RVSTUucm9vdFZpZXcudmlld05hbWUgPSBOQVZDT05GLkZDTC5WSUVXTkFNRTtcblx0XHRcdH0gZWxzZSBpZiAob01hbmlmZXN0VUk1LnJvb3RWaWV3LnZpZXdOYW1lID09PSBOQVZDT05GLk5BVkNPTlRBSU5FUi5WSUVXTkFNRV9DT01QQVRJQklMSVRZKSB7XG5cdFx0XHRcdG9NYW5pZmVzdFVJNS5yb290Vmlldy52aWV3TmFtZSA9IE5BVkNPTkYuTkFWQ09OVEFJTkVSLlZJRVdOQU1FO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9NYW5pZmVzdFVJNS5yb290Vmlldy52aWV3TmFtZSA9PT0gTkFWQ09ORi5GQ0wuVklFV05BTUUgJiZcblx0XHRcdFx0b01hbmlmZXN0VUk1LnJvdXRpbmc/LmNvbmZpZz8ucm91dGVyQ2xhc3MgPT09IE5BVkNPTkYuRkNMLlJPVVRFUkNMQVNTXG5cdFx0XHQpIHtcblx0XHRcdFx0TG9nLmluZm8oYFJvb3Rjb250YWluZXI6IFwiJHtOQVZDT05GLkZDTC5WSUVXTkFNRX1cIiAtIFJvdXRlcmNsYXNzOiBcIiR7TkFWQ09ORi5GQ0wuUk9VVEVSQ0xBU1N9XCJgKTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdG9NYW5pZmVzdFVJNS5yb290Vmlldy52aWV3TmFtZSA9PT0gTkFWQ09ORi5OQVZDT05UQUlORVIuVklFV05BTUUgJiZcblx0XHRcdFx0b01hbmlmZXN0VUk1LnJvdXRpbmc/LmNvbmZpZz8ucm91dGVyQ2xhc3MgPT09IE5BVkNPTkYuTkFWQ09OVEFJTkVSLlJPVVRFUkNMQVNTXG5cdFx0XHQpIHtcblx0XHRcdFx0TG9nLmluZm8oYFJvb3Rjb250YWluZXI6IFwiJHtOQVZDT05GLk5BVkNPTlRBSU5FUi5WSUVXTkFNRX1cIiAtIFJvdXRlcmNsYXNzOiBcIiR7TkFWQ09ORi5OQVZDT05UQUlORVIuUk9VVEVSQ0xBU1N9XCJgKTtcblx0XHRcdH0gZWxzZSBpZiAob01hbmlmZXN0VUk1LnJvb3RWaWV3Py52aWV3TmFtZT8uaW5kZXhPZihcInNhcC5mZS5jb3JlLnJvb3RWaWV3XCIpICE9PSAtMSkge1xuXHRcdFx0XHR0aHJvdyBFcnJvcihcblx0XHRcdFx0XHRgXFxuV3JvbmcgY29uZmlndXJhdGlvbiBmb3IgdGhlIGNvdXBsZSAocm9vdFZpZXcvcm91dGVyQ2xhc3MpIGluIG1hbmlmZXN0IGZpbGUuXFxuYCArXG5cdFx0XHRcdFx0XHRgQ3VycmVudCB2YWx1ZXMgYXJlIDooJHtvTWFuaWZlc3RVSTUucm9vdFZpZXcudmlld05hbWV9LyR7XG5cdFx0XHRcdFx0XHRcdG9NYW5pZmVzdFVJNS5yb3V0aW5nPy5jb25maWc/LnJvdXRlckNsYXNzIHx8IFwiPG1pc3Npbmcgcm91dGVyIGNsYXNzPlwiXG5cdFx0XHRcdFx0XHR9KVxcbmAgK1xuXHRcdFx0XHRcdFx0YEV4cGVjdGVkIHZhbHVlcyBhcmUgXFxuYCArXG5cdFx0XHRcdFx0XHRgXFx0IC0gKCR7TkFWQ09ORi5OQVZDT05UQUlORVIuVklFV05BTUV9LyR7TkFWQ09ORi5OQVZDT05UQUlORVIuUk9VVEVSQ0xBU1N9KVxcbmAgK1xuXHRcdFx0XHRcdFx0YFxcdCAtICgke05BVkNPTkYuRkNMLlZJRVdOQU1FfS8ke05BVkNPTkYuRkNMLlJPVVRFUkNMQVNTfSlgXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRMb2cuaW5mbyhgUm9vdGNvbnRhaW5lcjogXCIke29NYW5pZmVzdFVJNS5yb290Vmlldy52aWV3TmFtZX1cIiAtIFJvdXRlcmNsYXNzOiBcIiR7TkFWQ09ORi5OQVZDT05UQUlORVIuUk9VVEVSQ0xBU1N9XCJgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBBZGRpbmcgU2VtYW50aWMgRGF0ZSBPcGVyYXRvcnNcblx0XHQvLyBDb21tZW50aW5nIHNpbmNlIGl0IGlzIG5vdCBuZWVkZWQgZm9yIFNpbmdsZVJhbmdlXG5cdFx0U2VtYW50aWNEYXRlT3BlcmF0b3JzLmFkZFNlbWFudGljRGF0ZU9wZXJhdG9ycygpO1xuXG5cdFx0Ly8gdGhlIGluaXQgZnVuY3Rpb24gY29uZmlndXJlcyB0aGUgcm91dGluZyBhY2NvcmRpbmcgdG8gdGhlIHNldHRpbmdzIGFib3ZlXG5cdFx0Ly8gaXQgd2lsbCBjYWxsIHRoZSBjcmVhdGVDb250ZW50IGZ1bmN0aW9uIHRvIGluc3RhbnRpYXRlIHRoZSBSb290VmlldyBhbmQgYWRkIGl0IHRvIHRoZSBVSUNvbXBvbmVudCBhZ2dyZWdhdGlvbnNcblxuXHRcdHN1cGVyLmluaXQoKTtcblx0XHRBcHBDb21wb25lbnQuaW5zdGFuY2VNYXBbdGhpcy5nZXRJZCgpXSA9IHRoaXM7XG5cdH1cblxuXHRhc3luYyBvblNlcnZpY2VzU3RhcnRlZCgpIHtcblx0XHRhd2FpdCB0aGlzLmluaXRpYWxpemVGZWF0dXJlVG9nZ2xlcygpO1xuXG5cdFx0Ly9yb3V0ZXIgbXVzdCBiZSBzdGFydGVkIG9uY2UgdGhlIHJvb3Rjb250YWluZXIgaXMgaW5pdGlhbGl6ZWRcblx0XHQvL3N0YXJ0aW5nIG9mIHRoZSByb3V0ZXJcblx0XHRjb25zdCBmaW5hbGl6ZWRSb3V0aW5nSW5pdGlhbGl6YXRpb24gPSAoKSA9PiB7XG5cdFx0XHR0aGlzLmVudGl0eUNvbnRhaW5lclxuXHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0aWYgKHRoaXMuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkuYXR0YWNoUm91dGVNYXRjaGVycykge1xuXHRcdFx0XHRcdFx0dGhpcy5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS5hdHRhY2hSb3V0ZU1hdGNoZXJzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuZ2V0Um91dGVyKCkuaW5pdGlhbGl6ZSgpO1xuXHRcdFx0XHRcdHRoaXMuZ2V0Um91dGVyUHJveHkoKS5pbml0KHRoaXMsIHRoaXMuX2lzRmNsRW5hYmxlZCgpKTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaCgoZXJyb3I6IEVycm9yKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblxuXHRcdFx0XHRcdHRoaXMuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkuZGlzcGxheUVycm9yUGFnZShcblx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19BUFBfQ09NUE9ORU5UX1NBUEZFX0FQUFNUQVJUX1RFQ0hOSUNBTF9JU1NVRVNcIiksXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRpdGxlOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogZXJyb3IubWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0RkNMTGV2ZWw6IDBcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0aWYgKHRoaXMuYkluaXRpYWxpemVSb3V0aW5nKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRSb3V0aW5nU2VydmljZSgpXG5cdFx0XHRcdC5pbml0aWFsaXplUm91dGluZygpXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRpZiAodGhpcy5nZXRSb290Vmlld0NvbnRyb2xsZXIoKSkge1xuXHRcdFx0XHRcdFx0ZmluYWxpemVkUm91dGluZ0luaXRpYWxpemF0aW9uKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuZ2V0Um9vdENvbnRyb2woKS5hdHRhY2hBZnRlckluaXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRmaW5hbGl6ZWRSb3V0aW5nSW5pdGlhbGl6YXRpb24oKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyOiBFcnJvcikge1xuXHRcdFx0XHRcdExvZy5lcnJvcihgY2Fubm90IGNhbm5vdCBpbml0aWFsaXplIHJvdXRpbmc6ICR7ZXJyLnRvU3RyaW5nKCl9YCk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGV4aXQoKSB7XG5cdFx0dGhpcy5fb0FwcFN0YXRlSGFuZGxlci5kZXN0cm95KCk7XG5cdFx0dGhpcy5fb1JvdXRlclByb3h5LmRlc3Ryb3koKTtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGRlbGV0ZSB0aGlzLl9vQXBwU3RhdGVIYW5kbGVyO1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0ZGVsZXRlIHRoaXMuX29Sb3V0ZXJQcm94eTtcblx0XHRkZWxldGVNb2RlbENhY2hlRGF0YSh0aGlzLmdldE1ldGFNb2RlbCgpKTtcblx0XHR0aGlzLmdldE1vZGVsKFwidWlcIikuZGVzdHJveSgpO1xuXHRcdGNsZWFuUGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzKCk7XG5cdH1cblxuXHRnZXRNZXRhTW9kZWwoKTogT0RhdGFNZXRhTW9kZWwge1xuXHRcdHJldHVybiB0aGlzLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdH1cblxuXHRnZXREaWFnbm9zdGljcygpIHtcblx0XHRyZXR1cm4gdGhpcy5fb0RpYWdub3N0aWNzO1xuXHR9XG5cblx0ZGVzdHJveShiU3VwcHJlc3NJbnZhbGlkYXRlPzogYm9vbGVhbikge1xuXHRcdC8vIExFQUtTLCB3aXRoIHdvcmthcm91bmQgZm9yIHNvbWUgRmxleCAvIE1EQyBpc3N1ZVxuXHRcdHRyeSB7XG5cdFx0XHQvLyBcdC8vIFRoaXMgb25lIGlzIG9ubHkgYSBsZWFrIGlmIHlvdSBkb24ndCBnbyBiYWNrIHRvIHRoZSBzYW1lIGNvbXBvbmVudCBpbiB0aGUgbG9uZyBydW5cblx0XHRcdC8vZGVsZXRlIHNhcC51aS5mbC5GbGV4Q29udHJvbGxlckZhY3RvcnkuX2NvbXBvbmVudEluc3RhbnRpYXRpb25Qcm9taXNlc1t0aGlzLmdldElkKCldO1xuXG5cdFx0XHRkZWxldGUgQXBwQ29tcG9uZW50Lmluc3RhbmNlTWFwW3RoaXMuZ2V0SWQoKV07XG5cblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdGRlbGV0ZSAod2luZG93IGFzIHVua25vd24pLl9yb3V0aW5nO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdExvZy5pbmZvKGUgYXMgc3RyaW5nKTtcblx0XHR9XG5cblx0XHQvL1dPUktBUk9VTkQgZm9yIHN0aWNreSBkaXNjYXJkIHJlcXVlc3QgOiBkdWUgdG8gYXN5bmMgY2FsbGJhY2ssIHJlcXVlc3QgdHJpZ2dlcmVkIGJ5IHRoZSBleGl0QXBwbGljYXRpb24gd2lsbCBiZSBzZW5kIGFmdGVyIHRoZSBVSUNvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveVxuXHRcdC8vc28gd2UgbmVlZCB0byBjb3B5IHRoZSBSZXF1ZXN0b3IgaGVhZGVycyBhcyBpdCB3aWxsIGJlIGRlc3Ryb3lcblxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHQvLyBAdHMtaWdub3JlXG5cdFx0Y29uc3Qgb01haW5Nb2RlbCA9IHRoaXMub01vZGVsc1t1bmRlZmluZWRdO1xuXHRcdGxldCBvSGVhZGVycztcblx0XHRpZiAob01haW5Nb2RlbC5vUmVxdWVzdG9yKSB7XG5cdFx0XHRvSGVhZGVycyA9IGpRdWVyeS5leHRlbmQoe30sIG9NYWluTW9kZWwub1JlcXVlc3Rvci5tSGVhZGVycyk7XG5cdFx0fVxuXG5cdFx0Ly8gQXMgd2UgbmVlZCB0byBjbGVhbnVwIHRoZSBhcHBsaWNhdGlvbiAvIGhhbmRsZSB0aGUgZGlydHkgb2JqZWN0IHdlIG5lZWQgdG8gY2FsbCBvdXIgY2xlYW51cCBiZWZvcmUgdGhlIG1vZGVscyBhcmUgZGVzdHJveWVkXG5cdFx0dGhpcy5nZXRSb3V0aW5nU2VydmljZSgpPy5iZWZvcmVFeGl0KCk7XG5cdFx0c3VwZXIuZGVzdHJveShiU3VwcHJlc3NJbnZhbGlkYXRlKTtcblx0XHRpZiAob0hlYWRlcnMgJiYgb01haW5Nb2RlbC5vUmVxdWVzdG9yKSB7XG5cdFx0XHRvTWFpbk1vZGVsLm9SZXF1ZXN0b3IubUhlYWRlcnMgPSBvSGVhZGVycztcblx0XHR9XG5cdH1cblxuXHRnZXRSb3V0aW5nU2VydmljZSgpOiBSb3V0aW5nU2VydmljZSB7XG5cdFx0cmV0dXJuIHt9IGFzIFJvdXRpbmdTZXJ2aWNlOyAvLyBvdmVycmlkZW4gYXQgcnVudGltZVxuXHR9XG5cblx0Z2V0U2hlbGxTZXJ2aWNlcygpOiBJU2hlbGxTZXJ2aWNlcyB7XG5cdFx0cmV0dXJuIHt9IGFzIElTaGVsbFNlcnZpY2VzOyAvLyBvdmVycmlkZW4gYXQgcnVudGltZVxuXHR9XG5cblx0Z2V0TmF2aWdhdGlvblNlcnZpY2UoKTogTmF2aWdhdGlvblNlcnZpY2Uge1xuXHRcdHJldHVybiB7fSBhcyBOYXZpZ2F0aW9uU2VydmljZTsgLy8gb3ZlcnJpZGVuIGF0IHJ1bnRpbWVcblx0fVxuXG5cdGdldFNpZGVFZmZlY3RzU2VydmljZSgpOiBTaWRlRWZmZWN0c1NlcnZpY2Uge1xuXHRcdHJldHVybiB7fSBhcyBTaWRlRWZmZWN0c1NlcnZpY2U7XG5cdH1cblxuXHRnZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpOiBFbnZpcm9ubWVudENhcGFiaWxpdGllc1NlcnZpY2Uge1xuXHRcdHJldHVybiB7fSBhcyBFbnZpcm9ubWVudENhcGFiaWxpdGllc1NlcnZpY2U7XG5cdH1cblxuXHRhc3luYyBnZXRTdGFydHVwUGFyYW1ldGVycygpIHtcblx0XHRjb25zdCBvQ29tcG9uZW50RGF0YSA9IHRoaXMuZ2V0Q29tcG9uZW50RGF0YSgpO1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKG9Db21wb25lbnREYXRhICYmIG9Db21wb25lbnREYXRhLnN0YXJ0dXBQYXJhbWV0ZXJzKSB8fCB7fSk7XG5cdH1cblxuXHRyZXN0b3JlKCkge1xuXHRcdC8vIGNhbGxlZCBieSBGTFAgd2hlbiBhcHAgc2FwLWtlZXAtYWxpdmUgaXMgZW5hYmxlZCBhbmQgYXBwIGlzIHJlc3RvcmVkXG5cdFx0dGhpcy5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS52aWV3U3RhdGUub25SZXN0b3JlKCk7XG5cdH1cblxuXHRzdXNwZW5kKCkge1xuXHRcdC8vIGNhbGxlZCBieSBGTFAgd2hlbiBhcHAgc2FwLWtlZXAtYWxpdmUgaXMgZW5hYmxlZCBhbmQgYXBwIGlzIHN1c3BlbmRlZFxuXHRcdHRoaXMuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkudmlld1N0YXRlLm9uU3VzcGVuZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIG5hdmlnYXRlQmFzZWRPblN0YXJ0dXBQYXJhbWV0ZXIgZnVuY3Rpb24gaXMgYSBwdWJsaWMgYXBpIHRoYXQgYWN0cyBhcyBhIHdyYXBwZXIgdG8gX21hbmFnZURlZXBMaW5rU3RhcnR1cCBmdW5jdGlvbi4gSXQgcGFzc2VzIHRoZSBzdGFydHVwIHBhcmFtZXRlcnMgZnVydGhlciB0byBfbWFuYWdlRGVlcExpbmtTdGFydHVwIGZ1bmN0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSBzdGFydHVwUGFyYW1ldGVycyBEZWZpbmVzIHRoZSBzdGFydHVwIHBhcmFtZXRlcnMgd2hpY2ggaXMgZnVydGhlciBwYXNzZWQgdG8gX21hbmFnZURlZXBMaW5rU3RhcnR1cCBmdW5jdGlvbi5cblx0ICovXG5cblx0YXN5bmMgbmF2aWdhdGVCYXNlZE9uU3RhcnR1cFBhcmFtZXRlcihzdGFydHVwUGFyYW1ldGVyczogU3RhcnR1cFBhcmFtZXRlcnMgfCBudWxsIHwgdW5kZWZpbmVkKSB7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICghQnVzeUxvY2tlci5pc0xvY2tlZCh0aGlzLmdldE1vZGVsKFwidWlcIikpKSB7XG5cdFx0XHRcdGlmICghc3RhcnR1cFBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRzdGFydHVwUGFyYW1ldGVycyA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3Qgcm91dGluZ1NlcnZpY2UgPSB0aGlzLmdldFJvdXRpbmdTZXJ2aWNlKCk7XG5cdFx0XHRcdGF3YWl0IHJvdXRpbmdTZXJ2aWNlLl9tYW5hZ2VEZWVwTGlua1N0YXJ0dXAoc3RhcnR1cFBhcmFtZXRlcnMpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGV4Y2VwdGlvbjogdW5rbm93bikge1xuXHRcdFx0TG9nLmVycm9yKGV4Y2VwdGlvbiBhcyBzdHJpbmcpO1xuXHRcdFx0QnVzeUxvY2tlci51bmxvY2sodGhpcy5nZXRNb2RlbChcInVpXCIpKTtcblx0XHR9XG5cdH1cbn1cblxuaW50ZXJmYWNlIEFwcENvbXBvbmVudCBleHRlbmRzIFVJQ29tcG9uZW50IHtcblx0Z2V0TWFuaWZlc3QoKTogTWFuaWZlc3RDb250ZW50O1xuXHRnZXRNYW5pZmVzdEVudHJ5KGVudHJ5OiBcInNhcC5hcHBcIik6IE1hbmlmZXN0Q29udGVudEFwcDtcblx0Z2V0TWFuaWZlc3RFbnRyeShlbnRyeTogXCJzYXAudWk1XCIpOiBNYW5pZmVzdENvbnRlbnRVSTU7XG5cdGdldENvbXBvbmVudERhdGEoKTogQ29tcG9uZW50RGF0YTtcblx0Z2V0Um9vdENvbnRyb2woKToge1xuXHRcdGdldENvbnRyb2xsZXIoKTogUm9vdFZpZXdCYXNlQ29udHJvbGxlcjtcblx0fSAmIFZpZXc7XG5cdGdldE1vZGVsKCk6IE9EYXRhTW9kZWw7XG5cdGdldE1vZGVsKG5hbWU6IFwidWlcIik6IEpTT05Nb2RlbDtcblx0Z2V0TW9kZWwobmFtZTogc3RyaW5nKTogTW9kZWwgfCB1bmRlZmluZWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcENvbXBvbmVudDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7RUErQkEsTUFBTUEsV0FBVyxHQUFHQyxPQUFPLENBQUNELFdBQVc7RUFDdkNFLGFBQWEsQ0FBQ0MsU0FBUyxDQUFDQyxJQUFJLEdBQUcsWUFBK0Q7SUFBQTtJQUM3Riw2QkFBSSxDQUFDQyxvQkFBb0IsMERBQXpCLHNCQUEyQkMsT0FBTyxFQUFFO0lBQ3BDLE9BQU8sSUFBSSxDQUFDRCxvQkFBb0I7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
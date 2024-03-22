/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/LoaderUtils", "sap/fe/core/manifestMerger/ChangePageConfiguration", "sap/fe/core/TemplateModel", "sap/ui/core/Component", "sap/ui/core/mvc/View", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/core/service/ServiceFactoryRegistry", "sap/ui/Device", "sap/ui/model/base/ManagedObjectModel", "sap/ui/model/json/JSONModel", "sap/ui/VersionInfo", "../helpers/DynamicAnnotationPathHelper"], function (Log, LoaderUtils, ChangePageConfiguration, TemplateModel, Component, View, Service, ServiceFactory, ServiceFactoryRegistry, Device, ManagedObjectModel, JSONModel, VersionInfo, DynamicAnnotationPathHelper) {
  "use strict";

  var resolveDynamicExpression = DynamicAnnotationPathHelper.resolveDynamicExpression;
  var applyPageConfigurationChanges = ChangePageConfiguration.applyPageConfigurationChanges;
  var requireDependencies = LoaderUtils.requireDependencies;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  let TemplatedViewService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(TemplatedViewService, _Service);
    function TemplatedViewService() {
      return _Service.apply(this, arguments) || this;
    }
    var _proto = TemplatedViewService.prototype;
    _proto.init = function init() {
      const aServiceDependencies = [];
      const oContext = this.getContext();
      const oComponent = oContext.scopeObject;
      const oAppComponent = Component.getOwnerComponentFor(oComponent);
      const oMetaModel = oAppComponent.getMetaModel();
      this.pageId = oAppComponent.getLocalId(oComponent.getId());
      const sStableId = `${oAppComponent.getMetadata().getComponentName()}::${this.pageId}`;
      const aEnhanceI18n = oComponent.getEnhanceI18n() || [];
      let sAppNamespace;
      this.oFactory = oContext.factory;
      if (aEnhanceI18n) {
        sAppNamespace = oAppComponent.getMetadata().getComponentName();
        for (let i = 0; i < aEnhanceI18n.length; i++) {
          // In order to support text-verticalization applications can also passs a resource model defined in the manifest
          // UI5 takes care of text-verticalization for resource models defined in the manifest
          // Hence check if the given key is a resource model defined in the manifest
          // if so this model should be used to enhance the sap.fe resource model so pass it as it is
          const oResourceModel = oAppComponent.getModel(aEnhanceI18n[i]);
          if (oResourceModel && oResourceModel.isA("sap.ui.model.resource.ResourceModel")) {
            aEnhanceI18n[i] = oResourceModel;
          } else {
            aEnhanceI18n[i] = `${sAppNamespace}.${aEnhanceI18n[i].replace(".properties", "")}`;
          }
        }
      }
      const sCacheIdentifier = `${oAppComponent.getMetadata().getName()}_${sStableId}_${sap.ui.getCore().getConfiguration().getLanguageTag()}`;
      aServiceDependencies.push(ServiceFactoryRegistry.get("sap.fe.core.services.ResourceModelService").createInstance({
        scopeType: "component",
        scopeObject: oComponent,
        settings: {
          bundles: ["sap.fe.core.messagebundle", "sap.fe.macros.messagebundle", "sap.fe.templates.messagebundle"],
          enhanceI18n: aEnhanceI18n,
          modelName: "sap.fe.i18n"
        }
      }).then(oResourceModelService => {
        this.oResourceModelService = oResourceModelService;
        return oResourceModelService.getResourceModel();
      }));
      aServiceDependencies.push(ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").createInstance({
        settings: {
          metaModel: oMetaModel,
          appComponent: oAppComponent,
          component: oComponent
        }
      }).then(oCacheHandlerService => {
        this.oCacheHandlerService = oCacheHandlerService;
        return oCacheHandlerService.validateCacheKey(sCacheIdentifier, oComponent);
      }));
      aServiceDependencies.push(VersionInfo.load().then(function (oInfo) {
        let sTimestamp = "";
        if (!oInfo.libraries) {
          sTimestamp = sap.ui.buildinfo.buildtime;
        } else {
          oInfo.libraries.forEach(function (oLibrary) {
            sTimestamp += oLibrary.buildTimestamp;
          });
        }
        return sTimestamp;
      }).catch(function () {
        return "<NOVALUE>";
      }));
      this.initPromise = Promise.all(aServiceDependencies).then(async aDependenciesResult => {
        const oResourceModel = aDependenciesResult[0];
        const sCacheKey = aDependenciesResult[1];
        const oSideEffectsServices = oAppComponent.getSideEffectsService();
        oSideEffectsServices.initializeSideEffects(oAppComponent.getEnvironmentCapabilities().getCapabilities());
        const [TemplateConverter, MetaModelConverter] = await requireDependencies(["sap/fe/core/converters/TemplateConverter", "sap/fe/core/converters/MetaModelConverter"]);
        return this.createView(oResourceModel, sStableId, sCacheKey, TemplateConverter, MetaModelConverter);
      }).then(function (sCacheKey) {
        const oCacheHandlerService = ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").getInstance(oMetaModel);
        oCacheHandlerService.invalidateIfNeeded(sCacheKey, sCacheIdentifier, oComponent);
      });
    }

    /**
     * Refresh the current view using the same configuration as before.
     *
     * @param oComponent
     * @returns A promise indicating when the view is refreshed
     * @private
     */;
    _proto.refreshView = function refreshView(oComponent) {
      const oRootView = oComponent.getRootControl();
      if (oRootView) {
        oRootView.destroy();
      } else if (this.oView) {
        this.oView.destroy();
      }
      return this.createView(this.resourceModel, this.stableId, "", this.TemplateConverter, this.MetaModelConverter).then(function () {
        oComponent.oContainer.invalidate();
      }).catch(function (oError) {
        oComponent.oContainer.invalidate();
        Log.error(oError);
      });
    };
    _proto.createView = async function createView(oResourceModel, sStableId, sCacheKey, TemplateConverter, MetaModelConverter) {
      this.resourceModel = oResourceModel; // TODO: get rid, kept it for the time being
      this.stableId = sStableId;
      this.TemplateConverter = TemplateConverter;
      this.MetaModelConverter = MetaModelConverter;
      const oContext = this.getContext();
      const mServiceSettings = oContext.settings;
      const sConverterType = mServiceSettings.converterType;
      const oComponent = oContext.scopeObject;
      const oAppComponent = Component.getOwnerComponentFor(oComponent);
      const sFullContextPath = oAppComponent.getRoutingService().getTargetInformationFor(oComponent).options.settings.fullContextPath;
      const oMetaModel = oAppComponent.getMetaModel();
      const oManifestContent = oAppComponent.getManifest();
      const oDeviceModel = new JSONModel(Device).setDefaultBindingMode("OneWay");
      const oManifestModel = new JSONModel(oManifestContent);
      const bError = false;
      let oPageModel, oViewDataModel, oViewSettings, mViewData;
      // Load the index for the additional building blocks which is responsible for initializing them
      function getViewSettings() {
        const aSplitPath = sFullContextPath.split("/");
        const sEntitySetPath = aSplitPath.reduce(function (sPathSoFar, sNextPathPart) {
          if (sNextPathPart === "") {
            return sPathSoFar;
          }
          if (sPathSoFar === "") {
            sPathSoFar = `/${sNextPathPart}`;
          } else {
            const oTarget = oMetaModel.getObject(`${sPathSoFar}/$NavigationPropertyBinding/${sNextPathPart}`);
            if (oTarget && Object.keys(oTarget).length > 0) {
              sPathSoFar += "/$NavigationPropertyBinding";
            }
            sPathSoFar += `/${sNextPathPart}`;
          }
          return sPathSoFar;
        }, "");
        let viewType = mServiceSettings.viewType || oComponent.getViewType() || "XML";
        if (viewType !== "XML") {
          viewType = undefined;
        }
        return {
          type: viewType,
          preprocessors: {
            xml: {
              bindingContexts: {
                entitySet: sEntitySetPath ? oMetaModel.createBindingContext(sEntitySetPath) : null,
                fullContextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
                contextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
                converterContext: oPageModel.createBindingContext("/", undefined, {
                  noResolve: true
                }),
                viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
              },
              models: {
                entitySet: oMetaModel,
                fullContextPath: oMetaModel,
                contextPath: oMetaModel,
                "sap.fe.i18n": oResourceModel,
                metaModel: oMetaModel,
                device: oDeviceModel,
                manifest: oManifestModel,
                converterContext: oPageModel,
                viewData: oViewDataModel
              },
              appComponent: oAppComponent
            }
          },
          id: sStableId,
          viewName: mServiceSettings.viewName || oComponent.getViewName(),
          viewData: mViewData,
          cache: {
            keys: [sCacheKey],
            additionalData: {
              // We store the page model data in the `additionalData` of the view cache, this way it is always in sync
              getAdditionalCacheData: () => {
                return oPageModel.getData();
              },
              setAdditionalCacheData: value => {
                oPageModel.setData(value);
              }
            }
          },
          models: {
            "sap.fe.i18n": oResourceModel
          },
          height: "100%"
        };
      }
      const createErrorPage = reason => {
        // just replace the view name and add an additional model containing the reason, but
        // keep the other settings
        Log.error(reason.message, reason);
        oViewSettings.viewName = mServiceSettings.errorViewName || "sap.fe.core.services.view.TemplatingErrorPage";
        oViewSettings.preprocessors.xml.models["error"] = new JSONModel(reason);
        return oComponent.runAsOwner(() => {
          return View.create(oViewSettings).then(oView => {
            this.oView = oView;
            this.oView.setModel(new ManagedObjectModel(this.oView), "$view");
            oComponent.setAggregation("rootControl", this.oView);
            return sCacheKey;
          });
        });
      };
      try {
        var _oManifestContent$sap;
        const oRoutingService = await oAppComponent.getService("routingService");
        // Retrieve the viewLevel for the component
        const oTargetInfo = oRoutingService.getTargetInformationFor(oComponent);
        const mOutbounds = oManifestContent["sap.app"] && oManifestContent["sap.app"].crossNavigation && oManifestContent["sap.app"].crossNavigation.outbounds || {};
        const mNavigation = oComponent.getNavigation() || {};
        Object.keys(mNavigation).forEach(function (navigationObjectKey) {
          const navigationObject = mNavigation[navigationObjectKey];
          let outboundConfig;
          if (navigationObject.detail && navigationObject.detail.outbound && mOutbounds[navigationObject.detail.outbound]) {
            outboundConfig = mOutbounds[navigationObject.detail.outbound];
            navigationObject.detail.outboundDetail = {
              semanticObject: outboundConfig.semanticObject,
              action: outboundConfig.action,
              parameters: outboundConfig.parameters
            };
          }
          if (navigationObject.create && navigationObject.create.outbound && mOutbounds[navigationObject.create.outbound]) {
            outboundConfig = mOutbounds[navigationObject.create.outbound];
            navigationObject.create.outboundDetail = {
              semanticObject: outboundConfig.semanticObject,
              action: outboundConfig.action,
              parameters: outboundConfig.parameters
            };
          }
        });
        mViewData = {
          appComponent: oAppComponent,
          navigation: mNavigation,
          viewLevel: oTargetInfo.viewLevel,
          stableId: sStableId,
          contentDensities: (_oManifestContent$sap = oManifestContent["sap.ui5"]) === null || _oManifestContent$sap === void 0 ? void 0 : _oManifestContent$sap.contentDensities,
          resourceModel: oResourceModel,
          fullContextPath: sFullContextPath,
          isDesktop: Device.system.desktop,
          isPhone: Device.system.phone
        };
        if (oComponent.getViewData) {
          var _oManifestContent$sap2, _oManifestContent$sap3, _oManifestContent$sap4, _oManifestContent$sap5, _oManifestContent$sap6;
          Object.assign(mViewData, oComponent.getViewData());
          const actualSettings = (oManifestContent === null || oManifestContent === void 0 ? void 0 : (_oManifestContent$sap2 = oManifestContent["sap.ui5"]) === null || _oManifestContent$sap2 === void 0 ? void 0 : (_oManifestContent$sap3 = _oManifestContent$sap2.routing) === null || _oManifestContent$sap3 === void 0 ? void 0 : (_oManifestContent$sap4 = _oManifestContent$sap3.targets) === null || _oManifestContent$sap4 === void 0 ? void 0 : (_oManifestContent$sap5 = _oManifestContent$sap4[this.pageId]) === null || _oManifestContent$sap5 === void 0 ? void 0 : (_oManifestContent$sap6 = _oManifestContent$sap5.options) === null || _oManifestContent$sap6 === void 0 ? void 0 : _oManifestContent$sap6.settings) || {};
          mViewData = applyPageConfigurationChanges(actualSettings, mViewData, oAppComponent, this.pageId);
        }
        mViewData.isShareButtonVisibleForMyInbox = TemplatedViewServiceFactory.getShareButtonVisibilityForMyInbox(oAppComponent);
        const oShellServices = oAppComponent.getShellServices();
        mViewData.converterType = sConverterType;
        mViewData.shellContentDensity = oShellServices.getContentDensity();
        mViewData.retrieveTextFromValueList = oManifestContent["sap.fe"] && oManifestContent["sap.fe"].form ? oManifestContent["sap.fe"].form.retrieveTextFromValueList : undefined;
        oViewDataModel = new JSONModel(mViewData);
        if (mViewData.controlConfiguration) {
          for (const sAnnotationPath in mViewData.controlConfiguration) {
            if (sAnnotationPath.indexOf("[") !== -1) {
              const sTargetAnnotationPath = resolveDynamicExpression(sAnnotationPath, oMetaModel);
              mViewData.controlConfiguration[sTargetAnnotationPath] = mViewData.controlConfiguration[sAnnotationPath];
            }
          }
        }
        MetaModelConverter.convertTypes(oMetaModel, oAppComponent.getEnvironmentCapabilities().getCapabilities());
        oPageModel = new TemplateModel(() => {
          try {
            const oDiagnostics = oAppComponent.getDiagnostics();
            const iIssueCount = oDiagnostics.getIssues().length;
            const oConverterPageModel = TemplateConverter.convertPage(sConverterType, oMetaModel, mViewData, oDiagnostics, sFullContextPath, oAppComponent.getEnvironmentCapabilities().getCapabilities(), oComponent);
            const aIssues = oDiagnostics.getIssues();
            const aAddedIssues = aIssues.slice(iIssueCount);
            if (aAddedIssues.length > 0) {
              Log.warning("Some issues have been detected in your project, please check the UI5 support assistant rule for sap.fe.core");
            }
            return oConverterPageModel;
          } catch (error) {
            Log.error(error, error);
            return {};
          }
        }, oMetaModel);
        if (!bError) {
          oViewSettings = getViewSettings();
          // Setting the pageModel on the component for potential reuse
          oComponent.setModel(oPageModel, "_pageModel");
          return oComponent.runAsOwner(() => {
            return View.create(oViewSettings).catch(createErrorPage).then(oView => {
              this.oView = oView;
              this.oView.setModel(new ManagedObjectModel(this.oView), "$view");
              this.oView.setModel(oViewDataModel, "viewData");
              oComponent.setAggregation("rootControl", this.oView);
              return sCacheKey;
            }).catch(e => Log.error(e.message, e));
          });
        }
      } catch (error) {
        Log.error(error.message, error);
        throw new Error(`Error while creating view : ${error}`);
      }
    };
    _proto.getView = function getView() {
      return this.oView;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    _proto.exit = function exit() {
      // Deregister global instance
      if (this.oResourceModelService) {
        this.oResourceModelService.destroy();
      }
      if (this.oCacheHandlerService) {
        this.oCacheHandlerService.destroy();
      }
      this.oFactory.removeGlobalInstance();
    };
    return TemplatedViewService;
  }(Service);
  let TemplatedViewServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(TemplatedViewServiceFactory, _ServiceFactory);
    function TemplatedViewServiceFactory() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ServiceFactory.call(this, ...args) || this;
      _this._oInstanceRegistry = {};
      return _this;
    }
    var _proto2 = TemplatedViewServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      TemplatedViewServiceFactory.iCreatingViews++;
      const oTemplatedViewService = new TemplatedViewService(Object.assign({
        factory: this
      }, oServiceContext));
      return oTemplatedViewService.initPromise.then(function () {
        TemplatedViewServiceFactory.iCreatingViews--;
        return oTemplatedViewService;
      });
    };
    _proto2.removeGlobalInstance = function removeGlobalInstance() {
      this._oInstanceRegistry = {};
    }

    /**
     * @description This function checks if the component data specifies the visibility of the 'Share' button and returns true or false based on the visibility
     * @param appComponent Specifies the app component
     * @returns Boolean value as true or false based whether the 'Share' button should be visible or not
     */;
    TemplatedViewServiceFactory.getShareButtonVisibilityForMyInbox = function getShareButtonVisibilityForMyInbox(appComponent) {
      const componentData = appComponent.getComponentData();
      if (componentData !== undefined && componentData.feEnvironment) {
        return componentData.feEnvironment.getShareControlVisibility();
      }
      return undefined;
    };
    TemplatedViewServiceFactory.getNumberOfViewsInCreationState = function getNumberOfViewsInCreationState() {
      return TemplatedViewServiceFactory.iCreatingViews;
    };
    return TemplatedViewServiceFactory;
  }(ServiceFactory);
  return TemplatedViewServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZWRWaWV3U2VydmljZSIsImluaXQiLCJhU2VydmljZURlcGVuZGVuY2llcyIsIm9Db250ZXh0IiwiZ2V0Q29udGV4dCIsIm9Db21wb25lbnQiLCJzY29wZU9iamVjdCIsIm9BcHBDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJwYWdlSWQiLCJnZXRMb2NhbElkIiwiZ2V0SWQiLCJzU3RhYmxlSWQiLCJnZXRNZXRhZGF0YSIsImdldENvbXBvbmVudE5hbWUiLCJhRW5oYW5jZUkxOG4iLCJnZXRFbmhhbmNlSTE4biIsInNBcHBOYW1lc3BhY2UiLCJvRmFjdG9yeSIsImZhY3RvcnkiLCJpIiwibGVuZ3RoIiwib1Jlc291cmNlTW9kZWwiLCJnZXRNb2RlbCIsImlzQSIsInJlcGxhY2UiLCJzQ2FjaGVJZGVudGlmaWVyIiwiZ2V0TmFtZSIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImdldENvbmZpZ3VyYXRpb24iLCJnZXRMYW5ndWFnZVRhZyIsInB1c2giLCJTZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5IiwiZ2V0IiwiY3JlYXRlSW5zdGFuY2UiLCJzY29wZVR5cGUiLCJzZXR0aW5ncyIsImJ1bmRsZXMiLCJlbmhhbmNlSTE4biIsIm1vZGVsTmFtZSIsInRoZW4iLCJvUmVzb3VyY2VNb2RlbFNlcnZpY2UiLCJnZXRSZXNvdXJjZU1vZGVsIiwibWV0YU1vZGVsIiwiYXBwQ29tcG9uZW50IiwiY29tcG9uZW50Iiwib0NhY2hlSGFuZGxlclNlcnZpY2UiLCJ2YWxpZGF0ZUNhY2hlS2V5IiwiVmVyc2lvbkluZm8iLCJsb2FkIiwib0luZm8iLCJzVGltZXN0YW1wIiwibGlicmFyaWVzIiwiYnVpbGRpbmZvIiwiYnVpbGR0aW1lIiwiZm9yRWFjaCIsIm9MaWJyYXJ5IiwiYnVpbGRUaW1lc3RhbXAiLCJjYXRjaCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsImFsbCIsImFEZXBlbmRlbmNpZXNSZXN1bHQiLCJzQ2FjaGVLZXkiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlcyIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsImluaXRpYWxpemVTaWRlRWZmZWN0cyIsImdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiZ2V0Q2FwYWJpbGl0aWVzIiwiVGVtcGxhdGVDb252ZXJ0ZXIiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJyZXF1aXJlRGVwZW5kZW5jaWVzIiwiY3JlYXRlVmlldyIsImdldEluc3RhbmNlIiwiaW52YWxpZGF0ZUlmTmVlZGVkIiwicmVmcmVzaFZpZXciLCJvUm9vdFZpZXciLCJnZXRSb290Q29udHJvbCIsImRlc3Ryb3kiLCJvVmlldyIsInJlc291cmNlTW9kZWwiLCJzdGFibGVJZCIsIm9Db250YWluZXIiLCJpbnZhbGlkYXRlIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJtU2VydmljZVNldHRpbmdzIiwic0NvbnZlcnRlclR5cGUiLCJjb252ZXJ0ZXJUeXBlIiwic0Z1bGxDb250ZXh0UGF0aCIsImdldFJvdXRpbmdTZXJ2aWNlIiwiZ2V0VGFyZ2V0SW5mb3JtYXRpb25Gb3IiLCJvcHRpb25zIiwiZnVsbENvbnRleHRQYXRoIiwib01hbmlmZXN0Q29udGVudCIsImdldE1hbmlmZXN0Iiwib0RldmljZU1vZGVsIiwiSlNPTk1vZGVsIiwiRGV2aWNlIiwic2V0RGVmYXVsdEJpbmRpbmdNb2RlIiwib01hbmlmZXN0TW9kZWwiLCJiRXJyb3IiLCJvUGFnZU1vZGVsIiwib1ZpZXdEYXRhTW9kZWwiLCJvVmlld1NldHRpbmdzIiwibVZpZXdEYXRhIiwiZ2V0Vmlld1NldHRpbmdzIiwiYVNwbGl0UGF0aCIsInNwbGl0Iiwic0VudGl0eVNldFBhdGgiLCJyZWR1Y2UiLCJzUGF0aFNvRmFyIiwic05leHRQYXRoUGFydCIsIm9UYXJnZXQiLCJnZXRPYmplY3QiLCJPYmplY3QiLCJrZXlzIiwidmlld1R5cGUiLCJnZXRWaWV3VHlwZSIsInVuZGVmaW5lZCIsInR5cGUiLCJwcmVwcm9jZXNzb3JzIiwieG1sIiwiYmluZGluZ0NvbnRleHRzIiwiZW50aXR5U2V0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJjb250ZXh0UGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJub1Jlc29sdmUiLCJ2aWV3RGF0YSIsIm1vZGVscyIsImRldmljZSIsIm1hbmlmZXN0IiwiaWQiLCJ2aWV3TmFtZSIsImdldFZpZXdOYW1lIiwiY2FjaGUiLCJhZGRpdGlvbmFsRGF0YSIsImdldEFkZGl0aW9uYWxDYWNoZURhdGEiLCJnZXREYXRhIiwic2V0QWRkaXRpb25hbENhY2hlRGF0YSIsInZhbHVlIiwic2V0RGF0YSIsImhlaWdodCIsImNyZWF0ZUVycm9yUGFnZSIsInJlYXNvbiIsIm1lc3NhZ2UiLCJlcnJvclZpZXdOYW1lIiwicnVuQXNPd25lciIsIlZpZXciLCJjcmVhdGUiLCJzZXRNb2RlbCIsIk1hbmFnZWRPYmplY3RNb2RlbCIsInNldEFnZ3JlZ2F0aW9uIiwib1JvdXRpbmdTZXJ2aWNlIiwiZ2V0U2VydmljZSIsIm9UYXJnZXRJbmZvIiwibU91dGJvdW5kcyIsImNyb3NzTmF2aWdhdGlvbiIsIm91dGJvdW5kcyIsIm1OYXZpZ2F0aW9uIiwiZ2V0TmF2aWdhdGlvbiIsIm5hdmlnYXRpb25PYmplY3RLZXkiLCJuYXZpZ2F0aW9uT2JqZWN0Iiwib3V0Ym91bmRDb25maWciLCJkZXRhaWwiLCJvdXRib3VuZCIsIm91dGJvdW5kRGV0YWlsIiwic2VtYW50aWNPYmplY3QiLCJhY3Rpb24iLCJwYXJhbWV0ZXJzIiwibmF2aWdhdGlvbiIsInZpZXdMZXZlbCIsImNvbnRlbnREZW5zaXRpZXMiLCJpc0Rlc2t0b3AiLCJzeXN0ZW0iLCJkZXNrdG9wIiwiaXNQaG9uZSIsInBob25lIiwiZ2V0Vmlld0RhdGEiLCJhc3NpZ24iLCJhY3R1YWxTZXR0aW5ncyIsInJvdXRpbmciLCJ0YXJnZXRzIiwiYXBwbHlQYWdlQ29uZmlndXJhdGlvbkNoYW5nZXMiLCJpc1NoYXJlQnV0dG9uVmlzaWJsZUZvck15SW5ib3giLCJUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkiLCJnZXRTaGFyZUJ1dHRvblZpc2liaWxpdHlGb3JNeUluYm94Iiwib1NoZWxsU2VydmljZXMiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2hlbGxDb250ZW50RGVuc2l0eSIsImdldENvbnRlbnREZW5zaXR5IiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsImZvcm0iLCJjb250cm9sQ29uZmlndXJhdGlvbiIsInNBbm5vdGF0aW9uUGF0aCIsImluZGV4T2YiLCJzVGFyZ2V0QW5ub3RhdGlvblBhdGgiLCJyZXNvbHZlRHluYW1pY0V4cHJlc3Npb24iLCJjb252ZXJ0VHlwZXMiLCJUZW1wbGF0ZU1vZGVsIiwib0RpYWdub3N0aWNzIiwiZ2V0RGlhZ25vc3RpY3MiLCJpSXNzdWVDb3VudCIsImdldElzc3VlcyIsIm9Db252ZXJ0ZXJQYWdlTW9kZWwiLCJjb252ZXJ0UGFnZSIsImFJc3N1ZXMiLCJhQWRkZWRJc3N1ZXMiLCJzbGljZSIsIndhcm5pbmciLCJlIiwiRXJyb3IiLCJnZXRWaWV3IiwiZ2V0SW50ZXJmYWNlIiwiZXhpdCIsInJlbW92ZUdsb2JhbEluc3RhbmNlIiwiU2VydmljZSIsIl9vSW5zdGFuY2VSZWdpc3RyeSIsIm9TZXJ2aWNlQ29udGV4dCIsImlDcmVhdGluZ1ZpZXdzIiwib1RlbXBsYXRlZFZpZXdTZXJ2aWNlIiwiY29tcG9uZW50RGF0YSIsImdldENvbXBvbmVudERhdGEiLCJmZUVudmlyb25tZW50IiwiZ2V0U2hhcmVDb250cm9sVmlzaWJpbGl0eSIsImdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUiLCJTZXJ2aWNlRmFjdG9yeSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCB0eXBlIHsgQ29tcG9uZW50RGF0YSwgTWFuaWZlc3RDb250ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgeyBDb250ZW50RGVuc2l0aWVzVHlwZSwgQ29udHJvbENvbmZpZ3VyYXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBWYXJpYW50TWFuYWdlbWVudFR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyByZXF1aXJlRGVwZW5kZW5jaWVzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTG9hZGVyVXRpbHNcIjtcbmltcG9ydCB7IGFwcGx5UGFnZUNvbmZpZ3VyYXRpb25DaGFuZ2VzIH0gZnJvbSBcInNhcC9mZS9jb3JlL21hbmlmZXN0TWVyZ2VyL0NoYW5nZVBhZ2VDb25maWd1cmF0aW9uXCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBDYWNoZUhhbmRsZXJTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL0NhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgVGVtcGxhdGVNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVNb2RlbFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBTZXJ2aWNlIGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VcIjtcbmltcG9ydCBTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5UmVnaXN0cnkgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZUZhY3RvcnlSZWdpc3RyeVwiO1xuaW1wb3J0IERldmljZSBmcm9tIFwic2FwL3VpL0RldmljZVwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3RNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2Jhc2UvTWFuYWdlZE9iamVjdE1vZGVsXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTW9kZWxcIjtcbmltcG9ydCBWZXJzaW9uSW5mbyBmcm9tIFwic2FwL3VpL1ZlcnNpb25JbmZvXCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZpY2VDb250ZXh0IH0gZnJvbSBcInR5cGVzL21ldGFtb2RlbF90eXBlc1wiO1xuaW1wb3J0IHsgcmVzb2x2ZUR5bmFtaWNFeHByZXNzaW9uIH0gZnJvbSBcIi4uL2hlbHBlcnMvRHluYW1pY0Fubm90YXRpb25QYXRoSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFJlc291cmNlTW9kZWxTZXJ2aWNlIH0gZnJvbSBcIi4vUmVzb3VyY2VNb2RlbFNlcnZpY2VGYWN0b3J5XCI7XG50eXBlIFRlbXBsYXRlZFZpZXdTZXJ2aWNlU2V0dGluZ3MgPSB7fTtcbmV4cG9ydCB0eXBlIFZpZXdEYXRhID0ge1xuXHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudDtcblx0bmF2aWdhdGlvbjogb2JqZWN0O1xuXHR2aWV3TGV2ZWw6IG51bWJlcjtcblx0dmFyaWFudE1hbmFnZW1lbnQ/OiBWYXJpYW50TWFuYWdlbWVudFR5cGU7XG5cdHN0YWJsZUlkOiBzdHJpbmc7XG5cdGNvbnRlbnREZW5zaXRpZXM/OiBDb250ZW50RGVuc2l0aWVzVHlwZTtcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbDtcblx0ZnVsbENvbnRleHRQYXRoOiBzdHJpbmc7XG5cdGlzRGVza3RvcDogYm9vbGVhbjtcblx0aXNQaG9uZTogYm9vbGVhbjtcblx0Y29udmVydGVyVHlwZT86IHN0cmluZztcblx0c2hlbGxDb250ZW50RGVuc2l0eT86IHN0cmluZztcblx0dXNlTmV3TGF6eUxvYWRpbmc/OiBib29sZWFuO1xuXHRyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0PzogYm9vbGVhbjtcblx0Y29udHJvbENvbmZpZ3VyYXRpb24/OiBDb250cm9sQ29uZmlndXJhdGlvbjtcblx0ZW50aXR5U2V0Pzogc3RyaW5nO1xuXHRpc1NoYXJlQnV0dG9uVmlzaWJsZUZvck15SW5ib3g/OiBib29sZWFuO1xufTtcbmNsYXNzIFRlbXBsYXRlZFZpZXdTZXJ2aWNlIGV4dGVuZHMgU2VydmljZTxUZW1wbGF0ZWRWaWV3U2VydmljZVNldHRpbmdzPiB7XG5cdGluaXRQcm9taXNlITogUHJvbWlzZTxhbnk+O1xuXG5cdG9WaWV3ITogVmlldztcblxuXHRvUmVzb3VyY2VNb2RlbFNlcnZpY2UhOiBSZXNvdXJjZU1vZGVsU2VydmljZTtcblxuXHRvQ2FjaGVIYW5kbGVyU2VydmljZSE6IENhY2hlSGFuZGxlclNlcnZpY2U7XG5cblx0b0ZhY3RvcnkhOiBUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3Rvcnk7XG5cblx0cmVzb3VyY2VNb2RlbCE6IFJlc291cmNlTW9kZWw7XG5cblx0c3RhYmxlSWQhOiBzdHJpbmc7XG5cblx0cGFnZUlkITogc3RyaW5nO1xuXG5cdFRlbXBsYXRlQ29udmVydGVyOiBhbnk7XG5cblx0TWV0YU1vZGVsQ29udmVydGVyOiBhbnk7XG5cblx0aW5pdCgpIHtcblx0XHRjb25zdCBhU2VydmljZURlcGVuZGVuY2llcyA9IFtdO1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob0NvbXBvbmVudCkgYXMgQXBwQ29tcG9uZW50O1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpO1xuXHRcdHRoaXMucGFnZUlkID0gb0FwcENvbXBvbmVudC5nZXRMb2NhbElkKG9Db21wb25lbnQuZ2V0SWQoKSkgYXMgc3RyaW5nO1xuXHRcdGNvbnN0IHNTdGFibGVJZCA9IGAke29BcHBDb21wb25lbnQuZ2V0TWV0YWRhdGEoKS5nZXRDb21wb25lbnROYW1lKCl9Ojoke3RoaXMucGFnZUlkfWA7XG5cdFx0Y29uc3QgYUVuaGFuY2VJMThuID0gb0NvbXBvbmVudC5nZXRFbmhhbmNlSTE4bigpIHx8IFtdO1xuXHRcdGxldCBzQXBwTmFtZXNwYWNlO1xuXHRcdHRoaXMub0ZhY3RvcnkgPSBvQ29udGV4dC5mYWN0b3J5O1xuXHRcdGlmIChhRW5oYW5jZUkxOG4pIHtcblx0XHRcdHNBcHBOYW1lc3BhY2UgPSBvQXBwQ29tcG9uZW50LmdldE1ldGFkYXRhKCkuZ2V0Q29tcG9uZW50TmFtZSgpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhRW5oYW5jZUkxOG4ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gSW4gb3JkZXIgdG8gc3VwcG9ydCB0ZXh0LXZlcnRpY2FsaXphdGlvbiBhcHBsaWNhdGlvbnMgY2FuIGFsc28gcGFzc3MgYSByZXNvdXJjZSBtb2RlbCBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHQvLyBVSTUgdGFrZXMgY2FyZSBvZiB0ZXh0LXZlcnRpY2FsaXphdGlvbiBmb3IgcmVzb3VyY2UgbW9kZWxzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG5cdFx0XHRcdC8vIEhlbmNlIGNoZWNrIGlmIHRoZSBnaXZlbiBrZXkgaXMgYSByZXNvdXJjZSBtb2RlbCBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHQvLyBpZiBzbyB0aGlzIG1vZGVsIHNob3VsZCBiZSB1c2VkIHRvIGVuaGFuY2UgdGhlIHNhcC5mZSByZXNvdXJjZSBtb2RlbCBzbyBwYXNzIGl0IGFzIGl0IGlzXG5cdFx0XHRcdGNvbnN0IG9SZXNvdXJjZU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNb2RlbChhRW5oYW5jZUkxOG5baV0pO1xuXHRcdFx0XHRpZiAob1Jlc291cmNlTW9kZWwgJiYgb1Jlc291cmNlTW9kZWwuaXNBKFwic2FwLnVpLm1vZGVsLnJlc291cmNlLlJlc291cmNlTW9kZWxcIikpIHtcblx0XHRcdFx0XHRhRW5oYW5jZUkxOG5baV0gPSBvUmVzb3VyY2VNb2RlbDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhRW5oYW5jZUkxOG5baV0gPSBgJHtzQXBwTmFtZXNwYWNlfS4ke2FFbmhhbmNlSTE4bltpXS5yZXBsYWNlKFwiLnByb3BlcnRpZXNcIiwgXCJcIil9YDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBzQ2FjaGVJZGVudGlmaWVyID0gYCR7b0FwcENvbXBvbmVudC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKX1fJHtzU3RhYmxlSWR9XyR7c2FwLnVpXG5cdFx0XHQuZ2V0Q29yZSgpXG5cdFx0XHQuZ2V0Q29uZmlndXJhdGlvbigpXG5cdFx0XHQuZ2V0TGFuZ3VhZ2VUYWcoKX1gO1xuXHRcdGFTZXJ2aWNlRGVwZW5kZW5jaWVzLnB1c2goXG5cdFx0XHRTZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LmdldChcInNhcC5mZS5jb3JlLnNlcnZpY2VzLlJlc291cmNlTW9kZWxTZXJ2aWNlXCIpXG5cdFx0XHRcdC5jcmVhdGVJbnN0YW5jZSh7XG5cdFx0XHRcdFx0c2NvcGVUeXBlOiBcImNvbXBvbmVudFwiLFxuXHRcdFx0XHRcdHNjb3BlT2JqZWN0OiBvQ29tcG9uZW50LFxuXHRcdFx0XHRcdHNldHRpbmdzOiB7XG5cdFx0XHRcdFx0XHRidW5kbGVzOiBbXCJzYXAuZmUuY29yZS5tZXNzYWdlYnVuZGxlXCIsIFwic2FwLmZlLm1hY3Jvcy5tZXNzYWdlYnVuZGxlXCIsIFwic2FwLmZlLnRlbXBsYXRlcy5tZXNzYWdlYnVuZGxlXCJdLFxuXHRcdFx0XHRcdFx0ZW5oYW5jZUkxOG46IGFFbmhhbmNlSTE4bixcblx0XHRcdFx0XHRcdG1vZGVsTmFtZTogXCJzYXAuZmUuaTE4blwiXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigob1Jlc291cmNlTW9kZWxTZXJ2aWNlOiBSZXNvdXJjZU1vZGVsU2VydmljZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMub1Jlc291cmNlTW9kZWxTZXJ2aWNlID0gb1Jlc291cmNlTW9kZWxTZXJ2aWNlO1xuXHRcdFx0XHRcdHJldHVybiBvUmVzb3VyY2VNb2RlbFNlcnZpY2UuZ2V0UmVzb3VyY2VNb2RlbCgpO1xuXHRcdFx0XHR9KVxuXHRcdCk7XG5cdFx0YVNlcnZpY2VEZXBlbmRlbmNpZXMucHVzaChcblx0XHRcdFNlcnZpY2VGYWN0b3J5UmVnaXN0cnkuZ2V0KFwic2FwLmZlLmNvcmUuc2VydmljZXMuQ2FjaGVIYW5kbGVyU2VydmljZVwiKVxuXHRcdFx0XHQuY3JlYXRlSW5zdGFuY2Uoe1xuXHRcdFx0XHRcdHNldHRpbmdzOiB7XG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRhcHBDb21wb25lbnQ6IG9BcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0XHRjb21wb25lbnQ6IG9Db21wb25lbnRcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKChvQ2FjaGVIYW5kbGVyU2VydmljZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5vQ2FjaGVIYW5kbGVyU2VydmljZSA9IG9DYWNoZUhhbmRsZXJTZXJ2aWNlO1xuXHRcdFx0XHRcdHJldHVybiBvQ2FjaGVIYW5kbGVyU2VydmljZS52YWxpZGF0ZUNhY2hlS2V5KHNDYWNoZUlkZW50aWZpZXIsIG9Db21wb25lbnQpO1xuXHRcdFx0XHR9KVxuXHRcdCk7XG5cdFx0YVNlcnZpY2VEZXBlbmRlbmNpZXMucHVzaChcblx0XHRcdChWZXJzaW9uSW5mbyBhcyBhbnkpXG5cdFx0XHRcdC5sb2FkKClcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9JbmZvOiBhbnkpIHtcblx0XHRcdFx0XHRsZXQgc1RpbWVzdGFtcCA9IFwiXCI7XG5cdFx0XHRcdFx0aWYgKCFvSW5mby5saWJyYXJpZXMpIHtcblx0XHRcdFx0XHRcdHNUaW1lc3RhbXAgPSAoc2FwLnVpIGFzIGFueSkuYnVpbGRpbmZvLmJ1aWxkdGltZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b0luZm8ubGlicmFyaWVzLmZvckVhY2goZnVuY3Rpb24gKG9MaWJyYXJ5OiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0c1RpbWVzdGFtcCArPSBvTGlicmFyeS5idWlsZFRpbWVzdGFtcDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gc1RpbWVzdGFtcDtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXR1cm4gXCI8Tk9WQUxVRT5cIjtcblx0XHRcdFx0fSlcblx0XHQpO1xuXHRcdHRoaXMuaW5pdFByb21pc2UgPSBQcm9taXNlLmFsbChhU2VydmljZURlcGVuZGVuY2llcylcblx0XHRcdC50aGVuKGFzeW5jIChhRGVwZW5kZW5jaWVzUmVzdWx0OiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvUmVzb3VyY2VNb2RlbCA9IGFEZXBlbmRlbmNpZXNSZXN1bHRbMF0gYXMgUmVzb3VyY2VNb2RlbDtcblx0XHRcdFx0Y29uc3Qgc0NhY2hlS2V5ID0gYURlcGVuZGVuY2llc1Jlc3VsdFsxXTtcblx0XHRcdFx0Y29uc3Qgb1NpZGVFZmZlY3RzU2VydmljZXMgPSBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRcdFx0XHRvU2lkZUVmZmVjdHNTZXJ2aWNlcy5pbml0aWFsaXplU2lkZUVmZmVjdHMob0FwcENvbXBvbmVudC5nZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpLmdldENhcGFiaWxpdGllcygpKTtcblx0XHRcdFx0Y29uc3QgW1RlbXBsYXRlQ29udmVydGVyLCBNZXRhTW9kZWxDb252ZXJ0ZXJdID0gYXdhaXQgcmVxdWlyZURlcGVuZGVuY2llcyhbXG5cdFx0XHRcdFx0XCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL1RlbXBsYXRlQ29udmVydGVyXCIsXG5cdFx0XHRcdFx0XCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiXG5cdFx0XHRcdF0pO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jcmVhdGVWaWV3KG9SZXNvdXJjZU1vZGVsLCBzU3RhYmxlSWQsIHNDYWNoZUtleSwgVGVtcGxhdGVDb252ZXJ0ZXIsIE1ldGFNb2RlbENvbnZlcnRlcik7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHNDYWNoZUtleTogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9DYWNoZUhhbmRsZXJTZXJ2aWNlID0gU2VydmljZUZhY3RvcnlSZWdpc3RyeS5nZXQoXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5DYWNoZUhhbmRsZXJTZXJ2aWNlXCIpLmdldEluc3RhbmNlKG9NZXRhTW9kZWwpO1xuXHRcdFx0XHRvQ2FjaGVIYW5kbGVyU2VydmljZS5pbnZhbGlkYXRlSWZOZWVkZWQoc0NhY2hlS2V5LCBzQ2FjaGVJZGVudGlmaWVyLCBvQ29tcG9uZW50KTtcblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlZnJlc2ggdGhlIGN1cnJlbnQgdmlldyB1c2luZyB0aGUgc2FtZSBjb25maWd1cmF0aW9uIGFzIGJlZm9yZS5cblx0ICpcblx0ICogQHBhcmFtIG9Db21wb25lbnRcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGluZGljYXRpbmcgd2hlbiB0aGUgdmlldyBpcyByZWZyZXNoZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHJlZnJlc2hWaWV3KG9Db21wb25lbnQ6IGFueSkge1xuXHRcdGNvbnN0IG9Sb290VmlldyA9IG9Db21wb25lbnQuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRpZiAob1Jvb3RWaWV3KSB7XG5cdFx0XHRvUm9vdFZpZXcuZGVzdHJveSgpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5vVmlldykge1xuXHRcdFx0dGhpcy5vVmlldy5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmNyZWF0ZVZpZXcodGhpcy5yZXNvdXJjZU1vZGVsLCB0aGlzLnN0YWJsZUlkLCBcIlwiLCB0aGlzLlRlbXBsYXRlQ29udmVydGVyLCB0aGlzLk1ldGFNb2RlbENvbnZlcnRlcilcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0b0NvbXBvbmVudC5vQ29udGFpbmVyLmludmFsaWRhdGUoKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdG9Db21wb25lbnQub0NvbnRhaW5lci5pbnZhbGlkYXRlKCk7XG5cdFx0XHRcdExvZy5lcnJvcihvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHRhc3luYyBjcmVhdGVWaWV3KFxuXHRcdG9SZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsLFxuXHRcdHNTdGFibGVJZDogYW55LFxuXHRcdHNDYWNoZUtleTogYW55LFxuXHRcdFRlbXBsYXRlQ29udmVydGVyOiBhbnksXG5cdFx0TWV0YU1vZGVsQ29udmVydGVyOiBhbnlcblx0KTogUHJvbWlzZTxhbnkgfCB2b2lkPiB7XG5cdFx0dGhpcy5yZXNvdXJjZU1vZGVsID0gb1Jlc291cmNlTW9kZWw7IC8vIFRPRE86IGdldCByaWQsIGtlcHQgaXQgZm9yIHRoZSB0aW1lIGJlaW5nXG5cdFx0dGhpcy5zdGFibGVJZCA9IHNTdGFibGVJZDtcblx0XHR0aGlzLlRlbXBsYXRlQ29udmVydGVyID0gVGVtcGxhdGVDb252ZXJ0ZXI7XG5cdFx0dGhpcy5NZXRhTW9kZWxDb252ZXJ0ZXIgPSBNZXRhTW9kZWxDb252ZXJ0ZXI7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLmdldENvbnRleHQoKTtcblx0XHRjb25zdCBtU2VydmljZVNldHRpbmdzID0gb0NvbnRleHQuc2V0dGluZ3M7XG5cdFx0Y29uc3Qgc0NvbnZlcnRlclR5cGUgPSBtU2VydmljZVNldHRpbmdzLmNvbnZlcnRlclR5cGU7XG5cdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcihvQ29tcG9uZW50KSBhcyBBcHBDb21wb25lbnQ7XG5cdFx0Y29uc3Qgc0Z1bGxDb250ZXh0UGF0aCA9IG9BcHBDb21wb25lbnQuZ2V0Um91dGluZ1NlcnZpY2UoKS5nZXRUYXJnZXRJbmZvcm1hdGlvbkZvcihvQ29tcG9uZW50KS5vcHRpb25zLnNldHRpbmdzLmZ1bGxDb250ZXh0UGF0aDtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBvTWFuaWZlc3RDb250ZW50OiBNYW5pZmVzdENvbnRlbnQgPSBvQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0KCk7XG5cdFx0Y29uc3Qgb0RldmljZU1vZGVsID0gbmV3IEpTT05Nb2RlbChEZXZpY2UpLnNldERlZmF1bHRCaW5kaW5nTW9kZShcIk9uZVdheVwiKTtcblx0XHRjb25zdCBvTWFuaWZlc3RNb2RlbCA9IG5ldyBKU09OTW9kZWwob01hbmlmZXN0Q29udGVudCk7XG5cdFx0Y29uc3QgYkVycm9yID0gZmFsc2U7XG5cdFx0bGV0IG9QYWdlTW9kZWw6IFRlbXBsYXRlTW9kZWwsIG9WaWV3RGF0YU1vZGVsOiBNb2RlbCwgb1ZpZXdTZXR0aW5nczogYW55LCBtVmlld0RhdGE6IFZpZXdEYXRhO1xuXHRcdC8vIExvYWQgdGhlIGluZGV4IGZvciB0aGUgYWRkaXRpb25hbCBidWlsZGluZyBibG9ja3Mgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yIGluaXRpYWxpemluZyB0aGVtXG5cdFx0ZnVuY3Rpb24gZ2V0Vmlld1NldHRpbmdzKCkge1xuXHRcdFx0Y29uc3QgYVNwbGl0UGF0aCA9IHNGdWxsQ29udGV4dFBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBhU3BsaXRQYXRoLnJlZHVjZShmdW5jdGlvbiAoc1BhdGhTb0ZhcjogYW55LCBzTmV4dFBhdGhQYXJ0OiBhbnkpIHtcblx0XHRcdFx0aWYgKHNOZXh0UGF0aFBhcnQgPT09IFwiXCIpIHtcblx0XHRcdFx0XHRyZXR1cm4gc1BhdGhTb0Zhcjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc1BhdGhTb0ZhciA9PT0gXCJcIikge1xuXHRcdFx0XHRcdHNQYXRoU29GYXIgPSBgLyR7c05leHRQYXRoUGFydH1gO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IG9UYXJnZXQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aFNvRmFyfS8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy8ke3NOZXh0UGF0aFBhcnR9YCk7XG5cdFx0XHRcdFx0aWYgKG9UYXJnZXQgJiYgT2JqZWN0LmtleXMob1RhcmdldCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0c1BhdGhTb0ZhciArPSBcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzUGF0aFNvRmFyICs9IGAvJHtzTmV4dFBhdGhQYXJ0fWA7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHNQYXRoU29GYXI7XG5cdFx0XHR9LCBcIlwiKTtcblx0XHRcdGxldCB2aWV3VHlwZSA9IG1TZXJ2aWNlU2V0dGluZ3Mudmlld1R5cGUgfHwgb0NvbXBvbmVudC5nZXRWaWV3VHlwZSgpIHx8IFwiWE1MXCI7XG5cdFx0XHRpZiAodmlld1R5cGUgIT09IFwiWE1MXCIpIHtcblx0XHRcdFx0dmlld1R5cGUgPSB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiB2aWV3VHlwZSxcblx0XHRcdFx0cHJlcHJvY2Vzc29yczoge1xuXHRcdFx0XHRcdHhtbDoge1xuXHRcdFx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0XHRcdGVudGl0eVNldDogc0VudGl0eVNldFBhdGggPyBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNFbnRpdHlTZXRQYXRoKSA6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGZ1bGxDb250ZXh0UGF0aDogc0Z1bGxDb250ZXh0UGF0aCA/IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bGxDb250ZXh0UGF0aCkgOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogc0Z1bGxDb250ZXh0UGF0aCA/IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bGxDb250ZXh0UGF0aCkgOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBvUGFnZU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiLCB1bmRlZmluZWQsIHsgbm9SZXNvbHZlOiB0cnVlIH0pLFxuXHRcdFx0XHRcdFx0XHR2aWV3RGF0YTogbVZpZXdEYXRhID8gb1ZpZXdEYXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpIDogbnVsbFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGZ1bGxDb250ZXh0UGF0aDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdFwic2FwLmZlLmkxOG5cIjogb1Jlc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0ZGV2aWNlOiBvRGV2aWNlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG1hbmlmZXN0OiBvTWFuaWZlc3RNb2RlbCxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogb1BhZ2VNb2RlbCxcblx0XHRcdFx0XHRcdFx0dmlld0RhdGE6IG9WaWV3RGF0YU1vZGVsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0YXBwQ29tcG9uZW50OiBvQXBwQ29tcG9uZW50XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpZDogc1N0YWJsZUlkLFxuXHRcdFx0XHR2aWV3TmFtZTogbVNlcnZpY2VTZXR0aW5ncy52aWV3TmFtZSB8fCBvQ29tcG9uZW50LmdldFZpZXdOYW1lKCksXG5cdFx0XHRcdHZpZXdEYXRhOiBtVmlld0RhdGEsXG5cdFx0XHRcdGNhY2hlOiB7XG5cdFx0XHRcdFx0a2V5czogW3NDYWNoZUtleV0sXG5cdFx0XHRcdFx0YWRkaXRpb25hbERhdGE6IHtcblx0XHRcdFx0XHRcdC8vIFdlIHN0b3JlIHRoZSBwYWdlIG1vZGVsIGRhdGEgaW4gdGhlIGBhZGRpdGlvbmFsRGF0YWAgb2YgdGhlIHZpZXcgY2FjaGUsIHRoaXMgd2F5IGl0IGlzIGFsd2F5cyBpbiBzeW5jXG5cdFx0XHRcdFx0XHRnZXRBZGRpdGlvbmFsQ2FjaGVEYXRhOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAob1BhZ2VNb2RlbCBhcyB1bmtub3duIGFzIEpTT05Nb2RlbCkuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHNldEFkZGl0aW9uYWxDYWNoZURhdGE6ICh2YWx1ZTogb2JqZWN0KSA9PiB7XG5cdFx0XHRcdFx0XHRcdChvUGFnZU1vZGVsIGFzIHVua25vd24gYXMgSlNPTk1vZGVsKS5zZXREYXRhKHZhbHVlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFwic2FwLmZlLmkxOG5cIjogb1Jlc291cmNlTW9kZWxcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVpZ2h0OiBcIjEwMCVcIlxuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y29uc3QgY3JlYXRlRXJyb3JQYWdlID0gKHJlYXNvbjogYW55KSA9PiB7XG5cdFx0XHQvLyBqdXN0IHJlcGxhY2UgdGhlIHZpZXcgbmFtZSBhbmQgYWRkIGFuIGFkZGl0aW9uYWwgbW9kZWwgY29udGFpbmluZyB0aGUgcmVhc29uLCBidXRcblx0XHRcdC8vIGtlZXAgdGhlIG90aGVyIHNldHRpbmdzXG5cdFx0XHRMb2cuZXJyb3IocmVhc29uLm1lc3NhZ2UsIHJlYXNvbik7XG5cdFx0XHRvVmlld1NldHRpbmdzLnZpZXdOYW1lID0gbVNlcnZpY2VTZXR0aW5ncy5lcnJvclZpZXdOYW1lIHx8IFwic2FwLmZlLmNvcmUuc2VydmljZXMudmlldy5UZW1wbGF0aW5nRXJyb3JQYWdlXCI7XG5cdFx0XHRvVmlld1NldHRpbmdzLnByZXByb2Nlc3NvcnMueG1sLm1vZGVsc1tcImVycm9yXCJdID0gbmV3IEpTT05Nb2RlbChyZWFzb24pO1xuXHRcdFx0cmV0dXJuIG9Db21wb25lbnQucnVuQXNPd25lcigoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBWaWV3LmNyZWF0ZShvVmlld1NldHRpbmdzKS50aGVuKChvVmlldzogYW55KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5vVmlldyA9IG9WaWV3O1xuXHRcdFx0XHRcdHRoaXMub1ZpZXcuc2V0TW9kZWwobmV3IE1hbmFnZWRPYmplY3RNb2RlbCh0aGlzLm9WaWV3KSwgXCIkdmlld1wiKTtcblx0XHRcdFx0XHRvQ29tcG9uZW50LnNldEFnZ3JlZ2F0aW9uKFwicm9vdENvbnRyb2xcIiwgdGhpcy5vVmlldyk7XG5cdFx0XHRcdFx0cmV0dXJuIHNDYWNoZUtleTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBvUm91dGluZ1NlcnZpY2UgPSBhd2FpdCBvQXBwQ29tcG9uZW50LmdldFNlcnZpY2UoXCJyb3V0aW5nU2VydmljZVwiKTtcblx0XHRcdC8vIFJldHJpZXZlIHRoZSB2aWV3TGV2ZWwgZm9yIHRoZSBjb21wb25lbnRcblx0XHRcdGNvbnN0IG9UYXJnZXRJbmZvID0gb1JvdXRpbmdTZXJ2aWNlLmdldFRhcmdldEluZm9ybWF0aW9uRm9yKG9Db21wb25lbnQpO1xuXHRcdFx0Y29uc3QgbU91dGJvdW5kcyA9XG5cdFx0XHRcdChvTWFuaWZlc3RDb250ZW50W1wic2FwLmFwcFwiXSAmJlxuXHRcdFx0XHRcdG9NYW5pZmVzdENvbnRlbnRbXCJzYXAuYXBwXCJdLmNyb3NzTmF2aWdhdGlvbiAmJlxuXHRcdFx0XHRcdG9NYW5pZmVzdENvbnRlbnRbXCJzYXAuYXBwXCJdLmNyb3NzTmF2aWdhdGlvbi5vdXRib3VuZHMpIHx8XG5cdFx0XHRcdHt9O1xuXHRcdFx0Y29uc3QgbU5hdmlnYXRpb24gPSBvQ29tcG9uZW50LmdldE5hdmlnYXRpb24oKSB8fCB7fTtcblx0XHRcdE9iamVjdC5rZXlzKG1OYXZpZ2F0aW9uKS5mb3JFYWNoKGZ1bmN0aW9uIChuYXZpZ2F0aW9uT2JqZWN0S2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0Y29uc3QgbmF2aWdhdGlvbk9iamVjdCA9IG1OYXZpZ2F0aW9uW25hdmlnYXRpb25PYmplY3RLZXldO1xuXHRcdFx0XHRsZXQgb3V0Ym91bmRDb25maWc7XG5cdFx0XHRcdGlmIChuYXZpZ2F0aW9uT2JqZWN0LmRldGFpbCAmJiBuYXZpZ2F0aW9uT2JqZWN0LmRldGFpbC5vdXRib3VuZCAmJiBtT3V0Ym91bmRzW25hdmlnYXRpb25PYmplY3QuZGV0YWlsLm91dGJvdW5kXSkge1xuXHRcdFx0XHRcdG91dGJvdW5kQ29uZmlnID0gbU91dGJvdW5kc1tuYXZpZ2F0aW9uT2JqZWN0LmRldGFpbC5vdXRib3VuZF07XG5cdFx0XHRcdFx0bmF2aWdhdGlvbk9iamVjdC5kZXRhaWwub3V0Ym91bmREZXRhaWwgPSB7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb3V0Ym91bmRDb25maWcuc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRhY3Rpb246IG91dGJvdW5kQ29uZmlnLmFjdGlvbixcblx0XHRcdFx0XHRcdHBhcmFtZXRlcnM6IG91dGJvdW5kQ29uZmlnLnBhcmFtZXRlcnNcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChuYXZpZ2F0aW9uT2JqZWN0LmNyZWF0ZSAmJiBuYXZpZ2F0aW9uT2JqZWN0LmNyZWF0ZS5vdXRib3VuZCAmJiBtT3V0Ym91bmRzW25hdmlnYXRpb25PYmplY3QuY3JlYXRlLm91dGJvdW5kXSkge1xuXHRcdFx0XHRcdG91dGJvdW5kQ29uZmlnID0gbU91dGJvdW5kc1tuYXZpZ2F0aW9uT2JqZWN0LmNyZWF0ZS5vdXRib3VuZF07XG5cdFx0XHRcdFx0bmF2aWdhdGlvbk9iamVjdC5jcmVhdGUub3V0Ym91bmREZXRhaWwgPSB7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb3V0Ym91bmRDb25maWcuc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRhY3Rpb246IG91dGJvdW5kQ29uZmlnLmFjdGlvbixcblx0XHRcdFx0XHRcdHBhcmFtZXRlcnM6IG91dGJvdW5kQ29uZmlnLnBhcmFtZXRlcnNcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdG1WaWV3RGF0YSA9IHtcblx0XHRcdFx0YXBwQ29tcG9uZW50OiBvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRuYXZpZ2F0aW9uOiBtTmF2aWdhdGlvbixcblx0XHRcdFx0dmlld0xldmVsOiBvVGFyZ2V0SW5mby52aWV3TGV2ZWwsXG5cdFx0XHRcdHN0YWJsZUlkOiBzU3RhYmxlSWQsXG5cdFx0XHRcdGNvbnRlbnREZW5zaXRpZXM6IG9NYW5pZmVzdENvbnRlbnRbXCJzYXAudWk1XCJdPy5jb250ZW50RGVuc2l0aWVzLFxuXHRcdFx0XHRyZXNvdXJjZU1vZGVsOiBvUmVzb3VyY2VNb2RlbCxcblx0XHRcdFx0ZnVsbENvbnRleHRQYXRoOiBzRnVsbENvbnRleHRQYXRoLFxuXHRcdFx0XHRpc0Rlc2t0b3A6IChEZXZpY2UgYXMgYW55KS5zeXN0ZW0uZGVza3RvcCxcblx0XHRcdFx0aXNQaG9uZTogKERldmljZSBhcyBhbnkpLnN5c3RlbS5waG9uZVxuXHRcdFx0fTtcblx0XHRcdGlmIChvQ29tcG9uZW50LmdldFZpZXdEYXRhKSB7XG5cdFx0XHRcdE9iamVjdC5hc3NpZ24obVZpZXdEYXRhLCBvQ29tcG9uZW50LmdldFZpZXdEYXRhKCkpO1xuXHRcdFx0XHRjb25zdCBhY3R1YWxTZXR0aW5ncyA9IG9NYW5pZmVzdENvbnRlbnQ/LltcInNhcC51aTVcIl0/LnJvdXRpbmc/LnRhcmdldHM/Llt0aGlzLnBhZ2VJZF0/Lm9wdGlvbnM/LnNldHRpbmdzIHx8IHt9O1xuXHRcdFx0XHRtVmlld0RhdGEgPSBhcHBseVBhZ2VDb25maWd1cmF0aW9uQ2hhbmdlcyhhY3R1YWxTZXR0aW5ncywgbVZpZXdEYXRhLCBvQXBwQ29tcG9uZW50LCB0aGlzLnBhZ2VJZCk7XG5cdFx0XHR9XG5cdFx0XHRtVmlld0RhdGEuaXNTaGFyZUJ1dHRvblZpc2libGVGb3JNeUluYm94ID0gVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5LmdldFNoYXJlQnV0dG9uVmlzaWJpbGl0eUZvck15SW5ib3gob0FwcENvbXBvbmVudCk7XG5cdFx0XHRjb25zdCBvU2hlbGxTZXJ2aWNlcyA9IG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdFx0bVZpZXdEYXRhLmNvbnZlcnRlclR5cGUgPSBzQ29udmVydGVyVHlwZTtcblx0XHRcdG1WaWV3RGF0YS5zaGVsbENvbnRlbnREZW5zaXR5ID0gb1NoZWxsU2VydmljZXMuZ2V0Q29udGVudERlbnNpdHkoKTtcblx0XHRcdG1WaWV3RGF0YS5yZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0ID1cblx0XHRcdFx0b01hbmlmZXN0Q29udGVudFtcInNhcC5mZVwiXSAmJiBvTWFuaWZlc3RDb250ZW50W1wic2FwLmZlXCJdLmZvcm1cblx0XHRcdFx0XHQ/IG9NYW5pZmVzdENvbnRlbnRbXCJzYXAuZmVcIl0uZm9ybS5yZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0XG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRvVmlld0RhdGFNb2RlbCA9IG5ldyBKU09OTW9kZWwobVZpZXdEYXRhKTtcblx0XHRcdGlmIChtVmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb24pIHtcblx0XHRcdFx0Zm9yIChjb25zdCBzQW5ub3RhdGlvblBhdGggaW4gbVZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uKSB7XG5cdFx0XHRcdFx0aWYgKHNBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiW1wiKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHNUYXJnZXRBbm5vdGF0aW9uUGF0aCA9IHJlc29sdmVEeW5hbWljRXhwcmVzc2lvbihzQW5ub3RhdGlvblBhdGgsIG9NZXRhTW9kZWwpO1xuXHRcdFx0XHRcdFx0bVZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uW3NUYXJnZXRBbm5vdGF0aW9uUGF0aF0gPSBtVmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb25bc0Fubm90YXRpb25QYXRoXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdE1ldGFNb2RlbENvbnZlcnRlci5jb252ZXJ0VHlwZXMob01ldGFNb2RlbCwgb0FwcENvbXBvbmVudC5nZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpLmdldENhcGFiaWxpdGllcygpKTtcblx0XHRcdG9QYWdlTW9kZWwgPSBuZXcgVGVtcGxhdGVNb2RlbCgoKSA9PiB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0RpYWdub3N0aWNzID0gb0FwcENvbXBvbmVudC5nZXREaWFnbm9zdGljcygpO1xuXHRcdFx0XHRcdGNvbnN0IGlJc3N1ZUNvdW50ID0gb0RpYWdub3N0aWNzLmdldElzc3VlcygpLmxlbmd0aDtcblx0XHRcdFx0XHRjb25zdCBvQ29udmVydGVyUGFnZU1vZGVsID0gVGVtcGxhdGVDb252ZXJ0ZXIuY29udmVydFBhZ2UoXG5cdFx0XHRcdFx0XHRzQ29udmVydGVyVHlwZSxcblx0XHRcdFx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRtVmlld0RhdGEsXG5cdFx0XHRcdFx0XHRvRGlhZ25vc3RpY3MsXG5cdFx0XHRcdFx0XHRzRnVsbENvbnRleHRQYXRoLFxuXHRcdFx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpLmdldENhcGFiaWxpdGllcygpLFxuXHRcdFx0XHRcdFx0b0NvbXBvbmVudFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Y29uc3QgYUlzc3VlcyA9IG9EaWFnbm9zdGljcy5nZXRJc3N1ZXMoKTtcblx0XHRcdFx0XHRjb25zdCBhQWRkZWRJc3N1ZXMgPSBhSXNzdWVzLnNsaWNlKGlJc3N1ZUNvdW50KTtcblx0XHRcdFx0XHRpZiAoYUFkZGVkSXNzdWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcdFx0XHRcIlNvbWUgaXNzdWVzIGhhdmUgYmVlbiBkZXRlY3RlZCBpbiB5b3VyIHByb2plY3QsIHBsZWFzZSBjaGVjayB0aGUgVUk1IHN1cHBvcnQgYXNzaXN0YW50IHJ1bGUgZm9yIHNhcC5mZS5jb3JlXCJcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBvQ29udmVydGVyUGFnZU1vZGVsO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBhbnksIGVycm9yIGFzIGFueSk7XG5cdFx0XHRcdFx0cmV0dXJuIHt9O1xuXHRcdFx0XHR9XG5cdFx0XHR9LCBvTWV0YU1vZGVsKTtcblx0XHRcdGlmICghYkVycm9yKSB7XG5cdFx0XHRcdG9WaWV3U2V0dGluZ3MgPSBnZXRWaWV3U2V0dGluZ3MoKTtcblx0XHRcdFx0Ly8gU2V0dGluZyB0aGUgcGFnZU1vZGVsIG9uIHRoZSBjb21wb25lbnQgZm9yIHBvdGVudGlhbCByZXVzZVxuXHRcdFx0XHRvQ29tcG9uZW50LnNldE1vZGVsKG9QYWdlTW9kZWwsIFwiX3BhZ2VNb2RlbFwiKTtcblx0XHRcdFx0cmV0dXJuIG9Db21wb25lbnQucnVuQXNPd25lcigoKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIFZpZXcuY3JlYXRlKG9WaWV3U2V0dGluZ3MpXG5cdFx0XHRcdFx0XHQuY2F0Y2goY3JlYXRlRXJyb3JQYWdlKVxuXHRcdFx0XHRcdFx0LnRoZW4oKG9WaWV3OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0dGhpcy5vVmlldyA9IG9WaWV3O1xuXHRcdFx0XHRcdFx0XHR0aGlzLm9WaWV3LnNldE1vZGVsKG5ldyBNYW5hZ2VkT2JqZWN0TW9kZWwodGhpcy5vVmlldyksIFwiJHZpZXdcIik7XG5cdFx0XHRcdFx0XHRcdHRoaXMub1ZpZXcuc2V0TW9kZWwob1ZpZXdEYXRhTW9kZWwsIFwidmlld0RhdGFcIik7XG5cdFx0XHRcdFx0XHRcdG9Db21wb25lbnQuc2V0QWdncmVnYXRpb24oXCJyb290Q29udHJvbFwiLCB0aGlzLm9WaWV3KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNDYWNoZUtleTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuY2F0Y2goKGUpID0+IExvZy5lcnJvcihlLm1lc3NhZ2UsIGUpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKGVycm9yLm1lc3NhZ2UsIGVycm9yKTtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgRXJyb3Igd2hpbGUgY3JlYXRpbmcgdmlldyA6ICR7ZXJyb3J9YCk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0VmlldygpIHtcblx0XHRyZXR1cm4gdGhpcy5vVmlldztcblx0fVxuXG5cdGdldEludGVyZmFjZSgpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0ZXhpdCgpIHtcblx0XHQvLyBEZXJlZ2lzdGVyIGdsb2JhbCBpbnN0YW5jZVxuXHRcdGlmICh0aGlzLm9SZXNvdXJjZU1vZGVsU2VydmljZSkge1xuXHRcdFx0dGhpcy5vUmVzb3VyY2VNb2RlbFNlcnZpY2UuZGVzdHJveSgpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5vQ2FjaGVIYW5kbGVyU2VydmljZSkge1xuXHRcdFx0dGhpcy5vQ2FjaGVIYW5kbGVyU2VydmljZS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdHRoaXMub0ZhY3RvcnkucmVtb3ZlR2xvYmFsSW5zdGFuY2UoKTtcblx0fVxufVxuY2xhc3MgVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8VGVtcGxhdGVkVmlld1NlcnZpY2VTZXR0aW5ncz4ge1xuXHRfb0luc3RhbmNlUmVnaXN0cnk6IFJlY29yZDxzdHJpbmcsIFRlbXBsYXRlZFZpZXdTZXJ2aWNlPiA9IHt9O1xuXG5cdHN0YXRpYyBpQ3JlYXRpbmdWaWV3czogMDtcblxuXHRjcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQ6IFNlcnZpY2VDb250ZXh0PFRlbXBsYXRlZFZpZXdTZXJ2aWNlU2V0dGluZ3M+KSB7XG5cdFx0VGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5LmlDcmVhdGluZ1ZpZXdzKys7XG5cdFx0Y29uc3Qgb1RlbXBsYXRlZFZpZXdTZXJ2aWNlID0gbmV3IFRlbXBsYXRlZFZpZXdTZXJ2aWNlKE9iamVjdC5hc3NpZ24oeyBmYWN0b3J5OiB0aGlzIH0sIG9TZXJ2aWNlQ29udGV4dCkpO1xuXHRcdHJldHVybiBvVGVtcGxhdGVkVmlld1NlcnZpY2UuaW5pdFByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkuaUNyZWF0aW5nVmlld3MtLTtcblx0XHRcdHJldHVybiBvVGVtcGxhdGVkVmlld1NlcnZpY2U7XG5cdFx0fSk7XG5cdH1cblxuXHRyZW1vdmVHbG9iYWxJbnN0YW5jZSgpIHtcblx0XHR0aGlzLl9vSW5zdGFuY2VSZWdpc3RyeSA9IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEBkZXNjcmlwdGlvbiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiB0aGUgY29tcG9uZW50IGRhdGEgc3BlY2lmaWVzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSAnU2hhcmUnIGJ1dHRvbiBhbmQgcmV0dXJucyB0cnVlIG9yIGZhbHNlIGJhc2VkIG9uIHRoZSB2aXNpYmlsaXR5XG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgU3BlY2lmaWVzIHRoZSBhcHAgY29tcG9uZW50XG5cdCAqIEByZXR1cm5zIEJvb2xlYW4gdmFsdWUgYXMgdHJ1ZSBvciBmYWxzZSBiYXNlZCB3aGV0aGVyIHRoZSAnU2hhcmUnIGJ1dHRvbiBzaG91bGQgYmUgdmlzaWJsZSBvciBub3Rcblx0ICovXG5cdHN0YXRpYyBnZXRTaGFyZUJ1dHRvblZpc2liaWxpdHlGb3JNeUluYm94KGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdFx0Y29uc3QgY29tcG9uZW50RGF0YTogQ29tcG9uZW50RGF0YSA9IGFwcENvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCk7XG5cdFx0aWYgKGNvbXBvbmVudERhdGEgIT09IHVuZGVmaW5lZCAmJiBjb21wb25lbnREYXRhLmZlRW52aXJvbm1lbnQpIHtcblx0XHRcdHJldHVybiBjb21wb25lbnREYXRhLmZlRW52aXJvbm1lbnQuZ2V0U2hhcmVDb250cm9sVmlzaWJpbGl0eSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0c3RhdGljIGdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUoKSB7XG5cdFx0cmV0dXJuIFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeS5pQ3JlYXRpbmdWaWV3cztcblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7TUEyQ01BLG9CQUFvQjtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQXFCekJDLElBQUksR0FBSixnQkFBTztNQUNOLE1BQU1DLG9CQUFv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
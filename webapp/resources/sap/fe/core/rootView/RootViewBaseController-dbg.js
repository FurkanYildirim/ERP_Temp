/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/BaseController", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/SizeHelper", "sap/ui/base/BindingParser", "sap/ui/core/routing/HashChanger", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper", "sap/ui/thirdparty/URI"], function (Log, BaseController, CommonUtils, Placeholder, ViewState, ClassSupport, SizeHelper, BindingParser, HashChanger, JSONModel, AnnotationHelper, URI) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var usingExtension = ClassSupport.usingExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let RootViewBaseController = (_dec = defineUI5Class("sap.fe.core.rootView.RootViewBaseController"), _dec2 = usingExtension(Placeholder), _dec3 = usingExtension(ViewState), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(RootViewBaseController, _BaseController);
    function RootViewBaseController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "oPlaceholder", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor2, _assertThisInitialized(_this));
      _this.bIsComputingTitleHierachy = false;
      return _this;
    }
    var _proto = RootViewBaseController.prototype;
    _proto.onInit = function onInit() {
      SizeHelper.init();
      this._aHelperModels = [];
    };
    _proto.getPlaceholder = function getPlaceholder() {
      return this.oPlaceholder;
    };
    _proto.attachRouteMatchers = function attachRouteMatchers() {
      this.oPlaceholder.attachRouteMatchers();
      this.getAppComponent().getRoutingService().attachAfterRouteMatched(this._onAfterRouteMatched, this);
    };
    _proto.onExit = function onExit() {
      this.getAppComponent().getRoutingService().detachAfterRouteMatched(this._onAfterRouteMatched, this);
      this.oRouter = undefined;
      SizeHelper.exit();

      // Destroy all JSON models created dynamically for the views
      this._aHelperModels.forEach(function (oModel) {
        oModel.destroy();
      });
    }

    /**
     * Convenience method for getting the resource bundle.
     *
     * @public
     * @returns The resourceModel of the component
     */;
    _proto.getResourceBundle = function getResourceBundle() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    };
    _proto.getRouter = function getRouter() {
      if (!this.oRouter) {
        this.oRouter = this.getAppComponent().getRouter();
      }
      return this.oRouter;
    };
    _proto._createHelperModel = function _createHelperModel() {
      // We keep a reference on the models created dynamically, as they don't get destroyed
      // automatically when the view is destroyed.
      // This is done during onExit
      const oModel = new JSONModel();
      this._aHelperModels.push(oModel);
      return oModel;
    }

    /**
     * Function waiting for the Right most view to be ready.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param oEvent Reference an Event parameter coming from routeMatched event
     * @returns A promise indicating when the right most view is ready
     */;
    _proto.waitForRightMostViewReady = function waitForRightMostViewReady(oEvent) {
      return new Promise(function (resolve) {
        const aContainers = oEvent.getParameter("views"),
          // There can also be reuse components in the view, remove them before processing.
          aFEContainers = [];
        aContainers.forEach(function (oContainer) {
          let oView = oContainer;
          if (oContainer && oContainer.getComponentInstance) {
            const oComponentInstance = oContainer.getComponentInstance();
            oView = oComponentInstance.getRootControl();
          }
          if (oView && oView.getController() && oView.getController().pageReady) {
            aFEContainers.push(oView);
          }
        });
        const oRightMostFEView = aFEContainers[aFEContainers.length - 1];
        if (oRightMostFEView && oRightMostFEView.getController().pageReady.isPageReady()) {
          resolve(oRightMostFEView);
        } else if (oRightMostFEView) {
          oRightMostFEView.getController().pageReady.attachEventOnce("pageReady", function () {
            resolve(oRightMostFEView);
          });
        }
      });
    }

    /**
     * Callback when the navigation is done.
     *  - update the shell title.
     *  - update table scroll.
     *  - call onPageReady on the rightMostView.
     *
     * @param oEvent
     * @name sap.fe.core.rootView.BaseController#_onAfterRouteMatched
     * @memberof sap.fe.core.rootView.BaseController
     */;
    _proto._onAfterRouteMatched = function _onAfterRouteMatched(oEvent) {
      if (!this._oRouteMatchedPromise) {
        this._oRouteMatchedPromise = this.waitForRightMostViewReady(oEvent).then(oView => {
          // The autoFocus is initially disabled on the navContainer or the FCL, so that the focus stays on the Shell menu
          // even if the app takes a long time to launch
          // The first time the view is displayed, we need to enable the autofocus so that it's managed properly during navigation
          const oRootControl = this.getView().getContent()[0];
          if (oRootControl && oRootControl.getAutoFocus && !oRootControl.getAutoFocus()) {
            oRootControl.setProperty("autoFocus", true, true); // Do not mark the container as invalid, otherwise it's re-rendered
          }

          const oAppComponent = this.getAppComponent();
          this._scrollTablesToLastNavigatedItems();
          if (oAppComponent.getEnvironmentCapabilities().getCapabilities().UShell) {
            this._computeTitleHierarchy(oView);
          }
          const bForceFocus = oAppComponent.getRouterProxy().isFocusForced();
          oAppComponent.getRouterProxy().setFocusForced(false); // reset
          if (oView.getController() && oView.getController().onPageReady && oView.getParent().onPageReady) {
            oView.getParent().onPageReady({
              forceFocus: bForceFocus
            });
          }
          if (!bForceFocus) {
            // Try to restore the focus on where it was when we last visited the current hash
            oAppComponent.getRouterProxy().restoreFocusForCurrentHash();
          }
          if (this.onContainerReady) {
            this.onContainerReady();
          }
        }).catch(function (oError) {
          Log.error("An error occurs while computing the title hierarchy and calling focus method", oError);
        }).finally(() => {
          this._oRouteMatchedPromise = null;
        });
      }
    }

    /**
     * This function returns the TitleHierarchy cache ( or initializes it if undefined).
     *
     * @name sap.fe.core.rootView.BaseController#_getTitleHierarchyCache
     * @memberof sap.fe.core.rootView.BaseController
     * @returns  The TitleHierarchy cache
     */;
    _proto._getTitleHierarchyCache = function _getTitleHierarchyCache() {
      if (!this.oTitleHierarchyCache) {
        this.oTitleHierarchyCache = {};
      }
      return this.oTitleHierarchyCache;
    }

    /**
     * This function returns a titleInfo object.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param title The application's title
     * @param subtitle The application's subTitle
     * @param sIntent The intent path to be redirected to
     * @param icon The application's icon
     * @returns The title information
     */;
    _proto._computeTitleInfo = function _computeTitleInfo(title, subtitle, sIntent) {
      let icon = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "";
      const aParts = sIntent.split("/");
      if (aParts[aParts.length - 1].indexOf("?") === -1) {
        sIntent += "?restoreHistory=true";
      } else {
        sIntent += "&restoreHistory=true";
      }
      return {
        title: title,
        subtitle: subtitle,
        intent: sIntent,
        icon: icon
      };
    };
    _proto._formatTitle = function _formatTitle(displayMode, titleValue, titleDescription) {
      let formattedTitle = "";
      switch (displayMode) {
        case "Value":
          formattedTitle = `${titleValue}`;
          break;
        case "ValueDescription":
          formattedTitle = `${titleValue} (${titleDescription})`;
          break;
        case "DescriptionValue":
          formattedTitle = `${titleDescription} (${titleValue})`;
          break;
        case "Description":
          formattedTitle = `${titleDescription}`;
          break;
        default:
      }
      return formattedTitle;
    }

    /**
     * Fetches the value of the HeaderInfo title for a given path.
     *
     * @param sPath The path to the entity
     * @returns A promise containing the formatted title, or an empty string if no HeaderInfo title annotation is available
     */;
    _proto._fetchTitleValue = async function _fetchTitleValue(sPath) {
      const oAppComponent = this.getAppComponent(),
        oModel = this.getView().getModel(),
        oMetaModel = oAppComponent.getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(sPath),
        oBindingViewContext = oModel.createBindingContext(sPath),
        sValueExpression = AnnotationHelper.format(oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value`), {
          context: oMetaModel.createBindingContext("/")
        });
      if (!sValueExpression) {
        return Promise.resolve("");
      }
      const sTextExpression = AnnotationHelper.format(oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@com.sap.vocabularies.Common.v1.Text`), {
          context: oMetaModel.createBindingContext("/")
        }),
        oPropertyContext = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/Title/Value/$Path@`),
        aPromises = [],
        oValueExpression = BindingParser.complexParser(sValueExpression),
        oPromiseForDisplayMode = new Promise(function (resolve) {
          const displayMode = CommonUtils.computeDisplayMode(oPropertyContext);
          resolve(displayMode);
        });
      aPromises.push(oPromiseForDisplayMode);
      const sValuePath = oValueExpression.parts ? oValueExpression.parts[0].path : oValueExpression.path,
        fnValueFormatter = oValueExpression.formatter,
        oValueBinding = oModel.bindProperty(sValuePath, oBindingViewContext, {
          "$$groupId": "$auto.Heroes"
        });
      oValueBinding.initialize();
      const oPromiseForTitleValue = new Promise(function (resolve) {
        const fnChange = function (oEvent) {
          const sTargetValue = fnValueFormatter ? fnValueFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();
          oValueBinding.detachChange(fnChange);
          resolve(sTargetValue);
        };
        oValueBinding.attachChange(fnChange);
      });
      aPromises.push(oPromiseForTitleValue);
      if (sTextExpression) {
        const oTextExpression = BindingParser.complexParser(sTextExpression);
        let sTextPath = oTextExpression.parts ? oTextExpression.parts[0].path : oTextExpression.path;
        sTextPath = sValuePath.lastIndexOf("/") > -1 ? `${sValuePath.slice(0, sValuePath.lastIndexOf("/"))}/${sTextPath}` : sTextPath;
        const fnTextFormatter = oTextExpression.formatter,
          oTextBinding = oModel.bindProperty(sTextPath, oBindingViewContext, {
            "$$groupId": "$auto.Heroes"
          });
        oTextBinding.initialize();
        const oPromiseForTitleText = new Promise(function (resolve) {
          const fnChange = function (oEvent) {
            const sTargetText = fnTextFormatter ? fnTextFormatter(oEvent.getSource().getValue()) : oEvent.getSource().getValue();
            oTextBinding.detachChange(fnChange);
            resolve(sTargetText);
          };
          oTextBinding.attachChange(fnChange);
        });
        aPromises.push(oPromiseForTitleText);
      }
      try {
        const titleInfo = await Promise.all(aPromises);
        let formattedTitle = "";
        if (typeof titleInfo !== "string") {
          formattedTitle = this._formatTitle(titleInfo[0], titleInfo[1], titleInfo[2]);
        }
        return formattedTitle;
      } catch (error) {
        Log.error("Error while fetching the title from the header info :" + error);
      }
      return "";
    }

    /**
     * Function returning the decoded application-specific hash.
     *
     * @returns Decoded application-specific hash
     */;
    _proto._getAppSpecificHash = function _getAppSpecificHash() {
      // HashChanged isShellNavigationHashChanger
      const hashChanger = HashChanger.getInstance();
      return "hrefForAppSpecificHash" in hashChanger ? URI.decode(hashChanger.hrefForAppSpecificHash("")) : "#/";
    };
    _proto._getHash = function _getHash() {
      return HashChanger.getInstance().getHash();
    }

    /**
     * This function returns titleInformation from a path.
     * It updates the cache to store title information if necessary
     *
     * @name sap.fe.core.rootView.BaseController#getTitleInfoFromPath
     * @memberof sap.fe.core.rootView.BaseController
     * @param {*} sPath path of the context to retrieve title information from MetaModel
     * @returns {Promise}  oTitleinformation returned as promise
     */;
    _proto.getTitleInfoFromPath = function getTitleInfoFromPath(sPath) {
      const oTitleHierarchyCache = this._getTitleHierarchyCache();
      if (oTitleHierarchyCache[sPath]) {
        // The title info is already stored in the cache
        return Promise.resolve(oTitleHierarchyCache[sPath]);
      }
      const oMetaModel = this.getAppComponent().getMetaModel();
      const sEntityPath = oMetaModel.getMetaPath(sPath);
      const sTypeName = oMetaModel.getObject(`${sEntityPath}/@com.sap.vocabularies.UI.v1.HeaderInfo/TypeName`);
      const sAppSpecificHash = this._getAppSpecificHash();
      const sIntent = sAppSpecificHash + sPath.slice(1);
      return this._fetchTitleValue(sPath).then(sTitle => {
        const oTitleInfo = this._computeTitleInfo(sTypeName, sTitle, sIntent);
        oTitleHierarchyCache[sPath] = oTitleInfo;
        return oTitleInfo;
      });
    }

    /**
     * Ensure that the ushell service receives all elements
     * (title, subtitle, intent, icon) as strings.
     *
     * Annotation HeaderInfo allows for binding of title and description
     * (which are used here as title and subtitle) to any element in the entity
     * (being possibly types like boolean, timestamp, double, etc.)
     *
     * Creates a new hierarchy and converts non-string types to string.
     *
     * @param aHierarchy Shell title hierarchy
     * @returns Copy of shell title hierarchy containing all elements as strings
     */;
    _proto._ensureHierarchyElementsAreStrings = function _ensureHierarchyElementsAreStrings(aHierarchy) {
      const aHierarchyShell = [];
      for (const level in aHierarchy) {
        const oHierarchy = aHierarchy[level];
        const oShellHierarchy = {};
        for (const key in oHierarchy) {
          oShellHierarchy[key] = typeof oHierarchy[key] !== "string" ? String(oHierarchy[key]) : oHierarchy[key];
        }
        aHierarchyShell.push(oShellHierarchy);
      }
      return aHierarchyShell;
    };
    _proto._getTargetTypeFromHash = function _getTargetTypeFromHash(sHash) {
      var _oAppComponent$getMan;
      const oAppComponent = this.getAppComponent();
      let sTargetType = "";
      const aRoutes = ((_oAppComponent$getMan = oAppComponent.getManifestEntry("sap.ui5").routing) === null || _oAppComponent$getMan === void 0 ? void 0 : _oAppComponent$getMan.routes) ?? [];
      for (const route of aRoutes) {
        const oRoute = oAppComponent.getRouter().getRoute(route.name);
        if (oRoute !== null && oRoute !== void 0 && oRoute.match(sHash)) {
          const sTarget = Array.isArray(route.target) ? route.target[0] : route.target;
          sTargetType = oAppComponent.getRouter().getTarget(sTarget)._oOptions.name;
          break;
        }
      }
      return sTargetType;
    }

    /**
     * This function updates the shell title after each navigation.
     *
     * @memberof sap.fe.core.rootView.BaseController
     * @param oView The current view
     * @returns A Promise that is resolved when the menu is filled properly
     */;
    _proto._computeTitleHierarchy = function _computeTitleHierarchy(oView) {
      const oAppComponent = this.getAppComponent(),
        oContext = oView.getBindingContext(),
        oCurrentPage = oView.getParent(),
        aTitleInformationPromises = [],
        sAppSpecificHash = this._getAppSpecificHash(),
        manifestAppSettings = oAppComponent.getManifestEntry("sap.app"),
        sAppTitle = manifestAppSettings.title || "",
        sAppSubTitle = manifestAppSettings.subTitle || "",
        appIcon = manifestAppSettings.icon || "";
      let oPageTitleInformation, sNewPath;
      if (oCurrentPage && oCurrentPage._getPageTitleInformation) {
        if (oContext) {
          // If the first page of the application is a LR, use the title and subtitle from the manifest
          if (this._getTargetTypeFromHash("") === "sap.fe.templates.ListReport") {
            aTitleInformationPromises.push(Promise.resolve(this._computeTitleInfo(sAppTitle, sAppSubTitle, sAppSpecificHash, appIcon)));
          }

          // Then manage other pages
          sNewPath = oContext.getPath();
          const aPathParts = sNewPath.split("/");
          let sPath = "";
          aPathParts.shift(); // Remove the first segment (empty string) as it has been managed above
          aPathParts.pop(); // Remove the last segment as it corresponds to the current page and shouldn't appear in the menu

          aPathParts.forEach(sPathPart => {
            sPath += `/${sPathPart}`;
            const oMetaModel = oAppComponent.getMetaModel(),
              sParameterPath = oMetaModel.getMetaPath(sPath),
              bIsParameterized = oMetaModel.getObject(`${sParameterPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
            if (!bIsParameterized) {
              aTitleInformationPromises.push(this.getTitleInfoFromPath(sPath));
            }
          });
        }

        // Current page
        oPageTitleInformation = oCurrentPage._getPageTitleInformation();
        oPageTitleInformation = this._computeTitleInfo(oPageTitleInformation.title, oPageTitleInformation.subtitle, sAppSpecificHash + this._getHash());
        if (oContext) {
          this._getTitleHierarchyCache()[sNewPath] = oPageTitleInformation;
        } else {
          this._getTitleHierarchyCache()[sAppSpecificHash] = oPageTitleInformation;
        }
      } else {
        aTitleInformationPromises.push(Promise.reject("Title information missing in HeaderInfo"));
      }
      return Promise.all(aTitleInformationPromises).then(aTitleInfoHierarchy => {
        // workaround for shell which is expecting all elements being of type string
        const aTitleInfoHierarchyShell = this._ensureHierarchyElementsAreStrings(aTitleInfoHierarchy),
          sTitle = oPageTitleInformation.title;
        aTitleInfoHierarchyShell.reverse();
        oAppComponent.getShellServices().setHierarchy(aTitleInfoHierarchyShell);
        this._setShellMenuTitle(oAppComponent, sTitle, sAppTitle);
      }).catch(function (sErrorMessage) {
        Log.error(sErrorMessage);
      }).finally(() => {
        this.bIsComputingTitleHierachy = false;
      }).catch(function (sErrorMessage) {
        Log.error(sErrorMessage);
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.calculateLayout = function calculateLayout(iNextFCLLevel, sHash, sProposedLayout) {
      let keepCurrentLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
      return null;
    }

    /**
     * Callback after a view has been bound to a context.
     *
     * @param oContext The context that has been bound to a view
     */;
    _proto.onContextBoundToView = function onContextBoundToView(oContext) {
      if (oContext) {
        const sDeepestPath = this.getView().getModel("internal").getProperty("/deepestPath"),
          sViewContextPath = oContext.getPath();
        if (!sDeepestPath || sDeepestPath.indexOf(sViewContextPath) !== 0) {
          // There was no previous value for the deepest reached path, or the path
          // for the view isn't a subpath of the previous deepest path --> update
          this.getView().getModel("internal").setProperty("/deepestPath", sViewContextPath, undefined, true);
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.displayErrorPage = function displayErrorPage(sErrorMessage, mParameters) {
      // To be overridden
      return Promise.resolve(true);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.updateUIStateForView = function updateUIStateForView(oView, FCLLevel) {
      // To be overriden
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto.getInstancedViews = function getInstancedViews() {
      return [];
      // To be overriden
    };
    _proto._scrollTablesToLastNavigatedItems = function _scrollTablesToLastNavigatedItems() {
      // To be overriden
    };
    _proto.isFclEnabled = function isFclEnabled() {
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto._setShellMenuTitle = function _setShellMenuTitle(oAppComponent, sTitle, sAppTitle) {
      // To be overriden by FclController
      oAppComponent.getShellServices().setTitle(sTitle);
    };
    _proto.getAppContentContainer = function getAppContentContainer() {
      var _oAppComponent$getMan2, _oAppComponent$getMan3;
      const oAppComponent = this.getAppComponent();
      const appContentId = ((_oAppComponent$getMan2 = oAppComponent.getManifestEntry("sap.ui5").routing) === null || _oAppComponent$getMan2 === void 0 ? void 0 : (_oAppComponent$getMan3 = _oAppComponent$getMan2.config) === null || _oAppComponent$getMan3 === void 0 ? void 0 : _oAppComponent$getMan3.controlId) ?? "appContent";
      return this.getView().byId(appContentId);
    };
    return RootViewBaseController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "oPlaceholder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return RootViewBaseController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb290Vmlld0Jhc2VDb250cm9sbGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJ1c2luZ0V4dGVuc2lvbiIsIlBsYWNlaG9sZGVyIiwiVmlld1N0YXRlIiwiYklzQ29tcHV0aW5nVGl0bGVIaWVyYWNoeSIsIm9uSW5pdCIsIlNpemVIZWxwZXIiLCJpbml0IiwiX2FIZWxwZXJNb2RlbHMiLCJnZXRQbGFjZWhvbGRlciIsIm9QbGFjZWhvbGRlciIsImF0dGFjaFJvdXRlTWF0Y2hlcnMiLCJnZXRBcHBDb21wb25lbnQiLCJnZXRSb3V0aW5nU2VydmljZSIsImF0dGFjaEFmdGVyUm91dGVNYXRjaGVkIiwiX29uQWZ0ZXJSb3V0ZU1hdGNoZWQiLCJvbkV4aXQiLCJkZXRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsIm9Sb3V0ZXIiLCJ1bmRlZmluZWQiLCJleGl0IiwiZm9yRWFjaCIsIm9Nb2RlbCIsImRlc3Ryb3kiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsImdldE93bmVyQ29tcG9uZW50IiwiZ2V0TW9kZWwiLCJnZXRSb3V0ZXIiLCJfY3JlYXRlSGVscGVyTW9kZWwiLCJKU09OTW9kZWwiLCJwdXNoIiwid2FpdEZvclJpZ2h0TW9zdFZpZXdSZWFkeSIsIm9FdmVudCIsIlByb21pc2UiLCJyZXNvbHZlIiwiYUNvbnRhaW5lcnMiLCJnZXRQYXJhbWV0ZXIiLCJhRkVDb250YWluZXJzIiwib0NvbnRhaW5lciIsIm9WaWV3IiwiZ2V0Q29tcG9uZW50SW5zdGFuY2UiLCJvQ29tcG9uZW50SW5zdGFuY2UiLCJnZXRSb290Q29udHJvbCIsImdldENvbnRyb2xsZXIiLCJwYWdlUmVhZHkiLCJvUmlnaHRNb3N0RkVWaWV3IiwibGVuZ3RoIiwiaXNQYWdlUmVhZHkiLCJhdHRhY2hFdmVudE9uY2UiLCJfb1JvdXRlTWF0Y2hlZFByb21pc2UiLCJ0aGVuIiwib1Jvb3RDb250cm9sIiwiZ2V0VmlldyIsImdldENvbnRlbnQiLCJnZXRBdXRvRm9jdXMiLCJzZXRQcm9wZXJ0eSIsIm9BcHBDb21wb25lbnQiLCJfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMiLCJnZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcyIsImdldENhcGFiaWxpdGllcyIsIlVTaGVsbCIsIl9jb21wdXRlVGl0bGVIaWVyYXJjaHkiLCJiRm9yY2VGb2N1cyIsImdldFJvdXRlclByb3h5IiwiaXNGb2N1c0ZvcmNlZCIsInNldEZvY3VzRm9yY2VkIiwib25QYWdlUmVhZHkiLCJnZXRQYXJlbnQiLCJmb3JjZUZvY3VzIiwicmVzdG9yZUZvY3VzRm9yQ3VycmVudEhhc2giLCJvbkNvbnRhaW5lclJlYWR5IiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImZpbmFsbHkiLCJfZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZSIsIm9UaXRsZUhpZXJhcmNoeUNhY2hlIiwiX2NvbXB1dGVUaXRsZUluZm8iLCJ0aXRsZSIsInN1YnRpdGxlIiwic0ludGVudCIsImljb24iLCJhUGFydHMiLCJzcGxpdCIsImluZGV4T2YiLCJpbnRlbnQiLCJfZm9ybWF0VGl0bGUiLCJkaXNwbGF5TW9kZSIsInRpdGxlVmFsdWUiLCJ0aXRsZURlc2NyaXB0aW9uIiwiZm9ybWF0dGVkVGl0bGUiLCJfZmV0Y2hUaXRsZVZhbHVlIiwic1BhdGgiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJvQmluZGluZ1ZpZXdDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJzVmFsdWVFeHByZXNzaW9uIiwiQW5ub3RhdGlvbkhlbHBlciIsImZvcm1hdCIsImdldE9iamVjdCIsImNvbnRleHQiLCJzVGV4dEV4cHJlc3Npb24iLCJvUHJvcGVydHlDb250ZXh0IiwiYVByb21pc2VzIiwib1ZhbHVlRXhwcmVzc2lvbiIsIkJpbmRpbmdQYXJzZXIiLCJjb21wbGV4UGFyc2VyIiwib1Byb21pc2VGb3JEaXNwbGF5TW9kZSIsIkNvbW1vblV0aWxzIiwiY29tcHV0ZURpc3BsYXlNb2RlIiwic1ZhbHVlUGF0aCIsInBhcnRzIiwicGF0aCIsImZuVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXR0ZXIiLCJvVmFsdWVCaW5kaW5nIiwiYmluZFByb3BlcnR5IiwiaW5pdGlhbGl6ZSIsIm9Qcm9taXNlRm9yVGl0bGVWYWx1ZSIsImZuQ2hhbmdlIiwic1RhcmdldFZhbHVlIiwiZ2V0U291cmNlIiwiZ2V0VmFsdWUiLCJkZXRhY2hDaGFuZ2UiLCJhdHRhY2hDaGFuZ2UiLCJvVGV4dEV4cHJlc3Npb24iLCJzVGV4dFBhdGgiLCJsYXN0SW5kZXhPZiIsInNsaWNlIiwiZm5UZXh0Rm9ybWF0dGVyIiwib1RleHRCaW5kaW5nIiwib1Byb21pc2VGb3JUaXRsZVRleHQiLCJzVGFyZ2V0VGV4dCIsInRpdGxlSW5mbyIsImFsbCIsIl9nZXRBcHBTcGVjaWZpY0hhc2giLCJoYXNoQ2hhbmdlciIsIkhhc2hDaGFuZ2VyIiwiZ2V0SW5zdGFuY2UiLCJVUkkiLCJkZWNvZGUiLCJocmVmRm9yQXBwU3BlY2lmaWNIYXNoIiwiX2dldEhhc2giLCJnZXRIYXNoIiwiZ2V0VGl0bGVJbmZvRnJvbVBhdGgiLCJzRW50aXR5UGF0aCIsInNUeXBlTmFtZSIsInNBcHBTcGVjaWZpY0hhc2giLCJzVGl0bGUiLCJvVGl0bGVJbmZvIiwiX2Vuc3VyZUhpZXJhcmNoeUVsZW1lbnRzQXJlU3RyaW5ncyIsImFIaWVyYXJjaHkiLCJhSGllcmFyY2h5U2hlbGwiLCJsZXZlbCIsIm9IaWVyYXJjaHkiLCJvU2hlbGxIaWVyYXJjaHkiLCJrZXkiLCJTdHJpbmciLCJfZ2V0VGFyZ2V0VHlwZUZyb21IYXNoIiwic0hhc2giLCJzVGFyZ2V0VHlwZSIsImFSb3V0ZXMiLCJnZXRNYW5pZmVzdEVudHJ5Iiwicm91dGluZyIsInJvdXRlcyIsInJvdXRlIiwib1JvdXRlIiwiZ2V0Um91dGUiLCJuYW1lIiwibWF0Y2giLCJzVGFyZ2V0IiwiQXJyYXkiLCJpc0FycmF5IiwidGFyZ2V0IiwiZ2V0VGFyZ2V0IiwiX29PcHRpb25zIiwib0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9DdXJyZW50UGFnZSIsImFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMiLCJtYW5pZmVzdEFwcFNldHRpbmdzIiwic0FwcFRpdGxlIiwic0FwcFN1YlRpdGxlIiwic3ViVGl0bGUiLCJhcHBJY29uIiwib1BhZ2VUaXRsZUluZm9ybWF0aW9uIiwic05ld1BhdGgiLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJnZXRQYXRoIiwiYVBhdGhQYXJ0cyIsInNoaWZ0IiwicG9wIiwic1BhdGhQYXJ0Iiwic1BhcmFtZXRlclBhdGgiLCJiSXNQYXJhbWV0ZXJpemVkIiwicmVqZWN0IiwiYVRpdGxlSW5mb0hpZXJhcmNoeSIsImFUaXRsZUluZm9IaWVyYXJjaHlTaGVsbCIsInJldmVyc2UiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2V0SGllcmFyY2h5IiwiX3NldFNoZWxsTWVudVRpdGxlIiwic0Vycm9yTWVzc2FnZSIsImNhbGN1bGF0ZUxheW91dCIsImlOZXh0RkNMTGV2ZWwiLCJzUHJvcG9zZWRMYXlvdXQiLCJrZWVwQ3VycmVudExheW91dCIsIm9uQ29udGV4dEJvdW5kVG9WaWV3Iiwic0RlZXBlc3RQYXRoIiwiZ2V0UHJvcGVydHkiLCJzVmlld0NvbnRleHRQYXRoIiwiZGlzcGxheUVycm9yUGFnZSIsIm1QYXJhbWV0ZXJzIiwidXBkYXRlVUlTdGF0ZUZvclZpZXciLCJGQ0xMZXZlbCIsImdldEluc3RhbmNlZFZpZXdzIiwiaXNGY2xFbmFibGVkIiwic2V0VGl0bGUiLCJnZXRBcHBDb250ZW50Q29udGFpbmVyIiwiYXBwQ29udGVudElkIiwiY29uZmlnIiwiY29udHJvbElkIiwiYnlJZCIsIkJhc2VDb250cm9sbGVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJSb290Vmlld0Jhc2VDb250cm9sbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgRmxleGlibGVDb2x1bW5MYXlvdXQgZnJvbSBcInNhcC9mL0ZsZXhpYmxlQ29sdW1uTGF5b3V0XCI7XG5pbXBvcnQgQmFzZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BsYWNlaG9sZGVyXCI7XG5pbXBvcnQgVmlld1N0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9WaWV3U3RhdGVcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCB1c2luZ0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IFNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2l6ZUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgRmNsQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvcm9vdFZpZXcvRmNsLmNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIE5hdkNvbnRhaW5lciBmcm9tIFwic2FwL20vTmF2Q29udGFpbmVyXCI7XG5pbXBvcnQgQmluZGluZ1BhcnNlciBmcm9tIFwic2FwL3VpL2Jhc2UvQmluZGluZ1BhcnNlclwiO1xuaW1wb3J0IHR5cGUgWE1MVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1hNTFZpZXdcIjtcbmltcG9ydCBIYXNoQ2hhbmdlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9IYXNoQ2hhbmdlclwiO1xuaW1wb3J0IHR5cGUgUm91dGVyIGZyb20gXCJzYXAvdWkvY29yZS9yb3V0aW5nL1JvdXRlclwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgQW5ub3RhdGlvbkhlbHBlciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0Fubm90YXRpb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9yZXNvdXJjZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgVVJJIGZyb20gXCJzYXAvdWkvdGhpcmRwYXJ0eS9VUklcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwiLi4vQXBwQ29tcG9uZW50XCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLnJvb3RWaWV3LlJvb3RWaWV3QmFzZUNvbnRyb2xsZXJcIilcbmNsYXNzIFJvb3RWaWV3QmFzZUNvbnRyb2xsZXIgZXh0ZW5kcyBCYXNlQ29udHJvbGxlciB7XG5cdEB1c2luZ0V4dGVuc2lvbihQbGFjZWhvbGRlcilcblx0b1BsYWNlaG9sZGVyITogUGxhY2Vob2xkZXI7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKFZpZXdTdGF0ZSlcblx0dmlld1N0YXRlITogVmlld1N0YXRlO1xuXG5cdHByaXZhdGUgX2FIZWxwZXJNb2RlbHMhOiBhbnlbXTtcblxuXHRwcml2YXRlIG9Sb3V0ZXI/OiBSb3V0ZXI7XG5cblx0cHJpdmF0ZSBfb1JvdXRlTWF0Y2hlZFByb21pc2U6IGFueTtcblxuXHRwcml2YXRlIG9UaXRsZUhpZXJhcmNoeUNhY2hlOiBhbnk7XG5cblx0cHJpdmF0ZSBiSXNDb21wdXRpbmdUaXRsZUhpZXJhY2h5ID0gZmFsc2U7XG5cblx0b25Jbml0KCkge1xuXHRcdFNpemVIZWxwZXIuaW5pdCgpO1xuXG5cdFx0dGhpcy5fYUhlbHBlck1vZGVscyA9IFtdO1xuXHR9XG5cblx0Z2V0UGxhY2Vob2xkZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMub1BsYWNlaG9sZGVyO1xuXHR9XG5cblx0YXR0YWNoUm91dGVNYXRjaGVycygpIHtcblx0XHR0aGlzLm9QbGFjZWhvbGRlci5hdHRhY2hSb3V0ZU1hdGNoZXJzKCk7XG5cdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb3V0aW5nU2VydmljZSgpLmF0dGFjaEFmdGVyUm91dGVNYXRjaGVkKHRoaXMuX29uQWZ0ZXJSb3V0ZU1hdGNoZWQsIHRoaXMpO1xuXHR9XG5cblx0b25FeGl0KCkge1xuXHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGluZ1NlcnZpY2UoKS5kZXRhY2hBZnRlclJvdXRlTWF0Y2hlZCh0aGlzLl9vbkFmdGVyUm91dGVNYXRjaGVkLCB0aGlzKTtcblx0XHR0aGlzLm9Sb3V0ZXIgPSB1bmRlZmluZWQ7XG5cblx0XHRTaXplSGVscGVyLmV4aXQoKTtcblxuXHRcdC8vIERlc3Ryb3kgYWxsIEpTT04gbW9kZWxzIGNyZWF0ZWQgZHluYW1pY2FsbHkgZm9yIHRoZSB2aWV3c1xuXHRcdHRoaXMuX2FIZWxwZXJNb2RlbHMuZm9yRWFjaChmdW5jdGlvbiAob01vZGVsOiBhbnkpIHtcblx0XHRcdG9Nb2RlbC5kZXN0cm95KCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVuaWVuY2UgbWV0aG9kIGZvciBnZXR0aW5nIHRoZSByZXNvdXJjZSBidW5kbGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIHJlc291cmNlTW9kZWwgb2YgdGhlIGNvbXBvbmVudFxuXHQgKi9cblx0Z2V0UmVzb3VyY2VCdW5kbGUoKSB7XG5cdFx0cmV0dXJuICh0aGlzLmdldE93bmVyQ29tcG9uZW50KCkuZ2V0TW9kZWwoXCJpMThuXCIpIGFzIFJlc291cmNlTW9kZWwpLmdldFJlc291cmNlQnVuZGxlKCk7XG5cdH1cblxuXHRnZXRSb3V0ZXIoKSB7XG5cdFx0aWYgKCF0aGlzLm9Sb3V0ZXIpIHtcblx0XHRcdHRoaXMub1JvdXRlciA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGVyKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMub1JvdXRlcjtcblx0fVxuXG5cdF9jcmVhdGVIZWxwZXJNb2RlbCgpIHtcblx0XHQvLyBXZSBrZWVwIGEgcmVmZXJlbmNlIG9uIHRoZSBtb2RlbHMgY3JlYXRlZCBkeW5hbWljYWxseSwgYXMgdGhleSBkb24ndCBnZXQgZGVzdHJveWVkXG5cdFx0Ly8gYXV0b21hdGljYWxseSB3aGVuIHRoZSB2aWV3IGlzIGRlc3Ryb3llZC5cblx0XHQvLyBUaGlzIGlzIGRvbmUgZHVyaW5nIG9uRXhpdFxuXHRcdGNvbnN0IG9Nb2RlbCA9IG5ldyBKU09OTW9kZWwoKTtcblx0XHR0aGlzLl9hSGVscGVyTW9kZWxzLnB1c2gob01vZGVsKTtcblxuXHRcdHJldHVybiBvTW9kZWw7XG5cdH1cblxuXHQvKipcblx0ICogRnVuY3Rpb24gd2FpdGluZyBmb3IgdGhlIFJpZ2h0IG1vc3QgdmlldyB0byBiZSByZWFkeS5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkJhc2VDb250cm9sbGVyXG5cdCAqIEBwYXJhbSBvRXZlbnQgUmVmZXJlbmNlIGFuIEV2ZW50IHBhcmFtZXRlciBjb21pbmcgZnJvbSByb3V0ZU1hdGNoZWQgZXZlbnRcblx0ICogQHJldHVybnMgQSBwcm9taXNlIGluZGljYXRpbmcgd2hlbiB0aGUgcmlnaHQgbW9zdCB2aWV3IGlzIHJlYWR5XG5cdCAqL1xuXHR3YWl0Rm9yUmlnaHRNb3N0Vmlld1JlYWR5KG9FdmVudDogYW55KSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Y29uc3QgYUNvbnRhaW5lcnMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwidmlld3NcIiksXG5cdFx0XHRcdC8vIFRoZXJlIGNhbiBhbHNvIGJlIHJldXNlIGNvbXBvbmVudHMgaW4gdGhlIHZpZXcsIHJlbW92ZSB0aGVtIGJlZm9yZSBwcm9jZXNzaW5nLlxuXHRcdFx0XHRhRkVDb250YWluZXJzOiBhbnlbXSA9IFtdO1xuXHRcdFx0YUNvbnRhaW5lcnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbnRhaW5lcjogYW55KSB7XG5cdFx0XHRcdGxldCBvVmlldyA9IG9Db250YWluZXI7XG5cdFx0XHRcdGlmIChvQ29udGFpbmVyICYmIG9Db250YWluZXIuZ2V0Q29tcG9uZW50SW5zdGFuY2UpIHtcblx0XHRcdFx0XHRjb25zdCBvQ29tcG9uZW50SW5zdGFuY2UgPSBvQ29udGFpbmVyLmdldENvbXBvbmVudEluc3RhbmNlKCk7XG5cdFx0XHRcdFx0b1ZpZXcgPSBvQ29tcG9uZW50SW5zdGFuY2UuZ2V0Um9vdENvbnRyb2woKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1ZpZXcgJiYgb1ZpZXcuZ2V0Q29udHJvbGxlcigpICYmIG9WaWV3LmdldENvbnRyb2xsZXIoKS5wYWdlUmVhZHkpIHtcblx0XHRcdFx0XHRhRkVDb250YWluZXJzLnB1c2gob1ZpZXcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG9SaWdodE1vc3RGRVZpZXcgPSBhRkVDb250YWluZXJzW2FGRUNvbnRhaW5lcnMubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAob1JpZ2h0TW9zdEZFVmlldyAmJiBvUmlnaHRNb3N0RkVWaWV3LmdldENvbnRyb2xsZXIoKS5wYWdlUmVhZHkuaXNQYWdlUmVhZHkoKSkge1xuXHRcdFx0XHRyZXNvbHZlKG9SaWdodE1vc3RGRVZpZXcpO1xuXHRcdFx0fSBlbHNlIGlmIChvUmlnaHRNb3N0RkVWaWV3KSB7XG5cdFx0XHRcdG9SaWdodE1vc3RGRVZpZXcuZ2V0Q29udHJvbGxlcigpLnBhZ2VSZWFkeS5hdHRhY2hFdmVudE9uY2UoXCJwYWdlUmVhZHlcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJlc29sdmUob1JpZ2h0TW9zdEZFVmlldyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZG9uZS5cblx0ICogIC0gdXBkYXRlIHRoZSBzaGVsbCB0aXRsZS5cblx0ICogIC0gdXBkYXRlIHRhYmxlIHNjcm9sbC5cblx0ICogIC0gY2FsbCBvblBhZ2VSZWFkeSBvbiB0aGUgcmlnaHRNb3N0Vmlldy5cblx0ICpcblx0ICogQHBhcmFtIG9FdmVudFxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlciNfb25BZnRlclJvdXRlTWF0Y2hlZFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXJcblx0ICovXG5cdF9vbkFmdGVyUm91dGVNYXRjaGVkKG9FdmVudDogYW55KSB7XG5cdFx0aWYgKCF0aGlzLl9vUm91dGVNYXRjaGVkUHJvbWlzZSkge1xuXHRcdFx0dGhpcy5fb1JvdXRlTWF0Y2hlZFByb21pc2UgPSB0aGlzLndhaXRGb3JSaWdodE1vc3RWaWV3UmVhZHkob0V2ZW50KVxuXHRcdFx0XHQudGhlbigob1ZpZXc6IGFueSkgPT4ge1xuXHRcdFx0XHRcdC8vIFRoZSBhdXRvRm9jdXMgaXMgaW5pdGlhbGx5IGRpc2FibGVkIG9uIHRoZSBuYXZDb250YWluZXIgb3IgdGhlIEZDTCwgc28gdGhhdCB0aGUgZm9jdXMgc3RheXMgb24gdGhlIFNoZWxsIG1lbnVcblx0XHRcdFx0XHQvLyBldmVuIGlmIHRoZSBhcHAgdGFrZXMgYSBsb25nIHRpbWUgdG8gbGF1bmNoXG5cdFx0XHRcdFx0Ly8gVGhlIGZpcnN0IHRpbWUgdGhlIHZpZXcgaXMgZGlzcGxheWVkLCB3ZSBuZWVkIHRvIGVuYWJsZSB0aGUgYXV0b2ZvY3VzIHNvIHRoYXQgaXQncyBtYW5hZ2VkIHByb3Blcmx5IGR1cmluZyBuYXZpZ2F0aW9uXG5cdFx0XHRcdFx0Y29uc3Qgb1Jvb3RDb250cm9sID0gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udGVudCgpWzBdIGFzIGFueTtcblx0XHRcdFx0XHRpZiAob1Jvb3RDb250cm9sICYmIG9Sb290Q29udHJvbC5nZXRBdXRvRm9jdXMgJiYgIW9Sb290Q29udHJvbC5nZXRBdXRvRm9jdXMoKSkge1xuXHRcdFx0XHRcdFx0b1Jvb3RDb250cm9sLnNldFByb3BlcnR5KFwiYXV0b0ZvY3VzXCIsIHRydWUsIHRydWUpOyAvLyBEbyBub3QgbWFyayB0aGUgY29udGFpbmVyIGFzIGludmFsaWQsIG90aGVyd2lzZSBpdCdzIHJlLXJlbmRlcmVkXG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0XHRcdFx0dGhpcy5fc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMoKTtcblx0XHRcdFx0XHRpZiAob0FwcENvbXBvbmVudC5nZXRFbnZpcm9ubWVudENhcGFiaWxpdGllcygpLmdldENhcGFiaWxpdGllcygpLlVTaGVsbCkge1xuXHRcdFx0XHRcdFx0dGhpcy5fY29tcHV0ZVRpdGxlSGllcmFyY2h5KG9WaWV3KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgYkZvcmNlRm9jdXMgPSBvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuaXNGb2N1c0ZvcmNlZCgpO1xuXHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5zZXRGb2N1c0ZvcmNlZChmYWxzZSk7IC8vIHJlc2V0XG5cdFx0XHRcdFx0aWYgKG9WaWV3LmdldENvbnRyb2xsZXIoKSAmJiBvVmlldy5nZXRDb250cm9sbGVyKCkub25QYWdlUmVhZHkgJiYgb1ZpZXcuZ2V0UGFyZW50KCkub25QYWdlUmVhZHkpIHtcblx0XHRcdFx0XHRcdG9WaWV3LmdldFBhcmVudCgpLm9uUGFnZVJlYWR5KHsgZm9yY2VGb2N1czogYkZvcmNlRm9jdXMgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghYkZvcmNlRm9jdXMpIHtcblx0XHRcdFx0XHRcdC8vIFRyeSB0byByZXN0b3JlIHRoZSBmb2N1cyBvbiB3aGVyZSBpdCB3YXMgd2hlbiB3ZSBsYXN0IHZpc2l0ZWQgdGhlIGN1cnJlbnQgaGFzaFxuXHRcdFx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLnJlc3RvcmVGb2N1c0ZvckN1cnJlbnRIYXNoKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICh0aGlzLm9uQ29udGFpbmVyUmVhZHkpIHtcblx0XHRcdFx0XHRcdHRoaXMub25Db250YWluZXJSZWFkeSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIkFuIGVycm9yIG9jY3VycyB3aGlsZSBjb21wdXRpbmcgdGhlIHRpdGxlIGhpZXJhcmNoeSBhbmQgY2FsbGluZyBmb2N1cyBtZXRob2RcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmZpbmFsbHkoKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX29Sb3V0ZU1hdGNoZWRQcm9taXNlID0gbnVsbDtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgVGl0bGVIaWVyYXJjaHkgY2FjaGUgKCBvciBpbml0aWFsaXplcyBpdCBpZiB1bmRlZmluZWQpLlxuXHQgKlxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlciNfZ2V0VGl0bGVIaWVyYXJjaHlDYWNoZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXJcblx0ICogQHJldHVybnMgIFRoZSBUaXRsZUhpZXJhcmNoeSBjYWNoZVxuXHQgKi9cblx0X2dldFRpdGxlSGllcmFyY2h5Q2FjaGUoKSB7XG5cdFx0aWYgKCF0aGlzLm9UaXRsZUhpZXJhcmNoeUNhY2hlKSB7XG5cdFx0XHR0aGlzLm9UaXRsZUhpZXJhcmNoeUNhY2hlID0ge307XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLm9UaXRsZUhpZXJhcmNoeUNhY2hlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIHRpdGxlSW5mbyBvYmplY3QuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gdGl0bGUgVGhlIGFwcGxpY2F0aW9uJ3MgdGl0bGVcblx0ICogQHBhcmFtIHN1YnRpdGxlIFRoZSBhcHBsaWNhdGlvbidzIHN1YlRpdGxlXG5cdCAqIEBwYXJhbSBzSW50ZW50IFRoZSBpbnRlbnQgcGF0aCB0byBiZSByZWRpcmVjdGVkIHRvXG5cdCAqIEBwYXJhbSBpY29uIFRoZSBhcHBsaWNhdGlvbidzIGljb25cblx0ICogQHJldHVybnMgVGhlIHRpdGxlIGluZm9ybWF0aW9uXG5cdCAqL1xuXHRfY29tcHV0ZVRpdGxlSW5mbyh0aXRsZTogYW55LCBzdWJ0aXRsZTogYW55LCBzSW50ZW50OiBhbnksIGljb24gPSBcIlwiKSB7XG5cdFx0Y29uc3QgYVBhcnRzID0gc0ludGVudC5zcGxpdChcIi9cIik7XG5cdFx0aWYgKGFQYXJ0c1thUGFydHMubGVuZ3RoIC0gMV0uaW5kZXhPZihcIj9cIikgPT09IC0xKSB7XG5cdFx0XHRzSW50ZW50ICs9IFwiP3Jlc3RvcmVIaXN0b3J5PXRydWVcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0ludGVudCArPSBcIiZyZXN0b3JlSGlzdG9yeT10cnVlXCI7XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogdGl0bGUsXG5cdFx0XHRzdWJ0aXRsZTogc3VidGl0bGUsXG5cdFx0XHRpbnRlbnQ6IHNJbnRlbnQsXG5cdFx0XHRpY29uOiBpY29uXG5cdFx0fTtcblx0fVxuXG5cdF9mb3JtYXRUaXRsZShkaXNwbGF5TW9kZTogc3RyaW5nLCB0aXRsZVZhbHVlOiBzdHJpbmcsIHRpdGxlRGVzY3JpcHRpb246IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0bGV0IGZvcm1hdHRlZFRpdGxlID0gXCJcIjtcblx0XHRzd2l0Y2ggKGRpc3BsYXlNb2RlKSB7XG5cdFx0XHRjYXNlIFwiVmFsdWVcIjpcblx0XHRcdFx0Zm9ybWF0dGVkVGl0bGUgPSBgJHt0aXRsZVZhbHVlfWA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0Zm9ybWF0dGVkVGl0bGUgPSBgJHt0aXRsZVZhbHVlfSAoJHt0aXRsZURlc2NyaXB0aW9ufSlgO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblZhbHVlXCI6XG5cdFx0XHRcdGZvcm1hdHRlZFRpdGxlID0gYCR7dGl0bGVEZXNjcmlwdGlvbn0gKCR7dGl0bGVWYWx1ZX0pYDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0Zm9ybWF0dGVkVGl0bGUgPSBgJHt0aXRsZURlc2NyaXB0aW9ufWA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHR9XG5cdFx0cmV0dXJuIGZvcm1hdHRlZFRpdGxlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZldGNoZXMgdGhlIHZhbHVlIG9mIHRoZSBIZWFkZXJJbmZvIHRpdGxlIGZvciBhIGdpdmVuIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBzUGF0aCBUaGUgcGF0aCB0byB0aGUgZW50aXR5XG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSBjb250YWluaW5nIHRoZSBmb3JtYXR0ZWQgdGl0bGUsIG9yIGFuIGVtcHR5IHN0cmluZyBpZiBubyBIZWFkZXJJbmZvIHRpdGxlIGFubm90YXRpb24gaXMgYXZhaWxhYmxlXG5cdCAqL1xuXHRhc3luYyBfZmV0Y2hUaXRsZVZhbHVlKHNQYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdG9Nb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCksXG5cdFx0XHRvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGgpLFxuXHRcdFx0b0JpbmRpbmdWaWV3Q29udGV4dCA9IG9Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzUGF0aCksXG5cdFx0XHRzVmFsdWVFeHByZXNzaW9uID0gQW5ub3RhdGlvbkhlbHBlci5mb3JtYXQoXG5cdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm8vVGl0bGUvVmFsdWVgKSxcblx0XHRcdFx0eyBjb250ZXh0OiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSB9XG5cdFx0XHQpO1xuXHRcdGlmICghc1ZhbHVlRXhwcmVzc2lvbikge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShcIlwiKTtcblx0XHR9XG5cdFx0Y29uc3Qgc1RleHRFeHByZXNzaW9uID0gQW5ub3RhdGlvbkhlbHBlci5mb3JtYXQoXG5cdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm8vVGl0bGUvVmFsdWUvJFBhdGhAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgXG5cdFx0XHRcdCksXG5cdFx0XHRcdHsgY29udGV4dDogb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgfVxuXHRcdFx0KSxcblx0XHRcdG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvL1RpdGxlL1ZhbHVlLyRQYXRoQGApLFxuXHRcdFx0YVByb21pc2VzOiBQcm9taXNlPHZvaWQ+W10gPSBbXSxcblx0XHRcdG9WYWx1ZUV4cHJlc3Npb24gPSBCaW5kaW5nUGFyc2VyLmNvbXBsZXhQYXJzZXIoc1ZhbHVlRXhwcmVzc2lvbiksXG5cdFx0XHRvUHJvbWlzZUZvckRpc3BsYXlNb2RlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkKSB7XG5cdFx0XHRcdGNvbnN0IGRpc3BsYXlNb2RlID0gQ29tbW9uVXRpbHMuY29tcHV0ZURpc3BsYXlNb2RlKG9Qcm9wZXJ0eUNvbnRleHQpO1xuXHRcdFx0XHRyZXNvbHZlKGRpc3BsYXlNb2RlKTtcblx0XHRcdH0pO1xuXHRcdGFQcm9taXNlcy5wdXNoKG9Qcm9taXNlRm9yRGlzcGxheU1vZGUpO1xuXHRcdGNvbnN0IHNWYWx1ZVBhdGggPSBvVmFsdWVFeHByZXNzaW9uLnBhcnRzID8gb1ZhbHVlRXhwcmVzc2lvbi5wYXJ0c1swXS5wYXRoIDogb1ZhbHVlRXhwcmVzc2lvbi5wYXRoLFxuXHRcdFx0Zm5WYWx1ZUZvcm1hdHRlciA9IG9WYWx1ZUV4cHJlc3Npb24uZm9ybWF0dGVyLFxuXHRcdFx0b1ZhbHVlQmluZGluZyA9IG9Nb2RlbC5iaW5kUHJvcGVydHkoc1ZhbHVlUGF0aCwgb0JpbmRpbmdWaWV3Q29udGV4dCwgeyBcIiQkZ3JvdXBJZFwiOiBcIiRhdXRvLkhlcm9lc1wiIH0pO1xuXHRcdG9WYWx1ZUJpbmRpbmcuaW5pdGlhbGl6ZSgpO1xuXHRcdGNvbnN0IG9Qcm9taXNlRm9yVGl0bGVWYWx1ZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Y29uc3QgZm5DaGFuZ2UgPSBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgc1RhcmdldFZhbHVlID0gZm5WYWx1ZUZvcm1hdHRlciA/IGZuVmFsdWVGb3JtYXR0ZXIob0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCkpIDogb0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCk7XG5cblx0XHRcdFx0b1ZhbHVlQmluZGluZy5kZXRhY2hDaGFuZ2UoZm5DaGFuZ2UpO1xuXHRcdFx0XHRyZXNvbHZlKHNUYXJnZXRWYWx1ZSk7XG5cdFx0XHR9O1xuXHRcdFx0b1ZhbHVlQmluZGluZy5hdHRhY2hDaGFuZ2UoZm5DaGFuZ2UpO1xuXHRcdH0pO1xuXHRcdGFQcm9taXNlcy5wdXNoKG9Qcm9taXNlRm9yVGl0bGVWYWx1ZSk7XG5cblx0XHRpZiAoc1RleHRFeHByZXNzaW9uKSB7XG5cdFx0XHRjb25zdCBvVGV4dEV4cHJlc3Npb24gPSBCaW5kaW5nUGFyc2VyLmNvbXBsZXhQYXJzZXIoc1RleHRFeHByZXNzaW9uKTtcblx0XHRcdGxldCBzVGV4dFBhdGggPSBvVGV4dEV4cHJlc3Npb24ucGFydHMgPyBvVGV4dEV4cHJlc3Npb24ucGFydHNbMF0ucGF0aCA6IG9UZXh0RXhwcmVzc2lvbi5wYXRoO1xuXHRcdFx0c1RleHRQYXRoID0gc1ZhbHVlUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgPiAtMSA/IGAke3NWYWx1ZVBhdGguc2xpY2UoMCwgc1ZhbHVlUGF0aC5sYXN0SW5kZXhPZihcIi9cIikpfS8ke3NUZXh0UGF0aH1gIDogc1RleHRQYXRoO1xuXG5cdFx0XHRjb25zdCBmblRleHRGb3JtYXR0ZXIgPSBvVGV4dEV4cHJlc3Npb24uZm9ybWF0dGVyLFxuXHRcdFx0XHRvVGV4dEJpbmRpbmcgPSBvTW9kZWwuYmluZFByb3BlcnR5KHNUZXh0UGF0aCwgb0JpbmRpbmdWaWV3Q29udGV4dCwgeyBcIiQkZ3JvdXBJZFwiOiBcIiRhdXRvLkhlcm9lc1wiIH0pO1xuXHRcdFx0b1RleHRCaW5kaW5nLmluaXRpYWxpemUoKTtcblx0XHRcdGNvbnN0IG9Qcm9taXNlRm9yVGl0bGVUZXh0ID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6IChkZXNjcmlwdGlvbjogYW55KSA9PiB2b2lkKSB7XG5cdFx0XHRcdGNvbnN0IGZuQ2hhbmdlID0gZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1RhcmdldFRleHQgPSBmblRleHRGb3JtYXR0ZXIgPyBmblRleHRGb3JtYXR0ZXIob0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCkpIDogb0V2ZW50LmdldFNvdXJjZSgpLmdldFZhbHVlKCk7XG5cblx0XHRcdFx0XHRvVGV4dEJpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHRcdFx0XHRyZXNvbHZlKHNUYXJnZXRUZXh0KTtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRvVGV4dEJpbmRpbmcuYXR0YWNoQ2hhbmdlKGZuQ2hhbmdlKTtcblx0XHRcdH0pO1xuXHRcdFx0YVByb21pc2VzLnB1c2gob1Byb21pc2VGb3JUaXRsZVRleHQpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgdGl0bGVJbmZvOiBhbnlbXSA9IGF3YWl0IFByb21pc2UuYWxsKGFQcm9taXNlcyk7XG5cdFx0XHRsZXQgZm9ybWF0dGVkVGl0bGUgPSBcIlwiO1xuXHRcdFx0aWYgKHR5cGVvZiB0aXRsZUluZm8gIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0Zm9ybWF0dGVkVGl0bGUgPSB0aGlzLl9mb3JtYXRUaXRsZSh0aXRsZUluZm9bMF0sIHRpdGxlSW5mb1sxXSwgdGl0bGVJbmZvWzJdKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmb3JtYXR0ZWRUaXRsZTtcblx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBmZXRjaGluZyB0aGUgdGl0bGUgZnJvbSB0aGUgaGVhZGVyIGluZm8gOlwiICsgZXJyb3IpO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiByZXR1cm5pbmcgdGhlIGRlY29kZWQgYXBwbGljYXRpb24tc3BlY2lmaWMgaGFzaC5cblx0ICpcblx0ICogQHJldHVybnMgRGVjb2RlZCBhcHBsaWNhdGlvbi1zcGVjaWZpYyBoYXNoXG5cdCAqL1xuXHRfZ2V0QXBwU3BlY2lmaWNIYXNoKCk6IHN0cmluZyB7XG5cdFx0Ly8gSGFzaENoYW5nZWQgaXNTaGVsbE5hdmlnYXRpb25IYXNoQ2hhbmdlclxuXHRcdGNvbnN0IGhhc2hDaGFuZ2VyID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBIYXNoQ2hhbmdlciB8IChIYXNoQ2hhbmdlciAmIHsgaHJlZkZvckFwcFNwZWNpZmljSGFzaDogRnVuY3Rpb24gfSk7XG5cdFx0cmV0dXJuIFwiaHJlZkZvckFwcFNwZWNpZmljSGFzaFwiIGluIGhhc2hDaGFuZ2VyID8gVVJJLmRlY29kZShoYXNoQ2hhbmdlci5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoKFwiXCIpKSA6IFwiIy9cIjtcblx0fVxuXG5cdF9nZXRIYXNoKCkge1xuXHRcdHJldHVybiBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGl0bGVJbmZvcm1hdGlvbiBmcm9tIGEgcGF0aC5cblx0ICogSXQgdXBkYXRlcyB0aGUgY2FjaGUgdG8gc3RvcmUgdGl0bGUgaW5mb3JtYXRpb24gaWYgbmVjZXNzYXJ5XG5cdCAqXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLnJvb3RWaWV3LkJhc2VDb250cm9sbGVyI2dldFRpdGxlSW5mb0Zyb21QYXRoXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5yb290Vmlldy5CYXNlQ29udHJvbGxlclxuXHQgKiBAcGFyYW0geyp9IHNQYXRoIHBhdGggb2YgdGhlIGNvbnRleHQgdG8gcmV0cmlldmUgdGl0bGUgaW5mb3JtYXRpb24gZnJvbSBNZXRhTW9kZWxcblx0ICogQHJldHVybnMge1Byb21pc2V9ICBvVGl0bGVpbmZvcm1hdGlvbiByZXR1cm5lZCBhcyBwcm9taXNlXG5cdCAqL1xuXG5cdGdldFRpdGxlSW5mb0Zyb21QYXRoKHNQYXRoOiBhbnkpIHtcblx0XHRjb25zdCBvVGl0bGVIaWVyYXJjaHlDYWNoZSA9IHRoaXMuX2dldFRpdGxlSGllcmFyY2h5Q2FjaGUoKTtcblxuXHRcdGlmIChvVGl0bGVIaWVyYXJjaHlDYWNoZVtzUGF0aF0pIHtcblx0XHRcdC8vIFRoZSB0aXRsZSBpbmZvIGlzIGFscmVhZHkgc3RvcmVkIGluIHRoZSBjYWNoZVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShvVGl0bGVIaWVyYXJjaHlDYWNoZVtzUGF0aF0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IHNFbnRpdHlQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChzUGF0aCk7XG5cdFx0Y29uc3Qgc1R5cGVOYW1lID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJJbmZvL1R5cGVOYW1lYCk7XG5cdFx0Y29uc3Qgc0FwcFNwZWNpZmljSGFzaCA9IHRoaXMuX2dldEFwcFNwZWNpZmljSGFzaCgpO1xuXHRcdGNvbnN0IHNJbnRlbnQgPSBzQXBwU3BlY2lmaWNIYXNoICsgc1BhdGguc2xpY2UoMSk7XG5cdFx0cmV0dXJuIHRoaXMuX2ZldGNoVGl0bGVWYWx1ZShzUGF0aCkudGhlbigoc1RpdGxlOiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IG9UaXRsZUluZm8gPSB0aGlzLl9jb21wdXRlVGl0bGVJbmZvKHNUeXBlTmFtZSwgc1RpdGxlLCBzSW50ZW50KTtcblx0XHRcdG9UaXRsZUhpZXJhcmNoeUNhY2hlW3NQYXRoXSA9IG9UaXRsZUluZm87XG5cdFx0XHRyZXR1cm4gb1RpdGxlSW5mbztcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFbnN1cmUgdGhhdCB0aGUgdXNoZWxsIHNlcnZpY2UgcmVjZWl2ZXMgYWxsIGVsZW1lbnRzXG5cdCAqICh0aXRsZSwgc3VidGl0bGUsIGludGVudCwgaWNvbikgYXMgc3RyaW5ncy5cblx0ICpcblx0ICogQW5ub3RhdGlvbiBIZWFkZXJJbmZvIGFsbG93cyBmb3IgYmluZGluZyBvZiB0aXRsZSBhbmQgZGVzY3JpcHRpb25cblx0ICogKHdoaWNoIGFyZSB1c2VkIGhlcmUgYXMgdGl0bGUgYW5kIHN1YnRpdGxlKSB0byBhbnkgZWxlbWVudCBpbiB0aGUgZW50aXR5XG5cdCAqIChiZWluZyBwb3NzaWJseSB0eXBlcyBsaWtlIGJvb2xlYW4sIHRpbWVzdGFtcCwgZG91YmxlLCBldGMuKVxuXHQgKlxuXHQgKiBDcmVhdGVzIGEgbmV3IGhpZXJhcmNoeSBhbmQgY29udmVydHMgbm9uLXN0cmluZyB0eXBlcyB0byBzdHJpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBhSGllcmFyY2h5IFNoZWxsIHRpdGxlIGhpZXJhcmNoeVxuXHQgKiBAcmV0dXJucyBDb3B5IG9mIHNoZWxsIHRpdGxlIGhpZXJhcmNoeSBjb250YWluaW5nIGFsbCBlbGVtZW50cyBhcyBzdHJpbmdzXG5cdCAqL1xuXHRfZW5zdXJlSGllcmFyY2h5RWxlbWVudHNBcmVTdHJpbmdzKGFIaWVyYXJjaHk6IGFueSkge1xuXHRcdGNvbnN0IGFIaWVyYXJjaHlTaGVsbCA9IFtdO1xuXHRcdGZvciAoY29uc3QgbGV2ZWwgaW4gYUhpZXJhcmNoeSkge1xuXHRcdFx0Y29uc3Qgb0hpZXJhcmNoeSA9IGFIaWVyYXJjaHlbbGV2ZWxdO1xuXHRcdFx0Y29uc3Qgb1NoZWxsSGllcmFyY2h5OiBhbnkgPSB7fTtcblx0XHRcdGZvciAoY29uc3Qga2V5IGluIG9IaWVyYXJjaHkpIHtcblx0XHRcdFx0b1NoZWxsSGllcmFyY2h5W2tleV0gPSB0eXBlb2Ygb0hpZXJhcmNoeVtrZXldICE9PSBcInN0cmluZ1wiID8gU3RyaW5nKG9IaWVyYXJjaHlba2V5XSkgOiBvSGllcmFyY2h5W2tleV07XG5cdFx0XHR9XG5cdFx0XHRhSGllcmFyY2h5U2hlbGwucHVzaChvU2hlbGxIaWVyYXJjaHkpO1xuXHRcdH1cblx0XHRyZXR1cm4gYUhpZXJhcmNoeVNoZWxsO1xuXHR9XG5cblx0X2dldFRhcmdldFR5cGVGcm9tSGFzaChzSGFzaDogYW55KSB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0bGV0IHNUYXJnZXRUeXBlID0gXCJcIjtcblxuXHRcdGNvbnN0IGFSb3V0ZXMgPSBvQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0RW50cnkoXCJzYXAudWk1XCIpLnJvdXRpbmc/LnJvdXRlcyA/PyBbXTtcblx0XHRmb3IgKGNvbnN0IHJvdXRlIG9mIGFSb3V0ZXMpIHtcblx0XHRcdGNvbnN0IG9Sb3V0ZSA9IG9BcHBDb21wb25lbnQuZ2V0Um91dGVyKCkuZ2V0Um91dGUocm91dGUubmFtZSk7XG5cdFx0XHRpZiAob1JvdXRlPy5tYXRjaChzSGFzaCkpIHtcblx0XHRcdFx0Y29uc3Qgc1RhcmdldCA9IEFycmF5LmlzQXJyYXkocm91dGUudGFyZ2V0KSA/IHJvdXRlLnRhcmdldFswXSA6IHJvdXRlLnRhcmdldDtcblx0XHRcdFx0c1RhcmdldFR5cGUgPSAob0FwcENvbXBvbmVudC5nZXRSb3V0ZXIoKS5nZXRUYXJnZXQoc1RhcmdldCkgYXMgYW55KS5fb09wdGlvbnMubmFtZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNUYXJnZXRUeXBlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gdXBkYXRlcyB0aGUgc2hlbGwgdGl0bGUgYWZ0ZXIgZWFjaCBuYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUucm9vdFZpZXcuQmFzZUNvbnRyb2xsZXJcblx0ICogQHBhcmFtIG9WaWV3IFRoZSBjdXJyZW50IHZpZXdcblx0ICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgbWVudSBpcyBmaWxsZWQgcHJvcGVybHlcblx0ICovXG5cdF9jb21wdXRlVGl0bGVIaWVyYXJjaHkob1ZpZXc6IGFueSkge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLFxuXHRcdFx0b0NvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0b0N1cnJlbnRQYWdlID0gb1ZpZXcuZ2V0UGFyZW50KCksXG5cdFx0XHRhVGl0bGVJbmZvcm1hdGlvblByb21pc2VzID0gW10sXG5cdFx0XHRzQXBwU3BlY2lmaWNIYXNoID0gdGhpcy5fZ2V0QXBwU3BlY2lmaWNIYXNoKCksXG5cdFx0XHRtYW5pZmVzdEFwcFNldHRpbmdzID0gb0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLmFwcFwiKSxcblx0XHRcdHNBcHBUaXRsZSA9IG1hbmlmZXN0QXBwU2V0dGluZ3MudGl0bGUgfHwgXCJcIixcblx0XHRcdHNBcHBTdWJUaXRsZSA9IG1hbmlmZXN0QXBwU2V0dGluZ3Muc3ViVGl0bGUgfHwgXCJcIixcblx0XHRcdGFwcEljb24gPSBtYW5pZmVzdEFwcFNldHRpbmdzLmljb24gfHwgXCJcIjtcblx0XHRsZXQgb1BhZ2VUaXRsZUluZm9ybWF0aW9uOiBhbnksIHNOZXdQYXRoO1xuXG5cdFx0aWYgKG9DdXJyZW50UGFnZSAmJiBvQ3VycmVudFBhZ2UuX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uKSB7XG5cdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0Ly8gSWYgdGhlIGZpcnN0IHBhZ2Ugb2YgdGhlIGFwcGxpY2F0aW9uIGlzIGEgTFIsIHVzZSB0aGUgdGl0bGUgYW5kIHN1YnRpdGxlIGZyb20gdGhlIG1hbmlmZXN0XG5cdFx0XHRcdGlmICh0aGlzLl9nZXRUYXJnZXRUeXBlRnJvbUhhc2goXCJcIikgPT09IFwic2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0XCIpIHtcblx0XHRcdFx0XHRhVGl0bGVJbmZvcm1hdGlvblByb21pc2VzLnB1c2goXG5cdFx0XHRcdFx0XHRQcm9taXNlLnJlc29sdmUodGhpcy5fY29tcHV0ZVRpdGxlSW5mbyhzQXBwVGl0bGUsIHNBcHBTdWJUaXRsZSwgc0FwcFNwZWNpZmljSGFzaCwgYXBwSWNvbikpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFRoZW4gbWFuYWdlIG90aGVyIHBhZ2VzXG5cdFx0XHRcdHNOZXdQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0XHRjb25zdCBhUGF0aFBhcnRzID0gc05ld1BhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRsZXQgc1BhdGggPSBcIlwiO1xuXG5cdFx0XHRcdGFQYXRoUGFydHMuc2hpZnQoKTsgLy8gUmVtb3ZlIHRoZSBmaXJzdCBzZWdtZW50IChlbXB0eSBzdHJpbmcpIGFzIGl0IGhhcyBiZWVuIG1hbmFnZWQgYWJvdmVcblx0XHRcdFx0YVBhdGhQYXJ0cy5wb3AoKTsgLy8gUmVtb3ZlIHRoZSBsYXN0IHNlZ21lbnQgYXMgaXQgY29ycmVzcG9uZHMgdG8gdGhlIGN1cnJlbnQgcGFnZSBhbmQgc2hvdWxkbid0IGFwcGVhciBpbiB0aGUgbWVudVxuXG5cdFx0XHRcdGFQYXRoUGFydHMuZm9yRWFjaCgoc1BhdGhQYXJ0OiBhbnkpID0+IHtcblx0XHRcdFx0XHRzUGF0aCArPSBgLyR7c1BhdGhQYXJ0fWA7XG5cdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9BcHBDb21wb25lbnQuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdFx0XHRzUGFyYW1ldGVyUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGgpLFxuXHRcdFx0XHRcdFx0YklzUGFyYW1ldGVyaXplZCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXJhbWV0ZXJQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKTtcblx0XHRcdFx0XHRpZiAoIWJJc1BhcmFtZXRlcml6ZWQpIHtcblx0XHRcdFx0XHRcdGFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMucHVzaCh0aGlzLmdldFRpdGxlSW5mb0Zyb21QYXRoKHNQYXRoKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQ3VycmVudCBwYWdlXG5cdFx0XHRvUGFnZVRpdGxlSW5mb3JtYXRpb24gPSBvQ3VycmVudFBhZ2UuX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uKCk7XG5cdFx0XHRvUGFnZVRpdGxlSW5mb3JtYXRpb24gPSB0aGlzLl9jb21wdXRlVGl0bGVJbmZvKFxuXHRcdFx0XHRvUGFnZVRpdGxlSW5mb3JtYXRpb24udGl0bGUsXG5cdFx0XHRcdG9QYWdlVGl0bGVJbmZvcm1hdGlvbi5zdWJ0aXRsZSxcblx0XHRcdFx0c0FwcFNwZWNpZmljSGFzaCArIHRoaXMuX2dldEhhc2goKVxuXHRcdFx0KTtcblxuXHRcdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRcdHRoaXMuX2dldFRpdGxlSGllcmFyY2h5Q2FjaGUoKVtzTmV3UGF0aF0gPSBvUGFnZVRpdGxlSW5mb3JtYXRpb247XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLl9nZXRUaXRsZUhpZXJhcmNoeUNhY2hlKClbc0FwcFNwZWNpZmljSGFzaF0gPSBvUGFnZVRpdGxlSW5mb3JtYXRpb247XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFUaXRsZUluZm9ybWF0aW9uUHJvbWlzZXMucHVzaChQcm9taXNlLnJlamVjdChcIlRpdGxlIGluZm9ybWF0aW9uIG1pc3NpbmcgaW4gSGVhZGVySW5mb1wiKSk7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLmFsbChhVGl0bGVJbmZvcm1hdGlvblByb21pc2VzKVxuXHRcdFx0LnRoZW4oKGFUaXRsZUluZm9IaWVyYXJjaHk6IGFueVtdKSA9PiB7XG5cdFx0XHRcdC8vIHdvcmthcm91bmQgZm9yIHNoZWxsIHdoaWNoIGlzIGV4cGVjdGluZyBhbGwgZWxlbWVudHMgYmVpbmcgb2YgdHlwZSBzdHJpbmdcblx0XHRcdFx0Y29uc3QgYVRpdGxlSW5mb0hpZXJhcmNoeVNoZWxsID0gdGhpcy5fZW5zdXJlSGllcmFyY2h5RWxlbWVudHNBcmVTdHJpbmdzKGFUaXRsZUluZm9IaWVyYXJjaHkpLFxuXHRcdFx0XHRcdHNUaXRsZSA9IG9QYWdlVGl0bGVJbmZvcm1hdGlvbi50aXRsZTtcblx0XHRcdFx0YVRpdGxlSW5mb0hpZXJhcmNoeVNoZWxsLnJldmVyc2UoKTtcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0SGllcmFyY2h5KGFUaXRsZUluZm9IaWVyYXJjaHlTaGVsbCk7XG5cblx0XHRcdFx0dGhpcy5fc2V0U2hlbGxNZW51VGl0bGUob0FwcENvbXBvbmVudCwgc1RpdGxlLCBzQXBwVGl0bGUpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoc0Vycm9yTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihzRXJyb3JNZXNzYWdlKTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdHRoaXMuYklzQ29tcHV0aW5nVGl0bGVIaWVyYWNoeSA9IGZhbHNlO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoc0Vycm9yTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihzRXJyb3JNZXNzYWdlKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRjYWxjdWxhdGVMYXlvdXQoaU5leHRGQ0xMZXZlbDogbnVtYmVyLCBzSGFzaDogc3RyaW5nLCBzUHJvcG9zZWRMYXlvdXQ6IHN0cmluZyB8IHVuZGVmaW5lZCwga2VlcEN1cnJlbnRMYXlvdXQgPSBmYWxzZSkge1xuXHRcdHJldHVybiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxiYWNrIGFmdGVyIGEgdmlldyBoYXMgYmVlbiBib3VuZCB0byBhIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IGhhcyBiZWVuIGJvdW5kIHRvIGEgdmlld1xuXHQgKi9cblx0b25Db250ZXh0Qm91bmRUb1ZpZXcob0NvbnRleHQ6IGFueSkge1xuXHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0Y29uc3Qgc0RlZXBlc3RQYXRoID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKS5nZXRQcm9wZXJ0eShcIi9kZWVwZXN0UGF0aFwiKSxcblx0XHRcdFx0c1ZpZXdDb250ZXh0UGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblxuXHRcdFx0aWYgKCFzRGVlcGVzdFBhdGggfHwgc0RlZXBlc3RQYXRoLmluZGV4T2Yoc1ZpZXdDb250ZXh0UGF0aCkgIT09IDApIHtcblx0XHRcdFx0Ly8gVGhlcmUgd2FzIG5vIHByZXZpb3VzIHZhbHVlIGZvciB0aGUgZGVlcGVzdCByZWFjaGVkIHBhdGgsIG9yIHRoZSBwYXRoXG5cdFx0XHRcdC8vIGZvciB0aGUgdmlldyBpc24ndCBhIHN1YnBhdGggb2YgdGhlIHByZXZpb3VzIGRlZXBlc3QgcGF0aCAtLT4gdXBkYXRlXG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbCkuc2V0UHJvcGVydHkoXCIvZGVlcGVzdFBhdGhcIiwgc1ZpZXdDb250ZXh0UGF0aCwgdW5kZWZpbmVkLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGRpc3BsYXlFcnJvclBhZ2Uoc0Vycm9yTWVzc2FnZTogYW55LCBtUGFyYW1ldGVyczogYW55KTogUHJvbWlzZTxib29sZWFuPiB7XG5cdFx0Ly8gVG8gYmUgb3ZlcnJpZGRlblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdH1cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdHVwZGF0ZVVJU3RhdGVGb3JWaWV3KG9WaWV3OiBhbnksIEZDTExldmVsOiBhbnkpIHtcblx0XHQvLyBUbyBiZSBvdmVycmlkZW5cblx0fVxuXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0Z2V0SW5zdGFuY2VkVmlld3MoKTogWE1MVmlld1tdIHtcblx0XHRyZXR1cm4gW107XG5cdFx0Ly8gVG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHRfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMoKTogdm9pZCB7XG5cdFx0Ly8gVG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHRpc0ZjbEVuYWJsZWQoKTogdGhpcyBpcyBGY2xDb250cm9sbGVyIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdF9zZXRTaGVsbE1lbnVUaXRsZShvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsIHNUaXRsZTogc3RyaW5nLCBzQXBwVGl0bGU6IHN0cmluZyk6IHZvaWQge1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRlbiBieSBGY2xDb250cm9sbGVyXG5cdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0VGl0bGUoc1RpdGxlKTtcblx0fVxuXG5cdGdldEFwcENvbnRlbnRDb250YWluZXIoKTogTmF2Q29udGFpbmVyIHwgRmxleGlibGVDb2x1bW5MYXlvdXQge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdGNvbnN0IGFwcENvbnRlbnRJZCA9IG9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3RFbnRyeShcInNhcC51aTVcIikucm91dGluZz8uY29uZmlnPy5jb250cm9sSWQgPz8gXCJhcHBDb250ZW50XCI7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmJ5SWQoYXBwQ29udGVudElkKSBhcyBOYXZDb250YWluZXIgfCBGbGV4aWJsZUNvbHVtbkxheW91dDtcblx0fVxufVxuaW50ZXJmYWNlIFJvb3RWaWV3QmFzZUNvbnRyb2xsZXIge1xuXHRvbkNvbnRhaW5lclJlYWR5PygpOiB2b2lkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBSb290Vmlld0Jhc2VDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O01BcUJNQSxzQkFBc0IsV0FEM0JDLGNBQWMsQ0FBQyw2Q0FBNkMsQ0FBQyxVQUU1REMsY0FBYyxDQUFDQyxXQUFXLENBQUMsVUFHM0JELGNBQWMsQ0FBQ0UsU0FBUyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUEsTUFXbEJDLHlCQUF5QixHQUFHLEtBQUs7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQUV6Q0MsTUFBTSxHQUFOLGtCQUFTO01BQ1JDLFVBQVUsQ0FBQ0MsSUFBSSxFQUFFO01BRWpCLElBQUksQ0FBQ0MsY0FBYyxHQUFHLEVBQUU7SUFDekIsQ0FBQztJQUFBLE9BRURDLGNBQWMsR0FBZCwwQkFBaUI7TUFDaEIsT0FBTyxJQUFJLENBQUNDLFlBQVk7SUFDekIsQ0FBQztJQUFBLE9BRURDLG1CQUFtQixHQUFuQiwrQkFBc0I7TUFDckIsSUFBSSxDQUFDRCxZQUFZLENBQUNDLG1CQUFtQixFQUFFO01BQ3ZDLElBQUksQ0FBQ0MsZUFBZSxFQUFFLENBQUNDLGlCQUFpQixFQUFFLENBQUNDLHVCQUF1QixDQUFDLElBQUksQ0FBQ0Msb0JBQW9CLEVBQUUsSUFBSSxDQUFDO0lBQ3BHLENBQUM7SUFBQSxPQUVEQyxNQUFNLEdBQU4sa0JBQVM7TUFDUixJQUFJLENBQUNKLGVBQWUsRUFBRSxDQUFDQyxpQkFBaUIsRUFBRSxDQUFDSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUNGLG9CQUFvQixFQUFFLElBQUksQ0FBQztNQUNuRyxJQUFJLENBQUNHLE9BQU8sR0FBR0MsU0FBUztNQUV4QmIsVUFBVSxDQUFDYyxJQUFJLEVBQUU7O01BRWpCO01BQ0EsSUFBSSxDQUFDWixjQUFjLENBQUNhLE9BQU8sQ0FBQyxVQUFVQyxNQUFXLEVBQUU7UUFDbERBLE1BQU0sQ0FBQ0MsT0FBTyxFQUFFO01BQ2pCLENBQUMsQ0FBQztJQUNIOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQUMsaUJBQWlCLEdBQWpCLDZCQUFvQjtNQUNuQixPQUFRLElBQUksQ0FBQ0MsaUJBQWlCLEVBQUUsQ0FBQ0MsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFtQkYsaUJBQWlCLEVBQUU7SUFDeEYsQ0FBQztJQUFBLE9BRURHLFNBQVMsR0FBVCxxQkFBWTtNQUNYLElBQUksQ0FBQyxJQUFJLENBQUNULE9BQU8sRUFBRTtRQUNsQixJQUFJLENBQUNBLE9BQU8sR0FBRyxJQUFJLENBQUNOLGVBQWUsRUFBRSxDQUFDZSxTQUFTLEVBQUU7TUFDbEQ7TUFFQSxPQUFPLElBQUksQ0FBQ1QsT0FBTztJQUNwQixDQUFDO0lBQUEsT0FFRFUsa0JBQWtCLEdBQWxCLDhCQUFxQjtNQUNwQjtNQUNBO01BQ0E7TUFDQSxNQUFNTixNQUFNLEdBQUcsSUFBSU8sU0FBUyxFQUFFO01BQzlCLElBQUksQ0FBQ3JCLGNBQWMsQ0FBQ3NCLElBQUksQ0FBQ1IsTUFBTSxDQUFDO01BRWhDLE9BQU9BLE1BQU07SUFDZDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FPQVMseUJBQXlCLEdBQXpCLG1DQUEwQkMsTUFBVyxFQUFFO01BQ3RDLE9BQU8sSUFBSUMsT0FBTyxDQUFDLFVBQVVDLE9BQTZCLEVBQUU7UUFDM0QsTUFBTUMsV0FBVyxHQUFHSCxNQUFNLENBQUNJLFlBQVksQ0FBQyxPQUFPLENBQUM7VUFDL0M7VUFDQUMsYUFBb0IsR0FBRyxFQUFFO1FBQzFCRixXQUFXLENBQUNkLE9BQU8sQ0FBQyxVQUFVaUIsVUFBZSxFQUFFO1VBQzlDLElBQUlDLEtBQUssR0FBR0QsVUFBVTtVQUN0QixJQUFJQSxVQUFVLElBQUlBLFVBQVUsQ0FBQ0Usb0JBQW9CLEVBQUU7WUFDbEQsTUFBTUMsa0JBQWtCLEdBQUdILFVBQVUsQ0FBQ0Usb0JBQW9CLEVBQUU7WUFDNURELEtBQUssR0FBR0Usa0JBQWtCLENBQUNDLGNBQWMsRUFBRTtVQUM1QztVQUNBLElBQUlILEtBQUssSUFBSUEsS0FBSyxDQUFDSSxhQUFhLEVBQUUsSUFBSUosS0FBSyxDQUFDSSxhQUFhLEVBQUUsQ0FBQ0MsU0FBUyxFQUFFO1lBQ3RFUCxhQUFhLENBQUNQLElBQUksQ0FBQ1MsS0FBSyxDQUFDO1VBQzFCO1FBQ0QsQ0FBQyxDQUFDO1FBQ0YsTUFBTU0sZ0JBQWdCLEdBQUdSLGFBQWEsQ0FBQ0EsYUFBYSxDQUFDUyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2hFLElBQUlELGdCQUFnQixJQUFJQSxnQkFBZ0IsQ0FBQ0YsYUFBYSxFQUFFLENBQUNDLFNBQVMsQ0FBQ0csV0FBVyxFQUFFLEVBQUU7VUFDakZiLE9BQU8sQ0FBQ1csZ0JBQWdCLENBQUM7UUFDMUIsQ0FBQyxNQUFNLElBQUlBLGdCQUFnQixFQUFFO1VBQzVCQSxnQkFBZ0IsQ0FBQ0YsYUFBYSxFQUFFLENBQUNDLFNBQVMsQ0FBQ0ksZUFBZSxDQUFDLFdBQVcsRUFBRSxZQUFZO1lBQ25GZCxPQUFPLENBQUNXLGdCQUFnQixDQUFDO1VBQzFCLENBQUMsQ0FBQztRQUNIO01BQ0QsQ0FBQyxDQUFDO0lBQ0g7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FUQztJQUFBLE9BVUE5QixvQkFBb0IsR0FBcEIsOEJBQXFCaUIsTUFBVyxFQUFFO01BQ2pDLElBQUksQ0FBQyxJQUFJLENBQUNpQixxQkFBcUIsRUFBRTtRQUNoQyxJQUFJLENBQUNBLHFCQUFxQixHQUFHLElBQUksQ0FBQ2xCLHlCQUF5QixDQUFDQyxNQUFNLENBQUMsQ0FDakVrQixJQUFJLENBQUVYLEtBQVUsSUFBSztVQUNyQjtVQUNBO1VBQ0E7VUFDQSxNQUFNWSxZQUFZLEdBQUcsSUFBSSxDQUFDQyxPQUFPLEVBQUUsQ0FBQ0MsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFRO1VBQzFELElBQUlGLFlBQVksSUFBSUEsWUFBWSxDQUFDRyxZQUFZLElBQUksQ0FBQ0gsWUFBWSxDQUFDRyxZQUFZLEVBQUUsRUFBRTtZQUM5RUgsWUFBWSxDQUFDSSxXQUFXLENBQUMsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1VBQ3BEOztVQUVBLE1BQU1DLGFBQWEsR0FBRyxJQUFJLENBQUM1QyxlQUFlLEVBQUU7VUFDNUMsSUFBSSxDQUFDNkMsaUNBQWlDLEVBQUU7VUFDeEMsSUFBSUQsYUFBYSxDQUFDRSwwQkFBMEIsRUFBRSxDQUFDQyxlQUFlLEVBQUUsQ0FBQ0MsTUFBTSxFQUFFO1lBQ3hFLElBQUksQ0FBQ0Msc0JBQXNCLENBQUN0QixLQUFLLENBQUM7VUFDbkM7VUFDQSxNQUFNdUIsV0FBVyxHQUFHTixhQUFhLENBQUNPLGNBQWMsRUFBRSxDQUFDQyxhQUFhLEVBQUU7VUFDbEVSLGFBQWEsQ0FBQ08sY0FBYyxFQUFFLENBQUNFLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1VBQ3RELElBQUkxQixLQUFLLENBQUNJLGFBQWEsRUFBRSxJQUFJSixLQUFLLENBQUNJLGFBQWEsRUFBRSxDQUFDdUIsV0FBVyxJQUFJM0IsS0FBSyxDQUFDNEIsU0FBUyxFQUFFLENBQUNELFdBQVcsRUFBRTtZQUNoRzNCLEtBQUssQ0FBQzRCLFNBQVMsRUFBRSxDQUFDRCxXQUFXLENBQUM7Y0FBRUUsVUFBVSxFQUFFTjtZQUFZLENBQUMsQ0FBQztVQUMzRDtVQUNBLElBQUksQ0FBQ0EsV0FBVyxFQUFFO1lBQ2pCO1lBQ0FOLGFBQWEsQ0FBQ08sY0FBYyxFQUFFLENBQUNNLDBCQUEwQixFQUFFO1VBQzVEO1VBQ0EsSUFBSSxJQUFJLENBQUNDLGdCQUFnQixFQUFFO1lBQzFCLElBQUksQ0FBQ0EsZ0JBQWdCLEVBQUU7VUFDeEI7UUFDRCxDQUFDLENBQUMsQ0FDREMsS0FBSyxDQUFDLFVBQVVDLE1BQVcsRUFBRTtVQUM3QkMsR0FBRyxDQUFDQyxLQUFLLENBQUMsOEVBQThFLEVBQUVGLE1BQU0sQ0FBQztRQUNsRyxDQUFDLENBQUMsQ0FDREcsT0FBTyxDQUFDLE1BQU07VUFDZCxJQUFJLENBQUMxQixxQkFBcUIsR0FBRyxJQUFJO1FBQ2xDLENBQUMsQ0FBQztNQUNKO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0EyQix1QkFBdUIsR0FBdkIsbUNBQTBCO01BQ3pCLElBQUksQ0FBQyxJQUFJLENBQUNDLG9CQUFvQixFQUFFO1FBQy9CLElBQUksQ0FBQ0Esb0JBQW9CLEdBQUcsQ0FBQyxDQUFDO01BQy9CO01BQ0EsT0FBTyxJQUFJLENBQUNBLG9CQUFvQjtJQUNqQzs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVRDO0lBQUEsT0FVQUMsaUJBQWlCLEdBQWpCLDJCQUFrQkMsS0FBVSxFQUFFQyxRQUFhLEVBQUVDLE9BQVksRUFBYTtNQUFBLElBQVhDLElBQUksdUVBQUcsRUFBRTtNQUNuRSxNQUFNQyxNQUFNLEdBQUdGLE9BQU8sQ0FBQ0csS0FBSyxDQUFDLEdBQUcsQ0FBQztNQUNqQyxJQUFJRCxNQUFNLENBQUNBLE1BQU0sQ0FBQ3JDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQ3VDLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNsREosT0FBTyxJQUFJLHNCQUFzQjtNQUNsQyxDQUFDLE1BQU07UUFDTkEsT0FBTyxJQUFJLHNCQUFzQjtNQUNsQztNQUNBLE9BQU87UUFDTkYsS0FBSyxFQUFFQSxLQUFLO1FBQ1pDLFFBQVEsRUFBRUEsUUFBUTtRQUNsQk0sTUFBTSxFQUFFTCxPQUFPO1FBQ2ZDLElBQUksRUFBRUE7TUFDUCxDQUFDO0lBQ0YsQ0FBQztJQUFBLE9BRURLLFlBQVksR0FBWixzQkFBYUMsV0FBbUIsRUFBRUMsVUFBa0IsRUFBRUMsZ0JBQXdCLEVBQVU7TUFDdkYsSUFBSUMsY0FBYyxHQUFHLEVBQUU7TUFDdkIsUUFBUUgsV0FBVztRQUNsQixLQUFLLE9BQU87VUFDWEcsY0FBYyxHQUFJLEdBQUVGLFVBQVcsRUFBQztVQUNoQztRQUNELEtBQUssa0JBQWtCO1VBQ3RCRSxjQUFjLEdBQUksR0FBRUYsVUFBVyxLQUFJQyxnQkFBaUIsR0FBRTtVQUN0RDtRQUNELEtBQUssa0JBQWtCO1VBQ3RCQyxjQUFjLEdBQUksR0FBRUQsZ0JBQWlCLEtBQUlELFVBQVcsR0FBRTtVQUN0RDtRQUNELEtBQUssYUFBYTtVQUNqQkUsY0FBYyxHQUFJLEdBQUVELGdCQUFpQixFQUFDO1VBQ3RDO1FBQ0Q7TUFBUTtNQUVULE9BQU9DLGNBQWM7SUFDdEI7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1NQyxnQkFBZ0IsR0FBdEIsZ0NBQXVCQyxLQUFhLEVBQUU7TUFDckMsTUFBTXJDLGFBQWEsR0FBRyxJQUFJLENBQUM1QyxlQUFlLEVBQUU7UUFDM0NVLE1BQU0sR0FBRyxJQUFJLENBQUM4QixPQUFPLEVBQUUsQ0FBQzFCLFFBQVEsRUFBRTtRQUNsQ29FLFVBQVUsR0FBR3RDLGFBQWEsQ0FBQ3VDLFlBQVksRUFBRTtRQUN6Q0MsU0FBUyxHQUFHRixVQUFVLENBQUNHLFdBQVcsQ0FBQ0osS0FBSyxDQUFDO1FBQ3pDSyxtQkFBbUIsR0FBRzVFLE1BQU0sQ0FBQzZFLG9CQUFvQixDQUFDTixLQUFLLENBQUM7UUFDeERPLGdCQUFnQixHQUFHQyxnQkFBZ0IsQ0FBQ0MsTUFBTSxDQUN6Q1IsVUFBVSxDQUFDUyxTQUFTLENBQUUsR0FBRVAsU0FBVSxxREFBb0QsQ0FBQyxFQUN2RjtVQUFFUSxPQUFPLEVBQUVWLFVBQVUsQ0FBQ0ssb0JBQW9CLENBQUMsR0FBRztRQUFFLENBQUMsQ0FDakQ7TUFDRixJQUFJLENBQUNDLGdCQUFnQixFQUFFO1FBQ3RCLE9BQU9uRSxPQUFPLENBQUNDLE9BQU8sQ0FBQyxFQUFFLENBQUM7TUFDM0I7TUFDQSxNQUFNdUUsZUFBZSxHQUFHSixnQkFBZ0IsQ0FBQ0MsTUFBTSxDQUM3Q1IsVUFBVSxDQUFDUyxTQUFTLENBQ2xCLEdBQUVQLFNBQVUsK0ZBQThGLENBQzNHLEVBQ0Q7VUFBRVEsT0FBTyxFQUFFVixVQUFVLENBQUNLLG9CQUFvQixDQUFDLEdBQUc7UUFBRSxDQUFDLENBQ2pEO1FBQ0RPLGdCQUFnQixHQUFHWixVQUFVLENBQUNTLFNBQVMsQ0FBRSxHQUFFUCxTQUFVLDREQUEyRCxDQUFDO1FBQ2pIVyxTQUEwQixHQUFHLEVBQUU7UUFDL0JDLGdCQUFnQixHQUFHQyxhQUFhLENBQUNDLGFBQWEsQ0FBQ1YsZ0JBQWdCLENBQUM7UUFDaEVXLHNCQUFzQixHQUFHLElBQUk5RSxPQUFPLENBQUMsVUFBVUMsT0FBNkIsRUFBRTtVQUM3RSxNQUFNc0QsV0FBVyxHQUFHd0IsV0FBVyxDQUFDQyxrQkFBa0IsQ0FBQ1AsZ0JBQWdCLENBQUM7VUFDcEV4RSxPQUFPLENBQUNzRCxXQUFXLENBQUM7UUFDckIsQ0FBQyxDQUFDO01BQ0htQixTQUFTLENBQUM3RSxJQUFJLENBQUNpRixzQkFBc0IsQ0FBQztNQUN0QyxNQUFNRyxVQUFVLEdBQUdOLGdCQUFnQixDQUFDTyxLQUFLLEdBQUdQLGdCQUFnQixDQUFDTyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUNDLElBQUksR0FBR1IsZ0JBQWdCLENBQUNRLElBQUk7UUFDakdDLGdCQUFnQixHQUFHVCxnQkFBZ0IsQ0FBQ1UsU0FBUztRQUM3Q0MsYUFBYSxHQUFHakcsTUFBTSxDQUFDa0csWUFBWSxDQUFDTixVQUFVLEVBQUVoQixtQkFBbUIsRUFBRTtVQUFFLFdBQVcsRUFBRTtRQUFlLENBQUMsQ0FBQztNQUN0R3FCLGFBQWEsQ0FBQ0UsVUFBVSxFQUFFO01BQzFCLE1BQU1DLHFCQUFxQixHQUFHLElBQUl6RixPQUFPLENBQUMsVUFBVUMsT0FBNkIsRUFBRTtRQUNsRixNQUFNeUYsUUFBUSxHQUFHLFVBQVUzRixNQUFXLEVBQUU7VUFDdkMsTUFBTTRGLFlBQVksR0FBR1AsZ0JBQWdCLEdBQUdBLGdCQUFnQixDQUFDckYsTUFBTSxDQUFDNkYsU0FBUyxFQUFFLENBQUNDLFFBQVEsRUFBRSxDQUFDLEdBQUc5RixNQUFNLENBQUM2RixTQUFTLEVBQUUsQ0FBQ0MsUUFBUSxFQUFFO1VBRXZIUCxhQUFhLENBQUNRLFlBQVksQ0FBQ0osUUFBUSxDQUFDO1VBQ3BDekYsT0FBTyxDQUFDMEYsWUFBWSxDQUFDO1FBQ3RCLENBQUM7UUFDREwsYUFBYSxDQUFDUyxZQUFZLENBQUNMLFFBQVEsQ0FBQztNQUNyQyxDQUFDLENBQUM7TUFDRmhCLFNBQVMsQ0FBQzdFLElBQUksQ0FBQzRGLHFCQUFxQixDQUFDO01BRXJDLElBQUlqQixlQUFlLEVBQUU7UUFDcEIsTUFBTXdCLGVBQWUsR0FBR3BCLGFBQWEsQ0FBQ0MsYUFBYSxDQUFDTCxlQUFlLENBQUM7UUFDcEUsSUFBSXlCLFNBQVMsR0FBR0QsZUFBZSxDQUFDZCxLQUFLLEdBQUdjLGVBQWUsQ0FBQ2QsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDQyxJQUFJLEdBQUdhLGVBQWUsQ0FBQ2IsSUFBSTtRQUM1RmMsU0FBUyxHQUFHaEIsVUFBVSxDQUFDaUIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFJLEdBQUVqQixVQUFVLENBQUNrQixLQUFLLENBQUMsQ0FBQyxFQUFFbEIsVUFBVSxDQUFDaUIsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFFLElBQUdELFNBQVUsRUFBQyxHQUFHQSxTQUFTO1FBRTdILE1BQU1HLGVBQWUsR0FBR0osZUFBZSxDQUFDWCxTQUFTO1VBQ2hEZ0IsWUFBWSxHQUFHaEgsTUFBTSxDQUFDa0csWUFBWSxDQUFDVSxTQUFTLEVBQUVoQyxtQkFBbUIsRUFBRTtZQUFFLFdBQVcsRUFBRTtVQUFlLENBQUMsQ0FBQztRQUNwR29DLFlBQVksQ0FBQ2IsVUFBVSxFQUFFO1FBQ3pCLE1BQU1jLG9CQUFvQixHQUFHLElBQUl0RyxPQUFPLENBQUMsVUFBVUMsT0FBbUMsRUFBRTtVQUN2RixNQUFNeUYsUUFBUSxHQUFHLFVBQVUzRixNQUFXLEVBQUU7WUFDdkMsTUFBTXdHLFdBQVcsR0FBR0gsZUFBZSxHQUFHQSxlQUFlLENBQUNyRyxNQUFNLENBQUM2RixTQUFTLEVBQUUsQ0FBQ0MsUUFBUSxFQUFFLENBQUMsR0FBRzlGLE1BQU0sQ0FBQzZGLFNBQVMsRUFBRSxDQUFDQyxRQUFRLEVBQUU7WUFFcEhRLFlBQVksQ0FBQ1AsWUFBWSxDQUFDSixRQUFRLENBQUM7WUFDbkN6RixPQUFPLENBQUNzRyxXQUFXLENBQUM7VUFDckIsQ0FBQztVQUVERixZQUFZLENBQUNOLFlBQVksQ0FBQ0wsUUFBUSxDQUFDO1FBQ3BDLENBQUMsQ0FBQztRQUNGaEIsU0FBUyxDQUFDN0UsSUFBSSxDQUFDeUcsb0JBQW9CLENBQUM7TUFDckM7TUFDQSxJQUFJO1FBQ0gsTUFBTUUsU0FBZ0IsR0FBRyxNQUFNeEcsT0FBTyxDQUFDeUcsR0FBRyxDQUFDL0IsU0FBUyxDQUFDO1FBQ3JELElBQUloQixjQUFjLEdBQUcsRUFBRTtRQUN2QixJQUFJLE9BQU84QyxTQUFTLEtBQUssUUFBUSxFQUFFO1VBQ2xDOUMsY0FBYyxHQUFHLElBQUksQ0FBQ0osWUFBWSxDQUFDa0QsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFQSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUVBLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3RTtRQUNBLE9BQU85QyxjQUFjO01BQ3RCLENBQUMsQ0FBQyxPQUFPakIsS0FBVSxFQUFFO1FBQ3BCRCxHQUFHLENBQUNDLEtBQUssQ0FBQyx1REFBdUQsR0FBR0EsS0FBSyxDQUFDO01BQzNFO01BQ0EsT0FBTyxFQUFFO0lBQ1Y7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQSxPQUpDO0lBQUEsT0FLQWlFLG1CQUFtQixHQUFuQiwrQkFBOEI7TUFDN0I7TUFDQSxNQUFNQyxXQUFXLEdBQUdDLFdBQVcsQ0FBQ0MsV0FBVyxFQUF3RTtNQUNuSCxPQUFPLHdCQUF3QixJQUFJRixXQUFXLEdBQUdHLEdBQUcsQ0FBQ0MsTUFBTSxDQUFDSixXQUFXLENBQUNLLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSTtJQUMzRyxDQUFDO0lBQUEsT0FFREMsUUFBUSxHQUFSLG9CQUFXO01BQ1YsT0FBT0wsV0FBVyxDQUFDQyxXQUFXLEVBQUUsQ0FBQ0ssT0FBTyxFQUFFO0lBQzNDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVJDO0lBQUEsT0FVQUMsb0JBQW9CLEdBQXBCLDhCQUFxQnZELEtBQVUsRUFBRTtNQUNoQyxNQUFNaEIsb0JBQW9CLEdBQUcsSUFBSSxDQUFDRCx1QkFBdUIsRUFBRTtNQUUzRCxJQUFJQyxvQkFBb0IsQ0FBQ2dCLEtBQUssQ0FBQyxFQUFFO1FBQ2hDO1FBQ0EsT0FBTzVELE9BQU8sQ0FBQ0MsT0FBTyxDQUFDMkMsb0JBQW9CLENBQUNnQixLQUFLLENBQUMsQ0FBQztNQUNwRDtNQUVBLE1BQU1DLFVBQVUsR0FBRyxJQUFJLENBQUNsRixlQUFlLEVBQUUsQ0FBQ21GLFlBQVksRUFBRTtNQUN4RCxNQUFNc0QsV0FBVyxHQUFHdkQsVUFBVSxDQUFDRyxXQUFXLENBQUNKLEtBQUssQ0FBQztNQUNqRCxNQUFNeUQsU0FBUyxHQUFHeEQsVUFBVSxDQUFDUyxTQUFTLENBQUUsR0FBRThDLFdBQVksa0RBQWlELENBQUM7TUFDeEcsTUFBTUUsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDWixtQkFBbUIsRUFBRTtNQUNuRCxNQUFNMUQsT0FBTyxHQUFHc0UsZ0JBQWdCLEdBQUcxRCxLQUFLLENBQUN1QyxLQUFLLENBQUMsQ0FBQyxDQUFDO01BQ2pELE9BQU8sSUFBSSxDQUFDeEMsZ0JBQWdCLENBQUNDLEtBQUssQ0FBQyxDQUFDM0MsSUFBSSxDQUFFc0csTUFBVyxJQUFLO1FBQ3pELE1BQU1DLFVBQVUsR0FBRyxJQUFJLENBQUMzRSxpQkFBaUIsQ0FBQ3dFLFNBQVMsRUFBRUUsTUFBTSxFQUFFdkUsT0FBTyxDQUFDO1FBQ3JFSixvQkFBb0IsQ0FBQ2dCLEtBQUssQ0FBQyxHQUFHNEQsVUFBVTtRQUN4QyxPQUFPQSxVQUFVO01BQ2xCLENBQUMsQ0FBQztJQUNIOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BWkM7SUFBQSxPQWFBQyxrQ0FBa0MsR0FBbEMsNENBQW1DQyxVQUFlLEVBQUU7TUFDbkQsTUFBTUMsZUFBZSxHQUFHLEVBQUU7TUFDMUIsS0FBSyxNQUFNQyxLQUFLLElBQUlGLFVBQVUsRUFBRTtRQUMvQixNQUFNRyxVQUFVLEdBQUdILFVBQVUsQ0FBQ0UsS0FBSyxDQUFDO1FBQ3BDLE1BQU1FLGVBQW9CLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLEtBQUssTUFBTUMsR0FBRyxJQUFJRixVQUFVLEVBQUU7VUFDN0JDLGVBQWUsQ0FBQ0MsR0FBRyxDQUFDLEdBQUcsT0FBT0YsVUFBVSxDQUFDRSxHQUFHLENBQUMsS0FBSyxRQUFRLEdBQUdDLE1BQU0sQ0FBQ0gsVUFBVSxDQUFDRSxHQUFHLENBQUMsQ0FBQyxHQUFHRixVQUFVLENBQUNFLEdBQUcsQ0FBQztRQUN2RztRQUNBSixlQUFlLENBQUM5SCxJQUFJLENBQUNpSSxlQUFlLENBQUM7TUFDdEM7TUFDQSxPQUFPSCxlQUFlO0lBQ3ZCLENBQUM7SUFBQSxPQUVETSxzQkFBc0IsR0FBdEIsZ0NBQXVCQyxLQUFVLEVBQUU7TUFBQTtNQUNsQyxNQUFNM0csYUFBYSxHQUFHLElBQUksQ0FBQzVDLGVBQWUsRUFBRTtNQUM1QyxJQUFJd0osV0FBVyxHQUFHLEVBQUU7TUFFcEIsTUFBTUMsT0FBTyxHQUFHLDBCQUFBN0csYUFBYSxDQUFDOEcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUNDLE9BQU8sMERBQWpELHNCQUFtREMsTUFBTSxLQUFJLEVBQUU7TUFDL0UsS0FBSyxNQUFNQyxLQUFLLElBQUlKLE9BQU8sRUFBRTtRQUM1QixNQUFNSyxNQUFNLEdBQUdsSCxhQUFhLENBQUM3QixTQUFTLEVBQUUsQ0FBQ2dKLFFBQVEsQ0FBQ0YsS0FBSyxDQUFDRyxJQUFJLENBQUM7UUFDN0QsSUFBSUYsTUFBTSxhQUFOQSxNQUFNLGVBQU5BLE1BQU0sQ0FBRUcsS0FBSyxDQUFDVixLQUFLLENBQUMsRUFBRTtVQUN6QixNQUFNVyxPQUFPLEdBQUdDLEtBQUssQ0FBQ0MsT0FBTyxDQUFDUCxLQUFLLENBQUNRLE1BQU0sQ0FBQyxHQUFHUixLQUFLLENBQUNRLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBR1IsS0FBSyxDQUFDUSxNQUFNO1VBQzVFYixXQUFXLEdBQUk1RyxhQUFhLENBQUM3QixTQUFTLEVBQUUsQ0FBQ3VKLFNBQVMsQ0FBQ0osT0FBTyxDQUFDLENBQVNLLFNBQVMsQ0FBQ1AsSUFBSTtVQUNsRjtRQUNEO01BQ0Q7TUFFQSxPQUFPUixXQUFXO0lBQ25COztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9Bdkcsc0JBQXNCLEdBQXRCLGdDQUF1QnRCLEtBQVUsRUFBRTtNQUNsQyxNQUFNaUIsYUFBYSxHQUFHLElBQUksQ0FBQzVDLGVBQWUsRUFBRTtRQUMzQ3dLLFFBQVEsR0FBRzdJLEtBQUssQ0FBQzhJLGlCQUFpQixFQUFFO1FBQ3BDQyxZQUFZLEdBQUcvSSxLQUFLLENBQUM0QixTQUFTLEVBQUU7UUFDaENvSCx5QkFBeUIsR0FBRyxFQUFFO1FBQzlCaEMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDWixtQkFBbUIsRUFBRTtRQUM3QzZDLG1CQUFtQixHQUFHaEksYUFBYSxDQUFDOEcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDO1FBQy9EbUIsU0FBUyxHQUFHRCxtQkFBbUIsQ0FBQ3pHLEtBQUssSUFBSSxFQUFFO1FBQzNDMkcsWUFBWSxHQUFHRixtQkFBbUIsQ0FBQ0csUUFBUSxJQUFJLEVBQUU7UUFDakRDLE9BQU8sR0FBR0osbUJBQW1CLENBQUN0RyxJQUFJLElBQUksRUFBRTtNQUN6QyxJQUFJMkcscUJBQTBCLEVBQUVDLFFBQVE7TUFFeEMsSUFBSVIsWUFBWSxJQUFJQSxZQUFZLENBQUNTLHdCQUF3QixFQUFFO1FBQzFELElBQUlYLFFBQVEsRUFBRTtVQUNiO1VBQ0EsSUFBSSxJQUFJLENBQUNsQixzQkFBc0IsQ0FBQyxFQUFFLENBQUMsS0FBSyw2QkFBNkIsRUFBRTtZQUN0RXFCLHlCQUF5QixDQUFDekosSUFBSSxDQUM3QkcsT0FBTyxDQUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDNEMsaUJBQWlCLENBQUMyRyxTQUFTLEVBQUVDLFlBQVksRUFBRW5DLGdCQUFnQixFQUFFcUMsT0FBTyxDQUFDLENBQUMsQ0FDM0Y7VUFDRjs7VUFFQTtVQUNBRSxRQUFRLEdBQUdWLFFBQVEsQ0FBQ1ksT0FBTyxFQUFFO1VBQzdCLE1BQU1DLFVBQVUsR0FBR0gsUUFBUSxDQUFDMUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztVQUN0QyxJQUFJUyxLQUFLLEdBQUcsRUFBRTtVQUVkb0csVUFBVSxDQUFDQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO1VBQ3BCRCxVQUFVLENBQUNFLEdBQUcsRUFBRSxDQUFDLENBQUM7O1VBRWxCRixVQUFVLENBQUM1SyxPQUFPLENBQUUrSyxTQUFjLElBQUs7WUFDdEN2RyxLQUFLLElBQUssSUFBR3VHLFNBQVUsRUFBQztZQUN4QixNQUFNdEcsVUFBVSxHQUFHdEMsYUFBYSxDQUFDdUMsWUFBWSxFQUFFO2NBQzlDc0csY0FBYyxHQUFHdkcsVUFBVSxDQUFDRyxXQUFXLENBQUNKLEtBQUssQ0FBQztjQUM5Q3lHLGdCQUFnQixHQUFHeEcsVUFBVSxDQUFDUyxTQUFTLENBQUUsR0FBRThGLGNBQWUsZ0RBQStDLENBQUM7WUFDM0csSUFBSSxDQUFDQyxnQkFBZ0IsRUFBRTtjQUN0QmYseUJBQXlCLENBQUN6SixJQUFJLENBQUMsSUFBSSxDQUFDc0gsb0JBQW9CLENBQUN2RCxLQUFLLENBQUMsQ0FBQztZQUNqRTtVQUNELENBQUMsQ0FBQztRQUNIOztRQUVBO1FBQ0FnRyxxQkFBcUIsR0FBR1AsWUFBWSxDQUFDUyx3QkFBd0IsRUFBRTtRQUMvREYscUJBQXFCLEdBQUcsSUFBSSxDQUFDL0csaUJBQWlCLENBQzdDK0cscUJBQXFCLENBQUM5RyxLQUFLLEVBQzNCOEcscUJBQXFCLENBQUM3RyxRQUFRLEVBQzlCdUUsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDTCxRQUFRLEVBQUUsQ0FDbEM7UUFFRCxJQUFJa0MsUUFBUSxFQUFFO1VBQ2IsSUFBSSxDQUFDeEcsdUJBQXVCLEVBQUUsQ0FBQ2tILFFBQVEsQ0FBQyxHQUFHRCxxQkFBcUI7UUFDakUsQ0FBQyxNQUFNO1VBQ04sSUFBSSxDQUFDakgsdUJBQXVCLEVBQUUsQ0FBQzJFLGdCQUFnQixDQUFDLEdBQUdzQyxxQkFBcUI7UUFDekU7TUFDRCxDQUFDLE1BQU07UUFDTk4seUJBQXlCLENBQUN6SixJQUFJLENBQUNHLE9BQU8sQ0FBQ3NLLE1BQU0sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO01BQzFGO01BQ0EsT0FBT3RLLE9BQU8sQ0FBQ3lHLEdBQUcsQ0FBQzZDLHlCQUF5QixDQUFDLENBQzNDckksSUFBSSxDQUFFc0osbUJBQTBCLElBQUs7UUFDckM7UUFDQSxNQUFNQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMvQyxrQ0FBa0MsQ0FBQzhDLG1CQUFtQixDQUFDO1VBQzVGaEQsTUFBTSxHQUFHcUMscUJBQXFCLENBQUM5RyxLQUFLO1FBQ3JDMEgsd0JBQXdCLENBQUNDLE9BQU8sRUFBRTtRQUNsQ2xKLGFBQWEsQ0FBQ21KLGdCQUFnQixFQUFFLENBQUNDLFlBQVksQ0FBQ0gsd0JBQXdCLENBQUM7UUFFdkUsSUFBSSxDQUFDSSxrQkFBa0IsQ0FBQ3JKLGFBQWEsRUFBRWdHLE1BQU0sRUFBRWlDLFNBQVMsQ0FBQztNQUMxRCxDQUFDLENBQUMsQ0FDRGxILEtBQUssQ0FBQyxVQUFVdUksYUFBa0IsRUFBRTtRQUNwQ3JJLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDb0ksYUFBYSxDQUFDO01BQ3pCLENBQUMsQ0FBQyxDQUNEbkksT0FBTyxDQUFDLE1BQU07UUFDZCxJQUFJLENBQUN2RSx5QkFBeUIsR0FBRyxLQUFLO01BQ3ZDLENBQUMsQ0FBQyxDQUNEbUUsS0FBSyxDQUFDLFVBQVV1SSxhQUFrQixFQUFFO1FBQ3BDckksR0FBRyxDQUFDQyxLQUFLLENBQUNvSSxhQUFhLENBQUM7TUFDekIsQ0FBQyxDQUFDO0lBQ0o7O0lBRUE7SUFBQTtJQUFBLE9BQ0FDLGVBQWUsR0FBZix5QkFBZ0JDLGFBQXFCLEVBQUU3QyxLQUFhLEVBQUU4QyxlQUFtQyxFQUE2QjtNQUFBLElBQTNCQyxpQkFBaUIsdUVBQUcsS0FBSztNQUNuSCxPQUFPLElBQUk7SUFDWjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUtBQyxvQkFBb0IsR0FBcEIsOEJBQXFCL0IsUUFBYSxFQUFFO01BQ25DLElBQUlBLFFBQVEsRUFBRTtRQUNiLE1BQU1nQyxZQUFZLEdBQUcsSUFBSSxDQUFDaEssT0FBTyxFQUFFLENBQUMxQixRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMyTCxXQUFXLENBQUMsY0FBYyxDQUFDO1VBQ25GQyxnQkFBZ0IsR0FBR2xDLFFBQVEsQ0FBQ1ksT0FBTyxFQUFFO1FBRXRDLElBQUksQ0FBQ29CLFlBQVksSUFBSUEsWUFBWSxDQUFDL0gsT0FBTyxDQUFDaUksZ0JBQWdCLENBQUMsS0FBSyxDQUFDLEVBQUU7VUFDbEU7VUFDQTtVQUNDLElBQUksQ0FBQ2xLLE9BQU8sRUFBRSxDQUFDMUIsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFlNkIsV0FBVyxDQUFDLGNBQWMsRUFBRStKLGdCQUFnQixFQUFFbk0sU0FBUyxFQUFFLElBQUksQ0FBQztRQUNsSDtNQUNEO0lBQ0Q7O0lBRUE7SUFBQTtJQUFBLE9BQ0FvTSxnQkFBZ0IsR0FBaEIsMEJBQWlCVCxhQUFrQixFQUFFVSxXQUFnQixFQUFvQjtNQUN4RTtNQUNBLE9BQU92TCxPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDN0I7O0lBRUE7SUFBQTtJQUFBLE9BQ0F1TCxvQkFBb0IsR0FBcEIsOEJBQXFCbEwsS0FBVSxFQUFFbUwsUUFBYSxFQUFFO01BQy9DO0lBQUE7O0lBR0Q7SUFBQTtJQUFBLE9BQ0FDLGlCQUFpQixHQUFqQiw2QkFBK0I7TUFDOUIsT0FBTyxFQUFFO01BQ1Q7SUFDRCxDQUFDO0lBQUEsT0FFRGxLLGlDQUFpQyxHQUFqQyw2Q0FBMEM7TUFDekM7SUFBQSxDQUNBO0lBQUEsT0FFRG1LLFlBQVksR0FBWix3QkFBc0M7TUFDckMsT0FBTyxLQUFLO0lBQ2I7O0lBRUE7SUFBQTtJQUFBLE9BQ0FmLGtCQUFrQixHQUFsQiw0QkFBbUJySixhQUEyQixFQUFFZ0csTUFBYyxFQUFFaUMsU0FBaUIsRUFBUTtNQUN4RjtNQUNBakksYUFBYSxDQUFDbUosZ0JBQWdCLEVBQUUsQ0FBQ2tCLFFBQVEsQ0FBQ3JFLE1BQU0sQ0FBQztJQUNsRCxDQUFDO0lBQUEsT0FFRHNFLHNCQUFzQixHQUF0QixrQ0FBOEQ7TUFBQTtNQUM3RCxNQUFNdEssYUFBYSxHQUFHLElBQUksQ0FBQzVDLGVBQWUsRUFBRTtNQUM1QyxNQUFNbU4sWUFBWSxHQUFHLDJCQUFBdkssYUFBYSxDQUFDOEcsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUNDLE9BQU8scUZBQWpELHVCQUFtRHlELE1BQU0sMkRBQXpELHVCQUEyREMsU0FBUyxLQUFJLFlBQVk7TUFDekcsT0FBTyxJQUFJLENBQUM3SyxPQUFPLEVBQUUsQ0FBQzhLLElBQUksQ0FBQ0gsWUFBWSxDQUFDO0lBQ3pDLENBQUM7SUFBQTtFQUFBLEVBNWdCbUNJLGNBQWM7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9Ba2hCcENwTyxzQkFBc0I7QUFBQSJ9
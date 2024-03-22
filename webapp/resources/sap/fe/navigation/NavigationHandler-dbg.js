/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/assert", "sap/base/Log", "sap/base/util/extend", "sap/base/util/isEmptyObject", "sap/base/util/merge", "sap/ui/base/Object", "sap/ui/core/routing/HashChanger", "sap/ui/core/UIComponent", "sap/ui/thirdparty/URI", "sap/ui/util/openWindow", "./library", "./NavError", "./SelectionVariant"], function (assert, Log, extend, isEmptyObject, merge, BaseObject, HashChanger, UIComponent, URI, openWindow, NavLibrary, NavError, SelectionVariant) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  // shortcuts for sap.ui.generic.app enums
  const NavType = NavLibrary.NavType;
  const ParamHandlingMode = NavLibrary.ParamHandlingMode;
  const SuppressionBehavior = NavLibrary.SuppressionBehavior;
  const Mode = NavLibrary.Mode;
  const IAPP_STATE = "sap-iapp-state";
  const DEFAULTED_PARAMETER_PROPERTY = "sap-ushell-defaultedParameterNames";
  const HYBRID_IAPP_STATE_KEY = "nhHybridIAppStateKey";

  /**
   * This is the successor of {@link sap.ui.generic.app.navigation.service.NavigationHandler}.<br> Creates a new NavigationHandler class by providing the required environment. <br>
   * The <code>NavigationHandler</code> supports the verification of sensitive information. All properties that are part of
   * <code>selectionVariant</code> and <code>valueTexts</code> will be verified if they are annotated as
   * <code>com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive</code> or
   * <code>com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext</code> and will be removed before the data is persisted as the app
   * state.<br>
   * Also, all properties annotated as <code>com.sap.vocabularies.Analytics.v1.Measure</code> will be removed from the data stored as the
   * xapp state.<br>
   * To verify the information to be removed, the <code>NavigationHandler</code> requires an unnamed model of type
   * {@link sap.ui.model.odata.v2.ODataModel} on component level. It is possible to set such a model using the <code>setModel</code>
   * method.<br>
   * <b>Note:</b> The check for excluded data requires that the OData metadata has already been loaded completely.<br>
   * If the OData metadata model has not been loaded completely, all properties are removed from the application context.<br>
   * <b>Note:</b> This class requires that the UShell {@link sap.ushell.services.CrossApplicationNavigation} is available and initialized.
   *
   * @public
   * @class
   * @extends sap.ui.base.Object
   * @since 1.83.0
   * @name sap.fe.navigation.NavigationHandler
   */
  let NavigationHandler = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(NavigationHandler, _BaseObject);
    // list of technical parameters

    /*
     * There exists a generation of "old" sap-iapp-states which are based on the following URL schema:
     * #SemObj-action&/route/sap-iapp-state=ABC12345678 The new URL schema is: #SemObj-action&/route?sap-iapp-state=ABC12345678 (mind the
     * difference between / and ? above), i.e. the sap-iapp-state has become a parameter of the query parameter section in the AppHash string.
     * Yet, this tool shall be able to deal even with old sap-iapp-states. Therefore, we use two Regular Expressions (rIAppStateOld and
     * rIAppStateOldAtStart) as defined below to scan for these old variants. The new variant is being scanned using rIAppStateNew as Regular
     * Expression search string. Compatibility is centrally ensured by the two methods _getInnerAppStateKey and _replaceInnerAppStateKey (see
     * below). Never use these RegExp in a method on your own, as it typically indicates that you will fall into the compatibility trap!
     */
    // Warning! Do not use GLOBAL flags here; RegExp in GLOBAL mode store the lastIndex value
    // Therefore, repeated calls to the RegExp will then only start beginning with that stored
    // lastIndex. Thus, multiple calls therefore could yield strange results.
    // Moreover, there shall only be exactly one IAPP_STATE per RegExp in an AppHash.
    // Therefore, GLOBAL search should be superfluous.

    /*
     * Regular Expression in words: Search for something that either starts with ? or &, followed by the term "sap-iapp-state". That one is
     * followed by an equal sign (=). The stuff that is after the equal sign forms the first regexp group. This group consists of at least one
     * (or arbitrary many) characters, as long as it is not an ampersand sign (&). Characters after such an ampersand would be ignored and do
     * not belong to the group. Alternatively, the string also may end.
     */

    /**
     * Temporarily added again because an application was (illegially) relying on it. Should be removed again, once the app is corrected
     */

    /**
     * Constructor requiring a controller/component owning the navigation handler.
     *
     * @param {object} oController UI5 controller that contains a router and a component; typically the main controller of your application, for
     *        example, a subclass of the sap.ca.scfld.md.controller.BaseFullscreenController if scaffolding is used
     * @param {string} [sMode=sap.fe.navigation.Mode.ODataV4] Mode to be used to indicates the Odata version used for runnning the Navigation Handler,
     *        see {@link sap.fe.navigation.Mode}.<br>
     * 		  Note: Mode has to be sap.fe.navigation.Mode.ODataV2 whenever this constructor is used to initialize a OData V2 based service.
     * @param {string} [sParamHandlingMode=SelVarWins] Mode to be used to handle conflicts when merging URL parameters and the SelectionVariant class,
     *        see {@link sap.fe.navigation.ParamHandlingMode}
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of input errors. Valid error codes are: <table>
     *         <tr>
     *         <th align="left">NavError code</th>
     *         <th align="left">Description</th>
     *         </tr>
     *         <tr>
     *         <td>NavigationHandler.INVALID_INPUT</td>
     *         <td>Indicates that the input parameter is invalid</td>
     *         </tr>
     *         </table>
     */
    function NavigationHandler(oController, sMode, sParamHandlingMode) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this._aTechnicalParamaters = ["hcpApplicationId"];
      _this._oLastSavedInnerAppData = {
        sAppStateKey: "",
        oAppData: {},
        iCacheHit: 0,
        iCacheMiss: 0
      };
      _this._rIAppStateOld = new RegExp("/" + IAPP_STATE + "=([^/?]+)");
      _this._rIAppStateOldAtStart = new RegExp("^" + IAPP_STATE + "=([^/?]+)");
      _this._rIAppStateNew = new RegExp("[?&]" + IAPP_STATE + "=([^&]+)");
      _this.IAPP_STATE = IAPP_STATE;
      if (!oController) {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      if (oController instanceof UIComponent) {
        _this.oRouter = oController.getRouter();
        _this.oComponent = oController;
      } else {
        if (typeof oController.getOwnerComponent !== "function") {
          throw new NavError("NavigationHandler.INVALID_INPUT");
        }
        _this.oRouter = _this._getRouter(oController);
        _this.oComponent = oController.getOwnerComponent();
      }

      // special handling for SmartTemplates
      if (_this.oComponent && _this.oComponent.getAppComponent) {
        _this.oComponent = _this.oComponent.getAppComponent();
      }
      if (typeof _this.oRouter === "undefined" || typeof _this.oComponent === "undefined" || typeof _this.oComponent.getComponentData !== "function") {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      if (sParamHandlingMode === ParamHandlingMode.URLParamWins || sParamHandlingMode === ParamHandlingMode.InsertInSelOpt) {
        _this.sParamHandlingMode = sParamHandlingMode;
      } else {
        _this.sParamHandlingMode = ParamHandlingMode.SelVarWins; // default
      }

      if (sMode === Mode.ODataV2) {
        _this._sMode = sMode;
      }
      return _this;
    }

    /**
     * Retrieves the shell navigation service.
     *
     * @returns The Navigation service
     * @private
     */
    _exports.NavigationHandler = NavigationHandler;
    var _proto = NavigationHandler.prototype;
    _proto._getAppNavigationService = function _getAppNavigationService() {
      return sap.ushell.Container.getService("CrossApplicationNavigation");
    }

    /**
     * Retrieves the shell navigation service.
     *
     * @returns The Navigation service
     * @private
     */;
    _proto._getAppNavigationServiceAsync = function _getAppNavigationServiceAsync() {
      return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
        return oCrossAppNavService;
      }).catch(function () {
        Log.error("NavigationHandler: CrossApplicationNavigation is not available.");
        throw new NavError("NavigationHandler.NO.XAPPSERVICE");
      });
    }

    /**
     * Retrieves the reference to the router object for navigation for this given Controller.
     *
     * @param oController The reference to the Controller for which the Router instance shall be determined.
     * @returns The Router for the given Controller
     * @private
     */;
    _proto._getRouter = function _getRouter(oController) {
      return UIComponent.getRouterFor(oController);
    }

    /**
     * This method is to be used only by FE V2 to get access to toExternal promise.
     *
     * @param fnCallback Callback to be called by 'navigate' method in case of toExternal is used to navigate.
     * @private
     */;
    _proto.registerNavigateCallback = function registerNavigateCallback(fnCallback) {
      this._navigateCallback = fnCallback;
    }

    /**
     * Triggers a cross-app navigation after saving the inner and the cross-app states. The navigation mode based on
     * <code>sap-ushell-next-navmode</code> is taken into account. If set to <code>explace</code> the inner app state will not be changed.
     * <b>Note:</b> The <code>sNavMode</code> argument can be used to overwrite the SAP Fiori launchpad default navigation for opening a URL
     * in-place or ex-place.
     * <br>
     * <b>Node:</b> If the <code>oExternalAppData</code> parameter is not supplied, the external app data will be calculated based on
     * the <code>oInnerAppData</code> data.<br>
     * SmartFilterBar control <b>Parameters:</b> <table>
     * <tr>
     * <td align="center">{object}</td>
     * <td><b>oError</b></td>
     * <td>NavError object (instance of {@link sap.fe.navigation.NavError}) that describes which kind of error occurred</td>
     * <tr>
     * <td align="center">{string}</td>
     * <td><b>oError.errorCode</b></td>
     * <td>Code to identify the error</td>
     * <tr>
     * <td align="center">{string}</td>
     * <td><b>oError.type</b></td>
     * <td>Severity of the error (info/warning/error)</td>
     * <tr>
     * <td align="center">{array}</td>
     * <td><b>oError.params</b></td>
     * <td>An array of objects (typically strings) that describe additional value parameters required for generating the message</td>
     * </table>.
     *
     * @public
     * @function navigate
     * @memberof sap.fe.navigation.NavigationHandler.prototype
     * @param sSemanticObject Name of the semantic object of the target app
     * @param sActionName Name of the action of the target app
     * @param vNavigationParameters Navigation parameters as an object with key/value pairs or as a string representation of such an object. If passed as an object, the properties are not checked against the <code>IsPotentialSensitive</code> or <code>Measure</code> type.
     * @param oInnerAppData Object for storing current state of the app
     * @param fnOnError Callback that is called if an error occurs during navigation <br>
     * @param oExternalAppData Object for storing the state which will be forwarded to the target component.
     * @param oExternalAppData.presentationVariant Object containing the current ui state of the app which will be forwarded to the
     *        target component.
     * @param oExternalAppData.valueTexts Object containing value descriptions which will be forwarded to the target component.
     * @param oExternalAppData.selectionVariant Stringified JSON object, which will be forwarded to the target component. If not
     *        provided the selectionVariant will be constructed based on the vNavigationParameters.
     * @param sNavMode Argument is used to overwrite the FLP-configured target for opening a URL. If used, only the
     *        <code>explace</code> or <code>inplace</code> values are allowed. Any other value will lead to an exception
     *        <code>NavigationHandler.INVALID_NAV_MODE</code>.
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var sSemanticObject = "SalesOrder";
     * 	var sActionName = "create";
     *
     * 	//simple parameters as Object
     * 	var vNavigationParameters = {
     * 		CompanyCode : "0001",
     * 		Customer : "C0001"
     * 	};
     *
     * 	//or as selection variant
     * 	var oSelectionVariant = new SelectionVariant();
     *	 oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 	oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 	vNavigationParameters = oSelectionVariant.toJSONString();
     *
     * 	//or directly from SmartFilterBar
     * 	vNavigationParameters = oSmartFilterBar.getDataSuiteFormat();
     *
     * 	//app state for back navigation
     *	 var oInnerAppData = {
     * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 		tableVariantId : oSmartTable.getCurrentVariantId(),
     * 		customData : oMyCustomData
     * 	};
     *
     * 	// callback function in case of errors
     * 	var fnOnError = function(oError){
     * 		var oi18n = oController.getView().getModel("i18n").getResourceBundle();
     * 		oError.setUIText({oi18n : oi18n, sTextKey : "OUTBOUND_NAV_ERROR"});
     * 		oError.showMessageBox();
     * 	};
     *
     * 	oNavigationHandler.navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError);
     * });
     * </code>
     */;
    _proto.navigate = function navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode) {
      let sSelectionVariant,
        mParameters,
        oXAppDataObj,
        oStartupParameters,
        bExPlace = false,
        oTmpData = {};
      const oNavHandler = this;
      const oComponentData = this.oComponent.getComponentData();
      /*
       * There are some race conditions where the oComponentData may not be set, for example in case the UShell was not initialized properly. To
       * make sure that we do not dump here with an exception, we take this special error handling behavior:
       */
      if (oComponentData) {
        oStartupParameters = oComponentData.startupParameters;
        if (oStartupParameters && oStartupParameters["sap-ushell-next-navmode"] && oStartupParameters["sap-ushell-next-navmode"].length > 0) {
          // bExPlace = (JSON.parse(oStartupParameters["sap-ushell-next-navmode"][0]) === "explace");
          bExPlace = oStartupParameters["sap-ushell-next-navmode"][0] === "explace";
        }
      }

      // only nav-mode 'inplace' or 'explace' are supported. Any other value will lead to an exception.
      if (sNavMode && (sNavMode === "inplace" || sNavMode === "explace")) {
        bExPlace = sNavMode === "explace";
      } else if (sNavMode) {
        throw new NavError("NavigationHandler.INVALID_NAV_MODE");
      }
      if (oExternalAppData === undefined || oExternalAppData === null) {
        oXAppDataObj = {};
      } else {
        oXAppDataObj = oExternalAppData;
      }

      // for navigation we need URL parameters (legacy navigation) and sap-xapp-state, therefore we need to create the missing one from the
      // passed one
      if (typeof vNavigationParameters === "string") {
        sSelectionVariant = vNavigationParameters;
      } else if (typeof vNavigationParameters === "object") {
        const oEnrichedSelVar = this._splitInboundNavigationParameters(new SelectionVariant(), vNavigationParameters, []).oNavigationSelVar;
        sSelectionVariant = oEnrichedSelVar.toJSONString();
      } else {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      oTmpData.selectionVariant = new SelectionVariant(sSelectionVariant);
      if (typeof vNavigationParameters === "string") {
        oTmpData.selectionVariant = this._removeTechnicalParameters(oTmpData.selectionVariant);
      }
      oTmpData.selectionVariant = oTmpData.selectionVariant && oTmpData.selectionVariant.toJSONObject();
      oTmpData = this._removeMeasureBasedInformation(oTmpData); // remove eventual measures
      oTmpData = this._checkIsPotentiallySensitive(oTmpData); // remove eventual sensitive data

      if (oTmpData.selectionVariant) {
        mParameters = this._getURLParametersFromSelectionVariant(new SelectionVariant(oTmpData.selectionVariant));
        sSelectionVariant = new SelectionVariant(oTmpData.selectionVariant).toJSONString();
      } else {
        mParameters = {};
        sSelectionVariant = null;
      }
      const oNavArguments = {
        target: {
          semanticObject: sSemanticObject,
          action: sActionName
        },
        params: mParameters || {}
      };
      const fnNavigate = function (oCrossAppNavService) {
        if (!oXAppDataObj.selectionVariant) {
          oXAppDataObj.selectionVariant = sSelectionVariant;
        }
        const fnNavExplace = function () {
          const sNewHrefPromise = oCrossAppNavService.hrefForExternalAsync(oNavArguments, oNavHandler.oComponent);
          sNewHrefPromise.then(function (sNewHref) {
            openWindow(sNewHref);
          }).catch(function (oError) {
            Log.error("Error while retireving hrefForExternal : " + oError);
          });
        };
        oXAppDataObj = oNavHandler._removeMeasureBasedInformation(oXAppDataObj);
        return oNavHandler._fnSaveAppStateAsync(oXAppDataObj, fnOnError).then(function (oSaveAppStateReturn) {
          if (oSaveAppStateReturn) {
            oNavArguments.appStateKey = oSaveAppStateReturn.appStateKey;

            // Remark:
            // The Cross App Service takes care of encoding parameter keys and values. Example:
            // mParams = { "$@%" : "&/=" } results in the URL parameter %2524%2540%2525=%2526%252F%253D
            // Note the double encoding, this is correct.

            // toExternal sets sap-xapp-state in the URL if appStateKey is provided in oNavArguments
            // toExternal has issues on sticky apps FIORITECHP1-14400, temp fix using hrefForExternal
            if (sNavMode == "explace") {
              fnNavExplace();
            } else {
              const ptoExt = oCrossAppNavService.toExternal(oNavArguments, oNavHandler.oComponent);
              // TODO: This is just a temporary solution to allow FE V2 to use toExternal promise.
              if (oNavHandler._navigateCallback) {
                oNavHandler._navigateCallback(ptoExt);
              }
            }
          } // else : error was already reported
        });
      };

      const fnStoreAndNavigate = function (oCrossAppNavService) {
        oNavHandler.storeInnerAppStateAsync(oInnerAppData, true).then(function (sAppStateKey) {
          if (sAppStateKey) {
            oNavHandler.replaceHash(sAppStateKey);
          }
          return fnNavigate(oCrossAppNavService);
        }).catch(function (oError) {
          if (fnOnError) {
            fnOnError(oError);
          }
        });
      };
      if (sNavMode) {
        oNavArguments.params["sap-ushell-navmode"] = bExPlace ? "explace" : "inplace";
      }
      oNavHandler._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
        const oSupportedPromise = oCrossAppNavService.isNavigationSupported([oNavArguments], oNavHandler.oComponent);
        oSupportedPromise.done(function (oTargets) {
          if (oTargets[0].supported) {
            if (!bExPlace) {
              fnStoreAndNavigate(oCrossAppNavService);
            } else {
              fnNavigate(oCrossAppNavService);
            }
          } else if (fnOnError) {
            // intent is not supported
            const oError = new NavError("NavigationHandler.isIntentSupported.notSupported");
            fnOnError(oError);
          }
        });
        if (fnOnError) {
          oSupportedPromise.fail(function () {
            // technical error: could not determine if intent is supported
            const oError = oNavHandler._createTechnicalError("NavigationHandler.isIntentSupported.failed");
            fnOnError(oError);
          });
        }
      }).catch(function (oError) {
        if (fnOnError) {
          fnOnError(oError);
        }
      });
    }

    /**
     * Parses the incoming URL and returns a Promise. If this method detects a back navigation, the inner app state is returned in the resolved
     * Promise. Otherwise startup parameters will be merged into the app state provided by cross app navigation, and a combined app state will be
     * returned. The conflict resolution can be influenced with sParamHandlingMode defined in the constructor.
     *
     * @returns A Promise object to monitor when all the actions of the function have been executed. If the execution is successful, the
     *          extracted app state, the startup parameters, and the type of navigation are returned, see also the example above. The app state is
     *          an object that contains the following information:
     *          <ul>
     *          <li><code>oAppData.oSelectionVariant</code>: An instance of {@link sap.fe.navigation.SelectionVariant}
     *          containing only parameters/select options that are related to navigation</li>
     *          <li><code>oAppData.selectionVariant</code>: The navigation-related selection variant as a JSON-formatted string</li>
     *          <li><code>oAppData.oDefaultedSelectionVariant</code>: An instance of
     *          {@link sap.fe.navigation.SelectionVariant} containing only the parameters/select options that are set by user
     *          default data</li>
     *          <li><code>oAppData.bNavSelVarHasDefaultsOnly</code>: A Boolean flag that indicates whether only defaulted parameters and no
     *          navigation parameters are present.<br>
     *          <b>Note:</b> If no navigation parameters are available, <code>bNavSelVarHasDefaultsOnly</code> is set to <code>true</code>,
     *          even though parameters without default might be available as well.</li>
     *          </ul>
     *          If the navigation-related selection variant is empty, it is replaced by a copy of the defaulted selection variant.<br>
     *          The navigation type is an enumeration type of type {@link sap.fe.navigation.NavType} (possible values are
     *          initial, URLParams, xAppState, and iAppState).<br>
     *          <b>Note:</b> If the navigation type is {@link sap.fe.navigation.NavType.iAppState} oAppData has two
     *          additional properties
     *          <ul>
     *          <li><code>oAppData.tableVariantId</code></li>
     *          <li><code>oAppData.customData</code></li>
     *          </ul>
     *          which return the inner app data as stored in {@link #.navigate navigate} or {@link #.storeInnerAppStateAsync storeInnerAppStateAsync}.
     *          <code>oAppData.oDefaultedSelectionVariant</code> is an empty selection variant and
     *          <code>oAppData.bNavSelVarHasDefaultsOnly</code> is <code>false</code> in this case.<br>
     *          <b>Note:</b> If the navigation type is {@link sap.fe.navigation.NavType.initial} oAppData is an empty object!<br>
     *          If an error occurs, an error object of type {@link sap.fe.navigation.NavError}, URL parameters (if available)
     *          and the type of navigation are returned.
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var oParseNavigationPromise = oNavigationHandler.parseNavigation();
     *
     * 	oParseNavigationPromise.done(function(oAppData, oStartupParameters, sNavType){
     * 			oSmartFilterBar.setDataSuiteFormat(oAppData.selectionVariant);
     * 			// oAppData.oSelectionVariant can be used to manipulate the selection variant
     * 			// oAppData.oDefaultedSelectionVariant contains the parameters which are set by user defaults
     * 			// oAppData.bNavSelVarHasDefaultsOnly indicates whether only defaulted parameters and no navigation parameters are present
     * 	});
     * 	oParseNavigationPromise.fail(function(oError, oURLParameters, sNavType){
     * 		// if e.g. the xapp state could not be loaded, nevertheless there may be URL parameters available
     * 		//some error handling
     * 	});
     * });
     * </code>
     */;
    _proto.parseNavigation = function parseNavigation() {
      var _oStartupParameters$H;
      const sAppHash = HashChanger.getInstance().getHash();
      /*
       * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell is
       * not initialized properly.
       */
      const sIAppState = this._getInnerAppStateKey(sAppHash);
      let oComponentData = this.oComponent.getComponentData();
      /*
       * There are some race conditions where the oComponentData may not be set, for example in case the UShell was not initialized properly. To
       * make sure that we do not dump here with an exception, we take this special error handling behavior:
       */
      if (oComponentData === undefined) {
        Log.warning("The navigation Component's data was not set properly; assuming instead that no parameters are provided.");
        oComponentData = {};
      }

      // Remark:
      // The startup parameters are already decoded. Example:
      // The original URL parameter %2524%2540%2525=%2526%252F%253D results in oStartupParameters = { "$@%" : "&/=" }
      // Note the double encoding in the URL, this is correct. An URL parameter like xyz=%25 causes an "URI malformed" error.
      // If the decoded value should be e.g. "%25", the parameter in the URL needs to be: xyz=%252525
      const oStartupParameters = oComponentData.startupParameters;
      const hybridIAppStateKeyParams = oStartupParameters === null || oStartupParameters === void 0 ? void 0 : (_oStartupParameters$H = oStartupParameters[HYBRID_IAPP_STATE_KEY]) === null || _oStartupParameters$H === void 0 ? void 0 : _oStartupParameters$H[0];
      const hybridDeferred = jQuery.Deferred();
      let iAppStateHybridDeferred;
      if (hybridIAppStateKeyParams !== undefined) {
        iAppStateHybridDeferred = this._loadAppState(hybridIAppStateKeyParams, hybridDeferred, NavType.hybrid);
      }
      let aDefaultedParameters = [];
      if (oStartupParameters && oStartupParameters[DEFAULTED_PARAMETER_PROPERTY] && oStartupParameters[DEFAULTED_PARAMETER_PROPERTY].length > 0) {
        aDefaultedParameters = JSON.parse(oStartupParameters[DEFAULTED_PARAMETER_PROPERTY][0]);
      }
      const oMyDeferred = jQuery.Deferred();
      const oNavHandler = this;
      const parseUrlParams = function (oSubStartupParameters, aSubDefaultedParameters, oSubMyDeferred, sNavType) {
        // standard URL navigation
        const oSelVars = oNavHandler._splitInboundNavigationParameters(new SelectionVariant(), oSubStartupParameters, aSubDefaultedParameters);
        // For scenario, where only hybridIAppStateKey is part of urlParams, we ignore this condition
        if (oSelVars.oNavigationSelVar.isEmpty() && oSelVars.oDefaultedSelVar.isEmpty() && sNavType !== NavType.hybrid) {
          // Startup parameters contain only technical parameters (SAP system) which were filtered out.
          // oNavigationSelVar and oDefaultedSelVar are empty.
          // Thus, consider this type of navigation as an initial navigation.
          if (sNavType === NavType.xAppState) {
            const oError = oNavHandler._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
            oSubMyDeferred.reject(oError, oSubStartupParameters || {}, NavType.xAppState);
          } else {
            oSubMyDeferred.resolve({}, oSubStartupParameters, NavType.initial);
          }
        } else {
          const oAppStateData = {};
          oAppStateData.selectionVariant = oSelVars.oNavigationSelVar.toJSONString();
          oAppStateData.oSelectionVariant = oSelVars.oNavigationSelVar;
          oAppStateData.oDefaultedSelectionVariant = oSelVars.oDefaultedSelVar;
          oAppStateData.bNavSelVarHasDefaultsOnly = oSelVars.bNavSelVarHasDefaultsOnly;

          // no sap-xapp-state but navType is hybrid, extract the IAppStateData
          if (sNavType === NavType.hybrid) {
            const successHandlerHybridState = function (iAppStateData, _ref, navType) {
              oAppStateData.iAppState = iAppStateData;
              oSubMyDeferred.resolve(oAppStateData, oStartupParameters, navType);
            };
            const failureHandlerHybridState = function (oError, _ref, navType) {
              oSubMyDeferred.reject(oError, _ref, navType);
            };
            if (iAppStateHybridDeferred !== undefined) {
              iAppStateHybridDeferred.done(successHandlerHybridState);
              iAppStateHybridDeferred.fail(failureHandlerHybridState);
            }
          } else {
            oSubMyDeferred.resolve(oAppStateData, oSubStartupParameters, sNavType);
          }
        }
      };
      if (sIAppState) {
        // inner app state is available in the AppHash (back navigation); extract the parameter value
        this._loadAppState(sIAppState, oMyDeferred, NavType.iAppState);
      } else {
        // no back navigation
        const bIsXappStateNavigation = oComponentData["sap-xapp-state"] !== undefined;
        if (bIsXappStateNavigation) {
          const that = this;
          // inner app state was not found in the AppHash, but xapp state => try to read the xapp state
          this._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
            const oStartupPromise = oCrossAppNavService.getStartupAppState(that.oComponent);
            oStartupPromise.done(function (oAppState) {
              // get app state from sap-xapp-state,
              // create a copy, not only a reference, because we want to modify the object
              let oAppStateData = oAppState.getData();
              let oError;
              if (oAppStateData) {
                try {
                  oAppStateData = JSON.parse(JSON.stringify(oAppStateData));
                } catch (x) {
                  oError = oNavHandler._createTechnicalError("NavigationHandler.AppStateData.parseError");
                  oMyDeferred.reject(oError, oStartupParameters, NavType.xAppState);
                  return oMyDeferred.promise();
                }
              }
              if (oAppStateData) {
                const oSelVar = new SelectionVariant(oAppStateData.selectionVariant);
                const oSelVars = oNavHandler._splitInboundNavigationParameters(oSelVar, oStartupParameters, aDefaultedParameters);
                oAppStateData.selectionVariant = oSelVars.oNavigationSelVar.toJSONString();
                oAppStateData.oSelectionVariant = oSelVars.oNavigationSelVar;
                oAppStateData.oDefaultedSelectionVariant = oSelVars.oDefaultedSelVar;
                oAppStateData.bNavSelVarHasDefaultsOnly = oSelVars.bNavSelVarHasDefaultsOnly;
                const successHandlerHybridState = function (iAppStateData, _ref, navType) {
                  oAppStateData.iAppState = iAppStateData;
                  oMyDeferred.resolve(oAppStateData, oStartupParameters, navType);
                };
                if (hybridIAppStateKeyParams !== undefined && iAppStateHybridDeferred !== undefined) {
                  iAppStateHybridDeferred.done(successHandlerHybridState);
                } else if (oAppStateData[HYBRID_IAPP_STATE_KEY]) {
                  that._loadAppState(oAppStateData[HYBRID_IAPP_STATE_KEY], hybridDeferred, NavType.hybrid).done(successHandlerHybridState);
                } else {
                  oMyDeferred.resolve(oAppStateData, oStartupParameters, NavType.xAppState);
                }
              } else if (oStartupParameters) {
                parseUrlParams(oStartupParameters, aDefaultedParameters, oMyDeferred, NavType.xAppState);
              } else {
                // sap-xapp-state navigation, but ID has already expired, but URL parameters available
                oError = oNavHandler._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
                oMyDeferred.reject(oError, oStartupParameters || {}, NavType.xAppState);
              }
            });
            oStartupPromise.fail(function () {
              const oError = oNavHandler._createTechnicalError("NavigationHandler.getStartupState.failed");
              oMyDeferred.reject(oError, {}, NavType.xAppState);
            });
            return oStartupPromise;
          }).catch(function () {
            const oError = oNavHandler._createTechnicalError("NavigationHandler._getAppNavigationServiceAsync.failed");
            oMyDeferred.reject(oError, {}, NavType.xAppState);
          });
        } else if (oStartupParameters) {
          // no sap-xapp-state
          parseUrlParams(oStartupParameters, aDefaultedParameters, oMyDeferred, hybridIAppStateKeyParams !== undefined ? NavType.hybrid : NavType.URLParams);
        } else {
          // initial navigation
          oMyDeferred.resolve({}, {}, NavType.initial);
        }
      }
      return oMyDeferred.promise();
    }

    /**
     * Sets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
     * application. As a default the following values are considered as technical parameters:
     * <ul>
     * <li><code>sap-system</code></li>
     * <li><code>sap-ushell-defaultedParameterNames</code></li>
     * <li><code>"hcpApplicationId"</code></li>
     * </ul>.
     *
     * @public
     * @function setTechnicalParameters
     * @memberof sap.fe.navigation.NavigationHandler.prototype
     * @param {Array} aTechnicalParameters List of parameter names to be considered as technical parameters. <code>null</code> or
     *        <code>undefined</code> may be used to reset the complete list.
     */;
    _proto.setTechnicalParameters = function setTechnicalParameters(aTechnicalParameters) {
      if (!aTechnicalParameters) {
        aTechnicalParameters = [];
      }
      if (!Array.isArray(aTechnicalParameters)) {
        Log.error("NavigationHandler: parameter incorrect, array of strings expected");
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      this._aTechnicalParamaters = aTechnicalParameters;
    }

    /**
     * Gets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
     * application. As a default the following values are considered as technical parameters:
     * <ul>
     * <li><code>sap-system</code></li>
     * <li><code>sap-ushell-defaultedParameterNames</code></li>
     * <li><code>"hcpApplicationId"</code></li>
     * </ul>.
     *
     * @public
     * @function getTechnicalParameters
     * @memberof sap.fe.navigation.NavigationHandler.prototype
     * @returns {Array} Containing the technical parameters.
     */;
    _proto.getTechnicalParameters = function getTechnicalParameters() {
      return this._aTechnicalParamaters.concat([]);
    }

    /**
     * Checks if the passed parameter is considered as technical parameter.
     *
     * @param sParameterName Name of a request parameter, considered as technical parameter.
     * @returns Indicates if the parameter is considered as technical parameter or not.
     * @private
     */;
    _proto._isTechnicalParameter = function _isTechnicalParameter(sParameterName) {
      if (sParameterName) {
        if (!(sParameterName === "sap-ui-fe-variant-id" || sParameterName === "sap-ui-fe-table-variant-id" || sParameterName === "sap-ui-fe-chart-variant-id" || sParameterName === "sap-ui-fe-filterbar-variant-id")) {
          if (sParameterName.toLowerCase().indexOf("sap-") === 0) {
            return true;
          } else if (this._aTechnicalParamaters.indexOf(sParameterName) >= 0) {
            return true;
          }
        }
      }
      return false;
    };
    _proto._isFEParameter = function _isFEParameter(sParameterName) {
      return sParameterName.toLowerCase().indexOf("sap-ui-fe") === 0;
    }

    /**
     * Rmoves if the passed parameter is considered as technical parameter.
     *
     * @param oSelectionVariant Selection Variant which consists of technical Parameters.
     * @returns Selection Variant without technical Parameters.
     * @private
     */;
    _proto._removeTechnicalParameters = function _removeTechnicalParameters(oSelectionVariant) {
      let sPropName, i;
      const aSelVarPropNames = oSelectionVariant.getSelectOptionsPropertyNames();
      for (i = 0; i < aSelVarPropNames.length; i++) {
        sPropName = aSelVarPropNames[i];
        if (this._isTechnicalParameter(sPropName)) {
          oSelectionVariant.removeSelectOption(sPropName);
        }
      }
      return oSelectionVariant;
    }

    /**
     * Splits the parameters provided during inbound navigation and separates the contextual information between defaulted parameter values and
     * navigation parameters.
     *
     * @param oSelectionVariant Instance of {@link sap.fe.navigation.SelectionVariant} containing navigation data of
     *        the app
     * @param oStartupParameters Object containing startup parameters of the app (derived from the component)
     * @param aDefaultedParameters Array containing defaulted parameter names
     * @returns Object containing two SelectionVariants, one for navigation (oNavigationSelVar) and one for defaulted startup parameters
     *          (oDefaultedSelVar), and a flag (bNavSelVarHasDefaultsOnly) indicating whether all parameters were defaulted. The function is
     *          handed two objects containing parameters (names and their corresponding values), oSelectionVariant and oStartupParameters. A
     *          parameter could be stored in just one of these two objects or in both of them simultaneously. Because of the latter case a
     *          parameter could be associated with conflicting values and it is the job of this function to resolve any such conflict. Parameters
     *          are assigned to the two returned SelectionVariants, oNavigationSelVar and oDefaultedSelVar, as follows: | parameter NOT in |
     *          parameter in | oSelectionVariant | oSelectionVariant ---------------------------------------|------------------ parameter NOT in |
     *          nothing to do | Add parameter oStartupParameters | here | (see below) ----------------------------------------------------------
     *          parameter in | Add parameter | Conflict resolution oStartupParameters | (see below) | (see below) Add parameter: if parameter in
     *          aDefaultedParameters: add parameter to oDefaultedSelVar else: add parameter to oNavigationSelVar Conflict resolution: if parameter
     *          in aDefaultedParameters: add parameter value from oSelectionVariant to oNavigationSelVar add parameter value from
     *          oStartupParameters to oDefaultedSelVar Note: This case only occurs in UI5 1.32. In later versions UShell stores any defaulted
     *          parameter either in oSelectionVariant or oStartupParameters but never simultaneously in both. else: Choose 1 of the following
     *          options based on given handling mode (this.sParamHandlingMode). -> add parameter value from oStartupParameters to
     *          oNavigationSelVar | -> add parameter value from oAppState.selectionVariant to oNavigationSelVar -> add both parameter values to
     *          navigationSelVar If navigationSelVar is still empty at the end of execution, navigationSelVar is replaced by a copy of
     *          oDefaultedSelVar and the flag bNavSelVarHasDefaultsOnly is set to true. The selection variant oDefaultedSelVar itself is always
     *          returned as is.
     * @private
     */;
    _proto._splitInboundNavigationParameters = function _splitInboundNavigationParameters(oSelectionVariant, oStartupParameters, aDefaultedParameters) {
      if (!Array.isArray(aDefaultedParameters)) {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }
      let sPropName, i;
      // First we do some parsing of the StartUp Parameters.
      const oStartupParametersAdjusted = {};
      for (sPropName in oStartupParameters) {
        if (!oStartupParameters.hasOwnProperty(sPropName)) {
          continue;
        }

        // if (sPropName === SAP_SYSTEM_PROPERTY || sPropName === DEFAULTED_PARAMETER_PROPERTY) {
        if (this._isTechnicalParameter(sPropName) || this._isFEParameter(sPropName) || sPropName === HYBRID_IAPP_STATE_KEY) {
          // Do not add the SAP system parameter to the selection variant as it is a technical parameter
          // not relevant for the selection variant.
          // Do not add the startup parameter for default values to the selection variant. The information, which parameters
          // are defaulted, is available in the defaulted selection variant.
          // In case, FE Parameters we shall skip it.(the application needs to fetch it from URL params)
          // Skip the hybridIAppStateKey present as part of 'Hybrid' navigation type not relevant for the selection variant
          continue;
        }

        // We support parameters as a map with strings and as a map with value arrays
        if (typeof oStartupParameters[sPropName] === "string") {
          oStartupParametersAdjusted[sPropName] = oStartupParameters[sPropName];
        } else if (Array.isArray(oStartupParameters[sPropName]) && oStartupParameters[sPropName].length === 1) {
          oStartupParametersAdjusted[sPropName] = oStartupParameters[sPropName][0]; // single-valued parameters
        } else if (Array.isArray(oStartupParameters[sPropName]) && oStartupParameters[sPropName].length > 1) {
          oStartupParametersAdjusted[sPropName] = oStartupParameters[sPropName]; // multi-valued parameters
        } else {
          throw new NavError("NavigationHandler.INVALID_INPUT");
        }
      }

      // Construct two selection variants for defaults and navigation to be returned by the function.
      const oDefaultedSelVar = new SelectionVariant();
      const oNavigationSelVar = new SelectionVariant();
      const aSelVarPropNames = oSelectionVariant.getParameterNames().concat(oSelectionVariant.getSelectOptionsPropertyNames());
      for (i = 0; i < aSelVarPropNames.length; i++) {
        sPropName = aSelVarPropNames[i];
        if (sPropName in oStartupParametersAdjusted) {
          // Resolve conflict.
          if (aDefaultedParameters.indexOf(sPropName) > -1) {
            oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
            this._addParameterValues(oDefaultedSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
          } else {
            switch (this.sParamHandlingMode) {
              case ParamHandlingMode.SelVarWins:
                oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
                break;
              case ParamHandlingMode.URLParamWins:
                this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
                break;
              case ParamHandlingMode.InsertInSelOpt:
                oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
                this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
                break;
              default:
                throw new NavError("NavigationHandler.INVALID_INPUT");
            }
          }
        } else if (aDefaultedParameters.indexOf(sPropName) > -1) {
          // parameter only in SelVar
          oDefaultedSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
        } else {
          oNavigationSelVar.massAddSelectOption(sPropName, oSelectionVariant.getValue(sPropName));
        }
      }
      for (sPropName in oStartupParametersAdjusted) {
        // The case where the parameter appears twice has already been taken care of above so we skip it here.
        if (aSelVarPropNames.indexOf(sPropName) > -1) {
          continue;
        }
        if (aDefaultedParameters.indexOf(sPropName) > -1) {
          this._addParameterValues(oDefaultedSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
        } else {
          this._addParameterValues(oNavigationSelVar, sPropName, "I", "EQ", oStartupParametersAdjusted[sPropName]);
        }
      }

      // the selection variant used for navigation should be filled with defaults in case that only defaults exist
      let bNavSelVarHasDefaultsOnly = false;
      if (oNavigationSelVar.isEmpty()) {
        bNavSelVarHasDefaultsOnly = true;
        const aPropNames = oDefaultedSelVar.getSelectOptionsPropertyNames();
        for (i = 0; i < aPropNames.length; i++) {
          oNavigationSelVar.massAddSelectOption(aPropNames[i], oDefaultedSelVar.getValue(aPropNames[i]));
        }
      }
      return {
        oNavigationSelVar: oNavigationSelVar,
        oDefaultedSelVar: oDefaultedSelVar,
        bNavSelVarHasDefaultsOnly: bNavSelVarHasDefaultsOnly
      };
    };
    _proto._addParameterValues = function _addParameterValues(oSelVariant, sPropName, sSign, sOption, oValues) {
      if (Array.isArray(oValues)) {
        for (let i = 0; i < oValues.length; i++) {
          oSelVariant.addSelectOption(sPropName, sSign, sOption, oValues[i]);
        }
      } else {
        oSelVariant.addSelectOption(sPropName, sSign, sOption, oValues);
      }
    }

    /**
     * Changes the URL according to the current sAppStateKey. As an reaction route change event will be triggered.
     *
     * @param sAppStateKey The new app state key.
     * @public
     */;
    _proto.replaceHash = function replaceHash(sAppStateKey) {
      const oHashChanger = this.oRouter.oHashChanger ? this.oRouter.oHashChanger : HashChanger.getInstance();
      const sAppHashOld = oHashChanger.getHash();
      /*
       * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell is
       * not initialized properly.
       */
      const sAppHashNew = this._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
      oHashChanger.replaceHash(sAppHashNew);
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @param mInnerAppData Object containing the current state of the app
     * @param bImmediateHashReplace If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
     * @param bSkipHashReplace If set to true, the inner app hash will not be replaced in the storeInnerAppStateAsync. Also the bImmediateHashReplace
     * 		  will be ignored.
     * @returns A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
     *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
     *          returned
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var mInnerAppData = {
     * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 		tableVariantId : oSmartTable.getCurrentVariantId(),
     * 		customData : oMyCustomData
     * 	};
     *
     * 	var oStoreInnerAppStatePromise = oNavigationHandler.storeInnerAppStateAsync(mInnerAppData);
     *
     * 	oStoreInnerAppStatePromise.done(function(sAppStateKey){
     * 		//your inner app state is saved now, sAppStateKey was added to URL
     * 		//perform actions that must run after save
     * 	});
     *
     * 	oStoreInnerAppStatePromise.fail(function(oError){
     * 		//some error handling
     * 	});
     * });
     * </code>
     */;
    _proto.storeInnerAppStateAsync = function storeInnerAppStateAsync(mInnerAppData, bImmediateHashReplace, bSkipHashReplace) {
      if (typeof bImmediateHashReplace !== "boolean") {
        bImmediateHashReplace = true; // default
      }

      const oNavHandler = this;
      const oMyDeferred = jQuery.Deferred();
      const fnReplaceHash = function (sAppStateKey) {
        const oHashChanger = oNavHandler.oRouter.oHashChanger ? oNavHandler.oRouter.oHashChanger : HashChanger.getInstance();
        const sAppHashOld = oHashChanger.getHash();
        /*
         * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell
         * is not initialized properly.
         */
        const sAppHashNew = oNavHandler._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
        oHashChanger.replaceHash(sAppHashNew);
      };

      // in case mInnerAppState is empty, do not overwrite the last saved state
      if (isEmptyObject(mInnerAppData)) {
        oMyDeferred.resolve("");
        return oMyDeferred.promise();
      }

      // check if we already saved the same data
      const sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
      const bInnerAppDataEqual = JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData);
      if (bInnerAppDataEqual && sAppStateKeyCached) {
        // passed inner app state found in cache
        this._oLastSavedInnerAppData.iCacheHit++;

        // replace inner app hash with cached appStateKey in url (just in case the app has changed the hash in meantime)
        fnReplaceHash(sAppStateKeyCached);
        oMyDeferred.resolve(sAppStateKeyCached);
        return oMyDeferred.promise();
      }

      // passed inner app state not found in cache
      this._oLastSavedInnerAppData.iCacheMiss++;
      const fnOnAfterSave = function (sAppStateKey) {
        // replace inner app hash with new appStateKey in url
        if (!bSkipHashReplace && !bImmediateHashReplace) {
          fnReplaceHash(sAppStateKey);
        }

        // remember last saved state
        oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
        oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
        oMyDeferred.resolve(sAppStateKey);
      };
      const fnOnError = function (oError) {
        oMyDeferred.reject(oError);
      };
      this._saveAppStateAsync(mInnerAppData, fnOnAfterSave, fnOnError).then(function (sAppStateKey) {
        /* Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
         * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
         * happened before by making the oMyDeferred promise fail (see fnOnError above).
         */
        if (sAppStateKey !== undefined) {
          // replace inner app hash with new appStateKey in url
          // note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
          // this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
          if (!bSkipHashReplace && bImmediateHashReplace) {
            fnReplaceHash(sAppStateKey);
          }
        }
      }).catch(function () {
        Log.error("NavigationHandler._saveAppStateAsync failed");
      });
      return oMyDeferred.promise();
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @param mInnerAppData Object containing the current state of the app
     * @param bImmediateHashReplace If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
     * @returns A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
     *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
     *          returned
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var mInnerAppData = {
     * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 		tableVariantId : oSmartTable.getCurrentVariantId(),
     * 		customData : oMyCustomData
     * 	};
     *
     * 	var oStoreInnerAppStatePromise = oNavigationHandler.storeInnerAppState(mInnerAppData);
     *
     * 	oStoreInnerAppStatePromise.done(function(sAppStateKey){
     * 		//your inner app state is saved now, sAppStateKey was added to URL
     * 		//perform actions that must run after save
     * 	});
     *
     * 	oStoreInnerAppStatePromise.fail(function(oError){
     * 		//some error handling
     * 	});
     * });
     * </code>
     * @deprecatedsince 1.104
     * @deprecated Use the {@link sap.fe.navigation.NavigationHandler.storeInnerAppStateAsync} instead.
     */;
    _proto.storeInnerAppState = function storeInnerAppState(mInnerAppData, bImmediateHashReplace) {
      Log.error("Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppState'. Please use 'storeInnerAppStateAsync' instead", undefined, "sap.fe.navigation.NavigationHandler");
      if (typeof bImmediateHashReplace !== "boolean") {
        bImmediateHashReplace = true; // default
      }

      const oNavHandler = this;
      const oMyDeferred = jQuery.Deferred();
      const fnReplaceHash = function (sAppStateKey) {
        const oHashChanger = oNavHandler.oRouter.oHashChanger ? oNavHandler.oRouter.oHashChanger : HashChanger.getInstance();
        const sAppHashOld = oHashChanger.getHash();
        /*
         * use .getHash() here instead of .getAppHash() to also be able dealing with environments where only SAPUI5 is loaded and the UShell
         * is not initialized properly.
         */
        const sAppHashNew = oNavHandler._replaceInnerAppStateKey(sAppHashOld, sAppStateKey);
        oHashChanger.replaceHash(sAppHashNew);
      };

      // in case mInnerAppState is empty, do not overwrite the last saved state
      if (isEmptyObject(mInnerAppData)) {
        oMyDeferred.resolve("");
        return oMyDeferred.promise();
      }

      // check if we already saved the same data
      const sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
      const bInnerAppDataEqual = JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData);
      if (bInnerAppDataEqual && sAppStateKeyCached) {
        // passed inner app state found in cache
        this._oLastSavedInnerAppData.iCacheHit++;

        // replace inner app hash with cached appStateKey in url (just in case the app has changed the hash in meantime)
        fnReplaceHash(sAppStateKeyCached);
        oMyDeferred.resolve(sAppStateKeyCached);
        return oMyDeferred.promise();
      }

      // passed inner app state not found in cache
      this._oLastSavedInnerAppData.iCacheMiss++;
      const fnOnAfterSave = function (sAppStateKey) {
        // replace inner app hash with new appStateKey in url
        if (!bImmediateHashReplace) {
          fnReplaceHash(sAppStateKey);
        }

        // remember last saved state
        oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
        oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
        oMyDeferred.resolve(sAppStateKey);
      };
      const fnOnError = function (oError) {
        oMyDeferred.reject(oError);
      };
      const sAppStateKey = this._saveAppState(mInnerAppData, fnOnAfterSave, fnOnError);
      /*
       * Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
       * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
       * happened before by making the oMyDeferred promise fail (see fnOnError above).
       */
      if (sAppStateKey !== undefined) {
        // replace inner app hash with new appStateKey in url
        // note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
        // this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
        if (bImmediateHashReplace) {
          fnReplaceHash(sAppStateKey);
        }
      }
      return oMyDeferred.promise();
    }

    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @param mInnerAppData Object containing the current state of the app
     * @param bImmediateHashReplace If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event. <b>Note:</b>If
     *        not provided it will be treated as set to false. <b>Note:</b>If set to true, the calling instance has to ensure that a follow-on
     *        call to <code>replaceHash</code> will take place!
     * @returns An object containing the appStateId and a promise object to monitor when all the actions of the function have been
     *          executed; Please note that the appStateKey may be undefined or empty.
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler"], function (NavigationHandler) {
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var mInnerAppData = {
     * 		selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 		tableVariantId : oSmartTable.getCurrentVariantId(),
     * 		customData : oMyCustomData
     * 	};
     *
     * 	var oStoreInnerAppState = storeInnerAppStateWithNonDelayedReturn(mInnerAppData);
     * 	var sAppStateKey = oStoreInnerAppState.appStateKey;
     * 	if (!sAppStateKey) {
     *    // no appStateKey obtained...
     * 	};
     * 	var oStoreInnerAppStatePromise = oStoreInnerAppState.promise;
     *
     * 	oStoreInnerAppStatePromise.done(function(sAppStateKey){
     * 		//your inner app state is saved now, sAppStateKey was added to URL
     * 		//perform actions that must run after save
     * 	});
     *
     * 	oStoreInnerAppStatePromise.fail(function(oError){
     * 		//some error handling
     * 	});
     * });
     * </code>
     * @public
     * @deprecatedsince 1.104
     * @deprecated Use the {@link sap.fe.navigation.NavigationHandler.storeInnerAppStateAsync} instead.
     */;
    _proto.storeInnerAppStateWithImmediateReturn = function storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace) {
      Log.error("Deprecated API call of 'sap.fe.navigation.NavigationHandler.storeInnerAppStateWithImmediateReturn'. Please use 'storeInnerAppStateAsync' instead", undefined, "sap.fe.navigation.NavigationHandler");
      if (typeof bImmediateHashReplace !== "boolean") {
        bImmediateHashReplace = false; // default
      }

      const oNavHandler = this;
      const oAppStatePromise = jQuery.Deferred();

      // in case mInnerAppState is empty, do not overwrite the last saved state
      if (isEmptyObject(mInnerAppData)) {
        return {
          appStateKey: "",
          promise: oAppStatePromise.resolve("")
        };
      }

      // check if we already saved the same data
      const sAppStateKeyCached = this._oLastSavedInnerAppData.sAppStateKey;
      const bInnerAppDataEqual = JSON.stringify(mInnerAppData) === JSON.stringify(this._oLastSavedInnerAppData.oAppData);
      if (bInnerAppDataEqual && sAppStateKeyCached) {
        // passed inner app state found in cache
        this._oLastSavedInnerAppData.iCacheHit++;
        return {
          appStateKey: sAppStateKeyCached,
          promise: oAppStatePromise.resolve(sAppStateKeyCached)
        };
      }

      // passed inner app state not found in cache
      this._oLastSavedInnerAppData.iCacheMiss++;
      const fnOnAfterSave = function (sAppStateKey) {
        // replace inner app hash with new appStateKey in url
        if (!bImmediateHashReplace) {
          oNavHandler.replaceHash(sAppStateKey);
        }

        // remember last saved state
        oNavHandler._oLastSavedInnerAppData.oAppData = mInnerAppData;
        oNavHandler._oLastSavedInnerAppData.sAppStateKey = sAppStateKey;
        oAppStatePromise.resolve(sAppStateKey);
      };
      const fnOnError = function (oError) {
        oAppStatePromise.reject(oError);
      };
      const sAppStateKey = this._saveAppState(mInnerAppData, fnOnAfterSave, fnOnError);
      /*
       * Note that _sapAppState may return 'undefined' in case that the parsing has failed. In this case, we should not trigger the replacement
       * of the App Hash with the generated key, as the container was not written before. Note as well that the error handling has already
       * happened before by making the oMyDeferred promise fail (see fnOnError above).
       */
      // if (sAppStateKey !== undefined) {
      // //replace inner app hash with new appStateKey in url
      // //note: we do not wait for the save to be completed: this asynchronously behaviour is necessary if
      // //this method is called e.g. in a onLinkPressed event with no possibility to wait for the promise resolution
      // if (bImmediateHashReplace) {
      // fnReplaceHash(sAppStateKey);
      // }
      // }
      return {
        appStateKey: sAppStateKey,
        promise: oAppStatePromise.promise()
      };
    }

    /**
     * Processes navigation-related tasks related to beforePopoverOpens event handling for the SmartLink control and returns a Promise object. In
     * particular, the following tasks are performed before the SmartLink popover can be opened:
     * <ul>
     * <li>If <code>mInnerAppData</code> is provided, this inner app state is saved for back navigation at a later time.</li>
     * <li>The table event parameters (semantic attributes) and the selection variant data are combined by calling the method
     * {@link #.mixAttributesAndSelectionVariant mixAttributesAndSelectionVariant}.</li>
     * <li>The combined data is saved as the cross app state to be handed over to the target app, and the corresponding sap-xapp-state key is set
     * in the URL.</li>
     * <li>All single selections ("including equal") of the combined selection data are passed to the SmartLink popover as semantic attributes.</li>
     * <li>The method <code>oTableEventParameters.open()</code> is called. Note that this does not really open the popover, but the SmartLink
     * control proceeds with firing the event <code>navigationTargetsObtained</code>.</li>
     * </ul>.
     * <br>
     * <b>Node:</b> If the <code>oExternalAppData</code> parameter is not supplied, the external app data will be calculated based on
     * the <code>mInnerAppData</code> data.<br>.
     *
     * @param oTableEventParameters The parameters made available by the SmartTable control when the SmartLink control has been clicked,
     *        an instance of a PopOver object
     * @param sSelectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the SmartFilterBar control
     * @param mInnerAppData Object containing the current state of the app. If provided, opening the Popover is deferred until the
     *        inner app data is saved in a consistent way.
     * @param oExternalAppData Object containing the state which will be passed to the target screen.
     * @param oExternalAppData.selectionVariant Object containing selectionVariant, which will be passed to the target screen. If not
     *        set the sSelectionVariant will be used.
     * @param oExternalAppData.presentationVariant Object containing the current ui presentationVariant of the app, which will be
     *        passed to the target screen
     * @param oExternalAppData.valueTexts Object containing value descriptions, which will be passed to the target screen
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          modified oTableEventParameters is returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 	//event handler for the smart link event "beforePopoverOpens"
     * 		onBeforePopoverOpens: function(oEvent) {
     * 			var oTableEventParameters = oEvent.getParameters();
     *
     * 			var mInnerAppData = {
     * 				selectionVariant : oSmartFilterBar.getDataSuiteFormat(),
     * 				tableVariantId : oSmartTable.getCurrentVariantId(),
     * 				customData : oMyCustomData
     * 			};
     *
     * 			var oSelectionVariant = new SelectionVariant();
     * 			oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 			oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 			var sSelectionVariant= oSelectionVariant.toJSONString();
     *
     * 			var oNavigationHandler = new NavigationHandler(oController);
     * 			var oSmartLinkPromise = oNavigationHandler.processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData);
     *
     * 			oSmartLinkPromise.done(function(oTableEventParameters){
     * 				// here you can add coding that should run after all app states are saved and the semantic attributes are set
     * 			});
     *
     * 			oSmartLinkPromise.fail(function(oError){
     * 			//some error handling
     * 			});
     * 		};
     * 	});
     * </code>
     */;
    _proto.processBeforeSmartLinkPopoverOpens = function processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData, oExternalAppData) {
      const oMyDeferred = jQuery.Deferred();
      let mSemanticAttributes;
      if (oTableEventParameters != undefined) {
        mSemanticAttributes = oTableEventParameters.semanticAttributes;
      }
      let oXAppDataObj;
      const oNavHandler = this;
      if (oExternalAppData === undefined) {
        oXAppDataObj = {};
      } else {
        oXAppDataObj = oExternalAppData;
      }
      const fnStoreXappAndCallOpen = function (mSubSemanticAttributes, sSubSelectionVariant) {
        // mix the semantic attributes (e.g. from the row line) with the selection variant (e.g. from the filter bar)
        sSubSelectionVariant = oXAppDataObj.selectionVariant || sSubSelectionVariant || "{}";
        const iSuppressionBehavior = SuppressionBehavior.raiseErrorOnNull | SuppressionBehavior.raiseErrorOnUndefined;
        /*
         * compatiblity: Until SAPUI5 1.28.5 (or even later) the Smart Link in a Smart Table is filtering all null- and undefined values.
         * Therefore, mSemanticAttributes are already reduced appropriately -- this does not need to be done by
         * mixAttributesAndSelectionVariant again. To ensure that we still have the old behaviour (i.e. an NavError is raised in case that
         * behaviour of the Smart Link control has changed), the "old" Suppression Behaviour is retained.
         */

        const oMixedSelVar = oNavHandler.mixAttributesAndSelectionVariant(mSubSemanticAttributes, sSubSelectionVariant, iSuppressionBehavior);
        sSubSelectionVariant = oMixedSelVar.toJSONString();

        // enrich the semantic attributes with single selections from the selection variant
        let oTmpData = {};
        oTmpData.selectionVariant = oMixedSelVar.toJSONObject();
        oTmpData = oNavHandler._removeMeasureBasedInformation(oTmpData);
        oTmpData = oNavHandler._checkIsPotentiallySensitive(oTmpData);
        mSubSemanticAttributes = oTmpData.selectionVariant ? oNavHandler._getURLParametersFromSelectionVariant(new SelectionVariant(oTmpData.selectionVariant)) : {};
        const fnOnContainerSave = function (sAppStateKey) {
          if (oTableEventParameters === undefined) {
            // If oTableEventParameters is undefined, return both semanticAttributes and appStatekey
            oMyDeferred.resolve(mSubSemanticAttributes, sAppStateKey);
          } else {
            // set the stored data in popover and call open()
            oTableEventParameters.setSemanticAttributes(mSubSemanticAttributes);
            oTableEventParameters.setAppStateKey(sAppStateKey);
            oTableEventParameters.open(); // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Note that "open" does not open the popover, but proceeds
            // with firing the onNavTargetsObtained event.
            oMyDeferred.resolve(oTableEventParameters);
          }
        };
        const fnOnError = function (oError) {
          oMyDeferred.reject(oError);
        };
        oXAppDataObj.selectionVariant = sSubSelectionVariant;
        oXAppDataObj = oNavHandler._removeMeasureBasedInformation(oXAppDataObj);
        oNavHandler._saveAppStateAsync(oXAppDataObj, fnOnContainerSave, fnOnError);
      };
      if (mInnerAppData) {
        const oStoreInnerAppStatePromise = this.storeInnerAppStateAsync(mInnerAppData, true);

        // if the inner app state was successfully stored, store also the xapp-state
        oStoreInnerAppStatePromise.done(function () {
          fnStoreXappAndCallOpen(mSemanticAttributes, sSelectionVariant);
        });
        oStoreInnerAppStatePromise.fail(function (oError) {
          oMyDeferred.reject(oError);
        });
      } else {
        // there is no inner app state to save, just put the parameters into xapp-state
        fnStoreXappAndCallOpen(mSemanticAttributes, sSelectionVariant);
      }
      return oMyDeferred.promise();
    }

    /**
     * Processes selectionVariant string and returns a Promise object (semanticAttributes and AppStateKey).
     *
     * @param sSelectionVariant Stringified JSON object
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          semanticAttributes as well as the appStateKey are returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * <br>
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 		var oSelectionVariant = new SelectionVariant();
     * 		oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 		oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 		var sSelectionVariant= oSelectionVariant.toJSONString();
     *
     * 		var oNavigationHandler = new NavigationHandler(oController);
     * 		var oPromiseObject = oNavigationHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
     *
     * 		oPromiseObject.done(function(oSemanticAttributes, sAppStateKey){
     * 			// here you can add coding that should run after all app state and the semantic attributes have been returned.
     * 		});
     *
     * 		oPromiseObject.fail(function(oError){
     * 			//some error handling
     * 		});
     *	});
     * </code>
     * @private
     * @ui5-restricted
     */;
    _proto._getAppStateKeyAndUrlParameters = function _getAppStateKeyAndUrlParameters(sSelectionVariant) {
      return this.processBeforeSmartLinkPopoverOpens(undefined, sSelectionVariant, undefined, undefined);
    };
    _proto._mixAttributesToSelVariant = function _mixAttributesToSelVariant(mSemanticAttributes, oSelVariant, iSuppressionBehavior) {
      // add all semantic attributes to the mixed selection variant
      for (const sPropertyName in mSemanticAttributes) {
        if (mSemanticAttributes.hasOwnProperty(sPropertyName)) {
          // A value of a semantic attribute may not be a string, but can be e.g. a date.
          // Since the selection variant accepts only a string, we have to convert it in dependence of the type.
          let vSemanticAttributeValue = mSemanticAttributes[sPropertyName];
          if (vSemanticAttributeValue instanceof Date) {
            // use the same conversion method for dates as the SmartFilterBar: toJSON()
            vSemanticAttributeValue = vSemanticAttributeValue.toJSON();
          } else if (Array.isArray(vSemanticAttributeValue) || vSemanticAttributeValue && typeof vSemanticAttributeValue === "object") {
            vSemanticAttributeValue = JSON.stringify(vSemanticAttributeValue);
          } else if (typeof vSemanticAttributeValue === "number" || typeof vSemanticAttributeValue === "boolean") {
            vSemanticAttributeValue = vSemanticAttributeValue.toString();
          }
          if (vSemanticAttributeValue === "") {
            if (iSuppressionBehavior & SuppressionBehavior.ignoreEmptyString) {
              Log.info("Semantic attribute " + sPropertyName + " is an empty string and due to the chosen Suppression Behiavour is being ignored.");
              continue;
            }
          }
          if (vSemanticAttributeValue === null) {
            if (iSuppressionBehavior & SuppressionBehavior.raiseErrorOnNull) {
              throw new NavError("NavigationHandler.INVALID_INPUT");
            } else {
              Log.warning("Semantic attribute " + sPropertyName + " is null and ignored for mix in to selection variant");
              continue; // ignore!
            }
          }

          if (vSemanticAttributeValue === undefined) {
            if (iSuppressionBehavior & SuppressionBehavior.raiseErrorOnUndefined) {
              throw new NavError("NavigationHandler.INVALID_INPUT");
            } else {
              Log.warning("Semantic attribute " + sPropertyName + " is undefined and ignored for mix in to selection variant");
              continue;
            }
          }
          if (typeof vSemanticAttributeValue === "string" || vSemanticAttributeValue instanceof String) {
            oSelVariant.addSelectOption(sPropertyName, "I", "EQ", vSemanticAttributeValue);
          } else {
            throw new NavError("NavigationHandler.INVALID_INPUT");
          }
        }
      }
      return oSelVariant;
    }

    /**
     * Combines the given parameters and selection variant into a new selection variant containing properties from both, with the parameters
     * overriding existing properties in the selection variant. The new selection variant does not contain any parameters. All parameters are
     * merged into select options. The output of this function, converted to a JSON string, can be used for the
     * {@link #.navigate NavigationHandler.navigate} method.
     *
     * @param vSemanticAttributes Object/(Array of Objects) containing key/value pairs
     * @param sSelectionVariant The selection variant in string format as provided by the SmartFilterBar control
     * @param [iSuppressionBehavior=sap.fe.navigation.SuppressionBehavior.standard] Indicates whether semantic
     *        attributes with special values (see {@link sap.fe.navigation.SuppressionBehavior suppression behavior}) must be
     *        suppressed before they are combined with the selection variant; several
     *        {@link sap.fe.navigation.SuppressionBehavior suppression behaviors} can be combined with the bitwise OR operator
     *        (|)
     * @returns Instance of {@link sap.fe.navigation.SelectionVariant}
     * @public
     * @example <code>
     * sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/fe/navigation/SelectionVariant"], function (NavigationHandler, SelectionVariant) {
     * 	var vSemanticAttributes = { "Customer" : "C0001" };
     * 	or
     * 	var vSemanticAttributes = [{ "Customer" : "C0001" },{ "Customer" : "C0002" }];
     * 	var sSelectionVariant = oSmartFilterBar.getDataSuiteFormat();
     * 	var oNavigationHandler = new NavigationHandler(oController);
     * 	var sNavigationSelectionVariant = oNavigationHandler.mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant).toJSONString();
     * 	// In case of an vSemanticAttributes being an array, the semanticAttributes are merged to a single SV and compared against the sSelectionVariant(second agrument).
     * 	// Optionally, you can specify one or several suppression behaviors. Several suppression behaviors are combined with the bitwise OR operator, e.g.
     * 	// var iSuppressionBehavior = sap.fe.navigation.SuppressionBehavior.raiseErrorOnNull | sap.fe.navigation.SuppressionBehavior.raiseErrorOnUndefined;
     * 	// var sNavigationSelectionVariant = oNavigationHandler.mixAttributesAndSelectionVariant(mSemanticAttributes, sSelectionVariant, iSuppressionBehavior).toJSONString();
     *
     * 	oNavigationHandler.navigate("SalesOrder", "create", sNavigationSelectionVariant);
     * });
     * </code>
     */;
    _proto.mixAttributesAndSelectionVariant = function mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior) {
      const oSelectionVariant = new SelectionVariant(sSelectionVariant);
      const oNewSelVariant = new SelectionVariant();
      const oNavHandler = this;
      const filterUrl = oSelectionVariant.getFilterContextUrl();
      if (filterUrl) {
        oNewSelVariant.setFilterContextUrl(filterUrl);
      }
      const contextUrl = oSelectionVariant.getParameterContextUrl();
      if (contextUrl) {
        oNewSelVariant.setParameterContextUrl(contextUrl);
      }
      if (Array.isArray(vSemanticAttributes)) {
        vSemanticAttributes.forEach(function (mSemanticAttributes) {
          oNavHandler._mixAttributesToSelVariant(mSemanticAttributes, oNewSelVariant, iSuppressionBehavior);
        });
      } else {
        this._mixAttributesToSelVariant(vSemanticAttributes, oNewSelVariant, iSuppressionBehavior);
      }

      // add parameters that are not part of the oNewSelVariant yet
      const aParameters = oSelectionVariant.getParameterNames();
      let i;
      for (i = 0; i < aParameters.length; i++) {
        if (!oNewSelVariant.getSelectOption(aParameters[i])) {
          oNewSelVariant.addSelectOption(aParameters[i], "I", "EQ", oSelectionVariant.getParameter(aParameters[i]));
        }
      }

      // add selOptions that are not part of the oNewSelVariant yet
      const aSelOptionNames = oSelectionVariant.getSelectOptionsPropertyNames();
      for (i = 0; i < aSelOptionNames.length; i++) {
        // add selOptions that are not part of the oNewSelVariant yet
        const aSelectOption = oSelectionVariant.getSelectOption(aSelOptionNames[i]);
        if (!oNewSelVariant.getSelectOption(aSelOptionNames[i])) {
          for (let j = 0; j < aSelectOption.length; j++) {
            oNewSelVariant.addSelectOption(aSelOptionNames[i], aSelectOption[j].Sign, aSelectOption[j].Option, aSelectOption[j].Low, aSelectOption[j].High);
          }
        }
      }
      return oNewSelVariant;
    };
    _proto._ensureSelectionVariantFormatString = function _ensureSelectionVariantFormatString(vSelectionVariant) {
      /*
       * There are legacy AppStates where the SelectionVariant is being stored as a string. However, that is not compliant to the specification,
       * which states that a standard JS object shall be provided. Internally, however, the selectionVariant is always of type string. Situation
       * Persistency internal API ---------------- ------------------ --------------------- legacy string string new approach (JSON) object
       * string
       */

      if (vSelectionVariant === undefined) {
        return undefined;
      }
      let vConvertedSelectionVariant = vSelectionVariant;
      if (typeof vSelectionVariant === "object") {
        vConvertedSelectionVariant = JSON.stringify(vSelectionVariant);
      }
      return vConvertedSelectionVariant;
    };
    _proto._fnHandleAppStatePromise = function _fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError) {
      oReturn.promise.done(function () {
        if (fnOnAfterSave) {
          fnOnAfterSave(oReturn.appStateKey);
        }
      });
      if (fnOnError) {
        const oNavHandler = this;
        oReturn.promise.fail(function () {
          const oError = oNavHandler._createTechnicalError("NavigationHandler.AppStateSave.failed");
          fnOnError(oError);
        });
      }
    };
    _proto._saveAppStateAsync = function _saveAppStateAsync(oAppData, fnOnAfterSave, fnOnError) {
      const oNavHandler = this;
      return this._fnSaveAppStateAsync(oAppData, fnOnError).then(function (oReturn) {
        if (oReturn) {
          oNavHandler._fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError);
          return oReturn.appStateKey;
        }
        return undefined;
      });
    };
    _proto._saveAppState = function _saveAppState(oAppData, fnOnAfterSave, fnOnError) {
      const oReturn = this._saveAppStateWithImmediateReturn(oAppData, fnOnError);
      if (oReturn) {
        this._fnHandleAppStatePromise(oReturn, fnOnAfterSave, fnOnError);
        return oReturn.appStateKey;
      }
      return undefined;
    };
    _proto._fnSaveAppStateWithImmediateReturn = function _fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError) {
      const sAppStateKey = oAppState.getKey();
      const oAppDataForSave = this._fetchAppDataForSave(oAppData, fnOnError);
      if (!oAppDataForSave) {
        return undefined;
      }
      oAppState.setData(oAppDataForSave);
      const oSavePromise = oAppState.save();
      return {
        appStateKey: sAppStateKey,
        promise: oSavePromise.promise()
      };
    };
    _proto._fetchAppDataForSave = function _fetchAppDataForSave(oAppData, fnOnError) {
      let oAppDataForSave = {};
      if (oAppData.hasOwnProperty("selectionVariant")) {
        oAppDataForSave.selectionVariant = oAppData.selectionVariant;
        if (oAppData.selectionVariant) {
          /*
           * The specification states that Selection Variants need to be JSON objects. However, internally, we work with strings for
           * "selectionVariant". Therefore, in case that this is a string, we need to JSON-parse the data.
           */
          if (typeof oAppData.selectionVariant === "string") {
            try {
              oAppDataForSave.selectionVariant = JSON.parse(oAppData.selectionVariant);
            } catch (x) {
              const oError = this._createTechnicalError("NavigationHandler.AppStateSave.parseError");
              if (fnOnError) {
                fnOnError(oError);
              }
              return undefined;
            }
          }
        }
      }
      if (this._sMode === Mode.ODataV2) {
        oAppDataForSave = extend({
          selectionVariant: {},
          tableVariantId: "",
          customData: {}
        }, oAppDataForSave);
        if (oAppData.tableVariantId) {
          oAppDataForSave.tableVariantId = oAppData.tableVariantId;
        }
        if (oAppData.customData) {
          oAppDataForSave.customData = oAppData.customData;
        }
        if (oAppData.presentationVariant) {
          oAppDataForSave.presentationVariant = oAppData.presentationVariant;
        }
        if (oAppData.valueTexts) {
          oAppDataForSave.valueTexts = oAppData.valueTexts;
        }
        if (oAppData.semanticDates) {
          oAppDataForSave.semanticDates = oAppData.semanticDates;
        }
      } else {
        const oAppDataClone = Object.assign({}, oAppData);
        oAppDataForSave = merge(oAppDataClone, oAppDataForSave);
      }
      oAppDataForSave = this._checkIsPotentiallySensitive(oAppDataForSave);
      return oAppDataForSave;
    };
    _proto._fnSaveAppStateAsync = function _fnSaveAppStateAsync(oAppData, fnOnError) {
      const oNavHandler = this;
      return this._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
        return oCrossAppNavService.createEmptyAppStateAsync(oNavHandler.oComponent);
      }).then(function (oAppState) {
        return oNavHandler._fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError);
      }).catch(function (oError) {
        if (fnOnError) {
          fnOnError(oError);
        }
      });
    };
    _proto._saveAppStateWithImmediateReturn = function _saveAppStateWithImmediateReturn(oAppData, fnOnError) {
      const oAppState = this._getAppNavigationService().createEmptyAppState(this.oComponent);
      return this._fnSaveAppStateWithImmediateReturn(oAppData, oAppState, fnOnError);
    }

    /**
     * Retrieves the loaded IApp State and navigation type once resolved.
     *
     * @param sAppStateKey The IAppStateKey to retrieve the AppState data.
     * @param oDeferred Jquery deferred object to resolve the AppState data.
     * @param navType Navigation type for which AppState is retrieved.
     * @returns The deferred object which is resolved with loaded app state data
     and navigation type.
     * @private
     */;
    _proto._loadAppState = function _loadAppState(sAppStateKey, oDeferred, navType) {
      const oNavHandler = this;
      this._getAppNavigationServiceAsync().then(function (oCrossAppNavService) {
        const oAppStatePromise = oCrossAppNavService.getAppState(oNavHandler.oComponent, sAppStateKey);
        oAppStatePromise.done(function (oAppState) {
          let oAppData = {};
          const oAppDataLoaded = oAppState.getData();
          if (typeof oAppDataLoaded === "undefined") {
            const oError = oNavHandler._createTechnicalError("NavigationHandler.getDataFromAppState.failed");
            oDeferred.reject(oError, {}, navType);
          } else if (oNavHandler._sMode === Mode.ODataV2) {
            oAppData = {
              selectionVariant: "{}",
              oSelectionVariant: new SelectionVariant(),
              oDefaultedSelectionVariant: new SelectionVariant(),
              bNavSelVarHasDefaultsOnly: false,
              tableVariantId: "",
              customData: {},
              appStateKey: sAppStateKey,
              presentationVariant: {},
              valueTexts: {},
              semanticDates: {},
              data: {}
            };
            if (oAppDataLoaded.selectionVariant) {
              /*
               * In case that we get an object from the stored AppData (=persistency), we need to stringify the JSON object.
               */
              oAppData.selectionVariant = oNavHandler._ensureSelectionVariantFormatString(oAppDataLoaded.selectionVariant);
              oAppData.oSelectionVariant = new SelectionVariant(oAppData.selectionVariant);
            }
            if (oAppDataLoaded.tableVariantId) {
              oAppData.tableVariantId = oAppDataLoaded.tableVariantId;
            }
            if (oAppDataLoaded.customData) {
              oAppData.customData = oAppDataLoaded.customData;
            }
            if (oAppDataLoaded.presentationVariant) {
              oAppData.presentationVariant = oAppDataLoaded.presentationVariant;
            }
            if (oAppDataLoaded.valueTexts) {
              oAppData.valueTexts = oAppDataLoaded.valueTexts;
            }
            if (oAppDataLoaded.semanticDates) {
              oAppData.semanticDates = oAppDataLoaded.semanticDates;
            }
            /* In V2 case, we need the data in the below format for hybrid case */
            if (navType === NavType.hybrid) {
              oAppData.data = oAppDataLoaded;
            }
          } else {
            oAppData = merge(oAppData, oAppDataLoaded);
            if (oAppDataLoaded.selectionVariant) {
              /*
               * In case that we get an object from the stored AppData (=persistency), we need to stringify the JSON object.
               */
              oAppData.selectionVariant = oNavHandler._ensureSelectionVariantFormatString(oAppDataLoaded.selectionVariant);
              oAppData.oSelectionVariant = new SelectionVariant(oAppData.selectionVariant);
            }
          }

          // resolve is called on passed Deferred object to trigger a call of the done method, if implemented
          // the done method will receive the loaded appState and the navigation type as parameters
          oDeferred.resolve(oAppData, {}, navType);
        });
        oAppStatePromise.fail(function () {
          const oError = oNavHandler._createTechnicalError("NavigationHandler.getAppState.failed");
          oDeferred.reject(oError, {}, navType);
        });
        return oAppStatePromise;
      }).catch(function () {
        const oError = oNavHandler._createTechnicalError("NavigationHandler._getAppNavigationServiceAsync.failed");
        oDeferred.reject(oError, {}, navType);
      });
      return oDeferred;
    }

    /**
     * Retrieves the parameter value of the sap-iapp-state (the internal apps) from the AppHash string. It automatically takes care about
     * compatibility between the old and the new approach of the sap-iapp-state. Precedence is that the new approach is favoured against the old
     * approach.
     *
     * @param sAppHash The AppHash, which may contain a sap-iapp-state parameter (both old and/or new approach)
     * @returns The value of sap-iapp-state (i.e. the name of the container to retrieve the parameters), or <code>undefined</code> in
     *         case that no sap-iapp-state was found in <code>sAppHash</code>.
     * @private
     */;
    _proto._getInnerAppStateKey = function _getInnerAppStateKey(sAppHash) {
      // trivial case: no app hash available at all.
      if (!sAppHash) {
        return undefined;
      }

      /* new approach: separated via question mark / part of the query parameter of the AppHash */
      let aMatches = this._rIAppStateNew.exec(sAppHash);

      /* old approach: spearated via slashes / i.e. part of the route itself */
      if (aMatches === null) {
        aMatches = this._rIAppStateOld.exec(sAppHash);
      }

      /*
       * old approach: special case: if there is no deep route/key defined, the sap-iapp-state may be at the beginning of the string, without
       * any separation with the slashes
       */
      if (aMatches === null) {
        aMatches = this._rIAppStateOldAtStart.exec(sAppHash);
      }
      if (aMatches === null) {
        // there is no (valid) sap-iapp-state in the App Hash
        return undefined;
      }
      return aMatches[1];
    }

    /**
     * Replaces (or inserts) a parameter value (an AppStateKey) for the sap-iapp-state into an existing AppHash string. Other routes/parameters
     * are ignored and returned without modification ("environmental agnostic" property). Only the new approach (sap-iapp-state as query parameter
     * in the AppHash) is being issued.
     *
     * @param sAppHash The AppHash into which the sap-iapp-state parameter shall be made available
     * @param sAppStateKey The key value of the AppState which shall be stored as parameter value of the sap-iapp-state property.
     * @returns The modified sAppHash string, such that the sap-iapp-state has been set based on the new (query option-based)
     *         sap-iapp-state. If a sap-iapp-state has been specified before, the key is replaced. If <code>sAppHash</code> was of the old
     *         format (sap-iapp-state as part of the keys/route), the format is converted to the new format before the result is returned.
     * @private
     */;
    _proto._replaceInnerAppStateKey = function _replaceInnerAppStateKey(sAppHash, sAppStateKey) {
      const sNewIAppState = IAPP_STATE + "=" + sAppStateKey;

      /*
       * generate sap-iapp-states with the new way
       */
      if (!sAppHash) {
        // there's no sAppHash key yet
        return "?" + sNewIAppState;
      }
      const fnAppendToQueryParameter = function (sSubAppHash) {
        // there is an AppHash available, but it does not contain a sap-iapp-state parameter yet - we need to append one

        // new approach: we need to check, if a set of query parameters is already available
        if (sSubAppHash.indexOf("?") !== -1) {
          // there are already query parameters available - append it as another parameter
          return sSubAppHash + "&" + sNewIAppState;
        }
        // there are no a query parameters available yet; create a set with a single parameter
        return sSubAppHash + "?" + sNewIAppState;
      };
      if (!this._getInnerAppStateKey(sAppHash)) {
        return fnAppendToQueryParameter(sAppHash);
      }
      // There is an AppHash available and there is already an sap-iapp-state in the AppHash

      if (this._rIAppStateNew.test(sAppHash)) {
        // the new approach is being used
        return sAppHash.replace(this._rIAppStateNew, function (sNeedle) {
          return sNeedle.replace(/[=].*/gi, "=" + sAppStateKey);
        });
      }

      // we need to remove the old AppHash entirely and replace it with a new one.

      const fnReplaceOldApproach = function (rOldApproach, sSubAppHash) {
        sSubAppHash = sSubAppHash.replace(rOldApproach, "");
        return fnAppendToQueryParameter(sSubAppHash);
      };
      if (this._rIAppStateOld.test(sAppHash)) {
        return fnReplaceOldApproach(this._rIAppStateOld, sAppHash);
      }
      if (this._rIAppStateOldAtStart.test(sAppHash)) {
        return fnReplaceOldApproach(this._rIAppStateOldAtStart, sAppHash);
      }
      assert(false, "internal inconsistency: Approach of sap-iapp-state not known, but _getInnerAppStateKey returned it");
      return undefined;
    };
    _proto._getURLParametersFromSelectionVariant = function _getURLParametersFromSelectionVariant(vSelectionVariant) {
      const mURLParameters = {};
      let i = 0;
      let oSelectionVariant;
      if (typeof vSelectionVariant === "string") {
        oSelectionVariant = new SelectionVariant(vSelectionVariant);
      } else if (typeof vSelectionVariant === "object") {
        oSelectionVariant = vSelectionVariant;
      } else {
        throw new NavError("NavigationHandler.INVALID_INPUT");
      }

      // add URLs parameters from SelectionVariant.SelectOptions (if single value)
      const aSelectProperties = oSelectionVariant.getSelectOptionsPropertyNames();
      for (i = 0; i < aSelectProperties.length; i++) {
        const aSelectOptions = oSelectionVariant.getSelectOption(aSelectProperties[i]);
        if (aSelectOptions.length === 1 && aSelectOptions[0].Sign === "I" && aSelectOptions[0].Option === "EQ") {
          mURLParameters[aSelectProperties[i]] = aSelectOptions[0].Low;
        }
      }

      // add parameters from SelectionVariant.Parameters
      const aParameterNames = oSelectionVariant.getParameterNames();
      for (i = 0; i < aParameterNames.length; i++) {
        const sParameterValue = oSelectionVariant.getParameter(aParameterNames[i]);
        mURLParameters[aParameterNames[i]] = sParameterValue;
      }
      return mURLParameters;
    };
    _proto._createTechnicalError = function _createTechnicalError(sErrorCode) {
      return new NavError(sErrorCode);
    }

    /**
     * Sets the model that is used for verification of sensitive information. If the model is not set, the unnamed component model is used for the
     * verification of sensitive information.
     *
     * @public
     * @param oModel For checking sensitive information
     */;
    _proto.setModel = function setModel(oModel) {
      this._oModel = oModel;
    };
    _proto._getModel = function _getModel() {
      return this._oModel || this.oComponent.getModel();
    };
    _proto._removeAllProperties = function _removeAllProperties(oData) {
      if (oData) {
        if (oData.selectionVariant) {
          oData.selectionVariant = null;
        }
        if (oData.valueTexts) {
          oData.valueTexts = null;
        }
        if (oData.semanticDates) {
          oData.semanticDates = null;
        }
      }
    };
    _proto._removeProperties = function _removeProperties(aFilterName, aParameterName, oData) {
      if (aFilterName.length && oData && (oData.selectionVariant || oData.valueTexts || oData.semanticDates)) {
        aFilterName.forEach(function (sName) {
          if (oData.selectionVariant.SelectOptions) {
            oData.selectionVariant.SelectOptions.some(function (oValue, nIdx) {
              if (sName === oValue.PropertyName) {
                oData.selectionVariant.SelectOptions.splice(nIdx, 1);
                return true;
              }
              return false;
            });
          }
          if (oData.valueTexts && oData.valueTexts.Texts) {
            oData.valueTexts.Texts.forEach(function (oTexts) {
              if (oTexts.PropertyTexts) {
                oTexts.PropertyTexts.some(function (oValue, nIdx) {
                  if (sName === oValue.PropertyName) {
                    oTexts.PropertyTexts.splice(nIdx, 1);
                    return true;
                  }
                  return false;
                });
              }
            });
          }
          if (oData.semanticDates && oData.semanticDates.Dates) {
            oData.semanticDates.Dates.forEach(function (oDates, nIdx) {
              if (sName === oDates.PropertyName) {
                oData.semanticDates.Dates.splice(nIdx, 1);
              }
            });
          }
        });
      }
      if (aParameterName.length && oData && oData.selectionVariant && oData.selectionVariant.Parameters) {
        aParameterName.forEach(function (sName) {
          oData.selectionVariant.Parameters.some(function (oValue, nIdx) {
            if (sName === oValue.PropertyName || "$Parameter." + sName === oValue.PropertyName) {
              oData.selectionVariant.Parameters.splice(nIdx, 1);
              return true;
            }
            return false;
          });
        });
      }
    };
    _proto._isTermTrue = function _isTermTrue(oProperty, sTerm) {
      const fIsTermDefaultTrue = function (oTerm) {
        if (oTerm) {
          return oTerm.Bool ? oTerm.Bool !== "false" : true;
        }
        return false;
      };
      return !!oProperty[sTerm] && fIsTermDefaultTrue(oProperty[sTerm]);
    };
    _proto._isExcludedFromNavigationContext = function _isExcludedFromNavigationContext(oProperty) {
      return this._isTermTrue(oProperty, "com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext");
    };
    _proto._isPotentiallySensitive = function _isPotentiallySensitive(oProperty) {
      return this._isTermTrue(oProperty, "com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive");
    };
    _proto._isMeasureProperty = function _isMeasureProperty(oProperty) {
      return this._isTermTrue(oProperty, "com.sap.vocabularies.Analytics.v1.Measure");
    };
    _proto._isToBeExcluded = function _isToBeExcluded(oProperty) {
      return this._isPotentiallySensitive(oProperty) || this._isExcludedFromNavigationContext(oProperty);
    }

    /**
     * The method creates a context url based on provided data. This context url can either be used as
     * {@link sap.fe.navigation.NavigationHandler#setParameterContextUrl ParameterContextUrl} or
     * {@link sap.fe.navigation.NavigationHandler#setFilterContextUrl FilterContextUrl}.
     *
     * @param sEntitySetName Used for url determination
     * @param [oModel] Used for url determination. If omitted, the NavigationHandler model is used.
     * @throws An instance of {@link sap.fe.navigation.NavError} in case of missing or wrong passed parameters
     * @returns The context url for the given entities
     * @protected
     */;
    _proto.constructContextUrl = function constructContextUrl(sEntitySetName, oModel) {
      if (!sEntitySetName) {
        throw new NavError("NavigationHandler.NO_ENTITY_SET_PROVIDED");
      }
      if (oModel === undefined) {
        oModel = this._getModel();
      }
      return this._constructContextUrl(oModel) + "#" + sEntitySetName;
    };
    _proto._constructContextUrl = function _constructContextUrl(oModel) {
      let sServerUrl;
      if (oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
        sServerUrl = oModel._getServerUrl();
      } else if (oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
        const oServiceURI = new URI(oModel.sServiceUrl).absoluteTo(document.baseURI);
        sServerUrl = new URI("/").absoluteTo(oServiceURI).toString();
      }
      if (sServerUrl && sServerUrl.lastIndexOf("/") === sServerUrl.length - 1) {
        sServerUrl = sServerUrl.substr(0, sServerUrl.length - 1);
      }
      return sServerUrl + oModel.sServiceUrl + "/$metadata";
    }

    /**
     * The method verifies, if any of the passed parameters/filters are marked as sensitive, and if this is the case remove those from the app
     * data. <b>Note:</b> To use this method, the metadata must be loaded first.
     *
     * @param oData With potential sensitive information (for OData, external representation using
     * <code>oSelectionVariant.toJSONObject()</code> must be used), with the <code>FilterContextUrl</code> or
     * <code>ParameterContextUrl</code> property.
     * @returns Data without properties marked as sensitive or an empty object if the OData metadata is not fully loaded yet
     * @private
     */;
    _proto._checkIsPotentiallySensitive = function _checkIsPotentiallySensitive(oData) {
      let oAdaptedData = oData;
      if (oData && oData.selectionVariant && (oData.selectionVariant.FilterContextUrl && oData.selectionVariant.SelectOptions || oData.selectionVariant.ParameterContextUrl && oData.selectionVariant.Parameters)) {
        const oModel = this._getModel();
        if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
          const aSensitiveFilterName = [];
          const aSensitiveParameterName = [];
          let i,
            oEntitySet,
            oEntityDef,
            oSubEntityDef,
            oEndRole,
            aFilterContextPart = [],
            aParamContextPart = [];
          const oMetaModel = oModel.getMetaModel();
          if (oModel.getServiceMetadata() && oMetaModel !== null && oMetaModel !== void 0 && oMetaModel.oModel) {
            if (oData.selectionVariant.FilterContextUrl) {
              aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
            }
            if (aFilterContextPart.length === 2 && oData.selectionVariant.SelectOptions && this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aFilterContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef && oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isToBeExcluded(oEntityDef.property[i])) {
                      aSensitiveFilterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
                if (oEntityDef.navigationProperty) {
                  for (i = 0; i < oEntityDef.navigationProperty.length; i++) {
                    oEndRole = oMetaModel.getODataAssociationEnd(oEntityDef, oEntityDef.navigationProperty[i].name);
                    if (!oEndRole || oEndRole.type === oData.selectionVariant.FilterContextUrl) {
                      continue;
                    }
                    // check if the end role has cardinality 0..1 or 1
                    if (oEndRole.multiplicity === "1" || oEndRole.multiplicity === "0..1") {
                      oSubEntityDef = oMetaModel.getODataEntityType(oEndRole.type);
                      if (oSubEntityDef && oSubEntityDef.property) {
                        for (let j = 0; j < oSubEntityDef.property.length; j++) {
                          if (this._isToBeExcluded(oSubEntityDef.property[j])) {
                            aSensitiveFilterName.push(oEntityDef.navigationProperty[i].name + "." + oSubEntityDef.property[j].name);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (oData.selectionVariant.ParameterContextUrl) {
              aParamContextPart = oData.selectionVariant.ParameterContextUrl.split("#");
            }
            if (aParamContextPart.length === 2 && oData.selectionVariant.Parameters && this._constructContextUrl(oModel).indexOf(aParamContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aParamContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isToBeExcluded(oEntityDef.property[i])) {
                      aSensitiveParameterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
              }
            }
            if (aSensitiveFilterName.length || aSensitiveParameterName.length) {
              oAdaptedData = extend(true, {}, oAdaptedData);
              this._removeProperties(aSensitiveFilterName, aSensitiveParameterName, oAdaptedData);
            }
          } else {
            // annotations are not loaded

            this._removeAllProperties(oAdaptedData);
            Log.error("NavigationHandler: oMetadata are not fully loaded!");
          }
        } else if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
          return this._removeSensitiveDataForODataV4(oAdaptedData);
        }
      }
      return oAdaptedData;
    };
    _proto._removeMeasureBasedInformation = function _removeMeasureBasedInformation(oAppData) {
      let oAppDataForSave = oAppData;
      if (oAppData.selectionVariant) {
        /*
         * The specification states that Selection Variants need to be JSON objects. However, internally, we work with strings for
         * "selectionVariant". Therefore, in case that this is a string, we need to JSON-parse the data.
         */
        if (typeof oAppData.selectionVariant === "string") {
          try {
            oAppDataForSave.selectionVariant = JSON.parse(oAppData.selectionVariant);
          } catch (x) {
            Log.error("NavigationHandler: _removeMeasureBasedInformation parse error");
          }
        }
        oAppDataForSave = this._removeMeasureBasedProperties(oAppDataForSave);
      }
      return oAppDataForSave;
    }

    /**
     * The method verifies if any of the passed parameters/filters are marked as a measure. If this is the case, they are removed from the xapp
     * app data. <b>Note:</b> To use this method, the metadata must be loaded first.
     *
     * @param oData With potential sensitive information (for OData, external representation using
     * <code>oSelectionVariant.toJSONObject()</code> must be used), with the <code>FilterContextUrl</code> or
     * <code>ParameterContextUrl</code> property.
     * @returns Data without properties marked as measures or an empty object if the OData metadata is not fully loaded yet
     * @private
     */;
    _proto._removeMeasureBasedProperties = function _removeMeasureBasedProperties(oData) {
      let oAdaptedData = oData;
      const aMeasureFilterName = [];
      const aMeasureParameterName = [];
      let i,
        oModel,
        oMetaModel,
        oEntitySet,
        oEntityDef,
        oSubEntityDef,
        oEndRole,
        aFilterContextPart = [],
        aParamContextPart = [];
      if (oData && oData.selectionVariant && (oData.selectionVariant.FilterContextUrl && oData.selectionVariant.SelectOptions || oData.selectionVariant.ParameterContextUrl && oData.selectionVariant.Parameters)) {
        oModel = this._getModel();
        if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v2.ODataModel")) {
          oMetaModel = oModel.getMetaModel();
          if (oModel.getServiceMetadata() && oMetaModel && oMetaModel.oModel) {
            if (oData.selectionVariant.FilterContextUrl) {
              aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
            }
            if (aFilterContextPart.length === 2 && oData.selectionVariant.SelectOptions && this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aFilterContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef && oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isMeasureProperty(oEntityDef.property[i])) {
                      aMeasureFilterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
                if (oEntityDef.navigationProperty) {
                  for (i = 0; i < oEntityDef.navigationProperty.length; i++) {
                    oEndRole = oMetaModel.getODataAssociationEnd(oEntityDef, oEntityDef.navigationProperty[i].name);
                    if (!oEndRole || oEndRole.type === oData.selectionVariant.FilterContextUrl) {
                      continue;
                    }
                    // check if the end role has cardinality 0..1 or 1
                    if (oEndRole.multiplicity === "1" || oEndRole.multiplicity === "0..1") {
                      oSubEntityDef = oMetaModel.getODataEntityType(oEndRole.type);
                      if (oSubEntityDef && oSubEntityDef.property) {
                        for (let j = 0; j < oSubEntityDef.property.length; j++) {
                          if (this._isMeasureProperty(oSubEntityDef.property[j])) {
                            aMeasureFilterName.push(oEntityDef.navigationProperty[i].name + "." + oSubEntityDef.property[j].name);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (oData.selectionVariant.ParameterContextUrl) {
              aParamContextPart = oData.selectionVariant.ParameterContextUrl.split("#");
            }
            if (aParamContextPart.length === 2 && oData.selectionVariant.Parameters && this._constructContextUrl(oModel).indexOf(aParamContextPart[0]) === 0) {
              oEntitySet = oMetaModel.getODataEntitySet(aParamContextPart[1]);
              if (oEntitySet) {
                oEntityDef = oMetaModel.getODataEntityType(oEntitySet.entityType);
              } else {
                oEntityDef = oMetaModel.getODataEntityType(aFilterContextPart[1]);
              }
              if (oEntityDef) {
                if (oEntityDef.property) {
                  for (i = 0; i < oEntityDef.property.length; i++) {
                    if (this._isMeasureProperty(oEntityDef.property[i])) {
                      aMeasureParameterName.push(oEntityDef.property[i].name);
                    }
                  }
                }
              }
            }
            if (aMeasureFilterName.length || aMeasureParameterName.length) {
              // TQ: needs attention
              oAdaptedData = extend(true, {}, oAdaptedData);
              this._removeProperties(aMeasureFilterName, aMeasureParameterName, oAdaptedData);
            }
          } else {
            // annotations are not loaded

            this._removeAllProperties(oAdaptedData);
            Log.error("NavigationHandler: oMetadata are not fully loaded!");
          }
        } else if (this.oComponent && oModel && oModel.isA("sap.ui.model.odata.v4.ODataModel")) {
          return this._removeSensitiveDataForODataV4(oAdaptedData, true);
        }
      }
      return oAdaptedData;
    }

    /**
     * Removes sensitive data from the navigation context.
     *
     * @param oData Selection variant
     * @param bMeasure Should measures be removed
     * @returns The selection variant after sensitive data has been removed
     */;
    _proto._removeSensitiveDataForODataV4 = function _removeSensitiveDataForODataV4(oData, bMeasure) {
      var _aFilterContextPart;
      const oNavHandler = this,
        oSV = new SelectionVariant(oData.selectionVariant),
        oModel = this._getModel();
      let aFilterContextPart;
      if (!oModel.getMetaModel().getObject("/")) {
        // annotations are not loaded
        this._removeAllProperties(oData);
        Log.error("NavigationHandler: oMetadata are not fully loaded!");
        return oData;
      }
      if (oData.selectionVariant.FilterContextUrl) {
        aFilterContextPart = oData.selectionVariant.FilterContextUrl.split("#");
      }
      if (((_aFilterContextPart = aFilterContextPart) === null || _aFilterContextPart === void 0 ? void 0 : _aFilterContextPart.length) === 2 && oData.selectionVariant.SelectOptions && this._constructContextUrl(oModel).indexOf(aFilterContextPart[0]) === 0) {
        oSV.removeSelectOption("@odata.context");
        oSV.removeSelectOption("@odata.metadataEtag");
        oSV.removeSelectOption("SAP__Messages");
        const sEntitySet = aFilterContextPart[1],
          oMetaModel = oModel.getMetaModel(),
          aPropertyNames = oSV.getPropertyNames() || [],
          fnIsSensitiveData = function (sProp, esName) {
            esName = esName || sEntitySet;
            const aPropertyAnnotations = oMetaModel.getObject("/" + esName + "/" + sProp + "@");
            if (aPropertyAnnotations) {
              if (bMeasure && aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"] || oNavHandler._checkPropertyAnnotationsForSensitiveData(aPropertyAnnotations)) {
                return true;
              } else if (aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"]) {
                const oFieldControl = aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
                if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") {
                  return true;
                }
              }
            }
            return false;
          };
        for (let k = 0; k < aPropertyNames.length; k++) {
          const sProperty = aPropertyNames[k];
          // properties of the entity set
          if (fnIsSensitiveData(sProperty, sEntitySet)) {
            oSV.removeSelectOption(sProperty);
          }
        }
        oData.selectionVariant = oSV.toJSONObject();
      }
      return oData;
    };
    _proto._checkPropertyAnnotationsForSensitiveData = function _checkPropertyAnnotationsForSensitiveData(aPropertyAnnotations) {
      return aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"];
    }

    /**
     * Retrieves the parameter value of the sap-iapp-state (the internal apps) from the AppHash string. It automatically takes care about
     * compatibility between the old and the new approach of the sap-iapp-state. Precedence is that the new approach is favoured against the old
     * approach.
     *
     * @returns The value of sap-iapp-state (i.e. the name of the container to retrieve the parameters), or <code>undefined</code> in
     *         case that no sap-iapp-state was found in <code>sAppHash</code>.
     * @private
     */;
    _proto.getIAppStateKey = function getIAppStateKey() {
      const sAppHash = HashChanger.getInstance().getHash();
      return this._getInnerAppStateKey(sAppHash);
    };
    return NavigationHandler;
  }(BaseObject); // Exporting the class as properly typed UI5Class
  _exports.NavigationHandler = NavigationHandler;
  const NavigationHandlerUI5Class = BaseObject.extend("sap.fe.navigation.NavigationHandler", NavigationHandler.prototype);
  return NavigationHandlerUI5Class;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZUeXBlIiwiTmF2TGlicmFyeSIsIlBhcmFtSGFuZGxpbmdNb2RlIiwiU3VwcHJlc3Npb25CZWhhdmlvciIsIk1vZGUiLCJJQVBQX1NUQVRFIiwiREVGQVVMVEVEX1BBUkFNRVRFUl9QUk9QRVJUWSIsIkhZQlJJRF9JQVBQX1NUQVRFX0tFWSIsIk5hdmlnYXRpb25IYW5kbGVyIiwib0NvbnRyb2xsZXIiLCJzTW9kZSIsInNQYXJhbUhhbmRsaW5nTW9kZSIsIl9hVGVjaG5pY2FsUGFyYW1hdGVycyIsIl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhIiwic0FwcFN0YXRlS2V5Iiwib0FwcERhdGEiLCJpQ2FjaGVIaXQiLCJpQ2FjaGVNaXNzIiwiX3JJQXBwU3RhdGVPbGQiLCJSZWdFeHAiLCJfcklBcHBTdGF0ZU9sZEF0U3RhcnQiLCJfcklBcHBTdGF0ZU5ldyIsIk5hdkVycm9yIiwiVUlDb21wb25lbnQiLCJvUm91dGVyIiwiZ2V0Um91dGVyIiwib0NvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50IiwiX2dldFJvdXRlciIsImdldEFwcENvbXBvbmVudCIsImdldENvbXBvbmVudERhdGEiLCJVUkxQYXJhbVdpbnMiLCJJbnNlcnRJblNlbE9wdCIsIlNlbFZhcldpbnMiLCJPRGF0YVYyIiwiX3NNb2RlIiwiX2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwiZ2V0U2VydmljZSIsIl9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZUFzeW5jIiwiZ2V0U2VydmljZUFzeW5jIiwidGhlbiIsIm9Dcm9zc0FwcE5hdlNlcnZpY2UiLCJjYXRjaCIsIkxvZyIsImVycm9yIiwiZ2V0Um91dGVyRm9yIiwicmVnaXN0ZXJOYXZpZ2F0ZUNhbGxiYWNrIiwiZm5DYWxsYmFjayIsIl9uYXZpZ2F0ZUNhbGxiYWNrIiwibmF2aWdhdGUiLCJzU2VtYW50aWNPYmplY3QiLCJzQWN0aW9uTmFtZSIsInZOYXZpZ2F0aW9uUGFyYW1ldGVycyIsIm9Jbm5lckFwcERhdGEiLCJmbk9uRXJyb3IiLCJvRXh0ZXJuYWxBcHBEYXRhIiwic05hdk1vZGUiLCJzU2VsZWN0aW9uVmFyaWFudCIsIm1QYXJhbWV0ZXJzIiwib1hBcHBEYXRhT2JqIiwib1N0YXJ0dXBQYXJhbWV0ZXJzIiwiYkV4UGxhY2UiLCJvVG1wRGF0YSIsIm9OYXZIYW5kbGVyIiwib0NvbXBvbmVudERhdGEiLCJzdGFydHVwUGFyYW1ldGVycyIsImxlbmd0aCIsInVuZGVmaW5lZCIsIm9FbnJpY2hlZFNlbFZhciIsIl9zcGxpdEluYm91bmROYXZpZ2F0aW9uUGFyYW1ldGVycyIsIlNlbGVjdGlvblZhcmlhbnQiLCJvTmF2aWdhdGlvblNlbFZhciIsInRvSlNPTlN0cmluZyIsInNlbGVjdGlvblZhcmlhbnQiLCJfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyIsInRvSlNPTk9iamVjdCIsIl9yZW1vdmVNZWFzdXJlQmFzZWRJbmZvcm1hdGlvbiIsIl9jaGVja0lzUG90ZW50aWFsbHlTZW5zaXRpdmUiLCJfZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50Iiwib05hdkFyZ3VtZW50cyIsInRhcmdldCIsInNlbWFudGljT2JqZWN0IiwiYWN0aW9uIiwicGFyYW1zIiwiZm5OYXZpZ2F0ZSIsImZuTmF2RXhwbGFjZSIsInNOZXdIcmVmUHJvbWlzZSIsImhyZWZGb3JFeHRlcm5hbEFzeW5jIiwic05ld0hyZWYiLCJvcGVuV2luZG93Iiwib0Vycm9yIiwiX2ZuU2F2ZUFwcFN0YXRlQXN5bmMiLCJvU2F2ZUFwcFN0YXRlUmV0dXJuIiwiYXBwU3RhdGVLZXkiLCJwdG9FeHQiLCJ0b0V4dGVybmFsIiwiZm5TdG9yZUFuZE5hdmlnYXRlIiwic3RvcmVJbm5lckFwcFN0YXRlQXN5bmMiLCJyZXBsYWNlSGFzaCIsIm9TdXBwb3J0ZWRQcm9taXNlIiwiaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIiwiZG9uZSIsIm9UYXJnZXRzIiwic3VwcG9ydGVkIiwiZmFpbCIsIl9jcmVhdGVUZWNobmljYWxFcnJvciIsInBhcnNlTmF2aWdhdGlvbiIsInNBcHBIYXNoIiwiSGFzaENoYW5nZXIiLCJnZXRJbnN0YW5jZSIsImdldEhhc2giLCJzSUFwcFN0YXRlIiwiX2dldElubmVyQXBwU3RhdGVLZXkiLCJ3YXJuaW5nIiwiaHlicmlkSUFwcFN0YXRlS2V5UGFyYW1zIiwiaHlicmlkRGVmZXJyZWQiLCJqUXVlcnkiLCJEZWZlcnJlZCIsImlBcHBTdGF0ZUh5YnJpZERlZmVycmVkIiwiX2xvYWRBcHBTdGF0ZSIsImh5YnJpZCIsImFEZWZhdWx0ZWRQYXJhbWV0ZXJzIiwiSlNPTiIsInBhcnNlIiwib015RGVmZXJyZWQiLCJwYXJzZVVybFBhcmFtcyIsIm9TdWJTdGFydHVwUGFyYW1ldGVycyIsImFTdWJEZWZhdWx0ZWRQYXJhbWV0ZXJzIiwib1N1Yk15RGVmZXJyZWQiLCJzTmF2VHlwZSIsIm9TZWxWYXJzIiwiaXNFbXB0eSIsIm9EZWZhdWx0ZWRTZWxWYXIiLCJ4QXBwU3RhdGUiLCJyZWplY3QiLCJyZXNvbHZlIiwiaW5pdGlhbCIsIm9BcHBTdGF0ZURhdGEiLCJvU2VsZWN0aW9uVmFyaWFudCIsIm9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50IiwiYk5hdlNlbFZhckhhc0RlZmF1bHRzT25seSIsInN1Y2Nlc3NIYW5kbGVySHlicmlkU3RhdGUiLCJpQXBwU3RhdGVEYXRhIiwiX3JlZiIsIm5hdlR5cGUiLCJpQXBwU3RhdGUiLCJmYWlsdXJlSGFuZGxlckh5YnJpZFN0YXRlIiwiYklzWGFwcFN0YXRlTmF2aWdhdGlvbiIsInRoYXQiLCJvU3RhcnR1cFByb21pc2UiLCJnZXRTdGFydHVwQXBwU3RhdGUiLCJvQXBwU3RhdGUiLCJnZXREYXRhIiwic3RyaW5naWZ5IiwieCIsInByb21pc2UiLCJvU2VsVmFyIiwiVVJMUGFyYW1zIiwic2V0VGVjaG5pY2FsUGFyYW1ldGVycyIsImFUZWNobmljYWxQYXJhbWV0ZXJzIiwiQXJyYXkiLCJpc0FycmF5IiwiZ2V0VGVjaG5pY2FsUGFyYW1ldGVycyIsImNvbmNhdCIsIl9pc1RlY2huaWNhbFBhcmFtZXRlciIsInNQYXJhbWV0ZXJOYW1lIiwidG9Mb3dlckNhc2UiLCJpbmRleE9mIiwiX2lzRkVQYXJhbWV0ZXIiLCJzUHJvcE5hbWUiLCJpIiwiYVNlbFZhclByb3BOYW1lcyIsImdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzIiwicmVtb3ZlU2VsZWN0T3B0aW9uIiwib1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWQiLCJoYXNPd25Qcm9wZXJ0eSIsImdldFBhcmFtZXRlck5hbWVzIiwibWFzc0FkZFNlbGVjdE9wdGlvbiIsImdldFZhbHVlIiwiX2FkZFBhcmFtZXRlclZhbHVlcyIsImFQcm9wTmFtZXMiLCJvU2VsVmFyaWFudCIsInNTaWduIiwic09wdGlvbiIsIm9WYWx1ZXMiLCJhZGRTZWxlY3RPcHRpb24iLCJvSGFzaENoYW5nZXIiLCJzQXBwSGFzaE9sZCIsInNBcHBIYXNoTmV3IiwiX3JlcGxhY2VJbm5lckFwcFN0YXRlS2V5IiwibUlubmVyQXBwRGF0YSIsImJJbW1lZGlhdGVIYXNoUmVwbGFjZSIsImJTa2lwSGFzaFJlcGxhY2UiLCJmblJlcGxhY2VIYXNoIiwiaXNFbXB0eU9iamVjdCIsInNBcHBTdGF0ZUtleUNhY2hlZCIsImJJbm5lckFwcERhdGFFcXVhbCIsImZuT25BZnRlclNhdmUiLCJfc2F2ZUFwcFN0YXRlQXN5bmMiLCJzdG9yZUlubmVyQXBwU3RhdGUiLCJfc2F2ZUFwcFN0YXRlIiwic3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybiIsIm9BcHBTdGF0ZVByb21pc2UiLCJwcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zIiwib1RhYmxlRXZlbnRQYXJhbWV0ZXJzIiwibVNlbWFudGljQXR0cmlidXRlcyIsInNlbWFudGljQXR0cmlidXRlcyIsImZuU3RvcmVYYXBwQW5kQ2FsbE9wZW4iLCJtU3ViU2VtYW50aWNBdHRyaWJ1dGVzIiwic1N1YlNlbGVjdGlvblZhcmlhbnQiLCJpU3VwcHJlc3Npb25CZWhhdmlvciIsInJhaXNlRXJyb3JPbk51bGwiLCJyYWlzZUVycm9yT25VbmRlZmluZWQiLCJvTWl4ZWRTZWxWYXIiLCJtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCIsImZuT25Db250YWluZXJTYXZlIiwic2V0U2VtYW50aWNBdHRyaWJ1dGVzIiwic2V0QXBwU3RhdGVLZXkiLCJvcGVuIiwib1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UiLCJfZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIiwiX21peEF0dHJpYnV0ZXNUb1NlbFZhcmlhbnQiLCJzUHJvcGVydHlOYW1lIiwidlNlbWFudGljQXR0cmlidXRlVmFsdWUiLCJEYXRlIiwidG9KU09OIiwidG9TdHJpbmciLCJpZ25vcmVFbXB0eVN0cmluZyIsImluZm8iLCJTdHJpbmciLCJ2U2VtYW50aWNBdHRyaWJ1dGVzIiwib05ld1NlbFZhcmlhbnQiLCJmaWx0ZXJVcmwiLCJnZXRGaWx0ZXJDb250ZXh0VXJsIiwic2V0RmlsdGVyQ29udGV4dFVybCIsImNvbnRleHRVcmwiLCJnZXRQYXJhbWV0ZXJDb250ZXh0VXJsIiwic2V0UGFyYW1ldGVyQ29udGV4dFVybCIsImZvckVhY2giLCJhUGFyYW1ldGVycyIsImdldFNlbGVjdE9wdGlvbiIsImdldFBhcmFtZXRlciIsImFTZWxPcHRpb25OYW1lcyIsImFTZWxlY3RPcHRpb24iLCJqIiwiU2lnbiIsIk9wdGlvbiIsIkxvdyIsIkhpZ2giLCJfZW5zdXJlU2VsZWN0aW9uVmFyaWFudEZvcm1hdFN0cmluZyIsInZTZWxlY3Rpb25WYXJpYW50IiwidkNvbnZlcnRlZFNlbGVjdGlvblZhcmlhbnQiLCJfZm5IYW5kbGVBcHBTdGF0ZVByb21pc2UiLCJvUmV0dXJuIiwiX3NhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4iLCJfZm5TYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuIiwiZ2V0S2V5Iiwib0FwcERhdGFGb3JTYXZlIiwiX2ZldGNoQXBwRGF0YUZvclNhdmUiLCJzZXREYXRhIiwib1NhdmVQcm9taXNlIiwic2F2ZSIsImV4dGVuZCIsInRhYmxlVmFyaWFudElkIiwiY3VzdG9tRGF0YSIsInByZXNlbnRhdGlvblZhcmlhbnQiLCJ2YWx1ZVRleHRzIiwic2VtYW50aWNEYXRlcyIsIm9BcHBEYXRhQ2xvbmUiLCJPYmplY3QiLCJhc3NpZ24iLCJtZXJnZSIsImNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYyIsImNyZWF0ZUVtcHR5QXBwU3RhdGUiLCJvRGVmZXJyZWQiLCJnZXRBcHBTdGF0ZSIsIm9BcHBEYXRhTG9hZGVkIiwiZGF0YSIsImFNYXRjaGVzIiwiZXhlYyIsInNOZXdJQXBwU3RhdGUiLCJmbkFwcGVuZFRvUXVlcnlQYXJhbWV0ZXIiLCJzU3ViQXBwSGFzaCIsInRlc3QiLCJyZXBsYWNlIiwic05lZWRsZSIsImZuUmVwbGFjZU9sZEFwcHJvYWNoIiwick9sZEFwcHJvYWNoIiwiYXNzZXJ0IiwibVVSTFBhcmFtZXRlcnMiLCJhU2VsZWN0UHJvcGVydGllcyIsImFTZWxlY3RPcHRpb25zIiwiYVBhcmFtZXRlck5hbWVzIiwic1BhcmFtZXRlclZhbHVlIiwic0Vycm9yQ29kZSIsInNldE1vZGVsIiwib01vZGVsIiwiX29Nb2RlbCIsIl9nZXRNb2RlbCIsImdldE1vZGVsIiwiX3JlbW92ZUFsbFByb3BlcnRpZXMiLCJvRGF0YSIsIl9yZW1vdmVQcm9wZXJ0aWVzIiwiYUZpbHRlck5hbWUiLCJhUGFyYW1ldGVyTmFtZSIsInNOYW1lIiwiU2VsZWN0T3B0aW9ucyIsInNvbWUiLCJvVmFsdWUiLCJuSWR4IiwiUHJvcGVydHlOYW1lIiwic3BsaWNlIiwiVGV4dHMiLCJvVGV4dHMiLCJQcm9wZXJ0eVRleHRzIiwiRGF0ZXMiLCJvRGF0ZXMiLCJQYXJhbWV0ZXJzIiwiX2lzVGVybVRydWUiLCJvUHJvcGVydHkiLCJzVGVybSIsImZJc1Rlcm1EZWZhdWx0VHJ1ZSIsIm9UZXJtIiwiQm9vbCIsIl9pc0V4Y2x1ZGVkRnJvbU5hdmlnYXRpb25Db250ZXh0IiwiX2lzUG90ZW50aWFsbHlTZW5zaXRpdmUiLCJfaXNNZWFzdXJlUHJvcGVydHkiLCJfaXNUb0JlRXhjbHVkZWQiLCJjb25zdHJ1Y3RDb250ZXh0VXJsIiwic0VudGl0eVNldE5hbWUiLCJfY29uc3RydWN0Q29udGV4dFVybCIsInNTZXJ2ZXJVcmwiLCJpc0EiLCJfZ2V0U2VydmVyVXJsIiwib1NlcnZpY2VVUkkiLCJVUkkiLCJzU2VydmljZVVybCIsImFic29sdXRlVG8iLCJkb2N1bWVudCIsImJhc2VVUkkiLCJsYXN0SW5kZXhPZiIsInN1YnN0ciIsIm9BZGFwdGVkRGF0YSIsIkZpbHRlckNvbnRleHRVcmwiLCJQYXJhbWV0ZXJDb250ZXh0VXJsIiwiYVNlbnNpdGl2ZUZpbHRlck5hbWUiLCJhU2Vuc2l0aXZlUGFyYW1ldGVyTmFtZSIsIm9FbnRpdHlTZXQiLCJvRW50aXR5RGVmIiwib1N1YkVudGl0eURlZiIsIm9FbmRSb2xlIiwiYUZpbHRlckNvbnRleHRQYXJ0IiwiYVBhcmFtQ29udGV4dFBhcnQiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiZ2V0U2VydmljZU1ldGFkYXRhIiwic3BsaXQiLCJnZXRPRGF0YUVudGl0eVNldCIsImdldE9EYXRhRW50aXR5VHlwZSIsImVudGl0eVR5cGUiLCJwcm9wZXJ0eSIsInB1c2giLCJuYW1lIiwibmF2aWdhdGlvblByb3BlcnR5IiwiZ2V0T0RhdGFBc3NvY2lhdGlvbkVuZCIsInR5cGUiLCJtdWx0aXBsaWNpdHkiLCJfcmVtb3ZlU2Vuc2l0aXZlRGF0YUZvck9EYXRhVjQiLCJfcmVtb3ZlTWVhc3VyZUJhc2VkUHJvcGVydGllcyIsImFNZWFzdXJlRmlsdGVyTmFtZSIsImFNZWFzdXJlUGFyYW1ldGVyTmFtZSIsImJNZWFzdXJlIiwib1NWIiwiZ2V0T2JqZWN0Iiwic0VudGl0eVNldCIsImFQcm9wZXJ0eU5hbWVzIiwiZ2V0UHJvcGVydHlOYW1lcyIsImZuSXNTZW5zaXRpdmVEYXRhIiwic1Byb3AiLCJlc05hbWUiLCJhUHJvcGVydHlBbm5vdGF0aW9ucyIsIl9jaGVja1Byb3BlcnR5QW5ub3RhdGlvbnNGb3JTZW5zaXRpdmVEYXRhIiwib0ZpZWxkQ29udHJvbCIsImsiLCJzUHJvcGVydHkiLCJnZXRJQXBwU3RhdGVLZXkiLCJCYXNlT2JqZWN0IiwiTmF2aWdhdGlvbkhhbmRsZXJVSTVDbGFzcyIsInByb3RvdHlwZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTmF2aWdhdGlvbkhhbmRsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGFzc2VydCBmcm9tIFwic2FwL2Jhc2UvYXNzZXJ0XCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBleHRlbmQgZnJvbSBcInNhcC9iYXNlL3V0aWwvZXh0ZW5kXCI7XG5pbXBvcnQgaXNFbXB0eU9iamVjdCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9pc0VtcHR5T2JqZWN0XCI7XG5pbXBvcnQgbWVyZ2UgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCBCYXNlT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9PYmplY3RcIjtcbmltcG9ydCB0eXBlIENvbnRyb2xsZXIgZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyXCI7XG5pbXBvcnQgSGFzaENoYW5nZXIgZnJvbSBcInNhcC91aS9jb3JlL3JvdXRpbmcvSGFzaENoYW5nZXJcIjtcbmltcG9ydCBVSUNvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvVUlDb21wb25lbnRcIjtcbmltcG9ydCBWMk9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92Mi9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgVjRPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IFVSSSBmcm9tIFwic2FwL3VpL3RoaXJkcGFydHkvVVJJXCI7XG5pbXBvcnQgb3BlbldpbmRvdyBmcm9tIFwic2FwL3VpL3V0aWwvb3BlbldpbmRvd1wiO1xuaW1wb3J0IE5hdkxpYnJhcnkgZnJvbSBcIi4vbGlicmFyeVwiO1xuaW1wb3J0IE5hdkVycm9yIGZyb20gXCIuL05hdkVycm9yXCI7XG5pbXBvcnQgdHlwZSB7IFNlcmlhbGl6ZWRTZWxlY3Rpb25WYXJpYW50IH0gZnJvbSBcIi4vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IFNlbGVjdGlvblZhcmlhbnQgZnJvbSBcIi4vU2VsZWN0aW9uVmFyaWFudFwiO1xuXG4vKipcbiAqIFN0cnVjdHVyZSBvZiBzdG9yZWQgYXBwIHN0YXRlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIElubmVyQXBwRGF0YSB7XG5cdFtrZXk6IHN0cmluZ106IHVua25vd247XG5cdC8qKlxuXHQgKiBTcmluZ2lmaWVkIEpTT04gb2JqZWN0IGFzIHJldHVybmVkLCBmb3IgZXhhbXBsZSwgZnJvbSBnZXREYXRhU3VpdGVGb3JtYXQoKSBvZiB0aGUgU21hcnRGaWx0ZXJCYXIgY29udHJvbFxuXHQgKi9cblx0c2VsZWN0aW9uVmFyaWFudD86IHN0cmluZztcblxuXHQvKipcblx0ICogSUQgb2YgdGhlIFNtYXJ0VGFibGUgdmFyaWFudC5cblx0ICovXG5cdHRhYmxlVmFyaWFudElkPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBPYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBzdG9yZSBhcmJpdHJhcnkgZGF0YS5cblx0ICovXG5cdGN1c3RvbURhdGE/OiBvYmplY3Q7XG5cblx0LyoqXG5cdCAqIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHVpIHN0YXRlIG9mIHRoZSBhcHAuXG5cdCAqL1xuXHRwcmVzZW50YXRpb25WYXJpYW50Pzogb2JqZWN0O1xuXG5cdC8qKlxuXHQgKiBPYmplY3QgY29udGFpbmluZyB2YWx1ZSBkZXNjcmlwdGlvbnMuXG5cdCAqL1xuXHR2YWx1ZVRleHRzPzogb2JqZWN0O1xuXG5cdC8qKlxuXHQgKiBPYmplY3QgY29udGFpbmluZyBzZW1hbnRpY0RhdGVzIGZpbHRlciBpbmZvcm1hdGlvbi5cblx0ICovXG5cdHNlbWFudGljRGF0ZXM/OiBvYmplY3Q7XG59XG5cbi8vIHNob3J0Y3V0cyBmb3Igc2FwLnVpLmdlbmVyaWMuYXBwIGVudW1zXG5jb25zdCBOYXZUeXBlID0gTmF2TGlicmFyeS5OYXZUeXBlO1xuY29uc3QgUGFyYW1IYW5kbGluZ01vZGUgPSBOYXZMaWJyYXJ5LlBhcmFtSGFuZGxpbmdNb2RlO1xuY29uc3QgU3VwcHJlc3Npb25CZWhhdmlvciA9IE5hdkxpYnJhcnkuU3VwcHJlc3Npb25CZWhhdmlvcjtcbmNvbnN0IE1vZGUgPSBOYXZMaWJyYXJ5Lk1vZGU7XG5cbmNvbnN0IElBUFBfU1RBVEUgPSBcInNhcC1pYXBwLXN0YXRlXCI7XG5jb25zdCBERUZBVUxURURfUEFSQU1FVEVSX1BST1BFUlRZID0gXCJzYXAtdXNoZWxsLWRlZmF1bHRlZFBhcmFtZXRlck5hbWVzXCI7XG5jb25zdCBIWUJSSURfSUFQUF9TVEFURV9LRVkgPSBcIm5oSHlicmlkSUFwcFN0YXRlS2V5XCI7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgc3VjY2Vzc29yIG9mIHtAbGluayBzYXAudWkuZ2VuZXJpYy5hcHAubmF2aWdhdGlvbi5zZXJ2aWNlLk5hdmlnYXRpb25IYW5kbGVyfS48YnI+IENyZWF0ZXMgYSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIgY2xhc3MgYnkgcHJvdmlkaW5nIHRoZSByZXF1aXJlZCBlbnZpcm9ubWVudC4gPGJyPlxuICogVGhlIDxjb2RlPk5hdmlnYXRpb25IYW5kbGVyPC9jb2RlPiBzdXBwb3J0cyB0aGUgdmVyaWZpY2F0aW9uIG9mIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbi4gQWxsIHByb3BlcnRpZXMgdGhhdCBhcmUgcGFydCBvZlxuICogPGNvZGU+c2VsZWN0aW9uVmFyaWFudDwvY29kZT4gYW5kIDxjb2RlPnZhbHVlVGV4dHM8L2NvZGU+IHdpbGwgYmUgdmVyaWZpZWQgaWYgdGhleSBhcmUgYW5ub3RhdGVkIGFzXG4gKiA8Y29kZT5jb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZTwvY29kZT4gb3JcbiAqIDxjb2RlPmNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkV4Y2x1ZGVGcm9tTmF2aWdhdGlvbkNvbnRleHQ8L2NvZGU+IGFuZCB3aWxsIGJlIHJlbW92ZWQgYmVmb3JlIHRoZSBkYXRhIGlzIHBlcnNpc3RlZCBhcyB0aGUgYXBwXG4gKiBzdGF0ZS48YnI+XG4gKiBBbHNvLCBhbGwgcHJvcGVydGllcyBhbm5vdGF0ZWQgYXMgPGNvZGU+Y29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLk1lYXN1cmU8L2NvZGU+IHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBkYXRhIHN0b3JlZCBhcyB0aGVcbiAqIHhhcHAgc3RhdGUuPGJyPlxuICogVG8gdmVyaWZ5IHRoZSBpbmZvcm1hdGlvbiB0byBiZSByZW1vdmVkLCB0aGUgPGNvZGU+TmF2aWdhdGlvbkhhbmRsZXI8L2NvZGU+IHJlcXVpcmVzIGFuIHVubmFtZWQgbW9kZWwgb2YgdHlwZVxuICoge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52Mi5PRGF0YU1vZGVsfSBvbiBjb21wb25lbnQgbGV2ZWwuIEl0IGlzIHBvc3NpYmxlIHRvIHNldCBzdWNoIGEgbW9kZWwgdXNpbmcgdGhlIDxjb2RlPnNldE1vZGVsPC9jb2RlPlxuICogbWV0aG9kLjxicj5cbiAqIDxiPk5vdGU6PC9iPiBUaGUgY2hlY2sgZm9yIGV4Y2x1ZGVkIGRhdGEgcmVxdWlyZXMgdGhhdCB0aGUgT0RhdGEgbWV0YWRhdGEgaGFzIGFscmVhZHkgYmVlbiBsb2FkZWQgY29tcGxldGVseS48YnI+XG4gKiBJZiB0aGUgT0RhdGEgbWV0YWRhdGEgbW9kZWwgaGFzIG5vdCBiZWVuIGxvYWRlZCBjb21wbGV0ZWx5LCBhbGwgcHJvcGVydGllcyBhcmUgcmVtb3ZlZCBmcm9tIHRoZSBhcHBsaWNhdGlvbiBjb250ZXh0Ljxicj5cbiAqIDxiPk5vdGU6PC9iPiBUaGlzIGNsYXNzIHJlcXVpcmVzIHRoYXQgdGhlIFVTaGVsbCB7QGxpbmsgc2FwLnVzaGVsbC5zZXJ2aWNlcy5Dcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvbn0gaXMgYXZhaWxhYmxlIGFuZCBpbml0aWFsaXplZC5cbiAqXG4gKiBAcHVibGljXG4gKiBAY2xhc3NcbiAqIEBleHRlbmRzIHNhcC51aS5iYXNlLk9iamVjdFxuICogQHNpbmNlIDEuODMuMFxuICogQG5hbWUgc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXJcbiAqL1xuZXhwb3J0IGNsYXNzIE5hdmlnYXRpb25IYW5kbGVyIGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdHByaXZhdGUgb1JvdXRlcjogYW55O1xuXG5cdHByaXZhdGUgb0NvbXBvbmVudDogYW55O1xuXG5cdHByaXZhdGUgX29Nb2RlbDogYW55O1xuXG5cdHByaXZhdGUgc1BhcmFtSGFuZGxpbmdNb2RlOiBzdHJpbmc7XG5cblx0cHJpdmF0ZSBfc01vZGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHQvLyBsaXN0IG9mIHRlY2huaWNhbCBwYXJhbWV0ZXJzXG5cdHByaXZhdGUgX2FUZWNobmljYWxQYXJhbWF0ZXJzID0gW1wiaGNwQXBwbGljYXRpb25JZFwiXTtcblxuXHRwcml2YXRlIF9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhOiBhbnkgPSB7XG5cdFx0c0FwcFN0YXRlS2V5OiBcIlwiLFxuXHRcdG9BcHBEYXRhOiB7fSxcblx0XHRpQ2FjaGVIaXQ6IDAsXG5cdFx0aUNhY2hlTWlzczogMFxuXHR9O1xuXG5cdC8qXG5cdCAqIFRoZXJlIGV4aXN0cyBhIGdlbmVyYXRpb24gb2YgXCJvbGRcIiBzYXAtaWFwcC1zdGF0ZXMgd2hpY2ggYXJlIGJhc2VkIG9uIHRoZSBmb2xsb3dpbmcgVVJMIHNjaGVtYTpcblx0ICogI1NlbU9iai1hY3Rpb24mL3JvdXRlL3NhcC1pYXBwLXN0YXRlPUFCQzEyMzQ1Njc4IFRoZSBuZXcgVVJMIHNjaGVtYSBpczogI1NlbU9iai1hY3Rpb24mL3JvdXRlP3NhcC1pYXBwLXN0YXRlPUFCQzEyMzQ1Njc4IChtaW5kIHRoZVxuXHQgKiBkaWZmZXJlbmNlIGJldHdlZW4gLyBhbmQgPyBhYm92ZSksIGkuZS4gdGhlIHNhcC1pYXBwLXN0YXRlIGhhcyBiZWNvbWUgYSBwYXJhbWV0ZXIgb2YgdGhlIHF1ZXJ5IHBhcmFtZXRlciBzZWN0aW9uIGluIHRoZSBBcHBIYXNoIHN0cmluZy5cblx0ICogWWV0LCB0aGlzIHRvb2wgc2hhbGwgYmUgYWJsZSB0byBkZWFsIGV2ZW4gd2l0aCBvbGQgc2FwLWlhcHAtc3RhdGVzLiBUaGVyZWZvcmUsIHdlIHVzZSB0d28gUmVndWxhciBFeHByZXNzaW9ucyAocklBcHBTdGF0ZU9sZCBhbmRcblx0ICogcklBcHBTdGF0ZU9sZEF0U3RhcnQpIGFzIGRlZmluZWQgYmVsb3cgdG8gc2NhbiBmb3IgdGhlc2Ugb2xkIHZhcmlhbnRzLiBUaGUgbmV3IHZhcmlhbnQgaXMgYmVpbmcgc2Nhbm5lZCB1c2luZyBySUFwcFN0YXRlTmV3IGFzIFJlZ3VsYXJcblx0ICogRXhwcmVzc2lvbiBzZWFyY2ggc3RyaW5nLiBDb21wYXRpYmlsaXR5IGlzIGNlbnRyYWxseSBlbnN1cmVkIGJ5IHRoZSB0d28gbWV0aG9kcyBfZ2V0SW5uZXJBcHBTdGF0ZUtleSBhbmQgX3JlcGxhY2VJbm5lckFwcFN0YXRlS2V5IChzZWVcblx0ICogYmVsb3cpLiBOZXZlciB1c2UgdGhlc2UgUmVnRXhwIGluIGEgbWV0aG9kIG9uIHlvdXIgb3duLCBhcyBpdCB0eXBpY2FsbHkgaW5kaWNhdGVzIHRoYXQgeW91IHdpbGwgZmFsbCBpbnRvIHRoZSBjb21wYXRpYmlsaXR5IHRyYXAhXG5cdCAqL1xuXHQvLyBXYXJuaW5nISBEbyBub3QgdXNlIEdMT0JBTCBmbGFncyBoZXJlOyBSZWdFeHAgaW4gR0xPQkFMIG1vZGUgc3RvcmUgdGhlIGxhc3RJbmRleCB2YWx1ZVxuXHQvLyBUaGVyZWZvcmUsIHJlcGVhdGVkIGNhbGxzIHRvIHRoZSBSZWdFeHAgd2lsbCB0aGVuIG9ubHkgc3RhcnQgYmVnaW5uaW5nIHdpdGggdGhhdCBzdG9yZWRcblx0Ly8gbGFzdEluZGV4LiBUaHVzLCBtdWx0aXBsZSBjYWxscyB0aGVyZWZvcmUgY291bGQgeWllbGQgc3RyYW5nZSByZXN1bHRzLlxuXHQvLyBNb3Jlb3ZlciwgdGhlcmUgc2hhbGwgb25seSBiZSBleGFjdGx5IG9uZSBJQVBQX1NUQVRFIHBlciBSZWdFeHAgaW4gYW4gQXBwSGFzaC5cblx0Ly8gVGhlcmVmb3JlLCBHTE9CQUwgc2VhcmNoIHNob3VsZCBiZSBzdXBlcmZsdW91cy5cblx0cHJpdmF0ZSBfcklBcHBTdGF0ZU9sZCA9IG5ldyBSZWdFeHAoXCIvXCIgKyBJQVBQX1NUQVRFICsgXCI9KFteLz9dKylcIik7XG5cblx0cHJpdmF0ZSBfcklBcHBTdGF0ZU9sZEF0U3RhcnQgPSBuZXcgUmVnRXhwKFwiXlwiICsgSUFQUF9TVEFURSArIFwiPShbXi8/XSspXCIpO1xuXG5cdC8qXG5cdCAqIFJlZ3VsYXIgRXhwcmVzc2lvbiBpbiB3b3JkczogU2VhcmNoIGZvciBzb21ldGhpbmcgdGhhdCBlaXRoZXIgc3RhcnRzIHdpdGggPyBvciAmLCBmb2xsb3dlZCBieSB0aGUgdGVybSBcInNhcC1pYXBwLXN0YXRlXCIuIFRoYXQgb25lIGlzXG5cdCAqIGZvbGxvd2VkIGJ5IGFuIGVxdWFsIHNpZ24gKD0pLiBUaGUgc3R1ZmYgdGhhdCBpcyBhZnRlciB0aGUgZXF1YWwgc2lnbiBmb3JtcyB0aGUgZmlyc3QgcmVnZXhwIGdyb3VwLiBUaGlzIGdyb3VwIGNvbnNpc3RzIG9mIGF0IGxlYXN0IG9uZVxuXHQgKiAob3IgYXJiaXRyYXJ5IG1hbnkpIGNoYXJhY3RlcnMsIGFzIGxvbmcgYXMgaXQgaXMgbm90IGFuIGFtcGVyc2FuZCBzaWduICgmKS4gQ2hhcmFjdGVycyBhZnRlciBzdWNoIGFuIGFtcGVyc2FuZCB3b3VsZCBiZSBpZ25vcmVkIGFuZCBkb1xuXHQgKiBub3QgYmVsb25nIHRvIHRoZSBncm91cC4gQWx0ZXJuYXRpdmVseSwgdGhlIHN0cmluZyBhbHNvIG1heSBlbmQuXG5cdCAqL1xuXHRwcml2YXRlIF9ySUFwcFN0YXRlTmV3ID0gbmV3IFJlZ0V4cChcIls/Jl1cIiArIElBUFBfU1RBVEUgKyBcIj0oW14mXSspXCIpO1xuXG5cdHByaXZhdGUgX25hdmlnYXRlQ2FsbGJhY2s6IEZ1bmN0aW9uIHwgdW5kZWZpbmVkO1xuXG5cdC8qKlxuXHQgKiBUZW1wb3JhcmlseSBhZGRlZCBhZ2FpbiBiZWNhdXNlIGFuIGFwcGxpY2F0aW9uIHdhcyAoaWxsZWdpYWxseSkgcmVseWluZyBvbiBpdC4gU2hvdWxkIGJlIHJlbW92ZWQgYWdhaW4sIG9uY2UgdGhlIGFwcCBpcyBjb3JyZWN0ZWRcblx0ICovXG5cdHByaXZhdGUgSUFQUF9TVEFURSA9IElBUFBfU1RBVEU7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yIHJlcXVpcmluZyBhIGNvbnRyb2xsZXIvY29tcG9uZW50IG93bmluZyB0aGUgbmF2aWdhdGlvbiBoYW5kbGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0NvbnRyb2xsZXIgVUk1IGNvbnRyb2xsZXIgdGhhdCBjb250YWlucyBhIHJvdXRlciBhbmQgYSBjb21wb25lbnQ7IHR5cGljYWxseSB0aGUgbWFpbiBjb250cm9sbGVyIG9mIHlvdXIgYXBwbGljYXRpb24sIGZvclxuXHQgKiAgICAgICAgZXhhbXBsZSwgYSBzdWJjbGFzcyBvZiB0aGUgc2FwLmNhLnNjZmxkLm1kLmNvbnRyb2xsZXIuQmFzZUZ1bGxzY3JlZW5Db250cm9sbGVyIGlmIHNjYWZmb2xkaW5nIGlzIHVzZWRcblx0ICogQHBhcmFtIHtzdHJpbmd9IFtzTW9kZT1zYXAuZmUubmF2aWdhdGlvbi5Nb2RlLk9EYXRhVjRdIE1vZGUgdG8gYmUgdXNlZCB0byBpbmRpY2F0ZXMgdGhlIE9kYXRhIHZlcnNpb24gdXNlZCBmb3IgcnVubm5pbmcgdGhlIE5hdmlnYXRpb24gSGFuZGxlcixcblx0ICogICAgICAgIHNlZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTW9kZX0uPGJyPlxuXHQgKiBcdFx0ICBOb3RlOiBNb2RlIGhhcyB0byBiZSBzYXAuZmUubmF2aWdhdGlvbi5Nb2RlLk9EYXRhVjIgd2hlbmV2ZXIgdGhpcyBjb25zdHJ1Y3RvciBpcyB1c2VkIHRvIGluaXRpYWxpemUgYSBPRGF0YSBWMiBiYXNlZCBzZXJ2aWNlLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW3NQYXJhbUhhbmRsaW5nTW9kZT1TZWxWYXJXaW5zXSBNb2RlIHRvIGJlIHVzZWQgdG8gaGFuZGxlIGNvbmZsaWN0cyB3aGVuIG1lcmdpbmcgVVJMIHBhcmFtZXRlcnMgYW5kIHRoZSBTZWxlY3Rpb25WYXJpYW50IGNsYXNzLFxuXHQgKiAgICAgICAgc2VlIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5QYXJhbUhhbmRsaW5nTW9kZX1cblx0ICogQHRocm93cyBBbiBpbnN0YW5jZSBvZiB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGluIGNhc2Ugb2YgaW5wdXQgZXJyb3JzLiBWYWxpZCBlcnJvciBjb2RlcyBhcmU6IDx0YWJsZT5cblx0ICogICAgICAgICA8dHI+XG5cdCAqICAgICAgICAgPHRoIGFsaWduPVwibGVmdFwiPk5hdkVycm9yIGNvZGU8L3RoPlxuXHQgKiAgICAgICAgIDx0aCBhbGlnbj1cImxlZnRcIj5EZXNjcmlwdGlvbjwvdGg+XG5cdCAqICAgICAgICAgPC90cj5cblx0ICogICAgICAgICA8dHI+XG5cdCAqICAgICAgICAgPHRkPk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVQ8L3RkPlxuXHQgKiAgICAgICAgIDx0ZD5JbmRpY2F0ZXMgdGhhdCB0aGUgaW5wdXQgcGFyYW1ldGVyIGlzIGludmFsaWQ8L3RkPlxuXHQgKiAgICAgICAgIDwvdHI+XG5cdCAqICAgICAgICAgPC90YWJsZT5cblx0ICovXG5cdGNvbnN0cnVjdG9yKG9Db250cm9sbGVyOiBDb250cm9sbGVyIHwgVUlDb21wb25lbnQsIHNNb2RlPzogc3RyaW5nLCBzUGFyYW1IYW5kbGluZ01vZGU/OiBzdHJpbmcpIHtcblx0XHRzdXBlcigpO1xuXHRcdGlmICghb0NvbnRyb2xsZXIpIHtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0fVxuXG5cdFx0aWYgKG9Db250cm9sbGVyIGluc3RhbmNlb2YgVUlDb21wb25lbnQpIHtcblx0XHRcdHRoaXMub1JvdXRlciA9IG9Db250cm9sbGVyLmdldFJvdXRlcigpO1xuXHRcdFx0dGhpcy5vQ29tcG9uZW50ID0gb0NvbnRyb2xsZXI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0eXBlb2Ygb0NvbnRyb2xsZXIuZ2V0T3duZXJDb21wb25lbnQgIT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLm9Sb3V0ZXIgPSB0aGlzLl9nZXRSb3V0ZXIob0NvbnRyb2xsZXIpO1xuXHRcdFx0dGhpcy5vQ29tcG9uZW50ID0gb0NvbnRyb2xsZXIuZ2V0T3duZXJDb21wb25lbnQoKTtcblx0XHR9XG5cblx0XHQvLyBzcGVjaWFsIGhhbmRsaW5nIGZvciBTbWFydFRlbXBsYXRlc1xuXHRcdGlmICh0aGlzLm9Db21wb25lbnQgJiYgdGhpcy5vQ29tcG9uZW50LmdldEFwcENvbXBvbmVudCkge1xuXHRcdFx0dGhpcy5vQ29tcG9uZW50ID0gdGhpcy5vQ29tcG9uZW50LmdldEFwcENvbXBvbmVudCgpO1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdHR5cGVvZiB0aGlzLm9Sb3V0ZXIgPT09IFwidW5kZWZpbmVkXCIgfHxcblx0XHRcdHR5cGVvZiB0aGlzLm9Db21wb25lbnQgPT09IFwidW5kZWZpbmVkXCIgfHxcblx0XHRcdHR5cGVvZiB0aGlzLm9Db21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSAhPT0gXCJmdW5jdGlvblwiXG5cdFx0KSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdH1cblxuXHRcdGlmIChzUGFyYW1IYW5kbGluZ01vZGUgPT09IFBhcmFtSGFuZGxpbmdNb2RlLlVSTFBhcmFtV2lucyB8fCBzUGFyYW1IYW5kbGluZ01vZGUgPT09IFBhcmFtSGFuZGxpbmdNb2RlLkluc2VydEluU2VsT3B0KSB7XG5cdFx0XHR0aGlzLnNQYXJhbUhhbmRsaW5nTW9kZSA9IHNQYXJhbUhhbmRsaW5nTW9kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5zUGFyYW1IYW5kbGluZ01vZGUgPSBQYXJhbUhhbmRsaW5nTW9kZS5TZWxWYXJXaW5zOyAvLyBkZWZhdWx0XG5cdFx0fVxuXHRcdGlmIChzTW9kZSA9PT0gTW9kZS5PRGF0YVYyKSB7XG5cdFx0XHR0aGlzLl9zTW9kZSA9IHNNb2RlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHNoZWxsIG5hdmlnYXRpb24gc2VydmljZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIE5hdmlnYXRpb24gc2VydmljZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlKCkge1xuXHRcdHJldHVybiBzYXAudXNoZWxsLkNvbnRhaW5lci5nZXRTZXJ2aWNlKFwiQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cIik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBzaGVsbCBuYXZpZ2F0aW9uIHNlcnZpY2UuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBOYXZpZ2F0aW9uIHNlcnZpY2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZUFzeW5jKCkge1xuXHRcdHJldHVybiBzYXAudXNoZWxsLkNvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoXCJDcm9zc0FwcGxpY2F0aW9uTmF2aWdhdGlvblwiKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9Dcm9zc0FwcE5hdlNlcnZpY2U6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0Nyb3NzQXBwTmF2U2VydmljZTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlcjogQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb24gaXMgbm90IGF2YWlsYWJsZS5cIik7XG5cdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLk5PLlhBUFBTRVJWSUNFXCIpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSByZWZlcmVuY2UgdG8gdGhlIHJvdXRlciBvYmplY3QgZm9yIG5hdmlnYXRpb24gZm9yIHRoaXMgZ2l2ZW4gQ29udHJvbGxlci5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSByZWZlcmVuY2UgdG8gdGhlIENvbnRyb2xsZXIgZm9yIHdoaWNoIHRoZSBSb3V0ZXIgaW5zdGFuY2Ugc2hhbGwgYmUgZGV0ZXJtaW5lZC5cblx0ICogQHJldHVybnMgVGhlIFJvdXRlciBmb3IgdGhlIGdpdmVuIENvbnRyb2xsZXJcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRSb3V0ZXIob0NvbnRyb2xsZXI6IENvbnRyb2xsZXIpIHtcblx0XHRyZXR1cm4gVUlDb21wb25lbnQuZ2V0Um91dGVyRm9yKG9Db250cm9sbGVyKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBpcyB0byBiZSB1c2VkIG9ubHkgYnkgRkUgVjIgdG8gZ2V0IGFjY2VzcyB0byB0b0V4dGVybmFsIHByb21pc2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBmbkNhbGxiYWNrIENhbGxiYWNrIHRvIGJlIGNhbGxlZCBieSAnbmF2aWdhdGUnIG1ldGhvZCBpbiBjYXNlIG9mIHRvRXh0ZXJuYWwgaXMgdXNlZCB0byBuYXZpZ2F0ZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdHJlZ2lzdGVyTmF2aWdhdGVDYWxsYmFjayhmbkNhbGxiYWNrOiBGdW5jdGlvbikge1xuXHRcdHRoaXMuX25hdmlnYXRlQ2FsbGJhY2sgPSBmbkNhbGxiYWNrO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIGEgY3Jvc3MtYXBwIG5hdmlnYXRpb24gYWZ0ZXIgc2F2aW5nIHRoZSBpbm5lciBhbmQgdGhlIGNyb3NzLWFwcCBzdGF0ZXMuIFRoZSBuYXZpZ2F0aW9uIG1vZGUgYmFzZWQgb25cblx0ICogPGNvZGU+c2FwLXVzaGVsbC1uZXh0LW5hdm1vZGU8L2NvZGU+IGlzIHRha2VuIGludG8gYWNjb3VudC4gSWYgc2V0IHRvIDxjb2RlPmV4cGxhY2U8L2NvZGU+IHRoZSBpbm5lciBhcHAgc3RhdGUgd2lsbCBub3QgYmUgY2hhbmdlZC5cblx0ICogPGI+Tm90ZTo8L2I+IFRoZSA8Y29kZT5zTmF2TW9kZTwvY29kZT4gYXJndW1lbnQgY2FuIGJlIHVzZWQgdG8gb3ZlcndyaXRlIHRoZSBTQVAgRmlvcmkgbGF1bmNocGFkIGRlZmF1bHQgbmF2aWdhdGlvbiBmb3Igb3BlbmluZyBhIFVSTFxuXHQgKiBpbi1wbGFjZSBvciBleC1wbGFjZS5cblx0ICogPGJyPlxuXHQgKiA8Yj5Ob2RlOjwvYj4gSWYgdGhlIDxjb2RlPm9FeHRlcm5hbEFwcERhdGE8L2NvZGU+IHBhcmFtZXRlciBpcyBub3Qgc3VwcGxpZWQsIHRoZSBleHRlcm5hbCBhcHAgZGF0YSB3aWxsIGJlIGNhbGN1bGF0ZWQgYmFzZWQgb25cblx0ICogdGhlIDxjb2RlPm9Jbm5lckFwcERhdGE8L2NvZGU+IGRhdGEuPGJyPlxuXHQgKiBTbWFydEZpbHRlckJhciBjb250cm9sIDxiPlBhcmFtZXRlcnM6PC9iPiA8dGFibGU+XG5cdCAqIDx0cj5cblx0ICogPHRkIGFsaWduPVwiY2VudGVyXCI+e29iamVjdH08L3RkPlxuXHQgKiA8dGQ+PGI+b0Vycm9yPC9iPjwvdGQ+XG5cdCAqIDx0ZD5OYXZFcnJvciBvYmplY3QgKGluc3RhbmNlIG9mIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0pIHRoYXQgZGVzY3JpYmVzIHdoaWNoIGtpbmQgb2YgZXJyb3Igb2NjdXJyZWQ8L3RkPlxuXHQgKiA8dHI+XG5cdCAqIDx0ZCBhbGlnbj1cImNlbnRlclwiPntzdHJpbmd9PC90ZD5cblx0ICogPHRkPjxiPm9FcnJvci5lcnJvckNvZGU8L2I+PC90ZD5cblx0ICogPHRkPkNvZGUgdG8gaWRlbnRpZnkgdGhlIGVycm9yPC90ZD5cblx0ICogPHRyPlxuXHQgKiA8dGQgYWxpZ249XCJjZW50ZXJcIj57c3RyaW5nfTwvdGQ+XG5cdCAqIDx0ZD48Yj5vRXJyb3IudHlwZTwvYj48L3RkPlxuXHQgKiA8dGQ+U2V2ZXJpdHkgb2YgdGhlIGVycm9yIChpbmZvL3dhcm5pbmcvZXJyb3IpPC90ZD5cblx0ICogPHRyPlxuXHQgKiA8dGQgYWxpZ249XCJjZW50ZXJcIj57YXJyYXl9PC90ZD5cblx0ICogPHRkPjxiPm9FcnJvci5wYXJhbXM8L2I+PC90ZD5cblx0ICogPHRkPkFuIGFycmF5IG9mIG9iamVjdHMgKHR5cGljYWxseSBzdHJpbmdzKSB0aGF0IGRlc2NyaWJlIGFkZGl0aW9uYWwgdmFsdWUgcGFyYW1ldGVycyByZXF1aXJlZCBmb3IgZ2VuZXJhdGluZyB0aGUgbWVzc2FnZTwvdGQ+XG5cdCAqIDwvdGFibGU+LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqIEBmdW5jdGlvbiBuYXZpZ2F0ZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIucHJvdG90eXBlXG5cdCAqIEBwYXJhbSBzU2VtYW50aWNPYmplY3QgTmFtZSBvZiB0aGUgc2VtYW50aWMgb2JqZWN0IG9mIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBOYW1lIG9mIHRoZSBhY3Rpb24gb2YgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHZOYXZpZ2F0aW9uUGFyYW1ldGVycyBOYXZpZ2F0aW9uIHBhcmFtZXRlcnMgYXMgYW4gb2JqZWN0IHdpdGgga2V5L3ZhbHVlIHBhaXJzIG9yIGFzIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHN1Y2ggYW4gb2JqZWN0LiBJZiBwYXNzZWQgYXMgYW4gb2JqZWN0LCB0aGUgcHJvcGVydGllcyBhcmUgbm90IGNoZWNrZWQgYWdhaW5zdCB0aGUgPGNvZGU+SXNQb3RlbnRpYWxTZW5zaXRpdmU8L2NvZGU+IG9yIDxjb2RlPk1lYXN1cmU8L2NvZGU+IHR5cGUuXG5cdCAqIEBwYXJhbSBvSW5uZXJBcHBEYXRhIE9iamVjdCBmb3Igc3RvcmluZyBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIGZuT25FcnJvciBDYWxsYmFjayB0aGF0IGlzIGNhbGxlZCBpZiBhbiBlcnJvciBvY2N1cnMgZHVyaW5nIG5hdmlnYXRpb24gPGJyPlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YSBPYmplY3QgZm9yIHN0b3JpbmcgdGhlIHN0YXRlIHdoaWNoIHdpbGwgYmUgZm9yd2FyZGVkIHRvIHRoZSB0YXJnZXQgY29tcG9uZW50LlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YS5wcmVzZW50YXRpb25WYXJpYW50IE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHVpIHN0YXRlIG9mIHRoZSBhcHAgd2hpY2ggd2lsbCBiZSBmb3J3YXJkZWQgdG8gdGhlXG5cdCAqICAgICAgICB0YXJnZXQgY29tcG9uZW50LlxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YS52YWx1ZVRleHRzIE9iamVjdCBjb250YWluaW5nIHZhbHVlIGRlc2NyaXB0aW9ucyB3aGljaCB3aWxsIGJlIGZvcndhcmRlZCB0byB0aGUgdGFyZ2V0IGNvbXBvbmVudC5cblx0ICogQHBhcmFtIG9FeHRlcm5hbEFwcERhdGEuc2VsZWN0aW9uVmFyaWFudCBTdHJpbmdpZmllZCBKU09OIG9iamVjdCwgd2hpY2ggd2lsbCBiZSBmb3J3YXJkZWQgdG8gdGhlIHRhcmdldCBjb21wb25lbnQuIElmIG5vdFxuXHQgKiAgICAgICAgcHJvdmlkZWQgdGhlIHNlbGVjdGlvblZhcmlhbnQgd2lsbCBiZSBjb25zdHJ1Y3RlZCBiYXNlZCBvbiB0aGUgdk5hdmlnYXRpb25QYXJhbWV0ZXJzLlxuXHQgKiBAcGFyYW0gc05hdk1vZGUgQXJndW1lbnQgaXMgdXNlZCB0byBvdmVyd3JpdGUgdGhlIEZMUC1jb25maWd1cmVkIHRhcmdldCBmb3Igb3BlbmluZyBhIFVSTC4gSWYgdXNlZCwgb25seSB0aGVcblx0ICogICAgICAgIDxjb2RlPmV4cGxhY2U8L2NvZGU+IG9yIDxjb2RlPmlucGxhY2U8L2NvZGU+IHZhbHVlcyBhcmUgYWxsb3dlZC4gQW55IG90aGVyIHZhbHVlIHdpbGwgbGVhZCB0byBhbiBleGNlcHRpb25cblx0ICogICAgICAgIDxjb2RlPk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfTkFWX01PREU8L2NvZGU+LlxuXHQgKiBAZXhhbXBsZSA8Y29kZT5cblx0ICogc2FwLnVpLmRlZmluZShbXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiLCBcInNhcC9mZS9uYXZpZ2F0aW9uL1NlbGVjdGlvblZhcmlhbnRcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlciwgU2VsZWN0aW9uVmFyaWFudCkge1xuXHQgKiBcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdHZhciBzU2VtYW50aWNPYmplY3QgPSBcIlNhbGVzT3JkZXJcIjtcblx0ICogXHR2YXIgc0FjdGlvbk5hbWUgPSBcImNyZWF0ZVwiO1xuXHQgKlxuXHQgKiBcdC8vc2ltcGxlIHBhcmFtZXRlcnMgYXMgT2JqZWN0XG5cdCAqIFx0dmFyIHZOYXZpZ2F0aW9uUGFyYW1ldGVycyA9IHtcblx0ICogXHRcdENvbXBhbnlDb2RlIDogXCIwMDAxXCIsXG5cdCAqIFx0XHRDdXN0b21lciA6IFwiQzAwMDFcIlxuXHQgKiBcdH07XG5cdCAqXG5cdCAqIFx0Ly9vciBhcyBzZWxlY3Rpb24gdmFyaWFudFxuXHQgKiBcdHZhciBvU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdCAqXHQgb1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiQ29tcGFueUNvZGVcIiwgXCJJXCIsIFwiRVFcIiwgXCIwMDAxXCIpO1xuXHQgKiBcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkN1c3RvbWVyXCIsIFwiSVwiLCBcIkVRXCIsIFwiQzAwMDFcIik7XG5cdCAqIFx0dk5hdmlnYXRpb25QYXJhbWV0ZXJzID0gb1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCk7XG5cdCAqXG5cdCAqIFx0Ly9vciBkaXJlY3RseSBmcm9tIFNtYXJ0RmlsdGVyQmFyXG5cdCAqIFx0dk5hdmlnYXRpb25QYXJhbWV0ZXJzID0gb1NtYXJ0RmlsdGVyQmFyLmdldERhdGFTdWl0ZUZvcm1hdCgpO1xuXHQgKlxuXHQgKiBcdC8vYXBwIHN0YXRlIGZvciBiYWNrIG5hdmlnYXRpb25cblx0ICpcdCB2YXIgb0lubmVyQXBwRGF0YSA9IHtcblx0ICogXHRcdHNlbGVjdGlvblZhcmlhbnQgOiBvU21hcnRGaWx0ZXJCYXIuZ2V0RGF0YVN1aXRlRm9ybWF0KCksXG5cdCAqIFx0XHR0YWJsZVZhcmlhbnRJZCA6IG9TbWFydFRhYmxlLmdldEN1cnJlbnRWYXJpYW50SWQoKSxcblx0ICogXHRcdGN1c3RvbURhdGEgOiBvTXlDdXN0b21EYXRhXG5cdCAqIFx0fTtcblx0ICpcblx0ICogXHQvLyBjYWxsYmFjayBmdW5jdGlvbiBpbiBjYXNlIG9mIGVycm9yc1xuXHQgKiBcdHZhciBmbk9uRXJyb3IgPSBmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0dmFyIG9pMThuID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmdldE1vZGVsKFwiaTE4blwiKS5nZXRSZXNvdXJjZUJ1bmRsZSgpO1xuXHQgKiBcdFx0b0Vycm9yLnNldFVJVGV4dCh7b2kxOG4gOiBvaTE4biwgc1RleHRLZXkgOiBcIk9VVEJPVU5EX05BVl9FUlJPUlwifSk7XG5cdCAqIFx0XHRvRXJyb3Iuc2hvd01lc3NhZ2VCb3goKTtcblx0ICogXHR9O1xuXHQgKlxuXHQgKiBcdG9OYXZpZ2F0aW9uSGFuZGxlci5uYXZpZ2F0ZShzU2VtYW50aWNPYmplY3QsIHNBY3Rpb25OYW1lLCB2TmF2aWdhdGlvblBhcmFtZXRlcnMsIG9Jbm5lckFwcERhdGEsIGZuT25FcnJvcik7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqL1xuXHRuYXZpZ2F0ZShcblx0XHRzU2VtYW50aWNPYmplY3Q6IHN0cmluZyxcblx0XHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRcdHZOYXZpZ2F0aW9uUGFyYW1ldGVyczogb2JqZWN0IHwgc3RyaW5nLFxuXHRcdG9Jbm5lckFwcERhdGE/OiBJbm5lckFwcERhdGEsXG5cdFx0Zm5PbkVycm9yPzogRnVuY3Rpb24sXG5cdFx0b0V4dGVybmFsQXBwRGF0YT86IHtcblx0XHRcdHZhbHVlVGV4dHM/OiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHRwcmVzZW50YXRpb25WYXJpYW50Pzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudD86IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHR9LFxuXHRcdHNOYXZNb2RlPzogc3RyaW5nXG5cdCkge1xuXHRcdGxldCBzU2VsZWN0aW9uVmFyaWFudDogYW55LFxuXHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRvWEFwcERhdGFPYmo6IGFueSxcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyxcblx0XHRcdGJFeFBsYWNlID0gZmFsc2UsXG5cdFx0XHRvVG1wRGF0YTogYW55ID0ge307XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXI6IE5hdmlnYXRpb25IYW5kbGVyID0gdGhpcztcblxuXHRcdGNvbnN0IG9Db21wb25lbnREYXRhID0gdGhpcy5vQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKTtcblx0XHQvKlxuXHRcdCAqIFRoZXJlIGFyZSBzb21lIHJhY2UgY29uZGl0aW9ucyB3aGVyZSB0aGUgb0NvbXBvbmVudERhdGEgbWF5IG5vdCBiZSBzZXQsIGZvciBleGFtcGxlIGluIGNhc2UgdGhlIFVTaGVsbCB3YXMgbm90IGluaXRpYWxpemVkIHByb3Blcmx5LiBUb1xuXHRcdCAqIG1ha2Ugc3VyZSB0aGF0IHdlIGRvIG5vdCBkdW1wIGhlcmUgd2l0aCBhbiBleGNlcHRpb24sIHdlIHRha2UgdGhpcyBzcGVjaWFsIGVycm9yIGhhbmRsaW5nIGJlaGF2aW9yOlxuXHRcdCAqL1xuXHRcdGlmIChvQ29tcG9uZW50RGF0YSkge1xuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzID0gb0NvbXBvbmVudERhdGEuc3RhcnR1cFBhcmFtZXRlcnM7XG5cblx0XHRcdGlmIChcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzICYmXG5cdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc1tcInNhcC11c2hlbGwtbmV4dC1uYXZtb2RlXCJdICYmXG5cdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc1tcInNhcC11c2hlbGwtbmV4dC1uYXZtb2RlXCJdLmxlbmd0aCA+IDBcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBiRXhQbGFjZSA9IChKU09OLnBhcnNlKG9TdGFydHVwUGFyYW1ldGVyc1tcInNhcC11c2hlbGwtbmV4dC1uYXZtb2RlXCJdWzBdKSA9PT0gXCJleHBsYWNlXCIpO1xuXHRcdFx0XHRiRXhQbGFjZSA9IG9TdGFydHVwUGFyYW1ldGVyc1tcInNhcC11c2hlbGwtbmV4dC1uYXZtb2RlXCJdWzBdID09PSBcImV4cGxhY2VcIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBvbmx5IG5hdi1tb2RlICdpbnBsYWNlJyBvciAnZXhwbGFjZScgYXJlIHN1cHBvcnRlZC4gQW55IG90aGVyIHZhbHVlIHdpbGwgbGVhZCB0byBhbiBleGNlcHRpb24uXG5cdFx0aWYgKHNOYXZNb2RlICYmIChzTmF2TW9kZSA9PT0gXCJpbnBsYWNlXCIgfHwgc05hdk1vZGUgPT09IFwiZXhwbGFjZVwiKSkge1xuXHRcdFx0YkV4UGxhY2UgPSBzTmF2TW9kZSA9PT0gXCJleHBsYWNlXCI7XG5cdFx0fSBlbHNlIGlmIChzTmF2TW9kZSkge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9OQVZfTU9ERVwiKTtcblx0XHR9XG5cblx0XHRpZiAob0V4dGVybmFsQXBwRGF0YSA9PT0gdW5kZWZpbmVkIHx8IG9FeHRlcm5hbEFwcERhdGEgPT09IG51bGwpIHtcblx0XHRcdG9YQXBwRGF0YU9iaiA9IHt9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvWEFwcERhdGFPYmogPSBvRXh0ZXJuYWxBcHBEYXRhO1xuXHRcdH1cblxuXHRcdC8vIGZvciBuYXZpZ2F0aW9uIHdlIG5lZWQgVVJMIHBhcmFtZXRlcnMgKGxlZ2FjeSBuYXZpZ2F0aW9uKSBhbmQgc2FwLXhhcHAtc3RhdGUsIHRoZXJlZm9yZSB3ZSBuZWVkIHRvIGNyZWF0ZSB0aGUgbWlzc2luZyBvbmUgZnJvbSB0aGVcblx0XHQvLyBwYXNzZWQgb25lXG5cdFx0aWYgKHR5cGVvZiB2TmF2aWdhdGlvblBhcmFtZXRlcnMgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHNTZWxlY3Rpb25WYXJpYW50ID0gdk5hdmlnYXRpb25QYXJhbWV0ZXJzO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHZOYXZpZ2F0aW9uUGFyYW1ldGVycyA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0Y29uc3Qgb0VucmljaGVkU2VsVmFyID0gdGhpcy5fc3BsaXRJbmJvdW5kTmF2aWdhdGlvblBhcmFtZXRlcnMoXG5cdFx0XHRcdG5ldyBTZWxlY3Rpb25WYXJpYW50KCksXG5cdFx0XHRcdHZOYXZpZ2F0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0W11cblx0XHRcdCkub05hdmlnYXRpb25TZWxWYXI7XG5cdFx0XHRzU2VsZWN0aW9uVmFyaWFudCA9IG9FbnJpY2hlZFNlbFZhci50b0pTT05TdHJpbmcoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHRvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQoc1NlbGVjdGlvblZhcmlhbnQpO1xuXHRcdGlmICh0eXBlb2Ygdk5hdmlnYXRpb25QYXJhbWV0ZXJzID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gdGhpcy5fcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyhvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50KTtcblx0XHR9XG5cdFx0b1RtcERhdGEuc2VsZWN0aW9uVmFyaWFudCA9IG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQgJiYgb1RtcERhdGEuc2VsZWN0aW9uVmFyaWFudC50b0pTT05PYmplY3QoKTtcblx0XHRvVG1wRGF0YSA9IHRoaXMuX3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uKG9UbXBEYXRhKTsgLy8gcmVtb3ZlIGV2ZW50dWFsIG1lYXN1cmVzXG5cdFx0b1RtcERhdGEgPSB0aGlzLl9jaGVja0lzUG90ZW50aWFsbHlTZW5zaXRpdmUob1RtcERhdGEpOyAvLyByZW1vdmUgZXZlbnR1YWwgc2Vuc2l0aXZlIGRhdGFcblxuXHRcdGlmIChvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRtUGFyYW1ldGVycyA9IHRoaXMuX2dldFVSTFBhcmFtZXRlcnNGcm9tU2VsZWN0aW9uVmFyaWFudChuZXcgU2VsZWN0aW9uVmFyaWFudChvVG1wRGF0YS5zZWxlY3Rpb25WYXJpYW50KSk7XG5cdFx0XHRzU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KG9UbXBEYXRhLnNlbGVjdGlvblZhcmlhbnQpLnRvSlNPTlN0cmluZygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtUGFyYW1ldGVycyA9IHt9O1xuXHRcdFx0c1NlbGVjdGlvblZhcmlhbnQgPSBudWxsO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9OYXZBcmd1bWVudHM6IGFueSA9IHtcblx0XHRcdHRhcmdldDoge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRhY3Rpb246IHNBY3Rpb25OYW1lXG5cdFx0XHR9LFxuXHRcdFx0cGFyYW1zOiBtUGFyYW1ldGVycyB8fCB7fVxuXHRcdH07XG5cblx0XHRjb25zdCBmbk5hdmlnYXRlID0gZnVuY3Rpb24gKG9Dcm9zc0FwcE5hdlNlcnZpY2U6IGFueSkge1xuXHRcdFx0aWYgKCFvWEFwcERhdGFPYmouc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRvWEFwcERhdGFPYmouc2VsZWN0aW9uVmFyaWFudCA9IHNTZWxlY3Rpb25WYXJpYW50O1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBmbk5hdkV4cGxhY2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnN0IHNOZXdIcmVmUHJvbWlzZSA9IG9Dcm9zc0FwcE5hdlNlcnZpY2UuaHJlZkZvckV4dGVybmFsQXN5bmMob05hdkFyZ3VtZW50cywgb05hdkhhbmRsZXIub0NvbXBvbmVudCk7XG5cdFx0XHRcdHNOZXdIcmVmUHJvbWlzZVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChzTmV3SHJlZjogYW55KSB7XG5cdFx0XHRcdFx0XHRvcGVuV2luZG93KHNOZXdIcmVmKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJldGlyZXZpbmcgaHJlZkZvckV4dGVybmFsIDogXCIgKyBvRXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fTtcblxuXHRcdFx0b1hBcHBEYXRhT2JqID0gb05hdkhhbmRsZXIuX3JlbW92ZU1lYXN1cmVCYXNlZEluZm9ybWF0aW9uKG9YQXBwRGF0YU9iaik7XG5cdFx0XHRyZXR1cm4gb05hdkhhbmRsZXIuX2ZuU2F2ZUFwcFN0YXRlQXN5bmMob1hBcHBEYXRhT2JqLCBmbk9uRXJyb3IpLnRoZW4oZnVuY3Rpb24gKG9TYXZlQXBwU3RhdGVSZXR1cm46IGFueSkge1xuXHRcdFx0XHRpZiAob1NhdmVBcHBTdGF0ZVJldHVybikge1xuXHRcdFx0XHRcdG9OYXZBcmd1bWVudHMuYXBwU3RhdGVLZXkgPSBvU2F2ZUFwcFN0YXRlUmV0dXJuLmFwcFN0YXRlS2V5O1xuXG5cdFx0XHRcdFx0Ly8gUmVtYXJrOlxuXHRcdFx0XHRcdC8vIFRoZSBDcm9zcyBBcHAgU2VydmljZSB0YWtlcyBjYXJlIG9mIGVuY29kaW5nIHBhcmFtZXRlciBrZXlzIGFuZCB2YWx1ZXMuIEV4YW1wbGU6XG5cdFx0XHRcdFx0Ly8gbVBhcmFtcyA9IHsgXCIkQCVcIiA6IFwiJi89XCIgfSByZXN1bHRzIGluIHRoZSBVUkwgcGFyYW1ldGVyICUyNTI0JTI1NDAlMjUyNT0lMjUyNiUyNTJGJTI1M0Rcblx0XHRcdFx0XHQvLyBOb3RlIHRoZSBkb3VibGUgZW5jb2RpbmcsIHRoaXMgaXMgY29ycmVjdC5cblxuXHRcdFx0XHRcdC8vIHRvRXh0ZXJuYWwgc2V0cyBzYXAteGFwcC1zdGF0ZSBpbiB0aGUgVVJMIGlmIGFwcFN0YXRlS2V5IGlzIHByb3ZpZGVkIGluIG9OYXZBcmd1bWVudHNcblx0XHRcdFx0XHQvLyB0b0V4dGVybmFsIGhhcyBpc3N1ZXMgb24gc3RpY2t5IGFwcHMgRklPUklURUNIUDEtMTQ0MDAsIHRlbXAgZml4IHVzaW5nIGhyZWZGb3JFeHRlcm5hbFxuXHRcdFx0XHRcdGlmIChzTmF2TW9kZSA9PSBcImV4cGxhY2VcIikge1xuXHRcdFx0XHRcdFx0Zm5OYXZFeHBsYWNlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnN0IHB0b0V4dCA9IG9Dcm9zc0FwcE5hdlNlcnZpY2UudG9FeHRlcm5hbChvTmF2QXJndW1lbnRzLCBvTmF2SGFuZGxlci5vQ29tcG9uZW50KTtcblx0XHRcdFx0XHRcdC8vIFRPRE86IFRoaXMgaXMganVzdCBhIHRlbXBvcmFyeSBzb2x1dGlvbiB0byBhbGxvdyBGRSBWMiB0byB1c2UgdG9FeHRlcm5hbCBwcm9taXNlLlxuXHRcdFx0XHRcdFx0aWYgKG9OYXZIYW5kbGVyLl9uYXZpZ2F0ZUNhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRcdG9OYXZIYW5kbGVyLl9uYXZpZ2F0ZUNhbGxiYWNrKHB0b0V4dCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IC8vIGVsc2UgOiBlcnJvciB3YXMgYWxyZWFkeSByZXBvcnRlZFxuXHRcdFx0fSk7XG5cdFx0fTtcblx0XHRjb25zdCBmblN0b3JlQW5kTmF2aWdhdGUgPSBmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRvTmF2SGFuZGxlclxuXHRcdFx0XHQuc3RvcmVJbm5lckFwcFN0YXRlQXN5bmMob0lubmVyQXBwRGF0YSBhcyBhbnksIHRydWUpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0XHRcdGlmIChzQXBwU3RhdGVLZXkpIHtcblx0XHRcdFx0XHRcdG9OYXZIYW5kbGVyLnJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBmbk5hdmlnYXRlKG9Dcm9zc0FwcE5hdlNlcnZpY2UpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0aWYgKGZuT25FcnJvcikge1xuXHRcdFx0XHRcdFx0Zm5PbkVycm9yKG9FcnJvcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHR9O1xuXHRcdGlmIChzTmF2TW9kZSkge1xuXHRcdFx0b05hdkFyZ3VtZW50cy5wYXJhbXNbXCJzYXAtdXNoZWxsLW5hdm1vZGVcIl0gPSBiRXhQbGFjZSA/IFwiZXhwbGFjZVwiIDogXCJpbnBsYWNlXCI7XG5cdFx0fVxuXHRcdG9OYXZIYW5kbGVyXG5cdFx0XHQuX2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlQXN5bmMoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9Dcm9zc0FwcE5hdlNlcnZpY2U6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvU3VwcG9ydGVkUHJvbWlzZSA9IG9Dcm9zc0FwcE5hdlNlcnZpY2UuaXNOYXZpZ2F0aW9uU3VwcG9ydGVkKFtvTmF2QXJndW1lbnRzXSwgb05hdkhhbmRsZXIub0NvbXBvbmVudCk7XG5cdFx0XHRcdG9TdXBwb3J0ZWRQcm9taXNlLmRvbmUoZnVuY3Rpb24gKG9UYXJnZXRzOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob1RhcmdldHNbMF0uc3VwcG9ydGVkKSB7XG5cdFx0XHRcdFx0XHRpZiAoIWJFeFBsYWNlKSB7XG5cdFx0XHRcdFx0XHRcdGZuU3RvcmVBbmROYXZpZ2F0ZShvQ3Jvc3NBcHBOYXZTZXJ2aWNlKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGZuTmF2aWdhdGUob0Nyb3NzQXBwTmF2U2VydmljZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChmbk9uRXJyb3IpIHtcblx0XHRcdFx0XHRcdC8vIGludGVudCBpcyBub3Qgc3VwcG9ydGVkXG5cdFx0XHRcdFx0XHRjb25zdCBvRXJyb3IgPSBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5pc0ludGVudFN1cHBvcnRlZC5ub3RTdXBwb3J0ZWRcIik7XG5cdFx0XHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChmbk9uRXJyb3IpIHtcblx0XHRcdFx0XHRvU3VwcG9ydGVkUHJvbWlzZS5mYWlsKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdC8vIHRlY2huaWNhbCBlcnJvcjogY291bGQgbm90IGRldGVybWluZSBpZiBpbnRlbnQgaXMgc3VwcG9ydGVkXG5cdFx0XHRcdFx0XHRjb25zdCBvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5pc0ludGVudFN1cHBvcnRlZC5mYWlsZWRcIik7XG5cdFx0XHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0aWYgKGZuT25FcnJvcikge1xuXHRcdFx0XHRcdGZuT25FcnJvcihvRXJyb3IpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIGluY29taW5nIFVSTCBhbmQgcmV0dXJucyBhIFByb21pc2UuIElmIHRoaXMgbWV0aG9kIGRldGVjdHMgYSBiYWNrIG5hdmlnYXRpb24sIHRoZSBpbm5lciBhcHAgc3RhdGUgaXMgcmV0dXJuZWQgaW4gdGhlIHJlc29sdmVkXG5cdCAqIFByb21pc2UuIE90aGVyd2lzZSBzdGFydHVwIHBhcmFtZXRlcnMgd2lsbCBiZSBtZXJnZWQgaW50byB0aGUgYXBwIHN0YXRlIHByb3ZpZGVkIGJ5IGNyb3NzIGFwcCBuYXZpZ2F0aW9uLCBhbmQgYSBjb21iaW5lZCBhcHAgc3RhdGUgd2lsbCBiZVxuXHQgKiByZXR1cm5lZC4gVGhlIGNvbmZsaWN0IHJlc29sdXRpb24gY2FuIGJlIGluZmx1ZW5jZWQgd2l0aCBzUGFyYW1IYW5kbGluZ01vZGUgZGVmaW5lZCBpbiB0aGUgY29uc3RydWN0b3IuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCB0aGUgYWN0aW9ucyBvZiB0aGUgZnVuY3Rpb24gaGF2ZSBiZWVuIGV4ZWN1dGVkLiBJZiB0aGUgZXhlY3V0aW9uIGlzIHN1Y2Nlc3NmdWwsIHRoZVxuXHQgKiAgICAgICAgICBleHRyYWN0ZWQgYXBwIHN0YXRlLCB0aGUgc3RhcnR1cCBwYXJhbWV0ZXJzLCBhbmQgdGhlIHR5cGUgb2YgbmF2aWdhdGlvbiBhcmUgcmV0dXJuZWQsIHNlZSBhbHNvIHRoZSBleGFtcGxlIGFib3ZlLiBUaGUgYXBwIHN0YXRlIGlzXG5cdCAqICAgICAgICAgIGFuIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBmb2xsb3dpbmcgaW5mb3JtYXRpb246XG5cdCAqICAgICAgICAgIDx1bD5cblx0ICogICAgICAgICAgPGxpPjxjb2RlPm9BcHBEYXRhLm9TZWxlY3Rpb25WYXJpYW50PC9jb2RlPjogQW4gaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnR9XG5cdCAqICAgICAgICAgIGNvbnRhaW5pbmcgb25seSBwYXJhbWV0ZXJzL3NlbGVjdCBvcHRpb25zIHRoYXQgYXJlIHJlbGF0ZWQgdG8gbmF2aWdhdGlvbjwvbGk+XG5cdCAqICAgICAgICAgIDxsaT48Y29kZT5vQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50PC9jb2RlPjogVGhlIG5hdmlnYXRpb24tcmVsYXRlZCBzZWxlY3Rpb24gdmFyaWFudCBhcyBhIEpTT04tZm9ybWF0dGVkIHN0cmluZzwvbGk+XG5cdCAqICAgICAgICAgIDxsaT48Y29kZT5vQXBwRGF0YS5vRGVmYXVsdGVkU2VsZWN0aW9uVmFyaWFudDwvY29kZT46IEFuIGluc3RhbmNlIG9mXG5cdCAqICAgICAgICAgIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50fSBjb250YWluaW5nIG9ubHkgdGhlIHBhcmFtZXRlcnMvc2VsZWN0IG9wdGlvbnMgdGhhdCBhcmUgc2V0IGJ5IHVzZXJcblx0ICogICAgICAgICAgZGVmYXVsdCBkYXRhPC9saT5cblx0ICogICAgICAgICAgPGxpPjxjb2RlPm9BcHBEYXRhLmJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHk8L2NvZGU+OiBBIEJvb2xlYW4gZmxhZyB0aGF0IGluZGljYXRlcyB3aGV0aGVyIG9ubHkgZGVmYXVsdGVkIHBhcmFtZXRlcnMgYW5kIG5vXG5cdCAqICAgICAgICAgIG5hdmlnYXRpb24gcGFyYW1ldGVycyBhcmUgcHJlc2VudC48YnI+XG5cdCAqICAgICAgICAgIDxiPk5vdGU6PC9iPiBJZiBubyBuYXZpZ2F0aW9uIHBhcmFtZXRlcnMgYXJlIGF2YWlsYWJsZSwgPGNvZGU+Yk5hdlNlbFZhckhhc0RlZmF1bHRzT25seTwvY29kZT4gaXMgc2V0IHRvIDxjb2RlPnRydWU8L2NvZGU+LFxuXHQgKiAgICAgICAgICBldmVuIHRob3VnaCBwYXJhbWV0ZXJzIHdpdGhvdXQgZGVmYXVsdCBtaWdodCBiZSBhdmFpbGFibGUgYXMgd2VsbC48L2xpPlxuXHQgKiAgICAgICAgICA8L3VsPlxuXHQgKiAgICAgICAgICBJZiB0aGUgbmF2aWdhdGlvbi1yZWxhdGVkIHNlbGVjdGlvbiB2YXJpYW50IGlzIGVtcHR5LCBpdCBpcyByZXBsYWNlZCBieSBhIGNvcHkgb2YgdGhlIGRlZmF1bHRlZCBzZWxlY3Rpb24gdmFyaWFudC48YnI+XG5cdCAqICAgICAgICAgIFRoZSBuYXZpZ2F0aW9uIHR5cGUgaXMgYW4gZW51bWVyYXRpb24gdHlwZSBvZiB0eXBlIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZUeXBlfSAocG9zc2libGUgdmFsdWVzIGFyZVxuXHQgKiAgICAgICAgICBpbml0aWFsLCBVUkxQYXJhbXMsIHhBcHBTdGF0ZSwgYW5kIGlBcHBTdGF0ZSkuPGJyPlxuXHQgKiAgICAgICAgICA8Yj5Ob3RlOjwvYj4gSWYgdGhlIG5hdmlnYXRpb24gdHlwZSBpcyB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2VHlwZS5pQXBwU3RhdGV9IG9BcHBEYXRhIGhhcyB0d29cblx0ICogICAgICAgICAgYWRkaXRpb25hbCBwcm9wZXJ0aWVzXG5cdCAqICAgICAgICAgIDx1bD5cblx0ICogICAgICAgICAgPGxpPjxjb2RlPm9BcHBEYXRhLnRhYmxlVmFyaWFudElkPC9jb2RlPjwvbGk+XG5cdCAqICAgICAgICAgIDxsaT48Y29kZT5vQXBwRGF0YS5jdXN0b21EYXRhPC9jb2RlPjwvbGk+XG5cdCAqICAgICAgICAgIDwvdWw+XG5cdCAqICAgICAgICAgIHdoaWNoIHJldHVybiB0aGUgaW5uZXIgYXBwIGRhdGEgYXMgc3RvcmVkIGluIHtAbGluayAjLm5hdmlnYXRlIG5hdmlnYXRlfSBvciB7QGxpbmsgIy5zdG9yZUlubmVyQXBwU3RhdGVBc3luYyBzdG9yZUlubmVyQXBwU3RhdGVBc3luY30uXG5cdCAqICAgICAgICAgIDxjb2RlPm9BcHBEYXRhLm9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50PC9jb2RlPiBpcyBhbiBlbXB0eSBzZWxlY3Rpb24gdmFyaWFudCBhbmRcblx0ICogICAgICAgICAgPGNvZGU+b0FwcERhdGEuYk5hdlNlbFZhckhhc0RlZmF1bHRzT25seTwvY29kZT4gaXMgPGNvZGU+ZmFsc2U8L2NvZGU+IGluIHRoaXMgY2FzZS48YnI+XG5cdCAqICAgICAgICAgIDxiPk5vdGU6PC9iPiBJZiB0aGUgbmF2aWdhdGlvbiB0eXBlIGlzIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZUeXBlLmluaXRpYWx9IG9BcHBEYXRhIGlzIGFuIGVtcHR5IG9iamVjdCE8YnI+XG5cdCAqICAgICAgICAgIElmIGFuIGVycm9yIG9jY3VycywgYW4gZXJyb3Igb2JqZWN0IG9mIHR5cGUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSwgVVJMIHBhcmFtZXRlcnMgKGlmIGF2YWlsYWJsZSlcblx0ICogICAgICAgICAgYW5kIHRoZSB0eXBlIG9mIG5hdmlnYXRpb24gYXJlIHJldHVybmVkLlxuXHQgKiBAcHVibGljXG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKiBzYXAudWkuZGVmaW5lKFtcInNhcC9mZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25IYW5kbGVyXCJdLCBmdW5jdGlvbiAoTmF2aWdhdGlvbkhhbmRsZXIpIHtcblx0ICogXHR2YXIgb05hdmlnYXRpb25IYW5kbGVyID0gbmV3IE5hdmlnYXRpb25IYW5kbGVyKG9Db250cm9sbGVyKTtcblx0ICogXHR2YXIgb1BhcnNlTmF2aWdhdGlvblByb21pc2UgPSBvTmF2aWdhdGlvbkhhbmRsZXIucGFyc2VOYXZpZ2F0aW9uKCk7XG5cdCAqXG5cdCAqIFx0b1BhcnNlTmF2aWdhdGlvblByb21pc2UuZG9uZShmdW5jdGlvbihvQXBwRGF0YSwgb1N0YXJ0dXBQYXJhbWV0ZXJzLCBzTmF2VHlwZSl7XG5cdCAqIFx0XHRcdG9TbWFydEZpbHRlckJhci5zZXREYXRhU3VpdGVGb3JtYXQob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCk7XG5cdCAqIFx0XHRcdC8vIG9BcHBEYXRhLm9TZWxlY3Rpb25WYXJpYW50IGNhbiBiZSB1c2VkIHRvIG1hbmlwdWxhdGUgdGhlIHNlbGVjdGlvbiB2YXJpYW50XG5cdCAqIFx0XHRcdC8vIG9BcHBEYXRhLm9EZWZhdWx0ZWRTZWxlY3Rpb25WYXJpYW50IGNvbnRhaW5zIHRoZSBwYXJhbWV0ZXJzIHdoaWNoIGFyZSBzZXQgYnkgdXNlciBkZWZhdWx0c1xuXHQgKiBcdFx0XHQvLyBvQXBwRGF0YS5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5IGluZGljYXRlcyB3aGV0aGVyIG9ubHkgZGVmYXVsdGVkIHBhcmFtZXRlcnMgYW5kIG5vIG5hdmlnYXRpb24gcGFyYW1ldGVycyBhcmUgcHJlc2VudFxuXHQgKiBcdH0pO1xuXHQgKiBcdG9QYXJzZU5hdmlnYXRpb25Qcm9taXNlLmZhaWwoZnVuY3Rpb24ob0Vycm9yLCBvVVJMUGFyYW1ldGVycywgc05hdlR5cGUpe1xuXHQgKiBcdFx0Ly8gaWYgZS5nLiB0aGUgeGFwcCBzdGF0ZSBjb3VsZCBub3QgYmUgbG9hZGVkLCBuZXZlcnRoZWxlc3MgdGhlcmUgbWF5IGJlIFVSTCBwYXJhbWV0ZXJzIGF2YWlsYWJsZVxuXHQgKiBcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0fSk7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqL1xuXHRwYXJzZU5hdmlnYXRpb24oKSB7XG5cdFx0Y29uc3Qgc0FwcEhhc2ggPSBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKTtcblx0XHQvKlxuXHRcdCAqIHVzZSAuZ2V0SGFzaCgpIGhlcmUgaW5zdGVhZCBvZiAuZ2V0QXBwSGFzaCgpIHRvIGFsc28gYmUgYWJsZSBkZWFsaW5nIHdpdGggZW52aXJvbm1lbnRzIHdoZXJlIG9ubHkgU0FQVUk1IGlzIGxvYWRlZCBhbmQgdGhlIFVTaGVsbCBpc1xuXHRcdCAqIG5vdCBpbml0aWFsaXplZCBwcm9wZXJseS5cblx0XHQgKi9cblx0XHRjb25zdCBzSUFwcFN0YXRlID0gdGhpcy5fZ2V0SW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaCk7XG5cblx0XHRsZXQgb0NvbXBvbmVudERhdGEgPSB0aGlzLm9Db21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpO1xuXHRcdC8qXG5cdFx0ICogVGhlcmUgYXJlIHNvbWUgcmFjZSBjb25kaXRpb25zIHdoZXJlIHRoZSBvQ29tcG9uZW50RGF0YSBtYXkgbm90IGJlIHNldCwgZm9yIGV4YW1wbGUgaW4gY2FzZSB0aGUgVVNoZWxsIHdhcyBub3QgaW5pdGlhbGl6ZWQgcHJvcGVybHkuIFRvXG5cdFx0ICogbWFrZSBzdXJlIHRoYXQgd2UgZG8gbm90IGR1bXAgaGVyZSB3aXRoIGFuIGV4Y2VwdGlvbiwgd2UgdGFrZSB0aGlzIHNwZWNpYWwgZXJyb3IgaGFuZGxpbmcgYmVoYXZpb3I6XG5cdFx0ICovXG5cdFx0aWYgKG9Db21wb25lbnREYXRhID09PSB1bmRlZmluZWQpIHtcblx0XHRcdExvZy53YXJuaW5nKFwiVGhlIG5hdmlnYXRpb24gQ29tcG9uZW50J3MgZGF0YSB3YXMgbm90IHNldCBwcm9wZXJseTsgYXNzdW1pbmcgaW5zdGVhZCB0aGF0IG5vIHBhcmFtZXRlcnMgYXJlIHByb3ZpZGVkLlwiKTtcblx0XHRcdG9Db21wb25lbnREYXRhID0ge307XG5cdFx0fVxuXG5cdFx0Ly8gUmVtYXJrOlxuXHRcdC8vIFRoZSBzdGFydHVwIHBhcmFtZXRlcnMgYXJlIGFscmVhZHkgZGVjb2RlZC4gRXhhbXBsZTpcblx0XHQvLyBUaGUgb3JpZ2luYWwgVVJMIHBhcmFtZXRlciAlMjUyNCUyNTQwJTI1MjU9JTI1MjYlMjUyRiUyNTNEIHJlc3VsdHMgaW4gb1N0YXJ0dXBQYXJhbWV0ZXJzID0geyBcIiRAJVwiIDogXCImLz1cIiB9XG5cdFx0Ly8gTm90ZSB0aGUgZG91YmxlIGVuY29kaW5nIGluIHRoZSBVUkwsIHRoaXMgaXMgY29ycmVjdC4gQW4gVVJMIHBhcmFtZXRlciBsaWtlIHh5ej0lMjUgY2F1c2VzIGFuIFwiVVJJIG1hbGZvcm1lZFwiIGVycm9yLlxuXHRcdC8vIElmIHRoZSBkZWNvZGVkIHZhbHVlIHNob3VsZCBiZSBlLmcuIFwiJTI1XCIsIHRoZSBwYXJhbWV0ZXIgaW4gdGhlIFVSTCBuZWVkcyB0byBiZTogeHl6PSUyNTI1MjVcblx0XHRjb25zdCBvU3RhcnR1cFBhcmFtZXRlcnMgPSBvQ29tcG9uZW50RGF0YS5zdGFydHVwUGFyYW1ldGVycztcblx0XHRjb25zdCBoeWJyaWRJQXBwU3RhdGVLZXlQYXJhbXM6IHN0cmluZyB8IHVuZGVmaW5lZCA9IG9TdGFydHVwUGFyYW1ldGVycz8uW0hZQlJJRF9JQVBQX1NUQVRFX0tFWV0/LlswXTtcblx0XHRjb25zdCBoeWJyaWREZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXHRcdGxldCBpQXBwU3RhdGVIeWJyaWREZWZlcnJlZDogalF1ZXJ5LkRlZmVycmVkIHwgdW5kZWZpbmVkO1xuXHRcdGlmIChoeWJyaWRJQXBwU3RhdGVLZXlQYXJhbXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aUFwcFN0YXRlSHlicmlkRGVmZXJyZWQgPSB0aGlzLl9sb2FkQXBwU3RhdGUoaHlicmlkSUFwcFN0YXRlS2V5UGFyYW1zLCBoeWJyaWREZWZlcnJlZCwgTmF2VHlwZS5oeWJyaWQpO1xuXHRcdH1cblxuXHRcdGxldCBhRGVmYXVsdGVkUGFyYW1ldGVyczogYW55ID0gW107XG5cdFx0aWYgKFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzICYmXG5cdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnNbREVGQVVMVEVEX1BBUkFNRVRFUl9QUk9QRVJUWV0gJiZcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc1tERUZBVUxURURfUEFSQU1FVEVSX1BST1BFUlRZXS5sZW5ndGggPiAwXG5cdFx0KSB7XG5cdFx0XHRhRGVmYXVsdGVkUGFyYW1ldGVycyA9IEpTT04ucGFyc2Uob1N0YXJ0dXBQYXJhbWV0ZXJzW0RFRkFVTFRFRF9QQVJBTUVURVJfUFJPUEVSVFldWzBdKTtcblx0XHR9XG5cblx0XHRjb25zdCBvTXlEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXHRcdGNvbnN0IHBhcnNlVXJsUGFyYW1zID0gZnVuY3Rpb24gKG9TdWJTdGFydHVwUGFyYW1ldGVyczogYW55LCBhU3ViRGVmYXVsdGVkUGFyYW1ldGVyczogYW55LCBvU3ViTXlEZWZlcnJlZDogYW55LCBzTmF2VHlwZTogYW55KSB7XG5cdFx0XHQvLyBzdGFuZGFyZCBVUkwgbmF2aWdhdGlvblxuXHRcdFx0Y29uc3Qgb1NlbFZhcnMgPSBvTmF2SGFuZGxlci5fc3BsaXRJbmJvdW5kTmF2aWdhdGlvblBhcmFtZXRlcnMoXG5cdFx0XHRcdG5ldyBTZWxlY3Rpb25WYXJpYW50KCksXG5cdFx0XHRcdG9TdWJTdGFydHVwUGFyYW1ldGVycyxcblx0XHRcdFx0YVN1YkRlZmF1bHRlZFBhcmFtZXRlcnNcblx0XHRcdCk7XG5cdFx0XHQvLyBGb3Igc2NlbmFyaW8sIHdoZXJlIG9ubHkgaHlicmlkSUFwcFN0YXRlS2V5IGlzIHBhcnQgb2YgdXJsUGFyYW1zLCB3ZSBpZ25vcmUgdGhpcyBjb25kaXRpb25cblx0XHRcdGlmIChvU2VsVmFycy5vTmF2aWdhdGlvblNlbFZhci5pc0VtcHR5KCkgJiYgb1NlbFZhcnMub0RlZmF1bHRlZFNlbFZhci5pc0VtcHR5KCkgJiYgc05hdlR5cGUgIT09IE5hdlR5cGUuaHlicmlkKSB7XG5cdFx0XHRcdC8vIFN0YXJ0dXAgcGFyYW1ldGVycyBjb250YWluIG9ubHkgdGVjaG5pY2FsIHBhcmFtZXRlcnMgKFNBUCBzeXN0ZW0pIHdoaWNoIHdlcmUgZmlsdGVyZWQgb3V0LlxuXHRcdFx0XHQvLyBvTmF2aWdhdGlvblNlbFZhciBhbmQgb0RlZmF1bHRlZFNlbFZhciBhcmUgZW1wdHkuXG5cdFx0XHRcdC8vIFRodXMsIGNvbnNpZGVyIHRoaXMgdHlwZSBvZiBuYXZpZ2F0aW9uIGFzIGFuIGluaXRpYWwgbmF2aWdhdGlvbi5cblx0XHRcdFx0aWYgKHNOYXZUeXBlID09PSBOYXZUeXBlLnhBcHBTdGF0ZSkge1xuXHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLmdldERhdGFGcm9tQXBwU3RhdGUuZmFpbGVkXCIpO1xuXHRcdFx0XHRcdG9TdWJNeURlZmVycmVkLnJlamVjdChvRXJyb3IsIG9TdWJTdGFydHVwUGFyYW1ldGVycyB8fCB7fSwgTmF2VHlwZS54QXBwU3RhdGUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9TdWJNeURlZmVycmVkLnJlc29sdmUoe30sIG9TdWJTdGFydHVwUGFyYW1ldGVycywgTmF2VHlwZS5pbml0aWFsKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb0FwcFN0YXRlRGF0YTogYW55ID0ge307XG5cdFx0XHRcdG9BcHBTdGF0ZURhdGEuc2VsZWN0aW9uVmFyaWFudCA9IG9TZWxWYXJzLm9OYXZpZ2F0aW9uU2VsVmFyLnRvSlNPTlN0cmluZygpO1xuXHRcdFx0XHRvQXBwU3RhdGVEYXRhLm9TZWxlY3Rpb25WYXJpYW50ID0gb1NlbFZhcnMub05hdmlnYXRpb25TZWxWYXI7XG5cdFx0XHRcdG9BcHBTdGF0ZURhdGEub0RlZmF1bHRlZFNlbGVjdGlvblZhcmlhbnQgPSBvU2VsVmFycy5vRGVmYXVsdGVkU2VsVmFyO1xuXHRcdFx0XHRvQXBwU3RhdGVEYXRhLmJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkgPSBvU2VsVmFycy5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5O1xuXG5cdFx0XHRcdC8vIG5vIHNhcC14YXBwLXN0YXRlIGJ1dCBuYXZUeXBlIGlzIGh5YnJpZCwgZXh0cmFjdCB0aGUgSUFwcFN0YXRlRGF0YVxuXHRcdFx0XHRpZiAoc05hdlR5cGUgPT09IE5hdlR5cGUuaHlicmlkKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc3VjY2Vzc0hhbmRsZXJIeWJyaWRTdGF0ZSA9IGZ1bmN0aW9uIChpQXBwU3RhdGVEYXRhOiBvYmplY3QsIF9yZWY6IG9iamVjdCwgbmF2VHlwZTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRvQXBwU3RhdGVEYXRhLmlBcHBTdGF0ZSA9IGlBcHBTdGF0ZURhdGE7XG5cdFx0XHRcdFx0XHRvU3ViTXlEZWZlcnJlZC5yZXNvbHZlKG9BcHBTdGF0ZURhdGEsIG9TdGFydHVwUGFyYW1ldGVycywgbmF2VHlwZSk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRjb25zdCBmYWlsdXJlSGFuZGxlckh5YnJpZFN0YXRlID0gZnVuY3Rpb24gKG9FcnJvcjogb2JqZWN0LCBfcmVmOiBvYmplY3QsIG5hdlR5cGU6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0b1N1Yk15RGVmZXJyZWQucmVqZWN0KG9FcnJvciwgX3JlZiwgbmF2VHlwZSk7XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGlmIChpQXBwU3RhdGVIeWJyaWREZWZlcnJlZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRpQXBwU3RhdGVIeWJyaWREZWZlcnJlZC5kb25lKHN1Y2Nlc3NIYW5kbGVySHlicmlkU3RhdGUpO1xuXHRcdFx0XHRcdFx0aUFwcFN0YXRlSHlicmlkRGVmZXJyZWQuZmFpbChmYWlsdXJlSGFuZGxlckh5YnJpZFN0YXRlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b1N1Yk15RGVmZXJyZWQucmVzb2x2ZShvQXBwU3RhdGVEYXRhLCBvU3ViU3RhcnR1cFBhcmFtZXRlcnMsIHNOYXZUeXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0aWYgKHNJQXBwU3RhdGUpIHtcblx0XHRcdC8vIGlubmVyIGFwcCBzdGF0ZSBpcyBhdmFpbGFibGUgaW4gdGhlIEFwcEhhc2ggKGJhY2sgbmF2aWdhdGlvbik7IGV4dHJhY3QgdGhlIHBhcmFtZXRlciB2YWx1ZVxuXHRcdFx0dGhpcy5fbG9hZEFwcFN0YXRlKHNJQXBwU3RhdGUsIG9NeURlZmVycmVkLCBOYXZUeXBlLmlBcHBTdGF0ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG5vIGJhY2sgbmF2aWdhdGlvblxuXHRcdFx0Y29uc3QgYklzWGFwcFN0YXRlTmF2aWdhdGlvbiA9IG9Db21wb25lbnREYXRhW1wic2FwLXhhcHAtc3RhdGVcIl0gIT09IHVuZGVmaW5lZDtcblx0XHRcdGlmIChiSXNYYXBwU3RhdGVOYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xuXHRcdFx0XHQvLyBpbm5lciBhcHAgc3RhdGUgd2FzIG5vdCBmb3VuZCBpbiB0aGUgQXBwSGFzaCwgYnV0IHhhcHAgc3RhdGUgPT4gdHJ5IHRvIHJlYWQgdGhlIHhhcHAgc3RhdGVcblx0XHRcdFx0dGhpcy5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYygpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9Dcm9zc0FwcE5hdlNlcnZpY2U6IGFueSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1N0YXJ0dXBQcm9taXNlID0gb0Nyb3NzQXBwTmF2U2VydmljZS5nZXRTdGFydHVwQXBwU3RhdGUodGhhdC5vQ29tcG9uZW50KTtcblx0XHRcdFx0XHRcdG9TdGFydHVwUHJvbWlzZS5kb25lKGZ1bmN0aW9uIChvQXBwU3RhdGU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHQvLyBnZXQgYXBwIHN0YXRlIGZyb20gc2FwLXhhcHAtc3RhdGUsXG5cdFx0XHRcdFx0XHRcdC8vIGNyZWF0ZSBhIGNvcHksIG5vdCBvbmx5IGEgcmVmZXJlbmNlLCBiZWNhdXNlIHdlIHdhbnQgdG8gbW9kaWZ5IHRoZSBvYmplY3Rcblx0XHRcdFx0XHRcdFx0bGV0IG9BcHBTdGF0ZURhdGEgPSBvQXBwU3RhdGUuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdFx0XHRsZXQgb0Vycm9yO1xuXHRcdFx0XHRcdFx0XHRpZiAob0FwcFN0YXRlRGF0YSkge1xuXHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvQXBwU3RhdGVEYXRhID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvQXBwU3RhdGVEYXRhKSk7XG5cdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAoeCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b0Vycm9yID0gb05hdkhhbmRsZXIuX2NyZWF0ZVRlY2huaWNhbEVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuQXBwU3RhdGVEYXRhLnBhcnNlRXJyb3JcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRvTXlEZWZlcnJlZC5yZWplY3Qob0Vycm9yLCBvU3RhcnR1cFBhcmFtZXRlcnMsIE5hdlR5cGUueEFwcFN0YXRlKTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvTXlEZWZlcnJlZC5wcm9taXNlKCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKG9BcHBTdGF0ZURhdGEpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvU2VsVmFyID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob0FwcFN0YXRlRGF0YS5zZWxlY3Rpb25WYXJpYW50KTtcblxuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9TZWxWYXJzID0gb05hdkhhbmRsZXIuX3NwbGl0SW5ib3VuZE5hdmlnYXRpb25QYXJhbWV0ZXJzKFxuXHRcdFx0XHRcdFx0XHRcdFx0b1NlbFZhcixcblx0XHRcdFx0XHRcdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdGFEZWZhdWx0ZWRQYXJhbWV0ZXJzXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRvQXBwU3RhdGVEYXRhLnNlbGVjdGlvblZhcmlhbnQgPSBvU2VsVmFycy5vTmF2aWdhdGlvblNlbFZhci50b0pTT05TdHJpbmcoKTtcblx0XHRcdFx0XHRcdFx0XHRvQXBwU3RhdGVEYXRhLm9TZWxlY3Rpb25WYXJpYW50ID0gb1NlbFZhcnMub05hdmlnYXRpb25TZWxWYXI7XG5cdFx0XHRcdFx0XHRcdFx0b0FwcFN0YXRlRGF0YS5vRGVmYXVsdGVkU2VsZWN0aW9uVmFyaWFudCA9IG9TZWxWYXJzLm9EZWZhdWx0ZWRTZWxWYXI7XG5cdFx0XHRcdFx0XHRcdFx0b0FwcFN0YXRlRGF0YS5iTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5ID0gb1NlbFZhcnMuYk5hdlNlbFZhckhhc0RlZmF1bHRzT25seTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdWNjZXNzSGFuZGxlckh5YnJpZFN0YXRlID0gZnVuY3Rpb24gKGlBcHBTdGF0ZURhdGE6IG9iamVjdCwgX3JlZjogb2JqZWN0LCBuYXZUeXBlOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9BcHBTdGF0ZURhdGEuaUFwcFN0YXRlID0gaUFwcFN0YXRlRGF0YTtcblx0XHRcdFx0XHRcdFx0XHRcdG9NeURlZmVycmVkLnJlc29sdmUob0FwcFN0YXRlRGF0YSwgb1N0YXJ0dXBQYXJhbWV0ZXJzLCBuYXZUeXBlKTtcblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdGlmIChoeWJyaWRJQXBwU3RhdGVLZXlQYXJhbXMgIT09IHVuZGVmaW5lZCAmJiBpQXBwU3RhdGVIeWJyaWREZWZlcnJlZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpQXBwU3RhdGVIeWJyaWREZWZlcnJlZC5kb25lKHN1Y2Nlc3NIYW5kbGVySHlicmlkU3RhdGUpO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAob0FwcFN0YXRlRGF0YVtIWUJSSURfSUFQUF9TVEFURV9LRVldKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGF0Ll9sb2FkQXBwU3RhdGUob0FwcFN0YXRlRGF0YVtIWUJSSURfSUFQUF9TVEFURV9LRVldLCBoeWJyaWREZWZlcnJlZCwgTmF2VHlwZS5oeWJyaWQpLmRvbmUoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN1Y2Nlc3NIYW5kbGVySHlicmlkU3RhdGVcblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9NeURlZmVycmVkLnJlc29sdmUob0FwcFN0YXRlRGF0YSwgb1N0YXJ0dXBQYXJhbWV0ZXJzLCBOYXZUeXBlLnhBcHBTdGF0ZSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG9TdGFydHVwUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdFx0XHRcdHBhcnNlVXJsUGFyYW1zKG9TdGFydHVwUGFyYW1ldGVycywgYURlZmF1bHRlZFBhcmFtZXRlcnMsIG9NeURlZmVycmVkLCBOYXZUeXBlLnhBcHBTdGF0ZSk7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gc2FwLXhhcHAtc3RhdGUgbmF2aWdhdGlvbiwgYnV0IElEIGhhcyBhbHJlYWR5IGV4cGlyZWQsIGJ1dCBVUkwgcGFyYW1ldGVycyBhdmFpbGFibGVcblx0XHRcdFx0XHRcdFx0XHRvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5nZXREYXRhRnJvbUFwcFN0YXRlLmZhaWxlZFwiKTtcblx0XHRcdFx0XHRcdFx0XHRvTXlEZWZlcnJlZC5yZWplY3Qob0Vycm9yLCBvU3RhcnR1cFBhcmFtZXRlcnMgfHwge30sIE5hdlR5cGUueEFwcFN0YXRlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRvU3RhcnR1cFByb21pc2UuZmFpbChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLmdldFN0YXJ0dXBTdGF0ZS5mYWlsZWRcIik7XG5cdFx0XHRcdFx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IsIHt9LCBOYXZUeXBlLnhBcHBTdGF0ZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHJldHVybiBvU3RhcnR1cFByb21pc2U7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0Vycm9yID0gb05hdkhhbmRsZXIuX2NyZWF0ZVRlY2huaWNhbEVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuX2dldEFwcE5hdmlnYXRpb25TZXJ2aWNlQXN5bmMuZmFpbGVkXCIpO1xuXHRcdFx0XHRcdFx0b015RGVmZXJyZWQucmVqZWN0KG9FcnJvciwge30sIE5hdlR5cGUueEFwcFN0YXRlKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdC8vIG5vIHNhcC14YXBwLXN0YXRlXG5cdFx0XHRcdHBhcnNlVXJsUGFyYW1zKFxuXHRcdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyxcblx0XHRcdFx0XHRhRGVmYXVsdGVkUGFyYW1ldGVycyxcblx0XHRcdFx0XHRvTXlEZWZlcnJlZCxcblx0XHRcdFx0XHRoeWJyaWRJQXBwU3RhdGVLZXlQYXJhbXMgIT09IHVuZGVmaW5lZCA/IE5hdlR5cGUuaHlicmlkIDogTmF2VHlwZS5VUkxQYXJhbXNcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGluaXRpYWwgbmF2aWdhdGlvblxuXHRcdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKHt9LCB7fSwgTmF2VHlwZS5pbml0aWFsKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb015RGVmZXJyZWQucHJvbWlzZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGFwcGxpY2F0aW9uIHNwZWNpZmljIHRlY2huaWNhbCBwYXJhbWV0ZXJzLiBUZWNobmljYWwgcGFyYW1ldGVycyB3aWxsIG5vdCBiZSBhZGRlZCB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgcGFzc2VkIHRvIHRoZVxuXHQgKiBhcHBsaWNhdGlvbi4gQXMgYSBkZWZhdWx0IHRoZSBmb2xsb3dpbmcgdmFsdWVzIGFyZSBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXJzOlxuXHQgKiA8dWw+XG5cdCAqIDxsaT48Y29kZT5zYXAtc3lzdGVtPC9jb2RlPjwvbGk+XG5cdCAqIDxsaT48Y29kZT5zYXAtdXNoZWxsLWRlZmF1bHRlZFBhcmFtZXRlck5hbWVzPC9jb2RlPjwvbGk+XG5cdCAqIDxsaT48Y29kZT5cImhjcEFwcGxpY2F0aW9uSWRcIjwvY29kZT48L2xpPlxuXHQgKiA8L3VsPi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAZnVuY3Rpb24gc2V0VGVjaG5pY2FsUGFyYW1ldGVyc1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIucHJvdG90eXBlXG5cdCAqIEBwYXJhbSB7QXJyYXl9IGFUZWNobmljYWxQYXJhbWV0ZXJzIExpc3Qgb2YgcGFyYW1ldGVyIG5hbWVzIHRvIGJlIGNvbnNpZGVyZWQgYXMgdGVjaG5pY2FsIHBhcmFtZXRlcnMuIDxjb2RlPm51bGw8L2NvZGU+IG9yXG5cdCAqICAgICAgICA8Y29kZT51bmRlZmluZWQ8L2NvZGU+IG1heSBiZSB1c2VkIHRvIHJlc2V0IHRoZSBjb21wbGV0ZSBsaXN0LlxuXHQgKi9cblx0c2V0VGVjaG5pY2FsUGFyYW1ldGVycyhhVGVjaG5pY2FsUGFyYW1ldGVycz86IGFueVtdKSB7XG5cdFx0aWYgKCFhVGVjaG5pY2FsUGFyYW1ldGVycykge1xuXHRcdFx0YVRlY2huaWNhbFBhcmFtZXRlcnMgPSBbXTtcblx0XHR9XG5cblx0XHRpZiAoIUFycmF5LmlzQXJyYXkoYVRlY2huaWNhbFBhcmFtZXRlcnMpKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlcjogcGFyYW1ldGVyIGluY29ycmVjdCwgYXJyYXkgb2Ygc3RyaW5ncyBleHBlY3RlZFwiKTtcblx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0fVxuXG5cdFx0dGhpcy5fYVRlY2huaWNhbFBhcmFtYXRlcnMgPSBhVGVjaG5pY2FsUGFyYW1ldGVycztcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBhcHBsaWNhdGlvbiBzcGVjaWZpYyB0ZWNobmljYWwgcGFyYW1ldGVycy4gVGVjaG5pY2FsIHBhcmFtZXRlcnMgd2lsbCBub3QgYmUgYWRkZWQgdG8gdGhlIHNlbGVjdGlvbiB2YXJpYW50IHBhc3NlZCB0byB0aGVcblx0ICogYXBwbGljYXRpb24uIEFzIGEgZGVmYXVsdCB0aGUgZm9sbG93aW5nIHZhbHVlcyBhcmUgY29uc2lkZXJlZCBhcyB0ZWNobmljYWwgcGFyYW1ldGVyczpcblx0ICogPHVsPlxuXHQgKiA8bGk+PGNvZGU+c2FwLXN5c3RlbTwvY29kZT48L2xpPlxuXHQgKiA8bGk+PGNvZGU+c2FwLXVzaGVsbC1kZWZhdWx0ZWRQYXJhbWV0ZXJOYW1lczwvY29kZT48L2xpPlxuXHQgKiA8bGk+PGNvZGU+XCJoY3BBcHBsaWNhdGlvbklkXCI8L2NvZGU+PC9saT5cblx0ICogPC91bD4uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQGZ1bmN0aW9uIGdldFRlY2huaWNhbFBhcmFtZXRlcnNcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyLnByb3RvdHlwZVxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IENvbnRhaW5pbmcgdGhlIHRlY2huaWNhbCBwYXJhbWV0ZXJzLlxuXHQgKi9cblx0Z2V0VGVjaG5pY2FsUGFyYW1ldGVycygpIHtcblx0XHRyZXR1cm4gdGhpcy5fYVRlY2huaWNhbFBhcmFtYXRlcnMuY29uY2F0KFtdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIHBhc3NlZCBwYXJhbWV0ZXIgaXMgY29uc2lkZXJlZCBhcyB0ZWNobmljYWwgcGFyYW1ldGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhcmFtZXRlck5hbWUgTmFtZSBvZiBhIHJlcXVlc3QgcGFyYW1ldGVyLCBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXIuXG5cdCAqIEByZXR1cm5zIEluZGljYXRlcyBpZiB0aGUgcGFyYW1ldGVyIGlzIGNvbnNpZGVyZWQgYXMgdGVjaG5pY2FsIHBhcmFtZXRlciBvciBub3QuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfaXNUZWNobmljYWxQYXJhbWV0ZXIoc1BhcmFtZXRlck5hbWU6IHN0cmluZykge1xuXHRcdGlmIChzUGFyYW1ldGVyTmFtZSkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQhKFxuXHRcdFx0XHRcdHNQYXJhbWV0ZXJOYW1lID09PSBcInNhcC11aS1mZS12YXJpYW50LWlkXCIgfHxcblx0XHRcdFx0XHRzUGFyYW1ldGVyTmFtZSA9PT0gXCJzYXAtdWktZmUtdGFibGUtdmFyaWFudC1pZFwiIHx8XG5cdFx0XHRcdFx0c1BhcmFtZXRlck5hbWUgPT09IFwic2FwLXVpLWZlLWNoYXJ0LXZhcmlhbnQtaWRcIiB8fFxuXHRcdFx0XHRcdHNQYXJhbWV0ZXJOYW1lID09PSBcInNhcC11aS1mZS1maWx0ZXJiYXItdmFyaWFudC1pZFwiXG5cdFx0XHRcdClcblx0XHRcdCkge1xuXHRcdFx0XHRpZiAoc1BhcmFtZXRlck5hbWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwic2FwLVwiKSA9PT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMuX2FUZWNobmljYWxQYXJhbWF0ZXJzLmluZGV4T2Yoc1BhcmFtZXRlck5hbWUpID49IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRfaXNGRVBhcmFtZXRlcihzUGFyYW1ldGVyTmFtZTogYW55KSB7XG5cdFx0cmV0dXJuIHNQYXJhbWV0ZXJOYW1lLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcInNhcC11aS1mZVwiKSA9PT0gMDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSbW92ZXMgaWYgdGhlIHBhc3NlZCBwYXJhbWV0ZXIgaXMgY29uc2lkZXJlZCBhcyB0ZWNobmljYWwgcGFyYW1ldGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NlbGVjdGlvblZhcmlhbnQgU2VsZWN0aW9uIFZhcmlhbnQgd2hpY2ggY29uc2lzdHMgb2YgdGVjaG5pY2FsIFBhcmFtZXRlcnMuXG5cdCAqIEByZXR1cm5zIFNlbGVjdGlvbiBWYXJpYW50IHdpdGhvdXQgdGVjaG5pY2FsIFBhcmFtZXRlcnMuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyhvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdGxldCBzUHJvcE5hbWUsIGk7XG5cdFx0Y29uc3QgYVNlbFZhclByb3BOYW1lcyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCk7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGFTZWxWYXJQcm9wTmFtZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHNQcm9wTmFtZSA9IGFTZWxWYXJQcm9wTmFtZXNbaV07XG5cdFx0XHRpZiAodGhpcy5faXNUZWNobmljYWxQYXJhbWV0ZXIoc1Byb3BOYW1lKSkge1xuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oc1Byb3BOYW1lKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIFNwbGl0cyB0aGUgcGFyYW1ldGVycyBwcm92aWRlZCBkdXJpbmcgaW5ib3VuZCBuYXZpZ2F0aW9uIGFuZCBzZXBhcmF0ZXMgdGhlIGNvbnRleHR1YWwgaW5mb3JtYXRpb24gYmV0d2VlbiBkZWZhdWx0ZWQgcGFyYW1ldGVyIHZhbHVlcyBhbmRcblx0ICogbmF2aWdhdGlvbiBwYXJhbWV0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NlbGVjdGlvblZhcmlhbnQgSW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnR9IGNvbnRhaW5pbmcgbmF2aWdhdGlvbiBkYXRhIG9mXG5cdCAqICAgICAgICB0aGUgYXBwXG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgc3RhcnR1cCBwYXJhbWV0ZXJzIG9mIHRoZSBhcHAgKGRlcml2ZWQgZnJvbSB0aGUgY29tcG9uZW50KVxuXHQgKiBAcGFyYW0gYURlZmF1bHRlZFBhcmFtZXRlcnMgQXJyYXkgY29udGFpbmluZyBkZWZhdWx0ZWQgcGFyYW1ldGVyIG5hbWVzXG5cdCAqIEByZXR1cm5zIE9iamVjdCBjb250YWluaW5nIHR3byBTZWxlY3Rpb25WYXJpYW50cywgb25lIGZvciBuYXZpZ2F0aW9uIChvTmF2aWdhdGlvblNlbFZhcikgYW5kIG9uZSBmb3IgZGVmYXVsdGVkIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHQgKiAgICAgICAgICAob0RlZmF1bHRlZFNlbFZhciksIGFuZCBhIGZsYWcgKGJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkpIGluZGljYXRpbmcgd2hldGhlciBhbGwgcGFyYW1ldGVycyB3ZXJlIGRlZmF1bHRlZC4gVGhlIGZ1bmN0aW9uIGlzXG5cdCAqICAgICAgICAgIGhhbmRlZCB0d28gb2JqZWN0cyBjb250YWluaW5nIHBhcmFtZXRlcnMgKG5hbWVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIHZhbHVlcyksIG9TZWxlY3Rpb25WYXJpYW50IGFuZCBvU3RhcnR1cFBhcmFtZXRlcnMuIEFcblx0ICogICAgICAgICAgcGFyYW1ldGVyIGNvdWxkIGJlIHN0b3JlZCBpbiBqdXN0IG9uZSBvZiB0aGVzZSB0d28gb2JqZWN0cyBvciBpbiBib3RoIG9mIHRoZW0gc2ltdWx0YW5lb3VzbHkuIEJlY2F1c2Ugb2YgdGhlIGxhdHRlciBjYXNlIGFcblx0ICogICAgICAgICAgcGFyYW1ldGVyIGNvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aCBjb25mbGljdGluZyB2YWx1ZXMgYW5kIGl0IGlzIHRoZSBqb2Igb2YgdGhpcyBmdW5jdGlvbiB0byByZXNvbHZlIGFueSBzdWNoIGNvbmZsaWN0LiBQYXJhbWV0ZXJzXG5cdCAqICAgICAgICAgIGFyZSBhc3NpZ25lZCB0byB0aGUgdHdvIHJldHVybmVkIFNlbGVjdGlvblZhcmlhbnRzLCBvTmF2aWdhdGlvblNlbFZhciBhbmQgb0RlZmF1bHRlZFNlbFZhciwgYXMgZm9sbG93czogfCBwYXJhbWV0ZXIgTk9UIGluIHxcblx0ICogICAgICAgICAgcGFyYW1ldGVyIGluIHwgb1NlbGVjdGlvblZhcmlhbnQgfCBvU2VsZWN0aW9uVmFyaWFudCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS18LS0tLS0tLS0tLS0tLS0tLS0tIHBhcmFtZXRlciBOT1QgaW4gfFxuXHQgKiAgICAgICAgICBub3RoaW5nIHRvIGRvIHwgQWRkIHBhcmFtZXRlciBvU3RhcnR1cFBhcmFtZXRlcnMgfCBoZXJlIHwgKHNlZSBiZWxvdykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQgKiAgICAgICAgICBwYXJhbWV0ZXIgaW4gfCBBZGQgcGFyYW1ldGVyIHwgQ29uZmxpY3QgcmVzb2x1dGlvbiBvU3RhcnR1cFBhcmFtZXRlcnMgfCAoc2VlIGJlbG93KSB8IChzZWUgYmVsb3cpIEFkZCBwYXJhbWV0ZXI6IGlmIHBhcmFtZXRlciBpblxuXHQgKiAgICAgICAgICBhRGVmYXVsdGVkUGFyYW1ldGVyczogYWRkIHBhcmFtZXRlciB0byBvRGVmYXVsdGVkU2VsVmFyIGVsc2U6IGFkZCBwYXJhbWV0ZXIgdG8gb05hdmlnYXRpb25TZWxWYXIgQ29uZmxpY3QgcmVzb2x1dGlvbjogaWYgcGFyYW1ldGVyXG5cdCAqICAgICAgICAgIGluIGFEZWZhdWx0ZWRQYXJhbWV0ZXJzOiBhZGQgcGFyYW1ldGVyIHZhbHVlIGZyb20gb1NlbGVjdGlvblZhcmlhbnQgdG8gb05hdmlnYXRpb25TZWxWYXIgYWRkIHBhcmFtZXRlciB2YWx1ZSBmcm9tXG5cdCAqICAgICAgICAgIG9TdGFydHVwUGFyYW1ldGVycyB0byBvRGVmYXVsdGVkU2VsVmFyIE5vdGU6IFRoaXMgY2FzZSBvbmx5IG9jY3VycyBpbiBVSTUgMS4zMi4gSW4gbGF0ZXIgdmVyc2lvbnMgVVNoZWxsIHN0b3JlcyBhbnkgZGVmYXVsdGVkXG5cdCAqICAgICAgICAgIHBhcmFtZXRlciBlaXRoZXIgaW4gb1NlbGVjdGlvblZhcmlhbnQgb3Igb1N0YXJ0dXBQYXJhbWV0ZXJzIGJ1dCBuZXZlciBzaW11bHRhbmVvdXNseSBpbiBib3RoLiBlbHNlOiBDaG9vc2UgMSBvZiB0aGUgZm9sbG93aW5nXG5cdCAqICAgICAgICAgIG9wdGlvbnMgYmFzZWQgb24gZ2l2ZW4gaGFuZGxpbmcgbW9kZSAodGhpcy5zUGFyYW1IYW5kbGluZ01vZGUpLiAtPiBhZGQgcGFyYW1ldGVyIHZhbHVlIGZyb20gb1N0YXJ0dXBQYXJhbWV0ZXJzIHRvXG5cdCAqICAgICAgICAgIG9OYXZpZ2F0aW9uU2VsVmFyIHwgLT4gYWRkIHBhcmFtZXRlciB2YWx1ZSBmcm9tIG9BcHBTdGF0ZS5zZWxlY3Rpb25WYXJpYW50IHRvIG9OYXZpZ2F0aW9uU2VsVmFyIC0+IGFkZCBib3RoIHBhcmFtZXRlciB2YWx1ZXMgdG9cblx0ICogICAgICAgICAgbmF2aWdhdGlvblNlbFZhciBJZiBuYXZpZ2F0aW9uU2VsVmFyIGlzIHN0aWxsIGVtcHR5IGF0IHRoZSBlbmQgb2YgZXhlY3V0aW9uLCBuYXZpZ2F0aW9uU2VsVmFyIGlzIHJlcGxhY2VkIGJ5IGEgY29weSBvZlxuXHQgKiAgICAgICAgICBvRGVmYXVsdGVkU2VsVmFyIGFuZCB0aGUgZmxhZyBiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5IGlzIHNldCB0byB0cnVlLiBUaGUgc2VsZWN0aW9uIHZhcmlhbnQgb0RlZmF1bHRlZFNlbFZhciBpdHNlbGYgaXMgYWx3YXlzXG5cdCAqICAgICAgICAgIHJldHVybmVkIGFzIGlzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NwbGl0SW5ib3VuZE5hdmlnYXRpb25QYXJhbWV0ZXJzKFxuXHRcdG9TZWxlY3Rpb25WYXJpYW50OiBJbnN0YW5jZVR5cGU8dHlwZW9mIFNlbGVjdGlvblZhcmlhbnQ+LFxuXHRcdG9TdGFydHVwUGFyYW1ldGVyczogeyBba2V5OiBzdHJpbmddOiBhbnkgfSxcblx0XHRhRGVmYXVsdGVkUGFyYW1ldGVyczogYW55W11cblx0KSB7XG5cdFx0aWYgKCFBcnJheS5pc0FycmF5KGFEZWZhdWx0ZWRQYXJhbWV0ZXJzKSkge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHR9XG5cblx0XHRsZXQgc1Byb3BOYW1lLCBpO1xuXHRcdC8vIEZpcnN0IHdlIGRvIHNvbWUgcGFyc2luZyBvZiB0aGUgU3RhcnRVcCBQYXJhbWV0ZXJzLlxuXHRcdGNvbnN0IG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG5cdFx0Zm9yIChzUHJvcE5hbWUgaW4gb1N0YXJ0dXBQYXJhbWV0ZXJzKSB7XG5cdFx0XHRpZiAoIW9TdGFydHVwUGFyYW1ldGVycy5oYXNPd25Qcm9wZXJ0eShzUHJvcE5hbWUpKSB7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBpZiAoc1Byb3BOYW1lID09PSBTQVBfU1lTVEVNX1BST1BFUlRZIHx8IHNQcm9wTmFtZSA9PT0gREVGQVVMVEVEX1BBUkFNRVRFUl9QUk9QRVJUWSkge1xuXHRcdFx0aWYgKHRoaXMuX2lzVGVjaG5pY2FsUGFyYW1ldGVyKHNQcm9wTmFtZSkgfHwgdGhpcy5faXNGRVBhcmFtZXRlcihzUHJvcE5hbWUpIHx8IHNQcm9wTmFtZSA9PT0gSFlCUklEX0lBUFBfU1RBVEVfS0VZKSB7XG5cdFx0XHRcdC8vIERvIG5vdCBhZGQgdGhlIFNBUCBzeXN0ZW0gcGFyYW1ldGVyIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhcyBpdCBpcyBhIHRlY2huaWNhbCBwYXJhbWV0ZXJcblx0XHRcdFx0Ly8gbm90IHJlbGV2YW50IGZvciB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuXG5cdFx0XHRcdC8vIERvIG5vdCBhZGQgdGhlIHN0YXJ0dXAgcGFyYW1ldGVyIGZvciBkZWZhdWx0IHZhbHVlcyB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQuIFRoZSBpbmZvcm1hdGlvbiwgd2hpY2ggcGFyYW1ldGVyc1xuXHRcdFx0XHQvLyBhcmUgZGVmYXVsdGVkLCBpcyBhdmFpbGFibGUgaW4gdGhlIGRlZmF1bHRlZCBzZWxlY3Rpb24gdmFyaWFudC5cblx0XHRcdFx0Ly8gSW4gY2FzZSwgRkUgUGFyYW1ldGVycyB3ZSBzaGFsbCBza2lwIGl0Lih0aGUgYXBwbGljYXRpb24gbmVlZHMgdG8gZmV0Y2ggaXQgZnJvbSBVUkwgcGFyYW1zKVxuXHRcdFx0XHQvLyBTa2lwIHRoZSBoeWJyaWRJQXBwU3RhdGVLZXkgcHJlc2VudCBhcyBwYXJ0IG9mICdIeWJyaWQnIG5hdmlnYXRpb24gdHlwZSBub3QgcmVsZXZhbnQgZm9yIHRoZSBzZWxlY3Rpb24gdmFyaWFudFxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV2Ugc3VwcG9ydCBwYXJhbWV0ZXJzIGFzIGEgbWFwIHdpdGggc3RyaW5ncyBhbmQgYXMgYSBtYXAgd2l0aCB2YWx1ZSBhcnJheXNcblx0XHRcdGlmICh0eXBlb2Ygb1N0YXJ0dXBQYXJhbWV0ZXJzW3NQcm9wTmFtZV0gPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWRbc1Byb3BOYW1lXSA9IG9TdGFydHVwUGFyYW1ldGVyc1tzUHJvcE5hbWVdO1xuXHRcdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9TdGFydHVwUGFyYW1ldGVyc1tzUHJvcE5hbWVdKSAmJiBvU3RhcnR1cFBhcmFtZXRlcnNbc1Byb3BOYW1lXS5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzQWRqdXN0ZWRbc1Byb3BOYW1lXSA9IG9TdGFydHVwUGFyYW1ldGVyc1tzUHJvcE5hbWVdWzBdOyAvLyBzaW5nbGUtdmFsdWVkIHBhcmFtZXRlcnNcblx0XHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvU3RhcnR1cFBhcmFtZXRlcnNbc1Byb3BOYW1lXSkgJiYgb1N0YXJ0dXBQYXJhbWV0ZXJzW3NQcm9wTmFtZV0ubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZFtzUHJvcE5hbWVdID0gb1N0YXJ0dXBQYXJhbWV0ZXJzW3NQcm9wTmFtZV07IC8vIG11bHRpLXZhbHVlZCBwYXJhbWV0ZXJzXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIENvbnN0cnVjdCB0d28gc2VsZWN0aW9uIHZhcmlhbnRzIGZvciBkZWZhdWx0cyBhbmQgbmF2aWdhdGlvbiB0byBiZSByZXR1cm5lZCBieSB0aGUgZnVuY3Rpb24uXG5cdFx0Y29uc3Qgb0RlZmF1bHRlZFNlbFZhciA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25TZWxWYXIgPSBuZXcgU2VsZWN0aW9uVmFyaWFudCgpO1xuXG5cdFx0Y29uc3QgYVNlbFZhclByb3BOYW1lcyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFBhcmFtZXRlck5hbWVzKCkuY29uY2F0KG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCkpO1xuXHRcdGZvciAoaSA9IDA7IGkgPCBhU2VsVmFyUHJvcE5hbWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRzUHJvcE5hbWUgPSBhU2VsVmFyUHJvcE5hbWVzW2ldO1xuXHRcdFx0aWYgKHNQcm9wTmFtZSBpbiBvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZCkge1xuXHRcdFx0XHQvLyBSZXNvbHZlIGNvbmZsaWN0LlxuXHRcdFx0XHRpZiAoYURlZmF1bHRlZFBhcmFtZXRlcnMuaW5kZXhPZihzUHJvcE5hbWUpID4gLTEpIHtcblx0XHRcdFx0XHRvTmF2aWdhdGlvblNlbFZhci5tYXNzQWRkU2VsZWN0T3B0aW9uKHNQcm9wTmFtZSwgb1NlbGVjdGlvblZhcmlhbnQuZ2V0VmFsdWUoc1Byb3BOYW1lKSEpO1xuXHRcdFx0XHRcdHRoaXMuX2FkZFBhcmFtZXRlclZhbHVlcyhvRGVmYXVsdGVkU2VsVmFyLCBzUHJvcE5hbWUsIFwiSVwiLCBcIkVRXCIsIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHN3aXRjaCAodGhpcy5zUGFyYW1IYW5kbGluZ01vZGUpIHtcblx0XHRcdFx0XHRcdGNhc2UgUGFyYW1IYW5kbGluZ01vZGUuU2VsVmFyV2luczpcblx0XHRcdFx0XHRcdFx0b05hdmlnYXRpb25TZWxWYXIubWFzc0FkZFNlbGVjdE9wdGlvbihzUHJvcE5hbWUsIG9TZWxlY3Rpb25WYXJpYW50LmdldFZhbHVlKHNQcm9wTmFtZSkhKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFBhcmFtSGFuZGxpbmdNb2RlLlVSTFBhcmFtV2luczpcblx0XHRcdFx0XHRcdFx0dGhpcy5fYWRkUGFyYW1ldGVyVmFsdWVzKG9OYXZpZ2F0aW9uU2VsVmFyLCBzUHJvcE5hbWUsIFwiSVwiLCBcIkVRXCIsIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0pO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgUGFyYW1IYW5kbGluZ01vZGUuSW5zZXJ0SW5TZWxPcHQ6XG5cdFx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uU2VsVmFyLm1hc3NBZGRTZWxlY3RPcHRpb24oc1Byb3BOYW1lLCBvU2VsZWN0aW9uVmFyaWFudC5nZXRWYWx1ZShzUHJvcE5hbWUpISk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuX2FkZFBhcmFtZXRlclZhbHVlcyhvTmF2aWdhdGlvblNlbFZhciwgc1Byb3BOYW1lLCBcIklcIiwgXCJFUVwiLCBvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZFtzUHJvcE5hbWVdKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChhRGVmYXVsdGVkUGFyYW1ldGVycy5pbmRleE9mKHNQcm9wTmFtZSkgPiAtMSkge1xuXHRcdFx0XHQvLyBwYXJhbWV0ZXIgb25seSBpbiBTZWxWYXJcblx0XHRcdFx0b0RlZmF1bHRlZFNlbFZhci5tYXNzQWRkU2VsZWN0T3B0aW9uKHNQcm9wTmFtZSwgb1NlbGVjdGlvblZhcmlhbnQuZ2V0VmFsdWUoc1Byb3BOYW1lKSEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b05hdmlnYXRpb25TZWxWYXIubWFzc0FkZFNlbGVjdE9wdGlvbihzUHJvcE5hbWUsIG9TZWxlY3Rpb25WYXJpYW50LmdldFZhbHVlKHNQcm9wTmFtZSkhKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmb3IgKHNQcm9wTmFtZSBpbiBvU3RhcnR1cFBhcmFtZXRlcnNBZGp1c3RlZCkge1xuXHRcdFx0Ly8gVGhlIGNhc2Ugd2hlcmUgdGhlIHBhcmFtZXRlciBhcHBlYXJzIHR3aWNlIGhhcyBhbHJlYWR5IGJlZW4gdGFrZW4gY2FyZSBvZiBhYm92ZSBzbyB3ZSBza2lwIGl0IGhlcmUuXG5cdFx0XHRpZiAoYVNlbFZhclByb3BOYW1lcy5pbmRleE9mKHNQcm9wTmFtZSkgPiAtMSkge1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFEZWZhdWx0ZWRQYXJhbWV0ZXJzLmluZGV4T2Yoc1Byb3BOYW1lKSA+IC0xKSB7XG5cdFx0XHRcdHRoaXMuX2FkZFBhcmFtZXRlclZhbHVlcyhvRGVmYXVsdGVkU2VsVmFyLCBzUHJvcE5hbWUsIFwiSVwiLCBcIkVRXCIsIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fYWRkUGFyYW1ldGVyVmFsdWVzKG9OYXZpZ2F0aW9uU2VsVmFyLCBzUHJvcE5hbWUsIFwiSVwiLCBcIkVRXCIsIG9TdGFydHVwUGFyYW1ldGVyc0FkanVzdGVkW3NQcm9wTmFtZV0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIHRoZSBzZWxlY3Rpb24gdmFyaWFudCB1c2VkIGZvciBuYXZpZ2F0aW9uIHNob3VsZCBiZSBmaWxsZWQgd2l0aCBkZWZhdWx0cyBpbiBjYXNlIHRoYXQgb25seSBkZWZhdWx0cyBleGlzdFxuXHRcdGxldCBiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5ID0gZmFsc2U7XG5cdFx0aWYgKG9OYXZpZ2F0aW9uU2VsVmFyLmlzRW1wdHkoKSkge1xuXHRcdFx0Yk5hdlNlbFZhckhhc0RlZmF1bHRzT25seSA9IHRydWU7XG5cdFx0XHRjb25zdCBhUHJvcE5hbWVzID0gb0RlZmF1bHRlZFNlbFZhci5nZXRTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcygpO1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8IGFQcm9wTmFtZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0b05hdmlnYXRpb25TZWxWYXIubWFzc0FkZFNlbGVjdE9wdGlvbihhUHJvcE5hbWVzW2ldLCBvRGVmYXVsdGVkU2VsVmFyLmdldFZhbHVlKGFQcm9wTmFtZXNbaV0pISk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdG9OYXZpZ2F0aW9uU2VsVmFyOiBvTmF2aWdhdGlvblNlbFZhcixcblx0XHRcdG9EZWZhdWx0ZWRTZWxWYXI6IG9EZWZhdWx0ZWRTZWxWYXIsXG5cdFx0XHRiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5OiBiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5XG5cdFx0fTtcblx0fVxuXG5cdF9hZGRQYXJhbWV0ZXJWYWx1ZXMob1NlbFZhcmlhbnQ6IGFueSwgc1Byb3BOYW1lOiBhbnksIHNTaWduOiBhbnksIHNPcHRpb246IGFueSwgb1ZhbHVlczogYW55KSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkob1ZhbHVlcykpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgb1ZhbHVlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRvU2VsVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oc1Byb3BOYW1lLCBzU2lnbiwgc09wdGlvbiwgb1ZhbHVlc1tpXSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9TZWxWYXJpYW50LmFkZFNlbGVjdE9wdGlvbihzUHJvcE5hbWUsIHNTaWduLCBzT3B0aW9uLCBvVmFsdWVzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgVVJMIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBzQXBwU3RhdGVLZXkuIEFzIGFuIHJlYWN0aW9uIHJvdXRlIGNoYW5nZSBldmVudCB3aWxsIGJlIHRyaWdnZXJlZC5cblx0ICpcblx0ICogQHBhcmFtIHNBcHBTdGF0ZUtleSBUaGUgbmV3IGFwcCBzdGF0ZSBrZXkuXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleTogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb0hhc2hDaGFuZ2VyID0gdGhpcy5vUm91dGVyLm9IYXNoQ2hhbmdlciA/IHRoaXMub1JvdXRlci5vSGFzaENoYW5nZXIgOiBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpO1xuXHRcdGNvbnN0IHNBcHBIYXNoT2xkID0gb0hhc2hDaGFuZ2VyLmdldEhhc2goKTtcblx0XHQvKlxuXHRcdCAqIHVzZSAuZ2V0SGFzaCgpIGhlcmUgaW5zdGVhZCBvZiAuZ2V0QXBwSGFzaCgpIHRvIGFsc28gYmUgYWJsZSBkZWFsaW5nIHdpdGggZW52aXJvbm1lbnRzIHdoZXJlIG9ubHkgU0FQVUk1IGlzIGxvYWRlZCBhbmQgdGhlIFVTaGVsbCBpc1xuXHRcdCAqIG5vdCBpbml0aWFsaXplZCBwcm9wZXJseS5cblx0XHQgKi9cblx0XHRjb25zdCBzQXBwSGFzaE5ldyA9IHRoaXMuX3JlcGxhY2VJbm5lckFwcFN0YXRlS2V5KHNBcHBIYXNoT2xkLCBzQXBwU3RhdGVLZXkpO1xuXHRcdG9IYXNoQ2hhbmdlci5yZXBsYWNlSGFzaChzQXBwSGFzaE5ldyk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgVVJMIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBhcHAgc3RhdGUgYW5kIHN0b3JlcyB0aGUgYXBwIHN0YXRlIGZvciBsYXRlciByZXRyaWV2YWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBtSW5uZXJBcHBEYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIGJJbW1lZGlhdGVIYXNoUmVwbGFjZSBJZiBzZXQgdG8gZmFsc2UsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCB1bnRpbCBzdG9yaW5nIGlzIHN1Y2Nlc3NmdWw7IGRvIG5vdFxuXHQgKiAgICAgICAgc2V0IHRvIGZhbHNlIGlmIHlvdSBjYW5ub3QgcmVhY3QgdG8gdGhlIHJlc29sdXRpb24gb2YgdGhlIFByb21pc2UsIGZvciBleGFtcGxlLCB3aGVuIGNhbGxpbmcgdGhlIGJlZm9yZUxpbmtQcmVzc2VkIGV2ZW50XG5cdCAqIEBwYXJhbSBiU2tpcEhhc2hSZXBsYWNlIElmIHNldCB0byB0cnVlLCB0aGUgaW5uZXIgYXBwIGhhc2ggd2lsbCBub3QgYmUgcmVwbGFjZWQgaW4gdGhlIHN0b3JlSW5uZXJBcHBTdGF0ZUFzeW5jLiBBbHNvIHRoZSBiSW1tZWRpYXRlSGFzaFJlcGxhY2Vcblx0ICogXHRcdCAgd2lsbCBiZSBpZ25vcmVkLlxuXHQgKiBAcmV0dXJucyBBIFByb21pc2Ugb2JqZWN0IHRvIG1vbml0b3Igd2hlbiBhbGwgdGhlIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlbiBleGVjdXRlZDsgaWYgdGhlIGV4ZWN1dGlvbiBpcyBzdWNjZXNzZnVsLCB0aGVcblx0ICogICAgICAgICAgYXBwIHN0YXRlIGtleSBpcyByZXR1cm5lZDsgaWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBvYmplY3Qgb2YgdHlwZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGlzXG5cdCAqICAgICAgICAgIHJldHVybmVkXG5cdCAqIEBwdWJsaWNcblx0ICogQGV4YW1wbGUgPGNvZGU+XG5cdCAqIHNhcC51aS5kZWZpbmUoW1wic2FwL2ZlL25hdmlnYXRpb24vTmF2aWdhdGlvbkhhbmRsZXJcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlcikge1xuXHQgKiBcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdHZhciBtSW5uZXJBcHBEYXRhID0ge1xuXHQgKiBcdFx0c2VsZWN0aW9uVmFyaWFudCA6IG9TbWFydEZpbHRlckJhci5nZXREYXRhU3VpdGVGb3JtYXQoKSxcblx0ICogXHRcdHRhYmxlVmFyaWFudElkIDogb1NtYXJ0VGFibGUuZ2V0Q3VycmVudFZhcmlhbnRJZCgpLFxuXHQgKiBcdFx0Y3VzdG9tRGF0YSA6IG9NeUN1c3RvbURhdGFcblx0ICogXHR9O1xuXHQgKlxuXHQgKiBcdHZhciBvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZSA9IG9OYXZpZ2F0aW9uSGFuZGxlci5zdG9yZUlubmVyQXBwU3RhdGVBc3luYyhtSW5uZXJBcHBEYXRhKTtcblx0ICpcblx0ICogXHRvU3RvcmVJbm5lckFwcFN0YXRlUHJvbWlzZS5kb25lKGZ1bmN0aW9uKHNBcHBTdGF0ZUtleSl7XG5cdCAqIFx0XHQvL3lvdXIgaW5uZXIgYXBwIHN0YXRlIGlzIHNhdmVkIG5vdywgc0FwcFN0YXRlS2V5IHdhcyBhZGRlZCB0byBVUkxcblx0ICogXHRcdC8vcGVyZm9ybSBhY3Rpb25zIHRoYXQgbXVzdCBydW4gYWZ0ZXIgc2F2ZVxuXHQgKiBcdH0pO1xuXHQgKlxuXHQgKiBcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmZhaWwoZnVuY3Rpb24ob0Vycm9yKXtcblx0ICogXHRcdC8vc29tZSBlcnJvciBoYW5kbGluZ1xuXHQgKiBcdH0pO1xuXHQgKiB9KTtcblx0ICogPC9jb2RlPlxuXHQgKi9cblx0c3RvcmVJbm5lckFwcFN0YXRlQXN5bmMoXG5cdFx0bUlubmVyQXBwRGF0YTogSW5uZXJBcHBEYXRhLFxuXHRcdGJJbW1lZGlhdGVIYXNoUmVwbGFjZT86IGJvb2xlYW4sXG5cdFx0YlNraXBIYXNoUmVwbGFjZT86IGJvb2xlYW5cblx0KTogalF1ZXJ5LlByb21pc2U8c3RyaW5nPiB7XG5cdFx0aWYgKHR5cGVvZiBiSW1tZWRpYXRlSGFzaFJlcGxhY2UgIT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRiSW1tZWRpYXRlSGFzaFJlcGxhY2UgPSB0cnVlOyAvLyBkZWZhdWx0XG5cdFx0fVxuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRjb25zdCBvTXlEZWZlcnJlZCA9IGpRdWVyeS5EZWZlcnJlZDxzdHJpbmc+KCk7XG5cblx0XHRjb25zdCBmblJlcGxhY2VIYXNoID0gZnVuY3Rpb24gKHNBcHBTdGF0ZUtleTogYW55KSB7XG5cdFx0XHRjb25zdCBvSGFzaENoYW5nZXIgPSBvTmF2SGFuZGxlci5vUm91dGVyLm9IYXNoQ2hhbmdlciA/IG9OYXZIYW5kbGVyLm9Sb3V0ZXIub0hhc2hDaGFuZ2VyIDogSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKTtcblx0XHRcdGNvbnN0IHNBcHBIYXNoT2xkID0gb0hhc2hDaGFuZ2VyLmdldEhhc2goKTtcblx0XHRcdC8qXG5cdFx0XHQgKiB1c2UgLmdldEhhc2goKSBoZXJlIGluc3RlYWQgb2YgLmdldEFwcEhhc2goKSB0byBhbHNvIGJlIGFibGUgZGVhbGluZyB3aXRoIGVudmlyb25tZW50cyB3aGVyZSBvbmx5IFNBUFVJNSBpcyBsb2FkZWQgYW5kIHRoZSBVU2hlbGxcblx0XHRcdCAqIGlzIG5vdCBpbml0aWFsaXplZCBwcm9wZXJseS5cblx0XHRcdCAqL1xuXHRcdFx0Y29uc3Qgc0FwcEhhc2hOZXcgPSBvTmF2SGFuZGxlci5fcmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2hPbGQsIHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRvSGFzaENoYW5nZXIucmVwbGFjZUhhc2goc0FwcEhhc2hOZXcpO1xuXHRcdH07XG5cblx0XHQvLyBpbiBjYXNlIG1Jbm5lckFwcFN0YXRlIGlzIGVtcHR5LCBkbyBub3Qgb3ZlcndyaXRlIHRoZSBsYXN0IHNhdmVkIHN0YXRlXG5cdFx0aWYgKGlzRW1wdHlPYmplY3QobUlubmVyQXBwRGF0YSBhcyBvYmplY3QpKSB7XG5cdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKFwiXCIpO1xuXHRcdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0XHR9XG5cblx0XHQvLyBjaGVjayBpZiB3ZSBhbHJlYWR5IHNhdmVkIHRoZSBzYW1lIGRhdGFcblx0XHRjb25zdCBzQXBwU3RhdGVLZXlDYWNoZWQgPSB0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLnNBcHBTdGF0ZUtleTtcblxuXHRcdGNvbnN0IGJJbm5lckFwcERhdGFFcXVhbCA9IEpTT04uc3RyaW5naWZ5KG1Jbm5lckFwcERhdGEpID09PSBKU09OLnN0cmluZ2lmeSh0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLm9BcHBEYXRhKTtcblx0XHRpZiAoYklubmVyQXBwRGF0YUVxdWFsICYmIHNBcHBTdGF0ZUtleUNhY2hlZCkge1xuXHRcdFx0Ly8gcGFzc2VkIGlubmVyIGFwcCBzdGF0ZSBmb3VuZCBpbiBjYWNoZVxuXHRcdFx0dGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5pQ2FjaGVIaXQrKztcblxuXHRcdFx0Ly8gcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIGNhY2hlZCBhcHBTdGF0ZUtleSBpbiB1cmwgKGp1c3QgaW4gY2FzZSB0aGUgYXBwIGhhcyBjaGFuZ2VkIHRoZSBoYXNoIGluIG1lYW50aW1lKVxuXHRcdFx0Zm5SZXBsYWNlSGFzaChzQXBwU3RhdGVLZXlDYWNoZWQpO1xuXHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShzQXBwU3RhdGVLZXlDYWNoZWQpO1xuXHRcdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0XHR9XG5cblx0XHQvLyBwYXNzZWQgaW5uZXIgYXBwIHN0YXRlIG5vdCBmb3VuZCBpbiBjYWNoZVxuXHRcdHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuaUNhY2hlTWlzcysrO1xuXG5cdFx0Y29uc3QgZm5PbkFmdGVyU2F2ZSA9IGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0Ly8gcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIG5ldyBhcHBTdGF0ZUtleSBpbiB1cmxcblx0XHRcdGlmICghYlNraXBIYXNoUmVwbGFjZSAmJiAhYkltbWVkaWF0ZUhhc2hSZXBsYWNlKSB7XG5cdFx0XHRcdGZuUmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVtZW1iZXIgbGFzdCBzYXZlZCBzdGF0ZVxuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEub0FwcERhdGEgPSBtSW5uZXJBcHBEYXRhO1xuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuc0FwcFN0YXRlS2V5ID0gc0FwcFN0YXRlS2V5O1xuXHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShzQXBwU3RhdGVLZXkpO1xuXHRcdH07XG5cblx0XHRjb25zdCBmbk9uRXJyb3IgPSBmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IpO1xuXHRcdH07XG5cblx0XHR0aGlzLl9zYXZlQXBwU3RhdGVBc3luYyhtSW5uZXJBcHBEYXRhLCBmbk9uQWZ0ZXJTYXZlLCBmbk9uRXJyb3IpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoc0FwcFN0YXRlS2V5OiBhbnkpIHtcblx0XHRcdFx0LyogTm90ZSB0aGF0IF9zYXBBcHBTdGF0ZSBtYXkgcmV0dXJuICd1bmRlZmluZWQnIGluIGNhc2UgdGhhdCB0aGUgcGFyc2luZyBoYXMgZmFpbGVkLiBJbiB0aGlzIGNhc2UsIHdlIHNob3VsZCBub3QgdHJpZ2dlciB0aGUgcmVwbGFjZW1lbnRcblx0XHRcdFx0ICogb2YgdGhlIEFwcCBIYXNoIHdpdGggdGhlIGdlbmVyYXRlZCBrZXksIGFzIHRoZSBjb250YWluZXIgd2FzIG5vdCB3cml0dGVuIGJlZm9yZS4gTm90ZSBhcyB3ZWxsIHRoYXQgdGhlIGVycm9yIGhhbmRsaW5nIGhhcyBhbHJlYWR5XG5cdFx0XHRcdCAqIGhhcHBlbmVkIGJlZm9yZSBieSBtYWtpbmcgdGhlIG9NeURlZmVycmVkIHByb21pc2UgZmFpbCAoc2VlIGZuT25FcnJvciBhYm92ZSkuXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRpZiAoc0FwcFN0YXRlS2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHQvLyByZXBsYWNlIGlubmVyIGFwcCBoYXNoIHdpdGggbmV3IGFwcFN0YXRlS2V5IGluIHVybFxuXHRcdFx0XHRcdC8vIG5vdGU6IHdlIGRvIG5vdCB3YWl0IGZvciB0aGUgc2F2ZSB0byBiZSBjb21wbGV0ZWQ6IHRoaXMgYXN5bmNocm9ub3VzbHkgYmVoYXZpb3VyIGlzIG5lY2Vzc2FyeSBpZlxuXHRcdFx0XHRcdC8vIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBlLmcuIGluIGEgb25MaW5rUHJlc3NlZCBldmVudCB3aXRoIG5vIHBvc3NpYmlsaXR5IHRvIHdhaXQgZm9yIHRoZSBwcm9taXNlIHJlc29sdXRpb25cblx0XHRcdFx0XHRpZiAoIWJTa2lwSGFzaFJlcGxhY2UgJiYgYkltbWVkaWF0ZUhhc2hSZXBsYWNlKSB7XG5cdFx0XHRcdFx0XHRmblJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuX3NhdmVBcHBTdGF0ZUFzeW5jIGZhaWxlZFwiKTtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBVUkwgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGFwcCBzdGF0ZSBhbmQgc3RvcmVzIHRoZSBhcHAgc3RhdGUgZm9yIGxhdGVyIHJldHJpZXZhbC5cblx0ICpcblx0ICogQHBhcmFtIG1Jbm5lckFwcERhdGEgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIGFwcFxuXHQgKiBAcGFyYW0gYkltbWVkaWF0ZUhhc2hSZXBsYWNlIElmIHNldCB0byBmYWxzZSwgdGhlIGlubmVyIGFwcCBoYXNoIHdpbGwgbm90IGJlIHJlcGxhY2VkIHVudGlsIHN0b3JpbmcgaXMgc3VjY2Vzc2Z1bDsgZG8gbm90XG5cdCAqICAgICAgICBzZXQgdG8gZmFsc2UgaWYgeW91IGNhbm5vdCByZWFjdCB0byB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgUHJvbWlzZSwgZm9yIGV4YW1wbGUsIHdoZW4gY2FsbGluZyB0aGUgYmVmb3JlTGlua1ByZXNzZWQgZXZlbnRcblx0ICogQHJldHVybnMgQSBQcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIHRoZSBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW4gZXhlY3V0ZWQ7IGlmIHRoZSBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlXG5cdCAqICAgICAgICAgIGFwcCBzdGF0ZSBrZXkgaXMgcmV0dXJuZWQ7IGlmIGFuIGVycm9yIG9jY3VycywgYW4gb2JqZWN0IG9mIHR5cGUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpc1xuXHQgKiAgICAgICAgICByZXR1cm5lZFxuXHQgKiBAcHVibGljXG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKiBzYXAudWkuZGVmaW5lKFtcInNhcC9mZS9uYXZpZ2F0aW9uL05hdmlnYXRpb25IYW5kbGVyXCJdLCBmdW5jdGlvbiAoTmF2aWdhdGlvbkhhbmRsZXIpIHtcblx0ICogXHR2YXIgb05hdmlnYXRpb25IYW5kbGVyID0gbmV3IE5hdmlnYXRpb25IYW5kbGVyKG9Db250cm9sbGVyKTtcblx0ICogXHR2YXIgbUlubmVyQXBwRGF0YSA9IHtcblx0ICogXHRcdHNlbGVjdGlvblZhcmlhbnQgOiBvU21hcnRGaWx0ZXJCYXIuZ2V0RGF0YVN1aXRlRm9ybWF0KCksXG5cdCAqIFx0XHR0YWJsZVZhcmlhbnRJZCA6IG9TbWFydFRhYmxlLmdldEN1cnJlbnRWYXJpYW50SWQoKSxcblx0ICogXHRcdGN1c3RvbURhdGEgOiBvTXlDdXN0b21EYXRhXG5cdCAqIFx0fTtcblx0ICpcblx0ICogXHR2YXIgb1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UgPSBvTmF2aWdhdGlvbkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlKG1Jbm5lckFwcERhdGEpO1xuXHQgKlxuXHQgKiBcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmRvbmUoZnVuY3Rpb24oc0FwcFN0YXRlS2V5KXtcblx0ICogXHRcdC8veW91ciBpbm5lciBhcHAgc3RhdGUgaXMgc2F2ZWQgbm93LCBzQXBwU3RhdGVLZXkgd2FzIGFkZGVkIHRvIFVSTFxuXHQgKiBcdFx0Ly9wZXJmb3JtIGFjdGlvbnMgdGhhdCBtdXN0IHJ1biBhZnRlciBzYXZlXG5cdCAqIFx0fSk7XG5cdCAqXG5cdCAqIFx0b1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UuZmFpbChmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0fSk7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqIEBkZXByZWNhdGVkc2luY2UgMS4xMDRcblx0ICogQGRlcHJlY2F0ZWQgVXNlIHRoZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlQXN5bmN9IGluc3RlYWQuXG5cdCAqL1xuXHRzdG9yZUlubmVyQXBwU3RhdGUobUlubmVyQXBwRGF0YTogSW5uZXJBcHBEYXRhLCBiSW1tZWRpYXRlSGFzaFJlcGxhY2U/OiBib29sZWFuKTogalF1ZXJ5LlByb21pc2U8c3RyaW5nPiB7XG5cdFx0TG9nLmVycm9yKFxuXHRcdFx0XCJEZXByZWNhdGVkIEFQSSBjYWxsIG9mICdzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlci5zdG9yZUlubmVyQXBwU3RhdGUnLiBQbGVhc2UgdXNlICdzdG9yZUlubmVyQXBwU3RhdGVBc3luYycgaW5zdGVhZFwiLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XCJzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlclwiXG5cdFx0KTtcblx0XHRpZiAodHlwZW9mIGJJbW1lZGlhdGVIYXNoUmVwbGFjZSAhPT0gXCJib29sZWFuXCIpIHtcblx0XHRcdGJJbW1lZGlhdGVIYXNoUmVwbGFjZSA9IHRydWU7IC8vIGRlZmF1bHRcblx0XHR9XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXHRcdGNvbnN0IG9NeURlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XG5cblx0XHRjb25zdCBmblJlcGxhY2VIYXNoID0gZnVuY3Rpb24gKHNBcHBTdGF0ZUtleTogYW55KSB7XG5cdFx0XHRjb25zdCBvSGFzaENoYW5nZXIgPSBvTmF2SGFuZGxlci5vUm91dGVyLm9IYXNoQ2hhbmdlciA/IG9OYXZIYW5kbGVyLm9Sb3V0ZXIub0hhc2hDaGFuZ2VyIDogSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKTtcblx0XHRcdGNvbnN0IHNBcHBIYXNoT2xkID0gb0hhc2hDaGFuZ2VyLmdldEhhc2goKTtcblx0XHRcdC8qXG5cdFx0XHQgKiB1c2UgLmdldEhhc2goKSBoZXJlIGluc3RlYWQgb2YgLmdldEFwcEhhc2goKSB0byBhbHNvIGJlIGFibGUgZGVhbGluZyB3aXRoIGVudmlyb25tZW50cyB3aGVyZSBvbmx5IFNBUFVJNSBpcyBsb2FkZWQgYW5kIHRoZSBVU2hlbGxcblx0XHRcdCAqIGlzIG5vdCBpbml0aWFsaXplZCBwcm9wZXJseS5cblx0XHRcdCAqL1xuXHRcdFx0Y29uc3Qgc0FwcEhhc2hOZXcgPSBvTmF2SGFuZGxlci5fcmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2hPbGQsIHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRvSGFzaENoYW5nZXIucmVwbGFjZUhhc2goc0FwcEhhc2hOZXcpO1xuXHRcdH07XG5cblx0XHQvLyBpbiBjYXNlIG1Jbm5lckFwcFN0YXRlIGlzIGVtcHR5LCBkbyBub3Qgb3ZlcndyaXRlIHRoZSBsYXN0IHNhdmVkIHN0YXRlXG5cdFx0aWYgKGlzRW1wdHlPYmplY3QobUlubmVyQXBwRGF0YSBhcyBvYmplY3QpKSB7XG5cdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKFwiXCIpO1xuXHRcdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0XHR9XG5cblx0XHQvLyBjaGVjayBpZiB3ZSBhbHJlYWR5IHNhdmVkIHRoZSBzYW1lIGRhdGFcblx0XHRjb25zdCBzQXBwU3RhdGVLZXlDYWNoZWQgPSB0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLnNBcHBTdGF0ZUtleTtcblxuXHRcdGNvbnN0IGJJbm5lckFwcERhdGFFcXVhbCA9IEpTT04uc3RyaW5naWZ5KG1Jbm5lckFwcERhdGEpID09PSBKU09OLnN0cmluZ2lmeSh0aGlzLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLm9BcHBEYXRhKTtcblx0XHRpZiAoYklubmVyQXBwRGF0YUVxdWFsICYmIHNBcHBTdGF0ZUtleUNhY2hlZCkge1xuXHRcdFx0Ly8gcGFzc2VkIGlubmVyIGFwcCBzdGF0ZSBmb3VuZCBpbiBjYWNoZVxuXHRcdFx0dGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5pQ2FjaGVIaXQrKztcblxuXHRcdFx0Ly8gcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIGNhY2hlZCBhcHBTdGF0ZUtleSBpbiB1cmwgKGp1c3QgaW4gY2FzZSB0aGUgYXBwIGhhcyBjaGFuZ2VkIHRoZSBoYXNoIGluIG1lYW50aW1lKVxuXHRcdFx0Zm5SZXBsYWNlSGFzaChzQXBwU3RhdGVLZXlDYWNoZWQpO1xuXHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShzQXBwU3RhdGVLZXlDYWNoZWQpO1xuXHRcdFx0cmV0dXJuIG9NeURlZmVycmVkLnByb21pc2UoKTtcblx0XHR9XG5cblx0XHQvLyBwYXNzZWQgaW5uZXIgYXBwIHN0YXRlIG5vdCBmb3VuZCBpbiBjYWNoZVxuXHRcdHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuaUNhY2hlTWlzcysrO1xuXG5cdFx0Y29uc3QgZm5PbkFmdGVyU2F2ZSA9IGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0Ly8gcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIG5ldyBhcHBTdGF0ZUtleSBpbiB1cmxcblx0XHRcdGlmICghYkltbWVkaWF0ZUhhc2hSZXBsYWNlKSB7XG5cdFx0XHRcdGZuUmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gcmVtZW1iZXIgbGFzdCBzYXZlZCBzdGF0ZVxuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEub0FwcERhdGEgPSBtSW5uZXJBcHBEYXRhO1xuXHRcdFx0b05hdkhhbmRsZXIuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuc0FwcFN0YXRlS2V5ID0gc0FwcFN0YXRlS2V5O1xuXHRcdFx0b015RGVmZXJyZWQucmVzb2x2ZShzQXBwU3RhdGVLZXkpO1xuXHRcdH07XG5cblx0XHRjb25zdCBmbk9uRXJyb3IgPSBmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IpO1xuXHRcdH07XG5cblx0XHRjb25zdCBzQXBwU3RhdGVLZXkgPSB0aGlzLl9zYXZlQXBwU3RhdGUobUlubmVyQXBwRGF0YSwgZm5PbkFmdGVyU2F2ZSwgZm5PbkVycm9yKTtcblx0XHQvKlxuXHRcdCAqIE5vdGUgdGhhdCBfc2FwQXBwU3RhdGUgbWF5IHJldHVybiAndW5kZWZpbmVkJyBpbiBjYXNlIHRoYXQgdGhlIHBhcnNpbmcgaGFzIGZhaWxlZC4gSW4gdGhpcyBjYXNlLCB3ZSBzaG91bGQgbm90IHRyaWdnZXIgdGhlIHJlcGxhY2VtZW50XG5cdFx0ICogb2YgdGhlIEFwcCBIYXNoIHdpdGggdGhlIGdlbmVyYXRlZCBrZXksIGFzIHRoZSBjb250YWluZXIgd2FzIG5vdCB3cml0dGVuIGJlZm9yZS4gTm90ZSBhcyB3ZWxsIHRoYXQgdGhlIGVycm9yIGhhbmRsaW5nIGhhcyBhbHJlYWR5XG5cdFx0ICogaGFwcGVuZWQgYmVmb3JlIGJ5IG1ha2luZyB0aGUgb015RGVmZXJyZWQgcHJvbWlzZSBmYWlsIChzZWUgZm5PbkVycm9yIGFib3ZlKS5cblx0XHQgKi9cblx0XHRpZiAoc0FwcFN0YXRlS2V5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIHJlcGxhY2UgaW5uZXIgYXBwIGhhc2ggd2l0aCBuZXcgYXBwU3RhdGVLZXkgaW4gdXJsXG5cdFx0XHQvLyBub3RlOiB3ZSBkbyBub3Qgd2FpdCBmb3IgdGhlIHNhdmUgdG8gYmUgY29tcGxldGVkOiB0aGlzIGFzeW5jaHJvbm91c2x5IGJlaGF2aW91ciBpcyBuZWNlc3NhcnkgaWZcblx0XHRcdC8vIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBlLmcuIGluIGEgb25MaW5rUHJlc3NlZCBldmVudCB3aXRoIG5vIHBvc3NpYmlsaXR5IHRvIHdhaXQgZm9yIHRoZSBwcm9taXNlIHJlc29sdXRpb25cblx0XHRcdGlmIChiSW1tZWRpYXRlSGFzaFJlcGxhY2UpIHtcblx0XHRcdFx0Zm5SZXBsYWNlSGFzaChzQXBwU3RhdGVLZXkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvTXlEZWZlcnJlZC5wcm9taXNlKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgVVJMIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBhcHAgc3RhdGUgYW5kIHN0b3JlcyB0aGUgYXBwIHN0YXRlIGZvciBsYXRlciByZXRyaWV2YWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBtSW5uZXJBcHBEYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIGJJbW1lZGlhdGVIYXNoUmVwbGFjZSBJZiBzZXQgdG8gZmFsc2UsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCB1bnRpbCBzdG9yaW5nIGlzIHN1Y2Nlc3NmdWw7IGRvIG5vdFxuXHQgKiAgICAgICAgc2V0IHRvIGZhbHNlIGlmIHlvdSBjYW5ub3QgcmVhY3QgdG8gdGhlIHJlc29sdXRpb24gb2YgdGhlIFByb21pc2UsIGZvciBleGFtcGxlLCB3aGVuIGNhbGxpbmcgdGhlIGJlZm9yZUxpbmtQcmVzc2VkIGV2ZW50LiA8Yj5Ob3RlOjwvYj5JZlxuXHQgKiAgICAgICAgbm90IHByb3ZpZGVkIGl0IHdpbGwgYmUgdHJlYXRlZCBhcyBzZXQgdG8gZmFsc2UuIDxiPk5vdGU6PC9iPklmIHNldCB0byB0cnVlLCB0aGUgY2FsbGluZyBpbnN0YW5jZSBoYXMgdG8gZW5zdXJlIHRoYXQgYSBmb2xsb3ctb25cblx0ICogICAgICAgIGNhbGwgdG8gPGNvZGU+cmVwbGFjZUhhc2g8L2NvZGU+IHdpbGwgdGFrZSBwbGFjZSFcblx0ICogQHJldHVybnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGFwcFN0YXRlSWQgYW5kIGEgcHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCB0aGUgYWN0aW9ucyBvZiB0aGUgZnVuY3Rpb24gaGF2ZSBiZWVuXG5cdCAqICAgICAgICAgIGV4ZWN1dGVkOyBQbGVhc2Ugbm90ZSB0aGF0IHRoZSBhcHBTdGF0ZUtleSBtYXkgYmUgdW5kZWZpbmVkIG9yIGVtcHR5LlxuXHQgKiBAZXhhbXBsZSA8Y29kZT5cblx0ICogc2FwLnVpLmRlZmluZShbXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiXSwgZnVuY3Rpb24gKE5hdmlnYXRpb25IYW5kbGVyKSB7XG5cdCAqIFx0dmFyIG9OYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcihvQ29udHJvbGxlcik7XG5cdCAqIFx0dmFyIG1Jbm5lckFwcERhdGEgPSB7XG5cdCAqIFx0XHRzZWxlY3Rpb25WYXJpYW50IDogb1NtYXJ0RmlsdGVyQmFyLmdldERhdGFTdWl0ZUZvcm1hdCgpLFxuXHQgKiBcdFx0dGFibGVWYXJpYW50SWQgOiBvU21hcnRUYWJsZS5nZXRDdXJyZW50VmFyaWFudElkKCksXG5cdCAqIFx0XHRjdXN0b21EYXRhIDogb015Q3VzdG9tRGF0YVxuXHQgKiBcdH07XG5cdCAqXG5cdCAqIFx0dmFyIG9TdG9yZUlubmVyQXBwU3RhdGUgPSBzdG9yZUlubmVyQXBwU3RhdGVXaXRoTm9uRGVsYXllZFJldHVybihtSW5uZXJBcHBEYXRhKTtcblx0ICogXHR2YXIgc0FwcFN0YXRlS2V5ID0gb1N0b3JlSW5uZXJBcHBTdGF0ZS5hcHBTdGF0ZUtleTtcblx0ICogXHRpZiAoIXNBcHBTdGF0ZUtleSkge1xuXHQgKiAgICAvLyBubyBhcHBTdGF0ZUtleSBvYnRhaW5lZC4uLlxuXHQgKiBcdH07XG5cdCAqIFx0dmFyIG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlID0gb1N0b3JlSW5uZXJBcHBTdGF0ZS5wcm9taXNlO1xuXHQgKlxuXHQgKiBcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmRvbmUoZnVuY3Rpb24oc0FwcFN0YXRlS2V5KXtcblx0ICogXHRcdC8veW91ciBpbm5lciBhcHAgc3RhdGUgaXMgc2F2ZWQgbm93LCBzQXBwU3RhdGVLZXkgd2FzIGFkZGVkIHRvIFVSTFxuXHQgKiBcdFx0Ly9wZXJmb3JtIGFjdGlvbnMgdGhhdCBtdXN0IHJ1biBhZnRlciBzYXZlXG5cdCAqIFx0fSk7XG5cdCAqXG5cdCAqIFx0b1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UuZmFpbChmdW5jdGlvbihvRXJyb3Ipe1xuXHQgKiBcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0fSk7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqIEBwdWJsaWNcblx0ICogQGRlcHJlY2F0ZWRzaW5jZSAxLjEwNFxuXHQgKiBAZGVwcmVjYXRlZCBVc2UgdGhlIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlci5zdG9yZUlubmVyQXBwU3RhdGVBc3luY30gaW5zdGVhZC5cblx0ICovXG5cdHN0b3JlSW5uZXJBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4obUlubmVyQXBwRGF0YTogSW5uZXJBcHBEYXRhLCBiSW1tZWRpYXRlSGFzaFJlcGxhY2U/OiBib29sZWFuKSB7XG5cdFx0TG9nLmVycm9yKFxuXHRcdFx0XCJEZXByZWNhdGVkIEFQSSBjYWxsIG9mICdzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlci5zdG9yZUlubmVyQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuJy4gUGxlYXNlIHVzZSAnc3RvcmVJbm5lckFwcFN0YXRlQXN5bmMnIGluc3RlYWRcIixcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFwic2FwLmZlLm5hdmlnYXRpb24uTmF2aWdhdGlvbkhhbmRsZXJcIlxuXHRcdCk7XG5cdFx0aWYgKHR5cGVvZiBiSW1tZWRpYXRlSGFzaFJlcGxhY2UgIT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRiSW1tZWRpYXRlSGFzaFJlcGxhY2UgPSBmYWxzZTsgLy8gZGVmYXVsdFxuXHRcdH1cblxuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRjb25zdCBvQXBwU3RhdGVQcm9taXNlID0galF1ZXJ5LkRlZmVycmVkKCk7XG5cblx0XHQvLyBpbiBjYXNlIG1Jbm5lckFwcFN0YXRlIGlzIGVtcHR5LCBkbyBub3Qgb3ZlcndyaXRlIHRoZSBsYXN0IHNhdmVkIHN0YXRlXG5cdFx0aWYgKGlzRW1wdHlPYmplY3QobUlubmVyQXBwRGF0YSkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGFwcFN0YXRlS2V5OiBcIlwiLFxuXHRcdFx0XHRwcm9taXNlOiBvQXBwU3RhdGVQcm9taXNlLnJlc29sdmUoXCJcIilcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gY2hlY2sgaWYgd2UgYWxyZWFkeSBzYXZlZCB0aGUgc2FtZSBkYXRhXG5cdFx0Y29uc3Qgc0FwcFN0YXRlS2V5Q2FjaGVkID0gdGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5zQXBwU3RhdGVLZXk7XG5cblx0XHRjb25zdCBiSW5uZXJBcHBEYXRhRXF1YWwgPSBKU09OLnN0cmluZ2lmeShtSW5uZXJBcHBEYXRhKSA9PT0gSlNPTi5zdHJpbmdpZnkodGhpcy5fb0xhc3RTYXZlZElubmVyQXBwRGF0YS5vQXBwRGF0YSk7XG5cdFx0aWYgKGJJbm5lckFwcERhdGFFcXVhbCAmJiBzQXBwU3RhdGVLZXlDYWNoZWQpIHtcblx0XHRcdC8vIHBhc3NlZCBpbm5lciBhcHAgc3RhdGUgZm91bmQgaW4gY2FjaGVcblx0XHRcdHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuaUNhY2hlSGl0Kys7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhcHBTdGF0ZUtleTogc0FwcFN0YXRlS2V5Q2FjaGVkLFxuXHRcdFx0XHRwcm9taXNlOiBvQXBwU3RhdGVQcm9taXNlLnJlc29sdmUoc0FwcFN0YXRlS2V5Q2FjaGVkKVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBwYXNzZWQgaW5uZXIgYXBwIHN0YXRlIG5vdCBmb3VuZCBpbiBjYWNoZVxuXHRcdHRoaXMuX29MYXN0U2F2ZWRJbm5lckFwcERhdGEuaUNhY2hlTWlzcysrO1xuXG5cdFx0Y29uc3QgZm5PbkFmdGVyU2F2ZSA9IGZ1bmN0aW9uIChzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdFx0Ly8gcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIG5ldyBhcHBTdGF0ZUtleSBpbiB1cmxcblx0XHRcdGlmICghYkltbWVkaWF0ZUhhc2hSZXBsYWNlKSB7XG5cdFx0XHRcdG9OYXZIYW5kbGVyLnJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJlbWVtYmVyIGxhc3Qgc2F2ZWQgc3RhdGVcblx0XHRcdG9OYXZIYW5kbGVyLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLm9BcHBEYXRhID0gbUlubmVyQXBwRGF0YTtcblx0XHRcdG9OYXZIYW5kbGVyLl9vTGFzdFNhdmVkSW5uZXJBcHBEYXRhLnNBcHBTdGF0ZUtleSA9IHNBcHBTdGF0ZUtleTtcblx0XHRcdG9BcHBTdGF0ZVByb21pc2UucmVzb2x2ZShzQXBwU3RhdGVLZXkpO1xuXHRcdH07XG5cblx0XHRjb25zdCBmbk9uRXJyb3IgPSBmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdG9BcHBTdGF0ZVByb21pc2UucmVqZWN0KG9FcnJvcik7XG5cdFx0fTtcblxuXHRcdGNvbnN0IHNBcHBTdGF0ZUtleSA9IHRoaXMuX3NhdmVBcHBTdGF0ZShtSW5uZXJBcHBEYXRhLCBmbk9uQWZ0ZXJTYXZlLCBmbk9uRXJyb3IpO1xuXHRcdC8qXG5cdFx0ICogTm90ZSB0aGF0IF9zYXBBcHBTdGF0ZSBtYXkgcmV0dXJuICd1bmRlZmluZWQnIGluIGNhc2UgdGhhdCB0aGUgcGFyc2luZyBoYXMgZmFpbGVkLiBJbiB0aGlzIGNhc2UsIHdlIHNob3VsZCBub3QgdHJpZ2dlciB0aGUgcmVwbGFjZW1lbnRcblx0XHQgKiBvZiB0aGUgQXBwIEhhc2ggd2l0aCB0aGUgZ2VuZXJhdGVkIGtleSwgYXMgdGhlIGNvbnRhaW5lciB3YXMgbm90IHdyaXR0ZW4gYmVmb3JlLiBOb3RlIGFzIHdlbGwgdGhhdCB0aGUgZXJyb3IgaGFuZGxpbmcgaGFzIGFscmVhZHlcblx0XHQgKiBoYXBwZW5lZCBiZWZvcmUgYnkgbWFraW5nIHRoZSBvTXlEZWZlcnJlZCBwcm9taXNlIGZhaWwgKHNlZSBmbk9uRXJyb3IgYWJvdmUpLlxuXHRcdCAqL1xuXHRcdC8vIGlmIChzQXBwU3RhdGVLZXkgIT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIC8vcmVwbGFjZSBpbm5lciBhcHAgaGFzaCB3aXRoIG5ldyBhcHBTdGF0ZUtleSBpbiB1cmxcblx0XHQvLyAvL25vdGU6IHdlIGRvIG5vdCB3YWl0IGZvciB0aGUgc2F2ZSB0byBiZSBjb21wbGV0ZWQ6IHRoaXMgYXN5bmNocm9ub3VzbHkgYmVoYXZpb3VyIGlzIG5lY2Vzc2FyeSBpZlxuXHRcdC8vIC8vdGhpcyBtZXRob2QgaXMgY2FsbGVkIGUuZy4gaW4gYSBvbkxpbmtQcmVzc2VkIGV2ZW50IHdpdGggbm8gcG9zc2liaWxpdHkgdG8gd2FpdCBmb3IgdGhlIHByb21pc2UgcmVzb2x1dGlvblxuXHRcdC8vIGlmIChiSW1tZWRpYXRlSGFzaFJlcGxhY2UpIHtcblx0XHQvLyBmblJlcGxhY2VIYXNoKHNBcHBTdGF0ZUtleSk7XG5cdFx0Ly8gfVxuXHRcdC8vIH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0YXBwU3RhdGVLZXk6IHNBcHBTdGF0ZUtleSxcblx0XHRcdHByb21pc2U6IG9BcHBTdGF0ZVByb21pc2UucHJvbWlzZSgpXG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBQcm9jZXNzZXMgbmF2aWdhdGlvbi1yZWxhdGVkIHRhc2tzIHJlbGF0ZWQgdG8gYmVmb3JlUG9wb3Zlck9wZW5zIGV2ZW50IGhhbmRsaW5nIGZvciB0aGUgU21hcnRMaW5rIGNvbnRyb2wgYW5kIHJldHVybnMgYSBQcm9taXNlIG9iamVjdC4gSW5cblx0ICogcGFydGljdWxhciwgdGhlIGZvbGxvd2luZyB0YXNrcyBhcmUgcGVyZm9ybWVkIGJlZm9yZSB0aGUgU21hcnRMaW5rIHBvcG92ZXIgY2FuIGJlIG9wZW5lZDpcblx0ICogPHVsPlxuXHQgKiA8bGk+SWYgPGNvZGU+bUlubmVyQXBwRGF0YTwvY29kZT4gaXMgcHJvdmlkZWQsIHRoaXMgaW5uZXIgYXBwIHN0YXRlIGlzIHNhdmVkIGZvciBiYWNrIG5hdmlnYXRpb24gYXQgYSBsYXRlciB0aW1lLjwvbGk+XG5cdCAqIDxsaT5UaGUgdGFibGUgZXZlbnQgcGFyYW1ldGVycyAoc2VtYW50aWMgYXR0cmlidXRlcykgYW5kIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBkYXRhIGFyZSBjb21iaW5lZCBieSBjYWxsaW5nIHRoZSBtZXRob2Rcblx0ICoge0BsaW5rICMubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQgbWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnR9LjwvbGk+XG5cdCAqIDxsaT5UaGUgY29tYmluZWQgZGF0YSBpcyBzYXZlZCBhcyB0aGUgY3Jvc3MgYXBwIHN0YXRlIHRvIGJlIGhhbmRlZCBvdmVyIHRvIHRoZSB0YXJnZXQgYXBwLCBhbmQgdGhlIGNvcnJlc3BvbmRpbmcgc2FwLXhhcHAtc3RhdGUga2V5IGlzIHNldFxuXHQgKiBpbiB0aGUgVVJMLjwvbGk+XG5cdCAqIDxsaT5BbGwgc2luZ2xlIHNlbGVjdGlvbnMgKFwiaW5jbHVkaW5nIGVxdWFsXCIpIG9mIHRoZSBjb21iaW5lZCBzZWxlY3Rpb24gZGF0YSBhcmUgcGFzc2VkIHRvIHRoZSBTbWFydExpbmsgcG9wb3ZlciBhcyBzZW1hbnRpYyBhdHRyaWJ1dGVzLjwvbGk+XG5cdCAqIDxsaT5UaGUgbWV0aG9kIDxjb2RlPm9UYWJsZUV2ZW50UGFyYW1ldGVycy5vcGVuKCk8L2NvZGU+IGlzIGNhbGxlZC4gTm90ZSB0aGF0IHRoaXMgZG9lcyBub3QgcmVhbGx5IG9wZW4gdGhlIHBvcG92ZXIsIGJ1dCB0aGUgU21hcnRMaW5rXG5cdCAqIGNvbnRyb2wgcHJvY2VlZHMgd2l0aCBmaXJpbmcgdGhlIGV2ZW50IDxjb2RlPm5hdmlnYXRpb25UYXJnZXRzT2J0YWluZWQ8L2NvZGU+LjwvbGk+XG5cdCAqIDwvdWw+LlxuXHQgKiA8YnI+XG5cdCAqIDxiPk5vZGU6PC9iPiBJZiB0aGUgPGNvZGU+b0V4dGVybmFsQXBwRGF0YTwvY29kZT4gcGFyYW1ldGVyIGlzIG5vdCBzdXBwbGllZCwgdGhlIGV4dGVybmFsIGFwcCBkYXRhIHdpbGwgYmUgY2FsY3VsYXRlZCBiYXNlZCBvblxuXHQgKiB0aGUgPGNvZGU+bUlubmVyQXBwRGF0YTwvY29kZT4gZGF0YS48YnI+LlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlRXZlbnRQYXJhbWV0ZXJzIFRoZSBwYXJhbWV0ZXJzIG1hZGUgYXZhaWxhYmxlIGJ5IHRoZSBTbWFydFRhYmxlIGNvbnRyb2wgd2hlbiB0aGUgU21hcnRMaW5rIGNvbnRyb2wgaGFzIGJlZW4gY2xpY2tlZCxcblx0ICogICAgICAgIGFuIGluc3RhbmNlIG9mIGEgUG9wT3ZlciBvYmplY3Rcblx0ICogQHBhcmFtIHNTZWxlY3Rpb25WYXJpYW50IFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0IGFzIHJldHVybmVkLCBmb3IgZXhhbXBsZSwgZnJvbSBnZXREYXRhU3VpdGVGb3JtYXQoKSBvZiB0aGUgU21hcnRGaWx0ZXJCYXIgY29udHJvbFxuXHQgKiBAcGFyYW0gbUlubmVyQXBwRGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgYXBwLiBJZiBwcm92aWRlZCwgb3BlbmluZyB0aGUgUG9wb3ZlciBpcyBkZWZlcnJlZCB1bnRpbCB0aGVcblx0ICogICAgICAgIGlubmVyIGFwcCBkYXRhIGlzIHNhdmVkIGluIGEgY29uc2lzdGVudCB3YXkuXG5cdCAqIEBwYXJhbSBvRXh0ZXJuYWxBcHBEYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBzdGF0ZSB3aGljaCB3aWxsIGJlIHBhc3NlZCB0byB0aGUgdGFyZ2V0IHNjcmVlbi5cblx0ICogQHBhcmFtIG9FeHRlcm5hbEFwcERhdGEuc2VsZWN0aW9uVmFyaWFudCBPYmplY3QgY29udGFpbmluZyBzZWxlY3Rpb25WYXJpYW50LCB3aGljaCB3aWxsIGJlIHBhc3NlZCB0byB0aGUgdGFyZ2V0IHNjcmVlbi4gSWYgbm90XG5cdCAqICAgICAgICBzZXQgdGhlIHNTZWxlY3Rpb25WYXJpYW50IHdpbGwgYmUgdXNlZC5cblx0ICogQHBhcmFtIG9FeHRlcm5hbEFwcERhdGEucHJlc2VudGF0aW9uVmFyaWFudCBPYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudCB1aSBwcmVzZW50YXRpb25WYXJpYW50IG9mIHRoZSBhcHAsIHdoaWNoIHdpbGwgYmVcblx0ICogICAgICAgIHBhc3NlZCB0byB0aGUgdGFyZ2V0IHNjcmVlblxuXHQgKiBAcGFyYW0gb0V4dGVybmFsQXBwRGF0YS52YWx1ZVRleHRzIE9iamVjdCBjb250YWluaW5nIHZhbHVlIGRlc2NyaXB0aW9ucywgd2hpY2ggd2lsbCBiZSBwYXNzZWQgdG8gdGhlIHRhcmdldCBzY3JlZW5cblx0ICogQHJldHVybnMgQSBQcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlbiBleGVjdXRlZDsgaWYgdGhlIGV4ZWN1dGlvbiBpcyBzdWNjZXNzZnVsLCB0aGVcblx0ICogICAgICAgICAgbW9kaWZpZWQgb1RhYmxlRXZlbnRQYXJhbWV0ZXJzIGlzIHJldHVybmVkOyBpZiBhbiBlcnJvciBvY2N1cnMsIGFuIGVycm9yIG9iamVjdCBvZiB0eXBlXG5cdCAqICAgICAgICAgIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0gaXMgcmV0dXJuZWRcblx0ICogQHB1YmxpY1xuXHQgKiBAZXhhbXBsZSA8Y29kZT5cblx0ICogc2FwLnVpLmRlZmluZShbXCJzYXAvZmUvbmF2aWdhdGlvbi9OYXZpZ2F0aW9uSGFuZGxlclwiLCBcInNhcC9mZS9uYXZpZ2F0aW9uL1NlbGVjdGlvblZhcmlhbnRcIl0sIGZ1bmN0aW9uIChOYXZpZ2F0aW9uSGFuZGxlciwgU2VsZWN0aW9uVmFyaWFudCkge1xuXHQgKiBcdC8vZXZlbnQgaGFuZGxlciBmb3IgdGhlIHNtYXJ0IGxpbmsgZXZlbnQgXCJiZWZvcmVQb3BvdmVyT3BlbnNcIlxuXHQgKiBcdFx0b25CZWZvcmVQb3BvdmVyT3BlbnM6IGZ1bmN0aW9uKG9FdmVudCkge1xuXHQgKiBcdFx0XHR2YXIgb1RhYmxlRXZlbnRQYXJhbWV0ZXJzID0gb0V2ZW50LmdldFBhcmFtZXRlcnMoKTtcblx0ICpcblx0ICogXHRcdFx0dmFyIG1Jbm5lckFwcERhdGEgPSB7XG5cdCAqIFx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudCA6IG9TbWFydEZpbHRlckJhci5nZXREYXRhU3VpdGVGb3JtYXQoKSxcblx0ICogXHRcdFx0XHR0YWJsZVZhcmlhbnRJZCA6IG9TbWFydFRhYmxlLmdldEN1cnJlbnRWYXJpYW50SWQoKSxcblx0ICogXHRcdFx0XHRjdXN0b21EYXRhIDogb015Q3VzdG9tRGF0YVxuXHQgKiBcdFx0XHR9O1xuXHQgKlxuXHQgKiBcdFx0XHR2YXIgb1NlbGVjdGlvblZhcmlhbnQgPSBuZXcgU2VsZWN0aW9uVmFyaWFudCgpO1xuXHQgKiBcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oXCJDb21wYW55Q29kZVwiLCBcIklcIiwgXCJFUVwiLCBcIjAwMDFcIik7XG5cdCAqIFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkN1c3RvbWVyXCIsIFwiSVwiLCBcIkVRXCIsIFwiQzAwMDFcIik7XG5cdCAqIFx0XHRcdHZhciBzU2VsZWN0aW9uVmFyaWFudD0gb1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCk7XG5cdCAqXG5cdCAqIFx0XHRcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdFx0XHR2YXIgb1NtYXJ0TGlua1Byb21pc2UgPSBvTmF2aWdhdGlvbkhhbmRsZXIucHJvY2Vzc0JlZm9yZVNtYXJ0TGlua1BvcG92ZXJPcGVucyhvVGFibGVFdmVudFBhcmFtZXRlcnMsIHNTZWxlY3Rpb25WYXJpYW50LCBtSW5uZXJBcHBEYXRhKTtcblx0ICpcblx0ICogXHRcdFx0b1NtYXJ0TGlua1Byb21pc2UuZG9uZShmdW5jdGlvbihvVGFibGVFdmVudFBhcmFtZXRlcnMpe1xuXHQgKiBcdFx0XHRcdC8vIGhlcmUgeW91IGNhbiBhZGQgY29kaW5nIHRoYXQgc2hvdWxkIHJ1biBhZnRlciBhbGwgYXBwIHN0YXRlcyBhcmUgc2F2ZWQgYW5kIHRoZSBzZW1hbnRpYyBhdHRyaWJ1dGVzIGFyZSBzZXRcblx0ICogXHRcdFx0fSk7XG5cdCAqXG5cdCAqIFx0XHRcdG9TbWFydExpbmtQcm9taXNlLmZhaWwoZnVuY3Rpb24ob0Vycm9yKXtcblx0ICogXHRcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0XHRcdH0pO1xuXHQgKiBcdFx0fTtcblx0ICogXHR9KTtcblx0ICogPC9jb2RlPlxuXHQgKi9cblx0cHJvY2Vzc0JlZm9yZVNtYXJ0TGlua1BvcG92ZXJPcGVucyhcblx0XHRvVGFibGVFdmVudFBhcmFtZXRlcnM6IGFueSxcblx0XHRzU2VsZWN0aW9uVmFyaWFudDogc3RyaW5nLFxuXHRcdG1Jbm5lckFwcERhdGE/OiBJbm5lckFwcERhdGEsXG5cdFx0b0V4dGVybmFsQXBwRGF0YT86IHtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ/OiBvYmplY3Q7XG5cdFx0XHRwcmVzZW50YXRpb25WYXJpYW50Pzogb2JqZWN0O1xuXHRcdFx0dmFsdWVUZXh0cz86IG9iamVjdDtcblx0XHR9XG5cdCkge1xuXHRcdGNvbnN0IG9NeURlZmVycmVkID0galF1ZXJ5LkRlZmVycmVkKCk7XG5cdFx0bGV0IG1TZW1hbnRpY0F0dHJpYnV0ZXM6IGFueTtcblx0XHRpZiAob1RhYmxlRXZlbnRQYXJhbWV0ZXJzICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0bVNlbWFudGljQXR0cmlidXRlcyA9IG9UYWJsZUV2ZW50UGFyYW1ldGVycy5zZW1hbnRpY0F0dHJpYnV0ZXM7XG5cdFx0fVxuXG5cdFx0bGV0IG9YQXBwRGF0YU9iajogYW55O1xuXHRcdGNvbnN0IG9OYXZIYW5kbGVyOiBOYXZpZ2F0aW9uSGFuZGxlciA9IHRoaXM7XG5cblx0XHRpZiAob0V4dGVybmFsQXBwRGF0YSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvWEFwcERhdGFPYmogPSB7fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1hBcHBEYXRhT2JqID0gb0V4dGVybmFsQXBwRGF0YTtcblx0XHR9XG5cblx0XHRjb25zdCBmblN0b3JlWGFwcEFuZENhbGxPcGVuID0gZnVuY3Rpb24gKG1TdWJTZW1hbnRpY0F0dHJpYnV0ZXM6IGFueSwgc1N1YlNlbGVjdGlvblZhcmlhbnQ6IGFueSkge1xuXHRcdFx0Ly8gbWl4IHRoZSBzZW1hbnRpYyBhdHRyaWJ1dGVzIChlLmcuIGZyb20gdGhlIHJvdyBsaW5lKSB3aXRoIHRoZSBzZWxlY3Rpb24gdmFyaWFudCAoZS5nLiBmcm9tIHRoZSBmaWx0ZXIgYmFyKVxuXHRcdFx0c1N1YlNlbGVjdGlvblZhcmlhbnQgPSBvWEFwcERhdGFPYmouc2VsZWN0aW9uVmFyaWFudCB8fCBzU3ViU2VsZWN0aW9uVmFyaWFudCB8fCBcInt9XCI7XG5cblx0XHRcdGNvbnN0IGlTdXBwcmVzc2lvbkJlaGF2aW9yID0gU3VwcHJlc3Npb25CZWhhdmlvci5yYWlzZUVycm9yT25OdWxsIHwgU3VwcHJlc3Npb25CZWhhdmlvci5yYWlzZUVycm9yT25VbmRlZmluZWQ7XG5cdFx0XHQvKlxuXHRcdFx0ICogY29tcGF0aWJsaXR5OiBVbnRpbCBTQVBVSTUgMS4yOC41IChvciBldmVuIGxhdGVyKSB0aGUgU21hcnQgTGluayBpbiBhIFNtYXJ0IFRhYmxlIGlzIGZpbHRlcmluZyBhbGwgbnVsbC0gYW5kIHVuZGVmaW5lZCB2YWx1ZXMuXG5cdFx0XHQgKiBUaGVyZWZvcmUsIG1TZW1hbnRpY0F0dHJpYnV0ZXMgYXJlIGFscmVhZHkgcmVkdWNlZCBhcHByb3ByaWF0ZWx5IC0tIHRoaXMgZG9lcyBub3QgbmVlZCB0byBiZSBkb25lIGJ5XG5cdFx0XHQgKiBtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCBhZ2Fpbi4gVG8gZW5zdXJlIHRoYXQgd2Ugc3RpbGwgaGF2ZSB0aGUgb2xkIGJlaGF2aW91ciAoaS5lLiBhbiBOYXZFcnJvciBpcyByYWlzZWQgaW4gY2FzZSB0aGF0XG5cdFx0XHQgKiBiZWhhdmlvdXIgb2YgdGhlIFNtYXJ0IExpbmsgY29udHJvbCBoYXMgY2hhbmdlZCksIHRoZSBcIm9sZFwiIFN1cHByZXNzaW9uIEJlaGF2aW91ciBpcyByZXRhaW5lZC5cblx0XHRcdCAqL1xuXG5cdFx0XHRjb25zdCBvTWl4ZWRTZWxWYXIgPSBvTmF2SGFuZGxlci5taXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudChcblx0XHRcdFx0bVN1YlNlbWFudGljQXR0cmlidXRlcyxcblx0XHRcdFx0c1N1YlNlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRcdGlTdXBwcmVzc2lvbkJlaGF2aW9yXG5cdFx0XHQpO1xuXHRcdFx0c1N1YlNlbGVjdGlvblZhcmlhbnQgPSBvTWl4ZWRTZWxWYXIudG9KU09OU3RyaW5nKCk7XG5cblx0XHRcdC8vIGVucmljaCB0aGUgc2VtYW50aWMgYXR0cmlidXRlcyB3aXRoIHNpbmdsZSBzZWxlY3Rpb25zIGZyb20gdGhlIHNlbGVjdGlvbiB2YXJpYW50XG5cdFx0XHRsZXQgb1RtcERhdGE6IGFueSA9IHt9O1xuXHRcdFx0b1RtcERhdGEuc2VsZWN0aW9uVmFyaWFudCA9IG9NaXhlZFNlbFZhci50b0pTT05PYmplY3QoKTtcblxuXHRcdFx0b1RtcERhdGEgPSBvTmF2SGFuZGxlci5fcmVtb3ZlTWVhc3VyZUJhc2VkSW5mb3JtYXRpb24ob1RtcERhdGEpO1xuXG5cdFx0XHRvVG1wRGF0YSA9IG9OYXZIYW5kbGVyLl9jaGVja0lzUG90ZW50aWFsbHlTZW5zaXRpdmUob1RtcERhdGEpO1xuXG5cdFx0XHRtU3ViU2VtYW50aWNBdHRyaWJ1dGVzID0gb1RtcERhdGEuc2VsZWN0aW9uVmFyaWFudFxuXHRcdFx0XHQ/IG9OYXZIYW5kbGVyLl9nZXRVUkxQYXJhbWV0ZXJzRnJvbVNlbGVjdGlvblZhcmlhbnQobmV3IFNlbGVjdGlvblZhcmlhbnQob1RtcERhdGEuc2VsZWN0aW9uVmFyaWFudCkpXG5cdFx0XHRcdDoge307XG5cblx0XHRcdGNvbnN0IGZuT25Db250YWluZXJTYXZlID0gZnVuY3Rpb24gKHNBcHBTdGF0ZUtleTogYW55KSB7XG5cdFx0XHRcdGlmIChvVGFibGVFdmVudFBhcmFtZXRlcnMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdC8vIElmIG9UYWJsZUV2ZW50UGFyYW1ldGVycyBpcyB1bmRlZmluZWQsIHJldHVybiBib3RoIHNlbWFudGljQXR0cmlidXRlcyBhbmQgYXBwU3RhdGVrZXlcblx0XHRcdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKG1TdWJTZW1hbnRpY0F0dHJpYnV0ZXMsIHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gc2V0IHRoZSBzdG9yZWQgZGF0YSBpbiBwb3BvdmVyIGFuZCBjYWxsIG9wZW4oKVxuXHRcdFx0XHRcdG9UYWJsZUV2ZW50UGFyYW1ldGVycy5zZXRTZW1hbnRpY0F0dHJpYnV0ZXMobVN1YlNlbWFudGljQXR0cmlidXRlcyk7XG5cdFx0XHRcdFx0b1RhYmxlRXZlbnRQYXJhbWV0ZXJzLnNldEFwcFN0YXRlS2V5KHNBcHBTdGF0ZUtleSk7XG5cdFx0XHRcdFx0b1RhYmxlRXZlbnRQYXJhbWV0ZXJzLm9wZW4oKTsgLy8gPj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4+Pj4gTm90ZSB0aGF0IFwib3BlblwiIGRvZXMgbm90IG9wZW4gdGhlIHBvcG92ZXIsIGJ1dCBwcm9jZWVkc1xuXHRcdFx0XHRcdC8vIHdpdGggZmlyaW5nIHRoZSBvbk5hdlRhcmdldHNPYnRhaW5lZCBldmVudC5cblx0XHRcdFx0XHRvTXlEZWZlcnJlZC5yZXNvbHZlKG9UYWJsZUV2ZW50UGFyYW1ldGVycyk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IGZuT25FcnJvciA9IGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRvTXlEZWZlcnJlZC5yZWplY3Qob0Vycm9yKTtcblx0XHRcdH07XG5cblx0XHRcdG9YQXBwRGF0YU9iai5zZWxlY3Rpb25WYXJpYW50ID0gc1N1YlNlbGVjdGlvblZhcmlhbnQ7XG5cblx0XHRcdG9YQXBwRGF0YU9iaiA9IG9OYXZIYW5kbGVyLl9yZW1vdmVNZWFzdXJlQmFzZWRJbmZvcm1hdGlvbihvWEFwcERhdGFPYmopO1xuXG5cdFx0XHRvTmF2SGFuZGxlci5fc2F2ZUFwcFN0YXRlQXN5bmMob1hBcHBEYXRhT2JqLCBmbk9uQ29udGFpbmVyU2F2ZSwgZm5PbkVycm9yKTtcblx0XHR9O1xuXG5cdFx0aWYgKG1Jbm5lckFwcERhdGEpIHtcblx0XHRcdGNvbnN0IG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlID0gdGhpcy5zdG9yZUlubmVyQXBwU3RhdGVBc3luYyhtSW5uZXJBcHBEYXRhLCB0cnVlKTtcblxuXHRcdFx0Ly8gaWYgdGhlIGlubmVyIGFwcCBzdGF0ZSB3YXMgc3VjY2Vzc2Z1bGx5IHN0b3JlZCwgc3RvcmUgYWxzbyB0aGUgeGFwcC1zdGF0ZVxuXHRcdFx0b1N0b3JlSW5uZXJBcHBTdGF0ZVByb21pc2UuZG9uZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGZuU3RvcmVYYXBwQW5kQ2FsbE9wZW4obVNlbWFudGljQXR0cmlidXRlcywgc1NlbGVjdGlvblZhcmlhbnQpO1xuXHRcdFx0fSk7XG5cblx0XHRcdG9TdG9yZUlubmVyQXBwU3RhdGVQcm9taXNlLmZhaWwoZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdG9NeURlZmVycmVkLnJlamVjdChvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHRoZXJlIGlzIG5vIGlubmVyIGFwcCBzdGF0ZSB0byBzYXZlLCBqdXN0IHB1dCB0aGUgcGFyYW1ldGVycyBpbnRvIHhhcHAtc3RhdGVcblx0XHRcdGZuU3RvcmVYYXBwQW5kQ2FsbE9wZW4obVNlbWFudGljQXR0cmlidXRlcywgc1NlbGVjdGlvblZhcmlhbnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvTXlEZWZlcnJlZC5wcm9taXNlKCk7XG5cdH1cblxuXHQvKipcblx0ICogUHJvY2Vzc2VzIHNlbGVjdGlvblZhcmlhbnQgc3RyaW5nIGFuZCByZXR1cm5zIGEgUHJvbWlzZSBvYmplY3QgKHNlbWFudGljQXR0cmlidXRlcyBhbmQgQXBwU3RhdGVLZXkpLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbGVjdGlvblZhcmlhbnQgU3RyaW5naWZpZWQgSlNPTiBvYmplY3Rcblx0ICogQHJldHVybnMgQSBQcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlbiBleGVjdXRlZDsgaWYgdGhlIGV4ZWN1dGlvbiBpcyBzdWNjZXNzZnVsLCB0aGVcblx0ICogICAgICAgICAgc2VtYW50aWNBdHRyaWJ1dGVzIGFzIHdlbGwgYXMgdGhlIGFwcFN0YXRlS2V5IGFyZSByZXR1cm5lZDsgaWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBlcnJvciBvYmplY3Qgb2YgdHlwZVxuXHQgKiAgICAgICAgICB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGlzIHJldHVybmVkXG5cdCAqIDxicj5cblx0ICogQGV4YW1wbGUgPGNvZGU+XG5cdCAqIHNhcC51aS5kZWZpbmUoW1wic2FwL2ZlL25hdmlnYXRpb24vTmF2aWdhdGlvbkhhbmRsZXJcIiwgXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCJdLCBmdW5jdGlvbiAoTmF2aWdhdGlvbkhhbmRsZXIsIFNlbGVjdGlvblZhcmlhbnQpIHtcblx0ICogXHRcdHZhciBvU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdCAqIFx0XHRvU2VsZWN0aW9uVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oXCJDb21wYW55Q29kZVwiLCBcIklcIiwgXCJFUVwiLCBcIjAwMDFcIik7XG5cdCAqIFx0XHRvU2VsZWN0aW9uVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oXCJDdXN0b21lclwiLCBcIklcIiwgXCJFUVwiLCBcIkMwMDAxXCIpO1xuXHQgKiBcdFx0dmFyIHNTZWxlY3Rpb25WYXJpYW50PSBvU2VsZWN0aW9uVmFyaWFudC50b0pTT05TdHJpbmcoKTtcblx0ICpcblx0ICogXHRcdHZhciBvTmF2aWdhdGlvbkhhbmRsZXIgPSBuZXcgTmF2aWdhdGlvbkhhbmRsZXIob0NvbnRyb2xsZXIpO1xuXHQgKiBcdFx0dmFyIG9Qcm9taXNlT2JqZWN0ID0gb05hdmlnYXRpb25IYW5kbGVyLl9nZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMoc1NlbGVjdGlvblZhcmlhbnQpO1xuXHQgKlxuXHQgKiBcdFx0b1Byb21pc2VPYmplY3QuZG9uZShmdW5jdGlvbihvU2VtYW50aWNBdHRyaWJ1dGVzLCBzQXBwU3RhdGVLZXkpe1xuXHQgKiBcdFx0XHQvLyBoZXJlIHlvdSBjYW4gYWRkIGNvZGluZyB0aGF0IHNob3VsZCBydW4gYWZ0ZXIgYWxsIGFwcCBzdGF0ZSBhbmQgdGhlIHNlbWFudGljIGF0dHJpYnV0ZXMgaGF2ZSBiZWVuIHJldHVybmVkLlxuXHQgKiBcdFx0fSk7XG5cdCAqXG5cdCAqIFx0XHRvUHJvbWlzZU9iamVjdC5mYWlsKGZ1bmN0aW9uKG9FcnJvcil7XG5cdCAqIFx0XHRcdC8vc29tZSBlcnJvciBoYW5kbGluZ1xuXHQgKiBcdFx0fSk7XG5cdCAqXHR9KTtcblx0ICogPC9jb2RlPlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9nZXRBcHBTdGF0ZUtleUFuZFVybFBhcmFtZXRlcnMoc1NlbGVjdGlvblZhcmlhbnQ6IHN0cmluZykge1xuXHRcdHJldHVybiB0aGlzLnByb2Nlc3NCZWZvcmVTbWFydExpbmtQb3BvdmVyT3BlbnModW5kZWZpbmVkLCBzU2VsZWN0aW9uVmFyaWFudCwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuXHR9XG5cblx0X21peEF0dHJpYnV0ZXNUb1NlbFZhcmlhbnQobVNlbWFudGljQXR0cmlidXRlczogYW55LCBvU2VsVmFyaWFudDogYW55LCBpU3VwcHJlc3Npb25CZWhhdmlvcjogYW55KSB7XG5cdFx0Ly8gYWRkIGFsbCBzZW1hbnRpYyBhdHRyaWJ1dGVzIHRvIHRoZSBtaXhlZCBzZWxlY3Rpb24gdmFyaWFudFxuXHRcdGZvciAoY29uc3Qgc1Byb3BlcnR5TmFtZSBpbiBtU2VtYW50aWNBdHRyaWJ1dGVzKSB7XG5cdFx0XHRpZiAobVNlbWFudGljQXR0cmlidXRlcy5oYXNPd25Qcm9wZXJ0eShzUHJvcGVydHlOYW1lKSkge1xuXHRcdFx0XHQvLyBBIHZhbHVlIG9mIGEgc2VtYW50aWMgYXR0cmlidXRlIG1heSBub3QgYmUgYSBzdHJpbmcsIGJ1dCBjYW4gYmUgZS5nLiBhIGRhdGUuXG5cdFx0XHRcdC8vIFNpbmNlIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhY2NlcHRzIG9ubHkgYSBzdHJpbmcsIHdlIGhhdmUgdG8gY29udmVydCBpdCBpbiBkZXBlbmRlbmNlIG9mIHRoZSB0eXBlLlxuXHRcdFx0XHRsZXQgdlNlbWFudGljQXR0cmlidXRlVmFsdWUgPSBtU2VtYW50aWNBdHRyaWJ1dGVzW3NQcm9wZXJ0eU5hbWVdO1xuXHRcdFx0XHRpZiAodlNlbWFudGljQXR0cmlidXRlVmFsdWUgaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdFx0Ly8gdXNlIHRoZSBzYW1lIGNvbnZlcnNpb24gbWV0aG9kIGZvciBkYXRlcyBhcyB0aGUgU21hcnRGaWx0ZXJCYXI6IHRvSlNPTigpXG5cdFx0XHRcdFx0dlNlbWFudGljQXR0cmlidXRlVmFsdWUgPSB2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZS50b0pTT04oKTtcblx0XHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0XHRBcnJheS5pc0FycmF5KHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlKSB8fFxuXHRcdFx0XHRcdCh2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSAmJiB0eXBlb2YgdlNlbWFudGljQXR0cmlidXRlVmFsdWUgPT09IFwib2JqZWN0XCIpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID0gSlNPTi5zdHJpbmdpZnkodlNlbWFudGljQXR0cmlidXRlVmFsdWUpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgdlNlbWFudGljQXR0cmlidXRlVmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdFx0dlNlbWFudGljQXR0cmlidXRlVmFsdWUgPSB2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZS50b1N0cmluZygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID09PSBcIlwiKSB7XG5cdFx0XHRcdFx0aWYgKGlTdXBwcmVzc2lvbkJlaGF2aW9yICYgU3VwcHJlc3Npb25CZWhhdmlvci5pZ25vcmVFbXB0eVN0cmluZykge1xuXHRcdFx0XHRcdFx0TG9nLmluZm8oXG5cdFx0XHRcdFx0XHRcdFwiU2VtYW50aWMgYXR0cmlidXRlIFwiICtcblx0XHRcdFx0XHRcdFx0XHRzUHJvcGVydHlOYW1lICtcblx0XHRcdFx0XHRcdFx0XHRcIiBpcyBhbiBlbXB0eSBzdHJpbmcgYW5kIGR1ZSB0byB0aGUgY2hvc2VuIFN1cHByZXNzaW9uIEJlaGlhdm91ciBpcyBiZWluZyBpZ25vcmVkLlwiXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHZTZW1hbnRpY0F0dHJpYnV0ZVZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRcdFx0aWYgKGlTdXBwcmVzc2lvbkJlaGF2aW9yICYgU3VwcHJlc3Npb25CZWhhdmlvci5yYWlzZUVycm9yT25OdWxsKSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRMb2cud2FybmluZyhcIlNlbWFudGljIGF0dHJpYnV0ZSBcIiArIHNQcm9wZXJ0eU5hbWUgKyBcIiBpcyBudWxsIGFuZCBpZ25vcmVkIGZvciBtaXggaW4gdG8gc2VsZWN0aW9uIHZhcmlhbnRcIik7XG5cdFx0XHRcdFx0XHRjb250aW51ZTsgLy8gaWdub3JlIVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICh2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0aWYgKGlTdXBwcmVzc2lvbkJlaGF2aW9yICYgU3VwcHJlc3Npb25CZWhhdmlvci5yYWlzZUVycm9yT25VbmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBOYXZFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLklOVkFMSURfSU5QVVRcIik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdExvZy53YXJuaW5nKFwiU2VtYW50aWMgYXR0cmlidXRlIFwiICsgc1Byb3BlcnR5TmFtZSArIFwiIGlzIHVuZGVmaW5lZCBhbmQgaWdub3JlZCBmb3IgbWl4IGluIHRvIHNlbGVjdGlvbiB2YXJpYW50XCIpO1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHR5cGVvZiB2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSA9PT0gXCJzdHJpbmdcIiB8fCB2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSBpbnN0YW5jZW9mIFN0cmluZykge1xuXHRcdFx0XHRcdG9TZWxWYXJpYW50LmFkZFNlbGVjdE9wdGlvbihzUHJvcGVydHlOYW1lLCBcIklcIiwgXCJFUVwiLCB2U2VtYW50aWNBdHRyaWJ1dGVWYWx1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuSU5WQUxJRF9JTlBVVFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1NlbFZhcmlhbnQ7XG5cdH1cblxuXHQvKipcblx0ICogQ29tYmluZXMgdGhlIGdpdmVuIHBhcmFtZXRlcnMgYW5kIHNlbGVjdGlvbiB2YXJpYW50IGludG8gYSBuZXcgc2VsZWN0aW9uIHZhcmlhbnQgY29udGFpbmluZyBwcm9wZXJ0aWVzIGZyb20gYm90aCwgd2l0aCB0aGUgcGFyYW1ldGVyc1xuXHQgKiBvdmVycmlkaW5nIGV4aXN0aW5nIHByb3BlcnRpZXMgaW4gdGhlIHNlbGVjdGlvbiB2YXJpYW50LiBUaGUgbmV3IHNlbGVjdGlvbiB2YXJpYW50IGRvZXMgbm90IGNvbnRhaW4gYW55IHBhcmFtZXRlcnMuIEFsbCBwYXJhbWV0ZXJzIGFyZVxuXHQgKiBtZXJnZWQgaW50byBzZWxlY3Qgb3B0aW9ucy4gVGhlIG91dHB1dCBvZiB0aGlzIGZ1bmN0aW9uLCBjb252ZXJ0ZWQgdG8gYSBKU09OIHN0cmluZywgY2FuIGJlIHVzZWQgZm9yIHRoZVxuXHQgKiB7QGxpbmsgIy5uYXZpZ2F0ZSBOYXZpZ2F0aW9uSGFuZGxlci5uYXZpZ2F0ZX0gbWV0aG9kLlxuXHQgKlxuXHQgKiBAcGFyYW0gdlNlbWFudGljQXR0cmlidXRlcyBPYmplY3QvKEFycmF5IG9mIE9iamVjdHMpIGNvbnRhaW5pbmcga2V5L3ZhbHVlIHBhaXJzXG5cdCAqIEBwYXJhbSBzU2VsZWN0aW9uVmFyaWFudCBUaGUgc2VsZWN0aW9uIHZhcmlhbnQgaW4gc3RyaW5nIGZvcm1hdCBhcyBwcm92aWRlZCBieSB0aGUgU21hcnRGaWx0ZXJCYXIgY29udHJvbFxuXHQgKiBAcGFyYW0gW2lTdXBwcmVzc2lvbkJlaGF2aW9yPXNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3Iuc3RhbmRhcmRdIEluZGljYXRlcyB3aGV0aGVyIHNlbWFudGljXG5cdCAqICAgICAgICBhdHRyaWJ1dGVzIHdpdGggc3BlY2lhbCB2YWx1ZXMgKHNlZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uU3VwcHJlc3Npb25CZWhhdmlvciBzdXBwcmVzc2lvbiBiZWhhdmlvcn0pIG11c3QgYmVcblx0ICogICAgICAgIHN1cHByZXNzZWQgYmVmb3JlIHRoZXkgYXJlIGNvbWJpbmVkIHdpdGggdGhlIHNlbGVjdGlvbiB2YXJpYW50OyBzZXZlcmFsXG5cdCAqICAgICAgICB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uU3VwcHJlc3Npb25CZWhhdmlvciBzdXBwcmVzc2lvbiBiZWhhdmlvcnN9IGNhbiBiZSBjb21iaW5lZCB3aXRoIHRoZSBiaXR3aXNlIE9SIG9wZXJhdG9yXG5cdCAqICAgICAgICAofClcblx0ICogQHJldHVybnMgSW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnR9XG5cdCAqIEBwdWJsaWNcblx0ICogQGV4YW1wbGUgPGNvZGU+XG5cdCAqIHNhcC51aS5kZWZpbmUoW1wic2FwL2ZlL25hdmlnYXRpb24vTmF2aWdhdGlvbkhhbmRsZXJcIiwgXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCJdLCBmdW5jdGlvbiAoTmF2aWdhdGlvbkhhbmRsZXIsIFNlbGVjdGlvblZhcmlhbnQpIHtcblx0ICogXHR2YXIgdlNlbWFudGljQXR0cmlidXRlcyA9IHsgXCJDdXN0b21lclwiIDogXCJDMDAwMVwiIH07XG5cdCAqIFx0b3Jcblx0ICogXHR2YXIgdlNlbWFudGljQXR0cmlidXRlcyA9IFt7IFwiQ3VzdG9tZXJcIiA6IFwiQzAwMDFcIiB9LHsgXCJDdXN0b21lclwiIDogXCJDMDAwMlwiIH1dO1xuXHQgKiBcdHZhciBzU2VsZWN0aW9uVmFyaWFudCA9IG9TbWFydEZpbHRlckJhci5nZXREYXRhU3VpdGVGb3JtYXQoKTtcblx0ICogXHR2YXIgb05hdmlnYXRpb25IYW5kbGVyID0gbmV3IE5hdmlnYXRpb25IYW5kbGVyKG9Db250cm9sbGVyKTtcblx0ICogXHR2YXIgc05hdmlnYXRpb25TZWxlY3Rpb25WYXJpYW50ID0gb05hdmlnYXRpb25IYW5kbGVyLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KHZTZW1hbnRpY0F0dHJpYnV0ZXMsIHNTZWxlY3Rpb25WYXJpYW50KS50b0pTT05TdHJpbmcoKTtcblx0ICogXHQvLyBJbiBjYXNlIG9mIGFuIHZTZW1hbnRpY0F0dHJpYnV0ZXMgYmVpbmcgYW4gYXJyYXksIHRoZSBzZW1hbnRpY0F0dHJpYnV0ZXMgYXJlIG1lcmdlZCB0byBhIHNpbmdsZSBTViBhbmQgY29tcGFyZWQgYWdhaW5zdCB0aGUgc1NlbGVjdGlvblZhcmlhbnQoc2Vjb25kIGFncnVtZW50KS5cblx0ICogXHQvLyBPcHRpb25hbGx5LCB5b3UgY2FuIHNwZWNpZnkgb25lIG9yIHNldmVyYWwgc3VwcHJlc3Npb24gYmVoYXZpb3JzLiBTZXZlcmFsIHN1cHByZXNzaW9uIGJlaGF2aW9ycyBhcmUgY29tYmluZWQgd2l0aCB0aGUgYml0d2lzZSBPUiBvcGVyYXRvciwgZS5nLlxuXHQgKiBcdC8vIHZhciBpU3VwcHJlc3Npb25CZWhhdmlvciA9IHNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3IucmFpc2VFcnJvck9uTnVsbCB8IHNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3IucmFpc2VFcnJvck9uVW5kZWZpbmVkO1xuXHQgKiBcdC8vIHZhciBzTmF2aWdhdGlvblNlbGVjdGlvblZhcmlhbnQgPSBvTmF2aWdhdGlvbkhhbmRsZXIubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQobVNlbWFudGljQXR0cmlidXRlcywgc1NlbGVjdGlvblZhcmlhbnQsIGlTdXBwcmVzc2lvbkJlaGF2aW9yKS50b0pTT05TdHJpbmcoKTtcblx0ICpcblx0ICogXHRvTmF2aWdhdGlvbkhhbmRsZXIubmF2aWdhdGUoXCJTYWxlc09yZGVyXCIsIFwiY3JlYXRlXCIsIHNOYXZpZ2F0aW9uU2VsZWN0aW9uVmFyaWFudCk7XG5cdCAqIH0pO1xuXHQgKiA8L2NvZGU+XG5cdCAqL1xuXHRtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudChcblx0XHR2U2VtYW50aWNBdHRyaWJ1dGVzOiBvYmplY3QgfCBhbnlbXSxcblx0XHRzU2VsZWN0aW9uVmFyaWFudDogc3RyaW5nIHwgU2VyaWFsaXplZFNlbGVjdGlvblZhcmlhbnQsXG5cdFx0aVN1cHByZXNzaW9uQmVoYXZpb3I/OiBudW1iZXJcblx0KTogU2VsZWN0aW9uVmFyaWFudCB7XG5cdFx0Y29uc3Qgb1NlbGVjdGlvblZhcmlhbnQgPSBuZXcgU2VsZWN0aW9uVmFyaWFudChzU2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0Y29uc3Qgb05ld1NlbFZhcmlhbnQgPSBuZXcgU2VsZWN0aW9uVmFyaWFudCgpO1xuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblxuXHRcdGNvbnN0IGZpbHRlclVybCA9IG9TZWxlY3Rpb25WYXJpYW50LmdldEZpbHRlckNvbnRleHRVcmwoKTtcblx0XHRpZiAoZmlsdGVyVXJsKSB7XG5cdFx0XHRvTmV3U2VsVmFyaWFudC5zZXRGaWx0ZXJDb250ZXh0VXJsKGZpbHRlclVybCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgY29udGV4dFVybCA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFBhcmFtZXRlckNvbnRleHRVcmwoKTtcblx0XHRpZiAoY29udGV4dFVybCkge1xuXHRcdFx0b05ld1NlbFZhcmlhbnQuc2V0UGFyYW1ldGVyQ29udGV4dFVybChjb250ZXh0VXJsKTtcblx0XHR9XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodlNlbWFudGljQXR0cmlidXRlcykpIHtcblx0XHRcdHZTZW1hbnRpY0F0dHJpYnV0ZXMuZm9yRWFjaChmdW5jdGlvbiAobVNlbWFudGljQXR0cmlidXRlczogYW55KSB7XG5cdFx0XHRcdG9OYXZIYW5kbGVyLl9taXhBdHRyaWJ1dGVzVG9TZWxWYXJpYW50KG1TZW1hbnRpY0F0dHJpYnV0ZXMsIG9OZXdTZWxWYXJpYW50LCBpU3VwcHJlc3Npb25CZWhhdmlvcik7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fbWl4QXR0cmlidXRlc1RvU2VsVmFyaWFudCh2U2VtYW50aWNBdHRyaWJ1dGVzLCBvTmV3U2VsVmFyaWFudCwgaVN1cHByZXNzaW9uQmVoYXZpb3IpO1xuXHRcdH1cblxuXHRcdC8vIGFkZCBwYXJhbWV0ZXJzIHRoYXQgYXJlIG5vdCBwYXJ0IG9mIHRoZSBvTmV3U2VsVmFyaWFudCB5ZXRcblx0XHRjb25zdCBhUGFyYW1ldGVycyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFBhcmFtZXRlck5hbWVzKCk7XG5cdFx0bGV0IGk7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGFQYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRpZiAoIW9OZXdTZWxWYXJpYW50LmdldFNlbGVjdE9wdGlvbihhUGFyYW1ldGVyc1tpXSkpIHtcblx0XHRcdFx0b05ld1NlbFZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKGFQYXJhbWV0ZXJzW2ldLCBcIklcIiwgXCJFUVwiLCBvU2VsZWN0aW9uVmFyaWFudC5nZXRQYXJhbWV0ZXIoYVBhcmFtZXRlcnNbaV0pKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBhZGQgc2VsT3B0aW9ucyB0aGF0IGFyZSBub3QgcGFydCBvZiB0aGUgb05ld1NlbFZhcmlhbnQgeWV0XG5cdFx0Y29uc3QgYVNlbE9wdGlvbk5hbWVzID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKTtcblx0XHRmb3IgKGkgPSAwOyBpIDwgYVNlbE9wdGlvbk5hbWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHQvLyBhZGQgc2VsT3B0aW9ucyB0aGF0IGFyZSBub3QgcGFydCBvZiB0aGUgb05ld1NlbFZhcmlhbnQgeWV0XG5cdFx0XHRjb25zdCBhU2VsZWN0T3B0aW9uOiBhbnlbXSA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbihhU2VsT3B0aW9uTmFtZXNbaV0pITtcblx0XHRcdGlmICghb05ld1NlbFZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKGFTZWxPcHRpb25OYW1lc1tpXSkpIHtcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhU2VsZWN0T3B0aW9uLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0b05ld1NlbFZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFxuXHRcdFx0XHRcdFx0YVNlbE9wdGlvbk5hbWVzW2ldLFxuXHRcdFx0XHRcdFx0YVNlbGVjdE9wdGlvbltqXS5TaWduLFxuXHRcdFx0XHRcdFx0YVNlbGVjdE9wdGlvbltqXS5PcHRpb24sXG5cdFx0XHRcdFx0XHRhU2VsZWN0T3B0aW9uW2pdLkxvdyxcblx0XHRcdFx0XHRcdGFTZWxlY3RPcHRpb25bal0uSGlnaFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gb05ld1NlbFZhcmlhbnQ7XG5cdH1cblxuXHRfZW5zdXJlU2VsZWN0aW9uVmFyaWFudEZvcm1hdFN0cmluZyh2U2VsZWN0aW9uVmFyaWFudDogYW55KSB7XG5cdFx0Lypcblx0XHQgKiBUaGVyZSBhcmUgbGVnYWN5IEFwcFN0YXRlcyB3aGVyZSB0aGUgU2VsZWN0aW9uVmFyaWFudCBpcyBiZWluZyBzdG9yZWQgYXMgYSBzdHJpbmcuIEhvd2V2ZXIsIHRoYXQgaXMgbm90IGNvbXBsaWFudCB0byB0aGUgc3BlY2lmaWNhdGlvbixcblx0XHQgKiB3aGljaCBzdGF0ZXMgdGhhdCBhIHN0YW5kYXJkIEpTIG9iamVjdCBzaGFsbCBiZSBwcm92aWRlZC4gSW50ZXJuYWxseSwgaG93ZXZlciwgdGhlIHNlbGVjdGlvblZhcmlhbnQgaXMgYWx3YXlzIG9mIHR5cGUgc3RyaW5nLiBTaXR1YXRpb25cblx0XHQgKiBQZXJzaXN0ZW5jeSBpbnRlcm5hbCBBUEkgLS0tLS0tLS0tLS0tLS0tLSAtLS0tLS0tLS0tLS0tLS0tLS0gLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGxlZ2FjeSBzdHJpbmcgc3RyaW5nIG5ldyBhcHByb2FjaCAoSlNPTikgb2JqZWN0XG5cdFx0ICogc3RyaW5nXG5cdFx0ICovXG5cblx0XHRpZiAodlNlbGVjdGlvblZhcmlhbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRsZXQgdkNvbnZlcnRlZFNlbGVjdGlvblZhcmlhbnQgPSB2U2VsZWN0aW9uVmFyaWFudDtcblxuXHRcdGlmICh0eXBlb2YgdlNlbGVjdGlvblZhcmlhbnQgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdHZDb252ZXJ0ZWRTZWxlY3Rpb25WYXJpYW50ID0gSlNPTi5zdHJpbmdpZnkodlNlbGVjdGlvblZhcmlhbnQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB2Q29udmVydGVkU2VsZWN0aW9uVmFyaWFudDtcblx0fVxuXG5cdF9mbkhhbmRsZUFwcFN0YXRlUHJvbWlzZShvUmV0dXJuOiBhbnksIGZuT25BZnRlclNhdmU6IGFueSwgZm5PbkVycm9yOiBhbnkpIHtcblx0XHRvUmV0dXJuLnByb21pc2UuZG9uZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoZm5PbkFmdGVyU2F2ZSkge1xuXHRcdFx0XHRmbk9uQWZ0ZXJTYXZlKG9SZXR1cm4uYXBwU3RhdGVLZXkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0aWYgKGZuT25FcnJvcikge1xuXHRcdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXHRcdFx0b1JldHVybi5wcm9taXNlLmZhaWwoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5BcHBTdGF0ZVNhdmUuZmFpbGVkXCIpO1xuXHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdF9zYXZlQXBwU3RhdGVBc3luYyhvQXBwRGF0YTogYW55LCBmbk9uQWZ0ZXJTYXZlOiBhbnksIGZuT25FcnJvcjogYW55KSB7XG5cdFx0Y29uc3Qgb05hdkhhbmRsZXIgPSB0aGlzO1xuXHRcdHJldHVybiB0aGlzLl9mblNhdmVBcHBTdGF0ZUFzeW5jKG9BcHBEYXRhLCBmbk9uRXJyb3IpLnRoZW4oZnVuY3Rpb24gKG9SZXR1cm46IGFueSkge1xuXHRcdFx0aWYgKG9SZXR1cm4pIHtcblx0XHRcdFx0b05hdkhhbmRsZXIuX2ZuSGFuZGxlQXBwU3RhdGVQcm9taXNlKG9SZXR1cm4sIGZuT25BZnRlclNhdmUsIGZuT25FcnJvcik7XG5cdFx0XHRcdHJldHVybiBvUmV0dXJuLmFwcFN0YXRlS2V5O1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH0pO1xuXHR9XG5cblx0X3NhdmVBcHBTdGF0ZShvQXBwRGF0YTogYW55LCBmbk9uQWZ0ZXJTYXZlOiBhbnksIGZuT25FcnJvcjogYW55KSB7XG5cdFx0Y29uc3Qgb1JldHVybiA9IHRoaXMuX3NhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4ob0FwcERhdGEsIGZuT25FcnJvcik7XG5cdFx0aWYgKG9SZXR1cm4pIHtcblx0XHRcdHRoaXMuX2ZuSGFuZGxlQXBwU3RhdGVQcm9taXNlKG9SZXR1cm4sIGZuT25BZnRlclNhdmUsIGZuT25FcnJvcik7XG5cdFx0XHRyZXR1cm4gb1JldHVybi5hcHBTdGF0ZUtleTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0X2ZuU2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihvQXBwRGF0YTogYW55LCBvQXBwU3RhdGU6IGFueSwgZm5PbkVycm9yOiBhbnkpIHtcblx0XHRjb25zdCBzQXBwU3RhdGVLZXkgPSBvQXBwU3RhdGUuZ2V0S2V5KCk7XG5cdFx0Y29uc3Qgb0FwcERhdGFGb3JTYXZlID0gdGhpcy5fZmV0Y2hBcHBEYXRhRm9yU2F2ZShvQXBwRGF0YSwgZm5PbkVycm9yKTtcblx0XHRpZiAoIW9BcHBEYXRhRm9yU2F2ZSkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0b0FwcFN0YXRlLnNldERhdGEob0FwcERhdGFGb3JTYXZlKTtcblx0XHRjb25zdCBvU2F2ZVByb21pc2UgPSBvQXBwU3RhdGUuc2F2ZSgpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGFwcFN0YXRlS2V5OiBzQXBwU3RhdGVLZXksXG5cdFx0XHRwcm9taXNlOiBvU2F2ZVByb21pc2UucHJvbWlzZSgpXG5cdFx0fTtcblx0fVxuXG5cdF9mZXRjaEFwcERhdGFGb3JTYXZlKG9BcHBEYXRhOiBJbm5lckFwcERhdGEsIGZuT25FcnJvcjogYW55KSB7XG5cdFx0bGV0IG9BcHBEYXRhRm9yU2F2ZTogUGFydGlhbDxJbm5lckFwcERhdGE+ID0ge307XG5cblx0XHRpZiAob0FwcERhdGEuaGFzT3duUHJvcGVydHkoXCJzZWxlY3Rpb25WYXJpYW50XCIpKSB7XG5cdFx0XHRvQXBwRGF0YUZvclNhdmUuc2VsZWN0aW9uVmFyaWFudCA9IG9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQ7XG5cblx0XHRcdGlmIChvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdCAqIFRoZSBzcGVjaWZpY2F0aW9uIHN0YXRlcyB0aGF0IFNlbGVjdGlvbiBWYXJpYW50cyBuZWVkIHRvIGJlIEpTT04gb2JqZWN0cy4gSG93ZXZlciwgaW50ZXJuYWxseSwgd2Ugd29yayB3aXRoIHN0cmluZ3MgZm9yXG5cdFx0XHRcdCAqIFwic2VsZWN0aW9uVmFyaWFudFwiLiBUaGVyZWZvcmUsIGluIGNhc2UgdGhhdCB0aGlzIGlzIGEgc3RyaW5nLCB3ZSBuZWVkIHRvIEpTT04tcGFyc2UgdGhlIGRhdGEuXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRpZiAodHlwZW9mIG9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0b0FwcERhdGFGb3JTYXZlLnNlbGVjdGlvblZhcmlhbnQgPSBKU09OLnBhcnNlKG9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKHgpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9FcnJvciA9IHRoaXMuX2NyZWF0ZVRlY2huaWNhbEVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuQXBwU3RhdGVTYXZlLnBhcnNlRXJyb3JcIik7XG5cdFx0XHRcdFx0XHRpZiAoZm5PbkVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdGZuT25FcnJvcihvRXJyb3IpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5fc01vZGUgPT09IE1vZGUuT0RhdGFWMikge1xuXHRcdFx0b0FwcERhdGFGb3JTYXZlID0gZXh0ZW5kKFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudDoge30sXG5cdFx0XHRcdFx0dGFibGVWYXJpYW50SWQ6IFwiXCIsXG5cdFx0XHRcdFx0Y3VzdG9tRGF0YToge31cblx0XHRcdFx0fSxcblx0XHRcdFx0b0FwcERhdGFGb3JTYXZlXG5cdFx0XHQpIGFzIElubmVyQXBwRGF0YTtcblxuXHRcdFx0aWYgKG9BcHBEYXRhLnRhYmxlVmFyaWFudElkKSB7XG5cdFx0XHRcdG9BcHBEYXRhRm9yU2F2ZS50YWJsZVZhcmlhbnRJZCA9IG9BcHBEYXRhLnRhYmxlVmFyaWFudElkO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9BcHBEYXRhLmN1c3RvbURhdGEpIHtcblx0XHRcdFx0b0FwcERhdGFGb3JTYXZlLmN1c3RvbURhdGEgPSBvQXBwRGF0YS5jdXN0b21EYXRhO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9BcHBEYXRhLnByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0b0FwcERhdGFGb3JTYXZlLnByZXNlbnRhdGlvblZhcmlhbnQgPSBvQXBwRGF0YS5wcmVzZW50YXRpb25WYXJpYW50O1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9BcHBEYXRhLnZhbHVlVGV4dHMpIHtcblx0XHRcdFx0b0FwcERhdGFGb3JTYXZlLnZhbHVlVGV4dHMgPSBvQXBwRGF0YS52YWx1ZVRleHRzO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9BcHBEYXRhLnNlbWFudGljRGF0ZXMpIHtcblx0XHRcdFx0b0FwcERhdGFGb3JTYXZlLnNlbWFudGljRGF0ZXMgPSBvQXBwRGF0YS5zZW1hbnRpY0RhdGVzO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBvQXBwRGF0YUNsb25lID0gT2JqZWN0LmFzc2lnbih7fSwgb0FwcERhdGEpO1xuXHRcdFx0b0FwcERhdGFGb3JTYXZlID0gbWVyZ2Uob0FwcERhdGFDbG9uZSwgb0FwcERhdGFGb3JTYXZlKTtcblx0XHR9XG5cdFx0b0FwcERhdGFGb3JTYXZlID0gdGhpcy5fY2hlY2tJc1BvdGVudGlhbGx5U2Vuc2l0aXZlKG9BcHBEYXRhRm9yU2F2ZSk7XG5cdFx0cmV0dXJuIG9BcHBEYXRhRm9yU2F2ZTtcblx0fVxuXG5cdF9mblNhdmVBcHBTdGF0ZUFzeW5jKG9BcHBEYXRhOiBhbnksIGZuT25FcnJvcj86IGFueSkge1xuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHRyZXR1cm4gdGhpcy5fZ2V0QXBwTmF2aWdhdGlvblNlcnZpY2VBc3luYygpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0Nyb3NzQXBwTmF2U2VydmljZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvQ3Jvc3NBcHBOYXZTZXJ2aWNlLmNyZWF0ZUVtcHR5QXBwU3RhdGVBc3luYyhvTmF2SGFuZGxlci5vQ29tcG9uZW50KTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0FwcFN0YXRlOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9OYXZIYW5kbGVyLl9mblNhdmVBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4ob0FwcERhdGEsIG9BcHBTdGF0ZSwgZm5PbkVycm9yKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdGlmIChmbk9uRXJyb3IpIHtcblx0XHRcdFx0XHRmbk9uRXJyb3Iob0Vycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdH1cblxuXHRfc2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihvQXBwRGF0YTogYW55LCBmbk9uRXJyb3I/OiBhbnkpIHtcblx0XHRjb25zdCBvQXBwU3RhdGUgPSB0aGlzLl9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZSgpLmNyZWF0ZUVtcHR5QXBwU3RhdGUodGhpcy5vQ29tcG9uZW50KTtcblx0XHRyZXR1cm4gdGhpcy5fZm5TYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG9BcHBEYXRhLCBvQXBwU3RhdGUsIGZuT25FcnJvcik7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBsb2FkZWQgSUFwcCBTdGF0ZSBhbmQgbmF2aWdhdGlvbiB0eXBlIG9uY2UgcmVzb2x2ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQXBwU3RhdGVLZXkgVGhlIElBcHBTdGF0ZUtleSB0byByZXRyaWV2ZSB0aGUgQXBwU3RhdGUgZGF0YS5cblx0ICogQHBhcmFtIG9EZWZlcnJlZCBKcXVlcnkgZGVmZXJyZWQgb2JqZWN0IHRvIHJlc29sdmUgdGhlIEFwcFN0YXRlIGRhdGEuXG5cdCAqIEBwYXJhbSBuYXZUeXBlIE5hdmlnYXRpb24gdHlwZSBmb3Igd2hpY2ggQXBwU3RhdGUgaXMgcmV0cmlldmVkLlxuXHQgKiBAcmV0dXJucyBUaGUgZGVmZXJyZWQgb2JqZWN0IHdoaWNoIGlzIHJlc29sdmVkIHdpdGggbG9hZGVkIGFwcCBzdGF0ZSBkYXRhXG5cdCBhbmQgbmF2aWdhdGlvbiB0eXBlLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2xvYWRBcHBTdGF0ZShzQXBwU3RhdGVLZXk6IHN0cmluZywgb0RlZmVycmVkOiBqUXVlcnkuRGVmZXJyZWQsIG5hdlR5cGU6IHN0cmluZykge1xuXHRcdGNvbnN0IG9OYXZIYW5kbGVyID0gdGhpcztcblx0XHR0aGlzLl9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZUFzeW5jKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChvQ3Jvc3NBcHBOYXZTZXJ2aWNlOiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgb0FwcFN0YXRlUHJvbWlzZSA9IG9Dcm9zc0FwcE5hdlNlcnZpY2UuZ2V0QXBwU3RhdGUob05hdkhhbmRsZXIub0NvbXBvbmVudCwgc0FwcFN0YXRlS2V5KTtcblx0XHRcdFx0b0FwcFN0YXRlUHJvbWlzZS5kb25lKGZ1bmN0aW9uIChvQXBwU3RhdGU6IGFueSkge1xuXHRcdFx0XHRcdGxldCBvQXBwRGF0YTogYW55ID0ge307XG5cdFx0XHRcdFx0Y29uc3Qgb0FwcERhdGFMb2FkZWQgPSBvQXBwU3RhdGUuZ2V0RGF0YSgpO1xuXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBvQXBwRGF0YUxvYWRlZCA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0Vycm9yID0gb05hdkhhbmRsZXIuX2NyZWF0ZVRlY2huaWNhbEVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuZ2V0RGF0YUZyb21BcHBTdGF0ZS5mYWlsZWRcIik7XG5cdFx0XHRcdFx0XHRvRGVmZXJyZWQucmVqZWN0KG9FcnJvciwge30sIG5hdlR5cGUpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAob05hdkhhbmRsZXIuX3NNb2RlID09PSBNb2RlLk9EYXRhVjIpIHtcblx0XHRcdFx0XHRcdG9BcHBEYXRhID0ge1xuXHRcdFx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50OiBcInt9XCIsXG5cdFx0XHRcdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50OiBuZXcgU2VsZWN0aW9uVmFyaWFudCgpLFxuXHRcdFx0XHRcdFx0XHRvRGVmYXVsdGVkU2VsZWN0aW9uVmFyaWFudDogbmV3IFNlbGVjdGlvblZhcmlhbnQoKSxcblx0XHRcdFx0XHRcdFx0Yk5hdlNlbFZhckhhc0RlZmF1bHRzT25seTogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdHRhYmxlVmFyaWFudElkOiBcIlwiLFxuXHRcdFx0XHRcdFx0XHRjdXN0b21EYXRhOiB7fSxcblx0XHRcdFx0XHRcdFx0YXBwU3RhdGVLZXk6IHNBcHBTdGF0ZUtleSxcblx0XHRcdFx0XHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudDoge30sXG5cdFx0XHRcdFx0XHRcdHZhbHVlVGV4dHM6IHt9LFxuXHRcdFx0XHRcdFx0XHRzZW1hbnRpY0RhdGVzOiB7fSxcblx0XHRcdFx0XHRcdFx0ZGF0YToge31cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAob0FwcERhdGFMb2FkZWQuc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0XHRcdFx0XHQvKlxuXHRcdFx0XHRcdFx0XHQgKiBJbiBjYXNlIHRoYXQgd2UgZ2V0IGFuIG9iamVjdCBmcm9tIHRoZSBzdG9yZWQgQXBwRGF0YSAoPXBlcnNpc3RlbmN5KSwgd2UgbmVlZCB0byBzdHJpbmdpZnkgdGhlIEpTT04gb2JqZWN0LlxuXHRcdFx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRcdFx0b0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCA9IG9OYXZIYW5kbGVyLl9lbnN1cmVTZWxlY3Rpb25WYXJpYW50Rm9ybWF0U3RyaW5nKG9BcHBEYXRhTG9hZGVkLnNlbGVjdGlvblZhcmlhbnQpO1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS5vU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KG9BcHBEYXRhLnNlbGVjdGlvblZhcmlhbnQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKG9BcHBEYXRhTG9hZGVkLnRhYmxlVmFyaWFudElkKSB7XG5cdFx0XHRcdFx0XHRcdG9BcHBEYXRhLnRhYmxlVmFyaWFudElkID0gb0FwcERhdGFMb2FkZWQudGFibGVWYXJpYW50SWQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAob0FwcERhdGFMb2FkZWQuY3VzdG9tRGF0YSkge1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS5jdXN0b21EYXRhID0gb0FwcERhdGFMb2FkZWQuY3VzdG9tRGF0YTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChvQXBwRGF0YUxvYWRlZC5wcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0XHRcdG9BcHBEYXRhLnByZXNlbnRhdGlvblZhcmlhbnQgPSBvQXBwRGF0YUxvYWRlZC5wcmVzZW50YXRpb25WYXJpYW50O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKG9BcHBEYXRhTG9hZGVkLnZhbHVlVGV4dHMpIHtcblx0XHRcdFx0XHRcdFx0b0FwcERhdGEudmFsdWVUZXh0cyA9IG9BcHBEYXRhTG9hZGVkLnZhbHVlVGV4dHM7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAob0FwcERhdGFMb2FkZWQuc2VtYW50aWNEYXRlcykge1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS5zZW1hbnRpY0RhdGVzID0gb0FwcERhdGFMb2FkZWQuc2VtYW50aWNEYXRlcztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8qIEluIFYyIGNhc2UsIHdlIG5lZWQgdGhlIGRhdGEgaW4gdGhlIGJlbG93IGZvcm1hdCBmb3IgaHlicmlkIGNhc2UgKi9cblx0XHRcdFx0XHRcdGlmIChuYXZUeXBlID09PSBOYXZUeXBlLmh5YnJpZCkge1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS5kYXRhID0gb0FwcERhdGFMb2FkZWQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9BcHBEYXRhID0gbWVyZ2Uob0FwcERhdGEsIG9BcHBEYXRhTG9hZGVkKTtcblx0XHRcdFx0XHRcdGlmIChvQXBwRGF0YUxvYWRlZC5zZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdCAqIEluIGNhc2UgdGhhdCB3ZSBnZXQgYW4gb2JqZWN0IGZyb20gdGhlIHN0b3JlZCBBcHBEYXRhICg9cGVyc2lzdGVuY3kpLCB3ZSBuZWVkIHRvIHN0cmluZ2lmeSB0aGUgSlNPTiBvYmplY3QuXG5cdFx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0XHRvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gb05hdkhhbmRsZXIuX2Vuc3VyZVNlbGVjdGlvblZhcmlhbnRGb3JtYXRTdHJpbmcob0FwcERhdGFMb2FkZWQuc2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRcdFx0XHRcdG9BcHBEYXRhLm9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQob0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcmVzb2x2ZSBpcyBjYWxsZWQgb24gcGFzc2VkIERlZmVycmVkIG9iamVjdCB0byB0cmlnZ2VyIGEgY2FsbCBvZiB0aGUgZG9uZSBtZXRob2QsIGlmIGltcGxlbWVudGVkXG5cdFx0XHRcdFx0Ly8gdGhlIGRvbmUgbWV0aG9kIHdpbGwgcmVjZWl2ZSB0aGUgbG9hZGVkIGFwcFN0YXRlIGFuZCB0aGUgbmF2aWdhdGlvbiB0eXBlIGFzIHBhcmFtZXRlcnNcblx0XHRcdFx0XHRvRGVmZXJyZWQucmVzb2x2ZShvQXBwRGF0YSwge30sIG5hdlR5cGUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0b0FwcFN0YXRlUHJvbWlzZS5mYWlsKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjb25zdCBvRXJyb3IgPSBvTmF2SGFuZGxlci5fY3JlYXRlVGVjaG5pY2FsRXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5nZXRBcHBTdGF0ZS5mYWlsZWRcIik7XG5cdFx0XHRcdFx0b0RlZmVycmVkLnJlamVjdChvRXJyb3IsIHt9LCBuYXZUeXBlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBvQXBwU3RhdGVQcm9taXNlO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGNvbnN0IG9FcnJvciA9IG9OYXZIYW5kbGVyLl9jcmVhdGVUZWNobmljYWxFcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyLl9nZXRBcHBOYXZpZ2F0aW9uU2VydmljZUFzeW5jLmZhaWxlZFwiKTtcblx0XHRcdFx0b0RlZmVycmVkLnJlamVjdChvRXJyb3IsIHt9LCBuYXZUeXBlKTtcblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIG9EZWZlcnJlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHBhcmFtZXRlciB2YWx1ZSBvZiB0aGUgc2FwLWlhcHAtc3RhdGUgKHRoZSBpbnRlcm5hbCBhcHBzKSBmcm9tIHRoZSBBcHBIYXNoIHN0cmluZy4gSXQgYXV0b21hdGljYWxseSB0YWtlcyBjYXJlIGFib3V0XG5cdCAqIGNvbXBhdGliaWxpdHkgYmV0d2VlbiB0aGUgb2xkIGFuZCB0aGUgbmV3IGFwcHJvYWNoIG9mIHRoZSBzYXAtaWFwcC1zdGF0ZS4gUHJlY2VkZW5jZSBpcyB0aGF0IHRoZSBuZXcgYXBwcm9hY2ggaXMgZmF2b3VyZWQgYWdhaW5zdCB0aGUgb2xkXG5cdCAqIGFwcHJvYWNoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0FwcEhhc2ggVGhlIEFwcEhhc2gsIHdoaWNoIG1heSBjb250YWluIGEgc2FwLWlhcHAtc3RhdGUgcGFyYW1ldGVyIChib3RoIG9sZCBhbmQvb3IgbmV3IGFwcHJvYWNoKVxuXHQgKiBAcmV0dXJucyBUaGUgdmFsdWUgb2Ygc2FwLWlhcHAtc3RhdGUgKGkuZS4gdGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciB0byByZXRyaWV2ZSB0aGUgcGFyYW1ldGVycyksIG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gaW5cblx0ICogICAgICAgICBjYXNlIHRoYXQgbm8gc2FwLWlhcHAtc3RhdGUgd2FzIGZvdW5kIGluIDxjb2RlPnNBcHBIYXNoPC9jb2RlPi5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRJbm5lckFwcFN0YXRlS2V5KHNBcHBIYXNoOiBzdHJpbmcpIHtcblx0XHQvLyB0cml2aWFsIGNhc2U6IG5vIGFwcCBoYXNoIGF2YWlsYWJsZSBhdCBhbGwuXG5cdFx0aWYgKCFzQXBwSGFzaCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvKiBuZXcgYXBwcm9hY2g6IHNlcGFyYXRlZCB2aWEgcXVlc3Rpb24gbWFyayAvIHBhcnQgb2YgdGhlIHF1ZXJ5IHBhcmFtZXRlciBvZiB0aGUgQXBwSGFzaCAqL1xuXHRcdGxldCBhTWF0Y2hlcyA9IHRoaXMuX3JJQXBwU3RhdGVOZXcuZXhlYyhzQXBwSGFzaCk7XG5cblx0XHQvKiBvbGQgYXBwcm9hY2g6IHNwZWFyYXRlZCB2aWEgc2xhc2hlcyAvIGkuZS4gcGFydCBvZiB0aGUgcm91dGUgaXRzZWxmICovXG5cdFx0aWYgKGFNYXRjaGVzID09PSBudWxsKSB7XG5cdFx0XHRhTWF0Y2hlcyA9IHRoaXMuX3JJQXBwU3RhdGVPbGQuZXhlYyhzQXBwSGFzaCk7XG5cdFx0fVxuXG5cdFx0Lypcblx0XHQgKiBvbGQgYXBwcm9hY2g6IHNwZWNpYWwgY2FzZTogaWYgdGhlcmUgaXMgbm8gZGVlcCByb3V0ZS9rZXkgZGVmaW5lZCwgdGhlIHNhcC1pYXBwLXN0YXRlIG1heSBiZSBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzdHJpbmcsIHdpdGhvdXRcblx0XHQgKiBhbnkgc2VwYXJhdGlvbiB3aXRoIHRoZSBzbGFzaGVzXG5cdFx0ICovXG5cdFx0aWYgKGFNYXRjaGVzID09PSBudWxsKSB7XG5cdFx0XHRhTWF0Y2hlcyA9IHRoaXMuX3JJQXBwU3RhdGVPbGRBdFN0YXJ0LmV4ZWMoc0FwcEhhc2gpO1xuXHRcdH1cblxuXHRcdGlmIChhTWF0Y2hlcyA9PT0gbnVsbCkge1xuXHRcdFx0Ly8gdGhlcmUgaXMgbm8gKHZhbGlkKSBzYXAtaWFwcC1zdGF0ZSBpbiB0aGUgQXBwIEhhc2hcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFNYXRjaGVzWzFdO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlcGxhY2VzIChvciBpbnNlcnRzKSBhIHBhcmFtZXRlciB2YWx1ZSAoYW4gQXBwU3RhdGVLZXkpIGZvciB0aGUgc2FwLWlhcHAtc3RhdGUgaW50byBhbiBleGlzdGluZyBBcHBIYXNoIHN0cmluZy4gT3RoZXIgcm91dGVzL3BhcmFtZXRlcnNcblx0ICogYXJlIGlnbm9yZWQgYW5kIHJldHVybmVkIHdpdGhvdXQgbW9kaWZpY2F0aW9uIChcImVudmlyb25tZW50YWwgYWdub3N0aWNcIiBwcm9wZXJ0eSkuIE9ubHkgdGhlIG5ldyBhcHByb2FjaCAoc2FwLWlhcHAtc3RhdGUgYXMgcXVlcnkgcGFyYW1ldGVyXG5cdCAqIGluIHRoZSBBcHBIYXNoKSBpcyBiZWluZyBpc3N1ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQXBwSGFzaCBUaGUgQXBwSGFzaCBpbnRvIHdoaWNoIHRoZSBzYXAtaWFwcC1zdGF0ZSBwYXJhbWV0ZXIgc2hhbGwgYmUgbWFkZSBhdmFpbGFibGVcblx0ICogQHBhcmFtIHNBcHBTdGF0ZUtleSBUaGUga2V5IHZhbHVlIG9mIHRoZSBBcHBTdGF0ZSB3aGljaCBzaGFsbCBiZSBzdG9yZWQgYXMgcGFyYW1ldGVyIHZhbHVlIG9mIHRoZSBzYXAtaWFwcC1zdGF0ZSBwcm9wZXJ0eS5cblx0ICogQHJldHVybnMgVGhlIG1vZGlmaWVkIHNBcHBIYXNoIHN0cmluZywgc3VjaCB0aGF0IHRoZSBzYXAtaWFwcC1zdGF0ZSBoYXMgYmVlbiBzZXQgYmFzZWQgb24gdGhlIG5ldyAocXVlcnkgb3B0aW9uLWJhc2VkKVxuXHQgKiAgICAgICAgIHNhcC1pYXBwLXN0YXRlLiBJZiBhIHNhcC1pYXBwLXN0YXRlIGhhcyBiZWVuIHNwZWNpZmllZCBiZWZvcmUsIHRoZSBrZXkgaXMgcmVwbGFjZWQuIElmIDxjb2RlPnNBcHBIYXNoPC9jb2RlPiB3YXMgb2YgdGhlIG9sZFxuXHQgKiAgICAgICAgIGZvcm1hdCAoc2FwLWlhcHAtc3RhdGUgYXMgcGFydCBvZiB0aGUga2V5cy9yb3V0ZSksIHRoZSBmb3JtYXQgaXMgY29udmVydGVkIHRvIHRoZSBuZXcgZm9ybWF0IGJlZm9yZSB0aGUgcmVzdWx0IGlzIHJldHVybmVkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3JlcGxhY2VJbm5lckFwcFN0YXRlS2V5KHNBcHBIYXNoOiBzdHJpbmcsIHNBcHBTdGF0ZUtleTogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgc05ld0lBcHBTdGF0ZSA9IElBUFBfU1RBVEUgKyBcIj1cIiArIHNBcHBTdGF0ZUtleTtcblxuXHRcdC8qXG5cdFx0ICogZ2VuZXJhdGUgc2FwLWlhcHAtc3RhdGVzIHdpdGggdGhlIG5ldyB3YXlcblx0XHQgKi9cblx0XHRpZiAoIXNBcHBIYXNoKSB7XG5cdFx0XHQvLyB0aGVyZSdzIG5vIHNBcHBIYXNoIGtleSB5ZXRcblx0XHRcdHJldHVybiBcIj9cIiArIHNOZXdJQXBwU3RhdGU7XG5cdFx0fVxuXG5cdFx0Y29uc3QgZm5BcHBlbmRUb1F1ZXJ5UGFyYW1ldGVyID0gZnVuY3Rpb24gKHNTdWJBcHBIYXNoOiBhbnkpIHtcblx0XHRcdC8vIHRoZXJlIGlzIGFuIEFwcEhhc2ggYXZhaWxhYmxlLCBidXQgaXQgZG9lcyBub3QgY29udGFpbiBhIHNhcC1pYXBwLXN0YXRlIHBhcmFtZXRlciB5ZXQgLSB3ZSBuZWVkIHRvIGFwcGVuZCBvbmVcblxuXHRcdFx0Ly8gbmV3IGFwcHJvYWNoOiB3ZSBuZWVkIHRvIGNoZWNrLCBpZiBhIHNldCBvZiBxdWVyeSBwYXJhbWV0ZXJzIGlzIGFscmVhZHkgYXZhaWxhYmxlXG5cdFx0XHRpZiAoc1N1YkFwcEhhc2guaW5kZXhPZihcIj9cIikgIT09IC0xKSB7XG5cdFx0XHRcdC8vIHRoZXJlIGFyZSBhbHJlYWR5IHF1ZXJ5IHBhcmFtZXRlcnMgYXZhaWxhYmxlIC0gYXBwZW5kIGl0IGFzIGFub3RoZXIgcGFyYW1ldGVyXG5cdFx0XHRcdHJldHVybiBzU3ViQXBwSGFzaCArIFwiJlwiICsgc05ld0lBcHBTdGF0ZTtcblx0XHRcdH1cblx0XHRcdC8vIHRoZXJlIGFyZSBubyBhIHF1ZXJ5IHBhcmFtZXRlcnMgYXZhaWxhYmxlIHlldDsgY3JlYXRlIGEgc2V0IHdpdGggYSBzaW5nbGUgcGFyYW1ldGVyXG5cdFx0XHRyZXR1cm4gc1N1YkFwcEhhc2ggKyBcIj9cIiArIHNOZXdJQXBwU3RhdGU7XG5cdFx0fTtcblxuXHRcdGlmICghdGhpcy5fZ2V0SW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaCkpIHtcblx0XHRcdHJldHVybiBmbkFwcGVuZFRvUXVlcnlQYXJhbWV0ZXIoc0FwcEhhc2gpO1xuXHRcdH1cblx0XHQvLyBUaGVyZSBpcyBhbiBBcHBIYXNoIGF2YWlsYWJsZSBhbmQgdGhlcmUgaXMgYWxyZWFkeSBhbiBzYXAtaWFwcC1zdGF0ZSBpbiB0aGUgQXBwSGFzaFxuXG5cdFx0aWYgKHRoaXMuX3JJQXBwU3RhdGVOZXcudGVzdChzQXBwSGFzaCkpIHtcblx0XHRcdC8vIHRoZSBuZXcgYXBwcm9hY2ggaXMgYmVpbmcgdXNlZFxuXHRcdFx0cmV0dXJuIHNBcHBIYXNoLnJlcGxhY2UodGhpcy5fcklBcHBTdGF0ZU5ldywgZnVuY3Rpb24gKHNOZWVkbGU6IHN0cmluZykge1xuXHRcdFx0XHRyZXR1cm4gc05lZWRsZS5yZXBsYWNlKC9bPV0uKi9naSwgXCI9XCIgKyBzQXBwU3RhdGVLZXkpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly8gd2UgbmVlZCB0byByZW1vdmUgdGhlIG9sZCBBcHBIYXNoIGVudGlyZWx5IGFuZCByZXBsYWNlIGl0IHdpdGggYSBuZXcgb25lLlxuXG5cdFx0Y29uc3QgZm5SZXBsYWNlT2xkQXBwcm9hY2ggPSBmdW5jdGlvbiAock9sZEFwcHJvYWNoOiBhbnksIHNTdWJBcHBIYXNoOiBhbnkpIHtcblx0XHRcdHNTdWJBcHBIYXNoID0gc1N1YkFwcEhhc2gucmVwbGFjZShyT2xkQXBwcm9hY2gsIFwiXCIpO1xuXHRcdFx0cmV0dXJuIGZuQXBwZW5kVG9RdWVyeVBhcmFtZXRlcihzU3ViQXBwSGFzaCk7XG5cdFx0fTtcblxuXHRcdGlmICh0aGlzLl9ySUFwcFN0YXRlT2xkLnRlc3Qoc0FwcEhhc2gpKSB7XG5cdFx0XHRyZXR1cm4gZm5SZXBsYWNlT2xkQXBwcm9hY2godGhpcy5fcklBcHBTdGF0ZU9sZCwgc0FwcEhhc2gpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9ySUFwcFN0YXRlT2xkQXRTdGFydC50ZXN0KHNBcHBIYXNoKSkge1xuXHRcdFx0cmV0dXJuIGZuUmVwbGFjZU9sZEFwcHJvYWNoKHRoaXMuX3JJQXBwU3RhdGVPbGRBdFN0YXJ0LCBzQXBwSGFzaCk7XG5cdFx0fVxuXG5cdFx0YXNzZXJ0KGZhbHNlLCBcImludGVybmFsIGluY29uc2lzdGVuY3k6IEFwcHJvYWNoIG9mIHNhcC1pYXBwLXN0YXRlIG5vdCBrbm93biwgYnV0IF9nZXRJbm5lckFwcFN0YXRlS2V5IHJldHVybmVkIGl0XCIpO1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRfZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50KHZTZWxlY3Rpb25WYXJpYW50OiBhbnkpIHtcblx0XHRjb25zdCBtVVJMUGFyYW1ldGVyczogYW55ID0ge307XG5cdFx0bGV0IGkgPSAwO1xuXHRcdGxldCBvU2VsZWN0aW9uVmFyaWFudDtcblxuXHRcdGlmICh0eXBlb2YgdlNlbGVjdGlvblZhcmlhbnQgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IFNlbGVjdGlvblZhcmlhbnQodlNlbGVjdGlvblZhcmlhbnQpO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHZTZWxlY3Rpb25WYXJpYW50ID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IHZTZWxlY3Rpb25WYXJpYW50O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgTmF2RXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX0lOUFVUXCIpO1xuXHRcdH1cblxuXHRcdC8vIGFkZCBVUkxzIHBhcmFtZXRlcnMgZnJvbSBTZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMgKGlmIHNpbmdsZSB2YWx1ZSlcblx0XHRjb25zdCBhU2VsZWN0UHJvcGVydGllcyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCk7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGFTZWxlY3RQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBhU2VsZWN0T3B0aW9ucyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbihhU2VsZWN0UHJvcGVydGllc1tpXSk7XG5cdFx0XHRpZiAoYVNlbGVjdE9wdGlvbnMubGVuZ3RoID09PSAxICYmIGFTZWxlY3RPcHRpb25zWzBdLlNpZ24gPT09IFwiSVwiICYmIGFTZWxlY3RPcHRpb25zWzBdLk9wdGlvbiA9PT0gXCJFUVwiKSB7XG5cdFx0XHRcdG1VUkxQYXJhbWV0ZXJzW2FTZWxlY3RQcm9wZXJ0aWVzW2ldXSA9IGFTZWxlY3RPcHRpb25zWzBdLkxvdztcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBhZGQgcGFyYW1ldGVycyBmcm9tIFNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVyc1xuXHRcdGNvbnN0IGFQYXJhbWV0ZXJOYW1lcyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFBhcmFtZXRlck5hbWVzKCk7XG5cdFx0Zm9yIChpID0gMDsgaSA8IGFQYXJhbWV0ZXJOYW1lcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgc1BhcmFtZXRlclZhbHVlID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0UGFyYW1ldGVyKGFQYXJhbWV0ZXJOYW1lc1tpXSk7XG5cblx0XHRcdG1VUkxQYXJhbWV0ZXJzW2FQYXJhbWV0ZXJOYW1lc1tpXV0gPSBzUGFyYW1ldGVyVmFsdWU7XG5cdFx0fVxuXHRcdHJldHVybiBtVVJMUGFyYW1ldGVycztcblx0fVxuXG5cdF9jcmVhdGVUZWNobmljYWxFcnJvcihzRXJyb3JDb2RlOiBhbnkpIHtcblx0XHRyZXR1cm4gbmV3IE5hdkVycm9yKHNFcnJvckNvZGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIG1vZGVsIHRoYXQgaXMgdXNlZCBmb3IgdmVyaWZpY2F0aW9uIG9mIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbi4gSWYgdGhlIG1vZGVsIGlzIG5vdCBzZXQsIHRoZSB1bm5hbWVkIGNvbXBvbmVudCBtb2RlbCBpcyB1c2VkIGZvciB0aGVcblx0ICogdmVyaWZpY2F0aW9uIG9mIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0gb01vZGVsIEZvciBjaGVja2luZyBzZW5zaXRpdmUgaW5mb3JtYXRpb25cblx0ICovXG5cdHNldE1vZGVsKG9Nb2RlbDogVjJPRGF0YU1vZGVsIHwgVjRPRGF0YU1vZGVsKSB7XG5cdFx0dGhpcy5fb01vZGVsID0gb01vZGVsO1xuXHR9XG5cblx0X2dldE1vZGVsKCk6IFYyT0RhdGFNb2RlbCB8IFY0T0RhdGFNb2RlbCB7XG5cdFx0cmV0dXJuIHRoaXMuX29Nb2RlbCB8fCB0aGlzLm9Db21wb25lbnQuZ2V0TW9kZWwoKTtcblx0fVxuXG5cdF9yZW1vdmVBbGxQcm9wZXJ0aWVzKG9EYXRhOiBhbnkpIHtcblx0XHRpZiAob0RhdGEpIHtcblx0XHRcdGlmIChvRGF0YS5zZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQgPSBudWxsO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0RhdGEudmFsdWVUZXh0cykge1xuXHRcdFx0XHRvRGF0YS52YWx1ZVRleHRzID0gbnVsbDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9EYXRhLnNlbWFudGljRGF0ZXMpIHtcblx0XHRcdFx0b0RhdGEuc2VtYW50aWNEYXRlcyA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X3JlbW92ZVByb3BlcnRpZXMoYUZpbHRlck5hbWU6IGFueSwgYVBhcmFtZXRlck5hbWU6IGFueSwgb0RhdGE6IGFueSkge1xuXHRcdGlmIChhRmlsdGVyTmFtZS5sZW5ndGggJiYgb0RhdGEgJiYgKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQgfHwgb0RhdGEudmFsdWVUZXh0cyB8fCBvRGF0YS5zZW1hbnRpY0RhdGVzKSkge1xuXHRcdFx0YUZpbHRlck5hbWUuZm9yRWFjaChmdW5jdGlvbiAoc05hbWU6IGFueSkge1xuXHRcdFx0XHRpZiAob0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zKSB7XG5cdFx0XHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zLnNvbWUoZnVuY3Rpb24gKG9WYWx1ZTogYW55LCBuSWR4OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChzTmFtZSA9PT0gb1ZhbHVlLlByb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMuc3BsaWNlKG5JZHgsIDEpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9EYXRhLnZhbHVlVGV4dHMgJiYgb0RhdGEudmFsdWVUZXh0cy5UZXh0cykge1xuXHRcdFx0XHRcdG9EYXRhLnZhbHVlVGV4dHMuVGV4dHMuZm9yRWFjaChmdW5jdGlvbiAob1RleHRzOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChvVGV4dHMuUHJvcGVydHlUZXh0cykge1xuXHRcdFx0XHRcdFx0XHRvVGV4dHMuUHJvcGVydHlUZXh0cy5zb21lKGZ1bmN0aW9uIChvVmFsdWU6IGFueSwgbklkeDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNOYW1lID09PSBvVmFsdWUuUHJvcGVydHlOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvVGV4dHMuUHJvcGVydHlUZXh0cy5zcGxpY2UobklkeCwgMSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9EYXRhLnNlbWFudGljRGF0ZXMgJiYgb0RhdGEuc2VtYW50aWNEYXRlcy5EYXRlcykge1xuXHRcdFx0XHRcdG9EYXRhLnNlbWFudGljRGF0ZXMuRGF0ZXMuZm9yRWFjaChmdW5jdGlvbiAob0RhdGVzOiBhbnksIG5JZHg6IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKHNOYW1lID09PSBvRGF0ZXMuUHJvcGVydHlOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdG9EYXRhLnNlbWFudGljRGF0ZXMuRGF0ZXMuc3BsaWNlKG5JZHgsIDEpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoYVBhcmFtZXRlck5hbWUubGVuZ3RoICYmIG9EYXRhICYmIG9EYXRhLnNlbGVjdGlvblZhcmlhbnQgJiYgb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzKSB7XG5cdFx0XHRhUGFyYW1ldGVyTmFtZS5mb3JFYWNoKGZ1bmN0aW9uIChzTmFtZTogYW55KSB7XG5cdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycy5zb21lKGZ1bmN0aW9uIChvVmFsdWU6IGFueSwgbklkeDogYW55KSB7XG5cdFx0XHRcdFx0aWYgKHNOYW1lID09PSBvVmFsdWUuUHJvcGVydHlOYW1lIHx8IFwiJFBhcmFtZXRlci5cIiArIHNOYW1lID09PSBvVmFsdWUuUHJvcGVydHlOYW1lKSB7XG5cdFx0XHRcdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlcnMuc3BsaWNlKG5JZHgsIDEpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdF9pc1Rlcm1UcnVlKG9Qcm9wZXJ0eTogYW55LCBzVGVybTogYW55KSB7XG5cdFx0Y29uc3QgZklzVGVybURlZmF1bHRUcnVlID0gZnVuY3Rpb24gKG9UZXJtOiBhbnkpIHtcblx0XHRcdGlmIChvVGVybSkge1xuXHRcdFx0XHRyZXR1cm4gb1Rlcm0uQm9vbCA/IG9UZXJtLkJvb2wgIT09IFwiZmFsc2VcIiA6IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fTtcblxuXHRcdHJldHVybiAhIW9Qcm9wZXJ0eVtzVGVybV0gJiYgZklzVGVybURlZmF1bHRUcnVlKG9Qcm9wZXJ0eVtzVGVybV0pO1xuXHR9XG5cblx0X2lzRXhjbHVkZWRGcm9tTmF2aWdhdGlvbkNvbnRleHQob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5faXNUZXJtVHJ1ZShvUHJvcGVydHksIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dFwiKTtcblx0fVxuXG5cdF9pc1BvdGVudGlhbGx5U2Vuc2l0aXZlKG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lzVGVybVRydWUob1Byb3BlcnR5LCBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5U2Vuc2l0aXZlXCIpO1xuXHR9XG5cblx0X2lzTWVhc3VyZVByb3BlcnR5KG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lzVGVybVRydWUob1Byb3BlcnR5LCBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5NZWFzdXJlXCIpO1xuXHR9XG5cblx0X2lzVG9CZUV4Y2x1ZGVkKG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lzUG90ZW50aWFsbHlTZW5zaXRpdmUob1Byb3BlcnR5KSB8fCB0aGlzLl9pc0V4Y2x1ZGVkRnJvbU5hdmlnYXRpb25Db250ZXh0KG9Qcm9wZXJ0eSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCBjcmVhdGVzIGEgY29udGV4dCB1cmwgYmFzZWQgb24gcHJvdmlkZWQgZGF0YS4gVGhpcyBjb250ZXh0IHVybCBjYW4gZWl0aGVyIGJlIHVzZWQgYXNcblx0ICoge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyI3NldFBhcmFtZXRlckNvbnRleHRVcmwgUGFyYW1ldGVyQ29udGV4dFVybH0gb3Jcblx0ICoge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdmlnYXRpb25IYW5kbGVyI3NldEZpbHRlckNvbnRleHRVcmwgRmlsdGVyQ29udGV4dFVybH0uXG5cdCAqXG5cdCAqIEBwYXJhbSBzRW50aXR5U2V0TmFtZSBVc2VkIGZvciB1cmwgZGV0ZXJtaW5hdGlvblxuXHQgKiBAcGFyYW0gW29Nb2RlbF0gVXNlZCBmb3IgdXJsIGRldGVybWluYXRpb24uIElmIG9taXR0ZWQsIHRoZSBOYXZpZ2F0aW9uSGFuZGxlciBtb2RlbCBpcyB1c2VkLlxuXHQgKiBAdGhyb3dzIEFuIGluc3RhbmNlIG9mIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0gaW4gY2FzZSBvZiBtaXNzaW5nIG9yIHdyb25nIHBhc3NlZCBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFRoZSBjb250ZXh0IHVybCBmb3IgdGhlIGdpdmVuIGVudGl0aWVzXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdGNvbnN0cnVjdENvbnRleHRVcmwoc0VudGl0eVNldE5hbWU6IHN0cmluZywgb01vZGVsPzogVjJPRGF0YU1vZGVsIHwgVjRPRGF0YU1vZGVsKSB7XG5cdFx0aWYgKCFzRW50aXR5U2V0TmFtZSkge1xuXHRcdFx0dGhyb3cgbmV3IE5hdkVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXIuTk9fRU5USVRZX1NFVF9QUk9WSURFRFwiKTtcblx0XHR9XG5cblx0XHRpZiAob01vZGVsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdG9Nb2RlbCA9IHRoaXMuX2dldE1vZGVsKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX2NvbnN0cnVjdENvbnRleHRVcmwob01vZGVsKSArIFwiI1wiICsgc0VudGl0eVNldE5hbWU7XG5cdH1cblxuXHRfY29uc3RydWN0Q29udGV4dFVybChvTW9kZWw6IFYyT0RhdGFNb2RlbCB8IFY0T0RhdGFNb2RlbCkge1xuXHRcdGxldCBzU2VydmVyVXJsO1xuXG5cdFx0aWYgKG9Nb2RlbC5pc0E8VjJPRGF0YU1vZGVsPihcInNhcC51aS5tb2RlbC5vZGF0YS52Mi5PRGF0YU1vZGVsXCIpKSB7XG5cdFx0XHRzU2VydmVyVXJsID0gb01vZGVsLl9nZXRTZXJ2ZXJVcmwoKTtcblx0XHR9IGVsc2UgaWYgKG9Nb2RlbC5pc0E8VjRPRGF0YU1vZGVsPihcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YU1vZGVsXCIpKSB7XG5cdFx0XHRjb25zdCBvU2VydmljZVVSSSA9IG5ldyBVUkkob01vZGVsLnNTZXJ2aWNlVXJsKS5hYnNvbHV0ZVRvKGRvY3VtZW50LmJhc2VVUkkpO1xuXHRcdFx0c1NlcnZlclVybCA9IG5ldyBVUkkoXCIvXCIpLmFic29sdXRlVG8ob1NlcnZpY2VVUkkpLnRvU3RyaW5nKCk7XG5cdFx0fVxuXG5cdFx0aWYgKHNTZXJ2ZXJVcmwgJiYgc1NlcnZlclVybC5sYXN0SW5kZXhPZihcIi9cIikgPT09IHNTZXJ2ZXJVcmwubGVuZ3RoIC0gMSkge1xuXHRcdFx0c1NlcnZlclVybCA9IHNTZXJ2ZXJVcmwuc3Vic3RyKDAsIHNTZXJ2ZXJVcmwubGVuZ3RoIC0gMSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNTZXJ2ZXJVcmwgKyBvTW9kZWwuc1NlcnZpY2VVcmwgKyBcIi8kbWV0YWRhdGFcIjtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHZlcmlmaWVzLCBpZiBhbnkgb2YgdGhlIHBhc3NlZCBwYXJhbWV0ZXJzL2ZpbHRlcnMgYXJlIG1hcmtlZCBhcyBzZW5zaXRpdmUsIGFuZCBpZiB0aGlzIGlzIHRoZSBjYXNlIHJlbW92ZSB0aG9zZSBmcm9tIHRoZSBhcHBcblx0ICogZGF0YS4gPGI+Tm90ZTo8L2I+IFRvIHVzZSB0aGlzIG1ldGhvZCwgdGhlIG1ldGFkYXRhIG11c3QgYmUgbG9hZGVkIGZpcnN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGEgV2l0aCBwb3RlbnRpYWwgc2Vuc2l0aXZlIGluZm9ybWF0aW9uIChmb3IgT0RhdGEsIGV4dGVybmFsIHJlcHJlc2VudGF0aW9uIHVzaW5nXG5cdCAqIDxjb2RlPm9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTk9iamVjdCgpPC9jb2RlPiBtdXN0IGJlIHVzZWQpLCB3aXRoIHRoZSA8Y29kZT5GaWx0ZXJDb250ZXh0VXJsPC9jb2RlPiBvclxuXHQgKiA8Y29kZT5QYXJhbWV0ZXJDb250ZXh0VXJsPC9jb2RlPiBwcm9wZXJ0eS5cblx0ICogQHJldHVybnMgRGF0YSB3aXRob3V0IHByb3BlcnRpZXMgbWFya2VkIGFzIHNlbnNpdGl2ZSBvciBhbiBlbXB0eSBvYmplY3QgaWYgdGhlIE9EYXRhIG1ldGFkYXRhIGlzIG5vdCBmdWxseSBsb2FkZWQgeWV0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfY2hlY2tJc1BvdGVudGlhbGx5U2Vuc2l0aXZlKG9EYXRhOiBhbnkpIHtcblx0XHRsZXQgb0FkYXB0ZWREYXRhID0gb0RhdGE7XG5cdFx0aWYgKFxuXHRcdFx0b0RhdGEgJiZcblx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQgJiZcblx0XHRcdCgob0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsICYmIG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucykgfHxcblx0XHRcdFx0KG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVyQ29udGV4dFVybCAmJiBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlcnMpKVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgb01vZGVsID0gdGhpcy5fZ2V0TW9kZWwoKTtcblx0XHRcdGlmICh0aGlzLm9Db21wb25lbnQgJiYgb01vZGVsICYmIG9Nb2RlbC5pc0E8VjJPRGF0YU1vZGVsPihcInNhcC51aS5tb2RlbC5vZGF0YS52Mi5PRGF0YU1vZGVsXCIpKSB7XG5cdFx0XHRcdGNvbnN0IGFTZW5zaXRpdmVGaWx0ZXJOYW1lID0gW107XG5cdFx0XHRcdGNvbnN0IGFTZW5zaXRpdmVQYXJhbWV0ZXJOYW1lID0gW107XG5cdFx0XHRcdGxldCBpLFxuXHRcdFx0XHRcdG9FbnRpdHlTZXQ6IGFueSxcblx0XHRcdFx0XHRvRW50aXR5RGVmOiBhbnksXG5cdFx0XHRcdFx0b1N1YkVudGl0eURlZjogYW55LFxuXHRcdFx0XHRcdG9FbmRSb2xlOiBhbnksXG5cdFx0XHRcdFx0YUZpbHRlckNvbnRleHRQYXJ0ID0gW10sXG5cdFx0XHRcdFx0YVBhcmFtQ29udGV4dFBhcnQgPSBbXTtcblxuXHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRpZiAob01vZGVsLmdldFNlcnZpY2VNZXRhZGF0YSgpICYmIG9NZXRhTW9kZWw/Lm9Nb2RlbCkge1xuXHRcdFx0XHRcdGlmIChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LkZpbHRlckNvbnRleHRVcmwpIHtcblx0XHRcdFx0XHRcdGFGaWx0ZXJDb250ZXh0UGFydCA9IG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybC5zcGxpdChcIiNcIik7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0YUZpbHRlckNvbnRleHRQYXJ0Lmxlbmd0aCA9PT0gMiAmJlxuXHRcdFx0XHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zICYmXG5cdFx0XHRcdFx0XHR0aGlzLl9jb25zdHJ1Y3RDb250ZXh0VXJsKG9Nb2RlbCkuaW5kZXhPZihhRmlsdGVyQ29udGV4dFBhcnRbMF0pID09PSAwXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRvRW50aXR5U2V0ID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVNldChhRmlsdGVyQ29udGV4dFBhcnRbMV0pO1xuXHRcdFx0XHRcdFx0aWYgKG9FbnRpdHlTZXQpIHtcblx0XHRcdFx0XHRcdFx0b0VudGl0eURlZiA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlUeXBlKG9FbnRpdHlTZXQuZW50aXR5VHlwZSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRvRW50aXR5RGVmID0gb01ldGFNb2RlbC5nZXRPRGF0YUVudGl0eVR5cGUoYUZpbHRlckNvbnRleHRQYXJ0WzFdKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKG9FbnRpdHlEZWYpIHtcblx0XHRcdFx0XHRcdFx0aWYgKG9FbnRpdHlEZWYgJiYgb0VudGl0eURlZi5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvRW50aXR5RGVmLnByb3BlcnR5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5faXNUb0JlRXhjbHVkZWQob0VudGl0eURlZi5wcm9wZXJ0eVtpXSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YVNlbnNpdGl2ZUZpbHRlck5hbWUucHVzaChvRW50aXR5RGVmLnByb3BlcnR5W2ldLm5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmLm5hdmlnYXRpb25Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBvRW50aXR5RGVmLm5hdmlnYXRpb25Qcm9wZXJ0eS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0b0VuZFJvbGUgPSBvTWV0YU1vZGVsLmdldE9EYXRhQXNzb2NpYXRpb25FbmQob0VudGl0eURlZiwgb0VudGl0eURlZi5uYXZpZ2F0aW9uUHJvcGVydHlbaV0ubmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIW9FbmRSb2xlIHx8IG9FbmRSb2xlLnR5cGUgPT09IG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBlbmQgcm9sZSBoYXMgY2FyZGluYWxpdHkgMC4uMSBvciAxXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob0VuZFJvbGUubXVsdGlwbGljaXR5ID09PSBcIjFcIiB8fCBvRW5kUm9sZS5tdWx0aXBsaWNpdHkgPT09IFwiMC4uMVwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9TdWJFbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShvRW5kUm9sZS50eXBlKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9TdWJFbnRpdHlEZWYgJiYgb1N1YkVudGl0eURlZi5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgb1N1YkVudGl0eURlZi5wcm9wZXJ0eS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuX2lzVG9CZUV4Y2x1ZGVkKG9TdWJFbnRpdHlEZWYucHJvcGVydHlbal0pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFTZW5zaXRpdmVGaWx0ZXJOYW1lLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0VudGl0eURlZi5uYXZpZ2F0aW9uUHJvcGVydHlbaV0ubmFtZSArIFwiLlwiICsgb1N1YkVudGl0eURlZi5wcm9wZXJ0eVtqXS5uYW1lXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVyQ29udGV4dFVybCkge1xuXHRcdFx0XHRcdFx0YVBhcmFtQ29udGV4dFBhcnQgPSBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlckNvbnRleHRVcmwuc3BsaXQoXCIjXCIpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0Lmxlbmd0aCA9PT0gMiAmJlxuXHRcdFx0XHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzICYmXG5cdFx0XHRcdFx0XHR0aGlzLl9jb25zdHJ1Y3RDb250ZXh0VXJsKG9Nb2RlbCkuaW5kZXhPZihhUGFyYW1Db250ZXh0UGFydFswXSkgPT09IDBcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdG9FbnRpdHlTZXQgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5U2V0KGFQYXJhbUNvbnRleHRQYXJ0WzFdKTtcblx0XHRcdFx0XHRcdGlmIChvRW50aXR5U2V0KSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShvRW50aXR5U2V0LmVudGl0eVR5cGUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0b0VudGl0eURlZiA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlUeXBlKGFGaWx0ZXJDb250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmLnByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG9FbnRpdHlEZWYucHJvcGVydHkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLl9pc1RvQmVFeGNsdWRlZChvRW50aXR5RGVmLnByb3BlcnR5W2ldKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhU2Vuc2l0aXZlUGFyYW1ldGVyTmFtZS5wdXNoKG9FbnRpdHlEZWYucHJvcGVydHlbaV0ubmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGFTZW5zaXRpdmVGaWx0ZXJOYW1lLmxlbmd0aCB8fCBhU2Vuc2l0aXZlUGFyYW1ldGVyTmFtZS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdG9BZGFwdGVkRGF0YSA9IGV4dGVuZCh0cnVlIGFzIGFueSwge30sIG9BZGFwdGVkRGF0YSk7XG5cblx0XHRcdFx0XHRcdHRoaXMuX3JlbW92ZVByb3BlcnRpZXMoYVNlbnNpdGl2ZUZpbHRlck5hbWUsIGFTZW5zaXRpdmVQYXJhbWV0ZXJOYW1lLCBvQWRhcHRlZERhdGEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBhbm5vdGF0aW9ucyBhcmUgbm90IGxvYWRlZFxuXG5cdFx0XHRcdFx0dGhpcy5fcmVtb3ZlQWxsUHJvcGVydGllcyhvQWRhcHRlZERhdGEpO1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyOiBvTWV0YWRhdGEgYXJlIG5vdCBmdWxseSBsb2FkZWQhXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMub0NvbXBvbmVudCAmJiBvTW9kZWwgJiYgb01vZGVsLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YU1vZGVsXCIpKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9yZW1vdmVTZW5zaXRpdmVEYXRhRm9yT0RhdGFWNChvQWRhcHRlZERhdGEpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBvQWRhcHRlZERhdGE7XG5cdH1cblxuXHRfcmVtb3ZlTWVhc3VyZUJhc2VkSW5mb3JtYXRpb24ob0FwcERhdGE6IGFueSkge1xuXHRcdGxldCBvQXBwRGF0YUZvclNhdmUgPSBvQXBwRGF0YTtcblxuXHRcdGlmIChvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHQvKlxuXHRcdFx0ICogVGhlIHNwZWNpZmljYXRpb24gc3RhdGVzIHRoYXQgU2VsZWN0aW9uIFZhcmlhbnRzIG5lZWQgdG8gYmUgSlNPTiBvYmplY3RzLiBIb3dldmVyLCBpbnRlcm5hbGx5LCB3ZSB3b3JrIHdpdGggc3RyaW5ncyBmb3Jcblx0XHRcdCAqIFwic2VsZWN0aW9uVmFyaWFudFwiLiBUaGVyZWZvcmUsIGluIGNhc2UgdGhhdCB0aGlzIGlzIGEgc3RyaW5nLCB3ZSBuZWVkIHRvIEpTT04tcGFyc2UgdGhlIGRhdGEuXG5cdFx0XHQgKi9cblx0XHRcdGlmICh0eXBlb2Ygb0FwcERhdGEuc2VsZWN0aW9uVmFyaWFudCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdG9BcHBEYXRhRm9yU2F2ZS5zZWxlY3Rpb25WYXJpYW50ID0gSlNPTi5wYXJzZShvQXBwRGF0YS5zZWxlY3Rpb25WYXJpYW50KTtcblx0XHRcdFx0fSBjYXRjaCAoeCkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIk5hdmlnYXRpb25IYW5kbGVyOiBfcmVtb3ZlTWVhc3VyZUJhc2VkSW5mb3JtYXRpb24gcGFyc2UgZXJyb3JcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0b0FwcERhdGFGb3JTYXZlID0gdGhpcy5fcmVtb3ZlTWVhc3VyZUJhc2VkUHJvcGVydGllcyhvQXBwRGF0YUZvclNhdmUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvQXBwRGF0YUZvclNhdmU7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB2ZXJpZmllcyBpZiBhbnkgb2YgdGhlIHBhc3NlZCBwYXJhbWV0ZXJzL2ZpbHRlcnMgYXJlIG1hcmtlZCBhcyBhIG1lYXN1cmUuIElmIHRoaXMgaXMgdGhlIGNhc2UsIHRoZXkgYXJlIHJlbW92ZWQgZnJvbSB0aGUgeGFwcFxuXHQgKiBhcHAgZGF0YS4gPGI+Tm90ZTo8L2I+IFRvIHVzZSB0aGlzIG1ldGhvZCwgdGhlIG1ldGFkYXRhIG11c3QgYmUgbG9hZGVkIGZpcnN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGEgV2l0aCBwb3RlbnRpYWwgc2Vuc2l0aXZlIGluZm9ybWF0aW9uIChmb3IgT0RhdGEsIGV4dGVybmFsIHJlcHJlc2VudGF0aW9uIHVzaW5nXG5cdCAqIDxjb2RlPm9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTk9iamVjdCgpPC9jb2RlPiBtdXN0IGJlIHVzZWQpLCB3aXRoIHRoZSA8Y29kZT5GaWx0ZXJDb250ZXh0VXJsPC9jb2RlPiBvclxuXHQgKiA8Y29kZT5QYXJhbWV0ZXJDb250ZXh0VXJsPC9jb2RlPiBwcm9wZXJ0eS5cblx0ICogQHJldHVybnMgRGF0YSB3aXRob3V0IHByb3BlcnRpZXMgbWFya2VkIGFzIG1lYXN1cmVzIG9yIGFuIGVtcHR5IG9iamVjdCBpZiB0aGUgT0RhdGEgbWV0YWRhdGEgaXMgbm90IGZ1bGx5IGxvYWRlZCB5ZXRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9yZW1vdmVNZWFzdXJlQmFzZWRQcm9wZXJ0aWVzKG9EYXRhOiBhbnkpIHtcblx0XHRsZXQgb0FkYXB0ZWREYXRhID0gb0RhdGE7XG5cdFx0Y29uc3QgYU1lYXN1cmVGaWx0ZXJOYW1lID0gW107XG5cdFx0Y29uc3QgYU1lYXN1cmVQYXJhbWV0ZXJOYW1lID0gW107XG5cdFx0bGV0IGksXG5cdFx0XHRvTW9kZWwsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b0VudGl0eVNldDogYW55LFxuXHRcdFx0b0VudGl0eURlZjogYW55LFxuXHRcdFx0b1N1YkVudGl0eURlZjogYW55LFxuXHRcdFx0b0VuZFJvbGU6IGFueSxcblx0XHRcdGFGaWx0ZXJDb250ZXh0UGFydCA9IFtdLFxuXHRcdFx0YVBhcmFtQ29udGV4dFBhcnQgPSBbXTtcblxuXHRcdGlmIChcblx0XHRcdG9EYXRhICYmXG5cdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50ICYmXG5cdFx0XHQoKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuRmlsdGVyQ29udGV4dFVybCAmJiBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMpIHx8XG5cdFx0XHRcdChvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlckNvbnRleHRVcmwgJiYgb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzKSlcblx0XHQpIHtcblx0XHRcdG9Nb2RlbCA9IHRoaXMuX2dldE1vZGVsKCk7XG5cdFx0XHRpZiAodGhpcy5vQ29tcG9uZW50ICYmIG9Nb2RlbCAmJiBvTW9kZWwuaXNBPFYyT0RhdGFNb2RlbD4oXCJzYXAudWkubW9kZWwub2RhdGEudjIuT0RhdGFNb2RlbFwiKSkge1xuXHRcdFx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRpZiAob01vZGVsLmdldFNlcnZpY2VNZXRhZGF0YSgpICYmIG9NZXRhTW9kZWwgJiYgb01ldGFNb2RlbC5vTW9kZWwpIHtcblx0XHRcdFx0XHRpZiAob0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsKSB7XG5cdFx0XHRcdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQgPSBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LkZpbHRlckNvbnRleHRVcmwuc3BsaXQoXCIjXCIpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGFGaWx0ZXJDb250ZXh0UGFydC5sZW5ndGggPT09IDIgJiZcblx0XHRcdFx0XHRcdG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucyAmJlxuXHRcdFx0XHRcdFx0dGhpcy5fY29uc3RydWN0Q29udGV4dFVybChvTW9kZWwpLmluZGV4T2YoYUZpbHRlckNvbnRleHRQYXJ0WzBdKSA9PT0gMFxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0b0VudGl0eVNldCA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlTZXQoYUZpbHRlckNvbnRleHRQYXJ0WzFdKTtcblx0XHRcdFx0XHRcdGlmIChvRW50aXR5U2V0KSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShvRW50aXR5U2V0LmVudGl0eVR5cGUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0b0VudGl0eURlZiA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlUeXBlKGFGaWx0ZXJDb250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmICYmIG9FbnRpdHlEZWYucHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgb0VudGl0eURlZi5wcm9wZXJ0eS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuX2lzTWVhc3VyZVByb3BlcnR5KG9FbnRpdHlEZWYucHJvcGVydHlbaV0pKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFNZWFzdXJlRmlsdGVyTmFtZS5wdXNoKG9FbnRpdHlEZWYucHJvcGVydHlbaV0ubmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKG9FbnRpdHlEZWYubmF2aWdhdGlvblByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG9FbnRpdHlEZWYubmF2aWdhdGlvblByb3BlcnR5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvRW5kUm9sZSA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFBc3NvY2lhdGlvbkVuZChvRW50aXR5RGVmLCBvRW50aXR5RGVmLm5hdmlnYXRpb25Qcm9wZXJ0eVtpXS5uYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICghb0VuZFJvbGUgfHwgb0VuZFJvbGUudHlwZSA9PT0gb0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY2hlY2sgaWYgdGhlIGVuZCByb2xlIGhhcyBjYXJkaW5hbGl0eSAwLi4xIG9yIDFcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvRW5kUm9sZS5tdWx0aXBsaWNpdHkgPT09IFwiMVwiIHx8IG9FbmRSb2xlLm11bHRpcGxpY2l0eSA9PT0gXCIwLi4xXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0b1N1YkVudGl0eURlZiA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlUeXBlKG9FbmRSb2xlLnR5cGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAob1N1YkVudGl0eURlZiAmJiBvU3ViRW50aXR5RGVmLnByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBvU3ViRW50aXR5RGVmLnByb3BlcnR5Lmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5faXNNZWFzdXJlUHJvcGVydHkob1N1YkVudGl0eURlZi5wcm9wZXJ0eVtqXSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YU1lYXN1cmVGaWx0ZXJOYW1lLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0VudGl0eURlZi5uYXZpZ2F0aW9uUHJvcGVydHlbaV0ubmFtZSArIFwiLlwiICsgb1N1YkVudGl0eURlZi5wcm9wZXJ0eVtqXS5uYW1lXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVyQ29udGV4dFVybCkge1xuXHRcdFx0XHRcdFx0YVBhcmFtQ29udGV4dFBhcnQgPSBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlBhcmFtZXRlckNvbnRleHRVcmwuc3BsaXQoXCIjXCIpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGFQYXJhbUNvbnRleHRQYXJ0Lmxlbmd0aCA9PT0gMiAmJlxuXHRcdFx0XHRcdFx0b0RhdGEuc2VsZWN0aW9uVmFyaWFudC5QYXJhbWV0ZXJzICYmXG5cdFx0XHRcdFx0XHR0aGlzLl9jb25zdHJ1Y3RDb250ZXh0VXJsKG9Nb2RlbCkuaW5kZXhPZihhUGFyYW1Db250ZXh0UGFydFswXSkgPT09IDBcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdG9FbnRpdHlTZXQgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5U2V0KGFQYXJhbUNvbnRleHRQYXJ0WzFdKTtcblx0XHRcdFx0XHRcdGlmIChvRW50aXR5U2V0KSB7XG5cdFx0XHRcdFx0XHRcdG9FbnRpdHlEZWYgPSBvTWV0YU1vZGVsLmdldE9EYXRhRW50aXR5VHlwZShvRW50aXR5U2V0LmVudGl0eVR5cGUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0b0VudGl0eURlZiA9IG9NZXRhTW9kZWwuZ2V0T0RhdGFFbnRpdHlUeXBlKGFGaWx0ZXJDb250ZXh0UGFydFsxXSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvRW50aXR5RGVmLnByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG9FbnRpdHlEZWYucHJvcGVydHkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLl9pc01lYXN1cmVQcm9wZXJ0eShvRW50aXR5RGVmLnByb3BlcnR5W2ldKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhTWVhc3VyZVBhcmFtZXRlck5hbWUucHVzaChvRW50aXR5RGVmLnByb3BlcnR5W2ldLm5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChhTWVhc3VyZUZpbHRlck5hbWUubGVuZ3RoIHx8IGFNZWFzdXJlUGFyYW1ldGVyTmFtZS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIFRROiBuZWVkcyBhdHRlbnRpb25cblx0XHRcdFx0XHRcdG9BZGFwdGVkRGF0YSA9IGV4dGVuZCh0cnVlIGFzIGFueSwge30sIG9BZGFwdGVkRGF0YSk7XG5cblx0XHRcdFx0XHRcdHRoaXMuX3JlbW92ZVByb3BlcnRpZXMoYU1lYXN1cmVGaWx0ZXJOYW1lLCBhTWVhc3VyZVBhcmFtZXRlck5hbWUsIG9BZGFwdGVkRGF0YSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGFubm90YXRpb25zIGFyZSBub3QgbG9hZGVkXG5cblx0XHRcdFx0XHR0aGlzLl9yZW1vdmVBbGxQcm9wZXJ0aWVzKG9BZGFwdGVkRGF0YSk7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiTmF2aWdhdGlvbkhhbmRsZXI6IG9NZXRhZGF0YSBhcmUgbm90IGZ1bGx5IGxvYWRlZCFcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodGhpcy5vQ29tcG9uZW50ICYmIG9Nb2RlbCAmJiBvTW9kZWwuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTW9kZWxcIikpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX3JlbW92ZVNlbnNpdGl2ZURhdGFGb3JPRGF0YVY0KG9BZGFwdGVkRGF0YSwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvQWRhcHRlZERhdGE7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBzZW5zaXRpdmUgZGF0YSBmcm9tIHRoZSBuYXZpZ2F0aW9uIGNvbnRleHQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRGF0YSBTZWxlY3Rpb24gdmFyaWFudFxuXHQgKiBAcGFyYW0gYk1lYXN1cmUgU2hvdWxkIG1lYXN1cmVzIGJlIHJlbW92ZWRcblx0ICogQHJldHVybnMgVGhlIHNlbGVjdGlvbiB2YXJpYW50IGFmdGVyIHNlbnNpdGl2ZSBkYXRhIGhhcyBiZWVuIHJlbW92ZWRcblx0ICovXG5cdF9yZW1vdmVTZW5zaXRpdmVEYXRhRm9yT0RhdGFWNChvRGF0YTogYW55LCBiTWVhc3VyZT86IGJvb2xlYW4pIHtcblx0XHRjb25zdCBvTmF2SGFuZGxlciA9IHRoaXMsXG5cdFx0XHRvU1YgPSBuZXcgU2VsZWN0aW9uVmFyaWFudChvRGF0YS5zZWxlY3Rpb25WYXJpYW50KSxcblx0XHRcdG9Nb2RlbCA9IHRoaXMuX2dldE1vZGVsKCk7XG5cdFx0bGV0IGFGaWx0ZXJDb250ZXh0UGFydDogc3RyaW5nW10gfCB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIW9Nb2RlbC5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoXCIvXCIpKSB7XG5cdFx0XHQvLyBhbm5vdGF0aW9ucyBhcmUgbm90IGxvYWRlZFxuXHRcdFx0dGhpcy5fcmVtb3ZlQWxsUHJvcGVydGllcyhvRGF0YSk7XG5cdFx0XHRMb2cuZXJyb3IoXCJOYXZpZ2F0aW9uSGFuZGxlcjogb01ldGFkYXRhIGFyZSBub3QgZnVsbHkgbG9hZGVkIVwiKTtcblx0XHRcdHJldHVybiBvRGF0YTtcblx0XHR9XG5cblx0XHRpZiAob0RhdGEuc2VsZWN0aW9uVmFyaWFudC5GaWx0ZXJDb250ZXh0VXJsKSB7XG5cdFx0XHRhRmlsdGVyQ29udGV4dFBhcnQgPSBvRGF0YS5zZWxlY3Rpb25WYXJpYW50LkZpbHRlckNvbnRleHRVcmwuc3BsaXQoXCIjXCIpO1xuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdGFGaWx0ZXJDb250ZXh0UGFydD8ubGVuZ3RoID09PSAyICYmXG5cdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMgJiZcblx0XHRcdHRoaXMuX2NvbnN0cnVjdENvbnRleHRVcmwob01vZGVsKS5pbmRleE9mKGFGaWx0ZXJDb250ZXh0UGFydFswXSkgPT09IDBcblx0XHQpIHtcblx0XHRcdG9TVi5yZW1vdmVTZWxlY3RPcHRpb24oXCJAb2RhdGEuY29udGV4dFwiKTtcblx0XHRcdG9TVi5yZW1vdmVTZWxlY3RPcHRpb24oXCJAb2RhdGEubWV0YWRhdGFFdGFnXCIpO1xuXHRcdFx0b1NWLnJlbW92ZVNlbGVjdE9wdGlvbihcIlNBUF9fTWVzc2FnZXNcIik7XG5cblx0XHRcdGNvbnN0IHNFbnRpdHlTZXQgPSBhRmlsdGVyQ29udGV4dFBhcnRbMV0sXG5cdFx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdGFQcm9wZXJ0eU5hbWVzID0gb1NWLmdldFByb3BlcnR5TmFtZXMoKSB8fCBbXSxcblx0XHRcdFx0Zm5Jc1NlbnNpdGl2ZURhdGEgPSBmdW5jdGlvbiAoc1Byb3A6IGFueSwgZXNOYW1lOiBhbnkpIHtcblx0XHRcdFx0XHRlc05hbWUgPSBlc05hbWUgfHwgc0VudGl0eVNldDtcblx0XHRcdFx0XHRjb25zdCBhUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFwiL1wiICsgZXNOYW1lICsgXCIvXCIgKyBzUHJvcCArIFwiQFwiKTtcblx0XHRcdFx0XHRpZiAoYVByb3BlcnR5QW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KGJNZWFzdXJlICYmIGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5NZWFzdXJlXCJdKSB8fFxuXHRcdFx0XHRcdFx0XHRvTmF2SGFuZGxlci5fY2hlY2tQcm9wZXJ0eUFubm90YXRpb25zRm9yU2Vuc2l0aXZlRGF0YShhUHJvcGVydHlBbm5vdGF0aW9ucylcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYVByb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFwiXSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvRmllbGRDb250cm9sID0gYVByb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFwiXTtcblx0XHRcdFx0XHRcdFx0aWYgKG9GaWVsZENvbnRyb2xbXCIkRW51bU1lbWJlclwiXSAmJiBvRmllbGRDb250cm9sW1wiJEVudW1NZW1iZXJcIl0uc3BsaXQoXCIvXCIpWzFdID09PSBcIkluYXBwbGljYWJsZVwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRmb3IgKGxldCBrID0gMDsgayA8IGFQcm9wZXJ0eU5hbWVzLmxlbmd0aDsgaysrKSB7XG5cdFx0XHRcdGNvbnN0IHNQcm9wZXJ0eSA9IGFQcm9wZXJ0eU5hbWVzW2tdO1xuXHRcdFx0XHQvLyBwcm9wZXJ0aWVzIG9mIHRoZSBlbnRpdHkgc2V0XG5cdFx0XHRcdGlmIChmbklzU2Vuc2l0aXZlRGF0YShzUHJvcGVydHksIHNFbnRpdHlTZXQpKSB7XG5cdFx0XHRcdFx0b1NWLnJlbW92ZVNlbGVjdE9wdGlvbihzUHJvcGVydHkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRvRGF0YS5zZWxlY3Rpb25WYXJpYW50ID0gb1NWLnRvSlNPTk9iamVjdCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb0RhdGE7XG5cdH1cblxuXHRfY2hlY2tQcm9wZXJ0eUFubm90YXRpb25zRm9yU2Vuc2l0aXZlRGF0YShhUHJvcGVydHlBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5U2Vuc2l0aXZlXCJdIHx8XG5cdFx0XHRhUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5FeGNsdWRlRnJvbU5hdmlnYXRpb25Db250ZXh0XCJdXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHBhcmFtZXRlciB2YWx1ZSBvZiB0aGUgc2FwLWlhcHAtc3RhdGUgKHRoZSBpbnRlcm5hbCBhcHBzKSBmcm9tIHRoZSBBcHBIYXNoIHN0cmluZy4gSXQgYXV0b21hdGljYWxseSB0YWtlcyBjYXJlIGFib3V0XG5cdCAqIGNvbXBhdGliaWxpdHkgYmV0d2VlbiB0aGUgb2xkIGFuZCB0aGUgbmV3IGFwcHJvYWNoIG9mIHRoZSBzYXAtaWFwcC1zdGF0ZS4gUHJlY2VkZW5jZSBpcyB0aGF0IHRoZSBuZXcgYXBwcm9hY2ggaXMgZmF2b3VyZWQgYWdhaW5zdCB0aGUgb2xkXG5cdCAqIGFwcHJvYWNoLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgdmFsdWUgb2Ygc2FwLWlhcHAtc3RhdGUgKGkuZS4gdGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciB0byByZXRyaWV2ZSB0aGUgcGFyYW1ldGVycyksIG9yIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gaW5cblx0ICogICAgICAgICBjYXNlIHRoYXQgbm8gc2FwLWlhcHAtc3RhdGUgd2FzIGZvdW5kIGluIDxjb2RlPnNBcHBIYXNoPC9jb2RlPi5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldElBcHBTdGF0ZUtleSgpIHtcblx0XHRjb25zdCBzQXBwSGFzaCA9IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpO1xuXHRcdHJldHVybiB0aGlzLl9nZXRJbm5lckFwcFN0YXRlS2V5KHNBcHBIYXNoKTtcblx0fVxufVxuXG4vLyBFeHBvcnRpbmcgdGhlIGNsYXNzIGFzIHByb3Blcmx5IHR5cGVkIFVJNUNsYXNzXG5cbmNvbnN0IE5hdmlnYXRpb25IYW5kbGVyVUk1Q2xhc3MgPSBCYXNlT2JqZWN0LmV4dGVuZChcblx0XCJzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlclwiLFxuXHROYXZpZ2F0aW9uSGFuZGxlci5wcm90b3R5cGUgYXMgYW55XG4pIGFzIHR5cGVvZiBOYXZpZ2F0aW9uSGFuZGxlcjtcbnR5cGUgTmF2aWdhdGlvbkhhbmRsZXJVSTVDbGFzcyA9IEluc3RhbmNlVHlwZTx0eXBlb2YgTmF2aWdhdGlvbkhhbmRsZXI+O1xuZXhwb3J0IGRlZmF1bHQgTmF2aWdhdGlvbkhhbmRsZXJVSTVDbGFzcztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztFQXNEQTtFQUNBLE1BQU1BLE9BQU8sR0FBR0MsVUFBVSxDQUFDRCxPQUFPO0VBQ2xDLE1BQU1FLGlCQUFpQixHQUFHRCxVQUFVLENBQUNDLGlCQUFpQjtFQUN0RCxNQUFNQyxtQkFBbUIsR0FBR0YsVUFBVSxDQUFDRSxtQkFBbUI7RUFDMUQsTUFBTUMsSUFBSSxHQUFHSCxVQUFVLENBQUNHLElBQUk7RUFFNUIsTUFBTUMsVUFBVSxHQUFHLGdCQUFnQjtFQUNuQyxNQUFNQyw0QkFBNEIsR0FBRyxvQ0FBb0M7RUFDekUsTUFBTUMscUJBQXFCLEdBQUcsc0JBQXNCOztFQUVwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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
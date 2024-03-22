"use strict";

sap.ui.define(["sap/base/Log", "sap/ushell/services/AppConfiguration", "./ThemeData", "../common/Constants", "../common/UI5Util", "../common/Util"], function (Log, AppConfiguration, __ThemeData, __Constants, __UI5Util, __Util) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var ThemeData = _interopRequireDefault(__ThemeData);
  var Constants = _interopRequireDefault(__Constants);
  var UI5Util = _interopRequireDefault(__UI5Util);
  var Util = _interopRequireDefault(__Util);
  /**
   * NOTE: Need to verify few un-identified UI5 Types which are currently missing in UI5 type definitions, marked them as TODO below.
   */
  var AppContextData = /*#__PURE__*/function () {
    function AppContextData() {
      _classCallCheck(this, AppContextData);
    }
    _createClass(AppContextData, null, [{
      key: "getData",
      value: function getData() {
        try {
          var _this = this;
          return Promise.resolve(_this.calculateAppContextData());
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "calculateAppContextData",
      value: function calculateAppContextData() {
        try {
          var _this2 = this;
          return Promise.resolve(UI5Util.getCurrentApp()).then(function (currentApp) {
            if (currentApp) {
              if (_this2.isAppTypeSupported(currentApp.applicationType.toLowerCase())) {
                return Promise.resolve(_this2.getAppInfo(currentApp)).then(function (appInfo) {
                  return _this2.getContextData(appInfo);
                });
              } else {
                Log.warning(Constants.WARNING.UNSUPPORTED_APP_TYPE, undefined, Constants.COMPONENT.APP_CONTEXT_DATA);
                return _this2._appContextData;
              }
            } else {
              Log.error(Constants.ERROR.CURRENT_APP_NOT_AVAILABLE, undefined, Constants.COMPONENT.APP_CONTEXT_DATA);
              throw new Error(Constants.ERROR.CURRENT_APP_NOT_AVAILABLE);
            }
          }); // Open: no specific Application type available. its currently generic 'Object'
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "isAppTypeSupported",
      value: function isAppTypeSupported(appType) {
        return Constants.SUPPORTED_APP_TYPES.indexOf(appType) > -1;
      }
    }, {
      key: "getAppInfo",
      value: function getAppInfo(currentApp) {
        try {
          return Promise.resolve(currentApp.getInfo(['appId', 'appVersion', 'appSupportInfo', 'technicalAppComponentId', 'appFrameworkId', 'appFrameworkVersion'])).then(function (_currentApp$getInfo) {
            var appInfo = _currentApp$getInfo;
            if (appInfo) {
              var metadata = AppConfiguration.getMetadata(); // Open: no getMetadata function as per definition
              if (metadata && metadata.title) {
                appInfo.appTitle = metadata.title;
              }
              if (appInfo.appId === Constants.LAUNCHPAD_VALUE) {
                appInfo.appTitle = Util.stringToTitleCase(appInfo.appId);
              }
            }
            return appInfo;
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "getContextData",
      value: function getContextData(appInfo) {
        try {
          var _this3 = this;
          var contextData = {};
          contextData.previousTheme = ThemeData.getPreviousTheme();
          contextData.theme = UI5Util.getTheme();
          contextData.languageTag = _this3.getLanguage();
          if (appInfo) {
            contextData.appFrameworkId = Util.convertAppFrameworkTypeToId(appInfo['appFrameworkId']);
            contextData.appFrameworkVersion = appInfo['appFrameworkVersion'] || Constants.DEFAULT_VALUE_NA;
            contextData.appId = appInfo['appId'] || Constants.DEFAULT_VALUE_NA;
            contextData.appTitle = appInfo['appTitle'] || Constants.DEFAULT_VALUE_NA;
            contextData.technicalAppComponentId = appInfo['technicalAppComponentId'] || Constants.DEFAULT_VALUE_NA;
            contextData.appVersion = appInfo['appVersion'] || Constants.DEFAULT_VALUE_NA;
            contextData.appSupportInfo = appInfo['appSupportInfo'] || Constants.DEFAULT_VALUE_NA;
          } else {
            contextData.appFrameworkId = Util.convertAppFrameworkTypeToId(undefined);
            contextData.appFrameworkVersion = Constants.DEFAULT_VALUE_NA;
            contextData.appId = Constants.DEFAULT_VALUE_NA;
            contextData.appTitle = Constants.DEFAULT_VALUE_NA;
            contextData.technicalAppComponentId = Constants.DEFAULT_VALUE_NA;
            contextData.appVersion = Constants.DEFAULT_VALUE_NA;
            contextData.appSupportInfo = Constants.DEFAULT_VALUE_NA;
          }
          return Promise.resolve(contextData);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "getLanguage",
      value: function getLanguage() {
        return Util.formatLanguageTag(UI5Util.getLanguage().toUpperCase());
      }
    }]);
    return AppContextData;
  }();
  _defineProperty(AppContextData, "_appContextData", {
    appFrameworkId: Constants.DEFAULT_VALUE_NA,
    appFrameworkVersion: Constants.DEFAULT_VALUE_NA,
    theme: Constants.DEFAULT_VALUE_NA,
    appId: Constants.DEFAULT_VALUE_NA,
    appTitle: Constants.DEFAULT_VALUE_NA,
    languageTag: Constants.DEFAULT_VALUE_NA,
    technicalAppComponentId: Constants.DEFAULT_VALUE_NA,
    appVersion: Constants.DEFAULT_VALUE_NA,
    appSupportInfo: Constants.DEFAULT_VALUE_NA
  });
  return AppContextData;
});
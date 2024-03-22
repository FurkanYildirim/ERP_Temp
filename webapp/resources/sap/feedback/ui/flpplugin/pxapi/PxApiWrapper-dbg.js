"use strict";

sap.ui.define(["./PxApiFactory", "../common/Constants", "../common/Util"], function (__PxApiFactory, __Constants, __Util) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var PxApiFactory = _interopRequireDefault(__PxApiFactory);
  var Constants = _interopRequireDefault(__Constants);
  var Util = _interopRequireDefault(__Util);
  var PxApiWrapper = /*#__PURE__*/function () {
    function PxApiWrapper(pluginInfo) {
      _classCallCheck(this, PxApiWrapper);
      this._pxApi = PxApiFactory.createPxApi();
      this.updatePxClient(pluginInfo);
    }
    _createClass(PxApiWrapper, [{
      key: "pxApi",
      get: function get() {
        return this._pxApi;
      }
    }, {
      key: "invitationDialog",
      get: function get() {
        return this._invitationDialog;
      },
      set: function set(value) {
        this._invitationDialog = value;
      }
    }, {
      key: "initialize",
      value: function initialize(tenantInfo, configIdentifier, configJson, surveyInvitationDialogCallback) {
        try {
          var _this = this;
          return Promise.resolve(_this._pxApi.initialize(tenantInfo, configIdentifier, configJson, surveyInvitationDialogCallback));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "openSurvey",
      value: function openSurvey(appContextData) {
        this._pxApi.openSurvey(appContextData);
      }
    }, {
      key: "requestPush",
      value: function requestPush(pushData) {
        this._pxApi.requestPush(pushData);
      }
    }, {
      key: "updateThemeId",
      value: function updateThemeId(themeId) {
        this._pxApi.currentThemeId = themeId;
      }
    }, {
      key: "updatePxClient",
      value: function updatePxClient(pluginInfo) {
        Util.ensureGlobalContext('qtx', 'info');
        if (pluginInfo && pluginInfo.version) {
          var version = pluginInfo.version.indexOf('project.version') === -1 ? pluginInfo.version : Constants.PXCLIENT_INFO_VERSION_FALLBACK;
          window.sap.qtx.info.pxclient += " ".concat(pluginInfo.id, "/").concat(version);
          return;
        }
        window.sap.qtx.info.pxlient += "".concat(Constants.PXCLIENT_INFO_NAME_FALLBACK, "/").concat(Constants.PXCLIENT_INFO_VERSION_FALLBACK);
      }
    }]);
    return PxApiWrapper;
  }();
  return PxApiWrapper;
});
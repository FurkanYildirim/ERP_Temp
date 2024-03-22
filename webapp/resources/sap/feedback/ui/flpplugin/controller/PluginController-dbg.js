"use strict";

sap.ui.define(["sap/base/Log", "../common/Constants", "../common/UI5Util", "../data/AppContextData", "../data/ThemeData", "../ui/ShellBarButton"], function (Log, __Constants, __UI5Util, __AppContextData, __ThemeData, __ShellBarButton) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var Constants = _interopRequireDefault(__Constants);
  var UI5Util = _interopRequireDefault(__UI5Util);
  var AppContextData = _interopRequireDefault(__AppContextData);
  var ThemeData = _interopRequireDefault(__ThemeData);
  var ShellBarButton = _interopRequireDefault(__ShellBarButton);
  var PluginController = /*#__PURE__*/function () {
    function PluginController(pxApiWrapper, resourceBundle) {
      _classCallCheck(this, PluginController);
      this._pxApiWrapper = pxApiWrapper;
      this._resourceBundle = resourceBundle;
    }

    // init
    _createClass(PluginController, [{
      key: "initPlugin",
      value: function initPlugin() {
        try {
          var _temp2 = function _temp2() {
            _this.prepareThemingSupport();
            _this.initAppTriggeredPush();
          };
          var _this = this;
          var _temp = function () {
            if (_this._pxApiWrapper.pxApi.isUserInitiatedFeedbackEnabled) {
              return Promise.resolve(_this.initUserInitiatedFeedback()).then(function () {});
            }
          }();
          return Promise.resolve(_temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp));
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "prepareThemingSupport",
      value: function prepareThemingSupport() {
        ThemeData.initLastTheme();
        this._pxApiWrapper.updateThemeId(UI5Util.getTheme());
        this.subscribeThemeChanged();
      }
    }, {
      key: "initUserInitiatedFeedback",
      value: function initUserInitiatedFeedback() {
        try {
          var _this2 = this;
          return Promise.resolve(ShellBarButton.initShellBarButton(_this2._resourceBundle, _this2.openSurveyCallback.bind(_this2))).then(function () {});
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "subscribeThemeChanged",
      value: function subscribeThemeChanged() {
        sap.ui.getCore().attachThemeChanged(this.themeChanged.bind(this));
      }
    }, {
      key: "themeChanged",
      value: function themeChanged(eventData) {
        this.onThemeChanged(eventData);
      }
    }, {
      key: "openSurveyCallback",
      value: function openSurveyCallback() {
        try {
          var _this3 = this;
          var _temp3 = _catch(function () {
            return Promise.resolve(AppContextData.getData()).then(function (appContextData) {
              _this3._pxApiWrapper.openSurvey(appContextData);
            });
          }, function (error) {
            var message;
            if (error instanceof Error) {
              message = error.message;
            }
            Log.error(Constants.ERROR.CANNOT_TRIGGER_USER_INITIATED_FEEDBACK, message, Constants.COMPONENT.PLUGIN_CONTROLLER);
          });
          return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      }
    }, {
      key: "onThemeChanged",
      value: function onThemeChanged(eventData) {
        var newThemeId = eventData.getParameters().theme;
        this._pxApiWrapper.updateThemeId(newThemeId);
        ThemeData.updateCurrentTheme(newThemeId);
      }
    }, {
      key: "initAppTriggeredPush",
      value: function initAppTriggeredPush() {
        UI5Util.getEventBus().subscribe(Constants.EVENT_BUS.CHANNEL_ID, Constants.EVENT_BUS.EVENT_ID, this.eventBusCallback, this);
      }
    }, {
      key: "eventBusCallback",
      value: function eventBusCallback(_, __, eventData) {
        this._pxApiWrapper.requestPush(eventData);
      }
    }, {
      key: "unsubscribeFromTheEventBusForTesting",
      value: function unsubscribeFromTheEventBusForTesting() {
        UI5Util.getEventBus().unsubscribe(Constants.EVENT_BUS.CHANNEL_ID, Constants.EVENT_BUS.EVENT_ID, this.eventBusCallback, this);
      }
    }]);
    return PluginController;
  }();
  return PluginController;
});
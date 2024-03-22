"use strict";

sap.ui.define(["sap/base/Log", "../common/Constants"], function (Log, __Constants) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var Constants = _interopRequireDefault(__Constants);
  var LocalStorageHandler = /*#__PURE__*/function () {
    function LocalStorageHandler() {
      _classCallCheck(this, LocalStorageHandler);
    }
    _createClass(LocalStorageHandler, null, [{
      key: "getUserState",
      value: function getUserState() {
        try {
          var userStateString = this.getLocalStorage().getItem(Constants.PUSH_STATE_STORAGE_KEY);
          if (userStateString) {
            return JSON.parse(userStateString);
          }
        } catch (error) {
          Log.error(Constants.ERROR.UNABLE_TO_PARSE_USER_STATE, error.message, Constants.COMPONENT.LOCAL_STORAGE_HANDLER);
        }
        return undefined;
      }
    }, {
      key: "updateUserState",
      value: function updateUserState(userState) {
        try {
          if (userState) {
            var userStateString = JSON.stringify(userState);
            this.getLocalStorage().setItem(Constants.PUSH_STATE_STORAGE_KEY, userStateString);
            Log.debug(Constants.DEBUG.PUSH_STATE_MIGRATED);
          }
        } catch (error) {
          Log.error(Constants.ERROR.UNABLE_TO_UPDATE_USER_STATE, error.message, Constants.COMPONENT.LOCAL_STORAGE_HANDLER);
          return false;
        }
        return true;
      }
    }, {
      key: "updateLastTheme",
      value: function updateLastTheme(themeId) {
        var userState = this.getUserState();
        if (userState && themeId) {
          userState.lastTheme = themeId;
          this.updateUserState(userState);
        }
      }
    }, {
      key: "updateCurrentTheme",
      value: function updateCurrentTheme(themeId) {
        var userState = this.getUserState();
        if (userState && themeId) {
          userState.currentTheme = themeId;
          this.updateUserState(userState);
        }
      }
    }, {
      key: "getLocalStorage",
      value: function getLocalStorage() {
        return localStorage;
      }
    }]);
    return LocalStorageHandler;
  }();
  return LocalStorageHandler;
});
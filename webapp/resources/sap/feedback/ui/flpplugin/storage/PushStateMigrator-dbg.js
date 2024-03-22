"use strict";

sap.ui.define(["sap/base/Log", "./LocalStorageHandler", "../common/Constants"], function (Log, __LocalStorageHandler, __Constants) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var LocalStorageHandler = _interopRequireDefault(__LocalStorageHandler);
  var Constants = _interopRequireDefault(__Constants);
  var PushStateMigrator = /*#__PURE__*/function () {
    function PushStateMigrator() {
      _classCallCheck(this, PushStateMigrator);
    }
    _createClass(PushStateMigrator, null, [{
      key: "migrate",
      value:
      // returns 'false' only in case of failure while migrating the push state (worst case) else 'true'
      function migrate() {
        var userState = LocalStorageHandler.getUserState();
        if (userState) {
          if (this.isOldPushStateAvailable(userState)) {
            var newUserState = this.getNewUserState(userState);
            return LocalStorageHandler.updateUserState(newUserState);
          } else {
            Log.debug(Constants.DEBUG.NO_OLD_PUSH_STATE, undefined, Constants.COMPONENT.PUSH_STATE_MIGRATOR);
          }
        }
        return true;
      }
    }, {
      key: "isOldPushStateAvailable",
      value: function isOldPushStateAvailable(userState) {
        if (userState.dynamicPushDate || userState.inAppPushDate || userState.featurePushStates) {
          return true;
        }
        return false;
      }
    }, {
      key: "getNewUserState",
      value: function getNewUserState(userState) {
        var _this = this;
        var keyValues = Object.keys(userState).map(function (key) {
          var newKey = _this.pushStateKeyMap[key] || key;
          return _defineProperty({}, newKey, userState[key]);
        });
        return Object.assign.apply(Object, [{}].concat(_toConsumableArray(keyValues)));
      }
    }, {
      key: "pushStateKeyMap",
      get: function get() {
        return {
          dynamicPushDate: 'timedPushDate',
          inAppPushDate: 'appPushDate',
          featurePushStates: 'appPushStates'
        };
      }
    }]);
    return PushStateMigrator;
  }();
  return PushStateMigrator;
});
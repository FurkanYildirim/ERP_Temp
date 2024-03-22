"use strict";

sap.ui.define(["./Constants", "./Enumerations"], function (__Constants, ___Enumerations) {
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
  var APP_FRAMEWORK = ___Enumerations["APP_FRAMEWORK"];
  var Util = /*#__PURE__*/function () {
    function Util() {
      _classCallCheck(this, Util);
    }
    _createClass(Util, null, [{
      key: "formatLanguageTag",
      value: function formatLanguageTag(input) {
        var trimmedInput = input.trim();
        var validInputLengthFormat = trimmedInput.length === 2 || trimmedInput.length > 2 && trimmedInput.includes('-');
        if (validInputLengthFormat) {
          return trimmedInput.slice(0, 2).toUpperCase();
        } else {
          return Constants.DEFAULT_LANGUAGE;
        }
      }
    }, {
      key: "stringToTitleCase",
      value: function stringToTitleCase(input) {
        if (input) {
          return input.replace(/\w\S*/g, function (intermediate) {
            return intermediate.charAt(0).toUpperCase() + intermediate.substring(1).toLowerCase();
          });
        }
        return input;
      }
    }, {
      key: "convertAppFrameworkTypeToId",
      value: function convertAppFrameworkTypeToId(frameworkType) {
        if (frameworkType) {
          return APP_FRAMEWORK[frameworkType.toLowerCase()] || APP_FRAMEWORK.unknown;
        }
        return APP_FRAMEWORK.unknown;
      }
    }, {
      key: "getWindowSearchLocation",
      value: function getWindowSearchLocation() {
        return window.location.search;
      }
    }, {
      key: "isUrlParamSet",
      value: function isUrlParamSet(urlParamKey) {
        var queryString = this.getWindowSearchLocation();
        if (queryString) {
          var urlParams = new URLSearchParams(queryString);
          if (urlParams && urlParams.has(urlParamKey)) {
            return true;
          }
        }
        return false;
      }
    }, {
      key: "getUrlParamValue",
      value: function getUrlParamValue(urlParamKey) {
        var queryString = this.getWindowSearchLocation();
        if (queryString) {
          var urlParams = new URLSearchParams(queryString);
          if (urlParams && urlParams.has(urlParamKey)) {
            var urlParamState = urlParams.get(urlParamKey);
            if (urlParamState) {
              return urlParamState.trim().toLocaleLowerCase();
            }
          }
        }
        return null;
      }
    }, {
      key: "isUnitIdUrlParamSet",
      value: function isUnitIdUrlParamSet() {
        return this.isUrlParamSet(Constants.URL_PARAMS.UNITID);
      }
    }, {
      key: "getUnitIdUrlParamValue",
      value: function getUnitIdUrlParamValue() {
        return this.getUrlParamValue(Constants.URL_PARAMS.UNITID);
      }
    }, {
      key: "isEnvironmentUrlParamSet",
      value: function isEnvironmentUrlParamSet() {
        return this.isUrlParamSet(Constants.URL_PARAMS.ENVIRONMENT);
      }
    }, {
      key: "getEnvironmentUrlParamValue",
      value: function getEnvironmentUrlParamValue() {
        return this.getUrlParamValue(Constants.URL_PARAMS.ENVIRONMENT);
      }
    }, {
      key: "ensureGlobalContext",
      value: function ensureGlobalContext(firstLevel, secondLevel) {
        if (!window.sap) {
          window.sap = {};
        }
        if (firstLevel) {
          if (!window.sap[firstLevel]) {
            window.sap[firstLevel] = {};
          }
          var createdFirstLevel = window.sap[firstLevel];
          if (secondLevel) {
            if (!createdFirstLevel[secondLevel]) {
              createdFirstLevel[secondLevel] = {};
            }
            return createdFirstLevel[secondLevel];
          }
          return createdFirstLevel;
        }
        return window.sap;
      }
    }]);
    return Util;
  }();
  return Util;
});
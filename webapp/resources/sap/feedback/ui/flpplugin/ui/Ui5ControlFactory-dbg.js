"use strict";

sap.ui.define(["sap/m/Button", "sap/m/Dialog", "sap/m/FormattedText"], function (Button, Dialog, FormattedText) {
  function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
  function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
  function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var Ui5ControlFactory = /*#__PURE__*/function () {
    function Ui5ControlFactory() {
      _classCallCheck(this, Ui5ControlFactory);
    }
    _createClass(Ui5ControlFactory, null, [{
      key: "createButton",
      value: function createButton(settings) {
        return new Button(settings);
      }
    }, {
      key: "createDialog",
      value: function createDialog(settings, id) {
        return new Dialog(id, settings);
      }
    }, {
      key: "createFormattedText",
      value: function createFormattedText(settings) {
        return new FormattedText(settings);
      }
    }]);
    return Ui5ControlFactory;
  }();
  return Ui5ControlFactory;
});
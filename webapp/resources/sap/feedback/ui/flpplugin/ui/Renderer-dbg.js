"use strict";

sap.ui.define(["sap/base/util/ObjectPath", "../common/Constants"], function (ObjectPath, __Constants) {
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
  var Renderer = /*#__PURE__*/function () {
    function Renderer() {
      _classCallCheck(this, Renderer);
    }
    _createClass(Renderer, null, [{
      key: "getRenderer",
      value: function getRenderer() {
        return new Promise(function (resolve, reject) {
          var shellContainer = ObjectPath.get('sap.ushell.Container');
          if (!shellContainer) {
            reject(Constants.ERROR.SHELL_CONTAINER_NOT_AVAILABLE);
          } else {
            var renderer = shellContainer.getRenderer();
            if (renderer) {
              resolve(renderer);
            } else {
              shellContainer.attachRendererCreatedEvent(function (event) {
                var renderer = event.getParameter('renderer');
                if (renderer) {
                  resolve(renderer);
                } else {
                  reject(Constants.ERROR.SHELL_RENDERER_NOT_AVAILABLE);
                }
              });
            }
          }
        });
      }
    }]);
    return Renderer;
  }();
  return Renderer;
});
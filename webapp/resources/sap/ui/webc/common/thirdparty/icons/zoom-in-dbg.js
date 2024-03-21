sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/zoom-in", "./v4/zoom-in"], function (_exports, _Theme, _zoomIn, _zoomIn2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _zoomIn.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _zoomIn.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _zoomIn.pathData : _zoomIn2.pathData;
  _exports.pathData = pathData;
  var _default = "zoom-in";
  _exports.default = _default;
});
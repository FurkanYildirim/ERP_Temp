sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/primary-key", "./v4/primary-key"], function (_exports, _Theme, _primaryKey, _primaryKey2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _primaryKey.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _primaryKey.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _primaryKey.pathData : _primaryKey2.pathData;
  _exports.pathData = pathData;
  var _default = "primary-key";
  _exports.default = _default;
});
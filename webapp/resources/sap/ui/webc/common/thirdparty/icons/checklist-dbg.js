sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/checklist", "./v4/checklist"], function (_exports, _Theme, _checklist, _checklist2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _checklist.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _checklist.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _checklist.pathData : _checklist2.pathData;
  _exports.pathData = pathData;
  var _default = "checklist";
  _exports.default = _default;
});
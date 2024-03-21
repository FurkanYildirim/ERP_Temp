sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/config/Theme", "./v5/attachment-e-pub", "./v4/attachment-e-pub"], function (_exports, _Theme, _attachmentEPub, _attachmentEPub2) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "accData", {
    enumerable: true,
    get: function () {
      return _attachmentEPub.accData;
    }
  });
  _exports.default = void 0;
  Object.defineProperty(_exports, "ltr", {
    enumerable: true,
    get: function () {
      return _attachmentEPub.ltr;
    }
  });
  _exports.pathData = void 0;
  const pathData = (0, _Theme.isThemeFamily)("sap_horizon") ? _attachmentEPub.pathData : _attachmentEPub2.pathData;
  _exports.pathData = pathData;
  var _default = "attachment-e-pub";
  _exports.default = _default;
});
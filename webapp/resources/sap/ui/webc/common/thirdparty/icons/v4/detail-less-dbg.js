sap.ui.define(["exports", "sap/ui/webc/common/thirdparty/base/asset-registries/Icons"], function (_exports, _Icons) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pathData = _exports.ltr = _exports.default = _exports.accData = void 0;
  const name = "detail-less";
  const pathData = "M64 96q-12 0-22-9T32 64t10-23 22-9h383q12 0 22.5 9T480 64t-10.5 23-22.5 9H64zm400 64q6 0 11 4.5t5 11.5-5 11.5-11 4.5H304q-16 0-16-16t16-16h160z";
  _exports.pathData = pathData;
  const ltr = false;
  _exports.ltr = ltr;
  const accData = null;
  _exports.accData = accData;
  const collection = "SAP-icons";
  const packageName = "@ui5/webcomponents-icons";
  (0, _Icons.registerIcon)(name, {
    pathData,
    ltr,
    collection,
    packageName
  });
  var _default = "detail-less";
  _exports.default = _default;
});
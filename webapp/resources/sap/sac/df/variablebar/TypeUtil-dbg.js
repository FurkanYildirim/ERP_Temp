/*global sap*/
sap.ui.define("sap/sac/df/variablebar/TypeUtil", [
  "sap/ui/mdc/util/TypeUtil"
], function (BaseTypeUtil) {
  "use strict";

  var DragonFlyTypeUtil = Object.assign({}, BaseTypeUtil, {
    getDataTypeClassName: function (sType) {
      var mTypes = {
        String: "sap.ui.model.type.String",
        Double: "sap.ui.model.type.Float",
        Date: "sap.ui.model.type.Date",
        Boolean: "sap.ui.model.type.Boolean",
        Time: "sap.ui.model.type.Time",
        DateTime: "sap.ui.model.type.DateTime"
      };
      return mTypes[sType] || sType;
    },

    oFormatOptions: {
      "Date": {
        source: {
          format: "yyyy-MM-dd",
          pattern: "yyyy-MM-dd"
        }
      },
      "Time": {
        source: {
          format: "HH:mm:ss",
          pattern: "HH:mm:ss"
        },
      },
      "DateTime": {
        source: {
          format: "yyyy-MM-ddTHH:mm:ss",
          pattern: "yyyy-MM-ddTHH:mm:ss"
        }
      }
    },

    getFormatOptions: function (sType) {
      return this.oFormatOptions[sType];
    }
  });

  return DragonFlyTypeUtil;
});

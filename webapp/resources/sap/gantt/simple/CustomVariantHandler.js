sap.ui.define(["sap/ui/core/Element"],function(t){"use strict";var e=t.extend("sap.gantt.simple.CustomVariantHandler",{metadata:{properties:{data:{type:"object",multiple:false},dependantControlID:{type:"string[]",multiple:false,defaultValue:[]}},events:{setDataComplete:{}}},setData:function(t){this.setProperty("data",t);this.fireSetDataComplete()},apply:function(){},revert:function(){}});return e});
//# sourceMappingURL=CustomVariantHandler.js.map
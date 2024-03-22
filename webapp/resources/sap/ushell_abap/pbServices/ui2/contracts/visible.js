// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.require(["sap/ushell_abap/pbServices/ui2/Chip","sap/ushell_abap/pbServices/ui2/Error","sap/base/Log"],function(i,e,t){"use strict";i.addContract("visible",function(i){var r=true,n;function s(){try{n(r)}catch(e){t.error(i+": call to visible handler failed: "+(e.message||e.toString()),null,"chip.visible")}}this.attachVisible=function(i){if(typeof i!=="function"){throw new e("Not a function: "+i,"chip.visible")}if(n===i){return}n=i;s()};this.isVisible=function(){return r};return{setVisible:function(i){if(r===i){return}r=i;if(n){s()}}}})});
//# sourceMappingURL=visible.js.map
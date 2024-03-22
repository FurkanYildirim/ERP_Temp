// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell_abap/pbServices/ui2/Chip","sap/ushell_abap/pbServices/ui2/Utils","sap/ushell_abap/pbServices/ui2/Error"],function(t,e,a){"use strict";t.addContract("bag",function(t){var i;this.getBag=function(e){return t.getBag(e)};this.getBagIds=function(){return t.getBagIds()};this.getOriginalLanguage=function(){return t.getPage()&&t.getPage().getOriginalLanguage()};this.attachBagsUpdated=function(t){if(typeof t!=="function"){throw new a("The given handler is not a function","chip.bag")}i=t};return{fireBagsUpdated:function(t){if(!e.isArray(t)||t.length<1){throw new a("At least one bag ID must be given","contract.bag")}if(i){i(t)}}}})});
//# sourceMappingURL=bag.js.map
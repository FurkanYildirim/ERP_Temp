/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
*/
sap.ui.define(["sap/m/FacetFilter","sap/ui/Device","sap/ui/core/mvc/JSView"],function(e,t){"use strict";sap.ui.jsview("sap.apf.ui.reuse.view.facetFilter",{getControllerName:function(){return"sap.apf.ui.reuse.controller.facetFilter"},createContent:function(i){var r=new e(i.createId("idAPFFacetFilter"),{type:"Simple",showReset:true,showPopoverOKButton:true,reset:i.onResetPress.bind(i)}).addStyleClass("facetFilterInitialAlign");if(t.system.desktop){r.addStyleClass("facetfilter")}return r}})});
//# sourceMappingURL=facetFilter.view.js.map
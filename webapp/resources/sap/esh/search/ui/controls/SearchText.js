/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/m/Text","sap/esh/search/ui/SearchHelper"],function(e,r){var t=e.extend("sap.esh.search.ui.controls.SearchText",{renderer:{apiVersion:2},metadata:{properties:{isForwardEllipsis4Whyfound:{type:"boolean",defaultValue:false}},aggregations:{icon:{type:"sap.ui.core.Icon",multiple:false}}},constructor:function r(t,n){e.prototype.constructor.call(this,t,n)},onAfterRendering:function t(){e.prototype.onAfterRendering.call(this);var n=this.getDomRef();r.boldTagUnescaper(n);var a=this.getAggregation("icon");if(a){var o=sap.ui.getCore().createRenderManager();var i=document.createElement("span");n.prepend(" ");n.prepend(i);o.render(a,i);o.destroy()}}});return t})})();
//# sourceMappingURL=SearchText.js.map
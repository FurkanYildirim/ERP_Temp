/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/SearchHelper","sap/m/Link"],function(e,r){var n=r.extend("sap.esh.search.ui.controls.SearchLink",{renderer:{apiVersion:2},metadata:{aggregations:{icon:{type:"sap.ui.core.Icon",multiple:false}}},constructor:function e(n,t){r.prototype.constructor.call(this,n,t)},onAfterRendering:function n(t){r.prototype.onAfterRendering.call(this,t);var a=this.getDomRef();e.boldTagUnescaper(a);var o=this.getAggregation("icon");if(o){var i=sap.ui.getCore().createRenderManager();var c=document.createElement("span");a.prepend(" ");a.prepend(c);i.render(o,c);i.destroy()}}});return n})})();
//# sourceMappingURL=SearchLink.js.map
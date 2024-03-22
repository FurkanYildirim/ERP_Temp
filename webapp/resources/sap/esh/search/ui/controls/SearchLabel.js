/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["sap/esh/search/ui/SearchHelper","sap/m/Label"],function(e,r){var n=r.extend("sap.esh.search.ui.controls.SearchLabel",{renderer:{apiVersion:2},onAfterRendering:function n(a){r.prototype.onAfterRendering.call(this,a);var i=this.getDomRef();e.boldTagUnescaper(i);e.forwardEllipsis4Whyfound(i)}});return n})})();
//# sourceMappingURL=SearchLabel.js.map
/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["../core/clone","./AttributeMetadata","./DataSource","./NavigationTarget","./SearchResultSet","./SearchResultSetItem","./SearchResultSetItemAttribute"],function(t,e,a,r,i,l,s){var u=t["CloneService"];var c=e["AttributeMetadata"];var o=a["DataSource"];var n=r["NavigationTarget"];var v=i["SearchResultSet"];var g=l["SearchResultSetItem"];var p=s["SearchResultSetItemAttribute"];var S=new u({classes:[{class:v,properties:["items"]},{class:g,properties:["attributes","attributesMap","dataSource","defaultNavigationTarget","detailAttributes","navigationTargets","titleAttributes","titleDescriptionAttributes"]},{class:p,properties:["id","value","valueFormatted","valueHighlighted","defaultNavigationTarget","isHighlighted","metadata","navigationTargets"]},{class:o,properties:["id","label","labelPlural"]},{class:c,properties:["id","label","type","isKey"]},{class:n,properties:["label","target","targetUrl"]}]});function d(t){return S.clone(t)}var b={__esModule:true};b.clonePublic=d;return b})})();
//# sourceMappingURL=cloneUtil.js.map
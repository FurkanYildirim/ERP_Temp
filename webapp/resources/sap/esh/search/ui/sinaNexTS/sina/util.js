/*! 
 * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	 
 */
(function(){sap.ui.define(["./ComparisonOperator","./ComplexCondition","./Filter","./LogicalOperator","./SearchResultSetItemAttribute","./SearchResultSetItemAttributeGroup","./SimpleCondition","./HierarchyDisplayType"],function(e,t,r,a,i,n,o,u){
/*!
   * SAPUI5

		(c) Copyright 2009-2021 SAP SE. All rights reserved
	
   */
var s=e["ComparisonOperator"];var c=t["ComplexCondition"];var l=r["Filter"];var h=a["LogicalOperator"];var p=i["SearchResultSetItemAttribute"];var f=n["SearchResultSetItemAttributeGroup"];var v=o["SimpleCondition"];var d=u["HierarchyDisplayType"];function b(e,t){if(t===s.Eq){return e}var r=[];var a=e.split(" ");for(var i=0;i<a.length;i++){var n=a[i].trim();if(n.length===0){continue}switch(t){case s.Co:n="*"+n+"*";break;case s.Bw:n=n+"*";break;case s.Ew:n="*"+n;break;default:break}r.push(n)}return r.join(" ")}function y(e,t,r,a){var i=[];if(t!==null&&t!==void 0&&t.length&&e){var n=e.getBusinessObjectDataSources();n.forEach(function(e){if(e.hierarchyHelperDatasource===a){i.push(e)}else if(e.hierarchyName===t){return}else{e.attributesMetadata.forEach(function(a){if(a.hierarchyName===r&&a.id===t&&a.hierarchyDisplayType===d.HierarchyResultView||a.hierarchyDisplayType===d.StaticHierarchyFacet){i.push(e)}})}})}return i}function m(e){var t=[];e.titleAttributes.forEach(function(e){if(e instanceof f&&Array.isArray(e.attributes)){e.attributes.forEach(function(e){if(e.attribute&&e.attribute.value.startsWith("sap-icon://")!==true){t.push(e.attribute.valueFormatted)}})}else if(e instanceof p){if(e.value.startsWith("sap-icon://")!==true){t.push(e.valueFormatted)}}});return t.join("; ")}function S(e,t,r,a,i){var n=new v({attribute:t,operator:s.DescendantOf,value:r,valueLabel:a});var o=new c({operator:h.And,conditions:[n]});var u=new c({operator:h.And,conditions:[o]});i.forEach(function(t){var r=new l({dataSource:t,searchTerm:"",rootCondition:u,sina:e.sina});e.navigationTargets.push(e.sina.createSearchNavigationTarget(r,t.labelPlural))})}var g={__esModule:true};g.convertOperator2Wildcards=b;g.getNavigationHierarchyDataSources=y;g.assembleTitle=m;g.assembleHierarchyDecendantsNavigations=S;return g})})();
//# sourceMappingURL=util.js.map
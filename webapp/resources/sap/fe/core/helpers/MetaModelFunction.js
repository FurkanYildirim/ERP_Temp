/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/IssueManager","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/ModelHelper","sap/fe/core/type/EDM"],function(e,t,r,i){"use strict";var o={};var n=i.isTypeFilterable;var s=t.pathInModel;var a=t.or;var l=t.not;var c=t.compileExpression;var u=e.IssueSeverity;var p=e.IssueCategoryType;var g=e.IssueCategory;function d(e,t){let i;let o;const n="$NavigationPropertyBinding";const s="@Org.OData.Capabilities.V1.SearchRestrictions";const a=e.replaceAll("%2F","/").split("/").filter(r.filterOutNavPropBinding);const l=r.getEntitySetPath(e,t);const c=l.split("/").filter(r.filterOutNavPropBinding);const u=t.getObject(`/${a.join("/")}/$ContainsTarget`)?true:false;const p=u?a[a.length-1]:"";if(!u){i=t.getObject(`${l}${s}`)}if(a.length>1){const e=u?p:c[c.length-1];const r=u?l:`/${c.slice(0,-1).join(`/${n}/`)}`;const i=U.getNavigationRestrictions(t,r,e.replaceAll("%2F","/"));o=i===null||i===void 0?void 0:i.SearchRestrictions}return o??i}o.getSearchRestrictions=d;function f(e,t,r){const i=e.getObject(`${t}@Org.OData.Capabilities.V1.NavigationRestrictions`);const o=i===null||i===void 0?void 0:i.RestrictedProperties;return o===null||o===void 0?void 0:o.find(function(e){var t;return((t=e.NavigationProperty)===null||t===void 0?void 0:t.$NavigationPropertyPath)===r})}o.getNavigationRestrictions=f;function v(e,t,r){let i=false;const o=e.getObject(`${t}@Org.OData.Capabilities.V1.FilterRestrictions`);if(o!==null&&o!==void 0&&o.NonFilterableProperties){i=o.NonFilterableProperties.some(function(e){return e.$NavigationPropertyPath===r||e.$PropertyPath===r})}return i}function P(e,t,r){let i=false;const o=e.getObject(t+"@Org.OData.Aggregation.V1.ApplySupported")?true:false;if(o){const o=e.getObject(`${t}@`);const n=U.getAllCustomAggregates(o);const s=n?Object.keys(n):undefined;if(s!==null&&s!==void 0&&s.includes(r)){i=true}}return i}o.isCustomAggregate=P;function b(e,t,r,i){let o=e.split("/").length===2&&!r.includes("/")?!v(t,e,r)&&!P(t,e,r):!h(t,e,r);if(o&&i){const e=$(i);if(e){o=e?n(e):false}else{o=false}}return o}function h(e,t,r){const i=`${t}/${r}`,o=i.split("/").splice(0,2),n=i.split("/").splice(2);let s=false,a="";t=o.join("/");s=n.some(function(r,i,o){if(a.length>0){a+=`/${r}`}else{a=r}if(i===o.length-2){const i=U.getNavigationRestrictions(e,t,r);const n=i===null||i===void 0?void 0:i.FilterRestrictions;const s=n===null||n===void 0?void 0:n.NonFilterableProperties;const a=o[o.length-1];if(s!==null&&s!==void 0&&s.find(function(e){return e.$PropertyPath===a})){return true}}if(i===o.length-1){s=v(e,t,a)}else if(e.getObject(`${t}/$NavigationPropertyBinding/${r}`)){s=v(e,t,a);a="";t=`/${e.getObject(`${t}/$NavigationPropertyBinding/${r}`)}`}return s});return s}function $(e){let t=e.getProperty("$Type");if(!e.getProperty("$kind")){switch(t){case"com.sap.vocabularies.UI.v1.DataFieldForAction":case"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":t=undefined;break;case"com.sap.vocabularies.UI.v1.DataField":case"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":case"com.sap.vocabularies.UI.v1.DataFieldWithUrl":case"com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":case"com.sap.vocabularies.UI.v1.DataFieldWithAction":t=e.getProperty("Value/$Path/$Type");break;case"com.sap.vocabularies.UI.v1.DataFieldForAnnotation":default:const r=e.getProperty("Target/$AnnotationPath");if(r){if(r.includes("com.sap.vocabularies.Communication.v1.Contact")){t=e.getProperty("Target/$AnnotationPath/fn/$Path/$Type")}else if(r.includes("com.sap.vocabularies.UI.v1.DataPoint")){t=e.getProperty("Value/$Path/$Type")}else{t=undefined}}else{t=undefined}break}}return t}function y(e,t,r,i){if(typeof r!=="string"){throw new Error("sProperty parameter must be a string")}if(e.getObject(`${t}/@com.sap.vocabularies.Common.v1.ResultContext`)===true){return true}const o=e.createBindingContext(`${t}/${r}`);if(o&&!i){if(o.getProperty("@com.sap.vocabularies.UI.v1.Hidden")===true||o.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter")===true){return false}const e=o.getProperty("@com.sap.vocabularies.UI.v1.Hidden/$Path");const t=o.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter/$Path");if(e&&t){return c(l(a(s(e),s(t))))}else if(e){return c(l(s(e)))}else if(t){return c(l(s(t)))}}return b(t,e,r,o)}o.isPropertyFilterable=y;function R(e,t,r){const i=e.getObject(`${t}/`).$Key;const o=[];const n=[];const s=e.getObject(`${t}/`);for(const a in s){if(s[a].$kind&&s[a].$kind==="Property"){const l=e.getObject(`${t}/${a}@`)||{},c=i.includes(a),d=l["@Org.OData.Core.V1.Immutable"],f=!l["@Org.OData.Core.V1.Computed"],v=!l["@com.sap.vocabularies.UI.v1.Hidden"],P=l["@Org.OData.Core.V1.ComputedDefaultValue"],b=c&&s[a].$Type==="Edm.Guid"?P&&l["@com.sap.vocabularies.Common.v1.Text"]:false;if((b||c&&s[a].$Type!=="Edm.Guid")&&f&&v){o.push(a)}else if(d&&f&&v){n.push(a)}if(!f&&P&&r){const e=r.getDiagnostics();const t="Core.ComputedDefaultValue is ignored as Core.Computed is already set to true";e.addIssue(g.Annotation,u.Medium,t,p,p.Annotations.IgnoredAnnotation)}}}const a=U.getRequiredPropertiesFromInsertRestrictions(t,e);if(a.length){a.forEach(function(r){const i=e.getObject(`${t}/${r}@`),s=!(i!==null&&i!==void 0&&i["@com.sap.vocabularies.UI.v1.Hidden"]);if(s&&!o.includes(r)&&!n.includes(r)){o.push(r)}})}return o.concat(n)}o.getNonComputedVisibleFields=R;function m(e,t){let i=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;const o=[];let n=[];const s="$NavigationPropertyBinding";let a=null;if(e.endsWith("$")){e=e.replace("/$","")}const l=e.replaceAll("%2F","/").split("/").filter(r.filterOutNavPropBinding);const c=r.getEntitySetPath(e,t);const u=c.split("/").filter(r.filterOutNavPropBinding);const p=t.getObject(`/${l.join("/")}/$ContainsTarget`)?true:false;const g=p?l[l.length-1]:"";if(!p){a=t.getObject(`${c}@`)}if(l.length>1){const e=p?g:u[u.length-1];const r=p?c:`/${u.slice(0,-1).join(`/${s}/`)}`;const o=U.getNavigationRestrictions(t,r,e.replaceAll("%2F","/"));if(o!==undefined&&U.hasRestrictedPropertiesInAnnotations(o,true,i)){var d,f;n=i?((d=o.UpdateRestrictions)===null||d===void 0?void 0:d.RequiredProperties)??[]:((f=o.InsertRestrictions)===null||f===void 0?void 0:f.RequiredProperties)??[]}if(!n.length&&U.hasRestrictedPropertiesInAnnotations(a,false,i)){n=U.getRequiredPropertiesFromAnnotations(a,i)}}else if(U.hasRestrictedPropertiesInAnnotations(a,false,i)){n=U.getRequiredPropertiesFromAnnotations(a,i)}n.forEach(function(e){const t=e.$PropertyPath;o.push(t)});return o}function O(e,t){return U.getRequiredProperties(e,t)}o.getRequiredPropertiesFromInsertRestrictions=O;function I(e,t){return U.getRequiredProperties(e,t,true)}o.getRequiredPropertiesFromUpdateRestrictions=I;function F(e){var t;let r=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;if(r){var i;return(e===null||e===void 0?void 0:(i=e["@Org.OData.Capabilities.V1.UpdateRestrictions"])===null||i===void 0?void 0:i.RequiredProperties)??[]}return(e===null||e===void 0?void 0:(t=e["@Org.OData.Capabilities.V1.InsertRestrictions"])===null||t===void 0?void 0:t.RequiredProperties)??[]}function C(e){var t;let r=arguments.length>1&&arguments[1]!==undefined?arguments[1]:false;let i=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;if(r){var o;const t=e;if(i){var n;return t!==null&&t!==void 0&&(n=t.UpdateRestrictions)!==null&&n!==void 0&&n.RequiredProperties?true:false}return t!==null&&t!==void 0&&(o=t.InsertRestrictions)!==null&&o!==void 0&&o.RequiredProperties?true:false}else if(i){var s;const t=e;return t!==null&&t!==void 0&&(s=t["@Org.OData.Capabilities.V1.UpdateRestrictions"])!==null&&s!==void 0&&s.RequiredProperties?true:false}const a=e;return a!==null&&a!==void 0&&(t=a["@Org.OData.Capabilities.V1.InsertRestrictions"])!==null&&t!==void 0&&t.RequiredProperties?true:false}function A(e){const t={};let r;for(const i in e){if(i.startsWith("@Org.OData.Aggregation.V1.CustomAggregate")){r=i.replace("@Org.OData.Aggregation.V1.CustomAggregate#","");const o=r.split("@");if(o.length==2){const r={};if(o[1]=="Org.OData.Aggregation.V1.ContextDefiningProperties"){r.contextDefiningProperties=e[i]}if(o[1]=="com.sap.vocabularies.Common.v1.Label"){r.label=e[i]}t[o[0]]=r}else if(o.length==1){t[o[0]]={name:o[0],propertyPath:o[0],label:`Custom Aggregate (${r})`,sortable:true,sortOrder:"both",custom:true}}}}return t}o.getAllCustomAggregates=A;function D(e){const t={sortable:true,propertyInfo:{}};const r=e["@Org.OData.Capabilities.V1.SortRestrictions"];if(!r){return t}if(r.Sortable===false){t.sortable=false}for(const e of r.NonSortableProperties||[]){const r=e.$PropertyPath;t.propertyInfo[r]={sortable:false}}for(const e of r.AscendingOnlyProperties||[]){const r=e.$PropertyPath;t.propertyInfo[r]={sortable:true,sortDirection:"asc"}}for(const e of r.DescendingOnlyProperties||[]){const r=e.$PropertyPath;t.propertyInfo[r]={sortable:true,sortDirection:"desc"}}return t}o.getSortRestrictionsInfo=D;function N(e){let t,r;const i={filterable:true,requiresFilter:(e===null||e===void 0?void 0:e.RequiresFilter)||false,propertyInfo:{},requiredProperties:[]};if(!e){return i}if(e.Filterable===false){i.filterable=false}if(e.RequiredProperties){for(t=0;t<e.RequiredProperties.length;t++){r=e.RequiredProperties[t].$PropertyPath;i.requiredProperties.push(r)}}if(e.NonFilterableProperties){for(t=0;t<e.NonFilterableProperties.length;t++){r=e.NonFilterableProperties[t].$PropertyPath;i.propertyInfo[r]={filterable:false}}}if(e.FilterExpressionRestrictions){for(t=0;t<e.FilterExpressionRestrictions.length;t++){var o;r=(o=e.FilterExpressionRestrictions[t].Property)===null||o===void 0?void 0:o.$PropertyPath;if(r){i.propertyInfo[r]={filterable:true,allowedExpressions:e.FilterExpressionRestrictions[t].AllowedExpressions}}}}return i}o.getFilterRestrictionsInfo=N;function q(e){let t=true;switch(e){case"SearchExpression":case"SingleRange":case"SingleValue":t=false;break;default:break}return t}o.isMultiValueFilterExpression=q;const U={getRequiredProperties:m,getRequiredPropertiesFromAnnotations:F,hasRestrictedPropertiesInAnnotations:C,getRequiredPropertiesFromInsertRestrictions:O,getNavigationRestrictions:f,getAllCustomAggregates:A};o.METAMODEL_FUNCTIONS=U;return o},false);
//# sourceMappingURL=MetaModelFunction.js.map
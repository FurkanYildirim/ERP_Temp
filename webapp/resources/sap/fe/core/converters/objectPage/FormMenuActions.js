/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/Key"],function(i){"use strict";var o={};var e=i.KeyHelper;var a;(function(i){i["Default"]="Default"})(a||(a={}));const n=i=>{let o,e;i.forEach(i=>{var a;o=false;e=[];if(i!==null&&i!==void 0&&(a=i.menu)!==null&&a!==void 0&&a.length){var n;i===null||i===void 0?void 0:(n=i.menu)===null||n===void 0?void 0:n.forEach(i=>{const a=i.visible;if(!o){if(a&&typeof a==="boolean"||a.valueOf()==="true"){o=true}else if(a&&a.valueOf()!=="false"){e.push(a.valueOf())}}});if(e.length){i.visible=e}else{i.visible=o.toString()}}});return i};o.getVisibilityEnablementFormMenuActions=n;const l=(i,o)=>{for(const e in i){if(i.hasOwnProperty(e)){o[e]=i[e]}}return i};o.mergeFormActions=l;const t=(i,o)=>{var n,l;const t=v(i,o)||[],d=o===null||o===void 0?void 0:(n=o.getEntityType())===null||n===void 0?void 0:(l=n.annotations)===null||l===void 0?void 0:l.UI;const r=[];for(const i in d){var u,s,c;if(((u=d[i])===null||u===void 0?void 0:u.$Type)==="com.sap.vocabularies.UI.v1.FieldGroupType"){var f;(f=d[i])===null||f===void 0?void 0:f.Data.forEach(i=>{if(i.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"&&t.hasOwnProperty(`DataFieldForAction::${i.Action}`)){var o,n,l;if((i===null||i===void 0?void 0:(o=i.annotations)===null||o===void 0?void 0:(n=o.UI)===null||n===void 0?void 0:(l=n.Hidden)===null||l===void 0?void 0:l.valueOf())===true){r.push({type:a.Default,key:e.generateKeyFromDataField(i)})}}else if(i.$Type==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"&&t.hasOwnProperty(`DataFieldForIntentBasedNavigation::${i.Action}`)){var v,d,u;if((i===null||i===void 0?void 0:(v=i.annotations)===null||v===void 0?void 0:(d=v.UI)===null||d===void 0?void 0:(u=d.Hidden)===null||u===void 0?void 0:u.valueOf())===true){r.push({type:a.Default,key:e.generateKeyFromDataField(i)})}}})}else if(((s=d[i])===null||s===void 0?void 0:s.term)==="com.sap.vocabularies.UI.v1.Identification"||((c=d[i])===null||c===void 0?void 0:c.term)==="@com.sap.vocabularies.UI.v1.StatusInfo"){var p;(p=d[i])===null||p===void 0?void 0:p.forEach(i=>{if(i.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"&&t.hasOwnProperty(`DataFieldForAction::${i.Action}`)){var o,n,l;if((i===null||i===void 0?void 0:(o=i.annotations)===null||o===void 0?void 0:(n=o.UI)===null||n===void 0?void 0:(l=n.Hidden)===null||l===void 0?void 0:l.valueOf())===true){r.push({type:a.Default,key:e.generateKeyFromDataField(i)})}}else if(i.$Type==="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"&&t.hasOwnProperty(`DataFieldForIntentBasedNavigation::${i.Action}`)){var v,d,u;if((i===null||i===void 0?void 0:(v=i.annotations)===null||v===void 0?void 0:(d=v.UI)===null||d===void 0?void 0:(u=d.Hidden)===null||u===void 0?void 0:u.valueOf())===true){r.push({type:a.Default,key:e.generateKeyFromDataField(i)})}}})}}return r};o.getFormHiddenActions=t;const v=(i,o)=>{const e=o.getManifestWrapper();let a,n;let t={};if((i===null||i===void 0?void 0:i.$Type)==="com.sap.vocabularies.UI.v1.CollectionFacet"){if(i!==null&&i!==void 0&&i.Facets){i===null||i===void 0?void 0:i.Facets.forEach(i=>{var o,v;a=i===null||i===void 0?void 0:(o=i.Target)===null||o===void 0?void 0:o.value;n=e.getFormContainer(a);if((v=n)!==null&&v!==void 0&&v.actions){var d;for(const o in n.actions){n.actions[o].facetName=i.fullyQualifiedName}t=l((d=n)===null||d===void 0?void 0:d.actions,t)}})}}else if((i===null||i===void 0?void 0:i.$Type)==="com.sap.vocabularies.UI.v1.ReferenceFacet"){var v,d;a=i===null||i===void 0?void 0:(v=i.Target)===null||v===void 0?void 0:v.value;n=e.getFormContainer(a);if((d=n)!==null&&d!==void 0&&d.actions){for(const o in n.actions){n.actions[o].facetName=i.fullyQualifiedName}t=n.actions}}return t};o.getFormActions=v;return o},false);
//# sourceMappingURL=FormMenuActions.js.map
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/helpers/SizeHelper","sap/fe/core/templating/DisplayModeFormatter","sap/m/table/Util"],function(e,t,i,l){"use strict";var a=i.getDisplayMode;const o={getMDCColumnWidthFromDataField:function(e,t,i){let l=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;const a=t.find(t=>{var l,a;return t.metadataPath&&((l=i.resolvePath(t.metadataPath))===null||l===void 0?void 0:(a=l.target)===null||a===void 0?void 0:a.fullyQualifiedName)===e.fullyQualifiedName});return a?this.getMDCColumnWidthFromProperty(a,t,l):0},getMDCColumnWidthFromProperty:function(t,i){var a,o,n;let r=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;const d=Object.assign({gap:0,truncateLabel:!r,excludeProperties:[]},(a=t.visualSettings)===null||a===void 0?void 0:a.widthCalculation);let u;if((o=t.propertyInfos)!==null&&o!==void 0&&o.length){u=t.propertyInfos.map(e=>{var t;const l=i.find(t=>t.name===e);return l===null||l===void 0?void 0:(t=l.typeConfig)===null||t===void 0?void 0:t.typeInstance}).filter(e=>e)}else if(t!==null&&t!==void 0&&(n=t.typeConfig)!==null&&n!==void 0&&n.typeInstance){u=[t===null||t===void 0?void 0:t.typeConfig.typeInstance]}const s=u?l.calcColumnWidth(u,t.label,d):null;if(!s){e.error(`Cannot compute the column width for property: ${t.name}`)}return s?parseFloat(s.replace("Rem","")):0},getWidthForDataFieldForAnnotation:function(e,i,l){var a;let o=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;const n=e===null||e===void 0?void 0:(a=e.Target)===null||a===void 0?void 0:a.$target;let r=0,d=0;if(n!==null&&n!==void 0&&n.Visualization){switch(n.Visualization){case"UI.VisualizationType/Rating":const e=n.TargetValue;r=parseInt(e,10)*1.375;break;case"UI.VisualizationType/Progress":default:r=5}const i=n?n.label:e.Label||"";d=o&&i?t.getButtonWidth(i):0}else if(l&&i&&(n===null||n===void 0?void 0:n.$Type)==="com.sap.vocabularies.Communication.v1.ContactType"){r=this.getMDCColumnWidthFromDataField(n.fn.$target,i,l,false)}return{labelWidth:d,propertyWidth:r}},getWidthForDataField:function(i,l,o,n){var r,d,u,s;const c=(r=i.Value)===null||r===void 0?void 0:r.$target,p=c===null||c===void 0?void 0:(d=c.annotations)===null||d===void 0?void 0:(u=d.Common)===null||u===void 0?void 0:u.Text,v=a((s=i.Value)===null||s===void 0?void 0:s.$target);let f=0,g=0;if(c){switch(v){case"Description":f=this.getMDCColumnWidthFromDataField(p.$target,o,n,false)-1;break;case"DescriptionValue":case"ValueDescription":case"Value":default:f=this.getMDCColumnWidthFromDataField(c,o,n,false)-1}const e=i.Label?i.Label:c.label;g=l&&e?t.getButtonWidth(e):0}else{e.error(`Cannot compute width for type object: ${i.$Type}`)}return{labelWidth:g,propertyWidth:f}}};return o},false);
//# sourceMappingURL=TableSizeHelper.js.map
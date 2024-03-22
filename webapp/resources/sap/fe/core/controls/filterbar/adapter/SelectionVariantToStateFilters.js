/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils","sap/fe/core/helpers/BindingToolkit","sap/fe/core/templating/DisplayModeFormatter","sap/fe/core/templating/FilterHelper"],function(t,e,n,o){"use strict";var r=o.getConditions;var i=n.ODATA_TYPE_MAPPING;var a=e.EDM_TYPE_MAPPING;const s=["$search","$editState"];const l={getFilterBarInfoForConversion:t=>({metaModel:l._getMetaModel(t),contextPath:l._getContextPath(t),useSemanticDateRange:l._checkSemanticDateRangeIsUsed(t),filterFieldsConfig:l._getFilterFieldsConfig(t)}),getFilterBarSupportedFields:async t=>{await t.waitForInitialization();return t.getControlDelegate().fetchProperties(t)},getConditionsFromSV:function(t,e,n){const{contextPath:o}=e;const r={};n.forEach(function(n){if(!s.includes(n.name)){let i=[];const{conditionPath:a,annotationPath:s}=n;const c=a.replaceAll("*","");const p=c.substring(0,c.lastIndexOf("/"));const u=c.substring(c.lastIndexOf("/")+1);const g={propertyName:u,navPath:p,propertyContextPath:`${o}${p}`,propertyMetadata:n,selectionVariant:t,filterBarInfo:e};if(n.isParameter&&s){g.propertyContextPath=s.substring(0,s.lastIndexOf("/")+1);i=l._getConditionsForParameter(g)}else if(a.includes("/")){i=l._getConditionsForNavProperty(g)}else{i=l._getConditionsForProperty(g)}if(i.length>0){r[a]=i}}});return r},_getMetaModel:function(t){var e;return(e=t.getModel())===null||e===void 0?void 0:e.getMetaModel()},_getContextPath:function(t){return t.data("entityType")},_getViewData:function(t){const e=t.getModel("viewData");return e.getData()},_checkSemanticDateRangeIsUsed:function(t){return t.data("useSemanticDateRange")==="true"||t.data("useSemanticDateRange")===true},_getPropertyFilterConfigurationSetting:function(t){var e;let n=arguments.length>1&&arguments[1]!==undefined?arguments[1]:{};return n[t]?(e=n[t])===null||e===void 0?void 0:e.settings:undefined},_getFilterFieldsConfig:t=>{const e=l._getViewData(t);const n=e.controlConfiguration;const o=n&&n["@com.sap.vocabularies.UI.v1.SelectionFields"].filterFields;return o||{}},_getConditionsForParameter:function(t){let e=[];const{propertyMetadata:n,selectionVariant:o}=t;const r=n.name;const i=l._getSelectOptionName(o,r,true);if(i){e=l._getPropertyConditions(t,i,true)}return e},_getConditionsForProperty:function(t){const{propertyMetadata:e,selectionVariant:n}=t;const o=e.name;const r=l._getSelectOptionName(n,o);let i=[];if(r){i=l._getPropertyConditions(t,r,false)}return i},_getConditionsForNavProperty:function(t){const{filterBarInfo:e,selectionVariant:n,propertyName:o,navPath:r}=t;const{contextPath:i}=e;let a=[];let s=`${i.substring(1)}${r}`.replaceAll("/",".");let c=l._getSelectOptionName(n,o,false,s);if(!c){s=r.replaceAll("/",".");c=l._getSelectOptionName(n,o,false,s)}if(c){a=l._getPropertyConditions(t,c,false)}return a},_getSelectOptionName:function(t,e,n,o){const r=[];const i=t.getSelectOptionsPropertyNames();if(n){r.push(`$Parameter.${e}`);r.push(e);if(e.startsWith("P_")){r.push(`$Parameter.${e.slice(2,e.length)}`);r.push(e.slice(2,e.length))}else{r.push(`$Parameter.P_${e}`);r.push(`P_${e}`)}}else{r.push(e);r.push(`$Parameter.${e}`);if(e.startsWith("P_")){const t=e.slice(2,e.length);r.push(`$Parameter.${t}`);r.push(t)}else{const t=`P_${e}`;r.push(`$Parameter.${t}`);r.push(t)}}let a="";r.some(t=>{const e=o?`${o}.${t}`:t;return i.includes(e)?a=e:false});return a},_getPropertyConditions:function(e,n,o){const{filterBarInfo:r,propertyMetadata:i,selectionVariant:a,propertyContextPath:s,propertyName:c}=e;const p=a.getSelectOption(n);const{metaModel:u}=r;let g=[];if(p!==null&&p!==void 0&&p.length){const n=l._getSemanticDateOperators(e,o);const r=s.substring(0,s.length-1);const a=o?["EQ"]:t.getOperatorsForProperty(c,r,u);g=this._getConditionsFromSelectOptions(p,i,a,n,o)}return g},_getSemanticDateOperators:function(e,n){const{filterBarInfo:o,propertyMetadata:r,propertyName:a,propertyContextPath:s}=e;const c=r.name;let p=[];let u;const{useSemanticDateRange:g,filterFieldsConfig:d,metaModel:f}=o;if(g){if(n){p=["EQ"]}else{const e=s.substring(0,s.length-1);u=l._getPropertyFilterConfigurationSetting(c,d);p=t.getOperatorsForProperty(a,e,f,i[r.dataType],g,u)}}return p},_getConditionsFromSelectOptions:function(t,e,n,o,r){let i=[];if(t.length){i=r?l._addConditionFromSelectOption(e,n,o,i,t[0]):t.reduce(l._addConditionFromSelectOption.bind(null,e,n,o),i)}return i},_addConditionFromSelectOption:function(t,e,n,o,i){const a={type:""};a.type=l._getEdmType(t.typeConfig.className);const s=r(i,a);if(i.SemanticDates&&n.length&&n.includes(i.SemanticDates.operator)){const t=l._addSemanticDatesToConditions(i.SemanticDates);if(Object.keys(t).length>0){o.push(t)}}else if(s){if(e.length===0||e.includes(s.operator)){o.push(s)}}return o},_addSemanticDatesToConditions:t=>{const e=[];if(t.high){e.push(t.high)}if(t.low){e.push(t.low)}return{values:e,operator:t.operator,isEmpty:undefined}},_getEdmType:t=>{const e=Object.fromEntries(Object.entries(a).map(t=>{let[e,n]=t;return[n.type,e]}));return e[t]}};return l},false);
//# sourceMappingURL=SelectionVariantToStateFilters.js.map
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/base/util/isEmptyObject","sap/fe/core/helpers/SemanticDateOperators","sap/fe/core/type/TypeUtil","sap/fe/navigation/SelectionVariant","sap/ui/mdc/condition/FilterOperatorUtil","sap/ui/mdc/condition/RangeOperator"],function(e,t,n,o,i,a,r){"use strict";const s={getSelectionVariantFromConditions:function(e,n,o){const a=new i;if(!t(e)){for(const t in e){const i=e[t];if(i!==null&&i!==void 0&&i.length){const e=s.getSelectionOptionsFromCondition(i,t,n);if(e.length){if(o!==null&&o!==void 0&&o.includes(t)){a.massAddSelectOption(`$Parameter.${t}`,e)}a.massAddSelectOption(t,e)}}}}return a},getSelectionOptionsFromCondition:function(e,t,n){const o=[];for(const i of e){const e=s.getSelectionOption(i,t,n);if(e){o.push(e)}}return o},getSelectionOption:function(e,t,o){var i;let c;let p;const l=e;const u=l.operator&&l.operator!==""?a.getOperator(l.operator):undefined;if(u instanceof r){c=s.createSemanticDatesFromConditions(l);p=s.getOptionForPropertyWithRangeOperator(u,l,t,o)}else{const e=n.getSupportedOperations();if(e.includes(l.operator)){c=s.createSemanticDatesFromConditions(l)}p=s.getSelectionFormatForNonRangeOperator(l,t,u)}if((i=p)!==null&&i!==void 0&&i.Option){p.SemanticDates=c?c:undefined}return p},getSelectionFormatForNonRangeOperator:function(e,t,n){const o=e.values[0]?e.values[0].toString():"";const i=e.values[1]?e.values[1].toString():null;const a=s.getSelectOption(e.operator,o,i,t);if(a){a.Sign=n!==null&&n!==void 0&&n.exclude?"E":"I"}return a},getTypeInfoForFilterProperty:function(e,t){const n=t.getProperty(e);let o;if(n){o=n.typeConfig}return o},getOptionForPropertyWithRangeOperator:function(e,t,n,i){const a={Sign:"I",Option:"",Low:"",High:""};const r=s.getTypeInfoForFilterProperty(n,i);const c=e.getModelFilter(t,n,r?r.typeInstance:undefined,false,r?r.baseType:undefined);const p=c.getFilters();if(p===undefined){a.Sign=e.exclude?"E":"I";a.Low=o.externalizeValue(c.getValue1(),r?r.typeInstance:"string");a.High=o.externalizeValue(c.getValue2(),r?r.typeInstance:"string");a.Option=c.getOperator()??""}return a.Option!=""?a:undefined},getSelectOption:function(t,n,o,i){const a={Option:"",Sign:"I",Low:n,High:o};switch(t){case"Contains":a.Option="CP";break;case"StartsWith":a.Option="CP";a.Low+="*";break;case"EndsWith":a.Option="CP";a.Low=`*${a.Low}`;break;case"BT":case"LE":case"LT":case"GT":case"NE":case"EQ":a.Option=t;break;case"DATE":a.Option="EQ";break;case"DATERANGE":a.Option="BT";break;case"FROM":a.Option="GE";break;case"TO":a.Option="LE";break;case"EEQ":a.Option="EQ";break;case"Empty":a.Option="EQ";a.Low="";break;case"NotContains":a.Option="CP";a.Sign="E";break;case"NOTBT":a.Option="BT";a.Sign="E";break;case"NotStartsWith":a.Option="CP";a.Low+="*";a.Sign="E";break;case"NotEndsWith":a.Option="CP";a.Low=`*${a.Low}`;a.Sign="E";break;case"NotEmpty":a.Option="NE";a.Low="";break;case"NOTLE":a.Option="LE";a.Sign="E";break;case"NOTGE":a.Option="GE";a.Sign="E";break;case"NOTLT":a.Option="LT";a.Sign="E";break;case"NOTGT":a.Option="GT";a.Sign="E";break;default:e.warning(`${t} is not supported. ${i} could not be added to the Selection variant`)}return a.Option!==""?a:undefined},createSemanticDatesFromConditions:function(e){if(!t(e)){return{high:e.values[0]?e.values[0]:null,low:e.values[1]?e.values[1]:null,operator:e.operator}}}};return s},false);
//# sourceMappingURL=StateFilterToSelectionVariant.js.map
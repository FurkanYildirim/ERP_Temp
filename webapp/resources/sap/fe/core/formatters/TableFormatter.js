/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/TableFormatterTypes","sap/fe/macros/DelegateUtil","sap/fe/macros/table/TableSizeHelper","sap/ui/mdc/enum/EditMode","../CommonUtils"],function(t,e,n,r,i){"use strict";var a=t.MessageType;const o=function(t){switch(t){case"Error":return 4;case"Warning":return 3;case"Information":return 2;case"None":return 1;default:return-1}};const s=function(t){if(!t){return false}const e=Object.keys(t);return e.length>0&&e.every(function(e){return t[e]["validity"]})};s.__functionName="sap.fe.core.formatters.TableFormatter#validateCreationRowFields";const l=function(t,e,n,r){let i=false;if(e&&e.length>0&&(r||n===t)){const t=this.getBindingContext()?this.getBindingContext().getPath():undefined;e.forEach(e=>{if(e.type==="Error"&&e.aTargets[0].indexOf(t)===0){i=true;return i}})}return i};l.__functionName="sap.fe.core.formatters.TableFormatter#getErrorStatusTextVisibilityFormatter";const f=function(t,e,n,r,i){var s;let l=-1;if(e&&e.length>0){var f;const n=(f=this.getBindingContext())===null||f===void 0?void 0:f.getPath();e.forEach(e=>{if(e.aTargets[0].indexOf(n)===0&&l<o(e.type)){l=o(e.type);t=e.type}})}if(typeof t!=="string"){switch(t){case 1:t=a.Error;break;case 2:t=a.Warning;break;case 3:t=a.Success;break;case 5:t=a.Information;break;default:t=a.None}}if(t!==a.None){return t}const u=((s=this.getBindingContext())===null||s===void 0?void 0:s.isInactive())??false;const c=!n&&!r&&!u;return i==="true"&&c?a.Information:a.None};f.__functionName="sap.fe.core.formatters.TableFormatter#rowHighlighting";const u=function(t){var e;const n=(e=this.getBindingContext())===null||e===void 0?void 0:e.getPath();if(n&&t){return t.indexOf(n)===0}else{return false}};u.__functionName="sap.fe.core.formatters.TableFormatter#navigatedRow";const c=function(t,i,a){let o=arguments.length>3&&arguments[3]!==undefined?arguments[3]:true;if(!i){return null}const s=this.getParent();const l=e.getCachedProperties(s);const f=l===null||l===void 0?void 0:l.find(t=>t.name===a);if(f){let e=l?n.getMDCColumnWidthFromProperty(f,l,true):null;if(e&&t===r.Editable){var u;switch((u=f.typeConfig)===null||u===void 0?void 0:u.baseType){case"Date":case"Time":case"DateTime":e+=2.8;break;default:}}if(o){return e+"rem"}return e}return null};c.__functionName="sap.fe.core.formatters.TableFormatter#getColumnWidth";const g=function(t,e,n){const a=i.isSmallDevice();const o=!a;return a&&n||!a&&!n?y.getColumnWidth.call(this,r.Display,t,e,o):null};g.__functionName="sap.fe.core.formatters.TableFormatter#getColumnWidthForValueHelpTable";function d(t){if(t.isA("sap.fe.macros.controls.FieldWrapper")){const e=Array.isArray(t.getContentDisplay())?t.getContentDisplay()[0]:t.getContentDisplay();if(e&&e.isA("sap.m.RatingIndicator")){return true}}return false}function m(t,e){const n=Array.isArray(t.getContentDisplay())?t.getContentDisplay()[0]:t.getContentDisplay();const r=Array.isArray(t.getContentEdit())?t.getContentEdit()[0]:t.getContentEdit();if(e){n.addStyleClass("sapUiNoMarginBottom");n.addStyleClass("sapUiNoMarginTop");r.removeStyleClass("sapUiTinyMarginBottom")}else{n.addStyleClass("sapUiNoMarginBottom");n.removeStyleClass("sapUiNoMarginTop");r.addStyleClass("sapUiTinyMarginBottom")}}function p(){const t=this.getItems();let e=false;for(var n=arguments.length,r=new Array(n),i=0;i<n;i++){r[i]=arguments[i]}for(let n=t.length-1;n>=0;n--){if(!e){if(r[n]!==true){e=true;if(d(t[n])){m(t[n],true)}else{t[n].removeStyleClass("sapUiTinyMarginBottom")}}}else if(d(t[n])){m(t[n],false)}else{t[n].addStyleClass("sapUiTinyMarginBottom")}}return true}p.__functionName="sap.fe.core.formatters.TableFormatter#getVBoxVisibility";const y=function(t){if(y.hasOwnProperty(t)){for(var e=arguments.length,n=new Array(e>1?e-1:0),r=1;r<e;r++){n[r-1]=arguments[r]}return y[t].apply(this,n)}else{return""}};y.validateCreationRowFields=s;y.rowHighlighting=f;y.navigatedRow=u;y.getErrorStatusTextVisibilityFormatter=l;y.getVBoxVisibility=p;y.isRatingIndicator=d;y.getColumnWidth=c;y.getColumnWidthForValueHelpTable=g;return y},true);
//# sourceMappingURL=TableFormatter.js.map
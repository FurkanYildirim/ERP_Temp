/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/base/util/deepEqual","sap/fe/core/CommonUtils","sap/fe/core/converters/controls/ListReport/FilterBar","sap/fe/core/converters/MetaModelConverter","sap/fe/core/helpers/MetaModelFunction","sap/fe/core/helpers/ModelHelper","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/DisplayModeFormatter","sap/fe/core/templating/PropertyHelper","sap/fe/core/type/EDM","sap/fe/core/type/TypeUtil","sap/fe/macros/DelegateUtil","sap/fe/macros/internal/valuehelp/TableDelegateHelper","sap/ui/core/Core","sap/ui/mdc/odata/v4/TableDelegate","sap/ui/mdc/odata/v4/util/DelegateUtil","sap/ui/mdc/util/FilterUtil","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/Sorter"],function(e,t,n,o,r,i,a,s,l,c,p,f,d,g,u,y,h,v,m,b,P){"use strict";var C=g.isSortableProperty;var M=g.isFilterableProperty;var I=g.getPath;var T=p.isTypeFilterable;var D=c.getLabel;var O=c.getAssociatedUnitPropertyPath;var $=c.getAssociatedTimezonePropertyPath;var x=c.getAssociatedTextPropertyPath;var F=c.getAssociatedCurrencyPropertyPath;var B=l.getDisplayMode;var j=s.getTargetObjectPath;var E=s.enhanceDataModelPath;var U=i.isMultiValueFilterExpression;var w=i.getSortRestrictionsInfo;var S=i.getFilterRestrictionsInfo;var A=r.getInvolvedDataModelObjects;var _=o.fetchTypeConfig;const R=Object.assign({},y);R.fetchProperties=async function(e){const t=await this._getModel(e);const n=await this._createPropertyInfos(e,t);R.createInternalBindingContext(e);d.setCachedProperties(e,n);e.getBindingContext("internal").setProperty("tablePropertiesAvailable",true);return n};R.createInternalBindingContext=function(e){let t=e;while(t&&!t.isA("sap.ui.mdc.valuehelp.Dialog")){t=t.getParent()}const n=e.getModel("internal");if(t&&n){const o=t.getBindingContext("internal");let r;if(o){r=o.getPath()+`::VHDialog::${t.getId()}::table`}else{r=`/buildingblocks/${e.getId()}`;n.setProperty("/buildingblocks",{...n.getProperty("/buildingblocks")})}const i=n.bindContext(r).getBoundContext();e.setBindingContext(i,"internal")}};function k(e){const t=V(e);const n={};if(t!==null&&t!==void 0&&t.targetObject){var o,r,i,a,s;const l=t.targetObject;const c=j(t,true);const p=e.targetObject;const f=j(e,true);const d=(o=p.annotations)===null||o===void 0?void 0:(r=o.Common)===null||r===void 0?void 0:r.Text,g=d===null||d===void 0?void 0:(i=d.annotations)===null||i===void 0?void 0:(a=i.UI)===null||a===void 0?void 0:(s=a.TextArrangement)===null||s===void 0?void 0:s.toString(),u=d&&g&&B(p);if(u==="Description"){n[c]=l}else if(u&&u!=="Value"||!d){n[f]=p;n[c]=l}}return n}R._createPropertyInfos=function(e,t){const n=e.getDelegate().payload;const o=[];const r=`/${n.collectionName}`;const i=t.getMetaModel();return i.requestObject(`${r}@`).then(function(t){const n=w(t);const i=t["@Org.OData.Capabilities.V1.FilterRestrictions"];const a=S(i);const s=d.getCustomData(e,"columns");const l={};const c=A(e.getModel().getMetaModel().getContext(r));s.customData.forEach(function(t){const r={name:t.path,label:t.label,sortable:C(n,t),filterable:M(a,t),maxConditions:N(a,t),typeConfig:T(t.$Type)?e.getTypeUtil().getTypeConfig(t.$Type):undefined};const i=E(c,t.path);const s=i.targetObject;if(s){const n=j(i,true);let o;if(T(s.type)){const n=_(s);o=f.getTypeConfig(n.type??"",n.formatOptions,n.constraints)??e.getTypeUtil().getTypeConfig(t.$Type)}const a=k(i);const c=Object.keys(a);if(c.length){r.propertyInfos=c;r.sortable=false;r.filterable=false;c.forEach(e=>{l[e]=a[e]});if(!c.find(e=>a[e]===s)){l[n]=s}}else{r.path=t.path}r.typeConfig=r.typeConfig?o:undefined}else{r.path=t.path}o.push(r)});const p=H(l,o,n,a);return o.concat(p)})};R.updateBindingInfo=function(e,t){y.updateBindingInfo.apply(this,[e,t]);if(!e){return}const o=e.getDelegate().payload;if(o&&t){t.path=t.path||o.collectionPath||`/${o.collectionName}`;t.model=t.model||o.model}if(!t){t={}}const r=u.byId(e.getFilter()),i=e.isFilteringEnabled();let s;let l,c;const p=[];const f=d.getCachedProperties(e);if(i){s=e.getConditions();l=v.getFilterInfo(e,s,f,[]);if(l.filters){p.push(l.filters)}}if(r){s=r.getConditions();if(s){const n=h.getParameterNames(r);R._updatePropertyInfo(f,e,s,o);c=v.getFilterInfo(r,s,f,n);if(c.filters){p.push(c.filters)}const i=h.getParametersInfo(r,s);if(i){t.path=i}}t.parameters.$search=n.normalizeSearchTerm(r.getSearch())||undefined}this._applyDefaultSorting(t,e.getDelegate().payload);t.parameters.$select=f===null||f===void 0?void 0:f.reduce(function(e,t){if(t.path&&t.path.indexOf("/")===-1){e=e?`${e},${t.path}`:t.path}return e},"");t.parameters.$count=true;if(a.isDraftSupported(e.getModel().getMetaModel(),t.path)){p.push(new m("IsActiveEntity",b.EQ,true))}t.filters=new m(p,true)};R.getTypeUtil=function(){return f};R._getModel=async function(e){const t=e.getDelegate().payload;let n=e.getModel(t.model);if(!n){await new Promise(t=>{e.attachEventOnce("modelContextChange",t)});n=e.getModel(t.model)}return n};R._applyDefaultSorting=function(e,t){if(e.parameters&&e.parameters.$search==undefined&&e.sorter&&e.sorter.length==0){const n=t?t.defaultSortPropertyName:undefined;if(n){e.sorter.push(new P(n,false))}}};R._updatePropertyInfo=function(e,t,n,o){const r=Object.keys(n),i=t.getModel().getMetaModel();r.forEach(function(n){if(e.findIndex(function(e){return e.path===n})===-1){const r={path:n,typeConfig:t.getTypeUtil().getTypeConfig(i.getObject(`/${o.collectionName}/${n}`).$Type)};e.push(r)}})};R.updateBinding=function(n,o,r){let i=false;const a=n.getBindingContext("internal");const s="pendingManualBindingUpdate";const l=a===null||a===void 0?void 0:a.getProperty(s);let c=n.getRowBinding();y.updateBinding.apply(R,[n,o,r]);if(!c){c=n.getRowBinding()}if(c){const e=c.getFilters("Application");i=t(o.filters,e[0])&&c.getQueryOptionsFromParameters().$search===o.parameters.$search&&!l}if(i&&n.getFilter()){a===null||a===void 0?void 0:a.setProperty(s,true);c.requestRefresh(c.getGroupId()).finally(function(){a===null||a===void 0?void 0:a.setProperty(s,false)}).catch(function(t){e.error("Error while refreshing a filterBar VH table",t)})}n.fireEvent("bindingUpdated")};function H(e,t,n,o){const r={},i=[];Object.keys(e).forEach(a=>{const s=e[a],l=t.find(e=>e.path===a);if(!l){const e=`Property::${a}`;r[a]=e;const t={name:e,label:D(s),path:a,sortable:C(n,s),filterable:M(o,s)};t.maxConditions=N(o,t);if(T(s.type)){const e=_(s);t.typeConfig=f.getTypeConfig(e.type??"",e.formatOptions,e.constraints)}i.push(t)}});t.forEach(e=>{if(e.propertyInfos){var t;e.propertyInfos=(t=e.propertyInfos)===null||t===void 0?void 0:t.map(e=>r[e]??e)}});return i}function N(e,t){var n;const o=I(t);return(n=e.propertyInfo)!==null&&n!==void 0&&n.hasOwnProperty(o)&&o&&U(e.propertyInfo[o])?-1:1}function V(e){const t=e.targetObject;const n=x(t)||F(t)||O(t)||$(t);if(!n){return undefined}const o=E(e,n);const r=o.targetObject;if(!r){return undefined}return o}return R},false);
//# sourceMappingURL=TableDelegate.js.map
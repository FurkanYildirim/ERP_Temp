/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge","sap/fe/core/helpers/BindingToolkit","sap/ui/mdc/enum/BaseType","sap/ui/mdc/odata/v4/TypeUtil"],function(e,a,t,s){"use strict";var r=a.EDM_TYPE_MAPPING;const u=Object.assign({},s);u.getBaseType=function(e,a,r){switch(e){case"sap.ui.model.odata.type.Date":return t.Date;case"sap.ui.model.odata.type.TimeOfDay":return t.Time;case"sap.ui.model.odata.type.Unit":case"sap.ui.model.odata.type.Currency":if(!a||(!a.hasOwnProperty("showMeasure")||a.showMeasure)&&(!a.hasOwnProperty("showNumber")||a.showNumber)){return t.Unit}else if(!a.hasOwnProperty("showNumber")||a.showNumber){return t.Numeric}else{return t.String}default:return s.getBaseType.call(u,e,a,r)}};u.getDataTypeClassName=function(e){if(r[e]){e=r[e].type}else{e=s.getDataTypeClassName.call(u,e)}return e};u.getDataTypeInstance=function(a,t,s){switch(a){case"sap.ui.model.odata.type.DateTimeOffset":case"Edm.DateTimeOffset":s=e({},s||{});s.V4=true;break;default:}const r=u.getDataTypeClass(a);return new r(t,s)};return u},false);
//# sourceMappingURL=TypeUtil.js.map
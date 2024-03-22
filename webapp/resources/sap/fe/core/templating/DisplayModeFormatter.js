/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/TypeGuards"],function(e){"use strict";var t={};var a=e.isPropertyPathExpression;var o=e.isPathAnnotationExpression;const i={"sap.ui.model.odata.type.Boolean":"Edm.Boolean","sap.ui.model.odata.type.Byte":"Edm.Byte","sap.ui.model.odata.type.Date":"Edm.Date","sap.ui.model.odata.type.DateTimeOffset":"Edm.DateTimeOffset","sap.ui.model.odata.type.Decimal":"Edm.Decimal","sap.ui.model.odata.type.Double":"Edm.Double","sap.ui.model.odata.type.Guid":"Edm.Guid","sap.ui.model.odata.type.Int16":"Edm.Int16","sap.ui.model.odata.type.Int32":"Edm.Int32","sap.ui.model.odata.type.Int64":"Edm.Int64","sap.ui.model.odata.type.SByte":"Edm.SByte","sap.ui.model.odata.type.Single":"Edm.Single","sap.ui.model.odata.type.Stream":"Edm.Stream","sap.ui.model.odata.type.TimeOfDay":"Edm.TimeOfDay","sap.ui.model.odata.type.String":"Edm.String"};t.ODATA_TYPE_MAPPING=i;const n=function(e,t){var i,n,d,l,s,p,u,m,r,y,v;if(!e||typeof e==="string"){return"Value"}const T=(o(e)||a(e))&&e.$target||e;const E=t&&t.targetEntityType;const f=(i=T.annotations)===null||i===void 0?void 0:(n=i.Common)===null||n===void 0?void 0:n.Text;const g=typeof f!=="string"&&(f===null||f===void 0?void 0:(d=f.annotations)===null||d===void 0?void 0:(l=d.UI)===null||l===void 0?void 0:(s=l.TextArrangement)===null||s===void 0?void 0:s.toString())||(E===null||E===void 0?void 0:(p=E.annotations)===null||p===void 0?void 0:(u=p.UI)===null||u===void 0?void 0:(m=u.TextArrangement)===null||m===void 0?void 0:m.toString());let c=f?"DescriptionValue":"Value";if(f&&g||E!==null&&E!==void 0&&(r=E.annotations)!==null&&r!==void 0&&(y=r.UI)!==null&&y!==void 0&&(v=y.TextArrangement)!==null&&v!==void 0&&v.toString()){if(g==="UI.TextArrangementType/TextOnly"){c="Description"}else if(g==="UI.TextArrangementType/TextLast"){c="ValueDescription"}else if(g==="UI.TextArrangementType/TextSeparate"){c="Value"}else{c="DescriptionValue"}}return c};t.getDisplayMode=n;return t},false);
//# sourceMappingURL=DisplayModeFormatter.js.map
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit"],function(o){"use strict";var n={};var i=o.or;var t=o.isConstant;var l=o.getExpressionFromAnnotation;var e=o.equal;var r=o.constant;const d=function(o,n){var t,d,s;const v=o===null||o===void 0?void 0:(t=o.annotations)===null||t===void 0?void 0:(d=t.Common)===null||d===void 0?void 0:(s=d.FieldControl)===null||s===void 0?void 0:s.valueOf();if(typeof v==="object"&&!!v){return i(e(l(v,n),1),e(l(v,n),"1"))}return r(v==="Common.FieldControlType/ReadOnly")};n.isReadOnlyExpression=d;const s=function(o,n){var t,d,s;const v=o===null||o===void 0?void 0:(t=o.annotations)===null||t===void 0?void 0:(d=t.Common)===null||d===void 0?void 0:(s=d.FieldControl)===null||s===void 0?void 0:s.valueOf();if(typeof v==="object"&&!!v){return i(e(l(v,n),0),e(l(v,n),"0"))}return r(v==="Common.FieldControlType/Inapplicable")};n.isDisabledExpression=s;const v=function(o,n){return i(d(o,n),s(o,n))};n.isNonEditableExpression=v;const a=function(o,n){var r,d,s;const v=(r=o.annotations)===null||r===void 0?void 0:(d=r.Common)===null||d===void 0?void 0:(s=d.FieldControl)===null||s===void 0?void 0:s.valueOf();const a=l(v,n);return i(t(a)&&e(a,"Common.FieldControlType/Mandatory"),e(a,7),e(a,"7"))};n.isRequiredExpression=a;return n},false);
//# sourceMappingURL=FieldControlHelper.js.map
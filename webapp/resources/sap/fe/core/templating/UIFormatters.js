/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper","sap/fe/core/converters/MetaModelConverter","sap/fe/core/formatters/ValueFormatter","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/TypeGuards","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/DisplayModeFormatter","sap/fe/core/templating/FieldControlHelper","sap/fe/core/templating/PropertyHelper","sap/ui/mdc/enum/EditMode"],function(e,t,n,i,o,a,r,l,s,d){"use strict";var u={};var c=s.isKey;var v=s.isImmutable;var f=s.isComputed;var p=s.hasValueHelp;var g=s.getAssociatedUnitProperty;var m=s.getAssociatedCurrencyProperty;var y=l.isRequiredExpression;var h=l.isReadOnlyExpression;var b=l.isNonEditableExpression;var E=l.isDisabledExpression;var x=a.isPathUpdatable;var D=a.getTargetObjectPath;var T=a.getRelativePaths;var I=a.getContextRelativeTargetObjectPath;var $=o.isProperty;var O=o.isPathAnnotationExpression;var M=o.isMultipleNavigationProperty;var P=i.pathInModel;var C=i.or;var U=i.not;var V=i.isTruthy;var F=i.isConstant;var j=i.ifElse;var S=i.getExpressionFromAnnotation;var w=i.formatWithTypeInformation;var A=i.formatResult;var q=i.equal;var N=i.EDM_TYPE_MAPPING;var R=i.constant;var B=i.compileExpression;var W=i.and;var z=i.addTypeInformation;var k=t.getInvolvedDataModelObjects;var H=t.convertMetaModelContext;var L=e.UI;var K=e.singletonPathVisitor;const G=function(e){return r.getDisplayMode(e.targetObject,e)};u.getDisplayMode=G;const _=function(e){let t=arguments.length>1&&arguments[1]!==undefined?arguments[1]:null;let n=arguments.length>2?arguments[2]:undefined;let i=arguments.length>3&&arguments[3]!==undefined?arguments[3]:L.IsEditable;let o=arguments.length>4&&arguments[4]!==undefined?arguments[4]:true;return Y(e,t,n,true,i,o)};u.getEditableExpressionAsObject=_;const Y=function(e){let t=arguments.length>1&&arguments[1]!==undefined?arguments[1]:null;let n=arguments.length>2?arguments[2]:undefined;let i=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;let o=arguments.length>4&&arguments[4]!==undefined?arguments[4]:L.IsEditable;let a=arguments.length>5&&arguments[5]!==undefined?arguments[5]:true;if(!e||typeof e==="string"){return B(false)}let r=R(true);if(t!==null){r=j(b(t),false,o)}const l=O(e)?e.$target:e;const s=T(n);const d=x(n,{propertyPath:e,pathVisitor:(e,t)=>K(e,n.convertedTypes,t)});if(B(d)==="false"&&a){return i?d:"false"}const u=j(C(W(U(d),a),f(l),c(l),v(l),b(l,s)),j(C(f(l),b(l,s)),false,L.IsTransientBinding),o);if(i){return W(u,r)}return B(W(u,r))};u.getEditableExpression=Y;const J=function(e,t){var n;const i=D(e);const o=P(`/collaboration/activities${i}`,"internal");const a=e===null||e===void 0?void 0:(n=e.targetEntityType)===null||n===void 0?void 0:n.keys;const r=[];a===null||a===void 0?void 0:a.forEach(function(e){const t=P(e.name);r.push(t)});return A([o,...r],t)};u.getCollaborationExpression=J;const Q=function(e,t,n){return X(e,t,true,n)};u.getEnabledExpressionAsObject=Q;const X=function(e,t){let n=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;let i=arguments.length>3?arguments[3]:undefined;if(!e||typeof e==="string"){return B(true)}let o;if(i){o=T(i)}let a=R(true);if(t!==null){a=j(E(t),false,true)}const r=O(e)?e.$target:e;const l=j(E(r,o),false,true);if(n){return W(l,a)}return B(W(l,a))};u.getEnabledExpression=X;const Z=function(e,t){let n=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;let i=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;let o=arguments.length>4&&arguments[4]!==undefined?arguments[4]:null;let a=arguments.length>5&&arguments[5]!==undefined?arguments[5]:L.IsEditable;if(!e||typeof e==="string"||(o===null||o===void 0?void 0:o.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath"){return d.Display}const r=O(e)?e.$target:e;const l=T(t);const s=x(t,{propertyPath:r,pathVisitor:(e,n)=>K(e,t.convertedTypes,n)});const u=_(e,o,t,a,false);const c=Q(e,o,t);const p=m(r);const y=p||g(r);let b=R(d.Editable);if(y){const e=h(y,l);b=j(C(e,f(y),W(v(y),U(L.IsTransientBinding)),n),j(!F(e)&&e,d.EditableReadOnly,d.EditableDisplay),d.Editable)}const E=C(h(r,l),h(o));const D=j(C(s,L.IsTransientBinding),j(c,j(u,b,j(W(!F(E)&&E,a),d.ReadOnly,d.Display)),j(a,d.Disabled,d.Display)),d.Display);if(i){return D}return B(D)};u.getEditMode=Z;const ee=function(e){var t,n,i,o;const a=e.targetObject;const r=(t=a.annotations)===null||t===void 0?void 0:(n=t.Measures)===null||n===void 0?void 0:n.ISOCurrency;const l=r?r:(i=a.annotations)===null||i===void 0?void 0:(o=i.Measures)===null||o===void 0?void 0:o.Unit;if(l){return B(C(V(S(l)),U(L.IsTotal)))}else{return B(R(true))}};u.hasValidAnalyticalCurrencyOrUnit=ee;const te=function(e,t,n){const i=O(e)&&e.$target||e;const o=m(i)||g(i);if(!o){return B(n)}const a=h(o);const r=W(C(!F(a),U(a)),U(f(o)),U(v(o)));return B(j(r,t,n))};u.ifUnitEditable=te;const ne=function(e,t,n){const i=O(e)&&e.$target||e;return p(i)?B(t):B(j(q(n,"Editable"),"Value",t))};u.getFieldDisplay=ne;const ie=function(e,t){var n,i,o,a;const r=N[e===null||e===void 0?void 0:e.type]||(t?N[t]:undefined);const l={type:r.type,constraints:{},formatOptions:{}};if($(e)){var s,d,u,c,v,f,p,g,m,y,h,b,E,x,D,T,I,O;l.constraints={scale:(s=r.constraints)!==null&&s!==void 0&&s.$Scale?e.scale:undefined,precision:(d=r.constraints)!==null&&d!==void 0&&d.$Precision?e.precision:undefined,maxLength:(u=r.constraints)!==null&&u!==void 0&&u.$MaxLength?e.maxLength:undefined,nullable:(c=r.constraints)!==null&&c!==void 0&&c.$Nullable?e.nullable:undefined,minimum:(v=r.constraints)!==null&&v!==void 0&&v["@Org.OData.Validation.V1.Minimum/$Decimal"]&&!isNaN((f=e.annotations)===null||f===void 0?void 0:(p=f.Validation)===null||p===void 0?void 0:p.Minimum)?`${(g=e.annotations)===null||g===void 0?void 0:(m=g.Validation)===null||m===void 0?void 0:m.Minimum}`:undefined,maximum:(y=r.constraints)!==null&&y!==void 0&&y["@Org.OData.Validation.V1.Maximum/$Decimal"]&&!isNaN((h=e.annotations)===null||h===void 0?void 0:(b=h.Validation)===null||b===void 0?void 0:b.Maximum)?`${(E=e.annotations)===null||E===void 0?void 0:(x=E.Validation)===null||x===void 0?void 0:x.Maximum}`:undefined,isDigitSequence:l.type==="sap.ui.model.odata.type.String"&&(D=r.constraints)!==null&&D!==void 0&&D["@com.sap.vocabularies.Common.v1.IsDigitSequence"]&&(T=e.annotations)!==null&&T!==void 0&&(I=T.Common)!==null&&I!==void 0&&I.IsDigitSequence?true:undefined,V4:(O=r.constraints)!==null&&O!==void 0&&O.$V4?true:undefined}}l.formatOptions={parseAsString:(l===null||l===void 0?void 0:(n=l.type)===null||n===void 0?void 0:n.indexOf("sap.ui.model.odata.type.Int"))===0||(l===null||l===void 0?void 0:(i=l.type)===null||i===void 0?void 0:i.indexOf("sap.ui.model.odata.type.Double"))===0?false:undefined,emptyString:(l===null||l===void 0?void 0:(o=l.type)===null||o===void 0?void 0:o.indexOf("sap.ui.model.odata.type.Int"))===0||(l===null||l===void 0?void 0:(a=l.type)===null||a===void 0?void 0:a.indexOf("sap.ui.model.odata.type.Double"))===0?"":undefined,parseKeepsEmptyString:l.type==="sap.ui.model.odata.type.String"?true:undefined};return l};u.getTypeConfig=ie;const oe=function(e,t,i,o){var a,r,l,s,d;const u=e.targetObject;let c=(a=u.annotations)===null||a===void 0?void 0:(r=a.Measures)===null||r===void 0?void 0:r.Unit;const v=T(e);t=w(u,t);if(((l=c)===null||l===void 0?void 0:l.toString())==="%"){if((o===null||o===void 0?void 0:o.showMeasure)===false){return t}return A([t],n.formatWithPercentage)}const f=c?"sap.ui.model.odata.type.Unit":"sap.ui.model.odata.type.Currency";c=c?c:(s=u.annotations)===null||s===void 0?void 0:(d=s.Measures)===null||d===void 0?void 0:d.ISOCurrency;const p=c.$target?w(c.$target,S(c,v),i):S(c,v);return z([t,p],f,undefined,o)};u.getBindingWithUnitOrCurrency=oe;const ae=function(e){var t,n,i,o,a;const r=e.targetObject;let l=(t=r.annotations)===null||t===void 0?void 0:(n=t.Measures)===null||n===void 0?void 0:n.Unit;if(((i=l)===null||i===void 0?void 0:i.toString())==="%"){return R("%")}const s=T(e);const d=l?"sap.ui.model.odata.type.Unit":"sap.ui.model.odata.type.Currency";l=l?l:(o=r.annotations)===null||o===void 0?void 0:(a=o.Measures)===null||a===void 0?void 0:a.ISOCurrency;const u=l.$target?w(l.$target,S(l,s)):S(l,s);let c=P(I(e));c=w(r,c,true);return z([c,u],d,undefined,{parseKeepsEmptyString:true,emptyString:"",showNumber:false})};u.getBindingForUnitOrCurrency=ae;const re=function(e,t){var n,i;let o=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;let a=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;let r=arguments.length>4?arguments[4]:undefined;const l=e.targetObject;const s=(n=l.annotations)===null||n===void 0?void 0:(i=n.Common)===null||i===void 0?void 0:i.Timezone;const d=T(e);t=w(l,t);const u="sap.fe.core.type.DateTimeWithTimezone";const c=s.$target?w(s.$target,S(s,d),o):S(s,d);let v={};if(a){v={showTimezoneForEmptyValues:false}}if(r!==null&&r!==void 0&&r.showTime){v={...v,...{showTime:r.showTime==="false"?false:true}}}if(r!==null&&r!==void 0&&r.showDate){v={...v,...{showDate:r.showDate==="false"?false:true}}}if(r!==null&&r!==void 0&&r.showTimezone){v={...v,...{showTimezone:r.showTimezone==="false"?false:true}}}return z([t,c],u,undefined,v)};u.getBindingWithTimezone=re;const le=function(e){let t=arguments.length>1&&arguments[1]!==undefined?arguments[1]:"Begin";let n=arguments.length>2&&arguments[2]!==undefined?arguments[2]:"Begin";return B(j(q(e,"Display"),t,n))};u.getAlignmentExpression=le;const se=function(e,t){if(t&&t.context){return H(t.context)}return null};se.requiresIContext=true;u.getConverterContext=se;const de=function(e,t){if(t&&t.context){return k(t.context)}return null};de.requiresIContext=true;u.getDataModelObjectPath=de;const ue=function(e){var t;if((t=e.navigationProperties)!==null&&t!==void 0&&t.length){const t=(e===null||e===void 0?void 0:e.navigationProperties.findIndex(t=>{if(M(t)){var n,i;if((n=e.contextLocation)!==null&&n!==void 0&&(i=n.navigationProperties)!==null&&i!==void 0&&i.length){var o;return((o=e.contextLocation)===null||o===void 0?void 0:o.navigationProperties.findIndex(e=>e.name===t.name))===-1}return true}return false}))>-1;if(t){return true}}return false};u.isMultiValueField=ue;const ce=function(e,t){let n=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;return ve(e,t,n,true)};u.getRequiredExpressionAsObject=ce;const ve=function(e,t){let n=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;let i=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;let o=arguments.length>4&&arguments[4]!==undefined?arguments[4]:{};let a=arguments.length>5?arguments[5]:undefined;const r=o.requiredPropertiesFromInsertRestrictions;const l=o.requiredPropertiesFromUpdateRestrictions;if(!e||typeof e==="string"){if(i){return R(false)}return B(R(false))}let s;if(a){s=T(a)}let d=R(false);if(t!==null&&t!==undefined){d=y(t)}let u=R(false);let c=R(false);const v=O(e)&&e.$target||e;const f=y(v,s);const p=n||L.IsEditable;if(r!==null&&r!==void 0&&r.includes(e.name)){u=L.IsCreateMode}if(l!==null&&l!==void 0&&l.includes(e.name)){c=W(L.IsEditable,U(L.IsCreateMode))}const g=C(W(C(f,d),p),u,c);if(i){return g}return B(g)};u.getRequiredExpression=ve;const fe=function(e){var t,n;const i=e===null||e===void 0?void 0:(t=e.targetObject)===null||t===void 0?void 0:(n=t.$target)===null||n===void 0?void 0:n.Data;const o=Object.keys(i);const a=[];let r;const l=[];for(const e of o){if(i[e]["$Type"]&&i[e]["$Type"].indexOf("DataField")>-1){a.push(i[e])}}for(const e of a){switch(e.$Type){case"com.sap.vocabularies.UI.v1.DataField":case"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":case"com.sap.vocabularies.UI.v1.DataFieldWithUrl":case"com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":case"com.sap.vocabularies.UI.v1.DataFieldWithAction":if(typeof e.Value==="object"){r=e.Value.$target}break;case"com.sap.vocabularies.UI.v1.DataFieldForAnnotation":if(e.Target.$target){if(e.Target.$target.$Type==="com.sap.vocabularies.UI.v1.DataField"||e.Target.$target.$Type==="com.sap.vocabularies.UI.v1.DataPointType"){if(typeof e.Target.$target.Value==="object"){r=e.Target.$target.Value.$target}}else{if(typeof e.Target==="object"){r=e.Target.$target}break}}break}l.push(ce(r,e,false))}return B(C(...l))};u.getRequiredExpressionForConnectedDataField=fe;return u},false);
//# sourceMappingURL=UIFormatters.js.map
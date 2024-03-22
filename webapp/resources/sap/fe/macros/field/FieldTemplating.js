/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField","sap/fe/core/converters/helpers/BindingHelper","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/TypeGuards","sap/fe/core/templating/CommonFormatters","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/FieldControlHelper","sap/fe/core/templating/PropertyHelper","sap/fe/core/templating/SemanticObjectHelper","sap/fe/core/templating/UIFormatters","sap/ui/core/format/NumberFormat","sap/ui/model/json/JSONModel","./FieldHelper"],function(e,t,i,n,a,o,r,l,s,d,u,v,c){"use strict";var g={};var p=d.ifUnitEditable;var f=s.hasSemanticObject;var m=s.getDynamicPathFromSemanticObject;var y=r.isReadOnlyExpression;var b=o.getContextRelativeTargetObjectPath;var h=o.enhanceDataModelPath;var O=n.isProperty;var I=n.isPathAnnotationExpression;var T=n.isNavigationProperty;var j=i.transformRecursively;var U=i.pathInModel;var D=i.or;var F=i.not;var P=i.isPathInModelExpression;var E=i.isComplexTypeExpression;var $=i.ifElse;var x=i.getExpressionFromAnnotation;var S=i.formatWithTypeInformation;var V=i.formatResult;var B=i.equal;var C=i.constant;var A=i.compileExpression;var W=i.and;var M=t.UI;var N=e.isDataFieldForAnnotation;const k=function(e,t){return j(e,"PathInModel",e=>{let i=e;if(e.modelName===undefined){const n=h(t,e.path);i=a.getBindingWithTextArrangement(n,e)}return i})};g.addTextArrangementToBindingExpression=k;const H=function(e,t){return j(e,"PathInModel",e=>{let i=e;if(e.modelName===undefined){const n=h(t,e.path);i=S(n.targetObject,e)}return i})};g.formatValueRecursively=H;const w=function(e,t){return R(e,t,true)};g.getTextBindingExpression=w;const R=function(e,t){var i,n,o,r,l,s,u,v,c,g,p,f,m,y,O;let T=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;if(((i=e.targetObject)===null||i===void 0?void 0:i.$Type)==="com.sap.vocabularies.UI.v1.DataField"||((n=e.targetObject)===null||n===void 0?void 0:n.$Type)==="com.sap.vocabularies.UI.v1.DataPointType"||((o=e.targetObject)===null||o===void 0?void 0:o.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath"||((r=e.targetObject)===null||r===void 0?void 0:r.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"||((l=e.targetObject)===null||l===void 0?void 0:l.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation"||((s=e.targetObject)===null||s===void 0?void 0:s.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithAction"){const t=x(e.targetObject.Value)??"";return A(t)}if(I(e.targetObject)&&e.targetObject.$target){e=h(e,e.targetObject.path)}const j=U(b(e));let D;if((u=e.targetObject)!==null&&u!==void 0&&(v=u.annotations)!==null&&v!==void 0&&(c=v.Measures)!==null&&c!==void 0&&c.Unit||(g=e.targetObject)!==null&&g!==void 0&&(p=g.annotations)!==null&&p!==void 0&&(f=p.Measures)!==null&&f!==void 0&&f.ISOCurrency){D=d.getBindingWithUnitOrCurrency(e,j);if((t===null||t===void 0?void 0:t.measureDisplayMode)==="Hidden"&&E(D)){D.formatOptions={...D.formatOptions,showMeasure:false}}}else if((m=e.targetObject)!==null&&m!==void 0&&(y=m.annotations)!==null&&y!==void 0&&(O=y.Common)!==null&&O!==void 0&&O.Timezone){D=d.getBindingWithTimezone(e,j,false,true,t.dateFormatOptions)}else{D=a.getBindingWithTextArrangement(e,j,t)}if(T){return D}return A(D)};g.getTextBinding=R;const z=function(e,t){let i=arguments.length>2&&arguments[2]!==undefined?arguments[2]:false;let n=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;let a=arguments.length>4?arguments[4]:undefined;let o=arguments.length>5&&arguments[5]!==undefined?arguments[5]:false;let r=arguments.length>6&&arguments[6]!==undefined?arguments[6]:false;if(I(e.targetObject)&&e.targetObject.$target){const t=e.targetEntityType.resolvePath(e.targetObject.path,true);e.targetObject=t.target;t.visitedObjects.forEach(t=>{if(T(t)){e.navigationProperties.push(t)}})}const l=e.targetObject;if(O(l)){let t=U(b(e));if(P(t)){var s,u,v,c,g,p;if((s=l.annotations)!==null&&s!==void 0&&(u=s.Communication)!==null&&u!==void 0&&u.IsEmailAddress){t.type="sap.fe.core.type.Email"}else if(!i&&((v=l.annotations)!==null&&v!==void 0&&(c=v.Measures)!==null&&c!==void 0&&c.ISOCurrency||(g=l.annotations)!==null&&g!==void 0&&(p=g.Measures)!==null&&p!==void 0&&p.Unit)){t=d.getBindingWithUnitOrCurrency(e,t,true,r?undefined:{showMeasure:false})}else{var f,m;const i=(f=e.targetObject.annotations)===null||f===void 0?void 0:(m=f.Common)===null||m===void 0?void 0:m.Timezone;if(i){t=d.getBindingWithTimezone(e,t,true)}else{t=S(l,t)}if(P(t)&&t.type==="sap.ui.model.odata.type.String"){t.formatOptions={parseKeepsEmptyString:true}}}if(P(t)){if(n){delete t.formatOptions;delete t.constraints;delete t.type}if(a){t.parameters=a}if(o){t.targetType="any"}}return A(t)}else{return""}}else if((l===null||l===void 0?void 0:l.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithUrl"||(l===null||l===void 0?void 0:l.$Type)==="com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath"){return A(x(l.Value))}else{return""}};g.getValueBinding=z;const L=function(e,t){const i=l.getAssociatedTextPropertyPath(e.targetObject);if(i){const n=h(e,i);return z(n,t,true,true,{$$noPatch:true})}return undefined};g.getAssociatedTextBinding=L;const Q=function(e,t){var i,n,a,o,r;const l=(e===null||e===void 0?void 0:(i=e.targetEntityType)===null||i===void 0?void 0:i.navigationProperties)||[];const s=(e===null||e===void 0?void 0:(n=e.targetEntityType)===null||n===void 0?void 0:(a=n.annotations)===null||a===void 0?void 0:(o=a.Common)===null||o===void 0?void 0:o.SemanticKey)||[];let d=false;l.forEach(e=>{if(e.referentialConstraint&&e.referentialConstraint.length){e.referentialConstraint.forEach(i=>{if((i===null||i===void 0?void 0:i.sourceProperty)===t.name){var n,a,o;if(e!==null&&e!==void 0&&(n=e.targetType)!==null&&n!==void 0&&(a=n.annotations)!==null&&a!==void 0&&(o=a.UI)!==null&&o!==void 0&&o.QuickViewFacets){d=true}}})}});if(((r=e.contextLocation)===null||r===void 0?void 0:r.targetEntitySet)!==e.targetEntitySet){var u,v,c;const i=s.some(function(e){var i;return(e===null||e===void 0?void 0:(i=e.$target)===null||i===void 0?void 0:i.name)===t.name});if((i||t.isKey)&&e!==null&&e!==void 0&&(u=e.targetEntityType)!==null&&u!==void 0&&(v=u.annotations)!==null&&v!==void 0&&(c=v.UI)!==null&&c!==void 0&&c.QuickViewFacets){d=true}}return d};g.isUsedInNavigationWithQuickViewFacets=Q;const K=function(e,t){var i,n,a;const o=I(e)&&e.$target||e;if(!((i=o.annotations)!==null&&i!==void 0&&(n=i.Common)!==null&&n!==void 0&&n.Text)&&!((a=o.annotations)!==null&&a!==void 0&&a.Measures)&&l.hasValueHelp(o)&&t.textAlignMode==="Form"){return true}return false};g.isRetrieveTextFromValueListEnabled=K;const q=function(e,t,i){var n,a,o,r,s,d;let u=((n=e.targetObject.Value)===null||n===void 0?void 0:n.$target.type)||((a=e.targetObject.Target)===null||a===void 0?void 0:a.$target.Value.$target.type);let v;if(l.isKey(((o=e.targetObject.Value)===null||o===void 0?void 0:o.$target)||((r=e.targetObject.Target)===null||r===void 0?void 0:(s=r.$target)===null||s===void 0?void 0:(d=s.Value)===null||d===void 0?void 0:d.$target))){return"Begin"}if(e.targetObject.$Type!=="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"){v=e.targetObject.Value.$target.annotations.UI;u=c.getDataTypeForVisualization(v,u)}return c.getPropertyAlignment(u,t,i)};g.getTextAlignment=q;const G=function(e,t){var i,n,a,o,r,l;const s=e.targetObject;let d;if(s){switch(s.$Type){case"com.sap.vocabularies.UI.v1.DataField":case"com.sap.vocabularies.UI.v1.DataFieldWithUrl":case"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":case"com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":case"com.sap.vocabularies.UI.v1.DataFieldWithAction":case"com.sap.vocabularies.UI.v1.DataPointType":d=s.Value.$target;break;case"com.sap.vocabularies.UI.v1.DataFieldForAnnotation":if((s===null||s===void 0?void 0:(i=s.Target)===null||i===void 0?void 0:(n=i.$target)===null||n===void 0?void 0:n.$Type)==="com.sap.vocabularies.UI.v1.DataPointType"){var u;d=(u=s.Target.$target)===null||u===void 0?void 0:u.Value.$target;break}case"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":case"com.sap.vocabularies.UI.v1.DataFieldForAction":default:d=undefined}}const v=t!==null&&t!==void 0&&t.isAnalytics?M.IsExpanded:C(false);const c=t!==null&&t!==void 0&&t.isAnalytics?B(M.NodeLevel,0):C(false);return A(W(...[F(B(x(s===null||s===void 0?void 0:(a=s.annotations)===null||a===void 0?void 0:(o=a.UI)===null||o===void 0?void 0:o.Hidden),true)),$(!!d,d&&F(B(x((r=d.annotations)===null||r===void 0?void 0:(l=r.UI)===null||l===void 0?void 0:l.Hidden),true)),true),D(F(v),c)]))};g.getVisibleExpression=G;const J=function(e,t,i){let n=arguments.length>3&&arguments[3]!==undefined?arguments[3]:false;let a=z(e,i,n);if(a===""){a=R(t,i,n)}return a};g.QVTextBinding=J;const X=function(e){var t,i,n,a,o,r;const l=e.targetObject;if(l!==null&&l!==void 0&&(t=l.$target)!==null&&t!==void 0&&(i=t.annotations)!==null&&i!==void 0&&(n=i.Communication)!==null&&n!==void 0&&n.IsEmailAddress){return"email"}if(l!==null&&l!==void 0&&(a=l.$target)!==null&&a!==void 0&&(o=a.annotations)!==null&&o!==void 0&&(r=o.Communication)!==null&&r!==void 0&&r.IsPhoneNumber){return"phone"}return"text"};g.getQuickViewType=X;const Y=function(e,t){const i=[];let n;let a;if(e){const o=Object.keys(e).filter(function(e){return e==="SemanticObject"||e.startsWith("SemanticObject#")});for(const r of o){a=e[r];n=A(x(a));if(!t||t&&I(a)){i.push({key:m(n)||n,value:n})}}}return i};g.getSemanticObjectExpressionToResolve=Y;const Z=function(e){if(e.length>0){let t="";let i="";const n=[];for(let a=0;a<e.length;a++){t=e[a].key;i=A(x(e[a].value));n.push({key:t,value:i})}const a=new v(n);a.$$valueAsPromise=true;const o=a.createBindingContext("/");return o}else{return new v([]).createBindingContext("/")}};g.getSemanticObjects=Z;const _=function(e,t,i){if(e.wrap===false){return false}if(t!=="Edm.String"){return i}if(e.editMode==="Display"){return true}if(e.editMode.indexOf("{")>-1){return A(D(F(M.IsEditable),i))}return i};g.getMultipleLinesForDataField=_;const ee=function(e,t){const i=l.getAssociatedUnitProperty(e);const n=l.getAssociatedCurrencyProperty(e);return l.hasValueHelp(e)&&e.type!=="Edm.Boolean"||t!=="Hidden"&&(i&&l.hasValueHelp(i)||n&&l.hasValueHelp(n))};const te=function(e,t,i,n){var a,o,r,s,u,v,c,g,f,m,b,h;const I=i.targetObject;if(!O(I)||["com.sap.vocabularies.UI.v1.DataFieldForAction","com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath","com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"].includes(t.$Type)){e.editStyle=null;return}if(!n){var T,j,U,D,P,E;e.valueBindingExpression=z(i,e.formatOptions);const n=((T=t.annotations)===null||T===void 0?void 0:(j=T.UI)===null||j===void 0?void 0:j.Placeholder)||((U=t.Value)===null||U===void 0?void 0:(D=U.$target)===null||D===void 0?void 0:(P=D.annotations)===null||P===void 0?void 0:(E=P.UI)===null||E===void 0?void 0:E.Placeholder);if(n){e.editStylePlaceholder=A(x(n))}}const $=N(t)?(a=t.Target)===null||a===void 0?void 0:a.$target:t;if(($===null||$===void 0?void 0:$.Visualization)==="UI.VisualizationType/Rating"){var S,V;e.editStyle="RatingIndicator";if((S=$.annotations)!==null&&S!==void 0&&(V=S.Common)!==null&&V!==void 0&&V.QuickInfo){var B,C;e.ratingIndicatorTooltip=A(x((B=$.annotations)===null||B===void 0?void 0:(C=B.Common)===null||C===void 0?void 0:C.QuickInfo))}e.ratingIndicatorTargetValue=A(x($.TargetValue));return}if(ee(I,(o=e.formatOptions)===null||o===void 0?void 0:o.measureDisplayMode)){if(!n){var W;e.textBindingExpression=L(i,e.formatOptions);if(((W=e.formatOptions)===null||W===void 0?void 0:W.measureDisplayMode)!=="Hidden"){e.valueBindingExpression=z(i,e.formatOptions,false,false,undefined,false,true)}}e.editStyle="InputWithValueHelp";return}switch(I.type){case"Edm.Date":e.editStyle="DatePicker";return;case"Edm.Time":case"Edm.TimeOfDay":e.editStyle="TimePicker";return;case"Edm.DateTime":case"Edm.DateTimeOffset":e.editStyle="DateTimePicker";if(!((r=I.annotations)!==null&&r!==void 0&&(s=r.Common)!==null&&s!==void 0&&s.Timezone)){e.showTimezone=undefined}else{e.showTimezone=true}return;case"Edm.Boolean":e.editStyle="CheckBox";return;case"Edm.Stream":e.editStyle="File";return;case"Edm.String":if((u=I.annotations)!==null&&u!==void 0&&(v=u.UI)!==null&&v!==void 0&&(c=v.MultiLineText)!==null&&c!==void 0&&c.valueOf()){e.editStyle="TextArea";return}break;default:e.editStyle="Input"}if(((g=e.formatOptions)===null||g===void 0?void 0:g.measureDisplayMode)!=="Hidden"&&((f=I.annotations)!==null&&f!==void 0&&(m=f.Measures)!==null&&m!==void 0&&m.ISOCurrency||(b=I.annotations)!==null&&b!==void 0&&(h=b.Measures)!==null&&h!==void 0&&h.Unit)){if(!n){e.unitBindingExpression=A(d.getBindingForUnitOrCurrency(i));e.descriptionBindingExpression=d.ifUnitEditable(I,"",d.getBindingForUnitOrCurrency(i));const t=l.getAssociatedCurrencyProperty(I)||l.getAssociatedUnitProperty(I);e.staticUnit=t?undefined:ie(I);e.unitEditable=e.formatOptions.measureDisplayMode==="ReadOnly"?"false":A(F(y(t)));e.valueInputWidth=p(I,"70%","100%");e.valueInputFieldWidth=p(I,"100%","70%");e.unitInputVisible=p(I,true,false)}e.editStyle="InputWithUnit";return}e.editStyle="Input"};g.setEditStyleProperties=te;const ie=e=>{var t,i,n,a,o,r,l,s;let d=((t=e.annotations)===null||t===void 0?void 0:(i=t.Measures)===null||i===void 0?void 0:(n=i.Unit)===null||n===void 0?void 0:n.valueOf())||(e===null||e===void 0?void 0:(a=e.annotations)===null||a===void 0?void 0:(o=a.Measures)===null||o===void 0?void 0:(r=o.ISOCurrency)===null||r===void 0?void 0:r.valueOf());const v=u.getUnitInstance();const c=v===null||v===void 0?void 0:(l=v.oLocaleData)===null||l===void 0?void 0:l.mData;if(c!==null&&c!==void 0&&(s=c.units)!==null&&s!==void 0&&s.short&&c.units.short[d]&&c.units.short[d].displayName){d=c.units.short[d].displayName}return d};g.getStaticUnitWithLocale=ie;const ne=e=>{var t,i,n,a;const o=e.targetObject;if(s.hasSemanticObject(o)){return true}const r=e!==null&&e!==void 0&&(t=e.navigationProperties)!==null&&t!==void 0&&t.length?e===null||e===void 0?void 0:e.navigationProperties[(e===null||e===void 0?void 0:(i=e.navigationProperties)===null||i===void 0?void 0:i.length)-1]:null;if(!r||(n=e.contextLocation)!==null&&n!==void 0&&(a=n.navigationProperties)!==null&&a!==void 0&&a.find(e=>e.name===r.name)){return false}return s.hasSemanticObject(r)};g.hasSemanticObjectInNavigationOrProperty=ne;const ae=e=>{if(!e.targetObject){return undefined}let t="";if(e.targetObject.term==="com.sap.vocabularies.UI.v1.DataPoint"){e.targetObject.$Type=e.targetObject.$Type||"com.sap.vocabularies.UI.v1.DataPointType"}switch(e.targetObject.$Type){case"com.sap.vocabularies.UI.v1.DataField":case"com.sap.vocabularies.UI.v1.DataPointType":case"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":case"com.sap.vocabularies.UI.v1.DataFieldWithUrl":case"com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":case"com.sap.vocabularies.UI.v1.DataFieldWithAction":if(typeof e.targetObject.Value==="object"){t=e.targetObject.Value.path}break;case"com.sap.vocabularies.UI.v1.DataFieldForAnnotation":if(e.targetObject.Target.$target){if(e.targetObject.Target.$target.$Type==="com.sap.vocabularies.UI.v1.DataField"||e.targetObject.Target.$target.$Type==="com.sap.vocabularies.UI.v1.DataPointType"){if(e.targetObject.Target.value.indexOf("/")>0){var i;t=e.targetObject.Target.value.replace(/\/@.*/,`/${(i=e.targetObject.Target.$target.Value)===null||i===void 0?void 0:i.path}`)}else{var n;t=(n=e.targetObject.Target.$target.Value)===null||n===void 0?void 0:n.path}}else{var a;t=(a=e.targetObject.Target)===null||a===void 0?void 0:a.path}}break}if(t&&t.length>0){return h(e,t)}else{return undefined}};g.getDataModelObjectPathForValue=ae;const oe=e=>{let t;if(f(e.targetObject)){t=e.targetObject}else if(e.navigationProperties.length>0){for(const n of e.navigationProperties){var i;if(!((i=e.contextLocation)!==null&&i!==void 0&&i.navigationProperties.find(e=>e.fullyQualifiedName===n.fullyQualifiedName))&&!t&&f(n)){t=n}}}return t};g.getPropertyWithSemanticObject=oe;const re=e=>{var t,i;const n=(t=e.contextLocation)===null||t===void 0?void 0:(i=t.navigationProperties)===null||i===void 0?void 0:i.slice(-1)[0];const a=function(e){var t,i,n;return!!(e!==null&&e!==void 0&&(t=e.annotations)!==null&&t!==void 0&&(i=t.Capabilities)!==null&&i!==void 0&&(n=i.InsertRestrictions)!==null&&n!==void 0&&n.NonInsertableProperties)};const o=function(t){var i,n,a,o;return!!(t!==null&&t!==void 0&&(i=t.annotations)!==null&&i!==void 0&&(n=i.Capabilities)!==null&&n!==void 0&&(a=n.InsertRestrictions)!==null&&a!==void 0&&(o=a.NonInsertableProperties)!==null&&o!==void 0&&o.some(t=>{var i,n;return(t===null||t===void 0?void 0:(i=t.$target)===null||i===void 0?void 0:i.name)===((n=e.targetObject)===null||n===void 0?void 0:n.name)}))};if(n&&a(n)){return o(n)}else{return!!e.targetEntitySet&&o(e.targetEntitySet)}};g.hasPropertyInsertRestrictions=re;const le=e=>e?A(V([C(e),U("semanticKeyHasDraftIndicator","internal"),U("HasDraftEntity"),U("IsActiveEntity"),U("hideDraftInfo","pageInternal")],"sap.fe.macros.field.FieldRuntime.isDraftIndicatorVisible")):"false";g.getDraftIndicatorVisibleBinding=le;return g},false);
//# sourceMappingURL=FieldTemplating.js.map
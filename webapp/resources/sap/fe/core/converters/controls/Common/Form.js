/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/TypeGuards","sap/fe/core/templating/DataModelPathHelper","../../../helpers/StableIdHelper","../../helpers/ConfigurableObject","../../helpers/DataFieldHelper","../../helpers/ID","../../helpers/Key","../../ManifestSettings"],function(e,t,a,n,o,i,r,l,s,v){"use strict";var c={};var d=v.ActionType;var u=s.KeyHelper;var f=l.getFormStandardActionButtonID;var p=l.getFormID;var m=r.isReferencePropertyStaticallyHidden;var y=i.Placement;var P=i.OverrideType;var h=i.insertCustomElements;var O=o.createIdForAnnotation;var g=n.getTargetObjectPath;var F=n.getTargetEntitySetPath;var b=a.isSingleton;var I=t.pathInModel;var E=t.not;var T=t.ifElse;var D=t.getExpressionFromAnnotation;var C=t.equal;var A=t.compileExpression;var S=e.getSemanticObjectPath;let w;(function(e){e["Default"]="Default";e["Slot"]="Slot";e["Annotation"]="Annotation"})(w||(w={}));c.FormElementType=w;function U(){return{textLinesEdit:4}}function N(e,t){var a,n,o,i;return(t===null||t===void 0?void 0:t.valueOf())===false||((a=e.annotations)===null||a===void 0?void 0:(n=a.UI)===null||n===void 0?void 0:n.PartOfPreview)===undefined||((o=e.annotations)===null||o===void 0?void 0:(i=o.UI)===null||i===void 0?void 0:i.PartOfPreview.valueOf())===true}function $(e,t){const a=[];const n=t.getEntityTypeAnnotation(e.Target.value);const o=n.annotation;t=n.converterContext;function i(e,n){var o,i,r;const l=S(t,e);if(e.$Type!=="com.sap.vocabularies.UI.v1.DataFieldForAction"&&e.$Type!=="com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"&&!m(e)&&((o=e.annotations)===null||o===void 0?void 0:(i=o.UI)===null||i===void 0?void 0:(r=i.Hidden)===null||r===void 0?void 0:r.valueOf())!==true){const o={key:u.generateKeyFromDataField(e),type:w.Annotation,annotationPath:`${t.getEntitySetBasedAnnotationPath(e.fullyQualifiedName)}/`,semanticObjectPath:l,formatOptions:U(),isPartOfPreview:N(e,n)};if(e.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"&&e.Target.$target.$Type==="com.sap.vocabularies.UI.v1.ConnectedFieldsType"){const a=Object.values(e.Target.$target.Data).filter(e=>e===null||e===void 0?void 0:e.hasOwnProperty("Value"));o.connectedFields=a.map(e=>({semanticObjectPath:S(t,e)}))}a.push(o)}}switch(o===null||o===void 0?void 0:o.term){case"com.sap.vocabularies.UI.v1.FieldGroup":o.Data.forEach(t=>{var a,n;return i(t,(a=e.annotations)===null||a===void 0?void 0:(n=a.UI)===null||n===void 0?void 0:n.PartOfPreview)});break;case"com.sap.vocabularies.UI.v1.Identification":o.forEach(t=>{var a,n;return i(t,(a=e.annotations)===null||a===void 0?void 0:(n=a.UI)===null||n===void 0?void 0:n.PartOfPreview)});break;case"com.sap.vocabularies.UI.v1.DataPoint":a.push({key:`DataPoint::${o.qualifier?o.qualifier:""}`,type:w.Annotation,annotationPath:`${t.getEntitySetBasedAnnotationPath(o.fullyQualifiedName)}/`});break;case"com.sap.vocabularies.Communication.v1.Contact":a.push({key:`Contact::${o.qualifier?o.qualifier:""}`,type:w.Annotation,annotationPath:`${t.getEntitySetBasedAnnotationPath(o.fullyQualifiedName)}/`});break;default:break}return a}function M(e,t){const a=t.getManifestWrapper();const n=a.getFormContainer(e.Target.value);const o={};if(n!==null&&n!==void 0&&n.fields){Object.keys(n===null||n===void 0?void 0:n.fields).forEach(e=>{o[e]={key:e,id:`CustomFormElement::${e}`,type:n.fields[e].type||w.Default,template:n.fields[e].template,label:n.fields[e].label,position:n.fields[e].position||{placement:y.After},formatOptions:{...U(),...n.fields[e].formatOptions}}})}return o}c.getFormElementsFromManifest=M;function _(e,t,a){var n,o,i,r,l,s;const v=O(e);const c=t.getEntitySetBasedAnnotationPath(e.fullyQualifiedName);const u=t.getEntityTypeAnnotation(e.Target.value);const p=A(E(C(true,D((n=e.annotations)===null||n===void 0?void 0:(o=n.UI)===null||o===void 0?void 0:o.Hidden))));let m;const y=u.converterContext.getEntitySet();if(y&&y!==t.getEntitySet()){m=F(u.converterContext.getDataModelObjectPath())}else if(((i=u.converterContext.getDataModelObjectPath().targetObject)===null||i===void 0?void 0:i.containsTarget)===true){m=g(u.converterContext.getDataModelObjectPath(),false)}else if(y&&!m&&b(y)){m=y.fullyQualifiedName}const S=h($(e,t),M(e,t),{formatOptions:P.overwrite});a=a!==undefined?a.filter(t=>t.facetName==e.fullyQualifiedName):[];if(a.length===0){a=undefined}const w={id:f(v,"ShowHideDetails"),key:"StandardAction::ShowHideDetails",text:A(T(C(I("showDetails","internal"),true),I("T_COMMON_OBJECT_PAGE_HIDE_FORM_CONTAINER_DETAILS","sap.fe.i18n"),I("T_COMMON_OBJECT_PAGE_SHOW_FORM_CONTAINER_DETAILS","sap.fe.i18n"))),type:d.ShowFormDetails,press:"FormContainerRuntime.toggleDetails"};if(((r=e.annotations)===null||r===void 0?void 0:(l=r.UI)===null||l===void 0?void 0:(s=l.PartOfPreview)===null||s===void 0?void 0:s.valueOf())!==false&&S.some(e=>e.isPartOfPreview===false)){if(a!==undefined){a.push(w)}else{a=[w]}}return{id:v,formElements:S,annotationPath:c,isVisible:p,entitySet:m,actions:a}}c.getFormContainer=_;function k(e,t,a){var n;const o=[];(n=e.Facets)===null||n===void 0?void 0:n.forEach(e=>{if(e.$Type==="com.sap.vocabularies.UI.v1.CollectionFacet"){return}o.push(_(e,t,a))});return o}function j(e){return e.$Type==="com.sap.vocabularies.UI.v1.ReferenceFacet"}c.isReferenceFacet=j;function H(e,t,a,n){var o,i,r;switch(e.$Type){case"com.sap.vocabularies.UI.v1.CollectionFacet":return{id:p(e),useFormContainerLabels:true,hasFacetsNotPartOfPreview:e.Facets.some(e=>{var t,a,n;return((t=e.annotations)===null||t===void 0?void 0:(a=t.UI)===null||a===void 0?void 0:(n=a.PartOfPreview)===null||n===void 0?void 0:n.valueOf())===false}),formContainers:k(e,a,n),isVisible:t};case"com.sap.vocabularies.UI.v1.ReferenceFacet":return{id:p(e),useFormContainerLabels:false,hasFacetsNotPartOfPreview:((o=e.annotations)===null||o===void 0?void 0:(i=o.UI)===null||i===void 0?void 0:(r=i.PartOfPreview)===null||r===void 0?void 0:r.valueOf())===false,formContainers:[_(e,a,n)],isVisible:t};default:throw new Error("Cannot create form based on ReferenceURLFacet")}}c.createFormDefinition=H;return c},false);
//# sourceMappingURL=Form.js.map
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/TitleHelper","sap/fe/macros/CommonHelper","sap/fe/macros/field/FieldTemplating","sap/m/library","sap/ui/base/ManagedObject","sap/ui/model/odata/v4/AnnotationHelper"],function(e,t,n,o,i,r,a,s,u){"use strict";var c={};var l=r.getTextBindingExpression;var d=r.formatValueRecursively;var f=r.addTextArrangementToBindingExpression;var g=o.getTitleBindingExpression;var p=t.or;var v=t.not;var m=t.ifElse;var b=t.getExpressionFromAnnotation;var S=t.equal;var y=t.constant;var E=t.compileExpression;var A=t.and;var O=e.UI;var C=e.Draft;const $=a.ButtonType;const x=function(e,t,n){return g(e,l,undefined,n,t)};c.getExpressionForTitle=x;const D=function(e,t){var n,o,i,r,a,s,u,c,l;let g=b(t===null||t===void 0?void 0:(n=t.Description)===null||n===void 0?void 0:n.Value);if(t!==null&&t!==void 0&&(o=t.Description)!==null&&o!==void 0&&(i=o.Value)!==null&&i!==void 0&&(r=i.$target)!==null&&r!==void 0&&(a=r.annotations)!==null&&a!==void 0&&(s=a.Common)!==null&&s!==void 0&&(u=s.Text)!==null&&u!==void 0&&(c=u.annotations)!==null&&c!==void 0&&(l=c.UI)!==null&&l!==void 0&&l.TextArrangement){g=f(g,e)}return E(d(g,e))};c.getExpressionForDescription=D;const h=function(e,t){var n;const o=e.resourceModel.getText("T_OP_OBJECT_PAGE_SAVE");const i=e.resourceModel.getText("T_OP_OBJECT_PAGE_CREATE");let r;if((n=t.startingEntitySet.annotations.Session)!==null&&n!==void 0&&n.StickySessionSupported){r=m(O.IsCreateMode,i,o)}else{r=m(C.IsNewObject,i,o)}return E(r)};c.getExpressionForSaveButton=h;const T=function(e){const t=["Primary","DefaultApply","Secondary","ForAction","ForNavigation","SwitchToActiveObject","SwitchToDraftObject","DraftActions","Copy"];return t.indexOf(e.type)<0};c.isManifestAction=T;const F=function(e){var t,n,o;const i=(t=e.targetEntityType)===null||t===void 0?void 0:(n=t.annotations)===null||n===void 0?void 0:(o=n.UI)===null||o===void 0?void 0:o.Identification;const r=(i===null||i===void 0?void 0:i.filter(e=>e.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAction"&&e.Criticality))||[];const a=r.length?r.map(e=>{var t,n;const o=b(e.Criticality);return A(v(S(b((t=e.annotations)===null||t===void 0?void 0:(n=t.UI)===null||n===void 0?void 0:n.Hidden),true)),p(S(o,"UI.CriticalityType/Negative"),S(o,"1"),S(o,1),S(o,"UI.CriticalityType/Positive"),S(o,"3"),S(o,3)))}):[y(false)];return E(m(p(...a),$.Default,$.Emphasized))};c.buildEmphasizedButtonExpression=F;const I=function(e){const t=u.getNavigationPath(e);if(t){return"{path:'"+t+"'}"}else{return"{path: ''}"}};c.getElementBinding=I;const P=function(e){if(e["@com.sap.vocabularies.Common.v1.DraftRoot"]&&e["@com.sap.vocabularies.Common.v1.DraftRoot"]["EditAction"]){return true}else{return false}};c.checkDraftState=P;const B=function(e){if(P(e)){return"{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( ${ui>/isEditable} && !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }"}else{return false}};c.getSwitchToActiveVisibility=B;const V=function(e){if(P(e)){return"{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !(${ui>/isEditable}) && !${ui>createMode} && ${HasDraftEntity} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }"}else{return false}};c.getSwitchToDraftVisibility=V;const w=function(e){if(P(e)){return"{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }"}else{return false}};c.getSwitchDraftAndActiveVisibility=w;const M=function(e,t){let n;if(e&&e.length){n=e.find(function(e){return e.type===t})}return n};c._findAction=M;const N=function(e){const t=M(e,"Secondary");return t?t.enabled:"true"};c.getDeleteCommandExecutionEnabled=N;const j=function(e){const t=M(e,"Secondary");return t?t.visible:"true"};c.getDeleteCommandExecutionVisible=j;const G=function(e){const t=M(e,"Primary");return t?t.visible:"false"};c.getEditCommandExecutionVisible=G;const H=function(e){const t=M(e,"Primary");return t?t.enabled:"false"};c.getEditCommandExecutionEnabled=H;const Q=function(e){const t=e.getPath();const n=t.split("/");const o="/"+n[1];const i=e.getObject(o+"@");const r=i.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftRoot");const a=i.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftNode");const s=i.hasOwnProperty("@com.sap.vocabularies.Session.v1.StickySessionSupported");let u;if(r){u=e.getObject(`${o}@com.sap.vocabularies.Common.v1.DraftRoot/EditAction`)}else if(a){u=e.getObject(`${o}@com.sap.vocabularies.Common.v1.DraftNode/EditAction`)}else if(s){u=e.getObject(`${o}@com.sap.vocabularies.Session.v1.StickySessionSupported/EditAction`)}return!u?u:`${o}/${u}`};c.getEditAction=Q;const U=function(e,t){let n,o,i;if(e&&e["@Org.OData.Core.V1.Computed"]){n=e["@Org.OData.Core.V1.Computed"].Bool?e["@Org.OData.Core.V1.Computed"].Bool=="true":true}if(e&&e["@Org.OData.Core.V1.Immutable"]){o=e["@Org.OData.Core.V1.Immutable"].Bool?e["@Org.OData.Core.V1.Immutable"].Bool=="true":true}i=n||o;if(t){i=i||t=="com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly"}if(i){return true}else{return false}};c.isReadOnlyFromStaticAnnotations=U;const R=function(e){let t;if(e){if(s.bindingParser(e)){t="%"+e+" === 1 "}}if(t){return"{= "+t+"? false : true }"}else{return undefined}};c.readOnlyExpressionFromDynamicAnnotations=R;const k=function(e,t,n){if(e){if(e["targetOutbound"]&&e["targetOutbound"]["outbound"]||e["targetOutbound"]&&e["targetOutbound"]["outbound"]&&e["targetSections"]){return".handlers.onDataPointTitlePressed($controller, ${$source>/},'"+JSON.stringify(t)+"','"+e["targetOutbound"]["outbound"]+"','"+n+"' )"}else if(e["targetSections"]){return".handlers.navigateToSubSection($controller, '"+JSON.stringify(e["targetSections"])+"')"}else{return undefined}}};c.getExpressionForMicroChartTitlePress=k;const _=function(e){if(e&&(e["targetOutbound"]||e["targetOutbound"]&&e["targetSections"])){return"External"}else if(e&&e["targetSections"]){return"InPage"}else{return"None"}};c.getMicroChartTitleAsLink=_;const J=function(e,t,n){const o=e[t],i=["Heroes","Decoration","Workers","LongRunners"];let r=n;if(o&&o.requestGroupId&&i.some(function(e){return e===o.requestGroupId})){r="$auto."+o.requestGroupId}return r};c.getGroupIdFromConfig=J;const L=function(e,t){const n=J(e,t);let o;if(n){o="{ path : '', parameters : { $$groupId : '"+n+"' } }"}return o};c.getBindingWithGroupIdFromConfig=L;const q=function(e){return e&&e.length===1&&!!e[0].isValueMultilineText};c.doesFieldGroupContainOnlyOneMultiLineDataField=q;const z=function(e){return e.showBreadCrumbs&&e.fclEnabled!==undefined?"{fclhelper>/breadCrumbIsVisible}":e.showBreadCrumbs};c.getVisibleExpressionForBreadcrumbs=z;const W=function(e){let t="!${ui>createMode}";if(e.fclEnabled){t="${fclhelper>/showShareIcon} && "+t}if(e.isShareButtonVisibleForMyInbox===false){return"false"}return"{= "+t+" }"};c.getShareButtonVisibility=W;const K=function(e,t,n,o){const i=e?U(e,n):true;const r=R(n);if(!i&&!r){return true}const a=t?U(t,o):true;const s=R(o);if(!a&&!s){return true}if(i&&a&&!r&&!s){return false}if(r&&!s){return r}else if(!r&&s){return s}else{return X(n,o)}};c.getVisiblityOfHeaderInfo=K;const X=function(e,t){return"{= %"+e+" === 1 ? ( %"+t+" === 1 ? false : true ) : true }"};c.combineTitleAndDescriptionExpression=X;const Y=function(e,t){const o="${$view>/getBindingContext}",r="${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedHeading/getItems/1/getText}",a="${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedContent/0/getItems/0/getText}";const s=t&&t.context;const u=s.getPath();const c=u.split("/").filter(n.filterOutNavPropBinding);const l=c.length>1?s.getModel().getObject(`/${c.join("/")}@sapui.name`):c[0];const d={title:r,entitySetName:i.addSingleQuotes(l),description:a};return i.generateFunction(".editFlow.deleteDocument",o,i.objectToString(d))};Y.requiresIContext=true;c.getPressExpressionForDelete=Y;const Z=function(e,t,n){const o=i.addSingleQuotes(e&&e.Action),r=e&&e.InvocationGrouping&&e.InvocationGrouping["$EnumMember"],a=r==="com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"?"ChangeSet":"Isolated";const s={contexts:"${$view>/getBindingContext}",entitySetName:i.addSingleQuotes(t),invocationGrouping:i.addSingleQuotes(a),model:"${$source>/}.getModel()",label:i.addSingleQuotes(e&&e.Label,true),isNavigable:n&&n.isNavigable,defaultValuesExtensionFunction:n&&n.defaultValuesExtensionFunction?`'${n.defaultValuesExtensionFunction}'`:undefined};return i.generateFunction(".handlers.onCallAction","${$view>/}",o,i.objectToString(s))};c.getPressExpressionForEdit=Z;const ee=function(e,t,n){const o=i.addSingleQuotes(e.Action),r=e.InvocationGrouping,a=r==="UI.OperationGroupingType/ChangeSet"?"ChangeSet":"Isolated";const s={contexts:"${$view>/#fe::ObjectPage/}.getBindingContext()",entitySetName:i.addSingleQuotes(t),invocationGrouping:i.addSingleQuotes(a),model:"${$source>/}.getModel()",label:i.addSingleQuotes(e.Label,true),isNavigable:n&&n.isNavigable,defaultValuesExtensionFunction:n&&n.defaultValuesExtensionFunction?`'${n.defaultValuesExtensionFunction}'`:undefined};return i.generateFunction(".handlers.onCallAction","${$view>/}",o,i.objectToString(s))};c.getPressExpressionForFooterAnnotationAction=ee;const te=function(e,t,n,o,r,a,s){const u=i.addSingleQuotes(e&&e.Action),c=e&&e.InvocationGrouping&&e.InvocationGrouping["$EnumMember"],l=c==="com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"?"ChangeSet":"Isolated";const d={contexts:"${$view>/#fe::ObjectPage/}.getBindingContext()",entitySetName:t?i.addSingleQuotes(t):"",invocationGrouping:i.addSingleQuotes(l),model:"${$source>/}.getModel()",label:i.addSingleQuotes(e===null||e===void 0?void 0:e.Label,true),isNavigable:n===null||n===void 0?void 0:n.isNavigable,defaultValuesExtensionFunction:n!==null&&n!==void 0&&n.defaultValuesExtensionFunction?`'${n.defaultValuesExtensionFunction}'`:undefined};const f={positiveActionVisible:o,positiveActionEnabled:r,editActionVisible:a,editActionEnabled:s};return i.generateFunction(".handlers.onPrimaryAction","$controller","${$view>/}","${$view>/getBindingContext}",u,i.objectToString(d),i.objectToString(f))};c.getPressExpressionForPrimaryAction=te;const ne=function(e,t){if(t&&t.Facet&&t.Facet.targetAnnotationType==="DataPoint"){return L(e,t.Facet.targetAnnotationValue)}};c.getStashableHBoxBinding=ne;const oe=function(e,t){if(e){if(e["targetOutbound"]&&e["targetOutbound"]["outbound"]){return".handlers.onDataPointTitlePressed($controller, ${$source>}, "+JSON.stringify(t)+","+JSON.stringify(e["targetOutbound"]["outbound"])+")"}else if(e["targetSections"]){return".handlers.navigateToSubSection($controller, '"+JSON.stringify(e["targetSections"])+"')"}else{return undefined}}};c.getPressExpressionForLink=oe;const ie=function(e){var t;if((e===null||e===void 0?void 0:(t=e.targetObject)===null||t===void 0?void 0:t.$Type)==="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"){return undefined}return"Bare"};c.getHeaderFormHboxRenderType=ie;function re(e,t,n,o){if(t.defaultAction){try{switch(t.defaultAction.type){case"ForAction":{return Z(n,o,t.defaultAction)}case"ForNavigation":{if(t.defaultAction.command){return"cmd:"+t.defaultAction.command}else{return t.defaultAction.press}}default:{if(t.defaultAction.command){return"cmd:"+t.defaultAction.command}if(t.defaultAction.noWrap){return t.defaultAction.press}else{return i.buildActionWrapper(t.defaultAction,{id:"forTheObjectPage"})}}}}catch(e){return"binding for the default action is not working as expected"}}return undefined}c.getDefaultActionHandler=re;function ae(e){return e.isPartOfPreview===true||e.presentation.visualizations[0].type!=="Table"}c.isVisualizationIsPartOfPreview=ae;return c},false);
//# sourceMappingURL=ObjectPageTemplating.js.map
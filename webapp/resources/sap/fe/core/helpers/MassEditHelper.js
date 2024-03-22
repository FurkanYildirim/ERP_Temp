/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/helpers/BindingToolkit","sap/fe/core/helpers/TypeGuards","sap/fe/core/library","sap/fe/core/TemplateModel","sap/fe/core/templating/DataModelPathHelper","sap/fe/core/templating/PropertyHelper","sap/fe/macros/field/FieldTemplating","sap/fe/macros/table/TableHelper","sap/m/Button","sap/m/Dialog","sap/m/MessageToast","sap/ui/core/Core","sap/ui/core/Fragment","sap/ui/core/util/XMLPreprocessor","sap/ui/core/XMLTemplateProcessor","sap/ui/mdc/enum/EditMode","sap/ui/model/json/JSONModel","../controllerextensions/messageHandler/messageHandling","../controls/Any","../converters/MetaModelConverter","../templating/FieldControlHelper","../templating/UIFormatters"],function(e,t,n,o,a,i,r,s,l,u,c,d,p,f,g,y,P,h,v,x,m,E,b,O){"use strict";var T=O.isMultiValueField;var M=O.getRequiredExpression;var C=O.getEditMode;var F=b.isReadOnlyExpression;var V=E.getInvolvedDataModelObjects;var D=E.convertMetaModelContext;var S=l.setEditStyleProperties;var $=l.getTextBinding;var B=s.hasValueHelpWithFixedValues;var k=s.hasValueHelp;var I=s.hasUnit;var j=s.hasCurrency;var A=s.getAssociatedUnitPropertyPath;var w=s.getAssociatedUnitProperty;var _=r.getRelativePaths;var H=r.enhanceDataModelPath;var R=o.isProperty;var L=n.pathInModel;var N=n.or;var U=n.not;var G=n.ifElse;var Q=n.constant;var q=n.compileExpression;const K={initLastLevelOfPropertyPath:function(e,t){let n;let o=0;const a=e.split("/");let i="";a.forEach(function(a){if(!t[a]&&o===0){t[a]={};n=t[a];i=i+a;o++}else if(!n[a]){i=`${i}/${a}`;if(i!==e){n[a]={};n=n[a]}else{n[a]=[]}}});return n},getUniqueValues:function(e,t,n){return e!=undefined&&e!=null?n.indexOf(e)===t:undefined},getValueForMultiLevelPath:function(e,t){let n;if(e&&e.indexOf("/")>0){const o=e.split("/");o.forEach(function(e){n=t&&t[e]?t[e]:n&&n[e]})}return n},getDefaultSelectionPathComboBox:function(e,t){let n;if(t&&e.length>0){const o=e,a=[];o.forEach(function(e){const n=e.getObject();const o=t.indexOf("/")>-1&&n.hasOwnProperty(t.split("/")[0]);if(e&&(n.hasOwnProperty(t)||o)){a.push(e.getObject(t))}});const i=a.filter(K.getUniqueValues);if(i.length>1){n=`Default/${t}`}else if(i.length===0){n=`Empty/${t}`}else if(i.length===1){n=`${t}/${i[0]}`}}return n},getHiddenValueForContexts:function(e,t){if(e&&e.$Path){return!t.some(function(t){return t.getObject(e.$Path)===false})}return e},getInputType:function(e,t,n){const o={};let a;if(e){S(o,t,n,true);a=(o===null||o===void 0?void 0:o.editStyle)||""}const i=a&&["DatePicker","TimePicker","DateTimePicker","RatingIndicator"].indexOf(a)===-1&&!T(n)&&!B(e);return(i||"")&&a},getIsFieldGrp:function(e){return e&&e.$Type==="com.sap.vocabularies.UI.v1.DataFieldForAnnotation"&&e.Target&&e.Target.value&&e.Target.value.indexOf("FieldGroup")>-1},getTextPath:function(e,t,n){let o;if(t&&(t.path||t.parameters&&t.parameters.length)&&e){if(t.path&&n==="Description"){o=t.path}else if(t.parameters){t.parameters.forEach(function(t){if(t.path&&t.path!==e){o=t.path}})}}return o},prepareDataForDialog:function(e,n,o){const a=e&&e.getModel().getMetaModel(),i=e.data("metaPath"),r=K.getTableFields(e),s=a.getContext(`${i}/@`),l=a.getContext(i),u=V(s);const c=new v;let d;let p;let f;let g;let y;let P;r.forEach(function(e){if(!e.annotationPath){return}const r=e.dataProperty;if(r){var s,c,v,x,m,E,b,O,T;let S=r&&a.getObject(`${i}/${r}@`);p=e.label||S&&S["@com.sap.vocabularies.Common.v1.Label"]||r;if(u){u.targetObject=u.targetEntityType.entityProperties.filter(function(e){return e.name===r})}u.targetObject=u.targetObject[0]||{};P=$(u,{},true)||{};const B=a.getContext(e.annotationPath),L=D(B),N=a.getContext(`${i}/${r}@`),U=N&&N.getInterface();let G=V(B,l);if((L===null||L===void 0?void 0:(s=L.Value)===null||s===void 0?void 0:(c=s.path)===null||c===void 0?void 0:c.length)>0){G=H(G,r)}const q=K.getHiddenValueForContexts(B&&B.getObject()["@com.sap.vocabularies.UI.v1.Hidden"],n)||false;const X=S&&S["@com.sap.vocabularies.UI.v1.IsImageURL"];U.context={getModel:function(){return U.getModel()},getPath:function(){return`${i}/${r}`}};S=R(L)?L:(L===null||L===void 0?void 0:(v=L.Value)===null||v===void 0?void 0:v.$target)??(L===null||L===void 0?void 0:(x=L.Target)===null||x===void 0?void 0:x.$target);const z=S&&S.term&&S.term==="com.sap.vocabularies.UI.v1.Chart";const J=!!L.Action;const Y=K.getIsFieldGrp(L);if(X||q||z||J||Y){return}g=(j(S)||I(S))&&A(S)||"";const W=g&&w(S);f=k(S);y=W&&k(W);const Z=(f||y)&&(((m=S)===null||m===void 0?void 0:(E=m.annotations)===null||E===void 0?void 0:(b=E.Common)===null||b===void 0?void 0:b.ValueListRelevantQualifiers)||W&&(W===null||W===void 0?void 0:(O=W.annotations)===null||O===void 0?void 0:(T=O.Common)===null||T===void 0?void 0:T.ValueListRelevantQualifiers));if(Z){return}const ee=S&&S.Value?S.Value:S;const te=C(ee,G,false,false,L,Q(true));const ne=Object.keys(h);const oe=!!te&&ne.includes(te);const ae=!!te&&(oe&&te===h.Editable||!oe);const ie=r.includes("/")&&f;if(!ae||ie){return}const re=K.getInputType(S,L,G);if(re){const e=_(G);const a=F(S,e);const s=t.computeDisplayMode(N.getObject());const l=f?f:false;const u=y&&!g.includes("/")?y:false;const c=g&&!r.includes("/")?g:false;d={label:p,dataProperty:r,isValueHelpEnabled:f?f:false,unitProperty:c,isFieldRequired:M(S,L,true,false,{},G),defaultSelectionPath:r?K.getDefaultSelectionPathComboBox(n,r):false,defaultSelectionUnitPath:g?K.getDefaultSelectionPathComboBox(n,g):false,entitySet:i,display:s,descriptionPath:K.getTextPath(r,P,s),nullable:S.nullable!==undefined?S.nullable:true,isPropertyReadOnly:a!==undefined?a:false,inputType:re,editMode:ae?te:undefined,propertyInfo:{hasVH:l,runtimePath:"fieldsInfo>/values/",relativePath:r,propertyFullyQualifiedName:S.fullyQualifiedName,propertyPathForValueHelp:`${i}/${r}`},unitInfo:c&&{hasVH:u,runtimePath:"fieldsInfo>/unitData/",relativePath:c,propertyPathForValueHelp:`${i}/${c}`}};o.push(d)}}});c.setData(o);return c},getTableFields:function(e){const t=e&&e.getColumns()||[];const n=e&&e.getParent().getTableDefinition().columns;return t.map(function(e){const t=e&&e.getDataProperty(),o=n&&n.filter(function(e){return e.name===t&&e.type==="Annotation"});return{dataProperty:t,label:e.getHeader(),annotationPath:o&&o[0]&&o[0].annotationPath}})},getDefaultTextsForDialog:function(e,t,n){const o=n.data("displayModePropertyBinding")==="true";return{keepExistingPrefix:"< Keep",leaveBlankValue:"< Leave Blank >",clearFieldValue:"< Clear Values >",massEditTitle:e.getText("C_MASS_EDIT_DIALOG_TITLE",t.toString()),applyButtonText:o?e.getText("C_MASS_EDIT_SAVE_BUTTON_TEXT"):e.getText("C_MASS_EDIT_APPLY_BUTTON_TEXT"),useValueHelpValue:"< Use Value Help >",cancelButtonText:e.getText("C_COMMON_OBJECT_PAGE_CANCEL"),noFields:e.getText("C_MASS_EDIT_NO_EDITABLE_FIELDS"),okButtonText:e.getText("C_COMMON_DIALOG_OK")}},setDefaultValuesToDialog:function(e,t,n,o){const a=o?n.unitProperty:n.dataProperty,i=n.inputType,r=n.isFieldRequired;const s="Values";e.defaultOptions=e.defaultOptions||[];const l=e.selectOptions&&e.selectOptions.length>0;const u={text:`${t.keepExistingPrefix} ${s} >`,key:`Default/${a}`};if(i==="CheckBox"){const t={text:"No",key:`${a}/false`,textInfo:{value:false}};const n={text:"Yes",key:`${a}/true`,textInfo:{value:true}};e.unshift(t);e.defaultOptions.unshift(t);e.unshift(n);e.defaultOptions.unshift(n);e.unshift(u);e.defaultOptions.unshift(u)}else{var c,d;if(n!==null&&n!==void 0&&(c=n.propertyInfo)!==null&&c!==void 0&&c.hasVH||n!==null&&n!==void 0&&(d=n.unitInfo)!==null&&d!==void 0&&d.hasVH&&o){const n={text:t.useValueHelpValue,key:`UseValueHelpValue/${a}`};e.unshift(n);e.defaultOptions.unshift(n)}if(l){if(r!=="true"&&!o){const n={text:t.clearFieldValue,key:`ClearFieldValue/${a}`};e.unshift(n);e.defaultOptions.unshift(n)}e.unshift(u);e.defaultOptions.unshift(u)}else{const n={text:t.leaveBlankValue,key:`Default/${a}`};e.unshift(n);e.defaultOptions.unshift(n)}}},getTextArrangementInfo:function(t,n,o,a){let i=a.getObject(t),r,s;if(n&&t){switch(o){case"Description":r=a.getObject(n)||"";s=r;break;case"Value":i=a.getObject(t)||"";s=i;break;case"ValueDescription":i=a.getObject(t)||"";r=a.getObject(n)||"";s=r?`${i} (${r})`:i;break;case"DescriptionValue":i=a.getObject(t)||"";r=a.getObject(n)||"";s=r?`${r} (${i})`:i;break;default:e.info(`Display Property not applicable: ${t}`);break}}return{textArrangement:o,valuePath:t,descriptionPath:n,value:i,description:r,fullText:s}},isEditable:function(e){const t=e.getBinding("any");const n=t.getExternalValue();return n===h.Editable},onContextEditableChange:function(e,t){const n=e.getProperty(`/values/${t}/objectsForVisibility`)||[];const o=n.some(K.isEditable);if(o){e.setProperty(`/values/${t}/visible`,o)}},updateOnContextChange:function(e,t,n,o){const a=e.getBinding("any");o.objectsForVisibility=o.objectsForVisibility||[];o.objectsForVisibility.push(e);a===null||a===void 0?void 0:a.attachChange(K.onContextEditableChange.bind(null,t,n))},getBoundObject:function(e,t){const n=new m({any:e});const o=t.getModel();n.setModel(o);n.setBindingContext(t);return n},getFieldVisiblity:function(e,t,n,o,a){const i=K.getBoundObject(e,a);const r=K.isEditable(i);if(!r){K.updateOnContextChange(i,t,n,o)}return r},setRuntimeModelOnDialog:function(e,t,n,o){const a=[];const i=[];const r=[];const s=[];const l=[];const u={values:a,unitData:i,results:r,readablePropertyData:l,selectedKey:undefined,textPaths:s,noFields:n.noFields};const c=new v(u);t.forEach(function(t){let n;let r;let l;const u={};const c={};if(t.dataProperty&&t.dataProperty.indexOf("/")>-1){const o=K.initLastLevelOfPropertyPath(t.dataProperty,a);const i=t.dataProperty.split("/");for(const a of e){const e=a.getObject(t.dataProperty);r=`${t.dataProperty}/${e}`;if(!u[r]&&o[i[i.length-1]]){n=K.getTextArrangementInfo(t.dataProperty,t.descriptionPath,t.display,a);o[i[i.length-1]].push({text:n&&n.fullText||e,key:r,textInfo:n});u[r]=e}}o[i[i.length-1]].textInfo={descriptionPath:t.descriptionPath,valuePath:t.dataProperty,displayMode:t.display}}else{a[t.dataProperty]=a[t.dataProperty]||[];a[t.dataProperty]["selectOptions"]=a[t.dataProperty]["selectOptions"]||[];if(t.unitProperty){i[t.unitProperty]=i[t.unitProperty]||[];i[t.unitProperty]["selectOptions"]=i[t.unitProperty]["selectOptions"]||[]}for(const o of e){const e=o.getObject();r=`${t.dataProperty}/${e[t.dataProperty]}`;if(t.dataProperty&&e[t.dataProperty]&&!u[r]){if(t.inputType!="CheckBox"){n=K.getTextArrangementInfo(t.dataProperty,t.descriptionPath,t.display,o);const i={text:n&&n.fullText||e[t.dataProperty],key:r,textInfo:n};a[t.dataProperty].push(i);a[t.dataProperty]["selectOptions"].push(i)}u[r]=e[t.dataProperty]}if(t.unitProperty&&e[t.unitProperty]){l=`${t.unitProperty}/${e[t.unitProperty]}`;if(!c[l]){if(t.inputType!="CheckBox"){n=K.getTextArrangementInfo(t.unitProperty,t.descriptionPath,t.display,o);const a={text:n&&n.fullText||e[t.unitProperty],key:l,textInfo:n};i[t.unitProperty].push(a);i[t.unitProperty]["selectOptions"].push(a)}c[l]=e[t.unitProperty]}}}a[t.dataProperty].textInfo={descriptionPath:t.descriptionPath,valuePath:t.dataProperty,displayMode:t.display};if(Object.keys(u).length===1){o.setProperty(t.dataProperty,r&&u[r])}if(Object.keys(c).length===1){o.setProperty(t.unitProperty,l&&c[l])}}s[t.dataProperty]=t.descriptionPath?[t.descriptionPath]:[]});t.forEach(function(t){let o={};if(t.dataProperty.indexOf("/")>-1){const e=K.getValueForMultiLevelPath(t.dataProperty,a);if(!e){e.push({text:n.leaveBlankValue,key:`Empty/${t.dataProperty}`})}else{K.setDefaultValuesToDialog(e,n,t)}o=e}else if(a[t.dataProperty]){a[t.dataProperty]=a[t.dataProperty]||[];K.setDefaultValuesToDialog(a[t.dataProperty],n,t);o=a[t.dataProperty]}if(i[t.unitProperty]&&i[t.unitProperty].length){K.setDefaultValuesToDialog(i[t.unitProperty],n,t,true);i[t.unitProperty].textInfo={};i[t.unitProperty].selectedKey=K.getDefaultSelectionPathComboBox(e,t.unitProperty);i[t.unitProperty].inputType=t.inputType}else if(t.dataProperty&&a[t.dataProperty]&&!a[t.dataProperty].length||t.unitProperty&&i[t.unitProperty]&&!i[t.unitProperty].length){const o=a[t.dataProperty]&&a[t.dataProperty].some(function(e){return e.text==="< Clear Values >"||e.text==="< Leave Blank >"});if(t.dataProperty&&!o){a[t.dataProperty].push({text:n.leaveBlankValue,key:`Empty/${t.dataProperty}`})}const r=i[t.unitProperty]&&i[t.unitProperty].some(function(e){return e.text==="< Clear Values >"||e.text==="< Leave Blank >"});if(t.unitProperty){if(!r){i[t.unitProperty].push({text:n.leaveBlankValue,key:`Empty/${t.unitProperty}`})}i[t.unitProperty].textInfo={};i[t.unitProperty].selectedKey=K.getDefaultSelectionPathComboBox(e,t.unitProperty);i[t.unitProperty].inputType=t.inputType}}if(t.isPropertyReadOnly&&typeof t.isPropertyReadOnly==="boolean"){l.push({property:t.dataProperty,value:t.isPropertyReadOnly,type:"Default"})}else if(t.isPropertyReadOnly&&t.isPropertyReadOnly.operands&&t.isPropertyReadOnly.operands[0]&&t.isPropertyReadOnly.operands[0].operand1&&t.isPropertyReadOnly.operands[0].operand2){l.push({property:t.dataProperty,propertyPath:t.isPropertyReadOnly.operands[0].operand1.path,propertyValue:t.isPropertyReadOnly.operands[0].operand2.value,type:"Path"})}if(t.editMode){o.visible=t.editMode===h.Editable||e.some(K.getFieldVisiblity.bind(K,t.editMode,c,t.dataProperty,o))}else{o.visible=true}o.selectedKey=K.getDefaultSelectionPathComboBox(e,t.dataProperty);o.inputType=t.inputType;o.unitProperty=t.unitProperty});return c},getDialogContext:function(e,t){let n=t===null||t===void 0?void 0:t.getBindingContext();if(!n){const t=e.getModel();const o=e.getRowBinding();const a=t.bindList(o.getPath(),o.getContext(),[],[],{$$updateGroupId:"submitLater"});a.refreshInternal=function(){};n=a.create({},true)}return n},onDialogOpen:function(e){const t=e.getSource();const n=t.getModel("fieldsInfo");n.setProperty("/isOpen",true)},closeDialog:function(e){e.close();e.destroy()},messageHandlingForMassEdit:async function(e,t,n,o,i,r){var s,l,u,c;const d=a.DraftStatus;const g=f.getLibraryResourceBundle("sap.fe.core");(s=n.getView())===null||s===void 0?void 0:(l=s.getBindingContext("internal"))===null||l===void 0?void 0:l.setProperty("getBoundMessagesForMassEdit",true);n.messageHandler.showMessages({onBeforeShowMessage:function(o,a){a.fnGetMessageSubtitle=x.setMessageSubtitle.bind({},e,t);const s=[];o.forEach(function(e){if(!e.getTarget()){s.push(e)}});if(i.length>0&&r.length===0){n.editFlow.setDraftStatus(d.Saved);const e=g.getText("C_MASS_EDIT_SUCCESS_TOAST");p.show(e)}else if(r.length<e.getSelectedContexts().length){n.editFlow.setDraftStatus(d.Saved)}else if(r.length===e.getSelectedContexts().length){n.editFlow.setDraftStatus(d.Clear)}if(n.getModel("ui").getProperty("/isEditable")&&s.length===0){a.showMessageBox=false;a.showMessageDialog=false}return a}});if(o.isOpen()){var y,P;K.closeDialog(o);(y=n.getView())===null||y===void 0?void 0:(P=y.getBindingContext("internal"))===null||P===void 0?void 0:P.setProperty("skipPatchHandlers",false)}(u=n.getView())===null||u===void 0?void 0:(c=u.getBindingContext("internal"))===null||c===void 0?void 0:c.setProperty("getBoundMessagesForMassEdit",false)},getSideEffectDataForKey:function(e,t,n,o){const a=e.getProperty("$Type");const i={};o.forEach(e=>{const o=e.keyValue;const r=t.getSideEffectsService();const s=r.computeFieldGroupIds(a,e.propertyFullyQualifiedName??"")??[];i[o]=n._sideEffects.getSideEffectsMapForFieldGroups(s)});return i},fnGetPathForSourceProperty:function(e,t,n){const o=e.indexOf("/")>0?"/"+t+"/"+e.substr(0,e.lastIndexOf("/")+1)+"@sapui.name":false,a=!o?Promise.resolve(t):n.requestObject(o);e=o?e.substr(e.lastIndexOf("/")+1):e;return{sPath:e,pOwnerEntity:a,sNavigationPath:o}},fnGetEntityTypeOfOwner:function(e,t,n,o,a){const i=n.getProperty("$Type");const{$Type:r,$Partner:s}=e.getObject(`${n}/${t}`);if(s){const t=e.getObject(`/${r}/${s}`);if(t){const e=t["$Type"];if(e!==i){a.push(o)}}}else{a.push(o)}return a},fnGetTargetsForMassEdit:function(e,t,n,o){const{targetProperties:a,targetEntities:i}=e;const r=[];let s=[];const l=t.getProperty("$Type");if(n===l){i===null||i===void 0?void 0:i.forEach(e=>{e=e["$NavigationPropertyPath"];let n;if(e.includes("/")){n=e.split("/")[0]}else{n=e}s=K.fnGetEntityTypeOfOwner(o,n,t,e,s)})}if(a.length){a.forEach(e=>{const{pOwnerEntity:a}=K.fnGetPathForSourceProperty(e,n,o);r.push(a.then(n=>{if(n===l){s.push(e)}else if(e.includes("/")){const n=e.split("/")[0];s=K.fnGetEntityTypeOfOwner(o,n,t,e,s)}return Promise.resolve(s)}))})}else{r.push(Promise.resolve(s))}return Promise.all(r)},checkIfEntityExistsAsTargetEntity:(e,t)=>{const n=t.getProperty("$Type");const o=Object.values(e).filter(e=>e.name.indexOf(n)==-1);const a=t.getPath().split("/").pop();const i=o.filter(e=>{const t=e.sideEffects.targetEntities;return t!==null&&t!==void 0&&t.filter(e=>e["$NavigationPropertyPath"]===a).length?e:false});return i.length},handleMassEditFieldUpdateAndRequestSideEffects:async function(e){const{oController:n,oFieldPromise:o,sideEffectsMap:a,textPaths:i,groupId:r,key:s,oEntitySetContext:l,oMetaModel:c,oSelectedContext:d,deferredTargetsForAQualifiedName:p}=e;const f=[o];const g=l.getProperty("$Type");const y=t.getAppComponent(n.getView());const P=y.getSideEffectsService();const h=K.checkIfEntityExistsAsTargetEntity(a,l);if(a){const e=Object.keys(a);const t=Object.values(a);const o={};p[s]={};for(const[a,i]of t.entries()){const t=e[a];const y=t.split("#")[0];const P=n._sideEffects.getContextForSideEffects(d,y);i.context=P;const v=n._sideEffects.getRegisteredFailedRequests();const x=v[P.getPath()];n._sideEffects.unregisterFailedSideEffectsForAContext(P);let m=[i.sideEffects];m=x&&x.length?m.concat(x):m;o[P]={};for(const e of m){if(!o[P].hasOwnProperty(e.fullyQualifiedName)){o[P][e.fullyQualifiedName]=true;let t=[],a=[],i;const d=async function(e){const{targetProperties:n,targetEntities:o}=e;const r=e.fullyQualifiedName.split("@")[0];const d=await K.fnGetTargetsForMassEdit(e,l,r,c);t=d[0];a=(n||[]).concat(o||[]);const f=e.triggerAction;const y=a.filter(e=>!t.includes(e));p[s][e.fullyQualifiedName]={aTargets:y,oContext:P,mSideEffect:e};if(f&&r===g){const t=u._isStaticAction(c.getObject(`/${f}`),f);if(!t){i=f}else{p[s][e.fullyQualifiedName]["TriggerAction"]=f}}else{p[s][e.fullyQualifiedName]["TriggerAction"]=f}if(h){t=[]}return{aTargets:t,TriggerAction:i}};f.push(n._sideEffects.requestSideEffects(e,P,r,d))}}}}if(i!==null&&i!==void 0&&i[s]&&i[s].length){f.push(P.requestSideEffects(i[s],d,r))}return Promise.allSettled(f)},createDialog:async function(n,o,a){const r="sap/fe/core/controls/massEdit/MassEditDialog",s=[],l=f.getLibraryResourceBundle("sap.fe.core"),u=K.getDefaultTextsForDialog(l,o.length,n),p=K.prepareDataForDialog(n,o,s),h=K.getDialogContext(n),v=K.setRuntimeModelOnDialog(o,s,u,h),m=n.getModel(),E=m.getMetaModel(),b=new i(p.getData(),E);const O=P.loadTemplate(r,"fragment");const T=await Promise.resolve(y.process(O,{name:r},{bindingContexts:{dataFieldModel:b.createBindingContext("/"),metaModel:E.createBindingContext("/"),contextPath:E.createBindingContext(E.getMetaPath(h.getPath()))},models:{dataFieldModel:b,metaModel:E,contextPath:E}}));const M=await g.load({definition:T});const C=new d({resizable:true,title:u.massEditTitle,content:[M],afterOpen:K.onDialogOpen,beginButton:new c({text:K.helpers.getExpBindingForApplyButtonTxt(u,p.getObject("/")),type:"Emphasized",press:async function(i){var r,s;x.removeBoundTransitionMessages();x.removeUnboundTransitionMessages();(r=a.getView())===null||r===void 0?void 0:(s=r.getBindingContext("internal"))===null||s===void 0?void 0:s.setProperty("skipPatchHandlers",true);const l=t.getAppComponent(a.getView());const u=i.getSource().getParent();const c=u.getModel("fieldsInfo");const d=c.getProperty("/results");const p=n&&n.getModel().getMetaModel(),f=n.data("metaPath"),g=p.getContext(f);const y=[];const P=c.getProperty("/textPaths");const h=c.getProperty("/readablePropertyData");let v;let m;const E=[];const b={};const O=o.length;const T={};const M=K.getSideEffectDataForKey(g,l,a,d);o.forEach(function(t,n){m=[];d.forEach(async function(o){if(!b.hasOwnProperty(o.keyValue)){b[o.keyValue]=0}if(M[o.keyValue]){m[o.keyValue]=M[o.keyValue]}if(h){h.some(function(e){if(o.keyValue===e.property){if(e.type==="Default"){return e.value===true}else if(e.type==="Path"&&e.propertyValue&&e.propertyPath){return t.getObject(e.propertyPath)===e.propertyValue}}})}v=`$auto.${n}`;const i=t.setProperty(o.keyValue,o.value,v).catch(function(n){y.push(t.getObject());e.error("Mass Edit: Something went wrong in updating entries.",n);b[o.keyValue]=b[o.keyValue]+1;return Promise.reject({isFieldUpdateFailed:true})});const r={oController:a,oFieldPromise:i,sideEffectsMap:M[o.keyValue],textPaths:P,groupId:v,key:o.keyValue,oEntitySetContext:g,oMetaModel:p,oSelectedContext:t,deferredTargetsForAQualifiedName:T};E.push(K.handleMassEditFieldUpdateAndRequestSideEffects(r))})});await Promise.allSettled(E).then(async function(){v=`$auto.massEditDeferred`;const e=[];const t=Object.values(T);const n=Object.keys(T);t.forEach((t,o)=>{const i=n[o];if(b[i]!==O){const n=Object.values(t);n.forEach(t=>{const{aTargets:n,oContext:o,TriggerAction:i,mSideEffect:r}=t;const s=function(){return n};const l=function(){return{aTargets:s(),TriggerAction:i}};e.push(a._sideEffects.requestSideEffects(r,o,v,l))})}})}).then(function(){K.messageHandlingForMassEdit(n,o,a,u,d,y)}).catch(e=>{K.closeDialog(C);return Promise.reject(e)})}}),endButton:new c({text:u.cancelButtonText,visible:K.helpers.hasEditableFieldsBinding(p.getObject("/"),true),press:function(e){const t=e.getSource().getParent();K.closeDialog(t)}})});C.setModel(v,"fieldsInfo");C.setModel(m);C.setBindingContext(h);return C},helpers:{getBindingExpForHasEditableFields:(e,t)=>{const n=e.reduce((e,t)=>N(e,L("/values/"+t.dataProperty+"/visible","fieldsInfo")),Q(false));return t?n:U(n)},getExpBindingForApplyButtonTxt:(e,t)=>{const n=K.helpers.getBindingExpForHasEditableFields(t,true);const o=G(n,Q(e.applyButtonText),Q(e.okButtonText));return q(o)},hasEditableFieldsBinding:(e,t)=>{const n=q(K.helpers.getBindingExpForHasEditableFields(e,t));if(n==="true"){return true}else if(n==="false"){return false}else{return n}}}};return K},false);
//# sourceMappingURL=MassEditHelper.js.map
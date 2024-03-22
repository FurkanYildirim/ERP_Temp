/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/collaboration/ActivitySync","sap/fe/core/controllerextensions/collaboration/CollaborationCommon","sap/fe/core/controllerextensions/editFlow/draft","sap/fe/core/helpers/KeepAliveHelper","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/ResourceModelHelper","sap/fe/macros/CommonHelper","sap/fe/macros/controls/FieldWrapper","sap/fe/macros/field/FieldAPI","sap/m/IllustratedMessage","sap/m/IllustratedMessageType","sap/m/library","sap/m/MessageBox","sap/m/ResponsivePopover","sap/ui/core/Core","sap/ui/core/IconPool","sap/ui/Device","sap/ui/model/Filter","sap/ui/unified/FileUploaderParameter","sap/ui/util/openWindow"],function(e,t,n,o,i,a,r,s,c,l,d,g,u,f,p,h,m,v,C,S,P,E){"use strict";var T=C.system;var _=s.getResourceModel;var F=o.Activity;function M(e){let n=e.getBindingContext().getBinding();if(!n.isA("sap.ui.model.odata.v4.ODataListBinding")){const o=t.getTargetView(e);n=o.getBindingContext().getBinding()}return n}const y={resetChangesHandler:undefined,uploadPromises:undefined,onDataFieldWithNavigationPath:function(n,o,a){if(o._routing){let e=n.getBindingContext();const s=t.getTargetView(n),c=e.getModel().getMetaModel(),l=function(t){if(t){e=t}o._routing.navigateToTarget(e,a,true)};if(s.getViewData().converterType==="ObjectPage"&&!r.isStickySessionSupported(c)){i.processDataLossOrDraftDiscardConfirmation(l,Function.prototype,e,s.getController(),true,i.NavigationType.ForwardNavigation)}else{l()}}else{e.error("FieldRuntime: No routing listener controller extension found. Internal navigation aborted.","sap.fe.macros.field.FieldRuntime","onDataFieldWithNavigationPath")}},isDraftIndicatorVisible:function(e,t,n,o,i){if(o!==undefined&&n!==undefined&&(!o||n)&&!i){return e===t}else{return false}},onValidateFieldGroup:function(e,t){const n=y._getExtensionController(e);n._sideEffects.handleFieldGroupChange(t)},handleChange:function(e,t){const o=t.getSource(),i=o&&o.getBindingContext().isTransient(),a=t.getParameter("promise")||Promise.resolve(),r=t.getSource(),s=t.getParameter("valid"),c=this.getFieldStateOnChange(t).state["validity"];a.then(function(){t.oSource=r;t.mParameters={valid:s};d.handleChange(t,e)}).catch(function(){t.oSource=r;t.mParameters={valid:false};d.handleChange(t,e)});const l=y._getExtensionController(e);l.editFlow.syncTask(a);if(i){return}l._sideEffects.handleFieldChange(t,c,a);const g=t.getSource(),u=n.isConnected(g);if(u&&c){var f,p;const e=M(g);const t=[...((f=g.getBindingInfo("value")||g.getBindingInfo("selected"))===null||f===void 0?void 0:f.parts)||[],...((p=g.getBindingInfo("additionalValue"))===null||p===void 0?void 0:p.parts)||[]].map(function(e){if(e){var t;return`${(t=g.getBindingContext())===null||t===void 0?void 0:t.getPath()}/${e.path}`}});const i=()=>{if(e.hasPendingChanges()){e.attachEventOnce("patchCompleted",function(){n.send(g,F.Change,t)})}else{n.send(g,F.Undo,t)}};if(o.isA("sap.ui.mdc.Field")){a.then(()=>{i()}).catch(()=>{i()})}else{i()}}},handleLiveChange:function(e){const t=e.getSource();if(n.isConnected(t)){const e=t.getBindingInfo("value").parts[0].path;const o=`${t.getBindingContext().getPath()}/${e}`;n.send(t,F.LiveChange,o);if(!this.resetChangesHandler){this.resetChangesHandler=()=>{setTimeout(()=>{if(t.isA("sap.ui.mdc.Field")){const e=m.byId(m.getCurrentFocusedControlId());if((e===null||e===void 0?void 0:e.getParent())===t){return}}t.detachBrowserEvent("focusout",this.resetChangesHandler);delete this.resetChangesHandler;n.send(t,F.Undo,o)},100)};t.attachBrowserEvent("focusout",this.resetChangesHandler)}}},handleOpenPicker:function(e){const t=e.getSource();const o=n.isConnected(t);if(o){const e=t.getBindingInfo("value").parts[0].path;const o=`${t.getBindingContext().getPath()}/${e}`;n.send(t,F.LiveChange,o)}},handleClosePicker:function(e){const t=e.getSource();const o=n.isConnected(t);if(o){const e=M(t);if(!e.hasPendingChanges()){const e=t.getBindingInfo("value").parts[0].path;const o=`${t.getBindingContext().getPath()}/${e}`;n.send(t,F.Undo,o)}}},_sendCollaborationMessageForFileUploader(e,t){const o=n.isConnected(e);if(o){var i,a;const o=(i=e.getParent())===null||i===void 0?void 0:i.getProperty("propertyPath");const r=`${(a=e.getBindingContext())===null||a===void 0?void 0:a.getPath()}/${o}`;n.send(e,t,r)}},handleOpenUploader:function(e){const t=e.getSource();y._sendCollaborationMessageForFileUploader(t,F.LiveChange)},handleCloseUploader:function(e){const t=e.getSource();y._sendCollaborationMessageForFileUploader(t,F.Undo)},getFieldStateOnChange:function(e){let t=e.getSource(),n={};const o=function(e){return e&&e.getDataState()?e.getDataState().getInvalidValue()===undefined:true};if(t.isA("sap.fe.macros.field.FieldAPI")){t=t.getContent()}if(t.isA(l.getMetadata().getName())&&t.getEditMode()==="Editable"){t=t.getContentEdit()[0]}if(t.isA("sap.ui.mdc.Field")){let i=e.getParameter("valid")||e.getParameter("isValid");if(i===undefined){if(t.getMaxConditions()===1){const e=t.getBindingInfo("value");i=o(e&&e.binding)}if(t.getValue()===""&&!t.getProperty("required")){i=true}}n={fieldValue:t.getValue(),validity:!!i}}else{const e=t.getBinding("uploadUrl")||t.getBinding("value")||t.getBinding("selected");n={fieldValue:e&&e.getValue(),validity:o(e)}}return{field:t,state:n}},_fnFixHashQueryString:function(e){if(e&&e.indexOf("?")!==-1){e=e.split("?")[0]}return e},_fnGetLinkInformation:function(e,n,o,i,a){const r=n&&n.getModel();const s=r&&r.getMetaModel();const c=i||e&&e.getValue();const l=n&&t.getTargetView(n);const d=l&&l.getBindingContext("internal");const g=l&&t.getAppComponent(l);const u=g&&g.getShellServices();const f=u&&u.getLinksWithCache([[{semanticObject:c}]]);const p=s&&s.getObject(`${o}@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions`);return{SemanticObjectName:c,SemanticObjectFullPath:o,MetaModel:s,InternalModelContext:d,ShellServiceHelper:u,GetLinksPromise:f,SemanticObjectUnavailableActions:p,fnSetActive:a}},_fnQuickViewHasNewCondition:function(e,t){if(e&&e.path&&e.path===t.SemanticObjectFullPath){const n=e[!t.SemanticObjectUnavailableActions?"HasTargetsNotFiltered":"HasTargets"];t.fnSetActive(!!n);return true}else{return false}},_fnQuickViewSetNewConditionForConditionalWrapper:function(e,t){if(t[e.SemanticObjectName]){let n,o;const i=Object.keys(t[e.SemanticObjectName]);for(const a in i){n=i[a];o=t[e.SemanticObjectName]&&t[e.SemanticObjectName][n];if(y._fnQuickViewHasNewCondition(o,e)){break}}}},_fnUpdateSemanticObjectsTargetModel:function(n,o,i,a){const r=n&&n.getSource();let s;if(i.isA("sap.m.ObjectStatus")){s=e=>i.setActive(e)}if(i.isA("sap.m.ObjectIdentifier")){s=e=>i.setTitleActive(e)}const c=i&&i.getParent();if(c&&c.isA("sap.fe.macros.controls.ConditionalWrapper")){s=e=>c.setCondition(e)}if(s!==undefined){const n=y._fnGetLinkInformation(r,i,a,o,s);n.fnSetActive=s;const c=y._fnFixHashQueryString(t.getAppComponent(i).getShellServices().getHash());t.updateSemanticTargets([n.GetLinksPromise],[{semanticObject:n.SemanticObjectName,path:n.SemanticObjectFullPath}],n.InternalModelContext,c).then(function(e){if(e){y._fnQuickViewSetNewConditionForConditionalWrapper(n,e)}}).catch(function(t){e.error("Cannot update Semantic Targets model",t)})}},_checkControlHasModelAndBindingContext(e){if(!e.getModel()||!e.getBindingContext()){return false}else{return true}},_checkCustomDataValueBeforeUpdatingSemanticObjectModel(e,t,n){let o;let i;const a=function(e){return!(e!==null&&typeof e==="object")};n=n.filter(e=>e.getKey()!=="sap-ui-custom-settings");for(const r in n){o=n[r].getValue();if(!o&&a(o)){i=n[r].getBinding("value");if(i){i.attachEventOnce("change",function(n){y._fnUpdateSemanticObjectsTargetModel(n,null,e,t)})}}else if(a(o)){y._fnUpdateSemanticObjectsTargetModel(null,o,e,t)}}},LinkModelContextChange:function(e,t,n){const o=e.getSource();if(y._checkControlHasModelAndBindingContext(o)){const e=`${n}/${t}`;const i=o.getDependents().length?o.getDependents()[0]:undefined;const a=i===null||i===void 0?void 0:i.getCustomData();if(a&&a.length>0){y._checkCustomDataValueBeforeUpdatingSemanticObjectModel(o,e,a)}}},openExternalLink:function(e){const t=e.getSource();if(t.data("url")&&t.getProperty("text")!==""){E(t.data("url"),"_self")}},createPopoverWithNoTargets:function(e){const t=e.getId();const n={title:_(e).getText("M_ILLUSTRATEDMESSAGE_TITLE"),description:_(e).getText("M_ILLUSTRATEDMESSAGE_DESCRIPTION"),enableFormattedText:true,illustrationSize:"Dot",illustrationType:u.Tent};const o=new g(`${t}-illustratedmessage`,n);const i={horizontalScrolling:false,showHeader:T.phone,placement:f.PlacementType.Auto,content:[o],afterClose:function(e){if(e.getSource()){e.getSource().destroy()}}};return new h(`${t}-popover`,i)},openLink:async function(n,o){try{const i=await n.getTriggerHref();if(!i){try{const e=await n.retrieveLinkItems();if((e===null||e===void 0?void 0:e.length)===0&&n.getPayload().hasQuickViewFacets==="false"){const e=y.createPopoverWithNoTargets(n);n.addDependent(e);e.openBy(o)}else{await n.open(o)}}catch(t){e.error(`Cannot retrieve the QuickView Popover dialog: ${t}`)}}else{const n=t.getTargetView(o);const r=t.getAppComponent(n);const s=r.getShellServices();const c=s.parseShellHash(i);const l={target:{semanticObject:c.semanticObject,action:c.action},params:c.params};a.storeControlRefreshStrategyForHash(n,c);if(t.isStickyEditMode(o)!==true){s.toExternal(l,r)}else{try{const e=await s.hrefForExternalAsync(l,r);E(e)}catch(t){e.error(`Error while retireving hrefForExternal : ${t}`)}}}}catch(t){e.error(`Error triggering link Href: ${t}`)}},pressLink:async function(e){const t=e.getSource();const n=t.isA("sap.m.ObjectIdentifier")?t.findElements(false,e=>e.isA("sap.m.Link"))[0]:t;if(t.getDependents()&&t.getDependents().length>0&&n.getProperty("text")!==""){const e=t.getDependents()[0];if(e&&e.isA("sap.ui.mdc.Link")){await y.openLink(e,n)}}return n},uploadStream:function(e,t){const o=t.getSource(),i=y._getExtensionController(e),a=o.getParent(),r=a.getUploadUrl();if(r!==""){var s,c;a.setUIBusy(true);o.setUploadUrl(r);o.removeAllHeaderParameters();const e=(s=o.getModel())===null||s===void 0?void 0:s.getHttpHeaders()["X-CSRF-Token"];if(e){const t=new P;t.setName("x-csrf-token");t.setValue(e);o.addHeaderParameter(t)}const t=(c=o.getBindingContext())===null||c===void 0?void 0:c.getProperty("@odata.etag");if(t){const e=new P;e.setName("If-Match");e.setValue(n.isConnected(o)?"*":t);o.addHeaderParameter(e)}const l=new P;l.setName("Accept");l.setValue("application/json");o.addHeaderParameter(l);const d=new Promise((e,t)=>{this.uploadPromises=this.uploadPromises||{};this.uploadPromises[o.getId()]={resolve:e,reject:t};o.upload()});i.editFlow.syncTask(d)}else{p.error(_(e).getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT"))}},handleUploadComplete:function(e,o,i,a){const r=e.getParameter("status"),s=e.getSource(),c=s.getParent();c.setUIBusy(false);const l=s.getBindingContext();if(r===0||r>=400){this._displayMessageForFailedUpload(e);this.uploadPromises[s.getId()].reject()}else{var d;const t=e.getParameter("headers").etag;if(t){l===null||l===void 0?void 0:l.setProperty("@odata.etag",t,null)}if(o!==null&&o!==void 0&&o.path){l===null||l===void 0?void 0:l.setProperty(o.path,s.getValue())}(d=c.avatar)===null||d===void 0?void 0:d.refreshAvatarCacheBusting();this._callSideEffectsForStream(e,c,a);this.uploadPromises[s.getId()].resolve()}delete this.uploadPromises[s.getId()];const g=n.isConnected(s);if(!g||!l){return}const u=[`${l.getPath()}/${i}`];if(o!==null&&o!==void 0&&o.path){u.push(`${l.getPath()}/${o.path}`)}let f=l.getBinding();if(!f.isA("sap.ui.model.odata.v4.ODataListBinding")){const e=t.getTargetView(s);f=e.getBindingContext().getBinding()}if(f.hasPendingChanges()){f.attachEventOnce("patchCompleted",()=>{n.send(c,F.Change,u)})}else{n.send(c,F.Change,u)}},_displayMessageForFailedUpload:function(e){const t=e.getParameter("responseRaw")||e.getParameter("response");let n,o;try{o=t&&JSON.parse(t);n=o.error&&o.error.message}catch(o){n=t||_(e.getSource()).getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT")}p.error(n)},removeStream:function(e,o,i,a){const r=e.getSource();const s=r.getParent();const c=s.getBindingContext();c.setProperty(i,null);c.setProperty(i,undefined,null);this._callSideEffectsForStream(e,s,a);const l=n.isConnected(r);if(l){let e=c.getBinding();if(!e.isA("sap.ui.model.odata.v4.ODataListBinding")){const n=t.getTargetView(r);e=n.getBindingContext().getBinding()}const a=[`${c.getPath()}/${i}`];if(o!==null&&o!==void 0&&o.path){a.push(`${c.getPath()}/${o.path}`)}n.send(r,F.LiveChange,a);e.attachEventOnce("patchCompleted",function(){n.send(r,F.Change,a)})}},_callSideEffectsForStream:function(e,t,n){const o=y._getExtensionController(n);if(t&&t.getBindingContext().isTransient()){return}if(t){e.oSource=t}o._sideEffects.handleFieldChange(e,this.getFieldStateOnChange(e).state["validity"])},getIconForMimeType:function(e){return v.getIconForMimeType(e)},retrieveTextFromValueList:function(t,n,o){let i;let a;let r;if(t){a=c.getMetaModel();r=a.getObject(`${n}@sapui.name`);return a.requestValueListInfo(n,true).then(function(e){const n=e[e[""]?"":Object.keys(e)[0]];const a=n.$model;const s=a.getMetaModel();const c=n.Parameters.find(function(e){return e.LocalDataProperty&&e.LocalDataProperty.$PropertyPath===r});if(c&&!c.ValueListProperty){return Promise.reject(`Inconsistent value help annotation for ${r}`)}const l=s.getObject(`/${n.CollectionPath}/${c.ValueListProperty}@com.sap.vocabularies.Common.v1.Text`);if(l&&l.$Path){i=l.$Path;const e=new S({path:c.ValueListProperty,operator:"EQ",value1:t});const o=a.bindList(`/${n.CollectionPath}`,undefined,undefined,e,{$select:i});return o.requestContexts(0,2)}else{o="Value";return t}}).then(function(e){var n;const a=i?(n=e[0])===null||n===void 0?void 0:n.getObject()[i]:"";switch(o){case"Description":return a;case"DescriptionValue":return m.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT",[a,t]);case"ValueDescription":return m.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT",[t,a]);default:return t}}).catch(function(t){const o=t.status&&t.status===404?`Metadata not found (${t.status}) for value help of property ${n}`:t.message;e.error(o)})}return t},handleTypeMissmatch:function(e){const t=_(e.getSource());p.error(t.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE"),{details:`<p><strong>${t.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_SELECTED")}</strong></p>${e.getParameters().mimeType}<br><br>`+`<p><strong>${t.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_ALLOWED")}</strong></p>${e.getSource().getMimeType().toString().replaceAll(",",", ")}`,contentWidth:"150px"})},handleFileSizeExceed:function(e){p.error(_(e.getSource()).getText("M_FIELD_FILEUPLOADER_FILE_TOO_BIG",e.getSource().getMaximumFileSize().toFixed(3)),{contentWidth:"150px"})},_getExtensionController:function(e){return e.isA("sap.fe.core.ExtensionAPI")?e._controller:e}};return y},true);
//# sourceMappingURL=FieldRuntime.js.map
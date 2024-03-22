/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/base/util/merge","sap/fe/core/ActionRuntime","sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/BusyLocker","sap/fe/core/controllerextensions/collaboration/ActivitySync","sap/fe/core/controllerextensions/editFlow/draft","sap/fe/core/controllerextensions/IntentBasedNavigation","sap/fe/core/controllerextensions/InternalIntentBasedNavigation","sap/fe/core/controllerextensions/InternalRouting","sap/fe/core/controllerextensions/MassEdit","sap/fe/core/controllerextensions/MessageHandler","sap/fe/core/controllerextensions/PageReady","sap/fe/core/controllerextensions/Paginator","sap/fe/core/controllerextensions/Placeholder","sap/fe/core/controllerextensions/Share","sap/fe/core/controllerextensions/ViewState","sap/fe/core/helpers/ClassSupport","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/ResourceModelHelper","sap/fe/core/library","sap/fe/core/PageController","sap/fe/macros/CommonHelper","sap/fe/macros/DelegateUtil","sap/fe/macros/table/TableHelper","sap/fe/macros/table/Utils","sap/fe/navigation/SelectionVariant","sap/fe/templates/ObjectPage/ExtensionAPI","sap/fe/templates/TableScroller","sap/m/InstanceManager","sap/m/Link","sap/m/MessageBox","sap/ui/core/Core","sap/ui/core/message/Message","sap/ui/core/mvc/OverrideExecution","sap/ui/model/odata/v4/ODataListBinding","./overrides/IntentBasedNavigation","./overrides/InternalRouting","./overrides/MessageHandler","./overrides/Paginator","./overrides/Share","./overrides/ViewState"],function(e,t,n,i,o,s,a,r,c,l,g,u,d,f,h,p,b,m,C,v,y,S,P,w,x,A,E,M,_,B,I,V,O,T,F,D,k,R,j,N,L,z){"use strict";var H,$,G,U,q,J,K,W,Q,X,Y,Z,ee,te,ne,ie,oe,se,ae,re,ce,le,ge,ue,de,fe,he;var pe=v.getResourceModel;var be=m.usingExtension;var me=m.publicExtension;var Ce=m.finalExtension;var ve=m.extensible;var ye=m.defineUI5Class;var Se=s.isConnected;var Pe=s.disconnect;var we=s.connect;function xe(e,t,n,i){if(!n)return;Object.defineProperty(e,t,{enumerable:n.enumerable,configurable:n.configurable,writable:n.writable,value:n.initializer?n.initializer.call(i):void 0})}function Ae(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function Ee(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;Me(e,t)}function Me(e,t){Me=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,n){t.__proto__=n;return t};return Me(e,t)}function _e(e,t,n,i,o){var s={};Object.keys(i).forEach(function(e){s[e]=i[e]});s.enumerable=!!s.enumerable;s.configurable=!!s.configurable;if("value"in s||s.initializer){s.writable=true}s=n.slice().reverse().reduce(function(n,i){return i(e,t,n)||n},s);if(o&&s.initializer!==void 0){s.value=s.initializer?s.initializer.call(o):void 0;s.initializer=undefined}if(s.initializer===void 0){Object.defineProperty(e,t,s);s=null}return s}function Be(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}const Ie=y.ProgrammingModel;let Ve=(H=ye("sap.fe.templates.ObjectPage.ObjectPageController"),$=be(h),G=be(p.override(L)),U=be(l.override(R)),q=be(f.override(N)),J=be(u.override(j)),K=be(r.override(k)),W=be(c.override({getNavigationMode:function(){const e=this.getView().getController().getStickyEditMode&&this.getView().getController().getStickyEditMode();return e?"explace":undefined}})),Q=be(b.override(z)),X=be(d.override({isContextExpected:function(){return true}})),Y=be(g),Z=me(),ee=Ce(),te=me(),ne=ve(F.After),H(ie=(oe=function(s){Ee(r,s);function r(){var t;for(var n=arguments.length,o=new Array(n),a=0;a<n;a++){o[a]=arguments[a]}t=s.call(this,...o)||this;xe(t,"placeholder",se,Ae(t));xe(t,"share",ae,Ae(t));xe(t,"_routing",re,Ae(t));xe(t,"paginator",ce,Ae(t));xe(t,"messageHandler",le,Ae(t));xe(t,"intentBasedNavigation",ge,Ae(t));xe(t,"_intentBasedNavigation",ue,Ae(t));xe(t,"viewState",de,Ae(t));xe(t,"pageReady",fe,Ae(t));xe(t,"massEdit",he,Ae(t));t.handlers={onPrimaryAction(e,t,n,i,o,s){const a=e.getView().getViewData().viewLevel;if(s.positiveActionVisible){if(s.positiveActionEnabled){e.handlers.onCallAction(t,i,o)}}else if(s.editActionVisible){if(s.editActionEnabled){e._editDocument(n)}}else if(a===1&&t.getModel("ui").getProperty("/isEditable")){e._saveDocument(n)}else if(t.getModel("ui").getProperty("/isEditable")){e._applyDocument(n)}},async onTableContextChange(t){var n;const i=t.getSource();const o=i.content;const s=this.editFlow.getCurrentActionPromise();const a=(n=this._getTableBinding(o))===null||n===void 0?void 0:n.getCurrentContexts();if(s&&a!==null&&a!==void 0&&a.length){try{const e=await s;if((e===null||e===void 0?void 0:e.controlId)===o.getId()){const t=e.oData;const n=e.keys;const i=a.findIndex(e=>{const i=e.getObject();return n.every(e=>i[e]===t[e])});if(i!==-1){const e=B.getOpenDialogs().find(e=>e.data("FullScreenDialog")!==true);if(e){e.attachEventOnce("afterClose",()=>{o.focusRow(i,true)})}else{o.focusRow(i,true)}this.editFlow.deleteCurrentActionPromise()}}}catch(t){e.error(`An error occurs while scrolling to the newly created Item: ${t}`)}}this.messageButton.fireModelContextChange()},onCallAction(e,t,n){const i=e.getController();return i.editFlow.invokeAction(t,n).then(i._showMessagePopover.bind(i,undefined)).catch(i._showMessagePopover.bind(i))},onDataPointTitlePressed(e,t,n,o,s){n=typeof n==="string"?JSON.parse(n):n;const a=n[o],r=i.getSemanticObjectMapping(a),c=t.getBindingContext(),l=c.getModel().getMetaModel().getMetaPath(c.getPath());let g=e._getChartContextData(c,s);let u;g=g.map(function(e){return{data:e,metaPath:l+(s?`/${s}`:"")}});if(a&&a.parameters){const t=a.parameters&&e._intentBasedNavigation.getOutboundParams(a.parameters);if(Object.keys(t).length>0){u=t}}if(a&&a.semanticObject&&a.action){e._intentBasedNavigation.navigate(a.semanticObject,a.action,{navigationContexts:g,semanticObjectMapping:r,additionalNavigationParameters:u})}},onChevronPressNavigateOutBound(e,t,n,i){return e._intentBasedNavigation.onChevronPressNavigateOutBound(e,t,n,i)},onNavigateChange(e){this.getExtensionAPI().updateAppState();this.bSectionNavigated=true;const t=this.getView().getBindingContext("internal");if(this.getView().getModel("ui").getProperty("/isEditable")&&this.getView().getViewData().sectionLayout==="Tabs"&&t.getProperty("errorNavigationSectionFlag")===false){const t=e.getParameter("subSection");this._updateFocusInEditMode([t])}},onVariantSelected:function(){this.getExtensionAPI().updateAppState()},onVariantSaved:function(){setTimeout(()=>{this.getExtensionAPI().updateAppState()},2e3)},navigateToSubSection:function(t,n){const i=typeof n==="string"?JSON.parse(n):n;const o=t.getView().byId("fe::ObjectPage");let s;let a;if(i.sectionId){s=t.getView().byId(i.sectionId);a=i.subSectionId?t.getView().byId(i.subSectionId):s&&s.getSubSections()&&s.getSubSections()[0]}else if(i.subSectionId){a=t.getView().byId(i.subSectionId);s=a&&a.getParent()}if(!s||!a||!s.getVisible()||!a.getVisible()){const n=pe(t).getText("C_ROUTING_NAVIGATION_DISABLED_TITLE",undefined,t.getView().getViewData().entitySet);e.error(n);V.error(n)}else{o.scrollToSection(a.getId());o.fireNavigate({section:s,subSection:a})}},onStateChange(){this.getExtensionAPI().updateAppState()},closeOPMessageStrip:function(){this.getExtensionAPI().hideMessage()}};return t}var c=r.prototype;c.getExtensionAPI=function e(t){if(t){this.mCustomSectionExtensionAPIs=this.mCustomSectionExtensionAPIs||{};if(!this.mCustomSectionExtensionAPIs[t]){this.mCustomSectionExtensionAPIs[t]=new M(this,t)}return this.mCustomSectionExtensionAPIs[t]}else{if(!this.extensionAPI){this.extensionAPI=new M(this)}return this.extensionAPI}};c.onInit=function e(){s.prototype.onInit.call(this);const t=this._getObjectPageLayoutControl();const n=this.getView().getBindingContext("internal");n===null||n===void 0?void 0:n.setProperty("externalNavigationContext",{page:true});n===null||n===void 0?void 0:n.setProperty("relatedApps",{visibility:false,items:null});n===null||n===void 0?void 0:n.setProperty("batchGroups",this._getBatchGroupsForView());n===null||n===void 0?void 0:n.setProperty("errorNavigationSectionFlag",false);if(t.getEnableLazyLoading()){t.attachEvent("subSectionEnteredViewPort",this._handleSubSectionEnteredViewPort.bind(this))}this.messageButton=this.getView().byId("fe::FooterBar::MessageButton");this.messageButton.oItemBinding.attachChange(this._fnShowOPMessage,this);n===null||n===void 0?void 0:n.setProperty("rootEditEnabled",true);n===null||n===void 0?void 0:n.setProperty("rootEditVisible",true)};c.onExit=function e(){if(this.mCustomSectionExtensionAPIs){for(const e of Object.keys(this.mCustomSectionExtensionAPIs)){if(this.mCustomSectionExtensionAPIs[e]){this.mCustomSectionExtensionAPIs[e].destroy()}}delete this.mCustomSectionExtensionAPIs}if(this.extensionAPI){this.extensionAPI.destroy()}delete this.extensionAPI;const t=this.messageButton?this.messageButton.oMessagePopover:null;if(t&&t.isOpen()){t.close()}const n=this.getView().getBindingContext();if(n&&n.isKeepAlive()){n.setKeepAlive(false)}if(Se(this.getView())){Pe(this.getView())}};c._fnShowOPMessage=function e(){const t=this.getExtensionAPI();const n=this.getView();const i=this.messageButton.oMessagePopover.getItems().map(e=>e.getBindingContext("message").getObject()).filter(e=>{var t;return e.getTargets()[0]===((t=n.getBindingContext())===null||t===void 0?void 0:t.getPath())});if(t){t.showMessages(i)}};c._getTableBinding=function e(t){return t&&t.getRowBinding()};c.checkSectionsForNonResponsiveTable=function e(t){const n=(e,t)=>{var i;const o=[...t.getBlocks(),...t.getMoreBlocks()];const s=o.length===1&&((i=this.searchTableInBlock(o[0]))===null||i===void 0?void 0:i.getType());if(s&&(s!==null&&s!==void 0&&s.isA("sap.ui.mdc.table.GridTableType")||s!==null&&s!==void 0&&s.isA("sap.ui.mdc.table.TreeTableType"))){t.addStyleClass("sapUxAPObjectPageSubSectionFitContainer");t.detachEvent("modelContextChange",n,this)}};for(let e=t.length-1;e>=0;e--){if(t[e].getVisible()){const i=t[e];i.attachEvent("modelContextChange",i,n,this);break}}};c.searchTableInBlock=function e(t){const n=t.content;let i;if(t.isA("sap.fe.templates.ObjectPage.controls.SubSectionBlock")){if(n.isA("sap.m.Panel")&&n.data("FullScreenTablePlaceHolder")){i=n.data("tableAPIreference")}else if(n.isA("sap.fe.macros.table.TableAPI")){i=n}if(i){return i.content}}return undefined};c.onBeforeRendering=function e(){var t;S.prototype.onBeforeRendering.apply(this);if((t=this.oView.oViewData)!==null&&t!==void 0&&t.retrieveTextFromValueList&&P.getMetaModel()===undefined){P.setMetaModel(this.getAppComponent().getMetaModel())}};c.onAfterRendering=function e(){let t;if(this._getObjectPageLayoutControl().getUseIconTabBar()){const e=this._getObjectPageLayoutControl().getSections();for(const n of e){t=n.getSubSections();this.checkSectionsForNonResponsiveTable(t)}}else{t=this._getAllSubSections();this.checkSectionsForNonResponsiveTable(t)}};c._onBeforeBinding=function e(t,n){const i=this._findTables(),o=this._getObjectPageLayoutControl(),s=this.getView().getBindingContext("internal"),a=this.getView().getModel("internal"),r=s.getProperty("batchGroups"),c=this.getView().getViewData().viewLevel;let l;r.push("$auto");if(n.bDraftNavigation!==true){this._closeSideContent()}const g=o.getBindingContext();if(g&&g.hasPendingChanges()&&!r.some(g.getModel().hasPendingChanges.bind(g.getModel()))){g.getBinding().resetChanges()}for(let e=0;e<i.length;e++){l=i[e].getCreationRow();if(l){l.setBindingContext(null)}}const u=function(){if(!o.isFirstRendering()&&!n.bPersistOPScroll){o.setSelectedSection(null)}};o.attachEventOnce("modelContextChange",u);const d={onAfterRendering:u};o.addEventDelegate(d,this);this.pageReady.attachEventOnce("pageReady",function(){o.removeEventDelegate(d)});if(c>1){let e=n&&n.listBinding;const i=a.getProperty("/paginatorCurrentContext");if(i){const e=i.getBinding();this.paginator.initialize(e,i);a.setProperty("/paginatorCurrentContext",null)}else if(e){if(e.isA("sap.ui.model.odata.v4.ODataListBinding")){this.paginator.initialize(e,t)}else{const n=e.getPath();if(/\([^)]*\)$/.test(n)){const i=n.replace(/\([^)]*\)$/,"");e=new D(e.oModel,i);const o=()=>{if(e.getContexts().length>0){this.paginator.initialize(e,t);e.detachEvent("change",o)}};e.getContexts(0);e.attachEvent("change",o)}else{this.paginator.initialize(undefined)}}}}if(o.getEnableLazyLoading()){const e=o.getSections();const t=o.getUseIconTabBar();let n=2;const i=this.getView().getModel("ui").getProperty("/isEditable");const s=this.getView().getViewData().editableHeaderContent;for(let o=0;o<e.length;o++){const a=e[o];const r=a.getSubSections();for(let e=0;e<r.length;e++,n--){if(n<1||t&&(o>1||o===1&&!s&&!i)){const t=r[e];if(t.data().isVisibilityDynamic!=="true"){t.setBindingContext(null)}}}}}if(this.placeholder.isPlaceholderEnabled()&&n.showPlaceholder){const e=this.getView();const t=e.getParent().oContainer.getParent();if(t){t.showPlaceholder({})}}};c._getFirstClickableElement=function e(t){let n;const i=t.getHeaderTitle()&&t.getHeaderTitle().getActions();if(i&&i.length){n=i.find(function(e){if(e.isA("sap.fe.macros.share.ShareAPI")){return e.getVisible()}else if(!e.isA("sap.ui.core.InvisibleText")&&!e.isA("sap.m.ToolbarSpacer")){return e.getVisible()&&e.getEnabled()}})}return n};c._getFirstEmptyMandatoryFieldFromSubSection=function t(n){if(n){for(let t=0;t<n.length;t++){const i=n[t].getBlocks();if(i){for(let t=0;t<i.length;t++){let n;if(i[t].isA("sap.ui.layout.form.Form")){n=i[t].getFormContainers()}else if(i[t].getContent&&i[t].getContent()&&i[t].getContent().isA("sap.ui.layout.form.Form")){n=i[t].getContent().getFormContainers()}if(n){for(let t=0;t<n.length;t++){const i=n[t].getFormElements();if(i){for(let t=0;t<i.length;t++){const n=i[t].getFields();try{if(n[0].getRequired&&n[0].getRequired()&&!n[0].getValue()){return n[0]}}catch(t){e.debug(`Error when searching for mandaotry empty field: ${t}`)}}}}}}}}}return undefined};c._updateFocusInEditMode=function e(t){const n=this._getObjectPageLayoutControl();const i=this._getFirstEmptyMandatoryFieldFromSubSection(t);let o;if(i){o=i.content.getContentEdit()[0]}else{o=n._getFirstEditableInput()||this._getFirstClickableElement(n)}if(o){setTimeout(function(){o.focus()},0)}};c._handleSubSectionEnteredViewPort=function e(t){const n=t.getParameter("subSection");n.setBindingContext(undefined)};c._onBackNavigationInDraft=function e(t){this.messageHandler.removeTransitionMessages();if(this.getAppComponent().getRouterProxy().checkIfBackHasSameContext()){history.back()}else{a.processDataLossOrDraftDiscardConfirmation(function(){history.back()},Function.prototype,t,this,false,a.NavigationType.BackNavigation)}};c._onAfterBinding=function t(o,s){var a,r;const c=(a=this.getView())===null||a===void 0?void 0:(r=a.getViewData())===null||r===void 0?void 0:r.viewLevel;if(c&&c===1){const e=this.getView().getModel("internal").getProperty("/currentCtxt");if(e&&e.getPath()!==o.getPath()){this.getView().getModel("internal").setProperty("/recommendationsData",{})}}const l=this._getObjectPageLayoutControl();const g=this._findTables();this._sideEffects.clearFieldGroupsValidity();const u=l.getBindingContext();let d=[];l.getSections().forEach(function(e){e.getSubSections().forEach(function(e){d=i.getIBNActions(e,d)})});g.forEach(function(e){const t=e.getBindingContext("internal");if(t){t.setProperty("creationRowFieldValidity",{});t.setProperty("creationRowCustomValidity",{});d=i.getIBNActions(e,d);const o=e.getRowBinding();if(o){if(C.isStickySessionSupported(o.getModel().getMetaModel())){o.removeCachesAndMessages("")}}const s=JSON.parse(P.parseCustomData(w.getCustomData(e,"operationAvailableMap")));n.setActionEnablement(t,s,[],"table");e.clearSelection()}});i.getSemanticTargetsFromPageModel(this,"_pageModel");const f=l.getHeaderTitle();let h=[];h=i.getIBNActions(f,h);d=d.concat(h);i.updateDataFieldForIBNButtonsVisibility(d,this.getView());let p,b;const m=t=>{const n=this._getTableBinding(t),i=function(){x.enableFastCreationRow(t.getCreationRow(),n.getPath(),n.getContext(),p,b)};if(!n){e.error(`Expected binding missing for table: ${t.getId()}`);return}if(n.oContext){i()}else{const e=function(){if(n.oContext){i();n.detachChange(e)}};n.attachChange(e)}};if(u){p=u.getModel();b=this.editFlow.computeEditMode(u);if(C.isCollaborationDraftSupported(p.getMetaModel())){b.then(()=>{if(this.getView().getModel("ui").getProperty("/isEditable")){we(this.getView())}else if(Se(this.getView())){Pe(this.getView())}}).catch(function(t){e.error("Error while waiting for the final UI State",t)})}this._updateRelatedApps();const t=u.getBinding&&u.getBinding()||u;if(this.currentBinding!==t){t.attachEvent("patchSent",{},this.editFlow.handlePatchSent,this);this.currentBinding=t}g.forEach(function(t){A.whenBound(t).then(m).catch(function(t){e.error("Error while waiting for the table to be bound",t)})});l._triggerVisibleSubSectionsEvents();n.updateEditButtonVisibilityAndEnablement(this.getView())}this.displayCollaborationMessage(s===null||s===void 0?void 0:s.redirectedToNonDraft)};c.displayCollaborationMessage=function e(t){const n=O.getLibraryResourceBundle("sap.fe.core");if(this.collaborationMessage){O.getMessageManager().removeMessages([this.collaborationMessage]);delete this.collaborationMessage}if(t){var i,o;this.collaborationMessage=new T({message:n.getText("REROUTED_NAVIGATION_TO_SAVED_VERSION",[t]),type:"Information",target:(i=this.getView())===null||i===void 0?void 0:(o=i.getBindingContext())===null||o===void 0?void 0:o.getPath()});sap.ui.getCore().getMessageManager().addMessages([this.collaborationMessage])}};c.onPageReady=function t(n){const o=()=>{const e=this._getObjectPageLayoutControl();const t=!this.getView().getModel("ui").getProperty("/isEditable");if(t){const t=this._getFirstClickableElement(e);if(t){t.focus()}}else{const t=O.byId(e.getSelectedSection());if(t){this._updateFocusInEditMode(t.getSubSections())}}};const s=this.getView().getBindingContext();this.getView().getModel("internal").setProperty("/currentCtxt",s);const a=this.getView();const r=a.getBindingContext("internal");const c=a.getBindingContext();if(c){const e=C.isStickySessionSupported(c.getModel().getMetaModel());if(!e){const e=i.getAppComponent(a);e.getShellServices().setBackNavigation(()=>this._onBackNavigationInDraft(c))}}const l=this.getView().getId();this.getAppComponent().getAppStateHandler().applyAppState(l,this.getView()).then(()=>{if(n.forceFocus){o()}}).catch(function(t){e.error("Error while setting the focus",t)});r.setProperty("errorNavigationSectionFlag",false);this._checkDataPointTitleForExternalNavigation()};c.getStickyEditMode=function e(){const t=this.getView().getBindingContext&&this.getView().getBindingContext();let n=false;if(t){const e=C.isStickySessionSupported(t.getModel().getMetaModel());if(e){n=this.getView().getModel("ui").getProperty("/isEditable")}}return n};c._getObjectPageLayoutControl=function e(){return this.byId("fe::ObjectPage")};c._getPageTitleInformation=function e(){const t=this._getObjectPageLayoutControl();const n=t.getCustomData().find(function(e){return e.getKey()==="ObjectPageSubtitle"});return{title:t.data("ObjectPageTitle")||"",subtitle:n&&n.getValue(),intent:"",icon:""}};c._executeHeaderShortcut=function e(t){const n=`${this.getView().getId()}--${t}`,o=this._getObjectPageLayoutControl().getHeaderTitle().getActions().find(function(e){return e.getId()===n});if(o){i.fireButtonPress(o)}};c._executeFooterShortcut=function e(t){const n=`${this.getView().getId()}--${t}`,o=this._getObjectPageLayoutControl().getFooter().getContent().find(function(e){return e.getMetadata().getName()==="sap.m.Button"&&e.getId()===n});i.fireButtonPress(o)};c._executeTabShortCut=function e(t){const n=this._getObjectPageLayoutControl(),i=n.getSections(),o=i.length-1,s=t.oSource.getCommand();let a,r=n.indexOfSection(this.byId(n.getSelectedSection()));if(r!==-1&&o>0){if(s==="NextTab"){if(r<=o-1){a=i[++r]}}else if(r!==0){a=i[--r]}if(a){n.setSelectedSection(a);a.focus()}}};c._getFooterVisibility=function e(){const t=this.getView().getBindingContext("internal");const n=this.getView().getId();t.setProperty("messageFooterContainsErrors",false);sap.ui.getCore().getMessageManager().getMessageModel().getData().forEach(function(e){if(e.validation&&e.type==="Error"&&e.target.indexOf(n)>-1){t.setProperty("messageFooterContainsErrors",true)}})};c._showMessagePopover=function t(n,i){if(n){e.error(n)}const o=this.getAppComponent().getRootViewController();const s=o.isFclEnabled()?o.getRightmostView():this.getAppComponent().getRootContainer().getCurrentPage();if(!s.isA("sap.m.MessagePage")){const e=this.messageButton,t=e.oMessagePopover,n=t.getBinding("items");if(n.getLength()>0&&!t.isOpen()){e.setVisible(true);setTimeout(function(){t.openBy(e)},0)}}return i};c._editDocument=function e(t){const n=this.getView().getModel("ui");o.lock(n);return this.editFlow.editDocument.apply(this.editFlow,[t]).finally(function(){o.unlock(n)})};c._validateDocument=async function e(){const t=this.getAppComponent();const n=O.byId(O.getCurrentFocusedControlId());const o=n===null||n===void 0?void 0:n.getBindingContext();if(o&&!o.isTransient()){const e=t.getSideEffectsService();const n=e.getEntityTypeFromContext(o);const s=n?e.getGlobalODataEntitySideEffects(n):[];if(s.length){await this.editFlow.syncTask();return Promise.all(s.map(e=>this._sideEffects.requestSideEffects(e,o)))}const r=await i.createRootContext(Ie.Draft,this.getView(),t);if(r){await this.editFlow.syncTask();return a.executeDraftValidation(r,t,Se(this.getView()))}}return undefined};c._saveDocument=async function e(t){const n=this.getView().getModel("ui"),i=[];let s=false;o.lock(n);this._findTables().forEach(e=>{const t=this._getTableBinding(e);const n={creationMode:e.data("creationMode"),creationRow:e.getCreationRow(),createAtEnd:e.data("createAtEnd")==="true"};const o=n.creationRow&&n.creationRow.getBindingContext()&&Object.keys(n.creationRow.getBindingContext().getObject()).length>1;if(o){n.bSkipSideEffects=true;s=true;i.push(this.editFlow.createDocument(t,n).then(function(){return t}))}});try{const e=await Promise.all(i);const n={bExecuteSideEffectsOnError:s,bindings:e};try{await this.editFlow.saveDocument(t,n)}catch(e){this._showMessagePopover(e);throw e}}finally{if(o.isLocked(n)){o.unlock(n)}}};c._cancelDocument=function e(t,n){n.cancelButton=this.getView().byId(n.cancelButton);return this.editFlow.cancelDocument(t,n)};c._applyDocument=function e(t){return this.editFlow.applyDocument(t).catch(()=>this._showMessagePopover())};c._updateRelatedApps=function e(){const t=this._getObjectPageLayoutControl();const n=t.data("showRelatedApps");if(n==="true"||n===true){const e=i.getAppComponent(this.getView());i.updateRelatedAppsDetails(t,e)}};c._findControlInSubSection=function e(t,n,i,o){for(let e=0;e<t.length;e++){let n=t[e].getContent instanceof Function&&t[e].getContent();if(o){if(n&&n.mAggregations&&n.getAggregation("items")){const e=n.getAggregation("items");e.forEach(function(e){if(e.isA("sap.fe.macros.chart.ChartAPI")){n=e}})}}if(n&&n.isA&&n.isA("sap.ui.layout.DynamicSideContent")){n=n.getMainContent instanceof Function&&n.getMainContent();if(n&&n.length>0){n=n[0]}}if(n&&n.isA&&n.isA("sap.m.Panel")&&n.data("FullScreenTablePlaceHolder")){n=n.data("tableAPIreference")}if(n&&n.isA&&n.isA("sap.fe.macros.table.TableAPI")){n=n.getContent instanceof Function&&n.getContent();if(n&&n.length>0){n=n[0]}}if(n&&n.isA&&n.isA("sap.ui.mdc.Table")){i.push(n)}if(n&&n.isA&&n.isA("sap.fe.macros.chart.ChartAPI")){n=n.getContent instanceof Function&&n.getContent();if(n&&n.length>0){n=n[0]}}if(n&&n.isA&&n.isA("sap.ui.mdc.Chart")){i.push(n)}}};c._getAllSubSections=function e(){const t=this._getObjectPageLayoutControl();let n=[];t.getSections().forEach(function(e){n=n.concat(e.getSubSections())});return n};c._getAllBlocks=function e(){let t=[];this._getAllSubSections().forEach(function(e){t=t.concat(e.getBlocks())});return t};c._findTables=function e(){const t=this._getAllSubSections();const n=[];for(let e=0;e<t.length;e++){this._findControlInSubSection(t[e].getBlocks(),t[e],n);this._findControlInSubSection(t[e].getMoreBlocks(),t[e],n)}return n};c._findCharts=function e(){const t=this._getAllSubSections();const n=[];for(let e=0;e<t.length;e++){this._findControlInSubSection(t[e].getBlocks(),t[e],n,true);this._findControlInSubSection(t[e].getMoreBlocks(),t[e],n,true)}return n};c._closeSideContent=function e(){this._getAllBlocks().forEach(function(e){const t=e.getContent instanceof Function&&e.getContent();if(t&&t.isA&&t.isA("sap.ui.layout.DynamicSideContent")){if(t.setShowSideContent instanceof Function){t.setShowSideContent(false)}}})};c._getChartContextData=function e(t,n){const i=t.getObject();let o=[i];if(t&&n){if(i[n]){o=i[n];delete i[n];o.push(i)}}return o};c._scrollTablesToRow=function e(t){if(this._findTables&&this._findTables().length>0){const e=this._findTables();for(let n=0;n<e.length;n++){_.scrollTableToRow(e[n],t)}}};c._mergeMultipleContexts=function e(t,n,o){let s=[],a=[],r,c,l;const g=t.getPath();const u=t&&t.getModel()&&t.getModel().getMetaModel();const d=u&&u.getMetaPath(g).replace(/^\/*/,"");if(n&&n.length){r=n[0];l=r.getPath();c=u&&u.getMetaPath(l).replace(/^\/*/,"");n.forEach(e=>{if(o){const t=this._getChartContextData(e,o);if(t){s=t.map(function(e){return{contextData:e,entitySet:`${d}/${o}`}})}}else{s.push({contextData:e.getObject(),entitySet:c})}})}a.push({contextData:t.getObject(),entitySet:d});a=this._intentBasedNavigation.removeSensitiveData(a,d);const f=i.addPageContextToSelectionVariant(new E,a,this.getView());s=this._intentBasedNavigation.removeSensitiveData(s,d);return{selectionVariant:f,attributes:s}};c._getBatchGroupsForView=function e(){const t=this.getView().getViewData(),n=t.controlConfiguration,i=n&&Object.keys(n),o=["$auto.Heroes","$auto.Decoration","$auto.Workers"];if(i&&i.length>0){i.forEach(function(e){const t=n[e];if(t.requestGroupId==="LongRunners"){o.push("$auto.LongRunners")}})}return o};c._setBreadcrumbLinks=async function t(n){const i=n.getBindingContext(),o=this.getAppComponent(),s=[],a=[],r=i===null||i===void 0?void 0:i.getPath(),c=(r===null||r===void 0?void 0:r.split("/"))??[],l=o&&o.getMetaModel();let g="";try{c.shift();c.splice(-1,1);c.forEach(function(e){g+=`/${e}`;const t=o.getRootViewController();const n=l.getMetaPath(g);const i=l.getObject(`${n}/@com.sap.vocabularies.Common.v1.ResultContext`);if(i){a.push(1);return}else{a.push(0)}s.push(t.getTitleInfoFromPath(g))});const e=await Promise.all(s);let t,i,r;for(const o of e){i=e.indexOf(o);t=i-a[i];r=n.getLinks()[t]?n.getLinks()[t]:new I;r.setText(o.subtitle||o.title);r.setHref(encodeURI(o.intent));if(!n.getLinks()[t]){n.addLink(r)}}}catch(t){e.error("Error while setting the breadcrumb links:"+t)}};c._checkDataPointTitleForExternalNavigation=function n(){const o=this.getView();const s=o.getBindingContext("internal");const a=i.getHeaderFacetItemConfigForExternalNavigation(o.getViewData(),this.getAppComponent().getRoutingService().getOutbounds());const r=this.getAppComponent().getShellServices();const c=o&&o.getBindingContext();s.setProperty("isHeaderDPLinkVisible",{});if(c){c.requestObject().then(function(e){u(a,e)}).catch(function(t){e.error("Cannot retrieve the links from the shell service",t)})}function l(t){e.error(t)}function g(e,t){const n=e;if(t&&t.length===1&&t[0].supported){s.setProperty(`isHeaderDPLinkVisible/${n}`,true)}}function u(e,n){for(const i in e){const s=e[i];const a={};const c=o.byId(i);if(!c){continue}const u=c.getBindingContext();const d=u&&u.getObject();let f=t({},n,d);if(s.semanticObjectMapping){const e=s.semanticObjectMapping;for(const n in e){const i=e[n];const o=i["LocalProperty"]["$PropertyPath"];const s=i["SemanticObjectProperty"];if(o!==s){if(f.hasOwnProperty(o)){const e={};e[s]=f[o];f=t({},f,e);delete f[o]}}}}if(f){for(const e in f){if(e.indexOf("_")!==0&&e.indexOf("odata.context")===-1){a[e]=f[e]}}}r.isNavigationSupported([{target:{semanticObject:s.semanticObject,action:s.action},params:a}]).then(e=>g(i,e)).catch(l)}}};return r}(S),se=_e(oe.prototype,"placeholder",[$],{configurable:true,enumerable:true,writable:true,initializer:null}),ae=_e(oe.prototype,"share",[G],{configurable:true,enumerable:true,writable:true,initializer:null}),re=_e(oe.prototype,"_routing",[U],{configurable:true,enumerable:true,writable:true,initializer:null}),ce=_e(oe.prototype,"paginator",[q],{configurable:true,enumerable:true,writable:true,initializer:null}),le=_e(oe.prototype,"messageHandler",[J],{configurable:true,enumerable:true,writable:true,initializer:null}),ge=_e(oe.prototype,"intentBasedNavigation",[K],{configurable:true,enumerable:true,writable:true,initializer:null}),ue=_e(oe.prototype,"_intentBasedNavigation",[W],{configurable:true,enumerable:true,writable:true,initializer:null}),de=_e(oe.prototype,"viewState",[Q],{configurable:true,enumerable:true,writable:true,initializer:null}),fe=_e(oe.prototype,"pageReady",[X],{configurable:true,enumerable:true,writable:true,initializer:null}),he=_e(oe.prototype,"massEdit",[Y],{configurable:true,enumerable:true,writable:true,initializer:null}),_e(oe.prototype,"getExtensionAPI",[Z,ee],Object.getOwnPropertyDescriptor(oe.prototype,"getExtensionAPI"),oe.prototype),_e(oe.prototype,"onPageReady",[te,ne],Object.getOwnPropertyDescriptor(oe.prototype,"onPageReady"),oe.prototype),oe))||ie);return Ve},false);
//# sourceMappingURL=ObjectPageController.controller.js.map
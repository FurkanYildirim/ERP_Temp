/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/CommonUtils","sap/fe/core/controllerextensions/BusyLocker","sap/fe/core/controllerextensions/collaboration/ActivitySync","sap/fe/core/controllerextensions/editFlow/draft","sap/fe/core/controllerextensions/routing/NavigationReason","sap/fe/core/helpers/ClassSupport","sap/fe/core/helpers/EditState","sap/fe/core/helpers/ModelHelper","sap/fe/core/helpers/SemanticKeyHelper","sap/ui/core/Component","sap/ui/core/Core","sap/ui/core/mvc/ControllerExtension","sap/ui/core/mvc/OverrideExecution","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(t,e,o,n,i,r,a,s,c,l,g,p,u,h,d,f){"use strict";var v,C,y,P,_,m,x,b,w,O,B,R,E,A,D,S,T,M,F,I,V,$,L,j,H,k,N,K,q,z,U,W;var Q=a.publicExtension;var X=a.methodOverride;var G=a.finalExtension;var J=a.extensible;var Y=a.defineUI5Class;function Z(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;tt(t,e)}function tt(t,e){tt=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,o){e.__proto__=o;return e};return tt(t,e)}function et(t,e,o,n,i){var r={};Object.keys(n).forEach(function(t){r[t]=n[t]});r.enumerable=!!r.enumerable;r.configurable=!!r.configurable;if("value"in r||r.initializer){r.writable=true}r=o.slice().reverse().reduce(function(o,n){return n(t,e,o)||o},r);if(i&&r.initializer!==void 0){r.value=r.initializer?r.initializer.call(i):void 0;r.initializer=undefined}if(r.initializer===void 0){Object.defineProperty(t,e,r);r=null}return r}let ot=(v=Y("sap.fe.core.controllerextensions.InternalRouting"),C=X(),y=X(),P=Q(),_=J(h.After),m=Q(),x=J(h.After),b=Q(),w=J(h.After),O=Q(),B=J(h.After),R=Q(),E=Q(),A=Q(),D=G(),S=Q(),T=G(),M=Q(),F=G(),I=Q(),V=G(),$=Q(),L=G(),j=Q(),H=G(),k=Q(),N=Q(),K=G(),q=Q(),z=J(h.Before),v(U=(W=function(a){Z(u,a);function u(){return a.apply(this,arguments)||this}var h=u.prototype;h.onExit=function t(){if(this._oRoutingService){this._oRoutingService.detachRouteMatched(this._fnRouteMatchedBound)}};h.onInit=function t(){this._oView=this.base.getView();this._oAppComponent=e.getAppComponent(this._oView);this._oPageComponent=g.getOwnerComponentFor(this._oView);this._oRouter=this._oAppComponent.getRouter();this._oRouterProxy=this._oAppComponent.getRouterProxy();if(!this._oAppComponent||!this._oPageComponent){throw new Error("Failed to initialize controler extension 'sap.fe.core.controllerextesions.InternalRouting")}if(this._oAppComponent===this._oPageComponent){this._oPageComponent=null}this._oAppComponent.getService("routingService").then(t=>{this._oRoutingService=t;this._fnRouteMatchedBound=this._onRouteMatched.bind(this);this._oRoutingService.attachRouteMatched(this._fnRouteMatchedBound);this._oTargetInformation=t.getTargetInformationFor(this._oPageComponent||this._oView)}).catch(function(){throw new Error("This controller extension cannot work without a 'routingService' on the main AppComponent")})};h.onRouteMatched=function t(){};h.onRouteMatchedFinished=function t(){};h.onBeforeBinding=function t(e,o){const n=this.base.getView().getController().routing;if(n&&n.onBeforeBinding){n.onBeforeBinding(e,o)}};h.onAfterBinding=function t(e,o){this._oAppComponent.getRootViewController().onContextBoundToView(e);const n=this.base.getView().getController().routing;if(n&&n.onAfterBinding){n.onAfterBinding(e,o)}};h.navigateToTarget=function t(e,o,n){const i=this._oPageComponent&&this._oPageComponent.getNavigationConfiguration&&this._oPageComponent.getNavigationConfiguration(o);if(i){const t=i.detail;const o=t.route;const r=t.parameters;this._oRoutingService.navigateTo(e,o,r,n)}else{this._oRoutingService.navigateTo(e,null,null,n)}this._oView.getViewData()};h.navigateToRoute=function t(e,o){return this._oRoutingService.navigateToRoute(e,o)};h.navigateToContext=function e(o,n){const i={};n=n||{};if(o.isA("sap.ui.model.odata.v4.ODataListBinding")){if(n.asyncContext){this._oRouterProxy.activateRouteMatchSynchronization();n.asyncContext.then(t=>{this.navigateToContext(t,{checkNoHashChange:n.checkNoHashChange,editable:n.editable,bPersistOPScroll:n.bPersistOPScroll,updateFCLLevel:n.updateFCLLevel,bForceFocus:n.bForceFocus})}).catch(function(e){t.error("Error with the async context",e)})}else if(!n.bDeferredContext){throw"navigation to a list binding is not yet supported"}}if(n.callExtension){const t=this._oView.getModel("internal");t.setProperty("/paginatorCurrentContext",null);i.sourceBindingContext=o.getObject();i.bindingContext=o;if(n.oEvent){i.oEvent=n.oEvent}const e=this.base.getView().getController().routing.onBeforeNavigation(i);if(e){t.setProperty("/paginatorCurrentContext",o);return Promise.resolve(true)}}n.FCLLevel=this._getFCLLevel();return this._oRoutingService.navigateToContext(o,n,this._oView.getViewData(),this._oTargetInformation)};h.navigateBackFromContext=function t(e,o){o=o||{};o.updateFCLLevel=-1;return this.navigateToContext(e,o)};h.navigateForwardToContext=function t(e,o){var n;if(((n=this._oView.getBindingContext("internal"))===null||n===void 0?void 0:n.getProperty("messageFooterContainsErrors"))===true){return Promise.resolve(true)}o=o||{};o.updateFCLLevel=1;return this.navigateToContext(e,o)};h.navigateBackFromTransientState=function t(){const e=this._oRouterProxy.getHash();if(e.indexOf("(...)")!==-1){this._oRouterProxy.navBack()}};h.navigateToMessagePage=function t(e,o){o=o||{};if(this._oRouterProxy.getHash().indexOf("i-action=create")>-1||this._oRouterProxy.getHash().indexOf("i-action=autoCreate")>-1){return this._oRouterProxy.navToHash(this._oRoutingService.getDefaultCreateHash())}else{o.FCLLevel=this._getFCLLevel();return this._oAppComponent.getRootViewController().displayErrorPage(e,o)}};h.isCurrentStateImpactedBy=function t(e){return this._oRoutingService.isCurrentStateImpactedBy(e)};h._isViewPartOfRoute=function t(e){const o=e===null||e===void 0?void 0:e.targets;if(!o||o.indexOf(this._oTargetInformation.targetName)===-1){if((this._oTargetInformation.viewLevel??0)>=((e===null||e===void 0?void 0:e.routeLevel)??0)){this._setBindingContext(null)}return false}return true};h._buildBindingPath=function t(e,o,n){let i=o.replace(":?query:","");let r=false;for(const t in e){const a=e[t];if(typeof a!=="string"){continue}if(a==="..."&&o.indexOf(`{${t}}`)>=0){r=true;n.bTargetEditable=true}i=i.replace(`{${t}}`,a)}if(e["?query"]&&e["?query"].hasOwnProperty("i-action")){n.bActionCreate=true}if(i&&i[0]!=="/"){i=`/${i}`}return{path:i,deferred:r}};h._onRouteMatched=function t(e){if(!this._isViewPartOfRoute(e.getParameter("routeInformation"))){return}let o;if(this._oPageComponent&&this._oPageComponent.getBindingContextPattern){o=this._oPageComponent.getBindingContextPattern()}o=o||this._oTargetInformation.contextPattern;if(o===null||o===undefined){o=e.getParameter("routePattern")}const n=e.getParameters().arguments;const i=e.getParameter("navigationInfo");const{path:r,deferred:a}=this._buildBindingPath(n,o,i);this.onRouteMatched();const s=this._oView.getModel();let c;if(a){c=this._bindDeferred(r,i)}else{c=this._bindPage(r,s,i)}c.finally(()=>{this.onRouteMatchedFinished()});this._oAppComponent.getRootViewController().updateUIStateForView(this._oView,this._getFCLLevel())};h._bindDeferred=async function t(e,o){this.onBeforeBinding(null,{editable:o.bTargetEditable});if(o.bDeferredContext||!o.oAsyncContext){if(this._oPageComponent&&this._oPageComponent.createDeferredContext){this._oPageComponent.createDeferredContext(e,o.listBindingForCreate,!!o.bActionCreate)}}const n=this._getBindingContext();if(n!==null&&n!==void 0&&n.hasPendingChanges()){n.getBinding().resetChanges()}this._setBindingContext(null);this.onAfterBinding(null);return Promise.resolve()};h._bindPage=function t(e,o,n){if(e===""){return Promise.resolve(this._bindPageToContext(null,o,n))}return this.resolvePath(e,o,n).then(t=>{this._bindPageToPath(t,o,n)}).catch(t=>{const e=p.getLibraryResourceBundle("sap.fe.core");this.navigateToMessagePage(e.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"),{title:e.getText("C_COMMON_SAPFE_ERROR"),description:t.message})})};h.createFilterFromPath=function t(e,o,n){const i=function(t){if(t.indexOf("'")===0&&t.lastIndexOf("'")===t.length-1){t=decodeURIComponent(t.substring(1,t.length-1))}return t};const r=e.substring(e.indexOf("(")+1,e.length-1).split(",");let a=o;let s=r;if(o.includes("IsActiveEntity")){a=o.filter(t=>t.indexOf("IsActiveEntity")<0);s=r.filter(t=>!t.startsWith("IsActiveEntity"))}if(a.length!=s.length){return null}const l=c.isFilteringCaseSensitive(n);let g;if(a.length===1){if(s[0].indexOf("=")>0){const t=s[0].split("=");s[0]=t[1]}const t=i(s[0]);g=[new d({path:a[0],operator:f.EQ,value1:t,caseSensitive:l})]}else{const t={};s.forEach(function(e){const o=e.split("="),n=i(o[1]);t[o[0]]=n});let e=false;g=a.map(function(o){const n=o,i=t[n];if(i!==undefined){return new d({path:n,operator:f.EQ,value1:i,caseSensitive:l})}else{e=true;return new d({path:"XX"})}});if(e){return null}}const p=new d({filters:[new d("IsActiveEntity","EQ",false),new d("SiblingEntity/IsActiveEntity","EQ",null)],and:false});g.push(p);return new d(g,true)};h.getTechnicalPathFromPath=async function t(e,o,n){var i;const r=o.getMetaModel();let a=r.getMetaContext(e).getPath();if(!n||n.length===0){return null}const s=this.createFilterFromPath(e,n,r);if(s===null){return null}if(!((i=a)!==null&&i!==void 0&&i.startsWith("/"))){a=`/${a}`}const c=o.bindList(a,undefined,undefined,s,{$$groupId:"$auto.Heroes"});const l=await c.requestContexts(0,2);if(l.length){return l[0].getPath()}else{return null}};h.refreshContext=async function t(e,o,n){const i=this._oAppComponent.getRootViewController();if(i.isFclEnabled()){const t=e.getKeepAliveContext(o);n.replaceWith(t)}else{s.setEditStateDirty()}};h.checkDraftAvailability=function t(e,o){const n=/^[/]?(\w+)\([^/]+\)$/.exec(e);if(!n){return false}const i=`/${n[1]}`;const r=o.getObject(`${i}@com.sap.vocabularies.Common.v1.DraftRoot`);return r?true:false};h.resolvePath=async function t(e,o,n){var i,r,a;const s=o.getMetaModel();const g=this._oRoutingService.getLastSemanticMapping();let p=this._oRouter.getHashChanger().getHash().split("?")[0];if(((i=p)===null||i===void 0?void 0:i.lastIndexOf("/"))===((r=p)===null||r===void 0?void 0:r.length)-1){p=p.substring(0,p.length-1)}let u=(a=p)===null||a===void 0?void 0:a.substr(0,p.indexOf("("));if(u.indexOf("/")===0){u=u.substring(1)}const h=this.checkDraftAvailability(p,s),d=h?l.getSemanticKeys(s,u):undefined,f=c.isCollaborationDraftSupported(s);if(h&&f){var v;const t=(n===null||n===void 0?void 0:(v=n.useContext)===null||v===void 0?void 0:v.getProperty("IsActiveEntity"))??true;if(!t){return this.resolveCollaborationPath(e,o,n,d,u)}}if(d===undefined){return e}if((g===null||g===void 0?void 0:g.semanticPath)===e){return g.technicalPath}const C=d.map(t=>t.$PropertyPath);const y=await this.getTechnicalPathFromPath(p,o,C);if(y&&y!==e){this._oRoutingService.setLastSemanticMapping({technicalPath:y,semanticPath:e});return y}return e};h.resolveCollaborationPath=async function t(e,o,n,i,r){const a=this._oRoutingService.getLastSemanticMapping();const s=o.getMetaModel();const c=this._oRouter.getHashChanger().getHash().split("?")[0];let l;const g=(a===null||a===void 0?void 0:a.technicalPath)??e;if(i){l=i.map(t=>t.$PropertyPath)}else{l=s.getObject(`/${r}/$Type/$Key`)}const p=await this.getTechnicalPathFromPath(c,o,l);if(p===null){return e}if(p!==g&&n.useContext){var u;if(a){this._oRoutingService.setLastSemanticMapping({technicalPath:p,semanticPath:e})}n.redirectedToNonDraft=((u=s.getObject(`/${r}/@com.sap.vocabularies.UI.v1.HeaderInfo`))===null||u===void 0?void 0:u.TypeName)??r;await this.refreshContext(o,p,n.useContext)}return p};h._bindPageToPath=function t(e,o,i){const a=this._getBindingContext(),l=a&&a.getPath(),g=i.useContext;if(g&&g.getPath()===e){if(g!==a){let t=false;const e=this._oAppComponent.getRootViewController();if(e.isFclEnabled()&&i.reason===r.RowPress){const e=g.getModel().getMetaModel();if(!g.getBinding().hasPendingChanges()){t=true}else if(n.isConnected(this.getView())||c.isDraftSupported(e,g.getPath())&&c.isCollaborationDraftSupported(e)){g.getBinding().resetChanges();t=true}}this._bindPageToContext(g,o,i);if(t){g.refresh()}}}else if(l!==e){this._bindPageToContext(this._createContext(e,o),o,i)}else if(i.reason!==r.AppStateChanged&&s.isEditStateDirty()){this._refreshBindingContext(a)}};h._bindPageToContext=function e(o,n,i){if(!o){this.onBeforeBinding(null);this.onAfterBinding(null);return}const r=o.getBinding();const a=this._oAppComponent.getRootViewController();if(a.isFclEnabled()){if(!r||!r.isA("sap.ui.model.odata.v4.ODataListBinding")){o=this._createContext(o.getPath(),n)}try{this._setKeepAlive(o,true,()=>{if(a.isContextUsedInPages(o)){this.navigateBackFromContext(o)}},true)}catch(e){t.error(`View for ${o.getPath()} won't be synchronized. Parent listBinding must have binding parameter $$ownRequest=true`)}}else if(!r||r.isA("sap.ui.model.odata.v4.ODataListBinding")){o=this._createContext(o.getPath(),n)}this.onBeforeBinding(o,{editable:i.bTargetEditable,listBinding:r,bPersistOPScroll:i.bPersistOPScroll,bDraftNavigation:i.bDraftNavigation,showPlaceholder:i.bShowPlaceholder});this._setBindingContext(o);this.onAfterBinding(o,{redirectedToNonDraft:i===null||i===void 0?void 0:i.redirectedToNonDraft})};h._createContext=function e(n,i){const r=this._oPageComponent,a=r&&r.getEntitySet&&r.getEntitySet(),s=r&&r.getContextPath&&r.getContextPath()||a&&`/${a}`,c=i.getMetaModel(),l={$$groupId:"$auto.Heroes",$$updateGroupId:"$auto",$$patchWithoutSideEffects:true};const g=c.getObject(`${s}@com.sap.vocabularies.Common.v1.DraftRoot`);const p=c.getObject(`${s}@com.sap.vocabularies.Common.v1.DraftNode`);const u=this._oAppComponent.getRootViewController();if(u.isFclEnabled()){const t=this._getKeepAliveContext(i,n,false,l);if(!t){throw new Error(`Cannot create keepAlive context ${n}`)}else if(g||p){if(t.getProperty("IsActiveEntity")===undefined){t.requestProperty(["HasActiveEntity","HasDraftEntity","IsActiveEntity"]);if(g){t.requestObject("DraftAdministrativeData")}}else{t.requestSideEffects(g?["HasActiveEntity","HasDraftEntity","IsActiveEntity","DraftAdministrativeData"]:["HasActiveEntity","HasDraftEntity","IsActiveEntity"])}}return t}else{if(a){const t=c.getObject(`${s}/@com.sap.vocabularies.Common.v1.Messages/$Path`);if(t){l.$select=t}}if(g||p){if(l.$select===undefined){l.$select="HasActiveEntity,HasDraftEntity,IsActiveEntity"}else{l.$select+=",HasActiveEntity,HasDraftEntity,IsActiveEntity"}}if(this._oView.getBindingContext()){var h;const e=(h=this._oView.getBindingContext())===null||h===void 0?void 0:h.getBinding();e===null||e===void 0?void 0:e.resetChanges().then(()=>{e.destroy()}).catch(e=>{t.error("Error while reseting the changes to the binding",e)})}const e=i.bindContext(n,undefined,l);e.attachEventOnce("dataRequested",()=>{o.lock(this._oView)});e.attachEventOnce("dataReceived",this.onDataReceived.bind(this));return e.getBoundContext()}};h.onDataReceived=async function e(n){const i=n&&n.getParameter("error");if(o.isLocked(this._oView)){o.unlock(this._oView)}if(i){try{const t=await p.getLibraryResourceBundle("sap.fe.core",true);const e=this.base.messageHandler;let o={};if(i.status===503){o={isInitialLoad503Error:true,shellBack:true}}else if(i.status===400){o={title:t.getText("C_COMMON_SAPFE_ERROR"),description:t.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR_DESCRIPTION"),isDataReceivedError:true,shellBack:true}}else{o={title:t.getText("C_COMMON_SAPFE_ERROR"),description:i,isDataReceivedError:true,shellBack:true}}await e.showMessages(o)}catch(e){t.error("Error while getting the core resource bundle",e)}}};h._refreshBindingContext=function t(e){const o=this._oPageComponent;const n=this._oAppComponent.getSideEffectsService();const i=e.getPath();const r=o&&o.getEntitySet&&o.getEntitySet();const a=o&&o.getContextPath&&o.getContextPath()||r&&`/${r}`;const s=this._oView.getModel().getMetaModel();let c;const l=[];const g=[];const p={targetProperties:[],targetEntities:[]};function u(t){let e;const o=(t.getContext()&&t.getContext().getPath()||"").replace(i,"");const n=(o?`${o.slice(1)}/`:o)+t.getPath();if(t.isA("sap.ui.model.odata.v4.ODataContextBinding")){e=t.getDependentBindings();if(e){for(let t=0;t<e.length;t++){u(e[t])}}else if(l.indexOf(n)===-1){l.push(n)}}else if(t.isA("sap.ui.model.odata.v4.ODataListBinding")){if(l.indexOf(n)===-1){l.push(n)}}else if(t.isA("sap.ui.model.odata.v4.ODataPropertyBinding")){if(g.indexOf(n)===-1){g.push(n)}}}if(a){c=s.getObject(`${a}/@com.sap.vocabularies.Common.v1.Messages/$Path`)}u(e.getBinding());let h;for(h=0;h<l.length;h++){p.targetEntities.push({$NavigationPropertyPath:l[h]})}p.targetProperties=g;if(c){p.targetProperties.push(c)}p.targetProperties=p.targetProperties.reduce((t,e)=>{if(e){const o=e.indexOf("/");t.push(o>0?e.slice(0,o):e)}return t},[]);n.requestSideEffects([...p.targetEntities,...p.targetProperties],e)};h._getBindingContext=function t(){if(this._oPageComponent){return this._oPageComponent.getBindingContext()}else{return this._oView.getBindingContext()}};h._setBindingContext=function t(e){var o;let n,i;if(this._oPageComponent){n=this._oPageComponent.getBindingContext();i=this._oPageComponent}else{n=this._oView.getBindingContext();i=this._oView}i.setBindingContext(e);if((o=n)!==null&&o!==void 0&&o.isKeepAlive()&&n!==e){this._setKeepAlive(n,false)}};h._getFCLLevel=function t(){return this._oTargetInformation.FCLLevel};h._setKeepAlive=function t(e,o,n,i){if(e.getPath().endsWith(")")){const t=e.getModel().getMetaModel();const r=t.getMetaPath(e.getPath());const a=t.getObject(`${r}/@com.sap.vocabularies.Common.v1.Messages/$Path`);e.setKeepAlive(o,n,!!a&&i)}};h._getKeepAliveContext=function t(e,o,n,i){const r=o.split("/");const a=[];while(r.length&&!r[r.length-1].endsWith(")")){a.push(r.pop())}if(r.length===0){return undefined}const s=r.join("/");const c=e.getKeepAliveContext(s,n,i);if(a.length===0){return c}else{a.reverse();const t=a.join("/");return e.bindContext(t,c).getBoundContext()}};h.switchFullScreen=function e(){const o=this.base.getView();const n=o.getModel("fclhelper"),i=n.getProperty("/actionButtonsInfo/isFullScreen"),r=n.getProperty(i?"/actionButtonsInfo/exitFullScreen":"/actionButtonsInfo/fullScreen"),a=this._oAppComponent.getRootViewController();const s=a.getRightmostContext?a.getRightmostContext():o.getBindingContext();this.base._routing.navigateToContext(s,{sLayout:r}).catch(function(){t.warning("cannot switch between column and fullscreen")})};h.closeColumn=function t(){const e=this._oView.getViewData();const o=this._oView.getBindingContext();const n=o.getModel().getMetaModel();const r={noPreservationCache:true,sLayout:this._oView.getModel("fclhelper").getProperty("/actionButtonsInfo/closeColumn")};if((e===null||e===void 0?void 0:e.viewLevel)===1&&c.isDraftSupported(n,o.getPath())){i.processDataLossOrDraftDiscardConfirmation(()=>{this.navigateBackFromContext(o,r)},Function.prototype,o,this._oView.getController(),false,i.NavigationType.BackNavigation)}else{this.navigateBackFromContext(o,r)}};return u}(u),et(W.prototype,"onExit",[C],Object.getOwnPropertyDescriptor(W.prototype,"onExit"),W.prototype),et(W.prototype,"onInit",[y],Object.getOwnPropertyDescriptor(W.prototype,"onInit"),W.prototype),et(W.prototype,"onRouteMatched",[P,_],Object.getOwnPropertyDescriptor(W.prototype,"onRouteMatched"),W.prototype),et(W.prototype,"onRouteMatchedFinished",[m,x],Object.getOwnPropertyDescriptor(W.prototype,"onRouteMatchedFinished"),W.prototype),et(W.prototype,"onBeforeBinding",[b,w],Object.getOwnPropertyDescriptor(W.prototype,"onBeforeBinding"),W.prototype),et(W.prototype,"onAfterBinding",[O,B],Object.getOwnPropertyDescriptor(W.prototype,"onAfterBinding"),W.prototype),et(W.prototype,"navigateToTarget",[R],Object.getOwnPropertyDescriptor(W.prototype,"navigateToTarget"),W.prototype),et(W.prototype,"navigateToRoute",[E],Object.getOwnPropertyDescriptor(W.prototype,"navigateToRoute"),W.prototype),et(W.prototype,"navigateToContext",[A,D],Object.getOwnPropertyDescriptor(W.prototype,"navigateToContext"),W.prototype),et(W.prototype,"navigateBackFromContext",[S,T],Object.getOwnPropertyDescriptor(W.prototype,"navigateBackFromContext"),W.prototype),et(W.prototype,"navigateForwardToContext",[M,F],Object.getOwnPropertyDescriptor(W.prototype,"navigateForwardToContext"),W.prototype),et(W.prototype,"navigateBackFromTransientState",[I,V],Object.getOwnPropertyDescriptor(W.prototype,"navigateBackFromTransientState"),W.prototype),et(W.prototype,"navigateToMessagePage",[$,L],Object.getOwnPropertyDescriptor(W.prototype,"navigateToMessagePage"),W.prototype),et(W.prototype,"isCurrentStateImpactedBy",[j,H],Object.getOwnPropertyDescriptor(W.prototype,"isCurrentStateImpactedBy"),W.prototype),et(W.prototype,"onDataReceived",[k],Object.getOwnPropertyDescriptor(W.prototype,"onDataReceived"),W.prototype),et(W.prototype,"switchFullScreen",[N,K],Object.getOwnPropertyDescriptor(W.prototype,"switchFullScreen"),W.prototype),et(W.prototype,"closeColumn",[q,z],Object.getOwnPropertyDescriptor(W.prototype,"closeColumn"),W.prototype),W))||U);return ot},false);
//# sourceMappingURL=InternalRouting.js.map
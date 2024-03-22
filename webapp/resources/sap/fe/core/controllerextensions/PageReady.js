/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/controllerextensions/pageReady/DataQueryWatcher","sap/fe/core/services/TemplatedViewServiceFactory","sap/ui/base/EventProvider","sap/ui/core/Component","sap/ui/core/Core","sap/ui/core/mvc/ControllerExtension","sap/ui/core/mvc/OverrideExecution","../CommonUtils","../helpers/ClassSupport"],function(e,t,i,o,r,n,a,s,c,h){"use strict";var p,d,u,g,l,y,f,v,b,R,m,P,E,O,_,w,C,D,T,A,x,W,B;var I=h.publicExtension;var j=h.privateExtension;var F=h.methodOverride;var k=h.finalExtension;var U=h.extensible;var S=h.defineUI5Class;function q(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;M(e,t)}function M(e,t){M=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return M(e,t)}function z(e,t,i,o,r){var n={};Object.keys(o).forEach(function(e){n[e]=o[e]});n.enumerable=!!n.enumerable;n.configurable=!!n.configurable;if("value"in n||n.initializer){n.writable=true}n=i.slice().reverse().reduce(function(i,o){return o(e,t,i)||i},n);if(r&&n.initializer!==void 0){n.value=n.initializer?n.initializer.call(r):void 0;n.initializer=undefined}if(n.initializer===void 0){Object.defineProperty(e,t,n);n=null}return n}let H=(p=S("sap.fe.core.controllerextensions.PageReady"),d=F(),u=F(),g=I(),l=k(),y=F("_routing"),f=F("_routing"),v=F("_routing"),b=I(),R=k(),m=I(),P=k(),E=I(),O=k(),_=I(),w=k(),C=I(),D=k(),T=j(),A=U(s.Instead),x=I(),p(W=(B=function(a){q(s,a);function s(){var e;for(var t=arguments.length,i=new Array(t),o=0;o<t;o++){i[o]=arguments[o]}e=a.call(this,...i)||this;e.pageReadyTimeoutDefault=7e3;return e}var h=s.prototype;h.onInit=function e(){var i,n,a;this._nbWaits=0;this._oEventProvider=this._oEventProvider?this._oEventProvider:new o;this.view=this.getView();this.appComponent=c.getAppComponent(this.view);this.pageComponent=r.getOwnerComponentFor(this.view);const s=this.appComponent.getManifest();this.pageReadyTimeout=((i=s["sap.ui5"])===null||i===void 0?void 0:i.pageReadyTimeout)??this.pageReadyTimeoutDefault;if((n=this.pageComponent)!==null&&n!==void 0&&n.attachContainerDefined){this.pageComponent.attachContainerDefined(e=>this.registerContainer(e.getParameter("container")))}else{this.registerContainer(this.view)}const h=this.appComponent.getRootControl().getController();const p=h===null||h===void 0?void 0:(a=h.getPlaceholder)===null||a===void 0?void 0:a.call(h);if(p!==null&&p!==void 0&&p.isPlaceholderDebugEnabled()){this.attachEvent("pageReady",null,()=>{p.getPlaceholderDebugStats().iPageReadyEventTimestamp=Date.now()},this);this.attachEvent("heroesBatchReceived",null,()=>{p.getPlaceholderDebugStats().iHeroesBatchReceivedEventTimestamp=Date.now()},this)}this.queryWatcher=new t(this._oEventProvider,this.checkPageReadyDebounced.bind(this))};h.onExit=function e(){delete this._oAppComponent;if(this._oContainer){this._oContainer.removeEventDelegate(this._fnContainerDelegate)}};h.waitFor=function e(t){this._nbWaits++;t.finally(()=>{setTimeout(()=>{this._nbWaits--},0)}).catch(null)};h.onRouteMatched=function e(){this._bIsPageReady=false};h.onRouteMatchedFinished=async function e(){await this.onAfterBindingPromise;this.checkPageReadyDebounced()};h.registerAggregatedControls=function e(t){if(t){const e=t.getBinding();this.queryWatcher.registerBinding(e)}const i=[];const o=this.getView().findAggregatedObjects(true);o.forEach(e=>{const t=e.getObjectBinding();if(t){this.queryWatcher.registerBinding(t)}else{const t=Object.keys(e.mBindingInfos);t.forEach(t=>{const i=e.mBindingInfos[t].binding;if(i&&i.isA("sap.ui.model.odata.v4.ODataListBinding")){this.queryWatcher.registerBinding(i)}})}if(e.isA("sap.ui.mdc.Table")||e.isA("sap.ui.mdc.Chart")){this.bTablesChartsLoaded=false;i.push(this.queryWatcher.registerTableOrChart(e))}else if(e.isA("sap.fe.core.controls.FilterBar")){this.queryWatcher.registerFilterBar(e)}});return i};h.onAfterBinding=function t(i){if(this.pageReadyTimeoutTimer){clearTimeout(this.pageReadyTimeoutTimer)}this.pageReadyTimeoutTimer=setTimeout(()=>{e.error(`The PageReady Event was not fired within the ${this.pageReadyTimeout} ms timeout . It has been forced. Please contact your application developer for further analysis`);this._oEventProvider.fireEvent("pageReady")},this.pageReadyTimeout);if(this._bAfterBindingAlreadyApplied){return}this._bAfterBindingAlreadyApplied=true;if(this.isContextExpected()&&i===undefined){this.bHasContext=false;return}else{this.bHasContext=true}this.attachEventOnce("pageReady",null,()=>{clearTimeout(this.pageReadyTimeoutTimer);this.pageReadyTimeoutTimer=undefined;this._bAfterBindingAlreadyApplied=false;this.queryWatcher.reset()},null);this.onAfterBindingPromise=new Promise(async e=>{const t=this.registerAggregatedControls(i);if(t.length>0){await Promise.all(t);this.bTablesChartsLoaded=true;this.checkPageReadyDebounced();e()}else{this.checkPageReadyDebounced();e()}})};h.isPageReady=function e(){return this._bIsPageReady};h.waitPageReady=function e(){return new Promise(e=>{if(this.isPageReady()){e()}else{this.attachEventOnce("pageReady",null,()=>{e()},this)}})};h.attachEventOnce=function e(t,i,o,r){return this._oEventProvider.attachEventOnce(t,i,o,r)};h.attachEvent=function e(t,i,o,r){return this._oEventProvider.attachEvent(t,i,o,r)};h.detachEvent=function e(t,i){return this._oEventProvider.detachEvent(t,i)};h.registerContainer=function e(t){this._oContainer=t;this._fnContainerDelegate={onBeforeShow:()=>{this.bShown=false;this._bIsPageReady=false},onBeforeHide:()=>{this.bShown=false;this._bIsPageReady=false},onAfterShow:()=>{var e;this.bShown=true;(e=this.onAfterBindingPromise)===null||e===void 0?void 0:e.then(()=>{this._checkPageReady(true)})}};this._oContainer.addEventDelegate(this._fnContainerDelegate,this)};h.isContextExpected=function e(){return false};h.checkPageReadyDebounced=function e(){if(this.pageReadyTimer){clearTimeout(this.pageReadyTimer)}this.pageReadyTimer=setTimeout(()=>{this._checkPageReady()},200)};h._checkPageReady=function e(){let t=arguments.length>0&&arguments[0]!==undefined?arguments[0]:false;const o=()=>{if(!n.getUIDirty()){n.detachEvent("UIUpdated",o);this._bWaitingForRefresh=false;this.checkPageReadyDebounced()}};const r=()=>{if(n.getUIDirty()){setTimeout(r,500)}else if(this._bWaitingForRefresh){this._bWaitingForRefresh=false;n.detachEvent("UIUpdated",o);this.checkPageReadyDebounced()}};if(this.bShown&&this.queryWatcher.isDataReceived()!==false&&this.bTablesChartsLoaded!==false&&(!this.isContextExpected()||this.bHasContext)){if(this.queryWatcher.isDataReceived()===true&&!t&&!this._bWaitingForRefresh&&n.getUIDirty()){this.queryWatcher.resetDataReceived();this._bWaitingForRefresh=true;n.attachEvent("UIUpdated",o);setTimeout(r,500)}else if(!this._bWaitingForRefresh&&n.getUIDirty()||this._nbWaits!==0||i.getNumberOfViewsInCreationState()>0||this.queryWatcher.isSearchPending()){this._bWaitingForRefresh=true;n.attachEvent("UIUpdated",o);setTimeout(r,500)}else if(!this._bWaitingForRefresh){this._bIsPageReady=true;this._oEventProvider.fireEvent("pageReady")}}};return s}(a),z(B.prototype,"onInit",[d],Object.getOwnPropertyDescriptor(B.prototype,"onInit"),B.prototype),z(B.prototype,"onExit",[u],Object.getOwnPropertyDescriptor(B.prototype,"onExit"),B.prototype),z(B.prototype,"waitFor",[g,l],Object.getOwnPropertyDescriptor(B.prototype,"waitFor"),B.prototype),z(B.prototype,"onRouteMatched",[y],Object.getOwnPropertyDescriptor(B.prototype,"onRouteMatched"),B.prototype),z(B.prototype,"onRouteMatchedFinished",[f],Object.getOwnPropertyDescriptor(B.prototype,"onRouteMatchedFinished"),B.prototype),z(B.prototype,"onAfterBinding",[v],Object.getOwnPropertyDescriptor(B.prototype,"onAfterBinding"),B.prototype),z(B.prototype,"isPageReady",[b,R],Object.getOwnPropertyDescriptor(B.prototype,"isPageReady"),B.prototype),z(B.prototype,"waitPageReady",[m,P],Object.getOwnPropertyDescriptor(B.prototype,"waitPageReady"),B.prototype),z(B.prototype,"attachEventOnce",[E,O],Object.getOwnPropertyDescriptor(B.prototype,"attachEventOnce"),B.prototype),z(B.prototype,"attachEvent",[_,w],Object.getOwnPropertyDescriptor(B.prototype,"attachEvent"),B.prototype),z(B.prototype,"detachEvent",[C,D],Object.getOwnPropertyDescriptor(B.prototype,"detachEvent"),B.prototype),z(B.prototype,"isContextExpected",[T,A],Object.getOwnPropertyDescriptor(B.prototype,"isContextExpected"),B.prototype),z(B.prototype,"checkPageReadyDebounced",[x],Object.getOwnPropertyDescriptor(B.prototype,"checkPageReadyDebounced"),B.prototype),B))||W);return H},false);
//# sourceMappingURL=PageReady.js.map
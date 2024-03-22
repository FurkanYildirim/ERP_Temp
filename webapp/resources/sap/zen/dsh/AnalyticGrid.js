/*!
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define("sap/zen/dsh/AnalyticGrid",["jquery.sap.global","sap/base/Log","sap/ui/core/Control","sap/ui/thirdparty/URI","sap/zen/dsh/AnalyticGridRenderer","sap/zen/dsh/library"],function(jQuery,e,t,a,i){var r=t.extend("sap.zen.dsh.AnalyticGrid",{metadata:{library:"sap.zen.dsh",properties:{width:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:null},height:{type:"sap.ui.core.CSSSize",group:"Appearance",defaultValue:null},selection:{type:"object",group:"Data",defaultValue:null},queryName:{type:"string",group:"Data",defaultValue:null},systemAlias:{type:"string",group:"Data",defaultValue:null},state:{type:"string",group:"Data",defaultValue:null}},events:{stateChange:{parameters:{state:{type:"string"}}},selectionChange:{parameters:{selection:{type:"object"}}}}},renderer:i});sap.zen.dsh.DSH_deployment=true;var s=s||{};sap.zen.dsh.sapbi_page=sap.zen.dsh.sapbi_page||{};sap.zen.dsh.sapbi_page.getParameter=sap.zen.dsh.sapbi_page.getParameter||function(){return""};sap.zen.dsh.sapbi_MIMES_PIXEL=sap.zen.dsh.sapbi_MIMES_PIXEL||"";sap.zen.dsh.doReplaceDots=true;r.prototype.init=function(){this.parameters={};this.dshBaseUrl=a(sap.ui.resource("sap.zen.dsh","rt/")).absoluteTo(window.location.pathname).toString();sap.zen.dsh.sapbi_page.staticMimeUrlPrefix=this.dshBaseUrl;this.repositoryUrl=a(sap.ui.resource("sap.zen.dsh","applications/")).absoluteTo(window.location.pathname).toString()};r.prototype._initializeInternal=function(){if(this.initialized){this.page.forceFullNonDeltaRender();return}this.initialized=true;this._addParameter("XQUERY",this.getQueryName());if(this.getState()){this._initializeInnerAppState(this.getState())}else{this._initializeSelectionVariant(this.getSelection())}var e=this;setTimeout(function(){e._createPage()},0)};r.prototype._createPage=function(){sap.zen.dsh.scriptLoaded=true;var e=this;var t=sap.ui.getCore().getConfiguration();var a=t.getLocale().getSAPLogonLanguage();if(!a){a=window.navigator.userLanguage||window.navigator.language}var i="";if(window.document.cookie){var r=/(?:sap-usercontext=)*sap-client=(\d{3})/.exec(window.document.cookie);if(r&&r[1]){i=r[1]}}var s=sap.firefly.XHashMapOfStringByString.create();for(var n in this.parameters){s.put(n,this.parameters[n])}var o=new sap.zen.DesignStudio;o.setHost(window.document.location.hostname);o.setPort(window.document.location.port);o.setProtocol(window.document.location.protocol.split(":")[0]);o.setClient(i);o.setLanguage(a);if(this.repositoryUrl){o.setRepositoryUrl(this.repositoryUrl)}o.setApplicationPath(this.repositoryUrl+"0ANALYTIC_GRID");o.setApplicationName("0ANALYTIC_GRID");o.setUrlParameter(s);o.setSdkLoaderPath("");o.setHanaMode(true);o.setDshControlId(e.getId());o.setStaticMimesRootPath(this.dshBaseUrl);o.setSystemAlias(this.getSystemAlias());o.setNewBW(true);this.page=o.createPage();if(!sap.zen.dsh.wnd){sap.zen.dsh.wnd={}}sap.zen.dsh.wnd[e.getId()+"Buddha"]=this.page;sap.zen.dsh.sapbi_page=sap.zen.dsh.sapbi_page||{};sap.zen.dsh.sapbi_page.staticMimeUrlPrefix=this.dshBaseUrl;sap.zen.dsh.sapbi_page.getParameter=function(){return""};sap.zen.dsh.sapbi_MIMES_PIXEL=""};r.prototype.onAfterRendering=function(){this._initializeInternal()};r.prototype._logoff=function(){if(!this.loggedOff){this.loggedOff=true;this._executeScript("APPLICATION.logoff();")}};r.prototype.exit=function(){this._logoff();var e=sap.ui.getCore().byId(this.sId+"ROOT_absolutelayout");if(e){e.destroy()}};r.prototype._addParameter=function(e,t){this.parameters[e]=t};r.prototype._executeScript=function(e){if(this.page){this.page.getWindow().increaseLock();this.page.exec&&this.page.exec(e)}};r.prototype.setSelection=function(e){this.setProperty("selection",e,true);if(this.initialized){var t=this._buildNavParamObject(e);this.page.navigationParamObject=JSON.stringify(t);this._executeScript("GLOBAL_SCRIPT_ACTIONS.ApplyNavigationParameters();")}return this};r.prototype.fireSelectionChange=function(e){this.setProperty("selection",e.selection,true);return this.fireEvent("selectionChange",e)};r.prototype._buildNavParamObject=function(e){function t(e,t,a){if(!Object.prototype.hasOwnProperty.call(t,e)){t[e]=a}}var a={};if(e){var i=e.Parameters;var r=e.SelectOptions;if(i){for(var s=0;s<i.length;s++){var n=i[s];a[n.PropertyName]=n.PropertyValue}}if(r){for(var o=0;o<r.length;++o){var p=r[o];var l=p.Ranges;var u=[];for(var h=0;h<l.length;++h){var d;var c=l[h];if(["EQ","BT","GE","LE","GT","LT"].indexOf(c.Option)==-1){continue}if(c.Sign==="I"&&c.Option==="EQ"){d=c.Low}else{d={exclude:c.Sign==="E"||undefined,operation:c.Option,from:c.Low,to:c.High}}u.push(d)}if(u.length>0){t(p.PropertyName,a,u)}}}}return a};r.prototype._initializeSelectionVariant=function(e){var t=this._buildNavParamObject(e);if(!jQuery.isEmptyObject(t)){this._addParameter("NAV_PARAMS",JSON.stringify(t))}};r.prototype._initializeInnerAppState=function(e){if(e){this._addParameter("NAV_INITIAL_STATE",e)}};r.prototype.setState=function(e){this.setProperty("state",e,true);if(this.initialized){this.page.getWindow().getContext("BookmarkInternal").applyApplicationState(e,true);this.page.forceFullNonDeltaRender()}return this};r.prototype.fireStateChange=function(e){this.setProperty("state",e.state,true);return this.fireEvent("stateChange",e)};return r});
//# sourceMappingURL=AnalyticGrid.js.map
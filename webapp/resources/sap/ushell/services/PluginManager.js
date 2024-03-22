// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/ui/thirdparty/jquery","sap/ushell/components/applicationIntegration/application/PostMessageAPIInterface","sap/ushell/services/_PluginManager/Extensions","sap/ushell/UI5ComponentType","sap/ushell/utils"],function(e,jQuery,n,i,t,o){"use strict";var r="sap.ushell.services.PluginManager";var a="sap-ushell-plugin-type";var s="RendererExtensions";var l="sap.ushell.components.shell.defaults";var u=[s,"UserDefaults","UserImage","AppWarmup"];function g(g,c,f){var p=this;this._oPluginCollection={};this._oCategoryLoadingProgress={};this._mInitializedComponentPromise={};this._sPluginAgentsNames="";this._oConfig=f&&f.config||{};if(this._oConfig.isBlueBox===undefined){this._oConfig.isBlueBox=false}u.forEach(function(e){p._oPluginCollection[e]={};p._oCategoryLoadingProgress[e]=new jQuery.Deferred});this._handlePluginCreation=function(n,i,t,a){var s=this,l=s._oPluginCollection[n][i];o.setPerformanceMark("FLP -- PluginManager.loadPlugin["+n+"]["+i+"]");try{if(l.hasOwnProperty("component")){if(s._mInitializedComponentPromise.hasOwnProperty(l.component)){s._mInitializedComponentPromise[l.component].then(function(){s._instantiateComponent(l,t,a)},function(){s._instantiateComponent(l,t,a)})}else{s._mInitializedComponentPromise[l.component]=s._instantiateComponent(l,t,a)}}else{e.error("Invalid plugin configuration. The plugin "+i+" must contain a <component> key",r)}}catch(n){e.error("Error while loading bootstrap plugin: "+l.component||"",r);if(t){t.reject(n)}}};this._getFileNameForXhrAuth=function(){return"Component-preload.js"};this._handleXhrAuthentication=function(n,i){var t;if(n&&["true",true,"X"].indexOf(n["sap-ushell-xhr-authentication"])>-1){if(!i){e.error(["Illegal state: configuration parameter 'sap-ushell-xhr-authentication-timeout' set, but no component URL specified.","XHR authentication request will not be sent. Please check the target mapping definitions for plug-ins","and the application index."].join(" "),undefined,r);return jQuery.when()}if(n.hasOwnProperty("sap-ushell-xhr-authentication-timeout")){t=parseInt(n["sap-ushell-xhr-authentication-timeout"],10);if(isNaN(t)){e.error(["Invalid value for configuration parameter 'sap-ushell-xhr-authentication-timeout' for plug-in component with URL '",i,"': '",n["sap-ushell-xhr-authentication-timeout"],"' is not a number. Timeout will be ignored."].join(""),undefined,r)}else{sap.ushell.Container.setXhrLogonTimeout(i,t)}}return jQuery.ajax(i+"/"+this._getFileNameForXhrAuth(),{dataType:"text"})}return jQuery.when()};this._instantiateComponent=function(n,o,a){var s=new jQuery.Deferred,l=JSON.parse(JSON.stringify(n)),u={ui5ComponentName:l.component,url:l.url,getExtensions:i.bind(null,n.component)};function g(n){return function(i){n=n||"Cannot create UI5 plugin component: (componentId/appdescrId :"+u.ui5ComponentName+")\n"+i+" properties "+JSON.stringify(u)+"\n This indicates a plugin misconfiguration, see e.g. Note 2316443.";i=i||"";e.error(n,i.stack,r);if(o){o.reject.apply(this,arguments)}s.reject.apply(this,arguments)}}l.name=l.component;delete l.component;u.applicationDependencies=l;if(l.config){u.applicationConfiguration=l.config;delete l.config}u.loadDefaultDependencies=false;if(a!==undefined){u.oPostMessageInterface=a}sap.ushell.Container.getServiceAsync("Ui5ComponentLoader").then(function(e){this._handleXhrAuthentication(u.applicationConfiguration,l.url).done(function(){e.createComponent(u,{},[],t.Plugin).done(function(e){if(o){o.resolve(e)}s.resolve.apply(this,arguments)}).fail(g())}).fail(g("XHR logon for FLP plugin failed"))}.bind(this)).catch(g());return s.promise()};this.getSupportedPluginCategories=function(){return JSON.parse(JSON.stringify(u))};this.getRegisteredPlugins=function(){return JSON.parse(JSON.stringify(this._oPluginCollection))};this.registerPlugins=function(n){var i=this,t,o,l,g=[],c,f;if(!n){return}if(this._oConfig.isBlueBox===true){c=new URLSearchParams(window.location.search).get("sap-plugins");if(c&&c.length>0){c=","+c+","}else{c=undefined}}Object.keys(n).sort().forEach(function(p){t=n[p]||{};o=t.config||{};l=o[a]||"";if(t.enabled===false){return}if(!i._isFormFactorSupported(t)){e.info("Plugin '"+p+"' filtered from result: form factor not supported");return}if(i._oConfig.isBlueBox===true){if(t.config&&t.config["sap-plugin-agent"]===true){f=t.config["sap-plugin-agent-id"]||p;if(c){if(c.indexOf(","+f+",")<0){return}}else{return}}}if(t.enabled===undefined){t.enabled=true}if(t.hasOwnProperty("module")){var d=(t.module||"").replace(/\./g,"/");e.error("Plugin "+p+" cannot get registered, because the module mechanism for plugins is not valid anymore. Plugins need to be defined as SAPUI5 components.",r);try{sap.ui.requireSync(d)}catch(n){e.error("Plugin module "+d+" is not found.")}return}if(o&&o.hasOwnProperty(a)){if(u&&Array.prototype.indexOf.call(u,l)!==-1){if(g.indexOf(l)===-1){g.push(l)}i._oPluginCollection[l][p]=JSON.parse(JSON.stringify(t))}else{e.warning("Plugin "+p+" will not be inserted into the plugin collection of the PluginManager, because of unsupported category "+l,r)}}else{i._oPluginCollection[s][p]=JSON.parse(JSON.stringify(t));if(g.indexOf(s)===-1){g.push(s)}}});try{if(i._oConfig.isBlueBox!==true){i._buildNamesOfPluginsWithAgents()}}catch(n){e.error("failed to build plugin agents names list",n.message||n.toString(),"sap.ushell.services.PluginManager")}g.forEach(function(e){if(i._oCategoryLoadingProgress.hasOwnProperty(e)&&i._oCategoryLoadingProgress[e].state()==="resolved"){i.loadPlugins(e)}})};this._isFormFactorSupported=function(e){var n=e.deviceTypes,i=o.getFormFactor();if(n&&n[i]===false){return false}return true};this.getPluginLoadingPromise=function(e){if(this._oCategoryLoadingProgress.hasOwnProperty(e)){return this._oCategoryLoadingProgress[e].promise()}};this.loadPlugins=function(i){var t=this,a,g,c,f;o.setPerformanceMark("FLP -- PluginManager.startLoadPlugins["+i+"]");if(i===s){f=n.getInterface()}if(u&&Array.prototype.indexOf.call(u,i)!==-1){if(t._oCategoryLoadingProgress[i].pluginLoadingTriggered===undefined){t._oCategoryLoadingProgress[i].pluginLoadingTriggered=true}if(Object.keys(t._oPluginCollection[i]).length>0){a=[];c=Object.keys(t._oPluginCollection[i]);if(new URLSearchParams(window.location.search).get("sap-ushell-xx-pluginmode")==="discard"&&(i==="RendererExtensions"||i==="AppWarmup")){c=c.filter(function(e){return t._oPluginCollection[i][e].component===l})}c.forEach(function(e){var n=t._oPluginCollection[i][e];if(!n.loaded){n.loaded=true;g=new jQuery.Deferred;a.push(g.promise());t._handlePluginCreation(i,e,g,f)}});if(a.length>0){jQuery.when.apply(undefined,a).done(function(){o.setPerformanceMark("FLP -- PluginManager.endLoadPlugins["+i+"]");t._oCategoryLoadingProgress[i].resolve()}).fail(t._oCategoryLoadingProgress[i].reject.bind())}}else{t._oCategoryLoadingProgress[i].resolve()}}else{e.error("Plugins with category "+i+" cannot be loaded by the PluginManager",r);t._oCategoryLoadingProgress[i].reject("Plugins with category "+i+" cannot be loaded by the PluginManager")}return t._oCategoryLoadingProgress[i].promise()};this._buildNamesOfPluginsWithAgents=function(){var e=this,n="",i;Object.keys(e._oPluginCollection).forEach(function(t){Object.keys(e._oPluginCollection[t]).forEach(function(o){i=e._oPluginCollection[t][o];if(i&&i.enabled&&i.enabled===true){if(i.config&&i.config["sap-plugin-agent"]===true){n+=(i.config["sap-plugin-agent-id"]||o)+","}}})});if(n.endsWith(",")){n=n.slice(0,-1)}this._sPluginAgentsNames=n};this._getNamesOfPluginsWithAgents=function(){return this._sPluginAgentsNames}}g.hasNoAdapter=true;return g},true);
//# sourceMappingURL=PluginManager.js.map
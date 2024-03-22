/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/thirdparty/hasher","sap/ui/core/BusyIndicator","sap/ushell/appRuntime/ui5/plugins/baseRta/BaseRTAPluginStatus","sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"],function(t,i,e,s){"use strict";var r=e.STATUS_STARTING;var n=e.STATUS_STARTED;var o=e.STATUS_STOPPING;var a=e.STATUS_STOPPED;var h=function(t){this.mConfig=t;this.sStatus=e.STATUS_STOPPED;this.oStartingPromise=null;this.oStoppingPromise=null;var i=s.getContainer();i.registerDirtyStateProvider(this._dirtyStateProvider.bind(this));this.oInitPromise=i.getServiceAsync("URLParsing").then(function(t){this.oURLParsingService=t}.bind(this)).catch(function(t){throw new Error("Error during retrieval of URLParsing ushell service: "+t)})};function u(){return new Promise(function(t,i){sap.ui.require(["sap/ui/rta/api/startAdaptation"],t,i)})}function p(){return s.getCurrentRunningApplication().then(function(t){return t.componentInstance})}function l(t,i){var e;if(t instanceof Error){e=i.getText("TECHNICAL_ERROR")}else if(typeof t==="string"){e=t}sap.ui.require(["sap/ui/rta/Utils","sap/m/MessageBox"],function(t,s){s.error(e,{title:i.getText("ERROR_TITLE"),onClose:null,styleClass:t.getRtaStyleClassName()})})}h.prototype.getInitPromise=function(){return this.oInitPromise};h.prototype._onRtaFailed=function(t){i.hide();this._oRTA=t.getSource();this.mConfig.onErrorHandler();l(t.getParameter("error"),this.mConfig.i18n)};h.prototype._startRta=function(){this.sStatus=r;sap.ui.getCore().getEventBus().subscribe("sap.ushell.renderers.fiori2.Renderer","appClosed",this._onAppClosed,this);sap.ui.getCore().getEventBus().subscribe("sap.ushell","appKeepAliveDeactivate",this._onAppClosed,this);i.show(0);var e;return p().then(function(t){e=t;return sap.ui.getCore().loadLibrary("sap.ui.rta",{async:true})}).then(u.bind(this)).then(function(i){this.sOldHash=t.getHash();var s={rootControl:e,flexSettings:{layer:this.mConfig.layer,developerMode:this.mConfig.developerMode}};return i(s,this.mConfig.loadPlugins,this.mConfig.onStartHandler,this._onRtaFailed.bind(this),this.mConfig.onStopHandler)}.bind(this)).then(function(t){i.hide();this._oRTA=t;this.sStatus=n}.bind(this)).catch(function(t){i.hide();if(t.reason==="flexEnabled"){this.handleFlexDisabledOnStart()}else if(t==="Reload triggered"){this.sStatus=a}}.bind(this))};h.prototype._stopRta=function(){this.sStatus=o;return this._oRTA.stop.apply(this._oRTA,arguments).then(function(){this.exitRta()}.bind(this))};h.prototype.triggerStartRta=function(){var t=this.sStatus;switch(t){case r:break;case n:this.oStartingPromise=Promise.resolve();break;case o:this.oStartingPromise=this.oStoppingPromise.then(function(){return this._startRta()}.bind(this));break;case a:this.oStartingPromise=this._startRta();break;default:}if(t!==r){this.oStartingPromise.then(function(){this.oStartingPromise=null}.bind(this))}return this.oStartingPromise};h.prototype.triggerStopRta=function(){var t=this.sStatus;switch(t){case r:this.oStoppingPromise=this.oStartingPromise.then(function(){return this._stopRta.apply(this,arguments)}.bind(this));break;case n:this.oStoppingPromise=this._stopRta.apply(this,arguments);break;case o:break;case a:this.oStoppingPromise=Promise.resolve();break;default:}if(t!==o){this.oStoppingPromise.then(function(){this.oStoppingPromise=null}.bind(this))}return this.oStoppingPromise};h.prototype.handleFlexDisabledOnStart=function(){sap.ui.require(["sap/ui/rta/util/showMessageBox","sap/m/MessageBox"],function(t,i){t(this.mConfig.i18n.getText("MSG_FLEX_DISABLED"),{icon:i.Icon.INFORMATION,title:this.mConfig.i18n.getText("HEADER_FLEX_DISABLED"),actions:[i.Action.OK],initialFocus:null,isCustomAction:false})}.bind(this))};h.prototype._dirtyStateProvider=function(){if(this._oRTA&&this.sStatus===n){var i=t.getHash();var e=this.oURLParsingService.parseShellHash(i);var s=this.oURLParsingService.parseShellHash(this.sOldHash);this.sOldHash=i;if(e.semanticObject===s.semanticObject&&e.action===s.action&&e.appSpecificRoute!==s.appSpecificRoute){return false}return this._oRTA.canSave()}return false};h.prototype.exitRta=function(){if(this._oRTA){this._oRTA.destroy();this.sStatus=a;this.oStartingPromise=null;this.oStoppingPromise=null;this._oRTA=null}sap.ui.getCore().getEventBus().unsubscribe("sap.ushell.renderers.fiori2.Renderer","appClosed",this._onAppClosed,this);sap.ui.getCore().getEventBus().unsubscribe("sap.ushell","appKeepAliveDeactivate",this._onAppClosed,this)};h.prototype._onAppClosed=function(){this.triggerStopRta(true,true)};return h},true);
//# sourceMappingURL=Trigger.js.map
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/ShellNavigationHashChanger","sap/m/MessageBox","sap/ui/core/routing/HashChanger"],function(t,i,e){"use strict";var a=i.Action;var n=i.Icon;function s(i,s,h){function r(){sap.ui.require(["sap/m/MessageBox"],function(t){t.show("Due to a configuration change on the server,\nclient and server are out of sync.\n We strongly recommend to reload the page soon.\nReload page now?",{icon:n.ERROR,title:"Client out of sync with server.",actions:[a.YES,a.NO],onClose:function(t){if(t===a.YES){window.setTimeout(function(){window.location.reload()},0)}}})})}var o=h&&h.config;this.hashChanger=new t(o);this._navigationFilterForForwardingToRegisteredRouters=function(t,i){var e=this._aRouters.some(function(t){return t.match(i)});if(e){var a=t.getCurrentApplication();var n=a&&a.componentInstance&&!a.homePage;if(n){var s=a.componentInstance.getRouter();if(s){s.stop()}}return this.NavigationFilterStatus.Keep}return this.NavigationFilterStatus.Continue};this.getNavigationContext=function(){var t=this.hashChanger.getCurrentNavigationState();var i=!this.hashChanger.isInnerAppNavigation(t.oldHash,t.newHash);return{status:t.status,isCrossAppNavigation:i,innerAppRoute:this.hashChanger.getHash()}};this.isInitialNavigation=function(){return this._bIsInitialNavigation};this.setIsInitialNavigation=function(t){this._bIsInitialNavigation=t};this.hrefForExternal=function(t,i,e,a){return this.hashChanger.hrefForExternal(t,i,e,a)};this.hrefForAppSpecificHash=function(t){return this.hashChanger.hrefForAppSpecificHash(t)};this.compactParams=function(t,i,e,a){return this.hashChanger.compactParams(t,i,e,a)};this.toExternal=function(t,i,e){return this.hashChanger.toExternal(t,i,e)};this.toAppHash=function(t,i){this.hashChanger.toAppHash(t,i)};this.init=function(t){this._bIsInitialNavigation=true;hasher.prependHash="";e.replaceHashChanger(this.hashChanger);var i=sap.ui.getCore().getEventBus();i.subscribe("sap.ui.core.UnrecoverableClientStateCorruption","RequestReload",r);this.hashChanger.initShellNavigation(t);this._enableHistoryEntryReplacedDetection();return this};this._enableHistoryEntryReplacedDetection=function(){this._lastHashChangeMode=null;this._fnOriginalSetHash=hasher.setHash;this._fnOriginalReplaceHash=hasher.replaceHash;hasher.setHash=function(){this._hashChangedByApp=true;this._lastHashChangeMode="setHash";return this._fnOriginalSetHash.apply(hasher,arguments)}.bind(this);hasher.replaceHash=function(){this._hashChangedByApp=true;this._lastHashChangeMode="replaceHash";return this._fnOriginalReplaceHash.apply(hasher,arguments)}.bind(this)};this.wasHistoryEntryReplaced=function(){return this._lastHashChangeMode==="replaceHash"};this.resetHistoryEntryReplaced=function(){this._lastHashChangeMode=null};this.replaceHashWithoutNavigation=function(t){hasher.changed.active=false;this._fnOriginalSetHash(t);hasher.changed.active=true};this.NavigationFilterStatus=this.hashChanger.NavigationFilterStatus;this.registerNavigationFilter=function(t){this.hashChanger.registerNavigationFilter(t)};this._aRouters=[];this.registerExtraRouter=function(t){this._aRouters.push(t)};this.unregisterNavigationFilter=function(t){this.hashChanger.unregisterNavigationFilter(t)};this.registerNavigationFilter(function(){if(!this._hashChangedByApp){this.resetHistoryEntryReplaced()}this._hashChangedByApp=undefined;return this.NavigationFilterStatus.Continue}.bind(this));this.registerPrivateFilters=function(t){this.registerNavigationFilter(this._navigationFilterForForwardingToRegisteredRouters.bind(this,t))}}s.hasNoAdapter=true;return s},true);
//# sourceMappingURL=ShellNavigation.js.map
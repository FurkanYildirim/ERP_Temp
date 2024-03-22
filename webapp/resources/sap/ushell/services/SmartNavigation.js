// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ushell/utils","sap/ushell/services/AppConfiguration","sap/base/Log","sap/ushell/utils/UrlParsing"],function(jQuery,e,t,r,n){"use strict";function a(e,t,r){this._oServiceConfig=r;this._oCrossAppNavigationServicePromise=sap.ushell.Container.getServiceAsync("CrossApplicationNavigation");this._oPersonalizationServicePromise=sap.ushell.Container.getServiceAsync("Personalization");this._oHashCodeCache={"":0}}a.STATISTIC_COLLECTION_WINDOW_DAYS=90;a.PERS_CONTAINER_KEY_PREFIX="ushell.smartnav.";a.ONE_DAY_IN_MILLISECOND=24*60*60*1e3;a.prototype.getLinks=function(e){var n=new jQuery.Deferred;r.error("Call to deprecated service: 'SmartNavigation.getLinks'. Please use 'CrossApplicationNavigation.getLinks' instead",null,"sap.ushell.services.SmartNavigation");this._oCrossAppNavigationServicePromise.then(function(a){var i=a.getLinks(e);if(!this._isTrackingEnabled(this._oServiceConfig)){i.done(n.resolve).fail(n.reject);return}var o=t.getCurrentApplication();var s=o.sShellHash;var l=o.componentHandle;if(o.componentHandle){l=o.componentHandle.getInstance()}if(!s){r.warning("Call to SmartNavigation#getLinks() simply delegated to CrossApplicationNavigation#getLinks()"+" because AppConfiguration#getCurrentApplication()#sShellHash evaluates to undefined.");i.done(n.resolve).fail(n.reject);return}var c=this._getNavigationOccurrences(s,l);jQuery.when(i,c).done(function(e,t){if(t.length===0){n.resolve(e);return}var r=this._prepareLinksForSorting(e,t);e=r.sort(function(e,t){return t.clickCount-e.clickCount});n.resolve(e)}.bind(this)).fail(n.reject)}.bind(this)).catch(n.reject);return n.promise()};a.prototype.toExternal=function(e){var n=arguments;r.error("Call to deprecated service: 'SmartNavigation.toExternal'. Please use 'CrossApplicationNavigation.toExternal' instead",null,"sap.ushell.services.SmartNavigation");this._oCrossAppNavigationServicePromise.then(function(a){if(!this._isTrackingEnabled(this._oServiceConfig)){a.toExternal.apply(a,n);return}var i=t.getCurrentApplication();var o=i.sShellHash;var s=i.componentHandle;if(i.componentHandle){s=i.componentHandle.getInstance()}if(!o){r.warning("Current shell hash could not be identified. Navigation will not be tracked.",null,"sap.ushell.services.SmartNavigation");a.toExternal.apply(a,n);return}var l=this._getHashFromOArgs(e.target);if(!l){r.warning("Destination hash does not conform with the ushell guidelines. Navigation will not be tracked.",null,"sap.ushell.services.SmartNavigation");a.toExternal.apply(a,n);return}this._recordNavigationOccurrences(o,l,s).then(function(){a.toExternal.apply(a,n)})}.bind(this))};a.prototype.hrefForExternal=function(){r.error("Deprecated API call of 'sap.ushell.services.SmartNavigation.hrefForExternal'. Please use 'hrefForExternalAsync' instead.",null,"sap.ushell.services.SmartNavigation");var e=sap.ushell.Container.getService("CrossApplicationNavigation");return e.hrefForExternal.apply(e,arguments)};a.prototype.hrefForExternalAsync=function(){var e=arguments;r.error("Call to deprecated service: 'SmartNavigation.hrefForExternalAsync'. Please use 'CrossApplicationNavigation.hrefForExternalAsync' instead",null,"sap.ushell.services.SmartNavigation");return this._oCrossAppNavigationServicePromise.then(function(t){return t.hrefForExternalAsync.apply(t,e)})};a.prototype.getPrimaryIntent=function(){var e=new jQuery.Deferred;var t=arguments;r.error("Call to deprecated service: 'SmartNavigation.getPrimaryIntent'. Please use 'CrossApplicationNavigation.getPrimaryIntent' instead",null,"sap.ushell.services.SmartNavigation");this._oCrossAppNavigationServicePromise.then(function(r){r.getPrimaryIntent.apply(r,t).done(e.resolve).fail(e.reject)}).catch(e.reject);return e.promise()};a.prototype.trackNavigation=function(e){r.error("Call to deprecated service: 'SmartNavigation.trackNavigation'.",null,"sap.ushell.services.SmartNavigation");if(!this._isTrackingEnabled(this._oServiceConfig)){r.debug("Call to SmartNavigation#trackNavigation() ignored because Service is not enabled via Configuration",null,"sap.ushell.services.SmartNavigation");return jQuery.when(null)}var n=e.target;var a=t.getCurrentApplication();var i=a.sShellHash;var o;if(!i){r.warning("Call to SmartNavigation#trackNavigation() simply ignored"+" because AppConfiguration#getCurrentApplication()#sShellHash evaluates to undefined.");return jQuery.when(null)}o=this._getHashFromOArgs(n);if(!o){r.warning("Navigation not tracked - no valid destination provided",null,"sap.ushell.services.SmartNavigation");return jQuery.when(null)}r.debug("Navigation to "+o+" was tracked out of "+i,null,"sap.ushell.services.SmartNavigation");return this._recordNavigationOccurrences(i,o,a.componentHandle.getInstance())};a.prototype._isTrackingEnabled=function(t){return e.isDefined(t)&&e.isDefined(t.config)&&e.isDefined(t.config.isTrackingEnabled)?t.config.isTrackingEnabled:false};a.prototype._getHashCode=function(e){var t=e+"";if(this._oHashCodeCache[t]){return this._oHashCodeCache[t]}var r=0;var n=t.length;while(n--){r=(r<<5)-r+(t.charCodeAt(n)|0);r|=0}this._oHashCodeCache[t]=r;return r};a.prototype._getBaseHashPart=function(e){var t=n.parseShellHash(e);if(t&&t.semanticObject&&t.action){return t.semanticObject+"-"+t.action}throw"Invalid intent `"+e+"`"};a.prototype._getHashFromOArgs=function(e){if(!e){return null}if(e.shellHash&&n.parseShellHash(e.shellHash)){return this._getBaseHashPart(e.shellHash)}if(e.semanticObject&&e.action){return e.semanticObject+"-"+e.action}return null};a.prototype._getPersContainerKey=function(e){return a.PERS_CONTAINER_KEY_PREFIX+this._getHashCode(e)};a.prototype._getNavigationOccurrences=function(e,t){var r=new jQuery.Deferred;var n=this._getPersContainerKey(e);this._oPersonalizationServicePromise.then(function(e){var a=e.getContainer(n,{keyCategory:e.constants.keyCategory.FIXED_KEY,writeFrequency:e.constants.writeFrequency.HIGH,clientStorageAllowed:true},t);a.done(function(e){var t=e.getItemKeys();var n=t.map(function(t){var r=e.getItemValue(t);var n=Object.keys(r.actions);return n.map(function(e){var n=r.actions[e];var a=n.dailyFrequency.reduce(function(e,t){return e+t},0);return{intent:t+"-"+e,clickCount:a}})});var a=n.reduce(function(e,t){Array.prototype.push.apply(e,t);return e},[]);r.resolve(a)})}).catch(r.reject);return r.promise()};a.prototype._prepareLinksForSorting=function(e,t){var r={};t.forEach(function(e){r[e.intent]=e});e.forEach(function(e){var t=this._getBaseHashPart(e.intent);var n=r[t];e.clickCount=n?n.clickCount:0}.bind(this));return e};a.prototype._recordNavigationOccurrences=function(e,t,r){var a=n.parseShellHash(t);var i=this._getPersContainerKey(e);var o=a.semanticObject;var s=new jQuery.Deferred;this._oPersonalizationServicePromise.then(function(e){var t=e.getContainer(i,{keyCategory:e.constants.keyCategory.FIXED_KEY,writeFrequency:e.constants.writeFrequency.HIGH,clientStorageAllowed:true},r);t.done(function(e){var t=e.getItemValue(o);var r=a.action;if(!t){t={actions:{},latestVisit:Date.now(),dailyFrequency:[0]}}var n=t.actions[r];if(!n){n={latestVisit:Date.now(),dailyFrequency:[0]};t.actions[r]=n}this._updateHistoryEntryWithCurrentUsage(t);this._updateHistoryEntryWithCurrentUsage(n);e.setItemValue(o,t);e.save().done(s.resolve).fail(s.reject)}.bind(this)).fail(s.reject)}.bind(this)).catch(s.reject);return s.promise()};a.prototype._updateHistoryEntryWithCurrentUsage=function(e){var t=Date.now();var r=t-e.latestVisit;var n=Math.floor(r/a.ONE_DAY_IN_MILLISECOND);while(n--){e.dailyFrequency.unshift(0);if(e.dailyFrequency.length>a.STATISTIC_COLLECTION_WINDOW_DAYS){e.dailyFrequency.pop()}}++e.dailyFrequency[0];e.latestVisit=t;return e};a.hasNoAdapter=true;return a});
//# sourceMappingURL=SmartNavigation.js.map
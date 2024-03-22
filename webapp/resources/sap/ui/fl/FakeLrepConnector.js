/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/Cache","sap/ui/fl/write/_internal/connectors/ObjectPathConnector","sap/ui/fl/apply/_internal/connectors/ObjectStorageUtils","sap/ui/core/Configuration"],function(e,t,n,i){"use strict";var r={};var c="sap.ui.fl";r.prototype={};r.enableFakeConnector=function(e){this.setFlexibilityServicesAndClearCache("LocalStorageConnector",e)};r.setFlexibilityServicesAndClearCache=function(n,r){this._oFlexibilityServices=i.getFlexibilityServices();var c=[];if(r){t.setJsonPath(r);c.push({connector:"ObjectPathConnector"})}c.push({connector:n});i.setFlexibilityServices(c);e.clearEntries()};r.disableFakeConnector=function(){r.prototype={};e.clearEntries();if(this._oFlexibilityServices){i.setFlexibilityServices(this._oFlexibilityServices);delete this._oFlexibilityServices}};r.forTesting={getNumberOfChanges:function(e,t){return e.loadFlexData({reference:t}).then(function(e){return e.reduce(function(e,t){return e+t.changes.length},0)})},spyMethod:function(e,t,n,i){var r=e.spy(n,i);return function(e,n){n=n||0;var c=r.getCall(n).args[0].flexObjects.length;t.equal(c,e,i+" was called "+e+" times")}},clear:function(t,n){e.clearEntries();return t.reset(n)},setStorage:function(e,t){e.storage=t},synchronous:{clearAll:function(e){var t=function(t){var n=t.includes(c);if(!n){return}e.removeItem(t)};Object.keys(e).map(t)},store:function(e,t,i){var r=n.createFlexKey(t);var c=JSON.stringify(i);e.setItem(r,c)},getNumberOfChanges:function(e,t){return Object.keys(e).filter(function(i){return i.includes(c)&&n.isSameReference(JSON.parse(e.getItem(i)),t)}).length}}};return r},true);
//# sourceMappingURL=FakeLrepConnector.js.map
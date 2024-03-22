// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/_AppState/AppStatePersistencyMethod","sap/ui/thirdparty/jquery","sap/base/Log"],function(e,jQuery,t){"use strict";var r=function(e,t,r){this._oConfig=r&&r.config};r.prototype._getPersonalizationService=function(){return sap.ushell.Container.getServiceAsync("Personalization")};r.prototype.saveAppState=function(e,r,n,o,i,s,a){var u=new jQuery.Deferred;this._getPersonalizationService().then(function(r){r.createEmptyContainer(e,{keyCategory:r.constants.keyCategory.GENERATED_KEY,writeFrequency:r.constants.writeFrequency.HIGH,clientStorageAllowed:false}).done(function(e){e.setItemValue("appStateData",n);e.setItemValue("persistencyMethod",s);e.setItemValue("persistencySettings",a);e.setItemValue("createdBy",sap.ushell.Container&&sap.ushell.Container.getUser&&sap.ushell.Container.getUser().getId());e.save().done(function(){u.resolve()}).fail(function(e){u.reject(e);t.error(e)})}).fail(function(e){t.error(e);u.reject(e)})});return u.promise()};r.prototype.loadAppState=function(r){var n=new jQuery.Deferred,o=this;this._getPersonalizationService().then(function(i){i.getContainer(r,{keyCategory:i.constants.keyCategory.GENERATED_KEY,writeFrequency:i.constants.writeFrequency.HIGH,clientStorageAllowed:false}).done(function(t){var i=t.getItemValue("appStateData"),s=t.getItemValue("persistencyMethod"),a=t.getItemValue("persistencySettings"),u=t.getItemValue("createdBy");if(s===undefined){n.resolve(r,i)}else if(s===e.PersonalState){if(o.getCurrentUserForTesting()===""||o.getCurrentUserForTesting()===u){n.resolve(r,i,s,a)}else{n.reject("Unauthorized User ID")}}}).fail(function(e){t.error(e);n.reject(e)})});return n.promise()};r.prototype.deleteAppState=function(e){var r=new jQuery.Deferred;this._getPersonalizationService().then(function(n){n.delContainer(e).done(function(){r.resolve()}).fail(function(e){t.error(e);r.reject(e)})});return r.promise()};r.prototype.getCurrentUserForTesting=function(){return""};r.prototype.getSupportedPersistencyMethods=function(){return[]};return r},false);
//# sourceMappingURL=AppStateAdapter.js.map
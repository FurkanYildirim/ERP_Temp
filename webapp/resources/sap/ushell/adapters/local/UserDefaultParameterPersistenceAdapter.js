// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/base/Log"],function(jQuery,e){"use strict";var r=function(e,r,t){this._oConfig=t&&t.config;this._oContainerPromises={}};r.prototype._getPersonalizationService=function(){return sap.ushell.Container.getServiceAsync("Personalization")};r.prototype.saveParameterValue=function(r,t,n){var o=new jQuery.Deferred;if(!(typeof r==="string"&&r.length<=40&&/^[A-Za-z0-9.-_]+$/.exec(r))){e.error('Illegal Parameter Key, less than 40 characters and [A-Za-z0-9.-_]+ :"'+r+'"')}this._getUDContainer(n).done(function(e){e.setItemValue(r,t);e.saveDeferred(50).done(o.resolve.bind(o)).fail(o.reject.bind(o))}).fail(function(r){e.error(r);o.reject(r)});return o.promise()};r.prototype.deleteParameter=function(r,t){var n=new jQuery.Deferred;if(!(typeof r==="string"&&r.length<=40&&/^[A-Za-z0-9.-_]+$/.exec(r))){e.error('Illegal Parameter Key, less than 40 characters and [A-Za-z0-9.-_]+ :"'+r+'"')}this._getUDContainer(t).done(function(e){e.delItem(r);e.save().done(n.resolve.bind(n)).fail(n.reject.bind(n))}).fail(function(r){e.error(r);n.reject(r)});return n.promise()};r.prototype.loadParameterValue=function(r,t){var n=new jQuery.Deferred;this._getUDContainer(t).done(function(e){var t=e.getItemValue(r);if(t){n.resolve(t)}else{n.reject("no value ")}}).fail(function(r){e.error(r);n.reject(r)});return n.promise()};r.prototype.getStoredParameterNames=function(r){var t=new jQuery.Deferred;this._getUDContainer(r).done(function(e){var r=e.getItemKeys();t.resolve(r)}).fail(function(r){e.error(r);t.reject(r)});return t.promise()};r.prototype._getUDContainer=function(e){var r=e.id;if(r!==""){r="."+r}if(!this._oContainerPromises[e.id]){var t=new jQuery.Deferred;this._oContainerPromises[e.id]=t.promise();this._getPersonalizationService().then(function(e){e.getContainer("sap.ushell.UserDefaultParameter"+r,{keyCategory:e.constants.keyCategory.FIXED_KEY,writeFrequency:e.constants.writeFrequency.LOW,clientStorageAllowed:true}).done(t.resolve).fail(t.reject)})}return this._oContainerPromises[e.id]};return r},false);
//# sourceMappingURL=UserDefaultParameterPersistenceAdapter.js.map
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/base/util/ObjectPath","sap/base/Log"],function(jQuery,e,t){"use strict";var n=function(n,r,i){var s;function a(t){var n=[{id:"sap_belize",name:"SAP Belize"}];var r=e.get("config.themes",t);return r===undefined?n:r}this.updateUserPreferences=function(e){var n=new jQuery.Deferred;function r(e){var n="Failed to update user preferences: "+(e&&e.message?e.message:e);t.error(n,e&&e.stack,"com.sap.ushell.adapters.local.UserInfo")}sap.ushell.Container.getServiceAsync("Personalization").then(function(t){var i={keyCategory:t.constants.keyCategory.FIXED_KEY,writeFrequency:t.constants.writeFrequency.LOW,clientStorageAllowed:true};function s(e,t){var n=t.getChangedProperties()||[];n.forEach(function(t){e.setItemValue(t.propertyName,t.newValue)})}t.getContainer("sap.ushell.UserProfile",i,undefined).done(function(t){s(t,e);t.save().fail(function(e){r(e);n.reject(e)}).done(function(){n.resolve()})}).fail(function(e){r(e);n.reject(e)})});return n.promise()};this.getThemeList=function(){var e=new jQuery.Deferred;if(s===undefined){s=a(i)}if(s.length===0){e.reject("no themes were configured")}else{e.resolve({options:s})}return e.promise()};this.getLanguageList=function(){var e=new jQuery.Deferred;e.resolve([{text:"Browser Language",key:"default"},{text:"American English",key:"en-US"},{text:"British English",key:"en-GB"},{text:"English",key:"en"},{text:"German",key:"de"},{text:"Hebrew",key:"he"},{text:"Russian",key:"ru"}]);return e.promise()}};return n},false);
//# sourceMappingURL=UserInfoAdapter.js.map
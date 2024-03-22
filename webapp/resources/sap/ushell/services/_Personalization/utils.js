// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/_Personalization/constants","sap/ushell/services/_Personalization/constants.private","sap/ui/thirdparty/jquery","sap/base/Log"],function(e,t,jQuery,r){"use strict";function n(e,t){var r;for(r in t){if(typeof t[r]!=="function"){if(t.hasOwnProperty(r)){if(r===e){return true}}}}return false}function i(e){if(e.length>40){r.error('Personalization Service container key ("'+e+'") should be less than 40 characters [current :'+e.length+"]")}return t.S_CONTAINER_PREFIX+e}function a(e,t,r){if(e&&e.validity===0){return t}return r}function u(t){var r={validity:Infinity,keyCategory:e.keyCategory.GENERATED_KEY,writeFrequency:e.writeFrequency.HIGH,clientStorageAllowed:false};if(t){r.validity=t.validity;if(r.validity===null||r.validity===undefined||typeof r.validity!=="number"){r.validity=Infinity}if(!(typeof r.validity==="number"&&(r.validity>=0&&r.validity<1e3||r.validity===Infinity))){r.liftime=Infinity}r.keyCategory=n(t.keyCategory,e.keyCategory)?t.keyCategory:r.keyCategory;r.writeFrequency=n(t.writeFrequency,e.writeFrequency)?t.writeFrequency:r.writeFrequency;if(typeof t.clientStorageAllowed==="boolean"&&(t.clientStorageAllowed===true||t.clientStorageAllowed===false)){r.clientStorageAllowed=t.clientStorageAllowed}}return r}function l(e){if(!e.lazy){return jQuery.when(e.instance)}try{return e.create.call(null)}catch(e){return(new jQuery.Deferred).reject(e).promise()}}function o(e){if(!e){return false}var t=e.getManifestObject();if(!t){return false}var r=t.getEntry("/sap.ui5/appVariantId");if(!r){return false}var n=t.getComponentName();if(r===n){return false}return true}function f(e){if(e===undefined){return undefined}try{return JSON.parse(e)}catch(e){return undefined}}function y(e){if(e===undefined){return undefined}try{return JSON.parse(JSON.stringify(e))}catch(e){return undefined}}return{adjustScope:u,cloneToObject:f,clone:y,addContainerPrefix:i,pickAdapter:a,isAppVariant:o,loadAdapter:l}});
//# sourceMappingURL=utils.js.map
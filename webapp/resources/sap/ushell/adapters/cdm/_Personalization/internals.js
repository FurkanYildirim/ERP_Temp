// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/_Personalization/constants","sap/ushell/services/_Personalization/constants.private","sap/ui/thirdparty/jquery","sap/base/Log"],function(e,t,jQuery,n){"use strict";return{PersonalizationAdapter:r,getStorageResourceRoot:i,getContainerPath:s,delAdapterContainer:d,createContainerData:c,getAdapterContainer:f,getContainerCategory:p,isCategoryPContainer:g,trimContainerKey:u,save:y,load:I,del:h,clearContainerData:_,getItemKeys:E,containsItem:R,setItemValue:P,getItemValue:b,delItem:A,addPrefixToItemKey:v,stripPrefixFromItemKey:w,getHttpHeaderValue:C};function r(e,t,n,r,a){var o,s;var u={cache:{},headers:{"sap-client":n.getClient()}};a=a&&a.config;if(!a){throw new Error("PersonalizationAdapter: missing configuration.")}if(!t){t={}}o=i(a);s=new e(o,u);return{getAdapterContainer:f.bind(null,a,t,s),delAdapterContainer:d.bind(null,a,t,s)}}function i(e){var t=!e||!e.storageResourceRoot;if(t){throw new Error("Configuration error: storage resource root is not defined.")}return e.storageResourceRoot}function a(e){var t=!e||!e.relativeUrlReadOptimized;if(t){throw new Error("Configuration error: relative URL for read optimization is not defined.")}return e.relativeUrlReadOptimized}function o(e){var t=!e||!e.relativeUrlWriteOptimized;if(t){throw new Error("Configuration error: relative URL for write optimization is not defined.")}return e.relativeUrlWriteOptimized}function s(e,t,n){return m(e,t)+"/"+encodeURIComponent(u(n))+".json"}function u(e){var r=t.S_CONTAINER_PREFIX,i,a;if(jQuery.type(e)!=="string"||e.length===0){throw new Error("Personalization container key must be a non-empty string")}if(e.substring(0,r.length)===r){i=e.substring(r.length)}else{n.error("Unexpected personalization container key: "+e,"should always be prefixed with "+r,"sap.ushell.adapters.cdm.PersonalizationAdapter");i=e}if(i.length<=40){a=i}else{a=i.substring(0,40);n.error("Invalid personalization container key: '"+i+"'"+" exceeds maximum key length (40 characters) and is shortened to '"+a+"'",undefined,"sap.ushell.adapters.cdm.PersonalizationAdapter")}return a}function l(){return{validity:Infinity,keyCategory:e.keyCategory.GENERATED_KEY,writeFrequency:e.writeFrequency.HIGH,clientStorageAllowed:false}}function d(e,t,n,r,i){var a=s(e,i,r);var o=t&&t[a];if(o){delete t[a]}return h(n,a)}function c(e,t){var r;if(!t&&t!==""||t.constructor!==String){n.warning("Personalization container has an invalid app name; must be a non-empty string",null,"sap.ushell.adapters.cdm.PersonalizationAdapter")}if(!e){e=l()}r={items:{},__metadata:{appName:t,expiry:Date.now()+e.validity*60*1e3,validity:e.validity,category:p(e)}};return r}function f(e,t,n,r,i,a){var o,u,l=s(e,i,r);if(t&&t[l]){return t[l]}u=c(i,a);o=u.items;return{save:y.bind(null,n,u,l),load:I.bind(null,n,u,l),del:h.bind(null,n,u,l),setItemValue:P.bind(null,o),getItemValue:b.bind(null,o),getItemKeys:E.bind(null,o),containsItem:R.bind(null,o),delItem:A.bind(null,o)}}function p(e){return g(e)?"p":"u"}function m(e,t){return g(t)?a(e):o(e)}function g(t){return t&&t.keyCategory===e.keyCategory.FIXED_KEY&&t.writeFrequency===e.writeFrequency.LOW&&t.clientStorageAllowed}function y(e,t,r){return new jQuery.Deferred(function(i){e.put(r,{data:t}).then(function(e){i.resolve()}).catch(function(e){n.error("Failed to save personalization container; response: "+(typeof e==="object"?JSON.stringify(e):e),e.stack?e.stack:null,"sap.ushell.adapters.cdm.PersonalizationAdapter");i.reject(e)})}).promise()}function I(e,t,n){function r(e){_(e.items)}return new jQuery.Deferred(function(i){e.get(n).then(function(e){var n,a;if(e.status===200&&C(e.responseHeaders,"content-length")==="0"&&C(e.responseHeaders,"content-type").indexOf("text/plain")===0){r(t)}else{n=JSON.parse(e.responseText);if(n.data){n.items=n.data;delete n.data;n.__metadata=t.__metadata}a=n.items;_(t.items);Object.keys(a).forEach(function(e){t.items[e]=a[e]});t.__metadata=n.__metadata}i.resolve()}).catch(function(e){if(e.status===404){r(t);i.resolve()}else{_(t.items);i.reject(e)}})}).promise()}function h(e,t){return new jQuery.Deferred(function(n){e.delete(t).then(function(){n.resolve()}).catch(function(e){n.reject(e)})}).promise()}function _(e){Object.keys(e).forEach(function(t){delete e[t]})}function v(e){if(e==="__metadata"){return undefined}else if(e.indexOf(t.S_VARIANT_PREFIX)===0||e.indexOf(t.S_ADMIN_PREFIX)===0){return e}return t.S_ITEM_PREFIX+e}function w(e){if(e.indexOf(t.S_ITEM_PREFIX)===0){return e.substring(t.S_ITEM_PREFIX.length)}else if(e.indexOf(t.S_VARIANT_PREFIX)===0||e.indexOf(t.S_ADMIN_PREFIX)===0){return e}throw new Error("Illegal item key for personalization container: '"+e+"'; must be prefixed with one of the following: ["+t.S_ITEM_PREFIX+", "+t.S_VARIANT_PREFIX+", "+t.S_ADMIN_PREFIX+"] ")}function E(e){return Object.keys(e).map(v).filter(function(e){return!!e})}function R(e,t){return e.hasOwnProperty(w(t))}function P(e,t,n){e[w(t)]=n}function b(e,t){return e[w(t)]}function A(e,t){delete e[w(t)]}function C(e,t){var n=e&&e.filter(function(e){return e.name.toLowerCase()===t});return n&&n[0]&&n[0].value}});
//# sourceMappingURL=internals.js.map
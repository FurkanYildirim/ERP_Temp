// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/ObjectPath","sap/ui/core/Core","sap/ushell/Config","sap/base/Log"],function(e,t,n,o){"use strict";var r=function(){this._sBaseUrl=n.last("/core/workPages/navigationApiUrl");this._sSiteId=e.get("ushell.site.siteId",window["sap-ushell-config"])};r.prototype._fetchCsrfToken=function(){if(this._oFetchCsrfTokenPromise){return this._oFetchCsrfTokenPromise}this._oFetchCsrfTokenPromise=fetch(this._sBaseUrl,{method:"HEAD",headers:{"x-csrf-token":"fetch","Accept-Language":t.getConfiguration().getLanguageTag()}}).then(function(e){return e.headers.get("x-csrf-token")});return this._oFetchCsrfTokenPromise};r.prototype.resolveByInbound=function(e,n){return this._fetchCsrfToken().then(function(o){return fetch(this._sBaseUrl+"/resolve/inbound",{method:"POST",headers:{"Content-Type":"application/json; utf-8",Accept:"application/json","x-csrf-token":o,"Accept-Language":t.getConfiguration().getLanguageTag()},body:JSON.stringify({inboundIdentifier:e,intentParameters:n,queryParameters:{siteId:this._sSiteId},launchType:"standalone"})}).then(function(e){if(e.ok===false){return Promise.reject(e.statusText)}return e.json()}).then(function(e){var t=e.value||e;var n=Array.isArray(t)?t[0].url:t.url;return{additionalInformation:"",url:n,applicationType:"URL",navigationMode:"newWindow"}})}.bind(this)).catch(function(t){o.error("Tile target for inboundId '"+e+"' could not be resolved. The tile will be shown but will not navigate.");o.error(t);return{additionalInformation:"",url:"",applicationType:"URL",navigationMode:"newWindow"}})};return r},true);
//# sourceMappingURL=NavigationResolver.js.map
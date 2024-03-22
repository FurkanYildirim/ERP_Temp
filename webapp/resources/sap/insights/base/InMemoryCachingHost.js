/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 * This extension is for OVP Analytical cards delivered in 2208.
 */
sap.ui.define(["sap/ui/integration/Host"],function(t){"use strict";var e={};var n={};return t.extend("sap.insights.InMemoryCachingHost",{clearCache:function(t){if(t){e[t]=n[t]={}}else{e=n={}}},_fetchData:function(n,r,i,a){return t.prototype.fetch.call(this,n,r,i).then(function(t){e[a][n]=t;return e[a][n]}).catch(function(t){var r={error:t.toString()};var i=new Response(JSON.stringify(r),{headers:{"Content-Type":"application/json"}});e[a][n]=i;return e[a][n]})},_isCSRFFetchCall:function(t){return t.method==="HEAD"},fetch:function(r,i,a,s){var c=s.getManifestEntry("sap.app").id;e[c]=e[c]?e[c]:{};n[c]=n[c]?n[c]:{};if(this._isCSRFFetchCall(a)){return t.prototype.fetch.call(this,r,i,a)}else if(!e[c][r]&&!n[c][r]){n[c][r]=this._fetchData(r,i,a,c);return n[c][r]}else if(!e[c][r]&&n[c][r]){return n[c][r]}else{return new Promise(function(t){t(e[c][r])})}}})});
//# sourceMappingURL=InMemoryCachingHost.js.map
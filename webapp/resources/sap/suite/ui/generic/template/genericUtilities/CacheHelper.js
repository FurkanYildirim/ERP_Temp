/*
* SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
*/
sap.ui.define(["sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/suite/ui/generic/template/genericUtilities/metadataAnalyser"],function(e,t){"use strict";var a=new e("genericUtilities.CacheHelper");var n=a.getLogger();var i=a.Level;n.setLevel(i.ALL);var o="####";function r(e,t){try{if(window.localStorage){window.localStorage.removeItem(e.key);t=e.timestamp+o+t;window.localStorage.setItem(e.key,t);return true}}catch(e){n.error("Locale Storage access resulted into an error")}return false}function s(e){var t;if(window.localStorage){t=window.localStorage.getItem(e.key);if(t){var a=t.split(o);t=a[0]===e.timestamp?a[1]:undefined}}return t}function l(e){var t=[];var a=e.metadataLoaded().then(function(e){var t;if(e&&e.lastModified){t=new Date(e.lastModified).getTime()+""}else{n.warning("TemplateComponent: no valid cache key segment last modification date provided by the OData Model");t=(new Date).getTime()+""}return t});t.push(a);var i=e.annotationsLoaded().then(function(e){var t=0;if(e){for(var a=0;a<e.length;a++){if(e[a].lastModified){var i=new Date(e[a].lastModified).getTime();if(i>t){t=i}}else{n.warning("No valid cache key segment last modification date provided by OData annotations");t=(new Date).getTime()+""}}}if(t===0){n.warning("TemplateComponent: no valid cache key segment last modification date provided by OData annotations");t=(new Date).getTime()}return t+""});t.push(i);return t}function d(e,t,a){return{key:e+"-"+t,timestamp:a.join("-")}}function c(e,t,a,n){return Promise.all(a).then(function(a){var i=d(e,t,a);r(i,n)})}function u(e,a,n,i){if(t.isContentIdReferencingAllowed(a)){if(i){return Promise.resolve({contentIdRequestPossible:true,parametersForContentIdRequest:{sRootExpand:i()}})}var o=l(a);return Promise.all(o).then(function(t){var a=d(n,e,t);return{contentIdRequestPossible:true,parametersForContentIdRequest:{sRootExpand:s(a)}}})}return Promise.resolve({contentIdRequestPossible:false})}return{writeToLocalStorageAsync:c,getInfoForContentIdPromise:u,getCacheKey:d,getCacheKeyPartsAsyc:l,readFromLocalStorage:s,writeToLocalStorage:r}});
//# sourceMappingURL=CacheHelper.js.map
/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/VersionInfo","sap/ui/core/Configuration","sap/base/Log","sap/base/assert","sap/base/util/ObjectPath"],function(e,a,n,t,o){"use strict";if(window.OpenAjax&&window.OpenAjax.hub){OpenAjax.hub.registerLibrary("sap","http://www.sap.com/","0.1",{})}var r;if(typeof window.sap!=="object"&&typeof window.sap!=="function"){window.sap={}}if(typeof window.sap.ui!=="object"){window.sap.ui={}}sap.ui=Object.assign(sap.ui,{version:"1.115.1",buildinfo:{lastchange:"",buildtime:"20230626-1337"}});var s=a.getSyncCallBehavior();sap.ui.getVersionInfo=function(a){if(a&&a.async){n.info("Do not use deprecated function 'sap.ui.getVersionInfo'. Use"+" 'sap/ui/VersionInfo' module's asynchronous .load function instead")}else{n.warning("Do not use deprecated function 'sap.ui.getVersionInfo' synchronously! Use"+" 'sap/ui/VersionInfo' module's asynchronous .load function instead","Deprecation",null,function(){return{type:"sap.ui.getVersionInfo",name:"Global"}})}return e._load(a)};sap.ui.namespace=function(e){t(false,"sap.ui.namespace is long time deprecated and shouldn't be used");return o.create(e)};sap.ui.lazyRequire=function(e,a,i){t(typeof e==="string"&&e,"lazyRequire: sClassName must be a non-empty string");t(!a||typeof a==="string","lazyRequire: sMethods must be empty or a string");if(s===2){n.error("[nosync] lazy stub creation ignored for '"+e+"'");return}var u=e.replace(/\//gi,"."),c=u.lastIndexOf("."),p=u.substr(0,c),l=u.substr(c+1),f=o.create(p),y=f[l],d=(a||"new").split(" "),b=d.indexOf("new");i=i||u;if(!y){if(b>=0){y=function(){if(s){if(s===1){n.error("[nosync] lazy stub for constructor '"+u+"' called")}}else{n.debug("lazy stub for constructor '"+u+"' called.")}sap.ui.requireSync(i.replace(/\./g,"/"));var a=f[l];t(typeof a==="function","lazyRequire: oRealClass must be a function after loading");if(a._sapUiLazyLoader){throw new Error("lazyRequire: stub '"+u+"'has not been replaced by module '"+i+"'")}var o=Object.create(a.prototype);if(!(this instanceof y)){r=r||sap.ui.require("sap/ui/base/Object");if(r&&o instanceof r){n.error("Constructor "+e+' has been called without "new" operator!',null,null,function(){try{throw new Error}catch(e){return e}})}}var c=a.apply(o,arguments);if(c&&(typeof c==="function"||typeof c==="object")){o=c}return o};y._sapUiLazyLoader=true;d.splice(b,1)}else{y={}}f[l]=y}d.forEach(function(e){if(!y[e]){y[e]=function(){if(s){if(s===1){n.error("[no-sync] lazy stub for method '"+u+"."+e+"' called")}}else{n.debug("lazy stub for method '"+u+"."+e+"' called.")}sap.ui.requireSync(i.replace(/\./g,"/"));var a=f[l];t(typeof a==="function"||typeof a==="object","lazyRequire: oRealClass must be a function or object after loading");t(typeof a[e]==="function","lazyRequire: method must be a function");if(a[e]._sapUiLazyLoader){throw new Error("lazyRequire: stub '"+u+"."+e+"' has not been replaced by loaded module '"+i+"'")}return a[e].apply(a,arguments)};y[e]._sapUiLazyLoader=true}})};sap.ui.lazyRequire._isStub=function(e){t(typeof e==="string"&&e,"lazyRequire._isStub: sClassName must be a non-empty string");var a=e.lastIndexOf("."),n=e.slice(0,a),r=e.slice(a+1),s=o.get(n||"");return!!(s&&typeof s[r]==="function"&&s[r]._sapUiLazyLoader)};sap.ui.resource=function(e,a){t(typeof e==="string","sLibraryName must be a string");t(typeof a==="string","sResourcePath must be a string");return sap.ui.require.toUrl((String(e).replace(/\./g,"/")+"/"+a).replace(/^\/*/,""))};sap.ui.localResources=function(e){t(e,"sNamespace must not be empty");var a={};a[e.replace(/\./g,"/")]="./"+e.replace(/\./g,"/");sap.ui.loader.config({paths:a})};return sap.ui});
//# sourceMappingURL=Global.js.map
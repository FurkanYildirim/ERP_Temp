// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/URI","sap/ushell/utils","sap/base/util/isPlainObject","sap/base/Log"],function(e,t,n,r){"use strict";var i="";var a={apply:"apply",applied:"applied"};function o(e){return(e.protocol()||"").length>0}function s(e,n,r){var i=typeof n==="string";var a=[e];if(i){a.unshift(n)}var o=t.generateLocalStorageKey("sap-system-data",a);var s=t.getLocalStorage();var f=s.getItem(o);var p={};if(f){try{p=JSON.parse(f)}catch(e){return Promise.reject("Cannot parse system data from local storage at key '"+o+"'. Data: "+f)}return Promise.resolve(p)}else if(i){return Promise.reject("Cannot find data for system '"+e+"' in local storage using key '"+o+"'")}if(!r){return Promise.reject("fallback: the adapter does not implement resolveSystemAlias")}return new Promise(function(t,n){r(e).done(function(e){t(e)}).catch(function(e){n(e)})})}function f(t,n,a,o,f){var p=a;var u=new Promise(function(u,l){s(t,n,f).catch(function(e){l(e)}).then(function(n){var s=m(n);if(!s.isValid){g(s);l("Invalid system alias definition");return}var h=d(n,new e(window.location.toString()).protocol());var v=n[h];var w;var P;var R;if(t===i&&v.host===""&&(v.port===0||v.port==="")){h=""}p.protocol(h);p.hostname(v.host);p.port(v.port);y(p,o,v.pathPrefix,f).catch(function(e){l(e)}).then(function(e){w=e.query();if(typeof n.client==="string"&&n.client!==""){w=w+(w.length>0?"&":"")+"sap-client="+n.client}if(typeof n.language==="string"&&n.language!==""){P=n.language}else{R=sap.ushell.Container.getUser();if(!R){r.error("Cannot retieve the User object via sap.ushell.Container while determining sap-language","will default to 'en' language","sap.ushell.services.ClientSideTargetResolution");P="en"}else{P=R.getLanguage()}}w=w+(w.length>0?"&":"")+"sap-language="+P;e.query(w);if(n.hasOwnProperty("rfc")&&o==="NATIVEWEBGUI"){var t=c(n.rfc,v.host,e);var i=e.path()+";"+t;e.path(i);a._parts.path=i}u(e)})})});return u}function p(e,t,n,r,i,o,s){if(o!==a.apply&&o!==a.applied){throw new Error("Invalid system alias semantic was provided: '"+o+"'")}if(o===a.applied&&(typeof n==="undefined"||t===n)){return Promise.resolve(e)}if(o===a.apply&&typeof t==="undefined"&&typeof n==="undefined"){return Promise.resolve(e)}if(i==="URL"&&o===a.applied){return u(e,t,n,r,s)}var p=new Promise(function(f,p){if(o===a.apply){f({targetUri:e,alias:n||t,sapSystemSrc:n?r:undefined});return}l(e,t,undefined,i,s).catch(function(e){p(e)}).then(function(e){f({targetUri:e,alias:n})})}).then(function(e){return f(e.alias,e.sapSystemSrc,e.targetUri,i,s)});return p}function u(t,n,r,a,p){var u=new Promise(function(u,c){if(n===i||typeof n==="undefined"){if(o(t)){u(t);return}u(f(r,a,t,"URL",p).then(function(e){return e}))}u(s(n,a,p).catch(function(e){c(e)}).then(function(n){var i=d(n,new e(window.location.toString()).protocol()),o=n[i],s;if((t.protocol()||"").toLowerCase()===i&&(t.hostname()||"")===o.host&&t.path().indexOf(o.pathPrefix)===0){t.protocol("");t.hostname("");s=t.path().replace(o.pathPrefix,"");t.path(s);v(t,["sap-language","sap-client"]);return f(r,a,t,"URL",p).then(function(e){return e})}return t}))});return u}function c(e,t){var n,i,a,o,s;a=!!e.systemId;if(a){o=[e.systemId&&"~sysid="+e.systemId,e.loginGroup&&"~loginGroup="+e.loginGroup,e.sncNameR3&&"~messageServer="+encodeURIComponent(e.sncNameR3),e.sncNameR3&&"~sncNameR3="+encodeURIComponent(e.sncNameR3),e.sncQoPR3&&"~sncQoPR3="+e.sncQoPR3].filter(function(e){return typeof e==="string"&&e!==""})}else{s=e.host||"";i=s.toLowerCase()===t.toLowerCase();n=/^[/][HGMR][/].*/.test(s);if(s.length>0&&!i&&!n){r.error("Invalid connect string provided in 'host' field of system alias","Data for rfc destination provided are: "+JSON.stringify(e,null,3),"sap.ushell.services.ClientSideTargetResolution")}o=[s&&!n&&!i&&"~rfcHostName="+s,n&&"~connectString="+encodeURIComponent(s),e.service&&"~service="+e.service,e.sncNameR3&&"~sncNameR3="+encodeURIComponent(e.sncNameR3),e.sncQoPR3&&"~sncQoPR3="+e.sncQoPR3].filter(function(e){return typeof e==="string"&&e!==""})}return o.join(";").replace(/(%[A-F0-9]{2})/g,function(e){return e.toLowerCase()})}function l(e,t,n,r,i){var a=new Promise(function(a,o){if(typeof t==="undefined"){a(h(e,t,r,undefined,i));return}a(s(t,n,i).then(function(n){return h(e,t,r,n,i)}))});return a}function h(t,r,i,a,o){t.protocol("");t.hostname("");t.port("");var f=new Promise(function(f){var p,u;v(t,["sap-client","sap-language"]);if(!n(a)||typeof r!=="string"){f(t)}u=d(a,new e(window.location.toString()).protocol());p=a[u];var c=new Promise(function(e,t){var n=typeof p.pathPrefix==="string"&&p.pathPrefix;if(n!==""){e(n)}else{s("",undefined,o).catch(function(e){t(e)}).then(function(t){var n=t[u];e(n.pathPrefix)})}}).then(function(e){var n;if(e&&e.length>0){n=t.path();n=n.replace(e,"");if(e==="/sap/bc/"){n=n.replace("/sap(====)/bc/","")}if(n.indexOf("/")!==0){n="/"+n}t.path(n)}if(i==="NATIVEWEBGUI"&&a.hasOwnProperty("rfc")){n=t.path();n=n.split(";").filter(function(e){return e.indexOf("~sysid=")!==0&&e.indexOf("~service=")!==0&&e.indexOf("~loginGroup=")!==0&&e.indexOf("~messageServer=")!==0&&e.indexOf("~sncNameR3=")!==0&&e.indexOf("~sncQoPR3=")!==0}).join(";");t.path(n)}return t});f(c)});return f}function d(e,t){if(e.hasOwnProperty("https")){return"https"}if(e.hasOwnProperty("http")){return"http"}r.error("Cannot select which system alias to pick between http/https","make sure they are provided in the given system alias collection","sap.ushell.services.ClientSideTargetResolution");return undefined}function g(e){r.error("Invalid system alias definition: "+e.debug,"ERRORS:"+e.errors.map(function(e){return"\n - "+e}).join(""),"sap.ushell.ApplicationType")}function m(e){function t(e){var t=[];if(typeof e.host!=="string"){t.push("host field must be a string")}if(typeof e.port!=="number"&&typeof e.port!=="string"){t.push("port field must be a number or a string")}if(typeof e.pathPrefix!=="string"){t.push("pathPrefix field must be a string")}return t}var n=[],r=e.hasOwnProperty("https"),i=e.hasOwnProperty("http");if(!i&&!r){n.push("at least one of 'http' or 'https' fields must be defined")}if(r){t(e.https).forEach(function(e){n.push("https>"+e)})}if(i){t(e.http).forEach(function(e){n.push("http>"+e)})}if(n.length>0){return{isValid:false,errors:n,debug:JSON.stringify(e,null,3)}}return{isValid:true}}function v(e,t){var n={},r;t.forEach(function(e){n[e]=true});r=e.query();r=r.split("&").filter(function(e){var t=(e.split("=")[0]||"").toLowerCase();return!n.hasOwnProperty(t)}).join("&");e.query(r)}function y(t,n,r,i){var a;var o=new Promise(function(o){if(n==="URL"&&r.length===0){o(t);return}o(s("",undefined,i).then(function(i){var o=d(i,new e(window.location.toString()).protocol());var s=i[o].pathPrefix;var f=r===s;if(r.length>0&&!f){if((n==="WDA"||n==="WEBGUI")&&t.path().indexOf("~canvas")>=0){a=t.path();a="/~canvas"+a.split("~canvas")[1];t.path(a)}}function p(e){var n=e+t.path();t.path(n.replace(/\/+/g,"/"));return t}if(r.length===0){if(n==="WCF"&&s==="/sap/bc/"){return p("/sap(====)/bc/")}return p(s)}return p(r)}))});return o}return{LOCAL_SYSTEM_ALIAS:i,SYSTEM_ALIAS_SEMANTICS:a,spliceSapSystemIntoURI:p,isAbsoluteURI:o,_stripURI:l,_selectSystemAliasDataName:d,_constructNativeWebguiParameters:c}});
//# sourceMappingURL=systemAlias.js.map
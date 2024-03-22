/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 * Static class with reusable methods for Fiori Elements application.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ovp/app/OVPLogger","sap/ui/core/Core"],function(jQuery,n,e){"use strict";var t={UNKNOWN:"Unknown",FAILED:"Failed",LOADING:"Loading",RENDERED:"Rendered"};var r=t.UNKNOWN;var i={};var u=new n("OVP.lib.CommonMethods");function f(n){var e=1;if(n[0]==="-"){e=-1;n=n.substr(1)}return function(t,r){if(!t[n]){return e===1?1:-1}else if(!r[n]){return e===1?-1:1}var i=0;if(t[n]<r[n]){i=-1}else if(t[n]>r[n]){i=1}return i*e}}function s(n){if(n){return jQuery.getJSON(n)}return undefined}function o(n){for(var e in t){if(t[e]===n){return true}}return false}function a(){return r}function l(n){r=o(n)?n:t.UNKNOWN}function p(){return i}function c(n){i=n;return true}function v(n,t,r){u.info("Global event '"+t+"' published on channel '"+n+"'");e.getEventBus().publish(n,t,r)}function g(n){if(!n||n.length<1){return""}var e="";for(var t=0;t<n.length;t++){if(!n[t]||!(typeof n[t]==="string")){continue}if(e){e+=", "}e+=n[t]}return e}function d(n){if(!n){return false}return Object.keys(n).length>0}function h(n){if(!n){return""}var e=n.split("#");if(e.length<2){return""}else{var t=e[1];var r=t.indexOf("~");var i=t.indexOf("?");var u=t.indexOf("/");var f=t.indexOf("&");if(r&&r!==-1&&(r<i||i===-1)&&(r<u||u===-1)&&(r<f||f===-1)){return t.substr(0,r)}else if(i&&i!==-1&&(i<r||r===-1)&&(i<u||u===-1)&&(i<f||f===-1)){return t.substr(0,i)}else if(u&&u!==-1&&(u<r||r===-1)&&(u<i||i===-1)&&(u<f||f===-1)){return t.substr(0,u)}else if(f&&f!==-1&&(f<r||r===-1)&&(f<i||i===-1)&&(f<u||u===-1)){return t.substr(0,f)}else{return t}}}function N(n){if(!n){return""}var e=n.split("#");if(e.length<=0){return""}else if(e.length===1){return e[0]}else{return e[0]+"#"+h(n)}}return{mApplicationStatus:t,getDynamicComparator:f,getFileFromURI:s,isValidApplicationStatus:o,getApplicationStatus:a,setApplicationStatus:l,getAppComponent:p,setAppComponent:c,publishEvent:v,concatStrings:g,hasObjectContent:d,getApplicationName:h,shortenURL:N}});
//# sourceMappingURL=CommonMethods.js.map
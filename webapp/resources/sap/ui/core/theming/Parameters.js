/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/Configuration","sap/ui/thirdparty/URI","../Element","sap/base/util/UriParameters","sap/base/Log","sap/base/util/extend","sap/base/util/syncFetch","sap/ui/core/theming/ThemeManager","./ThemeHelper"],function(e,r,t,a,n,i,s,o,u,f){"use strict";var c=r.getSyncCallBehavior();var l={};var m=null;var d=null;var h=[];var p=[];var g=new t(sap.ui.require.toUrl(""),document.baseURI).origin();var v={};var y=/url[\s]*\('?"?([^\'")]*)'?"?\)/;var b=n.fromQuery(window.location.search).get("sap-ui-xx-no-inline-theming-parameters")!=="true";function w(e,r){var a=y.exec(e);if(a){var n=new t(a[1]);if(n.is("relative")){var i=n.absoluteTo(r).normalize().toString();e="url('"+i+"')"}}return e}function P(e,r,t){for(var a in r){if(typeof e[a]==="undefined"){e[a]=w(r[a],t)}}return e}function A(e,r){if(typeof e["default"]!=="object"){e={default:e,scopes:{}}}m=m||{};m["default"]=m["default"]||{};m["scopes"]=m["scopes"]||{};P(m["default"],e["default"],r);if(typeof e["scopes"]==="object"){for(var t in e["scopes"]){m["scopes"][t]=m["scopes"][t]||{};P(m["scopes"][t],e["scopes"][t],r)}}}function C(e){document.querySelectorAll("link[id^=sap-ui-theme-]").forEach(function(r){e(r.getAttribute("id"))})}function L(e,r){var t=S(e);var a=f.checkAndRemoveStyle({id:e});if(!a&&!r){i.warning("Parameters have been requested but theme is not applied, yet.","sap.ui.core.theming.Parameters")}if(a&&b){var n=document.getElementById(e);var s=window.getComputedStyle(n).getPropertyValue("background-image");var o=/\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(s);if(o&&o.length>=2){var u=o[1];if(u.charAt(0)!=="{"&&u.charAt(u.length-1)!=="}"){try{u=decodeURIComponent(u)}catch(e){i.warning("Could not decode theme parameters URI from "+t.styleSheetUrl)}}try{var c=JSON.parse(u);A(c,t.themeBaseUrl);return true}catch(e){i.warning("Could not parse theme parameters from "+t.styleSheetUrl+". Loading library-parameters.json as fallback solution.")}}}return r?a:false}function U(e){var r=S(e);if(!L(e)){var a=r.styleSheetUrl.replace(/\/(?:css_variables|library)([^\/.]*)\.(?:css|less)($|[?#])/,function(e,r,t){return"/library-parameters.json"+(t?t:"")});if(c===2){i.error("[nosync] Loading library-parameters.json ignored",a,"sap.ui.core.theming.Parameters");return}else if(c===1){i.error("[nosync] Loading library-parameters.json with sync XHR",a,"sap.ui.core.theming.Parameters")}var n=new t(r.themeBaseUrl).origin();var s=v[n];var o=[];if(s===undefined){if(a.startsWith(g)){o=[false,true]}else{o=[true,false]}}else{o=[s]}I(a,r.themeBaseUrl,o)}}function S(e){var r=document.getElementById(e);if(!r){i.warning("Could not find stylesheet element with ID",e,"sap.ui.core.theming.Parameters");return undefined}var a=r.href;return{themeBaseUrl:new t(a).filename("").query("").toString(),styleSheetUrl:a}}function I(e,r,a){var n={Accept:o.ContentTypes.JSON};var s=a.shift();if(s){n["X-Requested-With"]="XMLHttpRequest"}function u(t){i.error("Could not load theme parameters from: "+e,t);if(a.length>0){i.warning("Initial library-parameters.json request failed ('withCredentials="+s+"'; sUrl: '"+e+"').\n"+"Retrying with 'withCredentials="+!s+"'.","sap.ui.core.theming.Parameters");I(e,r,a)}}try{var f=o(e,{credentials:s?"include":"omit",headers:n});if(f.ok){var c=f.json();var l=new t(r).origin();v[l]=s;if(Array.isArray(c)){for(var m=0;m<c.length;m++){var d=c[m];A(d,r)}}else{A(c,r)}}else{throw new Error(f.statusText||f.status)}}catch(e){u(e)}}function T(e){if(!m){A({},"");C(function(r){if(e){if(!L(r,e)){h.push(r)}}else{U(r)}})}return m}function j(){var e=[];h.forEach(function(r){if(!L(r,true)){e.push(r)}});h=e}function N(){h.forEach(U);h=[]}l._addLibraryTheme=function(e){if(m){h.push("sap-ui-theme-"+e)}};function E(r){var t=r.async,a=T(t);if(r.scopeName){a=a["scopes"][r.scopeName]}else{a=a["default"]}var n=a[r.parameterName];if(!n){var i=r.parameterName.indexOf(":");if(i!=-1){var s=r.parameterName.substr(i+1);n=a[s]}}if(r.loadPendingParameters&&typeof n==="undefined"&&!t){var o=e.getAllLibrariesRequiringCss();o.forEach(function(e){u._includeLibraryThemeAndEnsureThemeRoot(e)});N();n=E({parameterName:r.parameterName,scopeName:r.scopeName,loadPendingParameters:false})}return n}function x(e,r,t){var a=l.getActiveScopesFor(r,t);var n=a.flat().reduce(function(e,r){if(e.indexOf(r)===-1){e.push(r)}return e},[]);for(var i=0;i<n.length;i++){var s=n[i];var o=E({parameterName:e,scopeName:s,async:t});if(o){return o}}return E({parameterName:e,async:t})}l._getScopes=function(e,r){if(e&&!m){return}var t=T(r);var a=Object.keys(t["scopes"]);return a};l.getActiveScopesFor=function(e,r){var t=[];if(e instanceof a){var n=e.getDomRef();if(r){j()}else{N()}var i=this._getScopes(undefined,r);if(i.length){if(n){var s=function(e){var r=n.classList;return r&&r.contains(e)};while(n){var o=i.filter(s);if(o.length>0){t.push(o)}n=n.parentNode}}else{var u=function(r){return typeof e.hasStyleClass==="function"&&e.hasStyleClass(r)};while(e){var o=i.filter(u);if(o.length>0){t.push(o)}e=typeof e.getParent==="function"&&e.getParent()}}}}return t};l.get=function(t,n){var s,o,f,c,l;var m=function(e){return e.callback===o};if(!e.isInitialized()){i.warning("Called sap.ui.core.theming.Parameters.get() before core has been initialized. "+"Consider using the API only when required, e.g. onBeforeRendering.")}if(!d){d=r.getTheme()}if(arguments.length===0){i.warning("Legacy variant usage of sap.ui.core.theming.Parameters.get API detected. Do not use the Parameters.get() API to retrieve ALL theming parameters, "+"as this will lead to unwanted synchronous requests. "+"Use the asynchronous API variant instead and retrieve a fixed set of parameters.","LegacyParametersGet","sap.ui.support",function(){return{type:"LegacyParametersGet"}});N();var h=T();return Object.assign({},h["default"])}if(!t){return undefined}if(t instanceof Object&&!Array.isArray(t)){if(!t.name){i.warning("sap.ui.core.theming.Parameters.get was called with an object argument without one or more parameter names.");return undefined}n=t.scopeElement;o=t.callback;c=typeof t.name==="string"?[t.name]:t.name;f=true}else{if(typeof t==="string"){c=[t]}else{c=t}i.warning("Legacy variant usage of sap.ui.core.theming.Parameters.get API detected for parameter(s): '"+c.join(", ")+"'. This could lead to bad performance and additional synchronous XHRs, as parameters might not be available yet. Use asynchronous variant instead.","LegacyParametersGet","sap.ui.support",function(){return{type:"LegacyParametersGet"}})}var g,v;var y=function(e){if(n instanceof a){return x(e,n,f)}else{if(f){j()}return E({parameterName:e,loadPendingParameters:!f,async:f})}};v={};for(var b=0;b<c.length;b++){s=c[b];var w=y(s);if(!f||w){v[s]=w}}if(f&&o&&Object.keys(v).length!==c.length){if(!u.themeLoaded){g=function(){u.detachEvent("ThemeChanged",g);var e=this.get({name:t.name,scopeElement:t.scopeElement});if(!e||typeof e==="object"&&Object.keys(e).length!==c.length){i.error("One or more parameters could not be found.","sap.ui.core.theming.Parameters")}o(e);p.splice(p.findIndex(m),1)}.bind(this);l=p.findIndex(m);if(l>=0){u.detachEvent("ThemeChanged",p[l].eventHandler);p[l].eventHandler=g}else{p.push({callback:o,eventHandler:g})}u.attachEvent("ThemeChanged",g);return undefined}else{i.error("One or more parameters could not be found.","sap.ui.core.theming.Parameters")}}return c.length===1?v[c[0]]:v};l._setOrLoadParameters=function(e){m={default:{},scopes:{}};d=r.getTheme();C(function(r){var t=r.substr(13);if(e[t]){s(m["default"],e[t])}else{U(r)}})};l.reset=function(){this._reset.apply(this,arguments)};l._reset=function(){var e=arguments[0]===true;if(!e||r.getTheme()!==d){d=r.getTheme();h=[];m=null;f.reset()}};l._getThemeImage=function(e,r){e=e||"sapUiGlobalLogo";var t=l.get(e);if(t){var a=y.exec(t);if(a){t=a[1]}else if(t==="''"||t==="none"){t=null}}if(r&&!t){return sap.ui.require.toUrl("sap/ui/core/themes/base/img/1x1.gif")}return t};return l},true);
//# sourceMappingURL=Parameters.js.map
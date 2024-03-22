/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/core/support/Plugin","sap/ui/core/format/DateFormat","sap/ui/model/json/JSONModel","sap/ovp/support/lib/CommonChecks","sap/ovp/support/lib/CommonMethods","sap/ui/core/mvc/XMLView","sap/ui/core/IntervalTrigger","sap/ui/core/Core"],function(jQuery,e,t,n,a,i,o,s,r){"use strict";var u="sapUiSupportFioriElementsPluginOVP";function p(e){var p,l,f=u+"-View",c=[],d=r.getEventBus(),m,v,g,h,S,w=10,R;function b(){return u}function O(e){var n=t.getDateInstance({source:{pattern:"YYYYMMdd"},style:"short"});return n.format(n.parse(String(e).substring(0,8)))}function A(e){var t=window.location.origin;var n=window.location.pathname;var i=e||a.getComponentIDByStructure();if(i){m=a.getManifestPath(i);if(m){var o=a.getManifestURL(t,n,m);if(o){return o}}}return""}function D(e,t,n,a,i){if(e==="string"){c.push({order:n,name:t,type:e,value:a});return true}else if(e==="link"){c.push({order:n,name:t,type:e,value:a,target:i});return true}else if(e==="group"){c.push({order:n,name:t,type:e});return true}return false}function E(e,t,n){return D("string",e,t,n,"")}function I(e,t,n,a){return D("link",e,t,n,a)}function j(e,t){return D("group",e,t,"","")}function C(e){if(!(e&&i.hasObjectContent(e))){return undefined}if(!(e.getMetadata()&&i.hasObjectContent(e.getMetadata()))){return undefined}var t=e.getMetadata();if(!(t.getManifest()&&i.hasObjectContent(t.getManifest()))){return undefined}return t.getManifest()}function N(e){c=[];E("Error",0,e);H()}function y(e){var t=a.getUI5VersionInfo();try{if(t&&i.hasObjectContent(t)){E("OpenUI5 Version",e,t.version+" (built at "+O(t.buildTimestamp)+")");return true}else{E("OpenUI5 Version",e,"ERROR: OpenUI5 version is not available!");return false}}catch(n){E("OpenUI5 Version",e,t&&t.version+', detailed UI5 version info is not available! Possible reason: missing file "sap-ui-version.json"');return true}}function P(e){var t=i.getApplicationName(window.location.href);if(t){I("Application URL",e,"#"+t,window.location.href);return true}else{E("Application URL",e,"ERROR: Could not extract application name (#semanticObject-action) from URL!");return false}}function L(e){if(m&&v){var t=m;if(m.indexOf("./")===0){t=m.substring(2,m.length)}I("Manifest",e,t,v);return true}else{E("Manifest",e,"ERROR: Could not generate link to manifest.json! Possible reason: The application did not finish loading or is not a Fiori Elements application.");return false}}function U(e){if(!h){return false}var t=a.getRegistrationIDsByManifest(h);if(t&&Array.isArray(t)&&t.length>0){E(t.length>1?"Fiori IDs":"Fiori ID",e,i.concatStrings(t));return true}return false}function F(e){var t=a.getApplicationComponentByManifest(h);if(t){E("Application Component (ACH)",e,t);return true}else{E("Application Component (ACH)",e,"ERROR: Path /sap.app/ach not found in manifest.json! Possible reason: Invalid manifest.json");return false}}function M(e){var t=a.getApplicationIDByManifest(h);if(t){E("Application ID",e,t);return true}else{E("Application ID",e,"ERROR: Path /sap.app/id not found in manifest.json! Possible reason: Invalid manifest.json");return false}}function V(e){if(h){var t=a.getFloorplanByManifest(h)}else{t=a.getFloorplanByStructure()}if(!a.isValidFloorplan(t)){t=a.mFloorplans.UNKNOWN}if(t===a.mFloorplans.UNKNOWN){E("Floorplan Component (ACH)",e,a.getTicketComponentForFloorplan(t)+" (ERROR: Unknown floorplan! Possible reason: Invalid manifest.json)");return false}else{E("Floorplan Component (ACH)",e,a.getTicketComponentForFloorplan(t)+" ("+t+")");return true}}function T(e,t){if(!(h&&i.hasObjectContent(h))){return false}if(!(h["sap.app"]&&h["sap.app"].dataSources&&h["sap.app"].dataSources[e])){E("OData Service Metadata",t,"ERROR: Data source "+e+" not found at /sap.app/dataSources/"+e+" in manifest.json! Possible reason: Invalid manifest.json");return false}if(!h["sap.app"].dataSources[e].uri){E("OData Service Metadata",t,"ERROR: Data source URI not found at /sap.app/dataSources/"+e+"/uri in manifest.json! Possible reason: Invalid manifest.json");return false}var n=h["sap.app"].dataSources[e].uri;if(n.lastIndexOf("/")!==n.length-1){n+="/"}n+="$metadata";I("OData Metadata",t,n,window.location.origin+n);return true}function k(e,t){if(!(h&&i.hasObjectContent(h)&&g)){return false}if(!(h["sap.app"]&&h["sap.app"].dataSources&&h["sap.app"].dataSources[e])){E("Annotations",t,"ERROR: Data source "+e+" not found at /sap.app/dataSources/"+e+" in manifest.json! Possible reason: Invalid manifest.json");return false}if(!(h["sap.app"].dataSources[e].settings&&h["sap.app"].dataSources[e].settings.annotations&&h["sap.app"].dataSources[e].settings.annotations!==[])){E("Annotations",t,"ERROR: Data source "+e+" has no annotations at /sap.app/dataSources/"+e+"/settings/annotations in manifest.json! Possible reason: Invalid manifest.json");return false}var n=h["sap.app"].dataSources[e].settings.annotations;n=n.reverse();for(var a in n){if(!n.hasOwnProperty(a)){continue}var o=n[a];if(h["sap.app"].dataSources[o]){var s=h["sap.app"].dataSources[o].uri;if(!s){continue}var r="";var u="";if(s.indexOf("/")===0){u="Backend Annotation";r=window.location.origin}else{u="Local Annotation";r=g;if(r.lastIndexOf("/")!==r.length-1){r+="/"}}u+=" (Prio. "+parseInt(parseInt(a,10)+1,10)+")";I(u,t,h["sap.app"].dataSources[o].uri,r+h["sap.app"].dataSources[o].uri)}}return true}function B(e){if(!h){return}var t=0;function n(e){t+=.01;return e+t}if(!(h["sap.ui5"]&&h["sap.ui5"].models)){E("Data Sources",e,"ERROR: Path /sap.ui5/models not found in manifest.json! Possible reason: Invalid manifest.json");return}var a=h["sap.ui5"].models;var o=[];for(var s in a){if(!a.hasOwnProperty(s)){continue}if(a[s]&&a[s].dataSource&&a[s].dataSource!==""){var r=false;for(var u in o){if(!o.hasOwnProperty(u)){continue}if(o[u].dataSource===a[s].dataSource){r=true;break}}var p=s===""?"mainService":s;if(!r){o.push({models:[p],dataSource:a[s].dataSource})}else{o[u].models.push(p)}}}if(o.length===0){E("Data Sources",e,"ERROR: No models with data sources found in manifest.json! Possible reason: Invalid manifest.json");return}for(var l in o){if(!o.hasOwnProperty(l)){continue}if(!(h["sap.app"]&&h["sap.app"].dataSources)){E("Data Sources",e,"ERROR: No data sources found at /sap.app/dataSources in manifest.json! Possible reason: Invalid manifest.json");return}if(!h["sap.app"].dataSources[o[l].dataSource]){E("Data Sources",e,"ERROR: Data source "+o[l].dataSource+" not found at /sap.app/dataSources/"+o[l].dataSource+" in manifest.json! Possible reason: Invalid manifest.json");return}j(i.concatStrings(o[l].models),n(e));T(o[l].dataSource,n(e));k(o[l].dataSource,n(e))}}function x(e){var t=r.byId(e);if(t){return t}else{return new o(e,{viewName:"sap.ovp.support.DiagnosticsTool.view.DiagnosticsTool",viewData:{plugin:p}})}}function G(){var e=x(f);e.placeAt(u);var t=new n;e.setModel(t,"data")}function K(){p=this;l=window.location.hash.slice(1);if(e.isToolStub()){if(!e.hasListeners(u+"SetData")){e.attachEvent(u+"SetData",z)}if(!e.hasListeners(u+"UpdateStatus")){e.attachEvent(u+"UpdateStatus",Q)}if(!e.hasListeners(u+"ShowDataRefreshed")){e.attachEvent(u+"ShowDataRefreshed",Z)}window.fioriElementsPluginID=u;G()}else{if(!e.hasListeners(u+"GetData")){e.attachEvent(u+"GetData",$)}d.unsubscribe("elements","ViewRendered",ee);d.unsubscribe("elements","ViewRenderingStarted",ee);d.subscribe("elements","ViewRendered",ee);d.subscribe("elements","ViewRenderingStarted",ee);if("onhashchange"in window){window.addEventListener("hashchange",te)}}$()}function W(){if(e.isToolStub()){window.fnFEPluginToolInstanceExit=undefined;e.detachEvent(u+"SetData",z);e.detachEvent(u+"UpdateStatus",Q);e.detachEvent(u+"ShowDataRefreshed",Z);x(f).destroy()}else{window.fnFEPluginAppInstanceExit=undefined;e.detachEvent(u+"GetData",$);d.unsubscribe("elements","ViewRendered",ee);d.unsubscribe("elements","ViewRenderingStarted",ee);if("onhashchange"in window){window.removeEventListener("hashchange",te)}}}function J(){e.sendEvent(u+"GetData",{})}function H(){var t=new n;c.sort(i.getDynamicComparator("order"));var a=(new Date).toLocaleTimeString([],{hour12:false,hour:"2-digit",minute:"2-digit",second:"2-digit"});var o=true;if(!c||c.length===0){o=false}var s=i.getApplicationStatus();if(!s){i.setApplicationStatus(i.mApplicationStatus.UNKNOWN);s=i.mApplicationStatus.UNKNOWN}var r="";if(s===i.mApplicationStatus.FAILED){r="The application did not finish loading or is no Fiori Elements application! The shown data below could be collected anyway. If the application finishes loading, the data will be updated automatically."}t.setData({properties:c,url:window.location.href,origin:window.location.origin,retrieval:a,copyEnabled:o,status:s,statusMessage:r});e.sendEvent(u+"SetData",JSON.parse(t.getJSON()))}function Y(t,n){e.sendEvent(u+"UpdateStatus",{timeLeft:t,status:n})}function q(){e.sendEvent(u+"ShowDataRefreshed",{})}function X(e){if(v){g=a.getRootPath(v)}c=[];H();y(1);P(2);L(3);H();if(e&&h&&i.hasObjectContent(h)){U(3);F(4);V(5);B(6);H();q()}else if(v){jQuery.when(i.getFileFromURI(v)).done(function(e){h=e;U(3);M(4);F(5);V(6);B(7)}).fail(function(){E("Manifest",3,"ERROR: Could not access manifest.json even though link could be generated! Possible reason: missing permission to access file.")}).always(function(){H();q()})}}function $(){h=undefined;v=undefined;g=undefined;var e=i.getApplicationStatus();var t=i.getAppComponent();var n=false;if(!(e&&i.isValidApplicationStatus(e))){e=i.mApplicationStatus.UNKNOWN}if(e===i.mApplicationStatus.LOADING){ee();return}else if(e===i.mApplicationStatus.FAILED){var o=C(t);if(o&&i.hasObjectContent(o)){h=o;if(h&&h["sap.app"]&&h["sap.app"].id){v=A(h["sap.app"].id);if(!v){n=true}}else{n=true}}else{N("Could not load any data because manifest and component of current application are unknown!");q();return}}else if(e===i.mApplicationStatus.RENDERED){v=A();if(!v){o=C(t);if(o&&i.hasObjectContent(o)){h=o;if(h&&h["sap.app"]&&h["sap.app"].id){v=A(h["sap.app"].id);if(!v){n=true}}else{n=true}}else{N("Could not load any data because manifest and component of current application are unknown!");q();return}}}else if(e===i.mApplicationStatus.UNKNOWN){if(a.getFloorplanByStructure()!==a.mFloorplans.UNKNOWN){h=a.getManifestByStructure();if(h&&i.hasObjectContent(h)){if(h&&h["sap.app"]&&h["sap.app"].id){v=A(h["sap.app"].id);if(!v){n=true}}else{n=true}}}else{N("Could not load any data because manifest and component of current application are unknown!");q();return}}X(n)}function z(e){var t=new n;t.setJSON(JSON.stringify(e.getParameters()));var a=x(f);a.setModel(t,"data");a.invalidate()}function Q(e){var t=e.getParameters();x(f).getController().updateStatus(t.timeLeft,t.status)}function Z(){var e=x(f);e.getController().showDataRefreshed()}function _(){var e=i.getApplicationStatus();if(R>0){Y(R,e)}else{R=w;i.setApplicationStatus(i.mApplicationStatus.FAILED);Y(0,i.mApplicationStatus.FAILED);S.removeListener(_);S=undefined;$()}R--}function ee(e,t){if(t==="ViewRenderingStarted"||!t&&i.getApplicationStatus()===i.mApplicationStatus.LOADING){i.setApplicationStatus(i.mApplicationStatus.LOADING);if(!S){R=w;S=new s(1e3);S.addListener(_)}}else if(t==="ViewRendered"){i.setApplicationStatus(i.mApplicationStatus.RENDERED);R=w;if(S){S.removeListener(_);S=undefined}$()}}function te(e){function t(e){for(var t=0;t<e.length;t++){if(e[t]==="/"||e[t]==="&"||e[t]==="?"||e[t]==="~"){return t}}return e.length}function n(e,n){if(!e||!n){return false}if(e===n){return true}var a=t(e);var i=t(n);if(a!==i){return false}else if(e.substr(0,a)===n.substr(0,i)){return true}return false}var a,o,s=false;if(e.originalEvent.oldURL&&e.originalEvent.newURL){a=e.originalEvent.oldURL.split("#")[1];o=e.originalEvent.newURL.split("#")[1]}else{a=l;o=window.location.hash.slice(1);l=o}if(a.length>=o.length){s=n(o,a)}else{s=n(a,o)}if(!s){i.setApplicationStatus(i.mApplicationStatus.LOADING);i.setAppComponent(undefined);ee();R=w/2}}return{init:K,exit:W,getId:b,onRefresh:J}}return e.extend("sap.ovp.support.DiagnosticsTool.DiagnosticsTool",{constructor:function(t){e.apply(this,[u,"SAP Fiori Elements",t]);Object.assign(this,p(t))}})});
//# sourceMappingURL=DiagnosticsTool.js.map
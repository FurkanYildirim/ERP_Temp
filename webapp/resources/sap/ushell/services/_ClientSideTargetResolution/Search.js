// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/utils","sap/ushell/services/_ClientSideTargetResolution/Utils","sap/ushell/services/_ClientSideTargetResolution/VirtualInbounds","sap/ushell/services/_ClientSideTargetResolution/Formatter","sap/ushell/TechnicalParameters","sap/base/Log","sap/ui/thirdparty/jquery"],function(e,t,r,n,a,i,jQuery){"use strict";var u=[undefined,"GUI","WDA","UI5"];function s(e,t){var r=e.inbound.resolutionResult;if(!r){return""}return["applicationType","ui5ComponentName","url","additionalInformation","text"].map(function(e){if(t){return r.hasOwnProperty(e)?e+":"+r[e]:""}return r.hasOwnProperty(e)?r[e]:""}).join("")}function o(e){return e.sort(function(e,t){if((e["sap-priority"]||0)-(t["sap-priority"]||0)!==0){return-((e["sap-priority"]||0)-(t["sap-priority"]||0))}if(e.priorityString<t.priorityString){return 1}if(e.priorityString>t.priorityString){return-1}var r=s(e);var n=s(t);if(r<n){return 1}else if(r>n){return-1}return 0})}function l(e,t){var r;if(e&&e["sap-priority"]&&e["sap-priority"][0]){r=parseInt(e["sap-priority"][0],10);if(!isNaN(r)){t["sap-priority"]=r}}return}function f(e,t,r,n){var a;if(!t){return true}if(!e&&e!==""){return false}a=t.value;if(t.format==="reference"){if(/UserDefault\.extended\./.test(a)){i.error("Illegal inbound: extended user default '"+a+"' used as filter");return false}if(r.hasOwnProperty(a)){return e===r[a]}n[a]=true;return true}if(t.format==="value"||t.format==="plain"||t.format===undefined){return e===t.value}else if(t.format==="regexp"){return!!e.match("^"+t.value+"$")}i.error("Illegal oFilter format");return false}function c(e){return e.inbound&&e.inbound.resolutionResult&&e.inbound.resolutionResult["sap.ui"]&&e.inbound.resolutionResult["sap.ui"].technology}function d(e){return e.inbound&&e.inbound.resolutionResult&&e.inbound.resolutionResult.appId}function p(e,t,r,n,a){var i={},u={};Object.keys(e).forEach(function(t){if(t!=="sap-ushell-defaultedParameterNames"){i[t]=e[t]}});if(!t){return i}Object.keys(t).forEach(function(e){var a=t[e],s,o=false;if(!i[e]&&a.hasOwnProperty("defaultValue")){if(a.defaultValue.format&&a.defaultValue.format==="reference"){s=a.defaultValue.value;if(r.hasOwnProperty(s)){if(typeof r[s]==="string"){i[e]=[r[s]];o=true}else if(typeof r[s]==="object"){i[e]=r[s];o=true}}else{i[e]=[a.defaultValue];n.push(a.defaultValue.value)}}else{i[e]=[a.defaultValue.value];o=true}if(o){u[e]=true}}});Object.keys(u).sort().forEach(function(e){a.push(e)});return i}function m(e,t){e.resolutionResult={contentProviderId:t.contentProviderId};if(t&&t.resolutionResult&&t.resolutionResult.hasOwnProperty("sap.platform.runtime")){e.resolutionResult["sap.platform.runtime"]=t.resolutionResult["sap.platform.runtime"]}Object.keys(e.intentParamsPlusAllDefaults).slice(0).forEach(function(t){if(!Array.isArray(e.intentParamsPlusAllDefaults[t])){if(!e.resolutionResult.oNewAppStateMembers){e.resolutionResult.oNewAppStateMembers={}}e.resolutionResult.oNewAppStateMembers[t]=e.intentParamsPlusAllDefaults[t]}})}function h(e,t){e.forEach(function(e){t[e]=true})}function v(e){var t=e.intentParamsPlusAllDefaults["sap-ui-tech-hint"]&&e.intentParamsPlusAllDefaults["sap-ui-tech-hint"][0];var r=e.defaultedParamNames&&e.defaultedParamNames.indexOf("sap-ui-tech-hint")>=0;if(t&&c(e)===t){return r?1:2}return 0}function P(e){var t=e.intentParamsPlusAllDefaults["sap-ui-app-id-hint"]&&e.intentParamsPlusAllDefaults["sap-ui-app-id-hint"][0];if(t&&t===d(e)){return 1}return 0}function g(e,t){function r(e){var t="000"+e;return t.substr(t.length-3)}return["AIDM="+P(e),"CURCP="+(t.isCurrentContentProvider?"1":"0"),e.genericSO?"g":"x","TECM="+v(e),"MTCH="+r(t.countMatchingParams),"MREQ="+r(t.countMatchingRequiredParams),"NFIL="+r(t.countMatchingFilterParams),"NDEF="+r(t.countDefaultedParams),"POT="+r(t.countPotentiallyMatchingParams),"RFRE="+r(999-t.countFreeInboundParams),"TECP="+y(e)].join(" ")}function y(e){var t=c(e);var r=u.indexOf(t);return Math.max(0,r)}function b(e,t){var r=false;if(e.signature.additionalParameters==="allowed"||e.signature.additionalParameters==="ignored"){return true}if(e.signature.additionalParameters==="notallowed"||e.signature.additionalParameters===undefined){r=Object.keys(t).every(function(t){return!(!e.signature.parameters[t]&&t.indexOf("sap-")!==0)})}else{i.error("Unexpected value of inbound for signature.additionalParameters")}return r}function R(e,t,r,a,i){function u(e,t,r){var a=n.formatInbound(r);e[a]=t.noMatchReason+(t.noMatchDebug?"| DEBUG: "+t.noMatchDebug:"")}var s=a?a():(new jQuery.Deferred).resolve(null).promise();return s.then(function(n){var a=t.reduce(function(t,a){var s=a.contentProviderId||"";var o=r[s]||{};if(!t.missingReferences[s]){t.missingReferences[s]={}}var l=M(e,a,o,t.missingReferences[s],n?n[s]:null);if(l.matches){t.matchResults.push(l)}else if(i){u(t.noMatchReasons,l,a)}return t},{matchResults:[],noMatchReasons:{},missingReferences:{}});return jQuery.when(a)})}function O(e,t,r,n,a,i){var u=Object.keys(e).every(function(r){var n=t[r],u=n&&n[0],s=e[r];if(s.required&&(u===null||u===undefined)){return false}if(s.filter){if(!f(u,s.filter,a,i)){return false}}return true});return u}function I(e,t,r,n,i){var u=e.signature.parameters,s=0,o=0,l=0,f=0,c=false,d={};function p(e){return!a.isTechnicalParameter(e)}var m=Object.keys(r).filter(p);var h=n.filter(p);Object.keys(u).filter(p).forEach(function(e){var n=t[e],a=n&&n[0],i=u[e],c=r.hasOwnProperty(e);if(c){++s;if(i.filter){++l}if(i.required){++o}}else if(a===null||a===undefined){++f}});if(i){d.countPotentiallyMatchingParams=m.filter(function(e){return u.hasOwnProperty(e)}).length}else{d.countPotentiallyMatchingParams=m.length}if(r&&r["sap-app-origin-hint"]&&(r["sap-app-origin-hint"][0]||r["sap-app-origin-hint"][0]==="")){var v=r["sap-app-origin-hint"][0];c=v===e.contentProviderId}d.countDefaultedParams=h.length;d.countMatchingParams=s;d.countMatchingRequiredParams=o;d.countMatchingFilterParams=l;d.countFreeInboundParams=f;d.isCurrentContentProvider=c;return d}function M(e,a,i,u,s){var o={inbound:a};function f(e,t,r){e.matches=false;e.noMatchReason=t;e.noMatchDebug=r;return e}function d(t){t.matches=true;t.matchesVirtualInbound=r.isVirtualInbound(a);t.parsedIntent=e;return t}var v=a.semanticObject==="*";o.genericSO=v;var P=e.semanticObject===undefined||e.semanticObject===a.semanticObject||v;if(!P){return f(o,'Semantic object "'+e.semanticObject+'" did not match')}var y=e.action===undefined||e.action===a.action;if(!y){return f(o,'Action "'+e.action+'" did not match')}var R=!a.deviceTypes||e.formFactor===undefined||a.deviceTypes[e.formFactor];if(!R){return f(o,'Form factor "'+e.formFactor+'" did not match',"Inbound: ["+Object.keys(a.deviceTypes).filter(function(e){return!!a.deviceTypes[e]}).join(", ")+"]")}var M=e.params&&e.params["sap-ui-tech-hint"]&&e.params["sap-ui-tech-hint"][0];if(e.treatTechHintAsFilter&&M){var D=c({inbound:a});if(D!==M){return f(o,'Tech Hint as filter "'+M+'" did not match',"Inbound: ["+D+"]")}}var j=[],A=[],w=e.params||{};var S=p(w,a.signature&&a.signature.parameters,i,j,A);var T=S["sap-system"]&&S["sap-system"][0],F=S["sap-app-origin"]&&S["sap-app-origin"][0],C=a.contentProviderId;if(F&&F!==C){return f(o,'Contetn provider as filter "'+F+'" did not match',"Inbound: ["+C+"]")}if(T&&typeof C==="string"&&s&&!s[T]){return f(o,'Data origin "'+T+'" is not compatible with the content provider "'+C+'"',"Inbound: ["+Object.keys(s).join(", ")+"]")}o.intentParamsPlusAllDefaults=S;o.defaultedParamNames=A;l(S,o);var N=O(a.signature.parameters,S,w,A,i,u);if(!N){return f(o,"Inbound parameter signature did not match",n.formatInboundSignature(a.signature))}var x=t.constructParameterDominatorMap(a.signature.parameters);var E=t.findDominatedDefaultParameters(S,A,x);var k=A.filter(function(e){return!E[e]});var V=t.filterObjectKeys(S,function(e){return!E[e]});if(!b(a,V)){return f(o,"Additional parameters not allowed",n.formatInboundSignature(a.signature))}var U=a.signature.additionalParameters==="ignored";if(U){t.filterObjectKeys(V,function(e){if(e.indexOf("sap-")===0){return true}if(a.signature.parameters.hasOwnProperty(e)){return true}return false},true)}var q=I(a,S,w,A,U);m(o,a);o.intentParamsPlusAllDefaults=V;o.defaultedParamNames=k;o.priorityString=g(o,q);h(j,u);return d(o)}return{match:R,matchOne:M,sortMatchingResultsDeterministic:o,matchesFilter:f,checkAdditionalParameters:b,addDefaultParameterValues:p,extractSapPriority:l,serializeMatchingResult:s}});
//# sourceMappingURL=Search.js.map
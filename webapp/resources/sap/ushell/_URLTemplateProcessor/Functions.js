// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/deepExtend","sap/ui/thirdparty/URI","sap/ushell/_URLTemplateProcessor/utils","sap/ushell/utils/type"],function(e,n,r,t){"use strict";var i={url:{args:["urlPart?"],minValues:0,maxValues:0,fn:function(e){var r=new n;var t=["protocol","scheme","username","password","hostname","port","host","userinfo","authority","origin","subdomain","domain","tld","pathname","path","directory","filename","suffix","search","query","hash","fragment","resource"];var i="toString";if(e.urlPart){if(t.indexOf(e.urlPart)===-1){throw new Error("The URL part '"+e.urlPart+"' is not valid. Please use one of "+t.join(", "))}i=e.urlPart}return r[i]()}},if:{args:["trueCondition"],minValues:1,maxValues:2,fn:function(e,n){var r=u(n);if(a(e.trueCondition)){return r.length===1?undefined:r.pop()}return r[0]}},and:{args:["emptyCondition?"],minValues:1,fn:function(e,n){var t=u(n);if(typeof e.emptyCondition==="undefined"&&e.length>0){return undefined}if(typeof e.emptyCondition!=="undefined"&&a(e.emptyCondition)){return undefined}var i=t.pop();var o=t.every(r.hasValue);return o?i:undefined}},or:{args:["emptyCondition?"],minValues:1,fn:function(e,n){var t=u(n);if(typeof e.emptyCondition==="undefined"&&e.length>0){return undefined}if(typeof e.emptyCondition!=="undefined"&&a(e.emptyCondition)){return undefined}return t.reduce(function(e,n){if(r.hasValue(e)){return e}return r.hasValue(n)?n:undefined})}},replace:{args:["strRegExp","strReplace","flags?"],minValues:1,maxValues:1,fn:function(e,n){var r=new RegExp(e.strRegExp,e.flags);var a=e.strReplace||"";if(typeof n===undefined||n===null){return n}if(t.isArray(n)){if(n.length===1){return i.replace.fn.call(this,e,n[0])}return n.map(function(n){return i.replace.fn.call(this,e,n)})}if(t.isPlainObject(n)){return Object.keys(n).reduce(function(r,t){var a=n[t];r[t]=i.replace.fn.call(this,e,a);return r},{})}if(typeof n==="string"){return n.replace(r,a)}return i.replace.fn.call(this,e,n+"")}},join:{args:["macroSeparator?","microSeparator?"],minValues:1,fnPipe:function(e,n){var r=[n];return i.join.fn.call(this,e,r)},fn:function(e,n){var i=e.macroSeparator||"";var a=e.microSeparator||"";n=n.map(function(e){if(!t.isPlainObject(e)&&!t.isArray(e)){return e}var n=Object.prototype.toString.apply(e);if(n==="[object Object]"){var u=r.removeArrayParameterNotation(e);return Object.keys(u).sort().map(function(n){return n+a+e[n]}).join(i)}if(n==="[object Array]"){return e.join(i)}});return n.join(i)}},match:{args:["strRegex"],minValues:1,fnPipe:function(e,n){var r=e.strRegex;var t=new RegExp(r);return Object.keys(n).reduce(function(e,r){if(t.exec(r)){e[r]=n[r]}return e},{})},fn:function(e,n){if(n===undefined){return undefined}var r=e.strRegex;var i=new RegExp(r);var a=n.filter(function(e){var n;if(t.isPlainObject(e)){n=Object.keys(e)}else if(t.isArray(e)){n=e}else{n=[""+e]}return n.some(i.exec.bind(i))});return a.length===n.length?true:undefined}},not:{args:[],minValues:1,fnPipe:function(e,n){return Object.keys(n).length>0?undefined:""},fn:function(e,n){var r=i.and.fn(e,n);return r===undefined?"":undefined}},stringify:{args:[],minValues:1,fn:function(e,n){if(t.isArray(n)){if(n.length===0){return""}if(n.length===1){n=n[0]}}if(typeof n==="string"){return n}return JSON.stringify(n)}},encodeURIComponent:{args:[],minValues:1,maxValues:1,fnPipe:function(e,n){return Object.keys(n).reduce(function(e,r){e[r]=encodeURIComponent(n[r]);return e},{})},fn:function(e,n){var r=n[0];if(typeof r!=="string"){return r}return encodeURIComponent(r)}}};function a(e){if(typeof e==="undefined"){return true}if(typeof e==="string"){return e===""}if(typeof e==="object"){return Object.keys(e).length===0}if(typeof e==="number"){return e===0}if(typeof e==="boolean"){return e===false}throw new Error("Unexpected type for value")}function u(e){var n;if(t.isArray(e)){n=e}else if(t.isPlainObject(e)){n=[e]}else if(e===undefined){return[]}else{throw new Error("Unexpected type")}return n}function o(e,n,r){if(r!==undefined&&!t.isPlainObject(r)){throw new Error("Invalid value type passed to '"+e+"' in pipe context. An object is expected.")}}function f(e,n,i){if(i!==undefined&&!t.isArray(i)){throw new Error("Invalid value type passed to '"+e+"' in value context. An array is expected.")}var a=t.isArray(i)?i.length:0;if(r.hasValue(n.maxValues)&&a>n.maxValues){throw new Error("Too many values were passed to '"+e+"'. Please pass maximum "+n.maxValues+" values.")}if(r.hasValue(n.minValues)&&a<n.minValues){throw new Error("Too few values were passed to '"+e+"'. Please pass minimum "+n.minValues+" values.")}}function s(e){var n=false;e.map(l).reduce(function(e,r){if(!e&&r){n=true}return r},true);return n}function l(e){return e.charAt(e.length-1)!=="?"}function c(e){return e.substr(0,e.length-1)}function p(n,r){var t=e([],i[n].args);if(s(t)){throw new Error("Invalid argument signature. Make sure all optional arguments appear in the end.")}var a={length:r.length};var u=t.filter(l);var o=u>r.length;if(o){throw new Error(n+" requires "+u+" arguments but "+r.length+" was specified")}r.forEach(function(e){var n=t.shift();var i=!l(n);if(i){n=c(n)}if(r.length>0){a[n]=e}});return a}function d(e,n,r,t){if(!i.hasOwnProperty(n)){throw"Invalid function: "+n}var a=p(n,r);if(e){o(n,i[n],t)}else{f(n,i[n],t)}if(e){if(!i[n].fnPipe){throw new Error("The function '"+n+"' cannot be executed in pipe context")}return i[n].fnPipe(a,t)}return i[n].fn(a,t)}function m(e){return e.split("").map(function(e){if(e==="["){return"[\\[]"}return"["+e+"]"}).join("")}function h(){var e=Object.keys(i);return e.map(m).join("|")}return{getPossibleFunctionsRegExpString:h,applyFunctionInValueContext:d.bind(null,false),applyFunctionInPipeContext:d.bind(null,true),_setURIDependency:function(e){n=e}}});
//# sourceMappingURL=Functions.js.map
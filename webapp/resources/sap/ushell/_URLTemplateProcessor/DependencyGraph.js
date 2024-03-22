// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/util/deepExtend"],function(e){"use strict";function n(e){return typeof e==="string"||e.type==="wildcard"||e.type==="literal"||e.type==="intentParameter"||e.type==="reference"}function r(e){return e.type==="reference"&&!e.namespace}function t(e,n,t){if(!e.hasOwnProperty(n)){e[n]=[]}if(r(t)){e[n].push(t.value)}}function i(e){var n={};var r=t.bind(null,n);Object.keys(e).forEach(function(n){var t=e[n];a(t,n,r)});return n}function u(e){var n=e.type;if(n==="expression"){return[e.value]}if(n==="function"){return(e.args||[]).concat(e.params||[])}if(n==="pipe"||n==="path"){return e.value}throw new Error("Unknown type encountered while building dependency graph: '"+n+"'")}function a(e,r,t){t(r,e);if(n(e)){return}var i=u(e);i.forEach(function(e){a(e,r,t)})}function c(n){var r=e({},n);var t,i,u=[],a={};do{var c=Object.keys(r);t=c.length;c.forEach(function(e){if(r[e].length>0){r[e]=r[e].filter(function(e){var n=!a[e];var t=r.hasOwnProperty(e);return n&&t})}if(r[e].length===0){delete r[e];u.push(e);a[e]=true}});i=Object.keys(r).length}while(t!==i);if(i!==0){throw new Error("Graph of dependencies contains cyclic references")}return u}return{buildDependencyGraph:i,getDependencyResolutionOrder:c}});
//# sourceMappingURL=DependencyGraph.js.map
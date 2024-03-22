// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/ui/thirdparty/URI","sap/ui/thirdparty/URITemplate","sap/ushell/_URLTemplateProcessor/DefinitionParameterSetBuilder","sap/ushell/_URLTemplateProcessor/DependencyGraph","sap/ushell/_URLTemplateProcessor/Resolvers","sap/ushell/_URLTemplateProcessor/TemplateParameterParser","sap/ushell/_URLTemplateProcessor/utils"],function(e,r,t,a,n,o,s,i){"use strict";function p(r){e.debug(r,"sap.ushell.URLTemplateProcessor")}function l(e){if(typeof e==="undefined"){return"<undefined>"}if(typeof e==="string"){if(e===""){return"<empty string>"}return"'"+e+"'"}if(typeof e==="number"){return"(number) "+e}if(typeof e==="boolean"){return"(bool) "+e}var r;if(typeof e==="object"){r=JSON.stringify(e);if(r.length>255){r=r.substr(0,255)+"..."}}else{r="{other type}"}return r}function u(e){var r=Object.keys(e).filter(function(r){return typeof e[r]==="object"&&e[r].hasOwnProperty("renameTo")});var t=[];r.forEach(function(r){var a=e[r];if(a.hasOwnProperty("renameTo")){t.push(function(e,t){var n=t;n=t.replace(new RegExp(r+"=","g"),a.renameTo+"=");return n})}});return t}function f(e,r,t,a,n){var o=c(e,r,t,a,n);return m(e,o)}function c(e,r,t,u,f){p("[TEMPLATE EXPANSION] "+e.urlTemplate);var c=a.buildDefinitionParameterSet(e.parameters,r,f)||{};var m=i.removeArrayParameterNotation(t[f]||{});var d=s.parseTemplateParameterSet(c,f);var v=s.parseTemplateParameterSetAsLiterals(m);var y=i.mergeObject(v,d);p("- parsed template parameters: "+JSON.stringify(y,null,3));var P=n.buildDependencyGraph(y);p("- created dependency graph: "+JSON.stringify(P,null,3));var h=n.getDependencyResolutionOrder(P);p("- resolving in order: "+h.join(" > "));var T=o.resolveAllParameters(y,h,r,t,u,f);Object.keys(T).forEach(function(e){var r=T[e];p(e+" --\x3e "+l(r))});return{oDefinitionParamsSet:c,oResolvedParameters:T}}function m(e,t){var a=u(t.oDefinitionParamsSet||{});var n=e.urlTemplate;var o=r.expand(n,t.oResolvedParameters).toString();p("- created URL: "+o);a.forEach(function(e){o=e(n,o)});if(a.length>0){p("- created URL (post expansion): "+o)}return o}return{prepareExpandData:c,expand:f}});
//# sourceMappingURL=URLTemplateProcessor.js.map
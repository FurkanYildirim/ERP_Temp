/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/sac/df/thirdparty/lodash","sap/zen/dsh/utils/BaseHandler","sap/zen/dsh/widgets/utils/info_chart_exception"],function(jQuery,e,i,r){"use strict";function n(i,r){return e.map(i,function(i){return{feed:i.id,source:e.map(i.values,function(e){if(e.type==="MND"){return{measureNames:r}}else{return e.id}})}})}function s(i,r,n){var s={Dimension:"String",Measure:"Number"};return e.map(r,function(r){var t=e.find(i,{feed:r.id});var a=[];if(t&&t.source){a=e.map(t.source,function(i){if(e.isObject(i)){return{id:"MND",type:"MND",measureNames:n}}else{return{id:i,type:r.type,dataType:t.feed==="timeAxis"?"Date":s[r.type]}}})}return{id:r.id,values:a}})}function t(i,r){var n=e.map(i.fields,"id");return e.map(r,function(i){var r=e.filter(i.source,function(i){return e.isObject(i)||e.includes(n,i)});return{feed:i.feed,source:r}})}function a(i,r){var n=e.reduce(r,function(i,r){return e.union(i,r.source)},[]);return e.reduce(i.fields,function(i,r){if(!e.includes(n,r.id)){i.push(e.pick(r,"id","type","dataType"))}return i},[])}function u(e,i){var n=sap.viz.moduleloader.require.config({context:"lw-vizservices"})("sap/viz/vizservices/service/feed/FeedService");var s=n.validate(e,i);if(!s.valid){var t={chartType:e,feeds:i,validationResult:s};var a=d(s,"results.bindings.valueAxis.missing")||d(s,"results.bindings.valueAxis2.missing");var u=d(s,"results.bindings.categoryAxis.missing");if(a&&u){throw new r("bindings.missing.measuresAndDimensions",t)}else if(a){throw new r("bindings.missing.measures",t)}else if(u){throw new r("bindings.missing.dimensions",t)}else{throw new r("bindings.error",t)}}}function d(i,r){return e.reduce(r.split("."),function(e,i){return e&&e[i]},i)}function c(e){return sap.viz.api.metadata.Viz.get(e).bindings}function f(i){return e.map(e.filter(i,{type:"Measure"}),"id")}function o(i,r){var n=e.find(r,function(e){return e.feed==="timeAxis"});if(n&&e.isArray(n.source)&&n.source[0]){var s=n.source[0];var t=e.find(i.fields,function(e){return e.id===s});t.dataType="Date"}return i}return{suggestBindings:function(i,r,u,d){var v;var l;var p=Boolean(d&&d!==i);var m;v=c(i);l=e.map(e.filter(v,{type:"Measure"}),"id");var g;if(p){var y=c(d);var b=f(y);var h=s(u,y,b);var z=sap.viz.vizservices.BVRService.switchFeeds(d,h,i).feedItems;g=n(z,l)}var w=t(r,g||u);l=f(v);var x=s(w,v,l);r=o(r,w);var A=a(r,w);m=sap.viz.vizservices.BVRService.suggestFeeds(i,x,A).feedItems;return n(m,l)},validateBindings:function(e,i){var r=c(e);var n=f(r);u(e,s(i,r,n))}}});
//# sourceMappingURL=info_binding_service.js.map
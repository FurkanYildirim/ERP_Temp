/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/base/Log","sap/sac/df/thirdparty/lodash","sap/zen/dsh/utils/BaseHandler","sap/zen/dsh/widgets/SDKhtml5chart_util","sap/ui/core/format/DateFormat"],function(jQuery,e,t,a,r){"use strict";e.info("Loaded LegacyInitialViewFeeding");function i(e){this._SdkHtml5ChartUtil=e||r}i.prototype.getFeedingData=function(e,t,a){var r=s(e);var i=(new this._SdkHtml5ChartUtil).createCvomChart("NotUsedId",r);var p=n(i);var c=p.mapData(i,t);var l=c.ds;var f=c.dataFeeding||d(r);if(!a&&o(e)){i.setData(t);a=u(i)}return{data:l.data(),feeding:f,dFeedItems:a}};function n(e){var a=e.createDataMapper();a.getMessages=t.constant({chart_mapping_error:"why is this needed?"});return a}function d(e){if(e!=="pie"){return[]}return[{feedId:"pieSectorColor",binding:[{type:"analysisAxis",index:1}]},{feedId:"pieSectorSize",binding:[{type:"measureValuesGroup",index:1}]}]}function s(e){return e.replace(/((viz)|(info))\//,"")}function o(e){return e&&e.indexOf("dual")!==-1}function u(e){var t;try{t=e.getPropertyValues().plotObjectType.dataByInitialView}catch(e){t=null}return t}return i});
//# sourceMappingURL=LegacyInitialViewFeeding.js.map
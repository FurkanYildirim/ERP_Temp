/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/utils/checkForTimeout","sap/apf/utils/exportToGlobal","sap/ui/model/odata/ODataUtils"],function(e,t,r){"use strict";function a(e,t,a,s,i){var u=e.instances.datajs;function c(e,t){var r=sap.apf.core.utils.checkForTimeout(t);var i={};if(r){i.messageObject=r;s(i)}else{a(e,t)}}function o(e){var t=sap.apf.core.utils.checkForTimeout(e);if(t){e.messageObject=t}s(e)}var n=t.serviceMetadata;var f=e.functions.getSapSystem();if(f&&!t.isSemanticObjectRequest){var p=/(\/[^\/]+)$/g;if(t.requestUri&&t.requestUri[t.requestUri.length-1]==="/"){t.requestUri=t.requestUri.substring(0,t.requestUri.length-1)}var l=t.requestUri.match(p)[0];var q=t.requestUri.split(l);var v=r.setOrigin(q[0],{force:true,alias:f});t.requestUri=v+l}u.request(t,c,o,i,undefined,n)}t("sap.apf.core.odataRequestWrapper",a);return a});
//# sourceMappingURL=odataRequest.js.map
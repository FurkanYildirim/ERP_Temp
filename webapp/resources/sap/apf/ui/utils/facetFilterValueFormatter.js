/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/ui/utils/formatter","sap/apf/utils/exportToGlobal"],function(t,e){"use strict";function a(t,e){"use strict";this.getFormattedFFData=function(a,i,r){var u,n;var o=new sap.apf.ui.utils.formatter({getEventCallback:t.getEventCallback.bind(t),getTextNotHtmlEncoded:e.getTextNotHtmlEncoded,getExits:t.getCustomFormatExit()},r,a);var f=r.text;a.forEach(function(t){u=o.getFormattedValue(i,t[i]);n=u;if(f!==undefined&&t[f]!==undefined){n=u+" - "+t[f]}t.formattedValue=n});return a}}e("sap.apf.ui.utils.FacetFilterValueFormatter",a);return a});
//# sourceMappingURL=facetFilterValueFormatter.js.map
/*
 * ! SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/ui/utils/printView","sap/apf/ui/utils/formatter","sap/apf/utils/exportToGlobal","sap/viz/ui5/types/legend/Common","sap/base/util/isEmptyObject","sap/ui/Device","sap/ui/layout/VerticalLayout","sap/ui/thirdparty/jquery"],function(t,e,i,n,a,r,o,jQuery){"use strict";function s(t){"use strict";var e=t.oCoreApi;var i=t.uiApi;var n=null;var s=new sap.apf.ui.utils.PrintModel(t);var l=new sap.apf.ui.utils.PrintView(t,s);this.oPrintLayout={};function u(t){if(!a(t.oPrintLayout)){t.oPrintLayout.removeContent()}jQuery("#apfPrintArea").remove();jQuery("body").append('<div id="apfPrintArea"></div>');i.createApplicationLayout(false).then(function(t){t.setBusy(true)})}this.doPrint=function(t){t=t||0;e.getApplicationConfigProperties().done(function(i){s.setApplicationConfig(i);var a,r,f;var d=2e3,h=this;s.nStepRenderCount=0;n=e.getSteps();s.nNoOfSteps=n.length;this.oPrintLayout=new o({id:"idAPFPrintLayout"});u(this);f=new o({id:"idAPFPrintFirstPageLayout",content:[l.getHeaderForFirstPage(),l.getPrintLayoutForFacetFiltersAndFooters()]}).addStyleClass("filterLayout");this.oPrintLayout.addContent(f);for(a=0;a<n.length;a++){r=parseInt(a,10)+1;this.oPrintLayout.addContent(l.getPrintLayoutForEachStep(n[a],r,n.length))}this.oPrintLayout.placeAt("apfPrintArea");p(h.oPrintLayout,d,t)}.bind(this))};function p(t,e,n){new Promise(function(t){setTimeout(function(){t()},e)}).then(function(){h(t);if(n==1){d(n)}else{d()}f(t);return i.createApplicationLayout(false)}).then(function(t){t.setBusy(false)})}function f(t){var e,i;var a,r;for(var o=0;o<jQuery("#apfPrintArea").siblings().length;o++){jQuery("#apfPrintArea").siblings()[o].hidden=false}for(var s=0;s<n.length;s++){e=n[s].getSelectedRepresentation();e=e.bIsAlternateView?e.toggleInstance:e;if(e&&e.titleControl&&e.titleControl.oParent){a=e.titleControl.oParent.getItems();if(a&&a.length>1){for(var l=0;l<a.length;l++){if(a[l].getMetadata()._sClassName==="sap.m.HBox"){r=a[l];r.setVisible(true)}}}}if(e.type!==sap.apf.ui.utils.CONSTANTS.representationTypes.TREE_TABLE_REPRESENTATION&&e.type!==sap.apf.ui.utils.CONSTANTS.representationTypes.TABLE_REPRESENTATION){i=t.getContent()[s+1].getContent()[1].getContent()[0];i.destroy();i=null}}t.destroy();t=null;jQuery("div[id^=idAPFStepLayout]").remove();jQuery("#apfPrintArea").remove()}function d(t){t=t||0;var e=r.system.tablet;var i=r.os.ios;if(e===true&&i===true){var n=jQuery("html").clone();var a=jQuery(n).find("body");jQuery(a).children("div").each(function(t,e){if(jQuery(e).attr("id")==="apfPrintArea"){jQuery(e).show()}else{jQuery(e).remove()}});jQuery(jQuery(n).find("body")).html(jQuery(a.html()));var o="<html>"+jQuery(n).html()+"</html>";var s=window.open("","_blank","width=300,height=300");s.opener=null;s.document.write(o);s.print()}else{if(t==0){var l=window.open("","_blank","height=600,width=700");var u=document.getElementById("apfPrintArea").innerHTML;l.opener=null;l.document.write("<html><head><title>Analysis Path Framework</title>");l.document.write("</head><body >");l.document.write(u);l.document.write("</body></html>");l.document.close();l.print();l.close()}else{window.print()}}}function h(t){var e=t.getDomRef();jQuery("#apfPrintArea").empty();jQuery("#apfPrintArea").append(jQuery(e).html());for(var i=0;i<jQuery("#apfPrintArea").siblings().length;i++){jQuery("#apfPrintArea").siblings()[i].hidden=true}}}i("sap.apf.ui.utils.Print",s);return s});
//# sourceMappingURL=print.js.map
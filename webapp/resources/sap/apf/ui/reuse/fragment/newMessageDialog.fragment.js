/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button","sap/m/Dialog","sap/m/library","sap/m/Text","sap/ui/core/Fragment"],function(e,t,a,o){"use strict";var n=a.DialogType;sap.ui.jsfragment("sap.apf.ui.reuse.fragment.newMessageDialog",{createContent:function(a){var r=new e(a.createId("idYesButton"),{text:a.oCoreApi.getTextNotHtmlEncoded("yes")});var s=new e(a.createId("idNoButton"),{text:a.oCoreApi.getTextNotHtmlEncoded("no")});var i=new t(a.createId("idNewDialog"),{type:n.Standard,title:a.oCoreApi.getTextNotHtmlEncoded("newPath"),content:new o({text:a.oCoreApi.getTextNotHtmlEncoded("analysis-path-not-saved")}).addStyleClass("textStyle"),buttons:[r,s],afterClose:function(){i.destroy()}});return i}})});
//# sourceMappingURL=newMessageDialog.fragment.js.map
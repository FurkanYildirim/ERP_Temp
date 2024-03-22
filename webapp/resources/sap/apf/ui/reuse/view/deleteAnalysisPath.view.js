/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/m/Button","sap/m/Dialog","sap/m/library","sap/m/List","sap/m/StandardListItem","sap/ui/Device","sap/ui/thirdparty/jquery","sap/ui/core/mvc/JSView"],function(e,t,i,a,s,o,jQuery){"use strict";var n=i.ListMode;sap.ui.jsview("sap.apf.ui.reuse.view.deleteAnalysisPath",{getControllerName:function(){return"sap.apf.ui.reuse.controller.deleteAnalysisPath"},createContent:function(i){var l=jQuery(window).height()*.6+"px";var p=jQuery(window).height()*.6+"px";this.oCoreApi=this.getViewData().oInject.oCoreApi;this.oUiApi=this.getViewData().oInject.uiApi;var r=this;var d=new a({mode:n.Delete,items:{path:"/GalleryElements",template:new s({title:"{AnalysisPathName}",description:"{description}",tooltip:"{AnalysisPathName}"})},delete:i.handleDeleteOfDialog.bind(i)});var c=new t({title:r.oCoreApi.getTextNotHtmlEncoded("delPath"),contentWidth:l,contentHeight:p,content:d,leftButton:new e({text:r.oCoreApi.getTextNotHtmlEncoded("close"),press:function(){c.close();r.oUiApi.getLayoutView().setBusy(false)}}),afterClose:function(){r.destroy()}});if(o.system.desktop){this.addStyleClass("sapUiSizeCompact");c.addStyleClass("sapUiSizeCompact")}return c}})});
//# sourceMappingURL=deleteAnalysisPath.view.js.map
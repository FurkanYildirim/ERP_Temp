/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/m/List","sap/m/ListType","sap/m/StandardListItem"],function(e,t,i){"use strict";sap.ui.jsview("sap.apf.ui.reuse.view.toolbar",{getControllerName:function(){return"sap.apf.ui.reuse.controller.toolbar"},createContent:function(s){this.maxNumberOfSteps=32;this.maxNumberOfPaths=255;var a=this;var n=this.getViewData();a.oCoreApi=n.oCoreApi;a.oUiApi=n.uiApi;var o=new i({id:this.createId("idAnalysisPathMenuNewAnalysisPath"),icon:"sap-icon://add-product",type:t.Active,title:a.oCoreApi.getTextNotHtmlEncoded("new"),press:function(){a.getParent().close();a.oUiApi.getLayoutView().setBusy(true);s.getNewAnalysisPathDialog();a.oUiApi.getLayoutView().setBusy(false)}});var r=new i({id:this.createId("idAnalysisPathMenuOpenAnalysisPath"),icon:"sap-icon://open-folder",type:t.Active,title:a.oCoreApi.getTextNotHtmlEncoded("open"),press:function(){s.bIsPathGalleryWithDelete=false;a.oUiApi.getLayoutView().setBusy(true);a.getParent().close();s.onOpenPathGallery(s.bIsPathGalleryWithDelete)}});var l=new i({id:this.createId("idAnalysisPathMenuSaveAnalysisPath"),icon:"sap-icon://save",type:t.Active,title:a.oCoreApi.getTextNotHtmlEncoded("save"),press:function(){a.getParent().close();s.onSaveAndSaveAsPress(false)}});var c=new i({id:this.createId("idAnalysisPathMenuSaveAnalysisPathAs"),icon:"sap-icon://save",type:t.Active,title:a.oCoreApi.getTextNotHtmlEncoded("savePathAs"),press:function(){a.getParent().close();s.onSaveAndSaveAsPress(true)}});var p=new i({id:this.createId("idAnalysisPathMenuDeleteAnalysisPath"),icon:"sap-icon://delete",type:t.Active,title:a.oCoreApi.getTextNotHtmlEncoded("delete"),press:function(){s.bIsPathGalleryWithDelete=true;a.getParent().close();a.oUiApi.getLayoutView().setBusy(true);s.openPathGallery(s.bIsPathGalleryWithDelete)}});var d=new i({id:this.createId("idAnalysisPathMenuPrintAnalysisPath"),icon:"sap-icon://print",type:t.Active,title:a.oCoreApi.getTextNotHtmlEncoded("print"),press:function(){a.getParent().close();s.doPrint()}});this.oActionListItem=new e({items:[o,r,l,c,p,d]});return this.oActionListItem}})});
//# sourceMappingURL=toolbar.view.js.map
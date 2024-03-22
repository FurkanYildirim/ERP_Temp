/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/m/Bar","sap/m/Button","sap/m/Dialog","sap/m/List","sap/m/NavContainer","sap/m/Page","sap/m/SearchField","sap/m/StandardListItem","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/thirdparty/jquery","sap/ui/core/Fragment"],function(e,t,a,n,i,r,o,l,s,p,jQuery){"use strict";sap.ui.jsfragment("sap.apf.ui.reuse.fragment.stepGallery",{createContent:function(g){var c=this;this.contentWidth=jQuery(window).height()*.6+"px";this.contentHeight=jQuery(window).height()*.6+"px";this.oCoreApi=g.oCoreApi;this.oUiApi=g.oUiApi;var d=function(e){var t=[];var a=e.getSource().getValue();var n=c.oStepGalleryHierarchicalDialog.getContent()[0].getCurrentPage().getContent()[0];if(a&&a.length>0){var i=new s("title",p.Contains,a);t.push(i)}var r=n.getBinding("items");r.filter(t)};var u=function(e){c.oUiApi.getLayoutView().setBusy(true);var t=e.getSource().getBindingContext().sPath.split("/");var a=t[2];var n=t[4];var i=t[6];var r=g.getStepDetails(a,n);g.onStepPress(r.id,r.representationtypes[i].representationId)};var h=(new n).bindItems({path:"representationtypes",template:new l({title:"{title}",icon:"{picture}",tooltip:"{title}",type:"Active",wrapping:true,press:u}).bindProperty("description","sortDescription",function(e){var t=[];if(e===undefined||e===null){return null}t=e.length?e.join(", "):e;return c.oCoreApi.getTextNotHtmlEncoded("sortBy")+": "+t})});var v=new r({id:this.createId("idStepGalleryRepresentationPage"),subHeader:new e({contentLeft:[new o({liveChange:d})]}).addStyleClass("searchMargin"),content:h,showNavButton:true,navButtonPress:function(){c.oStepGalleryNavContainer.back()}});var y=(new n).bindItems({path:"stepTemplates",template:new l({title:"{title}",tooltip:"{title}",type:"Navigation",press:function(e){var t=e.getSource().getBindingContext();v.setBindingContext(t);v.setTitle(e.getSource().getTitle());c.oStepGalleryNavContainer.to(c.oStepGalleryNavContainer.getPages()[2])}})});var C=new r({id:this.createId("idStepGalleryStepPage"),subHeader:new e({contentLeft:[new o({liveChange:d})]}).addStyleClass("searchMargin"),content:y,showNavButton:true,navButtonPress:function(){c.oStepGalleryNavContainer.back()}});var S=(new n).bindItems({path:"/GalleryElements",template:new l({title:"{title}",tooltip:"{title}",type:"Navigation",press:function(e){var t=e.getSource().getBindingContext();C.setBindingContext(t);C.setTitle(e.getSource().getTitle());c.oStepGalleryNavContainer.to(c.oStepGalleryNavContainer.getPages()[1])}})});var w=new r({id:this.createId("idStepGalleryCategoryPage"),title:c.oCoreApi.getTextNotHtmlEncoded("category"),tooltip:c.oCoreApi.getTextNotHtmlEncoded("category"),subHeader:new e({contentLeft:[new o({liveChange:d})]}).addStyleClass("searchMargin"),content:S});this.oStepGalleryNavContainer=new i({pages:[w,C,v]});this.oStepGalleryNavContainer.setModel(g.getView().getModel());this.oStepGalleryHierarchicalDialog=new a({contentWidth:c.contentWidth,contentHeight:c.contentHeight,showHeader:false,content:[this.oStepGalleryNavContainer],endButton:new t({text:c.oCoreApi.getTextNotHtmlEncoded("cancel"),press:function(){c.oStepGalleryHierarchicalDialog.close();c.oStepGalleryHierarchicalDialog.destroy()}}),afterClose:function(){c.oStepGalleryHierarchicalDialog.destroy()}});return this.oStepGalleryHierarchicalDialog}})});
//# sourceMappingURL=stepGallery.fragment.js.map
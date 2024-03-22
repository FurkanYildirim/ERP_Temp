/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Control","sap/m/NavContainer","sap/m/Page","sap/m/List","sap/m/StandardListItem"],function(t,e,i,n,o){"use strict";var a=t.extend("sap.gantt.legend.LegendContainer",{metadata:{library:"sap.gantt",properties:{width:{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:"200px"},height:{type:"sap.ui.core.CSSSize",group:"Misc",defaultValue:"200px"}},aggregations:{legendSections:{type:"sap.m.Page",multiple:true,visibility:"public",singularName:"legendSection"}}}});a.prototype.init=function(){this._oRb=sap.ui.getCore().getLibraryResourceBundle("sap.gantt");this._sTitle=this._oRb.getText("LEGEND_TITLE");this._oNavContainer=new e({autoFocus:false,width:this.getWidth(),height:this.getHeight()});this._oInitNavPage=new i({title:this._oRb.getText("LEGEND_TITLE"),content:[new n]});this._aLegendSections=[]};a.prototype.setWidth=function(t){this.setProperty("width",t,true);this._oNavContainer.setWidth(t);return this};a.prototype.setHeight=function(t){this.setProperty("height",t,true);this._oNavContainer.setHeight(t);return this};a.prototype.addLegendSection=function(t){if(t){if(this._aLegendSections.length==1){this._oNavContainer.insertPage(this._oInitNavPage,0);this._aLegendSections[0].setShowNavButton(true)}if(this._aLegendSections.length!==0){t.setShowNavButton(true)}t.attachNavButtonPress(this._onNavBack,this);t.setBackgroundDesign(sap.m.PageBackgroundDesign.Solid);t.setEnableScrolling(true);var e=t.getTitle();if(e!==undefined){var i=new o({title:e,type:sap.m.ListType.Navigation});i.attachPress(this._onNavToLegendSection,this);this._oInitNavPage.getContent()[0].addItem(i)}this._aLegendSections.push(t);this._oNavContainer.addPage(t)}return this};a.prototype.insertLegendSection=function(t,e){if(t){var i=this._aLegendSections.length;if(i==1){this._oNavContainer.insertPage(this._oInitNavPage,0);this._aLegendSections[0].setShowNavButton(true)}if(i!==0){t.setShowNavButton(true)}if(e>=i){e=i}t.attachNavButtonPress(this._onNavBack,this);t.setBackgroundDesign(sap.m.PageBackgroundDesign.Solid);t.setEnableScrolling(true);var n=t.getTitle();if(n!==undefined){var a=new o({title:n,type:sap.m.ListType.Navigation});a.attachPress(this._onNavToLegendSection,this);this._oInitNavPage.getContent()[0].insertItem(a,e)}this._oNavContainer.insertPage(t,e+1);this._aLegendSections.splice(e,0,t)}return this};a.prototype.indexOfLegendSection=function(t){var e=jQuery.inArray(t,this._aLegendSections);return e};a.prototype.removeLegendSection=function(t){var e;if(typeof t==="number"){this._oNavContainer.removePage(t+1);this._oInitNavPage.getContent()[0].removeItem(t);e=this._aLegendSections.splice(t+1,1)}else if(t){this._oInitNavPage.getContent()[0].removeItem(jQuery.inArray(t,this._oNavContainer.getPages())-1);this._oNavContainer.removePage(t);e=this._aLegendSections.splice(jQuery.inArray(t,this._aLegendSections),1)}if(this._aLegendSections.length==1){if(this._oNavContainer.getCurrentPage()==this._oInitNavPage){this._oNavContainer.to(this._aLegendSections[0])}this._aLegendSections[0].setShowNavButton(false)}return e};a.prototype.removeAllLegendSection=function(){var t=this._aLegendSections.splice(0,this._aLegendSections.length);this._oInitNavPage.getContent()[0].removeAllItems();this._oNavContainer.removeAllPages();return t};a.prototype.getLegendSections=function(){var t=this._oNavContainer.getPages();var e=this;return t.filter(function(t){if(t.getTitle()!==e._sTitle){return true}})};a.prototype.getNavigationPage=function(){return this._oInitNavPage};a.prototype.getNavigationItems=function(){return this._oInitNavPage.getContent()[0].getItems()};a.prototype.getCurrentLegendSection=function(){return this._oNavContainer.getCurrentPage()};a.prototype._onNavToLegendSection=function(t){var e=t.getSource().getTitle();this._oNavContainer.setAutoFocus(true);for(var i=0;i<this._aLegendSections.length;i++){if(e==this._aLegendSections[i].getTitle()){this._oNavContainer.to(this._aLegendSections[i])}}};a.prototype._onNavBack=function(t){this._oNavContainer.to(this._oInitNavPage)};return a});
//# sourceMappingURL=LegendContainer.js.map
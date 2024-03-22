/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["jquery.sap.global","sap/ui/core/Control","sap/ui/commons/Panel","sap/ui/core/Title","sap/m/VBox","sap/ui/layout/Splitter","./Tree","./Viewport"],function(jQuery,e,t,r,i,n,a,o){"use strict";var s=e.extend("sap.ui.vtm.Panel",{metadata:{properties:{title:{type:"string"},showViewport:{type:"boolean",defaultValue:true},treeWidth:{type:"sap.ui.core.CSSSize",defaultValue:"50%"},height:{type:"sap.ui.core.CSSSize",defaultValue:"inherit"}},aggregations:{_panel:{type:"sap.m.VBox",multiple:false,visibility:"hidden"},titleControls:{type:"sap.ui.core.Control",multiple:"true"},treeHeaderControls:{type:"sap.ui.core.Control",multiple:"true"},viewportHeaderControls:{type:"sap.ui.core.Control",multiple:"true"}},associations:{vtmId:{type:"sap.ui.vtm.Vtm",multiple:false}},events:{initialized:{},contextMenu:{parameters:{clientX:{type:"int"},clientY:{type:"int"},pageX:{type:"int"},pageY:{type:"int"},screenX:{type:"int"},screenY:{type:"int"},eventData:{type:"object"}},allowPreventDefault:true}}},init:function(){var e=this.getId();var t=this._tree=new sap.ui.vtm.Tree(e+"_tree");var r=this._viewport=new sap.ui.vtm.Viewport(e+"_viewport");var i=this._title=new sap.m.Title({textAlign:sap.ui.core.TextAlign.Begin});var n=this._panelHeader=new sap.m.Bar({contentLeft:[i]});this._treeLayout=new sap.ui.layout.SplitterLayoutData({minSize:10});var a=new sap.ui.layout.SplitPane({content:t,demandPane:false,requiredParentWidth:50,layoutData:this._treeLayout});this._viewportLayout=new sap.ui.layout.SplitterLayoutData({minSize:10});var o=new sap.ui.layout.SplitPane({content:r,demandPane:false,requiredParentWidth:50,layoutData:this._viewportLayout});var s=new sap.ui.layout.PaneContainer({panes:[a,o]});var g=this._splitter=new sap.ui.layout.ResponsiveSplitter({rootPaneContainer:s,defaultPane:a});var l=this._page=new sap.m.Page({content:[g],customHeader:n,layoutData:new sap.m.FlexItemData({minHeight:"100%",maxHeight:"100%"})});var u=function(e){var t;sap.ui.vtm.measure(this,"fireContextMenu",function(){t=this.fireContextMenu({clientX:e.clientX,clientY:e.clientY,pageX:e.pageX,pageY:e.pageY,screenX:e.screenX,screenY:e.screenY,eventData:e})}.bind(this));if(!t){e.preventDefault()}}.bind(this);l.addEventDelegate({oncontextmenu:u},l);var p=new sap.m.VBox({fitContainer:true,renderType:sap.m.FlexRendertype.Bare,items:[l]});this.setAggregation("_panel",p);this.data("notUsed","just a bug workaround");this._oldPanes=[];this._setIsActive(false)},onAfterRendering:function(){if(!this._initialized){this._initialize()}},_initialize:function(){var e=this.getVtm();if(e){e._addPanel(this);this._initialized=true;sap.ui.vtm.measure(this,"fireInitialized",function(){this.fireInitialized()}.bind(this))}},destroy:function(){e.prototype.destroy.apply(this);this._destroyed=true;var t=this.getVtm().getPanels().every(function(e){return e._destroyed===true});if(t){this.getVtm().getScene().destroy()}},onmousedown:function(e){this.getVtm()._setActivePanel(this,false)},onfocusin:function(e){this.getVtm()._setActivePanel(this,false)},onfocusout:function(e){var t=this.getVtm();if(t.getActivePanel()===this){t._setActivePanel(null,false)}},addTreeHeaderControl:function(e){return this.getTree().addHeaderControl(e)},addViewportHeaderControl:function(e){return this.getViewport().addHeaderControl(e)},destroyTreeHeaderControls:function(){return this},destroyViewportHeaderControls:function(){return this},getTreeHeaderControls:function(){return this.getTree().getHeaderControls()},getViewportHeaderControls:function(){return this.getViewport().getHeaderControls()},indexOfTreeHeaderControl:function(e){return this.getTree().indexOfHeaderControl(e)},indexOfViewportHeaderControl:function(e){return this.getViewport().indexOfHeaderControl(e)},insertTreeHeaderControl:function(e,t){return this.getTree().insertHeaderControl(e,t)},insertViewportHeaderControl:function(e,t){return this.getViewport().insertHeaderControl(e,t)},removeAllTreeHeaderControls:function(){return this.getTree().removeAllControls()},removeAllViewportHeaderControls:function(){return this.getViewport().removeAllControls()},removeTreeHeaderControl:function(e){return this.getTree().removeControl(e)},removeViewportHeaderControl:function(e){return this.getViewport().removeControl(e)},_getDelegatedAggregation:function(e){switch(e){case"treeHeaderControls":return{control:this.getTree(),aggregationName:e};case"viewportHeaderControls":return{control:this.getViewport(),aggregationName:e};case"titleControls":return{control:this._panelHeader,name:"contentRight"};default:return null}},addAggregation:function(t,r,i){var n=this._getDelegatedAggregation(t);if(n){return n.control.addAggregation(n.name,r,i)}else{return e.prototype.addAggregation.apply(this,[t,r,i])}},bindAggregation:function(t,r){var i=this._getDelegatedAggregation(t);if(i){return i.control.bindAggregation(i.name)}else{return e.prototype.bindAggregation.apply(this,[t])}},destroyAggregation:function(t,r){var i=this._getDelegatedAggregation(t);if(i){return this}else{return e.prototype.destroyAggregation.apply(this,[t,r])}},getAggregation:function(t,r){var i=this._getDelegatedAggregation(t);if(i){return i.control.getAggregation(i.name,r)}else{return e.prototype.getAggregation.apply(this,[t,r])}},indexOfAggregation:function(t,r){var i=this._getDelegatedAggregation(t);if(i){return i.control.indexOfAggregation(i.name,r)}else{return e.prototype.indexOfAggregation.apply(this,[t,r])}},insertAggregation:function(t,r,i,n){var a=this._getDelegatedAggregation(t);if(a){return a.control.insertAggregation(a.name,r,i,n)}else{return e.prototype.insertAggregation.apply(this,[t,r,i,n])}},removeAggregation:function(t,r,i){var n=this._getDelegatedAggregation(t);if(n){return n.control.removeAggregation(n.name,t,r,i)}else{return e.prototype.removeAggregation.apply(this,[t,r,i])}},removeAllAggregation:function(t,r){var i=this._getDelegatedAggregation(t);if(i){return i.control.removeAllAggregation(i.name,t,r)}else{return e.prototype.removeAllAggregation.apply(this,[t,r])}},setAggregation:function(t,r,i){var n=this._getDelegatedAggregation(t);if(n){return n.control.setAggregation(n.name,r,i)}else{return e.prototype.setAggregation.apply(this,[t,r,i])}},unbindAggregation:function(t,r){var i=this._getDelegatedAggregation(t);if(i){return i.control.unbindAggregation(i.name,r)}else{return e.prototype.unbindAggregation.apply(this,[t,r])}},validateAggregation:function(t,r,i){var n=this._getDelegatedAggregation(t);if(n){return n.control.validateAggregation(n.name,r,i)}else{return e.prototype.validateAggregation.apply(this,[t,r,i])}},_getPanel:function(){return this.getAggregation("_panel")},_getTreeLayoutData:function(){return this._treeLayout},_getViewportLayoutData:function(){return this._viewportLayout},renderer:function(e,t){e.write("<div");e.writeControlData(t);e.addStyle("height",t.getHeight());e.writeStyles();e.writeClasses();e.write(">");var r=t._getPanel();e.renderControl(r);e.write("</div>")},setTitle:function(e){this._title.setText(e);this.setProperty("title",e);return this},getTree:function(){return this._tree},getViewport:function(){return this._viewport},setShowViewport:function(e){if(e===this.getShowViewport()){return this}var t=this.getTreeWidth();this.setProperty("showViewport",e);var r=this._splitter.getDefaultPane();var i=this._splitter.getRootPaneContainer();var n=i.getPanes();if(!e){this._oldTreeWidth=t;n.forEach(function(e){if(e.getId()!==r){i.removePane(e);this._oldPanes.push(e)}}.bind(this));this.setTreeWidth("auto")}else{this._oldPanes.forEach(function(e){i.addPane(e)});this._oldPanes=[];this.setTreeWidth(this._oldTreeWidth);this._oldTreeWidth=null}return this},getVtm:function(){if(!this._vtm){this._vtm=sap.ui.getCore().byId(this.getVtmId())}return this._vtm},_setIsActive:function(e){var t=this._isActive;if(t!==e){this._isActive=e;var r=this._getPanel();if(e){r.addStyleClass("sapUiVtmPanel_ActiveBorder");r.removeStyleClass("sapUiVtmPanel_InactiveBorder")}else{r.addStyleClass("sapUiVtmPanel_InactiveBorder");r.removeStyleClass("sapUiVtmPanel_ActiveBorder")}}return this},getIsActive:function(){return this._isActive},getTreeWidth:function(){if(!this.getShowViewport()){return"100%"}var e=this._getTreeLayoutData();var t=e.getSize();if(t==="auto"){return"50%"}return t},setTreeWidth:function(e){if(!e){return this}if(e==="auto"){e=this.getShowViewport()?"50%":"100%"}var t=e.indexOf("%")>-1;var r=this._getTreeLayoutData();var i=this._getViewportLayoutData();if(e.indexOf("px")>-1||t){var n=parseInt(e,10);if(n<0){jQuery.sap.log.error("Negative treeWidth values are not permitted",null,"sap.ui.vtm.Panel");return this}if(t&&n>100){e="100%"}}else{var a="Illegal treeWidth value: "+e;jQuery.sap.log.error(a,null,"sap.ui.vtm.Panel");return this}r.setSize(e);i.setSize("auto");return this}});return s});
//# sourceMappingURL=Panel.js.map
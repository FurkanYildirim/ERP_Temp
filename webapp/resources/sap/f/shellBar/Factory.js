/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/Title","sap/m/Image","sap/m/MenuButton","sap/m/OverflowToolbar","sap/m/OverflowToolbarButton","sap/m/ToolbarSpacer","sap/m/OverflowToolbarLayoutData","sap/m/FlexItemData","./CoPilot","./Accessibility","sap/m/library","sap/ui/core/library","sap/m/HBox"],function(o,t,e,i,n,s,r,a,l,p,c,h,u){"use strict";var C=c.OverflowToolbarPriority;var _=c.ToolbarDesign;var d=c.ButtonType;var f=h.TitleLevel;var y=function(o){this._oContext=o;this._oControls={};this._oAcc=new p};y.prototype.getOverflowToolbar=function(){var o=this._oAcc;if(!this._oControls.oOverflowToolbar){this._oControls.oOverflowToolbar=new i({design:_.Transparent,style:"Clear"}).addStyleClass("sapFShellBarOTB").setLayoutData(new a({growFactor:1,shrinkFactor:1,minWidth:"0px",maxWidth:"100%"}))._setEnableAccessibilty(false);this._oControls.oOverflowToolbar._getOverflowButton().addStyleClass("sapFShellBarItem sapFShellBarOverflowButton")}this._oControls.oOverflowToolbar._getOverflowButton()._updateBadgeInvisibleText=function(t){this._getBadgeInvisibleText().setText(t+o.getEntityTooltip("NOTIFICATIONS"))};return this._oControls.oOverflowToolbar};y.prototype.getAdditionalBox=function(){if(!this._oControls.oAdditionalBox){this._oControls.oAdditionalBox=new u({alignItems:"Center"}).addStyleClass("sapFShellBarOAHB")}return this._oControls.oAdditionalBox};y.prototype.getToolbarSpacer=function(){if(!this._oControls.oToolbarSpacer){this._oControls.oToolbarSpacer=new s}return this._oControls.oToolbarSpacer};y.prototype.getSecondTitle=function(){if(!this._oControls.oSecondTitle){this._oControls.oSecondTitle=new o({titleStyle:f.H6}).addStyleClass("sapFShellBarSecondTitle").setLayoutData(new a({shrinkFactor:2,minWidth:"1px"}))}return this._oControls.oSecondTitle};y.prototype.getHomeIcon=function(){if(!this._oControls.oHomeIcon){this._oControls.oHomeIcon=new t({densityAware:false,tooltip:this._oAcc.getEntityTooltip("LOGO"),press:function(){this._oContext.fireEvent("homeIconPressed",{icon:this._oControls.oHomeIcon})}.bind(this)}).addStyleClass("sapFShellBarHomeIcon")}return this._oControls.oHomeIcon};y.prototype.getMegaMenu=function(){if(!this._oControls.oMegaMenu){this._oControls.oMegaMenu=new e({type:d.Transparent,iconDensityAware:false,layoutData:new a({shrinkFactor:0,minWidth:"0px",maxWidth:"100%"})}).addStyleClass("sapFSHMegaMenu")}return this._oControls.oMegaMenu};y.prototype.getPrimaryTitle=function(){if(!this._oControls.oPrimaryTitle){this._oControls.oPrimaryTitle=new o({titleStyle:f.H6,level:f.H1}).setLayoutData(new a({shrinkFactor:0,minWidth:"0px",maxWidth:"100%"})).addStyleClass("sapFShellBarPrimaryTitle")}return this._oControls.oPrimaryTitle};y.prototype.getCopilot=function(){if(!this._oControls.oCopilot){this._oControls.oCopilot=new l({tooltip:this._oAcc.getEntityTooltip("COPILOT"),press:function(){this._oContext.fireEvent("copilotPressed",{image:this._oControls.oCopilot})}.bind(this)})}return this._oControls.oCopilot};y.prototype.getSearch=function(){if(!this._oControls.oSearch){this._oControls.oSearch=new n({text:"Search",icon:"sap-icon://search",type:d.Transparent,tooltip:this._oAcc.getEntityTooltip("SEARCH"),press:function(){this._oContext.fireEvent("searchButtonPressed",{button:this._oControls.oSearch})}.bind(this)}).setLayoutData(new r({priority:C.Low}))}return this._oControls.oSearch};y.prototype.getManagedSearch=function(){if(!this._oControls.oManagedSearch){this._oControls.oManagedSearch=this._oContext.getSearchManager()._oSearch}return this._oControls.oManagedSearch};y.prototype.getNavButton=function(){if(!this._oControls.oNavButton){this._oControls.oNavButton=new n({icon:"sap-icon://nav-back",type:d.Transparent,tooltip:this._oAcc.getEntityTooltip("BACK"),press:function(){this._oContext.fireEvent("navButtonPressed",{button:this._oControls.oNavButton})}.bind(this)})}return this._oControls.oNavButton};y.prototype.getMenuButton=function(){if(!this._oControls.oMenuButton){this._oControls.oMenuButton=new n({ariaHasPopup:p.AriaHasPopup.MENU,icon:"sap-icon://menu2",type:d.Transparent,tooltip:this._oAcc.getEntityTooltip("MENU"),press:function(){this._oContext.fireEvent("menuButtonPressed",{button:this._oControls.oMenuButton})}.bind(this)})}return this._oControls.oMenuButton};y.prototype.getNotifications=function(){var o=this._oAcc;if(!this._oControls.oNotifications){this._oControls.oNotifications=new n({ariaHasPopup:p.AriaHasPopup.NOTIFICATIONS,text:"Notifications",icon:"sap-icon://bell",type:d.Transparent,tooltip:o.getEntityTooltip("NOTIFICATIONS"),press:function(){this._oContext.fireEvent("notificationsPressed",{button:this._oControls.oNotifications})}.bind(this)}).addStyleClass("sapFButtonNotifications").setLayoutData(new r({priority:C.Low}));this._oControls.oNotifications._updateBadgeInvisibleText=function(t){this._getBadgeInvisibleText().setText(t+o.getEntityTooltip("NOTIFICATIONS"))}}return this._oControls.oNotifications};y.prototype.getProductSwitcher=function(){if(!this._oControls.oProductSwitcher){this._oControls.oProductSwitcher=new n({ariaHasPopup:p.AriaHasPopup.PRODUCTS,text:"My products",icon:"sap-icon://grid",type:d.Transparent,tooltip:this._oAcc.getEntityTooltip("PRODUCTS"),press:function(){this._oContext.fireEvent("productSwitcherPressed",{button:this._oControls.oProductSwitcher})}.bind(this)}).addStyleClass("sapFShellBarGridButton").addStyleClass("sapFShellBarItem")}return this._oControls.oProductSwitcher};y.prototype.destroy=function(){Object.keys(this._oControls).forEach(function(o){var t=this._oControls[o];if(t){t.destroy()}}.bind(this))};return y});
//# sourceMappingURL=Factory.js.map
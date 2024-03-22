// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/m/Text","sap/ui/base/ManagedObject","sap/ui/core/Control","sap/ui/core/Core","sap/ui/core/Icon","sap/ui/thirdparty/jquery","sap/ushell/library","sap/ushell/resources","sap/ushell/ui/launchpad/AccessibilityCustomData","./TileRenderer"],function(e,t,i,o,s,n,jQuery,a,l,r,c){"use strict";var u=o.extend("sap.ushell.ui.launchpad.Tile",{metadata:{library:"sap.ushell",properties:{long:{type:"boolean",group:"Misc",defaultValue:false},uuid:{type:"string",group:"Misc",defaultValue:null},tileCatalogId:{type:"string",group:"Misc",defaultValue:null},tileCatalogIdStable:{type:"string",group:"Misc",defaultValue:null},isCustomTile:{type:"boolean",group:"Misc",defaultValue:false},target:{type:"string",group:"Misc",defaultValue:null},debugInfo:{type:"string",group:"Misc",defaultValue:null},rgba:{type:"string",group:"Misc",defaultValue:null},animationRendered:{type:"boolean",group:"Misc",defaultValue:false},isLocked:{type:"boolean",group:"Misc",defaultValue:false},showActionsIcon:{type:"boolean",group:"Misc",defaultValue:false},tileActionModeActive:{type:"boolean",group:"Misc",defaultValue:false},ieHtml5DnD:{type:"boolean",group:"Misc",defaultValue:false},navigationMode:{type:"string",group:"Misc",defaultValue:null},isDraggedInTabBarToSourceGroup:{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{tileViews:{type:"sap.ui.core.Control",multiple:true,singularName:"tileView"},pinButton:{type:"sap.ui.core.Control",multiple:true,singularName:"pinButton"}},events:{press:{},coverDivPress:{},afterRendering:{},showActions:{},deletePress:{}}},renderer:c});u.prototype.init=function(){this.addDelegate({onsapenter:this._launchTileViaKeyboard,onsapspace:this._launchTileViaKeyboard},this)};u.prototype.exit=function(){if(this.actionSheetIcon){this.actionSheetIcon.destroy()}if(this.actionIcon){this.actionIcon.destroy()}if(this.failedToLoadViewText){this.failedToLoadViewText.destroy()}};u.prototype.getFailedtoLoadViewText=function(){if(!this.failedToLoadViewText){this.failedToLoadViewText=new t({text:l.i18n.getText("Tile.failedToLoadView")})}return this.failedToLoadViewText};u.prototype.getActionSheetIcon=function(){if(!this.getTileActionModeActive()){return undefined}if(!this.actionSheetIcon){this.actionSheetIcon=new n({src:"sap-icon://overflow",tooltip:l.i18n.getText("configuration.category.tile_actions")}).addStyleClass("sapUshellTileActionIconDivBottomInner")}return this.actionSheetIcon};u.prototype.ontap=function(){e.info("Tile clicked:",this.getDebugInfo(),"sap.ushell.ui.launchpad.Tile");this.firePress()};u.prototype.destroy=function(e){this.destroyTileViews();o.prototype.destroy.call(this,e)};u.prototype.addTileView=function(e,t){e.setParent(null);i.prototype.addAggregation.call(this,"tileViews",e,t)};u.prototype.destroyTileViews=function(){if(this.mAggregations.tileViews){this.mAggregations.tileViews.length=0}};u.prototype.onBeforeRendering=function(){var e=this.getDomRef();if(e){var t=e.querySelector("a.sapUshellTileInner");if(t){t.onclick=null}if(document.activeElement===e){this.bFocused=true}this.sTabIndex=e.getAttribute("tabindex");if(this.sTabIndex){e.removeAttribute("tabindex")}}};u.prototype.onAfterRendering=function(){if(this.getIsDraggedInTabBarToSourceGroup()){var e=this.getParent();e.removeAggregation("tiles",this,false)}var t=this.getDomRef();if(t){if(this.sTabIndex){t.setAttribute("tabindex",this.sTabIndex);delete this.sTabIndex}if(this.bFocused){t.focus();delete this.bFocused}}this._redrawRGBA();this._disableInnerLink();this.fireAfterRendering()};u.prototype._disableInnerLink=function(){var e=this.getDomRef();var t=e.querySelector("a.sapUshellTileInner");if(t){t.onclick=function(e){e.preventDefault()}}};u.prototype._launchTileViaKeyboard=function(e){if(this.getTileActionModeActive()){this.fireCoverDivPress({id:this.getId()})}else{this._announceLoadingApplication();if(e.target.tagName!=="BUTTON"){var t=this.getTileViews()[0],i=false,o,s;if(t.firePress){t.firePress({id:this.getId()})}else if(t.getComponentInstance){o=t.getComponentInstance();if(o._oController&&o._oController.oView.getContent()){s=o._oController.oView.getContent()[0];if(s&&s.firePress){s.firePress({id:this.getId()})}}}else{while(t.getContent&&!i){t=t.getContent()[0];if(t.firePress){t.firePress({id:this.getId()});i=true}}}}}};u.prototype.onfocusin=function(){var t=this.getDomRef();if(!t.classList.contains("sapUshellPlusTile")){var i=this.$().prevUntil("h3"),o;if(i.length>0){o=i[i.length-1].previousSibling}else{o=t.previousSibling}var s=t.querySelector(".sapUshellTileInner");if(s&&s.children&&s.children[0]){var n=[];if(o){n.push("sapUshellCatalogAccessibilityTileText")}else{n.push("sapUshellDashboardAccessibilityTileText")}var a=this.getNavigationMode();if(a){var r=l.i18n.getText(a+"NavigationMode");if(r){var c=this.getId()+"-navigationMode";if(!document.getElementById(c)){var u=document.createElement("div");u.setAttribute("id",c);u.style.display="none";u.innerText=r;s.appendChild(u)}n.push(c)}else{e.warning("The navigation mode is of a unkown mode, it can not be read!")}}n.push(s.children[0].getAttribute("id"));var d=t.querySelector(".sapUshellTileDeleteClickArea .sapUiIcon");if(d){n.push(d.id)}if(o){n.push(o.getAttribute("id"))}if(this.getTileActionModeActive()){n.push("sapUshellDashboardAccessibilityTileEditModeText")}t.setAttribute("aria-labelledby",n.join(" "))}}};u.prototype.onclick=function(e){if(this.getTileActionModeActive()){var t=e.originalEvent.srcElement;if(jQuery(t).closest(".sapUshellTileDeleteClickArea").length>0){this.fireDeletePress()}else{this.fireCoverDivPress({id:this.getId()})}}else{this._announceLoadingApplication()}};u.prototype._announceLoadingApplication=function(){var e=document.getElementById("sapUshellLoadingAccessibilityHelper-appInfo"),t=l.i18n.getText("screenReaderNavigationLoading");if(e){e.setAttribute("role","alert");e.innerText=t;setTimeout(function(){e.removeAttribute("role");e.innerText=""},0)}};u.prototype._initDeleteAction=function(){var e=this;if(!this.deleteIcon){this.deleteIcon=new n({src:"sap-icon://decline",tooltip:l.i18n.getText("removeButtonTitle")});this.deleteIcon.addEventDelegate({onclick:function(t){e.fireDeletePress();t.stopPropagation()}});this.deleteIcon.addStyleClass("sapUshellTileDeleteIconInnerClass");this.deleteIcon.addCustomData(new r({key:"aria-label",value:l.i18n.getText("removeButtonLabel"),writeToDom:true}))}return this.deleteIcon};u.prototype.setShowActionsIcon=function(e){if(e){if(!this.actionIcon){this.actionIcon=new n({size:"1rem",src:"sap-icon://overflow",press:function(){this.fireShowActions();this.addStyleClass("showTileActionsIcon");var e=s.getEventBus(),t=function(i,o,s){s.removeStyleClass("showTileActionsIcon");e.unsubscribe("dashboard","actionSheetClose",t)};e.subscribe("dashboard","actionSheetClose",t)}.bind(this)}).addStyleClass("sapUshellTileActionsIconClass")}}this.setProperty("showActionsIcon",e)};u.prototype.setIsDraggedInTabBarToSourceGroup=function(e){this.setProperty("isDraggedInTabBarToSourceGroup",e);this.setVisible(!e)};u.prototype.setRgba=function(e){this.setProperty("rgba",e);this._redrawRGBA()};u.prototype._redrawRGBA=function(){var e=this.getRgba(),t=this.$();if(e&&t){var i=this.getModel();t.css("background-color",e);t.unbind("mouseenter mouseleave");var o,s=t.css("border").split("px")[0];if(s>0){o=t.css("border-color")}else{o=e}t.hover(function(){if(i&&!i.getProperty("/tileActionModeActive")){var e=t.css("box-shadow"),s=e?e.split(") ")[1]:null;if(s){t.css("box-shadow",s+" "+o)}}},function(){t.css("box-shadow","")})}};return u});
//# sourceMappingURL=Tile.js.map
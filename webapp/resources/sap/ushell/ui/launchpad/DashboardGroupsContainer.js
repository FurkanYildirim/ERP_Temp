// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/base/ManagedObject","sap/ui/core/Control","sap/ui/core/Core","sap/ui/core/InvisibleText","sap/ushell/Config","sap/ushell/library","sap/ushell/override","sap/ushell/resources","sap/ushell/utils","./DashboardGroupsContainerRenderer"],function(e,t,r,i,o,s,a,n,l,p){"use strict";var u=t.extend("sap.ushell.ui.launchpad.DashboardGroupsContainer",{metadata:{library:"sap.ushell",properties:{accessibilityLabel:{type:"string",defaultValue:null},displayMode:{type:"string",defaultValue:null}},aggregations:{groups:{type:"sap.ui.core.Control",multiple:true,singularName:"group"}},events:{afterRendering:{}}},renderer:p});u.prototype.init=function(){this.addInvisibleAccessabilityTexts()};u.prototype.exit=function(){if(this.oTileText){this.oTileText.destroy()}if(this.oTileEditModeText){this.oTileEditModeText.destroy()}t.prototype.exit.apply(this,arguments)};u.prototype.updateGroups=a.updateAggregatesFactory("groups");u.prototype.onAfterRendering=function(){var e=this,t={bUseUniqueMark:true};l.setPerformanceMark("FLP-TimeToInteractive_tilesLoaded",t);e.fireAfterRendering()};u.prototype.getGroupControlByGroupId=function(e){try{var t=this.getGroups();for(var r=0,i=t.length;r<i;++r){if(t[r].getGroupId()===e){return t[r]}}}catch(e){}return null};u.prototype.addLinksToUnselectedGroups=function(){var t=this.getGroups();t.forEach(function(t,r){if(!t.getIsGroupSelected()){e.prototype.updateAggregation.call(t,"links")}})};u.prototype.removeLinksFromAllGroups=function(){var e=this.getGroups();e.forEach(function(e,t){var r=e.getLinks();if(r.length){if(r[0].getMetadata().getName()==="sap.m.GenericTile"){e.removeAllLinks()}else{for(var i=0;i<r.length;i++){r[i].destroy()}}}})};u.prototype.removeLinksFromUnselectedGroups=function(){var e=this.getGroups();e.forEach(function(e,t){var r=e.getLinks();if(r.length&&!e.getIsGroupSelected()){if(r[0].getMetadata().getName()==="sap.m.GenericTile"){e.removeAllLinks()}else{for(var i=0;i<r.length;i++){r[i].destroy()}}}})};u.prototype.addInvisibleAccessabilityTexts=function(){this.oTileText=new i("sapUshellDashboardAccessibilityTileText",{text:n.i18n.getText("tile")}).toStatic();var e=r.getLibraryResourceBundle("sap.m");if(e){this.oTileEditModeText=new i("sapUshellDashboardAccessibilityTileEditModeText",{text:e.getText("LIST_ITEM_NAVIGATION")}).toStatic()}};return u});
//# sourceMappingURL=DashboardGroupsContainer.js.map
/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ovp/cards/generic/Card.controller","sap/ui/thirdparty/jquery","sap/ovp/cards/OVPCardAsAPIUtils","sap/ovp/cards/CommonUtils","sap/ovp/app/OVPUtils","sap/ovp/app/OVPLogger","sap/ui/core/Core","sap/ovp/cards/Integration/IntegrationCard","sap/m/MessageBox","sap/ovp/app/resources","sap/ovp/cards/NavigationHelper","sap/ovp/cards/ViewCacheHelper"],function(e,jQuery,t,a,i,o,n,s,r,d,g,h){"use strict";var p=new o("ovp.cards.generic.base.table.BaseTable");return e.extend("sap.ovp.cards.generic.base.table",{bdataLoadedToEnableAddToInsight:false,onInit:function(){e.prototype.onInit.apply(this,arguments)},onColumnListItemPress:function(e){var o=i.bCRTLPressed?i.constants.explace:i.constants.inplace;i.bCRTLPressed=false;if(t.checkIfAPIIsUsed(this)){if(this.checkAPINavigation()){a.onContentClicked(e)}}else{var n=g.getEntityNavigationEntries(e.getSource().getBindingContext(),this.getModel(),this.getEntityType(),this.getCardPropertiesModel(),this.getCardPropertiesModel().getProperty("/annotationPath"));this.doNavigation(e.getSource().getBindingContext(),n[0],o)}},onContactDetailsLinkPress:function(e){if(this.oPopover){this.oPopover.setVisible(false)}var t,a;t=e.getSource();this.oPopover=t.getParent().getAggregation("items")[0];a=t.getBindingContext();if(!a){return}this.oPopover.bindElement(a.getPath());this.oPopover.setVisible(true);this.oPopover.openBy(t)},getCardItemsBinding:function(){var e=this.getView().byId("ovpTable");return e.getBinding("items")},onAfterRendering:function(){e.prototype.onAfterRendering.apply(this,arguments);var a=this.getOwnerComponent().getComponentData();var i=this.getCardPropertiesModel();if(!t.checkIfAPIIsUsed(this)&&i.getProperty("/layoutDetail")==="resizable"){var o=this.oDashboardLayoutUtil.dashboardLayoutModel.getCardById(a.cardId);var n=Math.max(o.dashboardLayout.headerHeight,this.getHeaderHeight());var s=this.oDashboardLayoutUtil.getCardDomId(a.cardId);var r=document.getElementById(s);if(!o.dashboardLayout.autoSpan){r.getElementsByClassName("sapOvpWrapper")[0].style.height=o.dashboardLayout.rowSpan*this.oDashboardLayoutUtil.ROW_HEIGHT_PX+1-(n+2*this.oDashboardLayoutUtil.CARD_BORDER_PX)+"px"}if(o.dashboardLayout.showOnlyHeader){r.classList.add("sapOvpMinHeightContainer")}this.addColumnInTable(jQuery(r),{colSpan:o.dashboardLayout.colSpan})}else{var d=this.getView().byId("ovpTable");var g=d.getAggregation("columns");for(var h=0;h<3;h++){if(g[h]){g[h].setStyleClass("sapTableColumnShow").setVisible(true)}}}var p=this.getCardItemsBinding();if(p&&p.getPath()){p.attachDataReceived(this.onDataReceived.bind(this))}},onDataReceived:function(){this.bdataLoadedToEnableAddToInsight=true},getCardItemBindingInfo:function(){var e=this.getView().byId("ovpTable");return e.getBindingInfo("items")},addColumnInTable:function(e,t){if(t.colSpan>=1){if(jQuery(e).find("tr").length!=0){var a=n.byId(jQuery(e).find(".sapMList").attr("id"));var i=a.getAggregation("columns");var o=t.colSpan;var s=o+1;for(var r=0;r<6;r++){if(i[r]){if(r<=s){i[r].setStyleClass("sapTableColumnShow").setVisible(true)}else{i[r].setStyleClass("sapTableColumnHide").setVisible(false)}}}}}},resizeCard:function(e,t){var a,i,o,i;try{var n=document.getElementById(this.oDashboardLayoutUtil.getCardDomId(this.cardId)),s=this.getCardItemBindingInfo(),r=this.getHeaderHeight(),d=this.getView(),g=d.byId("ovpCardContentContainer").getDomRef();if(e.showOnlyHeader){g.classList.add("sapOvpContentHidden");a=0}else{g.classList.remove("sapOvpContentHidden");o=r+t.dropDownHeight;i=e.rowSpan*e.iRowHeightPx-o-t.itemHeight;a=Math.abs(Math.floor(i/t.itemHeight));n.style.height=e.rowSpan*e.iRowHeightPx+"px"}g.style.height=e.rowSpan*e.iRowHeightPx-(r+2*e.iCardBorderPx)+"px";this.addColumnInTable(d.getDomRef(),e);if(a!==s.length){s.length=a;e.noOfItems=s.length;this.getCardItemsBinding().refresh();var l=this.getCardPropertiesModel().getProperty("/tabs");if(l&&l.length>0){h.clearViewCacheForTabbedCard(d)}}else{this._handleCountHeader()}}catch(e){p.warning("OVP resize: "+this.cardId+" catch "+e.toString())}},onExit:function(){e.prototype.onExit.apply(this,arguments)},onShowInsightCardPreview:function(){var e=this.getView();var t=e.getController();var a=t.oCardComponentData;var i=this;if(this.checkIBNNavigationExistsForCard()){s.showCard({entitySet:t.entitySet,entityType:t.entityType,cardComponentName:"Table",cardComponentData:a,cardComponent:t.oCardComponent,itemBindingInfo:i.getCardItemBindingInfo(),view:e}).then(function(e){i.saveGeneratedCardManifest(e)})}else{r.error(d.getText("INT_IBN_NAVIGATION_NOT_FOUND_ERROR_MESSAGE_TEXT"))}}})});
//# sourceMappingURL=BaseTable.controller.js.map
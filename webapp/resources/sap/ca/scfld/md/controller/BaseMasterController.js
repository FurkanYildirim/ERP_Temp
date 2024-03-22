/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ui.core.mvc.Controller");jQuery.sap.require("sap.ca.scfld.md.app.CommonHeaderFooterHelper");sap.ui.core.mvc.Controller.extend("sap.ca.scfld.md.controller.BaseMasterController",{constructor:function(){var t=jQuery.proxy(function(){var t=true;this.oRouter=sap.ui.core.UIComponent.getRouterFor(this);this.oApplicationImplementation=sap.ca.scfld.md.app.Application.getImpl();this.oApplicationFacade=this.oApplicationImplementation.oConfiguration.oApplicationFacade;this.oConnectionManager=this.oApplicationImplementation.getConnectionManager();this.iRequestCountStart=this.oConnectionManager.iRequestCount;this.oApplicationImplementation.setModels(this);this.oRouter.attachRoutePatternMatched(function(e){var i=e.getParameter("name");var n;var o=t;t=false;this._bIsDetailRoute=false;this._bIsMasterRoute=false;if(i==="detail"){this._bIsDetailRoute=true;var s=this.resolveHash(e);n=s===undefined?"/"+e.getParameter("arguments").contextPath:s;if(!o&&this._hashParam!==n){this._hashParam=n;this._selectDetail()}}if(i==="master"){this._bIsMasterRoute=true}this._hashParam=n},this)},this);var e=jQuery.proxy(this.onInit,this);this.onInit=jQuery.proxy(function(){t();e();if(!this.bIsMasterListBindingExists){var i=this.getList();if(i){var n=i.getBinding("items");this.oApplicationImplementation.setMasterListBinding(this,n)}}if(this.iRequestCountStart==this.oConnectionManager.iRequestCount){this.oApplicationImplementation.oMHFHelper.defineMasterHeaderFooter(this)}},this)},onInit:function(){},getPage:function(){return sap.ca.scfld.md.app.CommonHeaderFooterHelper.getPageFromController(this)},resolveHash:function(t){return},_onMasterListLoaded:function(t){this.onDataLoaded();this.oApplicationImplementation.onMasterRefreshed(this);t.oSource.detachChange(this._onMasterListLoaded,this)},_onMasterListChanged:function(t){this.oApplicationImplementation.onMasterChanged(this)},getHeaderFooterOptions:function(){return null},setBtnEnabled:function(t,e){if(this._oControlStore.oButtonListHelper){this._oControlStore.oButtonListHelper.setBtnEnabled(t,e)}},setBtnText:function(t,e){if(this._oControlStore.oButtonListHelper){this._oControlStore.oButtonListHelper.setBtnText(t,e)}},refreshHeaderFooterForEditToggle:function(){this.oApplicationImplementation.oMHFHelper.defineMasterHeaderFooterInner(this)},_handleSelect:function(t){this.setListItem(t.getParameter("listItem"));if(!sap.ui.Device.system.phone){this.oApplicationImplementation.oSplitContainer.hideMaster()}},_handleItemPress:function(t){this.setListItem(t.getSource())},getList:function(){return this.byId("list")},setListItem:function(t){var e=this.getList();e.removeSelections();t.setSelected(true);e.setSelectedItem(t,true);this.oRouter.navTo("detail",{contextPath:t.getBindingContext(this.sModelName).getPath().substr(1)},!sap.ui.Device.system.phone)},onDataLoaded:function(){this._selectDetail()},_selectDetail:function(){var t=this.getList();var e=t.getItems();if(!(this._bIsDetailRoute||this._bIsMasterRoute)){return}if(e.length===0&&this.oRouter._oRoutes.noData!==undefined){this.navToEmptyView();return}if(!sap.ui.Device.system.phone&&this._bIsMasterRoute&&!t.getSelectedItem()){if(t.getBindingInfo("items").binding.isGrouped()){if(e.length>1){this.setListItem(e[1])}else{jQuery.sap.log.error("Selection of the first list item failed as there is only 1 item in a grouped list")}}else{this.setListItem(e[0])}}if(this._bIsDetailRoute){for(var i=0;i<e.length;i++){if(e[i]instanceof sap.m.GroupHeaderListItem){continue}if(e[i].getBindingContext(this.sModelName).getPath()!=this._hashParam){continue}if(!sap.ui.Device.system.phone){t.removeSelections();e[i].setSelected(true)}return}if(this.isBackendSearch()){this.applyFilterFromContext(this._hashParam)}else{this.navToEmptyView()}}},navToEmptyView:function(){this.showEmptyView()},showEmptyView:function(t,e,i){var n=this.getList();n.removeSelections();var o=this.oRouter.getView(this.getNoDataViewName(),sap.ui.core.mvc.ViewType.XML);var s=this.getSplitContainer();s.addDetailPage(o);if(t===undefined){t=this.oApplicationImplementation.oConfiguration.getDetailTitleKey()}if(i===undefined){if(e===undefined){e=this.oApplicationImplementation.oConfiguration.getDefaultEmptyMessageKey()}}s.to(o.getId(),"show",{viewTitle:t,languageKey:e,infoText:i});return this},getSplitContainer:function(){return this.getView().getParent().getParent()},getNoDataViewName:function(){return"sap.ca.scfld.md.view.empty"},applySearchPattern:function(t){t=t.toLowerCase();var e=this.getList().getItems();var i;var n=0;var o=null;var s=0;for(var a=0;a<e.length;a++){if(e[a]instanceof sap.m.GroupHeaderListItem){if(o){if(s==0){o.setVisible(false)}else{o.setCount(s)}}o=e[a];s=0}else{i=this.applySearchPatternToListItem(e[a],t);e[a].setVisible(i);if(i){n++;s++}}}return n},applyBackendSearchPattern:function(t,e){},applyFilterFromContext:function(t){this.navToEmptyView()},applySearchPatternToListItem:function(t,e){if(e==""){return true}var i=t.getBindingContext(this.sModelName).getProperty();for(var n in i){var o=i[n];if(typeof o=="string"){if(o.toLowerCase().indexOf(e)!=-1){return true}}}if(t.getIntro()&&t.getIntro().toLowerCase().indexOf(e)!=-1||t.getTitle()&&t.getTitle().toLowerCase().indexOf(e)!=-1||t.getNumber()&&t.getNumber().toLowerCase().indexOf(e)!=-1||t.getNumberUnit()&&t.getNumberUnit().toLowerCase().indexOf(e)!=-1||t.getFirstStatus()&&t.getFirstStatus().getText().toLowerCase().indexOf(e)!=-1||t.getSecondStatus()&&t.getSecondStatus().getText().toLowerCase().indexOf(e)!=-1){return true}var s=t.getAttributes();for(var a=0;a<s.length;a++){if(s[a].getText().toLowerCase().indexOf(e)!=-1){return true}}return false},_applyClientSideSearch:function(){var t=this._oControlStore.oMasterSearchField.getValue();var e=this.applySearchPattern(t);this.oApplicationImplementation.oMHFHelper.setMasterTitle(this,e)},isLiveSearch:function(){return!this.isBackendSearch()},isBackendSearch:function(){return false},registerMasterListBind:function(t){if(t){var e=t.getBinding("items");this.oApplicationImplementation.setMasterListBinding(this,e)}if(this.iRequestCountStart==this.oConnectionManager.iRequestCount){this.oApplicationImplementation.oMHFHelper.defineMasterHeaderFooter(this)}}});
//# sourceMappingURL=BaseMasterController.js.map
/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.scfld.md.app.ApplicationImplementation");jQuery.sap.require("sap.ca.scfld.md.app.ConnectionManager");jQuery.sap.require("sap.ca.scfld.md.app.MasterHeaderFooterHelper");jQuery.sap.require("sap.ca.scfld.md.app.DetailHeaderFooterHelper");jQuery.sap.require("sap.ca.scfld.md.app.FullScreenHeaderFooterHelper");sap.ui.base.ManagedObject.extend("sap.ca.scfld.md.app.ApplicationImplementation",{metadata:{properties:{identity:"string",component:"object",oViewHook:"string"},methods:["getConnectionManager"]},init:function(){},sI18N:"i18n",startApplication:function(e){this.bManualMasterRefresh=false;this.oConfiguration=e;this.oMHFHelper=new sap.ca.scfld.md.app.MasterHeaderFooterHelper(this);this.oDHFHelper=new sap.ca.scfld.md.app.DetailHeaderFooterHelper(this);this.oFHFHelper=new sap.ca.scfld.md.app.FullScreenHeaderFooterHelper(this);this.aMasterKeys=e.getMasterKeyAttributes();this.aKeyValues=null;this.mApplicationModels={};var t=this.getIdentity()+".i18n.i18n";this.AppI18nModel=new sap.ui.model.resource.ResourceModel({bundleName:t});var i=this.getComponent();if(!sap.ui.getCore().getConfiguration().getDisableCustomizing()){var o=i.getMetadata();if(o){var r=o.getConfig("sap.ca.i18Nconfigs");if(r.bundleName){this.AppI18nModel.enhance(r)}}}this.UilibI18nModel=new sap.ui.model.resource.ResourceModel({bundleName:"sap.ca.scfld.md.i18n.i18n"});this.oConnectionManager=sap.ca.scfld.md.app.ConnectionManager.getNewInstance(this.getIdentity(),this.oConfiguration,{},this.getComponent());this.bIsPhone=sap.ui.Device.system.phone;this.bIsIPad=sap.ui.Device.system.tablet;var n=sap.ui.getCore().byId(this.getOViewHook());n.setModel(this.AppI18nModel,this.sI18N);this.oCurController={};this.oCurController.MasterCtrl=null;this.oCurController.DetailCtrl=null;this.oCurController.FullCtrl=null;sap.ui.Device.orientation.attachHandler(this.onChangeDeviceOrientation,this);this.registerExitModule(jQuery.proxy(this.onAppExit,this))},onAppExit:function(){sap.ui.Device.orientation.detachHandler(this.onChangeDeviceOrientation,this)},getResourceBundle:function(){return this.AppI18nModel.getResourceBundle()},getUiLibResourceBundle:function(){return this.UilibI18nModel.getResourceBundle()},getODataModel:function(e){if(e==this.sI18N){return this.AppI18nModel}return this.oConnectionManager.getModel(e)},setModels:function(e){var t=e.getView();t.setModel(this.AppI18nModel,this.sI18N);t.setModel(this.getComponent().getModel("device"),"device");jQuery.each(this.oConnectionManager.modelList,function(e,i){if(e=="undefined"){t.setModel(i)}else{t.setModel(i,e)}})},isMock:function(){var e=jQuery.sap.getUriParameters().get("responderOn");return e==="true"},getConnectionManager:function(){return this.oConnectionManager},isDetailNavigationPossible:function(e,t){var i=e.getList();if(i){var o=i.getSelectedItem();if(o===null){return false}if(e.getDetailRouteName===undefined){var r=o.getBindingContext(e.sModelName).getPath().substr(1);if(r.indexOf("/")){r=encodeURIComponent(r)}if(e.oRouter.getURL("detail",{contextPath:r})!==t){return true}}else{if(e.oRouter.getURL(e.getDetailRouteName(),e.getDetailNavigationParameters(o))!==t){return true}}}return false},onMasterRefreshed:function(e){var t=sap.ui.core.routing.HashChanger.getInstance();var i=t.getHash();this.setStoredSelectedItem(e);var o=false;if(this.bManualMasterRefresh===true){o=this.isDetailNavigationPossible(e,i)}this.fireEvent("_scfldOnMasterListRefresh",{bManualRefresh:this.bManualMasterRefresh,bAutoNavigation:o});this.bManualMasterRefresh=false},onMasterChanged:function(e){this.oMHFHelper.defineMasterHeaderFooter(e)},setStoredSelectedItem:function(e){if(!this.aKeyValues||this.bManualMasterRefresh===true){return}var t=e.getList();var i=t.getItems();t.removeSelections();var o=false;for(var r=0;r<i.length&&!o;r++){var n=i[r];if(n instanceof sap.m.GroupHeaderListItem){continue}var s=n.getBindingContext(e.sModelName);o=true;for(var a=0;o&&a<this.aKeyValues.length;a++){o=this.aKeyValues[a]==s.getProperty(this.aMasterKeys[a])}}if(this.bIsPhone||e._oControlStore&&e._oControlStore.bIsSearching){if(o){n.setSelected(true);t.setSelectedItem(n,true)}if(e._oControlStore){e._oControlStore.bIsSearching=false}}else{if(!o){var n=this.getFirstListItem(e)}if(n){e.setListItem(n)}}this.aKeyValues=null},defineDetailHeaderFooter:function(e){this.oDHFHelper.defineDetailHeaderFooter(e)},defineFullscreenHeaderFooter:function(e){this.oFHFHelper.defineHeaderFooter(e)},setSplitContainer:function(e){this.oSplitContainer=e},registerExitModule:function(e){if(!this.aExitModules){this.aExitModules=[];var t=this.getComponent();if(t.exit){var i=jQuery.proxy(t.exit,t)}else{var i=function(){}}t.exit=jQuery.proxy(function(){for(var e=0;e<this.aExitModules.length;e++){this.aExitModules[e]()}i()},this)}this.aExitModules.push(e)},setMasterListBinding:function(e,t){if(e._oMasterListBinding){e._oMasterListBinding.detachChange(e._onMasterListLoaded,e);e._oMasterListBinding.detachChange(e._onMasterListChanged,e)}e._oMasterListBinding=t;if(e._oMasterListBinding){e._oMasterListBinding.attachChange(e._onMasterListLoaded,e);e._oMasterListBinding.attachChange(e._onMasterListChanged,e)}},onChangeDeviceOrientation:function(e){if(this.oCurController.MasterCtrl&&this.oCurController.MasterCtrl._oHeaderFooterOptions){this.oMHFHelper.setHeaderFooter(this.oCurController.MasterCtrl,this.oCurController.MasterCtrl._oHeaderFooterOptions,this.oCurController.MasterCtrl._oControlStore.bAllDisabled,true)}if(this.oCurController.DetailCtrl&&this.oCurController.DetailCtrl._oHeaderFooterOptions){this.oDHFHelper.setHeaderFooter(this.oCurController.DetailCtrl,this.oCurController.DetailCtrl._oHeaderFooterOptions,true)}if(this.oCurController.FullCtrl&&this.oCurController.FullCtrl._oHeaderFooterOptions){this.oFHFHelper.setHeaderFooter(this.oCurController.FullCtrl,this.oCurController.FullCtrl._oHeaderFooterOptions,true)}},setApplicationModel:function(e,t){if(e!=null){if(this.mApplicationModels.hasOwnProperty(e)){jQuery.sap.log.warning("There was already an application model defined for the name "+e+" it will be overwritten")}this.mApplicationModels[e]=t}else{jQuery.sap.log.error("You cannot set an application Model with a 'null' name")}},getApplicationModel:function(e){var t=null;if(this.mApplicationModels.hasOwnProperty(e)){t=this.mApplicationModels[e]}return t},getFirstListItem:function(e){var t=e.getList(),i=t.getItems();for(var o=0;o<i.length;o++){if(!(i[o]instanceof sap.m.GroupHeaderListItem)){return i[o]}}return null}});
//# sourceMappingURL=ApplicationImplementation.js.map
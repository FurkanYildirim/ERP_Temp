/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/m/Button","sap/m/library","sap/m/Popover","sap/ui/Device","sap/ui/core/mvc/Controller","sap/ui/core/mvc/ViewType"],function(t,e,i,o,n,a){"use strict";var s=e.PlacementType;sap.ui.controller("sap.apf.ui.reuse.controller.layout",{onInit:function(){this.oCoreApi=this.getView().getViewData().oCoreApi;this.oUiApi=this.getView().getViewData().uiApi;this.oNavigationHandler=this.getView().getViewData().oNavigationHandler;var t;this.oCoreApi.getApplicationConfigProperties().done(function(e){if(e){t=e.appName}this.applicationTitle=this.oCoreApi.getTextNotHtmlEncoded(t);this.getView().byId("applicationPage").setTitle(this.applicationTitle);this.loadLayout()}.bind(this));var e=this;this.oActionListPopover=new i({id:this.createId("idAnalysisPathMenuPopOver"),showHeader:false,placement:s.Bottom,contentWidth:"165px"});this.oActionListItem=e.oUiApi.getToolbar().addStyleClass("toolbarView");this.oActionListPopover.addContent(this.oActionListItem);this.oSavedPathName=this.getView().byId("analysisPathTitle");if(this.byId("analysisPath")){this.setPathTitle()}},showMenu:function(t){this.oActionListPopover.openBy(t.getSource())},getAnalysisPathTitleText:function(){this.getView.byId("analysisPathTitle")},setPathTitle:function(){var t=this.oCoreApi.getPathName();if(t.length==0){t=this.oCoreApi.getTextNotHtmlEncoded("unsaved")}if(this.oCoreApi.isDirty()){t="*"+t}this.getView().byId("analysisPathTitle").setText(t);this.getView().byId("analysisPathTitle").setTooltip(t)},loadLayout:function(){this.oCoreApi.getSmartFilterBarConfigurationAsPromise().done(function(t){if(o.system.desktop){this.getView().addStyleClass("sapUiSizeCompact");this.getView().byId("deviceFooter").destroy()}if(t===undefined){this.getView().byId("idSplitterLayoutData").setSize("0px")}var e=this.oUiApi.getStepContainer();var i=this.oUiApi.getAnalysisPath();this.getView().byId("applicationPage").setTitle(this.applicationTitle);this.getView().byId("stepContainer").addContent(e);this.getView().byId("analysisDynamicPage").setContent(i);if(this.getView().byId("menuButton")){this.getView().byId("menuButton").setTooltip(this.oCoreApi.getTextNotHtmlEncoded("options"))}this.addOpenInButton()}.bind(this))},onAfterRendering:function(){var e=this;if(!o.system.desktop){var i=new t({text:this.oCoreApi.getTextNotHtmlEncoded("showAnalyticalPath"),press:function(){e.getView().byId("applicationView").showMaster()},type:"Transparent"});this.getView().byId("applicationView").attachAfterMasterClose(function(){if(e.getView().byId("masterFooter")&&e.getView().byId("masterFooter").getContentLeft().length===0){e.getView().byId("masterFooter").addContentLeft(i)}});this.getView().byId("applicationView").attachAfterMasterOpen(function(){if(e.getView().byId("masterFooter")){e.getView().byId("masterFooter").removeContentLeft(i)}});if(this.getView().byId("applicationView").isMasterShown()===false&&this.getView().byId("masterFooter").getContentLeft().length===0){this.addMasterFooterContentLeft(i)}}},hideMaster:function(){if(o.system.phone||o.system.tablet){this.getView().byId("applicationView").hideMaster();if(o.system.phone){this.getView().byId("applicationView").toDetail(this.getView().byId("stepContainer").getId())}}},showMasterFooter:function(t,e,i){if(!o.system.desktop){var n=this;n.getView().byId("analysisPath").showFooter=true;n.getView().byId("analysisPath").enableScrolling=true;n.getView().byId("deviceFooter").addContentLeft(t);n.getView().byId("deviceFooter").addContentLeft(e);n.getView().byId("deviceFooter").addContentLeft(i)}},showMaster:function(){this.getView().byId("applicationView").showMaster()},addMasterFooterContentLeft:function(t){this.getView().byId("masterFooter").addContentLeft(t)},addMasterFooterContentRight:function(t){if(this.getView().byId("masterFooter").getContentRight().length===0){this.getView().byId("masterFooter").insertContentRight(t)}else{this.addMasterFooterContent(t)}},addMasterFooterContent:function(e){var o=this;if(this.oActionListPopover===undefined){this.oActionListPopover=new i({showHeader:false,placement:s.Top})}if(typeof e.getWidth==="function"){e.setWidth("100%")}if(this.footerContentButton===undefined){this.getView().byId("masterFooter").getContentRight()[0].setWidth("71%");this.footerContentButton=new t({icon:"sap-icon://overflow",press:function(t){o.oActionListPopover.openBy(t.getSource())},type:"Transparent",tooltip:this.oCoreApi.getTextNotHtmlEncoded("moreIcon")})}this.oActionListPopover.addContent(e);this.getView().byId("masterFooter").insertContentRight(this.footerContentButton,1)},addDetailFooterContentLeft:function(t){this.getView().byId("masterFooter").addContentLeft(t)},addFacetFilter:function(t){this.getView().byId("subHeader").addContent(t)},enableDisableOpenIn:function(){var t=this;if(!t.openInBtn){return}var e=false;var i=this.oNavigationHandler.getNavigationTargets();i.then(function(i){if(i.global.length===0&&i.stepSpecific.length===0){if(t.openInBtn.getEnabled()){e=true;t.openInBtn.setEnabled(false)}}else{if(!t.openInBtn.getEnabled()){e=true;t.openInBtn.setEnabled(true)}}if(e){t.openInBtn.rerender()}})},addOpenInButton:function(){var e=this;if(this.oNavListPopover===undefined){this.oNavListPopover=new i({showHeader:false,placement:s.Top})}this.openInBtn=new t({id:this.createId("idOpenInButton"),text:this.oCoreApi.getTextNotHtmlEncoded("openIn"),tooltip:this.oCoreApi.getTextNotHtmlEncoded("openIn"),type:"Transparent",enabled:false,press:function(t){e.oNavTargetsView=sap.ui.view({viewName:"sap.apf.ui.reuse.view.navigationTarget",type:a.JS,viewData:{oNavigationHandler:e.oNavigationHandler,oNavListPopover:e.oNavListPopover,oOpenInButtonEventSource:t.getSource(),oUiApi:e.oUiApi,oCoreApi:e.oCoreApi}})}});this.getView().byId("masterFooter").insertContentRight(this.openInBtn,1);this.enableDisableOpenIn()},doOkOnNavAnalysisPath:function(){var t=this;var e=this.oUiApi.getAnalysisPath().getToolbar();this.oCoreApi.readPaths(function(i,o,n){var a=true;var s=i.paths;if(o!==undefined){e.maxNumberOfSteps=o.getEntityTypeMetadata().maximumNumberOfSteps;e.maxNumberOfPaths=o.getEntityTypeMetadata().maxOccurs}if(n===undefined&&typeof i==="object"){e.getController().getSaveDialog(a,function(){window.history.go(-1)},s)}else{var r=t.oCoreApi.createMessageObject({code:"6005",aParameters:[]});r.setPrevious(n);t.oCoreApi.putMessage(r)}})},handleNavBack:function(){var e=this;if(e.oUiApi.getLayoutView().getController().oSavedPathName.getText().slice(0,1)==="*"&&e.oCoreApi.getSteps().length!==0){var i=new sap.ui.jsfragment("sap.apf.ui.reuse.fragment.newMessageDialog",this);e.getView().byId("idYesButton").attachPress(function(){i.close();e.doOkOnNavAnalysisPath()});e.getView().byId("idNoButton").attachPress(function(){i.close();window.history.go(-1)});var n=new t(e.createId("idCancelButton"),{text:e.oCoreApi.getTextNotHtmlEncoded("cancel"),press:function(){i.close()}});i.addButton(n);if(o.system.desktop){i.addStyleClass("sapUiSizeCompact")}i.setInitialFocus(i);i.open()}else{window.history.go(-1)}}})});
//# sourceMappingURL=layout.controller.js.map
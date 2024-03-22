/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
jQuery.sap.declare("sap.uiext.inbox.InboxSplitApp");jQuery.sap.require("sap.uiext.inbox.library");jQuery.sap.require("sap.ui.core.Control");sap.ui.core.Control.extend("sap.uiext.inbox.InboxSplitApp",{metadata:{deprecated:true,library:"sap.uiext.inbox",properties:{showMasterPageNavBtn:{type:"boolean",group:"Appearance",defaultValue:null},tcmServiceURL:{type:"string",defaultValue:null},filters:{type:"object[]",group:"Misc",defaultValue:null},tcmConfiguration:{type:"object",group:"Misc",defaultValue:null}},aggregations:{splitAppl:{type:"sap.m.SplitApp",multiple:false}},events:{navButtonPressed:{}}}});jQuery.sap.require("sap.uiext.inbox.splitapp.MasterPage");jQuery.sap.require("sap.uiext.inbox.splitapp.DetailViewPage");sap.uiext.inbox.InboxSplitApp.prototype.init=function(){this.oCore=sap.ui.getCore();this.bPhoneDevice=jQuery.device.is.phone;this.setAggregation("splitAppl",new sap.m.SplitApp({mode:this.bPhoneDevice?sap.m.SplitAppMode.HideMode:sap.m.SplitAppMode.StretchCompressMode}));this.oSplitApp=this.getAggregation("splitAppl");this.oInboxMasterPage=new sap.uiext.inbox.splitapp.MasterPage(this.getId()+"-mp");this.oSplitApp.addMasterPage(this.oInboxMasterPage.getPage());this.oInboxDetailPage=new sap.uiext.inbox.splitapp.DetailViewPage(this.getId()+"-dp");this.oSplitApp.addDetailPage(this.oInboxDetailPage.getPage());var e=jQuery.proxy(this._handleListSelect,this);this.oCore.getEventBus().subscribe("sap.uiext.inbox","masterPageListSelected",e);var t=jQuery.proxy(this._handleNavButtonTapped,this);this.oCore.getEventBus().subscribe("sap.uiext.inbox","masterPageNavButtonTapped",t);var i=jQuery.proxy(this._handleNavButtonPressDetailPage,this);this.oCore.getEventBus().subscribe("sap.uiext.inbox","detailPageNavButtonTapped",i);var a=jQuery.proxy(this._handleOpenTaskExecutionUI,this);this.oCore.getEventBus().subscribe("sap.uiext.inbox","detailPageTaskTitleSelected",a);var o=jQuery.proxy(this._handleTaskActionCompleted,this);this.oCore.getEventBus().subscribe("sap.uiext.inbox","taskActionCompleted",o)};sap.uiext.inbox.InboxSplitApp.prototype.setTcmServiceURL=function(e){this.setProperty("tcmServiceURL",e,true);var t=new sap.ui.model.odata.ODataModel(e,true);t.setCountSupported(false);this.setModel(t,"inboxTCMModel");this.oInboxDetailPage._setTcmServiceURL(e);this.oInboxMasterPage._setTcmServiceURL(e);return this};sap.uiext.inbox.InboxSplitApp.prototype.setTcmConfiguration=function(e){this.setProperty("tcmConfiguration",e,true);var t=this.getProperty("tcmConfiguration");this.oInboxDetailPage._setTcmConfiguration(t);return this};sap.uiext.inbox.InboxSplitApp.prototype.setShowMasterPageNavBtn=function(e){this.setProperty("showMasterPageNavBtn",e,true);this.oInboxMasterPage.setShowNavButton(e);return this};sap.uiext.inbox.InboxSplitApp.prototype._handleNavButtonTapped=function(e,t,i){this.fireNavButtonPressed()};sap.uiext.inbox.InboxSplitApp.prototype._handleNavButtonPressDetailPage=function(e,t){this.oSplitApp.toMaster(this.oInboxMasterPage.getPage().getId())};sap.uiext.inbox.InboxSplitApp.prototype.bindTasks=function(e){this.oInboxMasterPage.bindService(e);return this};sap.uiext.inbox.InboxSplitApp.prototype.resetSearchCriteria=function(){if(this.oInboxMasterPage){this.oInboxMasterPage.resetSearchCriteria()}return this};sap.uiext.inbox.InboxSplitApp.prototype._handleOpenTaskExecutionUI=function(e,t,i){if(!this.oTaskExecutionUIPageObj){this._createTaskExecutionUIPage()}this.oTaskExecutionUIPageObj.getPage().setBindingContext(i.context);this.oTaskExecutionUIPageObj.open();if(jQuery.device.is.phone){this.oSplitApp.to(this.oTaskExecutionUIPageObj.getPage().getId())}};sap.uiext.inbox.InboxSplitApp.prototype._createTaskExecutionUIPage=function(){jQuery.sap.require("sap.uiext.inbox.splitapp.TaskExecutionUIPage");this.oTaskExecutionUIPageObj=new sap.uiext.inbox.splitapp.TaskExecutionUIPage(this.getId()+"-exUi");this.oSplitApp.addPage(this.oTaskExecutionUIPageObj.getPage());var e=jQuery.proxy(this._handleTaskExecUIPageNavButtonPressed,this);this.oCore.getEventBus().subscribe("sap.uiext.inbox","taskExecUIPageNavButtonPressed",e)};sap.uiext.inbox.InboxSplitApp.prototype._handleTaskExecUIPageNavButtonPressed=function(e,t,i){this.oSplitApp.backToTopDetail();this.oInboxMasterPage._refreshTasks(null,this.oInboxMasterPage);this.oInboxDetailPage.renderDetailsPage()};sap.uiext.inbox.InboxSplitApp.prototype._handleListSelect=function(e,t,i){this.oInboxDetailPage.getPage().setBindingContext(i.context);if(this.bPhoneDevice){this.oSplitApp.toDetail(this.oInboxDetailPage.getPage().getId())}if(this.oInboxDetailPage.getPage().getId()==this.oSplitApp.getCurrentPage().getId()){this.oInboxDetailPage.renderDetailsPage(i.onUpdate)}else{this._handleOpenTaskExecutionUI(null,null,i)}};sap.uiext.inbox.InboxSplitApp.prototype._handleTaskActionCompleted=function(e,t,i){if(!this.bPhoneDevice){this.oInboxMasterPage.rerenderTask(i.taskData)}else{this.oInboxDetailPage.updateTaskDataInModel(i.taskData);if(i.taskData.Status!="COMPLETED"){this.oInboxDetailPage.renderDetailsPage()}else{this.oSplitApp.toMaster(this.oInboxMasterPage.getPage().getId())}}};
//# sourceMappingURL=InboxSplitApp.js.map
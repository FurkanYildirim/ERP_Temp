/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/support/techinfo/moduleTreeHelper","sap/ui/Device","sap/ui/Global","sap/ui/VersionInfo","sap/ui/core/format/DateFormat","sap/ui/model/resource/ResourceModel","sap/ui/model/json/JSONModel","sap/ui/thirdparty/URI","sap/m/MessageBox","sap/m/MessageToast","sap/ui/core/support/Support","sap/ui/model/ValidateException","sap/m/library","sap/ui/util/Storage","sap/ui/core/syncStyleClass","sap/base/Log","sap/ui/core/Fragment","sap/ui/thirdparty/jquery","sap/ui/core/Configuration","sap/ui/core/Lib","sap/ui/core/message/MessageManager"],function(t,e,o,s,i,r,n,a,u,p,_,l,h,g,c,d,f,jQuery,D,S,P){"use strict";return{_MIN_UI5VERSION_SUPPORT_ASSISTANT:"1.47",_MIN_EXPAND_LEVEL_DEBUG_MODULES:3,_SUPPORT_ASSISTANT_POPOVER_ID:"technicalInfoDialogAssistantPopover",_DEBUG_MODULES_ID:"TechnicalInfoDialogDebugModules",_TECHNICAL_INFO_DIALOG_ID:"technicalInfoDialog",_LOCAL_STORAGE_KEYS:{STANDARD_URL:"sap-ui-standard-bootstrap-URL",CUSTOM_URL:"sap-ui-custom-bootstrap-URL",LOCATION:"sap-ui-selected-location",OPEN_IN_NEW_WINDOW:"sap-ui-open-sa-in-new-window"},_storage:new g(g.Type.local),_treeHelper:t,open:function(t){if(this._pOpenDialog){return}this._oModuleSystemInfo=t()||{};this._loadAndInitialize().then(function(){this._oDialog.open();this._bIsBeingClosed=false}.bind(this))},close:function(){if(!this._pDestroyDialog){this._bIsBeingClosed=true;this._pDestroyDialog=Promise.all([Promise.resolve(this._pAssistantPopover).then(function(){if(this._oAssistantPopover){this._oAssistantPopover.destroy();this._oAssistantPopover=null}this._pAssistantPopover=null}.bind(this)),Promise.resolve(this._pDebugPopover).then(function(){if(this._oDebugPopover){this._oDebugPopover.destroy();this._oDebugPopover=null}this._pDebugPopover=null}.bind(this))]).then(function(){this._oDialog.close();this._oDialog.destroy();this._oDialog=null;this._pOpenDialog=null;this._pDestroyDialog=null}.bind(this))}return this._pDestroyDialog},onShowHelp:function(){h.URLHelper.redirect("https://ui5.sap.com/#/topic/616a3ef07f554e20a3adf749c11f64e9.html#loio616a3ef07f554e20a3adf749c11f64e9",true)},onShowVersion:function(){h.URLHelper.redirect(sap.ui.require.toUrl("sap-ui-version.json"),true)},onCopyTechnicalInfoToClipboard:function(){var t=this._oDialog.getModel("view"),e=t.getProperty("/ProductName")+": "+t.getProperty("/ProductVersion")+" "+this._getControl("versionBuiltAt",this._TECHNICAL_INFO_DIALOG_ID).getText(),o="OpenUI5 Version: "+t.getProperty("/OpenUI5ProductVersion")+" "+this._getControl("versionOpenUI5BuiltAt",this._TECHNICAL_INFO_DIALOG_ID).getText(),s=e+"\r\n"+(t.getProperty("/OpenUI5ProductVersion")?o+"\r\n":"")+this._getText("TechInfo.UserAgent.Label")+": "+t.getProperty("/UserAgent")+"\r\n"+this._getText("TechInfo.AppUrl.Label")+": "+t.getProperty("/ApplicationURL")+"\r\n";this._copyToClipboard(s,"TechInfo.CopyToClipboard")},onConfigureDebugModulesCopyToClipboard:function(){var t=this._oDialog.getModel("view"),e=t.getProperty("/DebugModules")[0],o="sap-ui-debug="+this._treeHelper.toDebugInfo(e);this._copyToClipboard(o,"TechInfo.DebugModulesCopyToClipboard")},onDebugSources:function(t){var e=t.getParameter("selected");this._confirmReload(function(){this._reloadWithParameter("sap-ui-debug",e)}.bind(this),function(){var t=this._oDialog.getModel("view");t.setProperty("/DebugMode",!t.getProperty("/DebugMode"))}.bind(this))},onConfigureDebugModules:function(){var t=this._oDialog.getModel("view"),e;if(this._oDebugPopover&&this._oDebugPopover.isOpen()){return}e=this._treeHelper.toTreeModel(this._oModuleSystemInfo);t.setProperty("/DebugModules",[e.tree]);this._updateTreeInfos();this._loadDebugPopover().then(function(){if(this._bIsBeingClosed){return}var t=this._getControl("customDebugValue",this._DEBUG_MODULES_ID);try{this._validateCustomDebugValue(t.getValue())}catch(e){this._showError(t,e.message);return}this._getControl("tree",this._DEBUG_MODULES_ID).expandToLevel(Math.max(this._MIN_EXPAND_LEVEL_DEBUG_MODULES,e.depth));this._oDebugPopover.open()}.bind(this))},onConfigureDebugModulesConfirm:function(){this._confirmReload(function(){var t=this._oDialog.getModel("view");this._reloadWithParameter("sap-ui-debug",t.getProperty("/CustomDebugMode"))}.bind(this))},onConfigureDebugModulesClose:function(){this.onConfigureDebugModulesReset();this._oDebugPopover.close()},onConfigureDebugModuleSelect:function(t){var e=this._oDialog.getModel("view"),o=t.getParameter("listItem"),s=o.getItemNodeContext(),i=s.context.getPath(),r=e.getProperty(i),n=this._getControl("customDebugValue",this._DEBUG_MODULES_ID);this._resetValueState(n);this._treeHelper.recursiveSelect(r,o.getSelected());this._updateTreeInfos()},onChangeCustomDebugMode:function(){var t=this._oDialog.getModel("view"),e=this._getControl("customDebugValue",this._DEBUG_MODULES_ID),o;try{this._validateCustomDebugValue(e.getValue())}catch(t){this._showError(e,t.message);return}if(t.getProperty("/CustomDebugMode")==="true"){t.setProperty("/CustomDebugMode",true)}if(t.getProperty("/CustomDebugMode")==="false"){t.setProperty("/CustomDebugMode",false)}window["sap-ui-debug"]=t.getProperty("/CustomDebugMode");o=this._treeHelper.toTreeModel(this._oModuleSystemInfo);t.setProperty("/DebugModules",[o.tree]);this._getControl("tree",this._DEBUG_MODULES_ID).expandToLevel(Math.max(this._MIN_EXPAND_LEVEL_DEBUG_MODULES,o.depth));this._updateTreeInfos()},onConfigureDebugModulesReset:function(){var t=this._oDialog.getModel("view"),e=t.getProperty("/DebugModules")[0];this._treeHelper.recursiveSelect(e,false);this._updateTreeInfos()},onOpenDiagnostics:function(){var t=_.getStub();if(t.getType()!=_.StubType.APPLICATION){return}t.openSupportTool();this.close()},onOpenTestRecorderInIFrame:function(){this.close();sap.ui.require(["sap/ui/testrecorder/Bootstrap"],function(t){t.init(["true"])},function(t){d.error("Could not load module 'sap/ui/testrecorder/Bootstrap'! Details: "+t)})},onOpenAssistant:function(){var t=this._oDialog.getModel("view"),e=t.getProperty("/SelectedLocation"),o=t.getProperty("/StandardBootstrapURL"),s=t.getProperty("/CustomBootstrapURL"),i=[],r;t.getProperty("/SupportAssistantPopoverURLs").forEach(function(t){i.push(t.Value)});if(i.indexOf(o)===-1&&e==="standard"){e="custom";s=o;t.setProperty("/SelectedLocation",e);this._storage.put(this._LOCAL_STORAGE_KEYS.STANDARD_URL,i[0]);t.setProperty("/StandardBootstrapURL",this._storage.get(this._LOCAL_STORAGE_KEYS.STANDARD_URL))}if(e==="standard"){r=o}else if(s){if(!s.match(/\/$/)){s+="/"}this._storage.put(this._LOCAL_STORAGE_KEYS.CUSTOM_URL,s);t.setProperty("/CustomBootstrapURL",this._storage.get(this._LOCAL_STORAGE_KEYS.CUSTOM_URL));r=s}this._startAssistant(r)},onSelectBootstrapOption:function(t){var e=t.getSource().getId().split("--").pop();this._setActiveLocations(e)},onChangeStandardBootstrapURL:function(t){var e=t.getParameter("selectedItem").getKey(),o=t.getSource();this._storage.put(this._LOCAL_STORAGE_KEYS.STANDARD_URL,e);this._resetValueState(o);this._pingUrl(e,o).then(function t(){o.setValueState("Success")},function t(){var e=this._getText("TechInfo.SupportAssistantConfigPopup.NotAvailableAtTheMoment");this._showError(o,e);d.error("Support Assistant could not be loaded from the URL you entered")})},onLiveChangeCustomBootstrapURL:function(t){var e=t.getParameter("value"),o=t.getSource();this._storage.put(this._LOCAL_STORAGE_KEYS.CUSTOM_URL,e);try{this._validateValue(o.getValue());this._resetValueState(o)}catch(t){this._showError(o,t.message)}},onChangeOpenInNewWindow:function(t){var e=t.getParameter("selected");this._storage.put(this._LOCAL_STORAGE_KEYS.OPEN_IN_NEW_WINDOW,e)},onConfigureAssistantBootstrap:function(t){if(this._oAssistantPopover&&this._oAssistantPopover.isOpen()){return}this._loadAssistantPopover().then(function(){if(this._bIsBeingClosed){return}var t=this._getControl("standardBootstrapURL",this._SUPPORT_ASSISTANT_POPOVER_ID).getItems()[0];if(this._isVersionBiggerThanMinSupported()){var e=D.getVersion().toString();t.setText(t.getText().replace("[[version]]",e));t.setEnabled(true)}else{t.setText(t.getText().replace("[[version]]","not supported"));t.setEnabled(false)}var o=this._oDialog.getModel("view"),s=o.getProperty("/SelectedLocation");this._setActiveLocations(s);var i=this._getControl("supportAssistantSettingsButton",this._TECHNICAL_INFO_DIALOG_ID);this._oAssistantPopover.openBy(i)}.bind(this))},_getText:function(t,e){return S.get("sap.ui.core").getResourceBundle().getText(t,e)},_validateValue:function(t){var e=/^https?:\/\/(www\.)?([-a-zA-Z0-9.%_+~#=]{2,})([-a-zA-Z0-9@:%_+.~#?&/=]*)\/sap\/ui\/support\/?$/,o=window.location.protocol;if(t&&!t.match(e)){throw new l(this._getText("TechInfo.SupportAssistantConfigPopup.URLValidationMessage"))}if(t&&o==="https:"&&!t.match(o)){throw new l(this._getText("TechInfo.SupportAssistantConfigPopup.ProtocolError"))}return true},_validateCustomDebugValue:function(t){var e=/^(true|false|x|X)$|^(([a-zA-Z*[\]{}()+?.\\^$|]+\/?)+(,([a-zA-Z*[\]{}()+?.\\^$|]+\/?)+)*)$/;if(t&&!t.match(e)){throw new l(this._getText("TechInfo.DebugModulesConfigPopup.ModeValidationMessage"))}return true},_convertBuildDate:function(t){var e=i.getInstance({pattern:"yyyyMMdd-HHmmss"});return e.parse(t)},_getContentDensityClass:function(){if(!this._sContentDensityClass){if(!e.support.touch){this._sContentDensityClass="sapUiSizeCompact"}else{this._sContentDensityClass="sapUiSizeCozy"}}return this._sContentDensityClass},_startAssistant:function(t){var e=this._oDialog.getModel("view"),o={support:"true",window:e.getProperty("/OpenSupportAssistantInNewWindow")};this._loadAssistant(t,o)},_loadAssistant:function(t,e){this._pingUrl(t).then(function o(){this.close();var s=[e.support];S.load({name:"sap.ui.support",url:t}).then(function(){if(e.window){s.push("window")}if(s[0].toLowerCase()==="true"||s[0].toLowerCase()==="silent"){sap.ui.require(["sap/ui/support/Bootstrap"],function(t){t.initSupportRules(s)})}})},function t(e,o){var s=this._getText("TechInfo.SupportAssistantConfigPopup.SupportAssistantNotFound");if(e.status===0){s+=this._getText("TechInfo.SupportAssistantConfigPopup.ErrorTryingToGetRecourse")}else if(e.status===404){s+=this._getText("TechInfo.SupportAssistantConfigPopup.ErrorNotFound")}else if(e.status===500){s+=this._getText("TechInfo.SupportAssistantConfigPopup.InternalServerError")}else if(o==="parsererror"){s+=this._getText("TechInfo.SupportAssistantConfigPopup.ErrorOnJsonParse")}else if(o==="timeout"){s+=this._getText("TechInfo.SupportAssistantConfigPopup.ErrorOnTimeout")}else if(o==="abort"){s+=this._getText("TechInfo.SupportAssistantConfigPopup.ErrorWhenAborted")}else{s+=this._getText("TechInfo.SupportAssistantConfigPopup.UncaughtError")+e.responseText}this._sErrorMessage=s;this.onConfigureAssistantBootstrap();d.error("Support Assistant could not be loaded from the URL you entered")})},_loadAndInitialize:function(){this._pOpenDialog=Promise.all([S._load(["sap.ui.core","sap.ui.layout","sap.m"]),this._loadVersionInfo(),this._pDestroyDialog]).then(function(){return f.load({id:this._TECHNICAL_INFO_DIALOG_ID,name:"sap.ui.core.support.techinfo.TechnicalInfo",controller:this})}.bind(this)).then(function(t){this._oDialog=t;return this._initialize()}.bind(this)).then(function(){this._oDialog.open();this._bIsBeingClosed=false}.bind(this));return this._pOpenDialog},_initialize:function(){var t=new r({bundleName:"sap.ui.core.messagebundle"});this._oDialog.setModel(t,"i18n");this._oDialog.setModel(this._createViewModel(),"view");this._oDialog.addStyleClass(this._getContentDensityClass())},_loadVersionInfo:function(){return s.load().catch(function(t){d.error("failed to load global version info",t);return{name:"",version:""}}).then(function(t){this._oVersionInfo=t}.bind(this))},_createViewModel:function(){var t=new a(sap.ui.require.toUrl(""),window.location.origin+window.location.pathname)+"/sap/ui/support/",e="standard",s=false;this._saveLocalStorageDefault(this._LOCAL_STORAGE_KEYS.STANDARD_URL,t);this._saveLocalStorageDefault(this._LOCAL_STORAGE_KEYS.LOCATION,e);this._saveLocalStorageDefault(this._LOCAL_STORAGE_KEYS.OPEN_IN_NEW_WINDOW,s);var i=new n({ProductName:"SAPUI5",StandardBootstrapURL:this._storage.get(this._LOCAL_STORAGE_KEYS.STANDARD_URL),CustomBootstrapURL:this._storage.get(this._LOCAL_STORAGE_KEYS.CUSTOM_URL),OpenSupportAssistantInNewWindow:this._storage.get(this._LOCAL_STORAGE_KEYS.OPEN_IN_NEW_WINDOW),SelectedLocation:this._storage.get(this._LOCAL_STORAGE_KEYS.LOCATION),OpenUI5ProductVersion:null,OpenUI5ProductTimestamp:null,DebugModuleSelectionCount:0});i.setProperty("/ProductName",this._oVersionInfo.name);i.setProperty("/ProductVersion",this._oVersionInfo.version);try{i.setProperty("/ProductTimestamp",this._generateLocalizedBuildDate(this._oVersionInfo.buildTimestamp))}catch(t){d.error("failed to parse build timestamp from global version info")}if(!/openui5/i.test(this._oVersionInfo.name)){i.setProperty("/OpenUI5ProductVersion",o.version);try{i.setProperty("/OpenUI5ProductTimestamp",this._generateLocalizedBuildDate(o.buildinfo.buildtime))}catch(t){d.error("failed to parse OpenUI5 build timestamp from global version info")}}var r;try{r=this._getText("TechInfo.SupportAssistantConfigPopup.AppVersionOption",this._oVersionInfo.version)}catch(t){r="Application"}var u=[{DisplayName:r,Value:t},{DisplayName:"OpenUI5 CDN",Value:"https://sdk.openui5.org/resources/sap/ui/support/"},{DisplayName:"OpenUI5 (Nightly)",Value:"https://sdk.openui5.org/nightly/resources/sap/ui/support/"},{DisplayName:"SAPUI5 CDN",Value:"https://ui5.sap.com/resources/sap/ui/support/"}];var p=this._getText("TechInfo.DebugModulesConfigPopup.SelectionCounter",i.DebugModuleSelectionCount);i.setProperty("/DebugModulesTitle",p);i.setProperty("/SupportAssistantPopoverURLs",u);i.setProperty("/ApplicationURL",document.location.href);i.setProperty("/UserAgent",navigator.userAgent);i.setProperty("/DebugMode",D.getDebug());if(!this._isVersionBiggerThanMinSupported()){i.setProperty("/StandardBootstrapURL",u[2].Value);this._storage.put(this._LOCAL_STORAGE_KEYS.STANDARD_URL,u[2].Value)}i.setSizeLimit(1e5);return i},_saveLocalStorageDefault:function(t,e){if(!this._storage.get(t)){this._storage.put(t,e)}},_isVersionBiggerThanMinSupported:function(){var t=D.getVersion();if(t&&t.compareTo(this._MIN_UI5VERSION_SUPPORT_ASSISTANT)>=0){return true}return false},_generateLocalizedBuildDate:function(t){var e=i.getDateInstance({pattern:"dd.MM.yyyy HH:mm:ss"}),o=e.format(this._convertBuildDate(t));return this._getText("TechInfo.VersionBuildTime.Text",o)},_setActiveLocations:function(t){var e=this._oDialog.getModel("view"),o=this._getControl("standard",this._SUPPORT_ASSISTANT_POPOVER_ID),s=this._getControl("custom",this._SUPPORT_ASSISTANT_POPOVER_ID),i=this._getControl("customBootstrapURL",this._SUPPORT_ASSISTANT_POPOVER_ID),r=this._getControl("standardBootstrapURL",this._SUPPORT_ASSISTANT_POPOVER_ID),n;this._resetValueState(i);this._resetValueState(r);if(t==="standard"){n=true;e.setProperty("/StandardBootstrapURL",this._storage.get(this._LOCAL_STORAGE_KEYS.STANDARD_URL));r.setSelectedKey(e.getProperty("/StandardBootstrapURL"))}else{n=false}r.setEnabled(n);o.setSelected(n);i.setEnabled(!n);s.setSelected(!n);this._storage.put(this._LOCAL_STORAGE_KEYS.LOCATION,t);e.setProperty("/SelectedLocation",this._storage.get(this._LOCAL_STORAGE_KEYS.LOCATION))},_confirmReload:function(t,e){u.confirm(this._getText("TechInfo.DebugSources.ConfirmMessage"),{title:this._getText("TechInfo.DebugSources.ConfirmTitle"),onClose:function(o){if(o===u.Action.OK){t()}else if(e){e()}}})},_onAssistantPopoverOpened:function(){var t=this._oDialog.getModel("view"),e=t.getProperty("/SelectedLocation"),o;if(e==="custom"){o=this._getControl("customBootstrapURL",this._SUPPORT_ASSISTANT_POPOVER_ID);var s=o.getValue();try{this._validateValue(s)}catch(t){this._showError(o,t.message);if(this._sErrorMessage){this._sErrorMessage=null}return}}else{o=this._getControl("standardBootstrapURL",this._SUPPORT_ASSISTANT_POPOVER_ID)}if(this._sErrorMessage){this._showError(o,this._sErrorMessage);this._sErrorMessage=null}},_showError:function(t,e){t.setValueStateText(e);t.setValueState("Error");t.openValueStateMessage()},_resetValueState:function(t){t.setValueState("None");t.closeValueStateMessage()},_pingUrl:function(t){return jQuery.ajax({type:"HEAD",async:true,context:this,url:t+"Bootstrap.js"})},_getControl:function(t,e){if(e){return sap.ui.getCore().byId(e+"--"+t)}return sap.ui.getCore().byId(t)},_reloadWithParameter:function(t,e){var o=window.location.search,s=t+"="+e;if(o&&o!=="?"){var i=new RegExp("(?:^|\\?|&)"+t+"=[^&]+");if(o.match(i)){o=o.replace(i,s)}else{o+="&"+s}}else{o="?"+s}window.location.search=o},_copyToClipboard:function(t,e){var o=jQuery("<textarea>");try{jQuery("body").append(o);o.val(t).trigger("select");document.execCommand("copy");o.remove();p.show(this._getText(e+".Success"))}catch(t){p.show(this._getText(e+".Error"))}},_updateTreeInfos:function(){var t=this._oDialog.getModel("view"),e=t.getProperty("/DebugModules")[0],o;t.setProperty("/CustomDebugMode",this._treeHelper.toDebugInfo(e));t.setProperty("/DebugModuleSelectionCount",this._treeHelper.getSelectionCount(e));o=t.getProperty("/DebugModuleSelectionCount").toString();t.setProperty("/DebugModulesTitle",this._getText("TechInfo.DebugModulesConfigPopup.SelectionCounter",o))},_loadDebugPopover:function(){if(!this._pDebugPopover){this._pDebugPopover=f.load({id:this._DEBUG_MODULES_ID,name:"sap.ui.core.support.techinfo.TechnicalInfoDebugDialog",controller:this}).then(function(t){this._oDebugPopover=t;this._oDialog.addDependent(this._oDebugPopover);c(this._getContentDensityClass(),this._oDialog,this._oDebugPopover)}.bind(this))}return this._pDebugPopover},_loadAssistantPopover:function(){if(!this._pAssistantPopover){this._pAssistantPopover=f.load({id:this._SUPPORT_ASSISTANT_POPOVER_ID,name:"sap.ui.core.support.techinfo.TechnicalInfoAssistantPopover",controller:this}).then(function(t){this._oAssistantPopover=t;this._oAssistantPopover.attachAfterOpen(this._onAssistantPopoverOpened,this);this._oDialog.addDependent(this._oAssistantPopover);c(this._getContentDensityClass(),this._oDialog,this._oAssistantPopover);var e=this._getControl("customBootstrapURL",this._SUPPORT_ASSISTANT_POPOVER_ID);P.registerObject(e,true)}.bind(this))}return this._pAssistantPopover}}});
//# sourceMappingURL=TechnicalInfo.js.map
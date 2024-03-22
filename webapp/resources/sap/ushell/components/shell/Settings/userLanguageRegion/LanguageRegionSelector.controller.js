// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/base/util/UriParameters","sap/ui/core/Configuration","sap/ui/core/Locale","sap/ui/core/LocaleData","sap/ui/core/format/DateFormat","sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/performance/Measurement","sap/ushell/Config"],function(e,t,a,r,n,s,i,o,g,u){"use strict";return i.extend("sap.ushell.components.shell.Settings.userLanguageRegion.LanguageRegionSelector",{onInit:function(){this.oUserInfoServicePromise=sap.ushell.Container.getServiceAsync("UserInfo");return this.oUserInfoServicePromise.then(function(e){this.oUser=sap.ushell.Container.getUser();var t=a.getFormatSettings().getFormatLocale();var r=n.getInstance(t);var i,g,l,m;var c=sap.ushell.Container.getRenderer("fiori2").getShellConfig().enableSetLanguage||false;var L=this.oUser.isLanguagePersonalized();var d=e.getUserSettingListEditSupported();var h=[];if(d){var f=a.getFormatSettings();i=f.getLegacyDateFormat();l=f.getLegacyTimeFormat();m=this._getLegacyNumberFormat(f);h.push(this._loadUserSettingList())}else{i=r.getDatePattern("medium");g=r.getTimePattern("medium");l=g.indexOf("H")===-1?"12h":"24h"}var F=new o({languageList:null,DateFormatList:null,TimeFormatList:null,NumberFormatList:null,TimeZoneList:null,selectedLanguage:this.oUser.getLanguage(),selectedLanguageText:this.oUser.getLanguageText(),selectedDatePattern:i,selectedTimeFormat:l,selectedNumberFormat:m,selectedTimeZone:this.oUser.getTimeZone(),isSettingsLoaded:true,isLanguagePersonalized:L,isEnableSetLanguage:c,isEnableUserProfileSetting:d,isTimeZoneFromServerInUI5:u.last("/core/ui5/timeZoneFromServerInUI5")});F.setSizeLimit(1e3);if(c){h.push(this._loadLanguagesList())}if(h.length>0){this.getView().setBusy(true);return Promise.all(h).then(function(e){var t=d?e[0]:null;var a=null;if(c){a=e.length===1?e[0]:e[1]}if(a&&a.length>1){F.setProperty("/languageList",a);var r=a.some(function(e){return e.key==="default"});if(!L&&r){F.setProperty("/selectedLanguage","default")}}if(t&&t.TIME_FORMAT&&t.TIME_FORMAT.length>0){F.setProperty("/TimeFormatList",t.TIME_FORMAT)}if(t&&t.DATE_FORMAT&&t.DATE_FORMAT.length>0){F.setProperty("/DateFormatList",t.DATE_FORMAT)}if(t&&t.TIME_ZONE&&t.TIME_ZONE.length>0){var n=s.getDateTimeWithTimezoneInstance({showDate:false,showTime:false});var i=t.TIME_ZONE.map(function(e){var t=n.format(null,e.description)||e.description;return{description:t,value:e.value}});F.setProperty("/TimeZoneList",i)}if(t&&t.NUMBER_FORMAT&&t.NUMBER_FORMAT.length>0){F.setProperty("/NumberFormatList",t.NUMBER_FORMAT)}this.oView.setModel(F);this.getView().setBusy(false)}.bind(this))}this.oView.setModel(F)}.bind(this))},_loadLanguagesList:function(){g.start("FLP:LanguageRegionSelector._getLanguagesList","_getLanguagesList","FLP");return this.oUserInfoServicePromise.then(function(t){return new Promise(function(a){g.start("FLP:LanguageRegionSelector._getLanguagesList","_getLanguagesList","FLP");t.getLanguageList().done(function(e){g.end("FLP:LanguageRegionSelector._getLanguagesList");a(e)}).fail(function(t){g.end("FLP:LanguageRegionSelector._getLanguagesList");e.error("Failed to load language list.",t,"sap.ushell.components.ushell.settings.userLanguageRegion.LanguageRegionSelector.controller");a(null)})})})},_loadUserSettingList:function(){g.start("FLP:LanguageRegionSelector._loadUserSettingList","_loadUserSettingList","FLP");return this.oUserInfoServicePromise.then(function(e){return new Promise(function(t){g.start("FLP:LanguageRegionSelector._loadUserSettingList","_loadUserSettingList","FLP");e.getUserSettingList().then(function(e){g.end("FLP:LanguageRegionSelector._loadUserSettingList");t(e)})})})},onCancel:function(){var e=this.getView().getModel(),t=e.getData(),a=t.languageList,r=t.isEnableSetLanguage;if(r&&a){var n=this.oUser.getLanguage();var s=t.isLanguagePersonalized?n:"default";e.setProperty("/selectedLanguage",s);this._updateTextFields(n)}if(t.isEnableUserProfileSetting){this._restoreUserSettingPreferenceValues()}},onSaveSuccess:function(t,a,r){var n={refresh:true};t.resetChangedProperty("dateFormat");t.resetChangedProperty("timeFormat");t.resetChangedProperty("numberFormat");t.resetChangedProperty("timeZone");if(a){e.debug("[000] onSaveSuccess: oUser.resetChangedPropertyLanguage:","LanguageRegionSelector.controller");t.resetChangedProperty("language");n.obsoleteUrlParams=["sap-language"]}return n},onSave:function(t){var r=this.oUser,n=this.getView().getModel().getData(),s=n.selectedLanguage,i=r.getLanguage(),o=s!==(n.isLanguagePersonalized?i:"default"),g=n.isEnableUserProfileSetting,u=n.isEnableSetLanguage&&n.languageList&&o,l=false,m=["DATE_FORMAT","TIME_FORMAT","NUMBER_FORMAT","TIME_ZONE","LANGUAGE"];e.debug("[000] LanguageRegionSelector:onSave:bUpdateLanguage, bIsEnableSetUserProfileSetting:",u,"LanguageRegionSelector.controller");if(u){e.debug("[000] LanguageRegionSelector:onSave:UserInfo: oUser.setLanguage:",s,"LanguageRegionSelector.controller");r.setLanguage(s)}if(g){var c=a.getFormatSettings();if(c.getLegacyDateFormat()!==n.selectedDatePattern){l=true;r.setChangedProperties({propertyName:"dateFormat",name:"DATE_FORMAT"},c.getLegacyDateFormat(),n.selectedDatePattern)}if(c.getLegacyTimeFormat()!==n.selectedTimeFormat){l=true;r.setChangedProperties({propertyName:"timeFormat",name:"TIME_FORMAT"},c.getLegacyTimeFormat(),n.selectedTimeFormat)}if(this._getLegacyNumberFormat(c)!==n.selectedNumberFormat){l=true;r.setChangedProperties({propertyName:"numberFormat",name:"NUMBER_FORMAT"},this._getLegacyNumberFormat(c),n.selectedNumberFormat)}if(this.oUser.getTimeZone()!==n.selectedTimeZone){l=true;r.setChangedProperties({propertyName:"timeZone",name:"TIME_ZONE"},this.oUser.getTimeZone(),n.selectedTimeZone)}}if(u||l){return t().then(function(){e.debug("[000] onSave:fnUpdateUserPreferences","LanguageRegionSelector.controller");return this.onSaveSuccess(r,u,s)}.bind(this)).catch(function(t){e.debug("[000] onSave:catch:errorMessage",t,"LanguageRegionSelector.controller");var a=m.some(function(e){return t.includes(e)});if(!a){return this.onSaveSuccess(r,u,s)}if(u){r.setLanguage(i);r.resetChangedProperty("language");this._updateTextFields(i)}r.resetChangedProperty("dateFormat");r.resetChangedProperty("timeFormat");r.resetChangedProperty("numberFormat");r.resetChangedProperty("timeZone");if(n.isEnableUserProfileSetting){this._restoreUserSettingPreferenceValues()}e.error("Failed to save Language and Region Settings",t,"sap.ushell.components.ushell.settings.userLanguageRegion.LanguageRegionSelector.controller");throw t}.bind(this))}return Promise.resolve()},_restoreUserSettingPreferenceValues:function(){var e=this.getView().getModel();var t=a.getFormatSettings();e.setProperty("/selectedDatePattern",t.getLegacyDateFormat());e.setProperty("/selectedTimeFormat",t.getLegacyTimeFormat());e.setProperty("/selectedNumberFormat",this._getLegacyNumberFormat(t));e.setProperty("/selectedTimeZone",this.oUser.getTimeZone())},_handleSelectChange:function(e){var t=e.getParameters().selectedItem.getKey();this._updateTextFields(t)},_updateTextFields:function(e){var t;if(e===this.oUser.getLanguage()){t=a.getFormatSettings().getFormatLocale()}else{t=new r(e)}var s=this.getView().getModel(),i=n.getInstance(t),o=i.getDatePattern("medium"),g=i.getTimePattern("medium"),u=g.indexOf("H")===-1?"12h":"24h";if(!s.getData().isEnableUserProfileSetting){s.setProperty("/selectedDatePattern",o);s.setProperty("/selectedTimeFormat",u)}},_getLegacyNumberFormat:function(e){var t=e.getLegacyNumberFormat();if(t){return t.trim()}}})});
//# sourceMappingURL=LanguageRegionSelector.controller.js.map
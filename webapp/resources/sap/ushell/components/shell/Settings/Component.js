// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/Core","sap/ui/core/mvc/XMLView","sap/ui/core/UIComponent","sap/ui/model/json/JSONModel","sap/ushell/Config","sap/ushell/EventHub","sap/ushell/resources","sap/ushell/components/shell/Settings/ProfilingLoader","sap/ushell/components/shell/Settings/userAccount/UserAccountEntry","sap/ushell/components/shell/Settings/appearance/AppearanceEntry","sap/ushell/components/shell/Settings/homepage/HomepageEntry","sap/ushell/components/shell/Settings/spaces/SpacesEntry","sap/ushell/components/shell/Settings/userActivities/UserActivitiesEntry","sap/ushell/components/shell/Settings/userProfiling/UserProfilingEntry","sap/ushell/components/shell/Settings/notifications/NotificationsEntry","sap/ushell/components/shell/Settings/userDefaults/UserDefaultsEntry","sap/ushell/components/shell/Settings/userLanguageRegion/UserLanguageRegionEntry","sap/ushell/ui/shell/ShellHeadItem","sap/ushell/utils"],function(e,t,s,n,i,o,r,l,a,u,h,c,g,p,d,f,m,S,y){"use strict";var E=[];return s.extend("sap.ushell.components.shell.Settings.Component",{metadata:{version:"1.115.1",library:"sap.ushell",dependencies:{libs:{"sap.m":{},"sap.ui.layout":{lazy:true}}}},init:function(){s.prototype.init.apply(this,arguments);var e=sap.ushell.Container.getRenderer("fiori2").getShellConfig();if(e.moveUserSettingsActionToShellHeader){this.oSettingsBtn=this._addUserSettingsButton()}this._addStandardEntityToConfig();l();if(i.last("/core/shell/model/enableNotifications")){this._addNotificationSettings()}E.push(o.on("openUserSettings").do(this._openUserSettings.bind(this)))},_addStandardEntityToConfig:function(){var e=i.last("/core/userPreferences/entries");e.push(a.getEntry());e.push(u.getEntry());if(c.isRelevant()){e.push(c.getEntry())}e.push(m.getEntry());if(i.last("/core/shell/enableRecentActivity")){e.push(g.getEntry())}e.push(p.getEntry());if(i.last("/core/shell/model/searchAvailable")){sap.ushell.Container.getFLPPlatform().then(function(t){if(t!=="MYHOME"){sap.ui.require(["sap/ushell/components/shell/Settings/search/SearchEntry"],function(t){t.getEntry().then(function(t){t.isActive().then(function(s){if(!s){return}y.setPerformanceMark("FLP -- search setting entry is set active");e=i.last("/core/userPreferences/entries");e.push(t);i.emit("/core/userPreferences/entries",e)})})})}})}if(i.last("/core/home/enableHomePageSettings")&&!i.last("/core/spaces/enabled")){e.push(h.getEntry())}if(i.last("/core/shell/model/userDefaultParameters")){e.push(f.getEntry())}e=sap.ushell.Container.getRenderer("fiori2").reorderUserPrefEntries(e);i.emit("/core/userPreferences/entries",e)},_addNotificationSettings:function(){sap.ushell.Container.getServiceAsync("Notifications").then(function(e){e._userSettingInitialization();e._getNotificationSettingsAvailability().done(function(e){if(e.settingsAvailable){var t=i.last("/core/userPreferences/entries");t.push(d.getEntry());i.emit("/core/userPreferences/entries",t)}})})},_openUserSettings:function(s){if(!this.oDialogPromise){this.oDialogPromise=t.create({id:"settingsView",viewName:"sap.ushell.components.shell.Settings.UserSettings"}).then(function(t){this.oSettingsView=t;t.setModel(new n({entries:[]}));t.setModel(r.i18nModel,"i18n");var i=s.controlId||"shell-header";e.byId(i).addDependent(t);return t.byId("userSettingsDialog")}.bind(this))}return this.oDialogPromise.then(function(e){e.open()})},_addUserSettingsButton:function(){var e=new S({id:"userSettingsBtn",icon:"sap-icon://action-settings",text:r.i18n.getText("userSettings"),ariaHaspopup:"dialog",press:this._openUserSettings.bind(this)});sap.ushell.Container.getRenderer("fiori2").oShellModel.addHeaderEndItem([e.getId()],false,["home","app","minimal","standalone","embedded","embedded-home","merged","merged-home"],true);return e},exit:function(){for(var e=0;e<E.length;e++){E[e].off()}if(this.oSettingsView){this.oSettingsView.destroy();this.oSettingsView=null;this.oDialogPromise=null}if(this.oSettingsBtn){this.oSettingsBtn.destroy();this.oSettingsBtn=null}}})});
//# sourceMappingURL=Component.js.map
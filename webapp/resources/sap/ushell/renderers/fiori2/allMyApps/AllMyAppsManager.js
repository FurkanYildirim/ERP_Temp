// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ushell/resources","sap/ushell/library"],function(jQuery,t,e){"use strict";var i=e.AllMyAppsProviderType;var a=function(){};a.prototype.loadAppsData=function(t,e,i){return sap.ushell.Container.getServiceAsync("AllMyApps").then(function(a){this.oPopover=e;if(!a.isEnabled()){return}this.iNumberOfProviders=0;this.oModel=t;if(a.isHomePageAppsEnabled()){this._handleGroupsData()}if(a.isExternalProviderAppsEnabled()){this._handleExternalProvidersData(t)}if(a.isCatalogAppsEnabled()){this._handleCatalogs(i)}if(!a.isCatalogAppsEnabled()||a.isCatalogAppsEnabled()&&i){var r=sap.ui.getCore().getEventBus();r.publish("launchpad","allMyAppsMasterLoaded")}}.bind(this))};a.prototype._handleGroupsData=function(){var e=this._getGroupsData();var a={title:t.i18n.getText("allMyApps_homeEntryTitle")};var r;return new Promise(function(t,i){e.done(t).fail(i)}).then(function(t){a.groups=t;a.type=i.HOME;if(t.length===0){return}r=this.oModel.getProperty("/AppsData");if(r){var e=this._getIndexByType(r,a.type);if(e!==undefined){r[e]=a}else{r.unshift(a)}}this.oModel.setProperty("/AppsData",r);this.iNumberOfProviders+=1}.bind(this))};a.prototype._getIndexByType=function(t,e){if(t.length<=0){return 0}for(var i=0;i<t.length;i++){if(t[i].type===e){return i}}};a.prototype._getGroupsData=function(){var t=new jQuery.Deferred;sap.ushell.Container.getServiceAsync("LaunchPage").then(function(t){return Promise.all([t.getDefaultGroup(),t.getGroups()])}).then(function(t){this.oDefaultGroup=t[0];var e=t[1];var i=[];e.forEach(function(t){i.push(this._getFormattedGroup(t))}.bind(this));return Promise.all(i)}.bind(this)).then(function(e){var i=e.filter(function(t){return t&&(t.apps.length>0||t.numberCustomTiles>0)});t.resolve(i)});return t.promise()};a.prototype._getFormattedGroup=function(e){var i;var a;var r;return sap.ushell.Container.getServiceAsync("LaunchPage").then(function(s){if(s.isGroupVisible(e)===false){return}if(s.getGroupId(e)===s.getGroupId(this.oDefaultGroup)){a=t.i18n.getText("my_group")}else{a=s.getGroupTitle(e)}i={};i.title=a;i.apps=[];r=s.getGroupTiles(e);return this._getFormattedGroupApps(r)}.bind(this)).then(function(e){if(!e){return}i.apps=e.aFormattedApps;i.numberCustomTiles=e.iNumberOfCustomTiles;if(e.iNumberOfCustomTiles===1){i.sCustomLabel=t.i18n.getText("allMyApps_customStringSingle");i.sCustomLink=t.i18n.getText("allMyApps_customLinkHomePageSingle")}else{i.sCustomLabel=t.i18n.getText("allMyApps_customString",[e.iNumberOfCustomTiles]);i.sCustomLink=t.i18n.getText("allMyApps_customLinkHomePage")}i.handlePress=this._onHandleGroupPress;return i}.bind(this))};a.prototype._getFormattedGroupApps=function(t){var e=[];var i=0;return sap.ushell.Container.getServiceAsync("LaunchPage").then(function(a){var r=[];t.forEach(function(t){if(a.isTileIntentSupported(t)){var s=this._getAppEntityFromTile(t).then(function(t){if(t){e.push(t)}else{i++}});r.push(s)}}.bind(this));return Promise.all(r)}.bind(this)).then(function(){return{iNumberOfCustomTiles:i,aFormattedApps:e}})};a.prototype._onHandleGroupPress=function(t,e){window.hasher.setHash("#Shell-home");this.oPopover.close();var i=sap.ui.getCore().getEventBus();i.subscribe("launchpad","dashboardModelContentLoaded",function(){i.publish("launchpad","scrollToGroupByName",{groupName:e.title,isInEditTitle:false})},this);i.publish("launchpad","scrollToGroupByName",{groupName:e.title,isInEditTitle:false})};a.prototype._handleExternalProvidersData=function(){var t=this;return sap.ushell.Container.getServiceAsync("AllMyApps").then(function(e){var a=e.getDataProviders();var r=Object.keys(a);var s;var o;var n;var l;var p;var u;if(r.length>0){for(p=0;p<r.length;p++){s=r[p];o=a[s];n=o.getTitle();l={};l.title=n;u=o.getData();u.done(function(e){if(e&&e.length>0){this.groups=e;this.type=i.EXTERNAL;t.oModel.setProperty("/AppsData/"+t.iNumberOfProviders,this);t.iNumberOfProviders+=1;var a=sap.ui.getCore().getEventBus();a.publish("launchpad","allMyAppsMasterLoaded")}}.bind(l))}}})};a.prototype._handleNotFirstCatalogsLoad=function(){var t=this.oModel.getProperty("/AppsData");var e=i.CATALOG;if(t.length&&t[t.length-1].type===e){this.bFirstCatalogLoaded=true;sap.ui.getCore().getEventBus().publish("launchpad","allMyAppsFirstCatalogLoaded",{bFirstCatalogLoadedEvent:true})}};a.prototype._handleCatalogs=function(e){if(!e){this._handleNotFirstCatalogsLoad();return Promise.resolve()}this.bFirstCatalogLoaded=false;this.aPromises=[];return sap.ushell.Container.getServiceAsync("LaunchPage").then(function(e){e.getCatalogs().done(function(){jQuery.when.apply(jQuery,this.aPromises).then(this._onDoneLoadingCatalogs.bind(this))}.bind(this)).fail(function(){this._onGetCatalogsFail(t.i18n.getText("fail_to_load_catalog_msg"))}.bind(this)).progress(this._addCatalogToModel.bind(this))}.bind(this))};a.prototype._addCatalogToModel=function(e){var a;var r={apps:[],numberCustomTiles:0,type:null};var s;var o=[sap.ushell.Container.getServiceAsync("LaunchPage")];if(this._oAddCatalogToModelPromise){o.push(this._oAddCatalogToModelPromise)}this._oAddCatalogToModelPromise=Promise.all(o).then(function(t){a=t[0];r.type=i.CATALOG;var s=a.getCatalogTiles(e);this.aPromises.push(s);return s}.bind(this)).then(function(t){var o;if(t.length===0){return}var n=a.getCatalogTitle(e);o=this.oModel.getProperty("/AppsData");for(s=0;s<o.length;s++){if(o[s].type===i.CATALOG&&o[s].title===n){r=o[s];break}}r.title=a.getCatalogTitle(e);return this._getFormattedGroupApps(t)}.bind(this)).then(function(e){if(!e){return}Array.prototype.push.apply(r.apps,e.aFormattedApps);r.numberCustomTiles=e.iNumberOfCustomTiles;if(r.numberCustomTiles===1){r.sCustomLabel=t.i18n.getText("allMyApps_customStringSingle");r.sCustomLink=t.i18n.getText("allMyApps_customLinkAppFinderSingle")}else{r.sCustomLabel=t.i18n.getText("allMyApps_customString",[r.numberCustomTiles]);r.sCustomLink=t.i18n.getText("allMyApps_customLinkAppFinder")}r.handlePress=function(t,e){this.oPopover.close();window.hasher.setHash("#Shell-home&/appFinder/catalog/"+JSON.stringify({catalogSelector:e.title,tileFilter:"",tagFilter:"[]",targetGroup:""}))}.bind(this);if(r.apps.length>0||r.numberCustomTiles>0){this.oModel.setProperty("/AppsData/"+s,r);if(this.bFirstCatalogLoaded===false){sap.ui.getCore().getEventBus().publish("launchpad","allMyAppsFirstCatalogLoaded",{bFirstCatalogLoadedEvent:true});this.bFirstCatalogLoaded=true}this.iNumberOfProviders+=1}}.bind(this));return this._oAddCatalogToModelPromise};a.prototype._onGetCatalogsFail=function(t){return sap.ushell.Container.getServiceAsync("Message").then(function(e){e.info(t)})};a.prototype._onDoneLoadingCatalogs=function(){var t=this.oModel.getProperty("/AppsData");t.sort(function(t,e){var i=t.title.toUpperCase();var a=e.title.toUpperCase();if(i<a){return-1}if(i>a){return 1}return 0});this.oModel.setProperty("/AppsData",t);var e=sap.ui.getCore().getEventBus();if(!this.bFirstCatalogLoaded){e.publish("launchpad","allMyAppsNoCatalogsLoaded")}};a.prototype._getAppEntityFromTile=function(t){return sap.ushell.Container.getServiceAsync("LaunchPage").then(function(e){var i;var a=e.getCatalogTilePreviewTitle(t);var r=e.getCatalogTilePreviewSubtitle(t);var s=e.getCatalogTileTargetURL(t);if(s&&(a||r)){i={};i.url=s;if(a){i.title=a;i.subTitle=r}else{i.title=r}return i}})};return new a},true);
//# sourceMappingURL=AllMyAppsManager.js.map
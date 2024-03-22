//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/EventHub","sap/ushell/Config","sap/ushell/utils/HttpClient","sap/base/util/ObjectPath","sap/ui/core/Configuration"],function(e,r,t,a,n){"use strict";var s={};var i="/UI2/Fiori2LaunchpadHome";s.getData=function(){if(!this.oPageSetPromise){this.oPageSetPromise=new Promise(function(e,r){var s="PageSets('%2FUI2%2FFiori2LaunchpadHome')"+"?$expand=Pages/PageChipInstances/ChipInstanceBags/ChipInstanceProperties,"+"Pages/PageChipInstances/Chip"+"&$format=json";var i={"Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache",Expires:"0","Accept-Language":n.getLanguage()||"",Accept:"application/json, text/plain"};var o=sap.ushell.Container.getUser().getLanguage();if(o){i["sap-language"]=o}var u=sap.ushell.Container.getLogonSystem();var c=u&&u.getClient();if(c){i["sap-client"]=c}var l=window["sap-ushell-config"].services&&window["sap-ushell-config"].services.PageBuilding||{};var p=(a.get("config.services.pageBuilding.baseUrl",l.adapter)||"").replace(/\/?$/,"/");var d=new t(p,{headers:i});d.get(s).then(function(r){e(this.parseData.bind(this)(r))}.bind(this)).catch(r)}.bind(this))}return this.oPageSetPromise};s.isImportEnabled=function(){return sap.ushell.Container.getServiceAsync("UserInfo").then(function(e){var r=e.getUser();var t=r.getImportBookmarksFlag();switch(t){case"done":case"dismissed":case"not_required":return false;case null:return this.getData().then(function(t){var a=!!t.length;var n=a?"pending":"not_required";r.setImportBookmarksFlag(n);e.updateUserPreferences();r.resetChangedProperty("importBookmarks");return a});default:return true}}.bind(this))};s.parseData=function(e){try{var t=JSON.parse(e.responseText);if(t&&t.d){t=t.d}var a=t.configuration&&JSON.parse(t.configuration)||{};var n=a.hiddenGroups||[];var s=t.Pages.results.filter(function(e){var r=e.scope==="PERSONALIZATION";var t=e.PageChipInstances.results.length>0;var a=n.indexOf(e.id)===-1;return r&&t&&a});var o=a.order||[];s.sort(function(e,r){if(o.indexOf(e.id)>o.indexOf(r.id)){return 1}if(o.indexOf(e.id)<o.indexOf(r.id)){return-1}return 0});var u=[];var c;var l=[];s.forEach(function(e){var r;if(e.layout){r=JSON.parse(e.layout)}var t={id:e.id,title:e.title,isLocked:e.isPersLocked==="X",isDefault:e.id===i,tileOrder:r&&r.order||[],linkOrder:r&&r.linkOrder||[],chips:e.PageChipInstances.results};if(t.isLocked){u.push(t)}else if(t.isDefault){c=t}else{l.push(t)}});if(!r.last("/core/home/disableSortedLockedGroups")){u.sort(function(e,r){return e.title.toLowerCase()<r.title.toLowerCase()?-1:1})}if(c){u=u.concat(c)}return u.concat(l)}catch(e){return null}};s.setImportEnabled=function(r){e.emit("importBookmarksFlag",!!r);sap.ushell.Container.getServiceAsync("UserInfo").then(function(e){var t=e.getUser();var a=r?null:"dismissed";t.setImportBookmarksFlag(a);e.updateUserPreferences();t.resetChangedProperty("importBookmarks")})};return s});
//# sourceMappingURL=MyHomeImport.js.map
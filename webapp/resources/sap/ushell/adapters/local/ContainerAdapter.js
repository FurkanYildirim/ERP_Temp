// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/base/util/ObjectPath","sap/ui/core/Configuration","sap/ui/thirdparty/jquery","sap/ushell/System","sap/ushell/User","sap/ushell/utils"],function(e,t,s,jQuery,r,a,i){"use strict";var o=function(o,n,l){var u;var f=t.create("config",l);var c={id:"DEFAULT_USER",firstName:"Default",lastName:"User",fullName:"Default User",accessibility:false,isJamActive:false,language:s.getLanguage()||"en",bootTheme:{theme:"sap_fiori_3",root:""},themeRoot:"/sap/public/bc/themes/",setAccessibilityPermitted:true,setThemePermitted:true,isLanguagePersonalized:false,setContentDensityPermitted:true,trackUsageAnalytics:null};for(var p in f){if(f.hasOwnProperty(p)){c[p]=f[p]}}o=new r({alias:o.getAlias(),platform:o.getPlatform(),productName:t.get("systemProperties.productName",f),productVersion:t.get("systemProperties.productVersion",f),systemName:t.get("systemProperties.systemName",f),systemRole:t.get("systemProperties.systemRole",f),tenantRole:t.get("systemProperties.tenantRole",f)});this.getSystem=function(){return o};this.getUser=function(){return u};this.sessionKeepAlive=function(){console.warn("Demo container adapter sessionKeepAlive called")};this.load=function(){var e=new jQuery.Deferred;if(f&&typeof f.setUserCallback==="string"){var s=new jQuery.Deferred;var r=f.setUserCallback.split(".");var o=r.pop();var n;if(r.length===0){n=window}else{n=t.get(r.join("."))}if(n&&typeof n[o]==="function"){n[o](s)}else{throw new i.Error("ContainerAdapter local platform: Cannot execute setUserCallback - "+f.setUserCallback)}s.done(function(t){["id","firstName","lastName","fullName"].forEach(function(e){if(t[e]&&typeof f.setUserCallback!=="function"){c[e]=t[e]}});u=new a(c);e.resolve()})}else{u=new a(c);e.resolve()}return e.promise()};this.logout=function(t){e.info("Demo system logged out: "+o.getAlias(),null,"sap.ushell.adapters.local.ContainerAdapter");i.reload();return(new jQuery.Deferred).resolve().promise()}};return o},false);
//# sourceMappingURL=ContainerAdapter.js.map
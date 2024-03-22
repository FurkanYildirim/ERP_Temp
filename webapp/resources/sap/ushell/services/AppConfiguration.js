// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/i18n/ResourceBundle","sap/base/Log","sap/base/util/ObjectPath","sap/m/library","sap/ui/core/Configuration","sap/ui/core/IconPool","sap/ui/thirdparty/hasher","sap/ui/thirdparty/jquery","sap/ui/util/Mobile","sap/ushell/EventHub","sap/ushell/resources","sap/ushell/utils/UrlParsing","sap/ushell/utils"],function(t,e,n,i,a,r,s,jQuery,o,u,p,c,l){"use strict";var f=i.ButtonType;function h(){var i={},h=true,g=null,m=[],d=[];u.on("AppRendered").do(y.bind(this));function y(){h=false;while(d.length>0){d.shift()()}}this.addActivity=function(t){var e=new jQuery.Deferred;sap.ushell.Container.getServiceAsync("UserRecents").then(function(n){n.addActivity(t).done(e.resolve).fail(e.reject)}).catch(e.reject);return e.promise()};this.setApplicationInInitMode=function(){h=true};this.getApplicationRequestQueue=function(){return d};this.getCurrentApplication=function(){return g};this.getCurrentAppliction=this.getCurrentApplication;this.getMetadata=function(t){if(!t){t=g}if(t){var e=s&&s.getHash?s.getHash():"";var n=this._getMemoizationKey(e);return this._getMetadata(t,n)}return{}};this._getMemoizationKey=function(t){var e=t.split("?");var n=e[0];var i=e[1];i=this._processParams(i);if(i){return n+i}var a=c.parseShellHash(t);n=a?a.semanticObject+"-"+a.action:"";return n};this._processParams=function(t){if(t){var e="";var n={};t.split("&").forEach(function(t){var e=t.split("=");n[e[0]]=e[1]});var i=Object.keys(n).sort();var a="";i.forEach(function(t,i){e=i?"&":"?";a+=e+t+"="+n[t]});return a}return""};this._getMetadata=function(t,e){if(!i.hasOwnProperty(e)||!i[e].complete){this.addMetadata(t,e)}if(!i[e]){i[e]={complete:false}}if(!i[e].title){i[e].title=t.text||p.i18n.getText("default_app_title")}return i[e]};this.setCurrentApplication=function(t){g=t;d.splice(0)};this.setHeaderHiding=function(){e.warning("Application configuration headerHiding property is deprecated and has no effect")};this.addApplicationSettingsButtons=function(t){if(h){d.push(function(){I(t)})}else{I(t)}};function I(t){var e,n=[],i=sap.ushell.Container.getRenderer("fiori2");for(e=0;e<t.length;e++){var a=t[e];n.push(a.getId());a.setIcon(a.getIcon()||r.getIconURI("customize"));if(p.i18n.getText("userSettings")===a.getProperty("text")){a.setProperty("text",p.i18n.getText("userAppSettings"))}a.setType(f.Unstyled)}if(sap.ushell.Container&&i){if(m.length){i.hideActionButton(m,true)}m=n;i.showActionButton(n,true,undefined,true)}}this.setWindowTitle=function(t){window.document.title=t};this.setIcons=function(t){o.setIcons(t)};this.setApplicationFullWidth=function(t){u.emit("setApplicationFullWidth",{bValue:t,date:Date.now()})};this.getApplicationName=function(t){var e,n=t&&t.additionalInformation||null;if(n){e=/^SAPUI5\.Component=(.+)$/i.exec(n);if(e){return e[1]}}return null};this.getApplicationUrl=function(t){var e=t&&t.url||null,n="P_TCODE",i;if(e){if(t.applicationType==="NWBC"&&e.indexOf(n)){return e}i=e.indexOf("?");if(i>=0){e=e.slice(0,i)}if(e.slice(-1)!=="/"){e+="/"}}return e};this.getPropertyValueFromConfig=function(t,e,n){var i;if(n&&t.hasOwnProperty(e+"Resource")){i=n.getText(t[e+"Resource"])}else if(t.hasOwnProperty(e)){i=t[e]}return i};this.getPropertyValueFromManifest=function(t,e,i){var a=e[i].manifestEntryKey,r=e[i].path,s=t.getManifestEntry(a);return n.get(r||"",s)};this.addMetadata=function(n,r){try{var s=this.getApplicationName(n),o=this.getApplicationUrl(n),u,p,c={fullWidth:{manifestEntryKey:"sap.ui",path:"fullWidth"},hideLightBackground:{manifestEntryKey:"sap.ui",path:"hideLightBackground"},title:{manifestEntryKey:"sap.app",path:"title"},icon:{manifestEntryKey:"sap.ui",path:"icons.icon"},favIcon:{manifestEntryKey:"sap.ui",path:"icons.favIcon"},homeScreenIconPhone:{manifestEntryKey:"sap.ui",path:"icons.phone"},"homeScreenIconPhone@2":{manifestEntryKey:"sap.ui",path:"icons.phone@2"},homeScreenIconTablet:{manifestEntryKey:"sap.ui",path:"icons.tablet"},"homeScreenIconTablet@2":{manifestEntryKey:"sap.ui",path:"icons.tablet@2"},startupImage320x460:{manifestEntryKey:"sap.ui",path:"icons.startupImage640x920"},startupImage640x920:{manifestEntryKey:"sap.ui",path:"icons.startupImage640x920"},startupImage640x1096:{manifestEntryKey:"sap.ui",path:"icons.startupImage640x1096"},startupImage768x1004:{manifestEntryKey:"sap.ui",path:"icons.startupImage768x1004"},startupImage748x1024:{manifestEntryKey:"sap.ui",path:"icons.startupImage748x1024"},startupImage1536x2008:{manifestEntryKey:"sap.ui",path:"icons.startupImage1536x2008"},startupImage1496x2048:{manifestEntryKey:"sap.ui",path:"icons.startupImage1496x2048"},compactContentDensity:{manifestEntryKey:"sap.ui5",path:"contentDensities.compact"},cozyContentDensity:{manifestEntryKey:"sap.ui5",path:"contentDensities.cozy"}},f,h,g,m,d,y,I,x=n&&n.componentHandle;if(r){if(!i.hasOwnProperty(r)){i[r]={complete:false}}if(!i[r].complete){if(x){u=x.getMetadata()}else if(s){e.warning("No component handle available for '"+s+"'; SAPUI5 component metadata is incomplete",null,"sap.ushell.services.AppConfiguration");return}if(u){p=u.getConfig();m=u.getManifest()!==undefined;i[r].complete=true;if(p){y=p.resourceBundle||"";if(y){if(y.slice(0,1)!=="/"){y=o+y}I=t.create({url:y,locale:a.getLanguage()})}}for(d in c){if(c.hasOwnProperty(d)){if(m){i[r][d]=this.getPropertyValueFromManifest(u,c,d)}if(p&&i[r][d]===undefined){i[r][d]=this.getPropertyValueFromConfig(p,d,I)}}}i[r].version=u.getVersion();i[r].technicalName=u.getComponentName()}else if(l.isApplicationTypeEmbeddedInIframe(n.applicationType)){var v="/~canvas;window=app/wda/",b=n.url.indexOf(v),E="/sap/bc/webdynpro/sap/",A="/bc/gui/sap/its/webgui",w=n.url.indexOf(A);if(b>=0){i[r].technicalName=n.url.substring(b+v.length,n.url.indexOf("/",b+v.length))}if(n.url.indexOf(E)>=0){i[r].technicalName=new RegExp(E+"(.*)[?]").exec(n.url)[1]}i[r].complete=true;if(w>=0){var P="etransaction=",C=n.url.indexOf(P,w+A.length),K=n.url.indexOf("&",C),O=K>=0?K:n.url.length;i[r].technicalName=decodeURIComponent(n.url.substring(C+P.length,O))+" (TCODE)"}}else{e.warning("No technical information for the given application could be determined",null,"sap.ushell.services.AppConfiguration")}}f=["favIcon","homeScreenIconPhone","homeScreenIconPhone@2","homeScreenIconTablet","homeScreenIconTablet@2","startupImage320x460","startupImage640x920","startupImage640x1096","startupImage768x1004","startupImage748x1024","startupImage1536x2008","startupImage1496x2048"];h=o&&o[o.length-1]==="/"?o.substring(0,o.length-1):o;g=function(t){if(t.match(/^https?:\/\/.*/)){return false}return t&&t[0]!=="/"};f.forEach(function(t){var e=i[r][t],n=null;if(e){n=g(e)?h+"/"+e:e}i[r][t]=n})}}catch(t){e.warning("Application configuration could not be parsed")}}}return new h},true);
//# sourceMappingURL=AppConfiguration.js.map
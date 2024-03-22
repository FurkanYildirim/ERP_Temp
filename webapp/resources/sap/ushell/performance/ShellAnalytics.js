// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/EventHub","sap/ushell/services/AppConfiguration","sap/ushell/performance/StatisticalRecord","sap/ushell/utils","sap/ushell/Config"],function(e,n,t,a,i){"use strict";var r=[],o=[],s,c,u,l=false,p=false;var h={dashboardTileClick:"HOMEPAGE_TILE",dashboardTileLinkClick:"HOMEPAGE_LINK",catalogTileClick:"FINDER_TILE"};var f={EXPLACE:"EXPLACE",INPLACE:"INPLACE"};var d={"sap.ushell.components.appfinder":"FLP_FINDER","sap.ushell.components.pages":"FLP_PAGE","sap.ushell.components.homepage":"FLP_HOME"};var g=["dashboardTileClick","dashboardTileLinkClick","catalogTileClick"];function C(){return sap.ui.getCore().getEventBus()}function v(e,n){if(n){return true}return e&&(e==="FLP_HOME"||e==="FLP_PAGE")}function m(){return r}function E(){var e=m().filter(function(e){return e.isClosed()});if(e.length>0){return e[e.length-1]}return null}function A(e){if(!e){return m()}return m().filter(function(n){return e.getTimeStart()<n.getTimeStart()&&n.isClosed()})}function I(){return c}function P(e){c=e}function T(){u=performance.now();a.setPerformanceMark("FLP -- change hash")}function L(){if(!s){s=new t;r.push(s)}return s}function H(e,n){L().setTrigger(h[n])}function N(e){L().setTargetHash(e);L().setTimeStart(u||performance.now())}function R(e){var n=e||"";if(n.slice(-7)==="(TCODE)"){return n.replace(/ .*/,"").replace(/^\*/,"").substring(0,15).concat(" (TR)")}return n}function y(e){var n="";var t=e&&e.componentInstance&&e.componentInstance.getManifest();if(t&&t["sap.app"]&&t["sap.app"].id){n=t["sap.app"].id}return n}function S(){return sap.ushell.Container.getServiceAsync("AppLifeCycle").then(function(e){var t=e.getCurrentApplication();if(!t){return{}}var a=t&&t.componentInstance&&t.componentInstance.sId&&t.componentInstance.sId.includes("homeApp-component");var i;if(t.getTechnicalParameter){i=t.getTechnicalParameter("sap-fiori-id")}else{i=Promise.resolve([])}return i.then(function(e){var i=e&&e[0];if(a){return{type:"UI5",id:i,isHomeApp:true}}if(t.homePage){var r=d[y(t)]||"FLP_HOME";return{type:"UI5",id:r}}if(t.applicationType==="UI5"){if(!i){i=y(t);i=d[i]||i}i=i.replace(/,/g,"");return{type:"UI5",id:i}}var o=n.getMetadata().technicalName||n.getCurrentApplication().text||t.applicationType;var s=R(o.replace(/,/g,""));return{type:t.applicationType,id:s}})})}function b(e,n,t){if(s){var a=n?n.id:null;s.setSourceApplication(e);s.setTargetApplication(a);s.setApplicationType(n?n.type:null);s.setNavigationMode(t);s.setIsHomeApp(n&&n.isHomeApp);if(!l&&v(a,n&&n.isHomeApp)){l=true;s.setHomepageLoading(true)}s.closeRecord();s=null}}function k(e){if(!s){return}S().then(function(n){var t=I();if(e&&e.technicalName){n.id=R(e.technicalName);n.type=n.id.slice(-4)==="(TR)"?"GUI":"NWBC"}P(n);b(t?t.id:undefined,n,f.INPLACE)})}function F(){var e=I();b(e?e.id:undefined,null,f.EXPLACE)}function M(){if(s){var e=I();s.setSourceApplication(e?e.id:undefined);s.closeRecordWithError();s=null}}function _(){sap.ushell.Container.getServiceAsync("ShellNavigation").then(function(e){e.hashChanger.attachEvent("hashChanged",T);e.hashChanger.attachEvent("shellHashChanged",T)})}function O(){sap.ushell.Container.getServiceAsync("ShellNavigation").then(function(e){e.hashChanger.detachEvent("hashChanged",T);e.hashChanger.detachEvent("shellHashChanged",T)})}function w(){if(p){return}p=true;g.forEach(function(e){C().subscribe("launchpad",e,H)});var n;n=e.once("ShellNavigationInitialized").do(_);o.push(n);n=e.on("trackHashChange").do(N);o.push(n);n=e.on("AppRendered").do(k);o.push(n);n=e.on("CustomHomeRendered").do(k);o.push(n);n=e.on("openedAppInNewWindow").do(F);o.push(n);n=e.on("firstSegmentCompleteLoaded").do(k);o.push(n);n=e.on("doHashChangeError").do(M);o.push(n);n=e.on("PagesRuntimeRendered").do(k);o.push(n);n=e.on("CloseFesrRecord").do(k);o.push(n)}function G(){if(!p){return}g.forEach(function(e){C().unsubscribe("launchpad",e,H)});o.forEach(function(e){e.off()});O();P(null);r=[];s=null;p=false}return{enable:w,disable:G,getAllRecords:m,getCurrentApplication:I,getLastClosedRecord:E,getNextNavigationRecords:A}},false);
//# sourceMappingURL=ShellAnalytics.js.map
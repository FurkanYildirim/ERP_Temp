/*!
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/ui/core/UIComponent","sap/ui/generic/app/navigation/service/NavigationHandler","sap/zen/dsh/Dsh"],function(t,a,e,r){"use strict";return a.extend("sap.zen.dsh.fioriwrapper.Component",{metadata:{manifest:"json"},createContent:function(){function a(t,a,e){if(Array.isArray(t)){for(var r in t){a[t[r]]=e}}else{a[t]=e}}var s=null;var n=true;sap.zen.dsh.scriptLoaded=true;var i=this.getMetadata().getConfig();var p={};var o={};var m={};if(i){if(i&&i.semanticObjectMappings){p=i.semanticObjectMappings;o={};for(var P in p){if(Object.prototype.hasOwnProperty.call(p,P)){a(p[P],o,P)}}}}var u="";if(i&&i.appName){u=i.appName}if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.appName){u=this.getComponentData().startupParameters.appName}var f="0ANALYSIS";if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XTEMPLATE){f=this.getComponentData().startupParameters.XTEMPLATE[0]}var h="";if(i&&i.systemAlias){h=i.systemAlias}if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XSYSTEM){h=this.getComponentData().startupParameters.XSYSTEM[0]}if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters["sap-system"]){h=this.getComponentData().startupParameters["sap-system"][0]}t.info("Unused appname: "+u);var C="";if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XQUERY){C=this.getComponentData().startupParameters.XQUERY[0]}var g="";if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XTITLE){g=this.getComponentData().startupParameters.XTITLE[0]}var D="";if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XBOOKMARKID){D=this.getComponentData().startupParameters.XBOOKMARKID[0]}var A="";if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XVISIBLEPROMPTS){A=this.getComponentData().startupParameters.XVISIBLEPROMPTS[0]}var S="";if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XDISPLAY){S=this.getComponentData().startupParameters.XDISPLAY[0]}var c="";if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XCHART_TYPE){c=this.getComponentData().startupParameters.XCHART_TYPE[0]}var T="";if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XDATALIMIT_ROWS){T=this.getComponentData().startupParameters.XDATALIMIT_ROWS[0]}var l="";if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XDATALIMIT_COLS){l=this.getComponentData().startupParameters.XDATALIMIT_COLS[0]}var d="";if(i.navigationSourceObjects){d=i.navigationSourceObjects}if(this.getComponentData().startupParameters&&this.getComponentData().startupParameters.XSEMANTIC_OBJECTS){d=this.getComponentData().startupParameters.XSEMANTIC_OBJECTS[0].split(",")}function I(){s=new r({id:"dsh_"+C.replace(/\W/g,""),height:"100%",width:"100%",deployment:"bw",dshAppName:f,repoPath:i.repoPath||"",semanticMappings:p,appComponent:this,systemAlias:h,deferCreation:n});if(C){s.addParameter("XQUERY",C)}if(g){s.addParameter("XTITLE",g)}if(D){s.addParameter("XBOOKMARKID",D)}if(A){s.addParameter("XVISIBLEPROMPTS",A)}if(S){s.addParameter("XDISPLAY",S)}if(c){s.addParameter("XCHART_TYPE",c)}if(T){s.addParameter("XDATALIMIT_ROWS",T)}if(l){s.addParameter("XDATALIMIT_COLS",l)}if(d){s.addParameter("NAV_SOURCES",JSON.stringify(d))}if(o){s.addParameter("NAV_SEMANTIC_MAPPINGS",JSON.stringify(o))}var t={};s.addParameter("NAV_PARAM_RULES",JSON.stringify(t))}var X=this;var O={};var E=new e(this);var v=E.parseNavigation();v.done(function(a,e,r){if(!s){I.call(X)}if(r!==sap.ui.generic.app.navigation.service.NavType.initial){if(a&&a.bNavSelVarHasDefaultsOnly){s.addParameter("XPROMPT","true")}if(typeof s.initializeAppStateData!=="function"){O._sData=a.selectionVariant;O.getData=function(){var a=undefined;if(this._sData===undefined||this._sData===""){return undefined}try{a=JSON.parse(this._sData)}catch(a){t.error(a)}return{selectionVariant:a}}}}if(typeof s.initializeAppStateData==="function"){s.initializeAppStateData.call(s,a,m)}else{s.initializeAppState.call(s,O,m)}if(n){s.createPage()}});v.fail(function(e){t.error(e);if(!s){n=true;I.call(X)}if(X.getComponentData().startupParameters){for(var r in X.getComponentData().startupParameters){if(Object.prototype.hasOwnProperty.call(X.getComponentData().startupParameters,r)&&r!=="newBW"&&r!="XTEMPLATE"&&r!="XSEMANTIC_OBJECTS"&&r!="XQUERY"&&r!="XBOOKMARKID"&&r!="XVISIBLEPROMPTS"&&r!="XACH_COMPONENT"&&r!="XSYSTEM"&&r!="XTITLE"&&r!="XDISPLAY"&&r!="XCHART_TYPE"&&r!="XDATALIMIT_ROWS"&&r!="XDATALIMIT_COLS"){var i=X.getComponentData().startupParameters[r][0];s.addParameter(r,i);if(p&&Object.prototype.hasOwnProperty.call(p,r)){a(p[r],m,i)}else{m[r]=i}}}}sap.ushell.Container.getService("CrossApplicationNavigation").getStartupAppState(X).always(function(t){s.initializeAppState.call(s,t,m);s.createPage()})});if(!s){n=true;I.call(X)}return s},init:function(){this.sAchComponent=null;this.oSapAppManifestEntry=this.getManifestEntry("sap.app");a.prototype.init.apply(this,arguments)},getManifestEntry:function(t){if(t==="/sap.app/ach"&&this.sAchComponent){return this.sAchComponent}else if(t==="sap.app"&&this.sAchComponent&&this.oSapAppManifestEntry){return this.oSapAppManifestEntry}else{return a.prototype.getManifestEntry.apply(this,arguments)}}})});
//# sourceMappingURL=Component.js.map
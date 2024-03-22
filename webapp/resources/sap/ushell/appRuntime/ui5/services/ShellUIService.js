// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/service/ServiceFactoryRegistry","sap/ui/core/service/ServiceFactory","sap/ui/core/service/Service","../../../ui5service/_ShellUIService/shelluiservice.class.factory","sap/ushell/appRuntime/ui5/AppRuntimePostMessageAPI","sap/ushell/appRuntime/ui5/AppRuntimeService","sap/ushell/appRuntime/ui5/AppRuntimeContext","sap/ui/thirdparty/jquery","sap/ushell/utils/UrlParsing","sap/ushell/utils/clone"],function(e,t,s,i,a,r,n,jQuery,l,c){"use strict";var u=i({serviceRegistry:e,serviceFactory:t,service:s});var o,p=false,h;var v=u.extend("sap.ushell.appRuntime.services.ShellUIService",{setTitle:function(e){o=e;return r.sendMessageToOuterShell("sap.ushell.services.ShellUIService.setTitle",{sTitle:e})},getTitle:function(){return o},setHierarchy:function(e){var t=function(e){r.sendMessageToOuterShell("sap.ushell.services.ShellUIService.setHierarchy",{aHierarchyLevels:e})};if(n.getIsScube()===true&&Array.isArray(e)&&e.length>0){f(e).then(function(e){t(e)});return}t(e)},setRelatedApps:function(e){var t=function(e){r.sendMessageToOuterShell("sap.ushell.services.ShellUIService.setRelatedApps",{aRelatedApps:e})};if(n.getIsScube()===true&&Array.isArray(e)&&e.length>0){f(e).then(function(e){t(e)});return}t(e)},setBackNavigation:function(e){if(!p){p=true;a.registerCommHandlers({"sap.ushell.appRuntime":{oServiceCalls:{handleBackNavigation:{executeServiceCallFn:function(e){if(h){h()}else if(n.checkDataLossAndContinue()){window.history.back()}return(new jQuery.Deferred).resolve().promise()}}}}})}h=e;r.sendMessageToOuterShell("sap.ushell.ui5service.ShellUIService.setBackNavigation",{callbackMessage:{service:"sap.ushell.appRuntime.handleBackNavigation"}})},_getBackNavigationCallback:function(){return h},_resetBackNavigationCallback:function(){this.setBackNavigation()}});function f(e){return new Promise(function(t){var s=c(e);var i=[];var a;i=s.map(function(e){return{target:{shellHash:e.intent}}});sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(e){e.isNavigationSupported(i,undefined,true).then(function(e){for(var i=0;i<e.length;i++){if(!e[i].supported){a=l.parseShellHash(s[i].intent);a.params["sap-shell-so"]=a.semanticObject;a.params["sap-shell-action"]=a.action;a.params["sap-remote-system"]=n.getRemoteSystemId();a.semanticObject="Shell";a.action="startIntent";s[i].intent="#"+l.constructShellHash(a)}}t(s)})})})}return v});
//# sourceMappingURL=ShellUIService.js.map
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/NavTargetResolution","sap/ushell/appRuntime/ui5/AppRuntimeService","sap/ushell/appRuntime/ui5/AppRuntimeContext","sap/ui/thirdparty/jquery"],function(e,t,s,jQuery){"use strict";function n(n,r,i,a){e.call(this,n,r,i,a);this.getDistinctSemanticObjectsLocal=this.getDistinctSemanticObjects;this.getDistinctSemanticObjects=function(){var e=new jQuery.Deferred,n=[],r;n.push(s.getIsScube()?this.getDistinctSemanticObjectsLocal():Promise.resolve([]));n.push(t.sendMessageToOuterShell("sap.ushell.services.NavTargetResolution.getDistinctSemanticObjects"));Promise.allSettled(n).then(function(t){r=t[0].status==="fulfilled"?t[0].value:[];r=r.concat(t[1].status==="fulfilled"?t[1].value:[]);r=r.filter(function(e,t,s){return s.indexOf(e)==t}).sort();e.resolve(r)});return e.promise()};this.expandCompactHash=function(e){if(e&&e.indexOf("sap-intent-param")>0){return t.sendMessageToOuterShell("sap.ushell.services.NavTargetResolution.expandCompactHash",{sHashFragment:e})}return(new jQuery.Deferred).resolve(e).promise()};this.resolveHashFragmentLocal=this.resolveHashFragment;this.resolveHashFragment=function(e){if(s.getIsScube()){var n=new jQuery.Deferred;this.resolveHashFragmentLocal(e).done(n.resolve).fail(function(){return t.sendMessageToOuterShell("sap.ushell.services.NavTargetResolution.resolveHashFragment",{sHashFragment:e}).done(n.resolve).fail(n.reject)});return n.promise()}else{return t.sendMessageToOuterShell("sap.ushell.services.NavTargetResolution.resolveHashFragment",{sHashFragment:e})}};this.isIntentSupportedLocal=this.isIntentSupported;this.isIntentSupported=function(e){var n=new jQuery.Deferred,r=[],i,a;r.push(s.getIsScube()?this.isIntentSupportedLocal(e):Promise.resolve(undefined));r.push(t.sendMessageToOuterShell("sap.ushell.services.NavTargetResolution.isIntentSupported",{aIntents:e}));Promise.allSettled(r).then(function(t){i=t[0].status==="fulfilled"?t[0].value:undefined;a=t[1].status==="fulfilled"?t[1].value:undefined;if(i&&a){Object.keys(i).forEach(function(e){i[e].supported=i[e].supported||a[e].supported})}else if(i||a){i=i||a}else{i={};e.forEach(function(e){i[e]={supported:undefined}})}n.resolve(i)});return n.promise()}}n.prototype=e.prototype;n.hasNoAdapter=e.hasNoAdapter;return n},true);
//# sourceMappingURL=NavTargetResolution.js.map
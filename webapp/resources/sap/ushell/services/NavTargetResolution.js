// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/services/AppConfiguration","sap/ushell/utils","sap/ushell/utils/UrlParsing","sap/ushell/utils/UrlShortening","sap/ushell/utils/HttpClient","sap/ushell/navigationMode","sap/ui/thirdparty/jquery","sap/ui/performance/Measurement","sap/base/util/deepExtend","sap/base/util/isPlainObject","sap/base/Log"],function(e,t,n,i,r,a,jQuery,s,o,l,u){"use strict";function c(c,p,f,h){var d=h&&h.config,g=function(e){var t=this._isClientSideTargetResolutionEnabled()?this._resolveHashFragmentClientSide(e):c.resolveHashFragment(e);return t}.bind(this),v,m=[{name:"DefaultAdapter",isApplicable:function(){return true},resolveHashFragment:g.bind(this)}],S;var b=new r;this._isClientSideTargetResolutionEnabled=function(){return!!(d&&d.enableClientSideTargetResolution)};this._nextResolveHashFragment=function(e,t){var n=e.pop();if(n.isApplicable(t)){u.info("NavTargetResolution: custom resolver "+n.name+" resolves "+t);var i=this._nextResolveHashFragment.bind(this,e);return n.resolveHashFragment(t,i)}return this._nextResolveHashFragment(e,t)};this._resolveHashFragmentClientSide=function(e){var t=this._validateHashFragment(e),n;if(!t.success){return(new jQuery.Deferred).reject(e+" is not a valid hash fragment").promise()}n=t.hashFragmentWithoutHash;return this._resolveHashFragmentClientSideAndFixApplicationType(n)};this._resolveHashFragmentClientSideAndFixApplicationType=function(e){var t=new jQuery.Deferred;sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(n){n.resolveHashFragment(e).done(function(e){if(e&&e.applicationType==="SAPUI5"){e.applicationType="URL"}t.resolve(e)}).fail(t.reject)}).catch(t.reject);return t.promise()};this._validateHashFragment=function(e){var n="",i={success:false};if(e&&e.charAt(0)!=="#"){throw new t.Error("Hash fragment expected in _validateHashFragment","sap.ushell.services.NavTargetResolution")}n=e.substring(1);if(n){i.success=true}i.hashFragmentWithoutHash=n;return i};this.expandCompactHash=function(e){var t,r=new jQuery.Deferred;t=n.parseShellHash(e);if(t&&t.params&&t.params["sap-intent-param"]){sap.ushell.Container.getServiceAsync("AppState").then(function(n){n.getAppState(t.params["sap-intent-param"][0]).done(function(t){var n=t.getData("sap-intent-param");var a=e;if(n){a=i.expandParamGivenRetrievalFunction(e,"sap-intent-param",function(){return n})}r.resolve(a)}).fail(function(){r.resolve(e)})}).catch(r.reject)}else{r.resolve(e)}return r.promise()};var R=["NWBC","WDA","TR"];this._adjustResolutionResultForUi5Components=function(e){var t,n;if(typeof e!=="object"){return}delete e["sap.platform.runtime"];if(e&&e.applicationType&&e.applicationType==="SAPUI5"){e.applicationType="URL"}if(e.applicationType==="URL"){t=/^SAPUI5\.Component=(.*)/.exec(e.additionalInformation);n=t&&t[1];if(n){e.ui5ComponentName=n}}};this._getSapSystem=function(e,t){var n;if(t&&t["sap-system"]){return t["sap-system"]}if(t&&t.url){n=new URL(t.url,window.location.href).searchParams.get("sap-system");if(n){return n}}if(R.indexOf(t.applicationType)>=0&&e&&e.substring(1)){n=new URL(e.substring(1),window.location.href).searchParams.get("sap-system");if(n){return n}}return undefined};this.resolveTarget=function(e){var i;var r=o({},e);var a=new jQuery.Deferred;s.average("sap.ushell.navigation.resolveTarget");t.storeSapSystemToLocalStorage(r);i=n.constructShellHash(r);sap.ushell.Container.getServiceAsync("NavTargetResolution").then(function(e){e.resolveHashFragment("#"+i).done(function(e){s.end("sap.ushell.navigation.resolveTarget");a.resolve({url:e.url,text:e.text,externalNavigationMode:e.targetNavigationMode==="explace"})}).fail(a.reject)}).catch(a.reject);return a.promise()};this.resolveHashFragment=function(t){var n=new jQuery.Deferred;s.average("sap.ushell.navigation.resolveHashFragment");this.expandCompactHash(t).done(function(i){var r=jQuery.when();if(i.indexOf("sap-ushell-enc-test")>=0){var o=/sap-ushell-enc-test=([^&]*)(&.*)?$/.exec(i);if(o){var u=o[1];if(u!=="A%20B%2520C"){r=new jQuery.Deferred;sap.ushell.Container.getServiceAsync("Message").then(function(e){e.error("This navigation is flagged as erroneous because"+" (likely the calling procedure) generated a wrong encoded hash."+" Please track down the encoding error and make sure to use the CrossApplicationNavigation service for navigation.","Navigation encoding wrong");r.resolve()}).catch(r.reject)}i=i.replace(/sap-ushell-enc-test=([^&]*)&/,"");i=i.replace(/[&?]sap-ushell-enc-test=([^&]*)$/,"")}}var p=this._invokeResolveHashChain(i);if(typeof c.processPostResolution==="function"){p=c.processPostResolution(i,p)}jQuery.when(p,r).done(function(i){this._adjustResolutionResultForUi5Components(i);if(l(i)){if(!i.hasOwnProperty("navigationMode")){i.navigationMode=a.getNavigationMode(i,e.getCurrentApplication())}i.targetNavigationMode=a.getExternalNavigationMode(i.navigationMode)}if(l(i)&&!i.hasOwnProperty("sap-system")){var r=this._getSapSystem(t,i);if(r){i["sap-system"]=r}}s.end("sap.ushell.navigation.resolveHashFragment");n.resolve(i)}.bind(this)).fail(n.reject)}.bind(this)).fail(n.reject);return n.promise().done(function(e){return this._recordNavigation("resolveHashFragment",{sHashFragment:t},e)}.bind(this))};this._invokeResolveHashChain=function(e){var t=m.map(function(e){return e});return this._nextResolveHashFragment(t,e).done(function(e){S=e})};this.baseResolveHashFragment=g.bind(this);this._getGetLinksResolver=function(e){var t;if(this._isClientSideTargetResolutionEnabled()){t=this._getLinksClientSide.bind(this);return{resolver:t,warning:undefined,isGetSemanticObjectLinksCall:false}}if(Object.prototype.toString.apply(e.paramsOptions)==="[object Array]"&&e.paramsOptions.length>0){u.warning("Parameter options supplied to #getLinks will be ignored because FLP is not configured to use sap.ushell.services.ClientSideTargetResolution for target resolution","provided parameters options: "+JSON.stringify(e.paramsOptions,null,4),"sap.ushell.services.NavTargetResolution")}t=c&&c.getLinks&&c.getLinks.bind(c);if(t){return{resolver:t,warning:undefined,isGetSemanticObjectLinksCall:false}}t=c&&c.getSemanticObjectLinks&&c.getSemanticObjectLinks.bind(c);if(t){return{resolver:t,warning:e.hasOwnProperty("action")?"the action argument was given, however, NavTargetResolutionAdapter does not implement getLinks method. Action will be ignored.":undefined,isGetSemanticObjectLinksCall:true}}return{resolver:undefined,warning:"Cannot determine resolver for getLinks method",isGetSemanticObjectLinksCall:undefined}};this.getLinks=function(e){var t=e.semanticObject;var n=e.params;var i=e.ignoreFormFactor;var r=e.ui5Component;var a=e.appStateKey;var s=e.compactIntents;var o=new jQuery.Deferred;if(/\?/.test(t)){throw new Error("Parameter must not be part of semantic object")}var l=n===undefined?undefined:JSON.parse(JSON.stringify(n));if(a){l=l||{};l["sap-xapp-state"]=encodeURIComponent(a)}var c=this._getGetLinksResolver(e);if(c.warning){u.warning("A problem occurred while determining the resolver for getLinks",c.warning,"sap.ushell.services.NavTargetResolution")}var p=c.resolver;if(p){var f=function(e){if(s){this._shortenGetSemanticObjectLinksResults(e,r).done(o.resolve)}else{o.resolve(e)}}.bind(this);if(c.isGetSemanticObjectLinksCall){var h={target:{semanticObject:t,action:"dummyAction"},params:l};sap.ushell.Container.getServiceAsync("ShellNavigation").then(function(e){e.hrefForExternal(h,true,r,true).done(function(e){var n=e.params||l;p(t,n,i).done(f).fail(o.reject)}).fail(o.reject)})}else{p(e).done(f).fail(o.reject)}}else{o.resolve([])}return o.promise().done(function(t){return this._recordNavigation("getLinks",{oArgs:e},t)}.bind(this))};this.getDistinctSemanticObjects=function(){var e=new jQuery.Deferred;if(this._isClientSideTargetResolutionEnabled()){sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(t){t.getDistinctSemanticObjects().done(e.resolve).fail(e.reject)}).catch(e.reject);return e.promise().done(function(e){return this._recordNavigation("getDistinctSemanticObjects",{},e)}.bind(this))}if(c&&c.getDistinctSemanticObjects){return c.getDistinctSemanticObjects.call(c)}u.error("Cannot execute getDistinctSemanticObjects method","ClientSideTargetResolution must be enabled or NavTargetResolutionAdapter must implement getDistinctSemanticObjects method","sap.ushell.services.NavTargetResolution");return e.reject("Cannot execute getDistinctSemanticObjects").promise()};this._getLinksClientSide=function(e){var t=new jQuery.Deferred;var i=new jQuery.Deferred;if((e.params||{}).hasOwnProperty("sap-intent-param")){var r="#"+e.semanticObject+"-dummyAction?"+n.paramsToString(e.params);this.expandCompactHash(r).done(function(e){var t=n.parseShellHash(e);i.resolve(t.params)}).fail(t.reject)}else{i.resolve(e.params)}i.done(function(){sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(n){n.getLinks(e).done(t.resolve).fail(t.reject)}).catch(t.reject)});return t.promise()};this._shortenGetSemanticObjectLinksResults=function(e,t){var i=[];var r=0;var a=e.length;var s=new jQuery.Deferred;sap.ushell.Container.getServiceAsync("ShellNavigation").then(function(o){e.forEach(function(e){var l=n.parseShellHash(e.intent);var c=o.compactParams(l.params,undefined,t);i.push(c);i[r].done(function(t,r){i[t]={text:e.text,intent:"#"+l.semanticObject+"-"+l.action+"?"+n.paramsToString(r)}}.bind(null,r)).fail(function(t,n){u.warning("Cannot shorten GetSemanticObjectLinks result, using expanded form","Failure message: "+n+"; intent had title ''"+e.title+"'' and link ''"+e.intent+"'","sap.ushell.services.NavTargetResolution");i[t]={text:e.text,intent:e.intent}}.bind(null,r)).always(function(){a--;if(a===0){s.resolve(i)}});r++})}).catch(s.reject);return s.promise()};this.isIntentSupported=function(e){var t={};var n=new jQuery.Deferred;if(this._isClientSideTargetResolutionEnabled()){sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(t){t.isIntentSupported(e).done(n.resolve).fail(n.reject)}).catch(n.reject);return n.promise()}if(c.isIntentSupported){return c.isIntentSupported(e)}e.forEach(function(e){t[e]={supported:undefined}});return n.resolve(t).promise()};this.isNavigationSupported=function(e){var t=new jQuery.Deferred,i=[];i=e.map(function(e){if(typeof e==="string"){return e}return"#"+n.constructShellHash(e)});this.isIntentSupported(i).done(function(e){var n=i.map(function(t){return e[t]||{supported:false}});t.resolve(n)}).fail(t.reject.bind(t));return t.promise().done(function(t){return this._recordNavigation("isNavigationSupported",{aIntents:e},t)}.bind(this))};this._recordNavigation=function(e,t,n){var i=d&&d.usageRecorder||{};if(i.enabled){var r=i.serviceUrl||"/navigation/api/v2/record";b.post(r,{headers:{"content-type":"application/json; charset=utf-8"},data:{function:e,parameters:JSON.stringify(t),result:JSON.stringify(n)}})}return n};this.registerCustomResolver=function(e){if(typeof e.name!=="string"){u.error("NavTargetResolution: Custom Resolver must have name {string} member");return false}if(typeof e.isApplicable!=="function"){u.error("NavTargetResolution: Custom Resolver must have isApplicable member");return false}if(typeof e.resolveHashFragment!=="function"){u.error('NavTargetResolution: Custom Resolver must have "resolveHashFragment" member');return false}m.push(e);return true};if(d&&Array.isArray(d.resolveLocal)){v=d.resolveLocal.map(function(e){return e.linkId});this.registerCustomResolver({name:"localResolveNavigationResolver",cleanHash:function(e){if(e===""){return"#"}var t=n.parseShellHash(e.substring(1));if(!t){return"#"}e="#"+t.semanticObject+"-"+t.action;return e},_getIndex:function(e){var t=this.cleanHash(e);return v.indexOf(t.substring(1))},isApplicable:function(e){return this._getIndex(e)>=0},resolveHashFragment:function(e){var t,i=this._getIndex(e),r,a,s,o;t=new jQuery.Deferred;r=JSON.parse(JSON.stringify(d.resolveLocal[i].resolveTo));a=n.parseShellHash(e);if(a&&a.params){o=n.paramsToString(a.params);if(o){s=r.url.indexOf("?")>=0;r.url=r.url+(s?"&":"?")+o}}t.resolve(r);return t.promise()}})}this.registerCustomResolver({name:"LocalResolver",aElement:undefined,cleanHash:function(e){if(e===""){return undefined}var t=n.parseShellHash(e.substring(1));if(!t){return undefined}e="#"+t.semanticObject+"-"+t.action;return e},isApplicable:function(e){e=this.cleanHash(e);if(!e){return false}return e==="#Test-url"||e==="#Test-local1"||e==="#Test-local2"||e==="#Test-config"||e==="#Test-clear"},parseUrl:function(e){if(!this.aElement){this.aElement=window.document.createElement("a")}this.aElement.href=e;return this.aElement},resolveHashFragment:function(e){var n=new jQuery.Deferred,i=null,r,a,s,o,l,c=this;e=this.cleanHash(e);if(!e){return false}i={"#Test-config":{applicationType:"URL",url:"/sap/bc/ui5_ui5/ui2/ushell/test-resources/sap/ushell/demoapps/FioriSandboxConfigApp",additionalInformation:"SAPUI5.Component=sap.ushell.demoapps.FioriSandboxConfigApp"},none:{applicationType:"URL",url:"",additionalInformation:""}};function p(e){if(localStorage){return localStorage[e]}return undefined}function f(e){if(t.calculateOrigin(c.parseUrl(e))!==t.calculateOrigin(window.location)){return undefined}return e}function h(e){return new URLSearchParams(window.location.search).get(e)}function g(e,t){if(localStorage){localStorage[e]=t}}if(i[e]){r=i[e]}else if(e==="#Test-clear"){g("sap.ushell.#Test-local1",undefined);g("sap.ushell.#Test-local2",undefined);u.info("NavTargetResolution: Local storage keys for #Test have been cleared");r=i["#Test-config"]}else if(e==="#Test-local1"||e==="#Test-local2"||e==="#Test-url"){r=p("sap.ushell."+e);if(!r||r==="undefined"){a={applicationType:"URL"}}else{a=JSON.parse(r)}if(window.location.hostname==="localhost"||d&&d.allowTestUrlComponentConfig){o="sap-ushell-test-"+e.substring(6);s=h(o+"-additionalInformation");if(s){a.additionalInformation=s}l=h(o+"-url");if(l){a.url=f(l)}}if(!a.url){u.info("NavTargetResolution: No configured app for "+e+" found ( local storage or url params sap-ushell-test-local1-url  sap-ushell-test-local1-additionalInfo  not supplied? ");u.info("NavTargetResolution: Defaulting to config app ...\n");n.reject("URL is not resolvable");return n.promise()}a.url=f(a.url);r=a}if(r.url===undefined){n.reject("URL is not resolvable");return n.promise()}u.info("NavTargetResolution: As URL:  http://localhost:8080/sap/bc/ui5_ui5/ui2/ushell/shells/abap/FioriLaunchpad.html?sap-ushell-test-local1-url="+encodeURIComponent(r&&r.url||"")+"&sap-ushell-test-local1-additionalInformation="+encodeURIComponent(r&&r.additionalInfo||"")+"#Test-local1");u.info("NavTargetResolution: Resolving "+e+" to "+JSON.stringify(r));n.resolve(r);return n.promise()}});this.getCurrentResolution=function(){return S}}c.hasNoAdapter=false;return c},true);
//# sourceMappingURL=NavTargetResolution.js.map
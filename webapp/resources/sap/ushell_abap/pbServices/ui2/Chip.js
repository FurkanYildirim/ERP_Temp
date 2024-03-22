// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell_abap/pbServices/ui2/Bag","sap/ushell_abap/pbServices/ui2/Utils","sap/ushell_abap/pbServices/ui2/Error","sap/ushell_abap/pbServices/ui2/ChipDefinition","sap/base/Log"],function(e,t,i,n,r){"use strict";var a={};var o={};function s(e){return Object.prototype.hasOwnProperty.call(a,e)?a[e]:null}var u=function(a,u){var p=this,c,l,f,h,g,d,C,m,w;function I(){if(!h){throw new i(p+": CHIP is just a stub","sap.ushell_abap.pbServices.ui2.Chip")}}function P(i){var n;c=new t.Map;if(!i){return}for(n=0;n<i.length;n+=1){c.put(i[n].id,new e(u,i[n]))}}function y(e){var t=e.basePath,n,r,a,o=e.viewName;if(e.componentName){e.$Namespace=e.componentName}else{r=/^(?:([^\/]+)\/)?(.*)\.view\.(.*)$/.exec(o);if(!r){throw new i(p+": Illegal view name: "+o,"Chip")}a=r[1];o=r[2];e.$ViewType=r[3].toUpperCase();if(a){o=a+"."+o}else{n=o.lastIndexOf(".");if(n<1){throw new i(p+": Missing namespace: "+o,"Chip")}a=o.substring(0,n)}e.$Namespace=a;e.$ViewName=o}var s=e.virtualNamespace;if(s){e.$VirtualNamespace=s}e.$UrlPrefix=e.$Namespace.replace(/\./g,"/");if(t!=="."){t=t.replace(/\/?$/,"/");e.$UrlPrefix=t+e.$UrlPrefix}e.$UrlPrefix=p.toAbsoluteUrl(e.$UrlPrefix)}function v(){f={};if(h.contracts.configuration&&h.contracts.configuration.parameters){f=JSON.parse(JSON.stringify(h.contracts.configuration.parameters))}p.updateConfiguration(f,a.configuration)}function b(e){var t,n;if(h){throw new i(p+": cannot initialize twice",null,"Chip")}h=e;h.contracts=h.contracts||{};if(!h.implementation||!h.implementation.sapui5){throw new i(p+": Missing SAPUI5 implementation","Chip")}y(h.implementation.sapui5);v();r.debug("Initialized: "+p,null,"Chip");if(C){for(t=0,n=C.length;t<n;t+=2){C[t]()}C=null}}this.updateBags=function(t){var i,n,r=c.keys();for(i=0;i<t.length;i+=1){n=t[i].id;if(c.containsKey(n)){c.get(n).update(t[i]);r.splice(r.indexOf(n),1)}else{c.put(n,new e(u,t[i]))}}for(i=0;i<r.length;i+=1){c.remove(r[i])}};this.createApi=function(e,t){var n={},r,a,o,u;I();u=h.contracts;if(u){for(o in u){if(Object.prototype.hasOwnProperty.call(u,o)){a=s(o);if(!a){throw new i(this+": Contract '"+o+"' is not supported","Chip")}n[o]={};r=a.call(n[o],e);if(t){t.put(o,r)}}}}return n};this.getAvailableTypes=function(){var e;I();if(h.contracts.types&&h.contracts.types.parameters&&typeof h.contracts.types.parameters.supportedTypes==="string"&&h.contracts.types.parameters.supportedTypes!==""){e=h.contracts.types.parameters.supportedTypes.toLowerCase();return e.split(",")}return[]};this.getDefaultType=function(){var e=this.getAvailableTypes();if(h.contracts.types&&h.contracts.types.parameters&&typeof h.contracts.types.parameters.defaultType==="string"&&h.contracts.types.parameters.defaultType!==""){var t=h.contracts.types.parameters.defaultType;t=t.toLowerCase();if(e.indexOf(t)>-1){return t}throw new i("The chip has the default type: "+t+" which is not supported")}if(e.indexOf("tile")>-1){return"tile"}if(e.length>0){return e[0]}return""};this.getBag=function(e){if(!e){throw new i("Missing bag ID","Chip")}return c.get(e)};this.getBagIds=function(){return c.keys()};this.getBaseChipId=function(){return a.baseChipId};this.getCatalog=function(){if(m){return m}return a.$proxy?undefined:u.createCatalog(a.catalogId)};this.getConfigurationParameter=function(e){I();return f[e]};this._getChipRawConfigurationString=function(){return a.configuration};this.getDescription=function(){return a.description};this.getId=function(){return a.id};this.getReferenceChipId=function(){return a.referenceChipId};this.getImplementationAsSapui5=function(e){var t,i,n;r.error("Deprecated API call of 'Chip.getImplementationAsSapui5'. Please use 'getImplementationAsSapui5Async' instead",null,"sap.ushell_abap.pbServices.ui2.Chip");I();t={chip:e};i=h.implementation.sapui5;n=this.getBaseChipId();if(n!=="X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER"&&n!=="X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER"){if(i.$VirtualNamespace){i.$absolutePath=this.toAbsoluteUrl(i.basePath);sap.ui.loader.config({paths:JSON.parse('{"'+i.$Namespace.replace(/\./g,"/")+'":"'+i.$absolutePath+'"}')})}else{sap.ui.loader.config({paths:JSON.parse('{"'+i.$Namespace.replace(/\./g,"/")+'":"'+i.$UrlPrefix+'"}')})}}if(i.componentName){var a=sap.ui.requireSync("sap/ui/core/ComponentContainer");var o=new a;this.oComponentPromise=new Promise(function(e,n){sap.ui.require(["sap/ui/core/Component"],function(r){r.create({name:i.componentName,componentData:t}).then(function(e){o.setComponent(e)}).then(e).catch(n)})});return o}return sap.ui.view({type:i.$ViewType,viewName:i.$ViewName,viewData:t})};this.getImplementationAsSapui5Async=function(e){try{I()}catch(e){return Promise.reject(e)}return new Promise(function(t,i){sap.ui.require(["sap/ui/core/ComponentContainer","sap/ui/core/Component","sap/ui/core/mvc/View"],function(n,r,a){var s={chip:e};var u=h.implementation.sapui5;var p=this.getBaseChipId();if(p!=="X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER"&&p!=="X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER"){if(u.$VirtualNamespace){u.$absolutePath=this.toAbsoluteUrl(u.basePath);sap.ui.loader.config({paths:JSON.parse('{"'+u.$Namespace.replace(/\./g,"/")+'":"'+u.$absolutePath+'"}')})}else{sap.ui.loader.config({paths:JSON.parse('{"'+u.$Namespace.replace(/\./g,"/")+'":"'+u.$UrlPrefix+'"}')})}}if(u.componentName){var c=true;if(p==="X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER"||p==="X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER"){c=false}if(!o[u.componentName]){o[u.componentName]=r.create({name:u.componentName,componentData:s,manifest:c});return o[u.componentName].then(function(e){return new n({component:e})}).then(t).catch(i)}return o[u.componentName].then(function(){return r.create({name:u.componentName,componentData:s,manifest:c})}).then(function(e){return new n({component:e})}).then(t).catch(i)}return a.create({type:u.$ViewType,viewName:u.$ViewName,viewData:s}).then(t).catch(i)}.bind(this))}.bind(this))};this.getRemoteCatalog=function(){return m};this.getTitle=function(){return a.title||h&&h.appearance&&h.appearance.title};this.isBasedOn=function(e){var t="X-SAP-UI2-PAGE:"+e.getPage().getId()+":"+e.getId();function i(e){return e===t||e.indexOf(t+":")===0}return a.referenceChipId&&i(a.referenceChipId)||i(a.id)};this.isReference=function(){return!!a.referenceChipId};this.isBrokenReference=function(){return a.referenceChipId==="O"};this.isStub=function(){return!h};this.load=function(e,o){function s(e,t){g=e;d=t;var i,n;if(C){for(i=1,n=C.length;i<n;i+=2){C[i](e,t)}C=null}}function c(){if(u){u.createChipDefinition(a.url,b,s);return}t.get(a.url,true,function(e){r.debug("Loaded: "+p,null,"Chip");b(new n(e))},s)}function f(){if(!a.url){if(w){throw new i("Remote catalog did not deliver CHIP '"+a.id+"'","Chip")}throw new i("Missing module URL","Chip")}w=false;l=t.absoluteUrl(a.url);c()}if(!this.isStub()){throw new i("Chip is not a stub anymore","Chip")}if(typeof e!=="function"){throw new i("Missing success handler","Chip")}o=o||u.getPageBuildingService().getDefaultErrorHandler();if(g){t.callHandler(o.bind(null,g,d),null,true);return}if(C){C.push(e,o);return}if(a.url){c()}else if(a.remoteCatalogId){this.getRemoteCatalog().readRegisteredChips(f,s);w=true}else{u.getPageBuildingService().readChip(a.id,function(e){a=e;f()},s)}C=[e,o]};this.refresh=function(e,t){function n(t){a.title=t.title;a.configuration=t.configuration;a.referenceChipId=t.referenceChipId;P(t.ChipBags&&t.ChipBags.results);if(!p.isStub()){p.updateConfiguration(f,a.configuration)}e()}function r(e){if(e.results[0]){n(e.results[0])}else{t=t||u.getPageBuildingService().getDefaultErrorHandler();t("Could not refresh CHIP. No update received from catalog "+a.remoteCatalogId)}}if(typeof e!=="function"){throw new i("Missing success handler","Chip")}if(!a.url){throw new i(p+": CHIP is just a stub","Chip")}if(a.remoteCatalogId){this.getRemoteCatalog().readChips([a.id],r,t)}else{u.getPageBuildingService().readChip(a.id,n,t)}};this.update=function(e){if(typeof e!=="object"||e.id!==this.getId()){throw new i("Invalid update data: "+this,"Chip")}if(e.ChipBags&&e.ChipBags.results){this.updateBags(e.ChipBags&&e.ChipBags.results)}if(a.url){return}if(!e.url){return}a=e;l=t.absoluteUrl(a.url);r.debug("Updated: "+this,null,"Chip")};this.updateConfiguration=function(e,t){var n,a,o;if(!t){return}if(typeof t==="string"){try{n=JSON.parse(t)}catch(e){r.warning(this+': ignoring invalid configuration "'+t+'"',null,"Chip");return}}else{n=t}for(a in n){if(Object.prototype.hasOwnProperty.call(n,a)){if(Object.prototype.hasOwnProperty.call(f,a)){o=n[a];if(o===undefined){delete e[a]}else if(typeof o!=="string"){throw new i("Value for '"+a+"' must be a string","Chip")}else{e[a]=o}}else{r.warning(this+": ignoring unknown configuration parameter "+a,null,"Chip")}}}};this.toAbsoluteUrl=function(e){return t.absoluteUrl(e,l)};this.toString=function(e){var t=['Chip({sChipUrl:"',l,'"'];if(e){t.push(",oAlterEgo:",JSON.stringify(a),",oBags:",c.toString(),",oDefinition:",JSON.stringify(h))}t.push("})");return t.join("")};this.isInitiallyDefined=function(e){return e}.bind(null,a&&!a.hasOwnProperty("$proxy"));this._setDefinition=function(e){h=e};if(!a){throw new i("Missing CHIP description","Chip")}l=t.absoluteUrl(a.url);if(a.remoteCatalogId){m=u.createCatalog(a.remoteCatalogId);if(!a.url){m.registerChip(this)}}P(a.ChipBags&&a.ChipBags.results);r.debug("Created: "+this,null,"Chip")};u.addContract=function(e,t){if(s(e)){throw new i("Cannot register contract '"+e+"' twice","Chip")}a[e]=t};u.removeContract=function(e){delete a[e]};if(!a.navigation){u.addContract("navigation",function(e){this.navigateToUrl=function(e,t){throw new i("'navigation' contract not implemented!")}})}u.prototype._clearComponentCache=function(){o={}};return u});
//# sourceMappingURL=Chip.js.map
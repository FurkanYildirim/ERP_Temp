// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/URI","sap/ushell/components/cards/ManifestPropertyHelper","sap/ui/thirdparty/jquery","sap/base/util/ObjectPath","sap/base/util/isEmptyObject","sap/m/GenericTile","sap/ushell/Config","sap/base/util/deepExtend","sap/ushell/utils/chipsUtils","sap/ushell_abap/pbServices/ui2/Utils","sap/ushell_abap/pbServices/ui2/Page","sap/ushell_abap/pbServices/ui2/Error","sap/base/Log","sap/m/library","sap/ushell/ui/tile/StaticTile","sap/ushell/utils","sap/ushell_abap/pbServices/ui2/contracts/preview"],function(e,t,jQuery,i,r,n,a,o,s,u,l,c,g,f,p,d,h){"use strict";var v=f.LoadState;var _="sap.ushell_abap.adapters.abap.LaunchPageAdapter";var C="/UI2/Fiori2LaunchpadHome";var m="/UI2/FLPD_CATALOG";var y="X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER";var b="X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER";var T="X-SAP-UI2-CHIP:/UI2/CARD";var I={catalogTileNotFound:"catalogTileNotFound",referenceTileNotFound:"referenceTileNotFound",noTargetMapping:"noTargetMapping",emptyConfiguration:"emptyConfiguration",tileIntentSupportException:"tileIntentSupportException"};var P="/UI2/FLPNoActionChip";var S=function(c,f,w){var O;var k;var A;var E=new u.Map;var j=w&&w.config||{};var x=j.services&&j.services.launchPage;var D={};var B=this;this._oCurrentPageSet=null;this._bPageSetFullyLoaded=false;this._aOtherChipsPromises=[];h.setEnvironmentType("runtime");function N(e,t,i){try{return e.getImplementationAsSapui5()}catch(e){g.error(i+": "+(e.message||e),e.stack,_);return new p({icon:"sap-icon://error",info:"",infoState:"Critical",subtitle:e.message||e,title:t}).addStyleClass("sapUshellTileError")}}S.prototype._getBagText=function(e,t,i){if(e.getBagIds().indexOf(t)>-1&&e.getBag(t).getTextNames().indexOf(i)>-1){return e.getBag(t).getText(i)}return undefined};S.prototype._getConfigurationProperty=function(e,t,i){var r;var n;try{r=e.getConfigurationParameter(t);n=JSON.parse(r)}catch(e){return undefined}if(n[i]!==undefined){return n[i]}return undefined};S.prototype._orderBasedOnConfiguration=function(e,t){var i=e&&u.isArray(e.order)?e.order:[];var r={};var n=[];var a;var o;var s;i=i.concat(e&&u.isArray(e.linkOrder)?e.linkOrder:[]);for(o=0,s=t.length;o<s;o+=1){a=t[o];r[a.getId()]=a}for(o=0,s=i.length;o<s;o+=1){var l=i[o];if(Object.prototype.hasOwnProperty.call(r,l)){n.push(r[l]);delete r[l]}}for(o=0,s=t.length;o<s;o+=1){a=t[o];if(Object.prototype.hasOwnProperty.call(r,a.getId())){n.push(a)}}return n};function R(e,t,i){if(i==="link"){return L(e.linkOrder,t.getId())}return L(e.order,t.getId())}function L(e,t){var i=e.indexOf(t);if(i<0){return i}e.splice(i,1);return i}function F(e,t,i,r){if(r==="link"){i=i-e.order.length;e.linkOrder.splice(i,0,t)}else{e.order.splice(i,0,t)}}function G(e,t){var i=t.getGroupTiles(e);var r={order:[],linkOrder:[]};i.forEach(function(e){var i=t.getTileType(e);if(i==="link"){r.linkOrder.push(e.getId())}else{r.order.push(e.getId())}});return r}function U(){var e;try{e=JSON.parse(B._oCurrentPageSet.getConfiguration());e.order.splice(0,0,B._oCurrentPageSet.getDefaultPage().getId())}catch(t){e={order:[B._oCurrentPageSet.getDefaultPage().getId()]}}return S.prototype._orderBasedOnConfiguration(e,B._oCurrentPageSet.getPages())}this.hideGroups=function(e){var t=new jQuery.Deferred;if(!e||!(e instanceof Array)){t.reject("Input parameter must be of type Array.")}else{var i=JSON.parse(B._oCurrentPageSet.getConfiguration()||"{}");i.hiddenGroups=e;B._oCurrentPageSet.setConfiguration(JSON.stringify(i),t.resolve.bind(t),t.reject.bind(t))}return t.promise()};this.isGroupVisible=function(e){var t=B._oCurrentPageSet.getConfiguration();if(!t){return true}var i=JSON.parse(t);if(!i||!i.hiddenGroups){return true}var r=i.hiddenGroups;for(var n=0;n<r.length;n+=1){if(r[n]===e.getId()){return false}}return true};S.prototype._triggerChipInstanceLoad=function(e){function t(){if(e._loadingDeferred){e._loadingDeferred.resolve()}delete e._loadingDeferred;delete e.$loadingPromise}function i(t){g.error("Failed to load tile: "+t,e.toString(),_);if(e._loadingDeferred){e._loadingDeferred.reject()}delete e._loadingDeferred;delete e.$loadingPromise}e.load(t,i)};this._loadApplaunchersAndDelayLoadingOfOtherChips=function(e,t){var i=0;var r=[];var n=[];function a(){if(i<=0){t()}}function o(e){e._loadingDeferred=new jQuery.Deferred;e.$loadingPromise=e._loadingDeferred.promise();B._aOtherChipsPromises.push(new Promise(function(t,i){e.$loadingPromise.done(t).fail(i)}));if(window["sap-ui-debug"]===true){S.prototype._triggerChipInstanceLoad(e)}else{sap.ui.require(["sap/ushell/EventHub"],function(t){var i=t.on("CoreResourcesComplementLoaded");i.do(function(t){if(t.status==="success"){S.prototype._triggerChipInstanceLoad(e);i.off()}else{g.error("Did not load custom tile as core resources where not loaded",null,_)}})})}}function s(e){function t(){i-=1;a()}i+=1;e.load(t,function(i){g.error("Failed to load tile: "+i,e.toString(),_);t()})}e.forEach(function(e){e.getChipInstances().forEach(function(e){if(z(e)){n.push(e)}else if(V(e)){}else if(H(e)||q(e)){s(e)}else{r.push(e)}})});r.forEach(function(e){o(e)});n.forEach(function(e){o(e)});a()};S.prototype._readTargetMappings=function(){var e=new jQuery.Deferred;function t(e){var t=[];var i=e.targetMappings||e||{};Object.keys(i).forEach(function(e){var r={};["semanticObject","semanticAction","formFactors"].forEach(function(t){r[t]=i[e][t]});t.push(r)});return t}if(i.get("compactTMPromise",j)){j.compactTMPromise.then(function(i){var r=t(i||{});e.resolve({results:r})},function(t){e.reject(t)});return e.promise()}var r=i.create("services.targetMappings",j);var n=r.cacheId||"";var a="/sap/bc/ui2/start_up?so=%2A&action=%2A&tm-compact=true&shellType="+d.getShellType()+"&depth=0";if(n){a+=(a.indexOf("?")<0?"?":"&")+"sap-cache-id="+n}var o=r.sUI2CacheDisable;if(o){a+=(a.indexOf("?")<0?"?":"&")+"sap-ui2-cache-disable="+o}u.get(a,false,function(i){var r=JSON.parse(i);var n=r.targetMappings||{};var a=t(n);e.resolve({results:a})},function(t){e.reject(t)});return e.promise()};S.prototype._makeTargetMappingSupportKey=function(e,t){return e+"-"+t};S.prototype._isWrapperOnly=function(e){return!e.getConfiguration()};function M(e,t){var i=[];t.forEach(function(t){var r=t.getRemoteCatalog();if(t.getBaseChipId()==="X-SAP-UI2-CHIP:/UI2/ACTION"){return}var n=e.createChipInstance({chipId:t.getId(),remoteCatalogId:r&&r.getId()});i.push(n)});return i}function J(e){var t=B._oCurrentPageSet.getDefaultPage().getAllCatalogs();var i=t.getCatalogs();var r=[];for(var n=0;n<i.length;n+=1){var a=i[n];r.push({data:{},errorMessage:undefined,id:a.getId(),title:a.isStub()?a.getId():a.getTitle(),tiles:a.isStub()?[]:M(e,a.getChips()),ui2catalog:a})}return r}function H(e){var t=e.getChip().getBaseChipId();return t===y||t===b}function q(e){var t=e.getChip().getBaseChipId();return T===t}function z(e){return!!e.getChip().getRemoteCatalog()}function V(e){return!z(e)&&e.getChip().getBaseChipId()===undefined}function $(e){var t;var i=e.getConfigurationParameter("tileConfiguration");try{t=JSON.parse(i||"{}")}catch(t){g.error("Tile with ID '"+e.getId()+"' has a corrupt configuration containing a 'tileConfiguration' value '"+i+"' which could not be parsed. If present, a (stringified) JSON is expected as value.",t.message,"sap.ushell_abap.adapters.abap.LaunchPageAdapter");return{}}return t}function K(e){var t={};var i;var r;var n;try{i=JSON.parse(e.getChip()._getChipRawConfigurationString());r=JSON.parse(i&&i.tileConfiguration||"{}");n=JSON.parse(r&&r.TILE_PROPERTIES||"{}");if(n.semanticObject&&n.semanticAction){t.navigation_use_semantic_object=true;t.navigation_semantic_object=n.semanticObject;t.navigation_semantic_action=n.semanticAction}}catch(e){return{}}return t}function W(e){var t;if(e.getChip().getBaseChipId()==="X-SAP-UI2-CHIP:/UI2/AR_SRVC_NEWS"){return{navigation_use_semantic_object:true,navigation_semantic_object:"NewsFeed",navigation_semantic_action:"displayNewsList",navigation_semantic_parameters:"",navigation_target_url:"#NewsFeed-displayNewsList"}}var i=K(e);if(i.navigation_use_semantic_object){return i}try{var r=JSON.parse(e.getChip()._getChipRawConfigurationString());t=JSON.parse(r&&r.tileConfiguration||"{}")}catch(e){return{}}return t}this._parseFullChipId=function(e){var t=e.split(":");var i=t.pop();var r=null;if(t.length>2){r=t.shift()}return{id:i,prefix:r,catalog:t.join(":")}};this.getTargetMappingSupport=function(){return E};this._parseReferenceLost=function(e){var t=e||Object.prototype.toString.apply(t);if(!t.match(/^Reference lost: Note \d+ Page.+\s,\sInstance ID.+$/)){g.warning("The string that describes a lost reference is in an unexpected format","This is expected to be a string exactly like 'Reference lost: Note <#> Page <CATALOG_ID> , Instance ID <CHIP_ID>' instead of the given '"+e+"'","sap.ushell_abap.adapters.abap.LaunchPageAdapter");return{id:"Unknown",catalog:"Unknown"}}var i=t.split(" , ").map(function(e){return e.split(" ").pop()});return{id:i[1],catalog:i[0]}};this._flattenArray=function(e){var t=this;if(Object.prototype.toString.apply(e)!=="[object Array]"){return e}return e.reduce(function(e,i){return e.concat(t._flattenArray(i))},[])};this._findAndReportTileErrors=function(e,t){var i=this._getPossibleTileErrors(e,t);if(i.length>0){this._reportTileErrors(i)}};this._getPossibleTileErrors=function(e,t){var i=this;return e.map(function(e){return{group:{id:e.getId(),title:e.getTitle()},errors:i._getPossibleTileErrorsFromOnePage(e,t)}})};this._getPossibleTileErrorsFromOnePage=function(e,t){var i=this;var r=e.getChipInstances().reduce(function(e,r){var n;var a;var o=r.getChip();var s=i._parseFullChipId(o.getId());if(!o.isInitiallyDefined()){e.push({type:I.catalogTileNotFound,chipInstanceId:r.getId(),chipId:s.id,chipCatalogId:s.catalog})}else if(o.isReference()&&o.isBrokenReference()){var u=i._parseReferenceLost(o.getTitle());e.push({type:I.referenceTileNotFound,chipInstanceId:r.getId(),referenceChipId:s.id,referenceChipCatalogId:s.catalog,missingReferredChipId:u.id,missingReferredCatalogId:u.catalog})}else{try{n=i._checkTileIntentSupport(r,t)}catch(e){n={isSupported:false,reason:I.tileIntentSupportException,exception:e}}if(!n.isSupported){var l=i._getBagText(r,"tileProperties","display_title_text");var c=i._getBagText(r,"tileProperties","display_subtitle_text");switch(n.reason){case I.noTargetMapping:if(H(r)){a=$(r)}else{a=W(r)}e.push({type:I.noTargetMapping,chipInstanceId:r.getId(),chipInstanceTitle:l||a.display_title_text||r.getTitle(),chipInstanceSubtitle:c||a.display_subtitle_text,tileURL:a.navigation_target_url||"#"+a.navigation_semantic_object+"-"+a.navigation_semantic_action+(a.navigation_semantic_parameters?"?"+a.navigation_semantic_parameters:"")});break;case I.emptyConfiguration:var g=r.getConfigurationParameter("tileConfiguration");e.push({type:I.emptyConfiguration,chipInstanceId:r.getId(),chipInstanceTitle:l||r.getTitle(),chipInstanceSubtitle:c||null,tileConfiguration:g});break;case I.tileIntentSupportException:e.push({type:I.tileIntentSupportException,exception:n.exception,chipInstanceId:r.getId()});break;case I.referenceTileNotFound:break;default:}}}return e},[]);return r};this._formatTileError=function(e){switch(e.type){case I.catalogTileNotFound:return"comes from catalog tile with ID '"+e.chipId+"' but this cannot be found in catalog '"+e.chipCatalogId+"' (CATALOG TILE NOT FOUND).";case I.referenceTileNotFound:return"comes from reference tile '"+e.referenceChipId+"'"+" in catalog '"+e.referenceChipCatalogId+"'"+" which in turn refers to the tile '"+e.missingReferredChipId+"'"+" from catalog '"+e.missingReferredCatalogId+"', but this is missing (REFERENCED TILE NOT FOUND).";case I.noTargetMapping:return"was hidden because a target mapping for the tile URL '"+e.tileURL+"' was not found (TARGET MAPPING NOT FOUND).";case I.emptyConfiguration:return"the tile configuration '"+e.tileConfiguration+"' is empty or invalid (BAD CONFIGURATION).";case I.tileIntentSupportException:return"exception occurred while checking tile intent support: "+e.exception+" (EXCEPTION RAISED).";default:return"unknown error type '"+e.type+"' (UNKNOWN ERROR). Error data: "+JSON.stringify(e,null,3)}};this._reportTileErrors=function(e){var t=this;var i=[];var r=[];function n(e,t){var i=[e,t].map(function(e,t){return t===1&&e?"("+e+")":e}).filter(function(e){return typeof e==="string"&&e.length>0}).join(" ");return i.length>0?"'"+i+"'":""}e.forEach(function(e){var a="  in Group '"+e.group.title+"' with Group ID '"+e.group.id+"'";var o=[];var s=[];e.errors.forEach(function(e){var i=["  - tile instance",n(e.chipInstanceTitle,e.chipInstanceSubtitle),"with ID '"+e.chipInstanceId+"'"].filter(function(e){return e.length>0}).join(" ");if(e.type===I.noTargetMapping){s.push([i,"    "+t._formatTileError(e)].join("\n"))}else{o.push([i,"    "+t._formatTileError(e)].join("\n"))}});if(o.length>0){r.push([a,o.join("\n")].join("\n"))}if(s.length>0){i.push([a,s.join("\n")].join("\n"))}});if(r.length>0){r.unshift("Tile error(s) were detected:");g.error(r.join("\n"),null,"sap.ushell_abap.adapters.abap.LaunchPageAdapter")}if(i.length>0){i.unshift("Tile warning(s) were detected:");g.warning(i.join("\n"),null,"sap.ushell_abap.adapters.abap.LaunchPageAdapter")}};this.getGroups=function(){if(this._bPageSetFullyLoaded){return(new jQuery.Deferred).resolve(U()).promise()}if(!k){k=new jQuery.Deferred;var e=new jQuery.Deferred;sap.ushell.Container.getServiceAsync("PageBuilding").then(function(t){var i=t.getFactory().getPageBuildingService().readPageSet;if(x&&x.cacheId){i.cacheBusterTokens.put(C,x.cacheId)}if(x&&x["sap-ui2-cache-disable"]&&i){var r=i.appendedParameters||{};r["sap-ui2-cache-disable"]=x["sap-ui2-cache-disable"];i.appendedParameters=r}var n=this._readTargetMappings().done(function(e){var t=u.getFormFactor();e.results.forEach(function(e){var i=S.prototype._makeTargetMappingSupportKey(e.semanticObject,e.semanticAction);E.put(i,E.get(i)||!!(e.formFactors&&e.formFactors[t]))})});if(a.last("/core/spaces/enabled")){var o=t.getFactory();var s=new l(o,{id:P});B._oCurrentPageSet={getDefaultPage:function(){return s},getPages:function(){return[s]},appendPage:function(){throw new Error("Not implemented in Pages Runtime")},isPageRemovable:function(){return false},removePage:function(){throw new Error("Not implemented in Pages Runtime")},isPageResettable:function(){return true},resetPage:function(){},getConfiguration:function(){return"{}"},setConfiguration:function(){},filter:function(){}};k.resolve([])}else{var c=t.getPageSet(C);c.fail(e.reject.bind(e)).done(function(t){this._oCurrentPageSet=t;this._oCurrentPageSet.filter([C],[m]);this._loadApplaunchersAndDelayLoadingOfOtherChips(t.getPages(),e.resolve.bind(e,t))}.bind(this));jQuery.when(n,e).done(function(e,t){this._bPageSetFullyLoaded=true;if(g.getLevel()>=g.Level.DEBUG){this._findAndReportTileErrors(t.getPages(),E)}k.resolve(U())}.bind(this)).fail(k.reject.bind(k))}}.bind(this))}return k.promise()};this.getGroupsAndWaitForAllChips=function(){return new Promise(function(e,t){B.getGroups().done(e).fail(t)}).then(function(e){return Promise.allSettled(B._aOtherChipsPromises).then(function(){return e})})};this.getDefaultGroup=function(){var e=new jQuery.Deferred;this.getGroups().done(function(){e.resolve(B._oCurrentPageSet.getDefaultPage())}).fail(e.reject.bind(e));return e.promise()};this.getGroupTitle=function(e){return e.getTitle()};this.getGroupId=function(e){return e.getId()};this.getGroupTiles=function(e){var t;try{t=JSON.parse(e.getLayout())}catch(t){g.warning("Group "+e.getId()+": invalid layout: "+e.getLayout(),null,_)}return this._orderBasedOnConfiguration(t,e.getChipInstances())};this.getGroupTileClones=function(e){var t=this.getGroupTiles(e);var i=t.map(function(e){return e.clone()});return Promise.allSettled(i).then(function(e){return e.map(function(e){if(!e.value){g.warning("Group tile was filtered out: ",e.reason)}return e.value}).filter(function(e){return e})})};this.addGroup=function(e){var t=new jQuery.Deferred;B._oCurrentPageSet.appendPage(e,m,t.resolve.bind(t),t.reject.bind(t,U()));return t.promise()};this.removeGroup=function(e){var t=new jQuery.Deferred;if(B._oCurrentPageSet.isPageRemovable(e)){B._oCurrentPageSet.removePage(e,t.resolve.bind(t),t.reject.bind(t,U()))}else{t.reject(U())}return t.promise()};this.resetGroup=function(e){var t=new jQuery.Deferred;var i=this;if(i._oCurrentPageSet.isPageRemovable(e)){t.reject(U())}else if(i._oCurrentPageSet.isPageResettable(e)){i._oCurrentPageSet.resetPage(e,function(){i._loadApplaunchersAndDelayLoadingOfOtherChips([e],t.resolve.bind(t,e))},t.reject.bind(t,U()))}else{t.resolve(e)}return t.promise()};this.isGroupRemovable=function(e){return B._oCurrentPageSet.isPageRemovable(e)};this.isGroupLocked=function(e){return e.isPersonalizationLocked()};this.isLinkPersonalizationSupported=function(e){if(!e){return true}if(!e.isStub()){var t=e.getContract&&e.getContract("types");var i=t&&t.getAvailableTypes()||[];return i.indexOf("link")!==-1}return false};this.isTileIntentSupported=function(e){var t;var i=this._checkTileIntentSupport(e,E);if(!i.isSupported&&i.reason===I.noTargetMapping){if(H(e)){t=$(e)}else{t=W(e)}var r=this._getBagText(e,"tileProperties","display_title_text")||t.display_title_text;var n=this._getBagText(e,"tileProperties","display_subtitle_text")||t.display_subtitle_text;var a=t.navigation_target_url;g.warning("Group tile with ID '"+e.getId()+"' is filtered out as the current user has no target mapping assigned for the intent '"+a+"'","\nGroup Tile ID: '"+e.getId()+"'\n"+"Title: '"+r+"'\n"+"Subtitle: '"+n+"'\n"+"Intent: '"+a+"' - ","sap.ushell_abap.adapters.abap.LaunchPageAdapter")}return i.isSupported};this._checkTileIntentSupport=function(e,t){var i;var n;var a=S.prototype._makeTargetMappingSupportKey;if(!H(e)){i=W(e);if(!i.navigation_use_semantic_object||!i.navigation_semantic_object||!i.navigation_semantic_action){return{isSupported:true}}n=t.get(a(i.navigation_semantic_object,i.navigation_semantic_action));if(!n){n=t.get(a("*",i.navigation_semantic_action))}if(!n){return{isSupported:false,reason:I.noTargetMapping}}return{isSupported:true}}if(e.isStub()){g.error("Applauncher Tile not loaded completely! This might be caused by a RemoteCatalog content. Standard Tiles are not supported as part of RemoteCatalogs",new Error("Applauncher Tile is still a stub"),"sap.ushell_abap.adapters.abap.LaunchPageAdapter");return{isSupported:true}}if(e.getChip()&&typeof e.getChip().isBrokenReference==="function"&&e.getChip().isBrokenReference()){return{isSupported:false,reason:I.referenceTileNotFound}}i=$(e);if(r(i)){return{isSupported:false,reason:I.emptyConfiguration}}if(!i.navigation_use_semantic_object){return{isSupported:true}}n=t.get(a(i.navigation_semantic_object,i.navigation_semantic_action));if(n){return{isSupported:true}}return{isSupported:false,reason:I.noTargetMapping}};this.moveGroup=function(e,t){var i=new jQuery.Deferred;function r(e){var t=[];e.forEach(function(e){t.push(e.getId())});var r=JSON.parse(B._oCurrentPageSet.getConfiguration()||"{}");r.order=t;B._oCurrentPageSet.setConfiguration(JSON.stringify(r),i.resolve.bind(i),i.reject.bind(i,U()))}this.getGroups().done(function(i){var n=i.indexOf(e);i.splice(n,1);i.splice(t,0,e);r(i)});return i.promise()};this.setGroupTitle=function(e,t){var i=new jQuery.Deferred;e.setTitle(t,i.resolve.bind(i),function(){i.reject(e.getTitle())});return i.promise()};this.addTile=function(e,t){var i=new jQuery.Deferred;var r=e.getChip();if(e.isStub()){i.reject(U(),new Error("Tile was not added to the group as the tile failed loading"))}else{if(!t){t=B._oCurrentPageSet.getDefaultPage()}t.addChipInstance(r,i.resolve.bind(i),i.reject.bind(i,U()))}return i.promise()};this.removeTile=function(e,t){var i=new jQuery.Deferred;e.removeChipInstance(t,i.resolve.bind(i),i.reject.bind(i,U()));return i.promise()};this.moveTile=function(e,t,i,r,n,a){var o=new jQuery.Deferred;var s=this._isWrapperOnly(e);var l=new u.Map;var c;var f=o.reject.bind(o,U());var p=2;function d(e){p-=1;c=c||e;if(p<=0){o.resolve(c)}}if(!n){n=r}var h=G(r,this);var v=G(n,this);var C=this.getTileType(e);t=R(h,e,C);if(t<0){g.error("moveTile: tile not found in source group",null,_);f();return o.promise()}if(r===n){F(h,e.getId(),i,a);r.setLayout(JSON.stringify(h),o.resolve.bind(o,e),f)}else{sap.ushell.Container.getServiceAsync("PageBuilding").then(function(t){var o=t.getFactory().getPageBuildingService();var u=e.getBagIds();u.forEach(function(t){var i={texts:[],properties:[]};var r=e.getBag(t);r.getOwnTextNames().forEach(function(e){i.texts.push({name:e,value:r.getText(e)})});r.getOwnPropertyNames().forEach(function(e){i.properties.push({name:e,value:r.getProperty(e)})});if(i.texts.length>0||i.properties.length>0){l.put(t,i)}});o.openBatchQueue();var c=this.getGroupTiles(n);n.addChipInstance(s?e.getChip():e,function(e){var t;c.splice(i,0,e);u.forEach(function(i){var r=l.get(i);if(r){t=e.getBag(i);r.texts.forEach(function(e){t.setText(e.name,e.value)});r.properties.forEach(function(e){t.setProperty(e.name,e.value)});t.save(function(){},function(){g.error("Bag "+i+": could not be saved",null,_)})}});F(v,e.getId(),i,a);n.setLayout(JSON.stringify(v),d.bind(this,e),f)},f,e.isStub());r.removeChipInstance(e,d,f);r.setLayout(JSON.stringify(h),undefined,f);o.submitBatchQueue(undefined,f)}.bind(this))}return o.promise()};this.getTileId=function(e){return e.getId()};this.getTileType=function(e){var t=e.getPage();try{var i=JSON.parse(t.getLayout());if(i.linkOrder&&i.linkOrder.indexOf(e.getId())>-1){return"link"}}catch(e){g.warning("Group "+t.getId()+": invalid layout: "+t.getLayout(),null,_)}if(e.isStub()===false){var r=e.getContract("types");if(r&&r.getAvailableTypes().indexOf("card")>-1){return"card"}}return"tile"};this.getCardManifest=function(e){try{var i=e.getConfigurationParameter("cardManifest");var r=JSON.parse(i);var n=t.getCardData(e);r=t.mergeCardData(r,n);return r}catch(t){g.error("Manifest of card with id '"+e.getId()+"' could not be read. "+t.message)}};this.getTileTitle=function(e){return e.getTitle()};this.getTileView=function(e){var t=this;var i=new jQuery.Deferred;function r(){var r;var o=e.getContract("types");if(o){r=t.getTileType(e);o.setType(r)}e.getImplementationAsSapui5Async().then(function(e){if(r==="link"){if(!e.hasModel()){e=e.getComponentInstance().getRootControl()}var t=e.getModel();var a=e.getController();var o=t&&t.getProperty?t.getProperty("/nav/navigation_target_url"):undefined;var s=new n({mode:"{view>/mode}",header:"{view>/config/display_title_text}",subheader:"{view>/config/display_subtitle_text}",sizeBehavior:"{view>/sizeBehavior}",size:"Auto",url:a.formatters&&a.formatters.leanURL(o),press:[a.onPress,a]});s.setModel(t,"view");i.resolve(s);return}i.resolve(e)}).catch(a)}function a(e){i.reject("Tile not successfully loaded"+(e?": "+e:""))}if(!e.$loadingPromise){if(!e.isStub()){u.callHandler(r,a,!H(e))}else{a()}}else{e.$loadingPromise.fail(a).done(function(){try{r()}catch(e){a(e.message||e)}})}return i.promise()};this.getTileSize=function(e){var t=!e.isStub()&&e.getConfigurationParameter("row")||"1";var i=!e.isStub()&&e.getConfigurationParameter("col")||"1";return t+"x"+i};this.refreshTile=function(e){e.refresh()};this.setTileVisible=function(e,t){var i=!e.isStub()&&e.getContract("visible");if(i){i.setVisible(t);return}if(e.isStub()&&e.$loadingPromise){var r=this.getTileId(e);var n=D[r];D[r]=t;if(n===undefined){e.$loadingPromise.done(function(){var t=e.getContract("visible");if(t){t.setVisible(D[r])}})}return}};this.getTileActions=function(e){var t=!e.isStub()&&e.getContract("actions");if(t){return t.getActions()}return[]};this.getTileTarget=function(){return null};this.getTileDebugInfo=function(e){var t=e.getChip();var i=t.getCatalog();var r={chipId:t.getId(),chipInstanceId:e.getId(),chipTitle:t.getTitle(),chipDescription:t.getDescription(),completelyLoaded:!e.isStub()};if(i){r.catalogId=i.getId()}var n=JSON.stringify(r);return n};this.getCatalogs=function(){var e;var t=A;var i=O===false;if(t&&!t.$notified&&!i){e=t}else{A=new jQuery.Deferred;e=A;e.done(function(){if(e===A){O=true}}).always(function(){if(e===A){A=null}});if(t){if(i){O=undefined}t.always(function(){this._startLoading(e,i)}.bind(this))}else{this._startLoading(e,i)}}return e.promise()};this._refreshRemoteCatalogs=function(e){return sap.ushell.Container.getServiceAsync("PageBuilding").then(function(t){var i=0;var r=t.getFactory();var n=J(r);n.forEach(function(t){var a=t.ui2catalog;if(a.isStub()||a.getType()==="H"||a.getType()==="REMOTE"){i+=1;a.refresh(function(){t.title=a.getTitle();t.tiles=M(r,a.getChips());e.notify(t);i-=1;if(i<=0){e.resolve(n)}},function(r){g.error("Failed to load catalog: "+r,a.toString(),_);t.errorMessage=r||"Error";e.notify(t);i-=1;if(i<=0){e.resolve(n)}})}else{e.notify(t);e.$notified=true}});if(i<=0){e.resolve(n)}})};this._useKnownCatalogs=function(e){return sap.ushell.Container.getServiceAsync("PageBuilding").then(function(t){var i=J(t.getFactory());i.forEach(function(t){e.notify(t)});e.resolve(i)})};this._doGetCatalogs=function(e,t){var i=this._oCurrentPageSet.getDefaultPage().getAllCatalogs();if(i.isStub()){i.load(function(){this._refreshRemoteCatalogs(e)}.bind(this),e.reject,"type eq 'CATALOG_PAGE' or type eq 'H' or type eq 'SM_CATALOG' or type eq 'REMOTE'",true,"title",true)}else if(t){this._refreshRemoteCatalogs(e)}else{this._useKnownCatalogs(e)}};this._startLoading=function(e,t){var i;if(x&&x.cacheId){i=sap.ushell.Container.getServiceAsync("PageBuilding").then(function(e){var t=e.getFactory().getPageBuildingService().readAllCatalogs.cacheBusterTokens;t.put(C,x.cacheId);if(a.last("/core/spaces/enabled")){t.put(P,x.cacheId)}}).catch(e.reject)}else{i=Promise.resolve()}i.then(function(){if(B._bPageSetFullyLoaded){this._doGetCatalogs(e,t)}else{this.getGroups().done(function(){this._doGetCatalogs(e,t)}.bind(this)).fail(e.reject)}}.bind(this)).catch(e.reject)};this.isCatalogsValid=function(){return!!O};this.getCatalogData=function(e){return e.ui2catalog.getCatalogData()};this.getCatalogError=function(e){return e.errorMessage};this.getCatalogId=function(e){return e.id};this.getCatalogTitle=function(e){return e.title};this.getCatalogTiles=function(e){var t=new jQuery.Deferred;var i=0;function r(){i-=1;if(i===0){t.resolve(e.tiles)}}function n(e,t){g.error("Failed to load catalog tile: "+t,e.toString(),_);r()}for(var a=0;a<e.tiles.length;a+=1){var o=e.tiles[a];if(o.isStub()){i+=1;o.load(r,n.bind(null,o))}}if(i===0){t.resolve(e.tiles)}return t.promise()};this.getCatalogTileNumberUnit=s.getCatalogTileNumberUnit;this.getCatalogTileId=function(e){var t=e.getChip();var i=t.getId();if(t.getCatalog()&&t.getCatalog().getCatalogData()&&t.getCatalog().getCatalogData().systemAlias){i+="_"+t.getCatalog().getCatalogData().systemAlias}return i};this.getStableCatalogTileId=function(e){var t=e.getChip();var i=t.getReferenceChipId();if(i==="O"){i=null}if(!i){i=this.getCatalogTileId(e)}return i};this.getCatalogTileTitle=function(e){return e.getChip().getTitle()};this.getCatalogTileSize=s.getCatalogTileSize;this.getCatalogTileView=function(e,t){t=typeof t!=="undefined"?t:true;var i=this.getCatalogTileTitle(e);if(e.isStub()){g.warning("CHIP (instance) is just a stub!",e.toString(true),_);return new p({icon:"sap-icon://hide",info:"",infoState:"Critical",subtitle:"",title:i}).addStyleClass("sapUshellTileError")}if(t){var r=e.getContract("preview");if(r){r.setEnabled(true)}else{return new p({title:i,subtitle:"",info:"",infoState:"Neutral",icon:"sap-icon://folder-full"})}}return N(e,i,"Cannot get catalog tile view as SAPUI5")};this.getCatalogTileViewControl=function(e,t){var i=new jQuery.Deferred;t=typeof t!=="undefined"?t:true;var r=this.getCatalogTileTitle(e);if(e.isStub()){g.warning("CHIP (instance) is just a stub!",e.toString(true),_);i.resolve(this._createErrorTile(r,"CHIP was just a stub!"));return i.promise()}if(t){var n=e.getContract("preview");if(n){n.setEnabled(true)}else{i.resolve(this._createPreviewTile(r));return i.promise()}}e.getImplementationAsSapui5Async().catch(function(e){g.error("Cannot get catalog tile view as SAPUI5: "+(e.message||e),e.stack,_);return this._createErrorTile(r,e.message||e)}.bind(this)).then(i.resolve);return i.promise()};this._createErrorTile=function(e,t){var i=new n({state:v.Failed,header:e,subheader:t||""}).addStyleClass("sapUshellTileError");return i};this._createPreviewTile=function(e){return new p({title:e,subtitle:"",info:"",infoState:"Neutral",icon:"sap-icon://folder-full"})};this.getCatalogTileTargetURL=s.getCatalogTileTargetURL;this.getCatalogTilePreviewSubtitle=s.getCatalogTilePreviewSubtitle;this.getCatalogTilePreviewTitle=s.getCatalogTilePreviewTitle;this.getCatalogTilePreviewInfo=s.getCatalogTilePreviewInfo;this.getCatalogTilePreviewIndicatorDataSource=s.getCatalogTilePreviewIndicatorDataSource;this.getCatalogTilePreviewIcon=s.getCatalogTilePreviewIcon;this.getCatalogTileKeywords=function(e){var t={};var i=e.getTitle();var r=this.getCatalogTilePreviewSubtitle(e);var n=e.getChip().getDescription();function a(e,t){if(u.isArray(t)){t.forEach(function(t){if(e.hasOwnProperty(t)){return}e[t]=null})}}function o(e){var t=S.prototype._getBagText(e,"tileProperties","display_search_keywords");if(!u.isString(t)||t===""){return[]}return t.trim().split(/\s*,\s*/g)}function s(e){var t=S.prototype._getBagText(e,"tileProperties","display_info_text");if(t){return[t]}return[]}function l(e){var t=S.prototype._getConfigurationProperty(e,"tileConfiguration","display_number_unit");if(t){return[t]}return[]}function c(e){var t;if(e.isStub()){return[]}t=e.getContract("search");if(t){return t.getKeywords()}return[]}a(t,o(e));a(t,s(e));a(t,l(e));a(t,c(e));if(i){a(t,[i])}if(r){a(t,[r])}if(n){a(t,[n])}return Object.keys(t)};this.addBookmark=function(e,t){var r=b;var n={display_icon_url:e.icon||"",display_info_text:e.info||"",display_subtitle_text:e.subtitle||"",display_title_text:e.title};var a=new jQuery.Deferred;var o={tileProperties:{texts:{display_title_text:n.display_title_text,display_subtitle_text:n.display_subtitle_text,display_info_text:n.display_info_text}}};if(e.serviceUrl){r=y;n.display_number_unit=e.numberUnit;n.service_refresh_interval=e.serviceRefreshInterval||0;n.service_url=e.serviceUrl;if(e.dataSource){n.data_source={type:e.dataSource.type,settings:{odataVersion:i.get(["dataSource","settings","odataVersion"],e)}}}}if(t&&!(t instanceof l)){a.reject("The given object is not a group");return a.promise()}n={tileConfiguration:JSON.stringify(n)};this._createBookmarkTile(r,e.url,n,o,e.title,t).then(function(){a.resolve()}).catch(function(e){a.reject(e.toString())});return a.promise()};this.addCustomBookmark=function(e,t){var i=e.vizConfig["sap.flp"].chipConfig;var r=new jQuery.Deferred;if(t&&!(t instanceof l)){r.reject("The given object is not a group");return r.promise()}this._createBookmarkTile(i.chipId,e.url,i.configuration,i.bags,e.title,t).then(function(){r.resolve()}).catch(function(e){r.reject(e.toString())});return r.promise()};this._getTileTargetConfiguration=function(t){return sap.ushell.Container.getServiceAsync("URLParsing").then(function(i){var r={navigation_target_url:t,navigation_use_semantic_object:false};var n=new e;var a=new e(t);var o=a.host()+a.path()===n.host()+n.path();var s=S.prototype._makeTargetMappingSupportKey;if(t[0]==="#"||o){var u=i.parseShellHash(i.getShellHash(t));if(u&&E.get(s(u.semanticObject,u.action))!==undefined){r.navigation_use_semantic_object=true;r.navigation_semantic_object=u.semanticObject;r.navigation_semantic_action=u.action;r.navigation_semantic_parameters=i.paramsToString(u.params)}}return r})};this._updateBags=function(e,t){var i=[];var r=[];if(!t){t={};i.push(Promise.resolve([]))}Object.keys(t).forEach(function(n){var a;var o=false;var s=t[n];var u=e.getBag(n);try{for(a in s.properties){u.setProperty(a,s.properties[a]);o=true}for(a in s.texts){u.setText(a,s.texts[a]);o=true}i.push(new Promise(function(e,t){if(o){r.push(n);u.save(e,t)}else{e()}}))}catch(e){i.push(Promise.reject(e))}});return Promise.all(i).then(function(){return r})};this._checkBookmarkConfiguration=function(e){return new Promise(function(t,i){try{var r=$(e);if(!r.navigation_target_url){throw new Error("tileConfiguration.navigation_target_url was not set")}this.getTileSize(e);t()}catch(t){var n="Chip configuration check failed: "+t.toString();g.error(n,e.getId(),_);i(n)}}.bind(this))};this._createBookmarkTile=function(e,t,i,r,n,a){return Promise.all([sap.ushell.Container.getServiceAsync("PageBuilding"),this._getTileTargetConfiguration(t)]).then(function(t){var r=t[0];var s=t[1];if(!i.tileConfiguration){i.tileConfiguration=JSON.stringify(s)}else{var u=JSON.parse(i.tileConfiguration);u=o({},u,s);i.tileConfiguration=JSON.stringify(u)}var l=r.getFactory();var c=l.getPageBuildingService();return new Promise(function(t,r){if(this._bPageSetFullyLoaded){a=a||this._oCurrentPageSet.getDefaultPage();var o=l.createChipInstance({chipId:e,pageId:a.getId(),title:n,configuration:JSON.stringify(i),layoutData:""});a.addChipInstance(o,t,r,undefined)}else{try{c.createPageChipInstanceFromRawData({chipId:e,configuration:JSON.stringify(i),pageId:"/UI2/Fiori2LaunchpadHome",title:n},function(e){l.createChipInstance(e,t,r,undefined)},r)}catch(e){r(e)}}}.bind(this))}.bind(this)).then(function(e){return this._updateBags(e,r).then(function(){return this._checkBookmarkConfiguration(e)}.bind(this)).catch(function(t){return new Promise(function(i,r){e.remove(r.bind(undefined,t),r.bind(undefined,t))})})}.bind(this))};S.prototype._isBookmarkFor=function(e,t){var i=e.getChip().getBaseChipId();if(i!==undefined){var r=$(e).navigation_target_url;if(typeof t==="string"){return H(e)&&r===t}return t.chipId===i&&t.url===r}return false};S.prototype._visitBookmarks=function(e,t){var i=[];var r=new jQuery.Deferred;B.getGroupsAndWaitForAllChips().then(function(n){var a=0;n.forEach(function(r){r.getChipInstances().forEach(function(r){if(B._isBookmarkFor(r,e)){a+=1;if(t){i.push(t(r))}}})});if(i.length===0){r.resolve(a)}else{jQuery.when.apply(jQuery,i).fail(function(e){r.reject(e)}).done(function(){r.resolve(a)})}}).catch(function(e){r.reject(e.message||e)});return r.promise()};this._visitCustomBookmarks=function(e,t){if(!e.chipId){return Promise.reject("_visitCustomBookmarks: Required parameter is missing: oIdentifier.chipId")}return new Promise(function(i,r){this.getGroups().fail(r).done(function(n){var a=[];var o=0;n.forEach(function(i){i.getChipInstances().forEach(function(i){if(S.prototype._isBookmarkFor(i,e)){o+=1;if(t){a.push(t(i))}}})});Promise.all(a).then(function(){i(o)}).catch(r)})}.bind(this))};this.countBookmarks=function(e){return S.prototype._visitBookmarks(e)};this.countCustomBookmarks=function(e){return this._visitCustomBookmarks(e)};this.deleteBookmarks=function(e){return S.prototype._visitBookmarks(e,function(e){var t=new jQuery.Deferred;e.remove(t.resolve.bind(t),t.reject.bind(t));return t.promise()})};this.deleteCustomBookmarks=function(e){return this._visitCustomBookmarks(e,function(e){return new Promise(function(t,i){e.remove(t,i)})})};this.updateBookmarks=function(e,t){return S.prototype._visitBookmarks(e,function(e){var i=$(e);var r=new jQuery.Deferred;var n={tileProperties:{texts:{}}};if(t.title){n.tileProperties.texts.display_title_text=t.title}if(typeof t.subtitle==="string"){n.tileProperties.texts.display_subtitle_text=t.subtitle}if(typeof t.info==="string"){n.tileProperties.texts.display_info_text=t.info}var a={display_icon_url:typeof t.icon==="string"?t.icon:i.display_icon_url,display_info_text:typeof t.info==="string"?t.info:i.display_info_text,display_subtitle_text:typeof t.subtitle==="string"?t.subtitle:i.display_subtitle_text,display_title_text:t.title||i.display_title_text,display_number_unit:typeof t.numberUnit==="string"?t.numberUnit:i.display_number_unit,service_refresh_interval:t.serviceRefreshInterval||i.service_refresh_interval,service_url:t.serviceUrl||i.service_url};var s={};this._getTileTargetConfiguration(t.url||i.navigation_target_url).then(function(e){a=o({},a,e);s.tileConfiguration=JSON.stringify(a)}).then(function(){return new Promise(function(t,i){e.updateConfiguration(s,t,i)})}).then(function(){e.getContract("configuration").fireConfigurationUpdated(Object.keys(s));return this._updateBags(e,n)}.bind(this)).then(function(t){if(t.length){e.getContract("bag").fireBagsUpdated(t)}r.resolve()}).catch(function(e){r.reject(e.toString())});return r.promise()}.bind(this))};this.updateCustomBookmarks=function(e,t){var r=i.get(["vizConfig","sap.flp","chipConfig"],t)||{};var n=r.configuration||{};var a=r.bags||{};var s=t.url;return this._visitCustomBookmarks(e,function(e){return this._getTileTargetConfiguration(s).then(function(t){var i;if(!n.tileConfiguration){i=$(e);i=o({},i,t);n.tileConfiguration=JSON.stringify(i)}else{i=JSON.parse(n.tileConfiguration);i=o({},i,t);n.tileConfiguration=JSON.stringify(i)}return new Promise(function(t,i){try{e.updateConfiguration(n,t,i)}catch(e){i(e)}})}).then(function(){e.getContract("configuration").fireConfigurationUpdated(Object.keys(n));return this._checkBookmarkConfiguration(e)}.bind(this)).then(function(){return this._updateBags(e,a)}.bind(this)).then(function(i){if(i.length){e.getContract("bag").fireBagsUpdated(i)}return new Promise(function(i,r){if(t.title){e.setTitle(t.title,true,i,r)}else{i()}})})}.bind(this))};this.onCatalogTileAdded=function(){O=false};this.isCustomTile=function(e){return!H(e)}};S.prototype._getCatalogTileIndex=function(){this._oCatalogTileIndexPromise=sap.ushell.Container.getServiceAsync("PageBuilding").then(function(e){var t=e.getFactory().getPageBuildingService();return new Promise(function(e,i){t.readAllCatalogs(P,e,i,"type eq 'CATALOG_PAGE' or type eq 'H' or type eq 'SM_CATALOG' or type eq 'REMOTE'","title",true)})}).then(function(e){var t={};e.results.forEach(function(e){e.Chips.results.forEach(function(e){var i;if(a.last("/core/stableIDs/enabled")&&e.referenceChipId){i=e.referenceChipId}else{i=e.id}if(!t[i]){t[i]=e}})});return t}).catch(function(){return{}});return this._oCatalogTileIndexPromise};return S});
//# sourceMappingURL=LaunchPageAdapter.js.map
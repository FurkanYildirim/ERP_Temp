/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/LinkDelegate","sap/ui/mdc/link/LinkItem","sap/ui/mdc/link/Factory","sap/ui/mdc/link/Log","sap/base/Log","sap/base/util/isPlainObject","sap/ui/mdc/link/SemanticObjectMapping","sap/ui/mdc/link/SemanticObjectMappingItem","sap/ui/mdc/link/SemanticObjectUnavailableAction"],function(e,t,n,i,a,r,c,o,u){"use strict";var s=Object.assign({},e);s.apiVersion=2;s.fetchLinkItems=function(e,t,n){var a=e.getPayload();var r=t?t.getObject(t.getPath()):undefined;var c=[];if(n){n.initialize(s._getSemanticObjects(a));c.forEach(function(e){n.addIntent(i.IntentType.API,{text:e.getText(),intent:e.getHref()})})}var o=s._calculateSemanticAttributes(r,a,n);return s._retrieveNavigationTargets("",o,a,n).then(function(e,t){return Promise.resolve(e)})};s.fetchLinkType=function(e){var t={};var i=null;var r=e.getPayload();var c=function(e){return e.filter(function(e){return!t[e]}).length===0};var o=function(e){return e.some(function(e){return t[e]&&t[e].exists===true})};var u=function(){if(!i){i=new Promise(function(e){var r=n.getService("CrossApplicationNavigation");if(!r){a.error("FlpLinkDelegate: Service 'CrossApplicationNavigation' could not be obtained");e({});return}r.getDistinctSemanticObjects().then(function(n){n.forEach(function(e){t[e]={exists:true}});i=null;return e(t)},function(){a.error("FlpLinkDelegate: getDistinctSemanticObjects() of service 'CrossApplicationNavigation' failed");return e({})})})}return i};var s=function(e){if(c(e)){return Promise.resolve(o(e))}return u().then(function(){return o(e)})};if(r&&r.semanticObjects){return s(r.semanticObjects).then(function(e){return Promise.resolve({type:e?2:0,directLink:undefined})})}else{throw new Error("no payload or semanticObjects found")}};s._calculateSemanticAttributes=function(e,t,n){var i=s._getSemanticObjects(t);var c=s._convertSemanticObjectMapping(s._getSemanticObjectMappings(t));if(!i.length){i.push("")}var o={};i.forEach(function(t){if(n){n.addContextObject(t,e)}o[t]={};for(var i in e){var u=null,s=null;if(n){u=n.getSemanticObjectAttribute(t,i);if(!u){u=n.createAttributeStructure();n.addSemanticObjectAttribute(t,i,u)}}if(e[i]===undefined||e[i]===null){if(u){u.transformations.push({value:undefined,description:"ℹ Undefined and null values have been removed in FlpLinkDelegate."})}continue}if(r(e[i])){if(u){u.transformations.push({value:undefined,description:"ℹ Plain objects has been removed in FlpLinkDelegate."})}continue}var l=c&&c[t]&&c[t][i]?c[t][i]:i;if(u&&i!==l){s={value:undefined,description:"ℹ The attribute "+i+" has been renamed to "+l+" in FlpLinkDelegate.",reason:"🔴 A com.sap.vocabularies.Common.v1.SemanticObjectMapping annotation is defined for semantic object "+t+" with source attribute "+i+" and target attribute "+l+". You can modify the annotation if the mapping result is not what you expected."}}if(o[t][l]){a.error("FlpLinkDelegate: The attribute "+i+" can not be renamed to the attribute "+l+" due to a clash situation. This can lead to wrong navigation later on.")}o[t][l]=e[i];if(u){if(s){u.transformations.push(s);var f=n.createAttributeStructure();f.transformations.push({value:e[i],description:"ℹ The attribute "+l+" with the value "+e[i]+" has been added due to a mapping rule regarding the attribute "+i+" in FlpLinkDelegate."});n.addSemanticObjectAttribute(t,l,f)}}}});return o};s._retrieveNavigationTargets=function(e,i,r,c){if(!r.semanticObjects){return new Promise(function(e){e([])})}var o=r.semanticObjects;var u=r.sourceControl;var l={ownNavigation:undefined,availableActions:[]};return sap.ui.getCore().loadLibrary("sap.ui.fl",{async:true}).then(function(){return new Promise(function(f){sap.ui.require(["sap/ui/fl/Utils"],function(v){var b=n.getService("CrossApplicationNavigation");var g=n.getService("URLParsing");if(!b||!g){a.error("FlpLinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");return f(l.availableActions,l.ownNavigation)}var p=sap.ui.getCore().byId(u);var m=v.getAppComponentForControl(p);var d=o.map(function(t){return[{semanticObject:t,params:i?i[t]:undefined,appStateKey:e,ui5Component:m,sortResultsBy:"text"}]});return new Promise(function(){b.getLinks(d).then(function(e){if(!e||!e.length){return f(l.availableActions,l.ownNavigation)}var n=s._getSemanticObjectUnavailableActions(r);var i=s._convertSemanticObjectUnavailableAction(n);var a=b.hrefForExternal();if(a&&a.indexOf("?")!==-1){a=a.split("?")[0]}if(a){a+="?"}var u=function(e,t){return!!i&&!!i[e]&&i[e].indexOf(t)>-1};var v=function(e){var n=g.parseShellHash(e.intent);if(u(n.semanticObject,n.action)){return}var i=b.hrefForExternal({target:{shellHash:e.intent}},m);if(e.intent&&e.intent.indexOf(a)===0){l.ownNavigation=new t({href:i,text:e.text,internalHref:e.intent});return}var r=new t({key:n.semanticObject&&n.action?n.semanticObject+"-"+n.action:undefined,text:e.text,description:undefined,href:i,internalHref:e.intent,icon:undefined,initiallyVisible:e.tags&&e.tags.indexOf("superiorAction")>-1});l.availableActions.push(r);if(c){c.addSemanticObjectIntent(n.semanticObject,{intent:r.getHref(),text:r.getText()})}};for(var p=0;p<o.length;p++){e[p][0].forEach(v)}return f(l.availableActions,l.ownNavigation)},function(){a.error("FlpLinkDelegate: '_retrieveNavigationTargets' failed executing getLinks method");return f(l.availableActions,l.ownNavigation)})})})})})};s._getSemanticObjects=function(e){return e.semanticObjects?e.semanticObjects:[]};s._getSemanticObjectUnavailableActions=function(e){var t=[];if(e.semanticObjectUnavailableActions){e.semanticObjectUnavailableActions.forEach(function(e){t.push(new u({semanticObject:e.semanticObject,actions:e.actions}))})}return t};s._getSemanticObjectMappings=function(e){var t=[];var n=[];if(e.semanticObjectMappings){e.semanticObjectMappings.forEach(function(e){n=[];if(e.items){e.items.forEach(function(e){n.push(new o({key:e.key,value:e.value}))})}t.push(new c({semanticObject:e.semanticObject,items:n}))})}return t};s._convertSemanticObjectMapping=function(e){if(!e.length){return undefined}var t={};e.forEach(function(e){if(!e.getSemanticObject()){throw Error("FlpLinkDelegate: 'semanticObject' property with value '"+e.getSemanticObject()+"' is not valid")}t[e.getSemanticObject()]=e.getItems().reduce(function(e,t){e[t.getKey()]=t.getValue();return e},{})});return t};s._convertSemanticObjectUnavailableAction=function(e){if(!e.length){return undefined}var t={};e.forEach(function(e){if(!e.getSemanticObject()){throw Error("FlpLinkDelegate: 'semanticObject' property with value '"+e.getSemanticObject()+"' is not valid")}t[e.getSemanticObject()]=e.getActions()});return t};return s});
//# sourceMappingURL=FlpLinkDelegate.js.map
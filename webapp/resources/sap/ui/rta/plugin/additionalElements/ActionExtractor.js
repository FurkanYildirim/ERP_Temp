/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/restricted/_difference","sap/base/util/merge","sap/base/Log","sap/ui/core/util/reflection/JsControlTreeModifier","sap/ui/dt/ElementUtil","sap/ui/dt/OverlayRegistry","sap/ui/fl/apply/api/DelegateMediatorAPI","sap/ui/rta/plugin/additionalElements/AdditionalElementsUtils","sap/ui/rta/Utils"],function(e,t,n,r,a,i,o,l,u){"use strict";var g={};function s(){var e=[];var t=o.getKnownDefaultDelegateLibraries();t.forEach(function(t){var r=sap.ui.getCore().loadLibrary(t,{async:true}).then(function(){return Promise.resolve(t)}).catch(function(e){n.warning("Required library not available: ",e);return Promise.resolve()});e.push(r)});return Promise.all(e)}function f(e,t,n){return n.hasChangeHandler(e.changeType,e.element).then(function(n){if(n){return{aggregationName:e.aggregation,addPropertyActionData:{designTimeMetadata:t,action:e,delegateInfo:{payload:e.delegateInfo.payload||{},delegate:e.delegateInfo.instance,modelType:e.delegateInfo.modelType,requiredLibraries:e.delegateInfo.requiredLibraries}}}}return undefined})}function c(e,t,n){var r=e.getElement();if(!r){return[]}var o=a.getAggregation(r,t,n).filter(function(t){var r=i.getOverlay(t);if(!n.hasStableId(r)){return false}var a=e.getRelevantContainer(true);var o=i.getOverlay(a);var l=e;var u=false;do{u=!l.getElementVisibility();if(u){break}if(l===o){break}else{l=l.getParentElementOverlay()}}while(l);if(u){return true}return r.getElementVisibility()===false},this);return o.map(function(e){return{element:e,sourceAggregation:t}})}function d(e,t){return t.sParentAggregationName}function v(e,t,n,r){var a=n.changeType&&r.hasStableId(e);if(a&&e!==t.relevantContainerOverlay){a=r.hasStableId(t.relevantContainerOverlay)}return a}function h(t,n,a,l){function u(t,u){var g=u.changeOnRelevantContainer?n.relevantContainer:n.parent;var s=i.getOverlay(g);var f=v(s,n,u,a);if(f){u.element=g;return o.getDelegateForControl({control:n.relevantContainer,modifier:r,supportsDefault:u.supportsDefaultDelegate}).then(function(r){if(r&&r.names&&r.names.length){var a=o.getRequiredLibrariesForDefaultDelegate({delegateName:r.names,control:n.relevantContainer});if(e(a,l.filter(Boolean)).length===0){u.delegateInfo=r;t.push(u)}}return t})}return t}return t.reduce(function(e,t){return e.then(function(e){return u(e,t)})},Promise.resolve([]))}function m(e,t,n,r,a){var i=e.reduce(function(e,t){var n=[];r.forEach(function(e){n=n.concat(c.call(this,t,e,a))}.bind(this),[]);return t?e.concat(n):e}.bind(this),[]);var o={elements:[],controlTypeNames:[]};var l=i.reduce(function(e,t){return e.then(function(e){return p(e,t,a,n)})},Promise.resolve(o));return l.then(function(e){if(e.elements.length>0){t[n]={reveal:e}}return t})}function p(e,t,n,r){var o=t.element;var g;var s;var f=false;var c=Promise.resolve(false);var v=t.sourceAggregation;var h=i.getOverlay(o);if(h){g=h.getDesignTimeMetadata();s=g&&g.getAction("reveal",o);if(s&&s.changeType){var m=o;if(s.changeOnRelevantContainer){m=h.getRelevantContainer()}c=n.hasChangeHandler(s.changeType,m).then(function(e){if(a.isElementValid(o)){var t=l.getParents(true,h,n);if(e){if(s.changeOnRelevantContainer){f=n.hasStableId(t.relevantContainerOverlay)&&n.hasStableId(t.parentOverlay)}else{f=true}if(!s.getAggregationName){s.getAggregationName=d}if(f&&v!==r){var i=t.parentOverlay.getAggregationOverlay(r);return u.checkTargetZone(i,h,n)}}}return f})}}return c.then(function(t){if(t){e.elements.push({element:o,designTimeMetadata:g,action:s,sourceAggregation:v,targetAggregation:r});var n=g.getName(o);if(n){e.controlTypeNames.push(n)}}return e})}g.getActions=function(e,n,r,a,i){var o=e?"asSibling":"asChild";if(!a&&n._mAddActions){return Promise.resolve(n._mAddActions[o])}var l=this._getRevealActions(e,n,r,i);var u=this._getAddViaDelegateActions(e,n,r);return Promise.all([l,u]).then(function(e){var r=t(e[0],e[1]);n._mAddActions=n._mAddActions||{asSibling:{},asChild:{}};n._mAddActions[o]=r;return r})};g.getActionsOrUndef=function(e,t){var n=e?"asSibling":"asChild";return t._mAddActions&&t._mAddActions[n]};var y={};var A=true;g._getRevealActions=function(e,t,n,r){if(A){A=false;r.attachEventOnce("synced",function(){y={};A=true},this)}var o=l.getParents(e,t,n);var u=[o.parentOverlay];if(o.relevantContainer!==o.parent){u=a.findAllSiblingsInContainer(o.parent,o.relevantContainer).map(function(e){return i.getOverlay(e)}).filter(function(e){return e})}var g=[];if(o.parentOverlay){var s=y[o.parentOverlay.getId()];if(s&&e){return s}g=o.parentOverlay.getChildren().filter(function(e){return!e.getDesignTimeMetadata().isIgnored(o.parent)}).map(function(e){return e.getAggregationName()});return g.reduce(function(e,t){return e.then(function(e){return m(u,e,t,g,n)})},Promise.resolve({})).then(function(t){if(e){y[o.parentOverlay.getId()]=t}return t})}return Promise.resolve({})};g._getAddViaDelegateActions=function(e,t,n){var r=l.getParents(e,t,n);var a=r.parentOverlay&&r.parentOverlay.getDesignTimeMetadata();return Promise.resolve().then(function(){var e=a?a.getActionDataFromAggregations("add",r.parent,undefined,"delegate"):[];if(e.length){return s().then(h.bind(this,e,r,n))}return[]}.bind(this)).then(function(e){return e.reduce(function(e,t){return e.then(function(e){return f.call(this,t,a,n).then(function(t){if(t){t.addPropertyActionData.relevantContainer=r.relevantContainer;if(!e[t.aggregationName]){e[t.aggregationName]={}}e[t.aggregationName].addViaDelegate=t.addPropertyActionData}return e})}.bind(this))}.bind(this),Promise.resolve({}))}.bind(this))};return g});
//# sourceMappingURL=ActionExtractor.js.map
/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./WaiterBase","./_utils","sap/ui/thirdparty/jquery"],function(i,t,jQuery){"use strict";var e=600;var n=i.extend("sap.ui.test.autowaiter._cssAnimationWaiter",{constructor:function(){i.apply(this,arguments);this._oTrackedAnimations=new Set;var e=new window.MutationObserver(function(i){var t,e;i.forEach(function(i){if(i.type==="attributes"){this._trackDelayedAnimation(i.target)}else if(i.type==="childList"){i.addedNodes.forEach(function(i){this._trackDelayedAnimation(i)},this);t=i.nextSibling;e=i.previousSibling;t&&this._trackDelayedAnimation(t);e&&this._trackDelayedAnimation(e)}},this)}.bind(this));t.onElementAvailable("body",function(i){jQuery(i).on("webkitAnimationStart animationstart",function(i){this._register(i.target,i.originalEvent.type)}.bind(this));jQuery(i).on("webkitAnimationEnd webkitAnimationCancel animationend animationcancel",function(i){this._deregister(i.target,i.originalEvent.type)}.bind(this));e.observe(i,{attributes:true,childList:true,subtree:true})}.bind(this))},hasPending:function(){var i=this._oTrackedAnimations.size>0;this._oLogger.trace("hasPending",i);if(i){this._oHasPendingLogger.debug("cssAnimation in progress")}return i},_trackDelayedAnimation:function(i){var t=i.children;if(this._hasDelayedAnimation(i)){this._register(i,"observed animation with delay")}if(t){for(var e=0;e<t.length;e++){this._trackDelayedAnimation(t[e])}}},_hasDelayedAnimation:function(i){var t=i.nodeType===Node.ELEMENT_NODE,e=t&&getComputedStyle(i);return e&&e.animationName!=="none"&&parseInt(e.animationDelay)},_register:function(i,t){this._log("register",i,t);if(!this._oTrackedAnimations.has(i)){this._oTrackedAnimations.add(i);setTimeout(function(){if(this._oTrackedAnimations.has(i)){this._deregister(i,"timed out")}}.bind(this),e,"TIMEOUT_WAITER_IGNORE")}},_deregister:function(i,t){this._log("deregister",i,t);if(this._oTrackedAnimations.has(i)){this._oTrackedAnimations.delete(i)}},_log:function(i,t,e){this._oLogger.trace(i,"ElementId: "+t.id+" Reason: "+e+" Animation: "+getComputedStyle(t).animation)}});return new n});
//# sourceMappingURL=_cssAnimationWaiter.js.map
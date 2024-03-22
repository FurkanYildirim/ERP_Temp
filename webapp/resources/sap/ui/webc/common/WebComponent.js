/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Control","sap/ui/core/Element","./WebComponentMetadata","./WebComponentRenderer","sap/base/strings/hyphenate","sap/base/strings/camelize","sap/ui/core/library","sap/ui/core/LabelEnablement"],function(t,e,r,n,o,i,a,s){"use strict";var u=a.TextDirection;var p=function(t){if(t.id&&e.registry.get(t.id)){return e.registry.get(t.id)}};var f=function(t,e,r){if(e===undefined){e=0}if(r===undefined){r=2}if(t==null){return t}if(t instanceof window.HTMLElement){var n=p(t);return n?n:t}if(e<r){if(Array.isArray(t)){return t.map(f,e+1,r)}if(typeof t==="object"){var o={};for(var i in t){if(t.hasOwnProperty(i)){o[i]=f(t[i],e+1,r)}}return o}}return t};var d=t.extend("sap.ui.webc.common.WebComponent",{metadata:{stereotype:"webcomponent",abstract:true,library:"sap.ui.webc.common",properties:{__isBusy:{type:"boolean",visibility:"hidden",defaultValue:false,mapping:{type:"attribute",to:"__is-busy"}}}},constructor:function(e,r){t.apply(this,arguments);this.__busyIndicatorTimeout=null;this.__onInvalidationBound=this.__onInvalidation.bind(this);this.__handleCustomEventBound=this.__handleCustomEvent.bind(this);this.__delegates={onBeforeRendering:this.__onBeforeRenderingDelegate,onAfterRendering:this.__onAfterRenderingDelegate};this.addDelegate(this.__delegates,true,this,false)},renderer:n},r);d.prototype._setSlot=function(t,e){var r=["tooltip","customData","layoutData","dependents","dragDropConfig"];if(t&&!r.includes(e)){var n=this.getMetadata().getAggregationSlot(e);t.__slot=n}};d.prototype._unsetSlot=function(t){if(t){delete t.__slot}};d.prototype.setAggregation=function(e,r,n){var o=t.prototype.setAggregation.apply(this,arguments);this._setSlot(r,e);return o};d.prototype.insertAggregation=function(e,r,n,o){var i=t.prototype.insertAggregation.apply(this,arguments);this._setSlot(r,e);return i};d.prototype.addAggregation=function(e,r,n){var o=t.prototype.addAggregation.apply(this,arguments);this._setSlot(r,e);return o};d.prototype.removeAggregation=function(e,r,n){var o=t.prototype.removeAggregation.apply(this,arguments);this._unsetSlot(o);return o};d.prototype.removeAllAggregation=function(e,r){var n=t.prototype.removeAllAggregation.apply(this,arguments);n.forEach(function(t){this._unsetSlot(t)},this);return n};d.prototype.__onBeforeRenderingDelegate=function(){this.__detachCustomEventsListeners()};d.prototype.__onAfterRenderingDelegate=function(){this.__attachCustomEventsListeners();var t=this.getDomRef();window.customElements.whenDefined(t.localName).then(function(){t.attachInvalidate(this.__onInvalidationBound);if(t._individualSlot){this.__slot=t._individualSlot}this.__updateObjectProperties(t)}.bind(this))};d.prototype.__updateObjectProperties=function(t){var e=this.getMetadata().getPropertiesByMapping("attribute");for(var r in e){if(this.isPropertyInitial(r)){continue}var n=e[r];var o=n.get(this);if(n.type==="object"||typeof o==="object"){var i=n._sMapTo?n._sMapTo:r;t[i]=o}}};d.prototype.setBusy=function(t){var e=this.getBusy();this.setProperty("busy",t,true);if(e!==t){if(t){this.__busyIndicatorTimeout=setTimeout(function(){this.setProperty("__isBusy",t)}.bind(this),this.getBusyIndicatorDelay())}else{this.setProperty("__isBusy",t);clearTimeout(this.__busyIndicatorTimeout)}}return this};d.prototype.__onInvalidation=function(t){if(t.type==="property"){var e=t.name;var r=t.newValue;var n=this.getMetadata().getProperty(e);if(n){this.setProperty(e,r,true)}}};d.prototype.__attachCustomEventsListeners=function(){var t=this.getMetadata().getEvents();for(var e in t){var r=o(e);this.getDomRef().addEventListener(r,this.__handleCustomEventBound)}};d.prototype.__detachCustomEventsListeners=function(){var t=this.getDomRef();if(!t){return}var e=this.getMetadata().getEvents();for(var r in e){if(e.hasOwnProperty(r)){var n=o(r);t.removeEventListener(n,this.__handleCustomEventBound)}}};d.prototype.__handleCustomEvent=function(t){var e=t.type;var r=i(e);var n=this.__formatEventData(t.detail);var o=this.getMetadata().getEvent(r);var a=!o.fire(this,n);if(a){t.preventDefault()}};d.prototype.__formatEventData=function(t){if(typeof t==="object"){return f(t)}return{}};d.prototype.__callPublicMethod=function(t,r){if(!this.getDomRef()){throw new Error("Method called before custom element has been created by: "+this.getId())}var n=Array.from(r).map(function(t){if(t instanceof e){return t.getDomRef()}return t});var o=this.getDomRef()[t].apply(this.getDomRef(),n);if(typeof o==="object"){o=f(o)}return o};d.prototype.__callPublicGetter=function(t){if(!this.getDomRef()){throw new Error("Getter called before custom element has been created by: "+this.getId())}var e=this.getDomRef()[t];if(typeof e==="object"){e=f(e)}return e};d.prototype.destroy=function(){var e=this.getDomRef();this.__detachCustomEventsListeners();if(e&&typeof e.detachInvalidate==="function"){e.detachInvalidate(this.__onInvalidationBound)}return t.prototype.destroy.apply(this,arguments)};d.prototype._mapEnabled=function(t){return!t};d.prototype._mapTextDirection=function(t){if(t===u.Inherit){return null}return t.toLowerCase()};d.prototype._getAriaLabelledByForRendering=function(t){var e=s.getReferencingLabels(this);if(Array.isArray(t)){t.forEach(function(t){if(e.indexOf(t)<0){e.unshift(t)}})}return e.join(" ")};return d});
//# sourceMappingURL=WebComponent.js.map
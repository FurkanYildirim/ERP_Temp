/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","sap/ui/core/Control","sap/base/strings/hyphenate"],function(t,e,r){"use strict";var a={apiVersion:2};a.render=function(t,e){var r=e.getMetadata().getTag();t.openStart(r,e);this.renderAttributeProperties(t,e);this.renderStyleProperties(t,e);this.renderAssociationProperties(t,e);this.renderTooltipAggregation(t,e);this.customRenderInOpeningTag(t,e);this.preserveUnmanagedAttributes(t,e);this.preserveUnmanagedStyles(t,e);t.openEnd();this.renderTextContentProperties(t,e);this.renderSlotProperties(t,e);this.renderAggregations(t,e);this.customRenderInsideTag(t,e);t.close(r)};a.renderAttributeProperties=function(t,e){var a=e.getMetadata().getPropertiesByMapping("attribute");var n=["enabled"];for(var i in a){if(e.isPropertyInitial(i)&&!n.includes(i)){continue}var o=a[i];var s=o.get(e);if(o.type==="object"||typeof s==="object"){continue}var p=o._sMapTo?o._sMapTo:r(i);if(o._fnMappingFormatter){s=e[o._fnMappingFormatter].call(e,s)}if(o.type==="boolean"){if(s){t.attr(p,"")}}else{if(s!=null){t.attr(p,s)}}}};a.preserveUnmanagedAttributes=function(t,e){var r=e.getDomRef();if(!r){return}var a=r.getAttributeNames();var n=["id","data-sap-ui","style","class","__is-busy"];a.forEach(function(a){if(n.indexOf(a)!==-1){return}if(e.getMetadata().isManagedAttribute(a)){return}var i=r.getAttribute(a);if(i!==null){t.attr(a,i)}})};a.preserveUnmanagedStyles=function(t,e){var a=e.getDomRef();if(!a){return}var n=Array.prototype.slice.apply(a.style);if(n.length===0){return}var i=e.getMetadata().getPropertiesByMapping("style");var o=[];for(var s in i){var p=i[s];var g=p._sMapTo?p._sMapTo:r(s);o.push(g)}n.forEach(function(e){if(o.indexOf(e)!==-1){return}var r=e.startsWith("--")?window.getComputedStyle(a).getPropertyValue(e):a.style[e];t.style(e,r)})};a.renderStyleProperties=function(t,e){var a=e.getMetadata().getPropertiesByMapping("style");for(var n in a){var i=a[n];var o=i._sMapTo?i._sMapTo:r(n);var s=i.get(e);if(i._fnMappingFormatter){s=e[i._fnMappingFormatter].call(e,s)}if(s!=null){t.style(o,s)}}};a.renderAssociationProperties=function(t,e){var a=e.getMetadata().getAssociationsWithMapping();for(var n in a){var i=a[n];var o=i.get(e);var s=r(i._sMapTo);if(i._fnMappingFormatter){o=e[i._fnMappingFormatter].call(e,o)}if(!i.multiple&&o&&typeof o==="object"){o=o.getId()}if(o){t.attr(s,o)}}};a.renderTooltipAggregation=function(t,e){var r=e.getTooltip_Text();if(r){t.attr("tooltip",r)}};a.renderTextContentProperties=function(t,e){var r=e.getMetadata().getPropertiesByMapping("textContent");for(var a in r){var n=r[a];var i=n.get(e);if(n._fnMappingFormatter){i=e[n._fnMappingFormatter].call(e,i)}t.text(i)}};a.renderSlotProperties=function(t,e){var r=e.getMetadata().getPropertiesByMapping("slot");for(var a in r){var n=r[a];var i=n.get(e);if(n._fnMappingFormatter){i=e[n._fnMappingFormatter].call(e,i)}var o=n._sMapTo?n._sMapTo:"span";if(i){t.openStart(o);t.attr("slot",a);t.openEnd();t.text(i);t.close(o)}}};a.renderAggregations=function(r,a){var n=a.getMetadata().getAllAggregations();for(var i in n){if(t.getMetadata().getAggregations().hasOwnProperty(i)||e.getMetadata().getAggregations().hasOwnProperty(i)){continue}var o=n[i];var s=o.get(a);if(o.multiple){s.forEach(r.renderControl,r)}else{if(s){r.renderControl(s)}}}};a.customRenderInOpeningTag=function(t,e){};a.customRenderInsideTag=function(t,e){};return a});
//# sourceMappingURL=WebComponentRenderer.js.map
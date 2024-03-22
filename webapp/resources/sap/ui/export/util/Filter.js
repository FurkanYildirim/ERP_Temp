/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/base/Object"],function(t){"use strict";var e=t.extend("sap.ui.export.util.Filter",{constructor:function(t,e,r){this.property=t;this.rawValues=Array.isArray(e)?e:[e];this.label=typeof r==="string"?r:undefined}});e.prototype.getProperty=function(){return this.property};e.prototype.getLabel=function(){return this.label||this.property};e.prototype.getValue=function(){var t,e;t=[];e=this.type?this.format||this.type.formatValue.bind(this.type):this.format;this.getRawValues().forEach(function(r){var i=r.value;if(typeof e==="function"){if(Array.isArray(r.value)){i=[];r.value.forEach(function(t){try{i.push(e(t,"string"))}catch(e){i.push(t)}})}else{try{i=e(r.value,"string")}catch(t){}}}switch(r.operator){case"==":i="="+i;break;case"between":i=i[0]+"..."+i[1];break;case"contains":i="*"+i+"*";break;case"endswith":i="*"+i;break;case"startswith":i+="*";break;default:i=r.operator+i}if(r.exclude){i="!"+i}t.push(i)});return t.join("; ")};e.prototype.getRawValues=function(){return this.rawValues};e.prototype.setFormat=function(t){if(typeof t!=="function"&&t!==null){return}this.format=t};e.prototype.setLabel=function(t){if(typeof t!=="string"||!t){return}this.label=t};e.prototype.setType=function(t){if(!t||typeof t.isA!=="function"||!t.isA("sap.ui.model.SimpleType")){return}this.type=t};return e},true);
//# sourceMappingURL=Filter.js.map
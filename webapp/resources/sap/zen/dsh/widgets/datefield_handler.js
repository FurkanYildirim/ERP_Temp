/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/zen/dsh/utils/BaseHandler"],function(jQuery,BaseHandler){"use strict";var DateFieldHandler=function(){BaseHandler.apply(this,arguments);var dispatcher=BaseHandler.dispatcher;var that=this;function init(e,t){e.setTooltip(t.tooltip);e.setEnabled(t.enabled);if(t.date){e.setYyyymmdd(t.date)}else if(dispatcher.isMainMode()||e.getYyyymmdd()){e.setYyyymmdd("")}e.setLocale(t.locale)}function addevents(e,t){e.attachChange(function(){fireEvent(e,t)})}function fireEvent(oControl,oControlProperties){var onchange=that.prepareCommand(oControlProperties.onchange,"__VALUE__",oControl.getYyyymmdd());eval(onchange)}this.create=function(e,t){var n=t["id"];var a=this.createDefaultProxy(n);wrapFunctions(a);init(a,t);addevents(a,t);return a};this.update=function(e,t){if(t){init(e,t)}return e};this.getDefaultProxyClass=function(){return["sap.m.DatePicker","sap.ui.commons.DatePicker"]};this.getDecorator=function(){return"FixedHeightDecorator"};this.getType=function(){return"datefield"};var wrapFunctions=function(e){if(dispatcher.isMainMode()){e.setYyyymmdd=function(e){if(e===""){this.setDateValue(null);this.setPlaceholder(" ")}else{var t=new Date;var n=parseInt(e.substring(0,4));var a=e.substring(4,6);var i=e.substring(6,8);if(a.indexOf("0")===0){a=a.substring(1)}a=parseInt(a)-1;if(i.indexOf("0")===0){i=i.substring(1)}i=parseInt(i);t.setYear(n);t.setMonth(a);t.setDate(i);this.setDateValue(t)}};e.setLocale=function(){};e.getYyyymmdd=function(){var e=this.getDateValue();if(e==null){return""}var t=e.getFullYear()+"";var n=e.getMonth();n+=1;if(n<=9){n=0+""+n}t+=n;var a=e.getDate();if(a<=9){a=0+""+a}t+=a;return t}}}};var instance=new DateFieldHandler;BaseHandler.addHandlers(instance.getType(),instance);return instance});
//# sourceMappingURL=datefield_handler.js.map
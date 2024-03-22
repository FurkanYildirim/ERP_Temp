/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/zen/dsh/utils/BaseHandler"],function(jQuery,BaseHandler){"use strict";var CheckboxHandler=function(){BaseHandler.apply(this,arguments);var dispatcher=BaseHandler.dispatcher;var that=this;function fireEvent(oControlProperties,checked){var onclick=that.prepareCommand(oControlProperties.onclick,oControlProperties.status,""+checked);eval(onclick)}function init(e,t){e.setTooltip(t.tooltip);e.setEnabled(t.enabled);e.setChecked(t.checked);e.setText(t.text)}function addevents(e,t){e.attachChange(function(e){if(dispatcher.isMainMode()){fireEvent(t,e.getParameters().selected)}else{fireEvent(t,e.getParameters().checked)}})}this.create=function(e,t){var n=t["id"];var a=this.createDefaultProxy(n);init(a,t);addevents(a,t);return a};this.update=function(e,t){if(t){init(e,t)}return e};this.getDefaultProxyClass=function(){return["sap.m.CheckBox","sap.ui.commons.CheckBox"]};this.provideFunctionMapping=function(){return[["setSelected","setChecked"],["attachSelect","attachChange"]]};this.getType=function(){return"checkbox"};this.getDecorator=function(){return"FixedHeightDecorator"}};var instance=new CheckboxHandler;BaseHandler.dispatcher.addHandlers(instance.getType(),instance);return instance});
//# sourceMappingURL=checkbox_handler.js.map
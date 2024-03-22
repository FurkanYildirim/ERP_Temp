/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/sac/df/thirdparty/lodash","sap/zen/dsh/utils/BaseHandler","sap/m/RadioButton"],function(jQuery,_,BaseHandler,RadioButton){"use strict";var RadiobuttonGroupHandler=function(){BaseHandler.apply(this,arguments);var dispatcher=BaseHandler.dispatcher;var that=this;function fireEvent(oControl,oControlProperties){var oItem=oControl.getSelectedButton();if(oItem){var key=oItem.key;key+="|SeP|";var command=that.prepareCommand(oControlProperties.command,"__KEYS__",key);eval(command)}}function itemsAreChanged(e,t){var n=t.selectedItems;var r=null;if(n&&n[0]){r=dispatcher.getValue(n[0],"key")}if(e.getSelectedButton()){if(e.getSelectedButton().key!==r){return true}}if(e.getColumns()!==t.columns){return true}var a=t.items;var o=e.getButtons();if(o.length!==a.length){return true}for(var i=0;i<a.length;i++){var u=a[i];var s=u.item.key;var d=u.item.val_0;if(d.length===0){d=s}var l=o[i];var c=l.key;var v=l.getText();if(s!==c||d!==v||l.getEnabled()!==t.enabled){return true}}return false}function init(e,t){if(!itemsAreChanged(e,t)){return}e.destroyButtons();e.setTooltip(t.tooltip);e.setColumns(t.columns);var n=t.selectedItems;var r=null;if(n&&n[0]){r=dispatcher.getValue(n[0],"key")}var a=t.items;for(var o=0;o<a.length;o++){var i=a[o];var u=i.item.key;var s=i.item.val_0;var d=new RadioButton(o);d.key=u;if(s.length===0){s=u}d.setText(s);d.setEnabled(t.enabled);e.addButton(d);if(u===r){e.setSelectedButton(d)}}}function addevents(e,t){e.attachSelect(function(){fireEvent(e,t)})}this.create=function(e,t){var n=t["id"];var r=new sap.m.RadioButtonGroup(n);init(r,t);addevents(r,t);return r};this.update=function(e,t){if(t){init(e,t)}return e};this.getDecorator=function(){return"DataSourceFixedHeightDecorator"};this.getType=function(){return"radiobuttongroup"}};var instance=new RadiobuttonGroupHandler;BaseHandler.dispatcher.addHandlers(instance.getType(),instance);return instance});
//# sourceMappingURL=radiobuttongroup_m_handler.js.map
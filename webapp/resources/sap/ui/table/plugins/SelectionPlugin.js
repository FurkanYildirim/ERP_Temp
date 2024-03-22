/*
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Element","./PluginBase"],function(e,t){"use strict";var o=e.extend("sap.ui.table.plugins.SelectionPlugin",{metadata:{abstract:true,library:"sap.ui.table",properties:{enabled:{type:"boolean",defaultValue:true}},events:{selectionChange:{parameters:{}}}}});for(var r in t.prototype){if(!o.prototype.hasOwnProperty(r)){o.prototype[r]=t.prototype[r]}}o.prototype.setEnabled=function(e){this.setProperty("enabled",e,true);if(this.getEnabled()){this.activate()}else{this.deactivate()}return this};o.prototype.getRenderConfig=function(){return{headerSelector:{type:"none"}}};o.prototype.onHeaderSelectorPress=function(){};o.prototype.onKeyboardShortcut=function(e){};o.prototype.setSelected=function(e,t,o){throw new Error(this+" does not implement #setSelected")};o.prototype.isSelected=function(e){throw new Error(this+" does not implement #isSelected")};o.prototype.getSelectedCount=function(){throw new Error(this+" does not implement #getSelectedCount")};return o});
//# sourceMappingURL=SelectionPlugin.js.map
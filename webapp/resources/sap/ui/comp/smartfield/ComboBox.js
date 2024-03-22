/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/odata/ComboBox","sap/m/ComboBoxRenderer","sap/ui/comp/util/FormatUtil"],function(e,t,r){"use strict";var i="00000000-0000-0000-0000-000000000000";function a(e){return e===i}var s=e.extend("sap.ui.comp.smartfield.ComboBox",{metadata:{library:"sap.ui.comp",properties:{selectedKey:{type:"string",group:"Data",defaultValue:null},enteredValue:{type:"string",group:"Data",defaultValue:null},realValue:{type:"string",group:"Data",defaultValue:null},valueTextArrangement:{type:"string",group:"Misc",defaultValue:""}}},renderer:t});s.prototype.init=function(){e.prototype.init.apply(this,arguments);this.attachChange(function(){var e=this._getValue();this.setProperty("realValue",e)}.bind(this))};s.prototype.onBeforeRendering=function(){e.prototype.onBeforeRendering.apply(this,arguments);this._processValueTextArrangement();this._synchronize()};s.prototype._processValueTextArrangement=function(){var e,t,i,a,s,n,l,u,o=this.getValueTextArrangement();i=this.getSelectedKey();a=this.getItemByKey(""+i);e=a&&a.getBinding("text");if(o&&a&&i!==""&&e&&Array.isArray(e.aBindings)){l=e.aBindings[0];n=e.aBindings[1];t=l&&l.getValue();s=n&&n.getValue();if(i!==t){return}u=r.getFormattedExpressionFromDisplayBehaviour(o,t,s);this.setValue(u)}};s.prototype._synchronize=function(){var e=this.getSelectedKey(),t=this.getKeys(),r=this.getItemByKey(""+e);if(r&&(e!==""||t.indexOf(e)!==-1)&&e===this.getValue()){this.setAssociation("selectedItem",r,true);this._setPropertyProtected("selectedItemId",r.getId(),true);this.setProperty("enteredValue",e);this.setProperty("realValue",e);this.setValue(r.getText());this._sValue=this.getValue()}};s.prototype.validateProperty=function(t,r){if(r===null&&(t==="enteredValue"||t==="selectedItemId"||t==="selectedKey"||t==="realValue"||t==="value")){return r}return e.prototype.validateProperty.apply(this,arguments)};s.prototype.setRealValue=function(e){if(e===null){this.setValue("")}else{this.setValue(e)}this.setSelectedKey(e);return this.setProperty("realValue",e)};s.prototype.setEnteredValue=function(e){var t,r=this.getSelectedItem();if(typeof e!=="undefined"){this.setSelectedKey(e)}if(e&&!r&&!a(e)){this.setValue(e)}t=this._getValue();this.setProperty("enteredValue",t);return this};s.prototype._getValue=function(){var e,t=this.getSelectedKey(),r=this.getSelectedItem();if(r&&t!==null){e=t}else if(t===null&&this.getValue()===""){e=t}else{e=this.getValue()}return e};s.prototype.shouldResetSelection=function(e){var t=this.getKeys(),r=t.length===0||t.indexOf(e)!==-1;return e===this.getMetadata().getProperty("selectedKey").defaultValue||!r};return s});
//# sourceMappingURL=ComboBox.js.map
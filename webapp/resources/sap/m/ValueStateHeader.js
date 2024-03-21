/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./library","sap/ui/core/library","sap/ui/Device","sap/ui/core/Core","sap/ui/core/Control"],function(t,e,a,i,o){"use strict";var n=e.ValueState;var r=o.extend("sap.m.ValueStateHeader",{metadata:{library:"sap.m",properties:{text:{type:"string",defaultValue:""},valueState:{type:"sap.ui.core.ValueState",defaultValue:n.None}},aggregations:{formattedText:{type:"sap.m.FormattedText",multiple:false}},associations:{popup:{type:"sap.ui.core.Popup",multiple:false}}},renderer:{apiVersion:2,render:function(t,e){var a={None:"",Error:"sapMValueStateHeaderError",Warning:"sapMValueStateHeaderWarning",Success:"sapMValueStateHeaderSuccess",Information:"sapMValueStateHeaderInformation"};t.openStart("div",e).class("sapMValueStateHeaderRoot").class(a[e.getValueState()]).openEnd();t.openStart("span",e.getId()+"-inner").class("sapMValueStateHeaderText").openEnd();if(e.getFormattedText()){t.renderControl(e.getFormattedText())}else{t.text(e.getText())}t.close("span");t.close("div")}}});r.prototype._fnOrientationChange=function(){var t=this._getAssociatedPopupObject(),e=this.getDomRef();if(e&&t&&t.isA("sap.m.Dialog")){e.style.width=t.getDomRef().getBoundingClientRect().width+"px"}};r.prototype.init=function(){a.orientation.attachHandler(this._fnOrientationChange,this)};r.prototype.exit=function(){a.orientation.detachHandler(this._fnOrientationChange,this)};r.prototype.setPopup=function(t){var e=this;var a=false;var o=typeof t==="string"?i.byId(t):t;this.setAssociation("popup",o);if(o.isA("sap.m.Dialog")){return this}o._afterAdjustPositionAndArrowHook=function(){var t=e.getDomRef();if(!t){return}t.style.width=o.getDomRef().getBoundingClientRect().width+"px";t.style.height="auto";if(!a){a=true;setTimeout(function(){o._fnOrientationChange()},0)}};return this};r.prototype._getAssociatedPopupObject=function(){return i.byId(this.getPopup())};r.prototype.onAfterRendering=function(){var t=this._getAssociatedPopupObject();if(t){if(t.isA("sap.m.Popover")){setTimeout(function(){t._fnOrientationChange()},0)}}};return r},true);
//# sourceMappingURL=ValueStateHeader.js.map
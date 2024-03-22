/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/field/content/DefaultContent","sap/m/library"],function(e,t){"use strict";var i=t.EmptyIndicatorMode;var n=Object.assign({},e,{getDisplay:function(){return["sap/m/Link"]},getDisplayMultiValue:function(){return[null]},getDisplayMultiLine:function(){return["sap/m/Link"]},getUseDefaultFieldHelp:function(){return false},createDisplay:function(e,t,n){var a=t[0];var l=e.getConditionsType();var r=new a(n,{text:{path:"$field>/conditions",type:l},textAlign:"{$field>/textAlign}",textDirection:"{$field>/textDirection}",tooltip:"{$field>/tooltip}",press:e.getHandleContentPress(),wrapping:"{$field>/multipleLines}",emptyIndicatorMode:i.Auto});var o=e.getField().getFieldInfo();if(o){o.getDirectLinkHrefAndTarget().then(function(t){e.getMetadata()._oClass._updateLink(r,t)})}e.setAriaLabelledBy(r);return[r]},createDisplayMultiValue:function(){throw new Error("sap.ui.mdc.field.content.LinkContent - createDisplayMultiValue not defined!")},createDisplayMultiLine:function(e,t,i){return n.createDisplay(e,t,i)}});return n});
//# sourceMappingURL=LinkContent.js.map
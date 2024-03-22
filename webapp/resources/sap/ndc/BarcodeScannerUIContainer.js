/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control","sap/m/Avatar"],function(e,a){"use strict";var t=e.extend("sap.ndc.BarcodeScannerUIContainer",{metadata:{properties:{prefixId:"string"},aggregations:{_oCloseButton:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_oFlashLightButton:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"},_oControlFlexBox:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}}},renderer:{apiVersion:2,render:function(e,a){e.openStart("div",a);e.class("sapNdcRTCDialogVideo");e.openEnd();e.openStart("video",a.getId()+"-video");e.attr("autoplay","autoplay");e.attr("webkit-playsinline","webkit-playsinline");e.attr("playsinline","playsinline");e.class("sapNdcRTCDialogVideoContainer");e.openEnd();e.close("video");e.close("div");e.openStart("div",a.getId()+"-overlay");e.class("sapNdcRTCDialogOverlay");e.openEnd();e.openStart("div",a.getId()+"-overlay-box");e.class("sapNdcRTCDialogOverlayBox");e.openEnd();e.openStart("div",a.getId()+"-overlay-line");e.class("sapNdcRTCDialogOverlayLine");e.openEnd();e.close("div");e.openStart("div");e.class("sapNdcRTCDialogOverlayAngle");e.openEnd();e.close("div");e.close("div");e.close("div");if(Array.isArray(a._aBarcodeAvatars)){for(var t=0;t<a._aBarcodeAvatars.length;t++){if(a._aBarcodeAvatars[t]){e.renderControl(a._aBarcodeAvatars[t])}}}e.openStart("input",a.getId()+"-image");e.attr("hidden",true);e.attr("type","file");e.attr("accept","image/*");e.openEnd();e.close("input");e.openStart("canvas",a.getId()+"-canvas");e.attr("hidden",true);e.style("position","absolute");e.style("background-color","white");e.openEnd();e.close("canvas");e.renderControl(a.getAggregation("_oCloseButton"));e.renderControl(a.getAggregation("_oFlashLightButton"));e.renderControl(a.getAggregation("_oControlFlexBox"))}}});t.prototype.prepareBarcodeAvatars=function(e){e=e||1;this._aBarcodeAvatars=[];for(var t=0;t<e;t++){var o=new a({src:"sap-icon://arrow-right",tooltip:this.oResourceModel.getResourceBundle().getText("BARCODE_DIALOG_SCAN_RESULT_BUTTON_TOOLTIP",t+1),press:function(e){var a=e.getSource();var t=a.getCustomData();if(t.length===2){var o=t[0].getValue();var r=t[1].getValue();r(o)}}}).addStyleClass("sapNdcRTCDialogBarcodeAvatar");this._aBarcodeAvatars.push(o)}};t.prototype.destroy=function(){if(Array.isArray(this._aBarcodeAvatars)){for(var a=0;a<this._aBarcodeAvatars.length;a++){var t=this._aBarcodeAvatars[a];if(t){t.destroy()}}}e.prototype.destroy.apply(this,arguments)};return t});
//# sourceMappingURL=BarcodeScannerUIContainer.js.map
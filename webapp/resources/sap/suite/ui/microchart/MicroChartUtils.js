/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Control","sap/m/library","sap/ui/thirdparty/jquery"],function(t,e,jQuery){"use strict";var i=e.Size;var r={extendMicroChart:function(r){r.prototype._isResponsive=function(){return this.getSize()===i.Responsive};r.prototype._digitsAfterDecimalPoint=function(t){var e=(""+t).match(/[.,](\d+)/g);return e?(""+e).length-1:0};r.prototype.getAccessibilityInfo=function(){return{type:this._getAccessibilityControlType(),description:this.getTooltip_AsString()}};r.prototype._isThemeHighContrast=function(){return/(hcw|hcb)/g.test(sap.ui.getCore().getConfiguration().getTheme())};r.prototype.convertRemToPixels=function(t){return t*parseFloat(window.getComputedStyle(document.documentElement).fontSize)};r.prototype._isAnyLabelTruncated=function(t){return t.toArray().some(this._isLabelTruncated)};r.prototype._isAnyLabelVerticallyTruncated=function(t){return t.toArray().some(this._isLabelVerticallyTruncated)};r.prototype._isLabelTruncated=function(t){return t.scrollWidth>t.offsetWidth};r.prototype._isLabelVerticallyTruncated=function(t){return Math.abs(t.scrollHeight-t.offsetHeight)>1};r.prototype._isAnyLabelNumericAndTruncated=function(t){return t.toArray().some(this._isLabelNumericAndTruncated.bind(this))};r.prototype._isLabelNumericAndTruncated=function(t){return!jQuery.isNumeric(t.textContent)?false:this._isLabelTruncated(t)};r.prototype.isColorCorrect=function(t){return e.ValueCSSColor.isValid(t)&&t!==""||e.ValueCSSColor.isValid(t.below)&&t.below!==""&&e.ValueCSSColor.isValid(t.above)&&t.above!==""};r.prototype.getTooltip_AsString=function(e){var i=t.prototype.getTooltip_AsString.apply(this,arguments),r=this._getAltHeaderText(e),o=false;if(i){i=i.split("((AltText))").join(r)}if(!i){i="";o=true}if(this._getAltSubText){i+=this._getAltSubText(o)}return i}}};return r},true);
//# sourceMappingURL=MicroChartUtils.js.map
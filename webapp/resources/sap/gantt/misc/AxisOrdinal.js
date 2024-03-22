/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/misc/Utility","sap/ui/thirdparty/d3"],function(t){"use strict";var e=function(e,i,n,a,r,s,h,o){this.elementArray=e;this.scaleArray=i;this.padding=t.assign(o,0);this.zoomRate=t.assign(s,1);this.zoomOrigin=t.assign(h,0);this.viewRangeStart=t.assign(a,0);this.viewRangeEnd=r;this.viewBandWidth=n;this.scale=d3.scale.ordinal();this._createScale()};e.prototype.CONSTANT={C_SEPARATOR:"_@@_",C_MESSAGE:{ARGUMENT_ERROR:"AxisOrdinal: Argument Error!"}};e.prototype._createScale=function(){if(typeof this.viewBandWidth!=="undefined"){this.viewRangeEnd=undefined;this.scale.domain(this._calculateInternalValuesByElements()).rangeBands(this._calculateViewRangeByViewBandWidth())}else if(typeof this.viewRangeEnd!=="undefined"){this.viewBandWidth=undefined;this.scale.domain(this._calculateInternalValuesByElements()).rangeBands([this.viewRangeStart,this.viewRangeEnd])}else{}};e.prototype._calculateInternalValuesByElements=function(){var t=[];for(var e=0;e<this.scaleArray.length;e++){var i=this.elementArray[e]+this.CONSTANT.C_SEPARATOR;for(var n=0;n<this.scaleArray[e];n++){t.push(i+n)}}return t};e.prototype._calculateViewRangeByViewBandWidth=function(){var t=0;for(var e=0;e<this.scaleArray.length;e++){t+=this.scaleArray[e]*this.viewBandWidth}return[this.viewRangeStart,this.viewRangeStart+t]};e.prototype.elementToView=function(t){return(this.scale(t+this.CONSTANT.C_SEPARATOR+0)+this.padding-this.zoomOrigin)*this.zoomRate};e.prototype.viewToElement=function(t){var e=t/this.zoomRate+this.zoomOrigin;var i=0;var n=this.elementArray.length-1;while(i<n){var a=Math.ceil((i+n)/2);var r=this.scale(this.elementArray[a]+this.CONSTANT.C_SEPARATOR+0);if(e<r){n=a-1}else{i=a}}var s=this.elementArray[i];var h=this.scale(s+this.CONSTANT.C_SEPARATOR+0);if(e<h+this.padding||e>=h+this.scale.rangeBand()*this.scaleArray[i]){return undefined}return s};e.prototype.viewToElementIndex=function(t){var e=t/this.zoomRate+this.zoomOrigin;var i=0;var n=this.elementArray.length-1;while(i<n){var a=Math.ceil((i+n)/2);var r=this.scale(this.elementArray[a]+this.CONSTANT.C_SEPARATOR+0);if(e<r){n=a-1}else{i=a}}var s=this.elementArray[i];var h=this.scale(s+this.CONSTANT.C_SEPARATOR+0);if(e<h+this.padding||e>=h+this.scale.rangeBand()*this.scaleArray[i]){return-1}return i};e.prototype.viewToBandIndex=function(t){var e=t/this.zoomRate+this.zoomOrigin;var i=this._calculateInternalValuesByElements();var n=0;var a=i.length-1;while(n<a){var r=Math.ceil((n+a)/2);var s=this.scale(i[r]);if(e<s){a=r-1}else{n=r}}var h=this.scale(i[n]);if(e<h+this.padding||e>=h+this.scale.rangeBand()){return-1}return n};e.prototype.viewToRowIndex=function(t,e){var i=t/this.zoomRate+this.zoomOrigin;var n=0;var a=this._calculateViewRangeByViewBandWidth();if(i<=a[1]&&i>=a[0]){return this.viewToElementIndex(t)}else if(jQuery.isNumeric(e)&&e>this.elementArray.length){var r=parseInt((t-a[1]-a[0])/this.viewBandWidth,10);var s=r+this.elementArray.length;n=s}else{return-1}return n};e.prototype.setElements=function(t,e){this.elementArray=t;this.scaleArray=e;this._createScale();return this};e.prototype.getElementArray=function(){return this.elementArray};e.prototype.getScaleArray=function(){return this.scaleArray};e.prototype.setViewRangeStart=function(t){this.viewBandWidth=undefined;this.viewRangeStart=sap.gantt.misc.Utility.assign(t,0);this.scale.rangeRoundBands([this.viewRangeStart,this.viewRangeEnd]);return this};e.prototype.setViewRangeEnd=function(t){this.viewBandWidth=undefined;this.viewRangeEnd=t;this.scale.rangeRoundBands([this.viewRangeStart,this.viewRangeEnd]);return this};e.prototype.getViewRange=function(){var t=this.scale.rangeExtent();return[(t[0]-this.zoomOrigin)*this.zoomRate,(t[1]-this.zoomOrigin)*this.zoomRate]};e.prototype.setViewBandWidth=function(t){this.viewRangeEnd=undefined;this.viewBandWidth=t;this.scale.rangeRoundBands(this._calculateViewRangeByViewBandWidth());return this};e.prototype.getViewBandWidth=function(){return this.scale.rangeBand()*this.zoomRate};e.prototype.setZoomRate=function(t){this.zoomRate=sap.gantt.misc.Utility.assign(t,1);return this};e.prototype.getZoomRate=function(){return this.zoomRate};e.prototype.setZoomOrigin=function(t){this.zoomOrigin=sap.gantt.misc.Utility.assign(t,0);return this};e.prototype.getZoomOrigin=function(){return this.zoomOrigin};e.prototype.clone=function(){return new e(this.elementArray.slice(0),this.scaleArray.slice(0),this.viewBandWidth,this.viewRangeStart,this.viewRangeEnd,this.zoomRate,this.zoomOrigin,this.padding)};return e},true);
//# sourceMappingURL=AxisOrdinal.js.map
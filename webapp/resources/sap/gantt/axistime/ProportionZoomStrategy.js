/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/base/Log","sap/gantt/library","sap/base/util/ObjectPath","sap/gantt/axistime/AxisTimeStrategyBase","sap/gantt/misc/Utility","sap/gantt/misc/Format","sap/gantt/config/TimeHorizon"],function(t,e,i,o,a,s,r){"use strict";sap.gantt.axistime.ProportionTimeLineOptions=e.config.DEFAULT_TIME_ZOOM_STRATEGY;var n=o.extend("sap.gantt.axistime.ProportionZoomStrategy",{metadata:{library:"sap.gantt"}});n.prototype.init=function(){this._aZoomRate=new Array(10);this.setProperty("coarsestTimeLineOption",sap.gantt.axistime.ProportionTimeLineOptions["1month"],true);this.setProperty("finestTimeLineOption",sap.gantt.axistime.ProportionTimeLineOptions["5min"],true);this.setProperty("timeLineOptions",sap.gantt.axistime.ProportionTimeLineOptions,true);this.setProperty("timeLineOption",sap.gantt.axistime.ProportionTimeLineOptions["4day"],true);this.setProperty("zoomLevel",0,true);this.setProperty("zoomLevels",10,true)};n.prototype.applySettings=function(t){o.prototype.applySettings.call(this,t);this.initialSettings=t;return this};n.prototype.setVisibleHorizon=function(t){this.setVisibleHorizonWithReason(t,"visibleHorizonUpdated");return this};n.prototype.setVisibleHorizonWithReason=function(t,e,i,a){if(t&&!t.getStartTime()&&!t.getEndTime()){this._bHorizontalScroll=false}else{this._bHorizontalScroll=!!(t&&(!t.getStartTime()||!t.getEndTime()))}var s=this.getVisibleHorizon();if(s){s=s.clone()}o.prototype._setVisibleHorizon.apply(this,arguments);if(s){this.fireRedrawRequest(false,e,s,i,a)}return this};n.prototype.setTotalHorizon=function(t){o.prototype._setTotalHorizon.apply(this,arguments);if(this.getAxisTime()){this.calZoomBase();this.createAxisTime(this.getAxisTime().getLocale());this.fireRedrawRequest(true,"totalHorizonUpdated")}return this};n.prototype.updateStopInfo=function(t){this.setZoomLevel(t.index);return this};n.prototype.setZoomLevel=function(t){performance.mark("ProportionZoomStrategy.setZoomLevel--start");var e=sap.gantt.simple.VisibleHorizonUpdateSubType;if(t>=0&&t!==this.getZoomLevel()){var i=t>this.getZoomLevel()?e.ZoomIn:e.ZoomOut;this.setProperty("zoomLevel",t,true);if(this._aZoomRate[t]){var o=this.calVisibleHorizonByRate(this._aZoomRate[t]);this.setVisibleHorizonWithReason(o,"zoomLevelChanged",null,i)}}performance.mark("ProportionZoomStrategy.setZoomLevel--end");return this};n.prototype.setZoomLevels=function(t){this.setProperty("zoomLevels",t,true);if(t>1){this._aZoomRate=new Array(t)}else{this._aZoomRate=[1]}this._updateZoomRateOnStops();return this};n.prototype.syncContext=function(t){var e=false,i=false;var o={zoomLevel:undefined,axisTimeChanged:false};var s=this.getParent()?this.getParent()._iLastVisibleWidth:null;var r=s?s:this.getGanttVisibleWidth();if(r&&t!==r){this._updateVisibleHorizon(t)}var n=this._determineZoomBoundaryByStrategy();var m=this._determineZoomRateByChartWidth(t);if(m){this.updateGanttVisibleWidth(t);var h=this._oZoom.minRate||-1;this._oZoom.minRate=Math.max(n.minRate,m.minRate)||n.minRate;var l=this._oZoom.maxRate||-1;this._oZoom.maxRate=n.maxRate;var p=this._oZoom.rate||-1;i=!a.floatEqual(h,this._oZoom.minRate)||!a.floatEqual(l,this._oZoom.maxRate);if(i){this._updateZoomRateOnStops();this._adjustRateByBoundary()}if(m.suitableRate&&!this._bHorizontalScroll){this._oZoom.rate=m.suitableRate;this._adjustRateByBoundary()}this._bHorizontalScroll=false;var g=this.getZoomLevel(),u=this._calcZoomLevelFromZoomRate(this._oZoom.rate);var _=g!==u&&!this.getParent()._isDisplayTypeChanged;if(_){this.setProperty("zoomLevel",u,true)}o.zoomLevel=this.getZoomLevel();e=!a.floatEqual(p,this._oZoom.rate);if(e){this.getParent().getAxisTime().setZoomRate(this._oZoom.rate);this._updateTimeLineOption()}o.axisTimeChanged=e}return o};n.prototype._updateVisibleHorizon=function(t){var e=this.getVisibleHorizon();var i=this.getGanttVisibleWidth();var s=a.calculateHorizonByWidth(e,i,t);o.prototype._setVisibleHorizon.call(this,s)};n.prototype.updateInitialVisibleHorizon=function(t,e){this.getParent().getAxisTime().setZoomRate(this._aZoomRate[e]);this._updateTimeLineOption();o.prototype._setVisibleHorizon.call(this,t)};n.prototype._adjustRateByBoundary=function(){if(this._oZoom.rate){this._oZoom.rate=Math.max(this._oZoom.rate,this._oZoom.minRate);this._oZoom.rate=Math.min(this._oZoom.rate,this._oZoom.maxRate)}};n.prototype._updateZoomRateOnStops=function(){if(this._oZoom&&this._oZoom.maxRate&&this._oZoom.minRate){var t=this._oZoom.maxRate,e=this._oZoom.minRate,i=this.getZoomLevels();this._oLog={};this._oLog.fMax=Math.log(t);this._oLog.fMin=Math.log(e);this._oLog.fStep=(this._oLog.fMax-this._oLog.fMin)/i;if(i>0){for(var o=0;o<i;o++){this._aZoomRate[o]=Math.pow(Math.E,this._oLog.fMin+this._oLog.fStep*o)}}else{this._aZoomRate[0]=1}}};n.prototype._calcZoomLevelFromZoomRate=function(t){if(this._oZoom&&this._oLog&&t){return Math.round((Math.log(t)-this._oLog.fMin)/this._oLog.fStep)}};n.prototype._determineZoomBoundaryByStrategy=function(){if(this._oZoom&&this._oZoom.base){var t=this.getCoarsestTimeLineOption(),e=this.getFinestTimeLineOption();return{minRate:this._oZoom.base.scale/this.calZoomScale(t.innerInterval.unit,t.innerInterval.span,t.innerInterval.range),maxRate:this._oZoom.base.scale/this.calZoomScale(e.innerInterval.unit,e.innerInterval.span,e.innerInterval.range*4)}}};n.prototype._determineZoomRateByChartWidth=function(e){var i=this.getTotalHorizon(),r=this.getVisibleHorizon(),n={};if(!this._oZoom){return null}if(!a.judgeTimeHorizonValidity(r,i)){this.getVisibleHorizon().setStartTime(i.getStartTime(),true);this.getVisibleHorizon().setEndTime(i.getEndTime(),true);t.warning("Visible horizon is not in total horizon, so convert visible horizon to total horizon",null,"sap.gantt.axistime.ProportionZoomStrategy.syncContext()")}if(i){var m=this.calZoomScaleByDate(s.abapTimestampToDate(i.getStartTime()),s.abapTimestampToDate(i.getEndTime()),e);n.minRate=this._oZoom.base.scale/m}if(r&&r.getStartTime()&&r.getEndTime()){var h=r.getStartTime();var l=r.getEndTime();if(h===l){o.prototype._setVisibleHorizon.call(this,i);var p=this.calVisibleHorizonByRate(this._aZoomRate[this.getZoomLevel()]);o.prototype._setVisibleHorizon.call(this,p);h=p.getStartTime();l=p.getEndTime()}var g=this.calZoomScaleByDate(s.abapTimestampToDate(h),s.abapTimestampToDate(l),e);n.suitableRate=this._oZoom.base.scale/g}return n};n.prototype._updateTimeLineOption=function(){var t=s.getTimeStampFormatter().parse("20000101000000"),e,o,a=this.getTimeLineOptions(),r=this.getProperty("timeLineOption");var n=this.getAxisTime();if(n){var m=n.timeToView(t);for(o in a){var h=a[o].innerInterval;var l=n.timeToView(i.get(h.unit).offset(t,h.span));var p=Math.abs(Math.ceil(l-m));if(p>=h.range){e=o;break}}r=e?a[e]:a[o];this.setProperty("timeLineOption",r,true)}};n.prototype.onSetTimeZoomRate=function(t){var e=this.calVisibleHorizonByRate(t);this.setVisibleHorizon(e)};n.prototype.getCurrentVisibleHorizon=function(){var t=this.getTotalHorizon(),e=this.getZoomLevel();if(!t||e===undefined){return undefined}var i=this._completeTimeHorizon(this.calVisibleHorizonByRate(this._aZoomRate[e]));return i};n.prototype.getRenderedVisibleHorizon=function(){var t=this.getTotalHorizon(),e=this.getZoomLevel(),i=this.getParent();if(!i||!t||e===undefined){return undefined}var o=i.getRenderedTimeRange();var a=new r({startTime:o[0],endTime:o[1]});return a};return n},true);
//# sourceMappingURL=ProportionZoomStrategy.js.map
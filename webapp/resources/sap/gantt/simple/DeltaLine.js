/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Element","./GanttUtils","sap/ui/core/theming/Parameters"],function(e,t,r){"use strict";var a=e.extend("sap.gantt.simple.DeltaLine",{metadata:{library:"sap.gantt",properties:{stroke:{type:"sap.gantt.ValueSVGPaintServer"},_strokeWidth:{type:"float",defaultValue:1},strokeDasharray:{type:"string"},strokeOpacity:{type:"float",defaultValue:1},timeStamp:{type:"string"},endTimeStamp:{type:"string"},description:{type:"string"},visible:{type:"boolean",defaultValue:true},visibleDeltaStartEndLines:{type:"boolean",defaultValue:true},timeDelay:{type:"int",defaultValue:300},draggable:{type:"boolean",defaultValue:false},resizable:{type:"boolean",defaultValue:false},_enableChartDeltaAreaHighlight:{type:"boolean",defaultValue:true},_isSelected:{type:"boolean",defaultValue:false},_level:{type:"int",defaultValue:1},_visibleMarker:{type:"boolean",defaultValue:false}},aggregations:{_startLine:{type:"sap.gantt.simple.BaseLine",multiple:false},_endLine:{type:"sap.gantt.simple.BaseLine",multiple:false},_forwardMarker:{type:"sap.gantt.simple.BaseTriangle",multiple:false},_backwardMarker:{type:"sap.gantt.simple.BaseTriangle",multiple:false},_headerDeltaArea:{type:"sap.gantt.simple.BaseDeltaRectangle",multiple:false},_headerStartLine:{type:"sap.gantt.simple.BaseLine",multiple:false},_headerEndLine:{type:"sap.gantt.simple.BaseLine",multiple:false},_chartDeltaArea:{type:"sap.gantt.simple.BaseDeltaRectangle",multiple:false}},events:{press:{},mouseEnter:{},mouseLeave:{},deltalineDrop:{parameters:{newStartTime:{type:"string"},newEndTime:{type:"string"},oldStartTime:{type:"string"},oldEndTime:{type:"string"}}},deltalineResize:{parameters:{newTimeStamp:{type:"string"},newEndTimeStamp:{type:"string"},oldTimeStamp:{type:"string"},oldEndTimeStamp:{type:"string"},deltaline:{type:"sap.gantt.simple.DeltaLine"}}}},designtime:"sap/gantt/designtime/simple/DeltaLine.designtime"},renderer:{apiVersion:2}});a.prototype._getStrokeWidth=function(){return this.getProperty("_strokeWidth")};a.prototype._setStartLine=function(e){this.setAggregation("_startLine",e,true)};a.prototype._getStartLine=function(){return this.getAggregation("_startLine")};a.prototype._setEndLine=function(e){this.setAggregation("_endLine",e,true)};a.prototype._getEndLine=function(){return this.getAggregation("_endLine")};a.prototype._setForwardMarker=function(e){this.setAggregation("_forwardMarker",e,true)};a.prototype._getForwardMarker=function(){return this.getAggregation("_forwardMarker")};a.prototype._setBackwardMarker=function(e){this.setAggregation("_backwardMarker",e,true)};a.prototype._getBackwardMarker=function(){return this.getAggregation("_backwardMarker")};a.prototype._setHeaderDeltaArea=function(e){this.setAggregation("_headerDeltaArea",e,true)};a.prototype._getHeaderDeltaArea=function(){return this.getAggregation("_headerDeltaArea")};a.prototype._setHeaderStartLine=function(e){this.setAggregation("_headerStartLine",e,true)};a.prototype._getHeaderStartLine=function(){return this.getAggregation("_headerStartLine")};a.prototype._setHeaderEndLine=function(e){this.setAggregation("_headerEndLine",e,true)};a.prototype._getHeaderEndLine=function(){return this.getAggregation("_headerEndLine")};a.prototype._setChartDeltaArea=function(e){this.setAggregation("_chartDeltaArea",e,true)};a.prototype._getChartDeltaArea=function(){return this.getAggregation("_chartDeltaArea")};a.prototype._setEnableChartDeltaAreaHighlight=function(e){this.setProperty("_enableChartDeltaAreaHighlight",e,true)};a.prototype._getEnableChartDeltaAreaHighlight=function(){return this.getProperty("_enableChartDeltaAreaHighlight")};a.prototype._setIsSelected=function(e){this.setProperty("_isSelected",e,true)};a.prototype._getIsSelected=function(){return this.getProperty("_isSelected")};a.prototype._setLevel=function(e){this.setProperty("_level",e,true)};a.prototype._getLevel=function(){return this.getProperty("_level")};a.prototype._setVisibleMarker=function(e){this.setProperty("_visibleMarker",e,true)};a.prototype._getVisibleMarker=function(){return this.getProperty("_visibleMarker")};a.prototype.press=function(e){this.onMouseClick()};a.prototype.mouseEnter=function(e){this.onMouseEnter()};a.prototype.mouseLeave=function(e){this.onMouseLeave()};a.prototype.onMouseClick=function(){if(!this._getIsSelected()){t.resetStrokeDasharray(this.getParent());this._setIsSelected(true)}var e=this._getChartDeltaArea();var a=this._getHeaderDeltaArea();var i=this._getForwardMarker();var s=this._getBackwardMarker();var n=r.get("sapUiChartDataPointBorderColor");if(e){var o=document.getElementById(e.sId);if(this._getEnableChartDeltaAreaHighlight()===true){o.style.opacity=1}if(this.getVisibleDeltaStartEndLines()){var l=this._getStartLine();var g=this._getEndLine();var d=this._getHeaderStartLine();var y=this._getHeaderEndLine();if(l&&g&&d&&y){var p=document.getElementById(l.sId);var h=document.getElementById(g.sId);var u=document.getElementById(d.sId);var _=document.getElementById(y.sId);p.style.strokeDasharray=0;h.style.strokeDasharray=0;u.style.strokeDasharray=0;_.style.strokeDasharray=0;p.style.strokeWidth=this._getStrokeWidth()+1;h.style.strokeWidth=this._getStrokeWidth()+1;u.style.strokeWidth=this._getStrokeWidth()+1;_.style.strokeWidth=this._getStrokeWidth()+1}}if(i&&s&&a){var c=document.getElementById(i.sId);var m=document.getElementById(s.sId);var k=document.getElementById(a.sId);c.style.fillOpacity=1;m.style.fillOpacity=1;c.style.stroke=n;m.style.stroke=n;k.style.opacity=1}}if(this._getIsSelected()&&this.getDraggable()){k.style.cursor="Move"}if(this._getIsSelected()&&this.getResizable()){var f=this.getParent()._getResizeExtension();f.addDeltaLineResizer(this._getHeaderDeltaArea())}};a.prototype.onMouseEnter=function(){var e=this._getForwardMarker();var t=this._getBackwardMarker();var a=this._getHeaderDeltaArea();if(this.getVisibleDeltaStartEndLines()){var i=this._getStartLine();var s=this._getEndLine();var n=this._getHeaderStartLine();var o=this._getHeaderEndLine();if(i&&s&&o&&n){var l=document.getElementById(i.sId);var g=document.getElementById(s.sId);var d=document.getElementById(n.sId);var y=document.getElementById(o.sId);l.style.strokeDasharray=0;g.style.strokeDasharray=0;d.style.strokeDasharray=0;y.style.strokeDasharray=0;l.style.strokeWidth=this._getStrokeWidth()+1;g.style.strokeWidth=this._getStrokeWidth()+1;d.style.strokeWidth=this._getStrokeWidth()+1;y.style.strokeWidth=this._getStrokeWidth()+1}}var p=document.getElementById(e.sId);var h=document.getElementById(t.sId);var u=document.getElementById(a.sId);p.style.fillOpacity=1;h.style.fillOpacity=1;p.style.stroke=r.get("sapUiChartDataPointBorderColor");h.style.stroke=r.get("sapUiChartDataPointBorderColor");u.style.opacity=1;if(this._getIsSelected()&&this.getDraggable()){u.style.cursor="move"}};a.prototype.onMouseLeave=function(){var e=this._getIsSelected();var t=this._getForwardMarker();var a=this._getBackwardMarker();var i=this._getHeaderDeltaArea();if(!e){if(this.getVisibleDeltaStartEndLines()){var s=this._getStartLine();var n=this._getEndLine();var o=this._getHeaderStartLine();var l=this._getHeaderEndLine();if(s&&n){var g=document.getElementById(s.sId);var d=document.getElementById(n.sId);var y=document.getElementById(o.sId);var p=document.getElementById(l.sId);g.style.strokeDasharray=this.getStrokeDasharray();d.style.strokeDasharray=this.getStrokeDasharray();y.style.strokeDasharray=this.getStrokeDasharray();p.style.strokeDasharray=this.getStrokeDasharray();g.style.strokeWidth=this._getStrokeWidth();d.style.strokeWidth=this._getStrokeWidth();y.style.strokeWidth=this._getStrokeWidth();p.style.strokeWidth=this._getStrokeWidth()}}if(t&&a){var h=document.getElementById(t.sId);var u=document.getElementById(a.sId);var _=document.getElementById(i.sId);_.style.opacity=1;var c=r.get("sapUiChartDataPointBorderColor");if(this._getVisibleMarker()===true){h.style.fillOpacity=1;u.style.fillOpacity=1;h.style.stroke=c;u.style.stroke=c}else{h.style.fillOpacity=0;u.style.fillOpacity=0;h.style.stroke=null;u.style.stroke=null}}}};return a},true);
//# sourceMappingURL=DeltaLine.js.map
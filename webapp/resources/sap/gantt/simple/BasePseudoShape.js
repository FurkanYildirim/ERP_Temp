/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./MultiActivityGroup","sap/gantt/simple/BaseRectangle","./GanttUtils","sap/ui/core/theming/Parameters","sap/gantt/simple/BaseImage","sap/gantt/def/gradient/LinearGradient","sap/gantt/misc/Format","sap/gantt/def/gradient/Stop","sap/ui/core/Core","sap/gantt/library"],function(e,t,a,r,i,n,o,s,p,g){"use strict";var d=e.extend("sap.gantt.simple.BasePseudoShape",{metadata:{properties:{expandTitle:{type:"string",defaultValue:"Show Details"},collapseTitle:{type:"string",defaultValue:"Show Less"},overlapFill:{type:"sap.gantt.ValueSVGPaintServer",defaultValue:"@sapChart_OrderedColor_11"},fill:{type:"sap.gantt.ValueSVGPaintServer",defaultValue:"@sapChart_OrderedColor_1"},typeOfOverlapIndicator:{type:"string",defaultValue:g.simple.typeOfOverlapIndicator.Gradient}},aggregations:{button:{type:"sap.gantt.simple.BaseShape",sapGanttOrder:2}}}});d.prototype.onclick=function(e){if(e&&e.target.getAttribute("class").indexOf("pseudoShapeIcon")==-1){return}var t=this.getGanttChartBase();var a=t.getTable();var r=a.getRowSettingsTemplate();var i=a.getRows();var n=this.getParentRowSettings().getParent().getIndex()-i[0].getIndex();var o=i[n];t.oOverlapShapeIds=t.oOverlapShapeIds?t.oOverlapShapeIds:{};var s=t.oOverlapShapeIds&&t.oOverlapShapeIds[o.getIndex()]?t.oOverlapShapeIds&&t.oOverlapShapeIds[o.getIndex()]:[];var p=this.aShapeIds.length>0&&(s.length==0||this.aShapeIds.indexOf(s[0])==-1);var g=o.getIndex();var d;if(s&&t._aExpandedIndices.length>0&&t._aExpandedIndices.indexOf(g)>-1){t._collapse(d,g,true)}if(p){var l=a.getBindingInfo("rows").model;var h=r.getBindingInfo("tasks");var m=o.getAggregation("_settings");var v=m.getAggregation("tasks").length;t.oOverlapShapeIds[o.getIndex()]=[];this.aShapeContexts.forEach(function(e){var a=h.template.clone();a.setBindingContext(e,l);m.addAggregation("tasks",a,true);t.oOverlapShapeIds[o.getIndex()].push(m.getAggregation("tasks")[v].getShapeId());v++});t._expand(d,g,true)}};d.prototype._timeFormatter=function(e,t,r,i){var n=e.template.getBindingInfo("time").formatter;var o=e.template.getBindingInfo("endTime").formatter;var s=n?n.call(t,r.startTime):r.startTime,p=o?o.call(t,r.endTime):r.endTime;var g=i.getEnableDateTimezoneFormatter()?a.getFormatedDateByTimeZone(s):s,d=i.getEnableDateTimezoneFormatter()?a.getFormatedDateByTimeZone(p):p;return{time:g,endTime:d}};d.prototype._createPseudoShape=function(e,a,n,o,s){var p=sap.gantt.simple.horizontalTextAlignment,g;var l=new d;var h=function(e,t){return new i({height:parseFloat(r.get("sapUiChartAxisTitleFontSize"),100)*16,fontWeight:r.get("sapUiChartTitleFontWeight"),src:e,fill:r.get("sapUiChartReferenceLineLabelColor"),horizontalTextAlignment:t.getHorizontalTextAlignment(),time:t.getTime(),endTime:t.getEndTime()})};var m=this._timeFormatter(a,l,e,o);l.setAggregation("task",new t({time:m.time,endTime:m.endTime,horizontalTextAlignment:p.Start,fontSize:parseFloat(r.get("sapUiChartAxisTitleFontSize"),100)*16,fontWeight:r.get("sapUiChartTitleFontWeight")}));var v=l.getTask();e.overlaps.forEach(function(e){if(l.getTypeOfOverlapIndicator()!="Gradient"){v._iBaseRowHeight=o._oExpandModel.getBaseRowHeight()?o._oExpandModel.getBaseRowHeight():v._iBaseRowHeight;var r=v.getHeight();var i=this._timeFormatter(a,l,e,o);l.addAggregation("indicators",new t({time:i.time,endTime:i.endTime,yBias:r+2}).addStyleClass("sapGanttPseudoShapeOverlapIndicatorStyle"))}}.bind(this));if(s&&o.oOverlapShapeIds&&o.oOverlapShapeIds[n.getIndex()]&&e.aShapeIds&&e.aShapeIds.some(function(e){return o.oOverlapShapeIds[n.getIndex()].includes(e)})){g=h("sap-icon://collapse",v);v.setTitle(l.getCollapseTitle())}else{g=h("sap-icon://expand",v);v.setTitle(l.getExpandTitle())}v.setTitleColor(r.get("sapUiChartReferenceLineLabelColor"));g.aCustomStyleClasses=["pseudoShapeIcon"];l.addAggregation("button",g);return l};d.prototype._fnCreateLinearGradient=function(e,t){var a=[],r=t.shapeFill?t.shapeFill:"@sapChart_OrderedColor_1",i=t.overlapIndicatorFill?t.overlapIndicatorFill:"@sapChart_OrderedColor_11";var n=p.getConfiguration().getRTL();if(n){for(var o=e.length-1;o>=0;o--){a.push(new s({offSet:String(100-e[o]+"%"),stopColor:o%2==0?i:r}));a.push(new s({offSet:String(100-e[o-1]+"%"),stopColor:o%2==0?i:r}))}}else{for(var o=0;o<e.length-1;o++){a.push(new s({offSet:String(e[o]+"%"),stopColor:o%2==0?r:i}));a.push(new s({offSet:String(e[o+1]+"%"),stopColor:o%2==0?r:i}))}}return a};d.prototype._createShapesFromContext=function(e,t,a,s,p,g,d){var l=t.getAggregation("_settings");var h=s.getAxisTime();var m=l.getPseudoShapeTemplate();var v=s.getTable().getBindingInfo("rows").model;var f=a.template.getBindingInfo("time"),u=a.template.getBindingInfo("endTime"),T=a.template.getBindingInfo("shapeId");var S={endTime:u.parts[0].path||u.path,startTime:f.parts[0].path||f.path,shapeId:T.parts[0].path||T.path};var I=function(e,t){return new i({height:parseFloat(r.get("sapUiChartAxisTitleFontSize"),100)*16,fontWeight:r.get("sapUiChartTitleFontWeight"),src:e,fill:r.get("sapUiChartReferenceLineLabelColor"),horizontalTextAlignment:t.getHorizontalTextAlignment(),time:t.getTime(),endTime:t.getEndTime()})};e.sort(function(e,t){return e.getProperty(S.startTime)-t.getProperty(S.startTime)});var c=this._findPseudoShapeContextArray(e,S,t,s);var y,C,x;t.aFinalShapeGroupArray=c;c.forEach(function(e){if(e.iShapeCount>1){var r;if(m){r=m.clone();C=r.getTask();e.shapeFill=C.getFill()?C.getFill():r.getFill();var i=this._timeFormatter(a,this,e,s);C.setTime(i.time);C.setEndTime(i.endTime);C.setSelectable(true);if(p&&s.oOverlapShapeIds&&s.oOverlapShapeIds[t.getIndex()]&&e.aShapeIds&&e.aShapeIds.some(function(e){return s.oOverlapShapeIds[t.getIndex()].includes(e)})){x=I("sap-icon://collapse",C);y=r.getCollapseTitle()?r.getCollapseTitle():"Show Less"}else{x=I("sap-icon://expand",C);y=r.getExpandTitle()?r.getExpandTitle():"Show Details"}C.setTitle(y);e.overlaps.forEach(function(t){var i=r.getIndicators()[0].clone();i.addStyleClass("sapGanttPseudoShapeOverlapIndicatorStyle");e.overlapIndicatorFill=i.getFill()?i.getFill():r.getOverlapFill();if(r.getTypeOfOverlapIndicator()!="Gradient"){var n=this._timeFormatter(a,this,t,s);i.setTime(n.time);i.setEndTime(n.endTime);r.addAggregation("indicators",i)}}.bind(this));x.aCustomStyleClasses=["pseudoShapeIcon"];r.addAggregation("button",x)}else{r=this._createPseudoShape(e,a,t,s,p);C=r.getTask()}r.isPseudoShape=true;r.aShapeContexts=e.aShapeContexts;r.aShapeIds=e.aShapeIds;r.getTask().addStyleClass("sapGanttPseudoShapeColor");if(r.getTypeOfOverlapIndicator()!="Indicator"){r.getTask().setFill("url(#"+e.id+")")}l.addAggregation("tasks",r,true);r._birdEye(a,s,r,t,g>-1?s._aExpandedIndices.indexOf(t.getIndex())==-1:true);if(d){var f=e.startTime,u=e.endTime;var T=f.getTime(),S=u.getTime();var c=S-T,O=[0];for(var _=0;_<e.overlaps.length;_++){var E=e.overlaps[_];var A=(E.startTime.getTime()-T)/c*100;var B=(E.endTime.getTime()-T)/c*100;O.push(A);if(B-A<1){var F=h.timeToView(o.abapTimestampToDate(u)),P=h.timeToView(o.abapTimestampToDate(f));var w=Math.abs(F-P);B=A+1/w*100}O.push(B)}O.push(100);var b=this._fnCreateLinearGradient(O,e);var k=s._oSvgDefs&&s._oSvgDefs.getAggregation("defs")&&s._oSvgDefs.getAggregation("defs").find(function(t){return t.getId()==e.id});if(!k){s._oSvgDefs&&s._oSvgDefs.addAggregation("defs",new n(e.id,{x1:"0%",y1:"0%",x2:"100%",y2:"0%",stops:b}),true)}}}else{if(e.iShapeCount===1){var R=a.template.clone();R.setBindingContext(e.aShapeContexts[0],v);l.addAggregation("tasks",R,true);var D=l.getAggregation("tasks").length-1;var _=t.getIndex();var G=s.oOverlapShapeIds&&s.oOverlapShapeIds[_]&&s.oOverlapShapeIds[_].indexOf(l.getAggregation("tasks")[D].getShapeId());if(G>-1){if(s.oOverlapShapeIds[_].length>1){s.oOverlapShapeIds[_].splice(G,1)}else if(s.oOverlapShapeIds){delete s.oOverlapShapeIds[_]}}}}}.bind(this))};d.prototype._findPseudoShapeContextArray=function(e,t,a,r){var i=[],n=0,o=0,s=r.getId();if(e[0]){i.push({id:s+"_row-"+a.getIndex()+"group-"+n,iShapeCount:1,startTime:e[0].getProperty(t.startTime),endTime:e[0].getProperty(t.endTime),overlaps:[],aShapeContexts:[e[0]],aShapeIds:[e[0].getProperty(t.shapeId)]})}for(var p=1;p<e.length;p++){var g=e[p];var d=g.getProperty(t.startTime),l=g.getProperty(t.endTime),h=i[n],m=h.startTime,v=h.endTime;var f=h.overlaps[o]&&h.overlaps[o].startTime,u=h.overlaps[o]&&h.overlaps[o].endTime;if(d>=m&&l<=v){h.aShapeContexts.push(g);h.iShapeCount++;h.aShapeIds.push(g.getProperty(t.shapeId));if(h.overlaps.length===0){h.overlaps.push({startTime:d,endTime:l})}else{if(d>=f&&l<=u){}else if(d>=f&&d<u&&l>u){h.overlaps[o].endTime=l}else if(d>u&&l>u){h.overlaps.push({startTime:d,endTime:l});o++}}}else if(d>=m&&d<v&&l>v){h.aShapeContexts.push(g);h.iShapeCount++;h.aShapeIds.push(g.getProperty(t.shapeId));if(h.overlaps.length===0){h.overlaps.push({startTime:d,endTime:h.endTime})}else{if(d>=f&&v<=u){}else if(d>=f&&d<u&&v>u){h.overlaps[o].endTime=h.endTime}else if(d>u&&v>u){h.overlaps.push({startTime:d,endTime:h.endTime});o++}}h.endTime=l}else if(d>=v&&l>=v){n++;o=0;i.push({id:s+"_row-"+a.getIndex()+"group-"+n,iShapeCount:1,startTime:d,endTime:l,overlaps:[],aShapeContexts:[g],aShapeIds:[g.getProperty(t.shapeId)]})}}return i};d.prototype._birdEye=function(e,t,a,r,i){var n=r.getIndex(),o=r.getAggregation("_settings");var s=e.template.getBindingInfo("countInBirdEye"),p;if(s){p=s.parts[0].path||s.path}else{p=e.template.getCountInBirdEye()}if(typeof p=="boolean"){a.setCountInBirdEye(p);a.groupBirdEyeRangeStartTime=a.getAggregation("task").getTime();a.groupBirdEyeRangeEndTime=a.getAggregation("task").getEndTime()}var g=function(){var e=false,t,r;for(var i=0;i<a.aShapeContexts.length;i++){var n=a.aShapeContexts[i];if(n.getProperty(p)){e=true;var o=n.getProperty("StartDate");var s=n.getProperty("EndDate");if(!t||o<t){t=o}if(!r||r<s){r=s}}}return{startTime:t,endTime:r,pseudoCountInBirdEye:e}};if(t.oOverlapShapeIds&&t.oOverlapShapeIds[n]&&a.aShapeIds.some(function(e){return t.oOverlapShapeIds[n].includes(e)})&&i){var d=t.getTable().getBindingInfo("rows").model;var l=o.getAggregation("tasks");var h=l?l.length:0;var m=false,v,f;a.aShapeContexts.forEach(function(r){if(typeof p!="boolean"){if(r.getProperty(p)){m=true;var i=r.getProperty("StartDate");var s=r.getProperty("EndDate");if(!v||i<v){v=i}if(!f||f<s){f=s}}}var g=e.template.clone();g.setBindingContext(r,d);g._parent=a.getAggregation("task");o.addAggregation("tasks",g,true);o.getAggregation("tasks")[h].isPartOfExpandedPseudoShape=true;var l=l>-1?l:n;t.oOverlapShapeIds[l]=a.aShapeIds;h++});if(typeof p!="boolean"){a.groupBirdEyeRangeStartTime=v;a.groupBirdEyeRangeEndTime=f;a.setCountInBirdEye(m)}}else if(typeof p!="boolean"){var u=g();a.groupBirdEyeRangeStartTime=u.startTime;a.groupBirdEyeRangeEndTime=u.endTime;a.setCountInBirdEye(u.pseudoCountInBirdEye)}};return d},true);
//# sourceMappingURL=BasePseudoShape.js.map
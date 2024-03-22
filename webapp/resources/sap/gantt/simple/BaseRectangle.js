/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["./BaseShape","./RenderUtils","./GanttUtils","../misc/Format","../misc/Utility","../library","./BaseText"],function(t,e,i,r,a,s,n){"use strict";var h=s.simple.shapes.ShapeAlignment;var g=t.extend("sap.gantt.simple.BaseRectangle",{metadata:{library:"sap.gantt",properties:{x:{type:"sap.gantt.SVGLength"},y:{type:"sap.gantt.SVGLength"},width:{type:"sap.gantt.SVGLength"},height:{type:"sap.gantt.SVGLength",defaultValue:"auto"},rx:{type:"sap.gantt.SVGLength",group:"Appearance",defaultValue:0},ry:{type:"sap.gantt.SVGLength",group:"Appearance",defaultValue:0}}},renderer:{apiVersion:2}});var o=["x","y","width","height","style","rx","ry","filter","opacity","transform"];g.prototype.getX=function(){return i.getValueX(this)};g.prototype.getY=function(){var t=this.getProperty("y"),e=1;if(t===null||t===undefined){var i=Number(this.getHeight());t=this.getRowYCenter()-i/2;if(this._iBaseRowHeight!=undefined){if(this.getAlignShape()==h.Top){t=this.getRowYCenter()-this._iBaseRowHeight/2+e}else if(this.getAlignShape()==h.Bottom){t=this.getRowYCenter()+this._iBaseRowHeight/2-i-e}t=parseInt(t,10)}}return t};g.prototype.getWidth=function(){var t=this.getProperty("width"),e=this.getGanttChartBase(),i,a,s,n,h,g;if(t!==null&&t!==undefined){return t}var o,p;var l=this.getAxisTime();if(l==null){return 0}if(e&&this.getTime()&&this.getEndTime()){a=this.getTime().valueOf();s=this.getEndTime().valueOf();n=s-a;i=l.getZoomRate();h=l.getViewOffset();g=l.getViewRange()[1];p=l._shapeWidthValue;var u=p.getValue(i,n,h,g);if(u!==undefined){return u}o=[i,n,h,g]}var y,d=l.timeToView(r.abapTimestampToDate(this.getTime())),f=l.timeToView(r.abapTimestampToDate(this.getEndTime()));if(!jQuery.isNumeric(d)||!jQuery.isNumeric(f)){return 0}y=Math.abs(f-d);y=y<1?1:y;if(p){p.add(o,y)}return y};g.prototype.getHeight=function(){var t=this.getProperty("height");if(t==="auto"){var e=parseFloat(this._iBaseRowHeight*.625,10);return e}if(t==="inherit"){return this._iBaseRowHeight}return t};g.prototype.getStyle=function(){var e=t.prototype.getStyle.apply(this,arguments);var i={fill:this.determineValueColor(this.getFill()),"stroke-dasharray":this.getStrokeDasharray(),"fill-opacity":this.getFillOpacity(),"stroke-opacity":this.getStrokeOpacity()};return e+this.getInlineStyle(i)};g.prototype._isValid=function(){var t=this.getX();return t!==undefined&&t!==null};g.prototype.renderElement=function(i,r){if(!this._isValid()){return}this.writeElementData(i,"rect",true);if(this.aCustomStyleClasses){this.aCustomStyleClasses.forEach(function(t){i.class(t)})}e.renderAttributes(i,r,o);i.openEnd();e.renderTooltip(i,r);if(this.getShowAnimation()){e.renderElementAnimation(i,r)}i.close("rect");if(!r.isA("sap.gantt.simple.BaseCalendar")&&this.getShowTitle()){e.renderElementTitle(i,r,function(t){return new n(t)})}t.prototype.renderElement.apply(this,arguments)};g.prototype.getShapeAnchors=function(){var t=a.getShapeBias(this);return{head:{x:this.getX()+t.x,y:this.getY()+this.getHeight()/2+t.y,dx:0,dy:this.getHeight()/2},tail:{x:this.getX()+this.getWidth()+t.x,y:this.getY()+this.getHeight()/2+t.y,dx:0,dy:this.getHeight()/2}}};return g},true);
//# sourceMappingURL=BaseRectangle.js.map
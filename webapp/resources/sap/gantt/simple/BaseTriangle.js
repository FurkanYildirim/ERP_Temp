sap.ui.define(["./BaseRectangle","./BasePath","sap/gantt/library"],function(t,e,i){"use strict";var r=i.simple.shapes.ShapeAlignment;var n=t.extend("sap.gantt.simple.BaseTriangle",{metadata:{properties:{stroke:{type:"sap.gantt.ValueSVGPaintServer"},strokeWidth:{type:"float",defaultValue:1},strokeDasharray:{type:"string"},width:{type:"sap.gantt.SVGLength",defaultValue:0},height:{type:"sap.gantt.SVGLength",defaultValue:0},orientation:{type:"string",defaultValue:"right"}},events:{press:{},mouseEnter:{},mouseLeave:{}}},renderer:{apiVersion:2}});n.prototype._isValid=function(){var t=this.getX();return t!==undefined&&t!==null};n.prototype.onmouseover=function(t){this.fireMouseEnter(t)};n.prototype.onmouseout=function(t){this.fireMouseLeave(t)};n.prototype.onclick=function(t){var i=t.target.getAttribute("class").split(" ");if(i.indexOf("sapGanntChartMarkerCursorPointer")>-1){this.firePress(t)}else{e.prototype.onclick.apply(this,arguments)}};n.prototype.getD=function(){var t=this.getX(),e=this.getWidth(),i=this.getHeight(),n=this.getRowYCenter(),o=this.getOrientation(),s="",a=1;var p=function(){var t="";for(var e=0;e<arguments.length;e++){t+=arguments[e]+" "}return t};if(this._iBaseRowHeight!=undefined){if(this.getAlignShape()==r.Top){n=parseInt(this.getRowYCenter()-this._iBaseRowHeight/2+a,10)}else if(this.getAlignShape()==r.Bottom){n=parseInt(this.getRowYCenter()+this._iBaseRowHeight/2-i-a,10)}else if(this.getAlignShape()==r.Middle){n=this.getRowYCenter()-i/2}}if(o==="left"){s=p("M",t+1,n,"l",-e,i/2,"l",e,i/2)+"Z"}else if(o==="top"){s=p("M",t-1,n,"l",e/2,i,"l",-e,0)+"Z"}else if(o==="bottom"){s=p("M",t-1,n,"l",e,0,"l",-e/2,i)+"Z"}else{s=p("M",t-1,n,"l",e,i/2,"l",-e,i/2)+"Z"}return s};n.prototype.getWidth=function(){var t=this.getProperty("width");if(t==="auto"){return parseFloat(this._iBaseRowHeight*.625,10)}if(t==="inherit"){return this._iBaseRowHeight}return t};n.prototype.getOrientation=function(){var t=this.getProperty("orientation");return t};n.prototype.renderElement=e.prototype.renderElement;n.prototype.renderElement=function(){if(this._isValid()){e.prototype.renderElement.apply(this,arguments)}};return n},true);
//# sourceMappingURL=BaseTriangle.js.map
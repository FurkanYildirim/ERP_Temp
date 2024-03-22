/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/shape/ext/ulc/UlcRectangle","sap/gantt/misc/Format","sap/ui/core/Core"],function(t,i,e){"use strict";var r=t.extend("sap.gantt.shape.ext.ulc.UlcTooltipRectangle",{});r.prototype.getTitle=function(t,i){if(this.mShapeConfig.hasShapeProperty("title")){return this._configFirst("title",t)}var e="";var r;if(this.mShapeConfig.hasShapeProperty("utilizationCurves")){r=this._configFirst("utilizationCurves",t)}if(t){for(var a in r){if(t[r[a].ratioAttribute]||t[r[a].ratioAttribute]===0){if(t[r[a].ratioAttribute].previous!==undefined){e+=r[a].name+"\t"+t[r[a].ratioAttribute].previous+"-"+t[r[a].ratioAttribute].next+"%"+"\n"}else{e+=r[a].name+"\t"+t[r[a].ratioAttribute].value+"%"+"\n"}}}}return e};r.prototype.getX=function(t,r){if(this.mShapeConfig.hasShapeProperty("x")){return this._configFirst("x",t)}var a=this.getAxisTime();if(e.getConfiguration().getRTL()){return a.timeToView(i.abapTimestampToDate(t.to))}else{return a.timeToView(i.abapTimestampToDate(t.from))}};r.prototype.getWidth=function(t,r){if(this.mShapeConfig.hasShapeProperty("width")){return this._configFirst("width",t)}var a=this.getAxisTime();if(e.getConfiguration().getRTL()){return Math.abs(a.timeToView(i.abapTimestampToDate(t.from))-a.timeToView(i.abapTimestampToDate(t.to)))}else{return Math.abs(a.timeToView(i.abapTimestampToDate(t.to))-a.timeToView(i.abapTimestampToDate(t.from)))}};r.prototype.getHeight=function(t,i){if(this.mShapeConfig.hasShapeProperty("height")){return this._configFirst("height",t)}return i.rowHeight};r.prototype.getStrokeOpacity=function(t,i){if(this.mShapeConfig.hasShapeProperty("strokeOpacity")){return this._configFirst("strokeOpacity",t)}return 0};r.prototype.getFillOpacity=function(t,i){if(this.mShapeConfig.hasShapeProperty("fillOpacity")){return this._configFirst("fillOpacity",t)}return 0};return r},true);
//# sourceMappingURL=UlcTooltipRectangle.js.map
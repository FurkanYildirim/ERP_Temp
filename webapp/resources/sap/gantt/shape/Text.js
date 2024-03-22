/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/shape/Shape","sap/gantt/misc/Format"],function(t,e){"use strict";var i=t.extend("sap.gantt.shape.Text",{metadata:{properties:{tag:{type:"string",defaultValue:"text"},text:{type:"string"},x:{type:"float"},y:{type:"float"},fontSize:{type:"int",defaultValue:10},textAnchor:{type:"string",defaultValue:"start"},fontFamily:{type:"string"},wrapWidth:{type:"float",defaultValue:-1},wrapDy:{type:"float",defaultValue:20},truncateWidth:{type:"float",defaultValue:-1},ellipsisWidth:{type:"float",defaultValue:12}}}});i.prototype.getX=function(t,i){if(this.mShapeConfig.hasShapeProperty("x")){return this._configFirst("x",t)}var r=this.getTime(t,i);var n=this.getAxisTime();var o=n.timeToView(e.abapTimestampToDate(r));if(!jQuery.isNumeric(o)){o=n.timeToView(0).toFixed(1)}return o};i.prototype.getY=function(t,e){if(this.mShapeConfig.hasShapeProperty("y")){return this._configFirst("y",t)}return this.getRowYCenter(t,e)+this.getFontSize(t,e)/2};i.prototype.getText=function(t){return this._configFirst("text",t)};i.prototype.getTextAnchor=function(t){var e=this._configFirst("textAnchor",t);var i=sap.ui.getCore().getConfiguration().getRTL();if(i&&sap.ui.Device.browser.edge){if(e==="start"){return"end"}else if(e==="end"){return"start"}}return e};i.prototype.getFontSize=function(t){return this._configFirst("fontSize",t,true)};i.prototype.getFontFamily=function(t){return this._configFirst("fontFamily",t,false)};i.prototype.getWrapWidth=function(t){return this._configFirst("wrapWidth",t)};i.prototype.getWrapDy=function(t){return this._configFirst("wrapDy",t)};i.prototype.getTruncateWidth=function(t){return this._configFirst("truncateWidth",t)};i.prototype.getEllipsisWidth=function(t){return this._configFirst("ellipsisWidth",t)};i.prototype.getStyle=function(e,i){var r=t.prototype.getStyle.apply(this,arguments);var n={"font-size":this.getFontSize(e,i)+"px",fill:this.determineValueColor(this.getFill(e,i)),"fill-opacity":this.getFillOpacity(e,i),"font-family":this.getFontFamily(e,i)};var o=Object.assign(r,n);return o};return i},true);
//# sourceMappingURL=Text.js.map
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/drawer/Drawer","sap/gantt/misc/Utility","sap/ui/thirdparty/d3"],function(t,e){"use strict";var a=t.extend("sap.gantt.drawer.ShapeCrossRow");a.prototype.drawSvg=function(t,e,a,r){this._oAxisTime=a;this._oAxisOrdinal=r;var n=t.select("."+e.getId()+"-top");if(n.empty()){n=t.append("g").classed(e.getId()+"-top",true)}var i=[];for(var o in e.dataSet){i.push(e.dataSet[o].shapeData[0])}var s=n.selectAll("."+e.getId()).data(i);this._drawPath(s,e);this._drawInsertTitle(s,e)};a.prototype._drawPath=function(t,e){var a=this._findObjectInfo;var r=this;t.enter().append("path").classed(e.getId(),true);t.classed("hasTitle",function(t){return e.getTitle(t,a(this,e,r))?true:false}).classed("enableSelected",function(t){return e.getEnableSelection(t,a(this,e,r))?true:false}).attr("d",function(t){return e.getD(t,a(this,e,r))}).attr("fill",function(t){if(e.getIsClosed(t,a(this,e,r))){return e.getFill(t,a(this,e,r))}}).attr("stroke",function(t){return e.getStroke(t,a(this,e,r))}).attr("stroke-width",function(t){return e.getStrokeWidth(t,a(this,e,r))}).attr("stroke-dasharray",function(t){return e.getStrokeDasharray(t,a(this,e,r))}).attr("fill-opacity",function(t){if(e.getIsClosed(t,a(this,e,r))){return e.getFillOpacity(t,a(this,e,r))}}).attr("stroke-opacity",function(t){if(e.getIsClosed(t,a(this,e,r))){return e.getStrokeOpacity(t,a(this,e,r))}});this.addDataAttributes(t);t.exit().remove()};a.prototype._drawInsertTitle=function(t,e){var a=this._findObjectInfo;t.select("title").remove();t.insert("title",":first-child").each(function(t){var r=d3.select(this);r.selectAll("tspan").remove();r.text(e.getTitle(t,a(this,e)))})};a.prototype._findObjectInfo=function(t,e,a,r){var n=t.__data__;var i=n;if(r){i=n.data.rawData}var o={from:{objectInfo:i.fromObject.objectInfoRef?i.fromObject.objectInfoRef:i.fromObject,shapeRawData:i.fromShapeRawData},to:{objectInfo:i.toObject.objectInfoRef?i.toObject.objectInfoRef:i.toObject,shapeRawData:i.toShapeRawData}};return o};a.prototype.destroySvg=function(t,e){};a.prototype.generateRelationshipDataSet=function(t,a,r,n,i,o,s){var f=i;var h=[];if(f!==undefined&&f.length>0){var p;var d;for(d in a){if(a[d].getCategory(null,o,s)===sap.gantt.shape.ShapeCategory.Relationship){p=a[d];break}}if(p){var l={};for(d in a){if(a[d].dataSet&&a[d].dataSet!=""&&a[d].mShapeConfig.getShapeDataName()!=sap.gantt.shape.ShapeCategory.Relationship){e.generateObjectPathToObjectMap(a[d].dataSet,l,null)}}e.generateObjectPathToObjectMap(r,l,null);var c;var u;for(var g=0;g<f.length;g++){c=f[g];u=c;var v=p.getFromObjectPath(u,null);var S=l[v+"-"+p.getFromExpandRowIndex(u,null)];if(!S){continue}var b=p.getToObjectPath(u,null);var m=l[b+"-"+p.getToExpandRowIndex(u,null)];if(!m){continue}var D=p.getFromShapeId(u,null);var _=p.getFromDataId(u,null);var j=a[D].mShapeConfig.getShapeDataName();var y=this._findShapeDataFromRowObjectByShapeDataName(S,_,j);if(!y){continue}var I=p.getToShapeId(u,null);var O=p.getToDataId(u,null);var w=a[I].mShapeConfig.getShapeDataName();var R=this._findShapeDataFromRowObjectByShapeDataName(m,O,w);if(!R){continue}u.fromObject=S;u.toObject=m;u.fromShapeRawData=y;u.toShapeRawData=R;var T={shapeData:[c]};h.push(T)}}}return h};a.prototype._findShapeDataFromRowObjectByShapeDataName=function(t,e,a){var r,n;if(t.shapeData){n=t.shapeData}else if(t.data&&t.data[a]){n=t.data[a]}else if(t.data){return t.data}else{n=t}for(var i=0;i<n.length;i++){if(n[i].__id__!==undefined&&n[i].__id__==e){r=n[i];break}}if(r==undefined&&n.length>0){r=n[0]}return r};a.prototype.addDataAttributes=function(t){t.attr("data-sap-gantt-shape-id",function(t){return t.__id__})};return a},true);
//# sourceMappingURL=ShapeCrossRow.js.map
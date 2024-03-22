/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/base/Log","sap/gantt/shape/Path","sap/gantt/misc/Format","sap/ui/core/Core"],function(t,e,i,a){"use strict";var r=e.extend("sap.gantt.shape.ResizeShadowShape",{metadata:{properties:{height:{type:"int",defaultValue:15}}}});r.prototype.getIsDuration=function(t,e){if(this.mShapeConfig.hasShapeProperty("isDuration")){return this._configFirst("isDuration",t)}return this.getParent().getIsDuration()};r.prototype.getD=function(e,r){var n,g,s,o,h;var p="";var f=this.getParent().getTag();switch(f){case"rect":case"image":n=this.getStrokeWidth(e,r);g=this.getParent().getX(e,r)-n/2;o=this.getParent().getY(e,r)-n/2;s=g+this.getParent().getWidth(e,r)+n;h=o+this.getParent().getHeight(e)+n;p="M "+g+" "+o+" L "+s+" "+o+" L "+s+" "+h+" L "+g+" "+h+" z";break;case"line":n=this.getStrokeWidth(e,r);g=this.getParent().getX1(e,r)-n/2;o=this.getParent().getY1(e,r)-n/2;s=this.getParent().getX2(e,r)+n;h=this.getParent().getY2(e,r)+n;p="M "+g+" "+o+" L "+s+" "+o+" L "+s+" "+h+" L "+g+" "+h+" z";break;case"path":p=this.getParent().getD(e,r);break;case"clippath":p=this.getParent().getPaths()[0].getD(e,r);break;case"polygon":case"polyline":var u=this.getParent().getPoints(e,r);var P=u.split(" ");if(P!==undefined&&P[0]==""){P.splice(0,1)}if(P!==undefined&&P.length>1){p="M ";var c;for(var l in P){c=P[l].split(",");if(P[l]!==""&&c.length>1){if(l==P.length-1){if(f==="polygon"){p=p+c[0]+" "+c[1]+" z"}else{p=p+c[0]+" "+c[1]}}else{p=p+c[0]+" "+c[1]+" L "}}}}break;case"circle":var d,m,T;d=this.getParent().getCx(e,r);m=this.getParent().getCy(e,r);T=this.getParent().getR(e);p="M "+d+" "+m+" A "+T+" "+T+", 0, 1, 1, "+d+" "+m;break;case"text":break;default:var v;var y=this.getParent().getStrokeWidth(e,r);n=this.getStrokeWidth(e,r);var S=this.getParent().getTime(e,r);var k=this.getParent().getEndTime(e,r);var b=this.getParent().getAxisTime();var L=this.getHeight(e)+y;if(a.getConfiguration().getRTL()){g=b.timeToView(i.abapTimestampToDate(k));s=b.timeToView(i.abapTimestampToDate(S))}else{g=b.timeToView(i.abapTimestampToDate(S));s=b.timeToView(i.abapTimestampToDate(k))}if(this.getParent().mShapeConfig.hasShapeProperty("y")){o=this.getParent()._configFirst("y",e)-n/2}else{o=this.getParent().getRowYCenter(e,r)-L/2-n/2}if(this.getParent().mShapeConfig.hasShapeProperty("width")){v=this.getParent()._configFirst("width",e)+n}else{v=s-g-y-1+n}if(v===0||v<0||!v){v=2}s=g+v;h=o+L;p="M "+g+" "+o+" L "+s+" "+o+" L "+s+" "+h+" L "+g+" "+h+" z";break}if(this.isValid(p)){return p}else{t.warning("ResizeShadowShape generated invalid d: "+p+" from the given data: "+e);return null}};r.prototype.getStrokeWidth=function(t,e){var i=this.getParent().getStrokeWidth(t,e);return i?i:2};r.prototype.getTransform=function(t,e){return this.getParent().getTransform(t,e)};r.prototype.getEnableSelection=function(t,e){return false};r.prototype.getStroke=function(t,e){return"red"};r.prototype.getFill=function(t,e){return"none"};r.prototype.getHeight=function(t){return this._configFirst("height",t,true)};return r},true);
//# sourceMappingURL=ResizeShadowShape.js.map
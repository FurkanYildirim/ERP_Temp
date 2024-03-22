/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/base/Log","sap/gantt/shape/Path","sap/ui/core/Core"],function(t,e,a){"use strict";var o=e.extend("sap.gantt.shape.ext.rls.Relationship",{metadata:{properties:{htmlClass:{type:"string",defaultValue:"relationshipLine"},category:{type:"string",defaultValue:sap.gantt.shape.ShapeCategory.Relationship},isClosed:{type:"boolean",defaultValue:true},isDuration:{type:"boolean",defaultValue:false},stroke:{type:"string",defaultValue:"#000000"},fill:{type:"string",defaultValue:"#000000"},type:{type:"sap.gantt.shape.ext.rls.RelationshipType",defaultValue:sap.gantt.shape.ext.rls.RelationshipType.FinishToFinish},fromObjectPath:{type:"string"},fromExpandRowIndex:{type:"int",defaultValue:0},fromShapeId:{type:"string"},fromDataId:{type:"string"},toObjectPath:{type:"string"},toExpandRowIndex:{type:"int",defaultValue:0},toShapeId:{type:"string"},toDataId:{type:"string"},showStart:{type:"boolean",defaultValue:false},showEnd:{type:"boolean",defaultValue:true},lShapeforTypeFS:{type:"boolean",defaultValue:true},minXLen:{type:"float",defaultValue:10},arrowSideLength:{type:"float",defaultValue:5}},aggregations:{selectedShape:{type:"sap.gantt.shape.ext.rls.SelectedRelationship",multiple:false}}}});o.prototype.init=function(){this._isRTL=a.getConfiguration().getRTL();var t=sap.ui.getCore().getLibraryResourceBundle("sap.gantt");this.setProperty("ariaLabel",t.getText("ARIA_RELATIONSHIP"))};o.prototype.getType=function(t){return this._configFirst("type",t)};o.prototype.getFromObjectPath=function(t){return this._configFirst("fromObjectPath",t)};o.prototype.getFromExpandRowIndex=function(t){return t.hasOwnProperty("fromExpandRowIndex")?this._configFirst("fromExpandRowIndex",t):this.getProperty("fromExpandRowIndex")};o.prototype.getFromShapeId=function(t){return this._configFirst("fromShapeId",t)};o.prototype.getFromDataId=function(t){return this._configFirst("fromDataId",t)};o.prototype.getToObjectPath=function(t){return this._configFirst("toObjectPath",t)};o.prototype.getToExpandRowIndex=function(t){return t.hasOwnProperty("toExpandRowIndex")?this._configFirst("toExpandRowIndex",t):this.getProperty("toExpandRowIndex")};o.prototype.getToShapeId=function(t){return this._configFirst("toShapeId",t)};o.prototype.getToDataId=function(t){return this._configFirst("toDataId",t)};o.prototype.getLShapeforTypeFS=function(t){return this._configFirst("lShapeforTypeFS",t)};o.prototype.getHtmlClass=function(t){return this._configFirst("htmlClass",t)};o.prototype.getShowStart=function(t){return this._configFirst("showStart",t)};o.prototype.getShowEnd=function(t){return this._configFirst("showEnd",t)};o.prototype.getD=function(e,a){var o=this.getShowEnd(e,a);var i=this.getShowStart(e,a);var n,s,r,p;var h;try{h=window.parseInt(this.getType(e,a))}catch(e){t.warning("invalid relationship type")}var l=this.getLShapeforTypeFS(e,a);var c=this.getFromShapeId(e,a.from.objectInfo);var f=this.mChartInstance.getShapeInstance(c);var g=f.getRLSAnchors(a.from.shapeRawData,a.from.objectInfo);var y=this.getToShapeId(e,a.from.objectInfo);var d=this.mChartInstance.getShapeInstance(y);var u=d.getRLSAnchors(a.to.shapeRawData,a.to.objectInfo);if(this._isRTL){if(h===sap.gantt.shape.ext.rls.RelationshipType.FinishToFinish){n=g.startPoint.x;s=g.startPoint.y;r=u.startPoint.x;p=u.startPoint.y}else if(h===sap.gantt.shape.ext.rls.RelationshipType.FinishToStart){n=g.startPoint.x;s=g.startPoint.y;r=u.endPoint.x;p=u.endPoint.y}else if(h===sap.gantt.shape.ext.rls.RelationshipType.StartToFinish){n=g.endPoint.x;s=g.endPoint.y;r=u.startPoint.x;p=u.startPoint.y}else if(h===sap.gantt.shape.ext.rls.RelationshipType.StartToStart){n=g.endPoint.x;s=g.endPoint.y;r=u.endPoint.x;p=u.endPoint.y}}else if(h===sap.gantt.shape.ext.rls.RelationshipType.FinishToFinish){n=g.endPoint.x;s=g.endPoint.y;r=u.endPoint.x;p=u.endPoint.y}else if(h===sap.gantt.shape.ext.rls.RelationshipType.FinishToStart){n=g.endPoint.x;s=g.endPoint.y;r=u.startPoint.x;p=u.startPoint.y}else if(h===sap.gantt.shape.ext.rls.RelationshipType.StartToFinish){n=g.startPoint.x;s=g.startPoint.y;r=u.endPoint.x;p=u.endPoint.y}else if(h===sap.gantt.shape.ext.rls.RelationshipType.StartToStart){n=g.startPoint.x;s=g.startPoint.y;r=u.startPoint.x;p=u.startPoint.y}var x="";if(i){var w=this._calculateSquareCoordinate(h,n,s);x=x.concat("M").concat(w[0].x).concat(",").concat(w[0].y).concat(" ");var T=w.length;for(var R=1;R<T;R++){x=x.concat("L").concat(w[R].x).concat(",").concat(w[R].y).concat(" ")}}var S=this._calculateLineCoordinate(l,h,n,r,s,p,a.from.objectInfo,u.startPoint.height);x=x.concat("M").concat(S[0].x).concat(",").concat(S[0].y).concat(" ");var P=S.length;for(var v=0;v<P;v++){x=x.concat("L").concat(S[v].x).concat(",").concat(S[v].y).concat(" ");x=x.concat("M").concat(S[v].x).concat(",").concat(S[v].y).concat(" ")}if(o){var F=this._calculateArrowCoordinate(l,h,n,r,s,p,u.startPoint.height);var M=F.length;for(var m=0;m<M;m++){x=x.concat("L").concat(F[m].x).concat(",").concat(F[m].y).concat(" ")}}x=x.concat("Z");if(this.isValid(x)){return x}else{t.warning("Relationship shape generated invalid d: "+x+" from the given data: "+e);return null}};o.prototype._calculateSquareCoordinate=function(t,e,a){var o=[];if(t===sap.gantt.shape.ext.rls.RelationshipType.FinishToFinish||t===sap.gantt.shape.ext.rls.RelationshipType.FinishToStart){if(this._isRTL){o=[e,a-2,e-3,a-2,e-3,a+1.5,e,a+1.5,e,a-2]}else{o=[e-1,a-2,e-1+3,a-2,e-1+3,a+1.5,e-1,a+1.5,e-1,a-2]}}else if(this._isRTL){o=[e-1,a-2,e-1+3,a-2,e-1+3,a+1.5,e-1,a+1.5,e-1,a-2]}else{o=[e,a-2,e-3,a-2,e-3,a+1.5,e,a+1.5,e,a-2]}var i=[];var n=o.length;for(var s=0;s<n;){i[i.length]={x:o[s++],y:o[s++]}}return i};o.prototype._calculateLineCoordinate=function(t,e,a,o,i,n,s,r){var p=[];var h,l;if(i===n){p=p.concat([a,i,o,n])}else{var c=this.getMinXLen();if(e===sap.gantt.shape.ext.rls.RelationshipType.FinishToFinish){if(this._isRTL){p=p.concat([a,i,Math.min(a,o)-c,i,Math.min(a,o)-c,n,o,n])}else{p=p.concat([a,i,Math.max(a,o)+c,i,Math.max(a,o)+c,n,o,n])}}else if(e===sap.gantt.shape.ext.rls.RelationshipType.FinishToStart){if(t){if(this._isRTL){if(a>=o){if(i<n){n=n-r/2-2}else{n=n+r/2+2}p=p.concat([a,i,o,i,o,n])}else if(i<n){l=s.y+s.rowHeight;p=p.concat([a,i,a-c,i,a-c,l,o+c,l,o+c,n,o,n])}else if(i>n){h=s.y;p=p.concat([a,i,a-c,i,a-c,h,o+c,h,o+c,n,o,n])}}else if(a<=o){if(i<n){n=n-r/2-2}else{n=n+r/2+2}p=p.concat([a,i,o,i,o,n])}else if(i<n){l=s.y+s.rowHeight;p=p.concat([a,i,a+c,i,a+c,l,o-c,l,o-c,n,o,n])}else if(i>n){h=s.y;p=p.concat([a,i,a+c,i,a+c,h,o-c,h,o-c,n,o,n])}}else if(this._isRTL){if(a-c>o){p=p.concat([a,i,a-c,i,a-c,n,o,n])}else if(i<n){l=s.y+s.rowHeight;p=p.concat([a,i,a-c,i,a-c,l,o+c,l,o+c,n,o,n])}else if(i>n){h=s.y-s.rowHeight;p=p.concat([a,i,a-c,i,a-c,h,o+c,h,o+c,n,o,n])}}else if(a+c<=o){if(this.getShowEnd()){var f=this.getArrowSideLength();c=a+c+f>o?Math.abs(c-f):c}p=p.concat([a,i,a+c,i,a+c,n,o,n])}else if(i<n){l=s.y+s.rowHeight;p=p.concat([a,i,a+c,i,a+c,l,o-c,l,o-c,n,o,n])}else if(i>n){h=s.y-s.rowHeight;p=p.concat([a,i,a+c,i,a+c,h,o-c,h,o-c,n,o,n])}}else if(e===sap.gantt.shape.ext.rls.RelationshipType.StartToFinish){if(this._isRTL){if(a<o-c){p=p.concat([a,i,a+c,i,a+c,n,o,n])}else if(i<n){l=s.y+s.rowHeight;p=p.concat([a,i,a+c,i,a+c,l,o-c,l,o-c,n,o,n])}else if(i>n){h=s.y;p=p.concat([a,i,a+c,i,a+c,h,o-c,h,o-c,n,o,n])}}else if(a>=o+c){p=p.concat([a,i,a-c,i,a-c,n,o,n])}else if(i<n){l=s.y+s.rowHeight;p=p.concat([a,i,a-c,i,a-c,l,o+c,l,o+c,n,o,n])}else if(i>n){h=s.y;p=p.concat([a,i,a-c,i,a-c,h,o+c,h,o+c,n,o,n])}}else if(e===sap.gantt.shape.ext.rls.RelationshipType.StartToStart){if(this._isRTL){p=p.concat([a,i,Math.max(a,o)+c,i,Math.max(a,o)+c,n,o,n])}else{p=p.concat([a,i,Math.min(a,o)-c,i,Math.min(a,o)-c,n,o,n])}}}var g=[];var y=p.length;for(var d=0;d<y;){g[g.length]={x:p[d++],y:p[d++]}}return g};o.prototype._calculateArrowCoordinate=function(t,e,a,o,i,n,s){var r=[];var p=this.getArrowSideLength();if(e===sap.gantt.shape.ext.rls.RelationshipType.FinishToFinish||e===sap.gantt.shape.ext.rls.RelationshipType.StartToFinish){if(this._isRTL){r=[o-p*Math.pow(3,1/2)/2,n-p/2,o-p*Math.pow(3,1/2)/2,n+p/2]}else{r=[o+p*Math.pow(3,1/2)/2,n-p/2,o+p*Math.pow(3,1/2)/2,n+p/2]}}else if(e===sap.gantt.shape.ext.rls.RelationshipType.StartToStart){if(this._isRTL){r=[o+p*Math.pow(3,1/2)/2,n-p/2,o+p*Math.pow(3,1/2)/2,n+p/2]}else{r=[o-p*Math.pow(3,1/2)/2,n-p/2,o-p*Math.pow(3,1/2)/2,n+p/2]}}else if(t){if(this._isRTL){if(a>=o){if(i<n){n=n-s/2-1}else if(i>n){n=n+s/2+1}else{}if(i<n){r=[o+p/2,n-p*Math.pow(3,1/2)/2,o-p/2,n-p*Math.pow(3,1/2)/2]}else if(i==n){r=[o+p*Math.pow(3,1/2)/2,n-p/2,o+p*Math.pow(3,1/2)/2,n+p/2]}else{r=[o+p/2,n+p*Math.pow(3,1/2)/2,o-p/2,n+p*Math.pow(3,1/2)/2]}}else{r=[o+p*Math.pow(3,1/2)/2,n-p/2,o+p*Math.pow(3,1/2)/2,n+p/2]}}else if(a<=o){if(i<n){n=n-s/2-1}else if(i>n){n=n+s/2+1}else{}if(i<n){r=[o-p/2,n-p*Math.pow(3,1/2)/2,o+p/2,n-p*Math.pow(3,1/2)/2]}else if(i==n){r=[o-p*Math.pow(3,1/2)/2,n-p/2,o-p*Math.pow(3,1/2)/2,n+p/2]}else{r=[o-p/2,n+p*Math.pow(3,1/2)/2,o+p/2,n+p*Math.pow(3,1/2)/2]}}else{r=[o-p*Math.pow(3,1/2)/2,n-p/2,o-p*Math.pow(3,1/2)/2,n+p/2]}}else if(this._isRTL){r=[o+p*Math.pow(3,1/2)/2,n-p/2,o+p*Math.pow(3,1/2)/2,n+p/2]}else{r=[o-p*Math.pow(3,1/2)/2,n-p/2,o-p*Math.pow(3,1/2)/2,n+p/2]}var h=[];var l=r.length;for(var c=0;c<l;){h[h.length]={x:r[c++],y:r[c++]}}return h};return o},true);
//# sourceMappingURL=Relationship.js.map
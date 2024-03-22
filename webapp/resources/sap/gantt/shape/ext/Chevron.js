/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/base/Log","sap/gantt/shape/Path","sap/gantt/misc/Format","sap/ui/core/Core"],function(t,e,n,a){"use strict";var i=e.extend("sap.gantt.shape.ext.Chevron",{metadata:{properties:{isClosed:{type:"boolean",defaultValue:true},isDuration:{type:"boolean",defaultValue:true},headLength:{type:"float",defaultValue:5},tailLength:{type:"float",defaultValue:5},height:{type:"float",defaultValue:15}}}});i.prototype.init=function(){this._isRTL=a.getConfiguration().getRTL();var t=sap.ui.getCore().getLibraryResourceBundle("sap.gantt");this.setProperty("ariaLabel",t.getText("ARIA_CHEVRON"))};i.prototype.getD=function(e,a){var i;if(this.mShapeConfig.hasShapeProperty("d")){i=this._configFirst("d",e)}else{var r=this.getHeight(e,a);var g=this.getHeadLength(e,a),h=this.getTailLength(e,a),o=this.getAxisTime();var l=o.timeToView(n.abapTimestampToDate(this.getTime(e,a)));var s=o.timeToView(n.abapTimestampToDate(this.getEndTime(e,a)));var u=this.getRowYCenter(e,a);i=this.getDString({nStartOriginalX:l,nEndOriginalX:s,nTailLength:h,nHeadLength:g,nHeight:r,nRowYCenter:u})}if(this.isValid(i)){return i}else{t.warning("Chevron shape generated invalid d: "+i+" from the given data: "+e);return null}};i.prototype.getDString=function(t){var e=t.nHeight/2;if(this._isRTL){var n=t.nStartOriginalX-t.nEndOriginalX-t.nHeadLength;var n=n>0?n:1;var a=n===1?t.nStartOriginalX-1:t.nStartOriginalX-t.nTailLength;var i="m "+a+" "+t.nRowYCenter+" l "+t.nTailLength+" -"+e+" l -"+n+" "+0+" l -"+t.nHeadLength+" "+e+" l "+t.nHeadLength+" "+e+" l "+n+" "+0+" z"}else{var n=t.nEndOriginalX-t.nStartOriginalX-t.nHeadLength;var n=n>0?n:1;var a=n===1?t.nStartOriginalX+1:t.nStartOriginalX+t.nTailLength;var i="m "+a+" "+t.nRowYCenter+" l -"+t.nTailLength+" -"+e+" l "+n+" "+0+" l "+t.nHeadLength+" "+e+" l -"+t.nHeadLength+" "+e+" l -"+n+" "+0+" z"}return i};i.prototype.getHeadLength=function(t){return this._configFirst("headLength",t,true)};i.prototype.getTailLength=function(t){return this._configFirst("tailLength",t,true)};i.prototype.getHeight=function(t){return this._configFirst("height",t,true)};return i},true);
//# sourceMappingURL=Chevron.js.map
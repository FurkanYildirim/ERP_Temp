/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Element","sap/viz/library"],function(t,e){"use strict";var r=t.extend("sap.viz.ui5.controls.common.feeds.AnalysisObject",{metadata:{library:"sap.viz",properties:{uid:{type:"string",group:"Misc",defaultValue:null},name:{type:"string",group:"Misc",defaultValue:null},type:{type:"string",group:"Misc",defaultValue:null},dataType:{type:"string",group:"Misc",defaultValue:null}}}});r.prototype._toInnerFmt=function(t){var e=this.getProperty("uid");var r=this.getProperty("type");if(e&&r){return new t(e,this.getProperty("name"),r,this.getProperty("dataType"),this._inResult())}};r.prototype._inResult=function(t){if(!arguments.length){return!!this._bInResult}else{this._bInResult=t;return this}};r.toVizControlsFmt=function(t){return Array.prototype.map.call(t,function(t){return t._toInnerFmt(function(t,e,r,n){r=r?r.toLowerCase():r;n=n?n.toLowerCase():n;return new sap.viz.controls.common.feeds.AnalysisObject(t,e,r,n)})})};r.fromVizControlsFmt=function(t){return Array.prototype.map.call(t,function(t){return new r({uid:t.id(),name:t.name(),type:t.type(),dataType:t.dataType()})})};r.toLightWeightFmt=function(t){return Array.prototype.map.call(t,function(t){return t._toInnerFmt(function(t,e,r,n,u){n=i[n]||n;r=a[r]||r;if(n||n.length){return{id:t,type:r,inResult:u,dataType:n}}else{return{id:t,type:r,inResult:u}}})})};r.fromLightWeightFmt=function(t){return Array.prototype.map.call(t,function(t){return new r({uid:t.id,name:t.id,type:t.type,dataType:u[t.dataType]||t.dataType})._inResult(t.inResult)})};var n=function(t){var e={};for(var r in t){var n=t[r];e[n]=r}return e};var i={string:"String",number:"Number",date:"Date"};var a={measure:"Measure",dimension:"Dimension"};var u=n(i);return r});
//# sourceMappingURL=AnalysisObject.js.map
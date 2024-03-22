/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/base/ManagedObject","./Util","./ColumnWrapper","sap/base/util/isEmptyObject"],function(e,o,t,n){"use strict";var u=e.extend("sap.ui.comp.personalization.ColumnHelper",{constructor:function(o,t){e.apply(this,arguments)},metadata:{properties:{callbackOnSetVisible:{type:"object",defaultValue:null},callbackOnSetSummed:{type:"object",defaultValue:null},callbackOnSetGrouped:{type:"object",defaultValue:null}}}});u.prototype.init=function(){this._oColumnKey2ColumnMap={};this._oColumnKeyIsMonkeyPatched={}};u.prototype.exit=function(){this._oColumnKey2ColumnMap=null;this._oColumnKeyIsMonkeyPatched=null};u.prototype.addColumns=function(e){if(!e){return}e.forEach(function(e){this._addColumnToMap(o.getColumnKey(e),e)},this);this._checkConsistencyOfColumns(this._oColumnKey2ColumnMap)};u.prototype.addColumnMap=function(e){if(!e){return}for(var o in e){this._addColumnToMap(o,e[o])}this._checkConsistencyOfColumns(this._oColumnKey2ColumnMap)};u.prototype.getColumnMap=function(){return this._oColumnKey2ColumnMap};u.prototype._checkConsistencyOfColumns=function(e){if(n(e)){return}var t=Object.keys(e)[0];var u=!!o._getCustomProperty(e[t],"columnKey");for(var i in e){if(u!==!!o._getCustomProperty(e[i],"columnKey")){throw"The table instance contains some columns for which a columnKey is provided, some for which a columnKey is not provided."}}};u.prototype._addColumnToMap=function(e,o){if(this._oColumnKey2ColumnMap[e]){throw"Duplicate 'columnKey': The column '"+o.getId()+"' and column '"+this._oColumnKey2ColumnMap[e]+"' have same 'columnKey' "+e}if(!this._oColumnKey2ColumnMap[e]){this._oColumnKey2ColumnMap[e]=o;this._monkeyPatchColumn(o,e)}};u.prototype._monkeyPatchColumn=function(e,o){if(e instanceof t){return}if(this._oColumnKeyIsMonkeyPatched[o]){return}this._oColumnKeyIsMonkeyPatched[o]=true;var n=this.getCallbackOnSetVisible();var u=e.setVisible.bind(e);var i=function(e){if(n){n(e,o)}u(e)};e.setVisible=i;if(e.setSummed){var l=this.getCallbackOnSetSummed();var a=e.setSummed.bind(e);var s=function(o){if(l){l(o,e)}a(o)};e.setSummed=s}if(e.isA("sap.ui.table.AnalyticalColumn")){var c=this.getCallbackOnSetGrouped();if(typeof c==="function"){var m=e.setGrouped.bind(e);var r=function(o,t){if(!t&&c){c(o,e)}m(o)};e.setGrouped=r}}};return u});
//# sourceMappingURL=ColumnHelper.js.map
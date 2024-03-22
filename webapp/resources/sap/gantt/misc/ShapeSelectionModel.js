/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/base/ManagedObject","sap/gantt/misc/Utility"],function(jQuery,e,t){"use strict";var i=e.extend("sap.gantt.misc.ShapeSelectionModel",{constructor:function(t,i){e.apply(this,arguments);this.aSelectedRelationships=[];this.mSelectedShapes={uid:[],shapes:[]}},metadata:{properties:{selectionMode:{type:"sap.gantt.SelectionMode",defaultValue:sap.gantt.SelectionMode.MultiWithKeyboard}},associations:{ganttChart:{type:"sap.gantt.GanttChart",multiple:false}}}});var a={Row:"Row",Shape:"Shape"};i.prototype.clearAllSelections=function(){var e=this.clearShapeSelection();var t=this.clearRelationshipSelection();return e&&t};i.prototype.clearShapeSelection=function(){if(this.mSelectedShapes.uid.length===0){return false}this.mSelectedShapes.uid=[];return true};i.prototype.clearRelationshipSelection=function(){if(this.aSelectedRelationships.length===0){return false}this.aSelectedRelationships=[];return true};i.prototype.getSelectedShapeDatum=function(){var e=[];var t=this.mSelectedShapes.uid.length;for(var i=0;i<t;i++){var a=this.mSelectedShapes.uid[i];var n=this.getShapeDatumByShapeUid(a);if(n){e.push(n)}}return e};i.prototype.getSelectedRelationships=function(){return this.aSelectedRelationships};i.prototype.isShapeSelected=function(e){return jQuery.inArray(e,this.mSelectedShapes.uid)===-1?false:true};i.prototype.isRelationshipSelected=function(e){return this.aSelectedRelationships.some(function(t){return t.uid===e})};i.prototype.isSelectedShapeVisible=function(e,i){var a=t.getIdByUid(e);var n=t.getShapeDatumById(a,i);return n.some(function(t){return t.uid===e})};i.prototype.changeShapeSelection=function(e,i,a,n,r){var o,l;if(this.getSelectionMode()===sap.gantt.SelectionMode.None){return{shapeSelectionChange:false,relationshipSelectionChange:false}}var s=t.getShapeDataNameByUid(e.uid)===sap.gantt.shape.ShapeCategory.Relationship;var h=a&&this.getSelectionMode()===sap.gantt.SelectionMode.MultiWithKeyboard||this.getSelectionMode()===sap.gantt.SelectionMode.Multiple;if(h){if(s){if(this.isRelationshipSelected(e.uid)){l=this.deselectRelationship(e.uid)}else{l=this.selectRelationship(e)}}else{if(this.isShapeSelected(e.uid)&&!n&&!r){o=this.deselectShape(e.uid)}else{o=this.selectByShapeData(e)}}}else{if(s){if(!this.isRelationshipSelected(e.uid)){l=this.clearRelationshipSelection();o=this.clearShapeSelection();l=this.selectRelationship(e)?true:l}}else{if(!this.isShapeSelected(e.uid)&&!n&&!r){l=this.clearRelationshipSelection();o=this.clearShapeSelection();o=this.selectByShapeData(e)?true:o}}}return{shapeSelectionChange:o,relationshipSelectionChange:l}};i.prototype.selectByShapeData=function(e){if(!e||this.isShapeSelected(e.uid)){return false}this.mSelectedShapes.uid.push(e.uid);return true};i.prototype.selectShapeByUid=function(e){var t;if(e&&e.length>0){for(var i=0;i<e.length;i++){t=t||this.selectByShapeData(this.getShapeDatumByShapeUid(e[i]))}}return t};i.prototype.deselectShape=function(e){var t=jQuery.inArray(e,this.mSelectedShapes.uid);if(t>=0){this.mSelectedShapes.uid.splice(t,1)}else{return false}return true};i.prototype.selectShapes=function(e,t){if(!e||e.length===0){return this.clearShapeSelection()}var i;if(t){i=this.clearShapeSelection()}var a=this._getShapeDatumForSelection(e);for(var n=0;n<a.length;n++){i=this.selectByShapeData(a[n])?true:i}return i};i.prototype.deselectShapes=function(e){if(!e||e.length===0){return this.clearShapeSelection()}var t;var i=this.getSelectedShapeDatum();for(var a=0;a<i.length;a++){var n=i[a];if(jQuery.inArray(n.__id__,e)>=0){t=this.deselectShape(n.uid)?true:t}}return t};i.prototype.selectRelationship=function(e){if(this.isRelationshipSelected(e.uid)){return false}this.aSelectedRelationships.push(e);return true};i.prototype.deselectRelationship=function(e){var t=this;var i=jQuery.each(this.aSelectedRelationships,function(i,a){if(a&&a.uid===e){t.aSelectedRelationships.splice(i,1);return true}});return i?true:false};i.prototype.selectRelationships=function(e,t){if(!e||e.length===0){return this.clearRelationshipSelection()}var i;if(t){i=this.clearRelationshipSelection()}for(var a=0;a<e.length;a++){i=this.selectRelationship(e[a])?true:i}return i};i.prototype.deselectRelationships=function(e){if(!e||e.length===0){return this.clearRelationshipSelection()}else{var t;for(var i in this.aSelectedRelationships){var a=this.aSelectedRelationships[i];if(jQuery.inArray(a.id,e)>=0){t=this.deselectRelationship(a.uid)?true:t}}return t}};i.prototype.selectUnderlyingTableRows=function(e,t,i){var a=this._getSelectionHandler(t);var n=a.getSelectedIndices();if(i&&n.length>0){a.clearSelection()}var r=this._getRowDatumForSelection(e,t);for(var o=0;o<r.length;o++){var l=r[o];var s=this.getSelectionMode();if(s===sap.gantt.SelectionMode.Multiple||s===sap.gantt.SelectionMode.MultiWithKeyboard){a.addSelectionInterval(l.rowIndex,l.rowIndex)}else{a.setSelectedIndex(l.rowIndex)}}};i.prototype.deselectUnderlyingTableRows=function(e,t){if(!e||e.length===0){this._getSelectionHandler(t).clearSelection();return}var i=this._getRowDatumForSelection(e,t);for(var a=0;a<i.length;a++){var n=i[a];if(n){this._getSelectionHandler(t).removeSelectionInterval(n.rowIndex,n.rowIndex)}}};i.prototype.getShapeDatumByShapeUid=function(e){return this._getDatumByUid(e,a.Shape)};i.prototype.getRowDatumByShapeUid=function(e){return this._getDatumByUid(e,a.Row)};i.prototype._getDatumByUid=function(e,i){var n=this._getGanttChart();var r;if(a.Shape===i){r=t.getShapeDatumByShapeUid(e,n.getId())}else{r=t.getRowDatumByShapeUid(e,n.getId())}if(r){return r}var o,l;var s=t.getShapeDataNameByUid(e);var h=n._oTT.getBinding("rows").getMetadata().getName()==="sap.ui.model.json.JSONTreeBinding";var p=t.getChartSchemeByShapeUid(e);var u=n.getAllRowData();jQuery.each(u,function(t,i){var a=i;if(p===""||p===a.chartScheme){if(h&&a.data[s]){for(var n=0;n<a.data[s].length;n++){if(a.data[s][n].uid===e){o=a;l=a.data[s][n];return false}}}else if(a.data.uid===e){o=a;l=a.data;return false}}});if(i===a.Shape){return l}return o};i.prototype._getRowDatumForSelection=function(e,i){var n=e?e:[],r=t.getRowDatumRefById(n,i.getParent().getId()),o=r.length===n.length;if(!o){var l=this._lookupInvisibleDatum(n,r,a.Row);r=r.concat(l)}return r};i.prototype._getShapeDatumForSelection=function(e){var i=this._getGanttChart();var n=e?e:[];var r=t.getShapeDatumById(n,i.getId()),o=r.length===n.length;if(!o){var l=this._lookupInvisibleDatum(n,r,a.Shape);r=r.concat(l)}return r};i.prototype._lookupInvisibleDatum=function(e,t,i){var n=this._getInvisibleIds(e,t,i);var r=[];if(n.length>0){var o=this._getGanttChart(),l=o.getShapeDataNames();var s=o.getAllRowData();var h=function(e,t){var i=null;jQuery.each(l,function(a,n){var r;if(typeof n==="string"){r=n}else{r=n.name}var o=e.data[r];if(o){jQuery.each(o,function(e,a){if(a.__id__==t){i=a;return false}});if(i){return false}}});return i};var p=function(e,t){var i=null;jQuery.each(s,function(n,r){if(t===a.Shape){i=h(r,e);if(i){return false}}else{if(r.id==e){i=r;return false}}});return i};r=n.map(function(e){return p(e,i)})}return r};i.prototype._getInvisibleIds=function(e,t,i){var n=t.map(function(e){if(i===a.Shape){return e.__id__}return e.id});return e.filter(function(e){return jQuery.inArray(e,n)===-1})};i.prototype._getGanttChart=function(){return sap.ui.getCore().byId(this.getGanttChart())};i.prototype._getSelectionHandler=function(e){return e._oSelectionPlugin||e};return i});
//# sourceMappingURL=ShapeSelectionModel.js.map
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/Control","sap/ui/table/library","sap/ui/table/utils/TableUtils","sap/gantt/simple/GanttExtension","sap/gantt/simple/InnerGanttChartRenderer"],function(e,t,n,a,r){"use strict";var i=t.extend("sap.gantt.simple.InnerGanttChart",{metadata:{library:"sap.gantt",events:{ganttReady:{parameters:{hasRenderedShapes:{type:"boolean"},totalRenderedShapes:{type:"int"},supressEvent:{type:"boolean"}}},_afterGanttRendered:{}}}});i.prototype.getDomRef=function(e){var t=this.getParent(),n;if(e){n="-"+e}else{n="-cnt"}if(t){return window.document.getElementById(t.getId()+n)}return null};i.prototype.invalidate=function(){var e=this.getParent();e._oInnerGanttRenderPromise.then(function(){e._bInnerGanttRenderPromiseResolved=true;var t=this.getUIArea();if(t){t.addInvalidatedControl(this)}}.bind(this))};i.prototype.hasRenderedShapes=function(){return this.$("svg").find(".sapGanttChartShapes").children().length>0};i.prototype.getTotalRenderedShapes=function(){return this.$("svg").find(".sapGanttChartShapes").children().length};i.prototype.resolveWhenReady=function(e){return new Promise(function(t){var r=function i(o){var s=this.getParent();if(s._enableOptimisation){s.getTable().setVisibleRowCountMode(sap.ui.table.VisibleRowCountMode.Fixed)}if(e&&!o.getParameter("hasRenderedShapes")||s.getTable().getVisibleRowCountMode()===n.VisibleRowCountMode.Auto&&s.getSyncedControl().getRowStates().length<s.getTable().getVisibleRowCount()+a.getHeaderRowCount(s.getTable())){this.attachEventOnce("ganttReady",r)}else{t()}}.bind(this);var i=Object.keys(this.getUIArea().mInvalidatedControls);if(i.indexOf(this.getParent().getId())>-1||i.indexOf(this.getParent().getTable().getId())>-1){this.attachEventOnce("ganttReady",r)}else if(!e&&this.getDomRef("svg")||e&&this.hasRenderedShapes()){t()}else{this.attachEventOnce("ganttReady",r)}}.bind(this))};i.prototype._updateRowsHoverState=function(){var e=this.getParent();setTimeout(function(){e.$("svg").find("rect.sapGanttBackgroundSVGRow:hover").each(function(){var t=e._getPointerExtension(),n=t._getRowIndexFromElement(this);e.getSyncedControl().syncRowHover(n,true)});e.$("svg").find("rect.sapGanttBackgroundSVGRow:not(:hover)").each(function(){var t=e._getPointerExtension(),n=t._getRowIndexFromElement(this);e.getSyncedControl().syncRowHover(n,false)})},0)};i.prototype.onBeforeRendering=function(e){performance.mark("InnerGanttChart--start");if(!this.getParent()._bPreventInitialRender||this.getParent()._bRenderGanttClone||this.getParent()._bRenderFullScreenGantt){this.getParent()._bRenderFullScreenGantt=false;this.getParent()._getScrollExtension().jumpToVisibleHorizon("initialRender")}};i.prototype.onAfterRendering=function(t){var n=this.getParent();n._updateVsbContainers();n._syncContainerGanttCharts("initialRender",t);var a=e.createRenderManager();this.getRenderer().renderRelationships(a,n);a.destroy();this.fireEvent("_afterGanttRendered");n._updateShapeSelections(n.getSelectedShapeUid(),[]);n.updateShapeHighlights(n.getHighlightedShapeUid(),[]);n._getConnectExtension().updateShapeConnectEffect(n);this._updateRowsHoverState();r.attachEvents(n);this.fireGanttReady({hasRenderedShapes:this.hasRenderedShapes(),totalRenderedShapes:this.getTotalRenderedShapes()});performance.mark("InnerGanttChart--end")};return i},true);
//# sourceMappingURL=InnerGanttChart.js.map
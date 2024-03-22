/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/misc/Utility","sap/ui/performance/Measurement"],function(e,t){"use strict";var r={};r.render=function(e,r){t.start("GanttChartContainerRenderer render","GanttPerf:GanttChartContainerRenderer render function");e.write("<div");e.writeControlData(r);e.addStyle("width",r.getWidth());e.addStyle("height",r.getHeight());e.writeStyles();e.addClass("sapGanttChartContainer");e.writeClasses();e.write(">");t.start("GanttChartContainerRenderer renderPaintServer","GanttPerf:GanttChartContainerRenderer renderPaintServer part");this.renderSvgDefs(e,r);t.end("GanttChartContainerRenderer renderPaintServer");t.start("GanttChartContainerRenderer renderToolbar","GanttPerf:GanttChartContainerRenderer renderToolbar part");this.renderToolbar(e,r);t.end("GanttChartContainerRenderer renderToolbar");t.start("GanttChartContainerRenderer renderGanttCharts","GanttPerf:GanttChartContainerRenderer renderGanttCharts part");this.renderGanttCharts(e,r);t.end("GanttChartContainerRenderer renderGanttCharts");e.write("</div>");t.end("GanttChartContainerRenderer render")};r.renderSvgDefs=function(e,t){var r=t.getSvgDefs();if(r){e.write("<svg");e.writeAttribute("id",t.getId()+"-svg-psdef");e.writeAttribute("aria-hidden","true");e.writeAttribute("tabindex",-1);e.writeAttribute("focusable",false);e.addClass("sapGanttInvisiblePaintServer");e.writeClasses();e.write(">");e.write(r.getDefString());e.write("</svg>")}};r.renderToolbar=function(e,t){e.renderControl(t._oToolbar)};r.renderGanttCharts=function(t,r){t.write("<div");t.addClass("sapGanttViewContainer");t.writeClasses();t.addStyle("width",r.getWidth());var n=r.getHeight();if(r._oToolbar.getAllToolbarItems().length>0){var a=e.findSapUiSizeClass();var i=a==="sapUiSizeCompact"||a==="sapUiSizeCondensed"?"32px":"48px";n="calc("+n+" - "+i+")"}t.addStyle("height",n);t.writeStyles();t.write(">");t.renderControl(r._oSplitter);t.write("</div>")};return r},true);
//# sourceMappingURL=GanttChartContainerRenderer.js.map
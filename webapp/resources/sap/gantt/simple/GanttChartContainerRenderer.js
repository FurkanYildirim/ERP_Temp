/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([],function(){"use strict";var t={apiVersion:2};t.render=function(t,e){if(e.getGanttCharts()&&e.getGanttCharts().length>0){e.getGanttCharts().forEach(function(t){if(t._bPreventInitialRender){delete t._bPreventInitialRender}})}t.openStart("div",e);t.class("sapGanttContainer");if(e.getShowSearchSidePanel()){t.class("sapGanttContainerWithSidePanel")}t.style("width",e.getWidth());t.style("height",e.getHeight());t.openEnd();this.renderSvgDefs(t,e);this.renderToolbar(t,e);this.renderGanttCharts(t,e);if(e.getShowSearchSidePanel()){this.renderSidePanel(t,e)}if(e.getEnableStatusBar()){this.renderStatusBar(t,e)}t.close("div")};t.renderSvgDefs=function(t,e){var n=e.getSvgDefs();if(n){t.openStart("svg",e.getId()+"-svg-psdef");t.attr("aria-hidden","true");t.attr("tabindex",-1);t.attr("focusable",false);t.class("sapGanttInvisiblePaintServer");t.openEnd();t.unsafeHtml(n.getDefString());t.close("svg")}};t.renderToolbar=function(t,e){var n=e.getToolbar();if(n){t.openStart("div");t.class("sapGanttContainerTbl");t.openEnd();t.renderControl(n);t.close("div")}};t.renderStatusBar=function(t,e){var n=e.getStatusBar();if(n){t.openStart("div");t.class("sapGanttContainerStatusBar");t.openEnd();t.renderControl(n);t.close("div")}};t.renderGanttCharts=function(t,e){t.openStart("div",e.getId()+"-ganttContainerContent");if(e.getEnableStatusBar()){t.class("sapGanttContainerCntWithStatusBar")}else{t.class("sapGanttContainerCnt")}if(e.getShowSearchSidePanel()){t.class("sapGanttContainerCntWithSidePanel")}t.openEnd();t.renderControl(e._oSplitter);t.close("div")};t.renderSidePanel=function(t,e){var n=e.getSearchSidePanel();if(n){t.openStart("div",e.getId()+"-ganttSearchSidePanel");t.class("sapUiGanttSearchSidePanel");t.openEnd();t.renderControl(n);t.close("div")}};return t},true);
//# sourceMappingURL=GanttChartContainerRenderer.js.map
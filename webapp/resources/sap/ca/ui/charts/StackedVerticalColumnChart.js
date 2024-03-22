/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2014 SAP SE. All rights reserved
 */
jQuery.sap.declare("sap.ca.ui.charts.StackedVerticalColumnChart");jQuery.sap.require("sap.ca.ui.library");jQuery.sap.require("sap.ca.ui.charts.Chart");sap.ca.ui.charts.Chart.extend("sap.ca.ui.charts.StackedVerticalColumnChart",{metadata:{deprecated:true,library:"sap.ca.ui",properties:{type:{type:"string",group:"Designtime",defaultValue:"StackedColumn",deprecated:true},minTouchSize:{type:"sap.ui.core.CSSSize",group:"Dimension",defaultValue:"48px",deprecated:true},dataLabelFormat:{type:"any",group:"Appearance",defaultValue:[["##"]],deprecated:true}},aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content",deprecated:true}}}});jQuery.sap.require("sap.ca.ui.charts.ChartType");sap.ca.ui.charts.StackedVerticalColumnChart.prototype.setType=function(a){var e="";switch(a){case"viz/stacked_column":e=sap.ca.ui.charts.ChartType.StackedColumn;break;case"viz/100_stacked_column":e=sap.ca.ui.charts.ChartType.StackedColumn100;break;case"viz/dual_stacked_column":e=sap.ca.ui.charts.ChartType.DualStackedColumn;break;case"viz/100_dual_stacked_column":e=sap.ca.ui.charts.ChartType.DualStackedColumn100;break}this.setProperty("chartType",e);return this};sap.ca.ui.charts.StackedVerticalColumnChart.prototype.getType=function(){return this.getChartType()};sap.ca.ui.charts.StackedVerticalColumnChart.prototype.setMinTouchSize=function(a){this.setMinShapeSize(a);return this};sap.ca.ui.charts.StackedVerticalColumnChart.prototype.getMinTouchSize=function(){return this.getMinShapeSize()};sap.ca.ui.charts.StackedVerticalColumnChart.prototype.setDataLabelFormat=function(a){jQuery.sap.log.warning("This method has been deprectated. Please use dataLabelFormatter")};
//# sourceMappingURL=StackedVerticalColumnChart.js.map
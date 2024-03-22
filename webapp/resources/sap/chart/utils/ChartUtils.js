/*
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/chart/ChartType","sap/base/util/deepEqual"],function(e,t){"use strict";var a={chartTypes:[e.Bar,e.Column,e.Line,e.Combination,e.Pie,e.Donut,e.Scatter,e.Bubble,e.Heatmap,e.Bullet,e.VerticalBullet,e.StackedBar,e.StackedColumn,e.StackedCombination,e.HorizontalStackedCombination,e.DualBar,e.DualColumn,e.DualLine,e.DualStackedBar,e.DualStackedColumn,e.DualCombination,e.DualHorizontalCombination,e.DualStackedCombination,e.DualHorizontalStackedCombination,e.PercentageStackedBar,e.PercentageStackedColumn,e.PercentageDualStackedBar,e.PercentageDualStackedColumn,e.Waterfall,e.HorizontalWaterfall],pagingChartTypes:[e.Bar,e.Column,e.Line,e.Combination,e.Bullet,e.VerticalBullet,e.StackedBar,e.StackedColumn,e.StackedCombination,e.HorizontalStackedCombination,e.DualBar,e.DualColumn,e.DualLine,e.DualStackedBar,e.DualStackedColumn,e.DualCombination,e.DualHorizontalCombination,e.DualStackedCombination,e.DualHorizontalStackedCombination,e.PercentageStackedBar,e.PercentageStackedColumn,e.PercentageDualStackedBar,e.PercentageDualStackedColumn],timeChartTypes:["timeseries_line","timeseries_column","timeseries_bubble","timeseries_scatter","timeseries_combination","dual_timeseries_combination","timeseries_bullet","timeseries_stacked_column","timeseries_100_stacked_column","timeseries_waterfall"],oAdapteredChartTypes:{line:"timeseries_line",column:"timeseries_column",scatter:"timeseries_scatter",bubble:"timeseries_bubble",combination:"timeseries_combination",dual_combination:"dual_timeseries_combination",vertical_bullet:"timeseries_bullet",stacked_column:"timeseries_stacked_column","100_stacked_column":"timeseries_100_stacked_column",waterfall:"timeseries_waterfall"},nonSemanticPatternChartType:[e.Pie,e.Donut,e.PercentageDonut,e.Scatter,e.Bubble,e.Heatmap,e.Waterfall,e.HorizontalWaterfall,"timeseries_bubble","timeseries_scatter","timeseries_waterfall"],lineChartType:[e.Line,e.DualLine,"timeseries_line"]};return{CONFIG:a,makeNotifyParentProperty:function(e){return function(a,i){var n=this.mProperties[e];a=this.validateProperty(e,a);if(t(n,a)){return this}this.setProperty(e,a,i);if(i){return this}var r=this.getParent();if(r&&typeof r._invalidateBy==="function"){r._invalidateBy({source:this,property:e,oldValue:n,newValue:a})}return this}},isStackedLikeChart:function(e){return e.indexOf("stacked")>=0||e.indexOf("waterfall")>=0},isBulletChart:function(e){return e.indexOf("bullet")>=0}}});
//# sourceMappingURL=ChartUtils.js.map
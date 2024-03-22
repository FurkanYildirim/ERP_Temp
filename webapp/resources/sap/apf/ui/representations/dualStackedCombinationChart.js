/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2018 SAP SE. All rights reserved
*/
sap.ui.define(["sap/apf/core/constants","sap/apf/ui/utils/constants","sap/apf/ui/representations/BaseVizFrameChartRepresentation"],function(e,t,a){"use strict";var r=function(e,a){sap.apf.ui.representations.BaseVizFrameChartRepresentation.apply(this,[e,a]);this.type=t.representationTypes.DUAL_STACKED_COMBINATION_CHART;this.chartType=t.vizFrameChartTypes.DUAL_STACKED_COMBINATION};r.prototype=Object.create(sap.apf.ui.representations.BaseVizFrameChartRepresentation.prototype);r.prototype.getAxisFeedItemId=function(t){var a=e.representationMetadata.kind;var r;switch(t){case a.XAXIS:r=e.vizFrame.feedItemTypes.CATEGORYAXIS;break;case a.LEGEND:r=e.vizFrame.feedItemTypes.COLOR;break;case a.YAXIS:r=e.vizFrame.feedItemTypes.VALUEAXIS;break;case a.YAXIS2:r=e.vizFrame.feedItemTypes.VALUEAXIS2;break;default:break}return r};r.prototype.setVizPropsOfThumbnailForSpecificRepresentation=function(){if(!this.thumbnailChart){return}this.thumbnailChart.setVizProperties({valueAxis2:{visible:false,title:{visible:false}}})};sap.apf.ui.representations.dualStackedCombinationChart=r;return r},true);
//# sourceMappingURL=dualStackedCombinationChart.js.map
sap.ui.define(["sap/m/Text","sap/apf/core/constants","sap/ui/layout/HorizontalLayout","sap/apf/ui/representations/utils/vizFrameSelectionHandler","sap/apf/ui/utils/formatter","sap/apf/ui/representations/utils/chartDataSetHelper","sap/apf/ui/representations/utils/representationFilterHandler","sap/apf/ui/representations/utils/timeAxisDateConverter","sap/apf/utils/utils","sap/ui/thirdparty/jquery"],function(t,e,a,i,r,s,n,o,l,jQuery){"use strict";var h=0;function u(t,e){if(!e){return undefined}var a=t.getMetaData();if(!a){return null}var i=a.getPropertyMetadata(e);if(!i){return null}var r=i.label||i.name;return r!==undefined?r:null}var p=function(t,e){this.oMessageObject="";this.aDataResponse=undefined;this.dataset={};this.parameter=e;this.orderby=e.orderby;this.measures=e.measures;this.alternateRepresentation=e.alternateRepresentationType;this.requiredFilters=e.requiredFilters;this.oVizFrameSelectionHandler=new i.constructor(this.parameter,t);this.oTimeAxisDateConverter=new sap.apf.ui.representations.utils.TimeAxisDateConverter;this.oRepresentationFilterHandler=new sap.apf.ui.representations.utils.RepresentationFilterHandler(t,this.parameter,this.oTimeAxisDateConverter);this.chartInstance={};this.chartParam="";this.thumbnailChartParam="";this.oApi=t;this.axisType=sap.apf.ui.utils.CONSTANTS.axisTypes.AXIS;this.topN=e.top;this.apfId=++h};p.prototype={getParameter:function(){return this.parameter},setData:function(t,e){if(this.bIsAlternateView&&this.toggleInstance&&jQuery.isFunction(this.toggleInstance.setData)){this.toggleInstance.setData(t,e)}else{this.formatter=new sap.apf.ui.utils.formatter({getEventCallback:this.oApi.getEventCallback.bind(this.oApi),getTextNotHtmlEncoded:this.oApi.getTextNotHtmlEncoded,getExits:this.oApi.getExits()},e,t);this.oRepresentationFilterHandler.setMetadataAndDataResponse(e,t);this.oRepresentationFilterHandler.validateFiltersWithDataset();this.oChartDataSetHelper=new sap.apf.ui.representations.utils.ChartDataSetHelper(this.formatter,this.oTimeAxisDateConverter);this.oChartDataSetHelper.createFlattenDataSet(this.parameter,e,t,this.oApi);if(this.chartType===sap.apf.ui.utils.CONSTANTS.vizFrameChartTypes.SCATTERPLOT||this.chartType===sap.apf.ui.utils.CONSTANTS.vizFrameChartTypes.BUBBLE){this.oChartDataSetHelper.addUnusedDimensionsToChartContext(e,t)}this.aDataResponse=t||[];this.metadata=e;if(!this.metadata){this.oMessageObject=this.oApi.createMessageObject({code:"6004",aParameters:[this.oApi.getTextNotHtmlEncoded("step")]});this.oApi.putMessage(this.oMessageObject)}}},attachSelectionAndFormatValue:function(t){var e=this;if(!t){this.oMessageObject=this.oApi.createMessageObject({code:"6002",aParameters:["title",this.oApi.getTextNotHtmlEncoded("step")]});this.oApi.putMessage(this.oMessageObject)}if(!this.aDataResponse||this.aDataResponse.length===0){this.oMessageObject=this.oApi.createMessageObject({code:"6000",aParameters:[t]});this.oApi.putMessage(this.oMessageObject)}this.fnHandleSelection=this.handleSelection.bind(e);this.chart.attachSelectData(this.fnHandleSelection);this.fnHandleDeselection=this.handleDeselection.bind(e);this.chart.attachDeselectData(this.fnHandleDeselection)},getFormatStringForMeasure:function(t){var e=this.formatter.getFormatString(t);return e},getFormatStringForMeasureTooltip:function(t){var e=this.formatter.getFormatStringTooltip(t);return e},getSelectionFilterLabel:function(){var t=this.getParameter().requiredFilters[0];var e=this.getSelectedFilterPropertyLabel(t);if(this.getParameter().requiredFilterOptions&&this.getParameter().requiredFilterOptions.fieldDesc){e=this.oApi.getTextNotHtmlEncoded(this.getParameter().requiredFilterOptions.fieldDesc)}return e},getSelectedFilterPropertyLabel:function(t){return u(this,t)},getIsAllMeasureSameUnit:function(){var t=true;var e=this;var a=this.metadata.getPropertyMetadata(this.measures[0].fieldName).unit?this.metadata.getPropertyMetadata(this.metadata.getPropertyMetadata(this.measures[0].fieldName).unit).semantics:undefined;var i;this.measures.forEach(function(r,s){i=e.metadata.getPropertyMetadata(e.measures[s].fieldName).unit?e.metadata.getPropertyMetadata(e.metadata.getPropertyMetadata(r.fieldName).unit).semantics:undefined;if(t&&a!==undefined&&i&&a!==i){t=false}});return t},createThumbnailLayout:function(){if(!this.thumbnailChart){return}this.thumbnailLayout=(new a).addStyleClass("thumbnailLayout");this.thumbnailLayout.removeAllContent();if(this.aDataResponse!==undefined&&this.aDataResponse.length!==0){this.thumbnailChart.setModel(this.oModel);this.thumbnailLayout.addContent(this.thumbnailChart);this.thumbnailChart.removeStyleClass("thumbnailNoData")}else{var e=new t({text:this.oApi.getTextNotHtmlEncoded("noDataText")}).addStyleClass("noDataText");this.thumbnailLayout.addContent(e);this.thumbnailLayout.addContent(this.thumbnailChart);this.thumbnailChart.addStyleClass("thumbnailNoData")}},getAlternateRepresentation:function(){return this.alternateRepresentation},getMetaData:function(){return this.metadata},getData:function(){return this.aDataResponse},getRequestOptions:function(t){if(this.bIsAlternateView&&this.toggleInstance&&jQuery.isFunction(this.toggleInstance.getRequestOptions)){return this.toggleInstance.getRequestOptions(t,this.bIsAlternateView)}var e={paging:{},orderby:[]};if(this.orderby&&this.orderby.length){var a=this.orderby.map(function(t){return{property:t.property,ascending:t.ascending}});e.orderby=a}if(this.topN&&this.topN>0){e.paging.top=this.topN}return e},createDataset:function(){this.dataset=this.oChartDataSetHelper.getFlattenDataSet();this.oModel=this.oChartDataSetHelper.getModel()},drawSelectionOnMainChart:function(){var t=this.oRepresentationFilterHandler.getFilterValues();if(t.length>0){var e=this.oVizFrameSelectionHandler.getSelectionInfoFromFilter(t,this.aDataResponse);this.setSelectionOnMainChart(e)}},drawSelectionOnThumbnailChart:function(){var t=this.oRepresentationFilterHandler.getFilterValues();if(t.length>0){var e=this.oVizFrameSelectionHandler.getSelectionInfoFromFilter(t,this.aDataResponse);this.setSelectionOnThumbnailChart(e,false)}},handleSelection:function(t){this.manageSelectionsOnChart(t,false,this.parameter);this.chart.attachEvent("setFocusOnSelectedLinkEvent",this.chart.setFocusOnSelectLink)},handleDeselection:function(t){this.manageSelectionsOnChart(t,true,this.parameter);this.chart.attachEvent("setFocusOnSelectedLinkEvent",this.chart.setFocusOnSelectLink)},getSelections:function(){return this.oRepresentationFilterHandler.getDisplayInfoForFilters(this.metadata,this.oModel.getData().data)},getSortedSelections:function(){var t;var a=this.getSelections();if(!a||a.length===0){return[]}var i=this.getParameter();if(i.requiredFilterOptions&&i.requiredFilterOptions.labelDisplayOption){t=i.requiredFilterOptions.labelDisplayOption}var r=this.getParameter().requiredFilters[0];var s=this.metadata.getPropertyMetadata(r);switch(t){case e.representationMetadata.labelDisplayOptions.TEXT:return l.sortByProperty(a,"text",this.metadata.getPropertyMetadata(s.text));case e.representationMetadata.labelDisplayOptions.KEY_AND_TEXT:return l.sortByProperty(a,"text");default:return l.sortByProperty(a,"id",s)}},getSelectionCount:function(){return this.oRepresentationFilterHandler.getFilterValues().length},removeAllSelection:function(){this.setSelectionOnThumbnailChart([],false);this.setSelectionOnMainChart([],true)},getFilterMethodType:function(){return sap.apf.core.constants.filterMethodTypes.filter},getFilter:function(){this.filter=this.oRepresentationFilterHandler.createFilterFromSelectedValues();return this.filter},setFilter:function(t){this.filter=t},adoptSelection:function(t){if(t&&t.getFilter){var e=t.getFilter().getInternalFilter().getFilterTerms().map(function(t){return t.getValue()});this.oRepresentationFilterHandler.updateFilterFromSelection(e)}},serialize:function(){var t=this.parameter.orderby;if(this.toggleInstance){t=this.toggleInstance.orderby}return{oFilter:this.oRepresentationFilterHandler.getFilterValues(),bIsAlternateView:this.bIsAlternateView,orderby:t}},deserialize:function(t){this.oRepresentationFilterHandler.updateFilterFromSelection(t.oFilter);this.bIsAlternateView=t.bIsAlternateView;if(this.bIsAlternateView){this.toggleInstance=this.oApi.getUiApi().getStepContainer().getController().createToggleRepresentationInstance(this,t.orderby)}},getPrintContent:function(){},onChartSwitch:function(){},destroy:function(){this.dataset=null;if(this.formatter){this.formatter=null}if(this.oRepresentationFilterHandler){this.oRepresentationFilterHandler.aFilterValues=[];this.oRepresentationFilterHandler=null}if(this.chart){this.chart.detachSelectData(this.fnHandleSelection);this.fnHandleSelection=null;this.chart.detachDeselectData(this.fnHandleDeselection);this.fnHandleDeselection=null;this.chart.destroy();this.chart=null}if(this.thumbnailChart){this.thumbnailChart.destroy();this.thumbnailChart=null}if(this.thumbnailLayout){this.thumbnailLayout.removeAllContent()}}};return p},true);
//# sourceMappingURL=BaseUI5ChartRepresentation.js.map
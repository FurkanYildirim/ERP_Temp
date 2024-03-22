/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/base/Log","sap/sac/df/thirdparty/lodash","sap/ui/base/ManagedObject","sap/ui/core/Control","sap/zen/dsh/utils/BaseHandler","sap/zen/dsh/widgets/utils/info_error_handler","sap/zen/dsh/widgets/utils/info_error_lookup","sap/zen/dsh/widgets/utils/info_data_mapper","sap/zen/dsh/widgets/info_vizframe","sap/zen/dsh/widgets/utils/info_default_data","sap/zen/dsh/widgets/utils/info_chart_exception","sap/zen/dsh/widgets/utils/info_conditional_format_mapper","sap/zen/dsh/widgets/utils/sdk_data","sap/zen/dsh/widgets/utils/info_chart_locale","sap/zen/dsh/widgets/utils/info_binding_service","sap/zen/dsh/widgets/utils/info_legacy_binding_service","sap/zen/dsh/widgets/utils/info_property_builder","sap/zen/dsh/widgets/utils/info_dataseries_helper","sap/zen/dsh/widgets/utils/info_id_utils","sap/zen/dsh/widgets/utils/waterfall_data_factory","sap/zen/dsh/widgets/utils/hichert_data_factory"],function(jQuery,e,t,r,i,a,n,o,s,c,d,p,l,h,f,g,u,v,_,m,y,S){"use strict";var w="infochartupdate";var C=new f;var z=new m;var b=i.extend("com.sap.ip.bi.InfoChart",{metadata:{properties:{width:{type:"sap.ui.core.CSSSize"},height:{type:"sap.ui.core.CSSSize"},CHARTTYPE:{type:"string"},cvomdata:{type:"object"},cvombinding:{type:"object"},chartconfig:{type:"object"},data:{type:"object"},chartSelection:{type:"object"},showTotals:{type:"boolean"},showScaling:{type:"boolean"},enableConditionalFormatting:{type:"boolean"},plotAreaMeasureShapes:{type:"object"},enrichData:{type:"object"},useLegacyBindings:{type:"boolean"}},events:{chartError:{}}},setProperty:r.prototype.setProperty,init:function(e,t,r,i){var a=this;this._errorHandler=e||new n(this,new o(sap.zen.designmode,C),sap.zen.designmode);this._infoDataMapper=t||new s;this._conditionalFormatMapper=r||new l;this._infoBindingService=i||g;this._legacyBindingService=new u;sap.viz.api.env.Resource.path("sap.viz.api.env.Template.loadPaths",["../libs/resources/chart/templates"]);this.attachEvent("EventHandlerChange",undefined,function(e){D(a,e)});this._dataSeriesHelper=new _},initDesignStudio:function(){},beforeDesignStudioUpdate:function(){this._errorHandler.clearError();this._oldChartType=this.getCHARTTYPE()},afterDesignStudioUpdate:function(){},onAfterRendering:function(){var e=this;C.onLoad(function(){try{e._errorHandler.checkError();E(e)}catch(t){e._errorHandler.renderError(t)}})},renderer:function(e,t){if(t.oComponentProperties.content&&t.oComponentProperties.content.control){var r=t.oComponentProperties.content.control.chart_mode;if(r){sap.viz.api.env.globalSettings({treatAsMobile:r.toLowerCase()})}}e.write("<div");e.writeControlData(t);e.addStyle("width",t.getWidth());e.addStyle("height",t.getHeight());e.addClass("sapzeninfochart");e.writeStyles();e.writeClasses();e.write('data-chart-identifier="CLIENT_SIDE_INFO_CHART"');e.write(">");e.write("<div id='"+t.getId()+"_container' style='width: 100%; height: 100%; overflow:visible'></div>");e.write("</div>")},exit:function(){if(this._vizframe){delete this._vizframe}},getContextMenuAction:function(){e.error("boo")},getControlDiv:function(){return jQuery(document.getElementById(this.getId()))},getChartContainer:function(){return this.getControlDiv().children().first()},setEmptyBackground:function(){P(this,{type:"info/column",data:d.flatData(),bindings:d.bindings(),template:"empty_ghost"})},setData:function(e){var t=e?jQuery.extend(true,{},e):null;try{this.setProperty("data",t);if(!this.oControlProperties.DATA_SOURCE_ALIAS_REF){throw new p("control.nodatasource")}else if(!e){var r=this.oComponentProperties.content.control.chartReady&&this.oComponentProperties.content.control.chartReady===true;if(r===true){throw new p("mapper.nodata")}else{throw new p("control.waitForReady")}}}catch(e){this._errorHandler.setError(e)}},setCvombinding:A("cvombinding"),setCvomdata:A("cvomdata"),setChartconfig:A("chartconfig"),setPlotAreaMeasureShapes:A("plotAreaMeasureShapes"),setEnrichData:A("enrichData"),setChartSelection:function(e){if(e==="CLEAR"){this._vizframe.selection(e)}else if(e!==""){this._chartSelection=JSON.parse(e)}},setCHARTTYPE:function(e){var t=z.convertEnumToId(e);this.setProperty("CHARTTYPE",t)},setCharttype:function(e){this.setCHARTTYPE(e)},setShowScaling:function(e){this.setProperty("showScaling",e)},getDataSelected:function(){var e=new function(){var e={};this.addSelection=function(r,i){e[r]=t.union(e[r]||[],[i])};this.getSelections=function(){return e}};if(this._vizframe){var r=this._vizframe.selection();var i=this;t.forEach(r,function(r){var a=t.omit(r.data,function(e,t,r){return!Object.prototype.hasOwnProperty.call(r,t+".d")});var n=t.pairs(a);t.forEach(n,function(t){var r=t[0];var i=t[1];e.addSelection(r,i)});var o=t.omit(r.data,function(e,t,r){if(Object.prototype.hasOwnProperty.call(r,t+".d")){return true}return t.slice(-2)===".d"});var s=t.pairs(o);var c=s[0][0];var d=i.getData();var p=i._infoDataMapper.getMeasuresDimensionKey(d.dimensions,d.externalDimensions);e.addSelection(p,c)})}return JSON.stringify(e.getSelections())},getChartSelection:function(){return this._vizframe&&this._vizframe.selection()},exportToSVGString:function(e){var t=this._vizframe._vizframe;var r=t.size();t.size({auto:false,height:e.height,width:e.width});var i=this._vizframe._vizframe.__internal_reference_VizFrame__._viz._vizInstance.app.exportToSVGString(e);t.size(r);return i},getDataSourceName:function(){return this.oControlProperties.DATA_SOURCE_ALIAS_REF}});function A(e){return function(t){try{if(t){t=t.replace(/\\x/gi,"\\u00")}var r=t&&JSON.parse(t);this.setProperty(e,r||{})}catch(e){this._errorHandler.renderError(e)}}}function D(t,r){var i=r.mParameters||{};var a=i.type;var n=i.EventId;C.onLoad(function(){if(a==="listenerAttached"&&n===w){try{t.fireEvent(w,T(t))}catch(r){e.error(r);t._errorHandler.renderError(r)}}})}function E(t){var r=t.getControlDiv();var i=r.width();var a=r.height();r.contextmenu(function(e){e.preventDefault()});if(i*a===0){setTimeout(function(){E(t)},1);return}try{var n=T(t);P(t,n);t.fireEvent(w,n);t._infoBindingService.validateBindings(n.type,n.bindings)}catch(r){e.error(r);t._errorHandler.renderError(r)}}function P(t,r){try{var i=t.getChartContainer();if(t._vizframe){t._vizframe.destroy()}if(t.oControlProperties.chartconfig)t.oControlProperties.chartconfig=t.oControlProperties.chartconfig.replace(/\\x/gi,"\\u00");i.empty();t._vizframe=new c;t._vizframe.create(i,r,t);i.data("chartCtrl",t)}catch(r){e.error(r);t._errorHandler.renderError(r)}}function T(e){if(!e.oControlProperties.DATA_SOURCE_ALIAS_REF){throw new p("control.nodatasource")}var r=e.getCHARTTYPE();if(!sap.viz.api.metadata.Viz.get(r)){throw new p("control.invalidChartType")}var i=e.oControlProperties.chartReady&&e.oControlProperties.chartReady===true;if(i!==true){throw new p("control.waitForReady")}var a=e.getChartconfig()&&e.getChartconfig().properties||{};var n=!e.getShowTotals();var o;var s;var c;var d={binding:[],chartType:r};if(e.oControlProperties.cvombinding&&t.isString(e.oControlProperties.cvombinding)){d=JSON.parse(e.oControlProperties.cvombinding);if(t.isArray(d)){throw new p}}if(e.getCvomdata()&&!t.isEmpty(e.getCvomdata())){o=new sap.viz.api.data.FlatTableDataset(e.getCvomdata())}else{s=new h(e.getData());if(e.oControlProperties.useLegacyBindings){d.binding=e._legacyBindingService.createBindings(r,e.getData());s.keepDimensions(t.flatten(t.map(d.binding,"source")));c=s.toFlatData(n)}else{c=s.toFlatData(n)}var l=new v(a,r);if(S.isNeeded(r)&&e.getEnrichData()&&e.getEnrichData().hichert_chart){c=S.transformData(c,e.getEnrichData().hichert_chart,e)}else if(y.isNeeded(r)&&e.getEnrichData()&&e.getEnrichData().info_waterfall){c=y.transformData(c,e.getEnrichData().info_waterfall,e)}if(e.oControlProperties.showScaling){l.applyScalingFactor(s,c)}if(e.getUseLegacyBindings()){d.binding=e._legacyBindingService.createBindings(r,e.getData())}else{d.binding=e._infoBindingService.suggestBindings(r,c.metadata,d.binding,d.chartType)}o=e._infoDataMapper.map(c,n);if(e.getEnableConditionalFormatting()){l.setPropertyValue("plotArea.dataPointStyle",e._conditionalFormatMapper.createDataPointStyle(s))}l.setDefaultColorPalette().mapFormatStrings(s.getSDKFormatStrings());a=l.getProperties();if(e.oControlProperties.plotAreaMeasureShapes){var f=JSON.parse(e.oControlProperties.plotAreaMeasureShapes);var g=e._dataSeriesHelper.getProperties(f,r,d.binding);if(g[0].length!==0){a.plotArea=a.plotArea||{};a.plotArea.dataShape=a.plotArea.dataShape||{};a.plotArea.dataShape.primaryAxis=g[0]}if(g[1].length!==0){a.plotArea=a.plotArea||{};a.plotArea.dataShape=a.plotArea.dataShape||{};a.plotArea.dataShape.secondaryAxis=g[1]}}}return{type:r,data:o,bindings:d.binding,selection:e._chartSelection,properties:a}}return b});
//# sourceMappingURL=info_ctrl.js.map
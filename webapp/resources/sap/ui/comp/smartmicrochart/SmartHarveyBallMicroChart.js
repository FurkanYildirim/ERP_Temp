/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/library","sap/ui/core/Control","sap/suite/ui/microchart/library","sap/m/library","sap/ui/comp/smartmicrochart/SmartMicroChartBase","sap/suite/ui/microchart/HarveyBallMicroChart","sap/suite/ui/microchart/HarveyBallMicroChartItem","sap/base/Log","./SmartMicroChartRenderer"],function(t,a,i,e,o,r,n,s,h){"use strict";var l=o.extend("sap.ui.comp.smartmicrochart.SmartHarveyBallMicroChart",{metadata:{library:"sap.ui.comp",designtime:"sap/ui/comp/designtime/smartmicrochart/SmartHarveyBallMicroChart.designtime",properties:{enableAutoBinding:{type:"boolean",group:"Misc",defaultValue:false}},associations:{freeText:{type:"sap.m.Label",group:"Misc",multiple:false}}},renderer:h});l._CHART_TYPE=["Pie"];l.prototype.init=function(){this._bIsInitialized=false;this._bMetaModelLoadAttached=false;this.setProperty("chartType","Pie",true);this.setAggregation("_chart",new r,true)};l.prototype.onBeforeRendering=function(){var t=this.getAggregation("_chart");t.setSize(this.getSize(),true);t.setWidth(this.getWidth(),true);t.setHeight(this.getHeight(),true)};l.prototype._createAndBindInnerChart=function(){if(!(this._oDataPointAnnotations.Value&&this._oDataPointAnnotations.Value.Path)){s.error("Value DataPoint annotation missing! Cannot create the SmartHarveyBallMicroChart");return}var t=this.getAggregation("_chart"),a=new n({fraction:{path:this._oDataPointAnnotations.Value.Path,type:"sap.ui.model.odata.type.Decimal"}});var i=this._getLabelNumberFormatter.call(this,this._oDataPointAnnotations.Value.Path);a.bindProperty("fractionLabel",{path:this._oDataPointAnnotations.Value.Path,formatter:i.format.bind(i)});var e=this._getLabelNumberFormatter.call(this,this._oDataPointAnnotations.MaximumValue.Path);if(this._oDataPointAnnotations.MaximumValue&&this._oDataPointAnnotations.MaximumValue.Path){t.bindProperty("total",{path:this._oDataPointAnnotations.MaximumValue.Path,type:"sap.ui.model.odata.type.Decimal"});t.bindProperty("totalLabel",{path:this._oDataPointAnnotations.MaximumValue.Path,formatter:e.format.bind(e)})}if(this._getAnnotation("unitOfMeasure").Path){t.bindProperty("totalScale",{path:this._getAnnotation("unitOfMeasure").Path});a.bindProperty("fractionScale",{path:this._getAnnotation("unitOfMeasure").Path})}if(this._oDataPointAnnotations.Criticality&&this._oDataPointAnnotations.Criticality.Path){a.bindProperty("color",{path:this._oDataPointAnnotations.Criticality.Path,formatter:this._mapCriticalityTypeWithColor.bind(this)})}t.addItem(a);this._updateAssociations()};l.prototype._getSupportedChartTypes=function(){return l._CHART_TYPE};return l});
//# sourceMappingURL=SmartHarveyBallMicroChart.js.map
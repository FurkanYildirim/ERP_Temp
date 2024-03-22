/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/Element","sap/ui/comp/personalization/Util"],function(e,t){"use strict";var a=e.extend("sap.ui.comp.personalization.ColumnWrapper",{constructor:function(t,a){e.apply(this,arguments)},metadata:{library:"sap.ui.comp",properties:{label:{type:"string"},tooltip:{type:"string"},selected:{type:"boolean",defaultValue:false},aggregationRole:{type:"sap.ui.comp.personalization.AggregationRole"},role:{type:"string"},href:{type:"string",defaultValue:null},internalHref:{type:"string",defaultValue:null},target:{type:"string",defaultValue:null},press:{type:"object",defaultValue:null},sorted:{type:"boolean",defaultValue:false},sortOrder:{type:"string",defaultValue:"Ascending"},hierarchyLevel:{type:"int",defaultValue:0},description:{type:"string",defaultValue:null}},associations:{chart:{type:"sap.chart.Chart",multiple:false}}}});a.prototype.getVisible=function(){var e=this.getAssociation("chart");if(typeof e==="string"){e=sap.ui.getCore().byId(e)}var a=e.getVisibleDimensions().concat(e.getVisibleMeasures());var i=t.getColumnKey(this);return a.indexOf(i)>-1};return a});
//# sourceMappingURL=ColumnWrapper.js.map
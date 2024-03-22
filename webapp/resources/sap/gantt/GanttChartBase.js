/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/base/Log","sap/gantt/library","sap/ui/core/Control","./misc/Utility"],function(jQuery,e,t,i,a){"use strict";var o=i.extend("sap.gantt.GanttChartBase",{metadata:{abstract:true,library:"sap.gantt",properties:{width:{type:"sap.ui.core.CSSSize",defaultValue:"100%"},height:{type:"sap.ui.core.CSSSize",defaultValue:"100%"},enableCursorLine:{type:"boolean",defaultValue:true},enableNowLine:{type:"boolean",defaultValue:true},enableVerticalLine:{type:"boolean",defaultValue:true},enableAdhocLine:{type:"boolean",defaultValue:true},enableShapeTimeDisplay:{type:"boolean",defaultValue:false},timeZoomRate:{type:"float",defaultValue:1},mode:{type:"string",defaultValue:t.config.DEFAULT_MODE_KEY},selectionMode:{type:"sap.gantt.SelectionMode",defaultValue:t.SelectionMode.MultiWithKeyboard},shapeSelectionMode:{type:"sap.gantt.SelectionMode",defaultValue:t.SelectionMode.MultiWithKeyboard},selectionPanelSize:{type:"sap.ui.core.CSSSize",defaultValue:"30%"},hierarchyKey:{type:"string",defaultValue:t.config.DEFAULT_HIERARCHY_KEY},baseRowHeight:{type:"int",group:"Appearance",defaultValue:null},svgDefs:{type:"object",defaultValue:null},timeAxis:{type:"object",defaultValue:t.config.DEFAULT_TIME_AXIS},modes:{type:"object[]",defaultValue:t.config.DEFAULT_MODES},toolbarSchemes:{type:"object[]",defaultValue:t.config.DEFAULT_GANTTCHART_TOOLBAR_SCHEMES},hierarchies:{type:"object[]",defaultValue:t.config.DEFAULT_HIERARCHYS},objectTypes:{type:"object[]",defaultValue:t.config.DEFAULT_OBJECT_TYPES},chartSchemes:{type:"object[]",defaultValue:t.config.DEFAULT_CHART_SCHEMES},locale:{type:"object",defaultValue:t.config.DEFAULT_LOCALE_CET},shapeDataNames:{type:"sap.gantt.GenericArray",defaultValue:[]},shapes:{type:"object[]",defaultValue:[]},adhocLineLayer:{type:"string",defaultValue:t.AdhocLineLayer.Top},tableProperties:{type:"object",defaultValue:{}},ghostAlignment:{type:"string",defaultValue:t.dragdrop.GhostAlignment.None},nowLineInUTC:{type:"boolean",defaultValue:true}},aggregations:{rows:{type:"sap.ui.core.Control",multiple:true,singularName:"row",bindable:"bindable",visibility:"public"},relationships:{type:"sap.ui.core.Control",multiple:true,bindable:"bindable",visibility:"public"},calendarDef:{type:"sap.gantt.def.cal.CalendarDefs",multiple:false,bindable:"bindable",visibility:"public"},axisTimeStrategy:{type:"sap.gantt.axistime.AxisTimeStrategyBase",multiple:false,bindable:"bindable",visibility:"public"},adhocLines:{type:"sap.gantt.AdhocLine",multiple:true,singularName:"adhocLine",bindable:"bindable",visibility:"public"}},events:{ganttChartSwitchRequested:{parameters:{hierarchyKey:{type:"string"}}},splitterResize:{parameters:{id:{type:"string"},oldSizes:{type:"int[]"},newSizes:{type:"int[]"},zoomInfo:{type:"object"}}},horizontalScroll:{parameters:{scrollSteps:{type:"int"},startTime:{type:"string"},endTime:{type:"string"}}},verticalScroll:{parameters:{scrollSteps:{type:"int"}}},chartMouseOver:{parameters:{objectInfo:{type:"object"},leadingRowInfo:{type:"object"},timestamp:{type:"string"},svgId:{type:"string"},svgCoordinate:{type:"int[]"},effectingMode:{type:"string"},originEvent:{type:"object"}}},chartClick:{parameters:{objectInfo:{type:"object"},leadingRowInfo:{type:"object"},timestamp:{type:"string"},svgId:{type:"string"},svgCoordinate:{type:"int[]"},effectingMode:{type:"string"},originEvent:{type:"object"}}},chartDoubleClick:{parameters:{objectInfo:{type:"object"},leadingRowInfo:{type:"object"},timestamp:{type:"string"},svgId:{type:"string"},svgCoordinate:{type:"int[]"},effectingMode:{type:"string"},originEvent:{type:"object"}}},chartRightClick:{parameters:{objectInfo:{type:"object"},leadingRowInfo:{type:"object"},timestamp:{type:"string"},svgId:{type:"string"},svgCoordinate:{type:"int[]"},effectingMode:{type:"string"},originEvent:{type:"object"}}},chartDragEnter:{parameters:{originEvent:{type:"object"}}},chartDragLeave:{parameters:{originEvent:{type:"object"},draggingSource:{type:"object"}}},rowSelectionChange:{parameters:{originEvent:{type:"object"}}},relationshipSelectionChange:{parameters:{originEvent:{type:"object"}}},shapeSelectionChange:{parameters:{originEvent:{type:"object"}}},shapeDragEnd:{parameters:{originEvent:{type:"object"},sourceShapeData:{type:"object[]"},sourceSvgId:{type:"string"},targetData:{type:"object"},targetSvgId:{type:"string"}}},treeTableToggleEvent:{parameters:{rowIndex:{type:"int"},rowContext:{type:"object"},expanded:{type:"boolean"}}},shapeResizeEnd:{parameters:{shapeUid:{type:"string"},rowObject:{type:"object"},oldTime:{type:"string[]"},newTime:{type:"string[]"}}},shapeMouseEnter:{parameters:{shapeData:{type:"object"},pageX:{type:"int"},pageY:{type:"int"},originEvent:{type:"object"}}},shapeMouseLeave:{parameters:{shapeData:{type:"object"},originEvent:{type:"object"}}}}}});o.getMetadata().getAllAggregations()["rows"]._doesNotRequireFactory=true;o.getMetadata().getAllAggregations()["relationships"]._doesNotRequireFactory=true;o.prototype.init=function(){this._iBaseRowHeight=undefined;this.mDefaultTableProperties={rowHeight:33,threshold:100,firstVisibleRow:0,selectionMode:sap.ui.table.SelectionMode.MultiToggle}};o.prototype.handleExpandChartChange=function(e,t,i){};o.prototype.notifySourceChange=function(){};o.prototype._setLargeDataScrolling=function(e){};o.prototype._getConfiguredRowKeys=function(e){if(!e){e=this.getBindingInfo("rows")}var t;if(e&&e.parameters){t=e.parameters.gantt}this._configuredRowKeys={rowIdName:t&&t.rowIdName?t.rowIdName:"id",rowTypeName:t&&t.rowTypeName?t.rowTypeName:"type"};return this._configuredRowKeys};o.prototype.getRowIdName=function(){if(!this._configuredRowKeys){this._getConfiguredRowKeys()}return this._configuredRowKeys.rowIdName};o.prototype.getRowTypeName=function(){if(!this._configuredRowKeys){this._getConfiguredRowKeys()}return this._configuredRowKeys.rowTypeName};o.prototype.getRlsIdName=function(){if(!this._configuredRlsKeys){this._getConfiguredRlsKeys()}return this._configuredRlsKeys.rlsIdName};o.prototype._getConfiguredRlsKeys=function(){var e=this.getBindingInfo("relationships");var t;if(e&&e.parameters){t=e.parameters.gantt}this._configuredRlsKeys={rlsIdName:t&&t.rlsIdName?t.rlsIdName:"id"};return this._configuredRlsKeys};o.prototype.getDomSelectorById=function(e){var t=a.attributeEqualSelector("id",e?this.getId()+"-"+e:this.getId());return t};o.prototype.setTableProperties=function(t){var i=jQuery.extend({},this.getProperty("tableProperties"));Object.keys(t).forEach(function(a){if(this.mDefaultTableProperties.hasOwnProperty(a)){i[a]=t[a];var o="set"+a[0].toUpperCase()+a.slice(1);if(o==="setSelectionMode"){this._getSelectionHandler().setSelectionMode(t[a])}else{this._oTT[o](t[a])}}else{e.warning('The TreeTable property of "'+a+'" is not exposed by Gantt')}},this);this.setProperty("tableProperties",i,true);return this};o.prototype.getTableProperties=function(){var e=this.getProperty("tableProperties");Object.keys(e).forEach(function(t){if(t==="selectionMode"){var i=this._getSelectionHandler();e[t]=typeof i.getSelectionMode==="function"?i.getSelectionMode():i._getSelectionMode()}else{e[t]=this._oTT["get"+t[0].toUpperCase()+t.slice(1)]()}},this);return e};o.prototype._getSelectionHandler=function(){return this._oTT._oSelectionPlugin||this._oTT};return o},true);
//# sourceMappingURL=GanttChartBase.js.map
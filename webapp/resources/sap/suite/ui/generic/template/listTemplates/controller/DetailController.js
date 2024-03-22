sap.ui.define(["sap/ui/base/EventProvider","sap/ui/comp/personalization/Util","sap/ui/table/AnalyticalTable","sap/ui/core/mvc/Controller","sap/m/Table","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/table/RowSettings","sap/ui/model/FilterOperator","sap/ui/table/library","sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/base/util/isEmptyObject","sap/suite/ui/generic/template/AnalyticalListPage/util/FilterUtil"],function(e,t,i,a,r,n,s,o,l,h,g,f,u){"use strict";var p=new e;var c=new g("listTemplates.controller.DetailController").getLogger();var v=a.extend("sap.suite.ui.generic.template.listTemplates.controller.DetailController",{setState:function(e){this.oState=e;this._enableExpandByFilter=true;this._enableUpdateExpandLevelInfo=false;var t=this.oState.oController.getOwnerComponent();var i=this.oState.oController.getOwnerComponent().getModel("_templPriv");i.setProperty("/alp/autoHide",t.getAutoHide()?"filter":"highlight")},_onBindingDataReceived:function(){var e=this.oState.oSmartTable.getTable();if(e instanceof i){this._expandByFilter("bindingDataReceived")}},onSmartTableDataRequested:function(e){var t=e.getEntitySet();this.oState.oTemplateUtils.oServices.oApplication.preloadComponent(t)},attachTableChange:function(e,t,i){return p.attachEvent("TableChange",e,t,i)},detachTableChange:function(e,t){return p.detachEvent("TableChange",e,t)},isFilter:function(){var e=this.oState.oController.getOwnerComponent().getModel("_templPriv");return e.getProperty("/alp/autoHide")==="filter"},applyParamsToTable:function(){var e=this.oState.chartController,t=e.oChart,i=e._chartInfo.vizSelection;if(t&&i){var a=this.oState.oSmartTable.getModel("_tableHighlight"),r=e._chartInfo.chartSelection,n=e._chartInfo.drillStack.length>0;if(this.isFilter()||r&&r.count||a.getProperty("/highlightMode")==="eyeModeSwitch"||n){this.oState.oSmartTable.rebindTable(true)}else{this._applyCriticalityInfo(undefined,this.oState.oSmartTable);a.refresh(true)}}},_getValueFromCustomData:function(e,t){var i=e.getCustomData();for(var a=0;a<i.length;a++){if(i[a].mProperties.key===t){if(t==="lineItemCriticality"){return i[a].mProperties.value&&JSON.parse(i[a].mProperties.value)}else{return i[a].mProperties.value}}}return""},_applyCriticalityInfo:function(e,t){var i=t.getTable(),a=[],n=[],s=this,o=this._getValueFromCustomData(t,"lineItemCriticality");var l=this.oState.chartController&&this.oState.chartController.oChart;if(l){var h=this._getSelParamsFromChart(l);if(h&&h.length>0){h.forEach(function(e){if(e){var t=Object.keys(e);if(t){t.forEach(function(e){if(e!=="__metadata"&&n.indexOf(e)<0){a.push({path:e});n.push(e)}})}}})}this._setParamMap(l)}var g=o&&o.Path;if(g){a.push({path:g});if(e&&e.mParameters){e.mParameters.bindingParams.parameters.select.indexOf(g)===-1?e.mParameters.bindingParams.parameters.select+=","+g:""}}else if(o&&o.EnumMember){a.push({path:"EnumMember"})}s.isFilterMode=this.isFilter();s.isResponsive=i instanceof r;if(!s.isFilterMode&&t.getModel("_tableHighlight").getProperty("/highlightMode")!=="eyeModeSwitch"){a.push({path:"_tableHighlight>/highlightMode"})}if(a&&a.length>0){var u=function(){var e=s._paramMap,t=s.isFilterMode;var i=s.isResponsive?this:this._getRow();if(!i){return}if(i.getBindingContext()){var a;var r=this.getBindingContext();if(e&&!f(e)){for(var n in e){if(!r.getObject(n)){continue}for(var l=0;l<e[n].length;l++){if(e[n][l]===r.getObject(n)){a=true;break}else{a=false}}}}else{a=false}s._applyCSSHighlight(i,t,a);if(g){var h=r.getObject(g);switch(h&&h.toString()){case"0":return"None";case"1":return"Error";case"2":return"Warning";case"3":return"Success";default:return"None"}}else if(o&&o.EnumMember){switch(o.EnumMember){case"com.sap.vocabularies.UI.v1.CriticalityType/Neutral":return"None";case"com.sap.vocabularies.UI.v1.CriticalityType/Negative":return"Error";case"com.sap.vocabularies.UI.v1.CriticalityType/Critical":return"Warning";case"com.sap.vocabularies.UI.v1.CriticalityType/Positive":return"Success";default:return"None"}}else{return"None"}}else{s._applyCSSHighlight(i,t,false);return"None"}};if(s.isResponsive){this.oState.alp_ColumnListItem.bindProperty("highlight",{parts:a,formatter:u})}else{i.getRowSettingsTemplate().bindProperty("highlight",{parts:a,formatter:u});i.setRowSettingsTemplate(i.getRowSettingsTemplate())}}else{if(s.isResponsive){this.oState.alp_ColumnListItem.bindProperty("highlight",{path:"{_tableHighlight>/highlightMode}",formatter:function(){var e=s.isResponsive?this:this._getRow();if(!e){return}s._applyCSSHighlight(e,false,false);return"None"}})}else{i.getRowSettingsTemplate().bindProperty("highlight",{path:"{_tableHighlight>/highlightMode}",formatter:function(){return"None"}});i.setRowSettingsTemplate(i.getRowSettingsTemplate())}}},_applyCSSHighlight:function(e,t,i){if(i===undefined){return}var a=e.getDomRefs?e.getDomRefs(true):e.getDomRef();if(a&&a.row){a.row.toggleClass("sapSmartTemplatesAnalyticalListPageRowHighlighted",t&&i?t:i)}else{e.toggleStyleClass("sapSmartTemplatesAnalyticalListPageRowHighlighted",t&&i?t:i)}},_getBindingProperty:function(e,t){if(e.getProperty){return e.getProperty(t)}else{var i=e.oEntityType.property;for(var a=0;a<i.length;a++){if(i[a].name==t){return i[a]}}return null}},_getPageFilters:function(e){var t=this.oState.oSmartFilterbar.getFilters();for(var i=0;i<t.length;i++){if(t[i].aFilters!==undefined){var a=t[i].aFilters;for(var r=0;r<a.length;r++){var n=a[r];var s=n.sPath;if(!e.getProperty(s)){c.warning('Could not apply filter with name "'+s+'" as that field does not exist in the entity type');continue}n.sPath=s}}else{var n=t[i];var s=n.sPath;if(!e.getProperty(s)){c.warning('Could not apply filter with name "'+s+'" as that field does not exist in the entity type');continue}n.sPath=s}}return t},_applyParamsToTableAsHighlight:function(e){if(!this.oState){return}var t=this.oState.chartController.oChart;if(!t){return}var i=this._getSelParamsFromChart(t);var a=t.getVisibleDimensions();var r=this.oState.oSmartChart._lastSelected;var n=this.oState.oSmartTable.getTable();var s=this._getTableBinding(n);var o=this.oState.chartController._chartInfo.drillStack;if(!s){c.error("No table binding to apply the selection(s) to");return}var l=[];for(var h=0;h<i.length;h++){var g=i[h];var f={};for(var u in g){if(a.indexOf(u)==-1||!this._getBindingProperty(s,u)){continue}f[u]=g[u]}l.push(f)}o.forEach(function(e){var t=e.sPath,i={};i[t]=e.oValue1;l.push(i)});var f={};l.forEach(function(e){for(var t in e){if(!f.hasOwnProperty(t)){f[t]=[e[t]]}else{f[t].push(e[t])}}});this._paramListFiltered=l;this._lastSelected=r;this._paramMap=f;this._updateRows(e)},_setParamMap:function(e){var t=this._getSelParamsFromChart(e);var i=e.getVisibleDimensions();var a=this.oState.chartController._chartInfo.drillStack;var r={};if(!this.oState.oController.getOwnerComponent().getModel("_templPriv").getProperty("/alp/_ignoreChartSelections")){t.forEach(function(e){for(var t in e){if(i.indexOf(t)==-1){continue}if(!r.hasOwnProperty(t)){r[t]=[e[t]]}else{r[t].push(e[t])}}})}a.forEach(function(e){if(!r.hasOwnProperty(e.sPath)){r[e.sPath]=[e.oValue1]}else{r[e.sPath].indexOf(e.oValue1)===-1?r[e.sPath].push(e.oValue1):""}});this._paramMap=r},_expandByFilter:function(e){if(!this._enableExpandByFilter){return}var t=this.oState.oSmartTable.getTable();var i=this._getTableBinding(t);if(i&&this._lastBinding!=i){var a=this;i.attachDataReceived(this._onBindingDataReceived,this);i.attachEvent("change",function(e){if(a._expandingProgrammatically){return}var t=e.getParameter("reason");if(t=="expand"||t=="collapse"){a._inUserChartSelectMode=false}});this._lastBinding=i}if(e=="selection"||e=="bindingDataReceived"){this._firstVisibleRelevantEventTS=(new Date).getTime()}if(e=="selection"){this._inUserChartSelectMode=true}if(!this._inUserChartSelectMode){return}var r=this._getTableRows();for(var n=0;n<r.length;n++){var s=r[n];var o=s.getBindingContext();if(!o){continue}var l=t.getFirstVisibleRow()+n;if(this._isRowHighlighted(o.getObject())){if(t.isExpanded(l)){continue}if(!s._bHasChildren){continue}if(!i.findNode(l)){continue}this._expandingProgrammatically=true;t.expand(l);this._expandingProgrammatically=false}else{if(!t.isExpanded(l)){continue}if(!s._bHasChildren){continue}if(!i.findNode(l)){continue}this._expandingProgrammatically=true;t.collapse(l);this._expandingProgrammatically=false}}this._updateFirstVisibleRow(e)},_updateFirstVisibleRow:function(e){var t=this.oState.oSmartTable.getTable();var i=this._getTableBinding(t);var a=i.getTotalSize();if(a==0||(new Date).getTime()-this._firstVisibleRelevantEventTS>250){return}var t=this.oState.oSmartTable.getTable();if(e=="selection"&&(!this._paramListFiltered||this._paramListFiltered.length==0)){t.setFirstVisibleRow(0);return}var r=i.getContexts(0,a);for(var n=0;n<r.length;n++){var s=r[n].getObject();if(!this._isRowHighlighted(s)){continue}if(this._lastSelected&&!this._rowMatch(this._lastSelected,s)){continue}var o=t.getFirstVisibleRow();if(e=="selection"||this.isFilter()){t.setFirstVisibleRow(n)}else{if(n>o){t.setFirstVisibleRow(n)}}break}},_rowMatch:function(e,t){for(var i in e){if(i.indexOf("__")!=-1){continue}if(!t.hasOwnProperty(i)){continue}if(e[i]!=t[i]){return false}}return true},_updateExpandLevelInfo:function(e){if(!this._enableUpdateExpandLevelInfo){return false}var t=this.oState.oSmartTable.getTable();if(!t.getNumberOfExpandedLevels){return false}var i=t.getBinding();if(!i){return false}var a=e.length;var r=false;if(a>=i.aMaxAggregationLevel.length){r=true;a=i.aMaxAggregationLevel.length-1;this.wasAtMaxLevel=true}else{r=t.getNumberOfExpandedLevels()!=a||this.wasAtMaxLevel;this.wasAtMaxLevel=false}if(r){if(a>=0){t.setNumberOfExpandedLevels(a);t.bindRows(t.getBindingInfo("rows"))}var n=t.getGroupedColumns();t.fireGroup({column:n[0],groupedColumns:n,type:h.GroupEventType.group})}return r},_updateRows:function(e){var t=this.oState.oSmartTable.getTable();if(t instanceof i){this._expandByFilter(e)}},_getTableRows:function(){var e=this.oState.oSmartTable.getTable();if(e.getRows){return e.getRows()}else{return e.getItems()}},_isRowHighlighted:function(e){var t=this._paramMap;if(!t||f(t)){return false}var i=true;for(var a in t){if(!e.hasOwnProperty(a)){continue}if(t[a].indexOf(e[a])==-1){i=false}}return i},_getTableBinding:function(e){return e.getBinding()?e.getBinding():e.getBinding("items")},_applyChartSelectionOnTableAsFilter:function(e,t){var i=[];if(!t){return}var a=this._getSelParamsFromChart(t);if(a.length>0){var r=t.getVisibleDimensions();for(var n=0;n<a.length;n++){var o=a[n],h=[],g=true;for(var f in o){if(r.indexOf(f)==-1){c.warning('Could not apply filter with name "'+f+'" as that field does not exist in the entity type');continue}var p=false;var v=e.mParameters.bindingParams.filters;if(v.length>0){var v=v[0].aFilters?v[0].aFilters:v;for(var m=0;m<v.length;m++){var d=v[m].aFilters?v[m].aFilters:v;if(d.length==1){if(d[0].sPath===f&&d[0].sOperator==="EQ"&&d[0].oValue1===o[f]){p=true}}}}if(!p){h.push(new s({path:f,operator:l.EQ,value1:o[f]}));if(o[f]===""){var b=this.oState.oSmartFilterbar.getEntitySet();var S=this.oState.oController.getOwnerComponent().getModel();var _=u.isNullable(S,b,f);if(_){h.push(new s({path:f,operator:l.EQ,value1:null}));g=false}}}}if(h.length>0){i.push(new s(h,g))}}if(i.length>0){e.mParameters.bindingParams.filters.push(new s(i,false))}}},_latestUpdateRow:function(e){var t=this.isFilter();var i=this._getTableRows();var a=false;for(var r=0;r<i.length;r++){var n=i[r];if(!t){if(n.getBindingContext()){var s=n.getBindingContext().getObject();a=this._isRowHighlighted(s)}}var o=n.getDomRefs?n.getDomRefs(true):n.getDomRef();if(!o){continue}if(o.row){o.row.toggleClass("sapSmartTemplatesAnalyticalListPageRowHighlighted",t&&e?t:a)}else{$(o).toggleClass("sapSmartTemplatesAnalyticalListPageRowHighlighted",t&&e?t:a)}}},_getSelParamsFromChart:function(e){var t=[];t=e.getSelectedDataPoints().dataPoints;return this._getSelParamsFromDPList(t)},_getSelParamsFromDPList:function(e){if(!e){return[]}var t=[];for(var i=0;i<e.length;i++){var a=e[i];var r=a.context;if(!r){if(a.dimensions){t.push(a.dimensions)}continue}var n=r.getProperty(r.sPath);var s={};if(this._selectFilterByMeasure){for(var o=0;o<a.measures.length;o++){var l=a.measures[o];var h=n[l];s[l]=h}}else{for(var l in n){s[l]=n[l]}}t.push(s)}return t}});return v});
//# sourceMappingURL=DetailController.js.map
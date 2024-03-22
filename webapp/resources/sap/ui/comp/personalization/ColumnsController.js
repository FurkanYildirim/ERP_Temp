/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["./BaseController","sap/m/library","sap/ui/comp/library","./Util","sap/base/util/merge"],function(e,t,n,i,o){"use strict";var l=e.extend("sap.ui.comp.personalization.ColumnsController",{constructor:function(n,i){e.apply(this,arguments);this.setType(t.P13nPanelType.columns);this.setItemType(t.P13nPanelType.columns+"Items")},metadata:{properties:{triggerModelChangeOnColumnInvisible:{type:"boolean",group:"Misc",defaultValue:false}},events:{afterColumnsModelDataChange:{}}}});l.prototype.setTable=function(t){e.prototype.setTable.apply(this,arguments);if(this.getTableType()===n.personalization.TableType.ResponsiveTable){var i=t.findElements(false,function(e){return e.isA("sap.m.plugins.ColumnResizer")})[0];if(i){i.detachColumnResize(this._onColumnResize,this);i.attachColumnResize(this._onColumnResize,this)}}else if(this.getTableType()===n.personalization.TableType.AnalyticalTable||this.getTableType()===n.personalization.TableType.Table||this.getTableType()===n.personalization.TableType.TreeTable){t.detachColumnMove(this._onColumnMove,this);t.detachColumnVisibility(this._onColumnVisibility,this);t.detachColumnResize(this._onColumnResize,this);t.attachColumnMove(this._onColumnMove,this);t.attachColumnVisibility(this._onColumnVisibility,this);t.attachColumnResize(this._onColumnResize,this)}this._monkeyPatchTable(t)};l.prototype.getColumn2Json=function(e,t,n){return{columnKey:t,index:n,visible:e.getVisible(),width:e.getWidth?e.getWidth():undefined,total:e.getSummed?e.getSummed():undefined}};l.prototype.getAdditionalData2Json=function(e,t){e.columns.fixedColumnCount=t&&t.getFixedColumnCount?t.getFixedColumnCount():undefined;e.columns.showDetails=false};l.prototype.getColumn2JsonTransient=function(e,t,n,i){return{columnKey:t,text:n,tooltip:i!==n?i:undefined}};l.prototype.handleIgnore=function(e,t){e.columns.columnsItems[t].visible=false};l.prototype.syncJson2Table=function(e){var t=this.getTable();var i=this.getColumnMap();this.fireBeforePotentialTableChange();if(this.getTable()&&(this.getTableType()===n.personalization.TableType.AnalyticalTable||this.getTableType()===n.personalization.TableType.Table||this.getTableType()===n.personalization.TableType.TreeTable)){this._applyChangesToUiTableType(t,e,i)}else if(this.getTableType()===n.personalization.TableType.ResponsiveTable){this._applyChangesToMTableType(t,e,i)}this.fireAfterPotentialTableChange()};l.prototype.getDataSuiteFormat2Json=function(e){var t=this.createControlDataStructure();var n=function(e,n,o){var l=i.getIndexByKey("columnKey",e,t.columns.columnsItems);if(l<0){l=t.columns.columnsItems.length;t.columns.columnsItems.splice(l,0,{columnKey:e})}t.columns.columnsItems[l][n]=o};this.getControlDataInitial().columns.columnsItems.filter(function(e){return e.visible===true}).forEach(function(e){n(e.columnKey,"visible",false)});if(e.Visualizations&&e.Visualizations.length){var o=e.Visualizations.filter(function(e){return e.Type==="LineItem"});if(o.length){o[0].Content.forEach(function(e,t){n(e.Value,"visible",true);n(e.Value,"index",t)},this)}var l=e.Visualizations.filter(function(e){return e.Type==="ColumnWidth"});if(l.length){l[0].Content.forEach(function(e){n(e.Value,"width",e.Width)},this)}}if(e.Total&&e.Total.length){e.Total.forEach(function(e){n(e,"total",true)})}return t};l.prototype.getDataSuiteFormatSnapshot=function(e){var t=this.getUnionData(this.getControlDataInitial(),this.getControlData());if(!t.columns||!t.columns.columnsItems||!t.columns.columnsItems.length){return}var n=t.columns.columnsItems.filter(function(e){return!!e.total});if(n.length){e.Total=n.map(function(e){return e.columnKey})}var i=t.columns.columnsItems.filter(function(e){return!!e.visible});if(i.length){if(!e.Visualizations){e.Visualizations=[]}i.sort(this._sortByIndex);e.Visualizations.push({Type:"LineItem",Content:i.map(function(e){return{Value:e.columnKey,Label:undefined}})})}var o=t.columns.columnsItems.filter(function(e){return!!e.width});if(o.length){if(!e.Visualizations){e.Visualizations=[]}e.Visualizations.push({Type:"ColumnWidth",Content:o.map(function(e){return{Value:e.columnKey,Width:e.width}})})}};l.prototype._onColumnMove=function(e){var t=e.getParameter("newPos"),n=i.getColumnKey(e.getParameter("column")),o=this.getControlData(),l=o.columns.columnsItems,s,a,u;this._sortAdaptationData(l);s=l.findIndex(function(e){return e.index===t});a=i.getIndexByKey("columnKey",n,l);if(a<0||s<0||a>l.length-1||s>l.length-1){return}if(s<a){u=1}else if(s>a){u=-1}this.fireBeforePotentialTableChange();var r=l.splice(a,1);l.splice(s,0,r[0]);for(var m=s;m!=a;m=m+u){this._swapIndexes(l[m],l[m+u])}this.updateControlDataBaseFromJson(o);this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange()};l.prototype._onColumnVisibility=function(e){this.fireBeforePotentialTableChange();this._updateInternalModel(i.getColumnKey(e.getParameter("column")),"visible",e.getParameter("newVisible"));this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange()};l.prototype._onColumnTotal=function(e){this.fireBeforePotentialTableChange();this._updateInternalModel(i.getColumnKey(e.column),"total",e.isSummed);this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange()};l.prototype._onColumnResize=function(e){this.fireBeforePotentialTableChange();this._updateInternalModel(i.getColumnKey(e.getParameter("column")),"width",e.getParameter("width"));this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange()};l.prototype._onColumnFixedCount=function(e){this.fireBeforePotentialTableChange();var t=this.getControlData();this.getInternalModel().setProperty("/controlData/columns/fixedColumnCount",e);this.updateControlDataBaseFromJson(t);this.fireAfterPotentialTableChange();this.fireAfterColumnsModelDataChange()};l.prototype._updateInternalModel=function(e,t,n){if(!e||!t){return}var o=this.getControlData();var l=i.getIndexByKey("columnKey",e,o.columns.columnsItems);if(l<0){throw"No entry found in 'controlDataBase' for columnKey '"+e+"'"}this.getInternalModel().setProperty("/controlData/columns/columnsItems/"+l+"/"+t,n);this.updateControlDataBaseFromJson(o)};l.prototype.getPanel=function(e){var t=e&&e.visibleItemsThreshold?e.visibleItemsThreshold:-1;return new Promise(function(e){sap.ui.require(["sap/m/P13nColumnsPanel","sap/m/P13nItem","sap/m/P13nColumnsItem"],function(n,i,o){return e(new n({visibleItemsThreshold:t,items:{path:"$sapmP13nPanel>/transientData/columns/columnsItems",template:new i({columnKey:"{$sapmP13nPanel>columnKey}",text:"{$sapmP13nPanel>text}",tooltip:"{$sapmP13nPanel>tooltip}"})},columnsItems:{path:"$sapmP13nPanel>/controlDataReduce/columns/columnsItems",template:new o({columnKey:"{$sapmP13nPanel>columnKey}",index:"{$sapmP13nPanel>index}",visible:"{$sapmP13nPanel>visible}",width:"{$sapmP13nPanel>width}",total:"{$sapmP13nPanel>total}"})},beforeNavigationTo:this.setModelFunction(),changeColumnsItems:function(e){if(!e.getParameter("items")){return}var t=this.getControlDataReduce();t.columns.columnsItems=e.getParameter("items");this.setControlDataReduce2Model(t);this._enhanceForStableKeys(this.getControlDataInitial(),t);this.fireAfterPotentialModelChange({json:t})}.bind(this)}))}.bind(this))}.bind(this))};l.prototype._swapIndexes=function(e,t){var n=e.index;e.index=t.index;t.index=n};l.prototype._quickSortPartition=function(e,t,n){var i,o=t,l=e[n];for(i=t;i<=n-1;i++){if(e[i].index<l.index){if(i!==o){this._swapIndexes(e[o],e[i])}o++}}this._swapIndexes(e[o],l);return o};l.prototype._quickSort=function(e,t,n){var i,o,l,s=[t,n];while(s[s.length-1]>=0){l=s.pop();o=s.pop();i=this._quickSortPartition(e,o,l);if(i-1>o){s.push(o);s.push(i-1)}if(i+1<l){s.push(i+1);s.push(l)}}};l.prototype._sortIndexesByOrder=function(e){var t=e.findIndex(function(e){return!Number.isInteger(e.index)}),n=t===-1?e.length-1:t-1;if(n>0){this._quickSort(e,0,n)}};l.prototype.retrieveAdaptationUI=function(e){return new Promise(function(e){sap.ui.require(["sap/m/p13n/SelectionPanel"],function(t){var n=this.getAdaptationData();var i=new t({showHeader:true,enableCount:true,fieldColumn:sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc").getText("fieldsui.COLUMNS")});i.setP13nData(n);i._oListControl.setMultiSelectMode("Default");this.oPanel=i;var o;i.attachChange(function(e){o=e.getSource().getP13nData().map(function(e,t){var i={columnKey:e.name,visible:e.visible,width:e.width,total:e.total};i.index=n[t].position;return i});this._sortAdaptationData(o);this._sortIndexesByOrder(o);var t=this.getControlDataReduce();t.columns.columnsItems=o;this.setControlDataReduce2Model(t);this.fireAfterPotentialModelChange({json:this._enhanceForStableKeys(this.getControlDataInitial(),t)})}.bind(this));e(i)}.bind(this))}.bind(this))};l.prototype._transformAdaptationData=function(t,n){var i=e.prototype._transformAdaptationData.apply(this,arguments);i.visible=t.visible;i.position=t.index;i.width=t.width;i.total=t.total;return i};l.prototype._sortByIndex=function(e,t){if(e.index!==undefined&&t.index===undefined){return-1}if(t.index!==undefined&&e.index===undefined){return 1}if(e.index<t.index){return-1}if(e.index>t.index){return 1}return 0};l.prototype._applyChangesToUiTableType=function(e,t,n){var i=null;var o={};var l=this;var s=function(e,t){e.forEach(function(e){o[e.columnKey]=e});e.sort(l._sortByIndex);var n=e.map(function(e){return e.columnKey});t.forEach(function(e,t){if(n.indexOf(e)<0){n.splice(t,0,e)}});return n};var a=function(e,t){var n=o[e];if(n&&n.visible!==undefined&&t.getVisible()!==n.visible){t.setVisible(n.visible,true)}};var u=function(t,n,i){var o=e.indexOfColumn(i);var l=t;if(l!==undefined&&o!==l){if(o>-1){e.removeColumn(i,true)}e.insertColumn(i,l,true)}};var r=function(e,t){var n=o[e];if(n&&n.width!==undefined&&t.getWidth()!==n.width){t.setWidth(n.width,true)}};var m=function(e,t){var n=o[e];if(n&&n.total!==undefined&&t.getSummed&&t.getSummed()!==n.total){t.setSummed(n.total,true)}};if(t.columns.columnsItems.length){var c=s(t.columns.columnsItems,this.getColumnKeys());c.forEach(function(e,t){i=n[e];if(i){a(e,i);u(t,e,i);r(e,i);m(e,i)}})}var f=t.columns.fixedColumnCount||0;if(e.getFixedColumnCount&&e.getFixedColumnCount()!==f){e.setFixedColumnCount(f,true)}};l.prototype._applyChangesToMTableType=function(e,t,n){var i=false;var o=function(e,t){var n=e.index;if(n!==undefined){t.setOrder(n,true);i=true}};var l=function(e,t){if(e.visible!==undefined&&t.getVisible()!==e.visible){t.setVisible(e.visible,true);i=true}};var s=function(e,t){if(e.width!==undefined&&t.getWidth()!==e.width){t.setWidth(e.width)}};if(t.columns.columnsItems.length){t.columns.columnsItems.sort(function(e,t){if(e.index<t.index){return-1}if(e.index>t.index){return 1}return 0});t.columns.columnsItems.forEach(function(e){var t=n[e.columnKey];if(t){o(e,t);l(e,t);s(e,t)}},this)}if(i){e.invalidate()}};l.prototype.getChangeType=function(e,t){var i=this.getChangeData(e,t);var o=this.getTableType()===n.personalization.TableType.AnalyticalTable||this.getTriggerModelChangeOnColumnInvisible();if(i){var l=n.personalization.ChangeType.TableChanged,s=i.columns.showDetails;i.columns.columnsItems.some(function(e){if(e.visible||e.visible===false&&o){l=n.personalization.ChangeType.ModelChanged;return true}if(e.total===false||e.total===true){l=n.personalization.ChangeType.ModelChanged;return true}});if(s&&s!==t.columns.showDetails){l=n.personalization.ChangeType.ModelChanged}return l}return n.personalization.ChangeType.Unchanged};l.prototype.getChangeData=function(e,t){if(!t||!t.columns||!t.columns.columnsItems){return null}var n={columns:i.copy(e.columns)},o=e.columns.showDetails===t.columns.showDetails,l=true;l=e.columns.fixedColumnCount===t.columns.fixedColumnCount;e.columns.columnsItems.some(function(e){var n=i.getArrayElementByKey("columnKey",e.columnKey,t.columns.columnsItems);if(!i.semanticEqual(e,n)){l=false;return true}});l=l&&o;if(l){return null}var s=[];n.columns.columnsItems.forEach(function(e,n){var o=i.getArrayElementByKey("columnKey",e.columnKey,t.columns.columnsItems);if(i.semanticEqual(e,o)){s.push(e);return}for(var l in e){if(l==="columnKey"||!o){if(o&&o[l]===undefined){delete e[l]}else{continue}}if(e[l]===o[l]){delete e[l]}}if(Object.keys(e).length<2){s.push(e)}});s.forEach(function(e){var t=i.getIndexByKey("columnKey",e.columnKey,n.columns.columnsItems);n.columns.columnsItems.splice(t,1)});if(n.columns.fixedColumnCount===0){delete n.columns.fixedColumnCount}if(o){delete n.columns.showDetails}return n};l.prototype._sortArrayByPropertyName=function(e,t,n){var i=[];if(n===null||n===undefined){n=false}if(e&&e.length>0&&t!==undefined&&t!==null&&t!==""){if(n){i=o([],e)}else{i=e}i.sort(function(e,n){var i=e[t];var o=n[t];if(i<o||i!==undefined&&o===undefined){return-1}if(i>o||i===undefined&&o!==undefined){return 1}return 0})}return i};l.prototype.getUnionData=function(e,t){if(!t||!t.columns||!t.columns.columnsItems){return i.copy(e)}var n=i.copy(t);Object.keys(e.columns).forEach(function(t){if(Array.isArray(e.columns[t])){e.columns[t].forEach(function(e){var o=i.getArrayElementByKey("columnKey",e.columnKey,n.columns[t]);if(!o){n.columns[t].push(e);return}if(o.visible===undefined&&e.visible!==undefined){o.visible=e.visible}if(o.width===undefined&&e.width!==undefined){o.width=e.width}if(o.total===undefined&&e.total!==undefined){o.total=e.total}if(o.index===undefined&&e.index!==undefined){o.index=e.index}});return}if(n.columns[t]===undefined&&e.columns[t]!==undefined){n.columns[t]=e.columns[t]}},this);return n};l.prototype._enhanceForStableKeys=function(e,t){if(this.getStableColumnKeys().length>0&&this._checkFillRequired(e,t)){var n=this._getFilledArray(e,t);t.columns.columnsItems=n}return t};l.prototype._checkFillRequired=function(e,t){var n=t.columns.columnsItems.reduce(function(e,t){e[t.columnKey]=t;return e},{});var i=e.columns.columnsItems.some(function(e){return!n[e.columnKey]});return i};l.prototype._getFilledArray=function(e,t){var n=[];var i=e.columns.columnsItems.reduce(function(e,t){e[t.columnKey]=t;return e},{});for(var o=0;o<t.columns.columnsItems.length;o++){var l=t.columns.columnsItems[o];if(i[l.columnKey]){var s=l.index;i[l.columnKey]=l;i[l.columnKey].index=s}}Object.keys(i).forEach(function(e){n.push(i[e])});return n};l.prototype.fixConflictWithIgnore=function(e,t){if(!e||!e.columns||!e.columns.columnsItems||!t||!t.columns||!t.columns.columnsItems||!t.columns.columnsItems.length){return e}this._sortArrayByPropertyName(e.columns.columnsItems,"index");var n=false;t.columns.columnsItems.forEach(function(t){var o=i.getIndexByKey("columnKey",t.columnKey,e.columns.columnsItems);if(o<0||e.columns.columnsItems[o].index===undefined){return}if(o+1<=e.columns.columnsItems.length-1&&e.columns.columnsItems[o+1].index===e.columns.columnsItems[o].index||o-1>=0&&e.columns.columnsItems[o-1].index===e.columns.columnsItems[o].index){n=true}if(o+1<=e.columns.columnsItems.length-1&&e.columns.columnsItems[o+1].index===e.columns.columnsItems[o].index){var l=e.columns.columnsItems.splice(o,1);e.columns.columnsItems.splice(o+1,0,l[0])}});if(n){var o=-1;e.columns.columnsItems.forEach(function(e){if(e.index!==undefined){e.index=++o}})}};l.prototype.isColumnSelected=function(e,t){var n=i.getIndexByKey("columnKey",t,e.columnsItems);return n>-1?e.columnsItems[n].visible:false};l.prototype._monkeyPatchTable=function(e){if(this.getTableType()!==n.personalization.TableType.AnalyticalTable&&this.getTableType()!==n.personalization.TableType.Table&&this.getTableType()!==n.personalization.TableType.TreeTable){return}var t=this;var i=e.setFixedColumnCount.bind(e);var o=function(e,n){t._onColumnFixedCount(e);i(e,n)};if(e.setFixedColumnCount.toString()===o.toString()){return}e.setFixedColumnCount=o};l.prototype._updateInternalModelShowHide=function(e){var t=this.getControlData();this.getInternalModel().setProperty("/controlData/columns/showDetails/",e);this.updateControlDataBaseFromJson(t);this.fireAfterColumnsModelDataChange()};l.prototype.exit=function(){e.prototype.exit.apply(this,arguments);var t=this.getTable();if(this.getTable()&&(this.getTableType()===n.personalization.TableType.AnalyticalTable||this.getTableType()===n.personalization.TableType.Table||this.getTableType()===n.personalization.TableType.TreeTable)){t.detachColumnMove(this._onColumnMove,this);t.detachColumnVisibility(this._onColumnVisibility,this);t.detachColumnResize(this._onColumnResize,this)}};return l});
//# sourceMappingURL=ColumnsController.js.map
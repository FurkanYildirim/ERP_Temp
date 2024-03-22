/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./_GroupingUtils","./_ColumnUtils","./_MenuUtils","./_BindingUtils","./_HookUtils","../library","sap/ui/base/Object","sap/ui/core/ResizeHandler","sap/ui/core/library","sap/ui/core/theming/Parameters","sap/ui/model/ChangeReason","sap/ui/thirdparty/jquery","sap/base/util/restricted/_throttle"],function(e,t,n,i,a,o,r,l,s,u,d,jQuery,c){"use strict";var f=o.SelectionBehavior;var g=o.SelectionMode;var p=s.MessageType;var C;var v=null;var R={DATACELL:1<<1,COLUMNHEADER:1<<2,ROWHEADER:1<<3,ROWACTION:1<<4,COLUMNROWHEADER:1<<5,PSEUDO:1<<6};R.ANYCONTENTCELL=R.ROWHEADER|R.DATACELL|R.ROWACTION;R.ANYCOLUMNHEADER=R.COLUMNHEADER|R.COLUMNROWHEADER;R.ANYROWHEADER=R.ROWHEADER|R.COLUMNROWHEADER;R.ANY=R.ANYCONTENTCELL|R.ANYCOLUMNHEADER;var m={sapUiSizeCozy:48,sapUiSizeCompact:32,sapUiSizeCondensed:24,undefined:32};var _=1;var w=1;var S={sapUiSizeCozy:m.sapUiSizeCozy+w,sapUiSizeCompact:m.sapUiSizeCompact+w,sapUiSizeCondensed:m.sapUiSizeCondensed+w,undefined:m.undefined+w};var I={navigationIcon:"navigation-right-arrow",deleteIcon:"sys-cancel",clearSelectionIcon:"clear-all",navIndicatorWidth:3};var h={Render:"Render",VerticalScroll:"VerticalScroll",FirstVisibleRowChange:"FirstVisibleRowChange",Unbind:"Unbind",Animation:"Animation",Resize:"Resize",Zoom:"Zoom",Unknown:"Unknown"};for(var b in d){h[b]=d[b]}var E=":sapTabbable, .sapUiTableTreeIcon:not(.sapUiTableTreeIconLeaf)";var T={Grouping:e,Column:t,Menu:n,Binding:i,Hook:a,CELLTYPE:R,BaseSize:m,BaseBorderWidth:_,RowHorizontalFrameSize:w,DefaultRowHeight:S,RowsUpdateReason:h,INTERACTIVE_ELEMENT_SELECTORS:E,ThemeParameters:I,hasRowHeader:function(t){return t.getSelectionMode()!==g.None&&t.getSelectionBehavior()!==f.RowOnly||e.isInGroupMode(t)},hasSelectAll:function(e){var t=e?e.getSelectionMode():g.None;return t===g.MultiToggle&&e.getEnableSelectAll()},hasRowHighlights:function(e){if(!e){return false}var t=e.getRowSettingsTemplate();if(!t){return false}var n=t.getHighlight();return t.isBound("highlight")||n!=null&&n!==p.None},hasRowNavigationIndicators:function(e){if(!e){return false}var t=e.getRowSettingsTemplate();if(!t){return false}var n=t.getNavigated();return t.isBound("navigated")||n},hasRowActions:function(e){var t=e?e.getRowActionTemplate():null;return t!=null&&(t.isBound("visible")||t.getVisible())&&e.getRowActionCount()>0},isRowSelectionAllowed:function(e){return e.getSelectionMode()!==g.None&&(e.getSelectionBehavior()===f.Row||e.getSelectionBehavior()===f.RowOnly)},isRowSelectorSelectionAllowed:function(e){return e.getSelectionMode()!==g.None&&T.hasRowHeader(e)},isNoDataVisible:function(e){return e.getShowNoData()&&!e._getRowMode().isNoDataDisabled()&&!T.hasData(e)||T.getVisibleColumnCount(e)===0},hasData:function(e){return e._getTotalRowCount()>0},isBusyIndicatorVisible:function(e){if(!e||!e.getDomRef()){return false}return e.getDomRef().querySelector('[id="'+e.getId()+'-sapUiTableGridCnt"] > .sapUiLocalBusyIndicator')!=null},isA:function(e,t){return r.isA(e,t)},toggleRowSelection:function(e,t,n,i){var a;if(T.isA(t,"sap.ui.table.Row")){a=t}else if(typeof t==="number"){a=e.getRows()[t]}else{var o=jQuery(t);var r=T.getCellInfo(o[0]);var l=T.isRowSelectionAllowed(e);if(!T.Grouping.isInGroupHeaderRow(o[0])&&(r.isOfType(T.CELLTYPE.DATACELL|T.CELLTYPE.ROWACTION)&&l||r.isOfType(T.CELLTYPE.ROWHEADER)&&T.isRowSelectorSelectionAllowed(e))){a=e.getRows()[r.rowIndex]}}if(!a||a.isEmpty()){return}e._iSourceRowIndex=a.getIndex();if(i){i(a)}else{var s=e._getSelectionPlugin();s.setSelected(a,typeof n==="boolean"?n:!s.isSelected(a))}delete e._iSourceRowIndex},getNoContentMessage:function(e){if(T.getVisibleColumnCount(e)>0){return e.getNoData()||T.getResourceText("TBL_NO_DATA")}else{return e.getAggregation("_noColumnsMessage")||T.getResourceText("TBL_NO_COLUMNS")}},getVisibleColumnCount:function(e){return e._getVisibleColumns().length},getHeaderRowCount:function(e){if(e._iHeaderRowCount===undefined){if(!e.getColumnHeaderVisible()){e._iHeaderRowCount=0}else{var t=1;var n=e.getColumns();for(var i=0;i<n.length;i++){if(n[i].shouldRender()){t=Math.max(t,n[i].getMultiLabels().length)}}e._iHeaderRowCount=t}}return e._iHeaderRowCount},isVariableRowHeightEnabled:function(e){var t=e._getRowCounts();return e&&e._bVariableRowHeightEnabled&&!t.fixedTop&&!t.fixedBottom},getNonEmptyRowCount:function(e){return Math.min(e._getRowCounts().count,e._getTotalRowCount())},getFocusedItemInfo:function(e){var t=e._getItemNavigation();if(!t){return null}return{cell:t.getFocusedIndex(),columnCount:t.iColumns,cellInRow:t.getFocusedIndex()%t.iColumns,row:Math.floor(t.getFocusedIndex()/t.iColumns),cellCount:t.getItemDomRefs().length,domRef:t.getFocusedDomRef()}},getRowIndexOfFocusedCell:function(e){var t=T.getFocusedItemInfo(e);return t.row-T.getHeaderRowCount(e)},isFixedColumn:function(e,t){return t<e.getComputedFixedColumnCount()},hasFixedColumns:function(e){return e.getComputedFixedColumnCount()>0},focusItem:function(e,t,n){var i=e._getItemNavigation();if(i){i.focusItem(t,n)}},getCellInfo:function(e){var t;var n=jQuery(e);var i;var a;var o;var r;var l;t={type:0,cell:null,rowIndex:null,columnIndex:null,columnSpan:null};if(n.hasClass("sapUiTableDataCell")){i=n.attr("data-sap-ui-colid");a=sap.ui.getCore().byId(i);t.type=T.CELLTYPE.DATACELL;t.rowIndex=parseInt(n.parent().attr("data-sap-ui-rowindex"));t.columnIndex=a.getIndex();t.columnSpan=1}else if(n.hasClass("sapUiTableHeaderDataCell")){o=/_([\d]+)/;i=n.attr("id");r=o.exec(i);l=r&&r[1]!=null?parseInt(r[1]):0;t.type=T.CELLTYPE.COLUMNHEADER;t.rowIndex=l;t.columnIndex=parseInt(n.attr("data-sap-ui-colindex"));t.columnSpan=parseInt(n.attr("colspan")||1)}else if(n.hasClass("sapUiTableRowSelectionCell")){t.type=T.CELLTYPE.ROWHEADER;t.rowIndex=parseInt(n.parent().attr("data-sap-ui-rowindex"));t.columnIndex=-1;t.columnSpan=1}else if(n.hasClass("sapUiTableRowActionCell")){t.type=T.CELLTYPE.ROWACTION;t.rowIndex=parseInt(n.parent().attr("data-sap-ui-rowindex"));t.columnIndex=-2;t.columnSpan=1}else if(n.hasClass("sapUiTableRowSelectionHeaderCell")){t.type=T.CELLTYPE.COLUMNROWHEADER;t.columnIndex=-1;t.columnSpan=1}else if(n.hasClass("sapUiTablePseudoCell")){i=n.attr("data-sap-ui-colid");a=sap.ui.getCore().byId(i);t.type=T.CELLTYPE.PSEUDO;t.rowIndex=-1;t.columnIndex=a?a.getIndex():-1;t.columnSpan=1}if(t.type!==0){t.cell=n}t.isOfType=function(e){if(e==null){return false}return(this.type&e)>0};return t},getRowColCell:function(e,t,n,i){var a=e.getRows()[t]||null;var o=i?e.getColumns():e._getVisibleColumns();var r=o[n]||null;var l;var s=null;if(a&&r){if(!l){var u=r.getMetadata();while(u.getName()!=="sap.ui.table.Column"){u=u.getParent()}l=u.getClass()}s=a.getCells().find(function(e){return r===l.ofCell(e)})||null}return{row:a,column:r,cell:s}},getCell:function(e,t,n){n=n===true;if(!e||!t){return null}var i=jQuery(t);var a=e.getDomRef();var o=".sapUiTableCell";if(!n){o+=":not(.sapUiTablePseudoCell)"}var r=i.closest(o,a);if(r.length>0){return r}return null},getParentCell:function(e,t,n){n=n===true;var i=jQuery(t);var a=T.getCell(e,t,n);if(!a||a[0]===i[0]){return null}else{return a}},registerResizeHandler:function(e,t,n,i,a){i=i==null?"":i;a=a===true;if(!e||typeof t!=="string"||typeof n!=="function"){return undefined}var o=e.getDomRef(i);T.deregisterResizeHandler(e,t);if(!e._mResizeHandlerIds){e._mResizeHandlerIds={}}if(a&&o){o=o.parentNode}if(o){e._mResizeHandlerIds[t]=l.register(o,n)}return e._mResizeHandlerIds[t]},deregisterResizeHandler:function(e,t){var n=[];if(!e._mResizeHandlerIds){return}if(typeof t==="string"){n.push(t)}else if(t===undefined){for(var i in e._mResizeHandlerIds){if(typeof i=="string"&&e._mResizeHandlerIds.hasOwnProperty(i)){n.push(i)}}}else if(Array.isArray(t)){n=t}for(var a=0;a<n.length;a++){var o=n[a];if(e._mResizeHandlerIds[o]){l.deregister(e._mResizeHandlerIds[o]);e._mResizeHandlerIds[o]=undefined}}},isFirstScrollableRow:function(e,t){if(isNaN(t)){var n=jQuery(t);t=parseInt(n.add(n.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"))}return t==e._getRowCounts().fixedTop},isLastScrollableRow:function(e,t){if(isNaN(t)){var n=jQuery(t);t=parseInt(n.add(n.parent()).filter("[data-sap-ui-rowindex]").attr("data-sap-ui-rowindex"))}var i=e._getRowCounts();return t==i.count-i.fixedBottom-1},getContentDensity:function(e){var t;var n=["sapUiSizeCondensed","sapUiSizeCompact","sapUiSizeCozy"];var i=function(e,t){if(!t[e]){return}for(var i=0;i<n.length;i++){if(t[e](n[i])){return n[i]}}};var a=e.$();if(a.length>0){t=i("hasClass",a)}else{t=i("hasStyleClass",e)}if(t){return t}var o=null;var r=e.getParent();if(r){do{t=i("hasStyleClass",r);if(t){return t}if(r.getDomRef){o=r.getDomRef()}else if(r.getRootNode){o=r.getRootNode()}if(!o&&r.getParent){r=r.getParent()}else{r=null}}while(r&&!o)}a=jQuery(o||document.body);t=i("hasClass",a.closest("."+n.join(",.")));return t},isVariableWidth:function(e){return!e||e=="auto"||e.toString().match(/%$/)},getFirstFixedBottomRowIndex:function(e){var t=e._getRowCounts();if(!e.getBinding()||t.fixedBottom===0){return-1}var n=-1;var i=e.getFirstVisibleRow();var a=e._getTotalRowCount();if(a>=t.count){n=t.count-t.fixedBottom}else{var o=a-t.fixedBottom-i;if(o>=0&&i+o<a){n=o}}return n},getResourceBundle:function(e){e=jQuery.extend({async:false,reload:false},e);if(C&&e.reload!==true){if(e.async===true){return Promise.resolve(C)}else{return C}}var t=sap.ui.getCore().getLibraryResourceBundle("sap.ui.table",e.async===true);if(t instanceof Promise){t=t.then(function(e){C=e;return C})}else{C=t}return t},getResourceText:function(e,t){return C?C.getText(e,t):""},dynamicCall:function(e,t,n){var i=typeof e==="function"?e():e;if(!i||!t){return undefined}n=n||i;if(typeof t==="function"){t.call(n,i);return undefined}else{var a;var o=[];for(var r in t){if(typeof i[r]==="function"){a=t[r];o.push(i[r].apply(n,a))}else{o.push(undefined)}}if(o.length===1){return o[0]}else{return o}}},throttle:function(e,t,n){n=Object.assign({leading:true,asyncLeading:false,trailing:true},n);var i;var a=false;var o={};var r;var l;if(n.leading&&n.asyncLeading){r=function(){if(a){var t=Promise.resolve().then(function(){if(!t.canceled){e.apply(o.context,o.args)}i=null});t.cancel=function(){t.canceled=true};i=t}else{e.apply(this,arguments)}}}else{r=e}var s=c(r,t,{leading:n.leading,trailing:n.trailing});if(n.leading&&n.asyncLeading){var u=s.cancel;s.cancel=function(){if(i){i.cancel()}u()};l=Object.assign(function(){o={context:this,args:arguments};a=true;s.apply(this,arguments);a=false},s)}else{l=s}return l},throttleFrameWise:function(e){var t=null;var n=function(){n.cancel();t=window.requestAnimationFrame(function(t){e.apply(this,t)}.bind(this,arguments))};n.cancel=function(){window.cancelAnimationFrame(t);t=null};return n},getInteractiveElements:function(e){if(!e){return null}var t=jQuery(e);var n=T.getCellInfo(t);if(n.isOfType(R.ANY|R.PSEUDO)){var i=t.find(E);if(i.length>0){return i}}return null},getFirstInteractiveElement:function(e,t){if(!e){return null}var n=e.getTable();var i=e.getCells();if(t===true&&T.hasRowActions(n)){i.push(e.getRowAction())}for(var a=0;a<i.length;a++){var o=i[a].getDomRef();var r=T.getCell(n,o,true);var l=T.getInteractiveElements(r);if(l){return l[0]}}return null},convertCSSSizeToPixel:function(e,t){var n;if(typeof e!=="string"){return null}if(e.endsWith("px")){n=parseFloat(e)}else if(e.endsWith("em")||e.endsWith("rem")){n=parseFloat(e)*T.getBaseFontSize()}else{return null}if(t){return n+"px"}else{return n}},getBaseFontSize:function(){if(v==null){var e=document.documentElement;if(e){v=parseInt(window.getComputedStyle(e).fontSize)}}return v==null?16:v},readThemeParameters:function(){var e=u.get({name:["_sap_ui_table_BaseSize","_sap_ui_table_BaseSizeCozy","_sap_ui_table_BaseSizeCompact","_sap_ui_table_BaseSizeCondensed","_sap_ui_table_BaseBorderWidth","_sap_ui_table_NavigationIcon","_sap_ui_table_DeleteIcon","_sap_ui_table_ClearSelectionIcon","_sap_ui_table_NavIndicatorWidth"]});function t(t){return T.convertCSSSizeToPixel(e[t])}m.undefined=t("_sap_ui_table_BaseSize");m.sapUiSizeCozy=t("_sap_ui_table_BaseSizeCozy");m.sapUiSizeCompact=t("_sap_ui_table_BaseSizeCompact");m.sapUiSizeCondensed=t("_sap_ui_table_BaseSizeCondensed");_=t("_sap_ui_table_BaseBorderWidth");w=_;S.undefined=m.undefined+w;S.sapUiSizeCozy=m.sapUiSizeCozy+w;S.sapUiSizeCompact=m.sapUiSizeCompact+w;S.sapUiSizeCondensed=m.sapUiSizeCondensed+w;I.navigationIcon=e["_sap_ui_table_NavigationIcon"];I.deleteIcon=e["_sap_ui_table_DeleteIcon"];I.clearSelectionIcon=e["_sap_ui_table_ClearSelectionIcon"];I.navIndicatorWidth=t("_sap_ui_table_NavIndicatorWidth")},addDelegate:function(e,t,n){if(e&&t){e.addDelegate(t,false,n?n:t,false)}},removeDelegate:function(e,t){if(e&&t){e.removeDelegate(t)}},createWeakMapFacade:function(){var e=new window.WeakMap;return function(t){if(!t||!(typeof t==="object")){return null}if(!e.has(t)){e.set(t,{})}return e.get(t)}}};e.TableUtils=T;t.TableUtils=T;n.TableUtils=T;i.TableUtils=T;a.TableUtils=T;return T},true);
//# sourceMappingURL=TableUtils.js.map
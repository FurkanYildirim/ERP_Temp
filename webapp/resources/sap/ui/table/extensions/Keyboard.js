/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./ExtensionBase","./KeyboardDelegate","../utils/TableUtils","sap/ui/core/delegate/ItemNavigation","sap/ui/Device","sap/ui/dom/containsOrEquals","sap/ui/thirdparty/jquery"],function(e,t,i,o,a,n,jQuery){"use strict";var s={_forward:function(e,t){var i=e._getItemNavigation();if(i!=null&&!e._getKeyboardExtension().isItemNavigationSuspended()&&!t.isMarked("sapUiTableSkipItemNavigation")){i["on"+t.type](t)}},onfocusin:function(e){s._forward(this,e)},onsapfocusleave:function(e){s._forward(this,e)},onmousedown:function(e){s._forward(this,e)},onsapnext:function(e){s._forward(this,e)},onsapnextmodifiers:function(e){s._forward(this,e)},onsapprevious:function(e){s._forward(this,e)},onsappreviousmodifiers:function(e){s._forward(this,e)},onsappageup:function(e){s._forward(this,e)},onsappagedown:function(e){s._forward(this,e)},onsaphome:function(e){s._forward(this,e)},onsaphomemodifiers:function(e){s._forward(this,e)},onsapend:function(e){s._forward(this,e)},onsapendmodifiers:function(e){s._forward(this,e)},onsapkeyup:function(e){s._forward(this,e)}};var l={onBeforeRendering:function(e){this._oStoredFocusInfo=this.getFocusInfo()},onAfterRendering:function(e){var t=e&&e.isMarked("renderRows");this._getKeyboardExtension().invalidateItemNavigation();if(this._oStoredFocusInfo&&this._oStoredFocusInfo.customId){if(t){this.applyFocusInfo(this._oStoredFocusInfo)}else{r.initItemNavigation(this._getKeyboardExtension(),true)}}delete this._oStoredFocusInfo},onfocusin:function(e){var t=this._getKeyboardExtension();if(!t._bIgnoreFocusIn){r.initItemNavigation(this._getKeyboardExtension())}else{e.setMarked("sapUiTableIgnoreFocusIn")}if(e.target&&e.target.id===this.getId()+"-rsz"){e.preventDefault();e.setMarked("sapUiTableSkipItemNavigation")}}};var r={initItemNavigation:function(e,t){if(r.isItemNavigationInvalid(e)){r._initItemNavigation(e,t)}},_initItemNavigation:function(e,t){var a=e.getTable();if(!a){return}var n=a.$();var s=a.getRows().length;var l=i.getVisibleColumnCount(a);var f=i.hasRowHeader(a);var d=i.hasRowActions(a);var u=i.hasFixedColumns(a);var c;var g=[],p,v,h,m,_;if(u){h=n.find(".sapUiTableCtrlFixed.sapUiTableCtrlRowFixed:not(.sapUiTableCHT)");m=n.find(".sapUiTableCtrlFixed.sapUiTableCtrlRowScroll:not(.sapUiTableCHT)");_=n.find(".sapUiTableCtrlFixed.sapUiTableCtrlRowFixedBottom:not(.sapUiTableCHT)")}var b=n.find(".sapUiTableCtrlScroll.sapUiTableCtrlRowFixed:not(.sapUiTableCHT)");var I=n.find(".sapUiTableCtrlScroll.sapUiTableCtrlRowScroll:not(.sapUiTableCHT)");var C=n.find(".sapUiTableCtrlScroll.sapUiTableCtrlRowFixedBottom:not(.sapUiTableCHT)");if(f){p=n.find(".sapUiTableRowSelectionCell").get();l++}if(d){v=n.find(".sapUiTableRowActionCell").get();l++}for(c=0;c<s;c++){if(f){g.push(p[c])}if(u){g=g.concat(h.find('tr[data-sap-ui-rowindex="'+c+'"]').find("td[tabindex]").get())}g=g.concat(b.find('tr[data-sap-ui-rowindex="'+c+'"]').find("td[tabindex]").get());if(u){g=g.concat(m.find('tr[data-sap-ui-rowindex="'+c+'"]').find("td[tabindex]").get())}g=g.concat(I.find('tr[data-sap-ui-rowindex="'+c+'"]').find("td[tabindex]").get());if(u){g=g.concat(_.find('tr[data-sap-ui-rowindex="'+c+'"]').find("td[tabindex]").get())}g=g.concat(C.find('tr[data-sap-ui-rowindex="'+c+'"]').find("td[tabindex]").get());if(d){g.push(v[c])}}if(a.getColumnHeaderVisible()){var R=[];var T=n.find(".sapUiTableCHT.sapUiTableCtrlFixed>tbody>tr");var F=n.find(".sapUiTableCHT.sapUiTableCtrlScroll>tbody>tr");var w=i.getHeaderRowCount(a);for(c=0;c<w;c++){if(f){R.push(a.getDomRef("selall"))}if(T.length){R=R.concat(jQuery(T.get(c)).find(".sapUiTableHeaderCell").get())}if(F.length){R=R.concat(jQuery(F.get(c)).find(".sapUiTableHeaderCell").get())}if(d){R.push(n.find(".sapUiTableRowActionHeaderCell").children().get(0))}}g=R.concat(g)}if(!e._itemNavigation){e._itemNavigation=new o;e._itemNavigation.setTableMode(true);e._itemNavigation.attachEvent(o.Events.AfterFocus,function(t){var o=i.getFocusedItemInfo(a);o.header=i.getHeaderRowCount(a);o.domRef=null;if(o.row>=o.header){e._oLastFocusedCellInfo=o}},a)}e._itemNavigation.setColumns(l);e._itemNavigation.setRootDomRef(n.find(".sapUiTableCnt").get(0));e._itemNavigation.setItemDomRefs(g);if(!t){e._itemNavigation.setFocusedIndex(r.getInitialItemNavigationIndex(e))}e._itemNavigationInvalidated=false},getInitialItemNavigationIndex:function(e){return i.hasRowHeader(e.getTable())?1:0},isItemNavigationInvalid:function(e){return!e._itemNavigation||e._itemNavigationInvalidated}};var f=e.extend("sap.ui.table.extensions.Keyboard",{_init:function(e,o,a){this._itemNavigation=null;this._itemNavigationInvalidated=false;this._itemNavigationSuspended=false;this._delegate=new t(o);this._actionMode=false;i.addDelegate(e,l,e);i.addDelegate(e,this._delegate,e);i.addDelegate(e,s,e);e._getItemNavigation=function(){return this._itemNavigation}.bind(this);return"KeyboardExtension"},_debug:function(){this._ExtensionHelper=r;this._ItemNavigationDelegate=s;this._ExtensionDelegate=l},destroy:function(){var t=this.getTable();if(t){t.removeEventDelegate(l);t.removeEventDelegate(this._delegate);t.removeEventDelegate(s)}if(this._itemNavigation){this._itemNavigation.destroy();this._itemNavigation=null}if(this._delegate){this._delegate.destroy();this._delegate=null}e.prototype.destroy.apply(this,arguments)}});f.prototype.initItemNavigation=function(){r.initItemNavigation(this)};f.prototype.invalidateItemNavigation=function(){this._itemNavigationInvalidated=true};f.prototype.setActionMode=function(e){if(!this._delegate){return}if(e===true&&!this._actionMode&&this._delegate.enterActionMode){this._actionMode=this._delegate.enterActionMode.apply(this.getTable(),Array.prototype.slice.call(arguments,1))===true}else if(e===false&&this._actionMode&&this._delegate.leaveActionMode){this._actionMode=false;this._delegate.leaveActionMode.apply(this.getTable(),Array.prototype.slice.call(arguments,1))}};f.prototype.isInActionMode=function(){return this._actionMode};f.prototype.updateNoDataAndOverlayFocus=function(){var e=this.getTable();var t=document.activeElement;if(!e||!e.getDomRef()){return}if(e.getShowOverlay()){if(n(e.getDomRef(),t)&&e.$("overlay")[0]!==t){this._oLastFocus={Ref:t,Pos:"overlay"};e.getDomRef("overlay").focus()}}else if(i.isNoDataVisible(e)){if(e.$("noDataCnt")[0]===t){return}if(n(e.getDomRef("tableCCnt"),t)){this._oLastFocus={Ref:t,Pos:"table content"};if(a.browser.safari){e.getDomRef("noDataCnt").getBoundingClientRect()}e.getDomRef("noDataCnt").focus()}else if(e.$("overlay")[0]===t){u(e,this)}else if(e._bApplyFocusInfoFailed){this._oLastFocus={Ref:t,Pos:"table content"};delete e._bApplyFocusInfoFailed;e.getDomRef("noDataCnt").focus()}}else if(this._oLastFocus){if(this._oLastFocus.Pos==="table content"){if(n(e.getDomRef("tableCCnt"),this._oLastFocus.Ref)){d(e,this)}else if(e.getRows()[0]&&e.getRows()[0].getDomRef("col0")){e.getRows()[0].getDomRef("col0").focus();this._oLastFocus=null}}else if(this._oLastFocus.Pos==="overlay"){if(n(e.getDomRef(),this._oLastFocus.Ref)){d(e,this)}else{u(e,this)}}}};function d(e,t){if(!jQuery(t._oLastFocus.Ref).hasClass("sapUiTableCell")){var o=i.getParentCell(e,t._oLastFocus.Ref);if(o&&o[0]&&jQuery(o[0]).hasClass("sapUiTableCell")){o[0].focus()}else{t._oLastFocus.Ref.focus()}}else{t._oLastFocus.Ref.focus()}t._oLastFocus=null}function u(e,t){if(e.getColumnHeaderVisible()){i.focusItem(e,r.getInitialItemNavigationIndex(t));t._oLastFocus=null}else if(i.isNoDataVisible(e)){e.getDomRef("noDataCnt").focus();t._oLastFocus=null}else if(e.getRows()[0]&&e.getRows()[0].getDomRef("col0")){e.getRows()[0].getDomRef("col0").focus();t._oLastFocus=null}}f.prototype.suspendItemNavigation=function(){this._itemNavigationSuspended=true};f.prototype.resumeItemNavigation=function(){this._itemNavigationSuspended=false};f.prototype.isItemNavigationSuspended=function(){return this._itemNavigationSuspended};f.prototype.getLastFocusedCellInfo=function(){var e=i.getHeaderRowCount(this.getTable());if(!this._oLastFocusedCellInfo||this._oLastFocusedCellInfo.header!=e){var t=i.getFocusedItemInfo(this.getTable());var o=r.getInitialItemNavigationIndex(this);return{cellInRow:o,row:e,header:e,cellCount:t.cellCount,columnCount:t.columnCount,cell:t.columnCount*e+o}}return this._oLastFocusedCellInfo};f.prototype.setSilentFocus=function(e){this._bIgnoreFocusIn=true;this.setFocus(e);this._bIgnoreFocusIn=false};f.prototype.setFocus=function(e){if(!e){return}var t=this.getTable();var o=i.getCellInfo(e);if(o.isOfType(i.CELLTYPE.ANY)&&t){var a=jQuery(e);if(a.attr("tabindex")!="0"){var n=t._getItemNavigation();if(n&&n.aItemDomRefs){for(var s=0;s<n.aItemDomRefs.length;s++){if(n.aItemDomRefs[s]){n.aItemDomRefs[s].setAttribute("tabindex","-1")}}}a.attr("tabindex","0")}}if(e instanceof HTMLElement){e.focus()}else{e.trigger("focus")}};return f});
//# sourceMappingURL=Keyboard.js.map
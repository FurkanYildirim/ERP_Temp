/*
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./SelectionPlugin","../library","../utils/TableUtils","sap/ui/core/Icon","sap/ui/core/IconPool","sap/base/Log"],function(e,t,i,n,o,r){"use strict";var l=t.SelectionMode;var s=e.extend("sap.ui.table.plugins.MultiSelectionPlugin",{metadata:{library:"sap.ui.table",properties:{limit:{type:"int",group:"Behavior",defaultValue:200},enableNotification:{type:"boolean",group:"Behavior",defaultValue:false},showHeaderSelector:{type:"boolean",group:"Appearance",defaultValue:true},selectionMode:{type:"sap.ui.table.SelectionMode",group:"Behavior",defaultValue:l.MultiToggle}},events:{selectionChange:{parameters:{indices:{type:"int[]"},limitReached:{type:"boolean"},customPayload:{type:"object"}}}}}});s.prototype.init=function(){e.prototype.init.apply(this,arguments);var t=new n({src:o.getIconURI(i.ThemeParameters.clearSelectionIcon),useIconTooltip:false});t.addStyleClass("sapUiTableSelectClear");this._bLimitReached=false;this._bLimitDisabled=this.getLimit()===0;this.oInnerSelectionPlugin=null;this.oDeselectAllIcon=t;this._oNotificationPopover=null};s.prototype.exit=function(){if(this.oDeselectAllIcon){this.oDeselectAllIcon.destroy();this.oDeselectAllIcon=null}if(this._oNotificationPopover){this._oNotificationPopover.destroy();this._oNotificationPopover=null}};s.prototype.onActivate=function(t){e.prototype.onActivate.apply(this,arguments);this.oInnerSelectionPlugin=t._createLegacySelectionPlugin();this.oInnerSelectionPlugin.attachSelectionChange(this._onSelectionChange,this);t.addAggregation("_hiddenDependents",this.oInnerSelectionPlugin);t.setProperty("selectionMode",this.getSelectionMode())};s.prototype.onDeactivate=function(t){e.prototype.onDeactivate.apply(this,arguments);t.detachFirstVisibleRowChanged(this.onFirstVisibleRowChange,this);t.setProperty("selectionMode",l.None);if(this._oNotificationPopover){this._oNotificationPopover.close()}if(this.oInnerSelectionPlugin){this.oInnerSelectionPlugin.destroy();this.oInnerSelectionPlugin=null}};s.prototype.setSelected=function(e,t,i){if(!this.isIndexSelectable(e.getIndex())){return}if(i&&i.range){var n=this.getSelectedIndex();if(n>=0){this.addSelectionInterval(n,e.getIndex())}}else if(t){this.addSelectionInterval(e.getIndex(),e.getIndex())}else{this.removeSelectionInterval(e.getIndex(),e.getIndex())}};s.prototype.isSelected=function(e){return this.isIndexSelected(e.getIndex())};s.prototype.getRenderConfig=function(){if(!this.isActive()){return e.prototype.getRenderConfig.apply(this,arguments)}return{headerSelector:{type:this._bLimitDisabled?"toggle":"clear",icon:this.oDeselectAllIcon,visible:this.getSelectionMode()===l.MultiToggle&&this.getShowHeaderSelector(),enabled:this._bLimitDisabled||this.getSelectedCount()>0,selected:this.getSelectableCount()>0&&this.getSelectableCount()===this.getSelectedCount()}}};s.prototype.onHeaderSelectorPress=function(){var e=this.getRenderConfig();if(!e.headerSelector.visible||!e.headerSelector.enabled){return}if(e.headerSelector.type==="toggle"){a(this)}else if(e.headerSelector.type==="clear"){this.clearSelection()}};s.prototype.onKeyboardShortcut=function(e){if(e==="toggle"){if(this._bLimitDisabled){a(this)}}else if(e==="clear"){this.clearSelection()}};function a(e){if(e.getSelectableCount()>e.getSelectedCount()){e.selectAll()}else{e.clearSelection()}}s.prototype.setSelectionMode=function(e){var t=this.getParent();if(t){t.setProperty("selectionMode",e,true)}if(this.oInnerSelectionPlugin){this.oInnerSelectionPlugin.setSelectionMode(e)}this.setProperty("selectionMode",e);return this};s.prototype.setLimit=function(e){if(typeof e==="number"&&e<0){r.warning("The limit must be greater than or equal to 0",this);return this}this.setProperty("limit",e,!!this.getLimit()===!!e);this._bLimitDisabled=e===0;return this};s.prototype.setEnableNotification=function(e){this.setProperty("enableNotification",e,true);return this};s.prototype.isLimitReached=function(){return this._bLimitReached};s.prototype.setLimitReached=function(e){this._bLimitReached=e};s.prototype.selectAll=function(e){if(!this._bLimitDisabled){return Promise.reject(new Error("Not possible if the limit is enabled"))}var t=this.getSelectableCount();if(t===0){return Promise.reject(new Error("Nothing to select"))}return this.addSelectionInterval(0,this._getHighestSelectableIndex(),e)};function c(e,t,i,n){var o=e._getHighestSelectableIndex();if(t<0&&i<0||t>o&&i>o){return Promise.reject(new Error("Out of range"))}t=Math.min(Math.max(0,t),o);i=Math.min(Math.max(0,i),o);var r=e.getLimit();var l=i<t;var s=l?i:t;var a;if(n&&e.isIndexSelected(t)){if(l){t--}else if(t!==i){t++;s++}}a=Math.abs(i-t)+1;if(!e._bLimitDisabled){e.setLimitReached(a>r);if(e.isLimitReached()){if(l){i=t-r+1;s=i-1}else{i=t+r-1}a=r+1}}return h(e.getTableBinding(),s,a).then(function(){return{indexFrom:t,indexTo:i}})}s.prototype.setSelectionInterval=function(e,t,i){var n=this.getSelectionMode();if(n===l.None){return Promise.reject(new Error("SelectionMode is '"+l.None+"'"))}if(n===l.Single){e=t}return c(this,e,t,false).then(function(e){this._oCustomEventPayloadTmp=i;this.oInnerSelectionPlugin.setSelectionInterval(e.indexFrom,e.indexTo);delete this._oCustomEventPayloadTmp;return this._scrollTableToIndex(e.indexTo,e.indexFrom>e.indexTo)}.bind(this))};s.prototype.setSelectedIndex=function(e,t){return this.setSelectionInterval(e,e,t)};s.prototype.addSelectionInterval=function(e,t,i){var n=this.getSelectionMode();if(n===l.None){return Promise.reject(new Error("SelectionMode is '"+l.None+"'"))}if(n===l.Single){return this.setSelectionInterval(t,t)}if(n===l.MultiToggle){return c(this,e,t,true).then(function(e){this._oCustomEventPayloadTmp=i;this.oInnerSelectionPlugin.addSelectionInterval(e.indexFrom,e.indexTo);delete this._oCustomEventPayloadTmp;return this._scrollTableToIndex(e.indexTo,e.indexFrom>e.indexTo)}.bind(this))}};s.prototype._scrollTableToIndex=function(e,t){var i=this.getParent();if(!i||!this.isLimitReached()){return Promise.resolve()}var n=i.getFirstVisibleRow();var o=i._getRowCounts();var r=n+o.scrollable-1;var l=false;if(e<n||e>r){var s=t?e-o.fixedTop-1:e-o.scrollable-o.fixedTop+2;l=i._setFirstVisibleRowIndex(Math.max(0,s))}this._showNotificationPopoverAtIndex(e);return new Promise(function(e){if(l){i.attachEventOnce("rowsUpdated",e)}else{e()}})};s.prototype._showNotificationPopoverAtIndex=function(e){var t=this;var o=this._oNotificationPopover;var r=this.getParent();var l=r.getRows()[e-r._getFirstRenderedRowIndex()];var s=i.getResourceText("TBL_SELECT_LIMIT_TITLE");var a=i.getResourceText("TBL_SELECT_LIMIT",[this.getLimit()]);if(!this.getEnableNotification()){return Promise.resolve()}return new Promise(function(e){sap.ui.require(["sap/m/Popover","sap/m/Bar","sap/m/Title","sap/m/Text","sap/m/HBox","sap/ui/core/library","sap/m/library"],function(i,c,h,u,d,p,g){if(!o){o=new i(t.getId()+"-notificationPopover",{customHeader:[new c({contentMiddle:[new d({items:[new n({src:"sap-icon://message-warning",color:p.IconColor.Critical}).addStyleClass("sapUiTinyMarginEnd"),new h({text:s,level:p.TitleLevel.H2})],renderType:g.FlexRendertype.Bare,justifyContent:g.FlexJustifyContent.Center,alignItems:g.FlexAlignItems.Center})]})],content:new u({text:a})});o.addStyleClass("sapUiContentPadding");t._oNotificationPopover=o}else{o.getContent()[0].setText(a)}r.detachFirstVisibleRowChanged(t.onFirstVisibleRowChange,t);r.attachFirstVisibleRowChanged(t.onFirstVisibleRowChange,t);var f=l.getDomRefs().rowSelector;if(f){o.attachEventOnce("afterOpen",e);o.openBy(f)}else{e()}})})};s.prototype.onFirstVisibleRowChange=function(){if(!this._oNotificationPopover){return}var e=this.getParent();if(e){e.detachFirstVisibleRowChanged(this.onFirstVisibleRowChange,this)}this._oNotificationPopover.close()};function h(e,t,i){var n=e.getContexts(t,i,0,true);var o=n.length===Math.min(i,e.getLength())&&!n.includes(undefined);if(o){return Promise.resolve(n)}return new Promise(function(n){e.attachEventOnce("dataReceived",function(){n(h(e,t,i))})})}s.prototype.clearSelection=function(e){if(this.oInnerSelectionPlugin){this.setLimitReached(false);this._oCustomEventPayloadTmp=e;this.oInnerSelectionPlugin.clearSelection();delete this._oCustomEventPayloadTmp}};s.prototype.getSelectedIndex=function(){if(this.oInnerSelectionPlugin){return this.oInnerSelectionPlugin.getSelectedIndex()}return-1};s.prototype.getSelectedIndices=function(){if(this.oInnerSelectionPlugin){return this.oInnerSelectionPlugin.getSelectedIndices()}return[]};s.prototype.getSelectableCount=function(){if(this.oInnerSelectionPlugin){return this.oInnerSelectionPlugin.getSelectableCount()}return 0};s.prototype.getSelectedCount=function(){if(this.oInnerSelectionPlugin){return this.oInnerSelectionPlugin.getSelectedCount()}return 0};s.prototype.isIndexSelectable=function(e){if(this.oInnerSelectionPlugin){return this.oInnerSelectionPlugin.isIndexSelectable(e)}return false};s.prototype.isIndexSelected=function(e){if(this.oInnerSelectionPlugin){return this.oInnerSelectionPlugin.isIndexSelected(e)}return false};s.prototype.removeSelectionInterval=function(e,t,i){if(this.oInnerSelectionPlugin){this.setLimitReached(false);this._oCustomEventPayloadTmp=i;this.oInnerSelectionPlugin.removeSelectionInterval(e,t);delete this._oCustomEventPayloadTmp}};s.prototype._onSelectionChange=function(e){var t=e.getParameter("rowIndices");this.fireSelectionChange({rowIndices:t,limitReached:this.isLimitReached(),customPayload:typeof this._oCustomEventPayloadTmp==="object"?this._oCustomEventPayloadTmp:null,_internalTrigger:e.getParameter("_internalTrigger")})};s.prototype._getHighestSelectableIndex=function(){if(this.oInnerSelectionPlugin){return this.oInnerSelectionPlugin._getHighestSelectableIndex()}return 0};s.prototype.onThemeChanged=function(){this.oDeselectAllIcon.setSrc(o.getIconURI(i.ThemeParameters.clearSelectionIcon))};return s});
//# sourceMappingURL=MultiSelectionPlugin.js.map
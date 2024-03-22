/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/filterbar/IFilterContainer","sap/ui/layout/AlignedFlowLayout","sap/m/OverflowToolbar","sap/m/ToolbarSpacer","sap/m/VBox"],function(t,e,o,i,n){"use strict";var a=t.extend("sap.ui.mdc.filterbar.vh.FilterContainer",{metadata:{aggregations:{_layout:{type:"sap.ui.core.Control",multiple:false,visibility:"hidden"}}}});a.prototype.init=function(){this.aLayoutItems=[];this.oToolbar=new o(this.getId()+"-tbr",{content:[new i]});this.oAlgnLayout=new e(this.getId()+"-aflayout",{visible:"{$sap.ui.filterbar.mdc.FilterBarBase>/expandFilterFields}"}).addStyleClass("sapUiMdcFilterBarBaseAFLayout");this.oLayout=new n(this.getId()+"-vbox",{items:[this.oToolbar,this.oAlgnLayout]});this.setAggregation("_layout",this.oLayout,true)};a.prototype.exit=function(){this.aLayoutItems.forEach(function(t){t.destroy()});this.aLayoutItems=null};a.prototype.addControl=function(t){this.oToolbar.addContent(t)};a.prototype.insertControl=function(t,e){this.oToolbar.insertContent(t,e)};a.prototype.removeControl=function(t){this.oToolbar.removeContent(t)};a.prototype.addEndContent=function(t){this.oAlgnLayout.addEndContent(t)};a.prototype.insertFilterField=function(t,e){this.aLayoutItems.splice(e,0,t);this._updateFilterBarLayout()};a.prototype.removeFilterField=function(t){var e=-1;this.aLayoutItems.some(function(o,i){if(t===o){e=i;return true}return false});if(e>=0){this.aLayoutItems.splice(e,1);this._updateFilterBarLayout()}};a.prototype.getFilterFields=function(){return this.oAlgnLayout.getContent()};a.prototype._updateFilterBarLayout=function(t){var e=this.aLayoutItems.length;var o=this.getParent().getFilterFieldThreshold();var i=t||e<=o+1;if(!i){var n=this.oAlgnLayout.getContent();n.some(function(t,e){if(t!=this.aLayoutItems[e]){i=true;return true}return false}.bind(this))}if(i){this.oAlgnLayout.removeAllContent();this.aLayoutItems.some(function(i,n){if(t||e<=o||n+1<o){this.oAlgnLayout.insertContent(i,n);return false}return true}.bind(this))}var a=this.oAlgnLayout.getEndContent()[0];a.setVisible(!t&&e>o)};return a});
//# sourceMappingURL=FilterContainer.js.map
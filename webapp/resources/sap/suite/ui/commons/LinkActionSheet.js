/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/m/library","sap/ui/core/Control","sap/m/ActionSheet","sap/ui/Device","./LinkActionSheetRenderer"],function(jQuery,e,t,i,s,n){"use strict";var r=i.extend("sap.suite.ui.commons.LinkActionSheet",{metadata:{deprecated:true,library:"sap.suite.ui.commons",aggregations:{items:{type:"sap.ui.core.Control",multiple:true,singularName:"item"}},events:{itemPress:{allowPreventDefault:true,parameters:{item:{type:"sap.ui.core.Control"}}}}}});r.prototype.init=function(){if(s.system.desktop){i.prototype.init.apply(this);this.getButtons=this.getItems}else{this._setItemNavigation=function(){};this.attachBeforeOpen(function(){this.onclick=function(e){e.preventDefault()}}).attachAfterOpen(function(){this.onclick=function(e){}})}};r.prototype._preProcessActionItem=function(t){if(t.getType&&t.getType()!==e.ButtonType.Accept&&t.getType()!==e.ButtonType.Reject){t.setType(e.ButtonType.Transparent);t.addStyleClass("sapMBtnInverted")}t.onsapenter=function(){this._bEnterWasPressed=true};return this};r.prototype._itemSelected=function(e){var t=e.getSource();if(this.fireItemPress({item:t})){if(!(s.os.ios&&s.system.ipad||!s.system.phone)&&this._parent){this._parent._oCloseTrigger=this}this.close()}t._bEnterWasPressed=undefined};r.prototype.addItem=function(e){this.addAggregation("items",e,false);this._preProcessActionItem(e);e.attachPress(this._itemSelected,this);return this};r.prototype.insertItem=function(e,t){this.insertAggregation("items",e,t,false);this._preProcessActionItem(e);e.attachPress(this._itemSelected,this);return this};r.prototype.removeItem=function(e){var t=this.removeAggregation("items",e,false);if(t){t.detachPress(this._itemSelected,this);e.onsapenter=undefined}return t};r.prototype.removeAllItems=function(){var e=this.removeAllAggregation("items",false);jQuery.each(e,function(e,t){t.detachPress(this._itemSelected,this);t.onsapenter=undefined}.bind(this));return e};r.prototype.clone=function(){var e=this.getItems(),i,s;for(s=0;s<e.length;s++){i=e[s];i.detachPress(this._itemSelected,this)}var n=t.prototype.clone.apply(this,arguments);for(s=0;s<e.length;s++){i=e[s];i.attachPress(this._itemSelected,this)}return n};return r});
//# sourceMappingURL=LinkActionSheet.js.map
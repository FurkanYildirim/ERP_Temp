/*!
* OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
sap.ui.define(["sap/m/p13n/QueryPanel","sap/m/VBox","sap/m/Text","sap/ui/layout/Grid","sap/ui/layout/GridData","sap/m/ComboBox","sap/ui/core/library","sap/m/library","sap/m/Label"],function(t,e,o,r,n,a,i,s,p){"use strict";var c=i.ValueState;var l=s.ListKeyboardMode;var u=s.FlexJustifyContent;var y=t.extend("sap.ui.mdc.p13n.panels.FilterPanel",{metadata:{library:"sap.ui.mdc",properties:{itemFactory:{type:"function"}}},renderer:{apiVersion:2}});y.prototype.PRESENCE_ATTRIBUTE="active";y.prototype._createInnerListControl=function(){var e=t.prototype._createInnerListControl.apply(this,arguments);e.setKeyboardMode(l.Edit);return e};y.prototype._createQueryRowGrid=function(t){var e=t.name?this._createRowContainer(t.label,t.key):this._createKeySelect(t.name);var o=[e];if(t.name){o.push(this._createFactoryControl(t))}return new r({containerQuery:true,defaultSpan:"XL4 L4 M4 S4",content:o}).addStyleClass("sapUiTinyMargin")};y.prototype._getPlaceholderText=function(){return this._getResourceText("p13n.FILTER_PLACEHOLDER")};y.prototype._getRemoveButtonTooltipText=function(){return this._getResourceText("p13n.FILTER_REMOVEICONTOOLTIP")};y.prototype._createKeySelect=function(t){var e=new a({width:"100%",items:this._getAvailableItems(),placeholder:this._getPlaceholderText(),selectionChange:function(t){var e=t.getSource();this._selectKey(e)}.bind(this),change:function(t){var e=t.getSource();var o=t.getParameter("newValue");e.setValueState(o&&!e.getSelectedItem()?c.Error:c.None);this._selectKey()}.bind(this)});return e};y.prototype._createRemoveButton=function(e){var o=t.prototype._createRemoveButton.apply(this,arguments);o.setJustifyContent(u.Start);o.setLayoutData(new n({span:"XL1 L1 M1 S1"}));return o};y.prototype._createRowContainer=function(t,o){var r=new p({text:t,showColon:true,wrapping:true});var n=new e({items:[r.addStyleClass("sapUiTinyMarginBegin")]});n._key=o;return n};y.prototype._setLabelForOnBox=function(t,e){e.getItems()[0].setLabelFor(t)};y.prototype._selectKey=function(e){var o,r;if(e){this._oComboBox=e;o=e.getParent();r=e.getSelectedKey()}else if(this._oComboBox){e=this._oComboBox;o=e.getParent();r=e.getSelectedKey();if(r){t.prototype._selectKey.call(this,e);var n=o.getContent()[0];o.removeContent(n);var a=r?e.getSelectedItem().getText():"";var i=this._createRowContainer(a,r);o.insertContent(i,0);var s=this._createFactoryControl({name:r});this._setLabelForOnBox(s,i);o.insertContent(s,1)}setTimeout(function(){if(this._oListControl&&!this._oListControl.bIsDestroyed){this._oListControl.setKeyboardMode(l.Edit)}}.bind(this),20);delete this._oComboBox}};y.prototype._getFactoryControlForRow=function(t){return t.getContent()[0].getContent()[1]};y.prototype._createFactoryControl=function(t){var e=this.getItemFactory().call(this,t);e.setLayoutData(new n({span:"XL7 L7 M7 S7"}));return e};return y});
//# sourceMappingURL=FilterPanel.js.map
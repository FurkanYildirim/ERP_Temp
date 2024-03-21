/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/field/FieldHelpBase","sap/ui/mdc/condition/Condition","sap/ui/mdc/enum/ConditionValidated","sap/ui/model/FormatException","sap/ui/model/ParseException","sap/ui/model/base/ManagedObjectModel","sap/ui/base/ManagedObjectObserver","sap/ui/mdc/library"],function(e,t,i,s,a,r,l,o){"use strict";var n;var d;var u;var h;var p;var f=e.extend("sap.ui.mdc.field.ListFieldHelp",{metadata:{library:"sap.ui.mdc",properties:{filterList:{type:"boolean",group:"Appearance",defaultValue:true},useFirstMatch:{type:"boolean",group:"Behavior",defaultValue:false}},aggregations:{items:{type:"sap.ui.core.ListItem",multiple:true,singularName:"item"}},defaultAggregation:"items"}});f._init=function(){e._init.apply(this,arguments);n=undefined;d=undefined;u=undefined;h=undefined};f.prototype.init=function(){e.prototype.init.apply(this,arguments);this._oManagedObjectModel=new r(this);this._oObserver=new l(m.bind(this));this._oObserver.observe(this,{properties:["filterValue","conditions"],aggregations:["items"],bindings:["items"]});this._oResourceBundle=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc")};f.prototype.exit=function(){e.prototype.exit.apply(this,arguments);this._oManagedObjectModel.destroy();delete this._oManagedObjectModel;this._oObserver.disconnect();this._oObserver=undefined;if(this._iDataUpdateTimer){clearTimeout(this._iDataUpdateTimer);this._iDataUpdateTimer=null}};f.prototype._createPopover=function(){var t=e.prototype._createPopover.apply(this,arguments);if((!n||!d||!u)&&!this._bListRequested){n=sap.ui.require("sap/m/List");d=sap.ui.require("sap/m/DisplayListItem");u=sap.ui.require("sap/m/library");h=sap.ui.require("sap/ui/model/Filter");p=sap.ui.require("sap/ui/model/Sorter");if(!n||!d||!u){sap.ui.require(["sap/m/List","sap/m/DisplayListItem","sap/m/library","sap/ui/model/Filter","sap/ui/model/Sorter"],v.bind(this));this._bListRequested=true}}if(t){c.call(this)}return t};function c(){if(!this._oList&&n&&d&&u&&!this._bListRequested){var e=this.getBindingInfo("items");this._oList=new n(this.getId()+"-List",{width:"100%",showNoData:false,mode:u.ListMode.SingleSelectMaster,rememberSelections:false,itemPress:b.bind(this)}).addStyleClass("sapMComboBoxBaseList").addStyleClass("sapMComboBoxList");this._oList.setModel(this._oManagedObjectModel,"$field");this._oList.bindElement({path:"/",model:"$field"});g.call(this,e);this._setContent(this._oList);if(this._bNavigate){this._bNavigate=false;this.navigate(this._iStep);this._iStep=null}}}function g(e){if(this._oList){this._oList.unbindAggregation("items");var t=new d(this.getId()+"-item",{type:u.ListType.Active,label:"{$field>text}",value:"{$field>additionalText}",valueTextDirection:"{$field>textDirection}"}).addStyleClass("sapMComboBoxNonInteractiveItem");var i=new h("text",C.bind(this));var s=false;if(e&&e.template&&e.template.isA("sap.ui.mdc.field.ListFieldHelpItem")){s=true}else{var a=this.getItems();if(a.length>0&&a[0].isA("sap.ui.mdc.field.ListFieldHelpItem")){s=true}}var r=s&&new p("groupKey",false,I.bind(this));this._oList.bindAggregation("items",{path:"$field>items",template:t,filters:i,sorter:r,templateShareable:false});M.call(this)}}function v(e,t,i,s,a){n=e;d=t;u=i;h=s;p=a;this._bListRequested=false;if(!this._bIsBeingDestroyed){c.call(this)}}f.prototype.open=function(t){e.prototype.open.apply(this,arguments);var i=this._getPopover();var s=this._getControlForSuggestion();if(i&&s){var a=s.$().outerWidth()/parseFloat(u.BaseFontSize)+"rem";i.setContentMinWidth(a)}};f.prototype._handleAfterClose=function(t){if(this._bUpdateFilterAfterClose){this._bUpdateFilterAfterClose=false;L.call(this)}this._oList.removeStyleClass("sapMListFocus");e.prototype._handleAfterClose.apply(this,arguments)};function m(e){if(e.object===this){if(e.name==="items"){if(e.type==="binding"){if(e.mutation==="prepare"){g.call(this,e.bindingInfo)}}else{if(e.mutation==="insert"){this._oObserver.observe(e.child,{properties:true})}else{this._oObserver.unobserve(e.child)}_.call(this)}}if(e.name==="conditions"){if(!this._bConditionUpdate){M.call(this)}}if(e.name==="filterValue"){if(this._oList){if(this._bClosing){this._bUpdateFilterAfterClose=true}else{L.call(this)}}}}else{_.call(this)}}function _(){if(!this._iDataUpdateTimer){this._iDataUpdateTimer=setTimeout(function(){this._iDataUpdateTimer=null;this.fireDataUpdate()}.bind(this),0)}}f.prototype.openByTyping=function(){return true};f.prototype.openByClick=function(){return!this.getFilterList()};f.prototype.getValueHelpEnabled=function(){return false};f.prototype.removeFocus=function(){if(this._oList){this._oList.removeStyleClass("sapMListFocus")}};f.prototype.navigate=function(e){var t=this._getPopover();if(!t||!this._oList){this._bNavigate=true;this._iStep=e;return}this._oList.addStyleClass("sapMListFocus");var i=this._oList.getSelectedItem();var s=this._oList.getItems();var a=s.length;var r=0;var l=this.getFilterList();var o=this.getFilterValue();var n=false;if(!l&&!i){var d=0;if(e>=0){for(d=0;d<s.length;d++){if(s[d].getLabel&&F.call(this,s[d].getLabel(),o)){r=d;break}}}else{for(d=s.length-1;d>=0;d--){if(s[d].getLabel&&F.call(this,s[d].getLabel(),o)){r=d;break}}}}else if(i){r=this._oList.indexOfItem(i);r=r+e}else if(e>=0){r=e-1}else{r=a+e}var u;if(r<0){r=0;u=true;n=true}else if(r>=a-1){r=a-1;u=false}else{u=e>=0}while(s[r]&&s[r].isA("sap.m.GroupHeaderListItem")){if(u){r++}else{r--}}var h=s[r];if(h){if(h!==i){var p=y.call(this,h);var f=x.call(this,p);h.setSelected(true);var c=S.call(this,f,h.getLabel());if(!t.isOpen()){this.open()}this._oList.scrollToIndex(r);this.fireNavigate({key:f,value:h.getLabel(),condition:c,itemId:h.getId(),leaveFocus:false})}else if(n){this.fireNavigate({key:undefined,value:undefined,condition:undefined,itemId:undefined,leaveFocus:n})}}};f.prototype._getTextOrKey=function(e,t,i,r,l,o,n,d,u,h){if(e===null||e===undefined){return null}else if(!e&&!t){return null}var p=this.getItems();var f;var c=0;for(c=0;c<p.length;c++){f=p[c];if(h){if(x.call(this,f)===u||f.getText()===e){return{key:x.call(this,f),description:f.getText()}}}else if(t){if(x.call(this,f)===e){return f.getText()}}else if(f.getText()===e){return x.call(this,f)}}if(t&&e===""){return null}if((!t||h)&&this.getUseFirstMatch()){for(c=0;c<p.length;c++){f=p[c];var g=f.getText();if(F.call(this,g,e)){return{key:x.call(this,f),description:g}}}}var v=this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST",[e]);if(t&&!h){throw new s(v)}else{throw new a(v)}};function b(e){var t=e.getParameter("listItem");var i=t.getSelected();if(i){var s=y.call(this,t);var a=x.call(this,s);S.call(this,a,t.getLabel());this.close();this.fireSelect({conditions:this.getConditions(),add:true,close:true})}}function y(e){var t=e.getBindingContextPath();return this._oManagedObjectModel.getProperty(t)}function L(){var e=this._oList.getBinding("items");e.update();this._oList.updateItems();this._oList.invalidate();M.call(this)}function C(e){var t=this.getFilterList();return!t||F.call(this,e,this.getFilterValue())}function F(e,t){return!t||typeof t==="string"&&e.toLowerCase().startsWith(t.toLowerCase())}function I(e){var t=e.getProperty("groupKey");var i=e.getProperty("groupText");return{key:t,text:i}}function M(){if(this._oList){var e=this.getConditions();var t;var s=this.getFilterValue();var a=this.getUseFirstMatch();var r=false;var l=this._getOperator();if(e.length>0&&(e[0].validated===i.Validated||e[0].operator===l.name)){t=e[0].values[0]}var o=this._oList.getItems();for(var n=0;n<o.length;n++){var d=o[n];if(d.isA("sap.m.DisplayListItem")){var u=y.call(this,d);if(e.length>0&&x.call(this,u)===t){d.setSelected(true)}else if(e.length===0&&a&&s&&!r&&F.call(this,d.getLabel(),s)){d.setSelected(true);r=true}else{d.setSelected(false)}}}}}function x(e){var t=e.getBinding("key");if(t){return t.getInternalValue()}else{return e.getKey()}}function S(e,t){this._bConditionUpdate=true;var i=this._createCondition(e,t);this.setProperty("conditions",[i],true);this._bConditionUpdate=false;return i}return f});
//# sourceMappingURL=ListFieldHelp.js.map
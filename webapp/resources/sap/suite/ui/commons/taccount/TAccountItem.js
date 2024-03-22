sap.ui.define(["sap/ui/thirdparty/jquery","sap/suite/ui/commons/library","sap/ui/core/Control","sap/ui/core/theming/Parameters","sap/suite/ui/commons/taccount/TAccountPanel","sap/suite/ui/commons/taccount/TAccountGroup","sap/ui/core/format/NumberFormat","sap/ui/core/Core","sap/ui/core/library","./TAccountUtils","sap/ui/thirdparty/bignumber"],function(jQuery,t,e,i,r,o,a,s,n,u,c){"use strict";var p=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var l=e.extend("sap.suite.ui.commons.taccount.TAccountItem",{metadata:{library:"sap.suite.ui.commons",properties:{value:{type:"any",group:"Misc",defaultValue:0},color:{type:"sap.m.ValueCSSColor",group:"Misc",defaultValue:null},group:{type:"string",group:"Misc",defaultValue:""},ariaLabel:{type:"string",group:"Misc",defaultValue:""}},aggregations:{properties:{type:"sap.suite.ui.commons.taccount.TAccountItemProperty",multiple:true,singularName:"property"}},events:{press:{}}},renderer:{apiVersion:2,render:function(t,e){var r=e.getColor(),o=e.getParent()&&e.getParent().getMeasureOfUnit(),a=e._getPanel(),s=u.formatCurrency(new c(e.getValue()),o,a?a.getMaxFractionDigits():0),p=s+" "+o;t.openStart("div",e).attr("tabindex","0");t.class("sapSuiteUiCommonsAccountItem");if(e.getGroup()){t.attr("group",e.getGroup())}t.attr("aria-selected","false");t.attr("aria-setsize",e._indexSize);t.attr("aria-posinset",e._index);t.attr("role","option");t.attr("aria-label",e._getAriaLabel(p));t.openEnd();t.openStart("div").class("sapSuiteUiCommonsAccountColorBar");if(r&&n.CSSColor.isValid(r)){t.style("background-color",r)}else if(n.CSSColor.isValid(i.get(r))){t.style("background-color",i.get(r))}t.openEnd();t.close("div");t.openStart("div").attr("id",e.getId()+"-content").class("sapSuiteUiCommonsAccountContent").openEnd();t.openStart("div").class("sapSuiteUiCommonsAccountItemTitleWrapper").openEnd();t.openStart("span").class("sapSuiteUiCommonsAccountItemTitle").openEnd();t.text(p);t.close("span");t.close("div");t.openStart("div").class("sapSuiteUiCommonsAccountItemProperties").openEnd();e.getProperties().forEach(function(e){t.renderControl(e)});t.close("div");t.close("div");t.close("div")}}});l.prototype.onBeforeRendering=function(){this._prepareProperties()};l.prototype.onAfterRendering=function(){this.$().on("click",this._click.bind(this))};l.prototype._refreshAriaLabel=function(t){this.$().attr("aria-label",this._getAriaLabel())};l.prototype._getAriaLabel=function(t){var e=this.getAriaLabel();if(e){return e}if(!t){var i=this.getParent()&&this.getParent().getMeasureOfUnit(),r=this._getPanel(),o=u.formatCurrency(this.getValue(),i,r?r.getMaxFractionDigits():0),t=o+" "+i}var a=(this._bIsDebit?p.getText("TACCOUNT_DEBIT"):p.getText("TACCOUNT_CREDIT"))+" "+p.getText("TACCOUNT_ITEM");a+=" "+t+" ";this.getProperties().forEach(function(t){if(t.getVisible()){a+=t.getLabel()+":"+t.getValue()+" "}});return a};l.prototype._click=function(){var t=this.fireEvent("press",{},true);if(t){this._highlightItems()}};l.prototype._highlightItems=function(){var t=this.$(),e=this.getGroup(),i=!t.is(".sapSuiteUiCommonsAccountItemSelected, .sapSuiteUiCommonsAccountItemSelectedByGroup"),r=jQuery(".sapSuiteUiCommonsAccountItemSelected");this._setAriaHighlighted(r,false);this._setAriaHighlighted(t,i);r.removeClass("sapSuiteUiCommonsAccountItemSelected");i?t.addClass("sapSuiteUiCommonsAccountItemSelected"):t.removeClass("sapSuiteUiCommonsAccountItemSelected");var a=this._findHighlightParent();if(a){var s=jQuery(".sapSuiteUiCommonsAccountItemSelectedByGroup");s.removeClass("sapSuiteUiCommonsAccountItemSelectedByGroup");this._setAriaHighlighted(s,false);if(e&&i){var n=jQuery(".sapSuiteUiCommonsAccountItem[group="+e+"]");n.addClass("sapSuiteUiCommonsAccountItemSelectedByGroup");var u=this;n.each(function(t,e){var i=sap.ui.getCore().byId(e.id);if(i){u._setAriaHighlighted(i.$(),true);var r=i.getParent();if(r){r.$().addClass("sapSuiteUiCommonsAccountItemSelectedByGroup");var a=r.getParent();if(a instanceof o){a.$().addClass("sapSuiteUiCommonsAccountItemSelectedByGroup")}}}})}}};l.prototype.onsapenter=function(){this._highlightItems()};l.prototype.onsapspace=function(){this._highlightItems()};l.prototype._setAriaHighlighted=function(t,e){t.attr("aria-selected",e);t.attr("aria-label",e?p.getText("COLORED_ITEM_FROM")+" "+this.getGroup():this._getAriaLabel())};l.prototype._findHighlightParent=function(){var t=this.getParent();t=t&&t.getParent();if(t instanceof o){var e=t.getParent();return e instanceof r||t}return null};l.prototype._getPanel=function(){var t=this.getParent();t=t&&t.getParent();if(t instanceof o){var e=t.getParent();if(e instanceof r){return e}}return null};l.prototype._prepareProperties=function(){this._mProperties={};this.getProperties().forEach(function(t){var e=t.getKey();if(e){this._mProperties[e]=t}}.bind(this))};l.prototype.setValue=function(t){var e=new c(t);var i=new c(this.getValue());var r=this._bIsDebit?-1:1;var o=new c(r).times(e.minus(i));var a=o.isGreaterThan(0);this.setProperty("value",t);this.getParent()&&this.getParent()._valueChanged(o,this._bIsDebit&&!a)};return l});
//# sourceMappingURL=TAccountItem.js.map
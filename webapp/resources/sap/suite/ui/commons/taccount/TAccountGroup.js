sap.ui.define(["sap/ui/thirdparty/jquery","sap/suite/ui/commons/library","sap/ui/core/Control","sap/ui/core/theming/Parameters","./TAccountPanel","sap/ui/core/IconPool","sap/ui/core/Icon","sap/m/Button","sap/base/security/encodeXML","sap/ui/core/Configuration","sap/ui/core/delegate/ItemNavigation","./TAccountUtils","sap/ui/core/ResizeHandler","sap/ui/thirdparty/bignumber","sap/ui/core/InvisibleText"],function(jQuery,t,e,o,i,s,n,a,r,p,u,c,l,d,h){"use strict";var m=sap.ui.getCore().getLibraryResourceBundle("sap.suite.ui.commons");var _=e.extend("sap.suite.ui.commons.taccount.TAccountGroup",{metadata:{library:"sap.suite.ui.commons",properties:{title:{type:"string",group:"Misc",defaultValue:null},collapsed:{type:"boolean",group:"Misc",defaultValue:false}},aggregations:{accounts:{type:"sap.suite.ui.commons.taccount.TAccount",multiple:true,singularName:"account"}},events:{}},renderer:{apiVersion:2,render:function(t,e){if(!e._bThemeApplied){return}t.openStart("div",e);t.class("sapSuiteUiCommonsAccountGroup");if(e.getCollapsed()){t.class("sapSuiteUiCommonsAccountGroupCollapsed")}t.attr("tabindex",0);t.attr("aria-label",e._getAriaText());t.openEnd();t.openStart("div").class("sapSuiteUiCommonsGroupHeader").openEnd();t.openStart("div").class("sapSuiteUiCommonsGroupHeaderExpandWrapper").openEnd();t.renderControl(e._getExpandCollapse());t.close("div");t.openStart("div").class("sapSuiteUiCommonsGroupHeaderFirst").openEnd();t.openStart("span").class("sapSuiteUiCommonsGroupHeaderTitle").openEnd().unsafeHtml(r(e.getTitle())).close("span");t.openStart("span").attr("id",e.getId()+"-sum").class("sapSuiteUiCommonsGrouptHeaderSUM").openEnd().text(e._getSumText()).close("span");t.openStart("div").attr("id"," ").class("sapSuiteUiCommonsGroupInfoIconWrapper").class("sapSuiteUiCommonsTAccountBaseInfoIconWrapper").attr("title",m.getText("TACCOUNT_SELECTED")).openEnd();t.openStart("span").class("sapSuiteUiCommonsInfoIcon").openEnd();t.text("!");t.close("span");t.close("div");t.close("div");t.openStart("div").class("sapSuiteUiCommonsGroupHeaderSecond").openEnd();t.renderControl(e._getExpandAllAccounts());t.renderControl(e._getCollapseAllAccounts());t.close("div");t.close("div");t.openStart("div").attr("id",e.getId()+"-content").class("sapSuiteUiCommonsAccountGroupContent").openEnd();e.getAccounts().forEach(function(e){t.renderControl(e)});t.close("div");t.close("div")}}});_.prototype.init=function(){sap.ui.getCore().attachThemeChanged(function(){this._bThemeApplied=true;this.invalidate()},this);this._bThemeApplied=sap.ui.getCore().isThemeApplied();if(!this._sResizeHandlerId){this._sResizeHandlerId=l.register(this,this._adjustUI.bind(this))}this._oInvisibleText=new h;this._oInvisibleText.toStatic()};_.prototype.exit=function(){if(this._oIconExpand){this._oIconExpand.destroy()}if(this._oIconCollapse){this._oIconCollapse.destroy()}if(this._sResizeHandlerId){l.deregister(this._sResizeHandlerId);this._sResizeHandlerId=""}this._bAttachEventListener=false};_.prototype.onBeforeRendering=function(){this._bRendered=false;this._oSum=null;this._iColumnCount=-1};_.prototype.onAfterRendering=function(){this._adjustUI();this._bRendered=true;var t=this.getParent();if(t&&this._hasPanelParent(t)&&t._bRendered){t._recalculate()}if(this.getCollapsed()){this.$("content").hide()}};_.prototype.reset=function(){this._oSum=null};_.prototype.updateBindingContext=function(){this.reset();return e.prototype.updateBindingContext.apply(this,arguments)};_.prototype._hasPanelParent=function(t){return(t||this.getParent())instanceof i};_.prototype._getExpandCollapse=function(){var t=this.getCollapsed(),e=this._getExpandAltText(!t);if(!this._oArrowDown){this._oArrowDown=new n({src:t?"sap-icon://navigation-right-arrow":"sap-icon://navigation-down-arrow",alt:e,tooltip:e,press:function(){this._expandCollapse()}.bind(this)})}return this._oArrowDown};_.prototype._getExpandAltText=function(t){return(t?m.getText("TACCOUNT_COLLAPSE"):m.getText("TACCOUNT_EXPAND"))+" "+(this.getTitle()?this.getTitle():m.getText("TACCOUNT_GROUP_TITLE"))};_.prototype._expandCollapse=function(){var t=this.getCollapsed(),e=this._getExpandAltText(t);this._getExpandCollapse().setTooltip(e);this._getExpandCollapse().setAlt(e);this._getExpandCollapse().setSrc(t?"sap-icon://navigation-down-arrow":"sap-icon://navigation-right-arrow");this.setProperty("collapsed",!t);this._bIsExpanding=true;this.$("content")[t?"show":"hide"]("medium",function(){this._bIsExpanding=false}.bind(this));this.$()[!t?"addClass":"removeClass"]("sapSuiteUiCommonsAccountGroupCollapsed")};_.prototype._expandCollapseAllAccounts=function(t){this.getAccounts().forEach(function(e){e.setCollapsed(!!t)});if(t==true){this._oInvisibleText.setText(m.getText("TACCOUNT_COLLAPSE_ALL"))}else{this._oInvisibleText.setText(m.getText("TACCOUNT_EXPAND_ALL"))}};_.prototype._getExpandAllAccounts=function(){if(!this._oIconExpand){this._oIconExpand=new a({icon:"sap-icon://expand-all",type:"Transparent",tooltip:m.getText("TACCOUNT_EXPAND")+" "+m.getText("TACCOUNT_ALL")+" "+m.getText("TACCOUNT_TITLE"),ariaDescribedBy:this._oInvisibleText.getId(),press:function(){this._expandCollapseAllAccounts(false);if(!this._bAttachEventListener){this._focusOutOnExpandCollapse();this._bAttachEventListener=true}}.bind(this)}).addStyleClass("sapSuiteUiCommonsGroupHeaderIcon")}return this._oIconExpand};_.prototype._getCollapseAllAccounts=function(){if(!this._oIconCollapse){this._oIconCollapse=new a({icon:"sap-icon://collapse-all",type:"Transparent",tooltip:m.getText("TACCOUNT_COLLAPSE")+" "+m.getText("TACCOUNT_ALL")+" "+m.getText("TACCOUNT_TITLE"),ariaDescribedBy:this._oInvisibleText.getId(),press:function(){this._expandCollapseAllAccounts(true);if(!this._bAttachEventListener){this._focusOutOnExpandCollapse();this._bAttachEventListener=true}}.bind(this)}).addStyleClass("sapSuiteUiCommonsGroupHeaderIcon")}return this._oIconCollapse};_.prototype._focusOutOnExpandCollapse=function(){this._oIconCollapse.getDomRef().addEventListener("focusout",function(){this._oInvisibleText.setText()}.bind(this));this._oIconExpand.getDomRef().addEventListener("focusout",function(){this._oInvisibleText.setText()}.bind(this))};_.prototype._getSum=function(t){var e=this.getAccounts(),o=new d("0"),i="",s=true;if(!this._oSum||t){for(var n=0;n<e.length;n++){var a=e[n];if(i&&i!==a.getMeasureOfUnit()){s=false;break}i=a.getMeasureOfUnit();o=o.plus(a._getSum())}this._oSum={sum:o,measure:i,correct:s}}return this._oSum};_.prototype._getSumText=function(){var t=this._getSum();var e=this.getParent();if(t&&t.correct){var o=c.formatCurrency(t.sum,t.measure,e instanceof i?e.getMaxFractionDigits():0);return(t.sum>0?m.getText("TACCOUNT_CREDIT"):m.getText("TACCOUNT_DEBIT"))+": "+o+" "+r(t.measure)}return"-"};_.prototype._getAriaText=function(){return m.getText("TACCOUNT_GROUP_TITLE")+" "+(this.getTitle()?this.getTitle()+" ":"")+this._getSumText()};_.prototype._adjustUI=function(){var t=320,e=16,o=t+e;var i=this.$("content"),s=i.width(),n=Math.max(Math.ceil(s/o)-1,1);if(n===this._iColumnCount){return}if(this._bIsExpanding||this._bRendered&&this.getCollapsed()){return}var a=jQuery('<div id="'+this.getId()+'-content" class="sapSuiteUiCommonsAccountGroupContent"></div>'),r=Array.apply(null,Array(n)).map(Number.prototype.valueOf,0);var p=this.$().find(".sapSuiteUiCommonsAccount"),u=0;this._iColumnCount=n;this._iDivs=[];var c='<div class="sapSuiteUiCommonsAccountGroupDroppingArea"><div class="sapSuiteUiCommonsAccountGroupDroppingAreaInner">'+'</div><div class="sapSuiteUiCommonsAccountGroupDroppingAreaInnerBall"></div><div class="sapSuiteUiCommonsAccountGroupDroppingAreaInnerText">'+m.getText("TACCOUNT_DROP_HERE")+"</div></div>";for(var l=0;l<n;l++){var d='<div class="sapSuiteUiCommonsAccountGroupColumn">'+c+"</div>",h=jQuery(d);a.append(h);this._iDivs.push(h)}for(var l=0;l<p.length;l++){var _=jQuery(p[l]),C=_.height(),g=this._iDivs[u];var f=Number.MAX_VALUE,T=0;for(var A=0;A<n;A++){var v=r[A];if(v<f){f=v;T=A}}var g=this._iDivs[T];_.detach().appendTo(g);jQuery(c).appendTo(g);r[T]+=C}i.detach();this.$().append(a);this._setupDroppable()};_.prototype._setupDroppable=function(){var t=function(t){var e=jQuery(t);return e.hasClass("sapSuiteUiCommonsTAccountDropZoneTop")?e.parent().prev():e.parent().next()};var e=function(t,e){var o=e.draggable,i=o.next();if(i[0]!==t[0]){i.detach().insertAfter(t);o.detach().insertAfter(t)}else{o.detach().insertBefore(t)}t.removeClass("sapSuiteUiCommonsAccountGroupDroppingAreaActiveSide");o.css("left","0px");o.css("top","0px")};var o=this.$().find(".sapSuiteUiCommonsAccountGroupDroppingArea");o.droppable({scope:this.getId()+"-content",tolerance:"pointer",activeClass:"sapSuiteUiCommonsAccountGroupDroppingAreaActive",hoverClass:"sapSuiteUiCommonsAccountGroupDroppingAreaActive",drop:function(t,o){var i=jQuery(this);e(i,o)}});var i=this.$().find(".sapSuiteUiCommonsTAccountDropZoneBottom, .sapSuiteUiCommonsTAccountDropZoneTop");i.droppable({scope:this.getId()+"-content",tolerance:"pointer",drop:function(t,o){var i=jQuery(this);i=i.hasClass("sapSuiteUiCommonsTAccountDropZoneTop")?i.parent().prev():i.parent().next();e(i,o)},over:function(e,o){t(this).addClass("sapSuiteUiCommonsAccountGroupDroppingAreaActiveSide")},out:function(e,o){t(this).removeClass("sapSuiteUiCommonsAccountGroupDroppingAreaActiveSide")}})};_.prototype._valueChanged=function(t,e){if(this._oSum){if(e){this._oSum.sum=this._oSum.sum.minus(t)}else{this._oSum.sum=this._oSum.sum.plus(t)}this.$("sum").text(this._getSumText());var o=this.getParent();if(this._hasPanelParent(o)){o._valueChanged(t,e)}}};_.prototype._measureChanged=function(t){if(this._oSum){if(this._oSum.measure===t&&!this._oSum.correct){this._recalculate();return}if(this._oSum.measure!==t&&this._oSum.correct){var e=this.getParent();this._oSum.correct=false;if(this._hasPanelParent(e)){e._setInvalid()}}this.$("sum").text(this._getSumText())}};_.prototype._recalculate=function(){this._oSum=this._getSum(true);this.$("sum").text(this._getSumText());var t=this.getParent();if(this._hasPanelParent(t)){t._recalculate()}};_.prototype._hasPanelParent=function(t){return(t||this.getParent())instanceof i};_.prototype.invalidate=function(){this._bRendered=false;e.prototype.invalidate.apply(this,arguments)};return _});
//# sourceMappingURL=TAccountGroup.js.map
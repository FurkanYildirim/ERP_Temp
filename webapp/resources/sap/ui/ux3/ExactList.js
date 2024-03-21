/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/commons/ListBox","sap/ui/core/Control","sap/ui/core/Popup","sap/ui/core/theming/Parameters","./library","./ExactListRenderer","sap/ui/core/delegate/ItemNavigation","sap/ui/ux3/ExactAttribute","sap/ui/core/ListItem","sap/ui/dom/getScrollbarSize","sap/ui/events/KeyCodes","sap/ui/dom/containsOrEquals","sap/ui/events/ControlEvents","sap/ui/Device","sap/base/security/encodeXML","sap/ui/core/Configuration"],function(jQuery,t,e,i,s,r,a,o,n,l,u,h,p,f,d,c,g){"use strict";var _=r.ExactOrder;var v=e.extend("sap.ui.ux3.ExactList",{metadata:{deprecated:true,library:"sap.ui.ux3",properties:{showClose:{type:"boolean",group:"Misc",defaultValue:false},topTitle:{type:"string",group:"Misc",defaultValue:null},topHeight:{type:"int",group:"Appearance",defaultValue:290}},aggregations:{subLists:{type:"sap.ui.ux3.ExactList",multiple:true,singularName:"subList"},controls:{type:"sap.ui.commons.ListBox",multiple:true,singularName:"control",visibility:"hidden"}},associations:{data:{type:"sap.ui.ux3.ExactAttribute",multiple:false}},events:{attributeSelected:{parameters:{attribute:{type:"sap.ui.ux3.ExactAttribute"},allAttributes:{type:"object"}}}}}});t.extend("sap.ui.ux3.ExactList.LB",{metadata:{library:"sap.ui.ux3"},init:function(){t.prototype.init.apply(this,arguments);this.setAllowMultiSelect(true);this.setDisplayIcons(true);this.addStyleClass("sapUiUx3ExactLstLb")},invalidate:function(){t.prototype.invalidate.apply(this,arguments);if(!this.bInvalidated&&this.getParent()){this.getParent().invalidate()}this.bInvalidated=true},_handleUserActivation:function(e){e.metaKey=true;t.prototype._handleUserActivation.apply(this,[e])},onclick:function(e){t.prototype.onclick.apply(this,arguments);this.getParent().onclick(e)},onAfterRendering:function(){t.prototype.onAfterRendering.apply(this,arguments);this.bInvalidated=false;var e=this.getParent();var i=this.getItems();var s=e._isTop();var r=false;for(var a=0;a<i.length;a++){var n=i[a];var l=sap.ui.getCore().byId(n.getKey());var p=n.$();r=false;if(s||(!l||!l.getShowSubAttributesIndicator_Computed())){p.addClass("sapUiUx3ExactLstNoIco");r=s}else{r=true}if(r&&!s){p.attr("aria-label",e._rb.getText(p.hasClass("sapUiLbxISel")?"EXACT_LST_LIST_ITEM_SEL_ARIA_LABEL":"EXACT_LST_LIST_ITEM_ARIA_LABEL",[n.getText()]))}}var f=e._bRTL?"left":"right";jQuery(".sapUiLbxITxt",this.getDomRef()).css("margin-"+f,20+u().width+"px");jQuery(".sapUiLbxIIco",this.getDomRef()).css(f,5+u().width+"px");jQuery(this.getDomRef()).attr("tabindex","-1");var d;if(s){d=e.getTopTitle()}else{d=e._rb.getText("EXACT_LST_LIST_ARIA_LABEL",[e._iLevel,e._getAtt().getText()])}jQuery(this.getFocusDomRef()).attr("aria-label",d).attr("aria-expanded","true");this.oItemNavigation.iActiveTabIndex=-1;this.oItemNavigation.setSelectedIndex(-1);this.oItemNavigation.onsapnext=function(t){if(t.keyCode!=h.ARROW_DOWN){return}o.prototype.onsapnext.apply(this,arguments)};this.oItemNavigation.onsapprevious=function(t){if(t.keyCode!=h.ARROW_UP){return}o.prototype.onsapprevious.apply(this,arguments)}},renderer:"sap.ui.commons.ListBoxRenderer"});v.prototype.init=function(){var t=this;this._iLevel=0;this._bCollapsed=false;this._bIsFirstRendering=true;this._rb=sap.ui.getCore().getLibraryResourceBundle("sap.ui.ux3");this._lb=new v.LB(this.getId()+"-lb",{select:function(e){U(t);var i=e.getParameter("selectedItem").getKey();var s=sap.ui.getCore().byId(i);var r=e.getParameter("selectedIndex");if(t._lb.isIndexSelected(r)){s.setProperty("selected",true,true);var a=F(t,s);if(a){var o=C(t,s);if(o<0){t.addSubList(a)}else{t.insertSubList(a,o)}}}else{O(t,s,r)}B(t)._selectionChanged(s)}});this.addAggregation("controls",this._lb);this._closeHandle=jQuery.proxy(this.onForceVerticalClose,this)};v.prototype.exit=function(){if(this.bIsDestroyed){return}H(this);this._lb.removeAllItems();this._lb=null;this._closeHandle=null;this._scrollCheckHandle=null;this._rb={getText:function(){return""}};this._oTopList=null;if(this._dirtyListsCleanupTimer){clearTimeout(this._dirtyListsCleanupTimer);this._dirtyListsCleanupTimer=null;this._dirtyLists=null}};v.prototype.getFocusDomRef=function(){if(this._isTop()&&this.$().hasClass("sapUiUx3ExactLstTopHidden")){return this.getDomRef("foc")}return this._bCollapsed?this.getDomRef("head"):this._lb.getFocusDomRef()};v.prototype.onBeforeRendering=function(){this._oTopList=null;if(!this._bIsFirstRendering){return}this._bRTL=g.getRTL();if(!this._isTop()){this._bCollapsed=true;this._oCollapseStyles={cntnt:"margin-"+(this._bRTL?"right":"left")+":"+s.get("sapUiUx3ExactLstCollapseWidth")+";border-top-width:0px;",lst:"width:0px;"}}else{this._bIsFirstRendering=false}};v.prototype.onAfterRendering=function(){var t=this;var e=this._isTop();if(!this._iCurrentWidth){this._iCurrentWidth=this._getAtt().getWidth()}if(e){this._iScrollWidthDiff=-1;this.onCheckScrollbar();this.$("lst").css("bottom",u().height+"px");this.$("cntnt").on("scroll",function(e){if(e.target.id===t.getId()+"-cntnt"&&e.target.scrollTop!=0){e.target.scrollTop=0}})}if(!this._bCollapsed){R(this,this._iCurrentWidth)}U(this);if(this._bIsFirstRendering){this._bIsFirstRendering=false;$(this,false,null,true)}else{T(this);w(this)}if(this._bRefreshList){this._bRefreshList=false;setTimeout(function(){t._lb.invalidate()},0)}};v.prototype.onfocusin=function(t){if(t.target===this.getDomRef()){this.getFocusDomRef().focus()}var e=this.$("head");if(this._isTop()){e.attr("tabindex","-1");this.$("foc").attr("tabindex","-1");if(!y(this)&&t.target===e[0]){this.getFocusDomRef().focus()}if(this.$().hasClass("sapUiUx3ExactLstTopHidden")&&t.target===this.getDomRef("foc")){var i=this.getSubLists();if(i.length>0){i[0].getFocusDomRef().focus()}}}if(!t.__exactHandled){e.addClass("sapUiUx3ExactLstHeadFocus");t.__exactHandled=true}};v.prototype.onfocusout=function(t){var e=this.$("head");if(this._isTop()){e.attr("tabindex","0");this.$("foc").attr("tabindex","0")}e.removeClass("sapUiUx3ExactLstHeadFocus")};v.prototype.onclick=function(t){var e=this._lb.getScrollTop();if(jQuery(t.target).attr("id")==this.getId()+"-exp"){W(this);this.focus();t.stopPropagation()}else if(jQuery(t.target).attr("id")==this.getId()+"-close"){k(this)}else if(jQuery(t.target).attr("id")==this.getId()+"-hide"){$(this,!this._bCollapsed,t)}else if(this._isTop()&&y(this)&&p(this.$("head")[0],t.target)){L(this,t,false);return}else if(!p(this.$("cntnt")[0],t.target)){this.focus()}this._lb.setScrollTop(e)};v.prototype.onkeydown=function(t){function e(t,e){if(jQuery(e).hasClass("sapUiUx3ExactLstFoc")){return}if(e){e.focus()}t.preventDefault();t.stopPropagation()}switch(t.keyCode){case h.ENTER:case h.SPACE:if(this._isTop()&&y(this)&&p(this.$("head")[0],t.target)){L(this,t,true)}break;case h.DELETE:if(!this._isTop()&&this.getShowClose()){k(this);e(t,this.getParent().getFocusDomRef())}break;case h.NUMPAD_MINUS:if(t.shiftKey){if(!this._bCollapsed){R(this,this._iCurrentWidth-10);e(t)}}else if(!this._bCollapsed){$(this,true,t)}break;case h.NUMPAD_PLUS:if(t.shiftKey){if(!this._bCollapsed){R(this,this._iCurrentWidth+10);e(t)}}else if(this._bCollapsed){$(this,false,t)}break;case h.TAB:if(this._iLevel==0){var i=y(this);if(!t.shiftKey&&i&&p(this.$("head")[0],t.target)){e(t,this.getFocusDomRef())}else if(p(this.getFocusDomRef(),t.target)){if(t.shiftKey&&i){e(t,this.$("head")[0])}else if(!t.shiftKey){var s=b(this);if(s){e(t,s.getFocusDomRef())}}}return}if(this._iLevel==1){var s=null;if(t.shiftKey){if(p(this.$("cntnt")[0],t.target)){s=this}else{s=x(this)}}else{s=b(this)}if(s){e(t,s.getFocusDomRef())}t.stopPropagation()}break;case h.ARROW_LEFT:case h.ARROW_RIGHT:var s=null;if(this._iLevel>=1){if(this._bRTL&&t.keyCode===h.ARROW_LEFT||!this._bRTL&&t.keyCode===h.ARROW_RIGHT){s=b(this,true)}else{s=x(this,true)}if(s){e(t,s.getFocusDomRef())}t.stopPropagation()}break}};v.prototype.onmousedown=function(t){if(t.target.id===this.getId()+"-rsz"){jQuery(document.body).append('<div id="'+this.getId()+'-ghost" class="sapUiUx3ExactLstRSzGhost" style =" z-index:'+i.getNextZIndex()+'" ></div>');jQuery(document.body).on("selectstart."+this.getId(),S);var e=d.browser.msie?jQuery(document.body):this.$("ghost");e.on("mouseup."+this.getId(),jQuery.proxy(E,this)).on("mousemove."+this.getId(),jQuery.proxy(A,this));this._iStartDragX=t.pageX;this._iStartWidth=this.$("lst").width();this.$("rsz").addClass("sapUiUx3ExactLstRSzDrag")}};v.prototype.onForceVerticalClose=function(t){if(t.type=="mousedown"||t.type=="click"||t.type=="dblclick"||t.type=="focusin"||t.type=="focusout"||t.type=="keydown"||t.type=="keypress"||t.type=="keyup"||t.type=="mousedown"||t.type=="mouseup"){var e=this.$("lst");if(!p(e[0],t.target)||t.target.tagName=="BODY"){if(e.hasClass("sapUiUx3ExactLstExpanded")){this._oPopup.close(true)}}}};v.prototype.onCheckScrollbar=function(t){this._scrollCheckTimer=null;var e=this.$("cntnt");var i=e[0];if(i){var s=i.scrollWidth-i.clientWidth;if(this._iScrollWidthDiff!=s){this._iScrollWidthDiff=s;if(s<=0){e.css({"overflow-x":"hidden",bottom:u().height+"px"})}else{e.css({"overflow-x":"scroll",bottom:"0px"})}}this._scrollCheckTimer=setTimeout(this.onCheckScrollbar.bind(this),300)}};v.prototype.insertSubList=function(t,e){this.insertAggregation("subLists",t,e);if(t){D(t,this._iLevel+1)}return this};v.prototype.addSubList=function(t){this.addAggregation("subLists",t);if(t){D(t,this._iLevel+1)}return this};v.prototype.setData=function(t){if(t!=null&&typeof t!="string"){t=t.getId()}if(t){this.setAssociation("data",t);t=this._getAtt();this._lb.removeAllItems();if(!t){return this}var e=t.getAttributesInternal(true);var i=[];var s=[];for(var r=0;r<e.length;r++){var a=N(e[r]);this._lb.addItem(a);if(e[r].getSelected()){var o=F(this,e[r]);if(o){s.push(o)}i.push(a.getKey())}}this._lb.setSelectedKeys(i);var n=this.getSubLists();for(var r=0;r<n.length;r++){var l=s.indexOf(n[r]);if(l>=0){if(t.getListOrder()!=_.Fixed){s.splice(l,1)}}else{n[r]._lb.removeAllItems();n[r].destroy()}}if(t.getListOrder()===_.Fixed){this.removeAllSubLists()}for(var r=0;r<s.length;r++){this.addSubList(s[r])}var u=this;t.setChangeListener({id:u.getId(),_notifyOnChange:function(t,e){if(t==="width"){if(u._getAtt()===e&&u.getDomRef()){R(u,e.getWidth())}return}var i=B(u);if(!i._dirtyLists){i._dirtyLists={}}if(!i._dirtyLists[u.getId()]){i._dirtyLists[u.getId()]=u}if(!i._dirtyListsCleanupTimer){i._dirtyListsCleanupTimer=setTimeout(function(){this._dirtyListsCleanupTimer=null;jQuery.each(this._dirtyLists,function(t,e){if(e._lb&&e.getParent()){if(!e._isTop()){e.getParent().setData(e.getParent().getData())}else{e.setData(e.getData())}}});this._dirtyLists=null}.bind(i),0)}}})}return this};v.prototype.setShowClose=function(t){if(this._isTop()){this.setProperty("showClose",t)}return this};v.prototype.getShowClose=function(){return B(this).getProperty("showClose")};v.prototype.getTopTitle=function(){var t=this.getProperty("topTitle");return t?t:this._rb.getText("EXACT_BRWSR_LST_TITLE")};v.prototype._getAtt=function(){return sap.ui.getCore().byId(this.getData())};v.prototype._isTop=function(){return!(this.getParent()instanceof v)};v.prototype._selectionChanged=function(t){if(!this._isTop()){return}t=sap.ui.getCore().byId(t.getId());var e=function(t,i){if(!t.getSelected()){return}i.push(t);var s=t.getAttributesInternal();for(var r=0;r<s.length;r++){e(s[r],i)}};var i=[];var s=this._getAtt().getAttributesInternal();for(var r=0;r<s.length;r++){e(s[r],i)}this.fireAttributeSelected({attribute:t,allAttributes:i})};v.prototype._closeAll=function(){if(!this._isTop()){return}var t=this;var e=function(){t._getAtt()._clearSelection();t._lb.clearSelection();t.fireAttributeSelected({attribute:undefined,allAttributes:[]})};var i=this.getSubLists();if(i.length>0){for(var s=0;s<i.length;s++){k(i[s],true,s==i.length-1?e:null)}}else{e()}};var x=function(t,e){function i(t){var e=t.getParent();var i=e.getSubLists();var s=e.indexOfSubList(t)-1;if(s>=0){return i[s]}return null}function s(t){var e=t.getSubLists();if(e.length>0){return s(e[e.length-1])}return t}if(t._iLevel==0){return null}else if(t._iLevel==1){if(e){return null}var r=i(t);if(r){return r}return t.getParent()}else if(t._iLevel>1){var r=i(t);if(r){return s(r)}var a=t.getParent();if(a._iLevel>=1){return a}}return null};var b=function(t,e){function i(t){var e=t.getParent();var i=e.getSubLists();var s=e.indexOfSubList(t)+1;if(s<i.length){return i[s]}return null}function s(t){var e=t.getSubLists();if(e.length>0){return e[0]}return null}function r(t){var s=i(t);if(s){return s}var a=t.getParent();if(a._iLevel>(e?1:0)){return r(a)}else{return null}}if(t._iLevel==0){return s(t)}else if(t._iLevel==1){return e?s(t):i(t)}else if(t._iLevel>1){var a=s(t);if(a){return a}return r(t)}return null};var L=function(t,e,i){t.fireEvent("_headerPress",{kexboard:i,domRef:t.$("head")});e.stopPropagation()};var y=function(t){return!m(t)&&t.$().hasClass("sapUiUx3ExactLstTopActive")};var m=function(t){return t.$().hasClass("sapUiUx3ExactLstTopHidden")};var C=function(t,e){if(t._getAtt().getListOrder()!=_.Fixed){return-1}var i=t._getAtt().getAttributes();var s=0;for(var r=0;r<i.length;r++){if(i[r]===e){break}if(i[r].getChangeListener()){s++}}return s};var T=function(t){if(P(t)){t.$("lst").addClass("sapUiUx3ExactLstLstExp");if(!t._oPopup){var e=function(e){t._handleEvent(e)};t._oPopup=new i;if(!d.browser.firefox){t._oPopup._fixPositioning=function(t,e){i.prototype._fixPositioning.apply(this,arguments);if(e){var s=this._$();var r=jQuery(t.of);var a=0;if(t.offset){a=parseInt(t.offset.split(" ")[0])}s.css("right",jQuery(window).width()-r.outerWidth()-r.offset().left+a+"px")}}}t._oPopup.open=function(){var r=t.$("lst");I(r,false,-1,function(e){r.addClass("sapUiUx3ExactLstExpanded");t.$("exp").html(a.getExpanderSymbol(true,false));t.__sOldHeight=r.css("height");r.css("height",t.__sOldHeight);var o=t.$("head");var n=jQuery(t._lb.getDomRef());var l=n[0].scrollHeight+t.$("exp").height()+n.outerHeight()-n.height()+1;var u=jQuery(window).height()-parseInt(n.offset().top)+jQuery(window).scrollTop()-o.outerHeight();var h=Math.min(l,u);t._oPopup.setContent(r[0]);var p=s.get()["sapUiUx3ExactLst"+(t._isTop()?"Root":"")+"ExpandOffset"]||"0 0";i.prototype.open.apply(t._oPopup,[0,i.Dock.BeginTop,i.Dock.BeginBottom,o[0],p,"none none"]);t._bPopupOpened=true;return h},function(i){r.addClass("sapUiUx3ExactLstExpandedBL");P(t);t.getFocusDomRef().focus();f.bindAnyEvent(t._closeHandle);i.on(f.events.join(" "),e)})};t._oPopup.close=function(s){var r=t.$("lst");r.removeClass("sapUiUx3ExactLstExpandedBL");I(r,false,t.__sOldHeight,function(i){f.unbindAnyEvent(t._closeHandle);i.off(f.events.join(" "),e);r.removeClass("sapUiUx3ExactLstExpanded");t.$("exp").html(a.getExpanderSymbol(false,false))},function(e){e.detach();r.removeClass("sapUiShd");e.attr("style","width:"+t._iCurrentWidth+"px;");jQuery(t.getDomRef()).prepend(e);t._oPopup.setContent(null);t._bPopupOpened=undefined;t.__sOldHeight=null;if(t._isTop()){e.css("bottom",u().height+"px")}P(t);i.prototype.close.apply(t._oPopup,[0]);if(!s){t.getFocusDomRef().focus()}})}}}};var I=function(t,e,i,s,r){if(s){var a=s(t);if(a!=undefined){i=a}}var o=r?function(){r(t)}:function(){};if(jQuery.fx.off){if(e){t.width(i)}else{t.height(i)}o()}else{var n=e?{width:i}:{height:i};t.stop(true,true).animate(n,200,"linear",o)}};var S=function(t){t.preventDefault();t.stopPropagation();return false};var A=function(t){var e=t.pageX;var i=this._bRTL?this._iStartDragX-e:e-this._iStartDragX;R(this,this._iStartWidth+i)};var E=function(t){jQuery(document.body).off("selectstart."+this.getId()).off("mouseup."+this.getId()).off("mousemove."+this.getId());this.$("ghost").remove();this.$("rsz").removeClass("sapUiUx3ExactLstRSzDrag");this._iStartWidth=undefined;this._iStartDragX=undefined;this.focus()};var R=function(t,e){e=n._checkWidth(e);var i=t._bRTL?"right":"left";t._iCurrentWidth=e;t._getAtt()._setWidth(t._iCurrentWidth);t.$("lst").css("width",e+"px");t.$("rsz").css(i,e-4+"px");if(t._isTop()){if(!m(t)){t.$("head").css("width",e+"px");t.$("cntnt").css(i,e+8+"px");t.$("scroll").css(i,e+8+"px")}}else{if(!t.$().hasClass("sapUiUx3ExactLstCollapsed")){t.$("cntnt").css("margin-"+i,e+"px")}}};var U=function(t){var e=t._getAtt();if(e&&!t._isTop()){t.$("head-txt").html(c(e.getText())+'<span class="sapUiUx3ExactLstHeadInfo">&nbsp;('+t._lb.getSelectedIndices().length+"/"+t._lb.getItems().length+")</span>")}};var D=function(t,e){t._iLevel=e;var i=t.getSubLists();for(var s=0;s<i.length;s++){D(i[s],e+1)}};var P=function(t){if(t._lb){var e=jQuery(t._lb.getDomRef());t.$("lst").removeClass("sapUiUx3ExactLstScroll");if(e.length>0&&e.outerHeight()<e[0].scrollHeight){t.$("lst").addClass("sapUiUx3ExactLstScroll");return true}}return false};var $=function(t,e,i,r){if(i){i.preventDefault();i.stopPropagation()}if(t._isTop()){return}if(t._bCollapsed!=e){var o=!!i;var n={};n["margin-"+(t._bRTL?"right":"left")]=t._bCollapsed?t._iCurrentWidth+"px":s.get("sapUiUx3ExactLstCollapseWidth");n["border-top-width"]=t._bCollapsed?s.get("sapUiUx3ExactLstContentTop"):"0px";var l=t.$("cntnt");if(jQuery.fx.off){for(var u in n){l.css(u,n[u])}}else{l.stop(true,true).animate(n,200,"linear")}if(t._bCollapsed){I(t.$("lst"),true,t._iCurrentWidth+"px",function(){jQuery(t.getDomRef()).removeClass("sapUiUx3ExactLstCollapsed");t.$("head").css("overflow","hidden")},function(e){t.$("hide").html(a.getExpanderSymbol(true,true)).attr("title",t._rb.getText("EXACT_LST_LIST_COLLAPSE"));if(o){t.focus()}var i=t.$("head");t.$("head-txt").removeAttr("style");i.removeAttr("style");e.removeAttr("style");T(t);R(t,t._iCurrentWidth);w(t);i.removeAttr("role");i.removeAttr("aria-label");i.removeAttr("aria-expanded");var s=t._getAtt();if(s&&s._scrollToAttributeId){s.scrollTo(sap.ui.getCore().byId(s._scrollToAttributeId))}});t._oCollapseStyles=undefined}else{t._oCollapseStyles={};I(t.$("lst"),true,0,null,function(){jQuery(t.getDomRef()).addClass("sapUiUx3ExactLstCollapsed");t.$("hide").html(a.getExpanderSymbol(false,true)).attr("title",t._rb.getText("EXACT_LST_LIST_EXPAND"));if(o){t.focus()}w(t);var e=t.$("head");e.attr("role","region");e.attr("aria-label",t._rb.getText("EXACT_LST_LIST_COLL_ARIA_LABEL",[t._iLevel,t._getAtt().getText()]));e.attr("aria-expanded","false")});var h=[];for(var u in n){h.push(u,":",n[u],";")}t._oCollapseStyles["cntnt"]=h.join("");t._oCollapseStyles["lst"]="width:0px;"}t._bCollapsed=!t._bCollapsed}if(r){return}var p=t.getParent();if(!t._isTop()&&p&&p._isTop&&!p._isTop()){$(p,e)}};var w=function(t){if(t._bCollapsed){var e=t.$("cntnt").height()-50;var i=t.$("head-txt");i.css("width",e+"px")}var s=t.getSubLists();for(var r=0;r<s.length;r++){w(s[r])}};var W=function(t){var e=t.$("lst");if(e.hasClass("sapUiUx3ExactLstExpanded")){t._oPopup.close()}else{t._oPopup.open()}};var k=function(t,e,i){var s=function(s){if(!e){var r=t._getAtt();var a=r.getParent().indexOfAttribute(r);O(t.getParent(),r,a,true);U(t.getParent());B(t)._selectionChanged(r)}t.destroy();if(i){i()}};var r=t.getDomRef();if(r){I(jQuery(r),true,0,function(t){t.css("overflow","hidden")},s)}else{s()}};var F=function(t,e){if(e.getSelected()){var i=e.getAttributesInternal(true);if(i.length>0){var s;if(e.getChangeListener()){s=sap.ui.getCore().byId(e.getChangeListener().id)}else{s=new v}s.setData(e);return s}}return null};var O=function(t,e,i,s){t._lb.removeSelectedIndex(i);e._clearSelection();if(!s){var r=t.getSubLists();for(var a=0;a<r.length;a++){if(r[a].getData()===e.getId()){k(r[a],true)}}}};var H=function(t){var e=t._getAtt();if(e&&e.getChangeListener()&&e.getChangeListener().id===t.getId()){e.setChangeListener(null)}};var B=function(t){if(t._isTop()){return t}if(!t._oTopList){t._oTopList=B(t.getParent())}return t._oTopList};var N=function(t){var e;if(t.__oItem){e=t.__oItem;if(e.getText()!=t.getText()){e.setText(t.getText())}if(e.getKey()!=t.getId()){e.setKey(t.getId())}}else{e=new l({text:t.getText(),key:t.getId()});t.exit=function(){if(n.prototype.exit){n.prototype.exit.apply(t,[])}this.__oItem.destroy();this.__oItem=null};t.__oItem=e}return e};return v});
//# sourceMappingURL=ExactList.js.map
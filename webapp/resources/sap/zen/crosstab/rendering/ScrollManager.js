/*!
 * (c) Copyright 2010-2019 SAP SE or an SAP affiliate company.
 */
sap.ui.define(["jquery.sap.global","sap/zen/crosstab/utils/Measuring","sap/ui/core/Popup","sap/ui/core/OpenState","sap/zen/crosstab/TextConstants","sap/zen/crosstab/utils/Utils"],function(jQuery,e,t,n,r,o){"use strict";jQuery.sap.declare("sap.zen.crosstab.rendering.ScrollManager");sap.zen.crosstab.rendering.ScrollManager=function(e,n){"use strict";var i=e.getColumnHeaderArea();var l=e.getRowHeaderArea();var a=e.getDimensionHeaderArea();var s=e.getDataArea();var g=n.getMeasuringHelper();var d=0;var u=0;var c=false;var f=false;var p=0;var v=null;var S=null;var h=null;var C=null;var R=new sap.ui.core.Popup;var w=null;if(o.isMainMode()){w=new sap.m.Text}else{w=new sap.ui.commons.TextView;w.setWrapping(false)}R.setContent(w);R.setDurations(125,500);R.setAutoClose(true);R.getContent().addStyleClass("sapzencrosstab-ScrollPopup");var m=(s.getRowCnt()+"").length;var P=(s.getColCnt()+"").length;var H=0;var W=0;var I=false;var b=false;var T=this;this.destroy=function(){R.destroy()};this.setHScrollPos=function(e){u=e};this.setVScrollPos=function(e){d=e};function E(e){var t=0;if(e){t=jQuery(document.getElementById(e.getId())).children("tbody").children("tr").length}return t}function y(){var e=E(l);var t=E(s);var r=e-t;if(r>0){n.beginRendering();n.appendTopRows(s,r);l.setRenderStartRow(s.getRenderStartRow());l.setRenderRowCnt(s.getRenderRowCnt());n.adjustColWidths(a,l);n.adjustColWidths(i,s);n.adjustRowHeights(l,s);n.finishRendering(true)}}function M(t){e.getPageManager().enableTimeout(true);S=null;var r=null;if(!t){r=v}else{r=t.getParameters()}if(r){e.postPlanningValue();var o=e.getHScrollbar();var d=o.getSteps();c=r.newScrollPos===d;u=r.newScrollPos;T.sendClientScrollPosUpdate();var p=r.newScrollPos;if(p!==i.getRenderStartCol()){if(p!==i.getColCnt()){n.beginRendering();n.renderColHeaderArea(p);n.renderDataArea();n.adjustColWidths(i,s);n.adjustRowHeights(l,s);n.adjustRowHeights(a,i);n.finishRendering(true)}var h=g.getAreaWidth(i);var C=g.getUpperRightScrollDivWidth();var w=h<C;var m=i.getRenderColCnt()+i.getRenderStartCol()===i.getColCnt();if(c||w&&m){if(w&&p>0){n.beginRendering();n.appendLeftCols(i,4);n.appendLeftCols(s,4);n.adjustColWidths(i,s);n.adjustRowHeights(l,s);n.adjustRowHeights(a,i);n.finishRendering(true)}if(!c&&r.forward){B(0,true)}j(true)}else{j(false)}}else{if(c){j(true)}}if(f){y();k(true)}if(r.newScrollPos===0){j(false)}}R.close();if(e.isScrollInvalidate()===true&&!e.hasLoadingPages()){e.setInvalidateCalledByScrolling();e.invalidate()}}this.hScrollHandler=function(e,t){if(!I){if(t){M(e)}else{v=e.getParameters();if(S){clearTimeout(S);S=null;D(v.newScrollPos)}S=setTimeout(M,200,null);u=v.newScrollPos}}else{I=false}};function B(t,n){var r=e.getHScrollbar();var o=r.getScrollPosition();var i;if(n){t=r.getSteps();if(e.getPropertyBag().isRtl()&&e.getUtils().isMozilla()){r.setScrollPosition(0);r.setScrollPosition(t)}c=true}if(o!==t){r.setScrollPosition(t);I=true}u=t;i=e.getRenderEngine().getCrossRequestManager();if(i){i.setHScrollInfo(u,c)}}function j(e){T.positionHScrollDiv(e)}this.positionHScrollDiv=function(t){var n=jQuery(document.getElementById(e.getId()+"_upperRight_scrollDiv"));var r=jQuery(document.getElementById(e.getId()+"_lowerRight_scrollDiv"));var o;if(typeof t==="undefined"){t=c}if(e.getPropertyBag().isRtl()){if(jQuery.browser.webkit){o=t?0:r[0].scrollWidth}else if(e.getUtils().isMozilla()){o=t?-r[0].scrollWidth:0}else{o=t?r[0].scrollWidth:0}}else{o=t?r[0].scrollWidth:0}r.scrollLeft(o);n.scrollLeft(o)};this.vScrollHandler=function(e,t){if(!b){if(t){_(e)}else{h=e.getParameters();if(C){clearTimeout(C);C=null;V(h.newScrollPos)}C=setTimeout(_,200,null);d=h.newScrollPos}}else{b=false}};this.sendClientScrollPosUpdate=function(){e.getUtils().sendClientScrollPosUpdate(u,c,d,f)};function D(t){var n=e.getColumnHeaderArea();var i=null;var l=[];for(var a=0;a<1;a++){i=n.getCellWithColSpan(a,t,true);if(i){l.push(i.getUnescapedText())}else{l.push("?")}}var s=e.getPropertyBag().getText(r.COL_TEXT_KEY)+" "+o.padWithZeroes(t+1,P)+"/"+n.getColCnt();if(!W){if(o.isMainMode()){R.getContent().setWrapping(false)}A(s);if(o.isMainMode()){W=jQuery(document.getElementById(R.getContent().getId())).outerWidth()}else{W=jQuery(document.getElementById(R.getContent().getId())).innerWidth()}}if(o.isMainMode()){R.getContent().setMaxLines(l.length+1);R.getContent().setWrapping(true)}s=s+"\n"+l.join("\n");A(s)}function A(n){R.getContent().setProperty("text",n,true);var r=t.Dock;if(W){R.getContent().setWidth(W+"px")}var o=e.getHScrollbar();var i=g.getRenderSizeDivSize().iWidth-g.getAreaWidth(e.getRowHeaderArea());var l=jQuery(document.getElementById(R.getContent().getId())).outerWidth();i=i-l;var a=o.getScrollPosition()/o.getSteps();var s=i*a+" ";R.setPosition(r.BeginBottom,r.BeginTop,document.getElementById(e.getHScrollbar().getId()),s+"-20");if(R.getOpenState()===sap.ui.core.OpenState.CLOSED){R.open(-1)}R.getContent().rerender()}function V(t){var n=e.getRowHeaderArea();var i=null;var l=[];for(var a=0;a<1;a++){i=n.getCellWithRowSpan(t,a,true);if(i){l.push(i.getUnescapedText())}else{l.push("?")}}var s=e.getPropertyBag().getText(r.ROW_TEXT_KEY)+" "+o.padWithZeroes(t+1,m)+"/"+n.getRowCnt();if(!H){if(o.isMainMode()){R.getContent().setWrapping(false)}x(s);if(o.isMainMode()){H=jQuery(document.getElementById(R.getContent().getId())).outerWidth()}else{H=jQuery(document.getElementById(R.getContent().getId())).innerWidth()}}s=s+"\n"+l.join("\n");if(o.isMainMode()){R.getContent().setMaxLines(l.length+1);R.getContent().setWrapping(true)}x(s)}function x(t){R.getContent().setProperty("text",t,true);var n=sap.ui.core.Popup.Dock;var r=e.getVScrollbar();var o=g.getRenderSizeDivSize().iHeight-g.getAreaHeight(e.getColumnHeaderArea());var i=jQuery(document.getElementById(R.getContent().getId())).outerHeight();o=o-i;var l=r.getScrollPosition()/r.getSteps();var a=" "+o*l;R.setPosition(n.EndTop,n.BeginTop,document.getElementById(e.getVScrollbar().getId()),"-20"+a);if(H){R.getContent().setWidth(H+"px")}if(R.getOpenState()===sap.ui.core.OpenState.CLOSED){R.open(-1)}R.getContent().rerender()}function z(e){var t="";var n=1;var r=0;jQuery(document.getElementById(e.getId())).children("tbody").children("tr:last").children("td").each(function(e,o){t=jQuery(o).attr("colspan");if(!t){n=1}else{n=parseInt(t,10)}r=r+n});return r}function L(){var e=z(i);var t=z(s);var r=e-t;if(r>0){n.beginRendering();n.appendLeftCols(s,r);i.setRenderStartCol(s.getRenderStartCol());i.setRenderColCnt(s.getRenderColCnt());n.adjustColWidths(i,s);n.adjustRowHeights(l,s);n.adjustRowHeights(a,i);n.finishRendering(true)}}function _(t){e.getPageManager().enableTimeout(true);C=null;var r=null;if(!t){r=h}else{r=t.getParameters()}if(r){e.postPlanningValue();var o=e.getVScrollbar();var u=o.getSteps();f=r.newScrollPos===u;d=r.newScrollPos;T.sendClientScrollPosUpdate();var p=r.newScrollPos;if(p!==l.getRenderStartRow()){if(p!==l.getRowCnt()){n.beginRendering();n.renderRowHeaderArea(p);n.renderDataArea();n.adjustColWidths(a,l);n.adjustColWidths(i,s);n.adjustRowHeights(l,s);n.finishRendering(true)}var v=g.getAreaHeight(l);var S=g.getLowerScrollDivHeight();var w=v<S;var m=l.getRenderRowCnt()+l.getRenderStartRow()===l.getRowCnt();if(f||w&&m){if(w&&p>0){n.beginRendering();n.appendTopRows(l,2);n.appendTopRows(s,2);n.adjustColWidths(a,l);n.adjustColWidths(i,s);n.adjustRowHeights(l,s);n.finishRendering(true)}if(!f&&r.forward){O(0,true)}k(true)}else{k(false)}}else{if(f){k(true)}}if(r.newScrollPos===0){k(false)}if(c){L();j(true)}}R.close();U()}function U(){var t=e.getRenderEngine().getHeaderScrollManager();if(t){t.moveScrollbars()}}function O(t,n){var r=e.getVScrollbar();var o=r.getScrollPosition();var i;if(n){t=r.getSteps();f=true}if(o!==t){r.setScrollPosition(t);b=true}d=t;i=e.getRenderEngine().getCrossRequestManager();if(i){i.setVScrollInfo(d,f)}}function k(e){T.positionVScrollDiv(e)}this.positionVScrollDiv=function(t){var n=jQuery(document.getElementById(e.getId()+"_lowerRight_scrollDiv"));var r=jQuery(document.getElementById(e.getId()+"_lowerLeft_scrollDiv"));if(typeof t==="undefined"){t=f}p=t?n[0].scrollHeight:0;n.scrollTop(p);r.scrollTop(p)};this.moveScrollbars=function(t,n,r,o){var a=e.getHScrollbar();if(a){if(r!==undefined){c=r}else{c=a.getSteps()<=u&&i.getRenderStartCol()+i.getRenderColCnt()>=i.getColCnt()}if(c){j(true);B(0,true)}else{B(u,false)}}var s=e.getVScrollbar();if(s){if(o!==undefined){f=o}else{f=s.getSteps()<=d&&l.getRenderStartRow()+l.getRenderRowCnt()>=l.getRowCnt()}if(f){O(0,true);k(true)}else{O(d,false)}}};this.commandHScrolledToEnd=function(){c=true};this.commandVScrolledToEnd=function(){f=true};this.isVScrolledToEnd=function(){return f};this.isHScrolledToEnd=function(){return c};this.setVScrolledToEnd=function(e){f=e};this.setHScrolledToEnd=function(e){c=e}};return sap.zen.crosstab.rendering.ScrollManager});
//# sourceMappingURL=ScrollManager.js.map
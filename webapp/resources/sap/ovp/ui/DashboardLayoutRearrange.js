/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ovp/ui/UIActions","sap/ui/Device","sap/ui/thirdparty/jquery","sap/base/util/merge","sap/ovp/app/OVPLogger","sap/ovp/cards/jUtils","sap/ui/core/Core"],function(t,a,jQuery,e,s,o,i){"use strict";var l=new s("OVP.ui.DashboardLayoutRearrange");var r=function(t){this.init(t)};r.prototype.init=function(a){a.beforeDragCallback=this._beforeDragHandler.bind(this);a.dragStartCallback=this._dragStartHandler.bind(this);a.dragMoveCallback=this._dragMoveHandler.bind(this);a.dragEndCallback=this._dragEndHandler.bind(this);a.resizeStartCallback=this._resizeStartHandler.bind(this);a.resizeMoveCallback=this._resizeMoveHandler.bind(this);a.resizeEndCallback=this._resizeEndHandler.bind(this);a.endCallback=this._endHandler.bind(this);this.placeHolderClass=a.placeHolderClass;this.layout=a.layout;this.settings=a;this.destroy();this.uiActions=new t(this.settings).enable();this.aCardsOrder=null;this.aCards=a.aCards;this.layoutUtil=a.layoutUtil;this.verticalMargin=null;this.horizontalMargin=null;this.top=null;this.left=null;this.width=null;this.layoutOffset=null;this.jqLayout=null;this.jqLayoutInner=null;this.isRTLEnabled=null;this.rowHeight=a.rowHeight;this.floaterData=null;this.resizeData={};this.updatedScrollTop=0;this.SCROLL_OFFSET=16};r.prototype.destroy=function(){if(this.uiActions){this.uiActions.disable();this.uiActions=null}};r.prototype._resizeStartHandler=function(t,s){if(!a.system.desktop){return}if(this.layoutUtil&&this.layoutUtil.sLastFocusableCard){jQuery(this.layoutUtil.sLastFocusableCard).blur()}var o=this.layoutUtil.dashboardLayoutModel.getCardById(this.layoutUtil.getCardId(s.id));if(o.template==="sap.ovp.cards.stack"||o.settings.stopResizing){return}this.layoutUtil.dragOrResizeChanges=[];this.layoutUtil.startResizeCardConfig=e([],this.layoutUtil.getCards());this.layoutUtil.resizeStartCard={cardId:o.id,rowSpan:o.dashboardLayout.rowSpan,colSpan:o.dashboardLayout.colSpan,maxColSpan:o.dashboardLayout.maxColSpan,noOfItems:o.dashboardLayout.noOfItems,autoSpan:o.dashboardLayout.autoSpan,showOnlyHeader:o.dashboardLayout.showOnlyHeader,row:o.dashboardLayout.row,column:o.dashboardLayout.column};if(window.getSelection){var i=window.getSelection();i.removeAllRanges()}s.classList.add("sapOvpCardResize");o.dashboardLayout.autoSpan=false;this.initCardsSettings()};r.prototype._resizeEndHandler=function(t,e){if(e){e.classList.remove("sapOvpCardResize");if(this.uiActions.isResizeX&&!this.uiActions.isResizeY&&e.classList.contains("sapOvpNotResizableLeftRight")){return}this.updatedScrollTop=0;e.style.zIndex="auto";var s=this.layoutUtil.changedCards.resizeCard;if(s){s.dashboardLayout.maxColSpan=s.dashboardLayout.colSpan;this.layoutUtil._sizeCard(s);this.layoutUtil.dragOrResizeChanges=[];var i=this.layoutUtil.getCards();var l=this.layoutUtil.startResizeCardConfig;for(var r=0;r<i.length;r++){var d=i[r];var h=n(l,d.id);var u=h[0];this.layoutUtil.dragOrResizeChanges.push({changeType:"dragOrResize",content:{cardId:d.id,dashboardLayout:{row:d.dashboardLayout.row,oldRow:u.dashboardLayout.row,column:d.dashboardLayout.column,oldColumn:u.dashboardLayout.column,rowSpan:d.dashboardLayout.rowSpan,oldRowSpan:u.dashboardLayout.rowSpan,colSpan:d.dashboardLayout.colSpan,oldColSpan:u.dashboardLayout.colSpan,maxColSpan:d.dashboardLayout.maxColSpan,oldMaxColSpan:u.dashboardLayout.maxColSpan,noOfItems:d.dashboardLayout.noOfItems,oldNoOfItems:u.dashboardLayout.noOfItems,autoSpan:d.dashboardLayout.autoSpan,oldAutoSpan:u.dashboardLayout.autoSpan,showOnlyHeader:d.dashboardLayout.showOnlyHeader,oldShowOnlyHeader:u.dashboardLayout.showOnlyHeader}},isUserDependent:true})}}this.layoutUtil.changedCards={};if(a.system.desktop){document.querySelector("body").classList.remove("sapOVPDisableUserSelect","sapOVPDisableImageDrag")}jQuery(this.settings.wrapper).removeClass("dragAndDropMode");o.removeElementById("sapOvpOverlayDivForCursor");o.removeElementById("ovpResizeRubberBand");this.layoutUtil.getDashboardLayoutModel().extractCurrentLayoutVariant();this.layoutUtil.oLayoutCtrl.fireAfterDragEnds({positionChanges:this.layoutUtil.dragOrResizeChanges});this.layoutUtil.setAriaPos();this.layoutUtil.startResizeCardConfig=[];if(window.getSelection){var p=window.getSelection();p.removeAllRanges()}}};r.prototype._resizeMoveHandler=function(t){if(!a.system.desktop){return}if(t.element){var e,s,o,i,r=this.layoutUtil.dashboardLayoutModel.getCardById(this.layoutUtil.getCardId(t.element.id));if(r.template==="sap.ovp.cards.stack"||r.settings.stopResizing){return}var n=document.getElementsByClassName("sapFDynamicPageContentWrapper")[0];var d=n.offsetHeight;var h=n.getBoundingClientRect();if(t.evt.clientY-n.offsetTop+this.SCROLL_OFFSET>d){n.scrollTop=n.scrollTop+this.SCROLL_OFFSET;this.updatedScrollTop+=this.SCROLL_OFFSET}else if(t.evt.clientY-n.offsetTop<h.top+this.SCROLL_OFFSET&&n.scrollTop!==0){n.scrollTop=n.scrollTop-this.SCROLL_OFFSET;this.updatedScrollTop-=this.SCROLL_OFFSET}s=this.layoutUtil.calculateCardProperties(r.id);e=this._calculateMinimumCardHeight(t);if(e.ghostWidthCursor<=this.layoutUtil.getColWidthPx()&&this.uiActions.isResizeX&&!this.uiActions.isResizeY){return}i=e.ghostHeightCursor;o=e.ghostWidthCursor<=this.layoutUtil.getColWidthPx()?this.layoutUtil.getColWidthPx():e.ghostWidthCursor;if(!this.uiActions.isResizeY){if(t.element.classList.contains("sapOvpNotResizableLeftRight")||t.element.classList.contains("sapOvpNotResizableRight")&&e.ghostWidthCursor>r.dashboardLayout.colSpan*this.layoutUtil.getColWidthPx()){return}else{l.info("Not a valid scenario")}if((r.template==="sap.ovp.cards.list"||r.template==="sap.ovp.cards.v4.list")&&o>this.layoutUtil.getColWidthPx()*2||(r.template==="sap.ovp.cards.linklist"||r.template==="sap.ovp.cards.v4.linklist")&&r.settings.listFlavor==="carousel"&&o>this.layoutUtil.getColWidthPx()*3){return}}if((r.template==="sap.ovp.cards.linklist"||r.template==="sap.ovp.cards.v4.linklist")&&r.settings.listFlavor==="carousel"&&i>this.layoutUtil.getRowHeightPx()*45){t.element.classList.add("sapOvpNotResizableDown");return}var u=s.leastHeight+2*this.layoutUtil.CARD_BORDER_PX;var p=s.minCardHeight+2*this.layoutUtil.CARD_BORDER_PX;t.element.classList.remove("sapOvpMinHeightContainer");if(i<=u){i=u;t.element.classList.add("sapOvpMinHeightContainer");this.resizeData.showOnlyHeader=true}else if(i>u&&i<=p){var y=(u+p)/2;if(i>y){i=p;this.resizeData.showOnlyHeader=false}else{i=u;t.element.classList.add("sapOvpMinHeightContainer");this.resizeData.showOnlyHeader=true}}else{if(!this.uiActions.isResizeX&&(r.template==="sap.ovp.cards.list"||r.template==="sap.ovp.cards.v4.list"||r.template==="sap.ovp.cards.table"||r.template==="sap.ovp.cards.v4.table")){var c=s.headerHeight+s.dropDownHeight+2*this.layoutUtil.CARD_BORDER_PX;var g=Math.round((i-c)/s.itemHeight);i=g*s.itemHeight+c}this.resizeData.showOnlyHeader=false}this._addOverLay(e.cursor);this.resizeData.colSpan=Math.round(o/this.layoutUtil.getColWidthPx());this.resizeData.rowSpan=Math.ceil(i/this.layoutUtil.getRowHeightPx());this.layoutUtil.updateCardSize(r.id,i,o,this.resizeData.rowSpan);this.showGhostWhileResize(t,r);if(this.resizeData.colSpan&&this.resizeData.rowSpan){this.layoutUtil.resizeCard(t.element.getAttribute("id"),this.resizeData,this.layoutUtil.dragOrResizeChanges)}this.resizeData={};this.layoutUtil.setKpiNumericContentWidth(t.element)}};r.prototype._beforeDragHandler=function(t,e){if(t.type==="mousedown"){t.preventDefault()}if(a.browser.mobile){this.selectableElemets=jQuery(e).find(".sapUiSelectable");this.selectableElemets.removeClass("sapUiSelectable")}jQuery(this.settings.wrapper).addClass("dragAndDropMode")};r.prototype._dragStartHandler=function(t,s){if(a.system.desktop){document.querySelector("body").classList.add("sapOVPDisableUserSelect","sapOVPDisableImageDrag")}if(this.layoutUtil&&this.layoutUtil.sLastFocusableCard){jQuery(this.layoutUtil.sLastFocusableCard).blur()}this.layoutUtil.dragOrResizeChanges=[];var o=this.layoutUtil.getCardId(s.id);var i=this.layoutUtil.dashboardLayoutModel.getCardById(o);this.layoutUtil.dragStartCardsConfig=e([],this.layoutUtil.getCards(this.columnCount));this.layoutUtil.dragStartCard={cardId:i.id,row:i.dashboardLayout.row,column:i.dashboardLayout.column,rowSpan:i.dashboardLayout.rowSpan,colSpan:i.dashboardLayout.colSpan,maxColSpan:i.dashboardLayout.maxColSpan,noOfItems:i.dashboardLayout.noOfItems,autoSpan:i.dashboardLayout.autoSpan,showOnlyHeader:i.dashboardLayout.showOnlyHeader};l.info(s);if(window.getSelection){var r=window.getSelection();r.removeAllRanges()}this.initCardsSettings();var n=s.children[0].getBoundingClientRect();this.floaterData={width:n.width,height:n.height,startLeft:n.left-this.layoutOffset.left,startTop:n.top-this.layoutOffset.top}};r.prototype._dragMoveHandler=function(t){if(t.element){var a=0;var e=0;var s=document.getElementsByClassName("sapFDynamicPageContentWrapper")[0];var o=document.getElementsByClassName("sapFDynamicPageTitleWrapper")[0].offsetHeight;if(document.getElementsByClassName("sapUshellShellHeadSearchContainer")[0]){e=document.getElementsByClassName("sapUshellShellHeadSearchContainer")[0].offsetHeight}var i=s.offsetHeight;var l=s.getBoundingClientRect();var r;if(document.getElementsByClassName("sapFDynamicPageHeader")[0]){a=document.getElementsByClassName("sapFDynamicPageHeader")[0].offsetHeight}if(t.evt.clientY-s.offsetTop+this.SCROLL_OFFSET>i){s.scrollTop=s.scrollTop+this.SCROLL_OFFSET;r=s.scrollTop}else if(t.evt.clientY-s.offsetTop<l.top+this.SCROLL_OFFSET&&s.scrollTop!==0){s.scrollTop=s.scrollTop-this.SCROLL_OFFSET;r=s.scrollTop}else{r=s.scrollTop}this.floaterData.id=t.element.id;this.floaterData.left=t.clone.getBoundingClientRect().left;this.floaterData.top=t.clone.getBoundingClientRect().top+r-(o+a+e);var n=Math.round(this.floaterData.left/this.layoutUtil.getColWidthPx());var d={row:Math.round(this.floaterData.top/this.layoutUtil.getRowHeightPx())+1,column:this.isRTLEnabled?this.columnCount-n:n+1};d.row=d.row<=0?1:d.row;d.column=d.column<=1?1:d.column;var h=this.layoutUtil.dashboardLayoutModel.getCardById(this.layoutUtil.getCardId(this.floaterData.id));if(d.column+h.dashboardLayout.colSpan>this.columnCount){d.column=this.columnCount-h.dashboardLayout.colSpan+1}this.floaterData.row=d.row;this.floaterData.column=d.column;jQuery.when(this.layoutUtil.dashboardLayoutModel._arrangeCards(h,this.floaterData,"drag",this.layoutUtil.dragOrResizeChanges)).done(function(){this.layoutUtil._positionCards(this.aCards);this.layoutUtil.dashboardLayoutModel._removeSpaceBeforeCard()}.bind(this));this.showGhostWhileDragMove({row:h.dashboardLayout.row,column:h.dashboardLayout.column},t)}};r.prototype._dragEndHandler=function(t,e,s){if(e){var i=e.getBoundingClientRect();var l=s.getBoundingClientRect();var r=window.getComputedStyle(s).transform.split(",");var d=i.top-l.top;var h=i.left-l.left;var u=parseInt(r[4],10)+h;var p=parseInt(r[5],10)+d;s.style[this.layoutUtil.cssVendorTransition]="transform 0.3s cubic-bezier(0.46, 0, 0.44, 1)";u=Math.abs(u)-8<0?0:u-8;p=Math.abs(p)-8<0?0:p-8;s.style[this.layoutUtil.cssVendorTransform]="translate3d("+u+"px, "+p+"px, 0px) ";this.layoutUtil._positionCards(this.aCards);jQuery(s).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",function(t){o.removeElementById("ovpDashboardLayoutMarker");this.layoutUtil.getDashboardLayoutModel().extractCurrentLayoutVariant();this.layoutUtil.dragOrResizeChanges=[];var s=this.layoutUtil.getCards();var i=this.layoutUtil.dragStartCardsConfig;for(var l=0;l<s.length;l++){var r=s[l];var d=n(i,r.id);var h=d[0];this.layoutUtil.dragOrResizeChanges.push({changeType:"dragOrResize",content:{cardId:r.id,dashboardLayout:{row:r.dashboardLayout.row,oldRow:h.dashboardLayout.row,column:r.dashboardLayout.column,oldColumn:h.dashboardLayout.column,rowSpan:r.dashboardLayout.rowSpan,oldRowSpan:h.dashboardLayout.rowSpan,colSpan:r.dashboardLayout.colSpan,oldColSpan:h.dashboardLayout.colSpan,maxColSpan:r.dashboardLayout.maxColSpan,oldMaxColSpan:h.dashboardLayout.maxColSpan,noOfItems:r.dashboardLayout.noOfItems,oldNoOfItems:h.dashboardLayout.noOfItems,autoSpan:r.dashboardLayout.autoSpan,oldAutoSpan:h.dashboardLayout.autoSpan,showOnlyHeader:r.dashboardLayout.showOnlyHeader,oldShowOnlyHeader:h.dashboardLayout.showOnlyHeader}},isUserDependent:true})}this.layoutUtil.oLayoutCtrl.fireAfterDragEnds({positionChanges:this.layoutUtil.dragOrResizeChanges});if(a.system.desktop){document.body.classList.remove("sapOVPDisableUserSelect");document.body.classList.remove("sapOVPDisableImageDrag")}jQuery(this.settings.wrapper).removeClass("dragAndDropMode");if(window.getSelection){var u=window.getSelection();u.removeAllRanges()}this.uiActions.removeClone();e.classList.remove(this.placeHolderClass);var p=this.layoutUtil.dashboardLayoutModel._findHighestOccupiedRow()+32;o.addStyleToAllElements(document.querySelectorAll(".sapUshellEasyScanLayoutInner"),"height",p+"px");o.addStyleToAllElements(document.querySelectorAll(".sapUshellEasyScanLayoutInner"),"zIndex","1");o.addStyleToAllElements(document.querySelectorAll(".sapUshellEasyScanLayout"),"height",p+"px");this.layoutUtil.setAriaPos();this.layoutUtil.dragStartCardsConfig=[]}.bind(this))}};r.prototype._endHandler=function(t,e){l.info(e);if(a.browser.mobile&&this.selectableElemets){this.selectableElemets.addClass("sapUiSelectable")}};r.prototype.initCardsSettings=function(){this.jqLayout=this.layout.$();this.jqLayoutInner=this.jqLayout.children().first();var t=this.jqLayout.scrollTop();var a=this.jqLayoutInner.height();this.isRTLEnabled=i.getConfiguration().getRTL();this.aCardsOrder=[];this.layoutOffset=this.jqLayout.offset();this.corrY=this.jqLayout.get(0).getBoundingClientRect().top+this.jqLayout.scrollTop();this.corrX=this.layoutOffset.left;this.columnCount=this.layoutUtil.dashboardLayoutModel.getColCount();var e=this.layout.getVisibleLayoutItems();if(!e){return}function s(t){return t.$().parent()[0]}this.aCardsOrder=e.map(s);var o=this.jqLayoutInner.children().first();var l=this.isRTLEnabled?"margin-left":"margin-right";this.verticalMargin=parseInt(o.css(l),10);var r=this.aCardsOrder[0];var n=r.getBoundingClientRect();var d=this.jqLayoutInner[0].getBoundingClientRect();this.horizontalMargin=parseInt(jQuery(r).css("margin-bottom"),10);this.verticalMargin=this.horizontalMargin;this.top=n.top-d.top;this.left=n.left-d.left;this.width=r.offsetWidth;jQuery(this.aCardsOrder).css("position","absolute");this.drawLayout(this.aCardsOrder);this.jqLayoutInner.height(a);this.jqLayout.scrollTop(t)};r.prototype.drawLayout=function(t){function a(t){var a=jQuery(t).position();t.style[this.layoutUtil.cssVendorTransition]="all 300ms ease";t.style[this.layoutUtil.cssVendorTransform]="translate3d("+a.left+","+a.top+", 0px) "}var e=t.length;if(e>0){for(var s=0;s<e;s++){requestAnimationFrame(a.bind(this,t[s]))}}};r.prototype.showGhostWhileDragMove=function(t,a){var e=document.getElementById("ovpDashboardLayoutMarker"),s=(t.column-1)*this.layoutUtil.getColWidthPx(),o={top:(t.row-1)*this.layoutUtil.getRowHeightPx()+this.layoutUtil.CARD_BORDER_PX,left:this.isRTLEnabled?-s-this.layoutUtil.CARD_BORDER_PX:s+this.layoutUtil.CARD_BORDER_PX};if(!e){var i=document.createElement("div");i.id="ovpDashboardLayoutMarker";i.position="absolute";i.style.height=this.floaterData.height+"px";i.style.width=this.floaterData.width+"px";i.style[this.layoutUtil.cssVendorTransform]="translate3d("+o.left+"px,"+o.top+"px, 0px) ";document.getElementsByClassName("sapUshellEasyScanLayoutInner")[0].appendChild(i)}else{e.style[this.layoutUtil.cssVendorTransition]="all 300ms ease";e.style[this.layoutUtil.cssVendorTransform]="translate3d("+o.left+"px,"+o.top+"px, 0px) "}a.element.style[this.layoutUtil.cssVendorTransition]="all 300ms ease";a.element.style[this.layoutUtil.cssVendorTransform]="translate3d("+o.left+"px,"+o.top+"px, 0px) "};r.prototype.showGhostWhileResize=function(t,a){var e=document.getElementById("ovpResizeRubberBand"),s=(a.dashboardLayout.column-1)*this.layoutUtil.getColWidthPx(),o={top:(a.dashboardLayout.row-1)*this.layoutUtil.getRowHeightPx()+this.layoutUtil.CARD_BORDER_PX,left:this.isRTLEnabled?-s-this.layoutUtil.CARD_BORDER_PX:s+this.layoutUtil.CARD_BORDER_PX},i=this.resizeData.rowSpan*this.layoutUtil.getRowHeightPx()-2*this.layoutUtil.CARD_BORDER_PX+2,l=this.resizeData.colSpan*this.layoutUtil.getColWidthPx()-2*this.layoutUtil.CARD_BORDER_PX+2;if(!e){var r=document.createElement("div");r.id="ovpResizeRubberBand";r.classList.add("ovpResizeRubberBand");r.position="absolute";r.style.height=i+"px";r.style.width=l+"px";r.style[this.layoutUtil.cssVendorTransition]="all 300ms ease";r.style[this.layoutUtil.cssVendorTransform]="translate3d("+o.left+"px,"+o.top+"px, 0px) ";t.element.parentElement.appendChild(r)}else{e.style.height=i+"px";e.style.width=l+"px"}};r.prototype._addOverLay=function(t){var a=document.getElementById("sapOvpOverlayDivForCursor");if(!a){var e=document.createElement("div");e.id="sapOvpOverlayDivForCursor";e.style.cursor=t;this.jqLayout[0].appendChild(e)}else{a.style.cursor=t}};r.prototype._calculateMinimumCardHeight=function(t){var a=t.element.getBoundingClientRect(),e=a.top,s=a.right,o,i,l;if(this.uiActions.isResizeX&&!this.uiActions.isResizeY){o=this.isRTLEnabled?s-t.moveX:t.moveX-a.left;i=a.height;l="ew-resize"}else if(!this.uiActions.isResizeX&&this.uiActions.isResizeY){o=a.width;i=t.moveY-e;l="ns-resize"}else{o=this.isRTLEnabled?s-t.moveX:t.moveX-a.left;i=t.moveY-e;l=this.isRTLEnabled?"nesw-resize":"nwse-resize"}return{ghostWidthCursor:o,ghostHeightCursor:i,cursor:l}};function n(t,a){return t.filter(function(t){return t.id===a})}return r});
//# sourceMappingURL=DashboardLayoutRearrange.js.map
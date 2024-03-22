// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/Core","sap/ui/thirdparty/jquery"],function(e,jQuery){"use strict";function t(){var e=document.activeElement?document.activeElement.tagName:"";return e==="INPUT"||e==="TEXTAREA"}var l=function(l){if(!l||!l.rootSelector||!l.containerSelector||!l.draggableSelector){throw new Error("No configuration object to initialize User Interaction module.")}this.captureStart=null;this.captureMove=null;this.captureEnd=null;this.clickCallback=null;this.clickEvent=null;this.clickHandler=null;this.clone=null;this.cloneClass=null;this.container=null;this.contextMenuEvent=null;this.debug=null;this.defaultMouseMoveEvent=null;this.deltaTop=0;this.disabledDraggableSelector=null;this.dragAndScrollCallback=null;this.dragAndScrollDuration=null;this.dragAndScrollTimer=null;this.draggable=null;this.placeHolderClass=null;this.draggableSelector=null;this.draggableSelectorExclude=null;this.doubleTapCallback=null;this.doubleTapDelay=null;this.element=null;this.endDragAndScrollCallback=null;this.endX=null;this.endY=null;this.isLayoutEngine=null;this.isTouch=null;this.isCombi=null;this.lastElement=null;this.lastTapTime=null;this.lockMode=null;this.log=null;this.mode=null;this.mouseDownEvent=null;this.mouseMoveEvent=null;this.mouseUpEvent=null;this.moveTolerance=null;this.moveX=null;this.moveY=null;this.noop=null;this.onDragStartUIHandler=null;this.onDragEndUIHandler=null;this.preventClickFlag=null;this.preventClickTimeoutId=null;this.scrollContainer=null;this.scrollContainerSelector=null;this.scrollEvent=null;this.scrollTimer=null;this.startX=null;this.startY=null;this.switchModeDelay=null;this.tapsNumber=null;this.timer=null;this.scrollHandler=null;this.touchCancelEvent=null;this.dragCallback=null;this.onBeforeCreateClone=null;this.endCallback=null;this.touchEndEvent=null;this.touchMoveEvent=null;this.startCallback=null;this.touchStartEvent=null;this.wrapper=null;this.wrapperRect=null;this.scrollCallback=null;this.draggableElement=null;this.offsetLeft=0;this.elementsToCapture=null;this.init=function(e){this.startX=-1;this.startY=-1;this.moveX=-1;this.moveY=-1;this.endX=-1;this.endY=-1;this.noop=function(){};this.isLayoutEngine=e.isLayoutEngine||false;if(this.isLayoutEngine){this.moveDraggable=this.noop}this.isTouch=e.isTouch?!!e.isTouch:false;this.isCombi=e.isCombi?!!e.isCombi:false;this.container=document.querySelector(e.containerSelector);this.scrollContainerSelector=e.scrollContainerSelector||e.containerSelector;this.switchModeDelay=e.switchModeDelay||1500;this.dragAndScrollDuration=e.dragAndScrollDuration||160;this.moveTolerance=e.moveTolerance===0?0:e.moveTolerance||16;this.draggableSelector=e.draggableSelector;this.draggableSelectorBlocker=e.draggableSelectorBlocker||e.rootSelector;this.draggableSelectorExclude=e.draggableSelectorExclude;this.mode="normal";this.debug=e.debug||false;this.root=document.querySelector(e.rootSelector)||document.querySelector("#canvas");this.tapsNumber=0;this.lastTapTime=0;this.log=this.debug?this.logToConsole:this.noop;this.lockMode=false;this.placeHolderClass=e.placeHolderClass||"";this.cloneClass=e.cloneClass||"";this.deltaTop=e.deltaTop||0;this.wrapper=e.wrapperSelector?document.querySelector(e.wrapperSelector):this.container.parentNode;this.clickCallback=typeof e.clickCallback==="function"?e.clickCallback:this.noop;this.startCallback=typeof e.startCallback==="function"?e.startCallback:this.noop;this.doubleTapCallback=typeof e.doubleTapCallback==="function"?e.doubleTapCallback:this.noop;this.endCallback=typeof e.endCallback==="function"?e.endCallback:this.noop;this.dragCallback=typeof e.dragCallback==="function"?e.dragCallback:this.noop;this.onBeforeCreateClone=typeof e.onBeforeCreateClone==="function"?e.onBeforeCreateClone:this.noop;this.dragAndScrollCallback=typeof e.dragAndScrollCallback==="function"?e.dragAndScrollCallback:this.noop;this.endDragAndScrollCallback=typeof e.endDragAndScrollCallback==="function"?e.endDragAndScrollCallback:this.noop;this.scrollCallback=typeof e.scrollCallback==="function"?e.scrollCallback:this.noop;this.doubleTapDelay=e.doubleTapDelay||500;this.wrapperRect=this.wrapper.getBoundingClientRect();this.scrollEvent="scroll";this.touchStartEvent="touchstart";this.touchMoveEvent="touchmove";this.touchEndEvent="touchend";this.mouseDownEvent="mousedown";this.mouseMoveEvent="mousemove";this.mouseUpEvent="mouseup";this.contextMenuEvent="contextmenu";this.touchCancelEvent="touchcancel";this.defaultMouseMoveEvent="mousemove";this.clickEvent="click";this.isVerticalDragOnly=e.isVerticalDragOnly||false;this.draggableElement=e.draggableElement;this.offsetLeft=e.offsetLeft;this.elementsToCapture=e.elementToCapture?jQuery(e.elementToCapture):this.root;this.disabledDraggableSelector=e.disabledDraggableSelector;this.onDragStartUIHandler=typeof e.onDragStartUIHandler==="function"?e.onDragStartUIHandler:this.noop;this.onDragEndUIHandler=typeof e.onDragEndUIHandler==="function"?e.onDragEndUIHandler:this.noop;this.defaultMouseMoveHandler=e.defaultMouseMoveHandler||this.noop};this.forEach=function(e,t){return Array.prototype.forEach.call(e,t)};this.indexOf=function(e,t){return Array.prototype.indexOf.call(e,t)};this.insertBefore=function(e,t,l){var i,s,n;n=Array.prototype.splice;i=this.indexOf(e,t);s=this.indexOf(e,l);n.call(e,s-(i<s?1:0),0,n.call(e,i,1)[0])};this.logToConsole=function(){window.console.log.apply(console,arguments)};this.getDraggableElement=function(e){var t,l=false,i=false;this.draggable=jQuery(this.draggableSelector,this.container);while(typeof t==="undefined"&&e!==this.root&&!jQuery(e).is(this.draggableSelectorBlocker)){l=l||jQuery(e).is(this.draggableElement)||this.draggableElement===undefined;if(!(jQuery(e).not(this.draggableSelectorExclude).length>0)){i=true}if(!i&&l&&this.indexOf(this.draggable,e)>=0){t=e}e=e.parentNode}return t};this.captureStart=function(e){var t;if(e.type==="touchstart"&&e.touches.length===1){t=e.touches[0]}else if(e.type==="mousedown"){t=e;if(e.which!==1){return}}if(t){this.element=this.getDraggableElement(t.target);this.startX=this.moveX=t.pageX;this.startY=this.moveY=t.pageY;this.lastMoveX=0;this.lastMoveY=0;if(this.lastTapTime&&this.lastElement&&this.element&&this.lastElement===this.element&&Math.abs(Date.now()-this.lastTapTime)<this.doubleTapDelay){this.lastTapTime=0;this.tapsNumber=2}else{this.lastTapTime=Date.now();this.tapsNumber=1;this.lastElement=this.element}this.log("captureStart("+this.startX+", "+this.startY+")")}};this.startHandler=function(e){this.log("startHandler");if(this.isCombi&&!(e instanceof MouseEvent)){this.isTouchEvent=true}clearTimeout(this.timer);delete this.timer;this.captureStart(e);if(this.element){this.startCallback(e,this.element);if(this.lockMode===false){if(this.tapsNumber===2){this.mode="double-tap";return}if(this.isTouch||this.isTouchEvent){this.timer=setTimeout(function(){if(!jQuery(this.element).hasClass(this.disabledDraggableSelector)){this.log("mode switched to drag");this.mode="drag";this.onBeforeCreateClone(e,this.element);this.createClone();this.dragCallback(e,this.element)}else{this.onDragStartUIHandler()}this.isTouchEvent=false}.bind(this),this.switchModeDelay)}}}}.bind(this);this.captureMove=function(e){var t;if(e.type==="touchmove"&&e.touches.length===1){t=e.touches[0]}else if(e.type==="mousemove"){t=e}if(t){this.moveX=t.pageX;this.moveY=t.pageY;this.log("captureMove("+this.moveX+", "+this.moveY+")")}};this.moveHandler=function(e){if(t()){return}var l;this.log("moveHandler");this.captureMove(e);if(this.element&&e.type==="mousemove"&&e.buttons===0){return this.endHandler(e)}switch(this.mode){case"normal":if(Math.abs(this.startX-this.moveX)>this.moveTolerance||Math.abs(this.startY-this.moveY)>this.moveTolerance){if(this.isTouch||this.isTouchEvent){this.log("-> normal");clearTimeout(this.timer);delete this.timer}else if(this.element){this.onDragStartUIHandler();if(!jQuery(this.element).hasClass(this.disabledDraggableSelector)){this.log("mode switched to drag");this.mode="drag";this.onBeforeCreateClone(e,this.element);this.createClone()}else{this.preventClick();this.element=null}}}break;case"drag":e.preventDefault();this.onDragStartUIHandler();this.log("-> drag");if(this.isVerticalDragOnly){this.mode="vertical-drag"}else{this.mode="drag-and-scroll"}window.addEventListener(this.mouseUpEvent,this.endHandler,true);this.translateClone();this.scrollContainer=document.querySelector(this.scrollContainerSelector);this.dragAndScroll();if(!this.isTouch){this.dragCallback(e,this.element)}break;case"drag-and-scroll":e.stopPropagation();e.preventDefault();this.log("-> drag-and-scroll");l=this.dragAndScroll();this.translateClone();if(!l){this.moveDraggable()}this.dragAndScrollCallback({evt:e,clone:this.clone,isScrolling:l,moveX:this.moveX,moveY:this.moveY});break;case"vertical-drag":e.stopPropagation();e.preventDefault();l=this.dragAndScroll();this.translateClone();if(!l){this.moveDraggableVerticalOnly(this.moveX,this.moveY)}this.dragAndScrollCallback({evt:e,clone:this.clone,isScrolling:l,moveX:this.moveX,moveY:this.moveY});break;default:break}}.bind(this);this.captureEnd=function(e){var t;if((e.type==="touchend"||e.type==="touchcancel")&&e.changedTouches.length===1){t=e.changedTouches[0]}else if(e.type==="mouseup"){t=e}if(t){this.endX=t.pageX;this.endY=t.pageY;this.log("captureEnd("+this.endX+", "+this.endY+")")}};this.contextMenuHandler=function(e){if(this.isTouch){e.preventDefault()}}.bind(this);this.clickHandler=function(e){if(this.preventClickFlag){this.preventClickFlag=false;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();clearTimeout(this.preventClickTimeoutId)}this.clickCallback()}.bind(this);this.preventClick=function(){this.preventClickFlag=true;this.preventClickTimeoutId=setTimeout(function(){this.preventClickFlag=false}.bind(this),100)};this.endCallbackAdapter=function(e,t,l){var i=this.endCallback.apply(null,arguments);jQuery.when(i).then(function(){this.removeClone(t,l.clone);this.onDragEndUIHandler(e)}.bind(this));this.preventClick()};this.endHandler=function(e){this.log("endHandler");this.captureEnd(e);switch(this.mode){case"normal":this.onDragEndUIHandler(e);this.log("-> normal");break;case"drag":this.log("-> drag");this.endCallbackAdapter(e,this.element,{clone:this.clone});break;case"drag-and-scroll":this.log("-> drag-and-scroll");window.removeEventListener(this.mouseUpEvent,this.endHandler,true);this.endCallbackAdapter(e,this.element,{deltaX:this.moveX-this.startX,deltaY:this.moveY-this.startY,clone:this.clone});e.stopPropagation();e.preventDefault();break;case"vertical-drag":this.log("-> vertical-drag");window.removeEventListener(this.mouseUpEvent,this.endHandler,true);this.endCallbackAdapter(e,this.element,{clone:this.clone});e.stopPropagation();e.preventDefault();break;case"double-tap":this.log("-> double-tap");this.doubleTapCallback(e,this.element);break;default:break}clearTimeout(this.timer);delete this.timer;this.lastMoveX=0;this.lastMoveY=0;this.element=null;this.clone=null;this.mode="normal"}.bind(this);this.scrollHandler=function(){clearTimeout(this.scrollTimer);this.lockMode=true;this.scrollTimer=setTimeout(function(){this.lockMode=false}.bind(this),500)}.bind(this);this.createClone=function(){var t,l;this.preventClickFlag=true;if(e.byId(this.element.id)&&e.byId(this.element.id).getBoundingRects){l=e.byId(this.element.id).getBoundingRects()[0];l.top=l.offset.y;l.left=l.offset.x;l.width+=5}else{l=this.element.getBoundingClientRect()}this.clone=this.element.cloneNode(true);this.clone.removeAttribute("id");this.clone.removeAttribute("data-sap-ui");this.clone.className+=" "+this.cloneClass;this.element.className+=" "+this.placeHolderClass;t=this.clone.style;t.position="fixed";t.display="block";t.top=l.top+this.deltaTop+"px";t.left=l.left+"px";t.width=l.width+"px";t.zIndex="100";this.root.appendChild(this.clone);this.log("createClone")};this.removeClone=function(e,t){this.preventClick();e.className=e.className.split(" "+this.placeHolderClass).join(" ");t.parentElement.removeChild(t);this.log("removeClone")};this.translateClone=function(){var e,t;e=this.moveX-this.startX;t=this.moveY-this.startY;this.clone.style.webkitTransform="translate3d("+e+"px, "+t+"px, 0px)";this.clone.style.mozTransform="translate3d("+e+"px, "+t+"px, 0px)";this.clone.style.msTransform="translate("+e+"px, "+t+"px)";this.clone.style.transform="translate3d("+e+"px, "+t+"px, 0px)";this.log("translateClone ("+e+", "+t+")")};this.dragAndScroll=function(){var e,t,l=this;function i(){var e,t;if(l.clone){e=l.clone.getBoundingClientRect();t=l.wrapperRect.top-e.top;if(t>0){return t}t=l.wrapper.offsetTop+l.wrapper.offsetHeight-(e.top+l.clone.offsetHeight);if(t<0){return t}}return 0}function s(){if(l.endDragAndScrollCallback(l.moveY)){return false}if(e<0){return l.wrapper.getBoundingClientRect().top-(l.container.getBoundingClientRect().top+l.container.offsetHeight)+l.wrapper.offsetHeight<0}return l.container.getBoundingClientRect().top-(l.wrapper.getBoundingClientRect().top+l.container.offsetTop)<0}function n(){l.dragAndScrollTimer=setTimeout(function(){l.wrapper.scrollTop-=e;l.dragAndScrollTimer=undefined;if((e=i())!==0&&s()){n()}l.scrollCallback()},t)}e=i();if(e!==0&&!this.dragAndScrollTimer&&s()){t=this.dragAndScrollDuration;this.scrollContainer=this.scrollContainer||document.querySelector(this.scrollContainerSelector);n()}this.log("dragAndScroll ("+e+")");return e!=0&&s()};this.moveDraggableVerticalOnly=function(){var e,t,l,i=true;this.forEach(this.draggable,function(s,n){if(!e){l=s.getBoundingClientRect();t=!(l.bottom<this.moveY||l.top>this.moveY);if(t){e=s;if(l.top+l.height/2<this.moveY){i=false}}}}.bind(this));if(e&&this.element!==e){if(i){this.insertBefore(this.draggable,this.element,e);e.parentNode.insertBefore(this.element,e)}else{this.insertBefore(this.draggable,this.element,e.nextSibling);e.parentNode.insertBefore(this.element,e.nextSibling)}this.lastMoveX=this.moveX;this.lastMoveY=this.moveY}this.log("moveDraggableVerticalOnly")};this.moveDraggable=function(e,t){var l,i,s,n,o,a;this.forEach(this.draggable,function(e,t){if(!i){a=e.getBoundingClientRect();n=!(a.right<this.moveX||a.left>this.moveX);o=!(a.bottom<this.moveY||a.top>this.moveY);if(n&&o){i=e;s=t}}}.bind(this));if(i&&this.element!==i){l=this.indexOf(this.draggable,this.element);if(Math.abs(this.lastMoveX-this.moveX)>=this.moveTolerance||Math.abs(this.lastMoveY-this.moveY)>=this.moveTolerance){if(s<=l){i.parentNode.insertBefore(this.element,i);this.insertBefore(this.draggable,this.element,i)}else if(s>l){i.parentNode.insertBefore(this.element,i.nextSibling);this.insertBefore(this.draggable,this.element,this.draggable[s+1])}this.lastMoveX=this.moveX;this.lastMoveY=this.moveY}}this.log("moveDraggable")};this.enable=function(){this.log("enable");this.root.addEventListener(this.touchMoveEvent,this.moveHandler,true);this.root.addEventListener(this.mouseMoveEvent,this.moveHandler,true);this.root.addEventListener(this.contextMenuEvent,this.contextMenuHandler,false);this.root.addEventListener(this.clickEvent,this.clickHandler,true);this.root.addEventListener(this.defaultMouseMoveEvent,this.defaultMouseMoveHandler,true);this.wrapper.addEventListener(this.scrollEvent,this.scrollHandler,false);if(this.elementsToCapture.length){var e=this;this.elementsToCapture.each(function(){this.addEventListener(e.touchStartEvent,e.startHandler,false);this.addEventListener(e.touchEndEvent,e.endHandler,false);this.addEventListener(e.touchCancelEvent,e.endHandler,false);this.addEventListener(e.mouseDownEvent,e.startHandler,false);this.addEventListener(e.mouseUpEvent,e.endHandler,false)})}else{this.elementsToCapture.addEventListener(this.touchStartEvent,this.startHandler,false);this.elementsToCapture.addEventListener(this.touchEndEvent,this.endHandler,false);this.elementsToCapture.addEventListener(this.touchCancelEvent,this.endHandler,false);this.elementsToCapture.addEventListener(this.mouseDownEvent,this.startHandler,false);this.elementsToCapture.addEventListener(this.mouseUpEvent,this.endHandler,false)}return this};this.delete=function(){this.log("delete");this.disable();this.dragCallback=null;this.onBeforeCreateClone=null;this.endCallback=null;this.startCallback=null;this.scrollCallback=null;this.doubleTapCallback=null;this.clickCallback=null;this.dragAndScrollCallback=null;delete this};this.disable=function(){this.log("disable");if(this.elementsToCapture.length){var e=this;this.elementsToCapture.each(function(){this.removeEventListener(e.touchStartEvent,e.startHandler,false);this.removeEventListener(e.touchEndEvent,e.endHandler,false);this.removeEventListener(e.touchCancelEvent,e.endHandler,false);this.removeEventListener(e.mouseDownEvent,e.startHandler,false);this.removeEventListener(e.mouseUpEvent,e.endHandler,false)})}else{this.elementsToCapture.removeEventListener(this.touchStartEvent,this.startHandler,false);this.elementsToCapture.removeEventListener(this.touchEndEvent,this.endHandler,false);this.elementsToCapture.removeEventListener(this.touchCancelEvent,this.endHandler,false);this.elementsToCapture.removeEventListener(this.mouseDownEvent,this.startHandler,false);this.elementsToCapture.removeEventListener(this.mouseUpEvent,this.endHandler,false)}this.root.removeEventListener(this.touchMoveEvent,this.moveHandler,true);this.root.removeEventListener(this.mouseMoveEvent,this.moveHandler,true);this.root.removeEventListener(this.contextMenuEvent,this.contextMenuHandler,false);this.root.removeEventListener(this.clickEvent,this.clickHandler,true);this.root.removeEventListener(this.defaultMouseMoveEvent,this.defaultMouseMoveHandler,true);this.wrapper.removeEventListener(this.scrollEvent,this.scrollHandler,false);return this};this.init(l);this.getMove=function(){return{x:this.moveX,y:this.moveY}}};return l},false);
//# sourceMappingURL=UIActions.js.map
/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/core/Element","sap/ui/dt/MutationObserver","sap/ui/dt/ElementUtil","sap/ui/dt/OverlayUtil","sap/ui/dt/DOMUtil","sap/ui/dt/ScrollbarSynchronizer","sap/ui/dt/Util","sap/base/Log","sap/ui/dt/util/ZIndexManager"],function(jQuery,e,t,i,r,s,n,o,a,l){"use strict";var h="overlay-container";var d;var c;var p=e.extend("sap.ui.dt.Overlay",{metadata:{library:"sap.ui.dt",properties:{visible:{type:"boolean",defaultValue:true},focusable:{type:"boolean",defaultValue:false},isRoot:{type:"boolean",defaultValue:false},isPartOfTemplate:{type:"boolean",defaultValue:false}},associations:{element:{type:"sap.ui.base.ManagedObject"}},aggregations:{children:{type:"sap.ui.dt.Overlay",multiple:true},designTimeMetadata:{type:"sap.ui.dt.DesignTimeMetadata",altTypes:["function","object"],multiple:false}},events:{init:{},initFailed:{},afterRendering:{},beforeDestroy:{},destroyed:{parameters:{}},visibleChanged:{parameters:{visible:"boolean"}},geometryChanged:{},childAdded:{},scrollSynced:{},isRootChanged:{parameters:{value:{type:"boolean"}}},beforeGeometryChanged:{},applyStylesRequired:{parameters:{type:{type:"string"},targetOverlay:{type:"sap.ui.dt.ElementOverlay"}}}}},constructor:function(){this._aStyleClasses=this._aStyleClasses.slice(0);this._oScrollbarSynchronizers=new Map;this._aBindParameters=[];e.apply(this,arguments);if(!this.getElement()){throw o.createError("Overlay#constructor",o.printf("Cannot create overlay without a valid element. Expected a descendant of sap.ui.core.Element or sap.ui.core.Component, but {0} was given",o.getObjectType(arguments[0].element)))}this.asyncInit().then(function(){if(this._bShouldBeDestroyed){this.fireInitFailed({error:o.createError("Overlay#asyncInit","ElementOverlay is destroyed during initialization ('"+this.getId()+"')")})}else{this._bInit=true;this.fireInit()}}.bind(this)).catch(function(e){var t=o.propagateError(e,"Overlay#asyncInit",o.printf("Can't initialize overlay (id='{0}') properly. Original error: {1}",this.getId(),o.wrapError(e).message));this.fireInitFailed({error:t})}.bind(this));this.attachEventOnce("afterRendering",function(e){var t=jQuery(e.getParameter("domRef"));this._aBindParameters.forEach(function(e){t.on(e.sEventType,e.fnProxy)})},this)},_bInit:false,_bRendered:false,_$DomRef:null,_aStyleClasses:["sapUiDtOverlay"],_bShouldBeDestroyed:false,_aBindParameters:null});p.getOverlayContainer=function(){if(!d){d=jQuery("<div></div>").attr("id",h).appendTo("body")}return d};p.removeOverlayContainer=function(){if(d){d.remove()}d=undefined};p.getMutationObserver=function(){if(!c){c=new t}return c};p.destroyMutationObserver=function(){if(c){c.destroy();c=null}};p.prototype.asyncInit=function(){return Promise.resolve()};p.prototype._getAttributes=function(){return{id:this.getId(),"data-sap-ui":this.getId(),class:this._aStyleClasses.join(" "),tabindex:this.isFocusable()?0:null}};p.prototype._renderChildren=function(){return this.getChildren().map(function(e){return e.isRendered()?e.$():e.render()})};p.prototype.render=function(e){if(this.isRendered()){return this.getDomRef()}this._$DomRef=jQuery("<div></div>").attr(this._getAttributes());this._$Children=jQuery("<div></div>").attr({class:"sapUiDtOverlayChildren"}).appendTo(this._$DomRef);this._$Children.append(this._renderChildren());this._bRendered=true;if(!e){this.fireAfterRendering({domRef:this._$DomRef.get(0)})}return this._$DomRef};p.prototype.isInit=function(){return this._bInit};p.prototype.isRendered=function(){return this._bRendered};p.prototype.isReady=function(){return this.isInit()&&this.isRendered()};p.prototype.addStyleClass=function(e){if(!this.hasStyleClass(e)){this._aStyleClasses.push(e);if(this.isReady()){this.$().addClass(e)}}};p.prototype.hasStyleClass=function(e){return this._aStyleClasses.indexOf(e)!==-1};p.prototype.removeStyleClass=function(e){if(this.hasStyleClass(e)){this._aStyleClasses=this._aStyleClasses.filter(function(t){return t!==e});if(this.isReady()){this.$().removeClass(e)}}};p.prototype.toggleStyleClass=function(e){this[(this.hasStyleClass(e)?"remove":"add")+"StyleClass"](e)};p.prototype.setElement=function(e){if(!this.getElement()){this.setAssociation("element",e);if(this._designTimeMetadataCache){this.setDesignTimeMetadata(this._designTimeMetadataCache);delete this._designTimeMetadataCache}}};p.prototype.destroy=function(){if(this.bIsDestroyed){a.error("FIXME: Do not destroy overlay twice (overlayId = "+this.getId()+")!");return}this.fireBeforeDestroy();e.prototype.destroy.apply(this,arguments)};p.prototype.exit=function(){this._oScrollbarSynchronizers.forEach(function(e){e.destroy()});this._oScrollbarSynchronizers.clear();this.$().remove();delete this._bInit;delete this._bShouldBeDestroyed;delete this._$DomRef;delete this._oScrollbarSynchronizers;this.fireDestroyed()};p.prototype.setDesignTimeMetadata=function(e){if(!this.getElement()){this._designTimeMetadataCache=e}else{this.setAggregation("designTimeMetadata",e)}};p.prototype.getDomRef=function(){return this.$().get(0)};p.prototype.getChildrenDomRef=function(){return this._$Children.get(0)};p.prototype.$=function(){return this._$DomRef||jQuery()};p.prototype.getAssociatedDomRef=function(){throw new Error("This method is abstract and needs to be implemented")};p.prototype.getElementInstance=function(){return this.getElement()};p.prototype.getElement=function(){return i.getElementInstance(this.getAssociation("element"))};p.prototype.hasFocus=function(){return document.activeElement===this.getDomRef()};p.prototype.focus=function(){this.$().trigger("focus")};p.prototype.setFocusable=function(e){e=!!e;if(this.getFocusable()!==e){this.setProperty("focusable",e);this.toggleStyleClass("sapUiDtOverlayFocusable");this.$().attr("tabindex",e?0:null)}};p.prototype.isFocusable=function(){return this.getFocusable()};p.prototype._getRenderingParent=function(){return this.isRoot()?null:this.getParent().$()};p.prototype.applyStyles=function(e,t){var i;this.fireBeforeGeometryChanged();if(!this.isRendered()||this._bIsBeingDestroyed||this.getShouldBeDestroyed()){return Promise.resolve()}if(this.getVisible()){i=this.getGeometry(!t)}var r=Promise.resolve();if(this.isVisible()){if(i&&i.visible){this._setSize(this.$(),i);var s=this._getRenderingParent();if(!this.isRoot()){var n=[];this.getParent()._oScrollbarSynchronizers.forEach(function(e){if(e.isSyncing()){n.push(new Promise(function(t){e.attachEventOnce("synced",t);e.attachEventOnce("destroyed",t)}))}});if(n.length){r=Promise.all(n).then(function(){return this._applySizes(i,s,e)}.bind(this))}else{r=this._applySizes(i,s,e)}}else{r=this._applySizes(i,s,e)}}else{this.$().css("display","none")}}else{this.$().css("display","none")}return r.catch(function(e){a.error(o.createError("Overlay#applyStyles","An error occurred during applySizes calculation: "+e))}).then(function(){this.fireGeometryChanged()}.bind(this))};p.prototype._applySizes=function(e,t,i){this._setPosition(this.$(),e,t,i);if(e.domRef){this._setZIndex(e,this.$())}var r=this.getChildren().filter(function(e){return e.isRendered()}).map(function(e){var t={};t.bForceScrollbarSync=i;return new Promise(function(i){e.attachEventOnce("geometryChanged",i);e.fireApplyStylesRequired(t)})});return Promise.all(r)};p.prototype._setZIndex=function(e,t){var i=e.domRef;var r=s.getZIndex(i);if(o.isInteger(r)){t.css("z-index",r)}else if(this.isRoot()){this._iZIndex=this._iZIndex||l.getZIndexBelowPopups();t.css("z-index",this._iZIndex)}};p.prototype._setSize=function(e,t){e.css("display","block");var i=t.size;e.css("width",i.width+"px");e.css("height",i.height+"px")};p.prototype._setPosition=function(e,t,i){var r=s.getOffsetFromParent(t,i?i.get(0):null);e.css("transform","translate("+r.left+"px, "+r.top+"px)")};p.prototype._setClipPath=function(e,t){var i=t.css("clip-path");e.css("clip-path",i)};p.prototype.attachBrowserEvent=function(e,t,i){if(e&&typeof e==="string"){if(typeof t==="function"){if(!this._aBindParameters){this._aBindParameters=[]}i=i||this;var r=t.bind(i);this._aBindParameters.push({sEventType:e,fnHandler:t,oListener:i,fnProxy:r});this.$().on(e,r)}}return this};p.prototype.detachBrowserEvent=function(e,t,i){if(e&&typeof e==="string"){if(typeof t==="function"){i=i||this;if(this._aBindParameters){var r=this.$();var s;for(var n=this._aBindParameters.length-1;n>=0;n--){s=this._aBindParameters[n];if(s.sEventType===e&&s.fnHandler===t&&s.oListener===i){this._aBindParameters.splice(n,1);r.off(e,s.fnProxy)}}}}}return this};p.prototype._deleteDummyContainer=function(e,t,i){var r=e.find(">.sapUiDtDummyScrollContainer");if(r.length){var s=this._oScrollbarSynchronizers.get(e.get(0));r.remove();s.attachEventOnce("synced",function(){s.destroy();this._oScrollbarSynchronizers.delete(e.get(0));if(t._oScrollbarSynchronizers.size===0&&!t.getChildren().some(function(e){return e._oScrollbarSynchronizers.size>0})){t.removeStyleClass("sapUiDtOverlayWithScrollBar");t.removeStyleClass("sapUiDtOverlayWithScrollBarVertical");t.removeStyleClass("sapUiDtOverlayWithScrollBarHorizontal")}}.bind(this));s.sync(i,true)}};p.prototype._handleOverflowScroll=function(e,t,i,r){var o=e.domRef;var a=e.size;var l=s.getOverflows(o);t.css("overflow-x",l.overflowX);t.css("overflow-y",l.overflowY);var h=o.scrollHeight;var d=o.scrollWidth;if(h>Math.ceil(a.height)||d>Math.ceil(a.width)){var c=t.find("> .sapUiDtDummyScrollContainer");var p;if(!c.length){c=jQuery("<div class='sapUiDtDummyScrollContainer'></div>");c.height(h);c.width(d);if(i&&s.hasVerticalScrollBar(o)&&i._hasSameSize(e,"height")){i.addStyleClass("sapUiDtOverlayWithScrollBar");i.addStyleClass("sapUiDtOverlayWithScrollBarVertical")}if(i&&s.hasHorizontalScrollBar(o)&&i._hasSameSize(e,"width")){i.addStyleClass("sapUiDtOverlayWithScrollBar");i.addStyleClass("sapUiDtOverlayWithScrollBarHorizontal")}t.append(c);p=new n({synced:this.fireScrollSynced.bind(this)});p.addTarget(o,t.get(0));this._oScrollbarSynchronizers.set(t.get(0),p)}else{c.css({height:h,width:d});p=this._oScrollbarSynchronizers.get(t.get(0));if(!p.hasTarget(o)){p.addTarget(o)}}if(r){p.sync(o,true)}}else{this._deleteDummyContainer(t,i,o)}};p.prototype.getGeometry=function(e){if(e||!this._mGeometry){var t=this.getAssociatedDomRef();var i;if(t){var n=this.isRoot();i=jQuery.makeArray(t).map(function(e){return s.getGeometry(e,n)})}else{i=this.getChildren().map(function(e){return e.getGeometry(true)})}if(i.length){this._mGeometry=i.length>1?r.getGeometry(i):i[0]}else{delete this._mGeometry}}return this._mGeometry};p.prototype.setVisible=function(e){e=!!e;if(this.getVisible()!==e){this.setProperty("visible",e);this.$().css("visibility",e?"":"hidden");this.fireVisibleChanged({visible:e})}};p.prototype.isVisible=function(){return this.getVisible()&&(this.isRoot()?true:this.getParent().isVisible())};p.prototype.setIsRoot=function(e){e=!!e;if(this.getIsRoot()!==e){this.setProperty("isRoot",e);this.fireIsRootChanged({value:e})}};p.prototype.isRoot=function(){return this.getIsRoot()};p.prototype.getShouldBeDestroyed=function(){return this._bShouldBeDestroyed};return p});
//# sourceMappingURL=Overlay.js.map
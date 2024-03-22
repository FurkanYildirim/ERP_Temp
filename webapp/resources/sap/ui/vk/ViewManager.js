/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/core/Element","./Core","./Scene","sap/ui/core/Core"],function(e,t,i,n){"use strict";var a=e.extend("sap.ui.vk.ViewManager",{metadata:{library:"sap.ui.vk",associations:{contentConnector:{type:"sap.ui.vk.ContentConnector"},animationPlayer:{type:"sap.ui.vk.AnimationPlayer"}}},constructor:function(i,n){e.apply(this,arguments);this._scene=null;this._activeView=null;this._cancelPlayingViewGroup=false;t.observeLifetime(this);t.observeAssociations(this)}});a.prototype._setScene=function(e){if(this._scene!==e){this._scene=e;if(e){var t=e.getInitialView();if(t){this.activateView(t,true,true)}}}return this};a.prototype.getActiveView=function(){return this._activeView};a.prototype._getNextView=function(e,t){var i=this._scene;if(!t){t=i.findViewGroupByView(e)}var n;var a=-1;if(!t){n=i.getViews();a=n.indexOf(e)}else{n=t.getViews();a=t.indexOfView(e)}if(a<0){return undefined}else if(a>=n.length-1){return undefined}a++;return n[a]};a.prototype._setContent=function(e){var t=null;if(e&&e instanceof i){t=e}this._setScene(t)};a.prototype.onSetContentConnector=function(e){e.attachContentReplaced(this._onContentReplaced,this);this._setContent(e.getContent())};a.prototype.onUnsetContentConnector=function(e){this._setContent(null);e.detachContentReplaced(this._onContentReplaced,this)};a.prototype._onContentReplaced=function(e){this._setContent(e.getParameter("newContent"))};a.prototype.activateView=function(e,t,i){if(i==null){i=false}if(t==null){t=false}return this._activateView(e,null,t,i,false)};a.prototype.playViewGroup=function(e,t,i){this._cancelPlayingViewGroup=false;if(e===this.getActiveView()){var a=n.byId(this.getAnimationPlayer());if(a){if(a.getTime()>=a.getTotalDuration()){a.setTime(0)}}return this._play(e,t,true,i)}this._activateView(e,t,false,false,true,i);return this};a.prototype.stopPlayingViewGroup=function(){this._cancelPlayingViewGroup=true;var e=n.byId(this.getAnimationPlayer());if(e){e.stop()}return this};a.prototype._play=function(e,i,a,o){var s=t.getEventBus();var r=n.byId(this.getAnimationPlayer());var u=r!=null&&e.hasAnimation()&&e.getAutoPlayAnimation();if(a){var c=function(){if(this._cancelPlayingViewGroup){return}var t=this._getNextView(e,i);if(t){this._activateView(t,i,false,false,a)}else{s.publish("sap.ui.vk","procedureFinished")}}.bind(this);var l=function(e,t,i){if(i.source!==r){return}if(i.stopped){s.unsubscribe("sap.ui.vk","animationPlayStateChanged",l,this);if(i.endOfAnimation){c()}}};if(u){s.subscribe("sap.ui.vk","animationPlayStateChanged",l,this)}else{setTimeout(c,o)}}if(u){r.play()}};a.prototype._activateView=function(e,i,a,o,s,r){var u=n.byId(this.getAnimationPlayer());if(u){u.stop()}this._cancelPlayingViewGroup=false;var c=this;return new Promise(function(n,u){var l=t.getEventBus();c._activeView=e;var p=function(t,a,u){if(u.view!==e){return}l.unsubscribe("sap.ui.vk","readyForAnimation",p,c);if(!c._cancelPlayingViewGroup&&!o){c._play(e,i,s,r)}n({view:e})};l.subscribe("sap.ui.vk","readyForAnimation",p,c);l.publish("sap.ui.vk","activateView",{source:c,view:e,skipCameraTransitionAnimation:a,playViewGroup:s})})};return a});
//# sourceMappingURL=ViewManager.js.map
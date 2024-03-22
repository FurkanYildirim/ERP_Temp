/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/
sap.ui.define(["../ViewStateManager","../../thirdparty/three","../../cssColorToColor","../../colorToCSSColor","../../abgrToColor","../../colorToABGR","../ThreeUtils"],function(e,t,i,r,o,n,s){"use strict";var a=new t.Color(12632064);var l;var h=e.extend("sap.ui.vk.threejs.v2.ViewStateManager",{metadata:{library:"sap.ui.vk"}});var c=h.getMetadata().getParent().getClass().prototype;h.prototype.init=function(){if(c.init){c.init.call(this)}this._nodeHierarchy=null;this._nodeStates=new Map;this._selectedNodes=new Set;this._outlinedNodes=new Set;this.setOutlineColor("rgba(255, 0, 255, 1.0)");this.setOutlineWidth(1);this._materialCache=new l;this._showSelectionBoundingBox=true;this._boundingBoxesScene=new t.Scene};h.prototype.exit=function(){this._clearNodeStates();this._selectedNodes.clear();this._outlinedNodes.clear();if(this._boundingBoxesScene){this._clearBoundingBoxScene();this._boundingBoxesScene=null}this._nodeHierarchy=null;if(c.exit){c.exit.call(this)}};h.prototype._clearBoundingBoxScene=function(){var e=[];var t=[];s.getAllTHREENodes([this._boundingBoxesScene],e,t);e.forEach(function(e){s.disposeObject(e);e.parent.remove(e)});t.forEach(function(e){e.parent.remove(e)})};h.prototype._clearNodeStates=function(){var e=this._nodeStates;e.forEach(function(e,t){if(e.material!=null){s.disposeMaterial(e.material)}if(e.boundingBoxNode){s.disposeObject(e.boundingBoxNode)}},this);e.clear()};h.prototype._setScene=function(e){this._clearNodeStates();if(this._boundingBoxesScene){this._clearBoundingBoxScene()}this._boundingBoxesScene=new t.Scene;this._setNodeHierarchy(e?e.getDefaultNodeHierarchy():null);if(e){e.setViewStateManager(this)}this._scene=e;if(this._scene){var i=this._scene.getInitialView();if(i){this.activateView(i)}}return this};h.prototype._setNodeHierarchy=function(e){var t=this._nodeHierarchy;if(this._nodeHierarchy){this._nodeHierarchy.detachNodeReplaced(this._handleNodeReplaced,this);this._nodeHierarchy.detachNodeUpdated(this._handleNodeUpdated,this);this._nodeHierarchy.detachNodeRemoving(this._handleNodeRemoving,this);this._nodeHierarchy=null;this._clearNodeStates();this._selectedNodes.clear();this._outlinedNodes.clear();this._visibilityTracker.clear()}if(e){this._nodeHierarchy=e;this._nodeHierarchy.attachNodeReplaced(this._handleNodeReplaced,this);this._nodeHierarchy.attachNodeUpdated(this._handleNodeUpdated,this);this._nodeHierarchy.attachNodeRemoving(this._handleNodeRemoving,this);var i=[];var r=[];e.getSceneRef().traverse(function(e){(e.visible?i:r).push(e)});this.fireVisibilityChanged({visible:i,hidden:r})}if(e!==t){this.fireNodeHierarchyReplaced({oldNodeHierarchy:t,newNodeHierarchy:e})}return this};h.prototype._handleNodeReplaced=function(e){var t=e.getParameter("ReplacedNodeRef");var i=e.getParameter("ReplacementNodeRef");if(this.getSelectionState(t)){this.setSelectionState(i,true);this.setSelectionState(t,false)}};h.prototype._handleNodeUpdated=function(e){var t=e.getParameter("nodeRef");if(this.getSelectionState(t)){this.setSelectionState(t,false);this.setSelectionState(t,true)}};h.prototype._handleNodeRemoving=function(e){var t=e.getParameter("nodeRef");if(this.getSelectionState(t)){this.setSelectionState(t,false,true,true)}};h.prototype._renderOutline=function(e,t,i){};h.prototype.resetNodeProperty=function(e,t){};h.prototype.resetVisibility=function(){var e=[];var t=[];this._nodeStates.forEach(function(i,r){var o=i.visible;if(o===true){t.push(r)}else if(o===false){e.push(r)}i.visible=null});this._deleteUnusedNodeStates();this._visibilityTracker.clear();this.fireVisibilityChanged({visible:e,hidden:t});return this};h.prototype.getVisibilityState=function(e){if(Array.isArray(e)){var t=[];this._nodeStates.forEach(function(e,i){t.push(f(i,e))});return t}else{var i=this._getNodeState(e,false);return f(e,i)}};h.prototype.setVisibilityState=function(e,t,i,r){if(!Array.isArray(e)){e=[e]}var o=Array.isArray(t);var n=[];var s=e;if(i){s=[];e.forEach(function(e,i){var r=this._collectNodesRecursively(e);s=s.concat(r);var a=n.length;n.length+=r.length;n.fill(o?t[i]:t,a)},this)}else if(!o){n.length=s.length;n.fill(t)}else{n=t}if(r){var a=[];s.forEach(function(e,t){var i=n[t];if(i){for(var r=e;r&&!r.isScene;r=r.parent){a.push(r)}}});s=s.concat(a);var l=n.length;n.length+=a.length;n.fill(true,l)}var h=[];var c=new Set;var u=s.filter(function(e,t){if(c.has(e)){return false}c.add(e);var i=this._getNodeState(e,false);var r=f(e,i);var o=n[t];var s=r!==o;if(s){h.push(o)}return s},this);if(u.length>0){this._applyVisibilityNodeState(u,h);this._deleteUnusedNodeStates();var d={visible:[],hidden:[]};u.forEach(function(e,t){d[h[t]?"visible":"hidden"].push(e)});if(this.getShouldTrackVisibilityChanges()){u.forEach(this._visibilityTracker.trackNodeRef,this._visibilityTracker)}this.fireVisibilityChanged(d)}return this};h.prototype.enumerateSelection=function(e){this._selectedNodes.forEach(e);return this};h.prototype.enumerateOutlinedNodes=function(e){this._outlinedNodes.forEach(e);return this};h.prototype.getSelectionState=function(e){var t=this._selectedNodes.has.bind(this._selectedNodes);return Array.isArray(e)?e.map(t):t(e)};h.prototype._addBoundingBox=function(e){var i=this._getNodeState(e,true);if(i.boundingBoxNode==null){var r=new t.Box3;s.computeObjectOrientedBoundingBox(e,r);var o=new t.Box3Helper(r,a);this._boundingBoxesScene.add(o);o.parent=e;i.boundingBoxNode=o}else{}return this};h.prototype._removeBoundingBox=function(e){var t=this._getNodeState(e,false);if(t!=null&&t.boundingBoxNode!=null){this._boundingBoxesScene.remove(t.boundingBoxNode);s.disposeObject(t.boundingBoxNode);t.boundingBoxNode=null}else{}return this};h.prototype._expandBoundingBoxWithSelected=function(e){this._selectedNodes.forEach(function(t){t._expandBoundingBox(e,false,false,false)})};h.prototype._updateBoundingBoxes=function(){var e=this._nodeStates;this._selectedNodes.forEach(function(t){var i=e.get(t);if(i!=null&&i.boundingBoxNode!=null){s.computeObjectOrientedBoundingBox(t,i.boundingBoxNode.box)}else{}});return this};h.prototype.setShowSelectionBoundingBox=function(e){this._showSelectionBoundingBox=e;this._selectedNodes.forEach(e?this._addBoundingBox:this._removeBoundingBox,this);this.fireSelectionChanged({selected:this._selectedNodes,unselected:[]});return this};h.prototype.getShowSelectionBoundingBox=function(){return this._showSelectionBoundingBox};h.prototype.setSelectionState=function(e,t,i,r){if(!e){return this}if(!Array.isArray(e)){e=[e]}e=(i||this.getRecursiveSelection()?this._collectNodesRecursively(e):e).filter(function(e,t,i){return i.indexOf(e)===t});if(this.getRecursiveSelection()&&!t){e=this._nodeHierarchy._appendAncestors(e)}var o=this._selectedNodes;var n=e.filter(function(e){return o.has(e)!==t},this);if(n.length>0){this._applySelectionNodeState(n,t);if(!t){this._deleteUnusedNodeStates()}this._updateNodeStateMaterials();if(!r){this.fireSelectionChanged({selected:t?n:[],unselected:t?[]:n})}}return this};h.prototype.setSelectionStates=function(e,t,i,r){if(!Array.isArray(e)){e=[e]}if(!Array.isArray(t)){t=[t]}e=i||this.getRecursiveSelection()?this._collectNodesRecursively(e):e;t=i||this.getRecursiveSelection()?this._collectNodesRecursively(t):t;if(this.getRecursiveSelection()){t=this._nodeHierarchy._appendAncestors(t,e)}var o=e.filter(function(e){return this._selectedNodes.has(e)===false},this);var n=t.filter(function(e){return this._selectedNodes.has(e)===true},this);if(o.length>0||n.length>0){this._applySelectionNodeState(o,true);this._applySelectionNodeState(n,false);if(n.length>0){this._deleteUnusedNodeStates()}this._updateNodeStateMaterials();if(!r){this.fireSelectionChanged({selected:o,unselected:n})}}return this};h.prototype.setOutlineColor=function(e){switch(typeof e){case"number":this._outlineColorABGR=e;break;case"string":if(sap.ui.core.CSSColor.isValid(e)){this._outlineColorABGR=n(i(e))}break;default:return this}this.fireOutlineColorChanged({outlineColor:r(o(this._outlineColorABGR)),outlineColorABGR:this._outlineColorABGR});return this};h.prototype.getOutlineColor=function(e){return e?this._outlineColorABGR:r(o(this._outlineColorABGR))};h.prototype.getOutliningState=function(e){var t=this._outlinedNodes;function i(e){return t.has(e)}return Array.isArray(e)?e.map(i):i(e)};h.prototype.setOutliningStates=function(e,t,i,r){if(!Array.isArray(e)){e=[e]}if(!Array.isArray(t)){t=[t]}e=i||this.getRecursiveOutlining()?this._collectNodesRecursively(e):e;t=i||this.getRecursiveOutlining()?this._collectNodesRecursively(t):t;if(this.getRecursiveOutlining()){t=this._nodeHierarchy._appendAncestors(t,e)}var o=e.filter(function(e){return this._outlinedNodes.has(e)===false},this);var n=t.filter(function(e){return this._outlinedNodes.has(e)===true},this);if(o.length>0||n.length>0){o.forEach(function(e){this._outlinedNodes.add(e)},this);n.forEach(function(e){this._outlinedNodes.delete(e)},this);if(!r){this.fireOutliningChanged({outlined:o,unoutlined:n})}}return this};h.prototype.setOutlineWidth=function(e){this._outlineWidth=e;this.fireOutlineWidthChanged({width:e});return this};h.prototype.getOutlineWidth=function(){return this._outlineWidth};h.prototype._getOpacity=function(e){var t=this._getNodeState(e,false);return t!=null?t._opacity:null};h.prototype.getOpacity=function(e){if(Array.isArray(e)){return e.map(this._getOpacity,this)}else{return this._getOpacity(e)}};h.prototype.setOpacity=function(e,t,i){if(!Array.isArray(e)){e=[e]}var r=Array.isArray(t);var o=[];var n=e;if(i){n=[];e.forEach(function(e,i){var s=this._collectNodesRecursively(e);n=n.concat(s);var a=o.length;o.length+=s.length;o.fill(r?t[i]:t,a)},this)}else if(!r){o.length=n.length;o.fill(t)}else{o=t}var s=[];var a=new Set;var l=n.filter(function(e,t){if(a.has(e)){return false}a.add(e);var i=this._getNodeState(e,false);var r=o[t];var n=i==null&&r!=null||i!=null&&i.opacity!==r;if(n){s.push(r)}return n},this);if(l.length>0){this._applyOpacityNodeState(l,s);this._deleteUnusedNodeStates();this._updateNodeStateMaterials();var h={changed:l,opacity:r?s:s[0]};this.fireOpacityChanged(h)}return this};h.prototype._getTintColorABGR=function(e){var t=this._getNodeState(e,false);return t&&t.tintColor};h.prototype._getTintColor=function(e){var t=this._getTintColorABGR(e);return t!=null?r(o(t)):null};h.prototype.getTintColor=function(e,t){var i=t?this._getTintColorABGR:this._getTintColor;if(Array.isArray(e)){return e.map(i,this)}else{return i.call(this,e)}};function u(e){switch(typeof e){case"number":return e;case"string":return sap.ui.core.CSSColor.isValid(e)?n(i(e)):null;default:return null}}h.prototype.setTintColor=function(e,t,i){if(!Array.isArray(e)){e=[e]}var r=Array.isArray(t);var o=[];var n=e;if(i){n=[];e.forEach(function(e,i){var s=this._collectNodesRecursively(e);n=n.concat(s);var a=o.length;o.length+=s.length;o.fill(r?t[i]:t,a)},this)}else if(!r){o.length=n.length;o.fill(t)}else{o=t}var s=[];var a=[];var l=new Set;var h=n.filter(function(e,t){if(l.has(e)){return false}l.add(e);var i=this._getNodeState(e,false);var r=o[t];var n=u(o[t]);var h=i==null&&r!=null||i!=null&&i.tintColor!==n;if(h){s.push(r);a.push(n)}return h},this);if(h.length>0){this._applyTintColorNodeState(h,a);this._deleteUnusedNodeStates();this._updateNodeStateMaterials();var c={changed:h,tintColor:r?s:s[0],tintColorABGR:r?a:a[0]};this.fireTintColorChanged(c)}return this};h.prototype.setHighlightColor=function(e){switch(typeof e){case"number":this._highlightColorABGR=e;break;case"string":if(sap.ui.core.CSSColor.isValid(e)){this._highlightColorABGR=n(i(e))}break;default:return this}if(this._selectedNodes.size>0){this._nodeStates.forEach(function(e){if(e.selected||e.ancestorSelected){e.needsMaterialUpdate=true}})}this.fireHighlightColorChanged({highlightColor:r(o(this._highlightColorABGR)),highlightColorABGR:this._highlightColorABGR});return this};h.prototype._getNodeState=function(e,t){var i=this._nodeStates;var r=i.get(e);if(r==null&&t){r={visible:null,originalVisible:null,selected:false,ancestorSelected:false,tintColor:null,ancestorTintColor:null,opacity:null,ancestorOverridesOpacity:false,boundingBoxNode:null,material:null,originalMaterial:null,needsMaterialUpdate:false};i.set(e,r)}return r};h.prototype._deleteUnusedNodeStates=function(){var e=this._materialCache;this._nodeStates.forEach(function(t,i,r){if(t.visible==null&&!t.selected&&!t.ancestorSelected&&t.tintColor==null&&t.ancestorTintColor==null&&t.opacity==null&&!t.ancestorOverridesOpacity){r.delete(i);if(t.material!=null){e.releaseMaterial(t.material)}}});return this};h.prototype._applyVisibilityNodeState=function(e,t){e.forEach(function(e,i){var r=t[i];var o=e.visible;var n=r!==o;var s=this._getNodeState(e,n);if(s){if(n){s.visible=r}else{s.visible=null}}},this)};h.prototype._applySelectionNodeState=function(e,t){if(t){e.forEach(function(e){this._selectedNodes.add(e);if(this._showSelectionBoundingBox){this._addBoundingBox(e)}var t=this._getNodeState(e,true);var i=d(t);t.selected=true;if(d(t)!==i){t.needsMaterialUpdate=true}if(!t.ancestorSelected){e.children.forEach(this._setAncestorSelectedRecursively.bind(this,true),this)}},this)}else{e.forEach(function(e){this._selectedNodes.delete(e);if(this._showSelectionBoundingBox){this._removeBoundingBox(e)}var t=this._getNodeState(e,false);if(t!=null){var i=d(t);t.selected=false;if(d(t)!==i){t.needsMaterialUpdate=true}if(!t.ancestorSelected){e.children.forEach(this._setAncestorSelectedRecursively.bind(this,false),this)}}},this)}return this};h.prototype._setAncestorSelectedRecursively=function(e,t){var i=this._getNodeState(t,e);if(i!=null&&i.ancestorSelected!==e){var r=d(i);i.ancestorSelected=e;if(d(i)!==r){i.needsMaterialUpdate=true}if(!i.selected){t.children.forEach(this._setAncestorSelectedRecursively.bind(this,e),this)}}return this};h.prototype._applyTintColorNodeState=function(e,t){e.forEach(function(e,i){var r=t[i];var o=this._getNodeState(e,r!=null);if(o!=null){o.tintColor=r;o.needsMaterialUpdate=true;e.children.forEach(this._setAncestorTintColorRecursively.bind(this,r!=null?r:o.ancestorTintColor),this)}},this);return this};h.prototype._setAncestorTintColorRecursively=function(e,t){var i=this._getNodeState(t,e!=null);if(i!=null&&i.ancestorTintColor!==e){var r=p(i);i.ancestorTintColor=e;if(p(i)!==r){i.needsMaterialUpdate=true}if(i.tintColor==null){t.children.forEach(this._setAncestorTintColorRecursively.bind(this,e),this)}}return this};h.prototype._applyOpacityNodeState=function(e,t){e.forEach(function(e,i){var r=t[i];var o=this._getNodeState(e,r!=null);if(o!=null){o.opacity=r;o.needsMaterialUpdate=true;e.children.forEach(this._setAncestorOverridesOpacityRecursively.bind(this,r!=null),this)}},this);return this};h.prototype._setAncestorOverridesOpacityRecursively=function(e,t){var i=this._getNodeState(t,e);if(i!=null){i.ancestorOverridesOpacity=e;i.needsMaterialUpdate=true;t.children.forEach(this._setAncestorOverridesOpacityRecursively.bind(this,i.opacity!=null||e),this)}return this};h.prototype._computeWorldOpacity=function(e,t){if(t==null){t=this._getNodeState(e,false)}var i=t&&t.opacity;if(i==null){var r=e.userData;i=r&&r.opacity;if(i==null){i=1}}var o=e.parent;if(o==null){return i}else{return i*this._computeWorldOpacity(o)}};h.prototype._updateNodeStateMaterials=function(){var e=this._materialCache;var i=this.getHighlightColor(true);var r=o(i);var n=new t.Color(r.red/255,r.green/255,r.blue/255);this._nodeStates.forEach(function(s,a){if(s.needsMaterialUpdate&&a.material!=null){if(s.material==null){s.material=e.cloneMaterial(a.material)}else{s.material.color.copy(a.material.color)}var l=s.material;var h;var c=p(s);if(c!=null){h=o(c);l.color.lerp(new t.Color(h.red/255,h.green/255,h.blue/255),h.alpha);if(l.emissive!=null){if(l.userData.defaultHighlightingEmissive){l.emissive.copy(l.userData.defaultHighlightingEmissive)}else{l.emissive.copy(t.Object3D.prototype.defaultEmissive)}}if(l.specular!=null){if(l.userData.defaultHighlightingSpecular){l.specular.copy(l.userData.defaultHighlightingSpecular)}else{l.specular.copy(t.Object3D.prototype.defaultSpecular)}}}if(s.selected||s.ancestorSelected){l.color.lerp(n,r.alpha);if(l.emissive!=null&&i!==0){if(l.userData.defaultHighlightingEmissive){l.emissive.copy(l.userData.defaultHighlightingEmissive)}else{l.emissive.copy(t.Object3D.prototype.defaultEmissive)}}if(l.specular!=null&&i!==0){if(l.userData.defaultHighlightingSpecular){l.specular.copy(l.userData.defaultHighlightingSpecular)}else{l.specular.copy(t.Object3D.prototype.defaultSpecular)}}}var u=this._computeWorldOpacity(a,s);l.opacity=u;l.transparent=u<1}s.needsMaterialUpdate=false},this);return this};h.prototype.applyNodeStates=function(){this._nodeStates.forEach(function(e,t){if(e.material!=null){e.originalMaterial=t.material;t.material=e.material}if(e.visible!=null){e.originalVisible=t.visible;t.visible=e.visible}})};h.prototype.revertNodeStates=function(){this._nodeStates.forEach(function(e,t){if(e.originalMaterial){t.material=e.originalMaterial;e.originalMaterial=null}if(e.originalVisible!=null){t.visible=e.originalVisible;e.originalVisible=null}})};function d(e){return e!=null&&(e.selected||e.ancestorSelected)}function f(e,t){var i=t&&t.visible;return i!=null?i:e.visible}function p(e){return e.tintColor||e.ancestorTintColor}l=function(){};l.prototype.cloneMaterial=function(e,t){return e.clone()};l.prototype.releaseMaterial=function(e){s.disposeMaterial(e);return this};return h});
//# sourceMappingURL=ViewStateManager.js.map
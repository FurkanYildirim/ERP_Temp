/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../thirdparty/three","./Gizmo","./ScaleToolGizmoRenderer","./CoordinateSystem","./AxisColours","../AnimationTrackType","sap/base/assert","sap/base/Log"],function(e,t,i,o,r,a,n,s){"use strict";var l=t.extend("sap.ui.vk.tools.ScaleToolGizmo",{metadata:{library:"sap.ui.vk"}});l.prototype.init=function(){if(t.prototype.init){t.prototype.init.apply(this)}this._createEditingForm(null,64);this._gizmoIndex=-1;this._handleIndex=-1;this._value=(new e.Vector3).setScalar(1);this._scaleDelta=(new e.Vector3).setScalar(1);this._viewport=null;this._tool=null;this._nonUniformScaleEnabled=false;this._sceneGizmo=new e.Scene;var i=new e.DirectionalLight(16777215,.5);i.position.set(1,3,2);this._sceneGizmo.add(i);this._sceneGizmo.add(new e.AmbientLight(16777215,.5));this._gizmo=new e.Group;this._touchAreas=new e.Group;this._sceneGizmo.add(this._gizmo);this._coordinateSystem=o.World;this._nodes=[];this._matViewProj=new e.Matrix4;this._gizmoSize=96;var a=96,n=16/a,s=48/a;function l(t,i,o){var r=(new e.Matrix4).makeBasis(new e.Vector3(t.y,t.z,t.x),t,new e.Vector3(t.z,t.x,t.y));var l=new e.BoxGeometry(n,n,n);l.applyMatrix4(r);var c=new e.MeshLambertMaterial({color:i,transparent:true});var h=new e.Mesh(l,c);h.userData.color=i;if(t){h.position.copy(t);var d=1/a;var u=new e.CylinderGeometry(d,d,1,4);r.setPosition(t.clone().multiplyScalar(-.5));u.applyMatrix4(r);var f=new e.Mesh(u,c);f.renderOrder=1;h.add(f);r.setPosition(t)}var _=new e.BoxGeometry(s,s,s);_.applyMatrix4(r);o.add(new e.Mesh(_,c));return h}function c(t,i,o){var r=new e.BufferGeometry;var a=new Float32Array(6);a[t]=a[i+3]=.7;r.setAttribute("position",new e.Float32BufferAttribute(a,3));var n=new Float32Array(6);n[t]=n[i+3]=1;r.setAttribute("color",new e.Float32BufferAttribute(n,3));var s=new e.Line(r,new e.LineBasicMaterial({vertexColors:true,transparent:true,linewidth:window.devicePixelRatio}));s.userData.colors=n;var l=new e.BufferGeometry;var c=new Float32Array(9);c[3+t]=c[6+i]=.7;l.setAttribute("position",new e.Float32BufferAttribute(c,3));l.setIndex([0,1,2]);var h=new e.Mesh(l,new e.MeshBasicMaterial({color:16776960,opacity:.5,transparent:true,side:e.DoubleSide,visible:false}));h.renderOrder=1;s.add(h);o.add(h.clone());return s}this._gizmo.add(l(new e.Vector3(1,0,0),r.x,this._touchAreas));this._gizmo.add(l(new e.Vector3(0,1,0),r.y,this._touchAreas));this._gizmo.add(l(new e.Vector3(0,0,1),r.z,this._touchAreas));this._gizmo.add(c(1,2,this._touchAreas));this._gizmo.add(c(2,0,this._touchAreas));this._gizmo.add(c(0,1,this._touchAreas));n-=.1/a;var h=new e.MeshLambertMaterial({color:12632256,transparent:true});this._gizmo.add(new e.Mesh(new e.BoxGeometry(n,n,n),h));this._touchAreas.add(new e.Mesh(new e.BoxGeometry(s,s,s),new e.MeshBasicMaterial));this._axisTitles=this._createAxisTitles();this._sceneGizmo.add(this._axisTitles);this._updateGizmoPartVisibility()};l.prototype.hasDomElement=function(){return true};l.prototype._updateGizmoPartVisibility=function(){var e=this._coordinateSystem===o.Screen;var t=this._gizmo.children,i=this._touchAreas.children;t[2].visible=i[2].visible=!e;t[3].visible=t[4].visible=i[3].visible=i[4].visible=!e&&this._nonUniformScaleEnabled;t[5].visible=i[5].visible=this._nonUniformScaleEnabled;this._axisTitles.children[2].visible=!e};l.prototype.resetValues=function(){this._value.setScalar(1)};l.prototype.setCoordinateSystem=function(e){this._coordinateSystem=e;this._gizmoIndex=this._handleIndex=-1;this._updateGizmoPartVisibility()};l.prototype.setNonUniformScaleEnabled=function(e){this._nonUniformScaleEnabled=!!e;this._updateGizmoPartVisibility()};l.prototype.show=function(e,t){this._viewport=e;this._tool=t;this._nodes.length=0;this._sequence=null;this._updateSelection(e._viewStateManager);var i=this._getNodesProperties();this._tool.fireEvent("scaling",{x:0,y:0,z:0,nodesProperties:i},true)};l.prototype.hide=function(){this._cleanTempData();this._viewport=null;this._tool=null;this._gizmoIndex=this._handleIndex=-1;this._sequence=null;this._updateEditingForm(false)};l.prototype.getGizmoCount=function(){if(this._coordinateSystem===o.Local||this._coordinateSystem===o.Parent){return this._nodes.length}else{return this._nodes.length>0?1:0}};l.prototype.getTouchObject=function(e){if(this._nodes.length===0){return null}this._updateGizmoObjectTransformation(this._touchAreas,e);return this._touchAreas};var c=[1,2,4,6,5,3];l.prototype.highlightHandle=function(e,t){var i=e===6||e>=0&&!this._nonUniformScaleEnabled;var o,r;for(o=0;o<3;o++){r=this._gizmo.children[o];var a=i||c[e]&1<<o;var n=a?16776960:r.userData.color;r.material.color.setHex(n);r.children[0].material.color.setHex(n);r.children[0].material.opacity=r.material.opacity=a||t?1:.35;var s=this._axisTitles.children[o];s.material.color.setHex(n);s.material.opacity=a||t?1:.35}for(o=3;o<6;o++){r=this._gizmo.children[o];var l=r.geometry.attributes.color;l.copyArray(i||o===e?[1,1,0,1,1,0]:r.userData.colors);l.needsUpdate=true;r.material.opacity=t||o===e?1:.35;r.children[0].material.visible=o===e}r=this._gizmo.children[6];r.material.color.setHex(i?16776960:12632256);r.material.opacity=i||t?1:.35};l.prototype.selectHandle=function(e,t){this._gizmoIndex=t;this._handleIndex=e;if(this._tool.getAutoResetValues()){this.resetValues()}this._viewport.setShouldRenderFrame()};l.prototype.beginGesture=function(){this._beginValue=this._value.clone();this._scaleDelta.setScalar(1);this._matOrigin=this._gizmo.matrixWorld.clone();this._nodes.forEach(function(t){t.scaleOrigin=t.node.scale.clone();t.matOrigin=t.node.matrixWorld.clone();if(t.node.parent){t.matParentInv=(new e.Matrix4).copy(t.node.parent.matrixWorld).invert()}else{t.matParentInv=new e.Matrix4}})};l.prototype._prepareForCreatingScaleKey=function(e){this._sequence=e};l.prototype._printEventInfo=function(e,t,i,o,r){s.debug(e+" is fired:"+" x = "+t+"; y = "+i+"; z = "+o);r.forEach(function(e){s.debug("Node: "+e.node.name);if(e.offsetToRest){s.debug("offsetToRest: [ "+e.offsetToRest[0]+", "+e.offsetToRest[1]+", "+e.offsetToRest[2]+" ] ")}else{s.debug("offsetToRest: null")}if(e.offsetToPrevious){s.debug("offsetToPrevious: [ "+e.offsetToPrevious[0]+", "+e.offsetToPrevious[1]+", "+e.offsetToPrevious[2]+" ] ")}else{s.debug("offsetToPrevious: null")}if(e.absolute){s.debug("absolute: [ "+e.absolute[0]+", "+e.absolute[1]+", "+e.absolute[2]+" ] ")}else{s.debug("absolute: null")}if(e.world){s.debug("world: [ "+e.world[0]+", "+e.world[1]+", "+e.world[2]+" ] ")}else{s.debug("world: null")}if(e.restDifference){s.debug("restDifference: [ "+e.restDifference[0]+", "+e.restDifference[1]+", "+e.restDifference[2]+" ] ")}else{s.debug("restDifference: null")}if(e.restDifferenceInCoordinates){s.debug("restDifferenceInCoordinates: [ "+e.restDifferenceInCoordinates[0]+", "+e.restDifferenceInCoordinates[1]+", "+e.restDifferenceInCoordinates[2]+" ] ")}else{s.debug("restDifferenceInCoordinates: null")}})};l.prototype._getNodesProperties=function(){var t=[];this._nodes.forEach(function(i){var r=i.node;var n={};n.node=r;var s=this._viewport._viewStateManager.getRelativeTransformation(r);n.offsetToRest=[s.scale[0],s.scale[1],s.scale[2]];n.offsetToPrevious=n.offsetToRest.slice();var l=this._getEffectiveParent(r);if(l!==r.parent){if(r.userData.skipUpdateJointNode){this._viewport._viewStateManager._setJointNodeOffsets(r,a.Scale)}if(r.userData&&r.userData.offsetScale){n.offsetToRest=r.userData.offsetScale.slice()}else{n.offsetToRest=[1,1,1]}n.offsetToPrevious=n.offsetToRest.slice();if(r.userData.skipUpdateJointNode){r.userData.skipUpdateJointNode=false;this._viewport._viewStateManager._setJointNodeMatrix();r.userData.skipUpdateJointNode=true}}if(this._playback){var c=this._viewport._viewStateManager._getEndPropertyInPreviousPlayback(r,a.Scale,this._playback);if(c){n.offsetToPrevious[0]/=c[0];n.offsetToPrevious[1]/=c[1];n.offsetToPrevious[2]/=c[2]}}var h=this._viewport._viewStateManager.getTransformation(r);n.absolute=[h.scale[0],h.scale[1],h.scale[2]];var d=this._viewport._viewStateManager.getTransformationWorld(r);n.world=d.scale;var u;if(this._nodeUserDataMap){u=this._nodeUserDataMap.get(r)}if(!i.matParentInv){i.matParentInv=(new e.Matrix4).copy(r.parent.matrixWorld).invert()}var f=new e.Matrix4;if(this._gizmo){f=this._gizmo.matrixWorld.clone()}var _=new e.Vector3;var p,m,v;if(u&&u.initialScale){n.restDifference=[h.scale[0]/u.initialScale[0],h.scale[1]/u.initialScale[1],h.scale[2]/u.initialScale[2]];v=new e.Vector3(n.restDifference[0],n.restDifference[1],n.restDifference[2]);var g=new e.Quaternion(h.quaternion[0],h.quaternion[1],h.quaternion[2],h.quaternion[3]);var y=(new e.Matrix4).makeRotationFromQuaternion(g);var w=(new e.Matrix4).makeRotationFromQuaternion(u.initialQuaternion);var x=new e.Vector3;var z=new e.Vector3;var b=new e.Vector3;y.extractBasis(x,z,b);var S=new e.Vector3;var M=new e.Vector3;var D=new e.Vector3;w.extractBasis(S,M,D);if(x.dot(S)<0){n.restDifference[0]=-n.restDifference[0]}if(z.dot(M)<0){n.restDifference[1]=-n.restDifference[1]}if(b.dot(D)<0){n.restDifference[2]=-n.restDifference[2]}p=r.parent.matrixWorld.clone().scale(v).multiply(i.matParentInv);p.decompose(new e.Vector3,new e.Quaternion,_);if(this._coordinateSystem===o.World){n.restDifferenceInCoordinates=[_.x,_.y,_.z]}else{m=(new e.Matrix4).copy(f).invert().multiply(p).multiply(f);m.decompose(new e.Vector3,new e.Quaternion,_);n.restDifferenceInCoordinates=[_.x,_.y,_.z]}var I=this._alignAxesBetweenGizmoAndNodeCoordinates(r);for(var V=0;V<3;V++){if(n.restDifference[V]>0){n.restDifferenceInCoordinates[I[V]]=Math.abs(n.restDifferenceInCoordinates[I[V]])}else{n.restDifferenceInCoordinates[I[V]]=-Math.abs(n.restDifferenceInCoordinates[I[V]])}}}t.push(n)}.bind(this));return t};l.prototype.endGesture=function(){var e=this._getNodesProperties();delete this._beginValue;this._nodes.forEach(function(e){var t=e.node;if(t.userData){delete t.userData.skipUpdateJointNode}this._viewport._viewStateManager._setJointNodeOffsets(t,a.Scale)}.bind(this));this._tool.fireScaled({x:this._scaleDelta.x,y:this._scaleDelta.y,z:this._scaleDelta.z,nodesProperties:e});this._printEventInfo("Event 'scaled'",this._scaleDelta.x,this._scaleDelta.y,this._scaleDelta.z,e)};l.prototype._alignAxesBetweenGizmoAndNodeCoordinates=function(t,i){function o(e,t,i,o){var r=Math.abs(e.dot(t));var a=Math.abs(e.dot(i));var n=Math.abs(e.dot(o));if(r>=a&&r>=n){return 0}else if(a>=r&&a>=n){return 1}else{return 2}}var r=t.parent.matrixWorld.clone().multiply((new e.Matrix4).makeRotationFromQuaternion(t.quaternion.clone()));var a=new e.Vector3;var n=new e.Vector3;var s=new e.Vector3;r.extractBasis(a,n,s);a.normalize();n.normalize();s.normalize();var l=new e.Matrix4;if(this._gizmo){l=this._gizmo.matrixWorld.clone()}var c=new e.Vector3;var h=new e.Vector3;var d=new e.Vector3;l.extractBasis(c,h,d);c.normalize();h.normalize();d.normalize();var u=[];var f;if(i){f=o(c,a,n,s);u.push(f);f=o(h,a,n,s);u.push(f);f=o(d,a,n,s);u.push(f)}else{f=o(a,c,h,d);u.push(f);f=o(n,c,h,d);u.push(f);f=o(s,c,h,d);u.push(f)}return u};l.prototype._scale=function(t){function i(e,t,i,o){if(t===0){if(o&&i.x>0||!o&&i.x<0){e.x=Math.abs(e.x)}else{e.x=-Math.abs(e.x)}}else if(t===1){if(o&&i.y>0||!o&&i.y<0){e.y=Math.abs(e.y)}else{e.y=-Math.abs(e.y)}}else if(t===2){if(o&&i.z>0||!o&&i.z<0){e.z=Math.abs(e.z)}else{e.z=-Math.abs(e.z)}}}if(!this._beginValue){this._beginValue=this._value.clone()}this._value.multiplyVectors(this._beginValue,t);this._scaleDelta.copy(t);this._nodes.forEach(function(e){var t=e.node;if(!t.userData){t.userData={}}t.userData.skipUpdateJointNode=true});if(this._coordinateSystem===o.Local){this._nodes.forEach(function(e){e.node.scale.copy(e.scaleOrigin).multiply(t);e.node.updateMatrix()})}else{var r=this._matOrigin.clone().scale(t).multiply((new e.Matrix4).copy(this._matOrigin).invert());this._nodes.forEach(function(a){if(!a.ignore){var n=a.node;n.matrixWorld.multiplyMatrices(r,a.matOrigin);n.matrix.multiplyMatrices(a.matParentInv,n.matrixWorld);if(this._coordinateSystem===o.Parent){var s=n.matrix.clone();s.elements[12]=0;s.elements[13]=0;s.elements[14]=0;var l=(new e.Matrix4).makeRotationFromQuaternion(n.quaternion.clone().invert()).multiply(n.matrix);var c=l.elements;n.scale.x=c[0];n.scale.y=c[5];n.scale.z=c[10];n.updateMatrix()}else{n.matrix.decompose(n.position,new e.Quaternion,n.scale);var h=this._alignAxesBetweenGizmoAndNodeCoordinates(n,true);i(n.scale,h[0],a.scaleOrigin,t.x>0);i(n.scale,h[1],a.scaleOrigin,t.y>0);i(n.scale,h[2],a.scaleOrigin,t.z>0);n.updateMatrix()}}}.bind(this))}this._viewport.setShouldRenderFrame()};l.prototype.scale=function(t,i,o){this.beginGesture();this._scale(new e.Vector3(t,i,o))};l.prototype._setScale=function(e){var t=this._getNodesProperties();if(this._tool.fireEvent("scaling",{x:e.x,y:e.y,z:e.z,nodesProperties:t},true)){this._printEventInfo("Event 'scaling'",e.x,e.y,e.z,t);this._scale(e)}};l.prototype.getValue=function(){return this._gizmoIndex>=0&&this._handleIndex>=0&&this._handleIndex<3?this._value.getComponent(this._handleIndex):1};l.prototype.setValue=function(t){if(this._gizmoIndex>=0&&this._handleIndex>=0&&this._handleIndex<3){var i=t/this._value.getComponent(this._handleIndex);var o=new e.Vector3(1,1,1);if(this._nonUniformScaleEnabled){o.setComponent(this._handleIndex,i)}else{o.setScalar(i)}this.beginGesture();this._scale(o);this.endGesture()}};l.prototype.expandBoundingBox=function(e){if(this._viewport){this._expandBoundingBox(e,this._viewport.getCamera().getCameraRef(),true)}};l.prototype._updateSelection=function(e){t.prototype._updateSelection.call(this,e);if(this._tool.getEnableSnapping()){this._tool.getDetector().setSource(e)}};l.prototype.handleSelectionChanged=function(e){this._sequence=null;if(this._viewport){this._updateSelection(this._viewport._viewStateManager);this._gizmoIndex=this._handleIndex=-1;var t=this._getNodesProperties();this._tool.fireEvent("scaling",{x:0,y:0,z:0,nodesProperties:t},true)}};l.prototype._getObjectScale=function(t){if(this._nodes.length===1){return this._nodes[0].node.scale}else if(this._coordinateSystem===o.Local){return this._nodes[t].node.scale}return new e.Vector3(1,1,1)};l.prototype._getObjectSize=function(t){var i=new e.Box3;if(this._nodes.length===1){this._nodes[0].node._expandBoundingBox(i,true,false)}else if(this._coordinateSystem===o.Local){this._nodes[0].node._expandBoundingBox(i,true,false)}if(i.isEmpty()){return 0}var r=new e.Vector3;i.getSize(r);return r.length()};l.prototype._updateGizmoTransformation=function(e,t){var i=this._updateGizmoObjectTransformation(this._gizmo,e);this._updateAxisTitles(this._axisTitles,this._gizmo,t,this._gizmoSize+30,i)};l.prototype._getEditingFormPosition=function(){var t=this._updateGizmoObjectTransformation(this._gizmo,this._gizmoIndex);var i=(new e.Vector3).setFromMatrixColumn(this._gizmo.matrixWorld,this._handleIndex).normalize();return i.clone().multiplyScalar((this._gizmoSize+18)*t).add(this._gizmo.position).applyMatrix4(this._matViewProj)};l.prototype.render=function(){n(this._viewport&&this._viewport.getMetadata().getName()==="sap.ui.vk.threejs.Viewport","Can't render gizmo without sap.ui.vk.threejs.Viewport");if(this._nodes.length>0){var e=this._viewport.getRenderer(),t=this._viewport.getCamera().getCameraRef();this._matViewProj.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse);e.clearDepth();for(var i=0,o=this.getGizmoCount();i<o;i++){this._updateGizmoTransformation(i,t);e.render(this._sceneGizmo,t)}}this._updateEditingForm(this._nodes.length>0&&this._gizmoIndex>=0&&this._handleIndex>=0&&this._handleIndex<3,this._handleIndex)};return l});
//# sourceMappingURL=ScaleToolGizmo.js.map
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../thirdparty/three","./Gizmo","./RotateToolGizmoRenderer","./RotatableAxis","./CoordinateSystem","./AxisColours","../AnimationTrackType","../AnimationTrackValueType","./GizmoPlacementMode","sap/base/assert","sap/base/Log"],function(e,t,r,i,o,a,n,s,l,u,h){"use strict";var d=t.extend("sap.ui.vk.tools.RotateToolGizmo",{metadata:{library:"sap.ui.vk"}});d.prototype.init=function(){if(t.prototype.init){t.prototype.init.apply(this)}this._createEditingForm(String.fromCharCode(176),84);this._gizmoIndex=-1;this._handleIndex=-1;this._value=new e.Vector3;this._rotationDelta=new e.Vector3;this._viewport=null;this._tool=null;this._sceneGizmo=new e.Scene;this._gizmo=new e.Group;this._touchAreas=new e.Group;this._sceneGizmo.add(this._gizmo);this._axis=i.All;this._coordinateSystem=o.World;this._nodes=[];this._matViewProj=new e.Matrix4;this._gizmoSize=96;function r(t,r,i,o){var a=new e.TorusGeometry(i,1/96,4,o);if(t===0){a.rotateY(Math.PI/2)}else if(t===1){a.rotateX(Math.PI/2)}var n=new e.Mesh(a,new e.MeshBasicMaterial({color:r,transparent:true}));n.matrixAutoUpdate=false;n.userData.color=r;return n}function n(t,r,i){var o=new e.TorusGeometry(r,16/96,4,i);if(t===0){o.rotateY(Math.PI/2)}else if(t===1){o.rotateX(Math.PI/2)}return new e.Mesh(o,new e.MeshBasicMaterial({opacity:.2,transparent:true}))}for(var s=0;s<3;s++){this._gizmo.add(r(s,a[["x","y","z"][s]],1,128));this._touchAreas.add(n(s,1,24))}this._gizmo.add(new e.AxesHelper(.75));var l=new e.MeshBasicMaterial({color:33023,opacity:.5,transparent:true,side:e.DoubleSide});this._arcMesh=new e.Mesh(new e.BufferGeometry,l);this._arcMesh.visible=false;this._gizmo.add(this._arcMesh);this._axisTitles=this._createAxisTitles();this._sceneGizmo.add(this._axisTitles)};d.prototype.hasDomElement=function(){return true};d.prototype.setAxis=function(e){this._axis=e;var t=[i.All,i.X,i.Y,i.Z];if(this._coordinateSystem!==o.Screen){for(var r=0;r<3;r++){if(e!==i.All&&t[r+1]!==e){this._gizmo.children[r].visible=this._touchAreas.children[r].visible=false}else{this._gizmo.children[r].visible=this._touchAreas.children[r].visible=true}}}};d.prototype.resetValues=function(){this._value.setScalar(0)};d.prototype.setCoordinateSystem=function(e){this._coordinateSystem=e;var t=e===o.Screen;if(t){this._gizmo.children[0].visible=this._gizmo.children[1].visible=false;this._touchAreas.children[0].visible=this._touchAreas.children[1].visible=false;this._gizmo.children[2].visible=this._touchAreas.children[2].visible=true}else{this._gizmo.children[0].visible=this._touchAreas.children[0].visible=this._axis===i.All||this._axis===i.X;this._gizmo.children[1].visible=this._touchAreas.children[1].visible=this._axis===i.All||this._axis===i.Y;this._gizmo.children[2].visible=this._touchAreas.children[2].visible=this._axis===i.All||this._axis===i.Z}this._axisTitles.visible=!t;this._gizmoIndex=this._handleIndex=-1};d.prototype.show=function(e,t){this._viewport=e;this._tool=t;this._nodes.length=0;this._updateSelection(e._viewStateManager);var r=this._getNodesProperties();this._tool.fireEvent("rotating",{x:0,y:0,z:0,nodesProperties:r},true)};d.prototype._prepareForCreatingRotationKey=function(t,r,i){this._nodes.forEach(function(o){var a=o.node;var s=[0,0,0];t.setTime(r,i);var l=t.getAnimatedProperty(a,n.Rotate);if(l.offsetToPrevious){s=l.offsetToPrevious}if(!this._nodeUserDataMap){this._nodeUserDataMap=new Map}var u=this._nodeUserDataMap.get(a);if(!u){u={};this._nodeUserDataMap.set(a,u)}u.eulerInParentCoors=new e.Euler(s[0],s[1],s[2]);u.startEulerInParentCoors=new e.Euler(s[0],s[1],s[2])}.bind(this));var o=t.getCurrentPlayback();if(o){this._prepareForCreatingKey(o)}};d.prototype.hide=function(){this._cleanTempData();this._viewport=null;this._tool=null;this._gizmoIndex=this._handleIndex=-1;this._updateEditingForm(false)};d.prototype.getGizmoCount=function(){if(this._coordinateSystem===o.Local||this._coordinateSystem===o.Parent){return this._nodes.length}else{return this._nodes.length>0?1:0}};d.prototype.getTouchObject=function(e){if(this._nodes.length===0){return null}this._updateGizmoObjectTransformation(this._touchAreas,e);return this._touchAreas};d.prototype.highlightHandle=function(e,t){for(var r=0;r<3;r++){var i=this._gizmo.children[r];var o=r===e?16776960:i.userData.color;i.material.color.setHex(o);i.material.opacity=e===-1||r===e?1:.35;i.material.visible=t||r===e;var a=this._axisTitles.children[r];a.material.color.setHex(o);a.material.opacity=e===-1||r===e?1:.35;a.material.visible=t||r===e}};d.prototype.selectHandle=function(e,t){this._gizmoIndex=t;this._handleIndex=e;if(this._tool.getAutoResetValues()){this.resetValues()}this._viewport.setShouldRenderFrame()};d.prototype.beginGesture=function(){this._beginValue=this._value.clone();this._rotationDelta.setScalar(0);this._matOrigin=this._gizmo.matrixWorld.clone();this._nodes.forEach(function(t){t.node.parent.updateMatrixWorld(true);t.matOrigin=t.node.matrixWorld.clone();t.matLocalOrigin=t.node.matrix.clone();if(t.node.parent){t.matParentInv=(new e.Matrix4).copy(t.node.parent.matrixWorld).invert()}else{t.matParentInv=new e.Matrix4}t.quaternion=t.node.quaternion.clone()})};d.prototype._printEventInfo=function(e,t,r,i,o){h.debug(e+" is fired:"+" x = "+t+"; y = "+r+"; z = "+i);o.forEach(function(e){h.debug("Node: "+e.node.name);if(e.offsetToRest){h.debug("offsetToRest: [ "+e.offsetToRest[0]+", "+e.offsetToRest[1]+", "+e.offsetToRest[2]+", "+e.offsetToRest[3]+" ] ")}else{h.debug("offsetToRest: null")}if(e.offsetToRestInCoordinates){h.debug("offsetToRestInCoordinates: [ "+e.offsetToRestInCoordinates[0]+", "+e.offsetToRestInCoordinates[1]+", "+e.offsetToRestInCoordinates[2]+" ] ")}else{h.debug("offsetToRestInCoordinates: null")}if(e.offsetToPrevious){h.debug("offsetToPrevious: [ "+e.offsetToPrevious[0]+", "+e.offsetToPrevious[1]+", "+e.offsetToPrevious[2]+" ] ")}else{h.debug("offsetToPrevious: null")}if(e.absolute){h.debug("absolute: [ "+e.absolute[0]+", "+e.absolute[1]+", "+e.absolute[2]+", "+e.absolute[3]+" ] ")}else{h.debug("absolute: null")}if(e.world){h.debug("world: [ "+e.world[0]+", "+e.world[1]+", "+e.world[2]+", "+e.world[3]+" ] ")}else{h.debug("world: null")}if(e.restDifference){h.debug("restDifference: [ "+e.restDifference[0]+", "+e.restDifference[1]+", "+e.restDifference[2]+", "+e.restDifference[3]+" ] ")}else{h.debug("restDifference: null")}if(e.restDifferenceInCoordinates){h.debug("restDifference: [ "+e.restDifferenceInCoordinates[0]+", "+e.restDifferenceInCoordinates[1]+", "+e.restDifferenceInCoordinates[2]+", "+e.restDifferenceInCoordinates[3]+" ] ")}else{h.debug("restDifference: null")}})};d.prototype._getNodesProperties=function(){var t=[];this._nodes.forEach(function(r){var i=r.node;var o={};o.node=i;var a;if(this._nodeUserDataMap){a=this._nodeUserDataMap.get(i)}if(a&&a.eulerInParentCoors){var s=new e.Euler(a.eulerInParentCoors.x,a.eulerInParentCoors.y,a.eulerInParentCoors.z);var l=(new e.Quaternion).setFromEuler(s);if(this._playback){var u=this._viewport._viewStateManager._getEndPropertyInPreviousPlayback(i,n.Rotate,this._playback);if(u){var h=new e.Quaternion(u[0],u[1],u[2],u[3]);l.multiply(h)}}o.offsetToRest=[l.x,l.y,l.z,l.w];o.offsetToPrevious=[a.eulerInParentCoors.x,a.eulerInParentCoors.y,a.eulerInParentCoors.z]}else{o.offsetToRest=null;o.offsetToPrevious=null}var d=this._viewport._viewStateManager.getTransformation(i);o.absolute=[d.quaternion[0],d.quaternion[1],d.quaternion[2],d.quaternion[3]];var f=this._viewport._viewStateManager.getTransformationWorld(i);var _=new e.Quaternion(f.quaternion[0],f.quaternion[1],f.quaternion[2],f.quaternion[3]);var p=(new e.Euler).setFromQuaternion(_);o.world=[p.x,p.y,p.z];if(a&&a.quatInitialDiffInv){var c=new e.Quaternion(d.quaternion[0],d.quaternion[1],d.quaternion[2],d.quaternion[3]);c.multiply(a.quatInitialDiffInv);o.restDifference=[c.x,c.y,c.z,c.w]}else{o.restDifference=null}if(a.euler){o.restDifferenceInCoordinates=[a.euler.x,a.euler.y,a.euler.z]}else{o.restDifferenceInCoordinates=null}o.offsetToRestInCoordinates=null;t.push(o)}.bind(this));return t};d.prototype.endGesture=function(){this._arcMesh.visible=false;var e=this._getNodesProperties();delete this._beginValue;this._nodes.forEach(function(e){var t=e.node;var r;if(this._nodeUserDataMap){r=this._nodeUserDataMap.get(t)}if(r&&r.euler){r.startEuler.x=r.euler.x;r.startEuler.y=r.euler.y;r.startEuler.z=r.euler.z;r.startEulerInParentCoors.x=r.eulerInParentCoors.x;r.startEulerInParentCoors.y=r.eulerInParentCoors.y;r.startEulerInParentCoors.z=r.eulerInParentCoors.z}if(this._coordinateSystem!==o.Custom){delete t.userData.skipUpdateJointNode}this._viewport._viewStateManager._setJointNodeOffsets(t,n.Rotate)}.bind(this));this._tool.fireRotated({x:this._rotationDelta.x,y:this._rotationDelta.y,z:this._rotationDelta.z,nodesProperties:e});this._printEventInfo("Event 'rotated'",this._rotationDelta.x,this._rotationDelta.y,this._rotationDelta.z,e)};var f=function(e,t){if(Math.abs(e-t)<1e-6){return e}if(e>t){while(e>t){t+=2*Math.PI}if(t-e<=Math.PI){return t}else{return t-2*Math.PI}}else{while(e<t){t-=2*Math.PI}if(e-t<=Math.PI){return t}else{return t+2*Math.PI}}};d.prototype.rotateFromRestPosition=function(t,r,i){if(this._coordinateSystem!==o.Parent){return}this.beginGesture();this._nodes.forEach(function(e){var t=e.node;if(!t.userData){t.userData={}}t.userData.skipUpdateJointNode=true});t=e.MathUtils.degToRad(t);r=e.MathUtils.degToRad(r);i=e.MathUtils.degToRad(i);for(var a=0,s=this._nodes.length;a<s;a++){var l=this._nodes[a];if(!l.ignore){var u=l.node;var h;if(this._nodeUserDataMap){h=this._nodeUserDataMap.get(u)}if(h&&h.euler&&h.eulerInParentCoors){this._rotationDelta.set(e.MathUtils.radToDeg(t-h.eulerInParentCoors.x),e.MathUtils.radToDeg(r-h.eulerInParentCoors.y),e.MathUtils.radToDeg(i-h.eulerInParentCoors.z));h.eulerInParentCoors.x=t;h.eulerInParentCoors.y=r;h.eulerInParentCoors.z=i;var d=new e.Euler(h.eulerInParentCoors.x,h.eulerInParentCoors.y,h.eulerInParentCoors.z);var f=(new e.Quaternion).setFromEuler(d);var _=this._viewport._viewStateManager.getRestTransformationUsingJoint(u);var p=new e.Quaternion(_.quaternion[0],_.quaternion[1],_.quaternion[2],_.quaternion[3]);if(this._playback){var c=this._viewport._viewStateManager._getEndPropertyInPreviousPlayback(u,n.Rotate,this._playback);if(c){var m=new e.Quaternion(c[0],c[1],c[2],c[3]);f.multiply(m)}}var v=this._getEffectiveParent(u);if(v!==u.parent){this._viewport._viewStateManager._setJointNodeOffsets(u,n.Rotate);u.userData.offsetQuaternion=[f.x,f.y,f.z,f.w];u.userData.skipUpdateJointNode=false;this._viewport._viewStateManager._setJointNodeMatrix();u.userData.skipUpdateJointNode=true}else{u.quaternion.copy(f.multiply(p))}u.updateMatrix();h.euler.x=h.eulerInParentCoors.x-h.startEulerInParentCoors.x+h.startEuler.x;h.euler.y=h.eulerInParentCoors.y-h.startEulerInParentCoors.y+h.startEuler.y;h.euler.z=h.eulerInParentCoors.z-h.startEulerInParentCoors.z+h.startEuler.z}}}this.endGesture()};d.prototype.rotateRestPosition=function(t,r,i){this.beginGesture();this._nodes.forEach(function(e){var t=e.node;if(!t.userData){t.userData={}}t.userData.skipUpdateJointNode=true});t=e.MathUtils.degToRad(t);r=e.MathUtils.degToRad(r);i=e.MathUtils.degToRad(i);for(var a=0,n=this._nodes.length;a<n;a++){var s=this._nodes[a];if(!s.ignore){var l=s.node;var u;if(this._nodeUserDataMap){u=this._nodeUserDataMap.get(l)}if(u&&u.euler&&u.eulerInParentCoors){this._rotationDelta.set(e.MathUtils.radToDeg(t-u.euler.x),e.MathUtils.radToDeg(r-u.euler.y),e.MathUtils.radToDeg(i-u.euler.z));u.euler.x=t;u.euler.y=r;u.euler.z=i;var h=new e.Euler(u.euler.x,u.euler.y,u.euler.z);var d=(new e.Quaternion).setFromEuler(h);var _=new e.Matrix4;var p=new e.Matrix4;if(this._coordinateSystem===o.Local){_=l.parent.matrixWorld.clone().multiply(u.matRest);p=u.matRestInv.clone().multiply(s.matParentInv)}else if(this._gizmo&&this._coordinateSystem!==o.Parent){_=this._gizmo.matrixWorld.clone();p=p.copy(_).invert()}var c=(new e.Matrix4).makeRotationFromQuaternion(d);var m=c;if(this._coordinateSystem!==o.Parent){m=s.matParentInv.clone().multiply(_).multiply(c).multiply(p).multiply(l.parent.matrixWorld)}var v=(new e.Matrix4).makeRotationFromQuaternion(u.quatInitialDiff).multiply(m);var g=(new e.Euler).setFromRotationMatrix(v);if(Math.abs(g.x)<1e-6){g.x=0}if(Math.abs(g.y)<1e-6){g.y=0}if(Math.abs(g.z)<1e-6){g.z=0}u.eulerInParentCoors.x=f(u.eulerInParentCoors.x,g.x);u.eulerInParentCoors.y=f(u.eulerInParentCoors.y,g.y);u.eulerInParentCoors.z=f(u.eulerInParentCoors.z,g.z);l.matrix=u.matInitialDiff.clone().multiply(m.multiply(u.matRest));l.matrix.decompose(l.position,l.quaternion,l.scale);l.updateMatrix()}}}this.endGesture()};d.prototype._updateEulerForCreatingAnimationKey=function(t){for(var r=0,i=this._nodes.length;r<i;r++){var a=this._nodes[r];if(!a.ignore){var s=a.node;var l;if(this._nodeUserDataMap){l=this._nodeUserDataMap.get(s)}if(l&&l.euler){l.euler.x=l.startEuler.x+t[0];l.euler.y=l.startEuler.y+t[1];l.euler.z=l.startEuler.z+t[2];var u=false;if(Math.abs(l.euler.x)<1e-6&&(Math.abs(l.euler.y)<1e-6||Math.abs(l.euler.z)<1e-6)||Math.abs(l.euler.y)<1e-6&&Math.abs(l.euler.z)<1e-6){u=true}if(u&&this._coordinateSystem===o.Parent){l.eulerInParentCoors.x=l.startEulerInParentCoors.x+t[0];l.eulerInParentCoors.y=l.startEulerInParentCoors.y+t[1];l.eulerInParentCoors.z=l.startEulerInParentCoors.z+t[2];continue}var h=this._viewport._viewStateManager.getRelativeTransformation(s);var d;var _=this._getEffectiveParent(s);if(_!==s.parent&&this._coordinateSystem!==o.Custom){this._viewport._viewStateManager._setJointNodeOffsets(s,n.Rotate);d=new e.Quaternion(s.userData.offsetQuaternion[0],s.userData.offsetQuaternion[1],s.userData.offsetQuaternion[2],s.userData.offsetQuaternion[3]);s.userData.skipUpdateJointNode=false;this._viewport._viewStateManager._setJointNodeMatrix();s.userData.skipUpdateJointNode=true}else{d=new e.Quaternion(h.quaternion[0],h.quaternion[1],h.quaternion[2],h.quaternion[3])}var p=(new e.Matrix4).makeRotationFromQuaternion(d);if(this._playback){var c=this._viewport._viewStateManager._getEndPropertyInPreviousPlayback(s,n.Rotate,this._playback);if(c){var m=new e.Quaternion(c[0],c[1],c[2],c[3]);var v=(new e.Matrix4).makeRotationFromQuaternion(m);p.multiply((new e.Matrix4).copy(v).invert())}}var g=(new e.Euler).setFromRotationMatrix(p);if(Math.abs(g.x)<1e-5){g.x=0}if(Math.abs(g.y)<1e-5){g.y=0}if(Math.abs(g.z)<1e-5){g.z=0}l.eulerInParentCoors.x=f(l.eulerInParentCoors.x,g.x);l.eulerInParentCoors.y=f(l.eulerInParentCoors.y,g.y);l.eulerInParentCoors.z=f(l.eulerInParentCoors.z,g.z);if(u){continue}var y=new e.Matrix4;var x=new e.Matrix4;if(this._coordinateSystem===o.Local){y=s.parent.matrixWorld.clone().multiply(l.matRest);x=l.matRestInv.clone().multiply(a.matParentInv)}else if(this._gizmo&&this._coordinateSystem!==o.Parent){y=this._gizmo.matrixWorld.clone();x=x.copy(y).invert()}var M=new e.Quaternion(h.quaternion[0],h.quaternion[1],h.quaternion[2],h.quaternion[3]);M.multiply(l.quatInitialDiffInv);var I=(new e.Matrix4).makeRotationFromQuaternion(M);var w=I;if(this._coordinateSystem!==o.Parent){w=x.clone().multiply(s.parent.matrixWorld).multiply(I).multiply(a.matParentInv).multiply(y)}g=(new e.Euler).setFromRotationMatrix(w);if(Math.abs(g.x)<1e-6){g.x=0}if(Math.abs(g.y)<1e-6){g.y=0}if(Math.abs(g.z)<1e-6){g.z=0}l.euler.x=f(l.euler.x,g.x);l.euler.y=f(l.euler.y,g.y);l.euler.z=f(l.euler.z,g.z)}}}};d.prototype._rotate=function(t){this._rotationDelta.set(e.MathUtils.radToDeg(t.x),e.MathUtils.radToDeg(t.y),e.MathUtils.radToDeg(t.z));this._value.addVectors(this._beginValue,this._rotationDelta);this._nodes.forEach(function(e){var t=e.node;if(!t.userData){t.userData={}}t.userData.skipUpdateJointNode=true});var r=new e.Quaternion;if(this._coordinateSystem===o.Local){r.setFromEuler(t);this._nodes.forEach(function(e){var t=e.node;t.quaternion.copy(e.quaternion).multiply(r);t.updateMatrix()});t=t.toArray();this._updateEulerForCreatingAnimationKey(t)}else{t=t.toArray();for(var i=0;i<3;i++){var a=t[i];if(a){var n=t[3].charCodeAt(i)-88;if(n>=0&&n<3){var s=(new e.Vector3).setFromMatrixColumn(this._matOrigin,n).normalize();var l=(new e.Matrix4).makeRotationAxis(s,a);var u=(new e.Vector3).setFromMatrixPosition(this._matOrigin);l.setPosition(u.sub(u.clone().applyMatrix4(l)));for(var h=0,d=this._nodes.length;h<d;h++){var f=this._nodes[h];if(!f.ignore){var _=f.node;if(this._coordinateSystem!==o.Parent){_.position.setFromMatrixPosition(f.matOrigin).applyMatrix4(l).applyMatrix4(f.matParentInv)}var p=(new e.Vector3).setFromMatrixScale(f.matOrigin);var c=s.clone().transformDirection((new e.Matrix4).copy(f.matOrigin).invert()).multiply(p).normalize();r.setFromAxisAngle(c,a);_.quaternion.copy(f.quaternion).multiply(r);_.updateMatrix()}}}}}this._updateEulerForCreatingAnimationKey(t)}this._viewport.setShouldRenderFrame()};d.prototype._setRotationAxisAngle=function(t,r,i){var a=(i-r)%(Math.PI*2);var n=new e.Euler;n[["x","y","z"][t]]=a;var s=this._getNodesProperties();if(this._tool.fireEvent("rotating",{x:e.MathUtils.radToDeg(n.x),y:e.MathUtils.radToDeg(n.y),z:e.MathUtils.radToDeg(n.z),nodesProperties:s},true)){this._printEventInfo("Event 'rotating'",e.MathUtils.radToDeg(n.x),e.MathUtils.radToDeg(n.y),e.MathUtils.radToDeg(n.z),s);this._rotate(n);var l=[0,0,0];var u=new e.Vector3;var h=(t+1)%3,d=(t+2)%3;var f,_=Math.max(Math.ceil(Math.abs(a)*64/Math.PI),1);a*=this._coordinateSystem===o.Local?-1:1;for(f=0;f<=_;f++){var p=r+a*(f/_);u.set(0,0,0).setComponent(h,Math.cos(p)).setComponent(d,Math.sin(p));l.push(u.x,u.y,u.z)}var c=[];for(f=0;f<_;f++){c.push(0,f+1,f+2)}var m=this._arcMesh.geometry;m.setIndex(c);m.setAttribute("position",new e.Float32BufferAttribute(l,3));this._arcMesh.visible=true}};d.prototype.rotate=function(t,r,i){this.beginGesture();this._rotate(new e.Euler(e.MathUtils.degToRad(t||0),e.MathUtils.degToRad(r||0),e.MathUtils.degToRad(i||0)))};d.prototype._getValueLocaleOptions=function(){return{useGrouping:false,minimumFractionDigits:1,maximumFractionDigits:2}};d.prototype.getValue=function(){return this._gizmoIndex>=0&&this._handleIndex>=0&&this._handleIndex<3?this._value.getComponent(this._handleIndex):0};d.prototype.setValue=function(t){if(this._gizmoIndex>=0&&this._handleIndex>=0&&this._handleIndex<3){var r=new e.Euler;r[["x","y","z"][this._handleIndex]]=e.MathUtils.degToRad(t-this._value.getComponent(this._handleIndex));this.beginGesture();this._rotate(r);this.endGesture()}};d.prototype.expandBoundingBox=function(e){if(this._viewport){this._expandBoundingBox(e,this._viewport.getCamera().getCameraRef(),true)}};d.prototype._updateSelection=function(e){t.prototype._updateSelection.call(this,e);if(this._tool.getEnableSnapping()){this._tool.getDetector().setSource(e)}};d.prototype.handleSelectionChanged=function(e){if(this._viewport){this._updateSelection(this._viewport._viewStateManager);var t=this._getNodesProperties();this._tool.fireEvent("rotating",{x:0,y:0,z:0,nodesProperties:t},true);this._gizmoIndex=this._handleIndex=-1}};d.prototype._getLevelingQuaternion=function(e,t){e.set(0,0,0,1);switch(this._coordinateSystem){case o.Local:e.setFromRotationMatrix(this._nodes[t].node.parent.matrixWorld);break;case o.Screen:e.copy(this._viewport.getCamera().getCameraRef().quaternion);break;case o.Custom:var r=this._getAnchorPoint();if(r){e.copy(r.quaternion)}break;default:break}};d.prototype._getObjectSize=function(t){var r=new e.Box3;if(this._nodes.length===1){this._nodes[0].node._expandBoundingBox(r,true,false)}else if(this._coordinateSystem===o.Local){this._nodes[0].node._expandBoundingBox(r,true,false)}if(r.isEmpty()){return 0}var i=new e.Vector3;r.getSize(i);return i.length()};d.prototype._updateGizmoTransformation=function(e,t){var r=this._updateGizmoObjectTransformation(this._gizmo,e);this._updateAxisTitles(this._axisTitles,this._gizmo,t,this._gizmoSize-12,r)};d.prototype._getEditingFormPosition=function(){var t=this._updateGizmoObjectTransformation(this._gizmo,this._gizmoIndex);var r=(new e.Vector3).setFromMatrixColumn(this._gizmo.matrixWorld,this._handleIndex).normalize();return r.clone().multiplyScalar((this._gizmoSize-12)*t).add(this._gizmo.position).applyMatrix4(this._matViewProj)};d.prototype.render=function(){u(this._viewport&&this._viewport.getMetadata().getName()==="sap.ui.vk.threejs.Viewport","Can't render gizmo without sap.ui.vk.threejs.Viewport");if(this._nodes.length>0){var e=this._viewport.getRenderer(),t=this._viewport.getCamera().getCameraRef();this._matViewProj.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse);e.clearDepth();for(var r=0,i=this.getGizmoCount();r<i;r++){this._updateGizmoTransformation(r,t);e.render(this._sceneGizmo,t)}}this._updateEditingForm(this._nodes.length>0&&this._gizmoIndex>=0&&this._handleIndex>=0&&this._handleIndex<3,this._handleIndex)};return d});
//# sourceMappingURL=RotateToolGizmo.js.map
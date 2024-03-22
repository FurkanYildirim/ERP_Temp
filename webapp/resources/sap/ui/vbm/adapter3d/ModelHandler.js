/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */
sap.ui.define(["sap/ui/base/Object","./Utilities","./thirdparty/three","./thirdparty/ColladaLoader","sap/base/Log"],function(e,t,o,s,r){"use strict";var n="sap.ui.vbm.ModelHandler";var i=o.Box3;var a=o.Matrix4;var l=t.propertyAdded;var d=t.propertyChanged;var c=t.updateProperty;var h=t.addRef;var u=t.subRef;var f=e.extend("sap.ui.vbm.adapter3d.ModelHandler",{constructor:function(t,o,s,r){e.call(this);this._resources=t;this._textures=o;this._scene=s;this._root=r;this._root.updateWorldMatrix(false,false);this._hotInstance=null;this._instances=new Map;this._models=new Map;this._meshes=new Map;this._colladaLoader=null;this._glTFLoader=null}});var m=4e3;f.prototype.destroy=function(){this._resources=null;this._textures=null;this._scene=null;this._root=null;this._hotInstance=null;this._meshes.forEach(function(e){e.forEach(function(e){e.objects3D.forEach(function(e){this._deleteObject3D(e)},this)},this)},this);this._instances.forEach(function(e){if(e.texture){u(e.texture)}});this._models.forEach(function(e,t){this._deleteModel(e)},this);this._meshes.clear();this._meshes=null;this._instances.clear();this._instances=null;this._models.clear();this._models=null;this._glTFLoader=null;this._colladaLoader=null;e.prototype.destroy.call(this)};f.prototype.addInstance=function(e){this._instances.set(e,{instance:e,world:new a,matrices:[],model:null,texture:null,key:null,mesh:null});this.updateInstance(e)};f.prototype.updateInstance=function(e){var o=this._instances.get(e),s=false,i=this._hotInstance&&this._hotInstance===e;if(o){var f=t.toBoolean(e.normalize);if(d(e,"model")){if(!l(e,"model")){this._removeInstanceFromMesh(o);u(o.model)}o.model=this._models.get(e.model);if(!o.model){r.error("Removing broken instance with unknown model",e.model,n);this.removeInstance(e);return}h(o.model);o.matrices.length=0;s=true}if(d(e,"texture")){if(!l(e,"texture")){if(o.texture){u(o.texture);o.texture=null}}if(e.texture){o.texture=this._textures.get(e.texture)||null;if(o.texture){h(o.texture)}else{r.error("Failed to apply texture on model, texture not found",e.texture,n)}}s=true}if(d(e,["normalize","model"])){this._updateModel(o.model,f);o.matrices.length=0;s=true}if(d(e,["pos","rot","scale"])){t.getInstanceMatrix(e,o.world,f?o.model.normalized.bbox:o.model.bbox);o.matrices.length=0;s=true}var m=this._getInstanceKey(e,i);if(!o.key||m!==o.key){this._removeInstanceFromMesh(o);o.key=m;s=true}c(e,["model","normalize","pos","rot","scale","texture","color","selectColor","hotDeltaColor","VB:s"]);if(o.matrices.length===0){var p=this._root.matrixWorld.clone();p.multiply(o.world);if(f){p.multiply(o.model.normalized.world)}o.model.root.children.forEach(function(e){o.matrices.push((new a).multiplyMatrices(p,e.matrixWorld))})}if(s){this._requestUpdate(o)}}else{r.error("Unable to find model instance data","",n)}};f.prototype.removeInstance=function(e){var t=this._instances.get(e);if(t){if(this._hotInstance===e){this._hotInstance=null}this._instances.delete(e);this._removeInstanceFromMesh(t);e._last={};if(t.model){u(t.model)}if(t.texture){u(t.texture)}}else{r.error("Unable to find model instance data","",n)}};f.prototype.update=function(){var e=[];this._meshes.forEach(function(s,r){for(var n=0;n<s.length;){if(s[n].dirty){var i,a,l=0,d=s[n];d.objects3D.forEach(function(e){this._deleteObject3D(e)},this);d.objects3D.length=d.hitInfo.length=0;if(d.instances.size){d.model.root.children.forEach(function(e){var s=new o.InstancedMesh(e.geometry,t.cloneMaterials(e.material),d.instances.size);s.matrixAutoUpdate=false;s.layers.set(0);s._instanceHitTest=this._instanceHitTest.bind(d);this._scene.add(s);d.objects3D.push(s)},this);d.instances.forEach(function(e){a=e;d.hitInfo.push(a);for(i=0;i<d.objects3D.length;++i){d.objects3D[i].setMatrixAt(l,a.matrices[i])}l++});t.applyColor(a.instance,a.instance.color,d.objects3D,this._hotInstance===a.instance,a.texture)}d.dirty=false}if(s[n].objects3D.length!==0){n++}else{s.splice(n,1)}}if(!s.length){e.push(r)}},this);e.forEach(function(e){this._meshes.delete(e)},this);this._models.forEach(function(e,o){if(t.refCountableDispose(e)){this._deleteModel(e);this._models.delete(o)}},this)};f.prototype.updateHotInstance=function(e){var t;if(this._hotInstance){t=this._instances.get(this._hotInstance);t.key=this._getInstanceKey(this._hotInstance,false);this._removeInstanceFromMesh(t);this._requestUpdate(t)}if(e&&e.isModel){t=this._instances.get(e);t.key=this._getInstanceKey(e,true);this._removeInstanceFromMesh(t);this._requestUpdate(t)}this._hotInstance=e&&e.isModel?e:null};f.prototype.addModel=function(e){if(e.isModel&&e.model&&!this._models.has(e.model)){this._models.set(e.model,{root:null,bbox:null,normalized:null})}};f.prototype.loadModels=function(){var e=[];this._models.forEach(function(t,o){if(!t.root){e.push(this._loadModel(o,t))}},this);return Promise.all(e)};f.prototype._loadModel=function(e,o){var s=this;var i=this._resources.get(e);if(!i){r.error("Failed to get model from context",e,n);this._models.delete(e);return Promise.resolve()}return new Promise(function(a,l){if(atob(i.slice(0,6)).startsWith("glTF")){try{s._getGlTFLoader().parse(t.base64ToArrayBuffer(i),"",function(e){s._postprocess(e,o);a()})}catch(t){s._models.delete(e);r.error("Failed to load glb model",e,n);a()}}else{try{s._postprocess(s._getColladaLoader().parse(atob(i)),o);a()}catch(t){try{s._getGlTFLoader().parse(atob(i),"",function(e){s._postprocess(e,o);a()})}catch(t){s._models.delete(e);r.error("Failed to load collada/gltf model",e,n);a()}}}})};f.prototype._postprocess=function(e,s){e.scene.scale.set(1,1,-1);var r=[],n=new Set,i="_sapUsed";e.scene.traverse(function(e){e.updateWorldMatrix(false,false);var o=e.isMesh&&e.visible;if(o){r.push(e)}else if(e.geometry){e.geometry.dispose()}t.toArray(e.material).forEach(function(e){if(o||!e[i]){e[i]=o}n.add(e)})});n.forEach(function(e){if(!e[i]){for(var t in e){if(t instanceof o.Texture){t.dispose()}}e.dispose()}});s.root=new o.Group;r.forEach(function(e){e.remove(e.children);s.root.add(e);e.matrixWorld.decompose(e.position,e.quaternion,e.scale)})};f.prototype._requestUpdate=function(e){if(e.mesh){e.mesh.dirty=true}else{var t=this._meshes.get(e.key);if(!t){t=[];this._meshes.set(e.key,t)}for(var o=0;o<t.length;++o){if(t[o].instances.size<m){e.mesh=t[o];break}}if(!e.mesh){e.mesh={dirty:true,model:e.model,hitInfo:[],objects3D:[],instances:new Set};t.push(e.mesh)}e.mesh.instances.add(e);e.mesh.dirty=true}};f.prototype._updateModel=function(e,o){if(o){if(!e.normalized){e.normalized={bbox:new i,world:new a};t.normalizeObject3D(e.root,e.normalized.world,e.normalized.bbox)}}else if(!e.bbox){e.bbox=(new i).setFromObject(e.root)}};f.prototype._deleteModel=function(e){e.root.children.forEach(function(e){e.geometry.dispose();t.toArray(e.material).forEach(function(e){for(var t in e){if(t instanceof o.Texture){t.dispose()}}e.dispose()})},this)};f.prototype._removeInstanceFromMesh=function(e){if(e.mesh){if(e.mesh.instances.delete(e)){e.mesh.dirty=true;e.mesh=null}else{r.error("Unable to find instance data in polygon mesh data","",n)}}};f.prototype._deleteObject3D=function(e){if(e){if(e.parent){e.parent.remove(e)}t.toArray(e.material).forEach(function(e){e.dispose()})}};f.prototype._getInstanceKey=function(e,o){var s=t.toBoolean(e["VB:s"]);var r=e.texture?"_texture_"+e.texture:"";var n="_color_"+e.color.toLowerCase();var i=s?"_selected_"+e.selectColor.toLowerCase():"";var a=o?"_hot_"+e.hotDeltaColor.toLowerCase():"";return e.model+r+n+i+a};f.prototype.getTarget=function(e){var t=this._instances.get(e);if(t){var s=new o.Mesh(t.model.root.children[0].geometry.clone());var r=t.world.clone();if(t.model.normalized){r.multiply(t.model.normalized.world)}r.multiply(t.model.root.children[0].matrixWorld);r.decompose(s.position,s.quaternion,s.scale);s.updateMatrix();this._root.add(s);return s}return null};f.prototype._instanceHitTest=function(e){if(e.instanceId>=0){var t=this.hitInfo[e.instanceId];e.world=t.matrices[e.instanceId];return t.instance}return null};f.prototype._getColladaLoader=function(){return this._colladaLoader||(this._colladaLoader=new o.ColladaLoader)};f.prototype._getGlTFLoader=function(){return this._glTFLoader||(this._glTFLoader=new o.GLTFLoader)};return f});
//# sourceMappingURL=ModelHandler.js.map
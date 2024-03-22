/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../thirdparty/three","./PolylineGeometry","./PolylineMaterial"],function(e,t,r){"use strict";function a(i,n){var l=i!==undefined?i:new t;var c=n!==undefined?n:new r;var o=new e.Mesh(l,c);Object.setPrototypeOf(o,a.prototype);this.type="PolylineMesh";return o}a.prototype=Object.assign(Object.create(e.Mesh.prototype),{constructor:a,isPolylineMesh:true,computeLineDistances:function(){var t=new e.Vector4;var r=new e.Vector4;var a=new e.Vector2;var i=new e.Vector2;return function(e,n,l){var c=this.geometry;var o=c.attributes.instanceDistance.data;var p=o.array;var y=c.vertices;var s=0,u;t.copy(y[0]).applyMatrix4(e);for(var w=0,d=0,f=o.count;w<f;w++,d+=2){r.copy(y[w+1]).applyMatrix4(e);if(l!==undefined){if(t.w>=l){a.copy(t).multiplyScalar(1/t.w);if(r.w>=l){i.copy(r).multiplyScalar(1/r.w)}else{u=(t.w-l)/(t.w-r.w);i.copy(r).sub(t).multiplyScalar(u).add(t).multiplyScalar(1/l)}}else if(r.w>=l){i.copy(r).multiplyScalar(1/r.w);u=(r.w-l)/(r.w-t.w);a.copy(t).sub(r).multiplyScalar(u).add(r).multiplyScalar(1/l)}else{a.set(0,0,0);i.set(0,0,0)}}else{a.copy(t);i.copy(r)}p[d]=s;s+=i.sub(a).multiply(n).length()*.5;p[d+1]=s;t.copy(r)}this.material.lineLength=s;o.needsUpdate=true;return this}}()});return a});
//# sourceMappingURL=PolylineMesh.js.map
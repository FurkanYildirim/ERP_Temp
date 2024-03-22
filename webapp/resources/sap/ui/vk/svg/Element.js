/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */
sap.ui.define(["../abgrToColor","../cssColorToColor","../NodeContentType","sap/base/assert","sap/base/util/uid"],function(t,e,i,s,r){"use strict";var o=10;var n=function(t){t=t||{};this.type="Group";this.uid=r();this.sid=t.sid||undefined;this.name=t.name||undefined;this.vMask=1|0;this.sMask=0|0;this.matrix=new Float32Array(t.matrix||[1,0,0,1,0,0]);this.parent=null;this.children=[];this.domRef=null;this.nodeContentType=i.Regular;this.materialId=t.materialID;if(t.lineStyle){this.lineStyle=t.lineStyle}if(t.fillStyle){this.fillStyle=t.fillStyle}this.userData=t.subelement?{skipIt:true}:{};this.classList=new Set};function a(t,i){if(t===null||t===undefined){return Float32Array([0,0,0,i])}var s=t.match(/\w\w/g).map(function(t){return parseInt(t,16)});if(s.length==4){i=s[3]/255}if(s.length<3||isNaN(s[0]+s[1]+s[2]+i)){t=e(t);return new Float32Array([t.red/255,t.green/255,t.blue/255,t.alpha])}return new Float32Array([s[0]/255,s[1]/255,s[2]/255,i])}function h(t,e){if(t){if(typeof t==="string"){return a(t,e)}else if(t.length===4){return new Float32Array(t)}else{return new Float32Array([t[0],t[1],t[2],e])}}return new Float32Array([0,0,0,0])}n.prototype.defaultFillAlpha=0;n.prototype.setFillStyle=function(t,e){if(t){this.fillStyle=t;if(t.fillURL){this.fillURL=t.fillURL}else{this.fill=h(t.colour,1)}}else{this.fill=new Float32Array([0,0,0,0])}if(this._fillStyleId){this.removeClass(this._fillStyleId);this._fillStyleId=null}if(e){this.invalidate()}};n.prototype.setLineStyle=function(t,e){if(t){this.lineStyle=t;this.stroke=h(t.colour,1);this.strokeWidth=t.width||1;this.coordinateSpace=t.coordinateSpace?t.coordinateSpace:o;this.strokeDashArray=n._convertDashes(t.dashes||[],this.strokeWidth);this.lineCap=t.linecap}else{this.stroke=new Float32Array([0,0,0,0]);this.strokeWidth=1;this.coordinateSpace=o;this.strokeDashArray=[]}if(this._lineStyleId){this.removeClass(this._lineStyleId);this._lineStyleId=null}if(e){this.invalidate()}};n.prototype.setMaterial=function(t,e){t=t||{};if(this.materialId===t.materialId){this.setFillStyle(this.fillStyle);var i=this.lineStyle;if(i){this.setLineStyle(i)}else{this.stroke=h(t.lineColor,1);this.strokeWidth=t.lineWidth!==undefined?t.lineWidth:1;this.strokeDashArray=t.lineStyle&&t.lineStyle.dashPattern||[]}}for(var s=0,r=this.children.length;s<r;s++){this.children[s].setMaterial(t)}if(e){this.invalidate()}};n._convertDashes=function(t,e){var i=[];for(var s=0;s<t.length;s++){var r=t[s]*10;if(r>0){i.push(r);i.push(0)}else if(r<0){i.push(0);i.push(-r)}else{i.push(e);i.push(e)}}return i};n._convertToDashes=function(t,e){var i=[];for(var s=0;s<t.length;s+=2){var r=t[s];var o=t[s+1];if(r===e&&o===e){i.push(0)}else if(o===0){i.push(r*.1)}else if(r===0){i.push(o*-.1)}}return i};n.prototype.add=function(t){if(t.parent!==null){t.parent.remove(t)}t.parent=this;this.children.push(t);t.sMask=this.sMask;if(this.highlightColor){t.highlightColor=this.highlightColor}var e=this._hasHostpotAncestor();if(e||this.nodeContentType===i.Hotspot){this._updateHotspotDescendants(e?null:this)}if(this.domRef){t.traverse(function(t){if(!t.domRef){t.domRef=u(t)?t.parent.domRef:t._createDomElement()}if(t.domRef&&t.parent.domRef&&t.parent.domRef!==t.domRef&&t.domRef.parentNode!==t.parent.domRef){t.parent.domRef.appendChild(t.domRef)}})}return this};n.prototype.remove=function(t){var e=this.children.indexOf(t);if(e!==-1){if(t.domRef&&this.domRef&&t.domRef.parentNode===this.domRef){this.domRef.removeChild(t.domRef)}t.parent=null;this.children.splice(e,1)}return this};n.prototype.replace=function(t,e){var i=this.children.indexOf(t);if(i!==-1){t.parent=null;e.parent=this;this.children[i]=e;e.domRef=t.domRef;e.invalidate()}return this};n.prototype._vkPersistentId=function(){var t=this;do{if(t.sid){return t.sid}t=t.parent}while(t);return null};n.prototype._vkGetNodeContentType=function(){return this.nodeContentType};n.prototype._updateHotspotDescendants=function(t){this.traverse(function(e){if(e===t){return}e.userData.skipIt=true;if(e._isGeometryNode()){e.fill=e.stroke=new Float32Array([1,1,1,1]);e._updateColor()}else if(e.domRef){e.domRef.removeAttribute("filter");e.domRef.removeAttribute("opacity")}})};n.prototype._initAsHotspot=function(){if(this._hasHostpotAncestor()){return}this._updateHotspotDescendants(this);if(this.domRef!==null){if(this.domRef===(this.parent&&this.parent.domRef)){this.invalidate()}else{this._updateColor()}}};n.prototype._vkSetNodeContentType=function(t){this.nodeContentType=t;if(t===i.Hotspot){this._initAsHotspot()}};n.prototype.traverse=function(t){t(this);var e=this.children;for(var i=0,s=e.length;i<s;i++){e[i].traverse(t)}};n.prototype.traverseAncestors=function(t){var e=this.parent;if(e!==null){t(e);e.traverseAncestors(t)}};n.prototype.traverseVisible=function(t,e){if(this.isVisible(e)){t(this);var i=this.children;for(var s=0,r=i.length;s<r;s++){i[s].traverseVisible(t,e)}}};n.prototype.setVisible=function(t,e){if(!this.userData.skipIt){if(e){this.vMask|=t}else{this.vMask&=~t}if(this.domRef!==null){if(this.parent&&this.domRef===this.parent.domRef^u(this)){this.invalidate()}else if(e){this.domRef.removeAttribute("display")}else{this.domRef.setAttribute("display","none")}}}};n.prototype.isVisible=function(t){return this.userData.skipIt||(this.vMask&t)!==0};n.prototype._updateColor=function(t){var e=this.domRef;if(e!==null){if(this.nodeContentType===i.Hotspot&&!this._hasHostpotAncestor()){e.setAttribute("filter","url(#"+this.getHotspotEffectDef().name+")");e.setAttribute("opacity",this._getHotspotOpacity())}else{var s=e.setAttribute.bind(e);if(this.highlightColor||this.tintColor){if(this._fillStyleId){this.removeClass(this._fillStyleId)}this._setFillStyleAttributes(s);if(this._lineStyleId){this.removeClass(this._lineStyleId)}this._setLineStyleAttributes(s)}else{if(this._fillStyleId){this.addClass(this._fillStyleId);e.removeAttribute("fill")}else{this._setFillStyleAttributes(s)}if(this._lineStyleId){this.addClass(this._lineStyleId);e.removeAttribute("stroke");e.removeAttribute("stroke-width");e.removeAttribute("vector-effect");e.removeAttribute("stroke-dasharray")}else{this._setLineStyleAttributes(s)}}}}};n.prototype._getHotspotOpacity=function(){return this.highlightColor||this.customHotspotColor||this.hotspotColor?1:0};n._hotspotEffectName=function(t){return"hotspot-effect-"+v(t.red,t.green,t.blue,t.alpha)};n.prototype.getHotspotEffectDef=function(){var i;if(this.highlightColor){i=t(this.highlightColor)}else{var s=this.customHotspotColor||this.hotspotColor;if(s){i=typeof s==="number"?t(s):e(s)}else{i={red:0,green:0,blue:0,alpha:0}}}return{name:n._hotspotEffectName(i),color:i}};n.prototype.setSelected=function(t,e,i){if(e){this.sMask|=t;this.highlightColor=i}else{this.sMask&=~t;delete this.highlightColor}this._updateColor(t)};n.prototype.isSelected=function(t){return(this.sMask&t)!==0};n.prototype.setTintColor=function(t,e){s(this.nodeContentType!==i.Hotspot&&"setTintColor() method is not for hotspots, use setHotspotColor() method");this.tintColor=e;this._updateColor(t)};n.prototype.getTintColor=function(){return this.tintColor};n.prototype.setHotspotColor=function(t,e){s(this.nodeContentType===i.Hotspot&&"setHotspotColor() method is only for hotspots");this.hotspotColor=e;this._updateColor(t)};n.prototype.setCustomHotspotColor=function(t,e){s(this.nodeContentType===i.Hotspot&&"setCustomHotspotColor() method is only for hotspots");this.customHotspotColor=e;this._updateColor(t)};n.prototype._isGeometryNode=function(){return this.constructor!==n};n.prototype.setOpacity=function(t){s(this.nodeContentType!==i.Hotspot&&"setOpacity() method is not for hotspots");if(this._isGeometryNode()){return}this.opacity=t;if(this.domRef!==null){if(this.parent&&this.domRef===this.parent.domRef^u(this)){this.invalidate()}else if(t!==undefined){this.domRef.setAttribute("opacity",t)}else{this.domRef.removeAttribute("opacity")}}};function l(t){return t[0]===1&&t[1]===0&&t[2]===0&&t[3]===1&&t[4]===0&&t[5]===0}n.prototype.setMatrix=function(t){this.matrix.set(t);if(this.domRef!==null){if(this.parent&&this.domRef===this.parent.domRef^u(this)){this.invalidate()}else if(!this.parent||this.domRef!==this.parent.domRef){if(!l(t)){this.domRef.setAttribute("transform","matrix("+this.matrix.join(",")+")")}else{this.domRef.removeAttribute("transform")}}}};n._multiplyMatrices=function(t,e){var i=t[0],s=t[2],r=t[4];var o=t[1],n=t[3],a=t[5];var h=e[0],l=e[2],f=e[4];var d=e[1],p=e[3],u=e[5];return new Float32Array([i*h+s*d,o*h+n*d,i*l+s*p,o*l+n*p,i*f+s*u+r,o*f+n*u+a])};n._invertMatrix=function(t){var e=t[0],i=t[1],s=t[2],r=t[3],o=t[4],n=t[5],a=e*r-i*s;if(a===0){return new Float32Array([0,0,0,0,0,0])}var h=1/a;var l=new Float32Array(6);l[0]=r*h;l[1]=-i*h;l[2]=-s*h;l[3]=e*h;l[4]=(n*s-r*o)*h;l[5]=(i*o-n*e)*h;return l};n._decompose=function(t){var e=Math.sqrt(t[0]*t[0]+t[1]*t[1]);var i=Math.sqrt(t[2]*t[2]+t[3]*t[3]);var s=t[0]*t[3]-t[1]*t[2];if(s<0){i*=-1}var r=t[0]/e,o=t[1]/e,n=t[2]/i,a=t[3]/i;var h,l;if(r+a+1>0){l=.5/Math.sqrt(2+r+a);h=[0,0,(n-o)*l,.25/l]}else{l=2*Math.sqrt(2-r-a);h=[0,0,.25*l,(n-o)/l]}return{position:[t[4],t[5],0],quaternion:h,scale:[e,i,1]}};n._compose=function(t,e,i){var s=i[0],r=i[1];var o=e[0],n=e[1],a=-e[2],h=e[3];var l=o*n,f=a*a,d=h*a;return new Float32Array([(1-(n*n+f)*2)*s,(l+d)*2*s,(l-d)*2*r,(1-(o*o+f)*2)*r,t[0],t[1]])};n._transformPoint=function(t,e,i){return{x:t*i[0]+e*i[2]+i[4],y:t*i[1]+e*i[3]+i[5]}};n.prototype._matrixWorld=function(t){if(t!==undefined){return n._multiplyMatrices(t,this.matrix)}else{var e=this.parent;var i=this.matrix;while(e!==null){i=n._multiplyMatrices(e.matrix,i);e=e.parent}return i}};function f(t,e,i,s,r){t.min.x=Math.min(t.min.x,e-s);t.min.y=Math.min(t.min.y,i-r);t.max.x=Math.max(t.max.x,e+s);t.max.y=Math.max(t.max.y,i+r)}function d(t){return t*t}n.prototype._expandBoundingBoxCE=function(t,e,i,s,r,o){f(t,i*e[0]+s*e[2]+e[4],i*e[1]+s*e[3]+e[5],Math.abs(r*e[0])+Math.abs(o*e[2]),Math.abs(r*e[1])+Math.abs(o*e[3]))};n.prototype._expandBoundingBoxCR=function(t,e,i,s,r,o){f(t,i*e[0]+s*e[2]+e[4],i*e[1]+s*e[3]+e[5],Math.sqrt(d(r*e[0])+d(o*e[2])),Math.sqrt(d(r*e[1])+d(o*e[3])))};n.prototype._expandBoundingBox=function(t,e){};n.prototype._expandBoundingBoxRecursive=function(t,e,i){if(this.isVisible(e)){var s=this._matrixWorld(i);this._expandBoundingBox(t,s);var r=this.children;for(var o=0,n=r.length;o<n;o++){r[o]._expandBoundingBoxRecursive(t,e,s)}}};function p(t,e){var i=t.width*.5;var s=t.height*.5;var r=t.x+i;var o=t.y+s;var n=r*e[0]+o*e[2]+e[4];var a=r*e[1]+o*e[3]+e[5];var h=Math.abs(i*e[0])+Math.abs(s*e[2]);var l=Math.abs(i*e[1])+Math.abs(s*e[3]);return{x:n-h,y:a-l,width:h*2,height:l*2}}n.prototype._getBBox=function(t){if(this.domRef){var e;if(!this.parent||this.domRef!==this.parent.domRef){e=this.domRef.getBBox();if(t&&e){e=p(e,t)}return e}var i=Infinity,s=Infinity,r=-Infinity,o=-Infinity;for(var a=0,h=this.children.length;a<h;a++){var l=this.children[a];e=l._getBBox(t?n._multiplyMatrices(t,l.matrix):l.matrix);if(e){i=Math.min(i,e.x);s=Math.min(s,e.y);r=Math.max(r,e.x+e.width);o=Math.max(o,e.y+e.height)}}if(i<=r&&s<=o){return{x:i,y:s,width:r-i,height:o-s}}}return null};function u(t){return t.parent!==null&&t.constructor===n&&l(t.matrix)&&t.opacity===undefined&&(t.nodeContentType!==i.Hotspot||t._hasHostpotAncestor())&&t.vMask===1}n.prototype._getSceneTreeElement=function(){var t=this;var e=t.parent;while(e){if(e.userData.closed||e.nodeContentType!==i.Regular){t=e}e=e.parent}while(t.userData.skipIt){t=t.parent}return t};function c(t,e,i){function s(t,e,i){var s,r;for(var o=0,n=t.length;o<n;o++){var a=t[o];var h=e*a.x+i*a.y;if(o===0||s>h){s=h}if(o===0||r<h){r=h}}return{min:s,max:r}}var r=[n._transformPoint(t.x,t.y,e),n._transformPoint(t.x+t.width,t.y,e),n._transformPoint(t.x+t.width,t.y+t.height,e),n._transformPoint(t.x,t.y+t.height,e)];var o=[{x:i.x1,y:i.y1},{x:i.x2,y:i.y1},{x:i.x2,y:i.y2},{x:i.x1,y:i.y2}];var a=r.concat(o);for(var h=0,l=a.length-1;h<a.length;l=h++){var f=a[l];var d=a[h];var p=d.y-f.y,u=f.x-d.x;var c=s(r,p,u);var y=s(o,p,u);if(c.max<y.min||y.max<c.min){return false}}return true}n.prototype._findRectElementsRecursive=function(t,e,i,s){if(this.isVisible(i)){var r=this._matrixWorld(s);if(this._isGeometryNode()){var o=this._getBBox();if(o&&c(o,r,e)){t.add(this._getSceneTreeElement())}}var n=this.children;for(var a=0,h=n.length;a<h;a++){n[a]._findRectElementsRecursive(t,e,i,r)}}};n.prototype.tagName=function(){return"g"};n.prototype._setBaseAttributes=function(t,e){t("id",this.uid);if(this.nodeContentType===i.Hotspot){if(!this._hasHostpotAncestor()){t("filter","url(#"+this.getHotspotEffectDef().name+")");t("opacity",this._getHotspotOpacity())}}else if(this.opacity!==undefined){t("opacity",this.opacity)}if(!l(this.matrix)){t("transform","matrix("+this.matrix.join(",")+")")}if(!this.isVisible(e)){t("display","none")}if(!this._fillStyleId||!this.classList.has(this._fillStyleId)){this._setFillStyleAttributes(t)}if(!this._lineStyleId||!this.classList.has(this._lineStyleId)){this._setLineStyleAttributes(t)}if(this.classList.size){t("class",Array.from(this.classList).join(" "))}};n.prototype._setSpecificAttributes=function(t,e){};n.prototype._setFillStyleAttributes=function(t){if(this.fillURL!==undefined){t("fill",this.fillURL)}else if(this.fill!==undefined){t("fill",this._cssColor(this.fill))}};n.prototype._setLineStyleAttributes=function(t){if(this.stroke!==undefined&&this.stroke[3]>0&&this.strokeWidth){t("stroke",this._cssColor(this.stroke));if(this.strokeWidth!==1){t("stroke-width",this.strokeWidth)}if(this.strokeDashArray.length>0){t("stroke-dasharray",this.strokeDashArray.join(" "))}if(this.lineCap!=null){t("stroke-linecap",this.lineCap)}if(!this.coordinateSpace||this.coordinateSpace===o){t("vector-effect","non-scaling-stroke")}}};n.prototype.render=function(t,e,s){var r=u(this),o;if(!r){o=this.tagName();t.openStart(o);if(s&&this._isGeometryNode()){var n=s._getFillStyleId(this);if(this._fillStyleId!==n){if(this._fillStyleId){this.removeClass(this._fillStyleId)}this._fillStyleId=n;if(n){this.addClass(this._fillStyleId)}}var a=s._getLineStyleId(this);if(this._lineStyleId!==a){if(this._lineStyleId){this.removeClass(this._lineStyleId)}this._lineStyleId=a;if(a){this.addClass(this._lineStyleId)}}}var h=t.attr.bind(t);this._setBaseAttributes(h,e);this._setSpecificAttributes(h,null);t.openEnd();if(this._renderContent){this._renderContent(t)}}var l=[];this.children.forEach(function(r){if(r.nodeContentType===i.Hotspot){l.push(r)}else{r.render(t,e,s)}});l.forEach(function(i){i.render(t,e)});if(!r){t.close(o)}};n._svgNamespace="http://www.w3.org/2000/svg";n.prototype._createDomElement=function(t){var e=document.createElementNS(n._svgNamespace,this.tagName());var i=e.setAttribute.bind(e);this._setBaseAttributes(i,1<<t);this._setSpecificAttributes(i,e);if(this._createContent){this._createContent(e)}return e};function y(t,e){var i=t.domRef;if(i&&i!==e&&i.parentNode===e){return i}var s=t.children;for(var r=0,o=s.length;r<o;r++){i=y(s[r],e);if(i!==null){return i}}return null}n.prototype._replaceParentDomRef=function(t,e){for(var i=0,s=this.children.length;i<s;i++){var r=this.children[i];if(r.domRef){if(r.domRef===t){r.domRef=e;r._replaceParentDomRef(t,e)}else if(r.domRef.parentNode===t){if(t.parentNode===e){e.insertBefore(r.domRef,t)}else{e.appendChild(r.domRef)}}}}};n.prototype.invalidate=function(t){var e=this.domRef;if(e!==null){var i=this.parent&&this.parent.domRef;if(u(this)){if(e!==i){this.domRef=i;this._replaceParentDomRef(e,this.domRef);e.remove()}}else{this.domRef=this._createDomElement(t);if(e===i){i.insertBefore(this.domRef,y(this,i))}else if(i){i.replaceChild(this.domRef,e)}this._replaceParentDomRef(e,this.domRef)}}};n.prototype._setDomRef=function(t){this.domRef=t;var e=this.children;for(var i=0,s=e.length;i<s;i++){var r=e[i];var o=document.getElementById(r.uid);if(o===null&&u(r)){o=t}r._setDomRef(o)}};n.prototype.getElementByProperty=function(t,e){if(this[t]===e){return this}var i=this.children;for(var s=0,r=i.length;s<r;s++){var o=i[s].getElementByProperty(t,e);if(o!==null){return o}}return null};n.prototype.getElementById=function(t){return this.getElementByProperty("uid",t)};n.prototype.copy=function(t,e){this.name=t.name;this.matrix=t.matrix.slice();this.nodeContentType=t.nodeContentType;this.materialId=t.materialId;this.lineStyle=t.lineStyle;this.fillStyle=t.fillStyle;this.classList=new Set(t.classList);if(t.opacity!==undefined){this.opacity=t.opacity}if(t.tintColor!==undefined){this.tintColor=t.tintColor}if(t.hotspotColor){this.hotspotColor=t.hotspotColor}if(t.customHotspotColor){this.customHotspotColor=t.customHotspotColor}if(t.fillURL!==undefined){this.fillURL=t.fillURL}if(t.fill!==undefined){this.fill=t.fill.slice()}if(t.stroke!==undefined){this.stroke=t.stroke.slice()}if(t.strokeWidth!==undefined){this.strokeWidth=t.strokeWidth}if(t.coordinateSpace){this.coordinateSpace=t.coordinateSpace}if(t.lineCap!==undefined){this.lineCap=t.lineCap}if(t.strokeDashArray!==undefined){this.strokeDashArray=t.strokeDashArray.slice()}if(t.userData.skipIt){this.userData.skipIt=true}if(e||e===undefined){for(var i=0,s=t.children.length;i<s;i++){this.add(t.children[i].clone())}}return this};n.prototype.clone=function(){return(new this.constructor).copy(this)};function m(t,e,i){return t+(e-t)*i}function v(t,e,i,s){var r=(t<<24|e<<16|i<<8|s*255)>>>0;return"#"+r.toString(16).padStart(8,"0")}function _(t){return v(t[0]*255,t[1]*255,t[2]*255,t[3])}n.prototype._cssColor=function(e){var i=e[3];if(i===0){return"none"}var s=e[0]*255;var r=e[1]*255;var o=e[2]*255;var n=this.tintColor;if(n){n=t(n);var a=n.alpha;if(a>0){s=m(s,n.red,a);r=m(r,n.green,a);o=m(o,n.blue,a)}}var h=this.highlightColor;if(h){h=t(h);var l=h.alpha;if(l>0){s=m(s,h.red,l);r=m(r,h.green,l);o=m(o,h.blue,l);i=m(i,l,l)}}return v(s,r,o,i)};function C(t,e){function i(t,e){return Object.entries(t).every(function(t){return e[t[0]]===t[1]})&&Object.entries(e).every(function(e){return t[e[0]]===e[1]})}var s=e.findIndex(function(e){return i(e,t)});if(s<0){s=e.length;e.push(t)}return s}n.prototype._getParametricShape=function(t,e,i){var s={};if(!l(this.matrix)){var r=n._decompose(this.matrix);s.t=r.position;s.r=r.quaternion;s.s=r.scale}var o=this._hasHostpotAncestor();var a=parseFloat(this.strokeWidth);var h={width:typeof this.strokeWidth==="number"?this.strokeWidth+"px":this.strokeWidth,coordinateSpace:this.coordinateSpace};if(this.strokeDashArray&&this.strokeDashArray.length>0){h.dashes=n._convertToDashes(this.strokeDashArray,this.strokeWidth)}if(!o){if(this.fill!==undefined){s.fill=C({colour:_(this.fill)},t)}if(this.stroke!==undefined&&this.stroke[3]>0&&a>0){h.colour=_(this.stroke);s.stroke=C(h,e)}}else if(this.stroke!==undefined&&this.stroke[3]>0&&a>0&&(a!==1||this.strokeDashArray.length>0)){s.stroke=C(h,e)}return s};n.prototype.getParametricContent=function(t,e,i){var s=[];this.children.forEach(function(r){var o=r._getParametricShape(t,e,i);if(o.type!==undefined){s.push(o)}});if(s.length===0){return null}return s.length===1?s[0]:{shapes:s}};n.prototype._hasHostpotAncestor=function(){var t=this.parent;while(t){if(t.nodeContentType===i.Hotspot){return true}t=t.parent}return false};n.prototype.addClass=function(t){this.classList.add(t);if(this.domRef){this.domRef.setAttribute("class",Array.from(this.classList).join(" "))}return this};n.prototype.removeClass=function(t){this.classList.delete(t);if(this.domRef){if(this.classList.size){this.domRef.setAttribute("class",Array.from(this.classList).join(" "))}else{this.domRef.removeAttribute("class")}}return this};n.prototype.hasClass=function(t){return this.classList.has(t)};n.prototype.toggleClass=function(t){if(this.hasClass(t)){this.removeClass(t)}else{this.addClass(t)}return this};return n});
//# sourceMappingURL=Element.js.map
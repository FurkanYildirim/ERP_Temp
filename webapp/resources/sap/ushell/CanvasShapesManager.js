// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/Device","sap/ui/core/theming/Parameters"],function(e,t){"use strict";var n=function(e,t){this.x=e||0;this.y=t||0};n.prototype.getDistance=function(e){var t=this.x-e.x,n=this.y-e.y;return Math.floor(Math.sqrt(t*t+n*n))};n.prototype.getSegment=function(e){if(this.x<=e.x&&this.y<=e.y){return 1}if(this.x<=e.x&&this.y>=e.y){return 2}if(this.x>=e.x&&this.y>=e.y){return 3}if(this.x>=e.x&&this.y<=e.y){return 4}};n.prototype.offset=function(e,t){this.x=this.x+e;this.y=this.y+t};var i=function(e,t,n,i){this.x={min:e,max:t};this.y={min:n,max:i}};var r=window.innerWidth>0?window.innerWidth:screen.width;var o=window.innerHeight>0?window.innerHeight:screen.height;var s={cpr1:new i(0,r/4,0,o/4),cpr2:new i(r/2,r,0,o/4),cpr3:new i(r/4,3*r/4,o*3/4,o)};var a=function(){this.init()};a.prototype={radiusRange:{min:800,max:900},_getCanvas:function(){var e=document.getElementById("shell-shapes");if(e){return e}return this._createCanvas("shell-shapes")},_createCanvas:function(e){var t=document.createElement("canvas");t.setAttribute("id",e);t.setAttribute("role","presentation");this._updateCanvasDimensions(t);sap.ushell.Container.getRenderer().setShellShapes(t);return t},_updateCanvasDimensions:function(e){e.height=window.innerHeight>0?window.innerHeight:screen.height+"px";e.width=window.innerWidth>0?window.innerWidth:screen.width+"px"},init:function(){var t={cpr1:s.cpr1,cpr2:s.cpr2,cpr3:s.cpr3},n,i,r,o,a;this.shapes=[];this.bIsDirty=true;for(a in t){n=Math.random(this.radiusRange.max-this.radiusRange.min)+this.radiusRange.min;i=this.getRandomPoint(t[a]);r=this._getSquarePoints(n,i);o=this._calculatebezierCurves(n,r);this.shapes.push({bezierCurves:o,centerPoint:i})}for(var h in this.shapes){var u=this._generateRandomAmorphousShapeValues();this.shapes[h]=this.makeAmorphousShape(this.shapes[h],u.edge0.edgeNum,u.edge0.xOffSet,u.edge0.yOffSet,u.edge0.xStretch);this.shapes[h]=this.makeAmorphousShape(this.shapes[h],u.edge1.edgeNum,u.edge1.xOffSet,u.edge1.yOffSet,u.edge1.xStretch)}sap.ui.getCore().attachThemeChanged(this.onThemeChanged.bind(this));e.resize.attachHandler(this.resizeHandler,this)},_generateRandomAmorphousShapeValues:function(){var e={edge0:{edgeNum:0,xOffSet:0,yOffSet:0,xStretch:0},edge1:{edgeNum:0,xOffSet:0,yOffSet:0,xStretch:0}};var t=this._getRandomInt(0,3);for(var n in e){e[n].edgeNum=t;e[n].xOffSet=this._getRandomInt(200,400);e[n].yOffSet=this._getRandomInt(-200,-400);t+=this._getRandomInt(0,1)<.5?-1:1;if(t===-1){t=3}if(t===4){t=0}}t=this._getRandomInt(0,1);if(t<.5){t=t<.25?0:1;e["edge"+t].xStretch=this._getRandomInt(0,200)}return e},getPoint:function(e,t){return new n(e,t)},getRandomPoint:function(e){var t=Math.floor(Math.random()*(e.x.max-e.x.min)+e.x.min),i=Math.floor(Math.random()*(e.y.max-e.y.min)+e.y.min);return new n(t,i)},onThemeChanged:function(){var e=t.get("sapUiShellBackgroundPatternColor");if(e&&e!=="transparent"){this.sShapesColor=e;this.bIsDirty=true;this.drawShapes()}},resizeHandler:function(){var e=this._getCanvas();if(e){this._updateCanvasDimensions(e);this.bIsDirty=true;this.onThemeChanged()}},enableAnimationDrawing:function(e){this._enableDrawing=e},makeAmorphousShape:function(e,t,n,i){var r,o,s;switch(t){case 0:r=e.bezierCurves[0].controlPoint1;o=e.bezierCurves[3].controlPoint2;s=this._rotatePoints(n,i,r,o);e.bezierCurves[0].controlPoint1=s[0];e.bezierCurves[3].controlPoint2=s[1];break;case 1:r=e.bezierCurves[0].controlPoint2;o=e.bezierCurves[1].controlPoint1;s=this._rotatePoints(n,i,r,o);e.bezierCurves[0].controlPoint2=s[0];e.bezierCurves[1].controlPoint1=s[1];break;case 2:r=e.bezierCurves[1].controlPoint2;o=e.bezierCurves[2].controlPoint1;s=this._rotatePoints(n,i,r,o);e.bezierCurves[1].controlPoint2=s[0];e.bezierCurves[2].controlPoint1=s[1];break;case 3:r=e.bezierCurves[2].controlPoint2;o=e.bezierCurves[3].controlPoint1;s=this._rotatePoints(n,i,r,o);e.bezierCurves[2].controlPoint2=s[0];e.bezierCurves[3].controlPoint1=s[1];break}return e},_rotatePoints:function(e,t,i,r){var o,s,a=[];o=i.x+e;s=i.y+t;a.push(new n(o,s));o=r.x-e;s=r.y-t;a.push(new n(o,s));return a},_getSquarePoints:function(e,t){var i=[];i[0]=new n(t.x+e,t.y);i[1]=new n(t.x,t.y-e);i[2]=new n(t.x-e,t.y);i[3]=new n(t.x,t.y+e);return i},_getRandomInt:function(e,t){if(e==0&&t==1){return Math.random()}return Math.floor(Math.random()*(t-e+1))+e},_calculatebezierCurves:function(e,t){var i=[],r,o,s,a;a=t[0];s=t[1];r=new n(a.x,a.y-e/2);o=new n(a.x-e/2,a.y-e);i.push({startPoint:a,endPoint:s,controlPoint1:r,controlPoint2:o});a=t[1];s=t[2];r=new n(a.x-e/2,a.y);o=new n(a.x-e,a.y+e/2);i.push({startPoint:a,endPoint:s,controlPoint1:r,controlPoint2:o});a=t[2];s=t[3];r=new n(a.x,a.y+e/2);o=new n(a.x+e/2,a.y+e);i.push({startPoint:a,endPoint:s,controlPoint1:r,controlPoint2:o});a=t[3];s=t[0];r=new n(a.x+e/2,a.y);o=new n(a.x+e,a.y-e/2);i.push({startPoint:a,endPoint:s,controlPoint1:r,controlPoint2:o});return i},drawShapes:function(){var e=this._getCanvas();if(this.bIsDirty&&e&&e.getContext){var n=e.getContext("2d"),i,s,a,h;n.clearRect(0,0,r*2,o*2);if(!this.sShapesColor){this.sShapesColor=t.get("sapUiShellBackgroundPatternColor")}if(this.sShapesColor&&this.sShapesColor!=="transparent"){for(var u=0;u<this.shapes.length;u++){n.beginPath();i=this.shapes[u].bezierCurves[0].startPoint;n.moveTo(i.x,i.y);for(var c=0;c<this.shapes[u].bezierCurves.length;c++){s=this.shapes[u].bezierCurves[c].endPoint;a=this.shapes[u].bezierCurves[c].controlPoint1;h=this.shapes[u].bezierCurves[c].controlPoint2;n.bezierCurveTo(Math.floor(a.x),Math.floor(a.y),Math.floor(h.x),Math.floor(h.y),Math.floor(s.x),Math.floor(s.y))}n.closePath();n.fillStyle=this.sShapesColor;n.fill()}}this.bIsDirty=false}}};var h=new a;return h},false);
//# sourceMappingURL=CanvasShapesManager.js.map
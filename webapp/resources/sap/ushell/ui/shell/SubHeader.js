// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/Control","sap/ushell/library"],function(t,n){"use strict";var e=t.extend("sap.ushell.ui.shell.SubHeader",{metadata:{library:"sap.ushell",aggregations:{content:{type:"sap.ui.core.Control",multiple:true,singularName:"content"}}},renderer:{apiVersion:2,render:function(t,n){t.openStart("div",n);t.class("sapUshellSubHeader");t.openEnd();t.close("div")}}});e.prototype.init=function(){this.aContent=[]};e.prototype.onAfterRendering=function(){var t=this.getContent();if(t.length){t[0].placeAt(this.getDomRef(),"only")}};e.prototype.addContent=function(t){this.aContent.push(t);this.invalidate()};e.prototype.removeContent=function(t){var n=this.aContent.findIndex(function(n){return n===t});if(n>-1){this.aContent.splice(n,1)}this.invalidate();return t};e.prototype.getContent=function(){return this.aContent};e.prototype.destroyContent=function(){for(var t=0;this.aContent.length>t;t++){this.aContent[t].destroy();delete this.aContent[t]}this.aContent=[];this.invalidate()};e.exit=function(){this.destroyContent();this.aContent=null};return e});
//# sourceMappingURL=SubHeader.js.map
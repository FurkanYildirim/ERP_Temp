/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/m/SplitButton","./RTESplitButtonRenderer"],function(t){"use strict";var e=t.extend("sap.ui.richtexteditor.RTESplitButton",{metadata:{properties:{currentColor:{type:"sap.ui.core.CSSColor",group:"Appearance",defaultValue:"rgb(0, 0, 0)"}},interfaces:["sap.m.IOverflowToolbarContent"],library:"sap.ui.richtexteditor"}});e.prototype.init=function(){t.prototype.init.apply(this,arguments);this._cachedElem=this._createIcon()};e.prototype._createIcon=function(){var t,e,r,o,n,i={x:"1",y:"12",width:"14",height:"3",rx:"0.2",ry:"0.2"},l="http://www.w3.org/2000/svg";t=document.createElementNS(l,"svg");t.setAttribute("class","rteFontColorIcon");t.setAttribute("viewBox","0 0 16 16");t.style.fill=this.getCurrentColor();e=document.createElementNS(l,"path");e.setAttribute("d","M662.477,379.355h3.038l.806,2.7h1.163l-2.729-9h-1.518l-2.753,9h1.21Zm1.519-5.4,1.281,4.5h-2.586Z");e.setAttribute("transform","translate(-656.047 -373.055)");t.appendChild(e);r=document.createElementNS(l,"rect");r.setAttribute("class","outline");o=document.createElementNS(l,"rect");o.setAttribute("class","fill");for(n in i){r.setAttribute(n,i[n]);o.setAttribute(n,i[n])}t.appendChild(r);t.appendChild(o);return t};e.prototype.onAfterRendering=function(){t.prototype.onAfterRendering.apply(this,arguments);this.$().find(".sapMSBText .sapMBtnInner").html(this._cachedElem)};e.prototype.onBeforeRendering=function(){this.addStyleClass("sapRTESB")};e.prototype.exit=function(){t.prototype.exit.apply(this,arguments);this._cachedElem=null};e.prototype._getIconSvgFill=function(){return this._cachedElem&&this._cachedElem.querySelector(".fill")};e.prototype.getIconColor=function(){return this.getCurrentColor()};e.prototype.setIconColor=function(t){var e=this._getIconSvgFill();if(e){e.style.fill=t}this.setProperty("currentColor",t,false);return this};return e});
//# sourceMappingURL=RTESplitButton.js.map
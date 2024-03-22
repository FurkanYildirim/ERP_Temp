/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["jquery.sap.global","sap/sac/df/thirdparty/lodash","sap/zen/dsh/utils/BaseHandler","sap/zen/dsh/widgets/filterpanel_m_handler"],function(){"use strict";var t=function(){this.items={}};t.prototype.add=function(t,e){this.items[t]=e};t.prototype.remove=function(t){delete this.items[t]};t.prototype.removeAll=function(){this.items={}};t.prototype.getItem=function(t){return this.items[t]};t.prototype.getItems=function(){var t=[];for(var e in this.items){t.push(e)}return t};t.prototype.getSelectedItemsTokenArray=function(t,e,i){var r=[];for(var s in this.items){var o=this.items[s];var a,n;if(typeof o==="string"){n=s;a=o}else{n=o[t];a=o[e];if(a===undefined){a=this.items[s]}else{if(i){a=this.getFormattedExpressionFromDisplayBehaviour(i,n,a)}else{a=a+" ("+n+")"}}}var p=new sap.m.Token({key:n,text:a,tooltip:a});if(typeof o!=="string"){p.data("row",o);p.data("longKey",s)}r.push(p)}return r};t.prototype.getFormattedExpressionFromDisplayBehaviour=function(t,e,i){var r;switch(t){case"TEXT_KEY":r=i+" ("+e+")";break;case"KEY_TEXT":r=e+" ("+i+")";break;case"TEXT":r=i;break;default:r=e;break}return r};t.prototype.getModelData=function(){var t=[];for(var e in this.items){var i=this.items[e];if(typeof i==="string"){i={missing:e}}t.push(i)}return t};return t});
//# sourceMappingURL=ItemsCollection.js.map
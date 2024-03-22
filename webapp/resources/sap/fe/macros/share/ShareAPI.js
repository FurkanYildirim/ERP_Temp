/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/fe/core/helpers/ClassSupport","sap/suite/ui/commons/collaboration/CollaborationHelper","../MacroAPI"],function(e,i,t,r){"use strict";var n,o,a,l,s,u,c;var f=i.property;var p=i.defineUI5Class;function b(e,i,t,r){if(!t)return;Object.defineProperty(e,i,{enumerable:t.enumerable,configurable:t.configurable,writable:t.writable,value:t.initializer?t.initializer.call(r):void 0})}function d(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function v(e,i){e.prototype=Object.create(i.prototype);e.prototype.constructor=e;h(e,i)}function h(e,i){h=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(i,t){i.__proto__=t;return i};return h(e,i)}function y(e,i,t,r,n){var o={};Object.keys(r).forEach(function(e){o[e]=r[e]});o.enumerable=!!o.enumerable;o.configurable=!!o.configurable;if("value"in o||o.initializer){o.writable=true}o=t.slice().reverse().reduce(function(t,r){return r(e,i,t)||t},o);if(n&&o.initializer!==void 0){o.value=o.initializer?o.initializer.call(n):void 0;o.initializer=undefined}if(o.initializer===void 0){Object.defineProperty(e,i,o);o=null}return o}function g(e,i){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let m=(n=p("sap.fe.macros.share.ShareAPI",{interfaces:["sap.m.IOverflowToolbarContent"]}),o=f({type:"string"}),a=f({type:"boolean",defaultValue:true}),n(l=(s=function(i){v(r,i);function r(){var e;for(var t=arguments.length,r=new Array(t),n=0;n<t;n++){r[n]=arguments[n]}e=i.call(this,...r)||this;b(e,"id",u,d(e));b(e,"visible",c,d(e));return e}var n=r.prototype;n.getOverflowToolbarConfig=function e(){return{canOverflow:false}};n.setVisibility=async function i(r){const n=await t.isTeamsModeActive();if(!n){this.content.setVisible(r);this.visible=r}else{e.info("Share Building Block: visibility not changed since application is running in teams mode!")}return Promise.resolve(this)};n.addStyleClass=function e(i){const t=this.getAggregation("content");t.addStyleClass(i);return this};return r}(r),u=y(s.prototype,"id",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),c=y(s.prototype,"visible",[a],{configurable:true,enumerable:true,writable:true,initializer:null}),s))||l);return m},false);
//# sourceMappingURL=ShareAPI.js.map
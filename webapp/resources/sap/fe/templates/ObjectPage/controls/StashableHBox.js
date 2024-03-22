/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport","sap/m/HBox","sap/ui/core/StashedControlSupport"],function(e,t,i){"use strict";var r,n,l,s,a,o,u;var f=e.property;var c=e.defineUI5Class;function p(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function h(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function g(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;b(e,t)}function b(e,t){b=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return b(e,t)}function m(e,t,i,r,n){var l={};Object.keys(r).forEach(function(e){l[e]=r[e]});l.enumerable=!!l.enumerable;l.configurable=!!l.configurable;if("value"in l||l.initializer){l.writable=true}l=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},l);if(n&&l.initializer!==void 0){l.value=l.initializer?l.initializer.call(n):void 0;l.initializer=undefined}if(l.initializer===void 0){Object.defineProperty(e,t,l);l=null}return l}function d(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let v=(r=c("sap.fe.templates.ObjectPage.controls.StashableHBox",{designtime:"sap/fe/templates/ObjectPage/designtime/StashableHBox.designtime"}),n=f({type:"string"}),l=f({type:"string"}),r(s=(a=function(e){g(t,e);function t(){var t;for(var i=arguments.length,r=new Array(i),n=0;n<i;n++){r[n]=arguments[n]}t=e.call(this,...r)||this;p(t,"title",o,h(t));p(t,"fallbackTitle",u,h(t));return t}var i=t.prototype;i.setTitle=function e(t){const i=this.getTitleControl();if(i){i.setText(t)}this.title=t;return this};i.getTitle=function e(){return this.title||this.fallbackTitle};i.onAfterRendering=function e(){if(this.title){this.setTitle(this.title)}else{const e=this.getTitleControl();if(e){this.title=e.getText()}}};i.getTitleControl=function e(){let t=[],i,r;if(this.getItems&&this.getItems()[0]&&this.getItems()[0].getItems){t=this.getItems()[0].getItems()}else if(this.getItems&&this.getItems()[0]&&this.getItems()[0].getMicroChartTitle){t=this.getItems()[0].getMicroChartTitle()}for(r=0;r<t.length;r++){if(t[r].isA("sap.m.Title")||t[r].isA("sap.m.Link")){if(t[r].isA("sap.m.Title")){i=t[r].getContent();if(i&&i.isA("sap.m.Link")){return i}}return t[r]}}return null};return t}(t),o=m(a.prototype,"title",[n],{configurable:true,enumerable:true,writable:true,initializer:null}),u=m(a.prototype,"fallbackTitle",[l],{configurable:true,enumerable:true,writable:true,initializer:null}),a))||s);i.mixInto(v);return v},false);
//# sourceMappingURL=StashableHBox.js.map
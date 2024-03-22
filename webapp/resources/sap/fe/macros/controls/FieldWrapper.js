/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport","sap/ui/core/Control"],function(e,t){"use strict";var i,r,n,l,a,o,u,s,c,p,d,f,b,y,h,g,m,v,w,_,A;var z=e.property;var D=e.implementInterface;var E=e.defineUI5Class;var C=e.association;var L=e.aggregation;function B(e,t,i,r){if(!i)return;Object.defineProperty(e,t,{enumerable:i.enumerable,configurable:i.configurable,writable:i.writable,value:i.initializer?i.initializer.call(r):void 0})}function I(e){if(e===void 0){throw new ReferenceError("this hasn't been initialised - super() hasn't been called")}return e}function O(e,t){e.prototype=Object.create(t.prototype);e.prototype.constructor=e;j(e,t)}function j(e,t){j=Object.setPrototypeOf?Object.setPrototypeOf.bind():function e(t,i){t.__proto__=i;return t};return j(e,t)}function S(e,t,i,r,n){var l={};Object.keys(r).forEach(function(e){l[e]=r[e]});l.enumerable=!!l.enumerable;l.configurable=!!l.configurable;if("value"in l||l.initializer){l.writable=true}l=i.slice().reverse().reduce(function(i,r){return r(e,t,i)||i},l);if(n&&l.initializer!==void 0){l.value=l.initializer?l.initializer.call(n):void 0;l.initializer=undefined}if(l.initializer===void 0){Object.defineProperty(e,t,l);l=null}return l}function x(e,t){throw new Error("Decorating class property failed. Please ensure that "+"proposal-class-properties is enabled and runs after the decorators transform.")}let F=(i=E("sap.fe.macros.controls.FieldWrapper"),r=D("sap.ui.core.IFormContent"),n=z({type:"sap.ui.core.TextAlign"}),l=z({type:"sap.ui.core.CSSSize",defaultValue:null}),a=z({type:"boolean",defaultValue:false}),o=z({type:"string",defaultValue:"Display"}),u=z({type:"boolean",defaultValue:false}),s=C({type:"sap.ui.core.Control",multiple:true,singularName:"ariaLabelledBy"}),c=L({type:"sap.ui.core.Control",multiple:false,isDefault:true}),p=L({type:"sap.ui.core.Control",multiple:true}),i(d=(f=function(e){O(t,e);function t(){var t;for(var i=arguments.length,r=new Array(i),n=0;n<i;n++){r[n]=arguments[n]}t=e.call(this,...r)||this;B(t,"__implements__sap_ui_core_IFormContent",b,I(t));B(t,"textAlign",y,I(t));B(t,"width",h,I(t));B(t,"formDoNotAdjustWidth",g,I(t));B(t,"editMode",m,I(t));B(t,"required",v,I(t));B(t,"ariaLabelledBy",w,I(t));B(t,"contentDisplay",_,I(t));B(t,"contentEdit",A,I(t));return t}var i=t.prototype;i.enhanceAccessibilityState=function e(t,i){const r=this.getParent();if(r&&r.enhanceAccessibilityState){r.enhanceAccessibilityState(this,i)}return i};i.getAccessibilityInfo=function e(){let t;if(this.editMode==="Display"){t=this.contentDisplay}else{t=this.contentEdit.length?this.contentEdit[0]:null}return t&&t.getAccessibilityInfo?t.getAccessibilityInfo():{}};i.getIdForLabel=function e(){var t;let i;if(this.editMode==="Display"){i=this.contentDisplay}else{i=this.contentEdit.length?this.contentEdit[0]:null}return(t=i)===null||t===void 0?void 0:t.getIdForLabel()};i._setAriaLabelledBy=function e(t){if(t&&t.addAriaLabelledBy){const e=this.ariaLabelledBy;for(let i=0;i<e.length;i++){const r=e[i];const n=t.getAriaLabelledBy()||[];if(n.indexOf(r)===-1){t.addAriaLabelledBy(r)}}}};i.onBeforeRendering=function e(){this._setAriaLabelledBy(this.contentDisplay);const t=this.contentEdit;for(let e=0;e<t.length;e++){this._setAriaLabelledBy(t[e])}};t.render=function e(t,i){t.openStart("div",i);t.style("text-align",i.textAlign);if(i.editMode==="Display"){t.style("width",i.width);t.openEnd();t.renderControl(i.contentDisplay)}else{const e=i.contentEdit;t.style("width",i.width);t.openEnd();for(let i=0;i<e.length;i++){const r=e[i];t.renderControl(r)}}t.close("div")};return t}(t),b=S(f.prototype,"__implements__sap_ui_core_IFormContent",[r],{configurable:true,enumerable:true,writable:true,initializer:function(){return true}}),y=S(f.prototype,"textAlign",[n],{configurable:true,enumerable:true,writable:true,initializer:null}),h=S(f.prototype,"width",[l],{configurable:true,enumerable:true,writable:true,initializer:null}),g=S(f.prototype,"formDoNotAdjustWidth",[a],{configurable:true,enumerable:true,writable:true,initializer:null}),m=S(f.prototype,"editMode",[o],{configurable:true,enumerable:true,writable:true,initializer:null}),v=S(f.prototype,"required",[u],{configurable:true,enumerable:true,writable:true,initializer:null}),w=S(f.prototype,"ariaLabelledBy",[s],{configurable:true,enumerable:true,writable:true,initializer:null}),_=S(f.prototype,"contentDisplay",[c],{configurable:true,enumerable:true,writable:true,initializer:null}),A=S(f.prototype,"contentEdit",[p],{configurable:true,enumerable:true,writable:true,initializer:null}),f))||d);return F},false);
//# sourceMappingURL=FieldWrapper.js.map
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log"],function(e){"use strict";var n={};let t;(function(e){e["After"]="After";e["Before"]="Before";e["End"]="End"})(t||(t={}));n.Placement=t;const o=(n,i,r,s)=>{let c=r.indexOf(i);if(c!==-1){return c}const l=n[i];if(l===undefined){const n=i.split("::"),t=Object.keys(s)[0];e.warning(`Position anchor '${n[n.length-1]}' not found for item '${t}'. Please check manifest settings.`);return r.length}s[i]=l;if(l&&!(l.anchor in s)){c=o(n,l.anchor,r,s);if(l.placement!==t.Before){++c}}else{c=r.length}r.splice(c,0,i);return c};let i;(function(e){e["merge"]="merge";e["overwrite"]="overwrite";e["ignore"]="ignore"})(i||(i={}));n.OverrideType=i;function r(e){return typeof e==="object"}function s(e,n,t){const o=n||t;for(const i in e){if(Object.hasOwnProperty.call(e,i)){const s=e[i];if(n!==null){switch(s){case"overwrite":if(t.hasOwnProperty(i)&&t[i]!==undefined){n[i]=t[i]}break;case"merge":default:const e=n[i]||[];let o={};if(r(s)){o=s}if(Array.isArray(e)){n[i]=c(e,t&&t[i]||{},o)}break}}else{switch(s){case"overwrite":if(t.hasOwnProperty(i)&&t[i]!==undefined){o[i]=t[i]}break;case"merge":default:let e={};if(r(s)){e=s}o[i]=c([],t&&t[i]||{},e);break}}}}return o}function c(e,n){let i=arguments.length>2&&arguments[2]!==undefined?arguments[2]:{};const r=e.length?e[0].key:null;const c=e.filter(e=>{var n;return((n=e.position)===null||n===void 0?void 0:n.placement)!==t.End});const l=e.length?e[c.length-1].key:null;let a;const f={};const u={};e.forEach(e=>{var n;if(((n=e.position)===null||n===void 0?void 0:n.placement)===t.End&&!a){a=e}else{var o,i;f[e.key]={anchor:((o=e.position)===null||o===void 0?void 0:o.anchor)||e.key,placement:((i=e.position)===null||i===void 0?void 0:i.placement)||t.After}}u[e.key]=e});Object.keys(n).forEach(e=>{var o;const c=n[e];const a=c.position.anchor;if(!c.position.placement){c.position.placement=t.After}if(!a){const n=c.position.placement===t.After?l:r;c.position.anchor=n?n:e}c.menu=c===null||c===void 0?void 0:(o=c.menu)===null||o===void 0?void 0:o.map(e=>u[e.key]??e);const p=c.key;if(u[p]){u[p]=s(i,u[p],c);if(a&&c.position&&i.position&&i.position==="overwrite"){f[p]=u[p].position}}else{u[p]=s(i,null,c);f[p]=c.position}});const p=[];Object.keys(f).forEach(e=>{o(f,e,p,{})});const d=p.map(e=>u[e]);if(a){d.push(a)}return d}n.insertCustomElements=c;return n},false);
//# sourceMappingURL=ConfigurableObject.js.map
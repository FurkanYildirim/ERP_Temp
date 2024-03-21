/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/restricted/_CancelablePromise","sap/base/util/restricted/_isEqual","sap/base/util/restricted/_omit","sap/base/util/restricted/_castArray","sap/base/util/deepEqual","sap/base/util/each","sap/base/util/merge","sap/base/util/deepClone","sap/base/util/ObjectPath","sap/base/util/isEmptyObject","sap/ui/integration/designtime/baseEditor/BaseEditor","sap/ui/integration/util/CardMerger","sap/ui/thirdparty/jquery","./config/index"],function(t,i,e,a,n,s,r,o,u,p,d,l,jQuery,g){"use strict";var c=d.extend("sap.ui.integration.designtime.cardEditor.CardEditor",{metadata:{library:"sap.ui.integration",properties:{layout:{type:"string",defaultValue:"form"},designtimeChanges:{type:"array",defaultValue:[]},baseUrl:{type:"sap.ui.core.URI",defaultValue:null},config:{type:"object",defaultValue:{i18n:[].concat(d.getMetadata().getProperty("config").getDefaultValue().i18n,"sap/ui/integration/designtime/cardEditor/i18n/i18n.properties")}}}},constructor:function(t){t=t||{};d.prototype.constructor.apply(this,arguments);this.setPreventInitialization(true);if(!t["config"]){this.addConfig(g,true)}},renderer:d.getMetadata().getRenderer()});c.prototype.init=function(){d.prototype.init.apply(this,arguments);this.attachJsonChange(function(t){if(!this._oInitialJson){this._oInitialJson=t.getParameter("json")}},this)};c.prototype.setJson=function(){d.prototype.setJson.apply(this,arguments);var i=this.getJson();var e=u.get(["sap.app","id"],i);if(this._bDesigntimeInit&&this._bCardId!==e){if(this._oDesigntimePromise){this._oDesigntimePromise.cancel()}delete this._bCardId;delete this._bDesigntimeInit}if(!this._bDesigntimeInit){this.setPreventInitialization(true);this._bDesigntimeInit=true;this._bCardId=e;var n=f(u.get(["sap.card","configuration","editor"],i)||"");if(n===""){n=f(u.get(["sap.card","designtime"],i)||"")}var s=f(this.getBaseUrl()||"");if(s&&n){var o={};var g=f(s);var c=m(n);var b=g+"/"+c;var y=e.replace(/\./g,"/")+"/"+c;o[y]=b;sap.ui.loader.config({paths:o});var _=y+"/editor.config";var v=y+"/i18n/i18n.properties";var C=b+"/metadata.json";this._oDesigntimePromise=new t(function(t){Promise.all([new Promise(function(t){sap.ui.require([_],t,function(){t({})})}),new Promise(function(t){jQuery.getJSON(C).done(t).fail(function(){t({})})})]).then(t)});this._oDesigntimePromise.then(function(t){this.setPreventInitialization(false);var i=t[1];i=l.mergeCardDesigntimeMetadata(i,this.getDesigntimeChanges());this._oInitialDesigntimeMetadata=i;this.setDesigntimeMetadata(h(i),true);var e=t[0];if(p(e)){this.addConfig({i18n:v})}else{e=r({},e);e.i18n=e.i18n?a(e.i18n):[];e.i18n.push(v);this._addSpecificConfig(e)}}.bind(this))}else{this.setPreventInitialization(false);this.addConfig({})}}};c.prototype.setDesigntimeChanges=function(t){if(this._oInitialDesigntimeMetadata){throw Error("Designtime Changes can only be set initially")}this.setProperty("designtimeChanges",t)};function h(t){var i={};Object.keys(t).forEach(function(e){u.set(e.split("/"),{__value:o(t[e])},i)});return i}function f(t){return t.trim().replace(/\/*$/,"")}function m(t){return t.replace(/^\.\//,"")}return c});
//# sourceMappingURL=CardEditor.js.map
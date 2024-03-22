/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./ModificationHandler","sap/m/p13n/FlexUtil","sap/m/p13n/enum/PersistenceMode","sap/ui/core/Core"],function(n,e,t,i){"use strict";var r,a,o;var u=function(){if(!o){o=new Promise(function(n,e){sap.ui.require(["sap/ui/fl/apply/api/FlexRuntimeInfoAPI"],function(e){n(e)},e)})}return o};var s=n.extend("sap.m.p13n.modification.FlexModificationHandler");s.prototype.processChanges=function(n,i){var r=n&&n[0]?n[0].selectorElement:undefined;var a=i.mode;var o=a===t.Auto;if(o){a=i.hasVM?"Standard":t.Global}var u=a===t.Global;var s=a===t.Transient;return this.initialize().then(function(){var t=e.handleChanges(n,u,s);return u?t.then(function(n){return e.saveChanges(r,n)}):t})};s.prototype.waitForChanges=function(n,e){return this.initialize().then(function(){return u().then(function(t){return t.waitForChanges(n,e)})})};s.prototype.reset=function(n,i){var r=i.mode;var a=r===t.Global;var o=!i.hasVM&&i.hasPP&&r===t.Auto;return this.initialize().then(function(){return a||o?e.reset(n):e.restore(n)})};s.prototype.isModificationSupported=function(n,e){return this.initialize().then(function(){return u().then(function(t){return t.isFlexSupported(n,e)})})};s.prototype.initialize=function(){if(!a){a=i.loadLibrary("sap.ui.fl",{async:true})}return a};s.getInstance=function(){if(!r){r=new s}return r};return s});
//# sourceMappingURL=FlexModificationHandler.js.map
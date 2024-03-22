// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/library","sap/ushell/Config"],function(e,t){"use strict";var n=e.ContentNodeType;var r=function(){};r.prototype.isMenuEnabled=function(){if(!t.last("/core/menu/enabled")){return Promise.resolve(false)}return sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(e){return e.getMenuEntries("main").then(function(e){return e.length>0})})};r.prototype.getMenuEntries=function(){return sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(e){return e.getMenuEntries("main")})};r.prototype.getContentNodes=function(){return this.getMenuEntries().then(this._normalizeMenuEntries.bind(this)).then(this._buildContentNodes.bind(this))};r.prototype._normalizeMenuEntries=function(e){var t=[];return sap.ushell.Container.getServiceAsync("CommonDataModel").then(function(n){e.forEach(function(e){if(this._isSpaceOrPage(e)&&e.menuEntries===undefined){var r=e.target.parameters.find(function(e){return e.name==="pageId"});var i=r&&r.value;e.menuEntries=[{title:i,type:"IBN",target:e.target}];t.push(n.getPage(i).then(function(t){e.menuEntries[0].title=t.identification.title}))}}.bind(this));return Promise.allSettled(t)}.bind(this)).then(function(){return e})};r.prototype._buildContentNodes=function(e){return e.filter(this._isSpaceOrPage).map(function(e){var t=e.target.parameters.find(function(e){return e.name==="spaceId"}).value;var r={id:t,label:e.title,type:n.Space,isContainer:false};r.children=e.menuEntries.filter(this._isSpaceOrPage).map(function(e){var t=e.target.parameters.find(function(e){return e.name==="pageId"});var r=t&&t.value;if(!r){return null}return{id:r,label:e.title,type:n.Page,isContainer:true,children:[]}}).filter(function(e){return!!e});return r}.bind(this))};r.prototype._isSpaceOrPage=function(e){return e.type==="IBN"&&e.target&&e.target.semanticObject==="Launchpad"&&e.target.action==="openFLPPage"&&Array.isArray(e.target.parameters)};return r});
//# sourceMappingURL=MenuAdapter.js.map
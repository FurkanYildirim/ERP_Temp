/*
 * SAPUI5

(c) Copyright 2009-2020 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/thirdparty/jquery","./BaseController","./DraftController","sap/ui/generic/app/util/ModelUtil","sap/base/util/extend","sap/base/Log"],function(jQuery,t,e,r,n,a){"use strict";var o=t.extend("sap.ui.generic.app.transaction.TransactionController",{metadata:{publicMethods:["destroy","setBatchStrategy","getDraftController","invokeAction","editEntity","deleteEntity","deleteEntities","propertyChanged","hasClientValidationErrors","resetChanges","getDefaultValues","getDefaultValuesFunction","updateMultipleEntities"]},constructor:function(e,r,n,a){t.apply(this,[e,r,a]);this.sName="sap.ui.generic.app.transaction.TransactionController";this._oDraft=null;n=n||{};if(!n.noBatchGroups){e.setDeferredGroups(["Changes"]);e.setChangeGroups({"*":{groupId:"Changes",changeSetId:"Changes",single:false}})}return this.getInterface()}});o.prototype.setBatchStrategy=function(t){var e,r=this._oModel.getChangeGroups();for(e in r){r[e].single=t}this._oModel.setChangeGroups(r)};o.prototype.getDraftController=function(){if(!this._oDraft){this._oDraft=new e(this._oModel,this._oQueue,this._oDraftMergeTimer)}return this._oDraft};o.prototype.editEntity=function(t,e,n){var a=this;return new Promise(function(o){var i,s;i=a.getDraftController().getDraftContext();s=r.getEntitySetFromContext(t);if(i.isDraftEnabled(s)&&a._oDraftUtil.isActiveEntity(t.getObject())){return o(a.getDraftController().createEditDraftEntity(t,e,n))}return o({context:t})})};o.prototype.deleteEntity=function(t,e,r){var n,a,o=this,i,s,l;if(typeof t=="string"){i=t}else if(typeof t=="object"&&t instanceof sap.ui.model.Context){s=t;i=s.getPath()}e=e||{};jQuery.extend(e,{batchGroupId:"Changes",changeSetId:"Changes",successMsg:"Changes were discarded",failedMsg:"Discarding of changes failed",forceSubmit:true,context:s});var u=r?"lenient":"strict";e.headers={Prefer:"handling="+u};if(o._oModel.getObject(i)&&o._oDraftUtil.isActiveEntity(o._oModel.getObject(i))!==undefined&&!o._oDraftUtil.isActiveEntity(o._oModel.getObject(i))){if(!s){s=new sap.ui.model.Context(this._oModel,i)}l=o.getDraftController();n=l.discardDraft(s,e)}else{n=this._remove(i,e)}n.then(function(t){return o._normalizeResponse(t,true)},function(t){var e=o._normalizeError(t);throw e});a=this.triggerSubmitChanges(e);return this._returnPromiseAll([n,a])};o.prototype.deleteEntities=function(t,e){var r,n=[],a=this,o,i,s;e=e||{};var l=e.bIsStrict?"strict":"lenient";e.headers=e.headers||{};e.headers.Prefer="handling="+l;jQuery.extend(e,{batchGroupId:"Changes",changeSetId:"Changes",successMsg:"Changes were discarded",failedMsg:"Discarding of changes failed",forceSubmit:true});var u=function(t){return a._normalizeResponse(t,true)};var h=function(t){var e=a._normalizeError(t);throw e};for(var c=0;c<t.length;c++){i=null;if(typeof t[c]=="string"){o=t[c]}else if(typeof t[c]=="object"&&t[c]instanceof sap.ui.model.Context){i=t[c];o=i.getPath()}if(a._oModel.getObject(o)&&a._oDraftUtil.isActiveEntity(a._oModel.getObject(o))!==undefined&&!a._oDraftUtil.isActiveEntity(a._oModel.getObject(o))){e.changeSetId="Changes";if(!i){i=new sap.ui.model.Context(this._oModel,o)}s=a.getDraftController();r=s.discardDraft(i,e).then(u,h)}else{e.changeSetId="ActiveChanges";r=this._remove(o,e).then(u,h)}n.push(r)}r=this.triggerSubmitChanges(e);n.push(r);return this._atLeastOnePromiseResolved(n,true)};o.prototype.invokeAction=function(t,e,r){var n=this,a,o;a=this.hasClientMessages();if(a){return a}r={batchGroupId:"Changes",changeSetId:"Changes",successMsg:"Call of action succeeded",failedMsg:"Call of action failed",urlParameters:r.urlParameters,forceSubmit:true,context:e};a=this._callAction(t,e,r).then(function(t){return n._normalizeResponse(t,true)},function(t){var e=n._normalizeError(t);throw e});this._oModel.refresh(true,false,"Changes");o=this.triggerSubmitChanges(r);return this._returnPromiseAll([a,o])};o.prototype.resetChanges=function(t){this._oModel.resetChanges(t)};o.prototype.propertyChanged=function(t,e,r){var n,a,o={batchGroupId:"Changes",changeSetId:"Changes",binding:r};n=this.getDraftController().getDraftContext();if(n.checkUpdateOnChange(t,e)){a=r.getBoundContext();if(n.hasDraftPreparationAction(a)){return this.getDraftController().saveAndPrepareDraftEntity(a,o)}o.onlyIfPending=true;return this.triggerSubmitChanges(o)}o.onlyIfPending=true;o.noShowResponse=true;o.noBlockUI=true;return this.triggerSubmitChanges(o)};o.prototype.getDefaultValues=function(t,e,o,i){var s,l,u=t[0];if(!u&&!(u instanceof sap.ui.model.Context)){throw new Error("No context")}var h=r.getEntitySetFromContext(u);if(!h&&h===""){throw new Error("No EntitySet found in the current context")}var c=u.getModel().getMetaModel();var f=c.getODataEntityType(c.getODataEntitySet(h).entityType);if(o){f["navigationProperty"].forEach(function(t){if(t.name===o){s=t}});var g=c.getODataEntityType(c.getODataAssociationEnd(f,o).type);l=g.property}else if(i){s=c.getODataFunctionImport(i);l=s.parameter}else{s=c.getODataEntitySet(h);l=f.property}var d=this.getDefaultValuesFunction(s);if(d){var p=d.split("/")[1];if(t.length>1&&c.getODataFunctionImport(p).parameter){a.error("Parameterised DefaultValuesFunction not to be called with multiple selections");throw new Error("Parameterised DefaultValuesFunction not to be called with multiple selections")}var C={successMsg:"Call of action succeeded",failedMsg:"Call of action failed",urlParameters:null,forceSubmit:true,context:u,headers:{}};var y=this._oModel.getETag(u.getPath());if(y){C.headers={"If-Match":"*"}}var v=this._callAction(d,u,C).then(function(t){if(t.httpResponse.statusCode==="200"){var r=t.responseData[p]||t.responseData;var a={};l.forEach(function(t){if(r.hasOwnProperty(t.name)){a[t.name]=r[t.name]}});var o=[];e.forEach(function(t){var e={};for(var r in t){if(t[r]!==""){e[r]=t[r]}}o.push(n({},e,a))});return o}});var m=this.triggerSubmitChanges(C);return this._returnPromiseAll([v,m])}else{return e}};o.prototype.getDefaultValuesFunction=function(t){var e=t["com.sap.vocabularies.Common.v1.DefaultValuesFunction"];var r=e?"/"+e.String:null;return r};o.prototype.updateMultipleEntities=function(t){var e=[];var r=this;var n=function(t){return r._normalizeResponse(t,true)};var a=function(t){var e=r._normalizeError(t);throw e};for(var o=0;o<t.length;o++){var i=this._updateEntity(t[o].sContextPath,t[o].oUpdateData,o).then(n,a);e.push(i)}return this._atLeastOnePromiseResolved(e)};o.prototype.destroy=function(){t.prototype.destroy.apply(this,[]);if(this._oDraft){this._oDraft.destroy()}this._oDraft=null};return o},true);
//# sourceMappingURL=TransactionController.js.map
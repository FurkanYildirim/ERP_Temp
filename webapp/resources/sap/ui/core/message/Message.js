/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/Object","sap/base/util/uid","sap/base/Log"],function(t,e,s){"use strict";var r={Error:0,Warning:1,Success:2,Information:3,None:4};var i=t.extend("sap.ui.core.message.Message",{constructor:function(s){t.apply(this,arguments);s=s||{};this.id=s.id?s.id:e();this.message=s.message;this.description=s.description;this.descriptionUrl=s.descriptionUrl;this.additionalText=s.additionalText;this.setType(s.type||sap.ui.core.MessageType.None);this.code=s.code;this.aTargets=[];if(s.target!==undefined){this.aTargets=Array.isArray(s.target)?s.target.slice():[s.target]}Object.defineProperty(this,"target",{get:this.getTarget,set:this.setTarget,enumerable:true});this.processor=s.processor;this.persistent=s.persistent||false;this.technical=s.technical||false;this.technicalDetails=s.technicalDetails;this.references=s.references||{};this.validation=!!s.validation;this.date=s.date||Date.now();this.controlIds=[];if(Array.isArray(s.fullTarget)){this.aFullTargets=s.fullTarget.length?s.fullTarget.slice():[""]}else{this.aFullTargets=[s.fullTarget||""]}Object.defineProperty(this,"fullTarget",{get:function(){return this.aFullTargets[0]},set:function(t){this.aFullTargets[0]=t},enumerable:true})}});i.prototype.getId=function(){return this.id};i.prototype.setMessage=function(t){this.message=t};i.prototype.getMessage=function(){return this.message};i.prototype.getControlId=function(){return this.controlIds[this.controlIds.length-1]};i.prototype.addControlId=function(t){if(this.controlIds.indexOf(t)==-1){this.controlIds=this.controlIds.slice();this.controlIds.push(t)}};i.prototype.removeControlId=function(t){var e=this.controlIds.indexOf(t);if(e!=-1){this.controlIds=this.controlIds.slice();this.controlIds.splice(e,1)}};i.prototype.getControlIds=function(){return this.controlIds};i.prototype.setDescription=function(t){this.description=t};i.prototype.getDescription=function(){return this.description};i.prototype.setAdditionalText=function(t){this.additionalText=t};i.prototype.getAdditionalText=function(){return this.additionalText};i.prototype.getDescriptionUrl=function(){return this.descriptionUrl};i.prototype.setDescriptionUrl=function(t){this.descriptionUrl=t};i.prototype.setType=function(t){if(t in sap.ui.core.MessageType){this.type=t}else{s.error("MessageType must be of type sap.ui.core.MessageType")}};i.prototype.getType=function(){return this.type};i.prototype.setTarget=function(t){this.aTargets[0]=t};i.prototype.getTarget=function(){return this.aTargets[0]};i.prototype.setTargets=function(t){this.aTargets=t.slice()};i.prototype.getTargets=function(){return this.aTargets.slice()};i.prototype.setMessageProcessor=function(t){if(t&&t.isA&&t.isA("sap.ui.core.message.MessageProcessor")){this.processor=t}else{s.error("oMessageProcessor must be an instance of 'sap.ui.core.message.MessageProcessor'")}};i.prototype.getMessageProcessor=function(){return this.processor};i.prototype.setCode=function(t){this.code=t};i.prototype.getCode=function(){return this.code};i.prototype.setPersistent=function(t){this.persistent=t};i.prototype.getPersistent=function(){return this.persistent};i.prototype.setTechnical=function(t){this.technical=t};i.prototype.getTechnical=function(){return this.technical};i.prototype.setTechnicalDetails=function(t){this.technicalDetails=t};i.prototype.getTechnicalDetails=function(){return this.technicalDetails};i.prototype.addReference=function(t,e){if(!t){return}if(!this.references[t]){this.references[t]={properties:{}}}if(!this.references[t].properties[e]){this.references[t].properties[e]=true}};i.prototype.removeReference=function(t,e){if(!t){return}if(t in this.references){if(!e){delete this.references[t]}else if(this.references[t].properties[e]){delete this.references[t].properties[e]}}};i.prototype.setDate=function(t){this.date=t};i.prototype.getDate=function(){return this.date};i.compare=function(t,e){return r[t.type]-r[e.type]};return i});
//# sourceMappingURL=Message.js.map
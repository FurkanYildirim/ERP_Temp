// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/EventHub","sap/ui/core/Component"],function(e,n){"use strict";var t={loadComponentByEvent:function(n){e.emit(n.eventName,n.eventData)},loadComponentByComponentCreate:function(e){return n.create(e.oData).then(function(){return Promise.resolve(e.sStepName)},function(){return Promise.reject(e.sStepName)})},loadComponentByRequire:function(e){return new Promise(function(n,t){sap.ui.require([e],function(e){n(e)})})},waitInMs:function(n){setTimeout(function(){e.emit("StepDone",n.sStepName)},n.iWaitingTime)},directLoading:function(){}};return t},false);
//# sourceMappingURL=FLPLoader.js.map
/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/core/constants"],function(e){"use strict";var t=function(t){this.savePath=function(e,i,a){this.serialize(false).done(function(n){if(typeof e==="string"&&typeof i==="function"){t.instances.coreApi.savePath(e,i,n)}else if(typeof e==="string"&&typeof i==="string"&&typeof a==="function"){t.instances.coreApi.savePath(e,i,a,n)}})};this.openPath=function(i,a,n){t.instances.coreApi.openPath(i,s.bind(this));function s(i,s,r){t.instances.coreApi.resetPath();t.instances.messageHandler.setCallbackForTriggeringFatal(c);this.deserialize(i.path.SerializedAnalysisPath,n).done(function(){t.instances.messageHandler.setCallbackForTriggeringFatal(undefined);a({},s)});function c(i){if(i.getSeverity()!==e.message.severity.warning){var a=t.instances.messageHandler.createMessageObject({code:"5210"});a.setPrevious(i);t.instances.messageHandler.putMessage(a)}}}};this.deletePath=function(e,i){t.instances.coreApi.deletePath(e,i)};this.readPaths=function(e){t.instances.coreApi.readPaths(e)};this.serialize=function(e,i){var a=jQuery.Deferred();var n={};t.instances.startFilterHandler.serialize(undefined,i).done(function(i){var s=t.instances.coreApi.serialize();n.startFilterHandler=i;n.filterIdHandler=t.instances.filterIdHandler.serialize();n.path=s.path;n.smartFilterBar=s.smartFilterBar;if(e){n.pathName=t.instances.coreApi.getPathName();n.dirtyState=t.instances.coreApi.isDirty()}a.resolve(n)});return a};this.deserialize=function(e,i){var a=jQuery.Deferred();var n;if(e.dirtyState!==undefined){t.instances.coreApi.setDirtyState(e.dirtyState)}if(e.pathName!==undefined){t.instances.coreApi.setPathName(e.pathName)}n={path:e.path,smartFilterBar:e.smartFilterBar};if(i!==undefined){n.path.indicesOfActiveSteps[0]=i}t.instances.coreApi.getApplicationConfigProperties().done(function(){t.instances.coreApi.deserialize(n);t.instances.filterIdHandler.deserialize(e.filterIdHandler);t.instances.startFilterHandler.getStartFilters().done(function(){if(e.startFilterHandler){t.instances.startFilterHandler.deserialize(e.startFilterHandler).done(function(){a.resolve()})}else{a.resolve()}})});return a.promise()}};sap.apf.utils.SerializationMediator=t;return t},true);
//# sourceMappingURL=serializationMediator.js.map
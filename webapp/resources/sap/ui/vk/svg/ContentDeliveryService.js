/*!
* SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
*/
sap.ui.define(["sap/base/Log","sap/ui/base/ManagedObject","../totara/TotaraLoader","../svg/SceneBuilder","../getResourceBundle","../ObjectType"],function(e,t,r,n,o,a){"use strict";var i=t.extend("sap.ui.vk.svg.ContentDeliveryService",{metadata:{library:"sap.ui.vk",properties:{authorizationHandler:"any",maxActiveRequests:{type:"int",defaultValue:4},consumptionScenario:{type:"sap.ui.vk.ConsumptionScenario"},maxUrlLength:{type:"int",defaultValue:2048},meshesBatchSize:{type:"int",defaultValue:128},materialsBatchSize:{type:"int",defaultValue:128},geomMeshesBatchSize:{type:"int",defaultValue:128},geomMeshesMaxBatchDataSize:{type:"int",defaultValue:10*1024*1024},annotationsBatchSize:{type:"int",defaultValue:128},tracksBatchSize:{type:"int",defaultValue:128},sequencesBatchSize:{type:"int",defaultValue:128},voxelThreshold:{type:"number",defaultValue:0},skipLowLODRendering:{type:"boolean",defaultValue:true}},events:{cameraChanged:{parameters:{sceneId:{type:"string"},camera:{type:"any"}},enableEventBubbling:true},sceneUpdated:{parameters:{},enableEventBubbling:true},viewGroupUpdated:{parameters:{currentViewGroupId:"string"},enableEventBubbling:true},sceneCompleted:{parameters:{sceneId:{type:"string"}},enableEventBubbling:true},loadingFinished:{parameters:{currentViewId:"string",currentViewGroupId:"string"},enableEventBubbling:true},contentChangesProgress:{parameters:{percent:"float"}},errorReported:{parameters:{error:{type:"any"}}},initialViewCompleted:{parameters:{sceneId:{type:"string"}},enableEventBubbling:true}}},constructor:function(e,o){this._loader=new r;this._loader.setSceneBuilder(new n);t.apply(this,arguments);this._loader.setSkipLowLODRendering(this.getSkipLowLODRendering());this._transientSceneMap=new Map;this._currentNodeHierarchy=null}});i.prototype.getMaxActiveRequests=function(){return this._loader.getMaxActiveRequests()};i.prototype.setMaxActiveRequests=function(e){this._loader.setMaxActiveRequests(e);return this};i.prototype.getConsumptionScenario=function(){return this._loader.getConsumptionScenario()};i.prototype.setConsumptionScenario=function(e){this._loader.setConsumptionScenario(e);return this};i.prototype.getMaxUrlLength=function(){return this._loader.getMaxUrlLength()};i.prototype.setMaxUrlLength=function(e){this._loader.setMaxUrlLength(e);return this};i.prototype.getMeshesBatchSize=function(){return this._loader.getMeshesBatchSize()};i.prototype.setMeshesBatchSize=function(e){this._loader.setMeshesBatchSize(e);return this};i.prototype.getMaterialsBatchSize=function(){return this._loader.getMaterialsBatchSize()};i.prototype.setMaterialsBatchSize=function(e){this._loader.setMaterialsBatchSize(e);return this};i.prototype.getGeomMeshesBatchSize=function(){return this._loader.getGeomMeshesBatchSize()};i.prototype.setGeomMeshesBatchSize=function(e){this._loader.setGeomMeshesBatchSize(e);return this};i.prototype.getGeomMeshesMaxBatchDataSize=function(){return this._loader.getGeomMeshesMaxBatchDataSize()};i.prototype.setGeomMeshesMaxBatchDataSize=function(e){this._loader.setGeomMeshesMaxBatchDataSize(e);return this};i.prototype.getAnnotationsBatchSize=function(){return this._loader.getAnnotationsBatchSize()};i.prototype.setAnnotationsBatchSize=function(e){this._loader.setAnnotationsBatchSize(e);return this};i.prototype.getTracksBatchSize=function(){return this._loader.getTracksBatchSize()};i.prototype.setTracksBatchSize=function(e){this._loader.setTracksBatchSize(e);return this};i.prototype.getSequencesBatchSize=function(){return this._loader.getSequencesBatchSize()};i.prototype.setSequencesBatchSize=function(e){this._loader.setSequencesBatchSize(e);return this};i.prototype.getVoxelThreshold=function(){return this._loader.getVoxelThreshold()};i.prototype.setVoxelThreshold=function(e){this._loader.setVoxelThreshold(e);return this};i.prototype.setSkipLowLODRendering=function(e){this.setProperty("skipLowLODRendering",e,true);this._loader.setSkipLowLODRendering(e);return this};function s(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,function(e){var t=Math.random()*16|0,r=e=="x"?t:t&3|8;return r.toString(16).toLowerCase()})}i.prototype.initUrl=function(e,t,n){if(!e.endsWith("/")){e+="/"}var o=this;function a(){o.fireSceneUpdated({})}function i(){var e;if(o._loader&&o._loader.currentSceneInfo){var t=o._loader.getContext(o._loader.currentSceneInfo.id);if(t){e=t.currentViewGroupId}}o.fireViewGroupUpdated({currentViewGroupId:e})}if(!this._loader.running()||this._loader.getUrl()!==e){if(this._loader.running()){var u=this._loader.sceneBuilder;this._loader.dispose();this._loader=new r;this._loader.setSceneBuilder(u)}this._loader.onErrorCallbacks.attach(this._reportError.bind(o));this._loader.onMaterialFinishedCallbacks.attach(a);this._loader.onImageFinishedCallbacks.attach(a);this._loader.onImageDetailsFinishedCallbacks.attach(a);this._loader.onViewGroupUpdatedCallbacks.attach(i);this._loader.setUrl(e);this._loader.setCorrelationId(n?n:s());return this._loader.run()}else if(!t){this._loader.cleanup()}return Promise.resolve("Loader is ready")};i.prototype._reportError=function(e){this.fireErrorReported(e)};i.prototype._createLoadParam=function(t,r,n,o){var a=this;var i;var s=false;var u;if(this._currentNodeHierarchy){u=this._currentNodeHierarchy.getScene()}var d={root:n,vkScene:u,activateView:o.getActivateView(),enableLogger:o.getEnableLogger(),includeAnimation:o.getIncludeAnimation(),includeBackground:o.getIncludeBackground(),includeHidden:o.getIncludeHidden(),includeParametric:o.getIncludeParametric(),includeUsageId:o.getIncludeUsageId(),metadataFilter:o.getMetadataFilter(),pushPMI:o.getPushPMI(),pushViewGroups:o.getPushViewGroups(),useSecureConnection:o.getUseSecureConnection(),onActiveCamera:function(e){var t=false;var r=a._loader.getContext(o.getVeid());if(r&&r.phase<2){i=e;t=true}if(!t){a.fireCameraChanged({sceneId:o.getVeid(),camera:e})}},onInitialSceneFinished:function(e){s=true;t({node:n,camera:i,contentResource:o,initialView:e,annotations:a.getSceneBuilder()._annotations,loader:a})},onSceneCompleted:function(){a.fireSceneCompleted({sceneId:o.getVeid()})},onLoadingFinished:function(){var e,t;if(a._loader&&a._loader.currentSceneInfo){var r=a._loader.getContext(a._loader.currentSceneInfo.id);if(r){e=r.currentViewId;t=r.currentViewGroupId}}a.fireLoadingFinished({currentViewId:e,currentViewGroupId:t})},onContentChangesProgress:function(e){a.fireContentChangesProgress({source:e.source,phase:e.phase,percentage:e.percentage})},onInitialViewCompleted:function(){a.fireInitialViewCompleted({sceneId:o.getVeid()})}};var c=function(t){e.warning("Content loading error reported:",JSON.stringify(t.getParameters()));var n;if(t.getParameter("errorText")){n=t.getParameter("errorText")}else if(t.getParameter("error")){n=t.getParameter("error")}else if(t.getParameter("reason")){n=t.getParameter("reason")}else{n="failed to load: unknown reason"}if(s){var o=t.getParameter("error");if(o&&o===4){a.initUrl(this._loader.getUrl(),true)}}else{a.detachErrorReported(c);if(t.getParameter("events")){n=n+"\n"+JSON.stringify(t.getParameter("events"))}r(n)}};a.attachErrorReported(c);return d};i.prototype.load=function(e,t,r){var n=this;var a=t.getNodeProxy();if(a){this._currentNodeHierarchy=a.getNodeHierarchy()}return new Promise(function(a,i){if(!t.getSource()||!t.getVeid()){i(o().getText("CONTENTDELIVERYSERVICE_MSG_NOURLORVEID"));return}n.initUrl(t.getSource(),true);var s=n._createLoadParam(a,i,e,t);if(n._loader){n._loader.request(t.getVeid(),s,r)}})};i.prototype.getSceneBuilder=function(){if(this._loader){return this._loader.getSceneBuilder()}return null};i.prototype.decrementResourceCountersForDeletedTreeNode=function(e){var t=this._loader.getContext(this._loader.currentSceneInfo.id);this._loader.decrementResourceCountersForDeletedTreeNode(t,e)};i.prototype.update=function(e,t,r){var n=this;return new Promise(function(a,i){if(!n._loader){i(o().getText("CONTENTDELIVERYSERVICE_MSG_CONTENTDELIVERYSERVICENOTINITIALISED"));return}n._loader.update(e,t,r).then(function(e){if(n._currentNodeHierarchy){for(var t=0;t<e.replacedNodeRefs.length;t++){n._currentNodeHierarchy.fireNodeReplaced({ReplacedNodeRef:e.replacedNodeRefs[t],ReplacementNodeRef:e.replacementNodeRefs[t],ReplacedNodeId:e.replacedNodeRefs[t],ReplacementNodeId:e.replacementNodeRefs[t]})}}a({sceneVeId:e.sceneVeId,sids:e.sidArray})}).catch(function(e){return i(e)})})};i.prototype.exit=function(){if(this._loader){this._loader.dispose();this._loader=null}this._transientSceneMap=null};i.prototype.loadView=function(t,r,n,o){if(typeof n==="undefined"){n="static"}var a=this;return this._loader.requestView(t,n,r,null,o).then(function(e){if(a._currentNodeHierarchy&&e.updatedNodes){for(var t=0;t<e.updatedNodes.length;t++){a._currentNodeHierarchy.fireNodeUpdated({nodeRef:e.updatedNodes[t]})}}a.fireSceneUpdated({});return e}).catch(function(t){e.error(t);return null})};i.prototype.updatePlaybacks=function(t,r,n){var o=this;return this._loader.requestView(t,"static",r,n,true).then(function(e){if(o._currentNodeHierarchy&&e.updatedNodes){for(var t=0;t<e.updatedNodes.length;t++){o._currentNodeHierarchy.fireNodeUpdated({nodeRef:e.updatedNodes[t]})}}o.fireSceneUpdated({});return e}).catch(function(t){e.error(t);return null})};i.prototype.loadViewGroup=function(t,r,n){var o=this;return this._loader.requestViewGroup(t,r,n).then(function(e){o.fireSceneUpdated({});return e}).catch(function(t){e.error(t);return null})};i.prototype.loadAnnotation=function(t,r){var n=this;return this._loader.requestAnnotation(t,r).then(function(e){n.fireSceneUpdated({});return e}).catch(function(t){e.error(t);return null})};i.prototype.assignMaterialToNodes=function(e,t,r,n){return Promise.resolve()};i.prototype.replaceMaterialOnNodes=function(e,t,r,n){return Promise.resolve()};i.prototype.printLogTokens=function(){if(this._loader){this._loader.printLogTokens();return true}else{return false}};return i});
//# sourceMappingURL=ContentDeliveryService.js.map
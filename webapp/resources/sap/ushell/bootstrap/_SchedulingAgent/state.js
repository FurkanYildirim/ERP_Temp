// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/bootstrap/_SchedulingAgent/logger","sap/base/util/now","sap/base/util/deepClone"],function(e,t,o){"use strict";var i={module:{schedulingAgent:{id:"schedulingAgent",FatalError:"FATAL_ERROR",Idle:"IDLE",Initialized:"INITIALIZED",Initializing:"INITIALIZING",Waiting:"WAITING",WokeUp:"WOKE_UP",Working:"WORKING"},state:{id:"state",FatalError:"FATAL_ERROR",Available:"AVAILABLE"},flpScheduler:{id:"flpScheduler",Initialized:"INITIALIZED",WrongConfiguration:"WRONG_CONFIGURATION",LoadingAborted:"LOADING_ABORTED"},flpLoader:{id:"flpLoader"},logger:{id:e,Block:"BLOCK",Step:"STEP",Module:"MODULE"}},loadingStep:{Prepared:"STEP_PREPARED",WaitingForDependencies:"STEP_WAITING_FOR_DEPENDENCIES",InProgress:"STEP_IN_PROGRESS",Done:"STEP_DONE",Aborted:"STEP_ABORTED",Skipped:"STEP_SKIPPED"},loadingBlock:{Prepared:"BLOCK_PREPARED",WaitingForDependencies:"BLOCK_WAITING_FOR_DEPENDENCIES",InProgress:"BLOCK_IN_PROGRESS",TimedOut:"BLOCK_TIMEDOUT",Done:"BLOCK_DONE",Aborted:"BLOCK_ABORTED"}};var n={id:i,oState:{ofLoadingBlock:{},ofLoadingStep:{},ofModule:{}},clear:function(){this.oState={ofLoadingBlock:{},ofLoadingStep:{},ofModule:{}}},getIdBase:function(){return i},setForLoadingBlock:function(o,n,a,r,d){this.oState.ofLoadingBlock[o]={time:t(),status:n,parameter:a,remark:r,byModule:d};e.logStatus({time:this.oState.ofLoadingBlock[o].time,type:i.module.logger.Block,id:o,status:n,parameter:a,remark:r,byModule:d})},getForLoadingBlock:function(e){return this.oState.ofLoadingBlock[e]},setForLoadingStep:function(o,n,a,r,d){this.oState.ofLoadingStep[o]={time:t(),status:n,parameter:a,remark:r,byModule:d};e.logStatus({time:this.oState.ofLoadingStep[o].time,type:i.module.logger.Step,id:o,status:n,parameter:a,remark:r,byModule:d})},getForLoadingStep:function(e){return this.oState.ofLoadingStep[e]},setForModule:function(o,n,a){this.oState.ofModule[o]={time:t(),status:n,remark:a,byModule:undefined};e.logStatus({time:this.oState.ofModule[o].time,type:i.module.logger.Module,id:o,status:n,parameter:undefined,remark:a,byModule:undefined})},getForModule:function(e){return this.oState.ofModule[e]},isBlockWaitingForDependencies:function(e){var t=this.getForLoadingBlock(e);return!!(t&&t.status===i.loadingBlock.WaitingForDependencies)},isBlockLoading:function(e){var t=this.getForLoadingBlock(e);return!!(t&&t.status===i.loadingBlock.InProgress)},isBlockLoaded:function(e){var t=this.getForLoadingBlock(e);return!!(t&&t.status===i.loadingBlock.Done)},isBlockLoadingAborted:function(e){var t=this.getForLoadingBlock(e);return!!(t&&t.status===i.loadingBlock.Aborted)},hasBlockLoadingTimedOut:function(e){var t=this.getForLoadingBlock(e);return!!(t&&t.status===i.loadingBlock.TimedOut)},isStepWaitingForDependencies:function(e){var t=this.getForLoadingStep(e);return!!(t&&t.status===i.loadingStep.WaitingForDependencies)},isStepLoading:function(e){var t=this.getForLoadingStep(e);return!!(t&&t.status===i.loadingStep.InProgress)},isStepLoaded:function(e){var t=this.getForLoadingStep(e);return!!(t&&t.status===i.loadingStep.Done)},isStepLoadingAborted:function(e){var t=this.getForLoadingStep(e);return!!(t&&t.status===i.loadingStep.Sborted)},isStepSkipped:function(e){var t=this.getForLoadingStep(e);return!!(t&&t.status===i.loadingStep.Skipped)},isAgentIdle:function(){var e=this.getForModule(i.module.schedulingAgent.id);return!!(e&&e.status===i.module.schedulingAgent.Idle)},isAgentWaiting:function(){var e=this.getForModule(i.module.schedulingAgent.id);return!!(e&&e.status===i.module.schedulingAgent.Waiting)},agentWokeUp:function(){var e=this.getForModule(i.module.schedulingAgent.id);return!!(e&&e.status===i.module.schedulingAgent.WokeUp)},dump:function(){console.log(JSON.parse(JSON.stringify(this.oState)));var e=o(this.oState);return e},iStartingTime:t()};n.setForModule(i.module.state.id,i.module.state.Available);return n});
//# sourceMappingURL=state.js.map
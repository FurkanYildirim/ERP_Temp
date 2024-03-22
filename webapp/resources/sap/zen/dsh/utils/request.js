/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define("sap/zen/dsh/utils/request",["jquery.sap.global","sap/base/Log"],function(jQuery,e){"use strict";var n={};n.zenSendCommandArrayWoEventWZenPVT=function(e,a,t){var s;if(t){s=function(e){if(e){n.ricSendCommand(e)}}}else{s=function(e){if(e){n.zenSendCommand(e)}}}n.que.instance.push({parameterArray:e,bOnlyEmptyDeltaWillReturn:a,funclet:s});n.que.instance.wanderQue(1)};n.getCommandSequence=function(e){var n;var a=sap.zen.dsh.sapbi_createParameterList(e);var t=a.exists(sap.zen.dsh.sapbi_COMMAND);if(!t){n=new sap.zen.dsh.sapbi_CommandSequence;n.addCommand(a)}else{n=a}return n};n.zenSendCommand=function(a){if(sap.zen.dsh.sapbi_page.m_hasSendLock){e.debug("zenSendCommand m_hasSendLock",a.parameterArray.join(),"bi_command_utils.js");n.que.instance.insertAtStart(a)}else{var t=n.getCommandSequence(a.parameterArray);if(n.containsCommand(t,"navigate_by_scrolling")||n.containsCommand(t,"after_rendering")||a.bOnlyEmptyDeltaWillReturn){sap.zen.dsh.getLoadingIndicator().disableForNextCall()}e.debug("zenSendCommand",a.parameterArray.join(),"bi_command_utils.js");sap.zen.dsh.sapbi_page.sendCommandWoPVTWoServerStateChange(t)}};n.ricSendCommand=function(a){if(sap.zen.dsh.sapbi_page.m_hasSendLock){e.debug("zenSendCommand m_hasSendLock",a,"bi_command_utils.js");n.que.instance.insertAtStart(a)}else{e.debug("zenSendCommand",a,"bi_command_utils.js");sap.zen.dsh.sapbi_page.sendCommandWoPVTWoServerStateChange(a.parameterArray)}};n.zenSendUpdateCommand=function(e){sap.zen.dsh.sapbi_page.m_useSnippets=true;n.zenSendCommandArrayWoEventWZenPVT(e,false)};n.que=function(){var a=[];var t=false;this.push=function(e){if(this.paused){return}if(a&&a.push){a.push(e)}};this.getFirstElement=function(){if(a.length>0){var e=a[0];a.shift();return e}else{return null}};this.size=function(){return a.length};this.reset=function(){a=[];t=false};this.insertAtStart=function(e){if(this.paused){return}a.unshift(e)};var s=this;this.wanderQue=function(a){if(this.size()>0){if(!t){if(this.isSendAllowed()){var i=n.que.instance.getFirstElement();i.funclet(i)}if(this.size()!==0){setTimeout(function(){e.debug("wanderQue","in setTimeout","bi_command_utils.js");t=false;s.wanderQue(a)},a);t=true}}}};this.isSendAllowed=function(){return true};this.stopScheduling=function(){this.paused=true};this.continueScheduling=function(){this.paused=false}};n.que.instance=new n.que;n.isPagingCommand=function(e,n){var a=e.getParameter(sap.zen.dsh.sapbi_COMMAND_TYPE);if(a!=null){var t=a.getValue();if(t!=null){return t.toLowerCase()===n}}return false};n.containsCommand=function(e,a){if(e.getParameterCount){var t=e.getParameterCount(sap.zen.dsh.sapbi_COMMAND);if(t>0){var s=e.getIndices(sap.zen.dsh.sapbi_COMMAND);for(var i=0;i<t;i++){var r=s[i];var u=e.getParameterByIndex(sap.zen.dsh.sapbi_COMMAND,r);if(u){var d=u.getChildList();if(d!=null){if(n.isPagingCommand(d,a)){return true}}}}}else{if(n.isPagingCommand(e,a)){return true}}}return false};return n});
//# sourceMappingURL=request.js.map
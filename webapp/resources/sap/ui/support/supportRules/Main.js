/*!
* OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
sap.ui.define(["sap/base/Log","sap/ui/VersionInfo","sap/ui/base/ManagedObject","sap/ui/core/Core","sap/ui/core/Element","sap/ui/core/Component","sap/ui/support/supportRules/Analyzer","sap/ui/support/supportRules/CoreFacade","sap/ui/support/supportRules/ExecutionScope","sap/ui/support/supportRules/ui/external/Highlighter","sap/ui/support/supportRules/CommunicationBus","sap/ui/support/supportRules/IssueManager","sap/ui/support/supportRules/History","sap/ui/support/supportRules/report/DataCollector","sap/ui/support/supportRules/WCBChannels","sap/ui/support/supportRules/Constants","sap/ui/support/supportRules/RuleSetLoader","sap/ui/support/supportRules/RuleSerializer","sap/ui/support/library"],function(e,t,s,i,o,r,n,u,a,l,p,c,_,f,h,d,E,S,R){"use strict";var y=null;var g=null;var b=new l(d.HIGHLIGHTER_ID);var T=s.extend("sap.ui.support.Main",{constructor:function(){if(!g){this._oCore=null;this._oAnalyzer=new n;this._oAnalyzer.onNotifyProgress=function(e){p.publish(h.ON_PROGRESS_UPDATE,{currentProgress:e})};s.apply(this,arguments);var t=document.createEvent("CustomEvent");t.initCustomEvent("supportToolLoaded",true,true,{})}else{e.warning("Only one support tool allowed");return g}}});T.prototype.exit=function(){y._stop();this._pluginStarted=false;this._oCore=null;this._oCoreFacade=null;this._oDataCollector=null;this._oExecutionScope=null};T.prototype._isInIframe=function(){try{return window.self!==window.top}catch(e){return true}};T.prototype.startPlugin=function(e){if(this._pluginStarted){return}this._aSupportModeConfig=e;if(i.isInitialized()){this._initPlugin()}else{i.attachInit(this._initPlugin.bind(this))}};T.prototype._initPlugin=function(){var e=this._aSupportModeConfig;this._pluginStarted=true;this._supportModeConfig=e=e||i.getConfiguration().getSupportMode();p.bSilentMode=e.indexOf("silent")>-1;this._setCommunicationSubscriptions();var t=this._isInIframe()&&e.indexOf("frame-force-ui")!==-1;this._oCore=i;this._oDataCollector=new f(i);this._oCoreFacade=u(i);this._oExecutionScope=null;this._createElementSpies();i.attachLibraryChanged(E._onLibraryChanged);if(!e||e.indexOf("silent")===-1||t){sap.ui.require(["sap/ui/support/supportRules/ui/IFrameController"],function(t){y=t;y.injectFrame(e);p.allowFrame(y.getCommunicationInfo())})}else{E.updateRuleSets(function(){this.fireEvent("ready")}.bind(this))}};T.prototype._createElementSpies=function(){var e=this,t=500;this._fnDirtyTimeoutHandle=null;var s=function(s){var i=o.prototype[s];o.prototype[s]=function(){i.apply(this,arguments);clearTimeout(e._fnDirtyTimeoutHandle);e._fnDirtyTimeoutHandle=setTimeout(function(){p.publish(h.ON_CORE_STATE_CHANGE)},t)}};s("register");s("deregister")};T.prototype._setCommunicationSubscriptions=function(){p.subscribe(h.VERIFY_CREATE_RULE,function(e){var t=S.deserialize(e),s=E.getRuleSet(d.TEMP_RULESETS_NAME).ruleset,i=s.addRule(t);p.publish(h.VERIFY_RULE_CREATE_RESULT,{result:i,newRule:S.serialize(t)})},this);p.subscribe(h.VERIFY_UPDATE_RULE,function(e){var t=S.deserialize(e.updateObj),s=E.getRuleSet(d.TEMP_RULESETS_NAME).ruleset,i=s.updateRule(e.oldId,t);p.publish(h.VERIFY_RULE_UPDATE_RESULT,{result:i,updateRule:S.serialize(t)})},this);p.subscribe(h.DELETE_RULE,function(e){var t=S.deserialize(e),s=E.getRuleSet(d.TEMP_RULESETS_NAME).ruleset;s.removeRule(t)},this);p.subscribe(h.OPEN_URL,function(e){var t=window.open(e,"_blank");t.opener=null;t.focus()},this);p.subscribe(h.ON_DOWNLOAD_REPORT_REQUEST,function(e){this._getReportData(e).then(function(e){sap.ui.require(["sap/ui/support/supportRules/report/ReportProvider"],function(t){t.downloadReportZip(e)})})},this);p.subscribe(h.HIGHLIGHT_ELEMENT,function(e){var t=i.byId(e).$();t.css("background-color","red")},this);p.subscribe(h.TREE_ELEMENT_MOUSE_ENTER,function(e){b.highlight(e)},this);p.subscribe(h.TREE_ELEMENT_MOUSE_OUT,function(){b.hideHighLighter()},this);p.subscribe(h.TOGGLE_FRAME_HIDDEN,function(e){y.toggleHide(e)},this);p.subscribe(h.POST_UI_INFORMATION,function(e){this._oDataCollector.setSupportAssistantLocation(e.location);this._oDataCollector.setSupportAssistantVersion(e.version)},this);p.subscribe(h.GET_AVAILABLE_COMPONENTS,function(){p.publish(h.POST_AVAILABLE_COMPONENTS,Object.keys(r.registry.all()))},this);p.subscribe(h.ON_ANALYZE_REQUEST,function(e){this.analyze(e.executionContext,e.rulePreset)},this);p.subscribe(h.ON_INIT_ANALYSIS_CTRL,function(){E.updateRuleSets(function(){t.load().then(function(e){p.publish(h.POST_APPLICATION_INFORMATION,{versionInfo:e});this.fireEvent("ready")}.bind(this))}.bind(this))},this);p.subscribe(h.ON_SHOW_REPORT_REQUEST,function(e){this._getReportData(e).then(function(e){sap.ui.require(["sap/ui/support/supportRules/report/ReportProvider"],function(t){t.openReport(e)})})},this);p.subscribe(h.LOAD_RULESETS,function(e){E.loadAdditionalRuleSets(e.aLibNames)},this);p.subscribe(h.REQUEST_RULES_MODEL,function(e){if(e){p.publish(h.GET_RULES_MODEL,c.getTreeTableViewModel(e))}},this);p.subscribe(h.REQUEST_ISSUES,function(e){if(e){var t=c.groupIssues(e),s=c.getIssuesViewModel(t);p.publish(h.GET_ISSUES,{groupedIssues:t,issuesModel:s})}},this);p.subscribe(h.GET_NON_LOADED_RULE_SETS,function(e){E.fetchNonLoadedRuleSets(e.loadedRulesets)},this)};T.prototype.analyze=function(t,s,i){var o=this;if(this._oAnalyzer&&this._oAnalyzer.running()){return}if(typeof s==="string"){s=R.SystemPresets[s];if(!s){e.error("System preset ID is not valid");return}}t=t||{type:"global"};if(i){this._oAnalysisMetadata=JSON.parse(JSON.stringify(i))}else{this._oAnalysisMetadata=null}var r;if(s&&s.selections){this._oSelectedRulePreset=s;r=s.selections;if(!s.id||!s.title){e.error("The preset must have an ID and a title");return}}else{this._oSelectedRulePreset=null;r=s}r=r||E.getAllRuleDescriptors();if(!this._isExecutionScopeValid(t)){p.publish(h.POST_MESSAGE,{message:"Set a valid element ID."});return}p.publish(h.ON_ANALYZE_STARTED);if(t.selectors){this._mapExecutionScope(t)}this._oAnalyzer.reset();this.setExecutionScope(t);c.clearIssues();this._setSelectedRules(r);return this._oAnalyzer.start(this._aSelectedRules,this._oCoreFacade,this._oExecutionScope).then(function(){return o._done()})};T.prototype._isExecutionScopeValid=function(t){var s=[],o=false,r;if(a.possibleScopes.indexOf(t.type)===-1){e.error("Invalid execution scope type. Type must be one of the following: "+a.possibleScopes.join(", "));return false}if(t.type==="subtree"){if(t.parentId){s.push(t.parentId)}else if(Array.isArray(t.selectors)){s=s.concat(t.selectors)}else if(t.selectors){s.push(t.selectors)}for(r=0;r<s.length;r++){if(i.byId(s[r])){o=true;break}}if(!o){return false}}return true};T.prototype.setExecutionScope=function(e){this._oExecutionScope=a(this._oCore,e)};T.prototype._setSelectedRules=function(t){this._aSelectedRules=[];this._oSelectedRulesIds={};if(!t){return}if(!Array.isArray(t)){t=[t]}t.forEach(function(t){var s,i;if(!t.libName||!t.ruleId){e.error("["+d.SUPPORT_ASSISTANT_NAME+"] Invalid Rule Descriptor.");return}s=E.getRuleSet(t.libName);if(!s||!s.ruleset){e.error("["+d.SUPPORT_ASSISTANT_NAME+"] Could not find Ruleset for library "+t.libName);return}i=s.ruleset.getRules();if(!i||!i[t.ruleId]){e.error("["+d.SUPPORT_ASSISTANT_NAME+"] Could not find Rule with id "+t.ruleId+" for library "+t.libName);return}this._aSelectedRules.push(i[t.ruleId]);this._oSelectedRulesIds[t.ruleId]=true},this)};T.prototype._mapExecutionScope=function(e){if(e.type==="subtree"){if(typeof e.selectors==="string"){e.parentId=e.selectors}else if(Array.isArray(e.selectors)){e.parentId=e.selectors[0]}}else if(e.type==="components"){if(typeof e.selectors==="string"){e.components=[e.selectors]}else if(Array.isArray(e.selectors)){e.components=e.selectors}}delete e.selectors};T.prototype._done=function(){p.publish(h.ON_ANALYZE_FINISH,{issues:c.getIssuesModel(),elementTree:this._createElementTree(),elapsedTime:this._oAnalyzer.getElapsedTimeString()});return _.saveAnalysis(this)};T.prototype._createElementTree=function(){var e=this._copyElementsStructure(),t=[];this._setContextElementReferences(e);for(var s in e){if(e[s].skip){continue}t.push(e[s])}return[{content:t,id:"WEBPAGE",name:"WEBPAGE"}]};T.prototype._setContextElementReferences=function(e){var t=o.registry.all();for(var s in e){var i=e[s],r=t[s]==undefined?undefined:t[s].getParent();if(t[s]instanceof sap.ui.core.ComponentContainer){var n=t[s],u=n.getComponent();if(u){i.content.push(e[u]);e[u].skip=true}}if(r){var a=r.getId();if(!e[a]){continue}e[a].content.push(e[s]);e[s].skip=true}}};T.prototype._copyElementsStructure=function(){var e={};var t=function(t,s){for(var i in t){if(Object.prototype.hasOwnProperty.call(t,i)){var o=t[i];var r={content:[],id:o.getId(),name:s==undefined?o.getMetadata().getName():s};e[o.getId()]=r}}};t(this._oExecutionScope.getElements());this._oExecutionScope.getElements().forEach(function(e){if(e instanceof sap.ui.core.ComponentContainer){var s=e.getComponent(),i=r.registry.get(s);if(i){t([i],"sap-ui-component")}}});switch(this._oExecutionScope.getType()){case"global":t(this._oCoreFacade.getUIAreas(),"sap-ui-area");t(this._oCoreFacade.getComponents(),"sap-ui-component");break;case"subtree":var s=this._oExecutionScope._getContext().parentId;t([o.registry.get(s)]);break;case"components":var i=this._oExecutionScope._getContext().components;i.forEach(function(e){t([r.registry.get(e)],"sap-ui-component")});break}return e};T.prototype._getReportData=function(e){return this._oDataCollector.getTechInfoJSON().then(function(t){var s=c.groupIssues(c.getIssuesModel()),i=E.getRuleSets(),o=this._oSelectedRulesIds,r=this._oSelectedRulePreset||null;return{issues:s,technical:t,application:this._oDataCollector.getAppInfo(),rules:c.getRulesViewModel(i,o,s),rulePreset:r,scope:{executionScope:this._oExecutionScope,scopeDisplaySettings:{executionScopes:e.executionScopes,executionScopeTitle:e.executionScopeTitle}},analysisDuration:this._oAnalyzer.getElapsedTimeString(),analysisDurationTitle:e.analysisDurationTitle,abap:_.getFormattedHistory(R.HistoryFormats.Abap),name:d.SUPPORT_ASSISTANT_NAME}}.bind(this))};T.prototype.getAnalysisHistory=function(){if(this._oAnalyzer.running()){return null}return _.getHistory()};T.prototype.getFormattedAnalysisHistory=function(e){if(this._oAnalyzer.running()){return""}return _.getFormattedHistory(e)};T.prototype.getLastAnalysisHistory=function(){var e=this.getAnalysisHistory();if(Array.isArray(e)&&e.length>0){return e[e.length-1]}else{return null}};T.prototype.addRule=function(e){if(!e){return"No rule provided."}e.selected=e.selected!==undefined?e.selected:true;e.async=e.async||false;var t=E.getRuleSet(d.TEMP_RULESETS_NAME).ruleset.addRule(e);p.publish(h.VERIFY_RULE_CREATE_RESULT,{result:t,newRule:S.serialize(e)});return t};var g=new T;return g},true);
//# sourceMappingURL=Main.js.map
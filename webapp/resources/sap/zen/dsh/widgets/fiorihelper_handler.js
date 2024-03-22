/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","jquery.sap.global","sap/zen/dsh/utils/BaseHandler","sap/base/security/encodeURL"],function(e,jQuery,t,i){"use strict";var a=function(){t.apply(this,arguments);var e=this;this.sCmdOnSetShellUrl=null;this.oAppState=null;this.aAllowedSemanticSources=[];this.aValidJumpTargets=[];this.sSelection=null;this.create=function(e,t){this.oAppState=null;this.sSelection=null;var i=t.id;var a=this.createDefaultProxy(i);this.init(a,t);a.setVisible(false);return a};this.update=function(e,t){this.init(e,t);return e};this.init=function(e,t){if(t){this.sCmdOnSetShellUrl=t.onSetShellUrlCommand;if(t.shellAppTitle){this.setTitle(t.shellAppTitle)}if(t.appState){this.setAppState(t.appState,t.hostUI5Control)}if(t.context){this.setNavigationContext(t.context,t.hostUI5Control)}var i=t.clientAction;if(i&&i.length>0){if(i==="NAVIGATE_BACK"){this.navigateBack()}else if(i==="GET_SHELL_URL"){this.setShellUrl()}else if(i==="SET_APP_TITLE"){this.setTitle(t.shellAppTitle)}else if(i==="SAVE_TILE"){this.saveTile(t)}else if(i==="SEND_EMAIL"){this.sendEmail(t)}else if(i==="FETCH_JUMP_TARGETS"){this.fetchJumpTargets(t)}else if(i==="JUMP_TO"){this.jumpToTarget(t)}}}};function a(){return sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("CrossApplicationNavigation")}function n(){return sap.ushell&&sap.ushell.Container&&sap.ushell.Container.getService("ShellNavigation")}this.setShellUrl=function(){if(this.sCmdOnSetShellUrl&&this.sCmdOnSetShellUrl.length>0){sap.ushell.Container.getFLPUrlAsync(true).then(function(t){var i=this.sCmdOnSetShellUrl;i=e.prepareCommand(i,"__URL__",t);var a=new Function(i);a()}.bind(this))}};this.setTitle=function(e){sap.zen.dsh.sapbi_page&&sap.zen.dsh.sapbi_page.appComponent&&sap.zen.dsh.sapbi_page.appComponent.getService("ShellUIService").then(function(t){if(t){t.setTitle(e)}},function(){})};this.setAppState=function(e,t){if(e){var i=t&&sap.ui.getCore().byId(t);if(i&&i.fireStateChange){return i.fireStateChange({state:e})}if(!sap.zen.dsh.sapbi_page.appComponent){return}var s=a();var o=n();if(o){if(this.oAppState){var r=this.oAppState.getData();if(r&&r.customData&&r.customData.bookmarkedAppState===e){return}}s.createEmptyAppStateAsync(sap.zen.dsh.sapbi_page.appComponent).then(function(t){this.oAppState=t;var i={customData:{bookmarkedAppState:e}};this.oAppState.setData(i);this.oAppState.save();o.toAppHash("sap-iapp-state="+this.oAppState.getKey(),false);this.setShellUrl()}.bind(this))}}};this.setNavigationContext=function(e,t){var i=t&&sap.ui.getCore().byId(t);if(i&&i.fireSelectionChange){var a=JSON.stringify(e);if(this.sSelection!==a){this.sSelection=a;i.fireSelectionChange({selection:this.createSelectionVariantObject(e)})}}};this.saveTile=function(e){var t=new sap.ushell.ui.footerbar.AddBookmarkButton({beforePressHandler:function(){if(e.shellAppTitle){t.setTitle(e.shellAppTitle)}if(e.tile&&e.tile.subTitle){t.setSubtitle(e.tile.subTitle)}if(e.tile&&e.tile.info){t.setInfo(e.tile.info)}}});t.firePress()};this.sendEmail=function(e){var t=e.email&&e.email.destination;var i=e.email&&e.email.subject;var a=e.email&&e.email.text;sap.m.URLHelper.triggerEmail(t,i,a)};this.navigateBack=function(){var e=a();if(e){e.backToPreviousApp()}};this.fetchJumpTargets=function(e){this.getAllowedSemanticSources(e);var t=e.context;var i=this.createSelectionVariantObject(t);var n={};this.addNameSelectionPairFromArray(t.selections,n);this.addNameSelectionPairFromArray(t.filter,n);this.addNameSelectionPairFromArray(t.variables,n);var s=a();var o;if(i!==undefined&&sap.zen.dsh.sapbi_page&&sap.zen.dsh.sapbi_page.appComponent){var r=s.createEmptyAppState(sap.zen.dsh.sapbi_page.appComponent);var l={selectionVariant:i};r.setData(l);r.save();o=r.getKey()}this.getValidJumpTargets(s,n,o,e)};this.getAllowedSemanticSources=function(e){this.aAllowedSemanticSources=[];if(e.navigation&&e.navigation.allowedSemanticSources){var t=e.navigation.allowedSemanticSources.length;if(t&&t>0){for(var i=0;i<t;i++){this.aAllowedSemanticSources.push(e.navigation.allowedSemanticSources[i].entry.semanticName)}}}return this.aAllowedSemanticSources};this.getValidJumpTargets=function(t,a,n,s){this.aValidJumpTargets=[];var o=[];this.aAllowedSemanticSources.forEach(function(e){o.push([{semanticObject:e,params:a,ignoreFormFactor:false,ui5Component:sap.zen.dsh.sapbi_page.appComponent,appStateKey:n,compactIntents:false}])});var r=t.hrefForAppSpecificHash("");if(r){var l=r.indexOf("?");r=r.substring(0,l>0?l:r.length-2)}var p=[];t.getLinks(o).done(function(t){t.forEach(function(e){e[0].forEach(function(e){if(e.text&&e.intent&&e.intent!==r&&e.intent.indexOf(r+"?")!==0){p.push(e)}})});p.sort(function(e,t){return e.text.localeCompare(t.text)});if(p&&p.length>0){for(var a=0;a<p.length;++a){var n=p[a];this.aValidJumpTargets.push({text:n.text,hash:n.intent})}}if(s.navigation&&s.navigation.onJumpTargetsFetchedCommand&&s.navigation.onJumpTargetsFetchedCommand.length>0){var o=JSON.stringify(this.aValidJumpTargets);o=i(o);var l=e.prepareCommand(s.navigation.onJumpTargetsFetchedCommand,"__JUMPTARGETS__",o);var h=new Function(l);h()}}.bind(this))};this.jumpToTarget=function(e){if(!e.navigation){return}var t=e.navigation.jumpTarget;var i=a();if(i&&t&&t.length>0){if(e.navigation&&e.navigation.navigateInPlace){i.toExternal({target:{shellHash:t}})}else{window.open(t)}}};this.createSelectionVariantObject=function(e){if(!e){return}var t={};var i=this.getContextSelectOptions(e);if(i!==undefined){t.SelectOptions=i;t.SelectionVariantID=(new Date).toISOString();t.Text="Temporary Variant "+t.SelectionVariantID;return t}};this.getContextSelectOptions=function(e){var t={};var i=[];this.addSelectOptionsFromArray(e.selections,t);this.addSelectOptionsFromArray(e.filter,t);this.addSelectOptionsFromArray(e.variables,t);for(var a in t){if(Object.prototype.hasOwnProperty.call(t,a)){i.push({PropertyName:a,Ranges:t[a]})}}if(i.length>0){return i}};this.addSelectOptionsFromArray=function(e,t){if(e){var i=e.length;if(i>0){for(var a=0;a<i;a++){var n=e[a].dimension.name;if(n&&n.length>0&&!Object.prototype.hasOwnProperty.call(t,n)){if(e[a].dimension.selection){t[n]=[{Sign:"I",Option:"EQ",Low:e[a].dimension.selection,High:null}]}else if(e[a].dimension.selections&&e[a].dimension.selections.length>0){t[n]=e[a].dimension.selections.map(function(e){if(e.LowType!=="DATE"){return e}var t={};for(var i in e){if(Object.prototype.hasOwnProperty.call(e,i)){t[i]=(i==="Low"||i==="High")&&e[i]?e[i]+"T00:00:00.000Z":e[i]}}return t})}}}}}};this.addNameSelectionPairFromArray=function(e,t){var i,a,n;if(e&&t){var s=e.length;if(s>0){for(var o=0;o<s;o++){i=e[o].dimension.name;if(i&&i.length>0&&!t[i]){a=e[o].dimension.selection;if(a&&a.length>0){t[i]=a}else{n=e[o].dimension.selections;if(n&&n.length===1&&n[0].Sign&&n[0].Sign==="I"&&n[0].Option&&n[0].Option==="EQ"){t[i]=n[0].Low==="#"?"":n[0].Low;if(n[0].LowType==="DATE"){t[i]=t[i]+"T00:00:00.000Z"}}}}}}}};this.getDefaultProxyClass=function(){return["sap.m.Button","sap.ui.commons.Button"]};this.getType=function(){return"fiorihelper"}};var n=new a;t.dispatcher.addHandlers(n.getType(),n);return n});
//# sourceMappingURL=fiorihelper_handler.js.map
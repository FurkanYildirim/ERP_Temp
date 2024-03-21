/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/base/util/Version","sap/ui/support/library","sap/ui/support/supportRules/Storage","sap/ui/support/supportRules/Constants"],function(e,r,t,i,s){"use strict";var o={};var u=function(r){r=r||{};if(!r.name){e.error("Please provide a name for the RuleSet.")}if(o[r.name]){return o[r.name]}this._oSettings=r;this._mRules={};o[r.name]=this};u.clearAllRuleSets=function(){o={}};u.prototype.getRules=function(){return this._mRules};u.prototype.updateRule=function(e,r){var t=this._verifySettingsObject(r,true);if(t==="success"){delete this._mRules[e];this._mRules[r.id]=r}return t};u.prototype._verifySettingsObject=function(r,i){if(!r.id){e.error("Support rule needs an id.");return"Support rule needs an unique id."}if(!i&&this._mRules[r.id]){e.error("Support rule with the id "+r.id+" already exists.");return"Support rule with the id "+r.id+" already exists."}if(!r.check){e.error("Support rule with the id "+r.id+" needs a check function.");return"Support rule with the id "+r.id+" needs a check function."}if(!r.title){e.error("Support rule with the id "+r.id+" needs a title.");return"Support rule with the id "+r.id+" needs a title."}if(!r.description){e.error("Support rule with the id "+r.id+" needs a description.");return"Support rule with the id "+r.id+" needs a description."}if(!r.resolution&&(!r.resolutionurls||r.resolutionurls.length===0)){e.error("Support rule with the id "+r.id+" needs either a resolution or resolutionurls or should have a ticket handler function");return"Support rule with the id "+r.id+" needs either a resolution or resolutionurls or should have a ticket handler function"}if(!r.audiences||r.audiences.length===0){e.error("Support rule with the id "+r.id+" should have an audience. Applying audience ['Control']");r.audiences=[t.Audiences.Control]}if(r.audiences&&r.audiences.forEach){var s=false,o="";r.audiences.forEach(function(e){if(!t.Audiences[e]){s=true;o=e}});if(s){e.error("Audience "+o+" does not exist. Please use the audiences from sap.ui.support.Audiences");return"Audience "+o+" does not exist. Please use the audiences from sap.ui.support.Audiences"}}if(!r.categories||r.categories.length===0){e.error("Support rule with the id "+r.id+" should have a category. Applying category ['Performance']");r.categories=["Performance"]}if(r.categories&&r.categories.forEach){var u=false,n="";r.categories.forEach(function(e){if(!t.Categories[e]){u=true;n=e}});if(u){e.error("Category "+n+" does not exist. Please use the categories from sap.ui.support.Categories");return"Category "+n+" does not exist. Please use the categories from sap.ui.support.Categories"}}return"success"};u.prototype.addRule=function(e,t){var i=u.versionInfo?u.versionInfo.version:t.version;var s=e.minversion?e.minversion:"";if(s==="-"){s=""}if(s&&r(i).compareTo(s)<0){return"Rule "+e.id+" should be used with a version >= "+e.minversion}var o=this._verifySettingsObject(e);if(o==="success"){this._mRules[e.id]=e;e.libName=this._oSettings.name}return o};u.prototype.removeRule=function(e){if(this._mRules[e.id]){delete this._mRules[e.id]}};u.storeSelectionOfRules=function(e){var r=u._extractRulesSettingsToSave(e);i.setSelectedRules(r)};u.loadSelectionOfRules=function(e){var r=i.getSelectedRules();if(!r){return}for(var t=0;t<e.length;t+=1){var s=e[t].rules;var o=e[t].title;for(var u=0;u<s.length;u+=1){if(r[o]&&r[o].hasOwnProperty(s[u].id)){s[u].selected=r[o][s[u].id].selected}}}};u._extractRulesSettingsToSave=function(e){var r={};var t;var i=e.length;var s;var o;var u;for(var n=0;n<i;n+=1){o=e[n].title;r[o]={};t=e[n].rules;s=t.length;for(var a=0;a<s;a+=1){u={};u.id=t[a].id;u.selected=t[a].selected;r[o][u.id]=u}}return r};return u},true);
//# sourceMappingURL=RuleSet.js.map
/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/m/GroupHeaderListItem","sap/ui/base/ManagedObject","sap/ui/core/format/DateFormat","sap/ui/core/Fragment","sap/ui/core/library","sap/ui/fl/write/api/Version","sap/ui/model/Sorter","sap/ui/rta/Utils"],function(e,t,i,o,r,s,n,a){"use strict";var l=r.MessageType;var u="sapUiRtaDraftVersionAccent";var c="sapUiRtaActiveVersionAccent";var g=t.extend("sap.ui.rta.toolbar.versioning.Versioning",{metadata:{properties:{toolbar:{type:"any"}}},constructor:function(){t.prototype.constructor.apply(this,arguments);this.oTextResources=this.getToolbar().getTextResources()}});function T(e){var t=e.getSource().getBindingContext("versions");var i=s.Number.Original;if(t){i=t.getProperty("version")}this.getToolbar().fireEvent("switchVersion",{version:i})}function h(e){return e.some(function(e){return e.type===s.Type.Active})}function p(e){return h(e)?l.None:l.Success}function f(e){return h(e)?this.oTextResources.getText("LBL_INACTIVE"):this.oTextResources.getText("LBL_ACTIVE")}function v(e){switch(e){case s.Type.Draft:return l.Warning;case s.Type.Active:return l.Success;default:return l.None}}function d(e){switch(e){case s.Type.Draft:return this.oTextResources.getText("TIT_DRAFT");case s.Type.Active:return this.oTextResources.getText("LBL_ACTIVE");default:return this.oTextResources.getText("LBL_INACTIVE")}}function V(e,t){if(t===s.Type.Draft){return this.oTextResources.getText("TIT_DRAFT")}return e||this.oTextResources.getText("TIT_VERSION_1")}function b(e,t){var o=t||e;if(!o){return""}return i.getInstance({format:"yMMMdjm"}).format(new Date(o))}function y(t){return new e({title:t.key?this.oTextResources.getText("TIT_VERSION_HISTORY_PUBLISHED"):this.oTextResources.getText("TIT_VERSION_HISTORY_UNPUBLISHED"),upperCase:false,visible:this.getToolbar().getModel("controls").getProperty("/publishVisible")}).addStyleClass("sapUiRtaVersionHistoryGrouping").addStyleClass("sapUiRtaVersionHistory")}function m(e,t){switch(t){case s.Type.Draft:e.addStyleClass(u);e.removeStyleClass(c);break;case s.Type.Active:e.addStyleClass(c);e.removeStyleClass(u);break;default:e.removeStyleClass(c);e.removeStyleClass(u)}}g.prototype.formatVersionButtonText=function(e,t){var i="";var o="Active";e=e||[];if(t===undefined||t===s.Number.Original){i=this.oTextResources.getText("TIT_ORIGINAL_APP");o=s.Type.Inactive;if(e.length===0||e.length===1&&e[0].type===s.Type.Draft){o=s.Type.Active}}else{var r=e.find(function(e){return e.version===t});if(r){o=r.type;if(t===s.Number.Draft){i=this.oTextResources.getText("TIT_DRAFT")}else{i=r.title||this.oTextResources.getText("TIT_VERSION_1")}}}m(this.getToolbar().getControl("versionButton"),o);return i};g.prototype.formatPublishVersionVisibility=function(e,t,i,o){return e&&t&&i!==s.Number.Draft&&o==="adaptation"};g.prototype.formatDiscardDraftVisible=function(e,t,i){return e===s.Number.Draft&&t&&i==="adaptation"};g.prototype.showVersionHistory=function(e){var t=e.getSource();if(!this._oVersionHistoryDialogPromise){this._oVersionHistoryDialogPromise=o.load({name:"sap.ui.rta.toolbar.versioning.VersionHistory",id:this.getToolbar().getId()+"_fragment--sapUiRta_versionHistoryDialog",controller:{formatVersionTitle:V.bind(this),formatVersionTimeStamp:b,formatHighlight:v,formatHighlightText:d.bind(this),formatOriginalAppHighlight:p,formatOriginalAppHighlightText:f.bind(this),versionSelected:T.bind(this),getGroupHeaderFactory:y.bind(this)}}).then(function(e){this.getToolbar().addDependent(e);return e}.bind(this))}return this._oVersionHistoryDialogPromise.then(function(e){if(!e.isOpen()){e.openBy(t);if(this.getToolbar().getModel("controls").getProperty("/publishVisible")){var i=this.getToolbar().getControl("versionHistoryDialog--versionList");var o=new n({path:"isPublished",group:true});i.getBinding("items").sort(o)}}else{e.close()}}.bind(this))};g.prototype.openActivateVersionDialog=function(e){if(!this._oActivateVersionDialogPromise){this._oActivateVersionDialogPromise=o.load({name:"sap.ui.rta.toolbar.versioning.VersionTitleDialog",id:this.getToolbar().getId()+"_fragment--sapUiRta_activateVersionDialog",controller:{onConfirmVersioningDialog:function(){var e=this.getToolbar().getControl("activateVersionDialog--versionTitleInput").getValue();this.getToolbar().fireEvent("activate",{versionTitle:e});this._oActivateVersionDialog.close()}.bind(this),onCancelVersioningDialog:function(){this._oActivateVersionDialog.close()}.bind(this),onVersionTitleLiveChange:function(e){var t=e.getParameter("value");this.getToolbar().getControl("activateVersionDialog--confirmVersionTitleButton").setEnabled(!!t)}.bind(this)}}).then(function(e){this._oActivateVersionDialog=e;e.addStyleClass(a.getRtaStyleClassName());this.getToolbar().addDependent(this._oActivateVersionDialog)}.bind(this))}else{this.getToolbar().getControl("activateVersionDialog--versionTitleInput").setValue("");this.getToolbar().getControl("activateVersionDialog--confirmVersionTitleButton").setEnabled(false)}return this._oActivateVersionDialogPromise.then(function(){var t=this.oTextResources.getText("TIT_VERSION_TITLE_DIALOG");if(e!==s.Number.Draft){t=this.oTextResources.getText("TIT_REACTIVATE_VERSION_TITLE_DIALOG")}this._oActivateVersionDialog.setTitle(t);return this._oActivateVersionDialog.open()}.bind(this))};return g});
//# sourceMappingURL=Versioning.js.map
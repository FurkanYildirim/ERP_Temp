/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/core/util/reflection/JsControlTreeModifier","sap/ui/fl/Utils","sap/ui/fl/write/api/ContextSharingAPI","sap/ui/rta/command/BaseCommand","sap/ui/rta/library","sap/ui/rta/Utils"],function(e,t,a,n,r,i,o){"use strict";var s=r.extend("sap.ui.rta.command.ControlVariantSaveAs",{metadata:{library:"sap.ui.rta",properties:{sourceVariantReference:{type:"string"},sourceDefaultVariant:{type:"string"},model:{type:"object"},newVariantParameters:{type:"object"}},associations:{},events:{}}});s.prototype.prepare=function(e){this.oVariantManagementControl=this.getElement();this.oAppComponent=a.getAppComponentForControl(this.oVariantManagementControl);this.sVariantManagementReference=t.getSelector(this.oVariantManagementControl,this.oAppComponent).id;this.oModel=this.getModel();this.setSourceDefaultVariant(this.oModel.getData()[this.sVariantManagementReference].defaultVariant);this.sLayer=e.layer;var r=e;r.variantManagementControl=this.oVariantManagementControl;function i(e,t){var a=e.getParameters();this.setNewVariantParameters(a);this.oVariantManagementControl.detachSave(i,this);this.oVariantManagementControl.detachCancel(s,this);t.resolve(true)}function s(e,t){this.oVariantManagementControl.detachSave(i,this);this.oVariantManagementControl.detachCancel(s,this);t.resolve(false)}return new Promise(function(e){this.oVariantManagementControl.attachSave({resolve:e},i,this);this.oVariantManagementControl.attachCancel({resolve:e},s,this);this.oVariantManagementControl.openSaveAsDialogForKeyUser(o.getRtaStyleClassName(),n.createComponent(r))}.bind(this)).then(function(e){return e})};s.prototype.getPreparedChange=function(){if(!this._aPreparedChanges){return undefined}return this._aPreparedChanges};s.prototype.execute=function(){var e=this.getSourceVariantReference();this._aControlChanges=this.oModel.getVariant(e,this.sVariantManagementReference).controlChanges;var t=this.getNewVariantParameters();t.layer=this.sLayer;t.newVariantReference=this.sNewVariantReference;t.generator=i.GENERATOR_NAME;return this.oModel._handleSave(this.oVariantManagementControl,t).then(function(e){this._aPreparedChanges=e;this._oVariantChange=e[0];this.sNewVariantReference=this._oVariantChange.getId();this._aPreparedChanges.forEach(function(e){if(e.getFileType()==="change"){e.setSavedToVariant(true)}});this.getModel().invalidateMap()}.bind(this))};s.prototype.undo=function(){if(this._oVariantChange){this._aPreparedChanges.forEach(function(e){if(e.getFileType()==="ctrl_variant_management_change"){this.oModel.oFlexController.deleteChange(e)}}.bind(this));var e={variant:this._oVariantChange,sourceVariantReference:this.getSourceVariantReference(),variantManagementReference:this.sVariantManagementReference,component:this.oAppComponent};return this.oModel.removeVariant(e,true).then(function(){return this.oModel.addAndApplyChangesOnVariant(this._aControlChanges)}.bind(this)).then(function(){this._aPreparedChanges=null;this._oVariantChange=null}.bind(this))}return Promise.resolve()};return s});
//# sourceMappingURL=ControlVariantSaveAs.js.map
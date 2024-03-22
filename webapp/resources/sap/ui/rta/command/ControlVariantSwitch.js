/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/util/reflection/JsControlTreeModifier","sap/ui/fl/apply/api/ControlVariantApplyAPI","sap/ui/fl/Utils","sap/ui/rta/command/BaseCommand"],function(e,t,n,a){"use strict";var r=a.extend("sap.ui.rta.command.ControlVariantSwitch",{metadata:{library:"sap.ui.rta",properties:{targetVariantReference:{type:"string"},sourceVariantReference:{type:"string"},discardVariantContent:{type:"boolean"}},associations:{},events:{}},constructor:function(){a.apply(this,arguments);this.setRelevantForSave(false)}});function i(e){return this.oModel.eraseDirtyChangesOnVariant(this.sVariantManagementReference,e).then(function(e){this._aSourceVariantDirtyChanges=e}.bind(this))}r.prototype._getAppComponent=function(){var e=this.getElement();return e?n.getAppComponentForControl(e):this.getSelector().appComponent};r.prototype.execute=function(){var n=this.getElement();var a=this._getAppComponent();var r=this.getTargetVariantReference();this.oModel=a.getModel(t.getVariantModelName());this.sVariantManagementReference=e.getSelector(n,a).id;return Promise.resolve().then(function(){if(this.getDiscardVariantContent()){return i.call(this,this.getSourceVariantReference())}return undefined}.bind(this)).then(this._updateModelVariant.bind(this,r,a))};r.prototype.undo=function(){var e=this.getSourceVariantReference();var t=this._getAppComponent();return this._updateModelVariant(e,t).then(function(){if(this.getDiscardVariantContent()){return this.oModel.addAndApplyChangesOnVariant(this._aSourceVariantDirtyChanges).then(function(){this._aSourceVariantDirtyChanges=null;this.oModel.checkUpdate(true)}.bind(this))}return undefined}.bind(this))};r.prototype._updateModelVariant=function(e,t){if(this.getTargetVariantReference()!==this.getSourceVariantReference()){return this.oModel.updateCurrentVariant({variantManagementReference:this.sVariantManagementReference,newVariantReference:e,appComponent:t})}return Promise.resolve()};return r});
//# sourceMappingURL=ControlVariantSwitch.js.map
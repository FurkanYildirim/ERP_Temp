/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ovp/cards/AppSettingsUtils","sap/ui/model/json/JSONModel","sap/base/util/merge"],function(t,e,n,s){"use strict";return t.extend("sap.ovp.cards.rta.AppSettingsDialog",{onInit:function(){e.oResetButton.attachPress(this.onResetButton,this)},onAfterRendering:function(){this.setEnablePropertyForResetAndSaveButton(false);this._ovpManifestSettings=this.getView().getModel().getData();this._originalOVPManifestSettings=s({},this._ovpManifestSettings)},onResetButton:function(){this.setEnablePropertyForResetAndSaveButton(false);this._ovpManifestSettings=s({},this._originalOVPManifestSettings);var t=new n(this._ovpManifestSettings);this.getView().setModel(t);this.getView().getModel().refresh()},onChange:function(){this.setEnablePropertyForResetAndSaveButton(true)},setEnablePropertyForResetAndSaveButton:function(t){e.oResetButton.setEnabled(t);e.oSaveButton.setEnabled(t)}})});
//# sourceMappingURL=AppSettingsDialog.controller.js.map
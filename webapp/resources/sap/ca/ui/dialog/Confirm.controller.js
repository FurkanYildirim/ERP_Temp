/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.require("sap.ca.ui.utils.resourcebundle");sap.ui.controller("sap.ca.ui.dialog.Confirm",{_CONFIRM_NOTE_ID:"TXA_NOTE",_CONFIRM_BUTTON_ID:"BTN_CONFIRM",_CONFIRM_DIALOG_ID:"DLG_CONFIRM",_CONFIRM_VERTICALLAYOUT_SM_ID:"VLT_ADDINFO",_CONFIRM_TEXT_EMPTYLINE:"TXT_EMPTYLINE",_bNoteMandatory:false,_sPreviousInput:"",onInit:function(){var e=this.getView().byId(this._CONFIRM_DIALOG_ID);if(jQuery.device.is.phone===false){e.setContentWidth("25em")}e.addDelegate({onBeforeRendering:function(){this._onBeforeRenderingDialog()}},true,this)},_onBeforeRenderingDialog:function(){var e=this.getView().byId(this._CONFIRM_NOTE_ID);e.setValue("");this._sPreviousInput="";this._bNoteMandatory=false;var t=this.getView().byId(this._CONFIRM_DIALOG_ID).getModel();if(t){this._bNoteMandatory=t.getProperty("/noteMandatory");if(this._bNoteMandatory){this.enableConfirmButton(false);e.setPlaceholder(sap.ca.ui.utils.resourcebundle.getText("YMSG_TEXT_NOTE_MANDATORY"))}else{this.enableConfirmButton(true);e.setPlaceholder(sap.ca.ui.utils.resourcebundle.getText("YMSG_TEXT_NOTE"))}if(this._bNoteMandatory){e.setVisible(true)}else{if(t.getProperty("/showNote")){e.setVisible(true)}else{e.setVisible(false)}}var i=t.getProperty("/additionalInformation");var a=this._visibleAdditionalInformation(i);var r=this.getView().byId(this._CONFIRM_VERTICALLAYOUT_SM_ID);r.setVisible(a);var s=this.getView().byId(this._CONFIRM_TEXT_EMPTYLINE);s.setVisible(!a);var o=this.getView().byId("LBL_INFO1");var n=t.getProperty("/additionalInformation/0/label");o.setVisible(this._formatVisible(n));var l=this.getView().byId("TXT_INFO1");var _=t.getProperty("/additionalInformation/0/text");l.setVisible(this._formatVisible(_));var I=this.getView().byId("LBL_INFO2");var d=t.getProperty("/additionalInformation/1/label");I.setVisible(this._formatVisible(d));var f=this.getView().byId("TXT_INFO2");var u=t.getProperty("/additionalInformation/1/text");f.setVisible(this._formatVisible(u));var b=this.getView().byId("LBL_INFO3");var h=t.getProperty("/additionalInformation/2/label");b.setVisible(this._formatVisible(h));var g=this.getView().byId("TXT_INFO3");var N=t.getProperty("/additionalInformation/2/text");g.setVisible(this._formatVisible(N));var V=this.getView().byId("LBL_INFO4");var O=t.getProperty("/additionalInformation/3/label");V.setVisible(this._formatVisible(O));var T=this.getView().byId("TXT_INFO4");var v=t.getProperty("/additionalInformation/3/text");T.setVisible(this._formatVisible(v))}},_visibleAdditionalInformation:function(e){return e&&e.length>0?true:false},onConfirmDialog:function(e){var t=this.getView().byId(this._CONFIRM_NOTE_ID);var i={isConfirmed:true,sNote:t.getValue()};sap.ca.ui.dialog.factory.closeDialog(this._CONFIRM_DIALOG_ID,i)},onCancelDialog:function(e){var t={isConfirmed:false};sap.ca.ui.dialog.factory.closeDialog(this._CONFIRM_DIALOG_ID,t)},onNoteInput:function(e){var t=e.getParameters().value?e.getParameters().value:e.getParameters().newValue;t=jQuery.trim(t);if(t&&!this._sPreviousInput){this.enableConfirmButton(true)}else{if(this._sPreviousInput&&!t&&this._bNoteMandatory){this.enableConfirmButton(false)}}this._sPreviousInput=t?t:""},enableConfirmButton:function(e){var t=this.getView().byId(this._CONFIRM_BUTTON_ID);if(t.getEnabled()!==e){t.setEnabled(e);t.rerender()}},_formatVisible:function(e){if(e&&e.length>0)return true;return false}});
//# sourceMappingURL=Confirm.controller.js.map
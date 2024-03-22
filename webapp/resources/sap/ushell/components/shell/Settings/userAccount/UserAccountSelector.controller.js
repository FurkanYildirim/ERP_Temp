// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/base/Log","sap/ushell/Config","sap/ushell/resources","sap/m/MessageBox","sap/m/MessageToast","sap/ushell/utils","sap/ushell/utils/WindowUtils"],function(e,n,t,s,o,i,r,a,l){"use strict";return e.extend("sap.ushell.components.shell.Settings.userAccount.UserAccountSelector",{onInit:function(){var e=sap.ushell.Container.getRenderer("fiori2").getShellConfig(),n=e.enableUserImgConsent;this.imgConsentEnabled=n||false;this.oUser=sap.ushell.Container.getUser();var i=o.getTranslationModel();var r=this.getConfigurationModel();this.getView().setModel(i,"i18n");this.getView().setModel(r,"config");this.oUser.attachOnSetImage(function(){r.setProperty("/icon",s.last("/core/shell/model/userImage/personPlaceHolder"))});sap.ushell.Container.getServiceAsync("Personalization").then(function(e){return e.isResetEntirePersonalizationSupported().then(function(e){if(!e){r.setProperty("/isResetPersonalizationVisible",false)}})}).catch(function(e){t.error("The personalization service could not be loaded because of: ."+e.toString())})},getConfigurationModel:function(){var e=new n({}),t=sap.ushell.Container.getUser(),o=s.last("/core/shell/model/userImage/personPlaceHolder")||"sap-icon://person-placeholder";e.setData({icon:o,name:t.getFullName(),mail:t.getEmail(),server:window.location.host,imgConsentEnabled:this.imgConsentEnabled,isImageConsentForUser:t.getImageConsent(),isResetPersonalizationVisible:this.isResetPersonalizationVisible||true});return e},onCancel:function(){if(this.imgConsentEnabled){this.getView().getModel("config").setProperty("/isImageConsentForUser",this.oUser.getImageConsent())}},onSave:function(e){if(this.imgConsentEnabled){return this.onSaveUserImgConsent(e)}return Promise.resolve()},onSaveUserImgConsent:function(e){var n=this.oUser,s=n.getImageConsent(),o=this.getView().getModel("config"),i=o.getProperty("/isImageConsentForUser"),r;t.debug("[000] onSaveUserImgConsent:current",i,"UserAccountSelector.controller");t.debug("[000] onSaveUserImgConsent:original",s,"UserAccountSelector.controller");if(s!==i){n.setImageConsent(i);return new Promise(function(i,a){r=e();r.then(function(){n.resetChangedProperty("isImageConsent");i()});r.catch(function(e){if(!e.includes("ISIMAGECONSENT")){n.resetChangedProperty("isImageConsent");i()}else{n.setImageConsent(s);n.resetChangedProperty("isImageConsent");o.setProperty("/isImageConsentForUser",s);t.error(e);a(e)}})})}return Promise.resolve()},termsOfUserPress:function(){var e=this.getView().byId("termsOfUseTextFlexBox"),n=this.getView().byId("termsOfUseLink"),t=e.getVisible();e.setVisible(!t);n.setText(o.i18n.getText(t?"userImageConsentDialogShowTermsOfUse":"userImageConsentDialogHideTermsOfUse"))},showMessageBoxWarningDeletePersonalization:function(){i.warning(o.i18n.getText("userAccountResetPersonalizationWarningDialogDescription"),{onClose:this.resetEntirePersonalization.bind(this),actions:[i.Action.OK,i.Action.CANCEL],contentWidth:"600px"})},resetEntirePersonalization:function(e){if(e===i.Action.OK){this.getView().setBusy(true);sap.ushell.Container.getServiceAsync("Personalization").then(function(e){return e.resetEntirePersonalization().then(function(){r.show(o.i18n.getText("userAccountResetPersonalizationWarningDialogSuccessToast"),{onClose:l.refreshBrowser})}).catch(this.showErrorMessageBox.bind(this))}.bind(this)).catch(this.showErrorMessageBox.bind(this)).finally(function(){this.getView().setBusy(false)}.bind(this))}},showErrorMessageBox:function(){i.error(o.i18n.getText("userAccountResetPersonalizationWarningDialogErrorDialog"),{actions:i.Action.CLOSE,contentWidth:"600px"})}})});
//# sourceMappingURL=UserAccountSelector.controller.js.map
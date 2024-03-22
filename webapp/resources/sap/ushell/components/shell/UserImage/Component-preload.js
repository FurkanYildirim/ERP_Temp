//@ui5-bundle sap/ushell/components/shell/UserImage/Component-preload.js
sap.ui.require.preload({
	"sap/ushell/components/shell/UserImage/Component.js":function(){
/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/base/Log","sap/base/util/isEmptyObject","sap/m/Button","sap/m/library","sap/ui/core/Configuration","sap/ui/core/IconPool","sap/ui/core/UIComponent","sap/ui/Device","sap/ui/thirdparty/jquery","sap/ushell/resources"],function(e,s,t,a,n,o,r,i,jQuery,l){"use strict";var u;var g=a.ButtonType;return r.extend("sap.ushell.components.shell.UserImage.Component",{metadata:{version:"1.115.1",library:"sap.ushell.components.shell.UserImage",dependencies:{libs:{"sap.m":{},"sap.ui.layout":{lazy:true}}}},createContent:function(){var e;u=sap.ushell.Container.getRenderer("fiori2")._oShellView;e=(u.getViewData()?u.getViewData().config:{})||{};this.loadUserImage();var s=sap.ushell.Container.getUser();if(e.enableUserImgConsent===true&&s.getImageConsent()===undefined){this._showUserConsentPopup()}},_showUserConsentPopup:function(){var e=this;var s=n.getRTL()?"Right":"Left";var a,o,r,u;var p=new t("yesButton",{text:l.i18n.getText("DisplayImg"),type:g.Emphasized,press:function(){e.updateUserImage(true);a.close()}});var m=new t("noButton",{text:l.i18n.getText("DontDisplayImg"),press:function(){e.updateUserImage(false);a.close()}});sap.ui.require(["sap/ui/layout/form/VerticalLayout","sap/m/Dialog","sap/m/Text","sap/m/Link","sap/m/FlexBox"],function(e,t,n,g,d){a=new t("userConsentDialog",{title:l.i18n.getText("userImageConsentDialogTitle"),modal:true,stretch:i.system.phone,buttons:[p,m],afterClose:function(){a.destroy()}}).addStyleClass("sapUshellUserConsentDialog").addStyleClass("sapContrastPlus");var c=new n({text:l.i18n.getText("userImageConsentDialogTermsOfUse")}).addStyleClass("sapUshellUserConsentDialogTerms");var C=new n({text:l.i18n.getText("userImageConsentText"),textAlign:s}).addStyleClass("sapUshellUserConsentDialogText");var f=new g({text:l.i18n.getText("userImageConsentDialogShowTermsOfUse"),textAlign:s,press:function(){var e=u.getVisible();if(e){u.setVisible(false);f.setText(l.i18n.getText("userImageConsentDialogShowTermsOfUse"))}else{f.setText(l.i18n.getText("userImageConsentDialogHideTermsOfUse"));u.setVisible(true)}}}).addAriaLabelledBy(C);o=new d({alignItems:"Center",direction:"Row",items:[C]}).addStyleClass("sapUshellUserConsentDialogBox");r=new d({alignItems:"Center",direction:"Row",items:[f]}).addStyleClass("sapUshellUserConsentDialogBox").addStyleClass("sapUshellUserConsentDialogLink");u=new d({alignItems:"Center",direction:"Row",items:[c]}).addStyleClass("ushellUserImgConsentTermsOfUseFlexBox");u.setVisible(false);var h=new e("userConsentDialogLayout",{content:[o,r,u]});a.addContent(h);a.open()})},loadUserImage:function(){var e=sap.ushell.Container.getUser(),s=e.getImage();if(s){this._setUserImage(s)}e.attachOnSetImage(this._setUserImage.bind(this))},_setUserImage:function(t){var a=typeof t==="string"?t:t.mParameters;if(a&&typeof a==="string"||!s(a)){jQuery.ajax({url:a,headers:{"Cache-Control":"no-cache, no-store, must-revalidate",Pragma:"no-cache",Expires:"0"},success:function(){u.getModel().setProperty("/userImage/personPlaceHolder",a);u.getModel().setProperty("/userImage/account",a)},error:function(){e.error("Could not load user image from: "+a,"","sap.ushell.renderers.fiori2.Shell.view");sap.ushell.Container.getUser().setImage("")}})}else{u.getModel().setProperty("/userImage/personPlaceHolder",null);u.getModel().setProperty("/userImage/account",o.getIconURI("account"))}},updateUserImage:function(e){var s=sap.ushell.Container.getUser(),t;sap.ushell.Container.getServiceAsync("UserInfo").then(function(a){if(e!==undefined){s.setImageConsent(e);t=a.updateUserPreferences(s);t.done(function(){s.resetChangedProperty("isImageConsent")})}})}})});
}
});
//# sourceMappingURL=Component-preload.js.map

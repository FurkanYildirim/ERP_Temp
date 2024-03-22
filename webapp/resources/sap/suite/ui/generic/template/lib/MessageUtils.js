sap.ui.define(["sap/ui/base/Event","sap/ui/core/library","sap/ui/core/IconPool","sap/m/MessageToast","sap/ui/generic/app/util/MessageUtil","sap/suite/ui/generic/template/genericUtilities/controlHelper","sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/suite/ui/generic/template/lib/TemplateComponent"],function(e,t,r,a,s,o,n,i){"use strict";var c=t.ValueState;var l=t.IconColor;var g=new n("lib.MessageUtils").getLogger();var E=sap.ui.getCore().getMessageManager();function u(e,t,r,a,o,n){o=o||{};var i=s.parseErrorResponse(a);var c=i.messageText;var l;var E=false;var u=false;var p=t&&t.getOwnerComponent();var T=o.resourceBundle||p.getModel("i18n").getResourceBundle();var _=o.navigationController||r.oNavigationController;var v=o.model||p.getModel();g.debug("handleError has been called with operation "+e+" and HTTP response status code "+i.httpStatusCode);var f=n&&n[i.httpStatusCode];if(f){f(i.httpStatusCode)}var I=i.httpStatusCode;switch(I){case 400:switch(e){case s.operations.modifyEntity:break;case s.operations.callAction:c=T.getText("ST_GENERIC_BAD_REQUEST_ACTION");break;case s.operations.deleteEntity:c=T.getText("ST_GENERIC_BAD_REQUEST_DELETE");break;case s.operations.editEntity:c=T.getText("ST_GENERIC_BAD_REQUEST_EDIT");break;case s.operations.saveEntity:case s.operations.activateDraftEntity:if(r&&r.oTemplateCapabilities&&r.oTemplateCapabilities.oMessageButtonHelper&&r.oTemplateCapabilities.oMessageButtonHelper.showMessagePopover){r.oTemplateCapabilities.oMessageButtonHelper.showMessagePopover();u=true}else{g.info("A MessageButtonHelper class instance could not be found as one of the services' template capabilities.")}break;default:c=T.getText("ST_GENERIC_BAD_REQUEST");break}break;case 401:E=true;c=T.getText("ST_GENERIC_ERROR_AUTHENTICATED_FAILED");l=T.getText("ST_GENERIC_ERROR_AUTHENTICATED_FAILED_DESC");break;case 403:switch(e){case s.operations.callAction:c=T.getText("ST_GENERIC_ERROR_NOT_AUTORIZED_ACTION");break;case s.operations.addEntry:c=T.getText("ST_GENERIC_ERROR_NOT_AUTORIZED_CREATE");break;case s.operations.deleteEntity:c=T.getText("ST_GENERIC_ERROR_NOT_AUTORIZED_DELETE");break;case s.operations.editEntity:c=T.getText("ST_GENERIC_ERROR_NOT_AUTORIZED_EDIT");break;default:c=T.getText("ST_GENERIC_ERROR_NOT_AUTORIZED");l=T.getText("ST_GENERIC_ERROR_NOT_AUTORIZED_DESC");E=true;break}break;case 404:switch(e){case s.operations.callAction:c=T.getText("ST_GENERIC_BAD_REQUEST_ACTION");break;default:c=T.getText("ST_GENERIC_BAD_REQUEST");break}break;case 409:case 412:if((e===s.operations.activateDraftEntity||e===s.operations.deleteEntity)&&a.response&&a.response.headers&&a.response.headers["preference-applied"]==="handling=strict"){return}break;case 422:break;case 423:if(e===s.operations.activateDraftEntity||e===s.operations.saveEntity||e===s.operations.deleteEntity){return}break;case 500:case 501:case 502:case 503:case 504:case 505:E=!Object.keys(s.operations).some(function(t){return t===e});switch(e){case s.operations.callAction:c=T.getText("ST_GENERIC_ERROR_SYSTEM_UNAVAILABLE_FOR_ACTION");break;default:c=T.getText("ST_GENERIC_ERROR_SYSTEM_UNAVAILABLE");break}l=T.getText("ST_GENERIC_ERROR_SYSTEM_UNAVAILABLE_DESC");break;case 0:E=false;u=true;break;default:E=true;c=T.getText("ST_GENERIC_ERROR_SYSTEM_UNAVAILABLE");l=T.getText("ST_GENERIC_ERROR_SYSTEM_UNAVAILABLE_DESC");break}if(E){var R;if(p){var S=p.getModel("_templPriv");R=S.getProperty("/generic/viewLevel")}_.navigateToMessagePage({title:T.getText("ST_GENERIC_ERROR_TITLE"),text:c,description:l,icon:"sap-icon://message-error",viewLevel:R})}else if(!i.containsTransientMessage&&!u){s.addTransientErrorMessage(c,l,v)}}function p(t,r,a,s,n){var c;if(r instanceof e){var l=r.getParameter("item");c=l.getBindingContext("msg").getObject()}else{c=r}var g=t.oCommonUtils.getPositionableControlId(c.controlIds,true);if(!g){t.oServices.oApplication.registerForMessageNavigation(t,c,a);return}var E=Promise.resolve(false);if(s){var u=o.byId(g);if(o.isTable(u)){var p=c.controlIds.filter(function(e){var t=o.byId(e);return!o.isTable(t)});var T;p.forEach(function(e){var r=o.isElementVisibleOnView(e,null,function(t){var r=o.isView(t)&&t.getVisible()&&t.getController().getOwnerComponent();return r instanceof i&&{component:r,controlId:e}});if(r&&t.oServices.oApplication.isComponentActive(r.component)){var a=r.component.getModel("_templPriv");r.level=a.getProperty("/generic/viewLevel");if(!T||T.level<r.level){T=r}}});if(T){g=T.controlId;a=T.component}else{var _=c.aFullTargets.find(function(e){return e.startsWith(n)&&e.lastIndexOf("/")>n.length});if(_){E=t.oServices.oApplication.navigateToMessageTarget(c,_)}}}}E.then(function(e){if(e){return}var r={targetInfo:c};t.oServices.oApplication.prepareForControlNavigation(a,g).then(function(){var e=o.byId(g);var t=o.isSmartField(e)?o.getSmartFieldIsFocussableForInputPromise(e):Promise.resolve(true);t.then(function(t){o.focusUI5Control(t?e:e.getParent(),r)})})})}function T(e,t){var r=E.getMessageModel().getData();var a=r.some(function(e){return e.persistent&&t.oApplication.isTransientMessageNoCustomMessage(e)});if(!a){t.oApplication.showMessageToast(e)}}function _(e,t){var r=e.some(function(e){var r=t.oCommonUtils.getPositionableControlId(e.controlIds,true);return!r||o.isTable(o.byId(r))});return r?t.oComponentUtils.prepareForMessageHandling(e):Promise.resolve()}function v(e){var t=e.getTechnicalDetails();return!!t&&t.statusCode==="412"&&!t.headers["preference-applied"]}function f(e){var t=E.getMessageModel().getData();return t.find(function(t){return t.id===e})}function I(e,t){var r=E.getMessageModel().getProperty("/");var a=r.filter(function(r){return r.persistent&&(e||!r.technicalDetails||r.technicalDetails.statusCode!=="404"||r.type!=="Error")&&t(r)});return a}function R(e){var t=I(true,e);if(t.length>0){E.removeMessages(t)}}function S(e){var t=c.None,r=0;for(var a=0;a<e.length;a++){var s=C(e[a]);if(s>r){t=e[a].type;r=s}}return t}function d(e,t){var r,a="";r=S(e);var s="";if(r===c.Error){s=e.length>1?"ST_MESSAGES_DIALOG_TITLE_ERROR_PLURAL":"ST_MESSAGES_DIALOG_TITLE_ERROR"}else if(r===c.Warning){s=e.length>1?"ST_MESSAGES_DIALOG_TITLE_WARNING_PLURAL":"ST_MESSAGES_DIALOG_TITLE_WARNING"}else if(r===c.Information){s="ST_MESSAGES_DIALOG_TITLE_INFORMATION"}else if(r===c.Success){s="ST_MESSAGES_DIALOG_TITLE_SUCCESS_PLURAL"}a=t.getText(s);return{sTitle:a,sSeverity:r}}function A(e,t,r){var s=e.oApplicationProxy.isTransientMessageNoCustomMessage;var o=I(false,s);if(o.length===0){return Promise.resolve()}R(s);var n;if(o.length===1){n=o[0].type;if(n===c.Success||n===c.Information||n===c.None){a.show(o[0].message);return Promise.resolve()}}var i=d(o,e);n=i.sSeverity;return new Promise(function(t){var a,s,c;var l=function(){a.close();c.setProperty("/backButtonVisible",false);c.setProperty("/messages",[]);c.setProperty("/messageToGroupName",Object.create(null));s.navigateBack();c.getProperty("/resolve")()};var g={onMessageDialogClose:function(){l(c)},onActionButtonPressed:function(){c.getProperty("/actionButtonCallback")();l(c)},onBackButtonPress:function(){c.setProperty("/backButtonVisible",false);s.navigateBack()},onMessageSelect:function(){c.setProperty("/backButtonVisible",true)},getSeverityIconFromIconPool:b,getIconColor:m};var E=function(t,r){r.setProperty("/genericGroupName",e.getText("ST_MESSAGE_GENERAL_TITLE"));r.setProperty("/backButtonVisible",false);r.setProperty("/cancelButtonText",e.getText("CANCEL"));r.setProperty("/closeButtonText",e.getText("ST_GENERIC_DIALOG_CLOSE_BUT"))};e.oApplicationProxy.getDialogFragmentAsync("sap.suite.ui.generic.template.fragments.MessageDialog",g,"settings",E,false,true).then(function(e){a=e;s=a.getContent()[0];var l=a.getModel();var g=l&&l.getMetaModel();var E=false;var u=!!(r&&r.action);var p=Object.create(null);if(g){o.forEach(function(e){var t=e.getTarget();if(!t){return}if(t.lastIndexOf("/")>0){t=t.substring(0,t.lastIndexOf("/"))}var r=t.substring(1,t.indexOf("("));var a=r&&g.getODataEntitySet(r);var s=a&&g.getODataEntityType(a.entityType);var o=s&&s["com.sap.vocabularies.UI.v1.HeaderInfo"];var n=o&&o.Title&&o.Title.Value&&o.Title.Value.Path;var i=l.getProperty(t);var c=i&&i[n];if(c){p[e.getId()]=c;E=true}})}c=a.getModel("settings");c.setProperty("/showActionButton",u);if(u){c.setProperty("/actionButtonText",r.actionLabel);c.setProperty("/actionButtonCallback",r.action)}c.setProperty("/title",i.sTitle);c.setProperty("/messages",o);c.setProperty("/grouping",E);c.setProperty("/state",n);c.setProperty("/resolve",t);c.setProperty("/messageToGroupName",p);a.open()})})}function C(e){var t;switch(e.type){case"Error":t=4;break;case"Warning":t=3;break;case"Information":t=2;break;case"Success":t=1;break;default:t=0}return t}function b(e){switch(e){case c.Error:return r.getIconURI("error");case c.Warning:return r.getIconURI("alert");case c.Information:return r.getIconURI("information");case c.Success:return r.getIconURI("sys-enter-2");default:return""}}function m(e){switch(e){case c.Error:return l.Negative;case c.Warning:return l.Critical;case c.Success:return l.Positive;default:return""}}return{operations:s.operations,handleTransientMessages:A,prepareForMessageHandling:_,handleError:u,navigateFromMessageTitleEvent:p,removeTransientMessages:R,getTransientMessages:I,showSuccessMessageIfRequired:T,parseError:s.parseErrorResponse,isMessageETagMessage:v,getMessageById:f,getSeverityAsNumber:C,getSeverityIconFromIconPool:b,getIconColor:m,getMessageDialogTitleAndSeverity:d}});
//# sourceMappingURL=MessageUtils.js.map
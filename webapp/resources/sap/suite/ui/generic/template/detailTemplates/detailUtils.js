sap.ui.define(["sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/ui/core/UIComponent","sap/ui/core/routing/HashChanger","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/suite/ui/generic/template/genericUtilities/controlHelper","sap/suite/ui/generic/template/extensionAPI/NavigationController","sap/suite/ui/generic/template/lib/MessageButtonHelper","sap/suite/ui/generic/template/genericUtilities/testableHelper","sap/suite/ui/generic/template/detailTemplates/DiscardEditHandler","sap/suite/ui/generic/template/detailTemplates/PaginatorButtonsHelper","sap/suite/ui/generic/template/ObjectPage/extensionAPI/DraftTransactionController","sap/suite/ui/generic/template/ObjectPage/extensionAPI/NonDraftTransactionController","sap/m/DraftIndicator"],function(e,t,n,a,o,r,i,s,l,c,u,p,g){"use strict";var v=new e("detailTemplates.detailUtils").getLogger();var f=sap.m.DraftIndicatorState;var d=new a({path:"persistent",operator:o.EQ,value1:false});function m(e,t,n){function a(){var e=t.getTemplatePrivateModel();e.setProperty("/objectPage",{displayMode:0,headerInfo:{objectTitle:"",objectSubtitle:""},cancelEnabled:true})}function o(a,o){if(!t.isDraftEnabled()){var r=e.getModel("ui");var i=t.getTemplatePrivateModel();var s=r.getProperty("/createMode");i.setProperty("/objectPage/displayMode",s?4:1)}(n.onComponentActivate||Function.prototype)(a,o)}function r(t){var a=e.getModel("_templPrivGlobal");a.setProperty("/generic/draftIndicatorState",f.Clear);(n.applyHeaderContextToSmartTablesDynamicColumnHide||Function.prototype)(t)}function i(){n.navigateUp()}function s(e){return n.getMessageFilters(e)}function l(e){return n.getScrollFunction&&n.getScrollFunction(e)}function c(){return{callAlways:true}}return{init:a,onActivate:o,getTitle:t.getTitle,updateBindingContext:r,navigateUp:i,getMessageFilters:s,getScrollFunction:l,getStatePreserverSettings:c}}function C(e,a,o){var f;var m;function C(){var e=t.getRouterFor(o);return e?e.getHashChanger():n.getInstance()}function b(e){var t=!a.oComponentUtils.isDraftEnabled();if(t||!e){var n=o.getView().getModel("ui");n.setProperty("/editable",e)}}function P(){a.oServices.oApplication.onBackButtonPressed()}function h(){var t=a.oServices.oApplication.getLinksToUpperLayers();var n=a.oComponentUtils.getViewLevel();var o;if(a.oComponentUtils.isDraftEnabled()){var r=a.oComponentUtils.getTemplatePrivateModel();o=r.getProperty("/objectPage/displayMode")}else{o=1}e.navigateUp=t[n-1].navigate.bind(null,o,false);var i=e.aBreadCrumbs;var s=i?i.length:0;for(var l=0;l<s;l++){var c=i[l];var u=t[l+1];u.adaptBreadCrumbLink(c);var p={id:c.getId(),navigate:u.navigate.bind(null,o,true)};a.oInfoObjectHandler.initializeLinkInfoObject(p)}}function B(){e.navigateUp()}function y(e){var t=a.oServices.oApplication.getBusyHelper();var n=o.getView().getModel("ui");var r=a.oServices.oApplicationController.synchronizeDraftAsync().then(function(){B()},function(){t.getUnbusy().then(function(e){a.oCommonUtils.processDataLossTechnicalErrorConfirmation(function(){B();n.setProperty("/enabled",true)},Function.prototype,f.state,"LeavePage")})});t.setBusy(r)}function U(e){var t=e.getSource();var n=a.oComponentUtils.getCRUDActionHandler();n.handleCRUDScenario(2,y.bind(null,t))}var H;function S(t,n){H=H||new c(o,a,e,f.state);return H.discardEdit(t,n)}function M(){var e=a.oServices.oApplication.getBusyHelper();if(e.isBusy()){return}f.state.messageButtonHelper.toggleMessagePopover()}function F(e){return f.state.messageButtonHelper&&f.state.messageButtonHelper.getMessageFilters(e)}function T(){var e;return function(){e=e||new i(a,o,f.state);return e}}function A(){var e;return function(){if(!e){var t=a.oComponentUtils.isDraftEnabled()?p:g;e=new t(a,o,f.state)}return e}}function I(e){m.handleShowNextObject(e)}function w(){m.switchToNextObject()}function j(e){m.handleShowPrevObject(e)}var C=l.testable(C,"getHashChangerInstance");var h=l.testable(h,"adaptLinksToUpperLevels");f={onInit:function(t,n){if(!t||t.footerBar){var i=a.oComponentUtils.isODataBased();f.state.messageButtonHelper=new s(a,n||{controller:o},i);if(!a.oComponentUtils.isDraftEnabled()){var l=o.getOwnerComponent().getModel("ui");var c=l.bindProperty("/editable");var p=sap.ui.getCore().getMessageManager();var g=p.getMessageModel();c.attachChange(function(){if(!c.getValue()){var e=f.state.messageButtonHelper.getContextFilter(false);var t=g.bindList("/",null,null,[e,d]);var n=t.getContexts();var a=n.map(function(e){return e.getObject()});p.removeMessages(a)}})}a.oServices.oTemplateCapabilities.oMessageButtonHelper=f.state.messageButtonHelper;f.state.onCancel=S}if(!t||t.paginatorButtons){m=new u(f,o,a,e)}e.getScrollFunction=function(t){var n=a.oCommonUtils.getPositionableControlId(t,true);if(n){return function(){(e.prepareForControlNavigation||Function.prototype)(n);r.focusControl(n)}}}},handlers:{handleShowNextObject:I,handleShowPrevObject:j,onShowMessages:M,applyAndUp:U,onSave:function(){v.error("Save for this floorplan not implemented yet")},onBack:P},extensionAPI:{getNavigationControllerFunction:T,getTransactionControllerFunction:A},fclInfo:{isContainedInFCL:false},state:{},onComponentActivate:function(e,t){if(f.state.messageButtonHelper){f.state.messageButtonHelper.adaptToContext(e)}h();if(m){m.computeAndSetVisibleParamsForNavigationBtns()}},utils:{switchToNextObject:w}};e.navigateUp=B;e.setEditable=b;e.getMessageFilters=F;var D=a.oComponentUtils.getFclProxy();if(D.oActionButtonHandlers){f.handlers.fclActionButtonHandlers=D.oActionButtonHandlers;f.fclInfo.isContainedInFCL=true}return f}return{getComponentBase:m,getControllerBase:C}});
//# sourceMappingURL=detailUtils.js.map
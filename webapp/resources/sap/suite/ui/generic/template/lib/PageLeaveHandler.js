sap.ui.define(["sap/ui/base/Object","sap/base/util/extend","sap/suite/ui/generic/template/lib/CRUDHelper","sap/suite/ui/generic/template/lib/MessageUtils"],function(e,t,o,n){"use strict";function r(e){var t,r;function i(e){var t=e.getContent()[1];return t.getSelectedItem().data("itemKey")}function a(e){var t=e.getContent()[1];var o=t.getItems()[0];t.setSelectedItem(o);o.focus()}function l(o,n,l){t=o;r=n;var p,v=u(),g=v.oController;var d="sap.suite.ui.generic.template.ObjectPage.view.fragments.DraftConfirmationPopup";v.oControllerUtils.oCommonUtils.getDialogFragmentAsync(d,{onDraftPopupOk:function(){var o=i(p);switch(o){case"draftPopupOptionSave":{var n=Promise.resolve(u().oController.beforeSaveExtension());n.then(s.bind(null,e,l),Function.prototype);p.close()}break;case"draftPopupOptionKeep":{e.oAppComponent.getApplicationController().synchronizeDraftAsync().then(function(){t()}).finally(function(){p.close()})}break;case"draftPopupOptionDiscard":{var a=c(l).then(t);a.catch(r);p.close()}break;default:break}},onDraftPopupCancel:function(){r();p.close()}},"draftConfirmationPopup").then(function(e){p=e;var t,o=f(g);if(o){t=u().oControllerUtils.oCommonUtils.getText("ST_KEEP_DRAFT_MESSAGE_CREATE")}else{t=u().oControllerUtils.oCommonUtils.getText("ST_KEEP_DRAFT_MESSAGE_EDIT")}p.getContent()[0].setProperty("text",t);a(e);p.open()})}function s(e,r){var i=u();var a=i.oControllerUtils.oServices;var l=i.oController;var s=o.activateDraftEntity(null,null,e.oBusyHelper,a,l,i.oControllerUtils.oComponentUtils);s.then(function(o){var s=l.getOwnerComponent();var c=f(l);if(c){n.showSuccessMessageIfRequired(i.oControllerUtils.oCommonUtils.getText("OBJECT_CREATED"),a)}else{n.showSuccessMessageIfRequired(i.oControllerUtils.oCommonUtils.getText("OBJECT_SAVED"),a)}a.oViewDependencyHelper.setAllPagesDirty([s.getId()]);a.oViewDependencyHelper.unbindChildren(s);a.oApplication.invalidatePaginatorInfo();var p=o.context;var u=r==="LeaveApp"&&e.oApplicationProxy.navigateAfterActivation(p,true)||Promise.resolve();e.oBusyHelper.setBusy(u);return u.then(function(o){e.oNavigationControllerProxy.setBackNavigationOption(o);t()})},function(){i.oControllerUtils.oInfoObjectHandler.executeForAllInformationObjects("smartTable",function(e){e.onSaveWithError()})});var c={activationPromise:s};i.oControllerUtils.oComponentUtils.fire(i.oController,"AfterActivate",c)}function c(t){var n=e.oAppComponent.getTransactionController();var r=n.getDraftController();var i=e.oApplicationProxy;var a=i.getContextForPath(g());var l=e.oNavigationControllerProxy.getCurrentIdentity();var s=t==="LeaveApp"&&e.oApplicationProxy.getNavigateAfterDraftCancelPromise(a,true)||Promise.resolve();var c=s.then(function(t){return o.discardDraft(r,n,i,a).then(function(){e.oNavigationControllerProxy.setBackNavigationOption(t);e.oViewDependencyHelper.setRootPageToDirty();e.oViewDependencyHelper.unbindChildrenUsingTreeNode(l.treeNode);i.invalidatePaginatorInfo()})});e.oBusyHelper.setBusy(c);return c}function p(t,o,n,r){var i=e.oNavigationControllerProxy.isDiscardDraftConfirmationNeeded();var a=(i==="always"&&n.startsWith("Leave")||i==="restricted"&&n==="LeavePage")&&v();if(a){l(t,o,n)}else{t()}}function u(){var t;var o=e.oNavigationControllerProxy.getCurrentIdentity();var n=e.oApplicationProxy.getAncestralNode(o.treeNode,1);var r=n.componentId?n.componentId:o.treeNode.componentId;t=e.componentRegistry[r];return t}function f(e){var t=e.getOwnerComponent().getModel("ui");return t.getProperty("/createMode")}function v(){return e.oApplicationProxy.checkIfObjectIsADraftInstance(g())}function g(){var t=e.oNavigationControllerProxy.getCurrentIdentity();var o=e.oApplicationProxy.getAncestralNode(t.treeNode,1);var n=o.getPath(3,t.keys);return n}function d(t,o,n,r,i){var a=new Promise(function(a,l){var s=function(){var e=t();a(e)};var c=function(){o();l()};if(r){p(s,c,n,i)}else{e.oApplicationProxy.performAfterSideEffectExecution(p.bind(null,s,c,n,i),true)}});return a}return{discardDraft:c,performAfterDiscardOrKeepDraft:d}}return e.extend("sap.suite.ui.generic.template.lib.PageLeaveHandler",{constructor:function(e){t(this,r(e))}})});
//# sourceMappingURL=PageLeaveHandler.js.map
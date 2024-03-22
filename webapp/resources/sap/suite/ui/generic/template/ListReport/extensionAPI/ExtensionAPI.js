sap.ui.define(["sap/ui/base/Object","sap/suite/ui/generic/template/ListReport/extensionAPI/NonDraftTransactionController","sap/suite/ui/generic/template/extensionAPI/NavigationController","sap/base/util/extend","sap/ui/core/message/Message"],function(e,t,n,o,i){"use strict";function r(e,o,i){var r;var s;return{getSelectedContexts:function(){return i.oPresentationControlHandler.getSelectedContexts()},getTransactionController:function(){if(e.oComponentUtils.isDraftEnabled()){throw new Error("FioriElements: ListReport.extensionAPI.ExtensionAPI : Transaction support on ListReport for draft case not implemented yet")}r=r||new t(e,o,i);return r},rebindTable:function(e){if(i.oMultipleViewsHandler.refreshOperation(1,e)){return}i.oPresentationControlHandler.rebind()},refreshTable:function(e){if(i.oMultipleViewsHandler.refreshOperation(2,e)){return}i.refreshModel();i.oPresentationControlHandler.refresh()},attachToView:function(t){e.oCommonUtils.attachControlToView(t)},invokeActions:function(t,n,o,r){return e.oCommonUtils.invokeActionsForExtensionAPI(t,n,o,r,i)},getNavigationController:function(){if(!s){s=new n(e,o,i)}return s},getCommunicationObject:function(t){return e.oComponentUtils.getCommunicationObject(t)},securedExecution:function(t,n){return e.oCommonUtils.securedExecution(t,n,i)},getQuickVariantSelectionKey:function(){return i.oMultipleViewsHandler.getSelectedKey()},setQuickVariantSelectionKey:function(e){i.oMultipleViewsHandler.setSelectedKey(e)},onCustomAppStateChange:function(){i.oIappStateHandler.customAppStateChange()},setCustomMessage:function(e,t,n){i.oMessageStripHelper.setCustomMessage(e,t,n)}}}return e.extend("sap.suite.ui.generic.template.ListReport.extensionAPI.ExtensionAPI",{constructor:function(e,t,n){o(this,r(e,t,n))}})});
//# sourceMappingURL=ExtensionAPI.js.map
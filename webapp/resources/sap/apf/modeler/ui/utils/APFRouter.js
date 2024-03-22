/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/UIComponent"],function(e){"use strict";var t={patternMatch:function(t){this.params={};var a=this;e.getRouterFor(t).attachRoutePatternMatched(function(e){a.params={name:e.getParameter("name"),arguments:e.getParameter("arguments")};t.getView().byId("idConfigMasterData").setBusy(true);t.getView().byId("idConfigDetail").setBusy(true);if(a.params.name!=="applicationList"){var i=t.oCoreApi;t.appId=a.params.arguments.appId;t.configId=a.params.arguments.configId;i.getApplicationHandler(function(e){t.applicationHandler=e;t.appName=e.getApplication(t.appId).ApplicationName;var n=t.byId("idConfigTitleMaster").getText();if(n===""||a.params.name==="configurationList"){t.setConfigListMasterTitle(t.appName);t.oTreeInstance.setApplicationId(a.params.arguments.appId)}i.getConfigurationHandler(t.appId,function(e){t.configurationHandler=e;t.oTextPool=t.configurationHandler.getTextPool();if(t.configurationHandler.getList().length>t.getView().getModel().getData().aConfigDetails.length){t.createConfigList();if(a.params.name==="configurationList"){t.updateConfigListView()}}if(t.configurationHandler.getList().length===0&&t.configId===undefined){t.oTreeInstance.addNodeInTree(sap.apf.modeler.ui.utils.CONSTANTS.configurationObjectTypes.CONFIGURATION);var i=t.oTreeInstance.getItems();var n=i[i.length-1];t.oTreeInstance.setSelectedItem(n);t.oTreeInstance.expand(0);t.getView().byId("idConfigDetail").setBusy(false)}else if(t.configId===undefined){t.oTreeInstance.expandToLevel(1);t.oTreeInstance.collapseAll()}if(t.configId!==undefined){var o=e.getConfiguration(t.configId);if(o){e.loadConfiguration(t.configId,function(e){t.configEditor=e;var i=t.getSPathForConfig(t.configId);if(t.oModel.getData().aConfigDetails[i.split("/")[2]].bIsLoaded===false){t.updateTree();if(a.params.name!=="navigationTarget"){a.setCurrentSelectionState(a.params,t)}}else{a.setCurrentSelectionState(a.params,t)}})}else{a.setCurrentSelectionState(a.params,t)}}t.getView().byId("idConfigMasterData").setBusy(false)})})}})},setCurrentSelectionState:function(e,t){var a=t.getSPathFromURL(e);if(e.name!=="configurationList"){if(a&&a.objectType){if(e.name==="step"){var i=t.getStepConfigDataBysPath(a.sPath);e.bIsHierarchicalStep=i&&i.bIsHierarchicalStep?true:false}t.updateSubView(e);if(a.sPath){t.setSelectionOnTree(a)}t.updateTitleAndBreadCrumb()}else{t.showNoConfigSelectedText();t.removeSelectionOnTree()}}t.getView().byId("idConfigDetail").setBusy(false)}};return t},true);
//# sourceMappingURL=APFRouter.js.map
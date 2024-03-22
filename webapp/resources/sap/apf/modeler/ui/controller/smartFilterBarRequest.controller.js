/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/modeler/ui/controller/requestOptions"],function(e){"use strict";var t=sap.apf.modeler.ui.controller.requestOptions.extend("sap.apf.modeler.ui.controller.smartFilterBarRequest",{setDisplayText:function(){var e=this;var t=e.getView().getViewData().oTextReader;e.byId("idSourceLabel").setText(t("source"));e.byId("idEntityLabel").setText(t("entity"))},onBeforeRendering:function(){var e=this;e.byId("idSelectPropertiesLabel").setVisible(false);e.byId("idSelectProperties").setVisible(false)},onAfterRendering:function(){var e=this;if(e.byId("idSource").getValue().length===0){e.byId("idSource").focus()}},addOrRemoveMandatoryFieldsAndRequiredFlag:function(e,t){var i=this;i.byId("idEntityLabel").setRequired(e);if(e){i.viewValidator.addFields(["idEntity"])}else{i.viewValidator.removeFields(["idEntity"])}},getSource:function(){var e=this;return e.oParentObject.getService()},getAllEntitiesAsPromise:function(e){var t=this;return t.oConfigurationEditor.getAllEntitySetsExceptParameterEntitySets(e)},getEntity:function(){var e=this;return e.oParentObject.getEntitySet()},clearSource:function(){var e=this;e.oParentObject.setService(undefined);e.clearEntity()},clearEntity:function(){var e=this;e.oParentObject.setEntitySet(undefined)},updateSource:function(e){var t=this;t.oParentObject.setService(e)},updateEntity:function(e){var t=this;t.oParentObject.setEntitySet(e)},getValidationState:function(){var e=this;return e.viewValidator.getValidationState()}});return t},true);
//# sourceMappingURL=smartFilterBarRequest.controller.js.map
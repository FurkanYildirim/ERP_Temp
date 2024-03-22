sap.ui.define(["sap/apf/modeler/ui/controller/stepRequest.controller","sap/apf/modeler/ui/utils/textManipulator","sap/ui/thirdparty/jquery"],function(e,t,jQuery){"use strict";var t=sap.apf.modeler.ui.utils.textManipulator;var r=sap.apf.modeler.ui.utils.optionsValueModelBuilder;var i=sap.apf.modeler.ui.utils.nullObjectChecker;return e.extend("sap.apf.modeler.ui.controller.hierarchicalStepRequest",{onBeforeRendering:function(){var e=this;e.byId("idOptionalPropertyLabel").setVisible(true);e.byId("idOptionalProperty").setVisible(true);e.byId("idOptionalRequestFieldLabel").setVisible(true);e.byId("idOptionalRequestField").setVisible(true);e.byId("idOptionalLabelDisplayOptionType").setVisible(true);e.byId("idOptionalSelectedPropertyLabel").setVisible(true);e.byId("idOptionalSelectedPropertyLabelText").setVisible(true)},setDisplayText:function(){var e=this;var t=e.getView().getViewData().oTextReader;e.byId("idSourceLabel").setText(t("source"));e.byId("idEntityLabel").setText(t("hierarchicalEntity"));e.byId("idOptionalPropertyLabel").setText(t("hierarchicalProperty"));e.byId("idSelectPropertiesLabel").setText(t("nonHierarchicalProperty"));e.byId("idOptionalRequestFieldLabel").setText(t("requiredFilters"))},setOptionalHierarchicalProperty:function(){var e=this;var t=jQuery.Deferred();var a,l,o,d;l=e.byId("idSource").getValue();o=e.byId("idEntity").getSelectedKey();e.byId("idOptionalProperty").setModel(null);e.byId("idOptionalProperty").clearSelection();if(!i.checkIsNotNullOrUndefinedOrBlank(l)){t.resolve();return t.promise()}e.getHierarchicalProperty(l,o).done(function(l){var o=e.getSelectedHierarchicalProperty();if(i.checkIsNotNullOrUndefinedOrBlank(o)){d=e.validateSelectedValues(e,[o],l);l=d.aValues;o=d.aSelectedValues[0]}a=r.convert(l);e.byId("idOptionalProperty").setModel(a);if(!i.checkIsNotNullOrUndefinedOrBlank(o)||l.indexOf(o)===-1){o=l[0];if(i.checkIsNotNullOrUndefinedOrBlank(o)){e.byId("idOptionalProperty").setSelectedKey(o)}t.resolve()}else if(i.checkIsNotNullOrUndefinedOrBlank(o)){e.byId("idOptionalProperty").setSelectedKey(o);t.resolve()}});return t.promise()},setOptionalRequestFieldProperty:function(){var e=this;var t,a,l,o,d,n=[],s,c,u,y;d=[e.getView().getViewData().oTextReader("none")];s=e.oParentObject.getService();c=e.oParentObject.getEntitySet();u=e.getSelectedHierarchicalProperty();t=d;l=d[0];if(s&&c&&u){e.getHierarchyNodeIdAsPromise(s,c,u).done(function(r){o=e.oParentObject.getFilterProperties();if(i.checkIsNotNullOrUndefinedOrBlank(o)){n=e.validateSelectedValues(e,o,[r]);o=n.aValues;l=n.aSelectedValues}if(r){y={key:r,name:u};t=t.concat(y)}else{t=t.concat(o)}})}a=r.convert(t);e.byId("idOptionalRequestField").setModel(a);e.byId("idOptionalRequestField").setSelectedKey(l)},handleChangeForOptionalProperty:function(e){var r=this;var i=r.getView().getViewData().oTextReader;var a=t.removePrefixText(r.byId("idOptionalProperty").getSelectedKey(),i(sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE));r.updateHierarchicalProperty(a);r.clearOptionalRequestFieldProperty();r.setOptionalRequestFieldProperty();r.oConfigurationEditor.setIsUnsaved();r.fireRelevantEvents(e)},addOrRemoveMandatoryFieldsAndRequiredFlag:function(e){var t=this;if(e===false){return}t.byId("idSourceLabel").setRequired(e);t.byId("idEntityLabel").setRequired(e);t.byId("idOptionalPropertyLabel").setRequired(e);t.viewValidator.addFields(["idSource","idEntity","idOptionalProperty"])},getAllEntitiesAsPromise:function(e){var t=this;return t.oConfigurationEditor.getAllHierarchicalEntitySetsOfServiceAsPromise(e)},getHierarchicalProperty:function(e,t){var r=this;return r.oConfigurationEditor.getHierarchicalPropertiesOfEntitySetAsPromise(e,t)},getHierarchyNodeIdAsPromise:function(e,t,r){var i=this;return i.oConfigurationEditor.getHierarchyNodeIdAsPromise(e,t,r)},getSelectedHierarchicalProperty:function(){var e=this;return e.oParentObject.getHierarchyProperty()},getAllEntitySetPropertiesAsPromise:function(e,t){var r=this;return r.oConfigurationEditor.getNonHierarchicalPropertiesOfEntitySet(e,t)},resetEntityAndProperties:function(){var e=this;e.clearEntity();e.byId("idEntity").setModel(null);e.byId("idEntity").setSelectedKey(undefined);e.clearHierarchicalProperty();e.byId("idOptionalProperty").setModel(null);e.byId("idOptionalProperty").setSelectedKey(undefined);e.clearSelectProperties();e.byId("idSelectProperties").setModel(null);e.byId("idSelectProperties").setSelectedKeys([])},clearHierarchicalProperty:function(){var e=this;e.oParentObject.setHierarchyProperty(undefined)},updateHierarchicalProperty:function(e){var t=this;t.clearHierarchicalProperty();t.oParentObject.setHierarchyProperty(e)}})});
//# sourceMappingURL=hierarchicalStepRequest.controller.js.map
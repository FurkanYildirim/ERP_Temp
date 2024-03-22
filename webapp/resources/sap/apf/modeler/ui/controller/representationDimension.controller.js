/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2018 SAP SE. All rights reserved
 */
sap.ui.define(["sap/apf/modeler/ui/utils/constants","sap/apf/core/constants","sap/apf/modeler/ui/controller/propertyType","sap/apf/modeler/ui/utils/displayOptionsValueBuilder","sap/apf/modeler/ui/utils/textManipulator","sap/apf/modeler/ui/utils/propertyTypeOrchestration"],function(e,t,r,a,o,n){"use strict";t=t||sap.apf.core.constants;a=a||sap.apf.modeler.ui.utils.DisplayOptionsValueBuilder;var i=t.representationMetadata;return r.extend("sap.apf.modeler.ui.controller.representationDimension",{_apfName:"representationDimension",setLabelDisplayOptionTypeAsPromise:function(r){var n=this;var i=jQuery.Deferred();var s=[];var p=new a(n.oTextReader,r);var d=t.representationMetadata.labelDisplayOptions;var l=o.removePrefixText(n.byId("idPropertyType").getSelectedKey(),n.oTextReader(e.texts.NOTAVAILABLE));var y=n.oRepresentation.getLabelDisplayOption(l);var f=p.getLabelDisplayOptions();n.oStepPropertyMetadataHandler.getEntityTypeMetadataAsPromise().done(function(e){if((y===d.KEY_AND_TEXT||y===d.TEXT)&&!n.oStepPropertyMetadataHandler.hasTextPropertyOfDimension(e,l)){f=p.getValidatedLabelDisplayOptions();s=o.addPrefixText([y],n.oTextReader);y=s[0]}n.byId("idLabelDisplayOptionType").setModel(f);n.byId("idLabelDisplayOptionType").setSelectedKey(y);i.resolve()});return i.promise()},getAllPropertiesAsPromise:function(){var t=this;var r=t.oStepPropertyMetadataHandler.oStep;var a=jQuery.Deferred();t.oStepPropertyMetadataHandler.getEntityTypeMetadataAsPromise().done(function(i){var s=[];r.getConsumablePropertiesForRepresentation(t.oRepresentation.getId()).done(function(r){var p=r.consumable;p.forEach(function(r){var a;if(t.oStepPropertyMetadataHandler.getPropertyMetadata(i,r)){a=t.oStepPropertyMetadataHandler.getPropertyMetadata(i,r)["aggregation-role"];if(a===e.aggregationRoles.DIMENSION){s.push(r)}}});var d=t.getSelectedProperty();a.resolve(n.getPropertyListAndSelectedKey(s,d,t,r,o.addPrefixText))})});return a.promise()},getPropertyTextLabelKey:function(e){var t=this;return t.oRepresentation.getDimensionTextLabelKey(e)},removeProperties:function(){var e=this;e.getView().getViewData().oRepresentationHandler.getActualDimensions().forEach(function(t){e.oRepresentation.removeDimension(t.sProperty)})},updatePropertiesInConfiguration:function(e){var t=this;t.removeProperties();e.forEach(function(e){t.oRepresentation.addDimension(e.sProperty);t.oRepresentation.setDimensionKind(e.sProperty,e.sKind);t.oRepresentation.setLabelDisplayOption(e.sProperty,e.sLabelDisplayOption);t.oRepresentation.setDimensionTextLabelKey(e.sProperty,e.sTextLabelKey)})},createNewPropertyInfoAsPromise:function(e){var t=jQuery.Deferred();var r=this,a={};r.oStepPropertyMetadataHandler.getEntityTypeMetadataAsPromise().done(function(o){var n=r.oStepPropertyMetadataHandler.hasTextPropertyOfDimension(o,e);a.sProperty=e;a.sKind=r.getView().getViewData().oPropertyTypeData.sContext;a.sLabelDisplayOption=n?i.labelDisplayOptions.KEY_AND_TEXT:i.labelDisplayOptions.KEY;a.sTextLabelKey=undefined;t.resolve(a)});return t.promise()},setPropertyTextLabelKey:function(e,t){var r=this;r.oRepresentation.setDimensionTextLabelKey(e,t)},setNextPropertyInParentObject:function(){var e=this;e.updateOfConfigurationObjectAsPromise().then(function(){e.setDetailData()})},enableDisableLabelDisplayOptionTypeAsPromise:function(){var t,r=this;var a=jQuery.Deferred();var n=r.byId("idLabelDisplayOptionType");var i=o.removePrefixText(r.byId("idPropertyType").getSelectedKey(),r.oTextReader(e.texts.NOTAVAILABLE));r.oStepPropertyMetadataHandler.getEntityTypeMetadataAsPromise().done(function(e){var o=r.oStepPropertyMetadataHandler.hasTextPropertyOfDimension(e,i);if(i===r.oTextReader("none")){n.setEnabled(false);a.resolve()}else{n.setEnabled(true);for(t=0;t<n.getItems().length;t++){n.getItems()[t].setEnabled(true);if(t>0&&!o){n.getItems()[t].setEnabled(false)}}a.resolve()}});return a.promise()},changeLabelDisplayOption:function(t){var r=this;var a=o.removePrefixText(r.byId("idPropertyType").getSelectedKey(),r.oTextReader(e.texts.NOTAVAILABLE));r.oRepresentation.setLabelDisplayOption(a,t)},removePropertyFromParentObject:function(){var t=this;t.oRepresentation.removeDimension(o.removePrefixText(t.byId("idPropertyType").getSelectedKey(),t.oTextReader(e.texts.NOTAVAILABLE)))},addPropertyAsPromise:function(){var t=jQuery.Deferred();var r=this,a,o=[];var n=r.oStepPropertyMetadataHandler.oStep;r.oStepPropertyMetadataHandler.getEntityTypeMetadataAsPromise().done(function(i){n.getConsumablePropertiesForRepresentation(r.oRepresentation.getId()).done(function(n){n.consumable.forEach(function(t){if(r.oStepPropertyMetadataHandler.getPropertyMetadata(i,t)){a=r.oStepPropertyMetadataHandler.getPropertyMetadata(i,t)["aggregation-role"];if(a===e.aggregationRoles.DIMENSION){o.push(t)}}});r.getView().fireEvent(e.events.ADDPROPERTY,{sProperty:o[0],sContext:r.getView().getViewData().oPropertyTypeData.sContext,bMandatory:r.getView().getViewData().oPropertyTypeData.bMandatory});r.oConfigurationEditor.setIsUnsaved();t.resolve()})});return t.promise()}})});
//# sourceMappingURL=representationDimension.controller.js.map
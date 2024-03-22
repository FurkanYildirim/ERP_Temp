/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/apf/modeler/ui/controller/sortPropertyType","sap/apf/modeler/ui/utils/textManipulator","sap/ui/thirdparty/jquery"],function(e,t,jQuery){"use strict";var r=sap.apf.modeler.ui.utils.textManipulator;var o=sap.apf.modeler.ui.controller.sortPropertyType.extend("sap.apf.modeler.ui.controller.representationSortPropertyType",{onBeforeRendering:function(){var e=this;e.byId("idGridSortLabel").setSpan("L2 M2 S2");e.byId("idGridSortProperty").setSpan("L4 M4 S4");e.byId("idGridSortDirectionLabel").setSpan("L2 M2 S2");e.byId("idGridSortDirection").setSpan("L3 M3 S2");e.byId("idGridIconLayout").setSpan("L1 M1 S1")},disableView:function(){var e=this;if(e.oStepPropertyMetadataHandler.oStep.getTopN()){e.byId("idSortProperty").setEnabled(false);e.byId("idSortDirection").setEnabled(false);e.byId("idAddPropertyIcon").setVisible(false);e.byId("idRemovePropertyIcon").setVisible(false)}},getAllPropertiesAsPromise:function(){var e=this,t,o,i;var a=jQuery.Deferred();e.oStepPropertyMetadataHandler.oStep.getConsumableSortPropertiesForRepresentation(e.oParentObject.getId()).done(function(n){t=n.consumable;o=e.getSelectedSortProperty();if(o!==e.oTextReader("none")&&o!==undefined){i=t.indexOf(o)!==-1?t:t.concat(o);t=n.available.indexOf(o)!==-1?i:t.concat(r.addPrefixText([o],e.oTextReader));o=n.available.indexOf(o)!==-1?o:r.addPrefixText([o],e.oTextReader)[0]}t.splice(0,0,e.oTextReader("none"));a.resolve({aAllProperties:t,sSelectedKey:o})});return a.promise()},updateOfConfigurationObjectOfSubclass:function(e){var t=this;t.oParentObject.removeAllOrderbySpecs();e.forEach(function(e){t.oParentObject.addOrderbySpec(e.property,e.ascending)})},getOrderBy:function(){var e=this;return e.oParentObject.getOrderbySpecifications()},setNextPropertyInParentObject:function(){var e=this;e.updateOfConfigurationObject();e.byId("idSortDirection").setSelectedKey("true")},removePropertyFromParentObject:function(){var e=this;e.oParentObject.removeOrderbySpec(r.removePrefixText(e.byId("idSortProperty").getSelectedKey(),e.oTextReader(sap.apf.modeler.ui.utils.CONSTANTS.texts.NOTAVAILABLE)))},addPropertyAsPromise:function(){var e=this;var t=jQuery.Deferred();var r=sap.apf.modeler.ui.utils.CONSTANTS.events;e.oStepPropertyMetadataHandler.oStep.getConsumableSortPropertiesForRepresentation(e.oParentObject.getId()).done(function(o){e.getView().fireEvent(r.ADDPROPERTY,{oSourceView:e.getView(),sProperty:o.consumable[0],sContext:e.getView().getViewData().oPropertyTypeData.sContext});e.oConfigurationEditor.setIsUnsaved();t.resolve()});return t.promise()}});return o},true);
//# sourceMappingURL=representationSortPropertyType.controller.js.map
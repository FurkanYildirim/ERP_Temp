sap.ui.define(["sap/apf/modeler/ui/utils/constants","sap/apf/modeler/ui/utils/optionsValueModelBuilder","sap/apf/modeler/ui/utils/nullObjectChecker","sap/apf/modeler/ui/utils/textPoolHelper","sap/apf/modeler/ui/utils/textManipulator","sap/apf/utils/utils","sap/ui/Device","sap/ui/core/Item","sap/ui/core/mvc/Controller","sap/ui/thirdparty/jquery"],function(e,t,r,o,i,a,n,s,d,jQuery){"use strict";var p=sap.apf.modeler.ui.utils.textManipulator;var l=e.events;var y=sap.apf.modeler.ui.utils.TranslationFormatMap.REPRESENTATION_LABEL;function u(e){var t=e.oRepresentation.getRepresentationType();var r=e.getView().getViewData().oPropertyTypeData.sContext;var o=e.getView().getViewData().oRepresentationTypeHandler.getLabelsForChartType(e.oTextReader,t,r);e.byId("idPropertyTypeLabel").setText(o);e.byId("idPropertyTypeLabel").setTooltip(o)}function f(e){if(n.browser.msie&&n.browser.version>=11){e.byId("idAriaPropertyForBasicDataGroup").setText(e.oTextReader("basicData"))}e.byId("idAriaPropertyForAdd").setText(e.oTextReader("ariaTextForAddIcon"));e.byId("idAriaPropertyForDelete").setText(e.oTextReader("ariaTextForDeleteIcon"))}function g(e){var r;var o=jQuery.Deferred();var i=e.byId("idPropertyType");e.getAllPropertiesAsPromise().then(function(e){r=t.convert(e.aAllProperties);i.setModel(r);i.setSelectedKey(e.sSelectedKey);o.resolve()});return o.promise()}function c(t){var r=p.removePrefixText(t.byId("idPropertyType").getSelectedKey(),t.oTextReader(e.texts.NOTAVAILABLE));var o=t.getPropertyTextLabelKey(r)?t.oTextReader("label"):t.oTextReader("label")+" ("+t.oTextReader("default")+")";t.byId("idPropertyLabel").setText(o);t.byId("idPropertyLabel").setTooltip(o)}function P(t){var o;var i=p.removePrefixText(t.byId("idPropertyType").getSelectedKey(),t.oTextReader(e.texts.NOTAVAILABLE));var a=t.getPropertyTextLabelKey(i);if(r.checkIsNotUndefined(a)){o=t.getView().getViewData().oConfigurationHandler.getTextPool().get(a).TextElementDescription;t.byId("idPropertyLabelText").setValue(o)}else{t.oStepPropertyMetadataHandler.getEntityTypeMetadataAsPromise().then(function(e){var r=t.oStepPropertyMetadataHandler.getDefaultLabel(e,i);t.byId("idPropertyLabelText").setValue(r)})}}function v(e){e.byId("idAddPropertyIcon").setTooltip(e.oTextReader("addButton"));e.byId("idRemovePropertyIcon").setTooltip(e.oTextReader("deleteButton"))}function T(e){var t=e.getView().getViewData().sPropertyType;var r=e.getView().getViewData().oPropertyTypeData.sContext;var o=e.oRepresentationTypeHandler.isAdditionToBeEnabled(e.oRepresentation.getRepresentationType(),t,r);var i=o;var a=e.getView().getViewData().oPropertyTypeState;var n=a.indexOfPropertyTypeViewId(e.getView().getId());if(n===0){i=false}else if(n>0){var s=a.getViewAt(n-1);var d=s.getViewData().oPropertyTypeData.sContext;if(r!==d){i=false}}e.byId("idAddPropertyIcon").setVisible(o);e.byId("idRemovePropertyIcon").setVisible(i);if(n>0){s.oController.byId("idAddPropertyIcon").setVisible(false)}}function I(e){var t=e.getView().getViewData().oPropertyTypeState;var r=t.indexOfPropertyTypeViewId(e.getView().getId());if(r>0){var o=t.aProperties.length-1;var i=t.getViewAt(r-1);var a=t.getViewAt(r);var n=e.oConfigurationEditor.isSaved()}if(r>0&&r==o&&n==false){i.oController.byId("idAddPropertyIcon").setVisible(false);a.oController.byId("idAddPropertyIcon").setVisible(true);a.oController.byId("idRemovePropertyIcon").setVisible(true)}}function b(e,t){var r=e.getView().getViewData().oPropertyTypeState;var o=r.aProperties.length;var i=r.getViewAt(t-1);var a=e.oConfigurationEditor.isSaved();if(t>1&&t==o&&a==false){i.oController.byId("idAddPropertyIcon").setVisible(true);i.oController.byId("idRemovePropertyIcon").setVisible(true)}if(t===1&&t==o&&a==false){i.oController.byId("idAddPropertyIcon").setVisible(true)}}function V(e){e.byId("idAddPropertyIcon").attachEvent(l.SETFOCUSONADDICON,e.setFocusOnAddRemoveIcons.bind(e))}var w=d.extend("sap.apf.modeler.ui.controller.propertyType",{_apfName:"propertyType",oConfigurationEditor:{},oRepresentation:{},oStepPropertyMetadataHandler:{},oRepresentationTypeHandler:{},oTextReader:{},oTextPool:{},initPromise:null,onInit:function(){var e=this;e.initPromise=new jQuery.Deferred;e.oConfigurationEditor=e.getView().getViewData().oConfigurationEditor;e.oRepresentation=e.getView().getViewData().oParentObject;e.oStepPropertyMetadataHandler=e.getView().getViewData().oStepPropertyMetadataHandler;e.oRepresentationTypeHandler=e.getView().getViewData().oRepresentationTypeHandler;e.oTextReader=e.getView().getViewData().oCoreApi.getText;e.oTextPool=e.getView().getViewData().oTextPool;if(e.getView().getViewData().oPropertyTypeData.bMandatory){e.getView().getViewData().oViewValidator.addField(e.byId("idPropertyType").getId());e.byId("idPropertyTypeLabel").setRequired(true)}g(e).then(function(){e.setDetailData().then(function(){e.initPromise.resolve()});T(e)})},onAfterRendering:function(){var e=this;e.initPromise.then(function(){e.enableDisableLabelDisplayOptionTypeAsPromise().then(function(){e.byId("idAddPropertyIcon").fireEvent(l.SETFOCUSONADDICON)})})},setDetailData:function(){var e=jQuery.Deferred();var r=this;r.setLabelDisplayOptionTypeAsPromise(t).then(function(){if(!r.byId("idPropertyType")){e.resolve();return}P(r);f(r);c(r);u(r);v(r);e.resolve()});return e.promise()},handleChangeForPropertyTypeAsPromise:function(t){var r=this;var o=jQuery.Deferred();var i=p.removePrefixText(r.byId("idPropertyType").getSelectedKey(),r.oTextReader(e.texts.NOTAVAILABLE));var a=r.getView().getViewData().oPropertyOrchestration;var n=r.getView().getId();var s;var d=null;if(a){s=a.isSwapCase(n,i);d=a.getPropertyTypeRowByPropertyName(i);a.updateAllSelectControlsForPropertyType(n,i).then(function(){var e;r.updateRepresentationAndView().then(function(){if(s){e=d.oView.getController();e.updateRepresentationAndView().then(function(){r.oConfigurationEditor.setIsUnsaved();o.resolve()})}else{r.oConfigurationEditor.setIsUnsaved();o.resolve()}})})}else{r.forceFailSinceOrchestrationIsMissing();o.resolve()}return o.promise()},updateRepresentationAndView:function(){var e=this;return new Promise(function(t){e.updateOfConfigurationObjectAsPromise().then(function(){e.setDetailData();e.enableDisableLabelDisplayOptionTypeAsPromise().then(function(){t()})})})},handleChangeForLabelDisplayOptionType:function(){var e=this;var t=e.byId("idLabelDisplayOptionType").getSelectedKey();e.changeLabelDisplayOption(t);e.oConfigurationEditor.setIsUnsaved()},handleChangeForLabelText:function(){var t=this,r;var o=t.byId("idPropertyLabelText").getValue();var i=p.removePrefixText(t.byId("idPropertyType").getSelectedKey(),t.oTextReader(e.texts.NOTAVAILABLE));if(o.trim().length===0){r=undefined;t.setPropertyTextLabelKey(i,r);c(t);P(t);t.oConfigurationEditor.setIsUnsaved()}else{t.getView().getViewData().oConfigurationHandler.getTextPool().setTextAsPromise(o,y).then(function(e){t.setPropertyTextLabelKey(i,e);c(t);P(t);t.oConfigurationEditor.setIsUnsaved()})}},setFocusOnAddRemoveIcons:function(){var e=this;e.byId("idAddPropertyIcon").focus()},handlePressOfAddPropertyIcon:function(){var t=this;var r=t.getView();var o=r.getViewData().oPropertyOrchestration;var i=t.byId("idPropertyType").getItems();var a=t.byId("idPropertyType").getSelectedKey();var n=t.oTextReader("none");if(this._shallAddPropertyBeHandled(i,a,n,o)){V(t);t.getView().fireEvent(e.events.ADDPROPERTY,{oSourceView:r});t.oConfigurationEditor.setIsUnsaved();I(t)}},handlePressOfRemovePropertyIcon:function(){var e=this;var t=e.getView().getViewData();var r=t.oPropertyTypeState;var o=r.indexOfPropertyTypeViewId(e.getView().getId());if(o>0){var i=r.getViewAt(o-1);V(i.getController())}var a=t.oPropertyOrchestration;a.removePropertyTypeReference(e.getView().getId());return e.updateRepresentationAndView().then(function(){a.updateAllSelectControlsForPropertyType();t.oPropertyTypeHandlerBackLink.handlePressOfRemove({oSourceView:e.getView()});e.oConfigurationEditor.setIsUnsaved();if(o!==0){b(e,o)}e.getView().destroy()})},updateOfConfigurationObjectAsPromise:function(){var e=this;return new Promise(function(t){var r=[];if(e.getView().getViewData().oPropertyOrchestration){r=e.getView().getViewData().oPropertyOrchestration.getPropertyInformationList();e.updatePropertiesInConfiguration(r)}else{e.forceFailSinceOrchestrationIsMissing()}t()})},handleSuggestions:function(e){var t=this;var r=new sap.apf.modeler.ui.utils.SuggestionTextHandler(t.oTextPool);r.manageSuggestionTexts(e,y)},getSelectedProperty:function(){var e=this;var t=e.getView().getViewData().oPropertyTypeState;var r=t.getPropertyValueState();var o=t.indexOfPropertyTypeViewId(e.getView().getId());return r[o]},removeAllItemsFromDropDownList:function(){var e=this;var t=e.byId("idPropertyType");t.getItems().forEach(function(e){t.removeItem(e)})},setItemsOfDropDownList:function(t,r,o,i,a){function n(e,t){return e.indexOf(t)!==-1}var d=this;var l=d.byId("idPropertyType");var y=[];var u=o===d.oTextReader("none");if(!i&&a===e.aggregationRoles.DIMENSION){l.addItem(new s({key:d.oTextReader("none"),text:d.oTextReader("none")}))}if(a===e.aggregationRoles.MEASURE){y=JSON.parse(JSON.stringify(r))}else{y=JSON.parse(JSON.stringify(t))}if(!n(y,o)&&!u){y.unshift(o)}y.forEach(function(e){var t=e;if(!n(r,e)&&!u&&e!==""){e=p.addPrefixText([e],d.oTextReader)[0]}var i=new s({key:e,text:e});l.addItem(i);if(t===o){o=e}});l.setSelectedKey(o)},updatePropertiesInConfiguration:function(e){},createNewPropertyInfoAsPromise:function(e){return a.createPromise()},setPropertyInParentObject:function(){},setLabelDisplayOptionTypeAsPromise:function(e){return a.createPromise()},getAllPropertiesAsPromise:function(){return a.createPromise()},getPropertyTextLabelKey:function(e){},setPropertyTextLabelKey:function(e,t){},enableDisableLabelDisplayOptionTypeAsPromise:function(){return a.createPromise()},removePropertyFromParentObject:function(){},addPropertyAsPromise:function(){return a.createPromise()},changeLabelDisplayOption:function(e){},_shallAddPropertyBeHandled:function(t,r,o,i){var a=t.filter(function(e){return e.mProperties.key!==o});if(i&&i.getAggregationRole()===e.aggregationRoles.MEASURE){var n=i._getPropertyTypeRows().length;return n<a.length}if(t.length===0||!r){return false}var s=a.filter(function(e){return e.mProperties.key!==r});var d=r===o;if(s.length<2&&d){return false}else if(s.length<1&&!d){return false}return true}});return w});
//# sourceMappingURL=propertyType.js.map
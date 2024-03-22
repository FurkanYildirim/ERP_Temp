/*!
* SAP APF Analysis Path Framework
*
* (c) Copyright 2012-2014 SAP AG. All rights reserved
*/
sap.ui.define(["sap/apf/modeler/ui/utils/constants","sap/apf/modeler/ui/utils/propertyTypeOrchestration","sap/ui/core/mvc/ViewType"],function(t,e,r){"use strict";var o=function(t,e,r,o){this.oParentView=t;this.oStepPropertyMetadataHandler=r;this.oParentObject=e;this.oTextReader=o};function a(o,a,i){var n;var p=new e.PropertyTypeOrchestration;var s={oConfigurationEditor:o.oParentView.getViewData().oConfigurationEditor,oParentObject:o.oParentObject,oCoreApi:o.oParentView.getViewData().oCoreApi,oConfigurationHandler:o.oParentView.getViewData().oConfigurationHandler,oStepPropertyMetadataHandler:o.oStepPropertyMetadataHandler,sPropertyType:a};var y={oViewDataForPropertyType:s,aPropertiesToBeCreated:i,oPropertyOrchestration:p};n=new sap.ui.view({viewName:"sap.apf.modeler.ui.view.propertyTypeHandler",type:r.XML,id:o.oParentView.getController().createId("id"+a),viewData:y});o.oParentView.getController().byId("idSortLayout").insertItem(n);o.oParentView.attachEvent(t.events.step.SETTOPNPROPERTIES,n.getController().handleSettingTopNProperties.bind(n.getController()))}function i(t){var e=[];t.forEach(function(t){e.push({sProperty:t.property,sContext:t.ascending?"true":"false"})});return e}o.prototype.instantiateRepresentationSortData=function(){var e=i(this.oParentObject.getOrderbySpecifications());if(e.length===0){e=[{sProperty:this.oTextReader("none"),sContext:"true"}]}a(this,t.propertyTypes.REPRESENTATIONSORT,e)};o.prototype.instantiateStepSortData=function(){var e;this.destroySortData();if(this.oParentObject.getTopN()&&this.oParentObject.getTopN().orderby.length!==0){e=i(this.oParentObject.getTopN().orderby)}else{e=[{sProperty:this.oStepPropertyMetadataHandler.getProperties()[0],sContext:"true"}]}a(this,t.propertyTypes.STEPSORT,e)};o.prototype.destroySortData=function(){this.oParentView.getController().byId("idSortLayout").destroyItems()};return o},true);
//# sourceMappingURL=sortDataHandler.js.map
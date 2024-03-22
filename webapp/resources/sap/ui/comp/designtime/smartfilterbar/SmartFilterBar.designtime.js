/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define([],function(){"use strict";return{actions:{compVariant:function(e){if(e.isA("sap.ui.comp.smartfilterbar.SmartFilterBar")&&e.getVariantManagement()&&e.getVariantManagement().isA("sap.ui.comp.smartvariants.SmartVariantManagement")&&e.getVariantManagement().isVariantAdaptationEnabled()){return{name:"FILTER_BAR_ADAPT_FILTERS_DIALOG",changeType:"variantContent",handler:function(e,a){return new Promise(function(t){var i=function(e){t(e)};e.showAdaptFilterDialogForKeyUser(a.styleClass,i)})}}}}},annotations:{filterRestrictions:{namespace:"Org.OData.Capabilities.V1",annotation:"FilterRestrictions",target:["EntitySet"],allowList:{properties:["NonFilterableProperties","RequiredProperties"]},defaultValue:true,appliesTo:["filterItem/#/value"],group:["Behavior"],since:"1.28.1"},fieldGroup:{namespace:"com.sap.vocabularies.UI.v1",annotation:"FieldGroup",target:["EntityType"],defaultValue:null,appliesTo:["filterGroupItem"],group:["Behavior"],since:"1.28.1"},filterFacet:{namespace:"com.sap.vocabularies.UI.v1",annotation:"FilterFacets",target:["EntityType"],defaultValue:null,appliesTo:["filterGroupItem"],group:["Behavior"],since:"1.48"},text:{namespace:"com.sap.vocabularies.Common.v1",annotation:"Text",target:["Property"],defaultValue:null,appliesTo:["text"],group:["Appearance","Behavior"],since:"1.32.1"},textArrangement:{namespace:"com.sap.vocabularies.UI.v1",annotation:"TextArrangement",target:["EntityType","com.sap.vocabularies.Common.v1.Text"],defaultValue:null,appliesTo:["text"],group:["Appearance","Behavior"],since:"1.32.1"},valueList:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueList",target:["Property","Parameter"],allowList:{properties:["Label","CollectionPath","Parameters","SearchSupported","FetchValues"]},defaultValue:null,appliesTo:["field/#/fieldHelp"],group:["Behavior"],since:"1.28.1"},valueListWithFixedValues:{namespace:"com.sap.vocabularies.Common.v1",annotation:"ValueListWithFixedValues",target:["Property","Parameter"],defaultValue:null,appliesTo:["field/#/fieldHelp"],group:["Behavior"],since:"1.48.1"},isConfigurationDeprecationCode:{namespace:"com.sap.vocabularies.CodeList.v1",annotation:"IsConfigurationDeprecationCode",target:["Property"],defaultValue:true,appliesTo:["field"],group:["Behavior"],since:"1.77"},presentationVariant:{namespace:"com.sap.vocabularies.UI.v1",annotation:"PresentationVariant",target:["EntityType"],defaultValue:null,appliesTo:["field"],group:["Behavior"],since:"1.98"},filterLabelOnProperty:{namespace:"com.sap.vocabularies.Common.v1",annotation:"Label",target:["Property","PropertyPath"],defaultValue:null,appliesTo:["filterItem/label"],group:["Behavior"],since:"1.28.1"},filterLabelOnLineItem:{namespace:"com.sap.vocabularies.UI.v1",annotation:"DataField",target:["Property","Parameter"],allowList:{properties:["Label"]},appliesTo:["filterItem/label"],group:["Behavior"],since:"1.28.1"},filterExpression:{namespace:"com.sap.vocabularies.Common.v1",annotation:"FilterExpressionType",target:["EntitySet"],allowList:{values:["MultiValue","SingleValue","SingleInterval"]},defaultValue:null,appliesTo:["filterItem/#/input"],group:["Behavior"],since:"1.28.1"},FilterRestrictions:{namespace:"Org.OData.Capabilities.V1",annotation:"FilterRestrictions",target:["EntitySet"],allowList:{values:["FilterExpressionRestrictions"]},defaultValue:null,appliesTo:["filterItem/#/input"],group:["Behavior"],since:"1.64"},selectionFields:{namespace:"com.sap.vocabularies.UI.v1",annotation:"SelectionFields",target:["EntityType"],defaultValue:null,appliesTo:["filterItem/#/value"],group:["Behavior"],since:"1.40.1"},filterVisible:{namespace:"com.sap.vocabularies.Common.v1",annotation:"FieldControlType",target:["Property"],allowList:{values:["Hidden","Inapplicable"]},defaultValue:false,appliesTo:["property/#/visible"],group:["Behavior"],since:"1.32.1"},hiddenFilter:{namespace:"com.sap.vocabularies.UI.v1",annotation:"HiddenFilter",target:["Property"],appliesTo:["filterItem/hiddenFilter"],group:["Behavior"],since:"1.44.0"},hidden:{namespace:"com.sap.vocabularies.UI.v1",annotation:"Hidden",target:["Property"],appliesTo:["filterItem/hidden","property/visible"],group:["Behavior"],since:"1.54"},selectionBVariant:{namespace:"com.sap.vocabularies.UI.v1",annotation:"SelectionVariant",target:["EntityType"],appliesTo:["SmartVariantManagement"],group:["Behavior"],since:"1.48.0"},FilterDefaultValue:{namespace:"com.sap.vocabularies.Common.v1",annotation:"FilterDefaultValue",target:["Property"],appliesTo:["filterItem"],group:["Behavior"],since:"1.48.0"},fiscalYear:{namespace:"com.sap.vocabularies.Common.v1",annotation:"IsFiscalYear",target:["Property"],defaultValue:true,appliesTo:["fieldItem/#/value"],group:["Appearance","Behavior"],since:"1.74"},fiscalPeriod:{namespace:"com.sap.vocabularies.Common.v1",annotation:"IsFiscalPeriod",target:["Property"],defaultValue:true,appliesTo:["fieldItem/#/value"],group:["Appearance","Behavior"],since:"1.74"},fiscalYearPeriod:{namespace:"com.sap.vocabularies.Common.v1",annotation:"IsFiscalYearPeriod",target:["Property"],defaultValue:true,appliesTo:["fieldItem/#/value"],group:["Appearance","Behavior"],since:"1.74"},fiscalQuarter:{namespace:"com.sap.vocabularies.Common.v1",annotation:"IsFiscalQuarter",target:["Property"],defaultValue:true,appliesTo:["fieldItem/#/value"],group:["Appearance","Behavior"],since:"1.74"},fiscalYearQuarter:{namespace:"com.sap.vocabularies.Common.v1",annotation:"IsFiscalYearQuarter",target:["Property"],defaultValue:true,appliesTo:["fieldItem/#/value"],group:["Appearance","Behavior"],since:"1.74"},fiscalWeek:{namespace:"com.sap.vocabularies.Common.v1",annotation:"IsFiscalWeek",target:["Property"],defaultValue:true,appliesTo:["fieldItem/#/value"],group:["Appearance","Behavior"],since:"1.74"},fiscalYearWeek:{namespace:"com.sap.vocabularies.Common.v1",annotation:"IsFiscalYearWeek",target:["Property"],defaultValue:true,appliesTo:["fieldItem/#/value"],group:["Appearance","Behavior"],since:"1.74"},dayOfFiscalYear:{namespace:"com.sap.vocabularies.Common.v1",annotation:"IsDayOfFiscalYear",target:["Property"],defaultValue:true,appliesTo:["fieldItem/#/value"],group:["Appearance","Behavior"],since:"1.74"}},properties:{entitySet:{ignore:true},entityType:{ignore:true},resourceUri:{ignore:true},basicSearchFieldName:{ignore:true},enableBasicSearch:{ignore:true},considerAnalyticalParameters:{ignore:true},liveMode:{ignore:false},showMessages:{ignore:false},useDateRangeType:{ignore:false},suppressSelection:{ignore:false},considerSelectionVariants:{ignore:true},defaultSelectionVariantName:{ignore:true},useProvidedNavigationProperties:{ignore:true},navigationProperties:{ignore:true}},customData:{defaultDropDownDisplayBehaviour:{type:"sap.ui.comp.smartfilterbar.DisplayBehaviour",defaultValue:"",since:"1.28.1"},defaultTokenDisplayBehaviour:{type:"sap.ui.comp.smartfilterbar.DisplayBehaviour",defaultValue:"",since:"1.28.1"},dateFormatSettings:{type:"string",defaultValue:"{'UTC':'true'}",group:["Appearance"],since:"1.28.1"},useContainsAsDefaultFilter:{type:"boolean",defaultValue:false,since:"1.28.1"},executeStandardVariantOnSelect:{type:"boolean",defaultValue:false,since:"1.28.1"}},actionsEffectiveAfter:"RECREATE",aggregations:{content:{propagateMetadata:function(e){if(e.isA("sap.ui.comp.smartvariants.SmartVariantManagement")){return null}return{actions:"not-adaptable"}}},controlConfiguration:{specialIndexHandling:true},filterGroupItems:{ignore:true}}}});
//# sourceMappingURL=SmartFilterBar.designtime.js.map
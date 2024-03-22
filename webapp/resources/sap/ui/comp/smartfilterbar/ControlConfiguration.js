/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/comp/library","sap/ui/core/Element"],function(e,t){"use strict";var a=t.extend("sap.ui.comp.smartfilterbar.ControlConfiguration",{metadata:{library:"sap.ui.comp",properties:{key:{type:"string",group:"Misc",defaultValue:null},groupId:{type:"string",group:"Misc",defaultValue:null},label:{type:"string",group:"Misc",defaultValue:null},visible:{type:"boolean",group:"Misc",defaultValue:true},hasValueHelpDialog:{type:"boolean",group:"Misc",defaultValue:true},controlType:{type:"sap.ui.comp.smartfilterbar.ControlType",group:"Misc",defaultValue:"auto"},filterType:{type:"sap.ui.comp.smartfilterbar.FilterType",group:"Misc",defaultValue:"auto"},index:{type:"int",group:"Misc",defaultValue:-1},hasTypeAhead:{type:"boolean",group:"Misc",defaultValue:true},mandatory:{type:"sap.ui.comp.smartfilterbar.MandatoryType",group:"Misc",defaultValue:"auto"},width:{type:"string",group:"Misc",defaultValue:null},visibleInAdvancedArea:{type:"boolean",group:"Misc",defaultValue:false},preventInitialDataFetchInValueHelpDialog:{type:"boolean",group:"Misc",defaultValue:false},displayBehaviour:{type:"sap.ui.comp.smartfilterbar.DisplayBehaviour",group:"Misc",defaultValue:"auto"},conditionType:{type:"any",group:"Misc",defaultValue:null},historyEnabled:{type:"boolean",group:"Misc",defaultValue:true},disableNewDateRangeControl:{type:"boolean",group:"Misc",defaultValue:false},conditionPanelDefaultOperation:{type:"sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation",group:"Misc",defaultValue:null},timezone:{type:"string",group:"Misc",defaultValue:null}},aggregations:{defaultFilterValues:{type:"sap.ui.comp.smartfilterbar.SelectOption",multiple:true,singularName:"defaultFilterValue"},customControl:{type:"sap.ui.core.Control",multiple:false}},events:{change:{parameters:{propertyName:{type:"string"}}}}}});a.prototype.setVisible=function(e){this.setProperty("visible",e);this.fireChange({propertyName:"visible"});return this};a.prototype.setLabel=function(e){this.setProperty("label",e);this.fireChange({propertyName:"label"});return this};a.prototype.setVisibleInAdvancedArea=function(e){this.setProperty("visibleInAdvancedArea",e);this.fireChange({propertyName:"visibleInAdvancedArea"});return this};a.FILTERTYPE=e.smartfilterbar.FilterType;a.CONTROLTYPE=e.smartfilterbar.ControlType;a.MANDATORY=e.smartfilterbar.MandatoryType;a.DISPLAYBEHAVIOUR=e.smartfilterbar.DisplayBehaviour;return a});
//# sourceMappingURL=ControlConfiguration.js.map
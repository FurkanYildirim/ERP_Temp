/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2018 SAP SE. All rights reserved
*/
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/odata/ODataUtils","sap/ui/model/odata/v2/ODataModel","sap/ui/model/odata/CountMode"],function(t,e,a,i){"use strict";return t.extend("sap.apf.ui.reuse.controller.smartFilterBar",{onInit:function(){var t=this;var r=t.getView().getViewData().oSmartFilterBarConfiguration.service;var n=t.getView().getViewData().oCoreApi.getAnnotationsForService(r);var o={annotationURI:n,json:true};if(n&&n.length>0){o.loadAnnotationsJoined=true}var s=t.getView().getViewData().oCoreApi.getStartParameterFacade().getSapSystem();if(s){r=e.setOrigin(r,{force:true,alias:s})}var g=new a(r,o);g.getMetaModel().loaded().then(function(){t.getView().getViewData().oCoreApi.getMetadata(r).done(function(e){if(e.getAllEntitySetsExceptParameterEntitySets().indexOf(t.getView().getViewData().oSmartFilterBarConfiguration.entitySet)<0){t.getView().getViewData().oCoreApi.putMessage(t.getView().getViewData().oCoreApi.createMessageObject({code:"5053",aParameters:[t.getView().getViewData().oSmartFilterBarConfiguration.entitySet,r]}))}g.setDefaultCountMode(i.None);t.byId("idAPFSmartFilterBar").setModel(g)})});g.attachMetadataFailed(function(){t.getView().getViewData().oCoreApi.putMessage(t.getView().getViewData().oCoreApi.createMessageObject({code:"5052",aParameters:[r]}))})},afterInitialization:function(){this.handleSplitterSize();this.setFilterData();this.validateFilters();this.registerSFBInstanceWithCore()},registerSFBInstanceWithCore:function(){var t=this;t.getView().getViewData().oCoreApi.registerSmartFilterBarInstance(t.byId("idAPFSmartFilterBar"))},handlePressOfGoButton:function(){var t=this;var e=this.byId("idAPFSmartFilterBar");if(!e._apfOpenPath&&t.getView().getViewData().oCoreApi.getActiveStep()){t.getView().getViewData().oUiApi.selectionChanged(true)}delete e._apfOpenPath},setFilterData:function(){var t=this;var e=this.byId("idAPFSmartFilterBar");var a=t.getView().getViewData().oCoreApi.getStartParameterFacade().getAnalyticalConfigurationId();var i=t.getView().getViewData().oCoreApi.getStartParameterFacade().getXappStateId();var r=e.getUiState();var n=e.mProperties;e.setUiState(r,n);if(a!==undefined||i!==null&&i!==undefined){var o=t.getView().getViewData().oCoreApi;var s=o.getComponent();if(sap.ushell.Container!==undefined){var g=sap.ushell.Container.getService("CrossApplicationNavigation");var d=g.getStartupAppState(s);d.done(function(t){var e=t.getData();if(e){e=JSON.parse(JSON.stringify(e));var a=e.selectionVariant;var i=new sap.ui.comp.state.UIState({selectionVariant:a});var r=this.byId("idAPFSmartFilterBar");r.setUiState(i,{replace:true,strictMode:false});var n=r.getVariantManagement().STANDARDVARIANTKEY;r.getVariantManagement().setCurrentVariantId(n)}}.bind(this))}var l=e.getVariantManagement().STANDARDVARIANTKEY;e.getVariantManagement().setCurrentVariantId(l)}},validateFilters:function(){var t=this.byId("idAPFSmartFilterBar");var e=t.validateMandatoryFields();this.getView().getViewData().oUiApi.getAddAnalysisStepButton().setEnabled(e);this.getView().getViewData().oUiApi.getAddAnalysisStepButton().rerender()},handleSplitterSize:function(){var t=this;var e=this.byId("idAPFSmartFilterBar");var a=e.mAggregations.content[0];var i=a.mAggregations.content[2];i.attachPress(function(){var e=this.getParent().getParent();if(e.getFilterBarExpanded()){t.getView().getViewData().oUiApi.getLayoutView().byId("idSplitterLayoutData").setSize("127px")}else{t.getView().getViewData().oUiApi.getLayoutView().byId("idSplitterLayoutData").setSize("65px")}})}})});
//# sourceMappingURL=smartFilterBar.controller.js.map
sap.ui.define(["sap/ui/core/mvc/OverrideExecution","sap/suite/ui/generic/template/lib/TemplateAssembler","sap/suite/ui/generic/template/ListReport/controller/ControllerImplementation","sap/suite/ui/generic/template/ListReport/controllerFrameworkExtensions","sap/suite/ui/generic/template/genericUtilities/testableHelper","sap/suite/ui/generic/template/listTemplates/filterSettingsPreparationHelper","sap/suite/ui/generic/template/js/staticChecksHelper","sap/suite/ui/generic/template/js/preparationHelper","sap/base/util/deepExtend","sap/suite/ui/generic/template/genericUtilities/FeError","sap/suite/ui/generic/template/js/StableIdHelper","sap/ui/model/Context","sap/suite/ui/generic/template/js/AnnotationHelper","sap/base/util/isEmptyObject","sap/suite/ui/generic/template/ListReport/AnnotationHelper","sap/insights/CardHelper"],function(e,t,a,i,n,l,r,o,s,u,c,p,d,b,f,g){"use strict";var m="ListReport.Component";function y(e,t){var n={};return{oControllerSpecification:{getMethods:a.getMethods.bind(null,n),oControllerDefinition:i,oControllerExtensionDefinition:{onInitSmartFilterBar:function(e){},provideExtensionAppStateData:function(e){},restoreExtensionAppStateData:function(e){},ensureFieldsForSelect:function(e,t){},addFilters:function(e,t){}}},oComponentData:{templateName:"sap.suite.ui.generic.template.ListReport.view.ListReport",designtimePath:"sap/suite/ui/generic/template/designtime/ListReport.designtime"},init:function(){var t=e.getModel("_templPriv");t.setProperty("/listReport",{})},adaptToChildContext:function(e){n.adaptToChildContext(e)},refreshBinding:function(e,t){n.refreshBinding(e,t)},getItems:function(){return n.getItems()},displayNextObject:function(e){return n.displayNextObject(e)},getTemplateSpecificParameters:function(a,i,n,y,v,S,E){function V(e,t){var i=a.getODataEntitySet(e);var n=a.getODataEntityType(i.entityType);var l,r,o;r=t.annotationPath;o=!!r&&n[r];if(o&&o.PresentationVariant){if(o.PresentationVariant.Visualizations){l=o.PresentationVariant.Visualizations[0].AnnotationPath}else if(o.PresentationVariant.Path){var s=o.PresentationVariant.Path.split("@")[1];var u=s&&n[s];l=u.Visualizations[0].AnnotationPath}}else if(o&&o.Visualizations){l=o.Visualizations[0].AnnotationPath}return!!(l&&l.indexOf("com.sap.vocabularies.UI.v1.Chart")>-1)}function h(){var e="/"+y;var t=new p(S,e);var a=E.getODataDraftFunctionImportName(t,"NewAction");return!!a}function T(e,t,i,n){var l=e?e.tableSettings:t.tableSettings;var o=false;var s=l.mode;if(l.multiEdit.enabled!==false&&t.isResponsiveTable&&!t.isWorklist){o=true;var u=i["Org.OData.Capabilities.V1.UpdateRestrictions"];if(u&&u.Updatable&&u.Updatable.Bool==="false"){o=false}else if(s==="None"){s=l.multiSelect?"MultiSelect":"SingleSelectLeft"}var c=l.multiEdit.annotationPath;if(c){r.checkErrorforMultiEditDialog(n,c);var p=n[c].Data;var d=p.filter(function(e){var t=e.RecordType==="com.sap.vocabularies.UI.v1.DataField"&&a.getODataProperty(n,e.Value.Path);return t&&t["sap:updatable"]!=="false"&&(!e["com.sap.vocabularies.UI.v1.Hidden"]||e["com.sap.vocabularies.UI.v1.Hidden"].Bool==="false")&&(!t["Org.OData.Core.V1.Immutable"]||t["Org.OData.Core.V1.Immutable"].Bool==="false")})}}return{multiEditEnabled:o,selectionMode:s,fields:d}}function A(e,i){function n(e){return{Create:{action:"Create",callbackName:"._templateEventHandlers.addEntry",text:C.createWithFilters?"{i18n>CREATE_NEW_OBJECT}":"{i18n>CREATE_OBJECT}",id:c.getStableId({type:"ListReportAction",subType:"Create",sQuickVariantKey:e}),press:"cmd:Create",enabled:true,isStandardAction:true},CreateWithFilters:{action:"CreateWithFilters",callbackName:"._templateEventHandlers.addEntryWithFilters",text:"{i18n>ST_CREATE_WITH_FILTERS}",id:c.getStableId({type:"ListReportAction",subType:"CreateWithFilter",sQuickVariantKey:e}),press:"cmd:CreateWithFilters",enabled:"{_templPriv>/generic/bDataAreShownInTable}",isStandardAction:true},Delete:{action:"Delete",callbackName:"._templateEventHandlers.deleteEntries",text:"{i18n>DELETE}",id:c.getStableId({type:"ListReportAction",subType:"Delete",sQuickVariantKey:e}),press:"cmd:Delete",enabled:"{_templPriv>/listReport/deleteEnabled}",isStandardAction:true}}}function l(e,t){if(b(e)){throw new u(m,"Identified an invalid value of 'logicalAction' i.e., '"+t.logicalAction+"' for a custom action in the manifest.")}return s({},e,{callbackName:t.press,text:t.text,id:t.id&&d.getBreakoutActionButtonId(t,C.quickVariantSelectionX?C.quickVariantSelectionX.variants[i]:undefined),enabled:d.getBreakoutActionEnabledKey(t,C.quickVariantSelectionX?C.quickVariantSelectionX.variants[i]:undefined),press:"cmd:"+t.logicalAction,isStandardAction:false})}function r(){var e=a.getObject(R.$path+"/"+f.getRelevantPresentationVariantPath(R,C.annotationPath));if(e&&e.Visualizations){var t=e.Visualizations.find(function(e){var t="/"+e.AnnotationPath.slice(1);return t.indexOf("com.sap.vocabularies.UI.v1.LineItem")>-1});if(t){return t.AnnotationPath.split("#")[1]||""}}if(C.quickVariantSelectionX){var n=R[C.quickVariantSelectionX.variants[i].annotationPath];if(n&&n.Visualizations){var l=n.Visualizations[0].AnnotationPath;if(l){if(l.indexOf("com.sap.vocabularies.UI.v1.LineItem")>-1){return(R.$path+"/"+l.slice(1)).split("#")[1]||""}}}}return""}var o=n(e);var p=t.getControllerExtensions();var g=[],S=Object.create(null),E=Object.create(null),V=Object.create(null);Object.values(p&&p.Actions||{}).forEach(function(t){if(t.logicalAction){if(C.quickVariantSelectionX&&C.quickVariantSelectionX.variants[i].entitySet&&C.quickVariantSelectionX.variants[i].entitySet!==y){return}o[t.logicalAction]=l(s({},o[t.logicalAction]),t)}else if(!t.global){var a=t.global?{type:"Action",subType:"Global",sAction:t.id}:{type:"ListReportAction",subType:"TableExtension",sAction:t.id,sQuickVariantKey:e};var n=c.getStableId(a);if(t.command){S[t.id]={id:n,action:t.command,callbackName:t.press};t.press="cmd:"+t.command}t.enabled=d.getBreakoutActionEnabledKey(t,C.quickVariantSelectionX?C.quickVariantSelectionX.variants[i]:undefined);t.id=n;g.push(t)}});var h=r();(R["com.sap.vocabularies.UI.v1.LineItem"+(h?"#"+h:"")]||[]).forEach(function(e){switch(e.RecordType){case"com.sap.vocabularies.UI.v1.DataFieldForAction":var a=t.getToolbarDataFieldForActionCommandDetails(e,C,C.quickVariantSelectionX?C.quickVariantSelectionX.variants[i]:undefined);if(!b(a)){E[a.id]=a}break;case"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":var a=t.getToolbarDataFieldForIBNCommandDetails(e,C,v,C.quickVariantSelectionX?C.quickVariantSelectionX.variants[i]:undefined);if(!b(a)){V[a.id]=a}break;default:break}});return{commandExecution:s(o,S,E,V),extensionActions:g}}var C=s({},i);C.targetEntities={};function P(e){if(!C.targetEntities[e.entityType]){C.targetEntities[e.entityType]=o.getTargetEntityForQuickView(a,e)}}C.bNewAction=i.useNewActionForCreate&&h();var k=t.getControllerExtensions();var D=k&&k.Actions;var I=a.getODataEntitySet(y);var R=a.getODataEntityType(I.entityType);var F=o.getLineItemFromVariant(a,I.entityType);var O;function x(e){e.selectAll=e.selectAll!==undefined&&e.selectAll}if(C.quickVariantSelectionX){var L=o.getNormalizedTableSettings(a,C,n,y,D,F);var j=C.quickVariantSelectionX.variants||{};for(var N in j){var q=j[N];var w=q.entitySet||y;var W=a.getODataEntitySet(w);if(!W){delete j[N];continue}q.isSmartChart=V(w,q);if(!q.isSmartChart){var X=o.getLineItemFromVariant(a,a.getODataEntitySet(w).entityType,q.annotationPath&&q.annotationPath.split("#")[1]);q.tableSettings=q.tableSettings||L;q.tableSettings=o.getNormalizedTableSettings(a,q,n,w,D,X);x(q.tableSettings);if(C.isResponsiveTable===undefined){C.isResponsiveTable=q.tableSettings.type==="ResponsiveTable"}else if(C.isResponsiveTable!==(q.tableSettings.type==="ResponsiveTable")){throw new u(m,"Variant with key "+N+" resulted in invalid Table Type combination. Please check documentation and update manifest.json.")}var H=a.getODataEntityType(W.entityType);if(H&&H.property&&q.tableSettings&&q.tableSettings.createWithParameterDialog){r.checkErrorforCreateWithDialog(H,q.tableSettings);C.quickVariantSelectionX.variants[N].tableSettings.createWithParameterDialog.id=c.getStableId({type:"ListReportAction",subType:"CreateWithDialog",sQuickVariantKey:j[N].key})}if(q.tableSettings.multiEdit){O=T(q,C,W,R);q.tableSettings.multiEdit.enabled=O.multiEditEnabled;if(O.multiEditEnabled){q.tableSettings.multiEdit.fields=O.fields;q.tableSettings.mode=O.selectionMode}}P(W);q.tableSettings=s(q.tableSettings,A(q.key,N))}}delete C.tableSettings;C.isResponsiveTable=C.isResponsiveTable===undefined||C.isResponsiveTable}else{C.tableSettings=o.getNormalizedTableSettings(a,i,n,y,D,F);x(C.tableSettings);C.isResponsiveTable=C.tableSettings.type==="ResponsiveTable";if(C.tableSettings.multiEdit){O=T(undefined,C,I,R);C.tableSettings.multiEdit.enabled=O.multiEditEnabled;if(O.multiEditEnabled){C.tableSettings.multiEdit.fields=O.fields;C.tableSettings.mode=O.selectionMode}}P(I);C.tableSettings=s(C.tableSettings,A())}C.controlConfigurationSettings=l.getControlConfigurationSettings(C,R,I,S);var B=l.getDatePropertiesSettings(C,R,I,S);var M=e.getModel("_templPriv");M.setProperty("/listReport/datePropertiesSettings",B);if(!C.subPages||C.subPages.length===0){M.setProperty("/listReport/bSupressCardRowNavigation",true)}else if(C.subPages[0].navigation){M.setProperty("/listReport/bSupressCardRowNavigation",true)}if(R&&R.property&&i&&C&&C.tableSettings&&C.tableSettings.createWithParameterDialog){r.checkErrorforCreateWithDialog(R,C.tableSettings);C.tableSettings.createWithParameterDialog.id=c.getStableId({type:"ListReportAction",subType:"CreateWithDialog"})}C.isSelflinkRequired=true;C.isIndicatorRequired=true;C.isSemanticallyConnected=false;C.bInsightsEnabled=false;var U=e.getModel("_templPrivGlobal");if(!U.getProperty("/generic/isTeamsModeActive")){g.getServiceAsync("UIService").then(function(e){C.bInsightsEnabled=true;M.setProperty("/listReport/oInsightsInstance",e)}).catch(Function.prototype)}return C},executeAfterInvokeActionFromExtensionAPI:function(e){e.oPresentationControlHandler.setEnabledToolbarButtons();e.oPresentationControlHandler.setEnabledFooterButtons()},getCurrentState:function(){return n.getCurrentState.apply(null,arguments)},getInitialState:function(){return{permanentState:{}}},applyState:function(){n.applyState.apply(null,arguments)},getStatePreserverSettings:function(){return{callAlways:false}}}}n.testableStatic(y,"Component_getMethods");return t.getTemplateComponent(y,"sap.suite.ui.generic.template.ListReport",{metadata:{library:"sap.suite.ui.generic.template",properties:{hideChevronForUnauthorizedExtNav:{type:"boolean",defaultValue:false},treeTable:{type:"boolean",defaultValue:false},gridTable:{type:"boolean",defaultValue:false},tableType:{type:"string",defaultValue:undefined},multiSelect:{type:"boolean",defaultValue:false},tableSettings:{type:"object",properties:{type:{type:"string",defaultValue:undefined},multiSelect:{type:"boolean",defaultValue:false},inlineDelete:{type:"boolean",defaultValue:false},selectAll:{type:"boolean",defaultValue:false},addCardtoInsightsHidden:{type:"boolean",defaultValue:false},selectionLimit:{type:"int",defaultValue:200},multiEdit:{type:"object",properties:{enabled:{type:"boolean",defaultValue:true},annotationPath:{type:"string"},ignoredFields:{type:"string",defaultValue:""}}}}},createWithFilters:"object",condensedTableLayout:"boolean",smartVariantManagement:{type:"boolean",defaultValue:false},hideTableVariantManagement:{type:"boolean",defaultValue:false},variantManagementHidden:{type:"boolean",defaultValue:false},createWithParameterDialog:{type:"object",properties:{fields:{type:"object"}}},creationEntitySet:"string",enableTableFilterInPageVariant:{type:"boolean",defaultValue:false},useNewActionForCreate:{type:"boolean",defaultValue:false},multiContextActions:"object",isWorklist:{type:"boolean",defaultValue:false},filterSettings:l.getFilterSettingsMetadata(),dataLoadSettings:{type:"object",properties:{loadDataOnAppLaunch:{type:"string",defaultValue:"ifAnyFilterExist"}}},quickVariantSelectionX:{type:"object",properties:{showCounts:{type:"boolean",defaultValue:false},variants:{type:"object",mapEntryProperties:{key:{type:"string",optional:true},annotationPath:{type:"string"},entitySet:{type:"string",optional:true},tableSettings:{type:"object",properties:{type:{type:"string",defaultValue:undefined},multiSelect:{type:"boolean",defaultValue:false},inlineDelete:{type:"boolean",defaultValue:false},selectAll:{type:"boolean",defaultValue:false},selectionLimit:{type:"int",defaultValue:200}}}}}}},quickVariantSelection:{type:"object",properties:{showCounts:{type:"boolean",defaultValue:false},variants:{type:"object",mapEntryProperties:{key:{type:"string",optional:true},annotationPath:{type:"string"}}}}},annotationPath:{type:"string",defaultValue:undefined},editFlow:{type:"string",defaultValue:"display"}},manifest:"json"}})});
//# sourceMappingURL=Component.js.map
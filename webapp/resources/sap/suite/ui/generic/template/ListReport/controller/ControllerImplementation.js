sap.ui.define(["sap/ui/model/Filter","sap/suite/ui/generic/template/ListReport/extensionAPI/ExtensionAPI","sap/suite/ui/generic/template/listTemplates/listUtils","sap/suite/ui/generic/template/listTemplates/controller/MessageStripHelper","sap/suite/ui/generic/template/ListReport/controller/IappStateHandler","sap/suite/ui/generic/template/ListReport/controller/MultipleViewsHandler","sap/suite/ui/generic/template/ListReport/controller/WorklistHandler","sap/suite/ui/generic/template/lib/ShareUtils","sap/suite/ui/generic/template/genericUtilities/controlHelper","sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/base/util/ObjectPath","sap/suite/ui/generic/template/js/StableIdHelper","sap/base/util/deepExtend","sap/suite/ui/generic/template/lib/CreateWithDialogHandler","sap/suite/ui/generic/template/ListReport/controller/MultiEditHandler","sap/ui/generic/app/navigation/service/SelectionVariant","sap/suite/ui/generic/template/lib/AddCardsHelper","sap/suite/ui/generic/template/listTemplates/filterSettingsPreparationHelper","sap/ui/model/json/JSONModel","sap/m/MessageBox"],function(e,t,n,a,r,i,o,l,s,c,d,u,p,g,f,m,v,S,C,E){"use strict";var b=new c("ListReport.controller.ControllerImplementation").getLogger();var h={getMethods:function(c,C,h){var y={};y.oWorklistData={bWorkListEnabled:!!C.oComponentUtils.getSettings().isWorklist};var T;var D=null;function F(){var e=h.getOwnerComponent();var t=C.oComponentUtils.getTemplatePrivateModel();t.setProperty("/listReport/isLeaf",e.getIsLeaf())}function I(e){var t=e.getSource();var n=h.getOwnerComponent().getAnnotationPath();if(n!==undefined){P(t,n)}h.onInitSmartFilterBarExtension(e);h.templateBaseExtension.onInitSmartFilterBar(e)}function P(e,t){if(t.indexOf("com.sap.vocabularies.UI.v1.PresentationVariant")>-1){return}var a=new m(JSON.stringify(e.getUiState().getSelectionVariant()));var r=h.getOwnerComponent().getModel().getMetaModel();var i=h.getOwnerComponent().getEntitySet();var o=r.getODataEntityType(r.getODataEntitySet(i).entityType);var l=r.getObject(o.$path+"/"+t);if(l&&l.SelectionVariant&&(l.SelectionVariant.Path||l.SelectionVariant.AnnotationPath)){t=(l.SelectionVariant.Path||l.SelectionVariant.AnnotationPath).split("@")[1]}var s=r.getObject(o.$path+"/"+t);if(s){s=n.createSVObject(s,e);s.FilterContextUrl=a.getFilterContextUrl();y.oIappStateHandler.setFiltersUsingUIState(s.toJSONObject(),true,false)}else{var c=h.getOwnerComponent().getAppComponent().getNavigationController();c.navigateToMessagePage({title:C.oCommonUtils.getText("ST_ERROR"),text:"Manifest property 'annotationPath' is configured with "+t+" but no such annotation found.",description:""})}}function H(e){C.oCommonUtils.setEnabledToolbarButtons(e);if(!s.isSmartChart(e)){C.oCommonUtils.setEnabledFooterButtons(e)}}function U(e){var t;t=e.getSource();t.getChartAsync().then(function(e){e.attachSelectData(H.bind(null,t));e.attachDeselectData(H.bind(null,t))})}function M(e){var t=e.getParameters();var n=e.getSource();C.oCommonEventHandlers.onSemanticObjectLinkNavigationPressed(n,t)}function R(e){var t,n;t=e.getParameters();n=e.getSource();C.oCommonEventHandlers.onSemanticObjectLinkNavigationTargetObtained(n.getEntitySet(),n.getFieldSemanticObjectMap(),t,y)}function A(e){var t=e.getParameters(),n=t.mainNavigation,a=e.getSource(),r;if(n){r=a.getText&&a.getText();var i=C.oCommonUtils.getCustomData(e);if(i&&i["LinkDescr"]){var o=i["LinkDescr"];n.setDescription(o)}}C.oCommonEventHandlers.onSemanticObjectLinkNavigationTargetObtained(y.oPresentationControlHandler.getEntitySet(),{},t,y,r)}function O(e){var t=c.getItems();for(var n=0;n<t.length;n++){if(!e||t[n].getBindingContextPath()===e){return t[n]}}}function w(e){C.oCommonEventHandlers.onListNavigate(e,y,undefined,true)}function L(e,t,n){var a=C.oServices.oCRUDManager.getDefaultValues(t,e);if(a instanceof Promise){var r=function(e){n.call(this,e[0],t)};a.then(r,r)}else{n.call(this,e,t)}}function B(e,t){if(e){x(e,t)}else{L(null,t,x)}}function x(e,t){if(t.data("CrossNavigation")){C.oCommonUtils.fnProcessDataLossOrDraftDiscardConfirmation(function(){C.oCommonEventHandlers.addEntry(t,false,y.oSmartFilterbar,e)},Function.prototype,"LeaveApp")}else{C.oCommonEventHandlers.addEntry(t,false,y.oSmartFilterbar,e)}}function V(){var e=y.oMultipleViewsHandler.getMode()!=="single"&&y.oMultipleViewsHandler.getSelectedKey()||"";var t=u.getStableId({type:"ListReportAction",subType:"Create",sQuickVariantKey:e});C.oCommonUtils.executeIfControlReady(function(t){var n=u.getStableId({type:"ListReportAction",subType:"CreateWithDialog",sQuickVariantKey:e});var a=n&&h.byId(n);if(a){y.oCreateWithDialogHandler.createWithDialog(a,t)}else{B(null,t)}},t)}function k(e){L(undefined,e.getSource(),N)}function N(e,t){var n=h.getOwnerComponent().getCreateWithFilters();var a=n.strategy||"extension";var r;switch(a){case"extension":r=h.getPredefinedValuesForCreateExtension(y.oSmartFilterbar,e)||{};break;default:b.error(a+" is not a valid strategy to extract values from the SmartFilterBar");return}var i=u.getStableId({type:"ListReportAction",subType:"CreateWithDialog"});var o=i&&h.byId(i);if(o){y.oCreateWithDialogHandler.createWithDialog(o,t,r)}else{B(r,t)}}function _(e){var t=C.oComponentUtils.getTemplatePrivateModel();var n=t.getProperty("/listReport/deleteEnabled");if(n){C.oCommonEventHandlers.deleteEntries(e)}}function W(t){if(!C.oComponentUtils.isDraftEnabled()){return}var n=C.oComponentUtils.getTemplatePrivateModel();var a=n.getProperty("/listReport/vDraftState");switch(a){case"1":t.push(new e("IsActiveEntity","EQ",true));t.push(new e("HasDraftEntity","EQ",false));break;case"2":t.push(new e("IsActiveEntity","EQ",false));break;case"3":t.push(new e("IsActiveEntity","EQ",true));t.push(new e("SiblingEntity/IsActiveEntity","EQ",null));t.push(new e("DraftAdministrativeData/InProcessByUser","NE",""));break;case"4":t.push(new e("IsActiveEntity","EQ",true));t.push(new e("SiblingEntity/IsActiveEntity","EQ",null));t.push(new e("DraftAdministrativeData/InProcessByUser","EQ",""));break;case"5":t.push(new e("IsActiveEntity","EQ",true));break;default:var r=new e({filters:[new e("IsActiveEntity","EQ",false),new e("SiblingEntity/IsActiveEntity","EQ",null)],and:false});if(t[0]&&t[0].aFilters){var i=t[0];t[0]=new e([i,r],true)}else{t.push(r)}break}}function j(){return y.oSmartFilterbar.getBasicSearchValue()||y.oWorklistHandler.getSearchString()}function Q(e){var t={sharePageToPressed:function(e){var t=C.oServices.oApplication.getBusyHelper();if(t.isBusy()){return}var n=C.oServices.oApplication.getAppTitle();var a=l.getCurrentUrl().then(function(t){switch(e){case"Email":n=C.oCommonUtils.getText("EMAIL_HEADER",[n]);sap.m.URLHelper.triggerEmail(null,n,t);break;default:break}});t.setBusy(a)},shareJamPressed:function(){l.openJamShareDialog(C.oServices.oApplication.getAppTitle())},shareTilePressed:function(){l.fireBookMarkPress()},getDownloadUrl:function(){var e=y.oPresentationControlHandler.getBinding(y);return e&&e.getDownloadUrl()||""},getServiceUrl:function(){return y.oSmartFilterbar.hasDateRangeTypeFieldsWithValue().then(function(e){var n=e?"":t.getDownloadUrl();n=n&&n+"&$top=0&$inlinecount=allpages";var a={serviceUrl:n};h.onSaveAsTileExtension(a);return a.serviceUrl})},getModelData:function(){var e=d.get("sap.ushell.Container.getUser");var n=h.getOwnerComponent().getAppComponent().getMetadata();var a=n.getManifestEntry("sap.ui");var r=n.getManifestEntry("sap.app");return t.getServiceUrl().then(function(t){return l.getCurrentUrl().then(function(n){return{serviceUrl:t,icon:a&&a.icons?a.icons.icon:"",title:r?r.title:"",isShareInJamActive:!!e&&e().isJamActive(),customUrl:l.getCustomUrl(),currentUrl:n}})})}};l.openSharePopup(C.oCommonUtils,e,t)}function q(e){var t=e.getId();var n=y.oSmartFilterbar;var a="";var r=[];var i=!!(C.oComponentUtils&&C.oComponentUtils.getSettings()&&(C.oComponentUtils.getSettings().quickVariantSelectionX||C.oComponentUtils.getSettings().quickVariantSelection));if(e.fetchVariant()&&e.fetchVariant().filter&&e.fetchVariant().filter.filterItems){r=e.fetchVariant().filter.filterItems}var o={search:!!n.getBasicSearchValue(),filter:!!(r.length||n.retrieveFiltersWithValues().length)};if(i){a=C.oCommonUtils.getContextText("NOITEMS_MULTIVIEW_LR_SMARTTABLE_WITH_FILTER",t)}else if(o.search||o.filter){a=C.oCommonUtils.getContextText("NOITEMS_LR_SMARTTABLE_WITH_FILTER",t)}else{a=C.oCommonUtils.getContextText("NOITEMS_LR_SMARTTABLE",t)}e.setNoData(a)}function z(e){var t=e.getId();var n=C.oCommonUtils.getContextText("NOITEMS_LR_SMARTCHART",t);e.getChartAsync().then(function(e){e.setCustomMessages({NO_DATA:n})})}function J(e){var t=e.getEntitySet();C.oServices.oApplication.preloadComponent(t)}var K;function $(e){if(K){K()}K=Function.prototype;C.oCommonEventHandlers.onDataReceived(e);if(D){var t;var n=false;for(var a=0;a<D.aWaitingObjects.length&&!n;a++){t=O(D.aWaitingObjects[a]);if(t){w(t);D.resolve();n=true}}if(!n){t=O();if(t){w(t);D.resolve()}else{D.reject()}}D=null;return}T.handleDataReceived(e,w);var r=C.oComponentUtils.getTemplatePrivateModel();r.setProperty("/listReport/firstSelection",true);y.oIappStateHandler.setDataShownInTable(true);C.oComponentUtils.hidePlaceholder()}function G(e){var t=y.oPresentationControlHandler.getModel().getMetaModel();return y.oPresentationControlHandler.getVisibleProperties().some(function(n){var a=n.data("p13nData")&&n.data("p13nData").columnKey;var r=t.getODataProperty(e,n.data("p13nData").leadingProperty);if(r&&r["sap:label"]){if(n.getVisible()&&(a.indexOf("DataFieldForAnnotation")<0&&!n.data("p13nData").actionButton&&!!n.data("p13nData").leadingProperty)){return true}}})}return{onInit:function(){y.oSmartFilterbar=h.byId("listReportFilter");y.oPresentationControlHandler=C.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(h.byId(u.getStableId({type:"ListReportTable",subType:"SmartTable"}))||h.byId(u.getStableId({type:"ListReportTable",subType:"SmartList"})));S.fnMergeControlConfiguration(y.oSmartFilterbar.getControlConfiguration());y.updateControlOnSelectionChange=H;T=C.oComponentUtils.getFclProxy();y.bLoadListAndFirstEntryOnStartup=T.isListAndFirstEntryLoadedOnStartup();var e=new i(y,h,C);y.oMultipleViewsHandler=e;y.oMessageStripHelper=new a(y.oPresentationControlHandler,e,h,C,"listReport");y.refreshModel=function(){var t=C.oCommonUtils.refreshModel(y.oPresentationControlHandler.getEntitySet());if(t){e.refreshSiblingControls(y.oPresentationControlHandler)}};y.oCreateWithDialogHandler=new g(y,h,C);y.oWorklistHandler=new o(y,h,C);y.oIappStateHandler=new r(y,h,C);y.oMultiEditHandler=new f(y,h,C);var t=C.oComponentUtils.getTemplatePrivateModel();t.setProperty("/generic/bDataAreShownInTable",false);t.setProperty("/listReport/firstSelection",false);t.setProperty("/listReport/isHeaderExpanded",true);t.setProperty("/listReport/deleteEnabled",false);t.setProperty("/listReport/multiEditEnabled",false);if(C.oComponentUtils.isDraftEnabled()){t.setProperty("/listReport/vDraftState","0")}t.setProperty("/listReport/multipleViews/msgVisibility",false);c.adaptToChildContext=function(e){y.oPresentationControlHandler.scrollToSelectedItemAsPerChildContext(e)};c.getItems=function(){return y.oPresentationControlHandler.getItems()};c.displayNextObject=function(e){return new Promise(function(t,n){D={aWaitingObjects:e,resolve:t,reject:n}})};c.refreshBinding=function(e,t){if(y.oIappStateHandler.areDataShownInTable()){if(y.oMultipleViewsHandler.refreshOperation(2,null,!e&&t)){return}if(e||t[h.getOwnerComponent().getEntitySet()]){C.oCommonUtils.refreshModel(h.getOwnerComponent().getEntitySet());y.oPresentationControlHandler.refresh()}}};c.getCurrentState=function(){return{permanentState:{data:y.oIappStateHandler.getCurrentAppState(),lifecycle:{permanent:true}}}};c.applyState=function(e){y.oIappStateHandler.applyState(e.permanentState).then(function(){if(!y.oIappStateHandler.areDataShownInTable()){T.handleDataReceived()}})};F();h.byId("template::FilterText").attachBrowserEvent("click",function(){h.byId("page").setHeaderExpanded(true)});var n=h.byId(u.getStableId({type:"ListReportAction",subType:"Share"})+"-internalBtn");n.attachPress(function(){Q(n)})},handlers:{addEntry:V,addEntryWithFilters:k,deleteEntries:_,deleteEntry:function(e){C.oCommonEventHandlers.deleteEntry(e)},updateTableTabCounts:function(){y.oMultipleViewsHandler.fnUpdateTableTabCounts()},onCancelCreateWithPopUpDialog:function(){y.oCreateWithDialogHandler.onCancelPopUpDialog()},onSaveCreateWithPopUpDialog:function(e){y.oCreateWithDialogHandler.onSavePopUpDialog(e)},onSelectionChange:function(e){var t=e.getSource();H(t)},onMultiSelectionChange:function(e){C.oCommonEventHandlers.onMultiSelectionChange(e)},onContactDetails:function(e){C.oCommonEventHandlers.onContactDetails(e)},onSmartFilterBarInitialise:I,onSmartFilterBarInitialized:function(){y.oIappStateHandler.onSmartFilterBarInitialized()},onAfterSFBVariantLoad:function(e){y.oIappStateHandler.onAfterSFBVariantLoad(e)},onSmartListDataReceived:function(e){var t=e.getSource();$(t)},onBeforeRebindTable:function(e){var t=e.getSource();q(t);var a=e.getParameters().bindingParams;y.oMultipleViewsHandler.aTableFilters=p({},a.filters);var r=a.filters.slice(0);C.oCommonEventHandlers.onBeforeRebindTable(e,{determineSortOrder:y.oMultipleViewsHandler.determineSortOrder,ensureExtensionFields:h.templateBaseExtension.ensureFieldsForSelect,addTemplateSpecificFilters:W,getSearchString:j,addExtensionFilters:h.templateBaseExtension.addFilters,resolveParamaterizedEntitySet:y.oMultipleViewsHandler.resolveParameterizedEntitySet,isFieldControlRequired:false,isPopinWithoutHeader:true,isDataFieldForActionRequired:true,isFieldControlsPathRequired:true,isMandatoryFiltersRequired:true});h.onBeforeRebindTableExtension(e);var i=a.events.dataRequested||Function.prototype;a.events.dataRequested=function(e){J(t);i.call(this,e)};var o=a.events.dataReceived||Function.prototype;a.events.dataReceived=function(e){$(t);o.call(this,e)};var l=a.events.refresh||Function.prototype;a.events.refresh=function(e){y.oMultipleViewsHandler.onDataRequested();l.call(this,e)};y.oMessageStripHelper.onBeforeRebindControl(e);y.oMultipleViewsHandler.onRebindContentControl(a,r);n.handleErrorsOnTableOrChart(C,e,y)},onListNavigate:function(e){var t=p({},e);(C.oComponentUtils.isDraftEnabled()?C.oServices.oApplicationController.synchronizeDraftAsync():Promise.resolve()).then(function(){C.oCommonEventHandlers.onListNavigate(t,y)})},onEdit:function(e){C.oCommonEventHandlers.onListNavigate(e,y)},onCallActionFromToolBar:function(e){C.oCommonEventHandlers.onCallActionFromToolBar(e,y)},onDataFieldForIntentBasedNavigation:function(e){C.oCommonEventHandlers.onDataFieldForIntentBasedNavigation(e,y)},onDataFieldWithIntentBasedNavigation:function(e){C.oCommonEventHandlers.onDataFieldWithIntentBasedNavigation(e,y)},onBeforeSemanticObjectLinkNavigationCallback:function(e){return C.oCommonEventHandlers.onBeforeSemanticObjectLinkNavigationCallback(e)},onBeforeSemanticObjectLinkPopoverOpens:function(e){var t=e.getSource();var n=y.oSmartFilterbar.getUiState().getSelectionVariant();if(y.oSmartFilterbar.getEntitySet()!==t.getEntitySet()){n.FilterContextUrl=C.oServices.oApplication.getNavigationHandler().constructContextUrl(t.getEntitySet(),t.getModel())}var a=JSON.stringify(n);C.oCommonUtils.semanticObjectLinkNavigation(e,a,h,y)},onSemanticObjectLinkNavigationPressed:M,onSemanticObjectLinkNavigationTargetObtained:R,onSemanticObjectLinkNavigationTargetObtainedSmartLink:A,onDraftLinkPressed:function(e){var t=e.getSource();var n=t.getBindingContext();C.oCommonUtils.showDraftPopover(n,t)},onAssignedFiltersChanged:function(e){if(e.getSource()){h.byId("template::FilterText").setText(e.getSource().retrieveFiltersWithValuesAsText())}},onSearchButtonPressed:function(){y.oIappStateHandler.onSearchPressed()},onAddCardsToRepository:function(e){C.oServices.oApplication.performAfterSideEffectExecution(function(){var e=y.oPresentationControlHandler;var t=e.getModel();var n=e.getEntitySet();var a=t.getMetaModel();var r=a.getODataEntitySet(n);var i=a.getODataEntityType(r.entityType);var o=h.getOwnerComponent();var l=o.getModel("i18n").getResourceBundle();var s=G(i);var c=C.oComponentUtils.getTemplatePrivateModel();var d=c.getProperty("/listReport/tableFiltersActive");if(y.oSmartFilterbar.getUiState().getSemanticDates()||d||!s){E.error(l.getText("ST_CARD_CREATION_FAILURE"),{onClose:function(){throw new Error("Insights is not supported")},details:"<strong>"+l.getText("ST_CARD_POSSIBLE_CAUSES")+"</strong>"+"<ul>"+"<li>"+l.getText("ST_CARD_FAILURE_REASON_DATE_RANGE_FILTERS")+"</li>"+"<li>"+l.getText("ST_CARD_FAILURE_TABLE_REASON_UNSUPPORTED_COLUMNS")+"</li>"+"</ul>"+l.getText("ST_CARD_FOOTER_INFO")})}else{var u=h.getView();var p={};p.currentControlHandler=e;p.component=o;p.view=u;p.entitySet=r;p.entityType=i;p.oSmartFilterbar=y.oSmartFilterbar;p.oTemplateUtils=C;var g=c.getProperty("/listReport/oInsightsInstance");var f=c.getProperty("/listReport/vDraftState");if(f&&Number(f)){p.oFECustomFilterData={name:"IsActiveEntity",value:f}}var m=v.createCardForPreview(p);g.showCardPreview(m,true)}},true)},onBeforeRebindChart:function(e){var t=e.getSource();z(t);var a=e.getParameters().bindingParams;y.oMultipleViewsHandler.aTableFilters=p({},a.filters);var r=a.filters.slice(0);var i={setBindingPath:t.setChartBindingPath.bind(t),ensureExtensionFields:Function.prototype,addTemplateSpecificFilters:W,addExtensionFilters:h.templateBaseExtension.addFilters,resolveParamaterizedEntitySet:y.oMultipleViewsHandler.resolveParameterizedEntitySet,isFieldControlRequired:false,isMandatoryFiltersRequired:true};C.oCommonUtils.onBeforeRebindTableOrChart(e,i,y.oSmartFilterbar);h.onBeforeRebindChartExtension(e);var o=a.events.dataReceived||Function.prototype;a.events.dataReceived=function(e){y.oMultipleViewsHandler.onDataRequested();C.oComponentUtils.hidePlaceholder();o.call(this,e)};y.oMultipleViewsHandler.onRebindContentControl(a,r);n.handleErrorsOnTableOrChart(C,e,y)},onChartInitialized:function(e){U(e);C.oCommonUtils.checkToolbarIntentsSupported(e.getSource())},onSelectionDetailsActionPress:function(e){y.oMultipleViewsHandler.onDetailsActionPress(e)},onShareListReportActionButtonPress:function(e){C.oCommonUtils.executeIfControlReady(Q,u.getStableId({type:"ListReportAction",subType:"Share"})+"-internalBtn")},onInlineDataFieldForAction:function(e){C.oCommonEventHandlers.onInlineDataFieldForAction(e)},onInlineDataFieldForIntentBasedNavigation:function(e){C.oCommonEventHandlers.onInlineDataFieldForIntentBasedNavigation(e.getSource(),y)},onDeterminingDataFieldForAction:function(e){C.oCommonEventHandlers.onDeterminingDataFieldForAction(e,y.oPresentationControlHandler)},onDeterminingDataFieldForIntentBasedNavigation:function(e){C.oCommonEventHandlers.onDeterminingDataFieldForIntentBasedNavigation(e.getSource(),y.oPresentationControlHandler.getSelectedContexts(),y.oSmartFilterbar)},onTableInit:function(e){var t=e.getSource();C.oCommonUtils.checkToolbarIntentsSupported(t);var n=new sap.ui.model.base.ManagedObjectModel(t);t.setModel(n,"tableobserver")},onSearchWorkList:function(e){y.oWorklistHandler.performWorklistSearch(e)},onMultiEditButtonPress:function(){y.oMultiEditHandler.onMultiEditButtonPress()},onSaveMultiEditDialog:function(e){y.oMultiEditHandler.onSaveMultiEditDialog(e)},onCancelMultiEditDialog:function(e){y.oMultiEditHandler.onCancelMultiEditDialog(e)},dataStateFilter:function(e,t){return y.oMessageStripHelper.dataStateFilter(e,t)},dataStateClose:function(){y.oMessageStripHelper.onClose()},onBeforeExport:function(e){C.oCommonEventHandlers.onBeforeExport(e)}},formatters:{formatDraftType:function(e,t,n){if(e&&e.DraftUUID){if(!t){return sap.m.ObjectMarkerType.Draft}else if(n){return e.InProcessByUser?sap.m.ObjectMarkerType.Locked:sap.m.ObjectMarkerType.Unsaved}}return sap.m.ObjectMarkerType.Flagged},formatDraftVisibility:function(e,t){if(e&&e.DraftUUID){if(!t){return sap.m.ObjectMarkerVisibility.TextOnly}}return sap.m.ObjectMarkerVisibility.IconAndText},formatDraftLineItemVisible:function(e,t){if(e&&e.DraftUUID){if(t==="5"){return false}return true}return false},formatDraftOwner:function(e,t){var n="";if(e&&e.DraftUUID&&t){var a=e.InProcessByUserDescription||e.InProcessByUser||e.LastChangedByUserDescription||e.LastChangedByUser;if(a){n=C.oCommonUtils.getText("ST_DRAFT_OWNER",[a])}else{n=C.oCommonUtils.getText("ST_DRAFT_ANOTHER_USER")}}return n},formatItemTextForMultipleView:function(e){return y.oMultipleViewsHandler?y.oMultipleViewsHandler.formatItemTextForMultipleView(e):""},formatMessageStrip:function(e,t){return y.oMultipleViewsHandler?y.oMultipleViewsHandler.formatMessageStrip(e,t):""}},extensionAPI:new t(C,h,y)}}};return h});
//# sourceMappingURL=ControllerImplementation.js.map
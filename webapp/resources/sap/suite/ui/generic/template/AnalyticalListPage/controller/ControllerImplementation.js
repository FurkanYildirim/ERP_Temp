sap.ui.define(["sap/ui/generic/app/navigation/service/SelectionVariant","sap/suite/ui/generic/template/AnalyticalListPage/extensionAPI/ExtensionAPI","sap/suite/ui/generic/template/AnalyticalListPage/controller/FilterBarController","sap/suite/ui/generic/template/listTemplates/controller/ToolbarController","sap/suite/ui/generic/template/AnalyticalListPage/controller/VisualFilterBarController","sap/suite/ui/generic/template/AnalyticalListPage/controller/VisualFilterDialogController","sap/suite/ui/generic/template/AnalyticalListPage/controller/AnalyticGridController","sap/ui/table/AnalyticalTable","sap/ui/model/odata/AnnotationHelper","sap/ui/model/analytics/odata4analytics","sap/suite/ui/generic/template/AnalyticalListPage/controller/ContentAreaController","sap/suite/ui/generic/template/listTemplates/controller/IappStateHandler","sap/ui/Device","sap/m/SegmentedButtonItem","sap/m/SegmentedButton","sap/m/OverflowToolbar","sap/m/ToolbarSpacer","sap/m/library","sap/ui/model/Context","sap/suite/ui/generic/template/AnalyticalListPage/util/AnnotationHelper","sap/suite/ui/generic/template/genericUtilities/controlHelper","sap/suite/ui/generic/template/genericUtilities/FeLogger","sap/suite/ui/generic/template/AnalyticalListPage/util/FilterUtil","sap/base/util/ObjectPath","sap/suite/ui/generic/template/lib/ShareUtils","sap/base/util/merge","sap/base/util/deepExtend","sap/suite/ui/generic/template/listTemplates/listUtils","sap/suite/ui/generic/template/listTemplates/controller/MultipleViewsHandler","sap/suite/ui/generic/template/js/StableIdHelper","sap/suite/ui/generic/template/listTemplates/controller/MessageStripHelper","sap/ui/model/json/JSONModel","sap/suite/ui/generic/template/listTemplates/controller/DetailController","sap/ui/comp/personalization/Util","sap/suite/ui/generic/template/lib/AddCardsHelper","sap/m/MessageBox"],function(e,t,a,r,n,i,o,l,s,g,d,u,c,p,f,m,C,v,S,F,b,h,y,T,P,I,A,E,D,B,M,_,H,V,w,R){"use strict";var O=new h("AnalyticalListPage.controller.ControllerImplementation");var U=O.getLogger();var L=O.Level;var x="chart",N="visual",K="compact",k=900;return{getMethods:function(f,m,C){var v={};v.oRefreshTimer=null;v.nRefreshInterval=0;v.bVisualFilterInitialised=false;v._bIsStartingUp=true;var S=false;function h(e){v.oRefreshTimer=setTimeout(function(){var e=C.getOwnerComponent();var t=e.getModel("_templPriv");if(!t.getProperty("/alp/filterChanged")){f.refreshBinding()}},e)}function y(e){if(v.nRefreshInterval!==0){if(v.oRefreshTimer!==null){clearTimeout(v.oRefreshTimer)}if(!e){h(v.nRefreshInterval)}}}function H(){var e=C.getOwnerComponent();var t=e.getModel("_templPriv");t.setProperty("/listReport/isLeaf",e.getIsLeaf())}function O(e,t){var a=e&&e.property;return a.filter(function(e){return typeof e[t]!=="undefined"})}function j(t){var a=t.getModel(),r=a&&a.getMetaModel(),n=r&&r.getODataEntityType(t.getEntityType()),i,o=r&&r.getODataEntityType(t.getEntityType(),true),l=F.createSVAnnotation(n,r,v.oController.getOwnerComponent().getQualifier());if(v.oController.getOwnerComponent().getFilterDefaultsFromSelectionVariant()&&l){i=E.createSVObject(I({},l),t)}else{if(v.oController.getOwnerComponent().getFilterDefaultsFromSelectionVariant()&&!l){U.warning("No SelectionVariant found in the annotation : No default values filled in FilterBar")}var d=n&&O(n,"com.sap.vocabularies.Common.v1.FilterDefaultValue"),u,c,p,f,m,C=[];try{u=new g.Model(new g.Model.ReferenceByModel(a));m=u&&u.findQueryResultByName(t.getEntitySet());c=m&&m.getParameterization();p=c&&r.getODataEntitySet(c.getEntitySet().getQName());f=p&&r.getODataEntityType(p.entityType);C=f?O(f,"defaultValue"):[]}catch(e){U.error(e)}if(d.length>0||C.length>0){i=new e;d.forEach(function(e){var t=r.createBindingContext(o+"/property/[${path:'name'}==='"+e.name+"']/com.sap.vocabularies.Common.v1.FilterDefaultValue");i.addSelectOption(e.name,"I","EQ",s.format(t))});C.forEach(function(e){i.addParameter(e.name,e.defaultValue)})}}return i}function z(e){var t=e.getSource();t.suspendSetFilterData();var a=j(t);if(a){v.oIappStateHandler.fnSetFiltersUsingUIState(a.toJSONObject(),{},true,false)}v.oIappStateHandler.onSmartFilterBarInitialise();C.onInitSmartFilterBarExtension(e);C.templateBaseExtension.onInitSmartFilterBar(e)}function G(){var e=v.oController.getOwnerComponent();if(v.hideVisualFilter||e.getDefaultFilterMode()=="visual"&&e.getModel().mMetadataUrlParams&&e.getModel().mMetadataUrlParams["sap-value-list"]==="none"){if(v.alr_visualFilterBar&&!v.alr_visualFilterBar.getAssociateValueListsCalled()){v.alr_visualFilterBar.setAssociateValueListsCalled(true)}v.oSmartFilterbar.associateValueLists()}var t=v.oIappStateHandler.onSmartFilterBarInitialized();t.then(function(){v._bIsStartingUp=false;if(v.bVisualFilterInitialised){v.oIappStateHandler.fnUpdateVisualFilterBar()}if(v.sNavType!==sap.ui.generic.app.navigation.service.NavType.iAppState){v.oIappStateHandler.fnStoreCurrentAppStateAndAdjustURL()}},function(e){if(e instanceof Error){e.showMessageBox()}v.oIappStateHandler.fnOnError();v._bIsStartingUp=false}).finally(function(){if(v.oSmartFilterableKPI){var e=v.oSmartFilterableKPI.getContent();e.forEach(function(e){if(e.getSmartFilterId){e._bStopDataLoad=false;e._updateKpiList(true)}})}})}function q(e){var t=e.getSource(),a=e.getParameters().limitReached,r=t.getSelectedIndices(),n,i;if(r.length>0){if(a){n="Your last selection was limited to the maximum of "+t.getLimit()+" items.";m.oServices.oApplication.showMessageToast(n)}}i=t.getParent();m.oCommonUtils.setEnabledToolbarButtons(i)}function W(e){var t=e.getParameters();var a=e.getSource();m.oCommonEventHandlers.onSemanticObjectLinkNavigationPressed(a,t)}function J(e){var t,a;t=e.getParameters();a=e.getSource();m.oCommonEventHandlers.onSemanticObjectLinkNavigationTargetObtained(a.getEntitySet(),a.getFieldSemanticObjectMap(),t,v)}function Q(e){var t=v.oSmartFilterbar;var a=[];if(e.fetchVariant()&&e.fetchVariant().filter&&e.fetchVariant().filter.filterItems){a=e.fetchVariant().filter.filterItems}var r={search:!!t.getBasicSearchValue(),filter:!!(a.length||t.retrieveFiltersWithValues().length)};return r}function X(e){var t=e.getId();var a=Q(e);var r="";if(a.search||a.filter){r=m.oCommonUtils.getContextText("NOITEMS_SMARTCHART_WITH_FILTER",t)}else{r=m.oCommonUtils.getContextText("NOITEMS_SMARTCHART",t)}e.getChartAsync().then(function(e){e.setCustomMessages({NO_DATA:r})})}function $(e){var t={sharePageToPressed:function(e){var t=m.oServices.oApplication.getBusyHelper();if(t.isBusy()){return}var a=m.oServices.oApplication.getAppTitle();var r=P.getCurrentUrl().then(function(t){switch(e){case"Email":a=m.oCommonUtils.getText("EMAIL_HEADER",[a]);sap.m.URLHelper.triggerEmail(null,a,t);break;default:break}});t.setBusy(r)},shareJamPressed:function(){P.openJamShareDialog(m.oServices.oApplication.getAppTitle())},shareTilePressed:function(){P.fireBookMarkPress()},getDownloadUrl:function(){var e=v.oSmartTable.getTable();var t=e.getBinding("rows")||e.getBinding("items");return t&&t.getDownloadUrl()||""},getServiceUrl:function(){return v.oSmartFilterbar.hasDateRangeTypeFieldsWithValue().then(function(e){var a=e?"":t.getDownloadUrl();a=a&&a+"&$top=0&$inlinecount=allpages";var r={serviceUrl:a};C.onSaveAsTileExtension(r);return r.serviceUrl})},getModelData:function(){var e=T.get("sap.ushell.Container.getUser");var a=C.getOwnerComponent().getAppComponent().getMetadata();var r=a.getManifestEntry("sap.ui");var n=a.getManifestEntry("sap.app");return t.getServiceUrl().then(function(t){return P.getCurrentUrl().then(function(a){return{serviceUrl:t,icon:r&&r.icons?r.icons.icon:"",title:n?n.title:"",isShareInJamActive:!!e&&e().isJamActive(),customUrl:P.getCustomUrl(),currentUrl:a}})})}};P.openSharePopup(m.oCommonUtils,e,t)}return{onInit:function(){var e=C.getOwnerComponent();U.setLevel(L.WARNING,"ALPSmartFilterBar");var t=e.getModel("_templPriv");t.setProperty("/alp",{filterMode:e.getHideVisualFilter()?K:e.getDefaultFilterMode(),contentView:e.getDefaultContentView(),autoHide:e.getAutoHide(),visibility:{hybridView:c.system.phone||c.system.tablet&&!c.system.desktop?false:true},filterChanged:false});v.hideVisualFilter=e.getHideVisualFilter();v.hideVisualFilter=v.hideVisualFilter===undefined||v.hideVisualFilter!==true?false:true;v.quickVariantSelectionX=e.getQuickVariantSelectionX();v.oSmartFilterbar=C.byId("template::SmartFilterBar");v.oSmartTable=C.byId("table");v.oSmartFilterableKPI=C.byId("template::KPITagContainer::filterableKPIs");v.oPage=C.byId("template::Page");v.oSmartChart=C.byId("chart");var i=new D(v,C,m);v.oMultipleViewsHandler=i;v.oMessageStripHelper=new M(m.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(v.oSmartTable),i,C,m,"alp");if(C.getOwnerComponent().getProperty("dshQueryName")){v.oAnalyticGridContainer=C.byId("template::AnalyticGridContainer");v.oAnalyticGridController=new o;v.oAnalyticGridController.setState(v)}v.alr_compactFilterContainer=C.byId("template::CompactFilterContainer");v.alr_visualFilterContainer=C.byId("template::VisualFilterContainer");v.alr_filterContainer=C.byId("template::FilterContainer");v.alr_visualFilterBar=C.byId("template::VisualFilterBar");var s="";if(v.quickVariantSelectionX){s=i.getSelectedKey()}var g=B.getStableId({type:"ALPTable",subType:"ColumnListItem",sQuickVariantKey:s});v.alp_ColumnListItem=C.byId(g);if(v.alr_visualFilterBar){var p=e.getFilterSettings();if(p&&Object.keys(p).length>0){v.alr_visualFilterBar.setFilterSettings(p)}v.alr_visualFilterBar.setSmartFilterId(v.oSmartFilterbar.getId());v.alr_visualFilterBar.attachOnFilterItemAdded(function(e){var t=e.getParameters();t.attachBeforeRebindVisualFilter(function(e){var t=e.getParameters();var a=t.sEntityType;var r=t.sDimension;var n=t.sMeasure;var i=t.oContext;var o=v.oController;o.onBeforeRebindVisualFilterExtension(a,r,n,i)})})}v.oKpiTagContainer=C.byId("template::KPITagContainer::globalKPIs");v.oFilterableKpiTagContainer=C.byId("template::KPITagContainer::filterableKPIs");if(v.oKpiTagContainer||v.oFilterableKpiTagContainer){sap.ui.require(["sap/suite/ui/generic/template/AnalyticalListPage/controller/KpiTagController"],function(e){e.init(v)})}v.oContentArea=new d;v.oTemplateUtils=m;v.toolbarController=new r;v.oController=C;v.filterBarController=new a;v.filterBarController.init(v);v.oContentArea.createAndSetCustomModel(v);v.oMultipleViewsHandler.getInitializationPromise().then(function(){v.oContentArea.setState(v)});if(!v.hideVisualFilter){v.visualFilterBarContainer=new n;v.visualFilterBarContainer.init(v)}if(v.alr_visualFilterBar){v.alr_visualFilterBar.addEventDelegate({onAfterRendering:function(){if(v.oSmartFilterbar.isInitialised()){v.oSmartFilterbar.setFilterData({_CUSTOM:v.oIappStateHandler.getFilterState()})}}})}v.oIappStateHandler=new u(v,C,m);H();C.byId("template::FilterText").attachBrowserEvent("click",function(){C.byId("template::Page").setHeaderExpanded(true)});t.setProperty("/listReport/isHeaderExpanded",true);t.setProperty("/generic/bDataAreShownInChart",false);if(v.oSmartTable){var S=v.oSmartTable.getTable()}var F="sapUiSizeCozy",T="sapUiSizeCompact",P="sapUiSizeCondensed";if(b.isUiTable(S)||S instanceof l){var I=C.getView();var E=document.body;if(E.classList.contains(F)||I.hasStyleClass(F)){v.oSmartTable.addStyleClass(F)}else if(E.classList.contains(T)||I.hasStyleClass(T)){var _=e.getCondensedTableLayout();if(_===false){v.oSmartTable.addStyleClass(T)}else{v.oSmartTable.addStyleClass(P)}}}if(v.oSmartFilterableKPI){v.oSmartFilterableKPI.setModel(e.getModel("_templPriv"),"_templPriv");var V=v.oSmartFilterableKPI.getContent(),w=v.oController;V.forEach(function(e){if(e.getSmartFilterId){e.attachBeforeRebindFilterableKPI(function(e){var t=e.getParameters(),a=t.selectionVariant,r=t.entityType,n=e.getSource().getId();w.onBeforeRebindFilterableKPIExtension(a,r,n)},w)}})}f.getUrlParameterInfo=function(){return v.oIappStateHandler.getUrlParameterInfo()};f.onComponentActivate=function(){};f.refreshBinding=function(){if(v.alr_visualFilterBar&&v.alr_visualFilterBar.updateVisualFilterBindings){v.alr_visualFilterBar.updateVisualFilterBindings()}if(v.oSmartChart&&v.oSmartChart.rebindChart){v.oSmartChart.rebindChart()}if(v.oSmartTable){m.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(v.oSmartTable).refresh()}if(v.oKpiTagContainer){var e=v.oKpiTagContainer.mAggregations.content;for(var t in e){if(e[t]._createGlobalKpi){e[t]._createGlobalKpi()}}}if(v.oFilterableKpiTagContainer){var e=v.oFilterableKpiTagContainer.mAggregations.content;for(var t in e){if(e[t]._createFilterableKpi){e[t]._createFilterableKpi()}}}y()};f.onSuspend=function(){y(true)};f.onRestore=function(){if(v.nRefreshInterval){h(v.nRefreshInterval)}};if(v.alr_visualFilterBar){v.alr_visualFilterBar.attachInitialized(function(e){v.bVisualFilterInitialised=true;if(!v._bIsStartingUp){v.oIappStateHandler.fnUpdateVisualFilterBar(true)}})}v.oSmartFilterbar.attachFilterChange(function(t){var a=e.getModel("_templPriv");v.oIappStateHandler.fnCheckMandatory();var r=v.oSmartFilterbar.isDialogOpen();var n=t.getSource(),i;i=A({},n.getFilterData(true));if(r&&v.visualFilterDialogContainer){var o=v.visualFilterDialogContainer.oVerticalBox.getModel("_dialogFilter");o.setData(i)}else{var l=v.oController.getOwnerComponent().getModel("_filter");l.setData(i)}if(t.getParameters().filterItem){if(!v.hideVisualFilter){v.filterBarController.changeVisibility(t)}a.setProperty("/alp/_ignoreChartSelections",false)}v.filterBarController._updateFilterLink();if(!v.oSmartFilterbar.isLiveMode()&&!v.oSmartFilterbar.isDialogOpen()){a.setProperty("/alp/filterChanged",true)}});var I=C.getView();var E=document.body;var R,O;if(E.classList.contains(F)||I.hasStyleClass(F)){R=true}if(R&&e.getTableType()!=="ResponsiveTable"){var x=e.getModel("_templPriv");if(c.resize.height<=k){O=x.getProperty("/alp/contentView");x.setProperty("/alp/enableHybridMode",false);x.setProperty("/alp/contentView",O==="charttable"?"chart":O)}v.resizeHandler=function(e){var t=e.height;if(t<=k){O=x.getProperty("/alp/contentView");x.setProperty("/alp/enableHybridMode",false);x.setProperty("/alp/contentView",O==="charttable"?"chart":O)}else{x.setProperty("/alp/enableHybridMode",true)}};c.resize.attachHandler(v.resizeHandler)}if(e.getRefreshIntervalInMinutes()){v.nRefreshInterval=e.getRefreshIntervalInMinutes();v.nRefreshInterval=(v.nRefreshInterval<1?1:v.nRefreshInterval)*6e4}var N=C.byId(B.getStableId({type:"ALPAction",subType:"Share"})+"-internalBtn");if(N){N.attachPress(function(){$(N)})}},attachRefreshInterval:h,clearingRefreshTimerInterval:y,onExit:function(){if(v.resizeHandler){c.resize.detachHandler(v.resizeHandler)}if(v.oRefreshTimer!==null){clearTimeout(v.oRefreshTimer)}},handlers:{onBack:function(){m.oServices.oNavigationController.navigateBack()},onSmartTableInit:function(e){var t=e.getSource(),a=t.getCustomToolbar(),r=a.getContent(),n;t.setHeight("100%");m.oCommonUtils.checkToolbarIntentsSupported(t);if(v._pendingTableToolbarInit){if(!v.oSmartFilterableKPI&&!v.oMultipleViewsHandler.getMode()){a.insertContent(v.alr_viewSwitchButtonOnTable,r.length)}}if(v._pendingTableToolbarInit){for(var i=0;i<r.length;i++){if(r[i].mProperties.text==="Settings"){n=i}}a.insertContent(v._autoHideToggleBtn,n)}delete v._pendingTableToolbarInit;t.attachShowOverlay(function(e){t.getCustomToolbar().setEnabled(!e.getParameter("overlay").show)});var o=new _({highlightMode:"rebindTable"});t.setModel(o,"_tableHighlight")},onBeforeRebindTable:function(e){var t=e.getSource();var a=t&&t.fetchVariant();var r=e.getParameter("bindingParams");v.oMessageStripHelper.onBeforeRebindControl(e);if(v.chartController&&v.chartController.oChart){var n=v.chartController.oChart,i=v.chartController._chartInfo;i.drillStack=v.chartController.oChart.getDrillStack();var o=i.drillStack&&i.drillStack.length>0?i.drillStack[i.drillStack.length-1]:undefined}if(!a){return}var l=C.getOwnerComponent().getModel("_templPriv");var s=l.getProperty("/alp/contentView");if(s===x){r.preventTableBind=true;S=true}var g=l.getProperty("/alp/_ignoreChartSelections");if(v.detailController.isFilter()&&v.oSmartChart&&!g){v.detailController._applyChartSelectionOnTableAsFilter(e,n)}if(v.detailController.isFilter()&&o&&o.filter){r.filters.push(o.filter)}var d=[];var u=t.getTable().getColumns();for(var c=0;c<u.length;c++){var p=u[c];if(p.getGrouped&&p.getGrouped()){d.push(p.getLeadingProperty?p.getLeadingProperty():V.getColumnKey(p))}}v.detailController._updateExpandLevelInfo(d);if(C.getOwnerComponent().getModel().getDefaultCountMode()==="None"&&t._isAnalyticalTable){r.parameters.provideTotalResultSize=false;t.setShowRowCount(false)}C.onBeforeRebindTableExtension(e);v.oMultipleViewsHandler.aTableFilters=A({},r.filters);var f=r.events.refresh||Function.prototype;r.events.refresh=function(e){v.oMultipleViewsHandler.onDataRequested();f.call(this,e)};var F=r.events.dataRequested||Function.prototype;r.events.dataRequested=function(e){v.detailController.onSmartTableDataRequested(t);F.call(this,e)};var b=r.events.dataReceived||Function.prototype;r.events.dataReceived=function(e){v.oContentArea.enableToolbar();m.oCommonEventHandlers.onDataReceived(t);m.oComponentUtils.hidePlaceholder();b.call(this,e)};m.oCommonEventHandlers.onBeforeRebindTable(e,{setBindingPath:t.setTableBindingPath.bind(t),ensureExtensionFields:C.templateBaseExtension.ensureFieldsForSelect,addExtensionFilters:C.templateBaseExtension.addFilters,resolveParamaterizedEntitySet:v.oMultipleViewsHandler.resolveParameterizedEntitySet,isMandatoryFiltersRequired:false,isFieldControlRequired:false,isPopinWithoutHeader:false,isDataFieldForActionRequired:false,isFieldControlsPathRequired:false});var h=r.filters.slice(0);v.oMultipleViewsHandler.onRebindContentControl(r,h);t.getModel("_tableHighlight")&&t.getModel("_tableHighlight").setProperty("/highlightMode","rebindTable");v.detailController._applyCriticalityInfo(e,t);E.handleErrorsOnTableOrChart(m,e,v)},onSelectionDetailsActionPress:function(e){v.oMultipleViewsHandler.onDetailsActionPress(e)},addEntry:function(e){var t=e.getSource();m.oCommonEventHandlers.addEntry(t,false,v.oSmartFilterbar)},deleteEntries:function(e){m.oCommonEventHandlers.deleteEntries(e)},onSelectionChange:function(e){var t=e.getSource(),a=t.getModel(),r=t.getModel("_templPriv");var n=a.getMetaModel(),i=n.getODataEntitySet(this.getOwnerComponent().getEntitySet()),o=i["Org.OData.Capabilities.V1.DeleteRestrictions"];var l=o&&o.Deletable&&o.Deletable.Path?o.Deletable.Path:"";var s=false;var g=true;var d=l&&l!=="";var u=m.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(m.oCommonUtils.getOwnerPresentationControl(t)).getSelectedContexts();if(u.length>0){for(var c=0;c<u.length;c++){var p=a.getObject(u[c].getPath());if(!(p.IsActiveEntity&&p.HasDraftEntity&&p.DraftAdministrativeData&&p.DraftAdministrativeData.InProcessByUser)){g=false}if(d){if(a.getProperty(l,u[c])){d=false}}if(!g&&!d){s=true;break}}}r.setProperty("/listReport/deleteEnabled",s)},onMultiSelectionChange:q,onChange:function(e){m.oCommonEventHandlers.onChange(e)},onContactDetails:function(e){m.oCommonEventHandlers.onContactDetails(e)},onSmartFilterBarInitialise:z,onSmartFilterBarInitialized:G,onEditStateFilterChanged:function(e){e.getSource().fireChange()},onFilterPress:function(e){v.filterBarController.showDialog.call(v.filterBarController)},onClearPress:function(e){v.filterBarController.clearFilters();C.onClearFilterExtension(e)},onGoPress:function(e){v.filterBarController.fnCheckMandatory();var t=v.oSmartFilterbar.isDialogOpen();if(!t){v.filterBarController.onGoFilter()}},onBeforeSFBVariantSave:function(){if(v.oSmartFilterbar.isDialogOpen()&&!v.hideVisualFilter){v.visualFilterDialogContainer._updateFilterBarFromDialog.call(v.visualFilterDialogContainer)}var e=v.oIappStateHandler.getCurrentAppState();if(!this.getOwnerComponent().getProperty("smartVariantManagement")){delete e.customData["sap.suite.ui.generic.template.genericData"].contentView}var t=v.oSmartFilterbar.getFilterData(true);var a,r=v.oSmartFilterbar.getBasicSearchControl();if(r&&r.getValue){a=r.getValue()}t._CUSTOM=e.customData;v.oSmartFilterbar.setFilterData(t,true);if(a){v.oSmartFilterbar.getBasicSearchControl().setValue(a)}v.oSmartFilterbar.fireFilterChange()},onAfterSFBVariantLoad:function(e){if(!v.oSmartFilterbar.isDialogOpen()){v.filterBarController._afterSFBVariantLoad();if(v.oSmartFilterableKPI&&!v.oSmartFilterbar.isLiveMode()){var t=v.oSmartFilterableKPI.getContent();t.forEach(function(t){if(t.getSmartFilterId){if(e.getParameter("executeOnSelect")){t.bSearchTriggred=true}}})}}},onBeforeRebindChart:function(e){var t=e.getSource();X(t);var a=e.getParameters().bindingParams;v.oMultipleViewsHandler.aTableFilters=A({},a.filters);var r=a.filters.slice(0);var n={setBindingPath:t.setChartBindingPath.bind(t),ensureExtensionFields:Function.prototype,addExtensionFilters:C.templateBaseExtension.addFilters,resolveParamaterizedEntitySet:v.oMultipleViewsHandler.resolveParameterizedEntitySet,isFieldControlRequired:false,isMandatoryFiltersRequired:true};C.onBeforeRebindChartExtension(e);var i=a.events.dataReceived||Function.prototype;a.events.dataReceived=function(e){if(!t.getToolbar().getEnabled()){v.oContentArea.enableToolbar()}m.oComponentUtils.hidePlaceholder();i.call(this,e)};m.oCommonUtils.onBeforeRebindTableOrChart(e,n,v.oSmartFilterbar);v.oMultipleViewsHandler.onRebindContentControl(a,r);E.handleErrorsOnTableOrChart(m,e,v)},onListNavigate:function(e){m.oCommonEventHandlers.onListNavigate(e,v)},onCallActionFromToolBar:function(e){var t=m.oCommonUtils.getParentTable;m.oCommonUtils.getParentTable=function(){return v.oSmartTable};m.oCommonEventHandlers.onCallActionFromToolBar(e,v);m.oCommonUtils.getParentTable=t;t=null},onCallActionFromList:function(e){},onDataFieldForIntentBasedNavigation:function(e){m.oCommonEventHandlers.onDataFieldForIntentBasedNavigation(e,v)},onDataFieldWithIntentBasedNavigation:function(e){m.oCommonEventHandlers.onDataFieldWithIntentBasedNavigation(e,v)},onBeforeSemanticObjectLinkPopoverOpens:function(e){var t=e.getSource();var a=v.oSmartFilterbar.getUiState({allFilters:false}).getSelectionVariant();if(v.oSmartFilterbar.getEntitySet()!==t.getEntitySet()){a.FilterContextUrl=m.oServices.oApplication.getNavigationHandler().constructContextUrl(t.getEntitySet(),t.getModel())}var r=JSON.stringify(a);m.oCommonUtils.semanticObjectLinkNavigation(e,r,C)},onAssignedFiltersChanged:function(e){if(e&&e.getSource()){if(v&&v.oSmartFilterbar&&v.filterBarController){C.byId("template::FilterText").setText(v.oSmartFilterbar.retrieveFiltersWithValuesAsText())}}},onToggleFiltersPressed:function(){var e=C.getOwnerComponent();var t=e.getModel("_templPriv");t.setProperty("/listReport/isHeaderExpanded",t.getProperty("/listReport/isHeaderExpanded")===true?false:true)},onSearchButtonPressed:function(){if(c.system.phone&&v.oPage.getHeaderExpanded()){v.oPage.setHeaderExpanded(false)}var e=C.getOwnerComponent().getModel();v.oController.getOwnerComponent().getModel("_templPriv").setProperty("/alp/filterChanged",false);v.oController.getOwnerComponent().getModel("_templPriv").setProperty("/generic/bDataAreShownInChart",true);e.attachEventOnce("requestSent",function(){if(!v._bIsStartingUp){v.oIappStateHandler.fnStoreCurrentAppStateAndAdjustURL()}else{v.oIappStateHandler.fnResolveStartUpPromise()}});v.oController.getOwnerComponent().getModel("_templPriv").setProperty("/alp/_ignoreChartSelections",true);if(v.oSmartTable){m.oCommonUtils.refreshModel(v.oSmartTable.getEntitySet())}else{m.oCommonUtils.refreshModel(v.oSmartChart.getEntitySet())}y()},onSemanticObjectLinkNavigationPressed:W,onSemanticObjectLinkNavigationTargetObtained:J,onAfterTableVariantSave:function(){v.oIappStateHandler.fnStoreCurrentAppStateAndAdjustURL()},onAfterApplyTableVariant:function(){v.oIappStateHandler.fnStoreCurrentAppStateAndAdjustURL()},onAfterChartVariantSave:function(e){v.oIappStateHandler.fnStoreCurrentAppStateAndAdjustURL();m.oCommonUtils.setEnabledToolbarButtons(e.getSource())},onAfterApplyChartVariant:function(){v.oIappStateHandler.fnStoreCurrentAppStateAndAdjustURL()},onFilterModeSegmentedButtonChange:function(e){v.filterBarController.handleFilterSwitch(e.getParameter("key"),e.oSource._bApplyingVariant);v.oController._templateEventHandlers.onSegmentButtonPressed();v.filterBarController.fnCheckMandatory()},onContentViewSegmentButtonPressed:function(e){if(e.getParameter("key")==="crosstable"&&!v.oAnalyticGrid){v.oAnalyticGridController.initAnalyticGrid()}var t=e.getSource().getSelectedKey();if((t==="table"||t==="charttable")&&S){v.oSmartTable.rebindTable();S=false}if(!v.oSmartFilterableKPI&&!v.oController.getOwnerComponent().getContentTitle()){var a=v.oController.getView(),r;if(t==="customview1"){r="template::contentViewExtensionToolbar"}else if(t==="customview2"){r="template::contentViewExtension2Toolbar"}else if(t==="chart"||t==="charttable"){r=a.byId("template::masterViewExtensionToolbar")?"template::masterViewExtensionToolbar":"template::ChartToolbar"}else if(t==="table"){r="template::TableToolbar"}v.oController._templateEventHandlers.setFocusOnContentViewSegmentedButtonItem(a,r)}v.oController._templateEventHandlers.onSegmentButtonPressed(!v.oController.getOwnerComponent().getProperty("smartVariantManagement"))},setFocusOnContentViewSegmentedButtonItem:function(e,t){var a=e.byId(t);if(a){var r=a.getContent().length,n=a.getContent()[r-1];if(n){n.addEventDelegate({onAfterRendering:function(e){e.srcControl.focus()}})}}},onSegmentButtonPressed:function(e){if(!e){v.oController.byId("template::PageVariant").currentVariantSetModified(true);v.oSmartFilterbar.setFilterData({_CUSTOM:v.oIappStateHandler.getFilterState()})}v.oIappStateHandler.fnStoreCurrentAppStateAndAdjustURL()},onShareListReportActionButtonPress:function(e){m.oCommonUtils.executeIfControlReady($,B.getStableId({type:"ALPAction",subType:"Share"})+"-internalBtn")},onDeterminingDataFieldForAction:function(e){var t=v.oController.getOwnerComponent().getModel("_templPriv");var a=t.getProperty("/alp/contentView");var r=m.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(a===x?v.oSmartChart:v.oSmartTable);m.oCommonEventHandlers.onDeterminingDataFieldForAction(e,r)},onDeterminingDataFieldForIntentBasedNavigation:function(e){var t=e.getSource();var a=v.oController.getOwnerComponent().getModel("_templPriv");var r=a.getProperty("/alp/contentView");var n=m.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(r===x?v.oSmartChart:v.oSmartTable).getSelectedContexts();m.oCommonEventHandlers.onDeterminingDataFieldForIntentBasedNavigation(t,n,v.oSmartFilterbar)},onInlineDataFieldForAction:function(e){m.oCommonEventHandlers.onInlineDataFieldForAction(e)},onInlineDataFieldForIntentBasedNavigation:function(e){m.oCommonEventHandlers.onInlineDataFieldForIntentBasedNavigation(e.getSource(),v)},onAutoHideToggle:function(){v.oSmartTable.getModel("_tableHighlight").setProperty("/highlightMode","eyeModeSwitch");v.chartController&&v.chartController._updateTable();v.oIappStateHandler.fnStoreCurrentAppStateAndAdjustURL()},onFullScreenToggled:function(e){var t=e.getParameter("fullScreen");var a=e.getSource().getModel("_templPriv");a.setProperty("/alp/fullScreen",t)},onDialogClosed:function(e){v.visualFilterDialogContainer._closeDialog.call(v.visualFilterDialogContainer,e)},onDialogOpened:function(e){if(!v.visualFilterDialogContainer){v.visualFilterDialogContainer=new i;v.visualFilterDialogContainer.init(v)}var t=v.oController.getView().getModel("_templPriv"),a=N,r={},n;n=t.getProperty("/alp/searchable");if(!n){if(v.alr_visualFilterBar&&!v.alr_visualFilterBar.getAssociateValueListsCalled()){v.alr_visualFilterBar.setAssociateValueListsCalled(true);v.oSmartFilterbar.associateValueLists()}}r.item=new p({icon:"sap-icon://filter-analytics",tooltip:"{i18n>FILTER_VISUAL}",key:a,enabled:"{_templPriv>/alp/searchable}"});r.selectionChange=function(e){v.visualFilterDialogContainer._toggle.call(v.visualFilterDialogContainer,e)};r.content=v.visualFilterDialogContainer._createForm();r.search=function(e){v.visualFilterDialogContainer._triggerSearchInFilterDialog.call(v.visualFilterDialogContainer,e)};r.filterSelect=function(e){v.visualFilterDialogContainer._triggerDropdownSearch.call(v.visualFilterDialogContainer,e)};v.oSmartFilterbar.addAdaptFilterDialogCustomContent(r)},onSearchForFilters:function(e){v.visualFilterDialogContainer._triggerSearchInFilterDialog.call(v.visualFilterDialogContainer,e)},onDialogSearch:function(e){v.visualFilterDialogContainer._searchDialog.call(v.visualFilterDialogContainer)},onDialogClear:function(e){C.onClearFilterExtension(e)},onRestore:function(e){v.visualFilterDialogContainer._restoreDialog.call(v.visualFilterDialogContainer)},onDialogCancel:function(e){v.visualFilterDialogContainer._cancelDialog.call(v.visualFilterDialogContainer)},onRowSelectionChange:function(e){var t=e.getSource();m.oCommonUtils.setEnabledToolbarButtons(t)},dataStateFilter:function(e,t){return v.oMessageStripHelper.dataStateFilter(e,t)},dataStateClose:function(){v.oMessageStripHelper.onClose()},onAddCardsToRepository:function(e){var t=m.oServices.oPresentationControlHandlerFactory.getPresentationControlHandler(v.oSmartChart);var a=v.oController.getOwnerComponent();var r=t.getModel();var n=t.getEntitySet();var i=v.oController.getView();var o=r.getMetaModel().getODataEntitySet(n);var l=r.getMetaModel().getODataEntityType(o.entityType);var s=a.getModel("i18n").getResourceBundle();var g={};if(v.oSmartFilterbar.getUiState().getSemanticDates()){R.error(s.getText("ST_CARD_CREATION_FAILURE"),{onClose:function(){throw new Error("Insights is not supported")},details:"<strong>"+s.getText("ST_CARD_POSSIBLE_CAUSES")+"</strong>"+"<ul>"+"<li>"+s.getText("ST_CARD_FAILURE_REASON_DATE_RANGE_FILTERS")+"</li>"+"<li>"+s.getText("ST_CARD_FAILURE_CHART_REASON_CHART_LEVEL_FILTERS")+"</li>"+"</ul>"+s.getText("ST_CARD_FOOTER_INFO")})}else{g["currentControlHandler"]=t;g["component"]=a;g["view"]=i;g["entitySet"]=o;g["entityType"]=l;g["oSmartFilterbar"]=v.oSmartFilterbar;g["oTemplateUtils"]=m;var d=w.createCardForPreview(g);var u=m.oComponentUtils.getTemplatePrivateModel();var c=u.getProperty("/oInsightsInstance");c.showCardPreview(d,true)}},onBeforeExport:function(e){m.oCommonEventHandlers.onBeforeExport(e)}},formatters:{formatItemTextForMultipleView:function(e){return v.oMultipleViewsHandler?v.oMultipleViewsHandler.formatItemTextForMultipleView(e):""},formatMessageStrip:function(e,t){return v.oMultipleViewsHandler?v.oMultipleViewsHandler.formatMessageStrip(e,t):""}},extensionAPI:new t(m,C,v)}}}});
//# sourceMappingURL=ControllerImplementation.js.map
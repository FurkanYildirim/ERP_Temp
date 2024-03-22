/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/KPIManagement", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/MessageStrip", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/fe/core/PageController", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/templates/ListReport/ExtensionAPI", "sap/fe/templates/TableScroller", "sap/ui/base/ManagedObject", "sap/ui/core/mvc/OverrideExecution", "sap/ui/Device", "sap/ui/mdc/p13n/StateUtil", "sap/ui/thirdparty/hasher", "./ListReportTemplating", "./overrides/IntentBasedNavigation", "./overrides/Share", "./overrides/ViewState"], function (Log, ObjectPath, ActionRuntime, CommonUtils, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, KPIManagement, MassEdit, Placeholder, Share, SideEffects, ViewState, ClassSupport, DeleteHelper, EditState, MessageStrip, ResourceModelHelper, StableIdHelper, CoreLibrary, PageController, ChartUtils, CommonHelper, DelegateUtil, FilterUtils, ExtensionAPI, TableScroller, ManagedObject, OverrideExecution, Device, StateUtil, hasher, ListReportTemplating, IntentBasedNavigationOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9;
  var system = Device.system;
  var bindingParser = ManagedObject.bindingParser;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const TemplateContentView = CoreLibrary.TemplateContentView,
    InitialLoadMode = CoreLibrary.InitialLoadMode;

  /**
   * Controller class for the list report page, used inside an SAP Fiori elements application.
   *
   * @hideconstructor
   * @public
   */
  let ListReportController = (_dec = defineUI5Class("sap.fe.templates.ListReport.ListReportController"), _dec2 = usingExtension(InternalRouting.override({
    onAfterBinding: function () {
      this.getView().getController()._onAfterBinding();
    }
  })), _dec3 = usingExtension(InternalIntentBasedNavigation.override({
    getEntitySet: function () {
      return this.base.getCurrentEntitySet();
    }
  })), _dec4 = usingExtension(SideEffects), _dec5 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec6 = usingExtension(Share.override(ShareOverrides)), _dec7 = usingExtension(ViewState.override(ViewStateOverrides)), _dec8 = usingExtension(KPIManagement), _dec9 = usingExtension(Placeholder), _dec10 = usingExtension(MassEdit), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = privateExtension(), _dec14 = extensible(OverrideExecution.After), _dec15 = publicExtension(), _dec16 = extensible(OverrideExecution.After), _dec17 = publicExtension(), _dec18 = extensible(OverrideExecution.After), _dec19 = publicExtension(), _dec20 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ListReportController, _PageController);
    function ListReportController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "_routing", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "sideEffects", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "kpiManagement", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "placeholder", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor9, _assertThisInitialized(_this));
      _this.formatters = {
        setALPControlMessageStrip(aIgnoredFields, bIsChart, oApplySupported) {
          let sText = "";
          bIsChart = bIsChart === "true" || bIsChart === true;
          const oFilterBar = this._getFilterBarControl();
          if (oFilterBar && Array.isArray(aIgnoredFields) && aIgnoredFields.length > 0 && bIsChart) {
            const aIgnoredLabels = MessageStrip.getLabels(aIgnoredFields, oFilterBar.data("entityType"), oFilterBar, getResourceModel(oFilterBar));
            const bIsSearchIgnored = !oApplySupported.enableSearch;
            sText = bIsChart ? MessageStrip.getALPText(aIgnoredLabels, oFilterBar, bIsSearchIgnored) : MessageStrip.getText(aIgnoredLabels, oFilterBar, "");
            return sText;
          }
        }
      };
      _this.handlers = {
        onFilterSearch() {
          const filterBarAPI = this._getFilterBarControl().getParent();
          filterBarAPI.triggerSearch();
        },
        onFiltersChanged(oEvent) {
          const oFilterBar = this._getFilterBarControl();
          if (oFilterBar) {
            const oInternalModelContext = this.getView().getBindingContext("internal");
            // Pending filters into FilterBar to be used for custom views
            this.onPendingFilters();
            const appliedFiltersText = oFilterBar.getAssignedFiltersText().filtersText;
            const appliedFilterBinding = bindingParser(appliedFiltersText);
            if (appliedFilterBinding) {
              var _this$getView$byId;
              (_this$getView$byId = this.getView().byId("fe::appliedFiltersText")) === null || _this$getView$byId === void 0 ? void 0 : _this$getView$byId.bindText(appliedFilterBinding);
            } else {
              var _this$getView$byId2;
              (_this$getView$byId2 = this.getView().byId("fe::appliedFiltersText")) === null || _this$getView$byId2 === void 0 ? void 0 : _this$getView$byId2.setText(appliedFiltersText);
            }
            if (oInternalModelContext && oEvent.getParameter("conditionsBased")) {
              oInternalModelContext.setProperty("hasPendingFilters", true);
            }
          }
        },
        onVariantSelected(oEvent) {
          const oVM = oEvent.getSource();
          const currentVariantKey = oEvent.getParameter("key");
          const oMultiModeControl = this._getMultiModeControl();
          if (oMultiModeControl && !(oVM !== null && oVM !== void 0 && oVM.getParent().isA("sap.ui.mdc.ActionToolbar"))) {
            //Not a Control Variant
            oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.invalidateContent();
            oMultiModeControl === null || oMultiModeControl === void 0 ? void 0 : oMultiModeControl.setFreezeContent(true);
          }

          // setTimeout cause the variant needs to be applied before judging the auto search or updating the app state
          setTimeout(() => {
            if (this._shouldAutoTriggerSearch(oVM)) {
              // the app state will be updated via onSearch handler
              const filterBarAPI = this._getFilterBarControl().getParent();
              return filterBarAPI.triggerSearch();
            } else if (!this._getApplyAutomaticallyOnVariant(oVM, currentVariantKey)) {
              this.getExtensionAPI().updateAppState();
            }
          }, 0);
        },
        onVariantSaved() {
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save!!!
          setTimeout(() => {
            this.getExtensionAPI().updateAppState();
          }, 1000);
        },
        onSearch() {
          const oFilterBar = this._getFilterBarControl();
          const oInternalModelContext = this.getView().getBindingContext("internal");
          const oMdcChart = this.getChartControl();
          const bHideDraft = FilterUtils.getEditStateIsHideDraft(oFilterBar.getConditions());
          oInternalModelContext.setProperty("hasPendingFilters", false);
          oInternalModelContext.setProperty("hideDraftInfo", bHideDraft);
          if (!this._getMultiModeControl()) {
            this._updateALPNotApplicableFields(oInternalModelContext, oFilterBar);
          }
          if (oMdcChart) {
            // disable bound actions TODO: this clears everything for the chart?
            oMdcChart.getBindingContext("internal").setProperty("", {});
            const oPageInternalModelContext = oMdcChart.getBindingContext("pageInternal");
            const sTemplateContentView = oPageInternalModelContext.getProperty(`${oPageInternalModelContext.getPath()}/alpContentView`);
            if (sTemplateContentView === TemplateContentView.Chart) {
              this.hasPendingChartChanges = true;
            }
            if (sTemplateContentView === TemplateContentView.Table) {
              this.hasPendingTableChanges = true;
            }
          }
          // store filter bar conditions to use later while navigation
          StateUtil.retrieveExternalState(oFilterBar).then(oExternalState => {
            this.filterBarConditions = oExternalState.filter;
          }).catch(function (oError) {
            Log.error("Error while retrieving the external state", oError);
          });
          if (this.getView().getViewData().liveMode === false) {
            this.getExtensionAPI().updateAppState();
          }
          if (system.phone) {
            const oDynamicPage = this._getDynamicListReportControl();
            oDynamicPage.setHeaderExpanded(false);
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onChartSelectionChanged(oEvent) {
          const oMdcChart = oEvent.getSource().getContent(),
            oTable = this._getTable(),
            aData = oEvent.getParameter("data"),
            oInternalModelContext = this.getView().getBindingContext("internal");
          if (aData) {
            ChartUtils.setChartFilters(oMdcChart);
          }
          const sTemplateContentView = oInternalModelContext.getProperty(`${oInternalModelContext.getPath()}/alpContentView`);
          if (sTemplateContentView === TemplateContentView.Chart) {
            this.hasPendingChartChanges = true;
          } else if (oTable) {
            oTable.rebind();
            this.hasPendingChartChanges = false;
          }
        },
        onSegmentedButtonPressed(oEvent) {
          const sSelectedKey = oEvent.mParameters.key ? oEvent.mParameters.key : null;
          const oInternalModelContext = this.getView().getBindingContext("internal");
          oInternalModelContext.setProperty("alpContentView", sSelectedKey);
          const oChart = this.getChartControl();
          const oTable = this._getTable();
          const oSegmentedButtonDelegate = {
            onAfterRendering() {
              const aItems = oSegmentedButton.getItems();
              aItems.forEach(function (oItem) {
                if (oItem.getKey() === sSelectedKey) {
                  oItem.focus();
                }
              });
              oSegmentedButton.removeEventDelegate(oSegmentedButtonDelegate);
            }
          };
          const oSegmentedButton = sSelectedKey === TemplateContentView.Table ? this._getSegmentedButton("Table") : this._getSegmentedButton("Chart");
          if (oSegmentedButton !== oEvent.getSource()) {
            oSegmentedButton.addEventDelegate(oSegmentedButtonDelegate);
          }
          switch (sSelectedKey) {
            case TemplateContentView.Table:
              this._updateTable(oTable);
              break;
            case TemplateContentView.Chart:
              this._updateChart(oChart);
              break;
            case TemplateContentView.Hybrid:
              this._updateTable(oTable);
              this._updateChart(oChart);
              break;
            default:
              break;
          }
          this.getExtensionAPI().updateAppState();
        },
        onFiltersSegmentedButtonPressed(oEvent) {
          const isCompact = oEvent.getParameter("key") === "Compact";
          this._getFilterBarControl().setVisible(isCompact);
          this._getVisualFilterBarControl().setVisible(!isCompact);
        },
        onStateChange() {
          this.getExtensionAPI().updateAppState();
        },
        onDynamicPageTitleStateChanged(oEvent) {
          const filterBar = this._getFilterBarControl();
          if (filterBar && filterBar.getSegmentedButton()) {
            if (oEvent.getParameter("isExpanded")) {
              filterBar.getSegmentedButton().setVisible(true);
            } else {
              filterBar.getSegmentedButton().setVisible(false);
            }
          }
        }
      };
      return _this;
    }
    var _proto = ListReportController.prototype;
    /**
     * Get the extension API for the current page.
     *
     * @public
     * @returns The extension API.
     */
    _proto.getExtensionAPI = function getExtensionAPI() {
      if (!this.extensionAPI) {
        this.extensionAPI = new ExtensionAPI(this);
      }
      return this.extensionAPI;
    };
    _proto.onInit = function onInit() {
      PageController.prototype.onInit.apply(this);
      const oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext.setProperty("hasPendingFilters", true);
      oInternalModelContext.setProperty("hideDraftInfo", false);
      oInternalModelContext.setProperty("uom", {});
      oInternalModelContext.setProperty("scalefactor", {});
      oInternalModelContext.setProperty("scalefactorNumber", {});
      oInternalModelContext.setProperty("currency", {});
      if (this._hasMultiVisualizations()) {
        let alpContentView = this._getDefaultPath();
        if (!system.desktop && alpContentView === TemplateContentView.Hybrid) {
          alpContentView = TemplateContentView.Chart;
        }
        oInternalModelContext.setProperty("alpContentView", alpContentView);
      }

      // Store conditions from filter bar
      // this is later used before navigation to get conditions applied on the filter bar
      this.filterBarConditions = {};

      // As AppStateHandler.applyAppState triggers a navigation we want to make sure it will
      // happen after the routeMatch event has been processed (otherwise the router gets broken)
      this.getAppComponent().getRouterProxy().waitForRouteMatchBeforeNavigation();

      // Configure the initial load settings
      this._setInitLoad();
    };
    _proto.onExit = function onExit() {
      delete this.filterBarConditions;
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
    };
    _proto._onAfterBinding = function _onAfterBinding() {
      const aTables = this._getControls("table");
      if (EditState.isEditStateDirty()) {
        var _this$_getMultiModeCo, _this$_getTable;
        (_this$_getMultiModeCo = this._getMultiModeControl()) === null || _this$_getMultiModeCo === void 0 ? void 0 : _this$_getMultiModeCo.invalidateContent();
        const oTableBinding = (_this$_getTable = this._getTable()) === null || _this$_getTable === void 0 ? void 0 : _this$_getTable.getRowBinding();
        if (oTableBinding) {
          if (CommonUtils.getAppComponent(this.getView())._isFclEnabled()) {
            // there is an issue if we use a timeout with a kept alive context used on another page
            oTableBinding.refresh();
          } else {
            if (!this.sUpdateTimer) {
              this.sUpdateTimer = setTimeout(() => {
                oTableBinding.refresh();
                delete this.sUpdateTimer;
              }, 0);
            }

            // Update action enablement and visibility upon table data update.
            const fnUpdateTableActions = () => {
              this._updateTableActions(aTables);
              oTableBinding.detachDataReceived(fnUpdateTableActions);
            };
            oTableBinding.attachDataReceived(fnUpdateTableActions);
          }
        }
        EditState.setEditStateProcessed();
      }
      if (!this.sUpdateTimer) {
        this._updateTableActions(aTables);
      }
      const internalModelContext = this.getView().getBindingContext("internal");
      if (!internalModelContext.getProperty("initialVariantApplied")) {
        const viewId = this.getView().getId();
        this.pageReady.waitFor(this.getAppComponent().getAppStateHandler().applyAppState(viewId, this.getView()));
        internalModelContext.setProperty("initialVariantApplied", true);
      }
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      PageController.prototype.onBeforeRendering.apply(this);
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      if (mParameters.forceFocus) {
        this._setInitialFocus();
      }
      // Remove the handler on back navigation that displays Draft confirmation
      this.getAppComponent().getShellServices().setBackNavigation(undefined);
    }

    /**
     * Method called when the content of a custom view used in a list report needs to be refreshed.
     * This happens either when there is a change on the FilterBar and the search is triggered,
     * or when a tab with custom content is selected.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @param mParameters Map containing the filter conditions of the FilterBar, the currentTabID
     * and the view refresh cause (tabChanged or search).
     * The map looks like this:
     * <code><pre>
     * 	{
     * 		filterConditions: {
     * 			Country: [
     * 				{
     * 					operator: "EQ"
     *					validated: "NotValidated"
     *					values: ["Germany", ...]
     * 				},
     * 				...
     * 			]
     * 			...
     * 		},
     *		currentTabId: "fe::CustomTab::tab1",
     *		refreshCause: "tabChanged" | "search"
     *	}
     * </pre></code>
     * @public
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onViewNeedsRefresh = function onViewNeedsRefresh(mParameters) {
      /* To be overriden */
    }

    /**
     * Method called when a filter or search value has been changed in the FilterBar,
     * but has not been validated yet by the end user (with the 'Go' or 'Search' button).
     * Typically, the content of the current tab is greyed out until the filters are validated.
     * This method can be overwritten by the controller extension in case of customization.
     *
     * @public
     */;
    _proto.onPendingFilters = function onPendingFilters() {
      /* To be overriden */
    };
    _proto.getCurrentEntitySet = function getCurrentEntitySet() {
      var _this$_getTable2;
      return (_this$_getTable2 = this._getTable()) === null || _this$_getTable2 === void 0 ? void 0 : _this$_getTable2.data("targetCollectionPath").slice(1);
    }

    /**
     * Method called when the 'Clear' button on the FilterBar is pressed.
     *
     * @public
     */;
    _proto.onAfterClear = function onAfterClear() {
      /* To be overriden */
    }

    /**
     * This method initiates the update of the enabled state of the DataFieldForAction and the visible state of the DataFieldForIBN buttons.
     *
     * @param aTables Array of tables in the list report
     * @private
     */;
    _proto._updateTableActions = function _updateTableActions(aTables) {
      let aIBNActions = [];
      aTables.forEach(function (oTable) {
        aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);
        // Update 'enabled' property of DataFieldForAction buttons on table toolbar
        // The same is also performed on Table selectionChange event
        const oInternalModelContext = oTable.getBindingContext("internal"),
          oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap"))),
          aSelectedContexts = oTable.getSelectedContexts();
        oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
        oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
        // Refresh enablement of delete button
        DeleteHelper.updateDeleteInfoForSelectedContexts(oInternalModelContext, aSelectedContexts);
        ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
      });
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
    }

    /**
     * This method scrolls to a specific row on all the available tables.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_scrollTablesToRow
     * @param sRowPath The path of the table row context to be scrolled to
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      this._getControls("table").forEach(function (oTable) {
        TableScroller.scrollTableToRow(oTable, sRowPath);
      });
    }

    /**
     * This method sets the initial focus in a list report based on the User Experience guidelines.
     *
     * @function
     * @name sap.fe.templates.ListReport.ListReportController.controller#_setInitialFocus
     */;
    _proto._setInitialFocus = function _setInitialFocus() {
      const dynamicPage = this._getDynamicListReportControl(),
        isHeaderExpanded = dynamicPage.getHeaderExpanded(),
        filterBar = this._getFilterBarControl();
      if (filterBar) {
        //Enabling mandatory filter fields message dialog
        if (!filterBar.getShowMessages()) {
          filterBar.setShowMessages(true);
        }
        if (isHeaderExpanded) {
          const firstEmptyMandatoryField = filterBar.getFilterItems().find(function (oFilterItem) {
            return oFilterItem.getRequired() && oFilterItem.getConditions().length === 0;
          });
          //Focusing on the first empty mandatory filter field, or on the first filter field if the table data is loaded
          if (firstEmptyMandatoryField) {
            firstEmptyMandatoryField.focus();
          } else if (this._isInitLoadEnabled() && filterBar.getFilterItems().length > 0) {
            //BCP: 2380008406 Add check for available filterItems
            filterBar.getFilterItems()[0].focus();
          } else {
            var _this$getView$byId3;
            //Focusing on the Go button
            (_this$getView$byId3 = this.getView().byId(`${this._getFilterBarControlId()}-btnSearch`)) === null || _this$getView$byId3 === void 0 ? void 0 : _this$getView$byId3.focus();
          }
        } else if (this._isInitLoadEnabled()) {
          var _this$_getTable3;
          (_this$_getTable3 = this._getTable()) === null || _this$_getTable3 === void 0 ? void 0 : _this$_getTable3.focusRow(0).catch(function (error) {
            Log.error("Error while setting initial focus on the table ", error);
          });
        }
      } else {
        var _this$_getTable4;
        (_this$_getTable4 = this._getTable()) === null || _this$_getTable4 === void 0 ? void 0 : _this$_getTable4.focusRow(0).catch(function (error) {
          Log.error("Error while setting initial focus on the table ", error);
        });
      }
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const oManifestEntry = this.getAppComponent().getManifestEntry("sap.app");
      return {
        title: oManifestEntry.title,
        subtitle: oManifestEntry.subTitle || "",
        intent: "",
        icon: ""
      };
    };
    _proto._getFilterBarControl = function _getFilterBarControl() {
      return this.getView().byId(this._getFilterBarControlId());
    };
    _proto._getDynamicListReportControl = function _getDynamicListReportControl() {
      return this.getView().byId(this._getDynamicListReportControlId());
    };
    _proto._getAdaptationFilterBarControl = function _getAdaptationFilterBarControl() {
      // If the adaptation filter bar is part of the DOM tree, the "Adapt Filter" dialog is open,
      // and we return the adaptation filter bar as an active control (visible for the user)
      const adaptationFilterBar = this._getFilterBarControl().getInbuiltFilter();
      return adaptationFilterBar !== null && adaptationFilterBar !== void 0 && adaptationFilterBar.getParent() ? adaptationFilterBar : undefined;
    };
    _proto._getSegmentedButton = function _getSegmentedButton(sControl) {
      var _ref;
      const sSegmentedButtonId = (_ref = sControl === "Chart" ? this.getChartControl() : this._getTable()) === null || _ref === void 0 ? void 0 : _ref.data("segmentedButtonId");
      return this.getView().byId(sSegmentedButtonId);
    };
    _proto._getControlFromPageModelProperty = function _getControlFromPageModelProperty(sPath) {
      var _this$_getPageModel;
      const controlId = (_this$_getPageModel = this._getPageModel()) === null || _this$_getPageModel === void 0 ? void 0 : _this$_getPageModel.getProperty(sPath);
      return controlId && this.getView().byId(controlId);
    };
    _proto._getDynamicListReportControlId = function _getDynamicListReportControlId() {
      var _this$_getPageModel2;
      return ((_this$_getPageModel2 = this._getPageModel()) === null || _this$_getPageModel2 === void 0 ? void 0 : _this$_getPageModel2.getProperty("/dynamicListReportId")) || "";
    };
    _proto._getFilterBarControlId = function _getFilterBarControlId() {
      var _this$_getPageModel3;
      return ((_this$_getPageModel3 = this._getPageModel()) === null || _this$_getPageModel3 === void 0 ? void 0 : _this$_getPageModel3.getProperty("/filterBarId")) || "";
    };
    _proto.getChartControl = function getChartControl() {
      return this._getControlFromPageModelProperty("/singleChartId");
    };
    _proto._getVisualFilterBarControl = function _getVisualFilterBarControl() {
      const sVisualFilterBarId = StableIdHelper.generate(["visualFilter", this._getFilterBarControlId()]);
      return sVisualFilterBarId && this.getView().byId(sVisualFilterBarId);
    };
    _proto._getFilterBarVariantControl = function _getFilterBarVariantControl() {
      return this._getControlFromPageModelProperty("/variantManagement/id");
    };
    _proto._getMultiModeControl = function _getMultiModeControl() {
      return this.getView().byId("fe::TabMultipleMode::Control");
    };
    _proto._getTable = function _getTable() {
      if (this._isMultiMode()) {
        var _this$_getMultiModeCo2, _this$_getMultiModeCo3;
        const oControl = (_this$_getMultiModeCo2 = this._getMultiModeControl()) === null || _this$_getMultiModeCo2 === void 0 ? void 0 : (_this$_getMultiModeCo3 = _this$_getMultiModeCo2.getSelectedInnerControl()) === null || _this$_getMultiModeCo3 === void 0 ? void 0 : _this$_getMultiModeCo3.content;
        return oControl !== null && oControl !== void 0 && oControl.isA("sap.ui.mdc.Table") ? oControl : undefined;
      } else {
        return this._getControlFromPageModelProperty("/singleTableId");
      }
    };
    _proto._getControls = function _getControls(sKey) {
      if (this._isMultiMode()) {
        const aControls = [];
        const oTabMultiMode = this._getMultiModeControl().content;
        oTabMultiMode.getItems().forEach(oItem => {
          const oControl = this.getView().byId(oItem.getKey());
          if (oControl && sKey) {
            if (oItem.getKey().indexOf(`fe::${sKey}`) > -1) {
              aControls.push(oControl);
            }
          } else if (oControl !== undefined && oControl !== null) {
            aControls.push(oControl);
          }
        });
        return aControls;
      } else if (sKey === "Chart") {
        const oChart = this.getChartControl();
        return oChart ? [oChart] : [];
      } else {
        const oTable = this._getTable();
        return oTable ? [oTable] : [];
      }
    };
    _proto._getDefaultPath = function _getDefaultPath() {
      var _this$_getPageModel4;
      const defaultPath = ListReportTemplating.getDefaultPath(((_this$_getPageModel4 = this._getPageModel()) === null || _this$_getPageModel4 === void 0 ? void 0 : _this$_getPageModel4.getProperty("/views")) || []);
      switch (defaultPath) {
        case "primary":
          return TemplateContentView.Chart;
        case "secondary":
          return TemplateContentView.Table;
        case "both":
        default:
          return TemplateContentView.Hybrid;
      }
    }

    /**
     * Method to know if ListReport is configured with Multiple Table mode.
     *
     * @function
     * @name _isMultiMode
     * @returns Is Multiple Table mode set?
     */;
    _proto._isMultiMode = function _isMultiMode() {
      var _this$_getPageModel5;
      return !!((_this$_getPageModel5 = this._getPageModel()) !== null && _this$_getPageModel5 !== void 0 && _this$_getPageModel5.getProperty("/multiViewsControl"));
    }

    /**
     * Method to know if ListReport is configured to load data at start up.
     *
     * @function
     * @name _isInitLoadDisabled
     * @returns Is InitLoad enabled?
     */;
    _proto._isInitLoadEnabled = function _isInitLoadEnabled() {
      const initLoadMode = this.getView().getViewData().initialLoad;
      return initLoadMode === InitialLoadMode.Enabled;
    };
    _proto._hasMultiVisualizations = function _hasMultiVisualizations() {
      var _this$_getPageModel6;
      return (_this$_getPageModel6 = this._getPageModel()) === null || _this$_getPageModel6 === void 0 ? void 0 : _this$_getPageModel6.getProperty("/hasMultiVisualizations");
    }

    /**
     * Method to suspend search on the filter bar. The initial loading of data is disabled based on the manifest configuration InitLoad - Disabled/Auto.
     * It is enabled later when the view state is set, when it is possible to realize if there are default filters.
     */;
    _proto._disableInitLoad = function _disableInitLoad() {
      const filterBar = this._getFilterBarControl();
      // check for filter bar hidden
      if (filterBar) {
        filterBar.setSuspendSelection(true);
      }
    }

    /**
     * Method called by flex to determine if the applyAutomatically setting on the variant is valid.
     * Called only for Standard Variant and only when there is display text set for applyAutomatically (FE only sets it for Auto).
     *
     * @returns Boolean true if data should be loaded automatically, false otherwise
     */;
    _proto._applyAutomaticallyOnStandardVariant = function _applyAutomaticallyOnStandardVariant() {
      // We always return false and take care of it when view state is set
      return false;
    }

    /**
     * Configure the settings for initial load based on
     * - manifest setting initLoad - Enabled/Disabled/Auto
     * - user's setting of applyAutomatically on variant
     * - if there are default filters
     * We disable the filter bar search at the beginning and enable it when view state is set.
     */;
    _proto._setInitLoad = function _setInitLoad() {
      var _this$_getPageModel7;
      // if initLoad is Disabled or Auto, switch off filter bar search temporarily at start
      if (!this._isInitLoadEnabled()) {
        this._disableInitLoad();
      }
      // set hook for flex for when standard variant is set (at start or by user at runtime)
      // required to override the user setting 'apply automatically' behaviour if there are no filters
      const variantManagementId = ListReportTemplating.getVariantBackReference(this.getView().getViewData(), (_this$_getPageModel7 = this._getPageModel()) === null || _this$_getPageModel7 === void 0 ? void 0 : _this$_getPageModel7.getData());
      const variantManagement = variantManagementId && this.getView().byId(variantManagementId);
      if (variantManagement) {
        variantManagement.registerApplyAutomaticallyOnStandardVariant(this._applyAutomaticallyOnStandardVariant.bind(this));
      }
    };
    _proto._setShareModel = function _setShareModel() {
      // TODO: deactivated for now - currently there is no _templPriv anymore, to be discussed
      // this method is currently not called anymore from the init method

      const fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
      //var oManifest = this.getOwnerComponent().getAppComponent().getMetadata().getManifestEntry("sap.ui");
      //var sBookmarkIcon = (oManifest && oManifest.icons && oManifest.icons.icon) || "";

      //shareModel: Holds all the sharing relevant information and info used in XML view
      const oShareInfo = {
        bookmarkTitle: document.title,
        //To name the bookmark according to the app title.
        bookmarkCustomUrl: function () {
          const sHash = hasher.getHash();
          return sHash ? `#${sHash}` : window.location.href;
        },
        /*
        				To be activated once the FLP shows the count - see comment above
        				bookmarkServiceUrl: function() {
        					//var oTable = oTable.getInnerTable(); oTable is already the sap.fe table (but not the inner one)
        					// we should use table.getListBindingInfo instead of the binding
        					var oBinding = oTable.getBinding("rows") || oTable.getBinding("items");
        					return oBinding ? fnGetDownloadUrl(oBinding) : "";
        				},*/
        isShareInJamActive: !!fnGetUser && fnGetUser().isJamActive()
      };
      const oTemplatePrivateModel = this.getOwnerComponent().getModel("_templPriv");
      oTemplatePrivateModel.setProperty("/listReport/share", oShareInfo);
    }

    /**
     * Method to update the local UI model of the page with the fields that are not applicable to the filter bar (this is specific to the ALP scenario).
     *
     * @param oInternalModelContext The internal model context
     * @param oFilterBar MDC filter bar
     */;
    _proto._updateALPNotApplicableFields = function _updateALPNotApplicableFields(oInternalModelContext, oFilterBar) {
      const mCache = {};
      const ignoredFields = {},
        aTables = this._getControls("table"),
        aCharts = this._getControls("Chart");
      if (!aTables.length || !aCharts.length) {
        // If there's not a table and a chart, we're not in the ALP case
        return;
      }

      // For the moment, there's nothing for tables...
      aCharts.forEach(function (oChart) {
        const sChartEntityPath = oChart.data("targetCollectionPath"),
          sChartEntitySet = sChartEntityPath.slice(1),
          sCacheKey = `${sChartEntitySet}Chart`;
        if (!mCache[sCacheKey]) {
          mCache[sCacheKey] = FilterUtils.getNotApplicableFilters(oFilterBar, oChart);
        }
        ignoredFields[sCacheKey] = mCache[sCacheKey];
      });
      oInternalModelContext.setProperty("controls/ignoredFields", ignoredFields);
    };
    _proto._isFilterBarHidden = function _isFilterBarHidden() {
      return this.getView().getViewData().hideFilterBar;
    };
    _proto._getApplyAutomaticallyOnVariant = function _getApplyAutomaticallyOnVariant(VariantManagement, key) {
      if (!VariantManagement || !key) {
        return false;
      }
      const variants = VariantManagement.getVariants();
      const currentVariant = variants.find(function (variant) {
        return variant && variant.key === key;
      });
      return currentVariant && currentVariant.executeOnSelect || false;
    };
    _proto._shouldAutoTriggerSearch = function _shouldAutoTriggerSearch(oVM) {
      if (this.getView().getViewData().initialLoad === InitialLoadMode.Auto && (!oVM || oVM.getStandardVariantKey() === oVM.getCurrentVariantKey())) {
        const oFilterBar = this._getFilterBarControl();
        if (oFilterBar) {
          const oConditions = oFilterBar.getConditions();
          for (const sKey in oConditions) {
            // ignore filters starting with $ (e.g. $search, $editState)
            if (!sKey.startsWith("$") && Array.isArray(oConditions[sKey]) && oConditions[sKey].length) {
              // load data as per user's setting of applyAutomatically on the variant
              const standardVariant = oVM.getVariants().find(variant => {
                return variant.key === oVM.getCurrentVariantKey();
              });
              return standardVariant && standardVariant.executeOnSelect;
            }
          }
        }
      }
      return false;
    };
    _proto._updateTable = function _updateTable(oTable) {
      if (!oTable.isTableBound() || this.hasPendingChartChanges) {
        oTable.rebind();
        this.hasPendingChartChanges = false;
      }
    };
    _proto._updateChart = function _updateChart(oChart) {
      const oInnerChart = oChart.getControlDelegate()._getChart(oChart);
      if (!(oInnerChart && oInnerChart.isBound("data")) || this.hasPendingTableChanges) {
        oChart.getControlDelegate().rebind(oChart, oInnerChart.getBindingInfo("data"));
        this.hasPendingTableChanges = false;
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      const aTables = this._getControls();
      const sEntitySet = this.getView().getViewData().entitySet;
      const sText = getResourceModel(this.getView()).getText("T_TABLE_AND_CHART_NO_DATA_TEXT", undefined, sEntitySet);
      aTables.forEach(function (oTable) {
        if (oTable.isA("sap.ui.mdc.Table")) {
          oTable.setNoData(sText);
        }
      });
    };
    return ListReportController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "sideEffects", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "kpiManagement", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onViewNeedsRefresh", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "onViewNeedsRefresh"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPendingFilters", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "onPendingFilters"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterClear", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterClear"), _class2.prototype)), _class2)) || _class);
  return ListReportController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiQ29yZUxpYnJhcnkiLCJJbml0aWFsTG9hZE1vZGUiLCJMaXN0UmVwb3J0Q29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJJbnRlcm5hbFJvdXRpbmciLCJvdmVycmlkZSIsIm9uQWZ0ZXJCaW5kaW5nIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfb25BZnRlckJpbmRpbmciLCJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldEVudGl0eVNldCIsImJhc2UiLCJnZXRDdXJyZW50RW50aXR5U2V0IiwiU2lkZUVmZmVjdHMiLCJJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSIsIlNoYXJlIiwiU2hhcmVPdmVycmlkZXMiLCJWaWV3U3RhdGUiLCJWaWV3U3RhdGVPdmVycmlkZXMiLCJLUElNYW5hZ2VtZW50IiwiUGxhY2Vob2xkZXIiLCJNYXNzRWRpdCIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwicHJpdmF0ZUV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwiZm9ybWF0dGVycyIsInNldEFMUENvbnRyb2xNZXNzYWdlU3RyaXAiLCJhSWdub3JlZEZpZWxkcyIsImJJc0NoYXJ0Iiwib0FwcGx5U3VwcG9ydGVkIiwic1RleHQiLCJvRmlsdGVyQmFyIiwiX2dldEZpbHRlckJhckNvbnRyb2wiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJhSWdub3JlZExhYmVscyIsIk1lc3NhZ2VTdHJpcCIsImdldExhYmVscyIsImRhdGEiLCJnZXRSZXNvdXJjZU1vZGVsIiwiYklzU2VhcmNoSWdub3JlZCIsImVuYWJsZVNlYXJjaCIsImdldEFMUFRleHQiLCJnZXRUZXh0IiwiaGFuZGxlcnMiLCJvbkZpbHRlclNlYXJjaCIsImZpbHRlckJhckFQSSIsImdldFBhcmVudCIsInRyaWdnZXJTZWFyY2giLCJvbkZpbHRlcnNDaGFuZ2VkIiwib0V2ZW50Iiwib0ludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJvblBlbmRpbmdGaWx0ZXJzIiwiYXBwbGllZEZpbHRlcnNUZXh0IiwiZ2V0QXNzaWduZWRGaWx0ZXJzVGV4dCIsImZpbHRlcnNUZXh0IiwiYXBwbGllZEZpbHRlckJpbmRpbmciLCJiaW5kaW5nUGFyc2VyIiwiYnlJZCIsImJpbmRUZXh0Iiwic2V0VGV4dCIsImdldFBhcmFtZXRlciIsInNldFByb3BlcnR5Iiwib25WYXJpYW50U2VsZWN0ZWQiLCJvVk0iLCJnZXRTb3VyY2UiLCJjdXJyZW50VmFyaWFudEtleSIsIm9NdWx0aU1vZGVDb250cm9sIiwiX2dldE11bHRpTW9kZUNvbnRyb2wiLCJpc0EiLCJpbnZhbGlkYXRlQ29udGVudCIsInNldEZyZWV6ZUNvbnRlbnQiLCJzZXRUaW1lb3V0IiwiX3Nob3VsZEF1dG9UcmlnZ2VyU2VhcmNoIiwiX2dldEFwcGx5QXV0b21hdGljYWxseU9uVmFyaWFudCIsImdldEV4dGVuc2lvbkFQSSIsInVwZGF0ZUFwcFN0YXRlIiwib25WYXJpYW50U2F2ZWQiLCJvblNlYXJjaCIsIm9NZGNDaGFydCIsImdldENoYXJ0Q29udHJvbCIsImJIaWRlRHJhZnQiLCJGaWx0ZXJVdGlscyIsImdldEVkaXRTdGF0ZUlzSGlkZURyYWZ0IiwiZ2V0Q29uZGl0aW9ucyIsIl91cGRhdGVBTFBOb3RBcHBsaWNhYmxlRmllbGRzIiwib1BhZ2VJbnRlcm5hbE1vZGVsQ29udGV4dCIsInNUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiZ2V0UHJvcGVydHkiLCJnZXRQYXRoIiwiQ2hhcnQiLCJoYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzIiwiVGFibGUiLCJoYXNQZW5kaW5nVGFibGVDaGFuZ2VzIiwiU3RhdGVVdGlsIiwicmV0cmlldmVFeHRlcm5hbFN0YXRlIiwidGhlbiIsIm9FeHRlcm5hbFN0YXRlIiwiZmlsdGVyQmFyQ29uZGl0aW9ucyIsImZpbHRlciIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJnZXRWaWV3RGF0YSIsImxpdmVNb2RlIiwic3lzdGVtIiwicGhvbmUiLCJvRHluYW1pY1BhZ2UiLCJfZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sIiwic2V0SGVhZGVyRXhwYW5kZWQiLCJvbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQiLCJvQ29udHJvbGxlciIsInNPdXRib3VuZFRhcmdldCIsIm9Db250ZXh0Iiwic0NyZWF0ZVBhdGgiLCJfaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwib25DaGFydFNlbGVjdGlvbkNoYW5nZWQiLCJnZXRDb250ZW50Iiwib1RhYmxlIiwiX2dldFRhYmxlIiwiYURhdGEiLCJDaGFydFV0aWxzIiwic2V0Q2hhcnRGaWx0ZXJzIiwicmViaW5kIiwib25TZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwic1NlbGVjdGVkS2V5IiwibVBhcmFtZXRlcnMiLCJrZXkiLCJvQ2hhcnQiLCJvU2VnbWVudGVkQnV0dG9uRGVsZWdhdGUiLCJvbkFmdGVyUmVuZGVyaW5nIiwiYUl0ZW1zIiwib1NlZ21lbnRlZEJ1dHRvbiIsImdldEl0ZW1zIiwiZm9yRWFjaCIsIm9JdGVtIiwiZ2V0S2V5IiwiZm9jdXMiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiX2dldFNlZ21lbnRlZEJ1dHRvbiIsImFkZEV2ZW50RGVsZWdhdGUiLCJfdXBkYXRlVGFibGUiLCJfdXBkYXRlQ2hhcnQiLCJIeWJyaWQiLCJvbkZpbHRlcnNTZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwiaXNDb21wYWN0Iiwic2V0VmlzaWJsZSIsIl9nZXRWaXN1YWxGaWx0ZXJCYXJDb250cm9sIiwib25TdGF0ZUNoYW5nZSIsIm9uRHluYW1pY1BhZ2VUaXRsZVN0YXRlQ2hhbmdlZCIsImZpbHRlckJhciIsImdldFNlZ21lbnRlZEJ1dHRvbiIsImV4dGVuc2lvbkFQSSIsIkV4dGVuc2lvbkFQSSIsIm9uSW5pdCIsIlBhZ2VDb250cm9sbGVyIiwicHJvdG90eXBlIiwiYXBwbHkiLCJfaGFzTXVsdGlWaXN1YWxpemF0aW9ucyIsImFscENvbnRlbnRWaWV3IiwiX2dldERlZmF1bHRQYXRoIiwiZGVza3RvcCIsImdldEFwcENvbXBvbmVudCIsImdldFJvdXRlclByb3h5Iiwid2FpdEZvclJvdXRlTWF0Y2hCZWZvcmVOYXZpZ2F0aW9uIiwiX3NldEluaXRMb2FkIiwib25FeGl0IiwiZGVzdHJveSIsImFUYWJsZXMiLCJfZ2V0Q29udHJvbHMiLCJFZGl0U3RhdGUiLCJpc0VkaXRTdGF0ZURpcnR5Iiwib1RhYmxlQmluZGluZyIsImdldFJvd0JpbmRpbmciLCJDb21tb25VdGlscyIsIl9pc0ZjbEVuYWJsZWQiLCJyZWZyZXNoIiwic1VwZGF0ZVRpbWVyIiwiZm5VcGRhdGVUYWJsZUFjdGlvbnMiLCJfdXBkYXRlVGFibGVBY3Rpb25zIiwiZGV0YWNoRGF0YVJlY2VpdmVkIiwiYXR0YWNoRGF0YVJlY2VpdmVkIiwic2V0RWRpdFN0YXRlUHJvY2Vzc2VkIiwiaW50ZXJuYWxNb2RlbENvbnRleHQiLCJ2aWV3SWQiLCJnZXRJZCIsInBhZ2VSZWFkeSIsIndhaXRGb3IiLCJnZXRBcHBTdGF0ZUhhbmRsZXIiLCJhcHBseUFwcFN0YXRlIiwib25CZWZvcmVSZW5kZXJpbmciLCJvblBhZ2VSZWFkeSIsImZvcmNlRm9jdXMiLCJfc2V0SW5pdGlhbEZvY3VzIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsInNldEJhY2tOYXZpZ2F0aW9uIiwidW5kZWZpbmVkIiwib25WaWV3TmVlZHNSZWZyZXNoIiwic2xpY2UiLCJvbkFmdGVyQ2xlYXIiLCJhSUJOQWN0aW9ucyIsImdldElCTkFjdGlvbnMiLCJvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiSlNPTiIsInBhcnNlIiwiQ29tbW9uSGVscGVyIiwicGFyc2VDdXN0b21EYXRhIiwiRGVsZWdhdGVVdGlsIiwiZ2V0Q3VzdG9tRGF0YSIsImFTZWxlY3RlZENvbnRleHRzIiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsIkRlbGV0ZUhlbHBlciIsInVwZGF0ZURlbGV0ZUluZm9Gb3JTZWxlY3RlZENvbnRleHRzIiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnQiLCJ1cGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSIsIl9zY3JvbGxUYWJsZXNUb1JvdyIsInNSb3dQYXRoIiwiVGFibGVTY3JvbGxlciIsInNjcm9sbFRhYmxlVG9Sb3ciLCJkeW5hbWljUGFnZSIsImlzSGVhZGVyRXhwYW5kZWQiLCJnZXRIZWFkZXJFeHBhbmRlZCIsImdldFNob3dNZXNzYWdlcyIsInNldFNob3dNZXNzYWdlcyIsImZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZCIsImdldEZpbHRlckl0ZW1zIiwiZmluZCIsIm9GaWx0ZXJJdGVtIiwiZ2V0UmVxdWlyZWQiLCJfaXNJbml0TG9hZEVuYWJsZWQiLCJfZ2V0RmlsdGVyQmFyQ29udHJvbElkIiwiZm9jdXNSb3ciLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJvTWFuaWZlc3RFbnRyeSIsImdldE1hbmlmZXN0RW50cnkiLCJ0aXRsZSIsInN1YnRpdGxlIiwic3ViVGl0bGUiLCJpbnRlbnQiLCJpY29uIiwiX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbElkIiwiX2dldEFkYXB0YXRpb25GaWx0ZXJCYXJDb250cm9sIiwiYWRhcHRhdGlvbkZpbHRlckJhciIsImdldEluYnVpbHRGaWx0ZXIiLCJzQ29udHJvbCIsInNTZWdtZW50ZWRCdXR0b25JZCIsIl9nZXRDb250cm9sRnJvbVBhZ2VNb2RlbFByb3BlcnR5Iiwic1BhdGgiLCJjb250cm9sSWQiLCJfZ2V0UGFnZU1vZGVsIiwic1Zpc3VhbEZpbHRlckJhcklkIiwiU3RhYmxlSWRIZWxwZXIiLCJnZW5lcmF0ZSIsIl9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCIsIl9pc011bHRpTW9kZSIsIm9Db250cm9sIiwiZ2V0U2VsZWN0ZWRJbm5lckNvbnRyb2wiLCJjb250ZW50Iiwic0tleSIsImFDb250cm9scyIsIm9UYWJNdWx0aU1vZGUiLCJpbmRleE9mIiwicHVzaCIsImRlZmF1bHRQYXRoIiwiTGlzdFJlcG9ydFRlbXBsYXRpbmciLCJnZXREZWZhdWx0UGF0aCIsImluaXRMb2FkTW9kZSIsImluaXRpYWxMb2FkIiwiRW5hYmxlZCIsIl9kaXNhYmxlSW5pdExvYWQiLCJzZXRTdXNwZW5kU2VsZWN0aW9uIiwiX2FwcGx5QXV0b21hdGljYWxseU9uU3RhbmRhcmRWYXJpYW50IiwidmFyaWFudE1hbmFnZW1lbnRJZCIsImdldFZhcmlhbnRCYWNrUmVmZXJlbmNlIiwiZ2V0RGF0YSIsInZhcmlhbnRNYW5hZ2VtZW50IiwicmVnaXN0ZXJBcHBseUF1dG9tYXRpY2FsbHlPblN0YW5kYXJkVmFyaWFudCIsImJpbmQiLCJfc2V0U2hhcmVNb2RlbCIsImZuR2V0VXNlciIsIk9iamVjdFBhdGgiLCJnZXQiLCJvU2hhcmVJbmZvIiwiYm9va21hcmtUaXRsZSIsImRvY3VtZW50IiwiYm9va21hcmtDdXN0b21VcmwiLCJzSGFzaCIsImhhc2hlciIsImdldEhhc2giLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImhyZWYiLCJpc1NoYXJlSW5KYW1BY3RpdmUiLCJpc0phbUFjdGl2ZSIsIm9UZW1wbGF0ZVByaXZhdGVNb2RlbCIsImdldE93bmVyQ29tcG9uZW50IiwiZ2V0TW9kZWwiLCJtQ2FjaGUiLCJpZ25vcmVkRmllbGRzIiwiYUNoYXJ0cyIsInNDaGFydEVudGl0eVBhdGgiLCJzQ2hhcnRFbnRpdHlTZXQiLCJzQ2FjaGVLZXkiLCJnZXROb3RBcHBsaWNhYmxlRmlsdGVycyIsIl9pc0ZpbHRlckJhckhpZGRlbiIsImhpZGVGaWx0ZXJCYXIiLCJWYXJpYW50TWFuYWdlbWVudCIsInZhcmlhbnRzIiwiZ2V0VmFyaWFudHMiLCJjdXJyZW50VmFyaWFudCIsInZhcmlhbnQiLCJleGVjdXRlT25TZWxlY3QiLCJBdXRvIiwiZ2V0U3RhbmRhcmRWYXJpYW50S2V5IiwiZ2V0Q3VycmVudFZhcmlhbnRLZXkiLCJvQ29uZGl0aW9ucyIsInN0YXJ0c1dpdGgiLCJzdGFuZGFyZFZhcmlhbnQiLCJpc1RhYmxlQm91bmQiLCJvSW5uZXJDaGFydCIsImdldENvbnRyb2xEZWxlZ2F0ZSIsIl9nZXRDaGFydCIsImlzQm91bmQiLCJnZXRCaW5kaW5nSW5mbyIsInNFbnRpdHlTZXQiLCJlbnRpdHlTZXQiLCJzZXROb0RhdGEiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkxpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgT2JqZWN0UGF0aCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9PYmplY3RQYXRoXCI7XG5pbXBvcnQgdHlwZSBEeW5hbWljUGFnZSBmcm9tIFwic2FwL2YvRHluYW1pY1BhZ2VcIjtcbmltcG9ydCBBY3Rpb25SdW50aW1lIGZyb20gXCJzYXAvZmUvY29yZS9BY3Rpb25SdW50aW1lXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbFJvdXRpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsUm91dGluZ1wiO1xuaW1wb3J0IEtQSU1hbmFnZW1lbnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0tQSU1hbmFnZW1lbnRcIjtcbmltcG9ydCBNYXNzRWRpdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvTWFzc0VkaXRcIjtcbmltcG9ydCBQbGFjZWhvbGRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGxhY2Vob2xkZXJcIjtcbmltcG9ydCBTaGFyZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2hhcmVcIjtcbmltcG9ydCBTaWRlRWZmZWN0cyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2lkZUVmZmVjdHNcIjtcbmltcG9ydCBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9scy9GaWx0ZXJCYXJcIjtcbmltcG9ydCB7IExpc3RSZXBvcnREZWZpbml0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvdGVtcGxhdGVzL0xpc3RSZXBvcnRDb252ZXJ0ZXJcIjtcbmltcG9ydCB7XG5cdGRlZmluZVVJNUNsYXNzLFxuXHRleHRlbnNpYmxlLFxuXHRmaW5hbEV4dGVuc2lvbixcblx0cHJpdmF0ZUV4dGVuc2lvbixcblx0cHVibGljRXh0ZW5zaW9uLFxuXHR1c2luZ0V4dGVuc2lvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBEZWxldGVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRGVsZXRlSGVscGVyXCI7XG5pbXBvcnQgRWRpdFN0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0VkaXRTdGF0ZVwiO1xuaW1wb3J0IE1lc3NhZ2VTdHJpcCBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9NZXNzYWdlU3RyaXBcIjtcbmltcG9ydCB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgKiBhcyBTdGFibGVJZEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IENvcmVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBWaWV3RGF0YSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9UZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBDaGFydFV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NoYXJ0L0NoYXJ0VXRpbHNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgRmlsdGVyQmFyQVBJIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlckJhci9GaWx0ZXJCYXJBUElcIjtcbmltcG9ydCBNdWx0aXBsZU1vZGVDb250cm9sIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL0xpc3RSZXBvcnQvY29udHJvbHMvTXVsdGlwbGVNb2RlQ29udHJvbFwiO1xuaW1wb3J0IEV4dGVuc2lvbkFQSSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L0V4dGVuc2lvbkFQSVwiO1xuaW1wb3J0IFRhYmxlU2Nyb2xsZXIgZnJvbSBcInNhcC9mZS90ZW1wbGF0ZXMvVGFibGVTY3JvbGxlclwiO1xuaW1wb3J0IHR5cGUgU2VnbWVudGVkQnV0dG9uIGZyb20gXCJzYXAvbS9TZWdtZW50ZWRCdXR0b25cIjtcbmltcG9ydCB0eXBlIFRleHQgZnJvbSBcInNhcC9tL1RleHRcIjtcbmltcG9ydCB7IGJpbmRpbmdQYXJzZXIgfSBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCB7IHN5c3RlbSB9IGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgU3RhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3AxM24vU3RhdGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IGhhc2hlciBmcm9tIFwic2FwL3VpL3RoaXJkcGFydHkvaGFzaGVyXCI7XG5pbXBvcnQgKiBhcyBMaXN0UmVwb3J0VGVtcGxhdGluZyBmcm9tIFwiLi9MaXN0UmVwb3J0VGVtcGxhdGluZ1wiO1xuaW1wb3J0IEludGVudEJhc2VkTmF2aWdhdGlvbk92ZXJyaWRlIGZyb20gXCIuL292ZXJyaWRlcy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBTaGFyZU92ZXJyaWRlcyBmcm9tIFwiLi9vdmVycmlkZXMvU2hhcmVcIjtcbmltcG9ydCBWaWV3U3RhdGVPdmVycmlkZXMgZnJvbSBcIi4vb3ZlcnJpZGVzL1ZpZXdTdGF0ZVwiO1xuXG5jb25zdCBUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gQ29yZUxpYnJhcnkuVGVtcGxhdGVDb250ZW50Vmlldyxcblx0SW5pdGlhbExvYWRNb2RlID0gQ29yZUxpYnJhcnkuSW5pdGlhbExvYWRNb2RlO1xuXG4vKipcbiAqIENvbnRyb2xsZXIgY2xhc3MgZm9yIHRoZSBsaXN0IHJlcG9ydCBwYWdlLCB1c2VkIGluc2lkZSBhbiBTQVAgRmlvcmkgZWxlbWVudHMgYXBwbGljYXRpb24uXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuTGlzdFJlcG9ydENvbnRyb2xsZXJcIilcbmNsYXNzIExpc3RSZXBvcnRDb250cm9sbGVyIGV4dGVuZHMgUGFnZUNvbnRyb2xsZXIge1xuXHRAdXNpbmdFeHRlbnNpb24oXG5cdFx0SW50ZXJuYWxSb3V0aW5nLm92ZXJyaWRlKHtcblx0XHRcdG9uQWZ0ZXJCaW5kaW5nOiBmdW5jdGlvbiAodGhpczogSW50ZXJuYWxSb3V0aW5nKSB7XG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXIpLl9vbkFmdGVyQmluZGluZygpO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0X3JvdXRpbmchOiBJbnRlcm5hbFJvdXRpbmc7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKFxuXHRcdEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uLm92ZXJyaWRlKHtcblx0XHRcdGdldEVudGl0eVNldDogZnVuY3Rpb24gKHRoaXM6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdHJldHVybiAodGhpcy5iYXNlIGFzIExpc3RSZXBvcnRDb250cm9sbGVyKS5nZXRDdXJyZW50RW50aXR5U2V0KCk7XG5cdFx0XHR9XG5cdFx0fSlcblx0KVxuXHRfaW50ZW50QmFzZWROYXZpZ2F0aW9uITogSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb247XG5cblx0QHVzaW5nRXh0ZW5zaW9uKFNpZGVFZmZlY3RzKVxuXHRzaWRlRWZmZWN0cyE6IFNpZGVFZmZlY3RzO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlbnRCYXNlZE5hdmlnYXRpb24ub3ZlcnJpZGUoSW50ZW50QmFzZWROYXZpZ2F0aW9uT3ZlcnJpZGUpKVxuXHRpbnRlbnRCYXNlZE5hdmlnYXRpb24hOiBJbnRlbnRCYXNlZE5hdmlnYXRpb247XG5cblx0QHVzaW5nRXh0ZW5zaW9uKFNoYXJlLm92ZXJyaWRlKFNoYXJlT3ZlcnJpZGVzKSlcblx0c2hhcmUhOiBTaGFyZTtcblxuXHRAdXNpbmdFeHRlbnNpb24oVmlld1N0YXRlLm92ZXJyaWRlKFZpZXdTdGF0ZU92ZXJyaWRlcykpXG5cdHZpZXdTdGF0ZSE6IFZpZXdTdGF0ZTtcblxuXHRAdXNpbmdFeHRlbnNpb24oS1BJTWFuYWdlbWVudClcblx0a3BpTWFuYWdlbWVudCE6IEtQSU1hbmFnZW1lbnQ7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKFBsYWNlaG9sZGVyKVxuXHRwbGFjZWhvbGRlciE6IFBsYWNlaG9sZGVyO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihNYXNzRWRpdClcblx0bWFzc0VkaXQhOiBNYXNzRWRpdDtcblxuXHRwcm90ZWN0ZWQgZXh0ZW5zaW9uQVBJPzogRXh0ZW5zaW9uQVBJO1xuXG5cdHByaXZhdGUgZmlsdGVyQmFyQ29uZGl0aW9ucz86IGFueTtcblxuXHRwcml2YXRlIHNVcGRhdGVUaW1lcj86IGFueTtcblxuXHRwcml2YXRlIGhhc1BlbmRpbmdDaGFydENoYW5nZXM/OiBib29sZWFuO1xuXG5cdHByaXZhdGUgaGFzUGVuZGluZ1RhYmxlQ2hhbmdlcz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgZXh0ZW5zaW9uIEFQSSBmb3IgdGhlIGN1cnJlbnQgcGFnZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyBUaGUgZXh0ZW5zaW9uIEFQSS5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRFeHRlbnNpb25BUEkoKTogRXh0ZW5zaW9uQVBJIHtcblx0XHRpZiAoIXRoaXMuZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHR0aGlzLmV4dGVuc2lvbkFQSSA9IG5ldyBFeHRlbnNpb25BUEkodGhpcyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLmV4dGVuc2lvbkFQSTtcblx0fVxuXG5cdG9uSW5pdCgpIHtcblx0XHRQYWdlQ29udHJvbGxlci5wcm90b3R5cGUub25Jbml0LmFwcGx5KHRoaXMpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJoYXNQZW5kaW5nRmlsdGVyc1wiLCB0cnVlKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJoaWRlRHJhZnRJbmZvXCIsIGZhbHNlKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJ1b21cIiwge30pO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNjYWxlZmFjdG9yXCIsIHt9KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzY2FsZWZhY3Rvck51bWJlclwiLCB7fSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiY3VycmVuY3lcIiwge30pO1xuXG5cdFx0aWYgKHRoaXMuX2hhc011bHRpVmlzdWFsaXphdGlvbnMoKSkge1xuXHRcdFx0bGV0IGFscENvbnRlbnRWaWV3ID0gdGhpcy5fZ2V0RGVmYXVsdFBhdGgoKTtcblx0XHRcdGlmICghc3lzdGVtLmRlc2t0b3AgJiYgYWxwQ29udGVudFZpZXcgPT09IFRlbXBsYXRlQ29udGVudFZpZXcuSHlicmlkKSB7XG5cdFx0XHRcdGFscENvbnRlbnRWaWV3ID0gVGVtcGxhdGVDb250ZW50Vmlldy5DaGFydDtcblx0XHRcdH1cblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImFscENvbnRlbnRWaWV3XCIsIGFscENvbnRlbnRWaWV3KTtcblx0XHR9XG5cblx0XHQvLyBTdG9yZSBjb25kaXRpb25zIGZyb20gZmlsdGVyIGJhclxuXHRcdC8vIHRoaXMgaXMgbGF0ZXIgdXNlZCBiZWZvcmUgbmF2aWdhdGlvbiB0byBnZXQgY29uZGl0aW9ucyBhcHBsaWVkIG9uIHRoZSBmaWx0ZXIgYmFyXG5cdFx0dGhpcy5maWx0ZXJCYXJDb25kaXRpb25zID0ge307XG5cblx0XHQvLyBBcyBBcHBTdGF0ZUhhbmRsZXIuYXBwbHlBcHBTdGF0ZSB0cmlnZ2VycyBhIG5hdmlnYXRpb24gd2Ugd2FudCB0byBtYWtlIHN1cmUgaXQgd2lsbFxuXHRcdC8vIGhhcHBlbiBhZnRlciB0aGUgcm91dGVNYXRjaCBldmVudCBoYXMgYmVlbiBwcm9jZXNzZWQgKG90aGVyd2lzZSB0aGUgcm91dGVyIGdldHMgYnJva2VuKVxuXHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGVyUHJveHkoKS53YWl0Rm9yUm91dGVNYXRjaEJlZm9yZU5hdmlnYXRpb24oKTtcblxuXHRcdC8vIENvbmZpZ3VyZSB0aGUgaW5pdGlhbCBsb2FkIHNldHRpbmdzXG5cdFx0dGhpcy5fc2V0SW5pdExvYWQoKTtcblx0fVxuXG5cdG9uRXhpdCgpIHtcblx0XHRkZWxldGUgdGhpcy5maWx0ZXJCYXJDb25kaXRpb25zO1xuXHRcdGlmICh0aGlzLmV4dGVuc2lvbkFQSSkge1xuXHRcdFx0dGhpcy5leHRlbnNpb25BUEkuZGVzdHJveSgpO1xuXHRcdH1cblx0XHRkZWxldGUgdGhpcy5leHRlbnNpb25BUEk7XG5cdH1cblxuXHRfb25BZnRlckJpbmRpbmcoKSB7XG5cdFx0Y29uc3QgYVRhYmxlcyA9IHRoaXMuX2dldENvbnRyb2xzKFwidGFibGVcIik7XG5cdFx0aWYgKEVkaXRTdGF0ZS5pc0VkaXRTdGF0ZURpcnR5KCkpIHtcblx0XHRcdHRoaXMuX2dldE11bHRpTW9kZUNvbnRyb2woKT8uaW52YWxpZGF0ZUNvbnRlbnQoKTtcblx0XHRcdGNvbnN0IG9UYWJsZUJpbmRpbmcgPSB0aGlzLl9nZXRUYWJsZSgpPy5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0XHRpZiAob1RhYmxlQmluZGluZykge1xuXHRcdFx0XHRpZiAoQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKS5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHQvLyB0aGVyZSBpcyBhbiBpc3N1ZSBpZiB3ZSB1c2UgYSB0aW1lb3V0IHdpdGggYSBrZXB0IGFsaXZlIGNvbnRleHQgdXNlZCBvbiBhbm90aGVyIHBhZ2Vcblx0XHRcdFx0XHRvVGFibGVCaW5kaW5nLnJlZnJlc2goKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpZiAoIXRoaXMuc1VwZGF0ZVRpbWVyKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnNVcGRhdGVUaW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHRvVGFibGVCaW5kaW5nLnJlZnJlc2goKTtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIHRoaXMuc1VwZGF0ZVRpbWVyO1xuXHRcdFx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gVXBkYXRlIGFjdGlvbiBlbmFibGVtZW50IGFuZCB2aXNpYmlsaXR5IHVwb24gdGFibGUgZGF0YSB1cGRhdGUuXG5cdFx0XHRcdFx0Y29uc3QgZm5VcGRhdGVUYWJsZUFjdGlvbnMgPSAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLl91cGRhdGVUYWJsZUFjdGlvbnMoYVRhYmxlcyk7XG5cdFx0XHRcdFx0XHRvVGFibGVCaW5kaW5nLmRldGFjaERhdGFSZWNlaXZlZChmblVwZGF0ZVRhYmxlQWN0aW9ucyk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRvVGFibGVCaW5kaW5nLmF0dGFjaERhdGFSZWNlaXZlZChmblVwZGF0ZVRhYmxlQWN0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVQcm9jZXNzZWQoKTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuc1VwZGF0ZVRpbWVyKSB7XG5cdFx0XHR0aGlzLl91cGRhdGVUYWJsZUFjdGlvbnMoYVRhYmxlcyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdGlmICghaW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJpbml0aWFsVmFyaWFudEFwcGxpZWRcIikpIHtcblx0XHRcdGNvbnN0IHZpZXdJZCA9IHRoaXMuZ2V0VmlldygpLmdldElkKCk7XG5cdFx0XHR0aGlzLnBhZ2VSZWFkeS53YWl0Rm9yKHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0QXBwU3RhdGVIYW5kbGVyKCkuYXBwbHlBcHBTdGF0ZSh2aWV3SWQsIHRoaXMuZ2V0VmlldygpKSk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImluaXRpYWxWYXJpYW50QXBwbGllZFwiLCB0cnVlKTtcblx0XHR9XG5cdH1cblxuXHRvbkJlZm9yZVJlbmRlcmluZygpIHtcblx0XHRQYWdlQ29udHJvbGxlci5wcm90b3R5cGUub25CZWZvcmVSZW5kZXJpbmcuYXBwbHkodGhpcyk7XG5cdH1cblxuXHRmb3JtYXR0ZXJzID0ge1xuXHRcdHNldEFMUENvbnRyb2xNZXNzYWdlU3RyaXAodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIsIGFJZ25vcmVkRmllbGRzOiBhbnlbXSwgYklzQ2hhcnQ6IGFueSwgb0FwcGx5U3VwcG9ydGVkPzogYW55KSB7XG5cdFx0XHRsZXQgc1RleHQgPSBcIlwiO1xuXHRcdFx0YklzQ2hhcnQgPSBiSXNDaGFydCA9PT0gXCJ0cnVlXCIgfHwgYklzQ2hhcnQgPT09IHRydWU7XG5cdFx0XHRjb25zdCBvRmlsdGVyQmFyID0gdGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdFx0aWYgKG9GaWx0ZXJCYXIgJiYgQXJyYXkuaXNBcnJheShhSWdub3JlZEZpZWxkcykgJiYgYUlnbm9yZWRGaWVsZHMubGVuZ3RoID4gMCAmJiBiSXNDaGFydCkge1xuXHRcdFx0XHRjb25zdCBhSWdub3JlZExhYmVscyA9IE1lc3NhZ2VTdHJpcC5nZXRMYWJlbHMoXG5cdFx0XHRcdFx0YUlnbm9yZWRGaWVsZHMsXG5cdFx0XHRcdFx0b0ZpbHRlckJhci5kYXRhKFwiZW50aXR5VHlwZVwiKSxcblx0XHRcdFx0XHRvRmlsdGVyQmFyLFxuXHRcdFx0XHRcdGdldFJlc291cmNlTW9kZWwob0ZpbHRlckJhcilcblx0XHRcdFx0KTtcblx0XHRcdFx0Y29uc3QgYklzU2VhcmNoSWdub3JlZCA9ICFvQXBwbHlTdXBwb3J0ZWQuZW5hYmxlU2VhcmNoO1xuXHRcdFx0XHRzVGV4dCA9IGJJc0NoYXJ0XG5cdFx0XHRcdFx0PyBNZXNzYWdlU3RyaXAuZ2V0QUxQVGV4dChhSWdub3JlZExhYmVscywgb0ZpbHRlckJhciwgYklzU2VhcmNoSWdub3JlZClcblx0XHRcdFx0XHQ6IE1lc3NhZ2VTdHJpcC5nZXRUZXh0KGFJZ25vcmVkTGFiZWxzLCBvRmlsdGVyQmFyLCBcIlwiKTtcblx0XHRcdFx0cmV0dXJuIHNUZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvblBhZ2VSZWFkeShtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmZvcmNlRm9jdXMpIHtcblx0XHRcdHRoaXMuX3NldEluaXRpYWxGb2N1cygpO1xuXHRcdH1cblx0XHQvLyBSZW1vdmUgdGhlIGhhbmRsZXIgb24gYmFjayBuYXZpZ2F0aW9uIHRoYXQgZGlzcGxheXMgRHJhZnQgY29uZmlybWF0aW9uXG5cdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0QmFja05hdmlnYXRpb24odW5kZWZpbmVkKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgY2FsbGVkIHdoZW4gdGhlIGNvbnRlbnQgb2YgYSBjdXN0b20gdmlldyB1c2VkIGluIGEgbGlzdCByZXBvcnQgbmVlZHMgdG8gYmUgcmVmcmVzaGVkLlxuXHQgKiBUaGlzIGhhcHBlbnMgZWl0aGVyIHdoZW4gdGhlcmUgaXMgYSBjaGFuZ2Ugb24gdGhlIEZpbHRlckJhciBhbmQgdGhlIHNlYXJjaCBpcyB0cmlnZ2VyZWQsXG5cdCAqIG9yIHdoZW4gYSB0YWIgd2l0aCBjdXN0b20gY29udGVudCBpcyBzZWxlY3RlZC5cblx0ICogVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJ3cml0dGVuIGJ5IHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbiBpbiBjYXNlIG9mIGN1c3RvbWl6YXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBNYXAgY29udGFpbmluZyB0aGUgZmlsdGVyIGNvbmRpdGlvbnMgb2YgdGhlIEZpbHRlckJhciwgdGhlIGN1cnJlbnRUYWJJRFxuXHQgKiBhbmQgdGhlIHZpZXcgcmVmcmVzaCBjYXVzZSAodGFiQ2hhbmdlZCBvciBzZWFyY2gpLlxuXHQgKiBUaGUgbWFwIGxvb2tzIGxpa2UgdGhpczpcblx0ICogPGNvZGU+PHByZT5cblx0ICogXHR7XG5cdCAqIFx0XHRmaWx0ZXJDb25kaXRpb25zOiB7XG5cdCAqIFx0XHRcdENvdW50cnk6IFtcblx0ICogXHRcdFx0XHR7XG5cdCAqIFx0XHRcdFx0XHRvcGVyYXRvcjogXCJFUVwiXG5cdCAqXHRcdFx0XHRcdHZhbGlkYXRlZDogXCJOb3RWYWxpZGF0ZWRcIlxuXHQgKlx0XHRcdFx0XHR2YWx1ZXM6IFtcIkdlcm1hbnlcIiwgLi4uXVxuXHQgKiBcdFx0XHRcdH0sXG5cdCAqIFx0XHRcdFx0Li4uXG5cdCAqIFx0XHRcdF1cblx0ICogXHRcdFx0Li4uXG5cdCAqIFx0XHR9LFxuXHQgKlx0XHRjdXJyZW50VGFiSWQ6IFwiZmU6OkN1c3RvbVRhYjo6dGFiMVwiLFxuXHQgKlx0XHRyZWZyZXNoQ2F1c2U6IFwidGFiQ2hhbmdlZFwiIHwgXCJzZWFyY2hcIlxuXHQgKlx0fVxuXHQgKiA8L3ByZT48L2NvZGU+XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvblZpZXdOZWVkc1JlZnJlc2gobVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdC8qIFRvIGJlIG92ZXJyaWRlbiAqL1xuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCBjYWxsZWQgd2hlbiBhIGZpbHRlciBvciBzZWFyY2ggdmFsdWUgaGFzIGJlZW4gY2hhbmdlZCBpbiB0aGUgRmlsdGVyQmFyLFxuXHQgKiBidXQgaGFzIG5vdCBiZWVuIHZhbGlkYXRlZCB5ZXQgYnkgdGhlIGVuZCB1c2VyICh3aXRoIHRoZSAnR28nIG9yICdTZWFyY2gnIGJ1dHRvbikuXG5cdCAqIFR5cGljYWxseSwgdGhlIGNvbnRlbnQgb2YgdGhlIGN1cnJlbnQgdGFiIGlzIGdyZXllZCBvdXQgdW50aWwgdGhlIGZpbHRlcnMgYXJlIHZhbGlkYXRlZC5cblx0ICogVGhpcyBtZXRob2QgY2FuIGJlIG92ZXJ3cml0dGVuIGJ5IHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbiBpbiBjYXNlIG9mIGN1c3RvbWl6YXRpb24uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25QZW5kaW5nRmlsdGVycygpIHtcblx0XHQvKiBUbyBiZSBvdmVycmlkZW4gKi9cblx0fVxuXG5cdGdldEN1cnJlbnRFbnRpdHlTZXQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldFRhYmxlKCk/LmRhdGEoXCJ0YXJnZXRDb2xsZWN0aW9uUGF0aFwiKS5zbGljZSgxKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgY2FsbGVkIHdoZW4gdGhlICdDbGVhcicgYnV0dG9uIG9uIHRoZSBGaWx0ZXJCYXIgaXMgcHJlc3NlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRvbkFmdGVyQ2xlYXIoKSB7XG5cdFx0LyogVG8gYmUgb3ZlcnJpZGVuICovXG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBtZXRob2QgaW5pdGlhdGVzIHRoZSB1cGRhdGUgb2YgdGhlIGVuYWJsZWQgc3RhdGUgb2YgdGhlIERhdGFGaWVsZEZvckFjdGlvbiBhbmQgdGhlIHZpc2libGUgc3RhdGUgb2YgdGhlIERhdGFGaWVsZEZvcklCTiBidXR0b25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gYVRhYmxlcyBBcnJheSBvZiB0YWJsZXMgaW4gdGhlIGxpc3QgcmVwb3J0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfdXBkYXRlVGFibGVBY3Rpb25zKGFUYWJsZXM6IGFueSkge1xuXHRcdGxldCBhSUJOQWN0aW9uczogYW55W10gPSBbXTtcblx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRhSUJOQWN0aW9ucyA9IENvbW1vblV0aWxzLmdldElCTkFjdGlvbnMob1RhYmxlLCBhSUJOQWN0aW9ucyk7XG5cdFx0XHQvLyBVcGRhdGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvckFjdGlvbiBidXR0b25zIG9uIHRhYmxlIHRvb2xiYXJcblx0XHRcdC8vIFRoZSBzYW1lIGlzIGFsc28gcGVyZm9ybWVkIG9uIFRhYmxlIHNlbGVjdGlvbkNoYW5nZSBldmVudFxuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIiksXG5cdFx0XHRcdG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRcdENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcIm9wZXJhdGlvbkF2YWlsYWJsZU1hcFwiKSlcblx0XHRcdFx0KSxcblx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMgPSBvVGFibGUuZ2V0U2VsZWN0ZWRDb250ZXh0cygpO1xuXG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzZWxlY3RlZENvbnRleHRzXCIsIGFTZWxlY3RlZENvbnRleHRzKTtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1wiLCBhU2VsZWN0ZWRDb250ZXh0cy5sZW5ndGgpO1xuXHRcdFx0Ly8gUmVmcmVzaCBlbmFibGVtZW50IG9mIGRlbGV0ZSBidXR0b25cblx0XHRcdERlbGV0ZUhlbHBlci51cGRhdGVEZWxldGVJbmZvRm9yU2VsZWN0ZWRDb250ZXh0cyhvSW50ZXJuYWxNb2RlbENvbnRleHQsIGFTZWxlY3RlZENvbnRleHRzKTtcblxuXHRcdFx0QWN0aW9uUnVudGltZS5zZXRBY3Rpb25FbmFibGVtZW50KG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCwgYVNlbGVjdGVkQ29udGV4dHMsIFwidGFibGVcIik7XG5cdFx0fSk7XG5cdFx0Q29tbW9uVXRpbHMudXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHkoYUlCTkFjdGlvbnMsIHRoaXMuZ2V0VmlldygpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBzY3JvbGxzIHRvIGEgc3BlY2lmaWMgcm93IG9uIGFsbCB0aGUgYXZhaWxhYmxlIHRhYmxlcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuTGlzdFJlcG9ydC5MaXN0UmVwb3J0Q29udHJvbGxlci5jb250cm9sbGVyI19zY3JvbGxUYWJsZXNUb1Jvd1xuXHQgKiBAcGFyYW0gc1Jvd1BhdGggVGhlIHBhdGggb2YgdGhlIHRhYmxlIHJvdyBjb250ZXh0IHRvIGJlIHNjcm9sbGVkIHRvXG5cdCAqL1xuXHRfc2Nyb2xsVGFibGVzVG9Sb3coc1Jvd1BhdGg6IHN0cmluZykge1xuXHRcdHRoaXMuX2dldENvbnRyb2xzKFwidGFibGVcIikuZm9yRWFjaChmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHRcdFRhYmxlU2Nyb2xsZXIuc2Nyb2xsVGFibGVUb1JvdyhvVGFibGUsIHNSb3dQYXRoKTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBzZXRzIHRoZSBpbml0aWFsIGZvY3VzIGluIGEgbGlzdCByZXBvcnQgYmFzZWQgb24gdGhlIFVzZXIgRXhwZXJpZW5jZSBndWlkZWxpbmVzLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5MaXN0UmVwb3J0Lkxpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXIjX3NldEluaXRpYWxGb2N1c1xuXHQgKi9cblx0X3NldEluaXRpYWxGb2N1cygpIHtcblx0XHRjb25zdCBkeW5hbWljUGFnZSA9IHRoaXMuX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbCgpLFxuXHRcdFx0aXNIZWFkZXJFeHBhbmRlZCA9IGR5bmFtaWNQYWdlLmdldEhlYWRlckV4cGFuZGVkKCksXG5cdFx0XHRmaWx0ZXJCYXIgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkgYXMgYW55O1xuXHRcdGlmIChmaWx0ZXJCYXIpIHtcblx0XHRcdC8vRW5hYmxpbmcgbWFuZGF0b3J5IGZpbHRlciBmaWVsZHMgbWVzc2FnZSBkaWFsb2dcblx0XHRcdGlmICghZmlsdGVyQmFyLmdldFNob3dNZXNzYWdlcygpKSB7XG5cdFx0XHRcdGZpbHRlckJhci5zZXRTaG93TWVzc2FnZXModHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaXNIZWFkZXJFeHBhbmRlZCkge1xuXHRcdFx0XHRjb25zdCBmaXJzdEVtcHR5TWFuZGF0b3J5RmllbGQgPSBmaWx0ZXJCYXIuZ2V0RmlsdGVySXRlbXMoKS5maW5kKGZ1bmN0aW9uIChvRmlsdGVySXRlbTogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9GaWx0ZXJJdGVtLmdldFJlcXVpcmVkKCkgJiYgb0ZpbHRlckl0ZW0uZ2V0Q29uZGl0aW9ucygpLmxlbmd0aCA9PT0gMDtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdC8vRm9jdXNpbmcgb24gdGhlIGZpcnN0IGVtcHR5IG1hbmRhdG9yeSBmaWx0ZXIgZmllbGQsIG9yIG9uIHRoZSBmaXJzdCBmaWx0ZXIgZmllbGQgaWYgdGhlIHRhYmxlIGRhdGEgaXMgbG9hZGVkXG5cdFx0XHRcdGlmIChmaXJzdEVtcHR5TWFuZGF0b3J5RmllbGQpIHtcblx0XHRcdFx0XHRmaXJzdEVtcHR5TWFuZGF0b3J5RmllbGQuZm9jdXMoKTtcblx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLl9pc0luaXRMb2FkRW5hYmxlZCgpICYmIGZpbHRlckJhci5nZXRGaWx0ZXJJdGVtcygpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHQvL0JDUDogMjM4MDAwODQwNiBBZGQgY2hlY2sgZm9yIGF2YWlsYWJsZSBmaWx0ZXJJdGVtc1xuXHRcdFx0XHRcdGZpbHRlckJhci5nZXRGaWx0ZXJJdGVtcygpWzBdLmZvY3VzKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly9Gb2N1c2luZyBvbiB0aGUgR28gYnV0dG9uXG5cdFx0XHRcdFx0dGhpcy5nZXRWaWV3KCkuYnlJZChgJHt0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sSWQoKX0tYnRuU2VhcmNoYCk/LmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAodGhpcy5faXNJbml0TG9hZEVuYWJsZWQoKSkge1xuXHRcdFx0XHR0aGlzLl9nZXRUYWJsZSgpXG5cdFx0XHRcdFx0Py5mb2N1c1JvdygwKVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgc2V0dGluZyBpbml0aWFsIGZvY3VzIG9uIHRoZSB0YWJsZSBcIiwgZXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9nZXRUYWJsZSgpXG5cdFx0XHRcdD8uZm9jdXNSb3coMClcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgc2V0dGluZyBpbml0aWFsIGZvY3VzIG9uIHRoZSB0YWJsZSBcIiwgZXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKSB7XG5cdFx0Y29uc3Qgb01hbmlmZXN0RW50cnkgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldE1hbmlmZXN0RW50cnkoXCJzYXAuYXBwXCIpO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogb01hbmlmZXN0RW50cnkudGl0bGUsXG5cdFx0XHRzdWJ0aXRsZTogb01hbmlmZXN0RW50cnkuc3ViVGl0bGUgfHwgXCJcIixcblx0XHRcdGludGVudDogXCJcIixcblx0XHRcdGljb246IFwiXCJcblx0XHR9O1xuXHR9XG5cblx0X2dldEZpbHRlckJhckNvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmJ5SWQodGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbElkKCkpIGFzIEZpbHRlckJhcjtcblx0fVxuXG5cdF9nZXREeW5hbWljTGlzdFJlcG9ydENvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmJ5SWQodGhpcy5fZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sSWQoKSkgYXMgRHluYW1pY1BhZ2U7XG5cdH1cblxuXHRfZ2V0QWRhcHRhdGlvbkZpbHRlckJhckNvbnRyb2woKSB7XG5cdFx0Ly8gSWYgdGhlIGFkYXB0YXRpb24gZmlsdGVyIGJhciBpcyBwYXJ0IG9mIHRoZSBET00gdHJlZSwgdGhlIFwiQWRhcHQgRmlsdGVyXCIgZGlhbG9nIGlzIG9wZW4sXG5cdFx0Ly8gYW5kIHdlIHJldHVybiB0aGUgYWRhcHRhdGlvbiBmaWx0ZXIgYmFyIGFzIGFuIGFjdGl2ZSBjb250cm9sICh2aXNpYmxlIGZvciB0aGUgdXNlcilcblx0XHRjb25zdCBhZGFwdGF0aW9uRmlsdGVyQmFyID0gKHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKSBhcyBhbnkpLmdldEluYnVpbHRGaWx0ZXIoKTtcblx0XHRyZXR1cm4gYWRhcHRhdGlvbkZpbHRlckJhcj8uZ2V0UGFyZW50KCkgPyBhZGFwdGF0aW9uRmlsdGVyQmFyIDogdW5kZWZpbmVkO1xuXHR9XG5cblx0X2dldFNlZ21lbnRlZEJ1dHRvbihzQ29udHJvbDogYW55KSB7XG5cdFx0Y29uc3Qgc1NlZ21lbnRlZEJ1dHRvbklkID0gKHNDb250cm9sID09PSBcIkNoYXJ0XCIgPyB0aGlzLmdldENoYXJ0Q29udHJvbCgpIDogdGhpcy5fZ2V0VGFibGUoKSk/LmRhdGEoXCJzZWdtZW50ZWRCdXR0b25JZFwiKTtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuYnlJZChzU2VnbWVudGVkQnV0dG9uSWQpO1xuXHR9XG5cblx0X2dldENvbnRyb2xGcm9tUGFnZU1vZGVsUHJvcGVydHkoc1BhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IGNvbnRyb2xJZCA9IHRoaXMuX2dldFBhZ2VNb2RlbCgpPy5nZXRQcm9wZXJ0eShzUGF0aCk7XG5cdFx0cmV0dXJuIGNvbnRyb2xJZCAmJiB0aGlzLmdldFZpZXcoKS5ieUlkKGNvbnRyb2xJZCk7XG5cdH1cblxuXHRfZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sSWQoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL2R5bmFtaWNMaXN0UmVwb3J0SWRcIikgfHwgXCJcIjtcblx0fVxuXG5cdF9nZXRGaWx0ZXJCYXJDb250cm9sSWQoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL2ZpbHRlckJhcklkXCIpIHx8IFwiXCI7XG5cdH1cblxuXHRnZXRDaGFydENvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldENvbnRyb2xGcm9tUGFnZU1vZGVsUHJvcGVydHkoXCIvc2luZ2xlQ2hhcnRJZFwiKTtcblx0fVxuXG5cdF9nZXRWaXN1YWxGaWx0ZXJCYXJDb250cm9sKCkge1xuXHRcdGNvbnN0IHNWaXN1YWxGaWx0ZXJCYXJJZCA9IFN0YWJsZUlkSGVscGVyLmdlbmVyYXRlKFtcInZpc3VhbEZpbHRlclwiLCB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sSWQoKV0pO1xuXHRcdHJldHVybiBzVmlzdWFsRmlsdGVyQmFySWQgJiYgdGhpcy5nZXRWaWV3KCkuYnlJZChzVmlzdWFsRmlsdGVyQmFySWQpO1xuXHR9XG5cblx0X2dldEZpbHRlckJhclZhcmlhbnRDb250cm9sKCkge1xuXHRcdHJldHVybiB0aGlzLl9nZXRDb250cm9sRnJvbVBhZ2VNb2RlbFByb3BlcnR5KFwiL3ZhcmlhbnRNYW5hZ2VtZW50L2lkXCIpO1xuXHR9XG5cblx0X2dldE11bHRpTW9kZUNvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmJ5SWQoXCJmZTo6VGFiTXVsdGlwbGVNb2RlOjpDb250cm9sXCIpIGFzIE11bHRpcGxlTW9kZUNvbnRyb2w7XG5cdH1cblxuXHRfZ2V0VGFibGUoKTogVGFibGUgfCB1bmRlZmluZWQge1xuXHRcdGlmICh0aGlzLl9pc011bHRpTW9kZSgpKSB7XG5cdFx0XHRjb25zdCBvQ29udHJvbCA9IHRoaXMuX2dldE11bHRpTW9kZUNvbnRyb2woKT8uZ2V0U2VsZWN0ZWRJbm5lckNvbnRyb2woKT8uY29udGVudDtcblx0XHRcdHJldHVybiBvQ29udHJvbD8uaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSA/IChvQ29udHJvbCBhcyBUYWJsZSkgOiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0aGlzLl9nZXRDb250cm9sRnJvbVBhZ2VNb2RlbFByb3BlcnR5KFwiL3NpbmdsZVRhYmxlSWRcIikgYXMgVGFibGU7XG5cdFx0fVxuXHR9XG5cblx0X2dldENvbnRyb2xzKHNLZXk/OiBhbnkpIHtcblx0XHRpZiAodGhpcy5faXNNdWx0aU1vZGUoKSkge1xuXHRcdFx0Y29uc3QgYUNvbnRyb2xzOiBhbnlbXSA9IFtdO1xuXHRcdFx0Y29uc3Qgb1RhYk11bHRpTW9kZSA9IHRoaXMuX2dldE11bHRpTW9kZUNvbnRyb2woKS5jb250ZW50O1xuXHRcdFx0b1RhYk11bHRpTW9kZS5nZXRJdGVtcygpLmZvckVhY2goKG9JdGVtOiBhbnkpID0+IHtcblx0XHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSB0aGlzLmdldFZpZXcoKS5ieUlkKG9JdGVtLmdldEtleSgpKTtcblx0XHRcdFx0aWYgKG9Db250cm9sICYmIHNLZXkpIHtcblx0XHRcdFx0XHRpZiAob0l0ZW0uZ2V0S2V5KCkuaW5kZXhPZihgZmU6OiR7c0tleX1gKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRhQ29udHJvbHMucHVzaChvQ29udHJvbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKG9Db250cm9sICE9PSB1bmRlZmluZWQgJiYgb0NvbnRyb2wgIT09IG51bGwpIHtcblx0XHRcdFx0XHRhQ29udHJvbHMucHVzaChvQ29udHJvbCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGFDb250cm9scztcblx0XHR9IGVsc2UgaWYgKHNLZXkgPT09IFwiQ2hhcnRcIikge1xuXHRcdFx0Y29uc3Qgb0NoYXJ0ID0gdGhpcy5nZXRDaGFydENvbnRyb2woKTtcblx0XHRcdHJldHVybiBvQ2hhcnQgPyBbb0NoYXJ0XSA6IFtdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBvVGFibGUgPSB0aGlzLl9nZXRUYWJsZSgpO1xuXHRcdFx0cmV0dXJuIG9UYWJsZSA/IFtvVGFibGVdIDogW107XG5cdFx0fVxuXHR9XG5cblx0X2dldERlZmF1bHRQYXRoKCkge1xuXHRcdGNvbnN0IGRlZmF1bHRQYXRoID0gTGlzdFJlcG9ydFRlbXBsYXRpbmcuZ2V0RGVmYXVsdFBhdGgodGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL3ZpZXdzXCIpIHx8IFtdKTtcblx0XHRzd2l0Y2ggKGRlZmF1bHRQYXRoKSB7XG5cdFx0XHRjYXNlIFwicHJpbWFyeVwiOlxuXHRcdFx0XHRyZXR1cm4gVGVtcGxhdGVDb250ZW50Vmlldy5DaGFydDtcblx0XHRcdGNhc2UgXCJzZWNvbmRhcnlcIjpcblx0XHRcdFx0cmV0dXJuIFRlbXBsYXRlQ29udGVudFZpZXcuVGFibGU7XG5cdFx0XHRjYXNlIFwiYm90aFwiOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIFRlbXBsYXRlQ29udGVudFZpZXcuSHlicmlkO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8ga25vdyBpZiBMaXN0UmVwb3J0IGlzIGNvbmZpZ3VyZWQgd2l0aCBNdWx0aXBsZSBUYWJsZSBtb2RlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2lzTXVsdGlNb2RlXG5cdCAqIEByZXR1cm5zIElzIE11bHRpcGxlIFRhYmxlIG1vZGUgc2V0P1xuXHQgKi9cblx0X2lzTXVsdGlNb2RlKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAhIXRoaXMuX2dldFBhZ2VNb2RlbCgpPy5nZXRQcm9wZXJ0eShcIi9tdWx0aVZpZXdzQ29udHJvbFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8ga25vdyBpZiBMaXN0UmVwb3J0IGlzIGNvbmZpZ3VyZWQgdG8gbG9hZCBkYXRhIGF0IHN0YXJ0IHVwLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2lzSW5pdExvYWREaXNhYmxlZFxuXHQgKiBAcmV0dXJucyBJcyBJbml0TG9hZCBlbmFibGVkP1xuXHQgKi9cblx0X2lzSW5pdExvYWRFbmFibGVkKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGluaXRMb2FkTW9kZSA9ICh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuaW5pdGlhbExvYWQ7XG5cdFx0cmV0dXJuIGluaXRMb2FkTW9kZSA9PT0gSW5pdGlhbExvYWRNb2RlLkVuYWJsZWQ7XG5cdH1cblxuXHRfaGFzTXVsdGlWaXN1YWxpemF0aW9ucygpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0UGFnZU1vZGVsKCk/LmdldFByb3BlcnR5KFwiL2hhc011bHRpVmlzdWFsaXphdGlvbnNcIik7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHN1c3BlbmQgc2VhcmNoIG9uIHRoZSBmaWx0ZXIgYmFyLiBUaGUgaW5pdGlhbCBsb2FkaW5nIG9mIGRhdGEgaXMgZGlzYWJsZWQgYmFzZWQgb24gdGhlIG1hbmlmZXN0IGNvbmZpZ3VyYXRpb24gSW5pdExvYWQgLSBEaXNhYmxlZC9BdXRvLlxuXHQgKiBJdCBpcyBlbmFibGVkIGxhdGVyIHdoZW4gdGhlIHZpZXcgc3RhdGUgaXMgc2V0LCB3aGVuIGl0IGlzIHBvc3NpYmxlIHRvIHJlYWxpemUgaWYgdGhlcmUgYXJlIGRlZmF1bHQgZmlsdGVycy5cblx0ICovXG5cdF9kaXNhYmxlSW5pdExvYWQoKSB7XG5cdFx0Y29uc3QgZmlsdGVyQmFyID0gdGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdC8vIGNoZWNrIGZvciBmaWx0ZXIgYmFyIGhpZGRlblxuXHRcdGlmIChmaWx0ZXJCYXIpIHtcblx0XHRcdGZpbHRlckJhci5zZXRTdXNwZW5kU2VsZWN0aW9uKHRydWUpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgY2FsbGVkIGJ5IGZsZXggdG8gZGV0ZXJtaW5lIGlmIHRoZSBhcHBseUF1dG9tYXRpY2FsbHkgc2V0dGluZyBvbiB0aGUgdmFyaWFudCBpcyB2YWxpZC5cblx0ICogQ2FsbGVkIG9ubHkgZm9yIFN0YW5kYXJkIFZhcmlhbnQgYW5kIG9ubHkgd2hlbiB0aGVyZSBpcyBkaXNwbGF5IHRleHQgc2V0IGZvciBhcHBseUF1dG9tYXRpY2FsbHkgKEZFIG9ubHkgc2V0cyBpdCBmb3IgQXV0bykuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEJvb2xlYW4gdHJ1ZSBpZiBkYXRhIHNob3VsZCBiZSBsb2FkZWQgYXV0b21hdGljYWxseSwgZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRfYXBwbHlBdXRvbWF0aWNhbGx5T25TdGFuZGFyZFZhcmlhbnQoKSB7XG5cdFx0Ly8gV2UgYWx3YXlzIHJldHVybiBmYWxzZSBhbmQgdGFrZSBjYXJlIG9mIGl0IHdoZW4gdmlldyBzdGF0ZSBpcyBzZXRcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ29uZmlndXJlIHRoZSBzZXR0aW5ncyBmb3IgaW5pdGlhbCBsb2FkIGJhc2VkIG9uXG5cdCAqIC0gbWFuaWZlc3Qgc2V0dGluZyBpbml0TG9hZCAtIEVuYWJsZWQvRGlzYWJsZWQvQXV0b1xuXHQgKiAtIHVzZXIncyBzZXR0aW5nIG9mIGFwcGx5QXV0b21hdGljYWxseSBvbiB2YXJpYW50XG5cdCAqIC0gaWYgdGhlcmUgYXJlIGRlZmF1bHQgZmlsdGVyc1xuXHQgKiBXZSBkaXNhYmxlIHRoZSBmaWx0ZXIgYmFyIHNlYXJjaCBhdCB0aGUgYmVnaW5uaW5nIGFuZCBlbmFibGUgaXQgd2hlbiB2aWV3IHN0YXRlIGlzIHNldC5cblx0ICovXG5cdF9zZXRJbml0TG9hZCgpIHtcblx0XHQvLyBpZiBpbml0TG9hZCBpcyBEaXNhYmxlZCBvciBBdXRvLCBzd2l0Y2ggb2ZmIGZpbHRlciBiYXIgc2VhcmNoIHRlbXBvcmFyaWx5IGF0IHN0YXJ0XG5cdFx0aWYgKCF0aGlzLl9pc0luaXRMb2FkRW5hYmxlZCgpKSB7XG5cdFx0XHR0aGlzLl9kaXNhYmxlSW5pdExvYWQoKTtcblx0XHR9XG5cdFx0Ly8gc2V0IGhvb2sgZm9yIGZsZXggZm9yIHdoZW4gc3RhbmRhcmQgdmFyaWFudCBpcyBzZXQgKGF0IHN0YXJ0IG9yIGJ5IHVzZXIgYXQgcnVudGltZSlcblx0XHQvLyByZXF1aXJlZCB0byBvdmVycmlkZSB0aGUgdXNlciBzZXR0aW5nICdhcHBseSBhdXRvbWF0aWNhbGx5JyBiZWhhdmlvdXIgaWYgdGhlcmUgYXJlIG5vIGZpbHRlcnNcblx0XHRjb25zdCB2YXJpYW50TWFuYWdlbWVudElkOiBhbnkgPSBMaXN0UmVwb3J0VGVtcGxhdGluZy5nZXRWYXJpYW50QmFja1JlZmVyZW5jZShcblx0XHRcdHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgVmlld0RhdGEsXG5cdFx0XHR0aGlzLl9nZXRQYWdlTW9kZWwoKT8uZ2V0RGF0YSgpIGFzIExpc3RSZXBvcnREZWZpbml0aW9uXG5cdFx0KTtcblx0XHRjb25zdCB2YXJpYW50TWFuYWdlbWVudCA9IHZhcmlhbnRNYW5hZ2VtZW50SWQgJiYgdGhpcy5nZXRWaWV3KCkuYnlJZCh2YXJpYW50TWFuYWdlbWVudElkKTtcblx0XHRpZiAodmFyaWFudE1hbmFnZW1lbnQpIHtcblx0XHRcdHZhcmlhbnRNYW5hZ2VtZW50LnJlZ2lzdGVyQXBwbHlBdXRvbWF0aWNhbGx5T25TdGFuZGFyZFZhcmlhbnQodGhpcy5fYXBwbHlBdXRvbWF0aWNhbGx5T25TdGFuZGFyZFZhcmlhbnQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHR9XG5cblx0X3NldFNoYXJlTW9kZWwoKSB7XG5cdFx0Ly8gVE9ETzogZGVhY3RpdmF0ZWQgZm9yIG5vdyAtIGN1cnJlbnRseSB0aGVyZSBpcyBubyBfdGVtcGxQcml2IGFueW1vcmUsIHRvIGJlIGRpc2N1c3NlZFxuXHRcdC8vIHRoaXMgbWV0aG9kIGlzIGN1cnJlbnRseSBub3QgY2FsbGVkIGFueW1vcmUgZnJvbSB0aGUgaW5pdCBtZXRob2RcblxuXHRcdGNvbnN0IGZuR2V0VXNlciA9IE9iamVjdFBhdGguZ2V0KFwic2FwLnVzaGVsbC5Db250YWluZXIuZ2V0VXNlclwiKTtcblx0XHQvL3ZhciBvTWFuaWZlc3QgPSB0aGlzLmdldE93bmVyQ29tcG9uZW50KCkuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0TWV0YWRhdGEoKS5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLnVpXCIpO1xuXHRcdC8vdmFyIHNCb29rbWFya0ljb24gPSAob01hbmlmZXN0ICYmIG9NYW5pZmVzdC5pY29ucyAmJiBvTWFuaWZlc3QuaWNvbnMuaWNvbikgfHwgXCJcIjtcblxuXHRcdC8vc2hhcmVNb2RlbDogSG9sZHMgYWxsIHRoZSBzaGFyaW5nIHJlbGV2YW50IGluZm9ybWF0aW9uIGFuZCBpbmZvIHVzZWQgaW4gWE1MIHZpZXdcblx0XHRjb25zdCBvU2hhcmVJbmZvID0ge1xuXHRcdFx0Ym9va21hcmtUaXRsZTogZG9jdW1lbnQudGl0bGUsIC8vVG8gbmFtZSB0aGUgYm9va21hcmsgYWNjb3JkaW5nIHRvIHRoZSBhcHAgdGl0bGUuXG5cdFx0XHRib29rbWFya0N1c3RvbVVybDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRjb25zdCBzSGFzaCA9IGhhc2hlci5nZXRIYXNoKCk7XG5cdFx0XHRcdHJldHVybiBzSGFzaCA/IGAjJHtzSGFzaH1gIDogd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cdFx0XHR9LFxuXHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0VG8gYmUgYWN0aXZhdGVkIG9uY2UgdGhlIEZMUCBzaG93cyB0aGUgY291bnQgLSBzZWUgY29tbWVudCBhYm92ZVxuXHRcdFx0XHRcdFx0XHRib29rbWFya1NlcnZpY2VVcmw6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vdmFyIG9UYWJsZSA9IG9UYWJsZS5nZXRJbm5lclRhYmxlKCk7IG9UYWJsZSBpcyBhbHJlYWR5IHRoZSBzYXAuZmUgdGFibGUgKGJ1dCBub3QgdGhlIGlubmVyIG9uZSlcblx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBzaG91bGQgdXNlIHRhYmxlLmdldExpc3RCaW5kaW5nSW5mbyBpbnN0ZWFkIG9mIHRoZSBiaW5kaW5nXG5cdFx0XHRcdFx0XHRcdFx0dmFyIG9CaW5kaW5nID0gb1RhYmxlLmdldEJpbmRpbmcoXCJyb3dzXCIpIHx8IG9UYWJsZS5nZXRCaW5kaW5nKFwiaXRlbXNcIik7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9CaW5kaW5nID8gZm5HZXREb3dubG9hZFVybChvQmluZGluZykgOiBcIlwiO1xuXHRcdFx0XHRcdFx0XHR9LCovXG5cdFx0XHRpc1NoYXJlSW5KYW1BY3RpdmU6ICEhZm5HZXRVc2VyICYmIGZuR2V0VXNlcigpLmlzSmFtQWN0aXZlKClcblx0XHR9O1xuXG5cdFx0Y29uc3Qgb1RlbXBsYXRlUHJpdmF0ZU1vZGVsID0gdGhpcy5nZXRPd25lckNvbXBvbmVudCgpLmdldE1vZGVsKFwiX3RlbXBsUHJpdlwiKSBhcyBKU09OTW9kZWw7XG5cdFx0b1RlbXBsYXRlUHJpdmF0ZU1vZGVsLnNldFByb3BlcnR5KFwiL2xpc3RSZXBvcnQvc2hhcmVcIiwgb1NoYXJlSW5mbyk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHVwZGF0ZSB0aGUgbG9jYWwgVUkgbW9kZWwgb2YgdGhlIHBhZ2Ugd2l0aCB0aGUgZmllbGRzIHRoYXQgYXJlIG5vdCBhcHBsaWNhYmxlIHRvIHRoZSBmaWx0ZXIgYmFyICh0aGlzIGlzIHNwZWNpZmljIHRvIHRoZSBBTFAgc2NlbmFyaW8pLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0ludGVybmFsTW9kZWxDb250ZXh0IFRoZSBpbnRlcm5hbCBtb2RlbCBjb250ZXh0XG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyIE1EQyBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRfdXBkYXRlQUxQTm90QXBwbGljYWJsZUZpZWxkcyhvSW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LCBvRmlsdGVyQmFyOiBGaWx0ZXJCYXIpIHtcblx0XHRjb25zdCBtQ2FjaGU6IGFueSA9IHt9O1xuXHRcdGNvbnN0IGlnbm9yZWRGaWVsZHM6IGFueSA9IHt9LFxuXHRcdFx0YVRhYmxlcyA9IHRoaXMuX2dldENvbnRyb2xzKFwidGFibGVcIiksXG5cdFx0XHRhQ2hhcnRzID0gdGhpcy5fZ2V0Q29udHJvbHMoXCJDaGFydFwiKTtcblxuXHRcdGlmICghYVRhYmxlcy5sZW5ndGggfHwgIWFDaGFydHMubGVuZ3RoKSB7XG5cdFx0XHQvLyBJZiB0aGVyZSdzIG5vdCBhIHRhYmxlIGFuZCBhIGNoYXJ0LCB3ZSdyZSBub3QgaW4gdGhlIEFMUCBjYXNlXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gRm9yIHRoZSBtb21lbnQsIHRoZXJlJ3Mgbm90aGluZyBmb3IgdGFibGVzLi4uXG5cdFx0YUNoYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSkge1xuXHRcdFx0Y29uc3Qgc0NoYXJ0RW50aXR5UGF0aCA9IG9DaGFydC5kYXRhKFwidGFyZ2V0Q29sbGVjdGlvblBhdGhcIiksXG5cdFx0XHRcdHNDaGFydEVudGl0eVNldCA9IHNDaGFydEVudGl0eVBhdGguc2xpY2UoMSksXG5cdFx0XHRcdHNDYWNoZUtleSA9IGAke3NDaGFydEVudGl0eVNldH1DaGFydGA7XG5cdFx0XHRpZiAoIW1DYWNoZVtzQ2FjaGVLZXldKSB7XG5cdFx0XHRcdG1DYWNoZVtzQ2FjaGVLZXldID0gRmlsdGVyVXRpbHMuZ2V0Tm90QXBwbGljYWJsZUZpbHRlcnMob0ZpbHRlckJhciwgb0NoYXJ0KTtcblx0XHRcdH1cblx0XHRcdGlnbm9yZWRGaWVsZHNbc0NhY2hlS2V5XSA9IG1DYWNoZVtzQ2FjaGVLZXldO1xuXHRcdH0pO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNvbnRyb2xzL2lnbm9yZWRGaWVsZHNcIiwgaWdub3JlZEZpZWxkcyk7XG5cdH1cblxuXHRfaXNGaWx0ZXJCYXJIaWRkZW4oKSB7XG5cdFx0cmV0dXJuICh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuaGlkZUZpbHRlckJhcjtcblx0fVxuXG5cdF9nZXRBcHBseUF1dG9tYXRpY2FsbHlPblZhcmlhbnQoVmFyaWFudE1hbmFnZW1lbnQ6IGFueSwga2V5OiBzdHJpbmcpOiBCb29sZWFuIHtcblx0XHRpZiAoIVZhcmlhbnRNYW5hZ2VtZW50IHx8ICFrZXkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Y29uc3QgdmFyaWFudHMgPSBWYXJpYW50TWFuYWdlbWVudC5nZXRWYXJpYW50cygpO1xuXHRcdGNvbnN0IGN1cnJlbnRWYXJpYW50ID0gdmFyaWFudHMuZmluZChmdW5jdGlvbiAodmFyaWFudDogYW55KSB7XG5cdFx0XHRyZXR1cm4gdmFyaWFudCAmJiB2YXJpYW50LmtleSA9PT0ga2V5O1xuXHRcdH0pO1xuXHRcdHJldHVybiAoY3VycmVudFZhcmlhbnQgJiYgY3VycmVudFZhcmlhbnQuZXhlY3V0ZU9uU2VsZWN0KSB8fCBmYWxzZTtcblx0fVxuXG5cdF9zaG91bGRBdXRvVHJpZ2dlclNlYXJjaChvVk06IGFueSkge1xuXHRcdGlmIChcblx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuaW5pdGlhbExvYWQgPT09IEluaXRpYWxMb2FkTW9kZS5BdXRvICYmXG5cdFx0XHQoIW9WTSB8fCBvVk0uZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCkgPT09IG9WTS5nZXRDdXJyZW50VmFyaWFudEtleSgpKVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRcdGNvbnN0IG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCk7XG5cdFx0XHRcdGZvciAoY29uc3Qgc0tleSBpbiBvQ29uZGl0aW9ucykge1xuXHRcdFx0XHRcdC8vIGlnbm9yZSBmaWx0ZXJzIHN0YXJ0aW5nIHdpdGggJCAoZS5nLiAkc2VhcmNoLCAkZWRpdFN0YXRlKVxuXHRcdFx0XHRcdGlmICghc0tleS5zdGFydHNXaXRoKFwiJFwiKSAmJiBBcnJheS5pc0FycmF5KG9Db25kaXRpb25zW3NLZXldKSAmJiBvQ29uZGl0aW9uc1tzS2V5XS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdC8vIGxvYWQgZGF0YSBhcyBwZXIgdXNlcidzIHNldHRpbmcgb2YgYXBwbHlBdXRvbWF0aWNhbGx5IG9uIHRoZSB2YXJpYW50XG5cdFx0XHRcdFx0XHRjb25zdCBzdGFuZGFyZFZhcmlhbnQ6IGFueSA9IG9WTS5nZXRWYXJpYW50cygpLmZpbmQoKHZhcmlhbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gdmFyaWFudC5rZXkgPT09IG9WTS5nZXRDdXJyZW50VmFyaWFudEtleSgpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc3RhbmRhcmRWYXJpYW50ICYmIHN0YW5kYXJkVmFyaWFudC5leGVjdXRlT25TZWxlY3Q7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdF91cGRhdGVUYWJsZShvVGFibGU6IGFueSkge1xuXHRcdGlmICghb1RhYmxlLmlzVGFibGVCb3VuZCgpIHx8IHRoaXMuaGFzUGVuZGluZ0NoYXJ0Q2hhbmdlcykge1xuXHRcdFx0b1RhYmxlLnJlYmluZCgpO1xuXHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0X3VwZGF0ZUNoYXJ0KG9DaGFydDogYW55KSB7XG5cdFx0Y29uc3Qgb0lubmVyQ2hhcnQgPSBvQ2hhcnQuZ2V0Q29udHJvbERlbGVnYXRlKCkuX2dldENoYXJ0KG9DaGFydCk7XG5cdFx0aWYgKCEob0lubmVyQ2hhcnQgJiYgb0lubmVyQ2hhcnQuaXNCb3VuZChcImRhdGFcIikpIHx8IHRoaXMuaGFzUGVuZGluZ1RhYmxlQ2hhbmdlcykge1xuXHRcdFx0b0NoYXJ0LmdldENvbnRyb2xEZWxlZ2F0ZSgpLnJlYmluZChvQ2hhcnQsIG9Jbm5lckNoYXJ0LmdldEJpbmRpbmdJbmZvKFwiZGF0YVwiKSk7XG5cdFx0XHR0aGlzLmhhc1BlbmRpbmdUYWJsZUNoYW5nZXMgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRoYW5kbGVycyA9IHtcblx0XHRvbkZpbHRlclNlYXJjaCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0Y29uc3QgZmlsdGVyQmFyQVBJID0gdGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpLmdldFBhcmVudCgpIGFzIEZpbHRlckJhckFQSTtcblx0XHRcdGZpbHRlckJhckFQSS50cmlnZ2VyU2VhcmNoKCk7XG5cdFx0fSxcblx0XHRvbkZpbHRlcnNDaGFuZ2VkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0ZpbHRlckJhciA9IHRoaXMuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdC8vIFBlbmRpbmcgZmlsdGVycyBpbnRvIEZpbHRlckJhciB0byBiZSB1c2VkIGZvciBjdXN0b20gdmlld3Ncblx0XHRcdFx0dGhpcy5vblBlbmRpbmdGaWx0ZXJzKCk7XG5cdFx0XHRcdGNvbnN0IGFwcGxpZWRGaWx0ZXJzVGV4dCA9IG9GaWx0ZXJCYXIuZ2V0QXNzaWduZWRGaWx0ZXJzVGV4dCgpLmZpbHRlcnNUZXh0O1xuXHRcdFx0XHRjb25zdCBhcHBsaWVkRmlsdGVyQmluZGluZyA9IGJpbmRpbmdQYXJzZXIoYXBwbGllZEZpbHRlcnNUZXh0KTtcblx0XHRcdFx0aWYgKGFwcGxpZWRGaWx0ZXJCaW5kaW5nKSB7XG5cdFx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmJ5SWQoXCJmZTo6YXBwbGllZEZpbHRlcnNUZXh0XCIpIGFzIFRleHQgfCB1bmRlZmluZWQpPy5iaW5kVGV4dChhcHBsaWVkRmlsdGVyQmluZGluZyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0KHRoaXMuZ2V0VmlldygpLmJ5SWQoXCJmZTo6YXBwbGllZEZpbHRlcnNUZXh0XCIpIGFzIFRleHQgfCB1bmRlZmluZWQpPy5zZXRUZXh0KGFwcGxpZWRGaWx0ZXJzVGV4dCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob0ludGVybmFsTW9kZWxDb250ZXh0ICYmIG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJjb25kaXRpb25zQmFzZWRcIikpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJoYXNQZW5kaW5nRmlsdGVyc1wiLCB0cnVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0b25WYXJpYW50U2VsZWN0ZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBvVk0gPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0XHRjb25zdCBjdXJyZW50VmFyaWFudEtleSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJrZXlcIik7XG5cdFx0XHRjb25zdCBvTXVsdGlNb2RlQ29udHJvbCA9IHRoaXMuX2dldE11bHRpTW9kZUNvbnRyb2woKTtcblxuXHRcdFx0aWYgKG9NdWx0aU1vZGVDb250cm9sICYmICFvVk0/LmdldFBhcmVudCgpLmlzQShcInNhcC51aS5tZGMuQWN0aW9uVG9vbGJhclwiKSkge1xuXHRcdFx0XHQvL05vdCBhIENvbnRyb2wgVmFyaWFudFxuXHRcdFx0XHRvTXVsdGlNb2RlQ29udHJvbD8uaW52YWxpZGF0ZUNvbnRlbnQoKTtcblx0XHRcdFx0b011bHRpTW9kZUNvbnRyb2w/LnNldEZyZWV6ZUNvbnRlbnQodHJ1ZSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHNldFRpbWVvdXQgY2F1c2UgdGhlIHZhcmlhbnQgbmVlZHMgdG8gYmUgYXBwbGllZCBiZWZvcmUganVkZ2luZyB0aGUgYXV0byBzZWFyY2ggb3IgdXBkYXRpbmcgdGhlIGFwcCBzdGF0ZVxuXHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdGlmICh0aGlzLl9zaG91bGRBdXRvVHJpZ2dlclNlYXJjaChvVk0pKSB7XG5cdFx0XHRcdFx0Ly8gdGhlIGFwcCBzdGF0ZSB3aWxsIGJlIHVwZGF0ZWQgdmlhIG9uU2VhcmNoIGhhbmRsZXJcblx0XHRcdFx0XHRjb25zdCBmaWx0ZXJCYXJBUEkgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkuZ2V0UGFyZW50KCkgYXMgRmlsdGVyQmFyQVBJO1xuXHRcdFx0XHRcdHJldHVybiBmaWx0ZXJCYXJBUEkudHJpZ2dlclNlYXJjaCgpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCF0aGlzLl9nZXRBcHBseUF1dG9tYXRpY2FsbHlPblZhcmlhbnQob1ZNLCBjdXJyZW50VmFyaWFudEtleSkpIHtcblx0XHRcdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIDApO1xuXHRcdH0sXG5cdFx0b25WYXJpYW50U2F2ZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIpIHtcblx0XHRcdC8vVE9ETzogU2hvdWxkIHJlbW92ZSB0aGlzIHNldFRpbWVPdXQgb25jZSBWYXJpYW50IE1hbmFnZW1lbnQgcHJvdmlkZXMgYW4gYXBpIHRvIGZldGNoIHRoZSBjdXJyZW50IHZhcmlhbnQga2V5IG9uIHNhdmUhISFcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0XHR9LCAxMDAwKTtcblx0XHR9LFxuXHRcdG9uU2VhcmNoKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyKSB7XG5cdFx0XHRjb25zdCBvRmlsdGVyQmFyID0gdGhpcy5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdGNvbnN0IG9NZGNDaGFydCA9IHRoaXMuZ2V0Q2hhcnRDb250cm9sKCk7XG5cdFx0XHRjb25zdCBiSGlkZURyYWZ0ID0gRmlsdGVyVXRpbHMuZ2V0RWRpdFN0YXRlSXNIaWRlRHJhZnQob0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCkpO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGFzUGVuZGluZ0ZpbHRlcnNcIiwgZmFsc2UpO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGlkZURyYWZ0SW5mb1wiLCBiSGlkZURyYWZ0KTtcblxuXHRcdFx0aWYgKCF0aGlzLl9nZXRNdWx0aU1vZGVDb250cm9sKCkpIHtcblx0XHRcdFx0dGhpcy5fdXBkYXRlQUxQTm90QXBwbGljYWJsZUZpZWxkcyhvSW50ZXJuYWxNb2RlbENvbnRleHQsIG9GaWx0ZXJCYXIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9NZGNDaGFydCkge1xuXHRcdFx0XHQvLyBkaXNhYmxlIGJvdW5kIGFjdGlvbnMgVE9ETzogdGhpcyBjbGVhcnMgZXZlcnl0aGluZyBmb3IgdGhlIGNoYXJ0P1xuXHRcdFx0XHQob01kY0NoYXJ0LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpLnNldFByb3BlcnR5KFwiXCIsIHt9KTtcblxuXHRcdFx0XHRjb25zdCBvUGFnZUludGVybmFsTW9kZWxDb250ZXh0ID0gb01kY0NoYXJ0LmdldEJpbmRpbmdDb250ZXh0KFwicGFnZUludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0XHRjb25zdCBzVGVtcGxhdGVDb250ZW50VmlldyA9IG9QYWdlSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoYCR7b1BhZ2VJbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCk7XG5cdFx0XHRcdGlmIChzVGVtcGxhdGVDb250ZW50VmlldyA9PT0gVGVtcGxhdGVDb250ZW50Vmlldy5DaGFydCkge1xuXHRcdFx0XHRcdHRoaXMuaGFzUGVuZGluZ0NoYXJ0Q2hhbmdlcyA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID09PSBUZW1wbGF0ZUNvbnRlbnRWaWV3LlRhYmxlKSB7XG5cdFx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nVGFibGVDaGFuZ2VzID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gc3RvcmUgZmlsdGVyIGJhciBjb25kaXRpb25zIHRvIHVzZSBsYXRlciB3aGlsZSBuYXZpZ2F0aW9uXG5cdFx0XHRTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIpXG5cdFx0XHRcdC50aGVuKChvRXh0ZXJuYWxTdGF0ZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5maWx0ZXJCYXJDb25kaXRpb25zID0gb0V4dGVybmFsU3RhdGUuZmlsdGVyO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgZXh0ZXJuYWwgc3RhdGVcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRpZiAoKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5saXZlTW9kZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc3lzdGVtLnBob25lKSB7XG5cdFx0XHRcdGNvbnN0IG9EeW5hbWljUGFnZSA9IHRoaXMuX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbCgpO1xuXHRcdFx0XHRvRHluYW1pY1BhZ2Uuc2V0SGVhZGVyRXhwYW5kZWQoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogVHJpZ2dlcnMgYW4gb3V0Ym91bmQgbmF2aWdhdGlvbiB3aGVuIGEgdXNlciBjaG9vc2VzIHRoZSBjaGV2cm9uLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIG9Db250cm9sbGVyXG5cdFx0ICogQHBhcmFtIHNPdXRib3VuZFRhcmdldCBOYW1lIG9mIHRoZSBvdXRib3VuZCB0YXJnZXQgKG5lZWRzIHRvIGJlIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0KVxuXHRcdCAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IGNvbnRhaW5zIHRoZSBkYXRhIGZvciB0aGUgdGFyZ2V0IGFwcFxuXHRcdCAqIEBwYXJhbSBzQ3JlYXRlUGF0aCBDcmVhdGUgcGF0aCB3aGVuIHRoZSBjaGV2cm9uIGlzIGNyZWF0ZWQuXG5cdFx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCBpcyByZXNvbHZlZCBvbmNlIHRoZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZFxuXHRcdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHRcdCAqIEBmaW5hbFxuXHRcdCAqL1xuXHRcdG9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZChvQ29udHJvbGxlcjogTGlzdFJlcG9ydENvbnRyb2xsZXIsIHNPdXRib3VuZFRhcmdldDogc3RyaW5nLCBvQ29udGV4dDogQ29udGV4dCwgc0NyZWF0ZVBhdGg6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyLCBzT3V0Ym91bmRUYXJnZXQsIG9Db250ZXh0LCBzQ3JlYXRlUGF0aCk7XG5cdFx0fSxcblx0XHRvbkNoYXJ0U2VsZWN0aW9uQ2hhbmdlZCh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlciwgb0V2ZW50OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9NZGNDaGFydCA9IG9FdmVudC5nZXRTb3VyY2UoKS5nZXRDb250ZW50KCksXG5cdFx0XHRcdG9UYWJsZSA9IHRoaXMuX2dldFRhYmxlKCksXG5cdFx0XHRcdGFEYXRhID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImRhdGFcIiksXG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRpZiAoYURhdGEpIHtcblx0XHRcdFx0Q2hhcnRVdGlscy5zZXRDaGFydEZpbHRlcnMob01kY0NoYXJ0KTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IHNUZW1wbGF0ZUNvbnRlbnRWaWV3ID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCk7XG5cdFx0XHRpZiAoc1RlbXBsYXRlQ29udGVudFZpZXcgPT09IFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQpIHtcblx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAob1RhYmxlKSB7XG5cdFx0XHRcdChvVGFibGUgYXMgYW55KS5yZWJpbmQoKTtcblx0XHRcdFx0dGhpcy5oYXNQZW5kaW5nQ2hhcnRDaGFuZ2VzID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQodGhpczogTGlzdFJlcG9ydENvbnRyb2xsZXIsIG9FdmVudDogYW55KSB7XG5cdFx0XHRjb25zdCBzU2VsZWN0ZWRLZXkgPSBvRXZlbnQubVBhcmFtZXRlcnMua2V5ID8gb0V2ZW50Lm1QYXJhbWV0ZXJzLmtleSA6IG51bGw7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiYWxwQ29udGVudFZpZXdcIiwgc1NlbGVjdGVkS2V5KTtcblx0XHRcdGNvbnN0IG9DaGFydCA9IHRoaXMuZ2V0Q2hhcnRDb250cm9sKCk7XG5cdFx0XHRjb25zdCBvVGFibGUgPSB0aGlzLl9nZXRUYWJsZSgpO1xuXHRcdFx0Y29uc3Qgb1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlID0ge1xuXHRcdFx0XHRvbkFmdGVyUmVuZGVyaW5nKCkge1xuXHRcdFx0XHRcdGNvbnN0IGFJdGVtcyA9IG9TZWdtZW50ZWRCdXR0b24uZ2V0SXRlbXMoKTtcblx0XHRcdFx0XHRhSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAob0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKG9JdGVtLmdldEtleSgpID09PSBzU2VsZWN0ZWRLZXkpIHtcblx0XHRcdFx0XHRcdFx0b0l0ZW0uZm9jdXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLnJlbW92ZUV2ZW50RGVsZWdhdGUob1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IG9TZWdtZW50ZWRCdXR0b24gPSAoXG5cdFx0XHRcdHNTZWxlY3RlZEtleSA9PT0gVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZSA/IHRoaXMuX2dldFNlZ21lbnRlZEJ1dHRvbihcIlRhYmxlXCIpIDogdGhpcy5fZ2V0U2VnbWVudGVkQnV0dG9uKFwiQ2hhcnRcIilcblx0XHRcdCkgYXMgU2VnbWVudGVkQnV0dG9uO1xuXHRcdFx0aWYgKG9TZWdtZW50ZWRCdXR0b24gIT09IG9FdmVudC5nZXRTb3VyY2UoKSkge1xuXHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLmFkZEV2ZW50RGVsZWdhdGUob1NlZ21lbnRlZEJ1dHRvbkRlbGVnYXRlKTtcblx0XHRcdH1cblx0XHRcdHN3aXRjaCAoc1NlbGVjdGVkS2V5KSB7XG5cdFx0XHRcdGNhc2UgVGVtcGxhdGVDb250ZW50Vmlldy5UYWJsZTpcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVUYWJsZShvVGFibGUpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQ6XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlQ2hhcnQob0NoYXJ0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBUZW1wbGF0ZUNvbnRlbnRWaWV3Lkh5YnJpZDpcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVUYWJsZShvVGFibGUpO1xuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZUNoYXJ0KG9DaGFydCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0fSxcblx0XHRvbkZpbHRlcnNTZWdtZW50ZWRCdXR0b25QcmVzc2VkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3QgaXNDb21wYWN0ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImtleVwiKSA9PT0gXCJDb21wYWN0XCI7XG5cdFx0XHR0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCkuc2V0VmlzaWJsZShpc0NvbXBhY3QpO1xuXHRcdFx0KHRoaXMuX2dldFZpc3VhbEZpbHRlckJhckNvbnRyb2woKSBhcyBDb250cm9sKS5zZXRWaXNpYmxlKCFpc0NvbXBhY3QpO1xuXHRcdH0sXG5cdFx0b25TdGF0ZUNoYW5nZSh0aGlzOiBMaXN0UmVwb3J0Q29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdH0sXG5cdFx0b25EeW5hbWljUGFnZVRpdGxlU3RhdGVDaGFuZ2VkKHRoaXM6IExpc3RSZXBvcnRDb250cm9sbGVyLCBvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3QgZmlsdGVyQmFyOiBhbnkgPSB0aGlzLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0XHRpZiAoZmlsdGVyQmFyICYmIGZpbHRlckJhci5nZXRTZWdtZW50ZWRCdXR0b24oKSkge1xuXHRcdFx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImlzRXhwYW5kZWRcIikpIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuZ2V0U2VnbWVudGVkQnV0dG9uKCkuc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmaWx0ZXJCYXIuZ2V0U2VnbWVudGVkQnV0dG9uKCkuc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHRjb25zdCBhVGFibGVzID0gdGhpcy5fZ2V0Q29udHJvbHMoKSBhcyBUYWJsZVtdO1xuXHRcdGNvbnN0IHNFbnRpdHlTZXQgPSAodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmVudGl0eVNldDtcblx0XHRjb25zdCBzVGV4dCA9IGdldFJlc291cmNlTW9kZWwodGhpcy5nZXRWaWV3KCkpLmdldFRleHQoXCJUX1RBQkxFX0FORF9DSEFSVF9OT19EQVRBX1RFWFRcIiwgdW5kZWZpbmVkLCBzRW50aXR5U2V0KTtcblx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogQ29udHJvbCkge1xuXHRcdFx0aWYgKG9UYWJsZS5pc0E8VGFibGU+KFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHRvVGFibGUuc2V0Tm9EYXRhKHNUZXh0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaXN0UmVwb3J0Q29udHJvbGxlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUF5REEsTUFBTUEsbUJBQW1CLEdBQUdDLFdBQVcsQ0FBQ0QsbUJBQW1CO0lBQzFERSxlQUFlLEdBQUdELFdBQVcsQ0FBQ0MsZUFBZTs7RUFFOUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsSUFPTUMsb0JBQW9CLFdBRHpCQyxjQUFjLENBQUMsa0RBQWtELENBQUMsVUFFakVDLGNBQWMsQ0FDZEMsZUFBZSxDQUFDQyxRQUFRLENBQUM7SUFDeEJDLGNBQWMsRUFBRSxZQUFpQztNQUMvQyxJQUFJLENBQUNDLE9BQU8sRUFBRSxDQUFDQyxhQUFhLEVBQUUsQ0FBMEJDLGVBQWUsRUFBRTtJQUMzRTtFQUNELENBQUMsQ0FBQyxDQUNGLFVBR0FOLGNBQWMsQ0FDZE8sNkJBQTZCLENBQUNMLFFBQVEsQ0FBQztJQUN0Q00sWUFBWSxFQUFFLFlBQStDO01BQzVELE9BQVEsSUFBSSxDQUFDQyxJQUFJLENBQTBCQyxtQkFBbUIsRUFBRTtJQUNqRTtFQUNELENBQUMsQ0FBQyxDQUNGLFVBR0FWLGNBQWMsQ0FBQ1csV0FBVyxDQUFDLFVBRzNCWCxjQUFjLENBQUNZLHFCQUFxQixDQUFDVixRQUFRLENBQUNXLDZCQUE2QixDQUFDLENBQUMsVUFHN0ViLGNBQWMsQ0FBQ2MsS0FBSyxDQUFDWixRQUFRLENBQUNhLGNBQWMsQ0FBQyxDQUFDLFVBRzlDZixjQUFjLENBQUNnQixTQUFTLENBQUNkLFFBQVEsQ0FBQ2Usa0JBQWtCLENBQUMsQ0FBQyxVQUd0RGpCLGNBQWMsQ0FBQ2tCLGFBQWEsQ0FBQyxVQUc3QmxCLGNBQWMsQ0FBQ21CLFdBQVcsQ0FBQyxXQUczQm5CLGNBQWMsQ0FBQ29CLFFBQVEsQ0FBQyxXQW1CeEJDLGVBQWUsRUFBRSxXQUNqQkMsY0FB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
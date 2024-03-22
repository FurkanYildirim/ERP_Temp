/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controls/filterbar/adapter/SelectionVariantToStateFilters", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/library", "sap/fe/core/templating/PropertyFormatters", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/navigation/library", "sap/ui/Device", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/p13n/StateUtil"], function (Log, CommonUtils, SelectionVariantToStateFilters, KeepAliveHelper, ModelHelper, CoreLibrary, PropertyFormatters, DelegateUtil, FilterUtils, NavLibrary, Device, ControlVariantApplyAPI, ConditionValidated, StateUtil) {
  "use strict";

  var system = Device.system;
  const NavType = NavLibrary.NavType,
    VariantManagementType = CoreLibrary.VariantManagement,
    TemplateContentView = CoreLibrary.TemplateContentView,
    InitialLoadMode = CoreLibrary.InitialLoadMode,
    CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /\+|\*/g;
  const ViewStateOverride = {
    _bSearchTriggered: false,
    applyInitialStateOnly: function () {
      return true;
    },
    onBeforeStateApplied: function (aPromises, navigationType) {
      const oView = this.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl(),
        aTables = oController._getControls("table");
      if (oFilterBar) {
        oFilterBar.setSuspendSelection(true);
        aPromises.push(oFilterBar.waitForInitialization());
        //This is required to remove any existing or default filter conditions before restoring the filter bar state in hybrid navigation mode.
        if (navigationType === NavType.hybrid) {
          this._clearFilterConditions(oFilterBar);
        }
      }
      aTables.forEach(function (oTable) {
        aPromises.push(oTable.initialized());
      });
      delete this._bSearchTriggered;
    },
    onAfterStateApplied: function () {
      const oController = this.getView().getController();
      const oFilterBar = oController._getFilterBarControl();
      if (oFilterBar) {
        oFilterBar.setSuspendSelection(false);
      } else if (oController._isFilterBarHidden()) {
        const oInternalModelContext = oController.getView().getBindingContext("internal");
        oInternalModelContext.setProperty("hasPendingFilters", false);
        if (oController._isMultiMode()) {
          oController._getMultiModeControl().setCountsOutDated(true);
        }
      }
    },
    adaptBindingRefreshControls: function (aControls) {
      const oView = this.base.getView(),
        oController = oView.getController(),
        aViewControls = oController._getControls(),
        aControlsToRefresh = KeepAliveHelper.getControlsForRefresh(oView, aViewControls);
      Array.prototype.push.apply(aControls, aControlsToRefresh);
    },
    adaptStateControls: function (aStateControls) {
      const oView = this.getView(),
        oController = oView.getController(),
        oViewData = oView.getViewData(),
        bControlVM = oViewData.variantManagement === VariantManagementType.Control;
      const oFilterBarVM = this._getFilterBarVM(oView);
      if (oFilterBarVM) {
        aStateControls.push(oFilterBarVM);
      }
      if (oController._isMultiMode()) {
        aStateControls.push(oController._getMultiModeControl());
      }
      oController._getControls("table").forEach(function (oTable) {
        const oQuickFilter = oTable.getQuickFilter();
        if (oQuickFilter) {
          aStateControls.push(oQuickFilter);
        }
        if (bControlVM) {
          aStateControls.push(oTable.getVariant());
        }
        aStateControls.push(oTable);
      });
      if (oController._getControls("Chart")) {
        oController._getControls("Chart").forEach(function (oChart) {
          if (bControlVM) {
            aStateControls.push(oChart.getVariant());
          }
          aStateControls.push(oChart);
        });
      }
      if (oController._hasMultiVisualizations()) {
        aStateControls.push(oController._getSegmentedButton(TemplateContentView.Chart));
        aStateControls.push(oController._getSegmentedButton(TemplateContentView.Table));
      }
      const oFilterBar = oController._getFilterBarControl();
      if (oFilterBar) {
        aStateControls.push(oFilterBar);
      }
      aStateControls.push(oView.byId("fe::ListReport"));
    },
    retrieveAdditionalStates: function (mAdditionalStates) {
      const oView = this.getView(),
        oController = oView.getController(),
        bPendingFilter = oView.getBindingContext("internal").getProperty("hasPendingFilters");
      mAdditionalStates.dataLoaded = !bPendingFilter || !!this._bSearchTriggered;
      if (oController._hasMultiVisualizations()) {
        const sAlpContentView = oView.getBindingContext("internal").getProperty("alpContentView");
        mAdditionalStates.alpContentView = sAlpContentView;
      }
      delete this._bSearchTriggered;
    },
    applyAdditionalStates: function (oAdditionalStates) {
      const oView = this.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl();
      if (oAdditionalStates) {
        // explicit check for boolean values - 'undefined' should not alter the triggered search property
        if (oAdditionalStates.dataLoaded === false && oFilterBar) {
          // without this, the data is loaded on navigating back
          oFilterBar._bSearchTriggered = false;
        } else if (oAdditionalStates.dataLoaded === true) {
          if (oFilterBar) {
            const filterBarAPI = oFilterBar.getParent();
            filterBarAPI.triggerSearch();
          }
          this._bSearchTriggered = true;
        }
        if (oController._hasMultiVisualizations()) {
          const oInternalModelContext = oView.getBindingContext("internal");
          if (!system.desktop && oAdditionalStates.alpContentView == TemplateContentView.Hybrid) {
            oAdditionalStates.alpContentView = TemplateContentView.Chart;
          }
          oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/alpContentView`, oAdditionalStates.alpContentView);
        }
      }
    },
    _applyNavigationParametersToFilterbar: function (oNavigationParameter, aResults) {
      const oView = this.getView();
      const oController = oView.getController();
      const oAppComponent = oController.getAppComponent();
      const oComponentData = oAppComponent.getComponentData();
      const oStartupParameters = oComponentData && oComponentData.startupParameters || {};
      const oVariantPromise = this.handleVariantIdPassedViaURLParams(oStartupParameters);
      let bFilterVariantApplied;
      aResults.push(oVariantPromise.then(aVariants => {
        if (aVariants && aVariants.length > 0) {
          if (aVariants[0] === true || aVariants[1] === true) {
            bFilterVariantApplied = true;
          }
        }
        return this._applySelectionVariant(oView, oNavigationParameter, bFilterVariantApplied);
      }).then(() => {
        const oDynamicPage = oController._getDynamicListReportControl();
        let bPreventInitialSearch = false;
        const oFilterBarVM = this._getFilterBarVM(oView);
        const oFilterBarControl = oController._getFilterBarControl();
        if (oFilterBarControl) {
          if (oNavigationParameter.navigationType !== NavType.initial && oNavigationParameter.requiresStandardVariant || !oFilterBarVM && oView.getViewData().initialLoad === InitialLoadMode.Enabled || oController._shouldAutoTriggerSearch(oFilterBarVM)) {
            const filterBarAPI = oFilterBarControl.getParent();
            filterBarAPI.triggerSearch();
          } else {
            bPreventInitialSearch = this._preventInitialSearch(oFilterBarVM);
          }
          // reset the suspend selection on filter bar to allow loading of data when needed (was set on LR Init)
          oFilterBarControl.setSuspendSelection(false);
          this._bSearchTriggered = !bPreventInitialSearch;
          oDynamicPage.setHeaderExpanded(system.desktop || bPreventInitialSearch);
        }
      }).catch(function () {
        Log.error("Variant ID cannot be applied");
      }));
    },
    handleVariantIdPassedViaURLParams: function (oUrlParams) {
      const aPageVariantId = oUrlParams["sap-ui-fe-variant-id"],
        aFilterBarVariantId = oUrlParams["sap-ui-fe-filterbar-variant-id"],
        aTableVariantId = oUrlParams["sap-ui-fe-table-variant-id"],
        aChartVariantId = oUrlParams["sap-ui-fe-chart-variant-id"];
      let oVariantIDs;
      if (aPageVariantId || aFilterBarVariantId || aTableVariantId || aChartVariantId) {
        oVariantIDs = {
          sPageVariantId: aPageVariantId && aPageVariantId[0],
          sFilterBarVariantId: aFilterBarVariantId && aFilterBarVariantId[0],
          sTableVariantId: aTableVariantId && aTableVariantId[0],
          sChartVariantId: aChartVariantId && aChartVariantId[0]
        };
      }
      return this._handleControlVariantId(oVariantIDs);
    },
    _handleControlVariantId: function (oVariantIDs) {
      let oVM;
      const oView = this.getView(),
        aPromises = [];
      const sVariantManagement = oView.getViewData().variantManagement;
      if (oVariantIDs && oVariantIDs.sPageVariantId && sVariantManagement === "Page") {
        oVM = oView.byId("fe::PageVariantManagement");
        this._handlePageVariantId(oVariantIDs, oVM, aPromises);
      } else if (oVariantIDs && sVariantManagement === "Control") {
        if (oVariantIDs.sFilterBarVariantId) {
          oVM = oView.getController()._getFilterBarVariantControl();
          this._handleFilterBarVariantControlId(oVariantIDs, oVM, aPromises);
        }
        if (oVariantIDs.sTableVariantId) {
          const oController = oView.getController();
          this._handleTableControlVariantId(oVariantIDs, oController, aPromises);
        }
        if (oVariantIDs.sChartVariantId) {
          const oController = oView.getController();
          this._handleChartControlVariantId(oVariantIDs, oController, aPromises);
        }
      }
      return Promise.all(aPromises);
    },
    /*
     * Handles page level variant and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oVM contains the vairant management object for the page variant
     * @param aPromises is an array of all promises
     * @private
     */
    _handlePageVariantId: function (oVariantIDs, oVM, aPromises) {
      oVM.getVariants().forEach(oVariant => {
        this._findAndPushVariantToPromise(oVariant, oVariantIDs.sPageVariantId, oVM, aPromises, true);
      });
    },
    /*
     * Handles control level variant for filter bar and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oVM contains the vairant management object for the filter bar
     * @param aPromises is an array of all promises
     * @private
     */

    _handleFilterBarVariantControlId: function (oVariantIDs, oVM, aPromises) {
      if (oVM) {
        oVM.getVariants().forEach(oVariant => {
          this._findAndPushVariantToPromise(oVariant, oVariantIDs.sFilterBarVariantId, oVM, aPromises, true);
        });
      }
    },
    /*
     * Handles control level variant for table and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oController has the list report controller object
     * @param aPromises is an array of all promises
     * @private
     */
    _handleTableControlVariantId: function (oVariantIDs, oController, aPromises) {
      const aTables = oController._getControls("table");
      aTables.forEach(oTable => {
        const oTableVariant = oTable.getVariant();
        if (oTable && oTableVariant) {
          oTableVariant.getVariants().forEach(oVariant => {
            this._findAndPushVariantToPromise(oVariant, oVariantIDs.sTableVariantId, oTableVariant, aPromises);
          });
        }
      });
    },
    /*
     * Handles control level variant for chart and passes the variant to the function that pushes the promise to the promise array
     *
     * @param oVarinatIDs contains an object of all variant IDs
     * @param oController has the list report controller object
     * @param aPromises is an array of all promises
     * @private
     */
    _handleChartControlVariantId: function (oVariantIDs, oController, aPromises) {
      const aCharts = oController._getControls("Chart");
      aCharts.forEach(oChart => {
        const oChartVariant = oChart.getVariant();
        const aVariants = oChartVariant.getVariants();
        if (aVariants) {
          aVariants.forEach(oVariant => {
            this._findAndPushVariantToPromise(oVariant, oVariantIDs.sChartVariantId, oChartVariant, aPromises);
          });
        }
      });
    },
    /*
     * Matches the variant ID provided in the url to the available vairant IDs and pushes the appropriate promise to the promise array
     *
     * @param oVariant is an object for a specific variant
     * @param sVariantId is the variant ID provided in the url
     * @param oVM is the variant management object for the specfic variant
     * @param aPromises is an array of promises
     * @param bFilterVariantApplied is an optional parameter which is set to ture in case the filter variant is applied
     * @private
     */
    _findAndPushVariantToPromise: function (oVariant, sVariantId, oVM, aPromises, bFilterVariantApplied) {
      if (oVariant.key === sVariantId) {
        aPromises.push(this._applyControlVariant(oVM, sVariantId, bFilterVariantApplied));
      }
    },
    _applyControlVariant: function (oVariant, sVariantID, bFilterVariantApplied) {
      const sVariantReference = this._checkIfVariantIdIsAvailable(oVariant, sVariantID) ? sVariantID : oVariant.getStandardVariantKey();
      const oVM = ControlVariantApplyAPI.activateVariant({
        element: oVariant,
        variantReference: sVariantReference
      });
      return oVM.then(function () {
        return bFilterVariantApplied;
      });
    },
    /************************************* private helper *****************************************/

    _getFilterBarVM: function (oView) {
      const oViewData = oView.getViewData();
      switch (oViewData.variantManagement) {
        case VariantManagementType.Page:
          return oView.byId("fe::PageVariantManagement");
        case VariantManagementType.Control:
          return oView.getController()._getFilterBarVariantControl();
        case VariantManagementType.None:
          return null;
        default:
          throw new Error(`unhandled variant setting: ${oViewData.variantManagement}`);
      }
    },
    _preventInitialSearch: function (oVariantManagement) {
      if (!oVariantManagement) {
        return true;
      }
      const aVariants = oVariantManagement.getVariants();
      const oCurrentVariant = aVariants.find(function (oItem) {
        return oItem.key === oVariantManagement.getCurrentVariantKey();
      });
      return !oCurrentVariant.executeOnSelect;
    },
    _applySelectionVariant: async function (oView, oNavigationParameter, bFilterVariantApplied) {
      var _oView$getModel;
      const oFilterBar = oView.getController()._getFilterBarControl(),
        oSelectionVariant = oNavigationParameter.selectionVariant,
        oSelectionVariantDefaults = oNavigationParameter.selectionVariantDefaults;
      if (!oFilterBar || !oSelectionVariant) {
        return Promise.resolve();
      }
      let oConditions = {};
      const oMetaModel = (_oView$getModel = oView.getModel()) === null || _oView$getModel === void 0 ? void 0 : _oView$getModel.getMetaModel();
      const oViewData = oView.getViewData();
      const sContextPath = oViewData.contextPath || `/${oViewData.entitySet}`;
      const aMandatoryFilterFields = CommonUtils.getMandatoryFilterFields(oMetaModel, sContextPath);
      const bUseSemanticDateRange = oFilterBar.data("useSemanticDateRange");
      let oVariant;
      switch (oViewData.variantManagement) {
        case VariantManagementType.Page:
          oVariant = oView.byId("fe::PageVariantManagement");
          break;
        case VariantManagementType.Control:
          oVariant = oView.getController()._getFilterBarVariantControl();
          break;
        case VariantManagementType.None:
        default:
          break;
      }
      const bRequiresStandardVariant = oNavigationParameter.requiresStandardVariant;
      // check if FLP default values are there and is it standard variant
      const bIsFLPValuePresent = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOptionsPropertyNames().length > 0 && oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey() && oNavigationParameter.bNavSelVarHasDefaultsOnly === true;

      // get conditions when FLP value is present
      if (bFilterVariantApplied || bIsFLPValuePresent) {
        oConditions = oFilterBar.getConditions();
      }
      CommonUtils.addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults);
      await this.addSelectionVariantToConditions(oFilterBar, oSelectionVariant, oConditions, bIsFLPValuePresent);
      return this._activateSelectionVariant(oFilterBar, oConditions, oVariant, bRequiresStandardVariant, bFilterVariantApplied, bIsFLPValuePresent);
    },
    _activateSelectionVariant: function (oFilterBar, oConditions, oVariant, bRequiresStandardVariant, bFilterVariantApplied, bIsFLPValuePresent) {
      let oPromise;
      if (oVariant && !bFilterVariantApplied) {
        let oVariantKey = bRequiresStandardVariant ? oVariant.getStandardVariantKey() : oVariant.getDefaultVariantKey();
        if (oVariantKey === null) {
          oVariantKey = oVariant.getId();
        }
        oPromise = ControlVariantApplyAPI.activateVariant({
          element: oVariant,
          variantReference: oVariantKey
        }).then(function () {
          return bRequiresStandardVariant || oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey();
        });
      } else {
        oPromise = Promise.resolve(true);
      }
      return oPromise.then(bClearFilterAndReplaceWithAppState => {
        if (bClearFilterAndReplaceWithAppState) {
          return this._fnApplyConditions(oFilterBar, oConditions, bIsFLPValuePresent);
        }
      });
    },
    /*
     * Sets filtered: false flag to every field so that it can be cleared out
     *
     * @param oFilterBar filterbar control is used to display filter properties in a user-friendly manner to populate values for a query
     * @returns promise which will be resolved to object
     * @private
     */
    _fnClearStateBeforexAppNav: async function (oFilterBar) {
      return await StateUtil.retrieveExternalState(oFilterBar).then(oExternalState => {
        const oCondition = oExternalState.filter;
        for (const field in oCondition) {
          if (field !== "$editState" && field !== "$search" && oCondition[field]) {
            oCondition[field].forEach(condition => {
              condition["filtered"] = false;
            });
          }
        }
        return Promise.resolve(oCondition);
      }).catch(function (oError) {
        Log.error("Error while retrieving the external state", oError);
      });
    },
    _fnApplyConditions: async function (oFilterBar, oConditions, bIsFLPValuePresent) {
      const mFilter = {},
        aItems = [],
        fnAdjustValueHelpCondition = function (oCondition) {
          // in case the condition is meant for a field having a VH, the format required by MDC differs
          oCondition.validated = ConditionValidated.Validated;
          if (oCondition.operator === "Empty") {
            oCondition.operator = "EQ";
            oCondition.values = [""];
          } else if (oCondition.operator === "NotEmpty") {
            oCondition.operator = "NE";
            oCondition.values = [""];
          }
          delete oCondition.isEmpty;
        };
      const fnGetPropertyInfo = function (oFilterControl, sEntityTypePath) {
        const sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath),
          oMetaModel = oFilterControl.getModel().getMetaModel(),
          oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
          aNonFilterableProps = oFR.NonFilterableProperties,
          mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath),
          aPropertyInfo = [];
        mFilterFields.forEach(function (oConvertedProperty) {
          const sPropertyPath = oConvertedProperty.conditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
          if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
            const sAnnotationPath = oConvertedProperty.annotationPath;
            const oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
            aPropertyInfo.push({
              path: oConvertedProperty.conditionPath,
              hiddenFilter: oConvertedProperty.availability === "Hidden",
              hasValueHelp: !sAnnotationPath ? false : PropertyFormatters.hasValueHelp(oPropertyContext.getObject(), {
                context: oPropertyContext
              })
            });
          }
        });
        return aPropertyInfo;
      };
      return oFilterBar.waitForInitialization().then(async () => {
        const sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
        // During external app navigation, we have to clear the existing conditions to avoid merging of values coming from annotation and context
        // Condition !bIsFLPValuePresent indicates it's external app navigation
        if (!bIsFLPValuePresent) {
          const oClearConditions = await this._fnClearStateBeforexAppNav(oFilterBar);
          await StateUtil.applyExternalState(oFilterBar, {
            filter: oClearConditions,
            items: aItems
          });
        }
        const aPropertyInfo = fnGetPropertyInfo(oFilterBar, sEntityTypePath);
        aPropertyInfo.filter(function (oPropertyInfo) {
          return oPropertyInfo.path !== "$editState" && oPropertyInfo.path !== "$search";
        }).forEach(oPropertyInfo => {
          if (oPropertyInfo.path in oConditions) {
            mFilter[oPropertyInfo.path] = oConditions[oPropertyInfo.path];
            if (!oPropertyInfo.hiddenFilter) {
              aItems.push({
                name: oPropertyInfo.path
              });
            }
            if (oPropertyInfo.hasValueHelp) {
              mFilter[oPropertyInfo.path].forEach(fnAdjustValueHelpCondition);
            } else {
              mFilter[oPropertyInfo.path].forEach(function (oCondition) {
                oCondition.validated = oCondition.filtered ? ConditionValidated.NotValidated : oCondition.validated;
              });
            }
          } else {
            mFilter[oPropertyInfo.path] = [];
          }
        });
        return StateUtil.applyExternalState(oFilterBar, {
          filter: mFilter,
          items: aItems
        });
      });
    },
    _clearFilterConditions: async function (oFilterBar) {
      const aItems = [];
      return oFilterBar.waitForInitialization().then(async () => {
        const oClearConditions = await this._fnClearStateBeforexAppNav(oFilterBar);
        return StateUtil.applyExternalState(oFilterBar, {
          filter: oClearConditions,
          items: aItems
        });
      });
    },
    /**
     * Method returns filters and filter field items to apply and add. Also checks whether the property is configured with hiddenFilter.
     *
     * @param filterBar The filter bar
     * @param selectionVariant SelectionVariant to convert to conditions
     * @param inputConditions Existing conditions object to update with conditions from SV
     * @param isFLPValues FLP values exist and need to be set to filtered=false.
     * @returns Cummulative conditions after converted selection variant is added.
     */
    addSelectionVariantToConditions: async (filterBar, selectionVariant, inputConditions, isFLPValues) => {
      await filterBar.waitForInitialization();
      const filterBarPropertyInfos = await SelectionVariantToStateFilters.getFilterBarSupportedFields(filterBar);
      const filterBarInfoForConversion = SelectionVariantToStateFilters.getFilterBarInfoForConversion(filterBar);
      const conditionsFromSV = SelectionVariantToStateFilters.getConditionsFromSV(selectionVariant, filterBarInfoForConversion, filterBarPropertyInfos);

      // Note: this is template specific code, needs to be moved.
      filterBarPropertyInfos.forEach(propertyInfo => {
        const conditionPath = propertyInfo.conditionPath;
        const conditionObjects = conditionsFromSV[conditionPath] || [];
        if (conditionObjects.length > 0) {
          if (isFLPValues) {
            // If FLP values are present replace it with FLP values
            conditionObjects.forEach(element => {
              element["filtered"] = true;
            });
            if (inputConditions.hasOwnProperty(conditionPath)) {
              inputConditions[conditionPath].forEach(element => {
                element["filtered"] = false;
              });
              inputConditions[conditionPath] = inputConditions[conditionPath].concat(conditionObjects);
            } else {
              inputConditions[conditionPath] = conditionObjects;
            }
          } else {
            inputConditions[conditionPath] = inputConditions.hasOwnProperty(conditionPath) ? inputConditions[conditionPath].concat(conditionObjects) : conditionObjects;
          }
        }
      });
      return inputConditions;
    }
  };
  return ViewStateOverride;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZUeXBlIiwiTmF2TGlicmFyeSIsIlZhcmlhbnRNYW5hZ2VtZW50VHlwZSIsIkNvcmVMaWJyYXJ5IiwiVmFyaWFudE1hbmFnZW1lbnQiLCJUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiSW5pdGlhbExvYWRNb2RlIiwiQ09ORElUSU9OX1BBVEhfVE9fUFJPUEVSVFlfUEFUSF9SRUdFWCIsIlZpZXdTdGF0ZU92ZXJyaWRlIiwiX2JTZWFyY2hUcmlnZ2VyZWQiLCJhcHBseUluaXRpYWxTdGF0ZU9ubHkiLCJvbkJlZm9yZVN0YXRlQXBwbGllZCIsImFQcm9taXNlcyIsIm5hdmlnYXRpb25UeXBlIiwib1ZpZXciLCJnZXRWaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwib0ZpbHRlckJhciIsIl9nZXRGaWx0ZXJCYXJDb250cm9sIiwiYVRhYmxlcyIsIl9nZXRDb250cm9scyIsInNldFN1c3BlbmRTZWxlY3Rpb24iLCJwdXNoIiwid2FpdEZvckluaXRpYWxpemF0aW9uIiwiaHlicmlkIiwiX2NsZWFyRmlsdGVyQ29uZGl0aW9ucyIsImZvckVhY2giLCJvVGFibGUiLCJpbml0aWFsaXplZCIsIm9uQWZ0ZXJTdGF0ZUFwcGxpZWQiLCJfaXNGaWx0ZXJCYXJIaWRkZW4iLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInNldFByb3BlcnR5IiwiX2lzTXVsdGlNb2RlIiwiX2dldE11bHRpTW9kZUNvbnRyb2wiLCJzZXRDb3VudHNPdXREYXRlZCIsImFkYXB0QmluZGluZ1JlZnJlc2hDb250cm9scyIsImFDb250cm9scyIsImJhc2UiLCJhVmlld0NvbnRyb2xzIiwiYUNvbnRyb2xzVG9SZWZyZXNoIiwiS2VlcEFsaXZlSGVscGVyIiwiZ2V0Q29udHJvbHNGb3JSZWZyZXNoIiwiQXJyYXkiLCJwcm90b3R5cGUiLCJhcHBseSIsImFkYXB0U3RhdGVDb250cm9scyIsImFTdGF0ZUNvbnRyb2xzIiwib1ZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJiQ29udHJvbFZNIiwidmFyaWFudE1hbmFnZW1lbnQiLCJDb250cm9sIiwib0ZpbHRlckJhclZNIiwiX2dldEZpbHRlckJhclZNIiwib1F1aWNrRmlsdGVyIiwiZ2V0UXVpY2tGaWx0ZXIiLCJnZXRWYXJpYW50Iiwib0NoYXJ0IiwiX2hhc011bHRpVmlzdWFsaXphdGlvbnMiLCJfZ2V0U2VnbWVudGVkQnV0dG9uIiwiQ2hhcnQiLCJUYWJsZSIsImJ5SWQiLCJyZXRyaWV2ZUFkZGl0aW9uYWxTdGF0ZXMiLCJtQWRkaXRpb25hbFN0YXRlcyIsImJQZW5kaW5nRmlsdGVyIiwiZ2V0UHJvcGVydHkiLCJkYXRhTG9hZGVkIiwic0FscENvbnRlbnRWaWV3IiwiYWxwQ29udGVudFZpZXciLCJhcHBseUFkZGl0aW9uYWxTdGF0ZXMiLCJvQWRkaXRpb25hbFN0YXRlcyIsImZpbHRlckJhckFQSSIsImdldFBhcmVudCIsInRyaWdnZXJTZWFyY2giLCJzeXN0ZW0iLCJkZXNrdG9wIiwiSHlicmlkIiwiZ2V0TW9kZWwiLCJnZXRQYXRoIiwiX2FwcGx5TmF2aWdhdGlvblBhcmFtZXRlcnNUb0ZpbHRlcmJhciIsIm9OYXZpZ2F0aW9uUGFyYW1ldGVyIiwiYVJlc3VsdHMiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50Iiwib0NvbXBvbmVudERhdGEiLCJnZXRDb21wb25lbnREYXRhIiwib1N0YXJ0dXBQYXJhbWV0ZXJzIiwic3RhcnR1cFBhcmFtZXRlcnMiLCJvVmFyaWFudFByb21pc2UiLCJoYW5kbGVWYXJpYW50SWRQYXNzZWRWaWFVUkxQYXJhbXMiLCJiRmlsdGVyVmFyaWFudEFwcGxpZWQiLCJ0aGVuIiwiYVZhcmlhbnRzIiwibGVuZ3RoIiwiX2FwcGx5U2VsZWN0aW9uVmFyaWFudCIsIm9EeW5hbWljUGFnZSIsIl9nZXREeW5hbWljTGlzdFJlcG9ydENvbnRyb2wiLCJiUHJldmVudEluaXRpYWxTZWFyY2giLCJvRmlsdGVyQmFyQ29udHJvbCIsImluaXRpYWwiLCJyZXF1aXJlc1N0YW5kYXJkVmFyaWFudCIsImluaXRpYWxMb2FkIiwiRW5hYmxlZCIsIl9zaG91bGRBdXRvVHJpZ2dlclNlYXJjaCIsIl9wcmV2ZW50SW5pdGlhbFNlYXJjaCIsInNldEhlYWRlckV4cGFuZGVkIiwiY2F0Y2giLCJMb2ciLCJlcnJvciIsIm9VcmxQYXJhbXMiLCJhUGFnZVZhcmlhbnRJZCIsImFGaWx0ZXJCYXJWYXJpYW50SWQiLCJhVGFibGVWYXJpYW50SWQiLCJhQ2hhcnRWYXJpYW50SWQiLCJvVmFyaWFudElEcyIsInNQYWdlVmFyaWFudElkIiwic0ZpbHRlckJhclZhcmlhbnRJZCIsInNUYWJsZVZhcmlhbnRJZCIsInNDaGFydFZhcmlhbnRJZCIsIl9oYW5kbGVDb250cm9sVmFyaWFudElkIiwib1ZNIiwic1ZhcmlhbnRNYW5hZ2VtZW50IiwiX2hhbmRsZVBhZ2VWYXJpYW50SWQiLCJfZ2V0RmlsdGVyQmFyVmFyaWFudENvbnRyb2wiLCJfaGFuZGxlRmlsdGVyQmFyVmFyaWFudENvbnRyb2xJZCIsIl9oYW5kbGVUYWJsZUNvbnRyb2xWYXJpYW50SWQiLCJfaGFuZGxlQ2hhcnRDb250cm9sVmFyaWFudElkIiwiUHJvbWlzZSIsImFsbCIsImdldFZhcmlhbnRzIiwib1ZhcmlhbnQiLCJfZmluZEFuZFB1c2hWYXJpYW50VG9Qcm9taXNlIiwib1RhYmxlVmFyaWFudCIsImFDaGFydHMiLCJvQ2hhcnRWYXJpYW50Iiwic1ZhcmlhbnRJZCIsImtleSIsIl9hcHBseUNvbnRyb2xWYXJpYW50Iiwic1ZhcmlhbnRJRCIsInNWYXJpYW50UmVmZXJlbmNlIiwiX2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZSIsImdldFN0YW5kYXJkVmFyaWFudEtleSIsIkNvbnRyb2xWYXJpYW50QXBwbHlBUEkiLCJhY3RpdmF0ZVZhcmlhbnQiLCJlbGVtZW50IiwidmFyaWFudFJlZmVyZW5jZSIsIlBhZ2UiLCJOb25lIiwiRXJyb3IiLCJvVmFyaWFudE1hbmFnZW1lbnQiLCJvQ3VycmVudFZhcmlhbnQiLCJmaW5kIiwib0l0ZW0iLCJnZXRDdXJyZW50VmFyaWFudEtleSIsImV4ZWN1dGVPblNlbGVjdCIsIm9TZWxlY3Rpb25WYXJpYW50Iiwic2VsZWN0aW9uVmFyaWFudCIsIm9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMiLCJzZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMiLCJyZXNvbHZlIiwib0NvbmRpdGlvbnMiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0NvbnRleHRQYXRoIiwiY29udGV4dFBhdGgiLCJlbnRpdHlTZXQiLCJhTWFuZGF0b3J5RmlsdGVyRmllbGRzIiwiQ29tbW9uVXRpbHMiLCJnZXRNYW5kYXRvcnlGaWx0ZXJGaWVsZHMiLCJiVXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJkYXRhIiwiYlJlcXVpcmVzU3RhbmRhcmRWYXJpYW50IiwiYklzRkxQVmFsdWVQcmVzZW50IiwiZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMiLCJnZXREZWZhdWx0VmFyaWFudEtleSIsImJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkiLCJnZXRDb25kaXRpb25zIiwiYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeSIsImFkZFNlbGVjdGlvblZhcmlhbnRUb0NvbmRpdGlvbnMiLCJfYWN0aXZhdGVTZWxlY3Rpb25WYXJpYW50Iiwib1Byb21pc2UiLCJvVmFyaWFudEtleSIsImdldElkIiwiYkNsZWFyRmlsdGVyQW5kUmVwbGFjZVdpdGhBcHBTdGF0ZSIsIl9mbkFwcGx5Q29uZGl0aW9ucyIsIl9mbkNsZWFyU3RhdGVCZWZvcmV4QXBwTmF2IiwiU3RhdGVVdGlsIiwicmV0cmlldmVFeHRlcm5hbFN0YXRlIiwib0V4dGVybmFsU3RhdGUiLCJvQ29uZGl0aW9uIiwiZmlsdGVyIiwiZmllbGQiLCJjb25kaXRpb24iLCJvRXJyb3IiLCJtRmlsdGVyIiwiYUl0ZW1zIiwiZm5BZGp1c3RWYWx1ZUhlbHBDb25kaXRpb24iLCJ2YWxpZGF0ZWQiLCJDb25kaXRpb25WYWxpZGF0ZWQiLCJWYWxpZGF0ZWQiLCJvcGVyYXRvciIsInZhbHVlcyIsImlzRW1wdHkiLCJmbkdldFByb3BlcnR5SW5mbyIsIm9GaWx0ZXJDb250cm9sIiwic0VudGl0eVR5cGVQYXRoIiwic0VudGl0eVNldFBhdGgiLCJNb2RlbEhlbHBlciIsImdldEVudGl0eVNldFBhdGgiLCJvRlIiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgiLCJhTm9uRmlsdGVyYWJsZVByb3BzIiwiTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMiLCJtRmlsdGVyRmllbGRzIiwiRmlsdGVyVXRpbHMiLCJnZXRDb252ZXJ0ZWRGaWx0ZXJGaWVsZHMiLCJhUHJvcGVydHlJbmZvIiwib0NvbnZlcnRlZFByb3BlcnR5Iiwic1Byb3BlcnR5UGF0aCIsImNvbmRpdGlvblBhdGgiLCJyZXBsYWNlIiwiaW5kZXhPZiIsInNBbm5vdGF0aW9uUGF0aCIsImFubm90YXRpb25QYXRoIiwib1Byb3BlcnR5Q29udGV4dCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwicGF0aCIsImhpZGRlbkZpbHRlciIsImF2YWlsYWJpbGl0eSIsImhhc1ZhbHVlSGVscCIsIlByb3BlcnR5Rm9ybWF0dGVycyIsImdldE9iamVjdCIsImNvbnRleHQiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRDdXN0b21EYXRhIiwib0NsZWFyQ29uZGl0aW9ucyIsImFwcGx5RXh0ZXJuYWxTdGF0ZSIsIml0ZW1zIiwib1Byb3BlcnR5SW5mbyIsIm5hbWUiLCJmaWx0ZXJlZCIsIk5vdFZhbGlkYXRlZCIsImZpbHRlckJhciIsImlucHV0Q29uZGl0aW9ucyIsImlzRkxQVmFsdWVzIiwiZmlsdGVyQmFyUHJvcGVydHlJbmZvcyIsIlNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycyIsImdldEZpbHRlckJhclN1cHBvcnRlZEZpZWxkcyIsImZpbHRlckJhckluZm9Gb3JDb252ZXJzaW9uIiwiZ2V0RmlsdGVyQmFySW5mb0ZvckNvbnZlcnNpb24iLCJjb25kaXRpb25zRnJvbVNWIiwiZ2V0Q29uZGl0aW9uc0Zyb21TViIsInByb3BlcnR5SW5mbyIsImNvbmRpdGlvbk9iamVjdHMiLCJoYXNPd25Qcm9wZXJ0eSIsImNvbmNhdCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlld1N0YXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUgVmlld1N0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9WaWV3U3RhdGVcIjtcbmltcG9ydCB0eXBlIHsgTmF2aWdhdGlvblBhcmFtZXRlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9WaWV3U3RhdGVcIjtcbmltcG9ydCBTZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL2ZpbHRlcmJhci9hZGFwdGVyL1NlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVyc1wiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgQ29yZUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCAqIGFzIFByb3BlcnR5Rm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUZvcm1hdHRlcnNcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwsIHsgUHJvcGVydHlJbmZvIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgdHlwZSBGaWx0ZXJCYXJBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyQmFyL0ZpbHRlckJhckFQSVwiO1xuaW1wb3J0IE5hdkxpYnJhcnkgZnJvbSBcInNhcC9mZS9uYXZpZ2F0aW9uL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIHsgU2VsZWN0aW9uVmFyaWFudCB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSBMaXN0UmVwb3J0Q29udHJvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L0xpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgeyBzeXN0ZW0gfSBmcm9tIFwic2FwL3VpL0RldmljZVwiO1xuaW1wb3J0IENvbnRyb2xWYXJpYW50QXBwbHlBUEkgZnJvbSBcInNhcC91aS9mbC9hcHBseS9hcGkvQ29udHJvbFZhcmlhbnRBcHBseUFQSVwiO1xuaW1wb3J0IHR5cGUgVmFyaWFudE1hbmFnZW1lbnQgZnJvbSBcInNhcC91aS9mbC92YXJpYW50cy9WYXJpYW50TWFuYWdlbWVudFwiO1xuaW1wb3J0IENoYXJ0IGZyb20gXCJzYXAvdWkvbWRjL0NoYXJ0XCI7XG5pbXBvcnQgdHlwZSB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBDb25kaXRpb25WYWxpZGF0ZWQgZnJvbSBcInNhcC91aS9tZGMvZW51bS9Db25kaXRpb25WYWxpZGF0ZWRcIjtcbmltcG9ydCBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgU3RhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3AxM24vU3RhdGVVdGlsXCI7XG5pbXBvcnQgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxudHlwZSBWYXJpYW50T2JqZWN0ID0ge1xuXHRhdXRob3I6IFN0cmluZztcblx0Y2hhbmdlOiBib29sZWFuO1xuXHRjb250ZXh0czogb2JqZWN0O1xuXHRleGVjdXRlT25TZWxlY3Q6IGJvb2xlYW47XG5cdGZhdm9yaXRlOiBib29sZWFuO1xuXHRrZXk6IFN0cmluZztcblx0b3JpZ2luYWxDb250ZXh0czogb2JqZWN0O1xuXHRvcmlnaW5hbEV4ZWN1dGVPblNlbGVjdDogYm9vbGVhbjtcblx0b3JpZ2luYWxGYXZvcml0ZTogYm9vbGVhbjtcblx0b3JpZ2luYWxUaXRsZTogU3RyaW5nO1xuXHRvcmlnaW5hbFZpc2libGU6IGJvb2xlYW47XG5cdHJlbW92ZTogYm9vbGVhbjtcblx0cmVuYW1lOiBib29sZWFuO1xuXHRzaGFyaW5nOiBTdHJpbmc7XG5cdHRpdGxlOiBTdHJpbmc7XG5cdHZpc2libGU6IGJvb2xlYW47XG59O1xuXG50eXBlIE5hdkhhbmRsZXJOYXZQYXJhbXMgPSBOYXZpZ2F0aW9uUGFyYW1ldGVyICYge1xuXHRiTmF2U2VsVmFySGFzRGVmYXVsdHNPbmx5PzogYm9vbGVhbjtcbn07XG5cbnR5cGUgTFJWaWV3RGF0YSA9IHtcblx0Y29udHJvbENvbmZpZ3VyYXRpb24/OiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj47XG5cdGVudGl0eVNldD86IHN0cmluZztcblx0Y29udGV4dFBhdGg/OiBzdHJpbmc7XG5cdHZhcmlhbnRNYW5hZ2VtZW50PzogYm9vbGVhbjtcbn07XG5cbnR5cGUgVmFyaWFudElEcyA9IHtcblx0c1BhZ2VWYXJpYW50SWQ6IFN0cmluZztcblx0c0ZpbHRlckJhclZhcmlhbnRJZDogU3RyaW5nO1xuXHRzVGFibGVWYXJpYW50SWQ6IFN0cmluZztcblx0c0NoYXJ0VmFyaWFudElkOiBTdHJpbmc7XG59O1xuXG5jb25zdCBOYXZUeXBlID0gTmF2TGlicmFyeS5OYXZUeXBlLFxuXHRWYXJpYW50TWFuYWdlbWVudFR5cGUgPSBDb3JlTGlicmFyeS5WYXJpYW50TWFuYWdlbWVudCxcblx0VGVtcGxhdGVDb250ZW50VmlldyA9IENvcmVMaWJyYXJ5LlRlbXBsYXRlQ29udGVudFZpZXcsXG5cdEluaXRpYWxMb2FkTW9kZSA9IENvcmVMaWJyYXJ5LkluaXRpYWxMb2FkTW9kZSxcblx0Q09ORElUSU9OX1BBVEhfVE9fUFJPUEVSVFlfUEFUSF9SRUdFWCA9IC9cXCt8XFwqL2c7XG5cbmNvbnN0IFZpZXdTdGF0ZU92ZXJyaWRlOiBhbnkgPSB7XG5cdF9iU2VhcmNoVHJpZ2dlcmVkOiBmYWxzZSxcblx0YXBwbHlJbml0aWFsU3RhdGVPbmx5OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdG9uQmVmb3JlU3RhdGVBcHBsaWVkOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLCBhUHJvbWlzZXM6IGFueSwgbmF2aWdhdGlvblR5cGU/OiBzdHJpbmcpIHtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0b0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXIsXG5cdFx0XHRvRmlsdGVyQmFyID0gb0NvbnRyb2xsZXIuX2dldEZpbHRlckJhckNvbnRyb2woKSxcblx0XHRcdGFUYWJsZXMgPSBvQ29udHJvbGxlci5fZ2V0Q29udHJvbHMoXCJ0YWJsZVwiKTtcblx0XHRpZiAob0ZpbHRlckJhcikge1xuXHRcdFx0b0ZpbHRlckJhci5zZXRTdXNwZW5kU2VsZWN0aW9uKHRydWUpO1xuXHRcdFx0YVByb21pc2VzLnB1c2goKG9GaWx0ZXJCYXIgYXMgYW55KS53YWl0Rm9ySW5pdGlhbGl6YXRpb24oKSk7XG5cdFx0XHQvL1RoaXMgaXMgcmVxdWlyZWQgdG8gcmVtb3ZlIGFueSBleGlzdGluZyBvciBkZWZhdWx0IGZpbHRlciBjb25kaXRpb25zIGJlZm9yZSByZXN0b3JpbmcgdGhlIGZpbHRlciBiYXIgc3RhdGUgaW4gaHlicmlkIG5hdmlnYXRpb24gbW9kZS5cblx0XHRcdGlmIChuYXZpZ2F0aW9uVHlwZSA9PT0gTmF2VHlwZS5oeWJyaWQpIHtcblx0XHRcdFx0dGhpcy5fY2xlYXJGaWx0ZXJDb25kaXRpb25zKG9GaWx0ZXJCYXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRhUHJvbWlzZXMucHVzaChvVGFibGUuaW5pdGlhbGl6ZWQoKSk7XG5cdFx0fSk7XG5cblx0XHRkZWxldGUgdGhpcy5fYlNlYXJjaFRyaWdnZXJlZDtcblx0fSxcblx0b25BZnRlclN0YXRlQXBwbGllZDogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSkge1xuXHRcdGNvbnN0IG9Db250cm9sbGVyID0gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyO1xuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRvRmlsdGVyQmFyLnNldFN1c3BlbmRTZWxlY3Rpb24oZmFsc2UpO1xuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2xsZXIuX2lzRmlsdGVyQmFySGlkZGVuKCkpIHtcblx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9Db250cm9sbGVyLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiaGFzUGVuZGluZ0ZpbHRlcnNcIiwgZmFsc2UpO1xuXHRcdFx0aWYgKG9Db250cm9sbGVyLl9pc011bHRpTW9kZSgpKSB7XG5cdFx0XHRcdG9Db250cm9sbGVyLl9nZXRNdWx0aU1vZGVDb250cm9sKCkuc2V0Q291bnRzT3V0RGF0ZWQodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRhZGFwdEJpbmRpbmdSZWZyZXNoQ29udHJvbHM6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUsIGFDb250cm9sczogYW55KSB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpLFxuXHRcdFx0b0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXIsXG5cdFx0XHRhVmlld0NvbnRyb2xzID0gb0NvbnRyb2xsZXIuX2dldENvbnRyb2xzKCksXG5cdFx0XHRhQ29udHJvbHNUb1JlZnJlc2ggPSBLZWVwQWxpdmVIZWxwZXIuZ2V0Q29udHJvbHNGb3JSZWZyZXNoKG9WaWV3LCBhVmlld0NvbnRyb2xzKTtcblxuXHRcdEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGFDb250cm9scywgYUNvbnRyb2xzVG9SZWZyZXNoKTtcblx0fSxcblx0YWRhcHRTdGF0ZUNvbnRyb2xzOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLCBhU3RhdGVDb250cm9sczogYW55KSB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyLFxuXHRcdFx0b1ZpZXdEYXRhID0gb1ZpZXcuZ2V0Vmlld0RhdGEoKSxcblx0XHRcdGJDb250cm9sVk0gPSBvVmlld0RhdGEudmFyaWFudE1hbmFnZW1lbnQgPT09IFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sO1xuXG5cdFx0Y29uc3Qgb0ZpbHRlckJhclZNID0gdGhpcy5fZ2V0RmlsdGVyQmFyVk0ob1ZpZXcpO1xuXHRcdGlmIChvRmlsdGVyQmFyVk0pIHtcblx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0ZpbHRlckJhclZNKTtcblx0XHR9XG5cdFx0aWYgKG9Db250cm9sbGVyLl9pc011bHRpTW9kZSgpKSB7XG5cdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9Db250cm9sbGVyLl9nZXRNdWx0aU1vZGVDb250cm9sKCkpO1xuXHRcdH1cblx0XHRvQ29udHJvbGxlci5fZ2V0Q29udHJvbHMoXCJ0YWJsZVwiKS5mb3JFYWNoKGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1F1aWNrRmlsdGVyID0gb1RhYmxlLmdldFF1aWNrRmlsdGVyKCk7XG5cdFx0XHRpZiAob1F1aWNrRmlsdGVyKSB7XG5cdFx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob1F1aWNrRmlsdGVyKTtcblx0XHRcdH1cblx0XHRcdGlmIChiQ29udHJvbFZNKSB7XG5cdFx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob1RhYmxlLmdldFZhcmlhbnQoKSk7XG5cdFx0XHR9XG5cdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9UYWJsZSk7XG5cdFx0fSk7XG5cdFx0aWYgKG9Db250cm9sbGVyLl9nZXRDb250cm9scyhcIkNoYXJ0XCIpKSB7XG5cdFx0XHRvQ29udHJvbGxlci5fZ2V0Q29udHJvbHMoXCJDaGFydFwiKS5mb3JFYWNoKGZ1bmN0aW9uIChvQ2hhcnQ6IGFueSkge1xuXHRcdFx0XHRpZiAoYkNvbnRyb2xWTSkge1xuXHRcdFx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0NoYXJ0LmdldFZhcmlhbnQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvQ2hhcnQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmIChvQ29udHJvbGxlci5faGFzTXVsdGlWaXN1YWxpemF0aW9ucygpKSB7XG5cdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9Db250cm9sbGVyLl9nZXRTZWdtZW50ZWRCdXR0b24oVGVtcGxhdGVDb250ZW50Vmlldy5DaGFydCkpO1xuXHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvQ29udHJvbGxlci5fZ2V0U2VnbWVudGVkQnV0dG9uKFRlbXBsYXRlQ29udGVudFZpZXcuVGFibGUpKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IG9Db250cm9sbGVyLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0ZpbHRlckJhcik7XG5cdFx0fVxuXHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob1ZpZXcuYnlJZChcImZlOjpMaXN0UmVwb3J0XCIpKTtcblx0fSxcblx0cmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLCBtQWRkaXRpb25hbFN0YXRlczogYW55KSB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyLFxuXHRcdFx0YlBlbmRpbmdGaWx0ZXIgPSAob1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCkuZ2V0UHJvcGVydHkoXCJoYXNQZW5kaW5nRmlsdGVyc1wiKTtcblxuXHRcdG1BZGRpdGlvbmFsU3RhdGVzLmRhdGFMb2FkZWQgPSAhYlBlbmRpbmdGaWx0ZXIgfHwgISF0aGlzLl9iU2VhcmNoVHJpZ2dlcmVkO1xuXHRcdGlmIChvQ29udHJvbGxlci5faGFzTXVsdGlWaXN1YWxpemF0aW9ucygpKSB7XG5cdFx0XHRjb25zdCBzQWxwQ29udGVudFZpZXcgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpLmdldFByb3BlcnR5KFwiYWxwQ29udGVudFZpZXdcIik7XG5cdFx0XHRtQWRkaXRpb25hbFN0YXRlcy5hbHBDb250ZW50VmlldyA9IHNBbHBDb250ZW50Vmlldztcblx0XHR9XG5cblx0XHRkZWxldGUgdGhpcy5fYlNlYXJjaFRyaWdnZXJlZDtcblx0fSxcblx0YXBwbHlBZGRpdGlvbmFsU3RhdGVzOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLCBvQWRkaXRpb25hbFN0YXRlczogYW55KSB7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKSxcblx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyLFxuXHRcdFx0b0ZpbHRlckJhciA9IG9Db250cm9sbGVyLl9nZXRGaWx0ZXJCYXJDb250cm9sKCk7XG5cblx0XHRpZiAob0FkZGl0aW9uYWxTdGF0ZXMpIHtcblx0XHRcdC8vIGV4cGxpY2l0IGNoZWNrIGZvciBib29sZWFuIHZhbHVlcyAtICd1bmRlZmluZWQnIHNob3VsZCBub3QgYWx0ZXIgdGhlIHRyaWdnZXJlZCBzZWFyY2ggcHJvcGVydHlcblx0XHRcdGlmIChvQWRkaXRpb25hbFN0YXRlcy5kYXRhTG9hZGVkID09PSBmYWxzZSAmJiBvRmlsdGVyQmFyKSB7XG5cdFx0XHRcdC8vIHdpdGhvdXQgdGhpcywgdGhlIGRhdGEgaXMgbG9hZGVkIG9uIG5hdmlnYXRpbmcgYmFja1xuXHRcdFx0XHQob0ZpbHRlckJhciBhcyBhbnkpLl9iU2VhcmNoVHJpZ2dlcmVkID0gZmFsc2U7XG5cdFx0XHR9IGVsc2UgaWYgKG9BZGRpdGlvbmFsU3RhdGVzLmRhdGFMb2FkZWQgPT09IHRydWUpIHtcblx0XHRcdFx0aWYgKG9GaWx0ZXJCYXIpIHtcblx0XHRcdFx0XHRjb25zdCBmaWx0ZXJCYXJBUEkgPSBvRmlsdGVyQmFyLmdldFBhcmVudCgpIGFzIEZpbHRlckJhckFQSTtcblx0XHRcdFx0XHRmaWx0ZXJCYXJBUEkudHJpZ2dlclNlYXJjaCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuX2JTZWFyY2hUcmlnZ2VyZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9Db250cm9sbGVyLl9oYXNNdWx0aVZpc3VhbGl6YXRpb25zKCkpIHtcblx0XHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdFx0aWYgKCFzeXN0ZW0uZGVza3RvcCAmJiBvQWRkaXRpb25hbFN0YXRlcy5hbHBDb250ZW50VmlldyA9PSBUZW1wbGF0ZUNvbnRlbnRWaWV3Lkh5YnJpZCkge1xuXHRcdFx0XHRcdG9BZGRpdGlvbmFsU3RhdGVzLmFscENvbnRlbnRWaWV3ID0gVGVtcGxhdGVDb250ZW50Vmlldy5DaGFydDtcblx0XHRcdFx0fVxuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHRcblx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdC5zZXRQcm9wZXJ0eShgJHtvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UGF0aCgpfS9hbHBDb250ZW50Vmlld2AsIG9BZGRpdGlvbmFsU3RhdGVzLmFscENvbnRlbnRWaWV3KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdF9hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzVG9GaWx0ZXJiYXI6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUgJiB0eXBlb2YgVmlld1N0YXRlT3ZlcnJpZGUsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyOiBhbnksIGFSZXN1bHRzOiBhbnkpIHtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIExpc3RSZXBvcnRDb250cm9sbGVyO1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBvQ29udHJvbGxlci5nZXRBcHBDb21wb25lbnQoKTtcblx0XHRjb25zdCBvQ29tcG9uZW50RGF0YSA9IG9BcHBDb21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpO1xuXHRcdGNvbnN0IG9TdGFydHVwUGFyYW1ldGVycyA9IChvQ29tcG9uZW50RGF0YSAmJiBvQ29tcG9uZW50RGF0YS5zdGFydHVwUGFyYW1ldGVycykgfHwge307XG5cdFx0Y29uc3Qgb1ZhcmlhbnRQcm9taXNlID0gdGhpcy5oYW5kbGVWYXJpYW50SWRQYXNzZWRWaWFVUkxQYXJhbXMob1N0YXJ0dXBQYXJhbWV0ZXJzKTtcblx0XHRsZXQgYkZpbHRlclZhcmlhbnRBcHBsaWVkOiBib29sZWFuO1xuXHRcdGFSZXN1bHRzLnB1c2goXG5cdFx0XHRvVmFyaWFudFByb21pc2Vcblx0XHRcdFx0LnRoZW4oKGFWYXJpYW50czogYW55W10pID0+IHtcblx0XHRcdFx0XHRpZiAoYVZhcmlhbnRzICYmIGFWYXJpYW50cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRpZiAoYVZhcmlhbnRzWzBdID09PSB0cnVlIHx8IGFWYXJpYW50c1sxXSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0XHRiRmlsdGVyVmFyaWFudEFwcGxpZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5fYXBwbHlTZWxlY3Rpb25WYXJpYW50KG9WaWV3LCBvTmF2aWdhdGlvblBhcmFtZXRlciwgYkZpbHRlclZhcmlhbnRBcHBsaWVkKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IG9EeW5hbWljUGFnZSA9IG9Db250cm9sbGVyLl9nZXREeW5hbWljTGlzdFJlcG9ydENvbnRyb2woKTtcblx0XHRcdFx0XHRsZXQgYlByZXZlbnRJbml0aWFsU2VhcmNoID0gZmFsc2U7XG5cdFx0XHRcdFx0Y29uc3Qgb0ZpbHRlckJhclZNID0gdGhpcy5fZ2V0RmlsdGVyQmFyVk0ob1ZpZXcpO1xuXHRcdFx0XHRcdGNvbnN0IG9GaWx0ZXJCYXJDb250cm9sID0gb0NvbnRyb2xsZXIuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRcdFx0XHRpZiAob0ZpbHRlckJhckNvbnRyb2wpIHtcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0KG9OYXZpZ2F0aW9uUGFyYW1ldGVyLm5hdmlnYXRpb25UeXBlICE9PSBOYXZUeXBlLmluaXRpYWwgJiYgb05hdmlnYXRpb25QYXJhbWV0ZXIucmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQpIHx8XG5cdFx0XHRcdFx0XHRcdCghb0ZpbHRlckJhclZNICYmIG9WaWV3LmdldFZpZXdEYXRhKCkuaW5pdGlhbExvYWQgPT09IEluaXRpYWxMb2FkTW9kZS5FbmFibGVkKSB8fFxuXHRcdFx0XHRcdFx0XHRvQ29udHJvbGxlci5fc2hvdWxkQXV0b1RyaWdnZXJTZWFyY2gob0ZpbHRlckJhclZNKVxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGZpbHRlckJhckFQSSA9IG9GaWx0ZXJCYXJDb250cm9sLmdldFBhcmVudCgpIGFzIEZpbHRlckJhckFQSTtcblx0XHRcdFx0XHRcdFx0ZmlsdGVyQmFyQVBJLnRyaWdnZXJTZWFyY2goKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGJQcmV2ZW50SW5pdGlhbFNlYXJjaCA9IHRoaXMuX3ByZXZlbnRJbml0aWFsU2VhcmNoKG9GaWx0ZXJCYXJWTSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyByZXNldCB0aGUgc3VzcGVuZCBzZWxlY3Rpb24gb24gZmlsdGVyIGJhciB0byBhbGxvdyBsb2FkaW5nIG9mIGRhdGEgd2hlbiBuZWVkZWQgKHdhcyBzZXQgb24gTFIgSW5pdClcblx0XHRcdFx0XHRcdG9GaWx0ZXJCYXJDb250cm9sLnNldFN1c3BlbmRTZWxlY3Rpb24oZmFsc2UpO1xuXHRcdFx0XHRcdFx0dGhpcy5fYlNlYXJjaFRyaWdnZXJlZCA9ICFiUHJldmVudEluaXRpYWxTZWFyY2g7XG5cdFx0XHRcdFx0XHRvRHluYW1pY1BhZ2Uuc2V0SGVhZGVyRXhwYW5kZWQoc3lzdGVtLmRlc2t0b3AgfHwgYlByZXZlbnRJbml0aWFsU2VhcmNoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiVmFyaWFudCBJRCBjYW5ub3QgYmUgYXBwbGllZFwiKTtcblx0XHRcdFx0fSlcblx0XHQpO1xuXHR9LFxuXG5cdGhhbmRsZVZhcmlhbnRJZFBhc3NlZFZpYVVSTFBhcmFtczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSwgb1VybFBhcmFtczogYW55KSB7XG5cdFx0Y29uc3QgYVBhZ2VWYXJpYW50SWQgPSBvVXJsUGFyYW1zW1wic2FwLXVpLWZlLXZhcmlhbnQtaWRcIl0sXG5cdFx0XHRhRmlsdGVyQmFyVmFyaWFudElkID0gb1VybFBhcmFtc1tcInNhcC11aS1mZS1maWx0ZXJiYXItdmFyaWFudC1pZFwiXSxcblx0XHRcdGFUYWJsZVZhcmlhbnRJZCA9IG9VcmxQYXJhbXNbXCJzYXAtdWktZmUtdGFibGUtdmFyaWFudC1pZFwiXSxcblx0XHRcdGFDaGFydFZhcmlhbnRJZCA9IG9VcmxQYXJhbXNbXCJzYXAtdWktZmUtY2hhcnQtdmFyaWFudC1pZFwiXTtcblx0XHRsZXQgb1ZhcmlhbnRJRHM7XG5cdFx0aWYgKGFQYWdlVmFyaWFudElkIHx8IGFGaWx0ZXJCYXJWYXJpYW50SWQgfHwgYVRhYmxlVmFyaWFudElkIHx8IGFDaGFydFZhcmlhbnRJZCkge1xuXHRcdFx0b1ZhcmlhbnRJRHMgPSB7XG5cdFx0XHRcdHNQYWdlVmFyaWFudElkOiBhUGFnZVZhcmlhbnRJZCAmJiBhUGFnZVZhcmlhbnRJZFswXSxcblx0XHRcdFx0c0ZpbHRlckJhclZhcmlhbnRJZDogYUZpbHRlckJhclZhcmlhbnRJZCAmJiBhRmlsdGVyQmFyVmFyaWFudElkWzBdLFxuXHRcdFx0XHRzVGFibGVWYXJpYW50SWQ6IGFUYWJsZVZhcmlhbnRJZCAmJiBhVGFibGVWYXJpYW50SWRbMF0sXG5cdFx0XHRcdHNDaGFydFZhcmlhbnRJZDogYUNoYXJ0VmFyaWFudElkICYmIGFDaGFydFZhcmlhbnRJZFswXVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2hhbmRsZUNvbnRyb2xWYXJpYW50SWQob1ZhcmlhbnRJRHMpO1xuXHR9LFxuXG5cdF9oYW5kbGVDb250cm9sVmFyaWFudElkOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLCBvVmFyaWFudElEczogVmFyaWFudElEcykge1xuXHRcdGxldCBvVk06IFZhcmlhbnRNYW5hZ2VtZW50O1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRhUHJvbWlzZXM6IFZhcmlhbnRNYW5hZ2VtZW50W10gPSBbXTtcblx0XHRjb25zdCBzVmFyaWFudE1hbmFnZW1lbnQgPSBvVmlldy5nZXRWaWV3RGF0YSgpLnZhcmlhbnRNYW5hZ2VtZW50O1xuXHRcdGlmIChvVmFyaWFudElEcyAmJiBvVmFyaWFudElEcy5zUGFnZVZhcmlhbnRJZCAmJiBzVmFyaWFudE1hbmFnZW1lbnQgPT09IFwiUGFnZVwiKSB7XG5cdFx0XHRvVk0gPSBvVmlldy5ieUlkKFwiZmU6OlBhZ2VWYXJpYW50TWFuYWdlbWVudFwiKTtcblx0XHRcdHRoaXMuX2hhbmRsZVBhZ2VWYXJpYW50SWQob1ZhcmlhbnRJRHMsIG9WTSwgYVByb21pc2VzKTtcblx0XHR9IGVsc2UgaWYgKG9WYXJpYW50SURzICYmIHNWYXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIpIHtcblx0XHRcdGlmIChvVmFyaWFudElEcy5zRmlsdGVyQmFyVmFyaWFudElkKSB7XG5cdFx0XHRcdG9WTSA9IG9WaWV3LmdldENvbnRyb2xsZXIoKS5fZ2V0RmlsdGVyQmFyVmFyaWFudENvbnRyb2woKTtcblx0XHRcdFx0dGhpcy5faGFuZGxlRmlsdGVyQmFyVmFyaWFudENvbnRyb2xJZChvVmFyaWFudElEcywgb1ZNLCBhUHJvbWlzZXMpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9WYXJpYW50SURzLnNUYWJsZVZhcmlhbnRJZCkge1xuXHRcdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcjtcblx0XHRcdFx0dGhpcy5faGFuZGxlVGFibGVDb250cm9sVmFyaWFudElkKG9WYXJpYW50SURzLCBvQ29udHJvbGxlciwgYVByb21pc2VzKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9WYXJpYW50SURzLnNDaGFydFZhcmlhbnRJZCkge1xuXHRcdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcjtcblx0XHRcdFx0dGhpcy5faGFuZGxlQ2hhcnRDb250cm9sVmFyaWFudElkKG9WYXJpYW50SURzLCBvQ29udHJvbGxlciwgYVByb21pc2VzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFQcm9taXNlcyk7XG5cdH0sXG5cdC8qXG5cdCAqIEhhbmRsZXMgcGFnZSBsZXZlbCB2YXJpYW50IGFuZCBwYXNzZXMgdGhlIHZhcmlhbnQgdG8gdGhlIGZ1bmN0aW9uIHRoYXQgcHVzaGVzIHRoZSBwcm9taXNlIHRvIHRoZSBwcm9taXNlIGFycmF5XG5cdCAqXG5cdCAqIEBwYXJhbSBvVmFyaW5hdElEcyBjb250YWlucyBhbiBvYmplY3Qgb2YgYWxsIHZhcmlhbnQgSURzXG5cdCAqIEBwYXJhbSBvVk0gY29udGFpbnMgdGhlIHZhaXJhbnQgbWFuYWdlbWVudCBvYmplY3QgZm9yIHRoZSBwYWdlIHZhcmlhbnRcblx0ICogQHBhcmFtIGFQcm9taXNlcyBpcyBhbiBhcnJheSBvZiBhbGwgcHJvbWlzZXNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9oYW5kbGVQYWdlVmFyaWFudElkOiBmdW5jdGlvbiAoXG5cdFx0dGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLFxuXHRcdG9WYXJpYW50SURzOiBWYXJpYW50SURzLFxuXHRcdG9WTTogVmFyaWFudE1hbmFnZW1lbnQsXG5cdFx0YVByb21pc2VzOiBWYXJpYW50TWFuYWdlbWVudFtdXG5cdCkge1xuXHRcdG9WTS5nZXRWYXJpYW50cygpLmZvckVhY2goKG9WYXJpYW50OiBWYXJpYW50T2JqZWN0KSA9PiB7XG5cdFx0XHR0aGlzLl9maW5kQW5kUHVzaFZhcmlhbnRUb1Byb21pc2Uob1ZhcmlhbnQsIG9WYXJpYW50SURzLnNQYWdlVmFyaWFudElkLCBvVk0sIGFQcm9taXNlcywgdHJ1ZSk7XG5cdFx0fSk7XG5cdH0sXG5cblx0Lypcblx0ICogSGFuZGxlcyBjb250cm9sIGxldmVsIHZhcmlhbnQgZm9yIGZpbHRlciBiYXIgYW5kIHBhc3NlcyB0aGUgdmFyaWFudCB0byB0aGUgZnVuY3Rpb24gdGhhdCBwdXNoZXMgdGhlIHByb21pc2UgdG8gdGhlIHByb21pc2UgYXJyYXlcblx0ICpcblx0ICogQHBhcmFtIG9WYXJpbmF0SURzIGNvbnRhaW5zIGFuIG9iamVjdCBvZiBhbGwgdmFyaWFudCBJRHNcblx0ICogQHBhcmFtIG9WTSBjb250YWlucyB0aGUgdmFpcmFudCBtYW5hZ2VtZW50IG9iamVjdCBmb3IgdGhlIGZpbHRlciBiYXJcblx0ICogQHBhcmFtIGFQcm9taXNlcyBpcyBhbiBhcnJheSBvZiBhbGwgcHJvbWlzZXNcblx0ICogQHByaXZhdGVcblx0ICovXG5cblx0X2hhbmRsZUZpbHRlckJhclZhcmlhbnRDb250cm9sSWQ6IGZ1bmN0aW9uIChcblx0XHR0aGlzOiBWaWV3U3RhdGUgJiB0eXBlb2YgVmlld1N0YXRlT3ZlcnJpZGUsXG5cdFx0b1ZhcmlhbnRJRHM6IFZhcmlhbnRJRHMsXG5cdFx0b1ZNOiBWYXJpYW50TWFuYWdlbWVudCxcblx0XHRhUHJvbWlzZXM6IFZhcmlhbnRNYW5hZ2VtZW50W11cblx0KSB7XG5cdFx0aWYgKG9WTSkge1xuXHRcdFx0b1ZNLmdldFZhcmlhbnRzKCkuZm9yRWFjaCgob1ZhcmlhbnQ6IFZhcmlhbnRPYmplY3QpID0+IHtcblx0XHRcdFx0dGhpcy5fZmluZEFuZFB1c2hWYXJpYW50VG9Qcm9taXNlKG9WYXJpYW50LCBvVmFyaWFudElEcy5zRmlsdGVyQmFyVmFyaWFudElkLCBvVk0sIGFQcm9taXNlcywgdHJ1ZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0Lypcblx0ICogSGFuZGxlcyBjb250cm9sIGxldmVsIHZhcmlhbnQgZm9yIHRhYmxlIGFuZCBwYXNzZXMgdGhlIHZhcmlhbnQgdG8gdGhlIGZ1bmN0aW9uIHRoYXQgcHVzaGVzIHRoZSBwcm9taXNlIHRvIHRoZSBwcm9taXNlIGFycmF5XG5cdCAqXG5cdCAqIEBwYXJhbSBvVmFyaW5hdElEcyBjb250YWlucyBhbiBvYmplY3Qgb2YgYWxsIHZhcmlhbnQgSURzXG5cdCAqIEBwYXJhbSBvQ29udHJvbGxlciBoYXMgdGhlIGxpc3QgcmVwb3J0IGNvbnRyb2xsZXIgb2JqZWN0XG5cdCAqIEBwYXJhbSBhUHJvbWlzZXMgaXMgYW4gYXJyYXkgb2YgYWxsIHByb21pc2VzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfaGFuZGxlVGFibGVDb250cm9sVmFyaWFudElkOiBmdW5jdGlvbiAoXG5cdFx0dGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLFxuXHRcdG9WYXJpYW50SURzOiBWYXJpYW50SURzLFxuXHRcdG9Db250cm9sbGVyOiBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRhUHJvbWlzZXM6IFZhcmlhbnRNYW5hZ2VtZW50W11cblx0KSB7XG5cdFx0Y29uc3QgYVRhYmxlcyA9IG9Db250cm9sbGVyLl9nZXRDb250cm9scyhcInRhYmxlXCIpO1xuXHRcdGFUYWJsZXMuZm9yRWFjaCgob1RhYmxlOiBUYWJsZSkgPT4ge1xuXHRcdFx0Y29uc3Qgb1RhYmxlVmFyaWFudCA9IG9UYWJsZS5nZXRWYXJpYW50KCk7XG5cdFx0XHRpZiAob1RhYmxlICYmIG9UYWJsZVZhcmlhbnQpIHtcblx0XHRcdFx0b1RhYmxlVmFyaWFudC5nZXRWYXJpYW50cygpLmZvckVhY2goKG9WYXJpYW50OiBWYXJpYW50T2JqZWN0KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fZmluZEFuZFB1c2hWYXJpYW50VG9Qcm9taXNlKG9WYXJpYW50LCBvVmFyaWFudElEcy5zVGFibGVWYXJpYW50SWQsIG9UYWJsZVZhcmlhbnQsIGFQcm9taXNlcyk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qXG5cdCAqIEhhbmRsZXMgY29udHJvbCBsZXZlbCB2YXJpYW50IGZvciBjaGFydCBhbmQgcGFzc2VzIHRoZSB2YXJpYW50IHRvIHRoZSBmdW5jdGlvbiB0aGF0IHB1c2hlcyB0aGUgcHJvbWlzZSB0byB0aGUgcHJvbWlzZSBhcnJheVxuXHQgKlxuXHQgKiBAcGFyYW0gb1ZhcmluYXRJRHMgY29udGFpbnMgYW4gb2JqZWN0IG9mIGFsbCB2YXJpYW50IElEc1xuXHQgKiBAcGFyYW0gb0NvbnRyb2xsZXIgaGFzIHRoZSBsaXN0IHJlcG9ydCBjb250cm9sbGVyIG9iamVjdFxuXHQgKiBAcGFyYW0gYVByb21pc2VzIGlzIGFuIGFycmF5IG9mIGFsbCBwcm9taXNlc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2hhbmRsZUNoYXJ0Q29udHJvbFZhcmlhbnRJZDogZnVuY3Rpb24gKFxuXHRcdHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSxcblx0XHRvVmFyaWFudElEczogVmFyaWFudElEcyxcblx0XHRvQ29udHJvbGxlcjogTGlzdFJlcG9ydENvbnRyb2xsZXIsXG5cdFx0YVByb21pc2VzOiBWYXJpYW50TWFuYWdlbWVudFtdXG5cdCkge1xuXHRcdGNvbnN0IGFDaGFydHMgPSBvQ29udHJvbGxlci5fZ2V0Q29udHJvbHMoXCJDaGFydFwiKTtcblx0XHRhQ2hhcnRzLmZvckVhY2goKG9DaGFydDogQ2hhcnQpID0+IHtcblx0XHRcdGNvbnN0IG9DaGFydFZhcmlhbnQgPSBvQ2hhcnQuZ2V0VmFyaWFudCgpO1xuXHRcdFx0Y29uc3QgYVZhcmlhbnRzID0gb0NoYXJ0VmFyaWFudC5nZXRWYXJpYW50cygpO1xuXHRcdFx0aWYgKGFWYXJpYW50cykge1xuXHRcdFx0XHRhVmFyaWFudHMuZm9yRWFjaCgob1ZhcmlhbnQ6IFZhcmlhbnRPYmplY3QpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9maW5kQW5kUHVzaFZhcmlhbnRUb1Byb21pc2Uob1ZhcmlhbnQsIG9WYXJpYW50SURzLnNDaGFydFZhcmlhbnRJZCwgb0NoYXJ0VmFyaWFudCwgYVByb21pc2VzKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdC8qXG5cdCAqIE1hdGNoZXMgdGhlIHZhcmlhbnQgSUQgcHJvdmlkZWQgaW4gdGhlIHVybCB0byB0aGUgYXZhaWxhYmxlIHZhaXJhbnQgSURzIGFuZCBwdXNoZXMgdGhlIGFwcHJvcHJpYXRlIHByb21pc2UgdG8gdGhlIHByb21pc2UgYXJyYXlcblx0ICpcblx0ICogQHBhcmFtIG9WYXJpYW50IGlzIGFuIG9iamVjdCBmb3IgYSBzcGVjaWZpYyB2YXJpYW50XG5cdCAqIEBwYXJhbSBzVmFyaWFudElkIGlzIHRoZSB2YXJpYW50IElEIHByb3ZpZGVkIGluIHRoZSB1cmxcblx0ICogQHBhcmFtIG9WTSBpcyB0aGUgdmFyaWFudCBtYW5hZ2VtZW50IG9iamVjdCBmb3IgdGhlIHNwZWNmaWMgdmFyaWFudFxuXHQgKiBAcGFyYW0gYVByb21pc2VzIGlzIGFuIGFycmF5IG9mIHByb21pc2VzXG5cdCAqIEBwYXJhbSBiRmlsdGVyVmFyaWFudEFwcGxpZWQgaXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHdoaWNoIGlzIHNldCB0byB0dXJlIGluIGNhc2UgdGhlIGZpbHRlciB2YXJpYW50IGlzIGFwcGxpZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9maW5kQW5kUHVzaFZhcmlhbnRUb1Byb21pc2U6IGZ1bmN0aW9uIChcblx0XHQvL1RoaXMgZnVuY3Rpb24gZmluZHMgdGhlIHN1aXRhYmxlIHZhcmlhbnQgZm9yIHRoZSB2YXJpYW50SUQgcHJvdmlkZWQgaW4gdGhlIHVybCBhbmQgcHVzaGVzIHRoZW0gdG8gdGhlIHByb21pc2UgYXJyYXlcblx0XHR0aGlzOiBWaWV3U3RhdGUgJiB0eXBlb2YgVmlld1N0YXRlT3ZlcnJpZGUsXG5cdFx0b1ZhcmlhbnQ6IFZhcmlhbnRPYmplY3QsXG5cdFx0c1ZhcmlhbnRJZDogU3RyaW5nLFxuXHRcdG9WTTogVmFyaWFudE1hbmFnZW1lbnQsXG5cdFx0YVByb21pc2VzOiBWYXJpYW50TWFuYWdlbWVudFtdLFxuXHRcdGJGaWx0ZXJWYXJpYW50QXBwbGllZD86IGJvb2xlYW5cblx0KSB7XG5cdFx0aWYgKG9WYXJpYW50LmtleSA9PT0gc1ZhcmlhbnRJZCkge1xuXHRcdFx0YVByb21pc2VzLnB1c2godGhpcy5fYXBwbHlDb250cm9sVmFyaWFudChvVk0sIHNWYXJpYW50SWQsIGJGaWx0ZXJWYXJpYW50QXBwbGllZCkpO1xuXHRcdH1cblx0fSxcblxuXHRfYXBwbHlDb250cm9sVmFyaWFudDogZnVuY3Rpb24gKG9WYXJpYW50OiBhbnksIHNWYXJpYW50SUQ6IGFueSwgYkZpbHRlclZhcmlhbnRBcHBsaWVkOiBhbnkpIHtcblx0XHRjb25zdCBzVmFyaWFudFJlZmVyZW5jZSA9IHRoaXMuX2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZShvVmFyaWFudCwgc1ZhcmlhbnRJRCkgPyBzVmFyaWFudElEIDogb1ZhcmlhbnQuZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCk7XG5cdFx0Y29uc3Qgb1ZNID0gQ29udHJvbFZhcmlhbnRBcHBseUFQSS5hY3RpdmF0ZVZhcmlhbnQoe1xuXHRcdFx0ZWxlbWVudDogb1ZhcmlhbnQsXG5cdFx0XHR2YXJpYW50UmVmZXJlbmNlOiBzVmFyaWFudFJlZmVyZW5jZVxuXHRcdH0pO1xuXHRcdHJldHVybiBvVk0udGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gYkZpbHRlclZhcmlhbnRBcHBsaWVkO1xuXHRcdH0pO1xuXHR9LFxuXHQvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBwcml2YXRlIGhlbHBlciAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXHRfZ2V0RmlsdGVyQmFyVk06IGZ1bmN0aW9uIChvVmlldzogYW55KSB7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gb1ZpZXcuZ2V0Vmlld0RhdGEoKTtcblx0XHRzd2l0Y2ggKG9WaWV3RGF0YS52YXJpYW50TWFuYWdlbWVudCkge1xuXHRcdFx0Y2FzZSBWYXJpYW50TWFuYWdlbWVudFR5cGUuUGFnZTpcblx0XHRcdFx0cmV0dXJuIG9WaWV3LmJ5SWQoXCJmZTo6UGFnZVZhcmlhbnRNYW5hZ2VtZW50XCIpO1xuXHRcdFx0Y2FzZSBWYXJpYW50TWFuYWdlbWVudFR5cGUuQ29udHJvbDpcblx0XHRcdFx0cmV0dXJuIG9WaWV3LmdldENvbnRyb2xsZXIoKS5fZ2V0RmlsdGVyQmFyVmFyaWFudENvbnRyb2woKTtcblx0XHRcdGNhc2UgVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmU6XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmhhbmRsZWQgdmFyaWFudCBzZXR0aW5nOiAke29WaWV3RGF0YS52YXJpYW50TWFuYWdlbWVudH1gKTtcblx0XHR9XG5cdH0sXG5cblx0X3ByZXZlbnRJbml0aWFsU2VhcmNoOiBmdW5jdGlvbiAob1ZhcmlhbnRNYW5hZ2VtZW50OiBhbnkpIHtcblx0XHRpZiAoIW9WYXJpYW50TWFuYWdlbWVudCkge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdGNvbnN0IGFWYXJpYW50cyA9IG9WYXJpYW50TWFuYWdlbWVudC5nZXRWYXJpYW50cygpO1xuXHRcdGNvbnN0IG9DdXJyZW50VmFyaWFudCA9IGFWYXJpYW50cy5maW5kKGZ1bmN0aW9uIChvSXRlbTogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0l0ZW0ua2V5ID09PSBvVmFyaWFudE1hbmFnZW1lbnQuZ2V0Q3VycmVudFZhcmlhbnRLZXkoKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gIW9DdXJyZW50VmFyaWFudC5leGVjdXRlT25TZWxlY3Q7XG5cdH0sXG5cblx0X2FwcGx5U2VsZWN0aW9uVmFyaWFudDogYXN5bmMgZnVuY3Rpb24gKG9WaWV3OiBWaWV3LCBvTmF2aWdhdGlvblBhcmFtZXRlcjogTmF2SGFuZGxlck5hdlBhcmFtcywgYkZpbHRlclZhcmlhbnRBcHBsaWVkOiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckJhciA9IChvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXIpLl9nZXRGaWx0ZXJCYXJDb250cm9sKCksXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IG9OYXZpZ2F0aW9uUGFyYW1ldGVyLnNlbGVjdGlvblZhcmlhbnQgYXMgU2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMgPSBvTmF2aWdhdGlvblBhcmFtZXRlci5zZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMgYXMgU2VsZWN0aW9uVmFyaWFudDtcblx0XHRpZiAoIW9GaWx0ZXJCYXIgfHwgIW9TZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXHRcdGxldCBvQ29uZGl0aW9ucyA9IHt9O1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvVmlldy5nZXRNb2RlbCgpPy5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRjb25zdCBvVmlld0RhdGEgPSBvVmlldy5nZXRWaWV3RGF0YSgpIGFzIExSVmlld0RhdGE7XG5cdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb1ZpZXdEYXRhLmNvbnRleHRQYXRoIHx8IGAvJHtvVmlld0RhdGEuZW50aXR5U2V0fWA7XG5cdFx0Y29uc3QgYU1hbmRhdG9yeUZpbHRlckZpZWxkcyA9IENvbW1vblV0aWxzLmdldE1hbmRhdG9yeUZpbHRlckZpZWxkcyhvTWV0YU1vZGVsLCBzQ29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IGJVc2VTZW1hbnRpY0RhdGVSYW5nZSA9IG9GaWx0ZXJCYXIuZGF0YShcInVzZVNlbWFudGljRGF0ZVJhbmdlXCIpO1xuXHRcdGxldCBvVmFyaWFudDtcblx0XHRzd2l0Y2ggKG9WaWV3RGF0YS52YXJpYW50TWFuYWdlbWVudCkge1xuXHRcdFx0Y2FzZSBWYXJpYW50TWFuYWdlbWVudFR5cGUuUGFnZTpcblx0XHRcdFx0b1ZhcmlhbnQgPSBvVmlldy5ieUlkKFwiZmU6OlBhZ2VWYXJpYW50TWFuYWdlbWVudFwiKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sOlxuXHRcdFx0XHRvVmFyaWFudCA9IChvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXIpLl9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmU6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0Y29uc3QgYlJlcXVpcmVzU3RhbmRhcmRWYXJpYW50ID0gb05hdmlnYXRpb25QYXJhbWV0ZXIucmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ7XG5cdFx0Ly8gY2hlY2sgaWYgRkxQIGRlZmF1bHQgdmFsdWVzIGFyZSB0aGVyZSBhbmQgaXMgaXQgc3RhbmRhcmQgdmFyaWFudFxuXHRcdGNvbnN0IGJJc0ZMUFZhbHVlUHJlc2VudDogYm9vbGVhbiA9XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzICYmXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzLmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCkubGVuZ3RoID4gMCAmJlxuXHRcdFx0b1ZhcmlhbnQuZ2V0RGVmYXVsdFZhcmlhbnRLZXkoKSA9PT0gb1ZhcmlhbnQuZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCkgJiZcblx0XHRcdG9OYXZpZ2F0aW9uUGFyYW1ldGVyLmJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkgPT09IHRydWU7XG5cblx0XHQvLyBnZXQgY29uZGl0aW9ucyB3aGVuIEZMUCB2YWx1ZSBpcyBwcmVzZW50XG5cdFx0aWYgKGJGaWx0ZXJWYXJpYW50QXBwbGllZCB8fCBiSXNGTFBWYWx1ZVByZXNlbnQpIHtcblx0XHRcdG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCk7XG5cdFx0fVxuXHRcdENvbW1vblV0aWxzLmFkZERlZmF1bHREaXNwbGF5Q3VycmVuY3koYU1hbmRhdG9yeUZpbHRlckZpZWxkcywgb1NlbGVjdGlvblZhcmlhbnQsIG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMpO1xuXHRcdGF3YWl0IHRoaXMuYWRkU2VsZWN0aW9uVmFyaWFudFRvQ29uZGl0aW9ucyhvRmlsdGVyQmFyLCBvU2VsZWN0aW9uVmFyaWFudCwgb0NvbmRpdGlvbnMsIGJJc0ZMUFZhbHVlUHJlc2VudCk7XG5cblx0XHRyZXR1cm4gdGhpcy5fYWN0aXZhdGVTZWxlY3Rpb25WYXJpYW50KFxuXHRcdFx0b0ZpbHRlckJhcixcblx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0b1ZhcmlhbnQsXG5cdFx0XHRiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQsXG5cdFx0XHRiRmlsdGVyVmFyaWFudEFwcGxpZWQsXG5cdFx0XHRiSXNGTFBWYWx1ZVByZXNlbnRcblx0XHQpO1xuXHR9LFxuXHRfYWN0aXZhdGVTZWxlY3Rpb25WYXJpYW50OiBmdW5jdGlvbiAoXG5cdFx0b0ZpbHRlckJhcjogYW55LFxuXHRcdG9Db25kaXRpb25zOiBhbnksXG5cdFx0b1ZhcmlhbnQ6IGFueSxcblx0XHRiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ6IGFueSxcblx0XHRiRmlsdGVyVmFyaWFudEFwcGxpZWQ6IGFueSxcblx0XHRiSXNGTFBWYWx1ZVByZXNlbnQ/OiBib29sZWFuXG5cdCkge1xuXHRcdGxldCBvUHJvbWlzZTtcblxuXHRcdGlmIChvVmFyaWFudCAmJiAhYkZpbHRlclZhcmlhbnRBcHBsaWVkKSB7XG5cdFx0XHRsZXQgb1ZhcmlhbnRLZXkgPSBiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQgPyBvVmFyaWFudC5nZXRTdGFuZGFyZFZhcmlhbnRLZXkoKSA6IG9WYXJpYW50LmdldERlZmF1bHRWYXJpYW50S2V5KCk7XG5cdFx0XHRpZiAob1ZhcmlhbnRLZXkgPT09IG51bGwpIHtcblx0XHRcdFx0b1ZhcmlhbnRLZXkgPSBvVmFyaWFudC5nZXRJZCgpO1xuXHRcdFx0fVxuXHRcdFx0b1Byb21pc2UgPSBDb250cm9sVmFyaWFudEFwcGx5QVBJLmFjdGl2YXRlVmFyaWFudCh7XG5cdFx0XHRcdGVsZW1lbnQ6IG9WYXJpYW50LFxuXHRcdFx0XHR2YXJpYW50UmVmZXJlbmNlOiBvVmFyaWFudEtleVxuXHRcdFx0fSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQgfHwgb1ZhcmlhbnQuZ2V0RGVmYXVsdFZhcmlhbnRLZXkoKSA9PT0gb1ZhcmlhbnQuZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiBvUHJvbWlzZS50aGVuKChiQ2xlYXJGaWx0ZXJBbmRSZXBsYWNlV2l0aEFwcFN0YXRlOiBhbnkpID0+IHtcblx0XHRcdGlmIChiQ2xlYXJGaWx0ZXJBbmRSZXBsYWNlV2l0aEFwcFN0YXRlKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9mbkFwcGx5Q29uZGl0aW9ucyhvRmlsdGVyQmFyLCBvQ29uZGl0aW9ucywgYklzRkxQVmFsdWVQcmVzZW50KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHQvKlxuXHQgKiBTZXRzIGZpbHRlcmVkOiBmYWxzZSBmbGFnIHRvIGV2ZXJ5IGZpZWxkIHNvIHRoYXQgaXQgY2FuIGJlIGNsZWFyZWQgb3V0XG5cdCAqXG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyIGZpbHRlcmJhciBjb250cm9sIGlzIHVzZWQgdG8gZGlzcGxheSBmaWx0ZXIgcHJvcGVydGllcyBpbiBhIHVzZXItZnJpZW5kbHkgbWFubmVyIHRvIHBvcHVsYXRlIHZhbHVlcyBmb3IgYSBxdWVyeVxuXHQgKiBAcmV0dXJucyBwcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZm5DbGVhclN0YXRlQmVmb3JleEFwcE5hdjogYXN5bmMgZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IEZpbHRlckJhcikge1xuXHRcdHJldHVybiBhd2FpdCBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIpXG5cdFx0XHQudGhlbigob0V4dGVybmFsU3RhdGU6IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvQ29uZGl0aW9uID0gb0V4dGVybmFsU3RhdGUuZmlsdGVyO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGZpZWxkIGluIG9Db25kaXRpb24pIHtcblx0XHRcdFx0XHRpZiAoZmllbGQgIT09IFwiJGVkaXRTdGF0ZVwiICYmIGZpZWxkICE9PSBcIiRzZWFyY2hcIiAmJiBvQ29uZGl0aW9uW2ZpZWxkXSkge1xuXHRcdFx0XHRcdFx0b0NvbmRpdGlvbltmaWVsZF0uZm9yRWFjaCgoY29uZGl0aW9uOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPikgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25kaXRpb25bXCJmaWx0ZXJlZFwiXSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUob0NvbmRpdGlvbik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBleHRlcm5hbCBzdGF0ZVwiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0sXG5cblx0X2ZuQXBwbHlDb25kaXRpb25zOiBhc3luYyBmdW5jdGlvbiAob0ZpbHRlckJhcjogYW55LCBvQ29uZGl0aW9uczogYW55LCBiSXNGTFBWYWx1ZVByZXNlbnQ/OiBib29sZWFuKSB7XG5cdFx0Y29uc3QgbUZpbHRlcjogYW55ID0ge30sXG5cdFx0XHRhSXRlbXM6IGFueVtdID0gW10sXG5cdFx0XHRmbkFkanVzdFZhbHVlSGVscENvbmRpdGlvbiA9IGZ1bmN0aW9uIChvQ29uZGl0aW9uOiBhbnkpIHtcblx0XHRcdFx0Ly8gaW4gY2FzZSB0aGUgY29uZGl0aW9uIGlzIG1lYW50IGZvciBhIGZpZWxkIGhhdmluZyBhIFZILCB0aGUgZm9ybWF0IHJlcXVpcmVkIGJ5IE1EQyBkaWZmZXJzXG5cdFx0XHRcdG9Db25kaXRpb24udmFsaWRhdGVkID0gQ29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZDtcblx0XHRcdFx0aWYgKG9Db25kaXRpb24ub3BlcmF0b3IgPT09IFwiRW1wdHlcIikge1xuXHRcdFx0XHRcdG9Db25kaXRpb24ub3BlcmF0b3IgPSBcIkVRXCI7XG5cdFx0XHRcdFx0b0NvbmRpdGlvbi52YWx1ZXMgPSBbXCJcIl07XG5cdFx0XHRcdH0gZWxzZSBpZiAob0NvbmRpdGlvbi5vcGVyYXRvciA9PT0gXCJOb3RFbXB0eVwiKSB7XG5cdFx0XHRcdFx0b0NvbmRpdGlvbi5vcGVyYXRvciA9IFwiTkVcIjtcblx0XHRcdFx0XHRvQ29uZGl0aW9uLnZhbHVlcyA9IFtcIlwiXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRkZWxldGUgb0NvbmRpdGlvbi5pc0VtcHR5O1xuXHRcdFx0fTtcblx0XHRjb25zdCBmbkdldFByb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChvRmlsdGVyQ29udHJvbDogYW55LCBzRW50aXR5VHlwZVBhdGg6IGFueSkge1xuXHRcdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNFbnRpdHlUeXBlUGF0aCksXG5cdFx0XHRcdG9NZXRhTW9kZWwgPSBvRmlsdGVyQ29udHJvbC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRvRlIgPSBDb21tb25VdGlscy5nZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgoc0VudGl0eVNldFBhdGgsIG9NZXRhTW9kZWwpLFxuXHRcdFx0XHRhTm9uRmlsdGVyYWJsZVByb3BzID0gb0ZSLk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzLFxuXHRcdFx0XHRtRmlsdGVyRmllbGRzID0gRmlsdGVyVXRpbHMuZ2V0Q29udmVydGVkRmlsdGVyRmllbGRzKG9GaWx0ZXJDb250cm9sLCBzRW50aXR5VHlwZVBhdGgpLFxuXHRcdFx0XHRhUHJvcGVydHlJbmZvOiBhbnlbXSA9IFtdO1xuXHRcdFx0bUZpbHRlckZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChvQ29udmVydGVkUHJvcGVydHkpIHtcblx0XHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IG9Db252ZXJ0ZWRQcm9wZXJ0eS5jb25kaXRpb25QYXRoLnJlcGxhY2UoQ09ORElUSU9OX1BBVEhfVE9fUFJPUEVSVFlfUEFUSF9SRUdFWCwgXCJcIik7XG5cdFx0XHRcdGlmIChhTm9uRmlsdGVyYWJsZVByb3BzLmluZGV4T2Yoc1Byb3BlcnR5UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gb0NvbnZlcnRlZFByb3BlcnR5LmFubm90YXRpb25QYXRoO1xuXHRcdFx0XHRcdGNvbnN0IG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRcdFx0YVByb3BlcnR5SW5mby5wdXNoKHtcblx0XHRcdFx0XHRcdHBhdGg6IG9Db252ZXJ0ZWRQcm9wZXJ0eS5jb25kaXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0aGlkZGVuRmlsdGVyOiBvQ29udmVydGVkUHJvcGVydHkuYXZhaWxhYmlsaXR5ID09PSBcIkhpZGRlblwiLFxuXHRcdFx0XHRcdFx0aGFzVmFsdWVIZWxwOiAhc0Fubm90YXRpb25QYXRoXG5cdFx0XHRcdFx0XHRcdD8gZmFsc2Vcblx0XHRcdFx0XHRcdFx0OiBQcm9wZXJ0eUZvcm1hdHRlcnMuaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KCksIHsgY29udGV4dDogb1Byb3BlcnR5Q29udGV4dCB9KVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhUHJvcGVydHlJbmZvO1xuXHRcdH07XG5cblx0XHRyZXR1cm4gb0ZpbHRlckJhci53YWl0Rm9ySW5pdGlhbGl6YXRpb24oKS50aGVuKGFzeW5jICgpID0+IHtcblx0XHRcdGNvbnN0IHNFbnRpdHlUeXBlUGF0aCA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9GaWx0ZXJCYXIsIFwiZW50aXR5VHlwZVwiKTtcblx0XHRcdC8vIER1cmluZyBleHRlcm5hbCBhcHAgbmF2aWdhdGlvbiwgd2UgaGF2ZSB0byBjbGVhciB0aGUgZXhpc3RpbmcgY29uZGl0aW9ucyB0byBhdm9pZCBtZXJnaW5nIG9mIHZhbHVlcyBjb21pbmcgZnJvbSBhbm5vdGF0aW9uIGFuZCBjb250ZXh0XG5cdFx0XHQvLyBDb25kaXRpb24gIWJJc0ZMUFZhbHVlUHJlc2VudCBpbmRpY2F0ZXMgaXQncyBleHRlcm5hbCBhcHAgbmF2aWdhdGlvblxuXHRcdFx0aWYgKCFiSXNGTFBWYWx1ZVByZXNlbnQpIHtcblx0XHRcdFx0Y29uc3Qgb0NsZWFyQ29uZGl0aW9ucyA9IGF3YWl0IHRoaXMuX2ZuQ2xlYXJTdGF0ZUJlZm9yZXhBcHBOYXYob0ZpbHRlckJhcik7XG5cdFx0XHRcdGF3YWl0IFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUob0ZpbHRlckJhciwge1xuXHRcdFx0XHRcdGZpbHRlcjogb0NsZWFyQ29uZGl0aW9ucyxcblx0XHRcdFx0XHRpdGVtczogYUl0ZW1zXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYVByb3BlcnR5SW5mbyA9IGZuR2V0UHJvcGVydHlJbmZvKG9GaWx0ZXJCYXIsIHNFbnRpdHlUeXBlUGF0aCk7XG5cdFx0XHRhUHJvcGVydHlJbmZvXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9Qcm9wZXJ0eUluZm86IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBvUHJvcGVydHlJbmZvLnBhdGggIT09IFwiJGVkaXRTdGF0ZVwiICYmIG9Qcm9wZXJ0eUluZm8ucGF0aCAhPT0gXCIkc2VhcmNoXCI7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKChvUHJvcGVydHlJbmZvOiBhbnkpID0+IHtcblx0XHRcdFx0XHRpZiAob1Byb3BlcnR5SW5mby5wYXRoIGluIG9Db25kaXRpb25zKSB7XG5cdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0gPSBvQ29uZGl0aW9uc1tvUHJvcGVydHlJbmZvLnBhdGhdO1xuXHRcdFx0XHRcdFx0aWYgKCFvUHJvcGVydHlJbmZvLmhpZGRlbkZpbHRlcikge1xuXHRcdFx0XHRcdFx0XHRhSXRlbXMucHVzaCh7IG5hbWU6IG9Qcm9wZXJ0eUluZm8ucGF0aCB9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHlJbmZvLmhhc1ZhbHVlSGVscCkge1xuXHRcdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0uZm9yRWFjaChmbkFkanVzdFZhbHVlSGVscENvbmRpdGlvbik7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0uZm9yRWFjaChmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0b0NvbmRpdGlvbi52YWxpZGF0ZWQgPSBvQ29uZGl0aW9uLmZpbHRlcmVkID8gQ29uZGl0aW9uVmFsaWRhdGVkLk5vdFZhbGlkYXRlZCA6IG9Db25kaXRpb24udmFsaWRhdGVkO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bUZpbHRlcltvUHJvcGVydHlJbmZvLnBhdGhdID0gW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIsIHsgZmlsdGVyOiBtRmlsdGVyLCBpdGVtczogYUl0ZW1zIH0pO1xuXHRcdH0pO1xuXHR9LFxuXHRfY2xlYXJGaWx0ZXJDb25kaXRpb25zOiBhc3luYyBmdW5jdGlvbiAob0ZpbHRlckJhcjogRmlsdGVyQmFyKSB7XG5cdFx0Y29uc3QgYUl0ZW1zOiBQcm9wZXJ0eUluZm9bXSA9IFtdO1xuXHRcdHJldHVybiBvRmlsdGVyQmFyLndhaXRGb3JJbml0aWFsaXphdGlvbigpLnRoZW4oYXN5bmMgKCkgPT4ge1xuXHRcdFx0Y29uc3Qgb0NsZWFyQ29uZGl0aW9ucyA9IGF3YWl0IHRoaXMuX2ZuQ2xlYXJTdGF0ZUJlZm9yZXhBcHBOYXYob0ZpbHRlckJhcik7XG5cdFx0XHRyZXR1cm4gU3RhdGVVdGlsLmFwcGx5RXh0ZXJuYWxTdGF0ZShvRmlsdGVyQmFyLCB7XG5cdFx0XHRcdGZpbHRlcjogb0NsZWFyQ29uZGl0aW9ucyxcblx0XHRcdFx0aXRlbXM6IGFJdGVtc1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCByZXR1cm5zIGZpbHRlcnMgYW5kIGZpbHRlciBmaWVsZCBpdGVtcyB0byBhcHBseSBhbmQgYWRkLiBBbHNvIGNoZWNrcyB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBpcyBjb25maWd1cmVkIHdpdGggaGlkZGVuRmlsdGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlsdGVyQmFyIFRoZSBmaWx0ZXIgYmFyXG5cdCAqIEBwYXJhbSBzZWxlY3Rpb25WYXJpYW50IFNlbGVjdGlvblZhcmlhbnQgdG8gY29udmVydCB0byBjb25kaXRpb25zXG5cdCAqIEBwYXJhbSBpbnB1dENvbmRpdGlvbnMgRXhpc3RpbmcgY29uZGl0aW9ucyBvYmplY3QgdG8gdXBkYXRlIHdpdGggY29uZGl0aW9ucyBmcm9tIFNWXG5cdCAqIEBwYXJhbSBpc0ZMUFZhbHVlcyBGTFAgdmFsdWVzIGV4aXN0IGFuZCBuZWVkIHRvIGJlIHNldCB0byBmaWx0ZXJlZD1mYWxzZS5cblx0ICogQHJldHVybnMgQ3VtbXVsYXRpdmUgY29uZGl0aW9ucyBhZnRlciBjb252ZXJ0ZWQgc2VsZWN0aW9uIHZhcmlhbnQgaXMgYWRkZWQuXG5cdCAqL1xuXHRhZGRTZWxlY3Rpb25WYXJpYW50VG9Db25kaXRpb25zOiBhc3luYyAoXG5cdFx0ZmlsdGVyQmFyOiBGaWx0ZXJCYXIsXG5cdFx0c2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0XHRpbnB1dENvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIENvbmRpdGlvbk9iamVjdFtdPixcblx0XHRpc0ZMUFZhbHVlcz86IGJvb2xlYW5cblx0KSA9PiB7XG5cdFx0YXdhaXQgZmlsdGVyQmFyLndhaXRGb3JJbml0aWFsaXphdGlvbigpO1xuXG5cdFx0Y29uc3QgZmlsdGVyQmFyUHJvcGVydHlJbmZvcyA9IGF3YWl0IFNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5nZXRGaWx0ZXJCYXJTdXBwb3J0ZWRGaWVsZHMoZmlsdGVyQmFyKTtcblx0XHRjb25zdCBmaWx0ZXJCYXJJbmZvRm9yQ29udmVyc2lvbiA9IFNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5nZXRGaWx0ZXJCYXJJbmZvRm9yQ29udmVyc2lvbihmaWx0ZXJCYXIpO1xuXHRcdGNvbnN0IGNvbmRpdGlvbnNGcm9tU1Y6IFJlY29yZDxzdHJpbmcsIENvbmRpdGlvbk9iamVjdFtdIHwgdW5kZWZpbmVkPiA9IFNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5nZXRDb25kaXRpb25zRnJvbVNWKFxuXHRcdFx0c2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdGZpbHRlckJhckluZm9Gb3JDb252ZXJzaW9uLFxuXHRcdFx0ZmlsdGVyQmFyUHJvcGVydHlJbmZvc1xuXHRcdCk7XG5cblx0XHQvLyBOb3RlOiB0aGlzIGlzIHRlbXBsYXRlIHNwZWNpZmljIGNvZGUsIG5lZWRzIHRvIGJlIG1vdmVkLlxuXHRcdGZpbHRlckJhclByb3BlcnR5SW5mb3MuZm9yRWFjaCgocHJvcGVydHlJbmZvKSA9PiB7XG5cdFx0XHRjb25zdCBjb25kaXRpb25QYXRoID0gcHJvcGVydHlJbmZvLmNvbmRpdGlvblBhdGg7XG5cdFx0XHRjb25zdCBjb25kaXRpb25PYmplY3RzID0gY29uZGl0aW9uc0Zyb21TVltjb25kaXRpb25QYXRoXSB8fCBbXTtcblxuXHRcdFx0aWYgKGNvbmRpdGlvbk9iamVjdHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRpZiAoaXNGTFBWYWx1ZXMpIHtcblx0XHRcdFx0XHQvLyBJZiBGTFAgdmFsdWVzIGFyZSBwcmVzZW50IHJlcGxhY2UgaXQgd2l0aCBGTFAgdmFsdWVzXG5cdFx0XHRcdFx0Y29uZGl0aW9uT2JqZWN0cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG5cdFx0XHRcdFx0XHRlbGVtZW50W1wiZmlsdGVyZWRcIl0gPSB0cnVlO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGlmIChpbnB1dENvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoY29uZGl0aW9uUGF0aCkpIHtcblx0XHRcdFx0XHRcdGlucHV0Q29uZGl0aW9uc1tjb25kaXRpb25QYXRoXS5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGVsZW1lbnRbXCJmaWx0ZXJlZFwiXSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRpbnB1dENvbmRpdGlvbnNbY29uZGl0aW9uUGF0aF0gPSBpbnB1dENvbmRpdGlvbnNbY29uZGl0aW9uUGF0aF0uY29uY2F0KGNvbmRpdGlvbk9iamVjdHMpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpbnB1dENvbmRpdGlvbnNbY29uZGl0aW9uUGF0aF0gPSBjb25kaXRpb25PYmplY3RzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRpbnB1dENvbmRpdGlvbnNbY29uZGl0aW9uUGF0aF0gPSBpbnB1dENvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoY29uZGl0aW9uUGF0aClcblx0XHRcdFx0XHRcdD8gaW5wdXRDb25kaXRpb25zW2NvbmRpdGlvblBhdGhdLmNvbmNhdChjb25kaXRpb25PYmplY3RzKVxuXHRcdFx0XHRcdFx0OiBjb25kaXRpb25PYmplY3RzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gaW5wdXRDb25kaXRpb25zO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBWaWV3U3RhdGVPdmVycmlkZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFpRUEsTUFBTUEsT0FBTyxHQUFHQyxVQUFVLENBQUNELE9BQU87SUFDakNFLHFCQUFxQixHQUFHQyxXQUFXLENBQUNDLGlCQUFpQjtJQUNyREMsbUJBQW1CLEdBQUdGLFdBQVcsQ0FBQ0UsbUJBQW1CO0lBQ3JEQyxlQUFlLEdBQUdILFdBQVcsQ0FBQ0csZUFBZTtJQUM3Q0MscUNBQXFDLEdBQUcsUUFBUTtFQUVqRCxNQUFNQyxpQkFBc0IsR0FBRztJQUM5QkMsaUJBQWlCLEVBQUUsS0FBSztJQUN4QkMscUJBQXFCLEVBQUUsWUFBWTtNQUNsQyxPQUFPLElBQUk7SUFDWixDQUFDO0lBQ0RDLG9CQUFvQixFQUFFLFVBQXNEQyxTQUFjLEVBQUVDLGNBQXVCLEVBQUU7TUFDcEgsTUFBTUMsS0FBSyxHQUFHLElBQUksQ0FBQ0MsT0FBTyxFQUFFO1FBQzNCQyxXQUFXLEdBQUdGLEtBQUssQ0FBQ0csYUFBYSxFQUEwQjtRQUMzREMsVUFBVSxHQUFHRixXQUFXLENBQUNHLG9CQUFvQixFQUFFO1FBQy9DQyxPQUFPLEdBQUdKLFdBQVcsQ0FBQ0ssWUFBWSxDQUFDLE9BQU8sQ0FBQztNQUM1QyxJQUFJSCxVQUFVLEVBQUU7UUFDZkEsVUFBVSxDQUFDSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUM7UUFDcENWLFNBQVMsQ0FBQ1csSUFBSSxDQUFFTCxVQUFVLENBQVNNLHFCQUFxQixFQUFFLENBQUM7UUFDM0Q7UUFDQSxJQUFJWCxjQUFjLEtBQUtiLE9BQU8sQ0FBQ3lCLE1BQU0sRUFBRTtVQUN0QyxJQUFJLENBQUNDLHNCQUFzQixDQUFDUixVQUFVLENBQUM7UUFDeEM7TUFDRDtNQUNBRSxPQUFPLENBQUNPLE9BQU8sQ0FBQyxVQUFVQyxNQUFXLEVBQUU7UUFDdENoQixTQUFTLENBQUNXLElBQUksQ0FBQ0ssTUFBTSxDQUFDQyxXQUFXLEVBQUUsQ0FBQztNQUNyQyxDQUFDLENBQUM7TUFFRixPQUFPLElBQUksQ0FBQ3BCLGlCQUFpQjtJQUM5QixDQUFDO0lBQ0RxQixtQkFBbUIsRUFBRSxZQUEyQjtNQUMvQyxNQUFNZCxXQUFXLEdBQUcsSUFBSSxDQUFDRCxPQUFPLEVBQUUsQ0FBQ0UsYUFBYSxFQUEwQjtNQUMxRSxNQUFNQyxVQUFVLEdBQUdGLFdBQVcsQ0FBQ0csb0JBQW9CLEVBQUU7TUFDckQsSUFBSUQsVUFBVSxFQUFFO1FBQ2ZBLFVBQVUsQ0FBQ0ksbUJBQW1CLENBQUMsS0FBSyxDQUFDO01BQ3RDLENBQUMsTUFBTSxJQUFJTixXQUFXLENBQUNlLGtCQUFrQixFQUFFLEVBQUU7UUFDNUMsTUFBTUMscUJBQXFCLEdBQUdoQixXQUFXLENBQUNELE9BQU8sRUFBRSxDQUFDa0IsaUJBQWlCLENBQUMsVUFBVSxDQUF5QjtRQUN6R0QscUJBQXFCLENBQUNFLFdBQVcsQ0FBQyxtQkFBbUIsRUFBRSxLQUFLLENBQUM7UUFDN0QsSUFBSWxCLFdBQVcsQ0FBQ21CLFlBQVksRUFBRSxFQUFFO1VBQy9CbkIsV0FBVyxDQUFDb0Isb0JBQW9CLEVBQUUsQ0FBQ0MsaUJBQWlCLENBQUMsSUFBSSxDQUFDO1FBQzNEO01BQ0Q7SUFDRCxDQUFDO0lBQ0RDLDJCQUEyQixFQUFFLFVBQTJCQyxTQUFjLEVBQUU7TUFDdkUsTUFBTXpCLEtBQUssR0FBRyxJQUFJLENBQUMwQixJQUFJLENBQUN6QixPQUFPLEVBQUU7UUFDaENDLFdBQVcsR0FBR0YsS0FBSyxDQUFDRyxhQUFhLEVBQTBCO1FBQzNEd0IsYUFBYSxHQUFHekIsV0FBVyxDQUFDSyxZQUFZLEVBQUU7UUFDMUNxQixrQkFBa0IsR0FBR0MsZUFBZSxDQUFDQyxxQkFBcUIsQ0FBQzlCLEtBQUssRUFBRTJCLGFBQWEsQ0FBQztNQUVqRkksS0FBSyxDQUFDQyxTQUFTLENBQUN2QixJQUFJLENBQUN3QixLQUFLLENBQUNSLFNBQVMsRUFBRUcsa0JBQWtCLENBQUM7SUFDMUQsQ0FBQztJQUNETSxrQkFBa0IsRUFBRSxVQUFzREMsY0FBbUIsRUFBRTtNQUM5RixNQUFNbkMsS0FBSyxHQUFHLElBQUksQ0FBQ0MsT0FBTyxFQUFFO1FBQzNCQyxXQUFXLEdBQUdGLEtBQUssQ0FBQ0csYUFBYSxFQUEwQjtRQUMzRGlDLFNBQVMsR0FBR3BDLEtBQUssQ0FBQ3FDLFdBQVcsRUFBRTtRQUMvQkMsVUFBVSxHQUFHRixTQUFTLENBQUNHLGlCQUFpQixLQUFLbkQscUJBQXFCLENBQUNvRCxPQUFPO01BRTNFLE1BQU1DLFlBQVksR0FBRyxJQUFJLENBQUNDLGVBQWUsQ0FBQzFDLEtBQUssQ0FBQztNQUNoRCxJQUFJeUMsWUFBWSxFQUFFO1FBQ2pCTixjQUFjLENBQUMxQixJQUFJLENBQUNnQyxZQUFZLENBQUM7TUFDbEM7TUFDQSxJQUFJdkMsV0FBVyxDQUFDbUIsWUFBWSxFQUFFLEVBQUU7UUFDL0JjLGNBQWMsQ0FBQzFCLElBQUksQ0FBQ1AsV0FBVyxDQUFDb0Isb0JBQW9CLEVBQUUsQ0FBQztNQUN4RDtNQUNBcEIsV0FBVyxDQUFDSyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUNNLE9BQU8sQ0FBQyxVQUFVQyxNQUFXLEVBQUU7UUFDaEUsTUFBTTZCLFlBQVksR0FBRzdCLE1BQU0sQ0FBQzhCLGNBQWMsRUFBRTtRQUM1QyxJQUFJRCxZQUFZLEVBQUU7VUFDakJSLGNBQWMsQ0FBQzFCLElBQUksQ0FBQ2tDLFlBQVksQ0FBQztRQUNsQztRQUNBLElBQUlMLFVBQVUsRUFBRTtVQUNmSCxjQUFjLENBQUMxQixJQUFJLENBQUNLLE1BQU0sQ0FBQytCLFVBQVUsRUFBRSxDQUFDO1FBQ3pDO1FBQ0FWLGNBQWMsQ0FBQzFCLElBQUksQ0FBQ0ssTUFBTSxDQUFDO01BQzVCLENBQUMsQ0FBQztNQUNGLElBQUlaLFdBQVcsQ0FBQ0ssWUFBWSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1FBQ3RDTCxXQUFXLENBQUNLLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQ00sT0FBTyxDQUFDLFVBQVVpQyxNQUFXLEVBQUU7VUFDaEUsSUFBSVIsVUFBVSxFQUFFO1lBQ2ZILGNBQWMsQ0FBQzFCLElBQUksQ0FBQ3FDLE1BQU0sQ0FBQ0QsVUFBVSxFQUFFLENBQUM7VUFDekM7VUFDQVYsY0FBYyxDQUFDMUIsSUFBSSxDQUFDcUMsTUFBTSxDQUFDO1FBQzVCLENBQUMsQ0FBQztNQUNIO01BQ0EsSUFBSTVDLFdBQVcsQ0FBQzZDLHVCQUF1QixFQUFFLEVBQUU7UUFDMUNaLGNBQWMsQ0FBQzFCLElBQUksQ0FBQ1AsV0FBVyxDQUFDOEMsbUJBQW1CLENBQUN6RCxtQkFBbUIsQ0FBQzBELEtBQUssQ0FBQyxDQUFDO1FBQy9FZCxjQUFjLENBQUMxQixJQUFJLENBQUNQLFdBQVcsQ0FBQzhDLG1CQUFtQixDQUFDekQsbUJBQW1CLENBQUMyRCxLQUFLLENBQUMsQ0FBQztNQUNoRjtNQUNBLE1BQU05QyxVQUFVLEdBQUdGLFdBQVcsQ0FBQ0csb0JBQW9CLEVBQUU7TUFDckQsSUFBSUQsVUFBVSxFQUFFO1FBQ2YrQixjQUFjLENBQUMxQixJQUFJLENBQUNMLFVBQVUsQ0FBQztNQUNoQztNQUNBK0IsY0FBYyxDQUFDMUIsSUFBSSxDQUFDVCxLQUFLLENBQUNtRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0RDLHdCQUF3QixFQUFFLFVBQXNEQyxpQkFBc0IsRUFBRTtNQUN2RyxNQUFNckQsS0FBSyxHQUFHLElBQUksQ0FBQ0MsT0FBTyxFQUFFO1FBQzNCQyxXQUFXLEdBQUdGLEtBQUssQ0FBQ0csYUFBYSxFQUEwQjtRQUMzRG1ELGNBQWMsR0FBSXRELEtBQUssQ0FBQ21CLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUEwQm9DLFdBQVcsQ0FBQyxtQkFBbUIsQ0FBQztNQUVoSEYsaUJBQWlCLENBQUNHLFVBQVUsR0FBRyxDQUFDRixjQUFjLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQzNELGlCQUFpQjtNQUMxRSxJQUFJTyxXQUFXLENBQUM2Qyx1QkFBdUIsRUFBRSxFQUFFO1FBQzFDLE1BQU1VLGVBQWUsR0FBR3pELEtBQUssQ0FBQ21CLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDb0MsV0FBVyxDQUFDLGdCQUFnQixDQUFDO1FBQ3pGRixpQkFBaUIsQ0FBQ0ssY0FBYyxHQUFHRCxlQUFlO01BQ25EO01BRUEsT0FBTyxJQUFJLENBQUM5RCxpQkFBaUI7SUFDOUIsQ0FBQztJQUNEZ0UscUJBQXFCLEVBQUUsVUFBc0RDLGlCQUFzQixFQUFFO01BQ3BHLE1BQU01RCxLQUFLLEdBQUcsSUFBSSxDQUFDQyxPQUFPLEVBQUU7UUFDM0JDLFdBQVcsR0FBR0YsS0FBSyxDQUFDRyxhQUFhLEVBQTBCO1FBQzNEQyxVQUFVLEdBQUdGLFdBQVcsQ0FBQ0csb0JBQW9CLEVBQUU7TUFFaEQsSUFBSXVELGlCQUFpQixFQUFFO1FBQ3RCO1FBQ0EsSUFBSUEsaUJBQWlCLENBQUNKLFVBQVUsS0FBSyxLQUFLLElBQUlwRCxVQUFVLEVBQUU7VUFDekQ7VUFDQ0EsVUFBVSxDQUFTVCxpQkFBaUIsR0FBRyxLQUFLO1FBQzlDLENBQUMsTUFBTSxJQUFJaUUsaUJBQWlCLENBQUNKLFVBQVUsS0FBSyxJQUFJLEVBQUU7VUFDakQsSUFBSXBELFVBQVUsRUFBRTtZQUNmLE1BQU15RCxZQUFZLEdBQUd6RCxVQUFVLENBQUMwRCxTQUFTLEVBQWtCO1lBQzNERCxZQUFZLENBQUNFLGFBQWEsRUFBRTtVQUM3QjtVQUNBLElBQUksQ0FBQ3BFLGlCQUFpQixHQUFHLElBQUk7UUFDOUI7UUFDQSxJQUFJTyxXQUFXLENBQUM2Qyx1QkFBdUIsRUFBRSxFQUFFO1VBQzFDLE1BQU03QixxQkFBcUIsR0FBR2xCLEtBQUssQ0FBQ21CLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7VUFDekYsSUFBSSxDQUFDNkMsTUFBTSxDQUFDQyxPQUFPLElBQUlMLGlCQUFpQixDQUFDRixjQUFjLElBQUluRSxtQkFBbUIsQ0FBQzJFLE1BQU0sRUFBRTtZQUN0Rk4saUJBQWlCLENBQUNGLGNBQWMsR0FBR25FLG1CQUFtQixDQUFDMEQsS0FBSztVQUM3RDtVQUNBL0IscUJBQXFCLENBQ25CaUQsUUFBUSxFQUFFLENBQ1YvQyxXQUFXLENBQUUsR0FBRUYscUJBQXFCLENBQUNrRCxPQUFPLEVBQUcsaUJBQWdCLEVBQUVSLGlCQUFpQixDQUFDRixjQUFjLENBQUM7UUFDckc7TUFDRDtJQUNELENBQUM7SUFDRFcscUNBQXFDLEVBQUUsVUFBc0RDLG9CQUF5QixFQUFFQyxRQUFhLEVBQUU7TUFDdEksTUFBTXZFLEtBQUssR0FBRyxJQUFJLENBQUNDLE9BQU8sRUFBRTtNQUM1QixNQUFNQyxXQUFXLEdBQUdGLEtBQUssQ0FBQ0csYUFBYSxFQUEwQjtNQUNqRSxNQUFNcUUsYUFBYSxHQUFHdEUsV0FBVyxDQUFDdUUsZUFBZSxFQUFFO01BQ25ELE1BQU1DLGNBQWMsR0FBR0YsYUFBYSxDQUFDRyxnQkFBZ0IsRUFBRTtNQUN2RCxNQUFNQyxrQkFBa0IsR0FBSUYsY0FBYyxJQUFJQSxjQUFjLENBQUNHLGlCQUFpQixJQUFLLENBQUMsQ0FBQztNQUNyRixNQUFNQyxlQUFlLEdBQUcsSUFBSSxDQUFDQyxpQ0FBaUMsQ0FBQ0gsa0JBQWtCLENBQUM7TUFDbEYsSUFBSUkscUJBQThCO01BQ2xDVCxRQUFRLENBQUM5RCxJQUFJLENBQ1pxRSxlQUFlLENBQ2JHLElBQUksQ0FBRUMsU0FBZ0IsSUFBSztRQUMzQixJQUFJQSxTQUFTLElBQUlBLFNBQVMsQ0FBQ0MsTUFBTSxHQUFHLENBQUMsRUFBRTtVQUN0QyxJQUFJRCxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxJQUFJQSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ25ERixxQkFBcUIsR0FBRyxJQUFJO1VBQzdCO1FBQ0Q7UUFDQSxPQUFPLElBQUksQ0FBQ0ksc0JBQXNCLENBQUNwRixLQUFLLEVBQUVzRSxvQkFBb0IsRUFBRVUscUJBQXFCLENBQUM7TUFDdkYsQ0FBQyxDQUFDLENBQ0RDLElBQUksQ0FBQyxNQUFNO1FBQ1gsTUFBTUksWUFBWSxHQUFHbkYsV0FBVyxDQUFDb0YsNEJBQTRCLEVBQUU7UUFDL0QsSUFBSUMscUJBQXFCLEdBQUcsS0FBSztRQUNqQyxNQUFNOUMsWUFBWSxHQUFHLElBQUksQ0FBQ0MsZUFBZSxDQUFDMUMsS0FBSyxDQUFDO1FBQ2hELE1BQU13RixpQkFBaUIsR0FBR3RGLFdBQVcsQ0FBQ0csb0JBQW9CLEVBQUU7UUFDNUQsSUFBSW1GLGlCQUFpQixFQUFFO1VBQ3RCLElBQ0VsQixvQkFBb0IsQ0FBQ3ZFLGNBQWMsS0FBS2IsT0FBTyxDQUFDdUcsT0FBTyxJQUFJbkIsb0JBQW9CLENBQUNvQix1QkFBdUIsSUFDdkcsQ0FBQ2pELFlBQVksSUFBSXpDLEtBQUssQ0FBQ3FDLFdBQVcsRUFBRSxDQUFDc0QsV0FBVyxLQUFLbkcsZUFBZSxDQUFDb0csT0FBUSxJQUM5RTFGLFdBQVcsQ0FBQzJGLHdCQUF3QixDQUFDcEQsWUFBWSxDQUFDLEVBQ2pEO1lBQ0QsTUFBTW9CLFlBQVksR0FBRzJCLGlCQUFpQixDQUFDMUIsU0FBUyxFQUFrQjtZQUNsRUQsWUFBWSxDQUFDRSxhQUFhLEVBQUU7VUFDN0IsQ0FBQyxNQUFNO1lBQ053QixxQkFBcUIsR0FBRyxJQUFJLENBQUNPLHFCQUFxQixDQUFDckQsWUFBWSxDQUFDO1VBQ2pFO1VBQ0E7VUFDQStDLGlCQUFpQixDQUFDaEYsbUJBQW1CLENBQUMsS0FBSyxDQUFDO1VBQzVDLElBQUksQ0FBQ2IsaUJBQWlCLEdBQUcsQ0FBQzRGLHFCQUFxQjtVQUMvQ0YsWUFBWSxDQUFDVSxpQkFBaUIsQ0FBQy9CLE1BQU0sQ0FBQ0MsT0FBTyxJQUFJc0IscUJBQXFCLENBQUM7UUFDeEU7TUFDRCxDQUFDLENBQUMsQ0FDRFMsS0FBSyxDQUFDLFlBQVk7UUFDbEJDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLDhCQUE4QixDQUFDO01BQzFDLENBQUMsQ0FBQyxDQUNIO0lBQ0YsQ0FBQztJQUVEbkIsaUNBQWlDLEVBQUUsVUFBc0RvQixVQUFlLEVBQUU7TUFDekcsTUFBTUMsY0FBYyxHQUFHRCxVQUFVLENBQUMsc0JBQXNCLENBQUM7UUFDeERFLG1CQUFtQixHQUFHRixVQUFVLENBQUMsZ0NBQWdDLENBQUM7UUFDbEVHLGVBQWUsR0FBR0gsVUFBVSxDQUFDLDRCQUE0QixDQUFDO1FBQzFESSxlQUFlLEdBQUdKLFVBQVUsQ0FBQyw0QkFBNEIsQ0FBQztNQUMzRCxJQUFJSyxXQUFXO01BQ2YsSUFBSUosY0FBYyxJQUFJQyxtQkFBbUIsSUFBSUMsZUFBZSxJQUFJQyxlQUFlLEVBQUU7UUFDaEZDLFdBQVcsR0FBRztVQUNiQyxjQUFjLEVBQUVMLGNBQWMsSUFBSUEsY0FBYyxDQUFDLENBQUMsQ0FBQztVQUNuRE0sbUJBQW1CLEVBQUVMLG1CQUFtQixJQUFJQSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7VUFDbEVNLGVBQWUsRUFBRUwsZUFBZSxJQUFJQSxlQUFlLENBQUMsQ0FBQyxDQUFDO1VBQ3RETSxlQUFlLEVBQUVMLGVBQWUsSUFBSUEsZUFBZSxDQUFDLENBQUM7UUFDdEQsQ0FBQztNQUNGO01BQ0EsT0FBTyxJQUFJLENBQUNNLHVCQUF1QixDQUFDTCxXQUFXLENBQUM7SUFDakQsQ0FBQztJQUVESyx1QkFBdUIsRUFBRSxVQUFzREwsV0FBdUIsRUFBRTtNQUN2RyxJQUFJTSxHQUFzQjtNQUMxQixNQUFNOUcsS0FBSyxHQUFHLElBQUksQ0FBQ0MsT0FBTyxFQUFFO1FBQzNCSCxTQUE4QixHQUFHLEVBQUU7TUFDcEMsTUFBTWlILGtCQUFrQixHQUFHL0csS0FBSyxDQUFDcUMsV0FBVyxFQUFFLENBQUNFLGlCQUFpQjtNQUNoRSxJQUFJaUUsV0FBVyxJQUFJQSxXQUFXLENBQUNDLGNBQWMsSUFBSU0sa0JBQWtCLEtBQUssTUFBTSxFQUFFO1FBQy9FRCxHQUFHLEdBQUc5RyxLQUFLLENBQUNtRCxJQUFJLENBQUMsMkJBQTJCLENBQUM7UUFDN0MsSUFBSSxDQUFDNkQsb0JBQW9CLENBQUNSLFdBQVcsRUFBRU0sR0FBRyxFQUFFaEgsU0FBUyxDQUFDO01BQ3ZELENBQUMsTUFBTSxJQUFJMEcsV0FBVyxJQUFJTyxrQkFBa0IsS0FBSyxTQUFTLEVBQUU7UUFDM0QsSUFBSVAsV0FBVyxDQUFDRSxtQkFBbUIsRUFBRTtVQUNwQ0ksR0FBRyxHQUFHOUcsS0FBSyxDQUFDRyxhQUFhLEVBQUUsQ0FBQzhHLDJCQUEyQixFQUFFO1VBQ3pELElBQUksQ0FBQ0MsZ0NBQWdDLENBQUNWLFdBQVcsRUFBRU0sR0FBRyxFQUFFaEgsU0FBUyxDQUFDO1FBQ25FO1FBQ0EsSUFBSTBHLFdBQVcsQ0FBQ0csZUFBZSxFQUFFO1VBQ2hDLE1BQU16RyxXQUFXLEdBQUdGLEtBQUssQ0FBQ0csYUFBYSxFQUEwQjtVQUNqRSxJQUFJLENBQUNnSCw0QkFBNEIsQ0FBQ1gsV0FBVyxFQUFFdEcsV0FBVyxFQUFFSixTQUFTLENBQUM7UUFDdkU7UUFFQSxJQUFJMEcsV0FBVyxDQUFDSSxlQUFlLEVBQUU7VUFDaEMsTUFBTTFHLFdBQVcsR0FBR0YsS0FBSyxDQUFDRyxhQUFhLEVBQTBCO1VBQ2pFLElBQUksQ0FBQ2lILDRCQUE0QixDQUFDWixXQUFXLEVBQUV0RyxXQUFXLEVBQUVKLFNBQVMsQ0FBQztRQUN2RTtNQUNEO01BQ0EsT0FBT3VILE9BQU8sQ0FBQ0MsR0FBRyxDQUFDeEgsU0FBUyxDQUFDO0lBQzlCLENBQUM7SUFDRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NrSCxvQkFBb0IsRUFBRSxVQUVyQlIsV0FBdUIsRUFDdkJNLEdBQXNCLEVBQ3RCaEgsU0FBOEIsRUFDN0I7TUFDRGdILEdBQUcsQ0FBQ1MsV0FBVyxFQUFFLENBQUMxRyxPQUFPLENBQUUyRyxRQUF1QixJQUFLO1FBQ3RELElBQUksQ0FBQ0MsNEJBQTRCLENBQUNELFFBQVEsRUFBRWhCLFdBQVcsQ0FBQ0MsY0FBYyxFQUFFSyxHQUFHLEVBQUVoSCxTQUFTLEVBQUUsSUFBSSxDQUFDO01BQzlGLENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztJQUVDb0gsZ0NBQWdDLEVBQUUsVUFFakNWLFdBQXVCLEVBQ3ZCTSxHQUFzQixFQUN0QmhILFNBQThCLEVBQzdCO01BQ0QsSUFBSWdILEdBQUcsRUFBRTtRQUNSQSxHQUFHLENBQUNTLFdBQVcsRUFBRSxDQUFDMUcsT0FBTyxDQUFFMkcsUUFBdUIsSUFBSztVQUN0RCxJQUFJLENBQUNDLDRCQUE0QixDQUFDRCxRQUFRLEVBQUVoQixXQUFXLENBQUNFLG1CQUFtQixFQUFFSSxHQUFHLEVBQUVoSCxTQUFTLEVBQUUsSUFBSSxDQUFDO1FBQ25HLENBQUMsQ0FBQztNQUNIO0lBQ0QsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ3FILDRCQUE0QixFQUFFLFVBRTdCWCxXQUF1QixFQUN2QnRHLFdBQWlDLEVBQ2pDSixTQUE4QixFQUM3QjtNQUNELE1BQU1RLE9BQU8sR0FBR0osV0FBVyxDQUFDSyxZQUFZLENBQUMsT0FBTyxDQUFDO01BQ2pERCxPQUFPLENBQUNPLE9BQU8sQ0FBRUMsTUFBYSxJQUFLO1FBQ2xDLE1BQU00RyxhQUFhLEdBQUc1RyxNQUFNLENBQUMrQixVQUFVLEVBQUU7UUFDekMsSUFBSS9CLE1BQU0sSUFBSTRHLGFBQWEsRUFBRTtVQUM1QkEsYUFBYSxDQUFDSCxXQUFXLEVBQUUsQ0FBQzFHLE9BQU8sQ0FBRTJHLFFBQXVCLElBQUs7WUFDaEUsSUFBSSxDQUFDQyw0QkFBNEIsQ0FBQ0QsUUFBUSxFQUFFaEIsV0FBVyxDQUFDRyxlQUFlLEVBQUVlLGFBQWEsRUFBRTVILFNBQVMsQ0FBQztVQUNuRyxDQUFDLENBQUM7UUFDSDtNQUNELENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NzSCw0QkFBNEIsRUFBRSxVQUU3QlosV0FBdUIsRUFDdkJ0RyxXQUFpQyxFQUNqQ0osU0FBOEIsRUFDN0I7TUFDRCxNQUFNNkgsT0FBTyxHQUFHekgsV0FBVyxDQUFDSyxZQUFZLENBQUMsT0FBTyxDQUFDO01BQ2pEb0gsT0FBTyxDQUFDOUcsT0FBTyxDQUFFaUMsTUFBYSxJQUFLO1FBQ2xDLE1BQU04RSxhQUFhLEdBQUc5RSxNQUFNLENBQUNELFVBQVUsRUFBRTtRQUN6QyxNQUFNcUMsU0FBUyxHQUFHMEMsYUFBYSxDQUFDTCxXQUFXLEVBQUU7UUFDN0MsSUFBSXJDLFNBQVMsRUFBRTtVQUNkQSxTQUFTLENBQUNyRSxPQUFPLENBQUUyRyxRQUF1QixJQUFLO1lBQzlDLElBQUksQ0FBQ0MsNEJBQTRCLENBQUNELFFBQVEsRUFBRWhCLFdBQVcsQ0FBQ0ksZUFBZSxFQUFFZ0IsYUFBYSxFQUFFOUgsU0FBUyxDQUFDO1VBQ25HLENBQUMsQ0FBQztRQUNIO01BQ0QsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0MySCw0QkFBNEIsRUFBRSxVQUc3QkQsUUFBdUIsRUFDdkJLLFVBQWtCLEVBQ2xCZixHQUFzQixFQUN0QmhILFNBQThCLEVBQzlCa0YscUJBQStCLEVBQzlCO01BQ0QsSUFBSXdDLFFBQVEsQ0FBQ00sR0FBRyxLQUFLRCxVQUFVLEVBQUU7UUFDaEMvSCxTQUFTLENBQUNXLElBQUksQ0FBQyxJQUFJLENBQUNzSCxvQkFBb0IsQ0FBQ2pCLEdBQUcsRUFBRWUsVUFBVSxFQUFFN0MscUJBQXFCLENBQUMsQ0FBQztNQUNsRjtJQUNELENBQUM7SUFFRCtDLG9CQUFvQixFQUFFLFVBQVVQLFFBQWEsRUFBRVEsVUFBZSxFQUFFaEQscUJBQTBCLEVBQUU7TUFDM0YsTUFBTWlELGlCQUFpQixHQUFHLElBQUksQ0FBQ0MsNEJBQTRCLENBQUNWLFFBQVEsRUFBRVEsVUFBVSxDQUFDLEdBQUdBLFVBQVUsR0FBR1IsUUFBUSxDQUFDVyxxQkFBcUIsRUFBRTtNQUNqSSxNQUFNckIsR0FBRyxHQUFHc0Isc0JBQXNCLENBQUNDLGVBQWUsQ0FBQztRQUNsREMsT0FBTyxFQUFFZCxRQUFRO1FBQ2pCZSxnQkFBZ0IsRUFBRU47TUFDbkIsQ0FBQyxDQUFDO01BQ0YsT0FBT25CLEdBQUcsQ0FBQzdCLElBQUksQ0FBQyxZQUFZO1FBQzNCLE9BQU9ELHFCQUFxQjtNQUM3QixDQUFDLENBQUM7SUFDSCxDQUFDO0lBQ0Q7O0lBRUF0QyxlQUFlLEVBQUUsVUFBVTFDLEtBQVUsRUFBRTtNQUN0QyxNQUFNb0MsU0FBUyxHQUFHcEMsS0FBSyxDQUFDcUMsV0FBVyxFQUFFO01BQ3JDLFFBQVFELFNBQVMsQ0FBQ0csaUJBQWlCO1FBQ2xDLEtBQUtuRCxxQkFBcUIsQ0FBQ29KLElBQUk7VUFDOUIsT0FBT3hJLEtBQUssQ0FBQ21ELElBQUksQ0FBQywyQkFBMkIsQ0FBQztRQUMvQyxLQUFLL0QscUJBQXFCLENBQUNvRCxPQUFPO1VBQ2pDLE9BQU94QyxLQUFLLENBQUNHLGFBQWEsRUFBRSxDQUFDOEcsMkJBQTJCLEVBQUU7UUFDM0QsS0FBSzdILHFCQUFxQixDQUFDcUosSUFBSTtVQUM5QixPQUFPLElBQUk7UUFDWjtVQUNDLE1BQU0sSUFBSUMsS0FBSyxDQUFFLDhCQUE2QnRHLFNBQVMsQ0FBQ0csaUJBQWtCLEVBQUMsQ0FBQztNQUFDO0lBRWhGLENBQUM7SUFFRHVELHFCQUFxQixFQUFFLFVBQVU2QyxrQkFBdUIsRUFBRTtNQUN6RCxJQUFJLENBQUNBLGtCQUFrQixFQUFFO1FBQ3hCLE9BQU8sSUFBSTtNQUNaO01BQ0EsTUFBTXpELFNBQVMsR0FBR3lELGtCQUFrQixDQUFDcEIsV0FBVyxFQUFFO01BQ2xELE1BQU1xQixlQUFlLEdBQUcxRCxTQUFTLENBQUMyRCxJQUFJLENBQUMsVUFBVUMsS0FBVSxFQUFFO1FBQzVELE9BQU9BLEtBQUssQ0FBQ2hCLEdBQUcsS0FBS2Esa0JBQWtCLENBQUNJLG9CQUFvQixFQUFFO01BQy9ELENBQUMsQ0FBQztNQUNGLE9BQU8sQ0FBQ0gsZUFBZSxDQUFDSSxlQUFlO0lBQ3hDLENBQUM7SUFFRDVELHNCQUFzQixFQUFFLGdCQUFnQnBGLEtBQVcsRUFBRXNFLG9CQUF5QyxFQUFFVSxxQkFBOEIsRUFBRTtNQUFBO01BQy9ILE1BQU01RSxVQUFVLEdBQUlKLEtBQUssQ0FBQ0csYUFBYSxFQUFFLENBQTBCRSxvQkFBb0IsRUFBRTtRQUN4RjRJLGlCQUFpQixHQUFHM0Usb0JBQW9CLENBQUM0RSxnQkFBb0M7UUFDN0VDLHlCQUF5QixHQUFHN0Usb0JBQW9CLENBQUM4RSx3QkFBNEM7TUFDOUYsSUFBSSxDQUFDaEosVUFBVSxJQUFJLENBQUM2SSxpQkFBaUIsRUFBRTtRQUN0QyxPQUFPNUIsT0FBTyxDQUFDZ0MsT0FBTyxFQUFFO01BQ3pCO01BQ0EsSUFBSUMsV0FBVyxHQUFHLENBQUMsQ0FBQztNQUNwQixNQUFNQyxVQUFVLHNCQUFHdkosS0FBSyxDQUFDbUUsUUFBUSxFQUFFLG9EQUFoQixnQkFBa0JxRixZQUFZLEVBQW9CO01BQ3JFLE1BQU1wSCxTQUFTLEdBQUdwQyxLQUFLLENBQUNxQyxXQUFXLEVBQWdCO01BQ25ELE1BQU1vSCxZQUFZLEdBQUdySCxTQUFTLENBQUNzSCxXQUFXLElBQUssSUFBR3RILFNBQVMsQ0FBQ3VILFNBQVUsRUFBQztNQUN2RSxNQUFNQyxzQkFBc0IsR0FBR0MsV0FBVyxDQUFDQyx3QkFBd0IsQ0FBQ1AsVUFBVSxFQUFFRSxZQUFZLENBQUM7TUFDN0YsTUFBTU0scUJBQXFCLEdBQUczSixVQUFVLENBQUM0SixJQUFJLENBQUMsc0JBQXNCLENBQUM7TUFDckUsSUFBSXhDLFFBQVE7TUFDWixRQUFRcEYsU0FBUyxDQUFDRyxpQkFBaUI7UUFDbEMsS0FBS25ELHFCQUFxQixDQUFDb0osSUFBSTtVQUM5QmhCLFFBQVEsR0FBR3hILEtBQUssQ0FBQ21ELElBQUksQ0FBQywyQkFBMkIsQ0FBQztVQUNsRDtRQUNELEtBQUsvRCxxQkFBcUIsQ0FBQ29ELE9BQU87VUFDakNnRixRQUFRLEdBQUl4SCxLQUFLLENBQUNHLGFBQWEsRUFBRSxDQUEwQjhHLDJCQUEyQixFQUFFO1VBQ3hGO1FBQ0QsS0FBSzdILHFCQUFxQixDQUFDcUosSUFBSTtRQUMvQjtVQUNDO01BQU07TUFFUixNQUFNd0Isd0JBQXdCLEdBQUczRixvQkFBb0IsQ0FBQ29CLHVCQUF1QjtNQUM3RTtNQUNBLE1BQU13RSxrQkFBMkIsR0FDaENmLHlCQUF5QixJQUN6QkEseUJBQXlCLENBQUNnQiw2QkFBNkIsRUFBRSxDQUFDaEYsTUFBTSxHQUFHLENBQUMsSUFDcEVxQyxRQUFRLENBQUM0QyxvQkFBb0IsRUFBRSxLQUFLNUMsUUFBUSxDQUFDVyxxQkFBcUIsRUFBRSxJQUNwRTdELG9CQUFvQixDQUFDK0YseUJBQXlCLEtBQUssSUFBSTs7TUFFeEQ7TUFDQSxJQUFJckYscUJBQXFCLElBQUlrRixrQkFBa0IsRUFBRTtRQUNoRFosV0FBVyxHQUFHbEosVUFBVSxDQUFDa0ssYUFBYSxFQUFFO01BQ3pDO01BQ0FULFdBQVcsQ0FBQ1UseUJBQXlCLENBQUNYLHNCQUFzQixFQUFFWCxpQkFBaUIsRUFBRUUseUJBQXlCLENBQUM7TUFDM0csTUFBTSxJQUFJLENBQUNxQiwrQkFBK0IsQ0FBQ3BLLFVBQVUsRUFBRTZJLGlCQUFpQixFQUFFSyxXQUFXLEVBQUVZLGtCQUFrQixDQUFDO01BRTFHLE9BQU8sSUFBSSxDQUFDTyx5QkFBeUIsQ0FDcENySyxVQUFVLEVBQ1ZrSixXQUFXLEVBQ1g5QixRQUFRLEVBQ1J5Qyx3QkFBd0IsRUFDeEJqRixxQkFBcUIsRUFDckJrRixrQkFBa0IsQ0FDbEI7SUFDRixDQUFDO0lBQ0RPLHlCQUF5QixFQUFFLFVBQzFCckssVUFBZSxFQUNma0osV0FBZ0IsRUFDaEI5QixRQUFhLEVBQ2J5Qyx3QkFBNkIsRUFDN0JqRixxQkFBMEIsRUFDMUJrRixrQkFBNEIsRUFDM0I7TUFDRCxJQUFJUSxRQUFRO01BRVosSUFBSWxELFFBQVEsSUFBSSxDQUFDeEMscUJBQXFCLEVBQUU7UUFDdkMsSUFBSTJGLFdBQVcsR0FBR1Ysd0JBQXdCLEdBQUd6QyxRQUFRLENBQUNXLHFCQUFxQixFQUFFLEdBQUdYLFFBQVEsQ0FBQzRDLG9CQUFvQixFQUFFO1FBQy9HLElBQUlPLFdBQVcsS0FBSyxJQUFJLEVBQUU7VUFDekJBLFdBQVcsR0FBR25ELFFBQVEsQ0FBQ29ELEtBQUssRUFBRTtRQUMvQjtRQUNBRixRQUFRLEdBQUd0QyxzQkFBc0IsQ0FBQ0MsZUFBZSxDQUFDO1VBQ2pEQyxPQUFPLEVBQUVkLFFBQVE7VUFDakJlLGdCQUFnQixFQUFFb0M7UUFDbkIsQ0FBQyxDQUFDLENBQUMxRixJQUFJLENBQUMsWUFBWTtVQUNuQixPQUFPZ0Ysd0JBQXdCLElBQUl6QyxRQUFRLENBQUM0QyxvQkFBb0IsRUFBRSxLQUFLNUMsUUFBUSxDQUFDVyxxQkFBcUIsRUFBRTtRQUN4RyxDQUFDLENBQUM7TUFDSCxDQUFDLE1BQU07UUFDTnVDLFFBQVEsR0FBR3JELE9BQU8sQ0FBQ2dDLE9BQU8sQ0FBQyxJQUFJLENBQUM7TUFDakM7TUFDQSxPQUFPcUIsUUFBUSxDQUFDekYsSUFBSSxDQUFFNEYsa0NBQXVDLElBQUs7UUFDakUsSUFBSUEsa0NBQWtDLEVBQUU7VUFDdkMsT0FBTyxJQUFJLENBQUNDLGtCQUFrQixDQUFDMUssVUFBVSxFQUFFa0osV0FBVyxFQUFFWSxrQkFBa0IsQ0FBQztRQUM1RTtNQUNELENBQUMsQ0FBQztJQUNILENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDYSwwQkFBMEIsRUFBRSxnQkFBZ0IzSyxVQUFxQixFQUFFO01BQ2xFLE9BQU8sTUFBTTRLLFNBQVMsQ0FBQ0MscUJBQXFCLENBQUM3SyxVQUFVLENBQUMsQ0FDdEQ2RSxJQUFJLENBQUVpRyxjQUFtQixJQUFLO1FBQzlCLE1BQU1DLFVBQVUsR0FBR0QsY0FBYyxDQUFDRSxNQUFNO1FBQ3hDLEtBQUssTUFBTUMsS0FBSyxJQUFJRixVQUFVLEVBQUU7VUFDL0IsSUFBSUUsS0FBSyxLQUFLLFlBQVksSUFBSUEsS0FBSyxLQUFLLFNBQVMsSUFBSUYsVUFBVSxDQUFDRSxLQUFLLENBQUMsRUFBRTtZQUN2RUYsVUFBVSxDQUFDRSxLQUFLLENBQUMsQ0FBQ3hLLE9BQU8sQ0FBRXlLLFNBQWtDLElBQUs7Y0FDakVBLFNBQVMsQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLO1lBQzlCLENBQUMsQ0FBQztVQUNIO1FBQ0Q7UUFDQSxPQUFPakUsT0FBTyxDQUFDZ0MsT0FBTyxDQUFDOEIsVUFBVSxDQUFDO01BQ25DLENBQUMsQ0FBQyxDQUNEbkYsS0FBSyxDQUFDLFVBQVV1RixNQUFXLEVBQUU7UUFDN0J0RixHQUFHLENBQUNDLEtBQUssQ0FBQywyQ0FBMkMsRUFBRXFGLE1BQU0sQ0FBQztNQUMvRCxDQUFDLENBQUM7SUFDSixDQUFDO0lBRURULGtCQUFrQixFQUFFLGdCQUFnQjFLLFVBQWUsRUFBRWtKLFdBQWdCLEVBQUVZLGtCQUE0QixFQUFFO01BQ3BHLE1BQU1zQixPQUFZLEdBQUcsQ0FBQyxDQUFDO1FBQ3RCQyxNQUFhLEdBQUcsRUFBRTtRQUNsQkMsMEJBQTBCLEdBQUcsVUFBVVAsVUFBZSxFQUFFO1VBQ3ZEO1VBQ0FBLFVBQVUsQ0FBQ1EsU0FBUyxHQUFHQyxrQkFBa0IsQ0FBQ0MsU0FBUztVQUNuRCxJQUFJVixVQUFVLENBQUNXLFFBQVEsS0FBSyxPQUFPLEVBQUU7WUFDcENYLFVBQVUsQ0FBQ1csUUFBUSxHQUFHLElBQUk7WUFDMUJYLFVBQVUsQ0FBQ1ksTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1VBQ3pCLENBQUMsTUFBTSxJQUFJWixVQUFVLENBQUNXLFFBQVEsS0FBSyxVQUFVLEVBQUU7WUFDOUNYLFVBQVUsQ0FBQ1csUUFBUSxHQUFHLElBQUk7WUFDMUJYLFVBQVUsQ0FBQ1ksTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1VBQ3pCO1VBQ0EsT0FBT1osVUFBVSxDQUFDYSxPQUFPO1FBQzFCLENBQUM7TUFDRixNQUFNQyxpQkFBaUIsR0FBRyxVQUFVQyxjQUFtQixFQUFFQyxlQUFvQixFQUFFO1FBQzlFLE1BQU1DLGNBQWMsR0FBR0MsV0FBVyxDQUFDQyxnQkFBZ0IsQ0FBQ0gsZUFBZSxDQUFDO1VBQ25FNUMsVUFBVSxHQUFHMkMsY0FBYyxDQUFDL0gsUUFBUSxFQUFFLENBQUNxRixZQUFZLEVBQUU7VUFDckQrQyxHQUFHLEdBQUcxQyxXQUFXLENBQUMyQywyQkFBMkIsQ0FBQ0osY0FBYyxFQUFFN0MsVUFBVSxDQUFDO1VBQ3pFa0QsbUJBQW1CLEdBQUdGLEdBQUcsQ0FBQ0csdUJBQXVCO1VBQ2pEQyxhQUFhLEdBQUdDLFdBQVcsQ0FBQ0Msd0JBQXdCLENBQUNYLGNBQWMsRUFBRUMsZUFBZSxDQUFDO1VBQ3JGVyxhQUFvQixHQUFHLEVBQUU7UUFDMUJILGFBQWEsQ0FBQzlMLE9BQU8sQ0FBQyxVQUFVa00sa0JBQWtCLEVBQUU7VUFDbkQsTUFBTUMsYUFBYSxHQUFHRCxrQkFBa0IsQ0FBQ0UsYUFBYSxDQUFDQyxPQUFPLENBQUN6TixxQ0FBcUMsRUFBRSxFQUFFLENBQUM7VUFDekcsSUFBSWdOLG1CQUFtQixDQUFDVSxPQUFPLENBQUNILGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQ3RELE1BQU1JLGVBQWUsR0FBR0wsa0JBQWtCLENBQUNNLGNBQWM7WUFDekQsTUFBTUMsZ0JBQWdCLEdBQUcvRCxVQUFVLENBQUNnRSxvQkFBb0IsQ0FBQ0gsZUFBZSxDQUFDO1lBQ3pFTixhQUFhLENBQUNyTSxJQUFJLENBQUM7Y0FDbEIrTSxJQUFJLEVBQUVULGtCQUFrQixDQUFDRSxhQUFhO2NBQ3RDUSxZQUFZLEVBQUVWLGtCQUFrQixDQUFDVyxZQUFZLEtBQUssUUFBUTtjQUMxREMsWUFBWSxFQUFFLENBQUNQLGVBQWUsR0FDM0IsS0FBSyxHQUNMUSxrQkFBa0IsQ0FBQ0QsWUFBWSxDQUFDTCxnQkFBZ0IsQ0FBQ08sU0FBUyxFQUFFLEVBQUU7Z0JBQUVDLE9BQU8sRUFBRVI7Y0FBaUIsQ0FBQztZQUMvRixDQUFDLENBQUM7VUFDSDtRQUNELENBQUMsQ0FBQztRQUNGLE9BQU9SLGFBQWE7TUFDckIsQ0FBQztNQUVELE9BQU8xTSxVQUFVLENBQUNNLHFCQUFxQixFQUFFLENBQUN1RSxJQUFJLENBQUMsWUFBWTtRQUMxRCxNQUFNa0gsZUFBZSxHQUFHNEIsWUFBWSxDQUFDQyxhQUFhLENBQUM1TixVQUFVLEVBQUUsWUFBWSxDQUFDO1FBQzVFO1FBQ0E7UUFDQSxJQUFJLENBQUM4SixrQkFBa0IsRUFBRTtVQUN4QixNQUFNK0QsZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUNsRCwwQkFBMEIsQ0FBQzNLLFVBQVUsQ0FBQztVQUMxRSxNQUFNNEssU0FBUyxDQUFDa0Qsa0JBQWtCLENBQUM5TixVQUFVLEVBQUU7WUFDOUNnTCxNQUFNLEVBQUU2QyxnQkFBZ0I7WUFDeEJFLEtBQUssRUFBRTFDO1VBQ1IsQ0FBQyxDQUFDO1FBQ0g7UUFDQSxNQUFNcUIsYUFBYSxHQUFHYixpQkFBaUIsQ0FBQzdMLFVBQVUsRUFBRStMLGVBQWUsQ0FBQztRQUNwRVcsYUFBYSxDQUNYMUIsTUFBTSxDQUFDLFVBQVVnRCxhQUFrQixFQUFFO1VBQ3JDLE9BQU9BLGFBQWEsQ0FBQ1osSUFBSSxLQUFLLFlBQVksSUFBSVksYUFBYSxDQUFDWixJQUFJLEtBQUssU0FBUztRQUMvRSxDQUFDLENBQUMsQ0FDRDNNLE9BQU8sQ0FBRXVOLGFBQWtCLElBQUs7VUFDaEMsSUFBSUEsYUFBYSxDQUFDWixJQUFJLElBQUlsRSxXQUFXLEVBQUU7WUFDdENrQyxPQUFPLENBQUM0QyxhQUFhLENBQUNaLElBQUksQ0FBQyxHQUFHbEUsV0FBVyxDQUFDOEUsYUFBYSxDQUFDWixJQUFJLENBQUM7WUFDN0QsSUFBSSxDQUFDWSxhQUFhLENBQUNYLFlBQVksRUFBRTtjQUNoQ2hDLE1BQU0sQ0FBQ2hMLElBQUksQ0FBQztnQkFBRTROLElBQUksRUFBRUQsYUFBYSxDQUFDWjtjQUFLLENBQUMsQ0FBQztZQUMxQztZQUNBLElBQUlZLGFBQWEsQ0FBQ1QsWUFBWSxFQUFFO2NBQy9CbkMsT0FBTyxDQUFDNEMsYUFBYSxDQUFDWixJQUFJLENBQUMsQ0FBQzNNLE9BQU8sQ0FBQzZLLDBCQUEwQixDQUFDO1lBQ2hFLENBQUMsTUFBTTtjQUNORixPQUFPLENBQUM0QyxhQUFhLENBQUNaLElBQUksQ0FBQyxDQUFDM00sT0FBTyxDQUFDLFVBQVVzSyxVQUFlLEVBQUU7Z0JBQzlEQSxVQUFVLENBQUNRLFNBQVMsR0FBR1IsVUFBVSxDQUFDbUQsUUFBUSxHQUFHMUMsa0JBQWtCLENBQUMyQyxZQUFZLEdBQUdwRCxVQUFVLENBQUNRLFNBQVM7Y0FDcEcsQ0FBQyxDQUFDO1lBQ0g7VUFDRCxDQUFDLE1BQU07WUFDTkgsT0FBTyxDQUFDNEMsYUFBYSxDQUFDWixJQUFJLENBQUMsR0FBRyxFQUFFO1VBQ2pDO1FBQ0QsQ0FBQyxDQUFDO1FBQ0gsT0FBT3hDLFNBQVMsQ0FBQ2tELGtCQUFrQixDQUFDOU4sVUFBVSxFQUFFO1VBQUVnTCxNQUFNLEVBQUVJLE9BQU87VUFBRTJDLEtBQUssRUFBRTFDO1FBQU8sQ0FBQyxDQUFDO01BQ3BGLENBQUMsQ0FBQztJQUNILENBQUM7SUFDRDdLLHNCQUFzQixFQUFFLGdCQUFnQlIsVUFBcUIsRUFBRTtNQUM5RCxNQUFNcUwsTUFBc0IsR0FBRyxFQUFFO01BQ2pDLE9BQU9yTCxVQUFVLENBQUNNLHFCQUFxQixFQUFFLENBQUN1RSxJQUFJLENBQUMsWUFBWTtRQUMxRCxNQUFNZ0osZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUNsRCwwQkFBMEIsQ0FBQzNLLFVBQVUsQ0FBQztRQUMxRSxPQUFPNEssU0FBUyxDQUFDa0Qsa0JBQWtCLENBQUM5TixVQUFVLEVBQUU7VUFDL0NnTCxNQUFNLEVBQUU2QyxnQkFBZ0I7VUFDeEJFLEtBQUssRUFBRTFDO1FBQ1IsQ0FBQyxDQUFDO01BQ0gsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDakIsK0JBQStCLEVBQUUsT0FDaENnRSxTQUFvQixFQUNwQnRGLGdCQUFrQyxFQUNsQ3VGLGVBQWtELEVBQ2xEQyxXQUFxQixLQUNqQjtNQUNKLE1BQU1GLFNBQVMsQ0FBQzlOLHFCQUFxQixFQUFFO01BRXZDLE1BQU1pTyxzQkFBc0IsR0FBRyxNQUFNQyw4QkFBOEIsQ0FBQ0MsMkJBQTJCLENBQUNMLFNBQVMsQ0FBQztNQUMxRyxNQUFNTSwwQkFBMEIsR0FBR0YsOEJBQThCLENBQUNHLDZCQUE2QixDQUFDUCxTQUFTLENBQUM7TUFDMUcsTUFBTVEsZ0JBQStELEdBQUdKLDhCQUE4QixDQUFDSyxtQkFBbUIsQ0FDekgvRixnQkFBZ0IsRUFDaEI0RiwwQkFBMEIsRUFDMUJILHNCQUFzQixDQUN0Qjs7TUFFRDtNQUNBQSxzQkFBc0IsQ0FBQzlOLE9BQU8sQ0FBRXFPLFlBQVksSUFBSztRQUNoRCxNQUFNakMsYUFBYSxHQUFHaUMsWUFBWSxDQUFDakMsYUFBYTtRQUNoRCxNQUFNa0MsZ0JBQWdCLEdBQUdILGdCQUFnQixDQUFDL0IsYUFBYSxDQUFDLElBQUksRUFBRTtRQUU5RCxJQUFJa0MsZ0JBQWdCLENBQUNoSyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ2hDLElBQUl1SixXQUFXLEVBQUU7WUFDaEI7WUFDQVMsZ0JBQWdCLENBQUN0TyxPQUFPLENBQUV5SCxPQUFPLElBQUs7Y0FDckNBLE9BQU8sQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJO1lBQzNCLENBQUMsQ0FBQztZQUNGLElBQUltRyxlQUFlLENBQUNXLGNBQWMsQ0FBQ25DLGFBQWEsQ0FBQyxFQUFFO2NBQ2xEd0IsZUFBZSxDQUFDeEIsYUFBYSxDQUFDLENBQUNwTSxPQUFPLENBQUV5SCxPQUFPLElBQUs7Z0JBQ25EQSxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsS0FBSztjQUM1QixDQUFDLENBQUM7Y0FDRm1HLGVBQWUsQ0FBQ3hCLGFBQWEsQ0FBQyxHQUFHd0IsZUFBZSxDQUFDeEIsYUFBYSxDQUFDLENBQUNvQyxNQUFNLENBQUNGLGdCQUFnQixDQUFDO1lBQ3pGLENBQUMsTUFBTTtjQUNOVixlQUFlLENBQUN4QixhQUFhLENBQUMsR0FBR2tDLGdCQUFnQjtZQUNsRDtVQUNELENBQUMsTUFBTTtZQUNOVixlQUFlLENBQUN4QixhQUFhLENBQUMsR0FBR3dCLGVBQWUsQ0FBQ1csY0FBYyxDQUFDbkMsYUFBYSxDQUFDLEdBQzNFd0IsZUFBZSxDQUFDeEIsYUFBYSxDQUFDLENBQUNvQyxNQUFNLENBQUNGLGdCQUFnQixDQUFDLEdBQ3ZEQSxnQkFBZ0I7VUFDcEI7UUFDRDtNQUNELENBQUMsQ0FBQztNQUVGLE9BQU9WLGVBQWU7SUFDdkI7RUFDRCxDQUFDO0VBQUMsT0FFYS9PLGlCQUFpQjtBQUFBIn0=
import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import type ViewState from "sap/fe/core/controllerextensions/ViewState";
import type { NavigationParameter } from "sap/fe/core/controllerextensions/ViewState";
import SelectionVariantToStateFilters from "sap/fe/core/controls/filterbar/adapter/SelectionVariantToStateFilters";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import CoreLibrary from "sap/fe/core/library";
import * as PropertyFormatters from "sap/fe/core/templating/PropertyFormatters";
import DelegateUtil, { PropertyInfo } from "sap/fe/macros/DelegateUtil";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import type FilterBarAPI from "sap/fe/macros/filterBar/FilterBarAPI";
import NavLibrary from "sap/fe/navigation/library";
import type { SelectionVariant } from "sap/fe/navigation/SelectionVariant";
import type ListReportController from "sap/fe/templates/ListReport/ListReportController.controller";
import type View from "sap/ui/core/mvc/View";
import { system } from "sap/ui/Device";
import ControlVariantApplyAPI from "sap/ui/fl/apply/api/ControlVariantApplyAPI";
import type VariantManagement from "sap/ui/fl/variants/VariantManagement";
import Chart from "sap/ui/mdc/Chart";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import ConditionValidated from "sap/ui/mdc/enum/ConditionValidated";
import FilterBar from "sap/ui/mdc/FilterBar";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import Table from "sap/ui/mdc/Table";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

type VariantObject = {
	author: String;
	change: boolean;
	contexts: object;
	executeOnSelect: boolean;
	favorite: boolean;
	key: String;
	originalContexts: object;
	originalExecuteOnSelect: boolean;
	originalFavorite: boolean;
	originalTitle: String;
	originalVisible: boolean;
	remove: boolean;
	rename: boolean;
	sharing: String;
	title: String;
	visible: boolean;
};

type NavHandlerNavParams = NavigationParameter & {
	bNavSelVarHasDefaultsOnly?: boolean;
};

type LRViewData = {
	controlConfiguration?: Record<string, Record<string, unknown>>;
	entitySet?: string;
	contextPath?: string;
	variantManagement?: boolean;
};

type VariantIDs = {
	sPageVariantId: String;
	sFilterBarVariantId: String;
	sTableVariantId: String;
	sChartVariantId: String;
};

const NavType = NavLibrary.NavType,
	VariantManagementType = CoreLibrary.VariantManagement,
	TemplateContentView = CoreLibrary.TemplateContentView,
	InitialLoadMode = CoreLibrary.InitialLoadMode,
	CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /\+|\*/g;

const ViewStateOverride: any = {
	_bSearchTriggered: false,
	applyInitialStateOnly: function () {
		return true;
	},
	onBeforeStateApplied: function (this: ViewState & typeof ViewStateOverride, aPromises: any, navigationType?: string) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			oFilterBar = oController._getFilterBarControl(),
			aTables = oController._getControls("table");
		if (oFilterBar) {
			oFilterBar.setSuspendSelection(true);
			aPromises.push((oFilterBar as any).waitForInitialization());
			//This is required to remove any existing or default filter conditions before restoring the filter bar state in hybrid navigation mode.
			if (navigationType === NavType.hybrid) {
				this._clearFilterConditions(oFilterBar);
			}
		}
		aTables.forEach(function (oTable: any) {
			aPromises.push(oTable.initialized());
		});

		delete this._bSearchTriggered;
	},
	onAfterStateApplied: function (this: ViewState) {
		const oController = this.getView().getController() as ListReportController;
		const oFilterBar = oController._getFilterBarControl();
		if (oFilterBar) {
			oFilterBar.setSuspendSelection(false);
		} else if (oController._isFilterBarHidden()) {
			const oInternalModelContext = oController.getView().getBindingContext("internal") as InternalModelContext;
			oInternalModelContext.setProperty("hasPendingFilters", false);
			if (oController._isMultiMode()) {
				oController._getMultiModeControl().setCountsOutDated(true);
			}
		}
	},
	adaptBindingRefreshControls: function (this: ViewState, aControls: any) {
		const oView = this.base.getView(),
			oController = oView.getController() as ListReportController,
			aViewControls = oController._getControls(),
			aControlsToRefresh = KeepAliveHelper.getControlsForRefresh(oView, aViewControls);

		Array.prototype.push.apply(aControls, aControlsToRefresh);
	},
	adaptStateControls: function (this: ViewState & typeof ViewStateOverride, aStateControls: any) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			oViewData = oView.getViewData(),
			bControlVM = oViewData.variantManagement === VariantManagementType.Control;

		const oFilterBarVM = this._getFilterBarVM(oView);
		if (oFilterBarVM) {
			aStateControls.push(oFilterBarVM);
		}
		if (oController._isMultiMode()) {
			aStateControls.push(oController._getMultiModeControl());
		}
		oController._getControls("table").forEach(function (oTable: any) {
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
			oController._getControls("Chart").forEach(function (oChart: any) {
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
	retrieveAdditionalStates: function (this: ViewState & typeof ViewStateOverride, mAdditionalStates: any) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			bPendingFilter = (oView.getBindingContext("internal") as InternalModelContext).getProperty("hasPendingFilters");

		mAdditionalStates.dataLoaded = !bPendingFilter || !!this._bSearchTriggered;
		if (oController._hasMultiVisualizations()) {
			const sAlpContentView = oView.getBindingContext("internal").getProperty("alpContentView");
			mAdditionalStates.alpContentView = sAlpContentView;
		}

		delete this._bSearchTriggered;
	},
	applyAdditionalStates: function (this: ViewState & typeof ViewStateOverride, oAdditionalStates: any) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			oFilterBar = oController._getFilterBarControl();

		if (oAdditionalStates) {
			// explicit check for boolean values - 'undefined' should not alter the triggered search property
			if (oAdditionalStates.dataLoaded === false && oFilterBar) {
				// without this, the data is loaded on navigating back
				(oFilterBar as any)._bSearchTriggered = false;
			} else if (oAdditionalStates.dataLoaded === true) {
				if (oFilterBar) {
					const filterBarAPI = oFilterBar.getParent() as FilterBarAPI;
					filterBarAPI.triggerSearch();
				}
				this._bSearchTriggered = true;
			}
			if (oController._hasMultiVisualizations()) {
				const oInternalModelContext = oView.getBindingContext("internal") as InternalModelContext;
				if (!system.desktop && oAdditionalStates.alpContentView == TemplateContentView.Hybrid) {
					oAdditionalStates.alpContentView = TemplateContentView.Chart;
				}
				oInternalModelContext
					.getModel()
					.setProperty(`${oInternalModelContext.getPath()}/alpContentView`, oAdditionalStates.alpContentView);
			}
		}
	},
	_applyNavigationParametersToFilterbar: function (this: ViewState & typeof ViewStateOverride, oNavigationParameter: any, aResults: any) {
		const oView = this.getView();
		const oController = oView.getController() as ListReportController;
		const oAppComponent = oController.getAppComponent();
		const oComponentData = oAppComponent.getComponentData();
		const oStartupParameters = (oComponentData && oComponentData.startupParameters) || {};
		const oVariantPromise = this.handleVariantIdPassedViaURLParams(oStartupParameters);
		let bFilterVariantApplied: boolean;
		aResults.push(
			oVariantPromise
				.then((aVariants: any[]) => {
					if (aVariants && aVariants.length > 0) {
						if (aVariants[0] === true || aVariants[1] === true) {
							bFilterVariantApplied = true;
						}
					}
					return this._applySelectionVariant(oView, oNavigationParameter, bFilterVariantApplied);
				})
				.then(() => {
					const oDynamicPage = oController._getDynamicListReportControl();
					let bPreventInitialSearch = false;
					const oFilterBarVM = this._getFilterBarVM(oView);
					const oFilterBarControl = oController._getFilterBarControl();
					if (oFilterBarControl) {
						if (
							(oNavigationParameter.navigationType !== NavType.initial && oNavigationParameter.requiresStandardVariant) ||
							(!oFilterBarVM && oView.getViewData().initialLoad === InitialLoadMode.Enabled) ||
							oController._shouldAutoTriggerSearch(oFilterBarVM)
						) {
							const filterBarAPI = oFilterBarControl.getParent() as FilterBarAPI;
							filterBarAPI.triggerSearch();
						} else {
							bPreventInitialSearch = this._preventInitialSearch(oFilterBarVM);
						}
						// reset the suspend selection on filter bar to allow loading of data when needed (was set on LR Init)
						oFilterBarControl.setSuspendSelection(false);
						this._bSearchTriggered = !bPreventInitialSearch;
						oDynamicPage.setHeaderExpanded(system.desktop || bPreventInitialSearch);
					}
				})
				.catch(function () {
					Log.error("Variant ID cannot be applied");
				})
		);
	},

	handleVariantIdPassedViaURLParams: function (this: ViewState & typeof ViewStateOverride, oUrlParams: any) {
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

	_handleControlVariantId: function (this: ViewState & typeof ViewStateOverride, oVariantIDs: VariantIDs) {
		let oVM: VariantManagement;
		const oView = this.getView(),
			aPromises: VariantManagement[] = [];
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
				const oController = oView.getController() as ListReportController;
				this._handleTableControlVariantId(oVariantIDs, oController, aPromises);
			}

			if (oVariantIDs.sChartVariantId) {
				const oController = oView.getController() as ListReportController;
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
	_handlePageVariantId: function (
		this: ViewState & typeof ViewStateOverride,
		oVariantIDs: VariantIDs,
		oVM: VariantManagement,
		aPromises: VariantManagement[]
	) {
		oVM.getVariants().forEach((oVariant: VariantObject) => {
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

	_handleFilterBarVariantControlId: function (
		this: ViewState & typeof ViewStateOverride,
		oVariantIDs: VariantIDs,
		oVM: VariantManagement,
		aPromises: VariantManagement[]
	) {
		if (oVM) {
			oVM.getVariants().forEach((oVariant: VariantObject) => {
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
	_handleTableControlVariantId: function (
		this: ViewState & typeof ViewStateOverride,
		oVariantIDs: VariantIDs,
		oController: ListReportController,
		aPromises: VariantManagement[]
	) {
		const aTables = oController._getControls("table");
		aTables.forEach((oTable: Table) => {
			const oTableVariant = oTable.getVariant();
			if (oTable && oTableVariant) {
				oTableVariant.getVariants().forEach((oVariant: VariantObject) => {
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
	_handleChartControlVariantId: function (
		this: ViewState & typeof ViewStateOverride,
		oVariantIDs: VariantIDs,
		oController: ListReportController,
		aPromises: VariantManagement[]
	) {
		const aCharts = oController._getControls("Chart");
		aCharts.forEach((oChart: Chart) => {
			const oChartVariant = oChart.getVariant();
			const aVariants = oChartVariant.getVariants();
			if (aVariants) {
				aVariants.forEach((oVariant: VariantObject) => {
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
	_findAndPushVariantToPromise: function (
		//This function finds the suitable variant for the variantID provided in the url and pushes them to the promise array
		this: ViewState & typeof ViewStateOverride,
		oVariant: VariantObject,
		sVariantId: String,
		oVM: VariantManagement,
		aPromises: VariantManagement[],
		bFilterVariantApplied?: boolean
	) {
		if (oVariant.key === sVariantId) {
			aPromises.push(this._applyControlVariant(oVM, sVariantId, bFilterVariantApplied));
		}
	},

	_applyControlVariant: function (oVariant: any, sVariantID: any, bFilterVariantApplied: any) {
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

	_getFilterBarVM: function (oView: any) {
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

	_preventInitialSearch: function (oVariantManagement: any) {
		if (!oVariantManagement) {
			return true;
		}
		const aVariants = oVariantManagement.getVariants();
		const oCurrentVariant = aVariants.find(function (oItem: any) {
			return oItem.key === oVariantManagement.getCurrentVariantKey();
		});
		return !oCurrentVariant.executeOnSelect;
	},

	_applySelectionVariant: async function (oView: View, oNavigationParameter: NavHandlerNavParams, bFilterVariantApplied: boolean) {
		const oFilterBar = (oView.getController() as ListReportController)._getFilterBarControl(),
			oSelectionVariant = oNavigationParameter.selectionVariant as SelectionVariant,
			oSelectionVariantDefaults = oNavigationParameter.selectionVariantDefaults as SelectionVariant;
		if (!oFilterBar || !oSelectionVariant) {
			return Promise.resolve();
		}
		let oConditions = {};
		const oMetaModel = oView.getModel()?.getMetaModel() as ODataMetaModel;
		const oViewData = oView.getViewData() as LRViewData;
		const sContextPath = oViewData.contextPath || `/${oViewData.entitySet}`;
		const aMandatoryFilterFields = CommonUtils.getMandatoryFilterFields(oMetaModel, sContextPath);
		const bUseSemanticDateRange = oFilterBar.data("useSemanticDateRange");
		let oVariant;
		switch (oViewData.variantManagement) {
			case VariantManagementType.Page:
				oVariant = oView.byId("fe::PageVariantManagement");
				break;
			case VariantManagementType.Control:
				oVariant = (oView.getController() as ListReportController)._getFilterBarVariantControl();
				break;
			case VariantManagementType.None:
			default:
				break;
		}
		const bRequiresStandardVariant = oNavigationParameter.requiresStandardVariant;
		// check if FLP default values are there and is it standard variant
		const bIsFLPValuePresent: boolean =
			oSelectionVariantDefaults &&
			oSelectionVariantDefaults.getSelectOptionsPropertyNames().length > 0 &&
			oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey() &&
			oNavigationParameter.bNavSelVarHasDefaultsOnly === true;

		// get conditions when FLP value is present
		if (bFilterVariantApplied || bIsFLPValuePresent) {
			oConditions = oFilterBar.getConditions();
		}
		CommonUtils.addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults);
		await this.addSelectionVariantToConditions(oFilterBar, oSelectionVariant, oConditions, bIsFLPValuePresent);

		return this._activateSelectionVariant(
			oFilterBar,
			oConditions,
			oVariant,
			bRequiresStandardVariant,
			bFilterVariantApplied,
			bIsFLPValuePresent
		);
	},
	_activateSelectionVariant: function (
		oFilterBar: any,
		oConditions: any,
		oVariant: any,
		bRequiresStandardVariant: any,
		bFilterVariantApplied: any,
		bIsFLPValuePresent?: boolean
	) {
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
		return oPromise.then((bClearFilterAndReplaceWithAppState: any) => {
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
	_fnClearStateBeforexAppNav: async function (oFilterBar: FilterBar) {
		return await StateUtil.retrieveExternalState(oFilterBar)
			.then((oExternalState: any) => {
				const oCondition = oExternalState.filter;
				for (const field in oCondition) {
					if (field !== "$editState" && field !== "$search" && oCondition[field]) {
						oCondition[field].forEach((condition: Record<string, boolean>) => {
							condition["filtered"] = false;
						});
					}
				}
				return Promise.resolve(oCondition);
			})
			.catch(function (oError: any) {
				Log.error("Error while retrieving the external state", oError);
			});
	},

	_fnApplyConditions: async function (oFilterBar: any, oConditions: any, bIsFLPValuePresent?: boolean) {
		const mFilter: any = {},
			aItems: any[] = [],
			fnAdjustValueHelpCondition = function (oCondition: any) {
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
		const fnGetPropertyInfo = function (oFilterControl: any, sEntityTypePath: any) {
			const sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath),
				oMetaModel = oFilterControl.getModel().getMetaModel(),
				oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
				aNonFilterableProps = oFR.NonFilterableProperties,
				mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath),
				aPropertyInfo: any[] = [];
			mFilterFields.forEach(function (oConvertedProperty) {
				const sPropertyPath = oConvertedProperty.conditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
				if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
					const sAnnotationPath = oConvertedProperty.annotationPath;
					const oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
					aPropertyInfo.push({
						path: oConvertedProperty.conditionPath,
						hiddenFilter: oConvertedProperty.availability === "Hidden",
						hasValueHelp: !sAnnotationPath
							? false
							: PropertyFormatters.hasValueHelp(oPropertyContext.getObject(), { context: oPropertyContext })
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
			aPropertyInfo
				.filter(function (oPropertyInfo: any) {
					return oPropertyInfo.path !== "$editState" && oPropertyInfo.path !== "$search";
				})
				.forEach((oPropertyInfo: any) => {
					if (oPropertyInfo.path in oConditions) {
						mFilter[oPropertyInfo.path] = oConditions[oPropertyInfo.path];
						if (!oPropertyInfo.hiddenFilter) {
							aItems.push({ name: oPropertyInfo.path });
						}
						if (oPropertyInfo.hasValueHelp) {
							mFilter[oPropertyInfo.path].forEach(fnAdjustValueHelpCondition);
						} else {
							mFilter[oPropertyInfo.path].forEach(function (oCondition: any) {
								oCondition.validated = oCondition.filtered ? ConditionValidated.NotValidated : oCondition.validated;
							});
						}
					} else {
						mFilter[oPropertyInfo.path] = [];
					}
				});
			return StateUtil.applyExternalState(oFilterBar, { filter: mFilter, items: aItems });
		});
	},
	_clearFilterConditions: async function (oFilterBar: FilterBar) {
		const aItems: PropertyInfo[] = [];
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
	addSelectionVariantToConditions: async (
		filterBar: FilterBar,
		selectionVariant: SelectionVariant,
		inputConditions: Record<string, ConditionObject[]>,
		isFLPValues?: boolean
	) => {
		await filterBar.waitForInitialization();

		const filterBarPropertyInfos = await SelectionVariantToStateFilters.getFilterBarSupportedFields(filterBar);
		const filterBarInfoForConversion = SelectionVariantToStateFilters.getFilterBarInfoForConversion(filterBar);
		const conditionsFromSV: Record<string, ConditionObject[] | undefined> = SelectionVariantToStateFilters.getConditionsFromSV(
			selectionVariant,
			filterBarInfoForConversion,
			filterBarPropertyInfos
		);

		// Note: this is template specific code, needs to be moved.
		filterBarPropertyInfos.forEach((propertyInfo) => {
			const conditionPath = propertyInfo.conditionPath;
			const conditionObjects = conditionsFromSV[conditionPath] || [];

			if (conditionObjects.length > 0) {
				if (isFLPValues) {
					// If FLP values are present replace it with FLP values
					conditionObjects.forEach((element) => {
						element["filtered"] = true;
					});
					if (inputConditions.hasOwnProperty(conditionPath)) {
						inputConditions[conditionPath].forEach((element) => {
							element["filtered"] = false;
						});
						inputConditions[conditionPath] = inputConditions[conditionPath].concat(conditionObjects);
					} else {
						inputConditions[conditionPath] = conditionObjects;
					}
				} else {
					inputConditions[conditionPath] = inputConditions.hasOwnProperty(conditionPath)
						? inputConditions[conditionPath].concat(conditionObjects)
						: conditionObjects;
				}
			}
		});

		return inputConditions;
	}
};

export default ViewStateOverride;

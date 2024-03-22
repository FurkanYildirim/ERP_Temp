import CommonUtils from "sap/fe/core/CommonUtils";
import { EDM_TYPE_MAPPING } from "sap/fe/core/helpers/BindingToolkit";
import { ODATA_TYPE_MAPPING } from "sap/fe/core/templating/DisplayModeFormatter";
import { getConditions } from "sap/fe/core/templating/FilterHelper";
import type SelectionVariant from "sap/fe/navigation/SelectionVariant";
import type { SelectOption, SemanticDateConfiguration } from "sap/fe/navigation/SelectionVariant";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import type FilterBar from "sap/ui/mdc/FilterBar";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

type ViewData = {
	controlConfiguration?: Record<string, Record<string, unknown>>;
	entitySet?: string;
};

type FilterBarDelegate = {
	fetchProperties: (filterBar: FilterBar) => Promise<FilterFieldPropertyInfo[]>;
};

export type FilterFieldPropertyInfo = {
	name: string;
	conditionPath: string;
	dataType: string;
	annotationPath?: string;
	isParameter?: boolean;
};

export type FilterFieldsConfig = Record<string, { settings?: string } | undefined>;

export type FilterBarConversionInfo = {
	metaModel: ODataMetaModel;
	contextPath: string;
	useSemanticDateRange?: boolean;
	filterFieldsConfig?: FilterFieldsConfig;
};

type PropertyConversionInfo = {
	propertyName: string;
	navPath: string;
	propertyMetadata: FilterFieldPropertyInfo;
	propertyContextPath: string;
	selectionVariant: SelectionVariant;
	filterBarInfo: FilterBarConversionInfo;
};

const IGNORED_PROPERTYNAMES: string[] = ["$search", "$editState"];

const selectionVariantToStateFilters = {
	/**
	 * Get the filter bar info needed for conversion of selection variant to conditions.
	 *
	 * @param filterBar Filter bar
	 * @returns The Filter bar info (metaModel, contextPath, use of semantic date range, all filter fields config)
	 */
	getFilterBarInfoForConversion: (filterBar: FilterBar): FilterBarConversionInfo => {
		return {
			metaModel: selectionVariantToStateFilters._getMetaModel(filterBar),
			contextPath: selectionVariantToStateFilters._getContextPath(filterBar),
			useSemanticDateRange: selectionVariantToStateFilters._checkSemanticDateRangeIsUsed(filterBar),
			filterFieldsConfig: selectionVariantToStateFilters._getFilterFieldsConfig(filterBar)
		};
	},

	/**
	 * Get supported filter field properties from the filter bar.
	 *
	 * @param filterBar Filter bar
	 * @returns Supported filter fields in filter bar.
	 */
	getFilterBarSupportedFields: async (filterBar: FilterBar) => {
		await filterBar.waitForInitialization();
		return (filterBar.getControlDelegate() as FilterBarDelegate).fetchProperties(filterBar);
	},

	/**
	 * Get conditions from the selection variant.
	 *
	 * @param selectionVariant Selection variant
	 * @param filterBarInfoForConversion Filter bar info needed for conversion of selection variant to conditions
	 * @param filterBarPropertyInfos Property infos of the filterbar
	 * @returns Conditions after conversion of selection variant
	 */
	getConditionsFromSV: function (
		selectionVariant: SelectionVariant,
		filterBarInfoForConversion: FilterBarConversionInfo,
		filterBarPropertyInfos: FilterFieldPropertyInfo[]
	) {
		const { contextPath } = filterBarInfoForConversion;
		const conditions: Record<string, ConditionObject[]> = {};

		filterBarPropertyInfos.forEach(function (propertyMetadata: FilterFieldPropertyInfo) {
			if (!IGNORED_PROPERTYNAMES.includes(propertyMetadata.name)) {
				let filterPathConditions: ConditionObject[] = [];
				const { conditionPath, annotationPath } = propertyMetadata;
				const propPath = conditionPath.replaceAll("*", "");
				const navPath = propPath.substring(0, propPath.lastIndexOf("/"));
				const propertyName = propPath.substring(propPath.lastIndexOf("/") + 1);

				// Note: Conversion parameters
				const conversionInfo: PropertyConversionInfo = {
					propertyName,
					navPath,
					propertyContextPath: `${contextPath}${navPath}`,
					propertyMetadata,
					selectionVariant,
					filterBarInfo: filterBarInfoForConversion
				};
				if (propertyMetadata.isParameter && annotationPath) {
					// parameter
					conversionInfo.propertyContextPath = annotationPath.substring(0, annotationPath.lastIndexOf("/") + 1);
					filterPathConditions = selectionVariantToStateFilters._getConditionsForParameter(conversionInfo);
				} else if (conditionPath.includes("/")) {
					// navigation property
					filterPathConditions = selectionVariantToStateFilters._getConditionsForNavProperty(conversionInfo);
				} else {
					// normal property
					filterPathConditions = selectionVariantToStateFilters._getConditionsForProperty(conversionInfo);
				}

				if (filterPathConditions.length > 0) {
					conditions[conditionPath] = filterPathConditions;
				}
			}
		});
		return conditions;
	},

	/**
	 * Get metamodel of filter bar.
	 *
	 * @param filterBar Filter bar
	 * @returns The metamodel context
	 */
	_getMetaModel: function (filterBar: FilterBar) {
		return filterBar.getModel()?.getMetaModel() as ODataMetaModel;
	},

	/**
	 * Get context path from filter bar.
	 *
	 * @param filterBar Filter bar
	 * @returns The context path
	 */
	_getContextPath: function (filterBar: FilterBar) {
		return filterBar.data("entityType") as string;
	},

	/**
	 * Get view data from filter bar.
	 *
	 * @param filterBar Filter bar
	 * @returns The view data
	 */
	_getViewData: function (filterBar: FilterBar) {
		const viewDataInstance = filterBar.getModel("viewData") as unknown as JSONModel;
		return viewDataInstance.getData() as ViewData;
	},

	/**
	 * Check if semantic date ranges are used in filter bar.
	 *
	 * @param filterBar Filter bar
	 * @returns Boolean indicating semantic date range use.
	 */
	_checkSemanticDateRangeIsUsed: function (filterBar: FilterBar) {
		return filterBar.data("useSemanticDateRange") === "true" || filterBar.data("useSemanticDateRange") === true;
	},

	/**
	 * Get the filter field configuration of a property.
	 *
	 * @param property Filter field Path
	 * @param filterFieldsConfig Manifest Configuration of filter bar
	 * @returns The Filter Field Configuration
	 */
	_getPropertyFilterConfigurationSetting: function (property: string, filterFieldsConfig: FilterFieldsConfig = {}) {
		return filterFieldsConfig[property] ? filterFieldsConfig[property]?.settings : undefined;
	},

	/**
	 * Get the filter fields configuration from manifest.
	 *
	 * @param filterBar Filter bar
	 * @returns The filter filters Configurations from viewData (manifest)
	 */
	_getFilterFieldsConfig: (filterBar: FilterBar): FilterFieldsConfig => {
		const viewData = selectionVariantToStateFilters._getViewData(filterBar);
		const config = viewData.controlConfiguration;
		const filterFieldsConfig = config && (config["@com.sap.vocabularies.UI.v1.SelectionFields"].filterFields as FilterFieldsConfig);
		return filterFieldsConfig || {};
	},

	/**
	 * Create filter conditions for a parameter property.
	 *
	 * @param conversionInfo Property info used for conversion
	 * @returns The filter condtions for parameter property
	 */
	_getConditionsForParameter: function (conversionInfo: PropertyConversionInfo) {
		let conditionObjects: ConditionObject[] = [];
		const { propertyMetadata, selectionVariant } = conversionInfo;
		const conditionPath = propertyMetadata.name;
		const selectOptionName = selectionVariantToStateFilters._getSelectOptionName(selectionVariant, conditionPath, true);
		if (selectOptionName) {
			conditionObjects = selectionVariantToStateFilters._getPropertyConditions(conversionInfo, selectOptionName, true);
		}
		return conditionObjects;
	},

	/**
	 * Create filter conditions for a normal property.
	 *
	 * @param conversionInfo Property info used for conversion
	 * @returns The filter conditions for a normal property
	 */
	_getConditionsForProperty: function (conversionInfo: PropertyConversionInfo) {
		const { propertyMetadata, selectionVariant } = conversionInfo;
		const conditonPath = propertyMetadata.name;
		const selectOptionName = selectionVariantToStateFilters._getSelectOptionName(selectionVariant, conditonPath);

		let conditionObjects: ConditionObject[] = [];
		if (selectOptionName) {
			conditionObjects = selectionVariantToStateFilters._getPropertyConditions(conversionInfo, selectOptionName, false);
		}
		return conditionObjects;
	},

	/**
	 * Create filter conditions from navigation properties.
	 *
	 * @param conversionInfo Property info used for conversion
	 * @returns The filter condtions for navigation property
	 */
	_getConditionsForNavProperty: function (conversionInfo: PropertyConversionInfo) {
		const { filterBarInfo, selectionVariant, propertyName, navPath } = conversionInfo;
		const { contextPath } = filterBarInfo;

		let conditionObjects: ConditionObject[] = [];

		// We check with '/SalesOrderManage/_Item/Name'.
		// '/SalesOrderManage/_Item' => 'SalesOrderManage._Item'
		let selectOptionPathPrefix = `${contextPath.substring(1)}${navPath}`.replaceAll("/", ".");
		let selectOptionName = selectionVariantToStateFilters._getSelectOptionName(
			selectionVariant,
			propertyName,
			false,
			selectOptionPathPrefix
		);

		if (!selectOptionName) {
			// We check with '_Item/Name'.
			selectOptionPathPrefix = navPath.replaceAll("/", ".");
			selectOptionName = selectionVariantToStateFilters._getSelectOptionName(
				selectionVariant,
				propertyName,
				false,
				selectOptionPathPrefix
			);
		}

		if (selectOptionName) {
			conditionObjects = selectionVariantToStateFilters._getPropertyConditions(conversionInfo, selectOptionName, false);
		}

		return conditionObjects;
	},

	/**
	 * Get the possible select option name based on priority order.
	 *
	 * @param selectionVariant SelectionVariant to be converted.
	 * @param propertyName Metadata property name
	 * @param isParameter Property is a parameter
	 * @param navigationPath Navigation path to be considered
	 * @returns The correct select option name of a property to fetch the select options for conversion.
	 */
	_getSelectOptionName: function (
		selectionVariant: SelectionVariant,
		propertyName: string,
		isParameter?: boolean,
		navigationPath?: string
	) {
		// possible SelectOption Names based on priority.
		const possibleSelectOptionNames: string[] = [];
		const selectOptionsPropertyNames = selectionVariant.getSelectOptionsPropertyNames();

		if (isParameter) {
			// Currency ==> $Parameter.Currency
			// P_Currency ==> $Parameter.P_Currency
			possibleSelectOptionNames.push(`$Parameter.${propertyName}`);

			// Currency ==> Currency
			// P_Currency ==> P_Currency
			possibleSelectOptionNames.push(propertyName);

			if (propertyName.startsWith("P_")) {
				// P_Currency ==> $Parameter.Currency
				possibleSelectOptionNames.push(`$Parameter.${propertyName.slice(2, propertyName.length)}`);

				// P_Currency ==> Currency
				possibleSelectOptionNames.push(propertyName.slice(2, propertyName.length));
			} else {
				// Currency ==> $Parameter.P_Currency
				possibleSelectOptionNames.push(`$Parameter.P_${propertyName}`);

				// Currency ==> P_Currency
				possibleSelectOptionNames.push(`P_${propertyName}`);
			}
		} else {
			// Name => Name
			possibleSelectOptionNames.push(propertyName);
			possibleSelectOptionNames.push(`$Parameter.${propertyName}`);

			if (propertyName.startsWith("P_")) {
				// P_Name => Name
				const temp1 = propertyName.slice(2, propertyName.length);

				// Name => $Parameter.Name
				possibleSelectOptionNames.push(`$Parameter.${temp1}`);

				// Name => Name
				possibleSelectOptionNames.push(temp1);
			} else {
				// Name => P_Name
				const temp2 = `P_${propertyName}`;

				// P_Name => $Parameter.P_Name
				possibleSelectOptionNames.push(`$Parameter.${temp2}`);

				// P_Name => P_Name
				possibleSelectOptionNames.push(temp2);
			}
		}

		let selectOptionName = "";
		// Find the correct select option name based on the priority
		possibleSelectOptionNames.some((testName: string) => {
			const pathToCheck = navigationPath ? `${navigationPath}.${testName}` : testName;
			// Name => Name
			// Name => _Item.Name (incase _Item is navigationPath)

			return selectOptionsPropertyNames.includes(pathToCheck) ? (selectOptionName = pathToCheck) : false;
		});

		return selectOptionName;
	},

	/**
	 * Convert select options to property conditions.
	 *
	 * @param conversionInfo Property info used for conversion
	 * @param selectOptionName Select option name
	 * @param isParameter Boolean which determines if a property is parameterized
	 * @returns The conditions of a property for filter bar
	 */
	_getPropertyConditions: function (conversionInfo: PropertyConversionInfo, selectOptionName: string, isParameter?: boolean) {
		const { filterBarInfo, propertyMetadata, selectionVariant, propertyContextPath, propertyName } = conversionInfo;
		const selectOptions = selectionVariant.getSelectOption(selectOptionName);
		const { metaModel } = filterBarInfo;

		let conditionObjects: ConditionObject[] = [];
		if (selectOptions?.length) {
			const semanticDateOperators: string[] = selectionVariantToStateFilters._getSemanticDateOperators(conversionInfo, isParameter);
			const propertyEntitySetPath = propertyContextPath.substring(0, propertyContextPath.length - 1);

			const validOperators = isParameter
				? ["EQ"]
				: CommonUtils.getOperatorsForProperty(propertyName, propertyEntitySetPath, metaModel);

			// multiple select options => multiple conditions
			conditionObjects = this._getConditionsFromSelectOptions(
				selectOptions,
				propertyMetadata,
				validOperators,
				semanticDateOperators,
				isParameter
			);
		}
		return conditionObjects;
	},

	/**
	 * Fetch semantic date operators.
	 *
	 * @param conversionInfo Object which is used for conversion
	 * @param isParameter Boolean which determines if a property is parameterized
	 * @returns The semantic date operators supported for a property
	 */
	_getSemanticDateOperators: function (conversionInfo: PropertyConversionInfo, isParameter?: boolean) {
		const { filterBarInfo, propertyMetadata, propertyName, propertyContextPath } = conversionInfo;
		const conditionPath = propertyMetadata.name;
		let semanticDateOperators: string[] = [];
		let settings: string | undefined;
		const { useSemanticDateRange, filterFieldsConfig, metaModel } = filterBarInfo;
		if (useSemanticDateRange) {
			if (isParameter) {
				semanticDateOperators = ["EQ"];
			} else {
				const propertyEntitySetPath = propertyContextPath.substring(0, propertyContextPath.length - 1);
				settings = selectionVariantToStateFilters._getPropertyFilterConfigurationSetting(conditionPath, filterFieldsConfig);
				semanticDateOperators = CommonUtils.getOperatorsForProperty(
					propertyName,
					propertyEntitySetPath,
					metaModel,
					(ODATA_TYPE_MAPPING as Record<string, string>)[propertyMetadata.dataType],
					useSemanticDateRange,
					settings
				);
			}
		}
		return semanticDateOperators;
	},

	/**
	 * Get the filter conditions from selection options.
	 *
	 * @param selectOptions Select options array
	 * @param propertyMetadata Property metadata information
	 * @param validOperators All valid operators
	 * @param semanticDateOperators Semantic date operators
	 * @param isParameter Boolean which determines if a property is parameterized
	 * @returns Converted filter conditions
	 */
	_getConditionsFromSelectOptions: function (
		selectOptions: SelectOption[],
		propertyMetadata: FilterFieldPropertyInfo | undefined,
		validOperators: string[],
		semanticDateOperators: string[],
		isParameter?: boolean
	) {
		let conditionObjects: ConditionObject[] = [];
		// Create conditions for all the selectOptions of the property
		if (selectOptions.length) {
			conditionObjects = isParameter
				? selectionVariantToStateFilters._addConditionFromSelectOption(
						propertyMetadata,
						validOperators,
						semanticDateOperators,
						conditionObjects,
						selectOptions[0]
				  )
				: selectOptions.reduce(
						selectionVariantToStateFilters._addConditionFromSelectOption.bind(
							null,
							propertyMetadata,
							validOperators,
							semanticDateOperators
						),
						conditionObjects
				  );
		}
		return conditionObjects;
	},

	/**
	 * Cumulatively add select option to condition.
	 *
	 * @param propertyMetadata Property metadata information
	 * @param validOperators Operators for all the data types
	 * @param semanticDateOperators Operators for the Date type
	 * @param cumulativeConditions Filter conditions
	 * @param selectOption Selectoption of selection variant
	 * @returns The filter conditions
	 */
	_addConditionFromSelectOption: function (
		propertyMetadata: FilterFieldPropertyInfo | FilterFieldPropertyInfo[] | undefined,
		validOperators: string[],
		semanticDateOperators: string[],
		cumulativeConditions: ConditionObject[],
		selectOption: SelectOption
	) {
		const validType = {
			type: ""
		};
		validType.type = selectionVariantToStateFilters._getEdmType(
			(propertyMetadata as unknown as { typeConfig: { className: string } }).typeConfig.className
		);
		const condition = getConditions(selectOption, validType);
		if (
			selectOption.SemanticDates &&
			semanticDateOperators.length &&
			semanticDateOperators.includes(selectOption.SemanticDates.operator)
		) {
			const semanticDates = selectionVariantToStateFilters._addSemanticDatesToConditions(selectOption.SemanticDates);
			if (Object.keys(semanticDates).length > 0) {
				cumulativeConditions.push(semanticDates);
			}
		} else if (condition) {
			if (validOperators.length === 0 || validOperators.includes(condition.operator)) {
				cumulativeConditions.push(condition);
			}
		}
		return cumulativeConditions;
	},

	/**
	 * Create filter conditions for a parameter property.
	 *
	 * @param semanticDates Semantic date infomation
	 * @returns The filter conditions containing semantic dates
	 */
	_addSemanticDatesToConditions: (semanticDates: SemanticDateConfiguration): ConditionObject => {
		const values: unknown[] = [];
		if (semanticDates.high) {
			values.push(semanticDates.high);
		}
		if (semanticDates.low) {
			values.push(semanticDates.low);
		}
		return {
			values: values,
			operator: semanticDates.operator,
			isEmpty: undefined
		};
	},

	/**
	 * Get EDM type from data type.
	 *
	 * @param dataType V4 model data type
	 * @returns EDM type equivalent of data type
	 */
	_getEdmType: (dataType: string): string => {
		const TYPE_EDM_MAPPING = Object.fromEntries(
			Object.entries(EDM_TYPE_MAPPING).map(([k, v]) => [(v as { type: unknown }).type, k])
		) as Record<string, unknown>;
		return TYPE_EDM_MAPPING[dataType] as string;
	}
};

export default selectionVariantToStateFilters;

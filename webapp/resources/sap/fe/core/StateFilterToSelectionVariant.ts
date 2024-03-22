import Log from "sap/base/Log";
import isEmptyObject from "sap/base/util/isEmptyObject";
import SemanticDateOperators from "sap/fe/core/helpers/SemanticDateOperators";
import TypeUtil from "sap/fe/core/type/TypeUtil";
import type { SelectOption, SemanticDateConfiguration } from "sap/fe/navigation/SelectionVariant";
import SelectionVariant from "sap/fe/navigation/SelectionVariant";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import FilterOperatorUtil from "sap/ui/mdc/condition/FilterOperatorUtil";
import type Operator from "sap/ui/mdc/condition/Operator";
import RangeOperator from "sap/ui/mdc/condition/RangeOperator";
import type TypeConfig from "sap/ui/mdc/TypeConfig";
import type PropertyHelper from "sap/ui/mdc/util/PropertyHelper";
import type Filter from "sap/ui/model/Filter";
import type Type from "sap/ui/model/Type";

const StateFilterToSelectionVariant = {
	/**
	 * Get selection variant based on the filter conditions.
	 *
	 * @param filterConditions Configure filter bar control
	 * @param propertyHelper PropertyHelper and filter delegate controller of filterbar
	 * @param params Parameters of parametrized services
	 * @returns The filter conditions are converted to selection varaint and returned
	 */
	getSelectionVariantFromConditions: function (
		filterConditions: Record<string, ConditionObject[] | undefined>,
		propertyHelper: PropertyHelper,
		params?: string[]
	): SelectionVariant {
		const selectionVariant = new SelectionVariant();
		if (!isEmptyObject(filterConditions)) {
			for (const filterKey in filterConditions) {
				const filterFieldCondition = filterConditions[filterKey];
				if (filterFieldCondition?.length) {
					const selectOptions = StateFilterToSelectionVariant.getSelectionOptionsFromCondition(
						filterFieldCondition,
						filterKey,
						propertyHelper
					);
					if (selectOptions.length) {
						// get parameters from filterbar
						if (params?.includes(filterKey)) {
							// trying to generate properties like $Parameter.CompanyCode if CompanyCode is a parameter
							selectionVariant.massAddSelectOption(`$Parameter.${filterKey}`, selectOptions);
						}
						selectionVariant.massAddSelectOption(filterKey, selectOptions);
					}
				}
			}
		}
		return selectionVariant;
	},
	/**
	 * Method to add the filter conditions to selection variant.
	 *
	 * @param stateFilters Retrieved filter condition for a filter field from StateUtils
	 * @param filterKey Name of the filter key
	 * @param propertyHelper PropertyHelper of filterbar
	 * @returns The selection option array for a particular filterkey
	 */
	getSelectionOptionsFromCondition: function (
		stateFilters: ConditionObject[],
		filterKey: string,
		propertyHelper: PropertyHelper
	): SelectOption[] {
		const selectOptions: SelectOption[] = [];
		for (const condition of stateFilters) {
			const selectOption = StateFilterToSelectionVariant.getSelectionOption(condition, filterKey, propertyHelper);
			if (selectOption) {
				selectOptions.push(selectOption);
			}
		}
		return selectOptions;
	},
	/**
	 * Calculate the filter option for each value
	 *
	 * @param item
	 * @param filterKey Name of the filter key
	 * @param propertyHelper PropertyHelper of filterbar
	 * @returns The promise of select option
	 */
	getSelectionOption: function (item: ConditionObject, filterKey: string, propertyHelper: PropertyHelper): SelectOption | undefined {
		let semanticDates: SemanticDateConfiguration | undefined;
		let filterOption: SelectOption | undefined;
		const conditionValue = item;
		const operator =
			conditionValue.operator && conditionValue.operator !== "" ? FilterOperatorUtil.getOperator(conditionValue.operator) : undefined;
		if (operator instanceof RangeOperator) {
			semanticDates = StateFilterToSelectionVariant.createSemanticDatesFromConditions(conditionValue);
			filterOption = StateFilterToSelectionVariant.getOptionForPropertyWithRangeOperator(
				operator,
				conditionValue,
				filterKey,
				propertyHelper
			);
		} else {
			const semanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
			if (semanticDateOpsExt.includes(conditionValue.operator)) {
				semanticDates = StateFilterToSelectionVariant.createSemanticDatesFromConditions(conditionValue);
			}
			filterOption = StateFilterToSelectionVariant.getSelectionFormatForNonRangeOperator(conditionValue, filterKey, operator);
		}
		if (filterOption?.Option) {
			filterOption.SemanticDates = semanticDates ? semanticDates : undefined;
		}
		return filterOption as SelectOption;
	},
	/**
	 * Calculate the Select Option  filter conditions.
	 *
	 * @param conditionValue Name of the filter key
	 * @param filterKey Name of the filterkey
	 * @param operator The `sap.ui.mdc.condition.Operator` object
	 * @returns The Select Option object or undefined
	 */
	getSelectionFormatForNonRangeOperator: function (
		conditionValue: ConditionObject,
		filterKey: string,
		operator: Operator | undefined
	): SelectOption | undefined {
		const value1 = conditionValue.values[0] ? (conditionValue.values[0] as string).toString() : "";
		const value2 = conditionValue.values[1] ? (conditionValue.values[1] as string).toString() : null;
		const filterOption: SelectOption | undefined = StateFilterToSelectionVariant.getSelectOption(
			conditionValue.operator,
			value1,
			value2,
			filterKey
		);
		if (filterOption) {
			filterOption.Sign = operator?.exclude ? "E" : "I";
		}
		return filterOption;
	},
	/**
	 * Get the type config for filter field.
	 *
	 * @param filterKey Name of the filter key
	 * @param propertyHelper PropertyHelper and filter delegate controller of filterbar
	 * @returns The object with typeConfig and typeUtil value
	 */
	getTypeInfoForFilterProperty: function (filterKey: string, propertyHelper: PropertyHelper): TypeConfig | undefined {
		// for few filter fields keys will not be present hence skip those properties
		const propertyInfo = propertyHelper.getProperty(filterKey);
		let typeConfig: TypeConfig | undefined;
		if (propertyInfo) {
			typeConfig = propertyInfo.typeConfig;
		}
		return typeConfig;
	},

	/**
	 * Calculate the options for date range values.
	 *
	 * @param operator Object for the given operator name
	 * @param conditionValue Value object present inside filter condition values
	 * @param filterKey Name of the filter key
	 * @param propertyHelper PropertyHelper of filterbar
	 * @returns The selectionOption for filter field
	 */
	getOptionForPropertyWithRangeOperator: function (
		operator: Operator,
		conditionValue: ConditionObject,
		filterKey: string,
		propertyHelper: PropertyHelper
	): SelectOption | undefined {
		const filterOption: SelectOption = {
			Sign: "I",
			Option: "",
			Low: "",
			High: ""
		};
		const typeConfig = StateFilterToSelectionVariant.getTypeInfoForFilterProperty(filterKey, propertyHelper);

		// handling of Date RangeOperators
		const modelFilter = operator.getModelFilter(
			conditionValue,
			filterKey,
			(typeConfig ? typeConfig.typeInstance : undefined) as unknown as Type,
			false,
			typeConfig ? typeConfig.baseType : undefined
		);
		const filters: Filter[] | undefined = modelFilter.getFilters();
		if (filters === undefined) {
			filterOption.Sign = operator.exclude ? "E" : "I";
			// FIXME Those are private methods from MDC
			filterOption.Low = TypeUtil.externalizeValue(
				modelFilter.getValue1(),
				typeConfig ? typeConfig.typeInstance : "string"
			) as string;
			filterOption.High = TypeUtil.externalizeValue(
				modelFilter.getValue2(),
				typeConfig ? typeConfig.typeInstance : "string"
			) as string;
			filterOption.Option = modelFilter.getOperator() ?? "";
		}
		return filterOption.Option != "" ? filterOption : undefined;
	},

	/**
	 * Get sign and option of selection option
	 *
	 * @param operator The option of selection variant
	 * @param lowValue The single value or the lower boundary of the interval; the <code>null</code> value is not allowed
	 * @param highValue The High value of the range; if this value is not necessary, <code>null</code> is used</li>
	 * @param filterKey The name of the filter field
	 * @returns The selection state
	 */
	getSelectOption: function (operator: string, lowValue: string, highValue: string | null, filterKey: string) {
		const selectOptionState = {
			Option: "",
			Sign: "I",
			Low: lowValue,
			High: highValue
		};
		switch (operator) {
			case "Contains":
				selectOptionState.Option = "CP";
				break;
			case "StartsWith":
				selectOptionState.Option = "CP";
				selectOptionState.Low += "*";
				break;
			case "EndsWith":
				selectOptionState.Option = "CP";
				selectOptionState.Low = `*${selectOptionState.Low}`;
				break;
			case "BT":
			case "LE":
			case "LT":
			case "GT":
			case "NE":
			case "EQ":
				selectOptionState.Option = operator;
				break;
			case "DATE":
				selectOptionState.Option = "EQ";
				break;
			case "DATERANGE":
				selectOptionState.Option = "BT";
				break;
			case "FROM":
				selectOptionState.Option = "GE";
				break;
			case "TO":
				selectOptionState.Option = "LE";
				break;
			case "EEQ":
				selectOptionState.Option = "EQ";
				break;
			case "Empty":
				selectOptionState.Option = "EQ";
				selectOptionState.Low = "";
				break;
			case "NotContains":
				selectOptionState.Option = "CP";
				selectOptionState.Sign = "E";
				break;
			case "NOTBT":
				selectOptionState.Option = "BT";
				selectOptionState.Sign = "E";
				break;
			case "NotStartsWith":
				selectOptionState.Option = "CP";
				selectOptionState.Low += "*";
				selectOptionState.Sign = "E";
				break;
			case "NotEndsWith":
				selectOptionState.Option = "CP";
				selectOptionState.Low = `*${selectOptionState.Low}`;
				selectOptionState.Sign = "E";
				break;
			case "NotEmpty":
				selectOptionState.Option = "NE";
				selectOptionState.Low = "";
				break;
			case "NOTLE":
				selectOptionState.Option = "LE";
				selectOptionState.Sign = "E";
				break;
			case "NOTGE":
				selectOptionState.Option = "GE";
				selectOptionState.Sign = "E";
				break;
			case "NOTLT":
				selectOptionState.Option = "LT";
				selectOptionState.Sign = "E";
				break;
			case "NOTGT":
				selectOptionState.Option = "GT";
				selectOptionState.Sign = "E";
				break;
			default:
				Log.warning(`${operator} is not supported. ${filterKey} could not be added to the Selection variant`);
		}
		return selectOptionState.Option !== "" ? selectOptionState : undefined;
	},

	/**
	 * Create the semantic dates from filter conditions.
	 *
	 * @param condition Filter field condition
	 * @returns The Semantic date conditions
	 */
	createSemanticDatesFromConditions: function (condition: ConditionObject): SemanticDateConfiguration | undefined {
		if (!isEmptyObject(condition)) {
			return {
				high: condition.values[0] ? (condition.values[0] as string) : null,
				low: condition.values[1] ? (condition.values[1] as string) : null,
				operator: condition.operator
			};
		}
	}
};

export default StateFilterToSelectionVariant;

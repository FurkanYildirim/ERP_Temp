/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/isEmptyObject", "sap/fe/core/helpers/SemanticDateOperators", "sap/fe/core/type/TypeUtil", "sap/fe/navigation/SelectionVariant", "sap/ui/mdc/condition/FilterOperatorUtil", "sap/ui/mdc/condition/RangeOperator"], function (Log, isEmptyObject, SemanticDateOperators, TypeUtil, SelectionVariant, FilterOperatorUtil, RangeOperator) {
  "use strict";

  const StateFilterToSelectionVariant = {
    /**
     * Get selection variant based on the filter conditions.
     *
     * @param filterConditions Configure filter bar control
     * @param propertyHelper PropertyHelper and filter delegate controller of filterbar
     * @param params Parameters of parametrized services
     * @returns The filter conditions are converted to selection varaint and returned
     */
    getSelectionVariantFromConditions: function (filterConditions, propertyHelper, params) {
      const selectionVariant = new SelectionVariant();
      if (!isEmptyObject(filterConditions)) {
        for (const filterKey in filterConditions) {
          const filterFieldCondition = filterConditions[filterKey];
          if (filterFieldCondition !== null && filterFieldCondition !== void 0 && filterFieldCondition.length) {
            const selectOptions = StateFilterToSelectionVariant.getSelectionOptionsFromCondition(filterFieldCondition, filterKey, propertyHelper);
            if (selectOptions.length) {
              // get parameters from filterbar
              if (params !== null && params !== void 0 && params.includes(filterKey)) {
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
    getSelectionOptionsFromCondition: function (stateFilters, filterKey, propertyHelper) {
      const selectOptions = [];
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
    getSelectionOption: function (item, filterKey, propertyHelper) {
      var _filterOption;
      let semanticDates;
      let filterOption;
      const conditionValue = item;
      const operator = conditionValue.operator && conditionValue.operator !== "" ? FilterOperatorUtil.getOperator(conditionValue.operator) : undefined;
      if (operator instanceof RangeOperator) {
        semanticDates = StateFilterToSelectionVariant.createSemanticDatesFromConditions(conditionValue);
        filterOption = StateFilterToSelectionVariant.getOptionForPropertyWithRangeOperator(operator, conditionValue, filterKey, propertyHelper);
      } else {
        const semanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
        if (semanticDateOpsExt.includes(conditionValue.operator)) {
          semanticDates = StateFilterToSelectionVariant.createSemanticDatesFromConditions(conditionValue);
        }
        filterOption = StateFilterToSelectionVariant.getSelectionFormatForNonRangeOperator(conditionValue, filterKey, operator);
      }
      if ((_filterOption = filterOption) !== null && _filterOption !== void 0 && _filterOption.Option) {
        filterOption.SemanticDates = semanticDates ? semanticDates : undefined;
      }
      return filterOption;
    },
    /**
     * Calculate the Select Option  filter conditions.
     *
     * @param conditionValue Name of the filter key
     * @param filterKey Name of the filterkey
     * @param operator The `sap.ui.mdc.condition.Operator` object
     * @returns The Select Option object or undefined
     */
    getSelectionFormatForNonRangeOperator: function (conditionValue, filterKey, operator) {
      const value1 = conditionValue.values[0] ? conditionValue.values[0].toString() : "";
      const value2 = conditionValue.values[1] ? conditionValue.values[1].toString() : null;
      const filterOption = StateFilterToSelectionVariant.getSelectOption(conditionValue.operator, value1, value2, filterKey);
      if (filterOption) {
        filterOption.Sign = operator !== null && operator !== void 0 && operator.exclude ? "E" : "I";
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
    getTypeInfoForFilterProperty: function (filterKey, propertyHelper) {
      // for few filter fields keys will not be present hence skip those properties
      const propertyInfo = propertyHelper.getProperty(filterKey);
      let typeConfig;
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
    getOptionForPropertyWithRangeOperator: function (operator, conditionValue, filterKey, propertyHelper) {
      const filterOption = {
        Sign: "I",
        Option: "",
        Low: "",
        High: ""
      };
      const typeConfig = StateFilterToSelectionVariant.getTypeInfoForFilterProperty(filterKey, propertyHelper);

      // handling of Date RangeOperators
      const modelFilter = operator.getModelFilter(conditionValue, filterKey, typeConfig ? typeConfig.typeInstance : undefined, false, typeConfig ? typeConfig.baseType : undefined);
      const filters = modelFilter.getFilters();
      if (filters === undefined) {
        filterOption.Sign = operator.exclude ? "E" : "I";
        // FIXME Those are private methods from MDC
        filterOption.Low = TypeUtil.externalizeValue(modelFilter.getValue1(), typeConfig ? typeConfig.typeInstance : "string");
        filterOption.High = TypeUtil.externalizeValue(modelFilter.getValue2(), typeConfig ? typeConfig.typeInstance : "string");
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
    getSelectOption: function (operator, lowValue, highValue, filterKey) {
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
    createSemanticDatesFromConditions: function (condition) {
      if (!isEmptyObject(condition)) {
        return {
          high: condition.values[0] ? condition.values[0] : null,
          low: condition.values[1] ? condition.values[1] : null,
          operator: condition.operator
        };
      }
    }
  };
  return StateFilterToSelectionVariant;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGF0ZUZpbHRlclRvU2VsZWN0aW9uVmFyaWFudCIsImdldFNlbGVjdGlvblZhcmlhbnRGcm9tQ29uZGl0aW9ucyIsImZpbHRlckNvbmRpdGlvbnMiLCJwcm9wZXJ0eUhlbHBlciIsInBhcmFtcyIsInNlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwiaXNFbXB0eU9iamVjdCIsImZpbHRlcktleSIsImZpbHRlckZpZWxkQ29uZGl0aW9uIiwibGVuZ3RoIiwic2VsZWN0T3B0aW9ucyIsImdldFNlbGVjdGlvbk9wdGlvbnNGcm9tQ29uZGl0aW9uIiwiaW5jbHVkZXMiLCJtYXNzQWRkU2VsZWN0T3B0aW9uIiwic3RhdGVGaWx0ZXJzIiwiY29uZGl0aW9uIiwic2VsZWN0T3B0aW9uIiwiZ2V0U2VsZWN0aW9uT3B0aW9uIiwicHVzaCIsIml0ZW0iLCJzZW1hbnRpY0RhdGVzIiwiZmlsdGVyT3B0aW9uIiwiY29uZGl0aW9uVmFsdWUiLCJvcGVyYXRvciIsIkZpbHRlck9wZXJhdG9yVXRpbCIsImdldE9wZXJhdG9yIiwidW5kZWZpbmVkIiwiUmFuZ2VPcGVyYXRvciIsImNyZWF0ZVNlbWFudGljRGF0ZXNGcm9tQ29uZGl0aW9ucyIsImdldE9wdGlvbkZvclByb3BlcnR5V2l0aFJhbmdlT3BlcmF0b3IiLCJzZW1hbnRpY0RhdGVPcHNFeHQiLCJTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJnZXRTdXBwb3J0ZWRPcGVyYXRpb25zIiwiZ2V0U2VsZWN0aW9uRm9ybWF0Rm9yTm9uUmFuZ2VPcGVyYXRvciIsIk9wdGlvbiIsIlNlbWFudGljRGF0ZXMiLCJ2YWx1ZTEiLCJ2YWx1ZXMiLCJ0b1N0cmluZyIsInZhbHVlMiIsImdldFNlbGVjdE9wdGlvbiIsIlNpZ24iLCJleGNsdWRlIiwiZ2V0VHlwZUluZm9Gb3JGaWx0ZXJQcm9wZXJ0eSIsInByb3BlcnR5SW5mbyIsImdldFByb3BlcnR5IiwidHlwZUNvbmZpZyIsIkxvdyIsIkhpZ2giLCJtb2RlbEZpbHRlciIsImdldE1vZGVsRmlsdGVyIiwidHlwZUluc3RhbmNlIiwiYmFzZVR5cGUiLCJmaWx0ZXJzIiwiZ2V0RmlsdGVycyIsIlR5cGVVdGlsIiwiZXh0ZXJuYWxpemVWYWx1ZSIsImdldFZhbHVlMSIsImdldFZhbHVlMiIsImxvd1ZhbHVlIiwiaGlnaFZhbHVlIiwic2VsZWN0T3B0aW9uU3RhdGUiLCJMb2ciLCJ3YXJuaW5nIiwiaGlnaCIsImxvdyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU3RhdGVGaWx0ZXJUb1NlbGVjdGlvblZhcmlhbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgaXNFbXB0eU9iamVjdCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9pc0VtcHR5T2JqZWN0XCI7XG5pbXBvcnQgU2VtYW50aWNEYXRlT3BlcmF0b3JzIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljRGF0ZU9wZXJhdG9yc1wiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgdHlwZSB7IFNlbGVjdE9wdGlvbiwgU2VtYW50aWNEYXRlQ29uZmlndXJhdGlvbiB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IHR5cGUgeyBDb25kaXRpb25PYmplY3QgfSBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgRmlsdGVyT3BlcmF0b3JVdGlsIGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9GaWx0ZXJPcGVyYXRvclV0aWxcIjtcbmltcG9ydCB0eXBlIE9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9PcGVyYXRvclwiO1xuaW1wb3J0IFJhbmdlT3BlcmF0b3IgZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL1JhbmdlT3BlcmF0b3JcIjtcbmltcG9ydCB0eXBlIFR5cGVDb25maWcgZnJvbSBcInNhcC91aS9tZGMvVHlwZUNvbmZpZ1wiO1xuaW1wb3J0IHR5cGUgUHJvcGVydHlIZWxwZXIgZnJvbSBcInNhcC91aS9tZGMvdXRpbC9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgdHlwZSBUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvVHlwZVwiO1xuXG5jb25zdCBTdGF0ZUZpbHRlclRvU2VsZWN0aW9uVmFyaWFudCA9IHtcblx0LyoqXG5cdCAqIEdldCBzZWxlY3Rpb24gdmFyaWFudCBiYXNlZCBvbiB0aGUgZmlsdGVyIGNvbmRpdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJDb25kaXRpb25zIENvbmZpZ3VyZSBmaWx0ZXIgYmFyIGNvbnRyb2xcblx0ICogQHBhcmFtIHByb3BlcnR5SGVscGVyIFByb3BlcnR5SGVscGVyIGFuZCBmaWx0ZXIgZGVsZWdhdGUgY29udHJvbGxlciBvZiBmaWx0ZXJiYXJcblx0ICogQHBhcmFtIHBhcmFtcyBQYXJhbWV0ZXJzIG9mIHBhcmFtZXRyaXplZCBzZXJ2aWNlc1xuXHQgKiBAcmV0dXJucyBUaGUgZmlsdGVyIGNvbmRpdGlvbnMgYXJlIGNvbnZlcnRlZCB0byBzZWxlY3Rpb24gdmFyYWludCBhbmQgcmV0dXJuZWRcblx0ICovXG5cdGdldFNlbGVjdGlvblZhcmlhbnRGcm9tQ29uZGl0aW9uczogZnVuY3Rpb24gKFxuXHRcdGZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIENvbmRpdGlvbk9iamVjdFtdIHwgdW5kZWZpbmVkPixcblx0XHRwcm9wZXJ0eUhlbHBlcjogUHJvcGVydHlIZWxwZXIsXG5cdFx0cGFyYW1zPzogc3RyaW5nW11cblx0KTogU2VsZWN0aW9uVmFyaWFudCB7XG5cdFx0Y29uc3Qgc2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdFx0aWYgKCFpc0VtcHR5T2JqZWN0KGZpbHRlckNvbmRpdGlvbnMpKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGZpbHRlcktleSBpbiBmaWx0ZXJDb25kaXRpb25zKSB7XG5cdFx0XHRcdGNvbnN0IGZpbHRlckZpZWxkQ29uZGl0aW9uID0gZmlsdGVyQ29uZGl0aW9uc1tmaWx0ZXJLZXldO1xuXHRcdFx0XHRpZiAoZmlsdGVyRmllbGRDb25kaXRpb24/Lmxlbmd0aCkge1xuXHRcdFx0XHRcdGNvbnN0IHNlbGVjdE9wdGlvbnMgPSBTdGF0ZUZpbHRlclRvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3Rpb25PcHRpb25zRnJvbUNvbmRpdGlvbihcblx0XHRcdFx0XHRcdGZpbHRlckZpZWxkQ29uZGl0aW9uLFxuXHRcdFx0XHRcdFx0ZmlsdGVyS2V5LFxuXHRcdFx0XHRcdFx0cHJvcGVydHlIZWxwZXJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGlmIChzZWxlY3RPcHRpb25zLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0Ly8gZ2V0IHBhcmFtZXRlcnMgZnJvbSBmaWx0ZXJiYXJcblx0XHRcdFx0XHRcdGlmIChwYXJhbXM/LmluY2x1ZGVzKGZpbHRlcktleSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gdHJ5aW5nIHRvIGdlbmVyYXRlIHByb3BlcnRpZXMgbGlrZSAkUGFyYW1ldGVyLkNvbXBhbnlDb2RlIGlmIENvbXBhbnlDb2RlIGlzIGEgcGFyYW1ldGVyXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQubWFzc0FkZFNlbGVjdE9wdGlvbihgJFBhcmFtZXRlci4ke2ZpbHRlcktleX1gLCBzZWxlY3RPcHRpb25zKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQubWFzc0FkZFNlbGVjdE9wdGlvbihmaWx0ZXJLZXksIHNlbGVjdE9wdGlvbnMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2VsZWN0aW9uVmFyaWFudDtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBhZGQgdGhlIGZpbHRlciBjb25kaXRpb25zIHRvIHNlbGVjdGlvbiB2YXJpYW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gc3RhdGVGaWx0ZXJzIFJldHJpZXZlZCBmaWx0ZXIgY29uZGl0aW9uIGZvciBhIGZpbHRlciBmaWVsZCBmcm9tIFN0YXRlVXRpbHNcblx0ICogQHBhcmFtIGZpbHRlcktleSBOYW1lIG9mIHRoZSBmaWx0ZXIga2V5XG5cdCAqIEBwYXJhbSBwcm9wZXJ0eUhlbHBlciBQcm9wZXJ0eUhlbHBlciBvZiBmaWx0ZXJiYXJcblx0ICogQHJldHVybnMgVGhlIHNlbGVjdGlvbiBvcHRpb24gYXJyYXkgZm9yIGEgcGFydGljdWxhciBmaWx0ZXJrZXlcblx0ICovXG5cdGdldFNlbGVjdGlvbk9wdGlvbnNGcm9tQ29uZGl0aW9uOiBmdW5jdGlvbiAoXG5cdFx0c3RhdGVGaWx0ZXJzOiBDb25kaXRpb25PYmplY3RbXSxcblx0XHRmaWx0ZXJLZXk6IHN0cmluZyxcblx0XHRwcm9wZXJ0eUhlbHBlcjogUHJvcGVydHlIZWxwZXJcblx0KTogU2VsZWN0T3B0aW9uW10ge1xuXHRcdGNvbnN0IHNlbGVjdE9wdGlvbnM6IFNlbGVjdE9wdGlvbltdID0gW107XG5cdFx0Zm9yIChjb25zdCBjb25kaXRpb24gb2Ygc3RhdGVGaWx0ZXJzKSB7XG5cdFx0XHRjb25zdCBzZWxlY3RPcHRpb24gPSBTdGF0ZUZpbHRlclRvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3Rpb25PcHRpb24oY29uZGl0aW9uLCBmaWx0ZXJLZXksIHByb3BlcnR5SGVscGVyKTtcblx0XHRcdGlmIChzZWxlY3RPcHRpb24pIHtcblx0XHRcdFx0c2VsZWN0T3B0aW9ucy5wdXNoKHNlbGVjdE9wdGlvbik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzZWxlY3RPcHRpb25zO1xuXHR9LFxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHRoZSBmaWx0ZXIgb3B0aW9uIGZvciBlYWNoIHZhbHVlXG5cdCAqXG5cdCAqIEBwYXJhbSBpdGVtXG5cdCAqIEBwYXJhbSBmaWx0ZXJLZXkgTmFtZSBvZiB0aGUgZmlsdGVyIGtleVxuXHQgKiBAcGFyYW0gcHJvcGVydHlIZWxwZXIgUHJvcGVydHlIZWxwZXIgb2YgZmlsdGVyYmFyXG5cdCAqIEByZXR1cm5zIFRoZSBwcm9taXNlIG9mIHNlbGVjdCBvcHRpb25cblx0ICovXG5cdGdldFNlbGVjdGlvbk9wdGlvbjogZnVuY3Rpb24gKGl0ZW06IENvbmRpdGlvbk9iamVjdCwgZmlsdGVyS2V5OiBzdHJpbmcsIHByb3BlcnR5SGVscGVyOiBQcm9wZXJ0eUhlbHBlcik6IFNlbGVjdE9wdGlvbiB8IHVuZGVmaW5lZCB7XG5cdFx0bGV0IHNlbWFudGljRGF0ZXM6IFNlbWFudGljRGF0ZUNvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQ7XG5cdFx0bGV0IGZpbHRlck9wdGlvbjogU2VsZWN0T3B0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGNvbmRpdGlvblZhbHVlID0gaXRlbTtcblx0XHRjb25zdCBvcGVyYXRvciA9XG5cdFx0XHRjb25kaXRpb25WYWx1ZS5vcGVyYXRvciAmJiBjb25kaXRpb25WYWx1ZS5vcGVyYXRvciAhPT0gXCJcIiA/IEZpbHRlck9wZXJhdG9yVXRpbC5nZXRPcGVyYXRvcihjb25kaXRpb25WYWx1ZS5vcGVyYXRvcikgOiB1bmRlZmluZWQ7XG5cdFx0aWYgKG9wZXJhdG9yIGluc3RhbmNlb2YgUmFuZ2VPcGVyYXRvcikge1xuXHRcdFx0c2VtYW50aWNEYXRlcyA9IFN0YXRlRmlsdGVyVG9TZWxlY3Rpb25WYXJpYW50LmNyZWF0ZVNlbWFudGljRGF0ZXNGcm9tQ29uZGl0aW9ucyhjb25kaXRpb25WYWx1ZSk7XG5cdFx0XHRmaWx0ZXJPcHRpb24gPSBTdGF0ZUZpbHRlclRvU2VsZWN0aW9uVmFyaWFudC5nZXRPcHRpb25Gb3JQcm9wZXJ0eVdpdGhSYW5nZU9wZXJhdG9yKFxuXHRcdFx0XHRvcGVyYXRvcixcblx0XHRcdFx0Y29uZGl0aW9uVmFsdWUsXG5cdFx0XHRcdGZpbHRlcktleSxcblx0XHRcdFx0cHJvcGVydHlIZWxwZXJcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHNlbWFudGljRGF0ZU9wc0V4dCA9IFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTdXBwb3J0ZWRPcGVyYXRpb25zKCk7XG5cdFx0XHRpZiAoc2VtYW50aWNEYXRlT3BzRXh0LmluY2x1ZGVzKGNvbmRpdGlvblZhbHVlLm9wZXJhdG9yKSkge1xuXHRcdFx0XHRzZW1hbnRpY0RhdGVzID0gU3RhdGVGaWx0ZXJUb1NlbGVjdGlvblZhcmlhbnQuY3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zKGNvbmRpdGlvblZhbHVlKTtcblx0XHRcdH1cblx0XHRcdGZpbHRlck9wdGlvbiA9IFN0YXRlRmlsdGVyVG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdGlvbkZvcm1hdEZvck5vblJhbmdlT3BlcmF0b3IoY29uZGl0aW9uVmFsdWUsIGZpbHRlcktleSwgb3BlcmF0b3IpO1xuXHRcdH1cblx0XHRpZiAoZmlsdGVyT3B0aW9uPy5PcHRpb24pIHtcblx0XHRcdGZpbHRlck9wdGlvbi5TZW1hbnRpY0RhdGVzID0gc2VtYW50aWNEYXRlcyA/IHNlbWFudGljRGF0ZXMgOiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiBmaWx0ZXJPcHRpb24gYXMgU2VsZWN0T3B0aW9uO1xuXHR9LFxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHRoZSBTZWxlY3QgT3B0aW9uICBmaWx0ZXIgY29uZGl0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIGNvbmRpdGlvblZhbHVlIE5hbWUgb2YgdGhlIGZpbHRlciBrZXlcblx0ICogQHBhcmFtIGZpbHRlcktleSBOYW1lIG9mIHRoZSBmaWx0ZXJrZXlcblx0ICogQHBhcmFtIG9wZXJhdG9yIFRoZSBgc2FwLnVpLm1kYy5jb25kaXRpb24uT3BlcmF0b3JgIG9iamVjdFxuXHQgKiBAcmV0dXJucyBUaGUgU2VsZWN0IE9wdGlvbiBvYmplY3Qgb3IgdW5kZWZpbmVkXG5cdCAqL1xuXHRnZXRTZWxlY3Rpb25Gb3JtYXRGb3JOb25SYW5nZU9wZXJhdG9yOiBmdW5jdGlvbiAoXG5cdFx0Y29uZGl0aW9uVmFsdWU6IENvbmRpdGlvbk9iamVjdCxcblx0XHRmaWx0ZXJLZXk6IHN0cmluZyxcblx0XHRvcGVyYXRvcjogT3BlcmF0b3IgfCB1bmRlZmluZWRcblx0KTogU2VsZWN0T3B0aW9uIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCB2YWx1ZTEgPSBjb25kaXRpb25WYWx1ZS52YWx1ZXNbMF0gPyAoY29uZGl0aW9uVmFsdWUudmFsdWVzWzBdIGFzIHN0cmluZykudG9TdHJpbmcoKSA6IFwiXCI7XG5cdFx0Y29uc3QgdmFsdWUyID0gY29uZGl0aW9uVmFsdWUudmFsdWVzWzFdID8gKGNvbmRpdGlvblZhbHVlLnZhbHVlc1sxXSBhcyBzdHJpbmcpLnRvU3RyaW5nKCkgOiBudWxsO1xuXHRcdGNvbnN0IGZpbHRlck9wdGlvbjogU2VsZWN0T3B0aW9uIHwgdW5kZWZpbmVkID0gU3RhdGVGaWx0ZXJUb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKFxuXHRcdFx0Y29uZGl0aW9uVmFsdWUub3BlcmF0b3IsXG5cdFx0XHR2YWx1ZTEsXG5cdFx0XHR2YWx1ZTIsXG5cdFx0XHRmaWx0ZXJLZXlcblx0XHQpO1xuXHRcdGlmIChmaWx0ZXJPcHRpb24pIHtcblx0XHRcdGZpbHRlck9wdGlvbi5TaWduID0gb3BlcmF0b3I/LmV4Y2x1ZGUgPyBcIkVcIiA6IFwiSVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gZmlsdGVyT3B0aW9uO1xuXHR9LFxuXHQvKipcblx0ICogR2V0IHRoZSB0eXBlIGNvbmZpZyBmb3IgZmlsdGVyIGZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlsdGVyS2V5IE5hbWUgb2YgdGhlIGZpbHRlciBrZXlcblx0ICogQHBhcmFtIHByb3BlcnR5SGVscGVyIFByb3BlcnR5SGVscGVyIGFuZCBmaWx0ZXIgZGVsZWdhdGUgY29udHJvbGxlciBvZiBmaWx0ZXJiYXJcblx0ICogQHJldHVybnMgVGhlIG9iamVjdCB3aXRoIHR5cGVDb25maWcgYW5kIHR5cGVVdGlsIHZhbHVlXG5cdCAqL1xuXHRnZXRUeXBlSW5mb0ZvckZpbHRlclByb3BlcnR5OiBmdW5jdGlvbiAoZmlsdGVyS2V5OiBzdHJpbmcsIHByb3BlcnR5SGVscGVyOiBQcm9wZXJ0eUhlbHBlcik6IFR5cGVDb25maWcgfCB1bmRlZmluZWQge1xuXHRcdC8vIGZvciBmZXcgZmlsdGVyIGZpZWxkcyBrZXlzIHdpbGwgbm90IGJlIHByZXNlbnQgaGVuY2Ugc2tpcCB0aG9zZSBwcm9wZXJ0aWVzXG5cdFx0Y29uc3QgcHJvcGVydHlJbmZvID0gcHJvcGVydHlIZWxwZXIuZ2V0UHJvcGVydHkoZmlsdGVyS2V5KTtcblx0XHRsZXQgdHlwZUNvbmZpZzogVHlwZUNvbmZpZyB8IHVuZGVmaW5lZDtcblx0XHRpZiAocHJvcGVydHlJbmZvKSB7XG5cdFx0XHR0eXBlQ29uZmlnID0gcHJvcGVydHlJbmZvLnR5cGVDb25maWc7XG5cdFx0fVxuXHRcdHJldHVybiB0eXBlQ29uZmlnO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGUgdGhlIG9wdGlvbnMgZm9yIGRhdGUgcmFuZ2UgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb3BlcmF0b3IgT2JqZWN0IGZvciB0aGUgZ2l2ZW4gb3BlcmF0b3IgbmFtZVxuXHQgKiBAcGFyYW0gY29uZGl0aW9uVmFsdWUgVmFsdWUgb2JqZWN0IHByZXNlbnQgaW5zaWRlIGZpbHRlciBjb25kaXRpb24gdmFsdWVzXG5cdCAqIEBwYXJhbSBmaWx0ZXJLZXkgTmFtZSBvZiB0aGUgZmlsdGVyIGtleVxuXHQgKiBAcGFyYW0gcHJvcGVydHlIZWxwZXIgUHJvcGVydHlIZWxwZXIgb2YgZmlsdGVyYmFyXG5cdCAqIEByZXR1cm5zIFRoZSBzZWxlY3Rpb25PcHRpb24gZm9yIGZpbHRlciBmaWVsZFxuXHQgKi9cblx0Z2V0T3B0aW9uRm9yUHJvcGVydHlXaXRoUmFuZ2VPcGVyYXRvcjogZnVuY3Rpb24gKFxuXHRcdG9wZXJhdG9yOiBPcGVyYXRvcixcblx0XHRjb25kaXRpb25WYWx1ZTogQ29uZGl0aW9uT2JqZWN0LFxuXHRcdGZpbHRlcktleTogc3RyaW5nLFxuXHRcdHByb3BlcnR5SGVscGVyOiBQcm9wZXJ0eUhlbHBlclxuXHQpOiBTZWxlY3RPcHRpb24gfCB1bmRlZmluZWQge1xuXHRcdGNvbnN0IGZpbHRlck9wdGlvbjogU2VsZWN0T3B0aW9uID0ge1xuXHRcdFx0U2lnbjogXCJJXCIsXG5cdFx0XHRPcHRpb246IFwiXCIsXG5cdFx0XHRMb3c6IFwiXCIsXG5cdFx0XHRIaWdoOiBcIlwiXG5cdFx0fTtcblx0XHRjb25zdCB0eXBlQ29uZmlnID0gU3RhdGVGaWx0ZXJUb1NlbGVjdGlvblZhcmlhbnQuZ2V0VHlwZUluZm9Gb3JGaWx0ZXJQcm9wZXJ0eShmaWx0ZXJLZXksIHByb3BlcnR5SGVscGVyKTtcblxuXHRcdC8vIGhhbmRsaW5nIG9mIERhdGUgUmFuZ2VPcGVyYXRvcnNcblx0XHRjb25zdCBtb2RlbEZpbHRlciA9IG9wZXJhdG9yLmdldE1vZGVsRmlsdGVyKFxuXHRcdFx0Y29uZGl0aW9uVmFsdWUsXG5cdFx0XHRmaWx0ZXJLZXksXG5cdFx0XHQodHlwZUNvbmZpZyA/IHR5cGVDb25maWcudHlwZUluc3RhbmNlIDogdW5kZWZpbmVkKSBhcyB1bmtub3duIGFzIFR5cGUsXG5cdFx0XHRmYWxzZSxcblx0XHRcdHR5cGVDb25maWcgPyB0eXBlQ29uZmlnLmJhc2VUeXBlIDogdW5kZWZpbmVkXG5cdFx0KTtcblx0XHRjb25zdCBmaWx0ZXJzOiBGaWx0ZXJbXSB8IHVuZGVmaW5lZCA9IG1vZGVsRmlsdGVyLmdldEZpbHRlcnMoKTtcblx0XHRpZiAoZmlsdGVycyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRmaWx0ZXJPcHRpb24uU2lnbiA9IG9wZXJhdG9yLmV4Y2x1ZGUgPyBcIkVcIiA6IFwiSVwiO1xuXHRcdFx0Ly8gRklYTUUgVGhvc2UgYXJlIHByaXZhdGUgbWV0aG9kcyBmcm9tIE1EQ1xuXHRcdFx0ZmlsdGVyT3B0aW9uLkxvdyA9IFR5cGVVdGlsLmV4dGVybmFsaXplVmFsdWUoXG5cdFx0XHRcdG1vZGVsRmlsdGVyLmdldFZhbHVlMSgpLFxuXHRcdFx0XHR0eXBlQ29uZmlnID8gdHlwZUNvbmZpZy50eXBlSW5zdGFuY2UgOiBcInN0cmluZ1wiXG5cdFx0XHQpIGFzIHN0cmluZztcblx0XHRcdGZpbHRlck9wdGlvbi5IaWdoID0gVHlwZVV0aWwuZXh0ZXJuYWxpemVWYWx1ZShcblx0XHRcdFx0bW9kZWxGaWx0ZXIuZ2V0VmFsdWUyKCksXG5cdFx0XHRcdHR5cGVDb25maWcgPyB0eXBlQ29uZmlnLnR5cGVJbnN0YW5jZSA6IFwic3RyaW5nXCJcblx0XHRcdCkgYXMgc3RyaW5nO1xuXHRcdFx0ZmlsdGVyT3B0aW9uLk9wdGlvbiA9IG1vZGVsRmlsdGVyLmdldE9wZXJhdG9yKCkgPz8gXCJcIjtcblx0XHR9XG5cdFx0cmV0dXJuIGZpbHRlck9wdGlvbi5PcHRpb24gIT0gXCJcIiA/IGZpbHRlck9wdGlvbiA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHNpZ24gYW5kIG9wdGlvbiBvZiBzZWxlY3Rpb24gb3B0aW9uXG5cdCAqXG5cdCAqIEBwYXJhbSBvcGVyYXRvciBUaGUgb3B0aW9uIG9mIHNlbGVjdGlvbiB2YXJpYW50XG5cdCAqIEBwYXJhbSBsb3dWYWx1ZSBUaGUgc2luZ2xlIHZhbHVlIG9yIHRoZSBsb3dlciBib3VuZGFyeSBvZiB0aGUgaW50ZXJ2YWw7IHRoZSA8Y29kZT5udWxsPC9jb2RlPiB2YWx1ZSBpcyBub3QgYWxsb3dlZFxuXHQgKiBAcGFyYW0gaGlnaFZhbHVlIFRoZSBIaWdoIHZhbHVlIG9mIHRoZSByYW5nZTsgaWYgdGhpcyB2YWx1ZSBpcyBub3QgbmVjZXNzYXJ5LCA8Y29kZT5udWxsPC9jb2RlPiBpcyB1c2VkPC9saT5cblx0ICogQHBhcmFtIGZpbHRlcktleSBUaGUgbmFtZSBvZiB0aGUgZmlsdGVyIGZpZWxkXG5cdCAqIEByZXR1cm5zIFRoZSBzZWxlY3Rpb24gc3RhdGVcblx0ICovXG5cdGdldFNlbGVjdE9wdGlvbjogZnVuY3Rpb24gKG9wZXJhdG9yOiBzdHJpbmcsIGxvd1ZhbHVlOiBzdHJpbmcsIGhpZ2hWYWx1ZTogc3RyaW5nIHwgbnVsbCwgZmlsdGVyS2V5OiBzdHJpbmcpIHtcblx0XHRjb25zdCBzZWxlY3RPcHRpb25TdGF0ZSA9IHtcblx0XHRcdE9wdGlvbjogXCJcIixcblx0XHRcdFNpZ246IFwiSVwiLFxuXHRcdFx0TG93OiBsb3dWYWx1ZSxcblx0XHRcdEhpZ2g6IGhpZ2hWYWx1ZVxuXHRcdH07XG5cdFx0c3dpdGNoIChvcGVyYXRvcikge1xuXHRcdFx0Y2FzZSBcIkNvbnRhaW5zXCI6XG5cdFx0XHRcdHNlbGVjdE9wdGlvblN0YXRlLk9wdGlvbiA9IFwiQ1BcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU3RhcnRzV2l0aFwiOlxuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5PcHRpb24gPSBcIkNQXCI7XG5cdFx0XHRcdHNlbGVjdE9wdGlvblN0YXRlLkxvdyArPSBcIipcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRW5kc1dpdGhcIjpcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuT3B0aW9uID0gXCJDUFwiO1xuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5Mb3cgPSBgKiR7c2VsZWN0T3B0aW9uU3RhdGUuTG93fWA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJUXCI6XG5cdFx0XHRjYXNlIFwiTEVcIjpcblx0XHRcdGNhc2UgXCJMVFwiOlxuXHRcdFx0Y2FzZSBcIkdUXCI6XG5cdFx0XHRjYXNlIFwiTkVcIjpcblx0XHRcdGNhc2UgXCJFUVwiOlxuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5PcHRpb24gPSBvcGVyYXRvcjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiREFURVwiOlxuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5PcHRpb24gPSBcIkVRXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkRBVEVSQU5HRVwiOlxuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5PcHRpb24gPSBcIkJUXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkZST01cIjpcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuT3B0aW9uID0gXCJHRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJUT1wiOlxuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5PcHRpb24gPSBcIkxFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVFUVwiOlxuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5PcHRpb24gPSBcIkVRXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVtcHR5XCI6XG5cdFx0XHRcdHNlbGVjdE9wdGlvblN0YXRlLk9wdGlvbiA9IFwiRVFcIjtcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuTG93ID0gXCJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTm90Q29udGFpbnNcIjpcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuT3B0aW9uID0gXCJDUFwiO1xuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5TaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5PVEJUXCI6XG5cdFx0XHRcdHNlbGVjdE9wdGlvblN0YXRlLk9wdGlvbiA9IFwiQlRcIjtcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuU2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOb3RTdGFydHNXaXRoXCI6XG5cdFx0XHRcdHNlbGVjdE9wdGlvblN0YXRlLk9wdGlvbiA9IFwiQ1BcIjtcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuTG93ICs9IFwiKlwiO1xuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5TaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5vdEVuZHNXaXRoXCI6XG5cdFx0XHRcdHNlbGVjdE9wdGlvblN0YXRlLk9wdGlvbiA9IFwiQ1BcIjtcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuTG93ID0gYCoke3NlbGVjdE9wdGlvblN0YXRlLkxvd31gO1xuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5TaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5vdEVtcHR5XCI6XG5cdFx0XHRcdHNlbGVjdE9wdGlvblN0YXRlLk9wdGlvbiA9IFwiTkVcIjtcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuTG93ID0gXCJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTk9UTEVcIjpcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuT3B0aW9uID0gXCJMRVwiO1xuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5TaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5PVEdFXCI6XG5cdFx0XHRcdHNlbGVjdE9wdGlvblN0YXRlLk9wdGlvbiA9IFwiR0VcIjtcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuU2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOT1RMVFwiOlxuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5PcHRpb24gPSBcIkxUXCI7XG5cdFx0XHRcdHNlbGVjdE9wdGlvblN0YXRlLlNpZ24gPSBcIkVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTk9UR1RcIjpcblx0XHRcdFx0c2VsZWN0T3B0aW9uU3RhdGUuT3B0aW9uID0gXCJHVFwiO1xuXHRcdFx0XHRzZWxlY3RPcHRpb25TdGF0ZS5TaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0TG9nLndhcm5pbmcoYCR7b3BlcmF0b3J9IGlzIG5vdCBzdXBwb3J0ZWQuICR7ZmlsdGVyS2V5fSBjb3VsZCBub3QgYmUgYWRkZWQgdG8gdGhlIFNlbGVjdGlvbiB2YXJpYW50YCk7XG5cdFx0fVxuXHRcdHJldHVybiBzZWxlY3RPcHRpb25TdGF0ZS5PcHRpb24gIT09IFwiXCIgPyBzZWxlY3RPcHRpb25TdGF0ZSA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBzZW1hbnRpYyBkYXRlcyBmcm9tIGZpbHRlciBjb25kaXRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29uZGl0aW9uIEZpbHRlciBmaWVsZCBjb25kaXRpb25cblx0ICogQHJldHVybnMgVGhlIFNlbWFudGljIGRhdGUgY29uZGl0aW9uc1xuXHQgKi9cblx0Y3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zOiBmdW5jdGlvbiAoY29uZGl0aW9uOiBDb25kaXRpb25PYmplY3QpOiBTZW1hbnRpY0RhdGVDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoIWlzRW1wdHlPYmplY3QoY29uZGl0aW9uKSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aGlnaDogY29uZGl0aW9uLnZhbHVlc1swXSA/IChjb25kaXRpb24udmFsdWVzWzBdIGFzIHN0cmluZykgOiBudWxsLFxuXHRcdFx0XHRsb3c6IGNvbmRpdGlvbi52YWx1ZXNbMV0gPyAoY29uZGl0aW9uLnZhbHVlc1sxXSBhcyBzdHJpbmcpIDogbnVsbCxcblx0XHRcdFx0b3BlcmF0b3I6IGNvbmRpdGlvbi5vcGVyYXRvclxuXHRcdFx0fTtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXRlRmlsdGVyVG9TZWxlY3Rpb25WYXJpYW50O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBZUEsTUFBTUEsNkJBQTZCLEdBQUc7SUFDckM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUND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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/FilterHelper"], function (CommonUtils, BindingToolkit, DisplayModeFormatter, FilterHelper) {
  "use strict";

  var getConditions = FilterHelper.getConditions;
  var ODATA_TYPE_MAPPING = DisplayModeFormatter.ODATA_TYPE_MAPPING;
  var EDM_TYPE_MAPPING = BindingToolkit.EDM_TYPE_MAPPING;
  const IGNORED_PROPERTYNAMES = ["$search", "$editState"];
  const selectionVariantToStateFilters = {
    /**
     * Get the filter bar info needed for conversion of selection variant to conditions.
     *
     * @param filterBar Filter bar
     * @returns The Filter bar info (metaModel, contextPath, use of semantic date range, all filter fields config)
     */
    getFilterBarInfoForConversion: filterBar => {
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
    getFilterBarSupportedFields: async filterBar => {
      await filterBar.waitForInitialization();
      return filterBar.getControlDelegate().fetchProperties(filterBar);
    },
    /**
     * Get conditions from the selection variant.
     *
     * @param selectionVariant Selection variant
     * @param filterBarInfoForConversion Filter bar info needed for conversion of selection variant to conditions
     * @param filterBarPropertyInfos Property infos of the filterbar
     * @returns Conditions after conversion of selection variant
     */
    getConditionsFromSV: function (selectionVariant, filterBarInfoForConversion, filterBarPropertyInfos) {
      const {
        contextPath
      } = filterBarInfoForConversion;
      const conditions = {};
      filterBarPropertyInfos.forEach(function (propertyMetadata) {
        if (!IGNORED_PROPERTYNAMES.includes(propertyMetadata.name)) {
          let filterPathConditions = [];
          const {
            conditionPath,
            annotationPath
          } = propertyMetadata;
          const propPath = conditionPath.replaceAll("*", "");
          const navPath = propPath.substring(0, propPath.lastIndexOf("/"));
          const propertyName = propPath.substring(propPath.lastIndexOf("/") + 1);

          // Note: Conversion parameters
          const conversionInfo = {
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
    _getMetaModel: function (filterBar) {
      var _filterBar$getModel;
      return (_filterBar$getModel = filterBar.getModel()) === null || _filterBar$getModel === void 0 ? void 0 : _filterBar$getModel.getMetaModel();
    },
    /**
     * Get context path from filter bar.
     *
     * @param filterBar Filter bar
     * @returns The context path
     */
    _getContextPath: function (filterBar) {
      return filterBar.data("entityType");
    },
    /**
     * Get view data from filter bar.
     *
     * @param filterBar Filter bar
     * @returns The view data
     */
    _getViewData: function (filterBar) {
      const viewDataInstance = filterBar.getModel("viewData");
      return viewDataInstance.getData();
    },
    /**
     * Check if semantic date ranges are used in filter bar.
     *
     * @param filterBar Filter bar
     * @returns Boolean indicating semantic date range use.
     */
    _checkSemanticDateRangeIsUsed: function (filterBar) {
      return filterBar.data("useSemanticDateRange") === "true" || filterBar.data("useSemanticDateRange") === true;
    },
    /**
     * Get the filter field configuration of a property.
     *
     * @param property Filter field Path
     * @param filterFieldsConfig Manifest Configuration of filter bar
     * @returns The Filter Field Configuration
     */
    _getPropertyFilterConfigurationSetting: function (property) {
      var _filterFieldsConfig$p;
      let filterFieldsConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return filterFieldsConfig[property] ? (_filterFieldsConfig$p = filterFieldsConfig[property]) === null || _filterFieldsConfig$p === void 0 ? void 0 : _filterFieldsConfig$p.settings : undefined;
    },
    /**
     * Get the filter fields configuration from manifest.
     *
     * @param filterBar Filter bar
     * @returns The filter filters Configurations from viewData (manifest)
     */
    _getFilterFieldsConfig: filterBar => {
      const viewData = selectionVariantToStateFilters._getViewData(filterBar);
      const config = viewData.controlConfiguration;
      const filterFieldsConfig = config && config["@com.sap.vocabularies.UI.v1.SelectionFields"].filterFields;
      return filterFieldsConfig || {};
    },
    /**
     * Create filter conditions for a parameter property.
     *
     * @param conversionInfo Property info used for conversion
     * @returns The filter condtions for parameter property
     */
    _getConditionsForParameter: function (conversionInfo) {
      let conditionObjects = [];
      const {
        propertyMetadata,
        selectionVariant
      } = conversionInfo;
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
    _getConditionsForProperty: function (conversionInfo) {
      const {
        propertyMetadata,
        selectionVariant
      } = conversionInfo;
      const conditonPath = propertyMetadata.name;
      const selectOptionName = selectionVariantToStateFilters._getSelectOptionName(selectionVariant, conditonPath);
      let conditionObjects = [];
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
    _getConditionsForNavProperty: function (conversionInfo) {
      const {
        filterBarInfo,
        selectionVariant,
        propertyName,
        navPath
      } = conversionInfo;
      const {
        contextPath
      } = filterBarInfo;
      let conditionObjects = [];

      // We check with '/SalesOrderManage/_Item/Name'.
      // '/SalesOrderManage/_Item' => 'SalesOrderManage._Item'
      let selectOptionPathPrefix = `${contextPath.substring(1)}${navPath}`.replaceAll("/", ".");
      let selectOptionName = selectionVariantToStateFilters._getSelectOptionName(selectionVariant, propertyName, false, selectOptionPathPrefix);
      if (!selectOptionName) {
        // We check with '_Item/Name'.
        selectOptionPathPrefix = navPath.replaceAll("/", ".");
        selectOptionName = selectionVariantToStateFilters._getSelectOptionName(selectionVariant, propertyName, false, selectOptionPathPrefix);
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
    _getSelectOptionName: function (selectionVariant, propertyName, isParameter, navigationPath) {
      // possible SelectOption Names based on priority.
      const possibleSelectOptionNames = [];
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
      possibleSelectOptionNames.some(testName => {
        const pathToCheck = navigationPath ? `${navigationPath}.${testName}` : testName;
        // Name => Name
        // Name => _Item.Name (incase _Item is navigationPath)

        return selectOptionsPropertyNames.includes(pathToCheck) ? selectOptionName = pathToCheck : false;
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
    _getPropertyConditions: function (conversionInfo, selectOptionName, isParameter) {
      const {
        filterBarInfo,
        propertyMetadata,
        selectionVariant,
        propertyContextPath,
        propertyName
      } = conversionInfo;
      const selectOptions = selectionVariant.getSelectOption(selectOptionName);
      const {
        metaModel
      } = filterBarInfo;
      let conditionObjects = [];
      if (selectOptions !== null && selectOptions !== void 0 && selectOptions.length) {
        const semanticDateOperators = selectionVariantToStateFilters._getSemanticDateOperators(conversionInfo, isParameter);
        const propertyEntitySetPath = propertyContextPath.substring(0, propertyContextPath.length - 1);
        const validOperators = isParameter ? ["EQ"] : CommonUtils.getOperatorsForProperty(propertyName, propertyEntitySetPath, metaModel);

        // multiple select options => multiple conditions
        conditionObjects = this._getConditionsFromSelectOptions(selectOptions, propertyMetadata, validOperators, semanticDateOperators, isParameter);
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
    _getSemanticDateOperators: function (conversionInfo, isParameter) {
      const {
        filterBarInfo,
        propertyMetadata,
        propertyName,
        propertyContextPath
      } = conversionInfo;
      const conditionPath = propertyMetadata.name;
      let semanticDateOperators = [];
      let settings;
      const {
        useSemanticDateRange,
        filterFieldsConfig,
        metaModel
      } = filterBarInfo;
      if (useSemanticDateRange) {
        if (isParameter) {
          semanticDateOperators = ["EQ"];
        } else {
          const propertyEntitySetPath = propertyContextPath.substring(0, propertyContextPath.length - 1);
          settings = selectionVariantToStateFilters._getPropertyFilterConfigurationSetting(conditionPath, filterFieldsConfig);
          semanticDateOperators = CommonUtils.getOperatorsForProperty(propertyName, propertyEntitySetPath, metaModel, ODATA_TYPE_MAPPING[propertyMetadata.dataType], useSemanticDateRange, settings);
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
    _getConditionsFromSelectOptions: function (selectOptions, propertyMetadata, validOperators, semanticDateOperators, isParameter) {
      let conditionObjects = [];
      // Create conditions for all the selectOptions of the property
      if (selectOptions.length) {
        conditionObjects = isParameter ? selectionVariantToStateFilters._addConditionFromSelectOption(propertyMetadata, validOperators, semanticDateOperators, conditionObjects, selectOptions[0]) : selectOptions.reduce(selectionVariantToStateFilters._addConditionFromSelectOption.bind(null, propertyMetadata, validOperators, semanticDateOperators), conditionObjects);
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
    _addConditionFromSelectOption: function (propertyMetadata, validOperators, semanticDateOperators, cumulativeConditions, selectOption) {
      const validType = {
        type: ""
      };
      validType.type = selectionVariantToStateFilters._getEdmType(propertyMetadata.typeConfig.className);
      const condition = getConditions(selectOption, validType);
      if (selectOption.SemanticDates && semanticDateOperators.length && semanticDateOperators.includes(selectOption.SemanticDates.operator)) {
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
    _addSemanticDatesToConditions: semanticDates => {
      const values = [];
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
    _getEdmType: dataType => {
      const TYPE_EDM_MAPPING = Object.fromEntries(Object.entries(EDM_TYPE_MAPPING).map(_ref => {
        let [k, v] = _ref;
        return [v.type, k];
      }));
      return TYPE_EDM_MAPPING[dataType];
    }
  };
  return selectionVariantToStateFilters;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJR05PUkVEX1BST1BFUlRZTkFNRVMiLCJzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMiLCJnZXRGaWx0ZXJCYXJJbmZvRm9yQ29udmVyc2lvbiIsImZpbHRlckJhciIsIm1ldGFNb2RlbCIsIl9nZXRNZXRhTW9kZWwiLCJjb250ZXh0UGF0aCIsIl9nZXRDb250ZXh0UGF0aCIsInVzZVNlbWFudGljRGF0ZVJhbmdlIiwiX2NoZWNrU2VtYW50aWNEYXRlUmFuZ2VJc1VzZWQiLCJmaWx0ZXJGaWVsZHNDb25maWciLCJfZ2V0RmlsdGVyRmllbGRzQ29uZmlnIiwiZ2V0RmlsdGVyQmFyU3VwcG9ydGVkRmllbGRzIiwid2FpdEZvckluaXRpYWxpemF0aW9uIiwiZ2V0Q29udHJvbERlbGVnYXRlIiwiZmV0Y2hQcm9wZXJ0aWVzIiwiZ2V0Q29uZGl0aW9uc0Zyb21TViIsInNlbGVjdGlvblZhcmlhbnQiLCJmaWx0ZXJCYXJJbmZvRm9yQ29udmVyc2lvbiIsImZpbHRlckJhclByb3BlcnR5SW5mb3MiLCJjb25kaXRpb25zIiwiZm9yRWFjaCIsInByb3BlcnR5TWV0YWRhdGEiLCJpbmNsdWRlcyIsIm5hbWUiLCJmaWx0ZXJQYXRoQ29uZGl0aW9ucyIsImNvbmRpdGlvblBhdGgiLCJhbm5vdGF0aW9uUGF0aCIsInByb3BQYXRoIiwicmVwbGFjZUFsbCIsIm5hdlBhdGgiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsInByb3BlcnR5TmFtZSIsImNvbnZlcnNpb25JbmZvIiwicHJvcGVydHlDb250ZXh0UGF0aCIsImZpbHRlckJhckluZm8iLCJpc1BhcmFtZXRlciIsIl9nZXRDb25kaXRpb25zRm9yUGFyYW1ldGVyIiwiX2dldENvbmRpdGlvbnNGb3JOYXZQcm9wZXJ0eSIsIl9nZXRDb25kaXRpb25zRm9yUHJvcGVydHkiLCJsZW5ndGgiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsImRhdGEiLCJfZ2V0Vmlld0RhdGEiLCJ2aWV3RGF0YUluc3RhbmNlIiwiZ2V0RGF0YSIsIl9nZXRQcm9wZXJ0eUZpbHRlckNvbmZpZ3VyYXRpb25TZXR0aW5nIiwicHJvcGVydHkiLCJzZXR0aW5ncyIsInVuZGVmaW5lZCIsInZpZXdEYXRhIiwiY29uZmlnIiwiY29udHJvbENvbmZpZ3VyYXRpb24iLCJmaWx0ZXJGaWVsZHMiLCJjb25kaXRpb25PYmplY3RzIiwic2VsZWN0T3B0aW9uTmFtZSIsIl9nZXRTZWxlY3RPcHRpb25OYW1lIiwiX2dldFByb3BlcnR5Q29uZGl0aW9ucyIsImNvbmRpdG9uUGF0aCIsInNlbGVjdE9wdGlvblBhdGhQcmVmaXgiLCJuYXZpZ2F0aW9uUGF0aCIsInBvc3NpYmxlU2VsZWN0T3B0aW9uTmFtZXMiLCJzZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcyIsImdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzIiwicHVzaCIsInN0YXJ0c1dpdGgiLCJzbGljZSIsInRlbXAxIiwidGVtcDIiLCJzb21lIiwidGVzdE5hbWUiLCJwYXRoVG9DaGVjayIsInNlbGVjdE9wdGlvbnMiLCJnZXRTZWxlY3RPcHRpb24iLCJzZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJfZ2V0U2VtYW50aWNEYXRlT3BlcmF0b3JzIiwicHJvcGVydHlFbnRpdHlTZXRQYXRoIiwidmFsaWRPcGVyYXRvcnMiLCJDb21tb25VdGlscyIsImdldE9wZXJhdG9yc0ZvclByb3BlcnR5IiwiX2dldENvbmRpdGlvbnNGcm9tU2VsZWN0T3B0aW9ucyIsIk9EQVRBX1RZUEVfTUFQUElORyIsImRhdGFUeXBlIiwiX2FkZENvbmRpdGlvbkZyb21TZWxlY3RPcHRpb24iLCJyZWR1Y2UiLCJiaW5kIiwiY3VtdWxhdGl2ZUNvbmRpdGlvbnMiLCJzZWxlY3RPcHRpb24iLCJ2YWxpZFR5cGUiLCJ0eXBlIiwiX2dldEVkbVR5cGUiLCJ0eXBlQ29uZmlnIiwiY2xhc3NOYW1lIiwiY29uZGl0aW9uIiwiZ2V0Q29uZGl0aW9ucyIsIlNlbWFudGljRGF0ZXMiLCJvcGVyYXRvciIsInNlbWFudGljRGF0ZXMiLCJfYWRkU2VtYW50aWNEYXRlc1RvQ29uZGl0aW9ucyIsIk9iamVjdCIsImtleXMiLCJ2YWx1ZXMiLCJoaWdoIiwibG93IiwiaXNFbXB0eSIsIlRZUEVfRURNX01BUFBJTkciLCJmcm9tRW50cmllcyIsImVudHJpZXMiLCJFRE1fVFlQRV9NQVBQSU5HIiwibWFwIiwiayIsInYiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBFRE1fVFlQRV9NQVBQSU5HIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IE9EQVRBX1RZUEVfTUFQUElORyB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0Rpc3BsYXlNb2RlRm9ybWF0dGVyXCI7XG5pbXBvcnQgeyBnZXRDb25kaXRpb25zIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRmlsdGVySGVscGVyXCI7XG5pbXBvcnQgdHlwZSBTZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSB7IFNlbGVjdE9wdGlvbiwgU2VtYW50aWNEYXRlQ29uZmlndXJhdGlvbiB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgdHlwZSB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbnR5cGUgVmlld0RhdGEgPSB7XG5cdGNvbnRyb2xDb25maWd1cmF0aW9uPzogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgdW5rbm93bj4+O1xuXHRlbnRpdHlTZXQ/OiBzdHJpbmc7XG59O1xuXG50eXBlIEZpbHRlckJhckRlbGVnYXRlID0ge1xuXHRmZXRjaFByb3BlcnRpZXM6IChmaWx0ZXJCYXI6IEZpbHRlckJhcikgPT4gUHJvbWlzZTxGaWx0ZXJGaWVsZFByb3BlcnR5SW5mb1tdPjtcbn07XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZpZWxkUHJvcGVydHlJbmZvID0ge1xuXHRuYW1lOiBzdHJpbmc7XG5cdGNvbmRpdGlvblBhdGg6IHN0cmluZztcblx0ZGF0YVR5cGU6IHN0cmluZztcblx0YW5ub3RhdGlvblBhdGg/OiBzdHJpbmc7XG5cdGlzUGFyYW1ldGVyPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZpZWxkc0NvbmZpZyA9IFJlY29yZDxzdHJpbmcsIHsgc2V0dGluZ3M/OiBzdHJpbmcgfSB8IHVuZGVmaW5lZD47XG5cbmV4cG9ydCB0eXBlIEZpbHRlckJhckNvbnZlcnNpb25JbmZvID0ge1xuXHRtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsO1xuXHRjb250ZXh0UGF0aDogc3RyaW5nO1xuXHR1c2VTZW1hbnRpY0RhdGVSYW5nZT86IGJvb2xlYW47XG5cdGZpbHRlckZpZWxkc0NvbmZpZz86IEZpbHRlckZpZWxkc0NvbmZpZztcbn07XG5cbnR5cGUgUHJvcGVydHlDb252ZXJzaW9uSW5mbyA9IHtcblx0cHJvcGVydHlOYW1lOiBzdHJpbmc7XG5cdG5hdlBhdGg6IHN0cmluZztcblx0cHJvcGVydHlNZXRhZGF0YTogRmlsdGVyRmllbGRQcm9wZXJ0eUluZm87XG5cdHByb3BlcnR5Q29udGV4dFBhdGg6IHN0cmluZztcblx0c2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudDtcblx0ZmlsdGVyQmFySW5mbzogRmlsdGVyQmFyQ29udmVyc2lvbkluZm87XG59O1xuXG5jb25zdCBJR05PUkVEX1BST1BFUlRZTkFNRVM6IHN0cmluZ1tdID0gW1wiJHNlYXJjaFwiLCBcIiRlZGl0U3RhdGVcIl07XG5cbmNvbnN0IHNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycyA9IHtcblx0LyoqXG5cdCAqIEdldCB0aGUgZmlsdGVyIGJhciBpbmZvIG5lZWRlZCBmb3IgY29udmVyc2lvbiBvZiBzZWxlY3Rpb24gdmFyaWFudCB0byBjb25kaXRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlsdGVyQmFyIEZpbHRlciBiYXJcblx0ICogQHJldHVybnMgVGhlIEZpbHRlciBiYXIgaW5mbyAobWV0YU1vZGVsLCBjb250ZXh0UGF0aCwgdXNlIG9mIHNlbWFudGljIGRhdGUgcmFuZ2UsIGFsbCBmaWx0ZXIgZmllbGRzIGNvbmZpZylcblx0ICovXG5cdGdldEZpbHRlckJhckluZm9Gb3JDb252ZXJzaW9uOiAoZmlsdGVyQmFyOiBGaWx0ZXJCYXIpOiBGaWx0ZXJCYXJDb252ZXJzaW9uSW5mbyA9PiB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG1ldGFNb2RlbDogc2VsZWN0aW9uVmFyaWFudFRvU3RhdGVGaWx0ZXJzLl9nZXRNZXRhTW9kZWwoZmlsdGVyQmFyKSxcblx0XHRcdGNvbnRleHRQYXRoOiBzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuX2dldENvbnRleHRQYXRoKGZpbHRlckJhciksXG5cdFx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZTogc2VsZWN0aW9uVmFyaWFudFRvU3RhdGVGaWx0ZXJzLl9jaGVja1NlbWFudGljRGF0ZVJhbmdlSXNVc2VkKGZpbHRlckJhciksXG5cdFx0XHRmaWx0ZXJGaWVsZHNDb25maWc6IHNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5fZ2V0RmlsdGVyRmllbGRzQ29uZmlnKGZpbHRlckJhcilcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgc3VwcG9ydGVkIGZpbHRlciBmaWVsZCBwcm9wZXJ0aWVzIGZyb20gdGhlIGZpbHRlciBiYXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJCYXIgRmlsdGVyIGJhclxuXHQgKiBAcmV0dXJucyBTdXBwb3J0ZWQgZmlsdGVyIGZpZWxkcyBpbiBmaWx0ZXIgYmFyLlxuXHQgKi9cblx0Z2V0RmlsdGVyQmFyU3VwcG9ydGVkRmllbGRzOiBhc3luYyAoZmlsdGVyQmFyOiBGaWx0ZXJCYXIpID0+IHtcblx0XHRhd2FpdCBmaWx0ZXJCYXIud2FpdEZvckluaXRpYWxpemF0aW9uKCk7XG5cdFx0cmV0dXJuIChmaWx0ZXJCYXIuZ2V0Q29udHJvbERlbGVnYXRlKCkgYXMgRmlsdGVyQmFyRGVsZWdhdGUpLmZldGNoUHJvcGVydGllcyhmaWx0ZXJCYXIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgY29uZGl0aW9ucyBmcm9tIHRoZSBzZWxlY3Rpb24gdmFyaWFudC5cblx0ICpcblx0ICogQHBhcmFtIHNlbGVjdGlvblZhcmlhbnQgU2VsZWN0aW9uIHZhcmlhbnRcblx0ICogQHBhcmFtIGZpbHRlckJhckluZm9Gb3JDb252ZXJzaW9uIEZpbHRlciBiYXIgaW5mbyBuZWVkZWQgZm9yIGNvbnZlcnNpb24gb2Ygc2VsZWN0aW9uIHZhcmlhbnQgdG8gY29uZGl0aW9uc1xuXHQgKiBAcGFyYW0gZmlsdGVyQmFyUHJvcGVydHlJbmZvcyBQcm9wZXJ0eSBpbmZvcyBvZiB0aGUgZmlsdGVyYmFyXG5cdCAqIEByZXR1cm5zIENvbmRpdGlvbnMgYWZ0ZXIgY29udmVyc2lvbiBvZiBzZWxlY3Rpb24gdmFyaWFudFxuXHQgKi9cblx0Z2V0Q29uZGl0aW9uc0Zyb21TVjogZnVuY3Rpb24gKFxuXHRcdHNlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsXG5cdFx0ZmlsdGVyQmFySW5mb0ZvckNvbnZlcnNpb246IEZpbHRlckJhckNvbnZlcnNpb25JbmZvLFxuXHRcdGZpbHRlckJhclByb3BlcnR5SW5mb3M6IEZpbHRlckZpZWxkUHJvcGVydHlJbmZvW11cblx0KSB7XG5cdFx0Y29uc3QgeyBjb250ZXh0UGF0aCB9ID0gZmlsdGVyQmFySW5mb0ZvckNvbnZlcnNpb247XG5cdFx0Y29uc3QgY29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgQ29uZGl0aW9uT2JqZWN0W10+ID0ge307XG5cblx0XHRmaWx0ZXJCYXJQcm9wZXJ0eUluZm9zLmZvckVhY2goZnVuY3Rpb24gKHByb3BlcnR5TWV0YWRhdGE6IEZpbHRlckZpZWxkUHJvcGVydHlJbmZvKSB7XG5cdFx0XHRpZiAoIUlHTk9SRURfUFJPUEVSVFlOQU1FUy5pbmNsdWRlcyhwcm9wZXJ0eU1ldGFkYXRhLm5hbWUpKSB7XG5cdFx0XHRcdGxldCBmaWx0ZXJQYXRoQ29uZGl0aW9uczogQ29uZGl0aW9uT2JqZWN0W10gPSBbXTtcblx0XHRcdFx0Y29uc3QgeyBjb25kaXRpb25QYXRoLCBhbm5vdGF0aW9uUGF0aCB9ID0gcHJvcGVydHlNZXRhZGF0YTtcblx0XHRcdFx0Y29uc3QgcHJvcFBhdGggPSBjb25kaXRpb25QYXRoLnJlcGxhY2VBbGwoXCIqXCIsIFwiXCIpO1xuXHRcdFx0XHRjb25zdCBuYXZQYXRoID0gcHJvcFBhdGguc3Vic3RyaW5nKDAsIHByb3BQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IHByb3BQYXRoLnN1YnN0cmluZyhwcm9wUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKTtcblxuXHRcdFx0XHQvLyBOb3RlOiBDb252ZXJzaW9uIHBhcmFtZXRlcnNcblx0XHRcdFx0Y29uc3QgY29udmVyc2lvbkluZm86IFByb3BlcnR5Q29udmVyc2lvbkluZm8gPSB7XG5cdFx0XHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0XHRcdG5hdlBhdGgsXG5cdFx0XHRcdFx0cHJvcGVydHlDb250ZXh0UGF0aDogYCR7Y29udGV4dFBhdGh9JHtuYXZQYXRofWAsXG5cdFx0XHRcdFx0cHJvcGVydHlNZXRhZGF0YSxcblx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0XHRcdGZpbHRlckJhckluZm86IGZpbHRlckJhckluZm9Gb3JDb252ZXJzaW9uXG5cdFx0XHRcdH07XG5cdFx0XHRcdGlmIChwcm9wZXJ0eU1ldGFkYXRhLmlzUGFyYW1ldGVyICYmIGFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRcdFx0Ly8gcGFyYW1ldGVyXG5cdFx0XHRcdFx0Y29udmVyc2lvbkluZm8ucHJvcGVydHlDb250ZXh0UGF0aCA9IGFubm90YXRpb25QYXRoLnN1YnN0cmluZygwLCBhbm5vdGF0aW9uUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKTtcblx0XHRcdFx0XHRmaWx0ZXJQYXRoQ29uZGl0aW9ucyA9IHNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5fZ2V0Q29uZGl0aW9uc0ZvclBhcmFtZXRlcihjb252ZXJzaW9uSW5mbyk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoY29uZGl0aW9uUGF0aC5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdFx0XHQvLyBuYXZpZ2F0aW9uIHByb3BlcnR5XG5cdFx0XHRcdFx0ZmlsdGVyUGF0aENvbmRpdGlvbnMgPSBzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuX2dldENvbmRpdGlvbnNGb3JOYXZQcm9wZXJ0eShjb252ZXJzaW9uSW5mbyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gbm9ybWFsIHByb3BlcnR5XG5cdFx0XHRcdFx0ZmlsdGVyUGF0aENvbmRpdGlvbnMgPSBzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuX2dldENvbmRpdGlvbnNGb3JQcm9wZXJ0eShjb252ZXJzaW9uSW5mbyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoZmlsdGVyUGF0aENvbmRpdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGNvbmRpdGlvbnNbY29uZGl0aW9uUGF0aF0gPSBmaWx0ZXJQYXRoQ29uZGl0aW9ucztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBjb25kaXRpb25zO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgbWV0YW1vZGVsIG9mIGZpbHRlciBiYXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJCYXIgRmlsdGVyIGJhclxuXHQgKiBAcmV0dXJucyBUaGUgbWV0YW1vZGVsIGNvbnRleHRcblx0ICovXG5cdF9nZXRNZXRhTW9kZWw6IGZ1bmN0aW9uIChmaWx0ZXJCYXI6IEZpbHRlckJhcikge1xuXHRcdHJldHVybiBmaWx0ZXJCYXIuZ2V0TW9kZWwoKT8uZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBjb250ZXh0IHBhdGggZnJvbSBmaWx0ZXIgYmFyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlsdGVyQmFyIEZpbHRlciBiYXJcblx0ICogQHJldHVybnMgVGhlIGNvbnRleHQgcGF0aFxuXHQgKi9cblx0X2dldENvbnRleHRQYXRoOiBmdW5jdGlvbiAoZmlsdGVyQmFyOiBGaWx0ZXJCYXIpIHtcblx0XHRyZXR1cm4gZmlsdGVyQmFyLmRhdGEoXCJlbnRpdHlUeXBlXCIpIGFzIHN0cmluZztcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHZpZXcgZGF0YSBmcm9tIGZpbHRlciBiYXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJCYXIgRmlsdGVyIGJhclxuXHQgKiBAcmV0dXJucyBUaGUgdmlldyBkYXRhXG5cdCAqL1xuXHRfZ2V0Vmlld0RhdGE6IGZ1bmN0aW9uIChmaWx0ZXJCYXI6IEZpbHRlckJhcikge1xuXHRcdGNvbnN0IHZpZXdEYXRhSW5zdGFuY2UgPSBmaWx0ZXJCYXIuZ2V0TW9kZWwoXCJ2aWV3RGF0YVwiKSBhcyB1bmtub3duIGFzIEpTT05Nb2RlbDtcblx0XHRyZXR1cm4gdmlld0RhdGFJbnN0YW5jZS5nZXREYXRhKCkgYXMgVmlld0RhdGE7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrIGlmIHNlbWFudGljIGRhdGUgcmFuZ2VzIGFyZSB1c2VkIGluIGZpbHRlciBiYXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJCYXIgRmlsdGVyIGJhclxuXHQgKiBAcmV0dXJucyBCb29sZWFuIGluZGljYXRpbmcgc2VtYW50aWMgZGF0ZSByYW5nZSB1c2UuXG5cdCAqL1xuXHRfY2hlY2tTZW1hbnRpY0RhdGVSYW5nZUlzVXNlZDogZnVuY3Rpb24gKGZpbHRlckJhcjogRmlsdGVyQmFyKSB7XG5cdFx0cmV0dXJuIGZpbHRlckJhci5kYXRhKFwidXNlU2VtYW50aWNEYXRlUmFuZ2VcIikgPT09IFwidHJ1ZVwiIHx8IGZpbHRlckJhci5kYXRhKFwidXNlU2VtYW50aWNEYXRlUmFuZ2VcIikgPT09IHRydWU7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCB0aGUgZmlsdGVyIGZpZWxkIGNvbmZpZ3VyYXRpb24gb2YgYSBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5IEZpbHRlciBmaWVsZCBQYXRoXG5cdCAqIEBwYXJhbSBmaWx0ZXJGaWVsZHNDb25maWcgTWFuaWZlc3QgQ29uZmlndXJhdGlvbiBvZiBmaWx0ZXIgYmFyXG5cdCAqIEByZXR1cm5zIFRoZSBGaWx0ZXIgRmllbGQgQ29uZmlndXJhdGlvblxuXHQgKi9cblx0X2dldFByb3BlcnR5RmlsdGVyQ29uZmlndXJhdGlvblNldHRpbmc6IGZ1bmN0aW9uIChwcm9wZXJ0eTogc3RyaW5nLCBmaWx0ZXJGaWVsZHNDb25maWc6IEZpbHRlckZpZWxkc0NvbmZpZyA9IHt9KSB7XG5cdFx0cmV0dXJuIGZpbHRlckZpZWxkc0NvbmZpZ1twcm9wZXJ0eV0gPyBmaWx0ZXJGaWVsZHNDb25maWdbcHJvcGVydHldPy5zZXR0aW5ncyA6IHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRoZSBmaWx0ZXIgZmllbGRzIGNvbmZpZ3VyYXRpb24gZnJvbSBtYW5pZmVzdC5cblx0ICpcblx0ICogQHBhcmFtIGZpbHRlckJhciBGaWx0ZXIgYmFyXG5cdCAqIEByZXR1cm5zIFRoZSBmaWx0ZXIgZmlsdGVycyBDb25maWd1cmF0aW9ucyBmcm9tIHZpZXdEYXRhIChtYW5pZmVzdClcblx0ICovXG5cdF9nZXRGaWx0ZXJGaWVsZHNDb25maWc6IChmaWx0ZXJCYXI6IEZpbHRlckJhcik6IEZpbHRlckZpZWxkc0NvbmZpZyA9PiB7XG5cdFx0Y29uc3Qgdmlld0RhdGEgPSBzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuX2dldFZpZXdEYXRhKGZpbHRlckJhcik7XG5cdFx0Y29uc3QgY29uZmlnID0gdmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb247XG5cdFx0Y29uc3QgZmlsdGVyRmllbGRzQ29uZmlnID0gY29uZmlnICYmIChjb25maWdbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCJdLmZpbHRlckZpZWxkcyBhcyBGaWx0ZXJGaWVsZHNDb25maWcpO1xuXHRcdHJldHVybiBmaWx0ZXJGaWVsZHNDb25maWcgfHwge307XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBmaWx0ZXIgY29uZGl0aW9ucyBmb3IgYSBwYXJhbWV0ZXIgcHJvcGVydHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb252ZXJzaW9uSW5mbyBQcm9wZXJ0eSBpbmZvIHVzZWQgZm9yIGNvbnZlcnNpb25cblx0ICogQHJldHVybnMgVGhlIGZpbHRlciBjb25kdGlvbnMgZm9yIHBhcmFtZXRlciBwcm9wZXJ0eVxuXHQgKi9cblx0X2dldENvbmRpdGlvbnNGb3JQYXJhbWV0ZXI6IGZ1bmN0aW9uIChjb252ZXJzaW9uSW5mbzogUHJvcGVydHlDb252ZXJzaW9uSW5mbykge1xuXHRcdGxldCBjb25kaXRpb25PYmplY3RzOiBDb25kaXRpb25PYmplY3RbXSA9IFtdO1xuXHRcdGNvbnN0IHsgcHJvcGVydHlNZXRhZGF0YSwgc2VsZWN0aW9uVmFyaWFudCB9ID0gY29udmVyc2lvbkluZm87XG5cdFx0Y29uc3QgY29uZGl0aW9uUGF0aCA9IHByb3BlcnR5TWV0YWRhdGEubmFtZTtcblx0XHRjb25zdCBzZWxlY3RPcHRpb25OYW1lID0gc2VsZWN0aW9uVmFyaWFudFRvU3RhdGVGaWx0ZXJzLl9nZXRTZWxlY3RPcHRpb25OYW1lKHNlbGVjdGlvblZhcmlhbnQsIGNvbmRpdGlvblBhdGgsIHRydWUpO1xuXHRcdGlmIChzZWxlY3RPcHRpb25OYW1lKSB7XG5cdFx0XHRjb25kaXRpb25PYmplY3RzID0gc2VsZWN0aW9uVmFyaWFudFRvU3RhdGVGaWx0ZXJzLl9nZXRQcm9wZXJ0eUNvbmRpdGlvbnMoY29udmVyc2lvbkluZm8sIHNlbGVjdE9wdGlvbk5hbWUsIHRydWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29uZGl0aW9uT2JqZWN0cztcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIGZpbHRlciBjb25kaXRpb25zIGZvciBhIG5vcm1hbCBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIGNvbnZlcnNpb25JbmZvIFByb3BlcnR5IGluZm8gdXNlZCBmb3IgY29udmVyc2lvblxuXHQgKiBAcmV0dXJucyBUaGUgZmlsdGVyIGNvbmRpdGlvbnMgZm9yIGEgbm9ybWFsIHByb3BlcnR5XG5cdCAqL1xuXHRfZ2V0Q29uZGl0aW9uc0ZvclByb3BlcnR5OiBmdW5jdGlvbiAoY29udmVyc2lvbkluZm86IFByb3BlcnR5Q29udmVyc2lvbkluZm8pIHtcblx0XHRjb25zdCB7IHByb3BlcnR5TWV0YWRhdGEsIHNlbGVjdGlvblZhcmlhbnQgfSA9IGNvbnZlcnNpb25JbmZvO1xuXHRcdGNvbnN0IGNvbmRpdG9uUGF0aCA9IHByb3BlcnR5TWV0YWRhdGEubmFtZTtcblx0XHRjb25zdCBzZWxlY3RPcHRpb25OYW1lID0gc2VsZWN0aW9uVmFyaWFudFRvU3RhdGVGaWx0ZXJzLl9nZXRTZWxlY3RPcHRpb25OYW1lKHNlbGVjdGlvblZhcmlhbnQsIGNvbmRpdG9uUGF0aCk7XG5cblx0XHRsZXQgY29uZGl0aW9uT2JqZWN0czogQ29uZGl0aW9uT2JqZWN0W10gPSBbXTtcblx0XHRpZiAoc2VsZWN0T3B0aW9uTmFtZSkge1xuXHRcdFx0Y29uZGl0aW9uT2JqZWN0cyA9IHNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5fZ2V0UHJvcGVydHlDb25kaXRpb25zKGNvbnZlcnNpb25JbmZvLCBzZWxlY3RPcHRpb25OYW1lLCBmYWxzZSk7XG5cdFx0fVxuXHRcdHJldHVybiBjb25kaXRpb25PYmplY3RzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgZmlsdGVyIGNvbmRpdGlvbnMgZnJvbSBuYXZpZ2F0aW9uIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb252ZXJzaW9uSW5mbyBQcm9wZXJ0eSBpbmZvIHVzZWQgZm9yIGNvbnZlcnNpb25cblx0ICogQHJldHVybnMgVGhlIGZpbHRlciBjb25kdGlvbnMgZm9yIG5hdmlnYXRpb24gcHJvcGVydHlcblx0ICovXG5cdF9nZXRDb25kaXRpb25zRm9yTmF2UHJvcGVydHk6IGZ1bmN0aW9uIChjb252ZXJzaW9uSW5mbzogUHJvcGVydHlDb252ZXJzaW9uSW5mbykge1xuXHRcdGNvbnN0IHsgZmlsdGVyQmFySW5mbywgc2VsZWN0aW9uVmFyaWFudCwgcHJvcGVydHlOYW1lLCBuYXZQYXRoIH0gPSBjb252ZXJzaW9uSW5mbztcblx0XHRjb25zdCB7IGNvbnRleHRQYXRoIH0gPSBmaWx0ZXJCYXJJbmZvO1xuXG5cdFx0bGV0IGNvbmRpdGlvbk9iamVjdHM6IENvbmRpdGlvbk9iamVjdFtdID0gW107XG5cblx0XHQvLyBXZSBjaGVjayB3aXRoICcvU2FsZXNPcmRlck1hbmFnZS9fSXRlbS9OYW1lJy5cblx0XHQvLyAnL1NhbGVzT3JkZXJNYW5hZ2UvX0l0ZW0nID0+ICdTYWxlc09yZGVyTWFuYWdlLl9JdGVtJ1xuXHRcdGxldCBzZWxlY3RPcHRpb25QYXRoUHJlZml4ID0gYCR7Y29udGV4dFBhdGguc3Vic3RyaW5nKDEpfSR7bmF2UGF0aH1gLnJlcGxhY2VBbGwoXCIvXCIsIFwiLlwiKTtcblx0XHRsZXQgc2VsZWN0T3B0aW9uTmFtZSA9IHNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5fZ2V0U2VsZWN0T3B0aW9uTmFtZShcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRwcm9wZXJ0eU5hbWUsXG5cdFx0XHRmYWxzZSxcblx0XHRcdHNlbGVjdE9wdGlvblBhdGhQcmVmaXhcblx0XHQpO1xuXG5cdFx0aWYgKCFzZWxlY3RPcHRpb25OYW1lKSB7XG5cdFx0XHQvLyBXZSBjaGVjayB3aXRoICdfSXRlbS9OYW1lJy5cblx0XHRcdHNlbGVjdE9wdGlvblBhdGhQcmVmaXggPSBuYXZQYXRoLnJlcGxhY2VBbGwoXCIvXCIsIFwiLlwiKTtcblx0XHRcdHNlbGVjdE9wdGlvbk5hbWUgPSBzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuX2dldFNlbGVjdE9wdGlvbk5hbWUoXG5cdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRcdHByb3BlcnR5TmFtZSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdHNlbGVjdE9wdGlvblBhdGhQcmVmaXhcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKHNlbGVjdE9wdGlvbk5hbWUpIHtcblx0XHRcdGNvbmRpdGlvbk9iamVjdHMgPSBzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuX2dldFByb3BlcnR5Q29uZGl0aW9ucyhjb252ZXJzaW9uSW5mbywgc2VsZWN0T3B0aW9uTmFtZSwgZmFsc2UpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjb25kaXRpb25PYmplY3RzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHBvc3NpYmxlIHNlbGVjdCBvcHRpb24gbmFtZSBiYXNlZCBvbiBwcmlvcml0eSBvcmRlci5cblx0ICpcblx0ICogQHBhcmFtIHNlbGVjdGlvblZhcmlhbnQgU2VsZWN0aW9uVmFyaWFudCB0byBiZSBjb252ZXJ0ZWQuXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgTWV0YWRhdGEgcHJvcGVydHkgbmFtZVxuXHQgKiBAcGFyYW0gaXNQYXJhbWV0ZXIgUHJvcGVydHkgaXMgYSBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG5hdmlnYXRpb25QYXRoIE5hdmlnYXRpb24gcGF0aCB0byBiZSBjb25zaWRlcmVkXG5cdCAqIEByZXR1cm5zIFRoZSBjb3JyZWN0IHNlbGVjdCBvcHRpb24gbmFtZSBvZiBhIHByb3BlcnR5IHRvIGZldGNoIHRoZSBzZWxlY3Qgb3B0aW9ucyBmb3IgY29udmVyc2lvbi5cblx0ICovXG5cdF9nZXRTZWxlY3RPcHRpb25OYW1lOiBmdW5jdGlvbiAoXG5cdFx0c2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0XHRwcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0XHRpc1BhcmFtZXRlcj86IGJvb2xlYW4sXG5cdFx0bmF2aWdhdGlvblBhdGg/OiBzdHJpbmdcblx0KSB7XG5cdFx0Ly8gcG9zc2libGUgU2VsZWN0T3B0aW9uIE5hbWVzIGJhc2VkIG9uIHByaW9yaXR5LlxuXHRcdGNvbnN0IHBvc3NpYmxlU2VsZWN0T3B0aW9uTmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0Y29uc3Qgc2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMgPSBzZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCk7XG5cblx0XHRpZiAoaXNQYXJhbWV0ZXIpIHtcblx0XHRcdC8vIEN1cnJlbmN5ID09PiAkUGFyYW1ldGVyLkN1cnJlbmN5XG5cdFx0XHQvLyBQX0N1cnJlbmN5ID09PiAkUGFyYW1ldGVyLlBfQ3VycmVuY3lcblx0XHRcdHBvc3NpYmxlU2VsZWN0T3B0aW9uTmFtZXMucHVzaChgJFBhcmFtZXRlci4ke3Byb3BlcnR5TmFtZX1gKTtcblxuXHRcdFx0Ly8gQ3VycmVuY3kgPT0+IEN1cnJlbmN5XG5cdFx0XHQvLyBQX0N1cnJlbmN5ID09PiBQX0N1cnJlbmN5XG5cdFx0XHRwb3NzaWJsZVNlbGVjdE9wdGlvbk5hbWVzLnB1c2gocHJvcGVydHlOYW1lKTtcblxuXHRcdFx0aWYgKHByb3BlcnR5TmFtZS5zdGFydHNXaXRoKFwiUF9cIikpIHtcblx0XHRcdFx0Ly8gUF9DdXJyZW5jeSA9PT4gJFBhcmFtZXRlci5DdXJyZW5jeVxuXHRcdFx0XHRwb3NzaWJsZVNlbGVjdE9wdGlvbk5hbWVzLnB1c2goYCRQYXJhbWV0ZXIuJHtwcm9wZXJ0eU5hbWUuc2xpY2UoMiwgcHJvcGVydHlOYW1lLmxlbmd0aCl9YCk7XG5cblx0XHRcdFx0Ly8gUF9DdXJyZW5jeSA9PT4gQ3VycmVuY3lcblx0XHRcdFx0cG9zc2libGVTZWxlY3RPcHRpb25OYW1lcy5wdXNoKHByb3BlcnR5TmFtZS5zbGljZSgyLCBwcm9wZXJ0eU5hbWUubGVuZ3RoKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBDdXJyZW5jeSA9PT4gJFBhcmFtZXRlci5QX0N1cnJlbmN5XG5cdFx0XHRcdHBvc3NpYmxlU2VsZWN0T3B0aW9uTmFtZXMucHVzaChgJFBhcmFtZXRlci5QXyR7cHJvcGVydHlOYW1lfWApO1xuXG5cdFx0XHRcdC8vIEN1cnJlbmN5ID09PiBQX0N1cnJlbmN5XG5cdFx0XHRcdHBvc3NpYmxlU2VsZWN0T3B0aW9uTmFtZXMucHVzaChgUF8ke3Byb3BlcnR5TmFtZX1gKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTmFtZSA9PiBOYW1lXG5cdFx0XHRwb3NzaWJsZVNlbGVjdE9wdGlvbk5hbWVzLnB1c2gocHJvcGVydHlOYW1lKTtcblx0XHRcdHBvc3NpYmxlU2VsZWN0T3B0aW9uTmFtZXMucHVzaChgJFBhcmFtZXRlci4ke3Byb3BlcnR5TmFtZX1gKTtcblxuXHRcdFx0aWYgKHByb3BlcnR5TmFtZS5zdGFydHNXaXRoKFwiUF9cIikpIHtcblx0XHRcdFx0Ly8gUF9OYW1lID0+IE5hbWVcblx0XHRcdFx0Y29uc3QgdGVtcDEgPSBwcm9wZXJ0eU5hbWUuc2xpY2UoMiwgcHJvcGVydHlOYW1lLmxlbmd0aCk7XG5cblx0XHRcdFx0Ly8gTmFtZSA9PiAkUGFyYW1ldGVyLk5hbWVcblx0XHRcdFx0cG9zc2libGVTZWxlY3RPcHRpb25OYW1lcy5wdXNoKGAkUGFyYW1ldGVyLiR7dGVtcDF9YCk7XG5cblx0XHRcdFx0Ly8gTmFtZSA9PiBOYW1lXG5cdFx0XHRcdHBvc3NpYmxlU2VsZWN0T3B0aW9uTmFtZXMucHVzaCh0ZW1wMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBOYW1lID0+IFBfTmFtZVxuXHRcdFx0XHRjb25zdCB0ZW1wMiA9IGBQXyR7cHJvcGVydHlOYW1lfWA7XG5cblx0XHRcdFx0Ly8gUF9OYW1lID0+ICRQYXJhbWV0ZXIuUF9OYW1lXG5cdFx0XHRcdHBvc3NpYmxlU2VsZWN0T3B0aW9uTmFtZXMucHVzaChgJFBhcmFtZXRlci4ke3RlbXAyfWApO1xuXG5cdFx0XHRcdC8vIFBfTmFtZSA9PiBQX05hbWVcblx0XHRcdFx0cG9zc2libGVTZWxlY3RPcHRpb25OYW1lcy5wdXNoKHRlbXAyKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRsZXQgc2VsZWN0T3B0aW9uTmFtZSA9IFwiXCI7XG5cdFx0Ly8gRmluZCB0aGUgY29ycmVjdCBzZWxlY3Qgb3B0aW9uIG5hbWUgYmFzZWQgb24gdGhlIHByaW9yaXR5XG5cdFx0cG9zc2libGVTZWxlY3RPcHRpb25OYW1lcy5zb21lKCh0ZXN0TmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0XHRjb25zdCBwYXRoVG9DaGVjayA9IG5hdmlnYXRpb25QYXRoID8gYCR7bmF2aWdhdGlvblBhdGh9LiR7dGVzdE5hbWV9YCA6IHRlc3ROYW1lO1xuXHRcdFx0Ly8gTmFtZSA9PiBOYW1lXG5cdFx0XHQvLyBOYW1lID0+IF9JdGVtLk5hbWUgKGluY2FzZSBfSXRlbSBpcyBuYXZpZ2F0aW9uUGF0aClcblxuXHRcdFx0cmV0dXJuIHNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmluY2x1ZGVzKHBhdGhUb0NoZWNrKSA/IChzZWxlY3RPcHRpb25OYW1lID0gcGF0aFRvQ2hlY2spIDogZmFsc2U7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gc2VsZWN0T3B0aW9uTmFtZTtcblx0fSxcblxuXHQvKipcblx0ICogQ29udmVydCBzZWxlY3Qgb3B0aW9ucyB0byBwcm9wZXJ0eSBjb25kaXRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udmVyc2lvbkluZm8gUHJvcGVydHkgaW5mbyB1c2VkIGZvciBjb252ZXJzaW9uXG5cdCAqIEBwYXJhbSBzZWxlY3RPcHRpb25OYW1lIFNlbGVjdCBvcHRpb24gbmFtZVxuXHQgKiBAcGFyYW0gaXNQYXJhbWV0ZXIgQm9vbGVhbiB3aGljaCBkZXRlcm1pbmVzIGlmIGEgcHJvcGVydHkgaXMgcGFyYW1ldGVyaXplZFxuXHQgKiBAcmV0dXJucyBUaGUgY29uZGl0aW9ucyBvZiBhIHByb3BlcnR5IGZvciBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRfZ2V0UHJvcGVydHlDb25kaXRpb25zOiBmdW5jdGlvbiAoY29udmVyc2lvbkluZm86IFByb3BlcnR5Q29udmVyc2lvbkluZm8sIHNlbGVjdE9wdGlvbk5hbWU6IHN0cmluZywgaXNQYXJhbWV0ZXI/OiBib29sZWFuKSB7XG5cdFx0Y29uc3QgeyBmaWx0ZXJCYXJJbmZvLCBwcm9wZXJ0eU1ldGFkYXRhLCBzZWxlY3Rpb25WYXJpYW50LCBwcm9wZXJ0eUNvbnRleHRQYXRoLCBwcm9wZXJ0eU5hbWUgfSA9IGNvbnZlcnNpb25JbmZvO1xuXHRcdGNvbnN0IHNlbGVjdE9wdGlvbnMgPSBzZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbihzZWxlY3RPcHRpb25OYW1lKTtcblx0XHRjb25zdCB7IG1ldGFNb2RlbCB9ID0gZmlsdGVyQmFySW5mbztcblxuXHRcdGxldCBjb25kaXRpb25PYmplY3RzOiBDb25kaXRpb25PYmplY3RbXSA9IFtdO1xuXHRcdGlmIChzZWxlY3RPcHRpb25zPy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IHNlbWFudGljRGF0ZU9wZXJhdG9yczogc3RyaW5nW10gPSBzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuX2dldFNlbWFudGljRGF0ZU9wZXJhdG9ycyhjb252ZXJzaW9uSW5mbywgaXNQYXJhbWV0ZXIpO1xuXHRcdFx0Y29uc3QgcHJvcGVydHlFbnRpdHlTZXRQYXRoID0gcHJvcGVydHlDb250ZXh0UGF0aC5zdWJzdHJpbmcoMCwgcHJvcGVydHlDb250ZXh0UGF0aC5sZW5ndGggLSAxKTtcblxuXHRcdFx0Y29uc3QgdmFsaWRPcGVyYXRvcnMgPSBpc1BhcmFtZXRlclxuXHRcdFx0XHQ/IFtcIkVRXCJdXG5cdFx0XHRcdDogQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkocHJvcGVydHlOYW1lLCBwcm9wZXJ0eUVudGl0eVNldFBhdGgsIG1ldGFNb2RlbCk7XG5cblx0XHRcdC8vIG11bHRpcGxlIHNlbGVjdCBvcHRpb25zID0+IG11bHRpcGxlIGNvbmRpdGlvbnNcblx0XHRcdGNvbmRpdGlvbk9iamVjdHMgPSB0aGlzLl9nZXRDb25kaXRpb25zRnJvbVNlbGVjdE9wdGlvbnMoXG5cdFx0XHRcdHNlbGVjdE9wdGlvbnMsXG5cdFx0XHRcdHByb3BlcnR5TWV0YWRhdGEsXG5cdFx0XHRcdHZhbGlkT3BlcmF0b3JzLFxuXHRcdFx0XHRzZW1hbnRpY0RhdGVPcGVyYXRvcnMsXG5cdFx0XHRcdGlzUGFyYW1ldGVyXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29uZGl0aW9uT2JqZWN0cztcblx0fSxcblxuXHQvKipcblx0ICogRmV0Y2ggc2VtYW50aWMgZGF0ZSBvcGVyYXRvcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb252ZXJzaW9uSW5mbyBPYmplY3Qgd2hpY2ggaXMgdXNlZCBmb3IgY29udmVyc2lvblxuXHQgKiBAcGFyYW0gaXNQYXJhbWV0ZXIgQm9vbGVhbiB3aGljaCBkZXRlcm1pbmVzIGlmIGEgcHJvcGVydHkgaXMgcGFyYW1ldGVyaXplZFxuXHQgKiBAcmV0dXJucyBUaGUgc2VtYW50aWMgZGF0ZSBvcGVyYXRvcnMgc3VwcG9ydGVkIGZvciBhIHByb3BlcnR5XG5cdCAqL1xuXHRfZ2V0U2VtYW50aWNEYXRlT3BlcmF0b3JzOiBmdW5jdGlvbiAoY29udmVyc2lvbkluZm86IFByb3BlcnR5Q29udmVyc2lvbkluZm8sIGlzUGFyYW1ldGVyPzogYm9vbGVhbikge1xuXHRcdGNvbnN0IHsgZmlsdGVyQmFySW5mbywgcHJvcGVydHlNZXRhZGF0YSwgcHJvcGVydHlOYW1lLCBwcm9wZXJ0eUNvbnRleHRQYXRoIH0gPSBjb252ZXJzaW9uSW5mbztcblx0XHRjb25zdCBjb25kaXRpb25QYXRoID0gcHJvcGVydHlNZXRhZGF0YS5uYW1lO1xuXHRcdGxldCBzZW1hbnRpY0RhdGVPcGVyYXRvcnM6IHN0cmluZ1tdID0gW107XG5cdFx0bGV0IHNldHRpbmdzOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgeyB1c2VTZW1hbnRpY0RhdGVSYW5nZSwgZmlsdGVyRmllbGRzQ29uZmlnLCBtZXRhTW9kZWwgfSA9IGZpbHRlckJhckluZm87XG5cdFx0aWYgKHVzZVNlbWFudGljRGF0ZVJhbmdlKSB7XG5cdFx0XHRpZiAoaXNQYXJhbWV0ZXIpIHtcblx0XHRcdFx0c2VtYW50aWNEYXRlT3BlcmF0b3JzID0gW1wiRVFcIl07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eUVudGl0eVNldFBhdGggPSBwcm9wZXJ0eUNvbnRleHRQYXRoLnN1YnN0cmluZygwLCBwcm9wZXJ0eUNvbnRleHRQYXRoLmxlbmd0aCAtIDEpO1xuXHRcdFx0XHRzZXR0aW5ncyA9IHNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5fZ2V0UHJvcGVydHlGaWx0ZXJDb25maWd1cmF0aW9uU2V0dGluZyhjb25kaXRpb25QYXRoLCBmaWx0ZXJGaWVsZHNDb25maWcpO1xuXHRcdFx0XHRzZW1hbnRpY0RhdGVPcGVyYXRvcnMgPSBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRwcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdFx0cHJvcGVydHlFbnRpdHlTZXRQYXRoLFxuXHRcdFx0XHRcdG1ldGFNb2RlbCxcblx0XHRcdFx0XHQoT0RBVEFfVFlQRV9NQVBQSU5HIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4pW3Byb3BlcnR5TWV0YWRhdGEuZGF0YVR5cGVdLFxuXHRcdFx0XHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdHNldHRpbmdzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzZW1hbnRpY0RhdGVPcGVyYXRvcnM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCB0aGUgZmlsdGVyIGNvbmRpdGlvbnMgZnJvbSBzZWxlY3Rpb24gb3B0aW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHNlbGVjdE9wdGlvbnMgU2VsZWN0IG9wdGlvbnMgYXJyYXlcblx0ICogQHBhcmFtIHByb3BlcnR5TWV0YWRhdGEgUHJvcGVydHkgbWV0YWRhdGEgaW5mb3JtYXRpb25cblx0ICogQHBhcmFtIHZhbGlkT3BlcmF0b3JzIEFsbCB2YWxpZCBvcGVyYXRvcnNcblx0ICogQHBhcmFtIHNlbWFudGljRGF0ZU9wZXJhdG9ycyBTZW1hbnRpYyBkYXRlIG9wZXJhdG9yc1xuXHQgKiBAcGFyYW0gaXNQYXJhbWV0ZXIgQm9vbGVhbiB3aGljaCBkZXRlcm1pbmVzIGlmIGEgcHJvcGVydHkgaXMgcGFyYW1ldGVyaXplZFxuXHQgKiBAcmV0dXJucyBDb252ZXJ0ZWQgZmlsdGVyIGNvbmRpdGlvbnNcblx0ICovXG5cdF9nZXRDb25kaXRpb25zRnJvbVNlbGVjdE9wdGlvbnM6IGZ1bmN0aW9uIChcblx0XHRzZWxlY3RPcHRpb25zOiBTZWxlY3RPcHRpb25bXSxcblx0XHRwcm9wZXJ0eU1ldGFkYXRhOiBGaWx0ZXJGaWVsZFByb3BlcnR5SW5mbyB8IHVuZGVmaW5lZCxcblx0XHR2YWxpZE9wZXJhdG9yczogc3RyaW5nW10sXG5cdFx0c2VtYW50aWNEYXRlT3BlcmF0b3JzOiBzdHJpbmdbXSxcblx0XHRpc1BhcmFtZXRlcj86IGJvb2xlYW5cblx0KSB7XG5cdFx0bGV0IGNvbmRpdGlvbk9iamVjdHM6IENvbmRpdGlvbk9iamVjdFtdID0gW107XG5cdFx0Ly8gQ3JlYXRlIGNvbmRpdGlvbnMgZm9yIGFsbCB0aGUgc2VsZWN0T3B0aW9ucyBvZiB0aGUgcHJvcGVydHlcblx0XHRpZiAoc2VsZWN0T3B0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGNvbmRpdGlvbk9iamVjdHMgPSBpc1BhcmFtZXRlclxuXHRcdFx0XHQ/IHNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5fYWRkQ29uZGl0aW9uRnJvbVNlbGVjdE9wdGlvbihcblx0XHRcdFx0XHRcdHByb3BlcnR5TWV0YWRhdGEsXG5cdFx0XHRcdFx0XHR2YWxpZE9wZXJhdG9ycyxcblx0XHRcdFx0XHRcdHNlbWFudGljRGF0ZU9wZXJhdG9ycyxcblx0XHRcdFx0XHRcdGNvbmRpdGlvbk9iamVjdHMsXG5cdFx0XHRcdFx0XHRzZWxlY3RPcHRpb25zWzBdXG5cdFx0XHRcdCAgKVxuXHRcdFx0XHQ6IHNlbGVjdE9wdGlvbnMucmVkdWNlKFxuXHRcdFx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudFRvU3RhdGVGaWx0ZXJzLl9hZGRDb25kaXRpb25Gcm9tU2VsZWN0T3B0aW9uLmJpbmQoXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5TWV0YWRhdGEsXG5cdFx0XHRcdFx0XHRcdHZhbGlkT3BlcmF0b3JzLFxuXHRcdFx0XHRcdFx0XHRzZW1hbnRpY0RhdGVPcGVyYXRvcnNcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRjb25kaXRpb25PYmplY3RzXG5cdFx0XHRcdCAgKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbmRpdGlvbk9iamVjdHM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEN1bXVsYXRpdmVseSBhZGQgc2VsZWN0IG9wdGlvbiB0byBjb25kaXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU1ldGFkYXRhIFByb3BlcnR5IG1ldGFkYXRhIGluZm9ybWF0aW9uXG5cdCAqIEBwYXJhbSB2YWxpZE9wZXJhdG9ycyBPcGVyYXRvcnMgZm9yIGFsbCB0aGUgZGF0YSB0eXBlc1xuXHQgKiBAcGFyYW0gc2VtYW50aWNEYXRlT3BlcmF0b3JzIE9wZXJhdG9ycyBmb3IgdGhlIERhdGUgdHlwZVxuXHQgKiBAcGFyYW0gY3VtdWxhdGl2ZUNvbmRpdGlvbnMgRmlsdGVyIGNvbmRpdGlvbnNcblx0ICogQHBhcmFtIHNlbGVjdE9wdGlvbiBTZWxlY3RvcHRpb24gb2Ygc2VsZWN0aW9uIHZhcmlhbnRcblx0ICogQHJldHVybnMgVGhlIGZpbHRlciBjb25kaXRpb25zXG5cdCAqL1xuXHRfYWRkQ29uZGl0aW9uRnJvbVNlbGVjdE9wdGlvbjogZnVuY3Rpb24gKFxuXHRcdHByb3BlcnR5TWV0YWRhdGE6IEZpbHRlckZpZWxkUHJvcGVydHlJbmZvIHwgRmlsdGVyRmllbGRQcm9wZXJ0eUluZm9bXSB8IHVuZGVmaW5lZCxcblx0XHR2YWxpZE9wZXJhdG9yczogc3RyaW5nW10sXG5cdFx0c2VtYW50aWNEYXRlT3BlcmF0b3JzOiBzdHJpbmdbXSxcblx0XHRjdW11bGF0aXZlQ29uZGl0aW9uczogQ29uZGl0aW9uT2JqZWN0W10sXG5cdFx0c2VsZWN0T3B0aW9uOiBTZWxlY3RPcHRpb25cblx0KSB7XG5cdFx0Y29uc3QgdmFsaWRUeXBlID0ge1xuXHRcdFx0dHlwZTogXCJcIlxuXHRcdH07XG5cdFx0dmFsaWRUeXBlLnR5cGUgPSBzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnMuX2dldEVkbVR5cGUoXG5cdFx0XHQocHJvcGVydHlNZXRhZGF0YSBhcyB1bmtub3duIGFzIHsgdHlwZUNvbmZpZzogeyBjbGFzc05hbWU6IHN0cmluZyB9IH0pLnR5cGVDb25maWcuY2xhc3NOYW1lXG5cdFx0KTtcblx0XHRjb25zdCBjb25kaXRpb24gPSBnZXRDb25kaXRpb25zKHNlbGVjdE9wdGlvbiwgdmFsaWRUeXBlKTtcblx0XHRpZiAoXG5cdFx0XHRzZWxlY3RPcHRpb24uU2VtYW50aWNEYXRlcyAmJlxuXHRcdFx0c2VtYW50aWNEYXRlT3BlcmF0b3JzLmxlbmd0aCAmJlxuXHRcdFx0c2VtYW50aWNEYXRlT3BlcmF0b3JzLmluY2x1ZGVzKHNlbGVjdE9wdGlvbi5TZW1hbnRpY0RhdGVzLm9wZXJhdG9yKVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgc2VtYW50aWNEYXRlcyA9IHNlbGVjdGlvblZhcmlhbnRUb1N0YXRlRmlsdGVycy5fYWRkU2VtYW50aWNEYXRlc1RvQ29uZGl0aW9ucyhzZWxlY3RPcHRpb24uU2VtYW50aWNEYXRlcyk7XG5cdFx0XHRpZiAoT2JqZWN0LmtleXMoc2VtYW50aWNEYXRlcykubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjdW11bGF0aXZlQ29uZGl0aW9ucy5wdXNoKHNlbWFudGljRGF0ZXMpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRpZiAodmFsaWRPcGVyYXRvcnMubGVuZ3RoID09PSAwIHx8IHZhbGlkT3BlcmF0b3JzLmluY2x1ZGVzKGNvbmRpdGlvbi5vcGVyYXRvcikpIHtcblx0XHRcdFx0Y3VtdWxhdGl2ZUNvbmRpdGlvbnMucHVzaChjb25kaXRpb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gY3VtdWxhdGl2ZUNvbmRpdGlvbnM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBmaWx0ZXIgY29uZGl0aW9ucyBmb3IgYSBwYXJhbWV0ZXIgcHJvcGVydHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBzZW1hbnRpY0RhdGVzIFNlbWFudGljIGRhdGUgaW5mb21hdGlvblxuXHQgKiBAcmV0dXJucyBUaGUgZmlsdGVyIGNvbmRpdGlvbnMgY29udGFpbmluZyBzZW1hbnRpYyBkYXRlc1xuXHQgKi9cblx0X2FkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnM6IChzZW1hbnRpY0RhdGVzOiBTZW1hbnRpY0RhdGVDb25maWd1cmF0aW9uKTogQ29uZGl0aW9uT2JqZWN0ID0+IHtcblx0XHRjb25zdCB2YWx1ZXM6IHVua25vd25bXSA9IFtdO1xuXHRcdGlmIChzZW1hbnRpY0RhdGVzLmhpZ2gpIHtcblx0XHRcdHZhbHVlcy5wdXNoKHNlbWFudGljRGF0ZXMuaGlnaCk7XG5cdFx0fVxuXHRcdGlmIChzZW1hbnRpY0RhdGVzLmxvdykge1xuXHRcdFx0dmFsdWVzLnB1c2goc2VtYW50aWNEYXRlcy5sb3cpO1xuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0dmFsdWVzOiB2YWx1ZXMsXG5cdFx0XHRvcGVyYXRvcjogc2VtYW50aWNEYXRlcy5vcGVyYXRvcixcblx0XHRcdGlzRW1wdHk6IHVuZGVmaW5lZFxuXHRcdH07XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBFRE0gdHlwZSBmcm9tIGRhdGEgdHlwZS5cblx0ICpcblx0ICogQHBhcmFtIGRhdGFUeXBlIFY0IG1vZGVsIGRhdGEgdHlwZVxuXHQgKiBAcmV0dXJucyBFRE0gdHlwZSBlcXVpdmFsZW50IG9mIGRhdGEgdHlwZVxuXHQgKi9cblx0X2dldEVkbVR5cGU6IChkYXRhVHlwZTogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0XHRjb25zdCBUWVBFX0VETV9NQVBQSU5HID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuXHRcdFx0T2JqZWN0LmVudHJpZXMoRURNX1RZUEVfTUFQUElORykubWFwKChbaywgdl0pID0+IFsodiBhcyB7IHR5cGU6IHVua25vd24gfSkudHlwZSwga10pXG5cdFx0KSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcblx0XHRyZXR1cm4gVFlQRV9FRE1fTUFQUElOR1tkYXRhVHlwZV0gYXMgc3RyaW5nO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZWxlY3Rpb25WYXJpYW50VG9TdGF0ZUZpbHRlcnM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7RUE4Q0EsTUFBTUEscUJBQStCLEdBQUcsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDO0VBRWpFLE1BQU1DLDhCQUE4QixHQUFHO0lBQ3RDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyw2QkFBNkIsRUFBR0MsU0FBb0IsSUFBOEI7TUFDakYsT0FBTztRQUNOQyxTQUFTLEVBQUVILDhCQUE4QixDQUFDSSxhQUFhLENBQUNGLFNBQVMsQ0FBQztRQUNsRUcsV0FBVyxFQUFFTCw4QkFBOEIsQ0FBQ00sZUFBZSxDQUFDSixTQUFTLENBQUM7UUFDdEVLLG9CQUFvQixFQUFFUCw4QkFBOEIsQ0FBQ1EsNkJBQTZCLENBQUNOLFNBQVMsQ0FBQztRQUM3Rk8sa0JBQWtCLEVBQUVULDhCQUE4QixDQUFDVSxzQkFBc0IsQ0FBQ1IsU0FBUztNQUNwRixDQUFDO0lBQ0YsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDUywyQkFBMkIsRUFBRSxNQUFPVCxTQUFvQixJQUFLO01BQzVELE1BQU1BLFNBQVMsQ0FBQ1UscUJBQXFCLEVBQUU7TUFDdkMsT0FBUVYsU0FBUyxDQUFDVyxrQkFBa0IsRUFBRSxDQUF1QkMsZUFBZSxDQUFDWixTQUFTLENBQUM7SUFDeEYsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ2EsbUJBQW1CLEVBQUUsVUFDcEJDLGdCQUFrQyxFQUNsQ0MsMEJBQW1ELEVBQ25EQyxzQkFBaUQsRUFDaEQ7TUFDRCxNQUFNO1FBQUViO01BQVksQ0FBQyxHQUFHWSwwQkFBMEI7TUFDbEQsTUFBTUUsVUFBNkMsR0FBRyxDQUFDLENBQUM7TUFFeERELHNCQUFzQixDQUFDRSxPQUFPLENBQUMsVUFBVUMsZ0JBQXlDLEVBQUU7UUFDbkYsSUFBSSxDQUFDdEIscUJBQXFCLENBQUN1QixRQUFRLENBQUNELGdCQUFnQixDQUFDRSxJQUFJLENBQUMsRUFBRTtVQUMzRCxJQUFJQyxvQkFBdUMsR0FBRyxFQUFFO1VBQ2hELE1BQU07WUFBRUMsYUFBYTtZQUFFQztVQUFlLENBQUMsR0FBR0wsZ0JBQWdCO1VBQzFELE1BQU1NLFFBQVEsR0FBR0YsYUFBYSxDQUFDRyxVQUFVLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztVQUNsRCxNQUFNQyxPQUFPLEdBQUdGLFFBQVEsQ0FBQ0csU0FBUyxDQUFDLENBQUMsRUFBRUgsUUFBUSxDQUFDSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7VUFDaEUsTUFBTUMsWUFBWSxHQUFHTCxRQUFRLENBQUNHLFNBQVMsQ0FBQ0gsUUFBUSxDQUFDSSxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDOztVQUV0RTtVQUNBLE1BQU1FLGNBQXNDLEdBQUc7WUFDOUNELFlBQVk7WUFDWkgsT0FBTztZQUNQSyxtQkFBbUIsRUFBRyxHQUFFN0IsV0FBWSxHQUFFd0IsT0FBUSxFQUFDO1lBQy9DUixnQkFBZ0I7WUFDaEJMLGdCQUFnQjtZQUNoQm1CLGFBQWEsRUFBRWxCO1VBQ2hCLENBQUM7VUFDRCxJQUFJSSxnQkFBZ0IsQ0FBQ2UsV0FBVyxJQUFJVixjQUFjLEVBQUU7WUFDbkQ7WUFDQU8sY0FBYyxDQUFDQyxtQkFBbUIsR0FBR1IsY0FBYyxDQUFDSSxTQUFTLENBQUMsQ0FBQyxFQUFFSixjQUFjLENBQUNLLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckdQLG9CQUFvQixHQUFHeEIsOEJBQThCLENBQUNxQywwQkFBMEIsQ0FBQ0osY0FBYyxDQUFDO1VBQ2pHLENBQUMsTUFBTSxJQUFJUixhQUFhLENBQUNILFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN2QztZQUNBRSxvQkFBb0IsR0FBR3hCLDhCQUE4QixDQUFDc0MsNEJBQTRCLENBQUNMLGNBQWMsQ0FBQztVQUNuRyxDQUFDLE1BQU07WUFDTjtZQUNBVCxvQkFBb0IsR0FBR3hCLDhCQUE4QixDQUFDdUMseUJBQXlCLENBQUNOLGNBQWMsQ0FBQztVQUNoRztVQUVBLElBQUlULG9CQUFvQixDQUFDZ0IsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNwQ3JCLFVBQVUsQ0FBQ00sYUFBYSxDQUFDLEdBQUdELG9CQUFvQjtVQUNqRDtRQUNEO01BQ0QsQ0FBQyxDQUFDO01BQ0YsT0FBT0wsVUFBVTtJQUNsQixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NmLGFBQWEsRUFBRSxVQUFVRixTQUFvQixFQUFFO01BQUE7TUFDOUMsOEJBQU9BLFNBQVMsQ0FBQ3VDLFFBQVEsRUFBRSx3REFBcEIsb0JBQXNCQyxZQUFZLEVBQUU7SUFDNUMsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDcEMsZUFBZSxFQUFFLFVBQVVKLFNBQW9CLEVBQUU7TUFDaEQsT0FBT0EsU0FBUyxDQUFDeUMsSUFBSSxDQUFDLFlBQVksQ0FBQztJQUNwQyxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLFlBQVksRUFBRSxVQUFVMUMsU0FBb0IsRUFBRTtNQUM3QyxNQUFNMkMsZ0JBQWdCLEdBQUczQyxTQUFTLENBQUN1QyxRQUFRLENBQUMsVUFBVSxDQUF5QjtNQUMvRSxPQUFPSSxnQkFBZ0IsQ0FBQ0MsT0FBTyxFQUFFO0lBQ2xDLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ3RDLDZCQUE2QixFQUFFLFVBQVVOLFNBQW9CLEVBQUU7TUFDOUQsT0FBT0EsU0FBUyxDQUFDeUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssTUFBTSxJQUFJekMsU0FBUyxDQUFDeUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLEtBQUssSUFBSTtJQUM1RyxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0ksc0NBQXNDLEVBQUUsVUFBVUMsUUFBZ0IsRUFBK0M7TUFBQTtNQUFBLElBQTdDdkMsa0JBQXNDLHVFQUFHLENBQUMsQ0FBQztNQUM5RyxPQUFPQSxrQkFBa0IsQ0FBQ3VDLFFBQVEsQ0FBQyw0QkFBR3ZDLGtCQUFrQixDQUFDdUMsUUFBUSxDQUFDLDBEQUE1QixzQkFBOEJDLFFBQVEsR0FBR0MsU0FBUztJQUN6RixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0N4QyxzQkFBc0IsRUFBR1IsU0FBb0IsSUFBeUI7TUFDckUsTUFBTWlELFFBQVEsR0FBR25ELDhCQUE4QixDQUFDNEMsWUFBWSxDQUFDMUMsU0FBUyxDQUFDO01BQ3ZFLE1BQU1rRCxNQUFNLEdBQUdELFFBQVEsQ0FBQ0Usb0JBQW9CO01BQzVDLE1BQU01QyxrQkFBa0IsR0FBRzJDLE1BQU0sSUFBS0EsTUFBTSxDQUFDLDZDQUE2QyxDQUFDLENBQUNFLFlBQW1DO01BQy9ILE9BQU83QyxrQkFBa0IsSUFBSSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDNEIsMEJBQTBCLEVBQUUsVUFBVUosY0FBc0MsRUFBRTtNQUM3RSxJQUFJc0IsZ0JBQW1DLEdBQUcsRUFBRTtNQUM1QyxNQUFNO1FBQUVsQyxnQkFBZ0I7UUFBRUw7TUFBaUIsQ0FBQyxHQUFHaUIsY0FBYztNQUM3RCxNQUFNUixhQUFhLEdBQUdKLGdCQUFnQixDQUFDRSxJQUFJO01BQzNDLE1BQU1pQyxnQkFBZ0IsR0FBR3hELDhCQUE4QixDQUFDeUQsb0JBQW9CLENBQUN6QyxnQkFBZ0IsRUFBRVMsYUFBYSxFQUFFLElBQUksQ0FBQztNQUNuSCxJQUFJK0IsZ0JBQWdCLEVBQUU7UUFDckJELGdCQUFnQixHQUFHdkQsOEJBQThCLENBQUMwRCxzQkFBc0IsQ0FBQ3pCLGNBQWMsRUFBRXVCLGdCQUFnQixFQUFFLElBQUksQ0FBQztNQUNqSDtNQUNBLE9BQU9ELGdCQUFnQjtJQUN4QixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NoQix5QkFBeUIsRUFBRSxVQUFVTixjQUFzQyxFQUFFO01BQzVFLE1BQU07UUFBRVosZ0JBQWdCO1FBQUVMO01BQWlCLENBQUMsR0FBR2lCLGNBQWM7TUFDN0QsTUFBTTBCLFlBQVksR0FBR3RDLGdCQUFnQixDQUFDRSxJQUFJO01BQzFDLE1BQU1pQyxnQkFBZ0IsR0FBR3hELDhCQUE4QixDQUFDeUQsb0JBQW9CLENBQUN6QyxnQkFBZ0IsRUFBRTJDLFlBQVksQ0FBQztNQUU1RyxJQUFJSixnQkFBbUMsR0FBRyxFQUFFO01BQzVDLElBQUlDLGdCQUFnQixFQUFFO1FBQ3JCRCxnQkFBZ0IsR0FBR3ZELDhCQUE4QixDQUFDMEQsc0JBQXNCLENBQUN6QixjQUFjLEVBQUV1QixnQkFBZ0IsRUFBRSxLQUFLLENBQUM7TUFDbEg7TUFDQSxPQUFPRCxnQkFBZ0I7SUFDeEIsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDakIsNEJBQTRCLEVBQUUsVUFBVUwsY0FBc0MsRUFBRTtNQUMvRSxNQUFNO1FBQUVFLGFBQWE7UUFBRW5CLGdCQUFnQjtRQUFFZ0IsWUFBWTtRQUFFSDtNQUFRLENBQUMsR0FBR0ksY0FBYztNQUNqRixNQUFNO1FBQUU1QjtNQUFZLENBQUMsR0FBRzhCLGFBQWE7TUFFckMsSUFBSW9CLGdCQUFtQyxHQUFHLEVBQUU7O01BRTVDO01BQ0E7TUFDQSxJQUFJSyxzQkFBc0IsR0FBSSxHQUFFdkQsV0FBVyxDQUFDeUIsU0FBUyxDQUFDLENBQUMsQ0FBRSxHQUFFRCxPQUFRLEVBQUMsQ0FBQ0QsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7TUFDekYsSUFBSTRCLGdCQUFnQixHQUFHeEQsOEJBQThCLENBQUN5RCxvQkFBb0IsQ0FDekV6QyxnQkFBZ0IsRUFDaEJnQixZQUFZLEVBQ1osS0FBSyxFQUNMNEIsc0JBQXNCLENBQ3RCO01BRUQsSUFBSSxDQUFDSixnQkFBZ0IsRUFBRTtRQUN0QjtRQUNBSSxzQkFBc0IsR0FBRy9CLE9BQU8sQ0FBQ0QsVUFBVSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUM7UUFDckQ0QixnQkFBZ0IsR0FBR3hELDhCQUE4QixDQUFDeUQsb0JBQW9CLENBQ3JFekMsZ0JBQWdCLEVBQ2hCZ0IsWUFBWSxFQUNaLEtBQUssRUFDTDRCLHNCQUFzQixDQUN0QjtNQUNGO01BRUEsSUFBSUosZ0JBQWdCLEVBQUU7UUFDckJELGdCQUFnQixHQUFHdkQsOEJBQThCLENBQUMwRCxzQkFBc0IsQ0FBQ3pCLGNBQWMsRUFBRXVCLGdCQUFnQixFQUFFLEtBQUssQ0FBQztNQUNsSDtNQUVBLE9BQU9ELGdCQUFnQjtJQUN4QixDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NFLG9CQUFvQixFQUFFLFVBQ3JCekMsZ0JBQWtDLEVBQ2xDZ0IsWUFBb0IsRUFDcEJJLFdBQXFCLEVBQ3JCeUIsY0FBdUIsRUFDdEI7TUFDRDtNQUNBLE1BQU1DLHlCQUFtQyxHQUFHLEVBQUU7TUFDOUMsTUFBTUMsMEJBQTBCLEdBQUcvQyxnQkFBZ0IsQ0FBQ2dELDZCQUE2QixFQUFFO01BRW5GLElBQUk1QixXQUFXLEVBQUU7UUFDaEI7UUFDQTtRQUNBMEIseUJBQXlCLENBQUNHLElBQUksQ0FBRSxjQUFhakMsWUFBYSxFQUFDLENBQUM7O1FBRTVEO1FBQ0E7UUFDQThCLHlCQUF5QixDQUFDRyxJQUFJLENBQUNqQyxZQUFZLENBQUM7UUFFNUMsSUFBSUEsWUFBWSxDQUFDa0MsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1VBQ2xDO1VBQ0FKLHlCQUF5QixDQUFDRyxJQUFJLENBQUUsY0FBYWpDLFlBQVksQ0FBQ21DLEtBQUssQ0FBQyxDQUFDLEVBQUVuQyxZQUFZLENBQUNRLE1BQU0sQ0FBRSxFQUFDLENBQUM7O1VBRTFGO1VBQ0FzQix5QkFBeUIsQ0FBQ0csSUFBSSxDQUFDakMsWUFBWSxDQUFDbUMsS0FBSyxDQUFDLENBQUMsRUFBRW5DLFlBQVksQ0FBQ1EsTUFBTSxDQUFDLENBQUM7UUFDM0UsQ0FBQyxNQUFNO1VBQ047VUFDQXNCLHlCQUF5QixDQUFDRyxJQUFJLENBQUUsZ0JBQWVqQyxZQUFhLEVBQUMsQ0FBQzs7VUFFOUQ7VUFDQThCLHlCQUF5QixDQUFDRyxJQUFJLENBQUUsS0FBSWpDLFlBQWEsRUFBQyxDQUFDO1FBQ3BEO01BQ0QsQ0FBQyxNQUFNO1FBQ047UUFDQThCLHlCQUF5QixDQUFDRyxJQUFJLENBQUNqQyxZQUFZLENBQUM7UUFDNUM4Qix5QkFBeUIsQ0FBQ0csSUFBSSxDQUFFLGNBQWFqQyxZQUFhLEVBQUMsQ0FBQztRQUU1RCxJQUFJQSxZQUFZLENBQUNrQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7VUFDbEM7VUFDQSxNQUFNRSxLQUFLLEdBQUdwQyxZQUFZLENBQUNtQyxLQUFLLENBQUMsQ0FBQyxFQUFFbkMsWUFBWSxDQUFDUSxNQUFNLENBQUM7O1VBRXhEO1VBQ0FzQix5QkFBeUIsQ0FBQ0csSUFBSSxDQUFFLGNBQWFHLEtBQU0sRUFBQyxDQUFDOztVQUVyRDtVQUNBTix5QkFBeUIsQ0FBQ0csSUFBSSxDQUFDRyxLQUFLLENBQUM7UUFDdEMsQ0FBQyxNQUFNO1VBQ047VUFDQSxNQUFNQyxLQUFLLEdBQUksS0FBSXJDLFlBQWEsRUFBQzs7VUFFakM7VUFDQThCLHlCQUF5QixDQUFDRyxJQUFJLENBQUUsY0FBYUksS0FBTSxFQUFDLENBQUM7O1VBRXJEO1VBQ0FQLHlCQUF5QixDQUFDRyxJQUFJLENBQUNJLEtBQUssQ0FBQztRQUN0QztNQUNEO01BRUEsSUFBSWIsZ0JBQWdCLEdBQUcsRUFBRTtNQUN6QjtNQUNBTSx5QkFBeUIsQ0FBQ1EsSUFBSSxDQUFFQyxRQUFnQixJQUFLO1FBQ3BELE1BQU1DLFdBQVcsR0FBR1gsY0FBYyxHQUFJLEdBQUVBLGNBQWUsSUFBR1UsUUFBUyxFQUFDLEdBQUdBLFFBQVE7UUFDL0U7UUFDQTs7UUFFQSxPQUFPUiwwQkFBMEIsQ0FBQ3pDLFFBQVEsQ0FBQ2tELFdBQVcsQ0FBQyxHQUFJaEIsZ0JBQWdCLEdBQUdnQixXQUFXLEdBQUksS0FBSztNQUNuRyxDQUFDLENBQUM7TUFFRixPQUFPaEIsZ0JBQWdCO0lBQ3hCLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NFLHNCQUFzQixFQUFFLFVBQVV6QixjQUFzQyxFQUFFdUIsZ0JBQXdCLEVBQUVwQixXQUFxQixFQUFFO01BQzFILE1BQU07UUFBRUQsYUFBYTtRQUFFZCxnQkFBZ0I7UUFBRUwsZ0JBQWdCO1FBQUVrQixtQkFBbUI7UUFBRUY7TUFBYSxDQUFDLEdBQUdDLGNBQWM7TUFDL0csTUFBTXdDLGFBQWEsR0FBR3pELGdCQUFnQixDQUFDMEQsZUFBZSxDQUFDbEIsZ0JBQWdCLENBQUM7TUFDeEUsTUFBTTtRQUFFckQ7TUFBVSxDQUFDLEdBQUdnQyxhQUFhO01BRW5DLElBQUlvQixnQkFBbUMsR0FBRyxFQUFFO01BQzVDLElBQUlrQixhQUFhLGFBQWJBLGFBQWEsZUFBYkEsYUFBYSxDQUFFakMsTUFBTSxFQUFFO1FBQzFCLE1BQU1tQyxxQkFBK0IsR0FBRzNFLDhCQUE4QixDQUFDNEUseUJBQXlCLENBQUMzQyxjQUFjLEVBQUVHLFdBQVcsQ0FBQztRQUM3SCxNQUFNeUMscUJBQXFCLEdBQUczQyxtQkFBbUIsQ0FBQ0osU0FBUyxDQUFDLENBQUMsRUFBRUksbUJBQW1CLENBQUNNLE1BQU0sR0FBRyxDQUFDLENBQUM7UUFFOUYsTUFBTXNDLGNBQWMsR0FBRzFDLFdBQVcsR0FDL0IsQ0FBQyxJQUFJLENBQUMsR0FDTjJDLFdBQVcsQ0FBQ0MsdUJBQXVCLENBQUNoRCxZQUFZLEVBQUU2QyxxQkFBcUIsRUFBRTFFLFNBQVMsQ0FBQzs7UUFFdEY7UUFDQW9ELGdCQUFnQixHQUFHLElBQUksQ0FBQzBCLCtCQUErQixDQUN0RFIsYUFBYSxFQUNicEQsZ0JBQWdCLEVBQ2hCeUQsY0FBYyxFQUNkSCxxQkFBcUIsRUFDckJ2QyxXQUFXLENBQ1g7TUFDRjtNQUNBLE9BQU9tQixnQkFBZ0I7SUFDeEIsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NxQix5QkFBeUIsRUFBRSxVQUFVM0MsY0FBc0MsRUFBRUcsV0FBcUIsRUFBRTtNQUNuRyxNQUFNO1FBQUVELGFBQWE7UUFBRWQsZ0JBQWdCO1FBQUVXLFlBQVk7UUFBRUU7TUFBb0IsQ0FBQyxHQUFHRCxjQUFjO01BQzdGLE1BQU1SLGFBQWEsR0FBR0osZ0JBQWdCLENBQUNFLElBQUk7TUFDM0MsSUFBSW9ELHFCQUErQixHQUFHLEVBQUU7TUFDeEMsSUFBSTFCLFFBQTRCO01BQ2hDLE1BQU07UUFBRTFDLG9CQUFvQjtRQUFFRSxrQkFBa0I7UUFBRU47TUFBVSxDQUFDLEdBQUdnQyxhQUFhO01BQzdFLElBQUk1QixvQkFBb0IsRUFBRTtRQUN6QixJQUFJNkIsV0FBVyxFQUFFO1VBQ2hCdUMscUJBQXFCLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFDL0IsQ0FBQyxNQUFNO1VBQ04sTUFBTUUscUJBQXFCLEdBQUczQyxtQkFBbUIsQ0FBQ0osU0FBUyxDQUFDLENBQUMsRUFBRUksbUJBQW1CLENBQUNNLE1BQU0sR0FBRyxDQUFDLENBQUM7VUFDOUZTLFFBQVEsR0FBR2pELDhCQUE4QixDQUFDK0Msc0NBQXNDLENBQUN0QixhQUFhLEVBQUVoQixrQkFBa0IsQ0FBQztVQUNuSGtFLHFCQUFxQixHQUFHSSxXQUFXLENBQUNDLHVCQUF1QixDQUMxRGhELFlBQVksRUFDWjZDLHFCQUFxQixFQUNyQjFFLFNBQVMsRUFDUitFLGtCQUFrQixDQUE0QjdELGdCQUFnQixDQUFDOEQsUUFBUSxDQUFDLEVBQ3pFNUUsb0JBQW9CLEVBQ3BCMEMsUUFBUSxDQUNSO1FBQ0Y7TUFDRDtNQUNBLE9BQU8wQixxQkFBcUI7SUFDN0IsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NNLCtCQUErQixFQUFFLFVBQ2hDUixhQUE2QixFQUM3QnBELGdCQUFxRCxFQUNyRHlELGNBQXdCLEVBQ3hCSCxxQkFBK0IsRUFDL0J2QyxXQUFxQixFQUNwQjtNQUNELElBQUltQixnQkFBbUMsR0FBRyxFQUFFO01BQzVDO01BQ0EsSUFBSWtCLGFBQWEsQ0FBQ2pDLE1BQU0sRUFBRTtRQUN6QmUsZ0JBQWdCLEdBQUduQixXQUFXLEdBQzNCcEMsOEJBQThCLENBQUNvRiw2QkFBNkIsQ0FDNUQvRCxnQkFBZ0IsRUFDaEJ5RCxjQUFjLEVBQ2RILHFCQUFxQixFQUNyQnBCLGdCQUFnQixFQUNoQmtCLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FDZixHQUNEQSxhQUFhLENBQUNZLE1BQU0sQ0FDcEJyRiw4QkFBOEIsQ0FBQ29GLDZCQUE2QixDQUFDRSxJQUFJLENBQ2hFLElBQUksRUFDSmpFLGdCQUFnQixFQUNoQnlELGNBQWMsRUFDZEgscUJBQXFCLENBQ3JCLEVBQ0RwQixnQkFBZ0IsQ0FDZjtNQUNMO01BQ0EsT0FBT0EsZ0JBQWdCO0lBQ3hCLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDNkIsNkJBQTZCLEVBQUUsVUFDOUIvRCxnQkFBaUYsRUFDakZ5RCxjQUF3QixFQUN4QkgscUJBQStCLEVBQy9CWSxvQkFBdUMsRUFDdkNDLFlBQTBCLEVBQ3pCO01BQ0QsTUFBTUMsU0FBUyxHQUFHO1FBQ2pCQyxJQUFJLEVBQUU7TUFDUCxDQUFDO01BQ0RELFNBQVMsQ0FBQ0MsSUFBSSxHQUFHMUYsOEJBQThCLENBQUMyRixXQUFXLENBQ3pEdEUsZ0JBQWdCLENBQXNEdUUsVUFBVSxDQUFDQyxTQUFTLENBQzNGO01BQ0QsTUFBTUMsU0FBUyxHQUFHQyxhQUFhLENBQUNQLFlBQVksRUFBRUMsU0FBUyxDQUFDO01BQ3hELElBQ0NELFlBQVksQ0FBQ1EsYUFBYSxJQUMxQnJCLHFCQUFxQixDQUFDbkMsTUFBTSxJQUM1Qm1DLHFCQUFxQixDQUFDckQsUUFBUSxDQUFDa0UsWUFBWSxDQUFDUSxhQUFhLENBQUNDLFFBQVEsQ0FBQyxFQUNsRTtRQUNELE1BQU1DLGFBQWEsR0FBR2xHLDhCQUE4QixDQUFDbUcsNkJBQTZCLENBQUNYLFlBQVksQ0FBQ1EsYUFBYSxDQUFDO1FBQzlHLElBQUlJLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDSCxhQUFhLENBQUMsQ0FBQzFELE1BQU0sR0FBRyxDQUFDLEVBQUU7VUFDMUMrQyxvQkFBb0IsQ0FBQ3RCLElBQUksQ0FBQ2lDLGFBQWEsQ0FBQztRQUN6QztNQUNELENBQUMsTUFBTSxJQUFJSixTQUFTLEVBQUU7UUFDckIsSUFBSWhCLGNBQWMsQ0FBQ3RDLE1BQU0sS0FBSyxDQUFDLElBQUlzQyxjQUFjLENBQUN4RCxRQUFRLENBQUN3RSxTQUFTLENBQUNHLFFBQVEsQ0FBQyxFQUFFO1VBQy9FVixvQkFBb0IsQ0FBQ3RCLElBQUksQ0FBQzZCLFNBQVMsQ0FBQztRQUNyQztNQUNEO01BQ0EsT0FBT1Asb0JBQW9CO0lBQzVCLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ1ksNkJBQTZCLEVBQUdELGFBQXdDLElBQXNCO01BQzdGLE1BQU1JLE1BQWlCLEdBQUcsRUFBRTtNQUM1QixJQUFJSixhQUFhLENBQUNLLElBQUksRUFBRTtRQUN2QkQsTUFBTSxDQUFDckMsSUFBSSxDQUFDaUMsYUFBYSxDQUFDSyxJQUFJLENBQUM7TUFDaEM7TUFDQSxJQUFJTCxhQUFhLENBQUNNLEdBQUcsRUFBRTtRQUN0QkYsTUFBTSxDQUFDckMsSUFBSSxDQUFDaUMsYUFBYSxDQUFDTSxHQUFHLENBQUM7TUFDL0I7TUFDQSxPQUFPO1FBQ05GLE1BQU0sRUFBRUEsTUFBTTtRQUNkTCxRQUFRLEVBQUVDLGFBQWEsQ0FBQ0QsUUFBUTtRQUNoQ1EsT0FBTyxFQUFFdkQ7TUFDVixDQUFDO0lBQ0YsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDeUMsV0FBVyxFQUFHUixRQUFnQixJQUFhO01BQzFDLE1BQU11QixnQkFBZ0IsR0FBR04sTUFBTSxDQUFDTyxXQUFXLENBQzFDUCxNQUFNLENBQUNRLE9BQU8sQ0FBQ0MsZ0JBQWdCLENBQUMsQ0FBQ0MsR0FBRyxDQUFDO1FBQUEsSUFBQyxDQUFDQyxDQUFDLEVBQUVDLENBQUMsQ0FBQztRQUFBLE9BQUssQ0FBRUEsQ0FBQyxDQUF1QnRCLElBQUksRUFBRXFCLENBQUMsQ0FBQztNQUFBLEVBQUMsQ0FDekQ7TUFDNUIsT0FBT0wsZ0JBQWdCLENBQUN2QixRQUFRLENBQUM7SUFDbEM7RUFDRCxDQUFDO0VBQUMsT0FFYW5GLDhCQUE4QjtBQUFBIn0=
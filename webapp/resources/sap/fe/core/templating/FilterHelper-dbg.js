/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/type/EDM", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enum/ConditionValidated"], function (Log, EDM, Condition, ConditionValidated) {
  "use strict";

  var _exports = {};
  var isTypeFilterable = EDM.isTypeFilterable;
  const oExcludeMap = {
    Contains: "NotContains",
    StartsWith: "NotStartsWith",
    EndsWith: "NotEndsWith",
    Empty: "NotEmpty",
    NotEmpty: "Empty",
    LE: "NOTLE",
    GE: "NOTGE",
    LT: "NOTLT",
    GT: "NOTGT",
    BT: "NOTBT",
    NE: "EQ",
    EQ: "NE"
  };
  function _getDateTimeOffsetCompliantValue(sValue) {
    let oValue;
    if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)) {
      oValue = sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})\+(\d{1,4})/)[0];
    } else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)) {
      oValue = `${sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0]}+0000`;
    } else if (sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)) {
      oValue = `${sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0]}T00:00:00+0000`;
    } else if (sValue.indexOf("Z") === sValue.length - 1) {
      oValue = `${sValue.split("Z")[0]}+0100`;
    } else {
      oValue = undefined;
    }
    return oValue;
  }
  _exports._getDateTimeOffsetCompliantValue = _getDateTimeOffsetCompliantValue;
  function _getDateCompliantValue(sValue) {
    return sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/) ? sValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)[0] : sValue.match(/^(\d{8})/) && sValue.match(/^(\d{8})/)[0];
  }

  /**
   * Method to get the compliant value type based on the data type.
   *
   * @param  sValue Raw value
   * @param  sType The property type
   * @returns Value to be propagated to the condition.
   */
  _exports._getDateCompliantValue = _getDateCompliantValue;
  function getTypeCompliantValue(sValue, sType) {
    let oValue;
    if (!isTypeFilterable(sType)) {
      return undefined;
    }
    oValue = sValue;
    switch (sType) {
      case "Edm.Boolean":
        if (typeof sValue === "boolean") {
          oValue = sValue;
        } else {
          oValue = sValue === "true" || (sValue === "false" ? false : undefined);
        }
        break;
      case "Edm.Double":
      case "Edm.Single":
        oValue = isNaN(sValue) ? undefined : parseFloat(sValue);
        break;
      case "Edm.Byte":
      case "Edm.Int16":
      case "Edm.Int32":
      case "Edm.SByte":
        oValue = isNaN(sValue) ? undefined : parseInt(sValue, 10);
        break;
      case "Edm.Date":
        oValue = _getDateCompliantValue(sValue);
        break;
      case "Edm.DateTimeOffset":
        oValue = _getDateTimeOffsetCompliantValue(sValue);
        break;
      case "Edm.TimeOfDay":
        oValue = sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/) ? sValue.match(/(\d{1,2}):(\d{1,2}):(\d{1,2})/)[0] : undefined;
        break;
      default:
    }
    return oValue === null ? undefined : oValue;
  }

  /**
   * Method to create a condition.
   *
   * @param  sOption Operator to be used.
   * @param  oV1 Lower value
   * @param  oV2 Higher value
   * @param sSign
   * @returns Condition to be created
   */
  _exports.getTypeCompliantValue = getTypeCompliantValue;
  function resolveConditionValues(sOption, oV1, oV2, sSign) {
    let oValue = oV1,
      oValue2,
      sInternalOperation;
    const oCondition = {};
    oCondition.values = [];
    oCondition.isEmpty = null;
    if (oV1 === undefined || oV1 === null) {
      return undefined;
    }
    switch (sOption) {
      case "CP":
        sInternalOperation = "Contains";
        if (oValue) {
          const nIndexOf = oValue.indexOf("*");
          const nLastIndex = oValue.lastIndexOf("*");

          // only when there are '*' at all
          if (nIndexOf > -1) {
            if (nIndexOf === 0 && nLastIndex !== oValue.length - 1) {
              sInternalOperation = "EndsWith";
              oValue = oValue.substring(1, oValue.length);
            } else if (nIndexOf !== 0 && nLastIndex === oValue.length - 1) {
              sInternalOperation = "StartsWith";
              oValue = oValue.substring(0, oValue.length - 1);
            } else {
              oValue = oValue.substring(1, oValue.length - 1);
            }
          } else {
            Log.warning("Contains Option cannot be used without '*'.");
            return undefined;
          }
        }
        break;
      case "EQ":
        sInternalOperation = oV1 === "" ? "Empty" : sOption;
        break;
      case "NE":
        sInternalOperation = oV1 === "" ? "NotEmpty" : sOption;
        break;
      case "BT":
        if (oV2 === undefined || oV2 === null) {
          return;
        }
        oValue2 = oV2;
        sInternalOperation = sOption;
        break;
      case "LE":
      case "GE":
      case "GT":
      case "LT":
        sInternalOperation = sOption;
        break;
      default:
        Log.warning(`Selection Option is not supported : '${sOption}'`);
        return undefined;
    }
    if (sSign === "E") {
      sInternalOperation = oExcludeMap[sInternalOperation];
    }
    oCondition.operator = sInternalOperation;
    if (sInternalOperation !== "Empty") {
      oCondition.values.push(oValue);
      if (oValue2) {
        oCondition.values.push(oValue2);
      }
    }
    return oCondition;
  }

  /* Method to get the Range property from the Selection Option */
  _exports.resolveConditionValues = resolveConditionValues;
  function getRangeProperty(sProperty) {
    return sProperty.indexOf("/") > 0 ? sProperty.split("/")[1] : sProperty;
  }
  _exports.getRangeProperty = getRangeProperty;
  function _buildConditionsFromSelectionRanges(Ranges, oProperty, sPropertyName, getCustomConditions) {
    const aConditions = [];
    Ranges === null || Ranges === void 0 ? void 0 : Ranges.forEach(Range => {
      const oCondition = getCustomConditions ? getCustomConditions(Range, oProperty, sPropertyName) : getConditions(Range, oProperty);
      if (oCondition) {
        aConditions.push(oCondition);
      }
    });
    return aConditions;
  }
  function _getProperty(propertyName, metaModel, entitySetPath) {
    const lastSlashIndex = propertyName.lastIndexOf("/");
    const navigationPath = lastSlashIndex > -1 ? propertyName.substring(0, propertyName.lastIndexOf("/") + 1) : "";
    const collection = metaModel.getObject(`${entitySetPath}/${navigationPath}`);
    return collection === null || collection === void 0 ? void 0 : collection[propertyName.replace(navigationPath, "")];
  }
  function _buildFiltersConditionsFromSelectOption(selectOption, metaModel, entitySetPath, getCustomConditions) {
    const propertyName = selectOption.PropertyName,
      filterConditions = {},
      propertyPath = propertyName.value || propertyName.$PropertyPath,
      Ranges = selectOption.Ranges;
    const targetProperty = _getProperty(propertyPath, metaModel, entitySetPath);
    if (targetProperty) {
      const conditions = _buildConditionsFromSelectionRanges(Ranges, targetProperty, propertyPath, getCustomConditions);
      if (conditions.length) {
        filterConditions[propertyPath] = (filterConditions[propertyPath] || []).concat(conditions);
      }
    }
    return filterConditions;
  }
  function getFiltersConditionsFromSelectionVariant(sEntitySetPath, oMetaModel, selectionVariant, getCustomConditions) {
    let oFilterConditions = {};
    if (!selectionVariant) {
      return oFilterConditions;
    }
    const aSelectOptions = selectionVariant.SelectOptions,
      aParameters = selectionVariant.Parameters;
    aSelectOptions === null || aSelectOptions === void 0 ? void 0 : aSelectOptions.forEach(selectOption => {
      const propertyName = selectOption.PropertyName,
        sPropertyName = propertyName.value || propertyName.$PropertyPath;
      if (Object.keys(oFilterConditions).includes(sPropertyName)) {
        oFilterConditions[sPropertyName] = oFilterConditions[sPropertyName].concat(_buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions)[sPropertyName]);
      } else {
        oFilterConditions = {
          ...oFilterConditions,
          ..._buildFiltersConditionsFromSelectOption(selectOption, oMetaModel, sEntitySetPath, getCustomConditions)
        };
      }
    });
    aParameters === null || aParameters === void 0 ? void 0 : aParameters.forEach(parameter => {
      const sPropertyPath = parameter.PropertyName.value || parameter.PropertyName.$PropertyPath;
      const oCondition = getCustomConditions ? {
        operator: "EQ",
        value1: parameter.PropertyValue,
        value2: null,
        path: sPropertyPath,
        isParameter: true
      } : {
        operator: "EQ",
        values: [parameter.PropertyValue],
        isEmpty: null,
        validated: ConditionValidated.Validated,
        isParameter: true
      };
      oFilterConditions[sPropertyPath] = [oCondition];
    });
    return oFilterConditions;
  }
  _exports.getFiltersConditionsFromSelectionVariant = getFiltersConditionsFromSelectionVariant;
  function getConditions(Range, oValidProperty) {
    let oCondition;
    const sign = Range.Sign ? getRangeProperty(Range.Sign) : undefined;
    const sOption = Range.Option ? getRangeProperty(Range.Option) : undefined;
    const oValue1 = getTypeCompliantValue(Range.Low, oValidProperty.$Type || oValidProperty.type);
    const oValue2 = Range.High ? getTypeCompliantValue(Range.High, oValidProperty.$Type || oValidProperty.type) : undefined;
    const oConditionValues = resolveConditionValues(sOption, oValue1, oValue2, sign);
    if (oConditionValues) {
      oCondition = Condition.createCondition(oConditionValues.operator, oConditionValues.values, null, null, ConditionValidated.Validated);
    }
    return oCondition;
  }
  _exports.getConditions = getConditions;
  const getDefaultValueFilters = function (oContext, properties) {
    const filterConditions = {};
    const entitySetPath = oContext.getInterface(1).getPath(),
      oMetaModel = oContext.getInterface(1).getModel();
    if (properties) {
      for (const key in properties) {
        const defaultFilterValue = oMetaModel.getObject(`${entitySetPath}/${key}@com.sap.vocabularies.Common.v1.FilterDefaultValue`);
        if (defaultFilterValue !== undefined) {
          const PropertyName = key;
          filterConditions[PropertyName] = [Condition.createCondition("EQ", [defaultFilterValue], null, null, ConditionValidated.Validated)];
        }
      }
    }
    return filterConditions;
  };
  const getDefaultSemanticDateFilters = function (oContext, properties, defaultSemanticDates) {
    const filterConditions = {};
    const oInterface = oContext.getInterface(1);
    const oMetaModel = oInterface.getModel();
    const sEntityTypePath = oInterface.getPath();
    for (const key in defaultSemanticDates) {
      if (defaultSemanticDates[key][0]) {
        const aPropertyPathParts = key.split("::");
        let sPath = "";
        const iPropertyPathLength = aPropertyPathParts.length;
        const sNavigationPath = aPropertyPathParts.slice(0, aPropertyPathParts.length - 1).join("/");
        const sProperty = aPropertyPathParts[iPropertyPathLength - 1];
        if (sNavigationPath) {
          //Create Proper Condition Path e.g. _Item*/Property or _Item/Property
          const vProperty = oMetaModel.getObject(sEntityTypePath + "/" + sNavigationPath);
          if (vProperty.$kind === "NavigationProperty" && vProperty.$isCollection) {
            sPath += `${sNavigationPath}*/`;
          } else if (vProperty.$kind === "NavigationProperty") {
            sPath += `${sNavigationPath}/`;
          }
        }
        sPath += sProperty;
        const operatorParamsArr = "values" in defaultSemanticDates[key][0] ? defaultSemanticDates[key][0].values : [];
        filterConditions[sPath] = [Condition.createCondition(defaultSemanticDates[key][0].operator, operatorParamsArr, null, null, null)];
      }
    }
    return filterConditions;
  };
  function getEditStatusFilter() {
    const ofilterConditions = {};
    ofilterConditions["$editState"] = [Condition.createCondition("DRAFT_EDIT_STATE", ["ALL"], null, null, ConditionValidated.Validated)];
    return ofilterConditions;
  }
  _exports.getEditStatusFilter = getEditStatusFilter;
  function getFilterConditions(oContext, filterConditions) {
    var _filterConditions, _filterConditions2;
    let editStateFilter;
    const entitySetPath = oContext.getInterface(1).getPath(),
      oMetaModel = oContext.getInterface(1).getModel(),
      entityTypeAnnotations = oMetaModel.getObject(`${entitySetPath}@`),
      entityTypeProperties = oMetaModel.getObject(`${entitySetPath}/`);
    if (entityTypeAnnotations && (entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] || entityTypeAnnotations["@com.sap.vocabularies.Common.v1.DraftNode"])) {
      editStateFilter = getEditStatusFilter();
    }
    const selectionVariant = (_filterConditions = filterConditions) === null || _filterConditions === void 0 ? void 0 : _filterConditions.selectionVariant;
    const defaultSemanticDates = ((_filterConditions2 = filterConditions) === null || _filterConditions2 === void 0 ? void 0 : _filterConditions2.defaultSemanticDates) || {};
    const defaultFilters = getDefaultValueFilters(oContext, entityTypeProperties);
    const defaultSemanticDateFilters = getDefaultSemanticDateFilters(oContext, entityTypeProperties, defaultSemanticDates);
    if (selectionVariant) {
      filterConditions = getFiltersConditionsFromSelectionVariant(entitySetPath, oMetaModel, selectionVariant);
    } else if (defaultFilters) {
      filterConditions = defaultFilters;
    }
    if (defaultSemanticDateFilters) {
      // only for semantic date:
      // 1. value from manifest get merged with SV
      // 2. manifest value is given preference when there is same semantic date property in SV and manifest
      filterConditions = {
        ...filterConditions,
        ...defaultSemanticDateFilters
      };
    }
    if (editStateFilter) {
      filterConditions = {
        ...filterConditions,
        ...editStateFilter
      };
    }
    return Object.keys(filterConditions).length > 0 ? JSON.stringify(filterConditions).replace(/([{}])/g, "\\$1") : undefined;
  }

  /**
   * Checks whether the argument is a {@link SelectionVariantTypeTypes}.
   *
   * @param serviceObject The object to be checked.
   * @returns Whether the argument is a {@link SelectionVariantTypeTypes}.
   */
  _exports.getFilterConditions = getFilterConditions;
  function isSelectionVariant(serviceObject) {
    return (serviceObject === null || serviceObject === void 0 ? void 0 : serviceObject.$Type) === "com.sap.vocabularies.UI.v1.SelectionVariantType";
  }
  _exports.isSelectionVariant = isSelectionVariant;
  getFilterConditions.requiresIContext = true;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvRXhjbHVkZU1hcCIsIkNvbnRhaW5zIiwiU3RhcnRzV2l0aCIsIkVuZHNXaXRoIiwiRW1wdHkiLCJOb3RFbXB0eSIsIkxFIiwiR0UiLCJMVCIsIkdUIiwiQlQiLCJORSIsIkVRIiwiX2dldERhdGVUaW1lT2Zmc2V0Q29tcGxpYW50VmFsdWUiLCJzVmFsdWUiLCJvVmFsdWUiLCJtYXRjaCIsImluZGV4T2YiLCJsZW5ndGgiLCJzcGxpdCIsInVuZGVmaW5lZCIsIl9nZXREYXRlQ29tcGxpYW50VmFsdWUiLCJnZXRUeXBlQ29tcGxpYW50VmFsdWUiLCJzVHlwZSIsImlzVHlwZUZpbHRlcmFibGUiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJwYXJzZUludCIsInJlc29sdmVDb25kaXRpb25WYWx1ZXMiLCJzT3B0aW9uIiwib1YxIiwib1YyIiwic1NpZ24iLCJvVmFsdWUyIiwic0ludGVybmFsT3BlcmF0aW9uIiwib0NvbmRpdGlvbiIsInZhbHVlcyIsImlzRW1wdHkiLCJuSW5kZXhPZiIsIm5MYXN0SW5kZXgiLCJsYXN0SW5kZXhPZiIsInN1YnN0cmluZyIsIkxvZyIsIndhcm5pbmciLCJvcGVyYXRvciIsInB1c2giLCJnZXRSYW5nZVByb3BlcnR5Iiwic1Byb3BlcnR5IiwiX2J1aWxkQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25SYW5nZXMiLCJSYW5nZXMiLCJvUHJvcGVydHkiLCJzUHJvcGVydHlOYW1lIiwiZ2V0Q3VzdG9tQ29uZGl0aW9ucyIsImFDb25kaXRpb25zIiwiZm9yRWFjaCIsIlJhbmdlIiwiZ2V0Q29uZGl0aW9ucyIsIl9nZXRQcm9wZXJ0eSIsInByb3BlcnR5TmFtZSIsIm1ldGFNb2RlbCIsImVudGl0eVNldFBhdGgiLCJsYXN0U2xhc2hJbmRleCIsIm5hdmlnYXRpb25QYXRoIiwiY29sbGVjdGlvbiIsImdldE9iamVjdCIsInJlcGxhY2UiLCJfYnVpbGRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3RPcHRpb24iLCJzZWxlY3RPcHRpb24iLCJQcm9wZXJ0eU5hbWUiLCJmaWx0ZXJDb25kaXRpb25zIiwicHJvcGVydHlQYXRoIiwidmFsdWUiLCIkUHJvcGVydHlQYXRoIiwidGFyZ2V0UHJvcGVydHkiLCJjb25kaXRpb25zIiwiY29uY2F0IiwiZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudCIsInNFbnRpdHlTZXRQYXRoIiwib01ldGFNb2RlbCIsInNlbGVjdGlvblZhcmlhbnQiLCJvRmlsdGVyQ29uZGl0aW9ucyIsImFTZWxlY3RPcHRpb25zIiwiU2VsZWN0T3B0aW9ucyIsImFQYXJhbWV0ZXJzIiwiUGFyYW1ldGVycyIsIk9iamVjdCIsImtleXMiLCJpbmNsdWRlcyIsInBhcmFtZXRlciIsInNQcm9wZXJ0eVBhdGgiLCJ2YWx1ZTEiLCJQcm9wZXJ0eVZhbHVlIiwidmFsdWUyIiwicGF0aCIsImlzUGFyYW1ldGVyIiwidmFsaWRhdGVkIiwiQ29uZGl0aW9uVmFsaWRhdGVkIiwiVmFsaWRhdGVkIiwib1ZhbGlkUHJvcGVydHkiLCJzaWduIiwiU2lnbiIsIk9wdGlvbiIsIm9WYWx1ZTEiLCJMb3ciLCIkVHlwZSIsInR5cGUiLCJIaWdoIiwib0NvbmRpdGlvblZhbHVlcyIsIkNvbmRpdGlvbiIsImNyZWF0ZUNvbmRpdGlvbiIsImdldERlZmF1bHRWYWx1ZUZpbHRlcnMiLCJvQ29udGV4dCIsInByb3BlcnRpZXMiLCJnZXRJbnRlcmZhY2UiLCJnZXRQYXRoIiwiZ2V0TW9kZWwiLCJrZXkiLCJkZWZhdWx0RmlsdGVyVmFsdWUiLCJnZXREZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyIsImRlZmF1bHRTZW1hbnRpY0RhdGVzIiwib0ludGVyZmFjZSIsInNFbnRpdHlUeXBlUGF0aCIsImFQcm9wZXJ0eVBhdGhQYXJ0cyIsInNQYXRoIiwiaVByb3BlcnR5UGF0aExlbmd0aCIsInNOYXZpZ2F0aW9uUGF0aCIsInNsaWNlIiwiam9pbiIsInZQcm9wZXJ0eSIsIiRraW5kIiwiJGlzQ29sbGVjdGlvbiIsIm9wZXJhdG9yUGFyYW1zQXJyIiwiZ2V0RWRpdFN0YXR1c0ZpbHRlciIsIm9maWx0ZXJDb25kaXRpb25zIiwiZ2V0RmlsdGVyQ29uZGl0aW9ucyIsImVkaXRTdGF0ZUZpbHRlciIsImVudGl0eVR5cGVBbm5vdGF0aW9ucyIsImVudGl0eVR5cGVQcm9wZXJ0aWVzIiwiZGVmYXVsdEZpbHRlcnMiLCJkZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyIsIkpTT04iLCJzdHJpbmdpZnkiLCJpc1NlbGVjdGlvblZhcmlhbnQiLCJzZXJ2aWNlT2JqZWN0IiwicmVxdWlyZXNJQ29udGV4dCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVySGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgU2VsZWN0aW9uUmFuZ2VUeXBlVHlwZXMsIFNlbGVjdGlvblZhcmlhbnRUeXBlVHlwZXMsIFNlbGVjdE9wdGlvblR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgRGVmYXVsdFR5cGVGb3JFZG1UeXBlLCBpc1R5cGVGaWx0ZXJhYmxlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvRURNXCI7XG5pbXBvcnQgdHlwZSB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBDb25kaXRpb24gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IENvbmRpdGlvblZhbGlkYXRlZCBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0NvbmRpdGlvblZhbGlkYXRlZFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5leHBvcnQgdHlwZSBGaWx0ZXJDb25kaXRpb25zID0ge1xuXHRvcGVyYXRvcjogc3RyaW5nO1xuXHR2YWx1ZXM6IEFycmF5PHN0cmluZz47XG5cdGlzRW1wdHk/OiBib29sZWFuIHwgbnVsbDtcblx0dmFsaWRhdGVkPzogc3RyaW5nO1xuXHRpc1BhcmFtZXRlcj86IGJvb2xlYW47XG59O1xuXG5jb25zdCBvRXhjbHVkZU1hcDogUmVjb3JkPHN0cmluZywgYW55PiA9IHtcblx0Q29udGFpbnM6IFwiTm90Q29udGFpbnNcIixcblx0U3RhcnRzV2l0aDogXCJOb3RTdGFydHNXaXRoXCIsXG5cdEVuZHNXaXRoOiBcIk5vdEVuZHNXaXRoXCIsXG5cdEVtcHR5OiBcIk5vdEVtcHR5XCIsXG5cdE5vdEVtcHR5OiBcIkVtcHR5XCIsXG5cdExFOiBcIk5PVExFXCIsXG5cdEdFOiBcIk5PVEdFXCIsXG5cdExUOiBcIk5PVExUXCIsXG5cdEdUOiBcIk5PVEdUXCIsXG5cdEJUOiBcIk5PVEJUXCIsXG5cdE5FOiBcIkVRXCIsXG5cdEVROiBcIk5FXCJcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBfZ2V0RGF0ZVRpbWVPZmZzZXRDb21wbGlhbnRWYWx1ZShzVmFsdWU6IGFueSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGxldCBvVmFsdWU7XG5cdGlmIChzVmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezEsMn0pLShcXGR7MSwyfSlUKFxcZHsxLDJ9KTooXFxkezEsMn0pOihcXGR7MSwyfSlcXCsoXFxkezEsNH0pLykpIHtcblx0XHRvVmFsdWUgPSBzVmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezEsMn0pLShcXGR7MSwyfSlUKFxcZHsxLDJ9KTooXFxkezEsMn0pOihcXGR7MSwyfSlcXCsoXFxkezEsNH0pLylbMF07XG5cdH0gZWxzZSBpZiAoc1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pVChcXGR7MSwyfSk6KFxcZHsxLDJ9KTooXFxkezEsMn0pLykpIHtcblx0XHRvVmFsdWUgPSBgJHtzVmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezEsMn0pLShcXGR7MSwyfSlUKFxcZHsxLDJ9KTooXFxkezEsMn0pOihcXGR7MSwyfSkvKVswXX0rMDAwMGA7XG5cdH0gZWxzZSBpZiAoc1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pLykpIHtcblx0XHRvVmFsdWUgPSBgJHtzVmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezEsMn0pLShcXGR7MSwyfSkvKVswXX1UMDA6MDA6MDArMDAwMGA7XG5cdH0gZWxzZSBpZiAoc1ZhbHVlLmluZGV4T2YoXCJaXCIpID09PSBzVmFsdWUubGVuZ3RoIC0gMSkge1xuXHRcdG9WYWx1ZSA9IGAke3NWYWx1ZS5zcGxpdChcIlpcIilbMF19KzAxMDBgO1xuXHR9IGVsc2Uge1xuXHRcdG9WYWx1ZSA9IHVuZGVmaW5lZDtcblx0fVxuXHRyZXR1cm4gb1ZhbHVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gX2dldERhdGVDb21wbGlhbnRWYWx1ZShzVmFsdWU6IGFueSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBzVmFsdWUubWF0Y2goL14oXFxkezR9KS0oXFxkezEsMn0pLShcXGR7MSwyfSkvKVxuXHRcdD8gc1ZhbHVlLm1hdGNoKC9eKFxcZHs0fSktKFxcZHsxLDJ9KS0oXFxkezEsMn0pLylbMF1cblx0XHQ6IHNWYWx1ZS5tYXRjaCgvXihcXGR7OH0pLykgJiYgc1ZhbHVlLm1hdGNoKC9eKFxcZHs4fSkvKVswXTtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gZ2V0IHRoZSBjb21wbGlhbnQgdmFsdWUgdHlwZSBiYXNlZCBvbiB0aGUgZGF0YSB0eXBlLlxuICpcbiAqIEBwYXJhbSAgc1ZhbHVlIFJhdyB2YWx1ZVxuICogQHBhcmFtICBzVHlwZSBUaGUgcHJvcGVydHkgdHlwZVxuICogQHJldHVybnMgVmFsdWUgdG8gYmUgcHJvcGFnYXRlZCB0byB0aGUgY29uZGl0aW9uLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlQ29tcGxpYW50VmFsdWUoc1ZhbHVlOiBhbnksIHNUeXBlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRsZXQgb1ZhbHVlO1xuXHRpZiAoIWlzVHlwZUZpbHRlcmFibGUoc1R5cGUgYXMga2V5b2YgdHlwZW9mIERlZmF1bHRUeXBlRm9yRWRtVHlwZSkpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdG9WYWx1ZSA9IHNWYWx1ZTtcblx0c3dpdGNoIChzVHlwZSkge1xuXHRcdGNhc2UgXCJFZG0uQm9vbGVhblwiOlxuXHRcdFx0aWYgKHR5cGVvZiBzVmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdG9WYWx1ZSA9IHNWYWx1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9WYWx1ZSA9IHNWYWx1ZSA9PT0gXCJ0cnVlXCIgfHwgKHNWYWx1ZSA9PT0gXCJmYWxzZVwiID8gZmFsc2UgOiB1bmRlZmluZWQpO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkVkbS5Eb3VibGVcIjpcblx0XHRjYXNlIFwiRWRtLlNpbmdsZVwiOlxuXHRcdFx0b1ZhbHVlID0gaXNOYU4oc1ZhbHVlKSA/IHVuZGVmaW5lZCA6IHBhcnNlRmxvYXQoc1ZhbHVlKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJFZG0uQnl0ZVwiOlxuXHRcdGNhc2UgXCJFZG0uSW50MTZcIjpcblx0XHRjYXNlIFwiRWRtLkludDMyXCI6XG5cdFx0Y2FzZSBcIkVkbS5TQnl0ZVwiOlxuXHRcdFx0b1ZhbHVlID0gaXNOYU4oc1ZhbHVlKSA/IHVuZGVmaW5lZCA6IHBhcnNlSW50KHNWYWx1ZSwgMTApO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkVkbS5EYXRlXCI6XG5cdFx0XHRvVmFsdWUgPSBfZ2V0RGF0ZUNvbXBsaWFudFZhbHVlKHNWYWx1ZSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCI6XG5cdFx0XHRvVmFsdWUgPSBfZ2V0RGF0ZVRpbWVPZmZzZXRDb21wbGlhbnRWYWx1ZShzVmFsdWUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkVkbS5UaW1lT2ZEYXlcIjpcblx0XHRcdG9WYWx1ZSA9IHNWYWx1ZS5tYXRjaCgvKFxcZHsxLDJ9KTooXFxkezEsMn0pOihcXGR7MSwyfSkvKSA/IHNWYWx1ZS5tYXRjaCgvKFxcZHsxLDJ9KTooXFxkezEsMn0pOihcXGR7MSwyfSkvKVswXSA6IHVuZGVmaW5lZDtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdH1cblxuXHRyZXR1cm4gb1ZhbHVlID09PSBudWxsID8gdW5kZWZpbmVkIDogb1ZhbHVlO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBjcmVhdGUgYSBjb25kaXRpb24uXG4gKlxuICogQHBhcmFtICBzT3B0aW9uIE9wZXJhdG9yIHRvIGJlIHVzZWQuXG4gKiBAcGFyYW0gIG9WMSBMb3dlciB2YWx1ZVxuICogQHBhcmFtICBvVjIgSGlnaGVyIHZhbHVlXG4gKiBAcGFyYW0gc1NpZ25cbiAqIEByZXR1cm5zIENvbmRpdGlvbiB0byBiZSBjcmVhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ29uZGl0aW9uVmFsdWVzKHNPcHRpb246IHN0cmluZyB8IHVuZGVmaW5lZCwgb1YxOiBhbnksIG9WMjogYW55LCBzU2lnbjogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdGxldCBvVmFsdWUgPSBvVjEsXG5cdFx0b1ZhbHVlMixcblx0XHRzSW50ZXJuYWxPcGVyYXRpb246IGFueTtcblx0Y29uc3Qgb0NvbmRpdGlvbjogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiA9IHt9O1xuXHRvQ29uZGl0aW9uLnZhbHVlcyA9IFtdO1xuXHRvQ29uZGl0aW9uLmlzRW1wdHkgPSBudWxsIGFzIGFueTtcblx0aWYgKG9WMSA9PT0gdW5kZWZpbmVkIHx8IG9WMSA9PT0gbnVsbCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRzd2l0Y2ggKHNPcHRpb24pIHtcblx0XHRjYXNlIFwiQ1BcIjpcblx0XHRcdHNJbnRlcm5hbE9wZXJhdGlvbiA9IFwiQ29udGFpbnNcIjtcblx0XHRcdGlmIChvVmFsdWUpIHtcblx0XHRcdFx0Y29uc3QgbkluZGV4T2YgPSBvVmFsdWUuaW5kZXhPZihcIipcIik7XG5cdFx0XHRcdGNvbnN0IG5MYXN0SW5kZXggPSBvVmFsdWUubGFzdEluZGV4T2YoXCIqXCIpO1xuXG5cdFx0XHRcdC8vIG9ubHkgd2hlbiB0aGVyZSBhcmUgJyonIGF0IGFsbFxuXHRcdFx0XHRpZiAobkluZGV4T2YgPiAtMSkge1xuXHRcdFx0XHRcdGlmIChuSW5kZXhPZiA9PT0gMCAmJiBuTGFzdEluZGV4ICE9PSBvVmFsdWUubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gXCJFbmRzV2l0aFwiO1xuXHRcdFx0XHRcdFx0b1ZhbHVlID0gb1ZhbHVlLnN1YnN0cmluZygxLCBvVmFsdWUubGVuZ3RoKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKG5JbmRleE9mICE9PSAwICYmIG5MYXN0SW5kZXggPT09IG9WYWx1ZS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdFx0XHRzSW50ZXJuYWxPcGVyYXRpb24gPSBcIlN0YXJ0c1dpdGhcIjtcblx0XHRcdFx0XHRcdG9WYWx1ZSA9IG9WYWx1ZS5zdWJzdHJpbmcoMCwgb1ZhbHVlLmxlbmd0aCAtIDEpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvVmFsdWUgPSBvVmFsdWUuc3Vic3RyaW5nKDEsIG9WYWx1ZS5sZW5ndGggLSAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0TG9nLndhcm5pbmcoXCJDb250YWlucyBPcHRpb24gY2Fubm90IGJlIHVzZWQgd2l0aG91dCAnKicuXCIpO1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJFUVwiOlxuXHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gb1YxID09PSBcIlwiID8gXCJFbXB0eVwiIDogc09wdGlvbjtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJORVwiOlxuXHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gb1YxID09PSBcIlwiID8gXCJOb3RFbXB0eVwiIDogc09wdGlvbjtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJCVFwiOlxuXHRcdFx0aWYgKG9WMiA9PT0gdW5kZWZpbmVkIHx8IG9WMiA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRvVmFsdWUyID0gb1YyO1xuXHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gc09wdGlvbjtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJMRVwiOlxuXHRcdGNhc2UgXCJHRVwiOlxuXHRcdGNhc2UgXCJHVFwiOlxuXHRcdGNhc2UgXCJMVFwiOlxuXHRcdFx0c0ludGVybmFsT3BlcmF0aW9uID0gc09wdGlvbjtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRMb2cud2FybmluZyhgU2VsZWN0aW9uIE9wdGlvbiBpcyBub3Qgc3VwcG9ydGVkIDogJyR7c09wdGlvbn0nYCk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGlmIChzU2lnbiA9PT0gXCJFXCIpIHtcblx0XHRzSW50ZXJuYWxPcGVyYXRpb24gPSBvRXhjbHVkZU1hcFtzSW50ZXJuYWxPcGVyYXRpb25dO1xuXHR9XG5cdG9Db25kaXRpb24ub3BlcmF0b3IgPSBzSW50ZXJuYWxPcGVyYXRpb247XG5cdGlmIChzSW50ZXJuYWxPcGVyYXRpb24gIT09IFwiRW1wdHlcIikge1xuXHRcdG9Db25kaXRpb24udmFsdWVzLnB1c2gob1ZhbHVlKTtcblx0XHRpZiAob1ZhbHVlMikge1xuXHRcdFx0b0NvbmRpdGlvbi52YWx1ZXMucHVzaChvVmFsdWUyKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9Db25kaXRpb247XG59XG5cbi8qIE1ldGhvZCB0byBnZXQgdGhlIFJhbmdlIHByb3BlcnR5IGZyb20gdGhlIFNlbGVjdGlvbiBPcHRpb24gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5nZVByb3BlcnR5KHNQcm9wZXJ0eTogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIHNQcm9wZXJ0eS5pbmRleE9mKFwiL1wiKSA+IDAgPyBzUHJvcGVydHkuc3BsaXQoXCIvXCIpWzFdIDogc1Byb3BlcnR5O1xufVxuXG5mdW5jdGlvbiBfYnVpbGRDb25kaXRpb25zRnJvbVNlbGVjdGlvblJhbmdlcyhcblx0UmFuZ2VzOiBTZWxlY3Rpb25SYW5nZVR5cGVUeXBlc1tdLFxuXHRvUHJvcGVydHk6IFJlY29yZDxzdHJpbmcsIG9iamVjdD4sXG5cdHNQcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0Z2V0Q3VzdG9tQ29uZGl0aW9ucz86IEZ1bmN0aW9uXG4pOiBhbnlbXSB7XG5cdGNvbnN0IGFDb25kaXRpb25zOiBhbnlbXSA9IFtdO1xuXHRSYW5nZXM/LmZvckVhY2goKFJhbmdlOiBhbnkpID0+IHtcblx0XHRjb25zdCBvQ29uZGl0aW9uID0gZ2V0Q3VzdG9tQ29uZGl0aW9ucyA/IGdldEN1c3RvbUNvbmRpdGlvbnMoUmFuZ2UsIG9Qcm9wZXJ0eSwgc1Byb3BlcnR5TmFtZSkgOiBnZXRDb25kaXRpb25zKFJhbmdlLCBvUHJvcGVydHkpO1xuXHRcdGlmIChvQ29uZGl0aW9uKSB7XG5cdFx0XHRhQ29uZGl0aW9ucy5wdXNoKG9Db25kaXRpb24pO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBhQ29uZGl0aW9ucztcbn1cblxuZnVuY3Rpb24gX2dldFByb3BlcnR5KHByb3BlcnR5TmFtZTogc3RyaW5nLCBtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBlbnRpdHlTZXRQYXRoOiBzdHJpbmcpOiBSZWNvcmQ8c3RyaW5nLCBvYmplY3Q+IHtcblx0Y29uc3QgbGFzdFNsYXNoSW5kZXggPSBwcm9wZXJ0eU5hbWUubGFzdEluZGV4T2YoXCIvXCIpO1xuXHRjb25zdCBuYXZpZ2F0aW9uUGF0aCA9IGxhc3RTbGFzaEluZGV4ID4gLTEgPyBwcm9wZXJ0eU5hbWUuc3Vic3RyaW5nKDAsIHByb3BlcnR5TmFtZS5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSA6IFwiXCI7XG5cdGNvbnN0IGNvbGxlY3Rpb24gPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9LyR7bmF2aWdhdGlvblBhdGh9YCk7XG5cdHJldHVybiBjb2xsZWN0aW9uPy5bcHJvcGVydHlOYW1lLnJlcGxhY2UobmF2aWdhdGlvblBhdGgsIFwiXCIpXTtcbn1cblxuZnVuY3Rpb24gX2J1aWxkRmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0T3B0aW9uKFxuXHRzZWxlY3RPcHRpb246IFNlbGVjdE9wdGlvblR5cGUsXG5cdG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsXG5cdGVudGl0eVNldFBhdGg6IHN0cmluZyxcblx0Z2V0Q3VzdG9tQ29uZGl0aW9ucz86IEZ1bmN0aW9uXG4pOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+IHtcblx0Y29uc3QgcHJvcGVydHlOYW1lOiBhbnkgPSBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lLFxuXHRcdGZpbHRlckNvbmRpdGlvbnM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4gPSB7fSxcblx0XHRwcm9wZXJ0eVBhdGg6IHN0cmluZyA9IHByb3BlcnR5TmFtZS52YWx1ZSB8fCBwcm9wZXJ0eU5hbWUuJFByb3BlcnR5UGF0aCxcblx0XHRSYW5nZXM6IFNlbGVjdGlvblJhbmdlVHlwZVR5cGVzW10gPSBzZWxlY3RPcHRpb24uUmFuZ2VzO1xuXHRjb25zdCB0YXJnZXRQcm9wZXJ0eSA9IF9nZXRQcm9wZXJ0eShwcm9wZXJ0eVBhdGgsIG1ldGFNb2RlbCwgZW50aXR5U2V0UGF0aCk7XG5cdGlmICh0YXJnZXRQcm9wZXJ0eSkge1xuXHRcdGNvbnN0IGNvbmRpdGlvbnM6IGFueVtdID0gX2J1aWxkQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25SYW5nZXMoUmFuZ2VzLCB0YXJnZXRQcm9wZXJ0eSwgcHJvcGVydHlQYXRoLCBnZXRDdXN0b21Db25kaXRpb25zKTtcblx0XHRpZiAoY29uZGl0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGZpbHRlckNvbmRpdGlvbnNbcHJvcGVydHlQYXRoXSA9IChmaWx0ZXJDb25kaXRpb25zW3Byb3BlcnR5UGF0aF0gfHwgW10pLmNvbmNhdChjb25kaXRpb25zKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGZpbHRlckNvbmRpdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGaWx0ZXJzQ29uZGl0aW9uc0Zyb21TZWxlY3Rpb25WYXJpYW50KFxuXHRzRW50aXR5U2V0UGF0aDogc3RyaW5nLFxuXHRvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0c2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudFR5cGVUeXBlcyxcblx0Z2V0Q3VzdG9tQ29uZGl0aW9ucz86IEZ1bmN0aW9uXG4pOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+IHtcblx0bGV0IG9GaWx0ZXJDb25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+ID0ge307XG5cdGlmICghc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdHJldHVybiBvRmlsdGVyQ29uZGl0aW9ucztcblx0fVxuXHRjb25zdCBhU2VsZWN0T3B0aW9ucyA9IHNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucyxcblx0XHRhUGFyYW1ldGVycyA9IHNlbGVjdGlvblZhcmlhbnQuUGFyYW1ldGVycztcblx0YVNlbGVjdE9wdGlvbnM/LmZvckVhY2goKHNlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uVHlwZSkgPT4ge1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZTogYW55ID0gc2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZSxcblx0XHRcdHNQcm9wZXJ0eU5hbWU6IHN0cmluZyA9IHByb3BlcnR5TmFtZS52YWx1ZSB8fCBwcm9wZXJ0eU5hbWUuJFByb3BlcnR5UGF0aDtcblx0XHRpZiAoT2JqZWN0LmtleXMob0ZpbHRlckNvbmRpdGlvbnMpLmluY2x1ZGVzKHNQcm9wZXJ0eU5hbWUpKSB7XG5cdFx0XHRvRmlsdGVyQ29uZGl0aW9uc1tzUHJvcGVydHlOYW1lXSA9IG9GaWx0ZXJDb25kaXRpb25zW3NQcm9wZXJ0eU5hbWVdLmNvbmNhdChcblx0XHRcdFx0X2J1aWxkRmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0T3B0aW9uKHNlbGVjdE9wdGlvbiwgb01ldGFNb2RlbCwgc0VudGl0eVNldFBhdGgsIGdldEN1c3RvbUNvbmRpdGlvbnMpW3NQcm9wZXJ0eU5hbWVdXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRmlsdGVyQ29uZGl0aW9ucyA9IHtcblx0XHRcdFx0Li4ub0ZpbHRlckNvbmRpdGlvbnMsXG5cdFx0XHRcdC4uLl9idWlsZEZpbHRlcnNDb25kaXRpb25zRnJvbVNlbGVjdE9wdGlvbihzZWxlY3RPcHRpb24sIG9NZXRhTW9kZWwsIHNFbnRpdHlTZXRQYXRoLCBnZXRDdXN0b21Db25kaXRpb25zKVxuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xuXHRhUGFyYW1ldGVycz8uZm9yRWFjaCgocGFyYW1ldGVyOiBhbnkpID0+IHtcblx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gcGFyYW1ldGVyLlByb3BlcnR5TmFtZS52YWx1ZSB8fCBwYXJhbWV0ZXIuUHJvcGVydHlOYW1lLiRQcm9wZXJ0eVBhdGg7XG5cdFx0Y29uc3Qgb0NvbmRpdGlvbjogYW55ID0gZ2V0Q3VzdG9tQ29uZGl0aW9uc1xuXHRcdFx0PyB7IG9wZXJhdG9yOiBcIkVRXCIsIHZhbHVlMTogcGFyYW1ldGVyLlByb3BlcnR5VmFsdWUsIHZhbHVlMjogbnVsbCwgcGF0aDogc1Byb3BlcnR5UGF0aCwgaXNQYXJhbWV0ZXI6IHRydWUgfVxuXHRcdFx0OiB7XG5cdFx0XHRcdFx0b3BlcmF0b3I6IFwiRVFcIixcblx0XHRcdFx0XHR2YWx1ZXM6IFtwYXJhbWV0ZXIuUHJvcGVydHlWYWx1ZV0sXG5cdFx0XHRcdFx0aXNFbXB0eTogbnVsbCxcblx0XHRcdFx0XHR2YWxpZGF0ZWQ6IENvbmRpdGlvblZhbGlkYXRlZC5WYWxpZGF0ZWQsXG5cdFx0XHRcdFx0aXNQYXJhbWV0ZXI6IHRydWVcblx0XHRcdCAgfTtcblx0XHRvRmlsdGVyQ29uZGl0aW9uc1tzUHJvcGVydHlQYXRoXSA9IFtvQ29uZGl0aW9uXTtcblx0fSk7XG5cblx0cmV0dXJuIG9GaWx0ZXJDb25kaXRpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29uZGl0aW9ucyhSYW5nZTogYW55LCBvVmFsaWRQcm9wZXJ0eTogYW55KTogQ29uZGl0aW9uT2JqZWN0IHwgdW5kZWZpbmVkIHtcblx0bGV0IG9Db25kaXRpb247XG5cdGNvbnN0IHNpZ246IHN0cmluZyB8IHVuZGVmaW5lZCA9IFJhbmdlLlNpZ24gPyBnZXRSYW5nZVByb3BlcnR5KFJhbmdlLlNpZ24pIDogdW5kZWZpbmVkO1xuXHRjb25zdCBzT3B0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBSYW5nZS5PcHRpb24gPyBnZXRSYW5nZVByb3BlcnR5KFJhbmdlLk9wdGlvbikgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IG9WYWx1ZTE6IGFueSA9IGdldFR5cGVDb21wbGlhbnRWYWx1ZShSYW5nZS5Mb3csIG9WYWxpZFByb3BlcnR5LiRUeXBlIHx8IG9WYWxpZFByb3BlcnR5LnR5cGUpO1xuXHRjb25zdCBvVmFsdWUyOiBhbnkgPSBSYW5nZS5IaWdoID8gZ2V0VHlwZUNvbXBsaWFudFZhbHVlKFJhbmdlLkhpZ2gsIG9WYWxpZFByb3BlcnR5LiRUeXBlIHx8IG9WYWxpZFByb3BlcnR5LnR5cGUpIDogdW5kZWZpbmVkO1xuXHRjb25zdCBvQ29uZGl0aW9uVmFsdWVzID0gcmVzb2x2ZUNvbmRpdGlvblZhbHVlcyhzT3B0aW9uLCBvVmFsdWUxLCBvVmFsdWUyLCBzaWduKSBhcyBhbnk7XG5cdGlmIChvQ29uZGl0aW9uVmFsdWVzKSB7XG5cdFx0b0NvbmRpdGlvbiA9IENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oXG5cdFx0XHRvQ29uZGl0aW9uVmFsdWVzLm9wZXJhdG9yLFxuXHRcdFx0b0NvbmRpdGlvblZhbHVlcy52YWx1ZXMsXG5cdFx0XHRudWxsLFxuXHRcdFx0bnVsbCxcblx0XHRcdENvbmRpdGlvblZhbGlkYXRlZC5WYWxpZGF0ZWRcblx0XHQpO1xuXHR9XG5cdHJldHVybiBvQ29uZGl0aW9uO1xufVxuXG5jb25zdCBnZXREZWZhdWx0VmFsdWVGaWx0ZXJzID0gZnVuY3Rpb24gKG9Db250ZXh0OiBhbnksIHByb3BlcnRpZXM6IGFueSk6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRjb25zdCBmaWx0ZXJDb25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+ID0ge307XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMSkuZ2V0UGF0aCgpLFxuXHRcdG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMSkuZ2V0TW9kZWwoKTtcblx0aWYgKHByb3BlcnRpZXMpIHtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBwcm9wZXJ0aWVzKSB7XG5cdFx0XHRjb25zdCBkZWZhdWx0RmlsdGVyVmFsdWUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofS8ke2tleX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpbHRlckRlZmF1bHRWYWx1ZWApO1xuXHRcdFx0aWYgKGRlZmF1bHRGaWx0ZXJWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbnN0IFByb3BlcnR5TmFtZSA9IGtleTtcblx0XHRcdFx0ZmlsdGVyQ29uZGl0aW9uc1tQcm9wZXJ0eU5hbWVdID0gW1xuXHRcdFx0XHRcdENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oXCJFUVwiLCBbZGVmYXVsdEZpbHRlclZhbHVlXSwgbnVsbCwgbnVsbCwgQ29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZCkgYXMgRmlsdGVyQ29uZGl0aW9uc1xuXHRcdFx0XHRdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmlsdGVyQ29uZGl0aW9ucztcbn07XG5cbmNvbnN0IGdldERlZmF1bHRTZW1hbnRpY0RhdGVGaWx0ZXJzID0gZnVuY3Rpb24gKFxuXHRvQ29udGV4dDogYW55LFxuXHRwcm9wZXJ0aWVzOiBhbnksXG5cdGRlZmF1bHRTZW1hbnRpY0RhdGVzOiBhbnlcbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRjb25zdCBmaWx0ZXJDb25kaXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+ID0ge307XG5cdGNvbnN0IG9JbnRlcmZhY2UgPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMSk7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvSW50ZXJmYWNlLmdldE1vZGVsKCk7XG5cdGNvbnN0IHNFbnRpdHlUeXBlUGF0aCA9IG9JbnRlcmZhY2UuZ2V0UGF0aCgpO1xuXHRmb3IgKGNvbnN0IGtleSBpbiBkZWZhdWx0U2VtYW50aWNEYXRlcykge1xuXHRcdGlmIChkZWZhdWx0U2VtYW50aWNEYXRlc1trZXldWzBdKSB7XG5cdFx0XHRjb25zdCBhUHJvcGVydHlQYXRoUGFydHMgPSBrZXkuc3BsaXQoXCI6OlwiKTtcblx0XHRcdGxldCBzUGF0aCA9IFwiXCI7XG5cdFx0XHRjb25zdCBpUHJvcGVydHlQYXRoTGVuZ3RoID0gYVByb3BlcnR5UGF0aFBhcnRzLmxlbmd0aDtcblx0XHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IGFQcm9wZXJ0eVBhdGhQYXJ0cy5zbGljZSgwLCBhUHJvcGVydHlQYXRoUGFydHMubGVuZ3RoIC0gMSkuam9pbihcIi9cIik7XG5cdFx0XHRjb25zdCBzUHJvcGVydHkgPSBhUHJvcGVydHlQYXRoUGFydHNbaVByb3BlcnR5UGF0aExlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKHNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0XHQvL0NyZWF0ZSBQcm9wZXIgQ29uZGl0aW9uIFBhdGggZS5nLiBfSXRlbSovUHJvcGVydHkgb3IgX0l0ZW0vUHJvcGVydHlcblx0XHRcdFx0Y29uc3QgdlByb3BlcnR5ID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVR5cGVQYXRoICsgXCIvXCIgKyBzTmF2aWdhdGlvblBhdGgpO1xuXHRcdFx0XHRpZiAodlByb3BlcnR5LiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIHZQcm9wZXJ0eS4kaXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRcdFx0c1BhdGggKz0gYCR7c05hdmlnYXRpb25QYXRofSovYDtcblx0XHRcdFx0fSBlbHNlIGlmICh2UHJvcGVydHkuJGtpbmQgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIpIHtcblx0XHRcdFx0XHRzUGF0aCArPSBgJHtzTmF2aWdhdGlvblBhdGh9L2A7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHNQYXRoICs9IHNQcm9wZXJ0eTtcblx0XHRcdGNvbnN0IG9wZXJhdG9yUGFyYW1zQXJyID0gXCJ2YWx1ZXNcIiBpbiBkZWZhdWx0U2VtYW50aWNEYXRlc1trZXldWzBdID8gZGVmYXVsdFNlbWFudGljRGF0ZXNba2V5XVswXS52YWx1ZXMgOiBbXTtcblx0XHRcdGZpbHRlckNvbmRpdGlvbnNbc1BhdGhdID0gW1xuXHRcdFx0XHRDb25kaXRpb24uY3JlYXRlQ29uZGl0aW9uKGRlZmF1bHRTZW1hbnRpY0RhdGVzW2tleV1bMF0ub3BlcmF0b3IsIG9wZXJhdG9yUGFyYW1zQXJyLCBudWxsLCBudWxsLCBudWxsKSBhcyBGaWx0ZXJDb25kaXRpb25zXG5cdFx0XHRdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmlsdGVyQ29uZGl0aW9ucztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRFZGl0U3RhdHVzRmlsdGVyKCk6IFJlY29yZDxzdHJpbmcsIEZpbHRlckNvbmRpdGlvbnNbXT4ge1xuXHRjb25zdCBvZmlsdGVyQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiA9IHt9O1xuXHRvZmlsdGVyQ29uZGl0aW9uc1tcIiRlZGl0U3RhdGVcIl0gPSBbXG5cdFx0Q29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcIkRSQUZUX0VESVRfU1RBVEVcIiwgW1wiQUxMXCJdLCBudWxsLCBudWxsLCBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkKSBhcyBGaWx0ZXJDb25kaXRpb25zXG5cdF07XG5cdHJldHVybiBvZmlsdGVyQ29uZGl0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbHRlckNvbmRpdGlvbnMob0NvbnRleHQ6IGFueSwgZmlsdGVyQ29uZGl0aW9uczogYW55KTogUmVjb3JkPHN0cmluZywgRmlsdGVyQ29uZGl0aW9uc1tdPiB7XG5cdGxldCBlZGl0U3RhdGVGaWx0ZXI7XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMSkuZ2V0UGF0aCgpLFxuXHRcdG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRJbnRlcmZhY2UoMSkuZ2V0TW9kZWwoKSxcblx0XHRlbnRpdHlUeXBlQW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofUBgKSxcblx0XHRlbnRpdHlUeXBlUHJvcGVydGllcyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9L2ApO1xuXHRpZiAoXG5cdFx0ZW50aXR5VHlwZUFubm90YXRpb25zICYmXG5cdFx0KGVudGl0eVR5cGVBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdIHx8XG5cdFx0XHRlbnRpdHlUeXBlQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZVwiXSlcblx0KSB7XG5cdFx0ZWRpdFN0YXRlRmlsdGVyID0gZ2V0RWRpdFN0YXR1c0ZpbHRlcigpO1xuXHR9XG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBmaWx0ZXJDb25kaXRpb25zPy5zZWxlY3Rpb25WYXJpYW50O1xuXHRjb25zdCBkZWZhdWx0U2VtYW50aWNEYXRlcyA9IGZpbHRlckNvbmRpdGlvbnM/LmRlZmF1bHRTZW1hbnRpY0RhdGVzIHx8IHt9O1xuXHRjb25zdCBkZWZhdWx0RmlsdGVycyA9IGdldERlZmF1bHRWYWx1ZUZpbHRlcnMob0NvbnRleHQsIGVudGl0eVR5cGVQcm9wZXJ0aWVzKTtcblx0Y29uc3QgZGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMgPSBnZXREZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyhvQ29udGV4dCwgZW50aXR5VHlwZVByb3BlcnRpZXMsIGRlZmF1bHRTZW1hbnRpY0RhdGVzKTtcblx0aWYgKHNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRmaWx0ZXJDb25kaXRpb25zID0gZ2V0RmlsdGVyc0NvbmRpdGlvbnNGcm9tU2VsZWN0aW9uVmFyaWFudChlbnRpdHlTZXRQYXRoLCBvTWV0YU1vZGVsLCBzZWxlY3Rpb25WYXJpYW50KTtcblx0fSBlbHNlIGlmIChkZWZhdWx0RmlsdGVycykge1xuXHRcdGZpbHRlckNvbmRpdGlvbnMgPSBkZWZhdWx0RmlsdGVycztcblx0fVxuXHRpZiAoZGVmYXVsdFNlbWFudGljRGF0ZUZpbHRlcnMpIHtcblx0XHQvLyBvbmx5IGZvciBzZW1hbnRpYyBkYXRlOlxuXHRcdC8vIDEuIHZhbHVlIGZyb20gbWFuaWZlc3QgZ2V0IG1lcmdlZCB3aXRoIFNWXG5cdFx0Ly8gMi4gbWFuaWZlc3QgdmFsdWUgaXMgZ2l2ZW4gcHJlZmVyZW5jZSB3aGVuIHRoZXJlIGlzIHNhbWUgc2VtYW50aWMgZGF0ZSBwcm9wZXJ0eSBpbiBTViBhbmQgbWFuaWZlc3Rcblx0XHRmaWx0ZXJDb25kaXRpb25zID0geyAuLi5maWx0ZXJDb25kaXRpb25zLCAuLi5kZWZhdWx0U2VtYW50aWNEYXRlRmlsdGVycyB9O1xuXHR9XG5cdGlmIChlZGl0U3RhdGVGaWx0ZXIpIHtcblx0XHRmaWx0ZXJDb25kaXRpb25zID0geyAuLi5maWx0ZXJDb25kaXRpb25zLCAuLi5lZGl0U3RhdGVGaWx0ZXIgfTtcblx0fVxuXHRyZXR1cm4gKE9iamVjdC5rZXlzKGZpbHRlckNvbmRpdGlvbnMpLmxlbmd0aCA+IDAgPyBKU09OLnN0cmluZ2lmeShmaWx0ZXJDb25kaXRpb25zKS5yZXBsYWNlKC8oW3t9XSkvZywgXCJcXFxcJDFcIikgOiB1bmRlZmluZWQpIGFzIGFueTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgU2VsZWN0aW9uVmFyaWFudFR5cGVUeXBlc30uXG4gKlxuICogQHBhcmFtIHNlcnZpY2VPYmplY3QgVGhlIG9iamVjdCB0byBiZSBjaGVja2VkLlxuICogQHJldHVybnMgV2hldGhlciB0aGUgYXJndW1lbnQgaXMgYSB7QGxpbmsgU2VsZWN0aW9uVmFyaWFudFR5cGVUeXBlc30uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1NlbGVjdGlvblZhcmlhbnQoc2VydmljZU9iamVjdDogdW5rbm93bik6IHNlcnZpY2VPYmplY3QgaXMgU2VsZWN0aW9uVmFyaWFudFR5cGVUeXBlcyB7XG5cdHJldHVybiAoc2VydmljZU9iamVjdCBhcyBTZWxlY3Rpb25WYXJpYW50VHlwZVR5cGVzKT8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLlNlbGVjdGlvblZhcmlhbnRUeXBlO1xufVxuXG5nZXRGaWx0ZXJDb25kaXRpb25zLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFpQkEsTUFBTUEsV0FBZ0MsR0FBRztJQUN4Q0MsUUFBUSxFQUFFLGFBQWE7SUFDdkJDLFVBQVUsRUFBRSxlQUFlO0lBQzNCQyxRQUFRLEVBQUUsYUFBYTtJQUN2QkMsS0FBSyxFQUFFLFVBQVU7SUFDakJDLFFBQVEsRUFB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
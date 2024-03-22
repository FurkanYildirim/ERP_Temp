/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Table", "sap/fe/core/converters/controls/ListReport/VisualFilters", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/m/library", "../Common/DataVisualization"], function (Table, VisualFilters, ConfigurableObject, IssueManager, Key, BindingToolkit, ModelHelper, TypeGuards, DataModelPathHelper, PropertyHelper, library, DataVisualization) {
  "use strict";

  var _exports = {};
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var StandardDynamicDateRangeKeys = library.StandardDynamicDateRangeKeys;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedTimezonePropertyPath = PropertyHelper.getAssociatedTimezonePropertyPath;
  var getAssociatedTextPropertyPath = PropertyHelper.getAssociatedTextPropertyPath;
  var getAssociatedCurrencyPropertyPath = PropertyHelper.getAssociatedCurrencyPropertyPath;
  var getTargetNavigationPath = DataModelPathHelper.getTargetNavigationPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isMultipleNavigationProperty = TypeGuards.isMultipleNavigationProperty;
  var isEntitySet = TypeGuards.isEntitySet;
  var isComplexType = TypeGuards.isComplexType;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getVisualFilters = VisualFilters.getVisualFilters;
  var isFilteringCaseSensitive = Table.isFilteringCaseSensitive;
  var getTypeConfig = Table.getTypeConfig;
  var getSelectionVariantConfiguration = Table.getSelectionVariantConfiguration;
  var filterFieldType;
  (function (filterFieldType) {
    filterFieldType["Default"] = "Default";
    filterFieldType["Slot"] = "Slot";
  })(filterFieldType || (filterFieldType = {}));
  const sEdmString = "Edm.String";
  const sStringDataType = "sap.ui.model.odata.type.String";
  /**
   * Enter all DataFields of a given FieldGroup into the filterFacetMap.
   *
   * @param fieldGroup
   * @returns The map of facets for the given FieldGroup
   */
  function getFieldGroupFilterGroups(fieldGroup) {
    const filterFacetMap = {};
    fieldGroup.Data.forEach(dataField => {
      if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataField") {
        var _fieldGroup$annotatio, _fieldGroup$annotatio2;
        filterFacetMap[dataField.Value.path] = {
          group: fieldGroup.fullyQualifiedName,
          groupLabel: compileExpression(getExpressionFromAnnotation(fieldGroup.Label || ((_fieldGroup$annotatio = fieldGroup.annotations) === null || _fieldGroup$annotatio === void 0 ? void 0 : (_fieldGroup$annotatio2 = _fieldGroup$annotatio.Common) === null || _fieldGroup$annotatio2 === void 0 ? void 0 : _fieldGroup$annotatio2.Label) || fieldGroup.qualifier)) || fieldGroup.qualifier
        };
      }
    });
    return filterFacetMap;
  }
  function getExcludedFilterProperties(selectionVariants) {
    return selectionVariants.reduce((previousValue, selectionVariant) => {
      selectionVariant.propertyNames.forEach(propertyName => {
        previousValue[propertyName] = true;
      });
      return previousValue;
    }, {});
  }

  /**
   * Check that all the tables for a dedicated entity set are configured as analytical tables.
   *
   * @param listReportTables List report tables
   * @param contextPath
   * @returns Is FilterBar search field hidden or not
   */
  function checkAllTableForEntitySetAreAnalytical(listReportTables, contextPath) {
    if (contextPath && listReportTables.length > 0) {
      return listReportTables.every(visualization => {
        return visualization.enableAnalytics && contextPath === visualization.annotation.collection;
      });
    }
    return false;
  }
  function getSelectionVariants(lrTableVisualizations, converterContext) {
    const selectionVariantPaths = [];
    return lrTableVisualizations.map(visualization => {
      const tableFilters = visualization.control.filters;
      const tableSVConfigs = [];
      for (const key in tableFilters) {
        if (Array.isArray(tableFilters[key].paths)) {
          const paths = tableFilters[key].paths;
          paths.forEach(path => {
            if (path && path.annotationPath && selectionVariantPaths.indexOf(path.annotationPath) === -1) {
              selectionVariantPaths.push(path.annotationPath);
              const selectionVariantConfig = getSelectionVariantConfiguration(path.annotationPath, converterContext);
              if (selectionVariantConfig) {
                tableSVConfigs.push(selectionVariantConfig);
              }
            }
          });
        }
      }
      return tableSVConfigs;
    }).reduce((svConfigs, selectionVariant) => svConfigs.concat(selectionVariant), []);
  }

  /**
   * Returns the condition path required for the condition model. It looks as follows:
   * <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
   *
   * @param entityType The root EntityType
   * @param propertyPath The full path to the target property
   * @returns The formatted condition path
   */
  const _getConditionPath = function (entityType, propertyPath) {
    const parts = propertyPath.split("/");
    let partialPath;
    let key = "";
    while (parts.length) {
      let part = parts.shift();
      partialPath = partialPath ? `${partialPath}/${part}` : part;
      const property = entityType.resolvePath(partialPath);
      if (isMultipleNavigationProperty(property)) {
        part += "*";
      }
      key = key ? `${key}/${part}` : part;
    }
    return key;
  };
  const _createFilterSelectionField = function (entityType, property, fullPropertyPath, includeHidden, converterContext) {
    var _property$annotations, _property$annotations2, _property$annotations3;
    // ignore complex property types and hidden annotated ones
    if (property && property.targetType === undefined && (includeHidden || ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf()) !== true)) {
      var _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8, _targetEntityType$ann, _targetEntityType$ann2, _targetEntityType$ann3;
      const targetEntityType = converterContext.getAnnotationEntityType(property),
        filterField = {
          key: KeyHelper.getSelectionFieldKeyFromPath(fullPropertyPath),
          annotationPath: converterContext.getAbsoluteAnnotationPath(fullPropertyPath),
          conditionPath: _getConditionPath(entityType, fullPropertyPath),
          availability: ((_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.UI) === null || _property$annotations5 === void 0 ? void 0 : (_property$annotations6 = _property$annotations5.HiddenFilter) === null || _property$annotations6 === void 0 ? void 0 : _property$annotations6.valueOf()) === true ? "Hidden" : "Adaptation",
          label: compileExpression(getExpressionFromAnnotation(((_property$annotations7 = property.annotations.Common) === null || _property$annotations7 === void 0 ? void 0 : (_property$annotations8 = _property$annotations7.Label) === null || _property$annotations8 === void 0 ? void 0 : _property$annotations8.valueOf()) || property.name)),
          group: targetEntityType.name,
          groupLabel: compileExpression(getExpressionFromAnnotation((targetEntityType === null || targetEntityType === void 0 ? void 0 : (_targetEntityType$ann = targetEntityType.annotations) === null || _targetEntityType$ann === void 0 ? void 0 : (_targetEntityType$ann2 = _targetEntityType$ann.Common) === null || _targetEntityType$ann2 === void 0 ? void 0 : (_targetEntityType$ann3 = _targetEntityType$ann2.Label) === null || _targetEntityType$ann3 === void 0 ? void 0 : _targetEntityType$ann3.valueOf()) || targetEntityType.name))
        };
      getSettingsOfDefaultFilterFields(filterField);
      return filterField;
    }
    return undefined;
  };

  /**
   * Retrieve the configuration for the technical property DraftAdministrativeData. Only relevant for CreationDateTime
   * and LastChangeDateTime, as they are displaying the timeframe related properties as a SemanticDateRange.
   *
   * @param filterField
   */
  const getSettingsOfDefaultFilterFields = function (filterField) {
    if (filterField.key === "DraftAdministrativeData::CreationDateTime" || filterField.key === "DraftAdministrativeData::LastChangeDateTime") {
      const standardDynamicDateRangeKeys = [StandardDynamicDateRangeKeys.TO, StandardDynamicDateRangeKeys.TOMORROW, StandardDynamicDateRangeKeys.NEXTWEEK, StandardDynamicDateRangeKeys.NEXTMONTH, StandardDynamicDateRangeKeys.NEXTQUARTER, StandardDynamicDateRangeKeys.NEXTYEAR];
      filterField.settings = {
        operatorConfiguration: [{
          path: "key",
          equals: standardDynamicDateRangeKeys.join(","),
          exclude: true
        }]
      };
    }
  };
  const _getSelectionFields = function (entityType, navigationPath, properties, includeHidden, converterContext) {
    const selectionFieldMap = {};
    if (properties) {
      properties.forEach(property => {
        const propertyPath = property.name;
        const fullPath = (navigationPath ? `${navigationPath}/` : "") + propertyPath;
        const selectionField = _createFilterSelectionField(entityType, property, fullPath, includeHidden, converterContext);
        if (selectionField) {
          selectionFieldMap[fullPath] = selectionField;
        }
      });
    }
    return selectionFieldMap;
  };
  const _getSelectionFieldsByPath = function (entityType, propertyPaths, includeHidden, converterContext) {
    let selectionFields = {};
    if (propertyPaths) {
      propertyPaths.forEach(propertyPath => {
        let localSelectionFields = {};
        const enhancedPath = enhanceDataModelPath(converterContext.getDataModelObjectPath(), propertyPath);
        const property = enhancedPath.targetObject;
        if (property === undefined || !includeHidden && enhancedPath.navigationProperties.find(navigationProperty => {
          var _navigationProperty$a, _navigationProperty$a2, _navigationProperty$a3;
          return ((_navigationProperty$a = navigationProperty.annotations) === null || _navigationProperty$a === void 0 ? void 0 : (_navigationProperty$a2 = _navigationProperty$a.UI) === null || _navigationProperty$a2 === void 0 ? void 0 : (_navigationProperty$a3 = _navigationProperty$a2.Hidden) === null || _navigationProperty$a3 === void 0 ? void 0 : _navigationProperty$a3.valueOf()) === true;
        })) {
          return;
        }
        if (isNavigationProperty(property)) {
          // handle navigation properties
          localSelectionFields = _getSelectionFields(entityType, propertyPath, property.targetType.entityProperties, includeHidden, converterContext);
        } else if (isComplexType(property.targetType)) {
          // handle ComplexType properties
          localSelectionFields = _getSelectionFields(entityType, propertyPath, property.targetType.properties, includeHidden, converterContext);
        } else {
          localSelectionFields = _getSelectionFields(entityType, getTargetNavigationPath(enhancedPath, true), [property], includeHidden, converterContext);
        }
        selectionFields = {
          ...selectionFields,
          ...localSelectionFields
        };
      });
    }
    return selectionFields;
  };
  const _getFilterField = function (filterFields, propertyPath, converterContext, entityType) {
    let filterField = filterFields[propertyPath];
    if (filterField) {
      delete filterFields[propertyPath];
    } else {
      filterField = _createFilterSelectionField(entityType, entityType.resolvePath(propertyPath), propertyPath, true, converterContext);
    }
    if (!filterField) {
      var _converterContext$get;
      (_converterContext$get = converterContext.getDiagnostics()) === null || _converterContext$get === void 0 ? void 0 : _converterContext$get.addIssue(IssueCategory.Annotation, IssueSeverity.High, IssueType.MISSING_SELECTIONFIELD);
    }
    // defined SelectionFields are available by default
    if (filterField) {
      var _entityType$annotatio, _entityType$annotatio2;
      filterField.availability = filterField.availability === "Hidden" ? "Hidden" : "Default";
      filterField.isParameter = !!((_entityType$annotatio = entityType.annotations) !== null && _entityType$annotatio !== void 0 && (_entityType$annotatio2 = _entityType$annotatio.Common) !== null && _entityType$annotatio2 !== void 0 && _entityType$annotatio2.ResultContext);
    }
    return filterField;
  };
  const _getDefaultFilterFields = function (aSelectOptions, entityType, converterContext, excludedFilterProperties, annotatedSelectionFields) {
    const selectionFields = [];
    const UISelectionFields = {};
    const properties = entityType.entityProperties;
    // Using entityType instead of entitySet
    annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.forEach(SelectionField => {
      UISelectionFields[SelectionField.value] = true;
    });
    if (aSelectOptions && aSelectOptions.length > 0) {
      aSelectOptions === null || aSelectOptions === void 0 ? void 0 : aSelectOptions.forEach(selectOption => {
        const propertyName = selectOption.PropertyName;
        const sPropertyPath = propertyName === null || propertyName === void 0 ? void 0 : propertyName.value;
        const currentSelectionFields = {};
        annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.forEach(SelectionField => {
          currentSelectionFields[SelectionField.value] = true;
        });
        if (sPropertyPath && !(sPropertyPath in excludedFilterProperties)) {
          if (!(sPropertyPath in currentSelectionFields)) {
            const FilterField = getFilterField(sPropertyPath, converterContext, entityType);
            if (FilterField) {
              selectionFields.push(FilterField);
            }
          }
        }
      });
    } else if (properties) {
      properties.forEach(property => {
        var _property$annotations9, _property$annotations10;
        const defaultFilterValue = (_property$annotations9 = property.annotations) === null || _property$annotations9 === void 0 ? void 0 : (_property$annotations10 = _property$annotations9.Common) === null || _property$annotations10 === void 0 ? void 0 : _property$annotations10.FilterDefaultValue;
        const propertyPath = property.name;
        if (!(propertyPath in excludedFilterProperties)) {
          if (defaultFilterValue && !(propertyPath in UISelectionFields)) {
            const FilterField = getFilterField(propertyPath, converterContext, entityType);
            if (FilterField) {
              selectionFields.push(FilterField);
            }
          }
        }
      });
    }
    return selectionFields;
  };

  /**
   * Get all parameter filter fields in case of a parameterized service.
   *
   * @param converterContext
   * @returns An array of parameter FilterFields
   */
  function _getParameterFields(converterContext) {
    var _parameterEntityType$, _parameterEntityType$2;
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    const parameterEntityType = dataModelObjectPath.startingEntitySet.entityType;
    const isParameterized = !!((_parameterEntityType$ = parameterEntityType.annotations) !== null && _parameterEntityType$ !== void 0 && (_parameterEntityType$2 = _parameterEntityType$.Common) !== null && _parameterEntityType$2 !== void 0 && _parameterEntityType$2.ResultContext) && !dataModelObjectPath.targetEntitySet;
    const parameterConverterContext = isParameterized && converterContext.getConverterContextFor(`/${dataModelObjectPath.startingEntitySet.name}`);
    return parameterConverterContext ? parameterEntityType.entityProperties.map(function (property) {
      return _getFilterField({}, property.name, parameterConverterContext, parameterEntityType);
    }) : [];
  }

  /**
   * Determines if the FilterBar search field is hidden or not.
   *
   * @param listReportTables The list report tables
   * @param charts The ALP charts
   * @param converterContext The converter context
   * @returns The information if the FilterBar search field is hidden or not
   */
  const getFilterBarHideBasicSearch = function (listReportTables, charts, converterContext) {
    // Check if charts allow search
    const noSearchInCharts = charts.length === 0 || charts.every(chart => !chart.applySupported.enableSearch);

    // Check if all tables are analytical and none of them allow for search
    // or all tables are TreeTable and none of them allow for search
    const noSearchInTables = listReportTables.length === 0 || listReportTables.every(table => (table.enableAnalytics || table.control.type === "TreeTable") && !table.enableBasicSearch);
    const contextPath = converterContext.getContextPath();
    if (contextPath && noSearchInCharts && noSearchInTables) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Retrieves filter fields from the manifest.
   *
   * @param entityType The current entityType
   * @param converterContext The converter context
   * @returns The filter fields defined in the manifest
   */
  _exports.getFilterBarHideBasicSearch = getFilterBarHideBasicSearch;
  const getManifestFilterFields = function (entityType, converterContext) {
    const fbConfig = converterContext.getManifestWrapper().getFilterConfiguration();
    const definedFilterFields = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.filterFields) || {};
    const selectionFields = _getSelectionFieldsByPath(entityType, Object.keys(definedFilterFields).map(key => KeyHelper.getPathFromSelectionFieldKey(key)), true, converterContext);
    const filterFields = {};
    for (const sKey in definedFilterFields) {
      const filterField = definedFilterFields[sKey];
      const propertyName = KeyHelper.getPathFromSelectionFieldKey(sKey);
      const selectionField = selectionFields[propertyName];
      const type = filterField.type === "Slot" ? filterFieldType.Slot : filterFieldType.Default;
      const visualFilter = filterField && filterField !== null && filterField !== void 0 && filterField.visualFilter ? getVisualFilters(entityType, converterContext, sKey, definedFilterFields) : undefined;
      filterFields[sKey] = {
        key: sKey,
        type: type,
        slotName: (filterField === null || filterField === void 0 ? void 0 : filterField.slotName) || sKey,
        annotationPath: selectionField === null || selectionField === void 0 ? void 0 : selectionField.annotationPath,
        conditionPath: (selectionField === null || selectionField === void 0 ? void 0 : selectionField.conditionPath) || propertyName,
        template: filterField.template,
        label: filterField.label,
        position: filterField.position || {
          placement: Placement.After
        },
        availability: filterField.availability || "Default",
        settings: filterField.settings,
        visualFilter: visualFilter,
        required: filterField.required
      };
    }
    return filterFields;
  };
  _exports.getManifestFilterFields = getManifestFilterFields;
  const getFilterField = function (propertyPath, converterContext, entityType) {
    return _getFilterField({}, propertyPath, converterContext, entityType);
  };
  _exports.getFilterField = getFilterField;
  const getFilterRestrictions = function (oFilterRestrictionsAnnotation, sRestriction) {
    let aProps = [];
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
      aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty) {
        return oProperty.value;
      });
    }
    return aProps;
  };
  _exports.getFilterRestrictions = getFilterRestrictions;
  const getFilterAllowedExpression = function (oFilterRestrictionsAnnotation) {
    const mAllowedExpressions = {};
    if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions) {
      oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty) {
        var _oProperty$Property;
        //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
        if ((_oProperty$Property = oProperty.Property) !== null && _oProperty$Property !== void 0 && _oProperty$Property.value && oProperty.AllowedExpressions) {
          var _oProperty$Property2;
          if (mAllowedExpressions[(_oProperty$Property2 = oProperty.Property) === null || _oProperty$Property2 === void 0 ? void 0 : _oProperty$Property2.value]) {
            var _oProperty$Property3;
            mAllowedExpressions[(_oProperty$Property3 = oProperty.Property) === null || _oProperty$Property3 === void 0 ? void 0 : _oProperty$Property3.value].push(oProperty.AllowedExpressions.toString());
          } else {
            var _oProperty$Property4;
            mAllowedExpressions[(_oProperty$Property4 = oProperty.Property) === null || _oProperty$Property4 === void 0 ? void 0 : _oProperty$Property4.value] = [oProperty.AllowedExpressions.toString()];
          }
        }
      });
    }
    return mAllowedExpressions;
  };
  _exports.getFilterAllowedExpression = getFilterAllowedExpression;
  const getSearchFilterPropertyInfo = function () {
    return {
      name: "$search",
      path: "$search",
      dataType: sStringDataType,
      maxConditions: 1
    };
  };
  const getEditStateFilterPropertyInfo = function () {
    return {
      name: "$editState",
      path: "$editState",
      groupLabel: "",
      group: "",
      dataType: sStringDataType,
      hiddenFilter: false
    };
  };
  const getSearchRestrictions = function (converterContext) {
    var _entitySet$annotation;
    const entitySet = converterContext.getEntitySet();
    return isEntitySet(entitySet) ? (_entitySet$annotation = entitySet.annotations.Capabilities) === null || _entitySet$annotation === void 0 ? void 0 : _entitySet$annotation.SearchRestrictions : undefined;
  };
  const getNavigationRestrictions = function (converterContext, sNavigationPath) {
    var _converterContext$get2, _converterContext$get3, _converterContext$get4;
    const oNavigationRestrictions = (_converterContext$get2 = converterContext.getEntitySet()) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.annotations) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.Capabilities) === null || _converterContext$get4 === void 0 ? void 0 : _converterContext$get4.NavigationRestrictions;
    const aRestrictedProperties = oNavigationRestrictions && oNavigationRestrictions.RestrictedProperties;
    return aRestrictedProperties && aRestrictedProperties.find(function (oRestrictedProperty) {
      return oRestrictedProperty && oRestrictedProperty.NavigationProperty && oRestrictedProperty.NavigationProperty.value === sNavigationPath;
    });
  };
  _exports.getNavigationRestrictions = getNavigationRestrictions;
  const _fetchBasicPropertyInfo = function (oFilterFieldInfo) {
    return {
      key: oFilterFieldInfo.key,
      annotationPath: oFilterFieldInfo.annotationPath,
      conditionPath: oFilterFieldInfo.conditionPath,
      name: oFilterFieldInfo.conditionPath,
      label: oFilterFieldInfo.label,
      hiddenFilter: oFilterFieldInfo.availability === "Hidden",
      display: "Value",
      isParameter: oFilterFieldInfo.isParameter,
      caseSensitive: oFilterFieldInfo.caseSensitive,
      availability: oFilterFieldInfo.availability,
      position: oFilterFieldInfo.position,
      type: oFilterFieldInfo.type,
      template: oFilterFieldInfo.template,
      menu: oFilterFieldInfo.menu,
      required: oFilterFieldInfo.required
    };
  };
  const getSpecificAllowedExpression = function (aExpressions) {
    const aAllowedExpressionsPriority = ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"];
    aExpressions.sort(function (a, b) {
      return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
    });
    return aExpressions[0];
  };
  _exports.getSpecificAllowedExpression = getSpecificAllowedExpression;
  const displayMode = function (oPropertyAnnotations, oCollectionAnnotations) {
    var _oPropertyAnnotations, _oPropertyAnnotations2, _oPropertyAnnotations3, _oPropertyAnnotations4, _oPropertyAnnotations5, _oCollectionAnnotatio;
    const oTextAnnotation = oPropertyAnnotations === null || oPropertyAnnotations === void 0 ? void 0 : (_oPropertyAnnotations = oPropertyAnnotations.Common) === null || _oPropertyAnnotations === void 0 ? void 0 : _oPropertyAnnotations.Text,
      oTextArrangmentAnnotation = oTextAnnotation && (oPropertyAnnotations && (oPropertyAnnotations === null || oPropertyAnnotations === void 0 ? void 0 : (_oPropertyAnnotations2 = oPropertyAnnotations.Common) === null || _oPropertyAnnotations2 === void 0 ? void 0 : (_oPropertyAnnotations3 = _oPropertyAnnotations2.Text) === null || _oPropertyAnnotations3 === void 0 ? void 0 : (_oPropertyAnnotations4 = _oPropertyAnnotations3.annotations) === null || _oPropertyAnnotations4 === void 0 ? void 0 : (_oPropertyAnnotations5 = _oPropertyAnnotations4.UI) === null || _oPropertyAnnotations5 === void 0 ? void 0 : _oPropertyAnnotations5.TextArrangement) || oCollectionAnnotations && (oCollectionAnnotations === null || oCollectionAnnotations === void 0 ? void 0 : (_oCollectionAnnotatio = oCollectionAnnotations.UI) === null || _oCollectionAnnotatio === void 0 ? void 0 : _oCollectionAnnotatio.TextArrangement));
    if (oTextArrangmentAnnotation) {
      if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextOnly") {
        return "Description";
      } else if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextLast") {
        return "ValueDescription";
      }
      return "DescriptionValue"; //TextFirst
    }

    return oTextAnnotation ? "DescriptionValue" : "Value";
  };
  _exports.displayMode = displayMode;
  const fetchPropertyInfo = function (converterContext, oFilterFieldInfo, oTypeConfig) {
    var _converterContext$get5;
    let oPropertyInfo = _fetchBasicPropertyInfo(oFilterFieldInfo);
    const sAnnotationPath = oFilterFieldInfo.annotationPath;
    if (!sAnnotationPath) {
      return oPropertyInfo;
    }
    const targetPropertyObject = converterContext.getConverterContextFor(sAnnotationPath).getDataModelObjectPath().targetObject;
    const oPropertyAnnotations = targetPropertyObject === null || targetPropertyObject === void 0 ? void 0 : targetPropertyObject.annotations;
    const oCollectionAnnotations = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get5 = converterContext.getDataModelObjectPath().targetObject) === null || _converterContext$get5 === void 0 ? void 0 : _converterContext$get5.annotations;
    const oFormatOptions = oTypeConfig.formatOptions;
    const oConstraints = oTypeConfig.constraints;
    oPropertyInfo = Object.assign(oPropertyInfo, {
      formatOptions: oFormatOptions,
      constraints: oConstraints,
      display: displayMode(oPropertyAnnotations, oCollectionAnnotations)
    });
    return oPropertyInfo;
  };
  _exports.fetchPropertyInfo = fetchPropertyInfo;
  const isMultiValue = function (oProperty) {
    let bIsMultiValue = true;
    //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
    switch (oProperty.filterExpression) {
      case "SearchExpression":
      case "SingleRange":
      case "SingleValue":
        bIsMultiValue = false;
        break;
      default:
        break;
    }
    if (oProperty.type && oProperty.type.indexOf("Boolean") > 0) {
      bIsMultiValue = false;
    }
    return bIsMultiValue;
  };
  _exports.isMultiValue = isMultiValue;
  const _isFilterableNavigationProperty = function (entry) {
    return (entry.$Type === "com.sap.vocabularies.UI.v1.DataField" || entry.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || entry.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath") && entry.Value.path.includes("/");
  };

  /**
   * Adds the additional property which references to the unit, timezone, textArrangement or currency from a data field.
   *
   * @param dataField The data field to be considered
   * @param converterContext The converter context
   * @param navProperties The list of navigation properties
   */
  const addChildNavigationProperties = function (dataField, converterContext, navProperties) {
    var _Value;
    const targetProperty = (_Value = dataField.Value) === null || _Value === void 0 ? void 0 : _Value.$target;
    if (targetProperty) {
      const additionalPropertyPath = getAssociatedTextPropertyPath(targetProperty) || getAssociatedCurrencyPropertyPath(targetProperty) || getAssociatedUnitPropertyPath(targetProperty) || getAssociatedTimezonePropertyPath(targetProperty);
      const navigationProperty = additionalPropertyPath ? enhanceDataModelPath(converterContext.getDataModelObjectPath(), additionalPropertyPath).navigationProperties : undefined;
      if (navigationProperty !== null && navigationProperty !== void 0 && navigationProperty.length) {
        const navigationPropertyPath = navigationProperty[0].name;
        if (!navProperties.includes(navigationPropertyPath)) {
          navProperties.push(navigationPropertyPath);
        }
      }
    }
  };

  /**
   * Gets used navigation properties for available dataField.
   *
   * @param navProperties The list of navigation properties
   * @param dataField The data field to be considered
   * @param converterContext The converter context
   * @returns The list of navigation properties
   */
  const getNavigationPropertiesRecursively = function (navProperties, dataField, converterContext) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        switch ((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$ta = _dataField$Target.$target) === null || _dataField$Target$$ta === void 0 ? void 0 : _dataField$Target$$ta.$Type) {
          case "com.sap.vocabularies.UI.v1.FieldGroupType":
            (_dataField$Target$$ta2 = dataField.Target.$target.Data) === null || _dataField$Target$$ta2 === void 0 ? void 0 : _dataField$Target$$ta2.forEach(innerDataField => {
              getNavigationPropertiesRecursively(navProperties, innerDataField, converterContext);
            });
            break;
          default:
            break;
        }
        break;
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        if (_isFilterableNavigationProperty(dataField)) {
          const navigationPropertyPath = enhanceDataModelPath(converterContext.getDataModelObjectPath(), dataField.Value.path).navigationProperties[0].name;
          if (!navProperties.includes(navigationPropertyPath)) {
            navProperties.push(navigationPropertyPath);
          }
        }
        // Additional property from text arrangement/units/currencies/timezone...
        addChildNavigationProperties(dataField, converterContext, navProperties);
        break;
      default:
        break;
    }
    return navProperties;
  };
  const getAnnotatedSelectionFieldData = function (converterContext) {
    var _converterContext$get6, _entityType$annotatio3, _entityType$annotatio4;
    let lrTables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let annotationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    let includeHidden = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    let lineItemTerm = arguments.length > 4 ? arguments[4] : undefined;
    // Fetch all selectionVariants defined in the different visualizations and different views (multi table mode)
    const selectionVariants = getSelectionVariants(lrTables, converterContext);

    // create a map of properties to be used in selection variants
    const excludedFilterProperties = getExcludedFilterProperties(selectionVariants);
    const entityType = converterContext.getEntityType();
    //Filters which has to be added which is part of SV/Default annotations but not present in the SelectionFields
    const annotatedSelectionFields = annotationPath && ((_converterContext$get6 = converterContext.getEntityTypeAnnotation(annotationPath)) === null || _converterContext$get6 === void 0 ? void 0 : _converterContext$get6.annotation) || ((_entityType$annotatio3 = entityType.annotations) === null || _entityType$annotatio3 === void 0 ? void 0 : (_entityType$annotatio4 = _entityType$annotatio3.UI) === null || _entityType$annotatio4 === void 0 ? void 0 : _entityType$annotatio4.SelectionFields) || [];
    let navProperties = [];
    if (lrTables.length === 0 && !!lineItemTerm) {
      var _converterContext$get7;
      (_converterContext$get7 = converterContext.getEntityTypeAnnotation(lineItemTerm).annotation) === null || _converterContext$get7 === void 0 ? void 0 : _converterContext$get7.forEach(dataField => {
        navProperties = getNavigationPropertiesRecursively(navProperties, dataField, converterContext);
      });
    }
    if (ModelHelper.isDraftRoot(converterContext.getEntitySet())) {
      navProperties.push("DraftAdministrativeData/CreationDateTime", "DraftAdministrativeData/CreatedByUser", "DraftAdministrativeData/LastChangeDateTime", "DraftAdministrativeData/LastChangedByUser");
    }

    // create a map of all potential filter fields based on...
    const filterFields = {
      // ...non hidden properties of the entity
      ..._getSelectionFields(entityType, "", entityType.entityProperties, includeHidden, converterContext),
      // ... non hidden properties of navigation properties
      ..._getSelectionFieldsByPath(entityType, navProperties, false, converterContext),
      // ...additional manifest defined navigation properties
      ..._getSelectionFieldsByPath(entityType, converterContext.getManifestWrapper().getFilterConfiguration().navigationProperties, includeHidden, converterContext)
    };
    let aSelectOptions = [];
    const selectionVariant = getSelectionVariant(entityType, converterContext);
    if (selectionVariant) {
      aSelectOptions = selectionVariant.SelectOptions;
    }
    const propertyInfoFields = (annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.reduce((selectionFields, selectionField) => {
      const propertyPath = selectionField.value;
      if (!(propertyPath in excludedFilterProperties)) {
        let navigationPath;
        if (annotationPath.startsWith("@com.sap.vocabularies.UI.v1.SelectionFields")) {
          navigationPath = "";
        } else {
          navigationPath = annotationPath.split("/@com.sap.vocabularies.UI.v1.SelectionFields")[0];
        }
        const filterPropertyPath = navigationPath ? navigationPath + "/" + propertyPath : propertyPath;
        const filterField = _getFilterField(filterFields, filterPropertyPath, converterContext, entityType);
        if (filterField) {
          filterField.group = "";
          filterField.groupLabel = "";
          selectionFields.push(filterField);
        }
      }
      return selectionFields;
    }, [])) || [];
    const defaultFilterFields = _getDefaultFilterFields(aSelectOptions, entityType, converterContext, excludedFilterProperties, annotatedSelectionFields);
    return {
      excludedFilterProperties: excludedFilterProperties,
      entityType: entityType,
      annotatedSelectionFields: annotatedSelectionFields,
      filterFields: filterFields,
      propertyInfoFields: propertyInfoFields,
      defaultFilterFields: defaultFilterFields
    };
  };
  const fetchTypeConfig = function (property) {
    const oTypeConfig = getTypeConfig(property, property === null || property === void 0 ? void 0 : property.type);
    if ((property === null || property === void 0 ? void 0 : property.type) === sEdmString && (oTypeConfig.constraints.nullable === undefined || oTypeConfig.constraints.nullable === true)) {
      oTypeConfig.formatOptions.parseKeepsEmptyString = false;
    }
    return oTypeConfig;
  };
  _exports.fetchTypeConfig = fetchTypeConfig;
  const assignDataTypeToPropertyInfo = function (propertyInfoField, converterContext, aRequiredProps, aTypeConfig) {
    let oPropertyInfo = fetchPropertyInfo(converterContext, propertyInfoField, aTypeConfig[propertyInfoField.key]),
      sPropertyPath = "";
    if (propertyInfoField.conditionPath) {
      sPropertyPath = propertyInfoField.conditionPath.replace(/\+|\*/g, "");
    }
    if (oPropertyInfo) {
      oPropertyInfo = Object.assign(oPropertyInfo, {
        maxConditions: !oPropertyInfo.isParameter && isMultiValue(oPropertyInfo) ? -1 : 1,
        required: propertyInfoField.required ?? (oPropertyInfo.isParameter || aRequiredProps.indexOf(sPropertyPath) >= 0),
        caseSensitive: isFilteringCaseSensitive(converterContext),
        dataType: aTypeConfig[propertyInfoField.key].type
      });
    }
    return oPropertyInfo;
  };
  _exports.assignDataTypeToPropertyInfo = assignDataTypeToPropertyInfo;
  const processSelectionFields = function (propertyInfoFields, converterContext, defaultValuePropertyFields) {
    var _entitySet$annotation2;
    //get TypeConfig function
    const selectionFieldTypes = [];
    const aTypeConfig = {};
    if (defaultValuePropertyFields) {
      propertyInfoFields = propertyInfoFields.concat(defaultValuePropertyFields);
    }
    //add typeConfig
    propertyInfoFields.forEach(function (parameterField) {
      if (parameterField.annotationPath) {
        const propertyConvertyContext = converterContext.getConverterContextFor(parameterField.annotationPath);
        const propertyTargetObject = propertyConvertyContext.getDataModelObjectPath().targetObject;
        selectionFieldTypes.push(propertyTargetObject === null || propertyTargetObject === void 0 ? void 0 : propertyTargetObject.type);
        const oTypeConfig = fetchTypeConfig(propertyTargetObject);
        aTypeConfig[parameterField.key] = oTypeConfig;
      } else {
        selectionFieldTypes.push(sEdmString);
        aTypeConfig[parameterField.key] = {
          type: sStringDataType
        };
      }
    });

    // filterRestrictions
    const entitySet = converterContext.getEntitySet();
    const oFilterRestrictions = isEntitySet(entitySet) ? (_entitySet$annotation2 = entitySet.annotations.Capabilities) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.FilterRestrictions : undefined;
    const oRet = {};
    oRet.RequiredProperties = getFilterRestrictions(oFilterRestrictions, "RequiredProperties") || [];
    oRet.NonFilterableProperties = getFilterRestrictions(oFilterRestrictions, "NonFilterableProperties") || [];
    oRet.FilterAllowedExpressions = getFilterAllowedExpression(oFilterRestrictions);
    const sEntitySetPath = converterContext.getContextPath();
    const aPathParts = sEntitySetPath.split("/");
    if (aPathParts.length > 2) {
      const sNavigationPath = aPathParts[aPathParts.length - 1];
      aPathParts.splice(-1, 1);
      const oNavigationRestrictions = getNavigationRestrictions(converterContext, sNavigationPath);
      const oNavigationFilterRestrictions = oNavigationRestrictions && oNavigationRestrictions.FilterRestrictions;
      oRet.RequiredProperties = oRet.RequiredProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "RequiredProperties") || []);
      oRet.NonFilterableProperties = oRet.NonFilterableProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "NonFilterableProperties") || []);
      oRet.FilterAllowedExpressions = {
        ...(getFilterAllowedExpression(oNavigationFilterRestrictions) || {}),
        ...oRet.FilterAllowedExpressions
      };
    }
    const aRequiredProps = oRet.RequiredProperties;
    const aNonFilterableProps = oRet.NonFilterableProperties;
    const aFetchedProperties = [];

    // process the fields to add necessary properties
    propertyInfoFields.forEach(function (propertyInfoField) {
      const sPropertyPath = propertyInfoField.conditionPath.replace(/\+|\*/g, "");
      if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
        const oPropertyInfo = assignDataTypeToPropertyInfo(propertyInfoField, converterContext, aRequiredProps, aTypeConfig);
        aFetchedProperties.push(oPropertyInfo);
      }
    });

    //add edit
    const dataModelObjectPath = converterContext.getDataModelObjectPath();
    if (ModelHelper.isObjectPathDraftSupported(dataModelObjectPath)) {
      aFetchedProperties.push(getEditStateFilterPropertyInfo());
    }
    // add search
    const searchRestrictions = getSearchRestrictions(converterContext);
    const hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
    if (sEntitySetPath && hideBasicSearch !== true) {
      if (!searchRestrictions || searchRestrictions !== null && searchRestrictions !== void 0 && searchRestrictions.Searchable) {
        aFetchedProperties.push(getSearchFilterPropertyInfo());
      }
    }
    return aFetchedProperties;
  };
  _exports.processSelectionFields = processSelectionFields;
  const insertCustomManifestElements = function (filterFields, entityType, converterContext) {
    return insertCustomElements(filterFields, getManifestFilterFields(entityType, converterContext), {
      availability: OverrideType.overwrite,
      label: OverrideType.overwrite,
      type: OverrideType.overwrite,
      position: OverrideType.overwrite,
      slotName: OverrideType.overwrite,
      template: OverrideType.overwrite,
      settings: OverrideType.overwrite,
      visualFilter: OverrideType.overwrite,
      required: OverrideType.overwrite
    });
  };

  /**
   * Retrieve the configuration for the selection fields that will be used within the filter bar
   * This configuration takes into account the annotation and the selection variants.
   *
   * @param converterContext
   * @param lrTables
   * @param annotationPath
   * @param [includeHidden]
   * @param [lineItemTerm]
   * @returns An array of selection fields
   */
  _exports.insertCustomManifestElements = insertCustomManifestElements;
  const getSelectionFields = function (converterContext) {
    var _entityType$annotatio5, _entityType$annotatio6;
    let lrTables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    let annotationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    let includeHidden = arguments.length > 3 ? arguments[3] : undefined;
    let lineItemTerm = arguments.length > 4 ? arguments[4] : undefined;
    const oAnnotatedSelectionFieldData = getAnnotatedSelectionFieldData(converterContext, lrTables, annotationPath, includeHidden, lineItemTerm);
    const parameterFields = _getParameterFields(converterContext);
    let propertyInfoFields = oAnnotatedSelectionFieldData.propertyInfoFields;
    const entityType = oAnnotatedSelectionFieldData.entityType;
    propertyInfoFields = parameterFields.concat(propertyInfoFields);
    propertyInfoFields = insertCustomManifestElements(propertyInfoFields, entityType, converterContext);
    const aFetchedProperties = processSelectionFields(propertyInfoFields, converterContext, oAnnotatedSelectionFieldData.defaultFilterFields);
    aFetchedProperties.sort(function (a, b) {
      if (a.groupLabel === undefined || a.groupLabel === null) {
        return -1;
      }
      if (b.groupLabel === undefined || b.groupLabel === null) {
        return 1;
      }
      return a.groupLabel.localeCompare(b.groupLabel);
    });
    let sFetchProperties = JSON.stringify(aFetchedProperties);
    sFetchProperties = sFetchProperties.replace(/\{/g, "\\{");
    sFetchProperties = sFetchProperties.replace(/\}/g, "\\}");
    const sPropertyInfo = sFetchProperties;
    // end of propertyFields processing

    // to populate selection fields
    let propSelectionFields = JSON.parse(JSON.stringify(oAnnotatedSelectionFieldData.propertyInfoFields));
    propSelectionFields = parameterFields.concat(propSelectionFields);
    // create a map of properties to be used in selection variants
    const excludedFilterProperties = oAnnotatedSelectionFieldData.excludedFilterProperties;
    const filterFacets = entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio5 = entityType.annotations) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.UI) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.FilterFacets;
    let filterFacetMap = {};
    const aFieldGroups = converterContext.getAnnotationsByTerm("UI", "com.sap.vocabularies.UI.v1.FieldGroup");
    if (filterFacets === undefined || filterFacets.length < 0) {
      for (const i in aFieldGroups) {
        filterFacetMap = {
          ...filterFacetMap,
          ...getFieldGroupFilterGroups(aFieldGroups[i])
        };
      }
    } else {
      filterFacetMap = filterFacets.reduce((previousValue, filterFacet) => {
        for (let i = 0; i < (filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Target = filterFacet.Target) === null || _filterFacet$Target === void 0 ? void 0 : (_filterFacet$Target$$ = _filterFacet$Target.$target) === null || _filterFacet$Target$$ === void 0 ? void 0 : (_filterFacet$Target$$2 = _filterFacet$Target$$.Data) === null || _filterFacet$Target$$2 === void 0 ? void 0 : _filterFacet$Target$$2.length); i++) {
          var _filterFacet$Target, _filterFacet$Target$$, _filterFacet$Target$$2, _filterFacet$Target2, _filterFacet$Target2$, _filterFacet$Target2$2, _filterFacet$Target2$3, _filterFacet$ID, _filterFacet$Label;
          previousValue[filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Target2 = filterFacet.Target) === null || _filterFacet$Target2 === void 0 ? void 0 : (_filterFacet$Target2$ = _filterFacet$Target2.$target) === null || _filterFacet$Target2$ === void 0 ? void 0 : (_filterFacet$Target2$2 = _filterFacet$Target2$.Data[i]) === null || _filterFacet$Target2$2 === void 0 ? void 0 : (_filterFacet$Target2$3 = _filterFacet$Target2$2.Value) === null || _filterFacet$Target2$3 === void 0 ? void 0 : _filterFacet$Target2$3.path] = {
            group: filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$ID = filterFacet.ID) === null || _filterFacet$ID === void 0 ? void 0 : _filterFacet$ID.toString(),
            groupLabel: filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Label = filterFacet.Label) === null || _filterFacet$Label === void 0 ? void 0 : _filterFacet$Label.toString()
          };
        }
        return previousValue;
      }, {});
    }

    // create a map of all potential filter fields based on...
    const filterFields = oAnnotatedSelectionFieldData.filterFields;

    // finally create final list of filter fields by adding the SelectionFields first (order matters)...
    let allFilters = propSelectionFields

    // ...and adding remaining filter fields, that are not used in a SelectionVariant (order doesn't matter)
    .concat(Object.keys(filterFields).filter(propertyPath => !(propertyPath in excludedFilterProperties)).map(propertyPath => {
      return Object.assign(filterFields[propertyPath], filterFacetMap[propertyPath]);
    }));
    const sContextPath = converterContext.getContextPath();

    //if all tables are analytical tables "aggregatable" properties must be excluded
    if (checkAllTableForEntitySetAreAnalytical(lrTables, sContextPath)) {
      // Currently all agregates are root entity properties (no properties coming from navigation) and all
      // tables with same entitySet gets same aggreagte configuration that's why we can use first table into
      // LR to get aggregates (without currency/unit properties since we expect to be able to filter them).
      const aggregates = lrTables[0].aggregates;
      if (aggregates) {
        const aggregatableProperties = Object.keys(aggregates).map(aggregateKey => aggregates[aggregateKey].relativePath);
        allFilters = allFilters.filter(filterField => {
          return aggregatableProperties.indexOf(filterField.key) === -1;
        });
      }
    }
    const selectionFields = insertCustomManifestElements(allFilters, entityType, converterContext);

    // Add caseSensitive property to all selection fields.
    const isCaseSensitive = isFilteringCaseSensitive(converterContext);
    selectionFields.forEach(filterField => {
      filterField.caseSensitive = isCaseSensitive;
    });
    return {
      selectionFields,
      sPropertyInfo
    };
  };

  /**
   * Determines whether the filter bar inside a value help dialog should be expanded. This is true if one of the following conditions hold:
   * (1) a filter property is mandatory,
   * (2) no search field exists (entity isn't search enabled),
   * (3) when the data isn't loaded by default (annotation FetchValues = 2).
   *
   * @param converterContext The converter context
   * @param filterRestrictionsAnnotation The FilterRestriction annotation
   * @param valueList The ValueList annotation
   * @returns The value for expandFilterFields
   */
  _exports.getSelectionFields = getSelectionFields;
  const getExpandFilterFields = function (converterContext, filterRestrictionsAnnotation, valueList) {
    const requiredProperties = getFilterRestrictions(filterRestrictionsAnnotation, "RequiredProperties");
    const searchRestrictions = getSearchRestrictions(converterContext);
    const hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
    if (requiredProperties.length > 0 || hideBasicSearch || (valueList === null || valueList === void 0 ? void 0 : valueList.FetchValues) === 2) {
      return true;
    }
    return false;
  };
  _exports.getExpandFilterFields = getExpandFilterFields;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWx0ZXJGaWVsZFR5cGUiLCJzRWRtU3RyaW5nIiwic1N0cmluZ0RhdGFUeXBlIiwiZ2V0RmllbGRHcm91cEZpbHRlckdyb3VwcyIsImZpZWxkR3JvdXAiLCJmaWx0ZXJGYWNldE1hcCIsIkRhdGEiLCJmb3JFYWNoIiwiZGF0YUZpZWxkIiwiJFR5cGUiLCJWYWx1ZSIsInBhdGgiLCJncm91cCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImdyb3VwTGFiZWwiLCJjb21waWxlRXhwcmVzc2lvbiIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIkxhYmVsIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJxdWFsaWZpZXIiLCJnZXRFeGNsdWRlZEZpbHRlclByb3BlcnRpZXMiLCJzZWxlY3Rpb25WYXJpYW50cyIsInJlZHVjZSIsInByZXZpb3VzVmFsdWUiLCJzZWxlY3Rpb25WYXJpYW50IiwicHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZSIsImNoZWNrQWxsVGFibGVGb3JFbnRpdHlTZXRBcmVBbmFseXRpY2FsIiwibGlzdFJlcG9ydFRhYmxlcyIsImNvbnRleHRQYXRoIiwibGVuZ3RoIiwiZXZlcnkiLCJ2aXN1YWxpemF0aW9uIiwiZW5hYmxlQW5hbHl0aWNzIiwiYW5ub3RhdGlvbiIsImNvbGxlY3Rpb24iLCJnZXRTZWxlY3Rpb25WYXJpYW50cyIsImxyVGFibGVWaXN1YWxpemF0aW9ucyIsImNvbnZlcnRlckNvbnRleHQiLCJzZWxlY3Rpb25WYXJpYW50UGF0aHMiLCJtYXAiLCJ0YWJsZUZpbHRlcnMiLCJjb250cm9sIiwiZmlsdGVycyIsInRhYmxlU1ZDb25maWdzIiwia2V5IiwiQXJyYXkiLCJpc0FycmF5IiwicGF0aHMiLCJhbm5vdGF0aW9uUGF0aCIsImluZGV4T2YiLCJwdXNoIiwic2VsZWN0aW9uVmFyaWFudENvbmZpZyIsImdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uIiwic3ZDb25maWdzIiwiY29uY2F0IiwiX2dldENvbmRpdGlvblBhdGgiLCJlbnRpdHlUeXBlIiwicHJvcGVydHlQYXRoIiwicGFydHMiLCJzcGxpdCIsInBhcnRpYWxQYXRoIiwicGFydCIsInNoaWZ0IiwicHJvcGVydHkiLCJyZXNvbHZlUGF0aCIsImlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkiLCJfY3JlYXRlRmlsdGVyU2VsZWN0aW9uRmllbGQiLCJmdWxsUHJvcGVydHlQYXRoIiwiaW5jbHVkZUhpZGRlbiIsInRhcmdldFR5cGUiLCJ1bmRlZmluZWQiLCJVSSIsIkhpZGRlbiIsInZhbHVlT2YiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUiLCJmaWx0ZXJGaWVsZCIsIktleUhlbHBlciIsImdldFNlbGVjdGlvbkZpZWxkS2V5RnJvbVBhdGgiLCJnZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoIiwiY29uZGl0aW9uUGF0aCIsImF2YWlsYWJpbGl0eSIsIkhpZGRlbkZpbHRlciIsImxhYmVsIiwibmFtZSIsImdldFNldHRpbmdzT2ZEZWZhdWx0RmlsdGVyRmllbGRzIiwic3RhbmRhcmREeW5hbWljRGF0ZVJhbmdlS2V5cyIsIlN0YW5kYXJkRHluYW1pY0RhdGVSYW5nZUtleXMiLCJUTyIsIlRPTU9SUk9XIiwiTkVYVFdFRUsiLCJORVhUTU9OVEgiLCJORVhUUVVBUlRFUiIsIk5FWFRZRUFSIiwic2V0dGluZ3MiLCJvcGVyYXRvckNvbmZpZ3VyYXRpb24iLCJlcXVhbHMiLCJqb2luIiwiZXhjbHVkZSIsIl9nZXRTZWxlY3Rpb25GaWVsZHMiLCJuYXZpZ2F0aW9uUGF0aCIsInByb3BlcnRpZXMiLCJzZWxlY3Rpb25GaWVsZE1hcCIsImZ1bGxQYXRoIiwic2VsZWN0aW9uRmllbGQiLCJfZ2V0U2VsZWN0aW9uRmllbGRzQnlQYXRoIiwicHJvcGVydHlQYXRocyIsInNlbGVjdGlvbkZpZWxkcyIsImxvY2FsU2VsZWN0aW9uRmllbGRzIiwiZW5oYW5jZWRQYXRoIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwidGFyZ2V0T2JqZWN0IiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJmaW5kIiwibmF2aWdhdGlvblByb3BlcnR5IiwiaXNOYXZpZ2F0aW9uUHJvcGVydHkiLCJlbnRpdHlQcm9wZXJ0aWVzIiwiaXNDb21wbGV4VHlwZSIsImdldFRhcmdldE5hdmlnYXRpb25QYXRoIiwiX2dldEZpbHRlckZpZWxkIiwiZmlsdGVyRmllbGRzIiwiZ2V0RGlhZ25vc3RpY3MiLCJhZGRJc3N1ZSIsIklzc3VlQ2F0ZWdvcnkiLCJBbm5vdGF0aW9uIiwiSXNzdWVTZXZlcml0eSIsIkhpZ2giLCJJc3N1ZVR5cGUiLCJNSVNTSU5HX1NFTEVDVElPTkZJRUxEIiwiaXNQYXJhbWV0ZXIiLCJSZXN1bHRDb250ZXh0IiwiX2dldERlZmF1bHRGaWx0ZXJGaWVsZHMiLCJhU2VsZWN0T3B0aW9ucyIsImV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcyIsImFubm90YXRlZFNlbGVjdGlvbkZpZWxkcyIsIlVJU2VsZWN0aW9uRmllbGRzIiwiU2VsZWN0aW9uRmllbGQiLCJ2YWx1ZSIsInNlbGVjdE9wdGlvbiIsIlByb3BlcnR5TmFtZSIsInNQcm9wZXJ0eVBhdGgiLCJjdXJyZW50U2VsZWN0aW9uRmllbGRzIiwiRmlsdGVyRmllbGQiLCJnZXRGaWx0ZXJGaWVsZCIsImRlZmF1bHRGaWx0ZXJWYWx1ZSIsIkZpbHRlckRlZmF1bHRWYWx1ZSIsIl9nZXRQYXJhbWV0ZXJGaWVsZHMiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwicGFyYW1ldGVyRW50aXR5VHlwZSIsInN0YXJ0aW5nRW50aXR5U2V0IiwiaXNQYXJhbWV0ZXJpemVkIiwidGFyZ2V0RW50aXR5U2V0IiwicGFyYW1ldGVyQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJnZXRGaWx0ZXJCYXJIaWRlQmFzaWNTZWFyY2giLCJjaGFydHMiLCJub1NlYXJjaEluQ2hhcnRzIiwiY2hhcnQiLCJhcHBseVN1cHBvcnRlZCIsImVuYWJsZVNlYXJjaCIsIm5vU2VhcmNoSW5UYWJsZXMiLCJ0YWJsZSIsInR5cGUiLCJlbmFibGVCYXNpY1NlYXJjaCIsImdldENvbnRleHRQYXRoIiwiZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMiLCJmYkNvbmZpZyIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldEZpbHRlckNvbmZpZ3VyYXRpb24iLCJkZWZpbmVkRmlsdGVyRmllbGRzIiwiT2JqZWN0Iiwia2V5cyIsImdldFBhdGhGcm9tU2VsZWN0aW9uRmllbGRLZXkiLCJzS2V5IiwiU2xvdCIsIkRlZmF1bHQiLCJ2aXN1YWxGaWx0ZXIiLCJnZXRWaXN1YWxGaWx0ZXJzIiwic2xvdE5hbWUiLCJ0ZW1wbGF0ZSIsInBvc2l0aW9uIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJyZXF1aXJlZCIsImdldEZpbHRlclJlc3RyaWN0aW9ucyIsIm9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uIiwic1Jlc3RyaWN0aW9uIiwiYVByb3BzIiwib1Byb3BlcnR5IiwiZ2V0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb24iLCJtQWxsb3dlZEV4cHJlc3Npb25zIiwiRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9ucyIsIlByb3BlcnR5IiwiQWxsb3dlZEV4cHJlc3Npb25zIiwidG9TdHJpbmciLCJnZXRTZWFyY2hGaWx0ZXJQcm9wZXJ0eUluZm8iLCJkYXRhVHlwZSIsIm1heENvbmRpdGlvbnMiLCJnZXRFZGl0U3RhdGVGaWx0ZXJQcm9wZXJ0eUluZm8iLCJoaWRkZW5GaWx0ZXIiLCJnZXRTZWFyY2hSZXN0cmljdGlvbnMiLCJlbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJpc0VudGl0eVNldCIsIkNhcGFiaWxpdGllcyIsIlNlYXJjaFJlc3RyaWN0aW9ucyIsImdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJzTmF2aWdhdGlvblBhdGgiLCJvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyIsIk5hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJhUmVzdHJpY3RlZFByb3BlcnRpZXMiLCJSZXN0cmljdGVkUHJvcGVydGllcyIsIm9SZXN0cmljdGVkUHJvcGVydHkiLCJOYXZpZ2F0aW9uUHJvcGVydHkiLCJfZmV0Y2hCYXNpY1Byb3BlcnR5SW5mbyIsIm9GaWx0ZXJGaWVsZEluZm8iLCJkaXNwbGF5IiwiY2FzZVNlbnNpdGl2ZSIsIm1lbnUiLCJnZXRTcGVjaWZpY0FsbG93ZWRFeHByZXNzaW9uIiwiYUV4cHJlc3Npb25zIiwiYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5Iiwic29ydCIsImEiLCJiIiwiZGlzcGxheU1vZGUiLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsIm9Db2xsZWN0aW9uQW5ub3RhdGlvbnMiLCJvVGV4dEFubm90YXRpb24iLCJUZXh0Iiwib1RleHRBcnJhbmdtZW50QW5ub3RhdGlvbiIsIlRleHRBcnJhbmdlbWVudCIsImZldGNoUHJvcGVydHlJbmZvIiwib1R5cGVDb25maWciLCJvUHJvcGVydHlJbmZvIiwic0Fubm90YXRpb25QYXRoIiwidGFyZ2V0UHJvcGVydHlPYmplY3QiLCJvRm9ybWF0T3B0aW9ucyIsImZvcm1hdE9wdGlvbnMiLCJvQ29uc3RyYWludHMiLCJjb25zdHJhaW50cyIsImFzc2lnbiIsImlzTXVsdGlWYWx1ZSIsImJJc011bHRpVmFsdWUiLCJmaWx0ZXJFeHByZXNzaW9uIiwiX2lzRmlsdGVyYWJsZU5hdmlnYXRpb25Qcm9wZXJ0eSIsImVudHJ5IiwiaW5jbHVkZXMiLCJhZGRDaGlsZE5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibmF2UHJvcGVydGllcyIsInRhcmdldFByb3BlcnR5IiwiJHRhcmdldCIsImFkZGl0aW9uYWxQcm9wZXJ0eVBhdGgiLCJnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoIiwibmF2aWdhdGlvblByb3BlcnR5UGF0aCIsImdldE5hdmlnYXRpb25Qcm9wZXJ0aWVzUmVjdXJzaXZlbHkiLCJUYXJnZXQiLCJpbm5lckRhdGFGaWVsZCIsImdldEFubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YSIsImxyVGFibGVzIiwibGluZUl0ZW1UZXJtIiwiZ2V0RW50aXR5VHlwZSIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwiU2VsZWN0aW9uRmllbGRzIiwiTW9kZWxIZWxwZXIiLCJpc0RyYWZ0Um9vdCIsImdldFNlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3RPcHRpb25zIiwicHJvcGVydHlJbmZvRmllbGRzIiwic3RhcnRzV2l0aCIsImZpbHRlclByb3BlcnR5UGF0aCIsImRlZmF1bHRGaWx0ZXJGaWVsZHMiLCJmZXRjaFR5cGVDb25maWciLCJnZXRUeXBlQ29uZmlnIiwibnVsbGFibGUiLCJwYXJzZUtlZXBzRW1wdHlTdHJpbmciLCJhc3NpZ25EYXRhVHlwZVRvUHJvcGVydHlJbmZvIiwicHJvcGVydHlJbmZvRmllbGQiLCJhUmVxdWlyZWRQcm9wcyIsImFUeXBlQ29uZmlnIiwicmVwbGFjZSIsImlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSIsInByb2Nlc3NTZWxlY3Rpb25GaWVsZHMiLCJkZWZhdWx0VmFsdWVQcm9wZXJ0eUZpZWxkcyIsInNlbGVjdGlvbkZpZWxkVHlwZXMiLCJwYXJhbWV0ZXJGaWVsZCIsInByb3BlcnR5Q29udmVydHlDb250ZXh0IiwicHJvcGVydHlUYXJnZXRPYmplY3QiLCJvRmlsdGVyUmVzdHJpY3Rpb25zIiwiRmlsdGVyUmVzdHJpY3Rpb25zIiwib1JldCIsIlJlcXVpcmVkUHJvcGVydGllcyIsIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIiwic0VudGl0eVNldFBhdGgiLCJhUGF0aFBhcnRzIiwic3BsaWNlIiwib05hdmlnYXRpb25GaWx0ZXJSZXN0cmljdGlvbnMiLCJhTm9uRmlsdGVyYWJsZVByb3BzIiwiYUZldGNoZWRQcm9wZXJ0aWVzIiwiaXNPYmplY3RQYXRoRHJhZnRTdXBwb3J0ZWQiLCJzZWFyY2hSZXN0cmljdGlvbnMiLCJoaWRlQmFzaWNTZWFyY2giLCJCb29sZWFuIiwiU2VhcmNoYWJsZSIsImluc2VydEN1c3RvbU1hbmlmZXN0RWxlbWVudHMiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsIk92ZXJyaWRlVHlwZSIsIm92ZXJ3cml0ZSIsImdldFNlbGVjdGlvbkZpZWxkcyIsIm9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEiLCJwYXJhbWV0ZXJGaWVsZHMiLCJsb2NhbGVDb21wYXJlIiwic0ZldGNoUHJvcGVydGllcyIsIkpTT04iLCJzdHJpbmdpZnkiLCJzUHJvcGVydHlJbmZvIiwicHJvcFNlbGVjdGlvbkZpZWxkcyIsInBhcnNlIiwiZmlsdGVyRmFjZXRzIiwiRmlsdGVyRmFjZXRzIiwiYUZpZWxkR3JvdXBzIiwiZ2V0QW5ub3RhdGlvbnNCeVRlcm0iLCJpIiwiZmlsdGVyRmFjZXQiLCJJRCIsImFsbEZpbHRlcnMiLCJmaWx0ZXIiLCJzQ29udGV4dFBhdGgiLCJhZ2dyZWdhdGVzIiwiYWdncmVnYXRhYmxlUHJvcGVydGllcyIsImFnZ3JlZ2F0ZUtleSIsInJlbGF0aXZlUGF0aCIsImlzQ2FzZVNlbnNpdGl2ZSIsImdldEV4cGFuZEZpbHRlckZpZWxkcyIsImZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24iLCJ2YWx1ZUxpc3QiLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJGZXRjaFZhbHVlcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQW5ub3RhdGlvblRlcm0sIEVudGl0eVR5cGUsIE5hdmlnYXRpb25Qcm9wZXJ0eSwgUHJvcGVydHksIFByb3BlcnR5UGF0aCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUge1xuXHRGaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlLFxuXHRGaWx0ZXJFeHByZXNzaW9uVHlwZSxcblx0RmlsdGVyUmVzdHJpY3Rpb25zLFxuXHRGaWx0ZXJSZXN0cmljdGlvbnNUeXBlXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ2FwYWJpbGl0aWVzXCI7XG5pbXBvcnQgdHlwZSB7IEVudGl0eVR5cGVBbm5vdGF0aW9ucywgUHJvcGVydHlBbm5vdGF0aW9ucyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvRWRtX1R5cGVzXCI7XG5pbXBvcnQgdHlwZSB7XG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkVHlwZXMsXG5cdERhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCxcblx0RGF0YUZpZWxkV2l0aFVybCxcblx0RmllbGRHcm91cCxcblx0TGluZUl0ZW0sXG5cdFJlZmVyZW5jZUZhY2V0VHlwZXMsXG5cdFNlbGVjdE9wdGlvblR5cGVcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgeyBDaGFydFZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQ2hhcnRcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydHlUeXBlQ29uZmlnLCBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbiwgVGFibGVWaXN1YWxpemF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgeyBnZXRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbiwgZ2V0VHlwZUNvbmZpZywgaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSB7IFZpc3VhbEZpbHRlcnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L1Zpc3VhbEZpbHRlcnNcIjtcbmltcG9ydCB7IGdldFZpc3VhbEZpbHRlcnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L1Zpc3VhbEZpbHRlcnNcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgeyBDb25maWd1cmFibGVPYmplY3QsIEN1c3RvbUVsZW1lbnQsIFBvc2l0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzLCBPdmVycmlkZVR5cGUsIFBsYWNlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBJc3N1ZUNhdGVnb3J5LCBJc3N1ZVNldmVyaXR5LCBJc3N1ZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lzc3VlTWFuYWdlclwiO1xuaW1wb3J0IHsgS2V5SGVscGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9LZXlcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBpc0NvbXBsZXhUeXBlLCBpc0VudGl0eVNldCwgaXNNdWx0aXBsZU5hdmlnYXRpb25Qcm9wZXJ0eSwgaXNOYXZpZ2F0aW9uUHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgeyBlbmhhbmNlRGF0YU1vZGVsUGF0aCwgZ2V0VGFyZ2V0TmF2aWdhdGlvblBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQge1xuXHRnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eVBhdGgsXG5cdGdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eVBhdGgsXG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoXG59IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgeyBTdGFuZGFyZER5bmFtaWNEYXRlUmFuZ2VLZXlzIH0gZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIHtcblx0QXZhaWxhYmlsaXR5VHlwZSxcblx0RmlsdGVyRmllbGRNYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdEZpbHRlck1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0RmlsdGVyU2V0dGluZ3Ncbn0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IGdldFNlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwiLi4vQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG4vL2ltcG9ydCB7IGhhc1ZhbHVlSGVscCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5cbmV4cG9ydCB0eXBlIEZpbHRlckZpZWxkID0gQ29uZmlndXJhYmxlT2JqZWN0ICYge1xuXHR0eXBlPzogc3RyaW5nO1xuXHRjb25kaXRpb25QYXRoOiBzdHJpbmc7XG5cdGF2YWlsYWJpbGl0eTogQXZhaWxhYmlsaXR5VHlwZTtcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0bGFiZWw/OiBzdHJpbmc7XG5cdHRlbXBsYXRlPzogc3RyaW5nO1xuXHRncm91cD86IHN0cmluZztcblx0bWVudT86IHN0cmluZztcblx0Z3JvdXBMYWJlbD86IHN0cmluZztcblx0c2V0dGluZ3M/OiBGaWx0ZXJTZXR0aW5ncztcblx0aXNQYXJhbWV0ZXI/OiBib29sZWFuO1xuXHR2aXN1YWxGaWx0ZXI/OiBWaXN1YWxGaWx0ZXJzO1xuXHRjYXNlU2Vuc2l0aXZlPzogYm9vbGVhbjtcblx0cmVxdWlyZWQ/OiBib29sZWFuO1xufTtcblxudHlwZSBNYW5pZmVzdEZpbHRlckZpZWxkID0gRmlsdGVyRmllbGQgJiB7XG5cdHNsb3ROYW1lPzogc3RyaW5nO1xufTtcblxudHlwZSBGaWx0ZXJHcm91cCA9IHtcblx0Z3JvdXA/OiBzdHJpbmc7XG5cdGdyb3VwTGFiZWw/OiBzdHJpbmc7XG59O1xuXG5lbnVtIGZpbHRlckZpZWxkVHlwZSB7XG5cdERlZmF1bHQgPSBcIkRlZmF1bHRcIixcblx0U2xvdCA9IFwiU2xvdFwiXG59XG5cbmNvbnN0IHNFZG1TdHJpbmcgPSBcIkVkbS5TdHJpbmdcIjtcbmNvbnN0IHNTdHJpbmdEYXRhVHlwZSA9IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCI7XG5cbmV4cG9ydCB0eXBlIEN1c3RvbUVsZW1lbnRGaWx0ZXJGaWVsZCA9IEN1c3RvbUVsZW1lbnQ8TWFuaWZlc3RGaWx0ZXJGaWVsZD47XG5cbi8qKlxuICogRW50ZXIgYWxsIERhdGFGaWVsZHMgb2YgYSBnaXZlbiBGaWVsZEdyb3VwIGludG8gdGhlIGZpbHRlckZhY2V0TWFwLlxuICpcbiAqIEBwYXJhbSBmaWVsZEdyb3VwXG4gKiBAcmV0dXJucyBUaGUgbWFwIG9mIGZhY2V0cyBmb3IgdGhlIGdpdmVuIEZpZWxkR3JvdXBcbiAqL1xuZnVuY3Rpb24gZ2V0RmllbGRHcm91cEZpbHRlckdyb3VwcyhmaWVsZEdyb3VwOiBGaWVsZEdyb3VwKTogUmVjb3JkPHN0cmluZywgRmlsdGVyR3JvdXA+IHtcblx0Y29uc3QgZmlsdGVyRmFjZXRNYXA6IFJlY29yZDxzdHJpbmcsIEZpbHRlckdyb3VwPiA9IHt9O1xuXHRmaWVsZEdyb3VwLkRhdGEuZm9yRWFjaCgoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0aWYgKGRhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIikge1xuXHRcdFx0ZmlsdGVyRmFjZXRNYXBbZGF0YUZpZWxkLlZhbHVlLnBhdGhdID0ge1xuXHRcdFx0XHRncm91cDogZmllbGRHcm91cC5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRcdGdyb3VwTGFiZWw6XG5cdFx0XHRcdFx0Y29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZmllbGRHcm91cC5MYWJlbCB8fCBmaWVsZEdyb3VwLmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsIHx8IGZpZWxkR3JvdXAucXVhbGlmaWVyKVxuXHRcdFx0XHRcdCkgfHwgZmllbGRHcm91cC5xdWFsaWZpZXJcblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIGZpbHRlckZhY2V0TWFwO1xufVxuXG5mdW5jdGlvbiBnZXRFeGNsdWRlZEZpbHRlclByb3BlcnRpZXMoc2VsZWN0aW9uVmFyaWFudHM6IFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uW10pOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiB7XG5cdHJldHVybiBzZWxlY3Rpb25WYXJpYW50cy5yZWR1Y2UoKHByZXZpb3VzVmFsdWU6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+LCBzZWxlY3Rpb25WYXJpYW50KSA9PiB7XG5cdFx0c2VsZWN0aW9uVmFyaWFudC5wcm9wZXJ0eU5hbWVzLmZvckVhY2goKHByb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0cHJldmlvdXNWYWx1ZVtwcm9wZXJ0eU5hbWVdID0gdHJ1ZTtcblx0XHR9KTtcblx0XHRyZXR1cm4gcHJldmlvdXNWYWx1ZTtcblx0fSwge30pO1xufVxuXG4vKipcbiAqIENoZWNrIHRoYXQgYWxsIHRoZSB0YWJsZXMgZm9yIGEgZGVkaWNhdGVkIGVudGl0eSBzZXQgYXJlIGNvbmZpZ3VyZWQgYXMgYW5hbHl0aWNhbCB0YWJsZXMuXG4gKlxuICogQHBhcmFtIGxpc3RSZXBvcnRUYWJsZXMgTGlzdCByZXBvcnQgdGFibGVzXG4gKiBAcGFyYW0gY29udGV4dFBhdGhcbiAqIEByZXR1cm5zIElzIEZpbHRlckJhciBzZWFyY2ggZmllbGQgaGlkZGVuIG9yIG5vdFxuICovXG5mdW5jdGlvbiBjaGVja0FsbFRhYmxlRm9yRW50aXR5U2V0QXJlQW5hbHl0aWNhbChsaXN0UmVwb3J0VGFibGVzOiBUYWJsZVZpc3VhbGl6YXRpb25bXSwgY29udGV4dFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRpZiAoY29udGV4dFBhdGggJiYgbGlzdFJlcG9ydFRhYmxlcy5sZW5ndGggPiAwKSB7XG5cdFx0cmV0dXJuIGxpc3RSZXBvcnRUYWJsZXMuZXZlcnkoKHZpc3VhbGl6YXRpb24pID0+IHtcblx0XHRcdHJldHVybiB2aXN1YWxpemF0aW9uLmVuYWJsZUFuYWx5dGljcyAmJiBjb250ZXh0UGF0aCA9PT0gdmlzdWFsaXphdGlvbi5hbm5vdGF0aW9uLmNvbGxlY3Rpb247XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBnZXRTZWxlY3Rpb25WYXJpYW50cyhcblx0bHJUYWJsZVZpc3VhbGl6YXRpb25zOiBUYWJsZVZpc3VhbGl6YXRpb25bXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb25bXSB7XG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnRQYXRoczogc3RyaW5nW10gPSBbXTtcblx0cmV0dXJuIGxyVGFibGVWaXN1YWxpemF0aW9uc1xuXHRcdC5tYXAoKHZpc3VhbGl6YXRpb24pID0+IHtcblx0XHRcdGNvbnN0IHRhYmxlRmlsdGVycyA9IHZpc3VhbGl6YXRpb24uY29udHJvbC5maWx0ZXJzO1xuXHRcdFx0Y29uc3QgdGFibGVTVkNvbmZpZ3M6IFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uW10gPSBbXTtcblx0XHRcdGZvciAoY29uc3Qga2V5IGluIHRhYmxlRmlsdGVycykge1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh0YWJsZUZpbHRlcnNba2V5XS5wYXRocykpIHtcblx0XHRcdFx0XHRjb25zdCBwYXRocyA9IHRhYmxlRmlsdGVyc1trZXldLnBhdGhzO1xuXHRcdFx0XHRcdHBhdGhzLmZvckVhY2goKHBhdGgpID0+IHtcblx0XHRcdFx0XHRcdGlmIChwYXRoICYmIHBhdGguYW5ub3RhdGlvblBhdGggJiYgc2VsZWN0aW9uVmFyaWFudFBhdGhzLmluZGV4T2YocGF0aC5hbm5vdGF0aW9uUGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnRQYXRocy5wdXNoKHBhdGguYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzZWxlY3Rpb25WYXJpYW50Q29uZmlnID0gZ2V0U2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb24ocGF0aC5hbm5vdGF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRcdFx0XHRcdGlmIChzZWxlY3Rpb25WYXJpYW50Q29uZmlnKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGFibGVTVkNvbmZpZ3MucHVzaChzZWxlY3Rpb25WYXJpYW50Q29uZmlnKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGFibGVTVkNvbmZpZ3M7XG5cdFx0fSlcblx0XHQucmVkdWNlKChzdkNvbmZpZ3MsIHNlbGVjdGlvblZhcmlhbnQpID0+IHN2Q29uZmlncy5jb25jYXQoc2VsZWN0aW9uVmFyaWFudCksIFtdKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBjb25kaXRpb24gcGF0aCByZXF1aXJlZCBmb3IgdGhlIGNvbmRpdGlvbiBtb2RlbC4gSXQgbG9va3MgYXMgZm9sbG93czpcbiAqIDwxOk4tUHJvcGVydHlOYW1lPipcXC88MToxLVByb3BlcnR5TmFtZT4vPFByb3BlcnR5TmFtZT4uXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIHJvb3QgRW50aXR5VHlwZVxuICogQHBhcmFtIHByb3BlcnR5UGF0aCBUaGUgZnVsbCBwYXRoIHRvIHRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgY29uZGl0aW9uIHBhdGhcbiAqL1xuY29uc3QgX2dldENvbmRpdGlvblBhdGggPSBmdW5jdGlvbiAoZW50aXR5VHlwZTogRW50aXR5VHlwZSwgcHJvcGVydHlQYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRjb25zdCBwYXJ0cyA9IHByb3BlcnR5UGF0aC5zcGxpdChcIi9cIik7XG5cdGxldCBwYXJ0aWFsUGF0aDtcblx0bGV0IGtleSA9IFwiXCI7XG5cdHdoaWxlIChwYXJ0cy5sZW5ndGgpIHtcblx0XHRsZXQgcGFydCA9IHBhcnRzLnNoaWZ0KCkgYXMgc3RyaW5nO1xuXHRcdHBhcnRpYWxQYXRoID0gcGFydGlhbFBhdGggPyBgJHtwYXJ0aWFsUGF0aH0vJHtwYXJ0fWAgOiBwYXJ0O1xuXHRcdGNvbnN0IHByb3BlcnR5OiBQcm9wZXJ0eSB8IE5hdmlnYXRpb25Qcm9wZXJ0eSA9IGVudGl0eVR5cGUucmVzb2x2ZVBhdGgocGFydGlhbFBhdGgpO1xuXHRcdGlmIChpc011bHRpcGxlTmF2aWdhdGlvblByb3BlcnR5KHByb3BlcnR5KSkge1xuXHRcdFx0cGFydCArPSBcIipcIjtcblx0XHR9XG5cdFx0a2V5ID0ga2V5ID8gYCR7a2V5fS8ke3BhcnR9YCA6IHBhcnQ7XG5cdH1cblx0cmV0dXJuIGtleTtcbn07XG5cbmNvbnN0IF9jcmVhdGVGaWx0ZXJTZWxlY3Rpb25GaWVsZCA9IGZ1bmN0aW9uIChcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0cHJvcGVydHk6IFByb3BlcnR5LFxuXHRmdWxsUHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEZpbHRlckZpZWxkIHwgdW5kZWZpbmVkIHtcblx0Ly8gaWdub3JlIGNvbXBsZXggcHJvcGVydHkgdHlwZXMgYW5kIGhpZGRlbiBhbm5vdGF0ZWQgb25lc1xuXHRpZiAocHJvcGVydHkgJiYgcHJvcGVydHkudGFyZ2V0VHlwZSA9PT0gdW5kZWZpbmVkICYmIChpbmNsdWRlSGlkZGVuIHx8IHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgIT09IHRydWUpKSB7XG5cdFx0Y29uc3QgdGFyZ2V0RW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUocHJvcGVydHkpLFxuXHRcdFx0ZmlsdGVyRmllbGQ6IEZpbHRlckZpZWxkID0ge1xuXHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZXRTZWxlY3Rpb25GaWVsZEtleUZyb21QYXRoKGZ1bGxQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKGZ1bGxQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0XHRjb25kaXRpb25QYXRoOiBfZ2V0Q29uZGl0aW9uUGF0aChlbnRpdHlUeXBlLCBmdWxsUHJvcGVydHlQYXRoKSxcblx0XHRcdFx0YXZhaWxhYmlsaXR5OiBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbkZpbHRlcj8udmFsdWVPZigpID09PSB0cnVlID8gXCJIaWRkZW5cIiA6IFwiQWRhcHRhdGlvblwiLFxuXHRcdFx0XHRsYWJlbDogY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5LmFubm90YXRpb25zLkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5uYW1lKSksXG5cdFx0XHRcdGdyb3VwOiB0YXJnZXRFbnRpdHlUeXBlLm5hbWUsXG5cdFx0XHRcdGdyb3VwTGFiZWw6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbih0YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbD8udmFsdWVPZigpIHx8IHRhcmdldEVudGl0eVR5cGUubmFtZSlcblx0XHRcdFx0KVxuXHRcdFx0fTtcblx0XHRnZXRTZXR0aW5nc09mRGVmYXVsdEZpbHRlckZpZWxkcyhmaWx0ZXJGaWVsZCk7XG5cdFx0cmV0dXJuIGZpbHRlckZpZWxkO1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgdGVjaG5pY2FsIHByb3BlcnR5IERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhLiBPbmx5IHJlbGV2YW50IGZvciBDcmVhdGlvbkRhdGVUaW1lXG4gKiBhbmQgTGFzdENoYW5nZURhdGVUaW1lLCBhcyB0aGV5IGFyZSBkaXNwbGF5aW5nIHRoZSB0aW1lZnJhbWUgcmVsYXRlZCBwcm9wZXJ0aWVzIGFzIGEgU2VtYW50aWNEYXRlUmFuZ2UuXG4gKlxuICogQHBhcmFtIGZpbHRlckZpZWxkXG4gKi9cbmNvbnN0IGdldFNldHRpbmdzT2ZEZWZhdWx0RmlsdGVyRmllbGRzID0gZnVuY3Rpb24gKGZpbHRlckZpZWxkOiBGaWx0ZXJGaWVsZCkge1xuXHRpZiAoXG5cdFx0ZmlsdGVyRmllbGQua2V5ID09PSBcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhOjpDcmVhdGlvbkRhdGVUaW1lXCIgfHxcblx0XHRmaWx0ZXJGaWVsZC5rZXkgPT09IFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGE6Okxhc3RDaGFuZ2VEYXRlVGltZVwiXG5cdCkge1xuXHRcdGNvbnN0IHN0YW5kYXJkRHluYW1pY0RhdGVSYW5nZUtleXMgPSBbXG5cdFx0XHRTdGFuZGFyZER5bmFtaWNEYXRlUmFuZ2VLZXlzLlRPLFxuXHRcdFx0U3RhbmRhcmREeW5hbWljRGF0ZVJhbmdlS2V5cy5UT01PUlJPVyxcblx0XHRcdFN0YW5kYXJkRHluYW1pY0RhdGVSYW5nZUtleXMuTkVYVFdFRUssXG5cdFx0XHRTdGFuZGFyZER5bmFtaWNEYXRlUmFuZ2VLZXlzLk5FWFRNT05USCxcblx0XHRcdFN0YW5kYXJkRHluYW1pY0RhdGVSYW5nZUtleXMuTkVYVFFVQVJURVIsXG5cdFx0XHRTdGFuZGFyZER5bmFtaWNEYXRlUmFuZ2VLZXlzLk5FWFRZRUFSXG5cdFx0XTtcblx0XHRmaWx0ZXJGaWVsZC5zZXR0aW5ncyA9IHtcblx0XHRcdG9wZXJhdG9yQ29uZmlndXJhdGlvbjogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cGF0aDogXCJrZXlcIixcblx0XHRcdFx0XHRlcXVhbHM6IHN0YW5kYXJkRHluYW1pY0RhdGVSYW5nZUtleXMuam9pbihcIixcIiksXG5cdFx0XHRcdFx0ZXhjbHVkZTogdHJ1ZVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fTtcblx0fVxufTtcblxuY29uc3QgX2dldFNlbGVjdGlvbkZpZWxkcyA9IGZ1bmN0aW9uIChcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0bmF2aWdhdGlvblBhdGg6IHN0cmluZyxcblx0cHJvcGVydGllczogQXJyYXk8UHJvcGVydHk+IHwgdW5kZWZpbmVkLFxuXHRpbmNsdWRlSGlkZGVuOiBib29sZWFuLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4ge1xuXHRjb25zdCBzZWxlY3Rpb25GaWVsZE1hcDogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+ID0ge307XG5cdGlmIChwcm9wZXJ0aWVzKSB7XG5cdFx0cHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eTogUHJvcGVydHkpID0+IHtcblx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aDogc3RyaW5nID0gcHJvcGVydHkubmFtZTtcblx0XHRcdGNvbnN0IGZ1bGxQYXRoOiBzdHJpbmcgPSAobmF2aWdhdGlvblBhdGggPyBgJHtuYXZpZ2F0aW9uUGF0aH0vYCA6IFwiXCIpICsgcHJvcGVydHlQYXRoO1xuXHRcdFx0Y29uc3Qgc2VsZWN0aW9uRmllbGQgPSBfY3JlYXRlRmlsdGVyU2VsZWN0aW9uRmllbGQoZW50aXR5VHlwZSwgcHJvcGVydHksIGZ1bGxQYXRoLCBpbmNsdWRlSGlkZGVuLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdGlmIChzZWxlY3Rpb25GaWVsZCkge1xuXHRcdFx0XHRzZWxlY3Rpb25GaWVsZE1hcFtmdWxsUGF0aF0gPSBzZWxlY3Rpb25GaWVsZDtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gc2VsZWN0aW9uRmllbGRNYXA7XG59O1xuXG5jb25zdCBfZ2V0U2VsZWN0aW9uRmllbGRzQnlQYXRoID0gZnVuY3Rpb24gKFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRwcm9wZXJ0eVBhdGhzOiBBcnJheTxzdHJpbmc+IHwgdW5kZWZpbmVkLFxuXHRpbmNsdWRlSGlkZGVuOiBib29sZWFuLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4ge1xuXHRsZXQgc2VsZWN0aW9uRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4gPSB7fTtcblx0aWYgKHByb3BlcnR5UGF0aHMpIHtcblx0XHRwcm9wZXJ0eVBhdGhzLmZvckVhY2goKHByb3BlcnR5UGF0aDogc3RyaW5nKSA9PiB7XG5cdFx0XHRsZXQgbG9jYWxTZWxlY3Rpb25GaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiA9IHt9O1xuXHRcdFx0Y29uc3QgZW5oYW5jZWRQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCksIHByb3BlcnR5UGF0aCk7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eSA9IGVuaGFuY2VkUGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHByb3BlcnR5ID09PSB1bmRlZmluZWQgfHxcblx0XHRcdFx0KCFpbmNsdWRlSGlkZGVuICYmXG5cdFx0XHRcdFx0ZW5oYW5jZWRQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZpbmQoXG5cdFx0XHRcdFx0XHQobmF2aWdhdGlvblByb3BlcnR5KSA9PiBuYXZpZ2F0aW9uUHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gdHJ1ZVxuXHRcdFx0XHRcdCkpXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGlzTmF2aWdhdGlvblByb3BlcnR5KHByb3BlcnR5KSkge1xuXHRcdFx0XHQvLyBoYW5kbGUgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG5cdFx0XHRcdGxvY2FsU2VsZWN0aW9uRmllbGRzID0gX2dldFNlbGVjdGlvbkZpZWxkcyhcblx0XHRcdFx0XHRlbnRpdHlUeXBlLFxuXHRcdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRwcm9wZXJ0eS50YXJnZXRUeXBlLmVudGl0eVByb3BlcnRpZXMsXG5cdFx0XHRcdFx0aW5jbHVkZUhpZGRlbixcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2UgaWYgKGlzQ29tcGxleFR5cGUocHJvcGVydHkudGFyZ2V0VHlwZSkpIHtcblx0XHRcdFx0Ly8gaGFuZGxlIENvbXBsZXhUeXBlIHByb3BlcnRpZXNcblx0XHRcdFx0bG9jYWxTZWxlY3Rpb25GaWVsZHMgPSBfZ2V0U2VsZWN0aW9uRmllbGRzKFxuXHRcdFx0XHRcdGVudGl0eVR5cGUsXG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdHByb3BlcnR5LnRhcmdldFR5cGUucHJvcGVydGllcyxcblx0XHRcdFx0XHRpbmNsdWRlSGlkZGVuLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGxvY2FsU2VsZWN0aW9uRmllbGRzID0gX2dldFNlbGVjdGlvbkZpZWxkcyhcblx0XHRcdFx0XHRlbnRpdHlUeXBlLFxuXHRcdFx0XHRcdGdldFRhcmdldE5hdmlnYXRpb25QYXRoKGVuaGFuY2VkUGF0aCwgdHJ1ZSksXG5cdFx0XHRcdFx0W3Byb3BlcnR5XSxcblx0XHRcdFx0XHRpbmNsdWRlSGlkZGVuLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0c2VsZWN0aW9uRmllbGRzID0ge1xuXHRcdFx0XHQuLi5zZWxlY3Rpb25GaWVsZHMsXG5cdFx0XHRcdC4uLmxvY2FsU2VsZWN0aW9uRmllbGRzXG5cdFx0XHR9O1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBzZWxlY3Rpb25GaWVsZHM7XG59O1xuXG5jb25zdCBfZ2V0RmlsdGVyRmllbGQgPSBmdW5jdGlvbiAoXG5cdGZpbHRlckZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+LFxuXHRwcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZVxuKTogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQge1xuXHRsZXQgZmlsdGVyRmllbGQ6IEZpbHRlckZpZWxkIHwgdW5kZWZpbmVkID0gZmlsdGVyRmllbGRzW3Byb3BlcnR5UGF0aF07XG5cdGlmIChmaWx0ZXJGaWVsZCkge1xuXHRcdGRlbGV0ZSBmaWx0ZXJGaWVsZHNbcHJvcGVydHlQYXRoXTtcblx0fSBlbHNlIHtcblx0XHRmaWx0ZXJGaWVsZCA9IF9jcmVhdGVGaWx0ZXJTZWxlY3Rpb25GaWVsZChlbnRpdHlUeXBlLCBlbnRpdHlUeXBlLnJlc29sdmVQYXRoKHByb3BlcnR5UGF0aCksIHByb3BlcnR5UGF0aCwgdHJ1ZSwgY29udmVydGVyQ29udGV4dCk7XG5cdH1cblx0aWYgKCFmaWx0ZXJGaWVsZCkge1xuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0RGlhZ25vc3RpY3MoKT8uYWRkSXNzdWUoSXNzdWVDYXRlZ29yeS5Bbm5vdGF0aW9uLCBJc3N1ZVNldmVyaXR5LkhpZ2gsIElzc3VlVHlwZS5NSVNTSU5HX1NFTEVDVElPTkZJRUxEKTtcblx0fVxuXHQvLyBkZWZpbmVkIFNlbGVjdGlvbkZpZWxkcyBhcmUgYXZhaWxhYmxlIGJ5IGRlZmF1bHRcblx0aWYgKGZpbHRlckZpZWxkKSB7XG5cdFx0ZmlsdGVyRmllbGQuYXZhaWxhYmlsaXR5ID0gZmlsdGVyRmllbGQuYXZhaWxhYmlsaXR5ID09PSBcIkhpZGRlblwiID8gXCJIaWRkZW5cIiA6IFwiRGVmYXVsdFwiO1xuXHRcdGZpbHRlckZpZWxkLmlzUGFyYW1ldGVyID0gISFlbnRpdHlUeXBlLmFubm90YXRpb25zPy5Db21tb24/LlJlc3VsdENvbnRleHQ7XG5cdH1cblx0cmV0dXJuIGZpbHRlckZpZWxkO1xufTtcblxuY29uc3QgX2dldERlZmF1bHRGaWx0ZXJGaWVsZHMgPSBmdW5jdGlvbiAoXG5cdGFTZWxlY3RPcHRpb25zOiBTZWxlY3RPcHRpb25UeXBlW10sXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4sXG5cdGFubm90YXRlZFNlbGVjdGlvbkZpZWxkczogUHJvcGVydHlQYXRoW11cbik6IEZpbHRlckZpZWxkW10ge1xuXHRjb25zdCBzZWxlY3Rpb25GaWVsZHM6IEZpbHRlckZpZWxkW10gPSBbXTtcblx0Y29uc3QgVUlTZWxlY3Rpb25GaWVsZHM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0ge307XG5cdGNvbnN0IHByb3BlcnRpZXMgPSBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXM7XG5cdC8vIFVzaW5nIGVudGl0eVR5cGUgaW5zdGVhZCBvZiBlbnRpdHlTZXRcblx0YW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzPy5mb3JFYWNoKChTZWxlY3Rpb25GaWVsZCkgPT4ge1xuXHRcdFVJU2VsZWN0aW9uRmllbGRzW1NlbGVjdGlvbkZpZWxkLnZhbHVlXSA9IHRydWU7XG5cdH0pO1xuXHRpZiAoYVNlbGVjdE9wdGlvbnMgJiYgYVNlbGVjdE9wdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdGFTZWxlY3RPcHRpb25zPy5mb3JFYWNoKChzZWxlY3RPcHRpb246IFNlbGVjdE9wdGlvblR5cGUpID0+IHtcblx0XHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWU7XG5cdFx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gcHJvcGVydHlOYW1lPy52YWx1ZTtcblx0XHRcdGNvbnN0IGN1cnJlbnRTZWxlY3Rpb25GaWVsZHM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0ge307XG5cdFx0XHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM/LmZvckVhY2goKFNlbGVjdGlvbkZpZWxkKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb25GaWVsZHNbU2VsZWN0aW9uRmllbGQudmFsdWVdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHNQcm9wZXJ0eVBhdGggJiYgIShzUHJvcGVydHlQYXRoIGluIGV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcykpIHtcblx0XHRcdFx0aWYgKCEoc1Byb3BlcnR5UGF0aCBpbiBjdXJyZW50U2VsZWN0aW9uRmllbGRzKSkge1xuXHRcdFx0XHRcdGNvbnN0IEZpbHRlckZpZWxkOiBGaWx0ZXJGaWVsZCB8IHVuZGVmaW5lZCA9IGdldEZpbHRlckZpZWxkKHNQcm9wZXJ0eVBhdGgsIGNvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGUpO1xuXHRcdFx0XHRcdGlmIChGaWx0ZXJGaWVsZCkge1xuXHRcdFx0XHRcdFx0c2VsZWN0aW9uRmllbGRzLnB1c2goRmlsdGVyRmllbGQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHByb3BlcnRpZXMpIHtcblx0XHRwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0Y29uc3QgZGVmYXVsdEZpbHRlclZhbHVlID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uRmlsdGVyRGVmYXVsdFZhbHVlO1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoID0gcHJvcGVydHkubmFtZTtcblx0XHRcdGlmICghKHByb3BlcnR5UGF0aCBpbiBleGNsdWRlZEZpbHRlclByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdGlmIChkZWZhdWx0RmlsdGVyVmFsdWUgJiYgIShwcm9wZXJ0eVBhdGggaW4gVUlTZWxlY3Rpb25GaWVsZHMpKSB7XG5cdFx0XHRcdFx0Y29uc3QgRmlsdGVyRmllbGQ6IEZpbHRlckZpZWxkIHwgdW5kZWZpbmVkID0gZ2V0RmlsdGVyRmllbGQocHJvcGVydHlQYXRoLCBjb252ZXJ0ZXJDb250ZXh0LCBlbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRpZiAoRmlsdGVyRmllbGQpIHtcblx0XHRcdFx0XHRcdHNlbGVjdGlvbkZpZWxkcy5wdXNoKEZpbHRlckZpZWxkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gc2VsZWN0aW9uRmllbGRzO1xufTtcblxuLyoqXG4gKiBHZXQgYWxsIHBhcmFtZXRlciBmaWx0ZXIgZmllbGRzIGluIGNhc2Ugb2YgYSBwYXJhbWV0ZXJpemVkIHNlcnZpY2UuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHBhcmFtZXRlciBGaWx0ZXJGaWVsZHNcbiAqL1xuZnVuY3Rpb24gX2dldFBhcmFtZXRlckZpZWxkcyhjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogRmlsdGVyRmllbGRbXSB7XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0Y29uc3QgcGFyYW1ldGVyRW50aXR5VHlwZSA9IGRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQuZW50aXR5VHlwZTtcblx0Y29uc3QgaXNQYXJhbWV0ZXJpemVkID0gISFwYXJhbWV0ZXJFbnRpdHlUeXBlLmFubm90YXRpb25zPy5Db21tb24/LlJlc3VsdENvbnRleHQgJiYgIWRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0O1xuXHRjb25zdCBwYXJhbWV0ZXJDb252ZXJ0ZXJDb250ZXh0ID1cblx0XHRpc1BhcmFtZXRlcml6ZWQgJiYgY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZXJDb250ZXh0Rm9yKGAvJHtkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWV9YCk7XG5cblx0cmV0dXJuIChcblx0XHRwYXJhbWV0ZXJDb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHQ/IHBhcmFtZXRlckVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5tYXAoZnVuY3Rpb24gKHByb3BlcnR5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIF9nZXRGaWx0ZXJGaWVsZChcblx0XHRcdFx0XHRcdHt9IGFzIFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPixcblx0XHRcdFx0XHRcdHByb3BlcnR5Lm5hbWUsXG5cdFx0XHRcdFx0XHRwYXJhbWV0ZXJDb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0cGFyYW1ldGVyRW50aXR5VHlwZVxuXHRcdFx0XHRcdCk7XG5cdFx0XHQgIH0pXG5cdFx0XHQ6IFtdXG5cdCkgYXMgRmlsdGVyRmllbGRbXTtcbn1cblxuLyoqXG4gKiBEZXRlcm1pbmVzIGlmIHRoZSBGaWx0ZXJCYXIgc2VhcmNoIGZpZWxkIGlzIGhpZGRlbiBvciBub3QuXG4gKlxuICogQHBhcmFtIGxpc3RSZXBvcnRUYWJsZXMgVGhlIGxpc3QgcmVwb3J0IHRhYmxlc1xuICogQHBhcmFtIGNoYXJ0cyBUaGUgQUxQIGNoYXJ0c1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgaW5mb3JtYXRpb24gaWYgdGhlIEZpbHRlckJhciBzZWFyY2ggZmllbGQgaXMgaGlkZGVuIG9yIG5vdFxuICovXG5leHBvcnQgY29uc3QgZ2V0RmlsdGVyQmFySGlkZUJhc2ljU2VhcmNoID0gZnVuY3Rpb24gKFxuXHRsaXN0UmVwb3J0VGFibGVzOiBUYWJsZVZpc3VhbGl6YXRpb25bXSxcblx0Y2hhcnRzOiBDaGFydFZpc3VhbGl6YXRpb25bXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogYm9vbGVhbiB7XG5cdC8vIENoZWNrIGlmIGNoYXJ0cyBhbGxvdyBzZWFyY2hcblx0Y29uc3Qgbm9TZWFyY2hJbkNoYXJ0cyA9IGNoYXJ0cy5sZW5ndGggPT09IDAgfHwgY2hhcnRzLmV2ZXJ5KChjaGFydCkgPT4gIWNoYXJ0LmFwcGx5U3VwcG9ydGVkLmVuYWJsZVNlYXJjaCk7XG5cblx0Ly8gQ2hlY2sgaWYgYWxsIHRhYmxlcyBhcmUgYW5hbHl0aWNhbCBhbmQgbm9uZSBvZiB0aGVtIGFsbG93IGZvciBzZWFyY2hcblx0Ly8gb3IgYWxsIHRhYmxlcyBhcmUgVHJlZVRhYmxlIGFuZCBub25lIG9mIHRoZW0gYWxsb3cgZm9yIHNlYXJjaFxuXHRjb25zdCBub1NlYXJjaEluVGFibGVzID1cblx0XHRsaXN0UmVwb3J0VGFibGVzLmxlbmd0aCA9PT0gMCB8fFxuXHRcdGxpc3RSZXBvcnRUYWJsZXMuZXZlcnkoKHRhYmxlKSA9PiAodGFibGUuZW5hYmxlQW5hbHl0aWNzIHx8IHRhYmxlLmNvbnRyb2wudHlwZSA9PT0gXCJUcmVlVGFibGVcIikgJiYgIXRhYmxlLmVuYWJsZUJhc2ljU2VhcmNoKTtcblxuXHRjb25zdCBjb250ZXh0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKTtcblx0aWYgKGNvbnRleHRQYXRoICYmIG5vU2VhcmNoSW5DaGFydHMgJiYgbm9TZWFyY2hJblRhYmxlcykge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqXG4gKiBSZXRyaWV2ZXMgZmlsdGVyIGZpZWxkcyBmcm9tIHRoZSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgY3VycmVudCBlbnRpdHlUeXBlXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBmaWx0ZXIgZmllbGRzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRNYW5pZmVzdEZpbHRlckZpZWxkcyA9IGZ1bmN0aW9uIChcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogUmVjb3JkPHN0cmluZywgQ3VzdG9tRWxlbWVudEZpbHRlckZpZWxkPiB7XG5cdGNvbnN0IGZiQ29uZmlnOiBGaWx0ZXJNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmdldEZpbHRlckNvbmZpZ3VyYXRpb24oKTtcblx0Y29uc3QgZGVmaW5lZEZpbHRlckZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGRNYW5pZmVzdENvbmZpZ3VyYXRpb24+ID0gZmJDb25maWc/LmZpbHRlckZpZWxkcyB8fCB7fTtcblx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4gPSBfZ2V0U2VsZWN0aW9uRmllbGRzQnlQYXRoKFxuXHRcdGVudGl0eVR5cGUsXG5cdFx0T2JqZWN0LmtleXMoZGVmaW5lZEZpbHRlckZpZWxkcykubWFwKChrZXkpID0+IEtleUhlbHBlci5nZXRQYXRoRnJvbVNlbGVjdGlvbkZpZWxkS2V5KGtleSkpLFxuXHRcdHRydWUsXG5cdFx0Y29udmVydGVyQ29udGV4dFxuXHQpO1xuXHRjb25zdCBmaWx0ZXJGaWVsZHM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnRGaWx0ZXJGaWVsZD4gPSB7fTtcblxuXHRmb3IgKGNvbnN0IHNLZXkgaW4gZGVmaW5lZEZpbHRlckZpZWxkcykge1xuXHRcdGNvbnN0IGZpbHRlckZpZWxkID0gZGVmaW5lZEZpbHRlckZpZWxkc1tzS2V5XTtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBLZXlIZWxwZXIuZ2V0UGF0aEZyb21TZWxlY3Rpb25GaWVsZEtleShzS2V5KTtcblx0XHRjb25zdCBzZWxlY3Rpb25GaWVsZCA9IHNlbGVjdGlvbkZpZWxkc1twcm9wZXJ0eU5hbWVdO1xuXHRcdGNvbnN0IHR5cGUgPSBmaWx0ZXJGaWVsZC50eXBlID09PSBcIlNsb3RcIiA/IGZpbHRlckZpZWxkVHlwZS5TbG90IDogZmlsdGVyRmllbGRUeXBlLkRlZmF1bHQ7XG5cdFx0Y29uc3QgdmlzdWFsRmlsdGVyID1cblx0XHRcdGZpbHRlckZpZWxkICYmIGZpbHRlckZpZWxkPy52aXN1YWxGaWx0ZXJcblx0XHRcdFx0PyBnZXRWaXN1YWxGaWx0ZXJzKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQsIHNLZXksIGRlZmluZWRGaWx0ZXJGaWVsZHMpXG5cdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGZpbHRlckZpZWxkc1tzS2V5XSA9IHtcblx0XHRcdGtleTogc0tleSxcblx0XHRcdHR5cGU6IHR5cGUsXG5cdFx0XHRzbG90TmFtZTogZmlsdGVyRmllbGQ/LnNsb3ROYW1lIHx8IHNLZXksXG5cdFx0XHRhbm5vdGF0aW9uUGF0aDogc2VsZWN0aW9uRmllbGQ/LmFubm90YXRpb25QYXRoLFxuXHRcdFx0Y29uZGl0aW9uUGF0aDogc2VsZWN0aW9uRmllbGQ/LmNvbmRpdGlvblBhdGggfHwgcHJvcGVydHlOYW1lLFxuXHRcdFx0dGVtcGxhdGU6IGZpbHRlckZpZWxkLnRlbXBsYXRlLFxuXHRcdFx0bGFiZWw6IGZpbHRlckZpZWxkLmxhYmVsLFxuXHRcdFx0cG9zaXRpb246IGZpbHRlckZpZWxkLnBvc2l0aW9uIHx8IHsgcGxhY2VtZW50OiBQbGFjZW1lbnQuQWZ0ZXIgfSxcblx0XHRcdGF2YWlsYWJpbGl0eTogZmlsdGVyRmllbGQuYXZhaWxhYmlsaXR5IHx8IFwiRGVmYXVsdFwiLFxuXHRcdFx0c2V0dGluZ3M6IGZpbHRlckZpZWxkLnNldHRpbmdzLFxuXHRcdFx0dmlzdWFsRmlsdGVyOiB2aXN1YWxGaWx0ZXIsXG5cdFx0XHRyZXF1aXJlZDogZmlsdGVyRmllbGQucmVxdWlyZWRcblx0XHR9O1xuXHR9XG5cdHJldHVybiBmaWx0ZXJGaWVsZHM7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RmlsdGVyRmllbGQgPSBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBzdHJpbmcsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGU6IEVudGl0eVR5cGUpIHtcblx0cmV0dXJuIF9nZXRGaWx0ZXJGaWVsZCh7fSwgcHJvcGVydHlQYXRoLCBjb252ZXJ0ZXJDb250ZXh0LCBlbnRpdHlUeXBlKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRGaWx0ZXJSZXN0cmljdGlvbnMgPSBmdW5jdGlvbiAoXG5cdG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uOiBGaWx0ZXJSZXN0cmljdGlvbnNUeXBlIHwgdW5kZWZpbmVkLFxuXHRzUmVzdHJpY3Rpb246IFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIgfCBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCJcbikge1xuXHRsZXQgYVByb3BzOiBzdHJpbmdbXSA9IFtdO1xuXHRpZiAob0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24gJiYgb0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb25bc1Jlc3RyaWN0aW9uXSkge1xuXHRcdGFQcm9wcyA9IG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uW3NSZXN0cmljdGlvbl0ubWFwKGZ1bmN0aW9uIChvUHJvcGVydHkpIHtcblx0XHRcdHJldHVybiBvUHJvcGVydHkudmFsdWU7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFQcm9wcztcbn07XG5leHBvcnQgY29uc3QgZ2V0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb24gPSBmdW5jdGlvbiAob0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb246IEZpbHRlclJlc3RyaWN0aW9uc1R5cGUgfCB1bmRlZmluZWQpIHtcblx0Y29uc3QgbUFsbG93ZWRFeHByZXNzaW9uczogUmVjb3JkPHN0cmluZywgRmlsdGVyRXhwcmVzc2lvblR5cGVbXT4gPSB7fTtcblx0aWYgKG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uICYmIG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMpIHtcblx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbi5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wZXJ0eTogRmlsdGVyRXhwcmVzc2lvblJlc3RyaWN0aW9uVHlwZSkge1xuXHRcdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdFx0aWYgKG9Qcm9wZXJ0eS5Qcm9wZXJ0eT8udmFsdWUgJiYgb1Byb3BlcnR5LkFsbG93ZWRFeHByZXNzaW9ucykge1xuXHRcdFx0XHRpZiAobUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHk/LnZhbHVlXSkge1xuXHRcdFx0XHRcdG1BbGxvd2VkRXhwcmVzc2lvbnNbb1Byb3BlcnR5LlByb3BlcnR5Py52YWx1ZV0ucHVzaChvUHJvcGVydHkuQWxsb3dlZEV4cHJlc3Npb25zLnRvU3RyaW5nKCkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1BbGxvd2VkRXhwcmVzc2lvbnNbb1Byb3BlcnR5LlByb3BlcnR5Py52YWx1ZV0gPSBbb1Byb3BlcnR5LkFsbG93ZWRFeHByZXNzaW9ucy50b1N0cmluZygpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBtQWxsb3dlZEV4cHJlc3Npb25zO1xufTtcblxuY29uc3QgZ2V0U2VhcmNoRmlsdGVyUHJvcGVydHlJbmZvID0gZnVuY3Rpb24gKCk6IFByb3BlcnR5SW5mbyB7XG5cdHJldHVybiB7XG5cdFx0bmFtZTogXCIkc2VhcmNoXCIsXG5cdFx0cGF0aDogXCIkc2VhcmNoXCIsXG5cdFx0ZGF0YVR5cGU6IHNTdHJpbmdEYXRhVHlwZSxcblx0XHRtYXhDb25kaXRpb25zOiAxXG5cdH07XG59O1xuXG5jb25zdCBnZXRFZGl0U3RhdGVGaWx0ZXJQcm9wZXJ0eUluZm8gPSBmdW5jdGlvbiAoKTogUHJvcGVydHlJbmZvIHtcblx0cmV0dXJuIHtcblx0XHRuYW1lOiBcIiRlZGl0U3RhdGVcIixcblx0XHRwYXRoOiBcIiRlZGl0U3RhdGVcIixcblx0XHRncm91cExhYmVsOiBcIlwiLFxuXHRcdGdyb3VwOiBcIlwiLFxuXHRcdGRhdGFUeXBlOiBzU3RyaW5nRGF0YVR5cGUsXG5cdFx0aGlkZGVuRmlsdGVyOiBmYWxzZVxuXHR9O1xufTtcblxuY29uc3QgZ2V0U2VhcmNoUmVzdHJpY3Rpb25zID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpIHtcblx0Y29uc3QgZW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0cmV0dXJuIGlzRW50aXR5U2V0KGVudGl0eVNldCkgPyBlbnRpdHlTZXQuYW5ub3RhdGlvbnMuQ2FwYWJpbGl0aWVzPy5TZWFyY2hSZXN0cmljdGlvbnMgOiB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBzTmF2aWdhdGlvblBhdGg6IHN0cmluZykge1xuXHRjb25zdCBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXM/Lk5hdmlnYXRpb25SZXN0cmljdGlvbnM7XG5cdGNvbnN0IGFSZXN0cmljdGVkUHJvcGVydGllcyA9IG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zICYmIG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zLlJlc3RyaWN0ZWRQcm9wZXJ0aWVzO1xuXHRyZXR1cm4gKFxuXHRcdGFSZXN0cmljdGVkUHJvcGVydGllcyAmJlxuXHRcdGFSZXN0cmljdGVkUHJvcGVydGllcy5maW5kKGZ1bmN0aW9uIChvUmVzdHJpY3RlZFByb3BlcnR5KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRvUmVzdHJpY3RlZFByb3BlcnR5ICYmXG5cdFx0XHRcdG9SZXN0cmljdGVkUHJvcGVydHkuTmF2aWdhdGlvblByb3BlcnR5ICYmXG5cdFx0XHRcdG9SZXN0cmljdGVkUHJvcGVydHkuTmF2aWdhdGlvblByb3BlcnR5LnZhbHVlID09PSBzTmF2aWdhdGlvblBhdGhcblx0XHRcdCk7XG5cdFx0fSlcblx0KTtcbn07XG5cbnR5cGUgUHJvcGVydHlJbmZvID0ge1xuXHRrZXk/OiBzdHJpbmc7XG5cdGFubm90YXRpb25QYXRoPzogc3RyaW5nO1xuXHRjb25kaXRpb25QYXRoPzogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdHBhdGg/OiBzdHJpbmc7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHRncm91cExhYmVsPzogc3RyaW5nO1xuXHRtYXhDb25kaXRpb25zPzogbnVtYmVyO1xuXHRkYXRhVHlwZT86IHN0cmluZztcblx0Z3JvdXA/OiBzdHJpbmc7XG5cdGhpZGRlbkZpbHRlcj86IGJvb2xlYW47XG5cdGRpc3BsYXk/OiBzdHJpbmc7XG5cdGlzUGFyYW1ldGVyPzogYm9vbGVhbjtcblx0Y2FzZVNlbnNpdGl2ZT86IGJvb2xlYW47XG5cdGF2YWlsYWJpbGl0eT86IEF2YWlsYWJpbGl0eVR5cGU7XG5cdHBvc2l0aW9uPzogUG9zaXRpb247XG5cdHR5cGU/OiBzdHJpbmc7XG5cdHRlbXBsYXRlPzogc3RyaW5nO1xuXHRtZW51Pzogc3RyaW5nO1xuXHRyZXF1aXJlZD86IGJvb2xlYW47XG5cdGZpbHRlckV4cHJlc3Npb24/OiBzdHJpbmc7XG59O1xuY29uc3QgX2ZldGNoQmFzaWNQcm9wZXJ0eUluZm8gPSBmdW5jdGlvbiAob0ZpbHRlckZpZWxkSW5mbzogRmlsdGVyRmllbGQpOiBQcm9wZXJ0eUluZm8ge1xuXHRyZXR1cm4ge1xuXHRcdGtleTogb0ZpbHRlckZpZWxkSW5mby5rZXksXG5cdFx0YW5ub3RhdGlvblBhdGg6IG9GaWx0ZXJGaWVsZEluZm8uYW5ub3RhdGlvblBhdGgsXG5cdFx0Y29uZGl0aW9uUGF0aDogb0ZpbHRlckZpZWxkSW5mby5jb25kaXRpb25QYXRoLFxuXHRcdG5hbWU6IG9GaWx0ZXJGaWVsZEluZm8uY29uZGl0aW9uUGF0aCxcblx0XHRsYWJlbDogb0ZpbHRlckZpZWxkSW5mby5sYWJlbCxcblx0XHRoaWRkZW5GaWx0ZXI6IG9GaWx0ZXJGaWVsZEluZm8uYXZhaWxhYmlsaXR5ID09PSBcIkhpZGRlblwiLFxuXHRcdGRpc3BsYXk6IFwiVmFsdWVcIixcblx0XHRpc1BhcmFtZXRlcjogb0ZpbHRlckZpZWxkSW5mby5pc1BhcmFtZXRlcixcblx0XHRjYXNlU2Vuc2l0aXZlOiBvRmlsdGVyRmllbGRJbmZvLmNhc2VTZW5zaXRpdmUsXG5cdFx0YXZhaWxhYmlsaXR5OiBvRmlsdGVyRmllbGRJbmZvLmF2YWlsYWJpbGl0eSxcblx0XHRwb3NpdGlvbjogb0ZpbHRlckZpZWxkSW5mby5wb3NpdGlvbixcblx0XHR0eXBlOiBvRmlsdGVyRmllbGRJbmZvLnR5cGUsXG5cdFx0dGVtcGxhdGU6IG9GaWx0ZXJGaWVsZEluZm8udGVtcGxhdGUsXG5cdFx0bWVudTogb0ZpbHRlckZpZWxkSW5mby5tZW51LFxuXHRcdHJlcXVpcmVkOiBvRmlsdGVyRmllbGRJbmZvLnJlcXVpcmVkXG5cdH07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChhRXhwcmVzc2lvbnM6IHN0cmluZ1tdKSB7XG5cdGNvbnN0IGFBbGxvd2VkRXhwcmVzc2lvbnNQcmlvcml0eSA9IFtcblx0XHRcIlNpbmdsZVZhbHVlXCIsXG5cdFx0XCJNdWx0aVZhbHVlXCIsXG5cdFx0XCJTaW5nbGVSYW5nZVwiLFxuXHRcdFwiTXVsdGlSYW5nZVwiLFxuXHRcdFwiU2VhcmNoRXhwcmVzc2lvblwiLFxuXHRcdFwiTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblwiXG5cdF07XG5cblx0YUV4cHJlc3Npb25zLnNvcnQoZnVuY3Rpb24gKGE6IHN0cmluZywgYjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIGFBbGxvd2VkRXhwcmVzc2lvbnNQcmlvcml0eS5pbmRleE9mKGEpIC0gYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5LmluZGV4T2YoYik7XG5cdH0pO1xuXG5cdHJldHVybiBhRXhwcmVzc2lvbnNbMF07XG59O1xuXG5leHBvcnQgY29uc3QgZGlzcGxheU1vZGUgPSBmdW5jdGlvbiAob1Byb3BlcnR5QW5ub3RhdGlvbnM6IFByb3BlcnR5QW5ub3RhdGlvbnMsIG9Db2xsZWN0aW9uQW5ub3RhdGlvbnM6IEVudGl0eVR5cGVBbm5vdGF0aW9ucykge1xuXHRjb25zdCBvVGV4dEFubm90YXRpb24gPSBvUHJvcGVydHlBbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0LFxuXHRcdG9UZXh0QXJyYW5nbWVudEFubm90YXRpb24gPVxuXHRcdFx0b1RleHRBbm5vdGF0aW9uICYmXG5cdFx0XHQoKG9Qcm9wZXJ0eUFubm90YXRpb25zICYmIG9Qcm9wZXJ0eUFubm90YXRpb25zPy5Db21tb24/LlRleHQ/LmFubm90YXRpb25zPy5VST8uVGV4dEFycmFuZ2VtZW50KSB8fFxuXHRcdFx0XHQob0NvbGxlY3Rpb25Bbm5vdGF0aW9ucyAmJiBvQ29sbGVjdGlvbkFubm90YXRpb25zPy5VST8uVGV4dEFycmFuZ2VtZW50KSk7XG5cblx0aWYgKG9UZXh0QXJyYW5nbWVudEFubm90YXRpb24pIHtcblx0XHRpZiAob1RleHRBcnJhbmdtZW50QW5ub3RhdGlvbi52YWx1ZU9mKCkgPT09IFwiVUkuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiKSB7XG5cdFx0XHRyZXR1cm4gXCJEZXNjcmlwdGlvblwiO1xuXHRcdH0gZWxzZSBpZiAob1RleHRBcnJhbmdtZW50QW5ub3RhdGlvbi52YWx1ZU9mKCkgPT09IFwiVUkuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0TGFzdFwiKSB7XG5cdFx0XHRyZXR1cm4gXCJWYWx1ZURlc2NyaXB0aW9uXCI7XG5cdFx0fVxuXHRcdHJldHVybiBcIkRlc2NyaXB0aW9uVmFsdWVcIjsgLy9UZXh0Rmlyc3Rcblx0fVxuXHRyZXR1cm4gb1RleHRBbm5vdGF0aW9uID8gXCJEZXNjcmlwdGlvblZhbHVlXCIgOiBcIlZhbHVlXCI7XG59O1xuXG5leHBvcnQgY29uc3QgZmV0Y2hQcm9wZXJ0eUluZm8gPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG9GaWx0ZXJGaWVsZEluZm86IEZpbHRlckZpZWxkLFxuXHRvVHlwZUNvbmZpZzogUGFydGlhbDxQcm9wZXJ0eVR5cGVDb25maWc+XG4pOiBQcm9wZXJ0eUluZm8ge1xuXHRsZXQgb1Byb3BlcnR5SW5mbyA9IF9mZXRjaEJhc2ljUHJvcGVydHlJbmZvKG9GaWx0ZXJGaWVsZEluZm8pO1xuXHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBvRmlsdGVyRmllbGRJbmZvLmFubm90YXRpb25QYXRoO1xuXG5cdGlmICghc0Fubm90YXRpb25QYXRoKSB7XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG5cdH1cblx0Y29uc3QgdGFyZ2V0UHJvcGVydHlPYmplY3QgPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlckNvbnRleHRGb3Ioc0Fubm90YXRpb25QYXRoKS5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkudGFyZ2V0T2JqZWN0O1xuXG5cdGNvbnN0IG9Qcm9wZXJ0eUFubm90YXRpb25zID0gdGFyZ2V0UHJvcGVydHlPYmplY3Q/LmFubm90YXRpb25zO1xuXHRjb25zdCBvQ29sbGVjdGlvbkFubm90YXRpb25zID0gY29udmVydGVyQ29udGV4dD8uZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM7XG5cblx0Y29uc3Qgb0Zvcm1hdE9wdGlvbnMgPSBvVHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zO1xuXHRjb25zdCBvQ29uc3RyYWludHMgPSBvVHlwZUNvbmZpZy5jb25zdHJhaW50cztcblx0b1Byb3BlcnR5SW5mbyA9IE9iamVjdC5hc3NpZ24ob1Byb3BlcnR5SW5mbywge1xuXHRcdGZvcm1hdE9wdGlvbnM6IG9Gb3JtYXRPcHRpb25zLFxuXHRcdGNvbnN0cmFpbnRzOiBvQ29uc3RyYWludHMsXG5cdFx0ZGlzcGxheTogZGlzcGxheU1vZGUob1Byb3BlcnR5QW5ub3RhdGlvbnMsIG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMpXG5cdH0pO1xuXHRyZXR1cm4gb1Byb3BlcnR5SW5mbztcbn07XG5cbmV4cG9ydCBjb25zdCBpc011bHRpVmFsdWUgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBQcm9wZXJ0eUluZm8pIHtcblx0bGV0IGJJc011bHRpVmFsdWUgPSB0cnVlO1xuXHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdHN3aXRjaCAob1Byb3BlcnR5LmZpbHRlckV4cHJlc3Npb24pIHtcblx0XHRjYXNlIFwiU2VhcmNoRXhwcmVzc2lvblwiOlxuXHRcdGNhc2UgXCJTaW5nbGVSYW5nZVwiOlxuXHRcdGNhc2UgXCJTaW5nbGVWYWx1ZVwiOlxuXHRcdFx0YklzTXVsdGlWYWx1ZSA9IGZhbHNlO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG5cdGlmIChvUHJvcGVydHkudHlwZSAmJiBvUHJvcGVydHkudHlwZS5pbmRleE9mKFwiQm9vbGVhblwiKSA+IDApIHtcblx0XHRiSXNNdWx0aVZhbHVlID0gZmFsc2U7XG5cdH1cblx0cmV0dXJuIGJJc011bHRpVmFsdWU7XG59O1xuXG5jb25zdCBfaXNGaWx0ZXJhYmxlTmF2aWdhdGlvblByb3BlcnR5ID0gZnVuY3Rpb24gKFxuXHRlbnRyeTogRGF0YUZpZWxkQWJzdHJhY3RUeXBlc1xuKTogZW50cnkgaXMgQW5ub3RhdGlvblRlcm08RGF0YUZpZWxkIHwgRGF0YUZpZWxkV2l0aFVybCB8IERhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aD4ge1xuXHRyZXR1cm4gKFxuXHRcdChlbnRyeS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkIHx8XG5cdFx0XHRlbnRyeS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCB8fFxuXHRcdFx0ZW50cnkuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCkgJiZcblx0XHRlbnRyeS5WYWx1ZS5wYXRoLmluY2x1ZGVzKFwiL1wiKVxuXHQpO1xufTtcblxuLyoqXG4gKiBBZGRzIHRoZSBhZGRpdGlvbmFsIHByb3BlcnR5IHdoaWNoIHJlZmVyZW5jZXMgdG8gdGhlIHVuaXQsIHRpbWV6b25lLCB0ZXh0QXJyYW5nZW1lbnQgb3IgY3VycmVuY3kgZnJvbSBhIGRhdGEgZmllbGQuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgZGF0YSBmaWVsZCB0byBiZSBjb25zaWRlcmVkXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSBuYXZQcm9wZXJ0aWVzIFRoZSBsaXN0IG9mIG5hdmlnYXRpb24gcHJvcGVydGllc1xuICovXG5jb25zdCBhZGRDaGlsZE5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gZnVuY3Rpb24gKFxuXHRkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdlByb3BlcnRpZXM6IHN0cmluZ1tdXG4pIHtcblx0Y29uc3QgdGFyZ2V0UHJvcGVydHkgPSAoZGF0YUZpZWxkIGFzIERhdGFGaWVsZCkuVmFsdWU/LiR0YXJnZXQ7XG5cdGlmICh0YXJnZXRQcm9wZXJ0eSkge1xuXHRcdGNvbnN0IGFkZGl0aW9uYWxQcm9wZXJ0eVBhdGggPVxuXHRcdFx0Z2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGgodGFyZ2V0UHJvcGVydHkpIHx8XG5cdFx0XHRnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eVBhdGgodGFyZ2V0UHJvcGVydHkpIHx8XG5cdFx0XHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aCh0YXJnZXRQcm9wZXJ0eSkgfHxcblx0XHRcdGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5UGF0aCh0YXJnZXRQcm9wZXJ0eSk7XG5cdFx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnR5ID0gYWRkaXRpb25hbFByb3BlcnR5UGF0aFxuXHRcdFx0PyBlbmhhbmNlRGF0YU1vZGVsUGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSwgYWRkaXRpb25hbFByb3BlcnR5UGF0aCkubmF2aWdhdGlvblByb3BlcnRpZXNcblx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGlmIChuYXZpZ2F0aW9uUHJvcGVydHk/Lmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnR5UGF0aCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVswXS5uYW1lO1xuXHRcdFx0aWYgKCFuYXZQcm9wZXJ0aWVzLmluY2x1ZGVzKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpKSB7XG5cdFx0XHRcdG5hdlByb3BlcnRpZXMucHVzaChuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbi8qKlxuICogR2V0cyB1c2VkIG5hdmlnYXRpb24gcHJvcGVydGllcyBmb3IgYXZhaWxhYmxlIGRhdGFGaWVsZC5cbiAqXG4gKiBAcGFyYW0gbmF2UHJvcGVydGllcyBUaGUgbGlzdCBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIGRhdGEgZmllbGQgdG8gYmUgY29uc2lkZXJlZFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgbGlzdCBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcbiAqL1xuY29uc3QgZ2V0TmF2aWdhdGlvblByb3BlcnRpZXNSZWN1cnNpdmVseSA9IGZ1bmN0aW9uIChcblx0bmF2UHJvcGVydGllczogc3RyaW5nW10sXG5cdGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKSB7XG5cdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0c3dpdGNoIChkYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSkge1xuXHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlOlxuXHRcdFx0XHRcdGRhdGFGaWVsZC5UYXJnZXQuJHRhcmdldC5EYXRhPy5mb3JFYWNoKChpbm5lckRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdFx0XHRcdFx0Z2V0TmF2aWdhdGlvblByb3BlcnRpZXNSZWN1cnNpdmVseShuYXZQcm9wZXJ0aWVzLCBpbm5lckRhdGFGaWVsZCwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0XHRpZiAoX2lzRmlsdGVyYWJsZU5hdmlnYXRpb25Qcm9wZXJ0eShkYXRhRmllbGQpKSB7XG5cdFx0XHRcdGNvbnN0IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSwgZGF0YUZpZWxkLlZhbHVlLnBhdGgpXG5cdFx0XHRcdFx0Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzWzBdLm5hbWU7XG5cdFx0XHRcdGlmICghbmF2UHJvcGVydGllcy5pbmNsdWRlcyhuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKSkge1xuXHRcdFx0XHRcdG5hdlByb3BlcnRpZXMucHVzaChuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gQWRkaXRpb25hbCBwcm9wZXJ0eSBmcm9tIHRleHQgYXJyYW5nZW1lbnQvdW5pdHMvY3VycmVuY2llcy90aW1lem9uZS4uLlxuXHRcdFx0YWRkQ2hpbGROYXZpZ2F0aW9uUHJvcGVydGllcyhkYXRhRmllbGQsIGNvbnZlcnRlckNvbnRleHQsIG5hdlByb3BlcnRpZXMpO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG5cdHJldHVybiBuYXZQcm9wZXJ0aWVzO1xufTtcblxuY29uc3QgZ2V0QW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhID0gZnVuY3Rpb24gKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRsclRhYmxlczogVGFibGVWaXN1YWxpemF0aW9uW10gPSBbXSxcblx0YW5ub3RhdGlvblBhdGggPSBcIlwiLFxuXHRpbmNsdWRlSGlkZGVuID0gZmFsc2UsXG5cdGxpbmVJdGVtVGVybT86IHN0cmluZ1xuKSB7XG5cdC8vIEZldGNoIGFsbCBzZWxlY3Rpb25WYXJpYW50cyBkZWZpbmVkIGluIHRoZSBkaWZmZXJlbnQgdmlzdWFsaXphdGlvbnMgYW5kIGRpZmZlcmVudCB2aWV3cyAobXVsdGkgdGFibGUgbW9kZSlcblx0Y29uc3Qgc2VsZWN0aW9uVmFyaWFudHM6IFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uW10gPSBnZXRTZWxlY3Rpb25WYXJpYW50cyhsclRhYmxlcywgY29udmVydGVyQ29udGV4dCk7XG5cblx0Ly8gY3JlYXRlIGEgbWFwIG9mIHByb3BlcnRpZXMgdG8gYmUgdXNlZCBpbiBzZWxlY3Rpb24gdmFyaWFudHNcblx0Y29uc3QgZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPiA9IGdldEV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcyhzZWxlY3Rpb25WYXJpYW50cyk7XG5cdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0Ly9GaWx0ZXJzIHdoaWNoIGhhcyB0byBiZSBhZGRlZCB3aGljaCBpcyBwYXJ0IG9mIFNWL0RlZmF1bHQgYW5ub3RhdGlvbnMgYnV0IG5vdCBwcmVzZW50IGluIHRoZSBTZWxlY3Rpb25GaWVsZHNcblx0Y29uc3QgYW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzID0gKChhbm5vdGF0aW9uUGF0aCAmJiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKGFubm90YXRpb25QYXRoKT8uYW5ub3RhdGlvbikgfHxcblx0XHRlbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uU2VsZWN0aW9uRmllbGRzIHx8XG5cdFx0W10pIGFzIFByb3BlcnR5UGF0aFtdO1xuXG5cdGxldCBuYXZQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRpZiAobHJUYWJsZXMubGVuZ3RoID09PSAwICYmICEhbGluZUl0ZW1UZXJtKSB7XG5cdFx0KGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24obGluZUl0ZW1UZXJtKS5hbm5vdGF0aW9uIGFzIExpbmVJdGVtKT8uZm9yRWFjaCgoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0XHRuYXZQcm9wZXJ0aWVzID0gZ2V0TmF2aWdhdGlvblByb3BlcnRpZXNSZWN1cnNpdmVseShuYXZQcm9wZXJ0aWVzLCBkYXRhRmllbGQsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdH0pO1xuXHR9XG5cblx0aWYgKE1vZGVsSGVscGVyLmlzRHJhZnRSb290KGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpKSB7XG5cdFx0bmF2UHJvcGVydGllcy5wdXNoKFxuXHRcdFx0XCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9DcmVhdGlvbkRhdGVUaW1lXCIsXG5cdFx0XHRcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0NyZWF0ZWRCeVVzZXJcIixcblx0XHRcdFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvTGFzdENoYW5nZURhdGVUaW1lXCIsXG5cdFx0XHRcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VkQnlVc2VyXCJcblx0XHQpO1xuXHR9XG5cblx0Ly8gY3JlYXRlIGEgbWFwIG9mIGFsbCBwb3RlbnRpYWwgZmlsdGVyIGZpZWxkcyBiYXNlZCBvbi4uLlxuXHRjb25zdCBmaWx0ZXJGaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiA9IHtcblx0XHQvLyAuLi5ub24gaGlkZGVuIHByb3BlcnRpZXMgb2YgdGhlIGVudGl0eVxuXHRcdC4uLl9nZXRTZWxlY3Rpb25GaWVsZHMoZW50aXR5VHlwZSwgXCJcIiwgZW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLCBpbmNsdWRlSGlkZGVuLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHQvLyAuLi4gbm9uIGhpZGRlbiBwcm9wZXJ0aWVzIG9mIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRcdC4uLl9nZXRTZWxlY3Rpb25GaWVsZHNCeVBhdGgoZW50aXR5VHlwZSwgbmF2UHJvcGVydGllcywgZmFsc2UsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdC8vIC4uLmFkZGl0aW9uYWwgbWFuaWZlc3QgZGVmaW5lZCBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcblx0XHQuLi5fZ2V0U2VsZWN0aW9uRmllbGRzQnlQYXRoKFxuXHRcdFx0ZW50aXR5VHlwZSxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuZ2V0RmlsdGVyQ29uZmlndXJhdGlvbigpLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLFxuXHRcdFx0aW5jbHVkZUhpZGRlbixcblx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHQpXG5cdH07XG5cdGxldCBhU2VsZWN0T3B0aW9uczogU2VsZWN0T3B0aW9uVHlwZVtdID0gW107XG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBnZXRTZWxlY3Rpb25WYXJpYW50KGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRpZiAoc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdGFTZWxlY3RPcHRpb25zID0gc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zO1xuXHR9XG5cblx0Y29uc3QgcHJvcGVydHlJbmZvRmllbGRzOiBGaWx0ZXJGaWVsZFtdID1cblx0XHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM/LnJlZHVjZSgoc2VsZWN0aW9uRmllbGRzOiBGaWx0ZXJGaWVsZFtdLCBzZWxlY3Rpb25GaWVsZCkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoID0gc2VsZWN0aW9uRmllbGQudmFsdWU7XG5cdFx0XHRpZiAoIShwcm9wZXJ0eVBhdGggaW4gZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzKSkge1xuXHRcdFx0XHRsZXQgbmF2aWdhdGlvblBhdGg6IHN0cmluZztcblx0XHRcdFx0aWYgKGFubm90YXRpb25QYXRoLnN0YXJ0c1dpdGgoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIpKSB7XG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGggPSBcIlwiO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoID0gYW5ub3RhdGlvblBhdGguc3BsaXQoXCIvQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiKVswXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGZpbHRlclByb3BlcnR5UGF0aCA9IG5hdmlnYXRpb25QYXRoID8gbmF2aWdhdGlvblBhdGggKyBcIi9cIiArIHByb3BlcnR5UGF0aCA6IHByb3BlcnR5UGF0aDtcblx0XHRcdFx0Y29uc3QgZmlsdGVyRmllbGQ6IEZpbHRlckZpZWxkIHwgdW5kZWZpbmVkID0gX2dldEZpbHRlckZpZWxkKFxuXHRcdFx0XHRcdGZpbHRlckZpZWxkcyxcblx0XHRcdFx0XHRmaWx0ZXJQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRlbnRpdHlUeXBlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChmaWx0ZXJGaWVsZCkge1xuXHRcdFx0XHRcdGZpbHRlckZpZWxkLmdyb3VwID0gXCJcIjtcblx0XHRcdFx0XHRmaWx0ZXJGaWVsZC5ncm91cExhYmVsID0gXCJcIjtcblx0XHRcdFx0XHRzZWxlY3Rpb25GaWVsZHMucHVzaChmaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBzZWxlY3Rpb25GaWVsZHM7XG5cdFx0fSwgW10pIHx8IFtdO1xuXG5cdGNvbnN0IGRlZmF1bHRGaWx0ZXJGaWVsZHMgPSBfZ2V0RGVmYXVsdEZpbHRlckZpZWxkcyhcblx0XHRhU2VsZWN0T3B0aW9ucyxcblx0XHRlbnRpdHlUeXBlLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0ZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzLFxuXHRcdGFubm90YXRlZFNlbGVjdGlvbkZpZWxkc1xuXHQpO1xuXG5cdHJldHVybiB7XG5cdFx0ZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzOiBleGNsdWRlZEZpbHRlclByb3BlcnRpZXMsXG5cdFx0ZW50aXR5VHlwZTogZW50aXR5VHlwZSxcblx0XHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM6IGFubm90YXRlZFNlbGVjdGlvbkZpZWxkcyxcblx0XHRmaWx0ZXJGaWVsZHM6IGZpbHRlckZpZWxkcyxcblx0XHRwcm9wZXJ0eUluZm9GaWVsZHM6IHByb3BlcnR5SW5mb0ZpZWxkcyxcblx0XHRkZWZhdWx0RmlsdGVyRmllbGRzOiBkZWZhdWx0RmlsdGVyRmllbGRzXG5cdH07XG59O1xuXG5leHBvcnQgY29uc3QgZmV0Y2hUeXBlQ29uZmlnID0gZnVuY3Rpb24gKHByb3BlcnR5OiBQcm9wZXJ0eSkge1xuXHRjb25zdCBvVHlwZUNvbmZpZyA9IGdldFR5cGVDb25maWcocHJvcGVydHksIHByb3BlcnR5Py50eXBlKTtcblx0aWYgKHByb3BlcnR5Py50eXBlID09PSBzRWRtU3RyaW5nICYmIChvVHlwZUNvbmZpZy5jb25zdHJhaW50cy5udWxsYWJsZSA9PT0gdW5kZWZpbmVkIHx8IG9UeXBlQ29uZmlnLmNvbnN0cmFpbnRzLm51bGxhYmxlID09PSB0cnVlKSkge1xuXHRcdG9UeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnMucGFyc2VLZWVwc0VtcHR5U3RyaW5nID0gZmFsc2U7XG5cdH1cblx0cmV0dXJuIG9UeXBlQ29uZmlnO1xufTtcblxuZXhwb3J0IGNvbnN0IGFzc2lnbkRhdGFUeXBlVG9Qcm9wZXJ0eUluZm8gPSBmdW5jdGlvbiAoXG5cdHByb3BlcnR5SW5mb0ZpZWxkOiBGaWx0ZXJGaWVsZCxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0YVJlcXVpcmVkUHJvcHM6IHVua25vd25bXSxcblx0YVR5cGVDb25maWc6IFJlY29yZDxzdHJpbmcsIFBhcnRpYWw8UHJvcGVydHlUeXBlQ29uZmlnPj5cbikge1xuXHRsZXQgb1Byb3BlcnR5SW5mbyA9IGZldGNoUHJvcGVydHlJbmZvKGNvbnZlcnRlckNvbnRleHQsIHByb3BlcnR5SW5mb0ZpZWxkLCBhVHlwZUNvbmZpZ1twcm9wZXJ0eUluZm9GaWVsZC5rZXldKSxcblx0XHRzUHJvcGVydHlQYXRoID0gXCJcIjtcblx0aWYgKHByb3BlcnR5SW5mb0ZpZWxkLmNvbmRpdGlvblBhdGgpIHtcblx0XHRzUHJvcGVydHlQYXRoID0gcHJvcGVydHlJbmZvRmllbGQuY29uZGl0aW9uUGF0aC5yZXBsYWNlKC9cXCt8XFwqL2csIFwiXCIpO1xuXHR9XG5cdGlmIChvUHJvcGVydHlJbmZvKSB7XG5cdFx0b1Byb3BlcnR5SW5mbyA9IE9iamVjdC5hc3NpZ24ob1Byb3BlcnR5SW5mbywge1xuXHRcdFx0bWF4Q29uZGl0aW9uczogIW9Qcm9wZXJ0eUluZm8uaXNQYXJhbWV0ZXIgJiYgaXNNdWx0aVZhbHVlKG9Qcm9wZXJ0eUluZm8pID8gLTEgOiAxLFxuXHRcdFx0cmVxdWlyZWQ6IHByb3BlcnR5SW5mb0ZpZWxkLnJlcXVpcmVkID8/IChvUHJvcGVydHlJbmZvLmlzUGFyYW1ldGVyIHx8IGFSZXF1aXJlZFByb3BzLmluZGV4T2Yoc1Byb3BlcnR5UGF0aCkgPj0gMCksXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRkYXRhVHlwZTogYVR5cGVDb25maWdbcHJvcGVydHlJbmZvRmllbGQua2V5XS50eXBlXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG59O1xuXG5leHBvcnQgY29uc3QgcHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyA9IGZ1bmN0aW9uIChcblx0cHJvcGVydHlJbmZvRmllbGRzOiBGaWx0ZXJGaWVsZFtdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRkZWZhdWx0VmFsdWVQcm9wZXJ0eUZpZWxkcz86IEZpbHRlckZpZWxkW11cbikge1xuXHQvL2dldCBUeXBlQ29uZmlnIGZ1bmN0aW9uXG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkVHlwZXM6IHVua25vd25bXSA9IFtdO1xuXHRjb25zdCBhVHlwZUNvbmZpZzogUmVjb3JkPHN0cmluZywgUGFydGlhbDxQcm9wZXJ0eVR5cGVDb25maWc+PiA9IHt9O1xuXG5cdGlmIChkZWZhdWx0VmFsdWVQcm9wZXJ0eUZpZWxkcykge1xuXHRcdHByb3BlcnR5SW5mb0ZpZWxkcyA9IHByb3BlcnR5SW5mb0ZpZWxkcy5jb25jYXQoZGVmYXVsdFZhbHVlUHJvcGVydHlGaWVsZHMpO1xuXHR9XG5cdC8vYWRkIHR5cGVDb25maWdcblx0cHJvcGVydHlJbmZvRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtZXRlckZpZWxkKSB7XG5cdFx0aWYgKHBhcmFtZXRlckZpZWxkLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eUNvbnZlcnR5Q29udGV4dCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihwYXJhbWV0ZXJGaWVsZC5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVRhcmdldE9iamVjdCA9IHByb3BlcnR5Q29udmVydHlDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS50YXJnZXRPYmplY3Q7XG5cdFx0XHRzZWxlY3Rpb25GaWVsZFR5cGVzLnB1c2gocHJvcGVydHlUYXJnZXRPYmplY3Q/LnR5cGUpO1xuXHRcdFx0Y29uc3Qgb1R5cGVDb25maWcgPSBmZXRjaFR5cGVDb25maWcocHJvcGVydHlUYXJnZXRPYmplY3QpO1xuXHRcdFx0YVR5cGVDb25maWdbcGFyYW1ldGVyRmllbGQua2V5XSA9IG9UeXBlQ29uZmlnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzZWxlY3Rpb25GaWVsZFR5cGVzLnB1c2goc0VkbVN0cmluZyk7XG5cdFx0XHRhVHlwZUNvbmZpZ1twYXJhbWV0ZXJGaWVsZC5rZXldID0geyB0eXBlOiBzU3RyaW5nRGF0YVR5cGUgfTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIGZpbHRlclJlc3RyaWN0aW9uc1xuXHRjb25zdCBlbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zID0gaXNFbnRpdHlTZXQoZW50aXR5U2V0KSA/IGVudGl0eVNldC5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/LkZpbHRlclJlc3RyaWN0aW9ucyA6IHVuZGVmaW5lZDtcblx0Y29uc3Qgb1JldDoge1xuXHRcdFJlcXVpcmVkUHJvcGVydGllcz86IHN0cmluZ1tdO1xuXHRcdE5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzPzogc3RyaW5nW107XG5cdFx0RmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zPzogUmVjb3JkPHN0cmluZywgRmlsdGVyRXhwcmVzc2lvblR5cGVbXT47XG5cdH0gPSB7fTtcblx0b1JldC5SZXF1aXJlZFByb3BlcnRpZXMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9ucywgXCJSZXF1aXJlZFByb3BlcnRpZXNcIikgfHwgW107XG5cdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9ucywgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXTtcblx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgPSBnZXRGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zKTtcblxuXHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKTtcblx0Y29uc3QgYVBhdGhQYXJ0cyA9IHNFbnRpdHlTZXRQYXRoLnNwbGl0KFwiL1wiKTtcblx0aWYgKGFQYXRoUGFydHMubGVuZ3RoID4gMikge1xuXHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IGFQYXRoUGFydHNbYVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRhUGF0aFBhcnRzLnNwbGljZSgtMSwgMSk7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25SZXN0cmljdGlvbnMgPSBnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQsIHNOYXZpZ2F0aW9uUGF0aCk7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25GaWx0ZXJSZXN0cmljdGlvbnMgPSBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyAmJiBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucy5GaWx0ZXJSZXN0cmljdGlvbnM7XG5cdFx0b1JldC5SZXF1aXJlZFByb3BlcnRpZXMgPSBvUmV0LlJlcXVpcmVkUHJvcGVydGllcy5jb25jYXQoXG5cdFx0XHRnZXRGaWx0ZXJSZXN0cmljdGlvbnMob05hdmlnYXRpb25GaWx0ZXJSZXN0cmljdGlvbnMsIFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIpIHx8IFtdXG5cdFx0KTtcblx0XHRvUmV0Lk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzID0gb1JldC5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcy5jb25jYXQoXG5cdFx0XHRnZXRGaWx0ZXJSZXN0cmljdGlvbnMob05hdmlnYXRpb25GaWx0ZXJSZXN0cmljdGlvbnMsIFwiTm9uRmlsdGVyYWJsZVByb3BlcnRpZXNcIikgfHwgW11cblx0XHQpO1xuXHRcdG9SZXQuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zID0ge1xuXHRcdFx0Li4uKGdldEZpbHRlckFsbG93ZWRFeHByZXNzaW9uKG9OYXZpZ2F0aW9uRmlsdGVyUmVzdHJpY3Rpb25zKSB8fCB7fSksXG5cdFx0XHQuLi5vUmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1xuXHRcdH07XG5cdH1cblx0Y29uc3QgYVJlcXVpcmVkUHJvcHMgPSBvUmV0LlJlcXVpcmVkUHJvcGVydGllcztcblx0Y29uc3QgYU5vbkZpbHRlcmFibGVQcm9wcyA9IG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXM7XG5cdGNvbnN0IGFGZXRjaGVkUHJvcGVydGllczogUHJvcGVydHlJbmZvW10gPSBbXTtcblxuXHQvLyBwcm9jZXNzIHRoZSBmaWVsZHMgdG8gYWRkIG5lY2Vzc2FyeSBwcm9wZXJ0aWVzXG5cdHByb3BlcnR5SW5mb0ZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eUluZm9GaWVsZCkge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eUluZm9GaWVsZC5jb25kaXRpb25QYXRoLnJlcGxhY2UoL1xcK3xcXCovZywgXCJcIik7XG5cdFx0aWYgKGFOb25GaWx0ZXJhYmxlUHJvcHMuaW5kZXhPZihzUHJvcGVydHlQYXRoKSA9PT0gLTEpIHtcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eUluZm8gPSBhc3NpZ25EYXRhVHlwZVRvUHJvcGVydHlJbmZvKHByb3BlcnR5SW5mb0ZpZWxkLCBjb252ZXJ0ZXJDb250ZXh0LCBhUmVxdWlyZWRQcm9wcywgYVR5cGVDb25maWcpO1xuXHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2gob1Byb3BlcnR5SW5mbyk7XG5cdFx0fVxuXHR9KTtcblxuXHQvL2FkZCBlZGl0XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0aWYgKE1vZGVsSGVscGVyLmlzT2JqZWN0UGF0aERyYWZ0U3VwcG9ydGVkKGRhdGFNb2RlbE9iamVjdFBhdGgpKSB7XG5cdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2goZ2V0RWRpdFN0YXRlRmlsdGVyUHJvcGVydHlJbmZvKCkpO1xuXHR9XG5cdC8vIGFkZCBzZWFyY2hcblx0Y29uc3Qgc2VhcmNoUmVzdHJpY3Rpb25zID0gZ2V0U2VhcmNoUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBoaWRlQmFzaWNTZWFyY2ggPSBCb29sZWFuKHNlYXJjaFJlc3RyaWN0aW9ucyAmJiAhc2VhcmNoUmVzdHJpY3Rpb25zLlNlYXJjaGFibGUpO1xuXHRpZiAoc0VudGl0eVNldFBhdGggJiYgaGlkZUJhc2ljU2VhcmNoICE9PSB0cnVlKSB7XG5cdFx0aWYgKCFzZWFyY2hSZXN0cmljdGlvbnMgfHwgc2VhcmNoUmVzdHJpY3Rpb25zPy5TZWFyY2hhYmxlKSB7XG5cdFx0XHRhRmV0Y2hlZFByb3BlcnRpZXMucHVzaChnZXRTZWFyY2hGaWx0ZXJQcm9wZXJ0eUluZm8oKSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGFGZXRjaGVkUHJvcGVydGllcztcbn07XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRDdXN0b21NYW5pZmVzdEVsZW1lbnRzID0gZnVuY3Rpb24gKFxuXHRmaWx0ZXJGaWVsZHM6IE1hbmlmZXN0RmlsdGVyRmllbGRbXSxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKSB7XG5cdHJldHVybiBpbnNlcnRDdXN0b21FbGVtZW50cyhmaWx0ZXJGaWVsZHMsIGdldE1hbmlmZXN0RmlsdGVyRmllbGRzKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpLCB7XG5cdFx0YXZhaWxhYmlsaXR5OiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGxhYmVsOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHR5cGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0cG9zaXRpb246IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0c2xvdE5hbWU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0dGVtcGxhdGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0c2V0dGluZ3M6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0dmlzdWFsRmlsdGVyOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHJlcXVpcmVkOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlXG5cdH0pO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNlbGVjdGlvbiBmaWVsZHMgdGhhdCB3aWxsIGJlIHVzZWQgd2l0aGluIHRoZSBmaWx0ZXIgYmFyXG4gKiBUaGlzIGNvbmZpZ3VyYXRpb24gdGFrZXMgaW50byBhY2NvdW50IHRoZSBhbm5vdGF0aW9uIGFuZCB0aGUgc2VsZWN0aW9uIHZhcmlhbnRzLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gbHJUYWJsZXNcbiAqIEBwYXJhbSBhbm5vdGF0aW9uUGF0aFxuICogQHBhcmFtIFtpbmNsdWRlSGlkZGVuXVxuICogQHBhcmFtIFtsaW5lSXRlbVRlcm1dXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBzZWxlY3Rpb24gZmllbGRzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTZWxlY3Rpb25GaWVsZHMgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGxyVGFibGVzOiBUYWJsZVZpc3VhbGl6YXRpb25bXSA9IFtdLFxuXHRhbm5vdGF0aW9uUGF0aCA9IFwiXCIsXG5cdGluY2x1ZGVIaWRkZW4/OiBib29sZWFuLFxuXHRsaW5lSXRlbVRlcm0/OiBzdHJpbmdcbikge1xuXHRjb25zdCBvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhID0gZ2V0QW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhKFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0bHJUYWJsZXMsXG5cdFx0YW5ub3RhdGlvblBhdGgsXG5cdFx0aW5jbHVkZUhpZGRlbixcblx0XHRsaW5lSXRlbVRlcm1cblx0KTtcblx0Y29uc3QgcGFyYW1ldGVyRmllbGRzID0gX2dldFBhcmFtZXRlckZpZWxkcyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0bGV0IHByb3BlcnR5SW5mb0ZpZWxkczogRmlsdGVyRmllbGRbXSA9IG9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEucHJvcGVydHlJbmZvRmllbGRzO1xuXHRjb25zdCBlbnRpdHlUeXBlID0gb0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YS5lbnRpdHlUeXBlO1xuXG5cdHByb3BlcnR5SW5mb0ZpZWxkcyA9IHBhcmFtZXRlckZpZWxkcy5jb25jYXQocHJvcGVydHlJbmZvRmllbGRzKTtcblxuXHRwcm9wZXJ0eUluZm9GaWVsZHMgPSBpbnNlcnRDdXN0b21NYW5pZmVzdEVsZW1lbnRzKHByb3BlcnR5SW5mb0ZpZWxkcywgZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cblx0Y29uc3QgYUZldGNoZWRQcm9wZXJ0aWVzID0gcHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyhcblx0XHRwcm9wZXJ0eUluZm9GaWVsZHMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLmRlZmF1bHRGaWx0ZXJGaWVsZHNcblx0KTtcblx0YUZldGNoZWRQcm9wZXJ0aWVzLnNvcnQoZnVuY3Rpb24gKGE6IEZpbHRlckdyb3VwLCBiOiBGaWx0ZXJHcm91cCkge1xuXHRcdGlmIChhLmdyb3VwTGFiZWwgPT09IHVuZGVmaW5lZCB8fCBhLmdyb3VwTGFiZWwgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiAtMTtcblx0XHR9XG5cdFx0aWYgKGIuZ3JvdXBMYWJlbCA9PT0gdW5kZWZpbmVkIHx8IGIuZ3JvdXBMYWJlbCA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuIDE7XG5cdFx0fVxuXHRcdHJldHVybiBhLmdyb3VwTGFiZWwubG9jYWxlQ29tcGFyZShiLmdyb3VwTGFiZWwpO1xuXHR9KTtcblxuXHRsZXQgc0ZldGNoUHJvcGVydGllcyA9IEpTT04uc3RyaW5naWZ5KGFGZXRjaGVkUHJvcGVydGllcyk7XG5cdHNGZXRjaFByb3BlcnRpZXMgPSBzRmV0Y2hQcm9wZXJ0aWVzLnJlcGxhY2UoL1xcey9nLCBcIlxcXFx7XCIpO1xuXHRzRmV0Y2hQcm9wZXJ0aWVzID0gc0ZldGNoUHJvcGVydGllcy5yZXBsYWNlKC9cXH0vZywgXCJcXFxcfVwiKTtcblx0Y29uc3Qgc1Byb3BlcnR5SW5mbyA9IHNGZXRjaFByb3BlcnRpZXM7XG5cdC8vIGVuZCBvZiBwcm9wZXJ0eUZpZWxkcyBwcm9jZXNzaW5nXG5cblx0Ly8gdG8gcG9wdWxhdGUgc2VsZWN0aW9uIGZpZWxkc1xuXHRsZXQgcHJvcFNlbGVjdGlvbkZpZWxkczogRmlsdGVyRmllbGRbXSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YS5wcm9wZXJ0eUluZm9GaWVsZHMpKTtcblx0cHJvcFNlbGVjdGlvbkZpZWxkcyA9IHBhcmFtZXRlckZpZWxkcy5jb25jYXQocHJvcFNlbGVjdGlvbkZpZWxkcyk7XG5cdC8vIGNyZWF0ZSBhIG1hcCBvZiBwcm9wZXJ0aWVzIHRvIGJlIHVzZWQgaW4gc2VsZWN0aW9uIHZhcmlhbnRzXG5cdGNvbnN0IGV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllczogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4gPSBvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLmV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcztcblx0Y29uc3QgZmlsdGVyRmFjZXRzID0gZW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LlVJPy5GaWx0ZXJGYWNldHM7XG5cdGxldCBmaWx0ZXJGYWNldE1hcDogUmVjb3JkPHN0cmluZywgRmlsdGVyR3JvdXA+ID0ge307XG5cblx0Y29uc3QgYUZpZWxkR3JvdXBzID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcIlVJXCIsIFVJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXApO1xuXG5cdGlmIChmaWx0ZXJGYWNldHMgPT09IHVuZGVmaW5lZCB8fCBmaWx0ZXJGYWNldHMubGVuZ3RoIDwgMCkge1xuXHRcdGZvciAoY29uc3QgaSBpbiBhRmllbGRHcm91cHMpIHtcblx0XHRcdGZpbHRlckZhY2V0TWFwID0ge1xuXHRcdFx0XHQuLi5maWx0ZXJGYWNldE1hcCxcblx0XHRcdFx0Li4uZ2V0RmllbGRHcm91cEZpbHRlckdyb3VwcyhhRmllbGRHcm91cHNbaV0pXG5cdFx0XHR9O1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmaWx0ZXJGYWNldE1hcCA9IGZpbHRlckZhY2V0cy5yZWR1Y2UoKHByZXZpb3VzVmFsdWU6IFJlY29yZDxzdHJpbmcsIEZpbHRlckdyb3VwPiwgZmlsdGVyRmFjZXQ6IFJlZmVyZW5jZUZhY2V0VHlwZXMpID0+IHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgKGZpbHRlckZhY2V0Py5UYXJnZXQ/LiR0YXJnZXQgYXMgRmllbGRHcm91cCk/LkRhdGE/Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHByZXZpb3VzVmFsdWVbKChmaWx0ZXJGYWNldD8uVGFyZ2V0Py4kdGFyZ2V0IGFzIEZpZWxkR3JvdXApPy5EYXRhW2ldIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LnBhdGhdID0ge1xuXHRcdFx0XHRcdGdyb3VwOiBmaWx0ZXJGYWNldD8uSUQ/LnRvU3RyaW5nKCksXG5cdFx0XHRcdFx0Z3JvdXBMYWJlbDogZmlsdGVyRmFjZXQ/LkxhYmVsPy50b1N0cmluZygpXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJldmlvdXNWYWx1ZTtcblx0XHR9LCB7fSk7XG5cdH1cblxuXHQvLyBjcmVhdGUgYSBtYXAgb2YgYWxsIHBvdGVudGlhbCBmaWx0ZXIgZmllbGRzIGJhc2VkIG9uLi4uXG5cdGNvbnN0IGZpbHRlckZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+ID0gb0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YS5maWx0ZXJGaWVsZHM7XG5cblx0Ly8gZmluYWxseSBjcmVhdGUgZmluYWwgbGlzdCBvZiBmaWx0ZXIgZmllbGRzIGJ5IGFkZGluZyB0aGUgU2VsZWN0aW9uRmllbGRzIGZpcnN0IChvcmRlciBtYXR0ZXJzKS4uLlxuXHRsZXQgYWxsRmlsdGVycyA9IHByb3BTZWxlY3Rpb25GaWVsZHNcblxuXHRcdC8vIC4uLmFuZCBhZGRpbmcgcmVtYWluaW5nIGZpbHRlciBmaWVsZHMsIHRoYXQgYXJlIG5vdCB1c2VkIGluIGEgU2VsZWN0aW9uVmFyaWFudCAob3JkZXIgZG9lc24ndCBtYXR0ZXIpXG5cdFx0LmNvbmNhdChcblx0XHRcdE9iamVjdC5rZXlzKGZpbHRlckZpZWxkcylcblx0XHRcdFx0LmZpbHRlcigocHJvcGVydHlQYXRoKSA9PiAhKHByb3BlcnR5UGF0aCBpbiBleGNsdWRlZEZpbHRlclByb3BlcnRpZXMpKVxuXHRcdFx0XHQubWFwKChwcm9wZXJ0eVBhdGgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbihmaWx0ZXJGaWVsZHNbcHJvcGVydHlQYXRoXSwgZmlsdGVyRmFjZXRNYXBbcHJvcGVydHlQYXRoXSk7XG5cdFx0XHRcdH0pXG5cdFx0KTtcblx0Y29uc3Qgc0NvbnRleHRQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpO1xuXG5cdC8vaWYgYWxsIHRhYmxlcyBhcmUgYW5hbHl0aWNhbCB0YWJsZXMgXCJhZ2dyZWdhdGFibGVcIiBwcm9wZXJ0aWVzIG11c3QgYmUgZXhjbHVkZWRcblx0aWYgKGNoZWNrQWxsVGFibGVGb3JFbnRpdHlTZXRBcmVBbmFseXRpY2FsKGxyVGFibGVzLCBzQ29udGV4dFBhdGgpKSB7XG5cdFx0Ly8gQ3VycmVudGx5IGFsbCBhZ3JlZ2F0ZXMgYXJlIHJvb3QgZW50aXR5IHByb3BlcnRpZXMgKG5vIHByb3BlcnRpZXMgY29taW5nIGZyb20gbmF2aWdhdGlvbikgYW5kIGFsbFxuXHRcdC8vIHRhYmxlcyB3aXRoIHNhbWUgZW50aXR5U2V0IGdldHMgc2FtZSBhZ2dyZWFndGUgY29uZmlndXJhdGlvbiB0aGF0J3Mgd2h5IHdlIGNhbiB1c2UgZmlyc3QgdGFibGUgaW50b1xuXHRcdC8vIExSIHRvIGdldCBhZ2dyZWdhdGVzICh3aXRob3V0IGN1cnJlbmN5L3VuaXQgcHJvcGVydGllcyBzaW5jZSB3ZSBleHBlY3QgdG8gYmUgYWJsZSB0byBmaWx0ZXIgdGhlbSkuXG5cdFx0Y29uc3QgYWdncmVnYXRlcyA9IGxyVGFibGVzWzBdLmFnZ3JlZ2F0ZXM7XG5cdFx0aWYgKGFnZ3JlZ2F0ZXMpIHtcblx0XHRcdGNvbnN0IGFnZ3JlZ2F0YWJsZVByb3BlcnRpZXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMoYWdncmVnYXRlcykubWFwKChhZ2dyZWdhdGVLZXkpID0+IGFnZ3JlZ2F0ZXNbYWdncmVnYXRlS2V5XS5yZWxhdGl2ZVBhdGgpO1xuXHRcdFx0YWxsRmlsdGVycyA9IGFsbEZpbHRlcnMuZmlsdGVyKChmaWx0ZXJGaWVsZCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYWdncmVnYXRhYmxlUHJvcGVydGllcy5pbmRleE9mKGZpbHRlckZpZWxkLmtleSkgPT09IC0xO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzID0gaW5zZXJ0Q3VzdG9tTWFuaWZlc3RFbGVtZW50cyhhbGxGaWx0ZXJzLCBlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHQvLyBBZGQgY2FzZVNlbnNpdGl2ZSBwcm9wZXJ0eSB0byBhbGwgc2VsZWN0aW9uIGZpZWxkcy5cblx0Y29uc3QgaXNDYXNlU2Vuc2l0aXZlID0gaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlKGNvbnZlcnRlckNvbnRleHQpO1xuXHRzZWxlY3Rpb25GaWVsZHMuZm9yRWFjaCgoZmlsdGVyRmllbGQpID0+IHtcblx0XHRmaWx0ZXJGaWVsZC5jYXNlU2Vuc2l0aXZlID0gaXNDYXNlU2Vuc2l0aXZlO1xuXHR9KTtcblxuXHRyZXR1cm4geyBzZWxlY3Rpb25GaWVsZHMsIHNQcm9wZXJ0eUluZm8gfTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBmaWx0ZXIgYmFyIGluc2lkZSBhIHZhbHVlIGhlbHAgZGlhbG9nIHNob3VsZCBiZSBleHBhbmRlZC4gVGhpcyBpcyB0cnVlIGlmIG9uZSBvZiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgaG9sZDpcbiAqICgxKSBhIGZpbHRlciBwcm9wZXJ0eSBpcyBtYW5kYXRvcnksXG4gKiAoMikgbm8gc2VhcmNoIGZpZWxkIGV4aXN0cyAoZW50aXR5IGlzbid0IHNlYXJjaCBlbmFibGVkKSxcbiAqICgzKSB3aGVuIHRoZSBkYXRhIGlzbid0IGxvYWRlZCBieSBkZWZhdWx0IChhbm5vdGF0aW9uIEZldGNoVmFsdWVzID0gMikuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiBUaGUgRmlsdGVyUmVzdHJpY3Rpb24gYW5ub3RhdGlvblxuICogQHBhcmFtIHZhbHVlTGlzdCBUaGUgVmFsdWVMaXN0IGFubm90YXRpb25cbiAqIEByZXR1cm5zIFRoZSB2YWx1ZSBmb3IgZXhwYW5kRmlsdGVyRmllbGRzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeHBhbmRGaWx0ZXJGaWVsZHMgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb246IEZpbHRlclJlc3RyaWN0aW9ucyB8IHVuZGVmaW5lZCxcblx0dmFsdWVMaXN0OiBhbnlcbik6IGJvb2xlYW4ge1xuXHRjb25zdCByZXF1aXJlZFByb3BlcnRpZXMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMoZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiwgXCJSZXF1aXJlZFByb3BlcnRpZXNcIik7XG5cdGNvbnN0IHNlYXJjaFJlc3RyaWN0aW9ucyA9IGdldFNlYXJjaFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgaGlkZUJhc2ljU2VhcmNoID0gQm9vbGVhbihzZWFyY2hSZXN0cmljdGlvbnMgJiYgIXNlYXJjaFJlc3RyaWN0aW9ucy5TZWFyY2hhYmxlKTtcblx0aWYgKHJlcXVpcmVkUHJvcGVydGllcy5sZW5ndGggPiAwIHx8IGhpZGVCYXNpY1NlYXJjaCB8fCB2YWx1ZUxpc3Q/LkZldGNoVmFsdWVzID09PSAyKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BNEVLQSxlQUFlO0VBQUEsV0FBZkEsZUFBZTtJQUFmQSxlQUFlO0lBQWZBLGVBQWU7RUFBQSxHQUFmQSxlQUFlLEtBQWZBLGVBQWU7RUFLcEIsTUFBTUMsVUFBVSxHQUFHLFlBQVk7RUFDL0IsTUFBTUMsZUFBZSxHQUFHLGdDQUFnQztFQUl4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQyx5QkFBeUIsQ0FBQ0MsVUFBc0IsRUFBK0I7SUFDdkYsTUFBTUMsY0FBMkMsR0FBRyxDQUFDLENBQUM7SUFDdERELFVBQVUsQ0FBQ0UsSUFBSSxDQUFDQyxPQUFPLENBQUVDLFNBQWlDLElBQUs7TUFDOUQsSUFBSUEsU0FBUyxDQUFDQyxLQUFLLEtBQUssc0NBQXNDLEVBQUU7UUFBQTtRQUMvREosY0FBYyxDQUFDRyxTQUFTLENBQUNFLEtBQUssQ0FBQ0MsSUFBSSxDQUFDLEdBQUc7VUFDdENDLEtBQUssRUFBRVIsVUFBVSxDQUFDUyxrQkFBa0I7VUFDcENDLFVBQVUs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
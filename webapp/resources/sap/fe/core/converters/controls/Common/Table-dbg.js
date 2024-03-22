/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/formatters/TableFormatter", "sap/fe/core/formatters/TableFormatterTypes", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/EntitySetHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/internal/helpers/ActionHelper", "sap/ui/core/Core", "../../helpers/Aggregation", "../../helpers/DataFieldHelper", "../../helpers/ID", "../../ManifestSettings", "./Criticality", "./table/StandardActions", "sap/base/Log"], function (DataField, Action, BindingHelper, ConfigurableObject, IssueManager, Key, tableFormatters, TableFormatterTypes, BindingToolkit, ModelHelper, StableIdHelper, TypeGuards, DataModelPathHelper, DisplayModeFormatter, EntitySetHelper, PropertyHelper, UIFormatters, ActionHelper, Core, Aggregation, DataFieldHelper, ID, ManifestSettings, Criticality, StandardActions, Log) {
  "use strict";

  var _exports = {};
  var isInDisplayMode = StandardActions.isInDisplayMode;
  var isDraftOrStickySupported = StandardActions.isDraftOrStickySupported;
  var getStandardActionPaste = StandardActions.getStandardActionPaste;
  var getStandardActionMassEdit = StandardActions.getStandardActionMassEdit;
  var getStandardActionInsights = StandardActions.getStandardActionInsights;
  var getStandardActionDelete = StandardActions.getStandardActionDelete;
  var getStandardActionCreate = StandardActions.getStandardActionCreate;
  var getRestrictions = StandardActions.getRestrictions;
  var getMassEditVisibility = StandardActions.getMassEditVisibility;
  var getInsertUpdateActionsTemplating = StandardActions.getInsertUpdateActionsTemplating;
  var getDeleteVisibility = StandardActions.getDeleteVisibility;
  var getCreationRow = StandardActions.getCreationRow;
  var generateStandardActionsContext = StandardActions.generateStandardActionsContext;
  var getMessageTypeFromCriticalityType = Criticality.getMessageTypeFromCriticalityType;
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var SelectionMode = ManifestSettings.SelectionMode;
  var Importance = ManifestSettings.Importance;
  var HorizontalAlign = ManifestSettings.HorizontalAlign;
  var CreationMode = ManifestSettings.CreationMode;
  var ActionType = ManifestSettings.ActionType;
  var getTableID = ID.getTableID;
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var AggregationHelper = Aggregation.AggregationHelper;
  var isMultiValueField = UIFormatters.isMultiValueField;
  var isImageURL = PropertyHelper.isImageURL;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var getNonSortablePropertiesRestrictions = EntitySetHelper.getNonSortablePropertiesRestrictions;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var isPathUpdatable = DataModelPathHelper.isPathUpdatable;
  var isPathSearchable = DataModelPathHelper.isPathSearchable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isTypeDefinition = TypeGuards.isTypeDefinition;
  var isProperty = TypeGuards.isProperty;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isNavigationProperty = TypeGuards.isNavigationProperty;
  var isAnnotationOfType = TypeGuards.isAnnotationOfType;
  var replaceSpecialChars = StableIdHelper.replaceSpecialChars;
  var generate = StableIdHelper.generate;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var EDM_TYPE_MAPPING = BindingToolkit.EDM_TYPE_MAPPING;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var MessageType = TableFormatterTypes.MessageType;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategoryType = IssueManager.IssueCategoryType;
  var IssueCategory = IssueManager.IssueCategory;
  var Placement = ConfigurableObject.Placement;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var getEnabledForAnnotationAction = Action.getEnabledForAnnotationAction;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var isActionNavigable = Action.isActionNavigable;
  var getCopyAction = Action.getCopyAction;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var dataFieldIsCopyAction = Action.dataFieldIsCopyAction;
  var isDataPointFromDataFieldDefault = DataField.isDataPointFromDataFieldDefault;
  var isDataFieldTypes = DataField.isDataFieldTypes;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  var getTargetValueOnDataPoint = DataField.getTargetValueOnDataPoint;
  var getSemanticObjectPath = DataField.getSemanticObjectPath;
  var getDataFieldDataType = DataField.getDataFieldDataType;
  var collectRelatedPropertiesRecursively = DataField.collectRelatedPropertiesRecursively;
  var collectRelatedProperties = DataField.collectRelatedProperties;
  var ColumnType; // Custom Column from Manifest
  (function (ColumnType) {
    ColumnType["Default"] = "Default";
    ColumnType["Annotation"] = "Annotation";
    ColumnType["Slot"] = "Slot";
  })(ColumnType || (ColumnType = {}));
  /**
   * Returns an array of all annotation-based and manifest-based table actions.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @param navigationSettings
   * @returns The complete table actions
   */
  function getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings) {
    const aTableActions = getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext);
    const aAnnotationActions = aTableActions.tableActions;
    const aHiddenActions = aTableActions.hiddenTableActions;
    const manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, aAnnotationActions, navigationSettings, true, aHiddenActions);
    const actionOverwriteConfig = {
      isNavigable: OverrideType.overwrite,
      enableOnSelect: OverrideType.overwrite,
      enableAutoScroll: OverrideType.overwrite,
      enabled: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      defaultValuesExtensionFunction: OverrideType.overwrite,
      command: OverrideType.overwrite
    };
    const actions = insertCustomElements(aAnnotationActions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions,
      commandActions: manifestActions.commandActions
    };
  }

  /**
   * Returns an array of all columns, annotation-based as well as manifest based.
   * They are sorted and some properties can be overwritten via the manifest (check out the keys that can be overwritten).
   *
   * @param lineItemAnnotation Collection of data fields for representation in a table or list
   * @param visualizationPath
   * @param converterContext
   * @param navigationSettings
   * @param isInsightsEnabled
   * @returns Returns all table columns that should be available, regardless of templating or personalization or their origin
   */
  _exports.getTableActions = getTableActions;
  function getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings, isInsightsEnabled) {
    const annotationColumns = getColumnsFromAnnotations(lineItemAnnotation, visualizationPath, converterContext, isInsightsEnabled);
    const manifestColumns = getColumnsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).columns, annotationColumns, converterContext, converterContext.getAnnotationEntityType(lineItemAnnotation), navigationSettings);
    return insertCustomElements(annotationColumns, manifestColumns, {
      width: OverrideType.overwrite,
      importance: OverrideType.overwrite,
      horizontalAlign: OverrideType.overwrite,
      availability: OverrideType.overwrite,
      isNavigable: OverrideType.overwrite,
      settings: OverrideType.overwrite,
      formatOptions: OverrideType.overwrite
    });
  }

  /**
   * Retrieve the custom aggregation definitions from the entityType.
   *
   * @param entityType The target entity type.
   * @param tableColumns The array of columns for the entity type.
   * @param converterContext The converter context.
   * @returns The aggregate definitions from the entityType, or undefined if the entity doesn't support analytical queries.
   */
  _exports.getTableColumns = getTableColumns;
  const getAggregateDefinitionsFromEntityType = function (entityType, tableColumns, converterContext) {
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    function findColumnFromPath(path) {
      return tableColumns.find(column => {
        const annotationColumn = column;
        return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
      });
    }
    if (!aggregationHelper.isAnalyticsSupported()) {
      return undefined;
    }

    // Keep a set of all currency/unit properties, as we don't want to consider them as aggregates
    // They are aggregates for technical reasons (to manage multi-units situations) but it doesn't make sense from a user standpoint
    const currencyOrUnitProperties = new Set();
    tableColumns.forEach(column => {
      const tableColumn = column;
      if (tableColumn.unit) {
        currencyOrUnitProperties.add(tableColumn.unit);
      }
    });
    const customAggregateAnnotations = aggregationHelper.getCustomAggregateDefinitions();
    const definitions = {};
    customAggregateAnnotations.forEach(annotation => {
      const aggregatedProperty = aggregationHelper._entityType.entityProperties.find(property => {
        return property.name === annotation.qualifier;
      });
      if (aggregatedProperty) {
        var _annotation$annotatio, _annotation$annotatio2;
        const contextDefiningProperties = (_annotation$annotatio = annotation.annotations) === null || _annotation$annotatio === void 0 ? void 0 : (_annotation$annotatio2 = _annotation$annotatio.Aggregation) === null || _annotation$annotatio2 === void 0 ? void 0 : _annotation$annotatio2.ContextDefiningProperties;
        definitions[aggregatedProperty.name] = contextDefiningProperties ? contextDefiningProperties.map(ctxDefProperty => {
          return ctxDefProperty.value;
        }) : [];
      }
    });
    const result = {};
    tableColumns.forEach(column => {
      const tableColumn = column;
      if (tableColumn.propertyInfos === undefined && tableColumn.relativePath) {
        const rawContextDefiningProperties = definitions[tableColumn.relativePath];

        // Ignore aggregates corresponding to currencies or units of measure
        if (rawContextDefiningProperties && !currencyOrUnitProperties.has(tableColumn.name)) {
          result[tableColumn.name] = {
            defaultAggregate: {},
            relativePath: tableColumn.relativePath
          };
          const contextDefiningProperties = [];
          rawContextDefiningProperties.forEach(contextDefiningPropertyName => {
            const foundColumn = findColumnFromPath(contextDefiningPropertyName);
            if (foundColumn) {
              contextDefiningProperties.push(foundColumn.name);
            }
          });
          if (contextDefiningProperties.length) {
            result[tableColumn.name].defaultAggregate.contextDefiningProperties = contextDefiningProperties;
          }
        }
      }
    });
    return result;
  };

  /**
   * Updates a table visualization for analytical use cases.
   *
   * @param tableVisualization The visualization to be updated
   * @param entityType The entity type displayed in the table
   * @param converterContext The converter context
   * @param presentationVariantAnnotation The presentationVariant annotation (if any)
   */
  _exports.getAggregateDefinitionsFromEntityType = getAggregateDefinitionsFromEntityType;
  function updateTableVisualizationForType(tableVisualization, entityType, converterContext, presentationVariantAnnotation) {
    if (tableVisualization.control.type === "AnalyticalTable") {
      const aggregatesDefinitions = getAggregateDefinitionsFromEntityType(entityType, tableVisualization.columns, converterContext),
        aggregationHelper = new AggregationHelper(entityType, converterContext);
      if (aggregatesDefinitions) {
        tableVisualization.enableAnalytics = true;
        tableVisualization.enable$select = false;
        tableVisualization.enable$$getKeepAliveContext = false;
        tableVisualization.aggregates = aggregatesDefinitions;
        _updatePropertyInfosWithAggregatesDefinitions(tableVisualization);
        const allowedTransformations = aggregationHelper.getAllowedTransformations();
        tableVisualization.enableBasicSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;

        // Add group and sort conditions from the presentation variant
        tableVisualization.annotation.groupConditions = getGroupConditions(presentationVariantAnnotation, tableVisualization.columns, tableVisualization.control.type);
        tableVisualization.annotation.aggregateConditions = getAggregateConditions(presentationVariantAnnotation, tableVisualization.columns);
      }
      tableVisualization.control.type = "GridTable"; // AnalyticalTable isn't a real type for the MDC:Table, so we always switch back to Grid
    } else if (tableVisualization.control.type === "ResponsiveTable") {
      tableVisualization.annotation.groupConditions = getGroupConditions(presentationVariantAnnotation, tableVisualization.columns, tableVisualization.control.type);
    } else if (tableVisualization.control.type === "TreeTable") {
      const aggregationHelper = new AggregationHelper(entityType, converterContext);
      const allowedTransformations = aggregationHelper.getAllowedTransformations();
      tableVisualization.enableBasicSearch = allowedTransformations ? allowedTransformations.includes("search") : true;
      tableVisualization.enable$$getKeepAliveContext = true;
    }
  }

  /**
   * Get the navigation target path from manifest settings.
   *
   * @param converterContext The converter context
   * @param navigationPropertyPath The navigation path to check in the manifest settings
   * @returns Navigation path from manifest settings
   */
  _exports.updateTableVisualizationForType = updateTableVisualizationForType;
  function getNavigationTargetPath(converterContext, navigationPropertyPath) {
    const manifestWrapper = converterContext.getManifestWrapper();
    if (navigationPropertyPath && manifestWrapper.getNavigationConfiguration(navigationPropertyPath)) {
      const navConfig = manifestWrapper.getNavigationConfiguration(navigationPropertyPath);
      if (Object.keys(navConfig).length > 0) {
        return navigationPropertyPath;
      }
    }
    const dataModelPath = converterContext.getDataModelObjectPath();
    const contextPath = converterContext.getContextPath();
    const navConfigForContextPath = manifestWrapper.getNavigationConfiguration(contextPath);
    if (navConfigForContextPath && Object.keys(navConfigForContextPath).length > 0) {
      return contextPath;
    }
    return dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
  }

  /**
   * Sets the 'unit' and 'textArrangement' properties in columns when necessary.
   *
   * @param entityType The entity type displayed in the table
   * @param tableColumns The columns to be updated
   */
  function updateLinkedProperties(entityType, tableColumns) {
    function findColumnByPath(path) {
      return tableColumns.find(column => {
        const annotationColumn = column;
        return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
      });
    }
    tableColumns.forEach(oColumn => {
      const oTableColumn = oColumn;
      if (oTableColumn.propertyInfos === undefined && oTableColumn.relativePath) {
        const oProperty = entityType.entityProperties.find(oProp => oProp.name === oTableColumn.relativePath);
        if (oProperty) {
          var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation7;
          const oUnit = getAssociatedCurrencyProperty(oProperty) || getAssociatedUnitProperty(oProperty);
          const oTimezone = getAssociatedTimezoneProperty(oProperty);
          const sTimezone = oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation = oProperty.annotations) === null || _oProperty$annotation === void 0 ? void 0 : (_oProperty$annotation2 = _oProperty$annotation.Common) === null || _oProperty$annotation2 === void 0 ? void 0 : _oProperty$annotation2.Timezone;
          if (oUnit) {
            const oUnitColumn = findColumnByPath(oUnit.name);
            oTableColumn.unit = oUnitColumn === null || oUnitColumn === void 0 ? void 0 : oUnitColumn.name;
          } else {
            var _oProperty$annotation3, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6;
            const sUnit = (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation3 = oProperty.annotations) === null || _oProperty$annotation3 === void 0 ? void 0 : (_oProperty$annotation4 = _oProperty$annotation3.Measures) === null || _oProperty$annotation4 === void 0 ? void 0 : _oProperty$annotation4.ISOCurrency) || (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation5 = oProperty.annotations) === null || _oProperty$annotation5 === void 0 ? void 0 : (_oProperty$annotation6 = _oProperty$annotation5.Measures) === null || _oProperty$annotation6 === void 0 ? void 0 : _oProperty$annotation6.Unit);
            if (sUnit) {
              oTableColumn.unitText = `${sUnit}`;
            }
          }
          if (oTimezone) {
            const oTimezoneColumn = findColumnByPath(oTimezone.name);
            oTableColumn.timezone = oTimezoneColumn === null || oTimezoneColumn === void 0 ? void 0 : oTimezoneColumn.name;
          } else if (sTimezone) {
            oTableColumn.timezoneText = sTimezone.toString();
          }
          const displayMode = getDisplayMode(oProperty),
            textAnnotation = (_oProperty$annotation7 = oProperty.annotations.Common) === null || _oProperty$annotation7 === void 0 ? void 0 : _oProperty$annotation7.Text;
          if (isPathAnnotationExpression(textAnnotation) && displayMode !== "Value") {
            const oTextColumn = findColumnByPath(textAnnotation.path);
            if (oTextColumn && oTextColumn.name !== oTableColumn.name) {
              oTableColumn.textArrangement = {
                textProperty: oTextColumn.name,
                mode: displayMode
              };
            }
          }
        }
      }
    });
  }
  _exports.updateLinkedProperties = updateLinkedProperties;
  function getSemanticKeysAndTitleInfo(converterContext) {
    var _converterContext$get, _converterContext$get2, _converterContext$get3, _converterContext$get4, _converterContext$get5, _converterContext$get6, _converterContext$get7, _converterContext$get8, _converterContext$get9, _converterContext$get10, _converterContext$get11, _converterContext$get12, _converterContext$get13;
    const headerInfoTitlePath = (_converterContext$get = converterContext.getAnnotationEntityType()) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.annotations) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.UI) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.HeaderInfo) === null || _converterContext$get4 === void 0 ? void 0 : (_converterContext$get5 = _converterContext$get4.Title) === null || _converterContext$get5 === void 0 ? void 0 : (_converterContext$get6 = _converterContext$get5.Value) === null || _converterContext$get6 === void 0 ? void 0 : _converterContext$get6.path;
    const semanticKeyAnnotations = (_converterContext$get7 = converterContext.getAnnotationEntityType()) === null || _converterContext$get7 === void 0 ? void 0 : (_converterContext$get8 = _converterContext$get7.annotations) === null || _converterContext$get8 === void 0 ? void 0 : (_converterContext$get9 = _converterContext$get8.Common) === null || _converterContext$get9 === void 0 ? void 0 : _converterContext$get9.SemanticKey;
    const headerInfoTypeName = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get10 = converterContext.getAnnotationEntityType()) === null || _converterContext$get10 === void 0 ? void 0 : (_converterContext$get11 = _converterContext$get10.annotations) === null || _converterContext$get11 === void 0 ? void 0 : (_converterContext$get12 = _converterContext$get11.UI) === null || _converterContext$get12 === void 0 ? void 0 : (_converterContext$get13 = _converterContext$get12.HeaderInfo) === null || _converterContext$get13 === void 0 ? void 0 : _converterContext$get13.TypeName;
    const semanticKeyColumns = [];
    if (semanticKeyAnnotations) {
      semanticKeyAnnotations.forEach(function (oColumn) {
        semanticKeyColumns.push(oColumn.value);
      });
    }
    return {
      headerInfoTitlePath,
      semanticKeyColumns,
      headerInfoTypeName
    };
  }
  function createTableVisualization(lineItemAnnotation, visualizationPath, converterContext, presentationVariantAnnotation, isCondensedTableLayoutCompliant, viewConfiguration, isInsightsEnabled) {
    const tableManifestConfig = getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext, isCondensedTableLayoutCompliant);
    const {
      navigationPropertyPath
    } = splitPath(visualizationPath);
    const navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
    const navigationSettings = converterContext.getManifestWrapper().getNavigationConfiguration(navigationTargetPath);
    const columns = getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings, isInsightsEnabled);
    const operationAvailableMap = getOperationAvailableMap(lineItemAnnotation, converterContext);
    const semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
    const tableActions = getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings);
    const oVisualization = {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfig, columns, presentationVariantAnnotation, viewConfiguration, isInsightsEnabled),
      control: tableManifestConfig,
      actions: removeDuplicateActions(tableActions.actions),
      commandActions: tableActions.commandActions,
      columns: columns,
      operationAvailableMap: JSON.stringify(operationAvailableMap),
      operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
      headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
      semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
      headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName,
      enable$select: true,
      enable$$getKeepAliveContext: true
    };
    updateLinkedProperties(converterContext.getAnnotationEntityType(lineItemAnnotation), columns);
    updateTableVisualizationForType(oVisualization, converterContext.getAnnotationEntityType(lineItemAnnotation), converterContext, presentationVariantAnnotation);
    return oVisualization;
  }
  _exports.createTableVisualization = createTableVisualization;
  function createDefaultTableVisualization(converterContext, isBlankTable) {
    const tableManifestConfig = getTableManifestConfiguration(undefined, "", converterContext, false);
    const columns = getColumnsFromEntityType({}, converterContext.getEntityType(), [], [], converterContext, tableManifestConfig.type, []);
    const operationAvailableMap = getOperationAvailableMap(undefined, converterContext);
    const semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
    const oVisualization = {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(undefined, "", converterContext, tableManifestConfig, isBlankTable ? [] : columns),
      control: tableManifestConfig,
      actions: [],
      columns: columns,
      operationAvailableMap: JSON.stringify(operationAvailableMap),
      operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
      headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
      semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
      headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName,
      enable$select: true,
      enable$$getKeepAliveContext: true
    };
    updateLinkedProperties(converterContext.getEntityType(), columns);
    updateTableVisualizationForType(oVisualization, converterContext.getEntityType(), converterContext);
    return oVisualization;
  }

  /**
   * Gets the map of Core.OperationAvailable property paths for all DataFieldForActions.
   *
   * @param lineItemAnnotation The instance of the line item
   * @param converterContext The instance of the converter context
   * @returns The record containing all action names and their corresponding Core.OperationAvailable property paths
   */
  _exports.createDefaultTableVisualization = createDefaultTableVisualization;
  function getOperationAvailableMap(lineItemAnnotation, converterContext) {
    return ActionHelper.getOperationAvailableMap(lineItemAnnotation, "table", converterContext);
  }

  /**
   * Gets updatable propertyPath for the current entityset if valid.
   *
   * @param converterContext The instance of the converter context
   * @returns The updatable property for the rows
   */
  function getCurrentEntitySetUpdatablePath(converterContext) {
    var _entitySet$annotation, _entitySet$annotation2;
    const restrictions = getRestrictions(converterContext);
    const entitySet = converterContext.getEntitySet();
    const updatable = restrictions.isUpdatable;
    const isOnlyDynamicOnCurrentEntity = !isConstant(updatable.expression) && updatable.navigationExpression._type === "Unresolvable";
    const updatableExpression = entitySet === null || entitySet === void 0 ? void 0 : (_entitySet$annotation = entitySet.annotations.Capabilities) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.UpdateRestrictions) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.Updatable;
    const updatablePropertyPath = isPathAnnotationExpression(updatableExpression) && updatableExpression.path;
    return isOnlyDynamicOnCurrentEntity ? updatablePropertyPath : "";
  }

  /**
   * Method to retrieve all property paths assigned to the Core.OperationAvailable annotation.
   *
   * @param operationAvailableMap The record consisting of actions and their Core.OperationAvailable property paths
   * @param converterContext The instance of the converter context
   * @returns The CSV string of all property paths associated with the Core.OperationAvailable annotation
   */
  function getOperationAvailableProperties(operationAvailableMap, converterContext) {
    const properties = new Set();
    for (const actionName in operationAvailableMap) {
      const propertyName = operationAvailableMap[actionName];
      if (propertyName === null) {
        // Annotation configured with explicit 'null' (action advertisement relevant)
        properties.add(actionName);
      } else if (typeof propertyName === "string") {
        // Add property paths and not Constant values.
        properties.add(propertyName);
      }
    }
    if (properties.size) {
      var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3, _entityType$annotatio4, _entityType$annotatio5;
      // Some actions have an operation available based on property --> we need to load the HeaderInfo.Title property
      // so that the dialog on partial actions is displayed properly (BCP 2180271425)
      const entityType = converterContext.getEntityType();
      const titleProperty = (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.HeaderInfo) === null || _entityType$annotatio3 === void 0 ? void 0 : (_entityType$annotatio4 = _entityType$annotatio3.Title) === null || _entityType$annotatio4 === void 0 ? void 0 : (_entityType$annotatio5 = _entityType$annotatio4.Value) === null || _entityType$annotatio5 === void 0 ? void 0 : _entityType$annotatio5.path;
      if (titleProperty) {
        properties.add(titleProperty);
      }
    }
    return Array.from(properties).join(",");
  }

  /**
   * Iterates over the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and
   * returns all the UI.Hidden annotation expressions.
   *
   * @param lineItemAnnotation Collection of data fields used for representation in a table or list
   * @param currentEntityType Current entity type
   * @param contextDataModelObjectPath Object path of the data model
   * @param isEntitySet
   * @returns All the `UI.Hidden` path expressions found in the relevant actions
   */
  function getUIHiddenExpForActionsRequiringContext(lineItemAnnotation, currentEntityType, contextDataModelObjectPath, isEntitySet) {
    const aUiHiddenPathExpressions = [];
    lineItemAnnotation.forEach(dataField => {
      var _dataField$ActionTarg, _dataField$Inline;
      // Check if the lineItem context is the same as that of the action:
      if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && dataField !== null && dataField !== void 0 && (_dataField$ActionTarg = dataField.ActionTarget) !== null && _dataField$ActionTarg !== void 0 && _dataField$ActionTarg.isBound && currentEntityType === (dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget.sourceEntityType) || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && dataField.RequiresContext && (dataField === null || dataField === void 0 ? void 0 : (_dataField$Inline = dataField.Inline) === null || _dataField$Inline === void 0 ? void 0 : _dataField$Inline.valueOf()) !== true) {
        var _dataField$annotation, _dataField$annotation2, _dataField$annotation3;
        if (typeof ((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === "object") {
          aUiHiddenPathExpressions.push(equal(getBindingExpFromContext(dataField, contextDataModelObjectPath, isEntitySet), false));
        }
      }
    });
    return aUiHiddenPathExpressions;
  }

  /**
   * This method is used to change the context currently referenced by this binding by removing the last navigation property.
   *
   * It is used (specifically in this case), to transform a binding made for a NavProp context /MainObject/NavProp1/NavProp2,
   * into a binding on the previous context /MainObject/NavProp1.
   *
   * @param source DataFieldForAction | DataFieldForIntentBasedNavigation | CustomAction
   * @param contextDataModelObjectPath DataModelObjectPath
   * @param isEntitySet
   * @returns The binding expression
   */
  function getBindingExpFromContext(source, contextDataModelObjectPath, isEntitySet) {
    let sExpression;
    if ((source === null || source === void 0 ? void 0 : source.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAction" || (source === null || source === void 0 ? void 0 : source.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
      var _annotations, _annotations$UI;
      sExpression = source === null || source === void 0 ? void 0 : (_annotations = source.annotations) === null || _annotations === void 0 ? void 0 : (_annotations$UI = _annotations.UI) === null || _annotations$UI === void 0 ? void 0 : _annotations$UI.Hidden;
    } else {
      sExpression = source === null || source === void 0 ? void 0 : source.visible;
    }
    let sPath;
    if (isPathAnnotationExpression(sExpression)) {
      sPath = sExpression.path;
    } else {
      sPath = sExpression;
    }
    if (sPath) {
      if (source !== null && source !== void 0 && source.visible) {
        sPath = sPath.substring(1, sPath.length - 1);
      }
      if (sPath.indexOf("/") > 0) {
        //check if the navigation property is correct:
        const aSplitPath = sPath.split("/");
        const sNavigationPath = aSplitPath[0];
        if (isNavigationProperty(contextDataModelObjectPath === null || contextDataModelObjectPath === void 0 ? void 0 : contextDataModelObjectPath.targetObject) && contextDataModelObjectPath.targetObject.partner === sNavigationPath) {
          return pathInModel(aSplitPath.slice(1).join("/"));
        } else {
          return constant(true);
        }
        // In case there is no navigation property, if it's an entitySet, the expression binding has to be returned:
      } else if (isEntitySet) {
        return pathInModel(sPath);
        // otherwise the expression binding cannot be taken into account for the selection mode evaluation:
      } else {
        return constant(true);
      }
    }
    return constant(true);
  }

  /**
   * Loop through the manifest actions and check the following:
   *
   * If the data field is also referenced as a custom action.
   * If the underlying manifest action is either a bound action or has the 'RequiresContext' property set to true.
   *
   * If so, the 'requiresSelection' property is forced to 'true' in the manifest.
   *
   * @param dataFieldId Id of the DataField evaluated
   * @param dataField DataField evaluated
   * @param manifestActions The actions defined in the manifest
   * @returns `true` if the DataField is found among the manifest actions
   */
  function updateManifestActionAndTagIt(dataFieldId, dataField, manifestActions) {
    return Object.keys(manifestActions).some(actionKey => {
      if (actionKey === dataFieldId) {
        var _ActionTarget;
        if (dataField !== null && dataField !== void 0 && (_ActionTarget = dataField.ActionTarget) !== null && _ActionTarget !== void 0 && _ActionTarget.isBound || dataField !== null && dataField !== void 0 && dataField.RequiresContext) {
          manifestActions[dataFieldId].requiresSelection = true;
        }
        return true;
      }
      return false;
    });
  }

  /**
   * Loop through the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and
   * check the following:
   * If at least one of them is always visible in the table toolbar and requires a context
   * If an action is also defined in the manifest, it is set aside and will be considered
   * when going through the manifest.
   *
   * @param lineItemAnnotation Collection of data fields for representation in a table or list
   * @param manifestActions The actions defined in the manifest
   * @param currentEntityType Current Entity Type
   * @returns `true` if there is at least 1 action that meets the criteria
   */
  function hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation, manifestActions, currentEntityType) {
    return lineItemAnnotation.some(dataField => {
      var _dataField$Inline2, _dataField$annotation4, _dataField$annotation5, _dataField$annotation6, _dataField$annotation7, _dataField$annotation8, _dataField$annotation9;
      if ((dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") && (dataField === null || dataField === void 0 ? void 0 : (_dataField$Inline2 = dataField.Inline) === null || _dataField$Inline2 === void 0 ? void 0 : _dataField$Inline2.valueOf()) !== true && (((_dataField$annotation4 = dataField.annotations) === null || _dataField$annotation4 === void 0 ? void 0 : (_dataField$annotation5 = _dataField$annotation4.UI) === null || _dataField$annotation5 === void 0 ? void 0 : (_dataField$annotation6 = _dataField$annotation5.Hidden) === null || _dataField$annotation6 === void 0 ? void 0 : _dataField$annotation6.valueOf()) === false || ((_dataField$annotation7 = dataField.annotations) === null || _dataField$annotation7 === void 0 ? void 0 : (_dataField$annotation8 = _dataField$annotation7.UI) === null || _dataField$annotation8 === void 0 ? void 0 : (_dataField$annotation9 = _dataField$annotation8.Hidden) === null || _dataField$annotation9 === void 0 ? void 0 : _dataField$annotation9.valueOf()) === undefined)) {
        if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
          var _dataField$ActionTarg2;
          const manifestActionId = generate(["DataFieldForAction", dataField.Action]);
          // if the DataFieldForActon from annotation also exists in the manifest, its visibility will be evaluated later on
          if (updateManifestActionAndTagIt(manifestActionId, dataField, manifestActions)) {
            return false;
          }
          // Check if the lineItem context is the same as that of the action:
          return (dataField === null || dataField === void 0 ? void 0 : (_dataField$ActionTarg2 = dataField.ActionTarget) === null || _dataField$ActionTarg2 === void 0 ? void 0 : _dataField$ActionTarg2.isBound) && currentEntityType === (dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget.sourceEntityType);
        } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
          // if the DataFieldForIntentBasedNavigation from annotation also exists in the manifest, its visibility will be evaluated later on
          if (updateManifestActionAndTagIt(`DataFieldForIntentBasedNavigation::${dataField.SemanticObject}::${dataField.Action}`, dataField, manifestActions)) {
            return false;
          }
          return dataField.RequiresContext;
        }
      }
      return false;
    });
  }
  function hasCustomActionsAlwaysVisibleInToolBar(manifestActions) {
    return Object.keys(manifestActions).some(actionKey => {
      var _action$visible;
      const action = manifestActions[actionKey];
      if (action.requiresSelection && ((_action$visible = action.visible) === null || _action$visible === void 0 ? void 0 : _action$visible.toString()) === "true") {
        return true;
      }
      return false;
    });
  }

  /**
   * Iterates over the custom actions (with key requiresSelection) declared in the manifest for the current line item and returns all the
   * visible key values as an expression.
   *
   * @param manifestActions The actions defined in the manifest
   * @returns Array<Expression<boolean>> All the visible path expressions of the actions that meet the criteria
   */
  function getVisibleExpForCustomActionsRequiringContext(manifestActions) {
    const aVisiblePathExpressions = [];
    if (manifestActions) {
      Object.keys(manifestActions).forEach(actionKey => {
        const action = manifestActions[actionKey];
        if (action.requiresSelection === true && action.visible !== undefined) {
          if (typeof action.visible === "string") {
            var _action$visible2;
            /*The final aim would be to check if the path expression depends on the parent context
            and considers only those expressions for the expression evaluation,
            but currently not possible from the manifest as the visible key is bound on the parent entity.
            Tricky to differentiate the path as it's done for the Hidden annotation.
            For the time being we consider all the paths of the manifest*/

            aVisiblePathExpressions.push(resolveBindingString(action === null || action === void 0 ? void 0 : (_action$visible2 = action.visible) === null || _action$visible2 === void 0 ? void 0 : _action$visible2.valueOf()));
          }
        }
      });
    }
    return aVisiblePathExpressions;
  }

  /**
   * Evaluate if the path is statically deletable or updatable.
   *
   * @param converterContext
   * @returns The table capabilities
   */
  function getCapabilityRestriction(converterContext) {
    const isDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
    const isUpdatable = isPathUpdatable(converterContext.getDataModelObjectPath());
    return {
      isDeletable: !(isConstant(isDeletable) && isDeletable.value === false),
      isUpdatable: !(isConstant(isUpdatable) && isUpdatable.value === false)
    };
  }
  _exports.getCapabilityRestriction = getCapabilityRestriction;
  function getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, isEntitySet, targetCapabilities, deleteButtonVisibilityExpression) {
    var _tableManifestSetting;
    let massEditVisibilityExpression = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : constant(false);
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    let selectionMode = (_tableManifestSetting = tableManifestSettings.tableSettings) === null || _tableManifestSetting === void 0 ? void 0 : _tableManifestSetting.selectionMode;
    // If the selection mode is forced to 'None' in the manifest/macro table parameters, we ignore the rest of the logic and keep it as specified
    if (!lineItemAnnotation || selectionMode === SelectionMode.None) {
      return SelectionMode.None;
    }
    let aHiddenBindingExpressions = [],
      aVisibleBindingExpressions = [];
    const manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, [], undefined, false);
    let isParentDeletable, parentEntitySetDeletable;
    if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
      isParentDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
      parentEntitySetDeletable = isParentDeletable ? compileExpression(isParentDeletable, true) : isParentDeletable;
    }
    const bMassEditEnabled = !isConstant(massEditVisibilityExpression) || massEditVisibilityExpression.value !== false;
    if (!selectionMode || selectionMode === SelectionMode.Auto) {
      selectionMode = SelectionMode.Multi;
    }
    if (bMassEditEnabled) {
      // Override default selection mode when mass edit is visible
      selectionMode = selectionMode === SelectionMode.Single ? SelectionMode.Single : SelectionMode.Multi;
    }
    if (hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation, manifestActions.actions, converterContext.getEntityType()) || hasCustomActionsAlwaysVisibleInToolBar(manifestActions.actions)) {
      return selectionMode;
    }
    aHiddenBindingExpressions = getUIHiddenExpForActionsRequiringContext(lineItemAnnotation, converterContext.getEntityType(), converterContext.getDataModelObjectPath(), isEntitySet);
    aVisibleBindingExpressions = getVisibleExpForCustomActionsRequiringContext(manifestActions.actions);

    // No action requiring a context:
    if (aHiddenBindingExpressions.length === 0 && aVisibleBindingExpressions.length === 0 && (deleteButtonVisibilityExpression || bMassEditEnabled)) {
      if (!isEntitySet) {
        // Example: OP case
        if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
          // Building expression for delete and mass edit
          const buttonVisibilityExpression = or(deleteButtonVisibilityExpression || true,
          // default delete visibility as true
          massEditVisibilityExpression);
          return compileExpression(ifElse(and(UI.IsEditable, buttonVisibilityExpression), constant(selectionMode), constant(SelectionMode.None)));
        } else {
          return SelectionMode.None;
        }
        // EntitySet deletable:
      } else if (bMassEditEnabled) {
        // example: LR scenario
        return selectionMode;
      } else if (targetCapabilities.isDeletable && deleteButtonVisibilityExpression) {
        return compileExpression(ifElse(deleteButtonVisibilityExpression, constant(selectionMode), constant("None")));
        // EntitySet not deletable:
      } else {
        return SelectionMode.None;
      }
      // There are actions requiring a context:
    } else if (!isEntitySet) {
      // Example: OP case
      if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
        // Use selectionMode in edit mode if delete is enabled or mass edit is visible
        const editModebuttonVisibilityExpression = ifElse(bMassEditEnabled && !targetCapabilities.isDeletable, massEditVisibilityExpression, constant(true));
        return compileExpression(ifElse(and(UI.IsEditable, editModebuttonVisibilityExpression), constant(selectionMode), ifElse(or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions)), constant(selectionMode), constant(SelectionMode.None))));
      } else {
        return compileExpression(ifElse(or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions)), constant(selectionMode), constant(SelectionMode.None)));
      }
      //EntitySet deletable:
    } else if (targetCapabilities.isDeletable || bMassEditEnabled) {
      // Example: LR scenario
      return selectionMode;
      //EntitySet not deletable:
    } else {
      return compileExpression(ifElse(or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions), massEditVisibilityExpression), constant(selectionMode), constant(SelectionMode.None)));
    }
  }

  /**
   * Method to retrieve all table actions from annotations.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns The table annotation actions
   */
  _exports.getSelectionMode = getSelectionMode;
  function getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext) {
    const tableActions = [];
    const hiddenTableActions = [];
    const copyDataField = getCopyAction(lineItemAnnotation.filter(dataField => {
      return dataFieldIsCopyAction(dataField);
    }));
    const sEntityType = converterContext.getEntityType().fullyQualifiedName;
    if (copyDataField) {
      var _copyDataField$annota, _copyDataField$annota2, _copyDataField$Label;
      tableActions.push({
        type: ActionType.Copy,
        annotationPath: converterContext.getEntitySetBasedAnnotationPath(copyDataField.fullyQualifiedName),
        key: KeyHelper.generateKeyFromDataField(copyDataField),
        enabled: compileExpression(equal(pathInModel("numberOfSelectedContexts", "internal"), 1)),
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_copyDataField$annota = copyDataField.annotations) === null || _copyDataField$annota === void 0 ? void 0 : (_copyDataField$annota2 = _copyDataField$annota.UI) === null || _copyDataField$annota2 === void 0 ? void 0 : _copyDataField$annota2.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true))),
        text: ((_copyDataField$Label = copyDataField.Label) === null || _copyDataField$Label === void 0 ? void 0 : _copyDataField$Label.toString()) ?? Core.getLibraryResourceBundle("sap.fe.core").getText("C_COMMON_COPY"),
        isNavigable: true
      });
    }
    lineItemAnnotation.filter(dataField => {
      return !dataFieldIsCopyAction(dataField);
    }).forEach(dataField => {
      var _dataField$annotation10, _dataField$annotation11, _dataField$annotation12, _dataField$Inline3, _dataField$Determinin, _dataField$ActionTarg3, _dataField$ActionTarg4, _dataField$ActionTarg5, _dataField$annotation13, _dataField$annotation14, _dataField$annotation15, _dataField$annotation16;
      if (((_dataField$annotation10 = dataField.annotations) === null || _dataField$annotation10 === void 0 ? void 0 : (_dataField$annotation11 = _dataField$annotation10.UI) === null || _dataField$annotation11 === void 0 ? void 0 : (_dataField$annotation12 = _dataField$annotation11.Hidden) === null || _dataField$annotation12 === void 0 ? void 0 : _dataField$annotation12.valueOf()) === true) {
        hiddenTableActions.push({
          type: ActionType.Default,
          key: KeyHelper.generateKeyFromDataField(dataField)
        });
      } else if (isDataFieldForActionAbstract(dataField) && ((_dataField$Inline3 = dataField.Inline) === null || _dataField$Inline3 === void 0 ? void 0 : _dataField$Inline3.valueOf()) !== true && ((_dataField$Determinin = dataField.Determining) === null || _dataField$Determinin === void 0 ? void 0 : _dataField$Determinin.valueOf()) !== true) {
        switch (dataField.$Type) {
          case "com.sap.vocabularies.UI.v1.DataFieldForAction":
            // There are three cases when a table action has an OperationAvailable that leads to an enablement expression
            // and is not dependent upon the table entries.
            // 1. An action with an overload, that is executed against a parent entity.
            // 2. An unbound action
            // 3. A static action (that is, bound to a collection)
            let useEnabledExpression = false;
            if (((_dataField$ActionTarg3 = dataField.ActionTarget) === null || _dataField$ActionTarg3 === void 0 ? void 0 : (_dataField$ActionTarg4 = _dataField$ActionTarg3.annotations) === null || _dataField$ActionTarg4 === void 0 ? void 0 : (_dataField$ActionTarg5 = _dataField$ActionTarg4.Core) === null || _dataField$ActionTarg5 === void 0 ? void 0 : _dataField$ActionTarg5.OperationAvailable) !== undefined) {
              var _dataField$ActionTarg6, _dataField$ActionTarg7, _dataField$ActionTarg8, _dataField$ActionTarg9;
              if (!((_dataField$ActionTarg6 = dataField.ActionTarget) !== null && _dataField$ActionTarg6 !== void 0 && _dataField$ActionTarg6.isBound)) {
                // Unbound action. Is recognised, but getExpressionFromAnnotation checks for isBound = true, so not generated.
                useEnabledExpression = true;
              } else if ((_dataField$ActionTarg7 = dataField.ActionTarget) !== null && _dataField$ActionTarg7 !== void 0 && _dataField$ActionTarg7.isBound && ((_dataField$ActionTarg8 = dataField.ActionTarget) === null || _dataField$ActionTarg8 === void 0 ? void 0 : _dataField$ActionTarg8.sourceType) !== sEntityType) {
                // Overload action
                useEnabledExpression = true;
              } else if ((_dataField$ActionTarg9 = dataField.ActionTarget) !== null && _dataField$ActionTarg9 !== void 0 && _dataField$ActionTarg9.parameters[0].isCollection) {
                // Static action
                useEnabledExpression = true;
              }
            }
            const tableAction = {
              type: ActionType.DataFieldForAction,
              annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation13 = dataField.annotations) === null || _dataField$annotation13 === void 0 ? void 0 : (_dataField$annotation14 = _dataField$annotation13.UI) === null || _dataField$annotation14 === void 0 ? void 0 : _dataField$annotation14.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true))),
              isNavigable: true
            };
            if (useEnabledExpression) {
              tableAction.enabled = getEnabledForAnnotationAction(converterContext, dataField.ActionTarget);
            }
            tableActions.push(tableAction);
            break;
          case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
            tableActions.push({
              type: ActionType.DataFieldForIntentBasedNavigation,
              annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation15 = dataField.annotations) === null || _dataField$annotation15 === void 0 ? void 0 : (_dataField$annotation16 = _dataField$annotation15.UI) === null || _dataField$annotation16 === void 0 ? void 0 : _dataField$annotation16.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true)))
            });
            break;
          default:
            break;
        }
      }
    });
    return {
      tableActions,
      hiddenTableActions
    };
  }

  /**
   * Generate the bindingExpression for the highlight rowSetting parameter.
   *
   * @param criticalityAnnotation Path or value of the criticality
   * @param isDraftRootOrNode  Is the current entitySet an Draft root or a node
   * @param targetEntityType The targeted entityType
   * @returns An expressionBinding
   * @private
   */
  function getHighlightRowBinding(criticalityAnnotation, isDraftRootOrNode, targetEntityType) {
    let defaultHighlightRowDefinition = MessageType.None;
    if (criticalityAnnotation) {
      if (typeof criticalityAnnotation === "object") {
        defaultHighlightRowDefinition = getExpressionFromAnnotation(criticalityAnnotation);
      } else {
        // Enum Value so we get the corresponding static part
        defaultHighlightRowDefinition = getMessageTypeFromCriticalityType(criticalityAnnotation);
      }
    }
    const aMissingKeys = [];
    targetEntityType === null || targetEntityType === void 0 ? void 0 : targetEntityType.keys.forEach(key => {
      if (key.name !== "IsActiveEntity") {
        aMissingKeys.push(pathInModel(key.name, undefined));
      }
    });
    return formatResult([defaultHighlightRowDefinition, pathInModel(`filteredMessages`, "internal"), isDraftRootOrNode && Entity.HasActive, isDraftRootOrNode && Entity.IsActive, `${isDraftRootOrNode}`, ...aMissingKeys], tableFormatters.rowHighlighting, targetEntityType);
  }
  function _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings, visualizationPath) {
    var _newAction2;
    const navigation = (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.create) || (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.detail);
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const originalTableSettings = tableManifestSettings && tableManifestSettings.tableSettings || {};
    // cross-app
    if (navigation !== null && navigation !== void 0 && navigation.outbound && navigation.outboundDetail && navigationSettings !== null && navigationSettings !== void 0 && navigationSettings.create) {
      return {
        mode: "External",
        outbound: navigation.outbound,
        outboundDetail: navigation.outboundDetail,
        navigationSettings: navigationSettings
      };
    }
    let newAction;
    if (lineItemAnnotation) {
      var _converterContext$get14, _targetAnnotationsCom, _targetAnnotationsSes;
      // in-app
      const targetAnnotations = (_converterContext$get14 = converterContext.getEntitySet()) === null || _converterContext$get14 === void 0 ? void 0 : _converterContext$get14.annotations;
      const targetAnnotationsCommon = targetAnnotations === null || targetAnnotations === void 0 ? void 0 : targetAnnotations.Common,
        targetAnnotationsSession = targetAnnotations === null || targetAnnotations === void 0 ? void 0 : targetAnnotations.Session;
      newAction = (targetAnnotationsCommon === null || targetAnnotationsCommon === void 0 ? void 0 : (_targetAnnotationsCom = targetAnnotationsCommon.DraftRoot) === null || _targetAnnotationsCom === void 0 ? void 0 : _targetAnnotationsCom.NewAction) || (targetAnnotationsSession === null || targetAnnotationsSession === void 0 ? void 0 : (_targetAnnotationsSes = targetAnnotationsSession.StickySessionSupported) === null || _targetAnnotationsSes === void 0 ? void 0 : _targetAnnotationsSes.NewAction);
      if (tableManifestConfiguration.creationMode === CreationMode.CreationRow && newAction) {
        // A combination of 'CreationRow' and 'NewAction' does not make sense
        throw Error(`Creation mode '${CreationMode.CreationRow}' can not be used with a custom 'new' action (${newAction})`);
      }
      if (navigation !== null && navigation !== void 0 && navigation.route) {
        var _newAction;
        // route specified
        return {
          mode: tableManifestConfiguration.creationMode,
          append: tableManifestConfiguration.createAtEnd,
          newAction: (_newAction = newAction) === null || _newAction === void 0 ? void 0 : _newAction.toString(),
          navigateToTarget: tableManifestConfiguration.creationMode === CreationMode.NewPage ? navigation.route : undefined // navigate only in NewPage mode
        };
      }
    }

    // no navigation or no route specified - fallback to inline create if original creation mode was 'NewPage'
    if (tableManifestConfiguration.creationMode === CreationMode.NewPage) {
      var _originalTableSetting;
      tableManifestConfiguration.creationMode = CreationMode.Inline;
      // In case there was no specific configuration for the createAtEnd we force it to false
      if (((_originalTableSetting = originalTableSettings.creationMode) === null || _originalTableSetting === void 0 ? void 0 : _originalTableSetting.createAtEnd) === undefined) {
        tableManifestConfiguration.createAtEnd = false;
      }
    }
    return {
      mode: tableManifestConfiguration.creationMode,
      append: tableManifestConfiguration.createAtEnd,
      newAction: (_newAction2 = newAction) === null || _newAction2 === void 0 ? void 0 : _newAction2.toString()
    };
  }
  const _getRowConfigurationProperty = function (lineItemAnnotation, converterContext, navigationSettings, targetPath, tableType) {
    let pressProperty, navigationTarget;
    let criticalityProperty = constant(MessageType.None);
    const targetEntityType = converterContext.getEntityType();
    if (navigationSettings && lineItemAnnotation) {
      var _navigationSettings$d, _navigationSettings$d2, _lineItemAnnotation$a, _lineItemAnnotation$a2, _navigationSettings$d3;
      navigationTarget = ((_navigationSettings$d = navigationSettings.display) === null || _navigationSettings$d === void 0 ? void 0 : _navigationSettings$d.target) || ((_navigationSettings$d2 = navigationSettings.detail) === null || _navigationSettings$d2 === void 0 ? void 0 : _navigationSettings$d2.outbound);
      const targetEntitySet = converterContext.getEntitySet();
      criticalityProperty = getHighlightRowBinding((_lineItemAnnotation$a = lineItemAnnotation.annotations) === null || _lineItemAnnotation$a === void 0 ? void 0 : (_lineItemAnnotation$a2 = _lineItemAnnotation$a.UI) === null || _lineItemAnnotation$a2 === void 0 ? void 0 : _lineItemAnnotation$a2.Criticality, !!ModelHelper.getDraftRoot(targetEntitySet) || !!ModelHelper.getDraftNode(targetEntitySet), targetEntityType);
      if (navigationTarget) {
        pressProperty = ".handlers.onChevronPressNavigateOutBound( $controller ,'" + navigationTarget + "', ${$parameters>bindingContext})";
      }
      if (!navigationTarget && (_navigationSettings$d3 = navigationSettings.detail) !== null && _navigationSettings$d3 !== void 0 && _navigationSettings$d3.route) {
        pressProperty = "API.onTableRowPress($event, $controller, ${$parameters>bindingContext}, { callExtension: true, targetPath: '" + targetPath + "', editable : " + (ModelHelper.getDraftRoot(targetEntitySet) || ModelHelper.getDraftNode(targetEntitySet) ? "!${$parameters>bindingContext}.getProperty('IsActiveEntity')" : "undefined") + (tableType === "AnalyticalTable" || tableType === "TreeTable" ? ", bRecreateContext: true" : "") + "})"; //Need to access to DraftRoot and DraftNode !!!!!!!
      }
    }

    const rowNavigatedExpression = formatResult([pathInModel("/deepestPath", "internal")], tableFormatters.navigatedRow, targetEntityType);
    return {
      press: pressProperty,
      action: pressProperty ? "Navigation" : undefined,
      rowHighlighting: compileExpression(criticalityProperty),
      rowNavigated: compileExpression(rowNavigatedExpression),
      visible: compileExpression(not(UI.IsInactive))
    };
  };

  /**
   * Retrieve the columns from the entityType.
   *
   * @param columnsToBeCreated The columns to be created.
   * @param entityType The target entity type.
   * @param annotationColumns The array of columns created based on LineItem annotations.
   * @param nonSortableColumns The array of all non sortable column names.
   * @param converterContext The converter context.
   * @param tableType The table type.
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The column from the entityType
   */
  const getColumnsFromEntityType = function (columnsToBeCreated, entityType) {
    let annotationColumns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    let nonSortableColumns = arguments.length > 3 ? arguments[3] : undefined;
    let converterContext = arguments.length > 4 ? arguments[4] : undefined;
    let tableType = arguments.length > 5 ? arguments[5] : undefined;
    let textOnlyColumnsFromTextAnnotation = arguments.length > 6 ? arguments[6] : undefined;
    const tableColumns = annotationColumns;
    // Catch already existing columns - which were added before by LineItem Annotations
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    entityType.entityProperties.forEach(property => {
      // Catch already existing columns - which were added before by LineItem Annotations
      const exists = annotationColumns.some(column => {
        return column.name === property.name;
      });

      // if target type exists, it is a complex property and should be ignored
      if (!property.targetType && !exists) {
        const relatedPropertiesInfo = collectRelatedProperties(property.name, property, converterContext, true, tableType);
        const relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties);
        const additionalPropertyNames = Object.keys(relatedPropertiesInfo.additionalProperties);
        if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
          // Include text properties found during analysis on getColumnsFromAnnotations
          textOnlyColumnsFromTextAnnotation.push(...relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation);
        }
        const columnInfo = getColumnDefinitionFromProperty(property, converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName), property.name, true, true, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
        if (relatedPropertyNames.length > 0) {
          columnInfo.propertyInfos = relatedPropertyNames;
          columnInfo.exportSettings = {
            ...columnInfo.exportSettings,
            template: relatedPropertiesInfo.exportSettingsTemplate,
            wrap: relatedPropertiesInfo.exportSettingsWrapping
          };
          columnInfo.exportSettings.type = _getExportDataType(property.type, relatedPropertyNames.length > 1);
          if (relatedPropertiesInfo.exportUnitName) {
            columnInfo.exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
            columnInfo.exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
          } else if (relatedPropertiesInfo.exportUnitString) {
            columnInfo.exportSettings.unit = relatedPropertiesInfo.exportUnitString;
          }
          if (relatedPropertiesInfo.exportTimezoneName) {
            columnInfo.exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
            columnInfo.exportSettings.utc = false;
          } else if (relatedPropertiesInfo.exportTimezoneString) {
            columnInfo.exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
          }
          if (relatedPropertiesInfo.exportDataPointTargetValue) {
            columnInfo.exportDataPointTargetValue = relatedPropertiesInfo.exportDataPointTargetValue;
            columnInfo.exportSettings.type = "String";
          }

          // Collect information of related columns to be created.
          relatedPropertyNames.forEach(name => {
            columnsToBeCreated[name] = relatedPropertiesInfo.properties[name];
          });
        }
        if (additionalPropertyNames.length > 0) {
          columnInfo.additionalPropertyInfos = additionalPropertyNames;
          // Create columns for additional properties identified for ALP use case.
          additionalPropertyNames.forEach(name => {
            // Intentional overwrite as we require only one new PropertyInfo for a related Property.
            columnsToBeCreated[name] = relatedPropertiesInfo.additionalProperties[name];
          });
        }
        tableColumns.push(columnInfo);
      }
      // In case a property has defined a #TextOnly text arrangement don't only create the complex property with the text property as a child property,
      // but also the property itself as it can be used as within the sortConditions or on custom columns.
      // This step must be valide also from the columns added via LineItems or from a column available on the p13n.
      if (getDisplayMode(property) === "Description") {
        nonSortableColumns = nonSortableColumns.concat(property.name);
        tableColumns.push(getColumnDefinitionFromProperty(property, converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName), property.name, false, false, nonSortableColumns, aggregationHelper, converterContext, []));
      }
    });

    // Create a propertyInfo for each related property.
    const relatedColumns = _createRelatedColumns(columnsToBeCreated, tableColumns, nonSortableColumns, converterContext, entityType, textOnlyColumnsFromTextAnnotation);
    return tableColumns.concat(relatedColumns);
  };

  /**
   * Create a column definition from a property.
   *
   * @param property Entity type property for which the column is created
   * @param fullPropertyPath The full path to the target property
   * @param relativePath The relative path to the target property based on the context
   * @param useDataFieldPrefix Should be prefixed with "DataField::", else it will be prefixed with "Property::"
   * @param availableForAdaptation Decides whether the column should be available for adaptation
   * @param nonSortableColumns The array of all non-sortable column names
   * @param aggregationHelper The aggregationHelper for the entity
   * @param converterContext The converter context
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The annotation column definition
   */
  _exports.getColumnsFromEntityType = getColumnsFromEntityType;
  const getColumnDefinitionFromProperty = function (property, fullPropertyPath, relativePath, useDataFieldPrefix, availableForAdaptation, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation) {
    var _property$annotations, _property$annotations2, _property$annotations3, _property$annotations10, _property$annotations11;
    const name = useDataFieldPrefix ? relativePath : `Property::${relativePath}`;
    const key = (useDataFieldPrefix ? "DataField::" : "Property::") + replaceSpecialChars(relativePath);
    const semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, property);
    const isHidden = ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf()) === true;
    const groupPath = property.name ? _sliceAtSlash(property.name, true, false) : undefined;
    const isGroup = groupPath != property.name;
    const exportType = _getExportDataType(property.type);
    const sDateInputFormat = property.type === "Edm.Date" ? "YYYY-MM-DD" : undefined;
    const dataType = getDataFieldDataType(property);
    const propertyTypeConfig = getTypeConfig(property, dataType);
    const semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
    const isAPropertyFromTextOnlyAnnotation = textOnlyColumnsFromTextAnnotation && textOnlyColumnsFromTextAnnotation.indexOf(relativePath) >= 0;
    const sortable = (!isHidden || isAPropertyFromTextOnlyAnnotation) && nonSortableColumns.indexOf(relativePath) === -1;
    const typeConfig = {
      className: property.type || dataType,
      formatOptions: propertyTypeConfig.formatOptions,
      constraints: propertyTypeConfig.constraints
    };
    let exportSettings = null;
    if (_isExportableColumn(property)) {
      var _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8, _property$annotations9;
      const unitProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
      const timezoneProperty = getAssociatedTimezoneProperty(property);
      const unitText = ((_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.Measures) === null || _property$annotations5 === void 0 ? void 0 : _property$annotations5.ISOCurrency) || ((_property$annotations6 = property.annotations) === null || _property$annotations6 === void 0 ? void 0 : (_property$annotations7 = _property$annotations6.Measures) === null || _property$annotations7 === void 0 ? void 0 : _property$annotations7.Unit);
      const timezoneText = (_property$annotations8 = property.annotations) === null || _property$annotations8 === void 0 ? void 0 : (_property$annotations9 = _property$annotations8.Common) === null || _property$annotations9 === void 0 ? void 0 : _property$annotations9.Timezone;
      exportSettings = {
        type: exportType,
        inputFormat: sDateInputFormat,
        scale: property.scale,
        delimiter: property.type === "Edm.Int64"
      };
      if (unitProperty) {
        exportSettings.unitProperty = unitProperty.name;
        exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
      } else if (unitText) {
        exportSettings.unit = `${unitText}`;
      }
      if (timezoneProperty) {
        exportSettings.timezoneProperty = timezoneProperty.name;
        exportSettings.utc = false;
      } else if (timezoneText) {
        exportSettings.timezone = timezoneText.toString();
      }
    }
    const collectedNavigationPropertyLabels = _getCollectedNavigationPropertyLabels(relativePath, converterContext);
    const column = {
      key: key,
      type: ColumnType.Annotation,
      label: getLabel(property, isGroup),
      groupLabel: isGroup ? getLabel(property) : undefined,
      group: isGroup ? groupPath : undefined,
      annotationPath: fullPropertyPath,
      semanticObjectPath: semanticObjectAnnotationPath,
      availability: !availableForAdaptation || isHidden ? "Hidden" : "Adaptation",
      name: name,
      relativePath: relativePath,
      sortable: sortable,
      isGroupable: aggregationHelper.isAnalyticsSupported() ? !!aggregationHelper.isPropertyGroupable(property) : sortable,
      isKey: property.isKey,
      exportSettings: exportSettings,
      caseSensitive: isFilteringCaseSensitive(converterContext),
      typeConfig: typeConfig,
      importance: getImportance((_property$annotations10 = property.annotations) === null || _property$annotations10 === void 0 ? void 0 : (_property$annotations11 = _property$annotations10.UI) === null || _property$annotations11 === void 0 ? void 0 : _property$annotations11.DataFieldDefault, semanticKeys),
      additionalLabels: collectedNavigationPropertyLabels
    };
    const sTooltip = _getTooltip(property) || getLabel(property, isGroup);
    if (sTooltip) {
      column.tooltip = sTooltip;
    }
    const targetValuefromDP = getTargetValueOnDataPoint(property);
    if (isDataPointFromDataFieldDefault(property) && typeof targetValuefromDP === "string" && column.exportSettings) {
      column.exportDataPointTargetValue = targetValuefromDP;
      column.exportSettings.template = "{0}/" + targetValuefromDP;
    }
    return column;
  };

  /**
   * Returns Boolean true for exportable columns, false for non exportable columns.
   *
   * @param source The dataField or property to be evaluated
   * @returns True for exportable column, false for non exportable column
   * @private
   */

  function _isExportableColumn(source) {
    var _annotations$UI2;
    let propertyType, property;
    const dataFieldDefaultProperty = (_annotations$UI2 = source.annotations.UI) === null || _annotations$UI2 === void 0 ? void 0 : _annotations$UI2.DataFieldDefault;
    if (isProperty(source) && dataFieldDefaultProperty !== null && dataFieldDefaultProperty !== void 0 && dataFieldDefaultProperty.$Type) {
      if (isReferencePropertyStaticallyHidden(dataFieldDefaultProperty) === true) {
        return false;
      }
      propertyType = dataFieldDefaultProperty === null || dataFieldDefaultProperty === void 0 ? void 0 : dataFieldDefaultProperty.$Type;
    } else if (isReferencePropertyStaticallyHidden(source) === true) {
      return false;
    } else {
      var _Target, _Target$$target, _Value, _Value$$target, _Value$$target$annota, _Value$$target$annota2, _Value$$target$annota3, _Value2, _Value2$$target, _Value2$$target$annot, _Value2$$target$annot2;
      property = source;
      propertyType = property.$Type;
      if (propertyType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (_Target = property.Target) !== null && _Target !== void 0 && (_Target$$target = _Target.$target) !== null && _Target$$target !== void 0 && _Target$$target.$Type) {
        var _Target2, _Target2$$target;
        //For Chart
        propertyType = (_Target2 = property.Target) === null || _Target2 === void 0 ? void 0 : (_Target2$$target = _Target2.$target) === null || _Target2$$target === void 0 ? void 0 : _Target2$$target.$Type;
        return "com.sap.vocabularies.UI.v1.ChartDefinitionType".indexOf(propertyType) === -1;
      } else if (((_Value = property.Value) === null || _Value === void 0 ? void 0 : (_Value$$target = _Value.$target) === null || _Value$$target === void 0 ? void 0 : (_Value$$target$annota = _Value$$target.annotations) === null || _Value$$target$annota === void 0 ? void 0 : (_Value$$target$annota2 = _Value$$target$annota.Core) === null || _Value$$target$annota2 === void 0 ? void 0 : (_Value$$target$annota3 = _Value$$target$annota2.MediaType) === null || _Value$$target$annota3 === void 0 ? void 0 : _Value$$target$annota3.term) === "Org.OData.Core.V1.MediaType" && ((_Value2 = property.Value) === null || _Value2 === void 0 ? void 0 : (_Value2$$target = _Value2.$target) === null || _Value2$$target === void 0 ? void 0 : (_Value2$$target$annot = _Value2$$target.annotations) === null || _Value2$$target$annot === void 0 ? void 0 : (_Value2$$target$annot2 = _Value2$$target$annot.Core) === null || _Value2$$target$annot2 === void 0 ? void 0 : _Value2$$target$annot2.isURL) !== true) {
        //For Stream
        return false;
      }
    }
    return propertyType ? ["com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldForActionGroup"].indexOf(propertyType) === -1 : true;
  }

  /**
   * Returns Boolean true for valid columns, false for invalid columns.
   *
   * @param dataField Different DataField types defined in the annotations
   * @returns True for valid columns, false for invalid columns
   * @private
   */
  const _isValidColumn = function (dataField) {
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        return !!dataField.Inline;
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        return true;
      default:
      // Todo: Replace with proper Log statement once available
      //  throw new Error("Unhandled DataField Abstract type: " + dataField.$Type);
    }
  };
  /**
   * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
   *
   * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
   *
   * @param dataFieldModelPath The metapath referring to the annotation that is evaluated by SAP Fiori elements.
   * @returns An expression that you can bind to the UI.
   */
  const _getVisibleExpression = function (dataFieldModelPath) {
    var _targetObject$Target, _targetObject$Target$, _targetObject$annotat, _targetObject$annotat2, _propertyValue$annota, _propertyValue$annota2;
    const targetObject = dataFieldModelPath.targetObject;
    let propertyValue;
    if (targetObject) {
      switch (targetObject.$Type) {
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        case "com.sap.vocabularies.UI.v1.DataPointType":
          propertyValue = targetObject.Value.$target;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          // if it is a DataFieldForAnnotation pointing to a DataPoint we look at the dataPoint's value
          if ((targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$Target = targetObject.Target) === null || _targetObject$Target === void 0 ? void 0 : (_targetObject$Target$ = _targetObject$Target.$target) === null || _targetObject$Target$ === void 0 ? void 0 : _targetObject$Target$.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _targetObject$Target$2;
            propertyValue = (_targetObject$Target$2 = targetObject.Target.$target) === null || _targetObject$Target$2 === void 0 ? void 0 : _targetObject$Target$2.Value.$target;
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        default:
          propertyValue = undefined;
      }
    }
    // FIXME Prove me wrong that this is useless
    const isAnalyticalGroupHeaderExpanded = /*formatOptions?.isAnalytics ? UI.IsExpanded :*/constant(false);
    const isAnalyticalLeaf = /*formatOptions?.isAnalytics ? equal(UI.NodeLevel, 0) :*/constant(false);

    // A data field is visible if:
    // - the UI.Hidden expression in the original annotation does not evaluate to 'true'
    // - the UI.Hidden expression in the target property does not evaluate to 'true'
    // - in case of Analytics it's not visible for an expanded GroupHeader
    return and(...[not(equal(getExpressionFromAnnotation(targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$annotat = targetObject.annotations) === null || _targetObject$annotat === void 0 ? void 0 : (_targetObject$annotat2 = _targetObject$annotat.UI) === null || _targetObject$annotat2 === void 0 ? void 0 : _targetObject$annotat2.Hidden), true)), ifElse(!!propertyValue, propertyValue && not(equal(getExpressionFromAnnotation((_propertyValue$annota = propertyValue.annotations) === null || _propertyValue$annota === void 0 ? void 0 : (_propertyValue$annota2 = _propertyValue$annota.UI) === null || _propertyValue$annota2 === void 0 ? void 0 : _propertyValue$annota2.Hidden), true)), true), or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)]);
  };

  /**
   * Returns hidden binding expressions for a field group.
   *
   * @param dataFieldGroup DataField defined in the annotations
   * @returns Compile binding of field group expressions.
   * @private
   */
  _exports._getVisibleExpression = _getVisibleExpression;
  const _getFieldGroupHiddenExpressions = function (dataFieldGroup) {
    var _dataFieldGroup$Targe, _dataFieldGroup$Targe2;
    const fieldGroupHiddenExpressions = [];
    if (dataFieldGroup.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_dataFieldGroup$Targe = dataFieldGroup.Target) === null || _dataFieldGroup$Targe === void 0 ? void 0 : (_dataFieldGroup$Targe2 = _dataFieldGroup$Targe.$target) === null || _dataFieldGroup$Targe2 === void 0 ? void 0 : _dataFieldGroup$Targe2.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
      var _dataFieldGroup$annot, _dataFieldGroup$annot2;
      if (dataFieldGroup !== null && dataFieldGroup !== void 0 && (_dataFieldGroup$annot = dataFieldGroup.annotations) !== null && _dataFieldGroup$annot !== void 0 && (_dataFieldGroup$annot2 = _dataFieldGroup$annot.UI) !== null && _dataFieldGroup$annot2 !== void 0 && _dataFieldGroup$annot2.Hidden) {
        return compileExpression(not(equal(getExpressionFromAnnotation(dataFieldGroup.annotations.UI.Hidden), true)));
      } else {
        var _dataFieldGroup$Targe3;
        (_dataFieldGroup$Targe3 = dataFieldGroup.Target.$target.Data) === null || _dataFieldGroup$Targe3 === void 0 ? void 0 : _dataFieldGroup$Targe3.forEach(innerDataField => {
          fieldGroupHiddenExpressions.push(_getVisibleExpression({
            targetObject: innerDataField
          }));
        });
        return compileExpression(ifElse(or(...fieldGroupHiddenExpressions), constant(true), constant(false)));
      }
    } else {
      return undefined;
    }
  };

  /**
   * Returns the label for the property and dataField.
   *
   * @param [property] Property, DataField or Navigation Property defined in the annotations
   * @param isGroup
   * @returns Label of the property or DataField
   * @private
   */
  const getLabel = function (property) {
    let isGroup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!property) {
      return undefined;
    }
    if (isProperty(property) || isNavigationProperty(property)) {
      var _annotations2, _annotations2$UI, _dataFieldDefault$Lab, _property$annotations12, _property$annotations13;
      const dataFieldDefault = (_annotations2 = property.annotations) === null || _annotations2 === void 0 ? void 0 : (_annotations2$UI = _annotations2.UI) === null || _annotations2$UI === void 0 ? void 0 : _annotations2$UI.DataFieldDefault;
      if (dataFieldDefault && !dataFieldDefault.qualifier && (_dataFieldDefault$Lab = dataFieldDefault.Label) !== null && _dataFieldDefault$Lab !== void 0 && _dataFieldDefault$Lab.valueOf()) {
        var _dataFieldDefault$Lab2;
        return compileExpression(getExpressionFromAnnotation((_dataFieldDefault$Lab2 = dataFieldDefault.Label) === null || _dataFieldDefault$Lab2 === void 0 ? void 0 : _dataFieldDefault$Lab2.valueOf()));
      }
      return compileExpression(getExpressionFromAnnotation(((_property$annotations12 = property.annotations.Common) === null || _property$annotations12 === void 0 ? void 0 : (_property$annotations13 = _property$annotations12.Label) === null || _property$annotations13 === void 0 ? void 0 : _property$annotations13.valueOf()) || property.name));
    } else if (isDataFieldTypes(property)) {
      var _property$Label2, _property$Value, _property$Value$$targ, _property$Value$$targ2, _property$Value$$targ3, _property$Value$$targ4, _property$Value2, _property$Value2$$tar;
      if (!!isGroup && property.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation") {
        var _property$Label;
        return compileExpression(getExpressionFromAnnotation((_property$Label = property.Label) === null || _property$Label === void 0 ? void 0 : _property$Label.valueOf()));
      }
      return compileExpression(getExpressionFromAnnotation(((_property$Label2 = property.Label) === null || _property$Label2 === void 0 ? void 0 : _property$Label2.valueOf()) || ((_property$Value = property.Value) === null || _property$Value === void 0 ? void 0 : (_property$Value$$targ = _property$Value.$target) === null || _property$Value$$targ === void 0 ? void 0 : (_property$Value$$targ2 = _property$Value$$targ.annotations) === null || _property$Value$$targ2 === void 0 ? void 0 : (_property$Value$$targ3 = _property$Value$$targ2.Common) === null || _property$Value$$targ3 === void 0 ? void 0 : (_property$Value$$targ4 = _property$Value$$targ3.Label) === null || _property$Value$$targ4 === void 0 ? void 0 : _property$Value$$targ4.valueOf()) || ((_property$Value2 = property.Value) === null || _property$Value2 === void 0 ? void 0 : (_property$Value2$$tar = _property$Value2.$target) === null || _property$Value2$$tar === void 0 ? void 0 : _property$Value2$$tar.name)));
    } else if (property.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      var _property$Label3, _property$Target, _property$Target$$tar, _property$Target$$tar2, _property$Target$$tar3, _property$Target$$tar4, _property$Target$$tar5, _property$Target$$tar6;
      return compileExpression(getExpressionFromAnnotation(((_property$Label3 = property.Label) === null || _property$Label3 === void 0 ? void 0 : _property$Label3.valueOf()) || ((_property$Target = property.Target) === null || _property$Target === void 0 ? void 0 : (_property$Target$$tar = _property$Target.$target) === null || _property$Target$$tar === void 0 ? void 0 : (_property$Target$$tar2 = _property$Target$$tar.Value) === null || _property$Target$$tar2 === void 0 ? void 0 : (_property$Target$$tar3 = _property$Target$$tar2.$target) === null || _property$Target$$tar3 === void 0 ? void 0 : (_property$Target$$tar4 = _property$Target$$tar3.annotations) === null || _property$Target$$tar4 === void 0 ? void 0 : (_property$Target$$tar5 = _property$Target$$tar4.Common) === null || _property$Target$$tar5 === void 0 ? void 0 : (_property$Target$$tar6 = _property$Target$$tar5.Label) === null || _property$Target$$tar6 === void 0 ? void 0 : _property$Target$$tar6.valueOf())));
    } else {
      var _property$Label4;
      return compileExpression(getExpressionFromAnnotation((_property$Label4 = property.Label) === null || _property$Label4 === void 0 ? void 0 : _property$Label4.valueOf()));
    }
  };
  const _getTooltip = function (source) {
    var _source$annotations, _source$annotations$C;
    if (!source) {
      return undefined;
    }
    if (isProperty(source) || (_source$annotations = source.annotations) !== null && _source$annotations !== void 0 && (_source$annotations$C = _source$annotations.Common) !== null && _source$annotations$C !== void 0 && _source$annotations$C.QuickInfo) {
      var _source$annotations2, _source$annotations2$;
      return (_source$annotations2 = source.annotations) !== null && _source$annotations2 !== void 0 && (_source$annotations2$ = _source$annotations2.Common) !== null && _source$annotations2$ !== void 0 && _source$annotations2$.QuickInfo ? compileExpression(getExpressionFromAnnotation(source.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else if (isDataFieldTypes(source)) {
      var _source$Value, _source$Value$$target, _source$Value$$target2, _source$Value$$target3;
      return (_source$Value = source.Value) !== null && _source$Value !== void 0 && (_source$Value$$target = _source$Value.$target) !== null && _source$Value$$target !== void 0 && (_source$Value$$target2 = _source$Value$$target.annotations) !== null && _source$Value$$target2 !== void 0 && (_source$Value$$target3 = _source$Value$$target2.Common) !== null && _source$Value$$target3 !== void 0 && _source$Value$$target3.QuickInfo ? compileExpression(getExpressionFromAnnotation(source.Value.$target.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else if (source.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      var _source$Target, _datapointTarget$Valu, _datapointTarget$Valu2, _datapointTarget$Valu3, _datapointTarget$Valu4;
      const datapointTarget = (_source$Target = source.Target) === null || _source$Target === void 0 ? void 0 : _source$Target.$target;
      return datapointTarget !== null && datapointTarget !== void 0 && (_datapointTarget$Valu = datapointTarget.Value) !== null && _datapointTarget$Valu !== void 0 && (_datapointTarget$Valu2 = _datapointTarget$Valu.$target) !== null && _datapointTarget$Valu2 !== void 0 && (_datapointTarget$Valu3 = _datapointTarget$Valu2.annotations) !== null && _datapointTarget$Valu3 !== void 0 && (_datapointTarget$Valu4 = _datapointTarget$Valu3.Common) !== null && _datapointTarget$Valu4 !== void 0 && _datapointTarget$Valu4.QuickInfo ? compileExpression(getExpressionFromAnnotation(datapointTarget.Value.$target.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else {
      return undefined;
    }
  };
  function getRowStatusVisibility(colName, isSemanticKeyInFieldGroup) {
    return formatResult([pathInModel(`semanticKeyHasDraftIndicator`, "internal"), pathInModel(`filteredMessages`, "internal"), colName, isSemanticKeyInFieldGroup], tableFormatters.getErrorStatusTextVisibilityFormatter);
  }

  /**
   * Creates a PropertyInfo for each identified property consumed by a LineItem.
   *
   * @param columnsToBeCreated Identified properties.
   * @param existingColumns The list of columns created for LineItems and Properties of entityType.
   * @param nonSortableColumns The array of column names which cannot be sorted.
   * @param converterContext The converter context.
   * @param entityType The entity type for the LineItem
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The array of columns created.
   */
  _exports.getRowStatusVisibility = getRowStatusVisibility;
  const _createRelatedColumns = function (columnsToBeCreated, existingColumns, nonSortableColumns, converterContext, entityType, textOnlyColumnsFromTextAnnotation) {
    const relatedColumns = [];
    const relatedPropertyNameMap = {};
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    Object.keys(columnsToBeCreated).forEach(name => {
      const property = columnsToBeCreated[name],
        annotationPath = converterContext.getAbsoluteAnnotationPath(name),
        // Check whether the related column already exists.
        relatedColumn = existingColumns.find(column => column.name === name);
      if (relatedColumn === undefined) {
        // Case 1: Key contains DataField prefix to ensure all property columns have the same key format.
        // New created property column is set to hidden.
        const column = getColumnDefinitionFromProperty(property, annotationPath, name, true, false, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
        column.isPartOfLineItem = existingColumns.some(existingColumn => {
          var _existingColumn$prope;
          return ((_existingColumn$prope = existingColumn.propertyInfos) === null || _existingColumn$prope === void 0 ? void 0 : _existingColumn$prope.includes(name)) && existingColumn.isPartOfLineItem;
        });
        relatedColumns.push(column);
      } else if (relatedColumn.annotationPath !== annotationPath || relatedColumn.propertyInfos) {
        // Case 2: The existing column points to a LineItem (or)
        // Case 3: This is a self reference from an existing column

        const newName = `Property::${name}`;

        // Checking whether the related property column has already been created in a previous iteration.
        if (!existingColumns.some(column => column.name === newName)) {
          // Create a new property column with 'Property::' prefix,
          // Set it to hidden as it is only consumed by Complex property infos.
          const column = getColumnDefinitionFromProperty(property, annotationPath, name, false, false, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
          column.isPartOfLineItem = relatedColumn.isPartOfLineItem;
          relatedColumns.push(column);
          relatedPropertyNameMap[name] = newName;
        } else if (existingColumns.some(column => column.name === newName) && existingColumns.some(column => {
          var _column$propertyInfos;
          return (_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.includes(name);
        })) {
          relatedPropertyNameMap[name] = newName;
        }
      }
    });

    // The property 'name' has been prefixed with 'Property::' for uniqueness.
    // Update the same in other propertyInfos[] references which point to this property.
    existingColumns.forEach(column => {
      var _column$propertyInfos2, _column$additionalPro;
      column.propertyInfos = (_column$propertyInfos2 = column.propertyInfos) === null || _column$propertyInfos2 === void 0 ? void 0 : _column$propertyInfos2.map(propertyInfo => relatedPropertyNameMap[propertyInfo] ?? propertyInfo);
      column.additionalPropertyInfos = (_column$additionalPro = column.additionalPropertyInfos) === null || _column$additionalPro === void 0 ? void 0 : _column$additionalPro.map(propertyInfo => relatedPropertyNameMap[propertyInfo] ?? propertyInfo);
    });
    return relatedColumns;
  };

  /**
   * Getting the Column Name
   * If it points to a DataField with one property or DataPoint with one property, it will use the property name
   * here to be consistent with the existing flex changes.
   *
   * @param dataField Different DataField types defined in the annotations
   * @returns The name of annotation columns
   * @private
   */
  const _getAnnotationColumnName = function (dataField) {
    var _dataField$Value, _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    // This is needed as we have flexibility changes already that we have to check against
    if (isDataFieldTypes(dataField) && (_dataField$Value = dataField.Value) !== null && _dataField$Value !== void 0 && _dataField$Value.path) {
      var _dataField$Value2;
      return (_dataField$Value2 = dataField.Value) === null || _dataField$Value2 === void 0 ? void 0 : _dataField$Value2.path;
    } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (_dataField$Target = dataField.Target) !== null && _dataField$Target !== void 0 && (_dataField$Target$$ta = _dataField$Target.$target) !== null && _dataField$Target$$ta !== void 0 && (_dataField$Target$$ta2 = _dataField$Target$$ta.Value) !== null && _dataField$Target$$ta2 !== void 0 && _dataField$Target$$ta2.path) {
      var _dataField$Target2, _dataField$Target2$$t;
      // This is for removing duplicate properties. For example, 'Progress' Property is removed if it is already defined as a DataPoint
      return (_dataField$Target2 = dataField.Target) === null || _dataField$Target2 === void 0 ? void 0 : (_dataField$Target2$$t = _dataField$Target2.$target) === null || _dataField$Target2$$t === void 0 ? void 0 : _dataField$Target2$$t.Value.path;
    } else {
      return KeyHelper.generateKeyFromDataField(dataField);
    }
  };

  /**
   * Creates a PropertyInfo for the identified additional property for the ALP table use-case.
   *
   * For e.g. If UI.Hidden points to a property, include this technical property in the additionalProperties of ComplexPropertyInfo object.
   *
   * @param name The name of the property to be created.
   * @param columns The list of columns created for LineItems and Properties of entityType from the table visualization.
   * @returns The propertyInfo of the technical property to be added to the list of columns.
   * @private
   */

  const createTechnicalProperty = function (name, columns, relatedAdditionalPropertyNameMap) {
    const key = `Property_Technical::${name}`;
    // Validate if the technical property hasn't yet been created on previous iterations.
    const columnExists = columns.find(column => column.key === key);
    // Retrieve the simple property used by the hidden annotation, it will be used as a base for the mandatory attributes of newly created technical property. For e.g. relativePath
    const additionalProperty = !columnExists && columns.find(column => column.name === name && !column.propertyInfos);
    if (additionalProperty) {
      const technicalColumn = {
        key: key,
        type: ColumnType.Annotation,
        label: additionalProperty.label,
        annotationPath: additionalProperty.annotationPath,
        availability: "Hidden",
        name: key,
        relativePath: additionalProperty.relativePath,
        sortable: false,
        isGroupable: false,
        isKey: false,
        exportSettings: null,
        caseSensitive: false,
        aggregatable: false,
        extension: {
          technicallyGroupable: true,
          technicallyAggregatable: true
        }
      };
      columns.push(technicalColumn);
      relatedAdditionalPropertyNameMap[name] = technicalColumn.name;
    }
  };

  /**
   * Determines if the data field labels have to be displayed in the table.
   *
   * @param fieldGroupName The `DataField` name being processed.
   * @param visualizationPath
   * @param converterContext
   * @returns `showDataFieldsLabel` value from the manifest
   * @private
   */
  const _getShowDataFieldsLabel = function (fieldGroupName, visualizationPath, converterContext) {
    var _converterContext$get15;
    const oColumns = (_converterContext$get15 = converterContext.getManifestControlConfiguration(visualizationPath)) === null || _converterContext$get15 === void 0 ? void 0 : _converterContext$get15.columns;
    const aColumnKeys = oColumns && Object.keys(oColumns);
    return aColumnKeys && !!aColumnKeys.find(function (key) {
      return key === fieldGroupName && oColumns[key].showDataFieldsLabel;
    });
  };

  /**
   * Determines the relative path of the property with respect to the root entity.
   *
   * @param dataField The `DataField` being processed.
   * @returns The relative path
   */
  const _getRelativePath = function (dataField) {
    var _Value3, _dataField$Target3;
    let relativePath = "";
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        relativePath = dataField === null || dataField === void 0 ? void 0 : (_Value3 = dataField.Value) === null || _Value3 === void 0 ? void 0 : _Value3.path;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        relativePath = dataField === null || dataField === void 0 ? void 0 : (_dataField$Target3 = dataField.Target) === null || _dataField$Target3 === void 0 ? void 0 : _dataField$Target3.value;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldForActionGroup":
      case "com.sap.vocabularies.UI.v1.DataFieldWithActionGroup":
        relativePath = KeyHelper.generateKeyFromDataField(dataField);
        break;
    }
    return relativePath;
  };
  const _sliceAtSlash = function (path, isLastSlash, isLastPart) {
    const iSlashIndex = isLastSlash ? path.lastIndexOf("/") : path.indexOf("/");
    if (iSlashIndex === -1) {
      return path;
    }
    return isLastPart ? path.substring(iSlashIndex + 1, path.length) : path.substring(0, iSlashIndex);
  };

  /**
   * Determines if the column contains a multi-value field.
   *
   * @param dataField The DataField being processed
   * @param converterContext The converter context
   * @returns True if the DataField corresponds to a multi-value field.
   */
  const _isColumnMultiValued = function (dataField, converterContext) {
    if (isDataFieldTypes(dataField) && isPathAnnotationExpression(dataField.Value)) {
      const propertyObjectPath = enhanceDataModelPath(converterContext.getDataModelObjectPath(), dataField.Value.path);
      return isMultiValueField(propertyObjectPath);
    } else {
      return false;
    }
  };

  /**
   * Determine whether a column is sortable.
   *
   * @param dataField The data field being processed
   * @param propertyPath The property path
   * @param nonSortableColumns Collection of non-sortable column names as per annotation
   * @returns True if the column is sortable
   */
  const _isColumnSortable = function (dataField, propertyPath, nonSortableColumns) {
    return nonSortableColumns.indexOf(propertyPath) === -1 && (
    // Column is not marked as non-sortable via annotation
    dataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction");
  };

  /**
   * Returns whether filtering on the table is case sensitive.
   *
   * @param converterContext The instance of the converter context
   * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
   */
  const isFilteringCaseSensitive = function (converterContext) {
    const filterFunctions = _getFilterFunctions(converterContext);
    return Array.isArray(filterFunctions) ? filterFunctions.indexOf("tolower") === -1 : true;
  };
  _exports.isFilteringCaseSensitive = isFilteringCaseSensitive;
  function _getFilterFunctions(ConverterContext) {
    const entitySet = ConverterContext.getEntitySet();
    if (TypeGuards.isEntitySet(entitySet)) {
      var _entitySet$annotation3, _ConverterContext$get;
      return ((_entitySet$annotation3 = entitySet.annotations.Capabilities) === null || _entitySet$annotation3 === void 0 ? void 0 : _entitySet$annotation3.FilterFunctions) ?? ((_ConverterContext$get = ConverterContext.getEntityContainer().annotations.Capabilities) === null || _ConverterContext$get === void 0 ? void 0 : _ConverterContext$get.FilterFunctions);
    }
    return undefined;
  }

  /**
   * Returns default format options for text fields in a table.
   *
   * @param formatOptions
   * @returns Collection of format options with default values
   */
  function _getDefaultFormatOptionsForTable(formatOptions) {
    return formatOptions === undefined ? undefined : {
      textLinesEdit: 4,
      ...formatOptions
    };
  }
  function _findSemanticKeyValues(semanticKeys, name) {
    const aSemanticKeyValues = [];
    let bSemanticKeyFound = false;
    for (let i = 0; i < semanticKeys.length; i++) {
      aSemanticKeyValues.push(semanticKeys[i].value);
      if (semanticKeys[i].value === name) {
        bSemanticKeyFound = true;
      }
    }
    return {
      values: aSemanticKeyValues,
      semanticKeyFound: bSemanticKeyFound
    };
  }
  function _findProperties(semanticKeyValues, fieldGroupProperties) {
    let semanticKeyHasPropertyInFieldGroup = false;
    let sPropertyPath;
    if (semanticKeyValues && semanticKeyValues.length >= 1 && fieldGroupProperties && fieldGroupProperties.length >= 1) {
      for (let i = 0; i < semanticKeyValues.length; i++) {
        if ([semanticKeyValues[i]].some(tmp => fieldGroupProperties.indexOf(tmp) >= 0)) {
          semanticKeyHasPropertyInFieldGroup = true;
          sPropertyPath = semanticKeyValues[i];
          break;
        }
      }
    }
    return {
      semanticKeyHasPropertyInFieldGroup: semanticKeyHasPropertyInFieldGroup,
      fieldGroupPropertyPath: sPropertyPath
    };
  }

  /**
   * Find the first property in the fieldGroup that is part of the semantic keys.
   *
   * @param dataFieldGroup
   * @param semanticKeyValues
   * @returns An object containing a flag true if a property is found and a propertyPath.
   */
  function _findSemanticKeyValuesInFieldGroup(dataFieldGroup, semanticKeyValues) {
    var _dataFieldGroup$Targe4, _dataFieldGroup$Targe5;
    // this info is used in FieldlHelper#isDraftIndicatorVisibleInFieldGroup to show a draft indicator at the end of a field group
    const aProperties = [];
    let _propertiesFound = {
      semanticKeyHasPropertyInFieldGroup: false,
      fieldGroupPropertyPath: undefined
    };
    if (dataFieldGroup && dataFieldGroup.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_dataFieldGroup$Targe4 = dataFieldGroup.Target) === null || _dataFieldGroup$Targe4 === void 0 ? void 0 : (_dataFieldGroup$Targe5 = _dataFieldGroup$Targe4.$target) === null || _dataFieldGroup$Targe5 === void 0 ? void 0 : _dataFieldGroup$Targe5.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
      var _dataFieldGroup$Targe6;
      (_dataFieldGroup$Targe6 = dataFieldGroup.Target.$target.Data) === null || _dataFieldGroup$Targe6 === void 0 ? void 0 : _dataFieldGroup$Targe6.forEach(innerDataField => {
        if ((innerDataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || innerDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") && innerDataField.Value) {
          aProperties.push(innerDataField.Value.path);
        }
        _propertiesFound = _findProperties(semanticKeyValues, aProperties);
      });
    }
    return {
      semanticKeyHasPropertyInFieldGroup: _propertiesFound.semanticKeyHasPropertyInFieldGroup,
      propertyPath: _propertiesFound.fieldGroupPropertyPath
    };
  }

  /**
   * Returns default format options with draftIndicator for a column.
   *
   * @param name
   * @param semanticKeys
   * @param isFieldGroupColumn
   * @param dataFieldGroup
   * @returns Collection of format options with default values
   */
  function getDefaultDraftIndicatorForColumn(name, semanticKeys, isFieldGroupColumn, dataFieldGroup) {
    if (!semanticKeys) {
      return {};
    }
    const semanticKey = _findSemanticKeyValues(semanticKeys, name);
    const semanticKeyInFieldGroup = _findSemanticKeyValuesInFieldGroup(dataFieldGroup, semanticKey.values);
    if (semanticKeyInFieldGroup.semanticKeyHasPropertyInFieldGroup) {
      // Semantic Key has a property in a FieldGroup
      return {
        //TODO we should rather store hasSemanticKeyInFieldGroup
        fieldGroupDraftIndicatorPropertyPath: semanticKeyInFieldGroup.propertyPath,
        fieldGroupName: name,
        showErrorObjectStatus: compileExpression(getRowStatusVisibility(name, true))
      };
    } else if (semanticKey.semanticKeyFound) {
      return {
        hasDraftIndicator: true,
        showErrorObjectStatus: compileExpression(getRowStatusVisibility(name, false))
      };
    }
    return {};
  }
  function _getImpNumber(dataField) {
    var _dataField$annotation17, _dataField$annotation18;
    const importance = dataField === null || dataField === void 0 ? void 0 : (_dataField$annotation17 = dataField.annotations) === null || _dataField$annotation17 === void 0 ? void 0 : (_dataField$annotation18 = _dataField$annotation17.UI) === null || _dataField$annotation18 === void 0 ? void 0 : _dataField$annotation18.Importance;
    if (importance && importance.includes("UI.ImportanceType/High")) {
      return 3;
    }
    if (importance && importance.includes("UI.ImportanceType/Medium")) {
      return 2;
    }
    if (importance && importance.includes("UI.ImportanceType/Low")) {
      return 1;
    }
    return 0;
  }
  function _getDataFieldImportance(dataField) {
    var _dataField$annotation19, _dataField$annotation20;
    const importance = dataField === null || dataField === void 0 ? void 0 : (_dataField$annotation19 = dataField.annotations) === null || _dataField$annotation19 === void 0 ? void 0 : (_dataField$annotation20 = _dataField$annotation19.UI) === null || _dataField$annotation20 === void 0 ? void 0 : _dataField$annotation20.Importance;
    return importance ? importance.split("/")[1] : Importance.None;
  }
  function _getMaxImportance(fields) {
    if (fields && fields.length > 0) {
      let maxImpNumber = -1;
      let impNumber = -1;
      let DataFieldWithMaxImportance;
      for (const field of fields) {
        impNumber = _getImpNumber(field);
        if (impNumber > maxImpNumber) {
          maxImpNumber = impNumber;
          DataFieldWithMaxImportance = field;
        }
      }
      return _getDataFieldImportance(DataFieldWithMaxImportance);
    }
    return Importance.None;
  }

  /**
   * Returns the importance value for a column.
   *
   * @param dataField
   * @param semanticKeys
   * @returns The importance value
   */
  function getImportance(dataField, semanticKeys) {
    var _Value6;
    //Evaluate default Importance is not set explicitly
    let fieldsWithImportance,
      mapSemanticKeys = [];
    //Check if semanticKeys are defined at the EntitySet level
    if (semanticKeys && semanticKeys.length > 0) {
      mapSemanticKeys = semanticKeys.map(function (key) {
        return key.value;
      });
    }
    if (!dataField) {
      return undefined;
    }
    if (isAnnotationOfType(dataField, "com.sap.vocabularies.UI.v1.DataFieldForAnnotation")) {
      const dataFieldTarget = dataField.Target.$target;
      if (isAnnotationOfType(dataFieldTarget, "com.sap.vocabularies.UI.v1.FieldGroupType")) {
        const fieldGroupData = dataFieldTarget.Data;
        const fieldGroupHasSemanticKey = fieldGroupData && fieldGroupData.some(function (fieldGroupDataField) {
          var _Value4, _Value5;
          return (fieldGroupDataField === null || fieldGroupDataField === void 0 ? void 0 : (_Value4 = fieldGroupDataField.Value) === null || _Value4 === void 0 ? void 0 : _Value4.path) && fieldGroupDataField.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && mapSemanticKeys.includes(fieldGroupDataField === null || fieldGroupDataField === void 0 ? void 0 : (_Value5 = fieldGroupDataField.Value) === null || _Value5 === void 0 ? void 0 : _Value5.path);
        });
        //If a FieldGroup contains a semanticKey, importance set to High
        if (fieldGroupHasSemanticKey) {
          return Importance.High;
        } else {
          var _dataField$annotation21, _dataField$annotation22;
          //If the DataFieldForAnnotation has an Importance we take it
          if (dataField !== null && dataField !== void 0 && (_dataField$annotation21 = dataField.annotations) !== null && _dataField$annotation21 !== void 0 && (_dataField$annotation22 = _dataField$annotation21.UI) !== null && _dataField$annotation22 !== void 0 && _dataField$annotation22.Importance) {
            return _getDataFieldImportance(dataField);
          }
          // else the highest importance (if any) is returned
          fieldsWithImportance = fieldGroupData && fieldGroupData.filter(function (item) {
            var _item$annotations, _item$annotations$UI;
            return item === null || item === void 0 ? void 0 : (_item$annotations = item.annotations) === null || _item$annotations === void 0 ? void 0 : (_item$annotations$UI = _item$annotations.UI) === null || _item$annotations$UI === void 0 ? void 0 : _item$annotations$UI.Importance;
          });
          return _getMaxImportance(fieldsWithImportance);
        }
        //If the current field is a semanticKey, importance set to High
      }
    }

    return dataField.Value && dataField !== null && dataField !== void 0 && (_Value6 = dataField.Value) !== null && _Value6 !== void 0 && _Value6.path && mapSemanticKeys.includes(dataField.Value.path) ? Importance.High : _getDataFieldImportance(dataField);
  }

  /**
   * Checks if displaying of the column is supported for an insights card.
   *
   * @param dataField
   * @param sLabel
   * @param converterContext
   * @param isMultiValue
   * @returns True if displaying of the column is supported for an insights card.
   */
  _exports.getImportance = getImportance;
  const checkIfColumnIsSupportedForInsights = function (dataField, sLabel, converterContext, isMultiValue) {
    const annotationPath = converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName);
    if (sLabel && sLabel !== "" && annotationPath.indexOf("@com.sap.vocabularies.UI.v1.LineItem") !== -1 && isDataFieldTypes(dataField)) {
      var _dataField$Value3;
      // include only those columns that are annotated as part of the table (skip entity props)
      const isImageColumn = (_dataField$Value3 = dataField.Value) !== null && _dataField$Value3 !== void 0 && _dataField$Value3.$target ? isImageURL(dataField.Value.$target) : false;
      return !isMultiValue && !isImageColumn;
    }
    return false;
  };

  /**
   * Returns line items from metadata annotations.
   *
   * @param lineItemAnnotation Collection of data fields with their annotations
   * @param visualizationPath The visualization path
   * @param converterContext The converter context
   * @param isInsightsEnabled
   * @returns The columns from the annotations
   */
  const getColumnsFromAnnotations = function (lineItemAnnotation, visualizationPath, converterContext, isInsightsEnabled) {
    var _tableManifestSetting2;
    const entityType = converterContext.getAnnotationEntityType(lineItemAnnotation),
      annotationColumns = [],
      columnsToBeCreated = {},
      nonSortableColumns = getNonSortablePropertiesRestrictions(converterContext.getEntitySet()),
      tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath),
      tableType = (tableManifestSettings === null || tableManifestSettings === void 0 ? void 0 : (_tableManifestSetting2 = tableManifestSettings.tableSettings) === null || _tableManifestSetting2 === void 0 ? void 0 : _tableManifestSetting2.type) || "ResponsiveTable";
    const textOnlyColumnsFromTextAnnotation = [];
    const semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
    if (lineItemAnnotation) {
      const tableConverterContext = converterContext.getConverterContextFor(getTargetObjectPath(converterContext.getDataModelObjectPath()));
      lineItemAnnotation.forEach(lineItem => {
        var _lineItem$Value, _lineItem$Value$$targ, _lineItem$Target, _lineItem$Target$$tar, _propertyTypeConfig, _propertyTypeConfig2, _tableManifestConfig$, _lineItem$annotations, _lineItem$annotations2, _lineItem$annotations3, _lineItem$annotations4, _exportSettings;
        // TODO: variable name should be datafield and not lineItem
        if (!_isValidColumn(lineItem)) {
          return;
        }
        let exportSettings = null;
        const semanticObjectAnnotationPath = isDataFieldTypes(lineItem) && (_lineItem$Value = lineItem.Value) !== null && _lineItem$Value !== void 0 && (_lineItem$Value$$targ = _lineItem$Value.$target) !== null && _lineItem$Value$$targ !== void 0 && _lineItem$Value$$targ.fullyQualifiedName ? getSemanticObjectPath(converterContext, lineItem) : undefined;
        const relativePath = _getRelativePath(lineItem);
        // Determine properties which are consumed by this LineItem.
        const relatedPropertiesInfo = collectRelatedPropertiesRecursively(lineItem, converterContext, tableType);
        const relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties);
        const additionalPropertyNames = Object.keys(relatedPropertiesInfo.additionalProperties);
        const groupPath = relativePath ? _sliceAtSlash(relativePath, true, false) : undefined;
        const isGroup = groupPath != relativePath;
        const sLabel = getLabel(lineItem, isGroup);
        const name = _getAnnotationColumnName(lineItem);
        const isFieldGroupColumn = groupPath ? groupPath.indexOf(`@${"com.sap.vocabularies.UI.v1.FieldGroup"}`) > -1 : false;
        const showDataFieldsLabel = isFieldGroupColumn ? _getShowDataFieldsLabel(name, visualizationPath, converterContext) : false;
        const dataType = getDataFieldDataType(lineItem);
        const sDateInputFormat = dataType === "Edm.Date" ? "YYYY-MM-DD" : undefined;
        const formatOptions = _getDefaultFormatOptionsForTable(getDefaultDraftIndicatorForColumn(name, semanticKeys, isFieldGroupColumn, lineItem));
        let fieldGroupHiddenExpressions;
        if (lineItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_lineItem$Target = lineItem.Target) === null || _lineItem$Target === void 0 ? void 0 : (_lineItem$Target$$tar = _lineItem$Target.$target) === null || _lineItem$Target$$tar === void 0 ? void 0 : _lineItem$Target$$tar.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
          fieldGroupHiddenExpressions = _getFieldGroupHiddenExpressions(lineItem);
        }
        if (_isExportableColumn(lineItem)) {
          //exclude the types listed above for the Export (generates error on Export as PDF)
          exportSettings = {
            template: relatedPropertiesInfo.exportSettingsTemplate,
            wrap: relatedPropertiesInfo.exportSettingsWrapping,
            type: dataType ? _getExportDataType(dataType, relatedPropertyNames.length > 1) : undefined,
            inputFormat: sDateInputFormat,
            delimiter: dataType === "Edm.Int64"
          };
          if (relatedPropertiesInfo.exportUnitName) {
            exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
            exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
          } else if (relatedPropertiesInfo.exportUnitString) {
            exportSettings.unit = relatedPropertiesInfo.exportUnitString;
          }
          if (relatedPropertiesInfo.exportTimezoneName) {
            exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
          } else if (relatedPropertiesInfo.exportTimezoneString) {
            exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
          }
        }
        let propertyTypeConfig;
        if (dataType) {
          propertyTypeConfig = getTypeConfig(lineItem, dataType);
        }
        const typeConfig = {
          className: dataType,
          formatOptions: {
            ...formatOptions,
            ...((_propertyTypeConfig = propertyTypeConfig) === null || _propertyTypeConfig === void 0 ? void 0 : _propertyTypeConfig.formatOptions)
          },
          constraints: {
            ...((_propertyTypeConfig2 = propertyTypeConfig) === null || _propertyTypeConfig2 === void 0 ? void 0 : _propertyTypeConfig2.constraints)
          }
        };
        const visualSettings = {};
        if (!dataType || !typeConfig) {
          // for charts
          visualSettings.widthCalculation = null;
        }
        const isMultiValue = _isColumnMultiValued(lineItem, tableConverterContext);
        const sortable = !isMultiValue && _isColumnSortable(lineItem, relativePath, nonSortableColumns);
        const tableManifestConfig = converterContext.getManifestControlConfiguration(visualizationPath);
        const enableAddCardToInsights = ((_tableManifestConfig$ = tableManifestConfig.tableSettings) === null || _tableManifestConfig$ === void 0 ? void 0 : _tableManifestConfig$.enableAddCardToInsights) ?? true;
        const column = {
          key: KeyHelper.generateKeyFromDataField(lineItem),
          type: ColumnType.Annotation,
          label: sLabel,
          groupLabel: isGroup ? getLabel(lineItem) : undefined,
          group: isGroup ? groupPath : undefined,
          FieldGroupHiddenExpressions: fieldGroupHiddenExpressions,
          annotationPath: converterContext.getEntitySetBasedAnnotationPath(lineItem.fullyQualifiedName),
          semanticObjectPath: semanticObjectAnnotationPath,
          availability: isReferencePropertyStaticallyHidden(lineItem) ? "Hidden" : "Default",
          name: name,
          showDataFieldsLabel: showDataFieldsLabel,
          relativePath: relativePath,
          sortable: sortable,
          propertyInfos: relatedPropertyNames.length ? relatedPropertyNames : undefined,
          additionalPropertyInfos: additionalPropertyNames.length > 0 ? additionalPropertyNames : undefined,
          exportSettings: exportSettings,
          width: ((_lineItem$annotations = lineItem.annotations) === null || _lineItem$annotations === void 0 ? void 0 : (_lineItem$annotations2 = _lineItem$annotations.HTML5) === null || _lineItem$annotations2 === void 0 ? void 0 : (_lineItem$annotations3 = _lineItem$annotations2.CssDefaults) === null || _lineItem$annotations3 === void 0 ? void 0 : (_lineItem$annotations4 = _lineItem$annotations3.width) === null || _lineItem$annotations4 === void 0 ? void 0 : _lineItem$annotations4.valueOf()) || undefined,
          importance: getImportance(lineItem, semanticKeys),
          isNavigable: true,
          formatOptions: formatOptions,
          caseSensitive: isFilteringCaseSensitive(converterContext),
          typeConfig: typeConfig,
          visualSettings: visualSettings,
          timezoneText: (_exportSettings = exportSettings) === null || _exportSettings === void 0 ? void 0 : _exportSettings.timezone,
          isPartOfLineItem: true
        };
        column.isInsightsSupported = enableAddCardToInsights === true && isInsightsEnabled === true && checkIfColumnIsSupportedForInsights(lineItem, sLabel, converterContext, isMultiValue);
        const sTooltip = _getTooltip(lineItem) || sLabel;
        if (sTooltip) {
          column.tooltip = sTooltip;
        }
        if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
          textOnlyColumnsFromTextAnnotation.push(...relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation);
        }
        if (relatedPropertiesInfo.exportDataPointTargetValue && column.exportSettings) {
          column.exportDataPointTargetValue = relatedPropertiesInfo.exportDataPointTargetValue;
          column.exportSettings.type = "String";
        }
        annotationColumns.push(column);

        // Collect information of related columns to be created.
        relatedPropertyNames.forEach(relatedPropertyName => {
          columnsToBeCreated[relatedPropertyName] = relatedPropertiesInfo.properties[relatedPropertyName];

          // In case of a multi-value, related properties cannot be sorted as we go through a 1-n relation
          if (isMultiValue) {
            nonSortableColumns.push(relatedPropertyName);
          }
        });

        // Create columns for additional properties identified for ALP use case.
        additionalPropertyNames.forEach(additionalPropertyName => {
          // Intentional overwrite as we require only one new PropertyInfo for a related Property.
          columnsToBeCreated[additionalPropertyName] = relatedPropertiesInfo.additionalProperties[additionalPropertyName];
        });
      });
    }

    // Get columns from the Properties of EntityType
    return getColumnsFromEntityType(columnsToBeCreated, entityType, annotationColumns, nonSortableColumns, converterContext, tableType, textOnlyColumnsFromTextAnnotation);
  };

  /**
   * Gets the property names from the manifest and checks against existing properties already added by annotations.
   * If a not yet stored property is found it adds it for sorting and filtering only to the annotationColumns.
   *
   * @param properties
   * @param annotationColumns
   * @param converterContext
   * @param entityType
   * @returns The columns from the annotations
   */
  const _getPropertyNames = function (properties, annotationColumns, converterContext, entityType) {
    let matchedProperties;
    if (properties) {
      matchedProperties = properties.map(function (propertyPath) {
        const annotationColumn = annotationColumns.find(function (annotationColumn) {
          return annotationColumn.relativePath === propertyPath && annotationColumn.propertyInfos === undefined;
        });
        if (annotationColumn) {
          return annotationColumn.name;
        } else {
          const relatedColumns = _createRelatedColumns({
            [propertyPath]: entityType.resolvePath(propertyPath)
          }, annotationColumns, [], converterContext, entityType, []);
          annotationColumns.push(relatedColumns[0]);
          return relatedColumns[0].name;
        }
      });
    }
    return matchedProperties;
  };
  const _appendCustomTemplate = function (properties) {
    return properties.map(property => {
      return `{${properties.indexOf(property)}}`;
    }).join(`${"\n"}`);
  };

  /**
   * Returns table column definitions from manifest.
   *
   * These may be custom columns defined in the manifest, slot columns coming through
   * a building block, or annotation columns to overwrite annotation-based columns.
   *
   * @param columns
   * @param annotationColumns
   * @param converterContext
   * @param entityType
   * @param navigationSettings
   * @returns The columns from the manifest
   */
  const getColumnsFromManifest = function (columns, annotationColumns, converterContext, entityType, navigationSettings) {
    const internalColumns = {};
    function isAnnotationColumn(column, key) {
      return annotationColumns.some(annotationColumn => annotationColumn.key === key);
    }
    function isSlotColumn(manifestColumn) {
      return manifestColumn.type === ColumnType.Slot;
    }
    function isCustomColumn(manifestColumn) {
      return manifestColumn.type === undefined && !!manifestColumn.template;
    }
    function _updateLinkedPropertiesOnCustomColumns(propertyInfos, annotationTableColumns) {
      const nonSortableColumns = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
      propertyInfos.forEach(property => {
        annotationTableColumns.forEach(prop => {
          if (prop.name === property) {
            prop.sortable = nonSortableColumns.indexOf(property.replace("Property::", "")) === -1;
            prop.isGroupable = prop.sortable;
          }
        });
      });
    }
    for (const key in columns) {
      var _manifestColumn$posit;
      const manifestColumn = columns[key];
      KeyHelper.validateKey(key);

      // BaseTableColumn
      const baseTableColumn = {
        key: key,
        width: manifestColumn.width || undefined,
        position: {
          anchor: (_manifestColumn$posit = manifestColumn.position) === null || _manifestColumn$posit === void 0 ? void 0 : _manifestColumn$posit.anchor,
          placement: manifestColumn.position === undefined ? Placement.After : manifestColumn.position.placement
        },
        caseSensitive: isFilteringCaseSensitive(converterContext)
      };
      if (isAnnotationColumn(manifestColumn, key)) {
        const propertiesToOverwriteAnnotationColumn = {
          ...baseTableColumn,
          importance: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.importance,
          horizontalAlign: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.horizontalAlign,
          availability: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.availability,
          type: ColumnType.Annotation,
          isNavigable: isAnnotationColumn(manifestColumn, key) ? undefined : isActionNavigable(manifestColumn, navigationSettings, true),
          settings: manifestColumn.settings,
          formatOptions: _getDefaultFormatOptionsForTable(manifestColumn.formatOptions)
        };
        internalColumns[key] = propertiesToOverwriteAnnotationColumn;
      } else {
        var _manifestColumn$heade;
        const propertyInfos = _getPropertyNames(manifestColumn.properties, annotationColumns, converterContext, entityType);
        const baseManifestColumn = {
          ...baseTableColumn,
          header: manifestColumn.header,
          importance: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.importance) || Importance.None,
          horizontalAlign: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.horizontalAlign) || HorizontalAlign.Begin,
          availability: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.availability) || "Default",
          template: manifestColumn.template,
          propertyInfos: propertyInfos,
          exportSettings: propertyInfos ? {
            template: _appendCustomTemplate(propertyInfos),
            wrap: !!(propertyInfos.length > 1)
          } : null,
          id: `CustomColumn::${key}`,
          name: `CustomColumn::${key}`,
          //Needed for MDC:
          formatOptions: {
            textLinesEdit: 4
          },
          isGroupable: false,
          isNavigable: false,
          sortable: false,
          visualSettings: {
            widthCalculation: null
          },
          properties: manifestColumn.properties,
          tooltip: manifestColumn.header
        };
        if ((_manifestColumn$heade = manifestColumn.header) !== null && _manifestColumn$heade !== void 0 && _manifestColumn$heade.startsWith("{metaModel>")) {
          var _manifestColumn$heade2, _manifestColumn$heade3;
          const metaModelPath = (_manifestColumn$heade2 = manifestColumn.header) === null || _manifestColumn$heade2 === void 0 ? void 0 : _manifestColumn$heade2.substring(11, ((_manifestColumn$heade3 = manifestColumn.header) === null || _manifestColumn$heade3 === void 0 ? void 0 : _manifestColumn$heade3.length) - 1);
          try {
            baseManifestColumn.header = converterContext.getEntityTypeAnnotation(metaModelPath).annotation.toString();
          } catch (e) {
            Log.info(`Unable to retrieve text from meta model using path ${metaModelPath}`);
          }
        }
        if (propertyInfos) {
          _updateLinkedPropertiesOnCustomColumns(propertyInfos, annotationColumns);
        }
        if (isSlotColumn(manifestColumn)) {
          const customTableColumn = {
            ...baseManifestColumn,
            type: ColumnType.Slot
          };
          internalColumns[key] = customTableColumn;
        } else if (isCustomColumn(manifestColumn)) {
          const customTableColumn = {
            ...baseManifestColumn,
            type: ColumnType.Default
          };
          internalColumns[key] = customTableColumn;
        } else {
          var _IssueCategoryType$An;
          const message = `The annotation column '${key}' referenced in the manifest is not found`;
          converterContext.getDiagnostics().addIssue(IssueCategory.Manifest, IssueSeverity.Low, message, IssueCategoryType, IssueCategoryType === null || IssueCategoryType === void 0 ? void 0 : (_IssueCategoryType$An = IssueCategoryType.AnnotationColumns) === null || _IssueCategoryType$An === void 0 ? void 0 : _IssueCategoryType$An.InvalidKey);
        }
      }
    }
    return internalColumns;
  };
  function getP13nMode(visualizationPath, converterContext, tableManifestConfiguration) {
    var _tableManifestSetting3;
    const manifestWrapper = converterContext.getManifestWrapper();
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const variantManagement = manifestWrapper.getVariantManagement();
    const aPersonalization = [];
    const isAnalyticalTable = tableManifestConfiguration.type === "AnalyticalTable";
    const isResponsiveTable = tableManifestConfiguration.type === "ResponsiveTable";
    if ((tableManifestSettings === null || tableManifestSettings === void 0 ? void 0 : (_tableManifestSetting3 = tableManifestSettings.tableSettings) === null || _tableManifestSetting3 === void 0 ? void 0 : _tableManifestSetting3.personalization) !== undefined) {
      // Personalization configured in manifest.
      const personalization = tableManifestSettings.tableSettings.personalization;
      if (personalization === true) {
        // Table personalization fully enabled.
        switch (tableManifestConfiguration.type) {
          case "AnalyticalTable":
            return "Sort,Column,Filter,Group,Aggregate";
          case "ResponsiveTable":
            return "Sort,Column,Filter,Group";
          default:
            return "Sort,Column,Filter";
        }
      } else if (typeof personalization === "object") {
        // Specific personalization options enabled in manifest. Use them as is.
        if (personalization.sort) {
          aPersonalization.push("Sort");
        }
        if (personalization.column) {
          aPersonalization.push("Column");
        }
        if (personalization.filter) {
          aPersonalization.push("Filter");
        }
        if (personalization.group && (isAnalyticalTable || isResponsiveTable)) {
          aPersonalization.push("Group");
        }
        if (personalization.aggregate && isAnalyticalTable) {
          aPersonalization.push("Aggregate");
        }
        return aPersonalization.length > 0 ? aPersonalization.join(",") : undefined;
      }
    } else {
      // No personalization configured in manifest.
      aPersonalization.push("Sort");
      aPersonalization.push("Column");
      if (converterContext.getTemplateType() === TemplateType.ListReport) {
        if (variantManagement === VariantManagementType.Control || _isFilterBarHidden(manifestWrapper, converterContext)) {
          // Feature parity with V2.
          // Enable table filtering by default only in case of Control level variant management.
          // Or when the LR filter bar is hidden via manifest setting
          aPersonalization.push("Filter");
        }
      } else {
        aPersonalization.push("Filter");
      }
      if (isAnalyticalTable) {
        aPersonalization.push("Group");
        aPersonalization.push("Aggregate");
      }
      if (isResponsiveTable) {
        aPersonalization.push("Group");
      }
      return aPersonalization.join(",");
    }
    return undefined;
  }

  /**
   * Returns a Boolean value suggesting if a filter bar is being used on the page.
   *
   * Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
   * Until then, hiding filter bar is now allowed if a chart is being used on LR.
   *
   * @param manifestWrapper Manifest settings getter for the page
   * @param converterContext The instance of the converter context
   * @returns Boolean suggesting if a filter bar is being used on the page.
   */
  _exports.getP13nMode = getP13nMode;
  function _isFilterBarHidden(manifestWrapper, converterContext) {
    return manifestWrapper.isFilterBarHidden() && !converterContext.getManifestWrapper().hasMultipleVisualizations() && converterContext.getTemplateType() !== TemplateType.AnalyticalListPage;
  }

  /**
   * Returns a JSON string containing the sort conditions for the presentation variant.
   *
   * @param converterContext The instance of the converter context
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Table columns processed by the converter
   * @returns Sort conditions for a presentation variant.
   */
  function getSortConditions(converterContext, presentationVariantAnnotation, columns) {
    // Currently navigation property is not supported as sorter
    const nonSortableProperties = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
    let sortConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.SortOrder) {
      const sorters = [];
      const conditions = {
        sorters: sorters
      };
      presentationVariantAnnotation.SortOrder.forEach(condition => {
        var _conditionProperty$$t;
        const conditionProperty = condition.Property;
        if (conditionProperty && nonSortableProperties.indexOf((_conditionProperty$$t = conditionProperty.$target) === null || _conditionProperty$$t === void 0 ? void 0 : _conditionProperty$$t.name) === -1) {
          const infoName = convertPropertyPathsToInfoNames([conditionProperty], columns)[0];
          if (infoName) {
            conditions.sorters.push({
              name: infoName,
              descending: !!condition.Descending
            });
          }
        }
      });
      sortConditions = conditions.sorters.length ? JSON.stringify(conditions) : undefined;
    }
    return sortConditions;
  }
  function getInitialExpansionLevel(presentationVariantAnnotation) {
    var _presentationVariantA;
    if (!presentationVariantAnnotation) {
      return undefined;
    }
    const level = (_presentationVariantA = presentationVariantAnnotation.InitialExpansionLevel) === null || _presentationVariantA === void 0 ? void 0 : _presentationVariantA.valueOf();
    return typeof level === "number" ? level : undefined;
  }
  /**
   * Converts an array of propertyPath to an array of propertyInfo names.
   *
   * @param paths the array to be converted
   * @param columns the array of propertyInfos
   * @returns an array of propertyInfo names
   */

  function convertPropertyPathsToInfoNames(paths, columns) {
    const infoNames = [];
    let propertyInfo, annotationColumn;
    paths.forEach(currentPath => {
      if (currentPath !== null && currentPath !== void 0 && currentPath.value) {
        propertyInfo = columns.find(column => {
          annotationColumn = column;
          return !annotationColumn.propertyInfos && annotationColumn.relativePath === (currentPath === null || currentPath === void 0 ? void 0 : currentPath.value);
        });
        if (propertyInfo) {
          infoNames.push(propertyInfo.name);
        }
      }
    });
    return infoNames;
  }

  /**
   * Returns a JSON string containing Presentation Variant group conditions.
   *
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Converter processed table columns
   * @param tableType The table type.
   * @returns Group conditions for a Presentation variant.
   */
  function getGroupConditions(presentationVariantAnnotation, columns, tableType) {
    let groupConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.GroupBy) {
      let aGroupBy = presentationVariantAnnotation.GroupBy;
      if (tableType === "ResponsiveTable") {
        aGroupBy = aGroupBy.slice(0, 1);
      }
      const aGroupLevels = convertPropertyPathsToInfoNames(aGroupBy, columns).map(infoName => {
        return {
          name: infoName
        };
      });
      groupConditions = aGroupLevels.length ? JSON.stringify({
        groupLevels: aGroupLevels
      }) : undefined;
    }
    return groupConditions;
  }
  /**
   * Updates the column's propertyInfos of a analytical table integrating all extensions and binding-relevant property info part.
   *
   * @param tableVisualization The visualization to be updated
   */

  function _updatePropertyInfosWithAggregatesDefinitions(tableVisualization) {
    const relatedAdditionalPropertyNameMap = {};
    tableVisualization.columns.forEach(column => {
      var _column$additionalPro2;
      column = column;
      const aggregatablePropertyName = Object.keys(tableVisualization.aggregates).find(aggregate => aggregate === column.name);
      if (aggregatablePropertyName) {
        const aggregatablePropertyDefinition = tableVisualization.aggregates[aggregatablePropertyName];
        column.aggregatable = true;
        column.extension = {
          customAggregate: aggregatablePropertyDefinition.defaultAggregate ?? {}
        };
      }
      if ((_column$additionalPro2 = column.additionalPropertyInfos) !== null && _column$additionalPro2 !== void 0 && _column$additionalPro2.length) {
        column.additionalPropertyInfos.forEach(additionalPropertyInfo => {
          // Create propertyInfo for each additional property.
          // The new property 'name' has been prefixed with 'Property_Technical::' for uniqueness and it has been named technical property as it requires dedicated MDC attributes (technicallyGroupable and technicallyAggregatable).
          createTechnicalProperty(additionalPropertyInfo, tableVisualization.columns, relatedAdditionalPropertyNameMap);
        });
      }
    });
    tableVisualization.columns.forEach(column => {
      column = column;
      if (column.additionalPropertyInfos) {
        var _column$propertyInfos3;
        column.additionalPropertyInfos = column.additionalPropertyInfos.map(propertyInfo => relatedAdditionalPropertyNameMap[propertyInfo] ?? propertyInfo);
        // Add additional properties to the complex property using the hidden annotation.
        column.propertyInfos = (_column$propertyInfos3 = column.propertyInfos) === null || _column$propertyInfos3 === void 0 ? void 0 : _column$propertyInfos3.concat(column.additionalPropertyInfos);
      }
    });
  }

  /**
   * Returns a JSON string containing Presentation Variant aggregate conditions.
   *
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Converter processed table columns
   * @returns Group conditions for a Presentation variant.
   */
  function getAggregateConditions(presentationVariantAnnotation, columns) {
    let aggregateConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.Total) {
      const aTotals = presentationVariantAnnotation.Total;
      const aggregates = {};
      convertPropertyPathsToInfoNames(aTotals, columns).forEach(infoName => {
        aggregates[infoName] = {};
      });
      aggregateConditions = JSON.stringify(aggregates);
    }
    return aggregateConditions;
  }
  function getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfiguration, columns, presentationVariantAnnotation, viewConfiguration, isInsightsEnabled) {
    var _converterContext$get16, _converterContext$get17, _converterContext$get18;
    // Need to get the target
    const {
      navigationPropertyPath
    } = splitPath(visualizationPath);
    const typeNamePlural = (_converterContext$get16 = converterContext.getDataModelObjectPath().targetEntityType.annotations) === null || _converterContext$get16 === void 0 ? void 0 : (_converterContext$get17 = _converterContext$get16.UI) === null || _converterContext$get17 === void 0 ? void 0 : (_converterContext$get18 = _converterContext$get17.HeaderInfo) === null || _converterContext$get18 === void 0 ? void 0 : _converterContext$get18.TypeNamePlural;
    const title = typeNamePlural && compileExpression(getExpressionFromAnnotation(typeNamePlural));
    const entitySet = converterContext.getDataModelObjectPath().targetEntitySet;
    const pageManifestSettings = converterContext.getManifestWrapper();
    const hasAbsolutePath = navigationPropertyPath.length === 0,
      p13nMode = getP13nMode(visualizationPath, converterContext, tableManifestConfiguration),
      id = navigationPropertyPath ? getTableID(visualizationPath) : getTableID(converterContext.getContextPath(), "LineItem");
    const targetCapabilities = getCapabilityRestriction(converterContext);
    const navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
    const navigationSettings = pageManifestSettings.getNavigationConfiguration(navigationTargetPath);
    const creationBehaviour = _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings, visualizationPath);
    const standardActionsContext = generateStandardActionsContext(converterContext, creationBehaviour.mode, tableManifestConfiguration, viewConfiguration, isInsightsEnabled);
    const deleteButtonVisibilityExpression = getDeleteVisibility(converterContext, standardActionsContext);
    const massEditButtonVisibilityExpression = getMassEditVisibility(converterContext, standardActionsContext);
    const isInsertUpdateTemplated = getInsertUpdateActionsTemplating(standardActionsContext, isDraftOrStickySupported(converterContext));
    const selectionMode = getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, hasAbsolutePath, targetCapabilities, deleteButtonVisibilityExpression, massEditButtonVisibilityExpression);
    let threshold = navigationPropertyPath ? 10 : 30;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.MaxItems) {
      threshold = presentationVariantAnnotation.MaxItems.valueOf();
    }
    const variantManagement = pageManifestSettings.getVariantManagement();
    const isSearchable = isPathSearchable(converterContext.getDataModelObjectPath());
    const standardActions = {
      create: getStandardActionCreate(converterContext, standardActionsContext),
      delete: getStandardActionDelete(converterContext, standardActionsContext),
      paste: getStandardActionPaste(converterContext, standardActionsContext, isInsertUpdateTemplated),
      massEdit: getStandardActionMassEdit(converterContext, standardActionsContext),
      insights: getStandardActionInsights(converterContext, standardActionsContext, visualizationPath),
      creationRow: getCreationRow(converterContext, standardActionsContext)
    };
    return {
      id: id,
      entityName: entitySet ? entitySet.name : "",
      collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      navigationPath: navigationPropertyPath,
      row: _getRowConfigurationProperty(lineItemAnnotation, converterContext, navigationSettings, navigationTargetPath, tableManifestConfiguration.type),
      p13nMode: p13nMode,
      standardActions: {
        actions: standardActions,
        isInsertUpdateTemplated: isInsertUpdateTemplated,
        updatablePropertyPath: getCurrentEntitySetUpdatablePath(converterContext)
      },
      displayMode: isInDisplayMode(converterContext, viewConfiguration),
      create: creationBehaviour,
      selectionMode: selectionMode,
      autoBindOnInit: _isFilterBarHidden(pageManifestSettings, converterContext) || converterContext.getTemplateType() !== TemplateType.ListReport && converterContext.getTemplateType() !== TemplateType.AnalyticalListPage && !(viewConfiguration && pageManifestSettings.hasMultipleVisualizations(viewConfiguration)),
      variantManagement: variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement,
      threshold: threshold,
      sortConditions: getSortConditions(converterContext, presentationVariantAnnotation, columns),
      title: title,
      searchable: tableManifestConfiguration.type !== "AnalyticalTable" && !(isConstant(isSearchable) && isSearchable.value === false),
      initialExpansionLevel: getInitialExpansionLevel(presentationVariantAnnotation)
    };
  }
  _exports.getTableAnnotationConfiguration = getTableAnnotationConfiguration;
  function _getExportDataType(dataType) {
    let isComplexProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let exportDataType = "String";
    if (isComplexProperty) {
      if (dataType === "Edm.DateTimeOffset") {
        exportDataType = "DateTime";
      }
      return exportDataType;
    } else {
      switch (dataType) {
        case "Edm.Decimal":
        case "Edm.Int32":
        case "Edm.Int64":
        case "Edm.Double":
        case "Edm.Byte":
          exportDataType = "Number";
          break;
        case "Edm.DateOfTime":
        case "Edm.Date":
          exportDataType = "Date";
          break;
        case "Edm.DateTimeOffset":
          exportDataType = "DateTime";
          break;
        case "Edm.TimeOfDay":
          exportDataType = "Time";
          break;
        case "Edm.Boolean":
          exportDataType = "Boolean";
          break;
        default:
          exportDataType = "String";
      }
    }
    return exportDataType;
  }

  /**
   * Split the visualization path into the navigation property path and annotation.
   *
   * @param visualizationPath
   * @returns The split path
   */
  function splitPath(visualizationPath) {
    const [targetNavigationPropertyPath, annotationPath] = visualizationPath.split("@");
    let navigationPropertyPath = targetNavigationPropertyPath;
    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }
    return {
      navigationPropertyPath,
      annotationPath
    };
  }
  _exports.splitPath = splitPath;
  function getSelectionVariantConfiguration(selectionVariantPath, converterContext) {
    const resolvedTarget = converterContext.getEntityTypeAnnotation(selectionVariantPath);
    const selection = resolvedTarget.annotation;
    if (selection) {
      var _selection$SelectOpti, _selection$Text;
      const propertyNames = [];
      (_selection$SelectOpti = selection.SelectOptions) === null || _selection$SelectOpti === void 0 ? void 0 : _selection$SelectOpti.forEach(selectOption => {
        const propertyName = selectOption.PropertyName;
        const propertyPath = (propertyName === null || propertyName === void 0 ? void 0 : propertyName.value) ?? "";
        if (propertyNames.indexOf(propertyPath) === -1) {
          propertyNames.push(propertyPath);
        }
      });
      return {
        text: selection === null || selection === void 0 ? void 0 : (_selection$Text = selection.Text) === null || _selection$Text === void 0 ? void 0 : _selection$Text.toString(),
        propertyNames: propertyNames
      };
    }
    return undefined;
  }
  _exports.getSelectionVariantConfiguration = getSelectionVariantConfiguration;
  function _getFullScreenBasedOnDevice(tableSettings, converterContext, isIphone) {
    // If enableFullScreen is not set, use as default true on phone and false otherwise
    let enableFullScreen = tableSettings.enableFullScreen ?? isIphone;
    // Make sure that enableFullScreen is not set on ListReport for desktop or tablet
    if (!isIphone && enableFullScreen && converterContext.getTemplateType() === TemplateType.ListReport) {
      enableFullScreen = false;
      converterContext.getDiagnostics().addIssue(IssueCategory.Manifest, IssueSeverity.Low, IssueType.FULLSCREENMODE_NOT_ON_LISTREPORT);
    }
    return enableFullScreen;
  }
  function _getMultiSelectMode(tableSettings, tableType, converterContext) {
    let multiSelectMode;
    if (tableType !== "ResponsiveTable") {
      return undefined;
    }
    switch (converterContext.getTemplateType()) {
      case TemplateType.ListReport:
      case TemplateType.AnalyticalListPage:
        multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
        break;
      case TemplateType.ObjectPage:
        multiSelectMode = tableSettings.selectAll === false ? "ClearAll" : "Default";
        if (converterContext.getManifestWrapper().useIconTabBar()) {
          multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
        }
        break;
      default:
    }
    return multiSelectMode;
  }
  function _getTableType(tableSettings, aggregationHelper, converterContext) {
    let tableType = (tableSettings === null || tableSettings === void 0 ? void 0 : tableSettings.type) || "ResponsiveTable";
    /*  Now, we keep the configuration in the manifest, even if it leads to errors.
    	We only change if we're not on desktop from Analytical/Tree to Responsive.
     */
    if ((tableType === "AnalyticalTable" || tableType === "TreeTable") && !converterContext.getManifestWrapper().isDesktop()) {
      tableType = "ResponsiveTable";
    }
    return tableType;
  }
  function _getTableMode(tableType, tableSettings, isTemplateListReport) {
    if (tableType !== "ResponsiveTable") {
      if (isTemplateListReport) {
        return {
          rowCountMode: "Auto",
          rowCount: 3
        };
      } else {
        return {
          rowCountMode: tableSettings.rowCountMode ?? "Fixed",
          rowCount: tableSettings.rowCount ? tableSettings.rowCount : 5
        };
      }
    } else {
      return {};
    }
  }
  function _getCondensedTableLayout(_tableType, _tableSettings) {
    return _tableSettings.condensedTableLayout !== undefined && _tableType !== "ResponsiveTable" ? _tableSettings.condensedTableLayout : false;
  }
  function _getTableSelectionLimit(_tableSettings) {
    return _tableSettings.selectAll === true || _tableSettings.selectionLimit === 0 ? 0 : _tableSettings.selectionLimit || 200;
  }
  function _getTableInlineCreationRowCount(_tableSettings) {
    var _tableSettings$creati, _tableSettings$creati2;
    return (_tableSettings$creati = _tableSettings.creationMode) !== null && _tableSettings$creati !== void 0 && _tableSettings$creati.inlineCreationRowCount ? (_tableSettings$creati2 = _tableSettings.creationMode) === null || _tableSettings$creati2 === void 0 ? void 0 : _tableSettings$creati2.inlineCreationRowCount : 2;
  }
  function _getFilters(tableSettings, quickFilterPaths, quickSelectionVariant, path) {
    var _tableSettings$quickV;
    if (quickSelectionVariant) {
      quickFilterPaths.push({
        annotationPath: path.annotationPath
      });
    }
    return {
      quickFilters: {
        showCounts: tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV = tableSettings.quickVariantSelection) === null || _tableSettings$quickV === void 0 ? void 0 : _tableSettings$quickV.showCounts,
        paths: quickFilterPaths
      }
    };
  }
  function _getEnableExport(tableSettings, converterContext, enablePaste) {
    return tableSettings.enableExport !== undefined ? tableSettings.enableExport : converterContext.getTemplateType() !== "ObjectPage" || enablePaste;
  }
  function _getFrozenColumnCount(tableSettings) {
    return tableSettings.frozenColumnCount;
  }
  function _getFilterConfiguration(tableSettings, lineItemAnnotation, converterContext) {
    var _tableSettings$quickV2, _tableSettings$quickV3, _tableSettings$quickV4;
    if (!lineItemAnnotation) {
      return {};
    }
    const quickFilterPaths = [];
    const targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
    let quickSelectionVariant;
    let filters;
    tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV2 = tableSettings.quickVariantSelection) === null || _tableSettings$quickV2 === void 0 ? void 0 : (_tableSettings$quickV3 = _tableSettings$quickV2.paths) === null || _tableSettings$quickV3 === void 0 ? void 0 : _tableSettings$quickV3.forEach(path => {
      quickSelectionVariant = targetEntityType.resolvePath(path.annotationPath);
      filters = _getFilters(tableSettings, quickFilterPaths, quickSelectionVariant, path);
    });
    let hideTableTitle = false;
    hideTableTitle = !!((_tableSettings$quickV4 = tableSettings.quickVariantSelection) !== null && _tableSettings$quickV4 !== void 0 && _tableSettings$quickV4.hideTableTitle);
    return {
      filters: filters,
      headerVisible: !(quickSelectionVariant && hideTableTitle)
    };
  }
  function _getCollectedNavigationPropertyLabels(relativePath, converterContext) {
    const navigationProperties = enhanceDataModelPath(converterContext.getDataModelObjectPath(), relativePath).navigationProperties;
    if ((navigationProperties === null || navigationProperties === void 0 ? void 0 : navigationProperties.length) > 0) {
      const collectedNavigationPropertyLabels = [];
      navigationProperties.forEach(navProperty => {
        collectedNavigationPropertyLabels.push(getLabel(navProperty) || navProperty.name);
      });
      return collectedNavigationPropertyLabels;
    }
  }
  function getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext) {
    var _tableSettings$creati3, _tableSettings$creati4, _tableSettings$creati5, _tableSettings$creati6, _tableSettings$creati7, _tableSettings$creati8, _tableSettings$quickV5, _manifestWrapper$getV;
    let checkCondensedLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    const _manifestWrapper = converterContext.getManifestWrapper();
    const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const tableSettings = tableManifestSettings && tableManifestSettings.tableSettings || {};
    const creationMode = ((_tableSettings$creati3 = tableSettings.creationMode) === null || _tableSettings$creati3 === void 0 ? void 0 : _tableSettings$creati3.name) || CreationMode.NewPage;
    const enableAutoColumnWidth = !_manifestWrapper.isPhone();
    const enablePaste = tableSettings.enablePaste !== undefined ? tableSettings.enablePaste : converterContext.getTemplateType() === "ObjectPage"; // Paste is disabled by default excepted for OP
    const templateType = converterContext.getTemplateType();
    const dataStateIndicatorFilter = templateType === TemplateType.ListReport ? "API.dataStateIndicatorFilter" : undefined;
    const isCondensedTableLayoutCompliant = checkCondensedLayout && _manifestWrapper.isCondensedLayoutCompliant();
    const oFilterConfiguration = _getFilterConfiguration(tableSettings, lineItemAnnotation, converterContext);
    const customValidationFunction = (_tableSettings$creati4 = tableSettings.creationMode) === null || _tableSettings$creati4 === void 0 ? void 0 : _tableSettings$creati4.customValidationFunction;
    const entityType = converterContext.getEntityType();
    const aggregationHelper = new AggregationHelper(entityType, converterContext);
    const tableType = _getTableType(tableSettings, aggregationHelper, converterContext);
    const tableRowMode = _getTableMode(tableType, tableSettings, templateType === TemplateType.ListReport);
    const condensedTableLayout = _getCondensedTableLayout(tableType, tableSettings);
    const oConfiguration = {
      // If no createAtEnd is specified it will be false for Inline create and true otherwise
      createAtEnd: ((_tableSettings$creati5 = tableSettings.creationMode) === null || _tableSettings$creati5 === void 0 ? void 0 : _tableSettings$creati5.createAtEnd) !== undefined ? (_tableSettings$creati6 = tableSettings.creationMode) === null || _tableSettings$creati6 === void 0 ? void 0 : _tableSettings$creati6.createAtEnd : creationMode !== CreationMode.Inline,
      creationMode: creationMode,
      customValidationFunction: customValidationFunction,
      dataStateIndicatorFilter: dataStateIndicatorFilter,
      // if a custom validation function is provided, disableAddRowButtonForEmptyData should not be considered, i.e. set to false
      disableAddRowButtonForEmptyData: !customValidationFunction ? !!((_tableSettings$creati7 = tableSettings.creationMode) !== null && _tableSettings$creati7 !== void 0 && _tableSettings$creati7.disableAddRowButtonForEmptyData) : false,
      enableAutoColumnWidth: enableAutoColumnWidth,
      enableExport: _getEnableExport(tableSettings, converterContext, enablePaste),
      frozenColumnCount: _getFrozenColumnCount(tableSettings),
      enableFullScreen: _getFullScreenBasedOnDevice(tableSettings, converterContext, _manifestWrapper.isPhone()),
      enableMassEdit: tableSettings === null || tableSettings === void 0 ? void 0 : tableSettings.enableMassEdit,
      enableAddCardToInsights: tableSettings === null || tableSettings === void 0 ? void 0 : tableSettings.enableAddCardToInsights,
      enablePaste: enablePaste,
      headerVisible: true,
      multiSelectMode: _getMultiSelectMode(tableSettings, tableType, converterContext),
      selectionLimit: _getTableSelectionLimit(tableSettings),
      inlineCreationRowCount: _getTableInlineCreationRowCount(tableSettings),
      inlineCreationRowsHiddenInEditMode: (tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$creati8 = tableSettings.creationMode) === null || _tableSettings$creati8 === void 0 ? void 0 : _tableSettings$creati8.inlineCreationRowsHiddenInEditMode) ?? false,
      showRowCount: !(tableSettings !== null && tableSettings !== void 0 && (_tableSettings$quickV5 = tableSettings.quickVariantSelection) !== null && _tableSettings$quickV5 !== void 0 && _tableSettings$quickV5.showCounts) && !((_manifestWrapper$getV = _manifestWrapper.getViewConfiguration()) !== null && _manifestWrapper$getV !== void 0 && _manifestWrapper$getV.showCounts),
      type: tableType,
      useCondensedTableLayout: condensedTableLayout && isCondensedTableLayoutCompliant,
      isCompactType: _manifestWrapper.isCompactType()
    };
    const tableConfiguration = {
      ...oConfiguration,
      ...tableRowMode,
      ...oFilterConfiguration
    };
    if (tableType === "TreeTable") {
      tableConfiguration.hierarchyQualifier = tableSettings.hierarchyQualifier;
    }
    return tableConfiguration;
  }
  _exports.getTableManifestConfiguration = getTableManifestConfiguration;
  function getTypeConfig(oProperty, dataType) {
    var _oTargetMapping, _propertyTypeConfig$t, _propertyTypeConfig$t2, _propertyTypeConfig$t3, _propertyTypeConfig$t4;
    let oTargetMapping;
    if (isProperty(oProperty)) {
      oTargetMapping = isTypeDefinition(oProperty.targetType) ? EDM_TYPE_MAPPING[oProperty.targetType.underlyingType] : EDM_TYPE_MAPPING[oProperty.type];
    }
    if (oTargetMapping === undefined && dataType !== undefined) {
      oTargetMapping = EDM_TYPE_MAPPING[dataType];
    }
    const propertyTypeConfig = {
      type: (_oTargetMapping = oTargetMapping) === null || _oTargetMapping === void 0 ? void 0 : _oTargetMapping.type,
      constraints: {},
      formatOptions: {}
    };
    if (isProperty(oProperty) && oTargetMapping !== undefined) {
      var _oTargetMapping$const, _oTargetMapping$const2, _oTargetMapping$const3, _oTargetMapping$const4, _oTargetMapping$const5, _oProperty$annotation8, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oTargetMapping$const6, _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14, _oProperty$annotation15, _oTargetMapping$const7, _oProperty$annotation16, _oProperty$annotation17;
      propertyTypeConfig.constraints = {
        scale: (_oTargetMapping$const = oTargetMapping.constraints) !== null && _oTargetMapping$const !== void 0 && _oTargetMapping$const.$Scale ? oProperty.scale : undefined,
        precision: (_oTargetMapping$const2 = oTargetMapping.constraints) !== null && _oTargetMapping$const2 !== void 0 && _oTargetMapping$const2.$Precision ? oProperty.precision : undefined,
        maxLength: (_oTargetMapping$const3 = oTargetMapping.constraints) !== null && _oTargetMapping$const3 !== void 0 && _oTargetMapping$const3.$MaxLength ? oProperty.maxLength : undefined,
        nullable: (_oTargetMapping$const4 = oTargetMapping.constraints) !== null && _oTargetMapping$const4 !== void 0 && _oTargetMapping$const4.$Nullable ? oProperty.nullable : undefined,
        minimum: (_oTargetMapping$const5 = oTargetMapping.constraints) !== null && _oTargetMapping$const5 !== void 0 && _oTargetMapping$const5["@Org.OData.Validation.V1.Minimum/$Decimal"] && !isNaN((_oProperty$annotation8 = oProperty.annotations) === null || _oProperty$annotation8 === void 0 ? void 0 : (_oProperty$annotation9 = _oProperty$annotation8.Validation) === null || _oProperty$annotation9 === void 0 ? void 0 : _oProperty$annotation9.Minimum) ? `${(_oProperty$annotation10 = oProperty.annotations) === null || _oProperty$annotation10 === void 0 ? void 0 : (_oProperty$annotation11 = _oProperty$annotation10.Validation) === null || _oProperty$annotation11 === void 0 ? void 0 : _oProperty$annotation11.Minimum}` : undefined,
        maximum: (_oTargetMapping$const6 = oTargetMapping.constraints) !== null && _oTargetMapping$const6 !== void 0 && _oTargetMapping$const6["@Org.OData.Validation.V1.Maximum/$Decimal"] && !isNaN((_oProperty$annotation12 = oProperty.annotations) === null || _oProperty$annotation12 === void 0 ? void 0 : (_oProperty$annotation13 = _oProperty$annotation12.Validation) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.Maximum) ? `${(_oProperty$annotation14 = oProperty.annotations) === null || _oProperty$annotation14 === void 0 ? void 0 : (_oProperty$annotation15 = _oProperty$annotation14.Validation) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Maximum}` : undefined,
        isDigitSequence: propertyTypeConfig.type === "sap.ui.model.odata.type.String" && (_oTargetMapping$const7 = oTargetMapping.constraints) !== null && _oTargetMapping$const7 !== void 0 && _oTargetMapping$const7[`@${"com.sap.vocabularies.Common.v1.IsDigitSequence"}`] && (_oProperty$annotation16 = oProperty.annotations) !== null && _oProperty$annotation16 !== void 0 && (_oProperty$annotation17 = _oProperty$annotation16.Common) !== null && _oProperty$annotation17 !== void 0 && _oProperty$annotation17.IsDigitSequence ? true : undefined
      };
    }
    propertyTypeConfig.formatOptions = {
      parseAsString: (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t = propertyTypeConfig.type) === null || _propertyTypeConfig$t === void 0 ? void 0 : _propertyTypeConfig$t.indexOf("sap.ui.model.odata.type.Int")) === 0 || (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t2 = propertyTypeConfig.type) === null || _propertyTypeConfig$t2 === void 0 ? void 0 : _propertyTypeConfig$t2.indexOf("sap.ui.model.odata.type.Double")) === 0 ? false : undefined,
      emptyString: (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t3 = propertyTypeConfig.type) === null || _propertyTypeConfig$t3 === void 0 ? void 0 : _propertyTypeConfig$t3.indexOf("sap.ui.model.odata.type.Int")) === 0 || (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t4 = propertyTypeConfig.type) === null || _propertyTypeConfig$t4 === void 0 ? void 0 : _propertyTypeConfig$t4.indexOf("sap.ui.model.odata.type.Double")) === 0 ? "" : undefined,
      parseKeepsEmptyString: propertyTypeConfig.type === "sap.ui.model.odata.type.String" ? true : undefined
    };
    return propertyTypeConfig;
  }
  _exports.getTypeConfig = getTypeConfig;
  return {
    getTableActions,
    getTableColumns,
    getColumnsFromEntityType,
    updateLinkedProperties,
    createTableVisualization,
    createDefaultTableVisualization,
    getCapabilityRestriction,
    getSelectionMode,
    getRowStatusVisibility,
    getImportance,
    getP13nMode,
    getTableAnnotationConfiguration,
    isFilteringCaseSensitive,
    splitPath,
    getSelectionVariantConfiguration,
    getTableManifestConfiguration,
    getTypeConfig,
    updateTableVisualizationForType
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2x1bW5UeXBlIiwiZ2V0VGFibGVBY3Rpb25zIiwibGluZUl0ZW1Bbm5vdGF0aW9uIiwidmlzdWFsaXphdGlvblBhdGgiLCJjb252ZXJ0ZXJDb250ZXh0IiwibmF2aWdhdGlvblNldHRpbmdzIiwiYVRhYmxlQWN0aW9ucyIsImdldFRhYmxlQW5ub3RhdGlvbkFjdGlvbnMiLCJhQW5ub3RhdGlvbkFjdGlvbnMiLCJ0YWJsZUFjdGlvbnMiLCJhSGlkZGVuQWN0aW9ucyIsImhpZGRlblRhYmxlQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uIiwiYWN0aW9ucyIsImFjdGlvbk92ZXJ3cml0ZUNvbmZpZyIsImlzTmF2aWdhYmxlIiwiT3ZlcnJpZGVUeXBlIiwib3ZlcndyaXRlIiwiZW5hYmxlT25TZWxlY3QiLCJlbmFibGVBdXRvU2Nyb2xsIiwiZW5hYmxlZCIsInZpc2libGUiLCJkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24iLCJjb21tYW5kIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJjb21tYW5kQWN0aW9ucyIsImdldFRhYmxlQ29sdW1ucyIsImlzSW5zaWdodHNFbmFibGVkIiwiYW5ub3RhdGlvbkNvbHVtbnMiLCJnZXRDb2x1bW5zRnJvbUFubm90YXRpb25zIiwibWFuaWZlc3RDb2x1bW5zIiwiZ2V0Q29sdW1uc0Zyb21NYW5pZmVzdCIsImNvbHVtbnMiLCJnZXRBbm5vdGF0aW9uRW50aXR5VHlwZSIsIndpZHRoIiwiaW1wb3J0YW5jZSIsImhvcml6b250YWxBbGlnbiIsImF2YWlsYWJpbGl0eSIsInNldHRpbmdzIiwiZm9ybWF0T3B0aW9ucyIsImdldEFnZ3JlZ2F0ZURlZmluaXRpb25zRnJvbUVudGl0eVR5cGUiLCJlbnRpdHlUeXBlIiwidGFibGVDb2x1bW5zIiwiYWdncmVnYXRpb25IZWxwZXIiLCJBZ2dyZWdhdGlvbkhlbHBlciIsImZpbmRDb2x1bW5Gcm9tUGF0aCIsInBhdGgiLCJmaW5kIiwiY29sdW1uIiwiYW5ub3RhdGlvbkNvbHVtbiIsInByb3BlcnR5SW5mb3MiLCJ1bmRlZmluZWQiLCJyZWxhdGl2ZVBhdGgiLCJpc0FuYWx5dGljc1N1cHBvcnRlZCIsImN1cnJlbmN5T3JVbml0UHJvcGVydGllcyIsIlNldCIsImZvckVhY2giLCJ0YWJsZUNvbHVtbiIsInVuaXQiLCJhZGQiLCJjdXN0b21BZ2dyZWdhdGVBbm5vdGF0aW9ucyIsImdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zIiwiZGVmaW5pdGlvbnMiLCJhbm5vdGF0aW9uIiwiYWdncmVnYXRlZFByb3BlcnR5IiwiX2VudGl0eVR5cGUiLCJlbnRpdHlQcm9wZXJ0aWVzIiwicHJvcGVydHkiLCJuYW1lIiwicXVhbGlmaWVyIiwiY29udGV4dERlZmluaW5nUHJvcGVydGllcyIsImFubm90YXRpb25zIiwiQWdncmVnYXRpb24iLCJDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzIiwibWFwIiwiY3R4RGVmUHJvcGVydHkiLCJ2YWx1ZSIsInJlc3VsdCIsInJhd0NvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMiLCJoYXMiLCJkZWZhdWx0QWdncmVnYXRlIiwiY29udGV4dERlZmluaW5nUHJvcGVydHlOYW1lIiwiZm91bmRDb2x1bW4iLCJwdXNoIiwibGVuZ3RoIiwidXBkYXRlVGFibGVWaXN1YWxpemF0aW9uRm9yVHlwZSIsInRhYmxlVmlzdWFsaXphdGlvbiIsInByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uIiwiY29udHJvbCIsInR5cGUiLCJhZ2dyZWdhdGVzRGVmaW5pdGlvbnMiLCJlbmFibGVBbmFseXRpY3MiLCJlbmFibGUkc2VsZWN0IiwiZW5hYmxlJCRnZXRLZWVwQWxpdmVDb250ZXh0IiwiYWdncmVnYXRlcyIsIl91cGRhdGVQcm9wZXJ0eUluZm9zV2l0aEFnZ3JlZ2F0ZXNEZWZpbml0aW9ucyIsImFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMiLCJnZXRBbGxvd2VkVHJhbnNmb3JtYXRpb25zIiwiZW5hYmxlQmFzaWNTZWFyY2giLCJpbmRleE9mIiwiZ3JvdXBDb25kaXRpb25zIiwiZ2V0R3JvdXBDb25kaXRpb25zIiwiYWdncmVnYXRlQ29uZGl0aW9ucyIsImdldEFnZ3JlZ2F0ZUNvbmRpdGlvbnMiLCJpbmNsdWRlcyIsImdldE5hdmlnYXRpb25UYXJnZXRQYXRoIiwibmF2aWdhdGlvblByb3BlcnR5UGF0aCIsIm1hbmlmZXN0V3JhcHBlciIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uIiwibmF2Q29uZmlnIiwiT2JqZWN0Iiwia2V5cyIsImRhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwiY29udGV4dFBhdGgiLCJnZXRDb250ZXh0UGF0aCIsIm5hdkNvbmZpZ0ZvckNvbnRleHRQYXRoIiwidGFyZ2V0RW50aXR5U2V0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJ1cGRhdGVMaW5rZWRQcm9wZXJ0aWVzIiwiZmluZENvbHVtbkJ5UGF0aCIsIm9Db2x1bW4iLCJvVGFibGVDb2x1bW4iLCJvUHJvcGVydHkiLCJvUHJvcCIsIm9Vbml0IiwiZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5Iiwib1RpbWV6b25lIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkiLCJzVGltZXpvbmUiLCJDb21tb24iLCJUaW1lem9uZSIsIm9Vbml0Q29sdW1uIiwic1VuaXQiLCJNZWFzdXJlcyIsIklTT0N1cnJlbmN5IiwiVW5pdCIsInVuaXRUZXh0Iiwib1RpbWV6b25lQ29sdW1uIiwidGltZXpvbmUiLCJ0aW1lem9uZVRleHQiLCJ0b1N0cmluZyIsImRpc3BsYXlNb2RlIiwiZ2V0RGlzcGxheU1vZGUiLCJ0ZXh0QW5ub3RhdGlvbiIsIlRleHQiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsIm9UZXh0Q29sdW1uIiwidGV4dEFycmFuZ2VtZW50IiwidGV4dFByb3BlcnR5IiwibW9kZSIsImdldFNlbWFudGljS2V5c0FuZFRpdGxlSW5mbyIsImhlYWRlckluZm9UaXRsZVBhdGgiLCJVSSIsIkhlYWRlckluZm8iLCJUaXRsZSIsIlZhbHVlIiwic2VtYW50aWNLZXlBbm5vdGF0aW9ucyIsIlNlbWFudGljS2V5IiwiaGVhZGVySW5mb1R5cGVOYW1lIiwiVHlwZU5hbWUiLCJzZW1hbnRpY0tleUNvbHVtbnMiLCJjcmVhdGVUYWJsZVZpc3VhbGl6YXRpb24iLCJpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50Iiwidmlld0NvbmZpZ3VyYXRpb24iLCJ0YWJsZU1hbmlmZXN0Q29uZmlnIiwiZ2V0VGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24iLCJzcGxpdFBhdGgiLCJuYXZpZ2F0aW9uVGFyZ2V0UGF0aCIsIm9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsInNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZSIsIm9WaXN1YWxpemF0aW9uIiwiVmlzdWFsaXphdGlvblR5cGUiLCJUYWJsZSIsImdldFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24iLCJyZW1vdmVEdXBsaWNhdGVBY3Rpb25zIiwiSlNPTiIsInN0cmluZ2lmeSIsIm9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMiLCJnZXRPcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzIiwiaGVhZGVySW5mb1RpdGxlIiwic2VtYW50aWNLZXlzIiwiY3JlYXRlRGVmYXVsdFRhYmxlVmlzdWFsaXphdGlvbiIsImlzQmxhbmtUYWJsZSIsImdldENvbHVtbnNGcm9tRW50aXR5VHlwZSIsImdldEVudGl0eVR5cGUiLCJBY3Rpb25IZWxwZXIiLCJnZXRDdXJyZW50RW50aXR5U2V0VXBkYXRhYmxlUGF0aCIsInJlc3RyaWN0aW9ucyIsImdldFJlc3RyaWN0aW9ucyIsImVudGl0eVNldCIsImdldEVudGl0eVNldCIsInVwZGF0YWJsZSIsImlzVXBkYXRhYmxlIiwiaXNPbmx5RHluYW1pY09uQ3VycmVudEVudGl0eSIsImlzQ29uc3RhbnQiLCJleHByZXNzaW9uIiwibmF2aWdhdGlvbkV4cHJlc3Npb24iLCJfdHlwZSIsInVwZGF0YWJsZUV4cHJlc3Npb24iLCJDYXBhYmlsaXRpZXMiLCJVcGRhdGVSZXN0cmljdGlvbnMiLCJVcGRhdGFibGUiLCJ1cGRhdGFibGVQcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0aWVzIiwiYWN0aW9uTmFtZSIsInByb3BlcnR5TmFtZSIsInNpemUiLCJ0aXRsZVByb3BlcnR5IiwiQXJyYXkiLCJmcm9tIiwiam9pbiIsImdldFVJSGlkZGVuRXhwRm9yQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQiLCJjdXJyZW50RW50aXR5VHlwZSIsImNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoIiwiaXNFbnRpdHlTZXQiLCJhVWlIaWRkZW5QYXRoRXhwcmVzc2lvbnMiLCJkYXRhRmllbGQiLCIkVHlwZSIsIkFjdGlvblRhcmdldCIsImlzQm91bmQiLCJzb3VyY2VFbnRpdHlUeXBlIiwiUmVxdWlyZXNDb250ZXh0IiwiSW5saW5lIiwidmFsdWVPZiIsIkhpZGRlbiIsImVxdWFsIiwiZ2V0QmluZGluZ0V4cEZyb21Db250ZXh0Iiwic291cmNlIiwic0V4cHJlc3Npb24iLCJzUGF0aCIsInN1YnN0cmluZyIsImFTcGxpdFBhdGgiLCJzcGxpdCIsInNOYXZpZ2F0aW9uUGF0aCIsImlzTmF2aWdhdGlvblByb3BlcnR5IiwidGFyZ2V0T2JqZWN0IiwicGFydG5lciIsInBhdGhJbk1vZGVsIiwic2xpY2UiLCJjb25zdGFudCIsInVwZGF0ZU1hbmlmZXN0QWN0aW9uQW5kVGFnSXQiLCJkYXRhRmllbGRJZCIsInNvbWUiLCJhY3Rpb25LZXkiLCJyZXF1aXJlc1NlbGVjdGlvbiIsImhhc0JvdW5kQWN0aW9uc0Fsd2F5c1Zpc2libGVJblRvb2xCYXIiLCJtYW5pZmVzdEFjdGlvbklkIiwiZ2VuZXJhdGUiLCJBY3Rpb24iLCJTZW1hbnRpY09iamVjdCIsImhhc0N1c3RvbUFjdGlvbnNBbHdheXNWaXNpYmxlSW5Ub29sQmFyIiwiYWN0aW9uIiwiZ2V0VmlzaWJsZUV4cEZvckN1c3RvbUFjdGlvbnNSZXF1aXJpbmdDb250ZXh0IiwiYVZpc2libGVQYXRoRXhwcmVzc2lvbnMiLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsImdldENhcGFiaWxpdHlSZXN0cmljdGlvbiIsImlzRGVsZXRhYmxlIiwiaXNQYXRoRGVsZXRhYmxlIiwiaXNQYXRoVXBkYXRhYmxlIiwiZ2V0U2VsZWN0aW9uTW9kZSIsInRhcmdldENhcGFiaWxpdGllcyIsImRlbGV0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uIiwibWFzc0VkaXRWaXNpYmlsaXR5RXhwcmVzc2lvbiIsInRhYmxlTWFuaWZlc3RTZXR0aW5ncyIsInNlbGVjdGlvbk1vZGUiLCJ0YWJsZVNldHRpbmdzIiwiU2VsZWN0aW9uTW9kZSIsIk5vbmUiLCJhSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zIiwiYVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbnMiLCJpc1BhcmVudERlbGV0YWJsZSIsInBhcmVudEVudGl0eVNldERlbGV0YWJsZSIsImdldFRlbXBsYXRlVHlwZSIsIlRlbXBsYXRlVHlwZSIsIk9iamVjdFBhZ2UiLCJjb21waWxlRXhwcmVzc2lvbiIsImJNYXNzRWRpdEVuYWJsZWQiLCJBdXRvIiwiTXVsdGkiLCJTaW5nbGUiLCJidXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiIsIm9yIiwiaWZFbHNlIiwiYW5kIiwiSXNFZGl0YWJsZSIsImVkaXRNb2RlYnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24iLCJjb25jYXQiLCJjb3B5RGF0YUZpZWxkIiwiZ2V0Q29weUFjdGlvbiIsImZpbHRlciIsImRhdGFGaWVsZElzQ29weUFjdGlvbiIsInNFbnRpdHlUeXBlIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiQWN0aW9uVHlwZSIsIkNvcHkiLCJhbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJrZXkiLCJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCJub3QiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJnZXRSZWxhdGl2ZU1vZGVsUGF0aEZ1bmN0aW9uIiwidGV4dCIsIkxhYmVsIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImdldFRleHQiLCJEZWZhdWx0IiwiaXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdCIsIkRldGVybWluaW5nIiwidXNlRW5hYmxlZEV4cHJlc3Npb24iLCJPcGVyYXRpb25BdmFpbGFibGUiLCJzb3VyY2VUeXBlIiwicGFyYW1ldGVycyIsImlzQ29sbGVjdGlvbiIsInRhYmxlQWN0aW9uIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24iLCJEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJnZXRIaWdobGlnaHRSb3dCaW5kaW5nIiwiY3JpdGljYWxpdHlBbm5vdGF0aW9uIiwiaXNEcmFmdFJvb3RPck5vZGUiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiZGVmYXVsdEhpZ2hsaWdodFJvd0RlZmluaXRpb24iLCJNZXNzYWdlVHlwZSIsImdldE1lc3NhZ2VUeXBlRnJvbUNyaXRpY2FsaXR5VHlwZSIsImFNaXNzaW5nS2V5cyIsImZvcm1hdFJlc3VsdCIsIkVudGl0eSIsIkhhc0FjdGl2ZSIsIklzQWN0aXZlIiwidGFibGVGb3JtYXR0ZXJzIiwicm93SGlnaGxpZ2h0aW5nIiwiX2dldENyZWF0aW9uQmVoYXZpb3VyIiwidGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24iLCJuYXZpZ2F0aW9uIiwiY3JlYXRlIiwiZGV0YWlsIiwib3JpZ2luYWxUYWJsZVNldHRpbmdzIiwib3V0Ym91bmQiLCJvdXRib3VuZERldGFpbCIsIm5ld0FjdGlvbiIsInRhcmdldEFubm90YXRpb25zIiwidGFyZ2V0QW5ub3RhdGlvbnNDb21tb24iLCJ0YXJnZXRBbm5vdGF0aW9uc1Nlc3Npb24iLCJTZXNzaW9uIiwiRHJhZnRSb290IiwiTmV3QWN0aW9uIiwiU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsImNyZWF0aW9uTW9kZSIsIkNyZWF0aW9uTW9kZSIsIkNyZWF0aW9uUm93IiwiRXJyb3IiLCJyb3V0ZSIsImFwcGVuZCIsImNyZWF0ZUF0RW5kIiwibmF2aWdhdGVUb1RhcmdldCIsIk5ld1BhZ2UiLCJfZ2V0Um93Q29uZmlndXJhdGlvblByb3BlcnR5IiwidGFyZ2V0UGF0aCIsInRhYmxlVHlwZSIsInByZXNzUHJvcGVydHkiLCJuYXZpZ2F0aW9uVGFyZ2V0IiwiY3JpdGljYWxpdHlQcm9wZXJ0eSIsImRpc3BsYXkiLCJ0YXJnZXQiLCJDcml0aWNhbGl0eSIsIk1vZGVsSGVscGVyIiwiZ2V0RHJhZnRSb290IiwiZ2V0RHJhZnROb2RlIiwicm93TmF2aWdhdGVkRXhwcmVzc2lvbiIsIm5hdmlnYXRlZFJvdyIsInByZXNzIiwicm93TmF2aWdhdGVkIiwiSXNJbmFjdGl2ZSIsImNvbHVtbnNUb0JlQ3JlYXRlZCIsIm5vblNvcnRhYmxlQ29sdW1ucyIsInRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiIsImV4aXN0cyIsInRhcmdldFR5cGUiLCJyZWxhdGVkUHJvcGVydGllc0luZm8iLCJjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMiLCJyZWxhdGVkUHJvcGVydHlOYW1lcyIsImFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzIiwiYWRkaXRpb25hbFByb3BlcnRpZXMiLCJ0ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24iLCJjb2x1bW5JbmZvIiwiZ2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eSIsImV4cG9ydFNldHRpbmdzIiwidGVtcGxhdGUiLCJleHBvcnRTZXR0aW5nc1RlbXBsYXRlIiwid3JhcCIsImV4cG9ydFNldHRpbmdzV3JhcHBpbmciLCJfZ2V0RXhwb3J0RGF0YVR5cGUiLCJleHBvcnRVbml0TmFtZSIsInVuaXRQcm9wZXJ0eSIsImV4cG9ydFVuaXRTdHJpbmciLCJleHBvcnRUaW1lem9uZU5hbWUiLCJ0aW1lem9uZVByb3BlcnR5IiwidXRjIiwiZXhwb3J0VGltZXpvbmVTdHJpbmciLCJleHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSIsImFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zIiwicmVsYXRlZENvbHVtbnMiLCJfY3JlYXRlUmVsYXRlZENvbHVtbnMiLCJmdWxsUHJvcGVydHlQYXRoIiwidXNlRGF0YUZpZWxkUHJlZml4IiwiYXZhaWxhYmxlRm9yQWRhcHRhdGlvbiIsInJlcGxhY2VTcGVjaWFsQ2hhcnMiLCJzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoIiwiZ2V0U2VtYW50aWNPYmplY3RQYXRoIiwiaXNIaWRkZW4iLCJncm91cFBhdGgiLCJfc2xpY2VBdFNsYXNoIiwiaXNHcm91cCIsImV4cG9ydFR5cGUiLCJzRGF0ZUlucHV0Rm9ybWF0IiwiZGF0YVR5cGUiLCJnZXREYXRhRmllbGREYXRhVHlwZSIsInByb3BlcnR5VHlwZUNvbmZpZyIsImdldFR5cGVDb25maWciLCJnZXRBbm5vdGF0aW9uc0J5VGVybSIsImlzQVByb3BlcnR5RnJvbVRleHRPbmx5QW5ub3RhdGlvbiIsInNvcnRhYmxlIiwidHlwZUNvbmZpZyIsImNsYXNzTmFtZSIsImNvbnN0cmFpbnRzIiwiX2lzRXhwb3J0YWJsZUNvbHVtbiIsImlucHV0Rm9ybWF0Iiwic2NhbGUiLCJkZWxpbWl0ZXIiLCJjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHMiLCJfZ2V0Q29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzIiwiQW5ub3RhdGlvbiIsImxhYmVsIiwiZ2V0TGFiZWwiLCJncm91cExhYmVsIiwiZ3JvdXAiLCJzZW1hbnRpY09iamVjdFBhdGgiLCJpc0dyb3VwYWJsZSIsImlzUHJvcGVydHlHcm91cGFibGUiLCJpc0tleSIsImNhc2VTZW5zaXRpdmUiLCJpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUiLCJnZXRJbXBvcnRhbmNlIiwiRGF0YUZpZWxkRGVmYXVsdCIsImFkZGl0aW9uYWxMYWJlbHMiLCJzVG9vbHRpcCIsIl9nZXRUb29sdGlwIiwidG9vbHRpcCIsInRhcmdldFZhbHVlZnJvbURQIiwiZ2V0VGFyZ2V0VmFsdWVPbkRhdGFQb2ludCIsImlzRGF0YVBvaW50RnJvbURhdGFGaWVsZERlZmF1bHQiLCJwcm9wZXJ0eVR5cGUiLCJkYXRhRmllbGREZWZhdWx0UHJvcGVydHkiLCJpc1Byb3BlcnR5IiwiaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4iLCJUYXJnZXQiLCIkdGFyZ2V0IiwiTWVkaWFUeXBlIiwidGVybSIsImlzVVJMIiwiX2lzVmFsaWRDb2x1bW4iLCJfZ2V0VmlzaWJsZUV4cHJlc3Npb24iLCJkYXRhRmllbGRNb2RlbFBhdGgiLCJwcm9wZXJ0eVZhbHVlIiwiaXNBbmFseXRpY2FsR3JvdXBIZWFkZXJFeHBhbmRlZCIsImlzQW5hbHl0aWNhbExlYWYiLCJfZ2V0RmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zIiwiZGF0YUZpZWxkR3JvdXAiLCJmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMiLCJEYXRhIiwiaW5uZXJEYXRhRmllbGQiLCJkYXRhRmllbGREZWZhdWx0IiwiaXNEYXRhRmllbGRUeXBlcyIsIlF1aWNrSW5mbyIsImRhdGFwb2ludFRhcmdldCIsImdldFJvd1N0YXR1c1Zpc2liaWxpdHkiLCJjb2xOYW1lIiwiaXNTZW1hbnRpY0tleUluRmllbGRHcm91cCIsImdldEVycm9yU3RhdHVzVGV4dFZpc2liaWxpdHlGb3JtYXR0ZXIiLCJleGlzdGluZ0NvbHVtbnMiLCJyZWxhdGVkUHJvcGVydHlOYW1lTWFwIiwiZ2V0QWJzb2x1dGVBbm5vdGF0aW9uUGF0aCIsInJlbGF0ZWRDb2x1bW4iLCJpc1BhcnRPZkxpbmVJdGVtIiwiZXhpc3RpbmdDb2x1bW4iLCJuZXdOYW1lIiwicHJvcGVydHlJbmZvIiwiX2dldEFubm90YXRpb25Db2x1bW5OYW1lIiwiY3JlYXRlVGVjaG5pY2FsUHJvcGVydHkiLCJyZWxhdGVkQWRkaXRpb25hbFByb3BlcnR5TmFtZU1hcCIsImNvbHVtbkV4aXN0cyIsImFkZGl0aW9uYWxQcm9wZXJ0eSIsInRlY2huaWNhbENvbHVtbiIsImFnZ3JlZ2F0YWJsZSIsImV4dGVuc2lvbiIsInRlY2huaWNhbGx5R3JvdXBhYmxlIiwidGVjaG5pY2FsbHlBZ2dyZWdhdGFibGUiLCJfZ2V0U2hvd0RhdGFGaWVsZHNMYWJlbCIsImZpZWxkR3JvdXBOYW1lIiwib0NvbHVtbnMiLCJhQ29sdW1uS2V5cyIsInNob3dEYXRhRmllbGRzTGFiZWwiLCJfZ2V0UmVsYXRpdmVQYXRoIiwiaXNMYXN0U2xhc2giLCJpc0xhc3RQYXJ0IiwiaVNsYXNoSW5kZXgiLCJsYXN0SW5kZXhPZiIsIl9pc0NvbHVtbk11bHRpVmFsdWVkIiwicHJvcGVydHlPYmplY3RQYXRoIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJpc011bHRpVmFsdWVGaWVsZCIsIl9pc0NvbHVtblNvcnRhYmxlIiwicHJvcGVydHlQYXRoIiwiZmlsdGVyRnVuY3Rpb25zIiwiX2dldEZpbHRlckZ1bmN0aW9ucyIsImlzQXJyYXkiLCJDb252ZXJ0ZXJDb250ZXh0IiwiVHlwZUd1YXJkcyIsIkZpbHRlckZ1bmN0aW9ucyIsImdldEVudGl0eUNvbnRhaW5lciIsIl9nZXREZWZhdWx0Rm9ybWF0T3B0aW9uc0ZvclRhYmxlIiwidGV4dExpbmVzRWRpdCIsIl9maW5kU2VtYW50aWNLZXlWYWx1ZXMiLCJhU2VtYW50aWNLZXlWYWx1ZXMiLCJiU2VtYW50aWNLZXlGb3VuZCIsImkiLCJ2YWx1ZXMiLCJzZW1hbnRpY0tleUZvdW5kIiwiX2ZpbmRQcm9wZXJ0aWVzIiwic2VtYW50aWNLZXlWYWx1ZXMiLCJmaWVsZEdyb3VwUHJvcGVydGllcyIsInNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXAiLCJzUHJvcGVydHlQYXRoIiwidG1wIiwiZmllbGRHcm91cFByb3BlcnR5UGF0aCIsIl9maW5kU2VtYW50aWNLZXlWYWx1ZXNJbkZpZWxkR3JvdXAiLCJhUHJvcGVydGllcyIsIl9wcm9wZXJ0aWVzRm91bmQiLCJnZXREZWZhdWx0RHJhZnRJbmRpY2F0b3JGb3JDb2x1bW4iLCJpc0ZpZWxkR3JvdXBDb2x1bW4iLCJzZW1hbnRpY0tleSIsInNlbWFudGljS2V5SW5GaWVsZEdyb3VwIiwiZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoIiwic2hvd0Vycm9yT2JqZWN0U3RhdHVzIiwiaGFzRHJhZnRJbmRpY2F0b3IiLCJfZ2V0SW1wTnVtYmVyIiwiSW1wb3J0YW5jZSIsIl9nZXREYXRhRmllbGRJbXBvcnRhbmNlIiwiX2dldE1heEltcG9ydGFuY2UiLCJmaWVsZHMiLCJtYXhJbXBOdW1iZXIiLCJpbXBOdW1iZXIiLCJEYXRhRmllbGRXaXRoTWF4SW1wb3J0YW5jZSIsImZpZWxkIiwiZmllbGRzV2l0aEltcG9ydGFuY2UiLCJtYXBTZW1hbnRpY0tleXMiLCJpc0Fubm90YXRpb25PZlR5cGUiLCJkYXRhRmllbGRUYXJnZXQiLCJmaWVsZEdyb3VwRGF0YSIsImZpZWxkR3JvdXBIYXNTZW1hbnRpY0tleSIsImZpZWxkR3JvdXBEYXRhRmllbGQiLCJIaWdoIiwiaXRlbSIsImNoZWNrSWZDb2x1bW5Jc1N1cHBvcnRlZEZvckluc2lnaHRzIiwic0xhYmVsIiwiaXNNdWx0aVZhbHVlIiwiaXNJbWFnZUNvbHVtbiIsImlzSW1hZ2VVUkwiLCJnZXROb25Tb3J0YWJsZVByb3BlcnRpZXNSZXN0cmljdGlvbnMiLCJ0YWJsZUNvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsImxpbmVJdGVtIiwiY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzUmVjdXJzaXZlbHkiLCJ2aXN1YWxTZXR0aW5ncyIsIndpZHRoQ2FsY3VsYXRpb24iLCJlbmFibGVBZGRDYXJkVG9JbnNpZ2h0cyIsIkZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyIsIkhUTUw1IiwiQ3NzRGVmYXVsdHMiLCJpc0luc2lnaHRzU3VwcG9ydGVkIiwicmVsYXRlZFByb3BlcnR5TmFtZSIsImFkZGl0aW9uYWxQcm9wZXJ0eU5hbWUiLCJfZ2V0UHJvcGVydHlOYW1lcyIsIm1hdGNoZWRQcm9wZXJ0aWVzIiwicmVzb2x2ZVBhdGgiLCJfYXBwZW5kQ3VzdG9tVGVtcGxhdGUiLCJpbnRlcm5hbENvbHVtbnMiLCJpc0Fubm90YXRpb25Db2x1bW4iLCJpc1Nsb3RDb2x1bW4iLCJtYW5pZmVzdENvbHVtbiIsIlNsb3QiLCJpc0N1c3RvbUNvbHVtbiIsIl91cGRhdGVMaW5rZWRQcm9wZXJ0aWVzT25DdXN0b21Db2x1bW5zIiwiYW5ub3RhdGlvblRhYmxlQ29sdW1ucyIsInByb3AiLCJyZXBsYWNlIiwidmFsaWRhdGVLZXkiLCJiYXNlVGFibGVDb2x1bW4iLCJwb3NpdGlvbiIsImFuY2hvciIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwicHJvcGVydGllc1RvT3ZlcndyaXRlQW5ub3RhdGlvbkNvbHVtbiIsImlzQWN0aW9uTmF2aWdhYmxlIiwiYmFzZU1hbmlmZXN0Q29sdW1uIiwiaGVhZGVyIiwiSG9yaXpvbnRhbEFsaWduIiwiQmVnaW4iLCJpZCIsInN0YXJ0c1dpdGgiLCJtZXRhTW9kZWxQYXRoIiwiZ2V0RW50aXR5VHlwZUFubm90YXRpb24iLCJlIiwiTG9nIiwiaW5mbyIsImN1c3RvbVRhYmxlQ29sdW1uIiwibWVzc2FnZSIsImdldERpYWdub3N0aWNzIiwiYWRkSXNzdWUiLCJJc3N1ZUNhdGVnb3J5IiwiTWFuaWZlc3QiLCJJc3N1ZVNldmVyaXR5IiwiTG93IiwiSXNzdWVDYXRlZ29yeVR5cGUiLCJBbm5vdGF0aW9uQ29sdW1ucyIsIkludmFsaWRLZXkiLCJnZXRQMTNuTW9kZSIsInZhcmlhbnRNYW5hZ2VtZW50IiwiZ2V0VmFyaWFudE1hbmFnZW1lbnQiLCJhUGVyc29uYWxpemF0aW9uIiwiaXNBbmFseXRpY2FsVGFibGUiLCJpc1Jlc3BvbnNpdmVUYWJsZSIsInBlcnNvbmFsaXphdGlvbiIsInNvcnQiLCJhZ2dyZWdhdGUiLCJMaXN0UmVwb3J0IiwiVmFyaWFudE1hbmFnZW1lbnRUeXBlIiwiQ29udHJvbCIsIl9pc0ZpbHRlckJhckhpZGRlbiIsImlzRmlsdGVyQmFySGlkZGVuIiwiaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyIsIkFuYWx5dGljYWxMaXN0UGFnZSIsImdldFNvcnRDb25kaXRpb25zIiwibm9uU29ydGFibGVQcm9wZXJ0aWVzIiwic29ydENvbmRpdGlvbnMiLCJTb3J0T3JkZXIiLCJzb3J0ZXJzIiwiY29uZGl0aW9ucyIsImNvbmRpdGlvbiIsImNvbmRpdGlvblByb3BlcnR5IiwiUHJvcGVydHkiLCJpbmZvTmFtZSIsImNvbnZlcnRQcm9wZXJ0eVBhdGhzVG9JbmZvTmFtZXMiLCJkZXNjZW5kaW5nIiwiRGVzY2VuZGluZyIsImdldEluaXRpYWxFeHBhbnNpb25MZXZlbCIsImxldmVsIiwiSW5pdGlhbEV4cGFuc2lvbkxldmVsIiwicGF0aHMiLCJpbmZvTmFtZXMiLCJjdXJyZW50UGF0aCIsIkdyb3VwQnkiLCJhR3JvdXBCeSIsImFHcm91cExldmVscyIsImdyb3VwTGV2ZWxzIiwiYWdncmVnYXRhYmxlUHJvcGVydHlOYW1lIiwiYWdncmVnYXRhYmxlUHJvcGVydHlEZWZpbml0aW9uIiwiY3VzdG9tQWdncmVnYXRlIiwiYWRkaXRpb25hbFByb3BlcnR5SW5mbyIsIlRvdGFsIiwiYVRvdGFscyIsInR5cGVOYW1lUGx1cmFsIiwiVHlwZU5hbWVQbHVyYWwiLCJ0aXRsZSIsInBhZ2VNYW5pZmVzdFNldHRpbmdzIiwiaGFzQWJzb2x1dGVQYXRoIiwicDEzbk1vZGUiLCJnZXRUYWJsZUlEIiwiY3JlYXRpb25CZWhhdmlvdXIiLCJzdGFuZGFyZEFjdGlvbnNDb250ZXh0IiwiZ2VuZXJhdGVTdGFuZGFyZEFjdGlvbnNDb250ZXh0IiwiZ2V0RGVsZXRlVmlzaWJpbGl0eSIsIm1hc3NFZGl0QnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24iLCJnZXRNYXNzRWRpdFZpc2liaWxpdHkiLCJpc0luc2VydFVwZGF0ZVRlbXBsYXRlZCIsImdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nIiwiaXNEcmFmdE9yU3RpY2t5U3VwcG9ydGVkIiwidGhyZXNob2xkIiwiTWF4SXRlbXMiLCJpc1NlYXJjaGFibGUiLCJpc1BhdGhTZWFyY2hhYmxlIiwic3RhbmRhcmRBY3Rpb25zIiwiZ2V0U3RhbmRhcmRBY3Rpb25DcmVhdGUiLCJkZWxldGUiLCJnZXRTdGFuZGFyZEFjdGlvbkRlbGV0ZSIsInBhc3RlIiwiZ2V0U3RhbmRhcmRBY3Rpb25QYXN0ZSIsIm1hc3NFZGl0IiwiZ2V0U3RhbmRhcmRBY3Rpb25NYXNzRWRpdCIsImluc2lnaHRzIiwiZ2V0U3RhbmRhcmRBY3Rpb25JbnNpZ2h0cyIsImNyZWF0aW9uUm93IiwiZ2V0Q3JlYXRpb25Sb3ciLCJlbnRpdHlOYW1lIiwiY29sbGVjdGlvbiIsIm5hdmlnYXRpb25QYXRoIiwicm93IiwiaXNJbkRpc3BsYXlNb2RlIiwiYXV0b0JpbmRPbkluaXQiLCJzZWFyY2hhYmxlIiwiaW5pdGlhbEV4cGFuc2lvbkxldmVsIiwiaXNDb21wbGV4UHJvcGVydHkiLCJleHBvcnREYXRhVHlwZSIsInRhcmdldE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJzdWJzdHIiLCJnZXRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbiIsInNlbGVjdGlvblZhcmlhbnRQYXRoIiwicmVzb2x2ZWRUYXJnZXQiLCJzZWxlY3Rpb24iLCJwcm9wZXJ0eU5hbWVzIiwiU2VsZWN0T3B0aW9ucyIsInNlbGVjdE9wdGlvbiIsIlByb3BlcnR5TmFtZSIsIl9nZXRGdWxsU2NyZWVuQmFzZWRPbkRldmljZSIsImlzSXBob25lIiwiZW5hYmxlRnVsbFNjcmVlbiIsIklzc3VlVHlwZSIsIkZVTExTQ1JFRU5NT0RFX05PVF9PTl9MSVNUUkVQT1JUIiwiX2dldE11bHRpU2VsZWN0TW9kZSIsIm11bHRpU2VsZWN0TW9kZSIsInNlbGVjdEFsbCIsInVzZUljb25UYWJCYXIiLCJfZ2V0VGFibGVUeXBlIiwiaXNEZXNrdG9wIiwiX2dldFRhYmxlTW9kZSIsImlzVGVtcGxhdGVMaXN0UmVwb3J0Iiwicm93Q291bnRNb2RlIiwicm93Q291bnQiLCJfZ2V0Q29uZGVuc2VkVGFibGVMYXlvdXQiLCJfdGFibGVUeXBlIiwiX3RhYmxlU2V0dGluZ3MiLCJjb25kZW5zZWRUYWJsZUxheW91dCIsIl9nZXRUYWJsZVNlbGVjdGlvbkxpbWl0Iiwic2VsZWN0aW9uTGltaXQiLCJfZ2V0VGFibGVJbmxpbmVDcmVhdGlvblJvd0NvdW50IiwiaW5saW5lQ3JlYXRpb25Sb3dDb3VudCIsIl9nZXRGaWx0ZXJzIiwicXVpY2tGaWx0ZXJQYXRocyIsInF1aWNrU2VsZWN0aW9uVmFyaWFudCIsInF1aWNrRmlsdGVycyIsInNob3dDb3VudHMiLCJxdWlja1ZhcmlhbnRTZWxlY3Rpb24iLCJfZ2V0RW5hYmxlRXhwb3J0IiwiZW5hYmxlUGFzdGUiLCJlbmFibGVFeHBvcnQiLCJfZ2V0RnJvemVuQ29sdW1uQ291bnQiLCJmcm96ZW5Db2x1bW5Db3VudCIsIl9nZXRGaWx0ZXJDb25maWd1cmF0aW9uIiwiZmlsdGVycyIsImhpZGVUYWJsZVRpdGxlIiwiaGVhZGVyVmlzaWJsZSIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibmF2UHJvcGVydHkiLCJjaGVja0NvbmRlbnNlZExheW91dCIsIl9tYW5pZmVzdFdyYXBwZXIiLCJlbmFibGVBdXRvQ29sdW1uV2lkdGgiLCJpc1Bob25lIiwidGVtcGxhdGVUeXBlIiwiZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyIiwiaXNDb25kZW5zZWRMYXlvdXRDb21wbGlhbnQiLCJvRmlsdGVyQ29uZmlndXJhdGlvbiIsImN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiIsInRhYmxlUm93TW9kZSIsIm9Db25maWd1cmF0aW9uIiwiZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSIsImVuYWJsZU1hc3NFZGl0IiwiaW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZSIsInNob3dSb3dDb3VudCIsImdldFZpZXdDb25maWd1cmF0aW9uIiwidXNlQ29uZGVuc2VkVGFibGVMYXlvdXQiLCJpc0NvbXBhY3RUeXBlIiwidGFibGVDb25maWd1cmF0aW9uIiwiaGllcmFyY2h5UXVhbGlmaWVyIiwib1RhcmdldE1hcHBpbmciLCJpc1R5cGVEZWZpbml0aW9uIiwiRURNX1RZUEVfTUFQUElORyIsInVuZGVybHlpbmdUeXBlIiwiJFNjYWxlIiwicHJlY2lzaW9uIiwiJFByZWNpc2lvbiIsIm1heExlbmd0aCIsIiRNYXhMZW5ndGgiLCJudWxsYWJsZSIsIiROdWxsYWJsZSIsIm1pbmltdW0iLCJpc05hTiIsIlZhbGlkYXRpb24iLCJNaW5pbXVtIiwibWF4aW11bSIsIk1heGltdW0iLCJpc0RpZ2l0U2VxdWVuY2UiLCJJc0RpZ2l0U2VxdWVuY2UiLCJwYXJzZUFzU3RyaW5nIiwiZW1wdHlTdHJpbmciLCJwYXJzZUtlZXBzRW1wdHlTdHJpbmciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0RW50aXR5VHlwZSxcblx0RW51bVZhbHVlLFxuXHROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0UHJvcGVydHksXG5cdFByb3BlcnR5QW5ub3RhdGlvblZhbHVlLFxuXHRQcm9wZXJ0eVBhdGhcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEZpbHRlckZ1bmN0aW9ucyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ2FwYWJpbGl0aWVzXCI7XG5pbXBvcnQgdHlwZSB7IFNlbWFudGljS2V5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IEVudGl0eVNldEFubm90YXRpb25zX0NvbW1vbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uX0VkbVwiO1xuaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXRBbm5vdGF0aW9uc19TZXNzaW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9TZXNzaW9uX0VkbVwiO1xuaW1wb3J0IHR5cGUge1xuXHRDcml0aWNhbGl0eVR5cGUsXG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQWN0aW9uLFxuXHREYXRhRmllbGRGb3JBY3Rpb25UeXBlcyxcblx0RGF0YUZpZWxkRm9yQW5ub3RhdGlvbixcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHREYXRhRmllbGRUeXBlcyxcblx0RGF0YVBvaW50LFxuXHREYXRhUG9pbnRUeXBlVHlwZXMsXG5cdEZpZWxkR3JvdXAsXG5cdExpbmVJdGVtLFxuXHRQcmVzZW50YXRpb25WYXJpYW50VHlwZSxcblx0U2VsZWN0aW9uVmFyaWFudFR5cGUsXG5cdFNlbGVjdE9wdGlvblR5cGVcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgeyBDb21wbGV4UHJvcGVydHlJbmZvIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQge1xuXHRjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMsXG5cdGNvbGxlY3RSZWxhdGVkUHJvcGVydGllc1JlY3Vyc2l2ZWx5LFxuXHRnZXREYXRhRmllbGREYXRhVHlwZSxcblx0Z2V0U2VtYW50aWNPYmplY3RQYXRoLFxuXHRnZXRUYXJnZXRWYWx1ZU9uRGF0YVBvaW50LFxuXHRpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0LFxuXHRpc0RhdGFGaWVsZFR5cGVzLFxuXHRpc0RhdGFQb2ludEZyb21EYXRhRmllbGREZWZhdWx0XG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2Fubm90YXRpb25zL0RhdGFGaWVsZFwiO1xuaW1wb3J0IHR5cGUge1xuXHRBbm5vdGF0aW9uQWN0aW9uLFxuXHRCYXNlQWN0aW9uLFxuXHRDb21iaW5lZEFjdGlvbixcblx0Q3VzdG9tQWN0aW9uLFxuXHRPdmVycmlkZVR5cGVBY3Rpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHtcblx0ZGF0YUZpZWxkSXNDb3B5QWN0aW9uLFxuXHRnZXRBY3Rpb25zRnJvbU1hbmlmZXN0LFxuXHRnZXRDb3B5QWN0aW9uLFxuXHRpc0FjdGlvbk5hdmlnYWJsZSxcblx0cmVtb3ZlRHVwbGljYXRlQWN0aW9uc1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBFbnRpdHksIFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZU9iamVjdCwgQ3VzdG9tRWxlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBpbnNlcnRDdXN0b21FbGVtZW50cywgT3ZlcnJpZGVUeXBlLCBQbGFjZW1lbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgSXNzdWVDYXRlZ29yeSwgSXNzdWVDYXRlZ29yeVR5cGUsIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHRhYmxlRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIFBhdGhJbk1vZGVsRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0RURNX1RZUEVfTUFQUElORyxcblx0ZXF1YWwsXG5cdGZvcm1hdFJlc3VsdCxcblx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLFxuXHRpZkVsc2UsXG5cdGlzQ29uc3RhbnQsXG5cdG5vdCxcblx0b3IsXG5cdHBhdGhJbk1vZGVsLFxuXHRyZXNvbHZlQmluZGluZ1N0cmluZ1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSwgcmVwbGFjZVNwZWNpYWxDaGFycyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgKiBhcyBUeXBlR3VhcmRzIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB7XG5cdGlzQW5ub3RhdGlvbk9mVHlwZSxcblx0aXNOYXZpZ2F0aW9uUHJvcGVydHksXG5cdGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uLFxuXHRpc1Byb3BlcnR5LFxuXHRpc1R5cGVEZWZpbml0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGVuaGFuY2VEYXRhTW9kZWxQYXRoLFxuXHRnZXRUYXJnZXRPYmplY3RQYXRoLFxuXHRpc1BhdGhEZWxldGFibGUsXG5cdGlzUGF0aFNlYXJjaGFibGUsXG5cdGlzUGF0aFVwZGF0YWJsZVxufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBnZXREaXNwbGF5TW9kZSwgdHlwZSBEaXNwbGF5TW9kZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0Rpc3BsYXlNb2RlRm9ybWF0dGVyXCI7XG5pbXBvcnQgeyBnZXROb25Tb3J0YWJsZVByb3BlcnRpZXNSZXN0cmljdGlvbnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9FbnRpdHlTZXRIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5LFxuXHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSxcblx0aXNJbWFnZVVSTFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHsgaXNNdWx0aVZhbHVlRmllbGQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCB0eXBlIHsgRGVmYXVsdFR5cGVGb3JFZG1UeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvRURNXCI7XG5pbXBvcnQgQWN0aW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL2hlbHBlcnMvQWN0aW9uSGVscGVyXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgQWdncmVnYXRpb25IZWxwZXIgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9BZ2dyZWdhdGlvblwiO1xuaW1wb3J0IHsgaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4gfSBmcm9tIFwiLi4vLi4vaGVscGVycy9EYXRhRmllbGRIZWxwZXJcIjtcbmltcG9ydCB7IGdldFRhYmxlSUQgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9JRFwiO1xuaW1wb3J0IHR5cGUge1xuXHRBdmFpbGFiaWxpdHlUeXBlLFxuXHRDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4sXG5cdEN1c3RvbURlZmluZWRUYWJsZUNvbHVtbkZvck92ZXJyaWRlLFxuXHRGb3JtYXRPcHRpb25zVHlwZSxcblx0TmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0TmF2aWdhdGlvblRhcmdldENvbmZpZ3VyYXRpb24sXG5cdFRhYmxlQ29sdW1uU2V0dGluZ3MsXG5cdFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRWaWV3UGF0aENvbmZpZ3VyYXRpb25cbn0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7XG5cdEFjdGlvblR5cGUsXG5cdENyZWF0aW9uTW9kZSxcblx0SG9yaXpvbnRhbEFsaWduLFxuXHRJbXBvcnRhbmNlLFxuXHRTZWxlY3Rpb25Nb2RlLFxuXHRUZW1wbGF0ZVR5cGUsXG5cdFZhcmlhbnRNYW5hZ2VtZW50VHlwZSxcblx0VmlzdWFsaXphdGlvblR5cGVcbn0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB0eXBlIE1hbmlmZXN0V3JhcHBlciBmcm9tIFwiLi4vLi4vTWFuaWZlc3RXcmFwcGVyXCI7XG5pbXBvcnQgeyBnZXRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVR5cGUgfSBmcm9tIFwiLi9Dcml0aWNhbGl0eVwiO1xuaW1wb3J0IHR5cGUgeyBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUgfSBmcm9tIFwiLi90YWJsZS9TdGFuZGFyZEFjdGlvbnNcIjtcbmltcG9ydCB7XG5cdGdlbmVyYXRlU3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0Z2V0Q3JlYXRpb25Sb3csXG5cdGdldERlbGV0ZVZpc2liaWxpdHksXG5cdGdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nLFxuXHRnZXRNYXNzRWRpdFZpc2liaWxpdHksXG5cdGdldFJlc3RyaWN0aW9ucyxcblx0Z2V0U3RhbmRhcmRBY3Rpb25DcmVhdGUsXG5cdGdldFN0YW5kYXJkQWN0aW9uRGVsZXRlLFxuXHRnZXRTdGFuZGFyZEFjdGlvbkluc2lnaHRzLFxuXHRnZXRTdGFuZGFyZEFjdGlvbk1hc3NFZGl0LFxuXHRnZXRTdGFuZGFyZEFjdGlvblBhc3RlLFxuXHRpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQsXG5cdGlzSW5EaXNwbGF5TW9kZVxufSBmcm9tIFwiLi90YWJsZS9TdGFuZGFyZEFjdGlvbnNcIjtcblxuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBnZXRFbmFibGVkRm9yQW5ub3RhdGlvbkFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcblxuZXhwb3J0IHR5cGUgVGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbiA9IHtcblx0YXV0b0JpbmRPbkluaXQ6IGJvb2xlYW47XG5cdGNvbGxlY3Rpb246IHN0cmluZztcblx0dmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50VHlwZTtcblx0ZmlsdGVySWQ/OiBzdHJpbmc7XG5cdGlkOiBzdHJpbmc7XG5cdG5hdmlnYXRpb25QYXRoOiBzdHJpbmc7XG5cdHAxM25Nb2RlPzogc3RyaW5nO1xuXHRyb3c/OiB7XG5cdFx0YWN0aW9uPzogc3RyaW5nO1xuXHRcdHByZXNzPzogc3RyaW5nO1xuXHRcdHJvd0hpZ2hsaWdodGluZzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdFx0cm93TmF2aWdhdGVkOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0XHR2aXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdH07XG5cdHNlbGVjdGlvbk1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c3RhbmRhcmRBY3Rpb25zOiB7XG5cdFx0YWN0aW9uczogUmVjb3JkPHN0cmluZywgU3RhbmRhcmRBY3Rpb25Db25maWdUeXBlPjtcblx0XHRpc0luc2VydFVwZGF0ZVRlbXBsYXRlZDogYm9vbGVhbjtcblx0XHR1cGRhdGFibGVQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0fTtcblx0ZGlzcGxheU1vZGU/OiBib29sZWFuO1xuXHR0aHJlc2hvbGQ6IG51bWJlcjtcblx0ZW50aXR5TmFtZTogc3RyaW5nO1xuXHRzb3J0Q29uZGl0aW9ucz86IHN0cmluZztcblx0Z3JvdXBDb25kaXRpb25zPzogc3RyaW5nO1xuXHRhZ2dyZWdhdGVDb25kaXRpb25zPzogc3RyaW5nO1xuXHRpbml0aWFsRXhwYW5zaW9uTGV2ZWw/OiBudW1iZXI7XG5cblx0LyoqIENyZWF0ZSBuZXcgZW50cmllcyAqL1xuXHRjcmVhdGU6IENyZWF0ZUJlaGF2aW9yIHwgQ3JlYXRlQmVoYXZpb3JFeHRlcm5hbDtcblx0dGl0bGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c2VhcmNoYWJsZTogYm9vbGVhbjtcblxuXHRpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogTmV3IGVudHJpZXMgYXJlIGNyZWF0ZWQgd2l0aGluIHRoZSBhcHAgKGRlZmF1bHQgY2FzZSlcbiAqL1xuZXhwb3J0IHR5cGUgQ3JlYXRlQmVoYXZpb3IgPSB7XG5cdG1vZGU6IENyZWF0aW9uTW9kZTtcblx0YXBwZW5kOiBib29sZWFuO1xuXHRuZXdBY3Rpb24/OiBzdHJpbmc7XG5cdG5hdmlnYXRlVG9UYXJnZXQ/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIE5ldyBlbnRyaWVzIGFyZSBjcmVhdGVkIGJ5IG5hdmlnYXRpbmcgdG8gc29tZSB0YXJnZXRcbiAqL1xuZXhwb3J0IHR5cGUgQ3JlYXRlQmVoYXZpb3JFeHRlcm5hbCA9IHtcblx0bW9kZTogXCJFeHRlcm5hbFwiO1xuXHRvdXRib3VuZDogc3RyaW5nO1xuXHRvdXRib3VuZERldGFpbDogTmF2aWdhdGlvblRhcmdldENvbmZpZ3VyYXRpb25bXCJvdXRib3VuZERldGFpbFwiXTtcblx0bmF2aWdhdGlvblNldHRpbmdzOiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVDYXBhYmlsaXR5UmVzdHJpY3Rpb24gPSB7XG5cdGlzRGVsZXRhYmxlOiBib29sZWFuO1xuXHRpc1VwZGF0YWJsZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlRmlsdGVyc0NvbmZpZ3VyYXRpb24gPSB7XG5cdHBhdGhzOiB7XG5cdFx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0fVtdO1xuXHRzaG93Q291bnRzPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uID0ge1xuXHRwcm9wZXJ0eU5hbWVzOiBzdHJpbmdbXTtcblx0dGV4dD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24gPSB7XG5cdGNyZWF0ZUF0RW5kOiBib29sZWFuO1xuXHRjcmVhdGlvbk1vZGU6IENyZWF0aW9uTW9kZTtcblx0ZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YTogYm9vbGVhbjtcblx0Y3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdHVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0OiBib29sZWFuO1xuXHRlbmFibGVFeHBvcnQ6IGJvb2xlYW47XG5cdGZyb3plbkNvbHVtbkNvdW50PzogbnVtYmVyO1xuXHRoZWFkZXJWaXNpYmxlOiBib29sZWFuO1xuXHRmaWx0ZXJzPzogUmVjb3JkPHN0cmluZywgVGFibGVGaWx0ZXJzQ29uZmlndXJhdGlvbj47XG5cdHR5cGU6IFRhYmxlVHlwZTtcblx0cm93Q291bnRNb2RlPzogVGFibGVSb3dDb3VudE1vZGU7XG5cdHJvd0NvdW50PzogbnVtYmVyO1xuXHRzZWxlY3RBbGw/OiBib29sZWFuO1xuXHRzZWxlY3Rpb25MaW1pdDogbnVtYmVyO1xuXHRtdWx0aVNlbGVjdE1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0ZW5hYmxlUGFzdGU6IGJvb2xlYW47XG5cdGVuYWJsZUZ1bGxTY3JlZW46IGJvb2xlYW47XG5cdHNob3dSb3dDb3VudDogYm9vbGVhbjtcblx0aW5saW5lQ3JlYXRpb25Sb3dDb3VudD86IG51bWJlcjtcblx0aW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZT86IGJvb2xlYW47XG5cdGVuYWJsZU1hc3NFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRlbmFibGVBdXRvQ29sdW1uV2lkdGg6IGJvb2xlYW47XG5cdGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRpc0NvbXBhY3RUeXBlPzogYm9vbGVhbjtcblx0aGllcmFyY2h5UXVhbGlmaWVyPzogc3RyaW5nO1xuXHRlbmFibGVBZGRDYXJkVG9JbnNpZ2h0cz86IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBUYWJsZVR5cGUgPSBcIkdyaWRUYWJsZVwiIHwgXCJSZXNwb25zaXZlVGFibGVcIiB8IFwiQW5hbHl0aWNhbFRhYmxlXCIgfCBcIlRyZWVUYWJsZVwiO1xuZXhwb3J0IHR5cGUgVGFibGVSb3dDb3VudE1vZGUgPSBcIkF1dG9cIiB8IFwiRml4ZWRcIjtcblxuZW51bSBDb2x1bW5UeXBlIHtcblx0RGVmYXVsdCA9IFwiRGVmYXVsdFwiLCAvLyBEZWZhdWx0IFR5cGUgKEN1c3RvbSBDb2x1bW4pXG5cdEFubm90YXRpb24gPSBcIkFubm90YXRpb25cIixcblx0U2xvdCA9IFwiU2xvdFwiXG59XG5cbi8vIEN1c3RvbSBDb2x1bW4gZnJvbSBNYW5pZmVzdFxuZXhwb3J0IHR5cGUgTWFuaWZlc3REZWZpbmVkQ3VzdG9tQ29sdW1uID0gQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uICYge1xuXHR0eXBlPzogQ29sdW1uVHlwZS5EZWZhdWx0O1xufTtcblxuLy8gU2xvdCBDb2x1bW4gZnJvbSBCdWlsZGluZyBCbG9ja1xuZXhwb3J0IHR5cGUgRnJhZ21lbnREZWZpbmVkU2xvdENvbHVtbiA9IEN1c3RvbURlZmluZWRUYWJsZUNvbHVtbiAmIHtcblx0dHlwZTogQ29sdW1uVHlwZS5TbG90O1xufTtcblxuLy8gUHJvcGVydGllcyBhbGwgQ29sdW1uVHlwZXMgaGF2ZTpcbmV4cG9ydCB0eXBlIEJhc2VUYWJsZUNvbHVtbiA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0dHlwZTogQ29sdW1uVHlwZTsgLy9PcmlnaW4gb2YgdGhlIHNvdXJjZSB3aGVyZSB3ZSBhcmUgZ2V0dGluZyB0aGUgdGVtcGxhdGVkIGluZm9ybWF0aW9uIGZyb21cblx0d2lkdGg/OiBzdHJpbmc7XG5cdGltcG9ydGFuY2U/OiBJbXBvcnRhbmNlO1xuXHRob3Jpem9udGFsQWxpZ24/OiBIb3Jpem9udGFsQWxpZ247XG5cdGF2YWlsYWJpbGl0eT86IEF2YWlsYWJpbGl0eVR5cGU7XG5cdGlzTmF2aWdhYmxlPzogYm9vbGVhbjtcblx0Y2FzZVNlbnNpdGl2ZTogYm9vbGVhbjtcblx0aXNJbnNpZ2h0c1N1cHBvcnRlZD86IGJvb2xlYW47XG5cdGxhYmVsPzogc3RyaW5nO1xuXHR0b29sdGlwPzogc3RyaW5nO1xufTtcblxuLy8gUHJvcGVydGllcyBvbiBDdXN0b20gQ29sdW1ucyBhbmQgU2xvdCBDb2x1bW5zXG5leHBvcnQgdHlwZSBDdXN0b21CYXNlZFRhYmxlQ29sdW1uID0gQmFzZVRhYmxlQ29sdW1uICYge1xuXHRpZDogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdGhlYWRlcj86IHN0cmluZztcblx0dGVtcGxhdGU6IHN0cmluZztcblx0cHJvcGVydHlJbmZvcz86IHN0cmluZ1tdO1xuXHRleHBvcnRTZXR0aW5ncz86IHtcblx0XHR0ZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdHdyYXA6IGJvb2xlYW47XG5cdH0gfCBudWxsO1xuXHRmb3JtYXRPcHRpb25zOiB7IHRleHRMaW5lc0VkaXQ6IG51bWJlciB9O1xuXHRpc0dyb3VwYWJsZTogYm9vbGVhbjtcblx0aXNOYXZpZ2FibGU6IGJvb2xlYW47XG5cdHNvcnRhYmxlOiBib29sZWFuO1xuXHR2aXN1YWxTZXR0aW5nczogeyB3aWR0aENhbGN1bGF0aW9uOiBudWxsIH07XG5cdHByb3BlcnRpZXM/OiBzdHJpbmdbXTsgLy9XZSBuZWVkIHRoZSBwcm9wZXJ0aWVzIHJlbGF0aXZlUGF0aCB0byBiZSBhZGRlZCB0byB0aGUgJFNlbGVjdCByZXF1ZXN0IGZvciBleHBvcnRpbmdcbn07XG5cbi8vIFByb3BlcnRpZXMgZGVyaXZlZCBmcm9tIE1hbmlmZXN0IHRvIG92ZXJyaWRlIEFubm90YXRpb24gY29uZmlndXJhdGlvbnNcbmV4cG9ydCB0eXBlIEFubm90YXRpb25UYWJsZUNvbHVtbkZvck92ZXJyaWRlID0gQmFzZVRhYmxlQ29sdW1uICYge1xuXHRzZXR0aW5ncz86IFRhYmxlQ29sdW1uU2V0dGluZ3M7XG5cdGZvcm1hdE9wdGlvbnM/OiBGb3JtYXRPcHRpb25zVHlwZTtcbn07XG5cbmV4cG9ydCB0eXBlIFByb3BlcnR5VHlwZUNvbnN0cmFpbnRzID0gUGFydGlhbDx7XG5cdHNjYWxlOiBudW1iZXI7XG5cdHByZWNpc2lvbjogbnVtYmVyO1xuXHRtYXhMZW5ndGg6IG51bWJlcjtcblx0bnVsbGFibGU6IGJvb2xlYW47XG5cdG1pbmltdW06IHN0cmluZztcblx0bWF4aW11bTogc3RyaW5nO1xuXHRpc0RpZ2l0U2VxdWVuY2U6IGJvb2xlYW47XG59PjtcblxuZXhwb3J0IHR5cGUgUHJvcGVydHlUeXBlRm9ybWF0T3B0aW9ucyA9IFBhcnRpYWw8e1xuXHRwYXJzZUFzU3RyaW5nOiBib29sZWFuO1xuXHRlbXB0eVN0cmluZzogc3RyaW5nO1xuXHRwYXJzZUtlZXBzRW1wdHlTdHJpbmc6IGJvb2xlYW47XG59PjtcblxuZXhwb3J0IHR5cGUgUHJvcGVydHlUeXBlQ29uZmlnID0ge1xuXHR0eXBlPzogc3RyaW5nO1xuXHRjb25zdHJhaW50czogUHJvcGVydHlUeXBlQ29uc3RyYWludHM7XG5cdGZvcm1hdE9wdGlvbnM6IFByb3BlcnR5VHlwZUZvcm1hdE9wdGlvbnM7XG5cdHR5cGVJbnN0YW5jZT86IHVua25vd247XG5cdGJhc2VUeXBlPzogc3RyaW5nO1xuXHRjbGFzc05hbWU/OiBrZXlvZiB0eXBlb2YgRGVmYXVsdFR5cGVGb3JFZG1UeXBlO1xufTtcblxuZXhwb3J0IHR5cGUgY29sdW1uRXhwb3J0U2V0dGluZ3MgPSBQYXJ0aWFsPHtcblx0dGVtcGxhdGU6IHN0cmluZztcblx0bGFiZWw6IHN0cmluZztcblx0d3JhcDogYm9vbGVhbjtcblx0dHlwZTogc3RyaW5nO1xuXHRpbnB1dEZvcm1hdDogc3RyaW5nO1xuXHRmb3JtYXQ6IHN0cmluZztcblx0c2NhbGU6IG51bWJlcjtcblx0ZGVsaW1pdGVyOiBib29sZWFuO1xuXHR1bml0OiBzdHJpbmc7XG5cdHVuaXRQcm9wZXJ0eTogc3RyaW5nO1xuXHR0aW1lem9uZTogc3RyaW5nO1xuXHR0aW1lem9uZVByb3BlcnR5OiBzdHJpbmc7XG5cdHV0YzogYm9vbGVhbjtcbn0+O1xuXG4vLyBQcm9wZXJ0aWVzIGZvciBBbm5vdGF0aW9uIENvbHVtbnNcbmV4cG9ydCB0eXBlIEFubm90YXRpb25UYWJsZUNvbHVtbiA9IEFubm90YXRpb25UYWJsZUNvbHVtbkZvck92ZXJyaWRlICYge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHByb3BlcnR5SW5mb3M/OiBzdHJpbmdbXTtcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0cmVsYXRpdmVQYXRoOiBzdHJpbmc7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHR0b29sdGlwPzogc3RyaW5nO1xuXHRncm91cExhYmVsPzogc3RyaW5nO1xuXHRncm91cD86IHN0cmluZztcblx0RmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdHNob3dEYXRhRmllbGRzTGFiZWw/OiBib29sZWFuO1xuXHRpc0tleT86IGJvb2xlYW47XG5cdGlzR3JvdXBhYmxlPzogYm9vbGVhbjtcblx0dW5pdD86IHN0cmluZztcblx0dW5pdFRleHQ/OiBzdHJpbmc7XG5cdHRpbWV6b25lVGV4dD86IHN0cmluZztcblx0dGltZXpvbmU/OiBzdHJpbmc7XG5cdHNlbWFudGljT2JqZWN0UGF0aD86IHN0cmluZztcblx0c29ydGFibGU6IGJvb2xlYW47XG5cdGV4cG9ydFNldHRpbmdzPzogY29sdW1uRXhwb3J0U2V0dGluZ3MgfCBudWxsO1xuXHR0ZXh0QXJyYW5nZW1lbnQ/OiB7XG5cdFx0dGV4dFByb3BlcnR5OiBzdHJpbmc7XG5cdFx0bW9kZTogRGlzcGxheU1vZGU7XG5cdH07XG5cdGFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zPzogc3RyaW5nW107XG5cdHZpc3VhbFNldHRpbmdzPzogVmlzdWFsU2V0dGluZ3M7XG5cdHR5cGVDb25maWc/OiBQcm9wZXJ0eVR5cGVDb25maWc7XG5cdGlzUGFydE9mTGluZUl0ZW0/OiBib29sZWFuOyAvLyB0ZW1wb3JhcnkgaW5kaWNhdG9yIHRvIG9ubHkgYWxsb3cgZmlsdGVyaW5nIG9uIG5hdmlnYXRpb24gcHJvcGVydGllcyB3aGVuIHRoZXkncmUgcGFydCBvZiBhIGxpbmUgaXRlbVxuXHRhZGRpdGlvbmFsTGFiZWxzPzogc3RyaW5nW107XG5cdGV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlPzogc3RyaW5nO1xuXHRhZ2dyZWdhdGFibGU/OiBib29sZWFuO1xuXHRleHRlbnNpb24/OiBFeHRlbnNpb25Gb3JBbmFseXRpY3M7XG5cdGlzSW5zaWdodHNTdXBwb3J0ZWQ/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgRXh0ZW5zaW9uRm9yQW5hbHl0aWNzID0ge1xuXHRjdXN0b21BZ2dyZWdhdGU/OiB7XG5cdFx0Y29udGV4dERlZmluaW5nUHJvcGVydGllcz86IHN0cmluZ1tdO1xuXHR9O1xufTtcblxuZXhwb3J0IHR5cGUgVGVjaG5pY2FsQ29sdW1uID0gQW5ub3RhdGlvblRhYmxlQ29sdW1uICYge1xuXHRleHRlbnNpb24/OiB7XG5cdFx0dGVjaG5pY2FsbHlHcm91cGFibGU6IGJvb2xlYW47XG5cdFx0dGVjaG5pY2FsbHlBZ2dyZWdhdGFibGU6IGJvb2xlYW47XG5cdH07XG59O1xuXG5leHBvcnQgdHlwZSBWaXN1YWxTZXR0aW5ncyA9IHtcblx0d2lkdGhDYWxjdWxhdGlvbj86IFdpZHRoQ2FsY3VsYXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBXaWR0aENhbGN1bGF0aW9uID0gbnVsbCB8IHtcblx0bWluV2lkdGg/OiBudW1iZXI7XG5cdG1heFdpZHRoPzogbnVtYmVyO1xuXHRkZWZhdWx0V2lkdGg/OiBudW1iZXI7XG5cdGluY2x1ZGVMYWJlbD86IGJvb2xlYW47XG5cdGdhcD86IG51bWJlcjtcblx0Ly8gb25seSByZWxldmFudCBmb3IgY29tcGxleCB0eXBlc1xuXHRleGNsdWRlUHJvcGVydGllcz86IHN0cmluZ1tdO1xuXHR2ZXJ0aWNhbEFycmFuZ2VtZW50PzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlQ29sdW1uID0gQ3VzdG9tQmFzZWRUYWJsZUNvbHVtbiB8IEFubm90YXRpb25UYWJsZUNvbHVtbjtcbmV4cG9ydCB0eXBlIE1hbmlmZXN0Q29sdW1uID0gQ3VzdG9tRWxlbWVudDxDdXN0b21CYXNlZFRhYmxlQ29sdW1uIHwgQW5ub3RhdGlvblRhYmxlQ29sdW1uRm9yT3ZlcnJpZGU+O1xuXG5leHBvcnQgdHlwZSBBZ2dyZWdhdGVEYXRhID0ge1xuXHRkZWZhdWx0QWdncmVnYXRlOiB7XG5cdFx0Y29udGV4dERlZmluaW5nUHJvcGVydGllcz86IHN0cmluZ1tdO1xuXHR9O1xuXHRyZWxhdGl2ZVBhdGg6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlVmlzdWFsaXphdGlvbiA9IHtcblx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuVGFibGU7XG5cdGFubm90YXRpb246IFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb247XG5cdGNvbnRyb2w6IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb247XG5cdGNvbHVtbnM6IFRhYmxlQ29sdW1uW107XG5cdGFjdGlvbnM6IChCYXNlQWN0aW9uIHwgQW5ub3RhdGlvbkFjdGlvbiB8IEN1c3RvbUFjdGlvbilbXTtcblx0Y29tbWFuZEFjdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+O1xuXHRhZ2dyZWdhdGVzPzogUmVjb3JkPHN0cmluZywgQWdncmVnYXRlRGF0YT47XG5cdGVuYWJsZUFuYWx5dGljcz86IGJvb2xlYW47XG5cdGVuYWJsZUJhc2ljU2VhcmNoPzogYm9vbGVhbjtcblx0b3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmc7XG5cdG9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXM6IHN0cmluZztcblx0aGVhZGVySW5mb1RpdGxlOiBzdHJpbmc7XG5cdHNlbWFudGljS2V5czogc3RyaW5nW107XG5cdGhlYWRlckluZm9UeXBlTmFtZTogUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8U3RyaW5nPiB8IHVuZGVmaW5lZDtcblx0ZW5hYmxlJHNlbGVjdDogYm9vbGVhbjtcblx0ZW5hYmxlJCRnZXRLZWVwQWxpdmVDb250ZXh0OiBib29sZWFuO1xuXHRpc0luc2lnaHRzRW5hYmxlZD86IGJvb2xlYW47XG59O1xuXG50eXBlIFNvcnRlclR5cGUgPSB7XG5cdG5hbWU6IHN0cmluZztcblx0ZGVzY2VuZGluZzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgYW5ub3RhdGlvbi1iYXNlZCBhbmQgbWFuaWZlc3QtYmFzZWQgdGFibGUgYWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gbmF2aWdhdGlvblNldHRpbmdzXG4gKiBAcmV0dXJucyBUaGUgY29tcGxldGUgdGFibGUgYWN0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVBY3Rpb25zKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M/OiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uXG4pOiBDb21iaW5lZEFjdGlvbiB7XG5cdGNvbnN0IGFUYWJsZUFjdGlvbnMgPSBnZXRUYWJsZUFubm90YXRpb25BY3Rpb25zKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBhQW5ub3RhdGlvbkFjdGlvbnMgPSBhVGFibGVBY3Rpb25zLnRhYmxlQWN0aW9ucztcblx0Y29uc3QgYUhpZGRlbkFjdGlvbnMgPSBhVGFibGVBY3Rpb25zLmhpZGRlblRhYmxlQWN0aW9ucztcblx0Y29uc3QgbWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpLmFjdGlvbnMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRhQW5ub3RhdGlvbkFjdGlvbnMsXG5cdFx0bmF2aWdhdGlvblNldHRpbmdzLFxuXHRcdHRydWUsXG5cdFx0YUhpZGRlbkFjdGlvbnNcblx0KTtcblx0Y29uc3QgYWN0aW9uT3ZlcndyaXRlQ29uZmlnOiBPdmVycmlkZVR5cGVBY3Rpb24gPSB7XG5cdFx0aXNOYXZpZ2FibGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZW5hYmxlT25TZWxlY3Q6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZW5hYmxlQXV0b1Njcm9sbDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRlbmFibGVkOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdHZpc2libGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGNvbW1hbmQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGVcblx0fTtcblx0Y29uc3QgYWN0aW9ucyA9IGluc2VydEN1c3RvbUVsZW1lbnRzKGFBbm5vdGF0aW9uQWN0aW9ucywgbWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMsIGFjdGlvbk92ZXJ3cml0ZUNvbmZpZyk7XG5cblx0cmV0dXJuIHtcblx0XHRhY3Rpb25zLFxuXHRcdGNvbW1hbmRBY3Rpb25zOiBtYW5pZmVzdEFjdGlvbnMuY29tbWFuZEFjdGlvbnNcblx0fTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBjb2x1bW5zLCBhbm5vdGF0aW9uLWJhc2VkIGFzIHdlbGwgYXMgbWFuaWZlc3QgYmFzZWQuXG4gKiBUaGV5IGFyZSBzb3J0ZWQgYW5kIHNvbWUgcHJvcGVydGllcyBjYW4gYmUgb3ZlcndyaXR0ZW4gdmlhIHRoZSBtYW5pZmVzdCAoY2hlY2sgb3V0IHRoZSBrZXlzIHRoYXQgY2FuIGJlIG92ZXJ3cml0dGVuKS5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgZm9yIHJlcHJlc2VudGF0aW9uIGluIGEgdGFibGUgb3IgbGlzdFxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHBhcmFtIG5hdmlnYXRpb25TZXR0aW5nc1xuICogQHBhcmFtIGlzSW5zaWdodHNFbmFibGVkXG4gKiBAcmV0dXJucyBSZXR1cm5zIGFsbCB0YWJsZSBjb2x1bW5zIHRoYXQgc2hvdWxkIGJlIGF2YWlsYWJsZSwgcmVnYXJkbGVzcyBvZiB0ZW1wbGF0aW5nIG9yIHBlcnNvbmFsaXphdGlvbiBvciB0aGVpciBvcmlnaW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYmxlQ29sdW1ucyhcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0bmF2aWdhdGlvblNldHRpbmdzPzogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0aXNJbnNpZ2h0c0VuYWJsZWQ/OiBib29sZWFuXG4pOiBUYWJsZUNvbHVtbltdIHtcblx0Y29uc3QgYW5ub3RhdGlvbkNvbHVtbnMgPSBnZXRDb2x1bW5zRnJvbUFubm90YXRpb25zKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQsIGlzSW5zaWdodHNFbmFibGVkKTtcblx0Y29uc3QgbWFuaWZlc3RDb2x1bW5zID0gZ2V0Q29sdW1uc0Zyb21NYW5pZmVzdChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpLmNvbHVtbnMsXG5cdFx0YW5ub3RhdGlvbkNvbHVtbnMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKGxpbmVJdGVtQW5ub3RhdGlvbiksXG5cdFx0bmF2aWdhdGlvblNldHRpbmdzXG5cdCk7XG5cblx0cmV0dXJuIGluc2VydEN1c3RvbUVsZW1lbnRzKGFubm90YXRpb25Db2x1bW5zIGFzIFRhYmxlQ29sdW1uW10sIG1hbmlmZXN0Q29sdW1ucyBhcyBSZWNvcmQ8c3RyaW5nLCBDdXN0b21FbGVtZW50PFRhYmxlQ29sdW1uPj4sIHtcblx0XHR3aWR0aDogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRpbXBvcnRhbmNlOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlLFxuXHRcdGhvcml6b250YWxBbGlnbjogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRhdmFpbGFiaWxpdHk6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0aXNOYXZpZ2FibGU6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0c2V0dGluZ3M6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0Zm9ybWF0T3B0aW9uczogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZVxuXHR9KTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgY3VzdG9tIGFnZ3JlZ2F0aW9uIGRlZmluaXRpb25zIGZyb20gdGhlIGVudGl0eVR5cGUuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIHRhcmdldCBlbnRpdHkgdHlwZS5cbiAqIEBwYXJhbSB0YWJsZUNvbHVtbnMgVGhlIGFycmF5IG9mIGNvbHVtbnMgZm9yIHRoZSBlbnRpdHkgdHlwZS5cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dC5cbiAqIEByZXR1cm5zIFRoZSBhZ2dyZWdhdGUgZGVmaW5pdGlvbnMgZnJvbSB0aGUgZW50aXR5VHlwZSwgb3IgdW5kZWZpbmVkIGlmIHRoZSBlbnRpdHkgZG9lc24ndCBzdXBwb3J0IGFuYWx5dGljYWwgcXVlcmllcy5cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEFnZ3JlZ2F0ZURlZmluaXRpb25zRnJvbUVudGl0eVR5cGUgPSBmdW5jdGlvbiAoXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdHRhYmxlQ29sdW1uczogVGFibGVDb2x1bW5bXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogUmVjb3JkPHN0cmluZywgQWdncmVnYXRlRGF0YT4gfCB1bmRlZmluZWQge1xuXHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRmdW5jdGlvbiBmaW5kQ29sdW1uRnJvbVBhdGgocGF0aDogc3RyaW5nKTogVGFibGVDb2x1bW4gfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0YWJsZUNvbHVtbnMuZmluZCgoY29sdW1uKSA9PiB7XG5cdFx0XHRjb25zdCBhbm5vdGF0aW9uQ29sdW1uID0gY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRcdHJldHVybiBhbm5vdGF0aW9uQ29sdW1uLnByb3BlcnR5SW5mb3MgPT09IHVuZGVmaW5lZCAmJiBhbm5vdGF0aW9uQ29sdW1uLnJlbGF0aXZlUGF0aCA9PT0gcGF0aDtcblx0XHR9KTtcblx0fVxuXG5cdGlmICghYWdncmVnYXRpb25IZWxwZXIuaXNBbmFseXRpY3NTdXBwb3J0ZWQoKSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvLyBLZWVwIGEgc2V0IG9mIGFsbCBjdXJyZW5jeS91bml0IHByb3BlcnRpZXMsIGFzIHdlIGRvbid0IHdhbnQgdG8gY29uc2lkZXIgdGhlbSBhcyBhZ2dyZWdhdGVzXG5cdC8vIFRoZXkgYXJlIGFnZ3JlZ2F0ZXMgZm9yIHRlY2huaWNhbCByZWFzb25zICh0byBtYW5hZ2UgbXVsdGktdW5pdHMgc2l0dWF0aW9ucykgYnV0IGl0IGRvZXNuJ3QgbWFrZSBzZW5zZSBmcm9tIGEgdXNlciBzdGFuZHBvaW50XG5cdGNvbnN0IGN1cnJlbmN5T3JVbml0UHJvcGVydGllcyA9IG5ldyBTZXQoKTtcblx0dGFibGVDb2x1bW5zLmZvckVhY2goKGNvbHVtbikgPT4ge1xuXHRcdGNvbnN0IHRhYmxlQ29sdW1uID0gY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRpZiAodGFibGVDb2x1bW4udW5pdCkge1xuXHRcdFx0Y3VycmVuY3lPclVuaXRQcm9wZXJ0aWVzLmFkZCh0YWJsZUNvbHVtbi51bml0KTtcblx0XHR9XG5cdH0pO1xuXG5cdGNvbnN0IGN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0Q3VzdG9tQWdncmVnYXRlRGVmaW5pdGlvbnMoKTtcblx0Y29uc3QgZGVmaW5pdGlvbnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiA9IHt9O1xuXG5cdGN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zLmZvckVhY2goKGFubm90YXRpb24pID0+IHtcblx0XHRjb25zdCBhZ2dyZWdhdGVkUHJvcGVydHkgPSBhZ2dyZWdhdGlvbkhlbHBlci5fZW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLmZpbmQoKHByb3BlcnR5KSA9PiB7XG5cdFx0XHRyZXR1cm4gcHJvcGVydHkubmFtZSA9PT0gYW5ub3RhdGlvbi5xdWFsaWZpZXI7XG5cdFx0fSk7XG5cblx0XHRpZiAoYWdncmVnYXRlZFByb3BlcnR5KSB7XG5cdFx0XHRjb25zdCBjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzID0gYW5ub3RhdGlvbi5hbm5vdGF0aW9ucz8uQWdncmVnYXRpb24/LkNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXM7XG5cdFx0XHRkZWZpbml0aW9uc1thZ2dyZWdhdGVkUHJvcGVydHkubmFtZV0gPSBjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzXG5cdFx0XHRcdD8gY29udGV4dERlZmluaW5nUHJvcGVydGllcy5tYXAoKGN0eERlZlByb3BlcnR5KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY3R4RGVmUHJvcGVydHkudmFsdWU7XG5cdFx0XHRcdCAgfSlcblx0XHRcdFx0OiBbXTtcblx0XHR9XG5cdH0pO1xuXHRjb25zdCByZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEFnZ3JlZ2F0ZURhdGE+ID0ge307XG5cblx0dGFibGVDb2x1bW5zLmZvckVhY2goKGNvbHVtbikgPT4ge1xuXHRcdGNvbnN0IHRhYmxlQ29sdW1uID0gY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRpZiAodGFibGVDb2x1bW4ucHJvcGVydHlJbmZvcyA9PT0gdW5kZWZpbmVkICYmIHRhYmxlQ29sdW1uLnJlbGF0aXZlUGF0aCkge1xuXHRcdFx0Y29uc3QgcmF3Q29udGV4dERlZmluaW5nUHJvcGVydGllcyA9IGRlZmluaXRpb25zW3RhYmxlQ29sdW1uLnJlbGF0aXZlUGF0aF07XG5cblx0XHRcdC8vIElnbm9yZSBhZ2dyZWdhdGVzIGNvcnJlc3BvbmRpbmcgdG8gY3VycmVuY2llcyBvciB1bml0cyBvZiBtZWFzdXJlXG5cdFx0XHRpZiAocmF3Q29udGV4dERlZmluaW5nUHJvcGVydGllcyAmJiAhY3VycmVuY3lPclVuaXRQcm9wZXJ0aWVzLmhhcyh0YWJsZUNvbHVtbi5uYW1lKSkge1xuXHRcdFx0XHRyZXN1bHRbdGFibGVDb2x1bW4ubmFtZV0gPSB7XG5cdFx0XHRcdFx0ZGVmYXVsdEFnZ3JlZ2F0ZToge30sXG5cdFx0XHRcdFx0cmVsYXRpdmVQYXRoOiB0YWJsZUNvbHVtbi5yZWxhdGl2ZVBhdGhcblx0XHRcdFx0fTtcblx0XHRcdFx0Y29uc3QgY29udGV4dERlZmluaW5nUHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblx0XHRcdFx0cmF3Q29udGV4dERlZmluaW5nUHJvcGVydGllcy5mb3JFYWNoKChjb250ZXh0RGVmaW5pbmdQcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdFx0XHRjb25zdCBmb3VuZENvbHVtbiA9IGZpbmRDb2x1bW5Gcm9tUGF0aChjb250ZXh0RGVmaW5pbmdQcm9wZXJ0eU5hbWUpO1xuXHRcdFx0XHRcdGlmIChmb3VuZENvbHVtbikge1xuXHRcdFx0XHRcdFx0Y29udGV4dERlZmluaW5nUHJvcGVydGllcy5wdXNoKGZvdW5kQ29sdW1uLm5hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0cmVzdWx0W3RhYmxlQ29sdW1uLm5hbWVdLmRlZmF1bHRBZ2dyZWdhdGUuY29udGV4dERlZmluaW5nUHJvcGVydGllcyA9IGNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiByZXN1bHQ7XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgYSB0YWJsZSB2aXN1YWxpemF0aW9uIGZvciBhbmFseXRpY2FsIHVzZSBjYXNlcy5cbiAqXG4gKiBAcGFyYW0gdGFibGVWaXN1YWxpemF0aW9uIFRoZSB2aXN1YWxpemF0aW9uIHRvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSBlbnRpdHkgdHlwZSBkaXNwbGF5ZWQgaW4gdGhlIHRhYmxlXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiBUaGUgcHJlc2VudGF0aW9uVmFyaWFudCBhbm5vdGF0aW9uIChpZiBhbnkpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVUYWJsZVZpc3VhbGl6YXRpb25Gb3JUeXBlKFxuXHR0YWJsZVZpc3VhbGl6YXRpb246IFRhYmxlVmlzdWFsaXphdGlvbixcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24/OiBQcmVzZW50YXRpb25WYXJpYW50VHlwZVxuKSB7XG5cdGlmICh0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC50eXBlID09PSBcIkFuYWx5dGljYWxUYWJsZVwiKSB7XG5cdFx0Y29uc3QgYWdncmVnYXRlc0RlZmluaXRpb25zID0gZ2V0QWdncmVnYXRlRGVmaW5pdGlvbnNGcm9tRW50aXR5VHlwZShlbnRpdHlUeXBlLCB0YWJsZVZpc3VhbGl6YXRpb24uY29sdW1ucywgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRcdGlmIChhZ2dyZWdhdGVzRGVmaW5pdGlvbnMpIHtcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5lbmFibGVBbmFseXRpY3MgPSB0cnVlO1xuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmVuYWJsZSRzZWxlY3QgPSBmYWxzZTtcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5lbmFibGUkJGdldEtlZXBBbGl2ZUNvbnRleHQgPSBmYWxzZTtcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5hZ2dyZWdhdGVzID0gYWdncmVnYXRlc0RlZmluaXRpb25zO1xuXHRcdFx0X3VwZGF0ZVByb3BlcnR5SW5mb3NXaXRoQWdncmVnYXRlc0RlZmluaXRpb25zKHRhYmxlVmlzdWFsaXphdGlvbik7XG5cblx0XHRcdGNvbnN0IGFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRBbGxvd2VkVHJhbnNmb3JtYXRpb25zKCk7XG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uZW5hYmxlQmFzaWNTZWFyY2ggPSBhbGxvd2VkVHJhbnNmb3JtYXRpb25zID8gYWxsb3dlZFRyYW5zZm9ybWF0aW9ucy5pbmRleE9mKFwic2VhcmNoXCIpID49IDAgOiB0cnVlO1xuXG5cdFx0XHQvLyBBZGQgZ3JvdXAgYW5kIHNvcnQgY29uZGl0aW9ucyBmcm9tIHRoZSBwcmVzZW50YXRpb24gdmFyaWFudFxuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmFubm90YXRpb24uZ3JvdXBDb25kaXRpb25zID0gZ2V0R3JvdXBDb25kaXRpb25zKFxuXHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbixcblx0XHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnMsXG5cdFx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLnR5cGVcblx0XHRcdCk7XG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uYW5ub3RhdGlvbi5hZ2dyZWdhdGVDb25kaXRpb25zID0gZ2V0QWdncmVnYXRlQ29uZGl0aW9ucyhcblx0XHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb2x1bW5zXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLnR5cGUgPSBcIkdyaWRUYWJsZVwiOyAvLyBBbmFseXRpY2FsVGFibGUgaXNuJ3QgYSByZWFsIHR5cGUgZm9yIHRoZSBNREM6VGFibGUsIHNvIHdlIGFsd2F5cyBzd2l0Y2ggYmFjayB0byBHcmlkXG5cdH0gZWxzZSBpZiAodGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wudHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIikge1xuXHRcdHRhYmxlVmlzdWFsaXphdGlvbi5hbm5vdGF0aW9uLmdyb3VwQ29uZGl0aW9ucyA9IGdldEdyb3VwQ29uZGl0aW9ucyhcblx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnMsXG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC50eXBlXG5cdFx0KTtcblx0fSBlbHNlIGlmICh0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC50eXBlID09PSBcIlRyZWVUYWJsZVwiKSB7XG5cdFx0Y29uc3QgYWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0Y29uc3QgYWxsb3dlZFRyYW5zZm9ybWF0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMoKTtcblx0XHR0YWJsZVZpc3VhbGl6YXRpb24uZW5hYmxlQmFzaWNTZWFyY2ggPSBhbGxvd2VkVHJhbnNmb3JtYXRpb25zID8gYWxsb3dlZFRyYW5zZm9ybWF0aW9ucy5pbmNsdWRlcyhcInNlYXJjaFwiKSA6IHRydWU7XG5cdFx0dGFibGVWaXN1YWxpemF0aW9uLmVuYWJsZSQkZ2V0S2VlcEFsaXZlQ29udGV4dCA9IHRydWU7XG5cdH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIG5hdmlnYXRpb24gdGFyZ2V0IHBhdGggZnJvbSBtYW5pZmVzdCBzZXR0aW5ncy5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIFRoZSBuYXZpZ2F0aW9uIHBhdGggdG8gY2hlY2sgaW4gdGhlIG1hbmlmZXN0IHNldHRpbmdzXG4gKiBAcmV0dXJucyBOYXZpZ2F0aW9uIHBhdGggZnJvbSBtYW5pZmVzdCBzZXR0aW5nc1xuICovXG5mdW5jdGlvbiBnZXROYXZpZ2F0aW9uVGFyZ2V0UGF0aChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggJiYgbWFuaWZlc3RXcmFwcGVyLmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpKSB7XG5cdFx0Y29uc3QgbmF2Q29uZmlnID0gbWFuaWZlc3RXcmFwcGVyLmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpO1xuXHRcdGlmIChPYmplY3Qua2V5cyhuYXZDb25maWcpLmxlbmd0aCA+IDApIHtcblx0XHRcdHJldHVybiBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGRhdGFNb2RlbFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0Y29uc3QgY29udGV4dFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKCk7XG5cdGNvbnN0IG5hdkNvbmZpZ0ZvckNvbnRleHRQYXRoID0gbWFuaWZlc3RXcmFwcGVyLmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKGNvbnRleHRQYXRoKTtcblx0aWYgKG5hdkNvbmZpZ0ZvckNvbnRleHRQYXRoICYmIE9iamVjdC5rZXlzKG5hdkNvbmZpZ0ZvckNvbnRleHRQYXRoKS5sZW5ndGggPiAwKSB7XG5cdFx0cmV0dXJuIGNvbnRleHRQYXRoO1xuXHR9XG5cblx0cmV0dXJuIGRhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0ID8gZGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQubmFtZSA6IGRhdGFNb2RlbFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZTtcbn1cblxuLyoqXG4gKiBTZXRzIHRoZSAndW5pdCcgYW5kICd0ZXh0QXJyYW5nZW1lbnQnIHByb3BlcnRpZXMgaW4gY29sdW1ucyB3aGVuIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgZW50aXR5IHR5cGUgZGlzcGxheWVkIGluIHRoZSB0YWJsZVxuICogQHBhcmFtIHRhYmxlQ29sdW1ucyBUaGUgY29sdW1ucyB0byBiZSB1cGRhdGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVMaW5rZWRQcm9wZXJ0aWVzKGVudGl0eVR5cGU6IEVudGl0eVR5cGUsIHRhYmxlQ29sdW1uczogVGFibGVDb2x1bW5bXSkge1xuXHRmdW5jdGlvbiBmaW5kQ29sdW1uQnlQYXRoKHBhdGg6IHN0cmluZyk6IFRhYmxlQ29sdW1uIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gdGFibGVDb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4ge1xuXHRcdFx0Y29uc3QgYW5ub3RhdGlvbkNvbHVtbiA9IGNvbHVtbiBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdFx0XHRyZXR1cm4gYW5ub3RhdGlvbkNvbHVtbi5wcm9wZXJ0eUluZm9zID09PSB1bmRlZmluZWQgJiYgYW5ub3RhdGlvbkNvbHVtbi5yZWxhdGl2ZVBhdGggPT09IHBhdGg7XG5cdFx0fSk7XG5cdH1cblxuXHR0YWJsZUNvbHVtbnMuZm9yRWFjaCgob0NvbHVtbikgPT4ge1xuXHRcdGNvbnN0IG9UYWJsZUNvbHVtbiA9IG9Db2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdGlmIChvVGFibGVDb2x1bW4ucHJvcGVydHlJbmZvcyA9PT0gdW5kZWZpbmVkICYmIG9UYWJsZUNvbHVtbi5yZWxhdGl2ZVBhdGgpIHtcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5maW5kKChvUHJvcDogUHJvcGVydHkpID0+IG9Qcm9wLm5hbWUgPT09IG9UYWJsZUNvbHVtbi5yZWxhdGl2ZVBhdGgpO1xuXHRcdFx0aWYgKG9Qcm9wZXJ0eSkge1xuXHRcdFx0XHRjb25zdCBvVW5pdCA9IGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5KG9Qcm9wZXJ0eSkgfHwgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eShvUHJvcGVydHkpO1xuXHRcdFx0XHRjb25zdCBvVGltZXpvbmUgPSBnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eShvUHJvcGVydHkpO1xuXHRcdFx0XHRjb25zdCBzVGltZXpvbmUgPSBvUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lO1xuXHRcdFx0XHRpZiAob1VuaXQpIHtcblx0XHRcdFx0XHRjb25zdCBvVW5pdENvbHVtbiA9IGZpbmRDb2x1bW5CeVBhdGgob1VuaXQubmFtZSk7XG5cdFx0XHRcdFx0b1RhYmxlQ29sdW1uLnVuaXQgPSBvVW5pdENvbHVtbj8ubmFtZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBzVW5pdCA9IG9Qcm9wZXJ0eT8uYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSB8fCBvUHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uVW5pdDtcblx0XHRcdFx0XHRpZiAoc1VuaXQpIHtcblx0XHRcdFx0XHRcdG9UYWJsZUNvbHVtbi51bml0VGV4dCA9IGAke3NVbml0fWA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvVGltZXpvbmUpIHtcblx0XHRcdFx0XHRjb25zdCBvVGltZXpvbmVDb2x1bW4gPSBmaW5kQ29sdW1uQnlQYXRoKG9UaW1lem9uZS5uYW1lKTtcblx0XHRcdFx0XHRvVGFibGVDb2x1bW4udGltZXpvbmUgPSBvVGltZXpvbmVDb2x1bW4/Lm5hbWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc1RpbWV6b25lKSB7XG5cdFx0XHRcdFx0b1RhYmxlQ29sdW1uLnRpbWV6b25lVGV4dCA9IHNUaW1lem9uZS50b1N0cmluZygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgZGlzcGxheU1vZGUgPSBnZXREaXNwbGF5TW9kZShvUHJvcGVydHkpLFxuXHRcdFx0XHRcdHRleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5LmFubm90YXRpb25zLkNvbW1vbj8uVGV4dDtcblx0XHRcdFx0aWYgKGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uKHRleHRBbm5vdGF0aW9uKSAmJiBkaXNwbGF5TW9kZSAhPT0gXCJWYWx1ZVwiKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RleHRDb2x1bW4gPSBmaW5kQ29sdW1uQnlQYXRoKHRleHRBbm5vdGF0aW9uLnBhdGgpO1xuXHRcdFx0XHRcdGlmIChvVGV4dENvbHVtbiAmJiBvVGV4dENvbHVtbi5uYW1lICE9PSBvVGFibGVDb2x1bW4ubmFtZSkge1xuXHRcdFx0XHRcdFx0b1RhYmxlQ29sdW1uLnRleHRBcnJhbmdlbWVudCA9IHtcblx0XHRcdFx0XHRcdFx0dGV4dFByb3BlcnR5OiBvVGV4dENvbHVtbi5uYW1lLFxuXHRcdFx0XHRcdFx0XHRtb2RlOiBkaXNwbGF5TW9kZVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTZW1hbnRpY0tleXNBbmRUaXRsZUluZm8oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRjb25zdCBoZWFkZXJJbmZvVGl0bGVQYXRoID0gKGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUoKT8uYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJJbmZvPy5UaXRsZSBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlXG5cdFx0Py5wYXRoO1xuXHRjb25zdCBzZW1hbnRpY0tleUFubm90YXRpb25zID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uRW50aXR5VHlwZSgpPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY0tleTtcblx0Y29uc3QgaGVhZGVySW5mb1R5cGVOYW1lID0gY29udmVydGVyQ29udGV4dD8uZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUoKT8uYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJJbmZvPy5UeXBlTmFtZTtcblx0Y29uc3Qgc2VtYW50aWNLZXlDb2x1bW5zOiBzdHJpbmdbXSA9IFtdO1xuXHRpZiAoc2VtYW50aWNLZXlBbm5vdGF0aW9ucykge1xuXHRcdHNlbWFudGljS2V5QW5ub3RhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbHVtbikge1xuXHRcdFx0c2VtYW50aWNLZXlDb2x1bW5zLnB1c2gob0NvbHVtbi52YWx1ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4geyBoZWFkZXJJbmZvVGl0bGVQYXRoLCBzZW1hbnRpY0tleUNvbHVtbnMsIGhlYWRlckluZm9UeXBlTmFtZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGFibGVWaXN1YWxpemF0aW9uKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj86IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlLFxuXHRpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50PzogYm9vbGVhbixcblx0dmlld0NvbmZpZ3VyYXRpb24/OiBWaWV3UGF0aENvbmZpZ3VyYXRpb24sXG5cdGlzSW5zaWdodHNFbmFibGVkPzogYm9vbGVhblxuKTogVGFibGVWaXN1YWxpemF0aW9uIHtcblx0Y29uc3QgdGFibGVNYW5pZmVzdENvbmZpZyA9IGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKFxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbixcblx0XHR2aXN1YWxpemF0aW9uUGF0aCxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGlzQ29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbnRcblx0KTtcblx0Y29uc3QgeyBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIH0gPSBzcGxpdFBhdGgodmlzdWFsaXphdGlvblBhdGgpO1xuXHRjb25zdCBuYXZpZ2F0aW9uVGFyZ2V0UGF0aCA9IGdldE5hdmlnYXRpb25UYXJnZXRQYXRoKGNvbnZlcnRlckNvbnRleHQsIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgpO1xuXHRjb25zdCBuYXZpZ2F0aW9uU2V0dGluZ3MgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKG5hdmlnYXRpb25UYXJnZXRQYXRoKTtcblx0Y29uc3QgY29sdW1ucyA9IGdldFRhYmxlQ29sdW1ucyhsaW5lSXRlbUFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0LCBuYXZpZ2F0aW9uU2V0dGluZ3MsIGlzSW5zaWdodHNFbmFibGVkKTtcblx0Y29uc3Qgb3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKGxpbmVJdGVtQW5ub3RhdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZSA9IGdldFNlbWFudGljS2V5c0FuZFRpdGxlSW5mbyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgdGFibGVBY3Rpb25zID0gZ2V0VGFibGVBY3Rpb25zKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQsIG5hdmlnYXRpb25TZXR0aW5ncyk7XG5cblx0Y29uc3Qgb1Zpc3VhbGl6YXRpb246IFRhYmxlVmlzdWFsaXphdGlvbiA9IHtcblx0XHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZSxcblx0XHRhbm5vdGF0aW9uOiBnZXRUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uKFxuXHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLFxuXHRcdFx0dmlzdWFsaXphdGlvblBhdGgsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0dGFibGVNYW5pZmVzdENvbmZpZyxcblx0XHRcdGNvbHVtbnMsXG5cdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbixcblx0XHRcdHZpZXdDb25maWd1cmF0aW9uLFxuXHRcdFx0aXNJbnNpZ2h0c0VuYWJsZWRcblx0XHQpLFxuXHRcdGNvbnRyb2w6IHRhYmxlTWFuaWZlc3RDb25maWcsXG5cdFx0YWN0aW9uczogcmVtb3ZlRHVwbGljYXRlQWN0aW9ucyh0YWJsZUFjdGlvbnMuYWN0aW9ucyksXG5cdFx0Y29tbWFuZEFjdGlvbnM6IHRhYmxlQWN0aW9ucy5jb21tYW5kQWN0aW9ucyxcblx0XHRjb2x1bW5zOiBjb2x1bW5zLFxuXHRcdG9wZXJhdGlvbkF2YWlsYWJsZU1hcDogSlNPTi5zdHJpbmdpZnkob3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRvcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzOiBnZXRPcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzKG9wZXJhdGlvbkF2YWlsYWJsZU1hcCwgY29udmVydGVyQ29udGV4dCksXG5cdFx0aGVhZGVySW5mb1RpdGxlOiBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUuaGVhZGVySW5mb1RpdGxlUGF0aCxcblx0XHRzZW1hbnRpY0tleXM6IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZS5zZW1hbnRpY0tleUNvbHVtbnMsXG5cdFx0aGVhZGVySW5mb1R5cGVOYW1lOiBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUuaGVhZGVySW5mb1R5cGVOYW1lLFxuXHRcdGVuYWJsZSRzZWxlY3Q6IHRydWUsXG5cdFx0ZW5hYmxlJCRnZXRLZWVwQWxpdmVDb250ZXh0OiB0cnVlXG5cdH07XG5cblx0dXBkYXRlTGlua2VkUHJvcGVydGllcyhjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKGxpbmVJdGVtQW5ub3RhdGlvbiksIGNvbHVtbnMpO1xuXHR1cGRhdGVUYWJsZVZpc3VhbGl6YXRpb25Gb3JUeXBlKFxuXHRcdG9WaXN1YWxpemF0aW9uLFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUobGluZUl0ZW1Bbm5vdGF0aW9uKSxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uXG5cdCk7XG5cblx0cmV0dXJuIG9WaXN1YWxpemF0aW9uO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlRGVmYXVsdFRhYmxlVmlzdWFsaXphdGlvbihjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBpc0JsYW5rVGFibGU/OiBib29sZWFuKTogVGFibGVWaXN1YWxpemF0aW9uIHtcblx0Y29uc3QgdGFibGVNYW5pZmVzdENvbmZpZyA9IGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKHVuZGVmaW5lZCwgXCJcIiwgY29udmVydGVyQ29udGV4dCwgZmFsc2UpO1xuXHRjb25zdCBjb2x1bW5zID0gZ2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlKHt9LCBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgW10sIFtdLCBjb252ZXJ0ZXJDb250ZXh0LCB0YWJsZU1hbmlmZXN0Q29uZmlnLnR5cGUsIFtdKTtcblx0Y29uc3Qgb3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKHVuZGVmaW5lZCwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZSA9IGdldFNlbWFudGljS2V5c0FuZFRpdGxlSW5mbyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3Qgb1Zpc3VhbGl6YXRpb246IFRhYmxlVmlzdWFsaXphdGlvbiA9IHtcblx0XHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZSxcblx0XHRhbm5vdGF0aW9uOiBnZXRUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uKHVuZGVmaW5lZCwgXCJcIiwgY29udmVydGVyQ29udGV4dCwgdGFibGVNYW5pZmVzdENvbmZpZywgaXNCbGFua1RhYmxlID8gW10gOiBjb2x1bW5zKSxcblx0XHRjb250cm9sOiB0YWJsZU1hbmlmZXN0Q29uZmlnLFxuXHRcdGFjdGlvbnM6IFtdLFxuXHRcdGNvbHVtbnM6IGNvbHVtbnMsXG5cdFx0b3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBKU09OLnN0cmluZ2lmeShvcGVyYXRpb25BdmFpbGFibGVNYXApLFxuXHRcdG9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXM6IGdldE9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMob3BlcmF0aW9uQXZhaWxhYmxlTWFwLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRoZWFkZXJJbmZvVGl0bGU6IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZS5oZWFkZXJJbmZvVGl0bGVQYXRoLFxuXHRcdHNlbWFudGljS2V5czogc2VtYW50aWNLZXlzQW5kSGVhZGVySW5mb1RpdGxlLnNlbWFudGljS2V5Q29sdW1ucyxcblx0XHRoZWFkZXJJbmZvVHlwZU5hbWU6IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZS5oZWFkZXJJbmZvVHlwZU5hbWUsXG5cdFx0ZW5hYmxlJHNlbGVjdDogdHJ1ZSxcblx0XHRlbmFibGUkJGdldEtlZXBBbGl2ZUNvbnRleHQ6IHRydWVcblx0fTtcblxuXHR1cGRhdGVMaW5rZWRQcm9wZXJ0aWVzKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLCBjb2x1bW5zKTtcblx0dXBkYXRlVGFibGVWaXN1YWxpemF0aW9uRm9yVHlwZShvVmlzdWFsaXphdGlvbiwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdHJldHVybiBvVmlzdWFsaXphdGlvbjtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBtYXAgb2YgQ29yZS5PcGVyYXRpb25BdmFpbGFibGUgcHJvcGVydHkgcGF0aHMgZm9yIGFsbCBEYXRhRmllbGRGb3JBY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBsaW5lSXRlbUFubm90YXRpb24gVGhlIGluc3RhbmNlIG9mIHRoZSBsaW5lIGl0ZW1cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSByZWNvcmQgY29udGFpbmluZyBhbGwgYWN0aW9uIG5hbWVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIHByb3BlcnR5IHBhdGhzXG4gKi9cbmZ1bmN0aW9uIGdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuXHRyZXR1cm4gQWN0aW9uSGVscGVyLmdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChsaW5lSXRlbUFubm90YXRpb24sIFwidGFibGVcIiwgY29udmVydGVyQ29udGV4dCk7XG59XG5cbi8qKlxuICogR2V0cyB1cGRhdGFibGUgcHJvcGVydHlQYXRoIGZvciB0aGUgY3VycmVudCBlbnRpdHlzZXQgaWYgdmFsaWQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIHVwZGF0YWJsZSBwcm9wZXJ0eSBmb3IgdGhlIHJvd3NcbiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEVudGl0eVNldFVwZGF0YWJsZVBhdGgoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB7XG5cdGNvbnN0IHJlc3RyaWN0aW9ucyA9IGdldFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgZW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0Y29uc3QgdXBkYXRhYmxlID0gcmVzdHJpY3Rpb25zLmlzVXBkYXRhYmxlO1xuXHRjb25zdCBpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5ID0gIWlzQ29uc3RhbnQodXBkYXRhYmxlLmV4cHJlc3Npb24pICYmIHVwZGF0YWJsZS5uYXZpZ2F0aW9uRXhwcmVzc2lvbi5fdHlwZSA9PT0gXCJVbnJlc29sdmFibGVcIjtcblx0Y29uc3QgdXBkYXRhYmxlRXhwcmVzc2lvbiA9IGVudGl0eVNldD8uYW5ub3RhdGlvbnMuQ2FwYWJpbGl0aWVzPy5VcGRhdGVSZXN0cmljdGlvbnM/LlVwZGF0YWJsZTtcblx0Y29uc3QgdXBkYXRhYmxlUHJvcGVydHlQYXRoID0gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24odXBkYXRhYmxlRXhwcmVzc2lvbikgJiYgdXBkYXRhYmxlRXhwcmVzc2lvbi5wYXRoO1xuXG5cdHJldHVybiBpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5ID8gKHVwZGF0YWJsZVByb3BlcnR5UGF0aCBhcyBzdHJpbmcpIDogXCJcIjtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gcmV0cmlldmUgYWxsIHByb3BlcnR5IHBhdGhzIGFzc2lnbmVkIHRvIHRoZSBDb3JlLk9wZXJhdGlvbkF2YWlsYWJsZSBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBvcGVyYXRpb25BdmFpbGFibGVNYXAgVGhlIHJlY29yZCBjb25zaXN0aW5nIG9mIGFjdGlvbnMgYW5kIHRoZWlyIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIHByb3BlcnR5IHBhdGhzXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgQ1NWIHN0cmluZyBvZiBhbGwgcHJvcGVydHkgcGF0aHMgYXNzb2NpYXRlZCB3aXRoIHRoZSBDb3JlLk9wZXJhdGlvbkF2YWlsYWJsZSBhbm5vdGF0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldE9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMob3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB7XG5cdGNvbnN0IHByb3BlcnRpZXMgPSBuZXcgU2V0KCk7XG5cblx0Zm9yIChjb25zdCBhY3Rpb25OYW1lIGluIG9wZXJhdGlvbkF2YWlsYWJsZU1hcCkge1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IG9wZXJhdGlvbkF2YWlsYWJsZU1hcFthY3Rpb25OYW1lXTtcblx0XHRpZiAocHJvcGVydHlOYW1lID09PSBudWxsKSB7XG5cdFx0XHQvLyBBbm5vdGF0aW9uIGNvbmZpZ3VyZWQgd2l0aCBleHBsaWNpdCAnbnVsbCcgKGFjdGlvbiBhZHZlcnRpc2VtZW50IHJlbGV2YW50KVxuXHRcdFx0cHJvcGVydGllcy5hZGQoYWN0aW9uTmFtZSk7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgcHJvcGVydHlOYW1lID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHQvLyBBZGQgcHJvcGVydHkgcGF0aHMgYW5kIG5vdCBDb25zdGFudCB2YWx1ZXMuXG5cdFx0XHRwcm9wZXJ0aWVzLmFkZChwcm9wZXJ0eU5hbWUpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChwcm9wZXJ0aWVzLnNpemUpIHtcblx0XHQvLyBTb21lIGFjdGlvbnMgaGF2ZSBhbiBvcGVyYXRpb24gYXZhaWxhYmxlIGJhc2VkIG9uIHByb3BlcnR5IC0tPiB3ZSBuZWVkIHRvIGxvYWQgdGhlIEhlYWRlckluZm8uVGl0bGUgcHJvcGVydHlcblx0XHQvLyBzbyB0aGF0IHRoZSBkaWFsb2cgb24gcGFydGlhbCBhY3Rpb25zIGlzIGRpc3BsYXllZCBwcm9wZXJseSAoQkNQIDIxODAyNzE0MjUpXG5cdFx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRcdGNvbnN0IHRpdGxlUHJvcGVydHkgPSAoZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LkhlYWRlckluZm8/LlRpdGxlIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LnBhdGg7XG5cdFx0aWYgKHRpdGxlUHJvcGVydHkpIHtcblx0XHRcdHByb3BlcnRpZXMuYWRkKHRpdGxlUHJvcGVydHkpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBBcnJheS5mcm9tKHByb3BlcnRpZXMpLmpvaW4oXCIsXCIpO1xufVxuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgdGhlIERhdGFGaWVsZEZvckFjdGlvbiBhbmQgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIG9mIGEgbGluZSBpdGVtIGFuZFxuICogcmV0dXJucyBhbGwgdGhlIFVJLkhpZGRlbiBhbm5vdGF0aW9uIGV4cHJlc3Npb25zLlxuICpcbiAqIEBwYXJhbSBsaW5lSXRlbUFubm90YXRpb24gQ29sbGVjdGlvbiBvZiBkYXRhIGZpZWxkcyB1c2VkIGZvciByZXByZXNlbnRhdGlvbiBpbiBhIHRhYmxlIG9yIGxpc3RcbiAqIEBwYXJhbSBjdXJyZW50RW50aXR5VHlwZSBDdXJyZW50IGVudGl0eSB0eXBlXG4gKiBAcGFyYW0gY29udGV4dERhdGFNb2RlbE9iamVjdFBhdGggT2JqZWN0IHBhdGggb2YgdGhlIGRhdGEgbW9kZWxcbiAqIEBwYXJhbSBpc0VudGl0eVNldFxuICogQHJldHVybnMgQWxsIHRoZSBgVUkuSGlkZGVuYCBwYXRoIGV4cHJlc3Npb25zIGZvdW5kIGluIHRoZSByZWxldmFudCBhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldFVJSGlkZGVuRXhwRm9yQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0sXG5cdGN1cnJlbnRFbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRjb250ZXh0RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0aXNFbnRpdHlTZXQ6IGJvb2xlYW5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPltdIHtcblx0Y29uc3QgYVVpSGlkZGVuUGF0aEV4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IFtdO1xuXHRsaW5lSXRlbUFubm90YXRpb24uZm9yRWFjaCgoZGF0YUZpZWxkKSA9PiB7XG5cdFx0Ly8gQ2hlY2sgaWYgdGhlIGxpbmVJdGVtIGNvbnRleHQgaXMgdGhlIHNhbWUgYXMgdGhhdCBvZiB0aGUgYWN0aW9uOlxuXHRcdGlmIChcblx0XHRcdChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbiAmJlxuXHRcdFx0XHRkYXRhRmllbGQ/LkFjdGlvblRhcmdldD8uaXNCb3VuZCAmJlxuXHRcdFx0XHRjdXJyZW50RW50aXR5VHlwZSA9PT0gZGF0YUZpZWxkPy5BY3Rpb25UYXJnZXQuc291cmNlRW50aXR5VHlwZSkgfHxcblx0XHRcdChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiAmJlxuXHRcdFx0XHRkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0ICYmXG5cdFx0XHRcdGRhdGFGaWVsZD8uSW5saW5lPy52YWx1ZU9mKCkgIT09IHRydWUpXG5cdFx0KSB7XG5cdFx0XHRpZiAodHlwZW9mIGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGFVaUhpZGRlblBhdGhFeHByZXNzaW9ucy5wdXNoKGVxdWFsKGdldEJpbmRpbmdFeHBGcm9tQ29udGV4dChkYXRhRmllbGQsIGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoLCBpc0VudGl0eVNldCksIGZhbHNlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIGFVaUhpZGRlblBhdGhFeHByZXNzaW9ucztcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIGNoYW5nZSB0aGUgY29udGV4dCBjdXJyZW50bHkgcmVmZXJlbmNlZCBieSB0aGlzIGJpbmRpbmcgYnkgcmVtb3ZpbmcgdGhlIGxhc3QgbmF2aWdhdGlvbiBwcm9wZXJ0eS5cbiAqXG4gKiBJdCBpcyB1c2VkIChzcGVjaWZpY2FsbHkgaW4gdGhpcyBjYXNlKSwgdG8gdHJhbnNmb3JtIGEgYmluZGluZyBtYWRlIGZvciBhIE5hdlByb3AgY29udGV4dCAvTWFpbk9iamVjdC9OYXZQcm9wMS9OYXZQcm9wMixcbiAqIGludG8gYSBiaW5kaW5nIG9uIHRoZSBwcmV2aW91cyBjb250ZXh0IC9NYWluT2JqZWN0L05hdlByb3AxLlxuICpcbiAqIEBwYXJhbSBzb3VyY2UgRGF0YUZpZWxkRm9yQWN0aW9uIHwgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIHwgQ3VzdG9tQWN0aW9uXG4gKiBAcGFyYW0gY29udGV4dERhdGFNb2RlbE9iamVjdFBhdGggRGF0YU1vZGVsT2JqZWN0UGF0aFxuICogQHBhcmFtIGlzRW50aXR5U2V0XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uXG4gKi9cbmZ1bmN0aW9uIGdldEJpbmRpbmdFeHBGcm9tQ29udGV4dChcblx0c291cmNlOiBEYXRhRmllbGRGb3JBY3Rpb24gfCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gfCBDdXN0b21BY3Rpb24sXG5cdGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRpc0VudGl0eVNldDogYm9vbGVhblxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHVua25vd24+IHtcblx0bGV0IHNFeHByZXNzaW9uO1xuXHRpZiAoXG5cdFx0KHNvdXJjZSBhcyBEYXRhRmllbGRGb3JBY3Rpb24pPy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uIHx8XG5cdFx0KHNvdXJjZSBhcyBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pPy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXG5cdCkge1xuXHRcdHNFeHByZXNzaW9uID0gKHNvdXJjZSBhcyBEYXRhRmllbGRGb3JBY3Rpb24gfCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pPy5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbjtcblx0fSBlbHNlIHtcblx0XHRzRXhwcmVzc2lvbiA9IChzb3VyY2UgYXMgQ3VzdG9tQWN0aW9uKT8udmlzaWJsZTtcblx0fVxuXHRsZXQgc1BhdGg6IHN0cmluZztcblx0aWYgKGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uKHNFeHByZXNzaW9uKSkge1xuXHRcdHNQYXRoID0gc0V4cHJlc3Npb24ucGF0aDtcblx0fSBlbHNlIHtcblx0XHRzUGF0aCA9IHNFeHByZXNzaW9uIGFzIHN0cmluZztcblx0fVxuXHRpZiAoc1BhdGgpIHtcblx0XHRpZiAoKHNvdXJjZSBhcyBDdXN0b21BY3Rpb24pPy52aXNpYmxlKSB7XG5cdFx0XHRzUGF0aCA9IHNQYXRoLnN1YnN0cmluZygxLCBzUGF0aC5sZW5ndGggLSAxKTtcblx0XHR9XG5cdFx0aWYgKHNQYXRoLmluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0Ly9jaGVjayBpZiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBpcyBjb3JyZWN0OlxuXHRcdFx0Y29uc3QgYVNwbGl0UGF0aCA9IHNQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IGFTcGxpdFBhdGhbMF07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGlzTmF2aWdhdGlvblByb3BlcnR5KGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoPy50YXJnZXRPYmplY3QpICYmXG5cdFx0XHRcdGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5wYXJ0bmVyID09PSBzTmF2aWdhdGlvblBhdGhcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwoYVNwbGl0UGF0aC5zbGljZSgxKS5qb2luKFwiL1wiKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29uc3RhbnQodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBJbiBjYXNlIHRoZXJlIGlzIG5vIG5hdmlnYXRpb24gcHJvcGVydHksIGlmIGl0J3MgYW4gZW50aXR5U2V0LCB0aGUgZXhwcmVzc2lvbiBiaW5kaW5nIGhhcyB0byBiZSByZXR1cm5lZDpcblx0XHR9IGVsc2UgaWYgKGlzRW50aXR5U2V0KSB7XG5cdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwoc1BhdGgpO1xuXHRcdFx0Ly8gb3RoZXJ3aXNlIHRoZSBleHByZXNzaW9uIGJpbmRpbmcgY2Fubm90IGJlIHRha2VuIGludG8gYWNjb3VudCBmb3IgdGhlIHNlbGVjdGlvbiBtb2RlIGV2YWx1YXRpb246XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25zdGFudCh0cnVlKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNvbnN0YW50KHRydWUpO1xufVxuXG4vKipcbiAqIExvb3AgdGhyb3VnaCB0aGUgbWFuaWZlc3QgYWN0aW9ucyBhbmQgY2hlY2sgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiBJZiB0aGUgZGF0YSBmaWVsZCBpcyBhbHNvIHJlZmVyZW5jZWQgYXMgYSBjdXN0b20gYWN0aW9uLlxuICogSWYgdGhlIHVuZGVybHlpbmcgbWFuaWZlc3QgYWN0aW9uIGlzIGVpdGhlciBhIGJvdW5kIGFjdGlvbiBvciBoYXMgdGhlICdSZXF1aXJlc0NvbnRleHQnIHByb3BlcnR5IHNldCB0byB0cnVlLlxuICpcbiAqIElmIHNvLCB0aGUgJ3JlcXVpcmVzU2VsZWN0aW9uJyBwcm9wZXJ0eSBpcyBmb3JjZWQgdG8gJ3RydWUnIGluIHRoZSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkSWQgSWQgb2YgdGhlIERhdGFGaWVsZCBldmFsdWF0ZWRcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIGV2YWx1YXRlZFxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBEYXRhRmllbGQgaXMgZm91bmQgYW1vbmcgdGhlIG1hbmlmZXN0IGFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gdXBkYXRlTWFuaWZlc3RBY3Rpb25BbmRUYWdJdChcblx0ZGF0YUZpZWxkSWQ6IHN0cmluZyxcblx0ZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JBY3Rpb24gfCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPlxuKTogYm9vbGVhbiB7XG5cdHJldHVybiBPYmplY3Qua2V5cyhtYW5pZmVzdEFjdGlvbnMpLnNvbWUoKGFjdGlvbktleSkgPT4ge1xuXHRcdGlmIChhY3Rpb25LZXkgPT09IGRhdGFGaWVsZElkKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQWN0aW9uKT8uQWN0aW9uVGFyZ2V0Py5pc0JvdW5kIHx8XG5cdFx0XHRcdChkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKT8uUmVxdWlyZXNDb250ZXh0XG5cdFx0XHQpIHtcblx0XHRcdFx0bWFuaWZlc3RBY3Rpb25zW2RhdGFGaWVsZElkXS5yZXF1aXJlc1NlbGVjdGlvbiA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBMb29wIHRocm91Z2ggdGhlIERhdGFGaWVsZEZvckFjdGlvbiBhbmQgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIG9mIGEgbGluZSBpdGVtIGFuZFxuICogY2hlY2sgdGhlIGZvbGxvd2luZzpcbiAqIElmIGF0IGxlYXN0IG9uZSBvZiB0aGVtIGlzIGFsd2F5cyB2aXNpYmxlIGluIHRoZSB0YWJsZSB0b29sYmFyIGFuZCByZXF1aXJlcyBhIGNvbnRleHRcbiAqIElmIGFuIGFjdGlvbiBpcyBhbHNvIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LCBpdCBpcyBzZXQgYXNpZGUgYW5kIHdpbGwgYmUgY29uc2lkZXJlZFxuICogd2hlbiBnb2luZyB0aHJvdWdoIHRoZSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgZm9yIHJlcHJlc2VudGF0aW9uIGluIGEgdGFibGUgb3IgbGlzdFxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGN1cnJlbnRFbnRpdHlUeXBlIEN1cnJlbnQgRW50aXR5IFR5cGVcbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGVyZSBpcyBhdCBsZWFzdCAxIGFjdGlvbiB0aGF0IG1lZXRzIHRoZSBjcml0ZXJpYVxuICovXG5mdW5jdGlvbiBoYXNCb3VuZEFjdGlvbnNBbHdheXNWaXNpYmxlSW5Ub29sQmFyKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHRtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4sXG5cdGN1cnJlbnRFbnRpdHlUeXBlOiBFbnRpdHlUeXBlXG4pOiBib29sZWFuIHtcblx0cmV0dXJuIGxpbmVJdGVtQW5ub3RhdGlvbi5zb21lKChkYXRhRmllbGQpID0+IHtcblx0XHRpZiAoXG5cdFx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pICYmXG5cdFx0XHRkYXRhRmllbGQ/LklubGluZT8udmFsdWVPZigpICE9PSB0cnVlICYmXG5cdFx0XHQoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IGZhbHNlIHx8IGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpID09PSB1bmRlZmluZWQpXG5cdFx0KSB7XG5cdFx0XHRpZiAoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24pIHtcblx0XHRcdFx0Y29uc3QgbWFuaWZlc3RBY3Rpb25JZCA9IGdlbmVyYXRlKFtcIkRhdGFGaWVsZEZvckFjdGlvblwiLCBkYXRhRmllbGQuQWN0aW9uIGFzIHN0cmluZ10pO1xuXHRcdFx0XHQvLyBpZiB0aGUgRGF0YUZpZWxkRm9yQWN0b24gZnJvbSBhbm5vdGF0aW9uIGFsc28gZXhpc3RzIGluIHRoZSBtYW5pZmVzdCwgaXRzIHZpc2liaWxpdHkgd2lsbCBiZSBldmFsdWF0ZWQgbGF0ZXIgb25cblx0XHRcdFx0aWYgKHVwZGF0ZU1hbmlmZXN0QWN0aW9uQW5kVGFnSXQobWFuaWZlc3RBY3Rpb25JZCwgZGF0YUZpZWxkLCBtYW5pZmVzdEFjdGlvbnMpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIENoZWNrIGlmIHRoZSBsaW5lSXRlbSBjb250ZXh0IGlzIHRoZSBzYW1lIGFzIHRoYXQgb2YgdGhlIGFjdGlvbjpcblx0XHRcdFx0cmV0dXJuIGRhdGFGaWVsZD8uQWN0aW9uVGFyZ2V0Py5pc0JvdW5kICYmIGN1cnJlbnRFbnRpdHlUeXBlID09PSBkYXRhRmllbGQ/LkFjdGlvblRhcmdldC5zb3VyY2VFbnRpdHlUeXBlO1xuXHRcdFx0fSBlbHNlIGlmIChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0XHQvLyBpZiB0aGUgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gYW5ub3RhdGlvbiBhbHNvIGV4aXN0cyBpbiB0aGUgbWFuaWZlc3QsIGl0cyB2aXNpYmlsaXR5IHdpbGwgYmUgZXZhbHVhdGVkIGxhdGVyIG9uXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHR1cGRhdGVNYW5pZmVzdEFjdGlvbkFuZFRhZ0l0KFxuXHRcdFx0XHRcdFx0YERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjo6JHtkYXRhRmllbGQuU2VtYW50aWNPYmplY3R9Ojoke2RhdGFGaWVsZC5BY3Rpb259YCxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZCxcblx0XHRcdFx0XHRcdG1hbmlmZXN0QWN0aW9uc1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYXNDdXN0b21BY3Rpb25zQWx3YXlzVmlzaWJsZUluVG9vbEJhcihtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4pOiBib29sZWFuIHtcblx0cmV0dXJuIE9iamVjdC5rZXlzKG1hbmlmZXN0QWN0aW9ucykuc29tZSgoYWN0aW9uS2V5KSA9PiB7XG5cdFx0Y29uc3QgYWN0aW9uID0gbWFuaWZlc3RBY3Rpb25zW2FjdGlvbktleV07XG5cdFx0aWYgKGFjdGlvbi5yZXF1aXJlc1NlbGVjdGlvbiAmJiBhY3Rpb24udmlzaWJsZT8udG9TdHJpbmcoKSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pO1xufVxuXG4vKipcbiAqIEl0ZXJhdGVzIG92ZXIgdGhlIGN1c3RvbSBhY3Rpb25zICh3aXRoIGtleSByZXF1aXJlc1NlbGVjdGlvbikgZGVjbGFyZWQgaW4gdGhlIG1hbmlmZXN0IGZvciB0aGUgY3VycmVudCBsaW5lIGl0ZW0gYW5kIHJldHVybnMgYWxsIHRoZVxuICogdmlzaWJsZSBrZXkgdmFsdWVzIGFzIGFuIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBUaGUgYWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHJldHVybnMgQXJyYXk8RXhwcmVzc2lvbjxib29sZWFuPj4gQWxsIHRoZSB2aXNpYmxlIHBhdGggZXhwcmVzc2lvbnMgb2YgdGhlIGFjdGlvbnMgdGhhdCBtZWV0IHRoZSBjcml0ZXJpYVxuICovXG5mdW5jdGlvbiBnZXRWaXNpYmxlRXhwRm9yQ3VzdG9tQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQobWFuaWZlc3RBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+KTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10ge1xuXHRjb25zdCBhVmlzaWJsZVBhdGhFeHByZXNzaW9uczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10gPSBbXTtcblx0aWYgKG1hbmlmZXN0QWN0aW9ucykge1xuXHRcdE9iamVjdC5rZXlzKG1hbmlmZXN0QWN0aW9ucykuZm9yRWFjaCgoYWN0aW9uS2V5KSA9PiB7XG5cdFx0XHRjb25zdCBhY3Rpb24gPSBtYW5pZmVzdEFjdGlvbnNbYWN0aW9uS2V5XTtcblx0XHRcdGlmIChhY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24gPT09IHRydWUgJiYgYWN0aW9uLnZpc2libGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGFjdGlvbi52aXNpYmxlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0LypUaGUgZmluYWwgYWltIHdvdWxkIGJlIHRvIGNoZWNrIGlmIHRoZSBwYXRoIGV4cHJlc3Npb24gZGVwZW5kcyBvbiB0aGUgcGFyZW50IGNvbnRleHRcblx0XHRcdFx0XHRhbmQgY29uc2lkZXJzIG9ubHkgdGhvc2UgZXhwcmVzc2lvbnMgZm9yIHRoZSBleHByZXNzaW9uIGV2YWx1YXRpb24sXG5cdFx0XHRcdFx0YnV0IGN1cnJlbnRseSBub3QgcG9zc2libGUgZnJvbSB0aGUgbWFuaWZlc3QgYXMgdGhlIHZpc2libGUga2V5IGlzIGJvdW5kIG9uIHRoZSBwYXJlbnQgZW50aXR5LlxuXHRcdFx0XHRcdFRyaWNreSB0byBkaWZmZXJlbnRpYXRlIHRoZSBwYXRoIGFzIGl0J3MgZG9uZSBmb3IgdGhlIEhpZGRlbiBhbm5vdGF0aW9uLlxuXHRcdFx0XHRcdEZvciB0aGUgdGltZSBiZWluZyB3ZSBjb25zaWRlciBhbGwgdGhlIHBhdGhzIG9mIHRoZSBtYW5pZmVzdCovXG5cblx0XHRcdFx0XHRhVmlzaWJsZVBhdGhFeHByZXNzaW9ucy5wdXNoKHJlc29sdmVCaW5kaW5nU3RyaW5nKGFjdGlvbj8udmlzaWJsZT8udmFsdWVPZigpKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYVZpc2libGVQYXRoRXhwcmVzc2lvbnM7XG59XG5cbi8qKlxuICogRXZhbHVhdGUgaWYgdGhlIHBhdGggaXMgc3RhdGljYWxseSBkZWxldGFibGUgb3IgdXBkYXRhYmxlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgdGFibGUgY2FwYWJpbGl0aWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDYXBhYmlsaXR5UmVzdHJpY3Rpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IFRhYmxlQ2FwYWJpbGl0eVJlc3RyaWN0aW9uIHtcblx0Y29uc3QgaXNEZWxldGFibGUgPSBpc1BhdGhEZWxldGFibGUoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpO1xuXHRjb25zdCBpc1VwZGF0YWJsZSA9IGlzUGF0aFVwZGF0YWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSk7XG5cdHJldHVybiB7XG5cdFx0aXNEZWxldGFibGU6ICEoaXNDb25zdGFudChpc0RlbGV0YWJsZSkgJiYgaXNEZWxldGFibGUudmFsdWUgPT09IGZhbHNlKSxcblx0XHRpc1VwZGF0YWJsZTogIShpc0NvbnN0YW50KGlzVXBkYXRhYmxlKSAmJiBpc1VwZGF0YWJsZS52YWx1ZSA9PT0gZmFsc2UpXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZWxlY3Rpb25Nb2RlKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRpc0VudGl0eVNldDogYm9vbGVhbixcblx0dGFyZ2V0Q2FwYWJpbGl0aWVzOiBUYWJsZUNhcGFiaWxpdHlSZXN0cmljdGlvbixcblx0ZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24/OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4sXG5cdG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiA9IGNvbnN0YW50KGZhbHNlKVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0bGV0IHNlbGVjdGlvbk1vZGUgPSB0YWJsZU1hbmlmZXN0U2V0dGluZ3MudGFibGVTZXR0aW5ncz8uc2VsZWN0aW9uTW9kZTtcblx0Ly8gSWYgdGhlIHNlbGVjdGlvbiBtb2RlIGlzIGZvcmNlZCB0byAnTm9uZScgaW4gdGhlIG1hbmlmZXN0L21hY3JvIHRhYmxlIHBhcmFtZXRlcnMsIHdlIGlnbm9yZSB0aGUgcmVzdCBvZiB0aGUgbG9naWMgYW5kIGtlZXAgaXQgYXMgc3BlY2lmaWVkXG5cdGlmICghbGluZUl0ZW1Bbm5vdGF0aW9uIHx8IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuTm9uZSkge1xuXHRcdHJldHVybiBTZWxlY3Rpb25Nb2RlLk5vbmU7XG5cdH1cblx0bGV0IGFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnM6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPltdID0gW10sXG5cdFx0YVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbnM6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPltdID0gW107XG5cdGNvbnN0IG1hbmlmZXN0QWN0aW9ucyA9IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKS5hY3Rpb25zLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0W10sXG5cdFx0dW5kZWZpbmVkLFxuXHRcdGZhbHNlXG5cdCk7XG5cdGxldCBpc1BhcmVudERlbGV0YWJsZSwgcGFyZW50RW50aXR5U2V0RGVsZXRhYmxlO1xuXHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLk9iamVjdFBhZ2UpIHtcblx0XHRpc1BhcmVudERlbGV0YWJsZSA9IGlzUGF0aERlbGV0YWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSk7XG5cdFx0cGFyZW50RW50aXR5U2V0RGVsZXRhYmxlID0gaXNQYXJlbnREZWxldGFibGUgPyBjb21waWxlRXhwcmVzc2lvbihpc1BhcmVudERlbGV0YWJsZSwgdHJ1ZSkgOiBpc1BhcmVudERlbGV0YWJsZTtcblx0fVxuXG5cdGNvbnN0IGJNYXNzRWRpdEVuYWJsZWQ6IGJvb2xlYW4gPSAhaXNDb25zdGFudChtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uKSB8fCBtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uLnZhbHVlICE9PSBmYWxzZTtcblx0aWYgKCFzZWxlY3Rpb25Nb2RlIHx8IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuQXV0bykge1xuXHRcdHNlbGVjdGlvbk1vZGUgPSBTZWxlY3Rpb25Nb2RlLk11bHRpO1xuXHR9XG5cdGlmIChiTWFzc0VkaXRFbmFibGVkKSB7XG5cdFx0Ly8gT3ZlcnJpZGUgZGVmYXVsdCBzZWxlY3Rpb24gbW9kZSB3aGVuIG1hc3MgZWRpdCBpcyB2aXNpYmxlXG5cdFx0c2VsZWN0aW9uTW9kZSA9IHNlbGVjdGlvbk1vZGUgPT09IFNlbGVjdGlvbk1vZGUuU2luZ2xlID8gU2VsZWN0aW9uTW9kZS5TaW5nbGUgOiBTZWxlY3Rpb25Nb2RlLk11bHRpO1xuXHR9XG5cblx0aWYgKFxuXHRcdGhhc0JvdW5kQWN0aW9uc0Fsd2F5c1Zpc2libGVJblRvb2xCYXIobGluZUl0ZW1Bbm5vdGF0aW9uLCBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucywgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkpIHx8XG5cdFx0aGFzQ3VzdG9tQWN0aW9uc0Fsd2F5c1Zpc2libGVJblRvb2xCYXIobWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMpXG5cdCkge1xuXHRcdHJldHVybiBzZWxlY3Rpb25Nb2RlO1xuXHR9XG5cdGFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMgPSBnZXRVSUhpZGRlbkV4cEZvckFjdGlvbnNSZXF1aXJpbmdDb250ZXh0KFxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbixcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSxcblx0XHRpc0VudGl0eVNldFxuXHQpO1xuXHRhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucyA9IGdldFZpc2libGVFeHBGb3JDdXN0b21BY3Rpb25zUmVxdWlyaW5nQ29udGV4dChtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucyk7XG5cblx0Ly8gTm8gYWN0aW9uIHJlcXVpcmluZyBhIGNvbnRleHQ6XG5cdGlmIChcblx0XHRhSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zLmxlbmd0aCA9PT0gMCAmJlxuXHRcdGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zLmxlbmd0aCA9PT0gMCAmJlxuXHRcdChkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiB8fCBiTWFzc0VkaXRFbmFibGVkKVxuXHQpIHtcblx0XHRpZiAoIWlzRW50aXR5U2V0KSB7XG5cdFx0XHQvLyBFeGFtcGxlOiBPUCBjYXNlXG5cdFx0XHRpZiAodGFyZ2V0Q2FwYWJpbGl0aWVzLmlzRGVsZXRhYmxlIHx8IHBhcmVudEVudGl0eVNldERlbGV0YWJsZSAhPT0gXCJmYWxzZVwiIHx8IGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHRcdFx0Ly8gQnVpbGRpbmcgZXhwcmVzc2lvbiBmb3IgZGVsZXRlIGFuZCBtYXNzIGVkaXRcblx0XHRcdFx0Y29uc3QgYnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24gPSBvcihcblx0XHRcdFx0XHRkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiB8fCB0cnVlLCAvLyBkZWZhdWx0IGRlbGV0ZSB2aXNpYmlsaXR5IGFzIHRydWVcblx0XHRcdFx0XHRtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uXG5cdFx0XHRcdCk7XG5cdFx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0XHRpZkVsc2UoYW5kKFVJLklzRWRpdGFibGUsIGJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uKSwgY29uc3RhbnQoc2VsZWN0aW9uTW9kZSksIGNvbnN0YW50KFNlbGVjdGlvbk1vZGUuTm9uZSkpXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gU2VsZWN0aW9uTW9kZS5Ob25lO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRW50aXR5U2V0IGRlbGV0YWJsZTpcblx0XHR9IGVsc2UgaWYgKGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHRcdC8vIGV4YW1wbGU6IExSIHNjZW5hcmlvXG5cdFx0XHRyZXR1cm4gc2VsZWN0aW9uTW9kZTtcblx0XHR9IGVsc2UgaWYgKHRhcmdldENhcGFiaWxpdGllcy5pc0RlbGV0YWJsZSAmJiBkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbikge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiwgY29uc3RhbnQoc2VsZWN0aW9uTW9kZSksIGNvbnN0YW50KFwiTm9uZVwiKSkpO1xuXHRcdFx0Ly8gRW50aXR5U2V0IG5vdCBkZWxldGFibGU6XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBTZWxlY3Rpb25Nb2RlLk5vbmU7XG5cdFx0fVxuXHRcdC8vIFRoZXJlIGFyZSBhY3Rpb25zIHJlcXVpcmluZyBhIGNvbnRleHQ6XG5cdH0gZWxzZSBpZiAoIWlzRW50aXR5U2V0KSB7XG5cdFx0Ly8gRXhhbXBsZTogT1AgY2FzZVxuXHRcdGlmICh0YXJnZXRDYXBhYmlsaXRpZXMuaXNEZWxldGFibGUgfHwgcGFyZW50RW50aXR5U2V0RGVsZXRhYmxlICE9PSBcImZhbHNlXCIgfHwgYk1hc3NFZGl0RW5hYmxlZCkge1xuXHRcdFx0Ly8gVXNlIHNlbGVjdGlvbk1vZGUgaW4gZWRpdCBtb2RlIGlmIGRlbGV0ZSBpcyBlbmFibGVkIG9yIG1hc3MgZWRpdCBpcyB2aXNpYmxlXG5cdFx0XHRjb25zdCBlZGl0TW9kZWJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uID0gaWZFbHNlKFxuXHRcdFx0XHRiTWFzc0VkaXRFbmFibGVkICYmICF0YXJnZXRDYXBhYmlsaXRpZXMuaXNEZWxldGFibGUsXG5cdFx0XHRcdG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb24sXG5cdFx0XHRcdGNvbnN0YW50KHRydWUpXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRpZkVsc2UoXG5cdFx0XHRcdFx0YW5kKFVJLklzRWRpdGFibGUsIGVkaXRNb2RlYnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24pLFxuXHRcdFx0XHRcdGNvbnN0YW50KHNlbGVjdGlvbk1vZGUpLFxuXHRcdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRcdG9yKC4uLmFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMuY29uY2F0KGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zKSksXG5cdFx0XHRcdFx0XHRjb25zdGFudChzZWxlY3Rpb25Nb2RlKSxcblx0XHRcdFx0XHRcdGNvbnN0YW50KFNlbGVjdGlvbk1vZGUuTm9uZSlcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRcdG9yKC4uLmFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMuY29uY2F0KGFWaXNpYmxlQmluZGluZ0V4cHJlc3Npb25zKSksXG5cdFx0XHRcdFx0Y29uc3RhbnQoc2VsZWN0aW9uTW9kZSksXG5cdFx0XHRcdFx0Y29uc3RhbnQoU2VsZWN0aW9uTW9kZS5Ob25lKVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH1cblx0XHQvL0VudGl0eVNldCBkZWxldGFibGU6XG5cdH0gZWxzZSBpZiAodGFyZ2V0Q2FwYWJpbGl0aWVzLmlzRGVsZXRhYmxlIHx8IGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHQvLyBFeGFtcGxlOiBMUiBzY2VuYXJpb1xuXHRcdHJldHVybiBzZWxlY3Rpb25Nb2RlO1xuXHRcdC8vRW50aXR5U2V0IG5vdCBkZWxldGFibGU6XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRvciguLi5hSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zLmNvbmNhdChhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucyksIG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb24pLFxuXHRcdFx0XHRjb25zdGFudChzZWxlY3Rpb25Nb2RlKSxcblx0XHRcdFx0Y29uc3RhbnQoU2VsZWN0aW9uTW9kZS5Ob25lKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gcmV0cmlldmUgYWxsIHRhYmxlIGFjdGlvbnMgZnJvbSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgdGFibGUgYW5ub3RhdGlvbiBhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGdldFRhYmxlQW5ub3RhdGlvbkFjdGlvbnMobGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSwgdmlzdWFsaXphdGlvblBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRjb25zdCB0YWJsZUFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IFtdO1xuXHRjb25zdCBoaWRkZW5UYWJsZUFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IFtdO1xuXG5cdGNvbnN0IGNvcHlEYXRhRmllbGQgPSBnZXRDb3B5QWN0aW9uKFxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbi5maWx0ZXIoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuIGRhdGFGaWVsZElzQ29weUFjdGlvbihkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQWN0aW9uVHlwZXMpO1xuXHRcdH0pIGFzIERhdGFGaWVsZEZvckFjdGlvblR5cGVzW11cblx0KTtcblxuXHRjb25zdCBzRW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLmZ1bGx5UXVhbGlmaWVkTmFtZTtcblxuXHRpZiAoY29weURhdGFGaWVsZCkge1xuXHRcdHRhYmxlQWN0aW9ucy5wdXNoKHtcblx0XHRcdHR5cGU6IEFjdGlvblR5cGUuQ29weSxcblx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoY29weURhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGNvcHlEYXRhRmllbGQpLFxuXHRcdFx0ZW5hYmxlZDogY29tcGlsZUV4cHJlc3Npb24oZXF1YWwocGF0aEluTW9kZWwoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKSwgMSkpLFxuXHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdG5vdChcblx0XHRcdFx0XHRlcXVhbChcblx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdFx0Y29weURhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbixcblx0XHRcdFx0XHRcdFx0W10sXG5cdFx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZU1vZGVsUGF0aEZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpLFxuXHRcdFx0dGV4dDogY29weURhdGFGaWVsZC5MYWJlbD8udG9TdHJpbmcoKSA/PyBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJDX0NPTU1PTl9DT1BZXCIpLFxuXHRcdFx0aXNOYXZpZ2FibGU6IHRydWVcblx0XHR9KTtcblx0fVxuXG5cdGxpbmVJdGVtQW5ub3RhdGlvblxuXHRcdC5maWx0ZXIoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuICFkYXRhRmllbGRJc0NvcHlBY3Rpb24oZGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFjdGlvbik7XG5cdFx0fSlcblx0XHQuZm9yRWFjaCgoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0XHRpZiAoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IHRydWUpIHtcblx0XHRcdFx0aGlkZGVuVGFibGVBY3Rpb25zLnB1c2goe1xuXHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGVmYXVsdCxcblx0XHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdGlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QoZGF0YUZpZWxkKSAmJlxuXHRcdFx0XHRkYXRhRmllbGQuSW5saW5lPy52YWx1ZU9mKCkgIT09IHRydWUgJiZcblx0XHRcdFx0ZGF0YUZpZWxkLkRldGVybWluaW5nPy52YWx1ZU9mKCkgIT09IHRydWVcblx0XHRcdCkge1xuXHRcdFx0XHRzd2l0Y2ggKGRhdGFGaWVsZC4kVHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdFx0XHRcdFx0Ly8gVGhlcmUgYXJlIHRocmVlIGNhc2VzIHdoZW4gYSB0YWJsZSBhY3Rpb24gaGFzIGFuIE9wZXJhdGlvbkF2YWlsYWJsZSB0aGF0IGxlYWRzIHRvIGFuIGVuYWJsZW1lbnQgZXhwcmVzc2lvblxuXHRcdFx0XHRcdFx0Ly8gYW5kIGlzIG5vdCBkZXBlbmRlbnQgdXBvbiB0aGUgdGFibGUgZW50cmllcy5cblx0XHRcdFx0XHRcdC8vIDEuIEFuIGFjdGlvbiB3aXRoIGFuIG92ZXJsb2FkLCB0aGF0IGlzIGV4ZWN1dGVkIGFnYWluc3QgYSBwYXJlbnQgZW50aXR5LlxuXHRcdFx0XHRcdFx0Ly8gMi4gQW4gdW5ib3VuZCBhY3Rpb25cblx0XHRcdFx0XHRcdC8vIDMuIEEgc3RhdGljIGFjdGlvbiAodGhhdCBpcywgYm91bmQgdG8gYSBjb2xsZWN0aW9uKVxuXHRcdFx0XHRcdFx0bGV0IHVzZUVuYWJsZWRFeHByZXNzaW9uID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRpZiAoZGF0YUZpZWxkLkFjdGlvblRhcmdldD8uYW5ub3RhdGlvbnM/LkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGlmICghZGF0YUZpZWxkLkFjdGlvblRhcmdldD8uaXNCb3VuZCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIFVuYm91bmQgYWN0aW9uLiBJcyByZWNvZ25pc2VkLCBidXQgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIGNoZWNrcyBmb3IgaXNCb3VuZCA9IHRydWUsIHNvIG5vdCBnZW5lcmF0ZWQuXG5cdFx0XHRcdFx0XHRcdFx0dXNlRW5hYmxlZEV4cHJlc3Npb24gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGRhdGFGaWVsZC5BY3Rpb25UYXJnZXQ/LmlzQm91bmQgJiYgZGF0YUZpZWxkLkFjdGlvblRhcmdldD8uc291cmNlVHlwZSAhPT0gc0VudGl0eVR5cGUpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBPdmVybG9hZCBhY3Rpb25cblx0XHRcdFx0XHRcdFx0XHR1c2VFbmFibGVkRXhwcmVzc2lvbiA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZGF0YUZpZWxkLkFjdGlvblRhcmdldD8ucGFyYW1ldGVyc1swXS5pc0NvbGxlY3Rpb24pIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBTdGF0aWMgYWN0aW9uXG5cdFx0XHRcdFx0XHRcdFx0dXNlRW5hYmxlZEV4cHJlc3Npb24gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGNvbnN0IHRhYmxlQWN0aW9uOiBCYXNlQWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdFx0XHRcdG5vdChcblx0XHRcdFx0XHRcdFx0XHRcdGVxdWFsKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFtdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFJlbGF0aXZlTW9kZWxQYXRoRnVuY3Rpb24oKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRpc05hdmlnYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdFx0aWYgKHVzZUVuYWJsZWRFeHByZXNzaW9uKSB7XG5cdFx0XHRcdFx0XHRcdHRhYmxlQWN0aW9uLmVuYWJsZWQgPSBnZXRFbmFibGVkRm9yQW5ub3RhdGlvbkFjdGlvbihjb252ZXJ0ZXJDb250ZXh0LCBkYXRhRmllbGQuQWN0aW9uVGFyZ2V0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRhYmxlQWN0aW9ucy5wdXNoKHRhYmxlQWN0aW9uKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRcdFx0XHR0YWJsZUFjdGlvbnMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGRhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0XHRcdFx0XHRrZXk6IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKSxcblx0XHRcdFx0XHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0XHRcdFx0bm90KFxuXHRcdFx0XHRcdFx0XHRcdFx0ZXF1YWwoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0W10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0UmVsYXRpdmVNb2RlbFBhdGhGdW5jdGlvbigpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0cmV0dXJuIHtcblx0XHR0YWJsZUFjdGlvbnMsXG5cdFx0aGlkZGVuVGFibGVBY3Rpb25zXG5cdH07XG59XG5cbi8qKlxuICogR2VuZXJhdGUgdGhlIGJpbmRpbmdFeHByZXNzaW9uIGZvciB0aGUgaGlnaGxpZ2h0IHJvd1NldHRpbmcgcGFyYW1ldGVyLlxuICpcbiAqIEBwYXJhbSBjcml0aWNhbGl0eUFubm90YXRpb24gUGF0aCBvciB2YWx1ZSBvZiB0aGUgY3JpdGljYWxpdHlcbiAqIEBwYXJhbSBpc0RyYWZ0Um9vdE9yTm9kZSAgSXMgdGhlIGN1cnJlbnQgZW50aXR5U2V0IGFuIERyYWZ0IHJvb3Qgb3IgYSBub2RlXG4gKiBAcGFyYW0gdGFyZ2V0RW50aXR5VHlwZSBUaGUgdGFyZ2V0ZWQgZW50aXR5VHlwZVxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbkJpbmRpbmdcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodFJvd0JpbmRpbmcoXG5cdGNyaXRpY2FsaXR5QW5ub3RhdGlvbjogUGF0aEFubm90YXRpb25FeHByZXNzaW9uPENyaXRpY2FsaXR5VHlwZT4gfCBFbnVtVmFsdWU8Q3JpdGljYWxpdHlUeXBlPiB8IHVuZGVmaW5lZCxcblx0aXNEcmFmdFJvb3RPck5vZGU6IGJvb2xlYW4sXG5cdHRhcmdldEVudGl0eVR5cGU/OiBFbnRpdHlUeXBlXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248TWVzc2FnZVR5cGU+IHtcblx0bGV0IGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uOiBNZXNzYWdlVHlwZSB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxNZXNzYWdlVHlwZT4gPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHRpZiAoY3JpdGljYWxpdHlBbm5vdGF0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiBjcml0aWNhbGl0eUFubm90YXRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGNyaXRpY2FsaXR5QW5ub3RhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPE1lc3NhZ2VUeXBlPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gRW51bSBWYWx1ZSBzbyB3ZSBnZXQgdGhlIGNvcnJlc3BvbmRpbmcgc3RhdGljIHBhcnRcblx0XHRcdGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uID0gZ2V0TWVzc2FnZVR5cGVGcm9tQ3JpdGljYWxpdHlUeXBlKGNyaXRpY2FsaXR5QW5ub3RhdGlvbik7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgYU1pc3NpbmdLZXlzOiBQYXRoSW5Nb2RlbEV4cHJlc3Npb248c3RyaW5nPltdID0gW107XG5cdHRhcmdldEVudGl0eVR5cGU/LmtleXMuZm9yRWFjaCgoa2V5KSA9PiB7XG5cdFx0aWYgKGtleS5uYW1lICE9PSBcIklzQWN0aXZlRW50aXR5XCIpIHtcblx0XHRcdGFNaXNzaW5nS2V5cy5wdXNoKHBhdGhJbk1vZGVsKGtleS5uYW1lLCB1bmRlZmluZWQpKTtcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBmb3JtYXRSZXN1bHQoXG5cdFx0W1xuXHRcdFx0ZGVmYXVsdEhpZ2hsaWdodFJvd0RlZmluaXRpb24sXG5cdFx0XHRwYXRoSW5Nb2RlbChgZmlsdGVyZWRNZXNzYWdlc2AsIFwiaW50ZXJuYWxcIiksXG5cdFx0XHRpc0RyYWZ0Um9vdE9yTm9kZSAmJiBFbnRpdHkuSGFzQWN0aXZlLFxuXHRcdFx0aXNEcmFmdFJvb3RPck5vZGUgJiYgRW50aXR5LklzQWN0aXZlLFxuXHRcdFx0YCR7aXNEcmFmdFJvb3RPck5vZGV9YCxcblx0XHRcdC4uLmFNaXNzaW5nS2V5c1xuXHRcdF0sXG5cdFx0dGFibGVGb3JtYXR0ZXJzLnJvd0hpZ2hsaWdodGluZyxcblx0XHR0YXJnZXRFbnRpdHlUeXBlXG5cdCk7XG59XG5cbmZ1bmN0aW9uIF9nZXRDcmVhdGlvbkJlaGF2aW91cihcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCxcblx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25TZXR0aW5nczogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZ1xuKTogVGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbltcImNyZWF0ZVwiXSB7XG5cdGNvbnN0IG5hdmlnYXRpb24gPSBuYXZpZ2F0aW9uU2V0dGluZ3M/LmNyZWF0ZSB8fCBuYXZpZ2F0aW9uU2V0dGluZ3M/LmRldGFpbDtcblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzOiBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IG9yaWdpbmFsVGFibGVTZXR0aW5ncyA9ICh0YWJsZU1hbmlmZXN0U2V0dGluZ3MgJiYgdGFibGVNYW5pZmVzdFNldHRpbmdzLnRhYmxlU2V0dGluZ3MpIHx8IHt9O1xuXHQvLyBjcm9zcy1hcHBcblx0aWYgKG5hdmlnYXRpb24/Lm91dGJvdW5kICYmIG5hdmlnYXRpb24ub3V0Ym91bmREZXRhaWwgJiYgbmF2aWdhdGlvblNldHRpbmdzPy5jcmVhdGUpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bW9kZTogXCJFeHRlcm5hbFwiLFxuXHRcdFx0b3V0Ym91bmQ6IG5hdmlnYXRpb24ub3V0Ym91bmQsXG5cdFx0XHRvdXRib3VuZERldGFpbDogbmF2aWdhdGlvbi5vdXRib3VuZERldGFpbCxcblx0XHRcdG5hdmlnYXRpb25TZXR0aW5nczogbmF2aWdhdGlvblNldHRpbmdzXG5cdFx0fTtcblx0fVxuXG5cdGxldCBuZXdBY3Rpb247XG5cdGlmIChsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHQvLyBpbi1hcHBcblx0XHRjb25zdCB0YXJnZXRBbm5vdGF0aW9ucyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk/LmFubm90YXRpb25zO1xuXHRcdGNvbnN0IHRhcmdldEFubm90YXRpb25zQ29tbW9uID0gdGFyZ2V0QW5ub3RhdGlvbnM/LkNvbW1vbiBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19Db21tb24sXG5cdFx0XHR0YXJnZXRBbm5vdGF0aW9uc1Nlc3Npb24gPSB0YXJnZXRBbm5vdGF0aW9ucz8uU2Vzc2lvbiBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19TZXNzaW9uO1xuXHRcdG5ld0FjdGlvbiA9IHRhcmdldEFubm90YXRpb25zQ29tbW9uPy5EcmFmdFJvb3Q/Lk5ld0FjdGlvbiB8fCB0YXJnZXRBbm5vdGF0aW9uc1Nlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQ/Lk5ld0FjdGlvbjtcblxuXHRcdGlmICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdyAmJiBuZXdBY3Rpb24pIHtcblx0XHRcdC8vIEEgY29tYmluYXRpb24gb2YgJ0NyZWF0aW9uUm93JyBhbmQgJ05ld0FjdGlvbicgZG9lcyBub3QgbWFrZSBzZW5zZVxuXHRcdFx0dGhyb3cgRXJyb3IoYENyZWF0aW9uIG1vZGUgJyR7Q3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93fScgY2FuIG5vdCBiZSB1c2VkIHdpdGggYSBjdXN0b20gJ25ldycgYWN0aW9uICgke25ld0FjdGlvbn0pYCk7XG5cdFx0fVxuXHRcdGlmIChuYXZpZ2F0aW9uPy5yb3V0ZSkge1xuXHRcdFx0Ly8gcm91dGUgc3BlY2lmaWVkXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRtb2RlOiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUsXG5cdFx0XHRcdGFwcGVuZDogdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRlQXRFbmQsXG5cdFx0XHRcdG5ld0FjdGlvbjogbmV3QWN0aW9uPy50b1N0cmluZygpLFxuXHRcdFx0XHRuYXZpZ2F0ZVRvVGFyZ2V0OiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5OZXdQYWdlID8gbmF2aWdhdGlvbi5yb3V0ZSA6IHVuZGVmaW5lZCAvLyBuYXZpZ2F0ZSBvbmx5IGluIE5ld1BhZ2UgbW9kZVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHQvLyBubyBuYXZpZ2F0aW9uIG9yIG5vIHJvdXRlIHNwZWNpZmllZCAtIGZhbGxiYWNrIHRvIGlubGluZSBjcmVhdGUgaWYgb3JpZ2luYWwgY3JlYXRpb24gbW9kZSB3YXMgJ05ld1BhZ2UnXG5cdGlmICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5OZXdQYWdlKSB7XG5cdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlID0gQ3JlYXRpb25Nb2RlLklubGluZTtcblx0XHQvLyBJbiBjYXNlIHRoZXJlIHdhcyBubyBzcGVjaWZpYyBjb25maWd1cmF0aW9uIGZvciB0aGUgY3JlYXRlQXRFbmQgd2UgZm9yY2UgaXQgdG8gZmFsc2Vcblx0XHRpZiAob3JpZ2luYWxUYWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uY3JlYXRlQXRFbmQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRlQXRFbmQgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG1vZGU6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0aW9uTW9kZSxcblx0XHRhcHBlbmQ6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0ZUF0RW5kLFxuXHRcdG5ld0FjdGlvbjogbmV3QWN0aW9uPy50b1N0cmluZygpXG5cdH07XG59XG5cbmNvbnN0IF9nZXRSb3dDb25maWd1cmF0aW9uUHJvcGVydHkgPSBmdW5jdGlvbiAoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25TZXR0aW5nczogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0dGFyZ2V0UGF0aDogc3RyaW5nLFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZVxuKSB7XG5cdGxldCBwcmVzc1Byb3BlcnR5LCBuYXZpZ2F0aW9uVGFyZ2V0O1xuXHRsZXQgY3JpdGljYWxpdHlQcm9wZXJ0eTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPE1lc3NhZ2VUeXBlPiA9IGNvbnN0YW50KE1lc3NhZ2VUeXBlLk5vbmUpO1xuXHRjb25zdCB0YXJnZXRFbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGlmIChuYXZpZ2F0aW9uU2V0dGluZ3MgJiYgbGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0bmF2aWdhdGlvblRhcmdldCA9IG5hdmlnYXRpb25TZXR0aW5ncy5kaXNwbGF5Py50YXJnZXQgfHwgbmF2aWdhdGlvblNldHRpbmdzLmRldGFpbD8ub3V0Ym91bmQ7XG5cdFx0Y29uc3QgdGFyZ2V0RW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0XHRjcml0aWNhbGl0eVByb3BlcnR5ID0gZ2V0SGlnaGxpZ2h0Um93QmluZGluZyhcblx0XHRcdGxpbmVJdGVtQW5ub3RhdGlvbi5hbm5vdGF0aW9ucz8uVUk/LkNyaXRpY2FsaXR5LFxuXHRcdFx0ISFNb2RlbEhlbHBlci5nZXREcmFmdFJvb3QodGFyZ2V0RW50aXR5U2V0KSB8fCAhIU1vZGVsSGVscGVyLmdldERyYWZ0Tm9kZSh0YXJnZXRFbnRpdHlTZXQpLFxuXHRcdFx0dGFyZ2V0RW50aXR5VHlwZVxuXHRcdCk7XG5cdFx0aWYgKG5hdmlnYXRpb25UYXJnZXQpIHtcblx0XHRcdHByZXNzUHJvcGVydHkgPVxuXHRcdFx0XHRcIi5oYW5kbGVycy5vbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQoICRjb250cm9sbGVyICwnXCIgKyBuYXZpZ2F0aW9uVGFyZ2V0ICsgXCInLCAkeyRwYXJhbWV0ZXJzPmJpbmRpbmdDb250ZXh0fSlcIjtcblx0XHR9XG5cdFx0aWYgKCFuYXZpZ2F0aW9uVGFyZ2V0ICYmIG5hdmlnYXRpb25TZXR0aW5ncy5kZXRhaWw/LnJvdXRlKSB7XG5cdFx0XHRwcmVzc1Byb3BlcnR5ID1cblx0XHRcdFx0XCJBUEkub25UYWJsZVJvd1ByZXNzKCRldmVudCwgJGNvbnRyb2xsZXIsICR7JHBhcmFtZXRlcnM+YmluZGluZ0NvbnRleHR9LCB7IGNhbGxFeHRlbnNpb246IHRydWUsIHRhcmdldFBhdGg6ICdcIiArXG5cdFx0XHRcdHRhcmdldFBhdGggK1xuXHRcdFx0XHRcIicsIGVkaXRhYmxlIDogXCIgK1xuXHRcdFx0XHQoTW9kZWxIZWxwZXIuZ2V0RHJhZnRSb290KHRhcmdldEVudGl0eVNldCkgfHwgTW9kZWxIZWxwZXIuZ2V0RHJhZnROb2RlKHRhcmdldEVudGl0eVNldClcblx0XHRcdFx0XHQ/IFwiISR7JHBhcmFtZXRlcnM+YmluZGluZ0NvbnRleHR9LmdldFByb3BlcnR5KCdJc0FjdGl2ZUVudGl0eScpXCJcblx0XHRcdFx0XHQ6IFwidW5kZWZpbmVkXCIpICtcblx0XHRcdFx0KHRhYmxlVHlwZSA9PT0gXCJBbmFseXRpY2FsVGFibGVcIiB8fCB0YWJsZVR5cGUgPT09IFwiVHJlZVRhYmxlXCIgPyBcIiwgYlJlY3JlYXRlQ29udGV4dDogdHJ1ZVwiIDogXCJcIikgK1xuXHRcdFx0XHRcIn0pXCI7IC8vTmVlZCB0byBhY2Nlc3MgdG8gRHJhZnRSb290IGFuZCBEcmFmdE5vZGUgISEhISEhIVxuXHRcdH1cblx0fVxuXHRjb25zdCByb3dOYXZpZ2F0ZWRFeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gPSBmb3JtYXRSZXN1bHQoXG5cdFx0W3BhdGhJbk1vZGVsKFwiL2RlZXBlc3RQYXRoXCIsIFwiaW50ZXJuYWxcIildLFxuXHRcdHRhYmxlRm9ybWF0dGVycy5uYXZpZ2F0ZWRSb3csXG5cdFx0dGFyZ2V0RW50aXR5VHlwZVxuXHQpO1xuXHRyZXR1cm4ge1xuXHRcdHByZXNzOiBwcmVzc1Byb3BlcnR5LFxuXHRcdGFjdGlvbjogcHJlc3NQcm9wZXJ0eSA/IFwiTmF2aWdhdGlvblwiIDogdW5kZWZpbmVkLFxuXHRcdHJvd0hpZ2hsaWdodGluZzogY29tcGlsZUV4cHJlc3Npb24oY3JpdGljYWxpdHlQcm9wZXJ0eSksXG5cdFx0cm93TmF2aWdhdGVkOiBjb21waWxlRXhwcmVzc2lvbihyb3dOYXZpZ2F0ZWRFeHByZXNzaW9uKSxcblx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoVUkuSXNJbmFjdGl2ZSkpXG5cdH07XG59O1xuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBjb2x1bW5zIGZyb20gdGhlIGVudGl0eVR5cGUuXG4gKlxuICogQHBhcmFtIGNvbHVtbnNUb0JlQ3JlYXRlZCBUaGUgY29sdW1ucyB0byBiZSBjcmVhdGVkLlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIHRhcmdldCBlbnRpdHkgdHlwZS5cbiAqIEBwYXJhbSBhbm5vdGF0aW9uQ29sdW1ucyBUaGUgYXJyYXkgb2YgY29sdW1ucyBjcmVhdGVkIGJhc2VkIG9uIExpbmVJdGVtIGFubm90YXRpb25zLlxuICogQHBhcmFtIG5vblNvcnRhYmxlQ29sdW1ucyBUaGUgYXJyYXkgb2YgYWxsIG5vbiBzb3J0YWJsZSBjb2x1bW4gbmFtZXMuXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHQuXG4gKiBAcGFyYW0gdGFibGVUeXBlIFRoZSB0YWJsZSB0eXBlLlxuICogQHBhcmFtIHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiBUaGUgYXJyYXkgb2YgY29sdW1ucyBmcm9tIGEgcHJvcGVydHkgdXNpbmcgYSB0ZXh0IGFubm90YXRpb24gd2l0aCB0ZXh0T25seSBhcyB0ZXh0IGFycmFuZ2VtZW50LlxuICogQHJldHVybnMgVGhlIGNvbHVtbiBmcm9tIHRoZSBlbnRpdHlUeXBlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDb2x1bW5zRnJvbUVudGl0eVR5cGUgPSBmdW5jdGlvbiAoXG5cdGNvbHVtbnNUb0JlQ3JlYXRlZDogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+LFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRhbm5vdGF0aW9uQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10gPSBbXSxcblx0bm9uU29ydGFibGVDb2x1bW5zOiBzdHJpbmdbXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dGFibGVUeXBlOiBUYWJsZVR5cGUsXG5cdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbjogc3RyaW5nW11cbik6IEFubm90YXRpb25UYWJsZUNvbHVtbltdIHtcblx0Y29uc3QgdGFibGVDb2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSA9IGFubm90YXRpb25Db2x1bW5zO1xuXHQvLyBDYXRjaCBhbHJlYWR5IGV4aXN0aW5nIGNvbHVtbnMgLSB3aGljaCB3ZXJlIGFkZGVkIGJlZm9yZSBieSBMaW5lSXRlbSBBbm5vdGF0aW9uc1xuXHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IFByb3BlcnR5KSA9PiB7XG5cdFx0Ly8gQ2F0Y2ggYWxyZWFkeSBleGlzdGluZyBjb2x1bW5zIC0gd2hpY2ggd2VyZSBhZGRlZCBiZWZvcmUgYnkgTGluZUl0ZW0gQW5ub3RhdGlvbnNcblx0XHRjb25zdCBleGlzdHMgPSBhbm5vdGF0aW9uQ29sdW1ucy5zb21lKChjb2x1bW4pID0+IHtcblx0XHRcdHJldHVybiBjb2x1bW4ubmFtZSA9PT0gcHJvcGVydHkubmFtZTtcblx0XHR9KTtcblxuXHRcdC8vIGlmIHRhcmdldCB0eXBlIGV4aXN0cywgaXQgaXMgYSBjb21wbGV4IHByb3BlcnR5IGFuZCBzaG91bGQgYmUgaWdub3JlZFxuXHRcdGlmICghcHJvcGVydHkudGFyZ2V0VHlwZSAmJiAhZXhpc3RzKSB7XG5cdFx0XHRjb25zdCByZWxhdGVkUHJvcGVydGllc0luZm86IENvbXBsZXhQcm9wZXJ0eUluZm8gPSBjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMoXG5cdFx0XHRcdHByb3BlcnR5Lm5hbWUsXG5cdFx0XHRcdHByb3BlcnR5LFxuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHR0YWJsZVR5cGVcblx0XHRcdCk7XG5cdFx0XHRjb25zdCByZWxhdGVkUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8ucHJvcGVydGllcyk7XG5cdFx0XHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8uYWRkaXRpb25hbFByb3BlcnRpZXMpO1xuXHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby50ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHQvLyBJbmNsdWRlIHRleHQgcHJvcGVydGllcyBmb3VuZCBkdXJpbmcgYW5hbHlzaXMgb24gZ2V0Q29sdW1uc0Zyb21Bbm5vdGF0aW9uc1xuXHRcdFx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb24ucHVzaCguLi5yZWxhdGVkUHJvcGVydGllc0luZm8udGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGNvbHVtbkluZm8gPSBnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5KFxuXHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKHByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdHByb3BlcnR5Lm5hbWUsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdG5vblNvcnRhYmxlQ29sdW1ucyxcblx0XHRcdFx0YWdncmVnYXRpb25IZWxwZXIsXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvblxuXHRcdFx0KTtcblxuXHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29sdW1uSW5mby5wcm9wZXJ0eUluZm9zID0gcmVsYXRlZFByb3BlcnR5TmFtZXM7XG5cdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0Li4uY29sdW1uSW5mby5leHBvcnRTZXR0aW5ncyxcblx0XHRcdFx0XHR0ZW1wbGF0ZTogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzVGVtcGxhdGUsXG5cdFx0XHRcdFx0d3JhcDogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzV3JhcHBpbmdcblx0XHRcdFx0fTtcblx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy50eXBlID0gX2dldEV4cG9ydERhdGFUeXBlKHByb3BlcnR5LnR5cGUsIHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmxlbmd0aCA+IDEpO1xuXG5cdFx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VW5pdE5hbWUpIHtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnVuaXRQcm9wZXJ0eSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0TmFtZTtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIkN1cnJlbmN5XCI7IC8vIEZvcmNlIHRvIGEgY3VycmVuY3kgYmVjYXVzZSB0aGVyZSdzIGEgdW5pdFByb3BlcnR5IChvdGhlcndpc2UgdGhlIHZhbHVlIGlzbid0IHByb3Blcmx5IGZvcm1hdHRlZCB3aGVuIGV4cG9ydGVkKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0U3RyaW5nKSB7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy51bml0ID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXRTdHJpbmc7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZU5hbWUpIHtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnRpbWV6b25lUHJvcGVydHkgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVOYW1lO1xuXHRcdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudXRjID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSBpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFRpbWV6b25lU3RyaW5nKSB7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy50aW1lem9uZSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZVN0cmluZztcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlKSB7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZTtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gQ29sbGVjdCBpbmZvcm1hdGlvbiBvZiByZWxhdGVkIGNvbHVtbnMgdG8gYmUgY3JlYXRlZC5cblx0XHRcdFx0cmVsYXRlZFByb3BlcnR5TmFtZXMuZm9yRWFjaCgobmFtZSkgPT4ge1xuXHRcdFx0XHRcdGNvbHVtbnNUb0JlQ3JlYXRlZFtuYW1lXSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5wcm9wZXJ0aWVzW25hbWVdO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29sdW1uSW5mby5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcyA9IGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzO1xuXHRcdFx0XHQvLyBDcmVhdGUgY29sdW1ucyBmb3IgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGlkZW50aWZpZWQgZm9yIEFMUCB1c2UgY2FzZS5cblx0XHRcdFx0YWRkaXRpb25hbFByb3BlcnR5TmFtZXMuZm9yRWFjaCgobmFtZSkgPT4ge1xuXHRcdFx0XHRcdC8vIEludGVudGlvbmFsIG92ZXJ3cml0ZSBhcyB3ZSByZXF1aXJlIG9ubHkgb25lIG5ldyBQcm9wZXJ0eUluZm8gZm9yIGEgcmVsYXRlZCBQcm9wZXJ0eS5cblx0XHRcdFx0XHRjb2x1bW5zVG9CZUNyZWF0ZWRbbmFtZV0gPSByZWxhdGVkUHJvcGVydGllc0luZm8uYWRkaXRpb25hbFByb3BlcnRpZXNbbmFtZV07XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0dGFibGVDb2x1bW5zLnB1c2goY29sdW1uSW5mbyk7XG5cdFx0fVxuXHRcdC8vIEluIGNhc2UgYSBwcm9wZXJ0eSBoYXMgZGVmaW5lZCBhICNUZXh0T25seSB0ZXh0IGFycmFuZ2VtZW50IGRvbid0IG9ubHkgY3JlYXRlIHRoZSBjb21wbGV4IHByb3BlcnR5IHdpdGggdGhlIHRleHQgcHJvcGVydHkgYXMgYSBjaGlsZCBwcm9wZXJ0eSxcblx0XHQvLyBidXQgYWxzbyB0aGUgcHJvcGVydHkgaXRzZWxmIGFzIGl0IGNhbiBiZSB1c2VkIGFzIHdpdGhpbiB0aGUgc29ydENvbmRpdGlvbnMgb3Igb24gY3VzdG9tIGNvbHVtbnMuXG5cdFx0Ly8gVGhpcyBzdGVwIG11c3QgYmUgdmFsaWRlIGFsc28gZnJvbSB0aGUgY29sdW1ucyBhZGRlZCB2aWEgTGluZUl0ZW1zIG9yIGZyb20gYSBjb2x1bW4gYXZhaWxhYmxlIG9uIHRoZSBwMTNuLlxuXHRcdGlmIChnZXREaXNwbGF5TW9kZShwcm9wZXJ0eSkgPT09IFwiRGVzY3JpcHRpb25cIikge1xuXHRcdFx0bm9uU29ydGFibGVDb2x1bW5zID0gbm9uU29ydGFibGVDb2x1bW5zLmNvbmNhdChwcm9wZXJ0eS5uYW1lKTtcblx0XHRcdHRhYmxlQ29sdW1ucy5wdXNoKFxuXHRcdFx0XHRnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5KFxuXHRcdFx0XHRcdHByb3BlcnR5LFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChwcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0XHRcdHByb3BlcnR5Lm5hbWUsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdFx0XHRcdGFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0W11cblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIENyZWF0ZSBhIHByb3BlcnR5SW5mbyBmb3IgZWFjaCByZWxhdGVkIHByb3BlcnR5LlxuXHRjb25zdCByZWxhdGVkQ29sdW1ucyA9IF9jcmVhdGVSZWxhdGVkQ29sdW1ucyhcblx0XHRjb2x1bW5zVG9CZUNyZWF0ZWQsXG5cdFx0dGFibGVDb2x1bW5zLFxuXHRcdG5vblNvcnRhYmxlQ29sdW1ucyxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGVudGl0eVR5cGUsXG5cdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uXG5cdCk7XG5cblx0cmV0dXJuIHRhYmxlQ29sdW1ucy5jb25jYXQocmVsYXRlZENvbHVtbnMpO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgYSBjb2x1bW4gZGVmaW5pdGlvbiBmcm9tIGEgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHByb3BlcnR5IEVudGl0eSB0eXBlIHByb3BlcnR5IGZvciB3aGljaCB0aGUgY29sdW1uIGlzIGNyZWF0ZWRcbiAqIEBwYXJhbSBmdWxsUHJvcGVydHlQYXRoIFRoZSBmdWxsIHBhdGggdG8gdGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHBhcmFtIHJlbGF0aXZlUGF0aCBUaGUgcmVsYXRpdmUgcGF0aCB0byB0aGUgdGFyZ2V0IHByb3BlcnR5IGJhc2VkIG9uIHRoZSBjb250ZXh0XG4gKiBAcGFyYW0gdXNlRGF0YUZpZWxkUHJlZml4IFNob3VsZCBiZSBwcmVmaXhlZCB3aXRoIFwiRGF0YUZpZWxkOjpcIiwgZWxzZSBpdCB3aWxsIGJlIHByZWZpeGVkIHdpdGggXCJQcm9wZXJ0eTo6XCJcbiAqIEBwYXJhbSBhdmFpbGFibGVGb3JBZGFwdGF0aW9uIERlY2lkZXMgd2hldGhlciB0aGUgY29sdW1uIHNob3VsZCBiZSBhdmFpbGFibGUgZm9yIGFkYXB0YXRpb25cbiAqIEBwYXJhbSBub25Tb3J0YWJsZUNvbHVtbnMgVGhlIGFycmF5IG9mIGFsbCBub24tc29ydGFibGUgY29sdW1uIG5hbWVzXG4gKiBAcGFyYW0gYWdncmVnYXRpb25IZWxwZXIgVGhlIGFnZ3JlZ2F0aW9uSGVscGVyIGZvciB0aGUgZW50aXR5XG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSB0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb24gVGhlIGFycmF5IG9mIGNvbHVtbnMgZnJvbSBhIHByb3BlcnR5IHVzaW5nIGEgdGV4dCBhbm5vdGF0aW9uIHdpdGggdGV4dE9ubHkgYXMgdGV4dCBhcnJhbmdlbWVudC5cbiAqIEByZXR1cm5zIFRoZSBhbm5vdGF0aW9uIGNvbHVtbiBkZWZpbml0aW9uXG4gKi9cbmNvbnN0IGdldENvbHVtbkRlZmluaXRpb25Gcm9tUHJvcGVydHkgPSBmdW5jdGlvbiAoXG5cdHByb3BlcnR5OiBQcm9wZXJ0eSxcblx0ZnVsbFByb3BlcnR5UGF0aDogc3RyaW5nLFxuXHRyZWxhdGl2ZVBhdGg6IHN0cmluZyxcblx0dXNlRGF0YUZpZWxkUHJlZml4OiBib29sZWFuLFxuXHRhdmFpbGFibGVGb3JBZGFwdGF0aW9uOiBib29sZWFuLFxuXHRub25Tb3J0YWJsZUNvbHVtbnM6IHN0cmluZ1tdLFxuXHRhZ2dyZWdhdGlvbkhlbHBlcjogQWdncmVnYXRpb25IZWxwZXIsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbjogc3RyaW5nW11cbik6IEFubm90YXRpb25UYWJsZUNvbHVtbiB7XG5cdGNvbnN0IG5hbWUgPSB1c2VEYXRhRmllbGRQcmVmaXggPyByZWxhdGl2ZVBhdGggOiBgUHJvcGVydHk6OiR7cmVsYXRpdmVQYXRofWA7XG5cdGNvbnN0IGtleSA9ICh1c2VEYXRhRmllbGRQcmVmaXggPyBcIkRhdGFGaWVsZDo6XCIgOiBcIlByb3BlcnR5OjpcIikgKyByZXBsYWNlU3BlY2lhbENoYXJzKHJlbGF0aXZlUGF0aCk7XG5cdGNvbnN0IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGggPSBnZXRTZW1hbnRpY09iamVjdFBhdGgoY29udmVydGVyQ29udGV4dCwgcHJvcGVydHkpO1xuXHRjb25zdCBpc0hpZGRlbiA9IHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IHRydWU7XG5cdGNvbnN0IGdyb3VwUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkID0gcHJvcGVydHkubmFtZSA/IF9zbGljZUF0U2xhc2gocHJvcGVydHkubmFtZSwgdHJ1ZSwgZmFsc2UpIDogdW5kZWZpbmVkO1xuXHRjb25zdCBpc0dyb3VwOiBib29sZWFuID0gZ3JvdXBQYXRoICE9IHByb3BlcnR5Lm5hbWU7XG5cdGNvbnN0IGV4cG9ydFR5cGU6IHN0cmluZyA9IF9nZXRFeHBvcnREYXRhVHlwZShwcm9wZXJ0eS50eXBlKTtcblx0Y29uc3Qgc0RhdGVJbnB1dEZvcm1hdDogc3RyaW5nIHwgdW5kZWZpbmVkID0gcHJvcGVydHkudHlwZSA9PT0gXCJFZG0uRGF0ZVwiID8gXCJZWVlZLU1NLUREXCIgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IGRhdGFUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBnZXREYXRhRmllbGREYXRhVHlwZShwcm9wZXJ0eSk7XG5cdGNvbnN0IHByb3BlcnR5VHlwZUNvbmZpZyA9IGdldFR5cGVDb25maWcocHJvcGVydHksIGRhdGFUeXBlKTtcblx0Y29uc3Qgc2VtYW50aWNLZXlzOiBTZW1hbnRpY0tleSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbnNCeVRlcm0oXCJDb21tb25cIiwgQ29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljS2V5LCBbXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKClcblx0XSlbMF07XG5cdGNvbnN0IGlzQVByb3BlcnR5RnJvbVRleHRPbmx5QW5ub3RhdGlvbiA9XG5cdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uICYmIHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbi5pbmRleE9mKHJlbGF0aXZlUGF0aCkgPj0gMDtcblx0Y29uc3Qgc29ydGFibGUgPSAoIWlzSGlkZGVuIHx8IGlzQVByb3BlcnR5RnJvbVRleHRPbmx5QW5ub3RhdGlvbikgJiYgbm9uU29ydGFibGVDb2x1bW5zLmluZGV4T2YocmVsYXRpdmVQYXRoKSA9PT0gLTE7XG5cdGNvbnN0IHR5cGVDb25maWcgPSB7XG5cdFx0Y2xhc3NOYW1lOiBwcm9wZXJ0eS50eXBlIHx8IGRhdGFUeXBlLFxuXHRcdGZvcm1hdE9wdGlvbnM6IHByb3BlcnR5VHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zLFxuXHRcdGNvbnN0cmFpbnRzOiBwcm9wZXJ0eVR5cGVDb25maWcuY29uc3RyYWludHNcblx0fTtcblx0bGV0IGV4cG9ydFNldHRpbmdzOiBjb2x1bW5FeHBvcnRTZXR0aW5ncyB8IG51bGwgPSBudWxsO1xuXHRpZiAoX2lzRXhwb3J0YWJsZUNvbHVtbihwcm9wZXJ0eSkpIHtcblx0XHRjb25zdCB1bml0UHJvcGVydHkgPSBnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eShwcm9wZXJ0eSkgfHwgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eShwcm9wZXJ0eSk7XG5cdFx0Y29uc3QgdGltZXpvbmVQcm9wZXJ0eSA9IGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5KHByb3BlcnR5KTtcblx0XHRjb25zdCB1bml0VGV4dCA9IHByb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgfHwgcHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0O1xuXHRcdGNvbnN0IHRpbWV6b25lVGV4dCA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRpbWV6b25lO1xuXG5cdFx0ZXhwb3J0U2V0dGluZ3MgPSB7XG5cdFx0XHR0eXBlOiBleHBvcnRUeXBlLFxuXHRcdFx0aW5wdXRGb3JtYXQ6IHNEYXRlSW5wdXRGb3JtYXQsXG5cdFx0XHRzY2FsZTogcHJvcGVydHkuc2NhbGUsXG5cdFx0XHRkZWxpbWl0ZXI6IHByb3BlcnR5LnR5cGUgPT09IFwiRWRtLkludDY0XCJcblx0XHR9O1xuXG5cdFx0aWYgKHVuaXRQcm9wZXJ0eSkge1xuXHRcdFx0ZXhwb3J0U2V0dGluZ3MudW5pdFByb3BlcnR5ID0gdW5pdFByb3BlcnR5Lm5hbWU7XG5cdFx0XHRleHBvcnRTZXR0aW5ncy50eXBlID0gXCJDdXJyZW5jeVwiOyAvLyBGb3JjZSB0byBhIGN1cnJlbmN5IGJlY2F1c2UgdGhlcmUncyBhIHVuaXRQcm9wZXJ0eSAob3RoZXJ3aXNlIHRoZSB2YWx1ZSBpc24ndCBwcm9wZXJseSBmb3JtYXR0ZWQgd2hlbiBleHBvcnRlZClcblx0XHR9IGVsc2UgaWYgKHVuaXRUZXh0KSB7XG5cdFx0XHRleHBvcnRTZXR0aW5ncy51bml0ID0gYCR7dW5pdFRleHR9YDtcblx0XHR9XG5cdFx0aWYgKHRpbWV6b25lUHJvcGVydHkpIHtcblx0XHRcdGV4cG9ydFNldHRpbmdzLnRpbWV6b25lUHJvcGVydHkgPSB0aW1lem9uZVByb3BlcnR5Lm5hbWU7XG5cdFx0XHRleHBvcnRTZXR0aW5ncy51dGMgPSBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKHRpbWV6b25lVGV4dCkge1xuXHRcdFx0ZXhwb3J0U2V0dGluZ3MudGltZXpvbmUgPSB0aW1lem9uZVRleHQudG9TdHJpbmcoKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gX2dldENvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVscyhyZWxhdGl2ZVBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdGNvbnN0IGNvbHVtbjogQW5ub3RhdGlvblRhYmxlQ29sdW1uID0ge1xuXHRcdGtleToga2V5LFxuXHRcdHR5cGU6IENvbHVtblR5cGUuQW5ub3RhdGlvbixcblx0XHRsYWJlbDogZ2V0TGFiZWwocHJvcGVydHksIGlzR3JvdXApLFxuXHRcdGdyb3VwTGFiZWw6IGlzR3JvdXAgPyBnZXRMYWJlbChwcm9wZXJ0eSkgOiB1bmRlZmluZWQsXG5cdFx0Z3JvdXA6IGlzR3JvdXAgPyBncm91cFBhdGggOiB1bmRlZmluZWQsXG5cdFx0YW5ub3RhdGlvblBhdGg6IGZ1bGxQcm9wZXJ0eVBhdGgsXG5cdFx0c2VtYW50aWNPYmplY3RQYXRoOiBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoLFxuXHRcdGF2YWlsYWJpbGl0eTogIWF2YWlsYWJsZUZvckFkYXB0YXRpb24gfHwgaXNIaWRkZW4gPyBcIkhpZGRlblwiIDogXCJBZGFwdGF0aW9uXCIsXG5cdFx0bmFtZTogbmFtZSxcblx0XHRyZWxhdGl2ZVBhdGg6IHJlbGF0aXZlUGF0aCxcblx0XHRzb3J0YWJsZTogc29ydGFibGUsXG5cdFx0aXNHcm91cGFibGU6IGFnZ3JlZ2F0aW9uSGVscGVyLmlzQW5hbHl0aWNzU3VwcG9ydGVkKCkgPyAhIWFnZ3JlZ2F0aW9uSGVscGVyLmlzUHJvcGVydHlHcm91cGFibGUocHJvcGVydHkpIDogc29ydGFibGUsXG5cdFx0aXNLZXk6IHByb3BlcnR5LmlzS2V5LFxuXHRcdGV4cG9ydFNldHRpbmdzOiBleHBvcnRTZXR0aW5ncyxcblx0XHRjYXNlU2Vuc2l0aXZlOiBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dCksXG5cdFx0dHlwZUNvbmZpZzogdHlwZUNvbmZpZyBhcyBQcm9wZXJ0eVR5cGVDb25maWcsXG5cdFx0aW1wb3J0YW5jZTogZ2V0SW1wb3J0YW5jZShwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQsIHNlbWFudGljS2V5cyksXG5cdFx0YWRkaXRpb25hbExhYmVsczogY29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzXG5cdH07XG5cdGNvbnN0IHNUb29sdGlwID0gX2dldFRvb2x0aXAocHJvcGVydHkpIHx8IGdldExhYmVsKHByb3BlcnR5LCBpc0dyb3VwKTtcblx0aWYgKHNUb29sdGlwKSB7XG5cdFx0Y29sdW1uLnRvb2x0aXAgPSBzVG9vbHRpcDtcblx0fVxuXHRjb25zdCB0YXJnZXRWYWx1ZWZyb21EUCA9IGdldFRhcmdldFZhbHVlT25EYXRhUG9pbnQocHJvcGVydHkpO1xuXHRpZiAoaXNEYXRhUG9pbnRGcm9tRGF0YUZpZWxkRGVmYXVsdChwcm9wZXJ0eSkgJiYgdHlwZW9mIHRhcmdldFZhbHVlZnJvbURQID09PSBcInN0cmluZ1wiICYmIGNvbHVtbi5leHBvcnRTZXR0aW5ncykge1xuXHRcdGNvbHVtbi5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSA9IHRhcmdldFZhbHVlZnJvbURQO1xuXHRcdGNvbHVtbi5leHBvcnRTZXR0aW5ncy50ZW1wbGF0ZSA9IFwiezB9L1wiICsgdGFyZ2V0VmFsdWVmcm9tRFA7XG5cdH1cblx0cmV0dXJuIGNvbHVtbjtcbn07XG5cbi8qKlxuICogUmV0dXJucyBCb29sZWFuIHRydWUgZm9yIGV4cG9ydGFibGUgY29sdW1ucywgZmFsc2UgZm9yIG5vbiBleHBvcnRhYmxlIGNvbHVtbnMuXG4gKlxuICogQHBhcmFtIHNvdXJjZSBUaGUgZGF0YUZpZWxkIG9yIHByb3BlcnR5IHRvIGJlIGV2YWx1YXRlZFxuICogQHJldHVybnMgVHJ1ZSBmb3IgZXhwb3J0YWJsZSBjb2x1bW4sIGZhbHNlIGZvciBub24gZXhwb3J0YWJsZSBjb2x1bW5cbiAqIEBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gX2lzRXhwb3J0YWJsZUNvbHVtbihzb3VyY2U6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRsZXQgcHJvcGVydHlUeXBlLCBwcm9wZXJ0eTtcblx0Y29uc3QgZGF0YUZpZWxkRGVmYXVsdFByb3BlcnR5ID0gKHNvdXJjZSBhcyBQcm9wZXJ0eSkuYW5ub3RhdGlvbnMuVUk/LkRhdGFGaWVsZERlZmF1bHQ7XG5cdGlmIChpc1Byb3BlcnR5KHNvdXJjZSkgJiYgZGF0YUZpZWxkRGVmYXVsdFByb3BlcnR5Py4kVHlwZSkge1xuXHRcdGlmIChpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihkYXRhRmllbGREZWZhdWx0UHJvcGVydHkpID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHByb3BlcnR5VHlwZSA9IGRhdGFGaWVsZERlZmF1bHRQcm9wZXJ0eT8uJFR5cGU7XG5cdH0gZWxzZSBpZiAoaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4oc291cmNlIGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXMpID09PSB0cnVlKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9IGVsc2Uge1xuXHRcdHByb3BlcnR5ID0gc291cmNlIGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXM7XG5cdFx0cHJvcGVydHlUeXBlID0gcHJvcGVydHkuJFR5cGU7XG5cdFx0aWYgKHByb3BlcnR5VHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJiAocHJvcGVydHkgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSkge1xuXHRcdFx0Ly9Gb3IgQ2hhcnRcblx0XHRcdHByb3BlcnR5VHlwZSA9IChwcm9wZXJ0eSBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlO1xuXHRcdFx0cmV0dXJuIFVJQW5ub3RhdGlvblR5cGVzLkNoYXJ0RGVmaW5pdGlvblR5cGUuaW5kZXhPZihwcm9wZXJ0eVR5cGUpID09PSAtMTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0KHByb3BlcnR5IGFzIERhdGFGaWVsZCkuVmFsdWU/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db3JlPy5NZWRpYVR5cGU/LnRlcm0gPT09IFwiT3JnLk9EYXRhLkNvcmUuVjEuTWVkaWFUeXBlXCIgJiZcblx0XHRcdChwcm9wZXJ0eSBhcyBEYXRhRmllbGQpLlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29yZT8uaXNVUkwgIT09IHRydWVcblx0XHQpIHtcblx0XHRcdC8vRm9yIFN0cmVhbVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcHJvcGVydHlUeXBlXG5cdFx0PyBbXG5cdFx0XHRcdFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0VUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRcdFx0XHRVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb25Hcm91cFxuXHRcdCAgXS5pbmRleE9mKHByb3BlcnR5VHlwZSkgPT09IC0xXG5cdFx0OiB0cnVlO1xufVxuXG4vKipcbiAqIFJldHVybnMgQm9vbGVhbiB0cnVlIGZvciB2YWxpZCBjb2x1bW5zLCBmYWxzZSBmb3IgaW52YWxpZCBjb2x1bW5zLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGlmZmVyZW50IERhdGFGaWVsZCB0eXBlcyBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHJldHVybnMgVHJ1ZSBmb3IgdmFsaWQgY29sdW1ucywgZmFsc2UgZm9yIGludmFsaWQgY29sdW1uc1xuICogQHByaXZhdGVcbiAqL1xuY29uc3QgX2lzVmFsaWRDb2x1bW4gPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSB7XG5cdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRyZXR1cm4gISFkYXRhRmllbGQuSW5saW5lO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdGRlZmF1bHQ6XG5cdFx0Ly8gVG9kbzogUmVwbGFjZSB3aXRoIHByb3BlciBMb2cgc3RhdGVtZW50IG9uY2UgYXZhaWxhYmxlXG5cdFx0Ly8gIHRocm93IG5ldyBFcnJvcihcIlVuaGFuZGxlZCBEYXRhRmllbGQgQWJzdHJhY3QgdHlwZTogXCIgKyBkYXRhRmllbGQuJFR5cGUpO1xuXHR9XG59O1xuLyoqXG4gKiBSZXR1cm5zIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gZXZhbHVhdGUgdGhlIHZpc2liaWxpdHkgb2YgYSBEYXRhRmllbGQgb3IgRGF0YVBvaW50IGFubm90YXRpb24uXG4gKlxuICogU0FQIEZpb3JpIGVsZW1lbnRzIHdpbGwgZXZhbHVhdGUgZWl0aGVyIHRoZSBVSS5IaWRkZW4gYW5ub3RhdGlvbiBkZWZpbmVkIG9uIHRoZSBhbm5vdGF0aW9uIGl0c2VsZiBvciBvbiB0aGUgdGFyZ2V0IHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRNb2RlbFBhdGggVGhlIG1ldGFwYXRoIHJlZmVycmluZyB0byB0aGUgYW5ub3RhdGlvbiB0aGF0IGlzIGV2YWx1YXRlZCBieSBTQVAgRmlvcmkgZWxlbWVudHMuXG4gKiBAcmV0dXJucyBBbiBleHByZXNzaW9uIHRoYXQgeW91IGNhbiBiaW5kIHRvIHRoZSBVSS5cbiAqL1xuZXhwb3J0IGNvbnN0IF9nZXRWaXNpYmxlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChkYXRhRmllbGRNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCB0YXJnZXRPYmplY3Q6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBEYXRhUG9pbnRUeXBlVHlwZXMgPSBkYXRhRmllbGRNb2RlbFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRsZXQgcHJvcGVydHlWYWx1ZTtcblx0aWYgKHRhcmdldE9iamVjdCkge1xuXHRcdHN3aXRjaCAodGFyZ2V0T2JqZWN0LiRUeXBlKSB7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdGFyZ2V0T2JqZWN0LlZhbHVlLiR0YXJnZXQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0XHQvLyBpZiBpdCBpcyBhIERhdGFGaWVsZEZvckFubm90YXRpb24gcG9pbnRpbmcgdG8gYSBEYXRhUG9pbnQgd2UgbG9vayBhdCB0aGUgZGF0YVBvaW50J3MgdmFsdWVcblx0XHRcdFx0aWYgKHRhcmdldE9iamVjdD8uVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZSkge1xuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWUgPSB0YXJnZXRPYmplY3QuVGFyZ2V0LiR0YXJnZXQ/LlZhbHVlLiR0YXJnZXQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cHJvcGVydHlWYWx1ZSA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblx0Ly8gRklYTUUgUHJvdmUgbWUgd3JvbmcgdGhhdCB0aGlzIGlzIHVzZWxlc3Ncblx0Y29uc3QgaXNBbmFseXRpY2FsR3JvdXBIZWFkZXJFeHBhbmRlZCA9IC8qZm9ybWF0T3B0aW9ucz8uaXNBbmFseXRpY3MgPyBVSS5Jc0V4cGFuZGVkIDoqLyBjb25zdGFudChmYWxzZSk7XG5cdGNvbnN0IGlzQW5hbHl0aWNhbExlYWYgPSAvKmZvcm1hdE9wdGlvbnM/LmlzQW5hbHl0aWNzID8gZXF1YWwoVUkuTm9kZUxldmVsLCAwKSA6Ki8gY29uc3RhbnQoZmFsc2UpO1xuXG5cdC8vIEEgZGF0YSBmaWVsZCBpcyB2aXNpYmxlIGlmOlxuXHQvLyAtIHRoZSBVSS5IaWRkZW4gZXhwcmVzc2lvbiBpbiB0aGUgb3JpZ2luYWwgYW5ub3RhdGlvbiBkb2VzIG5vdCBldmFsdWF0ZSB0byAndHJ1ZSdcblx0Ly8gLSB0aGUgVUkuSGlkZGVuIGV4cHJlc3Npb24gaW4gdGhlIHRhcmdldCBwcm9wZXJ0eSBkb2VzIG5vdCBldmFsdWF0ZSB0byAndHJ1ZSdcblx0Ly8gLSBpbiBjYXNlIG9mIEFuYWx5dGljcyBpdCdzIG5vdCB2aXNpYmxlIGZvciBhbiBleHBhbmRlZCBHcm91cEhlYWRlclxuXHRyZXR1cm4gYW5kKFxuXHRcdC4uLltcblx0XHRcdG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24odGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiksIHRydWUpKSxcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0ISFwcm9wZXJ0eVZhbHVlLFxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlICYmIG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ocHJvcGVydHlWYWx1ZS5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiksIHRydWUpKSxcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0KSxcblx0XHRcdG9yKG5vdChpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkKSwgaXNBbmFseXRpY2FsTGVhZilcblx0XHRdXG5cdCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgaGlkZGVuIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIGEgZmllbGQgZ3JvdXAuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZEdyb3VwIERhdGFGaWVsZCBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHJldHVybnMgQ29tcGlsZSBiaW5kaW5nIG9mIGZpZWxkIGdyb3VwIGV4cHJlc3Npb25zLlxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgX2dldEZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyA9IGZ1bmN0aW9uIChkYXRhRmllbGRHcm91cDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyk6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IFtdO1xuXHRpZiAoXG5cdFx0ZGF0YUZpZWxkR3JvdXAuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiZcblx0XHRkYXRhRmllbGRHcm91cC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5GaWVsZEdyb3VwVHlwZVxuXHQpIHtcblx0XHRpZiAoZGF0YUZpZWxkR3JvdXA/LmFubm90YXRpb25zPy5VST8uSGlkZGVuKSB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24obm90KGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGRHcm91cC5hbm5vdGF0aW9ucy5VSS5IaWRkZW4pLCB0cnVlKSkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkYXRhRmllbGRHcm91cC5UYXJnZXQuJHRhcmdldC5EYXRhPy5mb3JFYWNoKChpbm5lckRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IERhdGFQb2ludFR5cGVUeXBlcykgPT4ge1xuXHRcdFx0XHRmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMucHVzaChfZ2V0VmlzaWJsZUV4cHJlc3Npb24oeyB0YXJnZXRPYmplY3Q6IGlubmVyRGF0YUZpZWxkIH0gYXMgRGF0YU1vZGVsT2JqZWN0UGF0aCkpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKG9yKC4uLmZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyksIGNvbnN0YW50KHRydWUpLCBjb25zdGFudChmYWxzZSkpKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBsYWJlbCBmb3IgdGhlIHByb3BlcnR5IGFuZCBkYXRhRmllbGQuXG4gKlxuICogQHBhcmFtIFtwcm9wZXJ0eV0gUHJvcGVydHksIERhdGFGaWVsZCBvciBOYXZpZ2F0aW9uIFByb3BlcnR5IGRlZmluZWQgaW4gdGhlIGFubm90YXRpb25zXG4gKiBAcGFyYW0gaXNHcm91cFxuICogQHJldHVybnMgTGFiZWwgb2YgdGhlIHByb3BlcnR5IG9yIERhdGFGaWVsZFxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgZ2V0TGFiZWwgPSBmdW5jdGlvbiAocHJvcGVydHk6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBQcm9wZXJ0eSB8IE5hdmlnYXRpb25Qcm9wZXJ0eSwgaXNHcm91cCA9IGZhbHNlKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKCFwcm9wZXJ0eSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0aWYgKGlzUHJvcGVydHkocHJvcGVydHkpIHx8IGlzTmF2aWdhdGlvblByb3BlcnR5KHByb3BlcnR5KSkge1xuXHRcdGNvbnN0IGRhdGFGaWVsZERlZmF1bHQgPSAocHJvcGVydHkgYXMgUHJvcGVydHkpLmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdDtcblx0XHRpZiAoZGF0YUZpZWxkRGVmYXVsdCAmJiAhZGF0YUZpZWxkRGVmYXVsdC5xdWFsaWZpZXIgJiYgZGF0YUZpZWxkRGVmYXVsdC5MYWJlbD8udmFsdWVPZigpKSB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZERlZmF1bHQuTGFiZWw/LnZhbHVlT2YoKSkpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5LmFubm90YXRpb25zLkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5uYW1lKSk7XG5cdH0gZWxzZSBpZiAoaXNEYXRhRmllbGRUeXBlcyhwcm9wZXJ0eSkpIHtcblx0XHRpZiAoISFpc0dyb3VwICYmIHByb3BlcnR5LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5LkxhYmVsPy52YWx1ZU9mKCkpKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0XHRwcm9wZXJ0eS5MYWJlbD8udmFsdWVPZigpIHx8IHByb3BlcnR5LlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbD8udmFsdWVPZigpIHx8IHByb3BlcnR5LlZhbHVlPy4kdGFyZ2V0Py5uYW1lXG5cdFx0XHQpXG5cdFx0KTtcblx0fSBlbHNlIGlmIChwcm9wZXJ0eS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikge1xuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0cHJvcGVydHkuTGFiZWw/LnZhbHVlT2YoKSB8fCAocHJvcGVydHkuVGFyZ2V0Py4kdGFyZ2V0IGFzIERhdGFQb2ludCk/LlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5MYWJlbD8udmFsdWVPZigpXG5cdFx0XHQpXG5cdFx0KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHByb3BlcnR5LkxhYmVsPy52YWx1ZU9mKCkpKTtcblx0fVxufTtcblxuY29uc3QgX2dldFRvb2x0aXAgPSBmdW5jdGlvbiAoc291cmNlOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgUHJvcGVydHkpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRpZiAoIXNvdXJjZSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRpZiAoaXNQcm9wZXJ0eShzb3VyY2UpIHx8IHNvdXJjZS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm8pIHtcblx0XHRyZXR1cm4gc291cmNlLmFubm90YXRpb25zPy5Db21tb24/LlF1aWNrSW5mb1xuXHRcdFx0PyBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oc291cmNlLmFubm90YXRpb25zLkNvbW1vbi5RdWlja0luZm8udmFsdWVPZigpKSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKGlzRGF0YUZpZWxkVHlwZXMoc291cmNlKSkge1xuXHRcdHJldHVybiBzb3VyY2UuVmFsdWU/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db21tb24/LlF1aWNrSW5mb1xuXHRcdFx0PyBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oc291cmNlLlZhbHVlLiR0YXJnZXQuYW5ub3RhdGlvbnMuQ29tbW9uLlF1aWNrSW5mby52YWx1ZU9mKCkpKVxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdH0gZWxzZSBpZiAoc291cmNlLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uKSB7XG5cdFx0Y29uc3QgZGF0YXBvaW50VGFyZ2V0ID0gc291cmNlLlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQ7XG5cdFx0cmV0dXJuIGRhdGFwb2ludFRhcmdldD8uVmFsdWU/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db21tb24/LlF1aWNrSW5mb1xuXHRcdFx0PyBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YXBvaW50VGFyZ2V0LlZhbHVlLiR0YXJnZXQuYW5ub3RhdGlvbnMuQ29tbW9uLlF1aWNrSW5mby52YWx1ZU9mKCkpKVxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJvd1N0YXR1c1Zpc2liaWxpdHkoY29sTmFtZTogc3RyaW5nLCBpc1NlbWFudGljS2V5SW5GaWVsZEdyb3VwPzogQm9vbGVhbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdHJldHVybiBmb3JtYXRSZXN1bHQoXG5cdFx0W1xuXHRcdFx0cGF0aEluTW9kZWwoYHNlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3JgLCBcImludGVybmFsXCIpLFxuXHRcdFx0cGF0aEluTW9kZWwoYGZpbHRlcmVkTWVzc2FnZXNgLCBcImludGVybmFsXCIpLFxuXHRcdFx0Y29sTmFtZSxcblx0XHRcdGlzU2VtYW50aWNLZXlJbkZpZWxkR3JvdXBcblx0XHRdLFxuXHRcdHRhYmxlRm9ybWF0dGVycy5nZXRFcnJvclN0YXR1c1RleHRWaXNpYmlsaXR5Rm9ybWF0dGVyXG5cdCk7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIFByb3BlcnR5SW5mbyBmb3IgZWFjaCBpZGVudGlmaWVkIHByb3BlcnR5IGNvbnN1bWVkIGJ5IGEgTGluZUl0ZW0uXG4gKlxuICogQHBhcmFtIGNvbHVtbnNUb0JlQ3JlYXRlZCBJZGVudGlmaWVkIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0gZXhpc3RpbmdDb2x1bW5zIFRoZSBsaXN0IG9mIGNvbHVtbnMgY3JlYXRlZCBmb3IgTGluZUl0ZW1zIGFuZCBQcm9wZXJ0aWVzIG9mIGVudGl0eVR5cGUuXG4gKiBAcGFyYW0gbm9uU29ydGFibGVDb2x1bW5zIFRoZSBhcnJheSBvZiBjb2x1bW4gbmFtZXMgd2hpY2ggY2Fubm90IGJlIHNvcnRlZC5cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dC5cbiAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSBlbnRpdHkgdHlwZSBmb3IgdGhlIExpbmVJdGVtXG4gKiBAcGFyYW0gdGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uIFRoZSBhcnJheSBvZiBjb2x1bW5zIGZyb20gYSBwcm9wZXJ0eSB1c2luZyBhIHRleHQgYW5ub3RhdGlvbiB3aXRoIHRleHRPbmx5IGFzIHRleHQgYXJyYW5nZW1lbnQuXG4gKiBAcmV0dXJucyBUaGUgYXJyYXkgb2YgY29sdW1ucyBjcmVhdGVkLlxuICovXG5jb25zdCBfY3JlYXRlUmVsYXRlZENvbHVtbnMgPSBmdW5jdGlvbiAoXG5cdGNvbHVtbnNUb0JlQ3JlYXRlZDogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+LFxuXHRleGlzdGluZ0NvbHVtbnM6IEFubm90YXRpb25UYWJsZUNvbHVtbltdLFxuXHRub25Tb3J0YWJsZUNvbHVtbnM6IHN0cmluZ1tdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb246IHN0cmluZ1tdXG4pOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSB7XG5cdGNvbnN0IHJlbGF0ZWRDb2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSA9IFtdO1xuXHRjb25zdCByZWxhdGVkUHJvcGVydHlOYW1lTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdE9iamVjdC5rZXlzKGNvbHVtbnNUb0JlQ3JlYXRlZCkuZm9yRWFjaCgobmFtZSkgPT4ge1xuXHRcdGNvbnN0IHByb3BlcnR5ID0gY29sdW1uc1RvQmVDcmVhdGVkW25hbWVdLFxuXHRcdFx0YW5ub3RhdGlvblBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFic29sdXRlQW5ub3RhdGlvblBhdGgobmFtZSksXG5cdFx0XHQvLyBDaGVjayB3aGV0aGVyIHRoZSByZWxhdGVkIGNvbHVtbiBhbHJlYWR5IGV4aXN0cy5cblx0XHRcdHJlbGF0ZWRDb2x1bW4gPSBleGlzdGluZ0NvbHVtbnMuZmluZCgoY29sdW1uKSA9PiBjb2x1bW4ubmFtZSA9PT0gbmFtZSk7XG5cdFx0aWYgKHJlbGF0ZWRDb2x1bW4gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gQ2FzZSAxOiBLZXkgY29udGFpbnMgRGF0YUZpZWxkIHByZWZpeCB0byBlbnN1cmUgYWxsIHByb3BlcnR5IGNvbHVtbnMgaGF2ZSB0aGUgc2FtZSBrZXkgZm9ybWF0LlxuXHRcdFx0Ly8gTmV3IGNyZWF0ZWQgcHJvcGVydHkgY29sdW1uIGlzIHNldCB0byBoaWRkZW4uXG5cdFx0XHRjb25zdCBjb2x1bW4gPSBnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5KFxuXHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0YW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdG5hbWUsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRub25Tb3J0YWJsZUNvbHVtbnMsXG5cdFx0XHRcdGFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb25cblx0XHRcdCk7XG5cdFx0XHRjb2x1bW4uaXNQYXJ0T2ZMaW5lSXRlbSA9IGV4aXN0aW5nQ29sdW1ucy5zb21lKFxuXHRcdFx0XHQoZXhpc3RpbmdDb2x1bW4pID0+IGV4aXN0aW5nQ29sdW1uLnByb3BlcnR5SW5mb3M/LmluY2x1ZGVzKG5hbWUpICYmIGV4aXN0aW5nQ29sdW1uLmlzUGFydE9mTGluZUl0ZW1cblx0XHRcdCk7XG5cdFx0XHRyZWxhdGVkQ29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0fSBlbHNlIGlmIChyZWxhdGVkQ29sdW1uLmFubm90YXRpb25QYXRoICE9PSBhbm5vdGF0aW9uUGF0aCB8fCByZWxhdGVkQ29sdW1uLnByb3BlcnR5SW5mb3MpIHtcblx0XHRcdC8vIENhc2UgMjogVGhlIGV4aXN0aW5nIGNvbHVtbiBwb2ludHMgdG8gYSBMaW5lSXRlbSAob3IpXG5cdFx0XHQvLyBDYXNlIDM6IFRoaXMgaXMgYSBzZWxmIHJlZmVyZW5jZSBmcm9tIGFuIGV4aXN0aW5nIGNvbHVtblxuXG5cdFx0XHRjb25zdCBuZXdOYW1lID0gYFByb3BlcnR5Ojoke25hbWV9YDtcblxuXHRcdFx0Ly8gQ2hlY2tpbmcgd2hldGhlciB0aGUgcmVsYXRlZCBwcm9wZXJ0eSBjb2x1bW4gaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkIGluIGEgcHJldmlvdXMgaXRlcmF0aW9uLlxuXHRcdFx0aWYgKCFleGlzdGluZ0NvbHVtbnMuc29tZSgoY29sdW1uKSA9PiBjb2x1bW4ubmFtZSA9PT0gbmV3TmFtZSkpIHtcblx0XHRcdFx0Ly8gQ3JlYXRlIGEgbmV3IHByb3BlcnR5IGNvbHVtbiB3aXRoICdQcm9wZXJ0eTo6JyBwcmVmaXgsXG5cdFx0XHRcdC8vIFNldCBpdCB0byBoaWRkZW4gYXMgaXQgaXMgb25seSBjb25zdW1lZCBieSBDb21wbGV4IHByb3BlcnR5IGluZm9zLlxuXHRcdFx0XHRjb25zdCBjb2x1bW4gPSBnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5KFxuXHRcdFx0XHRcdHByb3BlcnR5LFxuXHRcdFx0XHRcdGFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdFx0XHRcdGFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGNvbHVtbi5pc1BhcnRPZkxpbmVJdGVtID0gcmVsYXRlZENvbHVtbi5pc1BhcnRPZkxpbmVJdGVtO1xuXHRcdFx0XHRyZWxhdGVkQ29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbbmFtZV0gPSBuZXdOYW1lO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0ZXhpc3RpbmdDb2x1bW5zLnNvbWUoKGNvbHVtbikgPT4gY29sdW1uLm5hbWUgPT09IG5ld05hbWUpICYmXG5cdFx0XHRcdGV4aXN0aW5nQ29sdW1ucy5zb21lKChjb2x1bW4pID0+IGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5pbmNsdWRlcyhuYW1lKSlcblx0XHRcdCkge1xuXHRcdFx0XHRyZWxhdGVkUHJvcGVydHlOYW1lTWFwW25hbWVdID0gbmV3TmFtZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vIFRoZSBwcm9wZXJ0eSAnbmFtZScgaGFzIGJlZW4gcHJlZml4ZWQgd2l0aCAnUHJvcGVydHk6OicgZm9yIHVuaXF1ZW5lc3MuXG5cdC8vIFVwZGF0ZSB0aGUgc2FtZSBpbiBvdGhlciBwcm9wZXJ0eUluZm9zW10gcmVmZXJlbmNlcyB3aGljaCBwb2ludCB0byB0aGlzIHByb3BlcnR5LlxuXHRleGlzdGluZ0NvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0Y29sdW1uLnByb3BlcnR5SW5mb3MgPSBjb2x1bW4ucHJvcGVydHlJbmZvcz8ubWFwKChwcm9wZXJ0eUluZm8pID0+IHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbcHJvcGVydHlJbmZvXSA/PyBwcm9wZXJ0eUluZm8pO1xuXHRcdGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcyA9IGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcz8ubWFwKFxuXHRcdFx0KHByb3BlcnR5SW5mbykgPT4gcmVsYXRlZFByb3BlcnR5TmFtZU1hcFtwcm9wZXJ0eUluZm9dID8/IHByb3BlcnR5SW5mb1xuXHRcdCk7XG5cdH0pO1xuXG5cdHJldHVybiByZWxhdGVkQ29sdW1ucztcbn07XG5cbi8qKlxuICogR2V0dGluZyB0aGUgQ29sdW1uIE5hbWVcbiAqIElmIGl0IHBvaW50cyB0byBhIERhdGFGaWVsZCB3aXRoIG9uZSBwcm9wZXJ0eSBvciBEYXRhUG9pbnQgd2l0aCBvbmUgcHJvcGVydHksIGl0IHdpbGwgdXNlIHRoZSBwcm9wZXJ0eSBuYW1lXG4gKiBoZXJlIHRvIGJlIGNvbnNpc3RlbnQgd2l0aCB0aGUgZXhpc3RpbmcgZmxleCBjaGFuZ2VzLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGlmZmVyZW50IERhdGFGaWVsZCB0eXBlcyBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHJldHVybnMgVGhlIG5hbWUgb2YgYW5ub3RhdGlvbiBjb2x1bW5zXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUgPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSB7XG5cdC8vIFRoaXMgaXMgbmVlZGVkIGFzIHdlIGhhdmUgZmxleGliaWxpdHkgY2hhbmdlcyBhbHJlYWR5IHRoYXQgd2UgaGF2ZSB0byBjaGVjayBhZ2FpbnN0XG5cdGlmIChpc0RhdGFGaWVsZFR5cGVzKGRhdGFGaWVsZCkgJiYgZGF0YUZpZWxkLlZhbHVlPy5wYXRoKSB7XG5cdFx0cmV0dXJuIGRhdGFGaWVsZC5WYWx1ZT8ucGF0aDtcblx0fSBlbHNlIGlmIChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiYgKGRhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50KT8uVmFsdWU/LnBhdGgpIHtcblx0XHQvLyBUaGlzIGlzIGZvciByZW1vdmluZyBkdXBsaWNhdGUgcHJvcGVydGllcy4gRm9yIGV4YW1wbGUsICdQcm9ncmVzcycgUHJvcGVydHkgaXMgcmVtb3ZlZCBpZiBpdCBpcyBhbHJlYWR5IGRlZmluZWQgYXMgYSBEYXRhUG9pbnRcblx0XHRyZXR1cm4gKGRhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50KT8uVmFsdWUucGF0aDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpO1xuXHR9XG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBQcm9wZXJ0eUluZm8gZm9yIHRoZSBpZGVudGlmaWVkIGFkZGl0aW9uYWwgcHJvcGVydHkgZm9yIHRoZSBBTFAgdGFibGUgdXNlLWNhc2UuXG4gKlxuICogRm9yIGUuZy4gSWYgVUkuSGlkZGVuIHBvaW50cyB0byBhIHByb3BlcnR5LCBpbmNsdWRlIHRoaXMgdGVjaG5pY2FsIHByb3BlcnR5IGluIHRoZSBhZGRpdGlvbmFsUHJvcGVydGllcyBvZiBDb21wbGV4UHJvcGVydHlJbmZvIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gYmUgY3JlYXRlZC5cbiAqIEBwYXJhbSBjb2x1bW5zIFRoZSBsaXN0IG9mIGNvbHVtbnMgY3JlYXRlZCBmb3IgTGluZUl0ZW1zIGFuZCBQcm9wZXJ0aWVzIG9mIGVudGl0eVR5cGUgZnJvbSB0aGUgdGFibGUgdmlzdWFsaXphdGlvbi5cbiAqIEByZXR1cm5zIFRoZSBwcm9wZXJ0eUluZm8gb2YgdGhlIHRlY2huaWNhbCBwcm9wZXJ0eSB0byBiZSBhZGRlZCB0byB0aGUgbGlzdCBvZiBjb2x1bW5zLlxuICogQHByaXZhdGVcbiAqL1xuXG5jb25zdCBjcmVhdGVUZWNobmljYWxQcm9wZXJ0eSA9IGZ1bmN0aW9uIChuYW1lOiBzdHJpbmcsIGNvbHVtbnM6IFRhYmxlQ29sdW1uW10sIHJlbGF0ZWRBZGRpdGlvbmFsUHJvcGVydHlOYW1lTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSB7XG5cdGNvbnN0IGtleSA9IGBQcm9wZXJ0eV9UZWNobmljYWw6OiR7bmFtZX1gO1xuXHQvLyBWYWxpZGF0ZSBpZiB0aGUgdGVjaG5pY2FsIHByb3BlcnR5IGhhc24ndCB5ZXQgYmVlbiBjcmVhdGVkIG9uIHByZXZpb3VzIGl0ZXJhdGlvbnMuXG5cdGNvbnN0IGNvbHVtbkV4aXN0cyA9IGNvbHVtbnMuZmluZCgoY29sdW1uKSA9PiBjb2x1bW4ua2V5ID09PSBrZXkpO1xuXHQvLyBSZXRyaWV2ZSB0aGUgc2ltcGxlIHByb3BlcnR5IHVzZWQgYnkgdGhlIGhpZGRlbiBhbm5vdGF0aW9uLCBpdCB3aWxsIGJlIHVzZWQgYXMgYSBiYXNlIGZvciB0aGUgbWFuZGF0b3J5IGF0dHJpYnV0ZXMgb2YgbmV3bHkgY3JlYXRlZCB0ZWNobmljYWwgcHJvcGVydHkuIEZvciBlLmcuIHJlbGF0aXZlUGF0aFxuXHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHkgPVxuXHRcdCFjb2x1bW5FeGlzdHMgJiYgKGNvbHVtbnMuZmluZCgoY29sdW1uKSA9PiBjb2x1bW4ubmFtZSA9PT0gbmFtZSAmJiAhY29sdW1uLnByb3BlcnR5SW5mb3MpIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbikhO1xuXHRpZiAoYWRkaXRpb25hbFByb3BlcnR5KSB7XG5cdFx0Y29uc3QgdGVjaG5pY2FsQ29sdW1uOiBUZWNobmljYWxDb2x1bW4gPSB7XG5cdFx0XHRrZXk6IGtleSxcblx0XHRcdHR5cGU6IENvbHVtblR5cGUuQW5ub3RhdGlvbixcblx0XHRcdGxhYmVsOiBhZGRpdGlvbmFsUHJvcGVydHkubGFiZWwsXG5cdFx0XHRhbm5vdGF0aW9uUGF0aDogYWRkaXRpb25hbFByb3BlcnR5LmFubm90YXRpb25QYXRoLFxuXHRcdFx0YXZhaWxhYmlsaXR5OiBcIkhpZGRlblwiLFxuXHRcdFx0bmFtZToga2V5LFxuXHRcdFx0cmVsYXRpdmVQYXRoOiBhZGRpdGlvbmFsUHJvcGVydHkucmVsYXRpdmVQYXRoLFxuXHRcdFx0c29ydGFibGU6IGZhbHNlLFxuXHRcdFx0aXNHcm91cGFibGU6IGZhbHNlLFxuXHRcdFx0aXNLZXk6IGZhbHNlLFxuXHRcdFx0ZXhwb3J0U2V0dGluZ3M6IG51bGwsXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBmYWxzZSxcblx0XHRcdGFnZ3JlZ2F0YWJsZTogZmFsc2UsXG5cdFx0XHRleHRlbnNpb246IHtcblx0XHRcdFx0dGVjaG5pY2FsbHlHcm91cGFibGU6IHRydWUsXG5cdFx0XHRcdHRlY2huaWNhbGx5QWdncmVnYXRhYmxlOiB0cnVlXG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb2x1bW5zLnB1c2godGVjaG5pY2FsQ29sdW1uKTtcblx0XHRyZWxhdGVkQWRkaXRpb25hbFByb3BlcnR5TmFtZU1hcFtuYW1lXSA9IHRlY2huaWNhbENvbHVtbi5uYW1lO1xuXHR9XG59O1xuXG4vKipcbiAqIERldGVybWluZXMgaWYgdGhlIGRhdGEgZmllbGQgbGFiZWxzIGhhdmUgdG8gYmUgZGlzcGxheWVkIGluIHRoZSB0YWJsZS5cbiAqXG4gKiBAcGFyYW0gZmllbGRHcm91cE5hbWUgVGhlIGBEYXRhRmllbGRgIG5hbWUgYmVpbmcgcHJvY2Vzc2VkLlxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgYHNob3dEYXRhRmllbGRzTGFiZWxgIHZhbHVlIGZyb20gdGhlIG1hbmlmZXN0XG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfZ2V0U2hvd0RhdGFGaWVsZHNMYWJlbCA9IGZ1bmN0aW9uIChmaWVsZEdyb3VwTmFtZTogc3RyaW5nLCB2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdGNvbnN0IG9Db2x1bW5zID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKT8uY29sdW1ucztcblx0Y29uc3QgYUNvbHVtbktleXMgPSBvQ29sdW1ucyAmJiBPYmplY3Qua2V5cyhvQ29sdW1ucyk7XG5cdHJldHVybiAoXG5cdFx0YUNvbHVtbktleXMgJiZcblx0XHQhIWFDb2x1bW5LZXlzLmZpbmQoZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4ga2V5ID09PSBmaWVsZEdyb3VwTmFtZSAmJiBvQ29sdW1uc1trZXldLnNob3dEYXRhRmllbGRzTGFiZWw7XG5cdFx0fSlcblx0KTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgd2l0aCByZXNwZWN0IHRvIHRoZSByb290IGVudGl0eS5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIFRoZSBgRGF0YUZpZWxkYCBiZWluZyBwcm9jZXNzZWQuXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRpdmUgcGF0aFxuICovXG5jb25zdCBfZ2V0UmVsYXRpdmVQYXRoID0gZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyk6IHN0cmluZyB7XG5cdGxldCByZWxhdGl2ZVBhdGggPSBcIlwiO1xuXG5cdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRyZWxhdGl2ZVBhdGggPSAoZGF0YUZpZWxkIGFzIERhdGFGaWVsZCk/LlZhbHVlPy5wYXRoO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0XHRyZWxhdGl2ZVBhdGggPSBkYXRhRmllbGQ/LlRhcmdldD8udmFsdWU7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uR3JvdXA6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uR3JvdXA6XG5cdFx0XHRyZWxhdGl2ZVBhdGggPSBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCk7XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiByZWxhdGl2ZVBhdGg7XG59O1xuXG5jb25zdCBfc2xpY2VBdFNsYXNoID0gZnVuY3Rpb24gKHBhdGg6IHN0cmluZywgaXNMYXN0U2xhc2g6IGJvb2xlYW4sIGlzTGFzdFBhcnQ6IGJvb2xlYW4pIHtcblx0Y29uc3QgaVNsYXNoSW5kZXggPSBpc0xhc3RTbGFzaCA/IHBhdGgubGFzdEluZGV4T2YoXCIvXCIpIDogcGF0aC5pbmRleE9mKFwiL1wiKTtcblxuXHRpZiAoaVNsYXNoSW5kZXggPT09IC0xKSB7XG5cdFx0cmV0dXJuIHBhdGg7XG5cdH1cblx0cmV0dXJuIGlzTGFzdFBhcnQgPyBwYXRoLnN1YnN0cmluZyhpU2xhc2hJbmRleCArIDEsIHBhdGgubGVuZ3RoKSA6IHBhdGguc3Vic3RyaW5nKDAsIGlTbGFzaEluZGV4KTtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgY29sdW1uIGNvbnRhaW5zIGEgbXVsdGktdmFsdWUgZmllbGQuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBUaGUgRGF0YUZpZWxkIGJlaW5nIHByb2Nlc3NlZFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBEYXRhRmllbGQgY29ycmVzcG9uZHMgdG8gYSBtdWx0aS12YWx1ZSBmaWVsZC5cbiAqL1xuY29uc3QgX2lzQ29sdW1uTXVsdGlWYWx1ZWQgPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdGlmIChpc0RhdGFGaWVsZFR5cGVzKGRhdGFGaWVsZCkgJiYgaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24oZGF0YUZpZWxkLlZhbHVlKSkge1xuXHRcdGNvbnN0IHByb3BlcnR5T2JqZWN0UGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCBkYXRhRmllbGQuVmFsdWUucGF0aCk7XG5cdFx0cmV0dXJuIGlzTXVsdGlWYWx1ZUZpZWxkKHByb3BlcnR5T2JqZWN0UGF0aCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGV0aGVyIGEgY29sdW1uIGlzIHNvcnRhYmxlLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIGRhdGEgZmllbGQgYmVpbmcgcHJvY2Vzc2VkXG4gKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBwcm9wZXJ0eSBwYXRoXG4gKiBAcGFyYW0gbm9uU29ydGFibGVDb2x1bW5zIENvbGxlY3Rpb24gb2Ygbm9uLXNvcnRhYmxlIGNvbHVtbiBuYW1lcyBhcyBwZXIgYW5ub3RhdGlvblxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29sdW1uIGlzIHNvcnRhYmxlXG4gKi9cbmNvbnN0IF9pc0NvbHVtblNvcnRhYmxlID0gZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcywgcHJvcGVydHlQYXRoOiBzdHJpbmcsIG5vblNvcnRhYmxlQ29sdW1uczogc3RyaW5nW10pOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRub25Tb3J0YWJsZUNvbHVtbnMuaW5kZXhPZihwcm9wZXJ0eVBhdGgpID09PSAtMSAmJiAvLyBDb2x1bW4gaXMgbm90IG1hcmtlZCBhcyBub24tc29ydGFibGUgdmlhIGFubm90YXRpb25cblx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQgfHxcblx0XHRcdGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCB8fFxuXHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uIHx8XG5cdFx0XHRkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb24pXG5cdCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBmaWx0ZXJpbmcgb24gdGhlIHRhYmxlIGlzIGNhc2Ugc2Vuc2l0aXZlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFJldHVybnMgJ2ZhbHNlJyBpZiBGaWx0ZXJGdW5jdGlvbnMgYW5ub3RhdGlvbiBzdXBwb3J0cyAndG9sb3dlcicsIGVsc2UgJ3RydWUnXG4gKi9cbmV4cG9ydCBjb25zdCBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRjb25zdCBmaWx0ZXJGdW5jdGlvbnM6IEZpbHRlckZ1bmN0aW9ucyB8IHVuZGVmaW5lZCA9IF9nZXRGaWx0ZXJGdW5jdGlvbnMoY29udmVydGVyQ29udGV4dCk7XG5cdHJldHVybiBBcnJheS5pc0FycmF5KGZpbHRlckZ1bmN0aW9ucykgPyAoZmlsdGVyRnVuY3Rpb25zIGFzIFN0cmluZ1tdKS5pbmRleE9mKFwidG9sb3dlclwiKSA9PT0gLTEgOiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2dldEZpbHRlckZ1bmN0aW9ucyhDb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogRmlsdGVyRnVuY3Rpb25zIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgZW50aXR5U2V0ID0gQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0aWYgKFR5cGVHdWFyZHMuaXNFbnRpdHlTZXQoZW50aXR5U2V0KSkge1xuXHRcdHJldHVybiAoXG5cdFx0XHRlbnRpdHlTZXQuYW5ub3RhdGlvbnMuQ2FwYWJpbGl0aWVzPy5GaWx0ZXJGdW5jdGlvbnMgPz9cblx0XHRcdENvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5Q29udGFpbmVyKCkuYW5ub3RhdGlvbnMuQ2FwYWJpbGl0aWVzPy5GaWx0ZXJGdW5jdGlvbnNcblx0XHQpO1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBkZWZhdWx0IGZvcm1hdCBvcHRpb25zIGZvciB0ZXh0IGZpZWxkcyBpbiBhIHRhYmxlLlxuICpcbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zXG4gKiBAcmV0dXJucyBDb2xsZWN0aW9uIG9mIGZvcm1hdCBvcHRpb25zIHdpdGggZGVmYXVsdCB2YWx1ZXNcbiAqL1xuZnVuY3Rpb24gX2dldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yVGFibGUoZm9ybWF0T3B0aW9uczogRm9ybWF0T3B0aW9uc1R5cGUgfCB1bmRlZmluZWQpOiBGb3JtYXRPcHRpb25zVHlwZSB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBmb3JtYXRPcHRpb25zID09PSB1bmRlZmluZWRcblx0XHQ/IHVuZGVmaW5lZFxuXHRcdDoge1xuXHRcdFx0XHR0ZXh0TGluZXNFZGl0OiA0LFxuXHRcdFx0XHQuLi5mb3JtYXRPcHRpb25zXG5cdFx0ICB9O1xufVxuXG5mdW5jdGlvbiBfZmluZFNlbWFudGljS2V5VmFsdWVzKHNlbWFudGljS2V5czogU2VtYW50aWNLZXksIG5hbWU6IHN0cmluZykge1xuXHRjb25zdCBhU2VtYW50aWNLZXlWYWx1ZXM6IHN0cmluZ1tdID0gW107XG5cdGxldCBiU2VtYW50aWNLZXlGb3VuZCA9IGZhbHNlO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IHNlbWFudGljS2V5cy5sZW5ndGg7IGkrKykge1xuXHRcdGFTZW1hbnRpY0tleVZhbHVlcy5wdXNoKHNlbWFudGljS2V5c1tpXS52YWx1ZSk7XG5cdFx0aWYgKHNlbWFudGljS2V5c1tpXS52YWx1ZSA9PT0gbmFtZSkge1xuXHRcdFx0YlNlbWFudGljS2V5Rm91bmQgPSB0cnVlO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4ge1xuXHRcdHZhbHVlczogYVNlbWFudGljS2V5VmFsdWVzLFxuXHRcdHNlbWFudGljS2V5Rm91bmQ6IGJTZW1hbnRpY0tleUZvdW5kXG5cdH07XG59XG5cbmZ1bmN0aW9uIF9maW5kUHJvcGVydGllcyhzZW1hbnRpY0tleVZhbHVlczogc3RyaW5nW10sIGZpZWxkR3JvdXBQcm9wZXJ0aWVzOiBzdHJpbmdbXSkge1xuXHRsZXQgc2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cCA9IGZhbHNlO1xuXHRsZXQgc1Byb3BlcnR5UGF0aDtcblx0aWYgKHNlbWFudGljS2V5VmFsdWVzICYmIHNlbWFudGljS2V5VmFsdWVzLmxlbmd0aCA+PSAxICYmIGZpZWxkR3JvdXBQcm9wZXJ0aWVzICYmIGZpZWxkR3JvdXBQcm9wZXJ0aWVzLmxlbmd0aCA+PSAxKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzZW1hbnRpY0tleVZhbHVlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKFtzZW1hbnRpY0tleVZhbHVlc1tpXV0uc29tZSgodG1wKSA9PiBmaWVsZEdyb3VwUHJvcGVydGllcy5pbmRleE9mKHRtcCkgPj0gMCkpIHtcblx0XHRcdFx0c2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cCA9IHRydWU7XG5cdFx0XHRcdHNQcm9wZXJ0eVBhdGggPSBzZW1hbnRpY0tleVZhbHVlc1tpXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7XG5cdFx0c2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cDogc2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cCxcblx0XHRmaWVsZEdyb3VwUHJvcGVydHlQYXRoOiBzUHJvcGVydHlQYXRoXG5cdH07XG59XG5cbi8qKlxuICogRmluZCB0aGUgZmlyc3QgcHJvcGVydHkgaW4gdGhlIGZpZWxkR3JvdXAgdGhhdCBpcyBwYXJ0IG9mIHRoZSBzZW1hbnRpYyBrZXlzLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRHcm91cFxuICogQHBhcmFtIHNlbWFudGljS2V5VmFsdWVzXG4gKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyBhIGZsYWcgdHJ1ZSBpZiBhIHByb3BlcnR5IGlzIGZvdW5kIGFuZCBhIHByb3BlcnR5UGF0aC5cbiAqL1xuZnVuY3Rpb24gX2ZpbmRTZW1hbnRpY0tleVZhbHVlc0luRmllbGRHcm91cChkYXRhRmllbGRHcm91cDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IG51bGwsIHNlbWFudGljS2V5VmFsdWVzOiBzdHJpbmdbXSkge1xuXHQvLyB0aGlzIGluZm8gaXMgdXNlZCBpbiBGaWVsZGxIZWxwZXIjaXNEcmFmdEluZGljYXRvclZpc2libGVJbkZpZWxkR3JvdXAgdG8gc2hvdyBhIGRyYWZ0IGluZGljYXRvciBhdCB0aGUgZW5kIG9mIGEgZmllbGQgZ3JvdXBcblx0Y29uc3QgYVByb3BlcnRpZXM6IHN0cmluZ1tdID0gW107XG5cdGxldCBfcHJvcGVydGllc0ZvdW5kOiB7IHNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXA6IGJvb2xlYW47IGZpZWxkR3JvdXBQcm9wZXJ0eVBhdGg/OiBzdHJpbmcgfSA9IHtcblx0XHRzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwOiBmYWxzZSxcblx0XHRmaWVsZEdyb3VwUHJvcGVydHlQYXRoOiB1bmRlZmluZWRcblx0fTtcblx0aWYgKFxuXHRcdGRhdGFGaWVsZEdyb3VwICYmXG5cdFx0ZGF0YUZpZWxkR3JvdXAuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiZcblx0XHRkYXRhRmllbGRHcm91cC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5GaWVsZEdyb3VwVHlwZVxuXHQpIHtcblx0XHRkYXRhRmllbGRHcm91cC5UYXJnZXQuJHRhcmdldC5EYXRhPy5mb3JFYWNoKChpbm5lckRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQoaW5uZXJEYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZCB8fCBpbm5lckRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCkgJiZcblx0XHRcdFx0aW5uZXJEYXRhRmllbGQuVmFsdWVcblx0XHRcdCkge1xuXHRcdFx0XHRhUHJvcGVydGllcy5wdXNoKGlubmVyRGF0YUZpZWxkLlZhbHVlLnBhdGgpO1xuXHRcdFx0fVxuXHRcdFx0X3Byb3BlcnRpZXNGb3VuZCA9IF9maW5kUHJvcGVydGllcyhzZW1hbnRpY0tleVZhbHVlcywgYVByb3BlcnRpZXMpO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0c2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cDogX3Byb3BlcnRpZXNGb3VuZC5zZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwLFxuXHRcdHByb3BlcnR5UGF0aDogX3Byb3BlcnRpZXNGb3VuZC5maWVsZEdyb3VwUHJvcGVydHlQYXRoXG5cdH07XG59XG5cbi8qKlxuICogUmV0dXJucyBkZWZhdWx0IGZvcm1hdCBvcHRpb25zIHdpdGggZHJhZnRJbmRpY2F0b3IgZm9yIGEgY29sdW1uLlxuICpcbiAqIEBwYXJhbSBuYW1lXG4gKiBAcGFyYW0gc2VtYW50aWNLZXlzXG4gKiBAcGFyYW0gaXNGaWVsZEdyb3VwQ29sdW1uXG4gKiBAcGFyYW0gZGF0YUZpZWxkR3JvdXBcbiAqIEByZXR1cm5zIENvbGxlY3Rpb24gb2YgZm9ybWF0IG9wdGlvbnMgd2l0aCBkZWZhdWx0IHZhbHVlc1xuICovXG5mdW5jdGlvbiBnZXREZWZhdWx0RHJhZnRJbmRpY2F0b3JGb3JDb2x1bW4oXG5cdG5hbWU6IHN0cmluZyxcblx0c2VtYW50aWNLZXlzOiBTZW1hbnRpY0tleSxcblx0aXNGaWVsZEdyb3VwQ29sdW1uOiBib29sZWFuLFxuXHRkYXRhRmllbGRHcm91cDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IG51bGxcbik6IFBhcnRpYWw8e1xuXHRmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0ZmllbGRHcm91cE5hbWU6IHN0cmluZztcblx0c2hvd0Vycm9yT2JqZWN0U3RhdHVzOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0aGFzRHJhZnRJbmRpY2F0b3I6IGJvb2xlYW47XG59PiB7XG5cdGlmICghc2VtYW50aWNLZXlzKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cdGNvbnN0IHNlbWFudGljS2V5ID0gX2ZpbmRTZW1hbnRpY0tleVZhbHVlcyhzZW1hbnRpY0tleXMsIG5hbWUpO1xuXHRjb25zdCBzZW1hbnRpY0tleUluRmllbGRHcm91cCA9IF9maW5kU2VtYW50aWNLZXlWYWx1ZXNJbkZpZWxkR3JvdXAoZGF0YUZpZWxkR3JvdXAsIHNlbWFudGljS2V5LnZhbHVlcyk7XG5cdGlmIChzZW1hbnRpY0tleUluRmllbGRHcm91cC5zZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwKSB7XG5cdFx0Ly8gU2VtYW50aWMgS2V5IGhhcyBhIHByb3BlcnR5IGluIGEgRmllbGRHcm91cFxuXHRcdHJldHVybiB7XG5cdFx0XHQvL1RPRE8gd2Ugc2hvdWxkIHJhdGhlciBzdG9yZSBoYXNTZW1hbnRpY0tleUluRmllbGRHcm91cFxuXHRcdFx0ZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoOiBzZW1hbnRpY0tleUluRmllbGRHcm91cC5wcm9wZXJ0eVBhdGgsXG5cdFx0XHRmaWVsZEdyb3VwTmFtZTogbmFtZSxcblx0XHRcdHNob3dFcnJvck9iamVjdFN0YXR1czogY29tcGlsZUV4cHJlc3Npb24oZ2V0Um93U3RhdHVzVmlzaWJpbGl0eShuYW1lLCB0cnVlKSlcblx0XHR9O1xuXHR9IGVsc2UgaWYgKHNlbWFudGljS2V5LnNlbWFudGljS2V5Rm91bmQpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aGFzRHJhZnRJbmRpY2F0b3I6IHRydWUsXG5cdFx0XHRzaG93RXJyb3JPYmplY3RTdGF0dXM6IGNvbXBpbGVFeHByZXNzaW9uKGdldFJvd1N0YXR1c1Zpc2liaWxpdHkobmFtZSwgZmFsc2UpKVxuXHRcdH07XG5cdH1cblx0cmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBfZ2V0SW1wTnVtYmVyKGRhdGFGaWVsZDogRGF0YUZpZWxkVHlwZXMpOiBudW1iZXIge1xuXHRjb25zdCBpbXBvcnRhbmNlID0gZGF0YUZpZWxkPy5hbm5vdGF0aW9ucz8uVUk/LkltcG9ydGFuY2UgYXMgc3RyaW5nO1xuXG5cdGlmIChpbXBvcnRhbmNlICYmIGltcG9ydGFuY2UuaW5jbHVkZXMoXCJVSS5JbXBvcnRhbmNlVHlwZS9IaWdoXCIpKSB7XG5cdFx0cmV0dXJuIDM7XG5cdH1cblx0aWYgKGltcG9ydGFuY2UgJiYgaW1wb3J0YW5jZS5pbmNsdWRlcyhcIlVJLkltcG9ydGFuY2VUeXBlL01lZGl1bVwiKSkge1xuXHRcdHJldHVybiAyO1xuXHR9XG5cdGlmIChpbXBvcnRhbmNlICYmIGltcG9ydGFuY2UuaW5jbHVkZXMoXCJVSS5JbXBvcnRhbmNlVHlwZS9Mb3dcIikpIHtcblx0XHRyZXR1cm4gMTtcblx0fVxuXHRyZXR1cm4gMDtcbn1cblxuZnVuY3Rpb24gX2dldERhdGFGaWVsZEltcG9ydGFuY2UoZGF0YUZpZWxkOiBEYXRhRmllbGRUeXBlcyk6IEltcG9ydGFuY2Uge1xuXHRjb25zdCBpbXBvcnRhbmNlID0gZGF0YUZpZWxkPy5hbm5vdGF0aW9ucz8uVUk/LkltcG9ydGFuY2UgYXMgc3RyaW5nO1xuXHRyZXR1cm4gaW1wb3J0YW5jZSA/IChpbXBvcnRhbmNlLnNwbGl0KFwiL1wiKVsxXSBhcyBJbXBvcnRhbmNlKSA6IEltcG9ydGFuY2UuTm9uZTtcbn1cblxuZnVuY3Rpb24gX2dldE1heEltcG9ydGFuY2UoZmllbGRzOiBEYXRhRmllbGRUeXBlc1tdKTogSW1wb3J0YW5jZSB7XG5cdGlmIChmaWVsZHMgJiYgZmllbGRzLmxlbmd0aCA+IDApIHtcblx0XHRsZXQgbWF4SW1wTnVtYmVyID0gLTE7XG5cdFx0bGV0IGltcE51bWJlciA9IC0xO1xuXHRcdGxldCBEYXRhRmllbGRXaXRoTWF4SW1wb3J0YW5jZTtcblx0XHRmb3IgKGNvbnN0IGZpZWxkIG9mIGZpZWxkcykge1xuXHRcdFx0aW1wTnVtYmVyID0gX2dldEltcE51bWJlcihmaWVsZCk7XG5cdFx0XHRpZiAoaW1wTnVtYmVyID4gbWF4SW1wTnVtYmVyKSB7XG5cdFx0XHRcdG1heEltcE51bWJlciA9IGltcE51bWJlcjtcblx0XHRcdFx0RGF0YUZpZWxkV2l0aE1heEltcG9ydGFuY2UgPSBmaWVsZDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIF9nZXREYXRhRmllbGRJbXBvcnRhbmNlKERhdGFGaWVsZFdpdGhNYXhJbXBvcnRhbmNlIGFzIERhdGFGaWVsZFR5cGVzKTtcblx0fVxuXHRyZXR1cm4gSW1wb3J0YW5jZS5Ob25lO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGltcG9ydGFuY2UgdmFsdWUgZm9yIGEgY29sdW1uLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRcbiAqIEBwYXJhbSBzZW1hbnRpY0tleXNcbiAqIEByZXR1cm5zIFRoZSBpbXBvcnRhbmNlIHZhbHVlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbXBvcnRhbmNlKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IHVuZGVmaW5lZCwgc2VtYW50aWNLZXlzOiBTZW1hbnRpY0tleSk6IEltcG9ydGFuY2UgfCB1bmRlZmluZWQge1xuXHQvL0V2YWx1YXRlIGRlZmF1bHQgSW1wb3J0YW5jZSBpcyBub3Qgc2V0IGV4cGxpY2l0bHlcblx0bGV0IGZpZWxkc1dpdGhJbXBvcnRhbmNlLFxuXHRcdG1hcFNlbWFudGljS2V5czogc3RyaW5nW10gPSBbXTtcblx0Ly9DaGVjayBpZiBzZW1hbnRpY0tleXMgYXJlIGRlZmluZWQgYXQgdGhlIEVudGl0eVNldCBsZXZlbFxuXHRpZiAoc2VtYW50aWNLZXlzICYmIHNlbWFudGljS2V5cy5sZW5ndGggPiAwKSB7XG5cdFx0bWFwU2VtYW50aWNLZXlzID0gc2VtYW50aWNLZXlzLm1hcChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4ga2V5LnZhbHVlO1xuXHRcdH0pO1xuXHR9XG5cdGlmICghZGF0YUZpZWxkKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGlmIChpc0Fubm90YXRpb25PZlR5cGU8RGF0YUZpZWxkRm9yQW5ub3RhdGlvbj4oZGF0YUZpZWxkLCBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uKSkge1xuXHRcdGNvbnN0IGRhdGFGaWVsZFRhcmdldCA9IGRhdGFGaWVsZC5UYXJnZXQuJHRhcmdldDtcblx0XHRpZiAoaXNBbm5vdGF0aW9uT2ZUeXBlPEZpZWxkR3JvdXA+KGRhdGFGaWVsZFRhcmdldCwgVUlBbm5vdGF0aW9uVHlwZXMuRmllbGRHcm91cFR5cGUpKSB7XG5cdFx0XHRjb25zdCBmaWVsZEdyb3VwRGF0YSA9IGRhdGFGaWVsZFRhcmdldC5EYXRhO1xuXHRcdFx0Y29uc3QgZmllbGRHcm91cEhhc1NlbWFudGljS2V5ID1cblx0XHRcdFx0ZmllbGRHcm91cERhdGEgJiZcblx0XHRcdFx0ZmllbGRHcm91cERhdGEuc29tZShmdW5jdGlvbiAoZmllbGRHcm91cERhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykge1xuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHQoZmllbGRHcm91cERhdGFGaWVsZCBhcyB1bmtub3duIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LnBhdGggJiZcblx0XHRcdFx0XHRcdGZpZWxkR3JvdXBEYXRhRmllbGQuJFR5cGUgIT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiZcblx0XHRcdFx0XHRcdG1hcFNlbWFudGljS2V5cy5pbmNsdWRlcygoZmllbGRHcm91cERhdGFGaWVsZCBhcyB1bmtub3duIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LnBhdGgpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSk7XG5cdFx0XHQvL0lmIGEgRmllbGRHcm91cCBjb250YWlucyBhIHNlbWFudGljS2V5LCBpbXBvcnRhbmNlIHNldCB0byBIaWdoXG5cdFx0XHRpZiAoZmllbGRHcm91cEhhc1NlbWFudGljS2V5KSB7XG5cdFx0XHRcdHJldHVybiBJbXBvcnRhbmNlLkhpZ2g7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL0lmIHRoZSBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIGhhcyBhbiBJbXBvcnRhbmNlIHdlIHRha2UgaXRcblx0XHRcdFx0aWYgKGRhdGFGaWVsZD8uYW5ub3RhdGlvbnM/LlVJPy5JbXBvcnRhbmNlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIF9nZXREYXRhRmllbGRJbXBvcnRhbmNlKGRhdGFGaWVsZCBhcyB1bmtub3duIGFzIERhdGFGaWVsZFR5cGVzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBlbHNlIHRoZSBoaWdoZXN0IGltcG9ydGFuY2UgKGlmIGFueSkgaXMgcmV0dXJuZWRcblx0XHRcdFx0ZmllbGRzV2l0aEltcG9ydGFuY2UgPVxuXHRcdFx0XHRcdGZpZWxkR3JvdXBEYXRhICYmXG5cdFx0XHRcdFx0ZmllbGRHcm91cERhdGEuZmlsdGVyKGZ1bmN0aW9uIChpdGVtKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gaXRlbT8uYW5ub3RhdGlvbnM/LlVJPy5JbXBvcnRhbmNlO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gX2dldE1heEltcG9ydGFuY2UoZmllbGRzV2l0aEltcG9ydGFuY2UgYXMgRGF0YUZpZWxkVHlwZXNbXSk7XG5cdFx0XHR9XG5cdFx0XHQvL0lmIHRoZSBjdXJyZW50IGZpZWxkIGlzIGEgc2VtYW50aWNLZXksIGltcG9ydGFuY2Ugc2V0IHRvIEhpZ2hcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gKGRhdGFGaWVsZCBhcyBEYXRhRmllbGRUeXBlcykuVmFsdWUgJiZcblx0XHQoZGF0YUZpZWxkIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LnBhdGggJiZcblx0XHRtYXBTZW1hbnRpY0tleXMuaW5jbHVkZXMoKGRhdGFGaWVsZCBhcyBEYXRhRmllbGRUeXBlcykuVmFsdWUucGF0aClcblx0XHQ/IEltcG9ydGFuY2UuSGlnaFxuXHRcdDogX2dldERhdGFGaWVsZEltcG9ydGFuY2UoZGF0YUZpZWxkIGFzIHVua25vd24gYXMgRGF0YUZpZWxkVHlwZXMpO1xufVxuXG4vKipcbiAqIENoZWNrcyBpZiBkaXNwbGF5aW5nIG9mIHRoZSBjb2x1bW4gaXMgc3VwcG9ydGVkIGZvciBhbiBpbnNpZ2h0cyBjYXJkLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGRcbiAqIEBwYXJhbSBzTGFiZWxcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gaXNNdWx0aVZhbHVlXG4gKiBAcmV0dXJucyBUcnVlIGlmIGRpc3BsYXlpbmcgb2YgdGhlIGNvbHVtbiBpcyBzdXBwb3J0ZWQgZm9yIGFuIGluc2lnaHRzIGNhcmQuXG4gKi9cbmNvbnN0IGNoZWNrSWZDb2x1bW5Jc1N1cHBvcnRlZEZvckluc2lnaHRzID0gZnVuY3Rpb24gKFxuXHRkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdHNMYWJlbDogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRpc011bHRpVmFsdWU6IGJvb2xlYW5cbikge1xuXHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKTtcblxuXHRpZiAoc0xhYmVsICYmIHNMYWJlbCAhPT0gXCJcIiAmJiBhbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtXCIpICE9PSAtMSAmJiBpc0RhdGFGaWVsZFR5cGVzKGRhdGFGaWVsZCkpIHtcblx0XHQvLyBpbmNsdWRlIG9ubHkgdGhvc2UgY29sdW1ucyB0aGF0IGFyZSBhbm5vdGF0ZWQgYXMgcGFydCBvZiB0aGUgdGFibGUgKHNraXAgZW50aXR5IHByb3BzKVxuXHRcdGNvbnN0IGlzSW1hZ2VDb2x1bW4gPSBkYXRhRmllbGQuVmFsdWU/LiR0YXJnZXQgPyBpc0ltYWdlVVJMKGRhdGFGaWVsZC5WYWx1ZS4kdGFyZ2V0KSA6IGZhbHNlO1xuXHRcdHJldHVybiAhaXNNdWx0aVZhbHVlICYmICFpc0ltYWdlQ29sdW1uO1xuXHR9XG5cblx0cmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGxpbmUgaXRlbXMgZnJvbSBtZXRhZGF0YSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgd2l0aCB0aGVpciBhbm5vdGF0aW9uc1xuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoIFRoZSB2aXN1YWxpemF0aW9uIHBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGlzSW5zaWdodHNFbmFibGVkXG4gKiBAcmV0dXJucyBUaGUgY29sdW1ucyBmcm9tIHRoZSBhbm5vdGF0aW9uc1xuICovXG5jb25zdCBnZXRDb2x1bW5zRnJvbUFubm90YXRpb25zID0gZnVuY3Rpb24gKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRpc0luc2lnaHRzRW5hYmxlZD86IGJvb2xlYW5cbik6IEFubm90YXRpb25UYWJsZUNvbHVtbltdIHtcblx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUobGluZUl0ZW1Bbm5vdGF0aW9uKSxcblx0XHRhbm5vdGF0aW9uQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10gPSBbXSxcblx0XHRjb2x1bW5zVG9CZUNyZWF0ZWQ6IFJlY29yZDxzdHJpbmcsIFByb3BlcnR5PiA9IHt9LFxuXHRcdG5vblNvcnRhYmxlQ29sdW1uczogc3RyaW5nW10gPSBnZXROb25Tb3J0YWJsZVByb3BlcnRpZXNSZXN0cmljdGlvbnMoY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKSksXG5cdFx0dGFibGVNYW5pZmVzdFNldHRpbmdzOiBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCksXG5cdFx0dGFibGVUeXBlOiBUYWJsZVR5cGUgPSB0YWJsZU1hbmlmZXN0U2V0dGluZ3M/LnRhYmxlU2V0dGluZ3M/LnR5cGUgfHwgXCJSZXNwb25zaXZlVGFibGVcIjtcblx0Y29uc3QgdGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uOiBzdHJpbmdbXSA9IFtdO1xuXHRjb25zdCBzZW1hbnRpY0tleXM6IFNlbWFudGljS2V5ID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcIkNvbW1vblwiLCBDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNLZXksIFtcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKVxuXHRdKVswXTtcblx0aWYgKGxpbmVJdGVtQW5ub3RhdGlvbikge1xuXHRcdGNvbnN0IHRhYmxlQ29udmVydGVyQ29udGV4dCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihcblx0XHRcdGdldFRhcmdldE9iamVjdFBhdGgoY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkpXG5cdFx0KTtcblxuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbi5mb3JFYWNoKChsaW5lSXRlbSkgPT4ge1xuXHRcdFx0Ly8gVE9ETzogdmFyaWFibGUgbmFtZSBzaG91bGQgYmUgZGF0YWZpZWxkIGFuZCBub3QgbGluZUl0ZW1cblx0XHRcdGlmICghX2lzVmFsaWRDb2x1bW4obGluZUl0ZW0pKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGxldCBleHBvcnRTZXR0aW5nczogY29sdW1uRXhwb3J0U2V0dGluZ3MgfCBudWxsID0gbnVsbDtcblx0XHRcdGNvbnN0IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGggPVxuXHRcdFx0XHRpc0RhdGFGaWVsZFR5cGVzKGxpbmVJdGVtKSAmJiBsaW5lSXRlbS5WYWx1ZT8uJHRhcmdldD8uZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0XHRcdFx0PyBnZXRTZW1hbnRpY09iamVjdFBhdGgoY29udmVydGVyQ29udGV4dCwgbGluZUl0ZW0pXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCByZWxhdGl2ZVBhdGggPSBfZ2V0UmVsYXRpdmVQYXRoKGxpbmVJdGVtKTtcblx0XHRcdC8vIERldGVybWluZSBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBjb25zdW1lZCBieSB0aGlzIExpbmVJdGVtLlxuXHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnRpZXNJbmZvOiBDb21wbGV4UHJvcGVydHlJbmZvID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzUmVjdXJzaXZlbHkobGluZUl0ZW0sIGNvbnZlcnRlckNvbnRleHQsIHRhYmxlVHlwZSk7XG5cdFx0XHRjb25zdCByZWxhdGVkUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8ucHJvcGVydGllcyk7XG5cdFx0XHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHlOYW1lczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8uYWRkaXRpb25hbFByb3BlcnRpZXMpO1xuXHRcdFx0Y29uc3QgZ3JvdXBQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQgPSByZWxhdGl2ZVBhdGggPyBfc2xpY2VBdFNsYXNoKHJlbGF0aXZlUGF0aCwgdHJ1ZSwgZmFsc2UpIDogdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgaXNHcm91cDogYm9vbGVhbiA9IGdyb3VwUGF0aCAhPSByZWxhdGl2ZVBhdGg7XG5cdFx0XHRjb25zdCBzTGFiZWw6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGdldExhYmVsKGxpbmVJdGVtLCBpc0dyb3VwKTtcblx0XHRcdGNvbnN0IG5hbWUgPSBfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUobGluZUl0ZW0pO1xuXHRcdFx0Y29uc3QgaXNGaWVsZEdyb3VwQ29sdW1uOiBib29sZWFuID0gZ3JvdXBQYXRoID8gZ3JvdXBQYXRoLmluZGV4T2YoYEAke1VJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXB9YCkgPiAtMSA6IGZhbHNlO1xuXHRcdFx0Y29uc3Qgc2hvd0RhdGFGaWVsZHNMYWJlbDogYm9vbGVhbiA9IGlzRmllbGRHcm91cENvbHVtblxuXHRcdFx0XHQ/IF9nZXRTaG93RGF0YUZpZWxkc0xhYmVsKG5hbWUsIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdFx0XHQ6IGZhbHNlO1xuXHRcdFx0Y29uc3QgZGF0YVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGdldERhdGFGaWVsZERhdGFUeXBlKGxpbmVJdGVtKTtcblx0XHRcdGNvbnN0IHNEYXRlSW5wdXRGb3JtYXQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGRhdGFUeXBlID09PSBcIkVkbS5EYXRlXCIgPyBcIllZWVktTU0tRERcIiA6IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IGZvcm1hdE9wdGlvbnMgPSBfZ2V0RGVmYXVsdEZvcm1hdE9wdGlvbnNGb3JUYWJsZShcblx0XHRcdFx0Z2V0RGVmYXVsdERyYWZ0SW5kaWNhdG9yRm9yQ29sdW1uKG5hbWUsIHNlbWFudGljS2V5cywgaXNGaWVsZEdyb3VwQ29sdW1uLCBsaW5lSXRlbSlcblx0XHRcdCk7XG5cdFx0XHRsZXQgZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0XHRcdGlmIChcblx0XHRcdFx0bGluZUl0ZW0uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiZcblx0XHRcdFx0bGluZUl0ZW0uVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRmllbGRHcm91cFR5cGVcblx0XHRcdCkge1xuXHRcdFx0XHRmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMgPSBfZ2V0RmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zKGxpbmVJdGVtKTtcblx0XHRcdH1cblx0XHRcdGlmIChfaXNFeHBvcnRhYmxlQ29sdW1uKGxpbmVJdGVtKSkge1xuXHRcdFx0XHQvL2V4Y2x1ZGUgdGhlIHR5cGVzIGxpc3RlZCBhYm92ZSBmb3IgdGhlIEV4cG9ydCAoZ2VuZXJhdGVzIGVycm9yIG9uIEV4cG9ydCBhcyBQREYpXG5cdFx0XHRcdGV4cG9ydFNldHRpbmdzID0ge1xuXHRcdFx0XHRcdHRlbXBsYXRlOiByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0U2V0dGluZ3NUZW1wbGF0ZSxcblx0XHRcdFx0XHR3cmFwOiByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0U2V0dGluZ3NXcmFwcGluZyxcblx0XHRcdFx0XHR0eXBlOiBkYXRhVHlwZSA/IF9nZXRFeHBvcnREYXRhVHlwZShkYXRhVHlwZSwgcmVsYXRlZFByb3BlcnR5TmFtZXMubGVuZ3RoID4gMSkgOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0aW5wdXRGb3JtYXQ6IHNEYXRlSW5wdXRGb3JtYXQsXG5cdFx0XHRcdFx0ZGVsaW1pdGVyOiBkYXRhVHlwZSA9PT0gXCJFZG0uSW50NjRcIlxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VW5pdE5hbWUpIHtcblx0XHRcdFx0XHRleHBvcnRTZXR0aW5ncy51bml0UHJvcGVydHkgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VW5pdE5hbWU7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudHlwZSA9IFwiQ3VycmVuY3lcIjsgLy8gRm9yY2UgdG8gYSBjdXJyZW5jeSBiZWNhdXNlIHRoZXJlJ3MgYSB1bml0UHJvcGVydHkgKG90aGVyd2lzZSB0aGUgdmFsdWUgaXNuJ3QgcHJvcGVybHkgZm9ybWF0dGVkIHdoZW4gZXhwb3J0ZWQpXG5cdFx0XHRcdH0gZWxzZSBpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXRTdHJpbmcpIHtcblx0XHRcdFx0XHRleHBvcnRTZXR0aW5ncy51bml0ID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXRTdHJpbmc7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZU5hbWUpIHtcblx0XHRcdFx0XHRleHBvcnRTZXR0aW5ncy50aW1lem9uZVByb3BlcnR5ID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFRpbWV6b25lTmFtZTtcblx0XHRcdFx0fSBlbHNlIGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVTdHJpbmcpIHtcblx0XHRcdFx0XHRleHBvcnRTZXR0aW5ncy50aW1lem9uZSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZVN0cmluZztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgcHJvcGVydHlUeXBlQ29uZmlnOiBQcm9wZXJ0eVR5cGVDb25maWcgfCB1bmRlZmluZWQ7XG5cdFx0XHRpZiAoZGF0YVR5cGUpIHtcblx0XHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnID0gZ2V0VHlwZUNvbmZpZyhsaW5lSXRlbSwgZGF0YVR5cGUpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgdHlwZUNvbmZpZzogUHJvcGVydHlUeXBlQ29uZmlnID0ge1xuXHRcdFx0XHRjbGFzc05hbWU6IGRhdGFUeXBlIGFzIGtleW9mIHR5cGVvZiBEZWZhdWx0VHlwZUZvckVkbVR5cGUsXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IHtcblx0XHRcdFx0XHQuLi5mb3JtYXRPcHRpb25zLFxuXHRcdFx0XHRcdC4uLnByb3BlcnR5VHlwZUNvbmZpZz8uZm9ybWF0T3B0aW9uc1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRjb25zdHJhaW50czogeyAuLi5wcm9wZXJ0eVR5cGVDb25maWc/LmNvbnN0cmFpbnRzIH1cblx0XHRcdH07XG5cdFx0XHRjb25zdCB2aXN1YWxTZXR0aW5nczogVmlzdWFsU2V0dGluZ3MgPSB7fTtcblx0XHRcdGlmICghZGF0YVR5cGUgfHwgIXR5cGVDb25maWcpIHtcblx0XHRcdFx0Ly8gZm9yIGNoYXJ0c1xuXHRcdFx0XHR2aXN1YWxTZXR0aW5ncy53aWR0aENhbGN1bGF0aW9uID0gbnVsbDtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGlzTXVsdGlWYWx1ZSA9IF9pc0NvbHVtbk11bHRpVmFsdWVkKGxpbmVJdGVtLCB0YWJsZUNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0Y29uc3Qgc29ydGFibGUgPSAhaXNNdWx0aVZhbHVlICYmIF9pc0NvbHVtblNvcnRhYmxlKGxpbmVJdGVtLCByZWxhdGl2ZVBhdGgsIG5vblNvcnRhYmxlQ29sdW1ucyk7XG5cdFx0XHRjb25zdCB0YWJsZU1hbmlmZXN0Q29uZmlnID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IGVuYWJsZUFkZENhcmRUb0luc2lnaHRzID0gdGFibGVNYW5pZmVzdENvbmZpZy50YWJsZVNldHRpbmdzPy5lbmFibGVBZGRDYXJkVG9JbnNpZ2h0cyA/PyB0cnVlO1xuXHRcdFx0Y29uc3QgY29sdW1uOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4gPSB7XG5cdFx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChsaW5lSXRlbSksXG5cdFx0XHRcdHR5cGU6IENvbHVtblR5cGUuQW5ub3RhdGlvbixcblx0XHRcdFx0bGFiZWw6IHNMYWJlbCxcblx0XHRcdFx0Z3JvdXBMYWJlbDogaXNHcm91cCA/IGdldExhYmVsKGxpbmVJdGVtKSA6IHVuZGVmaW5lZCxcblx0XHRcdFx0Z3JvdXA6IGlzR3JvdXAgPyBncm91cFBhdGggOiB1bmRlZmluZWQsXG5cdFx0XHRcdEZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9uczogZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGxpbmVJdGVtLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdHNlbWFudGljT2JqZWN0UGF0aDogc2VtYW50aWNPYmplY3RBbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0YXZhaWxhYmlsaXR5OiBpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihsaW5lSXRlbSkgPyBcIkhpZGRlblwiIDogXCJEZWZhdWx0XCIsXG5cdFx0XHRcdG5hbWU6IG5hbWUsXG5cdFx0XHRcdHNob3dEYXRhRmllbGRzTGFiZWw6IHNob3dEYXRhRmllbGRzTGFiZWwsXG5cdFx0XHRcdHJlbGF0aXZlUGF0aDogcmVsYXRpdmVQYXRoLFxuXHRcdFx0XHRzb3J0YWJsZTogc29ydGFibGUsXG5cdFx0XHRcdHByb3BlcnR5SW5mb3M6IHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmxlbmd0aCA/IHJlbGF0ZWRQcm9wZXJ0eU5hbWVzIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRhZGRpdGlvbmFsUHJvcGVydHlJbmZvczogYWRkaXRpb25hbFByb3BlcnR5TmFtZXMubGVuZ3RoID4gMCA/IGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRleHBvcnRTZXR0aW5nczogZXhwb3J0U2V0dGluZ3MsXG5cdFx0XHRcdHdpZHRoOiAobGluZUl0ZW0uYW5ub3RhdGlvbnM/LkhUTUw1Py5Dc3NEZWZhdWx0cz8ud2lkdGg/LnZhbHVlT2YoKSBhcyBzdHJpbmcpIHx8IHVuZGVmaW5lZCxcblx0XHRcdFx0aW1wb3J0YW5jZTogZ2V0SW1wb3J0YW5jZShsaW5lSXRlbSBhcyBEYXRhRmllbGRUeXBlcywgc2VtYW50aWNLZXlzKSxcblx0XHRcdFx0aXNOYXZpZ2FibGU6IHRydWUsXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IGZvcm1hdE9wdGlvbnMsXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZShjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0dHlwZUNvbmZpZzogdHlwZUNvbmZpZyxcblx0XHRcdFx0dmlzdWFsU2V0dGluZ3M6IHZpc3VhbFNldHRpbmdzLFxuXHRcdFx0XHR0aW1lem9uZVRleHQ6IGV4cG9ydFNldHRpbmdzPy50aW1lem9uZSxcblx0XHRcdFx0aXNQYXJ0T2ZMaW5lSXRlbTogdHJ1ZVxuXHRcdFx0fTtcblx0XHRcdGNvbHVtbi5pc0luc2lnaHRzU3VwcG9ydGVkID1cblx0XHRcdFx0ZW5hYmxlQWRkQ2FyZFRvSW5zaWdodHMgPT09IHRydWUgJiZcblx0XHRcdFx0aXNJbnNpZ2h0c0VuYWJsZWQgPT09IHRydWUgJiZcblx0XHRcdFx0Y2hlY2tJZkNvbHVtbklzU3VwcG9ydGVkRm9ySW5zaWdodHMobGluZUl0ZW0sIHNMYWJlbCwgY29udmVydGVyQ29udGV4dCwgaXNNdWx0aVZhbHVlKTtcblx0XHRcdGNvbnN0IHNUb29sdGlwID0gX2dldFRvb2x0aXAobGluZUl0ZW0pIHx8IHNMYWJlbDtcblx0XHRcdGlmIChzVG9vbHRpcCkge1xuXHRcdFx0XHRjb2x1bW4udG9vbHRpcCA9IHNUb29sdGlwO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby50ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb24ucHVzaCguLi5yZWxhdGVkUHJvcGVydGllc0luZm8udGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uKTtcblx0XHRcdH1cblx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUgJiYgY29sdW1uLmV4cG9ydFNldHRpbmdzKSB7XG5cdFx0XHRcdGNvbHVtbi5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZTtcblx0XHRcdFx0Y29sdW1uLmV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdFx0fVxuXG5cdFx0XHRhbm5vdGF0aW9uQ29sdW1ucy5wdXNoKGNvbHVtbik7XG5cblx0XHRcdC8vIENvbGxlY3QgaW5mb3JtYXRpb24gb2YgcmVsYXRlZCBjb2x1bW5zIHRvIGJlIGNyZWF0ZWQuXG5cdFx0XHRyZWxhdGVkUHJvcGVydHlOYW1lcy5mb3JFYWNoKChyZWxhdGVkUHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRcdGNvbHVtbnNUb0JlQ3JlYXRlZFtyZWxhdGVkUHJvcGVydHlOYW1lXSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5wcm9wZXJ0aWVzW3JlbGF0ZWRQcm9wZXJ0eU5hbWVdO1xuXG5cdFx0XHRcdC8vIEluIGNhc2Ugb2YgYSBtdWx0aS12YWx1ZSwgcmVsYXRlZCBwcm9wZXJ0aWVzIGNhbm5vdCBiZSBzb3J0ZWQgYXMgd2UgZ28gdGhyb3VnaCBhIDEtbiByZWxhdGlvblxuXHRcdFx0XHRpZiAoaXNNdWx0aVZhbHVlKSB7XG5cdFx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLnB1c2gocmVsYXRlZFByb3BlcnR5TmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBDcmVhdGUgY29sdW1ucyBmb3IgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGlkZW50aWZpZWQgZm9yIEFMUCB1c2UgY2FzZS5cblx0XHRcdGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzLmZvckVhY2goKGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdFx0Ly8gSW50ZW50aW9uYWwgb3ZlcndyaXRlIGFzIHdlIHJlcXVpcmUgb25seSBvbmUgbmV3IFByb3BlcnR5SW5mbyBmb3IgYSByZWxhdGVkIFByb3BlcnR5LlxuXHRcdFx0XHRjb2x1bW5zVG9CZUNyZWF0ZWRbYWRkaXRpb25hbFByb3BlcnR5TmFtZV0gPSByZWxhdGVkUHJvcGVydGllc0luZm8uYWRkaXRpb25hbFByb3BlcnRpZXNbYWRkaXRpb25hbFByb3BlcnR5TmFtZV07XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIEdldCBjb2x1bW5zIGZyb20gdGhlIFByb3BlcnRpZXMgb2YgRW50aXR5VHlwZVxuXHRyZXR1cm4gZ2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlKFxuXHRcdGNvbHVtbnNUb0JlQ3JlYXRlZCxcblx0XHRlbnRpdHlUeXBlLFxuXHRcdGFubm90YXRpb25Db2x1bW5zLFxuXHRcdG5vblNvcnRhYmxlQ29sdW1ucyxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdHRhYmxlVHlwZSxcblx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb25cblx0KTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgcHJvcGVydHkgbmFtZXMgZnJvbSB0aGUgbWFuaWZlc3QgYW5kIGNoZWNrcyBhZ2FpbnN0IGV4aXN0aW5nIHByb3BlcnRpZXMgYWxyZWFkeSBhZGRlZCBieSBhbm5vdGF0aW9ucy5cbiAqIElmIGEgbm90IHlldCBzdG9yZWQgcHJvcGVydHkgaXMgZm91bmQgaXQgYWRkcyBpdCBmb3Igc29ydGluZyBhbmQgZmlsdGVyaW5nIG9ubHkgdG8gdGhlIGFubm90YXRpb25Db2x1bW5zLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0gYW5ub3RhdGlvbkNvbHVtbnNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gZW50aXR5VHlwZVxuICogQHJldHVybnMgVGhlIGNvbHVtbnMgZnJvbSB0aGUgYW5ub3RhdGlvbnNcbiAqL1xuY29uc3QgX2dldFByb3BlcnR5TmFtZXMgPSBmdW5jdGlvbiAoXG5cdHByb3BlcnRpZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxuXHRhbm5vdGF0aW9uQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGVcbik6IHN0cmluZ1tdIHwgdW5kZWZpbmVkIHtcblx0bGV0IG1hdGNoZWRQcm9wZXJ0aWVzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZDtcblx0aWYgKHByb3BlcnRpZXMpIHtcblx0XHRtYXRjaGVkUHJvcGVydGllcyA9IHByb3BlcnRpZXMubWFwKGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGgpIHtcblx0XHRcdGNvbnN0IGFubm90YXRpb25Db2x1bW4gPSBhbm5vdGF0aW9uQ29sdW1ucy5maW5kKGZ1bmN0aW9uIChhbm5vdGF0aW9uQ29sdW1uKSB7XG5cdFx0XHRcdHJldHVybiBhbm5vdGF0aW9uQ29sdW1uLnJlbGF0aXZlUGF0aCA9PT0gcHJvcGVydHlQYXRoICYmIGFubm90YXRpb25Db2x1bW4ucHJvcGVydHlJbmZvcyA9PT0gdW5kZWZpbmVkO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoYW5ub3RhdGlvbkNvbHVtbikge1xuXHRcdFx0XHRyZXR1cm4gYW5ub3RhdGlvbkNvbHVtbi5uYW1lO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgcmVsYXRlZENvbHVtbnMgPSBfY3JlYXRlUmVsYXRlZENvbHVtbnMoXG5cdFx0XHRcdFx0eyBbcHJvcGVydHlQYXRoXTogZW50aXR5VHlwZS5yZXNvbHZlUGF0aChwcm9wZXJ0eVBhdGgpIH0sXG5cdFx0XHRcdFx0YW5ub3RhdGlvbkNvbHVtbnMsXG5cdFx0XHRcdFx0W10sXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRlbnRpdHlUeXBlLFxuXHRcdFx0XHRcdFtdXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFubm90YXRpb25Db2x1bW5zLnB1c2gocmVsYXRlZENvbHVtbnNbMF0pO1xuXHRcdFx0XHRyZXR1cm4gcmVsYXRlZENvbHVtbnNbMF0ubmFtZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBtYXRjaGVkUHJvcGVydGllcztcbn07XG5cbmNvbnN0IF9hcHBlbmRDdXN0b21UZW1wbGF0ZSA9IGZ1bmN0aW9uIChwcm9wZXJ0aWVzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG5cdHJldHVybiBwcm9wZXJ0aWVzXG5cdFx0Lm1hcCgocHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiBgeyR7cHJvcGVydGllcy5pbmRleE9mKHByb3BlcnR5KX19YDtcblx0XHR9KVxuXHRcdC5qb2luKGAke1wiXFxuXCJ9YCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGFibGUgY29sdW1uIGRlZmluaXRpb25zIGZyb20gbWFuaWZlc3QuXG4gKlxuICogVGhlc2UgbWF5IGJlIGN1c3RvbSBjb2x1bW5zIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0LCBzbG90IGNvbHVtbnMgY29taW5nIHRocm91Z2hcbiAqIGEgYnVpbGRpbmcgYmxvY2ssIG9yIGFubm90YXRpb24gY29sdW1ucyB0byBvdmVyd3JpdGUgYW5ub3RhdGlvbi1iYXNlZCBjb2x1bW5zLlxuICpcbiAqIEBwYXJhbSBjb2x1bW5zXG4gKiBAcGFyYW0gYW5ub3RhdGlvbkNvbHVtbnNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gZW50aXR5VHlwZVxuICogQHBhcmFtIG5hdmlnYXRpb25TZXR0aW5nc1xuICogQHJldHVybnMgVGhlIGNvbHVtbnMgZnJvbSB0aGUgbWFuaWZlc3RcbiAqL1xuY29uc3QgZ2V0Q29sdW1uc0Zyb21NYW5pZmVzdCA9IGZ1bmN0aW9uIChcblx0Y29sdW1uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uIHwgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGU+LFxuXHRhbm5vdGF0aW9uQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdG5hdmlnYXRpb25TZXR0aW5ncz86IE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb25cbik6IFJlY29yZDxzdHJpbmcsIE1hbmlmZXN0Q29sdW1uPiB7XG5cdGNvbnN0IGludGVybmFsQ29sdW1uczogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RDb2x1bW4+ID0ge307XG5cblx0ZnVuY3Rpb24gaXNBbm5vdGF0aW9uQ29sdW1uKFxuXHRcdGNvbHVtbjogQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uIHwgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUsXG5cdFx0a2V5OiBzdHJpbmdcblx0KTogY29sdW1uIGlzIEN1c3RvbURlZmluZWRUYWJsZUNvbHVtbkZvck92ZXJyaWRlIHtcblx0XHRyZXR1cm4gYW5ub3RhdGlvbkNvbHVtbnMuc29tZSgoYW5ub3RhdGlvbkNvbHVtbikgPT4gYW5ub3RhdGlvbkNvbHVtbi5rZXkgPT09IGtleSk7XG5cdH1cblxuXHRmdW5jdGlvbiBpc1Nsb3RDb2x1bW4obWFuaWZlc3RDb2x1bW46IEN1c3RvbURlZmluZWRUYWJsZUNvbHVtbik6IG1hbmlmZXN0Q29sdW1uIGlzIEZyYWdtZW50RGVmaW5lZFNsb3RDb2x1bW4ge1xuXHRcdHJldHVybiBtYW5pZmVzdENvbHVtbi50eXBlID09PSBDb2x1bW5UeXBlLlNsb3Q7XG5cdH1cblxuXHRmdW5jdGlvbiBpc0N1c3RvbUNvbHVtbihtYW5pZmVzdENvbHVtbjogQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uKTogbWFuaWZlc3RDb2x1bW4gaXMgTWFuaWZlc3REZWZpbmVkQ3VzdG9tQ29sdW1uIHtcblx0XHRyZXR1cm4gbWFuaWZlc3RDb2x1bW4udHlwZSA9PT0gdW5kZWZpbmVkICYmICEhbWFuaWZlc3RDb2x1bW4udGVtcGxhdGU7XG5cdH1cblxuXHRmdW5jdGlvbiBfdXBkYXRlTGlua2VkUHJvcGVydGllc09uQ3VzdG9tQ29sdW1ucyhwcm9wZXJ0eUluZm9zOiBzdHJpbmdbXSwgYW5ub3RhdGlvblRhYmxlQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10pIHtcblx0XHRjb25zdCBub25Tb3J0YWJsZUNvbHVtbnM6IHN0cmluZ1tdID0gZ2V0Tm9uU29ydGFibGVQcm9wZXJ0aWVzUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpO1xuXHRcdHByb3BlcnR5SW5mb3MuZm9yRWFjaCgocHJvcGVydHkpID0+IHtcblx0XHRcdGFubm90YXRpb25UYWJsZUNvbHVtbnMuZm9yRWFjaCgocHJvcCkgPT4ge1xuXHRcdFx0XHRpZiAocHJvcC5uYW1lID09PSBwcm9wZXJ0eSkge1xuXHRcdFx0XHRcdHByb3Auc29ydGFibGUgPSBub25Tb3J0YWJsZUNvbHVtbnMuaW5kZXhPZihwcm9wZXJ0eS5yZXBsYWNlKFwiUHJvcGVydHk6OlwiLCBcIlwiKSkgPT09IC0xO1xuXHRcdFx0XHRcdHByb3AuaXNHcm91cGFibGUgPSBwcm9wLnNvcnRhYmxlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdGZvciAoY29uc3Qga2V5IGluIGNvbHVtbnMpIHtcblx0XHRjb25zdCBtYW5pZmVzdENvbHVtbiA9IGNvbHVtbnNba2V5XTtcblx0XHRLZXlIZWxwZXIudmFsaWRhdGVLZXkoa2V5KTtcblxuXHRcdC8vIEJhc2VUYWJsZUNvbHVtblxuXHRcdGNvbnN0IGJhc2VUYWJsZUNvbHVtbiA9IHtcblx0XHRcdGtleToga2V5LFxuXHRcdFx0d2lkdGg6IG1hbmlmZXN0Q29sdW1uLndpZHRoIHx8IHVuZGVmaW5lZCxcblx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdGFuY2hvcjogbWFuaWZlc3RDb2x1bW4ucG9zaXRpb24/LmFuY2hvcixcblx0XHRcdFx0cGxhY2VtZW50OiBtYW5pZmVzdENvbHVtbi5wb3NpdGlvbiA9PT0gdW5kZWZpbmVkID8gUGxhY2VtZW50LkFmdGVyIDogbWFuaWZlc3RDb2x1bW4ucG9zaXRpb24ucGxhY2VtZW50XG5cdFx0XHR9LFxuXHRcdFx0Y2FzZVNlbnNpdGl2ZTogaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlKGNvbnZlcnRlckNvbnRleHQpXG5cdFx0fTtcblxuXHRcdGlmIChpc0Fubm90YXRpb25Db2x1bW4obWFuaWZlc3RDb2x1bW4sIGtleSkpIHtcblx0XHRcdGNvbnN0IHByb3BlcnRpZXNUb092ZXJ3cml0ZUFubm90YXRpb25Db2x1bW46IEN1c3RvbUVsZW1lbnQ8QW5ub3RhdGlvblRhYmxlQ29sdW1uRm9yT3ZlcnJpZGU+ID0ge1xuXHRcdFx0XHQuLi5iYXNlVGFibGVDb2x1bW4sXG5cdFx0XHRcdGltcG9ydGFuY2U6IG1hbmlmZXN0Q29sdW1uPy5pbXBvcnRhbmNlLFxuXHRcdFx0XHRob3Jpem9udGFsQWxpZ246IG1hbmlmZXN0Q29sdW1uPy5ob3Jpem9udGFsQWxpZ24sXG5cdFx0XHRcdGF2YWlsYWJpbGl0eTogbWFuaWZlc3RDb2x1bW4/LmF2YWlsYWJpbGl0eSxcblx0XHRcdFx0dHlwZTogQ29sdW1uVHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0XHRpc05hdmlnYWJsZTogaXNBbm5vdGF0aW9uQ29sdW1uKG1hbmlmZXN0Q29sdW1uLCBrZXkpXG5cdFx0XHRcdFx0PyB1bmRlZmluZWRcblx0XHRcdFx0XHQ6IGlzQWN0aW9uTmF2aWdhYmxlKG1hbmlmZXN0Q29sdW1uLCBuYXZpZ2F0aW9uU2V0dGluZ3MsIHRydWUpLFxuXHRcdFx0XHRzZXR0aW5nczogbWFuaWZlc3RDb2x1bW4uc2V0dGluZ3MsXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IF9nZXREZWZhdWx0Rm9ybWF0T3B0aW9uc0ZvclRhYmxlKG1hbmlmZXN0Q29sdW1uLmZvcm1hdE9wdGlvbnMpXG5cdFx0XHR9O1xuXHRcdFx0aW50ZXJuYWxDb2x1bW5zW2tleV0gPSBwcm9wZXJ0aWVzVG9PdmVyd3JpdGVBbm5vdGF0aW9uQ29sdW1uO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eUluZm9zOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCA9IF9nZXRQcm9wZXJ0eU5hbWVzKFxuXHRcdFx0XHRtYW5pZmVzdENvbHVtbi5wcm9wZXJ0aWVzLFxuXHRcdFx0XHRhbm5vdGF0aW9uQ29sdW1ucyxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0ZW50aXR5VHlwZVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IGJhc2VNYW5pZmVzdENvbHVtbiA9IHtcblx0XHRcdFx0Li4uYmFzZVRhYmxlQ29sdW1uLFxuXHRcdFx0XHRoZWFkZXI6IG1hbmlmZXN0Q29sdW1uLmhlYWRlcixcblx0XHRcdFx0aW1wb3J0YW5jZTogbWFuaWZlc3RDb2x1bW4/LmltcG9ydGFuY2UgfHwgSW1wb3J0YW5jZS5Ob25lLFxuXHRcdFx0XHRob3Jpem9udGFsQWxpZ246IG1hbmlmZXN0Q29sdW1uPy5ob3Jpem9udGFsQWxpZ24gfHwgSG9yaXpvbnRhbEFsaWduLkJlZ2luLFxuXHRcdFx0XHRhdmFpbGFiaWxpdHk6IG1hbmlmZXN0Q29sdW1uPy5hdmFpbGFiaWxpdHkgfHwgXCJEZWZhdWx0XCIsXG5cdFx0XHRcdHRlbXBsYXRlOiBtYW5pZmVzdENvbHVtbi50ZW1wbGF0ZSxcblx0XHRcdFx0cHJvcGVydHlJbmZvczogcHJvcGVydHlJbmZvcyxcblx0XHRcdFx0ZXhwb3J0U2V0dGluZ3M6IHByb3BlcnR5SW5mb3Ncblx0XHRcdFx0XHQ/IHtcblx0XHRcdFx0XHRcdFx0dGVtcGxhdGU6IF9hcHBlbmRDdXN0b21UZW1wbGF0ZShwcm9wZXJ0eUluZm9zKSxcblx0XHRcdFx0XHRcdFx0d3JhcDogISEocHJvcGVydHlJbmZvcy5sZW5ndGggPiAxKVxuXHRcdFx0XHRcdCAgfVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdFx0aWQ6IGBDdXN0b21Db2x1bW46OiR7a2V5fWAsXG5cdFx0XHRcdG5hbWU6IGBDdXN0b21Db2x1bW46OiR7a2V5fWAsXG5cdFx0XHRcdC8vTmVlZGVkIGZvciBNREM6XG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IHsgdGV4dExpbmVzRWRpdDogNCB9LFxuXHRcdFx0XHRpc0dyb3VwYWJsZTogZmFsc2UsXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiBmYWxzZSxcblx0XHRcdFx0c29ydGFibGU6IGZhbHNlLFxuXHRcdFx0XHR2aXN1YWxTZXR0aW5nczogeyB3aWR0aENhbGN1bGF0aW9uOiBudWxsIH0sXG5cdFx0XHRcdHByb3BlcnRpZXM6IG1hbmlmZXN0Q29sdW1uLnByb3BlcnRpZXMsXG5cdFx0XHRcdHRvb2x0aXA6IG1hbmlmZXN0Q29sdW1uLmhlYWRlclxuXHRcdFx0fTtcblx0XHRcdGlmIChtYW5pZmVzdENvbHVtbi5oZWFkZXI/LnN0YXJ0c1dpdGgoXCJ7bWV0YU1vZGVsPlwiKSkge1xuXHRcdFx0XHRjb25zdCBtZXRhTW9kZWxQYXRoID0gbWFuaWZlc3RDb2x1bW4uaGVhZGVyPy5zdWJzdHJpbmcoMTEsIG1hbmlmZXN0Q29sdW1uLmhlYWRlcj8ubGVuZ3RoIC0gMSk7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0YmFzZU1hbmlmZXN0Q29sdW1uLmhlYWRlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24obWV0YU1vZGVsUGF0aCkuYW5ub3RhdGlvbi50b1N0cmluZygpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0TG9nLmluZm8oYFVuYWJsZSB0byByZXRyaWV2ZSB0ZXh0IGZyb20gbWV0YSBtb2RlbCB1c2luZyBwYXRoICR7bWV0YU1vZGVsUGF0aH1gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKHByb3BlcnR5SW5mb3MpIHtcblx0XHRcdFx0X3VwZGF0ZUxpbmtlZFByb3BlcnRpZXNPbkN1c3RvbUNvbHVtbnMocHJvcGVydHlJbmZvcywgYW5ub3RhdGlvbkNvbHVtbnMpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGlzU2xvdENvbHVtbihtYW5pZmVzdENvbHVtbikpIHtcblx0XHRcdFx0Y29uc3QgY3VzdG9tVGFibGVDb2x1bW46IEN1c3RvbUVsZW1lbnQ8Q3VzdG9tQmFzZWRUYWJsZUNvbHVtbj4gPSB7XG5cdFx0XHRcdFx0Li4uYmFzZU1hbmlmZXN0Q29sdW1uLFxuXHRcdFx0XHRcdHR5cGU6IENvbHVtblR5cGUuU2xvdFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRpbnRlcm5hbENvbHVtbnNba2V5XSA9IGN1c3RvbVRhYmxlQ29sdW1uO1xuXHRcdFx0fSBlbHNlIGlmIChpc0N1c3RvbUNvbHVtbihtYW5pZmVzdENvbHVtbikpIHtcblx0XHRcdFx0Y29uc3QgY3VzdG9tVGFibGVDb2x1bW46IEN1c3RvbUVsZW1lbnQ8Q3VzdG9tQmFzZWRUYWJsZUNvbHVtbj4gPSB7XG5cdFx0XHRcdFx0Li4uYmFzZU1hbmlmZXN0Q29sdW1uLFxuXHRcdFx0XHRcdHR5cGU6IENvbHVtblR5cGUuRGVmYXVsdFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRpbnRlcm5hbENvbHVtbnNba2V5XSA9IGN1c3RvbVRhYmxlQ29sdW1uO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgbWVzc2FnZSA9IGBUaGUgYW5ub3RhdGlvbiBjb2x1bW4gJyR7a2V5fScgcmVmZXJlbmNlZCBpbiB0aGUgbWFuaWZlc3QgaXMgbm90IGZvdW5kYDtcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0XHRcdC5nZXREaWFnbm9zdGljcygpXG5cdFx0XHRcdFx0LmFkZElzc3VlKFxuXHRcdFx0XHRcdFx0SXNzdWVDYXRlZ29yeS5NYW5pZmVzdCxcblx0XHRcdFx0XHRcdElzc3VlU2V2ZXJpdHkuTG93LFxuXHRcdFx0XHRcdFx0bWVzc2FnZSxcblx0XHRcdFx0XHRcdElzc3VlQ2F0ZWdvcnlUeXBlLFxuXHRcdFx0XHRcdFx0SXNzdWVDYXRlZ29yeVR5cGU/LkFubm90YXRpb25Db2x1bW5zPy5JbnZhbGlkS2V5XG5cdFx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIGludGVybmFsQ29sdW1ucztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMTNuTW9kZShcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb25cbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlcjogTWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzOiBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudFR5cGUgPSBtYW5pZmVzdFdyYXBwZXIuZ2V0VmFyaWFudE1hbmFnZW1lbnQoKTtcblx0Y29uc3QgYVBlcnNvbmFsaXphdGlvbjogc3RyaW5nW10gPSBbXTtcblx0Y29uc3QgaXNBbmFseXRpY2FsVGFibGUgPSB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlID09PSBcIkFuYWx5dGljYWxUYWJsZVwiO1xuXHRjb25zdCBpc1Jlc3BvbnNpdmVUYWJsZSA9IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLnR5cGUgPT09IFwiUmVzcG9uc2l2ZVRhYmxlXCI7XG5cdGlmICh0YWJsZU1hbmlmZXN0U2V0dGluZ3M/LnRhYmxlU2V0dGluZ3M/LnBlcnNvbmFsaXphdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gUGVyc29uYWxpemF0aW9uIGNvbmZpZ3VyZWQgaW4gbWFuaWZlc3QuXG5cdFx0Y29uc3QgcGVyc29uYWxpemF0aW9uID0gdGFibGVNYW5pZmVzdFNldHRpbmdzLnRhYmxlU2V0dGluZ3MucGVyc29uYWxpemF0aW9uO1xuXHRcdGlmIChwZXJzb25hbGl6YXRpb24gPT09IHRydWUpIHtcblx0XHRcdC8vIFRhYmxlIHBlcnNvbmFsaXphdGlvbiBmdWxseSBlbmFibGVkLlxuXHRcdFx0c3dpdGNoICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJBbmFseXRpY2FsVGFibGVcIjpcblx0XHRcdFx0XHRyZXR1cm4gXCJTb3J0LENvbHVtbixGaWx0ZXIsR3JvdXAsQWdncmVnYXRlXCI7XG5cdFx0XHRcdGNhc2UgXCJSZXNwb25zaXZlVGFibGVcIjpcblx0XHRcdFx0XHRyZXR1cm4gXCJTb3J0LENvbHVtbixGaWx0ZXIsR3JvdXBcIjtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gXCJTb3J0LENvbHVtbixGaWx0ZXJcIjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBwZXJzb25hbGl6YXRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdC8vIFNwZWNpZmljIHBlcnNvbmFsaXphdGlvbiBvcHRpb25zIGVuYWJsZWQgaW4gbWFuaWZlc3QuIFVzZSB0aGVtIGFzIGlzLlxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5zb3J0KSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIlNvcnRcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmNvbHVtbikge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJDb2x1bW5cIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmZpbHRlcikge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJGaWx0ZXJcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmdyb3VwICYmIChpc0FuYWx5dGljYWxUYWJsZSB8fCBpc1Jlc3BvbnNpdmVUYWJsZSkpIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiR3JvdXBcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmFnZ3JlZ2F0ZSAmJiBpc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJBZ2dyZWdhdGVcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYVBlcnNvbmFsaXphdGlvbi5sZW5ndGggPiAwID8gYVBlcnNvbmFsaXphdGlvbi5qb2luKFwiLFwiKSA6IHVuZGVmaW5lZDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gTm8gcGVyc29uYWxpemF0aW9uIGNvbmZpZ3VyZWQgaW4gbWFuaWZlc3QuXG5cdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiU29ydFwiKTtcblx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJDb2x1bW5cIik7XG5cdFx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0KSB7XG5cdFx0XHRpZiAodmFyaWFudE1hbmFnZW1lbnQgPT09IFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sIHx8IF9pc0ZpbHRlckJhckhpZGRlbihtYW5pZmVzdFdyYXBwZXIsIGNvbnZlcnRlckNvbnRleHQpKSB7XG5cdFx0XHRcdC8vIEZlYXR1cmUgcGFyaXR5IHdpdGggVjIuXG5cdFx0XHRcdC8vIEVuYWJsZSB0YWJsZSBmaWx0ZXJpbmcgYnkgZGVmYXVsdCBvbmx5IGluIGNhc2Ugb2YgQ29udHJvbCBsZXZlbCB2YXJpYW50IG1hbmFnZW1lbnQuXG5cdFx0XHRcdC8vIE9yIHdoZW4gdGhlIExSIGZpbHRlciBiYXIgaXMgaGlkZGVuIHZpYSBtYW5pZmVzdCBzZXR0aW5nXG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkZpbHRlclwiKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiRmlsdGVyXCIpO1xuXHRcdH1cblxuXHRcdGlmIChpc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiR3JvdXBcIik7XG5cdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJBZ2dyZWdhdGVcIik7XG5cdFx0fVxuXHRcdGlmIChpc1Jlc3BvbnNpdmVUYWJsZSkge1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiR3JvdXBcIik7XG5cdFx0fVxuXHRcdHJldHVybiBhUGVyc29uYWxpemF0aW9uLmpvaW4oXCIsXCIpO1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIEJvb2xlYW4gdmFsdWUgc3VnZ2VzdGluZyBpZiBhIGZpbHRlciBiYXIgaXMgYmVpbmcgdXNlZCBvbiB0aGUgcGFnZS5cbiAqXG4gKiBDaGFydCBoYXMgYSBkZXBlbmRlbmN5IHRvIGZpbHRlciBiYXIgKGlzc3VlIHdpdGggbG9hZGluZyBkYXRhKS4gT25jZSByZXNvbHZlZCwgdGhlIGNoZWNrIGZvciBjaGFydCBzaG91bGQgYmUgcmVtb3ZlZCBoZXJlLlxuICogVW50aWwgdGhlbiwgaGlkaW5nIGZpbHRlciBiYXIgaXMgbm93IGFsbG93ZWQgaWYgYSBjaGFydCBpcyBiZWluZyB1c2VkIG9uIExSLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdFdyYXBwZXIgTWFuaWZlc3Qgc2V0dGluZ3MgZ2V0dGVyIGZvciB0aGUgcGFnZVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgQm9vbGVhbiBzdWdnZXN0aW5nIGlmIGEgZmlsdGVyIGJhciBpcyBiZWluZyB1c2VkIG9uIHRoZSBwYWdlLlxuICovXG5mdW5jdGlvbiBfaXNGaWx0ZXJCYXJIaWRkZW4obWFuaWZlc3RXcmFwcGVyOiBNYW5pZmVzdFdyYXBwZXIsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRtYW5pZmVzdFdyYXBwZXIuaXNGaWx0ZXJCYXJIaWRkZW4oKSAmJlxuXHRcdCFjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSAmJlxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZyB0aGUgc29ydCBjb25kaXRpb25zIGZvciB0aGUgcHJlc2VudGF0aW9uIHZhcmlhbnQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uIFByZXNlbnRhdGlvbiB2YXJpYW50IGFubm90YXRpb25cbiAqIEBwYXJhbSBjb2x1bW5zIFRhYmxlIGNvbHVtbnMgcHJvY2Vzc2VkIGJ5IHRoZSBjb252ZXJ0ZXJcbiAqIEByZXR1cm5zIFNvcnQgY29uZGl0aW9ucyBmb3IgYSBwcmVzZW50YXRpb24gdmFyaWFudC5cbiAqL1xuZnVuY3Rpb24gZ2V0U29ydENvbmRpdGlvbnMoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZCxcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0Ly8gQ3VycmVudGx5IG5hdmlnYXRpb24gcHJvcGVydHkgaXMgbm90IHN1cHBvcnRlZCBhcyBzb3J0ZXJcblx0Y29uc3Qgbm9uU29ydGFibGVQcm9wZXJ0aWVzID0gZ2V0Tm9uU29ydGFibGVQcm9wZXJ0aWVzUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpO1xuXHRsZXQgc29ydENvbmRpdGlvbnM6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5Tb3J0T3JkZXIpIHtcblx0XHRjb25zdCBzb3J0ZXJzOiBTb3J0ZXJUeXBlW10gPSBbXTtcblx0XHRjb25zdCBjb25kaXRpb25zID0ge1xuXHRcdFx0c29ydGVyczogc29ydGVyc1xuXHRcdH07XG5cdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uU29ydE9yZGVyLmZvckVhY2goKGNvbmRpdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgY29uZGl0aW9uUHJvcGVydHkgPSBjb25kaXRpb24uUHJvcGVydHk7XG5cdFx0XHRpZiAoY29uZGl0aW9uUHJvcGVydHkgJiYgbm9uU29ydGFibGVQcm9wZXJ0aWVzLmluZGV4T2YoY29uZGl0aW9uUHJvcGVydHkuJHRhcmdldD8ubmFtZSkgPT09IC0xKSB7XG5cdFx0XHRcdGNvbnN0IGluZm9OYW1lID0gY29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyhbY29uZGl0aW9uUHJvcGVydHldLCBjb2x1bW5zKVswXTtcblx0XHRcdFx0aWYgKGluZm9OYW1lKSB7XG5cdFx0XHRcdFx0Y29uZGl0aW9ucy5zb3J0ZXJzLnB1c2goe1xuXHRcdFx0XHRcdFx0bmFtZTogaW5mb05hbWUsXG5cdFx0XHRcdFx0XHRkZXNjZW5kaW5nOiAhIWNvbmRpdGlvbi5EZXNjZW5kaW5nXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRzb3J0Q29uZGl0aW9ucyA9IGNvbmRpdGlvbnMuc29ydGVycy5sZW5ndGggPyBKU09OLnN0cmluZ2lmeShjb25kaXRpb25zKSA6IHVuZGVmaW5lZDtcblx0fVxuXHRyZXR1cm4gc29ydENvbmRpdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGdldEluaXRpYWxFeHBhbnNpb25MZXZlbChwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbjogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUgfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuXHRpZiAoIXByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGNvbnN0IGxldmVsID0gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uSW5pdGlhbEV4cGFuc2lvbkxldmVsPy52YWx1ZU9mKCk7XG5cblx0cmV0dXJuIHR5cGVvZiBsZXZlbCA9PT0gXCJudW1iZXJcIiA/IGxldmVsIDogdW5kZWZpbmVkO1xufVxuLyoqXG4gKiBDb252ZXJ0cyBhbiBhcnJheSBvZiBwcm9wZXJ0eVBhdGggdG8gYW4gYXJyYXkgb2YgcHJvcGVydHlJbmZvIG5hbWVzLlxuICpcbiAqIEBwYXJhbSBwYXRocyB0aGUgYXJyYXkgdG8gYmUgY29udmVydGVkXG4gKiBAcGFyYW0gY29sdW1ucyB0aGUgYXJyYXkgb2YgcHJvcGVydHlJbmZvc1xuICogQHJldHVybnMgYW4gYXJyYXkgb2YgcHJvcGVydHlJbmZvIG5hbWVzXG4gKi9cblxuZnVuY3Rpb24gY29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyhwYXRoczogUHJvcGVydHlQYXRoW10sIGNvbHVtbnM6IFRhYmxlQ29sdW1uW10pOiBzdHJpbmdbXSB7XG5cdGNvbnN0IGluZm9OYW1lczogc3RyaW5nW10gPSBbXTtcblx0bGV0IHByb3BlcnR5SW5mbzogVGFibGVDb2x1bW4gfCB1bmRlZmluZWQsIGFubm90YXRpb25Db2x1bW46IEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0cGF0aHMuZm9yRWFjaCgoY3VycmVudFBhdGgpID0+IHtcblx0XHRpZiAoY3VycmVudFBhdGg/LnZhbHVlKSB7XG5cdFx0XHRwcm9wZXJ0eUluZm8gPSBjb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4ge1xuXHRcdFx0XHRhbm5vdGF0aW9uQ29sdW1uID0gY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRcdFx0cmV0dXJuICFhbm5vdGF0aW9uQ29sdW1uLnByb3BlcnR5SW5mb3MgJiYgYW5ub3RhdGlvbkNvbHVtbi5yZWxhdGl2ZVBhdGggPT09IGN1cnJlbnRQYXRoPy52YWx1ZTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKHByb3BlcnR5SW5mbykge1xuXHRcdFx0XHRpbmZvTmFtZXMucHVzaChwcm9wZXJ0eUluZm8ubmFtZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gaW5mb05hbWVzO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nIFByZXNlbnRhdGlvbiBWYXJpYW50IGdyb3VwIGNvbmRpdGlvbnMuXG4gKlxuICogQHBhcmFtIHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uIFByZXNlbnRhdGlvbiB2YXJpYW50IGFubm90YXRpb25cbiAqIEBwYXJhbSBjb2x1bW5zIENvbnZlcnRlciBwcm9jZXNzZWQgdGFibGUgY29sdW1uc1xuICogQHBhcmFtIHRhYmxlVHlwZSBUaGUgdGFibGUgdHlwZS5cbiAqIEByZXR1cm5zIEdyb3VwIGNvbmRpdGlvbnMgZm9yIGEgUHJlc2VudGF0aW9uIHZhcmlhbnQuXG4gKi9cbmZ1bmN0aW9uIGdldEdyb3VwQ29uZGl0aW9ucyhcblx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb246IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlIHwgdW5kZWZpbmVkLFxuXHRjb2x1bW5zOiBUYWJsZUNvbHVtbltdLFxuXHR0YWJsZVR5cGU6IHN0cmluZ1xuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IGdyb3VwQ29uZGl0aW9uczogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRpZiAocHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24/Lkdyb3VwQnkpIHtcblx0XHRsZXQgYUdyb3VwQnkgPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5Hcm91cEJ5O1xuXHRcdGlmICh0YWJsZVR5cGUgPT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIpIHtcblx0XHRcdGFHcm91cEJ5ID0gYUdyb3VwQnkuc2xpY2UoMCwgMSk7XG5cdFx0fVxuXHRcdGNvbnN0IGFHcm91cExldmVscyA9IGNvbnZlcnRQcm9wZXJ0eVBhdGhzVG9JbmZvTmFtZXMoYUdyb3VwQnksIGNvbHVtbnMpLm1hcCgoaW5mb05hbWUpID0+IHtcblx0XHRcdHJldHVybiB7IG5hbWU6IGluZm9OYW1lIH07XG5cdFx0fSk7XG5cblx0XHRncm91cENvbmRpdGlvbnMgPSBhR3JvdXBMZXZlbHMubGVuZ3RoID8gSlNPTi5zdHJpbmdpZnkoeyBncm91cExldmVsczogYUdyb3VwTGV2ZWxzIH0pIDogdW5kZWZpbmVkO1xuXHR9XG5cdHJldHVybiBncm91cENvbmRpdGlvbnM7XG59XG4vKipcbiAqIFVwZGF0ZXMgdGhlIGNvbHVtbidzIHByb3BlcnR5SW5mb3Mgb2YgYSBhbmFseXRpY2FsIHRhYmxlIGludGVncmF0aW5nIGFsbCBleHRlbnNpb25zIGFuZCBiaW5kaW5nLXJlbGV2YW50IHByb3BlcnR5IGluZm8gcGFydC5cbiAqXG4gKiBAcGFyYW0gdGFibGVWaXN1YWxpemF0aW9uIFRoZSB2aXN1YWxpemF0aW9uIHRvIGJlIHVwZGF0ZWRcbiAqL1xuXG5mdW5jdGlvbiBfdXBkYXRlUHJvcGVydHlJbmZvc1dpdGhBZ2dyZWdhdGVzRGVmaW5pdGlvbnModGFibGVWaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb24pIHtcblx0Y29uc3QgcmVsYXRlZEFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblx0dGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0Y29sdW1uID0gY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRjb25zdCBhZ2dyZWdhdGFibGVQcm9wZXJ0eU5hbWUgPSBPYmplY3Qua2V5cyh0YWJsZVZpc3VhbGl6YXRpb24uYWdncmVnYXRlcyEpLmZpbmQoKGFnZ3JlZ2F0ZSkgPT4gYWdncmVnYXRlID09PSBjb2x1bW4ubmFtZSk7XG5cdFx0aWYgKGFnZ3JlZ2F0YWJsZVByb3BlcnR5TmFtZSkge1xuXHRcdFx0Y29uc3QgYWdncmVnYXRhYmxlUHJvcGVydHlEZWZpbml0aW9uID0gdGFibGVWaXN1YWxpemF0aW9uLmFnZ3JlZ2F0ZXMhW2FnZ3JlZ2F0YWJsZVByb3BlcnR5TmFtZV07XG5cdFx0XHRjb2x1bW4uYWdncmVnYXRhYmxlID0gdHJ1ZTtcblx0XHRcdGNvbHVtbi5leHRlbnNpb24gPSB7XG5cdFx0XHRcdGN1c3RvbUFnZ3JlZ2F0ZTogYWdncmVnYXRhYmxlUHJvcGVydHlEZWZpbml0aW9uLmRlZmF1bHRBZ2dyZWdhdGUgPz8ge31cblx0XHRcdH07XG5cdFx0fVxuXHRcdGlmIChjb2x1bW4uYWRkaXRpb25hbFByb3BlcnR5SW5mb3M/Lmxlbmd0aCkge1xuXHRcdFx0Y29sdW1uLmFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zLmZvckVhY2goKGFkZGl0aW9uYWxQcm9wZXJ0eUluZm8pID0+IHtcblx0XHRcdFx0Ly8gQ3JlYXRlIHByb3BlcnR5SW5mbyBmb3IgZWFjaCBhZGRpdGlvbmFsIHByb3BlcnR5LlxuXHRcdFx0XHQvLyBUaGUgbmV3IHByb3BlcnR5ICduYW1lJyBoYXMgYmVlbiBwcmVmaXhlZCB3aXRoICdQcm9wZXJ0eV9UZWNobmljYWw6OicgZm9yIHVuaXF1ZW5lc3MgYW5kIGl0IGhhcyBiZWVuIG5hbWVkIHRlY2huaWNhbCBwcm9wZXJ0eSBhcyBpdCByZXF1aXJlcyBkZWRpY2F0ZWQgTURDIGF0dHJpYnV0ZXMgKHRlY2huaWNhbGx5R3JvdXBhYmxlIGFuZCB0ZWNobmljYWxseUFnZ3JlZ2F0YWJsZSkuXG5cdFx0XHRcdGNyZWF0ZVRlY2huaWNhbFByb3BlcnR5KGFkZGl0aW9uYWxQcm9wZXJ0eUluZm8sIHRhYmxlVmlzdWFsaXphdGlvbi5jb2x1bW5zLCByZWxhdGVkQWRkaXRpb25hbFByb3BlcnR5TmFtZU1hcCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXHR0YWJsZVZpc3VhbGl6YXRpb24uY29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcblx0XHRjb2x1bW4gPSBjb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdGlmIChjb2x1bW4uYWRkaXRpb25hbFByb3BlcnR5SW5mb3MpIHtcblx0XHRcdGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcyA9IGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcy5tYXAoXG5cdFx0XHRcdChwcm9wZXJ0eUluZm8pID0+IHJlbGF0ZWRBZGRpdGlvbmFsUHJvcGVydHlOYW1lTWFwW3Byb3BlcnR5SW5mb10gPz8gcHJvcGVydHlJbmZvXG5cdFx0XHQpO1xuXHRcdFx0Ly8gQWRkIGFkZGl0aW9uYWwgcHJvcGVydGllcyB0byB0aGUgY29tcGxleCBwcm9wZXJ0eSB1c2luZyB0aGUgaGlkZGVuIGFubm90YXRpb24uXG5cdFx0XHRjb2x1bW4ucHJvcGVydHlJbmZvcyA9IGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5jb25jYXQoY29sdW1uLmFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zKTtcblx0XHR9XG5cdH0pO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nIFByZXNlbnRhdGlvbiBWYXJpYW50IGFnZ3JlZ2F0ZSBjb25kaXRpb25zLlxuICpcbiAqIEBwYXJhbSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiBQcmVzZW50YXRpb24gdmFyaWFudCBhbm5vdGF0aW9uXG4gKiBAcGFyYW0gY29sdW1ucyBDb252ZXJ0ZXIgcHJvY2Vzc2VkIHRhYmxlIGNvbHVtbnNcbiAqIEByZXR1cm5zIEdyb3VwIGNvbmRpdGlvbnMgZm9yIGEgUHJlc2VudGF0aW9uIHZhcmlhbnQuXG4gKi9cbmZ1bmN0aW9uIGdldEFnZ3JlZ2F0ZUNvbmRpdGlvbnMoXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZCxcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IGFnZ3JlZ2F0ZUNvbmRpdGlvbnM6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5Ub3RhbCkge1xuXHRcdGNvbnN0IGFUb3RhbHMgPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5Ub3RhbDtcblx0XHRjb25zdCBhZ2dyZWdhdGVzOiBSZWNvcmQ8c3RyaW5nLCBvYmplY3Q+ID0ge307XG5cdFx0Y29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyhhVG90YWxzLCBjb2x1bW5zKS5mb3JFYWNoKChpbmZvTmFtZSkgPT4ge1xuXHRcdFx0YWdncmVnYXRlc1tpbmZvTmFtZV0gPSB7fTtcblx0XHR9KTtcblxuXHRcdGFnZ3JlZ2F0ZUNvbmRpdGlvbnMgPSBKU09OLnN0cmluZ2lmeShhZ2dyZWdhdGVzKTtcblx0fVxuXG5cdHJldHVybiBhZ2dyZWdhdGVDb25kaXRpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbihcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24sXG5cdGNvbHVtbnM6IFRhYmxlQ29sdW1uW10sXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPzogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUsXG5cdHZpZXdDb25maWd1cmF0aW9uPzogVmlld1BhdGhDb25maWd1cmF0aW9uLFxuXHRpc0luc2lnaHRzRW5hYmxlZD86IGJvb2xlYW5cbik6IFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24ge1xuXHQvLyBOZWVkIHRvIGdldCB0aGUgdGFyZ2V0XG5cdGNvbnN0IHsgbmF2aWdhdGlvblByb3BlcnR5UGF0aCB9ID0gc3BsaXRQYXRoKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0Y29uc3QgdHlwZU5hbWVQbHVyYWwgPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS50YXJnZXRFbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uSGVhZGVySW5mbz8uVHlwZU5hbWVQbHVyYWw7XG5cdGNvbnN0IHRpdGxlID0gdHlwZU5hbWVQbHVyYWwgJiYgY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHR5cGVOYW1lUGx1cmFsKSk7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldEVudGl0eVNldDtcblx0Y29uc3QgcGFnZU1hbmlmZXN0U2V0dGluZ3M6IE1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IGhhc0Fic29sdXRlUGF0aCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoID09PSAwLFxuXHRcdHAxM25Nb2RlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBnZXRQMTNuTW9kZSh2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCwgdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24pLFxuXHRcdGlkID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aCA/IGdldFRhYmxlSUQodmlzdWFsaXphdGlvblBhdGgpIDogZ2V0VGFibGVJRChjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKCksIFwiTGluZUl0ZW1cIik7XG5cdGNvbnN0IHRhcmdldENhcGFiaWxpdGllcyA9IGdldENhcGFiaWxpdHlSZXN0cmljdGlvbihjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgbmF2aWdhdGlvblRhcmdldFBhdGggPSBnZXROYXZpZ2F0aW9uVGFyZ2V0UGF0aChjb252ZXJ0ZXJDb250ZXh0LCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0Y29uc3QgbmF2aWdhdGlvblNldHRpbmdzID0gcGFnZU1hbmlmZXN0U2V0dGluZ3MuZ2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24obmF2aWdhdGlvblRhcmdldFBhdGgpO1xuXHRjb25zdCBjcmVhdGlvbkJlaGF2aW91ciA9IF9nZXRDcmVhdGlvbkJlaGF2aW91cihcblx0XHRsaW5lSXRlbUFubm90YXRpb24sXG5cdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRuYXZpZ2F0aW9uU2V0dGluZ3MsXG5cdFx0dmlzdWFsaXphdGlvblBhdGhcblx0KTtcblx0Y29uc3Qgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCA9IGdlbmVyYXRlU3RhbmRhcmRBY3Rpb25zQ29udGV4dChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGNyZWF0aW9uQmVoYXZpb3VyLm1vZGUgYXMgQ3JlYXRpb25Nb2RlLFxuXHRcdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRcdHZpZXdDb25maWd1cmF0aW9uLFxuXHRcdGlzSW5zaWdodHNFbmFibGVkXG5cdCk7XG5cblx0Y29uc3QgZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24gPSBnZXREZWxldGVWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpO1xuXHRjb25zdCBtYXNzRWRpdEJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uID0gZ2V0TWFzc0VkaXRWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpO1xuXHRjb25zdCBpc0luc2VydFVwZGF0ZVRlbXBsYXRlZCA9IGdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nKHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIGlzRHJhZnRPclN0aWNreVN1cHBvcnRlZChjb252ZXJ0ZXJDb250ZXh0KSk7XG5cblx0Y29uc3Qgc2VsZWN0aW9uTW9kZSA9IGdldFNlbGVjdGlvbk1vZGUoXG5cdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLFxuXHRcdHZpc3VhbGl6YXRpb25QYXRoLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0aGFzQWJzb2x1dGVQYXRoLFxuXHRcdHRhcmdldENhcGFiaWxpdGllcyxcblx0XHRkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbixcblx0XHRtYXNzRWRpdEJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uXG5cdCk7XG5cdGxldCB0aHJlc2hvbGQgPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID8gMTAgOiAzMDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5NYXhJdGVtcykge1xuXHRcdHRocmVzaG9sZCA9IHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLk1heEl0ZW1zLnZhbHVlT2YoKSBhcyBudW1iZXI7XG5cdH1cblxuXHRjb25zdCB2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnRUeXBlID0gcGFnZU1hbmlmZXN0U2V0dGluZ3MuZ2V0VmFyaWFudE1hbmFnZW1lbnQoKTtcblx0Y29uc3QgaXNTZWFyY2hhYmxlID0gaXNQYXRoU2VhcmNoYWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSk7XG5cdGNvbnN0IHN0YW5kYXJkQWN0aW9ucyA9IHtcblx0XHRjcmVhdGU6IGdldFN0YW5kYXJkQWN0aW9uQ3JlYXRlKGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpLFxuXHRcdGRlbGV0ZTogZ2V0U3RhbmRhcmRBY3Rpb25EZWxldGUoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCksXG5cdFx0cGFzdGU6IGdldFN0YW5kYXJkQWN0aW9uUGFzdGUoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgaXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQpLFxuXHRcdG1hc3NFZGl0OiBnZXRTdGFuZGFyZEFjdGlvbk1hc3NFZGl0KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpLFxuXHRcdGluc2lnaHRzOiBnZXRTdGFuZGFyZEFjdGlvbkluc2lnaHRzKGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQsIHZpc3VhbGl6YXRpb25QYXRoKSxcblx0XHRjcmVhdGlvblJvdzogZ2V0Q3JlYXRpb25Sb3coY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dClcblx0fTtcblxuXHRyZXR1cm4ge1xuXHRcdGlkOiBpZCxcblx0XHRlbnRpdHlOYW1lOiBlbnRpdHlTZXQgPyBlbnRpdHlTZXQubmFtZSA6IFwiXCIsXG5cdFx0Y29sbGVjdGlvbjogZ2V0VGFyZ2V0T2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSksXG5cdFx0bmF2aWdhdGlvblBhdGg6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsXG5cdFx0cm93OiBfZ2V0Um93Q29uZmlndXJhdGlvblByb3BlcnR5KFxuXHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLFxuXHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdG5hdmlnYXRpb25TZXR0aW5ncyxcblx0XHRcdG5hdmlnYXRpb25UYXJnZXRQYXRoLFxuXHRcdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24udHlwZVxuXHRcdCksXG5cdFx0cDEzbk1vZGU6IHAxM25Nb2RlLFxuXHRcdHN0YW5kYXJkQWN0aW9uczoge1xuXHRcdFx0YWN0aW9uczogc3RhbmRhcmRBY3Rpb25zLFxuXHRcdFx0aXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQ6IGlzSW5zZXJ0VXBkYXRlVGVtcGxhdGVkLFxuXHRcdFx0dXBkYXRhYmxlUHJvcGVydHlQYXRoOiBnZXRDdXJyZW50RW50aXR5U2V0VXBkYXRhYmxlUGF0aChjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdH0sXG5cdFx0ZGlzcGxheU1vZGU6IGlzSW5EaXNwbGF5TW9kZShjb252ZXJ0ZXJDb250ZXh0LCB2aWV3Q29uZmlndXJhdGlvbiksXG5cdFx0Y3JlYXRlOiBjcmVhdGlvbkJlaGF2aW91cixcblx0XHRzZWxlY3Rpb25Nb2RlOiBzZWxlY3Rpb25Nb2RlLFxuXHRcdGF1dG9CaW5kT25Jbml0OlxuXHRcdFx0X2lzRmlsdGVyQmFySGlkZGVuKHBhZ2VNYW5pZmVzdFNldHRpbmdzLCBjb252ZXJ0ZXJDb250ZXh0KSB8fFxuXHRcdFx0KGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0ICYmXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2UgJiZcblx0XHRcdFx0ISh2aWV3Q29uZmlndXJhdGlvbiAmJiBwYWdlTWFuaWZlc3RTZXR0aW5ncy5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKHZpZXdDb25maWd1cmF0aW9uKSkpLFxuXHRcdHZhcmlhbnRNYW5hZ2VtZW50OiB2YXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIgJiYgIXAxM25Nb2RlID8gVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmUgOiB2YXJpYW50TWFuYWdlbWVudCxcblx0XHR0aHJlc2hvbGQ6IHRocmVzaG9sZCxcblx0XHRzb3J0Q29uZGl0aW9uczogZ2V0U29ydENvbmRpdGlvbnMoY29udmVydGVyQ29udGV4dCwgcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sIGNvbHVtbnMpLFxuXHRcdHRpdGxlOiB0aXRsZSxcblx0XHRzZWFyY2hhYmxlOiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlICE9PSBcIkFuYWx5dGljYWxUYWJsZVwiICYmICEoaXNDb25zdGFudChpc1NlYXJjaGFibGUpICYmIGlzU2VhcmNoYWJsZS52YWx1ZSA9PT0gZmFsc2UpLFxuXHRcdGluaXRpYWxFeHBhbnNpb25MZXZlbDogZ2V0SW5pdGlhbEV4cGFuc2lvbkxldmVsKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uKVxuXHR9O1xufVxuXG5mdW5jdGlvbiBfZ2V0RXhwb3J0RGF0YVR5cGUoZGF0YVR5cGU6IHN0cmluZywgaXNDb21wbGV4UHJvcGVydHkgPSBmYWxzZSk6IHN0cmluZyB7XG5cdGxldCBleHBvcnREYXRhVHlwZSA9IFwiU3RyaW5nXCI7XG5cdGlmIChpc0NvbXBsZXhQcm9wZXJ0eSkge1xuXHRcdGlmIChkYXRhVHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikge1xuXHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIkRhdGVUaW1lXCI7XG5cdFx0fVxuXHRcdHJldHVybiBleHBvcnREYXRhVHlwZTtcblx0fSBlbHNlIHtcblx0XHRzd2l0Y2ggKGRhdGFUeXBlKSB7XG5cdFx0XHRjYXNlIFwiRWRtLkRlY2ltYWxcIjpcblx0XHRcdGNhc2UgXCJFZG0uSW50MzJcIjpcblx0XHRcdGNhc2UgXCJFZG0uSW50NjRcIjpcblx0XHRcdGNhc2UgXCJFZG0uRG91YmxlXCI6XG5cdFx0XHRjYXNlIFwiRWRtLkJ5dGVcIjpcblx0XHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIk51bWJlclwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFZG0uRGF0ZU9mVGltZVwiOlxuXHRcdFx0Y2FzZSBcIkVkbS5EYXRlXCI6XG5cdFx0XHRcdGV4cG9ydERhdGFUeXBlID0gXCJEYXRlXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVkbS5EYXRlVGltZU9mZnNldFwiOlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiRGF0ZVRpbWVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRWRtLlRpbWVPZkRheVwiOlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiVGltZVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFZG0uQm9vbGVhblwiOlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiQm9vbGVhblwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGV4cG9ydERhdGFUeXBlID0gXCJTdHJpbmdcIjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGV4cG9ydERhdGFUeXBlO1xufVxuXG4vKipcbiAqIFNwbGl0IHRoZSB2aXN1YWxpemF0aW9uIHBhdGggaW50byB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBwYXRoIGFuZCBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aFxuICogQHJldHVybnMgVGhlIHNwbGl0IHBhdGhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNwbGl0UGF0aCh2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nKSB7XG5cdGNvbnN0IFt0YXJnZXROYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBhbm5vdGF0aW9uUGF0aF0gPSB2aXN1YWxpemF0aW9uUGF0aC5zcGxpdChcIkBcIik7XG5cdGxldCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gdGFyZ2V0TmF2aWdhdGlvblByb3BlcnR5UGF0aDtcblx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGFzdEluZGV4T2YoXCIvXCIpID09PSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpIHtcblx0XHQvLyBEcm9wIHRyYWlsaW5nIHNsYXNoXG5cdFx0bmF2aWdhdGlvblByb3BlcnR5UGF0aCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGguc3Vic3RyKDAsIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoIC0gMSk7XG5cdH1cblx0cmV0dXJuIHsgbmF2aWdhdGlvblByb3BlcnR5UGF0aCwgYW5ub3RhdGlvblBhdGggfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uKFxuXHRzZWxlY3Rpb25WYXJpYW50UGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihzZWxlY3Rpb25WYXJpYW50UGF0aCk7XG5cdGNvbnN0IHNlbGVjdGlvbjogU2VsZWN0aW9uVmFyaWFudFR5cGUgPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uIGFzIFNlbGVjdGlvblZhcmlhbnRUeXBlO1xuXG5cdGlmIChzZWxlY3Rpb24pIHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdHNlbGVjdGlvbi5TZWxlY3RPcHRpb25zPy5mb3JFYWNoKChzZWxlY3RPcHRpb246IFNlbGVjdE9wdGlvblR5cGUpID0+IHtcblx0XHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWU7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGg6IHN0cmluZyA9IHByb3BlcnR5TmFtZT8udmFsdWUgPz8gXCJcIjtcblx0XHRcdGlmIChwcm9wZXJ0eU5hbWVzLmluZGV4T2YocHJvcGVydHlQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0cHJvcGVydHlOYW1lcy5wdXNoKHByb3BlcnR5UGF0aCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRleHQ6IHNlbGVjdGlvbj8uVGV4dD8udG9TdHJpbmcoKSxcblx0XHRcdHByb3BlcnR5TmFtZXM6IHByb3BlcnR5TmFtZXNcblx0XHR9O1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIF9nZXRGdWxsU2NyZWVuQmFzZWRPbkRldmljZShcblx0dGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0aXNJcGhvbmU6IGJvb2xlYW5cbik6IGJvb2xlYW4ge1xuXHQvLyBJZiBlbmFibGVGdWxsU2NyZWVuIGlzIG5vdCBzZXQsIHVzZSBhcyBkZWZhdWx0IHRydWUgb24gcGhvbmUgYW5kIGZhbHNlIG90aGVyd2lzZVxuXHRsZXQgZW5hYmxlRnVsbFNjcmVlbiA9IHRhYmxlU2V0dGluZ3MuZW5hYmxlRnVsbFNjcmVlbiA/PyBpc0lwaG9uZTtcblx0Ly8gTWFrZSBzdXJlIHRoYXQgZW5hYmxlRnVsbFNjcmVlbiBpcyBub3Qgc2V0IG9uIExpc3RSZXBvcnQgZm9yIGRlc2t0b3Agb3IgdGFibGV0XG5cdGlmICghaXNJcGhvbmUgJiYgZW5hYmxlRnVsbFNjcmVlbiAmJiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCkge1xuXHRcdGVuYWJsZUZ1bGxTY3JlZW4gPSBmYWxzZTtcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldERpYWdub3N0aWNzKCkuYWRkSXNzdWUoSXNzdWVDYXRlZ29yeS5NYW5pZmVzdCwgSXNzdWVTZXZlcml0eS5Mb3csIElzc3VlVHlwZS5GVUxMU0NSRUVOTU9ERV9OT1RfT05fTElTVFJFUE9SVCk7XG5cdH1cblx0cmV0dXJuIGVuYWJsZUZ1bGxTY3JlZW47XG59XG5cbmZ1bmN0aW9uIF9nZXRNdWx0aVNlbGVjdE1vZGUoXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdHRhYmxlVHlwZTogVGFibGVUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRsZXQgbXVsdGlTZWxlY3RNb2RlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGlmICh0YWJsZVR5cGUgIT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdHN3aXRjaCAoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSkge1xuXHRcdGNhc2UgVGVtcGxhdGVUeXBlLkxpc3RSZXBvcnQ6XG5cdFx0Y2FzZSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlOlxuXHRcdFx0bXVsdGlTZWxlY3RNb2RlID0gIXRhYmxlU2V0dGluZ3Muc2VsZWN0QWxsID8gXCJDbGVhckFsbFwiIDogXCJEZWZhdWx0XCI7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlOlxuXHRcdFx0bXVsdGlTZWxlY3RNb2RlID0gdGFibGVTZXR0aW5ncy5zZWxlY3RBbGwgPT09IGZhbHNlID8gXCJDbGVhckFsbFwiIDogXCJEZWZhdWx0XCI7XG5cdFx0XHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS51c2VJY29uVGFiQmFyKCkpIHtcblx0XHRcdFx0bXVsdGlTZWxlY3RNb2RlID0gIXRhYmxlU2V0dGluZ3Muc2VsZWN0QWxsID8gXCJDbGVhckFsbFwiIDogXCJEZWZhdWx0XCI7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHR9XG5cblx0cmV0dXJuIG11bHRpU2VsZWN0TW9kZTtcbn1cblxuZnVuY3Rpb24gX2dldFRhYmxlVHlwZShcblx0dGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0YWdncmVnYXRpb25IZWxwZXI6IEFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBUYWJsZVR5cGUge1xuXHRsZXQgdGFibGVUeXBlID0gdGFibGVTZXR0aW5ncz8udHlwZSB8fCBcIlJlc3BvbnNpdmVUYWJsZVwiO1xuXHQvKiAgTm93LCB3ZSBrZWVwIHRoZSBjb25maWd1cmF0aW9uIGluIHRoZSBtYW5pZmVzdCwgZXZlbiBpZiBpdCBsZWFkcyB0byBlcnJvcnMuXG5cdFx0V2Ugb25seSBjaGFuZ2UgaWYgd2UncmUgbm90IG9uIGRlc2t0b3AgZnJvbSBBbmFseXRpY2FsL1RyZWUgdG8gUmVzcG9uc2l2ZS5cblx0ICovXG5cdGlmICgodGFibGVUeXBlID09PSBcIkFuYWx5dGljYWxUYWJsZVwiIHx8IHRhYmxlVHlwZSA9PT0gXCJUcmVlVGFibGVcIikgJiYgIWNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaXNEZXNrdG9wKCkpIHtcblx0XHR0YWJsZVR5cGUgPSBcIlJlc3BvbnNpdmVUYWJsZVwiO1xuXHR9XG5cdHJldHVybiB0YWJsZVR5cGU7XG59XG5cbmZ1bmN0aW9uIF9nZXRUYWJsZU1vZGUoXG5cdHRhYmxlVHlwZTogVGFibGVUeXBlLFxuXHR0YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRpc1RlbXBsYXRlTGlzdFJlcG9ydDogYm9vbGVhblxuKTogeyByb3dDb3VudE1vZGU/OiBUYWJsZVJvd0NvdW50TW9kZTsgcm93Q291bnQ/OiBudW1iZXIgfSB7XG5cdGlmICh0YWJsZVR5cGUgIT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIpIHtcblx0XHRpZiAoaXNUZW1wbGF0ZUxpc3RSZXBvcnQpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHJvd0NvdW50TW9kZTogXCJBdXRvXCIsXG5cdFx0XHRcdHJvd0NvdW50OiAzXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyb3dDb3VudE1vZGU6IHRhYmxlU2V0dGluZ3Mucm93Q291bnRNb2RlID8/IFwiRml4ZWRcIixcblx0XHRcdFx0cm93Q291bnQ6IHRhYmxlU2V0dGluZ3Mucm93Q291bnQgPyB0YWJsZVNldHRpbmdzLnJvd0NvdW50IDogNVxuXHRcdFx0fTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9nZXRDb25kZW5zZWRUYWJsZUxheW91dChfdGFibGVUeXBlOiBUYWJsZVR5cGUsIF90YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uKTogYm9vbGVhbiB7XG5cdHJldHVybiBfdGFibGVTZXR0aW5ncy5jb25kZW5zZWRUYWJsZUxheW91dCAhPT0gdW5kZWZpbmVkICYmIF90YWJsZVR5cGUgIT09IFwiUmVzcG9uc2l2ZVRhYmxlXCJcblx0XHQ/IF90YWJsZVNldHRpbmdzLmNvbmRlbnNlZFRhYmxlTGF5b3V0XG5cdFx0OiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gX2dldFRhYmxlU2VsZWN0aW9uTGltaXQoX3RhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24pOiBudW1iZXIge1xuXHRyZXR1cm4gX3RhYmxlU2V0dGluZ3Muc2VsZWN0QWxsID09PSB0cnVlIHx8IF90YWJsZVNldHRpbmdzLnNlbGVjdGlvbkxpbWl0ID09PSAwID8gMCA6IF90YWJsZVNldHRpbmdzLnNlbGVjdGlvbkxpbWl0IHx8IDIwMDtcbn1cblxuZnVuY3Rpb24gX2dldFRhYmxlSW5saW5lQ3JlYXRpb25Sb3dDb3VudChfdGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbik6IG51bWJlciB7XG5cdHJldHVybiBfdGFibGVTZXR0aW5ncy5jcmVhdGlvbk1vZGU/LmlubGluZUNyZWF0aW9uUm93Q291bnQgPyBfdGFibGVTZXR0aW5ncy5jcmVhdGlvbk1vZGU/LmlubGluZUNyZWF0aW9uUm93Q291bnQgOiAyO1xufVxuXG5mdW5jdGlvbiBfZ2V0RmlsdGVycyhcblx0dGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0cXVpY2tGaWx0ZXJQYXRoczogeyBhbm5vdGF0aW9uUGF0aDogc3RyaW5nIH1bXSxcblx0cXVpY2tTZWxlY3Rpb25WYXJpYW50OiB1bmtub3duLFxuXHRwYXRoOiB7IGFubm90YXRpb25QYXRoOiBzdHJpbmcgfVxuKSB7XG5cdGlmIChxdWlja1NlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRxdWlja0ZpbHRlclBhdGhzLnB1c2goeyBhbm5vdGF0aW9uUGF0aDogcGF0aC5hbm5vdGF0aW9uUGF0aCB9KTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHF1aWNrRmlsdGVyczoge1xuXHRcdFx0c2hvd0NvdW50czogdGFibGVTZXR0aW5ncz8ucXVpY2tWYXJpYW50U2VsZWN0aW9uPy5zaG93Q291bnRzLFxuXHRcdFx0cGF0aHM6IHF1aWNrRmlsdGVyUGF0aHNcblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIF9nZXRFbmFibGVFeHBvcnQoXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGVuYWJsZVBhc3RlOiBib29sZWFuXG4pOiBib29sZWFuIHtcblx0cmV0dXJuIHRhYmxlU2V0dGluZ3MuZW5hYmxlRXhwb3J0ICE9PSB1bmRlZmluZWRcblx0XHQ/IHRhYmxlU2V0dGluZ3MuZW5hYmxlRXhwb3J0XG5cdFx0OiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpICE9PSBcIk9iamVjdFBhZ2VcIiB8fCBlbmFibGVQYXN0ZTtcbn1cblxuZnVuY3Rpb24gX2dldEZyb3plbkNvbHVtbkNvdW50KHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24pOiBudW1iZXIgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gdGFibGVTZXR0aW5ncy5mcm96ZW5Db2x1bW5Db3VudDtcbn1cblxuZnVuY3Rpb24gX2dldEZpbHRlckNvbmZpZ3VyYXRpb24oXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbikge1xuXHRpZiAoIWxpbmVJdGVtQW5ub3RhdGlvbikge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXHRjb25zdCBxdWlja0ZpbHRlclBhdGhzOiB7IGFubm90YXRpb25QYXRoOiBzdHJpbmcgfVtdID0gW107XG5cdGNvbnN0IHRhcmdldEVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKGxpbmVJdGVtQW5ub3RhdGlvbik7XG5cdGxldCBxdWlja1NlbGVjdGlvblZhcmlhbnQ7XG5cdGxldCBmaWx0ZXJzO1xuXHR0YWJsZVNldHRpbmdzPy5xdWlja1ZhcmlhbnRTZWxlY3Rpb24/LnBhdGhzPy5mb3JFYWNoKChwYXRoOiB7IGFubm90YXRpb25QYXRoOiBzdHJpbmcgfSkgPT4ge1xuXHRcdHF1aWNrU2VsZWN0aW9uVmFyaWFudCA9IHRhcmdldEVudGl0eVR5cGUucmVzb2x2ZVBhdGgocGF0aC5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0ZmlsdGVycyA9IF9nZXRGaWx0ZXJzKHRhYmxlU2V0dGluZ3MsIHF1aWNrRmlsdGVyUGF0aHMsIHF1aWNrU2VsZWN0aW9uVmFyaWFudCwgcGF0aCk7XG5cdH0pO1xuXG5cdGxldCBoaWRlVGFibGVUaXRsZSA9IGZhbHNlO1xuXHRoaWRlVGFibGVUaXRsZSA9ICEhdGFibGVTZXR0aW5ncy5xdWlja1ZhcmlhbnRTZWxlY3Rpb24/LmhpZGVUYWJsZVRpdGxlO1xuXHRyZXR1cm4ge1xuXHRcdGZpbHRlcnM6IGZpbHRlcnMsXG5cdFx0aGVhZGVyVmlzaWJsZTogIShxdWlja1NlbGVjdGlvblZhcmlhbnQgJiYgaGlkZVRhYmxlVGl0bGUpXG5cdH07XG59XG5cbmZ1bmN0aW9uIF9nZXRDb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHMocmVsYXRpdmVQYXRoOiBzdHJpbmcsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpIHtcblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXMgPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSwgcmVsYXRpdmVQYXRoKS5uYXZpZ2F0aW9uUHJvcGVydGllcztcblx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0aWVzPy5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3QgY29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZvckVhY2goKG5hdlByb3BlcnR5KSA9PiB7XG5cdFx0XHRjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHMucHVzaChnZXRMYWJlbChuYXZQcm9wZXJ0eSkgfHwgbmF2UHJvcGVydHkubmFtZSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGNvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVscztcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24oXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGNoZWNrQ29uZGVuc2VkTGF5b3V0ID0gZmFsc2Vcbik6IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24ge1xuXHRjb25zdCBfbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzOiBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IHRhYmxlU2V0dGluZ3MgPSAodGFibGVNYW5pZmVzdFNldHRpbmdzICYmIHRhYmxlTWFuaWZlc3RTZXR0aW5ncy50YWJsZVNldHRpbmdzKSB8fCB7fTtcblx0Y29uc3QgY3JlYXRpb25Nb2RlID0gdGFibGVTZXR0aW5ncy5jcmVhdGlvbk1vZGU/Lm5hbWUgfHwgQ3JlYXRpb25Nb2RlLk5ld1BhZ2U7XG5cdGNvbnN0IGVuYWJsZUF1dG9Db2x1bW5XaWR0aCA9ICFfbWFuaWZlc3RXcmFwcGVyLmlzUGhvbmUoKTtcblx0Y29uc3QgZW5hYmxlUGFzdGUgPVxuXHRcdHRhYmxlU2V0dGluZ3MuZW5hYmxlUGFzdGUgIT09IHVuZGVmaW5lZCA/IHRhYmxlU2V0dGluZ3MuZW5hYmxlUGFzdGUgOiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBcIk9iamVjdFBhZ2VcIjsgLy8gUGFzdGUgaXMgZGlzYWJsZWQgYnkgZGVmYXVsdCBleGNlcHRlZCBmb3IgT1Bcblx0Y29uc3QgdGVtcGxhdGVUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKTtcblx0Y29uc3QgZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyID0gdGVtcGxhdGVUeXBlID09PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCA/IFwiQVBJLmRhdGFTdGF0ZUluZGljYXRvckZpbHRlclwiIDogdW5kZWZpbmVkO1xuXHRjb25zdCBpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50ID0gY2hlY2tDb25kZW5zZWRMYXlvdXQgJiYgX21hbmlmZXN0V3JhcHBlci5pc0NvbmRlbnNlZExheW91dENvbXBsaWFudCgpO1xuXHRjb25zdCBvRmlsdGVyQ29uZmlndXJhdGlvbiA9IF9nZXRGaWx0ZXJDb25maWd1cmF0aW9uKHRhYmxlU2V0dGluZ3MsIGxpbmVJdGVtQW5ub3RhdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiA9IHRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5jdXN0b21WYWxpZGF0aW9uRnVuY3Rpb247XG5cdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0Y29uc3QgYWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IHRhYmxlVHlwZTogVGFibGVUeXBlID0gX2dldFRhYmxlVHlwZSh0YWJsZVNldHRpbmdzLCBhZ2dyZWdhdGlvbkhlbHBlciwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IHRhYmxlUm93TW9kZSA9IF9nZXRUYWJsZU1vZGUodGFibGVUeXBlLCB0YWJsZVNldHRpbmdzLCB0ZW1wbGF0ZVR5cGUgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0KTtcblx0Y29uc3QgY29uZGVuc2VkVGFibGVMYXlvdXQgPSBfZ2V0Q29uZGVuc2VkVGFibGVMYXlvdXQodGFibGVUeXBlLCB0YWJsZVNldHRpbmdzKTtcblx0Y29uc3Qgb0NvbmZpZ3VyYXRpb24gPSB7XG5cdFx0Ly8gSWYgbm8gY3JlYXRlQXRFbmQgaXMgc3BlY2lmaWVkIGl0IHdpbGwgYmUgZmFsc2UgZm9yIElubGluZSBjcmVhdGUgYW5kIHRydWUgb3RoZXJ3aXNlXG5cdFx0Y3JlYXRlQXRFbmQ6XG5cdFx0XHR0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uY3JlYXRlQXRFbmQgIT09IHVuZGVmaW5lZFxuXHRcdFx0XHQ/IHRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5jcmVhdGVBdEVuZFxuXHRcdFx0XHQ6IGNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLklubGluZSxcblx0XHRjcmVhdGlvbk1vZGU6IGNyZWF0aW9uTW9kZSxcblx0XHRjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb246IGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbixcblx0XHRkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXI6IGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcixcblx0XHQvLyBpZiBhIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhIHNob3VsZCBub3QgYmUgY29uc2lkZXJlZCwgaS5lLiBzZXQgdG8gZmFsc2Vcblx0XHRkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhOiAhY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uID8gISF0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSA6IGZhbHNlLFxuXHRcdGVuYWJsZUF1dG9Db2x1bW5XaWR0aDogZW5hYmxlQXV0b0NvbHVtbldpZHRoLFxuXHRcdGVuYWJsZUV4cG9ydDogX2dldEVuYWJsZUV4cG9ydCh0YWJsZVNldHRpbmdzLCBjb252ZXJ0ZXJDb250ZXh0LCBlbmFibGVQYXN0ZSksXG5cdFx0ZnJvemVuQ29sdW1uQ291bnQ6IF9nZXRGcm96ZW5Db2x1bW5Db3VudCh0YWJsZVNldHRpbmdzKSxcblx0XHRlbmFibGVGdWxsU2NyZWVuOiBfZ2V0RnVsbFNjcmVlbkJhc2VkT25EZXZpY2UodGFibGVTZXR0aW5ncywgY29udmVydGVyQ29udGV4dCwgX21hbmlmZXN0V3JhcHBlci5pc1Bob25lKCkpLFxuXHRcdGVuYWJsZU1hc3NFZGl0OiB0YWJsZVNldHRpbmdzPy5lbmFibGVNYXNzRWRpdCxcblx0XHRlbmFibGVBZGRDYXJkVG9JbnNpZ2h0czogdGFibGVTZXR0aW5ncz8uZW5hYmxlQWRkQ2FyZFRvSW5zaWdodHMsXG5cdFx0ZW5hYmxlUGFzdGU6IGVuYWJsZVBhc3RlLFxuXHRcdGhlYWRlclZpc2libGU6IHRydWUsXG5cdFx0bXVsdGlTZWxlY3RNb2RlOiBfZ2V0TXVsdGlTZWxlY3RNb2RlKHRhYmxlU2V0dGluZ3MsIHRhYmxlVHlwZSwgY29udmVydGVyQ29udGV4dCksXG5cdFx0c2VsZWN0aW9uTGltaXQ6IF9nZXRUYWJsZVNlbGVjdGlvbkxpbWl0KHRhYmxlU2V0dGluZ3MpLFxuXHRcdGlubGluZUNyZWF0aW9uUm93Q291bnQ6IF9nZXRUYWJsZUlubGluZUNyZWF0aW9uUm93Q291bnQodGFibGVTZXR0aW5ncyksXG5cdFx0aW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZTogdGFibGVTZXR0aW5ncz8uY3JlYXRpb25Nb2RlPy5pbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlID8/IGZhbHNlLFxuXHRcdHNob3dSb3dDb3VudDogIXRhYmxlU2V0dGluZ3M/LnF1aWNrVmFyaWFudFNlbGVjdGlvbj8uc2hvd0NvdW50cyAmJiAhX21hbmlmZXN0V3JhcHBlci5nZXRWaWV3Q29uZmlndXJhdGlvbigpPy5zaG93Q291bnRzLFxuXHRcdHR5cGU6IHRhYmxlVHlwZSxcblx0XHR1c2VDb25kZW5zZWRUYWJsZUxheW91dDogY29uZGVuc2VkVGFibGVMYXlvdXQgJiYgaXNDb25kZW5zZWRUYWJsZUxheW91dENvbXBsaWFudCxcblx0XHRpc0NvbXBhY3RUeXBlOiBfbWFuaWZlc3RXcmFwcGVyLmlzQ29tcGFjdFR5cGUoKVxuXHR9O1xuXG5cdGNvbnN0IHRhYmxlQ29uZmlndXJhdGlvbjogVGFibGVDb250cm9sQ29uZmlndXJhdGlvbiA9IHsgLi4ub0NvbmZpZ3VyYXRpb24sIC4uLnRhYmxlUm93TW9kZSwgLi4ub0ZpbHRlckNvbmZpZ3VyYXRpb24gfTtcblxuXHRpZiAodGFibGVUeXBlID09PSBcIlRyZWVUYWJsZVwiKSB7XG5cdFx0dGFibGVDb25maWd1cmF0aW9uLmhpZXJhcmNoeVF1YWxpZmllciA9IHRhYmxlU2V0dGluZ3MuaGllcmFyY2h5UXVhbGlmaWVyO1xuXHR9XG5cblx0cmV0dXJuIHRhYmxlQ29uZmlndXJhdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFR5cGVDb25maWcob1Byb3BlcnR5OiBQcm9wZXJ0eSB8IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsIGRhdGFUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBQcm9wZXJ0eVR5cGVDb25maWcge1xuXHRsZXQgb1RhcmdldE1hcHBpbmc7XG5cdGlmIChpc1Byb3BlcnR5KG9Qcm9wZXJ0eSkpIHtcblx0XHRvVGFyZ2V0TWFwcGluZyA9IGlzVHlwZURlZmluaXRpb24ob1Byb3BlcnR5LnRhcmdldFR5cGUpXG5cdFx0XHQ/IEVETV9UWVBFX01BUFBJTkdbb1Byb3BlcnR5LnRhcmdldFR5cGUudW5kZXJseWluZ1R5cGVdXG5cdFx0XHQ6IEVETV9UWVBFX01BUFBJTkdbb1Byb3BlcnR5LnR5cGVdO1xuXHR9XG5cdGlmIChvVGFyZ2V0TWFwcGluZyA9PT0gdW5kZWZpbmVkICYmIGRhdGFUeXBlICE9PSB1bmRlZmluZWQpIHtcblx0XHRvVGFyZ2V0TWFwcGluZyA9IEVETV9UWVBFX01BUFBJTkdbZGF0YVR5cGVdO1xuXHR9XG5cblx0Y29uc3QgcHJvcGVydHlUeXBlQ29uZmlnOiBQcm9wZXJ0eVR5cGVDb25maWcgPSB7XG5cdFx0dHlwZTogb1RhcmdldE1hcHBpbmc/LnR5cGUsXG5cdFx0Y29uc3RyYWludHM6IHt9LFxuXHRcdGZvcm1hdE9wdGlvbnM6IHt9XG5cdH07XG5cdGlmIChpc1Byb3BlcnR5KG9Qcm9wZXJ0eSkgJiYgb1RhcmdldE1hcHBpbmcgIT09IHVuZGVmaW5lZCkge1xuXHRcdHByb3BlcnR5VHlwZUNvbmZpZy5jb25zdHJhaW50cyA9IHtcblx0XHRcdHNjYWxlOiBvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uJFNjYWxlID8gb1Byb3BlcnR5LnNjYWxlIDogdW5kZWZpbmVkLFxuXHRcdFx0cHJlY2lzaW9uOiBvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uJFByZWNpc2lvbiA/IG9Qcm9wZXJ0eS5wcmVjaXNpb24gOiB1bmRlZmluZWQsXG5cdFx0XHRtYXhMZW5ndGg6IG9UYXJnZXRNYXBwaW5nLmNvbnN0cmFpbnRzPy4kTWF4TGVuZ3RoID8gb1Byb3BlcnR5Lm1heExlbmd0aCA6IHVuZGVmaW5lZCxcblx0XHRcdG51bGxhYmxlOiBvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uJE51bGxhYmxlID8gb1Byb3BlcnR5Lm51bGxhYmxlIDogdW5kZWZpbmVkLFxuXHRcdFx0bWluaW11bTpcblx0XHRcdFx0b1RhcmdldE1hcHBpbmcuY29uc3RyYWludHM/LltcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NaW5pbXVtLyREZWNpbWFsXCJdICYmXG5cdFx0XHRcdCFpc05hTihvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1pbmltdW0pXG5cdFx0XHRcdFx0PyBgJHtvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1pbmltdW19YFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdFx0bWF4aW11bTpcblx0XHRcdFx0b1RhcmdldE1hcHBpbmcuY29uc3RyYWludHM/LltcIkBPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NYXhpbXVtLyREZWNpbWFsXCJdICYmXG5cdFx0XHRcdCFpc05hTihvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1heGltdW0pXG5cdFx0XHRcdFx0PyBgJHtvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlZhbGlkYXRpb24/Lk1heGltdW19YFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdFx0aXNEaWdpdFNlcXVlbmNlOlxuXHRcdFx0XHRwcm9wZXJ0eVR5cGVDb25maWcudHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJpbmdcIiAmJlxuXHRcdFx0XHRvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uW2BAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuSXNEaWdpdFNlcXVlbmNlfWBdICYmXG5cdFx0XHRcdG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5Jc0RpZ2l0U2VxdWVuY2Vcblx0XHRcdFx0XHQ/IHRydWVcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZFxuXHRcdH07XG5cdH1cblx0cHJvcGVydHlUeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnMgPSB7XG5cdFx0cGFyc2VBc1N0cmluZzpcblx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZz8udHlwZT8uaW5kZXhPZihcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkludFwiKSA9PT0gMCB8fFxuXHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnPy50eXBlPy5pbmRleE9mKFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuRG91YmxlXCIpID09PSAwXG5cdFx0XHRcdD8gZmFsc2Vcblx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0ZW1wdHlTdHJpbmc6XG5cdFx0XHRwcm9wZXJ0eVR5cGVDb25maWc/LnR5cGU/LmluZGV4T2YoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnRcIikgPT09IDAgfHxcblx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZz8udHlwZT8uaW5kZXhPZihcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRvdWJsZVwiKSA9PT0gMFxuXHRcdFx0XHQ/IFwiXCJcblx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0cGFyc2VLZWVwc0VtcHR5U3RyaW5nOiBwcm9wZXJ0eVR5cGVDb25maWcudHlwZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5TdHJpbmdcIiA/IHRydWUgOiB1bmRlZmluZWRcblx0fTtcblx0cmV0dXJuIHByb3BlcnR5VHlwZUNvbmZpZztcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuXHRnZXRUYWJsZUFjdGlvbnMsXG5cdGdldFRhYmxlQ29sdW1ucyxcblx0Z2V0Q29sdW1uc0Zyb21FbnRpdHlUeXBlLFxuXHR1cGRhdGVMaW5rZWRQcm9wZXJ0aWVzLFxuXHRjcmVhdGVUYWJsZVZpc3VhbGl6YXRpb24sXG5cdGNyZWF0ZURlZmF1bHRUYWJsZVZpc3VhbGl6YXRpb24sXG5cdGdldENhcGFiaWxpdHlSZXN0cmljdGlvbixcblx0Z2V0U2VsZWN0aW9uTW9kZSxcblx0Z2V0Um93U3RhdHVzVmlzaWJpbGl0eSxcblx0Z2V0SW1wb3J0YW5jZSxcblx0Z2V0UDEzbk1vZGUsXG5cdGdldFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24sXG5cdGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSxcblx0c3BsaXRQYXRoLFxuXHRnZXRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbixcblx0Z2V0VGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdGdldFR5cGVDb25maWcsXG5cdHVwZGF0ZVRhYmxlVmlzdWFsaXphdGlvbkZvclR5cGVcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXdRS0EsVUFBVSxFQU1mO0VBQUEsV0FOS0EsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtFQUFBLEdBQVZBLFVBQVUsS0FBVkEsVUFBVTtFQW1NZjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTQyxlQUFlLENBQzlCQyxrQkFBNEIsRUFDNUJDLGlCQUF5QixFQUN6QkMsZ0JBQWtDLEVBQ2xDQyxrQkFBb0QsRUFDbkM7SUFDakIsTUFBTUMsYUFBYSxHQUFHQyx5QkFBeUIsQ0FBQ0wsa0JBQWtCLEVBQUVDLGlCQUFpQixFQUFFQyxnQkFBZ0IsQ0FBQztJQUN4RyxNQUFNSSxrQkFBa0IsR0FBR0YsYUFBYSxDQUFDRyxZQUFZO0lBQ3JELE1BQU1DLGNBQWMsR0FBR0osYUFBYSxDQUFDSyxrQkFBa0I7SUFDdkQsTUFBTUMsZUFBZSxHQUFHQyxzQkFBc0IsQ0FDN0NULGdCQUFnQixDQUFDVSwrQkFBK0IsQ0FBQ1gsaUJBQWlCLENBQUMsQ0FBQ1ksT0FBTyxFQUMzRVgsZ0JBQWdCLEVBQ2hCSSxrQkFBa0IsRUFDbEJILGtCQUFrQixFQUNsQixJQUFJLEVBQ0pLLGNBQWMsQ0FDZDtJQUNELE1BQU1NLHFCQUF5QyxHQUFHO01BQ2pEQyxXQUFXLEVBQUVDLFlBQVksQ0FBQ0MsU0FBUztNQUNuQ0MsY0FBYyxFQUFFRixZQUFZLENBQUNDLFNBQVM7TUFDdENFLGdCQUFnQixFQUFFSCxZQUFZLENBQUNDLFNBQVM7TUFDeENHLE9BQU8sRUFBRUosWUFBWSxDQUFDQyxTQUFTO01BQy9CSSxPQUFPLEVBQUVMLFlBQVksQ0FBQ0MsU0FBUztNQUMvQkssOEJBQThCLEVBQUVOLFlBQVksQ0FBQ0MsU0FBUztNQUN0RE0sT0FBTyxFQUFFUCxZQUFZLENBQUNDO0lBQ3ZCLENBQUM7SUFDRCxNQUFNSixPQUFPLEdBQUdXLG9CQUFvQixDQUFDbEIsa0JBQWtCLEVBQUVJLGVBQWUsQ0FBQ0csT0FBTyxFQUFFQyxxQkFBcUIsQ0FBQztJQUV4RyxPQUFPO01BQ05ELE9BQU87TUFDUFksY0FBYyxFQUFFZixlQUFlLENBQUNlO0lBQ2pDLENBQUM7RUFDRjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBVkE7RUFXTyxTQUFTQyxlQUFlLENBQzlCMUIsa0JBQTRCLEVBQzVCQyxpQkFBeUIsRUFDekJDLGdCQUFrQyxFQUNsQ0Msa0JBQW9ELEVBQ3BEd0IsaUJBQTJCLEVBQ1g7SUFDaEIsTUFBTUMsaUJBQWlCLEdBQUdDLHlCQUF5QixDQUFDN0Isa0JBQWtCLEVBQUVDLGlCQUFpQixFQUFFQyxnQkFBZ0IsRUFBRXlCLGlCQUFpQixDQUFDO0lBQy9ILE1BQU1HLGVBQWUsR0FBR0Msc0JBQXNCLENBQzdDN0IsZ0JBQWdCLENBQUNVLCtCQUErQixDQUFDWCxpQkFBaUIsQ0FBQyxDQUFDK0IsT0FBTyxFQUMzRUosaUJBQWlCLEVBQ2pCMUIsZ0JBQWdCLEVBQ2hCQSxnQkFBZ0IsQ0FBQytCLHVCQUF1QixDQUFDakMsa0JBQWtCLENBQUMsRUFDNURHLGtCQUFrQixDQUNsQjtJQUVELE9BQU9xQixvQkFBb0IsQ0FBQ0ksaUJBQWlCLEVBQW1CRSxlQUFlLEVBQWdEO01BQzlISSxLQUFLLEVBQUVsQixZQUFZLENBQUNDLFNBQVM7TUFDN0JrQixVQUFVLEVBQUVuQixZQUFZLENBQUNDLFNBQVM7TUFDbENtQixlQUFlLEVBQUVwQixZQUFZLENBQUNDLFNBQVM7TUFDdkNvQixZQUFZLEVBQUVyQixZQUFZLENBQUNDLFNBQVM7TUFDcENGLFdBQVcsRUFBRUMsWUFBWSxDQUFDQyxTQUFTO01BQ25DcUIsUUFBUSxFQUFFdEIsWUFBWSxDQUFDQyxTQUFTO01BQ2hDc0IsYUFBYSxFQUFFdkIsWUFBWSxDQUFDQztJQUM3QixDQUFDLENBQUM7RUFDSDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUEE7RUFRTyxNQUFNdUIscUNBQXFDLEdBQUcsVUFDcERDLFVBQXNCLEVBQ3RCQyxZQUEyQixFQUMzQnhDLGdCQUFrQyxFQUNVO0lBQzVDLE1BQU15QyxpQkFBaUIsR0FBRyxJQUFJQyxpQkFBaUIsQ0FBQ0gsVUFBVSxFQUFFdkMsZ0JBQWdCLENBQUM7SUFFN0UsU0FBUzJDLGtCQUFrQixDQUFDQyxJQUFZLEVBQTJCO01BQ2xFLE9BQU9KLFlBQVksQ0FBQ0ssSUFBSSxDQUFFQyxNQUFNLElBQUs7UUFDcEMsTUFBTUMsZ0JBQWdCLEdBQUdELE1BQStCO1FBQ3hELE9BQU9DLGdCQUFnQixDQUFDQyxhQUFhLEtBQUtDLFNBQVMsSUFBSUYsZ0JBQWdCLENBQUNHLFlBQVksS0FBS04sSUFBSTtNQUM5RixDQUFDLENBQUM7SUFDSDtJQUVBLElBQUksQ0FBQ0gsaUJBQWlCLENBQUNVLG9CQUFvQixFQUFFLEVBQUU7TUFDOUMsT0FBT0YsU0FBUztJQUNqQjs7SUFFQTtJQUNBO0lBQ0EsTUFBTUcsd0JBQXdCLEdBQUcsSUFBSUMsR0FBRyxFQUFFO0lBQzFDYixZQUFZLENBQUNjLE9BQU8sQ0FBRVIsTUFBTSxJQUFLO01BQ2hDLE1BQU1TLFdBQVcsR0FBR1QsTUFBK0I7TUFDbkQsSUFBSVMsV0FBVyxDQUFDQyxJQUFJLEVBQUU7UUFDckJKLHdCQUF3QixDQUFDSyxHQUFHLENBQUNGLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDO01BQy9DO0lBQ0QsQ0FBQyxDQUFDO0lBRUYsTUFBTUUsMEJBQTBCLEdBQUdqQixpQkFBaUIsQ0FBQ2tCLDZCQUE2QixFQUFFO0lBQ3BGLE1BQU1DLFdBQXFDLEdBQUcsQ0FBQyxDQUFDO0lBRWhERiwwQkFBMEIsQ0FBQ0osT0FBTyxDQUFFTyxVQUFVLElBQUs7TUFDbEQsTUFBTUMsa0JBQWtCLEdBQUdyQixpQkFBaUIsQ0FBQ3NCLFdBQVcsQ0FBQ0MsZ0JBQWdCLENBQUNuQixJQUFJLENBQUVvQixRQUFRLElBQUs7UUFDNUYsT0FBT0EsUUFBUSxDQUFDQyxJQUFJLEtBQUtMLFVBQVUsQ0FBQ00sU0FBUztNQUM5QyxDQUFDLENBQUM7TUFFRixJQUFJTCxrQkFBa0IsRUFBRTtRQUFBO1FBQ3ZCLE1BQU1NLHlCQUF5Qiw0QkFBR1AsVUFBVSxDQUFDUSxXQUFXLG9GQUF0QixzQkFBd0JDLFdBQVcsMkRBQW5DLHVCQUFxQ0MseUJBQXlCO1FBQ2hHWCxXQUFXLENBQUNFLGtCQUFrQixDQUFDSSxJQUFJLENBQUMsR0FBR0UseUJBQXlCLEdBQzdEQSx5QkFBeUIsQ0FBQ0ksR0FBRyxDQUFFQyxjQUFjLElBQUs7VUFDbEQsT0FBT0EsY0FBYyxDQUFDQyxLQUFLO1FBQzNCLENBQUMsQ0FBQyxHQUNGLEVBQUU7TUFDTjtJQUNELENBQUMsQ0FBQztJQUNGLE1BQU1DLE1BQXFDLEdBQUcsQ0FBQyxDQUFDO0lBRWhEbkMsWUFBWSxDQUFDYyxPQUFPLENBQUVSLE1BQU0sSUFBSztNQUNoQyxNQUFNUyxXQUFXLEdBQUdULE1BQStCO01BQ25ELElBQUlTLFdBQVcsQ0FBQ1AsYUFBYSxLQUFLQyxTQUFTLElBQUlNLFdBQVcsQ0FBQ0wsWUFBWSxFQUFFO1FBQ3hFLE1BQU0wQiw0QkFBNEIsR0FBR2hCLFdBQVcsQ0FBQ0wsV0FBVyxDQUFDTCxZQUFZLENBQUM7O1FBRTFFO1FBQ0EsSUFBSTBCLDRCQUE0QixJQUFJLENBQUN4Qix3QkFBd0IsQ0FBQ3lCLEdBQUcsQ0FBQ3RCLFdBQVcsQ0FBQ1csSUFBSSxDQUFDLEVBQUU7VUFDcEZTLE1BQU0sQ0FBQ3BCLFdBQVcsQ0FBQ1csSUFBSSxDQUFDLEdBQUc7WUFDMUJZLGdCQUFnQixFQUFFLENBQUMsQ0FBQztZQUNwQjVCLFlBQVksRUFBRUssV0FBVyxDQUFDTDtVQUMzQixDQUFDO1VBQ0QsTUFBTWtCLHlCQUFtQyxHQUFHLEVBQUU7VUFDOUNRLDRCQUE0QixDQUFDdEIsT0FBTyxDQUFFeUIsMkJBQTJCLElBQUs7WUFDckUsTUFBTUMsV0FBVyxHQUFHckMsa0JBQWtCLENBQUNvQywyQkFBMkIsQ0FBQztZQUNuRSxJQUFJQyxXQUFXLEVBQUU7Y0FDaEJaLHlCQUF5QixDQUFDYSxJQUFJLENBQUNELFdBQVcsQ0FBQ2QsSUFBSSxDQUFDO1lBQ2pEO1VBQ0QsQ0FBQyxDQUFDO1VBRUYsSUFBSUUseUJBQXlCLENBQUNjLE1BQU0sRUFBRTtZQUNyQ1AsTUFBTSxDQUFDcEIsV0FBVyxDQUFDVyxJQUFJLENBQUMsQ0FBQ1ksZ0JBQWdCLENBQUNWLHlCQUF5QixHQUFHQSx5QkFBeUI7VUFDaEc7UUFDRDtNQUNEO0lBQ0QsQ0FBQyxDQUFDO0lBRUYsT0FBT08sTUFBTTtFQUNkLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVBBO0VBUU8sU0FBU1EsK0JBQStCLENBQzlDQyxrQkFBc0MsRUFDdEM3QyxVQUFzQixFQUN0QnZDLGdCQUFrQyxFQUNsQ3FGLDZCQUF1RCxFQUN0RDtJQUNELElBQUlELGtCQUFrQixDQUFDRSxPQUFPLENBQUNDLElBQUksS0FBSyxpQkFBaUIsRUFBRTtNQUMxRCxNQUFNQyxxQkFBcUIsR0FBR2xELHFDQUFxQyxDQUFDQyxVQUFVLEVBQUU2QyxrQkFBa0IsQ0FBQ3RELE9BQU8sRUFBRTlCLGdCQUFnQixDQUFDO1FBQzVIeUMsaUJBQWlCLEdBQUcsSUFBSUMsaUJBQWlCLENBQUNILFVBQVUsRUFBRXZDLGdCQUFnQixDQUFDO01BRXhFLElBQUl3RixxQkFBcUIsRUFBRTtRQUMxQkosa0JBQWtCLENBQUNLLGVBQWUsR0FBRyxJQUFJO1FBQ3pDTCxrQkFBa0IsQ0FBQ00sYUFBYSxHQUFHLEtBQUs7UUFDeENOLGtCQUFrQixDQUFDTywyQkFBMkIsR0FBRyxLQUFLO1FBQ3REUCxrQkFBa0IsQ0FBQ1EsVUFBVSxHQUFHSixxQkFBcUI7UUFDckRLLDZDQUE2QyxDQUFDVCxrQkFBa0IsQ0FBQztRQUVqRSxNQUFNVSxzQkFBc0IsR0FBR3JELGlCQUFpQixDQUFDc0QseUJBQXlCLEVBQUU7UUFDNUVYLGtCQUFrQixDQUFDWSxpQkFBaUIsR0FBR0Ysc0JBQXNCLEdBQUdBLHNCQUFzQixDQUFDRyxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUk7O1FBRXBIO1FBQ0FiLGtCQUFrQixDQUFDdkIsVUFBVSxDQUFDcUMsZUFBZSxHQUFHQyxrQkFBa0IsQ0FDakVkLDZCQUE2QixFQUM3QkQsa0JBQWtCLENBQUN0RCxPQUFPLEVBQzFCc0Qsa0JBQWtCLENBQUNFLE9BQU8sQ0FBQ0MsSUFBSSxDQUMvQjtRQUNESCxrQkFBa0IsQ0FBQ3ZCLFVBQVUsQ0FBQ3VDLG1CQUFtQixHQUFHQyxzQkFBc0IsQ0FDekVoQiw2QkFBNkIsRUFDN0JELGtCQUFrQixDQUFDdEQsT0FBTyxDQUMxQjtNQUNGO01BRUFzRCxrQkFBa0IsQ0FBQ0UsT0FBTyxDQUFDQyxJQUFJLEdBQUcsV0FBVyxDQUFDLENBQUM7SUFDaEQsQ0FBQyxNQUFNLElBQUlILGtCQUFrQixDQUFDRSxPQUFPLENBQUNDLElBQUksS0FBSyxpQkFBaUIsRUFBRTtNQUNqRUgsa0JBQWtCLENBQUN2QixVQUFVLENBQUNxQyxlQUFlLEdBQUdDLGtCQUFrQixDQUNqRWQsNkJBQTZCLEVBQzdCRCxrQkFBa0IsQ0FBQ3RELE9BQU8sRUFDMUJzRCxrQkFBa0IsQ0FBQ0UsT0FBTyxDQUFDQyxJQUFJLENBQy9CO0lBQ0YsQ0FBQyxNQUFNLElBQUlILGtCQUFrQixDQUFDRSxPQUFPLENBQUNDLElBQUksS0FBSyxXQUFXLEVBQUU7TUFDM0QsTUFBTTlDLGlCQUFpQixHQUFHLElBQUlDLGlCQUFpQixDQUFDSCxVQUFVLEVBQUV2QyxnQkFBZ0IsQ0FBQztNQUM3RSxNQUFNOEYsc0JBQXNCLEdBQUdyRCxpQkFBaUIsQ0FBQ3NELHlCQUF5QixFQUFFO01BQzVFWCxrQkFBa0IsQ0FBQ1ksaUJBQWlCLEdBQUdGLHNCQUFzQixHQUFHQSxzQkFBc0IsQ0FBQ1EsUUFBUSxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUk7TUFDaEhsQixrQkFBa0IsQ0FBQ08sMkJBQTJCLEdBQUcsSUFBSTtJQUN0RDtFQUNEOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkE7RUFPQSxTQUFTWSx1QkFBdUIsQ0FBQ3ZHLGdCQUFrQyxFQUFFd0csc0JBQThCLEVBQUU7SUFDcEcsTUFBTUMsZUFBZSxHQUFHekcsZ0JBQWdCLENBQUMwRyxrQkFBa0IsRUFBRTtJQUM3RCxJQUFJRixzQkFBc0IsSUFBSUMsZUFBZSxDQUFDRSwwQkFBMEIsQ0FBQ0gsc0JBQXNCLENBQUMsRUFBRTtNQUNqRyxNQUFNSSxTQUFTLEdBQUdILGVBQWUsQ0FBQ0UsMEJBQTBCLENBQUNILHNCQUFzQixDQUFDO01BQ3BGLElBQUlLLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDRixTQUFTLENBQUMsQ0FBQzFCLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDdEMsT0FBT3NCLHNCQUFzQjtNQUM5QjtJQUNEO0lBRUEsTUFBTU8sYUFBYSxHQUFHL0csZ0JBQWdCLENBQUNnSCxzQkFBc0IsRUFBRTtJQUMvRCxNQUFNQyxXQUFXLEdBQUdqSCxnQkFBZ0IsQ0FBQ2tILGNBQWMsRUFBRTtJQUNyRCxNQUFNQyx1QkFBdUIsR0FBR1YsZUFBZSxDQUFDRSwwQkFBMEIsQ0FBQ00sV0FBVyxDQUFDO0lBQ3ZGLElBQUlFLHVCQUF1QixJQUFJTixNQUFNLENBQUNDLElBQUksQ0FBQ0ssdUJBQXVCLENBQUMsQ0FBQ2pDLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDL0UsT0FBTytCLFdBQVc7SUFDbkI7SUFFQSxPQUFPRixhQUFhLENBQUNLLGVBQWUsR0FBR0wsYUFBYSxDQUFDSyxlQUFlLENBQUNsRCxJQUFJLEdBQUc2QyxhQUFhLENBQUNNLGlCQUFpQixDQUFDbkQsSUFBSTtFQUNqSDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTb0Qsc0JBQXNCLENBQUMvRSxVQUFzQixFQUFFQyxZQUEyQixFQUFFO0lBQzNGLFNBQVMrRSxnQkFBZ0IsQ0FBQzNFLElBQVksRUFBMkI7TUFDaEUsT0FBT0osWUFBWSxDQUFDSyxJQUFJLENBQUVDLE1BQU0sSUFBSztRQUNwQyxNQUFNQyxnQkFBZ0IsR0FBR0QsTUFBK0I7UUFDeEQsT0FBT0MsZ0JBQWdCLENBQUNDLGFBQWEsS0FBS0MsU0FBUyxJQUFJRixnQkFBZ0IsQ0FBQ0csWUFBWSxLQUFLTixJQUFJO01BQzlGLENBQUMsQ0FBQztJQUNIO0lBRUFKLFlBQVksQ0FBQ2MsT0FBTyxDQUFFa0UsT0FBTyxJQUFLO01BQ2pDLE1BQU1DLFlBQVksR0FBR0QsT0FBZ0M7TUFDckQsSUFBSUMsWUFBWSxDQUFDekUsYUFBYSxLQUFLQyxTQUFTLElBQUl3RSxZQUFZLENBQUN2RSxZQUFZLEVBQUU7UUFDMUUsTUFBTXdFLFNBQVMsR0FBR25GLFVBQVUsQ0FBQ3lCLGdCQUFnQixDQUFDbkIsSUFBSSxDQUFFOEUsS0FBZSxJQUFLQSxLQUFLLENBQUN6RCxJQUFJLEtBQUt1RCxZQUFZLENBQUN2RSxZQUFZLENBQUM7UUFDakgsSUFBSXdFLFNBQVMsRUFBRTtVQUFBO1VBQ2QsTUFBTUUsS0FBSyxHQUFHQyw2QkFBNkIsQ0FBQ0gsU0FBUyxDQUFDLElBQUlJLHlCQUF5QixDQUFDSixTQUFTLENBQUM7VUFDOUYsTUFBTUssU0FBUyxHQUFHQyw2QkFBNkIsQ0FBQ04sU0FBUyxDQUFDO1VBQzFELE1BQU1PLFNBQVMsR0FBR1AsU0FBUyxhQUFUQSxTQUFTLGdEQUFUQSxTQUFTLENBQUVyRCxXQUFXLG9GQUF0QixzQkFBd0I2RCxNQUFNLDJEQUE5Qix1QkFBZ0NDLFFBQVE7VUFDMUQsSUFBSVAsS0FBSyxFQUFFO1lBQ1YsTUFBTVEsV0FBVyxHQUFHYixnQkFBZ0IsQ0FBQ0ssS0FBSyxDQUFDMUQsSUFBSSxDQUFDO1lBQ2hEdUQsWUFBWSxDQUFDakUsSUFBSSxHQUFHNEUsV0FBVyxhQUFYQSxXQUFXLHVCQUFYQSxXQUFXLENBQUVsRSxJQUFJO1VBQ3RDLENBQUMsTUFBTTtZQUFBO1lBQ04sTUFBTW1FLEtBQUssR0FBRyxDQUFBWCxTQUFTLGFBQVRBLFNBQVMsaURBQVRBLFNBQVMsQ0FBRXJELFdBQVcscUZBQXRCLHVCQUF3QmlFLFFBQVEsMkRBQWhDLHVCQUFrQ0MsV0FBVyxNQUFJYixTQUFTLGFBQVRBLFNBQVMsaURBQVRBLFNBQVMsQ0FBRXJELFdBQVcscUZBQXRCLHVCQUF3QmlFLFFBQVEsMkRBQWhDLHVCQUFrQ0UsSUFBSTtZQUNyRyxJQUFJSCxLQUFLLEVBQUU7Y0FDVlosWUFBWSxDQUFDZ0IsUUFBUSxHQUFJLEdBQUVKLEtBQU0sRUFBQztZQUNuQztVQUNEO1VBQ0EsSUFBSU4sU0FBUyxFQUFFO1lBQ2QsTUFBTVcsZUFBZSxHQUFHbkIsZ0JBQWdCLENBQUNRLFNBQVMsQ0FBQzdELElBQUksQ0FBQztZQUN4RHVELFlBQVksQ0FBQ2tCLFFBQVEsR0FBR0QsZUFBZSxhQUFmQSxlQUFlLHVCQUFmQSxlQUFlLENBQUV4RSxJQUFJO1VBQzlDLENBQUMsTUFBTSxJQUFJK0QsU0FBUyxFQUFFO1lBQ3JCUixZQUFZLENBQUNtQixZQUFZLEdBQUdYLFNBQVMsQ0FBQ1ksUUFBUSxFQUFFO1VBQ2pEO1VBRUEsTUFBTUMsV0FBVyxHQUFHQyxjQUFjLENBQUNyQixTQUFTLENBQUM7WUFDNUNzQixjQUFjLDZCQUFHdEIsU0FBUyxDQUFDckQsV0FBVyxDQUFDNkQsTUFBTSwyREFBNUIsdUJBQThCZSxJQUFJO1VBQ3BELElBQUlDLDBCQUEwQixDQUFDRixjQUFjLENBQUMsSUFBSUYsV0FBVyxLQUFLLE9BQU8sRUFBRTtZQUMxRSxNQUFNSyxXQUFXLEdBQUc1QixnQkFBZ0IsQ0FBQ3lCLGNBQWMsQ0FBQ3BHLElBQUksQ0FBQztZQUN6RCxJQUFJdUcsV0FBVyxJQUFJQSxXQUFXLENBQUNqRixJQUFJLEtBQUt1RCxZQUFZLENBQUN2RCxJQUFJLEVBQUU7Y0FDMUR1RCxZQUFZLENBQUMyQixlQUFlLEdBQUc7Z0JBQzlCQyxZQUFZLEVBQUVGLFdBQVcsQ0FBQ2pGLElBQUk7Z0JBQzlCb0YsSUFBSSxFQUFFUjtjQUNQLENBQUM7WUFDRjtVQUNEO1FBQ0Q7TUFDRDtJQUNELENBQUMsQ0FBQztFQUNIO0VBQUM7RUFFRCxTQUFTUywyQkFBMkIsQ0FBQ3ZKLGdCQUFrQyxFQUFFO0lBQUE7SUFDeEUsTUFBTXdKLG1CQUFtQiw0QkFBSXhKLGdCQUFnQixDQUFDK0IsdUJBQXVCLEVBQUUsb0ZBQTFDLHNCQUE0Q3NDLFdBQVcscUZBQXZELHVCQUF5RG9GLEVBQUUscUZBQTNELHVCQUE2REMsVUFBVSxxRkFBdkUsdUJBQXlFQyxLQUFLLHFGQUEvRSx1QkFBb0dDLEtBQUssMkRBQXpHLHVCQUN6QmhILElBQUk7SUFDUCxNQUFNaUgsc0JBQXNCLDZCQUFHN0osZ0JBQWdCLENBQUMrQix1QkFBdUIsRUFBRSxxRkFBMUMsdUJBQTRDc0MsV0FBVyxxRkFBdkQsdUJBQXlENkQsTUFBTSwyREFBL0QsdUJBQWlFNEIsV0FBVztJQUMzRyxNQUFNQyxrQkFBa0IsR0FBRy9KLGdCQUFnQixhQUFoQkEsZ0JBQWdCLGtEQUFoQkEsZ0JBQWdCLENBQUUrQix1QkFBdUIsRUFBRSx1RkFBM0Msd0JBQTZDc0MsV0FBVyx1RkFBeEQsd0JBQTBEb0YsRUFBRSx1RkFBNUQsd0JBQThEQyxVQUFVLDREQUF4RSx3QkFBMEVNLFFBQVE7SUFDN0csTUFBTUMsa0JBQTRCLEdBQUcsRUFBRTtJQUN2QyxJQUFJSixzQkFBc0IsRUFBRTtNQUMzQkEsc0JBQXNCLENBQUN2RyxPQUFPLENBQUMsVUFBVWtFLE9BQU8sRUFBRTtRQUNqRHlDLGtCQUFrQixDQUFDaEYsSUFBSSxDQUFDdUMsT0FBTyxDQUFDOUMsS0FBSyxDQUFDO01BQ3ZDLENBQUMsQ0FBQztJQUNIO0lBRUEsT0FBTztNQUFFOEUsbUJBQW1CO01BQUVTLGtCQUFrQjtNQUFFRjtJQUFtQixDQUFDO0VBQ3ZFO0VBRU8sU0FBU0csd0JBQXdCLENBQ3ZDcEssa0JBQTRCLEVBQzVCQyxpQkFBeUIsRUFDekJDLGdCQUFrQyxFQUNsQ3FGLDZCQUF1RCxFQUN2RDhFLCtCQUF5QyxFQUN6Q0MsaUJBQXlDLEVBQ3pDM0ksaUJBQTJCLEVBQ047SUFDckIsTUFBTTRJLG1CQUFtQixHQUFHQyw2QkFBNkIsQ0FDeER4SyxrQkFBa0IsRUFDbEJDLGlCQUFpQixFQUNqQkMsZ0JBQWdCLEVBQ2hCbUssK0JBQStCLENBQy9CO0lBQ0QsTUFBTTtNQUFFM0Q7SUFBdUIsQ0FBQyxHQUFHK0QsU0FBUyxDQUFDeEssaUJBQWlCLENBQUM7SUFDL0QsTUFBTXlLLG9CQUFvQixHQUFHakUsdUJBQXVCLENBQUN2RyxnQkFBZ0IsRUFBRXdHLHNCQUFzQixDQUFDO0lBQzlGLE1BQU12RyxrQkFBa0IsR0FBR0QsZ0JBQWdCLENBQUMwRyxrQkFBa0IsRUFBRSxDQUFDQywwQkFBMEIsQ0FBQzZELG9CQUFvQixDQUFDO0lBQ2pILE1BQU0xSSxPQUFPLEdBQUdOLGVBQWUsQ0FBQzFCLGtCQUFrQixFQUFFQyxpQkFBaUIsRUFBRUMsZ0JBQWdCLEVBQUVDLGtCQUFrQixFQUFFd0IsaUJBQWlCLENBQUM7SUFDL0gsTUFBTWdKLHFCQUFxQixHQUFHQyx3QkFBd0IsQ0FBQzVLLGtCQUFrQixFQUFFRSxnQkFBZ0IsQ0FBQztJQUM1RixNQUFNMkssOEJBQThCLEdBQUdwQiwyQkFBMkIsQ0FBQ3ZKLGdCQUFnQixDQUFDO0lBQ3BGLE1BQU1LLFlBQVksR0FBR1IsZUFBZSxDQUFDQyxrQkFBa0IsRUFBRUMsaUJBQWlCLEVBQUVDLGdCQUFnQixFQUFFQyxrQkFBa0IsQ0FBQztJQUVqSCxNQUFNMkssY0FBa0MsR0FBRztNQUMxQ3JGLElBQUksRUFBRXNGLGlCQUFpQixDQUFDQyxLQUFLO01BQzdCakgsVUFBVSxFQUFFa0gsK0JBQStCLENBQzFDakwsa0JBQWtCLEVBQ2xCQyxpQkFBaUIsRUFDakJDLGdCQUFnQixFQUNoQnFLLG1CQUFtQixFQUNuQnZJLE9BQU8sRUFDUHVELDZCQUE2QixFQUM3QitFLGlCQUFpQixFQUNqQjNJLGlCQUFpQixDQUNqQjtNQUNENkQsT0FBTyxFQUFFK0UsbUJBQW1CO01BQzVCMUosT0FBTyxFQUFFcUssc0JBQXNCLENBQUMzSyxZQUFZLENBQUNNLE9BQU8sQ0FBQztNQUNyRFksY0FBYyxFQUFFbEIsWUFBWSxDQUFDa0IsY0FBYztNQUMzQ08sT0FBTyxFQUFFQSxPQUFPO01BQ2hCMkkscUJBQXFCLEVBQUVRLElBQUksQ0FBQ0MsU0FBUyxDQUFDVCxxQkFBcUIsQ0FBQztNQUM1RFUsNEJBQTRCLEVBQUVDLCtCQUErQixDQUFDWCxxQkFBcUIsRUFBRXpLLGdCQUFnQixDQUFDO01BQ3RHcUwsZUFBZSxFQUFFViw4QkFBOEIsQ0FBQ25CLG1CQUFtQjtNQUNuRThCLFlBQVksRUFBRVgsOEJBQThCLENBQUNWLGtCQUFrQjtNQUMvREYsa0JBQWtCLEVBQUVZLDhCQUE4QixDQUFDWixrQkFBa0I7TUFDckVyRSxhQUFhLEVBQUUsSUFBSTtNQUNuQkMsMkJBQTJCLEVBQUU7SUFDOUIsQ0FBQztJQUVEMkIsc0JBQXNCLENBQUN0SCxnQkFBZ0IsQ0FBQytCLHVCQUF1QixDQUFDakMsa0JBQWtCLENBQUMsRUFBRWdDLE9BQU8sQ0FBQztJQUM3RnFELCtCQUErQixDQUM5QnlGLGNBQWMsRUFDZDVLLGdCQUFnQixDQUFDK0IsdUJBQXVCLENBQUNqQyxrQkFBa0IsQ0FBQyxFQUM1REUsZ0JBQWdCLEVBQ2hCcUYsNkJBQTZCLENBQzdCO0lBRUQsT0FBT3VGLGNBQWM7RUFDdEI7RUFBQztFQUVNLFNBQVNXLCtCQUErQixDQUFDdkwsZ0JBQWtDLEVBQUV3TCxZQUFzQixFQUFzQjtJQUMvSCxNQUFNbkIsbUJBQW1CLEdBQUdDLDZCQUE2QixDQUFDckgsU0FBUyxFQUFFLEVBQUUsRUFBRWpELGdCQUFnQixFQUFFLEtBQUssQ0FBQztJQUNqRyxNQUFNOEIsT0FBTyxHQUFHMkosd0JBQXdCLENBQUMsQ0FBQyxDQUFDLEVBQUV6TCxnQkFBZ0IsQ0FBQzBMLGFBQWEsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUxTCxnQkFBZ0IsRUFBRXFLLG1CQUFtQixDQUFDOUUsSUFBSSxFQUFFLEVBQUUsQ0FBQztJQUN0SSxNQUFNa0YscUJBQXFCLEdBQUdDLHdCQUF3QixDQUFDekgsU0FBUyxFQUFFakQsZ0JBQWdCLENBQUM7SUFDbkYsTUFBTTJLLDhCQUE4QixHQUFHcEIsMkJBQTJCLENBQUN2SixnQkFBZ0IsQ0FBQztJQUNwRixNQUFNNEssY0FBa0MsR0FBRztNQUMxQ3JGLElBQUksRUFBRXNGLGlCQUFpQixDQUFDQyxLQUFLO01BQzdCakgsVUFBVSxFQUFFa0gsK0JBQStCLENBQUM5SCxTQUFTLEVBQUUsRUFBRSxFQUFFakQsZ0JBQWdCLEVBQUVxSyxtQkFBbUIsRUFBRW1CLFlBQVksR0FBRyxFQUFFLEdBQUcxSixPQUFPLENBQUM7TUFDOUh3RCxPQUFPLEVBQUUrRSxtQkFBbUI7TUFDNUIxSixPQUFPLEVBQUUsRUFBRTtNQUNYbUIsT0FBTyxFQUFFQSxPQUFPO01BQ2hCMkkscUJBQXFCLEVBQUVRLElBQUksQ0FBQ0MsU0FBUyxDQUFDVCxxQkFBcUIsQ0FBQztNQUM1RFUsNEJBQTRCLEVBQUVDLCtCQUErQixDQUFDWCxxQkFBcUIsRUFBRXpLLGdCQUFnQixDQUFDO01BQ3RHcUwsZUFBZSxFQUFFViw4QkFBOEIsQ0FBQ25CLG1CQUFtQjtNQUNuRThCLFlBQVksRUFBRVgsOEJBQThCLENBQUNWLGtCQUFrQjtNQUMvREYsa0JBQWtCLEVBQUVZLDhCQUE4QixDQUFDWixrQkFBa0I7TUFDckVyRSxhQUFhLEVBQUUsSUFBSTtNQUNuQkMsMkJBQTJCLEVBQUU7SUFDOUIsQ0FBQztJQUVEMkIsc0JBQXNCLENBQUN0SCxnQkFBZ0IsQ0FBQzBMLGFBQWEsRUFBRSxFQUFFNUosT0FBTyxDQUFDO0lBQ2pFcUQsK0JBQStCLENBQUN5RixjQUFjLEVBQUU1SyxnQkFBZ0IsQ0FBQzBMLGFBQWEsRUFBRSxFQUFFMUwsZ0JBQWdCLENBQUM7SUFFbkcsT0FBTzRLLGNBQWM7RUFDdEI7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9BLFNBQVNGLHdCQUF3QixDQUFDNUssa0JBQXdDLEVBQUVFLGdCQUFrQyxFQUEyQjtJQUN4SSxPQUFPMkwsWUFBWSxDQUFDakIsd0JBQXdCLENBQUM1SyxrQkFBa0IsRUFBRSxPQUFPLEVBQUVFLGdCQUFnQixDQUFDO0VBQzVGOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVM0TCxnQ0FBZ0MsQ0FBQzVMLGdCQUFrQyxFQUFVO0lBQUE7SUFDckYsTUFBTTZMLFlBQVksR0FBR0MsZUFBZSxDQUFDOUwsZ0JBQWdCLENBQUM7SUFDdEQsTUFBTStMLFNBQVMsR0FBRy9MLGdCQUFnQixDQUFDZ00sWUFBWSxFQUFFO0lBQ2pELE1BQU1DLFNBQVMsR0FBR0osWUFBWSxDQUFDSyxXQUFXO0lBQzFDLE1BQU1DLDRCQUE0QixHQUFHLENBQUNDLFVBQVUsQ0FBQ0gsU0FBUyxDQUFDSSxVQUFVLENBQUMsSUFBSUosU0FBUyxDQUFDSyxvQkFBb0IsQ0FBQ0MsS0FBSyxLQUFLLGNBQWM7SUFDakksTUFBTUMsbUJBQW1CLEdBQUdULFNBQVMsYUFBVEEsU0FBUyxnREFBVEEsU0FBUyxDQUFFMUgsV0FBVyxDQUFDb0ksWUFBWSxvRkFBbkMsc0JBQXFDQyxrQkFBa0IsMkRBQXZELHVCQUF5REMsU0FBUztJQUM5RixNQUFNQyxxQkFBcUIsR0FBRzFELDBCQUEwQixDQUFDc0QsbUJBQW1CLENBQUMsSUFBSUEsbUJBQW1CLENBQUM1SixJQUFJO0lBRXpHLE9BQU91Siw0QkFBNEIsR0FBSVMscUJBQXFCLEdBQWMsRUFBRTtFQUM3RTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVN4QiwrQkFBK0IsQ0FBQ1gscUJBQThDLEVBQUV6SyxnQkFBa0MsRUFBVTtJQUNwSSxNQUFNNk0sVUFBVSxHQUFHLElBQUl4SixHQUFHLEVBQUU7SUFFNUIsS0FBSyxNQUFNeUosVUFBVSxJQUFJckMscUJBQXFCLEVBQUU7TUFDL0MsTUFBTXNDLFlBQVksR0FBR3RDLHFCQUFxQixDQUFDcUMsVUFBVSxDQUFDO01BQ3RELElBQUlDLFlBQVksS0FBSyxJQUFJLEVBQUU7UUFDMUI7UUFDQUYsVUFBVSxDQUFDcEosR0FBRyxDQUFDcUosVUFBVSxDQUFDO01BQzNCLENBQUMsTUFBTSxJQUFJLE9BQU9DLFlBQVksS0FBSyxRQUFRLEVBQUU7UUFDNUM7UUFDQUYsVUFBVSxDQUFDcEosR0FBRyxDQUFDc0osWUFBWSxDQUFDO01BQzdCO0lBQ0Q7SUFFQSxJQUFJRixVQUFVLENBQUNHLElBQUksRUFBRTtNQUFBO01BQ3BCO01BQ0E7TUFDQSxNQUFNekssVUFBVSxHQUFHdkMsZ0JBQWdCLENBQUMwTCxhQUFhLEVBQUU7TUFDbkQsTUFBTXVCLGFBQWEsNEJBQUkxSyxVQUFVLENBQUM4QixXQUFXLG9GQUF0QixzQkFBd0JvRixFQUFFLHFGQUExQix1QkFBNEJDLFVBQVUscUZBQXRDLHVCQUF3Q0MsS0FBSyxxRkFBOUMsdUJBQW1FQyxLQUFLLDJEQUF4RSx1QkFBMEVoSCxJQUFJO01BQ3BHLElBQUlxSyxhQUFhLEVBQUU7UUFDbEJKLFVBQVUsQ0FBQ3BKLEdBQUcsQ0FBQ3dKLGFBQWEsQ0FBQztNQUM5QjtJQUNEO0lBRUEsT0FBT0MsS0FBSyxDQUFDQyxJQUFJLENBQUNOLFVBQVUsQ0FBQyxDQUFDTyxJQUFJLENBQUMsR0FBRyxDQUFDO0VBQ3hDOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0Msd0NBQXdDLENBQ2hEdk4sa0JBQTRCLEVBQzVCd04saUJBQTZCLEVBQzdCQywwQkFBK0MsRUFDL0NDLFdBQW9CLEVBQ2tCO0lBQ3RDLE1BQU1DLHdCQUE2RCxHQUFHLEVBQUU7SUFDeEUzTixrQkFBa0IsQ0FBQ3dELE9BQU8sQ0FBRW9LLFNBQVMsSUFBSztNQUFBO01BQ3pDO01BQ0EsSUFDRUEsU0FBUyxDQUFDQyxLQUFLLG9EQUF5QyxJQUN4REQsU0FBUyxhQUFUQSxTQUFTLHdDQUFUQSxTQUFTLENBQUVFLFlBQVksa0RBQXZCLHNCQUF5QkMsT0FBTyxJQUNoQ1AsaUJBQWlCLE1BQUtJLFNBQVMsYUFBVEEsU0FBUyx1QkFBVEEsU0FBUyxDQUFFRSxZQUFZLENBQUNFLGdCQUFnQixLQUM5REosU0FBUyxDQUFDQyxLQUFLLG1FQUF3RCxJQUN2RUQsU0FBUyxDQUFDSyxlQUFlLElBQ3pCLENBQUFMLFNBQVMsYUFBVEEsU0FBUyw0Q0FBVEEsU0FBUyxDQUFFTSxNQUFNLHNEQUFqQixrQkFBbUJDLE9BQU8sRUFBRSxNQUFLLElBQUssRUFDdEM7UUFBQTtRQUNELElBQUksaUNBQU9QLFNBQVMsQ0FBQ3JKLFdBQVcsb0ZBQXJCLHNCQUF1Qm9GLEVBQUUscUZBQXpCLHVCQUEyQnlFLE1BQU0sMkRBQWpDLHVCQUFtQ0QsT0FBTyxFQUFFLE1BQUssUUFBUSxFQUFFO1VBQ3JFUix3QkFBd0IsQ0FBQ3hJLElBQUksQ0FBQ2tKLEtBQUssQ0FBQ0Msd0JBQXdCLENBQUNWLFNBQVMsRUFBRUgsMEJBQTBCLEVBQUVDLFdBQVcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzFIO01BQ0Q7SUFDRCxDQUFDLENBQUM7SUFDRixPQUFPQyx3QkFBd0I7RUFDaEM7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNXLHdCQUF3QixDQUNoQ0MsTUFBNkUsRUFDN0VkLDBCQUErQyxFQUMvQ0MsV0FBb0IsRUFDZ0I7SUFDcEMsSUFBSWMsV0FBVztJQUNmLElBQ0MsQ0FBQ0QsTUFBTSxhQUFOQSxNQUFNLHVCQUFOQSxNQUFNLENBQXlCVixLQUFLLHFEQUF5QyxJQUM5RSxDQUFDVSxNQUFNLGFBQU5BLE1BQU0sdUJBQU5BLE1BQU0sQ0FBd0NWLEtBQUssb0VBQXdELEVBQzNHO01BQUE7TUFDRFcsV0FBVyxHQUFJRCxNQUFNLGFBQU5BLE1BQU0sdUNBQU5BLE1BQU0sQ0FBNkRoSyxXQUFXLG9FQUEvRSxhQUFpRm9GLEVBQUUsb0RBQW5GLGdCQUFxRnlFLE1BQU07SUFDMUcsQ0FBQyxNQUFNO01BQ05JLFdBQVcsR0FBSUQsTUFBTSxhQUFOQSxNQUFNLHVCQUFOQSxNQUFNLENBQW1CbE4sT0FBTztJQUNoRDtJQUNBLElBQUlvTixLQUFhO0lBQ2pCLElBQUlyRiwwQkFBMEIsQ0FBQ29GLFdBQVcsQ0FBQyxFQUFFO01BQzVDQyxLQUFLLEdBQUdELFdBQVcsQ0FBQzFMLElBQUk7SUFDekIsQ0FBQyxNQUFNO01BQ04yTCxLQUFLLEdBQUdELFdBQXFCO0lBQzlCO0lBQ0EsSUFBSUMsS0FBSyxFQUFFO01BQ1YsSUFBS0YsTUFBTSxhQUFOQSxNQUFNLGVBQU5BLE1BQU0sQ0FBbUJsTixPQUFPLEVBQUU7UUFDdENvTixLQUFLLEdBQUdBLEtBQUssQ0FBQ0MsU0FBUyxDQUFDLENBQUMsRUFBRUQsS0FBSyxDQUFDckosTUFBTSxHQUFHLENBQUMsQ0FBQztNQUM3QztNQUNBLElBQUlxSixLQUFLLENBQUN0SSxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQzNCO1FBQ0EsTUFBTXdJLFVBQVUsR0FBR0YsS0FBSyxDQUFDRyxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQ25DLE1BQU1DLGVBQWUsR0FBR0YsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUNyQyxJQUNDRyxvQkFBb0IsQ0FBQ3JCLDBCQUEwQixhQUExQkEsMEJBQTBCLHVCQUExQkEsMEJBQTBCLENBQUVzQixZQUFZLENBQUMsSUFDOUR0QiwwQkFBMEIsQ0FBQ3NCLFlBQVksQ0FBQ0MsT0FBTyxLQUFLSCxlQUFlLEVBQ2xFO1VBQ0QsT0FBT0ksV0FBVyxDQUFDTixVQUFVLENBQUNPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzVCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsRCxDQUFDLE1BQU07VUFDTixPQUFPNkIsUUFBUSxDQUFDLElBQUksQ0FBQztRQUN0QjtRQUNBO01BQ0QsQ0FBQyxNQUFNLElBQUl6QixXQUFXLEVBQUU7UUFDdkIsT0FBT3VCLFdBQVcsQ0FBQ1IsS0FBSyxDQUFDO1FBQ3pCO01BQ0QsQ0FBQyxNQUFNO1FBQ04sT0FBT1UsUUFBUSxDQUFDLElBQUksQ0FBQztNQUN0QjtJQUNEO0lBQ0EsT0FBT0EsUUFBUSxDQUFDLElBQUksQ0FBQztFQUN0Qjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLDRCQUE0QixDQUNwQ0MsV0FBbUIsRUFDbkJ6QixTQUFpRSxFQUNqRWxOLGVBQTZDLEVBQ25DO0lBQ1YsT0FBT3FHLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDdEcsZUFBZSxDQUFDLENBQUM0TyxJQUFJLENBQUVDLFNBQVMsSUFBSztNQUN2RCxJQUFJQSxTQUFTLEtBQUtGLFdBQVcsRUFBRTtRQUFBO1FBQzlCLElBQ0V6QixTQUFTLGFBQVRBLFNBQVMsZ0NBQVRBLFNBQVMsQ0FBeUJFLFlBQVksMENBQS9DLGNBQWlEQyxPQUFPLElBQ3ZESCxTQUFTLGFBQVRBLFNBQVMsZUFBVEEsU0FBUyxDQUF3Q0ssZUFBZSxFQUNoRTtVQUNEdk4sZUFBZSxDQUFDMk8sV0FBVyxDQUFDLENBQUNHLGlCQUFpQixHQUFHLElBQUk7UUFDdEQ7UUFDQSxPQUFPLElBQUk7TUFDWjtNQUNBLE9BQU8sS0FBSztJQUNiLENBQUMsQ0FBQztFQUNIOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLHFDQUFxQyxDQUM3Q3pQLGtCQUE0QixFQUM1QlUsZUFBNkMsRUFDN0M4TSxpQkFBNkIsRUFDbkI7SUFDVixPQUFPeE4sa0JBQWtCLENBQUNzUCxJQUFJLENBQUUxQixTQUFTLElBQUs7TUFBQTtNQUM3QyxJQUNDLENBQUNBLFNBQVMsQ0FBQ0MsS0FBSyxvREFBeUMsSUFDeERELFNBQVMsQ0FBQ0MsS0FBSyxtRUFBd0QsS0FDeEUsQ0FBQUQsU0FBUyxhQUFUQSxTQUFTLDZDQUFUQSxTQUFTLENBQUVNLE1BQU0sdURBQWpCLG1CQUFtQkMsT0FBTyxFQUFFLE1BQUssSUFBSSxLQUNwQywyQkFBQVAsU0FBUyxDQUFDckosV0FBVyxxRkFBckIsdUJBQXVCb0YsRUFBRSxxRkFBekIsdUJBQTJCeUUsTUFBTSwyREFBakMsdUJBQW1DRCxPQUFPLEVBQUUsTUFBSyxLQUFLLElBQUksMkJBQUFQLFNBQVMsQ0FBQ3JKLFdBQVcscUZBQXJCLHVCQUF1Qm9GLEVBQUUscUZBQXpCLHVCQUEyQnlFLE1BQU0sMkRBQWpDLHVCQUFtQ0QsT0FBTyxFQUFFLE1BQUtoTCxTQUFTLENBQUMsRUFDckg7UUFDRCxJQUFJeUssU0FBUyxDQUFDQyxLQUFLLG9EQUF5QyxFQUFFO1VBQUE7VUFDN0QsTUFBTTZCLGdCQUFnQixHQUFHQyxRQUFRLENBQUMsQ0FBQyxvQkFBb0IsRUFBRS9CLFNBQVMsQ0FBQ2dDLE1BQU0sQ0FBVyxDQUFDO1VBQ3JGO1VBQ0EsSUFBSVIsNEJBQTRCLENBQUNNLGdCQUFnQixFQUFFOUIsU0FBUyxFQUFFbE4sZUFBZSxDQUFDLEVBQUU7WUFDL0UsT0FBTyxLQUFLO1VBQ2I7VUFDQTtVQUNBLE9BQU8sQ0FBQWtOLFNBQVMsYUFBVEEsU0FBUyxpREFBVEEsU0FBUyxDQUFFRSxZQUFZLDJEQUF2Qix1QkFBeUJDLE9BQU8sS0FBSVAsaUJBQWlCLE1BQUtJLFNBQVMsYUFBVEEsU0FBUyx1QkFBVEEsU0FBUyxDQUFFRSxZQUFZLENBQUNFLGdCQUFnQjtRQUMxRyxDQUFDLE1BQU0sSUFBSUosU0FBUyxDQUFDQyxLQUFLLG1FQUF3RCxFQUFFO1VBQ25GO1VBQ0EsSUFDQ3VCLDRCQUE0QixDQUMxQixzQ0FBcUN4QixTQUFTLENBQUNpQyxjQUFlLEtBQUlqQyxTQUFTLENBQUNnQyxNQUFPLEVBQUMsRUFDckZoQyxTQUFTLEVBQ1RsTixlQUFlLENBQ2YsRUFDQTtZQUNELE9BQU8sS0FBSztVQUNiO1VBQ0EsT0FBT2tOLFNBQVMsQ0FBQ0ssZUFBZTtRQUNqQztNQUNEO01BQ0EsT0FBTyxLQUFLO0lBQ2IsQ0FBQyxDQUFDO0VBQ0g7RUFFQSxTQUFTNkIsc0NBQXNDLENBQUNwUCxlQUE2QyxFQUFXO0lBQ3ZHLE9BQU9xRyxNQUFNLENBQUNDLElBQUksQ0FBQ3RHLGVBQWUsQ0FBQyxDQUFDNE8sSUFBSSxDQUFFQyxTQUFTLElBQUs7TUFBQTtNQUN2RCxNQUFNUSxNQUFNLEdBQUdyUCxlQUFlLENBQUM2TyxTQUFTLENBQUM7TUFDekMsSUFBSVEsTUFBTSxDQUFDUCxpQkFBaUIsSUFBSSxvQkFBQU8sTUFBTSxDQUFDMU8sT0FBTyxvREFBZCxnQkFBZ0IwSCxRQUFRLEVBQUUsTUFBSyxNQUFNLEVBQUU7UUFDdEUsT0FBTyxJQUFJO01BQ1o7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDLENBQUM7RUFDSDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNpSCw2Q0FBNkMsQ0FBQ3RQLGVBQTZDLEVBQXVDO0lBQzFJLE1BQU11UCx1QkFBNEQsR0FBRyxFQUFFO0lBQ3ZFLElBQUl2UCxlQUFlLEVBQUU7TUFDcEJxRyxNQUFNLENBQUNDLElBQUksQ0FBQ3RHLGVBQWUsQ0FBQyxDQUFDOEMsT0FBTyxDQUFFK0wsU0FBUyxJQUFLO1FBQ25ELE1BQU1RLE1BQU0sR0FBR3JQLGVBQWUsQ0FBQzZPLFNBQVMsQ0FBQztRQUN6QyxJQUFJUSxNQUFNLENBQUNQLGlCQUFpQixLQUFLLElBQUksSUFBSU8sTUFBTSxDQUFDMU8sT0FBTyxLQUFLOEIsU0FBUyxFQUFFO1VBQ3RFLElBQUksT0FBTzRNLE1BQU0sQ0FBQzFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFBQTtZQUN2QztBQUNMO0FBQ0E7QUFDQTtBQUNBOztZQUVLNE8sdUJBQXVCLENBQUM5SyxJQUFJLENBQUMrSyxvQkFBb0IsQ0FBQ0gsTUFBTSxhQUFOQSxNQUFNLDJDQUFOQSxNQUFNLENBQUUxTyxPQUFPLHFEQUFmLGlCQUFpQjhNLE9BQU8sRUFBRSxDQUFDLENBQUM7VUFDL0U7UUFDRDtNQUNELENBQUMsQ0FBQztJQUNIO0lBQ0EsT0FBTzhCLHVCQUF1QjtFQUMvQjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTRSx3QkFBd0IsQ0FBQ2pRLGdCQUFrQyxFQUE4QjtJQUN4RyxNQUFNa1EsV0FBVyxHQUFHQyxlQUFlLENBQUNuUSxnQkFBZ0IsQ0FBQ2dILHNCQUFzQixFQUFFLENBQUM7SUFDOUUsTUFBTWtGLFdBQVcsR0FBR2tFLGVBQWUsQ0FBQ3BRLGdCQUFnQixDQUFDZ0gsc0JBQXNCLEVBQUUsQ0FBQztJQUM5RSxPQUFPO01BQ05rSixXQUFXLEVBQUUsRUFBRTlELFVBQVUsQ0FBQzhELFdBQVcsQ0FBQyxJQUFJQSxXQUFXLENBQUN4TCxLQUFLLEtBQUssS0FBSyxDQUFDO01BQ3RFd0gsV0FBVyxFQUFFLEVBQUVFLFVBQVUsQ0FBQ0YsV0FBVyxDQUFDLElBQUlBLFdBQVcsQ0FBQ3hILEtBQUssS0FBSyxLQUFLO0lBQ3RFLENBQUM7RUFDRjtFQUFDO0VBRU0sU0FBUzJMLGdCQUFnQixDQUMvQnZRLGtCQUF3QyxFQUN4Q0MsaUJBQXlCLEVBQ3pCQyxnQkFBa0MsRUFDbEN3TixXQUFvQixFQUNwQjhDLGtCQUE4QyxFQUM5Q0MsZ0NBQW9FLEVBRS9DO0lBQUE7SUFBQSxJQURyQkMsNEJBQStELHVFQUFHdkIsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUVqRixNQUFNd0IscUJBQXFCLEdBQUd6USxnQkFBZ0IsQ0FBQ1UsK0JBQStCLENBQUNYLGlCQUFpQixDQUFDO0lBQ2pHLElBQUkyUSxhQUFhLDRCQUFHRCxxQkFBcUIsQ0FBQ0UsYUFBYSwwREFBbkMsc0JBQXFDRCxhQUFhO0lBQ3RFO0lBQ0EsSUFBSSxDQUFDNVEsa0JBQWtCLElBQUk0USxhQUFhLEtBQUtFLGFBQWEsQ0FBQ0MsSUFBSSxFQUFFO01BQ2hFLE9BQU9ELGFBQWEsQ0FBQ0MsSUFBSTtJQUMxQjtJQUNBLElBQUlDLHlCQUE4RCxHQUFHLEVBQUU7TUFDdEVDLDBCQUErRCxHQUFHLEVBQUU7SUFDckUsTUFBTXZRLGVBQWUsR0FBR0Msc0JBQXNCLENBQzdDVCxnQkFBZ0IsQ0FBQ1UsK0JBQStCLENBQUNYLGlCQUFpQixDQUFDLENBQUNZLE9BQU8sRUFDM0VYLGdCQUFnQixFQUNoQixFQUFFLEVBQ0ZpRCxTQUFTLEVBQ1QsS0FBSyxDQUNMO0lBQ0QsSUFBSStOLGlCQUFpQixFQUFFQyx3QkFBd0I7SUFDL0MsSUFBSWpSLGdCQUFnQixDQUFDa1IsZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQ0MsVUFBVSxFQUFFO01BQ25FSixpQkFBaUIsR0FBR2IsZUFBZSxDQUFDblEsZ0JBQWdCLENBQUNnSCxzQkFBc0IsRUFBRSxDQUFDO01BQzlFaUssd0JBQXdCLEdBQUdELGlCQUFpQixHQUFHSyxpQkFBaUIsQ0FBQ0wsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLEdBQUdBLGlCQUFpQjtJQUM5RztJQUVBLE1BQU1NLGdCQUF5QixHQUFHLENBQUNsRixVQUFVLENBQUNvRSw0QkFBNEIsQ0FBQyxJQUFJQSw0QkFBNEIsQ0FBQzlMLEtBQUssS0FBSyxLQUFLO0lBQzNILElBQUksQ0FBQ2dNLGFBQWEsSUFBSUEsYUFBYSxLQUFLRSxhQUFhLENBQUNXLElBQUksRUFBRTtNQUMzRGIsYUFBYSxHQUFHRSxhQUFhLENBQUNZLEtBQUs7SUFDcEM7SUFDQSxJQUFJRixnQkFBZ0IsRUFBRTtNQUNyQjtNQUNBWixhQUFhLEdBQUdBLGFBQWEsS0FBS0UsYUFBYSxDQUFDYSxNQUFNLEdBQUdiLGFBQWEsQ0FBQ2EsTUFBTSxHQUFHYixhQUFhLENBQUNZLEtBQUs7SUFDcEc7SUFFQSxJQUNDakMscUNBQXFDLENBQUN6UCxrQkFBa0IsRUFBRVUsZUFBZSxDQUFDRyxPQUFPLEVBQUVYLGdCQUFnQixDQUFDMEwsYUFBYSxFQUFFLENBQUMsSUFDcEhrRSxzQ0FBc0MsQ0FBQ3BQLGVBQWUsQ0FBQ0csT0FBTyxDQUFDLEVBQzlEO01BQ0QsT0FBTytQLGFBQWE7SUFDckI7SUFDQUkseUJBQXlCLEdBQUd6RCx3Q0FBd0MsQ0FDbkV2TixrQkFBa0IsRUFDbEJFLGdCQUFnQixDQUFDMEwsYUFBYSxFQUFFLEVBQ2hDMUwsZ0JBQWdCLENBQUNnSCxzQkFBc0IsRUFBRSxFQUN6Q3dHLFdBQVcsQ0FDWDtJQUNEdUQsMEJBQTBCLEdBQUdqQiw2Q0FBNkMsQ0FBQ3RQLGVBQWUsQ0FBQ0csT0FBTyxDQUFDOztJQUVuRztJQUNBLElBQ0NtUSx5QkFBeUIsQ0FBQzVMLE1BQU0sS0FBSyxDQUFDLElBQ3RDNkwsMEJBQTBCLENBQUM3TCxNQUFNLEtBQUssQ0FBQyxLQUN0Q3FMLGdDQUFnQyxJQUFJZSxnQkFBZ0IsQ0FBQyxFQUNyRDtNQUNELElBQUksQ0FBQzlELFdBQVcsRUFBRTtRQUNqQjtRQUNBLElBQUk4QyxrQkFBa0IsQ0FBQ0osV0FBVyxJQUFJZSx3QkFBd0IsS0FBSyxPQUFPLElBQUlLLGdCQUFnQixFQUFFO1VBQy9GO1VBQ0EsTUFBTUksMEJBQTBCLEdBQUdDLEVBQUUsQ0FDcENwQixnQ0FBZ0MsSUFBSSxJQUFJO1VBQUU7VUFDMUNDLDRCQUE0QixDQUM1QjtVQUNELE9BQU9hLGlCQUFpQixDQUN2Qk8sTUFBTSxDQUFDQyxHQUFHLENBQUNwSSxFQUFFLENBQUNxSSxVQUFVLEVBQUVKLDBCQUEwQixDQUFDLEVBQUV6QyxRQUFRLENBQUN5QixhQUFhLENBQUMsRUFBRXpCLFFBQVEsQ0FBQzJCLGFBQWEsQ0FBQ0MsSUFBSSxDQUFDLENBQUMsQ0FDN0c7UUFDRixDQUFDLE1BQU07VUFDTixPQUFPRCxhQUFhLENBQUNDLElBQUk7UUFDMUI7UUFDQTtNQUNELENBQUMsTUFBTSxJQUFJUyxnQkFBZ0IsRUFBRTtRQUM1QjtRQUNBLE9BQU9aLGFBQWE7TUFDckIsQ0FBQyxNQUFNLElBQUlKLGtCQUFrQixDQUFDSixXQUFXLElBQUlLLGdDQUFnQyxFQUFFO1FBQzlFLE9BQU9jLGlCQUFpQixDQUFDTyxNQUFNLENBQUNyQixnQ0FBZ0MsRUFBRXRCLFFBQVEsQ0FBQ3lCLGFBQWEsQ0FBQyxFQUFFekIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDN0c7TUFDRCxDQUFDLE1BQU07UUFDTixPQUFPMkIsYUFBYSxDQUFDQyxJQUFJO01BQzFCO01BQ0E7SUFDRCxDQUFDLE1BQU0sSUFBSSxDQUFDckQsV0FBVyxFQUFFO01BQ3hCO01BQ0EsSUFBSThDLGtCQUFrQixDQUFDSixXQUFXLElBQUllLHdCQUF3QixLQUFLLE9BQU8sSUFBSUssZ0JBQWdCLEVBQUU7UUFDL0Y7UUFDQSxNQUFNUyxrQ0FBa0MsR0FBR0gsTUFBTSxDQUNoRE4sZ0JBQWdCLElBQUksQ0FBQ2hCLGtCQUFrQixDQUFDSixXQUFXLEVBQ25ETSw0QkFBNEIsRUFDNUJ2QixRQUFRLENBQUMsSUFBSSxDQUFDLENBQ2Q7UUFDRCxPQUFPb0MsaUJBQWlCLENBQ3ZCTyxNQUFNLENBQ0xDLEdBQUcsQ0FBQ3BJLEVBQUUsQ0FBQ3FJLFVBQVUsRUFBRUMsa0NBQWtDLENBQUMsRUFDdEQ5QyxRQUFRLENBQUN5QixhQUFhLENBQUMsRUFDdkJrQixNQUFNLENBQ0xELEVBQUUsQ0FBQyxHQUFHYix5QkFBeUIsQ0FBQ2tCLE1BQU0sQ0FBQ2pCLDBCQUEwQixDQUFDLENBQUMsRUFDbkU5QixRQUFRLENBQUN5QixhQUFhLENBQUMsRUFDdkJ6QixRQUFRLENBQUMyQixhQUFhLENBQUNDLElBQUksQ0FBQyxDQUM1QixDQUNELENBQ0Q7TUFDRixDQUFDLE1BQU07UUFDTixPQUFPUSxpQkFBaUIsQ0FDdkJPLE1BQU0sQ0FDTEQsRUFBRSxDQUFDLEdBQUdiLHlCQUF5QixDQUFDa0IsTUFBTSxDQUFDakIsMEJBQTBCLENBQUMsQ0FBQyxFQUNuRTlCLFFBQVEsQ0FBQ3lCLGFBQWEsQ0FBQyxFQUN2QnpCLFFBQVEsQ0FBQzJCLGFBQWEsQ0FBQ0MsSUFBSSxDQUFDLENBQzVCLENBQ0Q7TUFDRjtNQUNBO0lBQ0QsQ0FBQyxNQUFNLElBQUlQLGtCQUFrQixDQUFDSixXQUFXLElBQUlvQixnQkFBZ0IsRUFBRTtNQUM5RDtNQUNBLE9BQU9aLGFBQWE7TUFDcEI7SUFDRCxDQUFDLE1BQU07TUFDTixPQUFPVyxpQkFBaUIsQ0FDdkJPLE1BQU0sQ0FDTEQsRUFBRSxDQUFDLEdBQUdiLHlCQUF5QixDQUFDa0IsTUFBTSxDQUFDakIsMEJBQTBCLENBQUMsRUFBRVAsNEJBQTRCLENBQUMsRUFDakd2QixRQUFRLENBQUN5QixhQUFhLENBQUMsRUFDdkJ6QixRQUFRLENBQUMyQixhQUFhLENBQUNDLElBQUksQ0FBQyxDQUM1QixDQUNEO0lBQ0Y7RUFDRDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUEE7RUFRQSxTQUFTMVEseUJBQXlCLENBQUNMLGtCQUE0QixFQUFFQyxpQkFBeUIsRUFBRUMsZ0JBQWtDLEVBQUU7SUFDL0gsTUFBTUssWUFBMEIsR0FBRyxFQUFFO0lBQ3JDLE1BQU1FLGtCQUFnQyxHQUFHLEVBQUU7SUFFM0MsTUFBTTBSLGFBQWEsR0FBR0MsYUFBYSxDQUNsQ3BTLGtCQUFrQixDQUFDcVMsTUFBTSxDQUFFekUsU0FBUyxJQUFLO01BQ3hDLE9BQU8wRSxxQkFBcUIsQ0FBQzFFLFNBQVMsQ0FBNEI7SUFDbkUsQ0FBQyxDQUFDLENBQ0Y7SUFFRCxNQUFNMkUsV0FBVyxHQUFHclMsZ0JBQWdCLENBQUMwTCxhQUFhLEVBQUUsQ0FBQzRHLGtCQUFrQjtJQUV2RSxJQUFJTCxhQUFhLEVBQUU7TUFBQTtNQUNsQjVSLFlBQVksQ0FBQzRFLElBQUksQ0FBQztRQUNqQk0sSUFBSSxFQUFFZ04sVUFBVSxDQUFDQyxJQUFJO1FBQ3JCQyxjQUFjLEVBQUV6UyxnQkFBZ0IsQ0FBQzBTLCtCQUErQixDQUFDVCxhQUFhLENBQUNLLGtCQUFrQixDQUFDO1FBQ2xHSyxHQUFHLEVBQUVDLFNBQVMsQ0FBQ0Msd0JBQXdCLENBQUNaLGFBQWEsQ0FBQztRQUN0RC9RLE9BQU8sRUFBRW1RLGlCQUFpQixDQUFDbEQsS0FBSyxDQUFDWSxXQUFXLENBQUMsMEJBQTBCLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDekY1TixPQUFPLEVBQUVrUSxpQkFBaUIsQ0FDekJ5QixHQUFHLENBQ0YzRSxLQUFLLENBQ0o0RSwyQkFBMkIsMEJBQzFCZCxhQUFhLENBQUM1TixXQUFXLG9GQUF6QixzQkFBMkJvRixFQUFFLDJEQUE3Qix1QkFBK0J5RSxNQUFNLEVBQ3JDLEVBQUUsRUFDRmpMLFNBQVMsRUFDVGpELGdCQUFnQixDQUFDZ1QsNEJBQTRCLEVBQUUsQ0FDL0MsRUFDRCxJQUFJLENBQ0osQ0FDRCxDQUNEO1FBQ0RDLElBQUksRUFBRSx5QkFBQWhCLGFBQWEsQ0FBQ2lCLEtBQUsseURBQW5CLHFCQUFxQnJLLFFBQVEsRUFBRSxLQUFJc0ssSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsQ0FBQ0MsT0FBTyxDQUFDLGVBQWUsQ0FBQztRQUM5R3hTLFdBQVcsRUFBRTtNQUNkLENBQUMsQ0FBQztJQUNIO0lBRUFmLGtCQUFrQixDQUNoQnFTLE1BQU0sQ0FBRXpFLFNBQVMsSUFBSztNQUN0QixPQUFPLENBQUMwRSxxQkFBcUIsQ0FBQzFFLFNBQVMsQ0FBdUI7SUFDL0QsQ0FBQyxDQUFDLENBQ0RwSyxPQUFPLENBQUVvSyxTQUFpQyxJQUFLO01BQUE7TUFDL0MsSUFBSSw0QkFBQUEsU0FBUyxDQUFDckosV0FBVyx1RkFBckIsd0JBQXVCb0YsRUFBRSx1RkFBekIsd0JBQTJCeUUsTUFBTSw0REFBakMsd0JBQW1DRCxPQUFPLEVBQUUsTUFBSyxJQUFJLEVBQUU7UUFDMUQxTixrQkFBa0IsQ0FBQzBFLElBQUksQ0FBQztVQUN2Qk0sSUFBSSxFQUFFZ04sVUFBVSxDQUFDZSxPQUFPO1VBQ3hCWCxHQUFHLEVBQUVDLFNBQVMsQ0FBQ0Msd0JBQXdCLENBQUNuRixTQUFTO1FBQ2xELENBQUMsQ0FBQztNQUNILENBQUMsTUFBTSxJQUNONkYsNEJBQTRCLENBQUM3RixTQUFTLENBQUMsSUFDdkMsdUJBQUFBLFNBQVMsQ0FBQ00sTUFBTSx1REFBaEIsbUJBQWtCQyxPQUFPLEVBQUUsTUFBSyxJQUFJLElBQ3BDLDBCQUFBUCxTQUFTLENBQUM4RixXQUFXLDBEQUFyQixzQkFBdUJ2RixPQUFPLEVBQUUsTUFBSyxJQUFJLEVBQ3hDO1FBQ0QsUUFBUVAsU0FBUyxDQUFDQyxLQUFLO1VBQ3RCO1lBQ0M7WUFDQTtZQUNBO1lBQ0E7WUFDQTtZQUNBLElBQUk4RixvQkFBb0IsR0FBRyxLQUFLO1lBQ2hDLElBQUksMkJBQUEvRixTQUFTLENBQUNFLFlBQVkscUZBQXRCLHVCQUF3QnZKLFdBQVcscUZBQW5DLHVCQUFxQzhPLElBQUksMkRBQXpDLHVCQUEyQ08sa0JBQWtCLE1BQUt6USxTQUFTLEVBQUU7Y0FBQTtjQUNoRixJQUFJLDRCQUFDeUssU0FBUyxDQUFDRSxZQUFZLG1EQUF0Qix1QkFBd0JDLE9BQU8sR0FBRTtnQkFDckM7Z0JBQ0E0RixvQkFBb0IsR0FBRyxJQUFJO2NBQzVCLENBQUMsTUFBTSxJQUFJLDBCQUFBL0YsU0FBUyxDQUFDRSxZQUFZLG1EQUF0Qix1QkFBd0JDLE9BQU8sSUFBSSwyQkFBQUgsU0FBUyxDQUFDRSxZQUFZLDJEQUF0Qix1QkFBd0IrRixVQUFVLE1BQUt0QixXQUFXLEVBQUU7Z0JBQ2pHO2dCQUNBb0Isb0JBQW9CLEdBQUcsSUFBSTtjQUM1QixDQUFDLE1BQU0sOEJBQUkvRixTQUFTLENBQUNFLFlBQVksbURBQXRCLHVCQUF3QmdHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQ0MsWUFBWSxFQUFFO2dCQUM5RDtnQkFDQUosb0JBQW9CLEdBQUcsSUFBSTtjQUM1QjtZQUNEO1lBRUEsTUFBTUssV0FBdUIsR0FBRztjQUMvQnZPLElBQUksRUFBRWdOLFVBQVUsQ0FBQ3dCLGtCQUFrQjtjQUNuQ3RCLGNBQWMsRUFBRXpTLGdCQUFnQixDQUFDMFMsK0JBQStCLENBQUNoRixTQUFTLENBQUM0RSxrQkFBa0IsQ0FBQztjQUM5RkssR0FBRyxFQUFFQyxTQUFTLENBQUNDLHdCQUF3QixDQUFDbkYsU0FBUyxDQUFDO2NBQ2xEdk0sT0FBTyxFQUFFa1EsaUJBQWlCLENBQ3pCeUIsR0FBRyxDQUNGM0UsS0FBSyxDQUNKNEUsMkJBQTJCLDRCQUMxQnJGLFNBQVMsQ0FBQ3JKLFdBQVcsdUZBQXJCLHdCQUF1Qm9GLEVBQUUsNERBQXpCLHdCQUEyQnlFLE1BQU0sRUFDakMsRUFBRSxFQUNGakwsU0FBUyxFQUNUakQsZ0JBQWdCLENBQUNnVCw0QkFBNEIsRUFBRSxDQUMvQyxFQUNELElBQUksQ0FDSixDQUNELENBQ0Q7Y0FDRG5TLFdBQVcsRUFBRTtZQUNkLENBQUM7WUFFRCxJQUFJNFMsb0JBQW9CLEVBQUU7Y0FDekJLLFdBQVcsQ0FBQzVTLE9BQU8sR0FBRzhTLDZCQUE2QixDQUFDaFUsZ0JBQWdCLEVBQUUwTixTQUFTLENBQUNFLFlBQVksQ0FBQztZQUM5RjtZQUNBdk4sWUFBWSxDQUFDNEUsSUFBSSxDQUFDNk8sV0FBVyxDQUFDO1lBQzlCO1VBRUQ7WUFDQ3pULFlBQVksQ0FBQzRFLElBQUksQ0FBQztjQUNqQk0sSUFBSSxFQUFFZ04sVUFBVSxDQUFDMEIsaUNBQWlDO2NBQ2xEeEIsY0FBYyxFQUFFelMsZ0JBQWdCLENBQUMwUywrQkFBK0IsQ0FBQ2hGLFNBQVMsQ0FBQzRFLGtCQUFrQixDQUFDO2NBQzlGSyxHQUFHLEVBQUVDLFNBQVMsQ0FBQ0Msd0JBQXdCLENBQUNuRixTQUFTLENBQUM7Y0FDbER2TSxPQUFPLEVBQUVrUSxpQkFBaUIsQ0FDekJ5QixHQUFHLENBQ0YzRSxLQUFLLENBQ0o0RSwyQkFBMkIsNEJBQzFCckYsU0FBUyxDQUFDckosV0FBVyx1RkFBckIsd0JBQXVCb0YsRUFBRSw0REFBekIsd0JBQTJCeUUsTUFBTSxFQUNqQyxFQUFFLEVBQ0ZqTCxTQUFTLEVBQ1RqRCxnQkFBZ0IsQ0FBQ2dULDRCQUE0QixFQUFFLENBQy9DLEVBQ0QsSUFBSSxDQUNKLENBQ0Q7WUFFSCxDQUFDLENBQUM7WUFDRjtVQUNEO1lBQ0M7UUFBTTtNQUVUO0lBQ0QsQ0FBQyxDQUFDO0lBRUgsT0FBTztNQUNOM1MsWUFBWTtNQUNaRTtJQUNELENBQUM7RUFDRjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTMlQsc0JBQXNCLENBQzlCQyxxQkFBeUcsRUFDekdDLGlCQUEwQixFQUMxQkMsZ0JBQTZCLEVBQ1c7SUFDeEMsSUFBSUMsNkJBQWtGLEdBQUdDLFdBQVcsQ0FBQzFELElBQUk7SUFDekcsSUFBSXNELHFCQUFxQixFQUFFO01BQzFCLElBQUksT0FBT0EscUJBQXFCLEtBQUssUUFBUSxFQUFFO1FBQzlDRyw2QkFBNkIsR0FBR3ZCLDJCQUEyQixDQUFDb0IscUJBQXFCLENBQTBDO01BQzVILENBQUMsTUFBTTtRQUNOO1FBQ0FHLDZCQUE2QixHQUFHRSxpQ0FBaUMsQ0FBQ0wscUJBQXFCLENBQUM7TUFDekY7SUFDRDtJQUVBLE1BQU1NLFlBQTZDLEdBQUcsRUFBRTtJQUN4REosZ0JBQWdCLGFBQWhCQSxnQkFBZ0IsdUJBQWhCQSxnQkFBZ0IsQ0FBRXZOLElBQUksQ0FBQ3hELE9BQU8sQ0FBRXFQLEdBQUcsSUFBSztNQUN2QyxJQUFJQSxHQUFHLENBQUN6TyxJQUFJLEtBQUssZ0JBQWdCLEVBQUU7UUFDbEN1USxZQUFZLENBQUN4UCxJQUFJLENBQUM4SixXQUFXLENBQUM0RCxHQUFHLENBQUN6TyxJQUFJLEVBQUVqQixTQUFTLENBQUMsQ0FBQztNQUNwRDtJQUNELENBQUMsQ0FBQztJQUVGLE9BQU95UixZQUFZLENBQ2xCLENBQ0NKLDZCQUE2QixFQUM3QnZGLFdBQVcsQ0FBRSxrQkFBaUIsRUFBRSxVQUFVLENBQUMsRUFDM0NxRixpQkFBaUIsSUFBSU8sTUFBTSxDQUFDQyxTQUFTLEVBQ3JDUixpQkFBaUIsSUFBSU8sTUFBTSxDQUFDRSxRQUFRLEVBQ25DLEdBQUVULGlCQUFrQixFQUFDLEVBQ3RCLEdBQUdLLFlBQVksQ0FDZixFQUNESyxlQUFlLENBQUNDLGVBQWUsRUFDL0JWLGdCQUFnQixDQUNoQjtFQUNGO0VBRUEsU0FBU1cscUJBQXFCLENBQzdCbFYsa0JBQXdDLEVBQ3hDbVYsMEJBQXFELEVBQ3JEalYsZ0JBQWtDLEVBQ2xDQyxrQkFBbUQsRUFDbkRGLGlCQUF5QixFQUNnQjtJQUFBO0lBQ3pDLE1BQU1tVixVQUFVLEdBQUcsQ0FBQWpWLGtCQUFrQixhQUFsQkEsa0JBQWtCLHVCQUFsQkEsa0JBQWtCLENBQUVrVixNQUFNLE1BQUlsVixrQkFBa0IsYUFBbEJBLGtCQUFrQix1QkFBbEJBLGtCQUFrQixDQUFFbVYsTUFBTTtJQUMzRSxNQUFNM0UscUJBQWlELEdBQUd6USxnQkFBZ0IsQ0FBQ1UsK0JBQStCLENBQUNYLGlCQUFpQixDQUFDO0lBQzdILE1BQU1zVixxQkFBcUIsR0FBSTVFLHFCQUFxQixJQUFJQSxxQkFBcUIsQ0FBQ0UsYUFBYSxJQUFLLENBQUMsQ0FBQztJQUNsRztJQUNBLElBQUl1RSxVQUFVLGFBQVZBLFVBQVUsZUFBVkEsVUFBVSxDQUFFSSxRQUFRLElBQUlKLFVBQVUsQ0FBQ0ssY0FBYyxJQUFJdFYsa0JBQWtCLGFBQWxCQSxrQkFBa0IsZUFBbEJBLGtCQUFrQixDQUFFa1YsTUFBTSxFQUFFO01BQ3BGLE9BQU87UUFDTjdMLElBQUksRUFBRSxVQUFVO1FBQ2hCZ00sUUFBUSxFQUFFSixVQUFVLENBQUNJLFFBQVE7UUFDN0JDLGNBQWMsRUFBRUwsVUFBVSxDQUFDSyxjQUFjO1FBQ3pDdFYsa0JBQWtCLEVBQUVBO01BQ3JCLENBQUM7SUFDRjtJQUVBLElBQUl1VixTQUFTO0lBQ2IsSUFBSTFWLGtCQUFrQixFQUFFO01BQUE7TUFDdkI7TUFDQSxNQUFNMlYsaUJBQWlCLDhCQUFHelYsZ0JBQWdCLENBQUNnTSxZQUFZLEVBQUUsNERBQS9CLHdCQUFpQzNILFdBQVc7TUFDdEUsTUFBTXFSLHVCQUF1QixHQUFHRCxpQkFBaUIsYUFBakJBLGlCQUFpQix1QkFBakJBLGlCQUFpQixDQUFFdk4sTUFBcUM7UUFDdkZ5Tix3QkFBd0IsR0FBR0YsaUJBQWlCLGFBQWpCQSxpQkFBaUIsdUJBQWpCQSxpQkFBaUIsQ0FBRUcsT0FBdUM7TUFDdEZKLFNBQVMsR0FBRyxDQUFBRSx1QkFBdUIsYUFBdkJBLHVCQUF1QixnREFBdkJBLHVCQUF1QixDQUFFRyxTQUFTLDBEQUFsQyxzQkFBb0NDLFNBQVMsTUFBSUgsd0JBQXdCLGFBQXhCQSx3QkFBd0IsZ0RBQXhCQSx3QkFBd0IsQ0FBRUksc0JBQXNCLDBEQUFoRCxzQkFBa0RELFNBQVM7TUFFeEgsSUFBSWIsMEJBQTBCLENBQUNlLFlBQVksS0FBS0MsWUFBWSxDQUFDQyxXQUFXLElBQUlWLFNBQVMsRUFBRTtRQUN0RjtRQUNBLE1BQU1XLEtBQUssQ0FBRSxrQkFBaUJGLFlBQVksQ0FBQ0MsV0FBWSxpREFBZ0RWLFNBQVUsR0FBRSxDQUFDO01BQ3JIO01BQ0EsSUFBSU4sVUFBVSxhQUFWQSxVQUFVLGVBQVZBLFVBQVUsQ0FBRWtCLEtBQUssRUFBRTtRQUFBO1FBQ3RCO1FBQ0EsT0FBTztVQUNOOU0sSUFBSSxFQUFFMkwsMEJBQTBCLENBQUNlLFlBQVk7VUFDN0NLLE1BQU0sRUFBRXBCLDBCQUEwQixDQUFDcUIsV0FBVztVQUM5Q2QsU0FBUyxnQkFBRUEsU0FBUywrQ0FBVCxXQUFXM00sUUFBUSxFQUFFO1VBQ2hDME4sZ0JBQWdCLEVBQUV0QiwwQkFBMEIsQ0FBQ2UsWUFBWSxLQUFLQyxZQUFZLENBQUNPLE9BQU8sR0FBR3RCLFVBQVUsQ0FBQ2tCLEtBQUssR0FBR25ULFNBQVMsQ0FBQztRQUNuSCxDQUFDO01BQ0Y7SUFDRDs7SUFFQTtJQUNBLElBQUlnUywwQkFBMEIsQ0FBQ2UsWUFBWSxLQUFLQyxZQUFZLENBQUNPLE9BQU8sRUFBRTtNQUFBO01BQ3JFdkIsMEJBQTBCLENBQUNlLFlBQVksR0FBR0MsWUFBWSxDQUFDakksTUFBTTtNQUM3RDtNQUNBLElBQUksMEJBQUFxSCxxQkFBcUIsQ0FBQ1csWUFBWSwwREFBbEMsc0JBQW9DTSxXQUFXLE1BQUtyVCxTQUFTLEVBQUU7UUFDbEVnUywwQkFBMEIsQ0FBQ3FCLFdBQVcsR0FBRyxLQUFLO01BQy9DO0lBQ0Q7SUFFQSxPQUFPO01BQ05oTixJQUFJLEVBQUUyTCwwQkFBMEIsQ0FBQ2UsWUFBWTtNQUM3Q0ssTUFBTSxFQUFFcEIsMEJBQTBCLENBQUNxQixXQUFXO01BQzlDZCxTQUFTLGlCQUFFQSxTQUFTLGdEQUFULFlBQVczTSxRQUFRO0lBQy9CLENBQUM7RUFDRjtFQUVBLE1BQU00Tiw0QkFBNEIsR0FBRyxVQUNwQzNXLGtCQUF3QyxFQUN4Q0UsZ0JBQWtDLEVBQ2xDQyxrQkFBbUQsRUFDbkR5VyxVQUFrQixFQUNsQkMsU0FBb0IsRUFDbkI7SUFDRCxJQUFJQyxhQUFhLEVBQUVDLGdCQUFnQjtJQUNuQyxJQUFJQyxtQkFBMEQsR0FBRzdILFFBQVEsQ0FBQ3NGLFdBQVcsQ0FBQzFELElBQUksQ0FBQztJQUMzRixNQUFNd0QsZ0JBQWdCLEdBQUdyVSxnQkFBZ0IsQ0FBQzBMLGFBQWEsRUFBRTtJQUN6RCxJQUFJekwsa0JBQWtCLElBQUlILGtCQUFrQixFQUFFO01BQUE7TUFDN0MrVyxnQkFBZ0IsR0FBRywwQkFBQTVXLGtCQUFrQixDQUFDOFcsT0FBTywwREFBMUIsc0JBQTRCQyxNQUFNLGdDQUFJL1csa0JBQWtCLENBQUNtVixNQUFNLDJEQUF6Qix1QkFBMkJFLFFBQVE7TUFDNUYsTUFBTWxPLGVBQWUsR0FBR3BILGdCQUFnQixDQUFDZ00sWUFBWSxFQUFFO01BQ3ZEOEssbUJBQW1CLEdBQUc1QyxzQkFBc0IsMEJBQzNDcFUsa0JBQWtCLENBQUN1RSxXQUFXLG9GQUE5QixzQkFBZ0NvRixFQUFFLDJEQUFsQyx1QkFBb0N3TixXQUFXLEVBQy9DLENBQUMsQ0FBQ0MsV0FBVyxDQUFDQyxZQUFZLENBQUMvUCxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM4UCxXQUFXLENBQUNFLFlBQVksQ0FBQ2hRLGVBQWUsQ0FBQyxFQUMxRmlOLGdCQUFnQixDQUNoQjtNQUNELElBQUl3QyxnQkFBZ0IsRUFBRTtRQUNyQkQsYUFBYSxHQUNaLDBEQUEwRCxHQUFHQyxnQkFBZ0IsR0FBRyxtQ0FBbUM7TUFDckg7TUFDQSxJQUFJLENBQUNBLGdCQUFnQiw4QkFBSTVXLGtCQUFrQixDQUFDbVYsTUFBTSxtREFBekIsdUJBQTJCZ0IsS0FBSyxFQUFFO1FBQzFEUSxhQUFhLEdBQ1osOEdBQThHLEdBQzlHRixVQUFVLEdBQ1YsZ0JBQWdCLElBQ2ZRLFdBQVcsQ0FBQ0MsWUFBWSxDQUFDL1AsZUFBZSxDQUFDLElBQUk4UCxXQUFXLENBQUNFLFlBQVksQ0FBQ2hRLGVBQWUsQ0FBQyxHQUNwRiw4REFBOEQsR0FDOUQsV0FBVyxDQUFDLElBQ2R1UCxTQUFTLEtBQUssaUJBQWlCLElBQUlBLFNBQVMsS0FBSyxXQUFXLEdBQUcsMEJBQTBCLEdBQUcsRUFBRSxDQUFDLEdBQ2hHLElBQUksQ0FBQyxDQUFDO01BQ1I7SUFDRDs7SUFDQSxNQUFNVSxzQkFBeUQsR0FBRzNDLFlBQVksQ0FDN0UsQ0FBQzNGLFdBQVcsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFDLENBQUMsRUFDekMrRixlQUFlLENBQUN3QyxZQUFZLEVBQzVCakQsZ0JBQWdCLENBQ2hCO0lBQ0QsT0FBTztNQUNOa0QsS0FBSyxFQUFFWCxhQUFhO01BQ3BCL0csTUFBTSxFQUFFK0csYUFBYSxHQUFHLFlBQVksR0FBRzNULFNBQVM7TUFDaEQ4UixlQUFlLEVBQUUxRCxpQkFBaUIsQ0FBQ3lGLG1CQUFtQixDQUFDO01BQ3ZEVSxZQUFZLEVBQUVuRyxpQkFBaUIsQ0FBQ2dHLHNCQUFzQixDQUFDO01BQ3ZEbFcsT0FBTyxFQUFFa1EsaUJBQWlCLENBQUN5QixHQUFHLENBQUNySixFQUFFLENBQUNnTyxVQUFVLENBQUM7SUFDOUMsQ0FBQztFQUNGLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sTUFBTWhNLHdCQUF3QixHQUFHLFVBQ3ZDaU0sa0JBQTRDLEVBQzVDblYsVUFBc0IsRUFNSTtJQUFBLElBTDFCYixpQkFBMEMsdUVBQUcsRUFBRTtJQUFBLElBQy9DaVcsa0JBQTRCO0lBQUEsSUFDNUIzWCxnQkFBa0M7SUFBQSxJQUNsQzJXLFNBQW9CO0lBQUEsSUFDcEJpQixpQ0FBMkM7SUFFM0MsTUFBTXBWLFlBQXFDLEdBQUdkLGlCQUFpQjtJQUMvRDtJQUNBLE1BQU1lLGlCQUFpQixHQUFHLElBQUlDLGlCQUFpQixDQUFDSCxVQUFVLEVBQUV2QyxnQkFBZ0IsQ0FBQztJQUU3RXVDLFVBQVUsQ0FBQ3lCLGdCQUFnQixDQUFDVixPQUFPLENBQUVXLFFBQWtCLElBQUs7TUFDM0Q7TUFDQSxNQUFNNFQsTUFBTSxHQUFHblcsaUJBQWlCLENBQUMwTixJQUFJLENBQUV0TSxNQUFNLElBQUs7UUFDakQsT0FBT0EsTUFBTSxDQUFDb0IsSUFBSSxLQUFLRCxRQUFRLENBQUNDLElBQUk7TUFDckMsQ0FBQyxDQUFDOztNQUVGO01BQ0EsSUFBSSxDQUFDRCxRQUFRLENBQUM2VCxVQUFVLElBQUksQ0FBQ0QsTUFBTSxFQUFFO1FBQ3BDLE1BQU1FLHFCQUEwQyxHQUFHQyx3QkFBd0IsQ0FDMUUvVCxRQUFRLENBQUNDLElBQUksRUFDYkQsUUFBUSxFQUNSakUsZ0JBQWdCLEVBQ2hCLElBQUksRUFDSjJXLFNBQVMsQ0FDVDtRQUNELE1BQU1zQixvQkFBOEIsR0FBR3BSLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDaVIscUJBQXFCLENBQUNsTCxVQUFVLENBQUM7UUFDcEYsTUFBTXFMLHVCQUFpQyxHQUFHclIsTUFBTSxDQUFDQyxJQUFJLENBQUNpUixxQkFBcUIsQ0FBQ0ksb0JBQW9CLENBQUM7UUFDakcsSUFBSUoscUJBQXFCLENBQUNLLG9DQUFvQyxDQUFDbFQsTUFBTSxHQUFHLENBQUMsRUFBRTtVQUMxRTtVQUNBMFMsaUNBQWlDLENBQUMzUyxJQUFJLENBQUMsR0FBRzhTLHFCQUFxQixDQUFDSyxvQ0FBb0MsQ0FBQztRQUN0RztRQUNBLE1BQU1DLFVBQVUsR0FBR0MsK0JBQStCLENBQ2pEclUsUUFBUSxFQUNSakUsZ0JBQWdCLENBQUMwUywrQkFBK0IsQ0FBQ3pPLFFBQVEsQ0FBQ3FPLGtCQUFrQixDQUFDLEVBQzdFck8sUUFBUSxDQUFDQyxJQUFJLEVBQ2IsSUFBSSxFQUNKLElBQUksRUFDSnlULGtCQUFrQixFQUNsQmxWLGlCQUFpQixFQUNqQnpDLGdCQUFnQixFQUNoQjRYLGlDQUFpQyxDQUNqQztRQUVELElBQUlLLG9CQUFvQixDQUFDL1MsTUFBTSxHQUFHLENBQUMsRUFBRTtVQUNwQ21ULFVBQVUsQ0FBQ3JWLGFBQWEsR0FBR2lWLG9CQUFvQjtVQUMvQ0ksVUFBVSxDQUFDRSxjQUFjLEdBQUc7WUFDM0IsR0FBR0YsVUFBVSxDQUFDRSxjQUFjO1lBQzVCQyxRQUFRLEVBQUVULHFCQUFxQixDQUFDVSxzQkFBc0I7WUFDdERDLElBQUksRUFBRVgscUJBQXFCLENBQUNZO1VBQzdCLENBQUM7VUFDRE4sVUFBVSxDQUFDRSxjQUFjLENBQUNoVCxJQUFJLEdBQUdxVCxrQkFBa0IsQ0FBQzNVLFFBQVEsQ0FBQ3NCLElBQUksRUFBRTBTLG9CQUFvQixDQUFDL1MsTUFBTSxHQUFHLENBQUMsQ0FBQztVQUVuRyxJQUFJNlMscUJBQXFCLENBQUNjLGNBQWMsRUFBRTtZQUN6Q1IsVUFBVSxDQUFDRSxjQUFjLENBQUNPLFlBQVksR0FBR2YscUJBQXFCLENBQUNjLGNBQWM7WUFDN0VSLFVBQVUsQ0FBQ0UsY0FBYyxDQUFDaFQsSUFBSSxHQUFHLFVBQVUsQ0FBQyxDQUFDO1VBQzlDLENBQUMsTUFBTSxJQUFJd1MscUJBQXFCLENBQUNnQixnQkFBZ0IsRUFBRTtZQUNsRFYsVUFBVSxDQUFDRSxjQUFjLENBQUMvVSxJQUFJLEdBQUd1VSxxQkFBcUIsQ0FBQ2dCLGdCQUFnQjtVQUN4RTtVQUNBLElBQUloQixxQkFBcUIsQ0FBQ2lCLGtCQUFrQixFQUFFO1lBQzdDWCxVQUFVLENBQUNFLGNBQWMsQ0FBQ1UsZ0JBQWdCLEdBQUdsQixxQkFBcUIsQ0FBQ2lCLGtCQUFrQjtZQUNyRlgsVUFBVSxDQUFDRSxjQUFjLENBQUNXLEdBQUcsR0FBRyxLQUFLO1VBQ3RDLENBQUMsTUFBTSxJQUFJbkIscUJBQXFCLENBQUNvQixvQkFBb0IsRUFBRTtZQUN0RGQsVUFBVSxDQUFDRSxjQUFjLENBQUM1UCxRQUFRLEdBQUdvUCxxQkFBcUIsQ0FBQ29CLG9CQUFvQjtVQUNoRjtVQUNBLElBQUlwQixxQkFBcUIsQ0FBQ3FCLDBCQUEwQixFQUFFO1lBQ3JEZixVQUFVLENBQUNlLDBCQUEwQixHQUFHckIscUJBQXFCLENBQUNxQiwwQkFBMEI7WUFDeEZmLFVBQVUsQ0FBQ0UsY0FBYyxDQUFDaFQsSUFBSSxHQUFHLFFBQVE7VUFDMUM7O1VBRUE7VUFDQTBTLG9CQUFvQixDQUFDM1UsT0FBTyxDQUFFWSxJQUFJLElBQUs7WUFDdEN3VCxrQkFBa0IsQ0FBQ3hULElBQUksQ0FBQyxHQUFHNlQscUJBQXFCLENBQUNsTCxVQUFVLENBQUMzSSxJQUFJLENBQUM7VUFDbEUsQ0FBQyxDQUFDO1FBQ0g7UUFFQSxJQUFJZ1UsdUJBQXVCLENBQUNoVCxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ3ZDbVQsVUFBVSxDQUFDZ0IsdUJBQXVCLEdBQUduQix1QkFBdUI7VUFDNUQ7VUFDQUEsdUJBQXVCLENBQUM1VSxPQUFPLENBQUVZLElBQUksSUFBSztZQUN6QztZQUNBd1Qsa0JBQWtCLENBQUN4VCxJQUFJLENBQUMsR0FBRzZULHFCQUFxQixDQUFDSSxvQkFBb0IsQ0FBQ2pVLElBQUksQ0FBQztVQUM1RSxDQUFDLENBQUM7UUFDSDtRQUNBMUIsWUFBWSxDQUFDeUMsSUFBSSxDQUFDb1QsVUFBVSxDQUFDO01BQzlCO01BQ0E7TUFDQTtNQUNBO01BQ0EsSUFBSXRQLGNBQWMsQ0FBQzlFLFFBQVEsQ0FBQyxLQUFLLGFBQWEsRUFBRTtRQUMvQzBULGtCQUFrQixHQUFHQSxrQkFBa0IsQ0FBQzNGLE1BQU0sQ0FBQy9OLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDO1FBQzdEMUIsWUFBWSxDQUFDeUMsSUFBSSxDQUNoQnFULCtCQUErQixDQUM5QnJVLFFBQVEsRUFDUmpFLGdCQUFnQixDQUFDMFMsK0JBQStCLENBQUN6TyxRQUFRLENBQUNxTyxrQkFBa0IsQ0FBQyxFQUM3RXJPLFFBQVEsQ0FBQ0MsSUFBSSxFQUNiLEtBQUssRUFDTCxLQUFLLEVBQ0x5VCxrQkFBa0IsRUFDbEJsVixpQkFBaUIsRUFDakJ6QyxnQkFBZ0IsRUFDaEIsRUFBRSxDQUNGLENBQ0Q7TUFDRjtJQUNELENBQUMsQ0FBQzs7SUFFRjtJQUNBLE1BQU1zWixjQUFjLEdBQUdDLHFCQUFxQixDQUMzQzdCLGtCQUFrQixFQUNsQmxWLFlBQVksRUFDWm1WLGtCQUFrQixFQUNsQjNYLGdCQUFnQixFQUNoQnVDLFVBQVUsRUFDVnFWLGlDQUFpQyxDQUNqQztJQUVELE9BQU9wVixZQUFZLENBQUN3UCxNQUFNLENBQUNzSCxjQUFjLENBQUM7RUFDM0MsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkE7RUFjQSxNQUFNaEIsK0JBQStCLEdBQUcsVUFDdkNyVSxRQUFrQixFQUNsQnVWLGdCQUF3QixFQUN4QnRXLFlBQW9CLEVBQ3BCdVcsa0JBQTJCLEVBQzNCQyxzQkFBK0IsRUFDL0IvQixrQkFBNEIsRUFDNUJsVixpQkFBb0MsRUFDcEN6QyxnQkFBa0MsRUFDbEM0WCxpQ0FBMkMsRUFDbkI7SUFBQTtJQUN4QixNQUFNMVQsSUFBSSxHQUFHdVYsa0JBQWtCLEdBQUd2VyxZQUFZLEdBQUksYUFBWUEsWUFBYSxFQUFDO0lBQzVFLE1BQU15UCxHQUFHLEdBQUcsQ0FBQzhHLGtCQUFrQixHQUFHLGFBQWEsR0FBRyxZQUFZLElBQUlFLG1CQUFtQixDQUFDelcsWUFBWSxDQUFDO0lBQ25HLE1BQU0wVyw0QkFBNEIsR0FBR0MscUJBQXFCLENBQUM3WixnQkFBZ0IsRUFBRWlFLFFBQVEsQ0FBQztJQUN0RixNQUFNNlYsUUFBUSxHQUFHLDBCQUFBN1YsUUFBUSxDQUFDSSxXQUFXLG9GQUFwQixzQkFBc0JvRixFQUFFLHFGQUF4Qix1QkFBMEJ5RSxNQUFNLDJEQUFoQyx1QkFBa0NELE9BQU8sRUFBRSxNQUFLLElBQUk7SUFDckUsTUFBTThMLFNBQTZCLEdBQUc5VixRQUFRLENBQUNDLElBQUksR0FBRzhWLGFBQWEsQ0FBQy9WLFFBQVEsQ0FBQ0MsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsR0FBR2pCLFNBQVM7SUFDM0csTUFBTWdYLE9BQWdCLEdBQUdGLFNBQVMsSUFBSTlWLFFBQVEsQ0FBQ0MsSUFBSTtJQUNuRCxNQUFNZ1csVUFBa0IsR0FBR3RCLGtCQUFrQixDQUFDM1UsUUFBUSxDQUFDc0IsSUFBSSxDQUFDO0lBQzVELE1BQU00VSxnQkFBb0MsR0FBR2xXLFFBQVEsQ0FBQ3NCLElBQUksS0FBSyxVQUFVLEdBQUcsWUFBWSxHQUFHdEMsU0FBUztJQUNwRyxNQUFNbVgsUUFBNEIsR0FBR0Msb0JBQW9CLENBQUNwVyxRQUFRLENBQUM7SUFDbkUsTUFBTXFXLGtCQUFrQixHQUFHQyxhQUFhLENBQUN0VyxRQUFRLEVBQUVtVyxRQUFRLENBQUM7SUFDNUQsTUFBTTlPLFlBQXlCLEdBQUd0TCxnQkFBZ0IsQ0FBQ3dhLG9CQUFvQixDQUFDLFFBQVEsZ0RBQXFDLENBQ3BIeGEsZ0JBQWdCLENBQUMwTCxhQUFhLEVBQUUsQ0FDaEMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNMLE1BQU0rTyxpQ0FBaUMsR0FDdEM3QyxpQ0FBaUMsSUFBSUEsaUNBQWlDLENBQUMzUixPQUFPLENBQUMvQyxZQUFZLENBQUMsSUFBSSxDQUFDO0lBQ2xHLE1BQU13WCxRQUFRLEdBQUcsQ0FBQyxDQUFDWixRQUFRLElBQUlXLGlDQUFpQyxLQUFLOUMsa0JBQWtCLENBQUMxUixPQUFPLENBQUMvQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDcEgsTUFBTXlYLFVBQVUsR0FBRztNQUNsQkMsU0FBUyxFQUFFM1csUUFBUSxDQUFDc0IsSUFBSSxJQUFJNlUsUUFBUTtNQUNwQy9YLGFBQWEsRUFBRWlZLGtCQUFrQixDQUFDalksYUFBYTtNQUMvQ3dZLFdBQVcsRUFBRVAsa0JBQWtCLENBQUNPO0lBQ2pDLENBQUM7SUFDRCxJQUFJdEMsY0FBMkMsR0FBRyxJQUFJO0lBQ3RELElBQUl1QyxtQkFBbUIsQ0FBQzdXLFFBQVEsQ0FBQyxFQUFFO01BQUE7TUFDbEMsTUFBTTZVLFlBQVksR0FBR2pSLDZCQUE2QixDQUFDNUQsUUFBUSxDQUFDLElBQUk2RCx5QkFBeUIsQ0FBQzdELFFBQVEsQ0FBQztNQUNuRyxNQUFNZ1YsZ0JBQWdCLEdBQUdqUiw2QkFBNkIsQ0FBQy9ELFFBQVEsQ0FBQztNQUNoRSxNQUFNd0UsUUFBUSxHQUFHLDJCQUFBeEUsUUFBUSxDQUFDSSxXQUFXLHFGQUFwQix1QkFBc0JpRSxRQUFRLDJEQUE5Qix1QkFBZ0NDLFdBQVcsZ0NBQUl0RSxRQUFRLENBQUNJLFdBQVcscUZBQXBCLHVCQUFzQmlFLFFBQVEsMkRBQTlCLHVCQUFnQ0UsSUFBSTtNQUNwRyxNQUFNSSxZQUFZLDZCQUFHM0UsUUFBUSxDQUFDSSxXQUFXLHFGQUFwQix1QkFBc0I2RCxNQUFNLDJEQUE1Qix1QkFBOEJDLFFBQVE7TUFFM0RvUSxjQUFjLEdBQUc7UUFDaEJoVCxJQUFJLEVBQUUyVSxVQUFVO1FBQ2hCYSxXQUFXLEVBQUVaLGdCQUFnQjtRQUM3QmEsS0FBSyxFQUFFL1csUUFBUSxDQUFDK1csS0FBSztRQUNyQkMsU0FBUyxFQUFFaFgsUUFBUSxDQUFDc0IsSUFBSSxLQUFLO01BQzlCLENBQUM7TUFFRCxJQUFJdVQsWUFBWSxFQUFFO1FBQ2pCUCxjQUFjLENBQUNPLFlBQVksR0FBR0EsWUFBWSxDQUFDNVUsSUFBSTtRQUMvQ3FVLGNBQWMsQ0FBQ2hULElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQztNQUNuQyxDQUFDLE1BQU0sSUFBSWtELFFBQVEsRUFBRTtRQUNwQjhQLGNBQWMsQ0FBQy9VLElBQUksR0FBSSxHQUFFaUYsUUFBUyxFQUFDO01BQ3BDO01BQ0EsSUFBSXdRLGdCQUFnQixFQUFFO1FBQ3JCVixjQUFjLENBQUNVLGdCQUFnQixHQUFHQSxnQkFBZ0IsQ0FBQy9VLElBQUk7UUFDdkRxVSxjQUFjLENBQUNXLEdBQUcsR0FBRyxLQUFLO01BQzNCLENBQUMsTUFBTSxJQUFJdFEsWUFBWSxFQUFFO1FBQ3hCMlAsY0FBYyxDQUFDNVAsUUFBUSxHQUFHQyxZQUFZLENBQUNDLFFBQVEsRUFBRTtNQUNsRDtJQUNEO0lBRUEsTUFBTXFTLGlDQUF1RCxHQUFHQyxxQ0FBcUMsQ0FBQ2pZLFlBQVksRUFBRWxELGdCQUFnQixDQUFDO0lBRXJJLE1BQU04QyxNQUE2QixHQUFHO01BQ3JDNlAsR0FBRyxFQUFFQSxHQUFHO01BQ1JwTixJQUFJLEVBQUUzRixVQUFVLENBQUN3YixVQUFVO01BQzNCQyxLQUFLLEVBQUVDLFFBQVEsQ0FBQ3JYLFFBQVEsRUFBRWdXLE9BQU8sQ0FBQztNQUNsQ3NCLFVBQVUsRUFBRXRCLE9BQU8sR0FBR3FCLFFBQVEsQ0FBQ3JYLFFBQVEsQ0FBQyxHQUFHaEIsU0FBUztNQUNwRHVZLEtBQUssRUFBRXZCLE9BQU8sR0FBR0YsU0FBUyxHQUFHOVcsU0FBUztNQUN0Q3dQLGNBQWMsRUFBRStHLGdCQUFnQjtNQUNoQ2lDLGtCQUFrQixFQUFFN0IsNEJBQTRCO01BQ2hEelgsWUFBWSxFQUFFLENBQUN1WCxzQkFBc0IsSUFBSUksUUFBUSxHQUFHLFFBQVEsR0FBRyxZQUFZO01BQzNFNVYsSUFBSSxFQUFFQSxJQUFJO01BQ1ZoQixZQUFZLEVBQUVBLFlBQVk7TUFDMUJ3WCxRQUFRLEVBQUVBLFFBQVE7TUFDbEJnQixXQUFXLEVBQUVqWixpQkFBaUIsQ0FBQ1Usb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUNWLGlCQUFpQixDQUFDa1osbUJBQW1CLENBQUMxWCxRQUFRLENBQUMsR0FBR3lXLFFBQVE7TUFDcEhrQixLQUFLLEVBQUUzWCxRQUFRLENBQUMyWCxLQUFLO01BQ3JCckQsY0FBYyxFQUFFQSxjQUFjO01BQzlCc0QsYUFBYSxFQUFFQyx3QkFBd0IsQ0FBQzliLGdCQUFnQixDQUFDO01BQ3pEMmEsVUFBVSxFQUFFQSxVQUFnQztNQUM1QzFZLFVBQVUsRUFBRThaLGFBQWEsNEJBQUM5WCxRQUFRLENBQUNJLFdBQVcsdUZBQXBCLHdCQUFzQm9GLEVBQUUsNERBQXhCLHdCQUEwQnVTLGdCQUFnQixFQUFFMVEsWUFBWSxDQUFDO01BQ25GMlEsZ0JBQWdCLEVBQUVmO0lBQ25CLENBQUM7SUFDRCxNQUFNZ0IsUUFBUSxHQUFHQyxXQUFXLENBQUNsWSxRQUFRLENBQUMsSUFBSXFYLFFBQVEsQ0FBQ3JYLFFBQVEsRUFBRWdXLE9BQU8sQ0FBQztJQUNyRSxJQUFJaUMsUUFBUSxFQUFFO01BQ2JwWixNQUFNLENBQUNzWixPQUFPLEdBQUdGLFFBQVE7SUFDMUI7SUFDQSxNQUFNRyxpQkFBaUIsR0FBR0MseUJBQXlCLENBQUNyWSxRQUFRLENBQUM7SUFDN0QsSUFBSXNZLCtCQUErQixDQUFDdFksUUFBUSxDQUFDLElBQUksT0FBT29ZLGlCQUFpQixLQUFLLFFBQVEsSUFBSXZaLE1BQU0sQ0FBQ3lWLGNBQWMsRUFBRTtNQUNoSHpWLE1BQU0sQ0FBQ3NXLDBCQUEwQixHQUFHaUQsaUJBQWlCO01BQ3JEdlosTUFBTSxDQUFDeVYsY0FBYyxDQUFDQyxRQUFRLEdBQUcsTUFBTSxHQUFHNkQsaUJBQWlCO0lBQzVEO0lBQ0EsT0FBT3ZaLE1BQU07RUFDZCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztFQUVBLFNBQVNnWSxtQkFBbUIsQ0FBQ3pNLE1BQXlDLEVBQVc7SUFBQTtJQUNoRixJQUFJbU8sWUFBWSxFQUFFdlksUUFBUTtJQUMxQixNQUFNd1ksd0JBQXdCLHVCQUFJcE8sTUFBTSxDQUFjaEssV0FBVyxDQUFDb0YsRUFBRSxxREFBbkMsaUJBQXFDdVMsZ0JBQWdCO0lBQ3RGLElBQUlVLFVBQVUsQ0FBQ3JPLE1BQU0sQ0FBQyxJQUFJb08sd0JBQXdCLGFBQXhCQSx3QkFBd0IsZUFBeEJBLHdCQUF3QixDQUFFOU8sS0FBSyxFQUFFO01BQzFELElBQUlnUCxtQ0FBbUMsQ0FBQ0Ysd0JBQXdCLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDM0UsT0FBTyxLQUFLO01BQ2I7TUFDQUQsWUFBWSxHQUFHQyx3QkFBd0IsYUFBeEJBLHdCQUF3Qix1QkFBeEJBLHdCQUF3QixDQUFFOU8sS0FBSztJQUMvQyxDQUFDLE1BQU0sSUFBSWdQLG1DQUFtQyxDQUFDdE8sTUFBTSxDQUEyQixLQUFLLElBQUksRUFBRTtNQUMxRixPQUFPLEtBQUs7SUFDYixDQUFDLE1BQU07TUFBQTtNQUNOcEssUUFBUSxHQUFHb0ssTUFBZ0M7TUFDM0NtTyxZQUFZLEdBQUd2WSxRQUFRLENBQUMwSixLQUFLO01BQzdCLElBQUk2TyxZQUFZLHdEQUE2QyxlQUFLdlksUUFBUSxDQUE0QjJZLE1BQU0sdURBQTNDLFFBQTZDQyxPQUFPLDRDQUFwRCxnQkFBc0RsUCxLQUFLLEVBQUU7UUFBQTtRQUM3SDtRQUNBNk8sWUFBWSxlQUFJdlksUUFBUSxDQUE0QjJZLE1BQU0saUVBQTNDLFNBQTZDQyxPQUFPLHFEQUFwRCxpQkFBc0RsUCxLQUFLO1FBQzFFLE9BQU8saURBQXNDMUgsT0FBTyxDQUFDdVcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO01BQzFFLENBQUMsTUFBTSxJQUNOLFdBQUN2WSxRQUFRLENBQWUyRixLQUFLLDZEQUE3QixPQUErQmlULE9BQU8sNEVBQXRDLGVBQXdDeFksV0FBVyxvRkFBbkQsc0JBQXFEOE8sSUFBSSxxRkFBekQsdUJBQTJEMkosU0FBUywyREFBcEUsdUJBQXNFQyxJQUFJLE1BQUssNkJBQTZCLElBQzVHLFlBQUM5WSxRQUFRLENBQWUyRixLQUFLLCtEQUE3QixRQUErQmlULE9BQU8sNkVBQXRDLGdCQUF3Q3hZLFdBQVcsb0ZBQW5ELHNCQUFxRDhPLElBQUksMkRBQXpELHVCQUEyRDZKLEtBQUssTUFBSyxJQUFJLEVBQ3hFO1FBQ0Q7UUFDQSxPQUFPLEtBQUs7TUFDYjtJQUNEO0lBQ0EsT0FBT1IsWUFBWSxHQUNoQix1S0FJQyxDQUFDdlcsT0FBTyxDQUFDdVcsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQzlCLElBQUk7RUFDUjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1TLGNBQWMsR0FBRyxVQUFVdlAsU0FBaUMsRUFBRTtJQUNuRSxRQUFRQSxTQUFTLENBQUNDLEtBQUs7TUFDdEI7TUFDQTtRQUNDLE9BQU8sQ0FBQyxDQUFDRCxTQUFTLENBQUNNLE1BQU07TUFDMUI7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO1FBQ0MsT0FBTyxJQUFJO01BQ1o7TUFDQTtNQUNBO0lBQUE7RUFFRixDQUFDO0VBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU1rUCxxQkFBcUIsR0FBRyxVQUFVQyxrQkFBdUMsRUFBcUM7SUFBQTtJQUMxSCxNQUFNdE8sWUFBeUQsR0FBR3NPLGtCQUFrQixDQUFDdE8sWUFBWTtJQUNqRyxJQUFJdU8sYUFBYTtJQUNqQixJQUFJdk8sWUFBWSxFQUFFO01BQ2pCLFFBQVFBLFlBQVksQ0FBQ2xCLEtBQUs7UUFDekI7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1VBQ0N5UCxhQUFhLEdBQUd2TyxZQUFZLENBQUNqRixLQUFLLENBQUNpVCxPQUFPO1VBQzFDO1FBQ0Q7VUFDQztVQUNBLElBQUksQ0FBQWhPLFlBQVksYUFBWkEsWUFBWSwrQ0FBWkEsWUFBWSxDQUFFK04sTUFBTSxrRkFBcEIscUJBQXNCQyxPQUFPLDBEQUE3QixzQkFBK0JsUCxLQUFLLGdEQUFvQyxFQUFFO1lBQUE7WUFDN0V5UCxhQUFhLDZCQUFHdk8sWUFBWSxDQUFDK04sTUFBTSxDQUFDQyxPQUFPLDJEQUEzQix1QkFBNkJqVCxLQUFLLENBQUNpVCxPQUFPO1VBQzNEO1VBQ0E7UUFDRDtRQUNBO1FBQ0E7VUFDQ08sYUFBYSxHQUFHbmEsU0FBUztNQUFDO0lBRTdCO0lBQ0E7SUFDQSxNQUFNb2EsK0JBQStCLEdBQUcsZ0RBQWlEcE8sUUFBUSxDQUFDLEtBQUssQ0FBQztJQUN4RyxNQUFNcU8sZ0JBQWdCLEdBQUcseURBQTBEck8sUUFBUSxDQUFDLEtBQUssQ0FBQzs7SUFFbEc7SUFDQTtJQUNBO0lBQ0E7SUFDQSxPQUFPNEMsR0FBRyxDQUNULEdBQUcsQ0FDRmlCLEdBQUcsQ0FBQzNFLEtBQUssQ0FBQzRFLDJCQUEyQixDQUFDbEUsWUFBWSxhQUFaQSxZQUFZLGdEQUFaQSxZQUFZLENBQUV4SyxXQUFXLG9GQUF6QixzQkFBMkJvRixFQUFFLDJEQUE3Qix1QkFBK0J5RSxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUNwRjBELE1BQU0sQ0FDTCxDQUFDLENBQUN3TCxhQUFhLEVBQ2ZBLGFBQWEsSUFBSXRLLEdBQUcsQ0FBQzNFLEtBQUssQ0FBQzRFLDJCQUEyQiwwQkFBQ3FLLGFBQWEsQ0FBQy9ZLFdBQVcsb0ZBQXpCLHNCQUEyQm9GLEVBQUUsMkRBQTdCLHVCQUErQnlFLE1BQU0sQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQ3JHLElBQUksQ0FDSixFQUNEeUQsRUFBRSxDQUFDbUIsR0FBRyxDQUFDdUssK0JBQStCLENBQUMsRUFBRUMsZ0JBQWdCLENBQUMsQ0FDMUQsQ0FDRDtFQUNGLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQTtFQU9BLE1BQU1DLCtCQUErQixHQUFHLFVBQVVDLGNBQXNDLEVBQWdEO0lBQUE7SUFDdkksTUFBTUMsMkJBQWdFLEdBQUcsRUFBRTtJQUMzRSxJQUNDRCxjQUFjLENBQUM3UCxLQUFLLHdEQUE2QyxJQUNqRSwwQkFBQTZQLGNBQWMsQ0FBQ1osTUFBTSxvRkFBckIsc0JBQXVCQyxPQUFPLDJEQUE5Qix1QkFBZ0NsUCxLQUFLLGlEQUFxQyxFQUN6RTtNQUFBO01BQ0QsSUFBSTZQLGNBQWMsYUFBZEEsY0FBYyx3Q0FBZEEsY0FBYyxDQUFFblosV0FBVyw0RUFBM0Isc0JBQTZCb0YsRUFBRSxtREFBL0IsdUJBQWlDeUUsTUFBTSxFQUFFO1FBQzVDLE9BQU9tRCxpQkFBaUIsQ0FBQ3lCLEdBQUcsQ0FBQzNFLEtBQUssQ0FBQzRFLDJCQUEyQixDQUFDeUssY0FBYyxDQUFDblosV0FBVyxDQUFDb0YsRUFBRSxDQUFDeUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztNQUM5RyxDQUFDLE1BQU07UUFBQTtRQUNOLDBCQUFBc1AsY0FBYyxDQUFDWixNQUFNLENBQUNDLE9BQU8sQ0FBQ2EsSUFBSSwyREFBbEMsdUJBQW9DcGEsT0FBTyxDQUFFcWEsY0FBMkQsSUFBSztVQUM1R0YsMkJBQTJCLENBQUN4WSxJQUFJLENBQUNpWSxxQkFBcUIsQ0FBQztZQUFFck8sWUFBWSxFQUFFOE87VUFBZSxDQUFDLENBQXdCLENBQUM7UUFDakgsQ0FBQyxDQUFDO1FBQ0YsT0FBT3RNLGlCQUFpQixDQUFDTyxNQUFNLENBQUNELEVBQUUsQ0FBQyxHQUFHOEwsMkJBQTJCLENBQUMsRUFBRXhPLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRUEsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7TUFDdEc7SUFDRCxDQUFDLE1BQU07TUFDTixPQUFPaE0sU0FBUztJQUNqQjtFQUNELENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1xWSxRQUFRLEdBQUcsVUFBVXJYLFFBQWdFLEVBQXVDO0lBQUEsSUFBckNnVyxPQUFPLHVFQUFHLEtBQUs7SUFDM0csSUFBSSxDQUFDaFcsUUFBUSxFQUFFO01BQ2QsT0FBT2hCLFNBQVM7SUFDakI7SUFDQSxJQUFJeVosVUFBVSxDQUFDelksUUFBUSxDQUFDLElBQUkySyxvQkFBb0IsQ0FBQzNLLFFBQVEsQ0FBQyxFQUFFO01BQUE7TUFDM0QsTUFBTTJaLGdCQUFnQixvQkFBSTNaLFFBQVEsQ0FBY0ksV0FBVyxzRUFBbEMsY0FBb0NvRixFQUFFLHFEQUF0QyxpQkFBd0N1UyxnQkFBZ0I7TUFDakYsSUFBSTRCLGdCQUFnQixJQUFJLENBQUNBLGdCQUFnQixDQUFDelosU0FBUyw2QkFBSXlaLGdCQUFnQixDQUFDMUssS0FBSyxrREFBdEIsc0JBQXdCakYsT0FBTyxFQUFFLEVBQUU7UUFBQTtRQUN6RixPQUFPb0QsaUJBQWlCLENBQUMwQiwyQkFBMkIsMkJBQUM2SyxnQkFBZ0IsQ0FBQzFLLEtBQUssMkRBQXRCLHVCQUF3QmpGLE9BQU8sRUFBRSxDQUFDLENBQUM7TUFDekY7TUFDQSxPQUFPb0QsaUJBQWlCLENBQUMwQiwyQkFBMkIsQ0FBQyw0QkFBQTlPLFFBQVEsQ0FBQ0ksV0FBVyxDQUFDNkQsTUFBTSx1RkFBM0Isd0JBQTZCZ0wsS0FBSyw0REFBbEMsd0JBQW9DakYsT0FBTyxFQUFFLEtBQUloSyxRQUFRLENBQUNDLElBQUksQ0FBQyxDQUFDO0lBQ3RILENBQUMsTUFBTSxJQUFJMlosZ0JBQWdCLENBQUM1WixRQUFRLENBQUMsRUFBRTtNQUFBO01BQ3RDLElBQUksQ0FBQyxDQUFDZ1csT0FBTyxJQUFJaFcsUUFBUSxDQUFDMEosS0FBSyxvRUFBeUQsRUFBRTtRQUFBO1FBQ3pGLE9BQU8wRCxpQkFBaUIsQ0FBQzBCLDJCQUEyQixvQkFBQzlPLFFBQVEsQ0FBQ2lQLEtBQUssb0RBQWQsZ0JBQWdCakYsT0FBTyxFQUFFLENBQUMsQ0FBQztNQUNqRjtNQUNBLE9BQU9vRCxpQkFBaUIsQ0FDdkIwQiwyQkFBMkIsQ0FDMUIscUJBQUE5TyxRQUFRLENBQUNpUCxLQUFLLHFEQUFkLGlCQUFnQmpGLE9BQU8sRUFBRSx5QkFBSWhLLFFBQVEsQ0FBQzJGLEtBQUssNkVBQWQsZ0JBQWdCaVQsT0FBTyxvRkFBdkIsc0JBQXlCeFksV0FBVyxxRkFBcEMsdUJBQXNDNkQsTUFBTSxxRkFBNUMsdUJBQThDZ0wsS0FBSywyREFBbkQsdUJBQXFEakYsT0FBTyxFQUFFLDBCQUFJaEssUUFBUSxDQUFDMkYsS0FBSyw4RUFBZCxpQkFBZ0JpVCxPQUFPLDBEQUF2QixzQkFBeUIzWSxJQUFJLEVBQzVILENBQ0Q7SUFDRixDQUFDLE1BQU0sSUFBSUQsUUFBUSxDQUFDMEosS0FBSyx3REFBNkMsRUFBRTtNQUFBO01BQ3ZFLE9BQU8wRCxpQkFBaUIsQ0FDdkIwQiwyQkFBMkIsQ0FDMUIscUJBQUE5TyxRQUFRLENBQUNpUCxLQUFLLHFEQUFkLGlCQUFnQmpGLE9BQU8sRUFBRSwwQkFBS2hLLFFBQVEsQ0FBQzJZLE1BQU0sOEVBQWYsaUJBQWlCQyxPQUFPLG9GQUF6QixzQkFBeUNqVCxLQUFLLHFGQUE5Qyx1QkFBZ0RpVCxPQUFPLHFGQUF2RCx1QkFBeUR4WSxXQUFXLHFGQUFwRSx1QkFBc0U2RCxNQUFNLHFGQUE1RSx1QkFBOEVnTCxLQUFLLDJEQUFuRix1QkFBcUZqRixPQUFPLEVBQUUsRUFDM0gsQ0FDRDtJQUNGLENBQUMsTUFBTTtNQUFBO01BQ04sT0FBT29ELGlCQUFpQixDQUFDMEIsMkJBQTJCLHFCQUFDOU8sUUFBUSxDQUFDaVAsS0FBSyxxREFBZCxpQkFBZ0JqRixPQUFPLEVBQUUsQ0FBQyxDQUFDO0lBQ2pGO0VBQ0QsQ0FBQztFQUVELE1BQU1rTyxXQUFXLEdBQUcsVUFBVTlOLE1BQXlDLEVBQXNCO0lBQUE7SUFDNUYsSUFBSSxDQUFDQSxNQUFNLEVBQUU7TUFDWixPQUFPcEwsU0FBUztJQUNqQjtJQUVBLElBQUl5WixVQUFVLENBQUNyTyxNQUFNLENBQUMsMkJBQUlBLE1BQU0sQ0FBQ2hLLFdBQVcseUVBQWxCLG9CQUFvQjZELE1BQU0sa0RBQTFCLHNCQUE0QjRWLFNBQVMsRUFBRTtNQUFBO01BQ2hFLE9BQU8sd0JBQUF6UCxNQUFNLENBQUNoSyxXQUFXLDBFQUFsQixxQkFBb0I2RCxNQUFNLGtEQUExQixzQkFBNEI0VixTQUFTLEdBQ3pDek0saUJBQWlCLENBQUMwQiwyQkFBMkIsQ0FBQzFFLE1BQU0sQ0FBQ2hLLFdBQVcsQ0FBQzZELE1BQU0sQ0FBQzRWLFNBQVMsQ0FBQzdQLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FDN0ZoTCxTQUFTO0lBQ2IsQ0FBQyxNQUFNLElBQUk0YSxnQkFBZ0IsQ0FBQ3hQLE1BQU0sQ0FBQyxFQUFFO01BQUE7TUFDcEMsT0FBTyxpQkFBQUEsTUFBTSxDQUFDekUsS0FBSyxtRUFBWixjQUFjaVQsT0FBTyw0RUFBckIsc0JBQXVCeFksV0FBVyw2RUFBbEMsdUJBQW9DNkQsTUFBTSxtREFBMUMsdUJBQTRDNFYsU0FBUyxHQUN6RHpNLGlCQUFpQixDQUFDMEIsMkJBQTJCLENBQUMxRSxNQUFNLENBQUN6RSxLQUFLLENBQUNpVCxPQUFPLENBQUN4WSxXQUFXLENBQUM2RCxNQUFNLENBQUM0VixTQUFTLENBQUM3UCxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQzNHaEwsU0FBUztJQUNiLENBQUMsTUFBTSxJQUFJb0wsTUFBTSxDQUFDVixLQUFLLHdEQUE2QyxFQUFFO01BQUE7TUFDckUsTUFBTW9RLGVBQWUscUJBQUcxUCxNQUFNLENBQUN1TyxNQUFNLG1EQUFiLGVBQWVDLE9BQW9CO01BQzNELE9BQU9rQixlQUFlLGFBQWZBLGVBQWUsd0NBQWZBLGVBQWUsQ0FBRW5VLEtBQUssNEVBQXRCLHNCQUF3QmlULE9BQU8sNkVBQS9CLHVCQUFpQ3hZLFdBQVcsNkVBQTVDLHVCQUE4QzZELE1BQU0sbURBQXBELHVCQUFzRDRWLFNBQVMsR0FDbkV6TSxpQkFBaUIsQ0FBQzBCLDJCQUEyQixDQUFDZ0wsZUFBZSxDQUFDblUsS0FBSyxDQUFDaVQsT0FBTyxDQUFDeFksV0FBVyxDQUFDNkQsTUFBTSxDQUFDNFYsU0FBUyxDQUFDN1AsT0FBTyxFQUFFLENBQUMsQ0FBQyxHQUNwSGhMLFNBQVM7SUFDYixDQUFDLE1BQU07TUFDTixPQUFPQSxTQUFTO0lBQ2pCO0VBQ0QsQ0FBQztFQUVNLFNBQVMrYSxzQkFBc0IsQ0FBQ0MsT0FBZSxFQUFFQyx5QkFBbUMsRUFBcUM7SUFDL0gsT0FBT3hKLFlBQVksQ0FDbEIsQ0FDQzNGLFdBQVcsQ0FBRSw4QkFBNkIsRUFBRSxVQUFVLENBQUMsRUFDdkRBLFdBQVcsQ0FBRSxrQkFBaUIsRUFBRSxVQUFVLENBQUMsRUFDM0NrUCxPQUFPLEVBQ1BDLHlCQUF5QixDQUN6QixFQUNEcEosZUFBZSxDQUFDcUoscUNBQXFDLENBQ3JEO0VBQ0Y7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVZBO0VBV0EsTUFBTTVFLHFCQUFxQixHQUFHLFVBQzdCN0Isa0JBQTRDLEVBQzVDMEcsZUFBd0MsRUFDeEN6RyxrQkFBNEIsRUFDNUIzWCxnQkFBa0MsRUFDbEN1QyxVQUFzQixFQUN0QnFWLGlDQUEyQyxFQUNqQjtJQUMxQixNQUFNMEIsY0FBdUMsR0FBRyxFQUFFO0lBQ2xELE1BQU0rRSxzQkFBOEMsR0FBRyxDQUFDLENBQUM7SUFDekQsTUFBTTViLGlCQUFpQixHQUFHLElBQUlDLGlCQUFpQixDQUFDSCxVQUFVLEVBQUV2QyxnQkFBZ0IsQ0FBQztJQUU3RTZHLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDNFEsa0JBQWtCLENBQUMsQ0FBQ3BVLE9BQU8sQ0FBRVksSUFBSSxJQUFLO01BQ2pELE1BQU1ELFFBQVEsR0FBR3lULGtCQUFrQixDQUFDeFQsSUFBSSxDQUFDO1FBQ3hDdU8sY0FBYyxHQUFHelMsZ0JBQWdCLENBQUNzZSx5QkFBeUIsQ0FBQ3BhLElBQUksQ0FBQztRQUNqRTtRQUNBcWEsYUFBYSxHQUFHSCxlQUFlLENBQUN2YixJQUFJLENBQUVDLE1BQU0sSUFBS0EsTUFBTSxDQUFDb0IsSUFBSSxLQUFLQSxJQUFJLENBQUM7TUFDdkUsSUFBSXFhLGFBQWEsS0FBS3RiLFNBQVMsRUFBRTtRQUNoQztRQUNBO1FBQ0EsTUFBTUgsTUFBTSxHQUFHd1YsK0JBQStCLENBQzdDclUsUUFBUSxFQUNSd08sY0FBYyxFQUNkdk8sSUFBSSxFQUNKLElBQUksRUFDSixLQUFLLEVBQ0x5VCxrQkFBa0IsRUFDbEJsVixpQkFBaUIsRUFDakJ6QyxnQkFBZ0IsRUFDaEI0WCxpQ0FBaUMsQ0FDakM7UUFDRDlVLE1BQU0sQ0FBQzBiLGdCQUFnQixHQUFHSixlQUFlLENBQUNoUCxJQUFJLENBQzVDcVAsY0FBYztVQUFBO1VBQUEsT0FBSywwQkFBQUEsY0FBYyxDQUFDemIsYUFBYSwwREFBNUIsc0JBQThCc0QsUUFBUSxDQUFDcEMsSUFBSSxDQUFDLEtBQUl1YSxjQUFjLENBQUNELGdCQUFnQjtRQUFBLEVBQ25HO1FBQ0RsRixjQUFjLENBQUNyVSxJQUFJLENBQUNuQyxNQUFNLENBQUM7TUFDNUIsQ0FBQyxNQUFNLElBQUl5YixhQUFhLENBQUM5TCxjQUFjLEtBQUtBLGNBQWMsSUFBSThMLGFBQWEsQ0FBQ3ZiLGFBQWEsRUFBRTtRQUMxRjtRQUNBOztRQUVBLE1BQU0wYixPQUFPLEdBQUksYUFBWXhhLElBQUssRUFBQzs7UUFFbkM7UUFDQSxJQUFJLENBQUNrYSxlQUFlLENBQUNoUCxJQUFJLENBQUV0TSxNQUFNLElBQUtBLE1BQU0sQ0FBQ29CLElBQUksS0FBS3dhLE9BQU8sQ0FBQyxFQUFFO1VBQy9EO1VBQ0E7VUFDQSxNQUFNNWIsTUFBTSxHQUFHd1YsK0JBQStCLENBQzdDclUsUUFBUSxFQUNSd08sY0FBYyxFQUNkdk8sSUFBSSxFQUNKLEtBQUssRUFDTCxLQUFLLEVBQ0x5VCxrQkFBa0IsRUFDbEJsVixpQkFBaUIsRUFDakJ6QyxnQkFBZ0IsRUFDaEI0WCxpQ0FBaUMsQ0FDakM7VUFDRDlVLE1BQU0sQ0FBQzBiLGdCQUFnQixHQUFHRCxhQUFhLENBQUNDLGdCQUFnQjtVQUN4RGxGLGNBQWMsQ0FBQ3JVLElBQUksQ0FBQ25DLE1BQU0sQ0FBQztVQUMzQnViLHNCQUFzQixDQUFDbmEsSUFBSSxDQUFDLEdBQUd3YSxPQUFPO1FBQ3ZDLENBQUMsTUFBTSxJQUNOTixlQUFlLENBQUNoUCxJQUFJLENBQUV0TSxNQUFNLElBQUtBLE1BQU0sQ0FBQ29CLElBQUksS0FBS3dhLE9BQU8sQ0FBQyxJQUN6RE4sZUFBZSxDQUFDaFAsSUFBSSxDQUFFdE0sTUFBTTtVQUFBO1VBQUEsZ0NBQUtBLE1BQU0sQ0FBQ0UsYUFBYSwwREFBcEIsc0JBQXNCc0QsUUFBUSxDQUFDcEMsSUFBSSxDQUFDO1FBQUEsRUFBQyxFQUNyRTtVQUNEbWEsc0JBQXNCLENBQUNuYSxJQUFJLENBQUMsR0FBR3dhLE9BQU87UUFDdkM7TUFDRDtJQUNELENBQUMsQ0FBQzs7SUFFRjtJQUNBO0lBQ0FOLGVBQWUsQ0FBQzlhLE9BQU8sQ0FBRVIsTUFBTSxJQUFLO01BQUE7TUFDbkNBLE1BQU0sQ0FBQ0UsYUFBYSw2QkFBR0YsTUFBTSxDQUFDRSxhQUFhLDJEQUFwQix1QkFBc0J3QixHQUFHLENBQUVtYSxZQUFZLElBQUtOLHNCQUFzQixDQUFDTSxZQUFZLENBQUMsSUFBSUEsWUFBWSxDQUFDO01BQ3hIN2IsTUFBTSxDQUFDdVcsdUJBQXVCLDRCQUFHdlcsTUFBTSxDQUFDdVcsdUJBQXVCLDBEQUE5QixzQkFBZ0M3VSxHQUFHLENBQ2xFbWEsWUFBWSxJQUFLTixzQkFBc0IsQ0FBQ00sWUFBWSxDQUFDLElBQUlBLFlBQVksQ0FDdEU7SUFDRixDQUFDLENBQUM7SUFFRixPQUFPckYsY0FBYztFQUN0QixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1zRix3QkFBd0IsR0FBRyxVQUFVbFIsU0FBaUMsRUFBRTtJQUFBO0lBQzdFO0lBQ0EsSUFBSW1RLGdCQUFnQixDQUFDblEsU0FBUyxDQUFDLHdCQUFJQSxTQUFTLENBQUM5RCxLQUFLLDZDQUFmLGlCQUFpQmhILElBQUksRUFBRTtNQUFBO01BQ3pELDRCQUFPOEssU0FBUyxDQUFDOUQsS0FBSyxzREFBZixrQkFBaUJoSCxJQUFJO0lBQzdCLENBQUMsTUFBTSxJQUFJOEssU0FBUyxDQUFDQyxLQUFLLHdEQUE2Qyx5QkFBS0QsU0FBUyxDQUFDa1AsTUFBTSx1RUFBaEIsa0JBQWtCQyxPQUFPLDRFQUExQixzQkFBMENqVCxLQUFLLG1EQUEvQyx1QkFBaURoSCxJQUFJLEVBQUU7TUFBQTtNQUNqSTtNQUNBLDZCQUFROEssU0FBUyxDQUFDa1AsTUFBTSxnRkFBaEIsbUJBQWtCQyxPQUFPLDBEQUExQixzQkFBMENqVCxLQUFLLENBQUNoSCxJQUFJO0lBQzVELENBQUMsTUFBTTtNQUNOLE9BQU9nUSxTQUFTLENBQUNDLHdCQUF3QixDQUFDbkYsU0FBUyxDQUFDO0lBQ3JEO0VBQ0QsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQSxNQUFNbVIsdUJBQXVCLEdBQUcsVUFBVTNhLElBQVksRUFBRXBDLE9BQXNCLEVBQUVnZCxnQ0FBd0QsRUFBRTtJQUN6SSxNQUFNbk0sR0FBRyxHQUFJLHVCQUFzQnpPLElBQUssRUFBQztJQUN6QztJQUNBLE1BQU02YSxZQUFZLEdBQUdqZCxPQUFPLENBQUNlLElBQUksQ0FBRUMsTUFBTSxJQUFLQSxNQUFNLENBQUM2UCxHQUFHLEtBQUtBLEdBQUcsQ0FBQztJQUNqRTtJQUNBLE1BQU1xTSxrQkFBa0IsR0FDdkIsQ0FBQ0QsWUFBWSxJQUFLamQsT0FBTyxDQUFDZSxJQUFJLENBQUVDLE1BQU0sSUFBS0EsTUFBTSxDQUFDb0IsSUFBSSxLQUFLQSxJQUFJLElBQUksQ0FBQ3BCLE1BQU0sQ0FBQ0UsYUFBYSxDQUE0QjtJQUNySCxJQUFJZ2Msa0JBQWtCLEVBQUU7TUFDdkIsTUFBTUMsZUFBZ0MsR0FBRztRQUN4Q3RNLEdBQUcsRUFBRUEsR0FBRztRQUNScE4sSUFBSSxFQUFFM0YsVUFBVSxDQUFDd2IsVUFBVTtRQUMzQkMsS0FBSyxFQUFFMkQsa0JBQWtCLENBQUMzRCxLQUFLO1FBQy9CNUksY0FBYyxFQUFFdU0sa0JBQWtCLENBQUN2TSxjQUFjO1FBQ2pEdFEsWUFBWSxFQUFFLFFBQVE7UUFDdEIrQixJQUFJLEVBQUV5TyxHQUFHO1FBQ1R6UCxZQUFZLEVBQUU4YixrQkFBa0IsQ0FBQzliLFlBQVk7UUFDN0N3WCxRQUFRLEVBQUUsS0FBSztRQUNmZ0IsV0FBVyxFQUFFLEtBQUs7UUFDbEJFLEtBQUssRUFBRSxLQUFLO1FBQ1pyRCxjQUFjLEVBQUUsSUFBSTtRQUNwQnNELGFBQWEsRUFBRSxLQUFLO1FBQ3BCcUQsWUFBWSxFQUFFLEtBQUs7UUFDbkJDLFNBQVMsRUFBRTtVQUNWQyxvQkFBb0IsRUFBRSxJQUFJO1VBQzFCQyx1QkFBdUIsRUFBRTtRQUMxQjtNQUNELENBQUM7TUFDRHZkLE9BQU8sQ0FBQ21ELElBQUksQ0FBQ2dhLGVBQWUsQ0FBQztNQUM3QkgsZ0NBQWdDLENBQUM1YSxJQUFJLENBQUMsR0FBRythLGVBQWUsQ0FBQy9hLElBQUk7SUFDOUQ7RUFDRCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1vYix1QkFBdUIsR0FBRyxVQUFVQyxjQUFzQixFQUFFeGYsaUJBQXlCLEVBQUVDLGdCQUFrQyxFQUFXO0lBQUE7SUFDekksTUFBTXdmLFFBQVEsOEJBQUd4ZixnQkFBZ0IsQ0FBQ1UsK0JBQStCLENBQUNYLGlCQUFpQixDQUFDLDREQUFuRSx3QkFBcUUrQixPQUFPO0lBQzdGLE1BQU0yZCxXQUFXLEdBQUdELFFBQVEsSUFBSTNZLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDMFksUUFBUSxDQUFDO0lBQ3JELE9BQ0NDLFdBQVcsSUFDWCxDQUFDLENBQUNBLFdBQVcsQ0FBQzVjLElBQUksQ0FBQyxVQUFVOFAsR0FBVyxFQUFFO01BQ3pDLE9BQU9BLEdBQUcsS0FBSzRNLGNBQWMsSUFBSUMsUUFBUSxDQUFDN00sR0FBRyxDQUFDLENBQUMrTSxtQkFBbUI7SUFDbkUsQ0FBQyxDQUFDO0VBRUosQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxVQUFValMsU0FBaUMsRUFBVTtJQUFBO0lBQzdFLElBQUl4SyxZQUFZLEdBQUcsRUFBRTtJQUVyQixRQUFRd0ssU0FBUyxDQUFDQyxLQUFLO01BQ3RCO01BQ0E7TUFDQTtNQUNBO01BQ0E7UUFDQ3pLLFlBQVksR0FBSXdLLFNBQVMsYUFBVEEsU0FBUyxrQ0FBVEEsU0FBUyxDQUFnQjlELEtBQUssNENBQS9CLFFBQWlDaEgsSUFBSTtRQUNwRDtNQUVEO1FBQ0NNLFlBQVksR0FBR3dLLFNBQVMsYUFBVEEsU0FBUyw2Q0FBVEEsU0FBUyxDQUFFa1AsTUFBTSx1REFBakIsbUJBQW1CbFksS0FBSztRQUN2QztNQUVEO01BQ0E7TUFDQTtNQUNBO1FBQ0N4QixZQUFZLEdBQUcwUCxTQUFTLENBQUNDLHdCQUF3QixDQUFDbkYsU0FBUyxDQUFDO1FBQzVEO0lBQU07SUFHUixPQUFPeEssWUFBWTtFQUNwQixDQUFDO0VBRUQsTUFBTThXLGFBQWEsR0FBRyxVQUFVcFgsSUFBWSxFQUFFZ2QsV0FBb0IsRUFBRUMsVUFBbUIsRUFBRTtJQUN4RixNQUFNQyxXQUFXLEdBQUdGLFdBQVcsR0FBR2hkLElBQUksQ0FBQ21kLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBR25kLElBQUksQ0FBQ3FELE9BQU8sQ0FBQyxHQUFHLENBQUM7SUFFM0UsSUFBSTZaLFdBQVcsS0FBSyxDQUFDLENBQUMsRUFBRTtNQUN2QixPQUFPbGQsSUFBSTtJQUNaO0lBQ0EsT0FBT2lkLFVBQVUsR0FBR2pkLElBQUksQ0FBQzRMLFNBQVMsQ0FBQ3NSLFdBQVcsR0FBRyxDQUFDLEVBQUVsZCxJQUFJLENBQUNzQyxNQUFNLENBQUMsR0FBR3RDLElBQUksQ0FBQzRMLFNBQVMsQ0FBQyxDQUFDLEVBQUVzUixXQUFXLENBQUM7RUFDbEcsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1FLG9CQUFvQixHQUFHLFVBQVV0UyxTQUFpQyxFQUFFMU4sZ0JBQWtDLEVBQVc7SUFDdEgsSUFBSTZkLGdCQUFnQixDQUFDblEsU0FBUyxDQUFDLElBQUl4RSwwQkFBMEIsQ0FBQ3dFLFNBQVMsQ0FBQzlELEtBQUssQ0FBQyxFQUFFO01BQy9FLE1BQU1xVyxrQkFBa0IsR0FBR0Msb0JBQW9CLENBQUNsZ0IsZ0JBQWdCLENBQUNnSCxzQkFBc0IsRUFBRSxFQUFFMEcsU0FBUyxDQUFDOUQsS0FBSyxDQUFDaEgsSUFBSSxDQUFDO01BQ2hILE9BQU91ZCxpQkFBaUIsQ0FBQ0Ysa0JBQWtCLENBQUM7SUFDN0MsQ0FBQyxNQUFNO01BQ04sT0FBTyxLQUFLO0lBQ2I7RUFDRCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNRyxpQkFBaUIsR0FBRyxVQUFVMVMsU0FBaUMsRUFBRTJTLFlBQW9CLEVBQUUxSSxrQkFBNEIsRUFBVztJQUNuSSxPQUNDQSxrQkFBa0IsQ0FBQzFSLE9BQU8sQ0FBQ29hLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUFJO0lBQ2xEM1MsU0FBUyxDQUFDQyxLQUFLLDJDQUFnQyxJQUMvQ0QsU0FBUyxDQUFDQyxLQUFLLGtEQUF1QyxJQUN0REQsU0FBUyxDQUFDQyxLQUFLLG9FQUF5RCxJQUN4RUQsU0FBUyxDQUFDQyxLQUFLLHFEQUEwQyxDQUFDO0VBRTdELENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sTUFBTW1PLHdCQUF3QixHQUFHLFVBQVU5YixnQkFBa0MsRUFBVztJQUM5RixNQUFNc2dCLGVBQTRDLEdBQUdDLG1CQUFtQixDQUFDdmdCLGdCQUFnQixDQUFDO0lBQzFGLE9BQU9rTixLQUFLLENBQUNzVCxPQUFPLENBQUNGLGVBQWUsQ0FBQyxHQUFJQSxlQUFlLENBQWNyYSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSTtFQUN2RyxDQUFDO0VBQUM7RUFFRixTQUFTc2EsbUJBQW1CLENBQUNFLGdCQUFrQyxFQUErQjtJQUM3RixNQUFNMVUsU0FBUyxHQUFHMFUsZ0JBQWdCLENBQUN6VSxZQUFZLEVBQUU7SUFDakQsSUFBSTBVLFVBQVUsQ0FBQ2xULFdBQVcsQ0FBQ3pCLFNBQVMsQ0FBQyxFQUFFO01BQUE7TUFDdEMsT0FDQywyQkFBQUEsU0FBUyxDQUFDMUgsV0FBVyxDQUFDb0ksWUFBWSwyREFBbEMsdUJBQW9Da1UsZUFBZSwrQkFDbkRGLGdCQUFnQixDQUFDRyxrQkFBa0IsRUFBRSxDQUFDdmMsV0FBVyxDQUFDb0ksWUFBWSwwREFBOUQsc0JBQWdFa1UsZUFBZTtJQUVqRjtJQUNBLE9BQU8xZCxTQUFTO0VBQ2pCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVM0ZCxnQ0FBZ0MsQ0FBQ3hlLGFBQTRDLEVBQWlDO0lBQ3RILE9BQU9BLGFBQWEsS0FBS1ksU0FBUyxHQUMvQkEsU0FBUyxHQUNUO01BQ0E2ZCxhQUFhLEVBQUUsQ0FBQztNQUNoQixHQUFHemU7SUFDSCxDQUFDO0VBQ0w7RUFFQSxTQUFTMGUsc0JBQXNCLENBQUN6VixZQUF5QixFQUFFcEgsSUFBWSxFQUFFO0lBQ3hFLE1BQU04YyxrQkFBNEIsR0FBRyxFQUFFO0lBQ3ZDLElBQUlDLGlCQUFpQixHQUFHLEtBQUs7SUFDN0IsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc1VixZQUFZLENBQUNwRyxNQUFNLEVBQUVnYyxDQUFDLEVBQUUsRUFBRTtNQUM3Q0Ysa0JBQWtCLENBQUMvYixJQUFJLENBQUNxRyxZQUFZLENBQUM0VixDQUFDLENBQUMsQ0FBQ3hjLEtBQUssQ0FBQztNQUM5QyxJQUFJNEcsWUFBWSxDQUFDNFYsQ0FBQyxDQUFDLENBQUN4YyxLQUFLLEtBQUtSLElBQUksRUFBRTtRQUNuQytjLGlCQUFpQixHQUFHLElBQUk7TUFDekI7SUFDRDtJQUNBLE9BQU87TUFDTkUsTUFBTSxFQUFFSCxrQkFBa0I7TUFDMUJJLGdCQUFnQixFQUFFSDtJQUNuQixDQUFDO0VBQ0Y7RUFFQSxTQUFTSSxlQUFlLENBQUNDLGlCQUEyQixFQUFFQyxvQkFBOEIsRUFBRTtJQUNyRixJQUFJQyxrQ0FBa0MsR0FBRyxLQUFLO0lBQzlDLElBQUlDLGFBQWE7SUFDakIsSUFBSUgsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDcGMsTUFBTSxJQUFJLENBQUMsSUFBSXFjLG9CQUFvQixJQUFJQSxvQkFBb0IsQ0FBQ3JjLE1BQU0sSUFBSSxDQUFDLEVBQUU7TUFDbkgsS0FBSyxJQUFJZ2MsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHSSxpQkFBaUIsQ0FBQ3BjLE1BQU0sRUFBRWdjLENBQUMsRUFBRSxFQUFFO1FBQ2xELElBQUksQ0FBQ0ksaUJBQWlCLENBQUNKLENBQUMsQ0FBQyxDQUFDLENBQUM5UixJQUFJLENBQUVzUyxHQUFHLElBQUtILG9CQUFvQixDQUFDdGIsT0FBTyxDQUFDeWIsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7VUFDakZGLGtDQUFrQyxHQUFHLElBQUk7VUFDekNDLGFBQWEsR0FBR0gsaUJBQWlCLENBQUNKLENBQUMsQ0FBQztVQUNwQztRQUNEO01BQ0Q7SUFDRDtJQUNBLE9BQU87TUFDTk0sa0NBQWtDLEVBQUVBLGtDQUFrQztNQUN0RUcsc0JBQXNCLEVBQUVGO0lBQ3pCLENBQUM7RUFDRjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNHLGtDQUFrQyxDQUFDcEUsY0FBNkMsRUFBRThELGlCQUEyQixFQUFFO0lBQUE7SUFDdkg7SUFDQSxNQUFNTyxXQUFxQixHQUFHLEVBQUU7SUFDaEMsSUFBSUMsZ0JBQWtHLEdBQUc7TUFDeEdOLGtDQUFrQyxFQUFFLEtBQUs7TUFDekNHLHNCQUFzQixFQUFFMWU7SUFDekIsQ0FBQztJQUNELElBQ0N1YSxjQUFjLElBQ2RBLGNBQWMsQ0FBQzdQLEtBQUssd0RBQTZDLElBQ2pFLDJCQUFBNlAsY0FBYyxDQUFDWixNQUFNLHFGQUFyQix1QkFBdUJDLE9BQU8sMkRBQTlCLHVCQUFnQ2xQLEtBQUssaURBQXFDLEVBQ3pFO01BQUE7TUFDRCwwQkFBQTZQLGNBQWMsQ0FBQ1osTUFBTSxDQUFDQyxPQUFPLENBQUNhLElBQUksMkRBQWxDLHVCQUFvQ3BhLE9BQU8sQ0FBRXFhLGNBQXNDLElBQUs7UUFDdkYsSUFDQyxDQUFDQSxjQUFjLENBQUNoUSxLQUFLLDJDQUFnQyxJQUFJZ1EsY0FBYyxDQUFDaFEsS0FBSyxrREFBdUMsS0FDcEhnUSxjQUFjLENBQUMvVCxLQUFLLEVBQ25CO1VBQ0RpWSxXQUFXLENBQUM1YyxJQUFJLENBQUMwWSxjQUFjLENBQUMvVCxLQUFLLENBQUNoSCxJQUFJLENBQUM7UUFDNUM7UUFDQWtmLGdCQUFnQixHQUFHVCxlQUFlLENBQUNDLGlCQUFpQixFQUFFTyxXQUFXLENBQUM7TUFDbkUsQ0FBQyxDQUFDO0lBQ0g7SUFDQSxPQUFPO01BQ05MLGtDQUFrQyxFQUFFTSxnQkFBZ0IsQ0FBQ04sa0NBQWtDO01BQ3ZGbkIsWUFBWSxFQUFFeUIsZ0JBQWdCLENBQUNIO0lBQ2hDLENBQUM7RUFDRjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTSSxpQ0FBaUMsQ0FDekM3ZCxJQUFZLEVBQ1pvSCxZQUF5QixFQUN6QjBXLGtCQUEyQixFQUMzQnhFLGNBQTZDLEVBTTNDO0lBQ0YsSUFBSSxDQUFDbFMsWUFBWSxFQUFFO01BQ2xCLE9BQU8sQ0FBQyxDQUFDO0lBQ1Y7SUFDQSxNQUFNMlcsV0FBVyxHQUFHbEIsc0JBQXNCLENBQUN6VixZQUFZLEVBQUVwSCxJQUFJLENBQUM7SUFDOUQsTUFBTWdlLHVCQUF1QixHQUFHTixrQ0FBa0MsQ0FBQ3BFLGNBQWMsRUFBRXlFLFdBQVcsQ0FBQ2QsTUFBTSxDQUFDO0lBQ3RHLElBQUllLHVCQUF1QixDQUFDVixrQ0FBa0MsRUFBRTtNQUMvRDtNQUNBLE9BQU87UUFDTjtRQUNBVyxvQ0FBb0MsRUFBRUQsdUJBQXVCLENBQUM3QixZQUFZO1FBQzFFZCxjQUFjLEVBQUVyYixJQUFJO1FBQ3BCa2UscUJBQXFCLEVBQUUvUSxpQkFBaUIsQ0FBQzJNLHNCQUFzQixDQUFDOVosSUFBSSxFQUFFLElBQUksQ0FBQztNQUM1RSxDQUFDO0lBQ0YsQ0FBQyxNQUFNLElBQUkrZCxXQUFXLENBQUNiLGdCQUFnQixFQUFFO01BQ3hDLE9BQU87UUFDTmlCLGlCQUFpQixFQUFFLElBQUk7UUFDdkJELHFCQUFxQixFQUFFL1EsaUJBQWlCLENBQUMyTSxzQkFBc0IsQ0FBQzlaLElBQUksRUFBRSxLQUFLLENBQUM7TUFDN0UsQ0FBQztJQUNGO0lBQ0EsT0FBTyxDQUFDLENBQUM7RUFDVjtFQUVBLFNBQVNvZSxhQUFhLENBQUM1VSxTQUF5QixFQUFVO0lBQUE7SUFDekQsTUFBTXpMLFVBQVUsR0FBR3lMLFNBQVMsYUFBVEEsU0FBUyxrREFBVEEsU0FBUyxDQUFFckosV0FBVyx1RkFBdEIsd0JBQXdCb0YsRUFBRSw0REFBMUIsd0JBQTRCOFksVUFBb0I7SUFFbkUsSUFBSXRnQixVQUFVLElBQUlBLFVBQVUsQ0FBQ3FFLFFBQVEsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFFO01BQ2hFLE9BQU8sQ0FBQztJQUNUO0lBQ0EsSUFBSXJFLFVBQVUsSUFBSUEsVUFBVSxDQUFDcUUsUUFBUSxDQUFDLDBCQUEwQixDQUFDLEVBQUU7TUFDbEUsT0FBTyxDQUFDO0lBQ1Q7SUFDQSxJQUFJckUsVUFBVSxJQUFJQSxVQUFVLENBQUNxRSxRQUFRLENBQUMsdUJBQXVCLENBQUMsRUFBRTtNQUMvRCxPQUFPLENBQUM7SUFDVDtJQUNBLE9BQU8sQ0FBQztFQUNUO0VBRUEsU0FBU2tjLHVCQUF1QixDQUFDOVUsU0FBeUIsRUFBYztJQUFBO0lBQ3ZFLE1BQU16TCxVQUFVLEdBQUd5TCxTQUFTLGFBQVRBLFNBQVMsa0RBQVRBLFNBQVMsQ0FBRXJKLFdBQVcsdUZBQXRCLHdCQUF3Qm9GLEVBQUUsNERBQTFCLHdCQUE0QjhZLFVBQW9CO0lBQ25FLE9BQU90Z0IsVUFBVSxHQUFJQSxVQUFVLENBQUN5TSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQWtCNlQsVUFBVSxDQUFDMVIsSUFBSTtFQUMvRTtFQUVBLFNBQVM0UixpQkFBaUIsQ0FBQ0MsTUFBd0IsRUFBYztJQUNoRSxJQUFJQSxNQUFNLElBQUlBLE1BQU0sQ0FBQ3hkLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDaEMsSUFBSXlkLFlBQVksR0FBRyxDQUFDLENBQUM7TUFDckIsSUFBSUMsU0FBUyxHQUFHLENBQUMsQ0FBQztNQUNsQixJQUFJQywwQkFBMEI7TUFDOUIsS0FBSyxNQUFNQyxLQUFLLElBQUlKLE1BQU0sRUFBRTtRQUMzQkUsU0FBUyxHQUFHTixhQUFhLENBQUNRLEtBQUssQ0FBQztRQUNoQyxJQUFJRixTQUFTLEdBQUdELFlBQVksRUFBRTtVQUM3QkEsWUFBWSxHQUFHQyxTQUFTO1VBQ3hCQywwQkFBMEIsR0FBR0MsS0FBSztRQUNuQztNQUNEO01BQ0EsT0FBT04sdUJBQXVCLENBQUNLLDBCQUEwQixDQUFtQjtJQUM3RTtJQUNBLE9BQU9OLFVBQVUsQ0FBQzFSLElBQUk7RUFDdkI7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTa0wsYUFBYSxDQUFDck8sU0FBNkMsRUFBRXBDLFlBQXlCLEVBQTBCO0lBQUE7SUFDL0g7SUFDQSxJQUFJeVgsb0JBQW9CO01BQ3ZCQyxlQUF5QixHQUFHLEVBQUU7SUFDL0I7SUFDQSxJQUFJMVgsWUFBWSxJQUFJQSxZQUFZLENBQUNwRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQzVDOGQsZUFBZSxHQUFHMVgsWUFBWSxDQUFDOUcsR0FBRyxDQUFDLFVBQVVtTyxHQUFHLEVBQUU7UUFDakQsT0FBT0EsR0FBRyxDQUFDak8sS0FBSztNQUNqQixDQUFDLENBQUM7SUFDSDtJQUNBLElBQUksQ0FBQ2dKLFNBQVMsRUFBRTtNQUNmLE9BQU96SyxTQUFTO0lBQ2pCO0lBRUEsSUFBSWdnQixrQkFBa0IsQ0FBeUJ2VixTQUFTLHNEQUEyQyxFQUFFO01BQ3BHLE1BQU13VixlQUFlLEdBQUd4VixTQUFTLENBQUNrUCxNQUFNLENBQUNDLE9BQU87TUFDaEQsSUFBSW9HLGtCQUFrQixDQUFhQyxlQUFlLDhDQUFtQyxFQUFFO1FBQ3RGLE1BQU1DLGNBQWMsR0FBR0QsZUFBZSxDQUFDeEYsSUFBSTtRQUMzQyxNQUFNMEYsd0JBQXdCLEdBQzdCRCxjQUFjLElBQ2RBLGNBQWMsQ0FBQy9ULElBQUksQ0FBQyxVQUFVaVUsbUJBQTJDLEVBQUU7VUFBQTtVQUMxRSxPQUNDLENBQUNBLG1CQUFtQixhQUFuQkEsbUJBQW1CLGtDQUFuQkEsbUJBQW1CLENBQWdDelosS0FBSyw0Q0FBekQsUUFBMkRoSCxJQUFJLEtBQy9EeWdCLG1CQUFtQixDQUFDMVYsS0FBSyx3REFBNkMsSUFDdEVxVixlQUFlLENBQUMxYyxRQUFRLENBQUUrYyxtQkFBbUIsYUFBbkJBLG1CQUFtQixrQ0FBbkJBLG1CQUFtQixDQUFnQ3paLEtBQUssNENBQXpELFFBQTJEaEgsSUFBSSxDQUFDO1FBRTNGLENBQUMsQ0FBQztRQUNIO1FBQ0EsSUFBSXdnQix3QkFBd0IsRUFBRTtVQUM3QixPQUFPYixVQUFVLENBQUNlLElBQUk7UUFDdkIsQ0FBQyxNQUFNO1VBQUE7VUFDTjtVQUNBLElBQUk1VixTQUFTLGFBQVRBLFNBQVMsMENBQVRBLFNBQVMsQ0FBRXJKLFdBQVcsK0VBQXRCLHdCQUF3Qm9GLEVBQUUsb0RBQTFCLHdCQUE0QjhZLFVBQVUsRUFBRTtZQUMzQyxPQUFPQyx1QkFBdUIsQ0FBQzlVLFNBQVMsQ0FBOEI7VUFDdkU7VUFDQTtVQUNBcVYsb0JBQW9CLEdBQ25CSSxjQUFjLElBQ2RBLGNBQWMsQ0FBQ2hSLE1BQU0sQ0FBQyxVQUFVb1IsSUFBSSxFQUFFO1lBQUE7WUFDckMsT0FBT0EsSUFBSSxhQUFKQSxJQUFJLDRDQUFKQSxJQUFJLENBQUVsZixXQUFXLDhFQUFqQixrQkFBbUJvRixFQUFFLHlEQUFyQixxQkFBdUI4WSxVQUFVO1VBQ3pDLENBQUMsQ0FBQztVQUNILE9BQU9FLGlCQUFpQixDQUFDTSxvQkFBb0IsQ0FBcUI7UUFDbkU7UUFDQTtNQUNEO0lBQ0Q7O0lBRUEsT0FBUXJWLFNBQVMsQ0FBb0I5RCxLQUFLLElBQ3hDOEQsU0FBUyxhQUFUQSxTQUFTLDBCQUFUQSxTQUFTLENBQXFCOUQsS0FBSyxvQ0FBcEMsUUFBc0NoSCxJQUFJLElBQzFDb2dCLGVBQWUsQ0FBQzFjLFFBQVEsQ0FBRW9ILFNBQVMsQ0FBb0I5RCxLQUFLLENBQUNoSCxJQUFJLENBQUMsR0FDaEUyZixVQUFVLENBQUNlLElBQUksR0FDZmQsdUJBQXVCLENBQUM5VSxTQUFTLENBQThCO0VBQ25FOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVJBO0VBU0EsTUFBTThWLG1DQUFtQyxHQUFHLFVBQzNDOVYsU0FBaUMsRUFDakMrVixNQUEwQixFQUMxQnpqQixnQkFBa0MsRUFDbEMwakIsWUFBcUIsRUFDcEI7SUFDRCxNQUFNalIsY0FBYyxHQUFHelMsZ0JBQWdCLENBQUMwUywrQkFBK0IsQ0FBQ2hGLFNBQVMsQ0FBQzRFLGtCQUFrQixDQUFDO0lBRXJHLElBQUltUixNQUFNLElBQUlBLE1BQU0sS0FBSyxFQUFFLElBQUloUixjQUFjLENBQUN4TSxPQUFPLENBQUMsc0NBQXNDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSTRYLGdCQUFnQixDQUFDblEsU0FBUyxDQUFDLEVBQUU7TUFBQTtNQUNwSTtNQUNBLE1BQU1pVyxhQUFhLEdBQUcscUJBQUFqVyxTQUFTLENBQUM5RCxLQUFLLDhDQUFmLGtCQUFpQmlULE9BQU8sR0FBRytHLFVBQVUsQ0FBQ2xXLFNBQVMsQ0FBQzlELEtBQUssQ0FBQ2lULE9BQU8sQ0FBQyxHQUFHLEtBQUs7TUFDNUYsT0FBTyxDQUFDNkcsWUFBWSxJQUFJLENBQUNDLGFBQWE7SUFDdkM7SUFFQSxPQUFPLEtBQUs7RUFDYixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1oaUIseUJBQXlCLEdBQUcsVUFDakM3QixrQkFBNEIsRUFDNUJDLGlCQUF5QixFQUN6QkMsZ0JBQWtDLEVBQ2xDeUIsaUJBQTJCLEVBQ0Q7SUFBQTtJQUMxQixNQUFNYyxVQUFVLEdBQUd2QyxnQkFBZ0IsQ0FBQytCLHVCQUF1QixDQUFDakMsa0JBQWtCLENBQUM7TUFDOUU0QixpQkFBMEMsR0FBRyxFQUFFO01BQy9DZ1csa0JBQTRDLEdBQUcsQ0FBQyxDQUFDO01BQ2pEQyxrQkFBNEIsR0FBR2tNLG9DQUFvQyxDQUFDN2pCLGdCQUFnQixDQUFDZ00sWUFBWSxFQUFFLENBQUM7TUFDcEd5RSxxQkFBaUQsR0FBR3pRLGdCQUFnQixDQUFDVSwrQkFBK0IsQ0FBQ1gsaUJBQWlCLENBQUM7TUFDdkg0VyxTQUFvQixHQUFHLENBQUFsRyxxQkFBcUIsYUFBckJBLHFCQUFxQixpREFBckJBLHFCQUFxQixDQUFFRSxhQUFhLDJEQUFwQyx1QkFBc0NwTCxJQUFJLEtBQUksaUJBQWlCO0lBQ3ZGLE1BQU1xUyxpQ0FBMkMsR0FBRyxFQUFFO0lBQ3RELE1BQU10TSxZQUF5QixHQUFHdEwsZ0JBQWdCLENBQUN3YSxvQkFBb0IsQ0FBQyxRQUFRLGdEQUFxQyxDQUNwSHhhLGdCQUFnQixDQUFDMEwsYUFBYSxFQUFFLENBQ2hDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTCxJQUFJNUwsa0JBQWtCLEVBQUU7TUFDdkIsTUFBTWdrQixxQkFBcUIsR0FBRzlqQixnQkFBZ0IsQ0FBQytqQixzQkFBc0IsQ0FDcEVDLG1CQUFtQixDQUFDaGtCLGdCQUFnQixDQUFDZ0gsc0JBQXNCLEVBQUUsQ0FBQyxDQUM5RDtNQUVEbEgsa0JBQWtCLENBQUN3RCxPQUFPLENBQUUyZ0IsUUFBUSxJQUFLO1FBQUE7UUFDeEM7UUFDQSxJQUFJLENBQUNoSCxjQUFjLENBQUNnSCxRQUFRLENBQUMsRUFBRTtVQUM5QjtRQUNEO1FBQ0EsSUFBSTFMLGNBQTJDLEdBQUcsSUFBSTtRQUN0RCxNQUFNcUIsNEJBQTRCLEdBQ2pDaUUsZ0JBQWdCLENBQUNvRyxRQUFRLENBQUMsdUJBQUlBLFFBQVEsQ0FBQ3JhLEtBQUsscUVBQWQsZ0JBQWdCaVQsT0FBTyxrREFBdkIsc0JBQXlCdkssa0JBQWtCLEdBQ3RFdUgscUJBQXFCLENBQUM3WixnQkFBZ0IsRUFBRWlrQixRQUFRLENBQUMsR0FDakRoaEIsU0FBUztRQUNiLE1BQU1DLFlBQVksR0FBR3ljLGdCQUFnQixDQUFDc0UsUUFBUSxDQUFDO1FBQy9DO1FBQ0EsTUFBTWxNLHFCQUEwQyxHQUFHbU0sbUNBQW1DLENBQUNELFFBQVEsRUFBRWprQixnQkFBZ0IsRUFBRTJXLFNBQVMsQ0FBQztRQUM3SCxNQUFNc0Isb0JBQThCLEdBQUdwUixNQUFNLENBQUNDLElBQUksQ0FBQ2lSLHFCQUFxQixDQUFDbEwsVUFBVSxDQUFDO1FBQ3BGLE1BQU1xTCx1QkFBaUMsR0FBR3JSLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDaVIscUJBQXFCLENBQUNJLG9CQUFvQixDQUFDO1FBQ2pHLE1BQU00QixTQUE2QixHQUFHN1csWUFBWSxHQUFHOFcsYUFBYSxDQUFDOVcsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsR0FBR0QsU0FBUztRQUN6RyxNQUFNZ1gsT0FBZ0IsR0FBR0YsU0FBUyxJQUFJN1csWUFBWTtRQUNsRCxNQUFNdWdCLE1BQTBCLEdBQUduSSxRQUFRLENBQUMySSxRQUFRLEVBQUVoSyxPQUFPLENBQUM7UUFDOUQsTUFBTS9WLElBQUksR0FBRzBhLHdCQUF3QixDQUFDcUYsUUFBUSxDQUFDO1FBQy9DLE1BQU1qQyxrQkFBMkIsR0FBR2pJLFNBQVMsR0FBR0EsU0FBUyxDQUFDOVQsT0FBTyxDQUFFLElBQUMsdUNBQStCLEVBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUs7UUFDbEgsTUFBTXlaLG1CQUE0QixHQUFHc0Msa0JBQWtCLEdBQ3BEMUMsdUJBQXVCLENBQUNwYixJQUFJLEVBQUVuRSxpQkFBaUIsRUFBRUMsZ0JBQWdCLENBQUMsR0FDbEUsS0FBSztRQUNSLE1BQU1vYSxRQUE0QixHQUFHQyxvQkFBb0IsQ0FBQzRKLFFBQVEsQ0FBQztRQUNuRSxNQUFNOUosZ0JBQW9DLEdBQUdDLFFBQVEsS0FBSyxVQUFVLEdBQUcsWUFBWSxHQUFHblgsU0FBUztRQUMvRixNQUFNWixhQUFhLEdBQUd3ZSxnQ0FBZ0MsQ0FDckRrQixpQ0FBaUMsQ0FBQzdkLElBQUksRUFBRW9ILFlBQVksRUFBRTBXLGtCQUFrQixFQUFFaUMsUUFBUSxDQUFDLENBQ25GO1FBQ0QsSUFBSXhHLDJCQUE2RDtRQUNqRSxJQUNDd0csUUFBUSxDQUFDdFcsS0FBSyx3REFBNkMsSUFDM0QscUJBQUFzVyxRQUFRLENBQUNySCxNQUFNLDhFQUFmLGlCQUFpQkMsT0FBTywwREFBeEIsc0JBQTBCbFAsS0FBSyxpREFBcUMsRUFDbkU7VUFDRDhQLDJCQUEyQixHQUFHRiwrQkFBK0IsQ0FBQzBHLFFBQVEsQ0FBQztRQUN4RTtRQUNBLElBQUluSixtQkFBbUIsQ0FBQ21KLFFBQVEsQ0FBQyxFQUFFO1VBQ2xDO1VBQ0ExTCxjQUFjLEdBQUc7WUFDaEJDLFFBQVEsRUFBRVQscUJBQXFCLENBQUNVLHNCQUFzQjtZQUN0REMsSUFBSSxFQUFFWCxxQkFBcUIsQ0FBQ1ksc0JBQXNCO1lBQ2xEcFQsSUFBSSxFQUFFNlUsUUFBUSxHQUFHeEIsa0JBQWtCLENBQUN3QixRQUFRLEVBQUVuQyxvQkFBb0IsQ0FBQy9TLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBR2pDLFNBQVM7WUFDMUY4WCxXQUFXLEVBQUVaLGdCQUFnQjtZQUM3QmMsU0FBUyxFQUFFYixRQUFRLEtBQUs7VUFDekIsQ0FBQztVQUVELElBQUlyQyxxQkFBcUIsQ0FBQ2MsY0FBYyxFQUFFO1lBQ3pDTixjQUFjLENBQUNPLFlBQVksR0FBR2YscUJBQXFCLENBQUNjLGNBQWM7WUFDbEVOLGNBQWMsQ0FBQ2hULElBQUksR0FBRyxVQUFVLENBQUMsQ0FBQztVQUNuQyxDQUFDLE1BQU0sSUFBSXdTLHFCQUFxQixDQUFDZ0IsZ0JBQWdCLEVBQUU7WUFDbERSLGNBQWMsQ0FBQy9VLElBQUksR0FBR3VVLHFCQUFxQixDQUFDZ0IsZ0JBQWdCO1VBQzdEO1VBQ0EsSUFBSWhCLHFCQUFxQixDQUFDaUIsa0JBQWtCLEVBQUU7WUFDN0NULGNBQWMsQ0FBQ1UsZ0JBQWdCLEdBQUdsQixxQkFBcUIsQ0FBQ2lCLGtCQUFrQjtVQUMzRSxDQUFDLE1BQU0sSUFBSWpCLHFCQUFxQixDQUFDb0Isb0JBQW9CLEVBQUU7WUFDdERaLGNBQWMsQ0FBQzVQLFFBQVEsR0FBR29QLHFCQUFxQixDQUFDb0Isb0JBQW9CO1VBQ3JFO1FBQ0Q7UUFFQSxJQUFJbUIsa0JBQWtEO1FBQ3RELElBQUlGLFFBQVEsRUFBRTtVQUNiRSxrQkFBa0IsR0FBR0MsYUFBYSxDQUFDMEosUUFBUSxFQUFFN0osUUFBUSxDQUFDO1FBQ3ZEO1FBQ0EsTUFBTU8sVUFBOEIsR0FBRztVQUN0Q0MsU0FBUyxFQUFFUixRQUE4QztVQUN6RC9YLGFBQWEsRUFBRTtZQUNkLEdBQUdBLGFBQWE7WUFDaEIsMkJBQUdpWSxrQkFBa0Isd0RBQWxCLG9CQUFvQmpZLGFBQWE7VUFDckMsQ0FBQztVQUNEd1ksV0FBVyxFQUFFO1lBQUUsNEJBQUdQLGtCQUFrQix5REFBbEIscUJBQW9CTyxXQUFXO1VBQUM7UUFDbkQsQ0FBQztRQUNELE1BQU1zSixjQUE4QixHQUFHLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMvSixRQUFRLElBQUksQ0FBQ08sVUFBVSxFQUFFO1VBQzdCO1VBQ0F3SixjQUFjLENBQUNDLGdCQUFnQixHQUFHLElBQUk7UUFDdkM7UUFDQSxNQUFNVixZQUFZLEdBQUcxRCxvQkFBb0IsQ0FBQ2lFLFFBQVEsRUFBRUgscUJBQXFCLENBQUM7UUFDMUUsTUFBTXBKLFFBQVEsR0FBRyxDQUFDZ0osWUFBWSxJQUFJdEQsaUJBQWlCLENBQUM2RCxRQUFRLEVBQUUvZ0IsWUFBWSxFQUFFeVUsa0JBQWtCLENBQUM7UUFDL0YsTUFBTXROLG1CQUFtQixHQUFHckssZ0JBQWdCLENBQUNVLCtCQUErQixDQUFDWCxpQkFBaUIsQ0FBQztRQUMvRixNQUFNc2tCLHVCQUF1QixHQUFHLDBCQUFBaGEsbUJBQW1CLENBQUNzRyxhQUFhLDBEQUFqQyxzQkFBbUMwVCx1QkFBdUIsS0FBSSxJQUFJO1FBQ2xHLE1BQU12aEIsTUFBNkIsR0FBRztVQUNyQzZQLEdBQUcsRUFBRUMsU0FBUyxDQUFDQyx3QkFBd0IsQ0FBQ29SLFFBQVEsQ0FBQztVQUNqRDFlLElBQUksRUFBRTNGLFVBQVUsQ0FBQ3diLFVBQVU7VUFDM0JDLEtBQUssRUFBRW9JLE1BQU07VUFDYmxJLFVBQVUsRUFBRXRCLE9BQU8sR0FBR3FCLFFBQVEsQ0FBQzJJLFFBQVEsQ0FBQyxHQUFHaGhCLFNBQVM7VUFDcER1WSxLQUFLLEVBQUV2QixPQUFPLEdBQUdGLFNBQVMsR0FBRzlXLFNBQVM7VUFDdENxaEIsMkJBQTJCLEVBQUU3RywyQkFBMkI7VUFDeERoTCxjQUFjLEVBQUV6UyxnQkFBZ0IsQ0FBQzBTLCtCQUErQixDQUFDdVIsUUFBUSxDQUFDM1Isa0JBQWtCLENBQUM7VUFDN0ZtSixrQkFBa0IsRUFBRTdCLDRCQUE0QjtVQUNoRHpYLFlBQVksRUFBRXdhLG1DQUFtQyxDQUFDc0gsUUFBUSxDQUFDLEdBQUcsUUFBUSxHQUFHLFNBQVM7VUFDbEYvZixJQUFJLEVBQUVBLElBQUk7VUFDVndiLG1CQUFtQixFQUFFQSxtQkFBbUI7VUFDeEN4YyxZQUFZLEVBQUVBLFlBQVk7VUFDMUJ3WCxRQUFRLEVBQUVBLFFBQVE7VUFDbEIxWCxhQUFhLEVBQUVpVixvQkFBb0IsQ0FBQy9TLE1BQU0sR0FBRytTLG9CQUFvQixHQUFHaFYsU0FBUztVQUM3RW9XLHVCQUF1QixFQUFFbkIsdUJBQXVCLENBQUNoVCxNQUFNLEdBQUcsQ0FBQyxHQUFHZ1QsdUJBQXVCLEdBQUdqVixTQUFTO1VBQ2pHc1YsY0FBYyxFQUFFQSxjQUFjO1VBQzlCdlcsS0FBSyxFQUFFLDBCQUFDaWlCLFFBQVEsQ0FBQzVmLFdBQVcsb0ZBQXBCLHNCQUFzQmtnQixLQUFLLHFGQUEzQix1QkFBNkJDLFdBQVcscUZBQXhDLHVCQUEwQ3hpQixLQUFLLDJEQUEvQyx1QkFBaURpTSxPQUFPLEVBQUUsS0FBZWhMLFNBQVM7VUFDMUZoQixVQUFVLEVBQUU4WixhQUFhLENBQUNrSSxRQUFRLEVBQW9CM1ksWUFBWSxDQUFDO1VBQ25FekssV0FBVyxFQUFFLElBQUk7VUFDakJ3QixhQUFhLEVBQUVBLGFBQWE7VUFDNUJ3WixhQUFhLEVBQUVDLHdCQUF3QixDQUFDOWIsZ0JBQWdCLENBQUM7VUFDekQyYSxVQUFVLEVBQUVBLFVBQVU7VUFDdEJ3SixjQUFjLEVBQUVBLGNBQWM7VUFDOUJ2YixZQUFZLHFCQUFFMlAsY0FBYyxvREFBZCxnQkFBZ0I1UCxRQUFRO1VBQ3RDNlYsZ0JBQWdCLEVBQUU7UUFDbkIsQ0FBQztRQUNEMWIsTUFBTSxDQUFDMmhCLG1CQUFtQixHQUN6QkosdUJBQXVCLEtBQUssSUFBSSxJQUNoQzVpQixpQkFBaUIsS0FBSyxJQUFJLElBQzFCK2hCLG1DQUFtQyxDQUFDUyxRQUFRLEVBQUVSLE1BQU0sRUFBRXpqQixnQkFBZ0IsRUFBRTBqQixZQUFZLENBQUM7UUFDdEYsTUFBTXhILFFBQVEsR0FBR0MsV0FBVyxDQUFDOEgsUUFBUSxDQUFDLElBQUlSLE1BQU07UUFDaEQsSUFBSXZILFFBQVEsRUFBRTtVQUNicFosTUFBTSxDQUFDc1osT0FBTyxHQUFHRixRQUFRO1FBQzFCO1FBQ0EsSUFBSW5FLHFCQUFxQixDQUFDSyxvQ0FBb0MsQ0FBQ2xULE1BQU0sR0FBRyxDQUFDLEVBQUU7VUFDMUUwUyxpQ0FBaUMsQ0FBQzNTLElBQUksQ0FBQyxHQUFHOFMscUJBQXFCLENBQUNLLG9DQUFvQyxDQUFDO1FBQ3RHO1FBQ0EsSUFBSUwscUJBQXFCLENBQUNxQiwwQkFBMEIsSUFBSXRXLE1BQU0sQ0FBQ3lWLGNBQWMsRUFBRTtVQUM5RXpWLE1BQU0sQ0FBQ3NXLDBCQUEwQixHQUFHckIscUJBQXFCLENBQUNxQiwwQkFBMEI7VUFDcEZ0VyxNQUFNLENBQUN5VixjQUFjLENBQUNoVCxJQUFJLEdBQUcsUUFBUTtRQUN0QztRQUVBN0QsaUJBQWlCLENBQUN1RCxJQUFJLENBQUNuQyxNQUFNLENBQUM7O1FBRTlCO1FBQ0FtVixvQkFBb0IsQ0FBQzNVLE9BQU8sQ0FBRW9oQixtQkFBbUIsSUFBSztVQUNyRGhOLGtCQUFrQixDQUFDZ04sbUJBQW1CLENBQUMsR0FBRzNNLHFCQUFxQixDQUFDbEwsVUFBVSxDQUFDNlgsbUJBQW1CLENBQUM7O1VBRS9GO1VBQ0EsSUFBSWhCLFlBQVksRUFBRTtZQUNqQi9MLGtCQUFrQixDQUFDMVMsSUFBSSxDQUFDeWYsbUJBQW1CLENBQUM7VUFDN0M7UUFDRCxDQUFDLENBQUM7O1FBRUY7UUFDQXhNLHVCQUF1QixDQUFDNVUsT0FBTyxDQUFFcWhCLHNCQUFzQixJQUFLO1VBQzNEO1VBQ0FqTixrQkFBa0IsQ0FBQ2lOLHNCQUFzQixDQUFDLEdBQUc1TSxxQkFBcUIsQ0FBQ0ksb0JBQW9CLENBQUN3TSxzQkFBc0IsQ0FBQztRQUNoSCxDQUFDLENBQUM7TUFDSCxDQUFDLENBQUM7SUFDSDs7SUFFQTtJQUNBLE9BQU9sWix3QkFBd0IsQ0FDOUJpTSxrQkFBa0IsRUFDbEJuVixVQUFVLEVBQ1ZiLGlCQUFpQixFQUNqQmlXLGtCQUFrQixFQUNsQjNYLGdCQUFnQixFQUNoQjJXLFNBQVMsRUFDVGlCLGlDQUFpQyxDQUNqQztFQUNGLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNZ04saUJBQWlCLEdBQUcsVUFDekIvWCxVQUFnQyxFQUNoQ25MLGlCQUEwQyxFQUMxQzFCLGdCQUFrQyxFQUNsQ3VDLFVBQXNCLEVBQ0M7SUFDdkIsSUFBSXNpQixpQkFBdUM7SUFDM0MsSUFBSWhZLFVBQVUsRUFBRTtNQUNmZ1ksaUJBQWlCLEdBQUdoWSxVQUFVLENBQUNySSxHQUFHLENBQUMsVUFBVTZiLFlBQVksRUFBRTtRQUMxRCxNQUFNdGQsZ0JBQWdCLEdBQUdyQixpQkFBaUIsQ0FBQ21CLElBQUksQ0FBQyxVQUFVRSxnQkFBZ0IsRUFBRTtVQUMzRSxPQUFPQSxnQkFBZ0IsQ0FBQ0csWUFBWSxLQUFLbWQsWUFBWSxJQUFJdGQsZ0JBQWdCLENBQUNDLGFBQWEsS0FBS0MsU0FBUztRQUN0RyxDQUFDLENBQUM7UUFDRixJQUFJRixnQkFBZ0IsRUFBRTtVQUNyQixPQUFPQSxnQkFBZ0IsQ0FBQ21CLElBQUk7UUFDN0IsQ0FBQyxNQUFNO1VBQ04sTUFBTW9WLGNBQWMsR0FBR0MscUJBQXFCLENBQzNDO1lBQUUsQ0FBQzhHLFlBQVksR0FBRzlkLFVBQVUsQ0FBQ3VpQixXQUFXLENBQUN6RSxZQUFZO1VBQUUsQ0FBQyxFQUN4RDNlLGlCQUFpQixFQUNqQixFQUFFLEVBQ0YxQixnQkFBZ0IsRUFDaEJ1QyxVQUFVLEVBQ1YsRUFBRSxDQUNGO1VBQ0RiLGlCQUFpQixDQUFDdUQsSUFBSSxDQUFDcVUsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ3pDLE9BQU9BLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQ3BWLElBQUk7UUFDOUI7TUFDRCxDQUFDLENBQUM7SUFDSDtJQUVBLE9BQU8yZ0IsaUJBQWlCO0VBQ3pCLENBQUM7RUFFRCxNQUFNRSxxQkFBcUIsR0FBRyxVQUFVbFksVUFBb0IsRUFBVTtJQUNyRSxPQUFPQSxVQUFVLENBQ2ZySSxHQUFHLENBQUVQLFFBQVEsSUFBSztNQUNsQixPQUFRLElBQUc0SSxVQUFVLENBQUM1RyxPQUFPLENBQUNoQyxRQUFRLENBQUUsR0FBRTtJQUMzQyxDQUFDLENBQUMsQ0FDRG1KLElBQUksQ0FBRSxHQUFFLElBQUssRUFBQyxDQUFDO0VBQ2xCLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNdkwsc0JBQXNCLEdBQUcsVUFDOUJDLE9BQXVGLEVBQ3ZGSixpQkFBMEMsRUFDMUMxQixnQkFBa0MsRUFDbEN1QyxVQUFzQixFQUN0QnRDLGtCQUFvRCxFQUNuQjtJQUNqQyxNQUFNK2tCLGVBQStDLEdBQUcsQ0FBQyxDQUFDO0lBRTFELFNBQVNDLGtCQUFrQixDQUMxQm5pQixNQUFzRSxFQUN0RTZQLEdBQVcsRUFDcUM7TUFDaEQsT0FBT2pSLGlCQUFpQixDQUFDME4sSUFBSSxDQUFFck0sZ0JBQWdCLElBQUtBLGdCQUFnQixDQUFDNFAsR0FBRyxLQUFLQSxHQUFHLENBQUM7SUFDbEY7SUFFQSxTQUFTdVMsWUFBWSxDQUFDQyxjQUF3QyxFQUErQztNQUM1RyxPQUFPQSxjQUFjLENBQUM1ZixJQUFJLEtBQUszRixVQUFVLENBQUN3bEIsSUFBSTtJQUMvQztJQUVBLFNBQVNDLGNBQWMsQ0FBQ0YsY0FBd0MsRUFBaUQ7TUFDaEgsT0FBT0EsY0FBYyxDQUFDNWYsSUFBSSxLQUFLdEMsU0FBUyxJQUFJLENBQUMsQ0FBQ2tpQixjQUFjLENBQUMzTSxRQUFRO0lBQ3RFO0lBRUEsU0FBUzhNLHNDQUFzQyxDQUFDdGlCLGFBQXVCLEVBQUV1aUIsc0JBQStDLEVBQUU7TUFDekgsTUFBTTVOLGtCQUE0QixHQUFHa00sb0NBQW9DLENBQUM3akIsZ0JBQWdCLENBQUNnTSxZQUFZLEVBQUUsQ0FBQztNQUMxR2hKLGFBQWEsQ0FBQ00sT0FBTyxDQUFFVyxRQUFRLElBQUs7UUFDbkNzaEIsc0JBQXNCLENBQUNqaUIsT0FBTyxDQUFFa2lCLElBQUksSUFBSztVQUN4QyxJQUFJQSxJQUFJLENBQUN0aEIsSUFBSSxLQUFLRCxRQUFRLEVBQUU7WUFDM0J1aEIsSUFBSSxDQUFDOUssUUFBUSxHQUFHL0Msa0JBQWtCLENBQUMxUixPQUFPLENBQUNoQyxRQUFRLENBQUN3aEIsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyRkQsSUFBSSxDQUFDOUosV0FBVyxHQUFHOEosSUFBSSxDQUFDOUssUUFBUTtVQUNqQztRQUNELENBQUMsQ0FBQztNQUNILENBQUMsQ0FBQztJQUNIO0lBRUEsS0FBSyxNQUFNL0gsR0FBRyxJQUFJN1EsT0FBTyxFQUFFO01BQUE7TUFDMUIsTUFBTXFqQixjQUFjLEdBQUdyakIsT0FBTyxDQUFDNlEsR0FBRyxDQUFDO01BQ25DQyxTQUFTLENBQUM4UyxXQUFXLENBQUMvUyxHQUFHLENBQUM7O01BRTFCO01BQ0EsTUFBTWdULGVBQWUsR0FBRztRQUN2QmhULEdBQUcsRUFBRUEsR0FBRztRQUNSM1EsS0FBSyxFQUFFbWpCLGNBQWMsQ0FBQ25qQixLQUFLLElBQUlpQixTQUFTO1FBQ3hDMmlCLFFBQVEsRUFBRTtVQUNUQyxNQUFNLDJCQUFFVixjQUFjLENBQUNTLFFBQVEsMERBQXZCLHNCQUF5QkMsTUFBTTtVQUN2Q0MsU0FBUyxFQUFFWCxjQUFjLENBQUNTLFFBQVEsS0FBSzNpQixTQUFTLEdBQUc4aUIsU0FBUyxDQUFDQyxLQUFLLEdBQUdiLGNBQWMsQ0FBQ1MsUUFBUSxDQUFDRTtRQUM5RixDQUFDO1FBQ0RqSyxhQUFhLEVBQUVDLHdCQUF3QixDQUFDOWIsZ0JBQWdCO01BQ3pELENBQUM7TUFFRCxJQUFJaWxCLGtCQUFrQixDQUFDRSxjQUFjLEVBQUV4UyxHQUFHLENBQUMsRUFBRTtRQUM1QyxNQUFNc1QscUNBQXNGLEdBQUc7VUFDOUYsR0FBR04sZUFBZTtVQUNsQjFqQixVQUFVLEVBQUVrakIsY0FBYyxhQUFkQSxjQUFjLHVCQUFkQSxjQUFjLENBQUVsakIsVUFBVTtVQUN0Q0MsZUFBZSxFQUFFaWpCLGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFampCLGVBQWU7VUFDaERDLFlBQVksRUFBRWdqQixjQUFjLGFBQWRBLGNBQWMsdUJBQWRBLGNBQWMsQ0FBRWhqQixZQUFZO1VBQzFDb0QsSUFBSSxFQUFFM0YsVUFBVSxDQUFDd2IsVUFBVTtVQUMzQnZhLFdBQVcsRUFBRW9rQixrQkFBa0IsQ0FBQ0UsY0FBYyxFQUFFeFMsR0FBRyxDQUFDLEdBQ2pEMVAsU0FBUyxHQUNUaWpCLGlCQUFpQixDQUFDZixjQUFjLEVBQUVsbEIsa0JBQWtCLEVBQUUsSUFBSSxDQUFDO1VBQzlEbUMsUUFBUSxFQUFFK2lCLGNBQWMsQ0FBQy9pQixRQUFRO1VBQ2pDQyxhQUFhLEVBQUV3ZSxnQ0FBZ0MsQ0FBQ3NFLGNBQWMsQ0FBQzlpQixhQUFhO1FBQzdFLENBQUM7UUFDRDJpQixlQUFlLENBQUNyUyxHQUFHLENBQUMsR0FBR3NULHFDQUFxQztNQUM3RCxDQUFDLE1BQU07UUFBQTtRQUNOLE1BQU1qakIsYUFBbUMsR0FBRzRoQixpQkFBaUIsQ0FDNURPLGNBQWMsQ0FBQ3RZLFVBQVUsRUFDekJuTCxpQkFBaUIsRUFDakIxQixnQkFBZ0IsRUFDaEJ1QyxVQUFVLENBQ1Y7UUFDRCxNQUFNNGpCLGtCQUFrQixHQUFHO1VBQzFCLEdBQUdSLGVBQWU7VUFDbEJTLE1BQU0sRUFBRWpCLGNBQWMsQ0FBQ2lCLE1BQU07VUFDN0Jua0IsVUFBVSxFQUFFLENBQUFrakIsY0FBYyxhQUFkQSxjQUFjLHVCQUFkQSxjQUFjLENBQUVsakIsVUFBVSxLQUFJc2dCLFVBQVUsQ0FBQzFSLElBQUk7VUFDekQzTyxlQUFlLEVBQUUsQ0FBQWlqQixjQUFjLGFBQWRBLGNBQWMsdUJBQWRBLGNBQWMsQ0FBRWpqQixlQUFlLEtBQUlta0IsZUFBZSxDQUFDQyxLQUFLO1VBQ3pFbmtCLFlBQVksRUFBRSxDQUFBZ2pCLGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFaGpCLFlBQVksS0FBSSxTQUFTO1VBQ3ZEcVcsUUFBUSxFQUFFMk0sY0FBYyxDQUFDM00sUUFBUTtVQUNqQ3hWLGFBQWEsRUFBRUEsYUFBYTtVQUM1QnVWLGNBQWMsRUFBRXZWLGFBQWEsR0FDMUI7WUFDQXdWLFFBQVEsRUFBRXVNLHFCQUFxQixDQUFDL2hCLGFBQWEsQ0FBQztZQUM5QzBWLElBQUksRUFBRSxDQUFDLEVBQUUxVixhQUFhLENBQUNrQyxNQUFNLEdBQUcsQ0FBQztVQUNqQyxDQUFDLEdBQ0QsSUFBSTtVQUNQcWhCLEVBQUUsRUFBRyxpQkFBZ0I1VCxHQUFJLEVBQUM7VUFDMUJ6TyxJQUFJLEVBQUcsaUJBQWdCeU8sR0FBSSxFQUFDO1VBQzVCO1VBQ0F0USxhQUFhLEVBQUU7WUFBRXllLGFBQWEsRUFBRTtVQUFFLENBQUM7VUFDbkNwRixXQUFXLEVBQUUsS0FBSztVQUNsQjdhLFdBQVcsRUFBRSxLQUFLO1VBQ2xCNlosUUFBUSxFQUFFLEtBQUs7VUFDZnlKLGNBQWMsRUFBRTtZQUFFQyxnQkFBZ0IsRUFBRTtVQUFLLENBQUM7VUFDMUN2WCxVQUFVLEVBQUVzWSxjQUFjLENBQUN0WSxVQUFVO1VBQ3JDdVAsT0FBTyxFQUFFK0ksY0FBYyxDQUFDaUI7UUFDekIsQ0FBQztRQUNELDZCQUFJakIsY0FBYyxDQUFDaUIsTUFBTSxrREFBckIsc0JBQXVCSSxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUU7VUFBQTtVQUNyRCxNQUFNQyxhQUFhLDZCQUFHdEIsY0FBYyxDQUFDaUIsTUFBTSwyREFBckIsdUJBQXVCNVgsU0FBUyxDQUFDLEVBQUUsRUFBRSwyQkFBQTJXLGNBQWMsQ0FBQ2lCLE1BQU0sMkRBQXJCLHVCQUF1QmxoQixNQUFNLElBQUcsQ0FBQyxDQUFDO1VBQzdGLElBQUk7WUFDSGloQixrQkFBa0IsQ0FBQ0MsTUFBTSxHQUFHcG1CLGdCQUFnQixDQUFDMG1CLHVCQUF1QixDQUFDRCxhQUFhLENBQUMsQ0FBQzVpQixVQUFVLENBQUNnRixRQUFRLEVBQUU7VUFDMUcsQ0FBQyxDQUFDLE9BQU84ZCxDQUFDLEVBQUU7WUFDWEMsR0FBRyxDQUFDQyxJQUFJLENBQUUsc0RBQXFESixhQUFjLEVBQUMsQ0FBQztVQUNoRjtRQUNEO1FBQ0EsSUFBSXpqQixhQUFhLEVBQUU7VUFDbEJzaUIsc0NBQXNDLENBQUN0aUIsYUFBYSxFQUFFdEIsaUJBQWlCLENBQUM7UUFDekU7UUFDQSxJQUFJd2pCLFlBQVksQ0FBQ0MsY0FBYyxDQUFDLEVBQUU7VUFDakMsTUFBTTJCLGlCQUF3RCxHQUFHO1lBQ2hFLEdBQUdYLGtCQUFrQjtZQUNyQjVnQixJQUFJLEVBQUUzRixVQUFVLENBQUN3bEI7VUFDbEIsQ0FBQztVQUNESixlQUFlLENBQUNyUyxHQUFHLENBQUMsR0FBR21VLGlCQUFpQjtRQUN6QyxDQUFDLE1BQU0sSUFBSXpCLGNBQWMsQ0FBQ0YsY0FBYyxDQUFDLEVBQUU7VUFDMUMsTUFBTTJCLGlCQUF3RCxHQUFHO1lBQ2hFLEdBQUdYLGtCQUFrQjtZQUNyQjVnQixJQUFJLEVBQUUzRixVQUFVLENBQUMwVDtVQUNsQixDQUFDO1VBQ0QwUixlQUFlLENBQUNyUyxHQUFHLENBQUMsR0FBR21VLGlCQUFpQjtRQUN6QyxDQUFDLE1BQU07VUFBQTtVQUNOLE1BQU1DLE9BQU8sR0FBSSwwQkFBeUJwVSxHQUFJLDJDQUEwQztVQUN4RjNTLGdCQUFnQixDQUNkZ25CLGNBQWMsRUFBRSxDQUNoQkMsUUFBUSxDQUNSQyxhQUFhLENBQUNDLFFBQVEsRUFDdEJDLGFBQWEsQ0FBQ0MsR0FBRyxFQUNqQk4sT0FBTyxFQUNQTyxpQkFBaUIsRUFDakJBLGlCQUFpQixhQUFqQkEsaUJBQWlCLGdEQUFqQkEsaUJBQWlCLENBQUVDLGlCQUFpQiwwREFBcEMsc0JBQXNDQyxVQUFVLENBQ2hEO1FBQ0g7TUFDRDtJQUNEO0lBQ0EsT0FBT3hDLGVBQWU7RUFDdkIsQ0FBQztFQUVNLFNBQVN5QyxXQUFXLENBQzFCMW5CLGlCQUF5QixFQUN6QkMsZ0JBQWtDLEVBQ2xDaVYsMEJBQXFELEVBQ2hDO0lBQUE7SUFDckIsTUFBTXhPLGVBQWdDLEdBQUd6RyxnQkFBZ0IsQ0FBQzBHLGtCQUFrQixFQUFFO0lBQzlFLE1BQU0rSixxQkFBaUQsR0FBR3pRLGdCQUFnQixDQUFDVSwrQkFBK0IsQ0FBQ1gsaUJBQWlCLENBQUM7SUFDN0gsTUFBTTJuQixpQkFBd0MsR0FBR2poQixlQUFlLENBQUNraEIsb0JBQW9CLEVBQUU7SUFDdkYsTUFBTUMsZ0JBQTBCLEdBQUcsRUFBRTtJQUNyQyxNQUFNQyxpQkFBaUIsR0FBRzVTLDBCQUEwQixDQUFDMVAsSUFBSSxLQUFLLGlCQUFpQjtJQUMvRSxNQUFNdWlCLGlCQUFpQixHQUFHN1MsMEJBQTBCLENBQUMxUCxJQUFJLEtBQUssaUJBQWlCO0lBQy9FLElBQUksQ0FBQWtMLHFCQUFxQixhQUFyQkEscUJBQXFCLGlEQUFyQkEscUJBQXFCLENBQUVFLGFBQWEsMkRBQXBDLHVCQUFzQ29YLGVBQWUsTUFBSzlrQixTQUFTLEVBQUU7TUFDeEU7TUFDQSxNQUFNOGtCLGVBQWUsR0FBR3RYLHFCQUFxQixDQUFDRSxhQUFhLENBQUNvWCxlQUFlO01BQzNFLElBQUlBLGVBQWUsS0FBSyxJQUFJLEVBQUU7UUFDN0I7UUFDQSxRQUFROVMsMEJBQTBCLENBQUMxUCxJQUFJO1VBQ3RDLEtBQUssaUJBQWlCO1lBQ3JCLE9BQU8sb0NBQW9DO1VBQzVDLEtBQUssaUJBQWlCO1lBQ3JCLE9BQU8sMEJBQTBCO1VBQ2xDO1lBQ0MsT0FBTyxvQkFBb0I7UUFBQztNQUUvQixDQUFDLE1BQU0sSUFBSSxPQUFPd2lCLGVBQWUsS0FBSyxRQUFRLEVBQUU7UUFDL0M7UUFDQSxJQUFJQSxlQUFlLENBQUNDLElBQUksRUFBRTtVQUN6QkosZ0JBQWdCLENBQUMzaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUM5QjtRQUNBLElBQUk4aUIsZUFBZSxDQUFDamxCLE1BQU0sRUFBRTtVQUMzQjhrQixnQkFBZ0IsQ0FBQzNpQixJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2hDO1FBQ0EsSUFBSThpQixlQUFlLENBQUM1VixNQUFNLEVBQUU7VUFDM0J5VixnQkFBZ0IsQ0FBQzNpQixJQUFJLENBQUMsUUFBUSxDQUFDO1FBQ2hDO1FBQ0EsSUFBSThpQixlQUFlLENBQUN2TSxLQUFLLEtBQUtxTSxpQkFBaUIsSUFBSUMsaUJBQWlCLENBQUMsRUFBRTtVQUN0RUYsZ0JBQWdCLENBQUMzaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUMvQjtRQUNBLElBQUk4aUIsZUFBZSxDQUFDRSxTQUFTLElBQUlKLGlCQUFpQixFQUFFO1VBQ25ERCxnQkFBZ0IsQ0FBQzNpQixJQUFJLENBQUMsV0FBVyxDQUFDO1FBQ25DO1FBQ0EsT0FBTzJpQixnQkFBZ0IsQ0FBQzFpQixNQUFNLEdBQUcsQ0FBQyxHQUFHMGlCLGdCQUFnQixDQUFDeGEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHbkssU0FBUztNQUM1RTtJQUNELENBQUMsTUFBTTtNQUNOO01BQ0Eya0IsZ0JBQWdCLENBQUMzaUIsSUFBSSxDQUFDLE1BQU0sQ0FBQztNQUM3QjJpQixnQkFBZ0IsQ0FBQzNpQixJQUFJLENBQUMsUUFBUSxDQUFDO01BQy9CLElBQUlqRixnQkFBZ0IsQ0FBQ2tSLGVBQWUsRUFBRSxLQUFLQyxZQUFZLENBQUMrVyxVQUFVLEVBQUU7UUFDbkUsSUFBSVIsaUJBQWlCLEtBQUtTLHFCQUFxQixDQUFDQyxPQUFPLElBQUlDLGtCQUFrQixDQUFDNWhCLGVBQWUsRUFBRXpHLGdCQUFnQixDQUFDLEVBQUU7VUFDakg7VUFDQTtVQUNBO1VBQ0E0bkIsZ0JBQWdCLENBQUMzaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNoQztNQUNELENBQUMsTUFBTTtRQUNOMmlCLGdCQUFnQixDQUFDM2lCLElBQUksQ0FBQyxRQUFRLENBQUM7TUFDaEM7TUFFQSxJQUFJNGlCLGlCQUFpQixFQUFFO1FBQ3RCRCxnQkFBZ0IsQ0FBQzNpQixJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzlCMmlCLGdCQUFnQixDQUFDM2lCLElBQUksQ0FBQyxXQUFXLENBQUM7TUFDbkM7TUFDQSxJQUFJNmlCLGlCQUFpQixFQUFFO1FBQ3RCRixnQkFBZ0IsQ0FBQzNpQixJQUFJLENBQUMsT0FBTyxDQUFDO01BQy9CO01BQ0EsT0FBTzJpQixnQkFBZ0IsQ0FBQ3hhLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbEM7SUFDQSxPQUFPbkssU0FBUztFQUNqQjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVRBO0VBVUEsU0FBU29sQixrQkFBa0IsQ0FBQzVoQixlQUFnQyxFQUFFekcsZ0JBQWtDLEVBQVc7SUFDMUcsT0FDQ3lHLGVBQWUsQ0FBQzZoQixpQkFBaUIsRUFBRSxJQUNuQyxDQUFDdG9CLGdCQUFnQixDQUFDMEcsa0JBQWtCLEVBQUUsQ0FBQzZoQix5QkFBeUIsRUFBRSxJQUNsRXZvQixnQkFBZ0IsQ0FBQ2tSLGVBQWUsRUFBRSxLQUFLQyxZQUFZLENBQUNxWCxrQkFBa0I7RUFFeEU7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLGlCQUFpQixDQUN6QnpvQixnQkFBa0MsRUFDbENxRiw2QkFBa0UsRUFDbEV2RCxPQUFzQixFQUNEO0lBQ3JCO0lBQ0EsTUFBTTRtQixxQkFBcUIsR0FBRzdFLG9DQUFvQyxDQUFDN2pCLGdCQUFnQixDQUFDZ00sWUFBWSxFQUFFLENBQUM7SUFDbkcsSUFBSTJjLGNBQWtDO0lBQ3RDLElBQUl0akIsNkJBQTZCLGFBQTdCQSw2QkFBNkIsZUFBN0JBLDZCQUE2QixDQUFFdWpCLFNBQVMsRUFBRTtNQUM3QyxNQUFNQyxPQUFxQixHQUFHLEVBQUU7TUFDaEMsTUFBTUMsVUFBVSxHQUFHO1FBQ2xCRCxPQUFPLEVBQUVBO01BQ1YsQ0FBQztNQUNEeGpCLDZCQUE2QixDQUFDdWpCLFNBQVMsQ0FBQ3RsQixPQUFPLENBQUV5bEIsU0FBUyxJQUFLO1FBQUE7UUFDOUQsTUFBTUMsaUJBQWlCLEdBQUdELFNBQVMsQ0FBQ0UsUUFBUTtRQUM1QyxJQUFJRCxpQkFBaUIsSUFBSU4scUJBQXFCLENBQUN6aUIsT0FBTywwQkFBQytpQixpQkFBaUIsQ0FBQ25NLE9BQU8sMERBQXpCLHNCQUEyQjNZLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1VBQy9GLE1BQU1nbEIsUUFBUSxHQUFHQywrQkFBK0IsQ0FBQyxDQUFDSCxpQkFBaUIsQ0FBQyxFQUFFbG5CLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUNqRixJQUFJb25CLFFBQVEsRUFBRTtZQUNiSixVQUFVLENBQUNELE9BQU8sQ0FBQzVqQixJQUFJLENBQUM7Y0FDdkJmLElBQUksRUFBRWdsQixRQUFRO2NBQ2RFLFVBQVUsRUFBRSxDQUFDLENBQUNMLFNBQVMsQ0FBQ007WUFDekIsQ0FBQyxDQUFDO1VBQ0g7UUFDRDtNQUNELENBQUMsQ0FBQztNQUNGVixjQUFjLEdBQUdHLFVBQVUsQ0FBQ0QsT0FBTyxDQUFDM2pCLE1BQU0sR0FBRytGLElBQUksQ0FBQ0MsU0FBUyxDQUFDNGQsVUFBVSxDQUFDLEdBQUc3bEIsU0FBUztJQUNwRjtJQUNBLE9BQU8wbEIsY0FBYztFQUN0QjtFQUVBLFNBQVNXLHdCQUF3QixDQUFDamtCLDZCQUFrRSxFQUFzQjtJQUFBO0lBQ3pILElBQUksQ0FBQ0EsNkJBQTZCLEVBQUU7TUFDbkMsT0FBT3BDLFNBQVM7SUFDakI7SUFFQSxNQUFNc21CLEtBQUssNEJBQUdsa0IsNkJBQTZCLENBQUNta0IscUJBQXFCLDBEQUFuRCxzQkFBcUR2YixPQUFPLEVBQUU7SUFFNUUsT0FBTyxPQUFPc2IsS0FBSyxLQUFLLFFBQVEsR0FBR0EsS0FBSyxHQUFHdG1CLFNBQVM7RUFDckQ7RUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQSxTQUFTa21CLCtCQUErQixDQUFDTSxLQUFxQixFQUFFM25CLE9BQXNCLEVBQVk7SUFDakcsTUFBTTRuQixTQUFtQixHQUFHLEVBQUU7SUFDOUIsSUFBSS9LLFlBQXFDLEVBQUU1YixnQkFBdUM7SUFDbEYwbUIsS0FBSyxDQUFDbm1CLE9BQU8sQ0FBRXFtQixXQUFXLElBQUs7TUFDOUIsSUFBSUEsV0FBVyxhQUFYQSxXQUFXLGVBQVhBLFdBQVcsQ0FBRWpsQixLQUFLLEVBQUU7UUFDdkJpYSxZQUFZLEdBQUc3YyxPQUFPLENBQUNlLElBQUksQ0FBRUMsTUFBTSxJQUFLO1VBQ3ZDQyxnQkFBZ0IsR0FBR0QsTUFBK0I7VUFDbEQsT0FBTyxDQUFDQyxnQkFBZ0IsQ0FBQ0MsYUFBYSxJQUFJRCxnQkFBZ0IsQ0FBQ0csWUFBWSxNQUFLeW1CLFdBQVcsYUFBWEEsV0FBVyx1QkFBWEEsV0FBVyxDQUFFamxCLEtBQUs7UUFDL0YsQ0FBQyxDQUFDO1FBQ0YsSUFBSWlhLFlBQVksRUFBRTtVQUNqQitLLFNBQVMsQ0FBQ3prQixJQUFJLENBQUMwWixZQUFZLENBQUN6YSxJQUFJLENBQUM7UUFDbEM7TUFDRDtJQUNELENBQUMsQ0FBQztJQUVGLE9BQU93bEIsU0FBUztFQUNqQjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU3ZqQixrQkFBa0IsQ0FDMUJkLDZCQUFrRSxFQUNsRXZELE9BQXNCLEVBQ3RCNlUsU0FBaUIsRUFDSTtJQUNyQixJQUFJelEsZUFBbUM7SUFDdkMsSUFBSWIsNkJBQTZCLGFBQTdCQSw2QkFBNkIsZUFBN0JBLDZCQUE2QixDQUFFdWtCLE9BQU8sRUFBRTtNQUMzQyxJQUFJQyxRQUFRLEdBQUd4a0IsNkJBQTZCLENBQUN1a0IsT0FBTztNQUNwRCxJQUFJalQsU0FBUyxLQUFLLGlCQUFpQixFQUFFO1FBQ3BDa1QsUUFBUSxHQUFHQSxRQUFRLENBQUM3YSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztNQUNoQztNQUNBLE1BQU04YSxZQUFZLEdBQUdYLCtCQUErQixDQUFDVSxRQUFRLEVBQUUvbkIsT0FBTyxDQUFDLENBQUMwQyxHQUFHLENBQUUwa0IsUUFBUSxJQUFLO1FBQ3pGLE9BQU87VUFBRWhsQixJQUFJLEVBQUVnbEI7UUFBUyxDQUFDO01BQzFCLENBQUMsQ0FBQztNQUVGaGpCLGVBQWUsR0FBRzRqQixZQUFZLENBQUM1a0IsTUFBTSxHQUFHK0YsSUFBSSxDQUFDQyxTQUFTLENBQUM7UUFBRTZlLFdBQVcsRUFBRUQ7TUFBYSxDQUFDLENBQUMsR0FBRzdtQixTQUFTO0lBQ2xHO0lBQ0EsT0FBT2lELGVBQWU7RUFDdkI7RUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztFQUVBLFNBQVNMLDZDQUE2QyxDQUFDVCxrQkFBc0MsRUFBRTtJQUM5RixNQUFNMFosZ0NBQXdELEdBQUcsQ0FBQyxDQUFDO0lBQ25FMVosa0JBQWtCLENBQUN0RCxPQUFPLENBQUN3QixPQUFPLENBQUVSLE1BQU0sSUFBSztNQUFBO01BQzlDQSxNQUFNLEdBQUdBLE1BQStCO01BQ3hDLE1BQU1rbkIsd0JBQXdCLEdBQUduakIsTUFBTSxDQUFDQyxJQUFJLENBQUMxQixrQkFBa0IsQ0FBQ1EsVUFBVSxDQUFFLENBQUMvQyxJQUFJLENBQUVvbEIsU0FBUyxJQUFLQSxTQUFTLEtBQUtubEIsTUFBTSxDQUFDb0IsSUFBSSxDQUFDO01BQzNILElBQUk4bEIsd0JBQXdCLEVBQUU7UUFDN0IsTUFBTUMsOEJBQThCLEdBQUc3a0Isa0JBQWtCLENBQUNRLFVBQVUsQ0FBRW9rQix3QkFBd0IsQ0FBQztRQUMvRmxuQixNQUFNLENBQUNvYyxZQUFZLEdBQUcsSUFBSTtRQUMxQnBjLE1BQU0sQ0FBQ3FjLFNBQVMsR0FBRztVQUNsQitLLGVBQWUsRUFBRUQsOEJBQThCLENBQUNubEIsZ0JBQWdCLElBQUksQ0FBQztRQUN0RSxDQUFDO01BQ0Y7TUFDQSw4QkFBSWhDLE1BQU0sQ0FBQ3VXLHVCQUF1QixtREFBOUIsdUJBQWdDblUsTUFBTSxFQUFFO1FBQzNDcEMsTUFBTSxDQUFDdVcsdUJBQXVCLENBQUMvVixPQUFPLENBQUU2bUIsc0JBQXNCLElBQUs7VUFDbEU7VUFDQTtVQUNBdEwsdUJBQXVCLENBQUNzTCxzQkFBc0IsRUFBRS9rQixrQkFBa0IsQ0FBQ3RELE9BQU8sRUFBRWdkLGdDQUFnQyxDQUFDO1FBQzlHLENBQUMsQ0FBQztNQUNIO0lBQ0QsQ0FBQyxDQUFDO0lBQ0YxWixrQkFBa0IsQ0FBQ3RELE9BQU8sQ0FBQ3dCLE9BQU8sQ0FBRVIsTUFBTSxJQUFLO01BQzlDQSxNQUFNLEdBQUdBLE1BQStCO01BQ3hDLElBQUlBLE1BQU0sQ0FBQ3VXLHVCQUF1QixFQUFFO1FBQUE7UUFDbkN2VyxNQUFNLENBQUN1Vyx1QkFBdUIsR0FBR3ZXLE1BQU0sQ0FBQ3VXLHVCQUF1QixDQUFDN1UsR0FBRyxDQUNqRW1hLFlBQVksSUFBS0csZ0NBQWdDLENBQUNILFlBQVksQ0FBQyxJQUFJQSxZQUFZLENBQ2hGO1FBQ0Q7UUFDQTdiLE1BQU0sQ0FBQ0UsYUFBYSw2QkFBR0YsTUFBTSxDQUFDRSxhQUFhLDJEQUFwQix1QkFBc0JnUCxNQUFNLENBQUNsUCxNQUFNLENBQUN1Vyx1QkFBdUIsQ0FBQztNQUNwRjtJQUNELENBQUMsQ0FBQztFQUNIOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU2hULHNCQUFzQixDQUM5QmhCLDZCQUFrRSxFQUNsRXZELE9BQXNCLEVBQ0Q7SUFDckIsSUFBSXNFLG1CQUF1QztJQUMzQyxJQUFJZiw2QkFBNkIsYUFBN0JBLDZCQUE2QixlQUE3QkEsNkJBQTZCLENBQUUra0IsS0FBSyxFQUFFO01BQ3pDLE1BQU1DLE9BQU8sR0FBR2hsQiw2QkFBNkIsQ0FBQytrQixLQUFLO01BQ25ELE1BQU14a0IsVUFBa0MsR0FBRyxDQUFDLENBQUM7TUFDN0N1akIsK0JBQStCLENBQUNrQixPQUFPLEVBQUV2b0IsT0FBTyxDQUFDLENBQUN3QixPQUFPLENBQUU0bEIsUUFBUSxJQUFLO1FBQ3ZFdGpCLFVBQVUsQ0FBQ3NqQixRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDMUIsQ0FBQyxDQUFDO01BRUY5aUIsbUJBQW1CLEdBQUc2RSxJQUFJLENBQUNDLFNBQVMsQ0FBQ3RGLFVBQVUsQ0FBQztJQUNqRDtJQUVBLE9BQU9RLG1CQUFtQjtFQUMzQjtFQUVPLFNBQVMyRSwrQkFBK0IsQ0FDOUNqTCxrQkFBd0MsRUFDeENDLGlCQUF5QixFQUN6QkMsZ0JBQWtDLEVBQ2xDaVYsMEJBQXFELEVBQ3JEblQsT0FBc0IsRUFDdEJ1RCw2QkFBdUQsRUFDdkQrRSxpQkFBeUMsRUFDekMzSSxpQkFBMkIsRUFDSTtJQUFBO0lBQy9CO0lBQ0EsTUFBTTtNQUFFK0U7SUFBdUIsQ0FBQyxHQUFHK0QsU0FBUyxDQUFDeEssaUJBQWlCLENBQUM7SUFDL0QsTUFBTXVxQixjQUFjLDhCQUFHdHFCLGdCQUFnQixDQUFDZ0gsc0JBQXNCLEVBQUUsQ0FBQ3FOLGdCQUFnQixDQUFDaFEsV0FBVyx1RkFBdEUsd0JBQXdFb0YsRUFBRSx1RkFBMUUsd0JBQTRFQyxVQUFVLDREQUF0Rix3QkFBd0Y2Z0IsY0FBYztJQUM3SCxNQUFNQyxLQUFLLEdBQUdGLGNBQWMsSUFBSWpaLGlCQUFpQixDQUFDMEIsMkJBQTJCLENBQUN1WCxjQUFjLENBQUMsQ0FBQztJQUM5RixNQUFNdmUsU0FBUyxHQUFHL0wsZ0JBQWdCLENBQUNnSCxzQkFBc0IsRUFBRSxDQUFDSSxlQUFlO0lBQzNFLE1BQU1xakIsb0JBQXFDLEdBQUd6cUIsZ0JBQWdCLENBQUMwRyxrQkFBa0IsRUFBRTtJQUNuRixNQUFNZ2tCLGVBQWUsR0FBR2xrQixzQkFBc0IsQ0FBQ3RCLE1BQU0sS0FBSyxDQUFDO01BQzFEeWxCLFFBQTRCLEdBQUdsRCxXQUFXLENBQUMxbkIsaUJBQWlCLEVBQUVDLGdCQUFnQixFQUFFaVYsMEJBQTBCLENBQUM7TUFDM0dzUixFQUFFLEdBQUcvZixzQkFBc0IsR0FBR29rQixVQUFVLENBQUM3cUIsaUJBQWlCLENBQUMsR0FBRzZxQixVQUFVLENBQUM1cUIsZ0JBQWdCLENBQUNrSCxjQUFjLEVBQUUsRUFBRSxVQUFVLENBQUM7SUFDeEgsTUFBTW9KLGtCQUFrQixHQUFHTCx3QkFBd0IsQ0FBQ2pRLGdCQUFnQixDQUFDO0lBQ3JFLE1BQU13SyxvQkFBb0IsR0FBR2pFLHVCQUF1QixDQUFDdkcsZ0JBQWdCLEVBQUV3RyxzQkFBc0IsQ0FBQztJQUM5RixNQUFNdkcsa0JBQWtCLEdBQUd3cUIsb0JBQW9CLENBQUM5akIsMEJBQTBCLENBQUM2RCxvQkFBb0IsQ0FBQztJQUNoRyxNQUFNcWdCLGlCQUFpQixHQUFHN1YscUJBQXFCLENBQzlDbFYsa0JBQWtCLEVBQ2xCbVYsMEJBQTBCLEVBQzFCalYsZ0JBQWdCLEVBQ2hCQyxrQkFBa0IsRUFDbEJGLGlCQUFpQixDQUNqQjtJQUNELE1BQU0rcUIsc0JBQXNCLEdBQUdDLDhCQUE4QixDQUM1RC9xQixnQkFBZ0IsRUFDaEI2cUIsaUJBQWlCLENBQUN2aEIsSUFBSSxFQUN0QjJMLDBCQUEwQixFQUMxQjdLLGlCQUFpQixFQUNqQjNJLGlCQUFpQixDQUNqQjtJQUVELE1BQU04TyxnQ0FBZ0MsR0FBR3lhLG1CQUFtQixDQUFDaHJCLGdCQUFnQixFQUFFOHFCLHNCQUFzQixDQUFDO0lBQ3RHLE1BQU1HLGtDQUFrQyxHQUFHQyxxQkFBcUIsQ0FBQ2xyQixnQkFBZ0IsRUFBRThxQixzQkFBc0IsQ0FBQztJQUMxRyxNQUFNSyx1QkFBdUIsR0FBR0MsZ0NBQWdDLENBQUNOLHNCQUFzQixFQUFFTyx3QkFBd0IsQ0FBQ3JyQixnQkFBZ0IsQ0FBQyxDQUFDO0lBRXBJLE1BQU0wUSxhQUFhLEdBQUdMLGdCQUFnQixDQUNyQ3ZRLGtCQUFrQixFQUNsQkMsaUJBQWlCLEVBQ2pCQyxnQkFBZ0IsRUFDaEIwcUIsZUFBZSxFQUNmcGEsa0JBQWtCLEVBQ2xCQyxnQ0FBZ0MsRUFDaEMwYSxrQ0FBa0MsQ0FDbEM7SUFDRCxJQUFJSyxTQUFTLEdBQUc5a0Isc0JBQXNCLEdBQUcsRUFBRSxHQUFHLEVBQUU7SUFDaEQsSUFBSW5CLDZCQUE2QixhQUE3QkEsNkJBQTZCLGVBQTdCQSw2QkFBNkIsQ0FBRWttQixRQUFRLEVBQUU7TUFDNUNELFNBQVMsR0FBR2ptQiw2QkFBNkIsQ0FBQ2ttQixRQUFRLENBQUN0ZCxPQUFPLEVBQVk7SUFDdkU7SUFFQSxNQUFNeVosaUJBQXdDLEdBQUcrQyxvQkFBb0IsQ0FBQzlDLG9CQUFvQixFQUFFO0lBQzVGLE1BQU02RCxZQUFZLEdBQUdDLGdCQUFnQixDQUFDenJCLGdCQUFnQixDQUFDZ0gsc0JBQXNCLEVBQUUsQ0FBQztJQUNoRixNQUFNMGtCLGVBQWUsR0FBRztNQUN2QnZXLE1BQU0sRUFBRXdXLHVCQUF1QixDQUFDM3JCLGdCQUFnQixFQUFFOHFCLHNCQUFzQixDQUFDO01BQ3pFYyxNQUFNLEVBQUVDLHVCQUF1QixDQUFDN3JCLGdCQUFnQixFQUFFOHFCLHNCQUFzQixDQUFDO01BQ3pFZ0IsS0FBSyxFQUFFQyxzQkFBc0IsQ0FBQy9yQixnQkFBZ0IsRUFBRThxQixzQkFBc0IsRUFBRUssdUJBQXVCLENBQUM7TUFDaEdhLFFBQVEsRUFBRUMseUJBQXlCLENBQUNqc0IsZ0JBQWdCLEVBQUU4cUIsc0JBQXNCLENBQUM7TUFDN0VvQixRQUFRLEVBQUVDLHlCQUF5QixDQUFDbnNCLGdCQUFnQixFQUFFOHFCLHNCQUFzQixFQUFFL3FCLGlCQUFpQixDQUFDO01BQ2hHcXNCLFdBQVcsRUFBRUMsY0FBYyxDQUFDcnNCLGdCQUFnQixFQUFFOHFCLHNCQUFzQjtJQUNyRSxDQUFDO0lBRUQsT0FBTztNQUNOdkUsRUFBRSxFQUFFQSxFQUFFO01BQ04rRixVQUFVLEVBQUV2Z0IsU0FBUyxHQUFHQSxTQUFTLENBQUM3SCxJQUFJLEdBQUcsRUFBRTtNQUMzQ3FvQixVQUFVLEVBQUV2SSxtQkFBbUIsQ0FBQ2hrQixnQkFBZ0IsQ0FBQ2dILHNCQUFzQixFQUFFLENBQUM7TUFDMUV3bEIsY0FBYyxFQUFFaG1CLHNCQUFzQjtNQUN0Q2ltQixHQUFHLEVBQUVoVyw0QkFBNEIsQ0FDaEMzVyxrQkFBa0IsRUFDbEJFLGdCQUFnQixFQUNoQkMsa0JBQWtCLEVBQ2xCdUssb0JBQW9CLEVBQ3BCeUssMEJBQTBCLENBQUMxUCxJQUFJLENBQy9CO01BQ0RvbEIsUUFBUSxFQUFFQSxRQUFRO01BQ2xCZSxlQUFlLEVBQUU7UUFDaEIvcUIsT0FBTyxFQUFFK3FCLGVBQWU7UUFDeEJQLHVCQUF1QixFQUFFQSx1QkFBdUI7UUFDaER2ZSxxQkFBcUIsRUFBRWhCLGdDQUFnQyxDQUFDNUwsZ0JBQWdCO01BQ3pFLENBQUM7TUFDRDhJLFdBQVcsRUFBRTRqQixlQUFlLENBQUMxc0IsZ0JBQWdCLEVBQUVvSyxpQkFBaUIsQ0FBQztNQUNqRStLLE1BQU0sRUFBRTBWLGlCQUFpQjtNQUN6Qm5hLGFBQWEsRUFBRUEsYUFBYTtNQUM1QmljLGNBQWMsRUFDYnRFLGtCQUFrQixDQUFDb0Msb0JBQW9CLEVBQUV6cUIsZ0JBQWdCLENBQUMsSUFDekRBLGdCQUFnQixDQUFDa1IsZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQytXLFVBQVUsSUFDOURsb0IsZ0JBQWdCLENBQUNrUixlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDcVgsa0JBQWtCLElBQ3RFLEVBQUVwZSxpQkFBaUIsSUFBSXFnQixvQkFBb0IsQ0FBQ2xDLHlCQUF5QixDQUFDbmUsaUJBQWlCLENBQUMsQ0FBRTtNQUM1RnNkLGlCQUFpQixFQUFFQSxpQkFBaUIsS0FBSyxTQUFTLElBQUksQ0FBQ2lELFFBQVEsR0FBR3hDLHFCQUFxQixDQUFDdFgsSUFBSSxHQUFHNlcsaUJBQWlCO01BQ2hINEQsU0FBUyxFQUFFQSxTQUFTO01BQ3BCM0MsY0FBYyxFQUFFRixpQkFBaUIsQ0FBQ3pvQixnQkFBZ0IsRUFBRXFGLDZCQUE2QixFQUFFdkQsT0FBTyxDQUFDO01BQzNGMG9CLEtBQUssRUFBRUEsS0FBSztNQUNab0MsVUFBVSxFQUFFM1gsMEJBQTBCLENBQUMxUCxJQUFJLEtBQUssaUJBQWlCLElBQUksRUFBRTZHLFVBQVUsQ0FBQ29mLFlBQVksQ0FBQyxJQUFJQSxZQUFZLENBQUM5bUIsS0FBSyxLQUFLLEtBQUssQ0FBQztNQUNoSW1vQixxQkFBcUIsRUFBRXZELHdCQUF3QixDQUFDamtCLDZCQUE2QjtJQUM5RSxDQUFDO0VBQ0Y7RUFBQztFQUVELFNBQVN1VCxrQkFBa0IsQ0FBQ3dCLFFBQWdCLEVBQXFDO0lBQUEsSUFBbkMwUyxpQkFBaUIsdUVBQUcsS0FBSztJQUN0RSxJQUFJQyxjQUFjLEdBQUcsUUFBUTtJQUM3QixJQUFJRCxpQkFBaUIsRUFBRTtNQUN0QixJQUFJMVMsUUFBUSxLQUFLLG9CQUFvQixFQUFFO1FBQ3RDMlMsY0FBYyxHQUFHLFVBQVU7TUFDNUI7TUFDQSxPQUFPQSxjQUFjO0lBQ3RCLENBQUMsTUFBTTtNQUNOLFFBQVEzUyxRQUFRO1FBQ2YsS0FBSyxhQUFhO1FBQ2xCLEtBQUssV0FBVztRQUNoQixLQUFLLFdBQVc7UUFDaEIsS0FBSyxZQUFZO1FBQ2pCLEtBQUssVUFBVTtVQUNkMlMsY0FBYyxHQUFHLFFBQVE7VUFDekI7UUFDRCxLQUFLLGdCQUFnQjtRQUNyQixLQUFLLFVBQVU7VUFDZEEsY0FBYyxHQUFHLE1BQU07VUFDdkI7UUFDRCxLQUFLLG9CQUFvQjtVQUN4QkEsY0FBYyxHQUFHLFVBQVU7VUFDM0I7UUFDRCxLQUFLLGVBQWU7VUFDbkJBLGNBQWMsR0FBRyxNQUFNO1VBQ3ZCO1FBQ0QsS0FBSyxhQUFhO1VBQ2pCQSxjQUFjLEdBQUcsU0FBUztVQUMxQjtRQUNEO1VBQ0NBLGNBQWMsR0FBRyxRQUFRO01BQUM7SUFFN0I7SUFDQSxPQUFPQSxjQUFjO0VBQ3RCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVN4aUIsU0FBUyxDQUFDeEssaUJBQXlCLEVBQUU7SUFDcEQsTUFBTSxDQUFDaXRCLDRCQUE0QixFQUFFdmEsY0FBYyxDQUFDLEdBQUcxUyxpQkFBaUIsQ0FBQzJPLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFDbkYsSUFBSWxJLHNCQUFzQixHQUFHd21CLDRCQUE0QjtJQUN6RCxJQUFJeG1CLHNCQUFzQixDQUFDdVosV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLdlosc0JBQXNCLENBQUN0QixNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQ2xGO01BQ0FzQixzQkFBc0IsR0FBR0Esc0JBQXNCLENBQUN5bUIsTUFBTSxDQUFDLENBQUMsRUFBRXptQixzQkFBc0IsQ0FBQ3RCLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDN0Y7SUFDQSxPQUFPO01BQUVzQixzQkFBc0I7TUFBRWlNO0lBQWUsQ0FBQztFQUNsRDtFQUFDO0VBRU0sU0FBU3lhLGdDQUFnQyxDQUMvQ0Msb0JBQTRCLEVBQzVCbnRCLGdCQUFrQyxFQUNVO0lBQzVDLE1BQU1vdEIsY0FBYyxHQUFHcHRCLGdCQUFnQixDQUFDMG1CLHVCQUF1QixDQUFDeUcsb0JBQW9CLENBQUM7SUFDckYsTUFBTUUsU0FBK0IsR0FBR0QsY0FBYyxDQUFDdnBCLFVBQWtDO0lBRXpGLElBQUl3cEIsU0FBUyxFQUFFO01BQUE7TUFDZCxNQUFNQyxhQUF1QixHQUFHLEVBQUU7TUFDbEMseUJBQUFELFNBQVMsQ0FBQ0UsYUFBYSwwREFBdkIsc0JBQXlCanFCLE9BQU8sQ0FBRWtxQixZQUE4QixJQUFLO1FBQ3BFLE1BQU16Z0IsWUFBWSxHQUFHeWdCLFlBQVksQ0FBQ0MsWUFBWTtRQUM5QyxNQUFNcE4sWUFBb0IsR0FBRyxDQUFBdFQsWUFBWSxhQUFaQSxZQUFZLHVCQUFaQSxZQUFZLENBQUVySSxLQUFLLEtBQUksRUFBRTtRQUN0RCxJQUFJNG9CLGFBQWEsQ0FBQ3JuQixPQUFPLENBQUNvYSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtVQUMvQ2lOLGFBQWEsQ0FBQ3JvQixJQUFJLENBQUNvYixZQUFZLENBQUM7UUFDakM7TUFDRCxDQUFDLENBQUM7TUFDRixPQUFPO1FBQ05wTixJQUFJLEVBQUVvYSxTQUFTLGFBQVRBLFNBQVMsMENBQVRBLFNBQVMsQ0FBRXBrQixJQUFJLG9EQUFmLGdCQUFpQkosUUFBUSxFQUFFO1FBQ2pDeWtCLGFBQWEsRUFBRUE7TUFDaEIsQ0FBQztJQUNGO0lBQ0EsT0FBT3JxQixTQUFTO0VBQ2pCO0VBQUM7RUFFRCxTQUFTeXFCLDJCQUEyQixDQUNuQy9jLGFBQWlELEVBQ2pEM1EsZ0JBQWtDLEVBQ2xDMnRCLFFBQWlCLEVBQ1A7SUFDVjtJQUNBLElBQUlDLGdCQUFnQixHQUFHamQsYUFBYSxDQUFDaWQsZ0JBQWdCLElBQUlELFFBQVE7SUFDakU7SUFDQSxJQUFJLENBQUNBLFFBQVEsSUFBSUMsZ0JBQWdCLElBQUk1dEIsZ0JBQWdCLENBQUNrUixlQUFlLEVBQUUsS0FBS0MsWUFBWSxDQUFDK1csVUFBVSxFQUFFO01BQ3BHMEYsZ0JBQWdCLEdBQUcsS0FBSztNQUN4QjV0QixnQkFBZ0IsQ0FBQ2duQixjQUFjLEVBQUUsQ0FBQ0MsUUFBUSxDQUFDQyxhQUFhLENBQUNDLFFBQVEsRUFBRUMsYUFBYSxDQUFDQyxHQUFHLEVBQUV3RyxTQUFTLENBQUNDLGdDQUFnQyxDQUFDO0lBQ2xJO0lBQ0EsT0FBT0YsZ0JBQWdCO0VBQ3hCO0VBRUEsU0FBU0csbUJBQW1CLENBQzNCcGQsYUFBaUQsRUFDakRnRyxTQUFvQixFQUNwQjNXLGdCQUFrQyxFQUNiO0lBQ3JCLElBQUlndUIsZUFBbUM7SUFDdkMsSUFBSXJYLFNBQVMsS0FBSyxpQkFBaUIsRUFBRTtNQUNwQyxPQUFPMVQsU0FBUztJQUNqQjtJQUNBLFFBQVFqRCxnQkFBZ0IsQ0FBQ2tSLGVBQWUsRUFBRTtNQUN6QyxLQUFLQyxZQUFZLENBQUMrVyxVQUFVO01BQzVCLEtBQUsvVyxZQUFZLENBQUNxWCxrQkFBa0I7UUFDbkN3RixlQUFlLEdBQUcsQ0FBQ3JkLGFBQWEsQ0FBQ3NkLFNBQVMsR0FBRyxVQUFVLEdBQUcsU0FBUztRQUNuRTtNQUNELEtBQUs5YyxZQUFZLENBQUNDLFVBQVU7UUFDM0I0YyxlQUFlLEdBQUdyZCxhQUFhLENBQUNzZCxTQUFTLEtBQUssS0FBSyxHQUFHLFVBQVUsR0FBRyxTQUFTO1FBQzVFLElBQUlqdUIsZ0JBQWdCLENBQUMwRyxrQkFBa0IsRUFBRSxDQUFDd25CLGFBQWEsRUFBRSxFQUFFO1VBQzFERixlQUFlLEdBQUcsQ0FBQ3JkLGFBQWEsQ0FBQ3NkLFNBQVMsR0FBRyxVQUFVLEdBQUcsU0FBUztRQUNwRTtRQUNBO01BQ0Q7SUFBUTtJQUdULE9BQU9ELGVBQWU7RUFDdkI7RUFFQSxTQUFTRyxhQUFhLENBQ3JCeGQsYUFBaUQsRUFDakRsTyxpQkFBb0MsRUFDcEN6QyxnQkFBa0MsRUFDdEI7SUFDWixJQUFJMlcsU0FBUyxHQUFHLENBQUFoRyxhQUFhLGFBQWJBLGFBQWEsdUJBQWJBLGFBQWEsQ0FBRXBMLElBQUksS0FBSSxpQkFBaUI7SUFDeEQ7QUFDRDtBQUNBO0lBQ0MsSUFBSSxDQUFDb1IsU0FBUyxLQUFLLGlCQUFpQixJQUFJQSxTQUFTLEtBQUssV0FBVyxLQUFLLENBQUMzVyxnQkFBZ0IsQ0FBQzBHLGtCQUFrQixFQUFFLENBQUMwbkIsU0FBUyxFQUFFLEVBQUU7TUFDekh6WCxTQUFTLEdBQUcsaUJBQWlCO0lBQzlCO0lBQ0EsT0FBT0EsU0FBUztFQUNqQjtFQUVBLFNBQVMwWCxhQUFhLENBQ3JCMVgsU0FBb0IsRUFDcEJoRyxhQUFpRCxFQUNqRDJkLG9CQUE2QixFQUM2QjtJQUMxRCxJQUFJM1gsU0FBUyxLQUFLLGlCQUFpQixFQUFFO01BQ3BDLElBQUkyWCxvQkFBb0IsRUFBRTtRQUN6QixPQUFPO1VBQ05DLFlBQVksRUFBRSxNQUFNO1VBQ3BCQyxRQUFRLEVBQUU7UUFDWCxDQUFDO01BQ0YsQ0FBQyxNQUFNO1FBQ04sT0FBTztVQUNORCxZQUFZLEVBQUU1ZCxhQUFhLENBQUM0ZCxZQUFZLElBQUksT0FBTztVQUNuREMsUUFBUSxFQUFFN2QsYUFBYSxDQUFDNmQsUUFBUSxHQUFHN2QsYUFBYSxDQUFDNmQsUUFBUSxHQUFHO1FBQzdELENBQUM7TUFDRjtJQUNELENBQUMsTUFBTTtNQUNOLE9BQU8sQ0FBQyxDQUFDO0lBQ1Y7RUFDRDtFQUVBLFNBQVNDLHdCQUF3QixDQUFDQyxVQUFxQixFQUFFQyxjQUFrRCxFQUFXO0lBQ3JILE9BQU9BLGNBQWMsQ0FBQ0Msb0JBQW9CLEtBQUszckIsU0FBUyxJQUFJeXJCLFVBQVUsS0FBSyxpQkFBaUIsR0FDekZDLGNBQWMsQ0FBQ0Msb0JBQW9CLEdBQ25DLEtBQUs7RUFDVDtFQUVBLFNBQVNDLHVCQUF1QixDQUFDRixjQUFrRCxFQUFVO0lBQzVGLE9BQU9BLGNBQWMsQ0FBQ1YsU0FBUyxLQUFLLElBQUksSUFBSVUsY0FBYyxDQUFDRyxjQUFjLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBR0gsY0FBYyxDQUFDRyxjQUFjLElBQUksR0FBRztFQUMzSDtFQUVBLFNBQVNDLCtCQUErQixDQUFDSixjQUFrRCxFQUFVO0lBQUE7SUFDcEcsT0FBTyx5QkFBQUEsY0FBYyxDQUFDM1ksWUFBWSxrREFBM0Isc0JBQTZCZ1osc0JBQXNCLDZCQUFHTCxjQUFjLENBQUMzWSxZQUFZLDJEQUEzQix1QkFBNkJnWixzQkFBc0IsR0FBRyxDQUFDO0VBQ3JIO0VBRUEsU0FBU0MsV0FBVyxDQUNuQnRlLGFBQWlELEVBQ2pEdWUsZ0JBQThDLEVBQzlDQyxxQkFBOEIsRUFDOUJ2c0IsSUFBZ0MsRUFDL0I7SUFBQTtJQUNELElBQUl1c0IscUJBQXFCLEVBQUU7TUFDMUJELGdCQUFnQixDQUFDanFCLElBQUksQ0FBQztRQUFFd04sY0FBYyxFQUFFN1AsSUFBSSxDQUFDNlA7TUFBZSxDQUFDLENBQUM7SUFDL0Q7SUFDQSxPQUFPO01BQ04yYyxZQUFZLEVBQUU7UUFDYkMsVUFBVSxFQUFFMWUsYUFBYSxhQUFiQSxhQUFhLGdEQUFiQSxhQUFhLENBQUUyZSxxQkFBcUIsMERBQXBDLHNCQUFzQ0QsVUFBVTtRQUM1RDVGLEtBQUssRUFBRXlGO01BQ1I7SUFDRCxDQUFDO0VBQ0Y7RUFFQSxTQUFTSyxnQkFBZ0IsQ0FDeEI1ZSxhQUFpRCxFQUNqRDNRLGdCQUFrQyxFQUNsQ3d2QixXQUFvQixFQUNWO0lBQ1YsT0FBTzdlLGFBQWEsQ0FBQzhlLFlBQVksS0FBS3hzQixTQUFTLEdBQzVDME4sYUFBYSxDQUFDOGUsWUFBWSxHQUMxQnp2QixnQkFBZ0IsQ0FBQ2tSLGVBQWUsRUFBRSxLQUFLLFlBQVksSUFBSXNlLFdBQVc7RUFDdEU7RUFFQSxTQUFTRSxxQkFBcUIsQ0FBQy9lLGFBQWlELEVBQXNCO0lBQ3JHLE9BQU9BLGFBQWEsQ0FBQ2dmLGlCQUFpQjtFQUN2QztFQUVBLFNBQVNDLHVCQUF1QixDQUMvQmpmLGFBQWlELEVBQ2pEN1Esa0JBQXdDLEVBQ3hDRSxnQkFBa0MsRUFDakM7SUFBQTtJQUNELElBQUksQ0FBQ0Ysa0JBQWtCLEVBQUU7TUFDeEIsT0FBTyxDQUFDLENBQUM7SUFDVjtJQUNBLE1BQU1vdkIsZ0JBQThDLEdBQUcsRUFBRTtJQUN6RCxNQUFNN2EsZ0JBQWdCLEdBQUdyVSxnQkFBZ0IsQ0FBQytCLHVCQUF1QixDQUFDakMsa0JBQWtCLENBQUM7SUFDckYsSUFBSXF2QixxQkFBcUI7SUFDekIsSUFBSVUsT0FBTztJQUNYbGYsYUFBYSxhQUFiQSxhQUFhLGlEQUFiQSxhQUFhLENBQUUyZSxxQkFBcUIscUZBQXBDLHVCQUFzQzdGLEtBQUssMkRBQTNDLHVCQUE2Q25tQixPQUFPLENBQUVWLElBQWdDLElBQUs7TUFDMUZ1c0IscUJBQXFCLEdBQUc5YSxnQkFBZ0IsQ0FBQ3lRLFdBQVcsQ0FBQ2xpQixJQUFJLENBQUM2UCxjQUFjLENBQUM7TUFDekVvZCxPQUFPLEdBQUdaLFdBQVcsQ0FBQ3RlLGFBQWEsRUFBRXVlLGdCQUFnQixFQUFFQyxxQkFBcUIsRUFBRXZzQixJQUFJLENBQUM7SUFDcEYsQ0FBQyxDQUFDO0lBRUYsSUFBSWt0QixjQUFjLEdBQUcsS0FBSztJQUMxQkEsY0FBYyxHQUFHLENBQUMsNEJBQUNuZixhQUFhLENBQUMyZSxxQkFBcUIsbURBQW5DLHVCQUFxQ1EsY0FBYztJQUN0RSxPQUFPO01BQ05ELE9BQU8sRUFBRUEsT0FBTztNQUNoQkUsYUFBYSxFQUFFLEVBQUVaLHFCQUFxQixJQUFJVyxjQUFjO0lBQ3pELENBQUM7RUFDRjtFQUVBLFNBQVMzVSxxQ0FBcUMsQ0FBQ2pZLFlBQW9CLEVBQUVsRCxnQkFBa0MsRUFBRTtJQUN4RyxNQUFNZ3dCLG9CQUFvQixHQUFHOVAsb0JBQW9CLENBQUNsZ0IsZ0JBQWdCLENBQUNnSCxzQkFBc0IsRUFBRSxFQUFFOUQsWUFBWSxDQUFDLENBQUM4c0Isb0JBQW9CO0lBQy9ILElBQUksQ0FBQUEsb0JBQW9CLGFBQXBCQSxvQkFBb0IsdUJBQXBCQSxvQkFBb0IsQ0FBRTlxQixNQUFNLElBQUcsQ0FBQyxFQUFFO01BQ3JDLE1BQU1nVyxpQ0FBMkMsR0FBRyxFQUFFO01BQ3REOFUsb0JBQW9CLENBQUMxc0IsT0FBTyxDQUFFMnNCLFdBQVcsSUFBSztRQUM3Qy9VLGlDQUFpQyxDQUFDalcsSUFBSSxDQUFDcVcsUUFBUSxDQUFDMlUsV0FBVyxDQUFDLElBQUlBLFdBQVcsQ0FBQy9yQixJQUFJLENBQUM7TUFDbEYsQ0FBQyxDQUFDO01BQ0YsT0FBT2dYLGlDQUFpQztJQUN6QztFQUNEO0VBRU8sU0FBUzVRLDZCQUE2QixDQUM1Q3hLLGtCQUF3QyxFQUN4Q0MsaUJBQXlCLEVBQ3pCQyxnQkFBa0MsRUFFTjtJQUFBO0lBQUEsSUFENUJrd0Isb0JBQW9CLHVFQUFHLEtBQUs7SUFFNUIsTUFBTUMsZ0JBQWdCLEdBQUdud0IsZ0JBQWdCLENBQUMwRyxrQkFBa0IsRUFBRTtJQUM5RCxNQUFNK0oscUJBQWlELEdBQUd6USxnQkFBZ0IsQ0FBQ1UsK0JBQStCLENBQUNYLGlCQUFpQixDQUFDO0lBQzdILE1BQU00USxhQUFhLEdBQUlGLHFCQUFxQixJQUFJQSxxQkFBcUIsQ0FBQ0UsYUFBYSxJQUFLLENBQUMsQ0FBQztJQUMxRixNQUFNcUYsWUFBWSxHQUFHLDJCQUFBckYsYUFBYSxDQUFDcUYsWUFBWSwyREFBMUIsdUJBQTRCOVIsSUFBSSxLQUFJK1IsWUFBWSxDQUFDTyxPQUFPO0lBQzdFLE1BQU00WixxQkFBcUIsR0FBRyxDQUFDRCxnQkFBZ0IsQ0FBQ0UsT0FBTyxFQUFFO0lBQ3pELE1BQU1iLFdBQVcsR0FDaEI3ZSxhQUFhLENBQUM2ZSxXQUFXLEtBQUt2c0IsU0FBUyxHQUFHME4sYUFBYSxDQUFDNmUsV0FBVyxHQUFHeHZCLGdCQUFnQixDQUFDa1IsZUFBZSxFQUFFLEtBQUssWUFBWSxDQUFDLENBQUM7SUFDNUgsTUFBTW9mLFlBQVksR0FBR3R3QixnQkFBZ0IsQ0FBQ2tSLGVBQWUsRUFBRTtJQUN2RCxNQUFNcWYsd0JBQXdCLEdBQUdELFlBQVksS0FBS25mLFlBQVksQ0FBQytXLFVBQVUsR0FBRyw4QkFBOEIsR0FBR2psQixTQUFTO0lBQ3RILE1BQU1rSCwrQkFBK0IsR0FBRytsQixvQkFBb0IsSUFBSUMsZ0JBQWdCLENBQUNLLDBCQUEwQixFQUFFO0lBQzdHLE1BQU1DLG9CQUFvQixHQUFHYix1QkFBdUIsQ0FBQ2pmLGFBQWEsRUFBRTdRLGtCQUFrQixFQUFFRSxnQkFBZ0IsQ0FBQztJQUN6RyxNQUFNMHdCLHdCQUF3Qiw2QkFBRy9mLGFBQWEsQ0FBQ3FGLFlBQVksMkRBQTFCLHVCQUE0QjBhLHdCQUF3QjtJQUNyRixNQUFNbnVCLFVBQVUsR0FBR3ZDLGdCQUFnQixDQUFDMEwsYUFBYSxFQUFFO0lBQ25ELE1BQU1qSixpQkFBaUIsR0FBRyxJQUFJQyxpQkFBaUIsQ0FBQ0gsVUFBVSxFQUFFdkMsZ0JBQWdCLENBQUM7SUFDN0UsTUFBTTJXLFNBQW9CLEdBQUd3WCxhQUFhLENBQUN4ZCxhQUFhLEVBQUVsTyxpQkFBaUIsRUFBRXpDLGdCQUFnQixDQUFDO0lBQzlGLE1BQU0yd0IsWUFBWSxHQUFHdEMsYUFBYSxDQUFDMVgsU0FBUyxFQUFFaEcsYUFBYSxFQUFFMmYsWUFBWSxLQUFLbmYsWUFBWSxDQUFDK1csVUFBVSxDQUFDO0lBQ3RHLE1BQU0wRyxvQkFBb0IsR0FBR0gsd0JBQXdCLENBQUM5WCxTQUFTLEVBQUVoRyxhQUFhLENBQUM7SUFDL0UsTUFBTWlnQixjQUFjLEdBQUc7TUFDdEI7TUFDQXRhLFdBQVcsRUFDViwyQkFBQTNGLGFBQWEsQ0FBQ3FGLFlBQVksMkRBQTFCLHVCQUE0Qk0sV0FBVyxNQUFLclQsU0FBUyw2QkFDbEQwTixhQUFhLENBQUNxRixZQUFZLDJEQUExQix1QkFBNEJNLFdBQVcsR0FDdkNOLFlBQVksS0FBS0MsWUFBWSxDQUFDakksTUFBTTtNQUN4Q2dJLFlBQVksRUFBRUEsWUFBWTtNQUMxQjBhLHdCQUF3QixFQUFFQSx3QkFBd0I7TUFDbERILHdCQUF3QixFQUFFQSx3QkFBd0I7TUFDbEQ7TUFDQU0sK0JBQStCLEVBQUUsQ0FBQ0gsd0JBQXdCLEdBQUcsQ0FBQyw0QkFBQy9mLGFBQWEsQ0FBQ3FGLFlBQVksbURBQTFCLHVCQUE0QjZhLCtCQUErQixJQUFHLEtBQUs7TUFDbElULHFCQUFxQixFQUFFQSxxQkFBcUI7TUFDNUNYLFlBQVksRUFBRUYsZ0JBQWdCLENBQUM1ZSxhQUFhLEVBQUUzUSxnQkFBZ0IsRUFBRXd2QixXQUFXLENBQUM7TUFDNUVHLGlCQUFpQixFQUFFRCxxQkFBcUIsQ0FBQy9lLGFBQWEsQ0FBQztNQUN2RGlkLGdCQUFnQixFQUFFRiwyQkFBMkIsQ0FBQy9jLGFBQWEsRUFBRTNRLGdCQUFnQixFQUFFbXdCLGdCQUFnQixDQUFDRSxPQUFPLEVBQUUsQ0FBQztNQUMxR1MsY0FBYyxFQUFFbmdCLGFBQWEsYUFBYkEsYUFBYSx1QkFBYkEsYUFBYSxDQUFFbWdCLGNBQWM7TUFDN0N6TSx1QkFBdUIsRUFBRTFULGFBQWEsYUFBYkEsYUFBYSx1QkFBYkEsYUFBYSxDQUFFMFQsdUJBQXVCO01BQy9EbUwsV0FBVyxFQUFFQSxXQUFXO01BQ3hCTyxhQUFhLEVBQUUsSUFBSTtNQUNuQi9CLGVBQWUsRUFBRUQsbUJBQW1CLENBQUNwZCxhQUFhLEVBQUVnRyxTQUFTLEVBQUUzVyxnQkFBZ0IsQ0FBQztNQUNoRjh1QixjQUFjLEVBQUVELHVCQUF1QixDQUFDbGUsYUFBYSxDQUFDO01BQ3REcWUsc0JBQXNCLEVBQUVELCtCQUErQixDQUFDcGUsYUFBYSxDQUFDO01BQ3RFb2dCLGtDQUFrQyxFQUFFLENBQUFwZ0IsYUFBYSxhQUFiQSxhQUFhLGlEQUFiQSxhQUFhLENBQUVxRixZQUFZLDJEQUEzQix1QkFBNkIrYSxrQ0FBa0MsS0FBSSxLQUFLO01BQzVHQyxZQUFZLEVBQUUsRUFBQ3JnQixhQUFhLGFBQWJBLGFBQWEseUNBQWJBLGFBQWEsQ0FBRTJlLHFCQUFxQixtREFBcEMsdUJBQXNDRCxVQUFVLEtBQUksMkJBQUNjLGdCQUFnQixDQUFDYyxvQkFBb0IsRUFBRSxrREFBdkMsc0JBQXlDNUIsVUFBVTtNQUN2SDlwQixJQUFJLEVBQUVvUixTQUFTO01BQ2Z1YSx1QkFBdUIsRUFBRXRDLG9CQUFvQixJQUFJemtCLCtCQUErQjtNQUNoRmduQixhQUFhLEVBQUVoQixnQkFBZ0IsQ0FBQ2dCLGFBQWE7SUFDOUMsQ0FBQztJQUVELE1BQU1DLGtCQUE2QyxHQUFHO01BQUUsR0FBR1IsY0FBYztNQUFFLEdBQUdELFlBQVk7TUFBRSxHQUFHRjtJQUFxQixDQUFDO0lBRXJILElBQUk5WixTQUFTLEtBQUssV0FBVyxFQUFFO01BQzlCeWEsa0JBQWtCLENBQUNDLGtCQUFrQixHQUFHMWdCLGFBQWEsQ0FBQzBnQixrQkFBa0I7SUFDekU7SUFFQSxPQUFPRCxrQkFBa0I7RUFDMUI7RUFBQztFQUVNLFNBQVM3VyxhQUFhLENBQUM3UyxTQUE0QyxFQUFFMFMsUUFBNEIsRUFBc0I7SUFBQTtJQUM3SCxJQUFJa1gsY0FBYztJQUNsQixJQUFJNVUsVUFBVSxDQUFDaFYsU0FBUyxDQUFDLEVBQUU7TUFDMUI0cEIsY0FBYyxHQUFHQyxnQkFBZ0IsQ0FBQzdwQixTQUFTLENBQUNvUSxVQUFVLENBQUMsR0FDcEQwWixnQkFBZ0IsQ0FBQzlwQixTQUFTLENBQUNvUSxVQUFVLENBQUMyWixjQUFjLENBQUMsR0FDckRELGdCQUFnQixDQUFDOXBCLFNBQVMsQ0FBQ25DLElBQUksQ0FBQztJQUNwQztJQUNBLElBQUkrckIsY0FBYyxLQUFLcnVCLFNBQVMsSUFBSW1YLFFBQVEsS0FBS25YLFNBQVMsRUFBRTtNQUMzRHF1QixjQUFjLEdBQUdFLGdCQUFnQixDQUFDcFgsUUFBUSxDQUFDO0lBQzVDO0lBRUEsTUFBTUUsa0JBQXNDLEdBQUc7TUFDOUMvVSxJQUFJLHFCQUFFK3JCLGNBQWMsb0RBQWQsZ0JBQWdCL3JCLElBQUk7TUFDMUJzVixXQUFXLEVBQUUsQ0FBQyxDQUFDO01BQ2Z4WSxhQUFhLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBQ0QsSUFBSXFhLFVBQVUsQ0FBQ2hWLFNBQVMsQ0FBQyxJQUFJNHBCLGNBQWMsS0FBS3J1QixTQUFTLEVBQUU7TUFBQTtNQUMxRHFYLGtCQUFrQixDQUFDTyxXQUFXLEdBQUc7UUFDaENHLEtBQUssRUFBRSx5QkFBQXNXLGNBQWMsQ0FBQ3pXLFdBQVcsa0RBQTFCLHNCQUE0QjZXLE1BQU0sR0FBR2hxQixTQUFTLENBQUNzVCxLQUFLLEdBQUcvWCxTQUFTO1FBQ3ZFMHVCLFNBQVMsRUFBRSwwQkFBQUwsY0FBYyxDQUFDelcsV0FBVyxtREFBMUIsdUJBQTRCK1csVUFBVSxHQUFHbHFCLFNBQVMsQ0FBQ2lxQixTQUFTLEdBQUcxdUIsU0FBUztRQUNuRjR1QixTQUFTLEVBQUUsMEJBQUFQLGNBQWMsQ0FBQ3pXLFdBQVcsbURBQTFCLHVCQUE0QmlYLFVBQVUsR0FBR3BxQixTQUFTLENBQUNtcUIsU0FBUyxHQUFHNXVCLFNBQVM7UUFDbkY4dUIsUUFBUSxFQUFFLDBCQUFBVCxjQUFjLENBQUN6VyxXQUFXLG1EQUExQix1QkFBNEJtWCxTQUFTLEdBQUd0cUIsU0FBUyxDQUFDcXFCLFFBQVEsR0FBRzl1QixTQUFTO1FBQ2hGZ3ZCLE9BQU8sRUFDTiwwQkFBQVgsY0FBYyxDQUFDelcsV0FBVyxtREFBMUIsdUJBQTZCLDJDQUEyQyxDQUFDLElBQ3pFLENBQUNxWCxLQUFLLDJCQUFDeHFCLFNBQVMsQ0FBQ3JELFdBQVcscUZBQXJCLHVCQUF1Qjh0QixVQUFVLDJEQUFqQyx1QkFBbUNDLE9BQU8sQ0FBQyxHQUM5Qyw4QkFBRTFxQixTQUFTLENBQUNyRCxXQUFXLHVGQUFyQix3QkFBdUI4dEIsVUFBVSw0REFBakMsd0JBQW1DQyxPQUFRLEVBQUMsR0FDL0NudkIsU0FBUztRQUNib3ZCLE9BQU8sRUFDTiwwQkFBQWYsY0FBYyxDQUFDelcsV0FBVyxtREFBMUIsdUJBQTZCLDJDQUEyQyxDQUFDLElBQ3pFLENBQUNxWCxLQUFLLDRCQUFDeHFCLFNBQVMsQ0FBQ3JELFdBQVcsdUZBQXJCLHdCQUF1Qjh0QixVQUFVLDREQUFqQyx3QkFBbUNHLE9BQU8sQ0FBQyxHQUM5Qyw4QkFBRTVxQixTQUFTLENBQUNyRCxXQUFXLHVGQUFyQix3QkFBdUI4dEIsVUFBVSw0REFBakMsd0JBQW1DRyxPQUFRLEVBQUMsR0FDL0NydkIsU0FBUztRQUNic3ZCLGVBQWUsRUFDZGpZLGtCQUFrQixDQUFDL1UsSUFBSSxLQUFLLGdDQUFnQyw4QkFDNUQrckIsY0FBYyxDQUFDelcsV0FBVyxtREFBMUIsdUJBQThCLElBQUMsZ0RBQXdDLEVBQUMsQ0FBQywrQkFDekVuVCxTQUFTLENBQUNyRCxXQUFXLCtFQUFyQix3QkFBdUI2RCxNQUFNLG9EQUE3Qix3QkFBK0JzcUIsZUFBZSxHQUMzQyxJQUFJLEdBQ0p2dkI7TUFDTCxDQUFDO0lBQ0Y7SUFDQXFYLGtCQUFrQixDQUFDalksYUFBYSxHQUFHO01BQ2xDb3dCLGFBQWEsRUFDWixDQUFBblksa0JBQWtCLGFBQWxCQSxrQkFBa0IsZ0RBQWxCQSxrQkFBa0IsQ0FBRS9VLElBQUksMERBQXhCLHNCQUEwQlUsT0FBTyxDQUFDLDZCQUE2QixDQUFDLE1BQUssQ0FBQyxJQUN0RSxDQUFBcVUsa0JBQWtCLGFBQWxCQSxrQkFBa0IsaURBQWxCQSxrQkFBa0IsQ0FBRS9VLElBQUksMkRBQXhCLHVCQUEwQlUsT0FBTyxDQUFDLGdDQUFnQyxDQUFDLE1BQUssQ0FBQyxHQUN0RSxLQUFLLEdBQ0xoRCxTQUFTO01BQ2J5dkIsV0FBVyxFQUNWLENBQUFwWSxrQkFBa0IsYUFBbEJBLGtCQUFrQixpREFBbEJBLGtCQUFrQixDQUFFL1UsSUFBSSwyREFBeEIsdUJBQTBCVSxPQUFPLENBQUMsNkJBQTZCLENBQUMsTUFBSyxDQUFDLElBQ3RFLENBQUFxVSxrQkFBa0IsYUFBbEJBLGtCQUFrQixpREFBbEJBLGtCQUFrQixDQUFFL1UsSUFBSSwyREFBeEIsdUJBQTBCVSxPQUFPLENBQUMsZ0NBQWdDLENBQUMsTUFBSyxDQUFDLEdBQ3RFLEVBQUUsR0FDRmhELFNBQVM7TUFDYjB2QixxQkFBcUIsRUFBRXJZLGtCQUFrQixDQUFDL1UsSUFBSSxLQUFLLGdDQUFnQyxHQUFHLElBQUksR0FBR3RDO0lBQzlGLENBQUM7SUFDRCxPQUFPcVgsa0JBQWtCO0VBQzFCO0VBQUM7RUFBQSxPQUVjO0lBQ2R6YSxlQUFlO0lBQ2YyQixlQUFlO0lBQ2ZpSyx3QkFBd0I7SUFDeEJuRSxzQkFBc0I7SUFDdEI0Qyx3QkFBd0I7SUFDeEJxQiwrQkFBK0I7SUFDL0IwRSx3QkFBd0I7SUFDeEJJLGdCQUFnQjtJQUNoQjJOLHNCQUFzQjtJQUN0QmpDLGFBQWE7SUFDYjBMLFdBQVc7SUFDWDFjLCtCQUErQjtJQUMvQitRLHdCQUF3QjtJQUN4QnZSLFNBQVM7SUFDVDJpQixnQ0FBZ0M7SUFDaEM1aUIsNkJBQTZCO0lBQzdCaVEsYUFBYTtJQUNicFY7RUFDRCxDQUFDO0FBQUEifQ==
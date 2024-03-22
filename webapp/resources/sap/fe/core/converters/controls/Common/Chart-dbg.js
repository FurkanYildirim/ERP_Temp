/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper", "sap/ui/core/Core", "../../helpers/Aggregation", "../../helpers/ID", "../../helpers/InsightsHelpers", "../../ManifestSettings"], function (Log, DataField, Action, ConfigurableObject, Key, BindingToolkit, DataModelPathHelper, Core, Aggregation, ID, InsightsHelpers, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var ActionType = ManifestSettings.ActionType;
  var getInsightsVisibility = InsightsHelpers.getInsightsVisibility;
  var getFilterBarID = ID.getFilterBarID;
  var getChartID = ID.getChartID;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var not = BindingToolkit.not;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var OverrideType = ConfigurableObject.OverrideType;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  /**
   * Method to retrieve all chart actions from annotations.
   *
   * @param chartAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns The chart actions from the annotation
   */
  function getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext) {
    const chartActions = [];
    if (chartAnnotation) {
      const aActions = chartAnnotation.Actions || [];
      aActions.forEach(dataField => {
        var _dataField$ActionTarg;
        let chartAction;
        if (isDataFieldForActionAbstract(dataField) && !dataField.Inline && !dataField.Determining) {
          const key = KeyHelper.generateKeyFromDataField(dataField);
          switch (dataField.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              if (!((_dataField$ActionTarg = dataField.ActionTarget) !== null && _dataField$ActionTarg !== void 0 && _dataField$ActionTarg.isBound)) {
                chartAction = {
                  type: ActionType.DataFieldForAction,
                  annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
                  key: key,
                  visible: getCompileExpressionForAction(dataField, converterContext)
                };
              }
              break;
            case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
              chartAction = {
                type: ActionType.DataFieldForIntentBasedNavigation,
                annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
                key: key,
                visible: getCompileExpressionForAction(dataField, converterContext),
                isNavigable: true
              };
              break;
          }
        }
        if (chartAction) {
          chartActions.push(chartAction);
        }
      });
    }
    return chartActions;
  }
  function getChartActions(chartAnnotation, visualizationPath, converterContext) {
    const aAnnotationActions = getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext);
    const manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, aAnnotationActions);
    const actionOverwriteConfig = {
      enabled: OverrideType.overwrite,
      enableOnSelect: OverrideType.overwrite,
      visible: OverrideType.overwrite,
      command: OverrideType.overwrite
    };
    const chartActions = insertCustomElements(aAnnotationActions, manifestActions.actions, actionOverwriteConfig);
    return {
      actions: chartActions,
      commandActions: manifestActions.commandActions
    };
  }
  _exports.getChartActions = getChartActions;
  function getP13nMode(visualizationPath, converterContext) {
    var _chartManifestSetting;
    const manifestWrapper = converterContext.getManifestWrapper();
    const chartManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    const variantManagement = manifestWrapper.getVariantManagement();
    const aPersonalization = [];
    // Personalization configured in manifest.
    const personalization = chartManifestSettings === null || chartManifestSettings === void 0 ? void 0 : (_chartManifestSetting = chartManifestSettings.chartSettings) === null || _chartManifestSetting === void 0 ? void 0 : _chartManifestSetting.personalization;
    const isControlVariant = variantManagement === VariantManagementType.Control ? true : false;
    // if personalization is set to false do not show any option
    if (personalization !== undefined && !personalization || personalization == "false") {
      return undefined;
    }
    switch (true) {
      case typeof personalization === "object":
        // Specific personalization options enabled in manifest. Use them as is.
        if (personalization.type) {
          aPersonalization.push("Type");
        }
        if (personalization.item) {
          aPersonalization.push("Item");
        }
        if (personalization.sort) {
          aPersonalization.push("Sort");
        }
        if (personalization.filter) {
          aPersonalization.push("Filter");
        }
        return aPersonalization.join(",");
      case isControlVariant:
      case !!personalization:
        // manifest has personalization configured, check if it's true
        // if manifest doesn't have personalization, check for variant management is set to control
        return "Sort,Type,Item,Filter";
      default:
        // if manifest doesn't have personalization, show default options without filter
        return "Sort,Type,Item";
    }
  }
  _exports.getP13nMode = getP13nMode;
  // check if annoatation path has SPV and store the path
  function checkForSPV(viewConfiguration) {
    var _viewConfiguration$an;
    return (viewConfiguration === null || viewConfiguration === void 0 ? void 0 : (_viewConfiguration$an = viewConfiguration.annotationPath) === null || _viewConfiguration$an === void 0 ? void 0 : _viewConfiguration$an.indexOf(`@${"com.sap.vocabularies.UI.v1.SelectionPresentationVariant"}`)) !== -1 ? viewConfiguration === null || viewConfiguration === void 0 ? void 0 : viewConfiguration.annotationPath : undefined;
  }
  function getAggregatablePropertiesObject(aggProp) {
    let obj;
    if (aggProp !== null && aggProp !== void 0 && aggProp.Property) {
      var _Property;
      obj = {
        Property: {
          $PropertyPath: aggProp === null || aggProp === void 0 ? void 0 : (_Property = aggProp.Property) === null || _Property === void 0 ? void 0 : _Property.value
        }
      };
    } else {
      obj = {
        Property: {
          $PropertyPath: aggProp === null || aggProp === void 0 ? void 0 : aggProp.name
        }
      };
    }
    return obj;
  }
  /**
   * Create the ChartVisualization configuration that will be used to display a chart using the Chart building block.
   *
   * @param chartAnnotation The targeted chart annotation
   * @param visualizationPath The path of the visualization annotation
   * @param converterContext The converter context
   * @param doNotCheckApplySupported Flag that indicates whether ApplySupported needs to be checked or not
   * @param viewConfiguration
   * @param isInsightsEnabled Flag that indicates whether insights enabled
   * @returns The chart visualization based on the annotation
   */
  function createChartVisualization(chartAnnotation, visualizationPath, converterContext, doNotCheckApplySupported, viewConfiguration, isInsightsEnabled) {
    var _chartAnnotation$Titl;
    const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext, true); // passing the last parameter as true to consider the old annotations i.e. Aggregation.Aggregatable for backward compatibility in case of chart
    if (!doNotCheckApplySupported && !aggregationHelper.isAnalyticsSupported()) {
      throw new Error("ApplySupported is not added to the annotations");
    }
    const aTransAggregations = aggregationHelper.getTransAggregations();
    const aCustomAggregates = aggregationHelper.getCustomAggregateDefinitions();
    const pageManifestSettings = converterContext.getManifestWrapper();
    const variantManagement = pageManifestSettings.getVariantManagement();
    const p13nMode = getP13nMode(visualizationPath, converterContext);
    if (p13nMode === undefined && variantManagement === "Control") {
      Log.warning("Variant Management cannot be enabled when personalization is disabled");
    }
    const mCustomAggregates = {};
    // check if annoatation path has SPV and store the path
    const mSelectionPresentationVariantPath = checkForSPV(viewConfiguration);
    if (aCustomAggregates) {
      const entityType = aggregationHelper.getEntityType();
      for (const customAggregate of aCustomAggregates) {
        var _customAggregate$anno, _customAggregate$anno2, _relatedCustomAggrega, _relatedCustomAggrega2, _relatedCustomAggrega3;
        const aContextDefiningProperties = customAggregate === null || customAggregate === void 0 ? void 0 : (_customAggregate$anno = customAggregate.annotations) === null || _customAggregate$anno === void 0 ? void 0 : (_customAggregate$anno2 = _customAggregate$anno.Aggregation) === null || _customAggregate$anno2 === void 0 ? void 0 : _customAggregate$anno2.ContextDefiningProperties;
        const qualifier = customAggregate === null || customAggregate === void 0 ? void 0 : customAggregate.qualifier;
        const relatedCustomAggregateProperty = qualifier && entityType.entityProperties.find(property => property.name === qualifier);
        const label = relatedCustomAggregateProperty && (relatedCustomAggregateProperty === null || relatedCustomAggregateProperty === void 0 ? void 0 : (_relatedCustomAggrega = relatedCustomAggregateProperty.annotations) === null || _relatedCustomAggrega === void 0 ? void 0 : (_relatedCustomAggrega2 = _relatedCustomAggrega.Common) === null || _relatedCustomAggrega2 === void 0 ? void 0 : (_relatedCustomAggrega3 = _relatedCustomAggrega2.Label) === null || _relatedCustomAggrega3 === void 0 ? void 0 : _relatedCustomAggrega3.toString());
        mCustomAggregates[qualifier] = {
          name: qualifier,
          label: label || `Custom Aggregate (${qualifier})`,
          sortable: true,
          sortOrder: "both",
          contextDefiningProperty: aContextDefiningProperties ? aContextDefiningProperties.map(oCtxDefProperty => {
            return oCtxDefProperty.value;
          }) : []
        };
      }
    }
    const mTransAggregations = {};
    const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
    if (aTransAggregations) {
      for (let i = 0; i < aTransAggregations.length; i++) {
        var _aTransAggregations$i, _aTransAggregations$i2, _aTransAggregations$i3, _aTransAggregations$i4, _aTransAggregations$i5, _aTransAggregations$i6;
        mTransAggregations[aTransAggregations[i].Name] = {
          name: aTransAggregations[i].Name,
          propertyPath: aTransAggregations[i].AggregatableProperty.valueOf().value,
          aggregationMethod: aTransAggregations[i].AggregationMethod,
          label: (_aTransAggregations$i = aTransAggregations[i]) !== null && _aTransAggregations$i !== void 0 && (_aTransAggregations$i2 = _aTransAggregations$i.annotations) !== null && _aTransAggregations$i2 !== void 0 && (_aTransAggregations$i3 = _aTransAggregations$i2.Common) !== null && _aTransAggregations$i3 !== void 0 && _aTransAggregations$i3.Label ? (_aTransAggregations$i4 = aTransAggregations[i]) === null || _aTransAggregations$i4 === void 0 ? void 0 : (_aTransAggregations$i5 = _aTransAggregations$i4.annotations) === null || _aTransAggregations$i5 === void 0 ? void 0 : (_aTransAggregations$i6 = _aTransAggregations$i5.Common) === null || _aTransAggregations$i6 === void 0 ? void 0 : _aTransAggregations$i6.Label.toString() : `${oResourceBundleCore.getText("AGGREGATABLE_PROPERTY")} (${aTransAggregations[i].Name})`,
          sortable: true,
          sortOrder: "both",
          custom: false
        };
      }
    }
    const aAggProps = aggregationHelper.getAggregatableProperties();
    const aGrpProps = aggregationHelper.getGroupableProperties();
    const mApplySupported = {};
    mApplySupported.$Type = "Org.OData.Aggregation.V1.ApplySupportedType";
    mApplySupported.AggregatableProperties = [];
    mApplySupported.GroupableProperties = [];
    if (aAggProps) {
      mApplySupported.AggregatableProperties = aAggProps.map(prop => getAggregatablePropertiesObject(prop));
    }
    if (aGrpProps) {
      mApplySupported.GroupableProperties = aGrpProps.map(prop => ({
        ["$PropertyPath"]: prop.value
      }));
    }
    const chartActions = getChartActions(chartAnnotation, visualizationPath, converterContext);
    let [navigationPropertyPath /*, annotationPath*/] = visualizationPath.split("@");
    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }
    const title = ((_chartAnnotation$Titl = chartAnnotation.Title) === null || _chartAnnotation$Titl === void 0 ? void 0 : _chartAnnotation$Titl.toString()) || ""; // read title from chart annotation
    const dataModelPath = converterContext.getDataModelObjectPath();
    const isEntitySet = navigationPropertyPath.length === 0;
    const entityName = dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
    const sFilterbarId = isEntitySet ? getFilterBarID(converterContext.getContextPath()) : undefined;
    const oVizProperties = {
      legendGroup: {
        layout: {
          position: "bottom"
        }
      }
    };
    let autoBindOnInit;
    if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
      autoBindOnInit = true;
    } else if (converterContext.getTemplateType() === TemplateType.ListReport || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
      autoBindOnInit = false;
    }
    const hasMultipleVisualizations = converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
    const onSegmentedButtonPressed = hasMultipleVisualizations ? ".handlers.onSegmentedButtonPressed" : "";
    const visible = hasMultipleVisualizations ? "{= ${pageInternal>alpContentView} !== 'Table'}" : "true";
    const allowedTransformations = aggregationHelper.getAllowedTransformations();
    mApplySupported.enableSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;
    let qualifier = "";
    if (chartAnnotation.fullyQualifiedName.split("#").length > 1) {
      qualifier = chartAnnotation.fullyQualifiedName.split("#")[1];
    }
    return {
      type: VisualizationType.Chart,
      id: qualifier ? getChartID(isEntitySet ? entityName : navigationPropertyPath, qualifier, VisualizationType.Chart) : getChartID(isEntitySet ? entityName : navigationPropertyPath, VisualizationType.Chart),
      collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      entityName: entityName,
      personalization: getP13nMode(visualizationPath, converterContext),
      navigationPath: navigationPropertyPath,
      annotationPath: converterContext.getAbsoluteAnnotationPath(visualizationPath),
      filterId: sFilterbarId,
      vizProperties: JSON.stringify(oVizProperties),
      actions: chartActions.actions,
      commandActions: chartActions.commandActions,
      title: title,
      autoBindOnInit: autoBindOnInit,
      onSegmentedButtonPressed: onSegmentedButtonPressed,
      visible: visible,
      customAgg: mCustomAggregates,
      transAgg: mTransAggregations,
      applySupported: mApplySupported,
      selectionPresentationVariantPath: mSelectionPresentationVariantPath,
      variantManagement: findVariantManagement(p13nMode, variantManagement),
      isInsightsEnabled: (isInsightsEnabled ?? false) && getInsightsVisibility("Analytical", converterContext, visualizationPath)
    };
  }
  /**
   * Method to determine the variant management.
   *
   * @param p13nMode
   * @param variantManagement
   * @returns The variant management for the chart
   */
  _exports.createChartVisualization = createChartVisualization;
  function findVariantManagement(p13nMode, variantManagement) {
    return variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement;
  }

  /**
   * Method to get compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation.
   *
   * @param dataField
   * @param converterContext
   * @returns Compile expression for DataFieldForAction and DataFieldForIntentBasedNavigation
   */
  function getCompileExpressionForAction(dataField, converterContext) {
    var _dataField$annotation, _dataField$annotation2;
    return compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : _dataField$annotation2.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true)));
  }
  function createBlankChartVisualization(converterContext) {
    const hasMultipleVisualizations = converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
    const dataModelPath = converterContext.getDataModelObjectPath();
    const entityName = dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
    const visualization = {
      type: VisualizationType.Chart,
      id: getChartID(entityName, VisualizationType.Chart),
      entityName: entityName,
      title: "",
      collection: "",
      personalization: undefined,
      navigationPath: "",
      annotationPath: "",
      vizProperties: JSON.stringify({
        legendGroup: {
          layout: {
            position: "bottom"
          }
        }
      }),
      actions: [],
      commandActions: {},
      autoBindOnInit: false,
      onSegmentedButtonPressed: "",
      visible: hasMultipleVisualizations ? "{= ${pageInternal>alpContentView} !== 'Table'}" : "true",
      customAgg: {},
      transAgg: {},
      applySupported: {
        $Type: "Org.OData.Aggregation.V1.ApplySupportedType",
        AggregatableProperties: [],
        GroupableProperties: [],
        enableSearch: false
      },
      multiViews: false,
      variantManagement: VariantManagementType.None
    };
    return visualization;
  }
  _exports.createBlankChartVisualization = createBlankChartVisualization;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDaGFydEFjdGlvbnNGcm9tQW5ub3RhdGlvbnMiLCJjaGFydEFubm90YXRpb24iLCJ2aXN1YWxpemF0aW9uUGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJjaGFydEFjdGlvbnMiLCJhQWN0aW9ucyIsIkFjdGlvbnMiLCJmb3JFYWNoIiwiZGF0YUZpZWxkIiwiY2hhcnRBY3Rpb24iLCJpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IiwiSW5saW5lIiwiRGV0ZXJtaW5pbmciLCJrZXkiLCJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCIkVHlwZSIsIkFjdGlvblRhcmdldCIsImlzQm91bmQiLCJ0eXBlIiwiQWN0aW9uVHlwZSIsIkRhdGFGaWVsZEZvckFjdGlvbiIsImFubm90YXRpb25QYXRoIiwiZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInZpc2libGUiLCJnZXRDb21waWxlRXhwcmVzc2lvbkZvckFjdGlvbiIsIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiIsImlzTmF2aWdhYmxlIiwicHVzaCIsImdldENoYXJ0QWN0aW9ucyIsImFBbm5vdGF0aW9uQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uIiwiYWN0aW9ucyIsImFjdGlvbk92ZXJ3cml0ZUNvbmZpZyIsImVuYWJsZWQiLCJPdmVycmlkZVR5cGUiLCJvdmVyd3JpdGUiLCJlbmFibGVPblNlbGVjdCIsImNvbW1hbmQiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsImNvbW1hbmRBY3Rpb25zIiwiZ2V0UDEzbk1vZGUiLCJtYW5pZmVzdFdyYXBwZXIiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJjaGFydE1hbmlmZXN0U2V0dGluZ3MiLCJ2YXJpYW50TWFuYWdlbWVudCIsImdldFZhcmlhbnRNYW5hZ2VtZW50IiwiYVBlcnNvbmFsaXphdGlvbiIsInBlcnNvbmFsaXphdGlvbiIsImNoYXJ0U2V0dGluZ3MiLCJpc0NvbnRyb2xWYXJpYW50IiwiVmFyaWFudE1hbmFnZW1lbnRUeXBlIiwiQ29udHJvbCIsInVuZGVmaW5lZCIsIml0ZW0iLCJzb3J0IiwiZmlsdGVyIiwiam9pbiIsImNoZWNrRm9yU1BWIiwidmlld0NvbmZpZ3VyYXRpb24iLCJpbmRleE9mIiwiZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllc09iamVjdCIsImFnZ1Byb3AiLCJvYmoiLCJQcm9wZXJ0eSIsIiRQcm9wZXJ0eVBhdGgiLCJ2YWx1ZSIsIm5hbWUiLCJjcmVhdGVDaGFydFZpc3VhbGl6YXRpb24iLCJkb05vdENoZWNrQXBwbHlTdXBwb3J0ZWQiLCJpc0luc2lnaHRzRW5hYmxlZCIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiQWdncmVnYXRpb25IZWxwZXIiLCJnZXRFbnRpdHlUeXBlIiwiaXNBbmFseXRpY3NTdXBwb3J0ZWQiLCJFcnJvciIsImFUcmFuc0FnZ3JlZ2F0aW9ucyIsImdldFRyYW5zQWdncmVnYXRpb25zIiwiYUN1c3RvbUFnZ3JlZ2F0ZXMiLCJnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucyIsInBhZ2VNYW5pZmVzdFNldHRpbmdzIiwicDEzbk1vZGUiLCJMb2ciLCJ3YXJuaW5nIiwibUN1c3RvbUFnZ3JlZ2F0ZXMiLCJtU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJlbnRpdHlUeXBlIiwiY3VzdG9tQWdncmVnYXRlIiwiYUNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMiLCJhbm5vdGF0aW9ucyIsIkFnZ3JlZ2F0aW9uIiwiQ29udGV4dERlZmluaW5nUHJvcGVydGllcyIsInF1YWxpZmllciIsInJlbGF0ZWRDdXN0b21BZ2dyZWdhdGVQcm9wZXJ0eSIsImVudGl0eVByb3BlcnRpZXMiLCJmaW5kIiwicHJvcGVydHkiLCJsYWJlbCIsIkNvbW1vbiIsIkxhYmVsIiwidG9TdHJpbmciLCJzb3J0YWJsZSIsInNvcnRPcmRlciIsImNvbnRleHREZWZpbmluZ1Byb3BlcnR5IiwibWFwIiwib0N0eERlZlByb3BlcnR5IiwibVRyYW5zQWdncmVnYXRpb25zIiwib1Jlc291cmNlQnVuZGxlQ29yZSIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJpIiwibGVuZ3RoIiwiTmFtZSIsInByb3BlcnR5UGF0aCIsIkFnZ3JlZ2F0YWJsZVByb3BlcnR5IiwidmFsdWVPZiIsImFnZ3JlZ2F0aW9uTWV0aG9kIiwiQWdncmVnYXRpb25NZXRob2QiLCJnZXRUZXh0IiwiY3VzdG9tIiwiYUFnZ1Byb3BzIiwiZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllcyIsImFHcnBQcm9wcyIsImdldEdyb3VwYWJsZVByb3BlcnRpZXMiLCJtQXBwbHlTdXBwb3J0ZWQiLCJBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzIiwiR3JvdXBhYmxlUHJvcGVydGllcyIsInByb3AiLCJuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwic3BsaXQiLCJsYXN0SW5kZXhPZiIsInN1YnN0ciIsInRpdGxlIiwiVGl0bGUiLCJkYXRhTW9kZWxQYXRoIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsImlzRW50aXR5U2V0IiwiZW50aXR5TmFtZSIsInRhcmdldEVudGl0eVNldCIsInN0YXJ0aW5nRW50aXR5U2V0Iiwic0ZpbHRlcmJhcklkIiwiZ2V0RmlsdGVyQmFySUQiLCJnZXRDb250ZXh0UGF0aCIsIm9WaXpQcm9wZXJ0aWVzIiwibGVnZW5kR3JvdXAiLCJsYXlvdXQiLCJwb3NpdGlvbiIsImF1dG9CaW5kT25Jbml0IiwiZ2V0VGVtcGxhdGVUeXBlIiwiVGVtcGxhdGVUeXBlIiwiT2JqZWN0UGFnZSIsIkxpc3RSZXBvcnQiLCJBbmFseXRpY2FsTGlzdFBhZ2UiLCJoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zIiwib25TZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwiYWxsb3dlZFRyYW5zZm9ybWF0aW9ucyIsImdldEFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMiLCJlbmFibGVTZWFyY2giLCJWaXN1YWxpemF0aW9uVHlwZSIsIkNoYXJ0IiwiaWQiLCJnZXRDaGFydElEIiwiY29sbGVjdGlvbiIsImdldFRhcmdldE9iamVjdFBhdGgiLCJuYXZpZ2F0aW9uUGF0aCIsImdldEFic29sdXRlQW5ub3RhdGlvblBhdGgiLCJmaWx0ZXJJZCIsInZpelByb3BlcnRpZXMiLCJKU09OIiwic3RyaW5naWZ5IiwiY3VzdG9tQWdnIiwidHJhbnNBZ2ciLCJhcHBseVN1cHBvcnRlZCIsInNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoIiwiZmluZFZhcmlhbnRNYW5hZ2VtZW50IiwiZ2V0SW5zaWdodHNWaXNpYmlsaXR5IiwiTm9uZSIsImNvbXBpbGVFeHByZXNzaW9uIiwibm90IiwiZXF1YWwiLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJVSSIsIkhpZGRlbiIsImdldFJlbGF0aXZlTW9kZWxQYXRoRnVuY3Rpb24iLCJjcmVhdGVCbGFua0NoYXJ0VmlzdWFsaXphdGlvbiIsInZpc3VhbGl6YXRpb24iLCJtdWx0aVZpZXdzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDaGFydC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEFnZ3JlZ2F0YWJsZVByb3BlcnR5VHlwZSwgQWdncmVnYXRpb25NZXRob2QgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FnZ3JlZ2F0aW9uXCI7XG5pbXBvcnQgeyBBZ2dyZWdhdGlvbkFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IENoYXJ0LCBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBVSUFubm90YXRpb25UZXJtcywgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9hbm5vdGF0aW9ucy9EYXRhRmllbGRcIjtcbmltcG9ydCB0eXBlIHtcblx0QW5ub3RhdGlvbkFjdGlvbixcblx0QmFzZUFjdGlvbixcblx0Q29tYmluZWRBY3Rpb24sXG5cdEN1c3RvbUFjdGlvbixcblx0T3ZlcnJpZGVUeXBlQWN0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBpbnNlcnRDdXN0b21FbGVtZW50cywgT3ZlcnJpZGVUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IEtleUhlbHBlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvS2V5XCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgZXF1YWwsIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiwgbm90IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGdldFRhcmdldE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgQWdncmVnYXRpb25IZWxwZXIgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9BZ2dyZWdhdGlvblwiO1xuaW1wb3J0IHsgZ2V0Q2hhcnRJRCwgZ2V0RmlsdGVyQmFySUQgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9JRFwiO1xuaW1wb3J0IHsgZ2V0SW5zaWdodHNWaXNpYmlsaXR5IH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvSW5zaWdodHNIZWxwZXJzXCI7XG5pbXBvcnQgdHlwZSB7IENoYXJ0TWFuaWZlc3RDb25maWd1cmF0aW9uLCBWaWV3UGF0aENvbmZpZ3VyYXRpb24gfSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgQWN0aW9uVHlwZSwgVGVtcGxhdGVUeXBlLCBWYXJpYW50TWFuYWdlbWVudFR5cGUsIFZpc3VhbGl6YXRpb25UeXBlIH0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB0eXBlIE1hbmlmZXN0V3JhcHBlciBmcm9tIFwiLi4vLi4vTWFuaWZlc3RXcmFwcGVyXCI7XG5cbnR5cGUgQ2hhcnRBcHBseVN1cHBvcnRlZCA9IHtcblx0JFR5cGU6IHN0cmluZztcblx0ZW5hYmxlU2VhcmNoOiBib29sZWFuO1xuXHRBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzOiB1bmtub3duW107XG5cdEdyb3VwYWJsZVByb3BlcnRpZXM6IHVua25vd25bXTtcbn07XG4vKipcbiAqIEB0eXBlZGVmIENoYXJ0VmlzdWFsaXphdGlvblxuICovXG5leHBvcnQgdHlwZSBDaGFydFZpc3VhbGl6YXRpb24gPSB7XG5cdHR5cGU6IFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0O1xuXHRpZDogc3RyaW5nO1xuXHRjb2xsZWN0aW9uOiBzdHJpbmc7XG5cdGVudGl0eU5hbWU6IHN0cmluZztcblx0cGVyc29uYWxpemF0aW9uPzogc3RyaW5nO1xuXHRuYXZpZ2F0aW9uUGF0aDogc3RyaW5nO1xuXHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHRmaWx0ZXJJZD86IHN0cmluZztcblx0dml6UHJvcGVydGllczogc3RyaW5nO1xuXHRhY3Rpb25zOiBCYXNlQWN0aW9uW107XG5cdGNvbW1hbmRBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+O1xuXHR0aXRsZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRhdXRvQmluZE9uSW5pdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblx0b25TZWdtZW50ZWRCdXR0b25QcmVzc2VkOiBzdHJpbmc7XG5cdHZpc2libGU6IHN0cmluZztcblx0Y3VzdG9tQWdnOiBvYmplY3Q7XG5cdHRyYW5zQWdnOiBvYmplY3Q7XG5cdGFwcGx5U3VwcG9ydGVkOiBDaGFydEFwcGx5U3VwcG9ydGVkO1xuXHRtdWx0aVZpZXdzPzogYm9vbGVhbjtcblx0dmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50VHlwZTtcblx0c2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGg/OiBzdHJpbmc7XG5cdGlzSW5zaWdodHNFbmFibGVkPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogTWV0aG9kIHRvIHJldHJpZXZlIGFsbCBjaGFydCBhY3Rpb25zIGZyb20gYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNoYXJ0QW5ub3RhdGlvblxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgVGhlIGNoYXJ0IGFjdGlvbnMgZnJvbSB0aGUgYW5ub3RhdGlvblxuICovXG5mdW5jdGlvbiBnZXRDaGFydEFjdGlvbnNGcm9tQW5ub3RhdGlvbnMoXG5cdGNoYXJ0QW5ub3RhdGlvbjogQ2hhcnQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEJhc2VBY3Rpb25bXSB7XG5cdGNvbnN0IGNoYXJ0QWN0aW9uczogQmFzZUFjdGlvbltdID0gW107XG5cdGlmIChjaGFydEFubm90YXRpb24pIHtcblx0XHRjb25zdCBhQWN0aW9ucyA9IGNoYXJ0QW5ub3RhdGlvbi5BY3Rpb25zIHx8IFtdO1xuXHRcdGFBY3Rpb25zLmZvckVhY2goKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykgPT4ge1xuXHRcdFx0bGV0IGNoYXJ0QWN0aW9uOiBBbm5vdGF0aW9uQWN0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdFx0aWYgKGlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QoZGF0YUZpZWxkKSAmJiAhZGF0YUZpZWxkLklubGluZSAmJiAhZGF0YUZpZWxkLkRldGVybWluaW5nKSB7XG5cdFx0XHRcdGNvbnN0IGtleSA9IEtleUhlbHBlci5nZW5lcmF0ZUtleUZyb21EYXRhRmllbGQoZGF0YUZpZWxkKTtcblx0XHRcdFx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRcdFx0XHRcdGlmICghZGF0YUZpZWxkLkFjdGlvblRhcmdldD8uaXNCb3VuZCkge1xuXHRcdFx0XHRcdFx0XHRjaGFydEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGRhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0XHRcdFx0XHRcdGtleToga2V5LFxuXHRcdFx0XHRcdFx0XHRcdHZpc2libGU6IGdldENvbXBpbGVFeHByZXNzaW9uRm9yQWN0aW9uKGRhdGFGaWVsZCwgY29udmVydGVyQ29udGV4dClcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRcdFx0XHRjaGFydEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdFx0XHRcdGtleToga2V5LFxuXHRcdFx0XHRcdFx0XHR2aXNpYmxlOiBnZXRDb21waWxlRXhwcmVzc2lvbkZvckFjdGlvbihkYXRhRmllbGQsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0XHRcdFx0XHRpc05hdmlnYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2hhcnRBY3Rpb24pIHtcblx0XHRcdFx0Y2hhcnRBY3Rpb25zLnB1c2goY2hhcnRBY3Rpb24pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBjaGFydEFjdGlvbnM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGFydEFjdGlvbnMoY2hhcnRBbm5vdGF0aW9uOiBDaGFydCwgdmlzdWFsaXphdGlvblBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENvbWJpbmVkQWN0aW9uIHtcblx0Y29uc3QgYUFubm90YXRpb25BY3Rpb25zOiBCYXNlQWN0aW9uW10gPSBnZXRDaGFydEFjdGlvbnNGcm9tQW5ub3RhdGlvbnMoY2hhcnRBbm5vdGF0aW9uLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG1hbmlmZXN0QWN0aW9ucyA9IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKS5hY3Rpb25zLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0YUFubm90YXRpb25BY3Rpb25zXG5cdCk7XG5cdGNvbnN0IGFjdGlvbk92ZXJ3cml0ZUNvbmZpZzogT3ZlcnJpZGVUeXBlQWN0aW9uID0ge1xuXHRcdGVuYWJsZWQ6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0ZW5hYmxlT25TZWxlY3Q6IE92ZXJyaWRlVHlwZS5vdmVyd3JpdGUsXG5cdFx0dmlzaWJsZTogT3ZlcnJpZGVUeXBlLm92ZXJ3cml0ZSxcblx0XHRjb21tYW5kOiBPdmVycmlkZVR5cGUub3ZlcndyaXRlXG5cdH07XG5cdGNvbnN0IGNoYXJ0QWN0aW9ucyA9IGluc2VydEN1c3RvbUVsZW1lbnRzKGFBbm5vdGF0aW9uQWN0aW9ucywgbWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMsIGFjdGlvbk92ZXJ3cml0ZUNvbmZpZyk7XG5cdHJldHVybiB7XG5cdFx0YWN0aW9uczogY2hhcnRBY3Rpb25zLFxuXHRcdGNvbW1hbmRBY3Rpb25zOiBtYW5pZmVzdEFjdGlvbnMuY29tbWFuZEFjdGlvbnNcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFAxM25Nb2RlKHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXI6IE1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IGNoYXJ0TWFuaWZlc3RTZXR0aW5nczogQ2hhcnRNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpO1xuXHRjb25zdCB2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnRUeXBlID0gbWFuaWZlc3RXcmFwcGVyLmdldFZhcmlhbnRNYW5hZ2VtZW50KCk7XG5cdGNvbnN0IGFQZXJzb25hbGl6YXRpb246IHN0cmluZ1tdID0gW107XG5cdC8vIFBlcnNvbmFsaXphdGlvbiBjb25maWd1cmVkIGluIG1hbmlmZXN0LlxuXHRjb25zdCBwZXJzb25hbGl6YXRpb246IGFueSA9IGNoYXJ0TWFuaWZlc3RTZXR0aW5ncz8uY2hhcnRTZXR0aW5ncz8ucGVyc29uYWxpemF0aW9uO1xuXHRjb25zdCBpc0NvbnRyb2xWYXJpYW50ID0gdmFyaWFudE1hbmFnZW1lbnQgPT09IFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sID8gdHJ1ZSA6IGZhbHNlO1xuXHQvLyBpZiBwZXJzb25hbGl6YXRpb24gaXMgc2V0IHRvIGZhbHNlIGRvIG5vdCBzaG93IGFueSBvcHRpb25cblx0aWYgKChwZXJzb25hbGl6YXRpb24gIT09IHVuZGVmaW5lZCAmJiAhcGVyc29uYWxpemF0aW9uKSB8fCBwZXJzb25hbGl6YXRpb24gPT0gXCJmYWxzZVwiKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRzd2l0Y2ggKHRydWUpIHtcblx0XHRjYXNlIHR5cGVvZiBwZXJzb25hbGl6YXRpb24gPT09IFwib2JqZWN0XCI6XG5cdFx0XHQvLyBTcGVjaWZpYyBwZXJzb25hbGl6YXRpb24gb3B0aW9ucyBlbmFibGVkIGluIG1hbmlmZXN0LiBVc2UgdGhlbSBhcyBpcy5cblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24udHlwZSkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJUeXBlXCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5pdGVtKSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkl0ZW1cIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLnNvcnQpIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiU29ydFwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24uZmlsdGVyKSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkZpbHRlclwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBhUGVyc29uYWxpemF0aW9uLmpvaW4oXCIsXCIpO1xuXHRcdGNhc2UgaXNDb250cm9sVmFyaWFudDpcblx0XHRjYXNlICEhcGVyc29uYWxpemF0aW9uOlxuXHRcdFx0Ly8gbWFuaWZlc3QgaGFzIHBlcnNvbmFsaXphdGlvbiBjb25maWd1cmVkLCBjaGVjayBpZiBpdCdzIHRydWVcblx0XHRcdC8vIGlmIG1hbmlmZXN0IGRvZXNuJ3QgaGF2ZSBwZXJzb25hbGl6YXRpb24sIGNoZWNrIGZvciB2YXJpYW50IG1hbmFnZW1lbnQgaXMgc2V0IHRvIGNvbnRyb2xcblx0XHRcdHJldHVybiBcIlNvcnQsVHlwZSxJdGVtLEZpbHRlclwiO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHQvLyBpZiBtYW5pZmVzdCBkb2Vzbid0IGhhdmUgcGVyc29uYWxpemF0aW9uLCBzaG93IGRlZmF1bHQgb3B0aW9ucyB3aXRob3V0IGZpbHRlclxuXHRcdFx0cmV0dXJuIFwiU29ydCxUeXBlLEl0ZW1cIjtcblx0fVxufVxuZXhwb3J0IHR5cGUgQ2hhcnRDdXN0b21BZ2dyZWdhdGUgPSB7XG5cdG5hbWU6IHN0cmluZztcblx0bGFiZWw6IHN0cmluZztcblx0c29ydGFibGU6IGJvb2xlYW47XG5cdHNvcnRPcmRlcjogXCJib3RoXCI7XG5cdGNvbnRleHREZWZpbmluZ1Byb3BlcnR5OiBzdHJpbmdbXTtcbn07XG5cbmV4cG9ydCB0eXBlIFRyYW5zQWdnID0ge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHByb3BlcnR5UGF0aDogc3RyaW5nO1xuXHRhZ2dyZWdhdGlvbk1ldGhvZDogQWdncmVnYXRpb25NZXRob2Q7XG5cdGxhYmVsOiBzdHJpbmc7XG5cdHNvcnRhYmxlOiBib29sZWFuO1xuXHRzb3J0T3JkZXI6IFwiYm90aFwiO1xuXHRjdXN0b206IGJvb2xlYW47XG59O1xuLy8gY2hlY2sgaWYgYW5ub2F0YXRpb24gcGF0aCBoYXMgU1BWIGFuZCBzdG9yZSB0aGUgcGF0aFxuZnVuY3Rpb24gY2hlY2tGb3JTUFYodmlld0NvbmZpZ3VyYXRpb246IFZpZXdQYXRoQ29uZmlndXJhdGlvbiB8IHVuZGVmaW5lZCkge1xuXHRyZXR1cm4gdmlld0NvbmZpZ3VyYXRpb24/LmFubm90YXRpb25QYXRoPy5pbmRleE9mKGBAJHtVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50fWApICE9PSAtMVxuXHRcdD8gdmlld0NvbmZpZ3VyYXRpb24/LmFubm90YXRpb25QYXRoXG5cdFx0OiB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBnZXRBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzT2JqZWN0KGFnZ1Byb3A6IEFnZ3JlZ2F0YWJsZVByb3BlcnR5VHlwZSB8IFByb3BlcnR5KSB7XG5cdGxldCBvYmo7XG5cdGlmICgoYWdnUHJvcCBhcyBBZ2dyZWdhdGFibGVQcm9wZXJ0eVR5cGUpPy5Qcm9wZXJ0eSkge1xuXHRcdG9iaiA9IHtcblx0XHRcdFByb3BlcnR5OiB7XG5cdFx0XHRcdCRQcm9wZXJ0eVBhdGg6IChhZ2dQcm9wIGFzIEFnZ3JlZ2F0YWJsZVByb3BlcnR5VHlwZSk/LlByb3BlcnR5Py52YWx1ZVxuXHRcdFx0fVxuXHRcdH07XG5cdH0gZWxzZSB7XG5cdFx0b2JqID0ge1xuXHRcdFx0UHJvcGVydHk6IHtcblx0XHRcdFx0JFByb3BlcnR5UGF0aDogKGFnZ1Byb3AgYXMgUHJvcGVydHkpPy5uYW1lXG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gb2JqO1xufVxuLyoqXG4gKiBDcmVhdGUgdGhlIENoYXJ0VmlzdWFsaXphdGlvbiBjb25maWd1cmF0aW9uIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGRpc3BsYXkgYSBjaGFydCB1c2luZyB0aGUgQ2hhcnQgYnVpbGRpbmcgYmxvY2suXG4gKlxuICogQHBhcmFtIGNoYXJ0QW5ub3RhdGlvbiBUaGUgdGFyZ2V0ZWQgY2hhcnQgYW5ub3RhdGlvblxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoIFRoZSBwYXRoIG9mIHRoZSB2aXN1YWxpemF0aW9uIGFubm90YXRpb25cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZCBGbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgQXBwbHlTdXBwb3J0ZWQgbmVlZHMgdG8gYmUgY2hlY2tlZCBvciBub3RcbiAqIEBwYXJhbSB2aWV3Q29uZmlndXJhdGlvblxuICogQHBhcmFtIGlzSW5zaWdodHNFbmFibGVkIEZsYWcgdGhhdCBpbmRpY2F0ZXMgd2hldGhlciBpbnNpZ2h0cyBlbmFibGVkXG4gKiBAcmV0dXJucyBUaGUgY2hhcnQgdmlzdWFsaXphdGlvbiBiYXNlZCBvbiB0aGUgYW5ub3RhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ2hhcnRWaXN1YWxpemF0aW9uKFxuXHRjaGFydEFubm90YXRpb246IENoYXJ0LFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRkb05vdENoZWNrQXBwbHlTdXBwb3J0ZWQ/OiBib29sZWFuLFxuXHR2aWV3Q29uZmlndXJhdGlvbj86IFZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0aXNJbnNpZ2h0c0VuYWJsZWQ/OiBib29sZWFuXG4pOiBDaGFydFZpc3VhbGl6YXRpb24ge1xuXHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgY29udmVydGVyQ29udGV4dCwgdHJ1ZSk7IC8vIHBhc3NpbmcgdGhlIGxhc3QgcGFyYW1ldGVyIGFzIHRydWUgdG8gY29uc2lkZXIgdGhlIG9sZCBhbm5vdGF0aW9ucyBpLmUuIEFnZ3JlZ2F0aW9uLkFnZ3JlZ2F0YWJsZSBmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSBpbiBjYXNlIG9mIGNoYXJ0XG5cdGlmICghZG9Ob3RDaGVja0FwcGx5U3VwcG9ydGVkICYmICFhZ2dyZWdhdGlvbkhlbHBlci5pc0FuYWx5dGljc1N1cHBvcnRlZCgpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQXBwbHlTdXBwb3J0ZWQgaXMgbm90IGFkZGVkIHRvIHRoZSBhbm5vdGF0aW9uc1wiKTtcblx0fVxuXHRjb25zdCBhVHJhbnNBZ2dyZWdhdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRUcmFuc0FnZ3JlZ2F0aW9ucygpO1xuXHRjb25zdCBhQ3VzdG9tQWdncmVnYXRlcyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zKCk7XG5cdGNvbnN0IHBhZ2VNYW5pZmVzdFNldHRpbmdzOiBNYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCB2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnRUeXBlID0gcGFnZU1hbmlmZXN0U2V0dGluZ3MuZ2V0VmFyaWFudE1hbmFnZW1lbnQoKTtcblx0Y29uc3QgcDEzbk1vZGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGdldFAxM25Nb2RlKHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0aWYgKHAxM25Nb2RlID09PSB1bmRlZmluZWQgJiYgdmFyaWFudE1hbmFnZW1lbnQgPT09IFwiQ29udHJvbFwiKSB7XG5cdFx0TG9nLndhcm5pbmcoXCJWYXJpYW50IE1hbmFnZW1lbnQgY2Fubm90IGJlIGVuYWJsZWQgd2hlbiBwZXJzb25hbGl6YXRpb24gaXMgZGlzYWJsZWRcIik7XG5cdH1cblx0Y29uc3QgbUN1c3RvbUFnZ3JlZ2F0ZXMgPSB7fSBhcyBhbnk7XG5cdC8vIGNoZWNrIGlmIGFubm9hdGF0aW9uIHBhdGggaGFzIFNQViBhbmQgc3RvcmUgdGhlIHBhdGhcblx0Y29uc3QgbVNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBjaGVja0ZvclNQVih2aWV3Q29uZmlndXJhdGlvbik7XG5cdGlmIChhQ3VzdG9tQWdncmVnYXRlcykge1xuXHRcdGNvbnN0IGVudGl0eVR5cGUgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRFbnRpdHlUeXBlKCk7XG5cdFx0Zm9yIChjb25zdCBjdXN0b21BZ2dyZWdhdGUgb2YgYUN1c3RvbUFnZ3JlZ2F0ZXMpIHtcblx0XHRcdGNvbnN0IGFDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzID0gY3VzdG9tQWdncmVnYXRlPy5hbm5vdGF0aW9ucz8uQWdncmVnYXRpb24/LkNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXM7XG5cdFx0XHRjb25zdCBxdWFsaWZpZXIgPSBjdXN0b21BZ2dyZWdhdGU/LnF1YWxpZmllcjtcblx0XHRcdGNvbnN0IHJlbGF0ZWRDdXN0b21BZ2dyZWdhdGVQcm9wZXJ0eSA9IHF1YWxpZmllciAmJiBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmluZCgocHJvcGVydHkpID0+IHByb3BlcnR5Lm5hbWUgPT09IHF1YWxpZmllcik7XG5cdFx0XHRjb25zdCBsYWJlbCA9IHJlbGF0ZWRDdXN0b21BZ2dyZWdhdGVQcm9wZXJ0eSAmJiByZWxhdGVkQ3VzdG9tQWdncmVnYXRlUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsPy50b1N0cmluZygpO1xuXHRcdFx0bUN1c3RvbUFnZ3JlZ2F0ZXNbcXVhbGlmaWVyXSA9IHtcblx0XHRcdFx0bmFtZTogcXVhbGlmaWVyLFxuXHRcdFx0XHRsYWJlbDogbGFiZWwgfHwgYEN1c3RvbSBBZ2dyZWdhdGUgKCR7cXVhbGlmaWVyfSlgLFxuXHRcdFx0XHRzb3J0YWJsZTogdHJ1ZSxcblx0XHRcdFx0c29ydE9yZGVyOiBcImJvdGhcIixcblx0XHRcdFx0Y29udGV4dERlZmluaW5nUHJvcGVydHk6IGFDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzXG5cdFx0XHRcdFx0PyBhQ29udGV4dERlZmluaW5nUHJvcGVydGllcy5tYXAoKG9DdHhEZWZQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb0N0eERlZlByb3BlcnR5LnZhbHVlO1xuXHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHQ6IFtdXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IG1UcmFuc0FnZ3JlZ2F0aW9uczogUmVjb3JkPHN0cmluZywgVHJhbnNBZ2c+ID0ge307XG5cdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZUNvcmUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRpZiAoYVRyYW5zQWdncmVnYXRpb25zKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhVHJhbnNBZ2dyZWdhdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdG1UcmFuc0FnZ3JlZ2F0aW9uc1thVHJhbnNBZ2dyZWdhdGlvbnNbaV0uTmFtZV0gPSB7XG5cdFx0XHRcdG5hbWU6IGFUcmFuc0FnZ3JlZ2F0aW9uc1tpXS5OYW1lLFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGg6IGFUcmFuc0FnZ3JlZ2F0aW9uc1tpXS5BZ2dyZWdhdGFibGVQcm9wZXJ0eS52YWx1ZU9mKCkudmFsdWUsXG5cdFx0XHRcdGFnZ3JlZ2F0aW9uTWV0aG9kOiBhVHJhbnNBZ2dyZWdhdGlvbnNbaV0uQWdncmVnYXRpb25NZXRob2QsXG5cdFx0XHRcdGxhYmVsOiBhVHJhbnNBZ2dyZWdhdGlvbnNbaV0/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsXG5cdFx0XHRcdFx0PyBhVHJhbnNBZ2dyZWdhdGlvbnNbaV0/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsLnRvU3RyaW5nKClcblx0XHRcdFx0XHQ6IGAke29SZXNvdXJjZUJ1bmRsZUNvcmUuZ2V0VGV4dChcIkFHR1JFR0FUQUJMRV9QUk9QRVJUWVwiKX0gKCR7YVRyYW5zQWdncmVnYXRpb25zW2ldLk5hbWV9KWAsXG5cdFx0XHRcdHNvcnRhYmxlOiB0cnVlLFxuXHRcdFx0XHRzb3J0T3JkZXI6IFwiYm90aFwiLFxuXHRcdFx0XHRjdXN0b206IGZhbHNlXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGFBZ2dQcm9wcyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMoKTtcblx0Y29uc3QgYUdycFByb3BzID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0R3JvdXBhYmxlUHJvcGVydGllcygpO1xuXHRjb25zdCBtQXBwbHlTdXBwb3J0ZWQgPSB7fSBhcyBDaGFydEFwcGx5U3VwcG9ydGVkO1xuXHRtQXBwbHlTdXBwb3J0ZWQuJFR5cGUgPSBBZ2dyZWdhdGlvbkFubm90YXRpb25UeXBlcy5BcHBseVN1cHBvcnRlZFR5cGU7XG5cdG1BcHBseVN1cHBvcnRlZC5BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzID0gW107XG5cdG1BcHBseVN1cHBvcnRlZC5Hcm91cGFibGVQcm9wZXJ0aWVzID0gW107XG5cblx0aWYgKGFBZ2dQcm9wcykge1xuXHRcdG1BcHBseVN1cHBvcnRlZC5BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzID0gYUFnZ1Byb3BzLm1hcCgocHJvcCkgPT4gZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllc09iamVjdChwcm9wKSk7XG5cdH1cblxuXHRpZiAoYUdycFByb3BzKSB7XG5cdFx0bUFwcGx5U3VwcG9ydGVkLkdyb3VwYWJsZVByb3BlcnRpZXMgPSBhR3JwUHJvcHMubWFwKChwcm9wKSA9PiAoeyBbXCIkUHJvcGVydHlQYXRoXCJdOiBwcm9wLnZhbHVlIH0pKTtcblx0fVxuXG5cdGNvbnN0IGNoYXJ0QWN0aW9ucyA9IGdldENoYXJ0QWN0aW9ucyhjaGFydEFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0bGV0IFtuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIC8qLCBhbm5vdGF0aW9uUGF0aCovXSA9IHZpc3VhbGl6YXRpb25QYXRoLnNwbGl0KFwiQFwiKTtcblx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGFzdEluZGV4T2YoXCIvXCIpID09PSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpIHtcblx0XHQvLyBEcm9wIHRyYWlsaW5nIHNsYXNoXG5cdFx0bmF2aWdhdGlvblByb3BlcnR5UGF0aCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGguc3Vic3RyKDAsIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoIC0gMSk7XG5cdH1cblx0Y29uc3QgdGl0bGUgPSBjaGFydEFubm90YXRpb24uVGl0bGU/LnRvU3RyaW5nKCkgfHwgXCJcIjsgLy8gcmVhZCB0aXRsZSBmcm9tIGNoYXJ0IGFubm90YXRpb25cblx0Y29uc3QgZGF0YU1vZGVsUGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpO1xuXHRjb25zdCBpc0VudGl0eVNldDogYm9vbGVhbiA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoID09PSAwO1xuXHRjb25zdCBlbnRpdHlOYW1lOiBzdHJpbmcgPSBkYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldCA/IGRhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0Lm5hbWUgOiBkYXRhTW9kZWxQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWU7XG5cdGNvbnN0IHNGaWx0ZXJiYXJJZCA9IGlzRW50aXR5U2V0ID8gZ2V0RmlsdGVyQmFySUQoY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpKSA6IHVuZGVmaW5lZDtcblx0Y29uc3Qgb1ZpelByb3BlcnRpZXMgPSB7XG5cdFx0bGVnZW5kR3JvdXA6IHtcblx0XHRcdGxheW91dDoge1xuXHRcdFx0XHRwb3NpdGlvbjogXCJib3R0b21cIlxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0bGV0IGF1dG9CaW5kT25Jbml0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLk9iamVjdFBhZ2UpIHtcblx0XHRhdXRvQmluZE9uSW5pdCA9IHRydWU7XG5cdH0gZWxzZSBpZiAoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkxpc3RSZXBvcnQgfHxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlXG5cdCkge1xuXHRcdGF1dG9CaW5kT25Jbml0ID0gZmFsc2U7XG5cdH1cblx0Y29uc3QgaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyA9XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKCkgfHxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlO1xuXHRjb25zdCBvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQgPSBoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zID8gXCIuaGFuZGxlcnMub25TZWdtZW50ZWRCdXR0b25QcmVzc2VkXCIgOiBcIlwiO1xuXHRjb25zdCB2aXNpYmxlID0gaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyA/IFwiez0gJHtwYWdlSW50ZXJuYWw+YWxwQ29udGVudFZpZXd9ICE9PSAnVGFibGUnfVwiIDogXCJ0cnVlXCI7XG5cdGNvbnN0IGFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRBbGxvd2VkVHJhbnNmb3JtYXRpb25zKCk7XG5cdG1BcHBseVN1cHBvcnRlZC5lbmFibGVTZWFyY2ggPSBhbGxvd2VkVHJhbnNmb3JtYXRpb25zID8gYWxsb3dlZFRyYW5zZm9ybWF0aW9ucy5pbmRleE9mKFwic2VhcmNoXCIpID49IDAgOiB0cnVlO1xuXHRsZXQgcXVhbGlmaWVyID0gXCJcIjtcblx0aWYgKGNoYXJ0QW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoXCIjXCIpLmxlbmd0aCA+IDEpIHtcblx0XHRxdWFsaWZpZXIgPSBjaGFydEFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KFwiI1wiKVsxXTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHR5cGU6IFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0LFxuXHRcdGlkOiBxdWFsaWZpZXJcblx0XHRcdD8gZ2V0Q2hhcnRJRChpc0VudGl0eVNldCA/IGVudGl0eU5hbWUgOiBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBxdWFsaWZpZXIsIFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0KVxuXHRcdFx0OiBnZXRDaGFydElEKGlzRW50aXR5U2V0ID8gZW50aXR5TmFtZSA6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0KSxcblx0XHRjb2xsZWN0aW9uOiBnZXRUYXJnZXRPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpKSxcblx0XHRlbnRpdHlOYW1lOiBlbnRpdHlOYW1lLFxuXHRcdHBlcnNvbmFsaXphdGlvbjogZ2V0UDEzbk1vZGUodmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdG5hdmlnYXRpb25QYXRoOiBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLFxuXHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEFic29sdXRlQW5ub3RhdGlvblBhdGgodmlzdWFsaXphdGlvblBhdGgpLFxuXHRcdGZpbHRlcklkOiBzRmlsdGVyYmFySWQsXG5cdFx0dml6UHJvcGVydGllczogSlNPTi5zdHJpbmdpZnkob1ZpelByb3BlcnRpZXMpLFxuXHRcdGFjdGlvbnM6IGNoYXJ0QWN0aW9ucy5hY3Rpb25zLFxuXHRcdGNvbW1hbmRBY3Rpb25zOiBjaGFydEFjdGlvbnMuY29tbWFuZEFjdGlvbnMsXG5cdFx0dGl0bGU6IHRpdGxlLFxuXHRcdGF1dG9CaW5kT25Jbml0OiBhdXRvQmluZE9uSW5pdCxcblx0XHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQ6IG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCxcblx0XHR2aXNpYmxlOiB2aXNpYmxlLFxuXHRcdGN1c3RvbUFnZzogbUN1c3RvbUFnZ3JlZ2F0ZXMsXG5cdFx0dHJhbnNBZ2c6IG1UcmFuc0FnZ3JlZ2F0aW9ucyxcblx0XHRhcHBseVN1cHBvcnRlZDogbUFwcGx5U3VwcG9ydGVkLFxuXHRcdHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoOiBtU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGgsXG5cdFx0dmFyaWFudE1hbmFnZW1lbnQ6IGZpbmRWYXJpYW50TWFuYWdlbWVudChwMTNuTW9kZSwgdmFyaWFudE1hbmFnZW1lbnQpLFxuXHRcdGlzSW5zaWdodHNFbmFibGVkOiAoaXNJbnNpZ2h0c0VuYWJsZWQgPz8gZmFsc2UpICYmIGdldEluc2lnaHRzVmlzaWJpbGl0eShcIkFuYWx5dGljYWxcIiwgY29udmVydGVyQ29udGV4dCwgdmlzdWFsaXphdGlvblBhdGgpXG5cdH07XG59XG4vKipcbiAqIE1ldGhvZCB0byBkZXRlcm1pbmUgdGhlIHZhcmlhbnQgbWFuYWdlbWVudC5cbiAqXG4gKiBAcGFyYW0gcDEzbk1vZGVcbiAqIEBwYXJhbSB2YXJpYW50TWFuYWdlbWVudFxuICogQHJldHVybnMgVGhlIHZhcmlhbnQgbWFuYWdlbWVudCBmb3IgdGhlIGNoYXJ0XG4gKi9cbmZ1bmN0aW9uIGZpbmRWYXJpYW50TWFuYWdlbWVudChwMTNuTW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkLCB2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnRUeXBlKSB7XG5cdHJldHVybiB2YXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIgJiYgIXAxM25Nb2RlID8gVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmUgOiB2YXJpYW50TWFuYWdlbWVudDtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gZ2V0IGNvbXBpbGUgZXhwcmVzc2lvbiBmb3IgRGF0YUZpZWxkRm9yQWN0aW9uIGFuZCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24uXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIENvbXBpbGUgZXhwcmVzc2lvbiBmb3IgRGF0YUZpZWxkRm9yQWN0aW9uIGFuZCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0Q29tcGlsZUV4cHJlc3Npb25Gb3JBY3Rpb24oZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRub3QoXG5cdFx0XHRlcXVhbChcblx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0XHRcdGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbixcblx0XHRcdFx0XHRbXSxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZU1vZGVsUGF0aEZ1bmN0aW9uKClcblx0XHRcdFx0KSxcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0KVxuXHRcdClcblx0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUJsYW5rQ2hhcnRWaXN1YWxpemF0aW9uKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBDaGFydFZpc3VhbGl6YXRpb24ge1xuXHRjb25zdCBoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zID1cblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSB8fFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2U7XG5cdGNvbnN0IGRhdGFNb2RlbFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0Y29uc3QgZW50aXR5TmFtZSA9IGRhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0ID8gZGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQubmFtZSA6IGRhdGFNb2RlbFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZTtcblxuXHRjb25zdCB2aXN1YWxpemF0aW9uOiBDaGFydFZpc3VhbGl6YXRpb24gPSB7XG5cdFx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQsXG5cdFx0aWQ6IGdldENoYXJ0SUQoZW50aXR5TmFtZSwgVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQpLFxuXHRcdGVudGl0eU5hbWU6IGVudGl0eU5hbWUsXG5cdFx0dGl0bGU6IFwiXCIsXG5cdFx0Y29sbGVjdGlvbjogXCJcIixcblx0XHRwZXJzb25hbGl6YXRpb246IHVuZGVmaW5lZCxcblx0XHRuYXZpZ2F0aW9uUGF0aDogXCJcIixcblx0XHRhbm5vdGF0aW9uUGF0aDogXCJcIixcblx0XHR2aXpQcm9wZXJ0aWVzOiBKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRsZWdlbmRHcm91cDoge1xuXHRcdFx0XHRsYXlvdXQ6IHtcblx0XHRcdFx0XHRwb3NpdGlvbjogXCJib3R0b21cIlxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSksXG5cdFx0YWN0aW9uczogW10sXG5cdFx0Y29tbWFuZEFjdGlvbnM6IHt9LFxuXHRcdGF1dG9CaW5kT25Jbml0OiBmYWxzZSxcblx0XHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQ6IFwiXCIsXG5cdFx0dmlzaWJsZTogaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyA/IFwiez0gJHtwYWdlSW50ZXJuYWw+YWxwQ29udGVudFZpZXd9ICE9PSAnVGFibGUnfVwiIDogXCJ0cnVlXCIsXG5cdFx0Y3VzdG9tQWdnOiB7fSxcblx0XHR0cmFuc0FnZzoge30sXG5cdFx0YXBwbHlTdXBwb3J0ZWQ6IHtcblx0XHRcdCRUeXBlOiBcIk9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BcHBseVN1cHBvcnRlZFR5cGVcIixcblx0XHRcdEFnZ3JlZ2F0YWJsZVByb3BlcnRpZXM6IFtdLFxuXHRcdFx0R3JvdXBhYmxlUHJvcGVydGllczogW10sXG5cdFx0XHRlbmFibGVTZWFyY2g6IGZhbHNlXG5cdFx0fSxcblx0XHRtdWx0aVZpZXdzOiBmYWxzZSxcblx0XHR2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmVcblx0fTtcblxuXHRyZXR1cm4gdmlzdWFsaXphdGlvbjtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUE2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNBLDhCQUE4QixDQUN0Q0MsZUFBc0IsRUFDdEJDLGlCQUF5QixFQUN6QkMsZ0JBQWtDLEVBQ25CO0lBQ2YsTUFBTUMsWUFBMEIsR0FBRyxFQUFFO0lBQ3JDLElBQUlILGVBQWUsRUFBRTtNQUNwQixNQUFNSSxRQUFRLEdBQUdKLGVBQWUsQ0FBQ0ssT0FBTyxJQUFJLEVBQUU7TUFDOUNELFFBQVEsQ0FBQ0UsT0FBTyxDQUFFQyxTQUFpQyxJQUFLO1FBQUE7UUFDdkQsSUFBSUMsV0FBeUM7UUFDN0MsSUFBSUMsNEJBQTRCLENBQUNGLFNBQVMsQ0FBQyxJQUFJLENBQUNBLFNBQVMsQ0FBQ0csTUFBTSxJQUFJLENBQUNILFNBQVMsQ0FBQ0ksV0FBVyxFQUFFO1VBQzNGLE1BQU1DLEdBQUcsR0FBR0MsU0FBUyxDQUFDQyx3QkFBd0IsQ0FBQ1AsU0FBUyxDQUFDO1VBQ3pELFFBQVFBLFNBQVMsQ0FBQ1EsS0FBSztZQUN0QjtjQUNDLElBQUksMkJBQUNSLFNBQVMsQ0FBQ1MsWUFBWSxrREFBdEIsc0JBQXdCQyxPQUFPLEdBQUU7Z0JBQ3JDVCxXQUFXLEdBQUc7a0JBQ2JVLElBQUksRUFBRUMsVUFBVSxDQUFDQyxrQkFBa0I7a0JBQ25DQyxjQUFjLEVBQUVuQixnQkFBZ0IsQ0FBQ29CLCtCQUErQixDQUFDZixTQUFTLENBQUNnQixrQkFBa0IsQ0FBQztrQkFDOUZYLEdBQUcsRUFBRUEsR0FBRztrQkFDUlksT0FBTyxFQUFFQyw2QkFBNkIsQ0FBQ2xCLFNBQVMsRUFBRUwsZ0JBQWdCO2dCQUNuRSxDQUFDO2NBQ0Y7Y0FDQTtZQUVEO2NBQ0NNLFdBQVcsR0FBRztnQkFDYlUsSUFBSSxFQUFFQyxVQUFVLENBQUNPLGlDQUFpQztnQkFDbERMLGNBQWMsRUFBRW5CLGdCQUFnQixDQUFDb0IsK0JBQStCLENBQUNmLFNBQVMsQ0FBQ2dCLGtCQUFrQixDQUFDO2dCQUM5RlgsR0FBRyxFQUFFQSxHQUFHO2dCQUNSWSxPQUFPLEVBQUVDLDZCQUE2QixDQUFDbEIsU0FBUyxFQUFFTCxnQkFBZ0IsQ0FBQztnQkFDbkV5QixXQUFXLEVBQUU7Y0FDZCxDQUFDO2NBQ0Q7VUFBTTtRQUVUO1FBQ0EsSUFBSW5CLFdBQVcsRUFBRTtVQUNoQkwsWUFBWSxDQUFDeUIsSUFBSSxDQUFDcEIsV0FBVyxDQUFDO1FBQy9CO01BQ0QsQ0FBQyxDQUFDO0lBQ0g7SUFDQSxPQUFPTCxZQUFZO0VBQ3BCO0VBRU8sU0FBUzBCLGVBQWUsQ0FBQzdCLGVBQXNCLEVBQUVDLGlCQUF5QixFQUFFQyxnQkFBa0MsRUFBa0I7SUFDdEksTUFBTTRCLGtCQUFnQyxHQUFHL0IsOEJBQThCLENBQUNDLGVBQWUsRUFBRUMsaUJBQWlCLEVBQUVDLGdCQUFnQixDQUFDO0lBQzdILE1BQU02QixlQUFlLEdBQUdDLHNCQUFzQixDQUM3QzlCLGdCQUFnQixDQUFDK0IsK0JBQStCLENBQUNoQyxpQkFBaUIsQ0FBQyxDQUFDaUMsT0FBTyxFQUMzRWhDLGdCQUFnQixFQUNoQjRCLGtCQUFrQixDQUNsQjtJQUNELE1BQU1LLHFCQUF5QyxHQUFHO01BQ2pEQyxPQUFPLEVBQUVDLFlBQVksQ0FBQ0MsU0FBUztNQUMvQkMsY0FBYyxFQUFFRixZQUFZLENBQUNDLFNBQVM7TUFDdENkLE9BQU8sRUFBRWEsWUFBWSxDQUFDQyxTQUFTO01BQy9CRSxPQUFPLEVBQUVILFlBQVksQ0FBQ0M7SUFDdkIsQ0FBQztJQUNELE1BQU1uQyxZQUFZLEdBQUdzQyxvQkFBb0IsQ0FBQ1gsa0JBQWtCLEVBQUVDLGVBQWUsQ0FBQ0csT0FBTyxFQUFFQyxxQkFBcUIsQ0FBQztJQUM3RyxPQUFPO01BQ05ELE9BQU8sRUFBRS9CLFlBQVk7TUFDckJ1QyxjQUFjLEVBQUVYLGVBQWUsQ0FBQ1c7SUFDakMsQ0FBQztFQUNGO0VBQUM7RUFFTSxTQUFTQyxXQUFXLENBQUMxQyxpQkFBeUIsRUFBRUMsZ0JBQWtDLEVBQXNCO0lBQUE7SUFDOUcsTUFBTTBDLGVBQWdDLEdBQUcxQyxnQkFBZ0IsQ0FBQzJDLGtCQUFrQixFQUFFO0lBQzlFLE1BQU1DLHFCQUFpRCxHQUFHNUMsZ0JBQWdCLENBQUMrQiwrQkFBK0IsQ0FBQ2hDLGlCQUFpQixDQUFDO0lBQzdILE1BQU04QyxpQkFBd0MsR0FBR0gsZUFBZSxDQUFDSSxvQkFBb0IsRUFBRTtJQUN2RixNQUFNQyxnQkFBMEIsR0FBRyxFQUFFO0lBQ3JDO0lBQ0EsTUFBTUMsZUFBb0IsR0FBR0oscUJBQXFCLGFBQXJCQSxxQkFBcUIsZ0RBQXJCQSxxQkFBcUIsQ0FBRUssYUFBYSwwREFBcEMsc0JBQXNDRCxlQUFlO0lBQ2xGLE1BQU1FLGdCQUFnQixHQUFHTCxpQkFBaUIsS0FBS00scUJBQXFCLENBQUNDLE9BQU8sR0FBRyxJQUFJLEdBQUcsS0FBSztJQUMzRjtJQUNBLElBQUtKLGVBQWUsS0FBS0ssU0FBUyxJQUFJLENBQUNMLGVBQWUsSUFBS0EsZUFBZSxJQUFJLE9BQU8sRUFBRTtNQUN0RixPQUFPSyxTQUFTO0lBQ2pCO0lBQ0EsUUFBUSxJQUFJO01BQ1gsS0FBSyxPQUFPTCxlQUFlLEtBQUssUUFBUTtRQUN2QztRQUNBLElBQUlBLGVBQWUsQ0FBQ2hDLElBQUksRUFBRTtVQUN6QitCLGdCQUFnQixDQUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUM5QjtRQUNBLElBQUlzQixlQUFlLENBQUNNLElBQUksRUFBRTtVQUN6QlAsZ0JBQWdCLENBQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDO1FBQzlCO1FBQ0EsSUFBSXNCLGVBQWUsQ0FBQ08sSUFBSSxFQUFFO1VBQ3pCUixnQkFBZ0IsQ0FBQ3JCLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDOUI7UUFDQSxJQUFJc0IsZUFBZSxDQUFDUSxNQUFNLEVBQUU7VUFDM0JULGdCQUFnQixDQUFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUNoQztRQUNBLE9BQU9xQixnQkFBZ0IsQ0FBQ1UsSUFBSSxDQUFDLEdBQUcsQ0FBQztNQUNsQyxLQUFLUCxnQkFBZ0I7TUFDckIsS0FBSyxDQUFDLENBQUNGLGVBQWU7UUFDckI7UUFDQTtRQUNBLE9BQU8sdUJBQXVCO01BQy9CO1FBQ0M7UUFDQSxPQUFPLGdCQUFnQjtJQUFDO0VBRTNCO0VBQUM7RUFrQkQ7RUFDQSxTQUFTVSxXQUFXLENBQUNDLGlCQUFvRCxFQUFFO0lBQUE7SUFDMUUsT0FBTyxDQUFBQSxpQkFBaUIsYUFBakJBLGlCQUFpQixnREFBakJBLGlCQUFpQixDQUFFeEMsY0FBYywwREFBakMsc0JBQW1DeUMsT0FBTyxDQUFFLElBQUMseURBQWlELEVBQUMsQ0FBQyxNQUFLLENBQUMsQ0FBQyxHQUMzR0QsaUJBQWlCLGFBQWpCQSxpQkFBaUIsdUJBQWpCQSxpQkFBaUIsQ0FBRXhDLGNBQWMsR0FDakNrQyxTQUFTO0VBQ2I7RUFDQSxTQUFTUSwrQkFBK0IsQ0FBQ0MsT0FBNEMsRUFBRTtJQUN0RixJQUFJQyxHQUFHO0lBQ1AsSUFBS0QsT0FBTyxhQUFQQSxPQUFPLGVBQVBBLE9BQU8sQ0FBK0JFLFFBQVEsRUFBRTtNQUFBO01BQ3BERCxHQUFHLEdBQUc7UUFDTEMsUUFBUSxFQUFFO1VBQ1RDLGFBQWEsRUFBR0gsT0FBTyxhQUFQQSxPQUFPLG9DQUFQQSxPQUFPLENBQStCRSxRQUFRLDhDQUEvQyxVQUFpREU7UUFDakU7TUFDRCxDQUFDO0lBQ0YsQ0FBQyxNQUFNO01BQ05ILEdBQUcsR0FBRztRQUNMQyxRQUFRLEVBQUU7VUFDVEMsYUFBYSxFQUFHSCxPQUFPLGFBQVBBLE9BQU8sdUJBQVBBLE9BQU8sQ0FBZUs7UUFDdkM7TUFDRCxDQUFDO0lBQ0Y7SUFDQSxPQUFPSixHQUFHO0VBQ1g7RUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0ssd0JBQXdCLENBQ3ZDdEUsZUFBc0IsRUFDdEJDLGlCQUF5QixFQUN6QkMsZ0JBQWtDLEVBQ2xDcUUsd0JBQWtDLEVBQ2xDVixpQkFBeUMsRUFDekNXLGlCQUEyQixFQUNOO0lBQUE7SUFDckIsTUFBTUMsaUJBQWlCLEdBQUcsSUFBSUMsaUJBQWlCLENBQUN4RSxnQkFBZ0IsQ0FBQ3lFLGFBQWEsRUFBRSxFQUFFekUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUMzRyxJQUFJLENBQUNxRSx3QkFBd0IsSUFBSSxDQUFDRSxpQkFBaUIsQ0FBQ0csb0JBQW9CLEVBQUUsRUFBRTtNQUMzRSxNQUFNLElBQUlDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQztJQUNsRTtJQUNBLE1BQU1DLGtCQUFrQixHQUFHTCxpQkFBaUIsQ0FBQ00sb0JBQW9CLEVBQUU7SUFDbkUsTUFBTUMsaUJBQWlCLEdBQUdQLGlCQUFpQixDQUFDUSw2QkFBNkIsRUFBRTtJQUMzRSxNQUFNQyxvQkFBcUMsR0FBR2hGLGdCQUFnQixDQUFDMkMsa0JBQWtCLEVBQUU7SUFDbkYsTUFBTUUsaUJBQXdDLEdBQUdtQyxvQkFBb0IsQ0FBQ2xDLG9CQUFvQixFQUFFO0lBQzVGLE1BQU1tQyxRQUE0QixHQUFHeEMsV0FBVyxDQUFDMUMsaUJBQWlCLEVBQUVDLGdCQUFnQixDQUFDO0lBQ3JGLElBQUlpRixRQUFRLEtBQUs1QixTQUFTLElBQUlSLGlCQUFpQixLQUFLLFNBQVMsRUFBRTtNQUM5RHFDLEdBQUcsQ0FBQ0MsT0FBTyxDQUFDLHVFQUF1RSxDQUFDO0lBQ3JGO0lBQ0EsTUFBTUMsaUJBQWlCLEdBQUcsQ0FBQyxDQUFRO0lBQ25DO0lBQ0EsTUFBTUMsaUNBQXFELEdBQUczQixXQUFXLENBQUNDLGlCQUFpQixDQUFDO0lBQzVGLElBQUltQixpQkFBaUIsRUFBRTtNQUN0QixNQUFNUSxVQUFVLEdBQUdmLGlCQUFpQixDQUFDRSxhQUFhLEVBQUU7TUFDcEQsS0FBSyxNQUFNYyxlQUFlLElBQUlULGlCQUFpQixFQUFFO1FBQUE7UUFDaEQsTUFBTVUsMEJBQTBCLEdBQUdELGVBQWUsYUFBZkEsZUFBZSxnREFBZkEsZUFBZSxDQUFFRSxXQUFXLG9GQUE1QixzQkFBOEJDLFdBQVcsMkRBQXpDLHVCQUEyQ0MseUJBQXlCO1FBQ3ZHLE1BQU1DLFNBQVMsR0FBR0wsZUFBZSxhQUFmQSxlQUFlLHVCQUFmQSxlQUFlLENBQUVLLFNBQVM7UUFDNUMsTUFBTUMsOEJBQThCLEdBQUdELFNBQVMsSUFBSU4sVUFBVSxDQUFDUSxnQkFBZ0IsQ0FBQ0MsSUFBSSxDQUFFQyxRQUFRLElBQUtBLFFBQVEsQ0FBQzdCLElBQUksS0FBS3lCLFNBQVMsQ0FBQztRQUMvSCxNQUFNSyxLQUFLLEdBQUdKLDhCQUE4QixLQUFJQSw4QkFBOEIsYUFBOUJBLDhCQUE4QixnREFBOUJBLDhCQUE4QixDQUFFSixXQUFXLG9GQUEzQyxzQkFBNkNTLE1BQU0scUZBQW5ELHVCQUFxREMsS0FBSywyREFBMUQsdUJBQTREQyxRQUFRLEVBQUU7UUFDdEhoQixpQkFBaUIsQ0FBQ1EsU0FBUyxDQUFDLEdBQUc7VUFDOUJ6QixJQUFJLEVBQUV5QixTQUFTO1VBQ2ZLLEtBQUssRUFBRUEsS0FBSyxJQUFLLHFCQUFvQkwsU0FBVSxHQUFFO1VBQ2pEUyxRQUFRLEVBQUUsSUFBSTtVQUNkQyxTQUFTLEVBQUUsTUFBTTtVQUNqQkMsdUJBQXVCLEVBQUVmLDBCQUEwQixHQUNoREEsMEJBQTBCLENBQUNnQixHQUFHLENBQUVDLGVBQWUsSUFBSztZQUNwRCxPQUFPQSxlQUFlLENBQUN2QyxLQUFLO1VBQzVCLENBQUMsQ0FBQyxHQUNGO1FBQ0osQ0FBQztNQUNGO0lBQ0Q7SUFFQSxNQUFNd0Msa0JBQTRDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZELE1BQU1DLG1CQUFtQixHQUFHQyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQztJQUN4RSxJQUFJakMsa0JBQWtCLEVBQUU7TUFDdkIsS0FBSyxJQUFJa0MsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHbEMsa0JBQWtCLENBQUNtQyxNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO1FBQUE7UUFDbkRKLGtCQUFrQixDQUFDOUIsa0JBQWtCLENBQUNrQyxDQUFDLENBQUMsQ0FBQ0UsSUFBSSxDQUFDLEdBQUc7VUFDaEQ3QyxJQUFJLEVBQUVTLGtCQUFrQixDQUFDa0MsQ0FBQyxDQUFDLENBQUNFLElBQUk7VUFDaENDLFlBQVksRUFBRXJDLGtCQUFrQixDQUFDa0MsQ0FBQyxDQUFDLENBQUNJLG9CQUFvQixDQUFDQyxPQUFPLEVBQUUsQ0FBQ2pELEtBQUs7VUFDeEVrRCxpQkFBaUIsRUFBRXhDLGtCQUFrQixDQUFDa0MsQ0FBQyxDQUFDLENBQUNPLGlCQUFpQjtVQUMxRHBCLEtBQUssRUFBRSx5QkFBQXJCLGtCQUFrQixDQUFDa0MsQ0FBQyxDQUFDLDRFQUFyQixzQkFBdUJyQixXQUFXLDZFQUFsQyx1QkFBb0NTLE1BQU0sbURBQTFDLHVCQUE0Q0MsS0FBSyw2QkFDckR2QixrQkFBa0IsQ0FBQ2tDLENBQUMsQ0FBQyxxRkFBckIsdUJBQXVCckIsV0FBVyxxRkFBbEMsdUJBQW9DUyxNQUFNLDJEQUExQyx1QkFBNENDLEtBQUssQ0FBQ0MsUUFBUSxFQUFFLEdBQzNELEdBQUVPLG1CQUFtQixDQUFDVyxPQUFPLENBQUMsdUJBQXVCLENBQUUsS0FBSTFDLGtCQUFrQixDQUFDa0MsQ0FBQyxDQUFDLENBQUNFLElBQUssR0FBRTtVQUM1RlgsUUFBUSxFQUFFLElBQUk7VUFDZEMsU0FBUyxFQUFFLE1BQU07VUFDakJpQixNQUFNLEVBQUU7UUFDVCxDQUFDO01BQ0Y7SUFDRDtJQUVBLE1BQU1DLFNBQVMsR0FBR2pELGlCQUFpQixDQUFDa0QseUJBQXlCLEVBQUU7SUFDL0QsTUFBTUMsU0FBUyxHQUFHbkQsaUJBQWlCLENBQUNvRCxzQkFBc0IsRUFBRTtJQUM1RCxNQUFNQyxlQUFlLEdBQUcsQ0FBQyxDQUF3QjtJQUNqREEsZUFBZSxDQUFDL0csS0FBSyxnREFBZ0Q7SUFDckUrRyxlQUFlLENBQUNDLHNCQUFzQixHQUFHLEVBQUU7SUFDM0NELGVBQWUsQ0FBQ0UsbUJBQW1CLEdBQUcsRUFBRTtJQUV4QyxJQUFJTixTQUFTLEVBQUU7TUFDZEksZUFBZSxDQUFDQyxzQkFBc0IsR0FBR0wsU0FBUyxDQUFDaEIsR0FBRyxDQUFFdUIsSUFBSSxJQUFLbEUsK0JBQStCLENBQUNrRSxJQUFJLENBQUMsQ0FBQztJQUN4RztJQUVBLElBQUlMLFNBQVMsRUFBRTtNQUNkRSxlQUFlLENBQUNFLG1CQUFtQixHQUFHSixTQUFTLENBQUNsQixHQUFHLENBQUV1QixJQUFJLEtBQU07UUFBRSxDQUFDLGVBQWUsR0FBR0EsSUFBSSxDQUFDN0Q7TUFBTSxDQUFDLENBQUMsQ0FBQztJQUNuRztJQUVBLE1BQU1qRSxZQUFZLEdBQUcwQixlQUFlLENBQUM3QixlQUFlLEVBQUVDLGlCQUFpQixFQUFFQyxnQkFBZ0IsQ0FBQztJQUMxRixJQUFJLENBQUNnSSxzQkFBc0IsQ0FBQyxxQkFBcUIsR0FBR2pJLGlCQUFpQixDQUFDa0ksS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUNoRixJQUFJRCxzQkFBc0IsQ0FBQ0UsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLRixzQkFBc0IsQ0FBQ2pCLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDbEY7TUFDQWlCLHNCQUFzQixHQUFHQSxzQkFBc0IsQ0FBQ0csTUFBTSxDQUFDLENBQUMsRUFBRUgsc0JBQXNCLENBQUNqQixNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBQzdGO0lBQ0EsTUFBTXFCLEtBQUssR0FBRywwQkFBQXRJLGVBQWUsQ0FBQ3VJLEtBQUssMERBQXJCLHNCQUF1QmpDLFFBQVEsRUFBRSxLQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZELE1BQU1rQyxhQUFhLEdBQUd0SSxnQkFBZ0IsQ0FBQ3VJLHNCQUFzQixFQUFFO0lBQy9ELE1BQU1DLFdBQW9CLEdBQUdSLHNCQUFzQixDQUFDakIsTUFBTSxLQUFLLENBQUM7SUFDaEUsTUFBTTBCLFVBQWtCLEdBQUdILGFBQWEsQ0FBQ0ksZUFBZSxHQUFHSixhQUFhLENBQUNJLGVBQWUsQ0FBQ3ZFLElBQUksR0FBR21FLGFBQWEsQ0FBQ0ssaUJBQWlCLENBQUN4RSxJQUFJO0lBQ3BJLE1BQU15RSxZQUFZLEdBQUdKLFdBQVcsR0FBR0ssY0FBYyxDQUFDN0ksZ0JBQWdCLENBQUM4SSxjQUFjLEVBQUUsQ0FBQyxHQUFHekYsU0FBUztJQUNoRyxNQUFNMEYsY0FBYyxHQUFHO01BQ3RCQyxXQUFXLEVBQUU7UUFDWkMsTUFBTSxFQUFFO1VBQ1BDLFFBQVEsRUFBRTtRQUNYO01BQ0Q7SUFDRCxDQUFDO0lBQ0QsSUFBSUMsY0FBbUM7SUFDdkMsSUFBSW5KLGdCQUFnQixDQUFDb0osZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQ0MsVUFBVSxFQUFFO01BQ25FSCxjQUFjLEdBQUcsSUFBSTtJQUN0QixDQUFDLE1BQU0sSUFDTm5KLGdCQUFnQixDQUFDb0osZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQ0UsVUFBVSxJQUM5RHZKLGdCQUFnQixDQUFDb0osZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQ0csa0JBQWtCLEVBQ3JFO01BQ0RMLGNBQWMsR0FBRyxLQUFLO0lBQ3ZCO0lBQ0EsTUFBTU0seUJBQXlCLEdBQzlCekosZ0JBQWdCLENBQUMyQyxrQkFBa0IsRUFBRSxDQUFDOEcseUJBQXlCLEVBQUUsSUFDakV6SixnQkFBZ0IsQ0FBQ29KLGVBQWUsRUFBRSxLQUFLQyxZQUFZLENBQUNHLGtCQUFrQjtJQUN2RSxNQUFNRSx3QkFBd0IsR0FBR0QseUJBQXlCLEdBQUcsb0NBQW9DLEdBQUcsRUFBRTtJQUN0RyxNQUFNbkksT0FBTyxHQUFHbUkseUJBQXlCLEdBQUcsZ0RBQWdELEdBQUcsTUFBTTtJQUNyRyxNQUFNRSxzQkFBc0IsR0FBR3BGLGlCQUFpQixDQUFDcUYseUJBQXlCLEVBQUU7SUFDNUVoQyxlQUFlLENBQUNpQyxZQUFZLEdBQUdGLHNCQUFzQixHQUFHQSxzQkFBc0IsQ0FBQy9GLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSTtJQUM1RyxJQUFJZ0MsU0FBUyxHQUFHLEVBQUU7SUFDbEIsSUFBSTlGLGVBQWUsQ0FBQ3VCLGtCQUFrQixDQUFDNEcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDbEIsTUFBTSxHQUFHLENBQUMsRUFBRTtNQUM3RG5CLFNBQVMsR0FBRzlGLGVBQWUsQ0FBQ3VCLGtCQUFrQixDQUFDNEcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM3RDtJQUNBLE9BQU87TUFDTmpILElBQUksRUFBRThJLGlCQUFpQixDQUFDQyxLQUFLO01BQzdCQyxFQUFFLEVBQUVwRSxTQUFTLEdBQ1ZxRSxVQUFVLENBQUN6QixXQUFXLEdBQUdDLFVBQVUsR0FBR1Qsc0JBQXNCLEVBQUVwQyxTQUFTLEVBQUVrRSxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLEdBQ2pHRSxVQUFVLENBQUN6QixXQUFXLEdBQUdDLFVBQVUsR0FBR1Qsc0JBQXNCLEVBQUU4QixpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDO01BQ3pGRyxVQUFVLEVBQUVDLG1CQUFtQixDQUFDbkssZ0JBQWdCLENBQUN1SSxzQkFBc0IsRUFBRSxDQUFDO01BQzFFRSxVQUFVLEVBQUVBLFVBQVU7TUFDdEJ6RixlQUFlLEVBQUVQLFdBQVcsQ0FBQzFDLGlCQUFpQixFQUFFQyxnQkFBZ0IsQ0FBQztNQUNqRW9LLGNBQWMsRUFBRXBDLHNCQUFzQjtNQUN0QzdHLGNBQWMsRUFBRW5CLGdCQUFnQixDQUFDcUsseUJBQXlCLENBQUN0SyxpQkFBaUIsQ0FBQztNQUM3RXVLLFFBQVEsRUFBRTFCLFlBQVk7TUFDdEIyQixhQUFhLEVBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFDMUIsY0FBYyxDQUFDO01BQzdDL0csT0FBTyxFQUFFL0IsWUFBWSxDQUFDK0IsT0FBTztNQUM3QlEsY0FBYyxFQUFFdkMsWUFBWSxDQUFDdUMsY0FBYztNQUMzQzRGLEtBQUssRUFBRUEsS0FBSztNQUNaZSxjQUFjLEVBQUVBLGNBQWM7TUFDOUJPLHdCQUF3QixFQUFFQSx3QkFBd0I7TUFDbERwSSxPQUFPLEVBQUVBLE9BQU87TUFDaEJvSixTQUFTLEVBQUV0RixpQkFBaUI7TUFDNUJ1RixRQUFRLEVBQUVqRSxrQkFBa0I7TUFDNUJrRSxjQUFjLEVBQUVoRCxlQUFlO01BQy9CaUQsZ0NBQWdDLEVBQUV4RixpQ0FBaUM7TUFDbkV4QyxpQkFBaUIsRUFBRWlJLHFCQUFxQixDQUFDN0YsUUFBUSxFQUFFcEMsaUJBQWlCLENBQUM7TUFDckV5QixpQkFBaUIsRUFBRSxDQUFDQSxpQkFBaUIsSUFBSSxLQUFLLEtBQUt5RyxxQkFBcUIsQ0FBQyxZQUFZLEVBQUUvSyxnQkFBZ0IsRUFBRUQsaUJBQWlCO0lBQzNILENBQUM7RUFDRjtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkE7RUFPQSxTQUFTK0sscUJBQXFCLENBQUM3RixRQUE0QixFQUFFcEMsaUJBQXdDLEVBQUU7SUFDdEcsT0FBT0EsaUJBQWlCLEtBQUssU0FBUyxJQUFJLENBQUNvQyxRQUFRLEdBQUc5QixxQkFBcUIsQ0FBQzZILElBQUksR0FBR25JLGlCQUFpQjtFQUNyRzs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVN0Qiw2QkFBNkIsQ0FBQ2xCLFNBQWlDLEVBQUVMLGdCQUFrQyxFQUFFO0lBQUE7SUFDN0csT0FBT2lMLGlCQUFpQixDQUN2QkMsR0FBRyxDQUNGQyxLQUFLLENBQ0pDLDJCQUEyQiwwQkFDMUIvSyxTQUFTLENBQUNvRixXQUFXLG9GQUFyQixzQkFBdUI0RixFQUFFLDJEQUF6Qix1QkFBMkJDLE1BQU0sRUFDakMsRUFBRSxFQUNGakksU0FBUyxFQUNUckQsZ0JBQWdCLENBQUN1TCw0QkFBNEIsRUFBRSxDQUMvQyxFQUNELElBQUksQ0FDSixDQUNELENBQ0Q7RUFDRjtFQUVPLFNBQVNDLDZCQUE2QixDQUFDeEwsZ0JBQWtDLEVBQXNCO0lBQ3JHLE1BQU15Six5QkFBeUIsR0FDOUJ6SixnQkFBZ0IsQ0FBQzJDLGtCQUFrQixFQUFFLENBQUM4Ryx5QkFBeUIsRUFBRSxJQUNqRXpKLGdCQUFnQixDQUFDb0osZUFBZSxFQUFFLEtBQUtDLFlBQVksQ0FBQ0csa0JBQWtCO0lBQ3ZFLE1BQU1sQixhQUFhLEdBQUd0SSxnQkFBZ0IsQ0FBQ3VJLHNCQUFzQixFQUFFO0lBQy9ELE1BQU1FLFVBQVUsR0FBR0gsYUFBYSxDQUFDSSxlQUFlLEdBQUdKLGFBQWEsQ0FBQ0ksZUFBZSxDQUFDdkUsSUFBSSxHQUFHbUUsYUFBYSxDQUFDSyxpQkFBaUIsQ0FBQ3hFLElBQUk7SUFFNUgsTUFBTXNILGFBQWlDLEdBQUc7TUFDekN6SyxJQUFJLEVBQUU4SSxpQkFBaUIsQ0FBQ0MsS0FBSztNQUM3QkMsRUFBRSxFQUFFQyxVQUFVLENBQUN4QixVQUFVLEVBQUVxQixpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDO01BQ25EdEIsVUFBVSxFQUFFQSxVQUFVO01BQ3RCTCxLQUFLLEVBQUUsRUFBRTtNQUNUOEIsVUFBVSxFQUFFLEVBQUU7TUFDZGxILGVBQWUsRUFBRUssU0FBUztNQUMxQitHLGNBQWMsRUFBRSxFQUFFO01BQ2xCakosY0FBYyxFQUFFLEVBQUU7TUFDbEJvSixhQUFhLEVBQUVDLElBQUksQ0FBQ0MsU0FBUyxDQUFDO1FBQzdCekIsV0FBVyxFQUFFO1VBQ1pDLE1BQU0sRUFBRTtZQUNQQyxRQUFRLEVBQUU7VUFDWDtRQUNEO01BQ0QsQ0FBQyxDQUFDO01BQ0ZsSCxPQUFPLEVBQUUsRUFBRTtNQUNYUSxjQUFjLEVBQUUsQ0FBQyxDQUFDO01BQ2xCMkcsY0FBYyxFQUFFLEtBQUs7TUFDckJPLHdCQUF3QixFQUFFLEVBQUU7TUFDNUJwSSxPQUFPLEVBQUVtSSx5QkFBeUIsR0FBRyxnREFBZ0QsR0FBRyxNQUFNO01BQzlGaUIsU0FBUyxFQUFFLENBQUMsQ0FBQztNQUNiQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO01BQ1pDLGNBQWMsRUFBRTtRQUNmL0osS0FBSyxFQUFFLDZDQUE2QztRQUNwRGdILHNCQUFzQixFQUFFLEVBQUU7UUFDMUJDLG1CQUFtQixFQUFFLEVBQUU7UUFDdkIrQixZQUFZLEVBQUU7TUFDZixDQUFDO01BQ0Q2QixVQUFVLEVBQUUsS0FBSztNQUNqQjdJLGlCQUFpQixFQUFFTSxxQkFBcUIsQ0FBQzZIO0lBQzFDLENBQUM7SUFFRCxPQUFPUyxhQUFhO0VBQ3JCO0VBQUM7RUFBQTtBQUFBIn0=
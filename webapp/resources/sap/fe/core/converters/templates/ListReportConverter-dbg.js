/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/helpers/BindingToolkit", "../controls/Common/DataVisualization", "../controls/Common/KPI", "../helpers/ID", "../ManifestSettings"], function (Action, FilterBar, ConfigurableObject, BindingToolkit, DataVisualization, KPI, ID, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var getTableID = ID.getTableID;
  var getIconTabBarID = ID.getIconTabBarID;
  var getFilterVariantManagementID = ID.getFilterVariantManagementID;
  var getFilterBarID = ID.getFilterBarID;
  var getDynamicListReportID = ID.getDynamicListReportID;
  var getCustomTabID = ID.getCustomTabID;
  var getChartID = ID.getChartID;
  var getKPIDefinitions = KPI.getKPIDefinitions;
  var isSelectionPresentationCompliant = DataVisualization.isSelectionPresentationCompliant;
  var isPresentationCompliant = DataVisualization.isPresentationCompliant;
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var getSelectionPresentationVariant = DataVisualization.getSelectionPresentationVariant;
  var getDefaultPresentationVariant = DataVisualization.getDefaultPresentationVariant;
  var getDefaultLineItem = DataVisualization.getDefaultLineItem;
  var getDefaultChart = DataVisualization.getDefaultChart;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getSelectionFields = FilterBar.getSelectionFields;
  var getManifestFilterFields = FilterBar.getManifestFilterFields;
  var getFilterBarHideBasicSearch = FilterBar.getFilterBarHideBasicSearch;
  var getActionsFromManifest = Action.getActionsFromManifest;
  /**
   * Retrieves all list report tables.
   *
   * @param views The list report views configured in the manifest
   * @returns The list report table
   */
  function getTableVisualizations(views) {
    const tables = [];
    views.forEach(function (view) {
      if (!view.type) {
        const visualizations = view.secondaryVisualization ? view.secondaryVisualization.visualizations : view.presentation.visualizations;
        visualizations.forEach(function (visualization) {
          if (visualization.type === VisualizationType.Table) {
            tables.push(visualization);
          }
        });
      }
    });
    return tables;
  }
  function getChartVisualizations(views) {
    const charts = [];
    views.forEach(function (view) {
      if (!view.type) {
        const visualizations = view.primaryVisualization ? view.primaryVisualization.visualizations : view.presentation.visualizations;
        visualizations.forEach(function (visualization) {
          if (visualization.type === VisualizationType.Chart) {
            charts.push(visualization);
          }
        });
      }
    });
    return charts;
  }
  const getDefaultSemanticDates = function (filterFields) {
    const defaultSemanticDates = {};
    for (const filterField in filterFields) {
      var _filterFields$filterF, _filterFields$filterF2, _filterFields$filterF3;
      if ((_filterFields$filterF = filterFields[filterField]) !== null && _filterFields$filterF !== void 0 && (_filterFields$filterF2 = _filterFields$filterF.settings) !== null && _filterFields$filterF2 !== void 0 && (_filterFields$filterF3 = _filterFields$filterF2.defaultValues) !== null && _filterFields$filterF3 !== void 0 && _filterFields$filterF3.length) {
        var _filterFields$filterF4, _filterFields$filterF5;
        defaultSemanticDates[filterField] = (_filterFields$filterF4 = filterFields[filterField]) === null || _filterFields$filterF4 === void 0 ? void 0 : (_filterFields$filterF5 = _filterFields$filterF4.settings) === null || _filterFields$filterF5 === void 0 ? void 0 : _filterFields$filterF5.defaultValues;
      }
    }
    return defaultSemanticDates;
  };
  /**
   * Find a visualization annotation that can be used for rendering the list report.
   *
   * @param entityType The current EntityType
   * @param converterContext
   * @param isALP
   * @returns A compliant annotation for rendering the list report
   */
  function getCompliantVisualizationAnnotation(entityType, converterContext, isALP) {
    const annotationPath = converterContext.getManifestWrapper().getDefaultTemplateAnnotationPath();
    const selectionPresentationVariant = getSelectionPresentationVariant(entityType, annotationPath, converterContext);
    const errorMessageForALP = "ALP flavor needs both chart and table to load the application";
    if (selectionPresentationVariant) {
      if (annotationPath) {
        const presentationVariant = selectionPresentationVariant.PresentationVariant;
        if (!presentationVariant) {
          throw new Error("Presentation Variant is not configured in the SPV mentioned in the manifest");
        }
        if (!isPresentationCompliant(presentationVariant, isALP)) {
          if (isALP) {
            throw new Error(errorMessageForALP);
          }
          return undefined;
        }
      }
      if (isSelectionPresentationCompliant(selectionPresentationVariant, isALP) === true) {
        return selectionPresentationVariant;
      } else if (isALP) {
        throw new Error(errorMessageForALP);
      }
    }
    const presentationVariant = getDefaultPresentationVariant(entityType);
    if (presentationVariant) {
      if (isPresentationCompliant(presentationVariant, isALP)) {
        return presentationVariant;
      } else if (isALP) {
        throw new Error(errorMessageForALP);
      }
    }
    if (!isALP) {
      return getDefaultLineItem(entityType);
    }
    return undefined;
  }
  const getView = function (viewConverterConfiguration, isInsightsEnabled) {
    let config = viewConverterConfiguration;
    if (config.converterContext) {
      var _presentation, _presentation$visuali;
      let converterContext = config.converterContext;
      config = config;
      const isMultipleViewConfiguration = function (currentConfig) {
        return currentConfig.key !== undefined;
      };
      let presentation = getDataVisualizationConfiguration(config.annotation ? converterContext.getRelativeAnnotationPath(config.annotation.fullyQualifiedName, converterContext.getEntityType()) : "", true, converterContext, config, undefined, undefined, isMultipleViewConfiguration(config), isInsightsEnabled);
      let tableControlId = "";
      let chartControlId = "";
      let title = "";
      let selectionVariantPath = "";
      const createVisualization = function (currentPresentation, isPrimary) {
        let defaultVisualization;
        for (const visualization of currentPresentation.visualizations) {
          if (isPrimary && visualization.type === VisualizationType.Chart) {
            defaultVisualization = visualization;
            break;
          }
          if (!isPrimary && visualization.type === VisualizationType.Table) {
            defaultVisualization = visualization;
            break;
          }
        }
        const presentationCreated = Object.assign({}, currentPresentation);
        if (defaultVisualization) {
          presentationCreated.visualizations = [defaultVisualization];
        } else {
          throw new Error((isPrimary ? "Primary" : "Secondary") + " visualisation needs valid " + (isPrimary ? "chart" : "table"));
        }
        return presentationCreated;
      };
      const getPresentation = function (item, isPrimary) {
        const resolvedTarget = converterContext.getEntityTypeAnnotation(item.annotationPath);
        const targetAnnotation = resolvedTarget.annotation;
        converterContext = resolvedTarget.converterContext;
        const annotation = targetAnnotation;
        if (annotation || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
          presentation = getDataVisualizationConfiguration(annotation ? converterContext.getRelativeAnnotationPath(annotation.fullyQualifiedName, converterContext.getEntityType()) : "", true, converterContext, config, undefined, undefined, undefined, isInsightsEnabled);
          return presentation;
        } else {
          const sError = "Annotation Path for the " + (isPrimary ? "primary" : "secondary") + " visualisation mentioned in the manifest is not found";
          throw new Error(sError);
        }
      };
      const createAlpView = function (presentations, defaultPath) {
        var _primaryVisualization, _secondaryVisualizati, _secondaryVisualizati2;
        const primaryVisualization = createVisualization(presentations[0], true);
        chartControlId = primaryVisualization === null || primaryVisualization === void 0 ? void 0 : (_primaryVisualization = primaryVisualization.visualizations[0]) === null || _primaryVisualization === void 0 ? void 0 : _primaryVisualization.id;
        const secondaryVisualization = createVisualization(presentations[1] ? presentations[1] : presentations[0], false);
        tableControlId = secondaryVisualization === null || secondaryVisualization === void 0 ? void 0 : (_secondaryVisualizati = secondaryVisualization.visualizations[0]) === null || _secondaryVisualizati === void 0 ? void 0 : (_secondaryVisualizati2 = _secondaryVisualizati.annotation) === null || _secondaryVisualizati2 === void 0 ? void 0 : _secondaryVisualizati2.id;
        if (primaryVisualization && secondaryVisualization) {
          config = config;
          const visible = config.visible;
          const view = {
            primaryVisualization,
            secondaryVisualization,
            tableControlId,
            chartControlId,
            defaultPath,
            visible
          };
          return view;
        }
      };
      if (!converterContext.getManifestWrapper().hasMultipleVisualizations(config) && ((_presentation = presentation) === null || _presentation === void 0 ? void 0 : (_presentation$visuali = _presentation.visualizations) === null || _presentation$visuali === void 0 ? void 0 : _presentation$visuali.length) === 2 && converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        const view = createAlpView([presentation], "both");
        if (view) {
          return view;
        }
      } else if (converterContext.getManifestWrapper().hasMultipleVisualizations(config) || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        const {
          primary,
          secondary
        } = config;
        if (primary && primary.length && secondary && secondary.length) {
          const view = createAlpView([getPresentation(primary[0], true), getPresentation(secondary[0], false)], config.defaultPath);
          if (view) {
            return view;
          }
        } else {
          throw new Error("SecondaryItems in the Views is not present");
        }
      } else if (isMultipleViewConfiguration(config)) {
        // key exists only on multi tables mode
        const resolvedTarget = converterContext.getEntityTypeAnnotation(config.annotationPath);
        const viewAnnotation = resolvedTarget.annotation;
        converterContext = resolvedTarget.converterContext;
        title = compileExpression(getExpressionFromAnnotation(viewAnnotation.Text));
        // Need to loop on table into views since multi table mode get specific configuration (hidden filters or Table Id)
        presentation.visualizations.forEach((visualizationDefinition, index) => {
          var _config$annotation;
          switch (visualizationDefinition.type) {
            case VisualizationType.Table:
              const tableVisualization = presentation.visualizations[index];
              const filters = tableVisualization.control.filters || {};
              filters.hiddenFilters = filters.hiddenFilters || {
                paths: []
              };
              if (!config.keepPreviousPersonalization) {
                // Need to override Table Id to match with Tab Key (currently only table is managed in multiple view mode)
                tableVisualization.annotation.id = getTableID(config.key || "", "LineItem");
              }
              config = config;
              if (((_config$annotation = config.annotation) === null || _config$annotation === void 0 ? void 0 : _config$annotation.term) === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
                var _config$annotation$Se;
                if (!config.annotation.SelectionVariant) {
                  throw new Error(`The Selection Variant is missing for the Selection Presentation Variant ${config.annotation.fullyQualifiedName}`);
                }
                selectionVariantPath = `@${(_config$annotation$Se = config.annotation.SelectionVariant) === null || _config$annotation$Se === void 0 ? void 0 : _config$annotation$Se.fullyQualifiedName.split("@")[1]}`;
              } else {
                selectionVariantPath = config.annotationPath;
              }
              //Provide Selection Variant to hiddenFilters in order to set the SV filters to the table.
              //MDC Table overrides binding Filter and from SAP FE the only method where we are able to add
              //additional filter is 'rebindTable' into Table delegate.
              //To avoid implementing specific LR feature to SAP FE Macro Table, the filter(s) related to the Tab (multi table mode)
              //can be passed to macro table via parameter/context named filters and key hiddenFilters.
              filters.hiddenFilters.paths.push({
                annotationPath: selectionVariantPath
              });
              tableVisualization.control.filters = filters;
              break;
            case VisualizationType.Chart:
              const chartVisualization = presentation.visualizations[index];
              chartVisualization.id = getChartID(config.key || "", "Chart");
              chartVisualization.multiViews = true;
              break;
            default:
              break;
          }
        });
      }
      presentation.visualizations.forEach(visualizationDefinition => {
        if (visualizationDefinition.type === VisualizationType.Table) {
          tableControlId = visualizationDefinition.annotation.id;
        } else if (visualizationDefinition.type === VisualizationType.Chart) {
          chartControlId = visualizationDefinition.id;
        }
      });
      config = config;
      const visible = config.visible;
      return {
        presentation,
        tableControlId,
        chartControlId,
        title,
        selectionVariantPath,
        visible
      };
    } else {
      config = config;
      const title = config.label,
        fragment = config.template,
        type = config.type,
        customTabId = getCustomTabID(config.key || ""),
        visible = config.visible;
      return {
        title,
        fragment,
        type,
        customTabId,
        visible
      };
    }
  };
  const getViews = function (converterContext, settingsViews, isInsightsEnabled) {
    let viewConverterConfigs = [];
    if (settingsViews) {
      settingsViews.paths.forEach(path => {
        if (converterContext.getManifestWrapper().hasMultipleVisualizations(path)) {
          if (settingsViews.paths.length > 1) {
            throw new Error("ALP flavor cannot have multiple views");
          } else {
            path = path;
            viewConverterConfigs.push({
              converterContext: converterContext,
              primary: path.primary,
              secondary: path.secondary,
              defaultPath: path.defaultPath
            });
          }
        } else if (path.template) {
          path = path;
          viewConverterConfigs.push({
            key: path.key,
            label: path.label,
            template: path.template,
            type: "Custom",
            visible: path.visible
          });
        } else {
          path = path;
          const viewConverterContext = converterContext.getConverterContextFor(path.contextPath || path.entitySet && `/${path.entitySet}` || converterContext.getContextPath()),
            entityType = viewConverterContext.getEntityType();
          if (entityType && viewConverterContext) {
            let annotation;
            const resolvedTarget = viewConverterContext.getEntityTypeAnnotation(path.annotationPath);
            const targetAnnotation = resolvedTarget.annotation;
            if (targetAnnotation) {
              annotation = targetAnnotation.term === "com.sap.vocabularies.UI.v1.SelectionVariant" ? getCompliantVisualizationAnnotation(entityType, viewConverterContext, false) : targetAnnotation;
              viewConverterConfigs.push({
                converterContext: viewConverterContext,
                annotation,
                annotationPath: path.annotationPath,
                keepPreviousPersonalization: path.keepPreviousPersonalization,
                key: path.key,
                visible: path.visible
              });
            }
          } else {
            // TODO Diagnostics message
          }
        }
      });
    } else {
      const entityType = converterContext.getEntityType();
      if (converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        viewConverterConfigs = getAlpViewConfig(converterContext, viewConverterConfigs);
      } else {
        viewConverterConfigs.push({
          annotation: getCompliantVisualizationAnnotation(entityType, converterContext, false),
          converterContext: converterContext
        });
      }
    }
    return viewConverterConfigs.map(viewConverterConfig => {
      return getView(viewConverterConfig, isInsightsEnabled);
    });
  };
  const getMultiViewsControl = function (converterContext, views) {
    const manifestWrapper = converterContext.getManifestWrapper();
    const viewsDefinition = manifestWrapper.getViewConfiguration();
    if (views.length > 1 && !hasMultiVisualizations(converterContext)) {
      return {
        showTabCounts: viewsDefinition ? (viewsDefinition === null || viewsDefinition === void 0 ? void 0 : viewsDefinition.showCounts) || manifestWrapper.hasMultipleEntitySets() : undefined,
        // with multi EntitySets, tab counts are displayed by default
        id: getIconTabBarID()
      };
    }
    return undefined;
  };
  function getAlpViewConfig(converterContext, viewConfigs) {
    const entityType = converterContext.getEntityType();
    const annotation = getCompliantVisualizationAnnotation(entityType, converterContext, true);
    let chart, table;
    if (annotation) {
      viewConfigs.push({
        annotation: annotation,
        converterContext
      });
    } else {
      chart = getDefaultChart(entityType);
      table = getDefaultLineItem(entityType);
      if (chart && table) {
        const primary = [{
          annotationPath: "@" + chart.term
        }];
        const secondary = [{
          annotationPath: "@" + table.term
        }];
        viewConfigs.push({
          converterContext: converterContext,
          primary: primary,
          secondary: secondary,
          defaultPath: "both"
        });
      } else {
        throw new Error("ALP flavor needs both chart and table to load the application");
      }
    }
    return viewConfigs;
  }
  function hasMultiVisualizations(converterContext) {
    return converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
  }
  const getHeaderActions = function (converterContext) {
    const manifestWrapper = converterContext.getManifestWrapper();
    return insertCustomElements([], getActionsFromManifest(manifestWrapper.getHeaderActions(), converterContext).actions);
  };
  _exports.getHeaderActions = getHeaderActions;
  const checkChartFilterBarId = function (views, filterBarId) {
    views.forEach(view => {
      if (!view.type) {
        const presentation = view.presentation;
        presentation.visualizations.forEach(visualizationDefinition => {
          if (visualizationDefinition.type === VisualizationType.Chart && visualizationDefinition.filterId !== filterBarId) {
            visualizationDefinition.filterId = filterBarId;
          }
        });
      }
    });
  };
  /**
   * Creates the ListReportDefinition for multiple entity sets (multiple table mode).
   *
   * @param converterContext The converter context
   * @param isInsightsEnabled
   * @returns The list report definition based on annotation + manifest
   */
  _exports.checkChartFilterBarId = checkChartFilterBarId;
  const convertPage = function (converterContext, isInsightsEnabled) {
    const entityType = converterContext.getEntityType();
    const sContextPath = converterContext.getContextPath();
    if (!sContextPath) {
      // If we don't have an entitySet at this point we have an issue I'd say
      throw new Error("An EntitySet is required to be able to display a ListReport, please adjust your `entitySet` property to point to one.");
    }
    const manifestWrapper = converterContext.getManifestWrapper();
    const viewsDefinition = manifestWrapper.getViewConfiguration();
    const hasMultipleEntitySets = manifestWrapper.hasMultipleEntitySets();
    const views = getViews(converterContext, viewsDefinition, isInsightsEnabled);
    const lrTableVisualizations = getTableVisualizations(views);
    const lrChartVisualizations = getChartVisualizations(views);
    const showPinnableToggle = lrTableVisualizations.some(table => table.control.type === "ResponsiveTable");
    let singleTableId = "";
    let singleChartId = "";
    const dynamicListReportId = getDynamicListReportID();
    const filterBarId = getFilterBarID(sContextPath);
    const filterVariantManagementID = getFilterVariantManagementID(filterBarId);
    const fbConfig = manifestWrapper.getFilterConfiguration();
    const filterInitialLayout = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.initialLayout) !== undefined ? fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.initialLayout.toLowerCase() : "compact";
    const filterLayout = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.layout) !== undefined ? fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.layout.toLowerCase() : "compact";
    const useSemanticDateRange = fbConfig.useSemanticDateRange !== undefined ? fbConfig.useSemanticDateRange : true;
    const showClearButton = fbConfig.showClearButton !== undefined ? fbConfig.showClearButton : false;
    const oConfig = getContentAreaId(converterContext, views);
    if (oConfig) {
      singleChartId = oConfig.chartId;
      singleTableId = oConfig.tableId;
    }
    const useHiddenFilterBar = manifestWrapper.useHiddenFilterBar();
    // Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
    // Until then, hiding filter bar is now allowed if a chart is being used on LR.
    const hideFilterBar = (manifestWrapper.isFilterBarHidden() || useHiddenFilterBar) && singleChartId === "";
    const lrFilterProperties = getSelectionFields(converterContext, lrTableVisualizations);
    const selectionFields = lrFilterProperties.selectionFields;
    const propertyInfoFields = lrFilterProperties.sPropertyInfo;
    const hideBasicSearch = getFilterBarHideBasicSearch(lrTableVisualizations, lrChartVisualizations, converterContext);
    const multiViewControl = getMultiViewsControl(converterContext, views);
    const selectionVariant = multiViewControl ? undefined : getSelectionVariant(entityType, converterContext);
    const defaultSemanticDates = useSemanticDateRange ? getDefaultSemanticDates(getManifestFilterFields(entityType, converterContext)) : {};
    // Sort header actions according to position attributes in manifest
    const headerActions = getHeaderActions(converterContext);
    if (hasMultipleEntitySets) {
      checkChartFilterBarId(views, filterBarId);
    }
    const visualizationIds = lrTableVisualizations.map(visualization => {
      return visualization.annotation.id;
    }).concat(lrChartVisualizations.map(visualization => {
      return visualization.id;
    }));
    const targetControlIds = [...(hideFilterBar && !useHiddenFilterBar ? [] : [filterBarId]), ...(manifestWrapper.getVariantManagement() !== VariantManagementType.Control ? visualizationIds : []), ...(multiViewControl ? [multiViewControl.id] : [])];
    const stickySubheaderProvider = multiViewControl && manifestWrapper.getStickyMultiTabHeaderConfiguration() ? multiViewControl.id : undefined;
    return {
      mainEntitySet: sContextPath,
      mainEntityType: `${sContextPath}/`,
      multiViewsControl: multiViewControl,
      stickySubheaderProvider,
      singleTableId,
      singleChartId,
      dynamicListReportId,
      headerActions,
      showPinnableToggle: showPinnableToggle,
      filterBar: {
        propertyInfo: propertyInfoFields,
        selectionFields,
        hideBasicSearch,
        showClearButton
      },
      views: views,
      filterBarId: hideFilterBar && !useHiddenFilterBar ? "" : filterBarId,
      filterConditions: {
        selectionVariant: selectionVariant,
        defaultSemanticDates: defaultSemanticDates
      },
      variantManagement: {
        id: filterVariantManagementID,
        targetControlIds: targetControlIds.join(",")
      },
      hasMultiVisualizations: hasMultiVisualizations(converterContext),
      templateType: manifestWrapper.getTemplateType(),
      useSemanticDateRange,
      filterInitialLayout,
      filterLayout,
      kpiDefinitions: getKPIDefinitions(converterContext),
      hideFilterBar,
      useHiddenFilterBar
    };
  };
  _exports.convertPage = convertPage;
  function getContentAreaId(converterContext, views) {
    let singleTableId = "",
      singleChartId = "";
    if (converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
      for (const lrView of views) {
        const view = lrView;
        if (view.chartControlId && view.tableControlId) {
          singleChartId = view.chartControlId;
          singleTableId = view.tableControlId;
          break;
        }
      }
    } else {
      for (const lrView of views) {
        const view = lrView;
        if (!singleTableId && view.tableControlId) {
          singleTableId = view.tableControlId || "";
        }
        if (!singleChartId && view.chartControlId) {
          singleChartId = view.chartControlId || "";
        }
        if (singleChartId && singleTableId) {
          break;
        }
      }
    }
    if (singleTableId || singleChartId) {
      return {
        chartId: singleChartId,
        tableId: singleTableId
      };
    }
    return undefined;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRUYWJsZVZpc3VhbGl6YXRpb25zIiwidmlld3MiLCJ0YWJsZXMiLCJmb3JFYWNoIiwidmlldyIsInR5cGUiLCJ2aXN1YWxpemF0aW9ucyIsInNlY29uZGFyeVZpc3VhbGl6YXRpb24iLCJwcmVzZW50YXRpb24iLCJ2aXN1YWxpemF0aW9uIiwiVmlzdWFsaXphdGlvblR5cGUiLCJUYWJsZSIsInB1c2giLCJnZXRDaGFydFZpc3VhbGl6YXRpb25zIiwiY2hhcnRzIiwicHJpbWFyeVZpc3VhbGl6YXRpb24iLCJDaGFydCIsImdldERlZmF1bHRTZW1hbnRpY0RhdGVzIiwiZmlsdGVyRmllbGRzIiwiZGVmYXVsdFNlbWFudGljRGF0ZXMiLCJmaWx0ZXJGaWVsZCIsInNldHRpbmdzIiwiZGVmYXVsdFZhbHVlcyIsImxlbmd0aCIsImdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uIiwiZW50aXR5VHlwZSIsImNvbnZlcnRlckNvbnRleHQiLCJpc0FMUCIsImFubm90YXRpb25QYXRoIiwiZ2V0TWFuaWZlc3RXcmFwcGVyIiwiZ2V0RGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGgiLCJzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50IiwiZ2V0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCIsImVycm9yTWVzc2FnZUZvckFMUCIsInByZXNlbnRhdGlvblZhcmlhbnQiLCJQcmVzZW50YXRpb25WYXJpYW50IiwiRXJyb3IiLCJpc1ByZXNlbnRhdGlvbkNvbXBsaWFudCIsInVuZGVmaW5lZCIsImlzU2VsZWN0aW9uUHJlc2VudGF0aW9uQ29tcGxpYW50IiwiZ2V0RGVmYXVsdFByZXNlbnRhdGlvblZhcmlhbnQiLCJnZXREZWZhdWx0TGluZUl0ZW0iLCJnZXRWaWV3Iiwidmlld0NvbnZlcnRlckNvbmZpZ3VyYXRpb24iLCJpc0luc2lnaHRzRW5hYmxlZCIsImNvbmZpZyIsImlzTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiIsImN1cnJlbnRDb25maWciLCJrZXkiLCJnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24iLCJhbm5vdGF0aW9uIiwiZ2V0UmVsYXRpdmVBbm5vdGF0aW9uUGF0aCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImdldEVudGl0eVR5cGUiLCJ0YWJsZUNvbnRyb2xJZCIsImNoYXJ0Q29udHJvbElkIiwidGl0bGUiLCJzZWxlY3Rpb25WYXJpYW50UGF0aCIsImNyZWF0ZVZpc3VhbGl6YXRpb24iLCJjdXJyZW50UHJlc2VudGF0aW9uIiwiaXNQcmltYXJ5IiwiZGVmYXVsdFZpc3VhbGl6YXRpb24iLCJwcmVzZW50YXRpb25DcmVhdGVkIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0UHJlc2VudGF0aW9uIiwiaXRlbSIsInJlc29sdmVkVGFyZ2V0IiwiZ2V0RW50aXR5VHlwZUFubm90YXRpb24iLCJ0YXJnZXRBbm5vdGF0aW9uIiwiZ2V0VGVtcGxhdGVUeXBlIiwiVGVtcGxhdGVUeXBlIiwiQW5hbHl0aWNhbExpc3RQYWdlIiwic0Vycm9yIiwiY3JlYXRlQWxwVmlldyIsInByZXNlbnRhdGlvbnMiLCJkZWZhdWx0UGF0aCIsImlkIiwidmlzaWJsZSIsImhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMiLCJwcmltYXJ5Iiwic2Vjb25kYXJ5Iiwidmlld0Fubm90YXRpb24iLCJjb21waWxlRXhwcmVzc2lvbiIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIlRleHQiLCJ2aXN1YWxpemF0aW9uRGVmaW5pdGlvbiIsImluZGV4IiwidGFibGVWaXN1YWxpemF0aW9uIiwiZmlsdGVycyIsImNvbnRyb2wiLCJoaWRkZW5GaWx0ZXJzIiwicGF0aHMiLCJrZWVwUHJldmlvdXNQZXJzb25hbGl6YXRpb24iLCJnZXRUYWJsZUlEIiwidGVybSIsIlNlbGVjdGlvblZhcmlhbnQiLCJzcGxpdCIsImNoYXJ0VmlzdWFsaXphdGlvbiIsImdldENoYXJ0SUQiLCJtdWx0aVZpZXdzIiwibGFiZWwiLCJmcmFnbWVudCIsInRlbXBsYXRlIiwiY3VzdG9tVGFiSWQiLCJnZXRDdXN0b21UYWJJRCIsImdldFZpZXdzIiwic2V0dGluZ3NWaWV3cyIsInZpZXdDb252ZXJ0ZXJDb25maWdzIiwicGF0aCIsInZpZXdDb252ZXJ0ZXJDb250ZXh0IiwiZ2V0Q29udmVydGVyQ29udGV4dEZvciIsImNvbnRleHRQYXRoIiwiZW50aXR5U2V0IiwiZ2V0Q29udGV4dFBhdGgiLCJnZXRBbHBWaWV3Q29uZmlnIiwibWFwIiwidmlld0NvbnZlcnRlckNvbmZpZyIsImdldE11bHRpVmlld3NDb250cm9sIiwibWFuaWZlc3RXcmFwcGVyIiwidmlld3NEZWZpbml0aW9uIiwiZ2V0Vmlld0NvbmZpZ3VyYXRpb24iLCJoYXNNdWx0aVZpc3VhbGl6YXRpb25zIiwic2hvd1RhYkNvdW50cyIsInNob3dDb3VudHMiLCJoYXNNdWx0aXBsZUVudGl0eVNldHMiLCJnZXRJY29uVGFiQmFySUQiLCJ2aWV3Q29uZmlncyIsImNoYXJ0IiwidGFibGUiLCJnZXREZWZhdWx0Q2hhcnQiLCJnZXRIZWFkZXJBY3Rpb25zIiwiaW5zZXJ0Q3VzdG9tRWxlbWVudHMiLCJnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IiwiYWN0aW9ucyIsImNoZWNrQ2hhcnRGaWx0ZXJCYXJJZCIsImZpbHRlckJhcklkIiwiZmlsdGVySWQiLCJjb252ZXJ0UGFnZSIsInNDb250ZXh0UGF0aCIsImxyVGFibGVWaXN1YWxpemF0aW9ucyIsImxyQ2hhcnRWaXN1YWxpemF0aW9ucyIsInNob3dQaW5uYWJsZVRvZ2dsZSIsInNvbWUiLCJzaW5nbGVUYWJsZUlkIiwic2luZ2xlQ2hhcnRJZCIsImR5bmFtaWNMaXN0UmVwb3J0SWQiLCJnZXREeW5hbWljTGlzdFJlcG9ydElEIiwiZ2V0RmlsdGVyQmFySUQiLCJmaWx0ZXJWYXJpYW50TWFuYWdlbWVudElEIiwiZ2V0RmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRCIsImZiQ29uZmlnIiwiZ2V0RmlsdGVyQ29uZmlndXJhdGlvbiIsImZpbHRlckluaXRpYWxMYXlvdXQiLCJpbml0aWFsTGF5b3V0IiwidG9Mb3dlckNhc2UiLCJmaWx0ZXJMYXlvdXQiLCJsYXlvdXQiLCJ1c2VTZW1hbnRpY0RhdGVSYW5nZSIsInNob3dDbGVhckJ1dHRvbiIsIm9Db25maWciLCJnZXRDb250ZW50QXJlYUlkIiwiY2hhcnRJZCIsInRhYmxlSWQiLCJ1c2VIaWRkZW5GaWx0ZXJCYXIiLCJoaWRlRmlsdGVyQmFyIiwiaXNGaWx0ZXJCYXJIaWRkZW4iLCJsckZpbHRlclByb3BlcnRpZXMiLCJnZXRTZWxlY3Rpb25GaWVsZHMiLCJzZWxlY3Rpb25GaWVsZHMiLCJwcm9wZXJ0eUluZm9GaWVsZHMiLCJzUHJvcGVydHlJbmZvIiwiaGlkZUJhc2ljU2VhcmNoIiwiZ2V0RmlsdGVyQmFySGlkZUJhc2ljU2VhcmNoIiwibXVsdGlWaWV3Q29udHJvbCIsInNlbGVjdGlvblZhcmlhbnQiLCJnZXRTZWxlY3Rpb25WYXJpYW50IiwiZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMiLCJoZWFkZXJBY3Rpb25zIiwidmlzdWFsaXphdGlvbklkcyIsImNvbmNhdCIsInRhcmdldENvbnRyb2xJZHMiLCJnZXRWYXJpYW50TWFuYWdlbWVudCIsIlZhcmlhbnRNYW5hZ2VtZW50VHlwZSIsIkNvbnRyb2wiLCJzdGlja3lTdWJoZWFkZXJQcm92aWRlciIsImdldFN0aWNreU11bHRpVGFiSGVhZGVyQ29uZmlndXJhdGlvbiIsIm1haW5FbnRpdHlTZXQiLCJtYWluRW50aXR5VHlwZSIsIm11bHRpVmlld3NDb250cm9sIiwiZmlsdGVyQmFyIiwicHJvcGVydHlJbmZvIiwiZmlsdGVyQ29uZGl0aW9ucyIsInZhcmlhbnRNYW5hZ2VtZW50Iiwiam9pbiIsInRlbXBsYXRlVHlwZSIsImtwaURlZmluaXRpb25zIiwiZ2V0S1BJRGVmaW5pdGlvbnMiLCJsclZpZXciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkxpc3RSZXBvcnRDb252ZXJ0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbnRpdHlUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7XG5cdExpbmVJdGVtLFxuXHRQcmVzZW50YXRpb25WYXJpYW50LFxuXHRTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LFxuXHRTZWxlY3Rpb25WYXJpYW50LFxuXHRTZWxlY3Rpb25WYXJpYW50VHlwZVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIHsgQmFzZUFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgdHlwZSB7IENoYXJ0VmlzdWFsaXphdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9DaGFydFwiO1xuaW1wb3J0IHR5cGUgeyBUYWJsZVZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB0eXBlIHsgQ3VzdG9tRWxlbWVudEZpbHRlckZpZWxkLCBGaWx0ZXJGaWVsZCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvRmlsdGVyQmFyXCI7XG5pbXBvcnQge1xuXHRnZXRGaWx0ZXJCYXJIaWRlQmFzaWNTZWFyY2gsXG5cdGdldE1hbmlmZXN0RmlsdGVyRmllbGRzLFxuXHRnZXRTZWxlY3Rpb25GaWVsZHNcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXJcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgeyBDb25maWd1cmFibGVPYmplY3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgaW5zZXJ0Q3VzdG9tRWxlbWVudHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnMsIERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB7XG5cdGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbixcblx0Z2V0RGVmYXVsdENoYXJ0LFxuXHRnZXREZWZhdWx0TGluZUl0ZW0sXG5cdGdldERlZmF1bHRQcmVzZW50YXRpb25WYXJpYW50LFxuXHRnZXRTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LFxuXHRnZXRTZWxlY3Rpb25WYXJpYW50LFxuXHRpc1ByZXNlbnRhdGlvbkNvbXBsaWFudCxcblx0aXNTZWxlY3Rpb25QcmVzZW50YXRpb25Db21wbGlhbnRcbn0gZnJvbSBcIi4uL2NvbnRyb2xzL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBLUElEZWZpbml0aW9uIH0gZnJvbSBcIi4uL2NvbnRyb2xzL0NvbW1vbi9LUElcIjtcbmltcG9ydCB7IGdldEtQSURlZmluaXRpb25zIH0gZnJvbSBcIi4uL2NvbnRyb2xzL0NvbW1vbi9LUElcIjtcbmltcG9ydCB7XG5cdGdldENoYXJ0SUQsXG5cdGdldEN1c3RvbVRhYklELFxuXHRnZXREeW5hbWljTGlzdFJlcG9ydElELFxuXHRnZXRGaWx0ZXJCYXJJRCxcblx0Z2V0RmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRCxcblx0Z2V0SWNvblRhYkJhcklELFxuXHRnZXRUYWJsZUlEXG59IGZyb20gXCIuLi9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgdHlwZSB7XG5cdENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uLFxuXHRDdXN0b21WaWV3VGVtcGxhdGVDb25maWd1cmF0aW9uLFxuXHRNdWx0aXBsZVZpZXdzQ29uZmlndXJhdGlvbixcblx0U2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uLFxuXHRWaWV3UGF0aENvbmZpZ3VyYXRpb25cbn0gZnJvbSBcIi4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IFRlbXBsYXRlVHlwZSwgVmFyaWFudE1hbmFnZW1lbnRUeXBlLCBWaXN1YWxpemF0aW9uVHlwZSB9IGZyb20gXCIuLi9NYW5pZmVzdFNldHRpbmdzXCI7XG50eXBlIFZpZXdBbm5vdGF0aW9ucyA9IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgfCBTZWxlY3Rpb25WYXJpYW50O1xudHlwZSBWYXJpYW50TWFuYWdlbWVudERlZmluaXRpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHRhcmdldENvbnRyb2xJZHM6IHN0cmluZztcbn07XG50eXBlIE11bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24gPSBWaWV3UGF0aENvbmZpZ3VyYXRpb24gJiB7XG5cdGFubm90YXRpb24/OiBEYXRhVmlzdWFsaXphdGlvbkFubm90YXRpb25zO1xufTtcbnR5cGUgU2luZ2xlVmlld0NvbmZpZ3VyYXRpb24gPSB7XG5cdGFubm90YXRpb24/OiBEYXRhVmlzdWFsaXphdGlvbkFubm90YXRpb25zO1xufTtcbnR5cGUgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb24gPSBDdXN0b21WaWV3VGVtcGxhdGVDb25maWd1cmF0aW9uICYge1xuXHR0eXBlOiBzdHJpbmc7XG59O1xudHlwZSBWaWV3Q29uZmlndXJhdGlvbiA9IE11bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24gfCBTaW5nbGVWaWV3Q29uZmlndXJhdGlvbiB8IEN1c3RvbVZpZXdDb25maWd1cmF0aW9uO1xudHlwZSBWaWV3QW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24gPSBNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uIHwgU2luZ2xlVmlld0NvbmZpZ3VyYXRpb247XG50eXBlIFZpZXdDb252ZXJ0ZXJTZXR0aW5ncyA9IFZpZXdDb25maWd1cmF0aW9uICYge1xuXHRjb252ZXJ0ZXJDb250ZXh0PzogQ29udmVydGVyQ29udGV4dDtcbn07XG50eXBlIERlZmF1bHRTZW1hbnRpY0RhdGUgPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdG9wZXJhdG9yOiBzdHJpbmc7XG59O1xudHlwZSBNdWx0aVZpZXdzQ29udHJvbENvbmZpZ3VyYXRpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHNob3dUYWJDb3VudHM/OiBib29sZWFuO1xufTtcbmV4cG9ydCB0eXBlIExpc3RSZXBvcnREZWZpbml0aW9uID0ge1xuXHRtYWluRW50aXR5U2V0OiBzdHJpbmc7XG5cdG1haW5FbnRpdHlUeXBlOiBzdHJpbmc7IC8vIGVudGl0eVR5cGU+IGF0IHRoZSBzdGFydCBvZiBMUiB0ZW1wbGF0aW5nXG5cdHNpbmdsZVRhYmxlSWQ/OiBzdHJpbmc7IC8vIG9ubHkgd2l0aCBzaW5nbGUgVGFibGUgbW9kZVxuXHRzaW5nbGVDaGFydElkPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggc2luZ2xlIFRhYmxlIG1vZGVcblx0ZHluYW1pY0xpc3RSZXBvcnRJZDogc3RyaW5nO1xuXHRzdGlja3lTdWJoZWFkZXJQcm92aWRlcj86IHN0cmluZztcblx0bXVsdGlWaWV3c0NvbnRyb2w/OiBNdWx0aVZpZXdzQ29udHJvbENvbmZpZ3VyYXRpb247IC8vIG9ubHkgd2l0aCBtdWx0aSBUYWJsZSBtb2RlXG5cdGhlYWRlckFjdGlvbnM6IEJhc2VBY3Rpb25bXTtcblx0c2hvd1Bpbm5hYmxlVG9nZ2xlPzogYm9vbGVhbjtcblx0ZmlsdGVyQmFyOiB7XG5cdFx0cHJvcGVydHlJbmZvOiBhbnk7XG5cdFx0c2VsZWN0aW9uRmllbGRzOiBGaWx0ZXJGaWVsZFtdO1xuXHRcdGhpZGVCYXNpY1NlYXJjaDogYm9vbGVhbjtcblx0XHRzaG93Q2xlYXJCdXR0b24/OiBib29sZWFuO1xuXHR9O1xuXHR2aWV3czogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW107XG5cdGZpbHRlckNvbmRpdGlvbnM6IHtcblx0XHRzZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZDtcblx0XHRkZWZhdWx0U2VtYW50aWNEYXRlczogUmVjb3JkPHN0cmluZywgRGVmYXVsdFNlbWFudGljRGF0ZT4gfCB7fTtcblx0fTtcblx0ZmlsdGVyQmFySWQ6IHN0cmluZztcblx0dmFyaWFudE1hbmFnZW1lbnQ6IFZhcmlhbnRNYW5hZ2VtZW50RGVmaW5pdGlvbjtcblx0aGFzTXVsdGlWaXN1YWxpemF0aW9uczogYm9vbGVhbjtcblx0dGVtcGxhdGVUeXBlOiBUZW1wbGF0ZVR5cGU7XG5cdHVzZVNlbWFudGljRGF0ZVJhbmdlPzogYm9vbGVhbjtcblx0ZmlsdGVySW5pdGlhbExheW91dD86IHN0cmluZztcblx0ZmlsdGVyTGF5b3V0Pzogc3RyaW5nO1xuXHRrcGlEZWZpbml0aW9uczogS1BJRGVmaW5pdGlvbltdO1xuXHRoaWRlRmlsdGVyQmFyOiBib29sZWFuO1xuXHR1c2VIaWRkZW5GaWx0ZXJCYXI6IGJvb2xlYW47XG59O1xuZXhwb3J0IHR5cGUgTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uID0gU2luZ2xlVmlld0RlZmluaXRpb24gfCBDdXN0b21WaWV3RGVmaW5pdGlvbiB8IENvbWJpbmVkVmlld0RlZmluaXRpb247XG5leHBvcnQgdHlwZSBDb21iaW5lZFZpZXdEZWZpbml0aW9uID0ge1xuXHRzZWxlY3Rpb25WYXJpYW50UGF0aD86IHN0cmluZzsgLy8gb25seSB3aXRoIG9uIG11bHRpIFRhYmxlIG1vZGVcblx0dGl0bGU/OiBzdHJpbmc7IC8vIG9ubHkgd2l0aCBtdWx0aSBUYWJsZSBtb2RlXG5cdHByaW1hcnlWaXN1YWxpemF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb247XG5cdHNlY29uZGFyeVZpc3VhbGl6YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbjtcblx0dGFibGVDb250cm9sSWQ6IHN0cmluZztcblx0Y2hhcnRDb250cm9sSWQ6IHN0cmluZztcblx0ZGVmYXVsdFBhdGg/OiBzdHJpbmc7XG5cdHZpc2libGU/OiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgQ3VzdG9tVmlld0RlZmluaXRpb24gPSB7XG5cdHRpdGxlPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRmcmFnbWVudDogc3RyaW5nO1xuXHR0eXBlOiBzdHJpbmc7XG5cdGN1c3RvbVRhYklkOiBzdHJpbmc7XG5cdHZpc2libGU/OiBzdHJpbmc7XG59O1xuZXhwb3J0IHR5cGUgU2luZ2xlVmlld0RlZmluaXRpb24gPSBTaW5nbGVUYWJsZVZpZXdEZWZpbml0aW9uIHwgU2luZ2xlQ2hhcnRWaWV3RGVmaW5pdGlvbjtcbmV4cG9ydCB0eXBlIEJhc2VTaW5nbGVWaWV3RGVmaW5pdGlvbiA9IHtcblx0c2VsZWN0aW9uVmFyaWFudFBhdGg/OiBzdHJpbmc7IC8vIG9ubHkgd2l0aCBvbiBtdWx0aSBUYWJsZSBtb2RlXG5cdHRpdGxlPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRwcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbjtcbn07XG5leHBvcnQgdHlwZSBTaW5nbGVUYWJsZVZpZXdEZWZpbml0aW9uID0gQmFzZVNpbmdsZVZpZXdEZWZpbml0aW9uICYge1xuXHR0YWJsZUNvbnRyb2xJZD86IHN0cmluZztcblx0dmlzaWJsZT86IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBTaW5nbGVDaGFydFZpZXdEZWZpbml0aW9uID0gQmFzZVNpbmdsZVZpZXdEZWZpbml0aW9uICYge1xuXHRjaGFydENvbnRyb2xJZD86IHN0cmluZztcblx0dmlzaWJsZT86IHN0cmluZztcbn07XG50eXBlIENvbnRlbnRBcmVhSUQgPSB7XG5cdGNoYXJ0SWQ6IHN0cmluZztcblx0dGFibGVJZDogc3RyaW5nO1xufTtcbi8qKlxuICogUmV0cmlldmVzIGFsbCBsaXN0IHJlcG9ydCB0YWJsZXMuXG4gKlxuICogQHBhcmFtIHZpZXdzIFRoZSBsaXN0IHJlcG9ydCB2aWV3cyBjb25maWd1cmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHJldHVybnMgVGhlIGxpc3QgcmVwb3J0IHRhYmxlXG4gKi9cbmZ1bmN0aW9uIGdldFRhYmxlVmlzdWFsaXphdGlvbnModmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdKTogVGFibGVWaXN1YWxpemF0aW9uW10ge1xuXHRjb25zdCB0YWJsZXM6IFRhYmxlVmlzdWFsaXphdGlvbltdID0gW107XG5cdHZpZXdzLmZvckVhY2goZnVuY3Rpb24gKHZpZXcpIHtcblx0XHRpZiAoISh2aWV3IGFzIEN1c3RvbVZpZXdEZWZpbml0aW9uKS50eXBlKSB7XG5cdFx0XHRjb25zdCB2aXN1YWxpemF0aW9ucyA9ICh2aWV3IGFzIENvbWJpbmVkVmlld0RlZmluaXRpb24pLnNlY29uZGFyeVZpc3VhbGl6YXRpb25cblx0XHRcdFx0PyAodmlldyBhcyBDb21iaW5lZFZpZXdEZWZpbml0aW9uKS5zZWNvbmRhcnlWaXN1YWxpemF0aW9uLnZpc3VhbGl6YXRpb25zXG5cdFx0XHRcdDogKHZpZXcgYXMgU2luZ2xlVmlld0RlZmluaXRpb24pLnByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9ucztcblx0XHRcdHZpc3VhbGl6YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKHZpc3VhbGl6YXRpb24pIHtcblx0XHRcdFx0aWYgKHZpc3VhbGl6YXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuVGFibGUpIHtcblx0XHRcdFx0XHR0YWJsZXMucHVzaCh2aXN1YWxpemF0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHRhYmxlcztcbn1cbmZ1bmN0aW9uIGdldENoYXJ0VmlzdWFsaXphdGlvbnModmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdKTogQ2hhcnRWaXN1YWxpemF0aW9uW10ge1xuXHRjb25zdCBjaGFydHM6IENoYXJ0VmlzdWFsaXphdGlvbltdID0gW107XG5cdHZpZXdzLmZvckVhY2goZnVuY3Rpb24gKHZpZXcpIHtcblx0XHRpZiAoISh2aWV3IGFzIEN1c3RvbVZpZXdEZWZpbml0aW9uKS50eXBlKSB7XG5cdFx0XHRjb25zdCB2aXN1YWxpemF0aW9ucyA9ICh2aWV3IGFzIENvbWJpbmVkVmlld0RlZmluaXRpb24pLnByaW1hcnlWaXN1YWxpemF0aW9uXG5cdFx0XHRcdD8gKHZpZXcgYXMgQ29tYmluZWRWaWV3RGVmaW5pdGlvbikucHJpbWFyeVZpc3VhbGl6YXRpb24udmlzdWFsaXphdGlvbnNcblx0XHRcdFx0OiAodmlldyBhcyBTaW5nbGVWaWV3RGVmaW5pdGlvbikucHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zO1xuXHRcdFx0dmlzdWFsaXphdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAodmlzdWFsaXphdGlvbikge1xuXHRcdFx0XHRpZiAodmlzdWFsaXphdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCkge1xuXHRcdFx0XHRcdGNoYXJ0cy5wdXNoKHZpc3VhbGl6YXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gY2hhcnRzO1xufVxuY29uc3QgZ2V0RGVmYXVsdFNlbWFudGljRGF0ZXMgPSBmdW5jdGlvbiAoZmlsdGVyRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21FbGVtZW50RmlsdGVyRmllbGQ+KTogUmVjb3JkPHN0cmluZywgRGVmYXVsdFNlbWFudGljRGF0ZT4ge1xuXHRjb25zdCBkZWZhdWx0U2VtYW50aWNEYXRlczogYW55ID0ge307XG5cdGZvciAoY29uc3QgZmlsdGVyRmllbGQgaW4gZmlsdGVyRmllbGRzKSB7XG5cdFx0aWYgKGZpbHRlckZpZWxkc1tmaWx0ZXJGaWVsZF0/LnNldHRpbmdzPy5kZWZhdWx0VmFsdWVzPy5sZW5ndGgpIHtcblx0XHRcdGRlZmF1bHRTZW1hbnRpY0RhdGVzW2ZpbHRlckZpZWxkXSA9IGZpbHRlckZpZWxkc1tmaWx0ZXJGaWVsZF0/LnNldHRpbmdzPy5kZWZhdWx0VmFsdWVzO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZGVmYXVsdFNlbWFudGljRGF0ZXM7XG59O1xuLyoqXG4gKiBGaW5kIGEgdmlzdWFsaXphdGlvbiBhbm5vdGF0aW9uIHRoYXQgY2FuIGJlIHVzZWQgZm9yIHJlbmRlcmluZyB0aGUgbGlzdCByZXBvcnQuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGN1cnJlbnQgRW50aXR5VHlwZVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBpc0FMUFxuICogQHJldHVybnMgQSBjb21wbGlhbnQgYW5ub3RhdGlvbiBmb3IgcmVuZGVyaW5nIHRoZSBsaXN0IHJlcG9ydFxuICovXG5mdW5jdGlvbiBnZXRDb21wbGlhbnRWaXN1YWxpemF0aW9uQW5ub3RhdGlvbihcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0aXNBTFA6IGJvb2xlYW5cbik6IExpbmVJdGVtIHwgUHJlc2VudGF0aW9uVmFyaWFudCB8IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgfCB1bmRlZmluZWQge1xuXHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuZ2V0RGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGgoKTtcblx0Y29uc3Qgc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCA9IGdldFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQoZW50aXR5VHlwZSwgYW5ub3RhdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBlcnJvck1lc3NhZ2VGb3JBTFAgPSBcIkFMUCBmbGF2b3IgbmVlZHMgYm90aCBjaGFydCBhbmQgdGFibGUgdG8gbG9hZCB0aGUgYXBwbGljYXRpb25cIjtcblx0aWYgKHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRpZiAoYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdGNvbnN0IHByZXNlbnRhdGlvblZhcmlhbnQgPSBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LlByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0XHRpZiAoIXByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUHJlc2VudGF0aW9uIFZhcmlhbnQgaXMgbm90IGNvbmZpZ3VyZWQgaW4gdGhlIFNQViBtZW50aW9uZWQgaW4gdGhlIG1hbmlmZXN0XCIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFpc1ByZXNlbnRhdGlvbkNvbXBsaWFudChwcmVzZW50YXRpb25WYXJpYW50LCBpc0FMUCkpIHtcblx0XHRcdFx0aWYgKGlzQUxQKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZUZvckFMUCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGlzU2VsZWN0aW9uUHJlc2VudGF0aW9uQ29tcGxpYW50KHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQsIGlzQUxQKSA9PT0gdHJ1ZSkge1xuXHRcdFx0cmV0dXJuIHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0fSBlbHNlIGlmIChpc0FMUCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZUZvckFMUCk7XG5cdFx0fVxuXHR9XG5cdGNvbnN0IHByZXNlbnRhdGlvblZhcmlhbnQgPSBnZXREZWZhdWx0UHJlc2VudGF0aW9uVmFyaWFudChlbnRpdHlUeXBlKTtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRpZiAoaXNQcmVzZW50YXRpb25Db21wbGlhbnQocHJlc2VudGF0aW9uVmFyaWFudCwgaXNBTFApKSB7XG5cdFx0XHRyZXR1cm4gcHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHR9IGVsc2UgaWYgKGlzQUxQKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlRm9yQUxQKTtcblx0XHR9XG5cdH1cblx0aWYgKCFpc0FMUCkge1xuXHRcdHJldHVybiBnZXREZWZhdWx0TGluZUl0ZW0oZW50aXR5VHlwZSk7XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cbmNvbnN0IGdldFZpZXcgPSBmdW5jdGlvbiAodmlld0NvbnZlcnRlckNvbmZpZ3VyYXRpb246IFZpZXdDb252ZXJ0ZXJTZXR0aW5ncywgaXNJbnNpZ2h0c0VuYWJsZWQ/OiBib29sZWFuKTogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uIHtcblx0bGV0IGNvbmZpZyA9IHZpZXdDb252ZXJ0ZXJDb25maWd1cmF0aW9uO1xuXHRpZiAoY29uZmlnLmNvbnZlcnRlckNvbnRleHQpIHtcblx0XHRsZXQgY29udmVydGVyQ29udGV4dCA9IGNvbmZpZy5jb252ZXJ0ZXJDb250ZXh0O1xuXHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBWaWV3QW5ub3RhdGlvbkNvbmZpZ3VyYXRpb247XG5cdFx0Y29uc3QgaXNNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uID0gZnVuY3Rpb24gKGN1cnJlbnRDb25maWc6IFZpZXdDb25maWd1cmF0aW9uKTogY3VycmVudENvbmZpZyBpcyBNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uIHtcblx0XHRcdHJldHVybiAoY3VycmVudENvbmZpZyBhcyBNdWx0aXBsZVZpZXdDb25maWd1cmF0aW9uKS5rZXkgIT09IHVuZGVmaW5lZDtcblx0XHR9O1xuXHRcdGxldCBwcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiA9IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdGNvbmZpZy5hbm5vdGF0aW9uXG5cdFx0XHRcdD8gY29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZUFubm90YXRpb25QYXRoKGNvbmZpZy5hbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkpXG5cdFx0XHRcdDogXCJcIixcblx0XHRcdHRydWUsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0Y29uZmlnIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdGlzTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbihjb25maWcpLFxuXHRcdFx0aXNJbnNpZ2h0c0VuYWJsZWRcblx0XHQpO1xuXHRcdGxldCB0YWJsZUNvbnRyb2xJZCA9IFwiXCI7XG5cdFx0bGV0IGNoYXJ0Q29udHJvbElkID0gXCJcIjtcblx0XHRsZXQgdGl0bGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IFwiXCI7XG5cdFx0bGV0IHNlbGVjdGlvblZhcmlhbnRQYXRoID0gXCJcIjtcblx0XHRjb25zdCBjcmVhdGVWaXN1YWxpemF0aW9uID0gZnVuY3Rpb24gKGN1cnJlbnRQcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiwgaXNQcmltYXJ5PzogYm9vbGVhbikge1xuXHRcdFx0bGV0IGRlZmF1bHRWaXN1YWxpemF0aW9uO1xuXHRcdFx0Zm9yIChjb25zdCB2aXN1YWxpemF0aW9uIG9mIGN1cnJlbnRQcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnMpIHtcblx0XHRcdFx0aWYgKGlzUHJpbWFyeSAmJiB2aXN1YWxpemF0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0KSB7XG5cdFx0XHRcdFx0ZGVmYXVsdFZpc3VhbGl6YXRpb24gPSB2aXN1YWxpemF0aW9uO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghaXNQcmltYXJ5ICYmIHZpc3VhbGl6YXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuVGFibGUpIHtcblx0XHRcdFx0XHRkZWZhdWx0VmlzdWFsaXphdGlvbiA9IHZpc3VhbGl6YXRpb247XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNvbnN0IHByZXNlbnRhdGlvbkNyZWF0ZWQgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50UHJlc2VudGF0aW9uKTtcblx0XHRcdGlmIChkZWZhdWx0VmlzdWFsaXphdGlvbikge1xuXHRcdFx0XHRwcmVzZW50YXRpb25DcmVhdGVkLnZpc3VhbGl6YXRpb25zID0gW2RlZmF1bHRWaXN1YWxpemF0aW9uXTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcigoaXNQcmltYXJ5ID8gXCJQcmltYXJ5XCIgOiBcIlNlY29uZGFyeVwiKSArIFwiIHZpc3VhbGlzYXRpb24gbmVlZHMgdmFsaWQgXCIgKyAoaXNQcmltYXJ5ID8gXCJjaGFydFwiIDogXCJ0YWJsZVwiKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcHJlc2VudGF0aW9uQ3JlYXRlZDtcblx0XHR9O1xuXHRcdGNvbnN0IGdldFByZXNlbnRhdGlvbiA9IGZ1bmN0aW9uIChpdGVtOiBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb24sIGlzUHJpbWFyeTogYm9vbGVhbikge1xuXHRcdFx0Y29uc3QgcmVzb2x2ZWRUYXJnZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKGl0ZW0uYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0Y29uc3QgdGFyZ2V0QW5ub3RhdGlvbiA9IHJlc29sdmVkVGFyZ2V0LmFubm90YXRpb24gYXMgRGF0YVZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucztcblx0XHRcdGNvbnZlcnRlckNvbnRleHQgPSByZXNvbHZlZFRhcmdldC5jb252ZXJ0ZXJDb250ZXh0O1xuXHRcdFx0Y29uc3QgYW5ub3RhdGlvbiA9IHRhcmdldEFubm90YXRpb247XG5cdFx0XHRpZiAoYW5ub3RhdGlvbiB8fCBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlKSB7XG5cdFx0XHRcdHByZXNlbnRhdGlvbiA9IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdFx0XHRhbm5vdGF0aW9uXG5cdFx0XHRcdFx0XHQ/IGNvbnZlcnRlckNvbnRleHQuZ2V0UmVsYXRpdmVBbm5vdGF0aW9uUGF0aChhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkpXG5cdFx0XHRcdFx0XHQ6IFwiXCIsXG5cdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdGNvbmZpZyBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb24sXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0aXNJbnNpZ2h0c0VuYWJsZWRcblx0XHRcdFx0KTtcblx0XHRcdFx0cmV0dXJuIHByZXNlbnRhdGlvbjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHNFcnJvciA9XG5cdFx0XHRcdFx0XCJBbm5vdGF0aW9uIFBhdGggZm9yIHRoZSBcIiArXG5cdFx0XHRcdFx0KGlzUHJpbWFyeSA/IFwicHJpbWFyeVwiIDogXCJzZWNvbmRhcnlcIikgK1xuXHRcdFx0XHRcdFwiIHZpc3VhbGlzYXRpb24gbWVudGlvbmVkIGluIHRoZSBtYW5pZmVzdCBpcyBub3QgZm91bmRcIjtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHNFcnJvcik7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBjcmVhdGVBbHBWaWV3ID0gZnVuY3Rpb24gKFxuXHRcdFx0cHJlc2VudGF0aW9uczogRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uW10sXG5cdFx0XHRkZWZhdWx0UGF0aDogXCJib3RoXCIgfCBcInByaW1hcnlcIiB8IFwic2Vjb25kYXJ5XCIgfCB1bmRlZmluZWRcblx0XHQpIHtcblx0XHRcdGNvbnN0IHByaW1hcnlWaXN1YWxpemF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb24gfCB1bmRlZmluZWQgPSBjcmVhdGVWaXN1YWxpemF0aW9uKHByZXNlbnRhdGlvbnNbMF0sIHRydWUpO1xuXHRcdFx0Y2hhcnRDb250cm9sSWQgPSAocHJpbWFyeVZpc3VhbGl6YXRpb24/LnZpc3VhbGl6YXRpb25zWzBdIGFzIENoYXJ0VmlzdWFsaXphdGlvbik/LmlkO1xuXHRcdFx0Y29uc3Qgc2Vjb25kYXJ5VmlzdWFsaXphdGlvbjogRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uIHwgdW5kZWZpbmVkID0gY3JlYXRlVmlzdWFsaXphdGlvbihcblx0XHRcdFx0cHJlc2VudGF0aW9uc1sxXSA/IHByZXNlbnRhdGlvbnNbMV0gOiBwcmVzZW50YXRpb25zWzBdLFxuXHRcdFx0XHRmYWxzZVxuXHRcdFx0KTtcblx0XHRcdHRhYmxlQ29udHJvbElkID0gKHNlY29uZGFyeVZpc3VhbGl6YXRpb24/LnZpc3VhbGl6YXRpb25zWzBdIGFzIFRhYmxlVmlzdWFsaXphdGlvbik/LmFubm90YXRpb24/LmlkO1xuXHRcdFx0aWYgKHByaW1hcnlWaXN1YWxpemF0aW9uICYmIHNlY29uZGFyeVZpc3VhbGl6YXRpb24pIHtcblx0XHRcdFx0Y29uZmlnID0gY29uZmlnIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvbjtcblx0XHRcdFx0Y29uc3QgdmlzaWJsZSA9IGNvbmZpZy52aXNpYmxlO1xuXHRcdFx0XHRjb25zdCB2aWV3OiBDb21iaW5lZFZpZXdEZWZpbml0aW9uID0ge1xuXHRcdFx0XHRcdHByaW1hcnlWaXN1YWxpemF0aW9uLFxuXHRcdFx0XHRcdHNlY29uZGFyeVZpc3VhbGl6YXRpb24sXG5cdFx0XHRcdFx0dGFibGVDb250cm9sSWQsXG5cdFx0XHRcdFx0Y2hhcnRDb250cm9sSWQsXG5cdFx0XHRcdFx0ZGVmYXVsdFBhdGgsXG5cdFx0XHRcdFx0dmlzaWJsZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gdmlldztcblx0XHRcdH1cblx0XHR9O1xuXHRcdGlmIChcblx0XHRcdCFjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoY29uZmlnIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvbikgJiZcblx0XHRcdHByZXNlbnRhdGlvbj8udmlzdWFsaXphdGlvbnM/Lmxlbmd0aCA9PT0gMiAmJlxuXHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZVxuXHRcdCkge1xuXHRcdFx0Y29uc3QgdmlldzogQ29tYmluZWRWaWV3RGVmaW5pdGlvbiB8IHVuZGVmaW5lZCA9IGNyZWF0ZUFscFZpZXcoW3ByZXNlbnRhdGlvbl0sIFwiYm90aFwiKTtcblx0XHRcdGlmICh2aWV3KSB7XG5cdFx0XHRcdHJldHVybiB2aWV3O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoY29uZmlnIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvbikgfHxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0XHQpIHtcblx0XHRcdGNvbnN0IHsgcHJpbWFyeSwgc2Vjb25kYXJ5IH0gPSBjb25maWcgYXMgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0XHRpZiAocHJpbWFyeSAmJiBwcmltYXJ5Lmxlbmd0aCAmJiBzZWNvbmRhcnkgJiYgc2Vjb25kYXJ5Lmxlbmd0aCkge1xuXHRcdFx0XHRjb25zdCB2aWV3OiBDb21iaW5lZFZpZXdEZWZpbml0aW9uIHwgdW5kZWZpbmVkID0gY3JlYXRlQWxwVmlldyhcblx0XHRcdFx0XHRbZ2V0UHJlc2VudGF0aW9uKHByaW1hcnlbMF0sIHRydWUpLCBnZXRQcmVzZW50YXRpb24oc2Vjb25kYXJ5WzBdLCBmYWxzZSldLFxuXHRcdFx0XHRcdChjb25maWcgYXMgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb24pLmRlZmF1bHRQYXRoXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICh2aWV3KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlNlY29uZGFyeUl0ZW1zIGluIHRoZSBWaWV3cyBpcyBub3QgcHJlc2VudFwiKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGlzTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbihjb25maWcpKSB7XG5cdFx0XHQvLyBrZXkgZXhpc3RzIG9ubHkgb24gbXVsdGkgdGFibGVzIG1vZGVcblx0XHRcdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbigoY29uZmlnIGFzIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbikuYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0Y29uc3Qgdmlld0Fubm90YXRpb246IFZpZXdBbm5vdGF0aW9ucyA9IHJlc29sdmVkVGFyZ2V0LmFubm90YXRpb247XG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0ID0gcmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dDtcblx0XHRcdHRpdGxlID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHZpZXdBbm5vdGF0aW9uLlRleHQpKTtcblx0XHRcdC8vIE5lZWQgdG8gbG9vcCBvbiB0YWJsZSBpbnRvIHZpZXdzIHNpbmNlIG11bHRpIHRhYmxlIG1vZGUgZ2V0IHNwZWNpZmljIGNvbmZpZ3VyYXRpb24gKGhpZGRlbiBmaWx0ZXJzIG9yIFRhYmxlIElkKVxuXHRcdFx0cHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zLmZvckVhY2goKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRzd2l0Y2ggKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLnR5cGUpIHtcblx0XHRcdFx0XHRjYXNlIFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlOlxuXHRcdFx0XHRcdFx0Y29uc3QgdGFibGVWaXN1YWxpemF0aW9uID0gcHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zW2luZGV4XSBhcyBUYWJsZVZpc3VhbGl6YXRpb247XG5cdFx0XHRcdFx0XHRjb25zdCBmaWx0ZXJzID0gdGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wuZmlsdGVycyB8fCB7fTtcblx0XHRcdFx0XHRcdGZpbHRlcnMuaGlkZGVuRmlsdGVycyA9IGZpbHRlcnMuaGlkZGVuRmlsdGVycyB8fCB7IHBhdGhzOiBbXSB9O1xuXHRcdFx0XHRcdFx0aWYgKCEoY29uZmlnIGFzIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbikua2VlcFByZXZpb3VzUGVyc29uYWxpemF0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdC8vIE5lZWQgdG8gb3ZlcnJpZGUgVGFibGUgSWQgdG8gbWF0Y2ggd2l0aCBUYWIgS2V5IChjdXJyZW50bHkgb25seSB0YWJsZSBpcyBtYW5hZ2VkIGluIG11bHRpcGxlIHZpZXcgbW9kZSlcblx0XHRcdFx0XHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmFubm90YXRpb24uaWQgPSBnZXRUYWJsZUlEKChjb25maWcgYXMgU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uKS5rZXkgfHwgXCJcIiwgXCJMaW5lSXRlbVwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBWaWV3QW5ub3RhdGlvbkNvbmZpZ3VyYXRpb247XG5cdFx0XHRcdFx0XHRpZiAoY29uZmlnLmFubm90YXRpb24/LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0XHRcdFx0aWYgKCFjb25maWcuYW5ub3RhdGlvbi5TZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0XHRcdFx0YFRoZSBTZWxlY3Rpb24gVmFyaWFudCBpcyBtaXNzaW5nIGZvciB0aGUgU2VsZWN0aW9uIFByZXNlbnRhdGlvbiBWYXJpYW50ICR7Y29uZmlnLmFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lfWBcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnRQYXRoID0gYEAke2NvbmZpZy5hbm5vdGF0aW9uLlNlbGVjdGlvblZhcmlhbnQ/LmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdChcIkBcIilbMV19YDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvblZhcmlhbnRQYXRoID0gKGNvbmZpZyBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb24pLmFubm90YXRpb25QYXRoO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly9Qcm92aWRlIFNlbGVjdGlvbiBWYXJpYW50IHRvIGhpZGRlbkZpbHRlcnMgaW4gb3JkZXIgdG8gc2V0IHRoZSBTViBmaWx0ZXJzIHRvIHRoZSB0YWJsZS5cblx0XHRcdFx0XHRcdC8vTURDIFRhYmxlIG92ZXJyaWRlcyBiaW5kaW5nIEZpbHRlciBhbmQgZnJvbSBTQVAgRkUgdGhlIG9ubHkgbWV0aG9kIHdoZXJlIHdlIGFyZSBhYmxlIHRvIGFkZFxuXHRcdFx0XHRcdFx0Ly9hZGRpdGlvbmFsIGZpbHRlciBpcyAncmViaW5kVGFibGUnIGludG8gVGFibGUgZGVsZWdhdGUuXG5cdFx0XHRcdFx0XHQvL1RvIGF2b2lkIGltcGxlbWVudGluZyBzcGVjaWZpYyBMUiBmZWF0dXJlIHRvIFNBUCBGRSBNYWNybyBUYWJsZSwgdGhlIGZpbHRlcihzKSByZWxhdGVkIHRvIHRoZSBUYWIgKG11bHRpIHRhYmxlIG1vZGUpXG5cdFx0XHRcdFx0XHQvL2NhbiBiZSBwYXNzZWQgdG8gbWFjcm8gdGFibGUgdmlhIHBhcmFtZXRlci9jb250ZXh0IG5hbWVkIGZpbHRlcnMgYW5kIGtleSBoaWRkZW5GaWx0ZXJzLlxuXHRcdFx0XHRcdFx0ZmlsdGVycy5oaWRkZW5GaWx0ZXJzLnBhdGhzLnB1c2goeyBhbm5vdGF0aW9uUGF0aDogc2VsZWN0aW9uVmFyaWFudFBhdGggfSk7XG5cdFx0XHRcdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC5maWx0ZXJzID0gZmlsdGVycztcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQ6XG5cdFx0XHRcdFx0XHRjb25zdCBjaGFydFZpc3VhbGl6YXRpb24gPSBwcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnNbaW5kZXhdIGFzIENoYXJ0VmlzdWFsaXphdGlvbjtcblx0XHRcdFx0XHRcdGNoYXJ0VmlzdWFsaXphdGlvbi5pZCA9IGdldENoYXJ0SUQoKGNvbmZpZyBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb24pLmtleSB8fCBcIlwiLCBcIkNoYXJ0XCIpO1xuXHRcdFx0XHRcdFx0Y2hhcnRWaXN1YWxpemF0aW9uLm11bHRpVmlld3MgPSB0cnVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zLmZvckVhY2goKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uKSA9PiB7XG5cdFx0XHRpZiAodmlzdWFsaXphdGlvbkRlZmluaXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuVGFibGUpIHtcblx0XHRcdFx0dGFibGVDb250cm9sSWQgPSB2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmlkO1xuXHRcdFx0fSBlbHNlIGlmICh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCkge1xuXHRcdFx0XHRjaGFydENvbnRyb2xJZCA9IHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLmlkO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0Y29uc3QgdmlzaWJsZSA9IGNvbmZpZy52aXNpYmxlO1xuXHRcdHJldHVybiB7XG5cdFx0XHRwcmVzZW50YXRpb24sXG5cdFx0XHR0YWJsZUNvbnRyb2xJZCxcblx0XHRcdGNoYXJ0Q29udHJvbElkLFxuXHRcdFx0dGl0bGUsXG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50UGF0aCxcblx0XHRcdHZpc2libGVcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBDdXN0b21WaWV3Q29uZmlndXJhdGlvbjtcblx0XHRjb25zdCB0aXRsZSA9IGNvbmZpZy5sYWJlbCxcblx0XHRcdGZyYWdtZW50ID0gY29uZmlnLnRlbXBsYXRlLFxuXHRcdFx0dHlwZSA9IGNvbmZpZy50eXBlLFxuXHRcdFx0Y3VzdG9tVGFiSWQgPSBnZXRDdXN0b21UYWJJRChjb25maWcua2V5IHx8IFwiXCIpLFxuXHRcdFx0dmlzaWJsZSA9IGNvbmZpZy52aXNpYmxlO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZSxcblx0XHRcdGZyYWdtZW50LFxuXHRcdFx0dHlwZSxcblx0XHRcdGN1c3RvbVRhYklkLFxuXHRcdFx0dmlzaWJsZVxuXHRcdH07XG5cdH1cbn07XG5jb25zdCBnZXRWaWV3cyA9IGZ1bmN0aW9uIChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c2V0dGluZ3NWaWV3czogTXVsdGlwbGVWaWV3c0NvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQsXG5cdGlzSW5zaWdodHNFbmFibGVkPzogYm9vbGVhblxuKTogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW10ge1xuXHRsZXQgdmlld0NvbnZlcnRlckNvbmZpZ3M6IFZpZXdDb252ZXJ0ZXJTZXR0aW5nc1tdID0gW107XG5cdGlmIChzZXR0aW5nc1ZpZXdzKSB7XG5cdFx0c2V0dGluZ3NWaWV3cy5wYXRocy5mb3JFYWNoKChwYXRoOiBWaWV3UGF0aENvbmZpZ3VyYXRpb24gfCBDdXN0b21WaWV3VGVtcGxhdGVDb25maWd1cmF0aW9uKSA9PiB7XG5cdFx0XHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKHBhdGggYXMgVmlld1BhdGhDb25maWd1cmF0aW9uKSkge1xuXHRcdFx0XHRpZiAoc2V0dGluZ3NWaWV3cy5wYXRocy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQUxQIGZsYXZvciBjYW5ub3QgaGF2ZSBtdWx0aXBsZSB2aWV3c1wiKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwYXRoID0gcGF0aCBhcyBDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbjtcblx0XHRcdFx0XHR2aWV3Q29udmVydGVyQ29uZmlncy5wdXNoKHtcblx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRwcmltYXJ5OiBwYXRoLnByaW1hcnksXG5cdFx0XHRcdFx0XHRzZWNvbmRhcnk6IHBhdGguc2Vjb25kYXJ5LFxuXHRcdFx0XHRcdFx0ZGVmYXVsdFBhdGg6IHBhdGguZGVmYXVsdFBhdGhcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICgocGF0aCBhcyBDdXN0b21WaWV3Q29uZmlndXJhdGlvbikudGVtcGxhdGUpIHtcblx0XHRcdFx0cGF0aCA9IHBhdGggYXMgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb247XG5cdFx0XHRcdHZpZXdDb252ZXJ0ZXJDb25maWdzLnB1c2goe1xuXHRcdFx0XHRcdGtleTogcGF0aC5rZXksXG5cdFx0XHRcdFx0bGFiZWw6IHBhdGgubGFiZWwsXG5cdFx0XHRcdFx0dGVtcGxhdGU6IHBhdGgudGVtcGxhdGUsXG5cdFx0XHRcdFx0dHlwZTogXCJDdXN0b21cIixcblx0XHRcdFx0XHR2aXNpYmxlOiBwYXRoLnZpc2libGVcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwYXRoID0gcGF0aCBhcyBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0XHRcdGNvbnN0IHZpZXdDb252ZXJ0ZXJDb250ZXh0ID0gY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZXJDb250ZXh0Rm9yKFxuXHRcdFx0XHRcdFx0cGF0aC5jb250ZXh0UGF0aCB8fCAocGF0aC5lbnRpdHlTZXQgJiYgYC8ke3BhdGguZW50aXR5U2V0fWApIHx8IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0ZW50aXR5VHlwZSA9IHZpZXdDb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0XHRcdFx0aWYgKGVudGl0eVR5cGUgJiYgdmlld0NvbnZlcnRlckNvbnRleHQpIHtcblx0XHRcdFx0XHRsZXQgYW5ub3RhdGlvbjtcblx0XHRcdFx0XHRjb25zdCByZXNvbHZlZFRhcmdldCA9IHZpZXdDb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKHBhdGguYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0XHRcdGNvbnN0IHRhcmdldEFubm90YXRpb24gPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uIGFzIERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG5cdFx0XHRcdFx0aWYgKHRhcmdldEFubm90YXRpb24pIHtcblx0XHRcdFx0XHRcdGFubm90YXRpb24gPVxuXHRcdFx0XHRcdFx0XHR0YXJnZXRBbm5vdGF0aW9uLnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblZhcmlhbnRcblx0XHRcdFx0XHRcdFx0XHQ/IGdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKGVudGl0eVR5cGUsIHZpZXdDb252ZXJ0ZXJDb250ZXh0LCBmYWxzZSlcblx0XHRcdFx0XHRcdFx0XHQ6IHRhcmdldEFubm90YXRpb247XG5cdFx0XHRcdFx0XHR2aWV3Q29udmVydGVyQ29uZmlncy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogdmlld0NvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb24sXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBwYXRoLmFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0XHRrZWVwUHJldmlvdXNQZXJzb25hbGl6YXRpb246IHBhdGgua2VlcFByZXZpb3VzUGVyc29uYWxpemF0aW9uLFxuXHRcdFx0XHRcdFx0XHRrZXk6IHBhdGgua2V5LFxuXHRcdFx0XHRcdFx0XHR2aXNpYmxlOiBwYXRoLnZpc2libGVcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBUT0RPIERpYWdub3N0aWNzIG1lc3NhZ2Vcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0XHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZSkge1xuXHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MgPSBnZXRBbHBWaWV3Q29uZmlnKGNvbnZlcnRlckNvbnRleHQsIHZpZXdDb252ZXJ0ZXJDb25maWdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdGFubm90YXRpb246IGdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQsIGZhbHNlKSxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogY29udmVydGVyQ29udGV4dFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB2aWV3Q29udmVydGVyQ29uZmlncy5tYXAoKHZpZXdDb252ZXJ0ZXJDb25maWcpID0+IHtcblx0XHRyZXR1cm4gZ2V0Vmlldyh2aWV3Q29udmVydGVyQ29uZmlnLCBpc0luc2lnaHRzRW5hYmxlZCk7XG5cdH0pO1xufTtcbmNvbnN0IGdldE11bHRpVmlld3NDb250cm9sID0gZnVuY3Rpb24gKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHR2aWV3czogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW11cbik6IE11bHRpVmlld3NDb250cm9sQ29uZmlndXJhdGlvbiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IHZpZXdzRGVmaW5pdGlvbjogTXVsdGlwbGVWaWV3c0NvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQgPSBtYW5pZmVzdFdyYXBwZXIuZ2V0Vmlld0NvbmZpZ3VyYXRpb24oKTtcblx0aWYgKHZpZXdzLmxlbmd0aCA+IDEgJiYgIWhhc011bHRpVmlzdWFsaXphdGlvbnMoY29udmVydGVyQ29udGV4dCkpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2hvd1RhYkNvdW50czogdmlld3NEZWZpbml0aW9uID8gdmlld3NEZWZpbml0aW9uPy5zaG93Q291bnRzIHx8IG1hbmlmZXN0V3JhcHBlci5oYXNNdWx0aXBsZUVudGl0eVNldHMoKSA6IHVuZGVmaW5lZCwgLy8gd2l0aCBtdWx0aSBFbnRpdHlTZXRzLCB0YWIgY291bnRzIGFyZSBkaXNwbGF5ZWQgYnkgZGVmYXVsdFxuXHRcdFx0aWQ6IGdldEljb25UYWJCYXJJRCgpXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcbmZ1bmN0aW9uIGdldEFscFZpZXdDb25maWcoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCwgdmlld0NvbmZpZ3M6IFZpZXdDb252ZXJ0ZXJTZXR0aW5nc1tdKTogVmlld0NvbnZlcnRlclNldHRpbmdzW10ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IGFubm90YXRpb24gPSBnZXRDb21wbGlhbnRWaXN1YWxpemF0aW9uQW5ub3RhdGlvbihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0LCB0cnVlKTtcblx0bGV0IGNoYXJ0LCB0YWJsZTtcblx0aWYgKGFubm90YXRpb24pIHtcblx0XHR2aWV3Q29uZmlncy5wdXNoKHtcblx0XHRcdGFubm90YXRpb246IGFubm90YXRpb24sXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0Y2hhcnQgPSBnZXREZWZhdWx0Q2hhcnQoZW50aXR5VHlwZSk7XG5cdFx0dGFibGUgPSBnZXREZWZhdWx0TGluZUl0ZW0oZW50aXR5VHlwZSk7XG5cdFx0aWYgKGNoYXJ0ICYmIHRhYmxlKSB7XG5cdFx0XHRjb25zdCBwcmltYXJ5OiBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb25bXSA9IFt7IGFubm90YXRpb25QYXRoOiBcIkBcIiArIGNoYXJ0LnRlcm0gfV07XG5cdFx0XHRjb25zdCBzZWNvbmRhcnk6IFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbltdID0gW3sgYW5ub3RhdGlvblBhdGg6IFwiQFwiICsgdGFibGUudGVybSB9XTtcblx0XHRcdHZpZXdDb25maWdzLnB1c2goe1xuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRwcmltYXJ5OiBwcmltYXJ5LFxuXHRcdFx0XHRzZWNvbmRhcnk6IHNlY29uZGFyeSxcblx0XHRcdFx0ZGVmYXVsdFBhdGg6IFwiYm90aFwiXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQUxQIGZsYXZvciBuZWVkcyBib3RoIGNoYXJ0IGFuZCB0YWJsZSB0byBsb2FkIHRoZSBhcHBsaWNhdGlvblwiKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHZpZXdDb25maWdzO1xufVxuZnVuY3Rpb24gaGFzTXVsdGlWaXN1YWxpemF0aW9ucyhjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogYm9vbGVhbiB7XG5cdHJldHVybiAoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKCkgfHxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlXG5cdCk7XG59XG5leHBvcnQgY29uc3QgZ2V0SGVhZGVyQWN0aW9ucyA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQmFzZUFjdGlvbltdIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0cmV0dXJuIGluc2VydEN1c3RvbUVsZW1lbnRzPEJhc2VBY3Rpb24+KFtdLCBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KG1hbmlmZXN0V3JhcHBlci5nZXRIZWFkZXJBY3Rpb25zKCksIGNvbnZlcnRlckNvbnRleHQpLmFjdGlvbnMpO1xufTtcbmV4cG9ydCBjb25zdCBjaGVja0NoYXJ0RmlsdGVyQmFySWQgPSBmdW5jdGlvbiAodmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdLCBmaWx0ZXJCYXJJZDogc3RyaW5nKSB7XG5cdHZpZXdzLmZvckVhY2goKHZpZXcpID0+IHtcblx0XHRpZiAoISh2aWV3IGFzIEN1c3RvbVZpZXdEZWZpbml0aW9uKS50eXBlKSB7XG5cdFx0XHRjb25zdCBwcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiA9ICh2aWV3IGFzIFNpbmdsZVZpZXdEZWZpbml0aW9uKS5wcmVzZW50YXRpb247XG5cdFx0XHRwcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnMuZm9yRWFjaCgodmlzdWFsaXphdGlvbkRlZmluaXRpb24pID0+IHtcblx0XHRcdFx0aWYgKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0ICYmIHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLmZpbHRlcklkICE9PSBmaWx0ZXJCYXJJZCkge1xuXHRcdFx0XHRcdHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLmZpbHRlcklkID0gZmlsdGVyQmFySWQ7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSk7XG59O1xuLyoqXG4gKiBDcmVhdGVzIHRoZSBMaXN0UmVwb3J0RGVmaW5pdGlvbiBmb3IgbXVsdGlwbGUgZW50aXR5IHNldHMgKG11bHRpcGxlIHRhYmxlIG1vZGUpLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGlzSW5zaWdodHNFbmFibGVkXG4gKiBAcmV0dXJucyBUaGUgbGlzdCByZXBvcnQgZGVmaW5pdGlvbiBiYXNlZCBvbiBhbm5vdGF0aW9uICsgbWFuaWZlc3RcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbnZlcnRQYWdlID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIGlzSW5zaWdodHNFbmFibGVkPzogYm9vbGVhbik6IExpc3RSZXBvcnREZWZpbml0aW9uIHtcblx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRjb25zdCBzQ29udGV4dFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKCk7XG5cdGlmICghc0NvbnRleHRQYXRoKSB7XG5cdFx0Ly8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBlbnRpdHlTZXQgYXQgdGhpcyBwb2ludCB3ZSBoYXZlIGFuIGlzc3VlIEknZCBzYXlcblx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcIkFuIEVudGl0eVNldCBpcyByZXF1aXJlZCB0byBiZSBhYmxlIHRvIGRpc3BsYXkgYSBMaXN0UmVwb3J0LCBwbGVhc2UgYWRqdXN0IHlvdXIgYGVudGl0eVNldGAgcHJvcGVydHkgdG8gcG9pbnQgdG8gb25lLlwiXG5cdFx0KTtcblx0fVxuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCB2aWV3c0RlZmluaXRpb246IE11bHRpcGxlVmlld3NDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkID0gbWFuaWZlc3RXcmFwcGVyLmdldFZpZXdDb25maWd1cmF0aW9uKCk7XG5cdGNvbnN0IGhhc011bHRpcGxlRW50aXR5U2V0cyA9IG1hbmlmZXN0V3JhcHBlci5oYXNNdWx0aXBsZUVudGl0eVNldHMoKTtcblx0Y29uc3Qgdmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdID0gZ2V0Vmlld3MoY29udmVydGVyQ29udGV4dCwgdmlld3NEZWZpbml0aW9uLCBpc0luc2lnaHRzRW5hYmxlZCk7XG5cdGNvbnN0IGxyVGFibGVWaXN1YWxpemF0aW9ucyA9IGdldFRhYmxlVmlzdWFsaXphdGlvbnModmlld3MpO1xuXHRjb25zdCBsckNoYXJ0VmlzdWFsaXphdGlvbnMgPSBnZXRDaGFydFZpc3VhbGl6YXRpb25zKHZpZXdzKTtcblx0Y29uc3Qgc2hvd1Bpbm5hYmxlVG9nZ2xlID0gbHJUYWJsZVZpc3VhbGl6YXRpb25zLnNvbWUoKHRhYmxlKSA9PiB0YWJsZS5jb250cm9sLnR5cGUgPT09IFwiUmVzcG9uc2l2ZVRhYmxlXCIpO1xuXHRsZXQgc2luZ2xlVGFibGVJZCA9IFwiXCI7XG5cdGxldCBzaW5nbGVDaGFydElkID0gXCJcIjtcblx0Y29uc3QgZHluYW1pY0xpc3RSZXBvcnRJZCA9IGdldER5bmFtaWNMaXN0UmVwb3J0SUQoKTtcblx0Y29uc3QgZmlsdGVyQmFySWQgPSBnZXRGaWx0ZXJCYXJJRChzQ29udGV4dFBhdGgpO1xuXHRjb25zdCBmaWx0ZXJWYXJpYW50TWFuYWdlbWVudElEID0gZ2V0RmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRChmaWx0ZXJCYXJJZCk7XG5cdGNvbnN0IGZiQ29uZmlnID0gbWFuaWZlc3RXcmFwcGVyLmdldEZpbHRlckNvbmZpZ3VyYXRpb24oKTtcblx0Y29uc3QgZmlsdGVySW5pdGlhbExheW91dCA9IGZiQ29uZmlnPy5pbml0aWFsTGF5b3V0ICE9PSB1bmRlZmluZWQgPyBmYkNvbmZpZz8uaW5pdGlhbExheW91dC50b0xvd2VyQ2FzZSgpIDogXCJjb21wYWN0XCI7XG5cdGNvbnN0IGZpbHRlckxheW91dCA9IGZiQ29uZmlnPy5sYXlvdXQgIT09IHVuZGVmaW5lZCA/IGZiQ29uZmlnPy5sYXlvdXQudG9Mb3dlckNhc2UoKSA6IFwiY29tcGFjdFwiO1xuXHRjb25zdCB1c2VTZW1hbnRpY0RhdGVSYW5nZSA9IGZiQ29uZmlnLnVzZVNlbWFudGljRGF0ZVJhbmdlICE9PSB1bmRlZmluZWQgPyBmYkNvbmZpZy51c2VTZW1hbnRpY0RhdGVSYW5nZSA6IHRydWU7XG5cdGNvbnN0IHNob3dDbGVhckJ1dHRvbiA9IGZiQ29uZmlnLnNob3dDbGVhckJ1dHRvbiAhPT0gdW5kZWZpbmVkID8gZmJDb25maWcuc2hvd0NsZWFyQnV0dG9uIDogZmFsc2U7XG5cdGNvbnN0IG9Db25maWcgPSBnZXRDb250ZW50QXJlYUlkKGNvbnZlcnRlckNvbnRleHQsIHZpZXdzKTtcblx0aWYgKG9Db25maWcpIHtcblx0XHRzaW5nbGVDaGFydElkID0gb0NvbmZpZy5jaGFydElkO1xuXHRcdHNpbmdsZVRhYmxlSWQgPSBvQ29uZmlnLnRhYmxlSWQ7XG5cdH1cblx0Y29uc3QgdXNlSGlkZGVuRmlsdGVyQmFyID0gbWFuaWZlc3RXcmFwcGVyLnVzZUhpZGRlbkZpbHRlckJhcigpO1xuXHQvLyBDaGFydCBoYXMgYSBkZXBlbmRlbmN5IHRvIGZpbHRlciBiYXIgKGlzc3VlIHdpdGggbG9hZGluZyBkYXRhKS4gT25jZSByZXNvbHZlZCwgdGhlIGNoZWNrIGZvciBjaGFydCBzaG91bGQgYmUgcmVtb3ZlZCBoZXJlLlxuXHQvLyBVbnRpbCB0aGVuLCBoaWRpbmcgZmlsdGVyIGJhciBpcyBub3cgYWxsb3dlZCBpZiBhIGNoYXJ0IGlzIGJlaW5nIHVzZWQgb24gTFIuXG5cdGNvbnN0IGhpZGVGaWx0ZXJCYXIgPSAobWFuaWZlc3RXcmFwcGVyLmlzRmlsdGVyQmFySGlkZGVuKCkgfHwgdXNlSGlkZGVuRmlsdGVyQmFyKSAmJiBzaW5nbGVDaGFydElkID09PSBcIlwiO1xuXHRjb25zdCBsckZpbHRlclByb3BlcnRpZXMgPSBnZXRTZWxlY3Rpb25GaWVsZHMoY29udmVydGVyQ29udGV4dCwgbHJUYWJsZVZpc3VhbGl6YXRpb25zKTtcblx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzID0gbHJGaWx0ZXJQcm9wZXJ0aWVzLnNlbGVjdGlvbkZpZWxkcztcblx0Y29uc3QgcHJvcGVydHlJbmZvRmllbGRzID0gbHJGaWx0ZXJQcm9wZXJ0aWVzLnNQcm9wZXJ0eUluZm87XG5cdGNvbnN0IGhpZGVCYXNpY1NlYXJjaCA9IGdldEZpbHRlckJhckhpZGVCYXNpY1NlYXJjaChsclRhYmxlVmlzdWFsaXphdGlvbnMsIGxyQ2hhcnRWaXN1YWxpemF0aW9ucywgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG11bHRpVmlld0NvbnRyb2wgPSBnZXRNdWx0aVZpZXdzQ29udHJvbChjb252ZXJ0ZXJDb250ZXh0LCB2aWV3cyk7XG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBtdWx0aVZpZXdDb250cm9sID8gdW5kZWZpbmVkIDogZ2V0U2VsZWN0aW9uVmFyaWFudChlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgZGVmYXVsdFNlbWFudGljRGF0ZXMgPSB1c2VTZW1hbnRpY0RhdGVSYW5nZSA/IGdldERlZmF1bHRTZW1hbnRpY0RhdGVzKGdldE1hbmlmZXN0RmlsdGVyRmllbGRzKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpKSA6IHt9O1xuXHQvLyBTb3J0IGhlYWRlciBhY3Rpb25zIGFjY29yZGluZyB0byBwb3NpdGlvbiBhdHRyaWJ1dGVzIGluIG1hbmlmZXN0XG5cdGNvbnN0IGhlYWRlckFjdGlvbnMgPSBnZXRIZWFkZXJBY3Rpb25zKGNvbnZlcnRlckNvbnRleHQpO1xuXHRpZiAoaGFzTXVsdGlwbGVFbnRpdHlTZXRzKSB7XG5cdFx0Y2hlY2tDaGFydEZpbHRlckJhcklkKHZpZXdzLCBmaWx0ZXJCYXJJZCk7XG5cdH1cblx0Y29uc3QgdmlzdWFsaXphdGlvbklkcyA9IGxyVGFibGVWaXN1YWxpemF0aW9uc1xuXHRcdC5tYXAoKHZpc3VhbGl6YXRpb24pID0+IHtcblx0XHRcdHJldHVybiB2aXN1YWxpemF0aW9uLmFubm90YXRpb24uaWQ7XG5cdFx0fSlcblx0XHQuY29uY2F0KFxuXHRcdFx0bHJDaGFydFZpc3VhbGl6YXRpb25zLm1hcCgodmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmlzdWFsaXphdGlvbi5pZDtcblx0XHRcdH0pXG5cdFx0KTtcblx0Y29uc3QgdGFyZ2V0Q29udHJvbElkcyA9IFtcblx0XHQuLi4oaGlkZUZpbHRlckJhciAmJiAhdXNlSGlkZGVuRmlsdGVyQmFyID8gW10gOiBbZmlsdGVyQmFySWRdKSxcblx0XHQuLi4obWFuaWZlc3RXcmFwcGVyLmdldFZhcmlhbnRNYW5hZ2VtZW50KCkgIT09IFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sID8gdmlzdWFsaXphdGlvbklkcyA6IFtdKSxcblx0XHQuLi4obXVsdGlWaWV3Q29udHJvbCA/IFttdWx0aVZpZXdDb250cm9sLmlkXSA6IFtdKVxuXHRdO1xuXHRjb25zdCBzdGlja3lTdWJoZWFkZXJQcm92aWRlciA9XG5cdFx0bXVsdGlWaWV3Q29udHJvbCAmJiBtYW5pZmVzdFdyYXBwZXIuZ2V0U3RpY2t5TXVsdGlUYWJIZWFkZXJDb25maWd1cmF0aW9uKCkgPyBtdWx0aVZpZXdDb250cm9sLmlkIDogdW5kZWZpbmVkO1xuXHRyZXR1cm4ge1xuXHRcdG1haW5FbnRpdHlTZXQ6IHNDb250ZXh0UGF0aCxcblx0XHRtYWluRW50aXR5VHlwZTogYCR7c0NvbnRleHRQYXRofS9gLFxuXHRcdG11bHRpVmlld3NDb250cm9sOiBtdWx0aVZpZXdDb250cm9sLFxuXHRcdHN0aWNreVN1YmhlYWRlclByb3ZpZGVyLFxuXHRcdHNpbmdsZVRhYmxlSWQsXG5cdFx0c2luZ2xlQ2hhcnRJZCxcblx0XHRkeW5hbWljTGlzdFJlcG9ydElkLFxuXHRcdGhlYWRlckFjdGlvbnMsXG5cdFx0c2hvd1Bpbm5hYmxlVG9nZ2xlOiBzaG93UGlubmFibGVUb2dnbGUsXG5cdFx0ZmlsdGVyQmFyOiB7XG5cdFx0XHRwcm9wZXJ0eUluZm86IHByb3BlcnR5SW5mb0ZpZWxkcyxcblx0XHRcdHNlbGVjdGlvbkZpZWxkcyxcblx0XHRcdGhpZGVCYXNpY1NlYXJjaCxcblx0XHRcdHNob3dDbGVhckJ1dHRvblxuXHRcdH0sXG5cdFx0dmlld3M6IHZpZXdzLFxuXHRcdGZpbHRlckJhcklkOiBoaWRlRmlsdGVyQmFyICYmICF1c2VIaWRkZW5GaWx0ZXJCYXIgPyBcIlwiIDogZmlsdGVyQmFySWQsXG5cdFx0ZmlsdGVyQ29uZGl0aW9uczoge1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudDogc2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdGRlZmF1bHRTZW1hbnRpY0RhdGVzOiBkZWZhdWx0U2VtYW50aWNEYXRlc1xuXHRcdH0sXG5cdFx0dmFyaWFudE1hbmFnZW1lbnQ6IHtcblx0XHRcdGlkOiBmaWx0ZXJWYXJpYW50TWFuYWdlbWVudElELFxuXHRcdFx0dGFyZ2V0Q29udHJvbElkczogdGFyZ2V0Q29udHJvbElkcy5qb2luKFwiLFwiKVxuXHRcdH0sXG5cdFx0aGFzTXVsdGlWaXN1YWxpemF0aW9uczogaGFzTXVsdGlWaXN1YWxpemF0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHR0ZW1wbGF0ZVR5cGU6IG1hbmlmZXN0V3JhcHBlci5nZXRUZW1wbGF0ZVR5cGUoKSxcblx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRmaWx0ZXJJbml0aWFsTGF5b3V0LFxuXHRcdGZpbHRlckxheW91dCxcblx0XHRrcGlEZWZpbml0aW9uczogZ2V0S1BJRGVmaW5pdGlvbnMoY29udmVydGVyQ29udGV4dCksXG5cdFx0aGlkZUZpbHRlckJhcixcblx0XHR1c2VIaWRkZW5GaWx0ZXJCYXJcblx0fTtcbn07XG5mdW5jdGlvbiBnZXRDb250ZW50QXJlYUlkKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIHZpZXdzOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXSk6IENvbnRlbnRBcmVhSUQgfCB1bmRlZmluZWQge1xuXHRsZXQgc2luZ2xlVGFibGVJZCA9IFwiXCIsXG5cdFx0c2luZ2xlQ2hhcnRJZCA9IFwiXCI7XG5cdGlmIChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSB8fFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0KSB7XG5cdFx0Zm9yIChjb25zdCBsclZpZXcgb2Ygdmlld3MpIHtcblx0XHRcdGNvbnN0IHZpZXc6IENvbWJpbmVkVmlld0RlZmluaXRpb24gPSBsclZpZXcgYXMgQ29tYmluZWRWaWV3RGVmaW5pdGlvbjtcblx0XHRcdGlmICh2aWV3LmNoYXJ0Q29udHJvbElkICYmIHZpZXcudGFibGVDb250cm9sSWQpIHtcblx0XHRcdFx0c2luZ2xlQ2hhcnRJZCA9IHZpZXcuY2hhcnRDb250cm9sSWQ7XG5cdFx0XHRcdHNpbmdsZVRhYmxlSWQgPSB2aWV3LnRhYmxlQ29udHJvbElkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yIChjb25zdCBsclZpZXcgb2Ygdmlld3MpIHtcblx0XHRcdGNvbnN0IHZpZXc6IFNpbmdsZVZpZXdEZWZpbml0aW9uID0gbHJWaWV3IGFzIFNpbmdsZVZpZXdEZWZpbml0aW9uO1xuXHRcdFx0aWYgKCFzaW5nbGVUYWJsZUlkICYmICh2aWV3IGFzIFNpbmdsZVRhYmxlVmlld0RlZmluaXRpb24pLnRhYmxlQ29udHJvbElkKSB7XG5cdFx0XHRcdHNpbmdsZVRhYmxlSWQgPSAodmlldyBhcyBTaW5nbGVUYWJsZVZpZXdEZWZpbml0aW9uKS50YWJsZUNvbnRyb2xJZCB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFzaW5nbGVDaGFydElkICYmICh2aWV3IGFzIFNpbmdsZUNoYXJ0Vmlld0RlZmluaXRpb24pLmNoYXJ0Q29udHJvbElkKSB7XG5cdFx0XHRcdHNpbmdsZUNoYXJ0SWQgPSAodmlldyBhcyBTaW5nbGVDaGFydFZpZXdEZWZpbml0aW9uKS5jaGFydENvbnRyb2xJZCB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNpbmdsZUNoYXJ0SWQgJiYgc2luZ2xlVGFibGVJZCkge1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0aWYgKHNpbmdsZVRhYmxlSWQgfHwgc2luZ2xlQ2hhcnRJZCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjaGFydElkOiBzaW5nbGVDaGFydElkLFxuXHRcdFx0dGFibGVJZDogc2luZ2xlVGFibGVJZFxuXHRcdH07XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW1KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQSxzQkFBc0IsQ0FBQ0MsS0FBaUMsRUFBd0I7SUFDeEYsTUFBTUMsTUFBNEIsR0FBRyxFQUFFO0lBQ3ZDRCxLQUFLLENBQUNFLE9BQU8sQ0FBQyxVQUFVQyxJQUFJLEVBQUU7TUFDN0IsSUFBSSxDQUFFQSxJQUFJLENBQTBCQyxJQUFJLEVBQUU7UUFDekMsTUFBTUMsY0FBYyxHQUFJRixJQUFJLENBQTRCRyxzQkFBc0IsR0FDMUVILElBQUksQ0FBNEJHLHNCQUFzQixDQUFDRCxjQUFjLEdBQ3JFRixJQUFJLENBQTBCSSxZQUFZLENBQUNGLGNBQWM7UUFDN0RBLGNBQWMsQ0FBQ0gsT0FBTyxDQUFDLFVBQVVNLGFBQWEsRUFBRTtVQUMvQyxJQUFJQSxhQUFhLENBQUNKLElBQUksS0FBS0ssaUJBQWlCLENBQUNDLEtBQUssRUFBRTtZQUNuRFQsTUFBTSxDQUFDVSxJQUFJLENBQUNILGFBQWEsQ0FBQztVQUMzQjtRQUNELENBQUMsQ0FBQztNQUNIO0lBQ0QsQ0FBQyxDQUFDO0lBQ0YsT0FBT1AsTUFBTTtFQUNkO0VBQ0EsU0FBU1csc0JBQXNCLENBQUNaLEtBQWlDLEVBQXdCO0lBQ3hGLE1BQU1hLE1BQTRCLEdBQUcsRUFBRTtJQUN2Q2IsS0FBSyxDQUFDRSxPQUFPLENBQUMsVUFBVUMsSUFBSSxFQUFFO01BQzdCLElBQUksQ0FBRUEsSUFBSSxDQUEwQkMsSUFBSSxFQUFFO1FBQ3pDLE1BQU1DLGNBQWMsR0FBSUYsSUFBSSxDQUE0Qlcsb0JBQW9CLEdBQ3hFWCxJQUFJLENBQTRCVyxvQkFBb0IsQ0FBQ1QsY0FB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
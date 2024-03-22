/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/MetaModelConverter", "sap/fe/macros/CommonHelper", "../../ManifestSettings", "./Chart", "./Table"], function (IssueManager, MetaModelConverter, CommonHelper, ManifestSettings, Chart, Table) {
  "use strict";

  var _exports = {};
  var createChartVisualization = Chart.createChartVisualization;
  var createBlankChartVisualization = Chart.createBlankChartVisualization;
  var TemplateType = ManifestSettings.TemplateType;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  const getVisualizationsFromPresentationVariant = function (presentationVariantAnnotation, visualizationPath, converterContext, isMacroOrMultipleView) {
    const visualizationAnnotations = [];
    const isALP = isAlpAnnotation(converterContext);
    const baseVisualizationPath = visualizationPath.split("@")[0];
    if ((isMacroOrMultipleView === true || isALP) && !isPresentationCompliant(presentationVariantAnnotation, isALP)) {
      if (!annotationExistsInPresentationVariant(presentationVariantAnnotation, "com.sap.vocabularies.UI.v1.LineItem")) {
        const defaultLineItemAnnotation = prepareDefaultVisualization("com.sap.vocabularies.UI.v1.LineItem", baseVisualizationPath, converterContext);
        if (defaultLineItemAnnotation) {
          visualizationAnnotations.push(defaultLineItemAnnotation);
        }
      }
      if (!annotationExistsInPresentationVariant(presentationVariantAnnotation, "com.sap.vocabularies.UI.v1.Chart")) {
        const defaultChartAnnotation = prepareDefaultVisualization("com.sap.vocabularies.UI.v1.Chart", baseVisualizationPath, converterContext);
        if (defaultChartAnnotation) {
          visualizationAnnotations.push(defaultChartAnnotation);
        }
      }
    }
    const visualizations = presentationVariantAnnotation.Visualizations;
    const pushFirstVizOfType = function (allowedTerms) {
      const firstViz = visualizations === null || visualizations === void 0 ? void 0 : visualizations.find(viz => {
        var _viz$$target;
        return allowedTerms.indexOf((_viz$$target = viz.$target) === null || _viz$$target === void 0 ? void 0 : _viz$$target.term) >= 0;
      });
      if (firstViz) {
        visualizationAnnotations.push({
          visualization: firstViz.$target,
          annotationPath: `${baseVisualizationPath}${firstViz.value}`,
          converterContext: converterContext
        });
      }
    };
    if (isALP) {
      // In case of ALP, we use the first LineItem and the first Chart
      pushFirstVizOfType(["com.sap.vocabularies.UI.v1.LineItem"]);
      pushFirstVizOfType(["com.sap.vocabularies.UI.v1.Chart"]);
    } else {
      // Otherwise, we use the first viz only (Chart or LineItem)
      pushFirstVizOfType(["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.Chart"]);
    }
    return visualizationAnnotations;
  };
  _exports.getVisualizationsFromPresentationVariant = getVisualizationsFromPresentationVariant;
  function getSelectionPresentationVariant(entityType, annotationPath, converterContext) {
    if (annotationPath) {
      const resolvedTarget = converterContext.getEntityTypeAnnotation(annotationPath);
      const selectionPresentationVariant = resolvedTarget.annotation;
      if (selectionPresentationVariant) {
        if (selectionPresentationVariant.term === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
          return selectionPresentationVariant;
        }
      } else {
        throw new Error("Annotation Path for the SPV mentioned in the manifest is not found, Please add the SPV in the annotation");
      }
    } else {
      var _entityType$annotatio, _entityType$annotatio2;
      return (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : _entityType$annotatio2.SelectionPresentationVariant;
    }
  }
  _exports.getSelectionPresentationVariant = getSelectionPresentationVariant;
  function isSelectionPresentationCompliant(selectionPresentationVariant, isALP) {
    const presentationVariant = selectionPresentationVariant && selectionPresentationVariant.PresentationVariant;
    if (presentationVariant) {
      return isPresentationCompliant(presentationVariant, isALP);
    } else {
      throw new Error("Presentation Variant is not present in the SPV annotation");
    }
  }
  _exports.isSelectionPresentationCompliant = isSelectionPresentationCompliant;
  function isPresentationCompliant(presentationVariant) {
    let isALP = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let hasTable = false,
      hasChart = false;
    if (isALP) {
      if (presentationVariant !== null && presentationVariant !== void 0 && presentationVariant.Visualizations) {
        const visualizations = presentationVariant.Visualizations;
        visualizations.forEach(visualization => {
          var _visualization$$targe, _visualization$$targe2;
          if (((_visualization$$targe = visualization.$target) === null || _visualization$$targe === void 0 ? void 0 : _visualization$$targe.term) === "com.sap.vocabularies.UI.v1.LineItem") {
            hasTable = true;
          }
          if (((_visualization$$targe2 = visualization.$target) === null || _visualization$$targe2 === void 0 ? void 0 : _visualization$$targe2.term) === "com.sap.vocabularies.UI.v1.Chart") {
            hasChart = true;
          }
        });
      }
      return hasChart && hasTable;
    } else {
      return (presentationVariant === null || presentationVariant === void 0 ? void 0 : presentationVariant.Visualizations) && !!presentationVariant.Visualizations.find(visualization => {
        var _visualization$$targe3, _visualization$$targe4;
        return ((_visualization$$targe3 = visualization.$target) === null || _visualization$$targe3 === void 0 ? void 0 : _visualization$$targe3.term) === "com.sap.vocabularies.UI.v1.LineItem" || ((_visualization$$targe4 = visualization.$target) === null || _visualization$$targe4 === void 0 ? void 0 : _visualization$$targe4.term) === "com.sap.vocabularies.UI.v1.Chart";
      });
    }
  }
  _exports.isPresentationCompliant = isPresentationCompliant;
  function getDefaultLineItem(entityType) {
    var _entityType$annotatio3;
    return (_entityType$annotatio3 = entityType.annotations.UI) === null || _entityType$annotatio3 === void 0 ? void 0 : _entityType$annotatio3.LineItem;
  }
  _exports.getDefaultLineItem = getDefaultLineItem;
  function getDefaultChart(entityType) {
    var _entityType$annotatio4;
    return (_entityType$annotatio4 = entityType.annotations.UI) === null || _entityType$annotatio4 === void 0 ? void 0 : _entityType$annotatio4.Chart;
  }
  _exports.getDefaultChart = getDefaultChart;
  function getDefaultPresentationVariant(entityType) {
    var _entityType$annotatio5, _entityType$annotatio6;
    return (_entityType$annotatio5 = entityType.annotations) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.UI) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.PresentationVariant;
  }
  _exports.getDefaultPresentationVariant = getDefaultPresentationVariant;
  function getDefaultSelectionVariant(entityType) {
    var _entityType$annotatio7, _entityType$annotatio8;
    return (_entityType$annotatio7 = entityType.annotations) === null || _entityType$annotatio7 === void 0 ? void 0 : (_entityType$annotatio8 = _entityType$annotatio7.UI) === null || _entityType$annotatio8 === void 0 ? void 0 : _entityType$annotatio8.SelectionVariant;
  }
  _exports.getDefaultSelectionVariant = getDefaultSelectionVariant;
  function getSelectionVariant(entityType, converterContext) {
    const annotationPath = converterContext.getManifestWrapper().getDefaultTemplateAnnotationPath();
    const selectionPresentationVariant = getSelectionPresentationVariant(entityType, annotationPath, converterContext);
    let selectionVariant;
    if (selectionPresentationVariant) {
      selectionVariant = selectionPresentationVariant.SelectionVariant;
      if (selectionVariant) {
        return selectionVariant;
      }
    } else {
      selectionVariant = getDefaultSelectionVariant(entityType);
      return selectionVariant;
    }
  }
  _exports.getSelectionVariant = getSelectionVariant;
  function getDataVisualizationConfiguration(visualizationPath, isCondensedTableLayoutCompliant, inConverterContext, viewConfiguration, doNotCheckApplySupported, associatedPresentationVariantPath, isMacroOrMultipleView, isInsightsEnabled) {
    const resolvedTarget = visualizationPath !== "" ? inConverterContext.getEntityTypeAnnotation(visualizationPath) : {
      annotation: undefined,
      converterContext: inConverterContext
    };
    const resolvedAssociatedPresentationVariant = associatedPresentationVariantPath ? inConverterContext.getEntityTypeAnnotation(associatedPresentationVariantPath) : null;
    const resolvedVisualization = resolvedTarget.annotation;
    inConverterContext = resolvedTarget.converterContext;
    let visualizationAnnotations = [];
    let presentationVariantAnnotation;
    let presentationPath = "";
    let chartVisualization, tableVisualization;
    const term = resolvedVisualization === null || resolvedVisualization === void 0 ? void 0 : resolvedVisualization.term;
    if (term) {
      switch (term) {
        case "com.sap.vocabularies.UI.v1.LineItem":
        case "com.sap.vocabularies.UI.v1.Chart":
          presentationVariantAnnotation = resolvedAssociatedPresentationVariant === null || resolvedAssociatedPresentationVariant === void 0 ? void 0 : resolvedAssociatedPresentationVariant.annotation;
          visualizationAnnotations.push({
            visualization: resolvedVisualization,
            annotationPath: visualizationPath,
            converterContext: inConverterContext
          });
          break;
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          presentationVariantAnnotation = resolvedVisualization;
          visualizationAnnotations = visualizationAnnotations.concat(getVisualizationsFromPresentationVariant(resolvedVisualization, visualizationPath, inConverterContext, isMacroOrMultipleView));
          break;
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          presentationVariantAnnotation = resolvedVisualization.PresentationVariant;
          // Presentation can be inline or outside the SelectionPresentationVariant
          presentationPath = presentationVariantAnnotation.fullyQualifiedName;
          visualizationAnnotations = visualizationAnnotations.concat(getVisualizationsFromPresentationVariant(presentationVariantAnnotation, visualizationPath, inConverterContext, isMacroOrMultipleView));
          break;
        default:
          break;
      }
      visualizationAnnotations.forEach(visualizationAnnotation => {
        const {
          visualization,
          annotationPath,
          converterContext
        } = visualizationAnnotation;
        switch (visualization.term) {
          case "com.sap.vocabularies.UI.v1.Chart":
            chartVisualization = createChartVisualization(visualization, annotationPath, converterContext, doNotCheckApplySupported, viewConfiguration, isInsightsEnabled);
            break;
          case "com.sap.vocabularies.UI.v1.LineItem":
          default:
            tableVisualization = Table.createTableVisualization(visualization, annotationPath, converterContext, presentationVariantAnnotation, isCondensedTableLayoutCompliant, viewConfiguration, isInsightsEnabled);
            break;
        }
      });
    }
    const visualizations = [];
    let path = term === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant" ? presentationPath : resolvedVisualization === null || resolvedVisualization === void 0 ? void 0 : resolvedVisualization.fullyQualifiedName;
    if (path === undefined) {
      path = "/";
    }
    const isALP = isAlpAnnotation(inConverterContext);
    if (!term || isALP && tableVisualization === undefined) {
      tableVisualization = Table.createDefaultTableVisualization(inConverterContext, isMacroOrMultipleView !== true);
      inConverterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.MISSING_LINEITEM);
    }
    if (isALP && chartVisualization === undefined) {
      chartVisualization = createBlankChartVisualization(inConverterContext);
      inConverterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Medium, IssueType.MISSING_CHART);
    }
    if (chartVisualization) {
      visualizations.push(chartVisualization);
    }
    if (tableVisualization) {
      visualizations.push(tableVisualization);
    }
    return {
      visualizations: visualizations,
      annotationPath: inConverterContext.getEntitySetBasedAnnotationPath(path)
    };
  }
  /**
   * Returns the context of the UI controls (either a UI.LineItem, or a UI.Chart).
   *
   * @function
   * @name getUiControl
   * @param presentationContext Object of the presentation context (either a presentation variant, or a UI.LineItem, or a UI.Chart)
   * @param controlPath Control path
   * @returns The context of the control (either a UI.LineItem, or a UI.Chart)
   */
  _exports.getDataVisualizationConfiguration = getDataVisualizationConfiguration;
  function getUiControl(presentationContext, controlPath) {
    CommonHelper.validatePresentationMetaPath(presentationContext.getPath(), controlPath);
    const presentation = MetaModelConverter.convertMetaModelContext(presentationContext),
      presentationVariantPath = CommonHelper.createPresentationPathContext(presentationContext),
      model = presentationContext.getModel();
    if (presentation) {
      if (CommonHelper._isPresentationVariantAnnotation(presentationVariantPath.getPath())) {
        const visualizations = presentation.PresentationVariant ? presentation.PresentationVariant.Visualizations : presentation.Visualizations;
        if (Array.isArray(visualizations)) {
          for (const visualization of visualizations) {
            if (visualization.type == "AnnotationPath" && visualization.value.indexOf(controlPath) !== -1 &&
            // check if object exists for PresentationVariant visualization
            !!model.getMetaContext(presentationContext.getPath().split("@")[0] + visualization.value).getObject()) {
              controlPath = visualization.value;
              break;
            }
          }
        }
      } else {
        return presentationContext;
      }
    }
    return model.getMetaContext(presentationContext.getPath().split("@")[0] + controlPath);
  }
  _exports.getUiControl = getUiControl;
  const annotationExistsInPresentationVariant = function (presentationVariantAnnotation, annotationTerm) {
    var _presentationVariantA;
    return ((_presentationVariantA = presentationVariantAnnotation.Visualizations) === null || _presentationVariantA === void 0 ? void 0 : _presentationVariantA.some(visualization => visualization.value.indexOf(annotationTerm) > -1)) ?? false;
  };
  _exports.annotationExistsInPresentationVariant = annotationExistsInPresentationVariant;
  const prepareDefaultVisualization = function (visualizationType, baseVisualizationPath, converterContext) {
    const entityType = converterContext.getEntityType();
    const defaultAnnotation = visualizationType === "com.sap.vocabularies.UI.v1.LineItem" ? getDefaultLineItem(entityType) : getDefaultChart(entityType);
    if (defaultAnnotation) {
      return {
        visualization: defaultAnnotation,
        annotationPath: `${baseVisualizationPath}${converterContext.getRelativeAnnotationPath(defaultAnnotation.fullyQualifiedName, entityType)}`,
        converterContext: converterContext
      };
    }
    return undefined;
  };
  _exports.prepareDefaultVisualization = prepareDefaultVisualization;
  const isAlpAnnotation = function (converterContext) {
    return converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
  };
  _exports.isAlpAnnotation = isAlpAnnotation;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50IiwicHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24iLCJ2aXN1YWxpemF0aW9uUGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJpc01hY3JvT3JNdWx0aXBsZVZpZXciLCJ2aXN1YWxpemF0aW9uQW5ub3RhdGlvbnMiLCJpc0FMUCIsImlzQWxwQW5ub3RhdGlvbiIsImJhc2VWaXN1YWxpemF0aW9uUGF0aCIsInNwbGl0IiwiaXNQcmVzZW50YXRpb25Db21wbGlhbnQiLCJhbm5vdGF0aW9uRXhpc3RzSW5QcmVzZW50YXRpb25WYXJpYW50IiwiZGVmYXVsdExpbmVJdGVtQW5ub3RhdGlvbiIsInByZXBhcmVEZWZhdWx0VmlzdWFsaXphdGlvbiIsInB1c2giLCJkZWZhdWx0Q2hhcnRBbm5vdGF0aW9uIiwidmlzdWFsaXphdGlvbnMiLCJWaXN1YWxpemF0aW9ucyIsInB1c2hGaXJzdFZpek9mVHlwZSIsImFsbG93ZWRUZXJtcyIsImZpcnN0Vml6IiwiZmluZCIsInZpeiIsImluZGV4T2YiLCIkdGFyZ2V0IiwidGVybSIsInZpc3VhbGl6YXRpb24iLCJhbm5vdGF0aW9uUGF0aCIsInZhbHVlIiwiZ2V0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCIsImVudGl0eVR5cGUiLCJyZXNvbHZlZFRhcmdldCIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwic2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCIsImFubm90YXRpb24iLCJFcnJvciIsImFubm90YXRpb25zIiwiVUkiLCJTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50IiwiaXNTZWxlY3Rpb25QcmVzZW50YXRpb25Db21wbGlhbnQiLCJwcmVzZW50YXRpb25WYXJpYW50IiwiUHJlc2VudGF0aW9uVmFyaWFudCIsImhhc1RhYmxlIiwiaGFzQ2hhcnQiLCJmb3JFYWNoIiwiZ2V0RGVmYXVsdExpbmVJdGVtIiwiTGluZUl0ZW0iLCJnZXREZWZhdWx0Q2hhcnQiLCJDaGFydCIsImdldERlZmF1bHRQcmVzZW50YXRpb25WYXJpYW50IiwiZ2V0RGVmYXVsdFNlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwiZ2V0U2VsZWN0aW9uVmFyaWFudCIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldERlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoIiwic2VsZWN0aW9uVmFyaWFudCIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsImlzQ29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbnQiLCJpbkNvbnZlcnRlckNvbnRleHQiLCJ2aWV3Q29uZmlndXJhdGlvbiIsImRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZCIsImFzc29jaWF0ZWRQcmVzZW50YXRpb25WYXJpYW50UGF0aCIsImlzSW5zaWdodHNFbmFibGVkIiwidW5kZWZpbmVkIiwicmVzb2x2ZWRBc3NvY2lhdGVkUHJlc2VudGF0aW9uVmFyaWFudCIsInJlc29sdmVkVmlzdWFsaXphdGlvbiIsInByZXNlbnRhdGlvblBhdGgiLCJjaGFydFZpc3VhbGl6YXRpb24iLCJ0YWJsZVZpc3VhbGl6YXRpb24iLCJjb25jYXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJ2aXN1YWxpemF0aW9uQW5ub3RhdGlvbiIsImNyZWF0ZUNoYXJ0VmlzdWFsaXphdGlvbiIsIlRhYmxlIiwiY3JlYXRlVGFibGVWaXN1YWxpemF0aW9uIiwicGF0aCIsImNyZWF0ZURlZmF1bHRUYWJsZVZpc3VhbGl6YXRpb24iLCJnZXREaWFnbm9zdGljcyIsImFkZElzc3VlIiwiSXNzdWVDYXRlZ29yeSIsIkFubm90YXRpb24iLCJJc3N1ZVNldmVyaXR5IiwiTWVkaXVtIiwiSXNzdWVUeXBlIiwiTUlTU0lOR19MSU5FSVRFTSIsImNyZWF0ZUJsYW5rQ2hhcnRWaXN1YWxpemF0aW9uIiwiTUlTU0lOR19DSEFSVCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJnZXRVaUNvbnRyb2wiLCJwcmVzZW50YXRpb25Db250ZXh0IiwiY29udHJvbFBhdGgiLCJDb21tb25IZWxwZXIiLCJ2YWxpZGF0ZVByZXNlbnRhdGlvbk1ldGFQYXRoIiwiZ2V0UGF0aCIsInByZXNlbnRhdGlvbiIsIk1ldGFNb2RlbENvbnZlcnRlciIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwicHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJjcmVhdGVQcmVzZW50YXRpb25QYXRoQ29udGV4dCIsIm1vZGVsIiwiZ2V0TW9kZWwiLCJfaXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiIsIkFycmF5IiwiaXNBcnJheSIsInR5cGUiLCJnZXRNZXRhQ29udGV4dCIsImdldE9iamVjdCIsImFubm90YXRpb25UZXJtIiwic29tZSIsInZpc3VhbGl6YXRpb25UeXBlIiwiZ2V0RW50aXR5VHlwZSIsImRlZmF1bHRBbm5vdGF0aW9uIiwiZ2V0UmVsYXRpdmVBbm5vdGF0aW9uUGF0aCIsImhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMiLCJnZXRUZW1wbGF0ZVR5cGUiLCJUZW1wbGF0ZVR5cGUiLCJBbmFseXRpY2FsTGlzdFBhZ2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRhdGFWaXN1YWxpemF0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5VHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUge1xuXHRDaGFydCxcblx0TGluZUl0ZW0sXG5cdFByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFByZXNlbnRhdGlvblZhcmlhbnRUeXBlLFxuXHRTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LFxuXHRTZWxlY3Rpb25WYXJpYW50LFxuXHRTZWxlY3Rpb25WYXJpYW50VHlwZVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IElzc3VlQ2F0ZWdvcnksIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB0eXBlIHsgVmlld1BhdGhDb25maWd1cmF0aW9uIH0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IFRlbXBsYXRlVHlwZSB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgdHlwZSB7IENoYXJ0VmlzdWFsaXphdGlvbiB9IGZyb20gXCIuL0NoYXJ0XCI7XG5pbXBvcnQgeyBjcmVhdGVCbGFua0NoYXJ0VmlzdWFsaXphdGlvbiwgY3JlYXRlQ2hhcnRWaXN1YWxpemF0aW9uIH0gZnJvbSBcIi4vQ2hhcnRcIjtcbmltcG9ydCB0eXBlIHsgVGFibGVWaXN1YWxpemF0aW9uIH0gZnJvbSBcIi4vVGFibGVcIjtcbmltcG9ydCBUYWJsZSBmcm9tIFwiLi9UYWJsZVwiO1xuZXhwb3J0IHR5cGUgRGF0YVZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucyA9IExpbmVJdGVtIHwgQ2hhcnQgfCBQcmVzZW50YXRpb25WYXJpYW50IHwgU2VsZWN0aW9uVmFyaWFudCB8IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5leHBvcnQgdHlwZSBBY3R1YWxWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnMgPSBMaW5lSXRlbSB8IENoYXJ0O1xuZXhwb3J0IHR5cGUgUHJlc2VudGF0aW9uVmlzdWFsaXphdGlvbkFubm90YXRpb25zID0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0gfCBVSUFubm90YXRpb25UZXJtcy5DaGFydDtcbmV4cG9ydCB0eXBlIFZpc3VhbGl6YXRpb25BbmRQYXRoID0ge1xuXHR2aXN1YWxpemF0aW9uOiBBY3R1YWxWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdHNlbGVjdGlvblZhcmlhbnRQYXRoPzogc3RyaW5nO1xuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0O1xufTtcbmV4cG9ydCB0eXBlIERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiA9IHtcblx0dmlzdWFsaXphdGlvbnM6IChUYWJsZVZpc3VhbGl6YXRpb24gfCBDaGFydFZpc3VhbGl6YXRpb24pW107XG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG59O1xuZXhwb3J0IGNvbnN0IGdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQgPSBmdW5jdGlvbiAoXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0aXNNYWNyb09yTXVsdGlwbGVWaWV3PzogYm9vbGVhblxuKTogVmlzdWFsaXphdGlvbkFuZFBhdGhbXSB7XG5cdGNvbnN0IHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uczogVmlzdWFsaXphdGlvbkFuZFBhdGhbXSA9IFtdO1xuXHRjb25zdCBpc0FMUCA9IGlzQWxwQW5ub3RhdGlvbihjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgYmFzZVZpc3VhbGl6YXRpb25QYXRoID0gdmlzdWFsaXphdGlvblBhdGguc3BsaXQoXCJAXCIpWzBdO1xuXHRpZiAoKGlzTWFjcm9Pck11bHRpcGxlVmlldyA9PT0gdHJ1ZSB8fCBpc0FMUCkgJiYgIWlzUHJlc2VudGF0aW9uQ29tcGxpYW50KHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLCBpc0FMUCkpIHtcblx0XHRpZiAoIWFubm90YXRpb25FeGlzdHNJblByZXNlbnRhdGlvblZhcmlhbnQocHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sIFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtKSkge1xuXHRcdFx0Y29uc3QgZGVmYXVsdExpbmVJdGVtQW5ub3RhdGlvbiA9IHByZXBhcmVEZWZhdWx0VmlzdWFsaXphdGlvbihcblx0XHRcdFx0VUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0sXG5cdFx0XHRcdGJhc2VWaXN1YWxpemF0aW9uUGF0aCxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0KTtcblx0XHRcdGlmIChkZWZhdWx0TGluZUl0ZW1Bbm5vdGF0aW9uKSB7XG5cdFx0XHRcdHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucy5wdXNoKGRlZmF1bHRMaW5lSXRlbUFubm90YXRpb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWFubm90YXRpb25FeGlzdHNJblByZXNlbnRhdGlvblZhcmlhbnQocHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sIFVJQW5ub3RhdGlvblRlcm1zLkNoYXJ0KSkge1xuXHRcdFx0Y29uc3QgZGVmYXVsdENoYXJ0QW5ub3RhdGlvbiA9IHByZXBhcmVEZWZhdWx0VmlzdWFsaXphdGlvbihVSUFubm90YXRpb25UZXJtcy5DaGFydCwgYmFzZVZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdGlmIChkZWZhdWx0Q2hhcnRBbm5vdGF0aW9uKSB7XG5cdFx0XHRcdHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucy5wdXNoKGRlZmF1bHRDaGFydEFubm90YXRpb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRjb25zdCB2aXN1YWxpemF0aW9ucyA9IHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLlZpc3VhbGl6YXRpb25zO1xuXHRjb25zdCBwdXNoRmlyc3RWaXpPZlR5cGUgPSBmdW5jdGlvbiAoYWxsb3dlZFRlcm1zOiBzdHJpbmdbXSkge1xuXHRcdGNvbnN0IGZpcnN0Vml6ID0gdmlzdWFsaXphdGlvbnM/LmZpbmQoKHZpeikgPT4ge1xuXHRcdFx0cmV0dXJuIGFsbG93ZWRUZXJtcy5pbmRleE9mKHZpei4kdGFyZ2V0Py50ZXJtKSA+PSAwO1xuXHRcdH0pO1xuXHRcdGlmIChmaXJzdFZpeikge1xuXHRcdFx0dmlzdWFsaXphdGlvbkFubm90YXRpb25zLnB1c2goe1xuXHRcdFx0XHR2aXN1YWxpemF0aW9uOiBmaXJzdFZpei4kdGFyZ2V0IGFzIEFjdHVhbFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucyxcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGAke2Jhc2VWaXN1YWxpemF0aW9uUGF0aH0ke2ZpcnN0Vml6LnZhbHVlfWAsXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IGNvbnZlcnRlckNvbnRleHRcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblx0aWYgKGlzQUxQKSB7XG5cdFx0Ly8gSW4gY2FzZSBvZiBBTFAsIHdlIHVzZSB0aGUgZmlyc3QgTGluZUl0ZW0gYW5kIHRoZSBmaXJzdCBDaGFydFxuXHRcdHB1c2hGaXJzdFZpek9mVHlwZShbVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW1dKTtcblx0XHRwdXNoRmlyc3RWaXpPZlR5cGUoW1VJQW5ub3RhdGlvblRlcm1zLkNoYXJ0XSk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gT3RoZXJ3aXNlLCB3ZSB1c2UgdGhlIGZpcnN0IHZpeiBvbmx5IChDaGFydCBvciBMaW5lSXRlbSlcblx0XHRwdXNoRmlyc3RWaXpPZlR5cGUoW1VJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtLCBVSUFubm90YXRpb25UZXJtcy5DaGFydF0pO1xuXHR9XG5cdHJldHVybiB2aXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG59O1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQoXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgfCB1bmRlZmluZWQge1xuXHRpZiAoYW5ub3RhdGlvblBhdGgpIHtcblx0XHRjb25zdCByZXNvbHZlZFRhcmdldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oYW5ub3RhdGlvblBhdGgpO1xuXHRcdGNvbnN0IHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uIGFzIFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0aWYgKHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdGlmIChzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0cmV0dXJuIHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFubm90YXRpb24gUGF0aCBmb3IgdGhlIFNQViBtZW50aW9uZWQgaW4gdGhlIG1hbmlmZXN0IGlzIG5vdCBmb3VuZCwgUGxlYXNlIGFkZCB0aGUgU1BWIGluIHRoZSBhbm5vdGF0aW9uXCIpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1NlbGVjdGlvblByZXNlbnRhdGlvbkNvbXBsaWFudChcblx0c2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDogU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCxcblx0aXNBTFA6IGJvb2xlYW5cbik6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuXHRjb25zdCBwcmVzZW50YXRpb25WYXJpYW50ID0gc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCAmJiBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LlByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdGlmIChwcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0cmV0dXJuIGlzUHJlc2VudGF0aW9uQ29tcGxpYW50KHByZXNlbnRhdGlvblZhcmlhbnQsIGlzQUxQKTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQcmVzZW50YXRpb24gVmFyaWFudCBpcyBub3QgcHJlc2VudCBpbiB0aGUgU1BWIGFubm90YXRpb25cIik7XG5cdH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBpc1ByZXNlbnRhdGlvbkNvbXBsaWFudChwcmVzZW50YXRpb25WYXJpYW50OiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSwgaXNBTFAgPSBmYWxzZSk6IGJvb2xlYW4ge1xuXHRsZXQgaGFzVGFibGUgPSBmYWxzZSxcblx0XHRoYXNDaGFydCA9IGZhbHNlO1xuXHRpZiAoaXNBTFApIHtcblx0XHRpZiAocHJlc2VudGF0aW9uVmFyaWFudD8uVmlzdWFsaXphdGlvbnMpIHtcblx0XHRcdGNvbnN0IHZpc3VhbGl6YXRpb25zID0gcHJlc2VudGF0aW9uVmFyaWFudC5WaXN1YWxpemF0aW9ucztcblx0XHRcdHZpc3VhbGl6YXRpb25zLmZvckVhY2goKHZpc3VhbGl6YXRpb24pID0+IHtcblx0XHRcdFx0aWYgKHZpc3VhbGl6YXRpb24uJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0pIHtcblx0XHRcdFx0XHRoYXNUYWJsZSA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHZpc3VhbGl6YXRpb24uJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQpIHtcblx0XHRcdFx0XHRoYXNDaGFydCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gaGFzQ2hhcnQgJiYgaGFzVGFibGU7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnQ/LlZpc3VhbGl6YXRpb25zICYmXG5cdFx0XHQhIXByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnMuZmluZCgodmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdHZpc3VhbGl6YXRpb24uJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0gfHwgdmlzdWFsaXphdGlvbi4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5DaGFydFxuXHRcdFx0XHQpO1xuXHRcdFx0fSlcblx0XHQpO1xuXHR9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdExpbmVJdGVtKGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCB7XG5cdHJldHVybiBlbnRpdHlUeXBlLmFubm90YXRpb25zLlVJPy5MaW5lSXRlbTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXREZWZhdWx0Q2hhcnQoZW50aXR5VHlwZTogRW50aXR5VHlwZSk6IENoYXJ0IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGVudGl0eVR5cGUuYW5ub3RhdGlvbnMuVUk/LkNoYXJ0O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRQcmVzZW50YXRpb25WYXJpYW50KGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBQcmVzZW50YXRpb25WYXJpYW50IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5QcmVzZW50YXRpb25WYXJpYW50O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldERlZmF1bHRTZWxlY3Rpb25WYXJpYW50KGVudGl0eVR5cGU6IEVudGl0eVR5cGUpOiBTZWxlY3Rpb25WYXJpYW50IHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5TZWxlY3Rpb25WYXJpYW50O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdGlvblZhcmlhbnQoZW50aXR5VHlwZTogRW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IFNlbGVjdGlvblZhcmlhbnRUeXBlIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgYW5ub3RhdGlvblBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmdldERlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoKCk7XG5cdGNvbnN0IHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgPSBnZXRTZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50KGVudGl0eVR5cGUsIGFubm90YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0bGV0IHNlbGVjdGlvblZhcmlhbnQ7XG5cdGlmIChzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0c2VsZWN0aW9uVmFyaWFudCA9IHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQuU2VsZWN0aW9uVmFyaWFudCBhcyBTZWxlY3Rpb25WYXJpYW50O1xuXHRcdGlmIChzZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0XHRyZXR1cm4gc2VsZWN0aW9uVmFyaWFudDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0c2VsZWN0aW9uVmFyaWFudCA9IGdldERlZmF1bHRTZWxlY3Rpb25WYXJpYW50KGVudGl0eVR5cGUpO1xuXHRcdHJldHVybiBzZWxlY3Rpb25WYXJpYW50O1xuXHR9XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uKFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50OiBib29sZWFuIHwgdW5kZWZpbmVkLFxuXHRpbkNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHZpZXdDb25maWd1cmF0aW9uPzogVmlld1BhdGhDb25maWd1cmF0aW9uLFxuXHRkb05vdENoZWNrQXBwbHlTdXBwb3J0ZWQ/OiBib29sZWFuIHwgdW5kZWZpbmVkLFxuXHRhc3NvY2lhdGVkUHJlc2VudGF0aW9uVmFyaWFudFBhdGg/OiBzdHJpbmcsXG5cdGlzTWFjcm9Pck11bHRpcGxlVmlldz86IGJvb2xlYW4sXG5cdGlzSW5zaWdodHNFbmFibGVkPzogYm9vbGVhblxuKTogRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uIHtcblx0Y29uc3QgcmVzb2x2ZWRUYXJnZXQgPVxuXHRcdHZpc3VhbGl6YXRpb25QYXRoICE9PSBcIlwiXG5cdFx0XHQ/IGluQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbih2aXN1YWxpemF0aW9uUGF0aClcblx0XHRcdDogeyBhbm5vdGF0aW9uOiB1bmRlZmluZWQsIGNvbnZlcnRlckNvbnRleHQ6IGluQ29udmVydGVyQ29udGV4dCB9O1xuXHRjb25zdCByZXNvbHZlZEFzc29jaWF0ZWRQcmVzZW50YXRpb25WYXJpYW50ID0gYXNzb2NpYXRlZFByZXNlbnRhdGlvblZhcmlhbnRQYXRoXG5cdFx0PyBpbkNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oYXNzb2NpYXRlZFByZXNlbnRhdGlvblZhcmlhbnRQYXRoKVxuXHRcdDogbnVsbDtcblx0Y29uc3QgcmVzb2x2ZWRWaXN1YWxpemF0aW9uID0gcmVzb2x2ZWRUYXJnZXQuYW5ub3RhdGlvbiBhcyBEYXRhVmlzdWFsaXphdGlvbkFubm90YXRpb25zO1xuXHRpbkNvbnZlcnRlckNvbnRleHQgPSByZXNvbHZlZFRhcmdldC5jb252ZXJ0ZXJDb250ZXh0O1xuXHRsZXQgdmlzdWFsaXphdGlvbkFubm90YXRpb25zOiBWaXN1YWxpemF0aW9uQW5kUGF0aFtdID0gW107XG5cdGxldCBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbjogUHJlc2VudGF0aW9uVmFyaWFudFR5cGU7XG5cdGxldCBwcmVzZW50YXRpb25QYXRoID0gXCJcIjtcblx0bGV0IGNoYXJ0VmlzdWFsaXphdGlvbiwgdGFibGVWaXN1YWxpemF0aW9uO1xuXHRjb25zdCB0ZXJtID0gcmVzb2x2ZWRWaXN1YWxpemF0aW9uPy50ZXJtO1xuXHRpZiAodGVybSkge1xuXHRcdHN3aXRjaCAodGVybSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbTpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQ6XG5cdFx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uID0gcmVzb2x2ZWRBc3NvY2lhdGVkUHJlc2VudGF0aW9uVmFyaWFudD8uYW5ub3RhdGlvbjtcblx0XHRcdFx0dmlzdWFsaXphdGlvbkFubm90YXRpb25zLnB1c2goe1xuXHRcdFx0XHRcdHZpc3VhbGl6YXRpb246IHJlc29sdmVkVmlzdWFsaXphdGlvbiBhcyBBY3R1YWxWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnMsXG5cdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IHZpc3VhbGl6YXRpb25QYXRoLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IGluQ29udmVydGVyQ29udGV4dFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnQ6XG5cdFx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uID0gcmVzb2x2ZWRWaXN1YWxpemF0aW9uO1xuXHRcdFx0XHR2aXN1YWxpemF0aW9uQW5ub3RhdGlvbnMgPSB2aXN1YWxpemF0aW9uQW5ub3RhdGlvbnMuY29uY2F0KFxuXHRcdFx0XHRcdGdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQoXG5cdFx0XHRcdFx0XHRyZXNvbHZlZFZpc3VhbGl6YXRpb24sXG5cdFx0XHRcdFx0XHR2aXN1YWxpemF0aW9uUGF0aCxcblx0XHRcdFx0XHRcdGluQ29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdGlzTWFjcm9Pck11bHRpcGxlVmlld1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ6XG5cdFx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uID0gcmVzb2x2ZWRWaXN1YWxpemF0aW9uLlByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0XHRcdC8vIFByZXNlbnRhdGlvbiBjYW4gYmUgaW5saW5lIG9yIG91dHNpZGUgdGhlIFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRcblx0XHRcdFx0cHJlc2VudGF0aW9uUGF0aCA9IHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZTtcblx0XHRcdFx0dmlzdWFsaXphdGlvbkFubm90YXRpb25zID0gdmlzdWFsaXphdGlvbkFubm90YXRpb25zLmNvbmNhdChcblx0XHRcdFx0XHRnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KFxuXHRcdFx0XHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHRcdFx0XHR2aXN1YWxpemF0aW9uUGF0aCxcblx0XHRcdFx0XHRcdGluQ29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdGlzTWFjcm9Pck11bHRpcGxlVmlld1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0dmlzdWFsaXphdGlvbkFubm90YXRpb25zLmZvckVhY2goKHZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKSA9PiB7XG5cdFx0XHRjb25zdCB7IHZpc3VhbGl6YXRpb24sIGFubm90YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0IH0gPSB2aXN1YWxpemF0aW9uQW5ub3RhdGlvbjtcblx0XHRcdHN3aXRjaCAodmlzdWFsaXphdGlvbi50ZXJtKSB7XG5cdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQ6XG5cdFx0XHRcdFx0Y2hhcnRWaXN1YWxpemF0aW9uID0gY3JlYXRlQ2hhcnRWaXN1YWxpemF0aW9uKFxuXHRcdFx0XHRcdFx0dmlzdWFsaXphdGlvbixcblx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdGRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZCxcblx0XHRcdFx0XHRcdHZpZXdDb25maWd1cmF0aW9uLFxuXHRcdFx0XHRcdFx0aXNJbnNpZ2h0c0VuYWJsZWRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtOlxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbiA9IFRhYmxlLmNyZWF0ZVRhYmxlVmlzdWFsaXphdGlvbihcblx0XHRcdFx0XHRcdHZpc3VhbGl6YXRpb24sXG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbixcblx0XHRcdFx0XHRcdGlzQ29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbnQsXG5cdFx0XHRcdFx0XHR2aWV3Q29uZmlndXJhdGlvbixcblx0XHRcdFx0XHRcdGlzSW5zaWdodHNFbmFibGVkXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRjb25zdCB2aXN1YWxpemF0aW9uczogYW55ID0gW107XG5cdGxldCBwYXRoID0gdGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCA/IHByZXNlbnRhdGlvblBhdGggOiByZXNvbHZlZFZpc3VhbGl6YXRpb24/LmZ1bGx5UXVhbGlmaWVkTmFtZTtcblx0aWYgKHBhdGggPT09IHVuZGVmaW5lZCkge1xuXHRcdHBhdGggPSBcIi9cIjtcblx0fVxuXHRjb25zdCBpc0FMUCA9IGlzQWxwQW5ub3RhdGlvbihpbkNvbnZlcnRlckNvbnRleHQpO1xuXHRpZiAoIXRlcm0gfHwgKGlzQUxQICYmIHRhYmxlVmlzdWFsaXphdGlvbiA9PT0gdW5kZWZpbmVkKSkge1xuXHRcdHRhYmxlVmlzdWFsaXphdGlvbiA9IFRhYmxlLmNyZWF0ZURlZmF1bHRUYWJsZVZpc3VhbGl6YXRpb24oaW5Db252ZXJ0ZXJDb250ZXh0LCBpc01hY3JvT3JNdWx0aXBsZVZpZXcgIT09IHRydWUpO1xuXHRcdGluQ29udmVydGVyQ29udGV4dC5nZXREaWFnbm9zdGljcygpLmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5NZWRpdW0sIElzc3VlVHlwZS5NSVNTSU5HX0xJTkVJVEVNKTtcblx0fVxuXHRpZiAoaXNBTFAgJiYgY2hhcnRWaXN1YWxpemF0aW9uID09PSB1bmRlZmluZWQpIHtcblx0XHRjaGFydFZpc3VhbGl6YXRpb24gPSBjcmVhdGVCbGFua0NoYXJ0VmlzdWFsaXphdGlvbihpbkNvbnZlcnRlckNvbnRleHQpO1xuXHRcdGluQ29udmVydGVyQ29udGV4dC5nZXREaWFnbm9zdGljcygpLmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuQW5ub3RhdGlvbiwgSXNzdWVTZXZlcml0eS5NZWRpdW0sIElzc3VlVHlwZS5NSVNTSU5HX0NIQVJUKTtcblx0fVxuXHRpZiAoY2hhcnRWaXN1YWxpemF0aW9uKSB7XG5cdFx0dmlzdWFsaXphdGlvbnMucHVzaChjaGFydFZpc3VhbGl6YXRpb24pO1xuXHR9XG5cdGlmICh0YWJsZVZpc3VhbGl6YXRpb24pIHtcblx0XHR2aXN1YWxpemF0aW9ucy5wdXNoKHRhYmxlVmlzdWFsaXphdGlvbik7XG5cdH1cblx0cmV0dXJuIHtcblx0XHR2aXN1YWxpemF0aW9uczogdmlzdWFsaXphdGlvbnMsXG5cdFx0YW5ub3RhdGlvblBhdGg6IGluQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKHBhdGgpXG5cdH07XG59XG4vKipcbiAqIFJldHVybnMgdGhlIGNvbnRleHQgb2YgdGhlIFVJIGNvbnRyb2xzIChlaXRoZXIgYSBVSS5MaW5lSXRlbSwgb3IgYSBVSS5DaGFydCkuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBnZXRVaUNvbnRyb2xcbiAqIEBwYXJhbSBwcmVzZW50YXRpb25Db250ZXh0IE9iamVjdCBvZiB0aGUgcHJlc2VudGF0aW9uIGNvbnRleHQgKGVpdGhlciBhIHByZXNlbnRhdGlvbiB2YXJpYW50LCBvciBhIFVJLkxpbmVJdGVtLCBvciBhIFVJLkNoYXJ0KVxuICogQHBhcmFtIGNvbnRyb2xQYXRoIENvbnRyb2wgcGF0aFxuICogQHJldHVybnMgVGhlIGNvbnRleHQgb2YgdGhlIGNvbnRyb2wgKGVpdGhlciBhIFVJLkxpbmVJdGVtLCBvciBhIFVJLkNoYXJ0KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VWlDb250cm9sKHByZXNlbnRhdGlvbkNvbnRleHQ6IENvbnRleHQsIGNvbnRyb2xQYXRoOiBzdHJpbmcpOiBDb250ZXh0IHtcblx0Q29tbW9uSGVscGVyLnZhbGlkYXRlUHJlc2VudGF0aW9uTWV0YVBhdGgocHJlc2VudGF0aW9uQ29udGV4dC5nZXRQYXRoKCksIGNvbnRyb2xQYXRoKTtcblx0Y29uc3QgcHJlc2VudGF0aW9uID0gTWV0YU1vZGVsQ29udmVydGVyLmNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KHByZXNlbnRhdGlvbkNvbnRleHQpLFxuXHRcdHByZXNlbnRhdGlvblZhcmlhbnRQYXRoID0gQ29tbW9uSGVscGVyLmNyZWF0ZVByZXNlbnRhdGlvblBhdGhDb250ZXh0KHByZXNlbnRhdGlvbkNvbnRleHQpLFxuXHRcdG1vZGVsID0gcHJlc2VudGF0aW9uQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRpZiAocHJlc2VudGF0aW9uKSB7XG5cdFx0aWYgKENvbW1vbkhlbHBlci5faXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbihwcmVzZW50YXRpb25WYXJpYW50UGF0aC5nZXRQYXRoKCkpKSB7XG5cdFx0XHRjb25zdCB2aXN1YWxpemF0aW9ucyA9IHByZXNlbnRhdGlvbi5QcmVzZW50YXRpb25WYXJpYW50XG5cdFx0XHRcdD8gcHJlc2VudGF0aW9uLlByZXNlbnRhdGlvblZhcmlhbnQuVmlzdWFsaXphdGlvbnNcblx0XHRcdFx0OiBwcmVzZW50YXRpb24uVmlzdWFsaXphdGlvbnM7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2aXN1YWxpemF0aW9ucykpIHtcblx0XHRcdFx0Zm9yIChjb25zdCB2aXN1YWxpemF0aW9uIG9mIHZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0dmlzdWFsaXphdGlvbi50eXBlID09IFwiQW5ub3RhdGlvblBhdGhcIiAmJlxuXHRcdFx0XHRcdFx0dmlzdWFsaXphdGlvbi52YWx1ZS5pbmRleE9mKGNvbnRyb2xQYXRoKSAhPT0gLTEgJiZcblx0XHRcdFx0XHRcdC8vIGNoZWNrIGlmIG9iamVjdCBleGlzdHMgZm9yIFByZXNlbnRhdGlvblZhcmlhbnQgdmlzdWFsaXphdGlvblxuXHRcdFx0XHRcdFx0ISFtb2RlbC5nZXRNZXRhQ29udGV4dChwcmVzZW50YXRpb25Db250ZXh0LmdldFBhdGgoKS5zcGxpdChcIkBcIilbMF0gKyB2aXN1YWxpemF0aW9uLnZhbHVlKS5nZXRPYmplY3QoKVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0Y29udHJvbFBhdGggPSB2aXN1YWxpemF0aW9uLnZhbHVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBwcmVzZW50YXRpb25Db250ZXh0O1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbW9kZWwuZ2V0TWV0YUNvbnRleHQocHJlc2VudGF0aW9uQ29udGV4dC5nZXRQYXRoKCkuc3BsaXQoXCJAXCIpWzBdICsgY29udHJvbFBhdGgpO1xufVxuZXhwb3J0IGNvbnN0IGFubm90YXRpb25FeGlzdHNJblByZXNlbnRhdGlvblZhcmlhbnQgPSBmdW5jdGlvbiAoXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSxcblx0YW5ub3RhdGlvblRlcm06IFByZXNlbnRhdGlvblZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uc1xuKTogYm9vbGVhbiB7XG5cdHJldHVybiBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5WaXN1YWxpemF0aW9ucz8uc29tZSgodmlzdWFsaXphdGlvbikgPT4gdmlzdWFsaXphdGlvbi52YWx1ZS5pbmRleE9mKGFubm90YXRpb25UZXJtKSA+IC0xKSA/PyBmYWxzZTtcbn07XG5leHBvcnQgY29uc3QgcHJlcGFyZURlZmF1bHRWaXN1YWxpemF0aW9uID0gZnVuY3Rpb24gKFxuXHR2aXN1YWxpemF0aW9uVHlwZTogUHJlc2VudGF0aW9uVmlzdWFsaXphdGlvbkFubm90YXRpb25zLFxuXHRiYXNlVmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogVmlzdWFsaXphdGlvbkFuZFBhdGggfCB1bmRlZmluZWQge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IGRlZmF1bHRBbm5vdGF0aW9uID1cblx0XHR2aXN1YWxpemF0aW9uVHlwZSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0gPyBnZXREZWZhdWx0TGluZUl0ZW0oZW50aXR5VHlwZSkgOiBnZXREZWZhdWx0Q2hhcnQoZW50aXR5VHlwZSk7XG5cdGlmIChkZWZhdWx0QW5ub3RhdGlvbikge1xuXHRcdHJldHVybiB7XG5cdFx0XHR2aXN1YWxpemF0aW9uOiBkZWZhdWx0QW5ub3RhdGlvbixcblx0XHRcdGFubm90YXRpb25QYXRoOiBgJHtiYXNlVmlzdWFsaXphdGlvblBhdGh9JHtjb252ZXJ0ZXJDb250ZXh0LmdldFJlbGF0aXZlQW5ub3RhdGlvblBhdGgoXG5cdFx0XHRcdGRlZmF1bHRBbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0ZW50aXR5VHlwZVxuXHRcdFx0KX1gLFxuXHRcdFx0Y29udmVydGVyQ29udGV4dDogY29udmVydGVyQ29udGV4dFxuXHRcdH07XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn07XG5leHBvcnQgY29uc3QgaXNBbHBBbm5vdGF0aW9uID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSB8fFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0KTtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7O0VBb0NPLE1BQU1B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
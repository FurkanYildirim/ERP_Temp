/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/TemplateModel", "sap/fe/core/templating/PropertyFormatters", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/ui/mdc/FilterBarDelegate", "sap/ui/model/json/JSONModel"], function (Log, mergeObjects, CommonUtils, FilterBar, MetaModelFunction, ModelHelper, ResourceModelHelper, StableIdHelper, TemplateModel, PropertyFormatters, EDM, TypeUtil, CommonHelper, DelegateUtil, FilterUtils, FilterBarDelegate, JSONModel) {
  "use strict";

  var getModelType = EDM.getModelType;
  var hasValueHelp = PropertyFormatters.hasValueHelp;
  var generate = StableIdHelper.generate;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var getLocalizedText = ResourceModelHelper.getLocalizedText;
  var isPropertyFilterable = MetaModelFunction.isPropertyFilterable;
  var processSelectionFields = FilterBar.processSelectionFields;
  const ODataFilterBarDelegate = Object.assign({}, FilterBarDelegate);
  ODataFilterBarDelegate.apiVersion = 2;
  const EDIT_STATE_PROPERTY_NAME = "$editState",
    SEARCH_PROPERTY_NAME = "$search",
    VALUE_HELP_TYPE = "FilterFieldValueHelp",
    FETCHED_PROPERTIES_DATA_KEY = "sap_fe_FilterBarDelegate_propertyInfoMap",
    CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /[+*]/g;
  function _templateEditState(sIdPrefix, metaModel, oModifier) {
    const oThis = new JSONModel({
        id: sIdPrefix,
        isDraftCollaborative: ModelHelper.isCollaborationDraftSupported(metaModel)
      }),
      oPreprocessorSettings = {
        bindingContexts: {
          this: oThis.createBindingContext("/")
        },
        models: {
          //"this.i18n": ResourceModel.getModel(), TODO: To be checked why this is needed, should not be needed at all
          this: oThis
        }
      };
    return DelegateUtil.templateControlFragment("sap.fe.macros.filter.DraftEditState", oPreprocessorSettings, undefined, oModifier).finally(function () {
      oThis.destroy();
    });
  }
  ODataFilterBarDelegate._templateCustomFilter = async function (oFilterBar, sIdPrefix, oSelectionFieldInfo, oMetaModel, oModifier) {
    const sEntityTypePath = await DelegateUtil.getCustomData(oFilterBar, "entityType", oModifier);
    const oThis = new JSONModel({
        id: sIdPrefix
      }),
      oItemModel = new TemplateModel(oSelectionFieldInfo, oMetaModel),
      oPreprocessorSettings = {
        bindingContexts: {
          contextPath: oMetaModel.createBindingContext(sEntityTypePath),
          this: oThis.createBindingContext("/"),
          item: oItemModel.createBindingContext("/")
        },
        models: {
          contextPath: oMetaModel,
          this: oThis,
          item: oItemModel
        }
      },
      oView = CommonUtils.getTargetView(oFilterBar),
      oController = oView ? oView.getController() : undefined,
      oOptions = {
        controller: oController ? oController : undefined,
        view: oView
      };
    return DelegateUtil.templateControlFragment("sap.fe.macros.filter.CustomFilter", oPreprocessorSettings, oOptions, oModifier).finally(function () {
      oThis.destroy();
      oItemModel.destroy();
    });
  };
  function _getPropertyPath(sConditionPath) {
    return sConditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
  }
  ODataFilterBarDelegate._findSelectionField = function (aSelectionFields, sFlexName) {
    return aSelectionFields.find(function (oSelectionField) {
      return (oSelectionField.conditionPath === sFlexName || oSelectionField.conditionPath.replaceAll(/\*/g, "") === sFlexName) && oSelectionField.availability !== "Hidden";
    });
  };
  function _generateIdPrefix(sFilterBarId, sControlType, sNavigationPrefix) {
    return sNavigationPrefix ? generate([sFilterBarId, sControlType, sNavigationPrefix]) : generate([sFilterBarId, sControlType]);
  }
  function _templateValueHelp(oSettings, oParameters) {
    const oThis = new JSONModel({
      idPrefix: oParameters.sVhIdPrefix,
      conditionModel: "$filters",
      navigationPrefix: oParameters.sNavigationPrefix ? `/${oParameters.sNavigationPrefix}` : "",
      filterFieldValueHelp: true,
      useSemanticDateRange: oParameters.bUseSemanticDateRange
    });
    const oPreprocessorSettings = mergeObjects({}, oSettings, {
      bindingContexts: {
        this: oThis.createBindingContext("/")
      },
      models: {
        this: oThis
      }
    });
    return Promise.resolve(DelegateUtil.templateControlFragment("sap.fe.macros.internal.valuehelp.ValueHelp", oPreprocessorSettings, {
      isXML: oSettings.isXML
    })).then(function (aVHElements) {
      if (aVHElements) {
        const sAggregationName = "dependents";
        //Some filter fields have the PersistenceProvider aggregation besides the FVH :
        if (aVHElements.length) {
          aVHElements.forEach(function (elt) {
            if (oParameters.oModifier) {
              oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, elt, 0);
            } else {
              oParameters.oControl.insertAggregation(sAggregationName, elt, 0, false);
            }
          });
        } else if (oParameters.oModifier) {
          oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, aVHElements, 0);
        } else {
          oParameters.oControl.insertAggregation(sAggregationName, aVHElements, 0, false);
        }
      }
    }).catch(function (oError) {
      Log.error("Error while evaluating DelegateUtil.isValueHelpRequired", oError);
    }).finally(function () {
      oThis.destroy();
    });
  }
  async function _addXMLCustomFilterField(oFilterBar, oModifier, sPropertyPath) {
    try {
      const aDependents = await Promise.resolve(oModifier.getAggregation(oFilterBar, "dependents"));
      let i;
      if (aDependents && aDependents.length > 1) {
        for (i = 0; i <= aDependents.length; i++) {
          const oFilterField = aDependents[i];
          if (oFilterField && oFilterField.isA("sap.ui.mdc.FilterField")) {
            const sDataProperty = oFilterField.getFieldPath(),
              sFilterFieldId = oFilterField.getId();
            if (sPropertyPath === sDataProperty && sFilterFieldId.indexOf("CustomFilterField")) {
              return Promise.resolve(oFilterField);
            }
          }
        }
      }
    } catch (oError) {
      Log.error("Filter Cannot be added", oError);
    }
  }
  function _templateFilterField(oSettings, oParameters, pageModel) {
    const oThis = new JSONModel({
      idPrefix: oParameters.sIdPrefix,
      vhIdPrefix: oParameters.sVhIdPrefix,
      propertyPath: oParameters.sPropertyName,
      navigationPrefix: oParameters.sNavigationPrefix ? `/${oParameters.sNavigationPrefix}` : "",
      useSemanticDateRange: oParameters.bUseSemanticDateRange,
      settings: oParameters.oSettings,
      visualFilter: oParameters.visualFilter
    });
    const oMetaModel = oParameters.oMetaModel;
    const oVisualFilter = new TemplateModel(oParameters.visualFilter, oMetaModel);
    const oPreprocessorSettings = mergeObjects({}, oSettings, {
      bindingContexts: {
        this: oThis.createBindingContext("/"),
        visualFilter: oVisualFilter.createBindingContext("/")
      },
      models: {
        this: oThis,
        visualFilter: oVisualFilter,
        metaModel: oMetaModel,
        converterContext: pageModel
      }
    });
    return DelegateUtil.templateControlFragment("sap.fe.macros.internal.filterField.FilterFieldTemplate", oPreprocessorSettings, {
      isXML: oSettings.isXML
    }).finally(function () {
      oThis.destroy();
    });
  }
  async function _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName) {
    try {
      sPropertyInfoName = sPropertyInfoName.replace("*", "");
      const sPropertyInfoKey = generate([sPropertyInfoName]); //Making sure that navigation property names are generated properly e.g. _Item::Material
      if (mPropertyBag && !mPropertyBag.modifier) {
        throw "FilterBar Delegate method called without modifier.";
      }
      const delegate = await mPropertyBag.modifier.getProperty(oParentControl, "delegate");
      const aPropertyInfo = await mPropertyBag.modifier.getProperty(oParentControl, "propertyInfo");
      //We do not get propertyInfo in case of table filters
      if (aPropertyInfo) {
        const hasPropertyInfo = aPropertyInfo.some(function (prop) {
          return prop.key === sPropertyInfoKey || prop.name === sPropertyInfoKey;
        });
        if (!hasPropertyInfo) {
          const entityTypePath = delegate.payload.entityTypePath;
          const converterContext = FilterUtils.createConverterContext(oParentControl, entityTypePath, oMetaModel, mPropertyBag.appComponent);
          const entityType = converterContext.getEntityType();
          let filterField = FilterUtils.getFilterField(sPropertyInfoName, converterContext, entityType);
          filterField = FilterUtils.buildProperyInfo(filterField, converterContext);
          aPropertyInfo.push(filterField);
          mPropertyBag.modifier.setProperty(oParentControl, "propertyInfo", aPropertyInfo);
        }
      }
    } catch (errorMsg) {
      Log.warning(`${oParentControl.getId()} : ${errorMsg}`);
    }
  }

  /**
   * Method responsible for creating filter field in standalone mode / in the personalization settings of the filter bar.
   *
   * @param sPropertyInfoName Name of the property being added as the filter field
   * @param oParentControl Parent control instance to which the filter field is added
   * @param mPropertyBag Instance of the property bag from Flex API
   * @returns Once resolved, a filter field definition is returned
   */
  ODataFilterBarDelegate.addItem = async function (oParentControl, sPropertyInfoName, mPropertyBag) {
    if (!mPropertyBag) {
      // Invoked during runtime.
      return ODataFilterBarDelegate._addP13nItem(sPropertyInfoName, oParentControl);
    }
    const modifier = mPropertyBag.modifier;
    const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
    const oMetaModel = model && model.getMetaModel();
    if (!oMetaModel) {
      return Promise.resolve(null);
    }
    const isXML = modifier && modifier.targets === "xmlTree";
    if (isXML) {
      await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
    }
    return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oMetaModel, modifier, mPropertyBag.appComponent);
  };

  /**
   * Method responsible for removing filter field in standalone / personalization filter bar.
   *
   * @param oFilterFieldProperty Object of the filter field property being removed as filter field
   * @param oParentControl Parent control instance from which the filter field is removed
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.removeItem = async function (oParentControl, oFilterFieldProperty, mPropertyBag) {
    let doRemoveItem = true;
    const modifier = mPropertyBag.modifier;
    const isXML = modifier && modifier.targets === "xmlTree";
    if (isXML && !oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
      const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
      const oMetaModel = model && model.getMetaModel();
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.getFieldPath()) {
        await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty.getFieldPath());
      } else {
        await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty);
      }
    }
    if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.isA && oFilterFieldProperty.isA("sap.ui.mdc.FilterField")) {
      if (oFilterFieldProperty.data("isSlot") === "true" && mPropertyBag) {
        // Inserting into the modifier creates a change from flex also filter is been removed hence promise is resolved to false
        modifier.insertAggregation(oParentControl, "dependents", oFilterFieldProperty);
        doRemoveItem = false;
      }
    }
    return Promise.resolve(doRemoveItem);
  };

  /**
   * Method responsible for creating filter field condition in standalone / personalization filter bar.
   *
   * @param sPropertyInfoName Name of the property being added as filter field
   * @param oParentControl Parent control instance to which the filter field is added
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.addCondition = async function (oParentControl, sPropertyInfoName, mPropertyBag) {
    const modifier = mPropertyBag.modifier;
    const isXML = modifier && modifier.targets === "xmlTree";
    if (isXML) {
      const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
      const oMetaModel = model && model.getMetaModel();
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
    }
    return Promise.resolve();
  };

  /**
   * Method responsible for removing filter field in standalone / personalization filter bar.
   *
   * @param sPropertyInfoName Name of the property being removed as filter field
   * @param oParentControl Parent control instance from which the filter field is removed
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.removeCondition = async function (oParentControl, sPropertyInfoName, mPropertyBag) {
    if (!oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
      const modifier = mPropertyBag.modifier;
      const isXML = modifier && modifier.targets === "xmlTree";
      if (isXML) {
        const model = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel();
        const oMetaModel = model && model.getMetaModel();
        if (!oMetaModel) {
          return Promise.resolve(null);
        }
        await _addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName);
      }
    }
    return Promise.resolve();
  };
  /**
   * Clears all input values of visible filter fields in the filter bar.
   *
   * @param oFilterControl Instance of the FilterBar control
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.clearFilters = async function (oFilterControl) {
    return FilterUtils.clearFilterValues(oFilterControl);
  };
  /**
   * Creates the filter field in the table adaptation of the FilterBar.
   *
   * @param sPropertyInfoName The property name of the entity type for which the filter field needs to be created
   * @param oParentControl Instance of the parent control
   * @returns Once resolved, a filter field definition is returned
   */
  ODataFilterBarDelegate._addP13nItem = function (sPropertyInfoName, oParentControl) {
    return DelegateUtil.fetchModel(oParentControl).then(function (oModel) {
      return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oModel.getMetaModel(), undefined);
    }).catch(function (oError) {
      Log.error("Model could not be resolved", oError);
      return null;
    });
  };
  ODataFilterBarDelegate.fetchPropertiesForEntity = function (sEntityTypePath, oMetaModel, oFilterControl) {
    const oEntityType = oMetaModel.getObject(sEntityTypePath);
    const includeHidden = oFilterControl.isA("sap.ui.mdc.filterbar.vh.FilterBar") ? true : undefined;
    if (!oFilterControl || !oEntityType) {
      return [];
    }
    const oConverterContext = FilterUtils.createConverterContext(oFilterControl, sEntityTypePath);
    const sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath);
    const mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath, includeHidden);
    let aFetchedProperties = [];
    mFilterFields.forEach(function (oFilterFieldInfo) {
      const sAnnotationPath = oFilterFieldInfo.annotationPath;
      if (sAnnotationPath) {
        var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3, _entityType$annotatio4;
        const oPropertyAnnotations = oConverterContext.getConvertedTypes().resolvePath(sAnnotationPath).target;
        const sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, sAnnotationPath);
        const sProperty = sAnnotationPath.replace(`${sTargetPropertyPrefix}/`, "");
        const entityType = oConverterContext.getEntityType();
        const selectionFields = (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : _entityType$annotatio2.SelectionFields;
        const filterFacets = (_entityType$annotatio3 = entityType.annotations) === null || _entityType$annotatio3 === void 0 ? void 0 : (_entityType$annotatio4 = _entityType$annotatio3.UI) === null || _entityType$annotatio4 === void 0 ? void 0 : _entityType$annotatio4.FilterFacets;
        if (ODataFilterBarDelegate._isFilterAdaptable(oFilterFieldInfo, oPropertyAnnotations, selectionFields, filterFacets) && isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)) {
          aFetchedProperties.push(oFilterFieldInfo);
        }
      } else {
        //Custom Filters
        aFetchedProperties.push(oFilterFieldInfo);
      }
    });
    const aParameterFields = [];
    const processedFields = processSelectionFields(aFetchedProperties, oConverterContext);
    const processedFieldsKeys = [];
    processedFields.forEach(function (oProps) {
      if (oProps.key) {
        processedFieldsKeys.push(oProps.key);
      }
    });
    aFetchedProperties = aFetchedProperties.filter(function (oProp) {
      return processedFieldsKeys.includes(oProp.key);
    });
    const oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
      mAllowedExpressions = oFR.FilterAllowedExpressions;
    //Object.keys(processedFields).forEach(function (sFilterFieldKey: string) {
    processedFields.forEach(function (oProp, iFilterFieldIndex) {
      const oSelField = aFetchedProperties[iFilterFieldIndex];
      if (!oSelField || !oSelField.conditionPath) {
        return;
      }
      const sPropertyPath = _getPropertyPath(oSelField.conditionPath);
      //fetchBasic
      oProp = Object.assign(oProp, {
        group: oSelField.group,
        groupLabel: oSelField.groupLabel,
        path: oSelField.conditionPath,
        tooltip: null,
        removeFromAppState: false,
        hasValueHelp: false
      });

      //fetchPropInfo
      if (oSelField.annotationPath) {
        const sAnnotationPath = oSelField.annotationPath;
        const oProperty = oMetaModel.getObject(sAnnotationPath),
          oPropertyAnnotations = oMetaModel.getObject(`${sAnnotationPath}@`),
          oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
        const bRemoveFromAppState = oPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || oPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] || oPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"];
        const sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, oSelField.annotationPath);
        const sProperty = sAnnotationPath.replace(`${sTargetPropertyPrefix}/`, "");
        let oFilterDefaultValueAnnotation;
        let oFilterDefaultValue;
        if (isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)) {
          oFilterDefaultValueAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.FilterDefaultValue"];
          if (oFilterDefaultValueAnnotation) {
            oFilterDefaultValue = oFilterDefaultValueAnnotation[`$${getModelType(oProperty.$Type)}`];
          }
          oProp = Object.assign(oProp, {
            tooltip: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.QuickInfo"] || undefined,
            removeFromAppState: bRemoveFromAppState,
            hasValueHelp: hasValueHelp(oPropertyContext.getObject(), {
              context: oPropertyContext
            }),
            defaultFilterConditions: oFilterDefaultValue ? [{
              fieldPath: oSelField.conditionPath,
              operator: "EQ",
              values: [oFilterDefaultValue]
            }] : undefined
          });
        }
      }

      //base

      if (oProp) {
        if (mAllowedExpressions[sPropertyPath] && mAllowedExpressions[sPropertyPath].length > 0) {
          oProp.filterExpression = CommonUtils.getSpecificAllowedExpression(mAllowedExpressions[sPropertyPath]);
        } else {
          oProp.filterExpression = "auto";
        }
        oProp = Object.assign(oProp, {
          visible: oSelField.availability === "Default"
        });
      }
      processedFields[iFilterFieldIndex] = oProp;
    });
    processedFields.forEach(function (propInfo) {
      if (propInfo.path === "$editState") {
        propInfo.label = getResourceModel(oFilterControl).getText("FILTERBAR_EDITING_STATUS");
      }
      propInfo.typeConfig = TypeUtil.getTypeConfig(propInfo.dataType, propInfo.formatOptions, propInfo.constraints);
      propInfo.label = getLocalizedText(propInfo.label, oFilterControl) || "";
      if (propInfo.isParameter) {
        aParameterFields.push(propInfo.name);
      }
    });
    aFetchedProperties = processedFields;
    DelegateUtil.setCustomData(oFilterControl, "parameters", aParameterFields);
    return aFetchedProperties;
  };
  function getLineItemQualifierFromTable(oControl, oMetaModel) {
    var _oMetaModel$getObject;
    if (oControl.isA("sap.fe.macros.table.TableAPI")) {
      const annotationPaths = oControl.getMetaPath().split("#")[0].split("/");
      switch (annotationPaths[annotationPaths.length - 1]) {
        case `@${"com.sap.vocabularies.UI.v1.SelectionPresentationVariant"}`:
        case `@${"com.sap.vocabularies.UI.v1.PresentationVariant"}`:
          return (_oMetaModel$getObject = oMetaModel.getObject(oControl.getMetaPath()).Visualizations) === null || _oMetaModel$getObject === void 0 ? void 0 : _oMetaModel$getObject.find(visualization => visualization.$AnnotationPath.includes(`@${"com.sap.vocabularies.UI.v1.LineItem"}`)).$AnnotationPath;
        case `@${"com.sap.vocabularies.UI.v1.LineItem"}`:
          const metaPaths = oControl.getMetaPath().split("/");
          return metaPaths[metaPaths.length - 1];
      }
    }
    return undefined;
  }
  ODataFilterBarDelegate._isFilterAdaptable = function (filterFieldInfo, propertyAnnotations, selectionFields, filterFacets) {
    var _propertyAnnotations$, _propertyAnnotations$2;
    let isSelectionField, isInFilterFacets;
    if (selectionFields) {
      isSelectionField = selectionFields.some(function (selectionField) {
        if (selectionField.value === filterFieldInfo.key) {
          return true;
        }
        return false;
      });
    } else {
      isSelectionField = false;
    }
    if (filterFacets) {
      isInFilterFacets = filterFacets.some(function (filterFacet) {
        var _filterFacet$Target;
        const fieldGroup = (_filterFacet$Target = filterFacet.Target) === null || _filterFacet$Target === void 0 ? void 0 : _filterFacet$Target.$target;
        return fieldGroup === null || fieldGroup === void 0 ? void 0 : fieldGroup.Data.some(function (dataField) {
          // we expect dataField to be DataFieldTypes (having a Value) inside FieldGroups inside FilterFacets
          if (dataField.Value.path === filterFieldInfo.key) {
            return true;
          }
          // dataField types having no Value (DataFieldForAnnotationTypes, DataFieldForActionAbstractTypes, DataFieldForActionGroupTypes), there is nothing to check, but this should not occur anyway
          return false;
        });
      });
    } else {
      isInFilterFacets = false;
    }
    return isSelectionField || isInFilterFacets || !((_propertyAnnotations$ = propertyAnnotations.annotations) !== null && _propertyAnnotations$ !== void 0 && (_propertyAnnotations$2 = _propertyAnnotations$.UI) !== null && _propertyAnnotations$2 !== void 0 && _propertyAnnotations$2.AdaptationHidden);
  };
  ODataFilterBarDelegate._addFlexItem = function (sFlexPropertyName, oParentControl, oMetaModel, oModifier, oAppComponent) {
    const sFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId(),
      sIdPrefix = oModifier ? "" : "Adaptation",
      aSelectionFields = FilterUtils.getConvertedFilterFields(oParentControl, null, undefined, oMetaModel, oAppComponent, oModifier, oModifier ? undefined : getLineItemQualifierFromTable(oParentControl.getParent(), oMetaModel)),
      oSelectionField = ODataFilterBarDelegate._findSelectionField(aSelectionFields, sFlexPropertyName),
      sPropertyPath = _getPropertyPath(sFlexPropertyName),
      bIsXML = !!oModifier && oModifier.targets === "xmlTree";
    if (sFlexPropertyName === EDIT_STATE_PROPERTY_NAME) {
      return _templateEditState(_generateIdPrefix(sFilterBarId, `${sIdPrefix}FilterField`), oMetaModel, oModifier);
    } else if (sFlexPropertyName === SEARCH_PROPERTY_NAME) {
      return Promise.resolve(null);
    } else if (oSelectionField !== null && oSelectionField !== void 0 && oSelectionField.template) {
      return ODataFilterBarDelegate._templateCustomFilter(oParentControl, _generateIdPrefix(sFilterBarId, `${sIdPrefix}FilterField`), oSelectionField, oMetaModel, oModifier);
    }
    if ((oSelectionField === null || oSelectionField === void 0 ? void 0 : oSelectionField.type) === "Slot" && oModifier) {
      return _addXMLCustomFilterField(oParentControl, oModifier, sPropertyPath);
    }
    const sNavigationPath = CommonHelper.getNavigationPath(sPropertyPath);
    let sEntityTypePath;
    let sUseSemanticDateRange;
    let oSettings;
    let sBindingPath;
    let oParameters;
    return Promise.resolve().then(function () {
      if (oSelectionField !== null && oSelectionField !== void 0 && oSelectionField.isParameter) {
        const sAnnotationPath = oSelectionField.annotationPath;
        return sAnnotationPath.substr(0, sAnnotationPath.lastIndexOf("/") + 1);
      }
      return DelegateUtil.getCustomData(oParentControl, "entityType", oModifier);
    }).then(function (sRetrievedEntityTypePath) {
      sEntityTypePath = sRetrievedEntityTypePath;
      return DelegateUtil.getCustomData(oParentControl, "useSemanticDateRange", oModifier);
    }).then(function (sRetrievedUseSemanticDateRange) {
      sUseSemanticDateRange = sRetrievedUseSemanticDateRange;
      const oPropertyContext = oMetaModel.createBindingContext(sEntityTypePath + sPropertyPath);
      const sInFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId();
      oSettings = {
        bindingContexts: {
          contextPath: oMetaModel.createBindingContext(sEntityTypePath),
          property: oPropertyContext
        },
        models: {
          contextPath: oMetaModel,
          property: oMetaModel
        },
        isXML: bIsXML
      };
      sBindingPath = `/${ModelHelper.getEntitySetPath(sEntityTypePath).split("/").filter(ModelHelper.filterOutNavPropBinding).join("/")}`;
      oParameters = {
        sPropertyName: sPropertyPath,
        sBindingPath: sBindingPath,
        sValueHelpType: sIdPrefix + VALUE_HELP_TYPE,
        oControl: oParentControl,
        oMetaModel: oMetaModel,
        oModifier: oModifier,
        sIdPrefix: _generateIdPrefix(sInFilterBarId, `${sIdPrefix}FilterField`, sNavigationPath),
        sVhIdPrefix: _generateIdPrefix(sInFilterBarId, sIdPrefix + VALUE_HELP_TYPE),
        sNavigationPrefix: sNavigationPath,
        bUseSemanticDateRange: sUseSemanticDateRange,
        oSettings: (oSelectionField === null || oSelectionField === void 0 ? void 0 : oSelectionField.settings) ?? {},
        visualFilter: oSelectionField === null || oSelectionField === void 0 ? void 0 : oSelectionField.visualFilter
      };
      return DelegateUtil.doesValueHelpExist(oParameters);
    }).then(function (bValueHelpExists) {
      if (!bValueHelpExists) {
        return _templateValueHelp(oSettings, oParameters);
      }
      return Promise.resolve();
    }).then(function () {
      let pageModel;
      if (oParameters.visualFilter) {
        //Need to set the convertercontext as pageModel in settings for BuildingBlock 2.0
        pageModel = CommonUtils.getTargetView(oParentControl).getController()._getPageModel();
      }
      return _templateFilterField(oSettings, oParameters, pageModel);
    });
  };
  function _getCachedProperties(oFilterBar) {
    // properties are not cached during templating
    if (oFilterBar instanceof window.Element) {
      return null;
    }
    return DelegateUtil.getCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY);
  }
  function _setCachedProperties(oFilterBar, aFetchedProperties) {
    // do not cache during templating, else it becomes part of the cached view
    if (oFilterBar instanceof window.Element) {
      return;
    }
    DelegateUtil.setCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY, aFetchedProperties);
  }
  function _getCachedOrFetchPropertiesForEntity(sEntityTypePath, oMetaModel, oFilterBar) {
    let aFetchedProperties = _getCachedProperties(oFilterBar);
    let localGroupLabel;
    if (!aFetchedProperties) {
      aFetchedProperties = ODataFilterBarDelegate.fetchPropertiesForEntity(sEntityTypePath, oMetaModel, oFilterBar);
      aFetchedProperties.forEach(function (oGroup) {
        localGroupLabel = null;
        if (oGroup.groupLabel) {
          localGroupLabel = getLocalizedText(oGroup.groupLabel, oFilterBar);
          oGroup.groupLabel = localGroupLabel === null ? oGroup.groupLabel : localGroupLabel;
        }
      });
      aFetchedProperties.sort(function (a, b) {
        if (a.groupLabel === undefined || a.groupLabel === null) {
          return -1;
        }
        if (b.groupLabel === undefined || b.groupLabel === null) {
          return 1;
        }
        return a.groupLabel.localeCompare(b.groupLabel);
      });
      _setCachedProperties(oFilterBar, aFetchedProperties);
    }
    return aFetchedProperties;
  }
  ODataFilterBarDelegate.fetchProperties = function (oFilterBar) {
    const sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
    return DelegateUtil.fetchModel(oFilterBar).then(function (oModel) {
      if (!oModel) {
        return [];
      }
      return _getCachedOrFetchPropertiesForEntity(sEntityTypePath, oModel.getMetaModel(), oFilterBar);
      // var aCleanedProperties = aProperties.concat();
      // var aAllowedAttributes = ["name", "label", "visible", "path", "typeConfig", "maxConditions", "group", "groupLabel"];
      // aCleanedProperties.forEach(function(oProperty) {
      // 	Object.keys(oProperty).forEach(function(sPropName) {
      // 		if (aAllowedAttributes.indexOf(sPropName) === -1) {
      // 			delete oProperty[sPropName];
      // 		}
      // 	});
      // });
      // return aCleanedProperties;
    });
  };

  ODataFilterBarDelegate.getTypeUtil = function () {
    return TypeUtil;
  };
  return ODataFilterBarDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPRGF0YUZpbHRlckJhckRlbGVnYXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiRmlsdGVyQmFyRGVsZWdhdGUiLCJhcGlWZXJzaW9uIiwiRURJVF9TVEFURV9QUk9QRVJUWV9OQU1FIiwiU0VBUkNIX1BST1BFUlRZX05BTUUiLCJWQUxVRV9IRUxQX1RZUEUiLCJGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVkiLCJDT05ESVRJT05fUEFUSF9UT19QUk9QRVJUWV9QQVRIX1JFR0VYIiwiX3RlbXBsYXRlRWRpdFN0YXRlIiwic0lkUHJlZml4IiwibWV0YU1vZGVsIiwib01vZGlmaWVyIiwib1RoaXMiLCJKU09OTW9kZWwiLCJpZCIsImlzRHJhZnRDb2xsYWJvcmF0aXZlIiwiTW9kZWxIZWxwZXIiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsImJpbmRpbmdDb250ZXh0cyIsInRoaXMiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsIm1vZGVscyIsIkRlbGVnYXRlVXRpbCIsInRlbXBsYXRlQ29udHJvbEZyYWdtZW50IiwidW5kZWZpbmVkIiwiZmluYWxseSIsImRlc3Ryb3kiLCJfdGVtcGxhdGVDdXN0b21GaWx0ZXIiLCJvRmlsdGVyQmFyIiwib1NlbGVjdGlvbkZpZWxkSW5mbyIsIm9NZXRhTW9kZWwiLCJzRW50aXR5VHlwZVBhdGgiLCJnZXRDdXN0b21EYXRhIiwib0l0ZW1Nb2RlbCIsIlRlbXBsYXRlTW9kZWwiLCJjb250ZXh0UGF0aCIsIml0ZW0iLCJvVmlldyIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsIm9Db250cm9sbGVyIiwiZ2V0Q29udHJvbGxlciIsIm9PcHRpb25zIiwiY29udHJvbGxlciIsInZpZXciLCJfZ2V0UHJvcGVydHlQYXRoIiwic0NvbmRpdGlvblBhdGgiLCJyZXBsYWNlIiwiX2ZpbmRTZWxlY3Rpb25GaWVsZCIsImFTZWxlY3Rpb25GaWVsZHMiLCJzRmxleE5hbWUiLCJmaW5kIiwib1NlbGVjdGlvbkZpZWxkIiwiY29uZGl0aW9uUGF0aCIsInJlcGxhY2VBbGwiLCJhdmFpbGFiaWxpdHkiLCJfZ2VuZXJhdGVJZFByZWZpeCIsInNGaWx0ZXJCYXJJZCIsInNDb250cm9sVHlwZSIsInNOYXZpZ2F0aW9uUHJlZml4IiwiZ2VuZXJhdGUiLCJfdGVtcGxhdGVWYWx1ZUhlbHAiLCJvU2V0dGluZ3MiLCJvUGFyYW1ldGVycyIsImlkUHJlZml4Iiwic1ZoSWRQcmVmaXgiLCJjb25kaXRpb25Nb2RlbCIsIm5hdmlnYXRpb25QcmVmaXgiLCJmaWx0ZXJGaWVsZFZhbHVlSGVscCIsInVzZVNlbWFudGljRGF0ZVJhbmdlIiwiYlVzZVNlbWFudGljRGF0ZVJhbmdlIiwibWVyZ2VPYmplY3RzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJpc1hNTCIsInRoZW4iLCJhVkhFbGVtZW50cyIsInNBZ2dyZWdhdGlvbk5hbWUiLCJsZW5ndGgiLCJmb3JFYWNoIiwiZWx0IiwiaW5zZXJ0QWdncmVnYXRpb24iLCJvQ29udHJvbCIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJfYWRkWE1MQ3VzdG9tRmlsdGVyRmllbGQiLCJzUHJvcGVydHlQYXRoIiwiYURlcGVuZGVudHMiLCJnZXRBZ2dyZWdhdGlvbiIsImkiLCJvRmlsdGVyRmllbGQiLCJpc0EiLCJzRGF0YVByb3BlcnR5IiwiZ2V0RmllbGRQYXRoIiwic0ZpbHRlckZpZWxkSWQiLCJnZXRJZCIsImluZGV4T2YiLCJfdGVtcGxhdGVGaWx0ZXJGaWVsZCIsInBhZ2VNb2RlbCIsInZoSWRQcmVmaXgiLCJwcm9wZXJ0eVBhdGgiLCJzUHJvcGVydHlOYW1lIiwic2V0dGluZ3MiLCJ2aXN1YWxGaWx0ZXIiLCJvVmlzdWFsRmlsdGVyIiwiY29udmVydGVyQ29udGV4dCIsIl9hZGRQcm9wZXJ0eUluZm8iLCJvUGFyZW50Q29udHJvbCIsIm1Qcm9wZXJ0eUJhZyIsInNQcm9wZXJ0eUluZm9OYW1lIiwic1Byb3BlcnR5SW5mb0tleSIsIm1vZGlmaWVyIiwiZGVsZWdhdGUiLCJnZXRQcm9wZXJ0eSIsImFQcm9wZXJ0eUluZm8iLCJoYXNQcm9wZXJ0eUluZm8iLCJzb21lIiwicHJvcCIsImtleSIsIm5hbWUiLCJlbnRpdHlUeXBlUGF0aCIsInBheWxvYWQiLCJGaWx0ZXJVdGlscyIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHQiLCJhcHBDb21wb25lbnQiLCJlbnRpdHlUeXBlIiwiZ2V0RW50aXR5VHlwZSIsImZpbHRlckZpZWxkIiwiZ2V0RmlsdGVyRmllbGQiLCJidWlsZFByb3BlcnlJbmZvIiwicHVzaCIsInNldFByb3BlcnR5IiwiZXJyb3JNc2ciLCJ3YXJuaW5nIiwiYWRkSXRlbSIsIl9hZGRQMTNuSXRlbSIsIm1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJ0YXJnZXRzIiwiX2FkZEZsZXhJdGVtIiwicmVtb3ZlSXRlbSIsIm9GaWx0ZXJGaWVsZFByb3BlcnR5IiwiZG9SZW1vdmVJdGVtIiwiZGF0YSIsImFkZENvbmRpdGlvbiIsInJlbW92ZUNvbmRpdGlvbiIsImNsZWFyRmlsdGVycyIsIm9GaWx0ZXJDb250cm9sIiwiY2xlYXJGaWx0ZXJWYWx1ZXMiLCJmZXRjaE1vZGVsIiwib01vZGVsIiwiZmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5Iiwib0VudGl0eVR5cGUiLCJnZXRPYmplY3QiLCJpbmNsdWRlSGlkZGVuIiwib0NvbnZlcnRlckNvbnRleHQiLCJzRW50aXR5U2V0UGF0aCIsImdldEVudGl0eVNldFBhdGgiLCJtRmlsdGVyRmllbGRzIiwiZ2V0Q29udmVydGVkRmlsdGVyRmllbGRzIiwiYUZldGNoZWRQcm9wZXJ0aWVzIiwib0ZpbHRlckZpZWxkSW5mbyIsInNBbm5vdGF0aW9uUGF0aCIsImFubm90YXRpb25QYXRoIiwib1Byb3BlcnR5QW5ub3RhdGlvbnMiLCJnZXRDb252ZXJ0ZWRUeXBlcyIsInJlc29sdmVQYXRoIiwidGFyZ2V0Iiwic1RhcmdldFByb3BlcnR5UHJlZml4IiwiQ29tbW9uSGVscGVyIiwiZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgiLCJzUHJvcGVydHkiLCJzZWxlY3Rpb25GaWVsZHMiLCJhbm5vdGF0aW9ucyIsIlVJIiwiU2VsZWN0aW9uRmllbGRzIiwiZmlsdGVyRmFjZXRzIiwiRmlsdGVyRmFjZXRzIiwiX2lzRmlsdGVyQWRhcHRhYmxlIiwiaXNQcm9wZXJ0eUZpbHRlcmFibGUiLCJhUGFyYW1ldGVyRmllbGRzIiwicHJvY2Vzc2VkRmllbGRzIiwicHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyIsInByb2Nlc3NlZEZpZWxkc0tleXMiLCJvUHJvcHMiLCJmaWx0ZXIiLCJvUHJvcCIsImluY2x1ZGVzIiwib0ZSIiwiZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoIiwibUFsbG93ZWRFeHByZXNzaW9ucyIsIkZpbHRlckFsbG93ZWRFeHByZXNzaW9ucyIsImlGaWx0ZXJGaWVsZEluZGV4Iiwib1NlbEZpZWxkIiwiZ3JvdXAiLCJncm91cExhYmVsIiwicGF0aCIsInRvb2x0aXAiLCJyZW1vdmVGcm9tQXBwU3RhdGUiLCJoYXNWYWx1ZUhlbHAiLCJvUHJvcGVydHkiLCJvUHJvcGVydHlDb250ZXh0IiwiYlJlbW92ZUZyb21BcHBTdGF0ZSIsIm9GaWx0ZXJEZWZhdWx0VmFsdWVBbm5vdGF0aW9uIiwib0ZpbHRlckRlZmF1bHRWYWx1ZSIsImdldE1vZGVsVHlwZSIsIiRUeXBlIiwiY29udGV4dCIsImRlZmF1bHRGaWx0ZXJDb25kaXRpb25zIiwiZmllbGRQYXRoIiwib3BlcmF0b3IiLCJ2YWx1ZXMiLCJmaWx0ZXJFeHByZXNzaW9uIiwiZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbiIsInZpc2libGUiLCJwcm9wSW5mbyIsImxhYmVsIiwiZ2V0UmVzb3VyY2VNb2RlbCIsImdldFRleHQiLCJ0eXBlQ29uZmlnIiwiVHlwZVV0aWwiLCJnZXRUeXBlQ29uZmlnIiwiZGF0YVR5cGUiLCJmb3JtYXRPcHRpb25zIiwiY29uc3RyYWludHMiLCJnZXRMb2NhbGl6ZWRUZXh0IiwiaXNQYXJhbWV0ZXIiLCJzZXRDdXN0b21EYXRhIiwiZ2V0TGluZUl0ZW1RdWFsaWZpZXJGcm9tVGFibGUiLCJhbm5vdGF0aW9uUGF0aHMiLCJnZXRNZXRhUGF0aCIsInNwbGl0IiwiVmlzdWFsaXphdGlvbnMiLCJ2aXN1YWxpemF0aW9uIiwiJEFubm90YXRpb25QYXRoIiwibWV0YVBhdGhzIiwiZmlsdGVyRmllbGRJbmZvIiwicHJvcGVydHlBbm5vdGF0aW9ucyIsImlzU2VsZWN0aW9uRmllbGQiLCJpc0luRmlsdGVyRmFjZXRzIiwic2VsZWN0aW9uRmllbGQiLCJ2YWx1ZSIsImZpbHRlckZhY2V0IiwiZmllbGRHcm91cCIsIlRhcmdldCIsIiR0YXJnZXQiLCJEYXRhIiwiZGF0YUZpZWxkIiwiVmFsdWUiLCJBZGFwdGF0aW9uSGlkZGVuIiwic0ZsZXhQcm9wZXJ0eU5hbWUiLCJvQXBwQ29tcG9uZW50IiwiZ2V0UGFyZW50IiwiYklzWE1MIiwidGVtcGxhdGUiLCJ0eXBlIiwic05hdmlnYXRpb25QYXRoIiwiZ2V0TmF2aWdhdGlvblBhdGgiLCJzVXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJzQmluZGluZ1BhdGgiLCJzdWJzdHIiLCJsYXN0SW5kZXhPZiIsInNSZXRyaWV2ZWRFbnRpdHlUeXBlUGF0aCIsInNSZXRyaWV2ZWRVc2VTZW1hbnRpY0RhdGVSYW5nZSIsInNJbkZpbHRlckJhcklkIiwicHJvcGVydHkiLCJmaWx0ZXJPdXROYXZQcm9wQmluZGluZyIsImpvaW4iLCJzVmFsdWVIZWxwVHlwZSIsImRvZXNWYWx1ZUhlbHBFeGlzdCIsImJWYWx1ZUhlbHBFeGlzdHMiLCJfZ2V0UGFnZU1vZGVsIiwiX2dldENhY2hlZFByb3BlcnRpZXMiLCJ3aW5kb3ciLCJFbGVtZW50IiwiX3NldENhY2hlZFByb3BlcnRpZXMiLCJfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkiLCJsb2NhbEdyb3VwTGFiZWwiLCJvR3JvdXAiLCJzb3J0IiwiYSIsImIiLCJsb2NhbGVDb21wYXJlIiwiZmV0Y2hQcm9wZXJ0aWVzIiwiZ2V0VHlwZVV0aWwiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckJhckRlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdERhdGFGaWVsZFR5cGVzLFxuXHRGaWVsZEdyb3VwVHlwZSxcblx0RmlsdGVyRmFjZXRzLFxuXHRSZWZlcmVuY2VGYWNldCxcblx0U2VsZWN0aW9uRmllbGRzLFxuXHRVSUFubm90YXRpb25UZXJtc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZU9iamVjdHMgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IEZpbHRlckZpZWxkLCBwcm9jZXNzU2VsZWN0aW9uRmllbGRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXJcIjtcbmltcG9ydCB7IGlzUHJvcGVydHlGaWx0ZXJhYmxlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTWV0YU1vZGVsRnVuY3Rpb25cIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0TG9jYWxpemVkVGV4dCwgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgeyBoYXNWYWx1ZUhlbHAgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUZvcm1hdHRlcnNcIjtcbmltcG9ydCB7IGdldE1vZGVsVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS90eXBlL0VETVwiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgRmlsdGVyQmFyRGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyRGVsZWdhdGVcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5jb25zdCBPRGF0YUZpbHRlckJhckRlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgRmlsdGVyQmFyRGVsZWdhdGUpIGFzIGFueTtcbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuYXBpVmVyc2lvbiA9IDI7XG5jb25zdCBFRElUX1NUQVRFX1BST1BFUlRZX05BTUUgPSBcIiRlZGl0U3RhdGVcIixcblx0U0VBUkNIX1BST1BFUlRZX05BTUUgPSBcIiRzZWFyY2hcIixcblx0VkFMVUVfSEVMUF9UWVBFID0gXCJGaWx0ZXJGaWVsZFZhbHVlSGVscFwiLFxuXHRGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVkgPSBcInNhcF9mZV9GaWx0ZXJCYXJEZWxlZ2F0ZV9wcm9wZXJ0eUluZm9NYXBcIixcblx0Q09ORElUSU9OX1BBVEhfVE9fUFJPUEVSVFlfUEFUSF9SRUdFWCA9IC9bKypdL2c7XG5cbmZ1bmN0aW9uIF90ZW1wbGF0ZUVkaXRTdGF0ZShzSWRQcmVmaXg6IGFueSwgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgb01vZGlmaWVyOiBhbnkpIHtcblx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdGlkOiBzSWRQcmVmaXgsXG5cdFx0XHRpc0RyYWZ0Q29sbGFib3JhdGl2ZTogTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQobWV0YU1vZGVsKVxuXHRcdH0pLFxuXHRcdG9QcmVwcm9jZXNzb3JTZXR0aW5ncyA9IHtcblx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHR0aGlzOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdH0sXG5cdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0Ly9cInRoaXMuaTE4blwiOiBSZXNvdXJjZU1vZGVsLmdldE1vZGVsKCksIFRPRE86IFRvIGJlIGNoZWNrZWQgd2h5IHRoaXMgaXMgbmVlZGVkLCBzaG91bGQgbm90IGJlIG5lZWRlZCBhdCBhbGxcblx0XHRcdFx0dGhpczogb1RoaXNcblx0XHRcdH1cblx0XHR9O1xuXG5cdHJldHVybiBEZWxlZ2F0ZVV0aWwudGVtcGxhdGVDb250cm9sRnJhZ21lbnQoXCJzYXAuZmUubWFjcm9zLmZpbHRlci5EcmFmdEVkaXRTdGF0ZVwiLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHVuZGVmaW5lZCwgb01vZGlmaWVyKS5maW5hbGx5KFxuXHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdG9UaGlzLmRlc3Ryb3koKTtcblx0XHR9XG5cdCk7XG59XG5cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX3RlbXBsYXRlQ3VzdG9tRmlsdGVyID0gYXN5bmMgZnVuY3Rpb24gKFxuXHRvRmlsdGVyQmFyOiBhbnksXG5cdHNJZFByZWZpeDogYW55LFxuXHRvU2VsZWN0aW9uRmllbGRJbmZvOiBhbnksXG5cdG9NZXRhTW9kZWw6IGFueSxcblx0b01vZGlmaWVyOiBhbnlcbikge1xuXHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBhd2FpdCBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvRmlsdGVyQmFyLCBcImVudGl0eVR5cGVcIiwgb01vZGlmaWVyKTtcblx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdGlkOiBzSWRQcmVmaXhcblx0XHR9KSxcblx0XHRvSXRlbU1vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwob1NlbGVjdGlvbkZpZWxkSW5mbywgb01ldGFNb2RlbCksXG5cdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdGNvbnRleHRQYXRoOiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNFbnRpdHlUeXBlUGF0aCksXG5cdFx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSxcblx0XHRcdFx0aXRlbTogb0l0ZW1Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdH0sXG5cdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0Y29udGV4dFBhdGg6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdHRoaXM6IG9UaGlzLFxuXHRcdFx0XHRpdGVtOiBvSXRlbU1vZGVsXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob0ZpbHRlckJhciksXG5cdFx0b0NvbnRyb2xsZXIgPSBvVmlldyA/IG9WaWV3LmdldENvbnRyb2xsZXIoKSA6IHVuZGVmaW5lZCxcblx0XHRvT3B0aW9ucyA9IHtcblx0XHRcdGNvbnRyb2xsZXI6IG9Db250cm9sbGVyID8gb0NvbnRyb2xsZXIgOiB1bmRlZmluZWQsXG5cdFx0XHR2aWV3OiBvVmlld1xuXHRcdH07XG5cblx0cmV0dXJuIERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChcInNhcC5mZS5tYWNyb3MuZmlsdGVyLkN1c3RvbUZpbHRlclwiLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIG9PcHRpb25zLCBvTW9kaWZpZXIpLmZpbmFsbHkoXG5cdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdFx0b0l0ZW1Nb2RlbC5kZXN0cm95KCk7XG5cdFx0fVxuXHQpO1xufTtcbmZ1bmN0aW9uIF9nZXRQcm9wZXJ0eVBhdGgoc0NvbmRpdGlvblBhdGg6IGFueSkge1xuXHRyZXR1cm4gc0NvbmRpdGlvblBhdGgucmVwbGFjZShDT05ESVRJT05fUEFUSF9UT19QUk9QRVJUWV9QQVRIX1JFR0VYLCBcIlwiKTtcbn1cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2ZpbmRTZWxlY3Rpb25GaWVsZCA9IGZ1bmN0aW9uIChhU2VsZWN0aW9uRmllbGRzOiBhbnksIHNGbGV4TmFtZTogYW55KSB7XG5cdHJldHVybiBhU2VsZWN0aW9uRmllbGRzLmZpbmQoZnVuY3Rpb24gKG9TZWxlY3Rpb25GaWVsZDogYW55KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdChvU2VsZWN0aW9uRmllbGQuY29uZGl0aW9uUGF0aCA9PT0gc0ZsZXhOYW1lIHx8IG9TZWxlY3Rpb25GaWVsZC5jb25kaXRpb25QYXRoLnJlcGxhY2VBbGwoL1xcKi9nLCBcIlwiKSA9PT0gc0ZsZXhOYW1lKSAmJlxuXHRcdFx0b1NlbGVjdGlvbkZpZWxkLmF2YWlsYWJpbGl0eSAhPT0gXCJIaWRkZW5cIlxuXHRcdCk7XG5cdH0pO1xufTtcbmZ1bmN0aW9uIF9nZW5lcmF0ZUlkUHJlZml4KHNGaWx0ZXJCYXJJZDogYW55LCBzQ29udHJvbFR5cGU6IGFueSwgc05hdmlnYXRpb25QcmVmaXg/OiBhbnkpIHtcblx0cmV0dXJuIHNOYXZpZ2F0aW9uUHJlZml4ID8gZ2VuZXJhdGUoW3NGaWx0ZXJCYXJJZCwgc0NvbnRyb2xUeXBlLCBzTmF2aWdhdGlvblByZWZpeF0pIDogZ2VuZXJhdGUoW3NGaWx0ZXJCYXJJZCwgc0NvbnRyb2xUeXBlXSk7XG59XG5mdW5jdGlvbiBfdGVtcGxhdGVWYWx1ZUhlbHAob1NldHRpbmdzOiBhbnksIG9QYXJhbWV0ZXJzOiBhbnkpIHtcblx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRpZFByZWZpeDogb1BhcmFtZXRlcnMuc1ZoSWRQcmVmaXgsXG5cdFx0Y29uZGl0aW9uTW9kZWw6IFwiJGZpbHRlcnNcIixcblx0XHRuYXZpZ2F0aW9uUHJlZml4OiBvUGFyYW1ldGVycy5zTmF2aWdhdGlvblByZWZpeCA/IGAvJHtvUGFyYW1ldGVycy5zTmF2aWdhdGlvblByZWZpeH1gIDogXCJcIixcblx0XHRmaWx0ZXJGaWVsZFZhbHVlSGVscDogdHJ1ZSxcblx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZTogb1BhcmFtZXRlcnMuYlVzZVNlbWFudGljRGF0ZVJhbmdlXG5cdH0pO1xuXHRjb25zdCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSBtZXJnZU9iamVjdHMoe30sIG9TZXR0aW5ncywge1xuXHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0fSxcblx0XHRtb2RlbHM6IHtcblx0XHRcdHRoaXM6IG9UaGlzXG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFxuXHRcdERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudmFsdWVoZWxwLlZhbHVlSGVscFwiLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHtcblx0XHRcdGlzWE1MOiBvU2V0dGluZ3MuaXNYTUxcblx0XHR9KVxuXHQpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKGFWSEVsZW1lbnRzOiBhbnkpIHtcblx0XHRcdGlmIChhVkhFbGVtZW50cykge1xuXHRcdFx0XHRjb25zdCBzQWdncmVnYXRpb25OYW1lID0gXCJkZXBlbmRlbnRzXCI7XG5cdFx0XHRcdC8vU29tZSBmaWx0ZXIgZmllbGRzIGhhdmUgdGhlIFBlcnNpc3RlbmNlUHJvdmlkZXIgYWdncmVnYXRpb24gYmVzaWRlcyB0aGUgRlZIIDpcblx0XHRcdFx0aWYgKGFWSEVsZW1lbnRzLmxlbmd0aCkge1xuXHRcdFx0XHRcdGFWSEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24gKGVsdDogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAob1BhcmFtZXRlcnMub01vZGlmaWVyKSB7XG5cdFx0XHRcdFx0XHRcdG9QYXJhbWV0ZXJzLm9Nb2RpZmllci5pbnNlcnRBZ2dyZWdhdGlvbihvUGFyYW1ldGVycy5vQ29udHJvbCwgc0FnZ3JlZ2F0aW9uTmFtZSwgZWx0LCAwKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9QYXJhbWV0ZXJzLm9Db250cm9sLmluc2VydEFnZ3JlZ2F0aW9uKHNBZ2dyZWdhdGlvbk5hbWUsIGVsdCwgMCwgZmFsc2UpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9QYXJhbWV0ZXJzLm9Nb2RpZmllcikge1xuXHRcdFx0XHRcdG9QYXJhbWV0ZXJzLm9Nb2RpZmllci5pbnNlcnRBZ2dyZWdhdGlvbihvUGFyYW1ldGVycy5vQ29udHJvbCwgc0FnZ3JlZ2F0aW9uTmFtZSwgYVZIRWxlbWVudHMsIDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9QYXJhbWV0ZXJzLm9Db250cm9sLmluc2VydEFnZ3JlZ2F0aW9uKHNBZ2dyZWdhdGlvbk5hbWUsIGFWSEVsZW1lbnRzLCAwLCBmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGV2YWx1YXRpbmcgRGVsZWdhdGVVdGlsLmlzVmFsdWVIZWxwUmVxdWlyZWRcIiwgb0Vycm9yKTtcblx0XHR9KVxuXHRcdC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRcdG9UaGlzLmRlc3Ryb3koKTtcblx0XHR9KTtcbn1cbmFzeW5jIGZ1bmN0aW9uIF9hZGRYTUxDdXN0b21GaWx0ZXJGaWVsZChvRmlsdGVyQmFyOiBhbnksIG9Nb2RpZmllcjogYW55LCBzUHJvcGVydHlQYXRoOiBhbnkpIHtcblx0dHJ5IHtcblx0XHRjb25zdCBhRGVwZW5kZW50cyA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShvTW9kaWZpZXIuZ2V0QWdncmVnYXRpb24ob0ZpbHRlckJhciwgXCJkZXBlbmRlbnRzXCIpKTtcblx0XHRsZXQgaTtcblx0XHRpZiAoYURlcGVuZGVudHMgJiYgYURlcGVuZGVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Zm9yIChpID0gMDsgaSA8PSBhRGVwZW5kZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBvRmlsdGVyRmllbGQgPSBhRGVwZW5kZW50c1tpXTtcblx0XHRcdFx0aWYgKG9GaWx0ZXJGaWVsZCAmJiBvRmlsdGVyRmllbGQuaXNBKFwic2FwLnVpLm1kYy5GaWx0ZXJGaWVsZFwiKSkge1xuXHRcdFx0XHRcdGNvbnN0IHNEYXRhUHJvcGVydHkgPSBvRmlsdGVyRmllbGQuZ2V0RmllbGRQYXRoKCksXG5cdFx0XHRcdFx0XHRzRmlsdGVyRmllbGRJZCA9IG9GaWx0ZXJGaWVsZC5nZXRJZCgpO1xuXHRcdFx0XHRcdGlmIChzUHJvcGVydHlQYXRoID09PSBzRGF0YVByb3BlcnR5ICYmIHNGaWx0ZXJGaWVsZElkLmluZGV4T2YoXCJDdXN0b21GaWx0ZXJGaWVsZFwiKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShvRmlsdGVyRmllbGQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRMb2cuZXJyb3IoXCJGaWx0ZXIgQ2Fubm90IGJlIGFkZGVkXCIsIG9FcnJvcik7XG5cdH1cbn1cbmZ1bmN0aW9uIF90ZW1wbGF0ZUZpbHRlckZpZWxkKG9TZXR0aW5nczogYW55LCBvUGFyYW1ldGVyczogYW55LCBwYWdlTW9kZWw/OiBKU09OTW9kZWwpIHtcblx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRpZFByZWZpeDogb1BhcmFtZXRlcnMuc0lkUHJlZml4LFxuXHRcdHZoSWRQcmVmaXg6IG9QYXJhbWV0ZXJzLnNWaElkUHJlZml4LFxuXHRcdHByb3BlcnR5UGF0aDogb1BhcmFtZXRlcnMuc1Byb3BlcnR5TmFtZSxcblx0XHRuYXZpZ2F0aW9uUHJlZml4OiBvUGFyYW1ldGVycy5zTmF2aWdhdGlvblByZWZpeCA/IGAvJHtvUGFyYW1ldGVycy5zTmF2aWdhdGlvblByZWZpeH1gIDogXCJcIixcblx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZTogb1BhcmFtZXRlcnMuYlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdHNldHRpbmdzOiBvUGFyYW1ldGVycy5vU2V0dGluZ3MsXG5cdFx0dmlzdWFsRmlsdGVyOiBvUGFyYW1ldGVycy52aXN1YWxGaWx0ZXJcblx0fSk7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvUGFyYW1ldGVycy5vTWV0YU1vZGVsO1xuXHRjb25zdCBvVmlzdWFsRmlsdGVyID0gbmV3IFRlbXBsYXRlTW9kZWwob1BhcmFtZXRlcnMudmlzdWFsRmlsdGVyLCBvTWV0YU1vZGVsKTtcblx0Y29uc3Qgb1ByZXByb2Nlc3NvclNldHRpbmdzID0gbWVyZ2VPYmplY3RzKHt9LCBvU2V0dGluZ3MsIHtcblx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSxcblx0XHRcdHZpc3VhbEZpbHRlcjogb1Zpc3VhbEZpbHRlci5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHR9LFxuXHRcdG1vZGVsczoge1xuXHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHR2aXN1YWxGaWx0ZXI6IG9WaXN1YWxGaWx0ZXIsXG5cdFx0XHRtZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBwYWdlTW9kZWxcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBEZWxlZ2F0ZVV0aWwudGVtcGxhdGVDb250cm9sRnJhZ21lbnQoXCJzYXAuZmUubWFjcm9zLmludGVybmFsLmZpbHRlckZpZWxkLkZpbHRlckZpZWxkVGVtcGxhdGVcIiwgb1ByZXByb2Nlc3NvclNldHRpbmdzLCB7XG5cdFx0aXNYTUw6IG9TZXR0aW5ncy5pc1hNTFxuXHR9KS5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRvVGhpcy5kZXN0cm95KCk7XG5cdH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBfYWRkUHJvcGVydHlJbmZvKG9QYXJlbnRDb250cm9sOiBGaWx0ZXJCYXIsIG1Qcm9wZXJ0eUJhZzogYW55LCBvTWV0YU1vZGVsOiBhbnksIHNQcm9wZXJ0eUluZm9OYW1lOiBzdHJpbmcpIHtcblx0dHJ5IHtcblx0XHRzUHJvcGVydHlJbmZvTmFtZSA9IHNQcm9wZXJ0eUluZm9OYW1lLnJlcGxhY2UoXCIqXCIsIFwiXCIpO1xuXHRcdGNvbnN0IHNQcm9wZXJ0eUluZm9LZXkgPSBnZW5lcmF0ZShbc1Byb3BlcnR5SW5mb05hbWVdKTsgLy9NYWtpbmcgc3VyZSB0aGF0IG5hdmlnYXRpb24gcHJvcGVydHkgbmFtZXMgYXJlIGdlbmVyYXRlZCBwcm9wZXJseSBlLmcuIF9JdGVtOjpNYXRlcmlhbFxuXHRcdGlmIChtUHJvcGVydHlCYWcgJiYgIW1Qcm9wZXJ0eUJhZy5tb2RpZmllcikge1xuXHRcdFx0dGhyb3cgXCJGaWx0ZXJCYXIgRGVsZWdhdGUgbWV0aG9kIGNhbGxlZCB3aXRob3V0IG1vZGlmaWVyLlwiO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRlbGVnYXRlID0gYXdhaXQgbVByb3BlcnR5QmFnLm1vZGlmaWVyLmdldFByb3BlcnR5KG9QYXJlbnRDb250cm9sLCBcImRlbGVnYXRlXCIpO1xuXHRcdGNvbnN0IGFQcm9wZXJ0eUluZm8gPSBhd2FpdCBtUHJvcGVydHlCYWcubW9kaWZpZXIuZ2V0UHJvcGVydHkob1BhcmVudENvbnRyb2wsIFwicHJvcGVydHlJbmZvXCIpO1xuXHRcdC8vV2UgZG8gbm90IGdldCBwcm9wZXJ0eUluZm8gaW4gY2FzZSBvZiB0YWJsZSBmaWx0ZXJzXG5cdFx0aWYgKGFQcm9wZXJ0eUluZm8pIHtcblx0XHRcdGNvbnN0IGhhc1Byb3BlcnR5SW5mbyA9IGFQcm9wZXJ0eUluZm8uc29tZShmdW5jdGlvbiAocHJvcDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBwcm9wLmtleSA9PT0gc1Byb3BlcnR5SW5mb0tleSB8fCBwcm9wLm5hbWUgPT09IHNQcm9wZXJ0eUluZm9LZXk7XG5cdFx0XHR9KTtcblx0XHRcdGlmICghaGFzUHJvcGVydHlJbmZvKSB7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVR5cGVQYXRoID0gZGVsZWdhdGUucGF5bG9hZC5lbnRpdHlUeXBlUGF0aDtcblx0XHRcdFx0Y29uc3QgY29udmVydGVyQ29udGV4dCA9IEZpbHRlclV0aWxzLmNyZWF0ZUNvbnZlcnRlckNvbnRleHQoXG5cdFx0XHRcdFx0b1BhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0ZW50aXR5VHlwZVBhdGgsXG5cdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0XHRcdFx0bGV0IGZpbHRlckZpZWxkID0gRmlsdGVyVXRpbHMuZ2V0RmlsdGVyRmllbGQoc1Byb3BlcnR5SW5mb05hbWUsIGNvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGUpO1xuXHRcdFx0XHRmaWx0ZXJGaWVsZCA9IEZpbHRlclV0aWxzLmJ1aWxkUHJvcGVyeUluZm8oZmlsdGVyRmllbGQsIGNvbnZlcnRlckNvbnRleHQpIGFzIEZpbHRlckZpZWxkIHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRhUHJvcGVydHlJbmZvLnB1c2goZmlsdGVyRmllbGQpO1xuXHRcdFx0XHRtUHJvcGVydHlCYWcubW9kaWZpZXIuc2V0UHJvcGVydHkob1BhcmVudENvbnRyb2wsIFwicHJvcGVydHlJbmZvXCIsIGFQcm9wZXJ0eUluZm8pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBjYXRjaCAoZXJyb3JNc2cpIHtcblx0XHRMb2cud2FybmluZyhgJHtvUGFyZW50Q29udHJvbC5nZXRJZCgpfSA6ICR7ZXJyb3JNc2d9YCk7XG5cdH1cbn1cblxuLyoqXG4gKiBNZXRob2QgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGZpbHRlciBmaWVsZCBpbiBzdGFuZGFsb25lIG1vZGUgLyBpbiB0aGUgcGVyc29uYWxpemF0aW9uIHNldHRpbmdzIG9mIHRoZSBmaWx0ZXIgYmFyLlxuICpcbiAqIEBwYXJhbSBzUHJvcGVydHlJbmZvTmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSBiZWluZyBhZGRlZCBhcyB0aGUgZmlsdGVyIGZpZWxkXG4gKiBAcGFyYW0gb1BhcmVudENvbnRyb2wgUGFyZW50IGNvbnRyb2wgaW5zdGFuY2UgdG8gd2hpY2ggdGhlIGZpbHRlciBmaWVsZCBpcyBhZGRlZFxuICogQHBhcmFtIG1Qcm9wZXJ0eUJhZyBJbnN0YW5jZSBvZiB0aGUgcHJvcGVydHkgYmFnIGZyb20gRmxleCBBUElcbiAqIEByZXR1cm5zIE9uY2UgcmVzb2x2ZWQsIGEgZmlsdGVyIGZpZWxkIGRlZmluaXRpb24gaXMgcmV0dXJuZWRcbiAqL1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5hZGRJdGVtID0gYXN5bmMgZnVuY3Rpb24gKG9QYXJlbnRDb250cm9sOiBGaWx0ZXJCYXIsIHNQcm9wZXJ0eUluZm9OYW1lOiBzdHJpbmcsIG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdGlmICghbVByb3BlcnR5QmFnKSB7XG5cdFx0Ly8gSW52b2tlZCBkdXJpbmcgcnVudGltZS5cblx0XHRyZXR1cm4gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fYWRkUDEzbkl0ZW0oc1Byb3BlcnR5SW5mb05hbWUsIG9QYXJlbnRDb250cm9sKTtcblx0fVxuXHRjb25zdCBtb2RpZmllciA9IG1Qcm9wZXJ0eUJhZy5tb2RpZmllcjtcblx0Y29uc3QgbW9kZWwgPSBtUHJvcGVydHlCYWcgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50LmdldE1vZGVsKCk7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBtb2RlbCAmJiBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0aWYgKCFvTWV0YU1vZGVsKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0fVxuXHRjb25zdCBpc1hNTCA9IG1vZGlmaWVyICYmIG1vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiO1xuXHRpZiAoaXNYTUwpIHtcblx0XHRhd2FpdCBfYWRkUHJvcGVydHlJbmZvKG9QYXJlbnRDb250cm9sLCBtUHJvcGVydHlCYWcsIG9NZXRhTW9kZWwsIHNQcm9wZXJ0eUluZm9OYW1lKTtcblx0fVxuXHRyZXR1cm4gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fYWRkRmxleEl0ZW0oc1Byb3BlcnR5SW5mb05hbWUsIG9QYXJlbnRDb250cm9sLCBvTWV0YU1vZGVsLCBtb2RpZmllciwgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCk7XG59O1xuXG4vKipcbiAqIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgcmVtb3ZpbmcgZmlsdGVyIGZpZWxkIGluIHN0YW5kYWxvbmUgLyBwZXJzb25hbGl6YXRpb24gZmlsdGVyIGJhci5cbiAqXG4gKiBAcGFyYW0gb0ZpbHRlckZpZWxkUHJvcGVydHkgT2JqZWN0IG9mIHRoZSBmaWx0ZXIgZmllbGQgcHJvcGVydHkgYmVpbmcgcmVtb3ZlZCBhcyBmaWx0ZXIgZmllbGRcbiAqIEBwYXJhbSBvUGFyZW50Q29udHJvbCBQYXJlbnQgY29udHJvbCBpbnN0YW5jZSBmcm9tIHdoaWNoIHRoZSBmaWx0ZXIgZmllbGQgaXMgcmVtb3ZlZFxuICogQHBhcmFtIG1Qcm9wZXJ0eUJhZyBJbnN0YW5jZSBvZiBwcm9wZXJ0eSBiYWcgZnJvbSBGbGV4IEFQSVxuICogQHJldHVybnMgVGhlIHJlc29sdmVkIHByb21pc2VcbiAqL1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5yZW1vdmVJdGVtID0gYXN5bmMgZnVuY3Rpb24gKG9QYXJlbnRDb250cm9sOiBhbnksIG9GaWx0ZXJGaWVsZFByb3BlcnR5OiBhbnksIG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdGxldCBkb1JlbW92ZUl0ZW0gPSB0cnVlO1xuXHRjb25zdCBtb2RpZmllciA9IG1Qcm9wZXJ0eUJhZy5tb2RpZmllcjtcblx0Y29uc3QgaXNYTUwgPSBtb2RpZmllciAmJiBtb2RpZmllci50YXJnZXRzID09PSBcInhtbFRyZWVcIjtcblx0aWYgKGlzWE1MICYmICFvUGFyZW50Q29udHJvbC5kYXRhKFwic2FwX2ZlX0ZpbHRlckJhckRlbGVnYXRlX3Byb3BlcnR5SW5mb01hcFwiKSkge1xuXHRcdGNvbnN0IG1vZGVsID0gbVByb3BlcnR5QmFnICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudC5nZXRNb2RlbCgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBtb2RlbCAmJiBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRpZiAoIW9NZXRhTW9kZWwpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXHRcdGlmICh0eXBlb2Ygb0ZpbHRlckZpZWxkUHJvcGVydHkgIT09IFwic3RyaW5nXCIgJiYgb0ZpbHRlckZpZWxkUHJvcGVydHkuZ2V0RmllbGRQYXRoKCkpIHtcblx0XHRcdGF3YWl0IF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2wsIG1Qcm9wZXJ0eUJhZywgb01ldGFNb2RlbCwgb0ZpbHRlckZpZWxkUHJvcGVydHkuZ2V0RmllbGRQYXRoKCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhd2FpdCBfYWRkUHJvcGVydHlJbmZvKG9QYXJlbnRDb250cm9sLCBtUHJvcGVydHlCYWcsIG9NZXRhTW9kZWwsIG9GaWx0ZXJGaWVsZFByb3BlcnR5KTtcblx0XHR9XG5cdH1cblx0aWYgKHR5cGVvZiBvRmlsdGVyRmllbGRQcm9wZXJ0eSAhPT0gXCJzdHJpbmdcIiAmJiBvRmlsdGVyRmllbGRQcm9wZXJ0eS5pc0EgJiYgb0ZpbHRlckZpZWxkUHJvcGVydHkuaXNBKFwic2FwLnVpLm1kYy5GaWx0ZXJGaWVsZFwiKSkge1xuXHRcdGlmIChvRmlsdGVyRmllbGRQcm9wZXJ0eS5kYXRhKFwiaXNTbG90XCIpID09PSBcInRydWVcIiAmJiBtUHJvcGVydHlCYWcpIHtcblx0XHRcdC8vIEluc2VydGluZyBpbnRvIHRoZSBtb2RpZmllciBjcmVhdGVzIGEgY2hhbmdlIGZyb20gZmxleCBhbHNvIGZpbHRlciBpcyBiZWVuIHJlbW92ZWQgaGVuY2UgcHJvbWlzZSBpcyByZXNvbHZlZCB0byBmYWxzZVxuXHRcdFx0bW9kaWZpZXIuaW5zZXJ0QWdncmVnYXRpb24ob1BhcmVudENvbnRyb2wsIFwiZGVwZW5kZW50c1wiLCBvRmlsdGVyRmllbGRQcm9wZXJ0eSk7XG5cdFx0XHRkb1JlbW92ZUl0ZW0gPSBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShkb1JlbW92ZUl0ZW0pO1xufTtcblxuLyoqXG4gKiBNZXRob2QgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGZpbHRlciBmaWVsZCBjb25kaXRpb24gaW4gc3RhbmRhbG9uZSAvIHBlcnNvbmFsaXphdGlvbiBmaWx0ZXIgYmFyLlxuICpcbiAqIEBwYXJhbSBzUHJvcGVydHlJbmZvTmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSBiZWluZyBhZGRlZCBhcyBmaWx0ZXIgZmllbGRcbiAqIEBwYXJhbSBvUGFyZW50Q29udHJvbCBQYXJlbnQgY29udHJvbCBpbnN0YW5jZSB0byB3aGljaCB0aGUgZmlsdGVyIGZpZWxkIGlzIGFkZGVkXG4gKiBAcGFyYW0gbVByb3BlcnR5QmFnIEluc3RhbmNlIG9mIHByb3BlcnR5IGJhZyBmcm9tIEZsZXggQVBJXG4gKiBAcmV0dXJucyBUaGUgcmVzb2x2ZWQgcHJvbWlzZVxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmFkZENvbmRpdGlvbiA9IGFzeW5jIGZ1bmN0aW9uIChvUGFyZW50Q29udHJvbDogRmlsdGVyQmFyLCBzUHJvcGVydHlJbmZvTmFtZTogc3RyaW5nLCBtUHJvcGVydHlCYWc6IGFueSkge1xuXHRjb25zdCBtb2RpZmllciA9IG1Qcm9wZXJ0eUJhZy5tb2RpZmllcjtcblx0Y29uc3QgaXNYTUwgPSBtb2RpZmllciAmJiBtb2RpZmllci50YXJnZXRzID09PSBcInhtbFRyZWVcIjtcblx0aWYgKGlzWE1MKSB7XG5cdFx0Y29uc3QgbW9kZWwgPSBtUHJvcGVydHlCYWcgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG1vZGVsICYmIG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cdFx0YXdhaXQgX2FkZFByb3BlcnR5SW5mbyhvUGFyZW50Q29udHJvbCwgbVByb3BlcnR5QmFnLCBvTWV0YU1vZGVsLCBzUHJvcGVydHlJbmZvTmFtZSk7XG5cdH1cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xufTtcblxuLyoqXG4gKiBNZXRob2QgcmVzcG9uc2libGUgZm9yIHJlbW92aW5nIGZpbHRlciBmaWVsZCBpbiBzdGFuZGFsb25lIC8gcGVyc29uYWxpemF0aW9uIGZpbHRlciBiYXIuXG4gKlxuICogQHBhcmFtIHNQcm9wZXJ0eUluZm9OYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5IGJlaW5nIHJlbW92ZWQgYXMgZmlsdGVyIGZpZWxkXG4gKiBAcGFyYW0gb1BhcmVudENvbnRyb2wgUGFyZW50IGNvbnRyb2wgaW5zdGFuY2UgZnJvbSB3aGljaCB0aGUgZmlsdGVyIGZpZWxkIGlzIHJlbW92ZWRcbiAqIEBwYXJhbSBtUHJvcGVydHlCYWcgSW5zdGFuY2Ugb2YgcHJvcGVydHkgYmFnIGZyb20gRmxleCBBUElcbiAqIEByZXR1cm5zIFRoZSByZXNvbHZlZCBwcm9taXNlXG4gKi9cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUucmVtb3ZlQ29uZGl0aW9uID0gYXN5bmMgZnVuY3Rpb24gKG9QYXJlbnRDb250cm9sOiBGaWx0ZXJCYXIsIHNQcm9wZXJ0eUluZm9OYW1lOiBzdHJpbmcsIG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdGlmICghb1BhcmVudENvbnRyb2wuZGF0YShcInNhcF9mZV9GaWx0ZXJCYXJEZWxlZ2F0ZV9wcm9wZXJ0eUluZm9NYXBcIikpIHtcblx0XHRjb25zdCBtb2RpZmllciA9IG1Qcm9wZXJ0eUJhZy5tb2RpZmllcjtcblx0XHRjb25zdCBpc1hNTCA9IG1vZGlmaWVyICYmIG1vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiO1xuXHRcdGlmIChpc1hNTCkge1xuXHRcdFx0Y29uc3QgbW9kZWwgPSBtUHJvcGVydHlCYWcgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50LmdldE1vZGVsKCk7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gbW9kZWwgJiYgbW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRpZiAoIW9NZXRhTW9kZWwpIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHRcdH1cblx0XHRcdGF3YWl0IF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2wsIG1Qcm9wZXJ0eUJhZywgb01ldGFNb2RlbCwgc1Byb3BlcnR5SW5mb05hbWUpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG59O1xuLyoqXG4gKiBDbGVhcnMgYWxsIGlucHV0IHZhbHVlcyBvZiB2aXNpYmxlIGZpbHRlciBmaWVsZHMgaW4gdGhlIGZpbHRlciBiYXIuXG4gKlxuICogQHBhcmFtIG9GaWx0ZXJDb250cm9sIEluc3RhbmNlIG9mIHRoZSBGaWx0ZXJCYXIgY29udHJvbFxuICogQHJldHVybnMgVGhlIHJlc29sdmVkIHByb21pc2VcbiAqL1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5jbGVhckZpbHRlcnMgPSBhc3luYyBmdW5jdGlvbiAob0ZpbHRlckNvbnRyb2w6IHVua25vd24pIHtcblx0cmV0dXJuIEZpbHRlclV0aWxzLmNsZWFyRmlsdGVyVmFsdWVzKG9GaWx0ZXJDb250cm9sKTtcbn07XG4vKipcbiAqIENyZWF0ZXMgdGhlIGZpbHRlciBmaWVsZCBpbiB0aGUgdGFibGUgYWRhcHRhdGlvbiBvZiB0aGUgRmlsdGVyQmFyLlxuICpcbiAqIEBwYXJhbSBzUHJvcGVydHlJbmZvTmFtZSBUaGUgcHJvcGVydHkgbmFtZSBvZiB0aGUgZW50aXR5IHR5cGUgZm9yIHdoaWNoIHRoZSBmaWx0ZXIgZmllbGQgbmVlZHMgdG8gYmUgY3JlYXRlZFxuICogQHBhcmFtIG9QYXJlbnRDb250cm9sIEluc3RhbmNlIG9mIHRoZSBwYXJlbnQgY29udHJvbFxuICogQHJldHVybnMgT25jZSByZXNvbHZlZCwgYSBmaWx0ZXIgZmllbGQgZGVmaW5pdGlvbiBpcyByZXR1cm5lZFxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLl9hZGRQMTNuSXRlbSA9IGZ1bmN0aW9uIChzUHJvcGVydHlJbmZvTmFtZTogc3RyaW5nLCBvUGFyZW50Q29udHJvbDogb2JqZWN0KSB7XG5cdHJldHVybiBEZWxlZ2F0ZVV0aWwuZmV0Y2hNb2RlbChvUGFyZW50Q29udHJvbClcblx0XHQudGhlbihmdW5jdGlvbiAob01vZGVsOiBhbnkpIHtcblx0XHRcdHJldHVybiBPRGF0YUZpbHRlckJhckRlbGVnYXRlLl9hZGRGbGV4SXRlbShzUHJvcGVydHlJbmZvTmFtZSwgb1BhcmVudENvbnRyb2wsIG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSwgdW5kZWZpbmVkKTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIk1vZGVsIGNvdWxkIG5vdCBiZSByZXNvbHZlZFwiLCBvRXJyb3IpO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSk7XG59O1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5mZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkgPSBmdW5jdGlvbiAoc0VudGl0eVR5cGVQYXRoOiBhbnksIG9NZXRhTW9kZWw6IGFueSwgb0ZpbHRlckNvbnRyb2w6IGFueSkge1xuXHRjb25zdCBvRW50aXR5VHlwZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNFbnRpdHlUeXBlUGF0aCk7XG5cdGNvbnN0IGluY2x1ZGVIaWRkZW4gPSBvRmlsdGVyQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLmZpbHRlcmJhci52aC5GaWx0ZXJCYXJcIikgPyB0cnVlIDogdW5kZWZpbmVkO1xuXHRpZiAoIW9GaWx0ZXJDb250cm9sIHx8ICFvRW50aXR5VHlwZSkge1xuXHRcdHJldHVybiBbXTtcblx0fVxuXHRjb25zdCBvQ29udmVydGVyQ29udGV4dCA9IEZpbHRlclV0aWxzLmNyZWF0ZUNvbnZlcnRlckNvbnRleHQob0ZpbHRlckNvbnRyb2wsIHNFbnRpdHlUeXBlUGF0aCk7XG5cdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzRW50aXR5VHlwZVBhdGgpO1xuXG5cdGNvbnN0IG1GaWx0ZXJGaWVsZHMgPSBGaWx0ZXJVdGlscy5nZXRDb252ZXJ0ZWRGaWx0ZXJGaWVsZHMob0ZpbHRlckNvbnRyb2wsIHNFbnRpdHlUeXBlUGF0aCwgaW5jbHVkZUhpZGRlbik7XG5cdGxldCBhRmV0Y2hlZFByb3BlcnRpZXM6IGFueVtdID0gW107XG5cdG1GaWx0ZXJGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAob0ZpbHRlckZpZWxkSW5mbzogYW55KSB7XG5cdFx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gb0ZpbHRlckZpZWxkSW5mby5hbm5vdGF0aW9uUGF0aDtcblx0XHRpZiAoc0Fubm90YXRpb25QYXRoKSB7XG5cdFx0XHRjb25zdCBvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9Db252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlZFR5cGVzKCkucmVzb2x2ZVBhdGgoc0Fubm90YXRpb25QYXRoKS50YXJnZXQ7XG5cdFx0XHRjb25zdCBzVGFyZ2V0UHJvcGVydHlQcmVmaXggPSBDb21tb25IZWxwZXIuZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgob01ldGFNb2RlbCwgc0Fubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eSA9IHNBbm5vdGF0aW9uUGF0aC5yZXBsYWNlKGAke3NUYXJnZXRQcm9wZXJ0eVByZWZpeH0vYCwgXCJcIik7XG5cdFx0XHRjb25zdCBlbnRpdHlUeXBlID0gb0NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRcdFx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzID0gZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LlNlbGVjdGlvbkZpZWxkcztcblx0XHRcdGNvbnN0IGZpbHRlckZhY2V0cyA9IGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5GaWx0ZXJGYWNldHM7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdE9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2lzRmlsdGVyQWRhcHRhYmxlKG9GaWx0ZXJGaWVsZEluZm8sIG9Qcm9wZXJ0eUFubm90YXRpb25zLCBzZWxlY3Rpb25GaWVsZHMsIGZpbHRlckZhY2V0cykgJiZcblx0XHRcdFx0aXNQcm9wZXJ0eUZpbHRlcmFibGUob01ldGFNb2RlbCwgc1RhcmdldFByb3BlcnR5UHJlZml4LCBfZ2V0UHJvcGVydHlQYXRoKHNQcm9wZXJ0eSksIHRydWUpXG5cdFx0XHQpIHtcblx0XHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2gob0ZpbHRlckZpZWxkSW5mbyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vQ3VzdG9tIEZpbHRlcnNcblx0XHRcdGFGZXRjaGVkUHJvcGVydGllcy5wdXNoKG9GaWx0ZXJGaWVsZEluZm8pO1xuXHRcdH1cblx0fSk7XG5cblx0Y29uc3QgYVBhcmFtZXRlckZpZWxkczogYW55W10gPSBbXTtcblx0Y29uc3QgcHJvY2Vzc2VkRmllbGRzID0gcHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyhhRmV0Y2hlZFByb3BlcnRpZXMsIG9Db252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgcHJvY2Vzc2VkRmllbGRzS2V5czogYW55W10gPSBbXTtcblx0cHJvY2Vzc2VkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wczogYW55KSB7XG5cdFx0aWYgKG9Qcm9wcy5rZXkpIHtcblx0XHRcdHByb2Nlc3NlZEZpZWxkc0tleXMucHVzaChvUHJvcHMua2V5KTtcblx0XHR9XG5cdH0pO1xuXG5cdGFGZXRjaGVkUHJvcGVydGllcyA9IGFGZXRjaGVkUHJvcGVydGllcy5maWx0ZXIoZnVuY3Rpb24gKG9Qcm9wOiBhbnkpIHtcblx0XHRyZXR1cm4gcHJvY2Vzc2VkRmllbGRzS2V5cy5pbmNsdWRlcyhvUHJvcC5rZXkpO1xuXHR9KTtcblxuXHRjb25zdCBvRlIgPSBDb21tb25VdGlscy5nZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgoc0VudGl0eVNldFBhdGgsIG9NZXRhTW9kZWwpLFxuXHRcdG1BbGxvd2VkRXhwcmVzc2lvbnMgPSBvRlIuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zO1xuXHQvL09iamVjdC5rZXlzKHByb2Nlc3NlZEZpZWxkcykuZm9yRWFjaChmdW5jdGlvbiAoc0ZpbHRlckZpZWxkS2V5OiBzdHJpbmcpIHtcblx0cHJvY2Vzc2VkRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wLCBpRmlsdGVyRmllbGRJbmRleDogbnVtYmVyKSB7XG5cdFx0Y29uc3Qgb1NlbEZpZWxkID0gYUZldGNoZWRQcm9wZXJ0aWVzW2lGaWx0ZXJGaWVsZEluZGV4IGFzIGFueV07XG5cdFx0aWYgKCFvU2VsRmllbGQgfHwgIW9TZWxGaWVsZC5jb25kaXRpb25QYXRoKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBfZ2V0UHJvcGVydHlQYXRoKG9TZWxGaWVsZC5jb25kaXRpb25QYXRoKTtcblx0XHQvL2ZldGNoQmFzaWNcblx0XHRvUHJvcCA9IE9iamVjdC5hc3NpZ24ob1Byb3AsIHtcblx0XHRcdGdyb3VwOiBvU2VsRmllbGQuZ3JvdXAsXG5cdFx0XHRncm91cExhYmVsOiBvU2VsRmllbGQuZ3JvdXBMYWJlbCxcblx0XHRcdHBhdGg6IG9TZWxGaWVsZC5jb25kaXRpb25QYXRoLFxuXHRcdFx0dG9vbHRpcDogbnVsbCxcblx0XHRcdHJlbW92ZUZyb21BcHBTdGF0ZTogZmFsc2UsXG5cdFx0XHRoYXNWYWx1ZUhlbHA6IGZhbHNlXG5cdFx0fSk7XG5cblx0XHQvL2ZldGNoUHJvcEluZm9cblx0XHRpZiAob1NlbEZpZWxkLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBvU2VsRmllbGQuYW5ub3RhdGlvblBhdGg7XG5cdFx0XHRjb25zdCBvUHJvcGVydHkgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzQW5ub3RhdGlvblBhdGgpLFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NBbm5vdGF0aW9uUGF0aH1AYCksXG5cdFx0XHRcdG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBbm5vdGF0aW9uUGF0aCk7XG5cblx0XHRcdGNvbnN0IGJSZW1vdmVGcm9tQXBwU3RhdGUgPVxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZVwiXSB8fFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5FeGNsdWRlRnJvbU5hdmlnYXRpb25Db250ZXh0XCJdIHx8XG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5NZWFzdXJlXCJdO1xuXG5cdFx0XHRjb25zdCBzVGFyZ2V0UHJvcGVydHlQcmVmaXggPSBDb21tb25IZWxwZXIuZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgob01ldGFNb2RlbCwgb1NlbEZpZWxkLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eSA9IHNBbm5vdGF0aW9uUGF0aC5yZXBsYWNlKGAke3NUYXJnZXRQcm9wZXJ0eVByZWZpeH0vYCwgXCJcIik7XG5cdFx0XHRsZXQgb0ZpbHRlckRlZmF1bHRWYWx1ZUFubm90YXRpb247XG5cdFx0XHRsZXQgb0ZpbHRlckRlZmF1bHRWYWx1ZTtcblx0XHRcdGlmIChpc1Byb3BlcnR5RmlsdGVyYWJsZShvTWV0YU1vZGVsLCBzVGFyZ2V0UHJvcGVydHlQcmVmaXgsIF9nZXRQcm9wZXJ0eVBhdGgoc1Byb3BlcnR5KSwgdHJ1ZSkpIHtcblx0XHRcdFx0b0ZpbHRlckRlZmF1bHRWYWx1ZUFubm90YXRpb24gPSBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmlsdGVyRGVmYXVsdFZhbHVlXCJdO1xuXHRcdFx0XHRpZiAob0ZpbHRlckRlZmF1bHRWYWx1ZUFubm90YXRpb24pIHtcblx0XHRcdFx0XHRvRmlsdGVyRGVmYXVsdFZhbHVlID0gb0ZpbHRlckRlZmF1bHRWYWx1ZUFubm90YXRpb25bYCQke2dldE1vZGVsVHlwZShvUHJvcGVydHkuJFR5cGUpfWBdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0b1Byb3AgPSBPYmplY3QuYXNzaWduKG9Qcm9wLCB7XG5cdFx0XHRcdFx0dG9vbHRpcDogb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlF1aWNrSW5mb1wiXSB8fCB1bmRlZmluZWQsXG5cdFx0XHRcdFx0cmVtb3ZlRnJvbUFwcFN0YXRlOiBiUmVtb3ZlRnJvbUFwcFN0YXRlLFxuXHRcdFx0XHRcdGhhc1ZhbHVlSGVscDogaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KCksIHsgY29udGV4dDogb1Byb3BlcnR5Q29udGV4dCB9KSxcblx0XHRcdFx0XHRkZWZhdWx0RmlsdGVyQ29uZGl0aW9uczogb0ZpbHRlckRlZmF1bHRWYWx1ZVxuXHRcdFx0XHRcdFx0PyBbXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0ZmllbGRQYXRoOiBvU2VsRmllbGQuY29uZGl0aW9uUGF0aCxcblx0XHRcdFx0XHRcdFx0XHRcdG9wZXJhdG9yOiBcIkVRXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZXM6IFtvRmlsdGVyRGVmYXVsdFZhbHVlXVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdCAgXVxuXHRcdFx0XHRcdFx0OiB1bmRlZmluZWRcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly9iYXNlXG5cblx0XHRpZiAob1Byb3ApIHtcblx0XHRcdGlmIChtQWxsb3dlZEV4cHJlc3Npb25zW3NQcm9wZXJ0eVBhdGhdICYmIG1BbGxvd2VkRXhwcmVzc2lvbnNbc1Byb3BlcnR5UGF0aF0ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRvUHJvcC5maWx0ZXJFeHByZXNzaW9uID0gQ29tbW9uVXRpbHMuZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbihtQWxsb3dlZEV4cHJlc3Npb25zW3NQcm9wZXJ0eVBhdGhdKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Qcm9wLmZpbHRlckV4cHJlc3Npb24gPSBcImF1dG9cIjtcblx0XHRcdH1cblxuXHRcdFx0b1Byb3AgPSBPYmplY3QuYXNzaWduKG9Qcm9wLCB7XG5cdFx0XHRcdHZpc2libGU6IG9TZWxGaWVsZC5hdmFpbGFiaWxpdHkgPT09IFwiRGVmYXVsdFwiXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRwcm9jZXNzZWRGaWVsZHNbaUZpbHRlckZpZWxkSW5kZXhdID0gb1Byb3A7XG5cdH0pO1xuXHRwcm9jZXNzZWRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAocHJvcEluZm86IGFueSkge1xuXHRcdGlmIChwcm9wSW5mby5wYXRoID09PSBcIiRlZGl0U3RhdGVcIikge1xuXHRcdFx0cHJvcEluZm8ubGFiZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9GaWx0ZXJDb250cm9sKS5nZXRUZXh0KFwiRklMVEVSQkFSX0VESVRJTkdfU1RBVFVTXCIpO1xuXHRcdH1cblx0XHRwcm9wSW5mby50eXBlQ29uZmlnID0gVHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhwcm9wSW5mby5kYXRhVHlwZSwgcHJvcEluZm8uZm9ybWF0T3B0aW9ucywgcHJvcEluZm8uY29uc3RyYWludHMpO1xuXHRcdHByb3BJbmZvLmxhYmVsID0gZ2V0TG9jYWxpemVkVGV4dChwcm9wSW5mby5sYWJlbCwgb0ZpbHRlckNvbnRyb2wpIHx8IFwiXCI7XG5cdFx0aWYgKHByb3BJbmZvLmlzUGFyYW1ldGVyKSB7XG5cdFx0XHRhUGFyYW1ldGVyRmllbGRzLnB1c2gocHJvcEluZm8ubmFtZSk7XG5cdFx0fVxuXHR9KTtcblxuXHRhRmV0Y2hlZFByb3BlcnRpZXMgPSBwcm9jZXNzZWRGaWVsZHM7XG5cdERlbGVnYXRlVXRpbC5zZXRDdXN0b21EYXRhKG9GaWx0ZXJDb250cm9sLCBcInBhcmFtZXRlcnNcIiwgYVBhcmFtZXRlckZpZWxkcyk7XG5cblx0cmV0dXJuIGFGZXRjaGVkUHJvcGVydGllcztcbn07XG5cbmZ1bmN0aW9uIGdldExpbmVJdGVtUXVhbGlmaWVyRnJvbVRhYmxlKG9Db250cm9sOiBhbnksIG9NZXRhTW9kZWw6IGFueSkge1xuXHRpZiAob0NvbnRyb2wuaXNBKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5UYWJsZUFQSVwiKSkge1xuXHRcdGNvbnN0IGFubm90YXRpb25QYXRocyA9IG9Db250cm9sLmdldE1ldGFQYXRoKCkuc3BsaXQoXCIjXCIpWzBdLnNwbGl0KFwiL1wiKTtcblx0XHRzd2l0Y2ggKGFubm90YXRpb25QYXRoc1thbm5vdGF0aW9uUGF0aHMubGVuZ3RoIC0gMV0pIHtcblx0XHRcdGNhc2UgYEAke1VJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnR9YDpcblx0XHRcdGNhc2UgYEAke1VJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnR9YDpcblx0XHRcdFx0cmV0dXJuIG9NZXRhTW9kZWxcblx0XHRcdFx0XHQuZ2V0T2JqZWN0KG9Db250cm9sLmdldE1ldGFQYXRoKCkpXG5cdFx0XHRcdFx0LlZpc3VhbGl6YXRpb25zPy5maW5kKCh2aXN1YWxpemF0aW9uOiBhbnkpID0+IHZpc3VhbGl6YXRpb24uJEFubm90YXRpb25QYXRoLmluY2x1ZGVzKGBAJHtVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbX1gKSlcblx0XHRcdFx0XHQuJEFubm90YXRpb25QYXRoO1xuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW19YDpcblx0XHRcdFx0Y29uc3QgbWV0YVBhdGhzID0gb0NvbnRyb2wuZ2V0TWV0YVBhdGgoKS5zcGxpdChcIi9cIik7XG5cdFx0XHRcdHJldHVybiBtZXRhUGF0aHNbbWV0YVBhdGhzLmxlbmd0aCAtIDFdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLl9pc0ZpbHRlckFkYXB0YWJsZSA9IGZ1bmN0aW9uIChcblx0ZmlsdGVyRmllbGRJbmZvOiBGaWx0ZXJGaWVsZCxcblx0cHJvcGVydHlBbm5vdGF0aW9uczogYW55LFxuXHRzZWxlY3Rpb25GaWVsZHM/OiBTZWxlY3Rpb25GaWVsZHMsXG5cdGZpbHRlckZhY2V0cz86IEZpbHRlckZhY2V0c1xuKSB7XG5cdGxldCBpc1NlbGVjdGlvbkZpZWxkLCBpc0luRmlsdGVyRmFjZXRzOiBib29sZWFuO1xuXHRpZiAoc2VsZWN0aW9uRmllbGRzKSB7XG5cdFx0aXNTZWxlY3Rpb25GaWVsZCA9IHNlbGVjdGlvbkZpZWxkcy5zb21lKGZ1bmN0aW9uIChzZWxlY3Rpb25GaWVsZDogYW55KSB7XG5cdFx0XHRpZiAoc2VsZWN0aW9uRmllbGQudmFsdWUgPT09IGZpbHRlckZpZWxkSW5mby5rZXkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0aXNTZWxlY3Rpb25GaWVsZCA9IGZhbHNlO1xuXHR9XG5cdGlmIChmaWx0ZXJGYWNldHMpIHtcblx0XHRpc0luRmlsdGVyRmFjZXRzID0gZmlsdGVyRmFjZXRzLnNvbWUoZnVuY3Rpb24gKGZpbHRlckZhY2V0OiBSZWZlcmVuY2VGYWNldCkge1xuXHRcdFx0Y29uc3QgZmllbGRHcm91cCA9IGZpbHRlckZhY2V0LlRhcmdldD8uJHRhcmdldCBhcyBGaWVsZEdyb3VwVHlwZTtcblx0XHRcdHJldHVybiBmaWVsZEdyb3VwPy5EYXRhLnNvbWUoZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcykge1xuXHRcdFx0XHQvLyB3ZSBleHBlY3QgZGF0YUZpZWxkIHRvIGJlIERhdGFGaWVsZFR5cGVzIChoYXZpbmcgYSBWYWx1ZSkgaW5zaWRlIEZpZWxkR3JvdXBzIGluc2lkZSBGaWx0ZXJGYWNldHNcblx0XHRcdFx0aWYgKChkYXRhRmllbGQgYXMgRGF0YUZpZWxkVHlwZXMpLlZhbHVlLnBhdGggPT09IGZpbHRlckZpZWxkSW5mby5rZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBkYXRhRmllbGQgdHlwZXMgaGF2aW5nIG5vIFZhbHVlIChEYXRhRmllbGRGb3JBbm5vdGF0aW9uVHlwZXMsIERhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0VHlwZXMsIERhdGFGaWVsZEZvckFjdGlvbkdyb3VwVHlwZXMpLCB0aGVyZSBpcyBub3RoaW5nIHRvIGNoZWNrLCBidXQgdGhpcyBzaG91bGQgbm90IG9jY3VyIGFueXdheVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRpc0luRmlsdGVyRmFjZXRzID0gZmFsc2U7XG5cdH1cblx0cmV0dXJuIGlzU2VsZWN0aW9uRmllbGQgfHwgaXNJbkZpbHRlckZhY2V0cyB8fCAhcHJvcGVydHlBbm5vdGF0aW9ucy5hbm5vdGF0aW9ucz8uVUk/LkFkYXB0YXRpb25IaWRkZW47XG59O1xuXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLl9hZGRGbGV4SXRlbSA9IGZ1bmN0aW9uIChcblx0c0ZsZXhQcm9wZXJ0eU5hbWU6IGFueSxcblx0b1BhcmVudENvbnRyb2w6IGFueSxcblx0b01ldGFNb2RlbDogYW55LFxuXHRvTW9kaWZpZXI6IGFueSxcblx0b0FwcENvbXBvbmVudDogYW55XG4pIHtcblx0Y29uc3Qgc0ZpbHRlckJhcklkID0gb01vZGlmaWVyID8gb01vZGlmaWVyLmdldElkKG9QYXJlbnRDb250cm9sKSA6IG9QYXJlbnRDb250cm9sLmdldElkKCksXG5cdFx0c0lkUHJlZml4ID0gb01vZGlmaWVyID8gXCJcIiA6IFwiQWRhcHRhdGlvblwiLFxuXHRcdGFTZWxlY3Rpb25GaWVsZHMgPSBGaWx0ZXJVdGlscy5nZXRDb252ZXJ0ZWRGaWx0ZXJGaWVsZHMoXG5cdFx0XHRvUGFyZW50Q29udHJvbCxcblx0XHRcdG51bGwsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdG9Nb2RpZmllcixcblx0XHRcdG9Nb2RpZmllciA/IHVuZGVmaW5lZCA6IGdldExpbmVJdGVtUXVhbGlmaWVyRnJvbVRhYmxlKG9QYXJlbnRDb250cm9sLmdldFBhcmVudCgpLCBvTWV0YU1vZGVsKVxuXHRcdCksXG5cdFx0b1NlbGVjdGlvbkZpZWxkID0gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fZmluZFNlbGVjdGlvbkZpZWxkKGFTZWxlY3Rpb25GaWVsZHMsIHNGbGV4UHJvcGVydHlOYW1lKSxcblx0XHRzUHJvcGVydHlQYXRoID0gX2dldFByb3BlcnR5UGF0aChzRmxleFByb3BlcnR5TmFtZSksXG5cdFx0YklzWE1MID0gISFvTW9kaWZpZXIgJiYgb01vZGlmaWVyLnRhcmdldHMgPT09IFwieG1sVHJlZVwiO1xuXHRpZiAoc0ZsZXhQcm9wZXJ0eU5hbWUgPT09IEVESVRfU1RBVEVfUFJPUEVSVFlfTkFNRSkge1xuXHRcdHJldHVybiBfdGVtcGxhdGVFZGl0U3RhdGUoX2dlbmVyYXRlSWRQcmVmaXgoc0ZpbHRlckJhcklkLCBgJHtzSWRQcmVmaXh9RmlsdGVyRmllbGRgKSwgb01ldGFNb2RlbCwgb01vZGlmaWVyKTtcblx0fSBlbHNlIGlmIChzRmxleFByb3BlcnR5TmFtZSA9PT0gU0VBUkNIX1BST1BFUlRZX05BTUUpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9IGVsc2UgaWYgKG9TZWxlY3Rpb25GaWVsZD8udGVtcGxhdGUpIHtcblx0XHRyZXR1cm4gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fdGVtcGxhdGVDdXN0b21GaWx0ZXIoXG5cdFx0XHRvUGFyZW50Q29udHJvbCxcblx0XHRcdF9nZW5lcmF0ZUlkUHJlZml4KHNGaWx0ZXJCYXJJZCwgYCR7c0lkUHJlZml4fUZpbHRlckZpZWxkYCksXG5cdFx0XHRvU2VsZWN0aW9uRmllbGQsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b01vZGlmaWVyXG5cdFx0KTtcblx0fVxuXG5cdGlmIChvU2VsZWN0aW9uRmllbGQ/LnR5cGUgPT09IFwiU2xvdFwiICYmIG9Nb2RpZmllcikge1xuXHRcdHJldHVybiBfYWRkWE1MQ3VzdG9tRmlsdGVyRmllbGQob1BhcmVudENvbnRyb2wsIG9Nb2RpZmllciwgc1Byb3BlcnR5UGF0aCk7XG5cdH1cblxuXHRjb25zdCBzTmF2aWdhdGlvblBhdGggPSBDb21tb25IZWxwZXIuZ2V0TmF2aWdhdGlvblBhdGgoc1Byb3BlcnR5UGF0aCk7XG5cdGxldCBzRW50aXR5VHlwZVBhdGg6IHN0cmluZztcblx0bGV0IHNVc2VTZW1hbnRpY0RhdGVSYW5nZTtcblx0bGV0IG9TZXR0aW5nczogYW55O1xuXHRsZXQgc0JpbmRpbmdQYXRoO1xuXHRsZXQgb1BhcmFtZXRlcnM6IGFueTtcblxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcblx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAob1NlbGVjdGlvbkZpZWxkPy5pc1BhcmFtZXRlcikge1xuXHRcdFx0XHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBvU2VsZWN0aW9uRmllbGQuYW5ub3RhdGlvblBhdGg7XG5cdFx0XHRcdHJldHVybiBzQW5ub3RhdGlvblBhdGguc3Vic3RyKDAsIHNBbm5vdGF0aW9uUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvUGFyZW50Q29udHJvbCwgXCJlbnRpdHlUeXBlXCIsIG9Nb2RpZmllcik7XG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbiAoc1JldHJpZXZlZEVudGl0eVR5cGVQYXRoOiBhbnkpIHtcblx0XHRcdHNFbnRpdHlUeXBlUGF0aCA9IHNSZXRyaWV2ZWRFbnRpdHlUeXBlUGF0aDtcblx0XHRcdHJldHVybiBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvUGFyZW50Q29udHJvbCwgXCJ1c2VTZW1hbnRpY0RhdGVSYW5nZVwiLCBvTW9kaWZpZXIpO1xuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHNSZXRyaWV2ZWRVc2VTZW1hbnRpY0RhdGVSYW5nZTogYW55KSB7XG5cdFx0XHRzVXNlU2VtYW50aWNEYXRlUmFuZ2UgPSBzUmV0cmlldmVkVXNlU2VtYW50aWNEYXRlUmFuZ2U7XG5cdFx0XHRjb25zdCBvUHJvcGVydHlDb250ZXh0ID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRW50aXR5VHlwZVBhdGggKyBzUHJvcGVydHlQYXRoKTtcblx0XHRcdGNvbnN0IHNJbkZpbHRlckJhcklkID0gb01vZGlmaWVyID8gb01vZGlmaWVyLmdldElkKG9QYXJlbnRDb250cm9sKSA6IG9QYXJlbnRDb250cm9sLmdldElkKCk7XG5cdFx0XHRvU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdGNvbnRleHRQYXRoOiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNFbnRpdHlUeXBlUGF0aCksXG5cdFx0XHRcdFx0cHJvcGVydHk6IG9Qcm9wZXJ0eUNvbnRleHRcblx0XHRcdFx0fSxcblx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0cHJvcGVydHk6IG9NZXRhTW9kZWxcblx0XHRcdFx0fSxcblx0XHRcdFx0aXNYTUw6IGJJc1hNTFxuXHRcdFx0fTtcblx0XHRcdHNCaW5kaW5nUGF0aCA9IGAvJHtNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNFbnRpdHlUeXBlUGF0aClcblx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHQuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKVxuXHRcdFx0XHQuam9pbihcIi9cIil9YDtcblx0XHRcdG9QYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHRzUHJvcGVydHlOYW1lOiBzUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRzQmluZGluZ1BhdGg6IHNCaW5kaW5nUGF0aCxcblx0XHRcdFx0c1ZhbHVlSGVscFR5cGU6IHNJZFByZWZpeCArIFZBTFVFX0hFTFBfVFlQRSxcblx0XHRcdFx0b0NvbnRyb2w6IG9QYXJlbnRDb250cm9sLFxuXHRcdFx0XHRvTWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRvTW9kaWZpZXI6IG9Nb2RpZmllcixcblx0XHRcdFx0c0lkUHJlZml4OiBfZ2VuZXJhdGVJZFByZWZpeChzSW5GaWx0ZXJCYXJJZCwgYCR7c0lkUHJlZml4fUZpbHRlckZpZWxkYCwgc05hdmlnYXRpb25QYXRoKSxcblx0XHRcdFx0c1ZoSWRQcmVmaXg6IF9nZW5lcmF0ZUlkUHJlZml4KHNJbkZpbHRlckJhcklkLCBzSWRQcmVmaXggKyBWQUxVRV9IRUxQX1RZUEUpLFxuXHRcdFx0XHRzTmF2aWdhdGlvblByZWZpeDogc05hdmlnYXRpb25QYXRoLFxuXHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2U6IHNVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdFx0b1NldHRpbmdzOiBvU2VsZWN0aW9uRmllbGQ/LnNldHRpbmdzID8/IHt9LFxuXHRcdFx0XHR2aXN1YWxGaWx0ZXI6IG9TZWxlY3Rpb25GaWVsZD8udmlzdWFsRmlsdGVyXG5cdFx0XHR9O1xuXG5cdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmRvZXNWYWx1ZUhlbHBFeGlzdChvUGFyYW1ldGVycyk7XG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbiAoYlZhbHVlSGVscEV4aXN0czogYW55KSB7XG5cdFx0XHRpZiAoIWJWYWx1ZUhlbHBFeGlzdHMpIHtcblx0XHRcdFx0cmV0dXJuIF90ZW1wbGF0ZVZhbHVlSGVscChvU2V0dGluZ3MsIG9QYXJhbWV0ZXJzKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdGxldCBwYWdlTW9kZWw7XG5cdFx0XHRpZiAob1BhcmFtZXRlcnMudmlzdWFsRmlsdGVyKSB7XG5cdFx0XHRcdC8vTmVlZCB0byBzZXQgdGhlIGNvbnZlcnRlcmNvbnRleHQgYXMgcGFnZU1vZGVsIGluIHNldHRpbmdzIGZvciBCdWlsZGluZ0Jsb2NrIDIuMFxuXHRcdFx0XHRwYWdlTW9kZWwgPSAoQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvUGFyZW50Q29udHJvbCkuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fZ2V0UGFnZU1vZGVsKCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gX3RlbXBsYXRlRmlsdGVyRmllbGQob1NldHRpbmdzLCBvUGFyYW1ldGVycywgcGFnZU1vZGVsKTtcblx0XHR9KTtcbn07XG5mdW5jdGlvbiBfZ2V0Q2FjaGVkUHJvcGVydGllcyhvRmlsdGVyQmFyOiBhbnkpIHtcblx0Ly8gcHJvcGVydGllcyBhcmUgbm90IGNhY2hlZCBkdXJpbmcgdGVtcGxhdGluZ1xuXHRpZiAob0ZpbHRlckJhciBpbnN0YW5jZW9mIHdpbmRvdy5FbGVtZW50KSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9GaWx0ZXJCYXIsIEZFVENIRURfUFJPUEVSVElFU19EQVRBX0tFWSk7XG59XG5mdW5jdGlvbiBfc2V0Q2FjaGVkUHJvcGVydGllcyhvRmlsdGVyQmFyOiBhbnksIGFGZXRjaGVkUHJvcGVydGllczogYW55KSB7XG5cdC8vIGRvIG5vdCBjYWNoZSBkdXJpbmcgdGVtcGxhdGluZywgZWxzZSBpdCBiZWNvbWVzIHBhcnQgb2YgdGhlIGNhY2hlZCB2aWV3XG5cdGlmIChvRmlsdGVyQmFyIGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQpIHtcblx0XHRyZXR1cm47XG5cdH1cblx0RGVsZWdhdGVVdGlsLnNldEN1c3RvbURhdGEob0ZpbHRlckJhciwgRkVUQ0hFRF9QUk9QRVJUSUVTX0RBVEFfS0VZLCBhRmV0Y2hlZFByb3BlcnRpZXMpO1xufVxuZnVuY3Rpb24gX2dldENhY2hlZE9yRmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5KHNFbnRpdHlUeXBlUGF0aDogYW55LCBvTWV0YU1vZGVsOiBhbnksIG9GaWx0ZXJCYXI6IGFueSkge1xuXHRsZXQgYUZldGNoZWRQcm9wZXJ0aWVzID0gX2dldENhY2hlZFByb3BlcnRpZXMob0ZpbHRlckJhcik7XG5cdGxldCBsb2NhbEdyb3VwTGFiZWw7XG5cblx0aWYgKCFhRmV0Y2hlZFByb3BlcnRpZXMpIHtcblx0XHRhRmV0Y2hlZFByb3BlcnRpZXMgPSBPRGF0YUZpbHRlckJhckRlbGVnYXRlLmZldGNoUHJvcGVydGllc0ZvckVudGl0eShzRW50aXR5VHlwZVBhdGgsIG9NZXRhTW9kZWwsIG9GaWx0ZXJCYXIpO1xuXHRcdGFGZXRjaGVkUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChvR3JvdXA6IGFueSkge1xuXHRcdFx0bG9jYWxHcm91cExhYmVsID0gbnVsbDtcblx0XHRcdGlmIChvR3JvdXAuZ3JvdXBMYWJlbCkge1xuXHRcdFx0XHRsb2NhbEdyb3VwTGFiZWwgPSBnZXRMb2NhbGl6ZWRUZXh0KG9Hcm91cC5ncm91cExhYmVsLCBvRmlsdGVyQmFyKTtcblx0XHRcdFx0b0dyb3VwLmdyb3VwTGFiZWwgPSBsb2NhbEdyb3VwTGFiZWwgPT09IG51bGwgPyBvR3JvdXAuZ3JvdXBMYWJlbCA6IGxvY2FsR3JvdXBMYWJlbDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRhRmV0Y2hlZFByb3BlcnRpZXMuc29ydChmdW5jdGlvbiAoYTogYW55LCBiOiBhbnkpIHtcblx0XHRcdGlmIChhLmdyb3VwTGFiZWwgPT09IHVuZGVmaW5lZCB8fCBhLmdyb3VwTGFiZWwgPT09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGIuZ3JvdXBMYWJlbCA9PT0gdW5kZWZpbmVkIHx8IGIuZ3JvdXBMYWJlbCA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBhLmdyb3VwTGFiZWwubG9jYWxlQ29tcGFyZShiLmdyb3VwTGFiZWwpO1xuXHRcdH0pO1xuXHRcdF9zZXRDYWNoZWRQcm9wZXJ0aWVzKG9GaWx0ZXJCYXIsIGFGZXRjaGVkUHJvcGVydGllcyk7XG5cdH1cblx0cmV0dXJuIGFGZXRjaGVkUHJvcGVydGllcztcbn1cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IGFueSkge1xuXHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvRmlsdGVyQmFyLCBcImVudGl0eVR5cGVcIik7XG5cdHJldHVybiBEZWxlZ2F0ZVV0aWwuZmV0Y2hNb2RlbChvRmlsdGVyQmFyKS50aGVuKGZ1bmN0aW9uIChvTW9kZWw6IGFueSkge1xuXHRcdGlmICghb01vZGVsKSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHRcdHJldHVybiBfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoc0VudGl0eVR5cGVQYXRoLCBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksIG9GaWx0ZXJCYXIpO1xuXHRcdC8vIHZhciBhQ2xlYW5lZFByb3BlcnRpZXMgPSBhUHJvcGVydGllcy5jb25jYXQoKTtcblx0XHQvLyB2YXIgYUFsbG93ZWRBdHRyaWJ1dGVzID0gW1wibmFtZVwiLCBcImxhYmVsXCIsIFwidmlzaWJsZVwiLCBcInBhdGhcIiwgXCJ0eXBlQ29uZmlnXCIsIFwibWF4Q29uZGl0aW9uc1wiLCBcImdyb3VwXCIsIFwiZ3JvdXBMYWJlbFwiXTtcblx0XHQvLyBhQ2xlYW5lZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihvUHJvcGVydHkpIHtcblx0XHQvLyBcdE9iamVjdC5rZXlzKG9Qcm9wZXJ0eSkuZm9yRWFjaChmdW5jdGlvbihzUHJvcE5hbWUpIHtcblx0XHQvLyBcdFx0aWYgKGFBbGxvd2VkQXR0cmlidXRlcy5pbmRleE9mKHNQcm9wTmFtZSkgPT09IC0xKSB7XG5cdFx0Ly8gXHRcdFx0ZGVsZXRlIG9Qcm9wZXJ0eVtzUHJvcE5hbWVdO1xuXHRcdC8vIFx0XHR9XG5cdFx0Ly8gXHR9KTtcblx0XHQvLyB9KTtcblx0XHQvLyByZXR1cm4gYUNsZWFuZWRQcm9wZXJ0aWVzO1xuXHR9KTtcbn07XG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmdldFR5cGVVdGlsID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gVHlwZVV0aWw7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBPRGF0YUZpbHRlckJhckRlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7OztFQThCQSxNQUFNQSxzQkFBc0IsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVDLGlCQUFpQixDQUFRO0VBQzFFSCxzQkFBc0IsQ0FBQ0ksVUFBVSxHQUFHLENBQUM7RUFDckMsTUFBTUMsd0JBQXdCLEdBQUcsWUFBWTtJQUM1Q0Msb0JBQW9CLEdBQUcsU0FBUztJQUNoQ0MsZUFBZSxHQUFHLHNCQUFzQjtJQUN4Q0MsMkJBQTJCLEdBQUcsMENBQTBDO0lBQ3hFQyxxQ0FBcUMsR0FBRyxPQUFPO0VBRWhELFNBQVNDLGtCQUFrQixDQUFDQyxTQUFjLEVBQUVDLFNBQXlCLEVBQUVDLFNBQWMsRUFBRTtJQUN0RixNQUFNQyxLQUFLLEdBQUcsSUFBSUMsU0FBUyxDQUFDO1FBQzFCQyxFQUFFLEVBQUVMLFNBQVM7UUFDYk0sb0JBQW9CLEVBQUVDLFdBQVcsQ0FBQ0MsNkJBQTZCLENBQUNQLFNBQVM7TUFDMUUsQ0FBQyxDQUFDO01BQ0ZRLHFCQUFxQixHQUFHO1FBQ3ZCQyxlQUFlLEVBQUU7VUFDaEJDLElBQUksRUFBRVIsS0FBSyxDQUFDUyxvQkFBb0IsQ0FBQyxHQUFHO1FBQ3JDLENBQUM7UUFDREMsTUFBTSxFQUFFO1VBQ1A7VUFDQUYsSUFBSSxFQUFFUjtRQUNQO01BQ0QsQ0FBQztJQUVGLE9BQU9XLFlBQVksQ0FBQ0MsdUJBQXVCLENBQUMscUNBQXFDLEVBQUVOLHFCQUFxQixFQUFFTyxTQUFTLEVBQUVkLFNBQVMsQ0FBQyxDQUFDZSxPQUFPLENBQ3RJLFlBQVk7TUFDWGQsS0FB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
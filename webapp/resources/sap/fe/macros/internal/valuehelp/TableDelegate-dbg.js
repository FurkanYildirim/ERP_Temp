/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepEqual", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/DelegateUtil", "sap/fe/macros/internal/valuehelp/TableDelegateHelper", "sap/ui/core/Core", "sap/ui/mdc/odata/v4/TableDelegate", "sap/ui/mdc/odata/v4/util/DelegateUtil", "sap/ui/mdc/util/FilterUtil", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"], function (Log, deepEqual, CommonUtils, FilterBar, MetaModelConverter, MetaModelFunction, ModelHelper, DataModelPathHelper, DisplayModeFormatter, PropertyHelper, EDM, TypeUtil, MacrosDelegateUtil, TableDelegateHelper, Core, TableDelegate, DelegateUtil, FilterUtil, Filter, FilterOperator, Sorter) {
  "use strict";

  var isSortableProperty = TableDelegateHelper.isSortableProperty;
  var isFilterableProperty = TableDelegateHelper.isFilterableProperty;
  var getPath = TableDelegateHelper.getPath;
  var isTypeFilterable = EDM.isTypeFilterable;
  var getLabel = PropertyHelper.getLabel;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedTimezonePropertyPath = PropertyHelper.getAssociatedTimezonePropertyPath;
  var getAssociatedTextPropertyPath = PropertyHelper.getAssociatedTextPropertyPath;
  var getAssociatedCurrencyPropertyPath = PropertyHelper.getAssociatedCurrencyPropertyPath;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isMultiValueFilterExpression = MetaModelFunction.isMultiValueFilterExpression;
  var getSortRestrictionsInfo = MetaModelFunction.getSortRestrictionsInfo;
  var getFilterRestrictionsInfo = MetaModelFunction.getFilterRestrictionsInfo;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var fetchTypeConfig = FilterBar.fetchTypeConfig;
  /**
   * Test delegate for OData V4.
   */
  const ODataTableDelegate = Object.assign({}, TableDelegate);

  /**
   * Fetches the relevant metadata for the table and returns property info array.
   *
   * @param table Instance of the MDCtable
   * @returns Array of property info
   */
  ODataTableDelegate.fetchProperties = async function (table) {
    const model = await this._getModel(table);
    const properties = await this._createPropertyInfos(table, model);
    ODataTableDelegate.createInternalBindingContext(table);
    MacrosDelegateUtil.setCachedProperties(table, properties);
    table.getBindingContext("internal").setProperty("tablePropertiesAvailable", true);
    return properties;
  };
  ODataTableDelegate.createInternalBindingContext = function (table) {
    let dialog = table;
    while (dialog && !dialog.isA("sap.ui.mdc.valuehelp.Dialog")) {
      dialog = dialog.getParent();
    }
    const internalModel = table.getModel("internal");
    if (dialog && internalModel) {
      const internalBindingContext = dialog.getBindingContext("internal");
      let newInternalBindingContextPath;
      if (internalBindingContext) {
        newInternalBindingContextPath = internalBindingContext.getPath() + `::VHDialog::${dialog.getId()}::table`;
      } else {
        newInternalBindingContextPath = `/buildingblocks/${table.getId()}`;
        internalModel.setProperty("/buildingblocks", {
          ...internalModel.getProperty("/buildingblocks")
        });
      }
      const newInternalBindingContext = internalModel.bindContext(newInternalBindingContextPath).getBoundContext();
      table.setBindingContext(newInternalBindingContext, "internal");
    }
  };

  /**
   * Collect related properties from a property's annotations.
   *
   * @param dataModelPropertyPath The model object path of the property.
   * @returns The related properties that were identified.
   * @private
   */
  function collectRelatedProperties(dataModelPropertyPath) {
    const dataModelAdditionalPropertyPath = getAdditionalProperty(dataModelPropertyPath);
    const relatedProperties = {};
    if (dataModelAdditionalPropertyPath !== null && dataModelAdditionalPropertyPath !== void 0 && dataModelAdditionalPropertyPath.targetObject) {
      var _property$annotations, _property$annotations2, _textAnnotation$annot, _textAnnotation$annot2, _textAnnotation$annot3;
      const additionalProperty = dataModelAdditionalPropertyPath.targetObject;
      const additionalPropertyPath = getTargetObjectPath(dataModelAdditionalPropertyPath, true);
      const property = dataModelPropertyPath.targetObject;
      const propertyPath = getTargetObjectPath(dataModelPropertyPath, true);
      const textAnnotation = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Text,
        textArrangement = textAnnotation === null || textAnnotation === void 0 ? void 0 : (_textAnnotation$annot = textAnnotation.annotations) === null || _textAnnotation$annot === void 0 ? void 0 : (_textAnnotation$annot2 = _textAnnotation$annot.UI) === null || _textAnnotation$annot2 === void 0 ? void 0 : (_textAnnotation$annot3 = _textAnnotation$annot2.TextArrangement) === null || _textAnnotation$annot3 === void 0 ? void 0 : _textAnnotation$annot3.toString(),
        displayMode = textAnnotation && textArrangement && getDisplayMode(property);
      if (displayMode === "Description") {
        relatedProperties[additionalPropertyPath] = additionalProperty;
      } else if (displayMode && displayMode !== "Value" || !textAnnotation) {
        relatedProperties[propertyPath] = property;
        relatedProperties[additionalPropertyPath] = additionalProperty;
      }
    }
    return relatedProperties;
  }
  ODataTableDelegate._createPropertyInfos = function (table, model) {
    const metadataInfo = table.getDelegate().payload;
    const properties = [];
    const entitySetPath = `/${metadataInfo.collectionName}`;
    const metaModel = model.getMetaModel();
    return metaModel.requestObject(`${entitySetPath}@`).then(function (entitySetAnnotations) {
      const sortRestrictionsInfo = getSortRestrictionsInfo(entitySetAnnotations);
      const filterRestrictions = entitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
      const filterRestrictionsInfo = getFilterRestrictionsInfo(filterRestrictions);
      const customDataForColumns = MacrosDelegateUtil.getCustomData(table, "columns");
      const propertiesToBeCreated = {};
      const dataModelEntityPath = getInvolvedDataModelObjects(table.getModel().getMetaModel().getContext(entitySetPath));
      customDataForColumns.customData.forEach(function (columnDef) {
        const propertyInfo = {
          name: columnDef.path,
          label: columnDef.label,
          sortable: isSortableProperty(sortRestrictionsInfo, columnDef),
          filterable: isFilterableProperty(filterRestrictionsInfo, columnDef),
          maxConditions: getPropertyMaxConditions(filterRestrictionsInfo, columnDef),
          typeConfig: isTypeFilterable(columnDef.$Type) ? table.getTypeUtil().getTypeConfig(columnDef.$Type) : undefined
        };
        const dataModelPropertyPath = enhanceDataModelPath(dataModelEntityPath, columnDef.path);
        const property = dataModelPropertyPath.targetObject;
        if (property) {
          const targetPropertyPath = getTargetObjectPath(dataModelPropertyPath, true);
          let typeConfig;
          if (isTypeFilterable(property.type)) {
            const propertyTypeConfig = fetchTypeConfig(property);
            typeConfig = TypeUtil.getTypeConfig(propertyTypeConfig.type ?? "", propertyTypeConfig.formatOptions, propertyTypeConfig.constraints) ?? table.getTypeUtil().getTypeConfig(columnDef.$Type);
          }
          //Check if there is an additional property linked to the property as a Unit, Currency, Timezone or textArrangement
          const relatedPropertiesInfo = collectRelatedProperties(dataModelPropertyPath);
          const relatedPropertyPaths = Object.keys(relatedPropertiesInfo);
          if (relatedPropertyPaths.length) {
            propertyInfo.propertyInfos = relatedPropertyPaths;
            //Complex properties must be hidden for sorting and filtering
            propertyInfo.sortable = false;
            propertyInfo.filterable = false;
            // Collect information of related columns to be created.
            relatedPropertyPaths.forEach(path => {
              propertiesToBeCreated[path] = relatedPropertiesInfo[path];
            });
            // Also add property for the inOut Parameters on the ValueHelp when textArrangement is set to #TextOnly
            // It will not be linked to the complex Property (BCP 2270141154)
            if (!relatedPropertyPaths.find(path => relatedPropertiesInfo[path] === property)) {
              propertiesToBeCreated[targetPropertyPath] = property;
            }
          } else {
            propertyInfo.path = columnDef.path;
          }
          propertyInfo.typeConfig = propertyInfo.typeConfig ? typeConfig : undefined;
        } else {
          propertyInfo.path = columnDef.path;
        }
        properties.push(propertyInfo);
      });
      const relatedColumns = createRelatedProperties(propertiesToBeCreated, properties, sortRestrictionsInfo, filterRestrictionsInfo);
      return properties.concat(relatedColumns);
    });
  };

  /**
   * Updates the binding info with the relevant path and model from the metadata.
   *
   * @param oMDCTable The MDCTable instance
   * @param oBindingInfo The bindingInfo of the table
   */
  ODataTableDelegate.updateBindingInfo = function (oMDCTable, oBindingInfo) {
    TableDelegate.updateBindingInfo.apply(this, [oMDCTable, oBindingInfo]);
    if (!oMDCTable) {
      return;
    }
    const oMetadataInfo = oMDCTable.getDelegate().payload;
    if (oMetadataInfo && oBindingInfo) {
      oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || `/${oMetadataInfo.collectionName}`;
      oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;
    }
    if (!oBindingInfo) {
      oBindingInfo = {};
    }
    const oFilter = Core.byId(oMDCTable.getFilter()),
      bFilterEnabled = oMDCTable.isFilteringEnabled();
    let mConditions;
    let oInnerFilterInfo, oOuterFilterInfo;
    const aFilters = [];
    const tableProperties = MacrosDelegateUtil.getCachedProperties(oMDCTable);

    //TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
    if (bFilterEnabled) {
      mConditions = oMDCTable.getConditions();
      oInnerFilterInfo = FilterUtil.getFilterInfo(oMDCTable, mConditions, tableProperties, []);
      if (oInnerFilterInfo.filters) {
        aFilters.push(oInnerFilterInfo.filters);
      }
    }
    if (oFilter) {
      mConditions = oFilter.getConditions();
      if (mConditions) {
        const aParameterNames = DelegateUtil.getParameterNames(oFilter);
        // The table properties needs to updated with the filter field if no Selectionfierlds are annotated and not part as value help parameter
        ODataTableDelegate._updatePropertyInfo(tableProperties, oMDCTable, mConditions, oMetadataInfo);
        oOuterFilterInfo = FilterUtil.getFilterInfo(oFilter, mConditions, tableProperties, aParameterNames);
        if (oOuterFilterInfo.filters) {
          aFilters.push(oOuterFilterInfo.filters);
        }
        const sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
        if (sParameterPath) {
          oBindingInfo.path = sParameterPath;
        }
      }

      // get the basic search
      oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oFilter.getSearch()) || undefined;
    }
    this._applyDefaultSorting(oBindingInfo, oMDCTable.getDelegate().payload);
    // add select to oBindingInfo (BCP 2170163012)
    oBindingInfo.parameters.$select = tableProperties === null || tableProperties === void 0 ? void 0 : tableProperties.reduce(function (sQuery, oProperty) {
      // Navigation properties (represented by X/Y) should not be added to $select.
      // ToDo : They should be added as $expand=X($select=Y) instead
      if (oProperty.path && oProperty.path.indexOf("/") === -1) {
        sQuery = sQuery ? `${sQuery},${oProperty.path}` : oProperty.path;
      }
      return sQuery;
    }, "");

    // Add $count
    oBindingInfo.parameters.$count = true;

    //If the entity is DraftEnabled add a DraftFilter
    if (ModelHelper.isDraftSupported(oMDCTable.getModel().getMetaModel(), oBindingInfo.path)) {
      aFilters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
    }
    oBindingInfo.filters = new Filter(aFilters, true);
  };
  ODataTableDelegate.getTypeUtil = function /*oPayload*/
  () {
    return TypeUtil;
  };

  /**
   * Get table Model.
   *
   * @param table Instance of the MDCtable
   * @returns Model
   */
  ODataTableDelegate._getModel = async function (table) {
    const metadataInfo = table.getDelegate().payload;
    let model = table.getModel(metadataInfo.model);
    if (!model) {
      await new Promise(resolve => {
        table.attachEventOnce("modelContextChange", resolve);
      });
      model = table.getModel(metadataInfo.model);
    }
    return model;
  };

  /**
   * Applies a default sort order if needed. This is only the case if the request is not a $search request
   * (means the parameter $search of the bindingInfo is undefined) and if not already a sort order is set,
   * e.g. via presentation variant or manual by the user.
   *
   * @param oBindingInfo The bindingInfo of the table
   * @param oPayload The payload of the TableDelegate
   */
  ODataTableDelegate._applyDefaultSorting = function (oBindingInfo, oPayload) {
    if (oBindingInfo.parameters && oBindingInfo.parameters.$search == undefined && oBindingInfo.sorter && oBindingInfo.sorter.length == 0) {
      const defaultSortPropertyName = oPayload ? oPayload.defaultSortPropertyName : undefined;
      if (defaultSortPropertyName) {
        oBindingInfo.sorter.push(new Sorter(defaultSortPropertyName, false));
      }
    }
  };

  /**
   * Updates the table properties with filter field infos.
   *
   * @param aTableProperties Array with table properties
   * @param oMDCTable The MDCTable instance
   * @param mConditions The conditions of the table
   * @param oMetadataInfo The metadata info of the filter field
   */
  ODataTableDelegate._updatePropertyInfo = function (aTableProperties, oMDCTable, mConditions, oMetadataInfo) {
    const aConditionKey = Object.keys(mConditions),
      oMetaModel = oMDCTable.getModel().getMetaModel();
    aConditionKey.forEach(function (conditionKey) {
      if (aTableProperties.findIndex(function (tableProperty) {
        return tableProperty.path === conditionKey;
      }) === -1) {
        const oColumnDef = {
          path: conditionKey,
          typeConfig: oMDCTable.getTypeUtil().getTypeConfig(oMetaModel.getObject(`/${oMetadataInfo.collectionName}/${conditionKey}`).$Type)
        };
        aTableProperties.push(oColumnDef);
      }
    });
  };
  ODataTableDelegate.updateBinding = function (oTable, oBindingInfo, oBinding) {
    let bNeedManualRefresh = false;
    const oInternalBindingContext = oTable.getBindingContext("internal");
    const sManualUpdatePropertyKey = "pendingManualBindingUpdate";
    const bPendingManualUpdate = oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.getProperty(sManualUpdatePropertyKey);
    let oRowBinding = oTable.getRowBinding();

    //oBinding=null means that a rebinding needs to be forced via updateBinding in mdc TableDelegate
    TableDelegate.updateBinding.apply(ODataTableDelegate, [oTable, oBindingInfo, oBinding]);
    //get row binding after rebind from TableDelegate.updateBinding in case oBinding was null
    if (!oRowBinding) {
      oRowBinding = oTable.getRowBinding();
    }
    if (oRowBinding) {
      /**
       * Manual refresh if filters are not changed by binding.refresh() since updating the bindingInfo
       * is not enough to trigger a batch request.
       * Removing columns creates one batch request that was not executed before
       */
      const oldFilters = oRowBinding.getFilters("Application");
      bNeedManualRefresh = deepEqual(oBindingInfo.filters, oldFilters[0]) && oRowBinding.getQueryOptionsFromParameters().$search === oBindingInfo.parameters.$search && !bPendingManualUpdate;
    }
    if (bNeedManualRefresh && oTable.getFilter()) {
      oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.setProperty(sManualUpdatePropertyKey, true);
      oRowBinding.requestRefresh(oRowBinding.getGroupId()).finally(function () {
        oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.setProperty(sManualUpdatePropertyKey, false);
      }).catch(function (oError) {
        Log.error("Error while refreshing a filterBar VH table", oError);
      });
    }
    oTable.fireEvent("bindingUpdated");
    //no need to check for semantic targets here since we are in a VH and don't want to allow further navigation
  };

  /**
   * Creates a simple property for each identified complex property.
   *
   * @param propertiesToBeCreated Identified properties.
   * @param existingColumns The list of columns created for properties defined on the Value List.
   * @param sortRestrictionsInfo An object containing the sort restriction information
   * @param filterRestrictionsInfo An object containing the filter restriction information
   * @returns The array of properties created.
   * @private
   */
  function createRelatedProperties(propertiesToBeCreated, existingColumns, sortRestrictionsInfo, filterRestrictionsInfo) {
    const relatedPropertyNameMap = {},
      relatedColumns = [];
    Object.keys(propertiesToBeCreated).forEach(path => {
      const property = propertiesToBeCreated[path],
        relatedColumn = existingColumns.find(column => column.path === path); // Complex properties doesn't get path so only simple column are found
      if (!relatedColumn) {
        const newName = `Property::${path}`;
        relatedPropertyNameMap[path] = newName;
        const valueHelpTableColumn = {
          name: newName,
          label: getLabel(property),
          path: path,
          sortable: isSortableProperty(sortRestrictionsInfo, property),
          filterable: isFilterableProperty(filterRestrictionsInfo, property)
        };
        valueHelpTableColumn.maxConditions = getPropertyMaxConditions(filterRestrictionsInfo, valueHelpTableColumn);
        if (isTypeFilterable(property.type)) {
          const propertyTypeConfig = fetchTypeConfig(property);
          valueHelpTableColumn.typeConfig = TypeUtil.getTypeConfig(propertyTypeConfig.type ?? "", propertyTypeConfig.formatOptions, propertyTypeConfig.constraints);
        }
        relatedColumns.push(valueHelpTableColumn);
      }
    });
    // The property 'name' has been prefixed with 'Property::' for uniqueness.
    // Update the same in other propertyInfos[] references which point to this property.
    existingColumns.forEach(column => {
      if (column.propertyInfos) {
        var _column$propertyInfos;
        column.propertyInfos = (_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.map(columnName => relatedPropertyNameMap[columnName] ?? columnName);
      }
    });
    return relatedColumns;
  }

  /**
   * Identifies the maxConditions for a given property.
   *
   * @param filterRestrictionsInfo The filter restriction information from the restriction annotation.
   * @param property The target property.
   * @returns `-1` or `1` if the property is a MultiValueFilterExpression.
   * @private
   */

  function getPropertyMaxConditions(filterRestrictionsInfo, property) {
    var _filterRestrictionsIn;
    const propertyPath = getPath(property);
    return (_filterRestrictionsIn = filterRestrictionsInfo.propertyInfo) !== null && _filterRestrictionsIn !== void 0 && _filterRestrictionsIn.hasOwnProperty(propertyPath) && propertyPath && isMultiValueFilterExpression(filterRestrictionsInfo.propertyInfo[propertyPath]) ? -1 : 1;
  }

  /**
   * Identifies the additional property which references to the unit, timezone, textArrangement or currency.
   *
   * @param dataModelPropertyPath The model object path of the property.
   * @returns The additional property.
   * @private
   */
  function getAdditionalProperty(dataModelPropertyPath) {
    const property = dataModelPropertyPath.targetObject;
    const additionalPropertyPath = getAssociatedTextPropertyPath(property) || getAssociatedCurrencyPropertyPath(property) || getAssociatedUnitPropertyPath(property) || getAssociatedTimezonePropertyPath(property);
    if (!additionalPropertyPath) {
      return undefined;
    }
    const dataModelAdditionalProperty = enhanceDataModelPath(dataModelPropertyPath, additionalPropertyPath);

    //Additional Property could refer to a navigation property, keep the name and path as navigation property
    const additionalProperty = dataModelAdditionalProperty.targetObject;
    if (!additionalProperty) {
      return undefined;
    }
    return dataModelAdditionalProperty;
  }
  return ODataTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPRGF0YVRhYmxlRGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJUYWJsZURlbGVnYXRlIiwiZmV0Y2hQcm9wZXJ0aWVzIiwidGFibGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsInByb3BlcnRpZXMiLCJfY3JlYXRlUHJvcGVydHlJbmZvcyIsImNyZWF0ZUludGVybmFsQmluZGluZ0NvbnRleHQiLCJNYWNyb3NEZWxlZ2F0ZVV0aWwiLCJzZXRDYWNoZWRQcm9wZXJ0aWVzIiwiZ2V0QmluZGluZ0NvbnRleHQiLCJzZXRQcm9wZXJ0eSIsImRpYWxvZyIsImlzQSIsImdldFBhcmVudCIsImludGVybmFsTW9kZWwiLCJnZXRNb2RlbCIsImludGVybmFsQmluZGluZ0NvbnRleHQiLCJuZXdJbnRlcm5hbEJpbmRpbmdDb250ZXh0UGF0aCIsImdldFBhdGgiLCJnZXRJZCIsImdldFByb3BlcnR5IiwibmV3SW50ZXJuYWxCaW5kaW5nQ29udGV4dCIsImJpbmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0Iiwic2V0QmluZGluZ0NvbnRleHQiLCJjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMiLCJkYXRhTW9kZWxQcm9wZXJ0eVBhdGgiLCJkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoIiwiZ2V0QWRkaXRpb25hbFByb3BlcnR5IiwicmVsYXRlZFByb3BlcnRpZXMiLCJ0YXJnZXRPYmplY3QiLCJhZGRpdGlvbmFsUHJvcGVydHkiLCJhZGRpdGlvbmFsUHJvcGVydHlQYXRoIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsInByb3BlcnR5IiwicHJvcGVydHlQYXRoIiwidGV4dEFubm90YXRpb24iLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlRleHQiLCJ0ZXh0QXJyYW5nZW1lbnQiLCJVSSIsIlRleHRBcnJhbmdlbWVudCIsInRvU3RyaW5nIiwiZGlzcGxheU1vZGUiLCJnZXREaXNwbGF5TW9kZSIsIm1ldGFkYXRhSW5mbyIsImdldERlbGVnYXRlIiwicGF5bG9hZCIsImVudGl0eVNldFBhdGgiLCJjb2xsZWN0aW9uTmFtZSIsIm1ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInJlcXVlc3RPYmplY3QiLCJ0aGVuIiwiZW50aXR5U2V0QW5ub3RhdGlvbnMiLCJzb3J0UmVzdHJpY3Rpb25zSW5mbyIsImdldFNvcnRSZXN0cmljdGlvbnNJbmZvIiwiZmlsdGVyUmVzdHJpY3Rpb25zIiwiZmlsdGVyUmVzdHJpY3Rpb25zSW5mbyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8iLCJjdXN0b21EYXRhRm9yQ29sdW1ucyIsImdldEN1c3RvbURhdGEiLCJwcm9wZXJ0aWVzVG9CZUNyZWF0ZWQiLCJkYXRhTW9kZWxFbnRpdHlQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiZ2V0Q29udGV4dCIsImN1c3RvbURhdGEiLCJmb3JFYWNoIiwiY29sdW1uRGVmIiwicHJvcGVydHlJbmZvIiwibmFtZSIsInBhdGgiLCJsYWJlbCIsInNvcnRhYmxlIiwiaXNTb3J0YWJsZVByb3BlcnR5IiwiZmlsdGVyYWJsZSIsImlzRmlsdGVyYWJsZVByb3BlcnR5IiwibWF4Q29uZGl0aW9ucyIsImdldFByb3BlcnR5TWF4Q29uZGl0aW9ucyIsInR5cGVDb25maWciLCJpc1R5cGVGaWx0ZXJhYmxlIiwiJFR5cGUiLCJnZXRUeXBlVXRpbCIsImdldFR5cGVDb25maWciLCJ1bmRlZmluZWQiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsInRhcmdldFByb3BlcnR5UGF0aCIsInR5cGUiLCJwcm9wZXJ0eVR5cGVDb25maWciLCJmZXRjaFR5cGVDb25maWciLCJUeXBlVXRpbCIsImZvcm1hdE9wdGlvbnMiLCJjb25zdHJhaW50cyIsInJlbGF0ZWRQcm9wZXJ0aWVzSW5mbyIsInJlbGF0ZWRQcm9wZXJ0eVBhdGhzIiwia2V5cyIsImxlbmd0aCIsInByb3BlcnR5SW5mb3MiLCJmaW5kIiwicHVzaCIsInJlbGF0ZWRDb2x1bW5zIiwiY3JlYXRlUmVsYXRlZFByb3BlcnRpZXMiLCJjb25jYXQiLCJ1cGRhdGVCaW5kaW5nSW5mbyIsIm9NRENUYWJsZSIsIm9CaW5kaW5nSW5mbyIsImFwcGx5Iiwib01ldGFkYXRhSW5mbyIsImNvbGxlY3Rpb25QYXRoIiwib0ZpbHRlciIsIkNvcmUiLCJieUlkIiwiZ2V0RmlsdGVyIiwiYkZpbHRlckVuYWJsZWQiLCJpc0ZpbHRlcmluZ0VuYWJsZWQiLCJtQ29uZGl0aW9ucyIsIm9Jbm5lckZpbHRlckluZm8iLCJvT3V0ZXJGaWx0ZXJJbmZvIiwiYUZpbHRlcnMiLCJ0YWJsZVByb3BlcnRpZXMiLCJnZXRDYWNoZWRQcm9wZXJ0aWVzIiwiZ2V0Q29uZGl0aW9ucyIsIkZpbHRlclV0aWwiLCJnZXRGaWx0ZXJJbmZvIiwiZmlsdGVycyIsImFQYXJhbWV0ZXJOYW1lcyIsIkRlbGVnYXRlVXRpbCIsImdldFBhcmFtZXRlck5hbWVzIiwiX3VwZGF0ZVByb3BlcnR5SW5mbyIsInNQYXJhbWV0ZXJQYXRoIiwiZ2V0UGFyYW1ldGVyc0luZm8iLCJwYXJhbWV0ZXJzIiwiJHNlYXJjaCIsIkNvbW1vblV0aWxzIiwibm9ybWFsaXplU2VhcmNoVGVybSIsImdldFNlYXJjaCIsIl9hcHBseURlZmF1bHRTb3J0aW5nIiwiJHNlbGVjdCIsInJlZHVjZSIsInNRdWVyeSIsIm9Qcm9wZXJ0eSIsImluZGV4T2YiLCIkY291bnQiLCJNb2RlbEhlbHBlciIsImlzRHJhZnRTdXBwb3J0ZWQiLCJGaWx0ZXIiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwiUHJvbWlzZSIsInJlc29sdmUiLCJhdHRhY2hFdmVudE9uY2UiLCJvUGF5bG9hZCIsInNvcnRlciIsImRlZmF1bHRTb3J0UHJvcGVydHlOYW1lIiwiU29ydGVyIiwiYVRhYmxlUHJvcGVydGllcyIsImFDb25kaXRpb25LZXkiLCJvTWV0YU1vZGVsIiwiY29uZGl0aW9uS2V5IiwiZmluZEluZGV4IiwidGFibGVQcm9wZXJ0eSIsIm9Db2x1bW5EZWYiLCJnZXRPYmplY3QiLCJ1cGRhdGVCaW5kaW5nIiwib1RhYmxlIiwib0JpbmRpbmciLCJiTmVlZE1hbnVhbFJlZnJlc2giLCJvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCIsInNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSIsImJQZW5kaW5nTWFudWFsVXBkYXRlIiwib1Jvd0JpbmRpbmciLCJnZXRSb3dCaW5kaW5nIiwib2xkRmlsdGVycyIsImdldEZpbHRlcnMiLCJkZWVwRXF1YWwiLCJnZXRRdWVyeU9wdGlvbnNGcm9tUGFyYW1ldGVycyIsInJlcXVlc3RSZWZyZXNoIiwiZ2V0R3JvdXBJZCIsImZpbmFsbHkiLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwiZmlyZUV2ZW50IiwiZXhpc3RpbmdDb2x1bW5zIiwicmVsYXRlZFByb3BlcnR5TmFtZU1hcCIsInJlbGF0ZWRDb2x1bW4iLCJjb2x1bW4iLCJuZXdOYW1lIiwidmFsdWVIZWxwVGFibGVDb2x1bW4iLCJnZXRMYWJlbCIsIm1hcCIsImNvbHVtbk5hbWUiLCJoYXNPd25Qcm9wZXJ0eSIsImlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24iLCJnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoIiwiZGF0YU1vZGVsQWRkaXRpb25hbFByb3BlcnR5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZURlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBkZWVwRXF1YWwgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcEVxdWFsXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBmZXRjaFR5cGVDb25maWcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L0ZpbHRlckJhclwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQge1xuXHRnZXRGaWx0ZXJSZXN0cmljdGlvbnNJbmZvLFxuXHRnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyxcblx0aXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbixcblx0U29ydFJlc3RyaWN0aW9uc0luZm9UeXBlXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01ldGFNb2RlbEZ1bmN0aW9uXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGgsIGVuaGFuY2VEYXRhTW9kZWxQYXRoLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EaXNwbGF5TW9kZUZvcm1hdHRlclwiO1xuaW1wb3J0IHtcblx0Z2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCxcblx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aCxcblx0Z2V0TGFiZWxcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB7IERlZmF1bHRUeXBlRm9yRWRtVHlwZSwgaXNUeXBlRmlsdGVyYWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS90eXBlL0VETVwiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgTWFjcm9zRGVsZWdhdGVVdGlsLCB7IFByb3BlcnR5SW5mbyB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IHsgZ2V0UGF0aCwgaXNGaWx0ZXJhYmxlUHJvcGVydHksIGlzU29ydGFibGVQcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9UYWJsZURlbGVnYXRlSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IFRhYmxlRGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvb2RhdGEvdjQvVGFibGVEZWxlZ2F0ZVwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9vZGF0YS92NC91dGlsL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCBGaWx0ZXJVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3V0aWwvRmlsdGVyVXRpbFwiO1xuaW1wb3J0IE1EQ1RhYmxlIGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9jb250ZW50L01EQ1RhYmxlXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTW9kZWxcIjtcbmltcG9ydCBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IFNvcnRlciBmcm9tIFwic2FwL3VpL21vZGVsL1NvcnRlclwiO1xuXG5leHBvcnQgdHlwZSBWYWx1ZUhlbHBUYWJsZUNvbHVtbiA9IHtcblx0bmFtZTogc3RyaW5nO1xuXHRwcm9wZXJ0eUluZm9zPzogc3RyaW5nW107XG5cdHNvcnRhYmxlPzogYm9vbGVhbjtcblx0cGF0aD86IHN0cmluZztcblx0bGFiZWw/OiBzdHJpbmc7XG5cdGZpbHRlcmFibGU/OiBib29sZWFuO1xuXHR0eXBlQ29uZmlnPzogT2JqZWN0O1xuXHRtYXhDb25kaXRpb25zPzogbnVtYmVyO1xufTtcbnR5cGUgQ29tcGxleFByb3BlcnR5TWFwID0gUmVjb3JkPHN0cmluZywgUHJvcGVydHk+O1xuXG4vKipcbiAqIFRlc3QgZGVsZWdhdGUgZm9yIE9EYXRhIFY0LlxuICovXG5jb25zdCBPRGF0YVRhYmxlRGVsZWdhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBUYWJsZURlbGVnYXRlKTtcblxuLyoqXG4gKiBGZXRjaGVzIHRoZSByZWxldmFudCBtZXRhZGF0YSBmb3IgdGhlIHRhYmxlIGFuZCByZXR1cm5zIHByb3BlcnR5IGluZm8gYXJyYXkuXG4gKlxuICogQHBhcmFtIHRhYmxlIEluc3RhbmNlIG9mIHRoZSBNREN0YWJsZVxuICogQHJldHVybnMgQXJyYXkgb2YgcHJvcGVydHkgaW5mb1xuICovXG5PRGF0YVRhYmxlRGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzID0gYXN5bmMgZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSk6IFByb21pc2U8UHJvcGVydHlJbmZvPiB7XG5cdGNvbnN0IG1vZGVsID0gYXdhaXQgdGhpcy5fZ2V0TW9kZWwodGFibGUpO1xuXHRjb25zdCBwcm9wZXJ0aWVzID0gYXdhaXQgdGhpcy5fY3JlYXRlUHJvcGVydHlJbmZvcyh0YWJsZSwgbW9kZWwpO1xuXHRPRGF0YVRhYmxlRGVsZWdhdGUuY3JlYXRlSW50ZXJuYWxCaW5kaW5nQ29udGV4dCh0YWJsZSk7XG5cdE1hY3Jvc0RlbGVnYXRlVXRpbC5zZXRDYWNoZWRQcm9wZXJ0aWVzKHRhYmxlLCBwcm9wZXJ0aWVzKTtcblx0KHRhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgQ29udGV4dCkuc2V0UHJvcGVydHkoXCJ0YWJsZVByb3BlcnRpZXNBdmFpbGFibGVcIiwgdHJ1ZSk7XG5cdHJldHVybiBwcm9wZXJ0aWVzO1xufTtcblxuT0RhdGFUYWJsZURlbGVnYXRlLmNyZWF0ZUludGVybmFsQmluZGluZ0NvbnRleHQgPSBmdW5jdGlvbiAodGFibGU6IFRhYmxlKSB7XG5cdGxldCBkaWFsb2c6IE1hbmFnZWRPYmplY3QgfCBudWxsID0gdGFibGU7XG5cdHdoaWxlIChkaWFsb2cgJiYgIWRpYWxvZy5pc0EoXCJzYXAudWkubWRjLnZhbHVlaGVscC5EaWFsb2dcIikpIHtcblx0XHRkaWFsb2cgPSAoZGlhbG9nIGFzIE1hbmFnZWRPYmplY3QpLmdldFBhcmVudCgpO1xuXHR9XG5cblx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IHRhYmxlLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXG5cdGlmIChkaWFsb2cgJiYgaW50ZXJuYWxNb2RlbCkge1xuXHRcdGNvbnN0IGludGVybmFsQmluZGluZ0NvbnRleHQgPSBkaWFsb2cuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRsZXQgbmV3SW50ZXJuYWxCaW5kaW5nQ29udGV4dFBhdGg7XG5cdFx0aWYgKGludGVybmFsQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdG5ld0ludGVybmFsQmluZGluZ0NvbnRleHRQYXRoID0gaW50ZXJuYWxCaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkgKyBgOjpWSERpYWxvZzo6JHtkaWFsb2cuZ2V0SWQoKX06OnRhYmxlYDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bmV3SW50ZXJuYWxCaW5kaW5nQ29udGV4dFBhdGggPSBgL2J1aWxkaW5nYmxvY2tzLyR7dGFibGUuZ2V0SWQoKX1gO1xuXHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9idWlsZGluZ2Jsb2Nrc1wiLCB7IC4uLmludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoXCIvYnVpbGRpbmdibG9ja3NcIikgfSk7XG5cdFx0fVxuXHRcdGNvbnN0IG5ld0ludGVybmFsQmluZGluZ0NvbnRleHQgPSBpbnRlcm5hbE1vZGVsLmJpbmRDb250ZXh0KG5ld0ludGVybmFsQmluZGluZ0NvbnRleHRQYXRoKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHR0YWJsZS5zZXRCaW5kaW5nQ29udGV4dChuZXdJbnRlcm5hbEJpbmRpbmdDb250ZXh0ISwgXCJpbnRlcm5hbFwiKTtcblx0fVxufTtcblxuLyoqXG4gKiBDb2xsZWN0IHJlbGF0ZWQgcHJvcGVydGllcyBmcm9tIGEgcHJvcGVydHkncyBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gZGF0YU1vZGVsUHJvcGVydHlQYXRoIFRoZSBtb2RlbCBvYmplY3QgcGF0aCBvZiB0aGUgcHJvcGVydHkuXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRlZCBwcm9wZXJ0aWVzIHRoYXQgd2VyZSBpZGVudGlmaWVkLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKGRhdGFNb2RlbFByb3BlcnR5UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRjb25zdCBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoID0gZ2V0QWRkaXRpb25hbFByb3BlcnR5KGRhdGFNb2RlbFByb3BlcnR5UGF0aCk7XG5cdGNvbnN0IHJlbGF0ZWRQcm9wZXJ0aWVzOiBDb21wbGV4UHJvcGVydHlNYXAgPSB7fTtcblx0aWYgKGRhdGFNb2RlbEFkZGl0aW9uYWxQcm9wZXJ0eVBhdGg/LnRhcmdldE9iamVjdCkge1xuXHRcdGNvbnN0IGFkZGl0aW9uYWxQcm9wZXJ0eSA9IGRhdGFNb2RlbEFkZGl0aW9uYWxQcm9wZXJ0eVBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdGNvbnN0IGFkZGl0aW9uYWxQcm9wZXJ0eVBhdGggPSBnZXRUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbEFkZGl0aW9uYWxQcm9wZXJ0eVBhdGgsIHRydWUpO1xuXG5cdFx0Y29uc3QgcHJvcGVydHkgPSBkYXRhTW9kZWxQcm9wZXJ0eVBhdGgudGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5O1xuXHRcdGNvbnN0IHByb3BlcnR5UGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsUHJvcGVydHlQYXRoLCB0cnVlKTtcblxuXHRcdGNvbnN0IHRleHRBbm5vdGF0aW9uID0gcHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dCxcblx0XHRcdHRleHRBcnJhbmdlbWVudCA9IHRleHRBbm5vdGF0aW9uPy5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudD8udG9TdHJpbmcoKSxcblx0XHRcdGRpc3BsYXlNb2RlID0gdGV4dEFubm90YXRpb24gJiYgdGV4dEFycmFuZ2VtZW50ICYmIGdldERpc3BsYXlNb2RlKHByb3BlcnR5KTtcblxuXHRcdGlmIChkaXNwbGF5TW9kZSA9PT0gXCJEZXNjcmlwdGlvblwiKSB7XG5cdFx0XHRyZWxhdGVkUHJvcGVydGllc1thZGRpdGlvbmFsUHJvcGVydHlQYXRoXSA9IGFkZGl0aW9uYWxQcm9wZXJ0eTtcblx0XHR9IGVsc2UgaWYgKChkaXNwbGF5TW9kZSAmJiBkaXNwbGF5TW9kZSAhPT0gXCJWYWx1ZVwiKSB8fCAhdGV4dEFubm90YXRpb24pIHtcblx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzW3Byb3BlcnR5UGF0aF0gPSBwcm9wZXJ0eTtcblx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzW2FkZGl0aW9uYWxQcm9wZXJ0eVBhdGhdID0gYWRkaXRpb25hbFByb3BlcnR5O1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVsYXRlZFByb3BlcnRpZXM7XG59XG5cbk9EYXRhVGFibGVEZWxlZ2F0ZS5fY3JlYXRlUHJvcGVydHlJbmZvcyA9IGZ1bmN0aW9uICh0YWJsZTogYW55LCBtb2RlbDogYW55KSB7XG5cdGNvbnN0IG1ldGFkYXRhSW5mbyA9IHRhYmxlLmdldERlbGVnYXRlKCkucGF5bG9hZDtcblx0Y29uc3QgcHJvcGVydGllczogVmFsdWVIZWxwVGFibGVDb2x1bW5bXSA9IFtdO1xuXHRjb25zdCBlbnRpdHlTZXRQYXRoID0gYC8ke21ldGFkYXRhSW5mby5jb2xsZWN0aW9uTmFtZX1gO1xuXHRjb25zdCBtZXRhTW9kZWwgPSBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblxuXHRyZXR1cm4gbWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH1AYCkudGhlbihmdW5jdGlvbiAoZW50aXR5U2V0QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdGNvbnN0IHNvcnRSZXN0cmljdGlvbnNJbmZvID0gZ2V0U29ydFJlc3RyaWN0aW9uc0luZm8oZW50aXR5U2V0QW5ub3RhdGlvbnMpO1xuXHRcdGNvbnN0IGZpbHRlclJlc3RyaWN0aW9ucyA9IGVudGl0eVNldEFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zXCJdO1xuXHRcdGNvbnN0IGZpbHRlclJlc3RyaWN0aW9uc0luZm8gPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnNJbmZvKGZpbHRlclJlc3RyaWN0aW9ucyk7XG5cblx0XHRjb25zdCBjdXN0b21EYXRhRm9yQ29sdW1ucyA9IE1hY3Jvc0RlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRhYmxlLCBcImNvbHVtbnNcIik7XG5cdFx0Y29uc3QgcHJvcGVydGllc1RvQmVDcmVhdGVkOiBSZWNvcmQ8c3RyaW5nLCBQcm9wZXJ0eT4gPSB7fTtcblx0XHRjb25zdCBkYXRhTW9kZWxFbnRpdHlQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRhYmxlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0Q29udGV4dChlbnRpdHlTZXRQYXRoKSk7XG5cdFx0Y3VzdG9tRGF0YUZvckNvbHVtbnMuY3VzdG9tRGF0YS5mb3JFYWNoKGZ1bmN0aW9uIChjb2x1bW5EZWY6IGFueSkge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlJbmZvOiBWYWx1ZUhlbHBUYWJsZUNvbHVtbiA9IHtcblx0XHRcdFx0bmFtZTogY29sdW1uRGVmLnBhdGgsXG5cdFx0XHRcdGxhYmVsOiBjb2x1bW5EZWYubGFiZWwsXG5cdFx0XHRcdHNvcnRhYmxlOiBpc1NvcnRhYmxlUHJvcGVydHkoc29ydFJlc3RyaWN0aW9uc0luZm8sIGNvbHVtbkRlZiksXG5cdFx0XHRcdGZpbHRlcmFibGU6IGlzRmlsdGVyYWJsZVByb3BlcnR5KGZpbHRlclJlc3RyaWN0aW9uc0luZm8sIGNvbHVtbkRlZiksXG5cdFx0XHRcdG1heENvbmRpdGlvbnM6IGdldFByb3BlcnR5TWF4Q29uZGl0aW9ucyhmaWx0ZXJSZXN0cmljdGlvbnNJbmZvLCBjb2x1bW5EZWYpLFxuXHRcdFx0XHR0eXBlQ29uZmlnOiBpc1R5cGVGaWx0ZXJhYmxlKGNvbHVtbkRlZi4kVHlwZSkgPyB0YWJsZS5nZXRUeXBlVXRpbCgpLmdldFR5cGVDb25maWcoY29sdW1uRGVmLiRUeXBlKSA6IHVuZGVmaW5lZFxuXHRcdFx0fTtcblxuXHRcdFx0Y29uc3QgZGF0YU1vZGVsUHJvcGVydHlQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZGF0YU1vZGVsRW50aXR5UGF0aCwgY29sdW1uRGVmLnBhdGgpO1xuXHRcdFx0Y29uc3QgcHJvcGVydHkgPSBkYXRhTW9kZWxQcm9wZXJ0eVBhdGgudGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5O1xuXHRcdFx0aWYgKHByb3BlcnR5KSB7XG5cdFx0XHRcdGNvbnN0IHRhcmdldFByb3BlcnR5UGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsUHJvcGVydHlQYXRoLCB0cnVlKTtcblx0XHRcdFx0bGV0IHR5cGVDb25maWc7XG5cdFx0XHRcdGlmIChpc1R5cGVGaWx0ZXJhYmxlKHByb3BlcnR5LnR5cGUgYXMga2V5b2YgdHlwZW9mIERlZmF1bHRUeXBlRm9yRWRtVHlwZSkpIHtcblx0XHRcdFx0XHRjb25zdCBwcm9wZXJ0eVR5cGVDb25maWcgPSBmZXRjaFR5cGVDb25maWcocHJvcGVydHkpO1xuXHRcdFx0XHRcdHR5cGVDb25maWcgPVxuXHRcdFx0XHRcdFx0VHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhcblx0XHRcdFx0XHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnLnR5cGUgPz8gXCJcIixcblx0XHRcdFx0XHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnMsXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZy5jb25zdHJhaW50c1xuXHRcdFx0XHRcdFx0KSA/PyB0YWJsZS5nZXRUeXBlVXRpbCgpLmdldFR5cGVDb25maWcoY29sdW1uRGVmLiRUeXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvL0NoZWNrIGlmIHRoZXJlIGlzIGFuIGFkZGl0aW9uYWwgcHJvcGVydHkgbGlua2VkIHRvIHRoZSBwcm9wZXJ0eSBhcyBhIFVuaXQsIEN1cnJlbmN5LCBUaW1lem9uZSBvciB0ZXh0QXJyYW5nZW1lbnRcblx0XHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnRpZXNJbmZvID0gY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKGRhdGFNb2RlbFByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdGNvbnN0IHJlbGF0ZWRQcm9wZXJ0eVBhdGhzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mbyk7XG5cblx0XHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0eVBhdGhzLmxlbmd0aCkge1xuXHRcdFx0XHRcdHByb3BlcnR5SW5mby5wcm9wZXJ0eUluZm9zID0gcmVsYXRlZFByb3BlcnR5UGF0aHM7XG5cdFx0XHRcdFx0Ly9Db21wbGV4IHByb3BlcnRpZXMgbXVzdCBiZSBoaWRkZW4gZm9yIHNvcnRpbmcgYW5kIGZpbHRlcmluZ1xuXHRcdFx0XHRcdHByb3BlcnR5SW5mby5zb3J0YWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRcdHByb3BlcnR5SW5mby5maWx0ZXJhYmxlID0gZmFsc2U7XG5cdFx0XHRcdFx0Ly8gQ29sbGVjdCBpbmZvcm1hdGlvbiBvZiByZWxhdGVkIGNvbHVtbnMgdG8gYmUgY3JlYXRlZC5cblx0XHRcdFx0XHRyZWxhdGVkUHJvcGVydHlQYXRocy5mb3JFYWNoKChwYXRoKSA9PiB7XG5cdFx0XHRcdFx0XHRwcm9wZXJ0aWVzVG9CZUNyZWF0ZWRbcGF0aF0gPSByZWxhdGVkUHJvcGVydGllc0luZm9bcGF0aF07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ly8gQWxzbyBhZGQgcHJvcGVydHkgZm9yIHRoZSBpbk91dCBQYXJhbWV0ZXJzIG9uIHRoZSBWYWx1ZUhlbHAgd2hlbiB0ZXh0QXJyYW5nZW1lbnQgaXMgc2V0IHRvICNUZXh0T25seVxuXHRcdFx0XHRcdC8vIEl0IHdpbGwgbm90IGJlIGxpbmtlZCB0byB0aGUgY29tcGxleCBQcm9wZXJ0eSAoQkNQIDIyNzAxNDExNTQpXG5cdFx0XHRcdFx0aWYgKCFyZWxhdGVkUHJvcGVydHlQYXRocy5maW5kKChwYXRoKSA9PiByZWxhdGVkUHJvcGVydGllc0luZm9bcGF0aF0gPT09IHByb3BlcnR5KSkge1xuXHRcdFx0XHRcdFx0cHJvcGVydGllc1RvQmVDcmVhdGVkW3RhcmdldFByb3BlcnR5UGF0aF0gPSBwcm9wZXJ0eTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cHJvcGVydHlJbmZvLnBhdGggPSBjb2x1bW5EZWYucGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRwcm9wZXJ0eUluZm8udHlwZUNvbmZpZyA9IHByb3BlcnR5SW5mby50eXBlQ29uZmlnID8gdHlwZUNvbmZpZyA6IHVuZGVmaW5lZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHByb3BlcnR5SW5mby5wYXRoID0gY29sdW1uRGVmLnBhdGg7XG5cdFx0XHR9XG5cdFx0XHRwcm9wZXJ0aWVzLnB1c2gocHJvcGVydHlJbmZvKTtcblx0XHR9KTtcblx0XHRjb25zdCByZWxhdGVkQ29sdW1ucyA9IGNyZWF0ZVJlbGF0ZWRQcm9wZXJ0aWVzKHByb3BlcnRpZXNUb0JlQ3JlYXRlZCwgcHJvcGVydGllcywgc29ydFJlc3RyaWN0aW9uc0luZm8sIGZpbHRlclJlc3RyaWN0aW9uc0luZm8pO1xuXHRcdHJldHVybiBwcm9wZXJ0aWVzLmNvbmNhdChyZWxhdGVkQ29sdW1ucyk7XG5cdH0pO1xufTtcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSBiaW5kaW5nIGluZm8gd2l0aCB0aGUgcmVsZXZhbnQgcGF0aCBhbmQgbW9kZWwgZnJvbSB0aGUgbWV0YWRhdGEuXG4gKlxuICogQHBhcmFtIG9NRENUYWJsZSBUaGUgTURDVGFibGUgaW5zdGFuY2VcbiAqIEBwYXJhbSBvQmluZGluZ0luZm8gVGhlIGJpbmRpbmdJbmZvIG9mIHRoZSB0YWJsZVxuICovXG5PRGF0YVRhYmxlRGVsZWdhdGUudXBkYXRlQmluZGluZ0luZm8gPSBmdW5jdGlvbiAob01EQ1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55KSB7XG5cdFRhYmxlRGVsZWdhdGUudXBkYXRlQmluZGluZ0luZm8uYXBwbHkodGhpcywgW29NRENUYWJsZSwgb0JpbmRpbmdJbmZvXSk7XG5cdGlmICghb01EQ1RhYmxlKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3Qgb01ldGFkYXRhSW5mbyA9IG9NRENUYWJsZS5nZXREZWxlZ2F0ZSgpLnBheWxvYWQ7XG5cblx0aWYgKG9NZXRhZGF0YUluZm8gJiYgb0JpbmRpbmdJbmZvKSB7XG5cdFx0b0JpbmRpbmdJbmZvLnBhdGggPSBvQmluZGluZ0luZm8ucGF0aCB8fCBvTWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25QYXRoIHx8IGAvJHtvTWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25OYW1lfWA7XG5cdFx0b0JpbmRpbmdJbmZvLm1vZGVsID0gb0JpbmRpbmdJbmZvLm1vZGVsIHx8IG9NZXRhZGF0YUluZm8ubW9kZWw7XG5cdH1cblxuXHRpZiAoIW9CaW5kaW5nSW5mbykge1xuXHRcdG9CaW5kaW5nSW5mbyA9IHt9O1xuXHR9XG5cblx0Y29uc3Qgb0ZpbHRlciA9IENvcmUuYnlJZChvTURDVGFibGUuZ2V0RmlsdGVyKCkpIGFzIGFueSxcblx0XHRiRmlsdGVyRW5hYmxlZCA9IG9NRENUYWJsZS5pc0ZpbHRlcmluZ0VuYWJsZWQoKTtcblx0bGV0IG1Db25kaXRpb25zOiBhbnk7XG5cdGxldCBvSW5uZXJGaWx0ZXJJbmZvLCBvT3V0ZXJGaWx0ZXJJbmZvOiBhbnk7XG5cdGNvbnN0IGFGaWx0ZXJzID0gW107XG5cdGNvbnN0IHRhYmxlUHJvcGVydGllcyA9IE1hY3Jvc0RlbGVnYXRlVXRpbC5nZXRDYWNoZWRQcm9wZXJ0aWVzKG9NRENUYWJsZSk7XG5cblx0Ly9UT0RPOiBjb25zaWRlciBhIG1lY2hhbmlzbSAoJ0ZpbHRlck1lcmdlVXRpbCcgb3IgZW5oYW5jZSAnRmlsdGVyVXRpbCcpIHRvIGFsbG93IHRoZSBjb25uZWN0aW9uIGJldHdlZW4gZGlmZmVyZW50IGZpbHRlcnMpXG5cdGlmIChiRmlsdGVyRW5hYmxlZCkge1xuXHRcdG1Db25kaXRpb25zID0gb01EQ1RhYmxlLmdldENvbmRpdGlvbnMoKTtcblx0XHRvSW5uZXJGaWx0ZXJJbmZvID0gRmlsdGVyVXRpbC5nZXRGaWx0ZXJJbmZvKG9NRENUYWJsZSwgbUNvbmRpdGlvbnMsIHRhYmxlUHJvcGVydGllcyEsIFtdKSBhcyBhbnk7XG5cdFx0aWYgKG9Jbm5lckZpbHRlckluZm8uZmlsdGVycykge1xuXHRcdFx0YUZpbHRlcnMucHVzaChvSW5uZXJGaWx0ZXJJbmZvLmZpbHRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdGlmIChvRmlsdGVyKSB7XG5cdFx0bUNvbmRpdGlvbnMgPSBvRmlsdGVyLmdldENvbmRpdGlvbnMoKTtcblx0XHRpZiAobUNvbmRpdGlvbnMpIHtcblx0XHRcdGNvbnN0IGFQYXJhbWV0ZXJOYW1lcyA9IERlbGVnYXRlVXRpbC5nZXRQYXJhbWV0ZXJOYW1lcyhvRmlsdGVyKTtcblx0XHRcdC8vIFRoZSB0YWJsZSBwcm9wZXJ0aWVzIG5lZWRzIHRvIHVwZGF0ZWQgd2l0aCB0aGUgZmlsdGVyIGZpZWxkIGlmIG5vIFNlbGVjdGlvbmZpZXJsZHMgYXJlIGFubm90YXRlZCBhbmQgbm90IHBhcnQgYXMgdmFsdWUgaGVscCBwYXJhbWV0ZXJcblx0XHRcdE9EYXRhVGFibGVEZWxlZ2F0ZS5fdXBkYXRlUHJvcGVydHlJbmZvKHRhYmxlUHJvcGVydGllcywgb01EQ1RhYmxlLCBtQ29uZGl0aW9ucywgb01ldGFkYXRhSW5mbyk7XG5cdFx0XHRvT3V0ZXJGaWx0ZXJJbmZvID0gRmlsdGVyVXRpbC5nZXRGaWx0ZXJJbmZvKG9GaWx0ZXIsIG1Db25kaXRpb25zLCB0YWJsZVByb3BlcnRpZXMhLCBhUGFyYW1ldGVyTmFtZXMpO1xuXG5cdFx0XHRpZiAob091dGVyRmlsdGVySW5mby5maWx0ZXJzKSB7XG5cdFx0XHRcdGFGaWx0ZXJzLnB1c2gob091dGVyRmlsdGVySW5mby5maWx0ZXJzKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgc1BhcmFtZXRlclBhdGggPSBEZWxlZ2F0ZVV0aWwuZ2V0UGFyYW1ldGVyc0luZm8ob0ZpbHRlciwgbUNvbmRpdGlvbnMpO1xuXHRcdFx0aWYgKHNQYXJhbWV0ZXJQYXRoKSB7XG5cdFx0XHRcdG9CaW5kaW5nSW5mby5wYXRoID0gc1BhcmFtZXRlclBhdGg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gZ2V0IHRoZSBiYXNpYyBzZWFyY2hcblx0XHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoID0gQ29tbW9uVXRpbHMubm9ybWFsaXplU2VhcmNoVGVybShvRmlsdGVyLmdldFNlYXJjaCgpKSB8fCB1bmRlZmluZWQ7XG5cdH1cblxuXHR0aGlzLl9hcHBseURlZmF1bHRTb3J0aW5nKG9CaW5kaW5nSW5mbywgb01EQ1RhYmxlLmdldERlbGVnYXRlKCkucGF5bG9hZCk7XG5cdC8vIGFkZCBzZWxlY3QgdG8gb0JpbmRpbmdJbmZvIChCQ1AgMjE3MDE2MzAxMilcblx0b0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlbGVjdCA9IHRhYmxlUHJvcGVydGllcz8ucmVkdWNlKGZ1bmN0aW9uIChzUXVlcnk6IHN0cmluZywgb1Byb3BlcnR5OiBhbnkpIHtcblx0XHQvLyBOYXZpZ2F0aW9uIHByb3BlcnRpZXMgKHJlcHJlc2VudGVkIGJ5IFgvWSkgc2hvdWxkIG5vdCBiZSBhZGRlZCB0byAkc2VsZWN0LlxuXHRcdC8vIFRvRG8gOiBUaGV5IHNob3VsZCBiZSBhZGRlZCBhcyAkZXhwYW5kPVgoJHNlbGVjdD1ZKSBpbnN0ZWFkXG5cdFx0aWYgKG9Qcm9wZXJ0eS5wYXRoICYmIG9Qcm9wZXJ0eS5wYXRoLmluZGV4T2YoXCIvXCIpID09PSAtMSkge1xuXHRcdFx0c1F1ZXJ5ID0gc1F1ZXJ5ID8gYCR7c1F1ZXJ5fSwke29Qcm9wZXJ0eS5wYXRofWAgOiBvUHJvcGVydHkucGF0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHNRdWVyeTtcblx0fSwgXCJcIik7XG5cblx0Ly8gQWRkICRjb3VudFxuXHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kY291bnQgPSB0cnVlO1xuXG5cdC8vSWYgdGhlIGVudGl0eSBpcyBEcmFmdEVuYWJsZWQgYWRkIGEgRHJhZnRGaWx0ZXJcblx0aWYgKE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob01EQ1RhYmxlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksIG9CaW5kaW5nSW5mby5wYXRoKSkge1xuXHRcdGFGaWx0ZXJzLnB1c2gobmV3IEZpbHRlcihcIklzQWN0aXZlRW50aXR5XCIsIEZpbHRlck9wZXJhdG9yLkVRLCB0cnVlKSk7XG5cdH1cblxuXHRvQmluZGluZ0luZm8uZmlsdGVycyA9IG5ldyBGaWx0ZXIoYUZpbHRlcnMsIHRydWUpO1xufTtcblxuT0RhdGFUYWJsZURlbGVnYXRlLmdldFR5cGVVdGlsID0gZnVuY3Rpb24gKC8qb1BheWxvYWQqLykge1xuXHRyZXR1cm4gVHlwZVV0aWw7XG59O1xuXG4vKipcbiAqIEdldCB0YWJsZSBNb2RlbC5cbiAqXG4gKiBAcGFyYW0gdGFibGUgSW5zdGFuY2Ugb2YgdGhlIE1EQ3RhYmxlXG4gKiBAcmV0dXJucyBNb2RlbFxuICovXG5PRGF0YVRhYmxlRGVsZWdhdGUuX2dldE1vZGVsID0gYXN5bmMgZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSk6IFByb21pc2U8TW9kZWw+IHtcblx0Y29uc3QgbWV0YWRhdGFJbmZvID0gKHRhYmxlLmdldERlbGVnYXRlKCkgYXMgYW55KS5wYXlsb2FkO1xuXHRsZXQgbW9kZWw6IE1vZGVsID0gdGFibGUuZ2V0TW9kZWwobWV0YWRhdGFJbmZvLm1vZGVsKSE7XG5cdGlmICghbW9kZWwpIHtcblx0XHRhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0dGFibGUuYXR0YWNoRXZlbnRPbmNlKFwibW9kZWxDb250ZXh0Q2hhbmdlXCIsIHJlc29sdmUpO1xuXHRcdH0pO1xuXHRcdG1vZGVsID0gdGFibGUuZ2V0TW9kZWwobWV0YWRhdGFJbmZvLm1vZGVsKSE7XG5cdH1cblx0cmV0dXJuIG1vZGVsO1xufTtcblxuLyoqXG4gKiBBcHBsaWVzIGEgZGVmYXVsdCBzb3J0IG9yZGVyIGlmIG5lZWRlZC4gVGhpcyBpcyBvbmx5IHRoZSBjYXNlIGlmIHRoZSByZXF1ZXN0IGlzIG5vdCBhICRzZWFyY2ggcmVxdWVzdFxuICogKG1lYW5zIHRoZSBwYXJhbWV0ZXIgJHNlYXJjaCBvZiB0aGUgYmluZGluZ0luZm8gaXMgdW5kZWZpbmVkKSBhbmQgaWYgbm90IGFscmVhZHkgYSBzb3J0IG9yZGVyIGlzIHNldCxcbiAqIGUuZy4gdmlhIHByZXNlbnRhdGlvbiB2YXJpYW50IG9yIG1hbnVhbCBieSB0aGUgdXNlci5cbiAqXG4gKiBAcGFyYW0gb0JpbmRpbmdJbmZvIFRoZSBiaW5kaW5nSW5mbyBvZiB0aGUgdGFibGVcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBvZiB0aGUgVGFibGVEZWxlZ2F0ZVxuICovXG5PRGF0YVRhYmxlRGVsZWdhdGUuX2FwcGx5RGVmYXVsdFNvcnRpbmcgPSBmdW5jdGlvbiAob0JpbmRpbmdJbmZvOiBhbnksIG9QYXlsb2FkOiBhbnkpIHtcblx0aWYgKG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzICYmIG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggPT0gdW5kZWZpbmVkICYmIG9CaW5kaW5nSW5mby5zb3J0ZXIgJiYgb0JpbmRpbmdJbmZvLnNvcnRlci5sZW5ndGggPT0gMCkge1xuXHRcdGNvbnN0IGRlZmF1bHRTb3J0UHJvcGVydHlOYW1lID0gb1BheWxvYWQgPyBvUGF5bG9hZC5kZWZhdWx0U29ydFByb3BlcnR5TmFtZSA6IHVuZGVmaW5lZDtcblx0XHRpZiAoZGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUpIHtcblx0XHRcdG9CaW5kaW5nSW5mby5zb3J0ZXIucHVzaChuZXcgU29ydGVyKGRlZmF1bHRTb3J0UHJvcGVydHlOYW1lLCBmYWxzZSkpO1xuXHRcdH1cblx0fVxufTtcblxuLyoqXG4gKiBVcGRhdGVzIHRoZSB0YWJsZSBwcm9wZXJ0aWVzIHdpdGggZmlsdGVyIGZpZWxkIGluZm9zLlxuICpcbiAqIEBwYXJhbSBhVGFibGVQcm9wZXJ0aWVzIEFycmF5IHdpdGggdGFibGUgcHJvcGVydGllc1xuICogQHBhcmFtIG9NRENUYWJsZSBUaGUgTURDVGFibGUgaW5zdGFuY2VcbiAqIEBwYXJhbSBtQ29uZGl0aW9ucyBUaGUgY29uZGl0aW9ucyBvZiB0aGUgdGFibGVcbiAqIEBwYXJhbSBvTWV0YWRhdGFJbmZvIFRoZSBtZXRhZGF0YSBpbmZvIG9mIHRoZSBmaWx0ZXIgZmllbGRcbiAqL1xuT0RhdGFUYWJsZURlbGVnYXRlLl91cGRhdGVQcm9wZXJ0eUluZm8gPSBmdW5jdGlvbiAoXG5cdGFUYWJsZVByb3BlcnRpZXM6IGFueVtdLFxuXHRvTURDVGFibGU6IE1EQ1RhYmxlLFxuXHRtQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgYW55Pixcblx0b01ldGFkYXRhSW5mbzogYW55XG4pIHtcblx0Y29uc3QgYUNvbmRpdGlvbktleSA9IE9iamVjdC5rZXlzKG1Db25kaXRpb25zKSxcblx0XHRvTWV0YU1vZGVsID0gKG9NRENUYWJsZS5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwpLmdldE1ldGFNb2RlbCgpITtcblx0YUNvbmRpdGlvbktleS5mb3JFYWNoKGZ1bmN0aW9uIChjb25kaXRpb25LZXk6IGFueSkge1xuXHRcdGlmIChcblx0XHRcdGFUYWJsZVByb3BlcnRpZXMuZmluZEluZGV4KGZ1bmN0aW9uICh0YWJsZVByb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHRhYmxlUHJvcGVydHkucGF0aCA9PT0gY29uZGl0aW9uS2V5O1xuXHRcdFx0fSkgPT09IC0xXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBvQ29sdW1uRGVmID0ge1xuXHRcdFx0XHRwYXRoOiBjb25kaXRpb25LZXksXG5cdFx0XHRcdHR5cGVDb25maWc6IG9NRENUYWJsZVxuXHRcdFx0XHRcdC5nZXRUeXBlVXRpbCgpXG5cdFx0XHRcdFx0LmdldFR5cGVDb25maWcob01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke29NZXRhZGF0YUluZm8uY29sbGVjdGlvbk5hbWV9LyR7Y29uZGl0aW9uS2V5fWApLiRUeXBlKVxuXHRcdFx0fTtcblx0XHRcdGFUYWJsZVByb3BlcnRpZXMucHVzaChvQ29sdW1uRGVmKTtcblx0XHR9XG5cdH0pO1xufTtcblxuT0RhdGFUYWJsZURlbGVnYXRlLnVwZGF0ZUJpbmRpbmcgPSBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55LCBvQmluZGluZzogYW55KSB7XG5cdGxldCBiTmVlZE1hbnVhbFJlZnJlc2ggPSBmYWxzZTtcblx0Y29uc3Qgb0ludGVybmFsQmluZGluZ0NvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0Y29uc3Qgc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5ID0gXCJwZW5kaW5nTWFudWFsQmluZGluZ1VwZGF0ZVwiO1xuXHRjb25zdCBiUGVuZGluZ01hbnVhbFVwZGF0ZSA9IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0Py5nZXRQcm9wZXJ0eShzTWFudWFsVXBkYXRlUHJvcGVydHlLZXkpO1xuXHRsZXQgb1Jvd0JpbmRpbmcgPSBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXG5cdC8vb0JpbmRpbmc9bnVsbCBtZWFucyB0aGF0IGEgcmViaW5kaW5nIG5lZWRzIHRvIGJlIGZvcmNlZCB2aWEgdXBkYXRlQmluZGluZyBpbiBtZGMgVGFibGVEZWxlZ2F0ZVxuXHRUYWJsZURlbGVnYXRlLnVwZGF0ZUJpbmRpbmcuYXBwbHkoT0RhdGFUYWJsZURlbGVnYXRlLCBbb1RhYmxlLCBvQmluZGluZ0luZm8sIG9CaW5kaW5nXSk7XG5cdC8vZ2V0IHJvdyBiaW5kaW5nIGFmdGVyIHJlYmluZCBmcm9tIFRhYmxlRGVsZWdhdGUudXBkYXRlQmluZGluZyBpbiBjYXNlIG9CaW5kaW5nIHdhcyBudWxsXG5cdGlmICghb1Jvd0JpbmRpbmcpIHtcblx0XHRvUm93QmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdH1cblx0aWYgKG9Sb3dCaW5kaW5nKSB7XG5cdFx0LyoqXG5cdFx0ICogTWFudWFsIHJlZnJlc2ggaWYgZmlsdGVycyBhcmUgbm90IGNoYW5nZWQgYnkgYmluZGluZy5yZWZyZXNoKCkgc2luY2UgdXBkYXRpbmcgdGhlIGJpbmRpbmdJbmZvXG5cdFx0ICogaXMgbm90IGVub3VnaCB0byB0cmlnZ2VyIGEgYmF0Y2ggcmVxdWVzdC5cblx0XHQgKiBSZW1vdmluZyBjb2x1bW5zIGNyZWF0ZXMgb25lIGJhdGNoIHJlcXVlc3QgdGhhdCB3YXMgbm90IGV4ZWN1dGVkIGJlZm9yZVxuXHRcdCAqL1xuXHRcdGNvbnN0IG9sZEZpbHRlcnMgPSBvUm93QmluZGluZy5nZXRGaWx0ZXJzKFwiQXBwbGljYXRpb25cIik7XG5cdFx0Yk5lZWRNYW51YWxSZWZyZXNoID1cblx0XHRcdGRlZXBFcXVhbChvQmluZGluZ0luZm8uZmlsdGVycywgb2xkRmlsdGVyc1swXSkgJiZcblx0XHRcdG9Sb3dCaW5kaW5nLmdldFF1ZXJ5T3B0aW9uc0Zyb21QYXJhbWV0ZXJzKCkuJHNlYXJjaCA9PT0gb0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaCAmJlxuXHRcdFx0IWJQZW5kaW5nTWFudWFsVXBkYXRlO1xuXHR9XG5cblx0aWYgKGJOZWVkTWFudWFsUmVmcmVzaCAmJiBvVGFibGUuZ2V0RmlsdGVyKCkpIHtcblx0XHRvSW50ZXJuYWxCaW5kaW5nQ29udGV4dD8uc2V0UHJvcGVydHkoc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5LCB0cnVlKTtcblx0XHRvUm93QmluZGluZ1xuXHRcdFx0LnJlcXVlc3RSZWZyZXNoKG9Sb3dCaW5kaW5nLmdldEdyb3VwSWQoKSlcblx0XHRcdC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0b0ludGVybmFsQmluZGluZ0NvbnRleHQ/LnNldFByb3BlcnR5KHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSwgZmFsc2UpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVmcmVzaGluZyBhIGZpbHRlckJhciBWSCB0YWJsZVwiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cblx0b1RhYmxlLmZpcmVFdmVudChcImJpbmRpbmdVcGRhdGVkXCIpO1xuXHQvL25vIG5lZWQgdG8gY2hlY2sgZm9yIHNlbWFudGljIHRhcmdldHMgaGVyZSBzaW5jZSB3ZSBhcmUgaW4gYSBWSCBhbmQgZG9uJ3Qgd2FudCB0byBhbGxvdyBmdXJ0aGVyIG5hdmlnYXRpb25cbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIHNpbXBsZSBwcm9wZXJ0eSBmb3IgZWFjaCBpZGVudGlmaWVkIGNvbXBsZXggcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHByb3BlcnRpZXNUb0JlQ3JlYXRlZCBJZGVudGlmaWVkIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0gZXhpc3RpbmdDb2x1bW5zIFRoZSBsaXN0IG9mIGNvbHVtbnMgY3JlYXRlZCBmb3IgcHJvcGVydGllcyBkZWZpbmVkIG9uIHRoZSBWYWx1ZSBMaXN0LlxuICogQHBhcmFtIHNvcnRSZXN0cmljdGlvbnNJbmZvIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBzb3J0IHJlc3RyaWN0aW9uIGluZm9ybWF0aW9uXG4gKiBAcGFyYW0gZmlsdGVyUmVzdHJpY3Rpb25zSW5mbyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgZmlsdGVyIHJlc3RyaWN0aW9uIGluZm9ybWF0aW9uXG4gKiBAcmV0dXJucyBUaGUgYXJyYXkgb2YgcHJvcGVydGllcyBjcmVhdGVkLlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gY3JlYXRlUmVsYXRlZFByb3BlcnRpZXMoXG5cdHByb3BlcnRpZXNUb0JlQ3JlYXRlZDogUmVjb3JkPHN0cmluZywgUHJvcGVydHk+LFxuXHRleGlzdGluZ0NvbHVtbnM6IFZhbHVlSGVscFRhYmxlQ29sdW1uW10sXG5cdHNvcnRSZXN0cmljdGlvbnNJbmZvOiBTb3J0UmVzdHJpY3Rpb25zSW5mb1R5cGUsXG5cdGZpbHRlclJlc3RyaWN0aW9uc0luZm86IGFueVxuKTogVmFsdWVIZWxwVGFibGVDb2x1bW5bXSB7XG5cdGNvbnN0IHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fSxcblx0XHRyZWxhdGVkQ29sdW1uczogVmFsdWVIZWxwVGFibGVDb2x1bW5bXSA9IFtdO1xuXHRPYmplY3Qua2V5cyhwcm9wZXJ0aWVzVG9CZUNyZWF0ZWQpLmZvckVhY2goKHBhdGgpID0+IHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IHByb3BlcnRpZXNUb0JlQ3JlYXRlZFtwYXRoXSxcblx0XHRcdHJlbGF0ZWRDb2x1bW4gPSBleGlzdGluZ0NvbHVtbnMuZmluZCgoY29sdW1uKSA9PiBjb2x1bW4ucGF0aCA9PT0gcGF0aCk7IC8vIENvbXBsZXggcHJvcGVydGllcyBkb2Vzbid0IGdldCBwYXRoIHNvIG9ubHkgc2ltcGxlIGNvbHVtbiBhcmUgZm91bmRcblx0XHRpZiAoIXJlbGF0ZWRDb2x1bW4pIHtcblx0XHRcdGNvbnN0IG5ld05hbWUgPSBgUHJvcGVydHk6OiR7cGF0aH1gO1xuXHRcdFx0cmVsYXRlZFByb3BlcnR5TmFtZU1hcFtwYXRoXSA9IG5ld05hbWU7XG5cdFx0XHRjb25zdCB2YWx1ZUhlbHBUYWJsZUNvbHVtbjogVmFsdWVIZWxwVGFibGVDb2x1bW4gPSB7XG5cdFx0XHRcdG5hbWU6IG5ld05hbWUsXG5cdFx0XHRcdGxhYmVsOiBnZXRMYWJlbChwcm9wZXJ0eSksXG5cdFx0XHRcdHBhdGg6IHBhdGgsXG5cdFx0XHRcdHNvcnRhYmxlOiBpc1NvcnRhYmxlUHJvcGVydHkoc29ydFJlc3RyaWN0aW9uc0luZm8sIHByb3BlcnR5KSxcblx0XHRcdFx0ZmlsdGVyYWJsZTogaXNGaWx0ZXJhYmxlUHJvcGVydHkoZmlsdGVyUmVzdHJpY3Rpb25zSW5mbywgcHJvcGVydHkpXG5cdFx0XHR9O1xuXHRcdFx0dmFsdWVIZWxwVGFibGVDb2x1bW4ubWF4Q29uZGl0aW9ucyA9IGdldFByb3BlcnR5TWF4Q29uZGl0aW9ucyhmaWx0ZXJSZXN0cmljdGlvbnNJbmZvLCB2YWx1ZUhlbHBUYWJsZUNvbHVtbik7XG5cdFx0XHRpZiAoaXNUeXBlRmlsdGVyYWJsZShwcm9wZXJ0eS50eXBlIGFzIGtleW9mIHR5cGVvZiBEZWZhdWx0VHlwZUZvckVkbVR5cGUpKSB7XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5VHlwZUNvbmZpZyA9IGZldGNoVHlwZUNvbmZpZyhwcm9wZXJ0eSk7XG5cdFx0XHRcdHZhbHVlSGVscFRhYmxlQ29sdW1uLnR5cGVDb25maWcgPSBUeXBlVXRpbC5nZXRUeXBlQ29uZmlnKFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZy50eXBlID8/IFwiXCIsXG5cdFx0XHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnMsXG5cdFx0XHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnLmNvbnN0cmFpbnRzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRyZWxhdGVkQ29sdW1ucy5wdXNoKHZhbHVlSGVscFRhYmxlQ29sdW1uKTtcblx0XHR9XG5cdH0pO1xuXHQvLyBUaGUgcHJvcGVydHkgJ25hbWUnIGhhcyBiZWVuIHByZWZpeGVkIHdpdGggJ1Byb3BlcnR5OjonIGZvciB1bmlxdWVuZXNzLlxuXHQvLyBVcGRhdGUgdGhlIHNhbWUgaW4gb3RoZXIgcHJvcGVydHlJbmZvc1tdIHJlZmVyZW5jZXMgd2hpY2ggcG9pbnQgdG8gdGhpcyBwcm9wZXJ0eS5cblx0ZXhpc3RpbmdDb2x1bW5zLmZvckVhY2goKGNvbHVtbikgPT4ge1xuXHRcdGlmIChjb2x1bW4ucHJvcGVydHlJbmZvcykge1xuXHRcdFx0Y29sdW1uLnByb3BlcnR5SW5mb3MgPSBjb2x1bW4ucHJvcGVydHlJbmZvcz8ubWFwKChjb2x1bW5OYW1lKSA9PiByZWxhdGVkUHJvcGVydHlOYW1lTWFwW2NvbHVtbk5hbWVdID8/IGNvbHVtbk5hbWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiByZWxhdGVkQ29sdW1ucztcbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIHRoZSBtYXhDb25kaXRpb25zIGZvciBhIGdpdmVuIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBmaWx0ZXJSZXN0cmljdGlvbnNJbmZvIFRoZSBmaWx0ZXIgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb24gZnJvbSB0aGUgcmVzdHJpY3Rpb24gYW5ub3RhdGlvbi5cbiAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgdGFyZ2V0IHByb3BlcnR5LlxuICogQHJldHVybnMgYC0xYCBvciBgMWAgaWYgdGhlIHByb3BlcnR5IGlzIGEgTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24uXG4gKiBAcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGdldFByb3BlcnR5TWF4Q29uZGl0aW9ucyhmaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnksIHByb3BlcnR5OiBWYWx1ZUhlbHBUYWJsZUNvbHVtbiB8IFByb3BlcnR5KTogbnVtYmVyIHtcblx0Y29uc3QgcHJvcGVydHlQYXRoID0gZ2V0UGF0aChwcm9wZXJ0eSk7XG5cdHJldHVybiBmaWx0ZXJSZXN0cmljdGlvbnNJbmZvLnByb3BlcnR5SW5mbz8uaGFzT3duUHJvcGVydHkocHJvcGVydHlQYXRoKSAmJlxuXHRcdHByb3BlcnR5UGF0aCAmJlxuXHRcdGlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24oZmlsdGVyUmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bcHJvcGVydHlQYXRoXSlcblx0XHQ/IC0xXG5cdFx0OiAxO1xufVxuXG4vKipcbiAqIElkZW50aWZpZXMgdGhlIGFkZGl0aW9uYWwgcHJvcGVydHkgd2hpY2ggcmVmZXJlbmNlcyB0byB0aGUgdW5pdCwgdGltZXpvbmUsIHRleHRBcnJhbmdlbWVudCBvciBjdXJyZW5jeS5cbiAqXG4gKiBAcGFyYW0gZGF0YU1vZGVsUHJvcGVydHlQYXRoIFRoZSBtb2RlbCBvYmplY3QgcGF0aCBvZiB0aGUgcHJvcGVydHkuXG4gKiBAcmV0dXJucyBUaGUgYWRkaXRpb25hbCBwcm9wZXJ0eS5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGdldEFkZGl0aW9uYWxQcm9wZXJ0eShkYXRhTW9kZWxQcm9wZXJ0eVBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBEYXRhTW9kZWxPYmplY3RQYXRoIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgcHJvcGVydHkgPSBkYXRhTW9kZWxQcm9wZXJ0eVBhdGgudGFyZ2V0T2JqZWN0O1xuXHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHlQYXRoID1cblx0XHRnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aChwcm9wZXJ0eSkgfHxcblx0XHRnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eVBhdGgocHJvcGVydHkpIHx8XG5cdFx0Z2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVBhdGgocHJvcGVydHkpIHx8XG5cdFx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoKHByb3BlcnR5KTtcblx0aWYgKCFhZGRpdGlvbmFsUHJvcGVydHlQYXRoKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRjb25zdCBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHkgPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxQcm9wZXJ0eVBhdGgsIGFkZGl0aW9uYWxQcm9wZXJ0eVBhdGgpO1xuXG5cdC8vQWRkaXRpb25hbCBQcm9wZXJ0eSBjb3VsZCByZWZlciB0byBhIG5hdmlnYXRpb24gcHJvcGVydHksIGtlZXAgdGhlIG5hbWUgYW5kIHBhdGggYXMgbmF2aWdhdGlvbiBwcm9wZXJ0eVxuXHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHkgPSBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHkudGFyZ2V0T2JqZWN0O1xuXHRpZiAoIWFkZGl0aW9uYWxQcm9wZXJ0eSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIGRhdGFNb2RlbEFkZGl0aW9uYWxQcm9wZXJ0eTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgT0RhdGFUYWJsZURlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFxREE7QUFDQTtBQUNBO0VBQ0EsTUFBTUEsa0JBQWtCLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFQyxhQUFhLENBQUM7O0VBRTNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBSCxrQkFBa0IsQ0FBQ0ksZUFBZSxHQUFHLGdCQUFnQkMsS0FBWSxFQUF5QjtJQUN6RixNQUFNQyxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0YsS0FBSyxDQUFDO0lBQ3pDLE1BQU1HLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQ0Msb0JBQW9CLENBQUNKLEtBQUssRUFBRUMsS0FBSyxDQUFDO0lBQ2hFTixrQkFBa0IsQ0FBQ1UsNEJB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
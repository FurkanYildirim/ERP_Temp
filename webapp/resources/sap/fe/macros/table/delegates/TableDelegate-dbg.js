/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/deepEqual", "sap/base/util/deepExtend", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/ExcelFormatHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/SizeHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/type/EDM", "sap/fe/core/type/TypeUtil", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filterBar/FilterBarDelegate", "sap/fe/macros/table/TableSizeHelper", "sap/fe/macros/table/Utils", "sap/ui/core/Fragment", "sap/ui/mdc/odata/v4/TableDelegate", "sap/ui/model/Filter", "sap/ui/model/json/JSONModel", "../TableHelper"], function (Log, deepClone, deepEqual, deepExtend, ActionRuntime, CommonUtils, MetaModelConverter, ValueFormatter, DeleteHelper, ExcelFormat, ModelHelper, ResourceModelHelper, SizeHelper, TypeGuards, EDM, TypeUtil, CommonHelper, DelegateUtil, FilterBarDelegate, TableSizeHelper, TableUtils, Fragment, TableDelegateBase, Filter, JSONModel, TableHelper) {
  "use strict";

  var isTypeFilterable = EDM.isTypeFilterable;
  var isMultipleNavigationProperty = TypeGuards.isMultipleNavigationProperty;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var getLocalizedText = ResourceModelHelper.getLocalizedText;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  const SEMANTICKEY_HAS_DRAFTINDICATOR = "/semanticKeyHasDraftIndicator";

  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * The class is experimental and the API and the behavior are not finalized. This class is not intended for productive usage.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69.0
   * @alias sap.fe.macros.TableDelegate
   */
  return Object.assign({}, TableDelegateBase, {
    apiVersion: 2,
    /**
     * This function calculates the width for a FieldGroup column.
     * The width of the FieldGroup is the width of the widest property contained in the FieldGroup (including the label if showDataFieldsLabel is true)
     * The result of this calculation is stored in the visualSettings.widthCalculation.minWidth property, which is used by the MDCtable.
     *
     * @param oTable Instance of the MDCtable
     * @param oProperty Current property
     * @param aProperties Array of properties
     * @private
     * @alias sap.fe.macros.TableDelegate
     */
    _computeVisualSettingsForFieldGroup: function (oTable, oProperty, aProperties) {
      if (oProperty.name.indexOf("DataFieldForAnnotation::FieldGroup::") === 0) {
        const oColumn = oTable.getColumns().find(function (oCol) {
          return oCol.getDataProperty() === oProperty.name;
        });
        const bShowDataFieldsLabel = oColumn ? oColumn.data("showDataFieldsLabel") === "true" : false;
        const oMetaModel = oTable.getModel().getMetaModel();
        const involvedDataModelObjects = getInvolvedDataModelObjects(oMetaModel.getContext(oProperty.metadataPath));
        const convertedMetaData = involvedDataModelObjects.convertedTypes;
        const oDataField = involvedDataModelObjects.targetObject;
        const oFieldGroup = oDataField.Target.$target;
        const aFieldWidth = [];
        oFieldGroup.Data.forEach(function (oData) {
          let oDataFieldWidth;
          switch (oData.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
              oDataFieldWidth = TableSizeHelper.getWidthForDataFieldForAnnotation(oData, aProperties, convertedMetaData, bShowDataFieldsLabel);
              break;
            case "com.sap.vocabularies.UI.v1.DataField":
              oDataFieldWidth = TableSizeHelper.getWidthForDataField(oData, bShowDataFieldsLabel, aProperties, convertedMetaData);
              break;
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              oDataFieldWidth = {
                labelWidth: 0,
                propertyWidth: SizeHelper.getButtonWidth(oData.Label)
              };
              break;
            default:
          }
          if (oDataFieldWidth) {
            aFieldWidth.push(oDataFieldWidth.labelWidth + oDataFieldWidth.propertyWidth);
          }
        });
        const nWidest = aFieldWidth.reduce(function (acc, value) {
          return Math.max(acc, value);
        }, 0);
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            verticalArrangement: true,
            minWidth: Math.ceil(nWidest)
          }
        });
      }
    },
    _computeVisualSettingsForPropertyWithValueHelp: function (table, property) {
      const tableAPI = table.getParent();
      if (!property.propertyInfos) {
        const metaModel = table.getModel().getMetaModel();
        if (property.metadataPath && metaModel) {
          const dataField = metaModel.getObject(`${property.metadataPath}@`);
          if (dataField && dataField["@com.sap.vocabularies.Common.v1.ValueList"]) {
            property.visualSettings = deepExtend(property.visualSettings || {}, {
              widthCalculation: {
                gap: tableAPI.getProperty("readOnly") ? 0 : 4
              }
            });
          }
        }
      }
    },
    _computeVisualSettingsForPropertyWithUnit: function (oTable, oProperty, oUnit, oUnitText, oTimezoneText) {
      const oTableAPI = oTable ? oTable.getParent() : null;
      // update gap for properties with string unit
      const sUnitText = oUnitText || oTimezoneText;
      if (sUnitText) {
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            gap: Math.ceil(SizeHelper.getButtonWidth(sUnitText))
          }
        });
      }
      if (oUnit) {
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            // For properties with unit, a gap needs to be added to properly render the column width on edit mode
            gap: oTableAPI && oTableAPI.getReadOnly() ? 0 : 6
          }
        });
      }
    },
    _computeLabel: function (property, labelMap) {
      if (property.label) {
        var _property$path;
        const propertiesWithSameLabel = labelMap[property.label];
        if ((propertiesWithSameLabel === null || propertiesWithSameLabel === void 0 ? void 0 : propertiesWithSameLabel.length) > 1 && (_property$path = property.path) !== null && _property$path !== void 0 && _property$path.includes("/") && property.additionalLabels) {
          property.label = property.label + " (" + property.additionalLabels.join(" / ") + ")";
        }
        delete property.additionalLabels;
      }
    },
    //Update VisualSetting for columnWidth calculation and labels on navigation properties
    _updatePropertyInfo: function (table, properties) {
      const labelMap = {};
      // Check available p13n modes
      const p13nMode = table.getP13nMode();
      properties.forEach(property => {
        if (!property.propertyInfos && property.label) {
          // Only for non-complex properties
          if ((p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Sort")) > -1 && property.sortable || (p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Filter")) > -1 && property.filterable || (p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Group")) > -1 && property.groupable) {
            labelMap[property.label] = labelMap[property.label] !== undefined ? labelMap[property.label].concat([property]) : [property];
          }
        }
      });
      properties.forEach(property => {
        this._computeVisualSettingsForFieldGroup(table, property, properties);
        this._computeVisualSettingsForPropertyWithValueHelp(table, property);
        // bcp: 2270003577
        // Some columns (eg: custom columns) have no typeConfig property.
        // initializing it prevents an exception throw
        property.typeConfig = deepExtend(property.typeConfig, {});
        this._computeLabel(property, labelMap);
      });
      return properties;
    },
    getColumnsFor: function (table) {
      return table.getParent().getTableDefinition().columns;
    },
    _getAggregatedPropertyMap: function (oTable) {
      return oTable.getParent().getTableDefinition().aggregates;
    },
    /**
     * Returns the export capabilities for the given sap.ui.mdc.Table instance.
     *
     * @param oTable Instance of the table
     * @returns Promise representing the export capabilities of the table instance
     */
    fetchExportCapabilities: function (oTable) {
      const oCapabilities = {
        XLSX: {}
      };
      let oModel;
      return DelegateUtil.fetchModel(oTable).then(function (model) {
        oModel = model;
        return oModel.getMetaModel().getObject("/$EntityContainer@Org.OData.Capabilities.V1.SupportedFormats");
      }).then(function (aSupportedFormats) {
        const aLowerFormats = (aSupportedFormats || []).map(element => {
          return element.toLowerCase();
        });
        if (aLowerFormats.indexOf("application/pdf") > -1) {
          return oModel.getMetaModel().getObject("/$EntityContainer@com.sap.vocabularies.PDF.v1.Features");
        }
        return undefined;
      }).then(function (oAnnotation) {
        if (oAnnotation) {
          oCapabilities["PDF"] = Object.assign({}, oAnnotation);
        }
      }).catch(function (err) {
        Log.error(`An error occurs while computing export capabilities: ${err}`);
      }).then(function () {
        return oCapabilities;
      });
    },
    /**
     * Filtering on 1:n navigation properties and navigation
     * properties not part of the LineItem annotation is forbidden.
     *
     * @param columnInfo
     * @param metaModel
     * @param table
     * @returns Boolean true if filtering is allowed, false otherwise
     */
    _isFilterableNavigationProperty: function (columnInfo, metaModel, table) {
      // get the DataModelObjectPath for the table
      const tableDataModelObjectPath = getInvolvedDataModelObjects(metaModel.getContext(DelegateUtil.getCustomData(table, "metaPath"))),
        // get all navigation properties leading to the column
        columnNavigationProperties = getInvolvedDataModelObjects(metaModel.getContext(columnInfo.annotationPath)).navigationProperties,
        // we are only interested in navigation properties relative to the table, so all before and including the tables targetType can be filtered
        tableTargetEntityIndex = columnNavigationProperties.findIndex(prop => {
          var _prop$targetType;
          return ((_prop$targetType = prop.targetType) === null || _prop$targetType === void 0 ? void 0 : _prop$targetType.name) === tableDataModelObjectPath.targetEntityType.name;
        }),
        relativeNavigationProperties = columnNavigationProperties.slice(tableTargetEntityIndex > 0 ? tableTargetEntityIndex : 0);
      return !columnInfo.relativePath.includes("/") || columnInfo.isPartOfLineItem === true && !relativeNavigationProperties.some(isMultipleNavigationProperty);
    },
    _fetchPropertyInfo: function (metaModel, columnInfo, table, appComponent) {
      var _columnInfo$typeConfi, _columnInfo$typeConfi2, _columnInfo$propertyI;
      const sAbsoluteNavigationPath = columnInfo.annotationPath,
        oDataField = metaModel.getObject(sAbsoluteNavigationPath),
        oNavigationContext = metaModel.createBindingContext(sAbsoluteNavigationPath),
        oTypeConfig = (_columnInfo$typeConfi = columnInfo.typeConfig) !== null && _columnInfo$typeConfi !== void 0 && _columnInfo$typeConfi.className && isTypeFilterable(columnInfo.typeConfig.className) ? TypeUtil.getTypeConfig(columnInfo.typeConfig.className, columnInfo.typeConfig.formatOptions, columnInfo.typeConfig.constraints) : {},
        bFilterable = CommonHelper.isPropertyFilterable(oNavigationContext, oDataField),
        isComplexType = columnInfo.typeConfig && columnInfo.typeConfig.className && ((_columnInfo$typeConfi2 = columnInfo.typeConfig.className) === null || _columnInfo$typeConfi2 === void 0 ? void 0 : _columnInfo$typeConfi2.indexOf("Edm.")) !== 0,
        bIsAnalyticalTable = DelegateUtil.getCustomData(table, "enableAnalytics") === "true",
        aAggregatedPropertyMapUnfilterable = bIsAnalyticalTable ? this._getAggregatedPropertyMap(table) : {},
        label = getLocalizedText(columnInfo.label ?? "", appComponent ?? table);
      const propertyInfo = {
        name: columnInfo.name,
        metadataPath: sAbsoluteNavigationPath,
        groupLabel: columnInfo.groupLabel,
        group: columnInfo.group,
        label: label,
        tooltip: columnInfo.tooltip,
        typeConfig: oTypeConfig,
        visible: columnInfo.availability !== "Hidden" && !isComplexType,
        exportSettings: this._setPropertyInfoExportSettings(columnInfo.exportSettings, columnInfo),
        unit: columnInfo.unit
      };

      // Set visualSettings only if it exists
      if (columnInfo.visualSettings && Object.keys(columnInfo.visualSettings).length > 0) {
        propertyInfo.visualSettings = columnInfo.visualSettings;
      }
      if (columnInfo.exportDataPointTargetValue) {
        propertyInfo.exportDataPointTargetValue = columnInfo.exportDataPointTargetValue;
      }

      // MDC expects  'propertyInfos' only for complex properties.
      // An empty array throws validation error and undefined value is unhandled.
      if ((_columnInfo$propertyI = columnInfo.propertyInfos) !== null && _columnInfo$propertyI !== void 0 && _columnInfo$propertyI.length) {
        propertyInfo.propertyInfos = columnInfo.propertyInfos;
        //only in case of complex properties, wrap the cell content	on the excel exported file
        if (propertyInfo.exportSettings) {
          var _columnInfo$exportSet;
          propertyInfo.exportSettings.wrap = (_columnInfo$exportSet = columnInfo.exportSettings) === null || _columnInfo$exportSet === void 0 ? void 0 : _columnInfo$exportSet.wrap;
        }
      } else {
        var _extension;
        // Add properties which are supported only by simple PropertyInfos.
        propertyInfo.path = columnInfo.relativePath;
        // TODO with the new complex property info, a lot of "Description" fields are added as filter/sort fields
        propertyInfo.sortable = columnInfo.sortable;
        if (bIsAnalyticalTable) {
          this._updateAnalyticalPropertyInfoAttributes(propertyInfo, columnInfo);
        }
        propertyInfo.filterable = !!bFilterable && this._isFilterableNavigationProperty(columnInfo, metaModel, table) && (
        // TODO ignoring all properties that are not also available for adaptation for now, but proper concept required
        !bIsAnalyticalTable || !aAggregatedPropertyMapUnfilterable[propertyInfo.name] && !((_extension = columnInfo.extension) !== null && _extension !== void 0 && _extension.technicallyGroupable));
        propertyInfo.key = columnInfo.isKey;
        propertyInfo.groupable = columnInfo.isGroupable;
        if (columnInfo.textArrangement) {
          const descriptionColumn = this.getColumnsFor(table).find(function (oCol) {
            var _columnInfo$textArran;
            return oCol.name === ((_columnInfo$textArran = columnInfo.textArrangement) === null || _columnInfo$textArran === void 0 ? void 0 : _columnInfo$textArran.textProperty);
          });
          if (descriptionColumn) {
            propertyInfo.mode = columnInfo.textArrangement.mode;
            propertyInfo.valueProperty = columnInfo.relativePath;
            propertyInfo.descriptionProperty = descriptionColumn.relativePath;
          }
        }
        propertyInfo.text = columnInfo.textArrangement && columnInfo.textArrangement.textProperty;
        propertyInfo.caseSensitive = columnInfo.caseSensitive;
        if (columnInfo.additionalLabels) {
          propertyInfo.additionalLabels = columnInfo.additionalLabels.map(additionalLabel => {
            return getLocalizedText(additionalLabel, appComponent || table);
          });
        }
      }
      this._computeVisualSettingsForPropertyWithUnit(table, propertyInfo, columnInfo.unit, columnInfo.unitText, columnInfo.timezoneText);
      return propertyInfo;
    },
    /**
     * Extend the export settings based on the column info.
     *
     * @param exportSettings The export settings to be extended
     * @param columnInfo The columnInfo object
     * @returns The extended export settings
     */
    _setPropertyInfoExportSettings: function (exportSettings, columnInfo) {
      var _columnInfo$typeConfi3;
      const exportFormat = this._getExportFormat((_columnInfo$typeConfi3 = columnInfo.typeConfig) === null || _columnInfo$typeConfi3 === void 0 ? void 0 : _columnInfo$typeConfi3.className);
      if (exportSettings) {
        if (exportFormat && !exportSettings.timezoneProperty) {
          exportSettings.format = exportFormat;
        }
        // Set the exportSettings template only if it exists.
        if (exportSettings.template) {
          var _columnInfo$exportSet2;
          exportSettings.template = (_columnInfo$exportSet2 = columnInfo.exportSettings) === null || _columnInfo$exportSet2 === void 0 ? void 0 : _columnInfo$exportSet2.template;
        }
      }
      return exportSettings;
    },
    _updateAnalyticalPropertyInfoAttributes(propertyInfo, columnInfo) {
      if (columnInfo.aggregatable) {
        propertyInfo.aggregatable = columnInfo.aggregatable;
      }
      if (columnInfo.extension) {
        propertyInfo.extension = columnInfo.extension;
      }
    },
    _fetchCustomPropertyInfo: function (columnInfo, table, appComponent) {
      let sLabel = "";
      if (columnInfo.header) {
        if (columnInfo.header.startsWith("{metaModel>")) {
          const metaModelPath = columnInfo.header.substring(11, columnInfo.header.length - 1);
          sLabel = table.getModel().getMetaModel().getObject(metaModelPath);
        } else {
          sLabel = getLocalizedText(columnInfo.header, appComponent || table); // Todo: To be removed once MDC provides translation support
        }
      }

      const propertyInfo = {
        name: columnInfo.name,
        groupLabel: undefined,
        group: undefined,
        label: sLabel.toString(),
        type: "Edm.String",
        // TBD
        visible: columnInfo.availability !== "Hidden",
        exportSettings: columnInfo.exportSettings,
        visualSettings: columnInfo.visualSettings
      };

      // MDC expects 'propertyInfos' only for complex properties.
      // An empty array throws validation error and undefined value is unhandled.
      if (columnInfo.propertyInfos && columnInfo.propertyInfos.length) {
        var _columnInfo$exportSet3, _columnInfo$exportSet4;
        propertyInfo.propertyInfos = columnInfo.propertyInfos;
        //only in case of complex properties, wrap the cell content on the excel exported file
        propertyInfo.exportSettings = {
          wrap: (_columnInfo$exportSet3 = columnInfo.exportSettings) === null || _columnInfo$exportSet3 === void 0 ? void 0 : _columnInfo$exportSet3.wrap,
          template: (_columnInfo$exportSet4 = columnInfo.exportSettings) === null || _columnInfo$exportSet4 === void 0 ? void 0 : _columnInfo$exportSet4.template
        };
      } else {
        // Add properties which are supported only by simple PropertyInfos.
        propertyInfo.path = columnInfo.name;
        propertyInfo.sortable = false;
        propertyInfo.filterable = false;
      }
      return propertyInfo;
    },
    _bColumnHasPropertyWithDraftIndicator: function (oColumnInfo) {
      return !!(oColumnInfo.formatOptions && oColumnInfo.formatOptions.hasDraftIndicator || oColumnInfo.formatOptions && oColumnInfo.formatOptions.fieldGroupDraftIndicatorPropertyPath);
    },
    _updateDraftIndicatorModel: function (_oTable, _oColumnInfo) {
      const aVisibleColumns = _oTable.getColumns();
      const oInternalBindingContext = _oTable.getBindingContext("internal");
      const sInternalPath = oInternalBindingContext && oInternalBindingContext.getPath();
      if (aVisibleColumns && oInternalBindingContext) {
        for (const index in aVisibleColumns) {
          if (this._bColumnHasPropertyWithDraftIndicator(_oColumnInfo) && _oColumnInfo.name === aVisibleColumns[index].getDataProperty()) {
            if (oInternalBindingContext.getProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR) === undefined) {
              oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, _oColumnInfo.name);
              break;
            }
          }
        }
      }
    },
    _fetchPropertiesForEntity: function (oTable, sEntityTypePath, oMetaModel, oAppComponent) {
      // when fetching properties, this binding context is needed - so lets create it only once and use if for all properties/data-fields/line-items
      const sBindingPath = ModelHelper.getEntitySetPath(sEntityTypePath);
      let aFetchedProperties = [];
      const oFR = CommonUtils.getFilterRestrictionsByPath(sBindingPath, oMetaModel);
      const aNonFilterableProps = oFR.NonFilterableProperties;
      return Promise.resolve(this.getColumnsFor(oTable)).then(aColumns => {
        // DraftAdministrativeData does not work via 'entitySet/$NavigationPropertyBinding/DraftAdministrativeData'
        if (aColumns) {
          let oPropertyInfo;
          aColumns.forEach(oColumnInfo => {
            this._updateDraftIndicatorModel(oTable, oColumnInfo);
            switch (oColumnInfo.type) {
              case "Annotation":
                oPropertyInfo = this._fetchPropertyInfo(oMetaModel, oColumnInfo, oTable, oAppComponent);
                if (oPropertyInfo && aNonFilterableProps.indexOf(oPropertyInfo.name) === -1) {
                  oPropertyInfo.maxConditions = DelegateUtil.isMultiValue(oPropertyInfo) ? -1 : 1;
                }
                break;
              case "Slot":
              case "Default":
                oPropertyInfo = this._fetchCustomPropertyInfo(oColumnInfo, oTable, oAppComponent);
                break;
              default:
                throw new Error(`unhandled switch case ${oColumnInfo.type}`);
            }
            aFetchedProperties.push(oPropertyInfo);
          });
        }
      }).then(() => {
        aFetchedProperties = this._updatePropertyInfo(oTable, aFetchedProperties);
      }).catch(function (err) {
        Log.error(`An error occurs while updating fetched properties: ${err}`);
      }).then(function () {
        return aFetchedProperties;
      });
    },
    _getCachedOrFetchPropertiesForEntity: function (table, entityTypePath, metaModel, appComponent) {
      const fetchedProperties = DelegateUtil.getCachedProperties(table);
      if (fetchedProperties) {
        return Promise.resolve(fetchedProperties);
      }
      return this._fetchPropertiesForEntity(table, entityTypePath, metaModel, appComponent).then(function (subFetchedProperties) {
        DelegateUtil.setCachedProperties(table, subFetchedProperties);
        return subFetchedProperties;
      });
    },
    _setTableNoDataText: function (oTable, oBindingInfo) {
      let sNoDataKey = "";
      const oTableFilterInfo = TableUtils.getAllFilterInfo(oTable),
        suffixResourceKey = oBindingInfo.path.startsWith("/") ? oBindingInfo.path.substr(1) : oBindingInfo.path;
      const _getNoDataTextWithFilters = function () {
        if (oTable.data("hiddenFilters") || oTable.getQuickFilter()) {
          return "M_TABLE_AND_CHART_NO_DATA_TEXT_MULTI_VIEW";
        } else {
          return "T_TABLE_AND_CHART_NO_DATA_TEXT_WITH_FILTER";
        }
      };
      const sFilterAssociation = oTable.getFilter();
      if (sFilterAssociation && !/BasicSearch$/.test(sFilterAssociation)) {
        // check if a FilterBar is associated to the Table (basic search on toolBar is excluded)
        if (oTableFilterInfo.search || oTableFilterInfo.filters && oTableFilterInfo.filters.length) {
          // check if table has any Filterbar filters or personalization filters
          sNoDataKey = _getNoDataTextWithFilters();
        } else {
          sNoDataKey = "T_TABLE_AND_CHART_NO_DATA_TEXT";
        }
      } else if (oTableFilterInfo.search || oTableFilterInfo.filters && oTableFilterInfo.filters.length) {
        //check if table has any personalization filters
        sNoDataKey = _getNoDataTextWithFilters();
      } else {
        sNoDataKey = "M_TABLE_AND_CHART_NO_FILTERS_NO_DATA_TEXT";
      }
      oTable.setNoData(getResourceModel(oTable).getText(sNoDataKey, undefined, suffixResourceKey));
    },
    handleTableDataReceived: function (oTable, oInternalModelContext) {
      const oBinding = oTable && oTable.getRowBinding(),
        bDataReceivedAttached = oInternalModelContext && oInternalModelContext.getProperty("dataReceivedAttached");
      if (oInternalModelContext && !bDataReceivedAttached) {
        oBinding.attachDataReceived(function () {
          // Refresh the selected contexts to trigger re-calculation of enabled state of actions.
          oInternalModelContext.setProperty("selectedContexts", []);
          const aSelectedContexts = oTable.getSelectedContexts();
          oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
          oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
          const oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap")));
          ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
          // Refresh enablement of delete button
          DeleteHelper.updateDeleteInfoForSelectedContexts(oInternalModelContext, aSelectedContexts);
          const oTableAPI = oTable ? oTable.getParent() : null;
          if (oTableAPI) {
            oTableAPI.setUpEmptyRows(oTable);
          }
        });
        oInternalModelContext.setProperty("dataReceivedAttached", true);
      }
    },
    rebind: function (oTable, oBindingInfo) {
      const oTableAPI = oTable.getParent();
      const bIsSuspended = oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.getProperty("bindingSuspended");
      oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.setProperty("outDatedBinding", bIsSuspended);
      if (!bIsSuspended) {
        TableUtils.clearSelection(oTable);
        TableDelegateBase.rebind.apply(this, [oTable, oBindingInfo]);
        TableUtils.onTableBound(oTable);
        this._setTableNoDataText(oTable, oBindingInfo);
        return TableUtils.whenBound(oTable).then(this.handleTableDataReceived(oTable, oTable.getBindingContext("internal"))).catch(function (oError) {
          Log.error("Error while waiting for the table to be bound", oError);
        });
      }
      return Promise.resolve();
    },
    /**
     * Fetches the relevant metadata for the table and returns property info array.
     *
     * @param table Instance of the MDCtable
     * @returns Array of property info
     */
    fetchProperties: function (table) {
      return DelegateUtil.fetchModel(table).then(model => {
        return this._getCachedOrFetchPropertiesForEntity(table, DelegateUtil.getCustomData(table, "entityType"), model.getMetaModel());
      }).then(properties => {
        table.getBindingContext("internal").setProperty("tablePropertiesAvailable", true);
        return properties;
      });
    },
    preInit: function (oTable) {
      return TableDelegateBase.preInit.apply(this, [oTable]).then(function () {
        /**
         * Set the binding context to null for every fast creation row to avoid it inheriting
         * the wrong context and requesting the table columns on the parent entity
         * Set the correct binding context in ObjectPageController.enableFastCreationRow()
         */
        const oFastCreationRow = oTable.getCreationRow();
        if (oFastCreationRow) {
          oFastCreationRow.setBindingContext(null);
        }
      });
    },
    updateBindingInfo: function (oTable, oBindingInfo) {
      var _oTable$getCreationRo;
      TableDelegateBase.updateBindingInfo.apply(this, [oTable, oBindingInfo]);
      this._internalUpdateBindingInfo(oTable, oBindingInfo);
      this._setTableNoDataText(oTable, oBindingInfo);
      /**
       * We have to set the binding context to null for every fast creation row to avoid it inheriting
       * the wrong context and requesting the table columns on the parent entity
       * The correct binding context is set in ObjectPageController.enableFastCreationRow()
       */
      if (((_oTable$getCreationRo = oTable.getCreationRow()) === null || _oTable$getCreationRo === void 0 ? void 0 : _oTable$getCreationRo.getBindingContext()) === null) {
        TableHelper.enableFastCreationRow(oTable.getCreationRow(), oBindingInfo.path, oTable.getBindingContext(), oTable.getModel(), oTable.getModel("ui").getProperty("/isEditable"));
      }
    },
    _manageSemanticTargets: function (oMDCTable) {
      const oRowBinding = oMDCTable.getRowBinding();
      if (oRowBinding) {
        oRowBinding.attachEventOnce("dataRequested", function () {
          setTimeout(function () {
            const _oView = CommonUtils.getTargetView(oMDCTable);
            if (_oView) {
              TableUtils.getSemanticTargetsFromTable(_oView.getController(), oMDCTable);
            }
          }, 0);
        });
      }
    },
    updateBinding: function (oTable, oBindingInfo, oBinding) {
      const oTableAPI = oTable.getParent();
      const bIsSuspended = oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.getProperty("bindingSuspended");
      if (!bIsSuspended) {
        let bNeedManualRefresh = false;
        const _oView = CommonUtils.getTargetView(oTable);
        const oInternalBindingContext = oTable.getBindingContext("internal");
        const sManualUpdatePropertyKey = "pendingManualBindingUpdate";
        const bPendingManualUpdate = oInternalBindingContext.getProperty(sManualUpdatePropertyKey);
        const oRowBinding = oTable.getRowBinding();
        if (oRowBinding) {
          /**
           * Manual refresh if filters are not changed by binding.refresh() since updating the bindingInfo
           * is not enough to trigger a batch request.
           * Removing columns creates one batch request that was not executed before
           */
          const oldFilters = oRowBinding.getFilters("Application");
          bNeedManualRefresh = deepEqual(oBindingInfo.filters, oldFilters[0]) && oBindingInfo.path === oRowBinding.getPath() &&
          // The path can be changed in case of a parametrized entity
          oRowBinding.getQueryOptionsFromParameters().$search === oBindingInfo.parameters.$search && !bPendingManualUpdate && _oView && _oView.getViewData().converterType === "ListReport";
        }
        TableDelegateBase.updateBinding.apply(this, [oTable, oBindingInfo, oBinding]);
        oTable.fireEvent("bindingUpdated");
        if (bNeedManualRefresh && oTable.getFilter() && oBinding) {
          oRowBinding.requestRefresh(oRowBinding.getGroupId()).finally(function () {
            oInternalBindingContext.setProperty(sManualUpdatePropertyKey, false);
          }).catch(function (oError) {
            Log.error("Error while refreshing the table", oError);
          });
          oInternalBindingContext.setProperty(sManualUpdatePropertyKey, true);
        }
        this._manageSemanticTargets(oTable);
      }
      oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.setProperty("outDatedBinding", bIsSuspended);
    },
    _computeRowBindingInfoFromTemplate: function (oTable) {
      // We need to deepClone the info we get from the custom data, otherwise some of its subobjects (e.g. parameters) will
      // be shared with oBindingInfo and modified later (Object.assign only does a shallow clone)
      const rowBindingInfo = deepClone(DelegateUtil.getCustomData(oTable, "rowsBindingInfo"));
      // if the rowBindingInfo has a $$getKeepAliveContext parameter we need to check it is the only Table with such a
      // parameter for the collectionMetaPath
      if (rowBindingInfo.parameters.$$getKeepAliveContext) {
        const collectionPath = DelegateUtil.getCustomData(oTable, "targetCollectionPath");
        const internalModel = oTable.getModel("internal");
        const keptAliveLists = internalModel.getObject("/keptAliveLists") || {};
        if (!keptAliveLists[collectionPath]) {
          keptAliveLists[collectionPath] = oTable.getId();
          internalModel.setProperty("/keptAliveLists", keptAliveLists);
        } else if (keptAliveLists[collectionPath] !== oTable.getId()) {
          delete rowBindingInfo.parameters.$$getKeepAliveContext;
        }
      }
      return rowBindingInfo;
    },
    _internalUpdateBindingInfo: function (oTable, oBindingInfo) {
      const oInternalModelContext = oTable.getBindingContext("internal");
      Object.assign(oBindingInfo, this._computeRowBindingInfoFromTemplate(oTable));
      /**
       * Binding info might be suspended at the beginning when the first bindRows is called:
       * To avoid duplicate requests but still have a binding to create new entries.				 *
       * After the initial binding step, follow up bindings should no longer be suspended.
       */
      if (oTable.getRowBinding()) {
        oBindingInfo.suspended = false;
      }
      // The previously added handler for the event 'dataReceived' is not anymore there
      // since the bindingInfo is recreated from scratch so we need to set the flag to false in order
      // to again add the handler on this event if needed
      if (oInternalModelContext) {
        oInternalModelContext.setProperty("dataReceivedAttached", false);
      }
      let oFilter;
      const oFilterInfo = TableUtils.getAllFilterInfo(oTable);
      // Prepare binding info with filter/search parameters
      if (oFilterInfo.filters.length > 0) {
        oFilter = new Filter({
          filters: oFilterInfo.filters,
          and: true
        });
      }
      if (oFilterInfo.bindingPath) {
        oBindingInfo.path = oFilterInfo.bindingPath;
      }
      const oDataStateIndicator = oTable.getDataStateIndicator();
      if (oDataStateIndicator && oDataStateIndicator.isFiltering()) {
        // Include filters on messageStrip
        if (oBindingInfo.filters.length > 0) {
          oFilter = new Filter({
            filters: oBindingInfo.filters.concat(oFilterInfo.filters),
            and: true
          });
          this.updateBindingInfoWithSearchQuery(oBindingInfo, oFilterInfo, oFilter);
        }
      } else {
        this.updateBindingInfoWithSearchQuery(oBindingInfo, oFilterInfo, oFilter);
      }
    },
    updateBindingInfoWithSearchQuery: function (bindingInfo, filterInfo, filter) {
      bindingInfo.filters = filter;
      if (filterInfo.search) {
        bindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(filterInfo.search);
      } else {
        bindingInfo.parameters.$search = undefined;
      }
    },
    _templateCustomColumnFragment: function (oColumnInfo, oView, oModifier, sTableId) {
      const oColumnModel = new JSONModel(oColumnInfo),
        oThis = new JSONModel({
          id: sTableId
        }),
        oPreprocessorSettings = {
          bindingContexts: {
            this: oThis.createBindingContext("/"),
            column: oColumnModel.createBindingContext("/")
          },
          models: {
            this: oThis,
            column: oColumnModel
          }
        };
      return DelegateUtil.templateControlFragment("sap.fe.macros.table.CustomColumn", oPreprocessorSettings, {
        view: oView
      }, oModifier).then(function (oItem) {
        oColumnModel.destroy();
        return oItem;
      });
    },
    _templateSlotColumnFragment: async function (oColumnInfo, oView, oModifier, sTableId) {
      const oColumnModel = new JSONModel(oColumnInfo),
        oThis = new JSONModel({
          id: sTableId
        }),
        oPreprocessorSettings = {
          bindingContexts: {
            this: oThis.createBindingContext("/"),
            column: oColumnModel.createBindingContext("/")
          },
          models: {
            this: oThis,
            column: oColumnModel
          }
        };
      const slotColumnsXML = await DelegateUtil.templateControlFragment("sap.fe.macros.table.SlotColumn", oPreprocessorSettings, {
        isXML: true
      });
      if (!slotColumnsXML) {
        return Promise.resolve(null);
      }
      const slotXML = slotColumnsXML.getElementsByTagName("slot")[0],
        mdcTableTemplateXML = slotColumnsXML.getElementsByTagName("mdcTable:template")[0];
      mdcTableTemplateXML.removeChild(slotXML);
      if (oColumnInfo.template) {
        const oTemplate = new DOMParser().parseFromString(oColumnInfo.template, "text/xml");
        mdcTableTemplateXML.appendChild(oTemplate.firstElementChild);
      } else {
        Log.error(`Please provide content inside this Building Block Column: ${oColumnInfo.header}`);
        return Promise.resolve(null);
      }
      if (oModifier.targets !== "jsControlTree") {
        return slotColumnsXML;
      }
      return Fragment.load({
        type: "XML",
        definition: slotColumnsXML
      });
    },
    _getExportFormat: function (dataType) {
      switch (dataType) {
        case "Edm.Date":
          return ExcelFormat.getExcelDatefromJSDate();
        case "Edm.DateTimeOffset":
          return ExcelFormat.getExcelDateTimefromJSDateTime();
        case "Edm.TimeOfDay":
          return ExcelFormat.getExcelTimefromJSTime();
        default:
          return undefined;
      }
    },
    _getVHRelevantFields: function (oMetaModel, sMetadataPath, sBindingPath) {
      let aFields = [],
        oDataFieldData = oMetaModel.getObject(sMetadataPath);
      if (oDataFieldData.$kind && oDataFieldData.$kind === "Property") {
        oDataFieldData = oMetaModel.getObject(`${sMetadataPath}@com.sap.vocabularies.UI.v1.DataFieldDefault`);
        sMetadataPath = `${sMetadataPath}@com.sap.vocabularies.UI.v1.DataFieldDefault`;
      }
      switch (oDataFieldData.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          if (oMetaModel.getObject(`${sMetadataPath}/Target/$AnnotationPath`).includes("com.sap.vocabularies.UI.v1.FieldGroup")) {
            oMetaModel.getObject(`${sMetadataPath}/Target/$AnnotationPath/Data`).forEach((oValue, iIndex) => {
              aFields = aFields.concat(this._getVHRelevantFields(oMetaModel, `${sMetadataPath}/Target/$AnnotationPath/Data/${iIndex}`));
            });
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          aFields.push(oMetaModel.getObject(`${sMetadataPath}/Value/$Path`));
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          break;
        default:
          // property
          // temporary workaround to make sure VH relevant field path do not contain the bindingpath
          if (sMetadataPath.indexOf(sBindingPath) === 0) {
            aFields.push(sMetadataPath.substring(sBindingPath.length + 1));
            break;
          }
          aFields.push(CommonHelper.getNavigationPath(sMetadataPath, true));
          break;
      }
      return aFields;
    },
    _setDraftIndicatorOnVisibleColumn: function (oTable, aColumns, oColumnInfo) {
      const oInternalBindingContext = oTable.getBindingContext("internal");
      if (!oInternalBindingContext) {
        return;
      }
      const sInternalPath = oInternalBindingContext.getPath();
      const aColumnsWithDraftIndicator = aColumns.filter(oColumn => {
        return this._bColumnHasPropertyWithDraftIndicator(oColumn);
      });
      const aVisibleColumns = oTable.getColumns();
      let sAddVisibleColumnName, sVisibleColumnName, bFoundColumnVisibleWithDraft, sColumnNameWithDraftIndicator;
      for (const i in aVisibleColumns) {
        sVisibleColumnName = aVisibleColumns[i].getDataProperty();
        for (const j in aColumnsWithDraftIndicator) {
          sColumnNameWithDraftIndicator = aColumnsWithDraftIndicator[j].name;
          if (sVisibleColumnName === sColumnNameWithDraftIndicator) {
            bFoundColumnVisibleWithDraft = true;
            break;
          }
          if (oColumnInfo && oColumnInfo.name === sColumnNameWithDraftIndicator) {
            sAddVisibleColumnName = oColumnInfo.name;
          }
        }
        if (bFoundColumnVisibleWithDraft) {
          oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, sVisibleColumnName);
          break;
        }
      }
      if (!bFoundColumnVisibleWithDraft && sAddVisibleColumnName) {
        oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, sAddVisibleColumnName);
      }
    },
    removeItem: function (oTable, oPropertyInfoName, mPropertyBag) {
      let doRemoveItem = true;
      if (!oPropertyInfoName) {
        // 1. Application removed the property from their data model
        // 2. addItem failed before revertData created
        return Promise.resolve(doRemoveItem);
      }
      const oModifier = mPropertyBag.modifier;
      const sDataProperty = oModifier.getProperty(oPropertyInfoName, "dataProperty");
      if (sDataProperty && sDataProperty.indexOf && sDataProperty.indexOf("InlineXML") !== -1) {
        oModifier.insertAggregation(oTable, "dependents", oPropertyInfoName);
        doRemoveItem = false;
      }
      if (oTable.isA && oModifier.targets === "jsControlTree") {
        this._setDraftIndicatorStatus(oModifier, oTable, this.getColumnsFor(oTable));
      }
      return Promise.resolve(doRemoveItem);
    },
    _getMetaModel: function (mPropertyBag) {
      return mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel();
    },
    _setDraftIndicatorStatus: function (oModifier, oTable, aColumns, oColumnInfo) {
      if (oModifier.targets === "jsControlTree") {
        this._setDraftIndicatorOnVisibleColumn(oTable, aColumns, oColumnInfo);
      }
    },
    _getGroupId: function (sRetrievedGroupId) {
      return sRetrievedGroupId || undefined;
    },
    _getDependent: function (oDependent, sPropertyInfoName, sDataProperty) {
      if (sPropertyInfoName === sDataProperty) {
        return oDependent;
      }
      return undefined;
    },
    _fnTemplateValueHelp: function (fnTemplateValueHelp, bValueHelpRequired, bValueHelpExists) {
      if (bValueHelpRequired && !bValueHelpExists) {
        return fnTemplateValueHelp("sap.fe.macros.table.ValueHelp");
      }
      return Promise.resolve();
    },
    _getDisplayMode: function (bDisplayMode) {
      let columnEditMode;
      if (bDisplayMode !== undefined) {
        bDisplayMode = typeof bDisplayMode === "boolean" ? bDisplayMode : bDisplayMode === "true";
        columnEditMode = bDisplayMode ? "Display" : "Editable";
        return {
          displaymode: bDisplayMode,
          columnEditMode: columnEditMode
        };
      }
      return {
        displaymode: undefined,
        columnEditMode: undefined
      };
    },
    _insertAggregation: function (oValueHelp, oModifier, oTable) {
      if (oValueHelp) {
        return oModifier.insertAggregation(oTable, "dependents", oValueHelp, 0);
      }
      return undefined;
    },
    /**
     * Invoked when a column is added using the table personalization dialog.
     *
     * @param sPropertyInfoName Name of the property for which the column is added
     * @param oTable Instance of table control
     * @param mPropertyBag Instance of property bag from the flexibility API
     * @returns Once resolved, a table column definition is returned
     */
    addItem: async function (oTable, sPropertyInfoName, mPropertyBag) {
      const oMetaModel = this._getMetaModel(mPropertyBag),
        oModifier = mPropertyBag.modifier,
        sTableId = oModifier.getId(oTable),
        aColumns = oTable.isA ? this.getColumnsFor(oTable) : null;
      if (!aColumns) {
        return Promise.resolve(null);
      }
      const oColumnInfo = aColumns.find(function (oColumn) {
        return oColumn.name === sPropertyInfoName;
      });
      if (!oColumnInfo) {
        Log.error(`${sPropertyInfoName} not found while adding column`);
        return Promise.resolve(null);
      }
      this._setDraftIndicatorStatus(oModifier, oTable, aColumns, oColumnInfo);
      // render custom column
      if (oColumnInfo.type === "Default") {
        return this._templateCustomColumnFragment(oColumnInfo, mPropertyBag.view, oModifier, sTableId);
      }
      if (oColumnInfo.type === "Slot") {
        return this._templateSlotColumnFragment(oColumnInfo, mPropertyBag.view, oModifier, sTableId);
      }
      // fall-back
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      const sPath = await DelegateUtil.getCustomData(oTable, "metaPath", oModifier);
      const sEntityTypePath = await DelegateUtil.getCustomData(oTable, "entityType", oModifier);
      const sRetrievedGroupId = await DelegateUtil.getCustomData(oTable, "requestGroupId", oModifier);
      const sGroupId = this._getGroupId(sRetrievedGroupId);
      const oTableContext = oMetaModel.createBindingContext(sPath);
      const aFetchedProperties = await this._getCachedOrFetchPropertiesForEntity(oTable, sEntityTypePath, oMetaModel, mPropertyBag.appComponent);
      const oPropertyInfo = aFetchedProperties.find(function (oInfo) {
        return oInfo.name === sPropertyInfoName;
      });
      const oPropertyContext = oMetaModel.createBindingContext(oPropertyInfo.metadataPath);
      const aVHProperties = this._getVHRelevantFields(oMetaModel, oPropertyInfo.metadataPath, sPath);
      const oParameters = {
        sBindingPath: sPath,
        sValueHelpType: "TableValueHelp",
        oControl: oTable,
        oMetaModel,
        oModifier,
        oPropertyInfo
      };
      const fnTemplateValueHelp = async sFragmentName => {
        const oThis = new JSONModel({
            id: sTableId,
            requestGroupId: sGroupId
          }),
          oPreprocessorSettings = {
            bindingContexts: {
              this: oThis.createBindingContext("/"),
              dataField: oPropertyContext,
              contextPath: oTableContext
            },
            models: {
              this: oThis,
              dataField: oMetaModel,
              metaModel: oMetaModel,
              contextPath: oMetaModel
            }
          };
        try {
          const oValueHelp = await DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {}, oModifier);
          return await this._insertAggregation(oValueHelp, oModifier, oTable);
        } catch (oError) {
          //We always resolve the promise to ensure that the app does not crash
          Log.error(`ValueHelp not loaded : ${oError.message}`);
          return null;
        } finally {
          oThis.destroy();
        }
      };
      const fnTemplateFragment = (oInPropertyInfo, oView) => {
        const sFragmentName = "sap.fe.macros.table.Column";
        let bDisplayMode;
        let sTableTypeCustomData;
        let sOnChangeCustomData;
        let sCreationModeCustomData;
        return Promise.all([DelegateUtil.getCustomData(oTable, "displayModePropertyBinding", oModifier), DelegateUtil.getCustomData(oTable, "tableType", oModifier), DelegateUtil.getCustomData(oTable, "onChange", oModifier), DelegateUtil.getCustomData(oTable, "creationMode", oModifier)]).then(aCustomData => {
          bDisplayMode = aCustomData[0];
          sTableTypeCustomData = aCustomData[1];
          sOnChangeCustomData = aCustomData[2];
          sCreationModeCustomData = aCustomData[3];
          // Read Only and Column Edit Mode can both have three state
          // Undefined means that the framework decides what to do
          // True / Display means always read only
          // False / Editable means editable but while still respecting the low level principle (immutable property will not be editable)
          const oDisplayModes = this._getDisplayMode(bDisplayMode);
          bDisplayMode = oDisplayModes.displaymode;
          const columnEditMode = oDisplayModes.columnEditMode;
          const oThis = new JSONModel({
              enableAutoColumnWidth: oTable.getParent().enableAutoColumnWidth,
              isOptimizedForSmallDevice: oTable.getParent().isOptimizedForSmallDevice,
              readOnly: bDisplayMode,
              columnEditMode: columnEditMode,
              tableType: sTableTypeCustomData,
              onChange: sOnChangeCustomData,
              id: sTableId,
              navigationPropertyPath: sPropertyInfoName,
              columnInfo: oColumnInfo,
              collection: {
                sPath: sPath,
                oModel: oMetaModel
              },
              creationMode: sCreationModeCustomData
            }),
            oPreprocessorSettings = {
              bindingContexts: {
                entitySet: oTableContext,
                collection: oTableContext,
                dataField: oPropertyContext,
                this: oThis.createBindingContext("/"),
                column: oThis.createBindingContext("/columnInfo")
              },
              models: {
                this: oThis,
                entitySet: oMetaModel,
                collection: oMetaModel,
                dataField: oMetaModel,
                metaModel: oMetaModel,
                column: oThis
              },
              appComponent: mPropertyBag.appComponent
            };
          return DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {
            view: oView
          }, oModifier).finally(function () {
            oThis.destroy();
          });
        });
      };
      await Promise.all(aVHProperties.map(async sPropertyName => {
        const mParameters = Object.assign({}, oParameters, {
          sPropertyName: sPropertyName
        });
        const aResults = await Promise.all([DelegateUtil.isValueHelpRequired(mParameters), DelegateUtil.doesValueHelpExist(mParameters)]);
        const bValueHelpRequired = aResults[0],
          bValueHelpExists = aResults[1];
        return this._fnTemplateValueHelp(fnTemplateValueHelp, bValueHelpRequired, bValueHelpExists);
      }));
      // If view is not provided try to get it by accessing to the parental hierarchy
      // If it doesn't work (table into an unattached OP section) get the view via the AppComponent
      const view = mPropertyBag.view || CommonUtils.getTargetView(oTable) || (mPropertyBag.appComponent ? CommonUtils.getCurrentPageView(mPropertyBag.appComponent) : undefined);
      return fnTemplateFragment(oPropertyInfo, view);
    },
    /**
     * Provide the Table's filter delegate to provide basic filter functionality such as adding FilterFields.
     *
     * @returns Object for the Tables filter personalization.
     */
    getFilterDelegate: function () {
      return Object.assign({
        apiVersion: 2
      }, FilterBarDelegate, {
        addItem: function (oParentControl, sPropertyInfoName) {
          if (sPropertyInfoName.indexOf("Property::") === 0) {
            // Correct the name of complex property info references.
            sPropertyInfoName = sPropertyInfoName.replace("Property::", "");
          }
          return FilterBarDelegate.addItem(oParentControl, sPropertyInfoName);
        }
      });
    },
    /**
     * Returns the TypeUtil attached to this delegate.
     *
     * @returns Any instance of TypeUtil
     */
    getTypeUtil: function /*oPayload: object*/
    () {
      return TypeUtil;
    },
    formatGroupHeader(oTable, oContext, sProperty) {
      var _oFormatInfo$typeConf, _oFormatInfo$typeConf2;
      const mFormatInfos = DelegateUtil.getCachedProperties(oTable),
        oFormatInfo = mFormatInfos && mFormatInfos.filter(obj => {
          return obj.name === sProperty;
        })[0],
        /*For a Date or DateTime property, the value is returned in external format using a UI5 type for the
              given property path that formats corresponding to the property's EDM type and constraints*/
        bExternalFormat = (oFormatInfo === null || oFormatInfo === void 0 ? void 0 : (_oFormatInfo$typeConf = oFormatInfo.typeConfig) === null || _oFormatInfo$typeConf === void 0 ? void 0 : _oFormatInfo$typeConf.baseType) === "DateTime" || (oFormatInfo === null || oFormatInfo === void 0 ? void 0 : (_oFormatInfo$typeConf2 = oFormatInfo.typeConfig) === null || _oFormatInfo$typeConf2 === void 0 ? void 0 : _oFormatInfo$typeConf2.baseType) === "Date";
      let sValue;
      if (oFormatInfo && oFormatInfo.mode) {
        switch (oFormatInfo.mode) {
          case "Description":
            sValue = oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat);
            break;
          case "DescriptionValue":
            sValue = ValueFormatter.formatWithBrackets(oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat), oContext.getProperty(oFormatInfo.valueProperty, bExternalFormat));
            break;
          case "ValueDescription":
            sValue = ValueFormatter.formatWithBrackets(oContext.getProperty(oFormatInfo.valueProperty, bExternalFormat), oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat));
            break;
          default:
            break;
        }
      } else {
        sValue = oContext.getProperty(oFormatInfo === null || oFormatInfo === void 0 ? void 0 : oFormatInfo.path, bExternalFormat);
      }
      return getResourceModel(oTable).getText("M_TABLE_GROUP_HEADER_TITLE", [oFormatInfo === null || oFormatInfo === void 0 ? void 0 : oFormatInfo.label, sValue]);
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IiLCJPYmplY3QiLCJhc3NpZ24iLCJUYWJsZURlbGVnYXRlQmFzZSIsImFwaVZlcnNpb24iLCJfY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yRmllbGRHcm91cCIsIm9UYWJsZSIsIm9Qcm9wZXJ0eSIsImFQcm9wZXJ0aWVzIiwibmFtZSIsImluZGV4T2YiLCJvQ29sdW1uIiwiZ2V0Q29sdW1ucyIsImZpbmQiLCJvQ29sIiwiZ2V0RGF0YVByb3BlcnR5IiwiYlNob3dEYXRhRmllbGRzTGFiZWwiLCJkYXRhIiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiaW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiZ2V0Q29udGV4dCIsIm1ldGFkYXRhUGF0aCIsImNvbnZlcnRlZE1ldGFEYXRhIiwiY29udmVydGVkVHlwZXMiLCJvRGF0YUZpZWxkIiwidGFyZ2V0T2JqZWN0Iiwib0ZpZWxkR3JvdXAiLCJUYXJnZXQiLCIkdGFyZ2V0IiwiYUZpZWxkV2lkdGgiLCJEYXRhIiwiZm9yRWFjaCIsIm9EYXRhIiwib0RhdGFGaWVsZFdpZHRoIiwiJFR5cGUiLCJUYWJsZVNpemVIZWxwZXIiLCJnZXRXaWR0aEZvckRhdGFGaWVsZEZvckFubm90YXRpb24iLCJnZXRXaWR0aEZvckRhdGFGaWVsZCIsImxhYmVsV2lkdGgiLCJwcm9wZXJ0eVdpZHRoIiwiU2l6ZUhlbHBlciIsImdldEJ1dHRvbldpZHRoIiwiTGFiZWwiLCJwdXNoIiwibldpZGVzdCIsInJlZHVjZSIsImFjYyIsInZhbHVlIiwiTWF0aCIsIm1heCIsInZpc3VhbFNldHRpbmdzIiwiZGVlcEV4dGVuZCIsIndpZHRoQ2FsY3VsYXRpb24iLCJ2ZXJ0aWNhbEFycmFuZ2VtZW50IiwibWluV2lkdGgiLCJjZWlsIiwiX2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFZhbHVlSGVscCIsInRhYmxlIiwicHJvcGVydHkiLCJ0YWJsZUFQSSIsImdldFBhcmVudCIsInByb3BlcnR5SW5mb3MiLCJtZXRhTW9kZWwiLCJkYXRhRmllbGQiLCJnZXRPYmplY3QiLCJnYXAiLCJnZXRQcm9wZXJ0eSIsIl9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JQcm9wZXJ0eVdpdGhVbml0Iiwib1VuaXQiLCJvVW5pdFRleHQiLCJvVGltZXpvbmVUZXh0Iiwib1RhYmxlQVBJIiwic1VuaXRUZXh0IiwiZ2V0UmVhZE9ubHkiLCJfY29tcHV0ZUxhYmVsIiwibGFiZWxNYXAiLCJsYWJlbCIsInByb3BlcnRpZXNXaXRoU2FtZUxhYmVsIiwibGVuZ3RoIiwicGF0aCIsImluY2x1ZGVzIiwiYWRkaXRpb25hbExhYmVscyIsImpvaW4iLCJfdXBkYXRlUHJvcGVydHlJbmZvIiwicHJvcGVydGllcyIsInAxM25Nb2RlIiwiZ2V0UDEzbk1vZGUiLCJzb3J0YWJsZSIsImZpbHRlcmFibGUiLCJncm91cGFibGUiLCJ1bmRlZmluZWQiLCJjb25jYXQiLCJ0eXBlQ29uZmlnIiwiZ2V0Q29sdW1uc0ZvciIsImdldFRhYmxlRGVmaW5pdGlvbiIsImNvbHVtbnMiLCJfZ2V0QWdncmVnYXRlZFByb3BlcnR5TWFwIiwiYWdncmVnYXRlcyIsImZldGNoRXhwb3J0Q2FwYWJpbGl0aWVzIiwib0NhcGFiaWxpdGllcyIsIlhMU1giLCJvTW9kZWwiLCJEZWxlZ2F0ZVV0aWwiLCJmZXRjaE1vZGVsIiwidGhlbiIsIm1vZGVsIiwiYVN1cHBvcnRlZEZvcm1hdHMiLCJhTG93ZXJGb3JtYXRzIiwibWFwIiwiZWxlbWVudCIsInRvTG93ZXJDYXNlIiwib0Fubm90YXRpb24iLCJjYXRjaCIsImVyciIsIkxvZyIsImVycm9yIiwiX2lzRmlsdGVyYWJsZU5hdmlnYXRpb25Qcm9wZXJ0eSIsImNvbHVtbkluZm8iLCJ0YWJsZURhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXRDdXN0b21EYXRhIiwiY29sdW1uTmF2aWdhdGlvblByb3BlcnRpZXMiLCJhbm5vdGF0aW9uUGF0aCIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwidGFibGVUYXJnZXRFbnRpdHlJbmRleCIsImZpbmRJbmRleCIsInByb3AiLCJ0YXJnZXRUeXBlIiwidGFyZ2V0RW50aXR5VHlwZSIsInJlbGF0aXZlTmF2aWdhdGlvblByb3BlcnRpZXMiLCJzbGljZSIsInJlbGF0aXZlUGF0aCIsImlzUGFydE9mTGluZUl0ZW0iLCJzb21lIiwiaXNNdWx0aXBsZU5hdmlnYXRpb25Qcm9wZXJ0eSIsIl9mZXRjaFByb3BlcnR5SW5mbyIsImFwcENvbXBvbmVudCIsInNBYnNvbHV0ZU5hdmlnYXRpb25QYXRoIiwib05hdmlnYXRpb25Db250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJvVHlwZUNvbmZpZyIsImNsYXNzTmFtZSIsImlzVHlwZUZpbHRlcmFibGUiLCJUeXBlVXRpbCIsImdldFR5cGVDb25maWciLCJmb3JtYXRPcHRpb25zIiwiY29uc3RyYWludHMiLCJiRmlsdGVyYWJsZSIsIkNvbW1vbkhlbHBlciIsImlzUHJvcGVydHlGaWx0ZXJhYmxlIiwiaXNDb21wbGV4VHlwZSIsImJJc0FuYWx5dGljYWxUYWJsZSIsImFBZ2dyZWdhdGVkUHJvcGVydHlNYXBVbmZpbHRlcmFibGUiLCJnZXRMb2NhbGl6ZWRUZXh0IiwicHJvcGVydHlJbmZvIiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwidG9vbHRpcCIsInZpc2libGUiLCJhdmFpbGFiaWxpdHkiLCJleHBvcnRTZXR0aW5ncyIsIl9zZXRQcm9wZXJ0eUluZm9FeHBvcnRTZXR0aW5ncyIsInVuaXQiLCJrZXlzIiwiZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUiLCJ3cmFwIiwiX3VwZGF0ZUFuYWx5dGljYWxQcm9wZXJ0eUluZm9BdHRyaWJ1dGVzIiwiZXh0ZW5zaW9uIiwidGVjaG5pY2FsbHlHcm91cGFibGUiLCJrZXkiLCJpc0tleSIsImlzR3JvdXBhYmxlIiwidGV4dEFycmFuZ2VtZW50IiwiZGVzY3JpcHRpb25Db2x1bW4iLCJ0ZXh0UHJvcGVydHkiLCJtb2RlIiwidmFsdWVQcm9wZXJ0eSIsImRlc2NyaXB0aW9uUHJvcGVydHkiLCJ0ZXh0IiwiY2FzZVNlbnNpdGl2ZSIsImFkZGl0aW9uYWxMYWJlbCIsInVuaXRUZXh0IiwidGltZXpvbmVUZXh0IiwiZXhwb3J0Rm9ybWF0IiwiX2dldEV4cG9ydEZvcm1hdCIsInRpbWV6b25lUHJvcGVydHkiLCJmb3JtYXQiLCJ0ZW1wbGF0ZSIsImFnZ3JlZ2F0YWJsZSIsIl9mZXRjaEN1c3RvbVByb3BlcnR5SW5mbyIsInNMYWJlbCIsImhlYWRlciIsInN0YXJ0c1dpdGgiLCJtZXRhTW9kZWxQYXRoIiwic3Vic3RyaW5nIiwidG9TdHJpbmciLCJ0eXBlIiwiX2JDb2x1bW5IYXNQcm9wZXJ0eVdpdGhEcmFmdEluZGljYXRvciIsIm9Db2x1bW5JbmZvIiwiaGFzRHJhZnRJbmRpY2F0b3IiLCJmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGgiLCJfdXBkYXRlRHJhZnRJbmRpY2F0b3JNb2RlbCIsIl9vVGFibGUiLCJfb0NvbHVtbkluZm8iLCJhVmlzaWJsZUNvbHVtbnMiLCJvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwic0ludGVybmFsUGF0aCIsImdldFBhdGgiLCJpbmRleCIsInNldFByb3BlcnR5IiwiX2ZldGNoUHJvcGVydGllc0ZvckVudGl0eSIsInNFbnRpdHlUeXBlUGF0aCIsIm9BcHBDb21wb25lbnQiLCJzQmluZGluZ1BhdGgiLCJNb2RlbEhlbHBlciIsImdldEVudGl0eVNldFBhdGgiLCJhRmV0Y2hlZFByb3BlcnRpZXMiLCJvRlIiLCJDb21tb25VdGlscyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aCIsImFOb25GaWx0ZXJhYmxlUHJvcHMiLCJOb25GaWx0ZXJhYmxlUHJvcGVydGllcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiYUNvbHVtbnMiLCJvUHJvcGVydHlJbmZvIiwibWF4Q29uZGl0aW9ucyIsImlzTXVsdGlWYWx1ZSIsIkVycm9yIiwiX2dldENhY2hlZE9yRmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5IiwiZW50aXR5VHlwZVBhdGgiLCJmZXRjaGVkUHJvcGVydGllcyIsImdldENhY2hlZFByb3BlcnRpZXMiLCJzdWJGZXRjaGVkUHJvcGVydGllcyIsInNldENhY2hlZFByb3BlcnRpZXMiLCJfc2V0VGFibGVOb0RhdGFUZXh0Iiwib0JpbmRpbmdJbmZvIiwic05vRGF0YUtleSIsIm9UYWJsZUZpbHRlckluZm8iLCJUYWJsZVV0aWxzIiwiZ2V0QWxsRmlsdGVySW5mbyIsInN1ZmZpeFJlc291cmNlS2V5Iiwic3Vic3RyIiwiX2dldE5vRGF0YVRleHRXaXRoRmlsdGVycyIsImdldFF1aWNrRmlsdGVyIiwic0ZpbHRlckFzc29jaWF0aW9uIiwiZ2V0RmlsdGVyIiwidGVzdCIsInNlYXJjaCIsImZpbHRlcnMiLCJzZXROb0RhdGEiLCJnZXRSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsImhhbmRsZVRhYmxlRGF0YVJlY2VpdmVkIiwib0ludGVybmFsTW9kZWxDb250ZXh0Iiwib0JpbmRpbmciLCJnZXRSb3dCaW5kaW5nIiwiYkRhdGFSZWNlaXZlZEF0dGFjaGVkIiwiYXR0YWNoRGF0YVJlY2VpdmVkIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwib0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsIkpTT04iLCJwYXJzZSIsInBhcnNlQ3VzdG9tRGF0YSIsIkFjdGlvblJ1bnRpbWUiLCJzZXRBY3Rpb25FbmFibGVtZW50IiwiRGVsZXRlSGVscGVyIiwidXBkYXRlRGVsZXRlSW5mb0ZvclNlbGVjdGVkQ29udGV4dHMiLCJzZXRVcEVtcHR5Um93cyIsInJlYmluZCIsImJJc1N1c3BlbmRlZCIsImNsZWFyU2VsZWN0aW9uIiwiYXBwbHkiLCJvblRhYmxlQm91bmQiLCJ3aGVuQm91bmQiLCJvRXJyb3IiLCJmZXRjaFByb3BlcnRpZXMiLCJwcmVJbml0Iiwib0Zhc3RDcmVhdGlvblJvdyIsImdldENyZWF0aW9uUm93Iiwic2V0QmluZGluZ0NvbnRleHQiLCJ1cGRhdGVCaW5kaW5nSW5mbyIsIl9pbnRlcm5hbFVwZGF0ZUJpbmRpbmdJbmZvIiwiVGFibGVIZWxwZXIiLCJlbmFibGVGYXN0Q3JlYXRpb25Sb3ciLCJfbWFuYWdlU2VtYW50aWNUYXJnZXRzIiwib01EQ1RhYmxlIiwib1Jvd0JpbmRpbmciLCJhdHRhY2hFdmVudE9uY2UiLCJzZXRUaW1lb3V0IiwiX29WaWV3IiwiZ2V0VGFyZ2V0VmlldyIsImdldFNlbWFudGljVGFyZ2V0c0Zyb21UYWJsZSIsImdldENvbnRyb2xsZXIiLCJ1cGRhdGVCaW5kaW5nIiwiYk5lZWRNYW51YWxSZWZyZXNoIiwic01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5IiwiYlBlbmRpbmdNYW51YWxVcGRhdGUiLCJvbGRGaWx0ZXJzIiwiZ2V0RmlsdGVycyIsImRlZXBFcXVhbCIsImdldFF1ZXJ5T3B0aW9uc0Zyb21QYXJhbWV0ZXJzIiwiJHNlYXJjaCIsInBhcmFtZXRlcnMiLCJnZXRWaWV3RGF0YSIsImNvbnZlcnRlclR5cGUiLCJmaXJlRXZlbnQiLCJyZXF1ZXN0UmVmcmVzaCIsImdldEdyb3VwSWQiLCJmaW5hbGx5IiwiX2NvbXB1dGVSb3dCaW5kaW5nSW5mb0Zyb21UZW1wbGF0ZSIsInJvd0JpbmRpbmdJbmZvIiwiZGVlcENsb25lIiwiJCRnZXRLZWVwQWxpdmVDb250ZXh0IiwiY29sbGVjdGlvblBhdGgiLCJpbnRlcm5hbE1vZGVsIiwia2VwdEFsaXZlTGlzdHMiLCJnZXRJZCIsInN1c3BlbmRlZCIsIm9GaWx0ZXIiLCJvRmlsdGVySW5mbyIsIkZpbHRlciIsImFuZCIsImJpbmRpbmdQYXRoIiwib0RhdGFTdGF0ZUluZGljYXRvciIsImdldERhdGFTdGF0ZUluZGljYXRvciIsImlzRmlsdGVyaW5nIiwidXBkYXRlQmluZGluZ0luZm9XaXRoU2VhcmNoUXVlcnkiLCJiaW5kaW5nSW5mbyIsImZpbHRlckluZm8iLCJmaWx0ZXIiLCJub3JtYWxpemVTZWFyY2hUZXJtIiwiX3RlbXBsYXRlQ3VzdG9tQ29sdW1uRnJhZ21lbnQiLCJvVmlldyIsIm9Nb2RpZmllciIsInNUYWJsZUlkIiwib0NvbHVtbk1vZGVsIiwiSlNPTk1vZGVsIiwib1RoaXMiLCJpZCIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsImJpbmRpbmdDb250ZXh0cyIsInRoaXMiLCJjb2x1bW4iLCJtb2RlbHMiLCJ0ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudCIsInZpZXciLCJvSXRlbSIsImRlc3Ryb3kiLCJfdGVtcGxhdGVTbG90Q29sdW1uRnJhZ21lbnQiLCJzbG90Q29sdW1uc1hNTCIsImlzWE1MIiwic2xvdFhNTCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibWRjVGFibGVUZW1wbGF0ZVhNTCIsInJlbW92ZUNoaWxkIiwib1RlbXBsYXRlIiwiRE9NUGFyc2VyIiwicGFyc2VGcm9tU3RyaW5nIiwiYXBwZW5kQ2hpbGQiLCJmaXJzdEVsZW1lbnRDaGlsZCIsInRhcmdldHMiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiZGF0YVR5cGUiLCJFeGNlbEZvcm1hdCIsImdldEV4Y2VsRGF0ZWZyb21KU0RhdGUiLCJnZXRFeGNlbERhdGVUaW1lZnJvbUpTRGF0ZVRpbWUiLCJnZXRFeGNlbFRpbWVmcm9tSlNUaW1lIiwiX2dldFZIUmVsZXZhbnRGaWVsZHMiLCJzTWV0YWRhdGFQYXRoIiwiYUZpZWxkcyIsIm9EYXRhRmllbGREYXRhIiwiJGtpbmQiLCJvVmFsdWUiLCJpSW5kZXgiLCJnZXROYXZpZ2F0aW9uUGF0aCIsIl9zZXREcmFmdEluZGljYXRvck9uVmlzaWJsZUNvbHVtbiIsImFDb2x1bW5zV2l0aERyYWZ0SW5kaWNhdG9yIiwic0FkZFZpc2libGVDb2x1bW5OYW1lIiwic1Zpc2libGVDb2x1bW5OYW1lIiwiYkZvdW5kQ29sdW1uVmlzaWJsZVdpdGhEcmFmdCIsInNDb2x1bW5OYW1lV2l0aERyYWZ0SW5kaWNhdG9yIiwiaSIsImoiLCJyZW1vdmVJdGVtIiwib1Byb3BlcnR5SW5mb05hbWUiLCJtUHJvcGVydHlCYWciLCJkb1JlbW92ZUl0ZW0iLCJtb2RpZmllciIsInNEYXRhUHJvcGVydHkiLCJpbnNlcnRBZ2dyZWdhdGlvbiIsImlzQSIsIl9zZXREcmFmdEluZGljYXRvclN0YXR1cyIsIl9nZXRNZXRhTW9kZWwiLCJfZ2V0R3JvdXBJZCIsInNSZXRyaWV2ZWRHcm91cElkIiwiX2dldERlcGVuZGVudCIsIm9EZXBlbmRlbnQiLCJzUHJvcGVydHlJbmZvTmFtZSIsIl9mblRlbXBsYXRlVmFsdWVIZWxwIiwiZm5UZW1wbGF0ZVZhbHVlSGVscCIsImJWYWx1ZUhlbHBSZXF1aXJlZCIsImJWYWx1ZUhlbHBFeGlzdHMiLCJfZ2V0RGlzcGxheU1vZGUiLCJiRGlzcGxheU1vZGUiLCJjb2x1bW5FZGl0TW9kZSIsImRpc3BsYXltb2RlIiwiX2luc2VydEFnZ3JlZ2F0aW9uIiwib1ZhbHVlSGVscCIsImFkZEl0ZW0iLCJzUGF0aCIsInNHcm91cElkIiwib1RhYmxlQ29udGV4dCIsIm9JbmZvIiwib1Byb3BlcnR5Q29udGV4dCIsImFWSFByb3BlcnRpZXMiLCJvUGFyYW1ldGVycyIsInNWYWx1ZUhlbHBUeXBlIiwib0NvbnRyb2wiLCJzRnJhZ21lbnROYW1lIiwicmVxdWVzdEdyb3VwSWQiLCJjb250ZXh0UGF0aCIsIm1lc3NhZ2UiLCJmblRlbXBsYXRlRnJhZ21lbnQiLCJvSW5Qcm9wZXJ0eUluZm8iLCJzVGFibGVUeXBlQ3VzdG9tRGF0YSIsInNPbkNoYW5nZUN1c3RvbURhdGEiLCJzQ3JlYXRpb25Nb2RlQ3VzdG9tRGF0YSIsImFsbCIsImFDdXN0b21EYXRhIiwib0Rpc3BsYXlNb2RlcyIsImVuYWJsZUF1dG9Db2x1bW5XaWR0aCIsImlzT3B0aW1pemVkRm9yU21hbGxEZXZpY2UiLCJyZWFkT25seSIsInRhYmxlVHlwZSIsIm9uQ2hhbmdlIiwibmF2aWdhdGlvblByb3BlcnR5UGF0aCIsImNvbGxlY3Rpb24iLCJjcmVhdGlvbk1vZGUiLCJlbnRpdHlTZXQiLCJzUHJvcGVydHlOYW1lIiwibVBhcmFtZXRlcnMiLCJhUmVzdWx0cyIsImlzVmFsdWVIZWxwUmVxdWlyZWQiLCJkb2VzVmFsdWVIZWxwRXhpc3QiLCJnZXRDdXJyZW50UGFnZVZpZXciLCJnZXRGaWx0ZXJEZWxlZ2F0ZSIsIkZpbHRlckJhckRlbGVnYXRlIiwib1BhcmVudENvbnRyb2wiLCJyZXBsYWNlIiwiZ2V0VHlwZVV0aWwiLCJmb3JtYXRHcm91cEhlYWRlciIsIm9Db250ZXh0Iiwic1Byb3BlcnR5IiwibUZvcm1hdEluZm9zIiwib0Zvcm1hdEluZm8iLCJvYmoiLCJiRXh0ZXJuYWxGb3JtYXQiLCJiYXNlVHlwZSIsInNWYWx1ZSIsIlZhbHVlRm9ybWF0dGVyIiwiZm9ybWF0V2l0aEJyYWNrZXRzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZURlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERhdGFGaWVsZEZvckFubm90YXRpb24sIEZpZWxkR3JvdXBUeXBlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgZGVlcENsb25lIGZyb20gXCJzYXAvYmFzZS91dGlsL2RlZXBDbG9uZVwiO1xuaW1wb3J0IGRlZXBFcXVhbCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwRXF1YWxcIjtcbmltcG9ydCBkZWVwRXh0ZW5kIGZyb20gXCJzYXAvYmFzZS91dGlsL2RlZXBFeHRlbmRcIjtcbmltcG9ydCBBY3Rpb25SdW50aW1lIGZyb20gXCJzYXAvZmUvY29yZS9BY3Rpb25SdW50aW1lXCI7XG5pbXBvcnQgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIHtcblx0QW5ub3RhdGlvblRhYmxlQ29sdW1uLFxuXHRjb2x1bW5FeHBvcnRTZXR0aW5ncyxcblx0Q3VzdG9tQmFzZWRUYWJsZUNvbHVtbixcblx0UHJvcGVydHlUeXBlQ29uZmlnLFxuXHRUYWJsZUNvbHVtbixcblx0VGVjaG5pY2FsQ29sdW1uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgeyBDdXN0b21FbGVtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IFZhbHVlRm9ybWF0dGVyIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1ZhbHVlRm9ybWF0dGVyXCI7XG5pbXBvcnQgRGVsZXRlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0RlbGV0ZUhlbHBlclwiO1xuaW1wb3J0IEV4Y2VsRm9ybWF0IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0V4Y2VsRm9ybWF0SGVscGVyXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdldExvY2FsaXplZFRleHQsIGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgU2l6ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TaXplSGVscGVyXCI7XG5pbXBvcnQgeyBpc011bHRpcGxlTmF2aWdhdGlvblByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgaXNUeXBlRmlsdGVyYWJsZSB9IGZyb20gXCJzYXAvZmUvY29yZS90eXBlL0VETVwiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eUluZm8sIHRhYmxlRGVsZWdhdGVNb2RlbCB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJCYXJEZWxlZ2F0ZSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXJCYXIvRmlsdGVyQmFyRGVsZWdhdGVcIjtcbmltcG9ydCBUYWJsZVNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVTaXplSGVscGVyXCI7XG5pbXBvcnQgVGFibGVVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IEZyYWdtZW50IGZyb20gXCJzYXAvdWkvY29yZS9GcmFnbWVudFwiO1xuaW1wb3J0IFRhYmxlRGVsZWdhdGVCYXNlIGZyb20gXCJzYXAvdWkvbWRjL29kYXRhL3Y0L1RhYmxlRGVsZWdhdGVcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTWV0YU1vZGVsXCI7XG5pbXBvcnQgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIFRhYmxlQVBJIGZyb20gXCIuLi9UYWJsZUFQSVwiO1xuaW1wb3J0IFRhYmxlSGVscGVyIGZyb20gXCIuLi9UYWJsZUhlbHBlclwiO1xuXG5jb25zdCBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IgPSBcIi9zZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yXCI7XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciBzYXAudWkubWRjLlRhYmxlLlxuICogPGgzPjxiPk5vdGU6PC9iPjwvaDM+XG4gKiBUaGUgY2xhc3MgaXMgZXhwZXJpbWVudGFsIGFuZCB0aGUgQVBJIGFuZCB0aGUgYmVoYXZpb3IgYXJlIG5vdCBmaW5hbGl6ZWQuIFRoaXMgY2xhc3MgaXMgbm90IGludGVuZGVkIGZvciBwcm9kdWN0aXZlIHVzYWdlLlxuICpcbiAqIEBhdXRob3IgU0FQIFNFXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNpbmNlIDEuNjkuMFxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVEZWxlZ2F0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBPYmplY3QuYXNzaWduKHt9LCBUYWJsZURlbGVnYXRlQmFzZSwge1xuXHRhcGlWZXJzaW9uOiAyLFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYWxjdWxhdGVzIHRoZSB3aWR0aCBmb3IgYSBGaWVsZEdyb3VwIGNvbHVtbi5cblx0ICogVGhlIHdpZHRoIG9mIHRoZSBGaWVsZEdyb3VwIGlzIHRoZSB3aWR0aCBvZiB0aGUgd2lkZXN0IHByb3BlcnR5IGNvbnRhaW5lZCBpbiB0aGUgRmllbGRHcm91cCAoaW5jbHVkaW5nIHRoZSBsYWJlbCBpZiBzaG93RGF0YUZpZWxkc0xhYmVsIGlzIHRydWUpXG5cdCAqIFRoZSByZXN1bHQgb2YgdGhpcyBjYWxjdWxhdGlvbiBpcyBzdG9yZWQgaW4gdGhlIHZpc3VhbFNldHRpbmdzLndpZHRoQ2FsY3VsYXRpb24ubWluV2lkdGggcHJvcGVydHksIHdoaWNoIGlzIHVzZWQgYnkgdGhlIE1EQ3RhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIHRoZSBNREN0YWJsZVxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IEN1cnJlbnQgcHJvcGVydHlcblx0ICogQHBhcmFtIGFQcm9wZXJ0aWVzIEFycmF5IG9mIHByb3BlcnRpZXNcblx0ICogQHByaXZhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVEZWxlZ2F0ZVxuXHQgKi9cblx0X2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvckZpZWxkR3JvdXA6IGZ1bmN0aW9uIChvVGFibGU6IFRhYmxlLCBvUHJvcGVydHk6IGFueSwgYVByb3BlcnRpZXM6IGFueVtdKSB7XG5cdFx0aWYgKG9Qcm9wZXJ0eS5uYW1lLmluZGV4T2YoXCJEYXRhRmllbGRGb3JBbm5vdGF0aW9uOjpGaWVsZEdyb3VwOjpcIikgPT09IDApIHtcblx0XHRcdGNvbnN0IG9Db2x1bW4gPSBvVGFibGUuZ2V0Q29sdW1ucygpLmZpbmQoZnVuY3Rpb24gKG9Db2w6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbC5nZXREYXRhUHJvcGVydHkoKSA9PT0gb1Byb3BlcnR5Lm5hbWU7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGJTaG93RGF0YUZpZWxkc0xhYmVsID0gb0NvbHVtbiA/IG9Db2x1bW4uZGF0YShcInNob3dEYXRhRmllbGRzTGFiZWxcIikgPT09IFwidHJ1ZVwiIDogZmFsc2U7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gKG9UYWJsZS5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0Y29uc3QgaW52b2x2ZWREYXRhTW9kZWxPYmplY3RzID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9NZXRhTW9kZWwuZ2V0Q29udGV4dChvUHJvcGVydHkubWV0YWRhdGFQYXRoKSk7XG5cdFx0XHRjb25zdCBjb252ZXJ0ZWRNZXRhRGF0YSA9IGludm9sdmVkRGF0YU1vZGVsT2JqZWN0cy5jb252ZXJ0ZWRUeXBlcztcblx0XHRcdGNvbnN0IG9EYXRhRmllbGQgPSBpbnZvbHZlZERhdGFNb2RlbE9iamVjdHMudGFyZ2V0T2JqZWN0IGFzIERhdGFGaWVsZEZvckFubm90YXRpb247XG5cdFx0XHRjb25zdCBvRmllbGRHcm91cCA9IG9EYXRhRmllbGQuVGFyZ2V0LiR0YXJnZXQgYXMgRmllbGRHcm91cFR5cGU7XG5cdFx0XHRjb25zdCBhRmllbGRXaWR0aDogYW55ID0gW107XG5cdFx0XHRvRmllbGRHcm91cC5EYXRhLmZvckVhY2goZnVuY3Rpb24gKG9EYXRhOiBhbnkpIHtcblx0XHRcdFx0bGV0IG9EYXRhRmllbGRXaWR0aDogYW55O1xuXHRcdFx0XHRzd2l0Y2ggKG9EYXRhLiRUeXBlKSB7XG5cdFx0XHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIjpcblx0XHRcdFx0XHRcdG9EYXRhRmllbGRXaWR0aCA9IFRhYmxlU2l6ZUhlbHBlci5nZXRXaWR0aEZvckRhdGFGaWVsZEZvckFubm90YXRpb24oXG5cdFx0XHRcdFx0XHRcdG9EYXRhLFxuXHRcdFx0XHRcdFx0XHRhUHJvcGVydGllcyxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVkTWV0YURhdGEsXG5cdFx0XHRcdFx0XHRcdGJTaG93RGF0YUZpZWxkc0xhYmVsXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiOlxuXHRcdFx0XHRcdFx0b0RhdGFGaWVsZFdpZHRoID0gVGFibGVTaXplSGVscGVyLmdldFdpZHRoRm9yRGF0YUZpZWxkKG9EYXRhLCBiU2hvd0RhdGFGaWVsZHNMYWJlbCwgYVByb3BlcnRpZXMsIGNvbnZlcnRlZE1ldGFEYXRhKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIjpcblx0XHRcdFx0XHRcdG9EYXRhRmllbGRXaWR0aCA9IHtcblx0XHRcdFx0XHRcdFx0bGFiZWxXaWR0aDogMCxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHlXaWR0aDogU2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aChvRGF0YS5MYWJlbClcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvRGF0YUZpZWxkV2lkdGgpIHtcblx0XHRcdFx0XHRhRmllbGRXaWR0aC5wdXNoKG9EYXRhRmllbGRXaWR0aC5sYWJlbFdpZHRoICsgb0RhdGFGaWVsZFdpZHRoLnByb3BlcnR5V2lkdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG5XaWRlc3QgPSBhRmllbGRXaWR0aC5yZWR1Y2UoZnVuY3Rpb24gKGFjYzogYW55LCB2YWx1ZTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBNYXRoLm1heChhY2MsIHZhbHVlKTtcblx0XHRcdH0sIDApO1xuXHRcdFx0b1Byb3BlcnR5LnZpc3VhbFNldHRpbmdzID0gZGVlcEV4dGVuZChvUHJvcGVydHkudmlzdWFsU2V0dGluZ3MsIHtcblx0XHRcdFx0d2lkdGhDYWxjdWxhdGlvbjoge1xuXHRcdFx0XHRcdHZlcnRpY2FsQXJyYW5nZW1lbnQ6IHRydWUsXG5cdFx0XHRcdFx0bWluV2lkdGg6IE1hdGguY2VpbChuV2lkZXN0KVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0X2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFZhbHVlSGVscDogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgcHJvcGVydHk6IFByb3BlcnR5SW5mbykge1xuXHRcdGNvbnN0IHRhYmxlQVBJID0gdGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEk7XG5cdFx0aWYgKCFwcm9wZXJ0eS5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRjb25zdCBtZXRhTW9kZWwgPSAodGFibGUuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGlmIChwcm9wZXJ0eS5tZXRhZGF0YVBhdGggJiYgbWV0YU1vZGVsKSB7XG5cdFx0XHRcdGNvbnN0IGRhdGFGaWVsZCA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7cHJvcGVydHkubWV0YWRhdGFQYXRofUBgKTtcblx0XHRcdFx0aWYgKGRhdGFGaWVsZCAmJiBkYXRhRmllbGRbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFwiXSkge1xuXHRcdFx0XHRcdHByb3BlcnR5LnZpc3VhbFNldHRpbmdzID0gZGVlcEV4dGVuZChwcm9wZXJ0eS52aXN1YWxTZXR0aW5ncyB8fCB7fSwge1xuXHRcdFx0XHRcdFx0d2lkdGhDYWxjdWxhdGlvbjoge1xuXHRcdFx0XHRcdFx0XHRnYXA6IHRhYmxlQVBJLmdldFByb3BlcnR5KFwicmVhZE9ubHlcIikgPyAwIDogNFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JQcm9wZXJ0eVdpdGhVbml0OiBmdW5jdGlvbiAoXG5cdFx0b1RhYmxlOiBhbnksXG5cdFx0b1Byb3BlcnR5OiBhbnksXG5cdFx0b1VuaXQ/OiBzdHJpbmcsXG5cdFx0b1VuaXRUZXh0Pzogc3RyaW5nLFxuXHRcdG9UaW1lem9uZVRleHQ/OiBzdHJpbmdcblx0KSB7XG5cdFx0Y29uc3Qgb1RhYmxlQVBJID0gb1RhYmxlID8gb1RhYmxlLmdldFBhcmVudCgpIDogbnVsbDtcblx0XHQvLyB1cGRhdGUgZ2FwIGZvciBwcm9wZXJ0aWVzIHdpdGggc3RyaW5nIHVuaXRcblx0XHRjb25zdCBzVW5pdFRleHQgPSBvVW5pdFRleHQgfHwgb1RpbWV6b25lVGV4dDtcblx0XHRpZiAoc1VuaXRUZXh0KSB7XG5cdFx0XHRvUHJvcGVydHkudmlzdWFsU2V0dGluZ3MgPSBkZWVwRXh0ZW5kKG9Qcm9wZXJ0eS52aXN1YWxTZXR0aW5ncywge1xuXHRcdFx0XHR3aWR0aENhbGN1bGF0aW9uOiB7XG5cdFx0XHRcdFx0Z2FwOiBNYXRoLmNlaWwoU2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aChzVW5pdFRleHQpKVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKG9Vbml0KSB7XG5cdFx0XHRvUHJvcGVydHkudmlzdWFsU2V0dGluZ3MgPSBkZWVwRXh0ZW5kKG9Qcm9wZXJ0eS52aXN1YWxTZXR0aW5ncywge1xuXHRcdFx0XHR3aWR0aENhbGN1bGF0aW9uOiB7XG5cdFx0XHRcdFx0Ly8gRm9yIHByb3BlcnRpZXMgd2l0aCB1bml0LCBhIGdhcCBuZWVkcyB0byBiZSBhZGRlZCB0byBwcm9wZXJseSByZW5kZXIgdGhlIGNvbHVtbiB3aWR0aCBvbiBlZGl0IG1vZGVcblx0XHRcdFx0XHRnYXA6IG9UYWJsZUFQSSAmJiBvVGFibGVBUEkuZ2V0UmVhZE9ubHkoKSA/IDAgOiA2XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRfY29tcHV0ZUxhYmVsOiBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5SW5mbywgbGFiZWxNYXA6IHsgW2xhYmVsOiBzdHJpbmddOiBQcm9wZXJ0eUluZm9bXSB9KSB7XG5cdFx0aWYgKHByb3BlcnR5LmxhYmVsKSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0aWVzV2l0aFNhbWVMYWJlbCA9IGxhYmVsTWFwW3Byb3BlcnR5LmxhYmVsXTtcblx0XHRcdGlmIChwcm9wZXJ0aWVzV2l0aFNhbWVMYWJlbD8ubGVuZ3RoID4gMSAmJiBwcm9wZXJ0eS5wYXRoPy5pbmNsdWRlcyhcIi9cIikgJiYgcHJvcGVydHkuYWRkaXRpb25hbExhYmVscykge1xuXHRcdFx0XHRwcm9wZXJ0eS5sYWJlbCA9IHByb3BlcnR5LmxhYmVsICsgXCIgKFwiICsgcHJvcGVydHkuYWRkaXRpb25hbExhYmVscy5qb2luKFwiIC8gXCIpICsgXCIpXCI7XG5cdFx0XHR9XG5cdFx0XHRkZWxldGUgcHJvcGVydHkuYWRkaXRpb25hbExhYmVscztcblx0XHR9XG5cdH0sXG5cdC8vVXBkYXRlIFZpc3VhbFNldHRpbmcgZm9yIGNvbHVtbldpZHRoIGNhbGN1bGF0aW9uIGFuZCBsYWJlbHMgb24gbmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG5cdF91cGRhdGVQcm9wZXJ0eUluZm86IGZ1bmN0aW9uICh0YWJsZTogVGFibGUsIHByb3BlcnRpZXM6IFByb3BlcnR5SW5mb1tdKSB7XG5cdFx0Y29uc3QgbGFiZWxNYXA6IHsgW2xhYmVsOiBzdHJpbmddOiBQcm9wZXJ0eUluZm9bXSB9ID0ge307XG5cdFx0Ly8gQ2hlY2sgYXZhaWxhYmxlIHAxM24gbW9kZXNcblx0XHRjb25zdCBwMTNuTW9kZSA9IHRhYmxlLmdldFAxM25Nb2RlKCk7XG5cdFx0cHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eTogUHJvcGVydHlJbmZvKSA9PiB7XG5cdFx0XHRpZiAoIXByb3BlcnR5LnByb3BlcnR5SW5mb3MgJiYgcHJvcGVydHkubGFiZWwpIHtcblx0XHRcdFx0Ly8gT25seSBmb3Igbm9uLWNvbXBsZXggcHJvcGVydGllc1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0KHAxM25Nb2RlPy5pbmRleE9mKFwiU29ydFwiKSA+IC0xICYmIHByb3BlcnR5LnNvcnRhYmxlKSB8fFxuXHRcdFx0XHRcdChwMTNuTW9kZT8uaW5kZXhPZihcIkZpbHRlclwiKSA+IC0xICYmIHByb3BlcnR5LmZpbHRlcmFibGUpIHx8XG5cdFx0XHRcdFx0KHAxM25Nb2RlPy5pbmRleE9mKFwiR3JvdXBcIikgPiAtMSAmJiBwcm9wZXJ0eS5ncm91cGFibGUpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGxhYmVsTWFwW3Byb3BlcnR5LmxhYmVsXSA9XG5cdFx0XHRcdFx0XHRsYWJlbE1hcFtwcm9wZXJ0eS5sYWJlbF0gIT09IHVuZGVmaW5lZCA/IGxhYmVsTWFwW3Byb3BlcnR5LmxhYmVsXS5jb25jYXQoW3Byb3BlcnR5XSkgOiBbcHJvcGVydHldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eTogYW55KSA9PiB7XG5cdFx0XHR0aGlzLl9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JGaWVsZEdyb3VwKHRhYmxlLCBwcm9wZXJ0eSwgcHJvcGVydGllcyk7XG5cdFx0XHR0aGlzLl9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JQcm9wZXJ0eVdpdGhWYWx1ZUhlbHAodGFibGUsIHByb3BlcnR5KTtcblx0XHRcdC8vIGJjcDogMjI3MDAwMzU3N1xuXHRcdFx0Ly8gU29tZSBjb2x1bW5zIChlZzogY3VzdG9tIGNvbHVtbnMpIGhhdmUgbm8gdHlwZUNvbmZpZyBwcm9wZXJ0eS5cblx0XHRcdC8vIGluaXRpYWxpemluZyBpdCBwcmV2ZW50cyBhbiBleGNlcHRpb24gdGhyb3dcblx0XHRcdHByb3BlcnR5LnR5cGVDb25maWcgPSBkZWVwRXh0ZW5kKHByb3BlcnR5LnR5cGVDb25maWcsIHt9KTtcblx0XHRcdHRoaXMuX2NvbXB1dGVMYWJlbChwcm9wZXJ0eSwgbGFiZWxNYXApO1xuXHRcdH0pO1xuXHRcdHJldHVybiBwcm9wZXJ0aWVzO1xuXHR9LFxuXG5cdGdldENvbHVtbnNGb3I6IGZ1bmN0aW9uICh0YWJsZTogVGFibGUpOiBUYWJsZUNvbHVtbltdIHtcblx0XHRyZXR1cm4gKHRhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJKS5nZXRUYWJsZURlZmluaXRpb24oKS5jb2x1bW5zO1xuXHR9LFxuXG5cdF9nZXRBZ2dyZWdhdGVkUHJvcGVydHlNYXA6IGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdHJldHVybiBvVGFibGUuZ2V0UGFyZW50KCkuZ2V0VGFibGVEZWZpbml0aW9uKCkuYWdncmVnYXRlcztcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZXhwb3J0IGNhcGFiaWxpdGllcyBmb3IgdGhlIGdpdmVuIHNhcC51aS5tZGMuVGFibGUgaW5zdGFuY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGUgSW5zdGFuY2Ugb2YgdGhlIHRhYmxlXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVwcmVzZW50aW5nIHRoZSBleHBvcnQgY2FwYWJpbGl0aWVzIG9mIHRoZSB0YWJsZSBpbnN0YW5jZVxuXHQgKi9cblx0ZmV0Y2hFeHBvcnRDYXBhYmlsaXRpZXM6IGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IG9DYXBhYmlsaXRpZXM6IGFueSA9IHsgWExTWDoge30gfTtcblx0XHRsZXQgb01vZGVsITogYW55O1xuXHRcdHJldHVybiBEZWxlZ2F0ZVV0aWwuZmV0Y2hNb2RlbChvVGFibGUpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAobW9kZWw6IGFueSkge1xuXHRcdFx0XHRvTW9kZWwgPSBtb2RlbDtcblx0XHRcdFx0cmV0dXJuIG9Nb2RlbC5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoXCIvJEVudGl0eUNvbnRhaW5lckBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlN1cHBvcnRlZEZvcm1hdHNcIik7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGFTdXBwb3J0ZWRGb3JtYXRzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25zdCBhTG93ZXJGb3JtYXRzID0gKGFTdXBwb3J0ZWRGb3JtYXRzIHx8IFtdKS5tYXAoKGVsZW1lbnQpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gZWxlbWVudC50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKGFMb3dlckZvcm1hdHMuaW5kZXhPZihcImFwcGxpY2F0aW9uL3BkZlwiKSA+IC0xKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Nb2RlbC5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoXCIvJEVudGl0eUNvbnRhaW5lckBjb20uc2FwLnZvY2FidWxhcmllcy5QREYudjEuRmVhdHVyZXNcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAob0Fubm90YXRpb246IGFueSkge1xuXHRcdFx0XHRpZiAob0Fubm90YXRpb24pIHtcblx0XHRcdFx0XHRvQ2FwYWJpbGl0aWVzW1wiUERGXCJdID0gT2JqZWN0LmFzc2lnbih7fSwgb0Fubm90YXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnI6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoYEFuIGVycm9yIG9jY3VycyB3aGlsZSBjb21wdXRpbmcgZXhwb3J0IGNhcGFiaWxpdGllczogJHtlcnJ9YCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gb0NhcGFiaWxpdGllcztcblx0XHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBGaWx0ZXJpbmcgb24gMTpuIG5hdmlnYXRpb24gcHJvcGVydGllcyBhbmQgbmF2aWdhdGlvblxuXHQgKiBwcm9wZXJ0aWVzIG5vdCBwYXJ0IG9mIHRoZSBMaW5lSXRlbSBhbm5vdGF0aW9uIGlzIGZvcmJpZGRlbi5cblx0ICpcblx0ICogQHBhcmFtIGNvbHVtbkluZm9cblx0ICogQHBhcmFtIG1ldGFNb2RlbFxuXHQgKiBAcGFyYW0gdGFibGVcblx0ICogQHJldHVybnMgQm9vbGVhbiB0cnVlIGlmIGZpbHRlcmluZyBpcyBhbGxvd2VkLCBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdF9pc0ZpbHRlcmFibGVOYXZpZ2F0aW9uUHJvcGVydHk6IGZ1bmN0aW9uIChjb2x1bW5JbmZvOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4sIG1ldGFNb2RlbDogTWV0YU1vZGVsLCB0YWJsZTogVGFibGUpOiBCb29sZWFuIHtcblx0XHQvLyBnZXQgdGhlIERhdGFNb2RlbE9iamVjdFBhdGggZm9yIHRoZSB0YWJsZVxuXHRcdGNvbnN0IHRhYmxlRGF0YU1vZGVsT2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhtZXRhTW9kZWwuZ2V0Q29udGV4dChEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YSh0YWJsZSwgXCJtZXRhUGF0aFwiKSkpLFxuXHRcdFx0Ly8gZ2V0IGFsbCBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgbGVhZGluZyB0byB0aGUgY29sdW1uXG5cdFx0XHRjb2x1bW5OYXZpZ2F0aW9uUHJvcGVydGllcyA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhtZXRhTW9kZWwuZ2V0Q29udGV4dChjb2x1bW5JbmZvLmFubm90YXRpb25QYXRoKSkubmF2aWdhdGlvblByb3BlcnRpZXMsXG5cdFx0XHQvLyB3ZSBhcmUgb25seSBpbnRlcmVzdGVkIGluIG5hdmlnYXRpb24gcHJvcGVydGllcyByZWxhdGl2ZSB0byB0aGUgdGFibGUsIHNvIGFsbCBiZWZvcmUgYW5kIGluY2x1ZGluZyB0aGUgdGFibGVzIHRhcmdldFR5cGUgY2FuIGJlIGZpbHRlcmVkXG5cdFx0XHR0YWJsZVRhcmdldEVudGl0eUluZGV4ID0gY29sdW1uTmF2aWdhdGlvblByb3BlcnRpZXMuZmluZEluZGV4KFxuXHRcdFx0XHQocHJvcCkgPT4gcHJvcC50YXJnZXRUeXBlPy5uYW1lID09PSB0YWJsZURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5VHlwZS5uYW1lXG5cdFx0XHQpLFxuXHRcdFx0cmVsYXRpdmVOYXZpZ2F0aW9uUHJvcGVydGllcyA9IGNvbHVtbk5hdmlnYXRpb25Qcm9wZXJ0aWVzLnNsaWNlKHRhYmxlVGFyZ2V0RW50aXR5SW5kZXggPiAwID8gdGFibGVUYXJnZXRFbnRpdHlJbmRleCA6IDApO1xuXHRcdHJldHVybiAoXG5cdFx0XHQhY29sdW1uSW5mby5yZWxhdGl2ZVBhdGguaW5jbHVkZXMoXCIvXCIpIHx8XG5cdFx0XHQoY29sdW1uSW5mby5pc1BhcnRPZkxpbmVJdGVtID09PSB0cnVlICYmICFyZWxhdGl2ZU5hdmlnYXRpb25Qcm9wZXJ0aWVzLnNvbWUoaXNNdWx0aXBsZU5hdmlnYXRpb25Qcm9wZXJ0eSkpXG5cdFx0KTtcblx0fSxcblxuXHRfZmV0Y2hQcm9wZXJ0eUluZm86IGZ1bmN0aW9uIChtZXRhTW9kZWw6IE1ldGFNb2RlbCwgY29sdW1uSW5mbzogQW5ub3RhdGlvblRhYmxlQ29sdW1uLCB0YWJsZTogVGFibGUsIGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdFx0Y29uc3Qgc0Fic29sdXRlTmF2aWdhdGlvblBhdGggPSBjb2x1bW5JbmZvLmFubm90YXRpb25QYXRoLFxuXHRcdFx0b0RhdGFGaWVsZCA9IG1ldGFNb2RlbC5nZXRPYmplY3Qoc0Fic29sdXRlTmF2aWdhdGlvblBhdGgpLFxuXHRcdFx0b05hdmlnYXRpb25Db250ZXh0ID0gbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBYnNvbHV0ZU5hdmlnYXRpb25QYXRoKSBhcyBDb250ZXh0LFxuXHRcdFx0b1R5cGVDb25maWcgPVxuXHRcdFx0XHRjb2x1bW5JbmZvLnR5cGVDb25maWc/LmNsYXNzTmFtZSAmJiBpc1R5cGVGaWx0ZXJhYmxlKGNvbHVtbkluZm8udHlwZUNvbmZpZy5jbGFzc05hbWUpXG5cdFx0XHRcdFx0PyBUeXBlVXRpbC5nZXRUeXBlQ29uZmlnKFxuXHRcdFx0XHRcdFx0XHRjb2x1bW5JbmZvLnR5cGVDb25maWcuY2xhc3NOYW1lLFxuXHRcdFx0XHRcdFx0XHRjb2x1bW5JbmZvLnR5cGVDb25maWcuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0XHRcdFx0Y29sdW1uSW5mby50eXBlQ29uZmlnLmNvbnN0cmFpbnRzXG5cdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0OiB7fSxcblx0XHRcdGJGaWx0ZXJhYmxlID0gQ29tbW9uSGVscGVyLmlzUHJvcGVydHlGaWx0ZXJhYmxlKG9OYXZpZ2F0aW9uQ29udGV4dCwgb0RhdGFGaWVsZCksXG5cdFx0XHRpc0NvbXBsZXhUeXBlID1cblx0XHRcdFx0Y29sdW1uSW5mby50eXBlQ29uZmlnICYmIGNvbHVtbkluZm8udHlwZUNvbmZpZy5jbGFzc05hbWUgJiYgY29sdW1uSW5mby50eXBlQ29uZmlnLmNsYXNzTmFtZT8uaW5kZXhPZihcIkVkbS5cIikgIT09IDAsXG5cdFx0XHRiSXNBbmFseXRpY2FsVGFibGUgPSBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YSh0YWJsZSwgXCJlbmFibGVBbmFseXRpY3NcIikgPT09IFwidHJ1ZVwiLFxuXHRcdFx0YUFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcFVuZmlsdGVyYWJsZSA9IGJJc0FuYWx5dGljYWxUYWJsZSA/IHRoaXMuX2dldEFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcCh0YWJsZSkgOiB7fSxcblx0XHRcdGxhYmVsID0gZ2V0TG9jYWxpemVkVGV4dChjb2x1bW5JbmZvLmxhYmVsID8/IFwiXCIsIGFwcENvbXBvbmVudCA/PyB0YWJsZSk7XG5cblx0XHRjb25zdCBwcm9wZXJ0eUluZm86IFByb3BlcnR5SW5mbyA9IHtcblx0XHRcdG5hbWU6IGNvbHVtbkluZm8ubmFtZSxcblx0XHRcdG1ldGFkYXRhUGF0aDogc0Fic29sdXRlTmF2aWdhdGlvblBhdGgsXG5cdFx0XHRncm91cExhYmVsOiBjb2x1bW5JbmZvLmdyb3VwTGFiZWwsXG5cdFx0XHRncm91cDogY29sdW1uSW5mby5ncm91cCxcblx0XHRcdGxhYmVsOiBsYWJlbCxcblx0XHRcdHRvb2x0aXA6IGNvbHVtbkluZm8udG9vbHRpcCxcblx0XHRcdHR5cGVDb25maWc6IG9UeXBlQ29uZmlnIGFzIFByb3BlcnR5VHlwZUNvbmZpZyxcblx0XHRcdHZpc2libGU6IGNvbHVtbkluZm8uYXZhaWxhYmlsaXR5ICE9PSBcIkhpZGRlblwiICYmICFpc0NvbXBsZXhUeXBlLFxuXHRcdFx0ZXhwb3J0U2V0dGluZ3M6IHRoaXMuX3NldFByb3BlcnR5SW5mb0V4cG9ydFNldHRpbmdzKGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MsIGNvbHVtbkluZm8pLFxuXHRcdFx0dW5pdDogY29sdW1uSW5mby51bml0XG5cdFx0fTtcblxuXHRcdC8vIFNldCB2aXN1YWxTZXR0aW5ncyBvbmx5IGlmIGl0IGV4aXN0c1xuXHRcdGlmIChjb2x1bW5JbmZvLnZpc3VhbFNldHRpbmdzICYmIE9iamVjdC5rZXlzKGNvbHVtbkluZm8udmlzdWFsU2V0dGluZ3MpLmxlbmd0aCA+IDApIHtcblx0XHRcdHByb3BlcnR5SW5mby52aXN1YWxTZXR0aW5ncyA9IGNvbHVtbkluZm8udmlzdWFsU2V0dGluZ3M7XG5cdFx0fVxuXG5cdFx0aWYgKGNvbHVtbkluZm8uZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWUpIHtcblx0XHRcdHByb3BlcnR5SW5mby5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSA9IGNvbHVtbkluZm8uZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWU7XG5cdFx0fVxuXG5cdFx0Ly8gTURDIGV4cGVjdHMgICdwcm9wZXJ0eUluZm9zJyBvbmx5IGZvciBjb21wbGV4IHByb3BlcnRpZXMuXG5cdFx0Ly8gQW4gZW1wdHkgYXJyYXkgdGhyb3dzIHZhbGlkYXRpb24gZXJyb3IgYW5kIHVuZGVmaW5lZCB2YWx1ZSBpcyB1bmhhbmRsZWQuXG5cdFx0aWYgKGNvbHVtbkluZm8ucHJvcGVydHlJbmZvcz8ubGVuZ3RoKSB7XG5cdFx0XHRwcm9wZXJ0eUluZm8ucHJvcGVydHlJbmZvcyA9IGNvbHVtbkluZm8ucHJvcGVydHlJbmZvcztcblx0XHRcdC8vb25seSBpbiBjYXNlIG9mIGNvbXBsZXggcHJvcGVydGllcywgd3JhcCB0aGUgY2VsbCBjb250ZW50XHRvbiB0aGUgZXhjZWwgZXhwb3J0ZWQgZmlsZVxuXHRcdFx0aWYgKHByb3BlcnR5SW5mby5leHBvcnRTZXR0aW5ncykge1xuXHRcdFx0XHRwcm9wZXJ0eUluZm8uZXhwb3J0U2V0dGluZ3Mud3JhcCA9IGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3M/LndyYXA7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEFkZCBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBzdXBwb3J0ZWQgb25seSBieSBzaW1wbGUgUHJvcGVydHlJbmZvcy5cblx0XHRcdHByb3BlcnR5SW5mby5wYXRoID0gY29sdW1uSW5mby5yZWxhdGl2ZVBhdGg7XG5cdFx0XHQvLyBUT0RPIHdpdGggdGhlIG5ldyBjb21wbGV4IHByb3BlcnR5IGluZm8sIGEgbG90IG9mIFwiRGVzY3JpcHRpb25cIiBmaWVsZHMgYXJlIGFkZGVkIGFzIGZpbHRlci9zb3J0IGZpZWxkc1xuXHRcdFx0cHJvcGVydHlJbmZvLnNvcnRhYmxlID0gY29sdW1uSW5mby5zb3J0YWJsZTtcblx0XHRcdGlmIChiSXNBbmFseXRpY2FsVGFibGUpIHtcblx0XHRcdFx0dGhpcy5fdXBkYXRlQW5hbHl0aWNhbFByb3BlcnR5SW5mb0F0dHJpYnV0ZXMocHJvcGVydHlJbmZvLCBjb2x1bW5JbmZvKTtcblx0XHRcdH1cblx0XHRcdHByb3BlcnR5SW5mby5maWx0ZXJhYmxlID1cblx0XHRcdFx0ISFiRmlsdGVyYWJsZSAmJlxuXHRcdFx0XHR0aGlzLl9pc0ZpbHRlcmFibGVOYXZpZ2F0aW9uUHJvcGVydHkoY29sdW1uSW5mbywgbWV0YU1vZGVsLCB0YWJsZSkgJiZcblx0XHRcdFx0Ly8gVE9ETyBpZ25vcmluZyBhbGwgcHJvcGVydGllcyB0aGF0IGFyZSBub3QgYWxzbyBhdmFpbGFibGUgZm9yIGFkYXB0YXRpb24gZm9yIG5vdywgYnV0IHByb3BlciBjb25jZXB0IHJlcXVpcmVkXG5cdFx0XHRcdCghYklzQW5hbHl0aWNhbFRhYmxlIHx8XG5cdFx0XHRcdFx0KCFhQWdncmVnYXRlZFByb3BlcnR5TWFwVW5maWx0ZXJhYmxlW3Byb3BlcnR5SW5mby5uYW1lXSAmJlxuXHRcdFx0XHRcdFx0IShjb2x1bW5JbmZvIGFzIFRlY2huaWNhbENvbHVtbikuZXh0ZW5zaW9uPy50ZWNobmljYWxseUdyb3VwYWJsZSkpO1xuXHRcdFx0cHJvcGVydHlJbmZvLmtleSA9IGNvbHVtbkluZm8uaXNLZXk7XG5cdFx0XHRwcm9wZXJ0eUluZm8uZ3JvdXBhYmxlID0gY29sdW1uSW5mby5pc0dyb3VwYWJsZTtcblx0XHRcdGlmIChjb2x1bW5JbmZvLnRleHRBcnJhbmdlbWVudCkge1xuXHRcdFx0XHRjb25zdCBkZXNjcmlwdGlvbkNvbHVtbiA9ICh0aGlzLmdldENvbHVtbnNGb3IodGFibGUpIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbltdKS5maW5kKGZ1bmN0aW9uIChvQ29sKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Db2wubmFtZSA9PT0gY29sdW1uSW5mby50ZXh0QXJyYW5nZW1lbnQ/LnRleHRQcm9wZXJ0eTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChkZXNjcmlwdGlvbkNvbHVtbikge1xuXHRcdFx0XHRcdHByb3BlcnR5SW5mby5tb2RlID0gY29sdW1uSW5mby50ZXh0QXJyYW5nZW1lbnQubW9kZTtcblx0XHRcdFx0XHRwcm9wZXJ0eUluZm8udmFsdWVQcm9wZXJ0eSA9IGNvbHVtbkluZm8ucmVsYXRpdmVQYXRoO1xuXHRcdFx0XHRcdHByb3BlcnR5SW5mby5kZXNjcmlwdGlvblByb3BlcnR5ID0gZGVzY3JpcHRpb25Db2x1bW4ucmVsYXRpdmVQYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRwcm9wZXJ0eUluZm8udGV4dCA9IGNvbHVtbkluZm8udGV4dEFycmFuZ2VtZW50ICYmIGNvbHVtbkluZm8udGV4dEFycmFuZ2VtZW50LnRleHRQcm9wZXJ0eTtcblx0XHRcdHByb3BlcnR5SW5mby5jYXNlU2Vuc2l0aXZlID0gY29sdW1uSW5mby5jYXNlU2Vuc2l0aXZlO1xuXHRcdFx0aWYgKGNvbHVtbkluZm8uYWRkaXRpb25hbExhYmVscykge1xuXHRcdFx0XHRwcm9wZXJ0eUluZm8uYWRkaXRpb25hbExhYmVscyA9IGNvbHVtbkluZm8uYWRkaXRpb25hbExhYmVscy5tYXAoKGFkZGl0aW9uYWxMYWJlbDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGdldExvY2FsaXplZFRleHQoYWRkaXRpb25hbExhYmVsLCBhcHBDb21wb25lbnQgfHwgdGFibGUpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JQcm9wZXJ0eVdpdGhVbml0KHRhYmxlLCBwcm9wZXJ0eUluZm8sIGNvbHVtbkluZm8udW5pdCwgY29sdW1uSW5mby51bml0VGV4dCwgY29sdW1uSW5mby50aW1lem9uZVRleHQpO1xuXG5cdFx0cmV0dXJuIHByb3BlcnR5SW5mbztcblx0fSxcblxuXHQvKipcblx0ICogRXh0ZW5kIHRoZSBleHBvcnQgc2V0dGluZ3MgYmFzZWQgb24gdGhlIGNvbHVtbiBpbmZvLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXhwb3J0U2V0dGluZ3MgVGhlIGV4cG9ydCBzZXR0aW5ncyB0byBiZSBleHRlbmRlZFxuXHQgKiBAcGFyYW0gY29sdW1uSW5mbyBUaGUgY29sdW1uSW5mbyBvYmplY3Rcblx0ICogQHJldHVybnMgVGhlIGV4dGVuZGVkIGV4cG9ydCBzZXR0aW5nc1xuXHQgKi9cblx0X3NldFByb3BlcnR5SW5mb0V4cG9ydFNldHRpbmdzOiBmdW5jdGlvbiAoXG5cdFx0ZXhwb3J0U2V0dGluZ3M6IGNvbHVtbkV4cG9ydFNldHRpbmdzIHwgdW5kZWZpbmVkIHwgbnVsbCxcblx0XHRjb2x1bW5JbmZvOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5cblx0KTogY29sdW1uRXhwb3J0U2V0dGluZ3MgfCB1bmRlZmluZWQgfCBudWxsIHtcblx0XHRjb25zdCBleHBvcnRGb3JtYXQgPSB0aGlzLl9nZXRFeHBvcnRGb3JtYXQoY29sdW1uSW5mby50eXBlQ29uZmlnPy5jbGFzc05hbWUpO1xuXHRcdGlmIChleHBvcnRTZXR0aW5ncykge1xuXHRcdFx0aWYgKGV4cG9ydEZvcm1hdCAmJiAhZXhwb3J0U2V0dGluZ3MudGltZXpvbmVQcm9wZXJ0eSkge1xuXHRcdFx0XHRleHBvcnRTZXR0aW5ncy5mb3JtYXQgPSBleHBvcnRGb3JtYXQ7XG5cdFx0XHR9XG5cdFx0XHQvLyBTZXQgdGhlIGV4cG9ydFNldHRpbmdzIHRlbXBsYXRlIG9ubHkgaWYgaXQgZXhpc3RzLlxuXHRcdFx0aWYgKGV4cG9ydFNldHRpbmdzLnRlbXBsYXRlKSB7XG5cdFx0XHRcdGV4cG9ydFNldHRpbmdzLnRlbXBsYXRlID0gY29sdW1uSW5mby5leHBvcnRTZXR0aW5ncz8udGVtcGxhdGU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBleHBvcnRTZXR0aW5ncztcblx0fSxcblxuXHRfdXBkYXRlQW5hbHl0aWNhbFByb3BlcnR5SW5mb0F0dHJpYnV0ZXMocHJvcGVydHlJbmZvOiBQcm9wZXJ0eUluZm8sIGNvbHVtbkluZm86IEFubm90YXRpb25UYWJsZUNvbHVtbikge1xuXHRcdGlmIChjb2x1bW5JbmZvLmFnZ3JlZ2F0YWJsZSkge1xuXHRcdFx0cHJvcGVydHlJbmZvLmFnZ3JlZ2F0YWJsZSA9IGNvbHVtbkluZm8uYWdncmVnYXRhYmxlO1xuXHRcdH1cblx0XHRpZiAoY29sdW1uSW5mby5leHRlbnNpb24pIHtcblx0XHRcdHByb3BlcnR5SW5mby5leHRlbnNpb24gPSBjb2x1bW5JbmZvLmV4dGVuc2lvbjtcblx0XHR9XG5cdH0sXG5cblx0X2ZldGNoQ3VzdG9tUHJvcGVydHlJbmZvOiBmdW5jdGlvbiAoY29sdW1uSW5mbzogQ3VzdG9tQmFzZWRUYWJsZUNvbHVtbiwgdGFibGU6IFRhYmxlLCBhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCkge1xuXHRcdGxldCBzTGFiZWw6IFN0cmluZyA9IFwiXCI7XG5cdFx0aWYgKGNvbHVtbkluZm8uaGVhZGVyKSB7XG5cdFx0XHRpZiAoY29sdW1uSW5mby5oZWFkZXIuc3RhcnRzV2l0aChcInttZXRhTW9kZWw+XCIpKSB7XG5cdFx0XHRcdGNvbnN0IG1ldGFNb2RlbFBhdGggPSBjb2x1bW5JbmZvLmhlYWRlci5zdWJzdHJpbmcoMTEsIGNvbHVtbkluZm8uaGVhZGVyLmxlbmd0aCAtIDEpO1xuXHRcdFx0XHRzTGFiZWwgPSAodGFibGUuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsKS5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QobWV0YU1vZGVsUGF0aCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzTGFiZWwgPSBnZXRMb2NhbGl6ZWRUZXh0KGNvbHVtbkluZm8uaGVhZGVyLCBhcHBDb21wb25lbnQgfHwgdGFibGUpOyAvLyBUb2RvOiBUbyBiZSByZW1vdmVkIG9uY2UgTURDIHByb3ZpZGVzIHRyYW5zbGF0aW9uIHN1cHBvcnRcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3QgcHJvcGVydHlJbmZvOiBQcm9wZXJ0eUluZm8gPSB7XG5cdFx0XHRuYW1lOiBjb2x1bW5JbmZvLm5hbWUsXG5cdFx0XHRncm91cExhYmVsOiB1bmRlZmluZWQsXG5cdFx0XHRncm91cDogdW5kZWZpbmVkLFxuXHRcdFx0bGFiZWw6IHNMYWJlbC50b1N0cmluZygpLFxuXHRcdFx0dHlwZTogXCJFZG0uU3RyaW5nXCIsIC8vIFRCRFxuXHRcdFx0dmlzaWJsZTogY29sdW1uSW5mby5hdmFpbGFiaWxpdHkgIT09IFwiSGlkZGVuXCIsXG5cdFx0XHRleHBvcnRTZXR0aW5nczogY29sdW1uSW5mby5leHBvcnRTZXR0aW5ncyxcblx0XHRcdHZpc3VhbFNldHRpbmdzOiBjb2x1bW5JbmZvLnZpc3VhbFNldHRpbmdzXG5cdFx0fTtcblxuXHRcdC8vIE1EQyBleHBlY3RzICdwcm9wZXJ0eUluZm9zJyBvbmx5IGZvciBjb21wbGV4IHByb3BlcnRpZXMuXG5cdFx0Ly8gQW4gZW1wdHkgYXJyYXkgdGhyb3dzIHZhbGlkYXRpb24gZXJyb3IgYW5kIHVuZGVmaW5lZCB2YWx1ZSBpcyB1bmhhbmRsZWQuXG5cdFx0aWYgKGNvbHVtbkluZm8ucHJvcGVydHlJbmZvcyAmJiBjb2x1bW5JbmZvLnByb3BlcnR5SW5mb3MubGVuZ3RoKSB7XG5cdFx0XHRwcm9wZXJ0eUluZm8ucHJvcGVydHlJbmZvcyA9IGNvbHVtbkluZm8ucHJvcGVydHlJbmZvcztcblx0XHRcdC8vb25seSBpbiBjYXNlIG9mIGNvbXBsZXggcHJvcGVydGllcywgd3JhcCB0aGUgY2VsbCBjb250ZW50IG9uIHRoZSBleGNlbCBleHBvcnRlZCBmaWxlXG5cdFx0XHRwcm9wZXJ0eUluZm8uZXhwb3J0U2V0dGluZ3MgPSB7XG5cdFx0XHRcdHdyYXA6IGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3M/LndyYXAsXG5cdFx0XHRcdHRlbXBsYXRlOiBjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzPy50ZW1wbGF0ZVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQWRkIHByb3BlcnRpZXMgd2hpY2ggYXJlIHN1cHBvcnRlZCBvbmx5IGJ5IHNpbXBsZSBQcm9wZXJ0eUluZm9zLlxuXHRcdFx0cHJvcGVydHlJbmZvLnBhdGggPSBjb2x1bW5JbmZvLm5hbWU7XG5cdFx0XHRwcm9wZXJ0eUluZm8uc29ydGFibGUgPSBmYWxzZTtcblx0XHRcdHByb3BlcnR5SW5mby5maWx0ZXJhYmxlID0gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiBwcm9wZXJ0eUluZm87XG5cdH0sXG5cdF9iQ29sdW1uSGFzUHJvcGVydHlXaXRoRHJhZnRJbmRpY2F0b3I6IGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogYW55KSB7XG5cdFx0cmV0dXJuICEhKFxuXHRcdFx0KG9Db2x1bW5JbmZvLmZvcm1hdE9wdGlvbnMgJiYgb0NvbHVtbkluZm8uZm9ybWF0T3B0aW9ucy5oYXNEcmFmdEluZGljYXRvcikgfHxcblx0XHRcdChvQ29sdW1uSW5mby5mb3JtYXRPcHRpb25zICYmIG9Db2x1bW5JbmZvLmZvcm1hdE9wdGlvbnMuZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoKVxuXHRcdCk7XG5cdH0sXG5cdF91cGRhdGVEcmFmdEluZGljYXRvck1vZGVsOiBmdW5jdGlvbiAoX29UYWJsZTogYW55LCBfb0NvbHVtbkluZm86IGFueSkge1xuXHRcdGNvbnN0IGFWaXNpYmxlQ29sdW1ucyA9IF9vVGFibGUuZ2V0Q29sdW1ucygpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0ID0gX29UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IHNJbnRlcm5hbFBhdGggPSBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCAmJiBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0aWYgKGFWaXNpYmxlQ29sdW1ucyAmJiBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Zm9yIChjb25zdCBpbmRleCBpbiBhVmlzaWJsZUNvbHVtbnMpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHRoaXMuX2JDb2x1bW5IYXNQcm9wZXJ0eVdpdGhEcmFmdEluZGljYXRvcihfb0NvbHVtbkluZm8pICYmXG5cdFx0XHRcdFx0X29Db2x1bW5JbmZvLm5hbWUgPT09IGFWaXNpYmxlQ29sdW1uc1tpbmRleF0uZ2V0RGF0YVByb3BlcnR5KClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0aWYgKG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LmdldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IsIF9vQ29sdW1uSW5mby5uYW1lKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0X2ZldGNoUHJvcGVydGllc0ZvckVudGl0eTogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBzRW50aXR5VHlwZVBhdGg6IGFueSwgb01ldGFNb2RlbDogYW55LCBvQXBwQ29tcG9uZW50OiBhbnkpIHtcblx0XHQvLyB3aGVuIGZldGNoaW5nIHByb3BlcnRpZXMsIHRoaXMgYmluZGluZyBjb250ZXh0IGlzIG5lZWRlZCAtIHNvIGxldHMgY3JlYXRlIGl0IG9ubHkgb25jZSBhbmQgdXNlIGlmIGZvciBhbGwgcHJvcGVydGllcy9kYXRhLWZpZWxkcy9saW5lLWl0ZW1zXG5cdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzRW50aXR5VHlwZVBhdGgpO1xuXHRcdGxldCBhRmV0Y2hlZFByb3BlcnRpZXM6IGFueVtdID0gW107XG5cdFx0Y29uc3Qgb0ZSID0gQ29tbW9uVXRpbHMuZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKHNCaW5kaW5nUGF0aCwgb01ldGFNb2RlbCk7XG5cdFx0Y29uc3QgYU5vbkZpbHRlcmFibGVQcm9wcyA9IG9GUi5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcztcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuZ2V0Q29sdW1uc0ZvcihvVGFibGUpKVxuXHRcdFx0LnRoZW4oKGFDb2x1bW5zOiBUYWJsZUNvbHVtbltdKSA9PiB7XG5cdFx0XHRcdC8vIERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhIGRvZXMgbm90IHdvcmsgdmlhICdlbnRpdHlTZXQvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEnXG5cdFx0XHRcdGlmIChhQ29sdW1ucykge1xuXHRcdFx0XHRcdGxldCBvUHJvcGVydHlJbmZvO1xuXHRcdFx0XHRcdGFDb2x1bW5zLmZvckVhY2goKG9Db2x1bW5JbmZvKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLl91cGRhdGVEcmFmdEluZGljYXRvck1vZGVsKG9UYWJsZSwgb0NvbHVtbkluZm8pO1xuXHRcdFx0XHRcdFx0c3dpdGNoIChvQ29sdW1uSW5mby50eXBlKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJBbm5vdGF0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mbyA9IHRoaXMuX2ZldGNoUHJvcGVydHlJbmZvKFxuXHRcdFx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRcdG9Db2x1bW5JbmZvIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbixcblx0XHRcdFx0XHRcdFx0XHRcdG9UYWJsZSxcblx0XHRcdFx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnRcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHlJbmZvICYmIGFOb25GaWx0ZXJhYmxlUHJvcHMuaW5kZXhPZihvUHJvcGVydHlJbmZvLm5hbWUpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mby5tYXhDb25kaXRpb25zID0gRGVsZWdhdGVVdGlsLmlzTXVsdGlWYWx1ZShvUHJvcGVydHlJbmZvKSA/IC0xIDogMTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJTbG90XCI6XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJEZWZhdWx0XCI6XG5cdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mbyA9IHRoaXMuX2ZldGNoQ3VzdG9tUHJvcGVydHlJbmZvKG9Db2x1bW5JbmZvIGFzIEN1c3RvbUJhc2VkVGFibGVDb2x1bW4sIG9UYWJsZSwgb0FwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmhhbmRsZWQgc3dpdGNoIGNhc2UgJHtvQ29sdW1uSW5mby50eXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2gob1Byb3BlcnR5SW5mbyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGFGZXRjaGVkUHJvcGVydGllcyA9IHRoaXMuX3VwZGF0ZVByb3BlcnR5SW5mbyhvVGFibGUsIGFGZXRjaGVkUHJvcGVydGllcyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnI6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoYEFuIGVycm9yIG9jY3VycyB3aGlsZSB1cGRhdGluZyBmZXRjaGVkIHByb3BlcnRpZXM6ICR7ZXJyfWApO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGFGZXRjaGVkUHJvcGVydGllcztcblx0XHRcdH0pO1xuXHR9LFxuXG5cdF9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eTogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgZW50aXR5VHlwZVBhdGg6IHN0cmluZywgbWV0YU1vZGVsOiBhbnksIGFwcENvbXBvbmVudD86IEFwcENvbXBvbmVudCkge1xuXHRcdGNvbnN0IGZldGNoZWRQcm9wZXJ0aWVzID0gRGVsZWdhdGVVdGlsLmdldENhY2hlZFByb3BlcnRpZXModGFibGUpO1xuXG5cdFx0aWYgKGZldGNoZWRQcm9wZXJ0aWVzKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZldGNoZWRQcm9wZXJ0aWVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX2ZldGNoUHJvcGVydGllc0ZvckVudGl0eSh0YWJsZSwgZW50aXR5VHlwZVBhdGgsIG1ldGFNb2RlbCwgYXBwQ29tcG9uZW50KS50aGVuKGZ1bmN0aW9uIChzdWJGZXRjaGVkUHJvcGVydGllczogYW55W10pIHtcblx0XHRcdERlbGVnYXRlVXRpbC5zZXRDYWNoZWRQcm9wZXJ0aWVzKHRhYmxlLCBzdWJGZXRjaGVkUHJvcGVydGllcyk7XG5cdFx0XHRyZXR1cm4gc3ViRmV0Y2hlZFByb3BlcnRpZXM7XG5cdFx0fSk7XG5cdH0sXG5cblx0X3NldFRhYmxlTm9EYXRhVGV4dDogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRcdGxldCBzTm9EYXRhS2V5ID0gXCJcIjtcblx0XHRjb25zdCBvVGFibGVGaWx0ZXJJbmZvID0gVGFibGVVdGlscy5nZXRBbGxGaWx0ZXJJbmZvKG9UYWJsZSksXG5cdFx0XHRzdWZmaXhSZXNvdXJjZUtleSA9IG9CaW5kaW5nSW5mby5wYXRoLnN0YXJ0c1dpdGgoXCIvXCIpID8gb0JpbmRpbmdJbmZvLnBhdGguc3Vic3RyKDEpIDogb0JpbmRpbmdJbmZvLnBhdGg7XG5cblx0XHRjb25zdCBfZ2V0Tm9EYXRhVGV4dFdpdGhGaWx0ZXJzID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKG9UYWJsZS5kYXRhKFwiaGlkZGVuRmlsdGVyc1wiKSB8fCBvVGFibGUuZ2V0UXVpY2tGaWx0ZXIoKSkge1xuXHRcdFx0XHRyZXR1cm4gXCJNX1RBQkxFX0FORF9DSEFSVF9OT19EQVRBX1RFWFRfTVVMVElfVklFV1wiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFwiVF9UQUJMRV9BTkRfQ0hBUlRfTk9fREFUQV9URVhUX1dJVEhfRklMVEVSXCI7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBzRmlsdGVyQXNzb2NpYXRpb24gPSBvVGFibGUuZ2V0RmlsdGVyKCk7XG5cblx0XHRpZiAoc0ZpbHRlckFzc29jaWF0aW9uICYmICEvQmFzaWNTZWFyY2gkLy50ZXN0KHNGaWx0ZXJBc3NvY2lhdGlvbikpIHtcblx0XHRcdC8vIGNoZWNrIGlmIGEgRmlsdGVyQmFyIGlzIGFzc29jaWF0ZWQgdG8gdGhlIFRhYmxlIChiYXNpYyBzZWFyY2ggb24gdG9vbEJhciBpcyBleGNsdWRlZClcblx0XHRcdGlmIChvVGFibGVGaWx0ZXJJbmZvLnNlYXJjaCB8fCAob1RhYmxlRmlsdGVySW5mby5maWx0ZXJzICYmIG9UYWJsZUZpbHRlckluZm8uZmlsdGVycy5sZW5ndGgpKSB7XG5cdFx0XHRcdC8vIGNoZWNrIGlmIHRhYmxlIGhhcyBhbnkgRmlsdGVyYmFyIGZpbHRlcnMgb3IgcGVyc29uYWxpemF0aW9uIGZpbHRlcnNcblx0XHRcdFx0c05vRGF0YUtleSA9IF9nZXROb0RhdGFUZXh0V2l0aEZpbHRlcnMoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNOb0RhdGFLZXkgPSBcIlRfVEFCTEVfQU5EX0NIQVJUX05PX0RBVEFfVEVYVFwiO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAob1RhYmxlRmlsdGVySW5mby5zZWFyY2ggfHwgKG9UYWJsZUZpbHRlckluZm8uZmlsdGVycyAmJiBvVGFibGVGaWx0ZXJJbmZvLmZpbHRlcnMubGVuZ3RoKSkge1xuXHRcdFx0Ly9jaGVjayBpZiB0YWJsZSBoYXMgYW55IHBlcnNvbmFsaXphdGlvbiBmaWx0ZXJzXG5cdFx0XHRzTm9EYXRhS2V5ID0gX2dldE5vRGF0YVRleHRXaXRoRmlsdGVycygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzTm9EYXRhS2V5ID0gXCJNX1RBQkxFX0FORF9DSEFSVF9OT19GSUxURVJTX05PX0RBVEFfVEVYVFwiO1xuXHRcdH1cblxuXHRcdG9UYWJsZS5zZXROb0RhdGEoZ2V0UmVzb3VyY2VNb2RlbChvVGFibGUpLmdldFRleHQoc05vRGF0YUtleSwgdW5kZWZpbmVkLCBzdWZmaXhSZXNvdXJjZUtleSkpO1xuXHR9LFxuXG5cdGhhbmRsZVRhYmxlRGF0YVJlY2VpdmVkOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9JbnRlcm5hbE1vZGVsQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb0JpbmRpbmcgPSBvVGFibGUgJiYgb1RhYmxlLmdldFJvd0JpbmRpbmcoKSxcblx0XHRcdGJEYXRhUmVjZWl2ZWRBdHRhY2hlZCA9IG9JbnRlcm5hbE1vZGVsQ29udGV4dCAmJiBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJkYXRhUmVjZWl2ZWRBdHRhY2hlZFwiKTtcblxuXHRcdGlmIChvSW50ZXJuYWxNb2RlbENvbnRleHQgJiYgIWJEYXRhUmVjZWl2ZWRBdHRhY2hlZCkge1xuXHRcdFx0b0JpbmRpbmcuYXR0YWNoRGF0YVJlY2VpdmVkKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly8gUmVmcmVzaCB0aGUgc2VsZWN0ZWQgY29udGV4dHMgdG8gdHJpZ2dlciByZS1jYWxjdWxhdGlvbiBvZiBlbmFibGVkIHN0YXRlIG9mIGFjdGlvbnMuXG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIiwgW10pO1xuXHRcdFx0XHRjb25zdCBhU2VsZWN0ZWRDb250ZXh0cyA9IG9UYWJsZS5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIiwgYVNlbGVjdGVkQ29udGV4dHMpO1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgYVNlbGVjdGVkQ29udGV4dHMubGVuZ3RoKTtcblx0XHRcdFx0Y29uc3Qgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IEpTT04ucGFyc2UoXG5cdFx0XHRcdFx0Q29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwib3BlcmF0aW9uQXZhaWxhYmxlTWFwXCIpKVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnQob0ludGVybmFsTW9kZWxDb250ZXh0LCBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwLCBhU2VsZWN0ZWRDb250ZXh0cywgXCJ0YWJsZVwiKTtcblx0XHRcdFx0Ly8gUmVmcmVzaCBlbmFibGVtZW50IG9mIGRlbGV0ZSBidXR0b25cblx0XHRcdFx0RGVsZXRlSGVscGVyLnVwZGF0ZURlbGV0ZUluZm9Gb3JTZWxlY3RlZENvbnRleHRzKG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgYVNlbGVjdGVkQ29udGV4dHMpO1xuXHRcdFx0XHRjb25zdCBvVGFibGVBUEkgPSBvVGFibGUgPyBvVGFibGUuZ2V0UGFyZW50KCkgOiBudWxsO1xuXHRcdFx0XHRpZiAob1RhYmxlQVBJKSB7XG5cdFx0XHRcdFx0b1RhYmxlQVBJLnNldFVwRW1wdHlSb3dzKG9UYWJsZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiZGF0YVJlY2VpdmVkQXR0YWNoZWRcIiwgdHJ1ZSk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlYmluZDogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvQmluZGluZ0luZm86IGFueSk6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3Qgb1RhYmxlQVBJID0gb1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJO1xuXHRcdGNvbnN0IGJJc1N1c3BlbmRlZCA9IG9UYWJsZUFQST8uZ2V0UHJvcGVydHkoXCJiaW5kaW5nU3VzcGVuZGVkXCIpO1xuXHRcdG9UYWJsZUFQST8uc2V0UHJvcGVydHkoXCJvdXREYXRlZEJpbmRpbmdcIiwgYklzU3VzcGVuZGVkKTtcblx0XHRpZiAoIWJJc1N1c3BlbmRlZCkge1xuXHRcdFx0VGFibGVVdGlscy5jbGVhclNlbGVjdGlvbihvVGFibGUpO1xuXHRcdFx0VGFibGVEZWxlZ2F0ZUJhc2UucmViaW5kLmFwcGx5KHRoaXMsIFtvVGFibGUsIG9CaW5kaW5nSW5mb10pO1xuXHRcdFx0VGFibGVVdGlscy5vblRhYmxlQm91bmQob1RhYmxlKTtcblx0XHRcdHRoaXMuX3NldFRhYmxlTm9EYXRhVGV4dChvVGFibGUsIG9CaW5kaW5nSW5mbyk7XG5cdFx0XHRyZXR1cm4gVGFibGVVdGlscy53aGVuQm91bmQob1RhYmxlKVxuXHRcdFx0XHQudGhlbih0aGlzLmhhbmRsZVRhYmxlRGF0YVJlY2VpdmVkKG9UYWJsZSwgb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikpKVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgd2FpdGluZyBmb3IgdGhlIHRhYmxlIHRvIGJlIGJvdW5kXCIsIG9FcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEZldGNoZXMgdGhlIHJlbGV2YW50IG1ldGFkYXRhIGZvciB0aGUgdGFibGUgYW5kIHJldHVybnMgcHJvcGVydHkgaW5mbyBhcnJheS5cblx0ICpcblx0ICogQHBhcmFtIHRhYmxlIEluc3RhbmNlIG9mIHRoZSBNREN0YWJsZVxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBwcm9wZXJ0eSBpbmZvXG5cdCAqL1xuXHRmZXRjaFByb3BlcnRpZXM6IGZ1bmN0aW9uICh0YWJsZTogVGFibGUpIHtcblx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmZldGNoTW9kZWwodGFibGUpXG5cdFx0XHQudGhlbigobW9kZWwpID0+IHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2dldENhY2hlZE9yRmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5KFxuXHRcdFx0XHRcdHRhYmxlLFxuXHRcdFx0XHRcdERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRhYmxlLCBcImVudGl0eVR5cGVcIiksXG5cdFx0XHRcdFx0bW9kZWwuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0KTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbigocHJvcGVydGllcykgPT4ge1xuXHRcdFx0XHQodGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBDb250ZXh0KS5zZXRQcm9wZXJ0eShcInRhYmxlUHJvcGVydGllc0F2YWlsYWJsZVwiLCB0cnVlKTtcblx0XHRcdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdFx0XHR9KTtcblx0fSxcblxuXHRwcmVJbml0OiBmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSkge1xuXHRcdHJldHVybiBUYWJsZURlbGVnYXRlQmFzZS5wcmVJbml0LmFwcGx5KHRoaXMsIFtvVGFibGVdKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogU2V0IHRoZSBiaW5kaW5nIGNvbnRleHQgdG8gbnVsbCBmb3IgZXZlcnkgZmFzdCBjcmVhdGlvbiByb3cgdG8gYXZvaWQgaXQgaW5oZXJpdGluZ1xuXHRcdFx0ICogdGhlIHdyb25nIGNvbnRleHQgYW5kIHJlcXVlc3RpbmcgdGhlIHRhYmxlIGNvbHVtbnMgb24gdGhlIHBhcmVudCBlbnRpdHlcblx0XHRcdCAqIFNldCB0aGUgY29ycmVjdCBiaW5kaW5nIGNvbnRleHQgaW4gT2JqZWN0UGFnZUNvbnRyb2xsZXIuZW5hYmxlRmFzdENyZWF0aW9uUm93KClcblx0XHRcdCAqL1xuXHRcdFx0Y29uc3Qgb0Zhc3RDcmVhdGlvblJvdyA9IG9UYWJsZS5nZXRDcmVhdGlvblJvdygpO1xuXHRcdFx0aWYgKG9GYXN0Q3JlYXRpb25Sb3cpIHtcblx0XHRcdFx0b0Zhc3RDcmVhdGlvblJvdy5zZXRCaW5kaW5nQ29udGV4dChudWxsIGFzIGFueSBhcyBDb250ZXh0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0dXBkYXRlQmluZGluZ0luZm86IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0XHRUYWJsZURlbGVnYXRlQmFzZS51cGRhdGVCaW5kaW5nSW5mby5hcHBseSh0aGlzLCBbb1RhYmxlLCBvQmluZGluZ0luZm9dKTtcblx0XHR0aGlzLl9pbnRlcm5hbFVwZGF0ZUJpbmRpbmdJbmZvKG9UYWJsZSwgb0JpbmRpbmdJbmZvKTtcblx0XHR0aGlzLl9zZXRUYWJsZU5vRGF0YVRleHQob1RhYmxlLCBvQmluZGluZ0luZm8pO1xuXHRcdC8qKlxuXHRcdCAqIFdlIGhhdmUgdG8gc2V0IHRoZSBiaW5kaW5nIGNvbnRleHQgdG8gbnVsbCBmb3IgZXZlcnkgZmFzdCBjcmVhdGlvbiByb3cgdG8gYXZvaWQgaXQgaW5oZXJpdGluZ1xuXHRcdCAqIHRoZSB3cm9uZyBjb250ZXh0IGFuZCByZXF1ZXN0aW5nIHRoZSB0YWJsZSBjb2x1bW5zIG9uIHRoZSBwYXJlbnQgZW50aXR5XG5cdFx0ICogVGhlIGNvcnJlY3QgYmluZGluZyBjb250ZXh0IGlzIHNldCBpbiBPYmplY3RQYWdlQ29udHJvbGxlci5lbmFibGVGYXN0Q3JlYXRpb25Sb3coKVxuXHRcdCAqL1xuXHRcdGlmIChvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKT8uZ2V0QmluZGluZ0NvbnRleHQoKSA9PT0gbnVsbCkge1xuXHRcdFx0VGFibGVIZWxwZXIuZW5hYmxlRmFzdENyZWF0aW9uUm93KFxuXHRcdFx0XHRvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKSxcblx0XHRcdFx0b0JpbmRpbmdJbmZvLnBhdGgsXG5cdFx0XHRcdG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0XHRvVGFibGUuZ2V0TW9kZWwoKSxcblx0XHRcdFx0b1RhYmxlLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKVxuXHRcdFx0KTtcblx0XHR9XG5cdH0sXG5cblx0X21hbmFnZVNlbWFudGljVGFyZ2V0czogZnVuY3Rpb24gKG9NRENUYWJsZTogYW55KSB7XG5cdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSBvTURDVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHRcdGlmIChvUm93QmluZGluZykge1xuXHRcdFx0b1Jvd0JpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlcXVlc3RlZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNvbnN0IF9vVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob01EQ1RhYmxlKTtcblx0XHRcdFx0XHRpZiAoX29WaWV3KSB7XG5cdFx0XHRcdFx0XHRUYWJsZVV0aWxzLmdldFNlbWFudGljVGFyZ2V0c0Zyb21UYWJsZShfb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyLCBvTURDVGFibGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwgMCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlQmluZGluZzogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvQmluZGluZ0luZm86IGFueSwgb0JpbmRpbmc6IGFueSkge1xuXHRcdGNvbnN0IG9UYWJsZUFQSSA9IG9UYWJsZS5nZXRQYXJlbnQoKSBhcyBUYWJsZUFQSTtcblx0XHRjb25zdCBiSXNTdXNwZW5kZWQgPSBvVGFibGVBUEk/LmdldFByb3BlcnR5KFwiYmluZGluZ1N1c3BlbmRlZFwiKTtcblx0XHRpZiAoIWJJc1N1c3BlbmRlZCkge1xuXHRcdFx0bGV0IGJOZWVkTWFudWFsUmVmcmVzaCA9IGZhbHNlO1xuXHRcdFx0Y29uc3QgX29WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvVGFibGUpO1xuXHRcdFx0Y29uc3Qgb0ludGVybmFsQmluZGluZ0NvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRcdGNvbnN0IHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSA9IFwicGVuZGluZ01hbnVhbEJpbmRpbmdVcGRhdGVcIjtcblx0XHRcdGNvbnN0IGJQZW5kaW5nTWFudWFsVXBkYXRlID0gb0ludGVybmFsQmluZGluZ0NvbnRleHQuZ2V0UHJvcGVydHkoc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5KTtcblx0XHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblxuXHRcdFx0aWYgKG9Sb3dCaW5kaW5nKSB7XG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBNYW51YWwgcmVmcmVzaCBpZiBmaWx0ZXJzIGFyZSBub3QgY2hhbmdlZCBieSBiaW5kaW5nLnJlZnJlc2goKSBzaW5jZSB1cGRhdGluZyB0aGUgYmluZGluZ0luZm9cblx0XHRcdFx0ICogaXMgbm90IGVub3VnaCB0byB0cmlnZ2VyIGEgYmF0Y2ggcmVxdWVzdC5cblx0XHRcdFx0ICogUmVtb3ZpbmcgY29sdW1ucyBjcmVhdGVzIG9uZSBiYXRjaCByZXF1ZXN0IHRoYXQgd2FzIG5vdCBleGVjdXRlZCBiZWZvcmVcblx0XHRcdFx0ICovXG5cdFx0XHRcdGNvbnN0IG9sZEZpbHRlcnMgPSBvUm93QmluZGluZy5nZXRGaWx0ZXJzKFwiQXBwbGljYXRpb25cIik7XG5cdFx0XHRcdGJOZWVkTWFudWFsUmVmcmVzaCA9XG5cdFx0XHRcdFx0ZGVlcEVxdWFsKG9CaW5kaW5nSW5mby5maWx0ZXJzLCBvbGRGaWx0ZXJzWzBdKSAmJlxuXHRcdFx0XHRcdG9CaW5kaW5nSW5mby5wYXRoID09PSBvUm93QmluZGluZy5nZXRQYXRoKCkgJiYgLy8gVGhlIHBhdGggY2FuIGJlIGNoYW5nZWQgaW4gY2FzZSBvZiBhIHBhcmFtZXRyaXplZCBlbnRpdHlcblx0XHRcdFx0XHRvUm93QmluZGluZy5nZXRRdWVyeU9wdGlvbnNGcm9tUGFyYW1ldGVycygpLiRzZWFyY2ggPT09IG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggJiZcblx0XHRcdFx0XHQhYlBlbmRpbmdNYW51YWxVcGRhdGUgJiZcblx0XHRcdFx0XHRfb1ZpZXcgJiZcblx0XHRcdFx0XHQoX29WaWV3LmdldFZpZXdEYXRhKCkgYXMgYW55KS5jb252ZXJ0ZXJUeXBlID09PSBcIkxpc3RSZXBvcnRcIjtcblx0XHRcdH1cblx0XHRcdFRhYmxlRGVsZWdhdGVCYXNlLnVwZGF0ZUJpbmRpbmcuYXBwbHkodGhpcywgW29UYWJsZSwgb0JpbmRpbmdJbmZvLCBvQmluZGluZ10pO1xuXHRcdFx0b1RhYmxlLmZpcmVFdmVudChcImJpbmRpbmdVcGRhdGVkXCIpO1xuXHRcdFx0aWYgKGJOZWVkTWFudWFsUmVmcmVzaCAmJiBvVGFibGUuZ2V0RmlsdGVyKCkgJiYgb0JpbmRpbmcpIHtcblx0XHRcdFx0b1Jvd0JpbmRpbmdcblx0XHRcdFx0XHQucmVxdWVzdFJlZnJlc2gob1Jvd0JpbmRpbmcuZ2V0R3JvdXBJZCgpKVxuXHRcdFx0XHRcdC5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSwgZmFsc2UpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVmcmVzaGluZyB0aGUgdGFibGVcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0b0ludGVybmFsQmluZGluZ0NvbnRleHQuc2V0UHJvcGVydHkoc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5LCB0cnVlKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX21hbmFnZVNlbWFudGljVGFyZ2V0cyhvVGFibGUpO1xuXHRcdH1cblx0XHRvVGFibGVBUEk/LnNldFByb3BlcnR5KFwib3V0RGF0ZWRCaW5kaW5nXCIsIGJJc1N1c3BlbmRlZCk7XG5cdH0sXG5cblx0X2NvbXB1dGVSb3dCaW5kaW5nSW5mb0Zyb21UZW1wbGF0ZTogZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0Ly8gV2UgbmVlZCB0byBkZWVwQ2xvbmUgdGhlIGluZm8gd2UgZ2V0IGZyb20gdGhlIGN1c3RvbSBkYXRhLCBvdGhlcndpc2Ugc29tZSBvZiBpdHMgc3Vib2JqZWN0cyAoZS5nLiBwYXJhbWV0ZXJzKSB3aWxsXG5cdFx0Ly8gYmUgc2hhcmVkIHdpdGggb0JpbmRpbmdJbmZvIGFuZCBtb2RpZmllZCBsYXRlciAoT2JqZWN0LmFzc2lnbiBvbmx5IGRvZXMgYSBzaGFsbG93IGNsb25lKVxuXHRcdGNvbnN0IHJvd0JpbmRpbmdJbmZvID0gZGVlcENsb25lKERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJyb3dzQmluZGluZ0luZm9cIikpO1xuXHRcdC8vIGlmIHRoZSByb3dCaW5kaW5nSW5mbyBoYXMgYSAkJGdldEtlZXBBbGl2ZUNvbnRleHQgcGFyYW1ldGVyIHdlIG5lZWQgdG8gY2hlY2sgaXQgaXMgdGhlIG9ubHkgVGFibGUgd2l0aCBzdWNoIGFcblx0XHQvLyBwYXJhbWV0ZXIgZm9yIHRoZSBjb2xsZWN0aW9uTWV0YVBhdGhcblx0XHRpZiAocm93QmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGdldEtlZXBBbGl2ZUNvbnRleHQpIHtcblx0XHRcdGNvbnN0IGNvbGxlY3Rpb25QYXRoID0gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcInRhcmdldENvbGxlY3Rpb25QYXRoXCIpO1xuXHRcdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IG9UYWJsZS5nZXRNb2RlbChcImludGVybmFsXCIpO1xuXHRcdFx0Y29uc3Qga2VwdEFsaXZlTGlzdHMgPSBpbnRlcm5hbE1vZGVsLmdldE9iamVjdChcIi9rZXB0QWxpdmVMaXN0c1wiKSB8fCB7fTtcblx0XHRcdGlmICgha2VwdEFsaXZlTGlzdHNbY29sbGVjdGlvblBhdGhdKSB7XG5cdFx0XHRcdGtlcHRBbGl2ZUxpc3RzW2NvbGxlY3Rpb25QYXRoXSA9IG9UYWJsZS5nZXRJZCgpO1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL2tlcHRBbGl2ZUxpc3RzXCIsIGtlcHRBbGl2ZUxpc3RzKTtcblx0XHRcdH0gZWxzZSBpZiAoa2VwdEFsaXZlTGlzdHNbY29sbGVjdGlvblBhdGhdICE9PSBvVGFibGUuZ2V0SWQoKSkge1xuXHRcdFx0XHRkZWxldGUgcm93QmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGdldEtlZXBBbGl2ZUNvbnRleHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByb3dCaW5kaW5nSW5mbztcblx0fSxcblx0X2ludGVybmFsVXBkYXRlQmluZGluZ0luZm86IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0JpbmRpbmdJbmZvOiBhbnkpIHtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRPYmplY3QuYXNzaWduKG9CaW5kaW5nSW5mbywgdGhpcy5fY29tcHV0ZVJvd0JpbmRpbmdJbmZvRnJvbVRlbXBsYXRlKG9UYWJsZSkpO1xuXHRcdC8qKlxuXHRcdCAqIEJpbmRpbmcgaW5mbyBtaWdodCBiZSBzdXNwZW5kZWQgYXQgdGhlIGJlZ2lubmluZyB3aGVuIHRoZSBmaXJzdCBiaW5kUm93cyBpcyBjYWxsZWQ6XG5cdFx0ICogVG8gYXZvaWQgZHVwbGljYXRlIHJlcXVlc3RzIGJ1dCBzdGlsbCBoYXZlIGEgYmluZGluZyB0byBjcmVhdGUgbmV3IGVudHJpZXMuXHRcdFx0XHQgKlxuXHRcdCAqIEFmdGVyIHRoZSBpbml0aWFsIGJpbmRpbmcgc3RlcCwgZm9sbG93IHVwIGJpbmRpbmdzIHNob3VsZCBubyBsb25nZXIgYmUgc3VzcGVuZGVkLlxuXHRcdCAqL1xuXHRcdGlmIChvVGFibGUuZ2V0Um93QmluZGluZygpKSB7XG5cdFx0XHRvQmluZGluZ0luZm8uc3VzcGVuZGVkID0gZmFsc2U7XG5cdFx0fVxuXHRcdC8vIFRoZSBwcmV2aW91c2x5IGFkZGVkIGhhbmRsZXIgZm9yIHRoZSBldmVudCAnZGF0YVJlY2VpdmVkJyBpcyBub3QgYW55bW9yZSB0aGVyZVxuXHRcdC8vIHNpbmNlIHRoZSBiaW5kaW5nSW5mbyBpcyByZWNyZWF0ZWQgZnJvbSBzY3JhdGNoIHNvIHdlIG5lZWQgdG8gc2V0IHRoZSBmbGFnIHRvIGZhbHNlIGluIG9yZGVyXG5cdFx0Ly8gdG8gYWdhaW4gYWRkIHRoZSBoYW5kbGVyIG9uIHRoaXMgZXZlbnQgaWYgbmVlZGVkXG5cdFx0aWYgKG9JbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiZGF0YVJlY2VpdmVkQXR0YWNoZWRcIiwgZmFsc2UpO1xuXHRcdH1cblxuXHRcdGxldCBvRmlsdGVyO1xuXHRcdGNvbnN0IG9GaWx0ZXJJbmZvID0gVGFibGVVdGlscy5nZXRBbGxGaWx0ZXJJbmZvKG9UYWJsZSk7XG5cdFx0Ly8gUHJlcGFyZSBiaW5kaW5nIGluZm8gd2l0aCBmaWx0ZXIvc2VhcmNoIHBhcmFtZXRlcnNcblx0XHRpZiAob0ZpbHRlckluZm8uZmlsdGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRvRmlsdGVyID0gbmV3IEZpbHRlcih7IGZpbHRlcnM6IG9GaWx0ZXJJbmZvLmZpbHRlcnMsIGFuZDogdHJ1ZSB9KTtcblx0XHR9XG5cdFx0aWYgKG9GaWx0ZXJJbmZvLmJpbmRpbmdQYXRoKSB7XG5cdFx0XHRvQmluZGluZ0luZm8ucGF0aCA9IG9GaWx0ZXJJbmZvLmJpbmRpbmdQYXRoO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9EYXRhU3RhdGVJbmRpY2F0b3IgPSBvVGFibGUuZ2V0RGF0YVN0YXRlSW5kaWNhdG9yKCk7XG5cdFx0aWYgKG9EYXRhU3RhdGVJbmRpY2F0b3IgJiYgb0RhdGFTdGF0ZUluZGljYXRvci5pc0ZpbHRlcmluZygpKSB7XG5cdFx0XHQvLyBJbmNsdWRlIGZpbHRlcnMgb24gbWVzc2FnZVN0cmlwXG5cdFx0XHRpZiAob0JpbmRpbmdJbmZvLmZpbHRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRvRmlsdGVyID0gbmV3IEZpbHRlcih7IGZpbHRlcnM6IG9CaW5kaW5nSW5mby5maWx0ZXJzLmNvbmNhdChvRmlsdGVySW5mby5maWx0ZXJzKSwgYW5kOiB0cnVlIH0pO1xuXHRcdFx0XHR0aGlzLnVwZGF0ZUJpbmRpbmdJbmZvV2l0aFNlYXJjaFF1ZXJ5KG9CaW5kaW5nSW5mbywgb0ZpbHRlckluZm8sIG9GaWx0ZXIpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnVwZGF0ZUJpbmRpbmdJbmZvV2l0aFNlYXJjaFF1ZXJ5KG9CaW5kaW5nSW5mbywgb0ZpbHRlckluZm8sIG9GaWx0ZXIpO1xuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVCaW5kaW5nSW5mb1dpdGhTZWFyY2hRdWVyeTogZnVuY3Rpb24gKGJpbmRpbmdJbmZvOiBhbnksIGZpbHRlckluZm86IGFueSwgZmlsdGVyPzogRmlsdGVyKSB7XG5cdFx0YmluZGluZ0luZm8uZmlsdGVycyA9IGZpbHRlcjtcblx0XHRpZiAoZmlsdGVySW5mby5zZWFyY2gpIHtcblx0XHRcdGJpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaCA9IENvbW1vblV0aWxzLm5vcm1hbGl6ZVNlYXJjaFRlcm0oZmlsdGVySW5mby5zZWFyY2gpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRiaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9LFxuXHRfdGVtcGxhdGVDdXN0b21Db2x1bW5GcmFnbWVudDogZnVuY3Rpb24gKG9Db2x1bW5JbmZvOiBUYWJsZUNvbHVtbiwgb1ZpZXc6IGFueSwgb01vZGlmaWVyOiBhbnksIHNUYWJsZUlkOiBhbnkpIHtcblx0XHRjb25zdCBvQ29sdW1uTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG9Db2x1bW5JbmZvKSxcblx0XHRcdG9UaGlzID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdGlkOiBzVGFibGVJZFxuXHRcdFx0fSksXG5cdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKSxcblx0XHRcdFx0XHRjb2x1bW46IG9Db2x1bW5Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdFx0fSxcblx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHRcdFx0Y29sdW1uOiBvQ29sdW1uTW9kZWxcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdHJldHVybiBEZWxlZ2F0ZVV0aWwudGVtcGxhdGVDb250cm9sRnJhZ21lbnQoXG5cdFx0XHRcInNhcC5mZS5tYWNyb3MudGFibGUuQ3VzdG9tQ29sdW1uXCIsXG5cdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MsXG5cdFx0XHR7IHZpZXc6IG9WaWV3IH0sXG5cdFx0XHRvTW9kaWZpZXJcblx0XHQpLnRoZW4oZnVuY3Rpb24gKG9JdGVtOiBhbnkpIHtcblx0XHRcdG9Db2x1bW5Nb2RlbC5kZXN0cm95KCk7XG5cdFx0XHRyZXR1cm4gb0l0ZW07XG5cdFx0fSk7XG5cdH0sXG5cblx0X3RlbXBsYXRlU2xvdENvbHVtbkZyYWdtZW50OiBhc3luYyBmdW5jdGlvbiAoXG5cdFx0b0NvbHVtbkluZm86IEN1c3RvbUVsZW1lbnQ8Q3VzdG9tQmFzZWRUYWJsZUNvbHVtbj4sXG5cdFx0b1ZpZXc6IGFueSxcblx0XHRvTW9kaWZpZXI6IGFueSxcblx0XHRzVGFibGVJZDogYW55XG5cdCkge1xuXHRcdGNvbnN0IG9Db2x1bW5Nb2RlbCA9IG5ldyBKU09OTW9kZWwob0NvbHVtbkluZm8pLFxuXHRcdFx0b1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdFx0aWQ6IHNUYWJsZUlkXG5cdFx0XHR9KSxcblx0XHRcdG9QcmVwcm9jZXNzb3JTZXR0aW5ncyA9IHtcblx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRcdGNvbHVtbjogb0NvbHVtbk1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHR0aGlzOiBvVGhpcyxcblx0XHRcdFx0XHRjb2x1bW46IG9Db2x1bW5Nb2RlbFxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdGNvbnN0IHNsb3RDb2x1bW5zWE1MID0gKGF3YWl0IERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChcInNhcC5mZS5tYWNyb3MudGFibGUuU2xvdENvbHVtblwiLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHtcblx0XHRcdGlzWE1MOiB0cnVlXG5cdFx0fSkpIGFzIEVsZW1lbnQ7XG5cdFx0aWYgKCFzbG90Q29sdW1uc1hNTCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cdFx0Y29uc3Qgc2xvdFhNTCA9IHNsb3RDb2x1bW5zWE1MLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2xvdFwiKVswXSxcblx0XHRcdG1kY1RhYmxlVGVtcGxhdGVYTUwgPSBzbG90Q29sdW1uc1hNTC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm1kY1RhYmxlOnRlbXBsYXRlXCIpWzBdO1xuXHRcdG1kY1RhYmxlVGVtcGxhdGVYTUwucmVtb3ZlQ2hpbGQoc2xvdFhNTCk7XG5cdFx0aWYgKG9Db2x1bW5JbmZvLnRlbXBsYXRlKSB7XG5cdFx0XHRjb25zdCBvVGVtcGxhdGUgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKG9Db2x1bW5JbmZvLnRlbXBsYXRlLCBcInRleHQveG1sXCIpO1xuXHRcdFx0bWRjVGFibGVUZW1wbGF0ZVhNTC5hcHBlbmRDaGlsZChvVGVtcGxhdGUuZmlyc3RFbGVtZW50Q2hpbGQhKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLmVycm9yKGBQbGVhc2UgcHJvdmlkZSBjb250ZW50IGluc2lkZSB0aGlzIEJ1aWxkaW5nIEJsb2NrIENvbHVtbjogJHtvQ29sdW1uSW5mby5oZWFkZXJ9YCk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblx0XHRpZiAob01vZGlmaWVyLnRhcmdldHMgIT09IFwianNDb250cm9sVHJlZVwiKSB7XG5cdFx0XHRyZXR1cm4gc2xvdENvbHVtbnNYTUw7XG5cdFx0fVxuXHRcdHJldHVybiBGcmFnbWVudC5sb2FkKHtcblx0XHRcdHR5cGU6IFwiWE1MXCIsXG5cdFx0XHRkZWZpbml0aW9uOiBzbG90Q29sdW1uc1hNTFxuXHRcdH0pO1xuXHR9LFxuXG5cdF9nZXRFeHBvcnRGb3JtYXQ6IGZ1bmN0aW9uIChkYXRhVHlwZTogYW55KSB7XG5cdFx0c3dpdGNoIChkYXRhVHlwZSkge1xuXHRcdFx0Y2FzZSBcIkVkbS5EYXRlXCI6XG5cdFx0XHRcdHJldHVybiBFeGNlbEZvcm1hdC5nZXRFeGNlbERhdGVmcm9tSlNEYXRlKCk7XG5cdFx0XHRjYXNlIFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCI6XG5cdFx0XHRcdHJldHVybiBFeGNlbEZvcm1hdC5nZXRFeGNlbERhdGVUaW1lZnJvbUpTRGF0ZVRpbWUoKTtcblx0XHRcdGNhc2UgXCJFZG0uVGltZU9mRGF5XCI6XG5cdFx0XHRcdHJldHVybiBFeGNlbEZvcm1hdC5nZXRFeGNlbFRpbWVmcm9tSlNUaW1lKCk7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fSxcblxuXHRfZ2V0VkhSZWxldmFudEZpZWxkczogZnVuY3Rpb24gKG9NZXRhTW9kZWw6IGFueSwgc01ldGFkYXRhUGF0aDogYW55LCBzQmluZGluZ1BhdGg/OiBhbnkpIHtcblx0XHRsZXQgYUZpZWxkczogYW55W10gPSBbXSxcblx0XHRcdG9EYXRhRmllbGREYXRhID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc01ldGFkYXRhUGF0aCk7XG5cblx0XHRpZiAob0RhdGFGaWVsZERhdGEuJGtpbmQgJiYgb0RhdGFGaWVsZERhdGEuJGtpbmQgPT09IFwiUHJvcGVydHlcIikge1xuXHRcdFx0b0RhdGFGaWVsZERhdGEgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YWRhdGFQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGREZWZhdWx0YCk7XG5cdFx0XHRzTWV0YWRhdGFQYXRoID0gYCR7c01ldGFkYXRhUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRGVmYXVsdGA7XG5cdFx0fVxuXHRcdHN3aXRjaCAob0RhdGFGaWVsZERhdGEuJFR5cGUpIHtcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCI6XG5cdFx0XHRcdGlmIChvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YWRhdGFQYXRofS9UYXJnZXQvJEFubm90YXRpb25QYXRoYCkuaW5jbHVkZXMoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwXCIpKSB7XG5cdFx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFkYXRhUGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aC9EYXRhYCkuZm9yRWFjaCgob1ZhbHVlOiBhbnksIGlJbmRleDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRhRmllbGRzID0gYUZpZWxkcy5jb25jYXQoXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2dldFZIUmVsZXZhbnRGaWVsZHMob01ldGFNb2RlbCwgYCR7c01ldGFkYXRhUGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aC9EYXRhLyR7aUluZGV4fWApXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aFwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhVcmxcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEFjdGlvblwiOlxuXHRcdFx0XHRhRmllbGRzLnB1c2gob01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFkYXRhUGF0aH0vVmFsdWUvJFBhdGhgKSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiOlxuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIHByb3BlcnR5XG5cdFx0XHRcdC8vIHRlbXBvcmFyeSB3b3JrYXJvdW5kIHRvIG1ha2Ugc3VyZSBWSCByZWxldmFudCBmaWVsZCBwYXRoIGRvIG5vdCBjb250YWluIHRoZSBiaW5kaW5ncGF0aFxuXHRcdFx0XHRpZiAoc01ldGFkYXRhUGF0aC5pbmRleE9mKHNCaW5kaW5nUGF0aCkgPT09IDApIHtcblx0XHRcdFx0XHRhRmllbGRzLnB1c2goc01ldGFkYXRhUGF0aC5zdWJzdHJpbmcoc0JpbmRpbmdQYXRoLmxlbmd0aCArIDEpKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRhRmllbGRzLnB1c2goQ29tbW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKHNNZXRhZGF0YVBhdGgsIHRydWUpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHJldHVybiBhRmllbGRzO1xuXHR9LFxuXHRfc2V0RHJhZnRJbmRpY2F0b3JPblZpc2libGVDb2x1bW46IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgYUNvbHVtbnM6IGFueSwgb0NvbHVtbkluZm86IGFueSkge1xuXHRcdGNvbnN0IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0aWYgKCFvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBzSW50ZXJuYWxQYXRoID0gb0ludGVybmFsQmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGFDb2x1bW5zV2l0aERyYWZ0SW5kaWNhdG9yID0gYUNvbHVtbnMuZmlsdGVyKChvQ29sdW1uOiBhbnkpID0+IHtcblx0XHRcdHJldHVybiB0aGlzLl9iQ29sdW1uSGFzUHJvcGVydHlXaXRoRHJhZnRJbmRpY2F0b3Iob0NvbHVtbik7XG5cdFx0fSk7XG5cdFx0Y29uc3QgYVZpc2libGVDb2x1bW5zID0gb1RhYmxlLmdldENvbHVtbnMoKTtcblx0XHRsZXQgc0FkZFZpc2libGVDb2x1bW5OYW1lLCBzVmlzaWJsZUNvbHVtbk5hbWUsIGJGb3VuZENvbHVtblZpc2libGVXaXRoRHJhZnQsIHNDb2x1bW5OYW1lV2l0aERyYWZ0SW5kaWNhdG9yO1xuXHRcdGZvciAoY29uc3QgaSBpbiBhVmlzaWJsZUNvbHVtbnMpIHtcblx0XHRcdHNWaXNpYmxlQ29sdW1uTmFtZSA9IGFWaXNpYmxlQ29sdW1uc1tpXS5nZXREYXRhUHJvcGVydHkoKTtcblx0XHRcdGZvciAoY29uc3QgaiBpbiBhQ29sdW1uc1dpdGhEcmFmdEluZGljYXRvcikge1xuXHRcdFx0XHRzQ29sdW1uTmFtZVdpdGhEcmFmdEluZGljYXRvciA9IGFDb2x1bW5zV2l0aERyYWZ0SW5kaWNhdG9yW2pdLm5hbWU7XG5cdFx0XHRcdGlmIChzVmlzaWJsZUNvbHVtbk5hbWUgPT09IHNDb2x1bW5OYW1lV2l0aERyYWZ0SW5kaWNhdG9yKSB7XG5cdFx0XHRcdFx0YkZvdW5kQ29sdW1uVmlzaWJsZVdpdGhEcmFmdCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9Db2x1bW5JbmZvICYmIG9Db2x1bW5JbmZvLm5hbWUgPT09IHNDb2x1bW5OYW1lV2l0aERyYWZ0SW5kaWNhdG9yKSB7XG5cdFx0XHRcdFx0c0FkZFZpc2libGVDb2x1bW5OYW1lID0gb0NvbHVtbkluZm8ubmFtZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGJGb3VuZENvbHVtblZpc2libGVXaXRoRHJhZnQpIHtcblx0XHRcdFx0b0ludGVybmFsQmluZGluZ0NvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsUGF0aCArIFNFTUFOVElDS0VZX0hBU19EUkFGVElORElDQVRPUiwgc1Zpc2libGVDb2x1bW5OYW1lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghYkZvdW5kQ29sdW1uVmlzaWJsZVdpdGhEcmFmdCAmJiBzQWRkVmlzaWJsZUNvbHVtbk5hbWUpIHtcblx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IsIHNBZGRWaXNpYmxlQ29sdW1uTmFtZSk7XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmVJdGVtOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9Qcm9wZXJ0eUluZm9OYW1lOiBhbnksIG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdFx0bGV0IGRvUmVtb3ZlSXRlbSA9IHRydWU7XG5cdFx0aWYgKCFvUHJvcGVydHlJbmZvTmFtZSkge1xuXHRcdFx0Ly8gMS4gQXBwbGljYXRpb24gcmVtb3ZlZCB0aGUgcHJvcGVydHkgZnJvbSB0aGVpciBkYXRhIG1vZGVsXG5cdFx0XHQvLyAyLiBhZGRJdGVtIGZhaWxlZCBiZWZvcmUgcmV2ZXJ0RGF0YSBjcmVhdGVkXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRvUmVtb3ZlSXRlbSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9Nb2RpZmllciA9IG1Qcm9wZXJ0eUJhZy5tb2RpZmllcjtcblx0XHRjb25zdCBzRGF0YVByb3BlcnR5ID0gb01vZGlmaWVyLmdldFByb3BlcnR5KG9Qcm9wZXJ0eUluZm9OYW1lLCBcImRhdGFQcm9wZXJ0eVwiKTtcblx0XHRpZiAoc0RhdGFQcm9wZXJ0eSAmJiBzRGF0YVByb3BlcnR5LmluZGV4T2YgJiYgc0RhdGFQcm9wZXJ0eS5pbmRleE9mKFwiSW5saW5lWE1MXCIpICE9PSAtMSkge1xuXHRcdFx0b01vZGlmaWVyLmluc2VydEFnZ3JlZ2F0aW9uKG9UYWJsZSwgXCJkZXBlbmRlbnRzXCIsIG9Qcm9wZXJ0eUluZm9OYW1lKTtcblx0XHRcdGRvUmVtb3ZlSXRlbSA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZiAob1RhYmxlLmlzQSAmJiBvTW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJqc0NvbnRyb2xUcmVlXCIpIHtcblx0XHRcdHRoaXMuX3NldERyYWZ0SW5kaWNhdG9yU3RhdHVzKG9Nb2RpZmllciwgb1RhYmxlLCB0aGlzLmdldENvbHVtbnNGb3Iob1RhYmxlKSk7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoZG9SZW1vdmVJdGVtKTtcblx0fSxcblx0X2dldE1ldGFNb2RlbDogZnVuY3Rpb24gKG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdFx0cmV0dXJuIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHR9LFxuXHRfc2V0RHJhZnRJbmRpY2F0b3JTdGF0dXM6IGZ1bmN0aW9uIChvTW9kaWZpZXI6IGFueSwgb1RhYmxlOiBhbnksIGFDb2x1bW5zOiBhbnksIG9Db2x1bW5JbmZvPzogYW55KSB7XG5cdFx0aWYgKG9Nb2RpZmllci50YXJnZXRzID09PSBcImpzQ29udHJvbFRyZWVcIikge1xuXHRcdFx0dGhpcy5fc2V0RHJhZnRJbmRpY2F0b3JPblZpc2libGVDb2x1bW4ob1RhYmxlLCBhQ29sdW1ucywgb0NvbHVtbkluZm8pO1xuXHRcdH1cblx0fSxcblx0X2dldEdyb3VwSWQ6IGZ1bmN0aW9uIChzUmV0cmlldmVkR3JvdXBJZDogYW55KSB7XG5cdFx0cmV0dXJuIHNSZXRyaWV2ZWRHcm91cElkIHx8IHVuZGVmaW5lZDtcblx0fSxcblx0X2dldERlcGVuZGVudDogZnVuY3Rpb24gKG9EZXBlbmRlbnQ6IGFueSwgc1Byb3BlcnR5SW5mb05hbWU6IGFueSwgc0RhdGFQcm9wZXJ0eTogYW55KSB7XG5cdFx0aWYgKHNQcm9wZXJ0eUluZm9OYW1lID09PSBzRGF0YVByb3BlcnR5KSB7XG5cdFx0XHRyZXR1cm4gb0RlcGVuZGVudDtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblx0X2ZuVGVtcGxhdGVWYWx1ZUhlbHA6IGZ1bmN0aW9uIChmblRlbXBsYXRlVmFsdWVIZWxwOiBhbnksIGJWYWx1ZUhlbHBSZXF1aXJlZDogYW55LCBiVmFsdWVIZWxwRXhpc3RzOiBhbnkpIHtcblx0XHRpZiAoYlZhbHVlSGVscFJlcXVpcmVkICYmICFiVmFsdWVIZWxwRXhpc3RzKSB7XG5cdFx0XHRyZXR1cm4gZm5UZW1wbGF0ZVZhbHVlSGVscChcInNhcC5mZS5tYWNyb3MudGFibGUuVmFsdWVIZWxwXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH0sXG5cdF9nZXREaXNwbGF5TW9kZTogZnVuY3Rpb24gKGJEaXNwbGF5TW9kZTogYW55KSB7XG5cdFx0bGV0IGNvbHVtbkVkaXRNb2RlO1xuXHRcdGlmIChiRGlzcGxheU1vZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0YkRpc3BsYXlNb2RlID0gdHlwZW9mIGJEaXNwbGF5TW9kZSA9PT0gXCJib29sZWFuXCIgPyBiRGlzcGxheU1vZGUgOiBiRGlzcGxheU1vZGUgPT09IFwidHJ1ZVwiO1xuXHRcdFx0Y29sdW1uRWRpdE1vZGUgPSBiRGlzcGxheU1vZGUgPyBcIkRpc3BsYXlcIiA6IFwiRWRpdGFibGVcIjtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGRpc3BsYXltb2RlOiBiRGlzcGxheU1vZGUsXG5cdFx0XHRcdGNvbHVtbkVkaXRNb2RlOiBjb2x1bW5FZGl0TW9kZVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGRpc3BsYXltb2RlOiB1bmRlZmluZWQsXG5cdFx0XHRjb2x1bW5FZGl0TW9kZTogdW5kZWZpbmVkXG5cdFx0fTtcblx0fSxcblx0X2luc2VydEFnZ3JlZ2F0aW9uOiBmdW5jdGlvbiAob1ZhbHVlSGVscDogYW55LCBvTW9kaWZpZXI6IGFueSwgb1RhYmxlOiBhbnkpIHtcblx0XHRpZiAob1ZhbHVlSGVscCkge1xuXHRcdFx0cmV0dXJuIG9Nb2RpZmllci5pbnNlcnRBZ2dyZWdhdGlvbihvVGFibGUsIFwiZGVwZW5kZW50c1wiLCBvVmFsdWVIZWxwLCAwKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblx0LyoqXG5cdCAqIEludm9rZWQgd2hlbiBhIGNvbHVtbiBpcyBhZGRlZCB1c2luZyB0aGUgdGFibGUgcGVyc29uYWxpemF0aW9uIGRpYWxvZy5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wZXJ0eUluZm9OYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5IGZvciB3aGljaCB0aGUgY29sdW1uIGlzIGFkZGVkXG5cdCAqIEBwYXJhbSBvVGFibGUgSW5zdGFuY2Ugb2YgdGFibGUgY29udHJvbFxuXHQgKiBAcGFyYW0gbVByb3BlcnR5QmFnIEluc3RhbmNlIG9mIHByb3BlcnR5IGJhZyBmcm9tIHRoZSBmbGV4aWJpbGl0eSBBUElcblx0ICogQHJldHVybnMgT25jZSByZXNvbHZlZCwgYSB0YWJsZSBjb2x1bW4gZGVmaW5pdGlvbiBpcyByZXR1cm5lZFxuXHQgKi9cblx0YWRkSXRlbTogYXN5bmMgZnVuY3Rpb24gKG9UYWJsZTogYW55LCBzUHJvcGVydHlJbmZvTmFtZTogc3RyaW5nLCBtUHJvcGVydHlCYWc6IGFueSkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLl9nZXRNZXRhTW9kZWwobVByb3BlcnR5QmFnKSxcblx0XHRcdG9Nb2RpZmllciA9IG1Qcm9wZXJ0eUJhZy5tb2RpZmllcixcblx0XHRcdHNUYWJsZUlkID0gb01vZGlmaWVyLmdldElkKG9UYWJsZSksXG5cdFx0XHRhQ29sdW1ucyA9IG9UYWJsZS5pc0EgPyB0aGlzLmdldENvbHVtbnNGb3Iob1RhYmxlKSA6IG51bGw7XG5cdFx0aWYgKCFhQ29sdW1ucykge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cblx0XHRjb25zdCBvQ29sdW1uSW5mbyA9IGFDb2x1bW5zLmZpbmQoZnVuY3Rpb24gKG9Db2x1bW4pIHtcblx0XHRcdHJldHVybiBvQ29sdW1uLm5hbWUgPT09IHNQcm9wZXJ0eUluZm9OYW1lO1xuXHRcdH0pO1xuXHRcdGlmICghb0NvbHVtbkluZm8pIHtcblx0XHRcdExvZy5lcnJvcihgJHtzUHJvcGVydHlJbmZvTmFtZX0gbm90IGZvdW5kIHdoaWxlIGFkZGluZyBjb2x1bW5gKTtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXHRcdHRoaXMuX3NldERyYWZ0SW5kaWNhdG9yU3RhdHVzKG9Nb2RpZmllciwgb1RhYmxlLCBhQ29sdW1ucywgb0NvbHVtbkluZm8pO1xuXHRcdC8vIHJlbmRlciBjdXN0b20gY29sdW1uXG5cdFx0aWYgKG9Db2x1bW5JbmZvLnR5cGUgPT09IFwiRGVmYXVsdFwiKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fdGVtcGxhdGVDdXN0b21Db2x1bW5GcmFnbWVudChvQ29sdW1uSW5mbywgbVByb3BlcnR5QmFnLnZpZXcsIG9Nb2RpZmllciwgc1RhYmxlSWQpO1xuXHRcdH1cblxuXHRcdGlmIChvQ29sdW1uSW5mby50eXBlID09PSBcIlNsb3RcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3RlbXBsYXRlU2xvdENvbHVtbkZyYWdtZW50KFxuXHRcdFx0XHRvQ29sdW1uSW5mbyBhcyBDdXN0b21FbGVtZW50PEN1c3RvbUJhc2VkVGFibGVDb2x1bW4+LFxuXHRcdFx0XHRtUHJvcGVydHlCYWcudmlldyxcblx0XHRcdFx0b01vZGlmaWVyLFxuXHRcdFx0XHRzVGFibGVJZFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0Ly8gZmFsbC1iYWNrXG5cdFx0aWYgKCFvTWV0YU1vZGVsKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNQYXRoOiBzdHJpbmcgPSBhd2FpdCBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwibWV0YVBhdGhcIiwgb01vZGlmaWVyKTtcblx0XHRjb25zdCBzRW50aXR5VHlwZVBhdGg6IHN0cmluZyA9IGF3YWl0IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJlbnRpdHlUeXBlXCIsIG9Nb2RpZmllcik7XG5cdFx0Y29uc3Qgc1JldHJpZXZlZEdyb3VwSWQgPSBhd2FpdCBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwicmVxdWVzdEdyb3VwSWRcIiwgb01vZGlmaWVyKTtcblx0XHRjb25zdCBzR3JvdXBJZDogc3RyaW5nID0gdGhpcy5fZ2V0R3JvdXBJZChzUmV0cmlldmVkR3JvdXBJZCk7XG5cdFx0Y29uc3Qgb1RhYmxlQ29udGV4dDogQ29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpO1xuXHRcdGNvbnN0IGFGZXRjaGVkUHJvcGVydGllcyA9IGF3YWl0IHRoaXMuX2dldENhY2hlZE9yRmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5KFxuXHRcdFx0b1RhYmxlLFxuXHRcdFx0c0VudGl0eVR5cGVQYXRoLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnRcblx0XHQpO1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eUluZm8gPSBhRmV0Y2hlZFByb3BlcnRpZXMuZmluZChmdW5jdGlvbiAob0luZm86IGFueSkge1xuXHRcdFx0cmV0dXJuIG9JbmZvLm5hbWUgPT09IHNQcm9wZXJ0eUluZm9OYW1lO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3Qgb1Byb3BlcnR5Q29udGV4dDogQ29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQob1Byb3BlcnR5SW5mby5tZXRhZGF0YVBhdGgpO1xuXHRcdGNvbnN0IGFWSFByb3BlcnRpZXMgPSB0aGlzLl9nZXRWSFJlbGV2YW50RmllbGRzKG9NZXRhTW9kZWwsIG9Qcm9wZXJ0eUluZm8ubWV0YWRhdGFQYXRoLCBzUGF0aCk7XG5cdFx0Y29uc3Qgb1BhcmFtZXRlcnMgPSB7XG5cdFx0XHRzQmluZGluZ1BhdGg6IHNQYXRoLFxuXHRcdFx0c1ZhbHVlSGVscFR5cGU6IFwiVGFibGVWYWx1ZUhlbHBcIixcblx0XHRcdG9Db250cm9sOiBvVGFibGUsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b01vZGlmaWVyLFxuXHRcdFx0b1Byb3BlcnR5SW5mb1xuXHRcdH07XG5cblx0XHRjb25zdCBmblRlbXBsYXRlVmFsdWVIZWxwID0gYXN5bmMgKHNGcmFnbWVudE5hbWU6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdFx0XHRpZDogc1RhYmxlSWQsXG5cdFx0XHRcdFx0cmVxdWVzdEdyb3VwSWQ6IHNHcm91cElkXG5cdFx0XHRcdH0pLFxuXHRcdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0XHR0aGlzOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XHRkYXRhRmllbGQ6IG9Qcm9wZXJ0eUNvbnRleHQsXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogb1RhYmxlQ29udGV4dFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHR0aGlzOiBvVGhpcyxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdGNvbnRleHRQYXRoOiBvTWV0YU1vZGVsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvVmFsdWVIZWxwID0gYXdhaXQgRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KHNGcmFnbWVudE5hbWUsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywge30sIG9Nb2RpZmllcik7XG5cdFx0XHRcdHJldHVybiBhd2FpdCB0aGlzLl9pbnNlcnRBZ2dyZWdhdGlvbihvVmFsdWVIZWxwLCBvTW9kaWZpZXIsIG9UYWJsZSk7XG5cdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHQvL1dlIGFsd2F5cyByZXNvbHZlIHRoZSBwcm9taXNlIHRvIGVuc3VyZSB0aGF0IHRoZSBhcHAgZG9lcyBub3QgY3Jhc2hcblx0XHRcdFx0TG9nLmVycm9yKGBWYWx1ZUhlbHAgbm90IGxvYWRlZCA6ICR7b0Vycm9yLm1lc3NhZ2V9YCk7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRjb25zdCBmblRlbXBsYXRlRnJhZ21lbnQgPSAob0luUHJvcGVydHlJbmZvOiBhbnksIG9WaWV3OiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IHNGcmFnbWVudE5hbWUgPSBcInNhcC5mZS5tYWNyb3MudGFibGUuQ29sdW1uXCI7XG5cblx0XHRcdGxldCBiRGlzcGxheU1vZGU7XG5cdFx0XHRsZXQgc1RhYmxlVHlwZUN1c3RvbURhdGE7XG5cdFx0XHRsZXQgc09uQ2hhbmdlQ3VzdG9tRGF0YTtcblx0XHRcdGxldCBzQ3JlYXRpb25Nb2RlQ3VzdG9tRGF0YTtcblxuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKFtcblx0XHRcdFx0RGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcImRpc3BsYXlNb2RlUHJvcGVydHlCaW5kaW5nXCIsIG9Nb2RpZmllciksXG5cdFx0XHRcdERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJ0YWJsZVR5cGVcIiwgb01vZGlmaWVyKSxcblx0XHRcdFx0RGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcIm9uQ2hhbmdlXCIsIG9Nb2RpZmllciksXG5cdFx0XHRcdERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJjcmVhdGlvbk1vZGVcIiwgb01vZGlmaWVyKVxuXHRcdFx0XSkudGhlbigoYUN1c3RvbURhdGE6IGFueVtdKSA9PiB7XG5cdFx0XHRcdGJEaXNwbGF5TW9kZSA9IGFDdXN0b21EYXRhWzBdO1xuXHRcdFx0XHRzVGFibGVUeXBlQ3VzdG9tRGF0YSA9IGFDdXN0b21EYXRhWzFdO1xuXHRcdFx0XHRzT25DaGFuZ2VDdXN0b21EYXRhID0gYUN1c3RvbURhdGFbMl07XG5cdFx0XHRcdHNDcmVhdGlvbk1vZGVDdXN0b21EYXRhID0gYUN1c3RvbURhdGFbM107XG5cdFx0XHRcdC8vIFJlYWQgT25seSBhbmQgQ29sdW1uIEVkaXQgTW9kZSBjYW4gYm90aCBoYXZlIHRocmVlIHN0YXRlXG5cdFx0XHRcdC8vIFVuZGVmaW5lZCBtZWFucyB0aGF0IHRoZSBmcmFtZXdvcmsgZGVjaWRlcyB3aGF0IHRvIGRvXG5cdFx0XHRcdC8vIFRydWUgLyBEaXNwbGF5IG1lYW5zIGFsd2F5cyByZWFkIG9ubHlcblx0XHRcdFx0Ly8gRmFsc2UgLyBFZGl0YWJsZSBtZWFucyBlZGl0YWJsZSBidXQgd2hpbGUgc3RpbGwgcmVzcGVjdGluZyB0aGUgbG93IGxldmVsIHByaW5jaXBsZSAoaW1tdXRhYmxlIHByb3BlcnR5IHdpbGwgbm90IGJlIGVkaXRhYmxlKVxuXHRcdFx0XHRjb25zdCBvRGlzcGxheU1vZGVzID0gdGhpcy5fZ2V0RGlzcGxheU1vZGUoYkRpc3BsYXlNb2RlKTtcblx0XHRcdFx0YkRpc3BsYXlNb2RlID0gb0Rpc3BsYXlNb2Rlcy5kaXNwbGF5bW9kZTtcblx0XHRcdFx0Y29uc3QgY29sdW1uRWRpdE1vZGUgPSBvRGlzcGxheU1vZGVzLmNvbHVtbkVkaXRNb2RlO1xuXG5cdFx0XHRcdGNvbnN0IG9UaGlzID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdFx0XHRlbmFibGVBdXRvQ29sdW1uV2lkdGg6IChvVGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEkpLmVuYWJsZUF1dG9Db2x1bW5XaWR0aCxcblx0XHRcdFx0XHRcdGlzT3B0aW1pemVkRm9yU21hbGxEZXZpY2U6IChvVGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEkpLmlzT3B0aW1pemVkRm9yU21hbGxEZXZpY2UsXG5cdFx0XHRcdFx0XHRyZWFkT25seTogYkRpc3BsYXlNb2RlLFxuXHRcdFx0XHRcdFx0Y29sdW1uRWRpdE1vZGU6IGNvbHVtbkVkaXRNb2RlLFxuXHRcdFx0XHRcdFx0dGFibGVUeXBlOiBzVGFibGVUeXBlQ3VzdG9tRGF0YSxcblx0XHRcdFx0XHRcdG9uQ2hhbmdlOiBzT25DaGFuZ2VDdXN0b21EYXRhLFxuXHRcdFx0XHRcdFx0aWQ6IHNUYWJsZUlkLFxuXHRcdFx0XHRcdFx0bmF2aWdhdGlvblByb3BlcnR5UGF0aDogc1Byb3BlcnR5SW5mb05hbWUsXG5cdFx0XHRcdFx0XHRjb2x1bW5JbmZvOiBvQ29sdW1uSW5mbyxcblx0XHRcdFx0XHRcdGNvbGxlY3Rpb246IHtcblx0XHRcdFx0XHRcdFx0c1BhdGg6IHNQYXRoLFxuXHRcdFx0XHRcdFx0XHRvTW9kZWw6IG9NZXRhTW9kZWxcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRjcmVhdGlvbk1vZGU6IHNDcmVhdGlvbk1vZGVDdXN0b21EYXRhXG5cdFx0XHRcdFx0fSBhcyB0YWJsZURlbGVnYXRlTW9kZWwpLFxuXHRcdFx0XHRcdG9QcmVwcm9jZXNzb3JTZXR0aW5ncyA9IHtcblx0XHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9UYWJsZUNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdGNvbGxlY3Rpb246IG9UYWJsZUNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdGRhdGFGaWVsZDogb1Byb3BlcnR5Q29udGV4dCxcblx0XHRcdFx0XHRcdFx0dGhpczogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRcdFx0XHRjb2x1bW46IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL2NvbHVtbkluZm9cIilcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcdFx0dGhpczogb1RoaXMsXG5cdFx0XHRcdFx0XHRcdGVudGl0eVNldDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0Y29sbGVjdGlvbjogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGNvbHVtbjogb1RoaXNcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRhcHBDb21wb25lbnQ6IG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnRcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdHJldHVybiBEZWxlZ2F0ZVV0aWwudGVtcGxhdGVDb250cm9sRnJhZ21lbnQoc0ZyYWdtZW50TmFtZSwgb1ByZXByb2Nlc3NvclNldHRpbmdzLCB7IHZpZXc6IG9WaWV3IH0sIG9Nb2RpZmllcikuZmluYWxseShcblx0XHRcdFx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRvVGhpcy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0YVZIUHJvcGVydGllcy5tYXAoYXN5bmMgKHNQcm9wZXJ0eU5hbWU6IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBtUGFyYW1ldGVycyA9IE9iamVjdC5hc3NpZ24oe30sIG9QYXJhbWV0ZXJzLCB7IHNQcm9wZXJ0eU5hbWU6IHNQcm9wZXJ0eU5hbWUgfSk7XG5cblx0XHRcdFx0Y29uc3QgYVJlc3VsdHMgPSBhd2FpdCBQcm9taXNlLmFsbChbXG5cdFx0XHRcdFx0RGVsZWdhdGVVdGlsLmlzVmFsdWVIZWxwUmVxdWlyZWQobVBhcmFtZXRlcnMpLFxuXHRcdFx0XHRcdERlbGVnYXRlVXRpbC5kb2VzVmFsdWVIZWxwRXhpc3QobVBhcmFtZXRlcnMpXG5cdFx0XHRcdF0pO1xuXG5cdFx0XHRcdGNvbnN0IGJWYWx1ZUhlbHBSZXF1aXJlZCA9IGFSZXN1bHRzWzBdLFxuXHRcdFx0XHRcdGJWYWx1ZUhlbHBFeGlzdHMgPSBhUmVzdWx0c1sxXTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuX2ZuVGVtcGxhdGVWYWx1ZUhlbHAoZm5UZW1wbGF0ZVZhbHVlSGVscCwgYlZhbHVlSGVscFJlcXVpcmVkLCBiVmFsdWVIZWxwRXhpc3RzKTtcblx0XHRcdH0pXG5cdFx0KTtcblx0XHQvLyBJZiB2aWV3IGlzIG5vdCBwcm92aWRlZCB0cnkgdG8gZ2V0IGl0IGJ5IGFjY2Vzc2luZyB0byB0aGUgcGFyZW50YWwgaGllcmFyY2h5XG5cdFx0Ly8gSWYgaXQgZG9lc24ndCB3b3JrICh0YWJsZSBpbnRvIGFuIHVuYXR0YWNoZWQgT1Agc2VjdGlvbikgZ2V0IHRoZSB2aWV3IHZpYSB0aGUgQXBwQ29tcG9uZW50XG5cdFx0Y29uc3QgdmlldyA9XG5cdFx0XHRtUHJvcGVydHlCYWcudmlldyB8fFxuXHRcdFx0Q29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvVGFibGUpIHx8XG5cdFx0XHQobVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCA/IENvbW1vblV0aWxzLmdldEN1cnJlbnRQYWdlVmlldyhtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50KSA6IHVuZGVmaW5lZCk7XG5cdFx0cmV0dXJuIGZuVGVtcGxhdGVGcmFnbWVudChvUHJvcGVydHlJbmZvLCB2aWV3KTtcblx0fSxcblxuXHQvKipcblx0ICogUHJvdmlkZSB0aGUgVGFibGUncyBmaWx0ZXIgZGVsZWdhdGUgdG8gcHJvdmlkZSBiYXNpYyBmaWx0ZXIgZnVuY3Rpb25hbGl0eSBzdWNoIGFzIGFkZGluZyBGaWx0ZXJGaWVsZHMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIE9iamVjdCBmb3IgdGhlIFRhYmxlcyBmaWx0ZXIgcGVyc29uYWxpemF0aW9uLlxuXHQgKi9cblx0Z2V0RmlsdGVyRGVsZWdhdGU6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbih7XG5cdFx0XHRhcGlWZXJzaW9uOiAyXG5cdFx0fSwgRmlsdGVyQmFyRGVsZWdhdGUsIHtcblx0XHRcdGFkZEl0ZW06IGZ1bmN0aW9uIChvUGFyZW50Q29udHJvbDogYW55LCBzUHJvcGVydHlJbmZvTmFtZTogYW55KSB7XG5cdFx0XHRcdGlmIChzUHJvcGVydHlJbmZvTmFtZS5pbmRleE9mKFwiUHJvcGVydHk6OlwiKSA9PT0gMCkge1xuXHRcdFx0XHRcdC8vIENvcnJlY3QgdGhlIG5hbWUgb2YgY29tcGxleCBwcm9wZXJ0eSBpbmZvIHJlZmVyZW5jZXMuXG5cdFx0XHRcdFx0c1Byb3BlcnR5SW5mb05hbWUgPSBzUHJvcGVydHlJbmZvTmFtZS5yZXBsYWNlKFwiUHJvcGVydHk6OlwiLCBcIlwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gRmlsdGVyQmFyRGVsZWdhdGUuYWRkSXRlbShvUGFyZW50Q29udHJvbCwgc1Byb3BlcnR5SW5mb05hbWUpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBUeXBlVXRpbCBhdHRhY2hlZCB0byB0aGlzIGRlbGVnYXRlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbnkgaW5zdGFuY2Ugb2YgVHlwZVV0aWxcblx0ICovXG5cdGdldFR5cGVVdGlsOiBmdW5jdGlvbiAoLypvUGF5bG9hZDogb2JqZWN0Ki8pIHtcblx0XHRyZXR1cm4gVHlwZVV0aWw7XG5cdH0sXG5cblx0Zm9ybWF0R3JvdXBIZWFkZXIob1RhYmxlOiBhbnksIG9Db250ZXh0OiBhbnksIHNQcm9wZXJ0eTogYW55KSB7XG5cdFx0Y29uc3QgbUZvcm1hdEluZm9zID0gRGVsZWdhdGVVdGlsLmdldENhY2hlZFByb3BlcnRpZXMob1RhYmxlKSxcblx0XHRcdG9Gb3JtYXRJbmZvID1cblx0XHRcdFx0bUZvcm1hdEluZm9zICYmXG5cdFx0XHRcdG1Gb3JtYXRJbmZvcy5maWx0ZXIoKG9iajogYW55KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIG9iai5uYW1lID09PSBzUHJvcGVydHk7XG5cdFx0XHRcdH0pWzBdLFxuXHRcdFx0LypGb3IgYSBEYXRlIG9yIERhdGVUaW1lIHByb3BlcnR5LCB0aGUgdmFsdWUgaXMgcmV0dXJuZWQgaW4gZXh0ZXJuYWwgZm9ybWF0IHVzaW5nIGEgVUk1IHR5cGUgZm9yIHRoZVxuXHQgICAgICAgIGdpdmVuIHByb3BlcnR5IHBhdGggdGhhdCBmb3JtYXRzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIHByb3BlcnR5J3MgRURNIHR5cGUgYW5kIGNvbnN0cmFpbnRzKi9cblx0XHRcdGJFeHRlcm5hbEZvcm1hdCA9IG9Gb3JtYXRJbmZvPy50eXBlQ29uZmlnPy5iYXNlVHlwZSA9PT0gXCJEYXRlVGltZVwiIHx8IG9Gb3JtYXRJbmZvPy50eXBlQ29uZmlnPy5iYXNlVHlwZSA9PT0gXCJEYXRlXCI7XG5cdFx0bGV0IHNWYWx1ZTtcblx0XHRpZiAob0Zvcm1hdEluZm8gJiYgb0Zvcm1hdEluZm8ubW9kZSkge1xuXHRcdFx0c3dpdGNoIChvRm9ybWF0SW5mby5tb2RlKSB7XG5cdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRcdHNWYWx1ZSA9IG9Db250ZXh0LmdldFByb3BlcnR5KG9Gb3JtYXRJbmZvLmRlc2NyaXB0aW9uUHJvcGVydHksIGJFeHRlcm5hbEZvcm1hdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uVmFsdWVcIjpcblx0XHRcdFx0XHRzVmFsdWUgPSBWYWx1ZUZvcm1hdHRlci5mb3JtYXRXaXRoQnJhY2tldHMoXG5cdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRQcm9wZXJ0eShvRm9ybWF0SW5mby5kZXNjcmlwdGlvblByb3BlcnR5LCBiRXh0ZXJuYWxGb3JtYXQpLFxuXHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0UHJvcGVydHkob0Zvcm1hdEluZm8udmFsdWVQcm9wZXJ0eSwgYkV4dGVybmFsRm9ybWF0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHRzVmFsdWUgPSBWYWx1ZUZvcm1hdHRlci5mb3JtYXRXaXRoQnJhY2tldHMoXG5cdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRQcm9wZXJ0eShvRm9ybWF0SW5mby52YWx1ZVByb3BlcnR5LCBiRXh0ZXJuYWxGb3JtYXQpLFxuXHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0UHJvcGVydHkob0Zvcm1hdEluZm8uZGVzY3JpcHRpb25Qcm9wZXJ0eSwgYkV4dGVybmFsRm9ybWF0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNWYWx1ZSA9IG9Db250ZXh0LmdldFByb3BlcnR5KG9Gb3JtYXRJbmZvPy5wYXRoLCBiRXh0ZXJuYWxGb3JtYXQpO1xuXHRcdH1cblx0XHRyZXR1cm4gZ2V0UmVzb3VyY2VNb2RlbChvVGFibGUpLmdldFRleHQoXCJNX1RBQkxFX0dST1VQX0hFQURFUl9USVRMRVwiLCBbb0Zvcm1hdEluZm8/LmxhYmVsLCBzVmFsdWVdKTtcblx0fVxufSk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztFQTZDQSxNQUFNQSw4QkFBOEIsR0FBRywrQkFBK0I7O0VBRXRFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFWQSxPQVdlQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUMsaUJBQWlCLEVBQUU7SUFDbkRDLFVBQVUsRUFBRSxDQUFDO0lBQ2I7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxtQ0FBbUMsRUFBRSxVQUFVQyxNQUFhLEVBQUVDLFNBQWMsRUFBRUMsV0FBa0IsRUFBRTtNQUNqRyxJQUFJRCxTQUFTLENBQUNFLElBQUksQ0FBQ0MsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3pFLE1BQU1DLE9BQU8sR0FBR0wsTUFBTSxDQUFDTSxVQUFVLEVBQUUsQ0FBQ0MsSUFBSSxDQUFDLFVBQVVDLElBQVMsRUFBRTtVQUM3RCxP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
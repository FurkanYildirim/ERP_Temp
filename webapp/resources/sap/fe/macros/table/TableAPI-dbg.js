/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/editFlow/NotApplicableContextDialog", "sap/fe/core/controllerextensions/routing/NavigationReason", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/PasteHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/macros/chart/ChartUtils", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/table/Utils", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/message/Message", "sap/ui/model/Filter", "../insights/CommonInsightsHelper", "../insights/InsightsCardHelper", "../MacroAPI", "./TableHelper"], function (Log, CommonUtils, NotApplicableContextDialog, NavigationReason, ManifestSettings, MetaModelConverter, ClassSupport, DeleteHelper, PasteHelper, ResourceModelHelper, ChartUtils, FilterUtils, TableUtils, MessageBox, Core, Message, Filter, CommonInsightsHelper, InsightsCardHelper, MacroAPI, TableHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31, _descriptor32, _descriptor33, _descriptor34;
  var showInsightsCardPreview = InsightsCardHelper.showInsightsCardPreview;
  var IntegrationCardType = InsightsCardHelper.IntegrationCardType;
  var genericErrorMessageForInsightsCard = InsightsCardHelper.genericErrorMessageForInsightsCard;
  var getInsightsRelevantColumns = CommonInsightsHelper.getInsightsRelevantColumns;
  var createInsightsParams = CommonInsightsHelper.createInsightsParams;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var getLocalizedText = ResourceModelHelper.getLocalizedText;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  var convertTypes = MetaModelConverter.convertTypes;
  var CreationMode = ManifestSettings.CreationMode;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block used to create a table based on the metadata provided by OData V4.
   * <br>
   * Usually, a LineItem or PresentationVariant annotation is expected, but the Table building block can also be used to display an EntitySet.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Table id="MyTable" metaPath="@com.sap.vocabularies.UI.v1.LineItem" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Table
   * @public
   */
  let TableAPI = (_dec = defineUI5Class("sap.fe.macros.table.TableAPI", {
    returnTypes: ["sap.fe.macros.MacroAPI"]
  }), _dec2 = property({
    type: "string",
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.PresentationVariant", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant"]
  }), _dec3 = property({
    type: "string",
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"]
  }), _dec4 = property({
    type: "object"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "boolean"
  }), _dec7 = property({
    type: "string"
  }), _dec8 = property({
    type: "boolean",
    defaultValue: false
  }), _dec9 = property({
    type: "string",
    defaultValue: "ResponsiveTable",
    allowedValues: ["GridTable", "ResponsiveTable"]
  }), _dec10 = property({
    type: "boolean",
    defaultValue: true
  }), _dec11 = property({
    type: "boolean",
    defaultValue: false
  }), _dec12 = property({
    type: "boolean",
    defaultValue: false
  }), _dec13 = property({
    type: "string"
  }), _dec14 = property({
    type: "string",
    allowedValues: ["None", "Single", "Multi", "Auto"]
  }), _dec15 = property({
    type: "string"
  }), _dec16 = property({
    type: "boolean",
    defaultValue: true
  }), _dec17 = property({
    type: "boolean",
    defaultValue: false
  }), _dec18 = property({
    type: "boolean",
    defaultValue: true
  }), _dec19 = property({
    type: "number"
  }), _dec20 = aggregation({
    type: "sap.fe.macros.table.Action",
    multiple: true
  }), _dec21 = aggregation({
    type: "sap.fe.macros.table.Column",
    multiple: true
  }), _dec22 = property({
    type: "boolean",
    defaultValue: false
  }), _dec23 = property({
    type: "boolean",
    defaultValue: false
  }), _dec24 = property({
    type: "boolean",
    defaultValue: false
  }), _dec25 = property({
    type: "boolean",
    defaultValue: false
  }), _dec26 = property({
    type: "boolean",
    defaultValue: false
  }), _dec27 = event(), _dec28 = event(), _dec29 = event(), _dec30 = event(), _dec31 = property({
    type: "boolean | string",
    defaultValue: true
  }), _dec32 = property({
    type: "string",
    allowedValues: ["Control"]
  }), _dec33 = property({
    type: "string"
  }), _dec34 = property({
    type: "boolean",
    defaultValue: true
  }), _dec35 = event(), _dec36 = xmlEventHandler(), _dec37 = xmlEventHandler(), _dec38 = xmlEventHandler(), _dec39 = xmlEventHandler(), _dec40 = xmlEventHandler(), _dec41 = xmlEventHandler(), _dec42 = xmlEventHandler(), _dec43 = xmlEventHandler(), _dec44 = xmlEventHandler(), _dec45 = xmlEventHandler(), _dec46 = xmlEventHandler(), _dec47 = xmlEventHandler(), _dec48 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(TableAPI, _MacroAPI);
    function TableAPI(mSettings) {
      var _this;
      for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        others[_key - 1] = arguments[_key];
      }
      _this = _MacroAPI.call(this, mSettings, ...others) || this;
      _initializerDefineProperty(_this, "metaPath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDefinition", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entityTypeFullyQualifiedName", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "busy", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "type", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableExport", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enablePaste", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFullScreen", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableAutoColumnWidth", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isOptimizedForSmallDevice", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "frozenColumnCount", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "columns", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataInitialized", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "bindingSuspended", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "outDatedBinding", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pendingRequest", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "emptyRowsEnabled", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "rowPress", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextChange", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalDataRequested", _descriptor29, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor30, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor31, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menu", _descriptor32, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isSearchable", _descriptor33, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor34, _assertThisInitialized(_this));
      _this.updateFilterBar();
      if (_this.content) {
        _this.content.attachEvent("selectionChange", {}, _this.onTableSelectionChange, _assertThisInitialized(_this));
      }
      return _this;
    }

    /**
     * Defines the relative path of the property in the metamodel, based on the current contextPath.
     *
     * @public
     */
    /**
     * Gets the relevant tableAPI for a UI5 event.
     * An event can be triggered either by the inner control (the table) or the Odata listBinding
     * The first initiator is the usual one so it's managed by the MacroAPI whereas
     * the second one is specific to this API and has to managed by the TableAPI.
     *
     * @param ui5Event The UI5 event
     * @returns The TableAPI or false if not found
     * @private
     */
    TableAPI.getAPI = function getAPI(ui5Event) {
      const source = ui5Event.getSource();
      let tableAPI;
      if (source.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        var _this$instanceMap, _this$instanceMap$get;
        tableAPI = (_this$instanceMap = this.instanceMap) === null || _this$instanceMap === void 0 ? void 0 : (_this$instanceMap$get = _this$instanceMap.get(this)) === null || _this$instanceMap$get === void 0 ? void 0 : _this$instanceMap$get.find(api => {
          var _api$content;
          return ((_api$content = api.content) === null || _api$content === void 0 ? void 0 : _api$content.getRowBinding()) === source;
        });
      }
      return tableAPI || _MacroAPI.getAPI.call(this, ui5Event);
    }

    /**
     * Gets contexts from the table that have been selected by the user.
     *
     * @returns Contexts of the rows selected by the user
     * @public
     */;
    var _proto = TableAPI.prototype;
    _proto.getSelectedContexts = function getSelectedContexts() {
      return this.content.getSelectedContexts();
    }

    /**
     * Adds a message to the table.
     *
     * The message applies to the whole table and not to an individual table row.
     *
     * @param [parameters] The parameters to create the message
     * @param parameters.type Message type
     * @param parameters.message Message text
     * @param parameters.description Message description
     * @param parameters.persistent True if the message is persistent
     * @returns The ID of the message
     * @public
     */;
    _proto.addMessage = function addMessage(parameters) {
      const msgManager = this._getMessageManager();
      const oTable = this.content;
      const oMessage = new Message({
        target: oTable.getRowBinding().getResolvedPath(),
        type: parameters.type,
        message: parameters.message,
        processor: oTable.getModel(),
        description: parameters.description,
        persistent: parameters.persistent
      });
      msgManager.addMessages(oMessage);
      return oMessage.getId();
    }

    /**
     * Removes a message from the table.
     *
     * @param id The id of the message
     * @public
     */;
    _proto.removeMessage = function removeMessage(id) {
      const msgManager = this._getMessageManager();
      const messages = msgManager.getMessageModel().getData();
      const result = messages.find(e => e.id === id);
      if (result) {
        msgManager.removeMessages(result);
      }
    }

    /**
     * Updates the counts displayed into the quickFilter selector.
     *
     * @returns  Promise resolves once the counts are updated
     */;
    _proto.updateQuickFilterCounts = async function updateQuickFilterCounts() {
      var _CommonUtils$getTarge, _getChartControl, _ref;
      const table = this.content,
        selector = table.getQuickFilter(),
        controller = (_CommonUtils$getTarge = CommonUtils.getTargetView(this)) === null || _CommonUtils$getTarge === void 0 ? void 0 : _CommonUtils$getTarge.getController(),
        svItems = selector.getItems(),
        internalContext = table.getBindingContext("internal"),
        bindingPromises = [],
        currentFilterKey = selector.getSelectedKey();
      const quickFilterCounts = {};
      let chartFilters = [];
      if (!controller || !internalContext) {
        return Promise.resolve();
      }

      // Add filters related to the chart for ALP
      const chart = (_getChartControl = (_ref = controller).getChartControl) === null || _getChartControl === void 0 ? void 0 : _getChartControl.call(_ref);
      const chartAPI = chart && chart.getParent();
      if (chartAPI && chartAPI.hasSelections()) {
        const chartFilterInfo = ChartUtils.getAllFilterInfo(chart);
        if (chartFilterInfo.filters.length) {
          chartFilterInfo.filters = CommonUtils.getChartPropertiesWithoutPrefixes(chartFilterInfo.filters);
          chartFilters = [new Filter({
            filters: chartFilterInfo.filters,
            and: true
          })];
        }
      }
      const additionalFilters = [...TableUtils.getHiddenFilters(table), ...chartFilters];
      for (const k in svItems) {
        const itemKey = svItems[k].getKey(),
          filterInfos = CommonUtils.getFiltersInfoForSV(table, itemKey);
        quickFilterCounts[k] = "...";
        bindingPromises.push(TableUtils.getListBindingForCount(table, table.getBindingContext(), {
          batchGroupId: itemKey === currentFilterKey ? "$auto.Workers" : "$auto",
          additionalFilters: [...additionalFilters, ...filterInfos.filters]
        }));
      }
      internalContext.setProperty("quickFilters", {
        counts: quickFilterCounts
      });
      try {
        const counts = await Promise.all(bindingPromises);
        for (const k in counts) {
          internalContext.setProperty(`quickFilters/counts/${k}`, TableUtils.getCountFormatted(counts[k]));
        }
      } catch (error) {
        Log.error("Error while retrieving the binding promises", error);
      }
    };
    _proto._getMessageManager = function _getMessageManager() {
      return sap.ui.getCore().getMessageManager();
    }

    /**
     * An event triggered when the selection in the table changes.
     *
     * @public
     */;
    _proto._getRowBinding = function _getRowBinding() {
      const oTable = this.getContent();
      return oTable.getRowBinding();
    };
    _proto.getCounts = function getCounts() {
      const oTable = this.getContent();
      return TableUtils.getListBindingForCount(oTable, oTable.getBindingContext(), {
        batchGroupId: !this.getProperty("bindingSuspended") ? oTable.data("batchGroupId") : "$auto",
        additionalFilters: TableUtils.getHiddenFilters(oTable)
      }).then(iValue => {
        return TableUtils.getCountFormatted(iValue);
      }).catch(() => {
        return "0";
      });
    }

    /**
     * Handles the context change on the table.
     * An event is fired to propagate the OdataListBinding event and the enablement
     * of the creation row is calculated.
     *
     * @param ui5Event The UI5 event
     */;
    _proto.onContextChange = function onContextChange(ui5Event) {
      this.fireEvent("contextChange", ui5Event.getParameters());
      this.setFastCreationRowEnablement();
    }

    /**
     * Handles the change on a quickFilter
     * The table is rebound if the FilterBar is not suspended and update the AppState.
     *
     */;
    _proto.onQuickFilterSelectionChange = function onQuickFilterSelectionChange() {
      var _filterBar$getSuspend, _CommonUtils$getTarge2, _CommonUtils$getTarge3;
      const table = this.content;
      // Rebind the table to reflect the change in quick filter key.
      // We don't rebind the table if the filterBar for the table is suspended
      // as rebind will be done when the filterBar is resumed
      const filterBarID = table.getFilter();
      const filterBar = filterBarID && Core.byId(filterBarID);
      if (!(filterBar !== null && filterBar !== void 0 && (_filterBar$getSuspend = filterBar.getSuspendSelection) !== null && _filterBar$getSuspend !== void 0 && _filterBar$getSuspend.call(filterBar))) {
        table.rebind();
      }
      (_CommonUtils$getTarge2 = CommonUtils.getTargetView(this)) === null || _CommonUtils$getTarge2 === void 0 ? void 0 : (_CommonUtils$getTarge3 = _CommonUtils$getTarge2.getController()) === null || _CommonUtils$getTarge3 === void 0 ? void 0 : _CommonUtils$getTarge3.getExtensionAPI().updateAppState();
    };
    _proto.onTableRowPress = function onTableRowPress(oEvent, oController, oContext, mParameters) {
      // prevent navigation to an empty row
      if (oContext && oContext.isInactive() && oContext.isTransient()) {
        return false;
      }
      // In the case of an analytical table, if we're trying to navigate to a context corresponding to a visual group or grand total
      // --> Cancel navigation
      if (this.getTableDefinition().enableAnalytics && oContext && oContext.isA("sap.ui.model.odata.v4.Context") && typeof oContext.getProperty("@$ui5.node.isExpanded") === "boolean") {
        return false;
      } else {
        const navigationParameters = Object.assign({}, mParameters, {
          reason: NavigationReason.RowPress
        });
        oController._routing.navigateForwardToContext(oContext, navigationParameters);
      }
    };
    _proto.onInternalPatchCompleted = function onInternalPatchCompleted() {
      // BCP: 2380023090
      // We handle enablement of Delete for the table here.
      // EditFlow.ts#handlePatchSent is handling the action enablement.
      const internalModelContext = this.getBindingContext("internal");
      const selectedContexts = this.getSelectedContexts();
      DeleteHelper.updateDeleteInfoForSelectedContexts(internalModelContext, selectedContexts);
    };
    _proto.onInternalDataReceived = function onInternalDataReceived(oEvent) {
      if (oEvent.getParameter("error")) {
        this.getController().messageHandler.showMessageDialog();
      }
    };
    _proto.onInternalDataRequested = function onInternalDataRequested(oEvent) {
      var _this$getTableDefinit, _this$getTableDefinit2;
      const table = this.content;
      this.setProperty("dataInitialized", true);
      this.fireEvent("internalDataRequested", oEvent.getParameters());
      if (table.getQuickFilter() && (_this$getTableDefinit = this.getTableDefinition().control.filters) !== null && _this$getTableDefinit !== void 0 && (_this$getTableDefinit2 = _this$getTableDefinit.quickFilters) !== null && _this$getTableDefinit2 !== void 0 && _this$getTableDefinit2.showCounts) {
        this.updateQuickFilterCounts();
      }
    };
    _proto.onPaste = function onPaste(oEvent, oController) {
      // If paste is disable or if we're not in edit mode, we can't paste anything
      if (!this.tableDefinition.control.enablePaste || !this.getModel("ui").getProperty("/isEditable")) {
        return;
      }
      const aRawPastedData = oEvent.getParameter("data"),
        oTable = oEvent.getSource();
      if (oTable.getEnablePaste() === true) {
        PasteHelper.pasteData(aRawPastedData, oTable, oController);
      } else {
        const oResourceModel = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");
        MessageBox.error(oResourceModel.getText("T_OP_CONTROLLER_SAPFE_PASTE_DISABLED_MESSAGE"), {
          title: oResourceModel.getText("C_COMMON_SAPFE_ERROR")
        });
      }
    }

    // This event will allow us to intercept the export before is triggered to cover specific cases
    // that couldn't be addressed on the propertyInfos for each column.
    // e.g. Fixed Target Value for the datapoints
    ;
    _proto.onBeforeExport = function onBeforeExport(exportEvent) {
      const isSplitMode = exportEvent.getParameter("userExportSettings").splitCells,
        tableController = exportEvent.getSource(),
        exportSettings = exportEvent.getParameter("exportSettings"),
        tableDefinition = this.getTableDefinition();
      TableAPI.updateExportSettings(exportSettings, tableDefinition, tableController, isSplitMode);
    }

    /**
     * Handles the MDC DataStateIndicator plugin to display messageStrip on a table.
     *
     * @param oMessage
     * @param oTable
     * @name dataStateFilter
     * @returns Whether to render the messageStrip visible
     */;
    TableAPI.dataStateIndicatorFilter = function dataStateIndicatorFilter(oMessage, oTable) {
      var _oTable$getBindingCon;
      const sTableContextBindingPath = (_oTable$getBindingCon = oTable.getBindingContext()) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getPath();
      const sTableRowBinding = (sTableContextBindingPath ? `${sTableContextBindingPath}/` : "") + oTable.getRowBinding().getPath();
      return sTableRowBinding === oMessage.getTarget() ? true : false;
    }

    /**
     * This event handles the DataState of the DataStateIndicator plugin from MDC on a table.
     * It's fired when new error messages are sent from the backend to update row highlighting.
     *
     * @name onDataStateChange
     * @param oEvent Event object
     */;
    _proto.onDataStateChange = function onDataStateChange(oEvent) {
      const oDataStateIndicator = oEvent.getSource();
      const aFilteredMessages = oEvent.getParameter("filteredMessages");
      if (aFilteredMessages) {
        const oInternalModel = oDataStateIndicator.getModel("internal");
        oInternalModel.setProperty("filteredMessages", aFilteredMessages, oDataStateIndicator.getBindingContext("internal"));
      }
    }

    /**
     * Updates the columns to be exported of a table.
     *
     * @param exportSettings The table export settings
     * @param tableDefinition The table definition from the table converter
     * @param tableController The table controller
     * @param isSplitMode Defines if the export has been launched using split mode
     * @returns The updated columns to be exported
     */;
    TableAPI.updateExportSettings = function updateExportSettings(exportSettings, tableDefinition, tableController, isSplitMode) {
      //Set static sizeLimit during export
      const columns = tableDefinition.columns;
      if (!tableDefinition.enableAnalytics && (tableDefinition.control.type === "ResponsiveTable" || tableDefinition.control.type === "GridTable")) {
        exportSettings.dataSource.sizeLimit = 1000;
      }
      const exportColumns = exportSettings.workbook.columns;
      for (let index = exportColumns.length - 1; index >= 0; index--) {
        const exportColumn = exportColumns[index];
        const resourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
        exportColumn.label = getLocalizedText(exportColumn.label, tableController);
        //translate boolean values
        if (exportColumn.type === "Boolean") {
          exportColumn.falseValue = resourceBundle.getText("no");
          exportColumn.trueValue = resourceBundle.getText("yes");
        }
        const targetValueColumn = columns === null || columns === void 0 ? void 0 : columns.find(column => {
          if (isSplitMode) {
            return this.columnWithTargetValueToBeAdded(column, exportColumn);
          } else {
            return false;
          }
        });
        if (targetValueColumn) {
          const columnToBeAdded = {
            label: resourceBundle.getText("TargetValue"),
            property: Array.isArray(exportColumn.property) ? exportColumn.property : [exportColumn.property],
            template: targetValueColumn.exportDataPointTargetValue
          };
          exportColumns.splice(index + 1, 0, columnToBeAdded);
        }
      }
      return exportSettings;
    }

    /**
     * Defines if a column that is to be exported and contains a DataPoint with a fixed target value needs to be added.
     *
     * @param column The column from the annotations column
     * @param columnExport The column to be exported
     * @returns `true` if the referenced column has defined a targetValue for the dataPoint, false else
     * @private
     */;
    TableAPI.columnWithTargetValueToBeAdded = function columnWithTargetValueToBeAdded(column, columnExport) {
      var _column$propertyInfos;
      let columnNeedsToBeAdded = false;
      if (column.exportDataPointTargetValue && ((_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.length) === 1) {
        //Add TargetValue column when exporting on split mode
        if (column.relativePath === columnExport.property || columnExport.property[0] === column.propertyInfos[0] || columnExport.property.includes(column.relativePath) || columnExport.property.includes(column.name)) {
          // part of a FieldGroup or from a lineItem or from a column on the entitySet
          delete columnExport.template;
          columnNeedsToBeAdded = true;
        }
      }
      return columnNeedsToBeAdded;
    };
    _proto.resumeBinding = function resumeBinding(bRequestIfNotInitialized) {
      this.setProperty("bindingSuspended", false);
      if (bRequestIfNotInitialized && !this.getDataInitialized() || this.getProperty("outDatedBinding")) {
        var _getContent;
        this.setProperty("outDatedBinding", false);
        (_getContent = this.getContent()) === null || _getContent === void 0 ? void 0 : _getContent.rebind();
      }
    };
    _proto.refreshNotApplicableFields = function refreshNotApplicableFields(oFilterControl) {
      const oTable = this.getContent();
      return FilterUtils.getNotApplicableFilters(oFilterControl, oTable);
    };
    _proto.suspendBinding = function suspendBinding() {
      this.setProperty("bindingSuspended", true);
    };
    _proto.invalidateContent = function invalidateContent() {
      this.setProperty("dataInitialized", false);
      this.setProperty("outDatedBinding", false);
    }

    /**
     * Sets the enablement of the creation row.
     * @private
     *
     */;
    _proto.setFastCreationRowEnablement = function setFastCreationRowEnablement() {
      const table = this.content;
      const fastCreationRow = table.getCreationRow();
      if (fastCreationRow && !fastCreationRow.getBindingContext()) {
        const tableBinding = table.getRowBinding();
        const bindingContext = tableBinding.getContext();
        if (bindingContext) {
          TableHelper.enableFastCreationRow(fastCreationRow, tableBinding.getPath(), bindingContext, bindingContext.getModel(), table.getModel("ui").getProperty("/isEditable"));
        }
      }
    }

    /**
     * Event handler to create insightsParams and call the API to show insights card preview for table.
     *
     * @returns Undefined if card preview is rendered.
     */;
    _proto.onAddCardToInsightsPressed = async function onAddCardToInsightsPressed() {
      try {
        const insightsRelevantColumns = getInsightsRelevantColumns(this);
        const insightsParams = await createInsightsParams(this, IntegrationCardType.table, insightsRelevantColumns);
        if (insightsParams) {
          showInsightsCardPreview(insightsParams);
          return;
        }
      } catch (e) {
        genericErrorMessageForInsightsCard(this.content);
        Log.error(e);
      }
    };
    _proto.onMassEditButtonPressed = function onMassEditButtonPressed(oEvent, pageController) {
      const oTable = this.content;
      if (pageController && pageController.massEdit) {
        pageController.massEdit.openMassEditDialog(oTable);
      } else {
        Log.warning("The Controller is not enhanced with Mass Edit functionality");
      }
    };
    _proto.onTableSelectionChange = function onTableSelectionChange(oEvent) {
      this.fireEvent("selectionChange", oEvent.getParameters());
    };
    _proto.onActionPress = async function onActionPress(oEvent, pageController, actionName, parameters) {
      parameters.model = oEvent.getSource().getModel();
      let executeAction = true;
      if (parameters.notApplicableContexts && parameters.notApplicableContexts.length > 0) {
        // If we have non applicable contexts, we need to open a dialog to ask the user if he wants to continue
        const convertedMetadata = convertTypes(parameters.model.getMetaModel());
        const entityType = convertedMetadata.resolvePath(this.entityTypeFullyQualifiedName).target;
        const myUnapplicableContextDialog = new NotApplicableContextDialog({
          entityType: entityType,
          notApplicableContexts: parameters.notApplicableContexts,
          title: parameters.label,
          resourceModel: getResourceModel(this)
        });
        parameters.contexts = parameters.applicableContexts;
        executeAction = await myUnapplicableContextDialog.open(this);
      }
      if (executeAction) {
        // Direct execution of the action
        try {
          return await pageController.editFlow.invokeAction(actionName, parameters);
        } catch (e) {
          Log.info(e);
        }
      }
    }

    /**
     * Expose the internal table definition for external usage in delegate.
     *
     * @returns The tableDefinition
     */;
    _proto.getTableDefinition = function getTableDefinition() {
      return this.tableDefinition;
    }

    /**
     * connect the filter to the tableAPI if required
     *
     * @private
     * @alias sap.fe.macros.TableAPI
     */;
    _proto.updateFilterBar = function updateFilterBar() {
      const table = this.getContent();
      const filterBarRefId = this.getFilterBar();
      if (table && filterBarRefId && table.getFilter() !== filterBarRefId) {
        this._setFilterBar(filterBarRefId);
      }
    }

    /**
     * Sets the filter depending on the type of filterBar.
     *
     * @param filterBarRefId Id of the filter bar
     * @private
     * @alias sap.fe.macros.TableAPI
     */;
    _proto._setFilterBar = function _setFilterBar(filterBarRefId) {
      var _CommonUtils$getTarge4;
      const table = this.getContent();

      // 'filterBar' property of macro:Table(passed as customData) might be
      // 1. A localId wrt View(FPM explorer example).
      // 2. Absolute Id(this was not supported in older versions).
      // 3. A localId wrt FragmentId(when an XMLComposite or Fragment is independently processed) instead of ViewId.
      //    'filterBar' was supported earlier as an 'association' to the 'mdc:Table' control inside 'macro:Table' in prior versions.
      //    In newer versions 'filterBar' is used like an association to 'macro:TableAPI'.
      //    This means that the Id is relative to 'macro:TableAPI'.
      //    This scenario happens in case of FilterBar and Table in a custom sections in OP of FEV4.

      const tableAPIId = this === null || this === void 0 ? void 0 : this.getId();
      const tableAPILocalId = this.data("tableAPILocalId");
      const potentialfilterBarId = tableAPILocalId && filterBarRefId && tableAPIId && tableAPIId.replace(new RegExp(tableAPILocalId + "$"), filterBarRefId); // 3

      const filterBar = ((_CommonUtils$getTarge4 = CommonUtils.getTargetView(this)) === null || _CommonUtils$getTarge4 === void 0 ? void 0 : _CommonUtils$getTarge4.byId(filterBarRefId)) || Core.byId(filterBarRefId) || Core.byId(potentialfilterBarId);
      if (filterBar) {
        if (filterBar.isA("sap.fe.macros.filterBar.FilterBarAPI")) {
          table.setFilter(`${filterBar.getId()}-content`);
        } else if (filterBar.isA("sap.ui.mdc.FilterBar")) {
          table.setFilter(filterBar.getId());
        }
      }
    };
    _proto.checkIfColumnExists = function checkIfColumnExists(aFilteredColummns, columnName) {
      return aFilteredColummns.some(function (oColumn) {
        if ((oColumn === null || oColumn === void 0 ? void 0 : oColumn.columnName) === columnName && oColumn !== null && oColumn !== void 0 && oColumn.sColumnNameVisible || (oColumn === null || oColumn === void 0 ? void 0 : oColumn.sTextArrangement) !== undefined && (oColumn === null || oColumn === void 0 ? void 0 : oColumn.sTextArrangement) === columnName) {
          return columnName;
        }
      });
    };
    _proto.getIdentifierColumn = function getIdentifierColumn() {
      const oTable = this.getContent();
      const headerInfoTitlePath = this.getTableDefinition().headerInfoTitle;
      const oMetaModel = oTable && oTable.getModel().getMetaModel(),
        sCurrentEntitySetName = oTable.data("metaPath");
      const aTechnicalKeys = oMetaModel.getObject(`${sCurrentEntitySetName}/$Type/$Key`);
      const aFilteredTechnicalKeys = [];
      if (aTechnicalKeys && aTechnicalKeys.length > 0) {
        aTechnicalKeys.forEach(function (technicalKey) {
          if (technicalKey !== "IsActiveEntity") {
            aFilteredTechnicalKeys.push(technicalKey);
          }
        });
      }
      const semanticKeyColumns = this.getTableDefinition().semanticKeys;
      const aVisibleColumns = [];
      const aFilteredColummns = [];
      const aTableColumns = oTable.getColumns();
      aTableColumns.forEach(function (oColumn) {
        const column = oColumn === null || oColumn === void 0 ? void 0 : oColumn.getDataProperty();
        aVisibleColumns.push(column);
      });
      aVisibleColumns.forEach(function (oColumn) {
        var _oTextArrangement$Co, _oTextArrangement$Co2;
        const oTextArrangement = oMetaModel.getObject(`${sCurrentEntitySetName}/$Type/${oColumn}@`);
        const sTextArrangement = oTextArrangement && ((_oTextArrangement$Co = oTextArrangement["@com.sap.vocabularies.Common.v1.Text"]) === null || _oTextArrangement$Co === void 0 ? void 0 : _oTextArrangement$Co.$Path);
        const sTextPlacement = oTextArrangement && ((_oTextArrangement$Co2 = oTextArrangement["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) === null || _oTextArrangement$Co2 === void 0 ? void 0 : _oTextArrangement$Co2.$EnumMember);
        aFilteredColummns.push({
          columnName: oColumn,
          sTextArrangement: sTextArrangement,
          sColumnNameVisible: !(sTextPlacement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly")
        });
      });
      let column;
      if (headerInfoTitlePath !== undefined && this.checkIfColumnExists(aFilteredColummns, headerInfoTitlePath)) {
        column = headerInfoTitlePath;
      } else if (semanticKeyColumns !== undefined && semanticKeyColumns.length === 1 && this.checkIfColumnExists(aFilteredColummns, semanticKeyColumns[0])) {
        column = semanticKeyColumns[0];
      } else if (aFilteredTechnicalKeys !== undefined && aFilteredTechnicalKeys.length === 1 && this.checkIfColumnExists(aFilteredColummns, aFilteredTechnicalKeys[0])) {
        column = aFilteredTechnicalKeys[0];
      }
      return column;
    }

    /**
     * EmptyRowsEnabled setter.
     *
     * @param enablement
     */;
    _proto.setEmptyRowsEnabled = function setEmptyRowsEnabled(enablement) {
      this.setProperty("emptyRowsEnabled", enablement);
      this.setUpEmptyRows(this.content);
    };
    _proto.setUpEmptyRows = async function setUpEmptyRows(table) {
      var _this$tableDefinition, _this$tableDefinition2, _table$getBindingCont;
      let createButtonWasPressed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (((_this$tableDefinition = this.tableDefinition.control) === null || _this$tableDefinition === void 0 ? void 0 : _this$tableDefinition.creationMode) !== CreationMode.InlineCreationRows) {
        return;
      }
      const uiModel = table.getModel("ui");
      if (!uiModel) {
        return;
      }
      if (uiModel.getProperty("/isEditablePending")) {
        // The edit mode is still being computed, so we wait until this computation is done before checking its value
        const watchBinding = uiModel.bindProperty("/isEditablePending");
        await new Promise(resolve => {
          const fnHandler = () => {
            watchBinding.detachChange(fnHandler);
            watchBinding.destroy();
            resolve();
          };
          watchBinding.attachChange(fnHandler);
        });
      }
      const isInEditMode = uiModel.getProperty("/isEditable");
      if (!isInEditMode) {
        return;
      }
      if ((_this$tableDefinition2 = this.tableDefinition.control) !== null && _this$tableDefinition2 !== void 0 && _this$tableDefinition2.inlineCreationRowsHiddenInEditMode && !((_table$getBindingCont = table.getBindingContext("ui")) !== null && _table$getBindingCont !== void 0 && _table$getBindingCont.getProperty("createMode")) && !createButtonWasPressed) {
        return;
      }
      const binding = table.getRowBinding();
      if (binding.isResolved() && binding.isLengthFinal()) {
        const contextPath = binding.getContext().getPath();
        if (!this.emptyRowsEnabled) {
          return this._deleteEmptyRows(binding, contextPath);
        }
        const inactiveContext = binding.getAllCurrentContexts().find(function (context) {
          // when this is called from controller code we need to check that inactive contexts are still relative to the current table context
          return context.isInactive() === true && context.getPath().startsWith(contextPath);
        });
        if (!inactiveContext) {
          await this._createEmptyRow(binding, table);
        }
      }
    }

    /**
     * Deletes inactive rows from the table listBinding.
     *
     * @param binding
     * @param contextPath
     */;
    _proto._deleteEmptyRows = function _deleteEmptyRows(binding, contextPath) {
      for (const context of binding.getAllCurrentContexts()) {
        if (context.isInactive() === true && context.getPath().startsWith(contextPath)) {
          context.delete();
        }
      }
    };
    _proto._createEmptyRow = async function _createEmptyRow(oBinding, oTable) {
      var _this$tableDefinition3;
      const iInlineCreationRowCount = ((_this$tableDefinition3 = this.tableDefinition.control) === null || _this$tableDefinition3 === void 0 ? void 0 : _this$tableDefinition3.inlineCreationRowCount) || 2;
      const aData = [];
      for (let i = 0; i < iInlineCreationRowCount; i += 1) {
        aData.push({});
      }
      const bAtEnd = oTable.data("tableType") !== "ResponsiveTable";
      const bInactive = true;
      const oView = CommonUtils.getTargetView(oTable);
      const oController = oView.getController();
      const editFlow = oController.editFlow;
      if (!this.creatingEmptyRows) {
        this.creatingEmptyRows = true;
        try {
          const aContexts = await editFlow.createMultipleDocuments(oBinding, aData, bAtEnd, false, oController.editFlow.onBeforeCreate, bInactive);
          aContexts === null || aContexts === void 0 ? void 0 : aContexts.forEach(function (oContext) {
            oContext.created().catch(function (oError) {
              if (!oError.canceled) {
                throw oError;
              }
            });
          });
        } catch (e) {
          Log.error(e);
        } finally {
          this.creatingEmptyRows = false;
        }
      }
    };
    return TableAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "tableDefinition", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "entityTypeFullyQualifiedName", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "busy", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "type", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "enableExport", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "enablePaste", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "enableFullScreen", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "enableAutoColumnWidth", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "isOptimizedForSmallDevice", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "frozenColumnCount", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "columns", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "dataInitialized", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "bindingSuspended", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "outDatedBinding", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "pendingRequest", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "emptyRowsEnabled", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "rowPress", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "contextChange", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "internalDataRequested", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec31], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor31 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec32], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor32 = _applyDecoratedDescriptor(_class2.prototype, "menu", [_dec33], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor33 = _applyDecoratedDescriptor(_class2.prototype, "isSearchable", [_dec34], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor34 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec35], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "onContextChange", [_dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "onContextChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onQuickFilterSelectionChange", [_dec37], Object.getOwnPropertyDescriptor(_class2.prototype, "onQuickFilterSelectionChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onTableRowPress", [_dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "onTableRowPress"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalPatchCompleted", [_dec39], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalPatchCompleted"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataReceived", [_dec40], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataReceived"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataRequested", [_dec41], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataRequested"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPaste", [_dec42], Object.getOwnPropertyDescriptor(_class2.prototype, "onPaste"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeExport", [_dec43], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeExport"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onDataStateChange", [_dec44], Object.getOwnPropertyDescriptor(_class2.prototype, "onDataStateChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAddCardToInsightsPressed", [_dec45], Object.getOwnPropertyDescriptor(_class2.prototype, "onAddCardToInsightsPressed"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onMassEditButtonPressed", [_dec46], Object.getOwnPropertyDescriptor(_class2.prototype, "onMassEditButtonPressed"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onTableSelectionChange", [_dec47], Object.getOwnPropertyDescriptor(_class2.prototype, "onTableSelectionChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onActionPress", [_dec48], Object.getOwnPropertyDescriptor(_class2.prototype, "onActionPress"), _class2.prototype)), _class2)) || _class);
  return TableAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWJsZUFQSSIsImRlZmluZVVJNUNsYXNzIiwicmV0dXJuVHlwZXMiLCJwcm9wZXJ0eSIsInR5cGUiLCJleHBlY3RlZFR5cGVzIiwiZXhwZWN0ZWRBbm5vdGF0aW9ucyIsImRlZmF1bHRWYWx1ZSIsImFsbG93ZWRWYWx1ZXMiLCJhZ2dyZWdhdGlvbiIsIm11bHRpcGxlIiwiZXZlbnQiLCJ4bWxFdmVudEhhbmRsZXIiLCJtU2V0dGluZ3MiLCJvdGhlcnMiLCJ1cGRhdGVGaWx0ZXJCYXIiLCJjb250ZW50IiwiYXR0YWNoRXZlbnQiLCJvblRhYmxlU2VsZWN0aW9uQ2hhbmdlIiwiZ2V0QVBJIiwidWk1RXZlbnQiLCJzb3VyY2UiLCJnZXRTb3VyY2UiLCJ0YWJsZUFQSSIsImlzQSIsImluc3RhbmNlTWFwIiwiZ2V0IiwiZmluZCIsImFwaSIsImdldFJvd0JpbmRpbmciLCJnZXRTZWxlY3RlZENvbnRleHRzIiwiYWRkTWVzc2FnZSIsInBhcmFtZXRlcnMiLCJtc2dNYW5hZ2VyIiwiX2dldE1lc3NhZ2VNYW5hZ2VyIiwib1RhYmxlIiwib01lc3NhZ2UiLCJNZXNzYWdlIiwidGFyZ2V0IiwiZ2V0UmVzb2x2ZWRQYXRoIiwibWVzc2FnZSIsInByb2Nlc3NvciIsImdldE1vZGVsIiwiZGVzY3JpcHRpb24iLCJwZXJzaXN0ZW50IiwiYWRkTWVzc2FnZXMiLCJnZXRJZCIsInJlbW92ZU1lc3NhZ2UiLCJpZCIsIm1lc3NhZ2VzIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsInJlc3VsdCIsImUiLCJyZW1vdmVNZXNzYWdlcyIsInVwZGF0ZVF1aWNrRmlsdGVyQ291bnRzIiwidGFibGUiLCJzZWxlY3RvciIsImdldFF1aWNrRmlsdGVyIiwiY29udHJvbGxlciIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJzdkl0ZW1zIiwiZ2V0SXRlbXMiLCJpbnRlcm5hbENvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImJpbmRpbmdQcm9taXNlcyIsImN1cnJlbnRGaWx0ZXJLZXkiLCJnZXRTZWxlY3RlZEtleSIsInF1aWNrRmlsdGVyQ291bnRzIiwiY2hhcnRGaWx0ZXJzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJjaGFydCIsImdldENoYXJ0Q29udHJvbCIsImNoYXJ0QVBJIiwiZ2V0UGFyZW50IiwiaGFzU2VsZWN0aW9ucyIsImNoYXJ0RmlsdGVySW5mbyIsIkNoYXJ0VXRpbHMiLCJnZXRBbGxGaWx0ZXJJbmZvIiwiZmlsdGVycyIsImxlbmd0aCIsImdldENoYXJ0UHJvcGVydGllc1dpdGhvdXRQcmVmaXhlcyIsIkZpbHRlciIsImFuZCIsImFkZGl0aW9uYWxGaWx0ZXJzIiwiVGFibGVVdGlscyIsImdldEhpZGRlbkZpbHRlcnMiLCJrIiwiaXRlbUtleSIsImdldEtleSIsImZpbHRlckluZm9zIiwiZ2V0RmlsdGVyc0luZm9Gb3JTViIsInB1c2giLCJnZXRMaXN0QmluZGluZ0ZvckNvdW50IiwiYmF0Y2hHcm91cElkIiwic2V0UHJvcGVydHkiLCJjb3VudHMiLCJhbGwiLCJnZXRDb3VudEZvcm1hdHRlZCIsImVycm9yIiwiTG9nIiwic2FwIiwidWkiLCJnZXRDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJfZ2V0Um93QmluZGluZyIsImdldENvbnRlbnQiLCJnZXRDb3VudHMiLCJnZXRQcm9wZXJ0eSIsImRhdGEiLCJ0aGVuIiwiaVZhbHVlIiwiY2F0Y2giLCJvbkNvbnRleHRDaGFuZ2UiLCJmaXJlRXZlbnQiLCJnZXRQYXJhbWV0ZXJzIiwic2V0RmFzdENyZWF0aW9uUm93RW5hYmxlbWVudCIsIm9uUXVpY2tGaWx0ZXJTZWxlY3Rpb25DaGFuZ2UiLCJmaWx0ZXJCYXJJRCIsImdldEZpbHRlciIsImZpbHRlckJhciIsIkNvcmUiLCJieUlkIiwiZ2V0U3VzcGVuZFNlbGVjdGlvbiIsInJlYmluZCIsImdldEV4dGVuc2lvbkFQSSIsInVwZGF0ZUFwcFN0YXRlIiwib25UYWJsZVJvd1ByZXNzIiwib0V2ZW50Iiwib0NvbnRyb2xsZXIiLCJvQ29udGV4dCIsIm1QYXJhbWV0ZXJzIiwiaXNJbmFjdGl2ZSIsImlzVHJhbnNpZW50IiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiZW5hYmxlQW5hbHl0aWNzIiwibmF2aWdhdGlvblBhcmFtZXRlcnMiLCJPYmplY3QiLCJhc3NpZ24iLCJyZWFzb24iLCJOYXZpZ2F0aW9uUmVhc29uIiwiUm93UHJlc3MiLCJfcm91dGluZyIsIm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dCIsIm9uSW50ZXJuYWxQYXRjaENvbXBsZXRlZCIsImludGVybmFsTW9kZWxDb250ZXh0Iiwic2VsZWN0ZWRDb250ZXh0cyIsIkRlbGV0ZUhlbHBlciIsInVwZGF0ZURlbGV0ZUluZm9Gb3JTZWxlY3RlZENvbnRleHRzIiwib25JbnRlcm5hbERhdGFSZWNlaXZlZCIsImdldFBhcmFtZXRlciIsIm1lc3NhZ2VIYW5kbGVyIiwic2hvd01lc3NhZ2VEaWFsb2ciLCJvbkludGVybmFsRGF0YVJlcXVlc3RlZCIsImNvbnRyb2wiLCJxdWlja0ZpbHRlcnMiLCJzaG93Q291bnRzIiwib25QYXN0ZSIsInRhYmxlRGVmaW5pdGlvbiIsImVuYWJsZVBhc3RlIiwiYVJhd1Bhc3RlZERhdGEiLCJnZXRFbmFibGVQYXN0ZSIsIlBhc3RlSGVscGVyIiwicGFzdGVEYXRhIiwib1Jlc291cmNlTW9kZWwiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJNZXNzYWdlQm94IiwiZ2V0VGV4dCIsInRpdGxlIiwib25CZWZvcmVFeHBvcnQiLCJleHBvcnRFdmVudCIsImlzU3BsaXRNb2RlIiwic3BsaXRDZWxscyIsInRhYmxlQ29udHJvbGxlciIsImV4cG9ydFNldHRpbmdzIiwidXBkYXRlRXhwb3J0U2V0dGluZ3MiLCJkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXIiLCJzVGFibGVDb250ZXh0QmluZGluZ1BhdGgiLCJnZXRQYXRoIiwic1RhYmxlUm93QmluZGluZyIsImdldFRhcmdldCIsIm9uRGF0YVN0YXRlQ2hhbmdlIiwib0RhdGFTdGF0ZUluZGljYXRvciIsImFGaWx0ZXJlZE1lc3NhZ2VzIiwib0ludGVybmFsTW9kZWwiLCJjb2x1bW5zIiwiZGF0YVNvdXJjZSIsInNpemVMaW1pdCIsImV4cG9ydENvbHVtbnMiLCJ3b3JrYm9vayIsImluZGV4IiwiZXhwb3J0Q29sdW1uIiwicmVzb3VyY2VCdW5kbGUiLCJsYWJlbCIsImdldExvY2FsaXplZFRleHQiLCJmYWxzZVZhbHVlIiwidHJ1ZVZhbHVlIiwidGFyZ2V0VmFsdWVDb2x1bW4iLCJjb2x1bW4iLCJjb2x1bW5XaXRoVGFyZ2V0VmFsdWVUb0JlQWRkZWQiLCJjb2x1bW5Ub0JlQWRkZWQiLCJBcnJheSIsImlzQXJyYXkiLCJ0ZW1wbGF0ZSIsImV4cG9ydERhdGFQb2ludFRhcmdldFZhbHVlIiwic3BsaWNlIiwiY29sdW1uRXhwb3J0IiwiY29sdW1uTmVlZHNUb0JlQWRkZWQiLCJwcm9wZXJ0eUluZm9zIiwicmVsYXRpdmVQYXRoIiwiaW5jbHVkZXMiLCJuYW1lIiwicmVzdW1lQmluZGluZyIsImJSZXF1ZXN0SWZOb3RJbml0aWFsaXplZCIsImdldERhdGFJbml0aWFsaXplZCIsInJlZnJlc2hOb3RBcHBsaWNhYmxlRmllbGRzIiwib0ZpbHRlckNvbnRyb2wiLCJGaWx0ZXJVdGlscyIsImdldE5vdEFwcGxpY2FibGVGaWx0ZXJzIiwic3VzcGVuZEJpbmRpbmciLCJpbnZhbGlkYXRlQ29udGVudCIsImZhc3RDcmVhdGlvblJvdyIsImdldENyZWF0aW9uUm93IiwidGFibGVCaW5kaW5nIiwiYmluZGluZ0NvbnRleHQiLCJnZXRDb250ZXh0IiwiVGFibGVIZWxwZXIiLCJlbmFibGVGYXN0Q3JlYXRpb25Sb3ciLCJvbkFkZENhcmRUb0luc2lnaHRzUHJlc3NlZCIsImluc2lnaHRzUmVsZXZhbnRDb2x1bW5zIiwiZ2V0SW5zaWdodHNSZWxldmFudENvbHVtbnMiLCJpbnNpZ2h0c1BhcmFtcyIsImNyZWF0ZUluc2lnaHRzUGFyYW1zIiwiSW50ZWdyYXRpb25DYXJkVHlwZSIsInNob3dJbnNpZ2h0c0NhcmRQcmV2aWV3IiwiZ2VuZXJpY0Vycm9yTWVzc2FnZUZvckluc2lnaHRzQ2FyZCIsIm9uTWFzc0VkaXRCdXR0b25QcmVzc2VkIiwicGFnZUNvbnRyb2xsZXIiLCJtYXNzRWRpdCIsIm9wZW5NYXNzRWRpdERpYWxvZyIsIndhcm5pbmciLCJvbkFjdGlvblByZXNzIiwiYWN0aW9uTmFtZSIsIm1vZGVsIiwiZXhlY3V0ZUFjdGlvbiIsIm5vdEFwcGxpY2FibGVDb250ZXh0cyIsImNvbnZlcnRlZE1ldGFkYXRhIiwiY29udmVydFR5cGVzIiwiZ2V0TWV0YU1vZGVsIiwiZW50aXR5VHlwZSIsInJlc29sdmVQYXRoIiwiZW50aXR5VHlwZUZ1bGx5UXVhbGlmaWVkTmFtZSIsIm15VW5hcHBsaWNhYmxlQ29udGV4dERpYWxvZyIsIk5vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nIiwicmVzb3VyY2VNb2RlbCIsImdldFJlc291cmNlTW9kZWwiLCJjb250ZXh0cyIsImFwcGxpY2FibGVDb250ZXh0cyIsIm9wZW4iLCJlZGl0RmxvdyIsImludm9rZUFjdGlvbiIsImluZm8iLCJmaWx0ZXJCYXJSZWZJZCIsImdldEZpbHRlckJhciIsIl9zZXRGaWx0ZXJCYXIiLCJ0YWJsZUFQSUlkIiwidGFibGVBUElMb2NhbElkIiwicG90ZW50aWFsZmlsdGVyQmFySWQiLCJyZXBsYWNlIiwiUmVnRXhwIiwic2V0RmlsdGVyIiwiY2hlY2tJZkNvbHVtbkV4aXN0cyIsImFGaWx0ZXJlZENvbHVtbW5zIiwiY29sdW1uTmFtZSIsInNvbWUiLCJvQ29sdW1uIiwic0NvbHVtbk5hbWVWaXNpYmxlIiwic1RleHRBcnJhbmdlbWVudCIsInVuZGVmaW5lZCIsImdldElkZW50aWZpZXJDb2x1bW4iLCJoZWFkZXJJbmZvVGl0bGVQYXRoIiwiaGVhZGVySW5mb1RpdGxlIiwib01ldGFNb2RlbCIsInNDdXJyZW50RW50aXR5U2V0TmFtZSIsImFUZWNobmljYWxLZXlzIiwiZ2V0T2JqZWN0IiwiYUZpbHRlcmVkVGVjaG5pY2FsS2V5cyIsImZvckVhY2giLCJ0ZWNobmljYWxLZXkiLCJzZW1hbnRpY0tleUNvbHVtbnMiLCJzZW1hbnRpY0tleXMiLCJhVmlzaWJsZUNvbHVtbnMiLCJhVGFibGVDb2x1bW5zIiwiZ2V0Q29sdW1ucyIsImdldERhdGFQcm9wZXJ0eSIsIm9UZXh0QXJyYW5nZW1lbnQiLCIkUGF0aCIsInNUZXh0UGxhY2VtZW50IiwiJEVudW1NZW1iZXIiLCJzZXRFbXB0eVJvd3NFbmFibGVkIiwiZW5hYmxlbWVudCIsInNldFVwRW1wdHlSb3dzIiwiY3JlYXRlQnV0dG9uV2FzUHJlc3NlZCIsImNyZWF0aW9uTW9kZSIsIkNyZWF0aW9uTW9kZSIsIklubGluZUNyZWF0aW9uUm93cyIsInVpTW9kZWwiLCJ3YXRjaEJpbmRpbmciLCJiaW5kUHJvcGVydHkiLCJmbkhhbmRsZXIiLCJkZXRhY2hDaGFuZ2UiLCJkZXN0cm95IiwiYXR0YWNoQ2hhbmdlIiwiaXNJbkVkaXRNb2RlIiwiaW5saW5lQ3JlYXRpb25Sb3dzSGlkZGVuSW5FZGl0TW9kZSIsImJpbmRpbmciLCJpc1Jlc29sdmVkIiwiaXNMZW5ndGhGaW5hbCIsImNvbnRleHRQYXRoIiwiZW1wdHlSb3dzRW5hYmxlZCIsIl9kZWxldGVFbXB0eVJvd3MiLCJpbmFjdGl2ZUNvbnRleHQiLCJnZXRBbGxDdXJyZW50Q29udGV4dHMiLCJjb250ZXh0Iiwic3RhcnRzV2l0aCIsIl9jcmVhdGVFbXB0eVJvdyIsImRlbGV0ZSIsIm9CaW5kaW5nIiwiaUlubGluZUNyZWF0aW9uUm93Q291bnQiLCJpbmxpbmVDcmVhdGlvblJvd0NvdW50IiwiYURhdGEiLCJpIiwiYkF0RW5kIiwiYkluYWN0aXZlIiwib1ZpZXciLCJjcmVhdGluZ0VtcHR5Um93cyIsImFDb250ZXh0cyIsImNyZWF0ZU11bHRpcGxlRG9jdW1lbnRzIiwib25CZWZvcmVDcmVhdGUiLCJjcmVhdGVkIiwib0Vycm9yIiwiY2FuY2VsZWQiLCJNYWNyb0FQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGFibGVBUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRW50aXR5VHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgTm90QXBwbGljYWJsZUNvbnRleHREaWFsb2cgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L05vdEFwcGxpY2FibGVDb250ZXh0RGlhbG9nXCI7XG5pbXBvcnQgTmF2aWdhdGlvblJlYXNvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvcm91dGluZy9OYXZpZ2F0aW9uUmVhc29uXCI7XG5pbXBvcnQgdHlwZSB7IEFubm90YXRpb25UYWJsZUNvbHVtbiwgY29sdW1uRXhwb3J0U2V0dGluZ3MsIFRhYmxlVmlzdWFsaXphdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9UYWJsZVwiO1xuaW1wb3J0IHsgQ3JlYXRpb25Nb2RlLCBIb3Jpem9udGFsQWxpZ24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBjb252ZXJ0VHlwZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBwcm9wZXJ0eSwgeG1sRXZlbnRIYW5kbGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgRGVsZXRlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0RlbGV0ZUhlbHBlclwiO1xuaW1wb3J0IHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFBhc3RlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Bhc3RlSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRMb2NhbGl6ZWRUZXh0LCBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ2hhcnRVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9jaGFydC9DaGFydFV0aWxzXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgVGFibGVVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBJbnNpZ2h0c0NhcmRDb2x1bW5zVHlwZSB9IGZyb20gXCJzYXAvaW5zaWdodHMvQ2FyZEhlbHBlclwiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBEYXRhU3RhdGVJbmRpY2F0b3IgZnJvbSBcInNhcC9tL3BsdWdpbnMvRGF0YVN0YXRlSW5kaWNhdG9yXCI7XG5pbXBvcnQgdHlwZSBTZWdtZW50ZWRCdXR0b24gZnJvbSBcInNhcC9tL1NlZ21lbnRlZEJ1dHRvblwiO1xuaW1wb3J0IHR5cGUgU2VsZWN0IGZyb20gXCJzYXAvbS9TZWxlY3RcIjtcbmltcG9ydCBVSTVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgRmlsdGVyQmFyQVBJIGZyb20gXCIuLi9maWx0ZXJCYXIvRmlsdGVyQmFyQVBJXCI7XG5pbXBvcnQgeyBjcmVhdGVJbnNpZ2h0c1BhcmFtcywgZ2V0SW5zaWdodHNSZWxldmFudENvbHVtbnMgfSBmcm9tIFwiLi4vaW5zaWdodHMvQ29tbW9uSW5zaWdodHNIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyaWNFcnJvck1lc3NhZ2VGb3JJbnNpZ2h0c0NhcmQsIEludGVncmF0aW9uQ2FyZFR5cGUsIHNob3dJbnNpZ2h0c0NhcmRQcmV2aWV3IH0gZnJvbSBcIi4uL2luc2lnaHRzL0luc2lnaHRzQ2FyZEhlbHBlclwiO1xuaW1wb3J0IE1hY3JvQVBJIGZyb20gXCIuLi9NYWNyb0FQSVwiO1xuaW1wb3J0IFRhYmxlSGVscGVyIGZyb20gXCIuL1RhYmxlSGVscGVyXCI7XG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIGN1c3RvbSBhY3Rpb24gdG8gYmUgdXNlZCBpbnNpZGUgdGhlIHRhYmxlIHRvb2xiYXJcbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy50YWJsZS5BY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IHR5cGUgQWN0aW9uID0ge1xuXHQvKipcblx0ICogVW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGFjdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRrZXk6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIHRleHQgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBmb3IgdGhpcyBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0dGV4dDogc3RyaW5nO1xuXHQvKipcblx0ICogUmVmZXJlbmNlIHRvIHRoZSBrZXkgb2YgYW5vdGhlciBhY3Rpb24gYWxyZWFkeSBkaXNwbGF5ZWQgaW4gdGhlIHRvb2xiYXIgdG8gcHJvcGVybHkgcGxhY2UgdGhpcyBvbmVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YW5jaG9yPzogc3RyaW5nO1xuXHQvKipcblx0ICogRGVmaW5lcyB3aGVyZSB0aGlzIGFjdGlvbiBzaG91bGQgYmUgcGxhY2VkIHJlbGF0aXZlIHRvIHRoZSBkZWZpbmVkIGFuY2hvclxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYEJlZm9yZWAgYW5kIGBBZnRlcmBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cGxhY2VtZW50PzogXCJCZWZvcmVcIiB8IFwiQWZ0ZXJcIjtcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgdXNlciBjaG9vc2VzIHRoZSBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cHJlc3M6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyBpZiB0aGUgYWN0aW9uIHJlcXVpcmVzIGEgc2VsZWN0aW9uLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRyZXF1aXJlc1NlbGVjdGlvbj86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgb3IgZGlzYWJsZXMgdGhlIGFjdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRlbmFibGVkPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIGN1c3RvbSBBY3Rpb25Hcm91cCB0byBiZSB1c2VkIGluc2lkZSB0aGUgdGFibGUgdG9vbGJhclxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLnRhYmxlLkFjdGlvbkdyb3VwXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIEFjdGlvbkdyb3VwID0ge1xuXHQvKipcblx0ICogVW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIEFjdGlvbkdyb3VwXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGtleTogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIG5lc3RlZCBhY3Rpb25zXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFjdGlvbnM6IEFjdGlvbltdO1xuXG5cdC8qKlxuXHQgKiBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGZvciB0aGlzIGFjdGlvbiBncm91cFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHR0ZXh0OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byB0aGUga2V5IG9mIGFub3RoZXIgYWN0aW9uIG9yIGFjdGlvbiBncm91cCBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgdG9vbGJhciB0byBwcm9wZXJseSBwbGFjZSB0aGlzIG9uZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhbmNob3I/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgd2hlcmUgdGhpcyBhY3Rpb24gZ3JvdXAgc2hvdWxkIGJlIHBsYWNlZCByZWxhdGl2ZSB0byB0aGUgZGVmaW5lZCBhbmNob3Jcblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIGBCZWZvcmVgIGFuZCBgQWZ0ZXJgXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHBsYWNlbWVudD86IFwiQmVmb3JlXCIgfCBcIkFmdGVyXCI7XG59O1xuXG4vKipcbiAqIERlZmluaXRpb24gb2YgYSBjdXN0b20gY29sdW1uIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSB0YWJsZS5cbiAqXG4gKiBUaGUgdGVtcGxhdGUgZm9yIHRoZSBjb2x1bW4gaGFzIHRvIGJlIHByb3ZpZGVkIGFzIHRoZSBkZWZhdWx0IGFnZ3JlZ2F0aW9uXG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MudGFibGUuQ29sdW1uXG4gKiBAcHVibGljXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCB0eXBlIENvbHVtbiA9IHtcblx0LyoqXG5cdCAqIFVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb2x1bW5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0a2V5OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgZm9yIHRoaXMgY29sdW1uIGhlYWRlclxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRoZWFkZXI6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgY29sdW1uJ3Mgd2lkdGguXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgYXV0b2AsIGB2YWx1ZWAgYW5kIGBpbmhlcml0YCBhY2NvcmRpbmcgdG8ge0BsaW5rIHNhcC51aS5jb3JlLkNTU1NpemV9XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHdpZHRoPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBjb2x1bW4gaW1wb3J0YW5jZS5cblx0ICpcblx0ICogWW91IGNhbiBkZWZpbmUgd2hpY2ggY29sdW1ucyBzaG91bGQgYmUgYXV0b21hdGljYWxseSBtb3ZlZCB0byB0aGUgcG9wLWluIGFyZWEgYmFzZWQgb24gdGhlaXIgaW1wb3J0YW5jZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRpbXBvcnRhbmNlPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBBbGlnbnMgdGhlIGhlYWRlciBhcyB3ZWxsIGFzIHRoZSBjb250ZW50IGhvcml6b250YWxseVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRob3Jpem9udGFsQWxpZ24/OiBIb3Jpem9udGFsQWxpZ247XG5cblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byB0aGUga2V5IG9mIGFub3RoZXIgY29sdW1uIGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSB0YWJsZSB0byBwcm9wZXJseSBwbGFjZSB0aGlzIG9uZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhbmNob3I/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgd2hlcmUgdGhpcyBjb2x1bW4gc2hvdWxkIGJlIHBsYWNlZCByZWxhdGl2ZSB0byB0aGUgZGVmaW5lZCBhbmNob3Jcblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIGBCZWZvcmVgIGFuZCBgQWZ0ZXJgXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHBsYWNlbWVudD86IFwiQmVmb3JlXCIgfCBcIkFmdGVyXCI7XG59O1xuXG50eXBlIGV4cG9ydENvbHVtbiA9IGNvbHVtbkV4cG9ydFNldHRpbmdzICYge1xuXHRwcm9wZXJ0eTogc3RyaW5nIHwgQXJyYXk8c3RyaW5nPjtcblx0bGFiZWw6IHN0cmluZztcblx0Y29sdW1uSWQ/OiBzdHJpbmc7XG5cdHdpZHRoPzogbnVtYmVyO1xuXHR0ZXh0QWxpZ24/OiBzdHJpbmc7XG5cdGRpc3BsYXlVbml0PzogYm9vbGVhbjtcblx0dHJ1ZVZhbHVlPzogc3RyaW5nO1xuXHRmYWxzZVZhbHVlPzogc3RyaW5nO1xuXHR2YWx1ZU1hcD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIGV4cG9ydFNldHRpbmdzID0ge1xuXHRkYXRhU291cmNlOiB7XG5cdFx0c2l6ZUxpbWl0PzogbnVtYmVyO1xuXHR9O1xuXHR3b3JrYm9vazoge1xuXHRcdGNvbHVtbnM6IGV4cG9ydENvbHVtbltdO1xuXHR9O1xufTtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayB1c2VkIHRvIGNyZWF0ZSBhIHRhYmxlIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgTGluZUl0ZW0gb3IgUHJlc2VudGF0aW9uVmFyaWFudCBhbm5vdGF0aW9uIGlzIGV4cGVjdGVkLCBidXQgdGhlIFRhYmxlIGJ1aWxkaW5nIGJsb2NrIGNhbiBhbHNvIGJlIHVzZWQgdG8gZGlzcGxheSBhbiBFbnRpdHlTZXQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOlRhYmxlIGlkPVwiTXlUYWJsZVwiIG1ldGFQYXRoPVwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtXCIgLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlRhYmxlXG4gKiBAcHVibGljXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MudGFibGUuVGFibGVBUElcIiwgeyByZXR1cm5UeXBlczogW1wic2FwLmZlLm1hY3Jvcy5NYWNyb0FQSVwiXSB9KVxuY2xhc3MgVGFibGVBUEkgZXh0ZW5kcyBNYWNyb0FQSSB7XG5cdGNyZWF0aW5nRW1wdHlSb3dzPzogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihtU2V0dGluZ3M/OiBQcm9wZXJ0aWVzT2Y8VGFibGVBUEk+LCAuLi5vdGhlcnM6IGFueVtdKSB7XG5cdFx0c3VwZXIobVNldHRpbmdzIGFzIGFueSwgLi4ub3RoZXJzKTtcblxuXHRcdHRoaXMudXBkYXRlRmlsdGVyQmFyKCk7XG5cblx0XHRpZiAodGhpcy5jb250ZW50KSB7XG5cdFx0XHR0aGlzLmNvbnRlbnQuYXR0YWNoRXZlbnQoXCJzZWxlY3Rpb25DaGFuZ2VcIiwge30sIHRoaXMub25UYWJsZVNlbGVjdGlvbkNoYW5nZSwgdGhpcyk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHJlbGF0aXZlIHBhdGggb2YgdGhlIHByb3BlcnR5IGluIHRoZSBtZXRhbW9kZWwsIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbnRleHRQYXRoLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiRW50aXR5VHlwZVwiLCBcIlNpbmdsZXRvblwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiXSxcblx0XHRleHBlY3RlZEFubm90YXRpb25zOiBbXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnRcIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFwiXG5cdFx0XVxuXHR9KVxuXHRtZXRhUGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcGF0aCBvZiB0aGUgY29udGV4dCB1c2VkIGluIHRoZSBjdXJyZW50IHBhZ2Ugb3IgYmxvY2suXG5cdCAqIFRoaXMgc2V0dGluZyBpcyBkZWZpbmVkIGJ5IHRoZSBmcmFtZXdvcmsuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwib2JqZWN0XCIgfSlcblx0dGFibGVEZWZpbml0aW9uITogVGFibGVWaXN1YWxpemF0aW9uO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZW50aXR5VHlwZUZ1bGx5UXVhbGlmaWVkTmFtZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogQW4gZXhwcmVzc2lvbiB0aGF0IGFsbG93cyB5b3UgdG8gY29udHJvbCB0aGUgJ3JlYWQtb25seScgc3RhdGUgb2YgdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBJZiB5b3UgZG8gbm90IHNldCBhbnkgZXhwcmVzc2lvbiwgU0FQIEZpb3JpIGVsZW1lbnRzIGhvb2tzIGludG8gdGhlIHN0YW5kYXJkIGxpZmVjeWNsZSB0byBkZXRlcm1pbmUgdGhlIGN1cnJlbnQgc3RhdGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHJlYWRPbmx5ITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhlIGlkZW50aWZpZXIgb2YgdGhlIHRhYmxlIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0aWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEFuIGV4cHJlc3Npb24gdGhhdCBhbGxvd3MgeW91IHRvIGNvbnRyb2wgdGhlICdidXN5JyBzdGF0ZSBvZiB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGJ1c3khOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSB0eXBlIG9mIHRhYmxlIHRoYXQgd2lsbCBiZSB1c2VkIGJ5IHRoZSBidWlsZGluZyBibG9jayB0byByZW5kZXIgdGhlIGRhdGEuXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgR3JpZFRhYmxlYCBhbmQgYFJlc3BvbnNpdmVUYWJsZWBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiBcIlJlc3BvbnNpdmVUYWJsZVwiLCBhbGxvd2VkVmFsdWVzOiBbXCJHcmlkVGFibGVcIiwgXCJSZXNwb25zaXZlVGFibGVcIl0gfSlcblx0dHlwZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogQ29udHJvbHMgaWYgdGhlIGV4cG9ydCBmdW5jdGlvbmFsaXR5IG9mIHRoZSB0YWJsZSBpcyBlbmFibGVkIG9yIG5vdC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogdHJ1ZSB9KVxuXHRlbmFibGVFeHBvcnQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDb250cm9scyBpZiB0aGUgcGFzdGUgZnVuY3Rpb25hbGl0eSBvZiB0aGUgdGFibGUgaXMgZW5hYmxlZCBvciBub3QuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGVuYWJsZVBhc3RlITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQ29udHJvbHMgd2hldGhlciB0aGUgdGFibGUgY2FuIGJlIG9wZW5lZCBpbiBmdWxsc2NyZWVuIG1vZGUgb3Igbm90LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRlbmFibGVGdWxsU2NyZWVuITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogSUQgb2YgdGhlIEZpbHRlckJhciBidWlsZGluZyBibG9jayBhc3NvY2lhdGVkIHdpdGggdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlckJhciE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgc2VsZWN0aW9uIG1vZGUgdG8gYmUgdXNlZCBieSB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgTm9uZWAsIGBTaW5nbGVgLCBgTXVsdGlgIG9yIGBBdXRvYC4gSWYgbm90IHNldCB0byAnTm9uZScsIFNBUCBGaW9yaSBlbGVtZW50cyBob29rcyBpbnRvIHRoZSBzdGFuZGFyZCBsaWZlY3ljbGUgdG8gZGV0ZXJtaW5lIHRoZSBjb25zaXN0ZW50IHNlbGVjdGlvbiBtb2RlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiLCBhbGxvd2VkVmFsdWVzOiBbXCJOb25lXCIsIFwiU2luZ2xlXCIsIFwiTXVsdGlcIiwgXCJBdXRvXCJdIH0pXG5cdHNlbGVjdGlvbk1vZGUhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgaGVhZGVyIHRleHQgdGhhdCBpcyBzaG93biBpbiB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0aGVhZGVyITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgaWYgdGhlIGNvbHVtbiB3aWR0aCBpcyBhdXRvbWF0aWNhbGx5IGNhbGN1bGF0ZWQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0ZW5hYmxlQXV0b0NvbHVtbldpZHRoITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIGl0IHRoZSB0YWJsZSBpcyBkZXNpZ25lZCBmb3IgYSBtb2JpbGUgZGV2aWNlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0aXNPcHRpbWl6ZWRGb3JTbWFsbERldmljZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIGlmIHRoZSBoZWFkZXIgdGV4dCBzaG91bGQgYmUgc2hvd24gb3Igbm90LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdGhlYWRlclZpc2libGUhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBOdW1iZXIgb2YgY29sdW1ucyB0aGF0IGFyZSBmaXhlZCBvbiB0aGUgbGVmdC4gT25seSBjb2x1bW5zIHdoaWNoIGFyZSBub3QgZml4ZWQgY2FuIGJlIHNjcm9sbGVkIGhvcml6b250YWxseS5cblx0ICpcblx0ICogVGhpcyBwcm9wZXJ0eSBpcyBub3QgcmVsZXZhbnQgZm9yIFJlc3BvbnNpdmUgdGFibGVzXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwibnVtYmVyXCIgfSlcblx0ZnJvemVuQ29sdW1uQ291bnQ/OiBudW1iZXI7XG5cblx0LyoqXG5cdCAqIEFnZ3JlZ2F0ZSBhY3Rpb25zIG9mIHRoZSB0YWJsZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLnRhYmxlLkFjdGlvblwiLCBtdWx0aXBsZTogdHJ1ZSB9KVxuXHRhY3Rpb25zITogQWN0aW9uW107XG5cblx0LyoqXG5cdCAqIEFnZ3JlZ2F0ZSBjb2x1bW5zIG9mIHRoZSB0YWJsZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLnRhYmxlLkNvbHVtblwiLCBtdWx0aXBsZTogdHJ1ZSB9KVxuXHRjb2x1bW5zITogQ29sdW1uW107XG5cblx0LyoqXG5cdCAqXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRkYXRhSW5pdGlhbGl6ZWQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0YmluZGluZ1N1c3BlbmRlZCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRvdXREYXRlZEJpbmRpbmchOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0cGVuZGluZ1JlcXVlc3QhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgaWYgdGhlIGVtcHR5IHJvd3MgYXJlIGVuYWJsZWQuIFRoaXMgYWxsb3dzIHRvIGhhdmUgZHluYW1pYyBlbmFibGVtZW50IG9mIHRoZSBlbXB0eSByb3dzIHZpYSB0aGUgc2V0dGVyIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0ZW1wdHlSb3dzRW5hYmxlZCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IGlzIHRyaWdnZXJlZCB3aGVuIHRoZSB1c2VyIGNob29zZXMgYSByb3c7IHRoZSBldmVudCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCB3aGljaCByb3cgaXMgY2hvc2VuLlxuXHQgKlxuXHQgKiBZb3UgY2FuIHNldCB0aGlzIGluIG9yZGVyIHRvIGhhbmRsZSB0aGUgbmF2aWdhdGlvbiBtYW51YWxseS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0cm93UHJlc3MhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gdGhlIFRhYmxlIFN0YXRlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIFlvdSBjYW4gc2V0IHRoaXMgaW4gb3JkZXIgdG8gc3RvcmUgdGhlIHRhYmxlIHN0YXRlIGluIHRoZSBhcHBzdGF0ZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBldmVudCgpXG5cdHN0YXRlQ2hhbmdlITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIHRoZSBUYWJsZSBjb250ZXh0IGNoYW5nZXMuXG5cdCAqXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAZXZlbnQoKVxuXHRjb250ZXh0Q2hhbmdlPzogRnVuY3Rpb247XG5cblx0QGV2ZW50KClcblx0aW50ZXJuYWxEYXRhUmVxdWVzdGVkITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIHdoaWNoIG9wdGlvbnMgc2hvdWxkIGJlIGVuYWJsZWQgZm9yIHRoZSB0YWJsZSBwZXJzb25hbGl6YXRpb24gZGlhbG9nLlxuXHQgKlxuXHQgKiBJZiBpdCBpcyBzZXQgdG8gYHRydWVgLCBhbGwgcG9zc2libGUgb3B0aW9ucyBmb3IgdGhpcyBraW5kIG9mIHRhYmxlIGFyZSBlbmFibGVkLjxici8+XG5cdCAqIElmIGl0IGlzIHNldCB0byBgZmFsc2VgLCBwZXJzb25hbGl6YXRpb24gaXMgZGlzYWJsZWQuPGJyLz5cblx0ICo8YnIvPlxuXHQgKiBZb3UgY2FuIGFsc28gcHJvdmlkZSBhIG1vcmUgZ3JhbnVsYXIgY29udHJvbCBmb3IgdGhlIHBlcnNvbmFsaXphdGlvbiBieSBwcm92aWRpbmcgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCB3aXRoIHRoZSBvcHRpb25zIHlvdSB3YW50IHRvIGJlIGF2YWlsYWJsZS48YnIvPlxuXHQgKiBBdmFpbGFibGUgb3B0aW9ucyBhcmU6PGJyLz5cblx0ICogIC0gU29ydDxici8+XG5cdCAqICAtIENvbHVtbjxici8+XG5cdCAqICAtIEZpbHRlcjxici8+XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhbiB8IHN0cmluZ1wiLCBkZWZhdWx0VmFsdWU6IHRydWUgfSlcblx0cGVyc29uYWxpemF0aW9uITogYm9vbGVhbiB8IHN0cmluZztcblxuXHQvKipcblx0ICogQ29udHJvbHMgdGhlIGtpbmQgb2YgdmFyaWFudCBtYW5hZ2VtZW50IHRoYXQgc2hvdWxkIGJlIGVuYWJsZWQgZm9yIHRoZSB0YWJsZS5cblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZSBpcyBgQ29udHJvbGAuPGJyLz5cblx0ICogSWYgc2V0IHdpdGggdmFsdWUgYENvbnRyb2xgLCBhIHZhcmlhbnQgbWFuYWdlbWVudCBjb250cm9sIGlzIHNlZW4gd2l0aGluIHRoZSB0YWJsZSBhbmQgdGhlIHRhYmxlIGlzIGxpbmtlZCB0byB0aGlzLjxici8+XG5cdCAqIElmIG5vdCBzZXQgd2l0aCBhbnkgdmFsdWUsIGNvbnRyb2wgbGV2ZWwgdmFyaWFudCBtYW5hZ2VtZW50IGlzIG5vdCBhdmFpbGFibGUgZm9yIHRoaXMgdGFibGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIsIGFsbG93ZWRWYWx1ZXM6IFtcIkNvbnRyb2xcIl0gfSlcblx0dmFyaWFudE1hbmFnZW1lbnQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEdyb3VwcyBtZW51IGFjdGlvbnMgYnkga2V5LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG1lbnU/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgd2hldGhlciB0byBkaXNwbGF5IHRoZSBzZWFyY2ggYWN0aW9uLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdGlzU2VhcmNoYWJsZT86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHJlbGV2YW50IHRhYmxlQVBJIGZvciBhIFVJNSBldmVudC5cblx0ICogQW4gZXZlbnQgY2FuIGJlIHRyaWdnZXJlZCBlaXRoZXIgYnkgdGhlIGlubmVyIGNvbnRyb2wgKHRoZSB0YWJsZSkgb3IgdGhlIE9kYXRhIGxpc3RCaW5kaW5nXG5cdCAqIFRoZSBmaXJzdCBpbml0aWF0b3IgaXMgdGhlIHVzdWFsIG9uZSBzbyBpdCdzIG1hbmFnZWQgYnkgdGhlIE1hY3JvQVBJIHdoZXJlYXNcblx0ICogdGhlIHNlY29uZCBvbmUgaXMgc3BlY2lmaWMgdG8gdGhpcyBBUEkgYW5kIGhhcyB0byBtYW5hZ2VkIGJ5IHRoZSBUYWJsZUFQSS5cblx0ICpcblx0ICogQHBhcmFtIHVpNUV2ZW50IFRoZSBVSTUgZXZlbnRcblx0ICogQHJldHVybnMgVGhlIFRhYmxlQVBJIG9yIGZhbHNlIGlmIG5vdCBmb3VuZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0c3RhdGljIGdldEFQSSh1aTVFdmVudDogVUk1RXZlbnQpOiBNYWNyb0FQSSB8IGZhbHNlIHtcblx0XHRjb25zdCBzb3VyY2UgPSB1aTVFdmVudC5nZXRTb3VyY2UoKTtcblx0XHRsZXQgdGFibGVBUEk6IFRhYmxlQVBJIHwgdW5kZWZpbmVkO1xuXHRcdGlmIChzb3VyY2UuaXNBPE9EYXRhTGlzdEJpbmRpbmc+KFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdHRhYmxlQVBJID0gKHRoaXMuaW5zdGFuY2VNYXA/LmdldCh0aGlzKSBhcyBUYWJsZUFQSVtdKT8uZmluZCgoYXBpKSA9PiAoYXBpLmNvbnRlbnQgYXMgVGFibGUpPy5nZXRSb3dCaW5kaW5nKCkgPT09IHNvdXJjZSk7XG5cdFx0fVxuXHRcdHJldHVybiB0YWJsZUFQSSB8fCBzdXBlci5nZXRBUEkodWk1RXZlbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgY29udGV4dHMgZnJvbSB0aGUgdGFibGUgdGhhdCBoYXZlIGJlZW4gc2VsZWN0ZWQgYnkgdGhlIHVzZXIuXG5cdCAqXG5cdCAqIEByZXR1cm5zIENvbnRleHRzIG9mIHRoZSByb3dzIHNlbGVjdGVkIGJ5IHRoZSB1c2VyXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGdldFNlbGVjdGVkQ29udGV4dHMoKTogQ29udGV4dFtdIHtcblx0XHRyZXR1cm4gKHRoaXMuY29udGVudCBhcyBhbnkpLmdldFNlbGVjdGVkQ29udGV4dHMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbWVzc2FnZSB0byB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIFRoZSBtZXNzYWdlIGFwcGxpZXMgdG8gdGhlIHdob2xlIHRhYmxlIGFuZCBub3QgdG8gYW4gaW5kaXZpZHVhbCB0YWJsZSByb3cuXG5cdCAqXG5cdCAqIEBwYXJhbSBbcGFyYW1ldGVyc10gVGhlIHBhcmFtZXRlcnMgdG8gY3JlYXRlIHRoZSBtZXNzYWdlXG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLnR5cGUgTWVzc2FnZSB0eXBlXG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLm1lc3NhZ2UgTWVzc2FnZSB0ZXh0XG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLmRlc2NyaXB0aW9uIE1lc3NhZ2UgZGVzY3JpcHRpb25cblx0ICogQHBhcmFtIHBhcmFtZXRlcnMucGVyc2lzdGVudCBUcnVlIGlmIHRoZSBtZXNzYWdlIGlzIHBlcnNpc3RlbnRcblx0ICogQHJldHVybnMgVGhlIElEIG9mIHRoZSBtZXNzYWdlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFkZE1lc3NhZ2UocGFyYW1ldGVyczogeyB0eXBlPzogTWVzc2FnZVR5cGU7IG1lc3NhZ2U/OiBzdHJpbmc7IGRlc2NyaXB0aW9uPzogc3RyaW5nOyBwZXJzaXN0ZW50PzogYm9vbGVhbiB9KTogc3RyaW5nIHtcblx0XHRjb25zdCBtc2dNYW5hZ2VyID0gdGhpcy5fZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblxuXHRcdGNvbnN0IG9UYWJsZSA9IHRoaXMuY29udGVudCBhcyBhbnkgYXMgVGFibGU7XG5cblx0XHRjb25zdCBvTWVzc2FnZSA9IG5ldyBNZXNzYWdlKHtcblx0XHRcdHRhcmdldDogb1RhYmxlLmdldFJvd0JpbmRpbmcoKS5nZXRSZXNvbHZlZFBhdGgoKSxcblx0XHRcdHR5cGU6IHBhcmFtZXRlcnMudHlwZSxcblx0XHRcdG1lc3NhZ2U6IHBhcmFtZXRlcnMubWVzc2FnZSxcblx0XHRcdHByb2Nlc3Nvcjogb1RhYmxlLmdldE1vZGVsKCksXG5cdFx0XHRkZXNjcmlwdGlvbjogcGFyYW1ldGVycy5kZXNjcmlwdGlvbixcblx0XHRcdHBlcnNpc3RlbnQ6IHBhcmFtZXRlcnMucGVyc2lzdGVudFxuXHRcdH0pO1xuXG5cdFx0bXNnTWFuYWdlci5hZGRNZXNzYWdlcyhvTWVzc2FnZSk7XG5cdFx0cmV0dXJuIG9NZXNzYWdlLmdldElkKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIG1lc3NhZ2UgZnJvbSB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgaWQgb2YgdGhlIG1lc3NhZ2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmVtb3ZlTWVzc2FnZShpZDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgbXNnTWFuYWdlciA9IHRoaXMuX2dldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cdFx0Y29uc3QgbWVzc2FnZXMgPSBtc2dNYW5hZ2VyLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0XHRjb25zdCByZXN1bHQgPSBtZXNzYWdlcy5maW5kKChlOiBhbnkpID0+IGUuaWQgPT09IGlkKTtcblx0XHRpZiAocmVzdWx0KSB7XG5cdFx0XHRtc2dNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKHJlc3VsdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGNvdW50cyBkaXNwbGF5ZWQgaW50byB0aGUgcXVpY2tGaWx0ZXIgc2VsZWN0b3IuXG5cdCAqXG5cdCAqIEByZXR1cm5zICBQcm9taXNlIHJlc29sdmVzIG9uY2UgdGhlIGNvdW50cyBhcmUgdXBkYXRlZFxuXHQgKi9cblx0YXN5bmMgdXBkYXRlUXVpY2tGaWx0ZXJDb3VudHMoKSB7XG5cdFx0Y29uc3QgdGFibGUgPSB0aGlzLmNvbnRlbnQgYXMgVGFibGUsXG5cdFx0XHRzZWxlY3RvciA9IHRhYmxlLmdldFF1aWNrRmlsdGVyKCkgYXMgU2VsZWN0IHwgU2VnbWVudGVkQnV0dG9uLFxuXHRcdFx0Y29udHJvbGxlciA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyk/LmdldENvbnRyb2xsZXIoKSxcblx0XHRcdHN2SXRlbXMgPSBzZWxlY3Rvci5nZXRJdGVtcygpLFxuXHRcdFx0aW50ZXJuYWxDb250ZXh0ID0gdGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBDb250ZXh0LFxuXHRcdFx0YmluZGluZ1Byb21pc2VzID0gW10sXG5cdFx0XHRjdXJyZW50RmlsdGVyS2V5ID0gc2VsZWN0b3IuZ2V0U2VsZWN0ZWRLZXkoKTtcblx0XHRjb25zdCBxdWlja0ZpbHRlckNvdW50cyA9IHt9IGFzIFJlY29yZDxudW1iZXIsIHN0cmluZz47XG5cdFx0bGV0IGNoYXJ0RmlsdGVyczogRmlsdGVyW10gPSBbXTtcblx0XHRpZiAoIWNvbnRyb2xsZXIgfHwgIWludGVybmFsQ29udGV4dCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblxuXHRcdC8vIEFkZCBmaWx0ZXJzIHJlbGF0ZWQgdG8gdGhlIGNoYXJ0IGZvciBBTFBcblx0XHRjb25zdCBjaGFydCA9IChjb250cm9sbGVyIGFzIGFueSkuZ2V0Q2hhcnRDb250cm9sPy4oKTtcblx0XHRjb25zdCBjaGFydEFQSSA9IGNoYXJ0ICYmIGNoYXJ0LmdldFBhcmVudCgpO1xuXHRcdGlmIChjaGFydEFQSSAmJiBjaGFydEFQSS5oYXNTZWxlY3Rpb25zKCkpIHtcblx0XHRcdGNvbnN0IGNoYXJ0RmlsdGVySW5mbyA9IENoYXJ0VXRpbHMuZ2V0QWxsRmlsdGVySW5mbyhjaGFydCk7XG5cdFx0XHRpZiAoY2hhcnRGaWx0ZXJJbmZvLmZpbHRlcnMubGVuZ3RoKSB7XG5cdFx0XHRcdGNoYXJ0RmlsdGVySW5mby5maWx0ZXJzID0gQ29tbW9uVXRpbHMuZ2V0Q2hhcnRQcm9wZXJ0aWVzV2l0aG91dFByZWZpeGVzKGNoYXJ0RmlsdGVySW5mby5maWx0ZXJzKTtcblx0XHRcdFx0Y2hhcnRGaWx0ZXJzID0gW25ldyBGaWx0ZXIoeyBmaWx0ZXJzOiBjaGFydEZpbHRlckluZm8uZmlsdGVycywgYW5kOiB0cnVlIH0pXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3QgYWRkaXRpb25hbEZpbHRlcnMgPSBbLi4uVGFibGVVdGlscy5nZXRIaWRkZW5GaWx0ZXJzKHRhYmxlKSwgLi4uY2hhcnRGaWx0ZXJzXTtcblxuXHRcdGZvciAoY29uc3QgayBpbiBzdkl0ZW1zKSB7XG5cdFx0XHRjb25zdCBpdGVtS2V5ID0gc3ZJdGVtc1trXS5nZXRLZXkoKSxcblx0XHRcdFx0ZmlsdGVySW5mb3MgPSBDb21tb25VdGlscy5nZXRGaWx0ZXJzSW5mb0ZvclNWKHRhYmxlLCBpdGVtS2V5KTtcblxuXHRcdFx0cXVpY2tGaWx0ZXJDb3VudHNba10gPSBcIi4uLlwiO1xuXHRcdFx0YmluZGluZ1Byb21pc2VzLnB1c2goXG5cdFx0XHRcdFRhYmxlVXRpbHMuZ2V0TGlzdEJpbmRpbmdGb3JDb3VudCh0YWJsZSwgdGFibGUuZ2V0QmluZGluZ0NvbnRleHQoKSwge1xuXHRcdFx0XHRcdGJhdGNoR3JvdXBJZDogaXRlbUtleSA9PT0gY3VycmVudEZpbHRlcktleSA/IFwiJGF1dG8uV29ya2Vyc1wiIDogXCIkYXV0b1wiLFxuXHRcdFx0XHRcdGFkZGl0aW9uYWxGaWx0ZXJzOiBbLi4uYWRkaXRpb25hbEZpbHRlcnMsIC4uLmZpbHRlckluZm9zLmZpbHRlcnNdXG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRpbnRlcm5hbENvbnRleHQuc2V0UHJvcGVydHkoXCJxdWlja0ZpbHRlcnNcIiwgeyBjb3VudHM6IHF1aWNrRmlsdGVyQ291bnRzIH0pO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBjb3VudHMgPSAoYXdhaXQgUHJvbWlzZS5hbGwoYmluZGluZ1Byb21pc2VzKSkgYXMgbnVtYmVyW107XG5cdFx0XHRmb3IgKGNvbnN0IGsgaW4gY291bnRzKSB7XG5cdFx0XHRcdGludGVybmFsQ29udGV4dC5zZXRQcm9wZXJ0eShgcXVpY2tGaWx0ZXJzL2NvdW50cy8ke2t9YCwgVGFibGVVdGlscy5nZXRDb3VudEZvcm1hdHRlZChjb3VudHNba10pKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcjogdW5rbm93bikge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgYmluZGluZyBwcm9taXNlc1wiLCBlcnJvciBhcyBzdHJpbmcpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRNZXNzYWdlTWFuYWdlcigpIHtcblx0XHRyZXR1cm4gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIHRoZSBzZWxlY3Rpb24gaW4gdGhlIHRhYmxlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBldmVudCgpXG5cdHNlbGVjdGlvbkNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdF9nZXRSb3dCaW5kaW5nKCkge1xuXHRcdGNvbnN0IG9UYWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdHJldHVybiBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHR9XG5cblx0Z2V0Q291bnRzKCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0Y29uc3Qgb1RhYmxlID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cdFx0cmV0dXJuIFRhYmxlVXRpbHMuZ2V0TGlzdEJpbmRpbmdGb3JDb3VudChvVGFibGUsIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpLCB7XG5cdFx0XHRiYXRjaEdyb3VwSWQ6ICF0aGlzLmdldFByb3BlcnR5KFwiYmluZGluZ1N1c3BlbmRlZFwiKSA/IG9UYWJsZS5kYXRhKFwiYmF0Y2hHcm91cElkXCIpIDogXCIkYXV0b1wiLFxuXHRcdFx0YWRkaXRpb25hbEZpbHRlcnM6IFRhYmxlVXRpbHMuZ2V0SGlkZGVuRmlsdGVycyhvVGFibGUpXG5cdFx0fSlcblx0XHRcdC50aGVuKChpVmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gVGFibGVVdGlscy5nZXRDb3VudEZvcm1hdHRlZChpVmFsdWUpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBcIjBcIjtcblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIGNvbnRleHQgY2hhbmdlIG9uIHRoZSB0YWJsZS5cblx0ICogQW4gZXZlbnQgaXMgZmlyZWQgdG8gcHJvcGFnYXRlIHRoZSBPZGF0YUxpc3RCaW5kaW5nIGV2ZW50IGFuZCB0aGUgZW5hYmxlbWVudFxuXHQgKiBvZiB0aGUgY3JlYXRpb24gcm93IGlzIGNhbGN1bGF0ZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB1aTVFdmVudCBUaGUgVUk1IGV2ZW50XG5cdCAqL1xuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25Db250ZXh0Q2hhbmdlKHVpNUV2ZW50OiBVSTVFdmVudCkge1xuXHRcdHRoaXMuZmlyZUV2ZW50KFwiY29udGV4dENoYW5nZVwiLCB1aTVFdmVudC5nZXRQYXJhbWV0ZXJzKCkpO1xuXHRcdHRoaXMuc2V0RmFzdENyZWF0aW9uUm93RW5hYmxlbWVudCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIGNoYW5nZSBvbiBhIHF1aWNrRmlsdGVyXG5cdCAqIFRoZSB0YWJsZSBpcyByZWJvdW5kIGlmIHRoZSBGaWx0ZXJCYXIgaXMgbm90IHN1c3BlbmRlZCBhbmQgdXBkYXRlIHRoZSBBcHBTdGF0ZS5cblx0ICpcblx0ICovXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRvblF1aWNrRmlsdGVyU2VsZWN0aW9uQ2hhbmdlKCkge1xuXHRcdGNvbnN0IHRhYmxlID0gdGhpcy5jb250ZW50IGFzIFRhYmxlO1xuXHRcdC8vIFJlYmluZCB0aGUgdGFibGUgdG8gcmVmbGVjdCB0aGUgY2hhbmdlIGluIHF1aWNrIGZpbHRlciBrZXkuXG5cdFx0Ly8gV2UgZG9uJ3QgcmViaW5kIHRoZSB0YWJsZSBpZiB0aGUgZmlsdGVyQmFyIGZvciB0aGUgdGFibGUgaXMgc3VzcGVuZGVkXG5cdFx0Ly8gYXMgcmViaW5kIHdpbGwgYmUgZG9uZSB3aGVuIHRoZSBmaWx0ZXJCYXIgaXMgcmVzdW1lZFxuXHRcdGNvbnN0IGZpbHRlckJhcklEID0gdGFibGUuZ2V0RmlsdGVyKCk7XG5cdFx0Y29uc3QgZmlsdGVyQmFyID0gKGZpbHRlckJhcklEICYmIENvcmUuYnlJZChmaWx0ZXJCYXJJRCkpIGFzIEZpbHRlckJhciB8IHVuZGVmaW5lZDtcblx0XHRpZiAoIWZpbHRlckJhcj8uZ2V0U3VzcGVuZFNlbGVjdGlvbj8uKCkpIHtcblx0XHRcdHRhYmxlLnJlYmluZCgpO1xuXHRcdH1cblx0XHQoQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0Vmlldyh0aGlzKT8uZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyIHwgdW5kZWZpbmVkKT8uZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0fVxuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRvblRhYmxlUm93UHJlc3Mob0V2ZW50OiBVSTVFdmVudCwgb0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLCBvQ29udGV4dDogQ29udGV4dCwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdC8vIHByZXZlbnQgbmF2aWdhdGlvbiB0byBhbiBlbXB0eSByb3dcblx0XHRpZiAob0NvbnRleHQgJiYgb0NvbnRleHQuaXNJbmFjdGl2ZSgpICYmIG9Db250ZXh0LmlzVHJhbnNpZW50KCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Ly8gSW4gdGhlIGNhc2Ugb2YgYW4gYW5hbHl0aWNhbCB0YWJsZSwgaWYgd2UncmUgdHJ5aW5nIHRvIG5hdmlnYXRlIHRvIGEgY29udGV4dCBjb3JyZXNwb25kaW5nIHRvIGEgdmlzdWFsIGdyb3VwIG9yIGdyYW5kIHRvdGFsXG5cdFx0Ly8gLS0+IENhbmNlbCBuYXZpZ2F0aW9uXG5cdFx0aWYgKFxuXHRcdFx0dGhpcy5nZXRUYWJsZURlZmluaXRpb24oKS5lbmFibGVBbmFseXRpY3MgJiZcblx0XHRcdG9Db250ZXh0ICYmXG5cdFx0XHRvQ29udGV4dC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFwiKSAmJlxuXHRcdFx0dHlwZW9mIG9Db250ZXh0LmdldFByb3BlcnR5KFwiQCR1aTUubm9kZS5pc0V4cGFuZGVkXCIpID09PSBcImJvb2xlYW5cIlxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBuYXZpZ2F0aW9uUGFyYW1ldGVycyA9IE9iamVjdC5hc3NpZ24oe30sIG1QYXJhbWV0ZXJzLCB7IHJlYXNvbjogTmF2aWdhdGlvblJlYXNvbi5Sb3dQcmVzcyB9KTtcblx0XHRcdChvQ29udHJvbGxlciBhcyBhbnkpLl9yb3V0aW5nLm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dChvQ29udGV4dCwgbmF2aWdhdGlvblBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRvbkludGVybmFsUGF0Y2hDb21wbGV0ZWQoKSB7XG5cdFx0Ly8gQkNQOiAyMzgwMDIzMDkwXG5cdFx0Ly8gV2UgaGFuZGxlIGVuYWJsZW1lbnQgb2YgRGVsZXRlIGZvciB0aGUgdGFibGUgaGVyZS5cblx0XHQvLyBFZGl0Rmxvdy50cyNoYW5kbGVQYXRjaFNlbnQgaXMgaGFuZGxpbmcgdGhlIGFjdGlvbiBlbmFibGVtZW50LlxuXHRcdGNvbnN0IGludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdGNvbnN0IHNlbGVjdGVkQ29udGV4dHMgPSB0aGlzLmdldFNlbGVjdGVkQ29udGV4dHMoKTtcblx0XHREZWxldGVIZWxwZXIudXBkYXRlRGVsZXRlSW5mb0ZvclNlbGVjdGVkQ29udGV4dHMoaW50ZXJuYWxNb2RlbENvbnRleHQsIHNlbGVjdGVkQ29udGV4dHMpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGlmIChvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiZXJyb3JcIikpIHtcblx0XHRcdHRoaXMuZ2V0Q29udHJvbGxlcigpLm1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKCk7XG5cdFx0fVxuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkKG9FdmVudDogVUk1RXZlbnQpIHtcblx0XHRjb25zdCB0YWJsZSA9IHRoaXMuY29udGVudCBhcyBUYWJsZTtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiZGF0YUluaXRpYWxpemVkXCIsIHRydWUpO1xuXHRcdCh0aGlzIGFzIGFueSkuZmlyZUV2ZW50KFwiaW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIsIG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkpO1xuXHRcdGlmICh0YWJsZS5nZXRRdWlja0ZpbHRlcigpICYmIHRoaXMuZ2V0VGFibGVEZWZpbml0aW9uKCkuY29udHJvbC5maWx0ZXJzPy5xdWlja0ZpbHRlcnM/LnNob3dDb3VudHMpIHtcblx0XHRcdHRoaXMudXBkYXRlUXVpY2tGaWx0ZXJDb3VudHMoKTtcblx0XHR9XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25QYXN0ZShvRXZlbnQ6IFVJNUV2ZW50LCBvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIpIHtcblx0XHQvLyBJZiBwYXN0ZSBpcyBkaXNhYmxlIG9yIGlmIHdlJ3JlIG5vdCBpbiBlZGl0IG1vZGUsIHdlIGNhbid0IHBhc3RlIGFueXRoaW5nXG5cdFx0aWYgKCF0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmVuYWJsZVBhc3RlIHx8ICEodGhpcy5nZXRNb2RlbChcInVpXCIpIGFzIEpTT05Nb2RlbCkuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IGFSYXdQYXN0ZWREYXRhID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImRhdGFcIiksXG5cdFx0XHRvVGFibGUgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgVGFibGU7XG5cblx0XHRpZiAob1RhYmxlLmdldEVuYWJsZVBhc3RlKCkgPT09IHRydWUpIHtcblx0XHRcdFBhc3RlSGVscGVyLnBhc3RlRGF0YShhUmF3UGFzdGVkRGF0YSwgb1RhYmxlLCBvQ29udHJvbGxlcik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG9SZXNvdXJjZU1vZGVsID0gc2FwLnVpLmdldENvcmUoKS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRcdE1lc3NhZ2VCb3guZXJyb3Iob1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfT1BfQ09OVFJPTExFUl9TQVBGRV9QQVNURV9ESVNBQkxFRF9NRVNTQUdFXCIpLCB7XG5cdFx0XHRcdHRpdGxlOiBvUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfRVJST1JcIilcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdC8vIFRoaXMgZXZlbnQgd2lsbCBhbGxvdyB1cyB0byBpbnRlcmNlcHQgdGhlIGV4cG9ydCBiZWZvcmUgaXMgdHJpZ2dlcmVkIHRvIGNvdmVyIHNwZWNpZmljIGNhc2VzXG5cdC8vIHRoYXQgY291bGRuJ3QgYmUgYWRkcmVzc2VkIG9uIHRoZSBwcm9wZXJ0eUluZm9zIGZvciBlYWNoIGNvbHVtbi5cblx0Ly8gZS5nLiBGaXhlZCBUYXJnZXQgVmFsdWUgZm9yIHRoZSBkYXRhcG9pbnRzXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRvbkJlZm9yZUV4cG9ydChleHBvcnRFdmVudDogVUk1RXZlbnQpIHtcblx0XHRjb25zdCBpc1NwbGl0TW9kZSA9IGV4cG9ydEV2ZW50LmdldFBhcmFtZXRlcihcInVzZXJFeHBvcnRTZXR0aW5nc1wiKS5zcGxpdENlbGxzLFxuXHRcdFx0dGFibGVDb250cm9sbGVyID0gZXhwb3J0RXZlbnQuZ2V0U291cmNlKCkgYXMgUGFnZUNvbnRyb2xsZXIsXG5cdFx0XHRleHBvcnRTZXR0aW5ncyA9IGV4cG9ydEV2ZW50LmdldFBhcmFtZXRlcihcImV4cG9ydFNldHRpbmdzXCIpLFxuXHRcdFx0dGFibGVEZWZpbml0aW9uID0gdGhpcy5nZXRUYWJsZURlZmluaXRpb24oKTtcblxuXHRcdFRhYmxlQVBJLnVwZGF0ZUV4cG9ydFNldHRpbmdzKGV4cG9ydFNldHRpbmdzLCB0YWJsZURlZmluaXRpb24sIHRhYmxlQ29udHJvbGxlciwgaXNTcGxpdE1vZGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIE1EQyBEYXRhU3RhdGVJbmRpY2F0b3IgcGx1Z2luIHRvIGRpc3BsYXkgbWVzc2FnZVN0cmlwIG9uIGEgdGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWVzc2FnZVxuXHQgKiBAcGFyYW0gb1RhYmxlXG5cdCAqIEBuYW1lIGRhdGFTdGF0ZUZpbHRlclxuXHQgKiBAcmV0dXJucyBXaGV0aGVyIHRvIHJlbmRlciB0aGUgbWVzc2FnZVN0cmlwIHZpc2libGVcblx0ICovXG5cdHN0YXRpYyBkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXIob01lc3NhZ2U6IGFueSwgb1RhYmxlOiBhbnkpOiBib29sZWFuIHtcblx0XHRjb25zdCBzVGFibGVDb250ZXh0QmluZGluZ1BhdGggPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IHNUYWJsZVJvd0JpbmRpbmcgPSAoc1RhYmxlQ29udGV4dEJpbmRpbmdQYXRoID8gYCR7c1RhYmxlQ29udGV4dEJpbmRpbmdQYXRofS9gIDogXCJcIikgKyBvVGFibGUuZ2V0Um93QmluZGluZygpLmdldFBhdGgoKTtcblx0XHRyZXR1cm4gc1RhYmxlUm93QmluZGluZyA9PT0gb01lc3NhZ2UuZ2V0VGFyZ2V0KCkgPyB0cnVlIDogZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBldmVudCBoYW5kbGVzIHRoZSBEYXRhU3RhdGUgb2YgdGhlIERhdGFTdGF0ZUluZGljYXRvciBwbHVnaW4gZnJvbSBNREMgb24gYSB0YWJsZS5cblx0ICogSXQncyBmaXJlZCB3aGVuIG5ldyBlcnJvciBtZXNzYWdlcyBhcmUgc2VudCBmcm9tIHRoZSBiYWNrZW5kIHRvIHVwZGF0ZSByb3cgaGlnaGxpZ2h0aW5nLlxuXHQgKlxuXHQgKiBAbmFtZSBvbkRhdGFTdGF0ZUNoYW5nZVxuXHQgKiBAcGFyYW0gb0V2ZW50IEV2ZW50IG9iamVjdFxuXHQgKi9cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uRGF0YVN0YXRlQ2hhbmdlKG9FdmVudDogVUk1RXZlbnQpIHtcblx0XHRjb25zdCBvRGF0YVN0YXRlSW5kaWNhdG9yID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIERhdGFTdGF0ZUluZGljYXRvcjtcblx0XHRjb25zdCBhRmlsdGVyZWRNZXNzYWdlcyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJmaWx0ZXJlZE1lc3NhZ2VzXCIpO1xuXHRcdGlmIChhRmlsdGVyZWRNZXNzYWdlcykge1xuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWwgPSBvRGF0YVN0YXRlSW5kaWNhdG9yLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCJmaWx0ZXJlZE1lc3NhZ2VzXCIsIGFGaWx0ZXJlZE1lc3NhZ2VzLCBvRGF0YVN0YXRlSW5kaWNhdG9yLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgQ29udGV4dCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGNvbHVtbnMgdG8gYmUgZXhwb3J0ZWQgb2YgYSB0YWJsZS5cblx0ICpcblx0ICogQHBhcmFtIGV4cG9ydFNldHRpbmdzIFRoZSB0YWJsZSBleHBvcnQgc2V0dGluZ3Ncblx0ICogQHBhcmFtIHRhYmxlRGVmaW5pdGlvbiBUaGUgdGFibGUgZGVmaW5pdGlvbiBmcm9tIHRoZSB0YWJsZSBjb252ZXJ0ZXJcblx0ICogQHBhcmFtIHRhYmxlQ29udHJvbGxlciBUaGUgdGFibGUgY29udHJvbGxlclxuXHQgKiBAcGFyYW0gaXNTcGxpdE1vZGUgRGVmaW5lcyBpZiB0aGUgZXhwb3J0IGhhcyBiZWVuIGxhdW5jaGVkIHVzaW5nIHNwbGl0IG1vZGVcblx0ICogQHJldHVybnMgVGhlIHVwZGF0ZWQgY29sdW1ucyB0byBiZSBleHBvcnRlZFxuXHQgKi9cblx0c3RhdGljIHVwZGF0ZUV4cG9ydFNldHRpbmdzKFxuXHRcdGV4cG9ydFNldHRpbmdzOiBleHBvcnRTZXR0aW5ncyxcblx0XHR0YWJsZURlZmluaXRpb246IFRhYmxlVmlzdWFsaXphdGlvbixcblx0XHR0YWJsZUNvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLFxuXHRcdGlzU3BsaXRNb2RlOiBib29sZWFuXG5cdCk6IGV4cG9ydFNldHRpbmdzIHtcblx0XHQvL1NldCBzdGF0aWMgc2l6ZUxpbWl0IGR1cmluZyBleHBvcnRcblx0XHRjb25zdCBjb2x1bW5zID0gdGFibGVEZWZpbml0aW9uLmNvbHVtbnM7XG5cdFx0aWYgKFxuXHRcdFx0IXRhYmxlRGVmaW5pdGlvbi5lbmFibGVBbmFseXRpY3MgJiZcblx0XHRcdCh0YWJsZURlZmluaXRpb24uY29udHJvbC50eXBlID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiIHx8IHRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnR5cGUgPT09IFwiR3JpZFRhYmxlXCIpXG5cdFx0KSB7XG5cdFx0XHRleHBvcnRTZXR0aW5ncy5kYXRhU291cmNlLnNpemVMaW1pdCA9IDEwMDA7XG5cdFx0fVxuXHRcdGNvbnN0IGV4cG9ydENvbHVtbnMgPSBleHBvcnRTZXR0aW5ncy53b3JrYm9vay5jb2x1bW5zO1xuXHRcdGZvciAobGV0IGluZGV4ID0gZXhwb3J0Q29sdW1ucy5sZW5ndGggLSAxOyBpbmRleCA+PSAwOyBpbmRleC0tKSB7XG5cdFx0XHRjb25zdCBleHBvcnRDb2x1bW4gPSBleHBvcnRDb2x1bW5zW2luZGV4XTtcblx0XHRcdGNvbnN0IHJlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUubWFjcm9zXCIpO1xuXHRcdFx0ZXhwb3J0Q29sdW1uLmxhYmVsID0gZ2V0TG9jYWxpemVkVGV4dChleHBvcnRDb2x1bW4ubGFiZWwsIHRhYmxlQ29udHJvbGxlcik7XG5cdFx0XHQvL3RyYW5zbGF0ZSBib29sZWFuIHZhbHVlc1xuXHRcdFx0aWYgKGV4cG9ydENvbHVtbi50eXBlID09PSBcIkJvb2xlYW5cIikge1xuXHRcdFx0XHRleHBvcnRDb2x1bW4uZmFsc2VWYWx1ZSA9IHJlc291cmNlQnVuZGxlLmdldFRleHQoXCJub1wiKTtcblx0XHRcdFx0ZXhwb3J0Q29sdW1uLnRydWVWYWx1ZSA9IHJlc291cmNlQnVuZGxlLmdldFRleHQoXCJ5ZXNcIik7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCB0YXJnZXRWYWx1ZUNvbHVtbiA9IGNvbHVtbnM/LmZpbmQoKGNvbHVtbikgPT4ge1xuXHRcdFx0XHRpZiAoaXNTcGxpdE1vZGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5jb2x1bW5XaXRoVGFyZ2V0VmFsdWVUb0JlQWRkZWQoY29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbiwgZXhwb3J0Q29sdW1uKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYgKHRhcmdldFZhbHVlQ29sdW1uKSB7XG5cdFx0XHRcdGNvbnN0IGNvbHVtblRvQmVBZGRlZCA9IHtcblx0XHRcdFx0XHRsYWJlbDogcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRhcmdldFZhbHVlXCIpLFxuXHRcdFx0XHRcdHByb3BlcnR5OiBBcnJheS5pc0FycmF5KGV4cG9ydENvbHVtbi5wcm9wZXJ0eSkgPyBleHBvcnRDb2x1bW4ucHJvcGVydHkgOiBbZXhwb3J0Q29sdW1uLnByb3BlcnR5XSxcblx0XHRcdFx0XHR0ZW1wbGF0ZTogKHRhcmdldFZhbHVlQ29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbikuZXhwb3J0RGF0YVBvaW50VGFyZ2V0VmFsdWVcblx0XHRcdFx0fTtcblx0XHRcdFx0ZXhwb3J0Q29sdW1ucy5zcGxpY2UoaW5kZXggKyAxLCAwLCBjb2x1bW5Ub0JlQWRkZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZXhwb3J0U2V0dGluZ3M7XG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lcyBpZiBhIGNvbHVtbiB0aGF0IGlzIHRvIGJlIGV4cG9ydGVkIGFuZCBjb250YWlucyBhIERhdGFQb2ludCB3aXRoIGEgZml4ZWQgdGFyZ2V0IHZhbHVlIG5lZWRzIHRvIGJlIGFkZGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29sdW1uIFRoZSBjb2x1bW4gZnJvbSB0aGUgYW5ub3RhdGlvbnMgY29sdW1uXG5cdCAqIEBwYXJhbSBjb2x1bW5FeHBvcnQgVGhlIGNvbHVtbiB0byBiZSBleHBvcnRlZFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHJlZmVyZW5jZWQgY29sdW1uIGhhcyBkZWZpbmVkIGEgdGFyZ2V0VmFsdWUgZm9yIHRoZSBkYXRhUG9pbnQsIGZhbHNlIGVsc2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHN0YXRpYyBjb2x1bW5XaXRoVGFyZ2V0VmFsdWVUb0JlQWRkZWQoY29sdW1uOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4sIGNvbHVtbkV4cG9ydDogZXhwb3J0Q29sdW1uKTogYm9vbGVhbiB7XG5cdFx0bGV0IGNvbHVtbk5lZWRzVG9CZUFkZGVkID0gZmFsc2U7XG5cdFx0aWYgKGNvbHVtbi5leHBvcnREYXRhUG9pbnRUYXJnZXRWYWx1ZSAmJiBjb2x1bW4ucHJvcGVydHlJbmZvcz8ubGVuZ3RoID09PSAxKSB7XG5cdFx0XHQvL0FkZCBUYXJnZXRWYWx1ZSBjb2x1bW4gd2hlbiBleHBvcnRpbmcgb24gc3BsaXQgbW9kZVxuXHRcdFx0aWYgKFxuXHRcdFx0XHRjb2x1bW4ucmVsYXRpdmVQYXRoID09PSBjb2x1bW5FeHBvcnQucHJvcGVydHkgfHxcblx0XHRcdFx0Y29sdW1uRXhwb3J0LnByb3BlcnR5WzBdID09PSBjb2x1bW4ucHJvcGVydHlJbmZvc1swXSB8fFxuXHRcdFx0XHRjb2x1bW5FeHBvcnQucHJvcGVydHkuaW5jbHVkZXMoY29sdW1uLnJlbGF0aXZlUGF0aCkgfHxcblx0XHRcdFx0Y29sdW1uRXhwb3J0LnByb3BlcnR5LmluY2x1ZGVzKGNvbHVtbi5uYW1lKVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIHBhcnQgb2YgYSBGaWVsZEdyb3VwIG9yIGZyb20gYSBsaW5lSXRlbSBvciBmcm9tIGEgY29sdW1uIG9uIHRoZSBlbnRpdHlTZXRcblx0XHRcdFx0ZGVsZXRlIGNvbHVtbkV4cG9ydC50ZW1wbGF0ZTtcblx0XHRcdFx0Y29sdW1uTmVlZHNUb0JlQWRkZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gY29sdW1uTmVlZHNUb0JlQWRkZWQ7XG5cdH1cblxuXHRyZXN1bWVCaW5kaW5nKGJSZXF1ZXN0SWZOb3RJbml0aWFsaXplZDogYm9vbGVhbikge1xuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJiaW5kaW5nU3VzcGVuZGVkXCIsIGZhbHNlKTtcblx0XHRpZiAoKGJSZXF1ZXN0SWZOb3RJbml0aWFsaXplZCAmJiAhKHRoaXMgYXMgYW55KS5nZXREYXRhSW5pdGlhbGl6ZWQoKSkgfHwgdGhpcy5nZXRQcm9wZXJ0eShcIm91dERhdGVkQmluZGluZ1wiKSkge1xuXHRcdFx0dGhpcy5zZXRQcm9wZXJ0eShcIm91dERhdGVkQmluZGluZ1wiLCBmYWxzZSk7XG5cdFx0XHQodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKT8ucmViaW5kKCk7XG5cdFx0fVxuXHR9XG5cblx0cmVmcmVzaE5vdEFwcGxpY2FibGVGaWVsZHMob0ZpbHRlckNvbnRyb2w6IENvbnRyb2wpOiBhbnlbXSB7XG5cdFx0Y29uc3Qgb1RhYmxlID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cdFx0cmV0dXJuIEZpbHRlclV0aWxzLmdldE5vdEFwcGxpY2FibGVGaWx0ZXJzKG9GaWx0ZXJDb250cm9sLCBvVGFibGUpO1xuXHR9XG5cblx0c3VzcGVuZEJpbmRpbmcoKSB7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcImJpbmRpbmdTdXNwZW5kZWRcIiwgdHJ1ZSk7XG5cdH1cblxuXHRpbnZhbGlkYXRlQ29udGVudCgpIHtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiZGF0YUluaXRpYWxpemVkXCIsIGZhbHNlKTtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwib3V0RGF0ZWRCaW5kaW5nXCIsIGZhbHNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBlbmFibGVtZW50IG9mIHRoZSBjcmVhdGlvbiByb3cuXG5cdCAqIEBwcml2YXRlXG5cdCAqXG5cdCAqL1xuXHRzZXRGYXN0Q3JlYXRpb25Sb3dFbmFibGVtZW50KCkge1xuXHRcdGNvbnN0IHRhYmxlID0gdGhpcy5jb250ZW50IGFzIFRhYmxlO1xuXHRcdGNvbnN0IGZhc3RDcmVhdGlvblJvdyA9IHRhYmxlLmdldENyZWF0aW9uUm93KCk7XG5cblx0XHRpZiAoZmFzdENyZWF0aW9uUm93ICYmICFmYXN0Q3JlYXRpb25Sb3cuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0Y29uc3QgdGFibGVCaW5kaW5nID0gdGFibGUuZ2V0Um93QmluZGluZygpO1xuXHRcdFx0Y29uc3QgYmluZGluZ0NvbnRleHQgPSB0YWJsZUJpbmRpbmcuZ2V0Q29udGV4dCgpIGFzIENvbnRleHQ7XG5cblx0XHRcdGlmIChiaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0XHRUYWJsZUhlbHBlci5lbmFibGVGYXN0Q3JlYXRpb25Sb3coXG5cdFx0XHRcdFx0ZmFzdENyZWF0aW9uUm93LFxuXHRcdFx0XHRcdHRhYmxlQmluZGluZy5nZXRQYXRoKCksXG5cdFx0XHRcdFx0YmluZGluZ0NvbnRleHQsXG5cdFx0XHRcdFx0YmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHQodGFibGUuZ2V0TW9kZWwoXCJ1aVwiKSBhcyBKU09OTW9kZWwpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIilcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byBjcmVhdGUgaW5zaWdodHNQYXJhbXMgYW5kIGNhbGwgdGhlIEFQSSB0byBzaG93IGluc2lnaHRzIGNhcmQgcHJldmlldyBmb3IgdGFibGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFVuZGVmaW5lZCBpZiBjYXJkIHByZXZpZXcgaXMgcmVuZGVyZWQuXG5cdCAqL1xuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0YXN5bmMgb25BZGRDYXJkVG9JbnNpZ2h0c1ByZXNzZWQoKSB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGluc2lnaHRzUmVsZXZhbnRDb2x1bW5zID0gZ2V0SW5zaWdodHNSZWxldmFudENvbHVtbnModGhpcykgYXMgSW5zaWdodHNDYXJkQ29sdW1uc1R5cGVbXTtcblx0XHRcdGNvbnN0IGluc2lnaHRzUGFyYW1zID0gYXdhaXQgY3JlYXRlSW5zaWdodHNQYXJhbXModGhpcywgSW50ZWdyYXRpb25DYXJkVHlwZS50YWJsZSwgaW5zaWdodHNSZWxldmFudENvbHVtbnMpO1xuXHRcdFx0aWYgKGluc2lnaHRzUGFyYW1zKSB7XG5cdFx0XHRcdHNob3dJbnNpZ2h0c0NhcmRQcmV2aWV3KGluc2lnaHRzUGFyYW1zKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGdlbmVyaWNFcnJvck1lc3NhZ2VGb3JJbnNpZ2h0c0NhcmQodGhpcy5jb250ZW50KTtcblx0XHRcdExvZy5lcnJvcihlIGFzIHN0cmluZyk7XG5cdFx0fVxuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uTWFzc0VkaXRCdXR0b25QcmVzc2VkKG9FdmVudDogVUk1RXZlbnQsIHBhZ2VDb250cm9sbGVyOiBhbnkpIHtcblx0XHRjb25zdCBvVGFibGUgPSB0aGlzLmNvbnRlbnQ7XG5cdFx0aWYgKHBhZ2VDb250cm9sbGVyICYmIHBhZ2VDb250cm9sbGVyLm1hc3NFZGl0KSB7XG5cdFx0XHRwYWdlQ29udHJvbGxlci5tYXNzRWRpdC5vcGVuTWFzc0VkaXREaWFsb2cob1RhYmxlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLndhcm5pbmcoXCJUaGUgQ29udHJvbGxlciBpcyBub3QgZW5oYW5jZWQgd2l0aCBNYXNzIEVkaXQgZnVuY3Rpb25hbGl0eVwiKTtcblx0XHR9XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25UYWJsZVNlbGVjdGlvbkNoYW5nZShvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0dGhpcy5maXJlRXZlbnQoXCJzZWxlY3Rpb25DaGFuZ2VcIiwgb0V2ZW50LmdldFBhcmFtZXRlcnMoKSk7XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0YXN5bmMgb25BY3Rpb25QcmVzcyhvRXZlbnQ6IFVJNUV2ZW50LCBwYWdlQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIGFjdGlvbk5hbWU6IHN0cmluZywgcGFyYW1ldGVyczogYW55KSB7XG5cdFx0cGFyYW1ldGVycy5tb2RlbCA9IChvRXZlbnQuZ2V0U291cmNlKCkgYXMgQ29udHJvbCkuZ2V0TW9kZWwoKTtcblx0XHRsZXQgZXhlY3V0ZUFjdGlvbiA9IHRydWU7XG5cdFx0aWYgKHBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHRzICYmIHBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIElmIHdlIGhhdmUgbm9uIGFwcGxpY2FibGUgY29udGV4dHMsIHdlIG5lZWQgdG8gb3BlbiBhIGRpYWxvZyB0byBhc2sgdGhlIHVzZXIgaWYgaGUgd2FudHMgdG8gY29udGludWVcblx0XHRcdGNvbnN0IGNvbnZlcnRlZE1ldGFkYXRhID0gY29udmVydFR5cGVzKHBhcmFtZXRlcnMubW9kZWwuZ2V0TWV0YU1vZGVsKCkpO1xuXHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlZE1ldGFkYXRhLnJlc29sdmVQYXRoPEVudGl0eVR5cGU+KHRoaXMuZW50aXR5VHlwZUZ1bGx5UXVhbGlmaWVkTmFtZSkudGFyZ2V0ITtcblx0XHRcdGNvbnN0IG15VW5hcHBsaWNhYmxlQ29udGV4dERpYWxvZyA9IG5ldyBOb3RBcHBsaWNhYmxlQ29udGV4dERpYWxvZyh7XG5cdFx0XHRcdGVudGl0eVR5cGU6IGVudGl0eVR5cGUsXG5cdFx0XHRcdG5vdEFwcGxpY2FibGVDb250ZXh0czogcGFyYW1ldGVycy5ub3RBcHBsaWNhYmxlQ29udGV4dHMsXG5cdFx0XHRcdHRpdGxlOiBwYXJhbWV0ZXJzLmxhYmVsLFxuXHRcdFx0XHRyZXNvdXJjZU1vZGVsOiBnZXRSZXNvdXJjZU1vZGVsKHRoaXMpXG5cdFx0XHR9KTtcblx0XHRcdHBhcmFtZXRlcnMuY29udGV4dHMgPSBwYXJhbWV0ZXJzLmFwcGxpY2FibGVDb250ZXh0cztcblx0XHRcdGV4ZWN1dGVBY3Rpb24gPSBhd2FpdCBteVVuYXBwbGljYWJsZUNvbnRleHREaWFsb2cub3Blbih0aGlzKTtcblx0XHR9XG5cdFx0aWYgKGV4ZWN1dGVBY3Rpb24pIHtcblx0XHRcdC8vIERpcmVjdCBleGVjdXRpb24gb2YgdGhlIGFjdGlvblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHBhZ2VDb250cm9sbGVyLmVkaXRGbG93Lmludm9rZUFjdGlvbihhY3Rpb25OYW1lLCBwYXJhbWV0ZXJzKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0TG9nLmluZm8oZSBhcyBzdHJpbmcpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBFeHBvc2UgdGhlIGludGVybmFsIHRhYmxlIGRlZmluaXRpb24gZm9yIGV4dGVybmFsIHVzYWdlIGluIGRlbGVnYXRlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgdGFibGVEZWZpbml0aW9uXG5cdCAqL1xuXHRnZXRUYWJsZURlZmluaXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMudGFibGVEZWZpbml0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIGNvbm5lY3QgdGhlIGZpbHRlciB0byB0aGUgdGFibGVBUEkgaWYgcmVxdWlyZWRcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVBUElcblx0ICovXG5cblx0dXBkYXRlRmlsdGVyQmFyKCkge1xuXHRcdGNvbnN0IHRhYmxlID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cdFx0Y29uc3QgZmlsdGVyQmFyUmVmSWQgPSAodGhpcyBhcyBhbnkpLmdldEZpbHRlckJhcigpO1xuXHRcdGlmICh0YWJsZSAmJiBmaWx0ZXJCYXJSZWZJZCAmJiB0YWJsZS5nZXRGaWx0ZXIoKSAhPT0gZmlsdGVyQmFyUmVmSWQpIHtcblx0XHRcdHRoaXMuX3NldEZpbHRlckJhcihmaWx0ZXJCYXJSZWZJZCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGZpbHRlciBkZXBlbmRpbmcgb24gdGhlIHR5cGUgb2YgZmlsdGVyQmFyLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmlsdGVyQmFyUmVmSWQgSWQgb2YgdGhlIGZpbHRlciBiYXJcblx0ICogQHByaXZhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVBUElcblx0ICovXG5cdF9zZXRGaWx0ZXJCYXIoZmlsdGVyQmFyUmVmSWQ6IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IHRhYmxlID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cblx0XHQvLyAnZmlsdGVyQmFyJyBwcm9wZXJ0eSBvZiBtYWNybzpUYWJsZShwYXNzZWQgYXMgY3VzdG9tRGF0YSkgbWlnaHQgYmVcblx0XHQvLyAxLiBBIGxvY2FsSWQgd3J0IFZpZXcoRlBNIGV4cGxvcmVyIGV4YW1wbGUpLlxuXHRcdC8vIDIuIEFic29sdXRlIElkKHRoaXMgd2FzIG5vdCBzdXBwb3J0ZWQgaW4gb2xkZXIgdmVyc2lvbnMpLlxuXHRcdC8vIDMuIEEgbG9jYWxJZCB3cnQgRnJhZ21lbnRJZCh3aGVuIGFuIFhNTENvbXBvc2l0ZSBvciBGcmFnbWVudCBpcyBpbmRlcGVuZGVudGx5IHByb2Nlc3NlZCkgaW5zdGVhZCBvZiBWaWV3SWQuXG5cdFx0Ly8gICAgJ2ZpbHRlckJhcicgd2FzIHN1cHBvcnRlZCBlYXJsaWVyIGFzIGFuICdhc3NvY2lhdGlvbicgdG8gdGhlICdtZGM6VGFibGUnIGNvbnRyb2wgaW5zaWRlICdtYWNybzpUYWJsZScgaW4gcHJpb3IgdmVyc2lvbnMuXG5cdFx0Ly8gICAgSW4gbmV3ZXIgdmVyc2lvbnMgJ2ZpbHRlckJhcicgaXMgdXNlZCBsaWtlIGFuIGFzc29jaWF0aW9uIHRvICdtYWNybzpUYWJsZUFQSScuXG5cdFx0Ly8gICAgVGhpcyBtZWFucyB0aGF0IHRoZSBJZCBpcyByZWxhdGl2ZSB0byAnbWFjcm86VGFibGVBUEknLlxuXHRcdC8vICAgIFRoaXMgc2NlbmFyaW8gaGFwcGVucyBpbiBjYXNlIG9mIEZpbHRlckJhciBhbmQgVGFibGUgaW4gYSBjdXN0b20gc2VjdGlvbnMgaW4gT1Agb2YgRkVWNC5cblxuXHRcdGNvbnN0IHRhYmxlQVBJSWQgPSB0aGlzPy5nZXRJZCgpO1xuXHRcdGNvbnN0IHRhYmxlQVBJTG9jYWxJZCA9IHRoaXMuZGF0YShcInRhYmxlQVBJTG9jYWxJZFwiKTtcblx0XHRjb25zdCBwb3RlbnRpYWxmaWx0ZXJCYXJJZCA9XG5cdFx0XHR0YWJsZUFQSUxvY2FsSWQgJiYgZmlsdGVyQmFyUmVmSWQgJiYgdGFibGVBUElJZCAmJiB0YWJsZUFQSUlkLnJlcGxhY2UobmV3IFJlZ0V4cCh0YWJsZUFQSUxvY2FsSWQgKyBcIiRcIiksIGZpbHRlckJhclJlZklkKTsgLy8gM1xuXG5cdFx0Y29uc3QgZmlsdGVyQmFyID1cblx0XHRcdENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyk/LmJ5SWQoZmlsdGVyQmFyUmVmSWQpIHx8IENvcmUuYnlJZChmaWx0ZXJCYXJSZWZJZCkgfHwgQ29yZS5ieUlkKHBvdGVudGlhbGZpbHRlckJhcklkKTtcblxuXHRcdGlmIChmaWx0ZXJCYXIpIHtcblx0XHRcdGlmIChmaWx0ZXJCYXIuaXNBPEZpbHRlckJhckFQST4oXCJzYXAuZmUubWFjcm9zLmZpbHRlckJhci5GaWx0ZXJCYXJBUElcIikpIHtcblx0XHRcdFx0dGFibGUuc2V0RmlsdGVyKGAke2ZpbHRlckJhci5nZXRJZCgpfS1jb250ZW50YCk7XG5cdFx0XHR9IGVsc2UgaWYgKGZpbHRlckJhci5pc0E8RmlsdGVyQmFyPihcInNhcC51aS5tZGMuRmlsdGVyQmFyXCIpKSB7XG5cdFx0XHRcdHRhYmxlLnNldEZpbHRlcihmaWx0ZXJCYXIuZ2V0SWQoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y2hlY2tJZkNvbHVtbkV4aXN0cyhhRmlsdGVyZWRDb2x1bW1uczogYW55LCBjb2x1bW5OYW1lOiBhbnkpIHtcblx0XHRyZXR1cm4gYUZpbHRlcmVkQ29sdW1tbnMuc29tZShmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChvQ29sdW1uPy5jb2x1bW5OYW1lID09PSBjb2x1bW5OYW1lICYmIG9Db2x1bW4/LnNDb2x1bW5OYW1lVmlzaWJsZSkgfHxcblx0XHRcdFx0KG9Db2x1bW4/LnNUZXh0QXJyYW5nZW1lbnQgIT09IHVuZGVmaW5lZCAmJiBvQ29sdW1uPy5zVGV4dEFycmFuZ2VtZW50ID09PSBjb2x1bW5OYW1lKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiBjb2x1bW5OYW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Z2V0SWRlbnRpZmllckNvbHVtbigpOiBhbnkge1xuXHRcdGNvbnN0IG9UYWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdGNvbnN0IGhlYWRlckluZm9UaXRsZVBhdGggPSB0aGlzLmdldFRhYmxlRGVmaW5pdGlvbigpLmhlYWRlckluZm9UaXRsZTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlICYmIG9UYWJsZS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0c0N1cnJlbnRFbnRpdHlTZXROYW1lID0gb1RhYmxlLmRhdGEoXCJtZXRhUGF0aFwiKTtcblx0XHRjb25zdCBhVGVjaG5pY2FsS2V5cyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJFR5cGUvJEtleWApO1xuXHRcdGNvbnN0IGFGaWx0ZXJlZFRlY2huaWNhbEtleXM6IHN0cmluZ1tdID0gW107XG5cblx0XHRpZiAoYVRlY2huaWNhbEtleXMgJiYgYVRlY2huaWNhbEtleXMubGVuZ3RoID4gMCkge1xuXHRcdFx0YVRlY2huaWNhbEtleXMuZm9yRWFjaChmdW5jdGlvbiAodGVjaG5pY2FsS2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0aWYgKHRlY2huaWNhbEtleSAhPT0gXCJJc0FjdGl2ZUVudGl0eVwiKSB7XG5cdFx0XHRcdFx0YUZpbHRlcmVkVGVjaG5pY2FsS2V5cy5wdXNoKHRlY2huaWNhbEtleSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zdCBzZW1hbnRpY0tleUNvbHVtbnMgPSB0aGlzLmdldFRhYmxlRGVmaW5pdGlvbigpLnNlbWFudGljS2V5cztcblxuXHRcdGNvbnN0IGFWaXNpYmxlQ29sdW1uczogYW55ID0gW107XG5cdFx0Y29uc3QgYUZpbHRlcmVkQ29sdW1tbnM6IGFueSA9IFtdO1xuXHRcdGNvbnN0IGFUYWJsZUNvbHVtbnMgPSBvVGFibGUuZ2V0Q29sdW1ucygpO1xuXHRcdGFUYWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRjb25zdCBjb2x1bW4gPSBvQ29sdW1uPy5nZXREYXRhUHJvcGVydHkoKTtcblx0XHRcdGFWaXNpYmxlQ29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0fSk7XG5cblx0XHRhVmlzaWJsZUNvbHVtbnMuZm9yRWFjaChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRjb25zdCBvVGV4dEFycmFuZ2VtZW50ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS8kVHlwZS8ke29Db2x1bW59QGApO1xuXHRcdFx0Y29uc3Qgc1RleHRBcnJhbmdlbWVudCA9IG9UZXh0QXJyYW5nZW1lbnQgJiYgb1RleHRBcnJhbmdlbWVudFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXT8uJFBhdGg7XG5cdFx0XHRjb25zdCBzVGV4dFBsYWNlbWVudCA9XG5cdFx0XHRcdG9UZXh0QXJyYW5nZW1lbnQgJiZcblx0XHRcdFx0b1RleHRBcnJhbmdlbWVudFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0/LiRFbnVtTWVtYmVyO1xuXHRcdFx0YUZpbHRlcmVkQ29sdW1tbnMucHVzaCh7XG5cdFx0XHRcdGNvbHVtbk5hbWU6IG9Db2x1bW4sXG5cdFx0XHRcdHNUZXh0QXJyYW5nZW1lbnQ6IHNUZXh0QXJyYW5nZW1lbnQsXG5cdFx0XHRcdHNDb2x1bW5OYW1lVmlzaWJsZTogIShzVGV4dFBsYWNlbWVudCA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIpXG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRsZXQgY29sdW1uOiBhbnk7XG5cblx0XHRpZiAoaGVhZGVySW5mb1RpdGxlUGF0aCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY2hlY2tJZkNvbHVtbkV4aXN0cyhhRmlsdGVyZWRDb2x1bW1ucywgaGVhZGVySW5mb1RpdGxlUGF0aCkpIHtcblx0XHRcdGNvbHVtbiA9IGhlYWRlckluZm9UaXRsZVBhdGg7XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdHNlbWFudGljS2V5Q29sdW1ucyAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRzZW1hbnRpY0tleUNvbHVtbnMubGVuZ3RoID09PSAxICYmXG5cdFx0XHR0aGlzLmNoZWNrSWZDb2x1bW5FeGlzdHMoYUZpbHRlcmVkQ29sdW1tbnMsIHNlbWFudGljS2V5Q29sdW1uc1swXSlcblx0XHQpIHtcblx0XHRcdGNvbHVtbiA9IHNlbWFudGljS2V5Q29sdW1uc1swXTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0YUZpbHRlcmVkVGVjaG5pY2FsS2V5cyAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRhRmlsdGVyZWRUZWNobmljYWxLZXlzLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0dGhpcy5jaGVja0lmQ29sdW1uRXhpc3RzKGFGaWx0ZXJlZENvbHVtbW5zLCBhRmlsdGVyZWRUZWNobmljYWxLZXlzWzBdKVxuXHRcdCkge1xuXHRcdFx0Y29sdW1uID0gYUZpbHRlcmVkVGVjaG5pY2FsS2V5c1swXTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbHVtbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBFbXB0eVJvd3NFbmFibGVkIHNldHRlci5cblx0ICpcblx0ICogQHBhcmFtIGVuYWJsZW1lbnRcblx0ICovXG5cdHNldEVtcHR5Um93c0VuYWJsZWQoZW5hYmxlbWVudDogYm9vbGVhbikge1xuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJlbXB0eVJvd3NFbmFibGVkXCIsIGVuYWJsZW1lbnQpO1xuXHRcdHRoaXMuc2V0VXBFbXB0eVJvd3ModGhpcy5jb250ZW50IGFzIFRhYmxlKTtcblx0fVxuXG5cdGFzeW5jIHNldFVwRW1wdHlSb3dzKHRhYmxlOiBUYWJsZSwgY3JlYXRlQnV0dG9uV2FzUHJlc3NlZDogYm9vbGVhbiA9IGZhbHNlKSB7XG5cdFx0aWYgKHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2w/LmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLklubGluZUNyZWF0aW9uUm93cykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHVpTW9kZWwgPSB0YWJsZS5nZXRNb2RlbChcInVpXCIpIGFzIEpTT05Nb2RlbCB8IHVuZGVmaW5lZDtcblx0XHRpZiAoIXVpTW9kZWwpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKHVpTW9kZWwuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVBlbmRpbmdcIikpIHtcblx0XHRcdC8vIFRoZSBlZGl0IG1vZGUgaXMgc3RpbGwgYmVpbmcgY29tcHV0ZWQsIHNvIHdlIHdhaXQgdW50aWwgdGhpcyBjb21wdXRhdGlvbiBpcyBkb25lIGJlZm9yZSBjaGVja2luZyBpdHMgdmFsdWVcblx0XHRcdGNvbnN0IHdhdGNoQmluZGluZyA9IHVpTW9kZWwuYmluZFByb3BlcnR5KFwiL2lzRWRpdGFibGVQZW5kaW5nXCIpO1xuXHRcdFx0YXdhaXQgbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcblx0XHRcdFx0Y29uc3QgZm5IYW5kbGVyID0gKCkgPT4ge1xuXHRcdFx0XHRcdHdhdGNoQmluZGluZy5kZXRhY2hDaGFuZ2UoZm5IYW5kbGVyKTtcblx0XHRcdFx0XHR3YXRjaEJpbmRpbmcuZGVzdHJveSgpO1xuXHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0d2F0Y2hCaW5kaW5nLmF0dGFjaENoYW5nZShmbkhhbmRsZXIpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IGlzSW5FZGl0TW9kZSA9IHVpTW9kZWwuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblx0XHRpZiAoIWlzSW5FZGl0TW9kZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHR0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sPy5pbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlICYmXG5cdFx0XHQhdGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJ1aVwiKT8uZ2V0UHJvcGVydHkoXCJjcmVhdGVNb2RlXCIpICYmXG5cdFx0XHQhY3JlYXRlQnV0dG9uV2FzUHJlc3NlZFxuXHRcdCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBiaW5kaW5nID0gdGFibGUuZ2V0Um93QmluZGluZygpIGFzIE9EYXRhTGlzdEJpbmRpbmc7XG5cdFx0aWYgKGJpbmRpbmcuaXNSZXNvbHZlZCgpICYmIGJpbmRpbmcuaXNMZW5ndGhGaW5hbCgpKSB7XG5cdFx0XHRjb25zdCBjb250ZXh0UGF0aCA9IGJpbmRpbmcuZ2V0Q29udGV4dCgpLmdldFBhdGgoKTtcblx0XHRcdGlmICghdGhpcy5lbXB0eVJvd3NFbmFibGVkKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9kZWxldGVFbXB0eVJvd3MoYmluZGluZywgY29udGV4dFBhdGgpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgaW5hY3RpdmVDb250ZXh0ID0gYmluZGluZy5nZXRBbGxDdXJyZW50Q29udGV4dHMoKS5maW5kKGZ1bmN0aW9uIChjb250ZXh0KSB7XG5cdFx0XHRcdC8vIHdoZW4gdGhpcyBpcyBjYWxsZWQgZnJvbSBjb250cm9sbGVyIGNvZGUgd2UgbmVlZCB0byBjaGVjayB0aGF0IGluYWN0aXZlIGNvbnRleHRzIGFyZSBzdGlsbCByZWxhdGl2ZSB0byB0aGUgY3VycmVudCB0YWJsZSBjb250ZXh0XG5cdFx0XHRcdHJldHVybiBjb250ZXh0LmlzSW5hY3RpdmUoKSA9PT0gdHJ1ZSAmJiBjb250ZXh0LmdldFBhdGgoKS5zdGFydHNXaXRoKGNvbnRleHRQYXRoKTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKCFpbmFjdGl2ZUNvbnRleHQpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5fY3JlYXRlRW1wdHlSb3coYmluZGluZywgdGFibGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIGluYWN0aXZlIHJvd3MgZnJvbSB0aGUgdGFibGUgbGlzdEJpbmRpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBiaW5kaW5nXG5cdCAqIEBwYXJhbSBjb250ZXh0UGF0aFxuXHQgKi9cblx0X2RlbGV0ZUVtcHR5Um93cyhiaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLCBjb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdFx0Zm9yIChjb25zdCBjb250ZXh0IG9mIGJpbmRpbmcuZ2V0QWxsQ3VycmVudENvbnRleHRzKCkpIHtcblx0XHRcdGlmIChjb250ZXh0LmlzSW5hY3RpdmUoKSA9PT0gdHJ1ZSAmJiBjb250ZXh0LmdldFBhdGgoKS5zdGFydHNXaXRoKGNvbnRleHRQYXRoKSkge1xuXHRcdFx0XHRjb250ZXh0LmRlbGV0ZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGFzeW5jIF9jcmVhdGVFbXB0eVJvdyhvQmluZGluZzogT0RhdGFMaXN0QmluZGluZywgb1RhYmxlOiBUYWJsZSkge1xuXHRcdGNvbnN0IGlJbmxpbmVDcmVhdGlvblJvd0NvdW50ID0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbD8uaW5saW5lQ3JlYXRpb25Sb3dDb3VudCB8fCAyO1xuXHRcdGNvbnN0IGFEYXRhID0gW107XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpSW5saW5lQ3JlYXRpb25Sb3dDb3VudDsgaSArPSAxKSB7XG5cdFx0XHRhRGF0YS5wdXNoKHt9KTtcblx0XHR9XG5cdFx0Y29uc3QgYkF0RW5kID0gb1RhYmxlLmRhdGEoXCJ0YWJsZVR5cGVcIikgIT09IFwiUmVzcG9uc2l2ZVRhYmxlXCI7XG5cdFx0Y29uc3QgYkluYWN0aXZlID0gdHJ1ZTtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1RhYmxlKTtcblx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblx0XHRjb25zdCBlZGl0RmxvdyA9IG9Db250cm9sbGVyLmVkaXRGbG93O1xuXHRcdGlmICghdGhpcy5jcmVhdGluZ0VtcHR5Um93cykge1xuXHRcdFx0dGhpcy5jcmVhdGluZ0VtcHR5Um93cyA9IHRydWU7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBhQ29udGV4dHMgPSBhd2FpdCBlZGl0Rmxvdy5jcmVhdGVNdWx0aXBsZURvY3VtZW50cyhcblx0XHRcdFx0XHRvQmluZGluZyxcblx0XHRcdFx0XHRhRGF0YSxcblx0XHRcdFx0XHRiQXRFbmQsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIuZWRpdEZsb3cub25CZWZvcmVDcmVhdGUsXG5cdFx0XHRcdFx0YkluYWN0aXZlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFDb250ZXh0cz8uZm9yRWFjaChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRcdG9Db250ZXh0LmNyZWF0ZWQoKS5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICghb0Vycm9yLmNhbmNlbGVkKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IG9FcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdExvZy5lcnJvcihlIGFzIGFueSk7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHR0aGlzLmNyZWF0aW5nRW1wdHlSb3dzID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhYmxlQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBcU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFiQSxJQWVNQSxRQUFRLFdBRGJDLGNBQWMsQ0FBQyw4QkFBOEIsRUFBRTtJQUFFQyxXQUFXLEVBQUUsQ0FBQyx3QkFBd0I7RUFBRSxDQUFDLENBQUMsVUFtQjFGQyxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsb0JBQW9CLENBQUM7SUFDN0VDLG1CQUFtQixFQUFFLENBQ3BCLHFDQUFxQyxFQUNyQyxnREFBZ0QsRUFDaEQseURBQXlEO0VBRTNELENBQUMsQ0FBQyxVQVNESCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsb0JBQW9CO0VBQzdFLENBQUMsQ0FBQyxVQUdERixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBVTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFVBUTdCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBUTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBVWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUcsWUFBWSxFQUFFLGlCQUFpQjtJQUFFQyxhQUFhLEVBQUUsQ0FBQyxXQUFXLEVBQUUsaUJBQWlCO0VBQUUsQ0FBQyxDQUFDLFdBUTlHTCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFdBUWpESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBVTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUksYUFBYSxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsTUFBTTtFQUFFLENBQUMsQ0FBQyxXQVFoRkwsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxXQVE1QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVHLFlBQVksRUFBRTtFQUFLLENBQUMsQ0FBQyxXQVFqREosUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVHLFlBQVksRUFBRTtFQUFNLENBQUMsQ0FBQyxXQVFsREosUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVHLFlBQVksRUFBRTtFQUFLLENBQUMsQ0FBQyxXQVVqREosUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxXQVE1QkssV0FBVyxDQUFDO0lBQUVMLElBQUksRUFBRSw0QkFBNEI7SUFBRU0sUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFdBUW5FRCxXQUFXLENBQUM7SUFBRUwsSUFBSSxFQUFFLDRCQUE0QjtJQUFFTSxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsV0FRbkVQLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsV0FRbERKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsV0FRbERKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsV0FRbERKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsV0FRbERKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsV0FVbERJLEtBQUssRUFBRSxXQVVQQSxLQUFLLEVBQUUsV0FTUEEsS0FBSyxFQUFFLFdBR1BBLEtBQUssRUFBRSxXQWlCUFIsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxrQkFBa0I7SUFBRUcsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFdBWTFESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUksYUFBYSxFQUFFLENBQUMsU0FBUztFQUFFLENBQUMsQ0FBQyxXQVF4REwsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxXQVE1QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRSxTQUFTO0lBQUVHLFlBQVksRUFBRTtFQUFLLENBQUMsQ0FBQyxXQTZJakRJLEtBQUssRUFBRSxXQTZCUEMsZUFBZSxFQUFFLFdBV2pCQSxlQUFlLEVBQUUsV0FjakJBLGVBQWUsRUFBRSxXQXFCakJBLGVBQWUsRUFBRSxXQVVqQkEsZUFBZSxFQUFFLFdBT2pCQSxlQUFlLEVBQUUsV0FVakJBLGVBQWUsRUFBRSxXQXVCakJBLGVBQWUsRUFBRSxXQStCakJBLGVBQWUsRUFBRSxXQTRJakJBLGVBQWUsRUFBRSxXQWVqQkEsZUFBZSxFQUFFLFdBVWpCQSxlQUFlLEVBQUUsV0FLakJBLGVBQWUsRUFBRTtJQUFBO0lBenZCbEIsa0JBQVlDLFNBQWtDLEVBQW9CO01BQUE7TUFBQSxrQ0FBZkMsTUFBTTtRQUFOQSxNQUFNO01BQUE7TUFDeEQsNkJBQU1ELFNBQVMsRUFBUyxHQUFHQyxNQUFNLENBQUM7TUFBQztNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUVuQyxNQUFLQyxlQUFlLEVBQUU7TUFFdEIsSUFBSSxNQUFLQyxPQUFPLEVBQUU7UUFDakIsTUFBS0EsT0FBTyxDQUFDQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsTUFBS0Msc0JBQXNCLGdDQUFPO01BQ25GO01BQUM7SUFDRjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBMlJDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBVEMsU0FVT0MsTUFBTSxHQUFiLGdCQUFjQyxRQUFrQixFQUFvQjtNQUNuRCxNQUFNQyxNQUFNLEdBQUdELFFBQVEsQ0FBQ0UsU0FBUyxFQUFFO01BQ25DLElBQUlDLFFBQThCO01BQ2xDLElBQUlGLE1BQU0sQ0FBQ0csR0FBRyxDQUFtQix3Q0FBd0MsQ0FBQyxFQUFFO1FBQUE7UUFDM0VELFFBQVEsd0JBQUksSUFBSSxDQUFDRSxXQUFXLCtFQUFoQixrQkFBa0JDLEdBQUcsQ0FBQyxJQUFJLENBQUMsMERBQTVCLHNCQUE2Q0MsSUFBSSxDQUFFQyxHQUFHO1VBQUE7VUFBQSxPQUFLLGlCQUFDQSxHQUFHLENBQUNaLE9BQU8saURBQVosYUFBd0JhLGFBQWEsRUFBRSxNQUFLUixNQUFNO1FBQUEsRUFBQztNQUMxSDtNQUNBLE9BQU9FLFFBQVEsY0FBVUosTUFBTSxZQUFDQyxRQUFRLENBQUM7SUFDMUM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQTtJQUFBLE9BTUFVLG1CQUFtQixHQUFuQiwrQkFBaUM7TUFDaEMsT0FBUSxJQUFJLENBQUNkLE9BQU8sQ0FBU2MsbUJBQW1CLEVBQUU7SUFDbkQ7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FaQztJQUFBLE9BYUFDLFVBQVUsR0FBVixvQkFBV0MsVUFBZ0csRUFBVTtNQUNwSCxNQUFNQyxVQUFVLEdBQUcsSUFBSSxDQUFDQyxrQkFBa0IsRUFBRTtNQUU1QyxNQUFNQyxNQUFNLEdBQUcsSUFBSSxDQUFDbkIsT0FBdUI7TUFFM0MsTUFBTW9CLFFBQVEsR0FBRyxJQUFJQyxPQUFPLENBQUM7UUFDNUJDLE1BQU0sRUFBRUgsTUFBTSxDQUFDTixhQUFhLEVBQUUsQ0FBQ1UsZUFBZSxFQUFFO1FBQ2hEbkMsSUFBSSxFQUFFNEIsVUFBVSxDQUFDNUIsSUFBSTtRQUNyQm9DLE9BQU8sRUFBRVIsVUFBVSxDQUFDUSxPQUFPO1FBQzNCQyxTQUFTLEVBQUVOLE1BQU0sQ0FBQ08sUUFBUSxFQUFFO1FBQzVCQyxXQUFXLEVBQUVYLFVBQVUsQ0FBQ1csV0FBVztRQUNuQ0MsVUFBVSxFQUFFWixVQUFVLENBQUNZO01BQ3hCLENBQUMsQ0FBQztNQUVGWCxVQUFVLENBQUNZLFdBQVcsQ0FBQ1QsUUFBUSxDQUFDO01BQ2hDLE9BQU9BLFFBQVEsQ0FBQ1UsS0FBSyxFQUFFO0lBQ3hCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQUMsYUFBYSxHQUFiLHVCQUFjQyxFQUFVLEVBQUU7TUFDekIsTUFBTWYsVUFBVSxHQUFHLElBQUksQ0FBQ0Msa0JBQWtCLEVBQUU7TUFDNUMsTUFBTWUsUUFBUSxHQUFHaEIsVUFBVSxDQUFDaUIsZUFBZSxFQUFFLENBQUNDLE9BQU8sRUFBRTtNQUN2RCxNQUFNQyxNQUFNLEdBQUdILFFBQVEsQ0FBQ3RCLElBQUksQ0FBRTBCLENBQU0sSUFBS0EsQ0FBQyxDQUFDTCxFQUFFLEtBQUtBLEVBQUUsQ0FBQztNQUNyRCxJQUFJSSxNQUFNLEVBQUU7UUFDWG5CLFVBQVUsQ0FBQ3FCLGNBQWMsQ0FBQ0YsTUFBTSxDQUFDO01BQ2xDO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQSxPQUpDO0lBQUEsT0FLTUcsdUJBQXVCLEdBQTdCLHlDQUFnQztNQUFBO01BQy9CLE1BQU1DLEtBQUssR0FBRyxJQUFJLENBQUN4QyxPQUFnQjtRQUNsQ3lDLFFBQVEsR0FBR0QsS0FBSyxDQUFDRSxjQUFjLEVBQThCO1FBQzdEQyxVQUFVLDRCQUFHQyxXQUFXLENBQUNDLGFBQWEsQ0FBQyxJQUFJLENBQUMsMERBQS9CLHNCQUFpQ0MsYUFBYSxFQUFFO1FBQzdEQyxPQUFPLEdBQUdOLFFBQVEsQ0FBQ08sUUFBUSxFQUFFO1FBQzdCQyxlQUFlLEdBQUdULEtBQUssQ0FBQ1UsaUJBQWlCLENBQUMsVUFBVSxDQUFZO1FBQ2hFQyxlQUFlLEdBQUcsRUFBRTtRQUNwQkMsZ0JBQWdCLEdBQUdYLFFBQVEsQ0FBQ1ksY0FBYyxFQUFFO01BQzdDLE1BQU1DLGlCQUFpQixHQUFHLENBQUMsQ0FBMkI7TUFDdEQsSUFBSUMsWUFBc0IsR0FBRyxFQUFFO01BQy9CLElBQUksQ0FBQ1osVUFBVSxJQUFJLENBQUNNLGVBQWUsRUFBRTtRQUNwQyxPQUFPTyxPQUFPLENBQUNDLE9BQU8sRUFBRTtNQUN6Qjs7TUFFQTtNQUNBLE1BQU1DLEtBQUssdUJBQUcsUUFBQ2YsVUFBVSxFQUFTZ0IsZUFBZSxxREFBbkMsMkJBQXVDO01BQ3JELE1BQU1DLFFBQVEsR0FBR0YsS0FBSyxJQUFJQSxLQUFLLENBQUNHLFNBQVMsRUFBRTtNQUMzQyxJQUFJRCxRQUFRLElBQUlBLFFBQVEsQ0FBQ0UsYUFBYSxFQUFFLEVBQUU7UUFDekMsTUFBTUMsZUFBZSxHQUFHQyxVQUFVLENBQUNDLGdCQUFnQixDQUFDUCxLQUFLLENBQUM7UUFDMUQsSUFBSUssZUFBZSxDQUFDRyxPQUFPLENBQUNDLE1BQU0sRUFBRTtVQUNuQ0osZUFBZSxDQUFDRyxPQUFPLEdBQUd0QixXQUFXLENBQUN3QixpQ0FBaUMsQ0FBQ0wsZUFBZSxDQUFDRyxPQUFPLENBQUM7VUFDaEdYLFlBQVksR0FBRyxDQUFDLElBQUljLE1BQU0sQ0FBQztZQUFFSCxPQUFPLEVBQUVILGVBQWUsQ0FBQ0csT0FBTztZQUFFSSxHQUFHLEVBQUU7VUFBSyxDQUFDLENBQUMsQ0FBQztRQUM3RTtNQUNEO01BQ0EsTUFBTUMsaUJBQWlCLEdBQUcsQ0FBQyxHQUFHQyxVQUFVLENBQUNDLGdCQUFnQixDQUFDakMsS0FBSyxDQUFDLEVBQUUsR0FBR2UsWUFBWSxDQUFDO01BRWxGLEtBQUssTUFBTW1CLENBQUMsSUFBSTNCLE9BQU8sRUFBRTtRQUN4QixNQUFNNEIsT0FBTyxHQUFHNUIsT0FBTyxDQUFDMkIsQ0FBQyxDQUFDLENBQUNFLE1BQU0sRUFBRTtVQUNsQ0MsV0FBVyxHQUFHakMsV0FBVyxDQUFDa0MsbUJBQW1CLENBQUN0QyxLQUFLLEVBQUVtQyxPQUFPLENBQUM7UUFFOURyQixpQkFBaUIsQ0FBQ29CLENBQUMsQ0FBQyxHQUFHLEtBQUs7UUFDNUJ2QixlQUFlLENBQUM0QixJQUFJLENBQ25CUCxVQUFVLENBQUNRLHNCQUFzQixDQUFDeEMsS0FBSyxFQUFFQSxLQUFLLENBQUNVLGlCQUFpQixFQUFFLEVBQUU7VUFDbkUrQixZQUFZLEVBQUVOLE9BQU8sS0FBS3ZCLGdCQUFnQixHQUFHLGVBQWUsR0FBRyxPQUFPO1VBQ3RFbUIsaUJBQWlCLEVBQUUsQ0FBQyxHQUFHQSxpQkFBaUIsRUFBRSxHQUFHTSxXQUFXLENBQUNYLE9BQU87UUFDakUsQ0FBQyxDQUFDLENBQ0Y7TUFDRjtNQUNBakIsZUFBZSxDQUFDaUMsV0FBVyxDQUFDLGNBQWMsRUFBRTtRQUFFQyxNQUFNLEVBQUU3QjtNQUFrQixDQUFDLENBQUM7TUFDMUUsSUFBSTtRQUNILE1BQU02QixNQUFNLEdBQUksTUFBTTNCLE9BQU8sQ0FBQzRCLEdBQUcsQ0FBQ2pDLGVBQWUsQ0FBYztRQUMvRCxLQUFLLE1BQU11QixDQUFDLElBQUlTLE1BQU0sRUFBRTtVQUN2QmxDLGVBQWUsQ0FBQ2lDLFdBQVcsQ0FBRSx1QkFBc0JSLENBQUUsRUFBQyxFQUFFRixVQUFVLENBQUNhLGlCQUFpQixDQUFDRixNQUFNLENBQUNULENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDakc7TUFDRCxDQUFDLENBQUMsT0FBT1ksS0FBYyxFQUFFO1FBQ3hCQyxHQUFHLENBQUNELEtBQUssQ0FBQyw2Q0FBNkMsRUFBRUEsS0FBSyxDQUFXO01BQzFFO0lBQ0QsQ0FBQztJQUFBLE9BRURwRSxrQkFBa0IsR0FBbEIsOEJBQXFCO01BQ3BCLE9BQU9zRSxHQUFHLENBQUNDLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFLENBQUNDLGlCQUFpQixFQUFFO0lBQzVDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BUUFDLGNBQWMsR0FBZCwwQkFBaUI7TUFDaEIsTUFBTXpFLE1BQU0sR0FBSSxJQUFJLENBQVMwRSxVQUFVLEVBQUU7TUFDekMsT0FBTzFFLE1BQU0sQ0FBQ04sYUFBYSxFQUFFO0lBQzlCLENBQUM7SUFBQSxPQUVEaUYsU0FBUyxHQUFULHFCQUE2QjtNQUM1QixNQUFNM0UsTUFBTSxHQUFJLElBQUksQ0FBUzBFLFVBQVUsRUFBRTtNQUN6QyxPQUFPckIsVUFBVSxDQUFDUSxzQkFBc0IsQ0FBQzdELE1BQU0sRUFBRUEsTUFBTSxDQUFDK0IsaUJBQWlCLEVBQUUsRUFBRTtRQUM1RStCLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQ2MsV0FBVyxDQUFDLGtCQUFrQixDQUFDLEdBQUc1RSxNQUFNLENBQUM2RSxJQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsT0FBTztRQUMzRnpCLGlCQUFpQixFQUFFQyxVQUFVLENBQUNDLGdCQUFnQixDQUFDdEQsTUFBTTtNQUN0RCxDQUFDLENBQUMsQ0FDQThFLElBQUksQ0FBRUMsTUFBVyxJQUFLO1FBQ3RCLE9BQU8xQixVQUFVLENBQUNhLGlCQUFpQixDQUFDYSxNQUFNLENBQUM7TUFDNUMsQ0FBQyxDQUFDLENBQ0RDLEtBQUssQ0FBQyxNQUFNO1FBQ1osT0FBTyxHQUFHO01BQ1gsQ0FBQyxDQUFDO0lBQ0o7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BUUFDLGVBQWUsR0FEZix5QkFDZ0JoRyxRQUFrQixFQUFFO01BQ25DLElBQUksQ0FBQ2lHLFNBQVMsQ0FBQyxlQUFlLEVBQUVqRyxRQUFRLENBQUNrRyxhQUFhLEVBQUUsQ0FBQztNQUN6RCxJQUFJLENBQUNDLDRCQUE0QixFQUFFO0lBQ3BDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BTUFDLDRCQUE0QixHQUQ1Qix3Q0FDK0I7TUFBQTtNQUM5QixNQUFNaEUsS0FBSyxHQUFHLElBQUksQ0FBQ3hDLE9BQWdCO01BQ25DO01BQ0E7TUFDQTtNQUNBLE1BQU15RyxXQUFXLEdBQUdqRSxLQUFLLENBQUNrRSxTQUFTLEVBQUU7TUFDckMsTUFBTUMsU0FBUyxHQUFJRixXQUFXLElBQUlHLElBQUksQ0FBQ0MsSUFBSSxDQUFDSixXQUFXLENBQTJCO01BQ2xGLElBQUksRUFBQ0UsU0FBUyxhQUFUQSxTQUFTLHdDQUFUQSxTQUFTLENBQUVHLG1CQUFtQixrREFBOUIsMkJBQUFILFNBQVMsQ0FBeUIsR0FBRTtRQUN4Q25FLEtBQUssQ0FBQ3VFLE1BQU0sRUFBRTtNQUNmO01BQ0EsMEJBQUNuRSxXQUFXLENBQUNDLGFBQWEsQ0FBQyxJQUFJLENBQUMscUZBQS9CLHVCQUFpQ0MsYUFBYSxFQUFFLDJEQUFqRCx1QkFBa0ZrRSxlQUFlLEVBQUUsQ0FBQ0MsY0FBYyxFQUFFO0lBQ3JILENBQUM7SUFBQSxPQUdEQyxlQUFlLEdBRGYseUJBQ2dCQyxNQUFnQixFQUFFQyxXQUEyQixFQUFFQyxRQUFpQixFQUFFQyxXQUFnQixFQUFFO01BQ25HO01BQ0EsSUFBSUQsUUFBUSxJQUFJQSxRQUFRLENBQUNFLFVBQVUsRUFBRSxJQUFJRixRQUFRLENBQUNHLFdBQVcsRUFBRSxFQUFFO1FBQ2hFLE9BQU8sS0FBSztNQUNiO01BQ0E7TUFDQTtNQUNBLElBQ0MsSUFBSSxDQUFDQyxrQkFBa0IsRUFBRSxDQUFDQyxlQUFlLElBQ3pDTCxRQUFRLElBQ1JBLFFBQVEsQ0FBQzdHLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxJQUM3QyxPQUFPNkcsUUFBUSxDQUFDdEIsV0FBVyxDQUFDLHVCQUF1QixDQUFDLEtBQUssU0FBUyxFQUNqRTtRQUNELE9BQU8sS0FBSztNQUNiLENBQUMsTUFBTTtRQUNOLE1BQU00QixvQkFBb0IsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVQLFdBQVcsRUFBRTtVQUFFUSxNQUFNLEVBQUVDLGdCQUFnQixDQUFDQztRQUFTLENBQUMsQ0FBQztRQUNqR1osV0FBVyxDQUFTYSxRQUFRLENBQUNDLHdCQUF3QixDQUFDYixRQUFRLEVBQUVNLG9CQUFvQixDQUFDO01BQ3ZGO0lBQ0QsQ0FBQztJQUFBLE9BR0RRLHdCQUF3QixHQUR4QixvQ0FDMkI7TUFDMUI7TUFDQTtNQUNBO01BQ0EsTUFBTUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDbEYsaUJBQWlCLENBQUMsVUFBVSxDQUF5QjtNQUN2RixNQUFNbUYsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDdkgsbUJBQW1CLEVBQUU7TUFDbkR3SCxZQUFZLENBQUNDLG1DQUFtQyxDQUFDSCxvQkFBb0IsRUFBRUMsZ0JBQWdCLENBQUM7SUFDekYsQ0FBQztJQUFBLE9BR0RHLHNCQUFzQixHQUR0QixnQ0FDdUJyQixNQUFnQixFQUFFO01BQ3hDLElBQUlBLE1BQU0sQ0FBQ3NCLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRTtRQUNqQyxJQUFJLENBQUMzRixhQUFhLEVBQUUsQ0FBQzRGLGNBQWMsQ0FBQ0MsaUJBQWlCLEVBQUU7TUFDeEQ7SUFDRCxDQUFDO0lBQUEsT0FHREMsdUJBQXVCLEdBRHZCLGlDQUN3QnpCLE1BQWdCLEVBQUU7TUFBQTtNQUN6QyxNQUFNM0UsS0FBSyxHQUFHLElBQUksQ0FBQ3hDLE9BQWdCO01BQ25DLElBQUksQ0FBQ2tGLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUM7TUFDeEMsSUFBSSxDQUFTbUIsU0FBUyxDQUFDLHVCQUF1QixFQUFFYyxNQUFNLENBQUNiLGFBQWEsRUFBRSxDQUFDO01BQ3hFLElBQUk5RCxLQUFLLENBQUNFLGNBQWMsRUFBRSw2QkFBSSxJQUFJLENBQUMrRSxrQkFBa0IsRUFBRSxDQUFDb0IsT0FBTyxDQUFDM0UsT0FBTyw0RUFBekMsc0JBQTJDNEUsWUFBWSxtREFBdkQsdUJBQXlEQyxVQUFVLEVBQUU7UUFDbEcsSUFBSSxDQUFDeEcsdUJBQXVCLEVBQUU7TUFDL0I7SUFDRCxDQUFDO0lBQUEsT0FHRHlHLE9BQU8sR0FEUCxpQkFDUTdCLE1BQWdCLEVBQUVDLFdBQTJCLEVBQUU7TUFDdEQ7TUFDQSxJQUFJLENBQUMsSUFBSSxDQUFDNkIsZUFBZSxDQUFDSixPQUFPLENBQUNLLFdBQVcsSUFBSSxDQUFFLElBQUksQ0FBQ3hILFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBZXFFLFdBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUNoSDtNQUNEO01BRUEsTUFBTW9ELGNBQWMsR0FBR2hDLE1BQU0sQ0FBQ3NCLFlBQVksQ0FBQyxNQUFNLENBQUM7UUFDakR0SCxNQUFNLEdBQUdnRyxNQUFNLENBQUM3RyxTQUFTLEVBQVc7TUFFckMsSUFBSWEsTUFBTSxDQUFDaUksY0FBYyxFQUFFLEtBQUssSUFBSSxFQUFFO1FBQ3JDQyxXQUFXLENBQUNDLFNBQVMsQ0FBQ0gsY0FBYyxFQUFFaEksTUFBTSxFQUFFaUcsV0FBVyxDQUFDO01BQzNELENBQUMsTUFBTTtRQUNOLE1BQU1tQyxjQUFjLEdBQUcvRCxHQUFHLENBQUNDLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFLENBQUM4RCx3QkFBd0IsQ0FBQyxhQUFhLENBQUM7UUFDL0VDLFVBQVUsQ0FBQ25FLEtBQUssQ0FBQ2lFLGNBQWMsQ0FBQ0csT0FBTyxDQUFDLDhDQUE4QyxDQUFDLEVBQUU7VUFDeEZDLEtBQUssRUFBRUosY0FBYyxDQUFDRyxPQUFPLENBQUMsc0JBQXNCO1FBQ3JELENBQUMsQ0FBQztNQUNIO0lBQ0Q7O0lBRUE7SUFDQTtJQUNBO0lBQUE7SUFBQSxPQUVBRSxjQUFjLEdBRGQsd0JBQ2VDLFdBQXFCLEVBQUU7TUFDckMsTUFBTUMsV0FBVyxHQUFHRCxXQUFXLENBQUNwQixZQUFZLENBQUMsb0JBQW9CLENBQUMsQ0FBQ3NCLFVBQVU7UUFDNUVDLGVBQWUsR0FBR0gsV0FBVyxDQUFDdkosU0FBUyxFQUFvQjtRQUMzRDJKLGNBQWMsR0FBR0osV0FBVyxDQUFDcEIsWUFBWSxDQUFDLGdCQUFnQixDQUFDO1FBQzNEUSxlQUFlLEdBQUcsSUFBSSxDQUFDeEIsa0JBQWtCLEVBQUU7TUFFNUN6SSxRQUFRLENBQUNrTCxvQkFBb0IsQ0FBQ0QsY0FBYyxFQUFFaEIsZUFBZSxFQUFFZSxlQUFlLEVBQUVGLFdBQVcsQ0FBQztJQUM3Rjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxTQVFPSyx3QkFBd0IsR0FBL0Isa0NBQWdDL0ksUUFBYSxFQUFFRCxNQUFXLEVBQVc7TUFBQTtNQUNwRSxNQUFNaUosd0JBQXdCLDRCQUFHakosTUFBTSxDQUFDK0IsaUJBQWlCLEVBQUUsMERBQTFCLHNCQUE0Qm1ILE9BQU8sRUFBRTtNQUN0RSxNQUFNQyxnQkFBZ0IsR0FBRyxDQUFDRix3QkFBd0IsR0FBSSxHQUFFQSx3QkFBeUIsR0FBRSxHQUFHLEVBQUUsSUFBSWpKLE1BQU0sQ0FBQ04sYUFBYSxFQUFFLENBQUN3SixPQUFPLEVBQUU7TUFDNUgsT0FBT0MsZ0JBQWdCLEtBQUtsSixRQUFRLENBQUNtSixTQUFTLEVBQUUsR0FBRyxJQUFJLEdBQUcsS0FBSztJQUNoRTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FRQUMsaUJBQWlCLEdBRGpCLDJCQUNrQnJELE1BQWdCLEVBQUU7TUFDbkMsTUFBTXNELG1CQUFtQixHQUFHdEQsTUFBTSxDQUFDN0csU0FBUyxFQUF3QjtNQUNwRSxNQUFNb0ssaUJBQWlCLEdBQUd2RCxNQUFNLENBQUNzQixZQUFZLENBQUMsa0JBQWtCLENBQUM7TUFDakUsSUFBSWlDLGlCQUFpQixFQUFFO1FBQ3RCLE1BQU1DLGNBQWMsR0FBR0YsbUJBQW1CLENBQUMvSSxRQUFRLENBQUMsVUFBVSxDQUFjO1FBQzVFaUosY0FBYyxDQUFDekYsV0FBVyxDQUFDLGtCQUFrQixFQUFFd0YsaUJBQWlCLEVBQUVELG1CQUFtQixDQUFDdkgsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQVk7TUFDaEk7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FSQztJQUFBLFNBU09nSCxvQkFBb0IsR0FBM0IsOEJBQ0NELGNBQThCLEVBQzlCaEIsZUFBbUMsRUFDbkNlLGVBQStCLEVBQy9CRixXQUFvQixFQUNIO01BQ2pCO01BQ0EsTUFBTWMsT0FBTyxHQUFHM0IsZUFBZSxDQUFDMkIsT0FBTztNQUN2QyxJQUNDLENBQUMzQixlQUFlLENBQUN2QixlQUFlLEtBQy9CdUIsZUFBZSxDQUFDSixPQUFPLENBQUN6SixJQUFJLEtBQUssaUJBQWlCLElBQUk2SixlQUFlLENBQUNKLE9BQU8sQ0FBQ3pKLElBQUksS0FBSyxXQUFXLENBQUMsRUFDbkc7UUFDRDZLLGNBQWMsQ0FBQ1ksVUFBVSxDQUFDQyxTQUFTLEdBQUcsSUFBSTtNQUMzQztNQUNBLE1BQU1DLGFBQWEsR0FBR2QsY0FBYyxDQUFDZSxRQUFRLENBQUNKLE9BQU87TUFDckQsS0FBSyxJQUFJSyxLQUFLLEdBQUdGLGFBQWEsQ0FBQzVHLE1BQU0sR0FBRyxDQUFDLEVBQUU4RyxLQUFLLElBQUksQ0FBQyxFQUFFQSxLQUFLLEVBQUUsRUFBRTtRQUMvRCxNQUFNQyxZQUFZLEdBQUdILGFBQWEsQ0FBQ0UsS0FBSyxDQUFDO1FBQ3pDLE1BQU1FLGNBQWMsR0FBR3ZFLElBQUksQ0FBQzRDLHdCQUF3QixDQUFDLGVBQWUsQ0FBQztRQUNyRTBCLFlBQVksQ0FBQ0UsS0FBSyxHQUFHQyxnQkFBZ0IsQ0FBQ0gsWUFBWSxDQUFDRSxLQUFLLEVBQUVwQixlQUFlLENBQUM7UUFDMUU7UUFDQSxJQUFJa0IsWUFBWSxDQUFDOUwsSUFBSSxLQUFLLFNBQVMsRUFBRTtVQUNwQzhMLFlBQVksQ0FBQ0ksVUFBVSxHQUFHSCxjQUFjLENBQUN6QixPQUFPLENBQUMsSUFBSSxDQUFDO1VBQ3REd0IsWUFBWSxDQUFDSyxTQUFTLEdBQUdKLGNBQWMsQ0FBQ3pCLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDdkQ7UUFDQSxNQUFNOEIsaUJBQWlCLEdBQUdaLE9BQU8sYUFBUEEsT0FBTyx1QkFBUEEsT0FBTyxDQUFFakssSUFBSSxDQUFFOEssTUFBTSxJQUFLO1VBQ25ELElBQUkzQixXQUFXLEVBQUU7WUFDaEIsT0FBTyxJQUFJLENBQUM0Qiw4QkFBOEIsQ0FBQ0QsTUFBTSxFQUEyQlAsWUFBWSxDQUFDO1VBQzFGLENBQUMsTUFBTTtZQUNOLE9BQU8sS0FBSztVQUNiO1FBQ0QsQ0FBQyxDQUFDO1FBQ0YsSUFBSU0saUJBQWlCLEVBQUU7VUFDdEIsTUFBTUcsZUFBZSxHQUFHO1lBQ3ZCUCxLQUFLLEVBQUVELGNBQWMsQ0FBQ3pCLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDNUN2SyxRQUFRLEVBQUV5TSxLQUFLLENBQUNDLE9BQU8sQ0FBQ1gsWUFBWSxDQUFDL0wsUUFBUSxDQUFDLEdBQUcrTCxZQUFZLENBQUMvTCxRQUFRLEdBQUcsQ0FBQytMLFlBQVksQ0FBQy9MLFFBQVEsQ0FBQztZQUNoRzJNLFFBQVEsRUFBR04saUJBQWlCLENBQTJCTztVQUN4RCxDQUFDO1VBQ0RoQixhQUFhLENBQUNpQixNQUFNLENBQUNmLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFVSxlQUFlLENBQUM7UUFDcEQ7TUFDRDtNQUNBLE9BQU8xQixjQUFjO0lBQ3RCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQUFBLFNBUU95Qiw4QkFBOEIsR0FBckMsd0NBQXNDRCxNQUE2QixFQUFFUSxZQUEwQixFQUFXO01BQUE7TUFDekcsSUFBSUMsb0JBQW9CLEdBQUcsS0FBSztNQUNoQyxJQUFJVCxNQUFNLENBQUNNLDBCQUEwQixJQUFJLDBCQUFBTixNQUFNLENBQUNVLGFBQWEsMERBQXBCLHNCQUFzQmhJLE1BQU0sTUFBSyxDQUFDLEVBQUU7UUFDNUU7UUFDQSxJQUNDc0gsTUFBTSxDQUFDVyxZQUFZLEtBQUtILFlBQVksQ0FBQzlNLFFBQVEsSUFDN0M4TSxZQUFZLENBQUM5TSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUtzTSxNQUFNLENBQUNVLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFDcERGLFlBQVksQ0FBQzlNLFFBQVEsQ0FBQ2tOLFFBQVEsQ0FBQ1osTUFBTSxDQUFDVyxZQUFZLENBQUMsSUFDbkRILFlBQVksQ0FBQzlNLFFBQVEsQ0FBQ2tOLFFBQVEsQ0FBQ1osTUFBTSxDQUFDYSxJQUFJLENBQUMsRUFDMUM7VUFDRDtVQUNBLE9BQU9MLFlBQVksQ0FBQ0gsUUFBUTtVQUM1Qkksb0JBQW9CLEdBQUcsSUFBSTtRQUM1QjtNQUNEO01BQ0EsT0FBT0Esb0JBQW9CO0lBQzVCLENBQUM7SUFBQSxPQUVESyxhQUFhLEdBQWIsdUJBQWNDLHdCQUFpQyxFQUFFO01BQ2hELElBQUksQ0FBQ3RILFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUM7TUFDM0MsSUFBS3NILHdCQUF3QixJQUFJLENBQUUsSUFBSSxDQUFTQyxrQkFBa0IsRUFBRSxJQUFLLElBQUksQ0FBQzFHLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO1FBQUE7UUFDN0csSUFBSSxDQUFDYixXQUFXLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO1FBQzFDLGVBQUMsSUFBSSxDQUFTVyxVQUFVLEVBQUUsZ0RBQTFCLFlBQTRCa0IsTUFBTSxFQUFFO01BQ3JDO0lBQ0QsQ0FBQztJQUFBLE9BRUQyRiwwQkFBMEIsR0FBMUIsb0NBQTJCQyxjQUF1QixFQUFTO01BQzFELE1BQU14TCxNQUFNLEdBQUksSUFBSSxDQUFTMEUsVUFBVSxFQUFFO01BQ3pDLE9BQU8rRyxXQUFXLENBQUNDLHVCQUF1QixDQUFDRixjQUFjLEVBQUV4TCxNQUFNLENBQUM7SUFDbkUsQ0FBQztJQUFBLE9BRUQyTCxjQUFjLEdBQWQsMEJBQWlCO01BQ2hCLElBQUksQ0FBQzVILFdBQVcsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUM7SUFDM0MsQ0FBQztJQUFBLE9BRUQ2SCxpQkFBaUIsR0FBakIsNkJBQW9CO01BQ25CLElBQUksQ0FBQzdILFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUM7TUFDMUMsSUFBSSxDQUFDQSxXQUFXLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDO0lBQzNDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS0FxQiw0QkFBNEIsR0FBNUIsd0NBQStCO01BQzlCLE1BQU0vRCxLQUFLLEdBQUcsSUFBSSxDQUFDeEMsT0FBZ0I7TUFDbkMsTUFBTWdOLGVBQWUsR0FBR3hLLEtBQUssQ0FBQ3lLLGNBQWMsRUFBRTtNQUU5QyxJQUFJRCxlQUFlLElBQUksQ0FBQ0EsZUFBZSxDQUFDOUosaUJBQWlCLEVBQUUsRUFBRTtRQUM1RCxNQUFNZ0ssWUFBWSxHQUFHMUssS0FBSyxDQUFDM0IsYUFBYSxFQUFFO1FBQzFDLE1BQU1zTSxjQUFjLEdBQUdELFlBQVksQ0FBQ0UsVUFBVSxFQUFhO1FBRTNELElBQUlELGNBQWMsRUFBRTtVQUNuQkUsV0FBVyxDQUFDQyxxQkFBcUIsQ0FDaENOLGVBQWUsRUFDZkUsWUFBWSxDQUFDN0MsT0FBTyxFQUFFLEVBQ3RCOEMsY0FBYyxFQUNkQSxjQUFjLENBQUN6TCxRQUFRLEVBQUUsRUFDeEJjLEtBQUssQ0FBQ2QsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFlcUUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUM5RDtRQUNGO01BQ0Q7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQU1Nd0gsMEJBQTBCLEdBRGhDLDRDQUNtQztNQUNsQyxJQUFJO1FBQ0gsTUFBTUMsdUJBQXVCLEdBQUdDLDBCQUEwQixDQUFDLElBQUksQ0FBOEI7UUFDN0YsTUFBTUMsY0FBYyxHQUFHLE1BQU1DLG9CQUFvQixDQUFDLElBQUksRUFBRUMsbUJBQW1CLENBQUNwTCxLQUFLLEVBQUVnTCx1QkFBdUIsQ0FBQztRQUMzRyxJQUFJRSxjQUFjLEVBQUU7VUFDbkJHLHVCQUF1QixDQUFDSCxjQUFjLENBQUM7VUFDdkM7UUFDRDtNQUNELENBQUMsQ0FBQyxPQUFPckwsQ0FBQyxFQUFFO1FBQ1h5TCxrQ0FBa0MsQ0FBQyxJQUFJLENBQUM5TixPQUFPLENBQUM7UUFDaER1RixHQUFHLENBQUNELEtBQUssQ0FBQ2pELENBQUMsQ0FBVztNQUN2QjtJQUNELENBQUM7SUFBQSxPQUdEMEwsdUJBQXVCLEdBRHZCLGlDQUN3QjVHLE1BQWdCLEVBQUU2RyxjQUFtQixFQUFFO01BQzlELE1BQU03TSxNQUFNLEdBQUcsSUFBSSxDQUFDbkIsT0FBTztNQUMzQixJQUFJZ08sY0FBYyxJQUFJQSxjQUFjLENBQUNDLFFBQVEsRUFBRTtRQUM5Q0QsY0FBYyxDQUFDQyxRQUFRLENBQUNDLGtCQUFrQixDQUFDL00sTUFBTSxDQUFDO01BQ25ELENBQUMsTUFBTTtRQUNOb0UsR0FBRyxDQUFDNEksT0FBTyxDQUFDLDZEQUE2RCxDQUFDO01BQzNFO0lBQ0QsQ0FBQztJQUFBLE9BR0RqTyxzQkFBc0IsR0FEdEIsZ0NBQ3VCaUgsTUFBZ0IsRUFBRTtNQUN4QyxJQUFJLENBQUNkLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRWMsTUFBTSxDQUFDYixhQUFhLEVBQUUsQ0FBQztJQUMxRCxDQUFDO0lBQUEsT0FHSzhILGFBQWEsR0FEbkIsNkJBQ29CakgsTUFBZ0IsRUFBRTZHLGNBQThCLEVBQUVLLFVBQWtCLEVBQUVyTixVQUFlLEVBQUU7TUFDMUdBLFVBQVUsQ0FBQ3NOLEtBQUssR0FBSW5ILE1BQU0sQ0FBQzdHLFNBQVMsRUFBRSxDQUFhb0IsUUFBUSxFQUFFO01BQzdELElBQUk2TSxhQUFhLEdBQUcsSUFBSTtNQUN4QixJQUFJdk4sVUFBVSxDQUFDd04scUJBQXFCLElBQUl4TixVQUFVLENBQUN3TixxQkFBcUIsQ0FBQ3JLLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDcEY7UUFDQSxNQUFNc0ssaUJBQWlCLEdBQUdDLFlBQVksQ0FBQzFOLFVBQVUsQ0FBQ3NOLEtBQUssQ0FBQ0ssWUFBWSxFQUFFLENBQUM7UUFDdkUsTUFBTUMsVUFBVSxHQUFHSCxpQkFBaUIsQ0FBQ0ksV0FBVyxDQUFhLElBQUksQ0FBQ0MsNEJBQTRCLENBQUMsQ0FBQ3hOLE1BQU87UUFDdkcsTUFBTXlOLDJCQUEyQixHQUFHLElBQUlDLDBCQUEwQixDQUFDO1VBQ2xFSixVQUFVLEVBQUVBLFVBQVU7VUFDdEJKLHFCQUFxQixFQUFFeE4sVUFBVSxDQUFDd04scUJBQXFCO1VBQ3ZEN0UsS0FBSyxFQUFFM0ksVUFBVSxDQUFDb0ssS0FBSztVQUN2QjZELGFBQWEsRUFBRUMsZ0JBQWdCLENBQUMsSUFBSTtRQUNyQyxDQUFDLENBQUM7UUFDRmxPLFVBQVUsQ0FBQ21PLFFBQVEsR0FBR25PLFVBQVUsQ0FBQ29PLGtCQUFrQjtRQUNuRGIsYUFBYSxHQUFHLE1BQU1RLDJCQUEyQixDQUFDTSxJQUFJLENBQUMsSUFBSSxDQUFDO01BQzdEO01BQ0EsSUFBSWQsYUFBYSxFQUFFO1FBQ2xCO1FBQ0EsSUFBSTtVQUNILE9BQU8sTUFBTVAsY0FBYyxDQUFDc0IsUUFBUSxDQUFDQyxZQUFZLENBQUNsQixVQUFVLEVBQUVyTixVQUFVLENBQUM7UUFDMUUsQ0FBQyxDQUFDLE9BQU9xQixDQUFDLEVBQUU7VUFDWGtELEdBQUcsQ0FBQ2lLLElBQUksQ0FBQ25OLENBQUMsQ0FBVztRQUN0QjtNQUNEO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQSxPQUpDO0lBQUEsT0FLQW9GLGtCQUFrQixHQUFsQiw4QkFBcUI7TUFDcEIsT0FBTyxJQUFJLENBQUN3QixlQUFlO0lBQzVCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FPQWxKLGVBQWUsR0FBZiwyQkFBa0I7TUFDakIsTUFBTXlDLEtBQUssR0FBSSxJQUFJLENBQVNxRCxVQUFVLEVBQUU7TUFDeEMsTUFBTTRKLGNBQWMsR0FBSSxJQUFJLENBQVNDLFlBQVksRUFBRTtNQUNuRCxJQUFJbE4sS0FBSyxJQUFJaU4sY0FBYyxJQUFJak4sS0FBSyxDQUFDa0UsU0FBUyxFQUFFLEtBQUsrSSxjQUFjLEVBQUU7UUFDcEUsSUFBSSxDQUFDRSxhQUFhLENBQUNGLGNBQWMsQ0FBQztNQUNuQztJQUNEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9BRSxhQUFhLEdBQWIsdUJBQWNGLGNBQXNCLEVBQVE7TUFBQTtNQUMzQyxNQUFNak4sS0FBSyxHQUFJLElBQUksQ0FBU3FELFVBQVUsRUFBRTs7TUFFeEM7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTs7TUFFQSxNQUFNK0osVUFBVSxHQUFHLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRTlOLEtBQUssRUFBRTtNQUNoQyxNQUFNK04sZUFBZSxHQUFHLElBQUksQ0FBQzdKLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztNQUNwRCxNQUFNOEosb0JBQW9CLEdBQ3pCRCxlQUFlLElBQUlKLGNBQWMsSUFBSUcsVUFBVSxJQUFJQSxVQUFVLENBQUNHLE9BQU8sQ0FBQyxJQUFJQyxNQUFNLENBQUNILGVBQWUsR0FBRyxHQUFHLENBQUMsRUFBRUosY0FBYyxDQUFDLENBQUMsQ0FBQzs7TUFFM0gsTUFBTTlJLFNBQVMsR0FDZCwyQkFBQS9ELFdBQVcsQ0FBQ0MsYUFBYSxDQUFDLElBQUksQ0FBQywyREFBL0IsdUJBQWlDZ0UsSUFBSSxDQUFDNEksY0FBYyxDQUFDLEtBQUk3SSxJQUFJLENBQUNDLElBQUksQ0FBQzRJLGNBQWMsQ0FBQyxJQUFJN0ksSUFBSSxDQUFDQyxJQUFJLENBQUNpSixvQkFBb0IsQ0FBQztNQUV0SCxJQUFJbkosU0FBUyxFQUFFO1FBQ2QsSUFBSUEsU0FBUyxDQUFDbkcsR0FBRyxDQUFlLHNDQUFzQyxDQUFDLEVBQUU7VUFDeEVnQyxLQUFLLENBQUN5TixTQUFTLENBQUUsR0FBRXRKLFNBQVMsQ0FBQzdFLEtBQUssRUFBRyxVQUFTLENBQUM7UUFDaEQsQ0FBQyxNQUFNLElBQUk2RSxTQUFTLENBQUNuRyxHQUFHLENBQVksc0JBQXNCLENBQUMsRUFBRTtVQUM1RGdDLEtBQUssQ0FBQ3lOLFNBQVMsQ0FBQ3RKLFNBQVMsQ0FBQzdFLEtBQUssRUFBRSxDQUFDO1FBQ25DO01BQ0Q7SUFDRCxDQUFDO0lBQUEsT0FFRG9PLG1CQUFtQixHQUFuQiw2QkFBb0JDLGlCQUFzQixFQUFFQyxVQUFlLEVBQUU7TUFDNUQsT0FBT0QsaUJBQWlCLENBQUNFLElBQUksQ0FBQyxVQUFVQyxPQUFZLEVBQUU7UUFDckQsSUFDRSxDQUFBQSxPQUFPLGFBQVBBLE9BQU8sdUJBQVBBLE9BQU8sQ0FBRUYsVUFBVSxNQUFLQSxVQUFVLElBQUlFLE9BQU8sYUFBUEEsT0FBTyxlQUFQQSxPQUFPLENBQUVDLGtCQUFrQixJQUNqRSxDQUFBRCxPQUFPLGFBQVBBLE9BQU8sdUJBQVBBLE9BQU8sQ0FBRUUsZ0JBQWdCLE1BQUtDLFNBQVMsSUFBSSxDQUFBSCxPQUFPLGFBQVBBLE9BQU8sdUJBQVBBLE9BQU8sQ0FBRUUsZ0JBQWdCLE1BQUtKLFVBQVcsRUFDcEY7VUFDRCxPQUFPQSxVQUFVO1FBQ2xCO01BQ0QsQ0FBQyxDQUFDO0lBQ0gsQ0FBQztJQUFBLE9BRURNLG1CQUFtQixHQUFuQiwrQkFBMkI7TUFDMUIsTUFBTXZQLE1BQU0sR0FBSSxJQUFJLENBQVMwRSxVQUFVLEVBQUU7TUFDekMsTUFBTThLLG1CQUFtQixHQUFHLElBQUksQ0FBQ2xKLGtCQUFrQixFQUFFLENBQUNtSixlQUFlO01BQ3JFLE1BQU1DLFVBQVUsR0FBRzFQLE1BQU0sSUFBSUEsTUFBTSxDQUFDTyxRQUFRLEVBQUUsQ0FBQ2lOLFlBQVksRUFBRTtRQUM1RG1DLHFCQUFxQixHQUFHM1AsTUFBTSxDQUFDNkUsSUFBSSxDQUFDLFVBQVUsQ0FBQztNQUNoRCxNQUFNK0ssY0FBYyxHQUFHRixVQUFVLENBQUNHLFNBQVMsQ0FBRSxHQUFFRixxQkFBc0IsYUFBWSxDQUFDO01BQ2xGLE1BQU1HLHNCQUFnQyxHQUFHLEVBQUU7TUFFM0MsSUFBSUYsY0FBYyxJQUFJQSxjQUFjLENBQUM1TSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ2hENE0sY0FBYyxDQUFDRyxPQUFPLENBQUMsVUFBVUMsWUFBb0IsRUFBRTtVQUN0RCxJQUFJQSxZQUFZLEtBQUssZ0JBQWdCLEVBQUU7WUFDdENGLHNCQUFzQixDQUFDbE0sSUFBSSxDQUFDb00sWUFBWSxDQUFDO1VBQzFDO1FBQ0QsQ0FBQyxDQUFDO01BQ0g7TUFDQSxNQUFNQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMzSixrQkFBa0IsRUFBRSxDQUFDNEosWUFBWTtNQUVqRSxNQUFNQyxlQUFvQixHQUFHLEVBQUU7TUFDL0IsTUFBTW5CLGlCQUFzQixHQUFHLEVBQUU7TUFDakMsTUFBTW9CLGFBQWEsR0FBR3BRLE1BQU0sQ0FBQ3FRLFVBQVUsRUFBRTtNQUN6Q0QsYUFBYSxDQUFDTCxPQUFPLENBQUMsVUFBVVosT0FBWSxFQUFFO1FBQzdDLE1BQU03RSxNQUFNLEdBQUc2RSxPQUFPLGFBQVBBLE9BQU8sdUJBQVBBLE9BQU8sQ0FBRW1CLGVBQWUsRUFBRTtRQUN6Q0gsZUFBZSxDQUFDdk0sSUFBSSxDQUFDMEcsTUFBTSxDQUFDO01BQzdCLENBQUMsQ0FBQztNQUVGNkYsZUFBZSxDQUFDSixPQUFPLENBQUMsVUFBVVosT0FBWSxFQUFFO1FBQUE7UUFDL0MsTUFBTW9CLGdCQUFnQixHQUFHYixVQUFVLENBQUNHLFNBQVMsQ0FBRSxHQUFFRixxQkFBc0IsVUFBU1IsT0FBUSxHQUFFLENBQUM7UUFDM0YsTUFBTUUsZ0JBQWdCLEdBQUdrQixnQkFBZ0IsNkJBQUlBLGdCQUFnQixDQUFDLHNDQUFzQyxDQUFDLHlEQUF4RCxxQkFBMERDLEtBQUs7UUFDNUcsTUFBTUMsY0FBYyxHQUNuQkYsZ0JBQWdCLDhCQUNoQkEsZ0JBQWdCLENBQUMsaUZBQWlGLENBQUMsMERBQW5HLHNCQUFxR0csV0FBVztRQUNqSDFCLGlCQUFpQixDQUFDcEwsSUFBSSxDQUFDO1VBQ3RCcUwsVUFBVSxFQUFFRSxPQUFPO1VBQ25CRSxnQkFBZ0IsRUFBRUEsZ0JBQWdCO1VBQ2xDRCxrQkFBa0IsRUFBRSxFQUFFcUIsY0FBYyxLQUFLLHlEQUF5RDtRQUNuRyxDQUFDLENBQUM7TUFDSCxDQUFDLENBQUM7TUFDRixJQUFJbkcsTUFBVztNQUVmLElBQUlrRixtQkFBbUIsS0FBS0YsU0FBUyxJQUFJLElBQUksQ0FBQ1AsbUJBQW1CLENBQUNDLGlCQUFpQixFQUFFUSxtQkFBbUIsQ0FBQyxFQUFFO1FBQzFHbEYsTUFBTSxHQUFHa0YsbUJBQW1CO01BQzdCLENBQUMsTUFBTSxJQUNOUyxrQkFBa0IsS0FBS1gsU0FBUyxJQUNoQ1csa0JBQWtCLENBQUNqTixNQUFNLEtBQUssQ0FBQyxJQUMvQixJQUFJLENBQUMrTCxtQkFBbUIsQ0FBQ0MsaUJBQWlCLEVBQUVpQixrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNqRTtRQUNEM0YsTUFBTSxHQUFHMkYsa0JBQWtCLENBQUMsQ0FBQyxDQUFDO01BQy9CLENBQUMsTUFBTSxJQUNOSCxzQkFBc0IsS0FBS1IsU0FBUyxJQUNwQ1Esc0JBQXNCLENBQUM5TSxNQUFNLEtBQUssQ0FBQyxJQUNuQyxJQUFJLENBQUMrTCxtQkFBbUIsQ0FBQ0MsaUJBQWlCLEVBQUVjLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3JFO1FBQ0R4RixNQUFNLEdBQUd3RixzQkFBc0IsQ0FBQyxDQUFDLENBQUM7TUFDbkM7TUFDQSxPQUFPeEYsTUFBTTtJQUNkOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS0FxRyxtQkFBbUIsR0FBbkIsNkJBQW9CQyxVQUFtQixFQUFFO01BQ3hDLElBQUksQ0FBQzdNLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRTZNLFVBQVUsQ0FBQztNQUNoRCxJQUFJLENBQUNDLGNBQWMsQ0FBQyxJQUFJLENBQUNoUyxPQUFPLENBQVU7SUFDM0MsQ0FBQztJQUFBLE9BRUtnUyxjQUFjLEdBQXBCLDhCQUFxQnhQLEtBQVksRUFBMkM7TUFBQTtNQUFBLElBQXpDeVAsc0JBQStCLHVFQUFHLEtBQUs7TUFDekUsSUFBSSw4QkFBSSxDQUFDaEosZUFBZSxDQUFDSixPQUFPLDBEQUE1QixzQkFBOEJxSixZQUFZLE1BQUtDLFlBQVksQ0FBQ0Msa0JBQWtCLEVBQUU7UUFDbkY7TUFDRDtNQUVBLE1BQU1DLE9BQU8sR0FBRzdQLEtBQUssQ0FBQ2QsUUFBUSxDQUFDLElBQUksQ0FBMEI7TUFDN0QsSUFBSSxDQUFDMlEsT0FBTyxFQUFFO1FBQ2I7TUFDRDtNQUNBLElBQUlBLE9BQU8sQ0FBQ3RNLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1FBQzlDO1FBQ0EsTUFBTXVNLFlBQVksR0FBR0QsT0FBTyxDQUFDRSxZQUFZLENBQUMsb0JBQW9CLENBQUM7UUFDL0QsTUFBTSxJQUFJL08sT0FBTyxDQUFRQyxPQUFPLElBQUs7VUFDcEMsTUFBTStPLFNBQVMsR0FBRyxNQUFNO1lBQ3ZCRixZQUFZLENBQUNHLFlBQVksQ0FBQ0QsU0FBUyxDQUFDO1lBQ3BDRixZQUFZLENBQUNJLE9BQU8sRUFBRTtZQUN0QmpQLE9BQU8sRUFBRTtVQUNWLENBQUM7VUFDRDZPLFlBQVksQ0FBQ0ssWUFBWSxDQUFDSCxTQUFTLENBQUM7UUFDckMsQ0FBQyxDQUFDO01BQ0g7TUFDQSxNQUFNSSxZQUFZLEdBQUdQLE9BQU8sQ0FBQ3RNLFdBQVcsQ0FBQyxhQUFhLENBQUM7TUFDdkQsSUFBSSxDQUFDNk0sWUFBWSxFQUFFO1FBQ2xCO01BQ0Q7TUFDQSxJQUNDLDhCQUFJLENBQUMzSixlQUFlLENBQUNKLE9BQU8sbURBQTVCLHVCQUE4QmdLLGtDQUFrQyxJQUNoRSwyQkFBQ3JRLEtBQUssQ0FBQ1UsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGtEQUE3QixzQkFBK0I2QyxXQUFXLENBQUMsWUFBWSxDQUFDLEtBQ3pELENBQUNrTSxzQkFBc0IsRUFDdEI7UUFDRDtNQUNEO01BQ0EsTUFBTWEsT0FBTyxHQUFHdFEsS0FBSyxDQUFDM0IsYUFBYSxFQUFzQjtNQUN6RCxJQUFJaVMsT0FBTyxDQUFDQyxVQUFVLEVBQUUsSUFBSUQsT0FBTyxDQUFDRSxhQUFhLEVBQUUsRUFBRTtRQUNwRCxNQUFNQyxXQUFXLEdBQUdILE9BQU8sQ0FBQzFGLFVBQVUsRUFBRSxDQUFDL0MsT0FBTyxFQUFFO1FBQ2xELElBQUksQ0FBQyxJQUFJLENBQUM2SSxnQkFBZ0IsRUFBRTtVQUMzQixPQUFPLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUNMLE9BQU8sRUFBRUcsV0FBVyxDQUFDO1FBQ25EO1FBQ0EsTUFBTUcsZUFBZSxHQUFHTixPQUFPLENBQUNPLHFCQUFxQixFQUFFLENBQUMxUyxJQUFJLENBQUMsVUFBVTJTLE9BQU8sRUFBRTtVQUMvRTtVQUNBLE9BQU9BLE9BQU8sQ0FBQy9MLFVBQVUsRUFBRSxLQUFLLElBQUksSUFBSStMLE9BQU8sQ0FBQ2pKLE9BQU8sRUFBRSxDQUFDa0osVUFBVSxDQUFDTixXQUFXLENBQUM7UUFDbEYsQ0FBQyxDQUFDO1FBQ0YsSUFBSSxDQUFDRyxlQUFlLEVBQUU7VUFDckIsTUFBTSxJQUFJLENBQUNJLGVBQWUsQ0FBQ1YsT0FBTyxFQUFFdFEsS0FBSyxDQUFDO1FBQzNDO01BQ0Q7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BTUEyUSxnQkFBZ0IsR0FBaEIsMEJBQWlCTCxPQUF5QixFQUFFRyxXQUFtQixFQUFFO01BQ2hFLEtBQUssTUFBTUssT0FBTyxJQUFJUixPQUFPLENBQUNPLHFCQUFxQixFQUFFLEVBQUU7UUFDdEQsSUFBSUMsT0FBTyxDQUFDL0wsVUFBVSxFQUFFLEtBQUssSUFBSSxJQUFJK0wsT0FBTyxDQUFDakosT0FBTyxFQUFFLENBQUNrSixVQUFVLENBQUNOLFdBQVcsQ0FBQyxFQUFFO1VBQy9FSyxPQUFPLENBQUNHLE1BQU0sRUFBRTtRQUNqQjtNQUNEO0lBQ0QsQ0FBQztJQUFBLE9BRUtELGVBQWUsR0FBckIsK0JBQXNCRSxRQUEwQixFQUFFdlMsTUFBYSxFQUFFO01BQUE7TUFDaEUsTUFBTXdTLHVCQUF1QixHQUFHLCtCQUFJLENBQUMxSyxlQUFlLENBQUNKLE9BQU8sMkRBQTVCLHVCQUE4QitLLHNCQUFzQixLQUFJLENBQUM7TUFDekYsTUFBTUMsS0FBSyxHQUFHLEVBQUU7TUFDaEIsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdILHVCQUF1QixFQUFFRyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3BERCxLQUFLLENBQUM5TyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDZjtNQUNBLE1BQU1nUCxNQUFNLEdBQUc1UyxNQUFNLENBQUM2RSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssaUJBQWlCO01BQzdELE1BQU1nTyxTQUFTLEdBQUcsSUFBSTtNQUN0QixNQUFNQyxLQUFLLEdBQUdyUixXQUFXLENBQUNDLGFBQWEsQ0FBQzFCLE1BQU0sQ0FBQztNQUMvQyxNQUFNaUcsV0FBVyxHQUFHNk0sS0FBSyxDQUFDblIsYUFBYSxFQUFvQjtNQUMzRCxNQUFNd00sUUFBUSxHQUFHbEksV0FBVyxDQUFDa0ksUUFBUTtNQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDNEUsaUJBQWlCLEVBQUU7UUFDNUIsSUFBSSxDQUFDQSxpQkFBaUIsR0FBRyxJQUFJO1FBQzdCLElBQUk7VUFDSCxNQUFNQyxTQUFTLEdBQUcsTUFBTTdFLFFBQVEsQ0FBQzhFLHVCQUF1QixDQUN2RFYsUUFBUSxFQUNSRyxLQUFLLEVBQ0xFLE1BQU0sRUFDTixLQUFLLEVBQ0wzTSxXQUFXLENBQUNrSSxRQUFRLENBQUMrRSxjQUFjLEVBQ25DTCxTQUFTLENBQ1Q7VUFDREcsU0FBUyxhQUFUQSxTQUFTLHVCQUFUQSxTQUFTLENBQUVqRCxPQUFPLENBQUMsVUFBVTdKLFFBQWEsRUFBRTtZQUMzQ0EsUUFBUSxDQUFDaU4sT0FBTyxFQUFFLENBQUNuTyxLQUFLLENBQUMsVUFBVW9PLE1BQVcsRUFBRTtjQUMvQyxJQUFJLENBQUNBLE1BQU0sQ0FBQ0MsUUFBUSxFQUFFO2dCQUNyQixNQUFNRCxNQUFNO2NBQ2I7WUFDRCxDQUFDLENBQUM7VUFDSCxDQUFDLENBQUM7UUFDSCxDQUFDLENBQUMsT0FBT2xTLENBQUMsRUFBRTtVQUNYa0QsR0FBRyxDQUFDRCxLQUFLLENBQUNqRCxDQUFDLENBQVE7UUFDcEIsQ0FBQyxTQUFTO1VBQ1QsSUFBSSxDQUFDNlIsaUJBQWlCLEdBQUcsS0FBSztRQUMvQjtNQUNEO0lBQ0QsQ0FBQztJQUFBO0VBQUEsRUFsZ0NxQk8sUUFBUTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQXFnQ2hCelYsUUFBUTtBQUFBIn0=
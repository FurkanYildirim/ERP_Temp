/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/TableFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/SizeHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/library", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/helpers/ActionHelper", "sap/fe/macros/table/TableSizeHelper", "sap/ui/mdc/enum/EditMode"], function (Log, DataVisualization, MetaModelConverter, TableFormatter, BindingToolkit, SizeHelper, StableIdHelper, TypeGuards, FELibrary, DataModelPathHelper, PropertyHelper, UIFormatters, CommonHelper, FieldTemplating, ActionHelper, TableSizeHelper, EditMode) {
  "use strict";

  var formatValueRecursively = FieldTemplating.formatValueRecursively;
  var getEditMode = UIFormatters.getEditMode;
  var isImageURL = PropertyHelper.isImageURL;
  var hasText = PropertyHelper.hasText;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var generate = StableIdHelper.generate;
  var ref = BindingToolkit.ref;
  var pathInModel = BindingToolkit.pathInModel;
  var isPathInModelExpression = BindingToolkit.isPathInModelExpression;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var fn = BindingToolkit.fn;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getUiControl = DataVisualization.getUiControl;
  const CreationMode = FELibrary.CreationMode;

  /**
   * Helper class used by the control library for OData-specific handling (OData V4)
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const TableHelper = {
    /**
     * Check if a given action is static.
     *
     * @param actionObject The instance or the path of the action
     * @param actionName The name of the action
     * @returns Returns 'true' if action is static, else 'false'
     * @private
     * @ui5-restricted
     */
    _isStaticAction: function (actionObject, actionName) {
      let action;
      if (actionObject) {
        if (Array.isArray(actionObject)) {
          const entityType = this._getActionOverloadEntityType(actionName);
          if (entityType) {
            action = actionObject.find(function (_action) {
              return _action.$IsBound && _action.$Parameter[0].$Type === entityType;
            });
          } else {
            // if this is just one - OK we take it. If it's more it's actually a wrong usage by the app
            // as we used the first one all the time we keep it as it is
            action = actionObject[0];
          }
        } else {
          action = actionObject;
        }
      }
      return !!action && typeof action !== "string" && action.$IsBound && !!action.$Parameter[0].$isCollection;
    },
    /**
     * Get the entity type of an action overload.
     *
     * @param sActionName The name of the action.
     * @returns The entity type used in the action overload.
     * @private
     */
    _getActionOverloadEntityType: function (sActionName) {
      if (sActionName && sActionName.indexOf("(") > -1) {
        const aParts = sActionName.split("(");
        return aParts[aParts.length - 1].replaceAll(")", "");
      }
      return undefined;
    },
    /**
     * Checks whether the action is overloaded on a different entity type.
     *
     * @param sActionName The name of the action.
     * @param sAnnotationTargetEntityType The entity type of the annotation target.
     * @returns Returns 'true' if the action is overloaded with a different entity type, else 'false'.
     * @private
     */
    _isActionOverloadOnDifferentType: function (sActionName, sAnnotationTargetEntityType) {
      const sEntityType = this._getActionOverloadEntityType(sActionName);
      return !!sEntityType && sAnnotationTargetEntityType !== sEntityType;
    },
    /**
     * Returns an array of the fields listed by the property RequestAtLeast in the PresentationVariant .
     *
     * @param oPresentationVariant The annotation related to com.sap.vocabularies.UI.v1.PresentationVariant.
     * @returns The fields.
     * @private
     * @ui5-restricted
     */
    getFieldsRequestedByPresentationVariant: function (oPresentationVariant) {
      var _oPresentationVariant;
      return ((_oPresentationVariant = oPresentationVariant.RequestAtLeast) === null || _oPresentationVariant === void 0 ? void 0 : _oPresentationVariant.map(oRequested => oRequested.value)) || [];
    },
    getNavigationAvailableFieldsFromLineItem: function (aLineItemContext) {
      const aSelectedFieldsArray = [];
      (aLineItemContext.getObject() || []).forEach(function (oRecord) {
        var _oRecord$NavigationAv;
        if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !oRecord.Inline && !oRecord.Determining && (_oRecord$NavigationAv = oRecord.NavigationAvailable) !== null && _oRecord$NavigationAv !== void 0 && _oRecord$NavigationAv.$Path) {
          aSelectedFieldsArray.push(oRecord.NavigationAvailable.$Path);
        }
      });
      return aSelectedFieldsArray;
    },
    getNavigationAvailableMap: function (lineItemCollection) {
      const oIBNNavigationAvailableMap = {};
      lineItemCollection === null || lineItemCollection === void 0 ? void 0 : lineItemCollection.forEach(record => {
        if ("SemanticObject" in record) {
          const sKey = `${record.SemanticObject}-${record.Action}`;
          if (record.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !record.Inline && record.RequiresContext) {
            if (record.NavigationAvailable !== undefined) {
              oIBNNavigationAvailableMap[sKey] = isPathAnnotationExpression(record.NavigationAvailable) ? record.NavigationAvailable.path : record.NavigationAvailable;
            }
          }
        }
      });
      return JSON.stringify(oIBNNavigationAvailableMap);
    },
    /**
     * Returns the context of the UI.LineItem.
     *
     * @param presentationContext The presentation context (either a presentation variant or a UI.LineItem)
     * @returns The context of the UI.LineItem
     */
    getUiLineItem: function (presentationContext) {
      return getUiControl(presentationContext, `@${"com.sap.vocabularies.UI.v1.LineItem"}`);
    },
    getUiLineItemObject: function (lineItemOrPresentationContext, convertedMetaData) {
      var _visualizations$find;
      const lineItemOrPresentationObject = convertedMetaData.resolvePath(lineItemOrPresentationContext.getPath()).target;
      if (!lineItemOrPresentationObject) return undefined;
      const visualizations = convertedMetaData.resolvePath(lineItemOrPresentationContext.getPath()).target.Visualizations;
      const lineItemObject = visualizations ? visualizations === null || visualizations === void 0 ? void 0 : (_visualizations$find = visualizations.find(item => item.value.indexOf("@" + "com.sap.vocabularies.UI.v1.LineItem") === 0)) === null || _visualizations$find === void 0 ? void 0 : _visualizations$find.$target : lineItemOrPresentationObject;
      return (lineItemObject === null || lineItemObject === void 0 ? void 0 : lineItemObject.term) === "com.sap.vocabularies.UI.v1.LineItem" ? lineItemObject : undefined;
    },
    /**
     * Creates and returns a select query with the selected fields from the parameters that were passed.
     *
     * @param table The instance of the inner model of the table building block
     * @returns The 'select' query that has the selected fields from the parameters that were passed
     */
    create$Select: function (table) {
      const selectedFields = [];
      const lineItemContext = TableHelper.getUiLineItem(table.metaPath);
      function pushField(field) {
        if (field && !selectedFields.includes(field) && field.indexOf("/") !== 0) {
          // Do not add singleton property (with absolute path) to $select
          selectedFields.push(field);
        }
      }
      function pushFieldList(fields) {
        if (fields !== null && fields !== void 0 && fields.length) {
          fields.forEach(pushField);
        }
      }
      const columns = table.tableDefinition.columns;
      const propertiesFromCustomColumns = this.getPropertiesFromCustomColumns(columns);
      if (propertiesFromCustomColumns !== null && propertiesFromCustomColumns !== void 0 && propertiesFromCustomColumns.length) {
        pushFieldList(propertiesFromCustomColumns);
      }
      if (lineItemContext.getPath().indexOf(`@${"com.sap.vocabularies.UI.v1.LineItem"}`) > -1) {
        var _targetCollection$ann, _table$contextObjectP, _table$contextObjectP2, _table$contextObjectP3, _table$contextObjectP4, _table$contextObjectP5, _table$contextObjectP6, _table$contextObjectP7, _table$contextObjectP8, _table$contextObjectP9, _table$contextObjectP10;
        // Don't process EntityType without LineItem
        const presentationAnnotation = getInvolvedDataModelObjects(table.metaPath).targetObject;
        const operationAvailableProperties = (table.tableDefinition.operationAvailableProperties || "").split(",");
        const applicableProperties = TableHelper._filterNonApplicableProperties(operationAvailableProperties, table.collection);
        const targetCollection = table.collectionEntity.entityType || table.collectionEntity.targetType;
        const aSemanticKeys = (((_targetCollection$ann = targetCollection.annotations.Common) === null || _targetCollection$ann === void 0 ? void 0 : _targetCollection$ann.SemanticKey) || []).map(oSemanticKey => oSemanticKey.value);
        if ((presentationAnnotation === null || presentationAnnotation === void 0 ? void 0 : presentationAnnotation.$Type) === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
          pushFieldList(TableHelper.getFieldsRequestedByPresentationVariant(presentationAnnotation));
        }
        pushFieldList(TableHelper.getNavigationAvailableFieldsFromLineItem(lineItemContext));
        pushFieldList(applicableProperties);
        pushFieldList(aSemanticKeys);
        pushField((_table$contextObjectP = table.contextObjectPath.targetEntitySet) === null || _table$contextObjectP === void 0 ? void 0 : (_table$contextObjectP2 = _table$contextObjectP.annotations) === null || _table$contextObjectP2 === void 0 ? void 0 : (_table$contextObjectP3 = _table$contextObjectP2.Capabilities) === null || _table$contextObjectP3 === void 0 ? void 0 : (_table$contextObjectP4 = _table$contextObjectP3.DeleteRestrictions) === null || _table$contextObjectP4 === void 0 ? void 0 : (_table$contextObjectP5 = _table$contextObjectP4.Deletable) === null || _table$contextObjectP5 === void 0 ? void 0 : _table$contextObjectP5.path);
        pushField((_table$contextObjectP6 = table.contextObjectPath.targetEntitySet) === null || _table$contextObjectP6 === void 0 ? void 0 : (_table$contextObjectP7 = _table$contextObjectP6.annotations) === null || _table$contextObjectP7 === void 0 ? void 0 : (_table$contextObjectP8 = _table$contextObjectP7.Capabilities) === null || _table$contextObjectP8 === void 0 ? void 0 : (_table$contextObjectP9 = _table$contextObjectP8.UpdateRestrictions) === null || _table$contextObjectP9 === void 0 ? void 0 : (_table$contextObjectP10 = _table$contextObjectP9.Updatable) === null || _table$contextObjectP10 === void 0 ? void 0 : _table$contextObjectP10.path);
      }
      return selectedFields.join(",");
    },
    /**
     * Method to get column's width if defined from manifest or from customization via annotations.
     *
     * @function
     * @name getColumnWidth
     * @param oThis The instance of the inner model of the Table building block
     * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param dataField DataField definition object
     * @param dataFieldActionText DataField's text from button
     * @param dataModelObjectPath The object path of the data model
     * @param useRemUnit Indicates if the rem unit must be concatenated with the column width result
     * @param microChartTitle The object containing title and description of the MicroChart
     * @returns - Column width if defined, otherwise width is set to auto
     */
    getColumnWidth: function (oThis, column, dataField, dataFieldActionText, dataModelObjectPath, useRemUnit, microChartTitle) {
      if (column.width) {
        return column.width;
      }
      if (oThis.enableAutoColumnWidth === true) {
        let width;
        width = this.getColumnWidthForImage(dataModelObjectPath) || this.getColumnWidthForDataField(oThis, column, dataField, dataFieldActionText, dataModelObjectPath, microChartTitle) || undefined;
        if (width) {
          return useRemUnit ? `${width}rem` : width;
        }
        width = compileExpression(formatResult([pathInModel("/editMode", "ui"), pathInModel("tablePropertiesAvailable", "internal"), column.name, useRemUnit], TableFormatter.getColumnWidth));
        return width;
      }
      return undefined;
    },
    /**
     * Method to get the width of the column containing an image.
     *
     * @function
     * @name getColumnWidthForImage
     * @param dataModelObjectPath The data model object path
     * @returns - Column width if defined, otherwise null (the width is treated as a rem value)
     */
    getColumnWidthForImage: function (dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3, _dataModelObjectPath$4, _dataModelObjectPath$5, _dataModelObjectPath$6, _dataModelObjectPath$7, _dataModelObjectPath$8, _dataModelObjectPath$9, _dataModelObjectPath$10, _annotations$Core2, _annotations$Core2$Me;
      let width = null;
      const annotations = (_dataModelObjectPath$ = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$ === void 0 ? void 0 : (_dataModelObjectPath$2 = _dataModelObjectPath$.Value) === null || _dataModelObjectPath$2 === void 0 ? void 0 : (_dataModelObjectPath$3 = _dataModelObjectPath$2.$target) === null || _dataModelObjectPath$3 === void 0 ? void 0 : _dataModelObjectPath$3.annotations;
      const dataType = (_dataModelObjectPath$4 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$4 === void 0 ? void 0 : (_dataModelObjectPath$5 = _dataModelObjectPath$4.Value) === null || _dataModelObjectPath$5 === void 0 ? void 0 : (_dataModelObjectPath$6 = _dataModelObjectPath$5.$target) === null || _dataModelObjectPath$6 === void 0 ? void 0 : _dataModelObjectPath$6.type;
      if ((_dataModelObjectPath$7 = dataModelObjectPath.targetObject) !== null && _dataModelObjectPath$7 !== void 0 && _dataModelObjectPath$7.Value && getEditMode((_dataModelObjectPath$8 = dataModelObjectPath.targetObject.Value) === null || _dataModelObjectPath$8 === void 0 ? void 0 : _dataModelObjectPath$8.$target, dataModelObjectPath, false, false, dataModelObjectPath.targetObject) === EditMode.Display) {
        var _annotations$Core, _annotations$Core$Med;
        const hasTextAnnotation = hasText(dataModelObjectPath.targetObject.Value.$target);
        if (dataType === "Edm.Stream" && !hasTextAnnotation && annotations !== null && annotations !== void 0 && (_annotations$Core = annotations.Core) !== null && _annotations$Core !== void 0 && (_annotations$Core$Med = _annotations$Core.MediaType) !== null && _annotations$Core$Med !== void 0 && _annotations$Core$Med.includes("image/")) {
          width = 6.2;
        }
      } else if (annotations && (isImageURL((_dataModelObjectPath$9 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$9 === void 0 ? void 0 : (_dataModelObjectPath$10 = _dataModelObjectPath$9.Value) === null || _dataModelObjectPath$10 === void 0 ? void 0 : _dataModelObjectPath$10.$target) || annotations !== null && annotations !== void 0 && (_annotations$Core2 = annotations.Core) !== null && _annotations$Core2 !== void 0 && (_annotations$Core2$Me = _annotations$Core2.MediaType) !== null && _annotations$Core2$Me !== void 0 && _annotations$Core2$Me.includes("image/"))) {
        width = 6.2;
      }
      return width;
    },
    /**
     * Method to get the width of the column containing the DataField.
     *
     * @function
     * @name getColumnWidthForDataField
     * @param oThis The instance of the inner model of the Table building block
     * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param dataField Data Field
     * @param dataFieldActionText DataField's text from button
     * @param dataModelObjectPath The data model object path
     * @param oMicroChartTitle The object containing the title and description of the MicroChart
     * @returns - Column width if defined, otherwise null ( the width is treated as a rem value)
     */
    getColumnWidthForDataField: function (oThis, column, dataField, dataFieldActionText, dataModelObjectPath, oMicroChartTitle) {
      var _dataModelObjectPath$11, _dataModelObjectPath$12;
      const annotations = (_dataModelObjectPath$11 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$11 === void 0 ? void 0 : _dataModelObjectPath$11.annotations;
      const dataType = (_dataModelObjectPath$12 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$12 === void 0 ? void 0 : _dataModelObjectPath$12.$Type;
      let width = null;
      if (dataType === "com.sap.vocabularies.UI.v1.DataFieldForAction" || dataType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || dataType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && dataField.Target.$AnnotationPath.indexOf(`@${"com.sap.vocabularies.UI.v1.FieldGroup"}`) === -1) {
        var _dataField$Label;
        let nTmpTextWidth;
        nTmpTextWidth = SizeHelper.getButtonWidth(dataFieldActionText) || SizeHelper.getButtonWidth(dataField === null || dataField === void 0 ? void 0 : (_dataField$Label = dataField.Label) === null || _dataField$Label === void 0 ? void 0 : _dataField$Label.toString()) || SizeHelper.getButtonWidth(annotations === null || annotations === void 0 ? void 0 : annotations.Label);

        // get width for rating or progress bar datafield
        const nTmpVisualizationWidth = TableSizeHelper.getWidthForDataFieldForAnnotation(dataModelObjectPath.targetObject).propertyWidth;
        if (nTmpVisualizationWidth > nTmpTextWidth) {
          width = nTmpVisualizationWidth;
        } else if (dataFieldActionText || annotations && (annotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || annotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction")) {
          // Add additional 1.8 rem to avoid showing ellipsis in some cases.
          nTmpTextWidth += 1.8;
          width = nTmpTextWidth;
        }
        width = width || this.getColumnWidthForChart(oThis, column, dataField, nTmpTextWidth, oMicroChartTitle);
      }
      return width;
    },
    /**
     * Method to get the width of the column containing the Chart.
     *
     * @function
     * @name getColumnWidthForChart
     * @param oThis The instance of the inner model of the Table building block
     * @param column Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param dataField Data Field
     * @param columnLabelWidth The width of the column label or button label
     * @param microChartTitle The object containing the title and the description of the MicroChart
     * @returns - Column width if defined, otherwise null (the width is treated as a rem value)
     */
    getColumnWidthForChart(oThis, column, dataField, columnLabelWidth, microChartTitle) {
      var _dataField$Target, _dataField$Target$$An;
      let chartSize,
        width = null;
      if (((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$An = _dataField$Target.$AnnotationPath) === null || _dataField$Target$$An === void 0 ? void 0 : _dataField$Target$$An.indexOf(`@${"com.sap.vocabularies.UI.v1.Chart"}`)) !== -1) {
        switch (this.getChartSize(oThis, column)) {
          case "XS":
            chartSize = 4.4;
            break;
          case "S":
            chartSize = 4.6;
            break;
          case "M":
            chartSize = 5.5;
            break;
          case "L":
            chartSize = 6.9;
            break;
          default:
            chartSize = 5.3;
        }
        columnLabelWidth += 1.8;
        if (!this.getShowOnlyChart(oThis, column) && microChartTitle && (microChartTitle.Title.length || microChartTitle.Description.length)) {
          const tmpText = microChartTitle.Title.length > microChartTitle.Description.length ? microChartTitle.Title : microChartTitle.Description;
          const titleSize = SizeHelper.getButtonWidth(tmpText) + 7;
          const tmpWidth = titleSize > columnLabelWidth ? titleSize : columnLabelWidth;
          width = tmpWidth;
        } else if (columnLabelWidth > chartSize) {
          width = columnLabelWidth;
        } else {
          width = chartSize;
        }
      }
      return width;
    },
    /**
     * Method to add a margin class at the control.
     *
     * @function
     * @name getMarginClass
     * @param oCollection Title of the DataPoint
     * @param oDataField Value of the DataPoint
     * @param sVisualization
     * @param sFieldGroupHiddenExpressions Hidden expression contained in FieldGroup
     * @returns Adjusting the margin
     */
    getMarginClass: function (oCollection, oDataField, sVisualization, sFieldGroupHiddenExpressions) {
      let sBindingExpression,
        sClass = "";
      if (JSON.stringify(oCollection[oCollection.length - 1]) == JSON.stringify(oDataField)) {
        //If rating indicator is last element in fieldgroup, then the 0.5rem margin added by sapMRI class of interactive rating indicator on top and bottom must be nullified.
        if (sVisualization == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
          sClass = "sapUiNoMarginBottom sapUiNoMarginTop";
        }
      } else if (sVisualization === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
        //If rating indicator is NOT the last element in fieldgroup, then to maintain the 0.5rem spacing between cogetMarginClassntrols (as per UX spec),
        //only the top margin added by sapMRI class of interactive rating indicator must be nullified.

        sClass = "sapUiNoMarginTop";
      } else {
        sClass = "sapUiTinyMarginBottom";
      }
      if (sFieldGroupHiddenExpressions && sFieldGroupHiddenExpressions !== "true" && sFieldGroupHiddenExpressions !== "false") {
        const sHiddenExpressionResult = sFieldGroupHiddenExpressions.substring(sFieldGroupHiddenExpressions.indexOf("{=") + 2, sFieldGroupHiddenExpressions.lastIndexOf("}"));
        sBindingExpression = "{= " + sHiddenExpressionResult + " ? '" + sClass + "' : " + "''" + " }";
        return sBindingExpression;
      } else {
        return sClass;
      }
    },
    /**
     * Method to get VBox visibility.
     *
     * @param collection Collection of data fields in VBox
     * @param fieldGroupHiddenExpressions Hidden expression contained in FieldGroup
     * @param fieldGroup Data field containing the VBox
     * @returns Visibility expression
     */
    getVBoxVisibility: function (collection, fieldGroupHiddenExpressions, fieldGroup) {
      let allStatic = true;
      const hiddenPaths = [];
      if (fieldGroup[`@${"com.sap.vocabularies.UI.v1.Hidden"}`]) {
        return fieldGroupHiddenExpressions;
      }
      for (const dataField of collection) {
        const hiddenAnnotationValue = dataField[`@${"com.sap.vocabularies.UI.v1.Hidden"}`];
        if (hiddenAnnotationValue === undefined || hiddenAnnotationValue === false) {
          hiddenPaths.push(false);
          continue;
        }
        if (hiddenAnnotationValue === true) {
          hiddenPaths.push(true);
          continue;
        }
        if (hiddenAnnotationValue.$Path) {
          hiddenPaths.push(pathInModel(hiddenAnnotationValue.$Path));
          allStatic = false;
          continue;
        }
        if (typeof hiddenAnnotationValue === "object") {
          // Dynamic expression found in a field
          return fieldGroupHiddenExpressions;
        }
      }
      const hasAnyPathExpressions = constant(hiddenPaths.length > 0 && allStatic !== true);
      const hasAllHiddenStaticExpressions = constant(hiddenPaths.length > 0 && hiddenPaths.indexOf(false) === -1 && allStatic);
      return compileExpression(ifElse(hasAnyPathExpressions, formatResult(hiddenPaths, TableFormatter.getVBoxVisibility), ifElse(hasAllHiddenStaticExpressions, constant(false), constant(true))));
    },
    /**
     * Method to provide hidden filters to the table.
     *
     * @function
     * @name formatHiddenFilters
     * @param oHiddenFilter The hiddenFilters via context named filters (and key hiddenFilters) passed to Macro Table
     * @returns The string representation of the hidden filters
     */
    formatHiddenFilters: function (oHiddenFilter) {
      if (oHiddenFilter) {
        try {
          return JSON.stringify(oHiddenFilter);
        } catch (ex) {
          return undefined;
        }
      }
      return undefined;
    },
    /**
     * Method to get the stable ID of a table element (column or FieldGroup label).
     *
     * @function
     * @name getElementStableId
     * @param tableId Current object ID
     * @param elementId Element Id or suffix
     * @param dataModelObjectPath DataModelObjectPath of the dataField
     * @returns The stable ID for a given column
     */
    getElementStableId: function (tableId, elementId, dataModelObjectPath) {
      var _Value;
      if (!tableId) {
        return undefined;
      }
      const dataField = dataModelObjectPath.targetObject;
      let dataFieldPart;
      switch (dataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          dataFieldPart = dataField.Target.value;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
          dataFieldPart = dataField;
          break;
        default:
          dataFieldPart = ((_Value = dataField.Value) === null || _Value === void 0 ? void 0 : _Value.path) ?? "";
          break;
      }
      return generate([tableId, elementId, dataFieldPart]);
    },
    /**
     * Method to get the stable ID of the column.
     *
     * @function
     * @name getColumnStableId
     * @param id Current object ID
     * @param dataModelObjectPath DataModelObjectPath of the dataField
     * @returns The stable ID for a given column
     */
    getColumnStableId: function (id, dataModelObjectPath) {
      return TableHelper.getElementStableId(id, "C", dataModelObjectPath);
    },
    getFieldGroupLabelStableId: function (id, dataModelObjectPath) {
      return TableHelper.getElementStableId(id, "FGLabel", dataModelObjectPath);
    },
    /**
     * Method filters out properties which do not belong to the collection.
     *
     * @param properties The array of properties to be checked.
     * @param collectionContext The collection context to be used.
     * @returns The array of applicable properties.
     * @private
     */
    _filterNonApplicableProperties: function (properties, collectionContext) {
      return properties && properties.filter(function (sPropertyPath) {
        return collectionContext.getObject(`./${sPropertyPath}`);
      });
    },
    /**
     * Method to retreive the listed properties from the custom columns
     *
     * @param columns The table columns
     * @returns The list of available properties from the custom columns
     * @private
     */

    getPropertiesFromCustomColumns: function (columns) {
      // Add properties from the custom columns, this is required for the export of all the properties listed on a custom column
      if (!(columns !== null && columns !== void 0 && columns.length)) {
        return;
      }
      const propertiesFromCustomColumns = [];
      for (const column of columns) {
        var _column$properties;
        if ("properties" in column && (_column$properties = column.properties) !== null && _column$properties !== void 0 && _column$properties.length) {
          for (const property of column.properties) {
            if (propertiesFromCustomColumns.indexOf(property) === -1) {
              // only add property if it doesn't exist
              propertiesFromCustomColumns.push(property);
            }
          }
        }
      }
      return propertiesFromCustomColumns;
    },
    /**
     * Method to generate the binding information for a table row.
     *
     * @param table The instance of the inner model of the table building block
     * @returns - Returns the binding information of a table row
     */
    getRowsBindingInfo: function (table) {
      const dataModelPath = getInvolvedDataModelObjects(table.collection, table.contextPath);
      const path = getContextRelativeTargetObjectPath(dataModelPath) || getTargetObjectPath(dataModelPath);
      const oRowBinding = {
        ui5object: true,
        suspended: false,
        path: CommonHelper.addSingleQuotes(path),
        parameters: {
          $count: true
        },
        events: {}
      };
      if (table.tableDefinition.enable$select) {
        // Don't add $select parameter in case of an analytical query, this isn't supported by the model
        const sSelect = TableHelper.create$Select(table);
        if (sSelect) {
          oRowBinding.parameters.$select = `'${sSelect}'`;
        }
      }
      if (table.tableDefinition.enable$$getKeepAliveContext) {
        // we later ensure in the delegate only one list binding for a given targetCollectionPath has the flag $$getKeepAliveContext
        oRowBinding.parameters.$$getKeepAliveContext = true;
      }
      oRowBinding.parameters.$$groupId = CommonHelper.addSingleQuotes("$auto.Workers");
      oRowBinding.parameters.$$updateGroupId = CommonHelper.addSingleQuotes("$auto");
      oRowBinding.parameters.$$ownRequest = true;
      oRowBinding.parameters.$$patchWithoutSideEffects = true;
      oRowBinding.events.patchSent = CommonHelper.addSingleQuotes(".editFlow.handlePatchSent");
      oRowBinding.events.patchCompleted = CommonHelper.addSingleQuotes("API.onInternalPatchCompleted");
      oRowBinding.events.dataReceived = CommonHelper.addSingleQuotes("API.onInternalDataReceived");
      oRowBinding.events.dataRequested = CommonHelper.addSingleQuotes("API.onInternalDataRequested");
      oRowBinding.events.change = CommonHelper.addSingleQuotes("API.onContextChange");
      // recreate an empty row when one is activated
      oRowBinding.events.createActivate = CommonHelper.addSingleQuotes(".editFlow.handleCreateActivate");
      return CommonHelper.objectToString(oRowBinding);
    },
    /**
     * Method to check the validity of the fields in the creation row.
     *
     * @function
     * @name validateCreationRowFields
     * @param oFieldValidityObject Current Object holding the fields
     * @returns `true` if all the fields in the creation row are valid, `false` otherwise
     */
    validateCreationRowFields: function (oFieldValidityObject) {
      if (!oFieldValidityObject) {
        return false;
      }
      return Object.keys(oFieldValidityObject).length > 0 && Object.keys(oFieldValidityObject).every(function (key) {
        return oFieldValidityObject[key]["validity"];
      });
    },
    /**
     * Method to get the expression for the 'press' event for the DataFieldForActionButton.
     *
     * @function
     * @name pressEventDataFieldForActionButton
     * @param tableProperties The properties of the table control
     * @param tableProperties.contextObjectPath The datamodel object path for the table
     * @param tableProperties.id The id of the table control
     * @param dataField Value of the DataPoint
     * @param entitySetName Name of the EntitySet
     * @param operationAvailableMap OperationAvailableMap as stringified JSON object
     * @param actionContext The instance or the path of the action
     * @param isNavigable Action either triggers navigation or not
     * @param enableAutoScroll Action either triggers scrolling to the newly created items in the related table or not
     * @param defaultValuesExtensionFunction Function name to prefill dialog parameters
     * @returns The binding expression
     */
    pressEventDataFieldForActionButton: function (tableProperties, dataField, entitySetName, operationAvailableMap, actionObject) {
      let isNavigable = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      let enableAutoScroll = arguments.length > 6 ? arguments[6] : undefined;
      let defaultValuesExtensionFunction = arguments.length > 7 ? arguments[7] : undefined;
      if (!dataField) return undefined;
      const sActionName = dataField.Action,
        targetEntityTypeName = tableProperties.contextObjectPath.targetEntityType.fullyQualifiedName,
        staticAction = typeof actionObject !== "string" && (this._isStaticAction(actionObject, sActionName) || this._isActionOverloadOnDifferentType(sActionName, targetEntityTypeName)),
        params = {
          contexts: !staticAction ? pathInModel("selectedContexts", "internal") : null,
          bStaticAction: staticAction ? staticAction : undefined,
          entitySetName: entitySetName,
          applicableContexts: !staticAction ? pathInModel(`dynamicActions/${dataField.Action}/aApplicable/`, "internal") : null,
          notApplicableContexts: !staticAction ? pathInModel(`dynamicActions/${dataField.Action}/aNotApplicable/`, "internal") : null,
          isNavigable: isNavigable,
          enableAutoScroll: enableAutoScroll,
          defaultValuesExtensionFunction: defaultValuesExtensionFunction
        };
      params.invocationGrouping = (dataField === null || dataField === void 0 ? void 0 : dataField.InvocationGrouping) === "UI.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
      params.controlId = tableProperties.id;
      params.operationAvailableMap = operationAvailableMap;
      params.label = dataField.Label;
      return compileExpression(fn("API.onActionPress", [ref("$event"), ref("$controller"), dataField.Action, params]));
      //return ActionHelper.getPressEventDataFieldForActionButton(table.id!, dataField, params, operationAvailableMap);
    },

    /**
     * Method to determine the binding expression for 'enabled' property of DataFieldForAction actions.
     *
     * @function
     * @name isDataFieldForActionEnabled
     * @param tableDefinition The table definition from the table converter
     * @param actionName The name of the action
     * @param isBound IsBound for Action
     * @param actionContext The instance or the path of the action
     * @param enableOnSelect Define the enabling of the action (single or multiselect)
     * @param annotationTargetEntityType The entity type of the annotation target
     * @returns A binding expression to define the 'enabled' property of the action
     */
    isDataFieldForActionEnabled: function (tableDefinition, actionName, isBound, actionObject, enableOnSelect, annotationTargetEntityType) {
      const isStaticAction = this._isStaticAction(actionObject, actionName);

      // Check for action overload on a different Entity type.
      // If yes, table row selection is not required to enable this action.
      if (this._isActionOverloadOnDifferentType(actionName, annotationTargetEntityType)) {
        // Action overload defined on different entity type
        const oOperationAvailableMap = tableDefinition && JSON.parse(tableDefinition.operationAvailableMap);
        if (oOperationAvailableMap !== null && oOperationAvailableMap !== void 0 && oOperationAvailableMap.hasOwnProperty(actionName)) {
          // Core.OperationAvailable annotation defined for the action.
          // Need to refer to internal model for enabled property of the dynamic action.
          // return compileBinding(bindingExpression("dynamicActions/" + sActionName + "/bEnabled", "internal"), true);
          return `{= \${internal>dynamicActions/${actionName}/bEnabled} }`;
        }
        // Consider the action just like any other static DataFieldForAction.
        return true;
      }
      if (!isBound || isStaticAction) {
        return true;
      }
      let dataFieldForActionEnabledExpression = "";
      const numberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(enableOnSelect ?? "multiselect");
      const action = `\${internal>dynamicActions/${actionName}/bEnabled}`;
      dataFieldForActionEnabledExpression = `${numberOfSelectedContexts} && ${action}`;
      return `{= ${dataFieldForActionEnabledExpression}}`;
    },
    /**
     * Method to determine the binding expression for 'enabled' property of DataFieldForIBN actions.
     *
     * @function
     * @name isDataFieldForIBNEnabled
     * @param tableProperties The properties of the table control
     * @param tableProperties.collection  The collection context to be used
     * @param tableProperties.tableDefinition The table definition from the table converter
     * @param dataField The value of the data field
     * @param requiresContext RequiresContext for IBN
     * @param isNavigationAvailable Define if the navigation is available
     * @returns A binding expression to define the 'enabled' property of the action
     */
    isDataFieldForIBNEnabled: function (tableProperties, dataField, requiresContext, isNavigationAvailable) {
      var _tableProperties$tabl;
      let isNavigationAvailablePath = null;
      if (isPathAnnotationExpression(isNavigationAvailable)) {
        isNavigationAvailablePath = isNavigationAvailable.path;
      }
      const isAnalyticalTable = tableProperties === null || tableProperties === void 0 ? void 0 : (_tableProperties$tabl = tableProperties.tableDefinition) === null || _tableProperties$tabl === void 0 ? void 0 : _tableProperties$tabl.enableAnalytics;
      if (!requiresContext) {
        const entitySet = tableProperties.collection.getPath();
        const metaModel = tableProperties.collection.getModel();
        if (isNavigationAvailable === false && !isAnalyticalTable) {
          Log.warning("NavigationAvailable as false is incorrect usage");
          return false;
        } else if (isNavigationAvailablePath && !isAnalyticalTable && isPathAnnotationExpression(dataField === null || dataField === void 0 ? void 0 : dataField.NavigationAvailable) && metaModel.getObject(entitySet + "/$Partner") === dataField.NavigationAvailable.path.split("/")[0]) {
          return `{= \${${isNavigationAvailablePath.substring(isNavigationAvailablePath.indexOf("/") + 1, isNavigationAvailablePath.length)}}}`;
        }
        return true;
      }
      let dataFieldForIBNEnabledExpression = "",
        numberOfSelectedContexts,
        action;
      if (isNavigationAvailable === true || isAnalyticalTable) {
        dataFieldForIBNEnabledExpression = "%{internal>numberOfSelectedContexts} >= 1";
      } else if (isNavigationAvailable === false) {
        Log.warning("NavigationAvailable as false is incorrect usage");
        return false;
      } else {
        numberOfSelectedContexts = "%{internal>numberOfSelectedContexts} >= 1";
        action = `\${internal>ibn/${dataField.SemanticObject}-${dataField.Action}/bEnabled}`;
        dataFieldForIBNEnabledExpression = numberOfSelectedContexts + " && " + action;
      }
      return `{= ${dataFieldForIBNEnabledExpression}}`;
    },
    /**
     * Method to get press event expression for CreateButton.
     *
     * @function
     * @name pressEventForCreateButton
     * @param oThis Current Object
     * @param bCmdExecutionFlag Flag to indicate that the function is called from CMD Execution
     * @returns The binding expression for the press event of the create button
     */
    pressEventForCreateButton: function (oThis, bCmdExecutionFlag) {
      const sCreationMode = oThis.creationMode;
      let oParams;
      const sMdcTable = bCmdExecutionFlag ? "${$source>}.getParent()" : "${$source>}.getParent().getParent().getParent()";
      let sRowBinding = sMdcTable + ".getRowBinding() || " + sMdcTable + ".data('rowsBindingInfo').path";
      switch (sCreationMode) {
        case CreationMode.External:
          // navigate to external target for creating new entries
          // TODO: Add required parameters
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(CreationMode.External),
            outbound: CommonHelper.addSingleQuotes(oThis.createOutbound)
          };
          break;
        case CreationMode.CreationRow:
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(CreationMode.CreationRow),
            creationRow: "${$source>}",
            createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false
          };
          sRowBinding = "${$source>}.getParent().getRowBinding()";
          break;
        case CreationMode.NewPage:
        case CreationMode.Inline:
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(sCreationMode),
            createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false,
            tableId: CommonHelper.addSingleQuotes(oThis.id)
          };
          if (oThis.createNewAction) {
            oParams.newAction = CommonHelper.addSingleQuotes(oThis.createNewAction);
          }
          break;
        case CreationMode.InlineCreationRows:
          return CommonHelper.generateFunction(".editFlow.createEmptyRowsAndFocus", sMdcTable);
        default:
          // unsupported
          return undefined;
      }
      return CommonHelper.generateFunction(".editFlow.createDocument", sRowBinding, CommonHelper.objectToString(oParams));
    },
    getIBNData: function (outboundDetail) {
      if (outboundDetail) {
        const oIBNData = {
          semanticObject: CommonHelper.addSingleQuotes(outboundDetail.semanticObject),
          action: CommonHelper.addSingleQuotes(outboundDetail.action)
        };
        return CommonHelper.objectToString(oIBNData);
      }
    },
    _getExpressionForDeleteButton: function (value, fullContextPath) {
      if (typeof value === "string") {
        return CommonHelper.addSingleQuotes(value, true);
      } else {
        const expression = getExpressionFromAnnotation(value);
        if (isConstant(expression) || isPathInModelExpression(expression)) {
          const valueExpression = formatValueRecursively(expression, fullContextPath);
          return compileExpression(valueExpression);
        }
      }
    },
    /**
     * Method to get press event expression for 'Delete' button.
     *
     * @function
     * @name pressEventForDeleteButton
     * @param oThis Current Object
     * @param sEntitySetName EntitySet name
     * @param oHeaderInfo Header Info
     * @param fullcontextPath Context Path
     * @returns The binding expression for the press event of the 'Delete' button
     */
    pressEventForDeleteButton: function (oThis, sEntitySetName, oHeaderInfo, fullcontextPath) {
      const sDeletableContexts = "${internal>deletableContexts}";
      let sTitleExpression, sDescriptionExpression;
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.Title) {
        sTitleExpression = this._getExpressionForDeleteButton(oHeaderInfo.Title.Value, fullcontextPath);
      }
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.Description) {
        sDescriptionExpression = this._getExpressionForDeleteButton(oHeaderInfo.Description.Value, fullcontextPath);
      }
      const oParams = {
        id: CommonHelper.addSingleQuotes(oThis.id),
        entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
        numberOfSelectedContexts: "${internal>selectedContexts}.length",
        unSavedContexts: "${internal>unSavedContexts}",
        lockedContexts: "${internal>lockedContexts}",
        draftsWithDeletableActive: "${internal>draftsWithDeletableActive}",
        draftsWithNonDeletableActive: "${internal>draftsWithNonDeletableActive}",
        controlId: "${internal>controlId}",
        title: sTitleExpression,
        description: sDescriptionExpression,
        selectedContexts: "${internal>selectedContexts}"
      };
      return CommonHelper.generateFunction(".editFlow.deleteMultipleDocuments", sDeletableContexts, CommonHelper.objectToString(oParams));
    },
    /**
     * Method to set the visibility of the label for the column header.
     *
     * @function
     * @name setHeaderLabelVisibility
     * @param datafield DataField
     * @param dataFieldCollection List of items inside a fieldgroup (if any)
     * @returns `true` if the header label needs to be visible else false.
     */
    setHeaderLabelVisibility: function (datafield, dataFieldCollection) {
      // If Inline button/navigation action, return false, else true;
      if (!dataFieldCollection) {
        if (datafield.$Type.indexOf("DataFieldForAction") > -1 && datafield.Inline) {
          return false;
        }
        if (datafield.$Type.indexOf("DataFieldForIntentBasedNavigation") > -1 && datafield.Inline) {
          return false;
        }
        return true;
      }

      // In Fieldgroup, If NOT all datafield/datafieldForAnnotation exists with hidden, return true;
      return dataFieldCollection.some(function (oDC) {
        if ((oDC.$Type === "com.sap.vocabularies.UI.v1.DataField" || oDC.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") && oDC[`@${"com.sap.vocabularies.UI.v1.Hidden"}`] !== true) {
          return true;
        }
      });
    },
    /**
     * Method to get the text from the DataFieldForAnnotation into the column.
     *
     * @function
     * @name getTextOnActionField
     * @param oDataField DataPoint's Value
     * @param oContext Context object of the LineItem
     * @returns String from label referring to action text
     */
    getTextOnActionField: function (oDataField, oContext) {
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        return oDataField.Label;
      }
      // for FieldGroup containing DataFieldForAnnotation
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && oContext.context.getObject("Target/$AnnotationPath").indexOf("@" + "com.sap.vocabularies.UI.v1.FieldGroup") > -1) {
        const sPathDataFields = "Target/$AnnotationPath/Data/";
        const aMultipleLabels = [];
        for (const i in oContext.context.getObject(sPathDataFields)) {
          if (oContext.context.getObject(`${sPathDataFields + i}/$Type`) === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oContext.context.getObject(`${sPathDataFields + i}/$Type`) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
            aMultipleLabels.push(oContext.context.getObject(`${sPathDataFields + i}/Label`));
          }
        }
        // In case there are multiple actions inside a Field Group select the largest Action Label
        if (aMultipleLabels.length > 1) {
          return aMultipleLabels.reduce(function (a, b) {
            return a.length > b.length ? a : b;
          });
        } else {
          return aMultipleLabels.length === 0 ? undefined : aMultipleLabels.toString();
        }
      }
      return undefined;
    },
    _getResponsiveTableColumnSettings: function (oThis, oColumn) {
      if (oThis.tableType === "ResponsiveTable") {
        return oColumn.settings;
      }
      return null;
    },
    getChartSize: function (oThis, oColumn) {
      const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
      if (settings && settings.microChartSize) {
        return settings.microChartSize;
      }
      return "XS";
    },
    getShowOnlyChart: function (oThis, oColumn) {
      const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
      if (settings && settings.showMicroChartLabel) {
        return !settings.showMicroChartLabel;
      }
      return true;
    },
    getDelegate: function (table, isALP, entityName) {
      let oDelegate;
      if (isALP === "true") {
        // We don't support TreeTable in ALP
        if (table.control.type === "TreeTable") {
          throw new Error("TreeTable not supported in Analytical ListPage");
        }
        oDelegate = {
          name: "sap/fe/macros/table/delegates/ALPTableDelegate",
          payload: {
            collectionName: entityName
          }
        };
      } else if (table.control.type === "TreeTable") {
        oDelegate = {
          name: "sap/fe/macros/table/delegates/TreeTableDelegate",
          payload: {
            hierarchyQualifier: table.control.hierarchyQualifier,
            initialExpansionLevel: table.annotation.initialExpansionLevel
          }
        };
      } else {
        oDelegate = {
          name: "sap/fe/macros/table/delegates/TableDelegate"
        };
      }
      return JSON.stringify(oDelegate);
    },
    setIBNEnablement: function (oInternalModelContext, oNavigationAvailableMap, aSelectedContexts) {
      for (const sKey in oNavigationAvailableMap) {
        oInternalModelContext.setProperty(`ibn/${sKey}`, {
          bEnabled: false,
          aApplicable: [],
          aNotApplicable: []
        });
        const aApplicable = [],
          aNotApplicable = [];
        const sProperty = oNavigationAvailableMap[sKey];
        for (let i = 0; i < aSelectedContexts.length; i++) {
          const oSelectedContext = aSelectedContexts[i];
          if (oSelectedContext.getObject(sProperty)) {
            oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/bEnabled`, true);
            aApplicable.push(oSelectedContext);
          } else {
            aNotApplicable.push(oSelectedContext);
          }
        }
        oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aApplicable`, aApplicable);
        oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aNotApplicable`, aNotApplicable);
      }
    },
    /**
     * @param oFastCreationRow
     * @param sPath
     * @param oContext
     * @param oModel
     * @param oFinalUIState
     */
    enableFastCreationRow: async function (oFastCreationRow, sPath, oContext, oModel, oFinalUIState) {
      let oFastCreationListBinding, oFastCreationContext;
      if (oFastCreationRow) {
        try {
          await oFinalUIState;
          // If a draft is discarded while a message strip filter is active on the table there is a table rebind caused by the DataStateIndicator
          // To prevent a new creation row binding being created at that moment we check if the context is already deleted
          if (oFastCreationRow.getModel("ui").getProperty("/isEditable") && !oContext.isDeleted()) {
            oFastCreationListBinding = oModel.bindList(sPath, oContext, [], [], {
              $$updateGroupId: "doNotSubmit",
              $$groupId: "doNotSubmit"
            });
            // Workaround suggested by OData model v4 colleagues
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            oFastCreationListBinding.refreshInternal = function () {
              /* do nothing */
            };
            oFastCreationContext = oFastCreationListBinding.create();
            oFastCreationRow.setBindingContext(oFastCreationContext);

            // this is needed to avoid console error
            try {
              await oFastCreationContext.created();
            } catch (e) {
              Log.trace("transient fast creation context deleted");
            }
          }
        } catch (oError) {
          Log.error("Error while computing the final UI state", oError);
        }
      }
    }
  };
  TableHelper.getNavigationAvailableMap.requiresIContext = true;
  TableHelper.getTextOnActionField.requiresIContext = true;
  return TableHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJUYWJsZUhlbHBlciIsIl9pc1N0YXRpY0FjdGlvbiIsImFjdGlvbk9iamVjdCIsImFjdGlvbk5hbWUiLCJhY3Rpb24iLCJBcnJheSIsImlzQXJyYXkiLCJlbnRpdHlUeXBlIiwiX2dldEFjdGlvbk92ZXJsb2FkRW50aXR5VHlwZSIsImZpbmQiLCJfYWN0aW9uIiwiJElzQm91bmQiLCIkUGFyYW1ldGVyIiwiJFR5cGUiLCIkaXNDb2xsZWN0aW9uIiwic0FjdGlvbk5hbWUiLCJpbmRleE9mIiwiYVBhcnRzIiwic3BsaXQiLCJsZW5ndGgiLCJyZXBsYWNlQWxsIiwidW5kZWZpbmVkIiwiX2lzQWN0aW9uT3ZlcmxvYWRPbkRpZmZlcmVudFR5cGUiLCJzQW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUiLCJzRW50aXR5VHlwZSIsImdldEZpZWxkc1JlcXVlc3RlZEJ5UHJlc2VudGF0aW9uVmFyaWFudCIsIm9QcmVzZW50YXRpb25WYXJpYW50IiwiUmVxdWVzdEF0TGVhc3QiLCJtYXAiLCJvUmVxdWVzdGVkIiwidmFsdWUiLCJnZXROYXZpZ2F0aW9uQXZhaWxhYmxlRmllbGRzRnJvbUxpbmVJdGVtIiwiYUxpbmVJdGVtQ29udGV4dCIsImFTZWxlY3RlZEZpZWxkc0FycmF5IiwiZ2V0T2JqZWN0IiwiZm9yRWFjaCIsIm9SZWNvcmQiLCJJbmxpbmUiLCJEZXRlcm1pbmluZyIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCIkUGF0aCIsInB1c2giLCJnZXROYXZpZ2F0aW9uQXZhaWxhYmxlTWFwIiwibGluZUl0ZW1Db2xsZWN0aW9uIiwib0lCTk5hdmlnYXRpb25BdmFpbGFibGVNYXAiLCJyZWNvcmQiLCJzS2V5IiwiU2VtYW50aWNPYmplY3QiLCJBY3Rpb24iLCJSZXF1aXJlc0NvbnRleHQiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsInBhdGgiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0VWlMaW5lSXRlbSIsInByZXNlbnRhdGlvbkNvbnRleHQiLCJnZXRVaUNvbnRyb2wiLCJnZXRVaUxpbmVJdGVtT2JqZWN0IiwibGluZUl0ZW1PclByZXNlbnRhdGlvbkNvbnRleHQiLCJjb252ZXJ0ZWRNZXRhRGF0YSIsImxpbmVJdGVtT3JQcmVzZW50YXRpb25PYmplY3QiLCJyZXNvbHZlUGF0aCIsImdldFBhdGgiLCJ0YXJnZXQiLCJ2aXN1YWxpemF0aW9ucyIsIlZpc3VhbGl6YXRpb25zIiwibGluZUl0ZW1PYmplY3QiLCJpdGVtIiwiJHRhcmdldCIsInRlcm0iLCJjcmVhdGUkU2VsZWN0IiwidGFibGUiLCJzZWxlY3RlZEZpZWxkcyIsImxpbmVJdGVtQ29udGV4dCIsIm1ldGFQYXRoIiwicHVzaEZpZWxkIiwiZmllbGQiLCJpbmNsdWRlcyIsInB1c2hGaWVsZExpc3QiLCJmaWVsZHMiLCJjb2x1bW5zIiwidGFibGVEZWZpbml0aW9uIiwicHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zIiwiZ2V0UHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zIiwicHJlc2VudGF0aW9uQW5ub3RhdGlvbiIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsInRhcmdldE9iamVjdCIsIm9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMiLCJhcHBsaWNhYmxlUHJvcGVydGllcyIsIl9maWx0ZXJOb25BcHBsaWNhYmxlUHJvcGVydGllcyIsImNvbGxlY3Rpb24iLCJ0YXJnZXRDb2xsZWN0aW9uIiwiY29sbGVjdGlvbkVudGl0eSIsInRhcmdldFR5cGUiLCJhU2VtYW50aWNLZXlzIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJTZW1hbnRpY0tleSIsIm9TZW1hbnRpY0tleSIsImNvbnRleHRPYmplY3RQYXRoIiwidGFyZ2V0RW50aXR5U2V0IiwiQ2FwYWJpbGl0aWVzIiwiRGVsZXRlUmVzdHJpY3Rpb25zIiwiRGVsZXRhYmxlIiwiVXBkYXRlUmVzdHJpY3Rpb25zIiwiVXBkYXRhYmxlIiwiam9pbiIsImdldENvbHVtbldpZHRoIiwib1RoaXMiLCJjb2x1bW4iLCJkYXRhRmllbGQiLCJkYXRhRmllbGRBY3Rpb25UZXh0IiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsInVzZVJlbVVuaXQiLCJtaWNyb0NoYXJ0VGl0bGUiLCJ3aWR0aCIsImVuYWJsZUF1dG9Db2x1bW5XaWR0aCIsImdldENvbHVtbldpZHRoRm9ySW1hZ2UiLCJnZXRDb2x1bW5XaWR0aEZvckRhdGFGaWVsZCIsImNvbXBpbGVFeHByZXNzaW9uIiwiZm9ybWF0UmVzdWx0IiwicGF0aEluTW9kZWwiLCJuYW1lIiwiVGFibGVGb3JtYXR0ZXIiLCJWYWx1ZSIsImRhdGFUeXBlIiwidHlwZSIsImdldEVkaXRNb2RlIiwiRWRpdE1vZGUiLCJEaXNwbGF5IiwiaGFzVGV4dEFubm90YXRpb24iLCJoYXNUZXh0IiwiQ29yZSIsIk1lZGlhVHlwZSIsImlzSW1hZ2VVUkwiLCJvTWljcm9DaGFydFRpdGxlIiwiVGFyZ2V0IiwiJEFubm90YXRpb25QYXRoIiwiblRtcFRleHRXaWR0aCIsIlNpemVIZWxwZXIiLCJnZXRCdXR0b25XaWR0aCIsIkxhYmVsIiwidG9TdHJpbmciLCJuVG1wVmlzdWFsaXphdGlvbldpZHRoIiwiVGFibGVTaXplSGVscGVyIiwiZ2V0V2lkdGhGb3JEYXRhRmllbGRGb3JBbm5vdGF0aW9uIiwicHJvcGVydHlXaWR0aCIsImdldENvbHVtbldpZHRoRm9yQ2hhcnQiLCJjb2x1bW5MYWJlbFdpZHRoIiwiY2hhcnRTaXplIiwiZ2V0Q2hhcnRTaXplIiwiZ2V0U2hvd09ubHlDaGFydCIsIlRpdGxlIiwiRGVzY3JpcHRpb24iLCJ0bXBUZXh0IiwidGl0bGVTaXplIiwidG1wV2lkdGgiLCJnZXRNYXJnaW5DbGFzcyIsIm9Db2xsZWN0aW9uIiwib0RhdGFGaWVsZCIsInNWaXN1YWxpemF0aW9uIiwic0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyIsInNCaW5kaW5nRXhwcmVzc2lvbiIsInNDbGFzcyIsInNIaWRkZW5FeHByZXNzaW9uUmVzdWx0Iiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJnZXRWQm94VmlzaWJpbGl0eSIsImZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyIsImZpZWxkR3JvdXAiLCJhbGxTdGF0aWMiLCJoaWRkZW5QYXRocyIsImhpZGRlbkFubm90YXRpb25WYWx1ZSIsImhhc0FueVBhdGhFeHByZXNzaW9ucyIsImNvbnN0YW50IiwiaGFzQWxsSGlkZGVuU3RhdGljRXhwcmVzc2lvbnMiLCJpZkVsc2UiLCJmb3JtYXRIaWRkZW5GaWx0ZXJzIiwib0hpZGRlbkZpbHRlciIsImV4IiwiZ2V0RWxlbWVudFN0YWJsZUlkIiwidGFibGVJZCIsImVsZW1lbnRJZCIsImRhdGFGaWVsZFBhcnQiLCJnZW5lcmF0ZSIsImdldENvbHVtblN0YWJsZUlkIiwiaWQiLCJnZXRGaWVsZEdyb3VwTGFiZWxTdGFibGVJZCIsInByb3BlcnRpZXMiLCJjb2xsZWN0aW9uQ29udGV4dCIsImZpbHRlciIsInNQcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0eSIsImdldFJvd3NCaW5kaW5nSW5mbyIsImRhdGFNb2RlbFBhdGgiLCJjb250ZXh0UGF0aCIsImdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwib1Jvd0JpbmRpbmciLCJ1aTVvYmplY3QiLCJzdXNwZW5kZWQiLCJDb21tb25IZWxwZXIiLCJhZGRTaW5nbGVRdW90ZXMiLCJwYXJhbWV0ZXJzIiwiJGNvdW50IiwiZXZlbnRzIiwiZW5hYmxlJHNlbGVjdCIsInNTZWxlY3QiLCIkc2VsZWN0IiwiZW5hYmxlJCRnZXRLZWVwQWxpdmVDb250ZXh0IiwiJCRnZXRLZWVwQWxpdmVDb250ZXh0IiwiJCRncm91cElkIiwiJCR1cGRhdGVHcm91cElkIiwiJCRvd25SZXF1ZXN0IiwiJCRwYXRjaFdpdGhvdXRTaWRlRWZmZWN0cyIsInBhdGNoU2VudCIsInBhdGNoQ29tcGxldGVkIiwiZGF0YVJlY2VpdmVkIiwiZGF0YVJlcXVlc3RlZCIsImNoYW5nZSIsImNyZWF0ZUFjdGl2YXRlIiwib2JqZWN0VG9TdHJpbmciLCJ2YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzIiwib0ZpZWxkVmFsaWRpdHlPYmplY3QiLCJPYmplY3QiLCJrZXlzIiwiZXZlcnkiLCJrZXkiLCJwcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uIiwidGFibGVQcm9wZXJ0aWVzIiwiZW50aXR5U2V0TmFtZSIsIm9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImlzTmF2aWdhYmxlIiwiZW5hYmxlQXV0b1Njcm9sbCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsInRhcmdldEVudGl0eVR5cGVOYW1lIiwidGFyZ2V0RW50aXR5VHlwZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInN0YXRpY0FjdGlvbiIsInBhcmFtcyIsImNvbnRleHRzIiwiYlN0YXRpY0FjdGlvbiIsImFwcGxpY2FibGVDb250ZXh0cyIsIm5vdEFwcGxpY2FibGVDb250ZXh0cyIsImludm9jYXRpb25Hcm91cGluZyIsIkludm9jYXRpb25Hcm91cGluZyIsImNvbnRyb2xJZCIsImxhYmVsIiwiZm4iLCJyZWYiLCJpc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWQiLCJpc0JvdW5kIiwiZW5hYmxlT25TZWxlY3QiLCJhbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZSIsImlzU3RhdGljQWN0aW9uIiwib09wZXJhdGlvbkF2YWlsYWJsZU1hcCIsInBhcnNlIiwiaGFzT3duUHJvcGVydHkiLCJkYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkRXhwcmVzc2lvbiIsIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyIsIkFjdGlvbkhlbHBlciIsImdldE51bWJlck9mQ29udGV4dHNFeHByZXNzaW9uIiwiaXNEYXRhRmllbGRGb3JJQk5FbmFibGVkIiwicmVxdWlyZXNDb250ZXh0IiwiaXNOYXZpZ2F0aW9uQXZhaWxhYmxlIiwiaXNOYXZpZ2F0aW9uQXZhaWxhYmxlUGF0aCIsImlzQW5hbHl0aWNhbFRhYmxlIiwiZW5hYmxlQW5hbHl0aWNzIiwiZW50aXR5U2V0IiwibWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJMb2ciLCJ3YXJuaW5nIiwiZGF0YUZpZWxkRm9ySUJORW5hYmxlZEV4cHJlc3Npb24iLCJwcmVzc0V2ZW50Rm9yQ3JlYXRlQnV0dG9uIiwiYkNtZEV4ZWN1dGlvbkZsYWciLCJzQ3JlYXRpb25Nb2RlIiwiY3JlYXRpb25Nb2RlIiwib1BhcmFtcyIsInNNZGNUYWJsZSIsInNSb3dCaW5kaW5nIiwiRXh0ZXJuYWwiLCJvdXRib3VuZCIsImNyZWF0ZU91dGJvdW5kIiwiQ3JlYXRpb25Sb3ciLCJjcmVhdGlvblJvdyIsImNyZWF0ZUF0RW5kIiwiTmV3UGFnZSIsImNyZWF0ZU5ld0FjdGlvbiIsIm5ld0FjdGlvbiIsIklubGluZUNyZWF0aW9uUm93cyIsImdlbmVyYXRlRnVuY3Rpb24iLCJnZXRJQk5EYXRhIiwib3V0Ym91bmREZXRhaWwiLCJvSUJORGF0YSIsInNlbWFudGljT2JqZWN0IiwiX2dldEV4cHJlc3Npb25Gb3JEZWxldGVCdXR0b24iLCJmdWxsQ29udGV4dFBhdGgiLCJleHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiaXNDb25zdGFudCIsImlzUGF0aEluTW9kZWxFeHByZXNzaW9uIiwidmFsdWVFeHByZXNzaW9uIiwiZm9ybWF0VmFsdWVSZWN1cnNpdmVseSIsInByZXNzRXZlbnRGb3JEZWxldGVCdXR0b24iLCJzRW50aXR5U2V0TmFtZSIsIm9IZWFkZXJJbmZvIiwiZnVsbGNvbnRleHRQYXRoIiwic0RlbGV0YWJsZUNvbnRleHRzIiwic1RpdGxlRXhwcmVzc2lvbiIsInNEZXNjcmlwdGlvbkV4cHJlc3Npb24iLCJ1blNhdmVkQ29udGV4dHMiLCJsb2NrZWRDb250ZXh0cyIsImRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUiLCJkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsInNlbGVjdGVkQ29udGV4dHMiLCJzZXRIZWFkZXJMYWJlbFZpc2liaWxpdHkiLCJkYXRhZmllbGQiLCJkYXRhRmllbGRDb2xsZWN0aW9uIiwic29tZSIsIm9EQyIsImdldFRleHRPbkFjdGlvbkZpZWxkIiwib0NvbnRleHQiLCJjb250ZXh0Iiwic1BhdGhEYXRhRmllbGRzIiwiYU11bHRpcGxlTGFiZWxzIiwiaSIsInJlZHVjZSIsImEiLCJiIiwiX2dldFJlc3BvbnNpdmVUYWJsZUNvbHVtblNldHRpbmdzIiwib0NvbHVtbiIsInRhYmxlVHlwZSIsInNldHRpbmdzIiwibWljcm9DaGFydFNpemUiLCJzaG93TWljcm9DaGFydExhYmVsIiwiZ2V0RGVsZWdhdGUiLCJpc0FMUCIsImVudGl0eU5hbWUiLCJvRGVsZWdhdGUiLCJjb250cm9sIiwiRXJyb3IiLCJwYXlsb2FkIiwiY29sbGVjdGlvbk5hbWUiLCJoaWVyYXJjaHlRdWFsaWZpZXIiLCJpbml0aWFsRXhwYW5zaW9uTGV2ZWwiLCJhbm5vdGF0aW9uIiwic2V0SUJORW5hYmxlbWVudCIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsIm9OYXZpZ2F0aW9uQXZhaWxhYmxlTWFwIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJzZXRQcm9wZXJ0eSIsImJFbmFibGVkIiwiYUFwcGxpY2FibGUiLCJhTm90QXBwbGljYWJsZSIsInNQcm9wZXJ0eSIsIm9TZWxlY3RlZENvbnRleHQiLCJlbmFibGVGYXN0Q3JlYXRpb25Sb3ciLCJvRmFzdENyZWF0aW9uUm93Iiwic1BhdGgiLCJvTW9kZWwiLCJvRmluYWxVSVN0YXRlIiwib0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nIiwib0Zhc3RDcmVhdGlvbkNvbnRleHQiLCJnZXRQcm9wZXJ0eSIsImlzRGVsZXRlZCIsImJpbmRMaXN0IiwicmVmcmVzaEludGVybmFsIiwiY3JlYXRlIiwic2V0QmluZGluZ0NvbnRleHQiLCJjcmVhdGVkIiwiZSIsInRyYWNlIiwib0Vycm9yIiwiZXJyb3IiLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XG5cdENvbnZlcnRlZE1ldGFkYXRhLFxuXHRFbnRpdHlTZXQsXG5cdEVudGl0eVR5cGUsXG5cdE5hdmlnYXRpb25Qcm9wZXJ0eSxcblx0UGF0aEFubm90YXRpb25FeHByZXNzaW9uLFxuXHRQcm9wZXJ0eUFubm90YXRpb25WYWx1ZVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7XG5cdERhdGFGaWVsZCxcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YUZpZWxkRm9yQWN0aW9uLFxuXHREYXRhRmllbGRGb3JBbm5vdGF0aW9uLFxuXHREYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdEZpZWxkR3JvdXAsXG5cdExpbmVJdGVtLFxuXHRQcmVzZW50YXRpb25WYXJpYW50LFxuXHRQcmVzZW50YXRpb25WYXJpYW50VHlwZSxcblx0VUlBbm5vdGF0aW9uVGVybXMsXG5cdFVJQW5ub3RhdGlvblR5cGVzXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgZ2V0VWlDb250cm9sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQge1xuXHRBbm5vdGF0aW9uVGFibGVDb2x1bW4sXG5cdFRhYmxlQ29sdW1uLFxuXHRUYWJsZUZpbHRlcnNDb25maWd1cmF0aW9uLFxuXHRUYWJsZVZpc3VhbGl6YXRpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSB7IE5hdmlnYXRpb25UYXJnZXRDb25maWd1cmF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHR5cGUgeyBNZXRhTW9kZWxBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IFRhYmxlRm9ybWF0dGVyIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1RhYmxlRm9ybWF0dGVyXCI7XG5pbXBvcnQge1xuXHRDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0Y29tcGlsZUV4cHJlc3Npb24sXG5cdGNvbnN0YW50LFxuXHRmbixcblx0Zm9ybWF0UmVzdWx0LFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sXG5cdGlmRWxzZSxcblx0aXNDb25zdGFudCxcblx0aXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24sXG5cdHBhdGhJbk1vZGVsLFxuXHRyZWZcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCBTaXplSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NpemVIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB7IGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IEZFTGlicmFyeSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHsgRGF0YU1vZGVsT2JqZWN0UGF0aCwgZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCwgZ2V0VGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGhhc1RleHQsIGlzSW1hZ2VVUkwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RWRpdE1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IHRhYmxlRGVsZWdhdGVNb2RlbCB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IHsgZm9ybWF0VmFsdWVSZWN1cnNpdmVseSB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0IEFjdGlvbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9oZWxwZXJzL0FjdGlvbkhlbHBlclwiO1xuaW1wb3J0IFRhYmxlQmxvY2sgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGUuYmxvY2tcIjtcbmltcG9ydCBUYWJsZVNpemVIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVTaXplSGVscGVyXCI7XG5pbXBvcnQgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdjRDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5cbnR5cGUgSGlkZGVuID0geyBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIjogYm9vbGVhbiB8IHsgJFBhdGg/OiBzdHJpbmcgfSB9O1xuXG5jb25zdCBDcmVhdGlvbk1vZGUgPSBGRUxpYnJhcnkuQ3JlYXRpb25Nb2RlO1xuXG4vKipcbiAqIEhlbHBlciBjbGFzcyB1c2VkIGJ5IHRoZSBjb250cm9sIGxpYnJhcnkgZm9yIE9EYXRhLXNwZWNpZmljIGhhbmRsaW5nIChPRGF0YSBWNClcbiAqXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbCBUaGlzIG1vZHVsZSBpcyBvbmx5IGZvciBpbnRlcm5hbC9leHBlcmltZW50YWwgdXNlIVxuICovXG5jb25zdCBUYWJsZUhlbHBlciA9IHtcblx0LyoqXG5cdCAqIENoZWNrIGlmIGEgZ2l2ZW4gYWN0aW9uIGlzIHN0YXRpYy5cblx0ICpcblx0ICogQHBhcmFtIGFjdGlvbk9iamVjdCBUaGUgaW5zdGFuY2Ugb3IgdGhlIHBhdGggb2YgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gYWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uXG5cdCAqIEByZXR1cm5zIFJldHVybnMgJ3RydWUnIGlmIGFjdGlvbiBpcyBzdGF0aWMsIGVsc2UgJ2ZhbHNlJ1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9pc1N0YXRpY0FjdGlvbjogZnVuY3Rpb24gKGFjdGlvbk9iamVjdDogTWV0YU1vZGVsQWN0aW9uIHwgTWV0YU1vZGVsQWN0aW9uW10gfCB1bmRlZmluZWQgfCBzdHJpbmcsIGFjdGlvbk5hbWU6IFN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdGxldCBhY3Rpb246IE1ldGFNb2RlbEFjdGlvbiB8IHVuZGVmaW5lZCB8IHN0cmluZztcblx0XHRpZiAoYWN0aW9uT2JqZWN0KSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheShhY3Rpb25PYmplY3QpKSB7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVR5cGUgPSB0aGlzLl9nZXRBY3Rpb25PdmVybG9hZEVudGl0eVR5cGUoYWN0aW9uTmFtZSk7XG5cdFx0XHRcdGlmIChlbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0YWN0aW9uID0gYWN0aW9uT2JqZWN0LmZpbmQoZnVuY3Rpb24gKF9hY3Rpb246IE1ldGFNb2RlbEFjdGlvbikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIF9hY3Rpb24uJElzQm91bmQgJiYgX2FjdGlvbi4kUGFyYW1ldGVyWzBdLiRUeXBlID09PSBlbnRpdHlUeXBlO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGlmIHRoaXMgaXMganVzdCBvbmUgLSBPSyB3ZSB0YWtlIGl0LiBJZiBpdCdzIG1vcmUgaXQncyBhY3R1YWxseSBhIHdyb25nIHVzYWdlIGJ5IHRoZSBhcHBcblx0XHRcdFx0XHQvLyBhcyB3ZSB1c2VkIHRoZSBmaXJzdCBvbmUgYWxsIHRoZSB0aW1lIHdlIGtlZXAgaXQgYXMgaXQgaXNcblx0XHRcdFx0XHRhY3Rpb24gPSBhY3Rpb25PYmplY3RbMF07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFjdGlvbiA9IGFjdGlvbk9iamVjdDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gISFhY3Rpb24gJiYgdHlwZW9mIGFjdGlvbiAhPT0gXCJzdHJpbmdcIiAmJiBhY3Rpb24uJElzQm91bmQgJiYgISFhY3Rpb24uJFBhcmFtZXRlclswXS4kaXNDb2xsZWN0aW9uO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGVudGl0eSB0eXBlIG9mIGFuIGFjdGlvbiBvdmVybG9hZC5cblx0ICpcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24uXG5cdCAqIEByZXR1cm5zIFRoZSBlbnRpdHkgdHlwZSB1c2VkIGluIHRoZSBhY3Rpb24gb3ZlcmxvYWQuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0QWN0aW9uT3ZlcmxvYWRFbnRpdHlUeXBlOiBmdW5jdGlvbiAoc0FjdGlvbk5hbWU6IGFueSkge1xuXHRcdGlmIChzQWN0aW9uTmFtZSAmJiBzQWN0aW9uTmFtZS5pbmRleE9mKFwiKFwiKSA+IC0xKSB7XG5cdFx0XHRjb25zdCBhUGFydHMgPSBzQWN0aW9uTmFtZS5zcGxpdChcIihcIik7XG5cdFx0XHRyZXR1cm4gYVBhcnRzW2FQYXJ0cy5sZW5ndGggLSAxXS5yZXBsYWNlQWxsKFwiKVwiLCBcIlwiKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIHdoZXRoZXIgdGhlIGFjdGlvbiBpcyBvdmVybG9hZGVkIG9uIGEgZGlmZmVyZW50IGVudGl0eSB0eXBlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbi5cblx0ICogQHBhcmFtIHNBbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZSBUaGUgZW50aXR5IHR5cGUgb2YgdGhlIGFubm90YXRpb24gdGFyZ2V0LlxuXHQgKiBAcmV0dXJucyBSZXR1cm5zICd0cnVlJyBpZiB0aGUgYWN0aW9uIGlzIG92ZXJsb2FkZWQgd2l0aCBhIGRpZmZlcmVudCBlbnRpdHkgdHlwZSwgZWxzZSAnZmFsc2UnLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2lzQWN0aW9uT3ZlcmxvYWRPbkRpZmZlcmVudFR5cGU6IGZ1bmN0aW9uIChzQWN0aW9uTmFtZTogYW55LCBzQW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGU6IGFueSkge1xuXHRcdGNvbnN0IHNFbnRpdHlUeXBlID0gdGhpcy5fZ2V0QWN0aW9uT3ZlcmxvYWRFbnRpdHlUeXBlKHNBY3Rpb25OYW1lKTtcblx0XHRyZXR1cm4gISFzRW50aXR5VHlwZSAmJiBzQW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUgIT09IHNFbnRpdHlUeXBlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBmaWVsZHMgbGlzdGVkIGJ5IHRoZSBwcm9wZXJ0eSBSZXF1ZXN0QXRMZWFzdCBpbiB0aGUgUHJlc2VudGF0aW9uVmFyaWFudCAuXG5cdCAqXG5cdCAqIEBwYXJhbSBvUHJlc2VudGF0aW9uVmFyaWFudCBUaGUgYW5ub3RhdGlvbiByZWxhdGVkIHRvIGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnQuXG5cdCAqIEByZXR1cm5zIFRoZSBmaWVsZHMuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0RmllbGRzUmVxdWVzdGVkQnlQcmVzZW50YXRpb25WYXJpYW50OiBmdW5jdGlvbiAob1ByZXNlbnRhdGlvblZhcmlhbnQ6IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlKTogc3RyaW5nW10ge1xuXHRcdHJldHVybiBvUHJlc2VudGF0aW9uVmFyaWFudC5SZXF1ZXN0QXRMZWFzdD8ubWFwKChvUmVxdWVzdGVkKSA9PiBvUmVxdWVzdGVkLnZhbHVlKSB8fCBbXTtcblx0fSxcblx0Z2V0TmF2aWdhdGlvbkF2YWlsYWJsZUZpZWxkc0Zyb21MaW5lSXRlbTogZnVuY3Rpb24gKGFMaW5lSXRlbUNvbnRleHQ6IENvbnRleHQpOiBzdHJpbmdbXSB7XG5cdFx0Y29uc3QgYVNlbGVjdGVkRmllbGRzQXJyYXk6IHN0cmluZ1tdID0gW107XG5cdFx0KChhTGluZUl0ZW1Db250ZXh0LmdldE9iamVjdCgpIGFzIEFycmF5PGFueT4pIHx8IFtdKS5mb3JFYWNoKGZ1bmN0aW9uIChvUmVjb3JkOiBhbnkpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0b1JlY29yZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uICYmXG5cdFx0XHRcdCFvUmVjb3JkLklubGluZSAmJlxuXHRcdFx0XHQhb1JlY29yZC5EZXRlcm1pbmluZyAmJlxuXHRcdFx0XHRvUmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGU/LiRQYXRoXG5cdFx0XHQpIHtcblx0XHRcdFx0YVNlbGVjdGVkRmllbGRzQXJyYXkucHVzaChvUmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGUuJFBhdGgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBhU2VsZWN0ZWRGaWVsZHNBcnJheTtcblx0fSxcblxuXHRnZXROYXZpZ2F0aW9uQXZhaWxhYmxlTWFwOiBmdW5jdGlvbiAobGluZUl0ZW1Db2xsZWN0aW9uOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzW10gfCB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBvSUJOTmF2aWdhdGlvbkF2YWlsYWJsZU1hcDogYW55ID0ge307XG5cdFx0bGluZUl0ZW1Db2xsZWN0aW9uPy5mb3JFYWNoKChyZWNvcmQpID0+IHtcblx0XHRcdGlmIChcIlNlbWFudGljT2JqZWN0XCIgaW4gcmVjb3JkKSB7XG5cdFx0XHRcdGNvbnN0IHNLZXkgPSBgJHtyZWNvcmQuU2VtYW50aWNPYmplY3R9LSR7cmVjb3JkLkFjdGlvbn1gO1xuXHRcdFx0XHRpZiAocmVjb3JkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gJiYgIXJlY29yZC5JbmxpbmUgJiYgcmVjb3JkLlJlcXVpcmVzQ29udGV4dCkge1xuXHRcdFx0XHRcdGlmIChyZWNvcmQuTmF2aWdhdGlvbkF2YWlsYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRvSUJOTmF2aWdhdGlvbkF2YWlsYWJsZU1hcFtzS2V5XSA9IGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uKHJlY29yZC5OYXZpZ2F0aW9uQXZhaWxhYmxlKVxuXHRcdFx0XHRcdFx0XHQ/IChyZWNvcmQuTmF2aWdhdGlvbkF2YWlsYWJsZSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248Ym9vbGVhbj4pLnBhdGhcblx0XHRcdFx0XHRcdFx0OiByZWNvcmQuTmF2aWdhdGlvbkF2YWlsYWJsZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvSUJOTmF2aWdhdGlvbkF2YWlsYWJsZU1hcCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvbnRleHQgb2YgdGhlIFVJLkxpbmVJdGVtLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJlc2VudGF0aW9uQ29udGV4dCBUaGUgcHJlc2VudGF0aW9uIGNvbnRleHQgKGVpdGhlciBhIHByZXNlbnRhdGlvbiB2YXJpYW50IG9yIGEgVUkuTGluZUl0ZW0pXG5cdCAqIEByZXR1cm5zIFRoZSBjb250ZXh0IG9mIHRoZSBVSS5MaW5lSXRlbVxuXHQgKi9cblx0Z2V0VWlMaW5lSXRlbTogZnVuY3Rpb24gKHByZXNlbnRhdGlvbkNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRyZXR1cm4gZ2V0VWlDb250cm9sKHByZXNlbnRhdGlvbkNvbnRleHQsIGBAJHtVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbX1gKTtcblx0fSxcblxuXHRnZXRVaUxpbmVJdGVtT2JqZWN0OiBmdW5jdGlvbiAoXG5cdFx0bGluZUl0ZW1PclByZXNlbnRhdGlvbkNvbnRleHQ6IENvbnRleHQsXG5cdFx0Y29udmVydGVkTWV0YURhdGE6IENvbnZlcnRlZE1ldGFkYXRhXG5cdCk6IERhdGFGaWVsZEFic3RyYWN0VHlwZXNbXSB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgbGluZUl0ZW1PclByZXNlbnRhdGlvbk9iamVjdCA9IGNvbnZlcnRlZE1ldGFEYXRhLnJlc29sdmVQYXRoKGxpbmVJdGVtT3JQcmVzZW50YXRpb25Db250ZXh0LmdldFBhdGgoKSkudGFyZ2V0IGFzXG5cdFx0XHR8IFByZXNlbnRhdGlvblZhcmlhbnRcblx0XHRcdHwgTGluZUl0ZW07XG5cdFx0aWYgKCFsaW5lSXRlbU9yUHJlc2VudGF0aW9uT2JqZWN0KSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHZpc3VhbGl6YXRpb25zID0gKGNvbnZlcnRlZE1ldGFEYXRhLnJlc29sdmVQYXRoKGxpbmVJdGVtT3JQcmVzZW50YXRpb25Db250ZXh0LmdldFBhdGgoKSkudGFyZ2V0IGFzIFByZXNlbnRhdGlvblZhcmlhbnRUeXBlKVxuXHRcdFx0LlZpc3VhbGl6YXRpb25zO1xuXG5cdFx0Y29uc3QgbGluZUl0ZW1PYmplY3QgPSAoXG5cdFx0XHR2aXN1YWxpemF0aW9uc1xuXHRcdFx0XHQ/IHZpc3VhbGl6YXRpb25zPy5maW5kKChpdGVtKSA9PiBpdGVtLnZhbHVlLmluZGV4T2YoXCJAXCIgKyBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSkgPT09IDApPy4kdGFyZ2V0XG5cdFx0XHRcdDogbGluZUl0ZW1PclByZXNlbnRhdGlvbk9iamVjdFxuXHRcdCkgYXMgTGluZUl0ZW07XG5cdFx0cmV0dXJuIGxpbmVJdGVtT2JqZWN0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSA/IGxpbmVJdGVtT2JqZWN0IDogdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGFuZCByZXR1cm5zIGEgc2VsZWN0IHF1ZXJ5IHdpdGggdGhlIHNlbGVjdGVkIGZpZWxkcyBmcm9tIHRoZSBwYXJhbWV0ZXJzIHRoYXQgd2VyZSBwYXNzZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIGlubmVyIG1vZGVsIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuXHQgKiBAcmV0dXJucyBUaGUgJ3NlbGVjdCcgcXVlcnkgdGhhdCBoYXMgdGhlIHNlbGVjdGVkIGZpZWxkcyBmcm9tIHRoZSBwYXJhbWV0ZXJzIHRoYXQgd2VyZSBwYXNzZWRcblx0ICovXG5cdGNyZWF0ZSRTZWxlY3Q6IGZ1bmN0aW9uICh0YWJsZTogVGFibGVCbG9jaykge1xuXHRcdGNvbnN0IHNlbGVjdGVkRmllbGRzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGNvbnN0IGxpbmVJdGVtQ29udGV4dCA9IFRhYmxlSGVscGVyLmdldFVpTGluZUl0ZW0odGFibGUubWV0YVBhdGgpO1xuXHRcdGZ1bmN0aW9uIHB1c2hGaWVsZChmaWVsZDogc3RyaW5nKSB7XG5cdFx0XHRpZiAoZmllbGQgJiYgIXNlbGVjdGVkRmllbGRzLmluY2x1ZGVzKGZpZWxkKSAmJiBmaWVsZC5pbmRleE9mKFwiL1wiKSAhPT0gMCkge1xuXHRcdFx0XHQvLyBEbyBub3QgYWRkIHNpbmdsZXRvbiBwcm9wZXJ0eSAod2l0aCBhYnNvbHV0ZSBwYXRoKSB0byAkc2VsZWN0XG5cdFx0XHRcdHNlbGVjdGVkRmllbGRzLnB1c2goZmllbGQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHB1c2hGaWVsZExpc3QoZmllbGRzOiBzdHJpbmdbXSkge1xuXHRcdFx0aWYgKGZpZWxkcz8ubGVuZ3RoKSB7XG5cdFx0XHRcdGZpZWxkcy5mb3JFYWNoKHB1c2hGaWVsZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IGNvbHVtbnMgPSB0YWJsZS50YWJsZURlZmluaXRpb24uY29sdW1ucztcblx0XHRjb25zdCBwcm9wZXJ0aWVzRnJvbUN1c3RvbUNvbHVtbnMgPSB0aGlzLmdldFByb3BlcnRpZXNGcm9tQ3VzdG9tQ29sdW1ucyhjb2x1bW5zKTtcblx0XHRpZiAocHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zPy5sZW5ndGgpIHtcblx0XHRcdHB1c2hGaWVsZExpc3QocHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zKTtcblx0XHR9XG5cblx0XHRpZiAobGluZUl0ZW1Db250ZXh0LmdldFBhdGgoKS5pbmRleE9mKGBAJHtVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbX1gKSA+IC0xKSB7XG5cdFx0XHQvLyBEb24ndCBwcm9jZXNzIEVudGl0eVR5cGUgd2l0aG91dCBMaW5lSXRlbVxuXHRcdFx0Y29uc3QgcHJlc2VudGF0aW9uQW5ub3RhdGlvbiA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0YWJsZS5tZXRhUGF0aCkudGFyZ2V0T2JqZWN0O1xuXHRcdFx0Y29uc3Qgb3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyA9ICh0YWJsZS50YWJsZURlZmluaXRpb24ub3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyB8fCBcIlwiKS5zcGxpdChcIixcIik7XG5cdFx0XHRjb25zdCBhcHBsaWNhYmxlUHJvcGVydGllcyA9IFRhYmxlSGVscGVyLl9maWx0ZXJOb25BcHBsaWNhYmxlUHJvcGVydGllcyhvcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzLCB0YWJsZS5jb2xsZWN0aW9uKTtcblx0XHRcdGNvbnN0IHRhcmdldENvbGxlY3Rpb24gPVxuXHRcdFx0XHQodGFibGUuY29sbGVjdGlvbkVudGl0eSBhcyBFbnRpdHlTZXQpLmVudGl0eVR5cGUgfHwgKHRhYmxlLmNvbGxlY3Rpb25FbnRpdHkgYXMgTmF2aWdhdGlvblByb3BlcnR5KS50YXJnZXRUeXBlO1xuXHRcdFx0Y29uc3QgYVNlbWFudGljS2V5czogc3RyaW5nW10gPSAodGFyZ2V0Q29sbGVjdGlvbi5hbm5vdGF0aW9ucy5Db21tb24/LlNlbWFudGljS2V5IHx8IFtdKS5tYXAoXG5cdFx0XHRcdChvU2VtYW50aWNLZXk6IGFueSkgPT4gb1NlbWFudGljS2V5LnZhbHVlIGFzIHN0cmluZ1xuXHRcdFx0KTtcblxuXHRcdFx0aWYgKHByZXNlbnRhdGlvbkFubm90YXRpb24/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5QcmVzZW50YXRpb25WYXJpYW50VHlwZSkge1xuXHRcdFx0XHRwdXNoRmllbGRMaXN0KFRhYmxlSGVscGVyLmdldEZpZWxkc1JlcXVlc3RlZEJ5UHJlc2VudGF0aW9uVmFyaWFudChwcmVzZW50YXRpb25Bbm5vdGF0aW9uKSk7XG5cdFx0XHR9XG5cblx0XHRcdHB1c2hGaWVsZExpc3QoVGFibGVIZWxwZXIuZ2V0TmF2aWdhdGlvbkF2YWlsYWJsZUZpZWxkc0Zyb21MaW5lSXRlbShsaW5lSXRlbUNvbnRleHQpKTtcblx0XHRcdHB1c2hGaWVsZExpc3QoYXBwbGljYWJsZVByb3BlcnRpZXMpO1xuXHRcdFx0cHVzaEZpZWxkTGlzdChhU2VtYW50aWNLZXlzKTtcblx0XHRcdHB1c2hGaWVsZChcblx0XHRcdFx0KFxuXHRcdFx0XHRcdCh0YWJsZS5jb250ZXh0T2JqZWN0UGF0aC50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcz8uRGVsZXRlUmVzdHJpY3Rpb25zXG5cdFx0XHRcdFx0XHQ/LkRlbGV0YWJsZSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248Ym9vbGVhbj5cblx0XHRcdFx0KT8ucGF0aFxuXHRcdFx0KTtcblx0XHRcdHB1c2hGaWVsZChcblx0XHRcdFx0KFxuXHRcdFx0XHRcdCh0YWJsZS5jb250ZXh0T2JqZWN0UGF0aC50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcz8uVXBkYXRlUmVzdHJpY3Rpb25zXG5cdFx0XHRcdFx0XHQ/LlVwZGF0YWJsZSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248Ym9vbGVhbj5cblx0XHRcdFx0KT8ucGF0aFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIHNlbGVjdGVkRmllbGRzLmpvaW4oXCIsXCIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGNvbHVtbidzIHdpZHRoIGlmIGRlZmluZWQgZnJvbSBtYW5pZmVzdCBvciBmcm9tIGN1c3RvbWl6YXRpb24gdmlhIGFubm90YXRpb25zLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0Q29sdW1uV2lkdGhcblx0ICogQHBhcmFtIG9UaGlzIFRoZSBpbnN0YW5jZSBvZiB0aGUgaW5uZXIgbW9kZWwgb2YgdGhlIFRhYmxlIGJ1aWxkaW5nIGJsb2NrXG5cdCAqIEBwYXJhbSBjb2x1bW4gRGVmaW5lZCB3aWR0aCBvZiB0aGUgY29sdW1uLCB3aGljaCBpcyB0YWtlbiB3aXRoIHByaW9yaXR5IGlmIG5vdCBudWxsLCB1bmRlZmluZWQgb3IgZW1wdHlcblx0ICogQHBhcmFtIGRhdGFGaWVsZCBEYXRhRmllbGQgZGVmaW5pdGlvbiBvYmplY3Rcblx0ICogQHBhcmFtIGRhdGFGaWVsZEFjdGlvblRleHQgRGF0YUZpZWxkJ3MgdGV4dCBmcm9tIGJ1dHRvblxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBUaGUgb2JqZWN0IHBhdGggb2YgdGhlIGRhdGEgbW9kZWxcblx0ICogQHBhcmFtIHVzZVJlbVVuaXQgSW5kaWNhdGVzIGlmIHRoZSByZW0gdW5pdCBtdXN0IGJlIGNvbmNhdGVuYXRlZCB3aXRoIHRoZSBjb2x1bW4gd2lkdGggcmVzdWx0XG5cdCAqIEBwYXJhbSBtaWNyb0NoYXJ0VGl0bGUgVGhlIG9iamVjdCBjb250YWluaW5nIHRpdGxlIGFuZCBkZXNjcmlwdGlvbiBvZiB0aGUgTWljcm9DaGFydFxuXHQgKiBAcmV0dXJucyAtIENvbHVtbiB3aWR0aCBpZiBkZWZpbmVkLCBvdGhlcndpc2Ugd2lkdGggaXMgc2V0IHRvIGF1dG9cblx0ICovXG5cdGdldENvbHVtbldpZHRoOiBmdW5jdGlvbiAoXG5cdFx0b1RoaXM6IHRhYmxlRGVsZWdhdGVNb2RlbCxcblx0XHRjb2x1bW46IEFubm90YXRpb25UYWJsZUNvbHVtbixcblx0XHRkYXRhRmllbGQ6IERhdGFGaWVsZCB8IERhdGFGaWVsZEZvckFubm90YXRpb24gfCBEYXRhRmllbGRGb3JBY3Rpb24gfCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdFx0ZGF0YUZpZWxkQWN0aW9uVGV4dDogc3RyaW5nLFxuXHRcdGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0dXNlUmVtVW5pdDogYm9vbGVhbixcblx0XHRtaWNyb0NoYXJ0VGl0bGU/OiBhbnlcblx0KSB7XG5cdFx0aWYgKGNvbHVtbi53aWR0aCkge1xuXHRcdFx0cmV0dXJuIGNvbHVtbi53aWR0aDtcblx0XHR9XG5cdFx0aWYgKG9UaGlzLmVuYWJsZUF1dG9Db2x1bW5XaWR0aCA9PT0gdHJ1ZSkge1xuXHRcdFx0bGV0IHdpZHRoO1xuXHRcdFx0d2lkdGggPVxuXHRcdFx0XHR0aGlzLmdldENvbHVtbldpZHRoRm9ySW1hZ2UoZGF0YU1vZGVsT2JqZWN0UGF0aCkgfHxcblx0XHRcdFx0dGhpcy5nZXRDb2x1bW5XaWR0aEZvckRhdGFGaWVsZChvVGhpcywgY29sdW1uLCBkYXRhRmllbGQsIGRhdGFGaWVsZEFjdGlvblRleHQsIGRhdGFNb2RlbE9iamVjdFBhdGgsIG1pY3JvQ2hhcnRUaXRsZSkgfHxcblx0XHRcdFx0dW5kZWZpbmVkO1xuXHRcdFx0aWYgKHdpZHRoKSB7XG5cdFx0XHRcdHJldHVybiB1c2VSZW1Vbml0ID8gYCR7d2lkdGh9cmVtYCA6IHdpZHRoO1xuXHRcdFx0fVxuXHRcdFx0d2lkdGggPSBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0Zm9ybWF0UmVzdWx0KFxuXHRcdFx0XHRcdFtwYXRoSW5Nb2RlbChcIi9lZGl0TW9kZVwiLCBcInVpXCIpLCBwYXRoSW5Nb2RlbChcInRhYmxlUHJvcGVydGllc0F2YWlsYWJsZVwiLCBcImludGVybmFsXCIpLCBjb2x1bW4ubmFtZSwgdXNlUmVtVW5pdF0sXG5cdFx0XHRcdFx0VGFibGVGb3JtYXR0ZXIuZ2V0Q29sdW1uV2lkdGhcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHRcdHJldHVybiB3aWR0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgd2lkdGggb2YgdGhlIGNvbHVtbiBjb250YWluaW5nIGFuIGltYWdlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0Q29sdW1uV2lkdGhGb3JJbWFnZVxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBUaGUgZGF0YSBtb2RlbCBvYmplY3QgcGF0aFxuXHQgKiBAcmV0dXJucyAtIENvbHVtbiB3aWR0aCBpZiBkZWZpbmVkLCBvdGhlcndpc2UgbnVsbCAodGhlIHdpZHRoIGlzIHRyZWF0ZWQgYXMgYSByZW0gdmFsdWUpXG5cdCAqL1xuXHRnZXRDb2x1bW5XaWR0aEZvckltYWdlOiBmdW5jdGlvbiAoZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IG51bWJlciB8IG51bGwge1xuXHRcdGxldCB3aWR0aDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cdFx0Y29uc3QgYW5ub3RhdGlvbnMgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uVmFsdWU/LiR0YXJnZXQ/LmFubm90YXRpb25zO1xuXHRcdGNvbnN0IGRhdGFUeXBlID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LlZhbHVlPy4kdGFyZ2V0Py50eXBlO1xuXHRcdGlmIChcblx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5WYWx1ZSAmJlxuXHRcdFx0Z2V0RWRpdE1vZGUoXG5cdFx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlZhbHVlPy4kdGFyZ2V0LFxuXHRcdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0XG5cdFx0XHQpID09PSBFZGl0TW9kZS5EaXNwbGF5XG5cdFx0KSB7XG5cdFx0XHRjb25zdCBoYXNUZXh0QW5ub3RhdGlvbiA9IGhhc1RleHQoZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuVmFsdWUuJHRhcmdldCk7XG5cdFx0XHRpZiAoZGF0YVR5cGUgPT09IFwiRWRtLlN0cmVhbVwiICYmICFoYXNUZXh0QW5ub3RhdGlvbiAmJiBhbm5vdGF0aW9ucz8uQ29yZT8uTWVkaWFUeXBlPy5pbmNsdWRlcyhcImltYWdlL1wiKSkge1xuXHRcdFx0XHR3aWR0aCA9IDYuMjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0YW5ub3RhdGlvbnMgJiZcblx0XHRcdChpc0ltYWdlVVJMKGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5WYWx1ZT8uJHRhcmdldCkgfHwgYW5ub3RhdGlvbnM/LkNvcmU/Lk1lZGlhVHlwZT8uaW5jbHVkZXMoXCJpbWFnZS9cIikpXG5cdFx0KSB7XG5cdFx0XHR3aWR0aCA9IDYuMjtcblx0XHR9XG5cdFx0cmV0dXJuIHdpZHRoO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSB3aWR0aCBvZiB0aGUgY29sdW1uIGNvbnRhaW5pbmcgdGhlIERhdGFGaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldENvbHVtbldpZHRoRm9yRGF0YUZpZWxkXG5cdCAqIEBwYXJhbSBvVGhpcyBUaGUgaW5zdGFuY2Ugb2YgdGhlIGlubmVyIG1vZGVsIG9mIHRoZSBUYWJsZSBidWlsZGluZyBibG9ja1xuXHQgKiBAcGFyYW0gY29sdW1uIERlZmluZWQgd2lkdGggb2YgdGhlIGNvbHVtbiwgd2hpY2ggaXMgdGFrZW4gd2l0aCBwcmlvcml0eSBpZiBub3QgbnVsbCwgdW5kZWZpbmVkIG9yIGVtcHR5XG5cdCAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YSBGaWVsZFxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkQWN0aW9uVGV4dCBEYXRhRmllbGQncyB0ZXh0IGZyb20gYnV0dG9uXG5cdCAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoIFRoZSBkYXRhIG1vZGVsIG9iamVjdCBwYXRoXG5cdCAqIEBwYXJhbSBvTWljcm9DaGFydFRpdGxlIFRoZSBvYmplY3QgY29udGFpbmluZyB0aGUgdGl0bGUgYW5kIGRlc2NyaXB0aW9uIG9mIHRoZSBNaWNyb0NoYXJ0XG5cdCAqIEByZXR1cm5zIC0gQ29sdW1uIHdpZHRoIGlmIGRlZmluZWQsIG90aGVyd2lzZSBudWxsICggdGhlIHdpZHRoIGlzIHRyZWF0ZWQgYXMgYSByZW0gdmFsdWUpXG5cdCAqL1xuXHRnZXRDb2x1bW5XaWR0aEZvckRhdGFGaWVsZDogZnVuY3Rpb24gKFxuXHRcdG9UaGlzOiB0YWJsZURlbGVnYXRlTW9kZWwsXG5cdFx0Y29sdW1uOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4sXG5cdFx0ZGF0YUZpZWxkOiBEYXRhRmllbGQgfCBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIHwgRGF0YUZpZWxkRm9yQWN0aW9uIHwgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRcdGRhdGFGaWVsZEFjdGlvblRleHQ6IHN0cmluZyxcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdG9NaWNyb0NoYXJ0VGl0bGU/OiBhbnlcblx0KTogbnVtYmVyIHwgbnVsbCB7XG5cdFx0Y29uc3QgYW5ub3RhdGlvbnMgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM7XG5cdFx0Y29uc3QgZGF0YVR5cGUgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdD8uJFR5cGU7XG5cdFx0bGV0IHdpZHRoOiBudW1iZXIgfCBudWxsID0gbnVsbDtcblx0XHRpZiAoXG5cdFx0XHRkYXRhVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uIHx8XG5cdFx0XHRkYXRhVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIHx8XG5cdFx0XHQoZGF0YVR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiZcblx0XHRcdFx0KChkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0IGFzIGFueSkuJEFubm90YXRpb25QYXRoLmluZGV4T2YoYEAke1VJQW5ub3RhdGlvblRlcm1zLkZpZWxkR3JvdXB9YCkgPT09IC0xKVxuXHRcdCkge1xuXHRcdFx0bGV0IG5UbXBUZXh0V2lkdGg7XG5cdFx0XHRuVG1wVGV4dFdpZHRoID1cblx0XHRcdFx0U2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aChkYXRhRmllbGRBY3Rpb25UZXh0KSB8fFxuXHRcdFx0XHRTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKGRhdGFGaWVsZD8uTGFiZWw/LnRvU3RyaW5nKCkpIHx8XG5cdFx0XHRcdFNpemVIZWxwZXIuZ2V0QnV0dG9uV2lkdGgoYW5ub3RhdGlvbnM/LkxhYmVsKTtcblxuXHRcdFx0Ly8gZ2V0IHdpZHRoIGZvciByYXRpbmcgb3IgcHJvZ3Jlc3MgYmFyIGRhdGFmaWVsZFxuXHRcdFx0Y29uc3QgblRtcFZpc3VhbGl6YXRpb25XaWR0aCA9IFRhYmxlU2l6ZUhlbHBlci5nZXRXaWR0aEZvckRhdGFGaWVsZEZvckFubm90YXRpb24oXG5cdFx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0XG5cdFx0XHQpLnByb3BlcnR5V2lkdGg7XG5cblx0XHRcdGlmIChuVG1wVmlzdWFsaXphdGlvbldpZHRoID4gblRtcFRleHRXaWR0aCkge1xuXHRcdFx0XHR3aWR0aCA9IG5UbXBWaXN1YWxpemF0aW9uV2lkdGg7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRkYXRhRmllbGRBY3Rpb25UZXh0IHx8XG5cdFx0XHRcdChhbm5vdGF0aW9ucyAmJlxuXHRcdFx0XHRcdChhbm5vdGF0aW9ucy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIHx8XG5cdFx0XHRcdFx0XHRhbm5vdGF0aW9ucy4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uKSlcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBBZGQgYWRkaXRpb25hbCAxLjggcmVtIHRvIGF2b2lkIHNob3dpbmcgZWxsaXBzaXMgaW4gc29tZSBjYXNlcy5cblx0XHRcdFx0blRtcFRleHRXaWR0aCArPSAxLjg7XG5cdFx0XHRcdHdpZHRoID0gblRtcFRleHRXaWR0aDtcblx0XHRcdH1cblx0XHRcdHdpZHRoID0gd2lkdGggfHwgdGhpcy5nZXRDb2x1bW5XaWR0aEZvckNoYXJ0KG9UaGlzLCBjb2x1bW4sIGRhdGFGaWVsZCwgblRtcFRleHRXaWR0aCwgb01pY3JvQ2hhcnRUaXRsZSk7XG5cdFx0fVxuXHRcdHJldHVybiB3aWR0aDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgd2lkdGggb2YgdGhlIGNvbHVtbiBjb250YWluaW5nIHRoZSBDaGFydC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldENvbHVtbldpZHRoRm9yQ2hhcnRcblx0ICogQHBhcmFtIG9UaGlzIFRoZSBpbnN0YW5jZSBvZiB0aGUgaW5uZXIgbW9kZWwgb2YgdGhlIFRhYmxlIGJ1aWxkaW5nIGJsb2NrXG5cdCAqIEBwYXJhbSBjb2x1bW4gRGVmaW5lZCB3aWR0aCBvZiB0aGUgY29sdW1uLCB3aGljaCBpcyB0YWtlbiB3aXRoIHByaW9yaXR5IGlmIG5vdCBudWxsLCB1bmRlZmluZWQgb3IgZW1wdHlcblx0ICogQHBhcmFtIGRhdGFGaWVsZCBEYXRhIEZpZWxkXG5cdCAqIEBwYXJhbSBjb2x1bW5MYWJlbFdpZHRoIFRoZSB3aWR0aCBvZiB0aGUgY29sdW1uIGxhYmVsIG9yIGJ1dHRvbiBsYWJlbFxuXHQgKiBAcGFyYW0gbWljcm9DaGFydFRpdGxlIFRoZSBvYmplY3QgY29udGFpbmluZyB0aGUgdGl0bGUgYW5kIHRoZSBkZXNjcmlwdGlvbiBvZiB0aGUgTWljcm9DaGFydFxuXHQgKiBAcmV0dXJucyAtIENvbHVtbiB3aWR0aCBpZiBkZWZpbmVkLCBvdGhlcndpc2UgbnVsbCAodGhlIHdpZHRoIGlzIHRyZWF0ZWQgYXMgYSByZW0gdmFsdWUpXG5cdCAqL1xuXHRnZXRDb2x1bW5XaWR0aEZvckNoYXJ0KG9UaGlzOiBhbnksIGNvbHVtbjogYW55LCBkYXRhRmllbGQ6IGFueSwgY29sdW1uTGFiZWxXaWR0aDogbnVtYmVyLCBtaWNyb0NoYXJ0VGl0bGU6IGFueSk6IG51bWJlciB8IG51bGwge1xuXHRcdGxldCBjaGFydFNpemUsXG5cdFx0XHR3aWR0aDogbnVtYmVyIHwgbnVsbCA9IG51bGw7XG5cdFx0aWYgKGRhdGFGaWVsZC5UYXJnZXQ/LiRBbm5vdGF0aW9uUGF0aD8uaW5kZXhPZihgQCR7VUlBbm5vdGF0aW9uVGVybXMuQ2hhcnR9YCkgIT09IC0xKSB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMuZ2V0Q2hhcnRTaXplKG9UaGlzLCBjb2x1bW4pKSB7XG5cdFx0XHRcdGNhc2UgXCJYU1wiOlxuXHRcdFx0XHRcdGNoYXJ0U2l6ZSA9IDQuNDtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIlNcIjpcblx0XHRcdFx0XHRjaGFydFNpemUgPSA0LjY7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJNXCI6XG5cdFx0XHRcdFx0Y2hhcnRTaXplID0gNS41O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiTFwiOlxuXHRcdFx0XHRcdGNoYXJ0U2l6ZSA9IDYuOTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRjaGFydFNpemUgPSA1LjM7XG5cdFx0XHR9XG5cdFx0XHRjb2x1bW5MYWJlbFdpZHRoICs9IDEuODtcblx0XHRcdGlmIChcblx0XHRcdFx0IXRoaXMuZ2V0U2hvd09ubHlDaGFydChvVGhpcywgY29sdW1uKSAmJlxuXHRcdFx0XHRtaWNyb0NoYXJ0VGl0bGUgJiZcblx0XHRcdFx0KG1pY3JvQ2hhcnRUaXRsZS5UaXRsZS5sZW5ndGggfHwgbWljcm9DaGFydFRpdGxlLkRlc2NyaXB0aW9uLmxlbmd0aClcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCB0bXBUZXh0ID1cblx0XHRcdFx0XHRtaWNyb0NoYXJ0VGl0bGUuVGl0bGUubGVuZ3RoID4gbWljcm9DaGFydFRpdGxlLkRlc2NyaXB0aW9uLmxlbmd0aCA/IG1pY3JvQ2hhcnRUaXRsZS5UaXRsZSA6IG1pY3JvQ2hhcnRUaXRsZS5EZXNjcmlwdGlvbjtcblx0XHRcdFx0Y29uc3QgdGl0bGVTaXplID0gU2l6ZUhlbHBlci5nZXRCdXR0b25XaWR0aCh0bXBUZXh0KSArIDc7XG5cdFx0XHRcdGNvbnN0IHRtcFdpZHRoID0gdGl0bGVTaXplID4gY29sdW1uTGFiZWxXaWR0aCA/IHRpdGxlU2l6ZSA6IGNvbHVtbkxhYmVsV2lkdGg7XG5cdFx0XHRcdHdpZHRoID0gdG1wV2lkdGg7XG5cdFx0XHR9IGVsc2UgaWYgKGNvbHVtbkxhYmVsV2lkdGggPiBjaGFydFNpemUpIHtcblx0XHRcdFx0d2lkdGggPSBjb2x1bW5MYWJlbFdpZHRoO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0d2lkdGggPSBjaGFydFNpemU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB3aWR0aDtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBhZGQgYSBtYXJnaW4gY2xhc3MgYXQgdGhlIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRNYXJnaW5DbGFzc1xuXHQgKiBAcGFyYW0gb0NvbGxlY3Rpb24gVGl0bGUgb2YgdGhlIERhdGFQb2ludFxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBWYWx1ZSBvZiB0aGUgRGF0YVBvaW50XG5cdCAqIEBwYXJhbSBzVmlzdWFsaXphdGlvblxuXHQgKiBAcGFyYW0gc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyBIaWRkZW4gZXhwcmVzc2lvbiBjb250YWluZWQgaW4gRmllbGRHcm91cFxuXHQgKiBAcmV0dXJucyBBZGp1c3RpbmcgdGhlIG1hcmdpblxuXHQgKi9cblx0Z2V0TWFyZ2luQ2xhc3M6IGZ1bmN0aW9uIChvQ29sbGVjdGlvbjogYW55LCBvRGF0YUZpZWxkOiBhbnksIHNWaXN1YWxpemF0aW9uOiBhbnksIHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM6IGFueSkge1xuXHRcdGxldCBzQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0XHRzQ2xhc3MgPSBcIlwiO1xuXHRcdGlmIChKU09OLnN0cmluZ2lmeShvQ29sbGVjdGlvbltvQ29sbGVjdGlvbi5sZW5ndGggLSAxXSkgPT0gSlNPTi5zdHJpbmdpZnkob0RhdGFGaWVsZCkpIHtcblx0XHRcdC8vSWYgcmF0aW5nIGluZGljYXRvciBpcyBsYXN0IGVsZW1lbnQgaW4gZmllbGRncm91cCwgdGhlbiB0aGUgMC41cmVtIG1hcmdpbiBhZGRlZCBieSBzYXBNUkkgY2xhc3Mgb2YgaW50ZXJhY3RpdmUgcmF0aW5nIGluZGljYXRvciBvbiB0b3AgYW5kIGJvdHRvbSBtdXN0IGJlIG51bGxpZmllZC5cblx0XHRcdGlmIChzVmlzdWFsaXphdGlvbiA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKSB7XG5cdFx0XHRcdHNDbGFzcyA9IFwic2FwVWlOb01hcmdpbkJvdHRvbSBzYXBVaU5vTWFyZ2luVG9wXCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChzVmlzdWFsaXphdGlvbiA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIikge1xuXHRcdFx0Ly9JZiByYXRpbmcgaW5kaWNhdG9yIGlzIE5PVCB0aGUgbGFzdCBlbGVtZW50IGluIGZpZWxkZ3JvdXAsIHRoZW4gdG8gbWFpbnRhaW4gdGhlIDAuNXJlbSBzcGFjaW5nIGJldHdlZW4gY29nZXRNYXJnaW5DbGFzc250cm9scyAoYXMgcGVyIFVYIHNwZWMpLFxuXHRcdFx0Ly9vbmx5IHRoZSB0b3AgbWFyZ2luIGFkZGVkIGJ5IHNhcE1SSSBjbGFzcyBvZiBpbnRlcmFjdGl2ZSByYXRpbmcgaW5kaWNhdG9yIG11c3QgYmUgbnVsbGlmaWVkLlxuXG5cdFx0XHRzQ2xhc3MgPSBcInNhcFVpTm9NYXJnaW5Ub3BcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0NsYXNzID0gXCJzYXBVaVRpbnlNYXJnaW5Cb3R0b21cIjtcblx0XHR9XG5cblx0XHRpZiAoc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyAmJiBzRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zICE9PSBcInRydWVcIiAmJiBzRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zICE9PSBcImZhbHNlXCIpIHtcblx0XHRcdGNvbnN0IHNIaWRkZW5FeHByZXNzaW9uUmVzdWx0ID0gc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucy5zdWJzdHJpbmcoXG5cdFx0XHRcdHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMuaW5kZXhPZihcIns9XCIpICsgMixcblx0XHRcdFx0c0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucy5sYXN0SW5kZXhPZihcIn1cIilcblx0XHRcdCk7XG5cdFx0XHRzQmluZGluZ0V4cHJlc3Npb24gPSBcIns9IFwiICsgc0hpZGRlbkV4cHJlc3Npb25SZXN1bHQgKyBcIiA/ICdcIiArIHNDbGFzcyArIFwiJyA6IFwiICsgXCInJ1wiICsgXCIgfVwiO1xuXHRcdFx0cmV0dXJuIHNCaW5kaW5nRXhwcmVzc2lvbjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHNDbGFzcztcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgVkJveCB2aXNpYmlsaXR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gY29sbGVjdGlvbiBDb2xsZWN0aW9uIG9mIGRhdGEgZmllbGRzIGluIFZCb3hcblx0ICogQHBhcmFtIGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyBIaWRkZW4gZXhwcmVzc2lvbiBjb250YWluZWQgaW4gRmllbGRHcm91cFxuXHQgKiBAcGFyYW0gZmllbGRHcm91cCBEYXRhIGZpZWxkIGNvbnRhaW5pbmcgdGhlIFZCb3hcblx0ICogQHJldHVybnMgVmlzaWJpbGl0eSBleHByZXNzaW9uXG5cdCAqL1xuXHRnZXRWQm94VmlzaWJpbGl0eTogZnVuY3Rpb24gKFxuXHRcdGNvbGxlY3Rpb246IEFycmF5PERhdGFGaWVsZEZvckFubm90YXRpb24gJiBIaWRkZW4+LFxuXHRcdGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9uczogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdFx0ZmllbGRHcm91cDogRmllbGRHcm91cCAmIEhpZGRlblxuXHQpOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdFx0bGV0IGFsbFN0YXRpYyA9IHRydWU7XG5cdFx0Y29uc3QgaGlkZGVuUGF0aHMgPSBbXTtcblxuXHRcdGlmIChmaWVsZEdyb3VwW2BAJHtVSUFubm90YXRpb25UZXJtcy5IaWRkZW59YF0pIHtcblx0XHRcdHJldHVybiBmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM7XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBkYXRhRmllbGQgb2YgY29sbGVjdGlvbikge1xuXHRcdFx0Y29uc3QgaGlkZGVuQW5ub3RhdGlvblZhbHVlID0gZGF0YUZpZWxkW2BAJHtVSUFubm90YXRpb25UZXJtcy5IaWRkZW59YF07XG5cdFx0XHRpZiAoaGlkZGVuQW5ub3RhdGlvblZhbHVlID09PSB1bmRlZmluZWQgfHwgaGlkZGVuQW5ub3RhdGlvblZhbHVlID09PSBmYWxzZSkge1xuXHRcdFx0XHRoaWRkZW5QYXRocy5wdXNoKGZhbHNlKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaGlkZGVuQW5ub3RhdGlvblZhbHVlID09PSB0cnVlKSB7XG5cdFx0XHRcdGhpZGRlblBhdGhzLnB1c2godHJ1ZSk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGhpZGRlbkFubm90YXRpb25WYWx1ZS4kUGF0aCkge1xuXHRcdFx0XHRoaWRkZW5QYXRocy5wdXNoKHBhdGhJbk1vZGVsKGhpZGRlbkFubm90YXRpb25WYWx1ZS4kUGF0aCkpO1xuXHRcdFx0XHRhbGxTdGF0aWMgPSBmYWxzZTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIGhpZGRlbkFubm90YXRpb25WYWx1ZSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHQvLyBEeW5hbWljIGV4cHJlc3Npb24gZm91bmQgaW4gYSBmaWVsZFxuXHRcdFx0XHRyZXR1cm4gZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IGhhc0FueVBhdGhFeHByZXNzaW9ucyA9IGNvbnN0YW50KGhpZGRlblBhdGhzLmxlbmd0aCA+IDAgJiYgYWxsU3RhdGljICE9PSB0cnVlKTtcblx0XHRjb25zdCBoYXNBbGxIaWRkZW5TdGF0aWNFeHByZXNzaW9ucyA9IGNvbnN0YW50KGhpZGRlblBhdGhzLmxlbmd0aCA+IDAgJiYgaGlkZGVuUGF0aHMuaW5kZXhPZihmYWxzZSkgPT09IC0xICYmIGFsbFN0YXRpYyk7XG5cblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRpZkVsc2UoXG5cdFx0XHRcdGhhc0FueVBhdGhFeHByZXNzaW9ucyxcblx0XHRcdFx0Zm9ybWF0UmVzdWx0KGhpZGRlblBhdGhzLCBUYWJsZUZvcm1hdHRlci5nZXRWQm94VmlzaWJpbGl0eSksXG5cdFx0XHRcdGlmRWxzZShoYXNBbGxIaWRkZW5TdGF0aWNFeHByZXNzaW9ucywgY29uc3RhbnQoZmFsc2UpLCBjb25zdGFudCh0cnVlKSlcblx0XHRcdClcblx0XHQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gcHJvdmlkZSBoaWRkZW4gZmlsdGVycyB0byB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBmb3JtYXRIaWRkZW5GaWx0ZXJzXG5cdCAqIEBwYXJhbSBvSGlkZGVuRmlsdGVyIFRoZSBoaWRkZW5GaWx0ZXJzIHZpYSBjb250ZXh0IG5hbWVkIGZpbHRlcnMgKGFuZCBrZXkgaGlkZGVuRmlsdGVycykgcGFzc2VkIHRvIE1hY3JvIFRhYmxlXG5cdCAqIEByZXR1cm5zIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGhpZGRlbiBmaWx0ZXJzXG5cdCAqL1xuXHRmb3JtYXRIaWRkZW5GaWx0ZXJzOiBmdW5jdGlvbiAob0hpZGRlbkZpbHRlcjogVGFibGVGaWx0ZXJzQ29uZmlndXJhdGlvbiB8IHVuZGVmaW5lZCkge1xuXHRcdGlmIChvSGlkZGVuRmlsdGVyKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob0hpZGRlbkZpbHRlcik7XG5cdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBzdGFibGUgSUQgb2YgYSB0YWJsZSBlbGVtZW50IChjb2x1bW4gb3IgRmllbGRHcm91cCBsYWJlbCkuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRFbGVtZW50U3RhYmxlSWRcblx0ICogQHBhcmFtIHRhYmxlSWQgQ3VycmVudCBvYmplY3QgSURcblx0ICogQHBhcmFtIGVsZW1lbnRJZCBFbGVtZW50IElkIG9yIHN1ZmZpeFxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBEYXRhTW9kZWxPYmplY3RQYXRoIG9mIHRoZSBkYXRhRmllbGRcblx0ICogQHJldHVybnMgVGhlIHN0YWJsZSBJRCBmb3IgYSBnaXZlbiBjb2x1bW5cblx0ICovXG5cdGdldEVsZW1lbnRTdGFibGVJZDogZnVuY3Rpb24gKHRhYmxlSWQ6IHN0cmluZyB8IHVuZGVmaW5lZCwgZWxlbWVudElkOiBzdHJpbmcsIGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRpZiAoIXRhYmxlSWQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGNvbnN0IGRhdGFGaWVsZCA9IGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0IGFzIERhdGFGaWVsZEFic3RyYWN0VHlwZXM7XG5cdFx0bGV0IGRhdGFGaWVsZFBhcnQ6IHN0cmluZyB8IERhdGFGaWVsZEFic3RyYWN0VHlwZXM7XG5cdFx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRcdFx0ZGF0YUZpZWxkUGFydCA9IGRhdGFGaWVsZC5UYXJnZXQudmFsdWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRcdFx0ZGF0YUZpZWxkUGFydCA9IGRhdGFGaWVsZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRkYXRhRmllbGRQYXJ0ID0gKGRhdGFGaWVsZCBhcyBEYXRhRmllbGQpLlZhbHVlPy5wYXRoID8/IFwiXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gZ2VuZXJhdGUoW3RhYmxlSWQsIGVsZW1lbnRJZCwgZGF0YUZpZWxkUGFydF0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBzdGFibGUgSUQgb2YgdGhlIGNvbHVtbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldENvbHVtblN0YWJsZUlkXG5cdCAqIEBwYXJhbSBpZCBDdXJyZW50IG9iamVjdCBJRFxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aCBEYXRhTW9kZWxPYmplY3RQYXRoIG9mIHRoZSBkYXRhRmllbGRcblx0ICogQHJldHVybnMgVGhlIHN0YWJsZSBJRCBmb3IgYSBnaXZlbiBjb2x1bW5cblx0ICovXG5cdGdldENvbHVtblN0YWJsZUlkOiBmdW5jdGlvbiAoaWQ6IHN0cmluZywgZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRcdHJldHVybiBUYWJsZUhlbHBlci5nZXRFbGVtZW50U3RhYmxlSWQoaWQsIFwiQ1wiLCBkYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0fSxcblxuXHRnZXRGaWVsZEdyb3VwTGFiZWxTdGFibGVJZDogZnVuY3Rpb24gKGlkOiBzdHJpbmcsIGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRyZXR1cm4gVGFibGVIZWxwZXIuZ2V0RWxlbWVudFN0YWJsZUlkKGlkLCBcIkZHTGFiZWxcIiwgZGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCBmaWx0ZXJzIG91dCBwcm9wZXJ0aWVzIHdoaWNoIGRvIG5vdCBiZWxvbmcgdG8gdGhlIGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0aWVzIFRoZSBhcnJheSBvZiBwcm9wZXJ0aWVzIHRvIGJlIGNoZWNrZWQuXG5cdCAqIEBwYXJhbSBjb2xsZWN0aW9uQ29udGV4dCBUaGUgY29sbGVjdGlvbiBjb250ZXh0IHRvIGJlIHVzZWQuXG5cdCAqIEByZXR1cm5zIFRoZSBhcnJheSBvZiBhcHBsaWNhYmxlIHByb3BlcnRpZXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZmlsdGVyTm9uQXBwbGljYWJsZVByb3BlcnRpZXM6IGZ1bmN0aW9uIChwcm9wZXJ0aWVzOiBzdHJpbmdbXSwgY29sbGVjdGlvbkNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0cHJvcGVydGllcyAmJlxuXHRcdFx0cHJvcGVydGllcy5maWx0ZXIoZnVuY3Rpb24gKHNQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gY29sbGVjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KGAuLyR7c1Byb3BlcnR5UGF0aH1gKTtcblx0XHRcdH0pXG5cdFx0KTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHJldHJlaXZlIHRoZSBsaXN0ZWQgcHJvcGVydGllcyBmcm9tIHRoZSBjdXN0b20gY29sdW1uc1xuXHQgKlxuXHQgKiBAcGFyYW0gY29sdW1ucyBUaGUgdGFibGUgY29sdW1uc1xuXHQgKiBAcmV0dXJucyBUaGUgbGlzdCBvZiBhdmFpbGFibGUgcHJvcGVydGllcyBmcm9tIHRoZSBjdXN0b20gY29sdW1uc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblxuXHRnZXRQcm9wZXJ0aWVzRnJvbUN1c3RvbUNvbHVtbnM6IGZ1bmN0aW9uIChjb2x1bW5zOiBUYWJsZUNvbHVtbltdKSB7XG5cdFx0Ly8gQWRkIHByb3BlcnRpZXMgZnJvbSB0aGUgY3VzdG9tIGNvbHVtbnMsIHRoaXMgaXMgcmVxdWlyZWQgZm9yIHRoZSBleHBvcnQgb2YgYWxsIHRoZSBwcm9wZXJ0aWVzIGxpc3RlZCBvbiBhIGN1c3RvbSBjb2x1bW5cblx0XHRpZiAoIWNvbHVtbnM/Lmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBwcm9wZXJ0aWVzRnJvbUN1c3RvbUNvbHVtbnM6IHN0cmluZ1tdID0gW107XG5cdFx0Zm9yIChjb25zdCBjb2x1bW4gb2YgY29sdW1ucykge1xuXHRcdFx0aWYgKFwicHJvcGVydGllc1wiIGluIGNvbHVtbiAmJiBjb2x1bW4ucHJvcGVydGllcz8ubGVuZ3RoKSB7XG5cdFx0XHRcdGZvciAoY29uc3QgcHJvcGVydHkgb2YgY29sdW1uLnByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHRpZiAocHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zLmluZGV4T2YocHJvcGVydHkpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0Ly8gb25seSBhZGQgcHJvcGVydHkgaWYgaXQgZG9lc24ndCBleGlzdFxuXHRcdFx0XHRcdFx0cHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zLnB1c2gocHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcHJvcGVydGllc0Zyb21DdXN0b21Db2x1bW5zO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdlbmVyYXRlIHRoZSBiaW5kaW5nIGluZm9ybWF0aW9uIGZvciBhIHRhYmxlIHJvdy5cblx0ICpcblx0ICogQHBhcmFtIHRhYmxlIFRoZSBpbnN0YW5jZSBvZiB0aGUgaW5uZXIgbW9kZWwgb2YgdGhlIHRhYmxlIGJ1aWxkaW5nIGJsb2NrXG5cdCAqIEByZXR1cm5zIC0gUmV0dXJucyB0aGUgYmluZGluZyBpbmZvcm1hdGlvbiBvZiBhIHRhYmxlIHJvd1xuXHQgKi9cblx0Z2V0Um93c0JpbmRpbmdJbmZvOiBmdW5jdGlvbiAodGFibGU6IFRhYmxlQmxvY2spIHtcblx0XHRjb25zdCBkYXRhTW9kZWxQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRhYmxlLmNvbGxlY3Rpb24sIHRhYmxlLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBwYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChkYXRhTW9kZWxQYXRoKSB8fCBnZXRUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbFBhdGgpO1xuXHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0ge1xuXHRcdFx0dWk1b2JqZWN0OiB0cnVlLFxuXHRcdFx0c3VzcGVuZGVkOiBmYWxzZSxcblx0XHRcdHBhdGg6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMocGF0aCksXG5cdFx0XHRwYXJhbWV0ZXJzOiB7XG5cdFx0XHRcdCRjb3VudDogdHJ1ZVxuXHRcdFx0fSBhcyBhbnksXG5cdFx0XHRldmVudHM6IHt9IGFzIGFueVxuXHRcdH07XG5cblx0XHRpZiAodGFibGUudGFibGVEZWZpbml0aW9uLmVuYWJsZSRzZWxlY3QpIHtcblx0XHRcdC8vIERvbid0IGFkZCAkc2VsZWN0IHBhcmFtZXRlciBpbiBjYXNlIG9mIGFuIGFuYWx5dGljYWwgcXVlcnksIHRoaXMgaXNuJ3Qgc3VwcG9ydGVkIGJ5IHRoZSBtb2RlbFxuXHRcdFx0Y29uc3Qgc1NlbGVjdCA9IFRhYmxlSGVscGVyLmNyZWF0ZSRTZWxlY3QodGFibGUpO1xuXHRcdFx0aWYgKHNTZWxlY3QpIHtcblx0XHRcdFx0b1Jvd0JpbmRpbmcucGFyYW1ldGVycy4kc2VsZWN0ID0gYCcke3NTZWxlY3R9J2A7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHRhYmxlLnRhYmxlRGVmaW5pdGlvbi5lbmFibGUkJGdldEtlZXBBbGl2ZUNvbnRleHQpIHtcblx0XHRcdC8vIHdlIGxhdGVyIGVuc3VyZSBpbiB0aGUgZGVsZWdhdGUgb25seSBvbmUgbGlzdCBiaW5kaW5nIGZvciBhIGdpdmVuIHRhcmdldENvbGxlY3Rpb25QYXRoIGhhcyB0aGUgZmxhZyAkJGdldEtlZXBBbGl2ZUNvbnRleHRcblx0XHRcdG9Sb3dCaW5kaW5nLnBhcmFtZXRlcnMuJCRnZXRLZWVwQWxpdmVDb250ZXh0ID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRvUm93QmluZGluZy5wYXJhbWV0ZXJzLiQkZ3JvdXBJZCA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCIkYXV0by5Xb3JrZXJzXCIpO1xuXHRcdG9Sb3dCaW5kaW5nLnBhcmFtZXRlcnMuJCR1cGRhdGVHcm91cElkID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIiRhdXRvXCIpO1xuXHRcdG9Sb3dCaW5kaW5nLnBhcmFtZXRlcnMuJCRvd25SZXF1ZXN0ID0gdHJ1ZTtcblx0XHRvUm93QmluZGluZy5wYXJhbWV0ZXJzLiQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHMgPSB0cnVlO1xuXG5cdFx0b1Jvd0JpbmRpbmcuZXZlbnRzLnBhdGNoU2VudCA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCIuZWRpdEZsb3cuaGFuZGxlUGF0Y2hTZW50XCIpO1xuXHRcdG9Sb3dCaW5kaW5nLmV2ZW50cy5wYXRjaENvbXBsZXRlZCA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCJBUEkub25JbnRlcm5hbFBhdGNoQ29tcGxldGVkXCIpO1xuXHRcdG9Sb3dCaW5kaW5nLmV2ZW50cy5kYXRhUmVjZWl2ZWQgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiQVBJLm9uSW50ZXJuYWxEYXRhUmVjZWl2ZWRcIik7XG5cdFx0b1Jvd0JpbmRpbmcuZXZlbnRzLmRhdGFSZXF1ZXN0ZWQgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiQVBJLm9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIpO1xuXHRcdG9Sb3dCaW5kaW5nLmV2ZW50cy5jaGFuZ2UgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiQVBJLm9uQ29udGV4dENoYW5nZVwiKTtcblx0XHQvLyByZWNyZWF0ZSBhbiBlbXB0eSByb3cgd2hlbiBvbmUgaXMgYWN0aXZhdGVkXG5cdFx0b1Jvd0JpbmRpbmcuZXZlbnRzLmNyZWF0ZUFjdGl2YXRlID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIi5lZGl0Rmxvdy5oYW5kbGVDcmVhdGVBY3RpdmF0ZVwiKTtcblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9Sb3dCaW5kaW5nKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBjaGVjayB0aGUgdmFsaWRpdHkgb2YgdGhlIGZpZWxkcyBpbiB0aGUgY3JlYXRpb24gcm93LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgdmFsaWRhdGVDcmVhdGlvblJvd0ZpZWxkc1xuXHQgKiBAcGFyYW0gb0ZpZWxkVmFsaWRpdHlPYmplY3QgQ3VycmVudCBPYmplY3QgaG9sZGluZyB0aGUgZmllbGRzXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiBhbGwgdGhlIGZpZWxkcyBpbiB0aGUgY3JlYXRpb24gcm93IGFyZSB2YWxpZCwgYGZhbHNlYCBvdGhlcndpc2Vcblx0ICovXG5cdHZhbGlkYXRlQ3JlYXRpb25Sb3dGaWVsZHM6IGZ1bmN0aW9uIChvRmllbGRWYWxpZGl0eU9iamVjdDogYW55KSB7XG5cdFx0aWYgKCFvRmllbGRWYWxpZGl0eU9iamVjdCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdFx0T2JqZWN0LmtleXMob0ZpZWxkVmFsaWRpdHlPYmplY3QpLmxlbmd0aCA+IDAgJiZcblx0XHRcdE9iamVjdC5rZXlzKG9GaWVsZFZhbGlkaXR5T2JqZWN0KS5ldmVyeShmdW5jdGlvbiAoa2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIG9GaWVsZFZhbGlkaXR5T2JqZWN0W2tleV1bXCJ2YWxpZGl0eVwiXTtcblx0XHRcdH0pXG5cdFx0KTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIGV4cHJlc3Npb24gZm9yIHRoZSAncHJlc3MnIGV2ZW50IGZvciB0aGUgRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvblxuXHQgKiBAcGFyYW0gdGFibGVQcm9wZXJ0aWVzIFRoZSBwcm9wZXJ0aWVzIG9mIHRoZSB0YWJsZSBjb250cm9sXG5cdCAqIEBwYXJhbSB0YWJsZVByb3BlcnRpZXMuY29udGV4dE9iamVjdFBhdGggVGhlIGRhdGFtb2RlbCBvYmplY3QgcGF0aCBmb3IgdGhlIHRhYmxlXG5cdCAqIEBwYXJhbSB0YWJsZVByb3BlcnRpZXMuaWQgVGhlIGlkIG9mIHRoZSB0YWJsZSBjb250cm9sXG5cdCAqIEBwYXJhbSBkYXRhRmllbGQgVmFsdWUgb2YgdGhlIERhdGFQb2ludFxuXHQgKiBAcGFyYW0gZW50aXR5U2V0TmFtZSBOYW1lIG9mIHRoZSBFbnRpdHlTZXRcblx0ICogQHBhcmFtIG9wZXJhdGlvbkF2YWlsYWJsZU1hcCBPcGVyYXRpb25BdmFpbGFibGVNYXAgYXMgc3RyaW5naWZpZWQgSlNPTiBvYmplY3Rcblx0ICogQHBhcmFtIGFjdGlvbkNvbnRleHQgVGhlIGluc3RhbmNlIG9yIHRoZSBwYXRoIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGlzTmF2aWdhYmxlIEFjdGlvbiBlaXRoZXIgdHJpZ2dlcnMgbmF2aWdhdGlvbiBvciBub3Rcblx0ICogQHBhcmFtIGVuYWJsZUF1dG9TY3JvbGwgQWN0aW9uIGVpdGhlciB0cmlnZ2VycyBzY3JvbGxpbmcgdG8gdGhlIG5ld2x5IGNyZWF0ZWQgaXRlbXMgaW4gdGhlIHJlbGF0ZWQgdGFibGUgb3Igbm90XG5cdCAqIEBwYXJhbSBkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24gRnVuY3Rpb24gbmFtZSB0byBwcmVmaWxsIGRpYWxvZyBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb25cblx0ICovXG5cdHByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b246IGZ1bmN0aW9uIChcblx0XHR0YWJsZVByb3BlcnRpZXM6IHtcblx0XHRcdGNvbnRleHRPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoO1xuXHRcdFx0aWQ6IHN0cmluZztcblx0XHR9LFxuXHRcdGRhdGFGaWVsZDogRGF0YUZpZWxkRm9yQWN0aW9uIHwgdW5kZWZpbmVkLFxuXHRcdGVudGl0eVNldE5hbWU6IHN0cmluZyxcblx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IHN0cmluZyxcblx0XHRhY3Rpb25PYmplY3Q/OiBNZXRhTW9kZWxBY3Rpb24gfCBNZXRhTW9kZWxBY3Rpb25bXSB8IHN0cmluZyxcblx0XHRpc05hdmlnYWJsZSA9IGZhbHNlLFxuXHRcdGVuYWJsZUF1dG9TY3JvbGw/OiBib29sZWFuLFxuXHRcdGRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbj86IHN0cmluZ1xuXHQpIHtcblx0XHRpZiAoIWRhdGFGaWVsZCkgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRjb25zdCBzQWN0aW9uTmFtZSA9IGRhdGFGaWVsZC5BY3Rpb24sXG5cdFx0XHR0YXJnZXRFbnRpdHlUeXBlTmFtZSA9IHRhYmxlUHJvcGVydGllcy5jb250ZXh0T2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdHN0YXRpY0FjdGlvbiA9XG5cdFx0XHRcdHR5cGVvZiBhY3Rpb25PYmplY3QgIT09IFwic3RyaW5nXCIgJiZcblx0XHRcdFx0KHRoaXMuX2lzU3RhdGljQWN0aW9uKGFjdGlvbk9iamVjdCwgc0FjdGlvbk5hbWUpIHx8XG5cdFx0XHRcdFx0dGhpcy5faXNBY3Rpb25PdmVybG9hZE9uRGlmZmVyZW50VHlwZShzQWN0aW9uTmFtZSwgdGFyZ2V0RW50aXR5VHlwZU5hbWUpKSxcblx0XHRcdHBhcmFtczogYW55ID0ge1xuXHRcdFx0XHRjb250ZXh0czogIXN0YXRpY0FjdGlvbiA/IHBhdGhJbk1vZGVsKFwic2VsZWN0ZWRDb250ZXh0c1wiLCBcImludGVybmFsXCIpIDogbnVsbCxcblx0XHRcdFx0YlN0YXRpY0FjdGlvbjogc3RhdGljQWN0aW9uID8gc3RhdGljQWN0aW9uIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRlbnRpdHlTZXROYW1lOiBlbnRpdHlTZXROYW1lLFxuXHRcdFx0XHRhcHBsaWNhYmxlQ29udGV4dHM6ICFzdGF0aWNBY3Rpb24gPyBwYXRoSW5Nb2RlbChgZHluYW1pY0FjdGlvbnMvJHtkYXRhRmllbGQuQWN0aW9ufS9hQXBwbGljYWJsZS9gLCBcImludGVybmFsXCIpIDogbnVsbCxcblx0XHRcdFx0bm90QXBwbGljYWJsZUNvbnRleHRzOiAhc3RhdGljQWN0aW9uID8gcGF0aEluTW9kZWwoYGR5bmFtaWNBY3Rpb25zLyR7ZGF0YUZpZWxkLkFjdGlvbn0vYU5vdEFwcGxpY2FibGUvYCwgXCJpbnRlcm5hbFwiKSA6IG51bGwsXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiBpc05hdmlnYWJsZSxcblx0XHRcdFx0ZW5hYmxlQXV0b1Njcm9sbDogZW5hYmxlQXV0b1Njcm9sbCxcblx0XHRcdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb25cblx0XHRcdH07XG5cblx0XHRwYXJhbXMuaW52b2NhdGlvbkdyb3VwaW5nID0gZGF0YUZpZWxkPy5JbnZvY2F0aW9uR3JvdXBpbmcgPT09IFwiVUkuT3BlcmF0aW9uR3JvdXBpbmdUeXBlL0NoYW5nZVNldFwiID8gXCJDaGFuZ2VTZXRcIiA6IFwiSXNvbGF0ZWRcIjtcblxuXHRcdHBhcmFtcy5jb250cm9sSWQgPSB0YWJsZVByb3BlcnRpZXMuaWQ7XG5cdFx0cGFyYW1zLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IG9wZXJhdGlvbkF2YWlsYWJsZU1hcDtcblx0XHRwYXJhbXMubGFiZWwgPSBkYXRhRmllbGQuTGFiZWw7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGZuKFwiQVBJLm9uQWN0aW9uUHJlc3NcIiwgW3JlZihcIiRldmVudFwiKSwgcmVmKFwiJGNvbnRyb2xsZXJcIiksIGRhdGFGaWVsZC5BY3Rpb24sIHBhcmFtc10pKTtcblx0XHQvL3JldHVybiBBY3Rpb25IZWxwZXIuZ2V0UHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbih0YWJsZS5pZCEsIGRhdGFGaWVsZCwgcGFyYW1zLCBvcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRldGVybWluZSB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciAnZW5hYmxlZCcgcHJvcGVydHkgb2YgRGF0YUZpZWxkRm9yQWN0aW9uIGFjdGlvbnMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWRcblx0ICogQHBhcmFtIHRhYmxlRGVmaW5pdGlvbiBUaGUgdGFibGUgZGVmaW5pdGlvbiBmcm9tIHRoZSB0YWJsZSBjb252ZXJ0ZXJcblx0ICogQHBhcmFtIGFjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gaXNCb3VuZCBJc0JvdW5kIGZvciBBY3Rpb25cblx0ICogQHBhcmFtIGFjdGlvbkNvbnRleHQgVGhlIGluc3RhbmNlIG9yIHRoZSBwYXRoIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGVuYWJsZU9uU2VsZWN0IERlZmluZSB0aGUgZW5hYmxpbmcgb2YgdGhlIGFjdGlvbiAoc2luZ2xlIG9yIG11bHRpc2VsZWN0KVxuXHQgKiBAcGFyYW0gYW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUgVGhlIGVudGl0eSB0eXBlIG9mIHRoZSBhbm5vdGF0aW9uIHRhcmdldFxuXHQgKiBAcmV0dXJucyBBIGJpbmRpbmcgZXhwcmVzc2lvbiB0byBkZWZpbmUgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgYWN0aW9uXG5cdCAqL1xuXHRpc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWQ6IGZ1bmN0aW9uIChcblx0XHR0YWJsZURlZmluaXRpb246IFRhYmxlVmlzdWFsaXphdGlvbixcblx0XHRhY3Rpb25OYW1lOiBzdHJpbmcgfCBTdHJpbmcsXG5cdFx0aXNCb3VuZDogYm9vbGVhbixcblx0XHRhY3Rpb25PYmplY3Q/OiBNZXRhTW9kZWxBY3Rpb24gfCBNZXRhTW9kZWxBY3Rpb25bXSB8IHN0cmluZyxcblx0XHRlbmFibGVPblNlbGVjdD86IHN0cmluZyxcblx0XHRhbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZT86IEVudGl0eVR5cGVcblx0KSB7XG5cdFx0Y29uc3QgaXNTdGF0aWNBY3Rpb24gPSB0aGlzLl9pc1N0YXRpY0FjdGlvbihhY3Rpb25PYmplY3QsIGFjdGlvbk5hbWUpO1xuXG5cdFx0Ly8gQ2hlY2sgZm9yIGFjdGlvbiBvdmVybG9hZCBvbiBhIGRpZmZlcmVudCBFbnRpdHkgdHlwZS5cblx0XHQvLyBJZiB5ZXMsIHRhYmxlIHJvdyBzZWxlY3Rpb24gaXMgbm90IHJlcXVpcmVkIHRvIGVuYWJsZSB0aGlzIGFjdGlvbi5cblx0XHRpZiAodGhpcy5faXNBY3Rpb25PdmVybG9hZE9uRGlmZmVyZW50VHlwZShhY3Rpb25OYW1lLCBhbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZSkpIHtcblx0XHRcdC8vIEFjdGlvbiBvdmVybG9hZCBkZWZpbmVkIG9uIGRpZmZlcmVudCBlbnRpdHkgdHlwZVxuXHRcdFx0Y29uc3Qgb09wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IHRhYmxlRGVmaW5pdGlvbiAmJiBKU09OLnBhcnNlKHRhYmxlRGVmaW5pdGlvbi5vcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHRcdFx0aWYgKG9PcGVyYXRpb25BdmFpbGFibGVNYXA/Lmhhc093blByb3BlcnR5KGFjdGlvbk5hbWUpKSB7XG5cdFx0XHRcdC8vIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIGFubm90YXRpb24gZGVmaW5lZCBmb3IgdGhlIGFjdGlvbi5cblx0XHRcdFx0Ly8gTmVlZCB0byByZWZlciB0byBpbnRlcm5hbCBtb2RlbCBmb3IgZW5hYmxlZCBwcm9wZXJ0eSBvZiB0aGUgZHluYW1pYyBhY3Rpb24uXG5cdFx0XHRcdC8vIHJldHVybiBjb21waWxlQmluZGluZyhiaW5kaW5nRXhwcmVzc2lvbihcImR5bmFtaWNBY3Rpb25zL1wiICsgc0FjdGlvbk5hbWUgKyBcIi9iRW5hYmxlZFwiLCBcImludGVybmFsXCIpLCB0cnVlKTtcblx0XHRcdFx0cmV0dXJuIGB7PSBcXCR7aW50ZXJuYWw+ZHluYW1pY0FjdGlvbnMvJHthY3Rpb25OYW1lfS9iRW5hYmxlZH0gfWA7XG5cdFx0XHR9XG5cdFx0XHQvLyBDb25zaWRlciB0aGUgYWN0aW9uIGp1c3QgbGlrZSBhbnkgb3RoZXIgc3RhdGljIERhdGFGaWVsZEZvckFjdGlvbi5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRpZiAoIWlzQm91bmQgfHwgaXNTdGF0aWNBY3Rpb24pIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGxldCBkYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkRXhwcmVzc2lvbiA9IFwiXCI7XG5cblx0XHRjb25zdCBudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPSBBY3Rpb25IZWxwZXIuZ2V0TnVtYmVyT2ZDb250ZXh0c0V4cHJlc3Npb24oZW5hYmxlT25TZWxlY3QgPz8gXCJtdWx0aXNlbGVjdFwiKTtcblx0XHRjb25zdCBhY3Rpb24gPSBgXFwke2ludGVybmFsPmR5bmFtaWNBY3Rpb25zLyR7YWN0aW9uTmFtZX0vYkVuYWJsZWR9YDtcblx0XHRkYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkRXhwcmVzc2lvbiA9IGAke251bWJlck9mU2VsZWN0ZWRDb250ZXh0c30gJiYgJHthY3Rpb259YDtcblxuXHRcdHJldHVybiBgez0gJHtkYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkRXhwcmVzc2lvbn19YDtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvcklCTiBhY3Rpb25zLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEYXRhRmllbGRGb3JJQk5FbmFibGVkXG5cdCAqIEBwYXJhbSB0YWJsZVByb3BlcnRpZXMgVGhlIHByb3BlcnRpZXMgb2YgdGhlIHRhYmxlIGNvbnRyb2xcblx0ICogQHBhcmFtIHRhYmxlUHJvcGVydGllcy5jb2xsZWN0aW9uICBUaGUgY29sbGVjdGlvbiBjb250ZXh0IHRvIGJlIHVzZWRcblx0ICogQHBhcmFtIHRhYmxlUHJvcGVydGllcy50YWJsZURlZmluaXRpb24gVGhlIHRhYmxlIGRlZmluaXRpb24gZnJvbSB0aGUgdGFibGUgY29udmVydGVyXG5cdCAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIHZhbHVlIG9mIHRoZSBkYXRhIGZpZWxkXG5cdCAqIEBwYXJhbSByZXF1aXJlc0NvbnRleHQgUmVxdWlyZXNDb250ZXh0IGZvciBJQk5cblx0ICogQHBhcmFtIGlzTmF2aWdhdGlvbkF2YWlsYWJsZSBEZWZpbmUgaWYgdGhlIG5hdmlnYXRpb24gaXMgYXZhaWxhYmxlXG5cdCAqIEByZXR1cm5zIEEgYmluZGluZyBleHByZXNzaW9uIHRvIGRlZmluZSB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IG9mIHRoZSBhY3Rpb25cblx0ICovXG5cdGlzRGF0YUZpZWxkRm9ySUJORW5hYmxlZDogZnVuY3Rpb24gKFxuXHRcdHRhYmxlUHJvcGVydGllczoge1xuXHRcdFx0Y29sbGVjdGlvbjogQ29udGV4dDtcblx0XHRcdHRhYmxlRGVmaW5pdGlvbjogVGFibGVWaXN1YWxpemF0aW9uO1xuXHRcdH0sXG5cdFx0ZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdFx0cmVxdWlyZXNDb250ZXh0OiBib29sZWFuIHwgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Qm9vbGVhbj4sXG5cdFx0aXNOYXZpZ2F0aW9uQXZhaWxhYmxlPzogYm9vbGVhbiB8IFByb3BlcnR5QW5ub3RhdGlvblZhbHVlPEJvb2xlYW4+XG5cdCkge1xuXHRcdGxldCBpc05hdmlnYXRpb25BdmFpbGFibGVQYXRoID0gbnVsbDtcblx0XHRpZiAoaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24oaXNOYXZpZ2F0aW9uQXZhaWxhYmxlKSkge1xuXHRcdFx0aXNOYXZpZ2F0aW9uQXZhaWxhYmxlUGF0aCA9IGlzTmF2aWdhdGlvbkF2YWlsYWJsZS5wYXRoO1xuXHRcdH1cblx0XHRjb25zdCBpc0FuYWx5dGljYWxUYWJsZSA9IHRhYmxlUHJvcGVydGllcz8udGFibGVEZWZpbml0aW9uPy5lbmFibGVBbmFseXRpY3M7XG5cblx0XHRpZiAoIXJlcXVpcmVzQ29udGV4dCkge1xuXHRcdFx0Y29uc3QgZW50aXR5U2V0ID0gdGFibGVQcm9wZXJ0aWVzLmNvbGxlY3Rpb24uZ2V0UGF0aCgpO1xuXHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gdGFibGVQcm9wZXJ0aWVzLmNvbGxlY3Rpb24uZ2V0TW9kZWwoKTtcblx0XHRcdGlmIChpc05hdmlnYXRpb25BdmFpbGFibGUgPT09IGZhbHNlICYmICFpc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0XHRMb2cud2FybmluZyhcIk5hdmlnYXRpb25BdmFpbGFibGUgYXMgZmFsc2UgaXMgaW5jb3JyZWN0IHVzYWdlXCIpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRpc05hdmlnYXRpb25BdmFpbGFibGVQYXRoICYmXG5cdFx0XHRcdCFpc0FuYWx5dGljYWxUYWJsZSAmJlxuXHRcdFx0XHRpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihkYXRhRmllbGQ/Lk5hdmlnYXRpb25BdmFpbGFibGUpICYmXG5cdFx0XHRcdG1ldGFNb2RlbC5nZXRPYmplY3QoZW50aXR5U2V0ICsgXCIvJFBhcnRuZXJcIikgPT09IGRhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlLnBhdGguc3BsaXQoXCIvXCIpWzBdXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIGB7PSBcXCR7JHtpc05hdmlnYXRpb25BdmFpbGFibGVQYXRoLnN1YnN0cmluZyhcblx0XHRcdFx0XHRpc05hdmlnYXRpb25BdmFpbGFibGVQYXRoLmluZGV4T2YoXCIvXCIpICsgMSxcblx0XHRcdFx0XHRpc05hdmlnYXRpb25BdmFpbGFibGVQYXRoLmxlbmd0aFxuXHRcdFx0XHQpfX19YDtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGxldCBkYXRhRmllbGRGb3JJQk5FbmFibGVkRXhwcmVzc2lvbiA9IFwiXCIsXG5cdFx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRhY3Rpb247XG5cblx0XHRpZiAoaXNOYXZpZ2F0aW9uQXZhaWxhYmxlID09PSB0cnVlIHx8IGlzQW5hbHl0aWNhbFRhYmxlKSB7XG5cdFx0XHRkYXRhRmllbGRGb3JJQk5FbmFibGVkRXhwcmVzc2lvbiA9IFwiJXtpbnRlcm5hbD5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHN9ID49IDFcIjtcblx0XHR9IGVsc2UgaWYgKGlzTmF2aWdhdGlvbkF2YWlsYWJsZSA9PT0gZmFsc2UpIHtcblx0XHRcdExvZy53YXJuaW5nKFwiTmF2aWdhdGlvbkF2YWlsYWJsZSBhcyBmYWxzZSBpcyBpbmNvcnJlY3QgdXNhZ2VcIik7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9IFwiJXtpbnRlcm5hbD5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHN9ID49IDFcIjtcblx0XHRcdGFjdGlvbiA9IGBcXCR7aW50ZXJuYWw+aWJuLyR7ZGF0YUZpZWxkLlNlbWFudGljT2JqZWN0fS0ke2RhdGFGaWVsZC5BY3Rpb259L2JFbmFibGVkfWA7XG5cdFx0XHRkYXRhRmllbGRGb3JJQk5FbmFibGVkRXhwcmVzc2lvbiA9IG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyArIFwiICYmIFwiICsgYWN0aW9uO1xuXHRcdH1cblxuXHRcdHJldHVybiBgez0gJHtkYXRhRmllbGRGb3JJQk5FbmFibGVkRXhwcmVzc2lvbn19YDtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgcHJlc3MgZXZlbnQgZXhwcmVzc2lvbiBmb3IgQ3JlYXRlQnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcHJlc3NFdmVudEZvckNyZWF0ZUJ1dHRvblxuXHQgKiBAcGFyYW0gb1RoaXMgQ3VycmVudCBPYmplY3Rcblx0ICogQHBhcmFtIGJDbWRFeGVjdXRpb25GbGFnIEZsYWcgdG8gaW5kaWNhdGUgdGhhdCB0aGUgZnVuY3Rpb24gaXMgY2FsbGVkIGZyb20gQ01EIEV4ZWN1dGlvblxuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgcHJlc3MgZXZlbnQgb2YgdGhlIGNyZWF0ZSBidXR0b25cblx0ICovXG5cdHByZXNzRXZlbnRGb3JDcmVhdGVCdXR0b246IGZ1bmN0aW9uIChvVGhpczogYW55LCBiQ21kRXhlY3V0aW9uRmxhZzogYm9vbGVhbikge1xuXHRcdGNvbnN0IHNDcmVhdGlvbk1vZGUgPSBvVGhpcy5jcmVhdGlvbk1vZGU7XG5cdFx0bGV0IG9QYXJhbXM6IGFueTtcblx0XHRjb25zdCBzTWRjVGFibGUgPSBiQ21kRXhlY3V0aW9uRmxhZyA/IFwiJHskc291cmNlPn0uZ2V0UGFyZW50KClcIiA6IFwiJHskc291cmNlPn0uZ2V0UGFyZW50KCkuZ2V0UGFyZW50KCkuZ2V0UGFyZW50KClcIjtcblx0XHRsZXQgc1Jvd0JpbmRpbmcgPSBzTWRjVGFibGUgKyBcIi5nZXRSb3dCaW5kaW5nKCkgfHwgXCIgKyBzTWRjVGFibGUgKyBcIi5kYXRhKCdyb3dzQmluZGluZ0luZm8nKS5wYXRoXCI7XG5cblx0XHRzd2l0Y2ggKHNDcmVhdGlvbk1vZGUpIHtcblx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLkV4dGVybmFsOlxuXHRcdFx0XHQvLyBuYXZpZ2F0ZSB0byBleHRlcm5hbCB0YXJnZXQgZm9yIGNyZWF0aW5nIG5ldyBlbnRyaWVzXG5cdFx0XHRcdC8vIFRPRE86IEFkZCByZXF1aXJlZCBwYXJhbWV0ZXJzXG5cdFx0XHRcdG9QYXJhbXMgPSB7XG5cdFx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKENyZWF0aW9uTW9kZS5FeHRlcm5hbCksXG5cdFx0XHRcdFx0b3V0Ym91bmQ6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob1RoaXMuY3JlYXRlT3V0Ym91bmQpXG5cdFx0XHRcdH07XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdzpcblx0XHRcdFx0b1BhcmFtcyA9IHtcblx0XHRcdFx0XHRjcmVhdGlvbk1vZGU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93KSxcblx0XHRcdFx0XHRjcmVhdGlvblJvdzogXCIkeyRzb3VyY2U+fVwiLFxuXHRcdFx0XHRcdGNyZWF0ZUF0RW5kOiBvVGhpcy5jcmVhdGVBdEVuZCAhPT0gdW5kZWZpbmVkID8gb1RoaXMuY3JlYXRlQXRFbmQgOiBmYWxzZVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdHNSb3dCaW5kaW5nID0gXCIkeyRzb3VyY2U+fS5nZXRQYXJlbnQoKS5nZXRSb3dCaW5kaW5nKClcIjtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLk5ld1BhZ2U6XG5cdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5JbmxpbmU6XG5cdFx0XHRcdG9QYXJhbXMgPSB7XG5cdFx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNDcmVhdGlvbk1vZGUpLFxuXHRcdFx0XHRcdGNyZWF0ZUF0RW5kOiBvVGhpcy5jcmVhdGVBdEVuZCAhPT0gdW5kZWZpbmVkID8gb1RoaXMuY3JlYXRlQXRFbmQgOiBmYWxzZSxcblx0XHRcdFx0XHR0YWJsZUlkOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9UaGlzLmlkKVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmIChvVGhpcy5jcmVhdGVOZXdBY3Rpb24pIHtcblx0XHRcdFx0XHRvUGFyYW1zLm5ld0FjdGlvbiA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob1RoaXMuY3JlYXRlTmV3QWN0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuSW5saW5lQ3JlYXRpb25Sb3dzOlxuXHRcdFx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmdlbmVyYXRlRnVuY3Rpb24oXCIuZWRpdEZsb3cuY3JlYXRlRW1wdHlSb3dzQW5kRm9jdXNcIiwgc01kY1RhYmxlKTtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIHVuc3VwcG9ydGVkXG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcIi5lZGl0Rmxvdy5jcmVhdGVEb2N1bWVudFwiLCBzUm93QmluZGluZywgQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpKTtcblx0fSxcblxuXHRnZXRJQk5EYXRhOiBmdW5jdGlvbiAob3V0Ym91bmREZXRhaWw6IE5hdmlnYXRpb25UYXJnZXRDb25maWd1cmF0aW9uW1wib3V0Ym91bmREZXRhaWxcIl0pIHtcblx0XHRpZiAob3V0Ym91bmREZXRhaWwpIHtcblx0XHRcdGNvbnN0IG9JQk5EYXRhID0ge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvdXRib3VuZERldGFpbC5zZW1hbnRpY09iamVjdCksXG5cdFx0XHRcdGFjdGlvbjogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvdXRib3VuZERldGFpbC5hY3Rpb24pXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvSUJORGF0YSk7XG5cdFx0fVxuXHR9LFxuXG5cdF9nZXRFeHByZXNzaW9uRm9yRGVsZXRlQnV0dG9uOiBmdW5jdGlvbiAodmFsdWU6IGFueSwgZnVsbENvbnRleHRQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRcdGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHJldHVybiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHZhbHVlLCB0cnVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgZXhwcmVzc2lvbiA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbih2YWx1ZSk7XG5cdFx0XHRpZiAoaXNDb25zdGFudChleHByZXNzaW9uKSB8fCBpc1BhdGhJbk1vZGVsRXhwcmVzc2lvbihleHByZXNzaW9uKSkge1xuXHRcdFx0XHRjb25zdCB2YWx1ZUV4cHJlc3Npb24gPSBmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5KGV4cHJlc3Npb24sIGZ1bGxDb250ZXh0UGF0aCk7XG5cdFx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbih2YWx1ZUV4cHJlc3Npb24pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBwcmVzcyBldmVudCBleHByZXNzaW9uIGZvciAnRGVsZXRlJyBidXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBwcmVzc0V2ZW50Rm9yRGVsZXRlQnV0dG9uXG5cdCAqIEBwYXJhbSBvVGhpcyBDdXJyZW50IE9iamVjdFxuXHQgKiBAcGFyYW0gc0VudGl0eVNldE5hbWUgRW50aXR5U2V0IG5hbWVcblx0ICogQHBhcmFtIG9IZWFkZXJJbmZvIEhlYWRlciBJbmZvXG5cdCAqIEBwYXJhbSBmdWxsY29udGV4dFBhdGggQ29udGV4dCBQYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBwcmVzcyBldmVudCBvZiB0aGUgJ0RlbGV0ZScgYnV0dG9uXG5cdCAqL1xuXHRwcmVzc0V2ZW50Rm9yRGVsZXRlQnV0dG9uOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgc0VudGl0eVNldE5hbWU6IHN0cmluZywgb0hlYWRlckluZm86IGFueSwgZnVsbGNvbnRleHRQYXRoOiBhbnkpIHtcblx0XHRjb25zdCBzRGVsZXRhYmxlQ29udGV4dHMgPSBcIiR7aW50ZXJuYWw+ZGVsZXRhYmxlQ29udGV4dHN9XCI7XG5cdFx0bGV0IHNUaXRsZUV4cHJlc3Npb24sIHNEZXNjcmlwdGlvbkV4cHJlc3Npb247XG5cblx0XHRpZiAob0hlYWRlckluZm8/LlRpdGxlKSB7XG5cdFx0XHRzVGl0bGVFeHByZXNzaW9uID0gdGhpcy5fZ2V0RXhwcmVzc2lvbkZvckRlbGV0ZUJ1dHRvbihvSGVhZGVySW5mby5UaXRsZS5WYWx1ZSwgZnVsbGNvbnRleHRQYXRoKTtcblx0XHR9XG5cdFx0aWYgKG9IZWFkZXJJbmZvPy5EZXNjcmlwdGlvbikge1xuXHRcdFx0c0Rlc2NyaXB0aW9uRXhwcmVzc2lvbiA9IHRoaXMuX2dldEV4cHJlc3Npb25Gb3JEZWxldGVCdXR0b24ob0hlYWRlckluZm8uRGVzY3JpcHRpb24uVmFsdWUsIGZ1bGxjb250ZXh0UGF0aCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb1BhcmFtcyA9IHtcblx0XHRcdGlkOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9UaGlzLmlkKSxcblx0XHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpLFxuXHRcdFx0bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzOiBcIiR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c30ubGVuZ3RoXCIsXG5cdFx0XHR1blNhdmVkQ29udGV4dHM6IFwiJHtpbnRlcm5hbD51blNhdmVkQ29udGV4dHN9XCIsXG5cdFx0XHRsb2NrZWRDb250ZXh0czogXCIke2ludGVybmFsPmxvY2tlZENvbnRleHRzfVwiLFxuXHRcdFx0ZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZTogXCIke2ludGVybmFsPmRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmV9XCIsXG5cdFx0XHRkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlOiBcIiR7aW50ZXJuYWw+ZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZX1cIixcblx0XHRcdGNvbnRyb2xJZDogXCIke2ludGVybmFsPmNvbnRyb2xJZH1cIixcblx0XHRcdHRpdGxlOiBzVGl0bGVFeHByZXNzaW9uLFxuXHRcdFx0ZGVzY3JpcHRpb246IHNEZXNjcmlwdGlvbkV4cHJlc3Npb24sXG5cdFx0XHRzZWxlY3RlZENvbnRleHRzOiBcIiR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c31cIlxuXHRcdH07XG5cblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmdlbmVyYXRlRnVuY3Rpb24oXCIuZWRpdEZsb3cuZGVsZXRlTXVsdGlwbGVEb2N1bWVudHNcIiwgc0RlbGV0YWJsZUNvbnRleHRzLCBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcykpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc2V0IHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBsYWJlbCBmb3IgdGhlIGNvbHVtbiBoZWFkZXIuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzZXRIZWFkZXJMYWJlbFZpc2liaWxpdHlcblx0ICogQHBhcmFtIGRhdGFmaWVsZCBEYXRhRmllbGRcblx0ICogQHBhcmFtIGRhdGFGaWVsZENvbGxlY3Rpb24gTGlzdCBvZiBpdGVtcyBpbnNpZGUgYSBmaWVsZGdyb3VwIChpZiBhbnkpXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgaGVhZGVyIGxhYmVsIG5lZWRzIHRvIGJlIHZpc2libGUgZWxzZSBmYWxzZS5cblx0ICovXG5cdHNldEhlYWRlckxhYmVsVmlzaWJpbGl0eTogZnVuY3Rpb24gKGRhdGFmaWVsZDogYW55LCBkYXRhRmllbGRDb2xsZWN0aW9uOiBhbnlbXSkge1xuXHRcdC8vIElmIElubGluZSBidXR0b24vbmF2aWdhdGlvbiBhY3Rpb24sIHJldHVybiBmYWxzZSwgZWxzZSB0cnVlO1xuXHRcdGlmICghZGF0YUZpZWxkQ29sbGVjdGlvbikge1xuXHRcdFx0aWYgKGRhdGFmaWVsZC4kVHlwZS5pbmRleE9mKFwiRGF0YUZpZWxkRm9yQWN0aW9uXCIpID4gLTEgJiYgZGF0YWZpZWxkLklubGluZSkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZGF0YWZpZWxkLiRUeXBlLmluZGV4T2YoXCJEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIikgPiAtMSAmJiBkYXRhZmllbGQuSW5saW5lKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIEluIEZpZWxkZ3JvdXAsIElmIE5PVCBhbGwgZGF0YWZpZWxkL2RhdGFmaWVsZEZvckFubm90YXRpb24gZXhpc3RzIHdpdGggaGlkZGVuLCByZXR1cm4gdHJ1ZTtcblx0XHRyZXR1cm4gZGF0YUZpZWxkQ29sbGVjdGlvbi5zb21lKGZ1bmN0aW9uIChvREM6IGFueSkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQob0RDLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQgfHwgb0RDLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uKSAmJlxuXHRcdFx0XHRvRENbYEAke1VJQW5ub3RhdGlvblRlcm1zLkhpZGRlbn1gXSAhPT0gdHJ1ZVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSB0ZXh0IGZyb20gdGhlIERhdGFGaWVsZEZvckFubm90YXRpb24gaW50byB0aGUgY29sdW1uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0VGV4dE9uQWN0aW9uRmllbGRcblx0ICogQHBhcmFtIG9EYXRhRmllbGQgRGF0YVBvaW50J3MgVmFsdWVcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2JqZWN0IG9mIHRoZSBMaW5lSXRlbVxuXHQgKiBAcmV0dXJucyBTdHJpbmcgZnJvbSBsYWJlbCByZWZlcnJpbmcgdG8gYWN0aW9uIHRleHRcblx0ICovXG5cdGdldFRleHRPbkFjdGlvbkZpZWxkOiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvQ29udGV4dDogYW55KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoXG5cdFx0XHRvRGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIG9EYXRhRmllbGQuTGFiZWw7XG5cdFx0fVxuXHRcdC8vIGZvciBGaWVsZEdyb3VwIGNvbnRhaW5pbmcgRGF0YUZpZWxkRm9yQW5ub3RhdGlvblxuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24gJiZcblx0XHRcdG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KFwiVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aFwiKS5pbmRleE9mKFwiQFwiICsgVUlBbm5vdGF0aW9uVGVybXMuRmllbGRHcm91cCkgPiAtMVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgc1BhdGhEYXRhRmllbGRzID0gXCJUYXJnZXQvJEFubm90YXRpb25QYXRoL0RhdGEvXCI7XG5cdFx0XHRjb25zdCBhTXVsdGlwbGVMYWJlbHMgPSBbXTtcblx0XHRcdGZvciAoY29uc3QgaSBpbiBvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChzUGF0aERhdGFGaWVsZHMpKSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChgJHtzUGF0aERhdGFGaWVsZHMgKyBpfS8kVHlwZWApID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHRcdFx0XHRvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChgJHtzUGF0aERhdGFGaWVsZHMgKyBpfS8kVHlwZWApID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0YU11bHRpcGxlTGFiZWxzLnB1c2gob0NvbnRleHQuY29udGV4dC5nZXRPYmplY3QoYCR7c1BhdGhEYXRhRmllbGRzICsgaX0vTGFiZWxgKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIEluIGNhc2UgdGhlcmUgYXJlIG11bHRpcGxlIGFjdGlvbnMgaW5zaWRlIGEgRmllbGQgR3JvdXAgc2VsZWN0IHRoZSBsYXJnZXN0IEFjdGlvbiBMYWJlbFxuXHRcdFx0aWYgKGFNdWx0aXBsZUxhYmVscy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdHJldHVybiBhTXVsdGlwbGVMYWJlbHMucmVkdWNlKGZ1bmN0aW9uIChhOiBhbnksIGI6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBhLmxlbmd0aCA+IGIubGVuZ3RoID8gYSA6IGI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGFNdWx0aXBsZUxhYmVscy5sZW5ndGggPT09IDAgPyB1bmRlZmluZWQgOiBhTXVsdGlwbGVMYWJlbHMudG9TdHJpbmcoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblx0X2dldFJlc3BvbnNpdmVUYWJsZUNvbHVtblNldHRpbmdzOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgb0NvbHVtbjogYW55KSB7XG5cdFx0aWYgKG9UaGlzLnRhYmxlVHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIikge1xuXHRcdFx0cmV0dXJuIG9Db2x1bW4uc2V0dGluZ3M7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9LFxuXG5cdGdldENoYXJ0U2l6ZTogZnVuY3Rpb24gKG9UaGlzOiBhbnksIG9Db2x1bW46IGFueSkge1xuXHRcdGNvbnN0IHNldHRpbmdzID0gdGhpcy5fZ2V0UmVzcG9uc2l2ZVRhYmxlQ29sdW1uU2V0dGluZ3Mob1RoaXMsIG9Db2x1bW4pO1xuXHRcdGlmIChzZXR0aW5ncyAmJiBzZXR0aW5ncy5taWNyb0NoYXJ0U2l6ZSkge1xuXHRcdFx0cmV0dXJuIHNldHRpbmdzLm1pY3JvQ2hhcnRTaXplO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJYU1wiO1xuXHR9LFxuXHRnZXRTaG93T25seUNoYXJ0OiBmdW5jdGlvbiAob1RoaXM6IGFueSwgb0NvbHVtbjogYW55KSB7XG5cdFx0Y29uc3Qgc2V0dGluZ3MgPSB0aGlzLl9nZXRSZXNwb25zaXZlVGFibGVDb2x1bW5TZXR0aW5ncyhvVGhpcywgb0NvbHVtbik7XG5cdFx0aWYgKHNldHRpbmdzICYmIHNldHRpbmdzLnNob3dNaWNyb0NoYXJ0TGFiZWwpIHtcblx0XHRcdHJldHVybiAhc2V0dGluZ3Muc2hvd01pY3JvQ2hhcnRMYWJlbDtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdGdldERlbGVnYXRlOiBmdW5jdGlvbiAodGFibGU6IFRhYmxlVmlzdWFsaXphdGlvbiwgaXNBTFA6IHN0cmluZywgZW50aXR5TmFtZTogc3RyaW5nKSB7XG5cdFx0bGV0IG9EZWxlZ2F0ZTtcblx0XHRpZiAoaXNBTFAgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHQvLyBXZSBkb24ndCBzdXBwb3J0IFRyZWVUYWJsZSBpbiBBTFBcblx0XHRcdGlmICh0YWJsZS5jb250cm9sLnR5cGUgPT09IFwiVHJlZVRhYmxlXCIpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVHJlZVRhYmxlIG5vdCBzdXBwb3J0ZWQgaW4gQW5hbHl0aWNhbCBMaXN0UGFnZVwiKTtcblx0XHRcdH1cblx0XHRcdG9EZWxlZ2F0ZSA9IHtcblx0XHRcdFx0bmFtZTogXCJzYXAvZmUvbWFjcm9zL3RhYmxlL2RlbGVnYXRlcy9BTFBUYWJsZURlbGVnYXRlXCIsXG5cdFx0XHRcdHBheWxvYWQ6IHtcblx0XHRcdFx0XHRjb2xsZWN0aW9uTmFtZTogZW50aXR5TmFtZVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAodGFibGUuY29udHJvbC50eXBlID09PSBcIlRyZWVUYWJsZVwiKSB7XG5cdFx0XHRvRGVsZWdhdGUgPSB7XG5cdFx0XHRcdG5hbWU6IFwic2FwL2ZlL21hY3Jvcy90YWJsZS9kZWxlZ2F0ZXMvVHJlZVRhYmxlRGVsZWdhdGVcIixcblx0XHRcdFx0cGF5bG9hZDoge1xuXHRcdFx0XHRcdGhpZXJhcmNoeVF1YWxpZmllcjogdGFibGUuY29udHJvbC5oaWVyYXJjaHlRdWFsaWZpZXIsXG5cdFx0XHRcdFx0aW5pdGlhbEV4cGFuc2lvbkxldmVsOiB0YWJsZS5hbm5vdGF0aW9uLmluaXRpYWxFeHBhbnNpb25MZXZlbFxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRGVsZWdhdGUgPSB7XG5cdFx0XHRcdG5hbWU6IFwic2FwL2ZlL21hY3Jvcy90YWJsZS9kZWxlZ2F0ZXMvVGFibGVEZWxlZ2F0ZVwiXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvRGVsZWdhdGUpO1xuXHR9LFxuXHRzZXRJQk5FbmFibGVtZW50OiBmdW5jdGlvbiAob0ludGVybmFsTW9kZWxDb250ZXh0OiBhbnksIG9OYXZpZ2F0aW9uQXZhaWxhYmxlTWFwOiBhbnksIGFTZWxlY3RlZENvbnRleHRzOiBhbnkpIHtcblx0XHRmb3IgKGNvbnN0IHNLZXkgaW4gb05hdmlnYXRpb25BdmFpbGFibGVNYXApIHtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShgaWJuLyR7c0tleX1gLCB7XG5cdFx0XHRcdGJFbmFibGVkOiBmYWxzZSxcblx0XHRcdFx0YUFwcGxpY2FibGU6IFtdLFxuXHRcdFx0XHRhTm90QXBwbGljYWJsZTogW11cblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgYUFwcGxpY2FibGUgPSBbXSxcblx0XHRcdFx0YU5vdEFwcGxpY2FibGUgPSBbXTtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eSA9IG9OYXZpZ2F0aW9uQXZhaWxhYmxlTWFwW3NLZXldO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhU2VsZWN0ZWRDb250ZXh0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBvU2VsZWN0ZWRDb250ZXh0ID0gYVNlbGVjdGVkQ29udGV4dHNbaV07XG5cdFx0XHRcdGlmIChvU2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChzUHJvcGVydHkpKSB7XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCkuc2V0UHJvcGVydHkoYCR7b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFBhdGgoKX0vaWJuLyR7c0tleX0vYkVuYWJsZWRgLCB0cnVlKTtcblx0XHRcdFx0XHRhQXBwbGljYWJsZS5wdXNoKG9TZWxlY3RlZENvbnRleHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFOb3RBcHBsaWNhYmxlLnB1c2gob1NlbGVjdGVkQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRNb2RlbCgpLnNldFByb3BlcnR5KGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2libi8ke3NLZXl9L2FBcHBsaWNhYmxlYCwgYUFwcGxpY2FibGUpO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCkuc2V0UHJvcGVydHkoYCR7b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFBhdGgoKX0vaWJuLyR7c0tleX0vYU5vdEFwcGxpY2FibGVgLCBhTm90QXBwbGljYWJsZSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0gb0Zhc3RDcmVhdGlvblJvd1xuXHQgKiBAcGFyYW0gc1BhdGhcblx0ICogQHBhcmFtIG9Db250ZXh0XG5cdCAqIEBwYXJhbSBvTW9kZWxcblx0ICogQHBhcmFtIG9GaW5hbFVJU3RhdGVcblx0ICovXG5cdGVuYWJsZUZhc3RDcmVhdGlvblJvdzogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdG9GYXN0Q3JlYXRpb25Sb3c6IGFueSxcblx0XHRzUGF0aDogc3RyaW5nLFxuXHRcdG9Db250ZXh0OiB2NENvbnRleHQsXG5cdFx0b01vZGVsOiBPRGF0YU1vZGVsLFxuXHRcdG9GaW5hbFVJU3RhdGU6IFByb21pc2U8YW55PlxuXHQpIHtcblx0XHRsZXQgb0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nLCBvRmFzdENyZWF0aW9uQ29udGV4dDtcblxuXHRcdGlmIChvRmFzdENyZWF0aW9uUm93KSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCBvRmluYWxVSVN0YXRlO1xuXHRcdFx0XHQvLyBJZiBhIGRyYWZ0IGlzIGRpc2NhcmRlZCB3aGlsZSBhIG1lc3NhZ2Ugc3RyaXAgZmlsdGVyIGlzIGFjdGl2ZSBvbiB0aGUgdGFibGUgdGhlcmUgaXMgYSB0YWJsZSByZWJpbmQgY2F1c2VkIGJ5IHRoZSBEYXRhU3RhdGVJbmRpY2F0b3Jcblx0XHRcdFx0Ly8gVG8gcHJldmVudCBhIG5ldyBjcmVhdGlvbiByb3cgYmluZGluZyBiZWluZyBjcmVhdGVkIGF0IHRoYXQgbW9tZW50IHdlIGNoZWNrIGlmIHRoZSBjb250ZXh0IGlzIGFscmVhZHkgZGVsZXRlZFxuXHRcdFx0XHRpZiAob0Zhc3RDcmVhdGlvblJvdy5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikgJiYgIW9Db250ZXh0LmlzRGVsZXRlZCgpKSB7XG5cdFx0XHRcdFx0b0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nID0gb01vZGVsLmJpbmRMaXN0KHNQYXRoLCBvQ29udGV4dCwgW10sIFtdLCB7XG5cdFx0XHRcdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwiZG9Ob3RTdWJtaXRcIixcblx0XHRcdFx0XHRcdCQkZ3JvdXBJZDogXCJkb05vdFN1Ym1pdFwiXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Ly8gV29ya2Fyb3VuZCBzdWdnZXN0ZWQgYnkgT0RhdGEgbW9kZWwgdjQgY29sbGVhZ3Vlc1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0b0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nLnJlZnJlc2hJbnRlcm5hbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdC8qIGRvIG5vdGhpbmcgKi9cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdG9GYXN0Q3JlYXRpb25Db250ZXh0ID0gb0Zhc3RDcmVhdGlvbkxpc3RCaW5kaW5nLmNyZWF0ZSgpO1xuXHRcdFx0XHRcdG9GYXN0Q3JlYXRpb25Sb3cuc2V0QmluZGluZ0NvbnRleHQob0Zhc3RDcmVhdGlvbkNvbnRleHQpO1xuXG5cdFx0XHRcdFx0Ly8gdGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgY29uc29sZSBlcnJvclxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBvRmFzdENyZWF0aW9uQ29udGV4dC5jcmVhdGVkKCk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0TG9nLnRyYWNlKFwidHJhbnNpZW50IGZhc3QgY3JlYXRpb24gY29udGV4dCBkZWxldGVkXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgY29tcHV0aW5nIHRoZSBmaW5hbCBVSSBzdGF0ZVwiLCBvRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcbihUYWJsZUhlbHBlci5nZXROYXZpZ2F0aW9uQXZhaWxhYmxlTWFwIGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oVGFibGVIZWxwZXIuZ2V0VGV4dE9uQWN0aW9uRmllbGQgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgVGFibGVIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWtFQSxNQUFNQSxZQUFZLEdBQUdDLFNBQVMsQ0FBQ0QsWUFBWTs7RUFFM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsTUFBTUUsV0FBVyxHQUFHO0lBQ25CO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDQyxlQUFlLEVBQUUsVUFBVUMsWUFBc0UsRUFBRUMsVUFBa0IsRUFBVztNQUMvSCxJQUFJQyxNQUE0QztNQUNoRCxJQUFJRixZQUFZLEVBQUU7UUFDakIsSUFBSUcsS0FBSyxDQUFDQyxPQUFPLENBQUNKLFlBQVksQ0FBQyxFQUFFO1VBQ2hDLE1BQU1LLFVBQVUsR0FBRyxJQUFJLENBQUNDLDRCQUE0QixDQUFDTCxVQUFVLENBQUM7VUFDaEUsSUFBSUksVUFBVSxFQUFFO1lBQ2ZILE1BQU0sR0FBR0YsWUFBWSxDQUFDTyxJQUFJLENBQUMsVUFBVUMsT0FBd0IsRUFBRTtjQUM5RCxPQUFPQSxPQUFPLENBQUNDLFFBQVEsSUFBSUQsT0FBTyxDQUFDRSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUNDLEtBQUssS0FBS04sVUFBVTtZQUN0RSxDQUFDLENBQUM7VUFDSCxDQUFDLE1BQU07WUFDTjtZQUNBO1lBQ0FILE1BQU0sR0FB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
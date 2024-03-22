/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/CommonUtils", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/internal/helpers/TableTemplating", "sap/ui/core/library", "../CommonHelper", "../internal/helpers/ActionHelper", "../MacroAPI", "./ActionsTemplating", "./TableHelper"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, CommonUtils, DataField, DataVisualization, ManifestSettings, MetaModelConverter, ModelHelper, StableIdHelper, TypeGuards, DataModelPathHelper, TableTemplating, library, CommonHelper, ActionHelper, MacroAPI, ActionsTemplating, TableHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _dec54, _dec55, _dec56, _dec57, _dec58, _dec59, _dec60, _dec61, _dec62, _dec63, _dec64, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31, _descriptor32, _descriptor33, _descriptor34, _descriptor35, _descriptor36, _descriptor37, _descriptor38, _descriptor39, _descriptor40, _descriptor41, _descriptor42, _descriptor43, _descriptor44, _descriptor45, _descriptor46, _descriptor47, _descriptor48, _descriptor49, _descriptor50, _descriptor51, _descriptor52, _descriptor53, _descriptor54, _descriptor55, _descriptor56, _descriptor57, _descriptor58, _descriptor59, _descriptor60, _descriptor61, _descriptor62, _descriptor63;
  var _exports = {};
  var getTableActionTemplate = ActionsTemplating.getTableActionTemplate;
  var TitleLevel = library.TitleLevel;
  var buildExpressionForHeaderVisible = TableTemplating.buildExpressionForHeaderVisible;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var isSingleton = TypeGuards.isSingleton;
  var generate = StableIdHelper.generate;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var CreationMode = ManifestSettings.CreationMode;
  var getVisualizationsFromPresentationVariant = DataVisualization.getVisualizationsFromPresentationVariant;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var isDataFieldForAnnotation = DataField.isDataFieldForAnnotation;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockEvent = BuildingBlockSupport.blockEvent;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  var blockAggregation = BuildingBlockSupport.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const setCustomActionProperties = function (childAction) {
    var _act$getAttribute;
    let menuContentActions = null;
    const act = childAction;
    let menuActions = [];
    const actionKey = (_act$getAttribute = act.getAttribute("key")) === null || _act$getAttribute === void 0 ? void 0 : _act$getAttribute.replace("InlineXML_", "");
    // For the actionGroup we authorize the both entries <sap.fe.macros:ActionGroup> (compliant with old FPM examples) and <sap.fe.macros.table:ActionGroup>
    if (act.children.length && act.localName === "ActionGroup" && act.namespaceURI && ["sap.fe.macros", "sap.fe.macros.table"].indexOf(act.namespaceURI) > -1) {
      const actionsToAdd = Array.prototype.slice.apply(act.children);
      let actionIdx = 0;
      menuContentActions = actionsToAdd.reduce((acc, actToAdd) => {
        var _actToAdd$getAttribut;
        const actionKeyAdd = ((_actToAdd$getAttribut = actToAdd.getAttribute("key")) === null || _actToAdd$getAttribut === void 0 ? void 0 : _actToAdd$getAttribut.replace("InlineXML_", "")) || actionKey + "_Menu_" + actionIdx;
        const curOutObject = {
          key: actionKeyAdd,
          text: actToAdd.getAttribute("text"),
          __noWrap: true,
          press: actToAdd.getAttribute("press"),
          requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
          enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled")
        };
        acc[curOutObject.key] = curOutObject;
        actionIdx++;
        return acc;
      }, {});
      menuActions = Object.values(menuContentActions).slice(-act.children.length).map(function (menuItem) {
        return menuItem.key;
      });
    }
    return {
      key: actionKey,
      text: act.getAttribute("text"),
      position: {
        placement: act.getAttribute("placement"),
        anchor: act.getAttribute("anchor")
      },
      __noWrap: true,
      press: act.getAttribute("press"),
      requiresSelection: act.getAttribute("requiresSelection") === "true",
      enabled: act.getAttribute("enabled") === null ? true : act.getAttribute("enabled"),
      menu: menuActions.length ? menuActions : null,
      menuContentActions: menuContentActions
    };
  };
  const setCustomColumnProperties = function (childColumn, aggregationObject) {
    var _childColumn$children, _childColumn$getAttri;
    aggregationObject.key = aggregationObject.key.replace("InlineXML_", "");
    childColumn.setAttribute("key", aggregationObject.key);
    return {
      // Defaults are to be defined in Table.ts
      key: aggregationObject.key,
      type: "Slot",
      width: childColumn.getAttribute("width"),
      importance: childColumn.getAttribute("importance"),
      horizontalAlign: childColumn.getAttribute("horizontalAlign"),
      availability: childColumn.getAttribute("availability"),
      header: childColumn.getAttribute("header"),
      template: ((_childColumn$children = childColumn.children[0]) === null || _childColumn$children === void 0 ? void 0 : _childColumn$children.outerHTML) || "",
      properties: childColumn.getAttribute("properties") ? (_childColumn$getAttri = childColumn.getAttribute("properties")) === null || _childColumn$getAttri === void 0 ? void 0 : _childColumn$getAttri.split(",") : undefined,
      position: {
        placement: childColumn.getAttribute("placement") || childColumn.getAttribute("positionPlacement"),
        //positionPlacement is kept for backwards compatibility
        anchor: childColumn.getAttribute("anchor") || childColumn.getAttribute("positionAnchor") //positionAnchor is kept for backwards compatibility
      }
    };
  };
  let TableBlock = (_dec = defineBuildingBlock({
    name: "Table",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    returnTypes: ["sap.fe.macros.table.TableAPI"]
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec5 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "number",
    isPublic: true
  }), _dec8 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec10 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec11 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true
  }), _dec12 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec13 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec14 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec15 = blockAttribute({
    type: "string|boolean",
    isPublic: true
  }), _dec16 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec17 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec18 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec19 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec20 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec21 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: false,
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "Singleton"]
  }), _dec22 = blockAttribute({
    type: "string"
  }), _dec23 = blockAttribute({
    type: "boolean"
  }), _dec24 = blockAttribute({
    type: "string"
  }), _dec25 = blockAttribute({
    type: "boolean"
  }), _dec26 = blockAttribute({
    type: "string"
  }), _dec27 = blockAttribute({
    type: "string"
  }), _dec28 = blockAttribute({
    type: "string"
  }), _dec29 = blockAttribute({
    type: "string"
  }), _dec30 = blockAttribute({
    type: "string"
  }), _dec31 = blockAttribute({
    type: "boolean"
  }), _dec32 = blockAttribute({
    type: "boolean"
  }), _dec33 = blockAttribute({
    type: "boolean"
  }), _dec34 = blockAttribute({
    type: "string"
  }), _dec35 = blockAttribute({
    type: "string"
  }), _dec36 = blockAttribute({
    type: "number"
  }), _dec37 = blockAttribute({
    type: "boolean"
  }), _dec38 = blockAttribute({
    type: "boolean"
  }), _dec39 = blockAttribute({
    type: "boolean"
  }), _dec40 = blockAttribute({
    type: "string"
  }), _dec41 = blockAttribute({
    type: "string"
  }), _dec42 = blockAttribute({
    type: "string"
  }), _dec43 = blockAttribute({
    type: "string"
  }), _dec44 = blockAttribute({
    type: "string"
  }), _dec45 = blockAttribute({
    type: "string"
  }), _dec46 = blockAttribute({
    type: "boolean"
  }), _dec47 = blockAttribute({
    type: "boolean"
  }), _dec48 = blockAttribute({
    type: "number"
  }), _dec49 = blockAttribute({
    type: "string"
  }), _dec50 = blockAttribute({
    type: "object",
    isPublic: true
  }), _dec51 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec52 = blockAttribute({
    type: "string"
  }), _dec53 = blockAttribute({
    type: "string"
  }), _dec54 = blockAttribute({
    type: "boolean"
  }), _dec55 = blockAggregation({
    type: "sap.fe.macros.internal.table.Action | sap.fe.macros.internal.table.ActionGroup",
    isPublic: true,
    processAggregations: setCustomActionProperties
  }), _dec56 = blockAggregation({
    type: "sap.fe.macros.internal.table.Column",
    isPublic: true,
    hasVirtualNode: true,
    processAggregations: setCustomColumnProperties
  }), _dec57 = blockEvent(), _dec58 = blockEvent(), _dec59 = blockEvent(), _dec60 = blockEvent(), _dec61 = blockEvent(), _dec62 = blockEvent(), _dec63 = blockEvent(), _dec64 = blockEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(TableBlock, _BuildingBlockBase);
    //  *************** Public & Required Attributes ********************

    //  *************** Public Attributes ********************
    /**
     *The `busy` mode of table
     */

    /**
     * Parameter used to show the fullScreen button on the table.
     */

    /**
     * Enable export to file
     */

    /**
     * Number of columns that are fixed on the left. Only columns which are not fixed can be scrolled horizontally.
     */

    /**
     * Enable export to file
     */

    /**
     * The control ID of the FilterBar that is used to filter the rows of the table.
     */

    /**
     * Specifies header text that is shown in table.
     */

    /**
     * Defines the "aria-level" of the table header
     */

    /**
     * Controls if the header text should be shown or not
     */

    /**
     * Personalization Mode
     */

    /**
     * Specifies whether the table should be read-only or not.
     */

    /**
     * Allows to choose the Table type. Allowed values are `ResponsiveTable` or `GridTable`.
     */

    /**
     * Specifies whether the table is displayed with condensed layout (true/false). The default setting is `false`.
     */

    /**
     * Specifies the selection mode (None,Single,Multi,Auto)
     */

    //  *************** Private & Required Attributes ********************

    //  *************** Private Attributes ********************

    /**
     * Setting to determine if the new row should be created at the end or beginning
     */

    /**
     * Creation Mode to be passed to the onCreate handler. Values: ["Inline", "NewPage"]
     */

    /**
     * Specifies the full path and function name of a custom validation function.
     */

    /**
     * Specifies whether the button is hidden when no data has been entered yet in the row (true/false). The default setting is `false`.
     */

    /**
     * The control ID of the FilterBar that is used internally to filter the rows of the table.
     */

    /**
     * ONLY FOR RESPONSIVE TABLE: Setting to define the checkbox in the column header: Allowed values are `Default` or `ClearAll`. If set to `Default`, the sap.m.Table control renders the Select All checkbox, otherwise the Deselect All button is rendered.
     */

    /**
     * Used for binding the table to a navigation path. Only the path is used for binding rows.
     */

    /**
     * Parameter which sets the noDataText for the mdc table
     */

    /**
     * Specifies the possible actions available on the table row (Navigation,null). The default setting is `undefined`
     */

    /**
     * ONLY FOR GRID TABLE: Number of indices which can be selected in a range. If set to 0, the selection limit is disabled, and the Select All checkbox appears instead of the Deselect All button.
     */

    // We require tableDefinition to be there even though it is not formally required

    /**
     * Event handler to react when the user chooses a row
     */

    /**
     * Event handler to react to the contextChange event of the table.
     */

    /**
     *  Event handler for change event.
     */

    /**
     * Event handler called when the user chooses an option of the segmented button in the ALP View
     */

    /**
     * Event handler to react to the stateChange event of the table.
     */

    /**
     * Event handler to react when the table selection changes
     */

    function TableBlock(props, controlConfiguration, settings) {
      var _this$contextPath, _this$tableDefinition2, _this$tableDefinition3;
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "metaPath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "busy", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFullScreen", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableExport", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "frozenColumnCount", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enablePaste", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerLevel", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isSearchable", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "type", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useCondensedLayout", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collection", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_apiId", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "autoBindOnInit", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "columnEditMode", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "createAtEnd", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "createNewAction", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "creationMode", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "createOutbound", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "customValidationFunction", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataStateIndicatorFilter", _descriptor29, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "disableAddRowButtonForEmptyData", _descriptor30, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableAutoColumnWidth", _descriptor31, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableAutoScroll", _descriptor32, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fieldMode", _descriptor33, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBarId", _descriptor34, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "inlineCreationRowCount", _descriptor35, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isAlp", _descriptor36, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isCompactType", _descriptor37, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isOptimizedForSmallDevice", _descriptor38, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "multiSelectMode", _descriptor39, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPath", _descriptor40, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "noDataText", _descriptor41, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "rowAction", _descriptor42, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableType", _descriptor43, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "updatablePropertyPath", _descriptor44, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useBasicSearch", _descriptor45, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "searchable", _descriptor46, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionLimit", _descriptor47, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showCreate", _descriptor48, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDefinition", _descriptor49, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDefinitionContext", _descriptor50, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDelegate", _descriptor51, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tabTitle", _descriptor52, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor53, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor54, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "columns", _descriptor55, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "rowPress", _descriptor56, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onContextChange", _descriptor57, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor58, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onSegmentedButtonPressed", _descriptor59, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSaved", _descriptor60, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor61, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor62, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantSelected", _descriptor63, _assertThisInitialized(_this));
      _this.getTableType = () => {
        const collection = _this.collection.getObject();
        switch (_this.tableType) {
          case "GridTable":
            return xml`<mdcTable:GridTableType
                rowCountMode="${_this.tableDefinition.control.rowCountMode}"
                rowCount="${_this.tableDefinition.control.rowCount}"
                selectionLimit="${_this.selectionLimit}"
				fixedColumnCount="${_this.tableDefinition.control.frozenColumnCount}"
            />`;
          case "TreeTable":
            return xml`<mdcTable:TreeTableType
                rowCountMode="${_this.tableDefinition.control.rowCountMode}"
                rowCount="${_this.tableDefinition.control.rowCount}"
				fixedColumnCount="${_this.tableDefinition.control.frozenColumnCount}"
            />`;
          default:
            const growingMode = collection.$kind === "EntitySet" ? "Scroll" : undefined;
            return xml`<mdcTable:ResponsiveTableType
                showDetailsButton="true"
                detailsButtonSetting="{=['Low', 'Medium', 'None']}"
                growingMode="${growingMode}"
            />`;
        }
      };
      _this.getDependents = () => {
        var _this$tableDefinition;
        let dependents = ``;
        if (!_this.readOnly && (_this$tableDefinition = _this.tableDefinition) !== null && _this$tableDefinition !== void 0 && _this$tableDefinition.columns) {
          for (const column of _this.tableDefinition.columns) {
            if (column.availability === "Default" && "annotationPath" in column) {
              dependents += _this.getValueHelp(column);
            }
          }
        }
        const standardActions = _this.tableDefinition.annotation.standardActions.actions;
        if (_this.tableDefinition.annotation.standardActions.isInsertUpdateTemplated && standardActions.create.isTemplated === "true") {
          dependents += xml`<control:CommandExecution
                                execute="${TableHelper.pressEventForCreateButton(_assertThisInitialized(_this), true)}"
                                visible="${standardActions.create.visible}"
                                enabled="${standardActions.create.enabled}"
                                command="Create"
                            />`;
        }
        if (standardActions.delete.isTemplated === "true") {
          var _ref, _ref$annotations, _ref$annotations$UI, _this$collectionEntit, _this$collectionEntit2;
          const headerInfo = (_ref = ((_this$collectionEntit = _this.collectionEntity) === null || _this$collectionEntit === void 0 ? void 0 : _this$collectionEntit.entityType) || ((_this$collectionEntit2 = _this.collectionEntity) === null || _this$collectionEntit2 === void 0 ? void 0 : _this$collectionEntit2.targetType)) === null || _ref === void 0 ? void 0 : (_ref$annotations = _ref.annotations) === null || _ref$annotations === void 0 ? void 0 : (_ref$annotations$UI = _ref$annotations.UI) === null || _ref$annotations$UI === void 0 ? void 0 : _ref$annotations$UI.HeaderInfo;
          dependents += xml`<control:CommandExecution
                        execute="${TableHelper.pressEventForDeleteButton(_assertThisInitialized(_this), _this.collectionEntity.name, headerInfo, _this.contextObjectPath)}"
                        visible="${standardActions.delete.visible}"
                        enabled="${standardActions.delete.enabled}"
                        command="DeleteEntry"
                        />`;
        }
        for (const actionName in _this.tableDefinition.commandActions) {
          const action = _this.tableDefinition.commandActions[actionName];
          dependents += `${_this.getActionCommand(actionName, action)}`;
        }
        dependents += `<control:CommandExecution execute="TableRuntime.displayTableSettings" command="TableSettings" />`;
        if (_this.variantManagement === "None") {
          dependents += `<!-- Persistence provider offers persisting personalization changes without variant management -->
			<p13n:PersistenceProvider id="${generate([_this.id, "PersistenceProvider"])}" for="${_this.id}" />`;
        }
        return xml`${dependents}`;
      };
      _this.getActions = () => {
        let dependents = "";
        if (_this.onSegmentedButtonPressed) {
          dependents = `<mdcat:ActionToolbarAction
            layoutInformation="{
                    aggregationName: 'end',
                    alignment: 'End'
                }"
            visible="{= \${pageInternal>alpContentView} === 'Table' }"
        >
            <SegmentedButton
                id="${generate([_this.id, "SegmentedButton", "TemplateContentView"])}"
                select="${_this.onSegmentedButtonPressed}"
                selectedKey="{pageInternal>alpContentView}"
            >
                <items>`;
          if (CommonHelper.isDesktop()) {
            dependents += `<SegmentedButtonItem
                            tooltip="{sap.fe.i18n>M_COMMON_HYBRID_SEGMENTED_BUTTON_ITEM_TOOLTIP}"
							key = "Hybrid"
							icon = "sap-icon://chart-table-view"
							/>`;
          }
          dependents += `<SegmentedButtonItem
                        tooltip="{sap.fe.i18n>M_COMMON_CHART_SEGMENTED_BUTTON_ITEM_TOOLTIP}"
                        key="Chart"
                        icon="sap-icon://bar-chart"
                    />
                    <SegmentedButtonItem
                        tooltip="{sap.fe.i18n>M_COMMON_TABLE_SEGMENTED_BUTTON_ITEM_TOOLTIP}"
                        key="Table"
                        icon="sap-icon://table-view"
                    />
                </items>
            </SegmentedButton>
        </mdcat:ActionToolbarAction>`;
        }
        dependents += `${getTableActionTemplate(_assertThisInitialized(_this))}`;
        return xml`${dependents}`;
      };
      const contextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      _this.contextObjectPath = contextObjectPath;
      const pageContext = settings.bindingContexts.converterContext;
      _this.pageTemplateType = pageContext === null || pageContext === void 0 ? void 0 : pageContext.getObject("/templateType");
      const tableDefinition = TableBlock.setUpTableDefinition(_assertThisInitialized(_this), settings);
      _this.collection = settings.models.metaModel.createBindingContext(tableDefinition.annotation.collection);
      _this.convertedMetaData = _this.contextObjectPath.convertedTypes;
      _this.collectionEntity = _this.convertedMetaData.resolvePath(_this.tableDefinition.annotation.collection).target;
      _this.setUpId();
      const converterContext = _this.getConverterContext(_this.contextObjectPath, (_this$contextPath = _this.contextPath) === null || _this$contextPath === void 0 ? void 0 : _this$contextPath.getPath(), settings);
      _this._collectionIsDraftEnabled = converterContext.getManifestWrapper().isFilterBarHidden() && ModelHelper.isDraftNode(_this.collectionEntity) || ModelHelper.isDraftRoot(_this.collectionEntity);
      _this.selectionMode = _this.tableDefinition.annotation.selectionMode;
      _this.enableFullScreen = _this.tableDefinition.control.enableFullScreen;
      _this.enableExport = _this.tableDefinition.control.enableExport;
      _this.enablePaste = _this.tableDefinition.annotation.standardActions.actions.paste.enabled;
      _this.frozenColumnCount = _this.tableDefinition.control.frozenColumnCount;
      _this.updatablePropertyPath = _this.tableDefinition.annotation.standardActions.updatablePropertyPath;
      _this.type = _this.tableDefinition.control.type;
      _this.disableAddRowButtonForEmptyData ??= _this.tableDefinition.control.disableAddRowButtonForEmptyData;
      _this.customValidationFunction ??= _this.tableDefinition.control.customValidationFunction;
      _this.headerVisible ??= _this.tableDefinition.control.headerVisible;
      _this.searchable ??= _this.tableDefinition.annotation.searchable;
      _this.inlineCreationRowCount ??= _this.tableDefinition.control.inlineCreationRowCount;
      _this.header ??= _this.tableDefinition.annotation.title;
      _this.selectionLimit ??= _this.tableDefinition.control.selectionLimit;
      _this.isCompactType ??= _this.tableDefinition.control.isCompactType;
      _this.creationMode ??= _this.tableDefinition.annotation.create.mode;
      _this.createAtEnd ??= _this.tableDefinition.annotation.create.append;
      _this.createOutbound ??= _this.tableDefinition.annotation.create.outbound;
      _this.createNewAction ??= _this.tableDefinition.annotation.create.newAction;
      _this.createOutboundDetail ??= _this.tableDefinition.annotation.create.outboundDetail;
      _this.personalization ??= _this.tableDefinition.annotation.p13nMode;
      _this.variantManagement ??= _this.tableDefinition.annotation.variantManagement;
      _this.enableAutoColumnWidth ??= true;
      _this.dataStateIndicatorFilter ??= _this.tableDefinition.control.dataStateIndicatorFilter;
      _this.isOptimizedForSmallDevice ??= CommonUtils.isSmallDevice();
      _this.navigationPath = tableDefinition.annotation.navigationPath;
      if (tableDefinition.annotation.collection.startsWith("/") && isSingleton(contextObjectPath.startingEntitySet)) {
        tableDefinition.annotation.collection = _this.navigationPath;
      }
      _this.setReadOnly();
      if (_this.rowPress) {
        _this.rowAction = "Navigation";
      }
      _this.rowPress ??= (_this$tableDefinition2 = _this.tableDefinition.annotation.row) === null || _this$tableDefinition2 === void 0 ? void 0 : _this$tableDefinition2.press;
      _this.rowAction ??= (_this$tableDefinition3 = _this.tableDefinition.annotation.row) === null || _this$tableDefinition3 === void 0 ? void 0 : _this$tableDefinition3.action;
      if (_this.personalization === "false") {
        _this.personalization = undefined;
      } else if (_this.personalization === "true") {
        _this.personalization = "Sort,Column,Filter";
      }
      switch (_this.personalization) {
        case "false":
          _this.personalization = undefined;
          break;
        case "true":
          _this.personalization = "Sort,Column,Filter";
          break;
        default:
      }
      if (_this.isSearchable === false) {
        _this.searchable = false;
      } else {
        _this.searchable = _this.tableDefinition.annotation.searchable;
      }
      let useBasicSearch = false;

      // Note for the 'filterBar' property:
      // 1. ID relative to the view of the Table.
      // 2. Absolute ID.
      // 3. ID would be considered in association to TableAPI's ID.
      if (!_this.filterBar && !_this.filterBarId && _this.searchable) {
        // filterBar: Public property for building blocks
        // filterBarId: Only used as Internal private property for FE templates
        _this.filterBarId = generate([_this.id, "StandardAction", "BasicSearch"]);
        useBasicSearch = true;
      }
      // Internal properties
      _this.useBasicSearch = useBasicSearch;
      _this.tableType = _this.type;
      _this.showCreate = _this.tableDefinition.annotation.standardActions.actions.create.visible || true;
      _this.autoBindOnInit = _this.tableDefinition.annotation.autoBindOnInit;
      switch (_this.readOnly) {
        case true:
          _this.columnEditMode = "Display";
          break;
        case false:
          _this.columnEditMode = "Editable";
          break;
        default:
          _this.columnEditMode = undefined;
      }
      return _this;
    }

    /**
     * Returns the annotation path pointing to the visualization annotation (LineItem).
     *
     * @param contextObjectPath The datamodel object path for the table
     * @param converterContext The converter context
     * @returns The annotation path
     */
    _exports = TableBlock;
    TableBlock.getVisualizationPath = function getVisualizationPath(contextObjectPath, converterContext) {
      const metaPath = getContextRelativeTargetObjectPath(contextObjectPath);

      // fallback to default LineItem if metapath is not set
      if (!metaPath) {
        Log.error(`Missing meta path parameter for LineItem`);
        return `@${"com.sap.vocabularies.UI.v1.LineItem"}`;
      }
      if (contextObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.LineItem") {
        return metaPath; // MetaPath is already pointing to a LineItem
      }
      //Need to switch to the context related the PV or SPV
      const resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);
      let visualizations = [];
      switch (contextObjectPath.targetObject.term) {
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          if (contextObjectPath.targetObject.PresentationVariant) {
            visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject.PresentationVariant, metaPath, resolvedTarget.converterContext, true);
          }
          break;
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject, metaPath, resolvedTarget.converterContext, true);
          break;
        default:
          Log.error(`Bad metapath parameter for table : ${contextObjectPath.targetObject.term}`);
      }
      const lineItemViz = visualizations.find(viz => {
        return viz.visualization.term === "com.sap.vocabularies.UI.v1.LineItem";
      });
      if (lineItemViz) {
        return lineItemViz.annotationPath;
      } else {
        // fallback to default LineItem if annotation missing in PV
        Log.error(`Bad meta path parameter for LineItem: ${contextObjectPath.targetObject.term}`);
        return `@${"com.sap.vocabularies.UI.v1.LineItem"}`; // Fallback
      }
    };
    TableBlock.getPresentationPath = function getPresentationPath(contextObjectPath) {
      var _contextObjectPath$ta;
      let presentationPath;
      switch ((_contextObjectPath$ta = contextObjectPath.targetObject) === null || _contextObjectPath$ta === void 0 ? void 0 : _contextObjectPath$ta.term) {
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          presentationPath = getContextRelativeTargetObjectPath(contextObjectPath);
          break;
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          presentationPath = getContextRelativeTargetObjectPath(contextObjectPath) + "/PresentationVariant";
          break;
      }
      return presentationPath;
    };
    TableBlock.setUpTableDefinition = function setUpTableDefinition(table, settings) {
      let tableDefinition = table.tableDefinition;
      if (!tableDefinition) {
        var _table$contextPath, _table$contextPath2;
        const initialConverterContext = table.getConverterContext(table.contextObjectPath, (_table$contextPath = table.contextPath) === null || _table$contextPath === void 0 ? void 0 : _table$contextPath.getPath(), settings);
        const visualizationPath = TableBlock.getVisualizationPath(table.contextObjectPath, initialConverterContext);
        const presentationPath = TableBlock.getPresentationPath(table.contextObjectPath);

        //Check if we have ActionGroup and add nested actions

        const extraParams = {};
        const tableSettings = {
          enableExport: table.enableExport,
          frozenColumnCount: table.frozenColumnCount,
          enableFullScreen: table.enableFullScreen,
          enablePaste: table.enablePaste,
          selectionMode: table.selectionMode,
          type: table.type
        };
        if (table.actions) {
          var _Object$values;
          (_Object$values = Object.values(table.actions)) === null || _Object$values === void 0 ? void 0 : _Object$values.forEach(item => {
            table.actions = {
              ...table.actions,
              ...item.menuContentActions
            };
            delete item.menuContentActions;
          });
        }

        // table actions and columns as {} if not provided to allow merge with manifest settings
        extraParams[visualizationPath] = {
          actions: table.actions || {},
          columns: table.columns || {},
          tableSettings: tableSettings
        };
        const converterContext = table.getConverterContext(table.contextObjectPath, (_table$contextPath2 = table.contextPath) === null || _table$contextPath2 === void 0 ? void 0 : _table$contextPath2.getPath(), settings, extraParams);
        const visualizationDefinition = getDataVisualizationConfiguration(visualizationPath, table.useCondensedLayout, converterContext, undefined, undefined, presentationPath, true);
        tableDefinition = visualizationDefinition.visualizations[0];
        table.tableDefinition = tableDefinition;
      }
      table.tableDefinitionContext = MacroAPI.createBindingContext(table.tableDefinition, settings);
      return tableDefinition;
    };
    var _proto = TableBlock.prototype;
    _proto.setUpId = function setUpId() {
      if (this.id) {
        // The given ID shall be assigned to the TableAPI and not to the MDC Table
        this._apiId = this.id;
        this.id = this.getContentId(this.id);
      } else {
        // We generate the ID. Due to compatibility reasons we keep it on the MDC Table but provide assign
        // the ID with a ::Table suffix to the TableAPI
        const tableDefinition = this.tableDefinition;
        this.id ??= tableDefinition.annotation.id;
        this._apiId = generate([tableDefinition.annotation.id, "Table"]);
      }
    };
    _proto.setReadOnly = function setReadOnly() {
      // Special code for readOnly
      // readonly = false -> Force editable
      // readonly = true -> Force display mode
      // readonly = undefined -> Bound to edit flow
      if (this.readOnly === undefined && this.tableDefinition.annotation.displayMode === true) {
        this.readOnly = true;
      }
    };
    _proto._getEntityType = function _getEntityType() {
      var _this$collectionEntit3, _this$collectionEntit4;
      return ((_this$collectionEntit3 = this.collectionEntity) === null || _this$collectionEntit3 === void 0 ? void 0 : _this$collectionEntit3.entityType) || ((_this$collectionEntit4 = this.collectionEntity) === null || _this$collectionEntit4 === void 0 ? void 0 : _this$collectionEntit4.targetType);
    }

    /**
     * Generates the template string for the valueHelp based on the dataField path.
     *
     * @param datFieldPath DatFieldPath to be evaluated
     * @returns The xml string representation of the valueHelp
     */;
    _proto.getValueHelpTemplateFromPath = function getValueHelpTemplateFromPath(datFieldPath) {
      return datFieldPath ? `<macros:ValueHelp
        idPrefix="${generate([this.id, "TableValueHelp"])}"
        property="${datFieldPath}/Value"
    />` : "";
    }

    /**
     * Generates the template string for the valueHelp based on column.
     *
     * @param column Column to be evaluated
     * @returns The xml string representation of the valueHelp
     */;
    _proto.getValueHelp = function getValueHelp(column) {
      const dataFieldObject = this.convertedMetaData.resolvePath(column.annotationPath).target;
      if (isDataFieldForAnnotation(dataFieldObject) && dataFieldObject.Target.$target.term === "com.sap.vocabularies.UI.v1.Chart") {
        return ``;
      } else if (isDataFieldForAnnotation(dataFieldObject) && dataFieldObject.Target.$target.term === "com.sap.vocabularies.UI.v1.FieldGroup") {
        let template = ``;
        for (const index in dataFieldObject.Target.$target.Data) {
          template += this.getValueHelpTemplateFromPath(column.annotationPath + "/Target/$AnnotationPath/Data/" + index);
        }
        return xml`${template}`;
      } else {
        return xml`${this.getValueHelpTemplateFromPath(column.annotationPath)}`;
      }
    };
    /**
     * Generates the template string for the actionCommand.
     *
     * @param actionName The name of the action
     * @param action Action to be evaluated
     * @returns The xml string representation of the actionCommand
     */
    _proto.getActionCommand = function getActionCommand(actionName, action) {
      var _ActionTarget, _ActionTarget2, _ActionTarget2$annota, _ActionTarget2$annota2, _ActionTarget2$annota3;
      const dataField = action.annotationPath ? this.convertedMetaData.resolvePath(action.annotationPath).target : undefined;
      const actionContextPath = action.annotationPath ? CommonHelper.getActionContext(this.metaPath.getModel().createBindingContext(action.annotationPath + "/Action")) : undefined;
      const actionContext = this.metaPath.getModel().createBindingContext(actionContextPath);
      const dataFieldDataModelObjectPath = actionContext ? MetaModelConverter.getInvolvedDataModelObjects(actionContext, this.collection) : undefined;
      const isBound = dataField === null || dataField === void 0 ? void 0 : (_ActionTarget = dataField.ActionTarget) === null || _ActionTarget === void 0 ? void 0 : _ActionTarget.isBound;
      const isOperationAvailable = (dataField === null || dataField === void 0 ? void 0 : (_ActionTarget2 = dataField.ActionTarget) === null || _ActionTarget2 === void 0 ? void 0 : (_ActionTarget2$annota = _ActionTarget2.annotations) === null || _ActionTarget2$annota === void 0 ? void 0 : (_ActionTarget2$annota2 = _ActionTarget2$annota.Core) === null || _ActionTarget2$annota2 === void 0 ? void 0 : (_ActionTarget2$annota3 = _ActionTarget2$annota2.OperationAvailable) === null || _ActionTarget2$annota3 === void 0 ? void 0 : _ActionTarget2$annota3.valueOf()) !== false;
      const displayCommandAction = action.type === "ForAction" ? isBound !== true || isOperationAvailable : true;
      if (displayCommandAction) {
        return xml`<internalMacro:ActionCommand
							action="{tableDefinition>commandActions/${actionName}}"
							onExecuteAction="${TableHelper.pressEventDataFieldForActionButton({
          contextObjectPath: this.contextObjectPath,
          id: this.id
        }, dataField, this.collectionEntity.name, this.tableDefinition.operationAvailableMap, actionContext === null || actionContext === void 0 ? void 0 : actionContext.getObject(), action.isNavigable, action.enableAutoScroll, action.defaultValuesExtensionFunction)}"
							onExecuteIBN="${CommonHelper.getPressHandlerForDataFieldForIBN(dataField, "${internal>selectedContexts}", !this.tableDefinition.enableAnalytics)}"
							onExecuteManifest="${action.noWrap ? action.press : CommonHelper.buildActionWrapper(action, this)}"
							isIBNEnabled="${action.enabled ?? TableHelper.isDataFieldForIBNEnabled(this, dataField, !!dataField.RequiresContext, dataField.NavigationAvailable)}"
							isActionEnabled="${action.enabled ?? TableHelper.isDataFieldForActionEnabled(this.tableDefinition, dataField.Action, !!isBound, actionContextPath, action.enableOnSelect, dataFieldDataModelObjectPath === null || dataFieldDataModelObjectPath === void 0 ? void 0 : dataFieldDataModelObjectPath.targetEntityType)}"
							/>`;
      }
      return ``;
    };
    /**
     * Generates the template string for the CreationRow.
     *
     * @returns The xml string representation of the CreationRow
     */
    _proto.getCreationRow = function getCreationRow() {
      if (this.creationMode === "CreationRow") {
        const creationRowAction = this.tableDefinition.annotation.standardActions.actions.creationRow;
        if (creationRowAction.isTemplated) {
          return xml`<mdc:creationRow>
							<mdcTable:CreationRow
								id="${generate([this.id, "CreationRow"])}"
								visible="${creationRowAction.visible}"
								apply="${TableHelper.pressEventForCreateButton(this, false)}"
								applyEnabled="${creationRowAction.enabled}"
								macrodata:disableAddRowButtonForEmptyData="${this.disableAddRowButtonForEmptyData}"
								macrodata:customValidationFunction="${this.customValidationFunction}"
							/>
					   	   </mdc:creationRow>`;
        }
      }
      return "";
    };
    _proto.getRowSetting = function getRowSetting() {
      var _this$tableDefinition4, _this$tableDefinition5;
      let rowSettingsTemplate = `<mdcTable:RowSettings
        navigated="${(_this$tableDefinition4 = this.tableDefinition.annotation.row) === null || _this$tableDefinition4 === void 0 ? void 0 : _this$tableDefinition4.rowNavigated}"
        highlight="${(_this$tableDefinition5 = this.tableDefinition.annotation.row) === null || _this$tableDefinition5 === void 0 ? void 0 : _this$tableDefinition5.rowHighlighting}"
        >`;
      if (this.rowAction === "Navigation") {
        var _this$tableDefinition6;
        rowSettingsTemplate += `<mdcTable:rowActions>
                <mdcTable:RowActionItem
                    type = "${this.rowAction}"
                    press = "${this.tableType === "ResponsiveTable" ? "" : this.rowPress}"
                    visible = "${(_this$tableDefinition6 = this.tableDefinition.annotation.row) === null || _this$tableDefinition6 === void 0 ? void 0 : _this$tableDefinition6.visible}"
                    />
                </mdcTable:rowActions>`;
      }
      rowSettingsTemplate += `</mdcTable:RowSettings>`;
      return xml`${rowSettingsTemplate}`;
    };
    _proto.getVariantManagement = function getVariantManagement() {
      if (this.variantManagement === "Control") {
        return xml`<mdc:variant>
                        <variant:VariantManagement
                            id="${generate([this.id, "VM"])}"
                            for="{this>id}"
                            showSetAsDefault="true"
                            select="{this>variantSelected}"
                            headerLevel="${this.headerLevel}"
                            save="${this.variantSaved}"
                        />
                    </mdc:variant>`;
      }
      return "";
    };
    _proto.getQuickFilter = function getQuickFilter() {
      var _this$tableDefinition7;
      if ((_this$tableDefinition7 = this.tableDefinition.control.filters) !== null && _this$tableDefinition7 !== void 0 && _this$tableDefinition7.quickFilters) {
        const quickFilters = this.tableDefinition.control.filters.quickFilters;
        return xml`<mdc:quickFilter>
						<macroTable:QuickFilterSelector
							id="${generate([this.id, "QuickFilterContainer"])}"
							metaPath="${this.metaPath}"
							filterConfiguration="${quickFilters}"
							onSelectionChange="API.onQuickFilterSelectionChange"
						/>
					</mdc:quickFilter>`;
      }
      return "";
    };
    _proto.getEmptyRowsEnabled = function getEmptyRowsEnabled() {
      return this.creationMode === CreationMode.InlineCreationRows ? this.tableDefinition.annotation.standardActions.actions.create.enabled : undefined;
    };
    _proto.getTemplate = function getTemplate() {
      var _this$tableDefinition8, _annotations$Capabili, _annotations$Capabili2, _annotations$Capabili3, _TableHelper$getDeleg, _this$isAlp, _annotations$Common, _this$metaPath, _this$contextPath2, _this$tableDefinition9;
      const headerBindingExpression = buildExpressionForHeaderVisible(this);
      if (this.rowPress) {
        this.rowAction = "Navigation";
      }
      this.rowPress ??= (_this$tableDefinition8 = this.tableDefinition.annotation.row) === null || _this$tableDefinition8 === void 0 ? void 0 : _this$tableDefinition8.press;
      const collectionDeletablePath = (_annotations$Capabili = this.collectionEntity.annotations.Capabilities) === null || _annotations$Capabili === void 0 ? void 0 : (_annotations$Capabili2 = _annotations$Capabili.DeleteRestrictions) === null || _annotations$Capabili2 === void 0 ? void 0 : (_annotations$Capabili3 = _annotations$Capabili2.Deletable) === null || _annotations$Capabili3 === void 0 ? void 0 : _annotations$Capabili3.path;
      const lineItem = TableHelper.getUiLineItemObject(this.metaPath, this.convertedMetaData);
      const delegate = (_TableHelper$getDeleg = TableHelper.getDelegate) === null || _TableHelper$getDeleg === void 0 ? void 0 : _TableHelper$getDeleg.call(TableHelper, this.tableDefinition, (_this$isAlp = this.isAlp) === null || _this$isAlp === void 0 ? void 0 : _this$isAlp.toString(), this.tableDefinition.annotation.entityName);
      const selectionChange = `TableRuntime.setContexts(\${$source>/}, '${collectionDeletablePath}', '${(_annotations$Common = this.collectionEntity.annotations.Common) === null || _annotations$Common === void 0 ? void 0 : _annotations$Common.DraftRoot}', '${this.tableDefinition.operationAvailableMap}', '${TableHelper.getNavigationAvailableMap(lineItem)}', '${ActionHelper.getMultiSelectDisabledActions(lineItem)}', '${this.updatablePropertyPath}')`;
      const entityType = this._getEntityType();
      const modelContextChange = this.tableType === "TreeTable" ? `TableRuntime.onTreeTableContextChanged(\${$source>/}, ${this.tableDefinition.annotation.initialExpansionLevel})` : undefined;
      return xml`
            <macroTable:TableAPI
                xmlns="sap.m"
                xmlns:mdc="sap.ui.mdc"
                xmlns:plugins="sap.m.plugins"
                xmlns:mdcTable="sap.ui.mdc.table"
                xmlns:macroTable="sap.fe.macros.table"
                xmlns:mdcat="sap.ui.mdc.actiontoolbar"
                xmlns:core="sap.ui.core"
                xmlns:control="sap.fe.core.controls"
                xmlns:dt="sap.ui.dt"
                xmlns:fl="sap.ui.fl"
                xmlns:variant="sap.ui.fl.variants"
                xmlns:p13n="sap.ui.mdc.p13n"
                xmlns:internalMacro="sap.fe.macros.internal"
                xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
                xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
                binding="{internal>controls/${this.id}}"
                id="${this._apiId}"
                tableDefinition="{_pageModel>${this.tableDefinitionContext.getPath()}}"
                entityTypeFullyQualifiedName="${entityType === null || entityType === void 0 ? void 0 : entityType.fullyQualifiedName}"
                metaPath="${(_this$metaPath = this.metaPath) === null || _this$metaPath === void 0 ? void 0 : _this$metaPath.getPath()}"
                contextPath="${(_this$contextPath2 = this.contextPath) === null || _this$contextPath2 === void 0 ? void 0 : _this$contextPath2.getPath()}"
                stateChange="${this.stateChange}"
                selectionChange="${this.selectionChange}"
				contextChange="${this.onContextChange}"
                readOnly="${this.readOnly}"
                filterBar="${this.filterBar}"
                macrodata:tableAPILocalId="${this._apiId}"
                emptyRowsEnabled="${this.getEmptyRowsEnabled()}"
                enableAutoColumnWidth="${this.enableAutoColumnWidth}"
                isOptimizedForSmallDevice="${this.isOptimizedForSmallDevice}"
            >
				<template:with path="collection>${CommonHelper.getTargetCollectionPath(this.collection)}" var="targetCollection">
                <macroTable:layoutData>
                    <FlexItemData maxWidth="100%" />
                </macroTable:layoutData>
                <!-- macrodata has to be an expression binding if it needs to be set as attribute via change handler during templating -->
                    <mdc:Table
                        unittest:id="TableMacroFragment"
                        core:require="{TableRuntime: 'sap/fe/macros/table/TableRuntime', API: 'sap/fe/macros/table/TableAPI'}"
                        fl:flexibility="{this>fl:flexibility}"
                        sortConditions="${this.tableDefinition.annotation.sortConditions}"
                        groupConditions="${CommonHelper.stringifyObject(this.tableDefinition.annotation.groupConditions)}"
                        aggregateConditions="${CommonHelper.stringifyObject(this.tableDefinition.annotation.aggregateConditions)}"
                        dt:designtime="${this.variantManagement === "None" ? "not-adaptable" : undefined}"
                        macrodata:kind="${this.collectionEntity._type}"
                        macrodata:navigationPath="${this.navigationPath}"
                        id="${this.id}"
                        busy="${this.busy}"
                        busyIndicatorDelay="0"
                        enableExport="${this.enableExport}"
                        delegate="${delegate}"
                        rowPress="${this.rowPress}"
                        height="100%"
                        autoBindOnInit="${this.autoBindOnInit && !this.filterBar}"
                        selectionMode="${this.selectionMode || "None"}"
                        selectionChange="${selectionChange}"
                        showRowCount="${this.tableDefinition.control.showRowCount}"
                        ${this.attr("header", this.header)}
                        headerVisible="${headerBindingExpression}"
                        headerLevel="${this.headerLevel}"
                        threshold="${this.tableDefinition.annotation.threshold}"
                        noData="${this.noDataText}"
                        p13nMode="${this.personalization}"
                        filter="${this.filterBarId}"
                        paste="API.onPaste($event, $controller)"
                        beforeExport="API.onBeforeExport($event)"
                        class="${this.tableDefinition.control.useCondensedTableLayout === true ? "sapUiSizeCondensed" : undefined}"
                        multiSelectMode="${this.tableDefinition.control.multiSelectMode}"
                        showPasteButton="${this.tableDefinition.annotation.standardActions.actions.paste.visible}"
                        enablePaste="${this.tableDefinition.annotation.standardActions.actions.paste.enabled}"
                        macrodata:rowsBindingInfo="${TableHelper.getRowsBindingInfo(this)}"
                        macrodata:enableAnalytics="${this.tableDefinition.enableAnalytics}"
                        macrodata:creationMode="${this.creationMode}"
                        macrodata:inlineCreationRowCount="${this.inlineCreationRowCount}"
                        macrodata:showCreate="${this.showCreate}"
                        macrodata:createAtEnd="${this.createAtEnd}"
                        macrodata:enableAutoScroll="${this.enableAutoScroll}"
                        macrodata:displayModePropertyBinding="${this.readOnly}"
                        macrodata:tableType="${this.tableType}"
                        macrodata:targetCollectionPath="${CommonHelper.getContextPath(null, {
        context: this.collection
      })}"
                        macrodata:entityType="${CommonHelper.getContextPath(null, {
        context: this.collection
      }) + "/"}"
                        macrodata:metaPath="${CommonHelper.getContextPath(null, {
        context: this.collection
      })}"
                        macrodata:onChange="${this.onChange}"
                        macrodata:hiddenFilters="${TableHelper.formatHiddenFilters((_this$tableDefinition9 = this.tableDefinition.control.filters) === null || _this$tableDefinition9 === void 0 ? void 0 : _this$tableDefinition9.hiddenFilters)}"
                        macrodata:requestGroupId="$auto.Workers"
                        macrodata:segmentedButtonId="${generate([this.id, "SegmentedButton", "TemplateContentView"])}"
                        macrodata:enablePaste="${this.enablePaste}"
                        macrodata:operationAvailableMap="${CommonHelper.stringifyCustomData(this.tableDefinition.operationAvailableMap)}"
                        visible="${this.visible}"
						modelContextChange="${modelContextChange}"
                    >
                        <mdc:dataStateIndicator>
                            <plugins:DataStateIndicator
                                filter="${this.dataStateIndicatorFilter}"
                                enableFiltering="true"
                                dataStateChange="API.onDataStateChange"
                            />
                        </mdc:dataStateIndicator>
                        <mdc:type>
                            ${this.getTableType()}
                        </mdc:type>
                        <mdc:dependents>
                            ${this.getDependents()}
                        </mdc:dependents>
                        <mdc:actions>
                            ${this.getActions()}
                        </mdc:actions>
                        <mdc:rowSettings>
                        ${this.getRowSetting()}
                        </mdc:rowSettings>
                        <mdc:columns>
                            <core:Fragment fragmentName="sap.fe.macros.table.Columns" type="XML" />
                        </mdc:columns>
                        ${this.getCreationRow()}
                        ${this.getVariantManagement()}
                        ${this.getQuickFilter()}
                    </mdc:Table>
				</template:with>
            </macroTable:TableAPI>
        `;
    };
    return TableBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "busy", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "enableFullScreen", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "enableExport", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "frozenColumnCount", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "enablePaste", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "headerLevel", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return TitleLevel.Auto;
    }
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "isSearchable", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "type", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "useCondensedLayout", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "collection", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "_apiId", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "autoBindOnInit", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "columnEditMode", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "createAtEnd", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "createNewAction", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "creationMode", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "createOutbound", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "customValidationFunction", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "dataStateIndicatorFilter", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "disableAddRowButtonForEmptyData", [_dec31], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor31 = _applyDecoratedDescriptor(_class2.prototype, "enableAutoColumnWidth", [_dec32], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor32 = _applyDecoratedDescriptor(_class2.prototype, "enableAutoScroll", [_dec33], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor33 = _applyDecoratedDescriptor(_class2.prototype, "fieldMode", [_dec34], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor34 = _applyDecoratedDescriptor(_class2.prototype, "filterBarId", [_dec35], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor35 = _applyDecoratedDescriptor(_class2.prototype, "inlineCreationRowCount", [_dec36], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor36 = _applyDecoratedDescriptor(_class2.prototype, "isAlp", [_dec37], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor37 = _applyDecoratedDescriptor(_class2.prototype, "isCompactType", [_dec38], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor38 = _applyDecoratedDescriptor(_class2.prototype, "isOptimizedForSmallDevice", [_dec39], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor39 = _applyDecoratedDescriptor(_class2.prototype, "multiSelectMode", [_dec40], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor40 = _applyDecoratedDescriptor(_class2.prototype, "navigationPath", [_dec41], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor41 = _applyDecoratedDescriptor(_class2.prototype, "noDataText", [_dec42], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor42 = _applyDecoratedDescriptor(_class2.prototype, "rowAction", [_dec43], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return undefined;
    }
  }), _descriptor43 = _applyDecoratedDescriptor(_class2.prototype, "tableType", [_dec44], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor44 = _applyDecoratedDescriptor(_class2.prototype, "updatablePropertyPath", [_dec45], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor45 = _applyDecoratedDescriptor(_class2.prototype, "useBasicSearch", [_dec46], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor46 = _applyDecoratedDescriptor(_class2.prototype, "searchable", [_dec47], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor47 = _applyDecoratedDescriptor(_class2.prototype, "selectionLimit", [_dec48], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor48 = _applyDecoratedDescriptor(_class2.prototype, "showCreate", [_dec49], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor49 = _applyDecoratedDescriptor(_class2.prototype, "tableDefinition", [_dec50], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor50 = _applyDecoratedDescriptor(_class2.prototype, "tableDefinitionContext", [_dec51], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor51 = _applyDecoratedDescriptor(_class2.prototype, "tableDelegate", [_dec52], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor52 = _applyDecoratedDescriptor(_class2.prototype, "tabTitle", [_dec53], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor53 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec54], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor54 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec55], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor55 = _applyDecoratedDescriptor(_class2.prototype, "columns", [_dec56], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor56 = _applyDecoratedDescriptor(_class2.prototype, "rowPress", [_dec57], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor57 = _applyDecoratedDescriptor(_class2.prototype, "onContextChange", [_dec58], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor58 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec59], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor59 = _applyDecoratedDescriptor(_class2.prototype, "onSegmentedButtonPressed", [_dec60], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor60 = _applyDecoratedDescriptor(_class2.prototype, "variantSaved", [_dec61], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor61 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec62], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor62 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec63], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor63 = _applyDecoratedDescriptor(_class2.prototype, "variantSelected", [_dec64], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = TableBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzZXRDdXN0b21BY3Rpb25Qcm9wZXJ0aWVzIiwiY2hpbGRBY3Rpb24iLCJtZW51Q29udGVudEFjdGlvbnMiLCJhY3QiLCJtZW51QWN0aW9ucyIsImFjdGlvbktleSIsImdldEF0dHJpYnV0ZSIsInJlcGxhY2UiLCJjaGlsZHJlbiIsImxlbmd0aCIsImxvY2FsTmFtZSIsIm5hbWVzcGFjZVVSSSIsImluZGV4T2YiLCJhY3Rpb25zVG9BZGQiLCJBcnJheSIsInByb3RvdHlwZSIsInNsaWNlIiwiYXBwbHkiLCJhY3Rpb25JZHgiLCJyZWR1Y2UiLCJhY2MiLCJhY3RUb0FkZCIsImFjdGlvbktleUFkZCIsImN1ck91dE9iamVjdCIsImtleSIsInRleHQiLCJfX25vV3JhcCIsInByZXNzIiwicmVxdWlyZXNTZWxlY3Rpb24iLCJlbmFibGVkIiwiT2JqZWN0IiwidmFsdWVzIiwibWFwIiwibWVudUl0ZW0iLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsImFuY2hvciIsIm1lbnUiLCJzZXRDdXN0b21Db2x1bW5Qcm9wZXJ0aWVzIiwiY2hpbGRDb2x1bW4iLCJhZ2dyZWdhdGlvbk9iamVjdCIsInNldEF0dHJpYnV0ZSIsInR5cGUiLCJ3aWR0aCIsImltcG9ydGFuY2UiLCJob3Jpem9udGFsQWxpZ24iLCJhdmFpbGFiaWxpdHkiLCJoZWFkZXIiLCJ0ZW1wbGF0ZSIsIm91dGVySFRNTCIsInByb3BlcnRpZXMiLCJzcGxpdCIsInVuZGVmaW5lZCIsIlRhYmxlQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsInJldHVyblR5cGVzIiwiYmxvY2tBdHRyaWJ1dGUiLCJpc1B1YmxpYyIsInJlcXVpcmVkIiwiZXhwZWN0ZWRUeXBlcyIsImJsb2NrQWdncmVnYXRpb24iLCJwcm9jZXNzQWdncmVnYXRpb25zIiwiaGFzVmlydHVhbE5vZGUiLCJibG9ja0V2ZW50IiwicHJvcHMiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsInNldHRpbmdzIiwiZ2V0VGFibGVUeXBlIiwiY29sbGVjdGlvbiIsImdldE9iamVjdCIsInRhYmxlVHlwZSIsInhtbCIsInRhYmxlRGVmaW5pdGlvbiIsImNvbnRyb2wiLCJyb3dDb3VudE1vZGUiLCJyb3dDb3VudCIsInNlbGVjdGlvbkxpbWl0IiwiZnJvemVuQ29sdW1uQ291bnQiLCJncm93aW5nTW9kZSIsIiRraW5kIiwiZ2V0RGVwZW5kZW50cyIsImRlcGVuZGVudHMiLCJyZWFkT25seSIsImNvbHVtbnMiLCJjb2x1bW4iLCJnZXRWYWx1ZUhlbHAiLCJzdGFuZGFyZEFjdGlvbnMiLCJhbm5vdGF0aW9uIiwiYWN0aW9ucyIsImlzSW5zZXJ0VXBkYXRlVGVtcGxhdGVkIiwiY3JlYXRlIiwiaXNUZW1wbGF0ZWQiLCJUYWJsZUhlbHBlciIsInByZXNzRXZlbnRGb3JDcmVhdGVCdXR0b24iLCJ2aXNpYmxlIiwiZGVsZXRlIiwiaGVhZGVySW5mbyIsImNvbGxlY3Rpb25FbnRpdHkiLCJlbnRpdHlUeXBlIiwidGFyZ2V0VHlwZSIsImFubm90YXRpb25zIiwiVUkiLCJIZWFkZXJJbmZvIiwicHJlc3NFdmVudEZvckRlbGV0ZUJ1dHRvbiIsImNvbnRleHRPYmplY3RQYXRoIiwiYWN0aW9uTmFtZSIsImNvbW1hbmRBY3Rpb25zIiwiYWN0aW9uIiwiZ2V0QWN0aW9uQ29tbWFuZCIsInZhcmlhbnRNYW5hZ2VtZW50IiwiZ2VuZXJhdGUiLCJpZCIsImdldEFjdGlvbnMiLCJvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQiLCJDb21tb25IZWxwZXIiLCJpc0Rlc2t0b3AiLCJnZXRUYWJsZUFjdGlvblRlbXBsYXRlIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwibWV0YVBhdGgiLCJjb250ZXh0UGF0aCIsInBhZ2VDb250ZXh0IiwiYmluZGluZ0NvbnRleHRzIiwiY29udmVydGVyQ29udGV4dCIsInBhZ2VUZW1wbGF0ZVR5cGUiLCJzZXRVcFRhYmxlRGVmaW5pdGlvbiIsIm1vZGVscyIsIm1ldGFNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiY29udmVydGVkTWV0YURhdGEiLCJjb252ZXJ0ZWRUeXBlcyIsInJlc29sdmVQYXRoIiwidGFyZ2V0Iiwic2V0VXBJZCIsImdldENvbnZlcnRlckNvbnRleHQiLCJnZXRQYXRoIiwiX2NvbGxlY3Rpb25Jc0RyYWZ0RW5hYmxlZCIsImdldE1hbmlmZXN0V3JhcHBlciIsImlzRmlsdGVyQmFySGlkZGVuIiwiTW9kZWxIZWxwZXIiLCJpc0RyYWZ0Tm9kZSIsImlzRHJhZnRSb290Iiwic2VsZWN0aW9uTW9kZSIsImVuYWJsZUZ1bGxTY3JlZW4iLCJlbmFibGVFeHBvcnQiLCJlbmFibGVQYXN0ZSIsInBhc3RlIiwidXBkYXRhYmxlUHJvcGVydHlQYXRoIiwiZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSIsImN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiIsImhlYWRlclZpc2libGUiLCJzZWFyY2hhYmxlIiwiaW5saW5lQ3JlYXRpb25Sb3dDb3VudCIsInRpdGxlIiwiaXNDb21wYWN0VHlwZSIsImNyZWF0aW9uTW9kZSIsIm1vZGUiLCJjcmVhdGVBdEVuZCIsImFwcGVuZCIsImNyZWF0ZU91dGJvdW5kIiwib3V0Ym91bmQiLCJjcmVhdGVOZXdBY3Rpb24iLCJuZXdBY3Rpb24iLCJjcmVhdGVPdXRib3VuZERldGFpbCIsIm91dGJvdW5kRGV0YWlsIiwicGVyc29uYWxpemF0aW9uIiwicDEzbk1vZGUiLCJlbmFibGVBdXRvQ29sdW1uV2lkdGgiLCJkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXIiLCJpc09wdGltaXplZEZvclNtYWxsRGV2aWNlIiwiQ29tbW9uVXRpbHMiLCJpc1NtYWxsRGV2aWNlIiwibmF2aWdhdGlvblBhdGgiLCJzdGFydHNXaXRoIiwiaXNTaW5nbGV0b24iLCJzdGFydGluZ0VudGl0eVNldCIsInNldFJlYWRPbmx5Iiwicm93UHJlc3MiLCJyb3dBY3Rpb24iLCJyb3ciLCJpc1NlYXJjaGFibGUiLCJ1c2VCYXNpY1NlYXJjaCIsImZpbHRlckJhciIsImZpbHRlckJhcklkIiwic2hvd0NyZWF0ZSIsImF1dG9CaW5kT25Jbml0IiwiY29sdW1uRWRpdE1vZGUiLCJnZXRWaXN1YWxpemF0aW9uUGF0aCIsImdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJMb2ciLCJlcnJvciIsInRhcmdldE9iamVjdCIsInRlcm0iLCJyZXNvbHZlZFRhcmdldCIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwidmlzdWFsaXphdGlvbnMiLCJQcmVzZW50YXRpb25WYXJpYW50IiwiZ2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCIsImxpbmVJdGVtVml6IiwiZmluZCIsInZpeiIsInZpc3VhbGl6YXRpb24iLCJhbm5vdGF0aW9uUGF0aCIsImdldFByZXNlbnRhdGlvblBhdGgiLCJwcmVzZW50YXRpb25QYXRoIiwidGFibGUiLCJpbml0aWFsQ29udmVydGVyQ29udGV4dCIsInZpc3VhbGl6YXRpb25QYXRoIiwiZXh0cmFQYXJhbXMiLCJ0YWJsZVNldHRpbmdzIiwiZm9yRWFjaCIsIml0ZW0iLCJ2aXN1YWxpemF0aW9uRGVmaW5pdGlvbiIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsInVzZUNvbmRlbnNlZExheW91dCIsInRhYmxlRGVmaW5pdGlvbkNvbnRleHQiLCJNYWNyb0FQSSIsIl9hcGlJZCIsImdldENvbnRlbnRJZCIsImRpc3BsYXlNb2RlIiwiX2dldEVudGl0eVR5cGUiLCJnZXRWYWx1ZUhlbHBUZW1wbGF0ZUZyb21QYXRoIiwiZGF0RmllbGRQYXRoIiwiZGF0YUZpZWxkT2JqZWN0IiwiaXNEYXRhRmllbGRGb3JBbm5vdGF0aW9uIiwiVGFyZ2V0IiwiJHRhcmdldCIsImluZGV4IiwiRGF0YSIsImRhdGFGaWVsZCIsImFjdGlvbkNvbnRleHRQYXRoIiwiZ2V0QWN0aW9uQ29udGV4dCIsImdldE1vZGVsIiwiYWN0aW9uQ29udGV4dCIsImRhdGFGaWVsZERhdGFNb2RlbE9iamVjdFBhdGgiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJpc0JvdW5kIiwiQWN0aW9uVGFyZ2V0IiwiaXNPcGVyYXRpb25BdmFpbGFibGUiLCJDb3JlIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwidmFsdWVPZiIsImRpc3BsYXlDb21tYW5kQWN0aW9uIiwicHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbiIsIm9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsImlzTmF2aWdhYmxlIiwiZW5hYmxlQXV0b1Njcm9sbCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsImdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTiIsImVuYWJsZUFuYWx5dGljcyIsIm5vV3JhcCIsImJ1aWxkQWN0aW9uV3JhcHBlciIsImlzRGF0YUZpZWxkRm9ySUJORW5hYmxlZCIsIlJlcXVpcmVzQ29udGV4dCIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCJpc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWQiLCJBY3Rpb24iLCJlbmFibGVPblNlbGVjdCIsInRhcmdldEVudGl0eVR5cGUiLCJnZXRDcmVhdGlvblJvdyIsImNyZWF0aW9uUm93QWN0aW9uIiwiY3JlYXRpb25Sb3ciLCJnZXRSb3dTZXR0aW5nIiwicm93U2V0dGluZ3NUZW1wbGF0ZSIsInJvd05hdmlnYXRlZCIsInJvd0hpZ2hsaWdodGluZyIsImdldFZhcmlhbnRNYW5hZ2VtZW50IiwiaGVhZGVyTGV2ZWwiLCJ2YXJpYW50U2F2ZWQiLCJnZXRRdWlja0ZpbHRlciIsImZpbHRlcnMiLCJxdWlja0ZpbHRlcnMiLCJnZXRFbXB0eVJvd3NFbmFibGVkIiwiQ3JlYXRpb25Nb2RlIiwiSW5saW5lQ3JlYXRpb25Sb3dzIiwiZ2V0VGVtcGxhdGUiLCJoZWFkZXJCaW5kaW5nRXhwcmVzc2lvbiIsImJ1aWxkRXhwcmVzc2lvbkZvckhlYWRlclZpc2libGUiLCJjb2xsZWN0aW9uRGVsZXRhYmxlUGF0aCIsIkNhcGFiaWxpdGllcyIsIkRlbGV0ZVJlc3RyaWN0aW9ucyIsIkRlbGV0YWJsZSIsInBhdGgiLCJsaW5lSXRlbSIsImdldFVpTGluZUl0ZW1PYmplY3QiLCJkZWxlZ2F0ZSIsImdldERlbGVnYXRlIiwiaXNBbHAiLCJ0b1N0cmluZyIsImVudGl0eU5hbWUiLCJzZWxlY3Rpb25DaGFuZ2UiLCJDb21tb24iLCJEcmFmdFJvb3QiLCJnZXROYXZpZ2F0aW9uQXZhaWxhYmxlTWFwIiwiQWN0aW9uSGVscGVyIiwiZ2V0TXVsdGlTZWxlY3REaXNhYmxlZEFjdGlvbnMiLCJtb2RlbENvbnRleHRDaGFuZ2UiLCJpbml0aWFsRXhwYW5zaW9uTGV2ZWwiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJzdGF0ZUNoYW5nZSIsIm9uQ29udGV4dENoYW5nZSIsImdldFRhcmdldENvbGxlY3Rpb25QYXRoIiwic29ydENvbmRpdGlvbnMiLCJzdHJpbmdpZnlPYmplY3QiLCJncm91cENvbmRpdGlvbnMiLCJhZ2dyZWdhdGVDb25kaXRpb25zIiwiX3R5cGUiLCJidXN5Iiwic2hvd1Jvd0NvdW50IiwiYXR0ciIsInRocmVzaG9sZCIsIm5vRGF0YVRleHQiLCJ1c2VDb25kZW5zZWRUYWJsZUxheW91dCIsIm11bHRpU2VsZWN0TW9kZSIsImdldFJvd3NCaW5kaW5nSW5mbyIsImdldENvbnRleHRQYXRoIiwiY29udGV4dCIsIm9uQ2hhbmdlIiwiZm9ybWF0SGlkZGVuRmlsdGVycyIsImhpZGRlbkZpbHRlcnMiLCJzdHJpbmdpZnlDdXN0b21EYXRhIiwiQnVpbGRpbmdCbG9ja0Jhc2UiLCJUaXRsZUxldmVsIiwiQXV0byJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGFibGUuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29udmVydGVkTWV0YWRhdGEsIEVudGl0eVNldCwgTmF2aWdhdGlvblByb3BlcnR5LCBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7XG5cdERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdERhdGFGaWVsZEZvckFjdGlvbixcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRVSUFubm90YXRpb25UZXJtc1xufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQWdncmVnYXRpb24sIGJsb2NrQXR0cmlidXRlLCBibG9ja0V2ZW50LCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBpc0RhdGFGaWVsZEZvckFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9hbm5vdGF0aW9ucy9EYXRhRmllbGRcIjtcbmltcG9ydCB7IEN1c3RvbUFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7XG5cdGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbixcblx0Z2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCxcblx0VmlzdWFsaXphdGlvbkFuZFBhdGhcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQge1xuXHRBbm5vdGF0aW9uVGFibGVDb2x1bW4sXG5cdFRhYmxlVmlzdWFsaXphdGlvbixcblx0dHlwZSBDcmVhdGVCZWhhdmlvcixcblx0dHlwZSBDcmVhdGVCZWhhdmlvckV4dGVybmFsXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9UYWJsZVwiO1xuaW1wb3J0IENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgeyBOYXZpZ2F0aW9uVGFyZ2V0Q29uZmlndXJhdGlvbiwgVGVtcGxhdGVUeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgQ3JlYXRpb25Nb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgaXNTaW5nbGV0b24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9UeXBlR3VhcmRzXCI7XG5pbXBvcnQgeyBEYXRhTW9kZWxPYmplY3RQYXRoLCBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgYnVpbGRFeHByZXNzaW9uRm9ySGVhZGVyVmlzaWJsZSB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL2hlbHBlcnMvVGFibGVUZW1wbGF0aW5nXCI7XG5pbXBvcnQgeyBUaXRsZUxldmVsIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwiLi4vQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgQWN0aW9uSGVscGVyIGZyb20gXCIuLi9pbnRlcm5hbC9oZWxwZXJzL0FjdGlvbkhlbHBlclwiO1xuaW1wb3J0IE1hY3JvQVBJIGZyb20gXCIuLi9NYWNyb0FQSVwiO1xuaW1wb3J0IHsgZ2V0VGFibGVBY3Rpb25UZW1wbGF0ZSB9IGZyb20gXCIuL0FjdGlvbnNUZW1wbGF0aW5nXCI7XG5pbXBvcnQgeyBBY3Rpb24sIEFjdGlvbkdyb3VwLCBDb2x1bW4gfSBmcm9tIFwiLi9UYWJsZUFQSVwiO1xuaW1wb3J0IFRhYmxlSGVscGVyIGZyb20gXCIuL1RhYmxlSGVscGVyXCI7XG50eXBlIEV4dGVuZGVkQWN0aW9uR3JvdXAgPSBBY3Rpb25Hcm91cCAmIHsgbWVudUNvbnRlbnRBY3Rpb25zPzogUmVjb3JkPHN0cmluZywgQWN0aW9uPiB9O1xudHlwZSBBY3Rpb25PckFjdGlvbkdyb3VwID0gUmVjb3JkPHN0cmluZywgQWN0aW9uIHwgRXh0ZW5kZWRBY3Rpb25Hcm91cD47XG5cbmNvbnN0IHNldEN1c3RvbUFjdGlvblByb3BlcnRpZXMgPSBmdW5jdGlvbiAoY2hpbGRBY3Rpb246IEVsZW1lbnQpIHtcblx0bGV0IG1lbnVDb250ZW50QWN0aW9ucyA9IG51bGw7XG5cdGNvbnN0IGFjdCA9IGNoaWxkQWN0aW9uO1xuXHRsZXQgbWVudUFjdGlvbnM6IGFueVtdID0gW107XG5cdGNvbnN0IGFjdGlvbktleSA9IGFjdC5nZXRBdHRyaWJ1dGUoXCJrZXlcIik/LnJlcGxhY2UoXCJJbmxpbmVYTUxfXCIsIFwiXCIpO1xuXHQvLyBGb3IgdGhlIGFjdGlvbkdyb3VwIHdlIGF1dGhvcml6ZSB0aGUgYm90aCBlbnRyaWVzIDxzYXAuZmUubWFjcm9zOkFjdGlvbkdyb3VwPiAoY29tcGxpYW50IHdpdGggb2xkIEZQTSBleGFtcGxlcykgYW5kIDxzYXAuZmUubWFjcm9zLnRhYmxlOkFjdGlvbkdyb3VwPlxuXHRpZiAoXG5cdFx0YWN0LmNoaWxkcmVuLmxlbmd0aCAmJlxuXHRcdGFjdC5sb2NhbE5hbWUgPT09IFwiQWN0aW9uR3JvdXBcIiAmJlxuXHRcdGFjdC5uYW1lc3BhY2VVUkkgJiZcblx0XHRbXCJzYXAuZmUubWFjcm9zXCIsIFwic2FwLmZlLm1hY3Jvcy50YWJsZVwiXS5pbmRleE9mKGFjdC5uYW1lc3BhY2VVUkkpID4gLTFcblx0KSB7XG5cdFx0Y29uc3QgYWN0aW9uc1RvQWRkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFjdC5jaGlsZHJlbik7XG5cdFx0bGV0IGFjdGlvbklkeCA9IDA7XG5cdFx0bWVudUNvbnRlbnRBY3Rpb25zID0gYWN0aW9uc1RvQWRkLnJlZHVjZSgoYWNjLCBhY3RUb0FkZCkgPT4ge1xuXHRcdFx0Y29uc3QgYWN0aW9uS2V5QWRkID0gYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwia2V5XCIpPy5yZXBsYWNlKFwiSW5saW5lWE1MX1wiLCBcIlwiKSB8fCBhY3Rpb25LZXkgKyBcIl9NZW51X1wiICsgYWN0aW9uSWR4O1xuXHRcdFx0Y29uc3QgY3VyT3V0T2JqZWN0ID0ge1xuXHRcdFx0XHRrZXk6IGFjdGlvbktleUFkZCxcblx0XHRcdFx0dGV4dDogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwidGV4dFwiKSxcblx0XHRcdFx0X19ub1dyYXA6IHRydWUsXG5cdFx0XHRcdHByZXNzOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJwcmVzc1wiKSxcblx0XHRcdFx0cmVxdWlyZXNTZWxlY3Rpb246IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcInJlcXVpcmVzU2VsZWN0aW9uXCIpID09PSBcInRydWVcIixcblx0XHRcdFx0ZW5hYmxlZDogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwiZW5hYmxlZFwiKSA9PT0gbnVsbCA/IHRydWUgOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpXG5cdFx0XHR9O1xuXHRcdFx0YWNjW2N1ck91dE9iamVjdC5rZXldID0gY3VyT3V0T2JqZWN0O1xuXHRcdFx0YWN0aW9uSWR4Kys7XG5cdFx0XHRyZXR1cm4gYWNjO1xuXHRcdH0sIHt9KTtcblx0XHRtZW51QWN0aW9ucyA9IE9iamVjdC52YWx1ZXMobWVudUNvbnRlbnRBY3Rpb25zKVxuXHRcdFx0LnNsaWNlKC1hY3QuY2hpbGRyZW4ubGVuZ3RoKVxuXHRcdFx0Lm1hcChmdW5jdGlvbiAobWVudUl0ZW06IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbWVudUl0ZW0ua2V5O1xuXHRcdFx0fSk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRrZXk6IGFjdGlvbktleSxcblx0XHR0ZXh0OiBhY3QuZ2V0QXR0cmlidXRlKFwidGV4dFwiKSxcblx0XHRwb3NpdGlvbjoge1xuXHRcdFx0cGxhY2VtZW50OiBhY3QuZ2V0QXR0cmlidXRlKFwicGxhY2VtZW50XCIpLFxuXHRcdFx0YW5jaG9yOiBhY3QuZ2V0QXR0cmlidXRlKFwiYW5jaG9yXCIpXG5cdFx0fSxcblx0XHRfX25vV3JhcDogdHJ1ZSxcblx0XHRwcmVzczogYWN0LmdldEF0dHJpYnV0ZShcInByZXNzXCIpLFxuXHRcdHJlcXVpcmVzU2VsZWN0aW9uOiBhY3QuZ2V0QXR0cmlidXRlKFwicmVxdWlyZXNTZWxlY3Rpb25cIikgPT09IFwidHJ1ZVwiLFxuXHRcdGVuYWJsZWQ6IGFjdC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpID09PSBudWxsID8gdHJ1ZSA6IGFjdC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpLFxuXHRcdG1lbnU6IG1lbnVBY3Rpb25zLmxlbmd0aCA/IG1lbnVBY3Rpb25zIDogbnVsbCxcblx0XHRtZW51Q29udGVudEFjdGlvbnM6IG1lbnVDb250ZW50QWN0aW9uc1xuXHR9O1xufTtcblxuY29uc3Qgc2V0Q3VzdG9tQ29sdW1uUHJvcGVydGllcyA9IGZ1bmN0aW9uIChjaGlsZENvbHVtbjogRWxlbWVudCwgYWdncmVnYXRpb25PYmplY3Q6IGFueSkge1xuXHRhZ2dyZWdhdGlvbk9iamVjdC5rZXkgPSBhZ2dyZWdhdGlvbk9iamVjdC5rZXkucmVwbGFjZShcIklubGluZVhNTF9cIiwgXCJcIik7XG5cdGNoaWxkQ29sdW1uLnNldEF0dHJpYnV0ZShcImtleVwiLCBhZ2dyZWdhdGlvbk9iamVjdC5rZXkpO1xuXHRyZXR1cm4ge1xuXHRcdC8vIERlZmF1bHRzIGFyZSB0byBiZSBkZWZpbmVkIGluIFRhYmxlLnRzXG5cdFx0a2V5OiBhZ2dyZWdhdGlvbk9iamVjdC5rZXksXG5cdFx0dHlwZTogXCJTbG90XCIsXG5cdFx0d2lkdGg6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcIndpZHRoXCIpLFxuXHRcdGltcG9ydGFuY2U6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcImltcG9ydGFuY2VcIiksXG5cdFx0aG9yaXpvbnRhbEFsaWduOiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJob3Jpem9udGFsQWxpZ25cIiksXG5cdFx0YXZhaWxhYmlsaXR5OiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJhdmFpbGFiaWxpdHlcIiksXG5cdFx0aGVhZGVyOiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJoZWFkZXJcIiksXG5cdFx0dGVtcGxhdGU6IGNoaWxkQ29sdW1uLmNoaWxkcmVuWzBdPy5vdXRlckhUTUwgfHwgXCJcIixcblx0XHRwcm9wZXJ0aWVzOiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJwcm9wZXJ0aWVzXCIpID8gY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwicHJvcGVydGllc1wiKT8uc3BsaXQoXCIsXCIpIDogdW5kZWZpbmVkLFxuXHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRwbGFjZW1lbnQ6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcInBsYWNlbWVudFwiKSB8fCBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJwb3NpdGlvblBsYWNlbWVudFwiKSwgLy9wb3NpdGlvblBsYWNlbWVudCBpcyBrZXB0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXHRcdFx0YW5jaG9yOiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJhbmNob3JcIikgfHwgY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwicG9zaXRpb25BbmNob3JcIikgLy9wb3NpdGlvbkFuY2hvciBpcyBrZXB0IGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuXHRcdH1cblx0fTtcbn07XG5cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJUYWJsZVwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHRyZXR1cm5UeXBlczogW1wic2FwLmZlLm1hY3Jvcy50YWJsZS5UYWJsZUFQSVwiXVxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmxlQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8vICAqKioqKioqKioqKioqKiogUHVibGljICYgUmVxdWlyZWQgQXR0cmlidXRlcyAqKioqKioqKioqKioqKioqKioqKlxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsIGlzUHVibGljOiB0cnVlLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRtZXRhUGF0aCE6IENvbnRleHQ7XG5cblx0Ly8gICoqKioqKioqKioqKioqKiBQdWJsaWMgQXR0cmlidXRlcyAqKioqKioqKioqKioqKioqKioqKlxuXHQvKipcblx0ICpUaGUgYGJ1c3lgIG1vZGUgb2YgdGFibGVcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRidXN5PzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGNvbnRleHRQYXRoPzogQ29udGV4dDtcblxuXHQvKipcblx0ICogUGFyYW1ldGVyIHVzZWQgdG8gc2hvdyB0aGUgZnVsbFNjcmVlbiBidXR0b24gb24gdGhlIHRhYmxlLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGVuYWJsZUZ1bGxTY3JlZW4/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBFbmFibGUgZXhwb3J0IHRvIGZpbGVcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRlbmFibGVFeHBvcnQ/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBOdW1iZXIgb2YgY29sdW1ucyB0aGF0IGFyZSBmaXhlZCBvbiB0aGUgbGVmdC4gT25seSBjb2x1bW5zIHdoaWNoIGFyZSBub3QgZml4ZWQgY2FuIGJlIHNjcm9sbGVkIGhvcml6b250YWxseS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwibnVtYmVyXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGZyb3plbkNvbHVtbkNvdW50PzogbnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBFbmFibGUgZXhwb3J0IHRvIGZpbGVcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRlbmFibGVQYXN0ZT86IGJvb2xlYW4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHQvKipcblx0ICogVGhlIGNvbnRyb2wgSUQgb2YgdGhlIEZpbHRlckJhciB0aGF0IGlzIHVzZWQgdG8gZmlsdGVyIHRoZSByb3dzIG9mIHRoZSB0YWJsZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGZpbHRlckJhcj86IHN0cmluZztcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIGhlYWRlciB0ZXh0IHRoYXQgaXMgc2hvd24gaW4gdGFibGUuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRoZWFkZXI/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIFwiYXJpYS1sZXZlbFwiIG9mIHRoZSB0YWJsZSBoZWFkZXJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLmNvcmUuVGl0bGVMZXZlbFwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRoZWFkZXJMZXZlbDogVGl0bGVMZXZlbCA9IFRpdGxlTGV2ZWwuQXV0bztcblxuXHQvKipcblx0ICogQ29udHJvbHMgaWYgdGhlIGhlYWRlciB0ZXh0IHNob3VsZCBiZSBzaG93biBvciBub3Rcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRoZWFkZXJWaXNpYmxlPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRpZCE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0aXNTZWFyY2hhYmxlPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogUGVyc29uYWxpemF0aW9uIE1vZGVcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nfGJvb2xlYW5cIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0cGVyc29uYWxpemF0aW9uPzogc3RyaW5nIHwgYm9vbGVhbjtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHdoZXRoZXIgdGhlIHRhYmxlIHNob3VsZCBiZSByZWFkLW9ubHkgb3Igbm90LlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHJlYWRPbmx5PzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQWxsb3dzIHRvIGNob29zZSB0aGUgVGFibGUgdHlwZS4gQWxsb3dlZCB2YWx1ZXMgYXJlIGBSZXNwb25zaXZlVGFibGVgIG9yIGBHcmlkVGFibGVgLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0dHlwZT86IHN0cmluZztcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHdoZXRoZXIgdGhlIHRhYmxlIGlzIGRpc3BsYXllZCB3aXRoIGNvbmRlbnNlZCBsYXlvdXQgKHRydWUvZmFsc2UpLiBUaGUgZGVmYXVsdCBzZXR0aW5nIGlzIGBmYWxzZWAuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0dXNlQ29uZGVuc2VkTGF5b3V0PzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBzZWxlY3Rpb24gbW9kZSAoTm9uZSxTaW5nbGUsTXVsdGksQXV0bylcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHNlbGVjdGlvbk1vZGU/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0dmFyaWFudE1hbmFnZW1lbnQ/OiBzdHJpbmc7XG5cblx0Ly8gICoqKioqKioqKioqKioqKiBQcml2YXRlICYgUmVxdWlyZWQgQXR0cmlidXRlcyAqKioqKioqKioqKioqKioqKioqKlxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogZmFsc2UsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCIsIFwiU2luZ2xldG9uXCJdXG5cdH0pXG5cdGNvbGxlY3Rpb24hOiBDb250ZXh0O1xuXG5cdC8vICAqKioqKioqKioqKioqKiogUHJpdmF0ZSBBdHRyaWJ1dGVzICoqKioqKioqKioqKioqKioqKioqXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0X2FwaUlkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGF1dG9CaW5kT25Jbml0PzogYm9vbGVhbjtcblxuXHRjb2xsZWN0aW9uRW50aXR5OiBFbnRpdHlTZXQgfCBOYXZpZ2F0aW9uUHJvcGVydHk7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjb2x1bW5FZGl0TW9kZT86IHN0cmluZztcblxuXHQvKipcblx0ICogU2V0dGluZyB0byBkZXRlcm1pbmUgaWYgdGhlIG5ldyByb3cgc2hvdWxkIGJlIGNyZWF0ZWQgYXQgdGhlIGVuZCBvciBiZWdpbm5pbmdcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGNyZWF0ZUF0RW5kPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGNyZWF0ZU5ld0FjdGlvbj86IHN0cmluZztcblxuXHQvKipcblx0ICogQ3JlYXRpb24gTW9kZSB0byBiZSBwYXNzZWQgdG8gdGhlIG9uQ3JlYXRlIGhhbmRsZXIuIFZhbHVlczogW1wiSW5saW5lXCIsIFwiTmV3UGFnZVwiXVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjcmVhdGlvbk1vZGU/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjcmVhdGVPdXRib3VuZD86IHN0cmluZztcblxuXHRjcmVhdGVPdXRib3VuZERldGFpbD86IE5hdmlnYXRpb25UYXJnZXRDb25maWd1cmF0aW9uW1wib3V0Ym91bmREZXRhaWxcIl07XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgZnVsbCBwYXRoIGFuZCBmdW5jdGlvbiBuYW1lIG9mIGEgY3VzdG9tIHZhbGlkYXRpb24gZnVuY3Rpb24uXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbj86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcj86IHN0cmluZztcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHdoZXRoZXIgdGhlIGJ1dHRvbiBpcyBoaWRkZW4gd2hlbiBubyBkYXRhIGhhcyBiZWVuIGVudGVyZWQgeWV0IGluIHRoZSByb3cgKHRydWUvZmFsc2UpLiBUaGUgZGVmYXVsdCBzZXR0aW5nIGlzIGBmYWxzZWAuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRlbmFibGVBdXRvQ29sdW1uV2lkdGg/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGVuYWJsZUF1dG9TY3JvbGw/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZmllbGRNb2RlOiBzdHJpbmcgPSBcIlwiO1xuXG5cdC8qKlxuXHQgKiBUaGUgY29udHJvbCBJRCBvZiB0aGUgRmlsdGVyQmFyIHRoYXQgaXMgdXNlZCBpbnRlcm5hbGx5IHRvIGZpbHRlciB0aGUgcm93cyBvZiB0aGUgdGFibGUuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlckJhcklkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwibnVtYmVyXCIgfSlcblx0aW5saW5lQ3JlYXRpb25Sb3dDb3VudD86IG51bWJlcjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRpc0FscD86IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRpc0NvbXBhY3RUeXBlPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRpc09wdGltaXplZEZvclNtYWxsRGV2aWNlPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogT05MWSBGT1IgUkVTUE9OU0lWRSBUQUJMRTogU2V0dGluZyB0byBkZWZpbmUgdGhlIGNoZWNrYm94IGluIHRoZSBjb2x1bW4gaGVhZGVyOiBBbGxvd2VkIHZhbHVlcyBhcmUgYERlZmF1bHRgIG9yIGBDbGVhckFsbGAuIElmIHNldCB0byBgRGVmYXVsdGAsIHRoZSBzYXAubS5UYWJsZSBjb250cm9sIHJlbmRlcnMgdGhlIFNlbGVjdCBBbGwgY2hlY2tib3gsIG90aGVyd2lzZSB0aGUgRGVzZWxlY3QgQWxsIGJ1dHRvbiBpcyByZW5kZXJlZC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0bXVsdGlTZWxlY3RNb2RlPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBVc2VkIGZvciBiaW5kaW5nIHRoZSB0YWJsZSB0byBhIG5hdmlnYXRpb24gcGF0aC4gT25seSB0aGUgcGF0aCBpcyB1c2VkIGZvciBiaW5kaW5nIHJvd3MuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG5hdmlnYXRpb25QYXRoPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgbm9EYXRhVGV4dCBmb3IgdGhlIG1kYyB0YWJsZVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRub0RhdGFUZXh0Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgdGhlIHBvc3NpYmxlIGFjdGlvbnMgYXZhaWxhYmxlIG9uIHRoZSB0YWJsZSByb3cgKE5hdmlnYXRpb24sbnVsbCkuIFRoZSBkZWZhdWx0IHNldHRpbmcgaXMgYHVuZGVmaW5lZGBcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0cm93QWN0aW9uPzogc3RyaW5nID0gdW5kZWZpbmVkO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dGFibGVUeXBlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dXBkYXRhYmxlUHJvcGVydHlQYXRoPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHVzZUJhc2ljU2VhcmNoPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRzZWFyY2hhYmxlPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogT05MWSBGT1IgR1JJRCBUQUJMRTogTnVtYmVyIG9mIGluZGljZXMgd2hpY2ggY2FuIGJlIHNlbGVjdGVkIGluIGEgcmFuZ2UuIElmIHNldCB0byAwLCB0aGUgc2VsZWN0aW9uIGxpbWl0IGlzIGRpc2FibGVkLCBhbmQgdGhlIFNlbGVjdCBBbGwgY2hlY2tib3ggYXBwZWFycyBpbnN0ZWFkIG9mIHRoZSBEZXNlbGVjdCBBbGwgYnV0dG9uLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJudW1iZXJcIiB9KVxuXHRzZWxlY3Rpb25MaW1pdD86IG51bWJlcjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHNob3dDcmVhdGU/OiBzdHJpbmcgfCBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwib2JqZWN0XCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHRhYmxlRGVmaW5pdGlvbiE6IFRhYmxlVmlzdWFsaXphdGlvbjsgLy8gV2UgcmVxdWlyZSB0YWJsZURlZmluaXRpb24gdG8gYmUgdGhlcmUgZXZlbiB0aG91Z2ggaXQgaXMgbm90IGZvcm1hbGx5IHJlcXVpcmVkXG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiIH0pXG5cdHRhYmxlRGVmaW5pdGlvbkNvbnRleHQ/OiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dGFibGVEZWxlZ2F0ZT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHRhYlRpdGxlOiBzdHJpbmcgPSBcIlwiO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHZpc2libGU/OiBib29sZWFuO1xuXG5cdEBibG9ja0FnZ3JlZ2F0aW9uKHtcblx0XHR0eXBlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudGFibGUuQWN0aW9uIHwgc2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC50YWJsZS5BY3Rpb25Hcm91cFwiLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdHByb2Nlc3NBZ2dyZWdhdGlvbnM6IHNldEN1c3RvbUFjdGlvblByb3BlcnRpZXNcblx0fSlcblx0YWN0aW9ucz86IEFjdGlvbk9yQWN0aW9uR3JvdXA7XG5cblx0QGJsb2NrQWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC50YWJsZS5Db2x1bW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRoYXNWaXJ0dWFsTm9kZTogdHJ1ZSxcblx0XHRwcm9jZXNzQWdncmVnYXRpb25zOiBzZXRDdXN0b21Db2x1bW5Qcm9wZXJ0aWVzXG5cdH0pXG5cdGNvbHVtbnM/OiBSZWNvcmQ8c3RyaW5nLCBDb2x1bW4+O1xuXG5cdGNvbnZlcnRlZE1ldGFEYXRhOiBDb252ZXJ0ZWRNZXRhZGF0YTtcblxuXHRjb250ZXh0T2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aDtcblxuXHRwYWdlVGVtcGxhdGVUeXBlOiBUZW1wbGF0ZVR5cGU7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3Qgd2hlbiB0aGUgdXNlciBjaG9vc2VzIGEgcm93XG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdHJvd1ByZXNzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIHRvIHJlYWN0IHRvIHRoZSBjb250ZXh0Q2hhbmdlIGV2ZW50IG9mIHRoZSB0YWJsZS5cblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0b25Db250ZXh0Q2hhbmdlPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiAgRXZlbnQgaGFuZGxlciBmb3IgY2hhbmdlIGV2ZW50LlxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRvbkNoYW5nZT86IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciBjYWxsZWQgd2hlbiB0aGUgdXNlciBjaG9vc2VzIGFuIG9wdGlvbiBvZiB0aGUgc2VnbWVudGVkIGJ1dHRvbiBpbiB0aGUgQUxQIFZpZXdcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0b25TZWdtZW50ZWRCdXR0b25QcmVzc2VkPzogc3RyaW5nO1xuXG5cdEBibG9ja0V2ZW50KClcblx0dmFyaWFudFNhdmVkPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIHRvIHJlYWN0IHRvIHRoZSBzdGF0ZUNoYW5nZSBldmVudCBvZiB0aGUgdGFibGUuXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdHN0YXRlQ2hhbmdlPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIHRvIHJlYWN0IHdoZW4gdGhlIHRhYmxlIHNlbGVjdGlvbiBjaGFuZ2VzXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdHNlbGVjdGlvbkNoYW5nZT86IHN0cmluZztcblxuXHRAYmxvY2tFdmVudCgpXG5cdHZhcmlhbnRTZWxlY3RlZD86IHN0cmluZztcblxuXHQvKipcblx0ICogV2hldGhlciB0aGUgY29sbGVjdGlvbiBpcyBkcmFmdCBlbmFibGVkIG9yIG5vdFxuXHQgKi9cblx0X2NvbGxlY3Rpb25Jc0RyYWZ0RW5hYmxlZDogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPFRhYmxlQmxvY2s+LCBjb250cm9sQ29uZmlndXJhdGlvbjogYW55LCBzZXR0aW5nczogYW55KSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXHRcdGNvbnN0IGNvbnRleHRPYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMubWV0YVBhdGgsIHRoaXMuY29udGV4dFBhdGggYXMgQ29udGV4dCk7XG5cdFx0dGhpcy5jb250ZXh0T2JqZWN0UGF0aCA9IGNvbnRleHRPYmplY3RQYXRoO1xuXHRcdGNvbnN0IHBhZ2VDb250ZXh0ID0gc2V0dGluZ3MuYmluZGluZ0NvbnRleHRzLmNvbnZlcnRlckNvbnRleHQ7XG5cdFx0dGhpcy5wYWdlVGVtcGxhdGVUeXBlID0gcGFnZUNvbnRleHQ/LmdldE9iamVjdChcIi90ZW1wbGF0ZVR5cGVcIik7XG5cblx0XHRjb25zdCB0YWJsZURlZmluaXRpb24gPSBUYWJsZUJsb2NrLnNldFVwVGFibGVEZWZpbml0aW9uKHRoaXMsIHNldHRpbmdzKTtcblx0XHR0aGlzLmNvbGxlY3Rpb24gPSBzZXR0aW5ncy5tb2RlbHMubWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNvbGxlY3Rpb24pO1xuXHRcdHRoaXMuY29udmVydGVkTWV0YURhdGEgPSB0aGlzLmNvbnRleHRPYmplY3RQYXRoLmNvbnZlcnRlZFR5cGVzO1xuXHRcdHRoaXMuY29sbGVjdGlvbkVudGl0eSA9IHRoaXMuY29udmVydGVkTWV0YURhdGEucmVzb2x2ZVBhdGgodGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jb2xsZWN0aW9uKS50YXJnZXQgYXMgRW50aXR5U2V0O1xuXG5cdFx0dGhpcy5zZXRVcElkKCk7XG5cdFx0Y29uc3QgY29udmVydGVyQ29udGV4dCA9IHRoaXMuZ2V0Q29udmVydGVyQ29udGV4dCh0aGlzLmNvbnRleHRPYmplY3RQYXRoLCB0aGlzLmNvbnRleHRQYXRoPy5nZXRQYXRoKCksIHNldHRpbmdzKTtcblx0XHR0aGlzLl9jb2xsZWN0aW9uSXNEcmFmdEVuYWJsZWQgPVxuXHRcdFx0KGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaXNGaWx0ZXJCYXJIaWRkZW4oKSAmJiBNb2RlbEhlbHBlci5pc0RyYWZ0Tm9kZSh0aGlzLmNvbGxlY3Rpb25FbnRpdHkpKSB8fFxuXHRcdFx0TW9kZWxIZWxwZXIuaXNEcmFmdFJvb3QodGhpcy5jb2xsZWN0aW9uRW50aXR5KTtcblx0XHR0aGlzLnNlbGVjdGlvbk1vZGUgPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnNlbGVjdGlvbk1vZGU7XG5cdFx0dGhpcy5lbmFibGVGdWxsU2NyZWVuID0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5lbmFibGVGdWxsU2NyZWVuO1xuXHRcdHRoaXMuZW5hYmxlRXhwb3J0ID0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5lbmFibGVFeHBvcnQ7XG5cdFx0dGhpcy5lbmFibGVQYXN0ZSA9IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc3RhbmRhcmRBY3Rpb25zLmFjdGlvbnMucGFzdGUuZW5hYmxlZDtcblx0XHR0aGlzLmZyb3plbkNvbHVtbkNvdW50ID0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5mcm96ZW5Db2x1bW5Db3VudDtcblx0XHR0aGlzLnVwZGF0YWJsZVByb3BlcnR5UGF0aCA9IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc3RhbmRhcmRBY3Rpb25zLnVwZGF0YWJsZVByb3BlcnR5UGF0aDtcblx0XHR0aGlzLnR5cGUgPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnR5cGU7XG5cdFx0dGhpcy5kaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGE7XG5cdFx0dGhpcy5jdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24gPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uO1xuXHRcdHRoaXMuaGVhZGVyVmlzaWJsZSA/Pz0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5oZWFkZXJWaXNpYmxlO1xuXHRcdHRoaXMuc2VhcmNoYWJsZSA/Pz0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zZWFyY2hhYmxlO1xuXHRcdHRoaXMuaW5saW5lQ3JlYXRpb25Sb3dDb3VudCA/Pz0gdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5pbmxpbmVDcmVhdGlvblJvd0NvdW50O1xuXHRcdHRoaXMuaGVhZGVyID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnRpdGxlO1xuXHRcdHRoaXMuc2VsZWN0aW9uTGltaXQgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuc2VsZWN0aW9uTGltaXQ7XG5cdFx0dGhpcy5pc0NvbXBhY3RUeXBlID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmlzQ29tcGFjdFR5cGU7XG5cdFx0dGhpcy5jcmVhdGlvbk1vZGUgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uY3JlYXRlLm1vZGU7XG5cdFx0dGhpcy5jcmVhdGVBdEVuZCA/Pz0gKHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uY3JlYXRlIGFzIENyZWF0ZUJlaGF2aW9yKS5hcHBlbmQ7XG5cdFx0dGhpcy5jcmVhdGVPdXRib3VuZCA/Pz0gKHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uY3JlYXRlIGFzIENyZWF0ZUJlaGF2aW9yRXh0ZXJuYWwpLm91dGJvdW5kO1xuXHRcdHRoaXMuY3JlYXRlTmV3QWN0aW9uID8/PSAodGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jcmVhdGUgYXMgQ3JlYXRlQmVoYXZpb3IpLm5ld0FjdGlvbjtcblx0XHR0aGlzLmNyZWF0ZU91dGJvdW5kRGV0YWlsID8/PSAodGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jcmVhdGUgYXMgQ3JlYXRlQmVoYXZpb3JFeHRlcm5hbCkub3V0Ym91bmREZXRhaWw7XG5cblx0XHR0aGlzLnBlcnNvbmFsaXphdGlvbiA/Pz0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5wMTNuTW9kZTtcblx0XHR0aGlzLnZhcmlhbnRNYW5hZ2VtZW50ID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnZhcmlhbnRNYW5hZ2VtZW50O1xuXHRcdHRoaXMuZW5hYmxlQXV0b0NvbHVtbldpZHRoID8/PSB0cnVlO1xuXHRcdHRoaXMuZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmRhdGFTdGF0ZUluZGljYXRvckZpbHRlcjtcblx0XHR0aGlzLmlzT3B0aW1pemVkRm9yU21hbGxEZXZpY2UgPz89IENvbW1vblV0aWxzLmlzU21hbGxEZXZpY2UoKTtcblx0XHR0aGlzLm5hdmlnYXRpb25QYXRoID0gdGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ubmF2aWdhdGlvblBhdGg7XG5cdFx0aWYgKHRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNvbGxlY3Rpb24uc3RhcnRzV2l0aChcIi9cIikgJiYgaXNTaW5nbGV0b24oY29udGV4dE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQpKSB7XG5cdFx0XHR0YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jb2xsZWN0aW9uID0gdGhpcy5uYXZpZ2F0aW9uUGF0aDtcblx0XHR9XG5cdFx0dGhpcy5zZXRSZWFkT25seSgpO1xuXHRcdGlmICh0aGlzLnJvd1ByZXNzKSB7XG5cdFx0XHR0aGlzLnJvd0FjdGlvbiA9IFwiTmF2aWdhdGlvblwiO1xuXHRcdH1cblx0XHR0aGlzLnJvd1ByZXNzID8/PSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnJvdz8ucHJlc3M7XG5cdFx0dGhpcy5yb3dBY3Rpb24gPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ucm93Py5hY3Rpb247XG5cblx0XHRpZiAodGhpcy5wZXJzb25hbGl6YXRpb24gPT09IFwiZmFsc2VcIikge1xuXHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIGlmICh0aGlzLnBlcnNvbmFsaXphdGlvbiA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdHRoaXMucGVyc29uYWxpemF0aW9uID0gXCJTb3J0LENvbHVtbixGaWx0ZXJcIjtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKHRoaXMucGVyc29uYWxpemF0aW9uKSB7XG5cdFx0XHRjYXNlIFwiZmFsc2VcIjpcblx0XHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInRydWVcIjpcblx0XHRcdFx0dGhpcy5wZXJzb25hbGl6YXRpb24gPSBcIlNvcnQsQ29sdW1uLEZpbHRlclwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuaXNTZWFyY2hhYmxlID09PSBmYWxzZSkge1xuXHRcdFx0dGhpcy5zZWFyY2hhYmxlID0gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2VhcmNoYWJsZSA9IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc2VhcmNoYWJsZTtcblx0XHR9XG5cblx0XHRsZXQgdXNlQmFzaWNTZWFyY2ggPSBmYWxzZTtcblxuXHRcdC8vIE5vdGUgZm9yIHRoZSAnZmlsdGVyQmFyJyBwcm9wZXJ0eTpcblx0XHQvLyAxLiBJRCByZWxhdGl2ZSB0byB0aGUgdmlldyBvZiB0aGUgVGFibGUuXG5cdFx0Ly8gMi4gQWJzb2x1dGUgSUQuXG5cdFx0Ly8gMy4gSUQgd291bGQgYmUgY29uc2lkZXJlZCBpbiBhc3NvY2lhdGlvbiB0byBUYWJsZUFQSSdzIElELlxuXHRcdGlmICghdGhpcy5maWx0ZXJCYXIgJiYgIXRoaXMuZmlsdGVyQmFySWQgJiYgdGhpcy5zZWFyY2hhYmxlKSB7XG5cdFx0XHQvLyBmaWx0ZXJCYXI6IFB1YmxpYyBwcm9wZXJ0eSBmb3IgYnVpbGRpbmcgYmxvY2tzXG5cdFx0XHQvLyBmaWx0ZXJCYXJJZDogT25seSB1c2VkIGFzIEludGVybmFsIHByaXZhdGUgcHJvcGVydHkgZm9yIEZFIHRlbXBsYXRlc1xuXHRcdFx0dGhpcy5maWx0ZXJCYXJJZCA9IGdlbmVyYXRlKFt0aGlzLmlkLCBcIlN0YW5kYXJkQWN0aW9uXCIsIFwiQmFzaWNTZWFyY2hcIl0pO1xuXHRcdFx0dXNlQmFzaWNTZWFyY2ggPSB0cnVlO1xuXHRcdH1cblx0XHQvLyBJbnRlcm5hbCBwcm9wZXJ0aWVzXG5cdFx0dGhpcy51c2VCYXNpY1NlYXJjaCA9IHVzZUJhc2ljU2VhcmNoO1xuXHRcdHRoaXMudGFibGVUeXBlID0gdGhpcy50eXBlO1xuXHRcdHRoaXMuc2hvd0NyZWF0ZSA9IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc3RhbmRhcmRBY3Rpb25zLmFjdGlvbnMuY3JlYXRlLnZpc2libGUgfHwgdHJ1ZTtcblx0XHR0aGlzLmF1dG9CaW5kT25Jbml0ID0gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5hdXRvQmluZE9uSW5pdDtcblxuXHRcdHN3aXRjaCAodGhpcy5yZWFkT25seSkge1xuXHRcdFx0Y2FzZSB0cnVlOlxuXHRcdFx0XHR0aGlzLmNvbHVtbkVkaXRNb2RlID0gXCJEaXNwbGF5XCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBmYWxzZTpcblx0XHRcdFx0dGhpcy5jb2x1bW5FZGl0TW9kZSA9IFwiRWRpdGFibGVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aGlzLmNvbHVtbkVkaXRNb2RlID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBhbm5vdGF0aW9uIHBhdGggcG9pbnRpbmcgdG8gdGhlIHZpc3VhbGl6YXRpb24gYW5ub3RhdGlvbiAoTGluZUl0ZW0pLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dE9iamVjdFBhdGggVGhlIGRhdGFtb2RlbCBvYmplY3QgcGF0aCBmb3IgdGhlIHRhYmxlXG5cdCAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuXHQgKiBAcmV0dXJucyBUaGUgYW5ub3RhdGlvbiBwYXRoXG5cdCAqL1xuXHRzdGF0aWMgZ2V0VmlzdWFsaXphdGlvblBhdGgoY29udGV4dE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBzdHJpbmcge1xuXHRcdGNvbnN0IG1ldGFQYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChjb250ZXh0T2JqZWN0UGF0aCkgYXMgc3RyaW5nO1xuXG5cdFx0Ly8gZmFsbGJhY2sgdG8gZGVmYXVsdCBMaW5lSXRlbSBpZiBtZXRhcGF0aCBpcyBub3Qgc2V0XG5cdFx0aWYgKCFtZXRhUGF0aCkge1xuXHRcdFx0TG9nLmVycm9yKGBNaXNzaW5nIG1ldGEgcGF0aCBwYXJhbWV0ZXIgZm9yIExpbmVJdGVtYCk7XG5cdFx0XHRyZXR1cm4gYEAke1VJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtfWA7XG5cdFx0fVxuXG5cdFx0aWYgKGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSkge1xuXHRcdFx0cmV0dXJuIG1ldGFQYXRoOyAvLyBNZXRhUGF0aCBpcyBhbHJlYWR5IHBvaW50aW5nIHRvIGEgTGluZUl0ZW1cblx0XHR9XG5cdFx0Ly9OZWVkIHRvIHN3aXRjaCB0byB0aGUgY29udGV4dCByZWxhdGVkIHRoZSBQViBvciBTUFZcblx0XHRjb25zdCByZXNvbHZlZFRhcmdldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24obWV0YVBhdGgpO1xuXG5cdFx0bGV0IHZpc3VhbGl6YXRpb25zOiBWaXN1YWxpemF0aW9uQW5kUGF0aFtdID0gW107XG5cdFx0c3dpdGNoIChjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRpZiAoY29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0XHR2aXN1YWxpemF0aW9ucyA9IGdldFZpc3VhbGl6YXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQoXG5cdFx0XHRcdFx0XHRjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QuUHJlc2VudGF0aW9uVmFyaWFudCxcblx0XHRcdFx0XHRcdG1ldGFQYXRoLFxuXHRcdFx0XHRcdFx0cmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnQ6XG5cdFx0XHRcdHZpc3VhbGl6YXRpb25zID0gZ2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudChcblx0XHRcdFx0XHRjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QsXG5cdFx0XHRcdFx0bWV0YVBhdGgsXG5cdFx0XHRcdFx0cmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHR0cnVlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRMb2cuZXJyb3IoYEJhZCBtZXRhcGF0aCBwYXJhbWV0ZXIgZm9yIHRhYmxlIDogJHtjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybX1gKTtcblx0XHR9XG5cblx0XHRjb25zdCBsaW5lSXRlbVZpeiA9IHZpc3VhbGl6YXRpb25zLmZpbmQoKHZpeikgPT4ge1xuXHRcdFx0cmV0dXJuIHZpei52aXN1YWxpemF0aW9uLnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtO1xuXHRcdH0pO1xuXG5cdFx0aWYgKGxpbmVJdGVtVml6KSB7XG5cdFx0XHRyZXR1cm4gbGluZUl0ZW1WaXouYW5ub3RhdGlvblBhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGZhbGxiYWNrIHRvIGRlZmF1bHQgTGluZUl0ZW0gaWYgYW5ub3RhdGlvbiBtaXNzaW5nIGluIFBWXG5cdFx0XHRMb2cuZXJyb3IoYEJhZCBtZXRhIHBhdGggcGFyYW1ldGVyIGZvciBMaW5lSXRlbTogJHtjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybX1gKTtcblx0XHRcdHJldHVybiBgQCR7VUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW19YDsgLy8gRmFsbGJhY2tcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgZ2V0UHJlc2VudGF0aW9uUGF0aChjb250ZXh0T2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdFx0bGV0IHByZXNlbnRhdGlvblBhdGg7XG5cblx0XHRzd2l0Y2ggKGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdD8udGVybSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRwcmVzZW50YXRpb25QYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChjb250ZXh0T2JqZWN0UGF0aCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRwcmVzZW50YXRpb25QYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChjb250ZXh0T2JqZWN0UGF0aCkgKyBcIi9QcmVzZW50YXRpb25WYXJpYW50XCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdHJldHVybiBwcmVzZW50YXRpb25QYXRoO1xuXHR9XG5cblx0c3RhdGljIHNldFVwVGFibGVEZWZpbml0aW9uKHRhYmxlOiBUYWJsZUJsb2NrLCBzZXR0aW5nczogYW55KTogVGFibGVWaXN1YWxpemF0aW9uIHtcblx0XHRsZXQgdGFibGVEZWZpbml0aW9uID0gdGFibGUudGFibGVEZWZpbml0aW9uO1xuXHRcdGlmICghdGFibGVEZWZpbml0aW9uKSB7XG5cdFx0XHRjb25zdCBpbml0aWFsQ29udmVydGVyQ29udGV4dCA9IHRhYmxlLmdldENvbnZlcnRlckNvbnRleHQodGFibGUuY29udGV4dE9iamVjdFBhdGgsIHRhYmxlLmNvbnRleHRQYXRoPy5nZXRQYXRoKCksIHNldHRpbmdzKTtcblx0XHRcdGNvbnN0IHZpc3VhbGl6YXRpb25QYXRoID0gVGFibGVCbG9jay5nZXRWaXN1YWxpemF0aW9uUGF0aCh0YWJsZS5jb250ZXh0T2JqZWN0UGF0aCwgaW5pdGlhbENvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0Y29uc3QgcHJlc2VudGF0aW9uUGF0aCA9IFRhYmxlQmxvY2suZ2V0UHJlc2VudGF0aW9uUGF0aCh0YWJsZS5jb250ZXh0T2JqZWN0UGF0aCk7XG5cblx0XHRcdC8vQ2hlY2sgaWYgd2UgaGF2ZSBBY3Rpb25Hcm91cCBhbmQgYWRkIG5lc3RlZCBhY3Rpb25zXG5cblx0XHRcdGNvbnN0IGV4dHJhUGFyYW1zOiBhbnkgPSB7fTtcblx0XHRcdGNvbnN0IHRhYmxlU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGVuYWJsZUV4cG9ydDogdGFibGUuZW5hYmxlRXhwb3J0LFxuXHRcdFx0XHRmcm96ZW5Db2x1bW5Db3VudDogdGFibGUuZnJvemVuQ29sdW1uQ291bnQsXG5cdFx0XHRcdGVuYWJsZUZ1bGxTY3JlZW46IHRhYmxlLmVuYWJsZUZ1bGxTY3JlZW4sXG5cdFx0XHRcdGVuYWJsZVBhc3RlOiB0YWJsZS5lbmFibGVQYXN0ZSxcblx0XHRcdFx0c2VsZWN0aW9uTW9kZTogdGFibGUuc2VsZWN0aW9uTW9kZSxcblx0XHRcdFx0dHlwZTogdGFibGUudHlwZVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKHRhYmxlLmFjdGlvbnMpIHtcblx0XHRcdFx0T2JqZWN0LnZhbHVlcyh0YWJsZS5hY3Rpb25zKT8uZm9yRWFjaCgoaXRlbSkgPT4ge1xuXHRcdFx0XHRcdHRhYmxlLmFjdGlvbnMgPSB7IC4uLnRhYmxlLmFjdGlvbnMsIC4uLihpdGVtIGFzIEV4dGVuZGVkQWN0aW9uR3JvdXApLm1lbnVDb250ZW50QWN0aW9ucyB9O1xuXHRcdFx0XHRcdGRlbGV0ZSAoaXRlbSBhcyBFeHRlbmRlZEFjdGlvbkdyb3VwKS5tZW51Q29udGVudEFjdGlvbnM7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyB0YWJsZSBhY3Rpb25zIGFuZCBjb2x1bW5zIGFzIHt9IGlmIG5vdCBwcm92aWRlZCB0byBhbGxvdyBtZXJnZSB3aXRoIG1hbmlmZXN0IHNldHRpbmdzXG5cdFx0XHRleHRyYVBhcmFtc1t2aXN1YWxpemF0aW9uUGF0aF0gPSB7XG5cdFx0XHRcdGFjdGlvbnM6IHRhYmxlLmFjdGlvbnMgfHwge30sXG5cdFx0XHRcdGNvbHVtbnM6IHRhYmxlLmNvbHVtbnMgfHwge30sXG5cdFx0XHRcdHRhYmxlU2V0dGluZ3M6IHRhYmxlU2V0dGluZ3Ncblx0XHRcdH07XG5cdFx0XHRjb25zdCBjb252ZXJ0ZXJDb250ZXh0ID0gdGFibGUuZ2V0Q29udmVydGVyQ29udGV4dChcblx0XHRcdFx0dGFibGUuY29udGV4dE9iamVjdFBhdGgsXG5cdFx0XHRcdHRhYmxlLmNvbnRleHRQYXRoPy5nZXRQYXRoKCksXG5cdFx0XHRcdHNldHRpbmdzLFxuXHRcdFx0XHRleHRyYVBhcmFtc1xuXHRcdFx0KTtcblxuXHRcdFx0Y29uc3QgdmlzdWFsaXphdGlvbkRlZmluaXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHRcdHZpc3VhbGl6YXRpb25QYXRoLFxuXHRcdFx0XHR0YWJsZS51c2VDb25kZW5zZWRMYXlvdXQsXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRwcmVzZW50YXRpb25QYXRoLFxuXHRcdFx0XHR0cnVlXG5cdFx0XHQpO1xuXG5cdFx0XHR0YWJsZURlZmluaXRpb24gPSB2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi52aXN1YWxpemF0aW9uc1swXSBhcyBUYWJsZVZpc3VhbGl6YXRpb247XG5cdFx0XHR0YWJsZS50YWJsZURlZmluaXRpb24gPSB0YWJsZURlZmluaXRpb247XG5cdFx0fVxuXHRcdHRhYmxlLnRhYmxlRGVmaW5pdGlvbkNvbnRleHQgPSBNYWNyb0FQSS5jcmVhdGVCaW5kaW5nQ29udGV4dCh0YWJsZS50YWJsZURlZmluaXRpb24gYXMgb2JqZWN0LCBzZXR0aW5ncyk7XG5cblx0XHRyZXR1cm4gdGFibGVEZWZpbml0aW9uO1xuXHR9XG5cblx0c2V0VXBJZCgpIHtcblx0XHRpZiAodGhpcy5pZCkge1xuXHRcdFx0Ly8gVGhlIGdpdmVuIElEIHNoYWxsIGJlIGFzc2lnbmVkIHRvIHRoZSBUYWJsZUFQSSBhbmQgbm90IHRvIHRoZSBNREMgVGFibGVcblx0XHRcdHRoaXMuX2FwaUlkID0gdGhpcy5pZDtcblx0XHRcdHRoaXMuaWQgPSB0aGlzLmdldENvbnRlbnRJZCh0aGlzLmlkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gV2UgZ2VuZXJhdGUgdGhlIElELiBEdWUgdG8gY29tcGF0aWJpbGl0eSByZWFzb25zIHdlIGtlZXAgaXQgb24gdGhlIE1EQyBUYWJsZSBidXQgcHJvdmlkZSBhc3NpZ25cblx0XHRcdC8vIHRoZSBJRCB3aXRoIGEgOjpUYWJsZSBzdWZmaXggdG8gdGhlIFRhYmxlQVBJXG5cdFx0XHRjb25zdCB0YWJsZURlZmluaXRpb24gPSB0aGlzLnRhYmxlRGVmaW5pdGlvbjtcblx0XHRcdHRoaXMuaWQgPz89IHRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmlkO1xuXHRcdFx0dGhpcy5fYXBpSWQgPSBnZW5lcmF0ZShbdGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uaWQsIFwiVGFibGVcIl0pO1xuXHRcdH1cblx0fVxuXG5cdHNldFJlYWRPbmx5KCkge1xuXHRcdC8vIFNwZWNpYWwgY29kZSBmb3IgcmVhZE9ubHlcblx0XHQvLyByZWFkb25seSA9IGZhbHNlIC0+IEZvcmNlIGVkaXRhYmxlXG5cdFx0Ly8gcmVhZG9ubHkgPSB0cnVlIC0+IEZvcmNlIGRpc3BsYXkgbW9kZVxuXHRcdC8vIHJlYWRvbmx5ID0gdW5kZWZpbmVkIC0+IEJvdW5kIHRvIGVkaXQgZmxvd1xuXHRcdGlmICh0aGlzLnJlYWRPbmx5ID09PSB1bmRlZmluZWQgJiYgdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5kaXNwbGF5TW9kZSA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhpcy5yZWFkT25seSA9IHRydWU7XG5cdFx0fVxuXHR9XG5cblx0Z2V0VGFibGVUeXBlID0gKCkgPT4ge1xuXHRcdGNvbnN0IGNvbGxlY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb24uZ2V0T2JqZWN0KCk7XG5cdFx0c3dpdGNoICh0aGlzLnRhYmxlVHlwZSkge1xuXHRcdFx0Y2FzZSBcIkdyaWRUYWJsZVwiOlxuXHRcdFx0XHRyZXR1cm4geG1sYDxtZGNUYWJsZTpHcmlkVGFibGVUeXBlXG4gICAgICAgICAgICAgICAgcm93Q291bnRNb2RlPVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnJvd0NvdW50TW9kZX1cIlxuICAgICAgICAgICAgICAgIHJvd0NvdW50PVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnJvd0NvdW50fVwiXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uTGltaXQ9XCIke3RoaXMuc2VsZWN0aW9uTGltaXR9XCJcblx0XHRcdFx0Zml4ZWRDb2x1bW5Db3VudD1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5mcm96ZW5Db2x1bW5Db3VudH1cIlxuICAgICAgICAgICAgLz5gO1xuXHRcdFx0Y2FzZSBcIlRyZWVUYWJsZVwiOlxuXHRcdFx0XHRyZXR1cm4geG1sYDxtZGNUYWJsZTpUcmVlVGFibGVUeXBlXG4gICAgICAgICAgICAgICAgcm93Q291bnRNb2RlPVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnJvd0NvdW50TW9kZX1cIlxuICAgICAgICAgICAgICAgIHJvd0NvdW50PVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLnJvd0NvdW50fVwiXG5cdFx0XHRcdGZpeGVkQ29sdW1uQ291bnQ9XCIke3RoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuZnJvemVuQ29sdW1uQ291bnR9XCJcbiAgICAgICAgICAgIC8+YDtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnN0IGdyb3dpbmdNb2RlID0gY29sbGVjdGlvbi4ka2luZCA9PT0gXCJFbnRpdHlTZXRcIiA/IFwiU2Nyb2xsXCIgOiB1bmRlZmluZWQ7XG5cdFx0XHRcdHJldHVybiB4bWxgPG1kY1RhYmxlOlJlc3BvbnNpdmVUYWJsZVR5cGVcbiAgICAgICAgICAgICAgICBzaG93RGV0YWlsc0J1dHRvbj1cInRydWVcIlxuICAgICAgICAgICAgICAgIGRldGFpbHNCdXR0b25TZXR0aW5nPVwiez1bJ0xvdycsICdNZWRpdW0nLCAnTm9uZSddfVwiXG4gICAgICAgICAgICAgICAgZ3Jvd2luZ01vZGU9XCIke2dyb3dpbmdNb2RlfVwiXG4gICAgICAgICAgICAvPmA7XG5cdFx0fVxuXHR9O1xuXG5cdF9nZXRFbnRpdHlUeXBlKCkge1xuXHRcdHJldHVybiAodGhpcy5jb2xsZWN0aW9uRW50aXR5IGFzIEVudGl0eVNldCk/LmVudGl0eVR5cGUgfHwgKHRoaXMuY29sbGVjdGlvbkVudGl0eSBhcyBOYXZpZ2F0aW9uUHJvcGVydHkpPy50YXJnZXRUeXBlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgdGVtcGxhdGUgc3RyaW5nIGZvciB0aGUgdmFsdWVIZWxwIGJhc2VkIG9uIHRoZSBkYXRhRmllbGQgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIGRhdEZpZWxkUGF0aCBEYXRGaWVsZFBhdGggdG8gYmUgZXZhbHVhdGVkXG5cdCAqIEByZXR1cm5zIFRoZSB4bWwgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2YWx1ZUhlbHBcblx0ICovXG5cdGdldFZhbHVlSGVscFRlbXBsYXRlRnJvbVBhdGgoZGF0RmllbGRQYXRoPzogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIGRhdEZpZWxkUGF0aFxuXHRcdFx0PyBgPG1hY3JvczpWYWx1ZUhlbHBcbiAgICAgICAgaWRQcmVmaXg9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIlRhYmxlVmFsdWVIZWxwXCJdKX1cIlxuICAgICAgICBwcm9wZXJ0eT1cIiR7ZGF0RmllbGRQYXRofS9WYWx1ZVwiXG4gICAgLz5gXG5cdFx0XHQ6IFwiXCI7XG5cdH1cblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBzdHJpbmcgZm9yIHRoZSB2YWx1ZUhlbHAgYmFzZWQgb24gY29sdW1uLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29sdW1uIENvbHVtbiB0byBiZSBldmFsdWF0ZWRcblx0ICogQHJldHVybnMgVGhlIHhtbCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZhbHVlSGVscFxuXHQgKi9cblx0Z2V0VmFsdWVIZWxwKGNvbHVtbjogQW5ub3RhdGlvblRhYmxlQ29sdW1uKSB7XG5cdFx0Y29uc3QgZGF0YUZpZWxkT2JqZWN0ID0gdGhpcy5jb252ZXJ0ZWRNZXRhRGF0YS5yZXNvbHZlUGF0aChjb2x1bW4uYW5ub3RhdGlvblBhdGgpLnRhcmdldCBhcyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzO1xuXHRcdGlmIChpc0RhdGFGaWVsZEZvckFubm90YXRpb24oZGF0YUZpZWxkT2JqZWN0KSAmJiBkYXRhRmllbGRPYmplY3QuVGFyZ2V0LiR0YXJnZXQudGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQpIHtcblx0XHRcdHJldHVybiBgYDtcblx0XHR9IGVsc2UgaWYgKGlzRGF0YUZpZWxkRm9yQW5ub3RhdGlvbihkYXRhRmllbGRPYmplY3QpICYmIGRhdGFGaWVsZE9iamVjdC5UYXJnZXQuJHRhcmdldC50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwKSB7XG5cdFx0XHRsZXQgdGVtcGxhdGUgPSBgYDtcblx0XHRcdGZvciAoY29uc3QgaW5kZXggaW4gZGF0YUZpZWxkT2JqZWN0LlRhcmdldC4kdGFyZ2V0LkRhdGEpIHtcblx0XHRcdFx0dGVtcGxhdGUgKz0gdGhpcy5nZXRWYWx1ZUhlbHBUZW1wbGF0ZUZyb21QYXRoKGNvbHVtbi5hbm5vdGF0aW9uUGF0aCArIFwiL1RhcmdldC8kQW5ub3RhdGlvblBhdGgvRGF0YS9cIiArIGluZGV4KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB4bWxgJHt0ZW1wbGF0ZX1gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4geG1sYCR7dGhpcy5nZXRWYWx1ZUhlbHBUZW1wbGF0ZUZyb21QYXRoKGNvbHVtbi5hbm5vdGF0aW9uUGF0aCl9YDtcblx0XHR9XG5cdH1cblxuXHRnZXREZXBlbmRlbnRzID0gKCkgPT4ge1xuXHRcdGxldCBkZXBlbmRlbnRzID0gYGA7XG5cdFx0aWYgKCF0aGlzLnJlYWRPbmx5ICYmIHRoaXMudGFibGVEZWZpbml0aW9uPy5jb2x1bW5zKSB7XG5cdFx0XHRmb3IgKGNvbnN0IGNvbHVtbiBvZiB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb2x1bW5zKSB7XG5cdFx0XHRcdGlmIChjb2x1bW4uYXZhaWxhYmlsaXR5ID09PSBcIkRlZmF1bHRcIiAmJiBcImFubm90YXRpb25QYXRoXCIgaW4gY29sdW1uKSB7XG5cdFx0XHRcdFx0ZGVwZW5kZW50cyArPSB0aGlzLmdldFZhbHVlSGVscChjb2x1bW4pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IHN0YW5kYXJkQWN0aW9ucyA9IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc3RhbmRhcmRBY3Rpb25zLmFjdGlvbnM7XG5cblx0XHRpZiAodGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuaXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQgJiYgc3RhbmRhcmRBY3Rpb25zLmNyZWF0ZS5pc1RlbXBsYXRlZCA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdGRlcGVuZGVudHMgKz0geG1sYDxjb250cm9sOkNvbW1hbmRFeGVjdXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhlY3V0ZT1cIiR7VGFibGVIZWxwZXIucHJlc3NFdmVudEZvckNyZWF0ZUJ1dHRvbih0aGlzLCB0cnVlKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlPVwiJHtzdGFuZGFyZEFjdGlvbnMuY3JlYXRlLnZpc2libGV9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlZD1cIiR7c3RhbmRhcmRBY3Rpb25zLmNyZWF0ZS5lbmFibGVkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ9XCJDcmVhdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+YDtcblx0XHR9XG5cdFx0aWYgKHN0YW5kYXJkQWN0aW9ucy5kZWxldGUuaXNUZW1wbGF0ZWQgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRjb25zdCBoZWFkZXJJbmZvID0gKFxuXHRcdFx0XHQodGhpcy5jb2xsZWN0aW9uRW50aXR5IGFzIEVudGl0eVNldCk/LmVudGl0eVR5cGUgfHwgKHRoaXMuY29sbGVjdGlvbkVudGl0eSBhcyBOYXZpZ2F0aW9uUHJvcGVydHkpPy50YXJnZXRUeXBlXG5cdFx0XHQpPy5hbm5vdGF0aW9ucz8uVUk/LkhlYWRlckluZm87XG5cdFx0XHRkZXBlbmRlbnRzICs9IHhtbGA8Y29udHJvbDpDb21tYW5kRXhlY3V0aW9uXG4gICAgICAgICAgICAgICAgICAgICAgICBleGVjdXRlPVwiJHtUYWJsZUhlbHBlci5wcmVzc0V2ZW50Rm9yRGVsZXRlQnV0dG9uKFxuXHRcdFx0XHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRcdFx0XHR0aGlzLmNvbGxlY3Rpb25FbnRpdHkubmFtZSxcblx0XHRcdFx0XHRcdFx0aGVhZGVySW5mbyxcblx0XHRcdFx0XHRcdFx0dGhpcy5jb250ZXh0T2JqZWN0UGF0aFxuXHRcdFx0XHRcdFx0KX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZT1cIiR7c3RhbmRhcmRBY3Rpb25zLmRlbGV0ZS52aXNpYmxlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVkPVwiJHtzdGFuZGFyZEFjdGlvbnMuZGVsZXRlLmVuYWJsZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ9XCJEZWxldGVFbnRyeVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAvPmA7XG5cdFx0fVxuXG5cdFx0Zm9yIChjb25zdCBhY3Rpb25OYW1lIGluIHRoaXMudGFibGVEZWZpbml0aW9uLmNvbW1hbmRBY3Rpb25zKSB7XG5cdFx0XHRjb25zdCBhY3Rpb24gPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb21tYW5kQWN0aW9uc1thY3Rpb25OYW1lXTtcblx0XHRcdGRlcGVuZGVudHMgKz0gYCR7dGhpcy5nZXRBY3Rpb25Db21tYW5kKGFjdGlvbk5hbWUsIGFjdGlvbil9YDtcblx0XHR9XG5cdFx0ZGVwZW5kZW50cyArPSBgPGNvbnRyb2w6Q29tbWFuZEV4ZWN1dGlvbiBleGVjdXRlPVwiVGFibGVSdW50aW1lLmRpc3BsYXlUYWJsZVNldHRpbmdzXCIgY29tbWFuZD1cIlRhYmxlU2V0dGluZ3NcIiAvPmA7XG5cdFx0aWYgKHRoaXMudmFyaWFudE1hbmFnZW1lbnQgPT09IFwiTm9uZVwiKSB7XG5cdFx0XHRkZXBlbmRlbnRzICs9IGA8IS0tIFBlcnNpc3RlbmNlIHByb3ZpZGVyIG9mZmVycyBwZXJzaXN0aW5nIHBlcnNvbmFsaXphdGlvbiBjaGFuZ2VzIHdpdGhvdXQgdmFyaWFudCBtYW5hZ2VtZW50IC0tPlxuXHRcdFx0PHAxM246UGVyc2lzdGVuY2VQcm92aWRlciBpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiUGVyc2lzdGVuY2VQcm92aWRlclwiXSl9XCIgZm9yPVwiJHt0aGlzLmlkfVwiIC8+YDtcblx0XHR9XG5cblx0XHRyZXR1cm4geG1sYCR7ZGVwZW5kZW50c31gO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIHRlbXBsYXRlIHN0cmluZyBmb3IgdGhlIGFjdGlvbkNvbW1hbmQuXG5cdCAqXG5cdCAqIEBwYXJhbSBhY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIGFjdGlvbiBBY3Rpb24gdG8gYmUgZXZhbHVhdGVkXG5cdCAqIEByZXR1cm5zIFRoZSB4bWwgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY3Rpb25Db21tYW5kXG5cdCAqL1xuXHRnZXRBY3Rpb25Db21tYW5kKGFjdGlvbk5hbWU6IHN0cmluZywgYWN0aW9uOiBDdXN0b21BY3Rpb24pIHtcblx0XHRjb25zdCBkYXRhRmllbGQgPSBhY3Rpb24uYW5ub3RhdGlvblBhdGhcblx0XHRcdD8gKHRoaXMuY29udmVydGVkTWV0YURhdGEucmVzb2x2ZVBhdGgoYWN0aW9uLmFubm90YXRpb25QYXRoKS50YXJnZXQgYXMgRGF0YUZpZWxkRm9yQWN0aW9uIHwgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKVxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgYWN0aW9uQ29udGV4dFBhdGggPSBhY3Rpb24uYW5ub3RhdGlvblBhdGhcblx0XHRcdD8gQ29tbW9uSGVscGVyLmdldEFjdGlvbkNvbnRleHQodGhpcy5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGFjdGlvbi5hbm5vdGF0aW9uUGF0aCArIFwiL0FjdGlvblwiKSEpXG5cdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRjb25zdCBhY3Rpb25Db250ZXh0ID0gdGhpcy5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGFjdGlvbkNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBkYXRhRmllbGREYXRhTW9kZWxPYmplY3RQYXRoID0gYWN0aW9uQ29udGV4dFxuXHRcdFx0PyBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKGFjdGlvbkNvbnRleHQsIHRoaXMuY29sbGVjdGlvbilcblx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGlzQm91bmQgPSAoZGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFjdGlvbik/LkFjdGlvblRhcmdldD8uaXNCb3VuZDtcblx0XHRjb25zdCBpc09wZXJhdGlvbkF2YWlsYWJsZSA9XG5cdFx0XHQoZGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckFjdGlvbik/LkFjdGlvblRhcmdldD8uYW5ub3RhdGlvbnM/LkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZT8udmFsdWVPZigpICE9PSBmYWxzZTtcblx0XHRjb25zdCBkaXNwbGF5Q29tbWFuZEFjdGlvbiA9IGFjdGlvbi50eXBlID09PSBcIkZvckFjdGlvblwiID8gaXNCb3VuZCAhPT0gdHJ1ZSB8fCBpc09wZXJhdGlvbkF2YWlsYWJsZSA6IHRydWU7XG5cdFx0aWYgKGRpc3BsYXlDb21tYW5kQWN0aW9uKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxpbnRlcm5hbE1hY3JvOkFjdGlvbkNvbW1hbmRcblx0XHRcdFx0XHRcdFx0YWN0aW9uPVwie3RhYmxlRGVmaW5pdGlvbj5jb21tYW5kQWN0aW9ucy8ke2FjdGlvbk5hbWV9fVwiXG5cdFx0XHRcdFx0XHRcdG9uRXhlY3V0ZUFjdGlvbj1cIiR7VGFibGVIZWxwZXIucHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbihcblx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0T2JqZWN0UGF0aDogdGhpcy5jb250ZXh0T2JqZWN0UGF0aCxcblx0XHRcdFx0XHRcdFx0XHRcdGlkOiB0aGlzLmlkXG5cdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuY29sbGVjdGlvbkVudGl0eS5uYW1lLFxuXHRcdFx0XHRcdFx0XHRcdHRoaXMudGFibGVEZWZpbml0aW9uLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCxcblx0XHRcdFx0XHRcdFx0XHRhY3Rpb25Db250ZXh0Py5nZXRPYmplY3QoKSxcblx0XHRcdFx0XHRcdFx0XHRhY3Rpb24uaXNOYXZpZ2FibGUsXG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmVuYWJsZUF1dG9TY3JvbGwsXG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvblxuXHRcdFx0XHRcdFx0XHQpfVwiXG5cdFx0XHRcdFx0XHRcdG9uRXhlY3V0ZUlCTj1cIiR7Q29tbW9uSGVscGVyLmdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTihcblx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGQsXG5cdFx0XHRcdFx0XHRcdFx0XCIke2ludGVybmFsPnNlbGVjdGVkQ29udGV4dHN9XCIsXG5cdFx0XHRcdFx0XHRcdFx0IXRoaXMudGFibGVEZWZpbml0aW9uLmVuYWJsZUFuYWx5dGljc1xuXHRcdFx0XHRcdFx0XHQpfVwiXG5cdFx0XHRcdFx0XHRcdG9uRXhlY3V0ZU1hbmlmZXN0PVwiJHthY3Rpb24ubm9XcmFwID8gYWN0aW9uLnByZXNzIDogQ29tbW9uSGVscGVyLmJ1aWxkQWN0aW9uV3JhcHBlcihhY3Rpb24sIHRoaXMpfVwiXG5cdFx0XHRcdFx0XHRcdGlzSUJORW5hYmxlZD1cIiR7XG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmVuYWJsZWQgPz9cblx0XHRcdFx0XHRcdFx0XHRUYWJsZUhlbHBlci5pc0RhdGFGaWVsZEZvcklCTkVuYWJsZWQoXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGF0YUZpZWxkISBhcyBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdFx0XHRcdFx0XHRcdFx0XHQhIShkYXRhRmllbGQgYXMgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKS5SZXF1aXJlc0NvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0XHQoZGF0YUZpZWxkIGFzIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbikuTmF2aWdhdGlvbkF2YWlsYWJsZVxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0fVwiXG5cdFx0XHRcdFx0XHRcdGlzQWN0aW9uRW5hYmxlZD1cIiR7XG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmVuYWJsZWQgPz9cblx0XHRcdFx0XHRcdFx0XHRUYWJsZUhlbHBlci5pc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWQoXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLnRhYmxlRGVmaW5pdGlvbixcblx0XHRcdFx0XHRcdFx0XHRcdChkYXRhRmllbGQhIGFzIERhdGFGaWVsZEZvckFjdGlvbikuQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdFx0ISFpc0JvdW5kLFxuXHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uQ29udGV4dFBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRhY3Rpb24uZW5hYmxlT25TZWxlY3QsXG5cdFx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGREYXRhTW9kZWxPYmplY3RQYXRoPy50YXJnZXRFbnRpdHlUeXBlXG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHR9XCJcblx0XHRcdFx0XHRcdFx0Lz5gO1xuXHRcdH1cblx0XHRyZXR1cm4gYGA7XG5cdH1cblx0Z2V0QWN0aW9ucyA9ICgpID0+IHtcblx0XHRsZXQgZGVwZW5kZW50cyA9IFwiXCI7XG5cdFx0aWYgKHRoaXMub25TZWdtZW50ZWRCdXR0b25QcmVzc2VkKSB7XG5cdFx0XHRkZXBlbmRlbnRzID0gYDxtZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uXG4gICAgICAgICAgICBsYXlvdXRJbmZvcm1hdGlvbj1cIntcbiAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRpb25OYW1lOiAnZW5kJyxcbiAgICAgICAgICAgICAgICAgICAgYWxpZ25tZW50OiAnRW5kJ1xuICAgICAgICAgICAgICAgIH1cIlxuICAgICAgICAgICAgdmlzaWJsZT1cIns9IFxcJHtwYWdlSW50ZXJuYWw+YWxwQ29udGVudFZpZXd9ID09PSAnVGFibGUnIH1cIlxuICAgICAgICA+XG4gICAgICAgICAgICA8U2VnbWVudGVkQnV0dG9uXG4gICAgICAgICAgICAgICAgaWQ9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIlNlZ21lbnRlZEJ1dHRvblwiLCBcIlRlbXBsYXRlQ29udGVudFZpZXdcIl0pfVwiXG4gICAgICAgICAgICAgICAgc2VsZWN0PVwiJHt0aGlzLm9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZH1cIlxuICAgICAgICAgICAgICAgIHNlbGVjdGVkS2V5PVwie3BhZ2VJbnRlcm5hbD5hbHBDb250ZW50Vmlld31cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxpdGVtcz5gO1xuXG5cdFx0XHRpZiAoQ29tbW9uSGVscGVyLmlzRGVza3RvcCgpKSB7XG5cdFx0XHRcdGRlcGVuZGVudHMgKz0gYDxTZWdtZW50ZWRCdXR0b25JdGVtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcD1cIntzYXAuZmUuaTE4bj5NX0NPTU1PTl9IWUJSSURfU0VHTUVOVEVEX0JVVFRPTl9JVEVNX1RPT0xUSVB9XCJcblx0XHRcdFx0XHRcdFx0a2V5ID0gXCJIeWJyaWRcIlxuXHRcdFx0XHRcdFx0XHRpY29uID0gXCJzYXAtaWNvbjovL2NoYXJ0LXRhYmxlLXZpZXdcIlxuXHRcdFx0XHRcdFx0XHQvPmA7XG5cdFx0XHR9XG5cdFx0XHRkZXBlbmRlbnRzICs9IGA8U2VnbWVudGVkQnV0dG9uSXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgdG9vbHRpcD1cIntzYXAuZmUuaTE4bj5NX0NPTU1PTl9DSEFSVF9TRUdNRU5URURfQlVUVE9OX0lURU1fVE9PTFRJUH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PVwiQ2hhcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWNvbj1cInNhcC1pY29uOi8vYmFyLWNoYXJ0XCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPFNlZ21lbnRlZEJ1dHRvbkl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRvb2x0aXA9XCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fVEFCTEVfU0VHTUVOVEVEX0JVVFRPTl9JVEVNX1RPT0xUSVB9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT1cIlRhYmxlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb249XCJzYXAtaWNvbjovL3RhYmxlLXZpZXdcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvaXRlbXM+XG4gICAgICAgICAgICA8L1NlZ21lbnRlZEJ1dHRvbj5cbiAgICAgICAgPC9tZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPmA7XG5cdFx0fVxuXG5cdFx0ZGVwZW5kZW50cyArPSBgJHtnZXRUYWJsZUFjdGlvblRlbXBsYXRlKHRoaXMpfWA7XG5cdFx0cmV0dXJuIHhtbGAke2RlcGVuZGVudHN9YDtcblx0fTtcblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSB0ZW1wbGF0ZSBzdHJpbmcgZm9yIHRoZSBDcmVhdGlvblJvdy5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHhtbCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIENyZWF0aW9uUm93XG5cdCAqL1xuXHRnZXRDcmVhdGlvblJvdygpIHtcblx0XHRpZiAodGhpcy5jcmVhdGlvbk1vZGUgPT09IFwiQ3JlYXRpb25Sb3dcIikge1xuXHRcdFx0Y29uc3QgY3JlYXRpb25Sb3dBY3Rpb24gPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnN0YW5kYXJkQWN0aW9ucy5hY3Rpb25zLmNyZWF0aW9uUm93O1xuXHRcdFx0aWYgKGNyZWF0aW9uUm93QWN0aW9uLmlzVGVtcGxhdGVkKSB7XG5cdFx0XHRcdHJldHVybiB4bWxgPG1kYzpjcmVhdGlvblJvdz5cblx0XHRcdFx0XHRcdFx0PG1kY1RhYmxlOkNyZWF0aW9uUm93XG5cdFx0XHRcdFx0XHRcdFx0aWQ9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIkNyZWF0aW9uUm93XCJdKX1cIlxuXHRcdFx0XHRcdFx0XHRcdHZpc2libGU9XCIke2NyZWF0aW9uUm93QWN0aW9uLnZpc2libGV9XCJcblx0XHRcdFx0XHRcdFx0XHRhcHBseT1cIiR7VGFibGVIZWxwZXIucHJlc3NFdmVudEZvckNyZWF0ZUJ1dHRvbih0aGlzLCBmYWxzZSl9XCJcblx0XHRcdFx0XHRcdFx0XHRhcHBseUVuYWJsZWQ9XCIke2NyZWF0aW9uUm93QWN0aW9uLmVuYWJsZWR9XCJcblx0XHRcdFx0XHRcdFx0XHRtYWNyb2RhdGE6ZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YT1cIiR7dGhpcy5kaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhfVwiXG5cdFx0XHRcdFx0XHRcdFx0bWFjcm9kYXRhOmN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbj1cIiR7dGhpcy5jdXN0b21WYWxpZGF0aW9uRnVuY3Rpb259XCJcblx0XHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQgICBcdCAgIDwvbWRjOmNyZWF0aW9uUm93PmA7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0Z2V0Um93U2V0dGluZygpIHtcblx0XHRsZXQgcm93U2V0dGluZ3NUZW1wbGF0ZSA9IGA8bWRjVGFibGU6Um93U2V0dGluZ3NcbiAgICAgICAgbmF2aWdhdGVkPVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnJvdz8ucm93TmF2aWdhdGVkfVwiXG4gICAgICAgIGhpZ2hsaWdodD1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5yb3c/LnJvd0hpZ2hsaWdodGluZ31cIlxuICAgICAgICA+YDtcblx0XHRpZiAodGhpcy5yb3dBY3Rpb24gPT09IFwiTmF2aWdhdGlvblwiKSB7XG5cdFx0XHRyb3dTZXR0aW5nc1RlbXBsYXRlICs9IGA8bWRjVGFibGU6cm93QWN0aW9ucz5cbiAgICAgICAgICAgICAgICA8bWRjVGFibGU6Um93QWN0aW9uSXRlbVxuICAgICAgICAgICAgICAgICAgICB0eXBlID0gXCIke3RoaXMucm93QWN0aW9ufVwiXG4gICAgICAgICAgICAgICAgICAgIHByZXNzID0gXCIke3RoaXMudGFibGVUeXBlID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiID8gXCJcIiA6IHRoaXMucm93UHJlc3N9XCJcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZSA9IFwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnJvdz8udmlzaWJsZX1cIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDwvbWRjVGFibGU6cm93QWN0aW9ucz5gO1xuXHRcdH1cblx0XHRyb3dTZXR0aW5nc1RlbXBsYXRlICs9IGA8L21kY1RhYmxlOlJvd1NldHRpbmdzPmA7XG5cdFx0cmV0dXJuIHhtbGAke3Jvd1NldHRpbmdzVGVtcGxhdGV9YDtcblx0fVxuXG5cdGdldFZhcmlhbnRNYW5hZ2VtZW50KCkge1xuXHRcdGlmICh0aGlzLnZhcmlhbnRNYW5hZ2VtZW50ID09PSBcIkNvbnRyb2xcIikge1xuXHRcdFx0cmV0dXJuIHhtbGA8bWRjOnZhcmlhbnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dmFyaWFudDpWYXJpYW50TWFuYWdlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJWTVwiXSl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3I9XCJ7dGhpcz5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3dTZXRBc0RlZmF1bHQ9XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Q9XCJ7dGhpcz52YXJpYW50U2VsZWN0ZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJMZXZlbD1cIiR7dGhpcy5oZWFkZXJMZXZlbH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhdmU9XCIke3RoaXMudmFyaWFudFNhdmVkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L21kYzp2YXJpYW50PmA7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0Z2V0UXVpY2tGaWx0ZXIoKSB7XG5cdFx0aWYgKHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuZmlsdGVycz8ucXVpY2tGaWx0ZXJzKSB7XG5cdFx0XHRjb25zdCBxdWlja0ZpbHRlcnMgPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sLmZpbHRlcnMucXVpY2tGaWx0ZXJzO1xuXHRcdFx0cmV0dXJuIHhtbGA8bWRjOnF1aWNrRmlsdGVyPlxuXHRcdFx0XHRcdFx0PG1hY3JvVGFibGU6UXVpY2tGaWx0ZXJTZWxlY3RvclxuXHRcdFx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiUXVpY2tGaWx0ZXJDb250YWluZXJcIl0pfVwiXG5cdFx0XHRcdFx0XHRcdG1ldGFQYXRoPVwiJHt0aGlzLm1ldGFQYXRofVwiXG5cdFx0XHRcdFx0XHRcdGZpbHRlckNvbmZpZ3VyYXRpb249XCIke3F1aWNrRmlsdGVyc31cIlxuXHRcdFx0XHRcdFx0XHRvblNlbGVjdGlvbkNoYW5nZT1cIkFQSS5vblF1aWNrRmlsdGVyU2VsZWN0aW9uQ2hhbmdlXCJcblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PC9tZGM6cXVpY2tGaWx0ZXI+YDtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblx0Z2V0RW1wdHlSb3dzRW5hYmxlZCgpIHtcblx0XHRyZXR1cm4gdGhpcy5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5JbmxpbmVDcmVhdGlvblJvd3Ncblx0XHRcdD8gdGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucy5jcmVhdGUuZW5hYmxlZFxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdH1cblxuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBoZWFkZXJCaW5kaW5nRXhwcmVzc2lvbiA9IGJ1aWxkRXhwcmVzc2lvbkZvckhlYWRlclZpc2libGUodGhpcyk7XG5cdFx0aWYgKHRoaXMucm93UHJlc3MpIHtcblx0XHRcdHRoaXMucm93QWN0aW9uID0gXCJOYXZpZ2F0aW9uXCI7XG5cdFx0fVxuXHRcdHRoaXMucm93UHJlc3MgPz89IHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ucm93Py5wcmVzcztcblx0XHRjb25zdCBjb2xsZWN0aW9uRGVsZXRhYmxlUGF0aCA9IChcblx0XHRcdCh0aGlzLmNvbGxlY3Rpb25FbnRpdHkgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/LkRlbGV0ZVJlc3RyaWN0aW9uc1xuXHRcdFx0XHQ/LkRlbGV0YWJsZSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248Ym9vbGVhbj5cblx0XHQpPy5wYXRoO1xuXHRcdGNvbnN0IGxpbmVJdGVtID0gVGFibGVIZWxwZXIuZ2V0VWlMaW5lSXRlbU9iamVjdCh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnZlcnRlZE1ldGFEYXRhKSBhc1xuXHRcdFx0fCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25bXVxuXHRcdFx0fCB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgZGVsZWdhdGUgPSBUYWJsZUhlbHBlci5nZXREZWxlZ2F0ZT8uKFxuXHRcdFx0dGhpcy50YWJsZURlZmluaXRpb24sXG5cdFx0XHQodGhpcy5pc0FscCBhcyBib29sZWFuKT8udG9TdHJpbmcoKSxcblx0XHRcdHRoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uZW50aXR5TmFtZVxuXHRcdCk7XG5cdFx0Y29uc3Qgc2VsZWN0aW9uQ2hhbmdlID0gYFRhYmxlUnVudGltZS5zZXRDb250ZXh0cyhcXCR7JHNvdXJjZT4vfSwgJyR7Y29sbGVjdGlvbkRlbGV0YWJsZVBhdGh9JywgJyR7XG5cdFx0XHQodGhpcy5jb2xsZWN0aW9uRW50aXR5IGFzIEVudGl0eVNldCkuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3Rcblx0XHR9JywgJyR7dGhpcy50YWJsZURlZmluaXRpb24ub3BlcmF0aW9uQXZhaWxhYmxlTWFwfScsICcke1RhYmxlSGVscGVyLmdldE5hdmlnYXRpb25BdmFpbGFibGVNYXAoXG5cdFx0XHRsaW5lSXRlbVxuXHRcdCl9JywgJyR7QWN0aW9uSGVscGVyLmdldE11bHRpU2VsZWN0RGlzYWJsZWRBY3Rpb25zKGxpbmVJdGVtKX0nLCAnJHt0aGlzLnVwZGF0YWJsZVByb3BlcnR5UGF0aH0nKWA7XG5cblx0XHRjb25zdCBlbnRpdHlUeXBlID0gdGhpcy5fZ2V0RW50aXR5VHlwZSgpO1xuXG5cdFx0Y29uc3QgbW9kZWxDb250ZXh0Q2hhbmdlID1cblx0XHRcdHRoaXMudGFibGVUeXBlID09PSBcIlRyZWVUYWJsZVwiXG5cdFx0XHRcdD8gYFRhYmxlUnVudGltZS5vblRyZWVUYWJsZUNvbnRleHRDaGFuZ2VkKFxcJHskc291cmNlPi99LCAke3RoaXMudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uaW5pdGlhbEV4cGFuc2lvbkxldmVsfSlgXG5cdFx0XHRcdDogdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIHhtbGBcbiAgICAgICAgICAgIDxtYWNyb1RhYmxlOlRhYmxlQVBJXG4gICAgICAgICAgICAgICAgeG1sbnM9XCJzYXAubVwiXG4gICAgICAgICAgICAgICAgeG1sbnM6bWRjPVwic2FwLnVpLm1kY1wiXG4gICAgICAgICAgICAgICAgeG1sbnM6cGx1Z2lucz1cInNhcC5tLnBsdWdpbnNcIlxuICAgICAgICAgICAgICAgIHhtbG5zOm1kY1RhYmxlPVwic2FwLnVpLm1kYy50YWJsZVwiXG4gICAgICAgICAgICAgICAgeG1sbnM6bWFjcm9UYWJsZT1cInNhcC5mZS5tYWNyb3MudGFibGVcIlxuICAgICAgICAgICAgICAgIHhtbG5zOm1kY2F0PVwic2FwLnVpLm1kYy5hY3Rpb250b29sYmFyXCJcbiAgICAgICAgICAgICAgICB4bWxuczpjb3JlPVwic2FwLnVpLmNvcmVcIlxuICAgICAgICAgICAgICAgIHhtbG5zOmNvbnRyb2w9XCJzYXAuZmUuY29yZS5jb250cm9sc1wiXG4gICAgICAgICAgICAgICAgeG1sbnM6ZHQ9XCJzYXAudWkuZHRcIlxuICAgICAgICAgICAgICAgIHhtbG5zOmZsPVwic2FwLnVpLmZsXCJcbiAgICAgICAgICAgICAgICB4bWxuczp2YXJpYW50PVwic2FwLnVpLmZsLnZhcmlhbnRzXCJcbiAgICAgICAgICAgICAgICB4bWxuczpwMTNuPVwic2FwLnVpLm1kYy5wMTNuXCJcbiAgICAgICAgICAgICAgICB4bWxuczppbnRlcm5hbE1hY3JvPVwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiXG4gICAgICAgICAgICAgICAgeG1sbnM6dW5pdHRlc3Q9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9wcmVwcm9jZXNzb3JleHRlbnNpb24vc2FwLmZlLnVuaXR0ZXN0aW5nLzFcIlxuICAgICAgICAgICAgICAgIHhtbG5zOm1hY3JvZGF0YT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIlxuICAgICAgICAgICAgICAgIGJpbmRpbmc9XCJ7aW50ZXJuYWw+Y29udHJvbHMvJHt0aGlzLmlkfX1cIlxuICAgICAgICAgICAgICAgIGlkPVwiJHt0aGlzLl9hcGlJZH1cIlxuICAgICAgICAgICAgICAgIHRhYmxlRGVmaW5pdGlvbj1cIntfcGFnZU1vZGVsPiR7dGhpcy50YWJsZURlZmluaXRpb25Db250ZXh0IS5nZXRQYXRoKCl9fVwiXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZUZ1bGx5UXVhbGlmaWVkTmFtZT1cIiR7ZW50aXR5VHlwZT8uZnVsbHlRdWFsaWZpZWROYW1lfVwiXG4gICAgICAgICAgICAgICAgbWV0YVBhdGg9XCIke3RoaXMubWV0YVBhdGg/LmdldFBhdGgoKX1cIlxuICAgICAgICAgICAgICAgIGNvbnRleHRQYXRoPVwiJHt0aGlzLmNvbnRleHRQYXRoPy5nZXRQYXRoKCl9XCJcbiAgICAgICAgICAgICAgICBzdGF0ZUNoYW5nZT1cIiR7dGhpcy5zdGF0ZUNoYW5nZX1cIlxuICAgICAgICAgICAgICAgIHNlbGVjdGlvbkNoYW5nZT1cIiR7dGhpcy5zZWxlY3Rpb25DaGFuZ2V9XCJcblx0XHRcdFx0Y29udGV4dENoYW5nZT1cIiR7dGhpcy5vbkNvbnRleHRDaGFuZ2V9XCJcbiAgICAgICAgICAgICAgICByZWFkT25seT1cIiR7dGhpcy5yZWFkT25seX1cIlxuICAgICAgICAgICAgICAgIGZpbHRlckJhcj1cIiR7dGhpcy5maWx0ZXJCYXJ9XCJcbiAgICAgICAgICAgICAgICBtYWNyb2RhdGE6dGFibGVBUElMb2NhbElkPVwiJHt0aGlzLl9hcGlJZH1cIlxuICAgICAgICAgICAgICAgIGVtcHR5Um93c0VuYWJsZWQ9XCIke3RoaXMuZ2V0RW1wdHlSb3dzRW5hYmxlZCgpfVwiXG4gICAgICAgICAgICAgICAgZW5hYmxlQXV0b0NvbHVtbldpZHRoPVwiJHt0aGlzLmVuYWJsZUF1dG9Db2x1bW5XaWR0aH1cIlxuICAgICAgICAgICAgICAgIGlzT3B0aW1pemVkRm9yU21hbGxEZXZpY2U9XCIke3RoaXMuaXNPcHRpbWl6ZWRGb3JTbWFsbERldmljZX1cIlxuICAgICAgICAgICAgPlxuXHRcdFx0XHQ8dGVtcGxhdGU6d2l0aCBwYXRoPVwiY29sbGVjdGlvbj4ke0NvbW1vbkhlbHBlci5nZXRUYXJnZXRDb2xsZWN0aW9uUGF0aCh0aGlzLmNvbGxlY3Rpb24pfVwiIHZhcj1cInRhcmdldENvbGxlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8bWFjcm9UYWJsZTpsYXlvdXREYXRhPlxuICAgICAgICAgICAgICAgICAgICA8RmxleEl0ZW1EYXRhIG1heFdpZHRoPVwiMTAwJVwiIC8+XG4gICAgICAgICAgICAgICAgPC9tYWNyb1RhYmxlOmxheW91dERhdGE+XG4gICAgICAgICAgICAgICAgPCEtLSBtYWNyb2RhdGEgaGFzIHRvIGJlIGFuIGV4cHJlc3Npb24gYmluZGluZyBpZiBpdCBuZWVkcyB0byBiZSBzZXQgYXMgYXR0cmlidXRlIHZpYSBjaGFuZ2UgaGFuZGxlciBkdXJpbmcgdGVtcGxhdGluZyAtLT5cbiAgICAgICAgICAgICAgICAgICAgPG1kYzpUYWJsZVxuICAgICAgICAgICAgICAgICAgICAgICAgdW5pdHRlc3Q6aWQ9XCJUYWJsZU1hY3JvRnJhZ21lbnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY29yZTpyZXF1aXJlPVwie1RhYmxlUnVudGltZTogJ3NhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVSdW50aW1lJywgQVBJOiAnc2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUFQSSd9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsOmZsZXhpYmlsaXR5PVwie3RoaXM+Zmw6ZmxleGliaWxpdHl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNvcnRDb25kaXRpb25zPVwiJHt0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnNvcnRDb25kaXRpb25zfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBncm91cENvbmRpdGlvbnM9XCIke0NvbW1vbkhlbHBlci5zdHJpbmdpZnlPYmplY3QodGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5ncm91cENvbmRpdGlvbnMgYXMgc3RyaW5nKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgYWdncmVnYXRlQ29uZGl0aW9ucz1cIiR7Q29tbW9uSGVscGVyLnN0cmluZ2lmeU9iamVjdCh0aGlzLnRhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmFnZ3JlZ2F0ZUNvbmRpdGlvbnMgYXMgc3RyaW5nKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgZHQ6ZGVzaWdudGltZT1cIiR7dGhpcy52YXJpYW50TWFuYWdlbWVudCA9PT0gXCJOb25lXCIgPyBcIm5vdC1hZGFwdGFibGVcIiA6IHVuZGVmaW5lZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOmtpbmQ9XCIke3RoaXMuY29sbGVjdGlvbkVudGl0eS5fdHlwZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOm5hdmlnYXRpb25QYXRoPVwiJHt0aGlzLm5hdmlnYXRpb25QYXRofVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpZD1cIiR7dGhpcy5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgYnVzeT1cIiR7dGhpcy5idXN5fVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBidXN5SW5kaWNhdG9yRGVsYXk9XCIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuYWJsZUV4cG9ydD1cIiR7dGhpcy5lbmFibGVFeHBvcnR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGVnYXRlPVwiJHtkZWxlZ2F0ZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgcm93UHJlc3M9XCIke3RoaXMucm93UHJlc3N9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjEwMCVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b0JpbmRPbkluaXQ9XCIke3RoaXMuYXV0b0JpbmRPbkluaXQgJiYgIXRoaXMuZmlsdGVyQmFyfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3Rpb25Nb2RlPVwiJHt0aGlzLnNlbGVjdGlvbk1vZGUgfHwgXCJOb25lXCJ9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbkNoYW5nZT1cIiR7c2VsZWN0aW9uQ2hhbmdlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzaG93Um93Q291bnQ9XCIke3RoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2wuc2hvd1Jvd0NvdW50fVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMuYXR0cihcImhlYWRlclwiLCB0aGlzLmhlYWRlcil9XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJWaXNpYmxlPVwiJHtoZWFkZXJCaW5kaW5nRXhwcmVzc2lvbn1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgaGVhZGVyTGV2ZWw9XCIke3RoaXMuaGVhZGVyTGV2ZWx9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocmVzaG9sZD1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi50aHJlc2hvbGR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vRGF0YT1cIiR7dGhpcy5ub0RhdGFUZXh0fVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBwMTNuTW9kZT1cIiR7dGhpcy5wZXJzb25hbGl6YXRpb259XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcj1cIiR7dGhpcy5maWx0ZXJCYXJJZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgcGFzdGU9XCJBUEkub25QYXN0ZSgkZXZlbnQsICRjb250cm9sbGVyKVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWZvcmVFeHBvcnQ9XCJBUEkub25CZWZvcmVFeHBvcnQoJGV2ZW50KVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC51c2VDb25kZW5zZWRUYWJsZUxheW91dCA9PT0gdHJ1ZSA/IFwic2FwVWlTaXplQ29uZGVuc2VkXCIgOiB1bmRlZmluZWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG11bHRpU2VsZWN0TW9kZT1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5tdWx0aVNlbGVjdE1vZGV9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dQYXN0ZUJ1dHRvbj1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucy5wYXN0ZS52aXNpYmxlfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmFibGVQYXN0ZT1cIiR7dGhpcy50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucy5wYXN0ZS5lbmFibGVkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6cm93c0JpbmRpbmdJbmZvPVwiJHtUYWJsZUhlbHBlci5nZXRSb3dzQmluZGluZ0luZm8odGhpcyl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTplbmFibGVBbmFseXRpY3M9XCIke3RoaXMudGFibGVEZWZpbml0aW9uLmVuYWJsZUFuYWx5dGljc31cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOmNyZWF0aW9uTW9kZT1cIiR7dGhpcy5jcmVhdGlvbk1vZGV9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTppbmxpbmVDcmVhdGlvblJvd0NvdW50PVwiJHt0aGlzLmlubGluZUNyZWF0aW9uUm93Q291bnR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTpzaG93Q3JlYXRlPVwiJHt0aGlzLnNob3dDcmVhdGV9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTpjcmVhdGVBdEVuZD1cIiR7dGhpcy5jcmVhdGVBdEVuZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOmVuYWJsZUF1dG9TY3JvbGw9XCIke3RoaXMuZW5hYmxlQXV0b1Njcm9sbH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOmRpc3BsYXlNb2RlUHJvcGVydHlCaW5kaW5nPVwiJHt0aGlzLnJlYWRPbmx5fVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6dGFibGVUeXBlPVwiJHt0aGlzLnRhYmxlVHlwZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOnRhcmdldENvbGxlY3Rpb25QYXRoPVwiJHtDb21tb25IZWxwZXIuZ2V0Q29udGV4dFBhdGgobnVsbCwgeyBjb250ZXh0OiB0aGlzLmNvbGxlY3Rpb24gfSl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTplbnRpdHlUeXBlPVwiJHtDb21tb25IZWxwZXIuZ2V0Q29udGV4dFBhdGgobnVsbCwgeyBjb250ZXh0OiB0aGlzLmNvbGxlY3Rpb24gfSkgKyBcIi9cIn1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOm1ldGFQYXRoPVwiJHtDb21tb25IZWxwZXIuZ2V0Q29udGV4dFBhdGgobnVsbCwgeyBjb250ZXh0OiB0aGlzLmNvbGxlY3Rpb24gfSl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTpvbkNoYW5nZT1cIiR7dGhpcy5vbkNoYW5nZX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOmhpZGRlbkZpbHRlcnM9XCIke1RhYmxlSGVscGVyLmZvcm1hdEhpZGRlbkZpbHRlcnModGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5maWx0ZXJzPy5oaWRkZW5GaWx0ZXJzKX1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgbWFjcm9kYXRhOnJlcXVlc3RHcm91cElkPVwiJGF1dG8uV29ya2Vyc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6c2VnbWVudGVkQnV0dG9uSWQ9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIlNlZ21lbnRlZEJ1dHRvblwiLCBcIlRlbXBsYXRlQ29udGVudFZpZXdcIl0pfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBtYWNyb2RhdGE6ZW5hYmxlUGFzdGU9XCIke3RoaXMuZW5hYmxlUGFzdGV9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hY3JvZGF0YTpvcGVyYXRpb25BdmFpbGFibGVNYXA9XCIke0NvbW1vbkhlbHBlci5zdHJpbmdpZnlDdXN0b21EYXRhKHRoaXMudGFibGVEZWZpbml0aW9uLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU9XCIke3RoaXMudmlzaWJsZX1cIlxuXHRcdFx0XHRcdFx0bW9kZWxDb250ZXh0Q2hhbmdlPVwiJHttb2RlbENvbnRleHRDaGFuZ2V9XCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1kYzpkYXRhU3RhdGVJbmRpY2F0b3I+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHBsdWdpbnM6RGF0YVN0YXRlSW5kaWNhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlcj1cIiR7dGhpcy5kYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXJ9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZW5hYmxlRmlsdGVyaW5nPVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFTdGF0ZUNoYW5nZT1cIkFQSS5vbkRhdGFTdGF0ZUNoYW5nZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbWRjOmRhdGFTdGF0ZUluZGljYXRvcj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxtZGM6dHlwZT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMuZ2V0VGFibGVUeXBlKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21kYzp0eXBlPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1kYzpkZXBlbmRlbnRzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5nZXREZXBlbmRlbnRzKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21kYzpkZXBlbmRlbnRzPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1kYzphY3Rpb25zPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5nZXRBY3Rpb25zKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21kYzphY3Rpb25zPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1kYzpyb3dTZXR0aW5ncz5cbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5nZXRSb3dTZXR0aW5nKCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21kYzpyb3dTZXR0aW5ncz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxtZGM6Y29sdW1ucz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLnRhYmxlLkNvbHVtbnNcIiB0eXBlPVwiWE1MXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbWRjOmNvbHVtbnM+XG4gICAgICAgICAgICAgICAgICAgICAgICAke3RoaXMuZ2V0Q3JlYXRpb25Sb3coKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICR7dGhpcy5nZXRWYXJpYW50TWFuYWdlbWVudCgpfVxuICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLmdldFF1aWNrRmlsdGVyKCl9XG4gICAgICAgICAgICAgICAgICAgIDwvbWRjOlRhYmxlPlxuXHRcdFx0XHQ8L3RlbXBsYXRlOndpdGg+XG4gICAgICAgICAgICA8L21hY3JvVGFibGU6VGFibGVBUEk+XG4gICAgICAgIGA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWdEQSxNQUFNQSx5QkFBeUIsR0FBRyxVQUFVQyxXQUFvQixFQUFFO0lBQUE7SUFDakUsSUFBSUMsa0JBQWtCLEdBQUcsSUFBSTtJQUM3QixNQUFNQyxHQUFHLEdBQUdGLFdBQVc7SUFDdkIsSUFBSUcsV0FBa0IsR0FBRyxFQUFFO0lBQzNCLE1BQU1DLFNBQVMsd0JBQUdGLEdBQUcsQ0FBQ0csWUFBWSxDQUFDLEtBQUssQ0FBQyxzREFBdkIsa0JBQXlCQyxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQztJQUNwRTtJQUNB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QUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0E4R3JCLEVBQUU7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BWUosS0FBSztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0E4QkZqUixTQUFTO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FpQ1gsRUFBRTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9
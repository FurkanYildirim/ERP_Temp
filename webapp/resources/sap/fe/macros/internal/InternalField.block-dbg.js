/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/CollaborationFormatter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TitleHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/situations/SituationsIndicator.block", "sap/ui/mdc/enum/EditMode", "../field/FieldHelper", "./field/FieldStructure", "./valuehelp/AdditionalValueFormatter"], function (Log, BuildingBlockBase, BuildingBlockSupport, MetaModelConverter, CollaborationFormatters, valueFormatters, BindingToolkit, MetaModelFunction, ModelHelper, StableIdHelper, TitleHelper, TypeGuards, DataModelPathHelper, PropertyHelper, UIFormatters, CommonHelper, FieldTemplating, SituationsIndicatorBlock, EditMode, FieldHelper, getFieldStructureTemplate, additionalValueFormatter) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26;
  var _exports = {};
  var getTextBindingExpression = FieldTemplating.getTextBindingExpression;
  var isSemanticKey = PropertyHelper.isSemanticKey;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isProperty = TypeGuards.isProperty;
  var getTitleBindingExpression = TitleHelper.getTitleBindingExpression;
  var generate = StableIdHelper.generate;
  var getRequiredPropertiesFromUpdateRestrictions = MetaModelFunction.getRequiredPropertiesFromUpdateRestrictions;
  var getRequiredPropertiesFromInsertRestrictions = MetaModelFunction.getRequiredPropertiesFromInsertRestrictions;
  var wrapBindingExpression = BindingToolkit.wrapBindingExpression;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatWithTypeInformation = BindingToolkit.formatWithTypeInformation;
  var formatResult = BindingToolkit.formatResult;
  var fn = BindingToolkit.fn;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockEvent = BuildingBlockSupport.blockEvent;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let InternalFieldBlock = (
  /**
   * Building block for creating a Field based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField annotation is expected
   *
   * Usage example:
   * <pre>
   * <internalMacro:Field
   *   idPrefix="SomePrefix"
   *   contextPath="{entitySet>}"
   *   metaPath="{dataField>}"
   * />
   * </pre>
   *
   * @hideconstructor
   * @private
   * @experimental
   * @since 1.94.0
   */
  _dec = defineBuildingBlock({
    name: "Field",
    namespace: "sap.fe.macros.internal",
    designtime: "sap/fe/macros/internal/Field.designtime"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "string"
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "string"
  }), _dec9 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["Property"],
    expectedAnnotationTypes: ["com.sap.vocabularies.UI.v1.DataField", "com.sap.vocabularies.UI.v1.DataFieldWithUrl", "com.sap.vocabularies.UI.v1.DataFieldForAnnotation", "com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithAction", "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath", "com.sap.vocabularies.UI.v1.DataPointType"]
  }), _dec12 = blockAttribute({
    type: "sap.ui.mdc.enum.EditMode"
  }), _dec13 = blockAttribute({
    type: "boolean"
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "string"
  }), _dec16 = blockAttribute({
    type: "sap.ui.core.TextAlign"
  }), _dec17 = blockAttribute({
    type: "string",
    required: false
  }), _dec18 = blockAttribute({
    type: "string"
  }), _dec19 = blockAttribute({
    type: "boolean"
  }), _dec20 = blockAttribute({
    type: "boolean"
  }), _dec21 = blockAttribute({
    type: "object",
    validate: function (formatOptionsInput) {
      if (formatOptionsInput.textAlignMode && !["Table", "Form"].includes(formatOptionsInput.textAlignMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.textAlignMode} for textAlignMode does not match`);
      }
      if (formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      if (formatOptionsInput.fieldMode && !["nowrapper", ""].includes(formatOptionsInput.fieldMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.fieldMode} for fieldMode does not match`);
      }
      if (formatOptionsInput.measureDisplayMode && !["Hidden", "ReadOnly"].includes(formatOptionsInput.measureDisplayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.measureDisplayMode} for measureDisplayMode does not match`);
      }
      if (formatOptionsInput.textExpandBehaviorDisplay && !["InPlace", "Popover"].includes(formatOptionsInput.textExpandBehaviorDisplay)) {
        throw new Error(`Allowed value ${formatOptionsInput.textExpandBehaviorDisplay} for textExpandBehaviorDisplay does not match`);
      }
      if (formatOptionsInput.semanticKeyStyle && !["ObjectIdentifier", "Label", ""].includes(formatOptionsInput.semanticKeyStyle)) {
        throw new Error(`Allowed value ${formatOptionsInput.semanticKeyStyle} for semanticKeyStyle does not match`);
      }
      if (typeof formatOptionsInput.isAnalytics === "string") {
        formatOptionsInput.isAnalytics = formatOptionsInput.isAnalytics === "true";
      }
      if (typeof formatOptionsInput.forInlineCreationRows === "string") {
        formatOptionsInput.forInlineCreationRows = formatOptionsInput.forInlineCreationRows === "true";
      }

      /*
      Historical default values are currently disabled
      if (!formatOptionsInput.semanticKeyStyle) {
      	formatOptionsInput.semanticKeyStyle = "";
      }
      */

      return formatOptionsInput;
    }
  }), _dec22 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec23 = blockAttribute({
    type: "boolean"
  }), _dec24 = blockAttribute({
    type: "string"
  }), _dec25 = blockAttribute({
    type: "string"
  }), _dec26 = blockEvent(), _dec27 = blockAttribute({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(InternalFieldBlock, _BuildingBlockBase);
    /**
     * Metadata path to the entity set
     */
    /**
     * Flag indicating whether action will navigate after execution
     */
    /**
     * Metadata path to the dataField.
     * This property is usually a metadataContext pointing to a DataField having
     * $Type of DataField, DataFieldWithUrl, DataFieldForAnnotation, DataFieldForAction, DataFieldForIntentBasedNavigation, DataFieldWithNavigationPath, or DataPointType.
     * But it can also be a Property with $kind="Property"
     */
    /**
     * Edit Mode of the field.
     *
     * If the editMode is undefined then we compute it based on the metadata
     * Otherwise we use the value provided here.
     */
    /**
     * Wrap field
     */
    /**
     * CSS class for margin
     */
    /**
     * Property added to associate the label with the Field
     */
    /**
     * Option to add a semantic object to a field
     */
    /**
     * Metadata path to the entity set.
     * This is used in inner fragments, so we need to declare it as block attribute context.
     */
    /**
     * This is used in inner fragments, so we need to declare it as block attribute.
     */
    /**
     * This is used in inner fragments, so we need to declare it as block attribute.
     */
    /**
     * This is used to set valueState on the field
     */
    /**
     * Event handler for change event
     */
    // (start) Computed properties for Link.fragment.xml
    /* Display style common properties start */
    /* AmountWith currency fragment end */
    /* Edit style common properties start */
    /**
     * This is used in inner fragments, so we need to declare it as block attribute.
     */
    /* Edit style common properties end */
    /* Rating Indicator properties start */
    /* InputWithUnit end */
    /*ObjectIdentifier start */
    /*SemanticKeyWithDraftIndicator end*/
    InternalFieldBlock.getOverrides = function getOverrides(mControlConfiguration, sID) {
      const oProps = {};
      if (mControlConfiguration) {
        const oControlConfig = mControlConfiguration[sID];
        if (oControlConfig) {
          Object.keys(oControlConfig).forEach(function (sConfigKey) {
            oProps[sConfigKey] = oControlConfig[sConfigKey];
          });
        }
      }
      return oProps;
    };
    InternalFieldBlock.getIdentifierTitle = function getIdentifierTitle(fieldFormatOptions, fullContextPath, alwaysShowDescriptionAndValue) {
      return getTitleBindingExpression(fullContextPath, getTextBindingExpression, fieldFormatOptions, undefined, undefined, alwaysShowDescriptionAndValue);
    };
    InternalFieldBlock.getObjectIdentifierText = function getObjectIdentifierText(fieldFormatOptions, oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$, _oPropertyDefinition$2, _commonText$annotatio, _commonText$annotatio2;
      let propertyBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      const targetDisplayMode = fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.displayMode;
      const oPropertyDefinition = oPropertyDataModelObjectPath.targetObject.type === "PropertyPath" ? oPropertyDataModelObjectPath.targetObject.$target : oPropertyDataModelObjectPath.targetObject;
      const commonText = (_oPropertyDefinition$ = oPropertyDefinition.annotations) === null || _oPropertyDefinition$ === void 0 ? void 0 : (_oPropertyDefinition$2 = _oPropertyDefinition$.Common) === null || _oPropertyDefinition$2 === void 0 ? void 0 : _oPropertyDefinition$2.Text;
      if (commonText === undefined || commonText !== null && commonText !== void 0 && (_commonText$annotatio = commonText.annotations) !== null && _commonText$annotatio !== void 0 && (_commonText$annotatio2 = _commonText$annotatio.UI) !== null && _commonText$annotatio2 !== void 0 && _commonText$annotatio2.TextArrangement) {
        return undefined;
      }
      propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);
      switch (targetDisplayMode) {
        case "ValueDescription":
          const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
          return compileExpression(getExpressionFromAnnotation(commonText, relativeLocation));
        case "DescriptionValue":
          return compileExpression(formatResult([propertyBindingExpression], valueFormatters.formatToKeepWhitespace));
        default:
          return undefined;
      }
    };
    InternalFieldBlock.setUpDataPointType = function setUpDataPointType(oDataField) {
      // data point annotations need not have $Type defined, so add it if missing
      if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.term) === "com.sap.vocabularies.UI.v1.DataPoint") {
        oDataField.$Type = oDataField.$Type || "com.sap.vocabularies.UI.v1.DataPointType";
      }
    };
    InternalFieldBlock.setUpVisibleProperties = function setUpVisibleProperties(oFieldProps, oPropertyDataModelObjectPath) {
      // we do this before enhancing the dataModelPath so that it still points at the DataField
      oFieldProps.visible = FieldTemplating.getVisibleExpression(oPropertyDataModelObjectPath, oFieldProps.formatOptions);
      oFieldProps.displayVisible = oFieldProps.formatOptions.fieldMode === "nowrapper" ? oFieldProps.visible : undefined;
    };
    InternalFieldBlock.getContentId = function getContentId(sMacroId) {
      return `${sMacroId}-content`;
    };
    InternalFieldBlock.setUpEditableProperties = function setUpEditableProperties(oProps, oDataField, oDataModelPath, oMetaModel) {
      var _oDataModelPath$targe, _oProps$formatOptions, _oProps$entitySet, _oProps$entitySet2;
      const oPropertyForFieldControl = oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe = oDataModelPath.targetObject) !== null && _oDataModelPath$targe !== void 0 && _oDataModelPath$targe.Value ? oDataModelPath.targetObject.Value : oDataModelPath === null || oDataModelPath === void 0 ? void 0 : oDataModelPath.targetObject;
      let hasPropertyInsertRestrictions = false;
      if (((_oProps$formatOptions = oProps.formatOptions) === null || _oProps$formatOptions === void 0 ? void 0 : _oProps$formatOptions.forInlineCreationRows) === true) {
        hasPropertyInsertRestrictions = FieldTemplating.hasPropertyInsertRestrictions(oDataModelPath);
      }
      if (oProps.editMode !== undefined && oProps.editMode !== null) {
        // Even if it provided as a string it's a valid part of a binding expression that can be later combined into something else.
        oProps.editModeAsObject = oProps.editMode;
      } else {
        const bMeasureReadOnly = oProps.formatOptions.measureDisplayMode ? oProps.formatOptions.measureDisplayMode === "ReadOnly" : false;
        oProps.editModeAsObject = UIFormatters.getEditMode(oPropertyForFieldControl, oDataModelPath, bMeasureReadOnly, true, oDataField);
        oProps.editMode = compileExpression(ifElse(and(pathInModel("@$ui5.context.isInactive"), hasPropertyInsertRestrictions), "Display", oProps.editModeAsObject));
      }
      const editableExpression = UIFormatters.getEditableExpressionAsObject(oPropertyForFieldControl, oDataField, oDataModelPath);
      const aRequiredPropertiesFromInsertRestrictions = getRequiredPropertiesFromInsertRestrictions((_oProps$entitySet = oProps.entitySet) === null || _oProps$entitySet === void 0 ? void 0 : _oProps$entitySet.getPath().replaceAll("/$NavigationPropertyBinding/", "/"), oMetaModel);
      const aRequiredPropertiesFromUpdateRestrictions = getRequiredPropertiesFromUpdateRestrictions((_oProps$entitySet2 = oProps.entitySet) === null || _oProps$entitySet2 === void 0 ? void 0 : _oProps$entitySet2.getPath().replaceAll("/$NavigationPropertyBinding/", "/"), oMetaModel);
      const oRequiredProperties = {
        requiredPropertiesFromInsertRestrictions: aRequiredPropertiesFromInsertRestrictions,
        requiredPropertiesFromUpdateRestrictions: aRequiredPropertiesFromUpdateRestrictions
      };
      if (ModelHelper.isCollaborationDraftSupported(oMetaModel) && oProps.editMode !== EditMode.Display) {
        oProps.collaborationEnabled = true;
        // Expressions needed for Collaboration Visualization
        const collaborationExpression = UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.hasCollaborationActivity);
        oProps.collaborationHasActivityExpression = compileExpression(collaborationExpression);
        oProps.collaborationInitialsExpression = compileExpression(UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityInitials));
        oProps.collaborationColorExpression = compileExpression(UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityColor));
        oProps.editableExpression = compileExpression(and(editableExpression, not(collaborationExpression)));
        oProps.editMode = compileExpression(ifElse(collaborationExpression, constant("ReadOnly"), oProps.editModeAsObject));
      } else {
        oProps.editableExpression = compileExpression(editableExpression);
      }
      oProps.enabledExpression = UIFormatters.getEnabledExpression(oPropertyForFieldControl, oDataField, false, oDataModelPath);
      oProps.requiredExpression = UIFormatters.getRequiredExpression(oPropertyForFieldControl, oDataField, false, false, oRequiredProperties, oDataModelPath);
      if (oProps.idPrefix) {
        oProps.editStyleId = generate([oProps.idPrefix, "Field-edit"]);
      }
    };
    InternalFieldBlock.setUpFormatOptions = function setUpFormatOptions(oProps, oDataModelPath, oControlConfiguration, mSettings) {
      var _mSettings$models$vie;
      const oOverrideProps = InternalFieldBlock.getOverrides(oControlConfiguration, oProps.dataField.getPath());
      if (!oProps.formatOptions.displayMode) {
        oProps.formatOptions.displayMode = UIFormatters.getDisplayMode(oDataModelPath);
      }
      oProps.formatOptions.textLinesEdit = oOverrideProps.textLinesEdit || oOverrideProps.formatOptions && oOverrideProps.formatOptions.textLinesEdit || oProps.formatOptions.textLinesEdit || 4;
      oProps.formatOptions.textMaxLines = oOverrideProps.textMaxLines || oOverrideProps.formatOptions && oOverrideProps.formatOptions.textMaxLines || oProps.formatOptions.textMaxLines;

      // Retrieve text from value list as fallback feature for missing text annotation on the property
      if ((_mSettings$models$vie = mSettings.models.viewData) !== null && _mSettings$models$vie !== void 0 && _mSettings$models$vie.getProperty("/retrieveTextFromValueList")) {
        oProps.formatOptions.retrieveTextFromValueList = FieldTemplating.isRetrieveTextFromValueListEnabled(oDataModelPath.targetObject, oProps.formatOptions);
        if (oProps.formatOptions.retrieveTextFromValueList) {
          var _oDataModelPath$targe2, _oDataModelPath$targe3, _oDataModelPath$targe4;
          // Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
          const hasEntityTextArrangement = !!(oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe2 = oDataModelPath.targetEntityType) !== null && _oDataModelPath$targe2 !== void 0 && (_oDataModelPath$targe3 = _oDataModelPath$targe2.annotations) !== null && _oDataModelPath$targe3 !== void 0 && (_oDataModelPath$targe4 = _oDataModelPath$targe3.UI) !== null && _oDataModelPath$targe4 !== void 0 && _oDataModelPath$targe4.TextArrangement);
          oProps.formatOptions.displayMode = hasEntityTextArrangement ? oProps.formatOptions.displayMode : "DescriptionValue";
        }
      }
      if (oProps.formatOptions.fieldMode === "nowrapper" && oProps.editMode === "Display") {
        if (oProps._flexId) {
          oProps.noWrapperId = oProps._flexId;
        } else {
          oProps.noWrapperId = oProps.idPrefix ? generate([oProps.idPrefix, "Field-content"]) : undefined;
        }
      }
    };
    InternalFieldBlock.setUpDisplayStyle = function setUpDisplayStyle(oProps, oDataField, oDataModelPath) {
      var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation3, _oProperty$annotation4, _oProperty$annotation19, _oProperty$annotation20, _oDataField$Target, _oDataField$Target$$t, _oDataField$Target2, _oDataField$Target2$$, _oDataField$ActionTar, _oDataField$ActionTar2, _oProperty$annotation21, _oProperty$annotation22, _oProperty$annotation23, _oProperty$annotation24, _oProperty$annotation25, _oProperty$annotation26, _oProperty$annotation29, _oProperty$annotation30;
      const oProperty = oDataModelPath.targetObject;
      if (!oDataModelPath.targetObject) {
        oProps.displayStyle = "Text";
        return;
      }
      oProps.hasUnitOrCurrency = ((_oProperty$annotation = oProperty.annotations) === null || _oProperty$annotation === void 0 ? void 0 : (_oProperty$annotation2 = _oProperty$annotation.Measures) === null || _oProperty$annotation2 === void 0 ? void 0 : _oProperty$annotation2.Unit) !== undefined || ((_oProperty$annotation3 = oProperty.annotations) === null || _oProperty$annotation3 === void 0 ? void 0 : (_oProperty$annotation4 = _oProperty$annotation3.Measures) === null || _oProperty$annotation4 === void 0 ? void 0 : _oProperty$annotation4.ISOCurrency) !== undefined;
      oProps.hasValidAnalyticalCurrencyOrUnit = UIFormatters.hasValidAnalyticalCurrencyOrUnit(oDataModelPath);
      oProps.textFromValueList = wrapBindingExpression(compileExpression(fn("FieldRuntime.retrieveTextFromValueList", [pathInModel(getContextRelativeTargetObjectPath(oDataModelPath)), `/${oProperty.fullyQualifiedName}`, oProps.formatOptions.displayMode])), false);
      if (oProperty.type === "Edm.Stream") {
        var _oProperty$annotation5, _oProperty$annotation6, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14, _oProperty$annotation15, _oProperty$annotation16, _oProperty$annotation17, _oProperty$annotation18;
        // Common
        oProps.displayStyle = "File";
        oProps.fileRelativePropertyPath = getContextRelativeTargetObjectPath(oDataModelPath);
        if ((_oProperty$annotation5 = oProperty.annotations.Core) !== null && _oProperty$annotation5 !== void 0 && (_oProperty$annotation6 = _oProperty$annotation5.ContentDisposition) !== null && _oProperty$annotation6 !== void 0 && _oProperty$annotation6.Filename) {
          var _oProperty$annotation7, _oProperty$annotation8;
          const fileNameDataModelPath = enhanceDataModelPath(oDataModelPath, (_oProperty$annotation7 = oProperty.annotations.Core) === null || _oProperty$annotation7 === void 0 ? void 0 : (_oProperty$annotation8 = _oProperty$annotation7.ContentDisposition) === null || _oProperty$annotation8 === void 0 ? void 0 : _oProperty$annotation8.Filename);
          // This causes an expression parsing error: compileExpression(pathInModel(getContextRelativeTargetObjectPath(fileNameDataModelPath)));
          oProps.fileFilenameExpression = "{ path: '" + getContextRelativeTargetObjectPath(fileNameDataModelPath) + "' }";
        }
        oProps.fileStreamNotEmpty = compileExpression(not(equal(pathInModel(`${oProps.fileRelativePropertyPath}@odata.mediaContentType`), null)));

        // FileWrapper
        oProps.fileUploadUrl = FieldTemplating.getValueBinding(oDataModelPath, {});
        oProps.fileFilenamePath = (_oProperty$annotation9 = oProperty.annotations.Core) === null || _oProperty$annotation9 === void 0 ? void 0 : (_oProperty$annotation10 = _oProperty$annotation9.ContentDisposition) === null || _oProperty$annotation10 === void 0 ? void 0 : (_oProperty$annotation11 = _oProperty$annotation10.Filename) === null || _oProperty$annotation11 === void 0 ? void 0 : _oProperty$annotation11.path;
        oProps.fileMediaType = ((_oProperty$annotation12 = oProperty.annotations.Core) === null || _oProperty$annotation12 === void 0 ? void 0 : _oProperty$annotation12.MediaType) && compileExpression(getExpressionFromAnnotation((_oProperty$annotation13 = oProperty.annotations.Core) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.MediaType));

        // template:if
        oProps.fileIsImage = !!((_oProperty$annotation14 = oProperty.annotations.UI) !== null && _oProperty$annotation14 !== void 0 && _oProperty$annotation14.IsImageURL) || !!((_oProperty$annotation15 = oProperty.annotations.UI) !== null && _oProperty$annotation15 !== void 0 && _oProperty$annotation15.IsImage) || /image\//i.test(((_oProperty$annotation16 = oProperty.annotations.Core) === null || _oProperty$annotation16 === void 0 ? void 0 : (_oProperty$annotation17 = _oProperty$annotation16.MediaType) === null || _oProperty$annotation17 === void 0 ? void 0 : _oProperty$annotation17.toString()) ?? "");

        // Avatar
        oProps.fileAvatarSrc = FieldTemplating.getValueBinding(oDataModelPath, {});

        // Icon
        oProps.fileIconSrc = FieldHelper.getPathForIconSource(oProps.fileRelativePropertyPath);

        // Link
        oProps.fileLinkText = FieldHelper.getFilenameExpr(oProps.fileFilenameExpression, "{sap.fe.i18n>M_FIELD_FILEUPLOADER_NOFILENAME_TEXT}");
        oProps.fileLinkHref = FieldHelper.getDownloadUrl(oProps.fileUploadUrl ?? "");

        // Text
        oProps.fileTextVisible = compileExpression(equal(pathInModel(`${oProps.fileRelativePropertyPath}@odata.mediaContentType`), null));

        // FileUploader
        if ((_oProperty$annotation18 = oProperty.annotations.Core) !== null && _oProperty$annotation18 !== void 0 && _oProperty$annotation18.AcceptableMediaTypes) {
          const acceptedTypes = Array.from(oProperty.annotations.Core.AcceptableMediaTypes).map(type => `'${type}'`);
          oProps.fileAcceptableMediaTypes = `{=odata.collection([${acceptedTypes.join(",")}])}`; // This does not feel right, but follows the logic of AnnotationHelper#value
        }

        oProps.fileMaximumSize = FieldHelper.calculateMBfromByte(oProperty.maxLength);
        return;
      }
      if ((_oProperty$annotation19 = oProperty.annotations) !== null && _oProperty$annotation19 !== void 0 && (_oProperty$annotation20 = _oProperty$annotation19.UI) !== null && _oProperty$annotation20 !== void 0 && _oProperty$annotation20.IsImageURL) {
        oProps.avatarVisible = FieldTemplating.getVisibleExpression(oDataModelPath);
        oProps.avatarSrc = FieldTemplating.getValueBinding(oDataModelPath, {});
        oProps.displayStyle = "Avatar";
        return;
      }
      switch (oDataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataPointType":
          oProps.displayStyle = "DataPoint";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          if (((_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : (_oDataField$Target$$t = _oDataField$Target.$target) === null || _oDataField$Target$$t === void 0 ? void 0 : _oDataField$Target$$t.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            oProps.displayStyle = "DataPoint";
            return;
          } else if (((_oDataField$Target2 = oDataField.Target) === null || _oDataField$Target2 === void 0 ? void 0 : (_oDataField$Target2$$ = _oDataField$Target2.$target) === null || _oDataField$Target2$$ === void 0 ? void 0 : _oDataField$Target2$$.$Type) === "com.sap.vocabularies.Communication.v1.ContactType") {
            oProps.contactVisible = FieldTemplating.getVisibleExpression(oDataModelPath);
            oProps.displayStyle = "Contact";
            return;
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          //Qualms: the getObject is a bad practice, but for now it´s fine as an intermediate step to avoid refactoring of the helper in addition
          const dataFieldObject = oProps.dataField.getObject();
          oProps.buttonPress = FieldHelper.getPressEventForDataFieldActionButton(oProps, dataFieldObject);
          oProps.displayStyle = "Button";

          // Gracefully handle non-existing actions
          if (oDataField.ActionTarget === undefined) {
            oProps.buttonIsBound = true;
            oProps.buttonOperationAvailable = "false";
            oProps.buttonOperationAvailableFormatted = "false";
            Log.warning(`Warning: The action '${oDataField.Action}' does not exist. The corresponding action button will be disabled.`);
            return;
          }
          oProps.buttonIsBound = oDataField.ActionTarget.isBound;
          oProps.buttonOperationAvailable = (_oDataField$ActionTar = oDataField.ActionTarget.annotations) === null || _oDataField$ActionTar === void 0 ? void 0 : (_oDataField$ActionTar2 = _oDataField$ActionTar.Core) === null || _oDataField$ActionTar2 === void 0 ? void 0 : _oDataField$ActionTar2.OperationAvailable;
          oProps.buttonOperationAvailableFormatted = undefined;
          if (oProps.buttonOperationAvailable) {
            const actionTarget = oDataField.ActionTarget;
            const bindingParamName = actionTarget.parameters[0].name;
            //QUALMS, needs to be checked whether this makes sense at that place, might be good in a dedicated helper function
            oProps.buttonOperationAvailableFormatted = compileExpression(getExpressionFromAnnotation(oProps.buttonOperationAvailable, [], undefined, path => {
              if (path.startsWith(bindingParamName)) {
                return path.replace(bindingParamName + "/", "");
              }
              return path;
            }));
          }
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          oProps.buttonPress = CommonHelper.getPressHandlerForDataFieldForIBN(oProps.dataField.getObject(), undefined, undefined);
          InternalFieldBlock.setUpNavigationAvailable(oProps, oDataField);
          oProps.displayStyle = "Button";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
          oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
          oProps.linkIsDataFieldWithIntentBasedNavigation = true;
          oProps.linkPress = CommonHelper.getPressHandlerForDataFieldForIBN(oProps.dataField.getObject());
          oProps.displayStyle = "Link";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
          oProps.linkIsDataFieldWithNavigationPath = true;
          oProps.linkPress = `FieldRuntime.onDataFieldWithNavigationPath(\${$source>/}, $controller, '${oDataField.Target.value}')`;
          oProps.displayStyle = "Link";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          oProps.linkIsDataFieldWithAction = true;
          oProps.linkPress = FieldHelper.getPressEventForDataFieldActionButton(oProps, oProps.dataField.getObject());
          oProps.displayStyle = "Link";
          return;
      }
      const hasQuickView = FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, oProperty);
      const hasSemanticObjects = !!FieldTemplating.getPropertyWithSemanticObject(oDataModelPath) || oProps.semanticObject !== undefined && oProps.semanticObject !== "";
      if (isSemanticKey(oProperty, oDataModelPath) && oProps.formatOptions.semanticKeyStyle) {
        var _annotations, _annotations$Common, _oDataModelPath$conte, _oDataModelPath$targe5, _oDataModelPath$targe6, _oDataModelPath$targe7, _oDataModelPath$conte2;
        oProps.hasQuickView = hasQuickView || hasSemanticObjects;
        oProps.hasSituationsIndicator = SituationsIndicatorBlock.getSituationsNavigationProperty(oDataModelPath.targetEntityType) !== undefined;
        InternalFieldBlock.setUpObjectIdentifierTitleAndText(oProps, oDataModelPath);
        if ((_annotations = ((_oDataModelPath$conte = oDataModelPath.contextLocation) === null || _oDataModelPath$conte === void 0 ? void 0 : _oDataModelPath$conte.targetEntitySet).annotations) !== null && _annotations !== void 0 && (_annotations$Common = _annotations.Common) !== null && _annotations$Common !== void 0 && _annotations$Common.DraftRoot && (_oDataModelPath$targe5 = oDataModelPath.targetEntitySet) !== null && _oDataModelPath$targe5 !== void 0 && (_oDataModelPath$targe6 = _oDataModelPath$targe5.annotations) !== null && _oDataModelPath$targe6 !== void 0 && (_oDataModelPath$targe7 = _oDataModelPath$targe6.Common) !== null && _oDataModelPath$targe7 !== void 0 && _oDataModelPath$targe7.DraftRoot) {
          oProps.draftIndicatorVisible = FieldTemplating.getDraftIndicatorVisibleBinding(oDataModelPath.targetObject.name);
          oProps.displayStyle = "SemanticKeyWithDraftIndicator";
          return;
        }
        oProps.showErrorIndicator = ((_oDataModelPath$conte2 = oDataModelPath.contextLocation) === null || _oDataModelPath$conte2 === void 0 ? void 0 : _oDataModelPath$conte2.targetObject._type) === "NavigationProperty" && !oProps.formatOptions.fieldGroupDraftIndicatorPropertyPath;
        oProps.situationsIndicatorPropertyPath = oDataModelPath.targetObject.name;
        oProps.displayStyle = oProps.formatOptions.semanticKeyStyle === "ObjectIdentifier" ? "ObjectIdentifier" : "LabelSemanticKey";
        return;
      }
      if (oDataField.Criticality) {
        oProps.hasQuickView = hasQuickView || hasSemanticObjects;
        oProps.linkUrl = oDataField.Url ? compileExpression(getExpressionFromAnnotation(oDataField.Url)) : undefined;
        oProps.displayStyle = "ObjectStatus";
        return;
      }
      if ((_oProperty$annotation21 = oProperty.annotations) !== null && _oProperty$annotation21 !== void 0 && (_oProperty$annotation22 = _oProperty$annotation21.Measures) !== null && _oProperty$annotation22 !== void 0 && _oProperty$annotation22.ISOCurrency && String(oProps.formatOptions.isCurrencyAligned) === "true" && oProps.formatOptions.measureDisplayMode !== "Hidden") {
        oProps.valueAsStringBindingExpression = FieldTemplating.getValueBinding(oDataModelPath, oProps.formatOptions, true, true, undefined, true);
        oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        oProps.displayStyle = "AmountWithCurrency";
        return;
      }
      if ((_oProperty$annotation23 = oProperty.annotations) !== null && _oProperty$annotation23 !== void 0 && (_oProperty$annotation24 = _oProperty$annotation23.Communication) !== null && _oProperty$annotation24 !== void 0 && _oProperty$annotation24.IsEmailAddress || (_oProperty$annotation25 = oProperty.annotations) !== null && _oProperty$annotation25 !== void 0 && (_oProperty$annotation26 = _oProperty$annotation25.Communication) !== null && _oProperty$annotation26 !== void 0 && _oProperty$annotation26.IsPhoneNumber) {
        var _oProperty$annotation27, _oProperty$annotation28;
        oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.linkIsEmailAddress = ((_oProperty$annotation27 = oProperty.annotations.Communication) === null || _oProperty$annotation27 === void 0 ? void 0 : _oProperty$annotation27.IsEmailAddress) !== undefined;
        oProps.linkIsPhoneNumber = ((_oProperty$annotation28 = oProperty.annotations.Communication) === null || _oProperty$annotation28 === void 0 ? void 0 : _oProperty$annotation28.IsPhoneNumber) !== undefined;
        const propertyValueBinding = FieldTemplating.getValueBinding(oDataModelPath, {});
        if (oProps.linkIsEmailAddress) {
          oProps.linkUrl = `mailto:${propertyValueBinding}`;
        }
        if (oProps.linkIsPhoneNumber) {
          oProps.linkUrl = `tel:${propertyValueBinding}`;
        }
        oProps.displayStyle = "Link";
        return;
      }
      if ((_oProperty$annotation29 = oProperty.annotations) !== null && _oProperty$annotation29 !== void 0 && (_oProperty$annotation30 = _oProperty$annotation29.UI) !== null && _oProperty$annotation30 !== void 0 && _oProperty$annotation30.MultiLineText) {
        oProps.displayStyle = "ExpandableText";
        return;
      }
      if (hasQuickView || hasSemanticObjects) {
        oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.hasQuickView = true;
        oProps.displayStyle = "LinkWithQuickView";
        return;
      }
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
        oProps.text = InternalFieldBlock.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.displayStyle = "Link";
        oProps.iconUrl = oDataField.IconUrl ? compileExpression(getExpressionFromAnnotation(oDataField.IconUrl)) : undefined;
        oProps.linkUrl = compileExpression(getExpressionFromAnnotation(oDataField.Url));
        return;
      }
      oProps.displayStyle = "Text";
    };
    InternalFieldBlock.setUpEditStyle = function setUpEditStyle(oProps, oDataField, oDataModelPath, appComponent) {
      FieldTemplating.setEditStyleProperties(oProps, oDataField, oDataModelPath);
      oProps.fieldGroupIds = InternalFieldBlock.computeFieldGroupIds(oDataModelPath, appComponent);
    }

    /**
     * Calculate the fieldGroupIds for an Inputor other edit control.
     *
     * @param dataModelObjectPath
     * @param appComponent
     * @returns The value for fieldGroupIds
     */;
    InternalFieldBlock.computeFieldGroupIds = function computeFieldGroupIds(dataModelObjectPath, appComponent) {
      var _dataModelObjectPath$, _dataModelObjectPath$2;
      if (!appComponent) {
        //for ValueHelp / Mass edit Templating the appComponent is not passed to the templating
        return "";
      }
      const sideEffectService = appComponent.getSideEffectsService();
      const fieldGroupIds = sideEffectService.computeFieldGroupIds(((_dataModelObjectPath$ = dataModelObjectPath.targetEntityType) === null || _dataModelObjectPath$ === void 0 ? void 0 : _dataModelObjectPath$.fullyQualifiedName) ?? "", ((_dataModelObjectPath$2 = dataModelObjectPath.targetObject) === null || _dataModelObjectPath$2 === void 0 ? void 0 : _dataModelObjectPath$2.fullyQualifiedName) ?? "");
      const result = fieldGroupIds.join(",");
      return result === "" ? undefined : result;
    };
    InternalFieldBlock.setUpObjectIdentifierTitleAndText = function setUpObjectIdentifierTitleAndText(_oProps, oPropertyDataModelObjectPath) {
      var _oProps$formatOptions2;
      if (((_oProps$formatOptions2 = _oProps.formatOptions) === null || _oProps$formatOptions2 === void 0 ? void 0 : _oProps$formatOptions2.semanticKeyStyle) === "ObjectIdentifier") {
        // if DescriptionValue is set by default and property has a quickView,  we show description and value in ObjectIdentifier Title
        const alwaysShowDescriptionAndValue = _oProps.hasQuickView;
        _oProps.identifierTitle = InternalFieldBlock.getIdentifierTitle(_oProps.formatOptions, oPropertyDataModelObjectPath, alwaysShowDescriptionAndValue);
        if (!alwaysShowDescriptionAndValue) {
          _oProps.identifierText = InternalFieldBlock.getObjectIdentifierText(_oProps.formatOptions, oPropertyDataModelObjectPath);
        } else {
          _oProps.identifierText = undefined;
        }
      } else {
        _oProps.identifierTitle = InternalFieldBlock.getIdentifierTitle(_oProps.formatOptions, oPropertyDataModelObjectPath, true);
        _oProps.identifierText = undefined;
      }
    };
    InternalFieldBlock.getTextWithWhiteSpace = function getTextWithWhiteSpace(formatOptions, oDataModelPath) {
      const text = FieldTemplating.getTextBinding(oDataModelPath, formatOptions, true);
      return text._type === "PathInModel" || typeof text === "string" ? compileExpression(formatResult([text], "WSR")) : compileExpression(text);
    };
    InternalFieldBlock.setUpNavigationAvailable = function setUpNavigationAvailable(oProps, oDataField) {
      oProps.navigationAvailable = true;
      if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && oDataField.NavigationAvailable !== undefined && String(oProps.formatOptions.ignoreNavigationAvailable) !== "true") {
        oProps.navigationAvailable = compileExpression(getExpressionFromAnnotation(oDataField.NavigationAvailable));
      }
    };
    InternalFieldBlock.setUpValueState = function setUpValueState(fieldProps, dataModelPath) {
      let valueStateExp;
      const fieldContainerType = fieldProps.formatOptions.textAlignMode;
      if (fieldContainerType === "Table") {
        valueStateExp = formatResult([pathInModel(`/recommendationsData`, "internal"), pathInModel(`/currentCtxt`, "internal"), fieldProps.dataSourcePath, fieldContainerType], additionalValueFormatter.formatValueState, dataModelPath.targetEntityType);
      } else {
        valueStateExp = formatResult([pathInModel(`/recommendationsData`, "internal"), pathInModel(`/currentCtxt`, "internal"), fieldProps.dataSourcePath, fieldContainerType], additionalValueFormatter.formatValueState);
      }
      fieldProps.valueState = compileExpression(valueStateExp);
    };
    function InternalFieldBlock(props, controlConfiguration, settings) {
      var _oDataFieldConverted$, _oDataFieldConverted$2;
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "dataSourcePath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "emptyIndicatorMode", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_flexId", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "idPrefix", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_apiId", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "noWrapperId", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vhIdPrefix", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigateAfterAction", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataField", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editMode", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "wrap", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "class", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "textAlign", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "requiredExpression", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showErrorObjectStatus", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entityType", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationEnabled", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_vhFlexId", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valueState", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor25, _assertThisInitialized(_this));
      _this.hasQuickView = false;
      _this.linkUrl = undefined;
      _this.linkIsDataFieldWithIntentBasedNavigation = false;
      _this.linkIsDataFieldWithNavigationPath = false;
      _this.linkIsDataFieldWithAction = false;
      _this.linkIsEmailAddress = false;
      _this.linkIsPhoneNumber = false;
      _this.linkPress = undefined;
      _this.fileFilenameExpression = undefined;
      _this.fileAcceptableMediaTypes = undefined;
      _this.hasUnitOrCurrency = undefined;
      _this.hasValidAnalyticalCurrencyOrUnit = undefined;
      _this.textFromValueList = undefined;
      _this.editStyleId = undefined;
      _initializerDefineProperty(_this, "editStylePlaceholder", _descriptor26, _assertThisInitialized(_this));
      _this.ratingIndicatorTooltip = undefined;
      _this.ratingIndicatorTargetValue = undefined;
      _this.showErrorIndicator = false;
      _this.situationsIndicatorPropertyPath = "";
      const oDataFieldConverted = MetaModelConverter.convertMetaModelContext(_this.dataField);
      let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.dataField, _this.entitySet);
      InternalFieldBlock.setUpDataPointType(oDataFieldConverted);
      InternalFieldBlock.setUpVisibleProperties(_assertThisInitialized(_this), oDataModelPath);
      if (_this._flexId) {
        _this._apiId = _this._flexId;
        _this._flexId = InternalFieldBlock.getContentId(_this._flexId);
        _this._vhFlexId = `${_this._flexId}_${_this.vhIdPrefix}`;
      }
      const valueDataModelPath = FieldTemplating.getDataModelObjectPathForValue(oDataModelPath);
      oDataModelPath = valueDataModelPath || oDataModelPath;
      _this.dataSourcePath = getTargetObjectPath(oDataModelPath);
      const oMetaModel = settings.models.metaModel || settings.models.entitySet;
      _this.entityType = oMetaModel.createBindingContext(`/${oDataModelPath.targetEntityType.fullyQualifiedName}`);
      InternalFieldBlock.setUpEditableProperties(_assertThisInitialized(_this), oDataFieldConverted, oDataModelPath, oMetaModel);
      InternalFieldBlock.setUpFormatOptions(_assertThisInitialized(_this), oDataModelPath, controlConfiguration, settings);
      InternalFieldBlock.setUpDisplayStyle(_assertThisInitialized(_this), oDataFieldConverted, oDataModelPath);
      InternalFieldBlock.setUpEditStyle(_assertThisInitialized(_this), oDataFieldConverted, oDataModelPath, settings.appComponent);
      InternalFieldBlock.setUpValueState(_assertThisInitialized(_this), oDataModelPath);

      // ---------------------------------------- compute bindings----------------------------------------------------
      const aDisplayStylesWithoutPropText = ["Avatar", "AmountWithCurrency"];
      if (_this.displayStyle && aDisplayStylesWithoutPropText.indexOf(_this.displayStyle) === -1 && oDataModelPath.targetObject) {
        _this.text = _this.text ?? FieldTemplating.getTextBinding(oDataModelPath, _this.formatOptions);
      } else {
        _this.text = "";
      }
      _this.emptyIndicatorMode = _this.formatOptions.showEmptyIndicator ? "On" : undefined;

      // If the target is a property with a DataFieldDefault, use this as data field
      if (isProperty(oDataFieldConverted) && ((_oDataFieldConverted$ = oDataFieldConverted.annotations) === null || _oDataFieldConverted$ === void 0 ? void 0 : (_oDataFieldConverted$2 = _oDataFieldConverted$.UI) === null || _oDataFieldConverted$2 === void 0 ? void 0 : _oDataFieldConverted$2.DataFieldDefault) !== undefined) {
        _this.dataField = oMetaModel.createBindingContext(`@${"com.sap.vocabularies.UI.v1.DataFieldDefault"}`, _this.dataField);
      }
      return _this;
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */
    _exports = InternalFieldBlock;
    var _proto = InternalFieldBlock.prototype;
    _proto.getTemplate = function getTemplate() {
      return getFieldStructureTemplate(this);
    };
    return InternalFieldBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "dataSourcePath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "emptyIndicatorMode", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "_flexId", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "_apiId", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "noWrapperId", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "vhIdPrefix", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "FieldValueHelp";
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "navigateAfterAction", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "dataField", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "editMode", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "wrap", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "class", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "textAlign", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "requiredExpression", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "showErrorObjectStatus", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "entityType", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "collaborationEnabled", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "_vhFlexId", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "valueState", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "editStylePlaceholder", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = InternalFieldBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcm5hbEZpZWxkQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImRlc2lnbnRpbWUiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImV4cGVjdGVkVHlwZXMiLCJleHBlY3RlZEFubm90YXRpb25UeXBlcyIsInZhbGlkYXRlIiwiZm9ybWF0T3B0aW9uc0lucHV0IiwidGV4dEFsaWduTW9kZSIsImluY2x1ZGVzIiwiRXJyb3IiLCJkaXNwbGF5TW9kZSIsImZpZWxkTW9kZSIsIm1lYXN1cmVEaXNwbGF5TW9kZSIsInRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXkiLCJzZW1hbnRpY0tleVN0eWxlIiwiaXNBbmFseXRpY3MiLCJmb3JJbmxpbmVDcmVhdGlvblJvd3MiLCJibG9ja0V2ZW50IiwiZ2V0T3ZlcnJpZGVzIiwibUNvbnRyb2xDb25maWd1cmF0aW9uIiwic0lEIiwib1Byb3BzIiwib0NvbnRyb2xDb25maWciLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInNDb25maWdLZXkiLCJnZXRJZGVudGlmaWVyVGl0bGUiLCJmaWVsZEZvcm1hdE9wdGlvbnMiLCJmdWxsQ29udGV4dFBhdGgiLCJhbHdheXNTaG93RGVzY3JpcHRpb25BbmRWYWx1ZSIsImdldFRpdGxlQmluZGluZ0V4cHJlc3Npb24iLCJnZXRUZXh0QmluZGluZ0V4cHJlc3Npb24iLCJ1bmRlZmluZWQiLCJnZXRPYmplY3RJZGVudGlmaWVyVGV4dCIsIm9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgiLCJwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uIiwicGF0aEluTW9kZWwiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwidGFyZ2V0RGlzcGxheU1vZGUiLCJvUHJvcGVydHlEZWZpbml0aW9uIiwidGFyZ2V0T2JqZWN0IiwiJHRhcmdldCIsImNvbW1vblRleHQiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlRleHQiLCJVSSIsIlRleHRBcnJhbmdlbWVudCIsImZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24iLCJyZWxhdGl2ZUxvY2F0aW9uIiwiZ2V0UmVsYXRpdmVQYXRocyIsImNvbXBpbGVFeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiZm9ybWF0UmVzdWx0IiwidmFsdWVGb3JtYXR0ZXJzIiwiZm9ybWF0VG9LZWVwV2hpdGVzcGFjZSIsInNldFVwRGF0YVBvaW50VHlwZSIsIm9EYXRhRmllbGQiLCJ0ZXJtIiwiJFR5cGUiLCJzZXRVcFZpc2libGVQcm9wZXJ0aWVzIiwib0ZpZWxkUHJvcHMiLCJ2aXNpYmxlIiwiRmllbGRUZW1wbGF0aW5nIiwiZ2V0VmlzaWJsZUV4cHJlc3Npb24iLCJmb3JtYXRPcHRpb25zIiwiZGlzcGxheVZpc2libGUiLCJnZXRDb250ZW50SWQiLCJzTWFjcm9JZCIsInNldFVwRWRpdGFibGVQcm9wZXJ0aWVzIiwib0RhdGFNb2RlbFBhdGgiLCJvTWV0YU1vZGVsIiwib1Byb3BlcnR5Rm9yRmllbGRDb250cm9sIiwiVmFsdWUiLCJoYXNQcm9wZXJ0eUluc2VydFJlc3RyaWN0aW9ucyIsImVkaXRNb2RlIiwiZWRpdE1vZGVBc09iamVjdCIsImJNZWFzdXJlUmVhZE9ubHkiLCJVSUZvcm1hdHRlcnMiLCJnZXRFZGl0TW9kZSIsImlmRWxzZSIsImFuZCIsImVkaXRhYmxlRXhwcmVzc2lvbiIsImdldEVkaXRhYmxlRXhwcmVzc2lvbkFzT2JqZWN0IiwiYVJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMiLCJnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zIiwiZW50aXR5U2V0IiwiZ2V0UGF0aCIsInJlcGxhY2VBbGwiLCJhUmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9ucyIsImdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnMiLCJvUmVxdWlyZWRQcm9wZXJ0aWVzIiwicmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyIsInJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnMiLCJNb2RlbEhlbHBlciIsImlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwiRWRpdE1vZGUiLCJEaXNwbGF5IiwiY29sbGFib3JhdGlvbkVuYWJsZWQiLCJjb2xsYWJvcmF0aW9uRXhwcmVzc2lvbiIsImdldENvbGxhYm9yYXRpb25FeHByZXNzaW9uIiwiQ29sbGFib3JhdGlvbkZvcm1hdHRlcnMiLCJoYXNDb2xsYWJvcmF0aW9uQWN0aXZpdHkiLCJjb2xsYWJvcmF0aW9uSGFzQWN0aXZpdHlFeHByZXNzaW9uIiwiY29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbiIsImdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzIiwiY29sbGFib3JhdGlvbkNvbG9yRXhwcmVzc2lvbiIsImdldENvbGxhYm9yYXRpb25BY3Rpdml0eUNvbG9yIiwibm90IiwiY29uc3RhbnQiLCJlbmFibGVkRXhwcmVzc2lvbiIsImdldEVuYWJsZWRFeHByZXNzaW9uIiwicmVxdWlyZWRFeHByZXNzaW9uIiwiZ2V0UmVxdWlyZWRFeHByZXNzaW9uIiwiaWRQcmVmaXgiLCJlZGl0U3R5bGVJZCIsImdlbmVyYXRlIiwic2V0VXBGb3JtYXRPcHRpb25zIiwib0NvbnRyb2xDb25maWd1cmF0aW9uIiwibVNldHRpbmdzIiwib092ZXJyaWRlUHJvcHMiLCJkYXRhRmllbGQiLCJnZXREaXNwbGF5TW9kZSIsInRleHRMaW5lc0VkaXQiLCJ0ZXh0TWF4TGluZXMiLCJtb2RlbHMiLCJ2aWV3RGF0YSIsImdldFByb3BlcnR5IiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsImlzUmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdEVuYWJsZWQiLCJoYXNFbnRpdHlUZXh0QXJyYW5nZW1lbnQiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiX2ZsZXhJZCIsIm5vV3JhcHBlcklkIiwic2V0VXBEaXNwbGF5U3R5bGUiLCJvUHJvcGVydHkiLCJkaXNwbGF5U3R5bGUiLCJoYXNVbml0T3JDdXJyZW5jeSIsIk1lYXN1cmVzIiwiVW5pdCIsIklTT0N1cnJlbmN5IiwiaGFzVmFsaWRBbmFseXRpY2FsQ3VycmVuY3lPclVuaXQiLCJ0ZXh0RnJvbVZhbHVlTGlzdCIsIndyYXBCaW5kaW5nRXhwcmVzc2lvbiIsImZuIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiZmlsZVJlbGF0aXZlUHJvcGVydHlQYXRoIiwiQ29yZSIsIkNvbnRlbnREaXNwb3NpdGlvbiIsIkZpbGVuYW1lIiwiZmlsZU5hbWVEYXRhTW9kZWxQYXRoIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJmaWxlRmlsZW5hbWVFeHByZXNzaW9uIiwiZmlsZVN0cmVhbU5vdEVtcHR5IiwiZXF1YWwiLCJmaWxlVXBsb2FkVXJsIiwiZ2V0VmFsdWVCaW5kaW5nIiwiZmlsZUZpbGVuYW1lUGF0aCIsInBhdGgiLCJmaWxlTWVkaWFUeXBlIiwiTWVkaWFUeXBlIiwiZmlsZUlzSW1hZ2UiLCJJc0ltYWdlVVJMIiwiSXNJbWFnZSIsInRlc3QiLCJ0b1N0cmluZyIsImZpbGVBdmF0YXJTcmMiLCJmaWxlSWNvblNyYyIsIkZpZWxkSGVscGVyIiwiZ2V0UGF0aEZvckljb25Tb3VyY2UiLCJmaWxlTGlua1RleHQiLCJnZXRGaWxlbmFtZUV4cHIiLCJmaWxlTGlua0hyZWYiLCJnZXREb3dubG9hZFVybCIsImZpbGVUZXh0VmlzaWJsZSIsIkFjY2VwdGFibGVNZWRpYVR5cGVzIiwiYWNjZXB0ZWRUeXBlcyIsIkFycmF5IiwiZnJvbSIsIm1hcCIsImZpbGVBY2NlcHRhYmxlTWVkaWFUeXBlcyIsImpvaW4iLCJmaWxlTWF4aW11bVNpemUiLCJjYWxjdWxhdGVNQmZyb21CeXRlIiwibWF4TGVuZ3RoIiwiYXZhdGFyVmlzaWJsZSIsImF2YXRhclNyYyIsIlRhcmdldCIsImNvbnRhY3RWaXNpYmxlIiwiZGF0YUZpZWxkT2JqZWN0IiwiZ2V0T2JqZWN0IiwiYnV0dG9uUHJlc3MiLCJnZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkQWN0aW9uQnV0dG9uIiwiQWN0aW9uVGFyZ2V0IiwiYnV0dG9uSXNCb3VuZCIsImJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZSIsImJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZUZvcm1hdHRlZCIsIkxvZyIsIndhcm5pbmciLCJBY3Rpb24iLCJpc0JvdW5kIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwiYWN0aW9uVGFyZ2V0IiwiYmluZGluZ1BhcmFtTmFtZSIsInBhcmFtZXRlcnMiLCJzdGFydHNXaXRoIiwicmVwbGFjZSIsIkNvbW1vbkhlbHBlciIsImdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTiIsInNldFVwTmF2aWdhdGlvbkF2YWlsYWJsZSIsInRleHQiLCJnZXRUZXh0V2l0aFdoaXRlU3BhY2UiLCJsaW5rSXNEYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwibGlua1ByZXNzIiwibGlua0lzRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoIiwidmFsdWUiLCJsaW5rSXNEYXRhRmllbGRXaXRoQWN0aW9uIiwiaGFzUXVpY2tWaWV3IiwiaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyIsImhhc1NlbWFudGljT2JqZWN0cyIsImdldFByb3BlcnR5V2l0aFNlbWFudGljT2JqZWN0Iiwic2VtYW50aWNPYmplY3QiLCJpc1NlbWFudGljS2V5IiwiaGFzU2l0dWF0aW9uc0luZGljYXRvciIsIlNpdHVhdGlvbnNJbmRpY2F0b3JCbG9jayIsImdldFNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHkiLCJzZXRVcE9iamVjdElkZW50aWZpZXJUaXRsZUFuZFRleHQiLCJjb250ZXh0TG9jYXRpb24iLCJ0YXJnZXRFbnRpdHlTZXQiLCJEcmFmdFJvb3QiLCJkcmFmdEluZGljYXRvclZpc2libGUiLCJnZXREcmFmdEluZGljYXRvclZpc2libGVCaW5kaW5nIiwic2hvd0Vycm9ySW5kaWNhdG9yIiwiX3R5cGUiLCJmaWVsZEdyb3VwRHJhZnRJbmRpY2F0b3JQcm9wZXJ0eVBhdGgiLCJzaXR1YXRpb25zSW5kaWNhdG9yUHJvcGVydHlQYXRoIiwiQ3JpdGljYWxpdHkiLCJsaW5rVXJsIiwiVXJsIiwiU3RyaW5nIiwiaXNDdXJyZW5jeUFsaWduZWQiLCJ2YWx1ZUFzU3RyaW5nQmluZGluZ0V4cHJlc3Npb24iLCJ1bml0QmluZGluZ0V4cHJlc3Npb24iLCJnZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kiLCJDb21tdW5pY2F0aW9uIiwiSXNFbWFpbEFkZHJlc3MiLCJJc1Bob25lTnVtYmVyIiwibGlua0lzRW1haWxBZGRyZXNzIiwibGlua0lzUGhvbmVOdW1iZXIiLCJwcm9wZXJ0eVZhbHVlQmluZGluZyIsIk11bHRpTGluZVRleHQiLCJpY29uVXJsIiwiSWNvblVybCIsInNldFVwRWRpdFN0eWxlIiwiYXBwQ29tcG9uZW50Iiwic2V0RWRpdFN0eWxlUHJvcGVydGllcyIsImZpZWxkR3JvdXBJZHMiLCJjb21wdXRlRmllbGRHcm91cElkcyIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJzaWRlRWZmZWN0U2VydmljZSIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsInJlc3VsdCIsIl9vUHJvcHMiLCJpZGVudGlmaWVyVGl0bGUiLCJpZGVudGlmaWVyVGV4dCIsImdldFRleHRCaW5kaW5nIiwibmF2aWdhdGlvbkF2YWlsYWJsZSIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCJpZ25vcmVOYXZpZ2F0aW9uQXZhaWxhYmxlIiwic2V0VXBWYWx1ZVN0YXRlIiwiZmllbGRQcm9wcyIsImRhdGFNb2RlbFBhdGgiLCJ2YWx1ZVN0YXRlRXhwIiwiZmllbGRDb250YWluZXJUeXBlIiwiZGF0YVNvdXJjZVBhdGgiLCJhZGRpdGlvbmFsVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXRWYWx1ZVN0YXRlIiwidmFsdWVTdGF0ZSIsInByb3BzIiwiY29udHJvbENvbmZpZ3VyYXRpb24iLCJzZXR0aW5ncyIsInJhdGluZ0luZGljYXRvclRvb2x0aXAiLCJyYXRpbmdJbmRpY2F0b3JUYXJnZXRWYWx1ZSIsIm9EYXRhRmllbGRDb252ZXJ0ZWQiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIl9hcGlJZCIsIl92aEZsZXhJZCIsInZoSWRQcmVmaXgiLCJ2YWx1ZURhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yVmFsdWUiLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwibWV0YU1vZGVsIiwiZW50aXR5VHlwZSIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiYURpc3BsYXlTdHlsZXNXaXRob3V0UHJvcFRleHQiLCJpbmRleE9mIiwiZW1wdHlJbmRpY2F0b3JNb2RlIiwic2hvd0VtcHR5SW5kaWNhdG9yIiwiaXNQcm9wZXJ0eSIsIkRhdGFGaWVsZERlZmF1bHQiLCJnZXRUZW1wbGF0ZSIsImdldEZpZWxkU3RydWN0dXJlVGVtcGxhdGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSW50ZXJuYWxGaWVsZC5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFjdGlvbiwgRW50aXR5U2V0LCBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24sIFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFGaWVsZCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgYmxvY2tFdmVudCwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHsgVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncyB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCAqIGFzIENvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL0NvbGxhYm9yYXRpb25Gb3JtYXR0ZXJcIjtcbmltcG9ydCB2YWx1ZUZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvVmFsdWVGb3JtYXR0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0ZXF1YWwsXG5cdGZuLFxuXHRmb3JtYXRSZXN1bHQsXG5cdGZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24sXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRub3QsXG5cdHBhdGhJbk1vZGVsLFxuXHR3cmFwQmluZGluZ0V4cHJlc3Npb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mLCBTdHJpY3RQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7XG5cdGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMsXG5cdGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnNcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTWV0YU1vZGVsRnVuY3Rpb25cIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0VGl0bGVCaW5kaW5nRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1RpdGxlSGVscGVyXCI7XG5pbXBvcnQgeyBpc1Byb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHtcblx0RGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0ZW5oYW5jZURhdGFNb2RlbFBhdGgsXG5cdGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgsXG5cdGdldFJlbGF0aXZlUGF0aHMsXG5cdGdldFRhcmdldE9iamVjdFBhdGhcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgUHJvcGVydHlPclBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EaXNwbGF5TW9kZUZvcm1hdHRlclwiO1xuaW1wb3J0IHsgaXNTZW1hbnRpY0tleSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERpc3BsYXlNb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgKiBhcyBVSUZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0ICogYXMgRmllbGRUZW1wbGF0aW5nIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0IHsgZ2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgU2l0dWF0aW9uc0luZGljYXRvckJsb2NrIGZyb20gXCJzYXAvZmUvbWFjcm9zL3NpdHVhdGlvbnMvU2l0dWF0aW9uc0luZGljYXRvci5ibG9ja1wiO1xuaW1wb3J0IEVkaXRNb2RlIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vRWRpdE1vZGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcIi4uL2ZpZWxkL0ZpZWxkSGVscGVyXCI7XG5pbXBvcnQgZ2V0RmllbGRTdHJ1Y3R1cmVUZW1wbGF0ZSBmcm9tIFwiLi9maWVsZC9GaWVsZFN0cnVjdHVyZVwiO1xuaW1wb3J0IGFkZGl0aW9uYWxWYWx1ZUZvcm1hdHRlciBmcm9tIFwiLi92YWx1ZWhlbHAvQWRkaXRpb25hbFZhbHVlRm9ybWF0dGVyXCI7XG5cbmV4cG9ydCB0eXBlIERpc3BsYXlTdHlsZSA9XG5cdHwgXCJUZXh0XCJcblx0fCBcIkF2YXRhclwiXG5cdHwgXCJGaWxlXCJcblx0fCBcIkRhdGFQb2ludFwiXG5cdHwgXCJDb250YWN0XCJcblx0fCBcIkJ1dHRvblwiXG5cdHwgXCJMaW5rXCJcblx0fCBcIk9iamVjdFN0YXR1c1wiXG5cdHwgXCJBbW91bnRXaXRoQ3VycmVuY3lcIlxuXHR8IFwiU2VtYW50aWNLZXlXaXRoRHJhZnRJbmRpY2F0b3JcIlxuXHR8IFwiT2JqZWN0SWRlbnRpZmllclwiXG5cdHwgXCJMYWJlbFNlbWFudGljS2V5XCJcblx0fCBcIkxpbmtXaXRoUXVpY2tWaWV3XCJcblx0fCBcIkV4cGFuZGFibGVUZXh0XCI7XG5cbnR5cGUgRWRpdFN0eWxlID1cblx0fCBcIklucHV0V2l0aFZhbHVlSGVscFwiXG5cdHwgXCJUZXh0QXJlYVwiXG5cdHwgXCJGaWxlXCJcblx0fCBcIkRhdGVQaWNrZXJcIlxuXHR8IFwiVGltZVBpY2tlclwiXG5cdHwgXCJEYXRlVGltZVBpY2tlclwiXG5cdHwgXCJDaGVja0JveFwiXG5cdHwgXCJJbnB1dFdpdGhVbml0XCJcblx0fCBcIklucHV0XCJcblx0fCBcIlJhdGluZ0luZGljYXRvclwiO1xuXG50eXBlIEZpZWxkRm9ybWF0T3B0aW9ucyA9IFBhcnRpYWw8e1xuXHRkaXNwbGF5TW9kZTogRGlzcGxheU1vZGU7XG5cdGZpZWxkTW9kZTogc3RyaW5nO1xuXHRoYXNEcmFmdEluZGljYXRvcjogYm9vbGVhbjsgLy8gVE9ETyBpcyB0aGlzIHVzZWQ/XG5cdGlzQW5hbHl0aWNzOiBib29sZWFuO1xuXHQvKiogSWYgdHJ1ZSBhbmQgaWYgdGhlIGZpZWxkIGlzIHBhcnQgb2YgYW4gaW5hY3RpdmUgcm93LCB0aGVuIGEgY2hlY2sgd2lsbCBiZSBkb25lIHRvIGRldGVybWluZSBpZiB0aGUgdW5kZXJseWluZyBwcm9wZXJ0eSBoYXMgYSBub24taW5zZXJ0YWJsZSByZXN0cmljdGlvbiAqL1xuXHRmb3JJbmxpbmVDcmVhdGlvblJvd3M6IGJvb2xlYW47XG5cdC8qKiBJZiB0cnVlIHRoZW4gdGhlIG5hdmlnYXRpb25hdmFpbGFibGUgcHJvcGVydHkgd2lsbCBub3QgYmUgdXNlZCBmb3IgdGhlIGVuYWJsZW1lbnQgb2YgdGhlIElCTiBidXR0b24gKi9cblx0aWdub3JlTmF2aWdhdGlvbkF2YWlsYWJsZTogYm9vbGVhbjtcblx0aXNDdXJyZW5jeUFsaWduZWQ6IGJvb2xlYW47XG5cdG1lYXN1cmVEaXNwbGF5TW9kZTogc3RyaW5nO1xuXHQvKiogRW5hYmxlcyB0aGUgZmFsbGJhY2sgZmVhdHVyZSBmb3IgdGhlIHVzYWdlIG9mIHRoZSB0ZXh0IGFubm90YXRpb24gZnJvbSB0aGUgdmFsdWUgbGlzdHMgKi9cblx0cmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdDogYm9vbGVhbjtcblx0c2VtYW50aWNrZXlzOiBzdHJpbmdbXTtcblx0LyoqIFByZWZlcnJlZCBjb250cm9sIHRvIHZpc3VhbGl6ZSBzZW1hbnRpYyBrZXkgcHJvcGVydGllcyAqL1xuXHRzZW1hbnRpY0tleVN0eWxlOiBzdHJpbmc7XG5cdC8qKiBJZiBzZXQgdG8gJ3RydWUnLCBTQVAgRmlvcmkgZWxlbWVudHMgc2hvd3MgYW4gZW1wdHkgaW5kaWNhdG9yIGluIGRpc3BsYXkgbW9kZSBmb3IgdGhlIHRleHQgYW5kIGxpbmtzICovXG5cdHNob3dFbXB0eUluZGljYXRvcjogYm9vbGVhbjtcblx0LyoqIElmIHRydWUgdGhlbiBzZXRzIHRoZSBnaXZlbiBpY29uIGluc3RlYWQgb2YgdGV4dCBpbiBBY3Rpb24vSUJOIEJ1dHRvbiAqL1xuXHRzaG93SWNvblVybDogYm9vbGVhbjtcblx0LyoqIERlc2NyaWJlIGhvdyB0aGUgYWxpZ25tZW50IHdvcmtzIGJldHdlZW4gVGFibGUgbW9kZSAoRGF0ZSBhbmQgTnVtZXJpYyBFbmQgYWxpZ25tZW50KSBhbmQgRm9ybSBtb2RlIChudW1lcmljIGFsaWduZWQgRW5kIGluIGVkaXQgYW5kIEJlZ2luIGluIGRpc3BsYXkpICovXG5cdHRleHRBbGlnbk1vZGU6IHN0cmluZztcblx0LyoqIE1heGltdW0gbnVtYmVyIG9mIGxpbmVzIGZvciBtdWx0aWxpbmUgdGV4dHMgaW4gZWRpdCBtb2RlICovXG5cdHRleHRMaW5lc0VkaXQ6IHN0cmluZztcblx0LyoqIE1heGltdW0gbnVtYmVyIG9mIGxpbmVzIHRoYXQgbXVsdGlsaW5lIHRleHRzIGluIGVkaXQgbW9kZSBjYW4gZ3JvdyB0byAqL1xuXHR0ZXh0TWF4TGluZXM6IHN0cmluZztcblx0Y29tcGFjdFNlbWFudGljS2V5OiBzdHJpbmc7XG5cdGZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aDogc3RyaW5nO1xuXHRmaWVsZEdyb3VwTmFtZTogc3RyaW5nO1xuXHR0ZXh0TWF4TGVuZ3RoOiBudW1iZXI7XG5cdC8qKiBNYXhpbXVtIG51bWJlciBvZiBjaGFyYWN0ZXJzIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgdGV4dCBmaWVsZCB0aGF0IGFyZSBzaG93biBpbml0aWFsbHkuICovXG5cdHRleHRNYXhDaGFyYWN0ZXJzRGlzcGxheTogbnVtYmVyO1xuXHQvKiogRGVmaW5lcyBob3cgdGhlIGZ1bGwgdGV4dCB3aWxsIGJlIGRpc3BsYXllZCAtIEluUGxhY2Ugb3IgUG9wb3ZlciAqL1xuXHR0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5OiBzdHJpbmc7XG5cdGRhdGVGb3JtYXRPcHRpb25zPzogVUlGb3JtYXR0ZXJzLmRhdGVGb3JtYXRPcHRpb25zOyAvLyBzaG93VGltZSBoZXJlIGlzIHVzZWQgZm9yIHRleHQgZm9ybWF0dGluZyBvbmx5XG59PjtcblxuZXhwb3J0IHR5cGUgRmllbGRQcm9wZXJ0aWVzID0gU3RyaWN0UHJvcGVydGllc09mPEludGVybmFsRmllbGRCbG9jaz47XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmllbGQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogVXN1YWxseSwgYSBEYXRhRmllbGQgYW5ub3RhdGlvbiBpcyBleHBlY3RlZFxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogPGludGVybmFsTWFjcm86RmllbGRcbiAqICAgaWRQcmVmaXg9XCJTb21lUHJlZml4XCJcbiAqICAgY29udGV4dFBhdGg9XCJ7ZW50aXR5U2V0Pn1cIlxuICogICBtZXRhUGF0aD1cIntkYXRhRmllbGQ+fVwiXG4gKiAvPlxuICogPC9wcmU+XG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqIEBzaW5jZSAxLjk0LjBcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkZpZWxkXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdGRlc2lnbnRpbWU6IFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9GaWVsZC5kZXNpZ250aW1lXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlcm5hbEZpZWxkQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgZGF0YVNvdXJjZVBhdGg/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBlbXB0eUluZGljYXRvck1vZGU/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBfZmxleElkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgaWRQcmVmaXg/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBfYXBpSWQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBub1dyYXBwZXJJZD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIHZoSWRQcmVmaXg6IHN0cmluZyA9IFwiRmllbGRWYWx1ZUhlbHBcIjtcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgZW50aXR5IHNldFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCIsIFwiRW50aXR5VHlwZVwiLCBcIlNpbmdsZXRvblwiXVxuXHR9KVxuXHRwdWJsaWMgZW50aXR5U2V0ITogQ29udGV4dDtcblxuXHQvKipcblx0ICogRmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgYWN0aW9uIHdpbGwgbmF2aWdhdGUgYWZ0ZXIgZXhlY3V0aW9uXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHB1YmxpYyBuYXZpZ2F0ZUFmdGVyQWN0aW9uOiBib29sZWFuID0gdHJ1ZTtcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgZGF0YUZpZWxkLlxuXHQgKiBUaGlzIHByb3BlcnR5IGlzIHVzdWFsbHkgYSBtZXRhZGF0YUNvbnRleHQgcG9pbnRpbmcgdG8gYSBEYXRhRmllbGQgaGF2aW5nXG5cdCAqICRUeXBlIG9mIERhdGFGaWVsZCwgRGF0YUZpZWxkV2l0aFVybCwgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiwgRGF0YUZpZWxkRm9yQWN0aW9uLCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sIERhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCwgb3IgRGF0YVBvaW50VHlwZS5cblx0ICogQnV0IGl0IGNhbiBhbHNvIGJlIGEgUHJvcGVydHkgd2l0aCAka2luZD1cIlByb3BlcnR5XCJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIlByb3BlcnR5XCJdLFxuXHRcdGV4cGVjdGVkQW5ub3RhdGlvblR5cGVzOiBbXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoQWN0aW9uXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFR5cGVcIlxuXHRcdF1cblx0fSlcblx0cHVibGljIGRhdGFGaWVsZCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIEVkaXQgTW9kZSBvZiB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIElmIHRoZSBlZGl0TW9kZSBpcyB1bmRlZmluZWQgdGhlbiB3ZSBjb21wdXRlIGl0IGJhc2VkIG9uIHRoZSBtZXRhZGF0YVxuXHQgKiBPdGhlcndpc2Ugd2UgdXNlIHRoZSB2YWx1ZSBwcm92aWRlZCBoZXJlLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tZGMuZW51bS5FZGl0TW9kZVwiXG5cdH0pXG5cdHB1YmxpYyBlZGl0TW9kZT86IEVkaXRNb2RlIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyoqXG5cdCAqIFdyYXAgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0cHVibGljIHdyYXA/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDU1MgY2xhc3MgZm9yIG1hcmdpblxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBjbGFzcz86IHN0cmluZztcblxuXHQvKipcblx0ICogUHJvcGVydHkgYWRkZWQgdG8gYXNzb2NpYXRlIHRoZSBsYWJlbCB3aXRoIHRoZSBGaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHB1YmxpYyBhcmlhTGFiZWxsZWRCeT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuVGV4dEFsaWduXCJcblx0fSlcblx0cHVibGljIHRleHRBbGlnbj86IHN0cmluZztcblxuXHQvKipcblx0ICogT3B0aW9uIHRvIGFkZCBhIHNlbWFudGljIG9iamVjdCB0byBhIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0cmVxdWlyZWQ6IGZhbHNlXG5cdH0pXG5cdHB1YmxpYyBzZW1hbnRpY09iamVjdD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIHJlcXVpcmVkRXhwcmVzc2lvbj86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHB1YmxpYyB2aXNpYmxlPzogYm9vbGVhbiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHNob3dFcnJvck9iamVjdFN0YXR1cz86IGJvb2xlYW4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwib2JqZWN0XCIsXG5cdFx0dmFsaWRhdGU6IGZ1bmN0aW9uIChmb3JtYXRPcHRpb25zSW5wdXQ6IEZpZWxkRm9ybWF0T3B0aW9ucykge1xuXHRcdFx0aWYgKGZvcm1hdE9wdGlvbnNJbnB1dC50ZXh0QWxpZ25Nb2RlICYmICFbXCJUYWJsZVwiLCBcIkZvcm1cIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0LnRleHRBbGlnbk1vZGUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC50ZXh0QWxpZ25Nb2RlfSBmb3IgdGV4dEFsaWduTW9kZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnNJbnB1dC5kaXNwbGF5TW9kZSAmJlxuXHRcdFx0XHQhW1wiVmFsdWVcIiwgXCJEZXNjcmlwdGlvblwiLCBcIlZhbHVlRGVzY3JpcHRpb25cIiwgXCJEZXNjcmlwdGlvblZhbHVlXCJdLmluY2x1ZGVzKGZvcm1hdE9wdGlvbnNJbnB1dC5kaXNwbGF5TW9kZSlcblx0XHRcdCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEFsbG93ZWQgdmFsdWUgJHtmb3JtYXRPcHRpb25zSW5wdXQuZGlzcGxheU1vZGV9IGZvciBkaXNwbGF5TW9kZSBkb2VzIG5vdCBtYXRjaGApO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0LmZpZWxkTW9kZSAmJiAhW1wibm93cmFwcGVyXCIsIFwiXCJdLmluY2x1ZGVzKGZvcm1hdE9wdGlvbnNJbnB1dC5maWVsZE1vZGUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5maWVsZE1vZGV9IGZvciBmaWVsZE1vZGUgZG9lcyBub3QgbWF0Y2hgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGZvcm1hdE9wdGlvbnNJbnB1dC5tZWFzdXJlRGlzcGxheU1vZGUgJiYgIVtcIkhpZGRlblwiLCBcIlJlYWRPbmx5XCJdLmluY2x1ZGVzKGZvcm1hdE9wdGlvbnNJbnB1dC5tZWFzdXJlRGlzcGxheU1vZGUpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgQWxsb3dlZCB2YWx1ZSAke2Zvcm1hdE9wdGlvbnNJbnB1dC5tZWFzdXJlRGlzcGxheU1vZGV9IGZvciBtZWFzdXJlRGlzcGxheU1vZGUgZG9lcyBub3QgbWF0Y2hgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zSW5wdXQudGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheSAmJlxuXHRcdFx0XHQhW1wiSW5QbGFjZVwiLCBcIlBvcG92ZXJcIl0uaW5jbHVkZXMoZm9ybWF0T3B0aW9uc0lucHV0LnRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXkpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LnRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXl9IGZvciB0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5IGRvZXMgbm90IG1hdGNoYFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoZm9ybWF0T3B0aW9uc0lucHV0LnNlbWFudGljS2V5U3R5bGUgJiYgIVtcIk9iamVjdElkZW50aWZpZXJcIiwgXCJMYWJlbFwiLCBcIlwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQuc2VtYW50aWNLZXlTdHlsZSkpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LnNlbWFudGljS2V5U3R5bGV9IGZvciBzZW1hbnRpY0tleVN0eWxlIGRvZXMgbm90IG1hdGNoYCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgZm9ybWF0T3B0aW9uc0lucHV0LmlzQW5hbHl0aWNzID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGZvcm1hdE9wdGlvbnNJbnB1dC5pc0FuYWx5dGljcyA9IGZvcm1hdE9wdGlvbnNJbnB1dC5pc0FuYWx5dGljcyA9PT0gXCJ0cnVlXCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmICh0eXBlb2YgZm9ybWF0T3B0aW9uc0lucHV0LmZvcklubGluZUNyZWF0aW9uUm93cyA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRmb3JtYXRPcHRpb25zSW5wdXQuZm9ySW5saW5lQ3JlYXRpb25Sb3dzID0gZm9ybWF0T3B0aW9uc0lucHV0LmZvcklubGluZUNyZWF0aW9uUm93cyA9PT0gXCJ0cnVlXCI7XG5cdFx0XHR9XG5cblx0XHRcdC8qXG5cdFx0XHRIaXN0b3JpY2FsIGRlZmF1bHQgdmFsdWVzIGFyZSBjdXJyZW50bHkgZGlzYWJsZWRcblx0XHRcdGlmICghZm9ybWF0T3B0aW9uc0lucHV0LnNlbWFudGljS2V5U3R5bGUpIHtcblx0XHRcdFx0Zm9ybWF0T3B0aW9uc0lucHV0LnNlbWFudGljS2V5U3R5bGUgPSBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0Ki9cblxuXHRcdFx0cmV0dXJuIGZvcm1hdE9wdGlvbnNJbnB1dDtcblx0XHR9XG5cdH0pXG5cdHB1YmxpYyBmb3JtYXRPcHRpb25zOiBGaWVsZEZvcm1hdE9wdGlvbnMgPSB7fTtcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgZW50aXR5IHNldC5cblx0ICogVGhpcyBpcyB1c2VkIGluIGlubmVyIGZyYWdtZW50cywgc28gd2UgbmVlZCB0byBkZWNsYXJlIGl0IGFzIGJsb2NrIGF0dHJpYnV0ZSBjb250ZXh0LlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0fSlcblx0ZW50aXR5VHlwZT86IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIFRoaXMgaXMgdXNlZCBpbiBpbm5lciBmcmFnbWVudHMsIHNvIHdlIG5lZWQgdG8gZGVjbGFyZSBpdCBhcyBibG9jayBhdHRyaWJ1dGUuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdGNvbGxhYm9yYXRpb25FbmFibGVkPzogYm9vbGVhbjtcblxuXHQvKipcblx0ICogVGhpcyBpcyB1c2VkIGluIGlubmVyIGZyYWdtZW50cywgc28gd2UgbmVlZCB0byBkZWNsYXJlIGl0IGFzIGJsb2NrIGF0dHJpYnV0ZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRfdmhGbGV4SWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoaXMgaXMgdXNlZCB0byBzZXQgdmFsdWVTdGF0ZSBvbiB0aGUgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHR2YWx1ZVN0YXRlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgZm9yIGNoYW5nZSBldmVudFxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRvbkNoYW5nZT86IHN0cmluZztcblxuXHQvLyBDb21wdXRlZCBwcm9wZXJ0aWVzXG5cblx0ZWRpdGFibGVFeHByZXNzaW9uOiBzdHJpbmcgfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRlbmFibGVkRXhwcmVzc2lvbjogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0Y29sbGFib3JhdGlvbkhhc0FjdGl2aXR5RXhwcmVzc2lvbjogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0Y29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbjogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0Y29sbGFib3JhdGlvbkNvbG9yRXhwcmVzc2lvbjogc3RyaW5nIHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZGVzY3JpcHRpb25CaW5kaW5nRXhwcmVzc2lvbj86IHN0cmluZztcblxuXHRkaXNwbGF5VmlzaWJsZT86IHN0cmluZyB8IGJvb2xlYW47XG5cblx0ZWRpdE1vZGVBc09iamVjdD86IGFueTtcblxuXHRlZGl0U3R5bGU/OiBFZGl0U3R5bGUgfCBudWxsO1xuXG5cdGhhc1F1aWNrVmlldyA9IGZhbHNlO1xuXG5cdG5hdmlnYXRpb25BdmFpbGFibGU/OiBib29sZWFuIHwgc3RyaW5nO1xuXG5cdHNob3dUaW1lem9uZT86IGJvb2xlYW47XG5cblx0dGV4dD86IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0aWRlbnRpZmllclRpdGxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0aWRlbnRpZmllclRleHQ/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHR0ZXh0QmluZGluZ0V4cHJlc3Npb24/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHR1bml0QmluZGluZ0V4cHJlc3Npb24/OiBzdHJpbmc7XG5cblx0dmFsdWVCaW5kaW5nRXhwcmVzc2lvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdHZhbHVlQXNTdHJpbmdCaW5kaW5nRXhwcmVzc2lvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdC8vIChzdGFydCkgQ29tcHV0ZWQgcHJvcGVydGllcyBmb3IgTGluay5mcmFnbWVudC54bWxcblxuXHRsaW5rVXJsPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gPSB1bmRlZmluZWQ7XG5cblx0bGlua0lzRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdGxpbmtJc0RhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdGxpbmtJc0RhdGFGaWVsZFdpdGhBY3Rpb246IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRsaW5rSXNFbWFpbEFkZHJlc3M6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRsaW5rSXNQaG9uZU51bWJlcjogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdGxpbmtQcmVzcz86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uID0gdW5kZWZpbmVkO1xuXG5cdC8vIChlbmQpIENvbXB1dGVkIHByb3BlcnRpZXMgZm9yIExpbmsuZnJhZ21lbnQueG1sXG5cblx0aWNvblVybD86IHN0cmluZyB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGRpc3BsYXlTdHlsZT86IERpc3BsYXlTdHlsZTtcblxuXHRoYXNTaXR1YXRpb25zSW5kaWNhdG9yPzogYm9vbGVhbjtcblxuXHRhdmF0YXJWaXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0YXZhdGFyU3JjPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0Ly8gKHN0YXJ0KSBDb21wdXRlZCBwcm9wZXJ0aWVzIGZvciBGaWxlLmZyYWdtZW50LnhtbFxuXG5cdGZpbGVSZWxhdGl2ZVByb3BlcnR5UGF0aD86IHN0cmluZztcblxuXHRmaWxlRmlsZW5hbWVFeHByZXNzaW9uPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gPSB1bmRlZmluZWQ7XG5cblx0ZmlsZVN0cmVhbU5vdEVtcHR5PzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZmlsZVVwbG9hZFVybD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGZpbGVGaWxlbmFtZVBhdGg/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRmaWxlTWVkaWFUeXBlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0ZmlsZUlzSW1hZ2U/OiBib29sZWFuO1xuXG5cdGZpbGVBdmF0YXJTcmM/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHRmaWxlSWNvblNyYz86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGZpbGVMaW5rVGV4dD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGZpbGVMaW5rSHJlZj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGZpbGVUZXh0VmlzaWJsZT86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGZpbGVBY2NlcHRhYmxlTWVkaWFUeXBlcz86IHN0cmluZyA9IHVuZGVmaW5lZDtcblxuXHRmaWxlTWF4aW11bVNpemU/OiBzdHJpbmc7XG5cblx0Ly8gKGVuZCkgQ29tcHV0ZWQgcHJvcGVydGllcyBmb3IgRmlsZS5mcmFnbWVudC54bWxcblxuXHRjb250YWN0VmlzaWJsZT86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdGJ1dHRvblByZXNzPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0YnV0dG9uSXNCb3VuZD86IHN0cmluZyB8IGJvb2xlYW47XG5cblx0YnV0dG9uT3BlcmF0aW9uQXZhaWxhYmxlPzogc3RyaW5nO1xuXG5cdGJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZUZvcm1hdHRlZD86IHN0cmluZztcblxuXHRmaWVsZEdyb3VwSWRzPzogc3RyaW5nO1xuXHQvKiBEaXNwbGF5IHN0eWxlIGNvbW1vbiBwcm9wZXJ0aWVzIHN0YXJ0ICovXG5cdGhhc1VuaXRPckN1cnJlbmN5PzogYm9vbGVhbiA9IHVuZGVmaW5lZDtcblxuXHRoYXNWYWxpZEFuYWx5dGljYWxDdXJyZW5jeU9yVW5pdD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uID0gdW5kZWZpbmVkO1xuXG5cdHRleHRGcm9tVmFsdWVMaXN0PzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gPSB1bmRlZmluZWQ7XG5cdC8qIEFtb3VudFdpdGggY3VycmVuY3kgZnJhZ21lbnQgZW5kICovXG5cblx0LyogRWRpdCBzdHlsZSBjb21tb24gcHJvcGVydGllcyBzdGFydCAqL1xuXHRlZGl0U3R5bGVJZD86IHN0cmluZyA9IHVuZGVmaW5lZDtcblxuXHQvKipcblx0ICogVGhpcyBpcyB1c2VkIGluIGlubmVyIGZyYWdtZW50cywgc28gd2UgbmVlZCB0byBkZWNsYXJlIGl0IGFzIGJsb2NrIGF0dHJpYnV0ZS5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRlZGl0U3R5bGVQbGFjZWhvbGRlcj86IHN0cmluZztcblx0LyogRWRpdCBzdHlsZSBjb21tb24gcHJvcGVydGllcyBlbmQgKi9cblxuXHQvKiBSYXRpbmcgSW5kaWNhdG9yIHByb3BlcnRpZXMgc3RhcnQgKi9cblx0cmF0aW5nSW5kaWNhdG9yVG9vbHRpcD86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uID0gdW5kZWZpbmVkO1xuXG5cdHJhdGluZ0luZGljYXRvclRhcmdldFZhbHVlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gPSB1bmRlZmluZWQ7XG5cdC8qIFJhdGluZyBJbmRpY2F0b3IgcHJvcGVydGllcyBlbmQgKi9cblxuXHQvKiBJbnB1dFdpdGhVbml0IHN0YXJ0ICovXG5cdHVuaXRFZGl0YWJsZT86IHN0cmluZztcblxuXHRzdGF0aWNVbml0Pzogc3RyaW5nO1xuXG5cdHZhbHVlSW5wdXRXaWR0aD86IHN0cmluZztcblxuXHR2YWx1ZUlucHV0RmllbGRXaWR0aD86IHN0cmluZztcblxuXHR1bml0SW5wdXRWaXNpYmxlPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0LyogSW5wdXRXaXRoVW5pdCBlbmQgKi9cblxuXHQvKk9iamVjdElkZW50aWZpZXIgc3RhcnQgKi9cblx0c2hvd0Vycm9ySW5kaWNhdG9yID0gZmFsc2U7XG5cblx0c2l0dWF0aW9uc0luZGljYXRvclByb3BlcnR5UGF0aCA9IFwiXCI7XG5cdC8qIE9iamVjdElkZW50aWZpZXIgZW5kICovXG5cblx0LypTZW1hbnRpY0tleVdpdGhEcmFmdEluZGljYXRvciBzdGFydCovXG5cdGRyYWZ0SW5kaWNhdG9yVmlzaWJsZT86IHN0cmluZztcblx0LypTZW1hbnRpY0tleVdpdGhEcmFmdEluZGljYXRvciBlbmQqL1xuXG5cdHN0YXRpYyBnZXRPdmVycmlkZXMobUNvbnRyb2xDb25maWd1cmF0aW9uOiBhbnksIHNJRDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb1Byb3BzOiB7IFtpbmRleDogc3RyaW5nXTogYW55IH0gPSB7fTtcblx0XHRpZiAobUNvbnRyb2xDb25maWd1cmF0aW9uKSB7XG5cdFx0XHRjb25zdCBvQ29udHJvbENvbmZpZyA9IG1Db250cm9sQ29uZmlndXJhdGlvbltzSURdO1xuXHRcdFx0aWYgKG9Db250cm9sQ29uZmlnKSB7XG5cdFx0XHRcdE9iamVjdC5rZXlzKG9Db250cm9sQ29uZmlnKS5mb3JFYWNoKGZ1bmN0aW9uIChzQ29uZmlnS2V5KSB7XG5cdFx0XHRcdFx0b1Byb3BzW3NDb25maWdLZXldID0gb0NvbnRyb2xDb25maWdbc0NvbmZpZ0tleV07XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1Byb3BzO1xuXHR9XG5cblx0c3RhdGljIGdldElkZW50aWZpZXJUaXRsZShcblx0XHRmaWVsZEZvcm1hdE9wdGlvbnM6IEZpZWxkRm9ybWF0T3B0aW9ucyxcblx0XHRmdWxsQ29udGV4dFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0YWx3YXlzU2hvd0Rlc2NyaXB0aW9uQW5kVmFsdWU6IGJvb2xlYW5cblx0KTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRcdHJldHVybiBnZXRUaXRsZUJpbmRpbmdFeHByZXNzaW9uKFxuXHRcdFx0ZnVsbENvbnRleHRQYXRoLFxuXHRcdFx0Z2V0VGV4dEJpbmRpbmdFeHByZXNzaW9uLFxuXHRcdFx0ZmllbGRGb3JtYXRPcHRpb25zLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0YWx3YXlzU2hvd0Rlc2NyaXB0aW9uQW5kVmFsdWVcblx0XHQpO1xuXHR9XG5cblx0c3RhdGljIGdldE9iamVjdElkZW50aWZpZXJUZXh0KFxuXHRcdGZpZWxkRm9ybWF0T3B0aW9uczogRmllbGRGb3JtYXRPcHRpb25zLFxuXHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGhcblx0KTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRcdGxldCBwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PiA9IHBhdGhJbk1vZGVsKFxuXHRcdFx0Z2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoKVxuXHRcdCk7XG5cdFx0Y29uc3QgdGFyZ2V0RGlzcGxheU1vZGUgPSBmaWVsZEZvcm1hdE9wdGlvbnM/LmRpc3BsYXlNb2RlO1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eURlZmluaXRpb24gPVxuXHRcdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudHlwZSA9PT0gXCJQcm9wZXJ0eVBhdGhcIlxuXHRcdFx0XHQ/IChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kdGFyZ2V0IGFzIFByb3BlcnR5KVxuXHRcdFx0XHQ6IChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eSk7XG5cblx0XHRjb25zdCBjb21tb25UZXh0ID0gb1Byb3BlcnR5RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0O1xuXHRcdGlmIChjb21tb25UZXh0ID09PSB1bmRlZmluZWQgfHwgY29tbW9uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24gPSBmb3JtYXRXaXRoVHlwZUluZm9ybWF0aW9uKG9Qcm9wZXJ0eURlZmluaXRpb24sIHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24pO1xuXG5cdFx0c3dpdGNoICh0YXJnZXREaXNwbGF5TW9kZSkge1xuXHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0Y29uc3QgcmVsYXRpdmVMb2NhdGlvbiA9IGdldFJlbGF0aXZlUGF0aHMob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oY29tbW9uVGV4dCwgcmVsYXRpdmVMb2NhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4pO1xuXHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uVmFsdWVcIjpcblx0XHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGZvcm1hdFJlc3VsdChbcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbl0sIHZhbHVlRm9ybWF0dGVycy5mb3JtYXRUb0tlZXBXaGl0ZXNwYWNlKSk7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBzZXRVcERhdGFQb2ludFR5cGUob0RhdGFGaWVsZDogYW55KSB7XG5cdFx0Ly8gZGF0YSBwb2ludCBhbm5vdGF0aW9ucyBuZWVkIG5vdCBoYXZlICRUeXBlIGRlZmluZWQsIHNvIGFkZCBpdCBpZiBtaXNzaW5nXG5cdFx0aWYgKG9EYXRhRmllbGQ/LnRlcm0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCIpIHtcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPSBvRGF0YUZpZWxkLiRUeXBlIHx8IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU7XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIHNldFVwVmlzaWJsZVByb3BlcnRpZXMob0ZpZWxkUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRcdC8vIHdlIGRvIHRoaXMgYmVmb3JlIGVuaGFuY2luZyB0aGUgZGF0YU1vZGVsUGF0aCBzbyB0aGF0IGl0IHN0aWxsIHBvaW50cyBhdCB0aGUgRGF0YUZpZWxkXG5cdFx0b0ZpZWxkUHJvcHMudmlzaWJsZSA9IEZpZWxkVGVtcGxhdGluZy5nZXRWaXNpYmxlRXhwcmVzc2lvbihvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBvRmllbGRQcm9wcy5mb3JtYXRPcHRpb25zKTtcblx0XHRvRmllbGRQcm9wcy5kaXNwbGF5VmlzaWJsZSA9IG9GaWVsZFByb3BzLmZvcm1hdE9wdGlvbnMuZmllbGRNb2RlID09PSBcIm5vd3JhcHBlclwiID8gb0ZpZWxkUHJvcHMudmlzaWJsZSA6IHVuZGVmaW5lZDtcblx0fVxuXG5cdHN0YXRpYyBnZXRDb250ZW50SWQoc01hY3JvSWQ6IHN0cmluZykge1xuXHRcdHJldHVybiBgJHtzTWFjcm9JZH0tY29udGVudGA7XG5cdH1cblxuXHRzdGF0aWMgc2V0VXBFZGl0YWJsZVByb3BlcnRpZXMob1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9EYXRhRmllbGQ6IGFueSwgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIG9NZXRhTW9kZWw6IGFueSk6IHZvaWQge1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eUZvckZpZWxkQ29udHJvbCA9IG9EYXRhTW9kZWxQYXRoPy50YXJnZXRPYmplY3Q/LlZhbHVlXG5cdFx0XHQ/IG9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdC5WYWx1ZVxuXHRcdFx0OiBvRGF0YU1vZGVsUGF0aD8udGFyZ2V0T2JqZWN0O1xuXG5cdFx0bGV0IGhhc1Byb3BlcnR5SW5zZXJ0UmVzdHJpY3Rpb25zOiBib29sZWFuID0gZmFsc2U7XG5cdFx0aWYgKG9Qcm9wcy5mb3JtYXRPcHRpb25zPy5mb3JJbmxpbmVDcmVhdGlvblJvd3MgPT09IHRydWUpIHtcblx0XHRcdGhhc1Byb3BlcnR5SW5zZXJ0UmVzdHJpY3Rpb25zID0gRmllbGRUZW1wbGF0aW5nLmhhc1Byb3BlcnR5SW5zZXJ0UmVzdHJpY3Rpb25zKG9EYXRhTW9kZWxQYXRoKTtcblx0XHR9XG5cdFx0aWYgKG9Qcm9wcy5lZGl0TW9kZSAhPT0gdW5kZWZpbmVkICYmIG9Qcm9wcy5lZGl0TW9kZSAhPT0gbnVsbCkge1xuXHRcdFx0Ly8gRXZlbiBpZiBpdCBwcm92aWRlZCBhcyBhIHN0cmluZyBpdCdzIGEgdmFsaWQgcGFydCBvZiBhIGJpbmRpbmcgZXhwcmVzc2lvbiB0aGF0IGNhbiBiZSBsYXRlciBjb21iaW5lZCBpbnRvIHNvbWV0aGluZyBlbHNlLlxuXHRcdFx0b1Byb3BzLmVkaXRNb2RlQXNPYmplY3QgPSBvUHJvcHMuZWRpdE1vZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IGJNZWFzdXJlUmVhZE9ubHkgPSBvUHJvcHMuZm9ybWF0T3B0aW9ucy5tZWFzdXJlRGlzcGxheU1vZGVcblx0XHRcdFx0PyBvUHJvcHMuZm9ybWF0T3B0aW9ucy5tZWFzdXJlRGlzcGxheU1vZGUgPT09IFwiUmVhZE9ubHlcIlxuXHRcdFx0XHQ6IGZhbHNlO1xuXG5cdFx0XHRvUHJvcHMuZWRpdE1vZGVBc09iamVjdCA9IFVJRm9ybWF0dGVycy5nZXRFZGl0TW9kZShcblx0XHRcdFx0b1Byb3BlcnR5Rm9yRmllbGRDb250cm9sLFxuXHRcdFx0XHRvRGF0YU1vZGVsUGF0aCxcblx0XHRcdFx0Yk1lYXN1cmVSZWFkT25seSxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0b0RhdGFGaWVsZFxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy5lZGl0TW9kZSA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRpZkVsc2UoYW5kKHBhdGhJbk1vZGVsKFwiQCR1aTUuY29udGV4dC5pc0luYWN0aXZlXCIpLCBoYXNQcm9wZXJ0eUluc2VydFJlc3RyaWN0aW9ucyksIFwiRGlzcGxheVwiLCBvUHJvcHMuZWRpdE1vZGVBc09iamVjdClcblx0XHRcdCk7XG5cdFx0fVxuXHRcdGNvbnN0IGVkaXRhYmxlRXhwcmVzc2lvbiA9IFVJRm9ybWF0dGVycy5nZXRFZGl0YWJsZUV4cHJlc3Npb25Bc09iamVjdChvUHJvcGVydHlGb3JGaWVsZENvbnRyb2wsIG9EYXRhRmllbGQsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHRjb25zdCBhUmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyA9IGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMoXG5cdFx0XHRvUHJvcHMuZW50aXR5U2V0Py5nZXRQYXRoKCkucmVwbGFjZUFsbChcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy9cIiwgXCIvXCIpLFxuXHRcdFx0b01ldGFNb2RlbFxuXHRcdCk7XG5cdFx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnMgPSBnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zKFxuXHRcdFx0b1Byb3BzLmVudGl0eVNldD8uZ2V0UGF0aCgpLnJlcGxhY2VBbGwoXCIvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvXCIsIFwiL1wiKSxcblx0XHRcdG9NZXRhTW9kZWxcblx0XHQpO1xuXHRcdGNvbnN0IG9SZXF1aXJlZFByb3BlcnRpZXMgPSB7XG5cdFx0XHRyZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zOiBhUmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyxcblx0XHRcdHJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnM6IGFSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zXG5cdFx0fTtcblx0XHRpZiAoTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQob01ldGFNb2RlbCkgJiYgb1Byb3BzLmVkaXRNb2RlICE9PSBFZGl0TW9kZS5EaXNwbGF5KSB7XG5cdFx0XHRvUHJvcHMuY29sbGFib3JhdGlvbkVuYWJsZWQgPSB0cnVlO1xuXHRcdFx0Ly8gRXhwcmVzc2lvbnMgbmVlZGVkIGZvciBDb2xsYWJvcmF0aW9uIFZpc3VhbGl6YXRpb25cblx0XHRcdGNvbnN0IGNvbGxhYm9yYXRpb25FeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmdldENvbGxhYm9yYXRpb25FeHByZXNzaW9uKFxuXHRcdFx0XHRvRGF0YU1vZGVsUGF0aCxcblx0XHRcdFx0Q29sbGFib3JhdGlvbkZvcm1hdHRlcnMuaGFzQ29sbGFib3JhdGlvbkFjdGl2aXR5XG5cdFx0XHQpO1xuXHRcdFx0b1Byb3BzLmNvbGxhYm9yYXRpb25IYXNBY3Rpdml0eUV4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihjb2xsYWJvcmF0aW9uRXhwcmVzc2lvbik7XG5cdFx0XHRvUHJvcHMuY29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRVSUZvcm1hdHRlcnMuZ2V0Q29sbGFib3JhdGlvbkV4cHJlc3Npb24ob0RhdGFNb2RlbFBhdGgsIENvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzLmdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzKVxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy5jb2xsYWJvcmF0aW9uQ29sb3JFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFVJRm9ybWF0dGVycy5nZXRDb2xsYWJvcmF0aW9uRXhwcmVzc2lvbihvRGF0YU1vZGVsUGF0aCwgQ29sbGFib3JhdGlvbkZvcm1hdHRlcnMuZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5Q29sb3IpXG5cdFx0XHQpO1xuXHRcdFx0b1Byb3BzLmVkaXRhYmxlRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKGFuZChlZGl0YWJsZUV4cHJlc3Npb24sIG5vdChjb2xsYWJvcmF0aW9uRXhwcmVzc2lvbikpKTtcblxuXHRcdFx0b1Byb3BzLmVkaXRNb2RlID0gY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKGNvbGxhYm9yYXRpb25FeHByZXNzaW9uLCBjb25zdGFudChcIlJlYWRPbmx5XCIpLCBvUHJvcHMuZWRpdE1vZGVBc09iamVjdCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJvcHMuZWRpdGFibGVFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oZWRpdGFibGVFeHByZXNzaW9uKTtcblx0XHR9XG5cdFx0b1Byb3BzLmVuYWJsZWRFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmdldEVuYWJsZWRFeHByZXNzaW9uKFxuXHRcdFx0b1Byb3BlcnR5Rm9yRmllbGRDb250cm9sLFxuXHRcdFx0b0RhdGFGaWVsZCxcblx0XHRcdGZhbHNlLFxuXHRcdFx0b0RhdGFNb2RlbFBhdGhcblx0XHQpIGFzIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRcdG9Qcm9wcy5yZXF1aXJlZEV4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuZ2V0UmVxdWlyZWRFeHByZXNzaW9uKFxuXHRcdFx0b1Byb3BlcnR5Rm9yRmllbGRDb250cm9sLFxuXHRcdFx0b0RhdGFGaWVsZCxcblx0XHRcdGZhbHNlLFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHRvUmVxdWlyZWRQcm9wZXJ0aWVzLFxuXHRcdFx0b0RhdGFNb2RlbFBhdGhcblx0XHQpIGFzIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdFx0aWYgKG9Qcm9wcy5pZFByZWZpeCkge1xuXHRcdFx0b1Byb3BzLmVkaXRTdHlsZUlkID0gZ2VuZXJhdGUoW29Qcm9wcy5pZFByZWZpeCwgXCJGaWVsZC1lZGl0XCJdKTtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgc2V0VXBGb3JtYXRPcHRpb25zKG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgb0NvbnRyb2xDb25maWd1cmF0aW9uOiBhbnksIG1TZXR0aW5nczogYW55KSB7XG5cdFx0Y29uc3Qgb092ZXJyaWRlUHJvcHMgPSBJbnRlcm5hbEZpZWxkQmxvY2suZ2V0T3ZlcnJpZGVzKG9Db250cm9sQ29uZmlndXJhdGlvbiwgb1Byb3BzLmRhdGFGaWVsZC5nZXRQYXRoKCkpO1xuXG5cdFx0aWYgKCFvUHJvcHMuZm9ybWF0T3B0aW9ucy5kaXNwbGF5TW9kZSkge1xuXHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGUgPSBVSUZvcm1hdHRlcnMuZ2V0RGlzcGxheU1vZGUob0RhdGFNb2RlbFBhdGgpO1xuXHRcdH1cblx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucy50ZXh0TGluZXNFZGl0ID1cblx0XHRcdG9PdmVycmlkZVByb3BzLnRleHRMaW5lc0VkaXQgfHxcblx0XHRcdChvT3ZlcnJpZGVQcm9wcy5mb3JtYXRPcHRpb25zICYmIG9PdmVycmlkZVByb3BzLmZvcm1hdE9wdGlvbnMudGV4dExpbmVzRWRpdCkgfHxcblx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLnRleHRMaW5lc0VkaXQgfHxcblx0XHRcdDQ7XG5cdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMudGV4dE1heExpbmVzID1cblx0XHRcdG9PdmVycmlkZVByb3BzLnRleHRNYXhMaW5lcyB8fFxuXHRcdFx0KG9PdmVycmlkZVByb3BzLmZvcm1hdE9wdGlvbnMgJiYgb092ZXJyaWRlUHJvcHMuZm9ybWF0T3B0aW9ucy50ZXh0TWF4TGluZXMpIHx8XG5cdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucy50ZXh0TWF4TGluZXM7XG5cblx0XHQvLyBSZXRyaWV2ZSB0ZXh0IGZyb20gdmFsdWUgbGlzdCBhcyBmYWxsYmFjayBmZWF0dXJlIGZvciBtaXNzaW5nIHRleHQgYW5ub3RhdGlvbiBvbiB0aGUgcHJvcGVydHlcblx0XHRpZiAobVNldHRpbmdzLm1vZGVscy52aWV3RGF0YT8uZ2V0UHJvcGVydHkoXCIvcmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdFwiKSkge1xuXHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCA9IEZpZWxkVGVtcGxhdGluZy5pc1JldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3RFbmFibGVkKFxuXHRcdFx0XHRvRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QsXG5cdFx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zXG5cdFx0XHQpO1xuXHRcdFx0aWYgKG9Qcm9wcy5mb3JtYXRPcHRpb25zLnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QpIHtcblx0XHRcdFx0Ly8gQ29uc2lkZXIgVGV4dEFycmFuZ2VtZW50IGF0IEVudGl0eVR5cGUgb3RoZXJ3aXNlIHNldCBkZWZhdWx0IGRpc3BsYXkgZm9ybWF0ICdEZXNjcmlwdGlvblZhbHVlJ1xuXHRcdFx0XHRjb25zdCBoYXNFbnRpdHlUZXh0QXJyYW5nZW1lbnQgPSAhIW9EYXRhTW9kZWxQYXRoPy50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudDtcblx0XHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGUgPSBoYXNFbnRpdHlUZXh0QXJyYW5nZW1lbnQgPyBvUHJvcHMuZm9ybWF0T3B0aW9ucy5kaXNwbGF5TW9kZSA6IFwiRGVzY3JpcHRpb25WYWx1ZVwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAob1Byb3BzLmZvcm1hdE9wdGlvbnMuZmllbGRNb2RlID09PSBcIm5vd3JhcHBlclwiICYmIG9Qcm9wcy5lZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIpIHtcblx0XHRcdGlmIChvUHJvcHMuX2ZsZXhJZCkge1xuXHRcdFx0XHRvUHJvcHMubm9XcmFwcGVySWQgPSBvUHJvcHMuX2ZsZXhJZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Qcm9wcy5ub1dyYXBwZXJJZCA9IG9Qcm9wcy5pZFByZWZpeCA/IGdlbmVyYXRlKFtvUHJvcHMuaWRQcmVmaXgsIFwiRmllbGQtY29udGVudFwiXSkgOiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIHNldFVwRGlzcGxheVN0eWxlKG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YUZpZWxkOiBhbnksIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogdm9pZCB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5OiBQcm9wZXJ0eSA9IG9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eTtcblx0XHRpZiAoIW9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCkge1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiVGV4dFwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdG9Qcm9wcy5oYXNVbml0T3JDdXJyZW5jeSA9XG5cdFx0XHRvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5Vbml0ICE9PSB1bmRlZmluZWQgfHwgb1Byb3BlcnR5LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgIT09IHVuZGVmaW5lZDtcblx0XHRvUHJvcHMuaGFzVmFsaWRBbmFseXRpY2FsQ3VycmVuY3lPclVuaXQgPSBVSUZvcm1hdHRlcnMuaGFzVmFsaWRBbmFseXRpY2FsQ3VycmVuY3lPclVuaXQob0RhdGFNb2RlbFBhdGgpO1xuXHRcdG9Qcm9wcy50ZXh0RnJvbVZhbHVlTGlzdCA9IHdyYXBCaW5kaW5nRXhwcmVzc2lvbihcblx0XHRcdGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRmbihcIkZpZWxkUnVudGltZS5yZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0XCIsIFtcblx0XHRcdFx0XHRwYXRoSW5Nb2RlbChnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9EYXRhTW9kZWxQYXRoKSksXG5cdFx0XHRcdFx0YC8ke29Qcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWV9YCxcblx0XHRcdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucy5kaXNwbGF5TW9kZVxuXHRcdFx0XHRdKVxuXHRcdFx0KSBhcyBzdHJpbmcsXG5cdFx0XHRmYWxzZVxuXHRcdCk7XG5cblx0XHRpZiAob1Byb3BlcnR5LnR5cGUgPT09IFwiRWRtLlN0cmVhbVwiKSB7XG5cdFx0XHQvLyBDb21tb25cblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkZpbGVcIjtcblx0XHRcdG9Qcm9wcy5maWxlUmVsYXRpdmVQcm9wZXJ0eVBhdGggPSBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9EYXRhTW9kZWxQYXRoKTtcblx0XHRcdGlmIChvUHJvcGVydHkuYW5ub3RhdGlvbnMuQ29yZT8uQ29udGVudERpc3Bvc2l0aW9uPy5GaWxlbmFtZSkge1xuXHRcdFx0XHRjb25zdCBmaWxlTmFtZURhdGFNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChcblx0XHRcdFx0XHRvRGF0YU1vZGVsUGF0aCxcblx0XHRcdFx0XHRvUHJvcGVydHkuYW5ub3RhdGlvbnMuQ29yZT8uQ29udGVudERpc3Bvc2l0aW9uPy5GaWxlbmFtZSBhcyBQcm9wZXJ0eU9yUGF0aDxQcm9wZXJ0eT5cblx0XHRcdFx0KTtcblx0XHRcdFx0Ly8gVGhpcyBjYXVzZXMgYW4gZXhwcmVzc2lvbiBwYXJzaW5nIGVycm9yOiBjb21waWxlRXhwcmVzc2lvbihwYXRoSW5Nb2RlbChnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGZpbGVOYW1lRGF0YU1vZGVsUGF0aCkpKTtcblx0XHRcdFx0b1Byb3BzLmZpbGVGaWxlbmFtZUV4cHJlc3Npb24gPSBcInsgcGF0aDogJ1wiICsgZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChmaWxlTmFtZURhdGFNb2RlbFBhdGgpICsgXCInIH1cIjtcblx0XHRcdH1cblx0XHRcdG9Qcm9wcy5maWxlU3RyZWFtTm90RW1wdHkgPSBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0bm90KGVxdWFsKHBhdGhJbk1vZGVsKGAke29Qcm9wcy5maWxlUmVsYXRpdmVQcm9wZXJ0eVBhdGh9QG9kYXRhLm1lZGlhQ29udGVudFR5cGVgKSwgbnVsbCkpXG5cdFx0XHQpO1xuXG5cdFx0XHQvLyBGaWxlV3JhcHBlclxuXHRcdFx0b1Byb3BzLmZpbGVVcGxvYWRVcmwgPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VmFsdWVCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCB7fSk7XG5cdFx0XHRvUHJvcHMuZmlsZUZpbGVuYW1lUGF0aCA9IChvUHJvcGVydHkuYW5ub3RhdGlvbnMuQ29yZT8uQ29udGVudERpc3Bvc2l0aW9uPy5GaWxlbmFtZSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248c3RyaW5nPik/LnBhdGg7XG5cdFx0XHRvUHJvcHMuZmlsZU1lZGlhVHlwZSA9XG5cdFx0XHRcdG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db3JlPy5NZWRpYVR5cGUgJiZcblx0XHRcdFx0Y29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db3JlPy5NZWRpYVR5cGUpKTtcblxuXHRcdFx0Ly8gdGVtcGxhdGU6aWZcblx0XHRcdG9Qcm9wcy5maWxlSXNJbWFnZSA9XG5cdFx0XHRcdCEhb1Byb3BlcnR5LmFubm90YXRpb25zLlVJPy5Jc0ltYWdlVVJMIHx8XG5cdFx0XHRcdCEhb1Byb3BlcnR5LmFubm90YXRpb25zLlVJPy5Jc0ltYWdlIHx8XG5cdFx0XHRcdC9pbWFnZVxcLy9pLnRlc3Qob1Byb3BlcnR5LmFubm90YXRpb25zLkNvcmU/Lk1lZGlhVHlwZT8udG9TdHJpbmcoKSA/PyBcIlwiKTtcblxuXHRcdFx0Ly8gQXZhdGFyXG5cdFx0XHRvUHJvcHMuZmlsZUF2YXRhclNyYyA9IEZpZWxkVGVtcGxhdGluZy5nZXRWYWx1ZUJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIHt9KTtcblxuXHRcdFx0Ly8gSWNvblxuXHRcdFx0b1Byb3BzLmZpbGVJY29uU3JjID0gRmllbGRIZWxwZXIuZ2V0UGF0aEZvckljb25Tb3VyY2Uob1Byb3BzLmZpbGVSZWxhdGl2ZVByb3BlcnR5UGF0aCk7XG5cblx0XHRcdC8vIExpbmtcblx0XHRcdG9Qcm9wcy5maWxlTGlua1RleHQgPSBGaWVsZEhlbHBlci5nZXRGaWxlbmFtZUV4cHIoXG5cdFx0XHRcdG9Qcm9wcy5maWxlRmlsZW5hbWVFeHByZXNzaW9uLFxuXHRcdFx0XHRcIntzYXAuZmUuaTE4bj5NX0ZJRUxEX0ZJTEVVUExPQURFUl9OT0ZJTEVOQU1FX1RFWFR9XCJcblx0XHRcdCk7XG5cdFx0XHRvUHJvcHMuZmlsZUxpbmtIcmVmID0gRmllbGRIZWxwZXIuZ2V0RG93bmxvYWRVcmwob1Byb3BzLmZpbGVVcGxvYWRVcmwgPz8gXCJcIik7XG5cblx0XHRcdC8vIFRleHRcblx0XHRcdG9Qcm9wcy5maWxlVGV4dFZpc2libGUgPSBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0ZXF1YWwocGF0aEluTW9kZWwoYCR7b1Byb3BzLmZpbGVSZWxhdGl2ZVByb3BlcnR5UGF0aH1Ab2RhdGEubWVkaWFDb250ZW50VHlwZWApLCBudWxsKVxuXHRcdFx0KTtcblxuXHRcdFx0Ly8gRmlsZVVwbG9hZGVyXG5cdFx0XHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zLkNvcmU/LkFjY2VwdGFibGVNZWRpYVR5cGVzKSB7XG5cdFx0XHRcdGNvbnN0IGFjY2VwdGVkVHlwZXMgPSBBcnJheS5mcm9tKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db3JlLkFjY2VwdGFibGVNZWRpYVR5cGVzIGFzIHVua25vd24gYXMgc3RyaW5nW10pLm1hcChcblx0XHRcdFx0XHQodHlwZSkgPT4gYCcke3R5cGV9J2Bcblx0XHRcdFx0KTtcblx0XHRcdFx0b1Byb3BzLmZpbGVBY2NlcHRhYmxlTWVkaWFUeXBlcyA9IGB7PW9kYXRhLmNvbGxlY3Rpb24oWyR7YWNjZXB0ZWRUeXBlcy5qb2luKFwiLFwiKX1dKX1gOyAvLyBUaGlzIGRvZXMgbm90IGZlZWwgcmlnaHQsIGJ1dCBmb2xsb3dzIHRoZSBsb2dpYyBvZiBBbm5vdGF0aW9uSGVscGVyI3ZhbHVlXG5cdFx0XHR9XG5cdFx0XHRvUHJvcHMuZmlsZU1heGltdW1TaXplID0gRmllbGRIZWxwZXIuY2FsY3VsYXRlTUJmcm9tQnl0ZShvUHJvcGVydHkubWF4TGVuZ3RoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LklzSW1hZ2VVUkwpIHtcblx0XHRcdG9Qcm9wcy5hdmF0YXJWaXNpYmxlID0gRmllbGRUZW1wbGF0aW5nLmdldFZpc2libGVFeHByZXNzaW9uKG9EYXRhTW9kZWxQYXRoKTtcblx0XHRcdG9Qcm9wcy5hdmF0YXJTcmMgPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VmFsdWVCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCB7fSk7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJBdmF0YXJcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRzd2l0Y2ggKG9EYXRhRmllbGQuJFR5cGUpIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZTpcblx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiRGF0YVBvaW50XCI7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbjpcblx0XHRcdFx0aWYgKG9EYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZSkge1xuXHRcdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkRhdGFQb2ludFwiO1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fSBlbHNlIGlmIChvRGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5Db250YWN0VHlwZVwiKSB7XG5cdFx0XHRcdFx0b1Byb3BzLmNvbnRhY3RWaXNpYmxlID0gRmllbGRUZW1wbGF0aW5nLmdldFZpc2libGVFeHByZXNzaW9uKG9EYXRhTW9kZWxQYXRoKTtcblx0XHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJDb250YWN0XCI7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRcdC8vUXVhbG1zOiB0aGUgZ2V0T2JqZWN0IGlzIGEgYmFkIHByYWN0aWNlLCBidXQgZm9yIG5vdyBpdMK0cyBmaW5lIGFzIGFuIGludGVybWVkaWF0ZSBzdGVwIHRvIGF2b2lkIHJlZmFjdG9yaW5nIG9mIHRoZSBoZWxwZXIgaW4gYWRkaXRpb25cblx0XHRcdFx0Y29uc3QgZGF0YUZpZWxkT2JqZWN0ID0gb1Byb3BzLmRhdGFGaWVsZC5nZXRPYmplY3QoKTtcblx0XHRcdFx0b1Byb3BzLmJ1dHRvblByZXNzID0gRmllbGRIZWxwZXIuZ2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEFjdGlvbkJ1dHRvbihvUHJvcHMsIGRhdGFGaWVsZE9iamVjdCk7XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkJ1dHRvblwiO1xuXG5cdFx0XHRcdC8vIEdyYWNlZnVsbHkgaGFuZGxlIG5vbi1leGlzdGluZyBhY3Rpb25zXG5cdFx0XHRcdGlmIChvRGF0YUZpZWxkLkFjdGlvblRhcmdldCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0b1Byb3BzLmJ1dHRvbklzQm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdG9Qcm9wcy5idXR0b25PcGVyYXRpb25BdmFpbGFibGUgPSBcImZhbHNlXCI7XG5cdFx0XHRcdFx0b1Byb3BzLmJ1dHRvbk9wZXJhdGlvbkF2YWlsYWJsZUZvcm1hdHRlZCA9IFwiZmFsc2VcIjtcblx0XHRcdFx0XHRMb2cud2FybmluZyhcblx0XHRcdFx0XHRcdGBXYXJuaW5nOiBUaGUgYWN0aW9uICcke29EYXRhRmllbGQuQWN0aW9ufScgZG9lcyBub3QgZXhpc3QuIFRoZSBjb3JyZXNwb25kaW5nIGFjdGlvbiBidXR0b24gd2lsbCBiZSBkaXNhYmxlZC5gXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvUHJvcHMuYnV0dG9uSXNCb3VuZCA9IG9EYXRhRmllbGQuQWN0aW9uVGFyZ2V0LmlzQm91bmQ7XG5cdFx0XHRcdG9Qcm9wcy5idXR0b25PcGVyYXRpb25BdmFpbGFibGUgPSBvRGF0YUZpZWxkLkFjdGlvblRhcmdldC5hbm5vdGF0aW9ucz8uQ29yZT8uT3BlcmF0aW9uQXZhaWxhYmxlO1xuXHRcdFx0XHRvUHJvcHMuYnV0dG9uT3BlcmF0aW9uQXZhaWxhYmxlRm9ybWF0dGVkID0gdW5kZWZpbmVkO1xuXG5cdFx0XHRcdGlmIChvUHJvcHMuYnV0dG9uT3BlcmF0aW9uQXZhaWxhYmxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgYWN0aW9uVGFyZ2V0ID0gb0RhdGFGaWVsZC5BY3Rpb25UYXJnZXQgYXMgQWN0aW9uO1xuXHRcdFx0XHRcdGNvbnN0IGJpbmRpbmdQYXJhbU5hbWUgPSBhY3Rpb25UYXJnZXQucGFyYW1ldGVyc1swXS5uYW1lO1xuXHRcdFx0XHRcdC8vUVVBTE1TLCBuZWVkcyB0byBiZSBjaGVja2VkIHdoZXRoZXIgdGhpcyBtYWtlcyBzZW5zZSBhdCB0aGF0IHBsYWNlLCBtaWdodCBiZSBnb29kIGluIGEgZGVkaWNhdGVkIGhlbHBlciBmdW5jdGlvblxuXHRcdFx0XHRcdG9Qcm9wcy5idXR0b25PcGVyYXRpb25BdmFpbGFibGVGb3JtYXR0ZWQgPSBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvUHJvcHMuYnV0dG9uT3BlcmF0aW9uQXZhaWxhYmxlLCBbXSwgdW5kZWZpbmVkLCAocGF0aDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChwYXRoLnN0YXJ0c1dpdGgoYmluZGluZ1BhcmFtTmFtZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gcGF0aC5yZXBsYWNlKGJpbmRpbmdQYXJhbU5hbWUgKyBcIi9cIiwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHBhdGg7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRcdG9Qcm9wcy5idXR0b25QcmVzcyA9IENvbW1vbkhlbHBlci5nZXRQcmVzc0hhbmRsZXJGb3JEYXRhRmllbGRGb3JJQk4ob1Byb3BzLmRhdGFGaWVsZC5nZXRPYmplY3QoKSwgdW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuXHRcdFx0XHRJbnRlcm5hbEZpZWxkQmxvY2suc2V0VXBOYXZpZ2F0aW9uQXZhaWxhYmxlKG9Qcm9wcywgb0RhdGFGaWVsZCk7XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkJ1dHRvblwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRcdG9Qcm9wcy50ZXh0ID0gSW50ZXJuYWxGaWVsZEJsb2NrLmdldFRleHRXaXRoV2hpdGVTcGFjZShvUHJvcHMuZm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0XHRvUHJvcHMubGlua0lzRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbiA9IHRydWU7XG5cdFx0XHRcdG9Qcm9wcy5saW5rUHJlc3MgPSBDb21tb25IZWxwZXIuZ2V0UHJlc3NIYW5kbGVyRm9yRGF0YUZpZWxkRm9ySUJOKG9Qcm9wcy5kYXRhRmllbGQuZ2V0T2JqZWN0KCkpO1xuXHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rXCI7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdFx0XHRvUHJvcHMubGlua0lzRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoID0gdHJ1ZTtcblx0XHRcdFx0b1Byb3BzLmxpbmtQcmVzcyA9IGBGaWVsZFJ1bnRpbWUub25EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGgoXFwkeyRzb3VyY2U+L30sICRjb250cm9sbGVyLCAnJHtvRGF0YUZpZWxkLlRhcmdldC52YWx1ZX0nKWA7XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkxpbmtcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0XHRvUHJvcHMubGlua0lzRGF0YUZpZWxkV2l0aEFjdGlvbiA9IHRydWU7XG5cdFx0XHRcdG9Qcm9wcy5saW5rUHJlc3MgPSBGaWVsZEhlbHBlci5nZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkQWN0aW9uQnV0dG9uKG9Qcm9wcywgb1Byb3BzLmRhdGFGaWVsZC5nZXRPYmplY3QoKSk7XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkxpbmtcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBoYXNRdWlja1ZpZXcgPSBGaWVsZFRlbXBsYXRpbmcuaXNVc2VkSW5OYXZpZ2F0aW9uV2l0aFF1aWNrVmlld0ZhY2V0cyhvRGF0YU1vZGVsUGF0aCwgb1Byb3BlcnR5KTtcblx0XHRjb25zdCBoYXNTZW1hbnRpY09iamVjdHMgPVxuXHRcdFx0ISFGaWVsZFRlbXBsYXRpbmcuZ2V0UHJvcGVydHlXaXRoU2VtYW50aWNPYmplY3Qob0RhdGFNb2RlbFBhdGgpIHx8XG5cdFx0XHQob1Byb3BzLnNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQgJiYgb1Byb3BzLnNlbWFudGljT2JqZWN0ICE9PSBcIlwiKTtcblx0XHRpZiAoaXNTZW1hbnRpY0tleShvUHJvcGVydHksIG9EYXRhTW9kZWxQYXRoKSAmJiBvUHJvcHMuZm9ybWF0T3B0aW9ucy5zZW1hbnRpY0tleVN0eWxlKSB7XG5cdFx0XHRvUHJvcHMuaGFzUXVpY2tWaWV3ID0gaGFzUXVpY2tWaWV3IHx8IGhhc1NlbWFudGljT2JqZWN0cztcblx0XHRcdG9Qcm9wcy5oYXNTaXR1YXRpb25zSW5kaWNhdG9yID1cblx0XHRcdFx0U2l0dWF0aW9uc0luZGljYXRvckJsb2NrLmdldFNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHkob0RhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5VHlwZSkgIT09IHVuZGVmaW5lZDtcblx0XHRcdEludGVybmFsRmllbGRCbG9jay5zZXRVcE9iamVjdElkZW50aWZpZXJUaXRsZUFuZFRleHQob1Byb3BzLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChvRGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24/LnRhcmdldEVudGl0eVNldCBhcyBFbnRpdHlTZXQpLmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Um9vdCAmJlxuXHRcdFx0XHQob0RhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Um9vdFxuXHRcdFx0KSB7XG5cdFx0XHRcdG9Qcm9wcy5kcmFmdEluZGljYXRvclZpc2libGUgPSBGaWVsZFRlbXBsYXRpbmcuZ2V0RHJhZnRJbmRpY2F0b3JWaXNpYmxlQmluZGluZyhvRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QubmFtZSkgYXMgc3RyaW5nO1xuXHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJTZW1hbnRpY0tleVdpdGhEcmFmdEluZGljYXRvclwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRvUHJvcHMuc2hvd0Vycm9ySW5kaWNhdG9yID1cblx0XHRcdFx0b0RhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uPy50YXJnZXRPYmplY3QuX3R5cGUgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIgJiZcblx0XHRcdFx0IW9Qcm9wcy5mb3JtYXRPcHRpb25zLmZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aDtcblx0XHRcdG9Qcm9wcy5zaXR1YXRpb25zSW5kaWNhdG9yUHJvcGVydHlQYXRoID0gb0RhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0Lm5hbWU7XG5cblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBvUHJvcHMuZm9ybWF0T3B0aW9ucy5zZW1hbnRpY0tleVN0eWxlID09PSBcIk9iamVjdElkZW50aWZpZXJcIiA/IFwiT2JqZWN0SWRlbnRpZmllclwiIDogXCJMYWJlbFNlbWFudGljS2V5XCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChvRGF0YUZpZWxkLkNyaXRpY2FsaXR5KSB7XG5cdFx0XHRvUHJvcHMuaGFzUXVpY2tWaWV3ID0gaGFzUXVpY2tWaWV3IHx8IGhhc1NlbWFudGljT2JqZWN0cztcblx0XHRcdG9Qcm9wcy5saW5rVXJsID0gb0RhdGFGaWVsZC5VcmwgPyBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0RhdGFGaWVsZC5VcmwpKSA6IHVuZGVmaW5lZDtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIk9iamVjdFN0YXR1c1wiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHRvUHJvcGVydHkuYW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5JU09DdXJyZW5jeSAmJlxuXHRcdFx0U3RyaW5nKG9Qcm9wcy5mb3JtYXRPcHRpb25zLmlzQ3VycmVuY3lBbGlnbmVkKSA9PT0gXCJ0cnVlXCIgJiZcblx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLm1lYXN1cmVEaXNwbGF5TW9kZSAhPT0gXCJIaWRkZW5cIlxuXHRcdCkge1xuXHRcdFx0b1Byb3BzLnZhbHVlQXNTdHJpbmdCaW5kaW5nRXhwcmVzc2lvbiA9IEZpZWxkVGVtcGxhdGluZy5nZXRWYWx1ZUJpbmRpbmcoXG5cdFx0XHRcdG9EYXRhTW9kZWxQYXRoLFxuXHRcdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHR0cnVlXG5cdFx0XHQpO1xuXHRcdFx0b1Byb3BzLnVuaXRCaW5kaW5nRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kob0RhdGFNb2RlbFBhdGgpKTtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkFtb3VudFdpdGhDdXJyZW5jeVwiO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW11bmljYXRpb24/LklzRW1haWxBZGRyZXNzIHx8IG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbXVuaWNhdGlvbj8uSXNQaG9uZU51bWJlcikge1xuXHRcdFx0b1Byb3BzLnRleHQgPSBJbnRlcm5hbEZpZWxkQmxvY2suZ2V0VGV4dFdpdGhXaGl0ZVNwYWNlKG9Qcm9wcy5mb3JtYXRPcHRpb25zLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0XHRvUHJvcHMubGlua0lzRW1haWxBZGRyZXNzID0gb1Byb3BlcnR5LmFubm90YXRpb25zLkNvbW11bmljYXRpb24/LklzRW1haWxBZGRyZXNzICE9PSB1bmRlZmluZWQ7XG5cdFx0XHRvUHJvcHMubGlua0lzUGhvbmVOdW1iZXIgPSBvUHJvcGVydHkuYW5ub3RhdGlvbnMuQ29tbXVuaWNhdGlvbj8uSXNQaG9uZU51bWJlciAhPT0gdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgcHJvcGVydHlWYWx1ZUJpbmRpbmcgPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VmFsdWVCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCB7fSk7XG5cdFx0XHRpZiAob1Byb3BzLmxpbmtJc0VtYWlsQWRkcmVzcykge1xuXHRcdFx0XHRvUHJvcHMubGlua1VybCA9IGBtYWlsdG86JHtwcm9wZXJ0eVZhbHVlQmluZGluZ31gO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9Qcm9wcy5saW5rSXNQaG9uZU51bWJlcikge1xuXHRcdFx0XHRvUHJvcHMubGlua1VybCA9IGB0ZWw6JHtwcm9wZXJ0eVZhbHVlQmluZGluZ31gO1xuXHRcdFx0fVxuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiTGlua1wiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zPy5VST8uTXVsdGlMaW5lVGV4dCkge1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiRXhwYW5kYWJsZVRleHRcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoaGFzUXVpY2tWaWV3IHx8IGhhc1NlbWFudGljT2JqZWN0cykge1xuXHRcdFx0b1Byb3BzLnRleHQgPSBJbnRlcm5hbEZpZWxkQmxvY2suZ2V0VGV4dFdpdGhXaGl0ZVNwYWNlKG9Qcm9wcy5mb3JtYXRPcHRpb25zLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0XHRvUHJvcHMuaGFzUXVpY2tWaWV3ID0gdHJ1ZTtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkxpbmtXaXRoUXVpY2tWaWV3XCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKG9EYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmwpIHtcblx0XHRcdG9Qcm9wcy50ZXh0ID0gSW50ZXJuYWxGaWVsZEJsb2NrLmdldFRleHRXaXRoV2hpdGVTcGFjZShvUHJvcHMuZm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiTGlua1wiO1xuXHRcdFx0b1Byb3BzLmljb25VcmwgPSBvRGF0YUZpZWxkLkljb25VcmwgPyBjb21waWxlRXhwcmVzc2lvbihnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0RhdGFGaWVsZC5JY29uVXJsKSkgOiB1bmRlZmluZWQ7XG5cdFx0XHRvUHJvcHMubGlua1VybCA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRGF0YUZpZWxkLlVybCkpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIlRleHRcIjtcblx0fVxuXG5cdHN0YXRpYyBzZXRVcEVkaXRTdHlsZShcblx0XHRvUHJvcHM6IEZpZWxkUHJvcGVydGllcyxcblx0XHRvRGF0YUZpZWxkOiBhbnksXG5cdFx0b0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0YXBwQ29tcG9uZW50PzogQXBwQ29tcG9uZW50XG5cdCk6IHZvaWQge1xuXHRcdEZpZWxkVGVtcGxhdGluZy5zZXRFZGl0U3R5bGVQcm9wZXJ0aWVzKG9Qcm9wcywgb0RhdGFGaWVsZCwgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdG9Qcm9wcy5maWVsZEdyb3VwSWRzID0gSW50ZXJuYWxGaWVsZEJsb2NrLmNvbXB1dGVGaWVsZEdyb3VwSWRzKG9EYXRhTW9kZWxQYXRoLCBhcHBDb21wb25lbnQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZSB0aGUgZmllbGRHcm91cElkcyBmb3IgYW4gSW5wdXRvciBvdGhlciBlZGl0IGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBkYXRhTW9kZWxPYmplY3RQYXRoXG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnRcblx0ICogQHJldHVybnMgVGhlIHZhbHVlIGZvciBmaWVsZEdyb3VwSWRzXG5cdCAqL1xuXHRzdGF0aWMgY29tcHV0ZUZpZWxkR3JvdXBJZHMoZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgYXBwQ29tcG9uZW50PzogQXBwQ29tcG9uZW50KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoIWFwcENvbXBvbmVudCkge1xuXHRcdFx0Ly9mb3IgVmFsdWVIZWxwIC8gTWFzcyBlZGl0IFRlbXBsYXRpbmcgdGhlIGFwcENvbXBvbmVudCBpcyBub3QgcGFzc2VkIHRvIHRoZSB0ZW1wbGF0aW5nXG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdFx0Y29uc3Qgc2lkZUVmZmVjdFNlcnZpY2UgPSBhcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0Y29uc3QgZmllbGRHcm91cElkcyA9IHNpZGVFZmZlY3RTZXJ2aWNlLmNvbXB1dGVGaWVsZEdyb3VwSWRzKFxuXHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlPy5mdWxseVF1YWxpZmllZE5hbWUgPz8gXCJcIixcblx0XHRcdGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5mdWxseVF1YWxpZmllZE5hbWUgPz8gXCJcIlxuXHRcdCk7XG5cdFx0Y29uc3QgcmVzdWx0ID0gZmllbGRHcm91cElkcy5qb2luKFwiLFwiKTtcblx0XHRyZXR1cm4gcmVzdWx0ID09PSBcIlwiID8gdW5kZWZpbmVkIDogcmVzdWx0O1xuXHR9XG5cblx0c3RhdGljIHNldFVwT2JqZWN0SWRlbnRpZmllclRpdGxlQW5kVGV4dChfb1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRpZiAoX29Qcm9wcy5mb3JtYXRPcHRpb25zPy5zZW1hbnRpY0tleVN0eWxlID09PSBcIk9iamVjdElkZW50aWZpZXJcIikge1xuXHRcdFx0Ly8gaWYgRGVzY3JpcHRpb25WYWx1ZSBpcyBzZXQgYnkgZGVmYXVsdCBhbmQgcHJvcGVydHkgaGFzIGEgcXVpY2tWaWV3LCAgd2Ugc2hvdyBkZXNjcmlwdGlvbiBhbmQgdmFsdWUgaW4gT2JqZWN0SWRlbnRpZmllciBUaXRsZVxuXHRcdFx0Y29uc3QgYWx3YXlzU2hvd0Rlc2NyaXB0aW9uQW5kVmFsdWUgPSBfb1Byb3BzLmhhc1F1aWNrVmlldztcblx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRpdGxlID0gSW50ZXJuYWxGaWVsZEJsb2NrLmdldElkZW50aWZpZXJUaXRsZShcblx0XHRcdFx0X29Qcm9wcy5mb3JtYXRPcHRpb25zLFxuXHRcdFx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdFx0XHRhbHdheXNTaG93RGVzY3JpcHRpb25BbmRWYWx1ZVxuXHRcdFx0KTtcblx0XHRcdGlmICghYWx3YXlzU2hvd0Rlc2NyaXB0aW9uQW5kVmFsdWUpIHtcblx0XHRcdFx0X29Qcm9wcy5pZGVudGlmaWVyVGV4dCA9IEludGVybmFsRmllbGRCbG9jay5nZXRPYmplY3RJZGVudGlmaWVyVGV4dChfb1Byb3BzLmZvcm1hdE9wdGlvbnMsIG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X29Qcm9wcy5pZGVudGlmaWVyVGV4dCA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0X29Qcm9wcy5pZGVudGlmaWVyVGl0bGUgPSBJbnRlcm5hbEZpZWxkQmxvY2suZ2V0SWRlbnRpZmllclRpdGxlKF9vUHJvcHMuZm9ybWF0T3B0aW9ucywgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCwgdHJ1ZSk7XG5cdFx0XHRfb1Byb3BzLmlkZW50aWZpZXJUZXh0ID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyBnZXRUZXh0V2l0aFdoaXRlU3BhY2UoZm9ybWF0T3B0aW9uczogRmllbGRGb3JtYXRPcHRpb25zLCBvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRcdGNvbnN0IHRleHQgPSBGaWVsZFRlbXBsYXRpbmcuZ2V0VGV4dEJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIGZvcm1hdE9wdGlvbnMsIHRydWUpO1xuXHRcdHJldHVybiAodGV4dCBhcyBhbnkpLl90eXBlID09PSBcIlBhdGhJbk1vZGVsXCIgfHwgdHlwZW9mIHRleHQgPT09IFwic3RyaW5nXCJcblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZm9ybWF0UmVzdWx0KFt0ZXh0XSwgXCJXU1JcIikpXG5cdFx0XHQ6IGNvbXBpbGVFeHByZXNzaW9uKHRleHQpO1xuXHR9XG5cblx0c3RhdGljIHNldFVwTmF2aWdhdGlvbkF2YWlsYWJsZShvUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb0RhdGFGaWVsZDogYW55KTogdm9pZCB7XG5cdFx0b1Byb3BzLm5hdmlnYXRpb25BdmFpbGFibGUgPSB0cnVlO1xuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gJiZcblx0XHRcdG9EYXRhRmllbGQuTmF2aWdhdGlvbkF2YWlsYWJsZSAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRTdHJpbmcob1Byb3BzLmZvcm1hdE9wdGlvbnMuaWdub3JlTmF2aWdhdGlvbkF2YWlsYWJsZSkgIT09IFwidHJ1ZVwiXG5cdFx0KSB7XG5cdFx0XHRvUHJvcHMubmF2aWdhdGlvbkF2YWlsYWJsZSA9IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRGF0YUZpZWxkLk5hdmlnYXRpb25BdmFpbGFibGUpKTtcblx0XHR9XG5cdH1cblxuXHRzdGF0aWMgc2V0VXBWYWx1ZVN0YXRlKGZpZWxkUHJvcHM6IEZpZWxkUHJvcGVydGllcywgZGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRcdGxldCB2YWx1ZVN0YXRlRXhwO1xuXHRcdGNvbnN0IGZpZWxkQ29udGFpbmVyVHlwZSA9IGZpZWxkUHJvcHMuZm9ybWF0T3B0aW9ucy50ZXh0QWxpZ25Nb2RlO1xuXG5cdFx0aWYgKGZpZWxkQ29udGFpbmVyVHlwZSA9PT0gXCJUYWJsZVwiKSB7XG5cdFx0XHR2YWx1ZVN0YXRlRXhwID0gZm9ybWF0UmVzdWx0KFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0cGF0aEluTW9kZWwoYC9yZWNvbW1lbmRhdGlvbnNEYXRhYCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdFx0XHRwYXRoSW5Nb2RlbChgL2N1cnJlbnRDdHh0YCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdFx0XHRmaWVsZFByb3BzLmRhdGFTb3VyY2VQYXRoLFxuXHRcdFx0XHRcdGZpZWxkQ29udGFpbmVyVHlwZVxuXHRcdFx0XHRdLFxuXHRcdFx0XHRhZGRpdGlvbmFsVmFsdWVGb3JtYXR0ZXIuZm9ybWF0VmFsdWVTdGF0ZSxcblx0XHRcdFx0ZGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlUeXBlXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YWx1ZVN0YXRlRXhwID0gZm9ybWF0UmVzdWx0KFxuXHRcdFx0XHRbXG5cdFx0XHRcdFx0cGF0aEluTW9kZWwoYC9yZWNvbW1lbmRhdGlvbnNEYXRhYCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdFx0XHRwYXRoSW5Nb2RlbChgL2N1cnJlbnRDdHh0YCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdFx0XHRmaWVsZFByb3BzLmRhdGFTb3VyY2VQYXRoLFxuXHRcdFx0XHRcdGZpZWxkQ29udGFpbmVyVHlwZVxuXHRcdFx0XHRdLFxuXHRcdFx0XHRhZGRpdGlvbmFsVmFsdWVGb3JtYXR0ZXIuZm9ybWF0VmFsdWVTdGF0ZVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRmaWVsZFByb3BzLnZhbHVlU3RhdGUgPSBjb21waWxlRXhwcmVzc2lvbih2YWx1ZVN0YXRlRXhwKTtcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8SW50ZXJuYWxGaWVsZEJsb2NrPiwgY29udHJvbENvbmZpZ3VyYXRpb246IHVua25vd24sIHNldHRpbmdzOiBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXHRcdGNvbnN0IG9EYXRhRmllbGRDb252ZXJ0ZWQ6IERhdGFGaWVsZCA9IE1ldGFNb2RlbENvbnZlcnRlci5jb252ZXJ0TWV0YU1vZGVsQ29udGV4dCh0aGlzLmRhdGFGaWVsZCk7XG5cdFx0bGV0IG9EYXRhTW9kZWxQYXRoID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLmRhdGFGaWVsZCwgdGhpcy5lbnRpdHlTZXQpO1xuXHRcdEludGVybmFsRmllbGRCbG9jay5zZXRVcERhdGFQb2ludFR5cGUob0RhdGFGaWVsZENvbnZlcnRlZCk7XG5cdFx0SW50ZXJuYWxGaWVsZEJsb2NrLnNldFVwVmlzaWJsZVByb3BlcnRpZXModGhpcywgb0RhdGFNb2RlbFBhdGgpO1xuXG5cdFx0aWYgKHRoaXMuX2ZsZXhJZCkge1xuXHRcdFx0dGhpcy5fYXBpSWQgPSB0aGlzLl9mbGV4SWQ7XG5cdFx0XHR0aGlzLl9mbGV4SWQgPSBJbnRlcm5hbEZpZWxkQmxvY2suZ2V0Q29udGVudElkKHRoaXMuX2ZsZXhJZCk7XG5cdFx0XHR0aGlzLl92aEZsZXhJZCA9IGAke3RoaXMuX2ZsZXhJZH1fJHt0aGlzLnZoSWRQcmVmaXh9YDtcblx0XHR9XG5cdFx0Y29uc3QgdmFsdWVEYXRhTW9kZWxQYXRoID0gRmllbGRUZW1wbGF0aW5nLmdldERhdGFNb2RlbE9iamVjdFBhdGhGb3JWYWx1ZShvRGF0YU1vZGVsUGF0aCk7XG5cdFx0b0RhdGFNb2RlbFBhdGggPSB2YWx1ZURhdGFNb2RlbFBhdGggfHwgb0RhdGFNb2RlbFBhdGg7XG5cdFx0dGhpcy5kYXRhU291cmNlUGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgob0RhdGFNb2RlbFBhdGgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBzZXR0aW5ncy5tb2RlbHMubWV0YU1vZGVsIHx8IHNldHRpbmdzLm1vZGVscy5lbnRpdHlTZXQ7XG5cdFx0dGhpcy5lbnRpdHlUeXBlID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgLyR7b0RhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWV9YCk7XG5cblx0XHRJbnRlcm5hbEZpZWxkQmxvY2suc2V0VXBFZGl0YWJsZVByb3BlcnRpZXModGhpcywgb0RhdGFGaWVsZENvbnZlcnRlZCwgb0RhdGFNb2RlbFBhdGgsIG9NZXRhTW9kZWwpO1xuXHRcdEludGVybmFsRmllbGRCbG9jay5zZXRVcEZvcm1hdE9wdGlvbnModGhpcywgb0RhdGFNb2RlbFBhdGgsIGNvbnRyb2xDb25maWd1cmF0aW9uLCBzZXR0aW5ncyk7XG5cdFx0SW50ZXJuYWxGaWVsZEJsb2NrLnNldFVwRGlzcGxheVN0eWxlKHRoaXMsIG9EYXRhRmllbGRDb252ZXJ0ZWQsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHRJbnRlcm5hbEZpZWxkQmxvY2suc2V0VXBFZGl0U3R5bGUodGhpcywgb0RhdGFGaWVsZENvbnZlcnRlZCwgb0RhdGFNb2RlbFBhdGgsIHNldHRpbmdzLmFwcENvbXBvbmVudCk7XG5cdFx0SW50ZXJuYWxGaWVsZEJsb2NrLnNldFVwVmFsdWVTdGF0ZSh0aGlzLCBvRGF0YU1vZGVsUGF0aCk7XG5cblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGNvbXB1dGUgYmluZGluZ3MtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdFx0Y29uc3QgYURpc3BsYXlTdHlsZXNXaXRob3V0UHJvcFRleHQgPSBbXCJBdmF0YXJcIiwgXCJBbW91bnRXaXRoQ3VycmVuY3lcIl07XG5cdFx0aWYgKHRoaXMuZGlzcGxheVN0eWxlICYmIGFEaXNwbGF5U3R5bGVzV2l0aG91dFByb3BUZXh0LmluZGV4T2YodGhpcy5kaXNwbGF5U3R5bGUpID09PSAtMSAmJiBvRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QpIHtcblx0XHRcdHRoaXMudGV4dCA9IHRoaXMudGV4dCA/PyBGaWVsZFRlbXBsYXRpbmcuZ2V0VGV4dEJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIHRoaXMuZm9ybWF0T3B0aW9ucyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMudGV4dCA9IFwiXCI7XG5cdFx0fVxuXG5cdFx0dGhpcy5lbXB0eUluZGljYXRvck1vZGUgPSB0aGlzLmZvcm1hdE9wdGlvbnMuc2hvd0VtcHR5SW5kaWNhdG9yID8gXCJPblwiIDogdW5kZWZpbmVkO1xuXG5cdFx0Ly8gSWYgdGhlIHRhcmdldCBpcyBhIHByb3BlcnR5IHdpdGggYSBEYXRhRmllbGREZWZhdWx0LCB1c2UgdGhpcyBhcyBkYXRhIGZpZWxkXG5cdFx0aWYgKGlzUHJvcGVydHkob0RhdGFGaWVsZENvbnZlcnRlZCkgJiYgb0RhdGFGaWVsZENvbnZlcnRlZC5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5kYXRhRmllbGQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGBAJHtVSUFubm90YXRpb25UZXJtcy5EYXRhRmllbGREZWZhdWx0fWAsIHRoaXMuZGF0YUZpZWxkKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHRlbXBsYXRlIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdHJldHVybiBnZXRGaWVsZFN0cnVjdHVyZVRlbXBsYXRlKHRoaXMpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BbUpxQkEsa0JBQWtCO0VBeEJ2QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWxCQSxPQW1CQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxPQUFPO0lBQ2JDLFNBQVMsRUFBRSx3QkFBd0I7SUFDbkNDLFVBQVUsRUFBRTtFQUNiLENBQUMsQ0FBQyxVQUVBQyxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBR0RELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFHREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQUdERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBTURELGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCQyxRQUFRLEVBQUUsSUFBSTtJQUNkQyxhQUFhLEVB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LGdCQUFnQjtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQWtCTixJQUFJO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BNklDLENBQUMsQ0FBQztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==
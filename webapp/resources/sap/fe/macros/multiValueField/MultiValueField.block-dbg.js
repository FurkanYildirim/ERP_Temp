/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyFormatters", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/valuehelp/ValueHelpTemplating"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, BindingHelper, MetaModelConverter, BindingToolkit, ID, TypeGuards, DataModelPathHelper, PropertyFormatters, UIFormatters, FieldHelper, FieldTemplating, ValueHelpTemplating) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var getVisibleExpression = FieldTemplating.getVisibleExpression;
  var getValueBinding = FieldTemplating.getValueBinding;
  var getDisplayMode = UIFormatters.getDisplayMode;
  var isPathInsertable = DataModelPathHelper.isPathInsertable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var isPropertyPathExpression = TypeGuards.isPropertyPathExpression;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var isMultipleNavigationProperty = TypeGuards.isMultipleNavigationProperty;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MultiValueFieldBlock = (
  /**
   * Building block for creating a MultiValueField based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField annotation is expected
   *
   * Usage example:
   * <pre>
   * <internalMacro:MultiValueField
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
    name: "MultiValueField",
    namespace: "sap.fe.macros.internal"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["com.sap.vocabularies.UI.v1.DataField"]
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "object",
    validate: function (formatOptionsInput) {
      if (formatOptionsInput.displayMode && !["Value", "Description", "ValueDescription", "DescriptionValue"].includes(formatOptionsInput.displayMode)) {
        throw new Error(`Allowed value ${formatOptionsInput.displayMode} for displayMode does not match`);
      }
      return formatOptionsInput;
    }
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(MultiValueFieldBlock, _BuildingBlockBase);
    /**
     * Prefix added to the generated ID of the field
     */
    /**
     * Prefix added to the generated ID of the value help used for the field
     */
    /**
     * Metadata path to the MultiValueField.
     * This property is usually a metadataContext pointing to a DataField having a Value that uses a 1:n navigation
     */
    /**
     * Mandatory context to the MultiValueField
     */
    /**
     * Property added to associate the label with the MultiValueField
     */
    /**
     * The format options
     */
    /**
     * Function to get the correct settings for the multi input.
     *
     * @param propertyDataModelObjectPath The corresponding DataModelObjectPath.
     * @param formatOptions The format options to calculate the result
     * @returns MultiInputSettings
     */
    MultiValueFieldBlock._getMultiInputSettings = function _getMultiInputSettings(propertyDataModelObjectPath, formatOptions) {
      var _propertyDefinition$a;
      const {
        collectionPath,
        itemDataModelObjectPath
      } = MultiValueFieldBlock._getPathStructure(propertyDataModelObjectPath);
      const collectionBindingDisplay = `{path:'${collectionPath}', templateShareable: false}`;
      const collectionBindingEdit = `{path:'${collectionPath}', parameters: {$$ownRequest : true}, templateShareable: false}`;
      const propertyPathOrProperty = propertyDataModelObjectPath.targetObject;
      const propertyDefinition = isPropertyPathExpression(propertyPathOrProperty) ? propertyPathOrProperty.$target : propertyPathOrProperty;
      const commonText = (_propertyDefinition$a = propertyDefinition.annotations.Common) === null || _propertyDefinition$a === void 0 ? void 0 : _propertyDefinition$a.Text;
      const relativeLocation = getRelativePaths(propertyDataModelObjectPath);
      const textExpression = commonText ? compileExpression(getExpressionFromAnnotation(commonText, relativeLocation)) : getValueBinding(itemDataModelObjectPath, formatOptions, true);
      return {
        text: textExpression,
        collectionBindingDisplay: collectionBindingDisplay,
        collectionBindingEdit: collectionBindingEdit,
        key: getValueBinding(itemDataModelObjectPath, formatOptions, true)
      };
    }

    // Process the dataModelPath to find the collection and the relative DataModelPath for the item.
    ;
    MultiValueFieldBlock._getPathStructure = function _getPathStructure(dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2;
      let firstCollectionPath = "";
      const currentEntitySet = (_dataModelObjectPath$ = dataModelObjectPath.contextLocation) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.targetEntitySet ? dataModelObjectPath.contextLocation.targetEntitySet : dataModelObjectPath.startingEntitySet;
      const navigatedPaths = [];
      const contextNavsForItem = ((_dataModelObjectPath$2 = dataModelObjectPath.contextLocation) === null || _dataModelObjectPath$2 === void 0 ? void 0 : _dataModelObjectPath$2.navigationProperties) || [];
      for (const navProp of dataModelObjectPath.navigationProperties) {
        if (dataModelObjectPath.contextLocation === undefined || !dataModelObjectPath.contextLocation.navigationProperties.some(contextNavProp => contextNavProp.fullyQualifiedName === navProp.fullyQualifiedName)) {
          // in case of relative entitySetPath we don't consider navigationPath that are already in the context
          navigatedPaths.push(navProp.name);
          contextNavsForItem.push(navProp);
        }
        if (currentEntitySet.navigationPropertyBinding.hasOwnProperty(navProp.name)) {
          if (isMultipleNavigationProperty(navProp)) {
            break;
          }
        }
      }
      firstCollectionPath = `${navigatedPaths.join("/")}`;
      const itemDataModelObjectPath = Object.assign({}, dataModelObjectPath);
      if (itemDataModelObjectPath.contextLocation) {
        itemDataModelObjectPath.contextLocation.navigationProperties = contextNavsForItem;
      }
      return {
        collectionPath: firstCollectionPath,
        itemDataModelObjectPath: itemDataModelObjectPath
      };
    }

    /**
     * Calculate the fieldGroupIds for the MultiValueField.
     *
     * @param dataModelObjectPath
     * @param appComponent
     * @returns The value for the fieldGroupIds
     */;
    MultiValueFieldBlock.computeFieldGroupIds = function computeFieldGroupIds(dataModelObjectPath, appComponent) {
      if (!appComponent) {
        //for ValueHelp / Mass edit Templating the appComponent is not passed to the templating
        return "";
      }
      const sideEffectService = appComponent.getSideEffectsService();
      const fieldGroupIds = sideEffectService.computeFieldGroupIds(dataModelObjectPath.targetEntityType.fullyQualifiedName, dataModelObjectPath.targetObject.fullyQualifiedName);
      const result = fieldGroupIds.join(",");
      return result === "" ? undefined : result;
    };
    function MultiValueFieldBlock(props, controlConfiguration, settings) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "idPrefix", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vhIdPrefix", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "key", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor7, _assertThisInitialized(_this));
      let dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      const dataFieldConverted = MetaModelConverter.convertMetaModelContext(_this.metaPath);
      let extraPath;
      if (isPathAnnotationExpression(dataFieldConverted.Value)) {
        extraPath = dataFieldConverted.Value.path;
      }
      _this.visible = getVisibleExpression(dataModelPath, _this.formatOptions);
      if (extraPath && extraPath.length > 0) {
        dataModelPath = enhanceDataModelPath(dataModelPath, extraPath);
      }
      const insertable = isPathInsertable(dataModelPath);
      const deleteNavigationRestriction = isPathDeletable(dataModelPath, {
        ignoreTargetCollection: true,
        authorizeUnresolvable: true
      });
      const deletePath = isPathDeletable(dataModelPath);
      // deletable:
      //		if restrictions come from Navigation we apply it
      //		otherwise we apply restrictions defined on target collection only if it's a constant
      //      otherwise it's true!
      const deletable = ifElse(deleteNavigationRestriction._type === "Unresolvable", or(not(isConstant(deletePath)), deletePath), deletePath);
      _this.editMode = _this.formatOptions.displayOnly === "true" ? "Display" : compileExpression(ifElse(and(insertable, deletable, UI.IsEditable), constant("Editable"), constant("Display")));
      _this.displayMode = getDisplayMode(dataModelPath);
      const multiInputSettings = MultiValueFieldBlock._getMultiInputSettings(dataModelPath, _this.formatOptions);
      _this.text = multiInputSettings.text;
      _this.collection = _this.editMode === "Display" ? multiInputSettings.collectionBindingDisplay : multiInputSettings.collectionBindingEdit;
      _this.key = multiInputSettings.key;
      _this.fieldGroupIds = MultiValueFieldBlock.computeFieldGroupIds(dataModelPath, settings.appComponent);
      return _this;
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */
    _exports = MultiValueFieldBlock;
    var _proto = MultiValueFieldBlock.prototype;
    _proto.getTemplate = function getTemplate() {
      //prepare settings for further processing
      const internalDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(this.metaPath, this.contextPath);
      const internalDataFieldConverted = internalDataModelPath.targetObject;
      const enhancedDataModelPath = enhanceDataModelPath(internalDataModelPath, internalDataFieldConverted.Value.path); // PathAnnotationExpression was checked in the templating
      //calculate the id settings for this block
      const id = this.idPrefix ? ID.generate([this.idPrefix, "MultiValueField"]) : undefined;
      //create a new binding context for the value help
      const valueHelpProperty = FieldHelper.valueHelpProperty(this.metaPath);
      const valueHelpPropertyContext = this.metaPath.getModel().createBindingContext(valueHelpProperty, this.metaPath);
      //calculate fieldHelp
      const fieldHelp = ValueHelpTemplating.generateID(undefined, this.vhIdPrefix, PropertyFormatters.getRelativePropertyPath(valueHelpPropertyContext, {
        context: this.contextPath
      }), getContextRelativeTargetObjectPath(enhancedDataModelPath) ?? "");
      //compute the correct label
      const label = FieldHelper.computeLabelText(internalDataFieldConverted.Value, {
        context: this.metaPath
      });
      const change = `MVFieldRuntime.handleChange($controller, $event)`;
      const validateFieldGroup = `MVFieldRuntime.onValidateFieldGroup($controller, $event)`;
      return xml`
		<mdc:MultiValueField
				xmlns:mdc="sap.ui.mdc"
				core:require="{MVFieldRuntime:'sap/fe/macros/multiValueField/MultiValueFieldRuntime'}"
				delegate="{name: 'sap/fe/macros/multiValueField/MultiValueFieldDelegate'}"
				id="${id}"
				items="${this.collection}"
				display="${this.displayMode}"
				width="100%"
				editMode="${this.editMode}"
				fieldHelp="${fieldHelp}"
				ariaLabelledBy = "${this.ariaLabelledBy}"
				showEmptyIndicator = "${this.formatOptions.showEmptyIndicator}"
				label = "${label}"
				change="${change}"
				fieldGroupIds="${this.fieldGroupIds}"
				validateFieldGroup="${validateFieldGroup}"
		>
		<mdcField:MultiValueFieldItem xmlns:mdcField="sap.ui.mdc.field" key="${this.key}" description="${this.text}" />
		</mdc:MultiValueField>`;
    };
    return MultiValueFieldBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "vhIdPrefix", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "FieldValueHelp";
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "key", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  })), _class2)) || _class);
  _exports = MultiValueFieldBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNdWx0aVZhbHVlRmllbGRCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwidmFsaWRhdGUiLCJmb3JtYXRPcHRpb25zSW5wdXQiLCJkaXNwbGF5TW9kZSIsImluY2x1ZGVzIiwiRXJyb3IiLCJfZ2V0TXVsdGlJbnB1dFNldHRpbmdzIiwicHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoIiwiZm9ybWF0T3B0aW9ucyIsImNvbGxlY3Rpb25QYXRoIiwiaXRlbURhdGFNb2RlbE9iamVjdFBhdGgiLCJfZ2V0UGF0aFN0cnVjdHVyZSIsImNvbGxlY3Rpb25CaW5kaW5nRGlzcGxheSIsImNvbGxlY3Rpb25CaW5kaW5nRWRpdCIsInByb3BlcnR5UGF0aE9yUHJvcGVydHkiLCJ0YXJnZXRPYmplY3QiLCJwcm9wZXJ0eURlZmluaXRpb24iLCJpc1Byb3BlcnR5UGF0aEV4cHJlc3Npb24iLCIkdGFyZ2V0IiwiY29tbW9uVGV4dCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsInJlbGF0aXZlTG9jYXRpb24iLCJnZXRSZWxhdGl2ZVBhdGhzIiwidGV4dEV4cHJlc3Npb24iLCJjb21waWxlRXhwcmVzc2lvbiIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsImdldFZhbHVlQmluZGluZyIsInRleHQiLCJrZXkiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwiZmlyc3RDb2xsZWN0aW9uUGF0aCIsImN1cnJlbnRFbnRpdHlTZXQiLCJjb250ZXh0TG9jYXRpb24iLCJ0YXJnZXRFbnRpdHlTZXQiLCJzdGFydGluZ0VudGl0eVNldCIsIm5hdmlnYXRlZFBhdGhzIiwiY29udGV4dE5hdnNGb3JJdGVtIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJuYXZQcm9wIiwidW5kZWZpbmVkIiwic29tZSIsImNvbnRleHROYXZQcm9wIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwicHVzaCIsIm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJoYXNPd25Qcm9wZXJ0eSIsImlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkiLCJqb2luIiwiT2JqZWN0IiwiYXNzaWduIiwiY29tcHV0ZUZpZWxkR3JvdXBJZHMiLCJhcHBDb21wb25lbnQiLCJzaWRlRWZmZWN0U2VydmljZSIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsImZpZWxkR3JvdXBJZHMiLCJ0YXJnZXRFbnRpdHlUeXBlIiwicmVzdWx0IiwicHJvcHMiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsInNldHRpbmdzIiwiZGF0YU1vZGVsUGF0aCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm1ldGFQYXRoIiwiY29udGV4dFBhdGgiLCJkYXRhRmllbGRDb252ZXJ0ZWQiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsImV4dHJhUGF0aCIsImlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uIiwiVmFsdWUiLCJwYXRoIiwidmlzaWJsZSIsImdldFZpc2libGVFeHByZXNzaW9uIiwibGVuZ3RoIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJpbnNlcnRhYmxlIiwiaXNQYXRoSW5zZXJ0YWJsZSIsImRlbGV0ZU5hdmlnYXRpb25SZXN0cmljdGlvbiIsImlzUGF0aERlbGV0YWJsZSIsImlnbm9yZVRhcmdldENvbGxlY3Rpb24iLCJhdXRob3JpemVVbnJlc29sdmFibGUiLCJkZWxldGVQYXRoIiwiZGVsZXRhYmxlIiwiaWZFbHNlIiwiX3R5cGUiLCJvciIsIm5vdCIsImlzQ29uc3RhbnQiLCJlZGl0TW9kZSIsImRpc3BsYXlPbmx5IiwiYW5kIiwiVUkiLCJJc0VkaXRhYmxlIiwiY29uc3RhbnQiLCJnZXREaXNwbGF5TW9kZSIsIm11bHRpSW5wdXRTZXR0aW5ncyIsImNvbGxlY3Rpb24iLCJnZXRUZW1wbGF0ZSIsImludGVybmFsRGF0YU1vZGVsUGF0aCIsImludGVybmFsRGF0YUZpZWxkQ29udmVydGVkIiwiZW5oYW5jZWREYXRhTW9kZWxQYXRoIiwiaWQiLCJpZFByZWZpeCIsIklEIiwiZ2VuZXJhdGUiLCJ2YWx1ZUhlbHBQcm9wZXJ0eSIsIkZpZWxkSGVscGVyIiwidmFsdWVIZWxwUHJvcGVydHlDb250ZXh0IiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImZpZWxkSGVscCIsIlZhbHVlSGVscFRlbXBsYXRpbmciLCJnZW5lcmF0ZUlEIiwidmhJZFByZWZpeCIsIlByb3BlcnR5Rm9ybWF0dGVycyIsImdldFJlbGF0aXZlUHJvcGVydHlQYXRoIiwiY29udGV4dCIsImdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJsYWJlbCIsImNvbXB1dGVMYWJlbFRleHQiLCJjaGFuZ2UiLCJ2YWxpZGF0ZUZpZWxkR3JvdXAiLCJ4bWwiLCJhcmlhTGFiZWxsZWRCeSIsInNob3dFbXB0eUluZGljYXRvciIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNdWx0aVZhbHVlRmllbGQuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eSwgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgUGF0aEFubm90YXRpb25FeHByZXNzaW9uLCBQcm9wZXJ0eVBhdGggfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvRWRtXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFGaWVsZCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgeyBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLFxuXHRpZkVsc2UsXG5cdGlzQ29uc3RhbnQsXG5cdG5vdCxcblx0b3Jcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgKiBhcyBJRCBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgaXNNdWx0aXBsZU5hdmlnYXRpb25Qcm9wZXJ0eSwgaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24sIGlzUHJvcGVydHlQYXRoRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGVuaGFuY2VEYXRhTW9kZWxQYXRoLFxuXHRnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoLFxuXHRnZXRSZWxhdGl2ZVBhdGhzLFxuXHRpc1BhdGhEZWxldGFibGUsXG5cdGlzUGF0aEluc2VydGFibGVcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0ICogYXMgUHJvcGVydHlGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5Rm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBEaXNwbGF5TW9kZSwgTWV0YU1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBGaWVsZEhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0VmFsdWVCaW5kaW5nLCBnZXRWaXNpYmxlRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0ICogYXMgVmFsdWVIZWxwVGVtcGxhdGluZyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVIZWxwVGVtcGxhdGluZ1wiO1xuaW1wb3J0IHR5cGUgRWRpdE1vZGUgZnJvbSBcInNhcC91aS9tZGMvZW51bS9FZGl0TW9kZVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxudHlwZSBNdWx0aUlucHV0U2V0dGluZ3MgPSB7XG5cdHRleHQ6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGNvbGxlY3Rpb25CaW5kaW5nRGlzcGxheTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGNvbGxlY3Rpb25CaW5kaW5nRWRpdDogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGtleTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcbn07XG5cbnR5cGUgTXVsdGlWYWx1ZUZpZWxkRm9ybWF0T3B0aW9ucyA9IFBhcnRpYWw8e1xuXHRzaG93RW1wdHlJbmRpY2F0b3I/OiBib29sZWFuO1xuXHRkaXNwbGF5T25seT86IGJvb2xlYW4gfCBzdHJpbmc7XG5cdGRpc3BsYXlNb2RlPzogc3RyaW5nO1xuXHRtZWFzdXJlRGlzcGxheU1vZGU/OiBzdHJpbmc7XG5cdGlzQW5hbHl0aWNzPzogYm9vbGVhbjtcbn0+O1xuXG50eXBlIE11bHRpVmFsdWVGaWVsZFBhdGhTdHJ1Y3R1cmUgPSB7XG5cdGNvbGxlY3Rpb25QYXRoOiBzdHJpbmc7XG5cdGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoO1xufTtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBNdWx0aVZhbHVlRmllbGQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogVXN1YWxseSwgYSBEYXRhRmllbGQgYW5ub3RhdGlvbiBpcyBleHBlY3RlZFxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogPGludGVybmFsTWFjcm86TXVsdGlWYWx1ZUZpZWxkXG4gKiAgIGlkUHJlZml4PVwiU29tZVByZWZpeFwiXG4gKiAgIGNvbnRleHRQYXRoPVwie2VudGl0eVNldD59XCJcbiAqICAgbWV0YVBhdGg9XCJ7ZGF0YUZpZWxkPn1cIlxuICogLz5cbiAqIDwvcHJlPlxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKiBAc2luY2UgMS45NC4wXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJNdWx0aVZhbHVlRmllbGRcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE11bHRpVmFsdWVGaWVsZEJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogUHJlZml4IGFkZGVkIHRvIHRoZSBnZW5lcmF0ZWQgSUQgb2YgdGhlIGZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIGlkUHJlZml4Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBQcmVmaXggYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgdmFsdWUgaGVscCB1c2VkIGZvciB0aGUgZmllbGRcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwdWJsaWMgdmhJZFByZWZpeCA9IFwiRmllbGRWYWx1ZUhlbHBcIjtcblxuXHQvKipcblx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgTXVsdGlWYWx1ZUZpZWxkLlxuXHQgKiBUaGlzIHByb3BlcnR5IGlzIHVzdWFsbHkgYSBtZXRhZGF0YUNvbnRleHQgcG9pbnRpbmcgdG8gYSBEYXRhRmllbGQgaGF2aW5nIGEgVmFsdWUgdGhhdCB1c2VzIGEgMTpuIG5hdmlnYXRpb25cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiXVxuXHR9KVxuXHRwdWJsaWMgbWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBNYW5kYXRvcnkgY29udGV4dCB0byB0aGUgTXVsdGlWYWx1ZUZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCJdXG5cdH0pXG5cdHB1YmxpYyBjb250ZXh0UGF0aCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IGFkZGVkIHRvIGFzc29jaWF0ZSB0aGUgbGFiZWwgd2l0aCB0aGUgTXVsdGlWYWx1ZUZpZWxkXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cHVibGljIGFyaWFMYWJlbGxlZEJ5Pzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRwcml2YXRlIGtleT86IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0cHJpdmF0ZSB0ZXh0PzogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHQvKipcblx0ICogRWRpdCBNb2RlIG9mIHRoZSBmaWVsZC5cblx0ICogSWYgdGhlIGVkaXRNb2RlIGlzIHVuZGVmaW5lZCB0aGVuIHdlIGNvbXB1dGUgaXQgYmFzZWQgb24gdGhlIG1ldGFkYXRhXG5cdCAqIE90aGVyd2lzZSB3ZSB1c2UgdGhlIHZhbHVlIHByb3ZpZGVkIGhlcmUuXG5cdCAqL1xuXHRwcml2YXRlIGVkaXRNb2RlITogRWRpdE1vZGUgfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblxuXHQvKipcblx0ICogVGhlIGRpc3BsYXkgbW9kZSBhZGRlZCB0byB0aGUgY29sbGVjdGlvbiBmaWVsZFxuXHQgKi9cblx0cHJpdmF0ZSBkaXNwbGF5TW9kZSE6IERpc3BsYXlNb2RlO1xuXG5cdC8qKlxuXHQgKiBUaGUgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gdGhhdCBpcyBjYWxjdWxhdGVkIGludGVybmFsbHlcblx0ICovXG5cdHByaXZhdGUgY29sbGVjdGlvbiE6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdC8qKlxuXHQgKiBUaGUgZm9ybWF0IG9wdGlvbnNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJvYmplY3RcIixcblx0XHR2YWxpZGF0ZTogZnVuY3Rpb24gKGZvcm1hdE9wdGlvbnNJbnB1dDogTXVsdGlWYWx1ZUZpZWxkRm9ybWF0T3B0aW9ucykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRmb3JtYXRPcHRpb25zSW5wdXQuZGlzcGxheU1vZGUgJiZcblx0XHRcdFx0IVtcIlZhbHVlXCIsIFwiRGVzY3JpcHRpb25cIiwgXCJWYWx1ZURlc2NyaXB0aW9uXCIsIFwiRGVzY3JpcHRpb25WYWx1ZVwiXS5pbmNsdWRlcyhmb3JtYXRPcHRpb25zSW5wdXQuZGlzcGxheU1vZGUpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBBbGxvd2VkIHZhbHVlICR7Zm9ybWF0T3B0aW9uc0lucHV0LmRpc3BsYXlNb2RlfSBmb3IgZGlzcGxheU1vZGUgZG9lcyBub3QgbWF0Y2hgKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmb3JtYXRPcHRpb25zSW5wdXQ7XG5cdFx0fVxuXHR9KVxuXHRwdWJsaWMgZm9ybWF0T3B0aW9uczogTXVsdGlWYWx1ZUZpZWxkRm9ybWF0T3B0aW9ucyA9IHt9O1xuXG5cdHByaXZhdGUgdmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0cHJpdmF0ZSBmaWVsZEdyb3VwSWRzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBGdW5jdGlvbiB0byBnZXQgdGhlIGNvcnJlY3Qgc2V0dGluZ3MgZm9yIHRoZSBtdWx0aSBpbnB1dC5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCBUaGUgY29ycmVzcG9uZGluZyBEYXRhTW9kZWxPYmplY3RQYXRoLlxuXHQgKiBAcGFyYW0gZm9ybWF0T3B0aW9ucyBUaGUgZm9ybWF0IG9wdGlvbnMgdG8gY2FsY3VsYXRlIHRoZSByZXN1bHRcblx0ICogQHJldHVybnMgTXVsdGlJbnB1dFNldHRpbmdzXG5cdCAqL1xuXHRwcml2YXRlIHN0YXRpYyBfZ2V0TXVsdGlJbnB1dFNldHRpbmdzKFxuXHRcdHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRmb3JtYXRPcHRpb25zOiBNdWx0aVZhbHVlRmllbGRGb3JtYXRPcHRpb25zXG5cdCk6IE11bHRpSW5wdXRTZXR0aW5ncyB7XG5cdFx0Y29uc3QgeyBjb2xsZWN0aW9uUGF0aCwgaXRlbURhdGFNb2RlbE9iamVjdFBhdGggfSA9IE11bHRpVmFsdWVGaWVsZEJsb2NrLl9nZXRQYXRoU3RydWN0dXJlKHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0Y29uc3QgY29sbGVjdGlvbkJpbmRpbmdEaXNwbGF5ID0gYHtwYXRoOicke2NvbGxlY3Rpb25QYXRofScsIHRlbXBsYXRlU2hhcmVhYmxlOiBmYWxzZX1gO1xuXHRcdGNvbnN0IGNvbGxlY3Rpb25CaW5kaW5nRWRpdCA9IGB7cGF0aDonJHtjb2xsZWN0aW9uUGF0aH0nLCBwYXJhbWV0ZXJzOiB7JCRvd25SZXF1ZXN0IDogdHJ1ZX0sIHRlbXBsYXRlU2hhcmVhYmxlOiBmYWxzZX1gO1xuXG5cdFx0Y29uc3QgcHJvcGVydHlQYXRoT3JQcm9wZXJ0eSA9IHByb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHlQYXRoIHwgUHJvcGVydHk7XG5cdFx0Y29uc3QgcHJvcGVydHlEZWZpbml0aW9uOiBQcm9wZXJ0eSA9IGlzUHJvcGVydHlQYXRoRXhwcmVzc2lvbihwcm9wZXJ0eVBhdGhPclByb3BlcnR5KVxuXHRcdFx0PyBwcm9wZXJ0eVBhdGhPclByb3BlcnR5LiR0YXJnZXRcblx0XHRcdDogcHJvcGVydHlQYXRoT3JQcm9wZXJ0eTtcblx0XHRjb25zdCBjb21tb25UZXh0ID0gcHJvcGVydHlEZWZpbml0aW9uLmFubm90YXRpb25zLkNvbW1vbj8uVGV4dDtcblx0XHRjb25zdCByZWxhdGl2ZUxvY2F0aW9uID0gZ2V0UmVsYXRpdmVQYXRocyhwcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpO1xuXG5cdFx0Y29uc3QgdGV4dEV4cHJlc3Npb24gPSBjb21tb25UZXh0XG5cdFx0XHQ/IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdGNvbW1vblRleHQgYXMgdW5rbm93biBhcyBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxQcm9wZXJ0eT4sXG5cdFx0XHRcdFx0XHRyZWxhdGl2ZUxvY2F0aW9uXG5cdFx0XHRcdFx0KSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPlxuXHRcdFx0ICApXG5cdFx0XHQ6IGdldFZhbHVlQmluZGluZyhpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aCwgZm9ybWF0T3B0aW9ucywgdHJ1ZSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRleHQ6IHRleHRFeHByZXNzaW9uLFxuXHRcdFx0Y29sbGVjdGlvbkJpbmRpbmdEaXNwbGF5OiBjb2xsZWN0aW9uQmluZGluZ0Rpc3BsYXksXG5cdFx0XHRjb2xsZWN0aW9uQmluZGluZ0VkaXQ6IGNvbGxlY3Rpb25CaW5kaW5nRWRpdCxcblx0XHRcdGtleTogZ2V0VmFsdWVCaW5kaW5nKGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoLCBmb3JtYXRPcHRpb25zLCB0cnVlKVxuXHRcdH07XG5cdH1cblxuXHQvLyBQcm9jZXNzIHRoZSBkYXRhTW9kZWxQYXRoIHRvIGZpbmQgdGhlIGNvbGxlY3Rpb24gYW5kIHRoZSByZWxhdGl2ZSBEYXRhTW9kZWxQYXRoIGZvciB0aGUgaXRlbS5cblx0cHJpdmF0ZSBzdGF0aWMgX2dldFBhdGhTdHJ1Y3R1cmUoZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IE11bHRpVmFsdWVGaWVsZFBhdGhTdHJ1Y3R1cmUge1xuXHRcdGxldCBmaXJzdENvbGxlY3Rpb25QYXRoID0gXCJcIjtcblx0XHRjb25zdCBjdXJyZW50RW50aXR5U2V0ID0gZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24/LnRhcmdldEVudGl0eVNldFxuXHRcdFx0PyBkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbi50YXJnZXRFbnRpdHlTZXRcblx0XHRcdDogZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldDtcblx0XHRjb25zdCBuYXZpZ2F0ZWRQYXRoczogc3RyaW5nW10gPSBbXTtcblx0XHRjb25zdCBjb250ZXh0TmF2c0Zvckl0ZW0gPSBkYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbj8ubmF2aWdhdGlvblByb3BlcnRpZXMgfHwgW107XG5cdFx0Zm9yIChjb25zdCBuYXZQcm9wIG9mIGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24gPT09IHVuZGVmaW5lZCB8fFxuXHRcdFx0XHQhZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24ubmF2aWdhdGlvblByb3BlcnRpZXMuc29tZShcblx0XHRcdFx0XHQoY29udGV4dE5hdlByb3ApID0+IGNvbnRleHROYXZQcm9wLmZ1bGx5UXVhbGlmaWVkTmFtZSA9PT0gbmF2UHJvcC5mdWxseVF1YWxpZmllZE5hbWVcblx0XHRcdFx0KVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIGluIGNhc2Ugb2YgcmVsYXRpdmUgZW50aXR5U2V0UGF0aCB3ZSBkb24ndCBjb25zaWRlciBuYXZpZ2F0aW9uUGF0aCB0aGF0IGFyZSBhbHJlYWR5IGluIHRoZSBjb250ZXh0XG5cdFx0XHRcdG5hdmlnYXRlZFBhdGhzLnB1c2gobmF2UHJvcC5uYW1lKTtcblx0XHRcdFx0Y29udGV4dE5hdnNGb3JJdGVtLnB1c2gobmF2UHJvcCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY3VycmVudEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nLmhhc093blByb3BlcnR5KG5hdlByb3AubmFtZSkpIHtcblx0XHRcdFx0aWYgKGlzTXVsdGlwbGVOYXZpZ2F0aW9uUHJvcGVydHkobmF2UHJvcCkpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRmaXJzdENvbGxlY3Rpb25QYXRoID0gYCR7bmF2aWdhdGVkUGF0aHMuam9pbihcIi9cIil9YDtcblx0XHRjb25zdCBpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aCA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHRcdGlmIChpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24pIHtcblx0XHRcdGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbi5uYXZpZ2F0aW9uUHJvcGVydGllcyA9IGNvbnRleHROYXZzRm9ySXRlbTtcblx0XHR9XG5cblx0XHRyZXR1cm4geyBjb2xsZWN0aW9uUGF0aDogZmlyc3RDb2xsZWN0aW9uUGF0aCwgaXRlbURhdGFNb2RlbE9iamVjdFBhdGg6IGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoIH07XG5cdH1cblxuXHQvKipcblx0ICogQ2FsY3VsYXRlIHRoZSBmaWVsZEdyb3VwSWRzIGZvciB0aGUgTXVsdGlWYWx1ZUZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50XG5cdCAqIEByZXR1cm5zIFRoZSB2YWx1ZSBmb3IgdGhlIGZpZWxkR3JvdXBJZHNcblx0ICovXG5cdHN0YXRpYyBjb21wdXRlRmllbGRHcm91cElkcyhkYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLCBhcHBDb21wb25lbnQ/OiBBcHBDb21wb25lbnQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGlmICghYXBwQ29tcG9uZW50KSB7XG5cdFx0XHQvL2ZvciBWYWx1ZUhlbHAgLyBNYXNzIGVkaXQgVGVtcGxhdGluZyB0aGUgYXBwQ29tcG9uZW50IGlzIG5vdCBwYXNzZWQgdG8gdGhlIHRlbXBsYXRpbmdcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0XHRjb25zdCBzaWRlRWZmZWN0U2VydmljZSA9IGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0XHRjb25zdCBmaWVsZEdyb3VwSWRzID0gc2lkZUVmZmVjdFNlcnZpY2UuY29tcHV0ZUZpZWxkR3JvdXBJZHMoXG5cdFx0XHRkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0KGRhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5KS5mdWxseVF1YWxpZmllZE5hbWVcblx0XHQpO1xuXHRcdGNvbnN0IHJlc3VsdCA9IGZpZWxkR3JvdXBJZHMuam9pbihcIixcIik7XG5cdFx0cmV0dXJuIHJlc3VsdCA9PT0gXCJcIiA/IHVuZGVmaW5lZCA6IHJlc3VsdDtcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8TXVsdGlWYWx1ZUZpZWxkQmxvY2s+LCBjb250cm9sQ29uZmlndXJhdGlvbjogdW5rbm93biwgc2V0dGluZ3M6IFRlbXBsYXRlUHJvY2Vzc29yU2V0dGluZ3MpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdFx0bGV0IGRhdGFNb2RlbFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMubWV0YVBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IGRhdGFGaWVsZENvbnZlcnRlZCA9IE1ldGFNb2RlbENvbnZlcnRlci5jb252ZXJ0TWV0YU1vZGVsQ29udGV4dCh0aGlzLm1ldGFQYXRoKSBhcyBEYXRhRmllbGQ7XG5cdFx0bGV0IGV4dHJhUGF0aDtcblx0XHRpZiAoaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24oZGF0YUZpZWxkQ29udmVydGVkLlZhbHVlKSkge1xuXHRcdFx0ZXh0cmFQYXRoID0gZGF0YUZpZWxkQ29udmVydGVkLlZhbHVlLnBhdGg7XG5cdFx0fVxuXG5cdFx0dGhpcy52aXNpYmxlID0gZ2V0VmlzaWJsZUV4cHJlc3Npb24oZGF0YU1vZGVsUGF0aCwgdGhpcy5mb3JtYXRPcHRpb25zKTtcblx0XHRpZiAoZXh0cmFQYXRoICYmIGV4dHJhUGF0aC5sZW5ndGggPiAwKSB7XG5cdFx0XHRkYXRhTW9kZWxQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZGF0YU1vZGVsUGF0aCwgZXh0cmFQYXRoKTtcblx0XHR9XG5cdFx0Y29uc3QgaW5zZXJ0YWJsZSA9IGlzUGF0aEluc2VydGFibGUoZGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3QgZGVsZXRlTmF2aWdhdGlvblJlc3RyaWN0aW9uID0gaXNQYXRoRGVsZXRhYmxlKGRhdGFNb2RlbFBhdGgsIHtcblx0XHRcdGlnbm9yZVRhcmdldENvbGxlY3Rpb246IHRydWUsXG5cdFx0XHRhdXRob3JpemVVbnJlc29sdmFibGU6IHRydWVcblx0XHR9KTtcblx0XHRjb25zdCBkZWxldGVQYXRoID0gaXNQYXRoRGVsZXRhYmxlKGRhdGFNb2RlbFBhdGgpO1xuXHRcdC8vIGRlbGV0YWJsZTpcblx0XHQvL1x0XHRpZiByZXN0cmljdGlvbnMgY29tZSBmcm9tIE5hdmlnYXRpb24gd2UgYXBwbHkgaXRcblx0XHQvL1x0XHRvdGhlcndpc2Ugd2UgYXBwbHkgcmVzdHJpY3Rpb25zIGRlZmluZWQgb24gdGFyZ2V0IGNvbGxlY3Rpb24gb25seSBpZiBpdCdzIGEgY29uc3RhbnRcblx0XHQvLyAgICAgIG90aGVyd2lzZSBpdCdzIHRydWUhXG5cdFx0Y29uc3QgZGVsZXRhYmxlID0gaWZFbHNlKFxuXHRcdFx0ZGVsZXRlTmF2aWdhdGlvblJlc3RyaWN0aW9uLl90eXBlID09PSBcIlVucmVzb2x2YWJsZVwiLFxuXHRcdFx0b3Iobm90KGlzQ29uc3RhbnQoZGVsZXRlUGF0aCkpLCBkZWxldGVQYXRoKSxcblx0XHRcdGRlbGV0ZVBhdGhcblx0XHQpO1xuXHRcdHRoaXMuZWRpdE1vZGUgPVxuXHRcdFx0dGhpcy5mb3JtYXRPcHRpb25zLmRpc3BsYXlPbmx5ID09PSBcInRydWVcIlxuXHRcdFx0XHQ/IFwiRGlzcGxheVwiXG5cdFx0XHRcdDogY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKGFuZChpbnNlcnRhYmxlLCBkZWxldGFibGUsIFVJLklzRWRpdGFibGUpLCBjb25zdGFudChcIkVkaXRhYmxlXCIpLCBjb25zdGFudChcIkRpc3BsYXlcIikpKTtcblx0XHR0aGlzLmRpc3BsYXlNb2RlID0gZ2V0RGlzcGxheU1vZGUoZGF0YU1vZGVsUGF0aCk7XG5cblx0XHRjb25zdCBtdWx0aUlucHV0U2V0dGluZ3MgPSBNdWx0aVZhbHVlRmllbGRCbG9jay5fZ2V0TXVsdGlJbnB1dFNldHRpbmdzKGRhdGFNb2RlbFBhdGgsIHRoaXMuZm9ybWF0T3B0aW9ucyk7XG5cdFx0dGhpcy50ZXh0ID0gbXVsdGlJbnB1dFNldHRpbmdzLnRleHQ7XG5cdFx0dGhpcy5jb2xsZWN0aW9uID1cblx0XHRcdHRoaXMuZWRpdE1vZGUgPT09IFwiRGlzcGxheVwiID8gbXVsdGlJbnB1dFNldHRpbmdzLmNvbGxlY3Rpb25CaW5kaW5nRGlzcGxheSA6IG11bHRpSW5wdXRTZXR0aW5ncy5jb2xsZWN0aW9uQmluZGluZ0VkaXQ7XG5cdFx0dGhpcy5rZXkgPSBtdWx0aUlucHV0U2V0dGluZ3Mua2V5O1xuXHRcdHRoaXMuZmllbGRHcm91cElkcyA9IE11bHRpVmFsdWVGaWVsZEJsb2NrLmNvbXB1dGVGaWVsZEdyb3VwSWRzKGRhdGFNb2RlbFBhdGgsIHNldHRpbmdzLmFwcENvbXBvbmVudCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHRlbXBsYXRlIGZ1bmN0aW9uLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggdGhlIGRlZmluaXRpb24gb2YgdGhlIGZpZWxkIGNvbnRyb2xcblx0ICovXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdC8vcHJlcGFyZSBzZXR0aW5ncyBmb3IgZnVydGhlciBwcm9jZXNzaW5nXG5cdFx0Y29uc3QgaW50ZXJuYWxEYXRhTW9kZWxQYXRoID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBpbnRlcm5hbERhdGFGaWVsZENvbnZlcnRlZCA9IGludGVybmFsRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QgYXMgRGF0YUZpZWxkO1xuXHRcdGNvbnN0IGVuaGFuY2VkRGF0YU1vZGVsUGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKFxuXHRcdFx0aW50ZXJuYWxEYXRhTW9kZWxQYXRoLFxuXHRcdFx0KGludGVybmFsRGF0YUZpZWxkQ29udmVydGVkLlZhbHVlIGFzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxzdHJpbmc+KS5wYXRoXG5cdFx0KTsgLy8gUGF0aEFubm90YXRpb25FeHByZXNzaW9uIHdhcyBjaGVja2VkIGluIHRoZSB0ZW1wbGF0aW5nXG5cdFx0Ly9jYWxjdWxhdGUgdGhlIGlkIHNldHRpbmdzIGZvciB0aGlzIGJsb2NrXG5cdFx0Y29uc3QgaWQgPSB0aGlzLmlkUHJlZml4ID8gSUQuZ2VuZXJhdGUoW3RoaXMuaWRQcmVmaXgsIFwiTXVsdGlWYWx1ZUZpZWxkXCJdKSA6IHVuZGVmaW5lZDtcblx0XHQvL2NyZWF0ZSBhIG5ldyBiaW5kaW5nIGNvbnRleHQgZm9yIHRoZSB2YWx1ZSBoZWxwXG5cdFx0Y29uc3QgdmFsdWVIZWxwUHJvcGVydHkgPSBGaWVsZEhlbHBlci52YWx1ZUhlbHBQcm9wZXJ0eSh0aGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCB2YWx1ZUhlbHBQcm9wZXJ0eUNvbnRleHQgPSB0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQodmFsdWVIZWxwUHJvcGVydHksIHRoaXMubWV0YVBhdGgpO1xuXHRcdC8vY2FsY3VsYXRlIGZpZWxkSGVscFxuXHRcdGNvbnN0IGZpZWxkSGVscCA9IFZhbHVlSGVscFRlbXBsYXRpbmcuZ2VuZXJhdGVJRChcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdHRoaXMudmhJZFByZWZpeCxcblx0XHRcdFByb3BlcnR5Rm9ybWF0dGVycy5nZXRSZWxhdGl2ZVByb3BlcnR5UGF0aCh2YWx1ZUhlbHBQcm9wZXJ0eUNvbnRleHQgYXMgdW5rbm93biBhcyBNZXRhTW9kZWxDb250ZXh0LCB7XG5cdFx0XHRcdGNvbnRleHQ6IHRoaXMuY29udGV4dFBhdGhcblx0XHRcdH0pLFxuXHRcdFx0Z2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChlbmhhbmNlZERhdGFNb2RlbFBhdGgpID8/IFwiXCJcblx0XHQpO1xuXHRcdC8vY29tcHV0ZSB0aGUgY29ycmVjdCBsYWJlbFxuXHRcdGNvbnN0IGxhYmVsID0gRmllbGRIZWxwZXIuY29tcHV0ZUxhYmVsVGV4dChpbnRlcm5hbERhdGFGaWVsZENvbnZlcnRlZC5WYWx1ZSBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248c3RyaW5nPiwge1xuXHRcdFx0Y29udGV4dDogdGhpcy5tZXRhUGF0aFxuXHRcdH0pIGFzIHN0cmluZztcblx0XHRjb25zdCBjaGFuZ2UgPSBgTVZGaWVsZFJ1bnRpbWUuaGFuZGxlQ2hhbmdlKCRjb250cm9sbGVyLCAkZXZlbnQpYDtcblx0XHRjb25zdCB2YWxpZGF0ZUZpZWxkR3JvdXAgPSBgTVZGaWVsZFJ1bnRpbWUub25WYWxpZGF0ZUZpZWxkR3JvdXAoJGNvbnRyb2xsZXIsICRldmVudClgO1xuXG5cdFx0cmV0dXJuIHhtbGBcblx0XHQ8bWRjOk11bHRpVmFsdWVGaWVsZFxuXHRcdFx0XHR4bWxuczptZGM9XCJzYXAudWkubWRjXCJcblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie01WRmllbGRSdW50aW1lOidzYXAvZmUvbWFjcm9zL211bHRpVmFsdWVGaWVsZC9NdWx0aVZhbHVlRmllbGRSdW50aW1lJ31cIlxuXHRcdFx0XHRkZWxlZ2F0ZT1cIntuYW1lOiAnc2FwL2ZlL21hY3Jvcy9tdWx0aVZhbHVlRmllbGQvTXVsdGlWYWx1ZUZpZWxkRGVsZWdhdGUnfVwiXG5cdFx0XHRcdGlkPVwiJHtpZH1cIlxuXHRcdFx0XHRpdGVtcz1cIiR7dGhpcy5jb2xsZWN0aW9ufVwiXG5cdFx0XHRcdGRpc3BsYXk9XCIke3RoaXMuZGlzcGxheU1vZGV9XCJcblx0XHRcdFx0d2lkdGg9XCIxMDAlXCJcblx0XHRcdFx0ZWRpdE1vZGU9XCIke3RoaXMuZWRpdE1vZGV9XCJcblx0XHRcdFx0ZmllbGRIZWxwPVwiJHtmaWVsZEhlbHB9XCJcblx0XHRcdFx0YXJpYUxhYmVsbGVkQnkgPSBcIiR7dGhpcy5hcmlhTGFiZWxsZWRCeX1cIlxuXHRcdFx0XHRzaG93RW1wdHlJbmRpY2F0b3IgPSBcIiR7dGhpcy5mb3JtYXRPcHRpb25zLnNob3dFbXB0eUluZGljYXRvcn1cIlxuXHRcdFx0XHRsYWJlbCA9IFwiJHtsYWJlbH1cIlxuXHRcdFx0XHRjaGFuZ2U9XCIke2NoYW5nZX1cIlxuXHRcdFx0XHRmaWVsZEdyb3VwSWRzPVwiJHt0aGlzLmZpZWxkR3JvdXBJZHN9XCJcblx0XHRcdFx0dmFsaWRhdGVGaWVsZEdyb3VwPVwiJHt2YWxpZGF0ZUZpZWxkR3JvdXB9XCJcblx0XHQ+XG5cdFx0PG1kY0ZpZWxkOk11bHRpVmFsdWVGaWVsZEl0ZW0geG1sbnM6bWRjRmllbGQ9XCJzYXAudWkubWRjLmZpZWxkXCIga2V5PVwiJHt0aGlzLmtleX1cIiBkZXNjcmlwdGlvbj1cIiR7dGhpcy50ZXh0fVwiIC8+XG5cdFx0PC9tZGM6TXVsdGlWYWx1ZUZpZWxkPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFvRnFCQSxvQkFBb0I7RUF2QnpDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBbEJBLE9BbUJDQyxtQkFBbUIsQ0FBQztJQUNwQkMsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QkMsU0FBUyxFQUFFO0VBQ1osQ0FBQyxDQUFDLFVBS0FDLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFNREQsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQU9ERCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsYUFBYSxFQUFFLENBQUMsc0NBQXNDO0VBQ3ZELENBQUMsQ0FBQyxVQU1ESCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFz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
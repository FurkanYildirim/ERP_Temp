/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/filter/FilterFieldHelper", "sap/fe/macros/filter/FilterFieldTemplating"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, MetaModelConverter, BindingToolkit, StableIdHelper, DataModelPathHelper, PropertyFormatters, CommonHelper, FieldHelper, FilterFieldHelper, FilterFieldTemplating) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var getFilterFieldDisplayFormat = FilterFieldTemplating.getFilterFieldDisplayFormat;
  var maxConditions = FilterFieldHelper.maxConditions;
  var isRequiredInFilter = FilterFieldHelper.isRequiredInFilter;
  var getPlaceholder = FilterFieldHelper.getPlaceholder;
  var getDataType = FilterFieldHelper.getDataType;
  var getConditionsBinding = FilterFieldHelper.getConditionsBinding;
  var formatOptions = FilterFieldHelper.formatOptions;
  var constraints = FilterFieldHelper.constraints;
  var getRelativePropertyPath = PropertyFormatters.getRelativePropertyPath;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var generate = StableIdHelper.generate;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var xml = BuildingBlockTemplateProcessor.xml;
  var SAP_UI_MODEL_CONTEXT = BuildingBlockTemplateProcessor.SAP_UI_MODEL_CONTEXT;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FilterFieldBlock = (
  /**
   * Building block for creating a Filter Field based on the metadata provided by OData V4.
   * <br>
   * It is designed to work based on a property context(property) pointing to an entity type property
   * needed to be used as filterfield and entityType context(contextPath) to consider the relativity of
   * the propertyPath of the property wrt entityType.
   *
   * Usage example:
   * <pre>
   * &lt;macro:FilterField id="MyFilterField" property="CompanyName" /&gt;
   * </pre>
   *
   * @private
   */
  _dec = defineBuildingBlock({
    name: "FilterField",
    namespace: "sap.fe.macros.internal"
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec5 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec8 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FilterFieldBlock, _BuildingBlockBase);
    /**
     * Defines the metadata path to the property.
     */

    /**
     * Metadata path to the entitySet or navigationProperty
     */

    /**
     * Visual filter settings for filter field.
     */

    /**
     * A prefix that is added to the generated ID of the filter field.
     */

    /**
     * A prefix that is added to the generated ID of the value help used for the filter field.
     */

    /**
     * Specifies the Sematic Date Range option for the filter field.
     */

    /**
     * Settings from the manifest settings.
     */

    function FilterFieldBlock(props, configuration, settings) {
      var _propertyConverted$an, _propertyConverted$an2, _propertyConverted$an3, _propertyConverted$an4;
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, settings) || this;
      _initializerDefineProperty(_this, "property", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visualFilter", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "idPrefix", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "vhIdPrefix", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useSemanticDateRange", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "settings", _descriptor7, _assertThisInitialized(_this));
      const propertyConverted = MetaModelConverter.convertMetaModelContext(_this.property);
      const dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(_this.property, _this.contextPath);

      // Property settings
      const propertyName = propertyConverted.name,
        fixedValues = !!((_propertyConverted$an = propertyConverted.annotations) !== null && _propertyConverted$an !== void 0 && (_propertyConverted$an2 = _propertyConverted$an.Common) !== null && _propertyConverted$an2 !== void 0 && _propertyConverted$an2.ValueListWithFixedValues);
      _this.controlId = _this.idPrefix && generate([_this.idPrefix, propertyName]);
      _this.sourcePath = getTargetObjectPath(dataModelPath);
      _this.dataType = getDataType(propertyConverted);
      const labelTerm = (propertyConverted === null || propertyConverted === void 0 ? void 0 : (_propertyConverted$an3 = propertyConverted.annotations) === null || _propertyConverted$an3 === void 0 ? void 0 : (_propertyConverted$an4 = _propertyConverted$an3.Common) === null || _propertyConverted$an4 === void 0 ? void 0 : _propertyConverted$an4.Label) || propertyName;
      const labelExpression = getExpressionFromAnnotation(labelTerm);
      _this.label = compileExpression(labelExpression) || propertyName;
      _this.conditionsBinding = getConditionsBinding(dataModelPath) || "";
      _this.placeholder = getPlaceholder(propertyConverted);
      // Visual Filter settings
      _this.vfEnabled = !!_this.visualFilter && !(_this.idPrefix && _this.idPrefix.indexOf("Adaptation") > -1);
      _this.vfId = _this.vfEnabled ? generate([_this.idPrefix, propertyName, "VisualFilter"]) : undefined;

      //-----------------------------------------------------------------------------------------------------//
      // TODO: need to change operations from MetaModel to Converters.
      // This mainly included changing changing getFilterRestrictions operations from metaModel to converters
      const propertyContext = _this.property,
        model = propertyContext.getModel(),
        vhPropertyPath = FieldHelper.valueHelpPropertyForFilterField(propertyContext),
        filterable = CommonHelper.isPropertyFilterable(propertyContext),
        propertyObject = propertyContext.getObject(),
        propertyInterface = {
          context: propertyContext
        };
      _this.display = getFilterFieldDisplayFormat(dataModelPath, propertyConverted, propertyInterface);
      _this.isFilterable = !(filterable === false || filterable === "false");
      _this.maxConditions = maxConditions(propertyObject, propertyInterface);
      _this.dataTypeConstraints = constraints(propertyObject, propertyInterface);
      _this.dataTypeFormatOptions = formatOptions(propertyObject, propertyInterface);
      _this.required = isRequiredInFilter(propertyObject, propertyInterface);
      _this.operators = FieldHelper.operators(propertyContext, propertyObject, _this.useSemanticDateRange, _this.settings || "", _this.contextPath.getPath());

      // Value Help settings
      // TODO: This needs to be updated when VH macro is converted to 2.0
      const vhProperty = model.createBindingContext(vhPropertyPath);
      const vhPropertyObject = vhProperty.getObject(),
        vhPropertyInterface = {
          context: vhProperty
        },
        relativeVhPropertyPath = getRelativePropertyPath(vhPropertyObject, vhPropertyInterface),
        relativePropertyPath = getRelativePropertyPath(propertyObject, propertyInterface);
      _this.fieldHelpProperty = FieldHelper.getFieldHelpPropertyForFilterField(propertyContext, propertyObject, propertyObject.$Type, _this.vhIdPrefix, relativePropertyPath, relativeVhPropertyPath, fixedValues, _this.useSemanticDateRange);

      //-----------------------------------------------------------------------------------------------------//
      return _this;
    }
    _exports = FilterFieldBlock;
    var _proto = FilterFieldBlock.prototype;
    _proto.getVisualFilterContent = function getVisualFilterContent() {
      var _visualFilterObject, _visualFilterObject$i;
      let visualFilterObject = this.visualFilter,
        vfXML = "";
      if (!this.vfEnabled || !visualFilterObject) {
        return vfXML;
      }
      if ((_visualFilterObject = visualFilterObject) !== null && _visualFilterObject !== void 0 && (_visualFilterObject$i = _visualFilterObject.isA) !== null && _visualFilterObject$i !== void 0 && _visualFilterObject$i.call(_visualFilterObject, SAP_UI_MODEL_CONTEXT)) {
        visualFilterObject = visualFilterObject.getObject();
      }
      const {
        contextPath,
        presentationAnnotation,
        outParameter,
        inParameters,
        valuelistProperty,
        selectionVariantAnnotation,
        multipleSelectionAllowed,
        required,
        requiredProperties = [],
        showOverlayInitially,
        renderLineChart,
        isValueListWithFixedValues
      } = visualFilterObject;
      vfXML = xml`
				<macro:VisualFilter
					id="${this.vfId}"
					contextPath="${contextPath}"
					metaPath="${presentationAnnotation}"
					outParameter="${outParameter}"
					inParameters="${inParameters}"
					valuelistProperty="${valuelistProperty}"
					selectionVariantAnnotation="${selectionVariantAnnotation}"
					multipleSelectionAllowed="${multipleSelectionAllowed}"
					required="${required}"
					requiredProperties="${CommonHelper.stringifyCustomData(requiredProperties)}"
					showOverlayInitially="${showOverlayInitially}"
					renderLineChart="${renderLineChart}"
					isValueListWithFixedValues="${isValueListWithFixedValues}"
					filterBarEntityType="${contextPath}"
				/>
			`;
      return vfXML;
    };
    _proto.getTemplate = async function getTemplate() {
      let xmlRet = ``;
      if (this.isFilterable) {
        let display;
        try {
          display = await this.display;
        } catch (err) {
          Log.error(`FE : FilterField BuildingBlock : Error fetching display property for ${this.sourcePath} : ${err}`);
        }
        xmlRet = xml`
				<mdc:FilterField
					xmlns:mdc="sap.ui.mdc"
					xmlns:macro="sap.fe.macros"
					xmlns:unittest="http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1"
					xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					unittest:id="UnitTest::FilterField"
					customData:sourcePath="${this.sourcePath}"
					id="${this.controlId}"
					delegate="{name: 'sap/fe/macros/field/FieldBaseDelegate', payload:{isFilterField:true}}"
					label="${this.label}"
					dataType="${this.dataType}"
					display="${display}"
					maxConditions="${this.maxConditions}"
					fieldHelp="${this.fieldHelpProperty}"
					conditions="${this.conditionsBinding}"
					dataTypeConstraints="${this.dataTypeConstraints}"
					dataTypeFormatOptions="${this.dataTypeFormatOptions}"
					required="${this.required}"
					operators="${this.operators}"
					placeholder="${this.placeholder}"

				>
					${this.vfEnabled ? this.getVisualFilterContent() : ""}
				</mdc:FilterField>
			`;
      }
      return xmlRet;
    };
    return FilterFieldBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "property", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "visualFilter", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "FilterField";
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "vhIdPrefix", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "FilterFieldValueHelp";
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "useSemanticDateRange", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "settings", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  _exports = FilterFieldBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJGaWVsZEJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImlzUHVibGljIiwicHJvcHMiLCJjb25maWd1cmF0aW9uIiwic2V0dGluZ3MiLCJwcm9wZXJ0eUNvbnZlcnRlZCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IiwicHJvcGVydHkiLCJkYXRhTW9kZWxQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiY29udGV4dFBhdGgiLCJwcm9wZXJ0eU5hbWUiLCJmaXhlZFZhbHVlcyIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwiY29udHJvbElkIiwiaWRQcmVmaXgiLCJnZW5lcmF0ZSIsInNvdXJjZVBhdGgiLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwiZGF0YVR5cGUiLCJnZXREYXRhVHlwZSIsImxhYmVsVGVybSIsIkxhYmVsIiwibGFiZWxFeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwibGFiZWwiLCJjb21waWxlRXhwcmVzc2lvbiIsImNvbmRpdGlvbnNCaW5kaW5nIiwiZ2V0Q29uZGl0aW9uc0JpbmRpbmciLCJwbGFjZWhvbGRlciIsImdldFBsYWNlaG9sZGVyIiwidmZFbmFibGVkIiwidmlzdWFsRmlsdGVyIiwiaW5kZXhPZiIsInZmSWQiLCJ1bmRlZmluZWQiLCJwcm9wZXJ0eUNvbnRleHQiLCJtb2RlbCIsImdldE1vZGVsIiwidmhQcm9wZXJ0eVBhdGgiLCJGaWVsZEhlbHBlciIsInZhbHVlSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQiLCJmaWx0ZXJhYmxlIiwiQ29tbW9uSGVscGVyIiwiaXNQcm9wZXJ0eUZpbHRlcmFibGUiLCJwcm9wZXJ0eU9iamVjdCIsImdldE9iamVjdCIsInByb3BlcnR5SW50ZXJmYWNlIiwiY29udGV4dCIsImRpc3BsYXkiLCJnZXRGaWx0ZXJGaWVsZERpc3BsYXlGb3JtYXQiLCJpc0ZpbHRlcmFibGUiLCJtYXhDb25kaXRpb25zIiwiZGF0YVR5cGVDb25zdHJhaW50cyIsImNvbnN0cmFpbnRzIiwiZGF0YVR5cGVGb3JtYXRPcHRpb25zIiwiZm9ybWF0T3B0aW9ucyIsImlzUmVxdWlyZWRJbkZpbHRlciIsIm9wZXJhdG9ycyIsInVzZVNlbWFudGljRGF0ZVJhbmdlIiwiZ2V0UGF0aCIsInZoUHJvcGVydHkiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsInZoUHJvcGVydHlPYmplY3QiLCJ2aFByb3BlcnR5SW50ZXJmYWNlIiwicmVsYXRpdmVWaFByb3BlcnR5UGF0aCIsImdldFJlbGF0aXZlUHJvcGVydHlQYXRoIiwicmVsYXRpdmVQcm9wZXJ0eVBhdGgiLCJmaWVsZEhlbHBQcm9wZXJ0eSIsImdldEZpZWxkSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQiLCIkVHlwZSIsInZoSWRQcmVmaXgiLCJnZXRWaXN1YWxGaWx0ZXJDb250ZW50IiwidmlzdWFsRmlsdGVyT2JqZWN0IiwidmZYTUwiLCJpc0EiLCJTQVBfVUlfTU9ERUxfQ09OVEVYVCIsInByZXNlbnRhdGlvbkFubm90YXRpb24iLCJvdXRQYXJhbWV0ZXIiLCJpblBhcmFtZXRlcnMiLCJ2YWx1ZWxpc3RQcm9wZXJ0eSIsInNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uIiwibXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkIiwicmVxdWlyZWRQcm9wZXJ0aWVzIiwic2hvd092ZXJsYXlJbml0aWFsbHkiLCJyZW5kZXJMaW5lQ2hhcnQiLCJpc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyIsInhtbCIsInN0cmluZ2lmeUN1c3RvbURhdGEiLCJnZXRUZW1wbGF0ZSIsInhtbFJldCIsImVyciIsIkxvZyIsImVycm9yIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckZpZWxkLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IFNBUF9VSV9NT0RFTF9DT05URVhULCB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSB7IFZpc3VhbEZpbHRlcnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L1Zpc3VhbEZpbHRlcnNcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB7IGdldFRhcmdldE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRSZWxhdGl2ZVByb3BlcnR5UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5Rm9ybWF0dGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBDb21wdXRlZEFubm90YXRpb25JbnRlcmZhY2UsIE1ldGFNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGNvbnN0cmFpbnRzLFxuXHRmb3JtYXRPcHRpb25zLFxuXHRnZXRDb25kaXRpb25zQmluZGluZyxcblx0Z2V0RGF0YVR5cGUsXG5cdGdldFBsYWNlaG9sZGVyLFxuXHRpc1JlcXVpcmVkSW5GaWx0ZXIsXG5cdG1heENvbmRpdGlvbnNcbn0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlckZpZWxkSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRGaWx0ZXJGaWVsZERpc3BsYXlGb3JtYXQgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTWV0YU1vZGVsXCI7XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmlsdGVyIEZpZWxkIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIEl0IGlzIGRlc2lnbmVkIHRvIHdvcmsgYmFzZWQgb24gYSBwcm9wZXJ0eSBjb250ZXh0KHByb3BlcnR5KSBwb2ludGluZyB0byBhbiBlbnRpdHkgdHlwZSBwcm9wZXJ0eVxuICogbmVlZGVkIHRvIGJlIHVzZWQgYXMgZmlsdGVyZmllbGQgYW5kIGVudGl0eVR5cGUgY29udGV4dChjb250ZXh0UGF0aCkgdG8gY29uc2lkZXIgdGhlIHJlbGF0aXZpdHkgb2ZcbiAqIHRoZSBwcm9wZXJ0eVBhdGggb2YgdGhlIHByb3BlcnR5IHdydCBlbnRpdHlUeXBlLlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZpbHRlckZpZWxkIGlkPVwiTXlGaWx0ZXJGaWVsZFwiIHByb3BlcnR5PVwiQ29tcGFueU5hbWVcIiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQHByaXZhdGVcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkZpbHRlckZpZWxkXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWx0ZXJGaWVsZEJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgbWV0YWRhdGEgcGF0aCB0byB0aGUgcHJvcGVydHkuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRwcm9wZXJ0eSE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGVudGl0eVNldCBvciBuYXZpZ2F0aW9uUHJvcGVydHlcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHQvKipcblx0ICogVmlzdWFsIGZpbHRlciBzZXR0aW5ncyBmb3IgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0dmlzdWFsRmlsdGVyPzogQ29udGV4dCB8IFZpc3VhbEZpbHRlcnM7XG5cblx0LyoqXG5cdCAqIEEgcHJlZml4IHRoYXQgaXMgYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGlkUHJlZml4OiBzdHJpbmcgPSBcIkZpbHRlckZpZWxkXCI7XG5cblx0LyoqXG5cdCAqIEEgcHJlZml4IHRoYXQgaXMgYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgdmFsdWUgaGVscCB1c2VkIGZvciB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHZoSWRQcmVmaXg6IHN0cmluZyA9IFwiRmlsdGVyRmllbGRWYWx1ZUhlbHBcIjtcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBTZW1hdGljIERhdGUgUmFuZ2Ugb3B0aW9uIGZvciB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHR1c2VTZW1hbnRpY0RhdGVSYW5nZTogYm9vbGVhbiA9IHRydWU7XG5cblx0LyoqXG5cdCAqIFNldHRpbmdzIGZyb20gdGhlIG1hbmlmZXN0IHNldHRpbmdzLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHNldHRpbmdzOiBzdHJpbmcgPSBcIlwiO1xuXG5cdC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHQgKiAgICAgICAgICAgIElOVEVSTkFMIEFUVFJJQlVURVMgICAgICAgICAgICAgICpcblx0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cblx0LyoqXG5cdCAqIENvbnRyb2wgSWQgZm9yIE1EQyBmaWx0ZXIgZmllbGQgdXNlZCBpbnNpZGUuXG5cdCAqL1xuXHRjb250cm9sSWQhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNvdXJjZSBhbm5vdGF0aW9uIHBhdGggb2YgdGhlIHByb3BlcnR5LlxuXHQgKi9cblx0c291cmNlUGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogTGFiZWwgZm9yIGZpbHRlcmZpZWxkLlxuXHQgKi9cblx0bGFiZWwhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERhdGEgVHlwZSBvZiB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0ZGF0YVR5cGUhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE1heGltdW0gY29uZGl0aW9ucyB0aGF0IGNhbiBiZSBhZGRlZCB0byB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0bWF4Q29uZGl0aW9ucyE6IG51bWJlcjtcblxuXHQvKipcblx0ICogRmllbGQgSGVscCBpZCBhcyBhc3NvY2lhdGlvbiBmb3IgdGhlIGZpbHRlciBmaWVsZC5cblx0ICovXG5cdGZpZWxkSGVscFByb3BlcnR5Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBCaW5kaW5nIHBhdGggZm9yIGNvbmRpdGlvbnMgYWRkZWQgdG8gZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0Y29uZGl0aW9uc0JpbmRpbmchOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERhdGF0eXBlIGNvbnN0cmFpbnRzIG9mIHRoZSBmaWx0ZXIgZmllbGQuXG5cdCAqL1xuXHRkYXRhVHlwZUNvbnN0cmFpbnRzPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEYXRhdHlwZSBmb3JtYXQgb3B0aW9ucyBvZiB0aGUgZmlsdGVyIGZpZWxkLlxuXHQgKi9cblx0ZGF0YVR5cGVGb3JtYXRPcHRpb25zPzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUbyBzcGVjaWZ5IGZpbHRlciBmaWVsZCBpcyBtYW5kYXRvcnkgZm9yIGZpbHRlcmluZy5cblx0ICovXG5cdHJlcXVpcmVkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBWYWxpZCBvcGVyYXRvcnMgZm9yIHRoZSBmaWx0ZXIgZmllbGQuXG5cdCAqL1xuXHRvcGVyYXRvcnM/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFZpc3VhbCBGaWx0ZXIgaWQgdG8gYmUgdXNlZC5cblx0ICovXG5cdHZmSWQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFZpc3VhbCBGaWx0ZXIgaXMgZXhwZWN0ZWQuXG5cdCAqL1xuXHR2ZkVuYWJsZWQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBQcm9wZXJ0eSB1c2VkIGlzIGZpbHRlcmFibGVcblx0ICovXG5cdGlzRmlsdGVyYWJsZSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IGZvciBwbGFjZWhvbGRlclxuXHQgKi9cblx0cGxhY2Vob2xkZXI/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFByb3BlcnR5IHRvIGhvbGQgcHJvbWlzZSBmb3IgZGlzcGxheVxuXHQgKi9cblx0ZGlzcGxheT86IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPjtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPEZpbHRlckZpZWxkQmxvY2s+LCBjb25maWd1cmF0aW9uOiBhbnksIHNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihwcm9wcywgY29uZmlndXJhdGlvbiwgc2V0dGluZ3MpO1xuXG5cdFx0Y29uc3QgcHJvcGVydHlDb252ZXJ0ZWQgPSBNZXRhTW9kZWxDb252ZXJ0ZXIuY29udmVydE1ldGFNb2RlbENvbnRleHQodGhpcy5wcm9wZXJ0eSkgYXMgUHJvcGVydHk7XG5cdFx0Y29uc3QgZGF0YU1vZGVsUGF0aCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5wcm9wZXJ0eSwgdGhpcy5jb250ZXh0UGF0aCk7XG5cblx0XHQvLyBQcm9wZXJ0eSBzZXR0aW5nc1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZSA9IHByb3BlcnR5Q29udmVydGVkLm5hbWUsXG5cdFx0XHRmaXhlZFZhbHVlcyA9ICEhcHJvcGVydHlDb252ZXJ0ZWQuYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzO1xuXG5cdFx0dGhpcy5jb250cm9sSWQgPSB0aGlzLmlkUHJlZml4ICYmIGdlbmVyYXRlKFt0aGlzLmlkUHJlZml4LCBwcm9wZXJ0eU5hbWVdKTtcblx0XHR0aGlzLnNvdXJjZVBhdGggPSBnZXRUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbFBhdGgpO1xuXHRcdHRoaXMuZGF0YVR5cGUgPSBnZXREYXRhVHlwZShwcm9wZXJ0eUNvbnZlcnRlZCk7XG5cdFx0Y29uc3QgbGFiZWxUZXJtID0gcHJvcGVydHlDb252ZXJ0ZWQ/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsIHx8IHByb3BlcnR5TmFtZTtcblx0XHRjb25zdCBsYWJlbEV4cHJlc3Npb24gPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24obGFiZWxUZXJtKTtcblx0XHR0aGlzLmxhYmVsID0gY29tcGlsZUV4cHJlc3Npb24obGFiZWxFeHByZXNzaW9uKSB8fCBwcm9wZXJ0eU5hbWU7XG5cdFx0dGhpcy5jb25kaXRpb25zQmluZGluZyA9IGdldENvbmRpdGlvbnNCaW5kaW5nKGRhdGFNb2RlbFBhdGgpIHx8IFwiXCI7XG5cdFx0dGhpcy5wbGFjZWhvbGRlciA9IGdldFBsYWNlaG9sZGVyKHByb3BlcnR5Q29udmVydGVkKTtcblx0XHQvLyBWaXN1YWwgRmlsdGVyIHNldHRpbmdzXG5cdFx0dGhpcy52ZkVuYWJsZWQgPSAhIXRoaXMudmlzdWFsRmlsdGVyICYmICEodGhpcy5pZFByZWZpeCAmJiB0aGlzLmlkUHJlZml4LmluZGV4T2YoXCJBZGFwdGF0aW9uXCIpID4gLTEpO1xuXHRcdHRoaXMudmZJZCA9IHRoaXMudmZFbmFibGVkID8gZ2VuZXJhdGUoW3RoaXMuaWRQcmVmaXgsIHByb3BlcnR5TmFtZSwgXCJWaXN1YWxGaWx0ZXJcIl0pIDogdW5kZWZpbmVkO1xuXG5cdFx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cdFx0Ly8gVE9ETzogbmVlZCB0byBjaGFuZ2Ugb3BlcmF0aW9ucyBmcm9tIE1ldGFNb2RlbCB0byBDb252ZXJ0ZXJzLlxuXHRcdC8vIFRoaXMgbWFpbmx5IGluY2x1ZGVkIGNoYW5naW5nIGNoYW5naW5nIGdldEZpbHRlclJlc3RyaWN0aW9ucyBvcGVyYXRpb25zIGZyb20gbWV0YU1vZGVsIHRvIGNvbnZlcnRlcnNcblx0XHRjb25zdCBwcm9wZXJ0eUNvbnRleHQgPSB0aGlzLnByb3BlcnR5LFxuXHRcdFx0bW9kZWw6IE1ldGFNb2RlbCA9IHByb3BlcnR5Q29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0dmhQcm9wZXJ0eVBhdGg6IHN0cmluZyA9IEZpZWxkSGVscGVyLnZhbHVlSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQocHJvcGVydHlDb250ZXh0KSxcblx0XHRcdGZpbHRlcmFibGUgPSBDb21tb25IZWxwZXIuaXNQcm9wZXJ0eUZpbHRlcmFibGUocHJvcGVydHlDb250ZXh0KSxcblx0XHRcdHByb3BlcnR5T2JqZWN0ID0gcHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpLFxuXHRcdFx0cHJvcGVydHlJbnRlcmZhY2UgPSB7IGNvbnRleHQ6IHByb3BlcnR5Q29udGV4dCB9IGFzIENvbXB1dGVkQW5ub3RhdGlvbkludGVyZmFjZTtcblxuXHRcdHRoaXMuZGlzcGxheSA9IGdldEZpbHRlckZpZWxkRGlzcGxheUZvcm1hdChkYXRhTW9kZWxQYXRoLCBwcm9wZXJ0eUNvbnZlcnRlZCwgcHJvcGVydHlJbnRlcmZhY2UpO1xuXHRcdHRoaXMuaXNGaWx0ZXJhYmxlID0gIShmaWx0ZXJhYmxlID09PSBmYWxzZSB8fCBmaWx0ZXJhYmxlID09PSBcImZhbHNlXCIpO1xuXHRcdHRoaXMubWF4Q29uZGl0aW9ucyA9IG1heENvbmRpdGlvbnMocHJvcGVydHlPYmplY3QsIHByb3BlcnR5SW50ZXJmYWNlKTtcblx0XHR0aGlzLmRhdGFUeXBlQ29uc3RyYWludHMgPSBjb25zdHJhaW50cyhwcm9wZXJ0eU9iamVjdCwgcHJvcGVydHlJbnRlcmZhY2UpO1xuXHRcdHRoaXMuZGF0YVR5cGVGb3JtYXRPcHRpb25zID0gZm9ybWF0T3B0aW9ucyhwcm9wZXJ0eU9iamVjdCwgcHJvcGVydHlJbnRlcmZhY2UpO1xuXHRcdHRoaXMucmVxdWlyZWQgPSBpc1JlcXVpcmVkSW5GaWx0ZXIocHJvcGVydHlPYmplY3QsIHByb3BlcnR5SW50ZXJmYWNlKTtcblx0XHR0aGlzLm9wZXJhdG9ycyA9IEZpZWxkSGVscGVyLm9wZXJhdG9ycyhcblx0XHRcdHByb3BlcnR5Q29udGV4dCxcblx0XHRcdHByb3BlcnR5T2JqZWN0LFxuXHRcdFx0dGhpcy51c2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdHRoaXMuc2V0dGluZ3MgfHwgXCJcIixcblx0XHRcdHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpXG5cdFx0KTtcblxuXHRcdC8vIFZhbHVlIEhlbHAgc2V0dGluZ3Ncblx0XHQvLyBUT0RPOiBUaGlzIG5lZWRzIHRvIGJlIHVwZGF0ZWQgd2hlbiBWSCBtYWNybyBpcyBjb252ZXJ0ZWQgdG8gMi4wXG5cdFx0Y29uc3QgdmhQcm9wZXJ0eSA9IG1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHZoUHJvcGVydHlQYXRoKSBhcyBDb250ZXh0O1xuXHRcdGNvbnN0IHZoUHJvcGVydHlPYmplY3QgPSB2aFByb3BlcnR5LmdldE9iamVjdCgpIGFzIE1ldGFNb2RlbENvbnRleHQsXG5cdFx0XHR2aFByb3BlcnR5SW50ZXJmYWNlID0geyBjb250ZXh0OiB2aFByb3BlcnR5IH0sXG5cdFx0XHRyZWxhdGl2ZVZoUHJvcGVydHlQYXRoID0gZ2V0UmVsYXRpdmVQcm9wZXJ0eVBhdGgodmhQcm9wZXJ0eU9iamVjdCwgdmhQcm9wZXJ0eUludGVyZmFjZSksXG5cdFx0XHRyZWxhdGl2ZVByb3BlcnR5UGF0aCA9IGdldFJlbGF0aXZlUHJvcGVydHlQYXRoKHByb3BlcnR5T2JqZWN0LCBwcm9wZXJ0eUludGVyZmFjZSk7XG5cdFx0dGhpcy5maWVsZEhlbHBQcm9wZXJ0eSA9IEZpZWxkSGVscGVyLmdldEZpZWxkSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQoXG5cdFx0XHRwcm9wZXJ0eUNvbnRleHQsXG5cdFx0XHRwcm9wZXJ0eU9iamVjdCxcblx0XHRcdHByb3BlcnR5T2JqZWN0LiRUeXBlLFxuXHRcdFx0dGhpcy52aElkUHJlZml4LFxuXHRcdFx0cmVsYXRpdmVQcm9wZXJ0eVBhdGgsXG5cdFx0XHRyZWxhdGl2ZVZoUHJvcGVydHlQYXRoLFxuXHRcdFx0Zml4ZWRWYWx1ZXMsXG5cdFx0XHR0aGlzLnVzZVNlbWFudGljRGF0ZVJhbmdlXG5cdFx0KTtcblxuXHRcdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXHR9XG5cblx0Z2V0VmlzdWFsRmlsdGVyQ29udGVudCgpIHtcblx0XHRsZXQgdmlzdWFsRmlsdGVyT2JqZWN0ID0gdGhpcy52aXN1YWxGaWx0ZXIsXG5cdFx0XHR2ZlhNTCA9IFwiXCI7XG5cdFx0aWYgKCF0aGlzLnZmRW5hYmxlZCB8fCAhdmlzdWFsRmlsdGVyT2JqZWN0KSB7XG5cdFx0XHRyZXR1cm4gdmZYTUw7XG5cdFx0fVxuXHRcdGlmICgodmlzdWFsRmlsdGVyT2JqZWN0IGFzIENvbnRleHQpPy5pc0E/LihTQVBfVUlfTU9ERUxfQ09OVEVYVCkpIHtcblx0XHRcdHZpc3VhbEZpbHRlck9iamVjdCA9ICh2aXN1YWxGaWx0ZXJPYmplY3QgYXMgQ29udGV4dCkuZ2V0T2JqZWN0KCkgYXMgVmlzdWFsRmlsdGVycztcblx0XHR9XG5cblx0XHRjb25zdCB7XG5cdFx0XHRjb250ZXh0UGF0aCxcblx0XHRcdHByZXNlbnRhdGlvbkFubm90YXRpb24sXG5cdFx0XHRvdXRQYXJhbWV0ZXIsXG5cdFx0XHRpblBhcmFtZXRlcnMsXG5cdFx0XHR2YWx1ZWxpc3RQcm9wZXJ0eSxcblx0XHRcdHNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0bXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkLFxuXHRcdFx0cmVxdWlyZWQsXG5cdFx0XHRyZXF1aXJlZFByb3BlcnRpZXMgPSBbXSxcblx0XHRcdHNob3dPdmVybGF5SW5pdGlhbGx5LFxuXHRcdFx0cmVuZGVyTGluZUNoYXJ0LFxuXHRcdFx0aXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXNcblx0XHR9ID0gdmlzdWFsRmlsdGVyT2JqZWN0IGFzIFZpc3VhbEZpbHRlcnM7XG5cdFx0dmZYTUwgPSB4bWxgXG5cdFx0XHRcdDxtYWNybzpWaXN1YWxGaWx0ZXJcblx0XHRcdFx0XHRpZD1cIiR7dGhpcy52ZklkfVwiXG5cdFx0XHRcdFx0Y29udGV4dFBhdGg9XCIke2NvbnRleHRQYXRofVwiXG5cdFx0XHRcdFx0bWV0YVBhdGg9XCIke3ByZXNlbnRhdGlvbkFubm90YXRpb259XCJcblx0XHRcdFx0XHRvdXRQYXJhbWV0ZXI9XCIke291dFBhcmFtZXRlcn1cIlxuXHRcdFx0XHRcdGluUGFyYW1ldGVycz1cIiR7aW5QYXJhbWV0ZXJzfVwiXG5cdFx0XHRcdFx0dmFsdWVsaXN0UHJvcGVydHk9XCIke3ZhbHVlbGlzdFByb3BlcnR5fVwiXG5cdFx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudEFubm90YXRpb249XCIke3NlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9ufVwiXG5cdFx0XHRcdFx0bXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkPVwiJHttdWx0aXBsZVNlbGVjdGlvbkFsbG93ZWR9XCJcblx0XHRcdFx0XHRyZXF1aXJlZD1cIiR7cmVxdWlyZWR9XCJcblx0XHRcdFx0XHRyZXF1aXJlZFByb3BlcnRpZXM9XCIke0NvbW1vbkhlbHBlci5zdHJpbmdpZnlDdXN0b21EYXRhKHJlcXVpcmVkUHJvcGVydGllcyl9XCJcblx0XHRcdFx0XHRzaG93T3ZlcmxheUluaXRpYWxseT1cIiR7c2hvd092ZXJsYXlJbml0aWFsbHl9XCJcblx0XHRcdFx0XHRyZW5kZXJMaW5lQ2hhcnQ9XCIke3JlbmRlckxpbmVDaGFydH1cIlxuXHRcdFx0XHRcdGlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzPVwiJHtpc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlc31cIlxuXHRcdFx0XHRcdGZpbHRlckJhckVudGl0eVR5cGU9XCIke2NvbnRleHRQYXRofVwiXG5cdFx0XHRcdC8+XG5cdFx0XHRgO1xuXG5cdFx0cmV0dXJuIHZmWE1MO1xuXHR9XG5cblx0YXN5bmMgZ2V0VGVtcGxhdGUoKSB7XG5cdFx0bGV0IHhtbFJldCA9IGBgO1xuXHRcdGlmICh0aGlzLmlzRmlsdGVyYWJsZSkge1xuXHRcdFx0bGV0IGRpc3BsYXk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRkaXNwbGF5ID0gYXdhaXQgdGhpcy5kaXNwbGF5O1xuXHRcdFx0fSBjYXRjaCAoZXJyOiB1bmtub3duKSB7XG5cdFx0XHRcdExvZy5lcnJvcihgRkUgOiBGaWx0ZXJGaWVsZCBCdWlsZGluZ0Jsb2NrIDogRXJyb3IgZmV0Y2hpbmcgZGlzcGxheSBwcm9wZXJ0eSBmb3IgJHt0aGlzLnNvdXJjZVBhdGh9IDogJHtlcnJ9YCk7XG5cdFx0XHR9XG5cblx0XHRcdHhtbFJldCA9IHhtbGBcblx0XHRcdFx0PG1kYzpGaWx0ZXJGaWVsZFxuXHRcdFx0XHRcdHhtbG5zOm1kYz1cInNhcC51aS5tZGNcIlxuXHRcdFx0XHRcdHhtbG5zOm1hY3JvPVwic2FwLmZlLm1hY3Jvc1wiXG5cdFx0XHRcdFx0eG1sbnM6dW5pdHRlc3Q9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9wcmVwcm9jZXNzb3JleHRlbnNpb24vc2FwLmZlLnVuaXR0ZXN0aW5nLzFcIlxuXHRcdFx0XHRcdHhtbG5zOmN1c3RvbURhdGE9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUuQ3VzdG9tRGF0YS8xXCJcblx0XHRcdFx0XHR1bml0dGVzdDppZD1cIlVuaXRUZXN0OjpGaWx0ZXJGaWVsZFwiXG5cdFx0XHRcdFx0Y3VzdG9tRGF0YTpzb3VyY2VQYXRoPVwiJHt0aGlzLnNvdXJjZVBhdGh9XCJcblx0XHRcdFx0XHRpZD1cIiR7dGhpcy5jb250cm9sSWR9XCJcblx0XHRcdFx0XHRkZWxlZ2F0ZT1cIntuYW1lOiAnc2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZEJhc2VEZWxlZ2F0ZScsIHBheWxvYWQ6e2lzRmlsdGVyRmllbGQ6dHJ1ZX19XCJcblx0XHRcdFx0XHRsYWJlbD1cIiR7dGhpcy5sYWJlbH1cIlxuXHRcdFx0XHRcdGRhdGFUeXBlPVwiJHt0aGlzLmRhdGFUeXBlfVwiXG5cdFx0XHRcdFx0ZGlzcGxheT1cIiR7ZGlzcGxheX1cIlxuXHRcdFx0XHRcdG1heENvbmRpdGlvbnM9XCIke3RoaXMubWF4Q29uZGl0aW9uc31cIlxuXHRcdFx0XHRcdGZpZWxkSGVscD1cIiR7dGhpcy5maWVsZEhlbHBQcm9wZXJ0eX1cIlxuXHRcdFx0XHRcdGNvbmRpdGlvbnM9XCIke3RoaXMuY29uZGl0aW9uc0JpbmRpbmd9XCJcblx0XHRcdFx0XHRkYXRhVHlwZUNvbnN0cmFpbnRzPVwiJHt0aGlzLmRhdGFUeXBlQ29uc3RyYWludHN9XCJcblx0XHRcdFx0XHRkYXRhVHlwZUZvcm1hdE9wdGlvbnM9XCIke3RoaXMuZGF0YVR5cGVGb3JtYXRPcHRpb25zfVwiXG5cdFx0XHRcdFx0cmVxdWlyZWQ9XCIke3RoaXMucmVxdWlyZWR9XCJcblx0XHRcdFx0XHRvcGVyYXRvcnM9XCIke3RoaXMub3BlcmF0b3JzfVwiXG5cdFx0XHRcdFx0cGxhY2Vob2xkZXI9XCIke3RoaXMucGxhY2Vob2xkZXJ9XCJcblxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0JHt0aGlzLnZmRW5hYmxlZCA/IHRoaXMuZ2V0VmlzdWFsRmlsdGVyQ29udGVudCgpIDogXCJcIn1cblx0XHRcdFx0PC9tZGM6RmlsdGVyRmllbGQ+XG5cdFx0XHRgO1xuXHRcdH1cblxuXHRcdHJldHVybiB4bWxSZXQ7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUE4Q3FCQSxnQkFBZ0I7RUFsQnJDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFiQSxPQWNDQyxtQkFBbUIsQ0FBQztJQUNwQkMsSUFBSSxFQUFFLGFBQWE7SUFDbkJDLFNBQVMsRUFBRTtFQUNaLENBQUMsQ0FBQyxVQUtBQyxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBTURILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsc0JBQXNCO0lBQzVCQyxRQUFRLEVBQUUsSUFBSTtJQUNkQyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREgsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxzQkFBc0I7SUFDNUJFLFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQU1ESCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLFFBQVE7SUFDZEUsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBTURILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsUUFBUTtJQUNkRSxRQUFRLEVB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
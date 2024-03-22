/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/controls/Common/Form", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ID", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/form/FormHelper", "sap/ui/core/library", "sap/ui/model/odata/v4/AnnotationHelper"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, Form, BindingHelper, ID, MetaModelConverter, BindingToolkit, DataModelPathHelper, FormHelper, library, AnnotationHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13;
  var _exports = {};
  var TitleLevel = library.TitleLevel;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getFormContainerID = ID.getFormContainerID;
  var UI = BindingHelper.UI;
  var createFormDefinition = Form.createFormDefinition;
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
  let FormBlock = (
  /**
   * Building block for creating a Form based on the metadata provided by OData V4.
   * <br>
   * It is designed to work based on a FieldGroup annotation but can also work if you provide a ReferenceFacet or a CollectionFacet
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Form id="MyForm" metaPath="@com.sap.vocabularies.UI.v1.FieldGroup#GeneralInformation" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Form
   * @public
   */
  _dec = defineBuildingBlock({
    name: "Form",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    returnTypes: ["sap.fe.macros.form.FormAPI"]
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "Singleton", "EntityType"]
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true,
    expectedAnnotationTypes: ["com.sap.vocabularies.UI.v1.FieldGroupType", "com.sap.vocabularies.UI.v1.CollectionFacet", "com.sap.vocabularies.UI.v1.ReferenceFacet"],
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"]
  }), _dec5 = blockAttribute({
    type: "array"
  }), _dec6 = blockAttribute({
    type: "boolean"
  }), _dec7 = blockAttribute({
    type: "boolean"
  }), _dec8 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true
  }), _dec10 = blockAttribute({
    type: "string"
  }), _dec11 = blockAttribute({
    type: "string"
  }), _dec12 = blockEvent(), _dec13 = blockAggregation({
    type: "sap.fe.macros.form.FormElement",
    isPublic: true,
    slot: "formElements",
    isDefault: true
  }), _dec14 = blockAttribute({
    type: "object",
    isPublic: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormBlock, _BuildingBlockBase);
    /**
     * The identifier of the form control.
     *
     * @public
     */

    /**
     * Defines the path of the context used in the current page or block.
     * This setting is defined by the framework.
     *
     * @public
     */

    /**
     * Defines the relative path of the property in the metamodel, based on the current contextPath.
     *
     * @public
     */

    /**
     * The manifest defined form containers to be shown in the action area of the table
     */

    /**
     * Control the rendering of the form container labels
     */

    /**
     * Toggle Preview: Part of Preview / Preview via 'Show More' Button
     */

    /**
     * The title of the form control.
     *
     * @public
     */

    /**
     * Defines the "aria-level" of the form title, titles of internally used form containers are nested subsequently
     */

    /**
     * 	If set to false, the Form is not rendered.
     */

    // Independent from the form title, can be a bit confusing in standalone usage at is not showing anything by default

    // Just proxied down to the Field may need to see if needed or not

    /**
     * Defines the layout to be used within the form.
     * It defaults to the ColumnLayout, but you can also use a ResponsiveGridLayout.
     * All the properties of the ResponsiveGridLayout can be added to the configuration.
     */

    function FormBlock(props, configuration, mSettings) {
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formContainers", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useFormContainerLabels", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "partOfPreview", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "titleLevel", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "displayMode", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isVisible", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formElements", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "layout", _descriptor13, _assertThisInitialized(_this));
      if (_this.metaPath && _this.contextPath && (_this.formContainers === undefined || _this.formContainers === null)) {
        const oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
        const mExtraSettings = {};
        let oFacetDefinition = oContextObjectPath.targetObject;
        let hasFieldGroup = false;
        if (oFacetDefinition && oFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.FieldGroupType") {
          // Wrap the facet in a fake Facet annotation
          hasFieldGroup = true;
          oFacetDefinition = {
            $Type: "com.sap.vocabularies.UI.v1.ReferenceFacet",
            Label: oFacetDefinition.Label,
            Target: {
              $target: oFacetDefinition,
              fullyQualifiedName: oFacetDefinition.fullyQualifiedName,
              path: "",
              term: "",
              type: "AnnotationPath",
              value: getContextRelativeTargetObjectPath(oContextObjectPath)
            },
            annotations: {},
            fullyQualifiedName: oFacetDefinition.fullyQualifiedName
          };
          mExtraSettings[oFacetDefinition.Target.value] = {
            fields: _this.formElements
          };
        }
        const oConverterContext = _this.getConverterContext(oContextObjectPath, /*this.contextPath*/undefined, mSettings, mExtraSettings);
        const oFormDefinition = createFormDefinition(oFacetDefinition, _this.isVisible, oConverterContext);
        if (hasFieldGroup) {
          oFormDefinition.formContainers[0].annotationPath = _this.metaPath.getPath();
        }
        _this.formContainers = oFormDefinition.formContainers;
        _this.useFormContainerLabels = oFormDefinition.useFormContainerLabels;
        _this.facetType = oFacetDefinition && oFacetDefinition.$Type;
      } else {
        var _this$metaPath$getObj;
        _this.facetType = (_this$metaPath$getObj = _this.metaPath.getObject()) === null || _this$metaPath$getObj === void 0 ? void 0 : _this$metaPath$getObj.$Type;
      }
      if (!_this.isPublic) {
        _this._apiId = _this.createId("Form");
        _this._contentId = _this.id;
      } else {
        _this._apiId = _this.id;
        _this._contentId = `${_this.id}-content`;
      }
      // if displayMode === true -> _editable = false
      // if displayMode === false -> _editable = true
      //  => if displayMode === {myBindingValue} -> _editable = {myBindingValue} === true ? true : false
      // if DisplayMode === undefined -> _editable = {ui>/isEditable}
      if (_this.displayMode !== undefined) {
        _this._editable = compileExpression(ifElse(equal(resolveBindingString(_this.displayMode, "boolean"), false), true, false));
      } else {
        _this._editable = compileExpression(UI.IsEditable);
      }
      return _this;
    }
    _exports = FormBlock;
    var _proto = FormBlock.prototype;
    _proto.getDataFieldCollection = function getDataFieldCollection(formContainer, facetContext) {
      const facet = getInvolvedDataModelObjects(facetContext).targetObject;
      let navigationPath;
      let idPart;
      if (facet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        navigationPath = AnnotationHelper.getNavigationPath(facet.Target.value);
        idPart = facet;
      } else {
        const contextPathPath = this.contextPath.getPath();
        let facetPath = facetContext.getPath();
        if (facetPath.startsWith(contextPathPath)) {
          facetPath = facetPath.substring(contextPathPath.length);
        }
        navigationPath = AnnotationHelper.getNavigationPath(facetPath);
        idPart = facetPath;
      }
      const titleLevel = FormHelper.getFormContainerTitleLevel(this.title, this.titleLevel);
      const title = this.useFormContainerLabels && facet ? AnnotationHelper.label(facet, {
        context: facetContext
      }) : "";
      const id = this.id ? getFormContainerID(idPart) : undefined;
      return xml`
					<macro:FormContainer
					xmlns:macro="sap.fe.macros"
					${this.attr("id", id)}
					title="${title}"
					titleLevel="${titleLevel}"
					contextPath="${navigationPath ? formContainer.entitySet : this.contextPath}"
					metaPath="${facetContext}"
					dataFieldCollection="${formContainer.formElements}"
					navigationPath="${navigationPath}"
					visible="${formContainer.isVisible}"
					displayMode="${this.displayMode}"
					onChange="${this.onChange}"
					actions="${formContainer.actions}"
				>
				<macro:formElements>
					<slot name="formElements" />
				</macro:formElements>
			</macro:FormContainer>`;
    };
    _proto.getFormContainers = function getFormContainers() {
      if (this.formContainers.length === 0) {
        return "";
      }
      if (this.facetType.indexOf("com.sap.vocabularies.UI.v1.CollectionFacet") >= 0) {
        return this.formContainers.map((formContainer, formContainerIdx) => {
          if (formContainer.isVisible) {
            const facetContext = this.contextPath.getModel().createBindingContext(formContainer.annotationPath, this.contextPath);
            const facet = facetContext.getObject();
            if (facet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && FormHelper.isReferenceFacetPartOfPreview(facet, this.partOfPreview)) {
              if (facet.Target.$AnnotationPath.$Type === "com.sap.vocabularies.Communication.v1.AddressType") {
                return xml`<template:with path="formContainers>${formContainerIdx}" var="formContainer">
											<template:with path="formContainers>${formContainerIdx}/annotationPath" var="facet">
												<core:Fragment fragmentName="sap.fe.macros.form.AddressSection" type="XML" />
											</template:with>
										</template:with>`;
              }
              return this.getDataFieldCollection(formContainer, facetContext);
            }
          }
          return "";
        });
      } else if (this.facetType === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        return this.formContainers.map(formContainer => {
          if (formContainer.isVisible) {
            const facetContext = this.contextPath.getModel().createBindingContext(formContainer.annotationPath, this.contextPath);
            return this.getDataFieldCollection(formContainer, facetContext);
          } else {
            return "";
          }
        });
      }
      return "";
    }

    /**
     * Create the proper layout information based on the `layout` property defined externally.
     *
     * @returns The layout information for the xml.
     */;
    _proto.getLayoutInformation = function getLayoutInformation() {
      switch (this.layout.type) {
        case "ResponsiveGridLayout":
          return xml`<f:ResponsiveGridLayout adjustLabelSpan="${this.layout.adjustLabelSpan}"
													breakpointL="${this.layout.breakpointL}"
													breakpointM="${this.layout.breakpointM}"
													breakpointXL="${this.layout.breakpointXL}"
													columnsL="${this.layout.columnsL}"
													columnsM="${this.layout.columnsM}"
													columnsXL="${this.layout.columnsXL}"
													emptySpanL="${this.layout.emptySpanL}"
													emptySpanM="${this.layout.emptySpanM}"
													emptySpanS="${this.layout.emptySpanS}"
													emptySpanXL="${this.layout.emptySpanXL}"
													labelSpanL="${this.layout.labelSpanL}"
													labelSpanM="${this.layout.labelSpanM}"
													labelSpanS="${this.layout.labelSpanS}"
													labelSpanXL="${this.layout.labelSpanXL}"
													singleContainerFullSize="${this.layout.singleContainerFullSize}" />`;
        case "ColumnLayout":
        default:
          return xml`<f:ColumnLayout
								columnsM="${this.layout.columnsM}"
								columnsL="${this.layout.columnsL}"
								columnsXL="${this.layout.columnsXL}"
								labelCellsLarge="${this.layout.labelCellsLarge}"
								emptyCellsLarge="${this.layout.emptyCellsLarge}" />`;
      }
    };
    _proto.getTemplate = function getTemplate() {
      const onChangeStr = this.onChange && this.onChange.replace("{", "\\{").replace("}", "\\}") || "";
      const metaPathPath = this.metaPath.getPath();
      const contextPathPath = this.contextPath.getPath();
      if (!this.isVisible) {
        return "";
      } else {
        return xml`<macro:FormAPI xmlns:macro="sap.fe.macros.form"
					xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
					xmlns:f="sap.ui.layout.form"
					xmlns:fl="sap.ui.fl"
					id="${this._apiId}"
					metaPath="${metaPathPath}"
					contextPath="${contextPathPath}">
				<f:Form
					fl:delegate='{
						"name": "sap/fe/macros/form/FormDelegate",
						"delegateType": "complete"
					}'
					id="${this._contentId}"
					editable="${this._editable}"
					macrodata:entitySet="{contextPath>@sapui.name}"
					visible="${this.isVisible}"
					class="sapUxAPObjectPageSubSectionAlignContent"
					macrodata:navigationPath="${contextPathPath}"
					macrodata:onChange="${onChangeStr}"
				>
					${this.addConditionally(this.title !== undefined, xml`<f:title>
							<core:Title level="${this.titleLevel}" text="${this.title}" />
						</f:title>`)}
					<f:layout>
					${this.getLayoutInformation()}

					</f:layout>
					<f:formContainers>
						${this.getFormContainers()}
					</f:formContainers>
				</f:Form>
			</macro:FormAPI>`;
      }
    };
    return FormBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "formContainers", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "useFormContainerLabels", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "partOfPreview", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "titleLevel", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return TitleLevel.Auto;
    }
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "displayMode", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "isVisible", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "true";
    }
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "formElements", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "layout", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {
        type: "ColumnLayout",
        columnsM: 2,
        columnsXL: 6,
        columnsL: 3,
        labelCellsLarge: 12
      };
    }
  })), _class2)) || _class);
  _exports = FormBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsInJldHVyblR5cGVzIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJyZXF1aXJlZCIsImV4cGVjdGVkVHlwZXMiLCJleHBlY3RlZEFubm90YXRpb25UeXBlcyIsImJsb2NrRXZlbnQiLCJibG9ja0FnZ3JlZ2F0aW9uIiwic2xvdCIsImlzRGVmYXVsdCIsInByb3BzIiwiY29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsIm1ldGFQYXRoIiwiY29udGV4dFBhdGgiLCJmb3JtQ29udGFpbmVycyIsInVuZGVmaW5lZCIsIm9Db250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm1FeHRyYVNldHRpbmdzIiwib0ZhY2V0RGVmaW5pdGlvbiIsInRhcmdldE9iamVjdCIsImhhc0ZpZWxkR3JvdXAiLCIkVHlwZSIsIkxhYmVsIiwiVGFyZ2V0IiwiJHRhcmdldCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInBhdGgiLCJ0ZXJtIiwidmFsdWUiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwiYW5ub3RhdGlvbnMiLCJmaWVsZHMiLCJmb3JtRWxlbWVudHMiLCJvQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJvRm9ybURlZmluaXRpb24iLCJjcmVhdGVGb3JtRGVmaW5pdGlvbiIsImlzVmlzaWJsZSIsImFubm90YXRpb25QYXRoIiwiZ2V0UGF0aCIsInVzZUZvcm1Db250YWluZXJMYWJlbHMiLCJmYWNldFR5cGUiLCJnZXRPYmplY3QiLCJfYXBpSWQiLCJjcmVhdGVJZCIsIl9jb250ZW50SWQiLCJpZCIsImRpc3BsYXlNb2RlIiwiX2VkaXRhYmxlIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJlcXVhbCIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiVUkiLCJJc0VkaXRhYmxlIiwiZ2V0RGF0YUZpZWxkQ29sbGVjdGlvbiIsImZvcm1Db250YWluZXIiLCJmYWNldENvbnRleHQiLCJmYWNldCIsIm5hdmlnYXRpb25QYXRoIiwiaWRQYXJ0IiwiQW5ub3RhdGlvbkhlbHBlciIsImdldE5hdmlnYXRpb25QYXRoIiwiY29udGV4dFBhdGhQYXRoIiwiZmFjZXRQYXRoIiwic3RhcnRzV2l0aCIsInN1YnN0cmluZyIsImxlbmd0aCIsInRpdGxlTGV2ZWwiLCJGb3JtSGVscGVyIiwiZ2V0Rm9ybUNvbnRhaW5lclRpdGxlTGV2ZWwiLCJ0aXRsZSIsImxhYmVsIiwiY29udGV4dCIsImdldEZvcm1Db250YWluZXJJRCIsInhtbCIsImF0dHIiLCJlbnRpdHlTZXQiLCJvbkNoYW5nZSIsImFjdGlvbnMiLCJnZXRGb3JtQ29udGFpbmVycyIsImluZGV4T2YiLCJtYXAiLCJmb3JtQ29udGFpbmVySWR4IiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImlzUmVmZXJlbmNlRmFjZXRQYXJ0T2ZQcmV2aWV3IiwicGFydE9mUHJldmlldyIsIiRBbm5vdGF0aW9uUGF0aCIsImdldExheW91dEluZm9ybWF0aW9uIiwibGF5b3V0IiwiYWRqdXN0TGFiZWxTcGFuIiwiYnJlYWtwb2ludEwiLCJicmVha3BvaW50TSIsImJyZWFrcG9pbnRYTCIsImNvbHVtbnNMIiwiY29sdW1uc00iLCJjb2x1bW5zWEwiLCJlbXB0eVNwYW5MIiwiZW1wdHlTcGFuTSIsImVtcHR5U3BhblMiLCJlbXB0eVNwYW5YTCIsImxhYmVsU3BhbkwiLCJsYWJlbFNwYW5NIiwibGFiZWxTcGFuUyIsImxhYmVsU3BhblhMIiwic2luZ2xlQ29udGFpbmVyRnVsbFNpemUiLCJsYWJlbENlbGxzTGFyZ2UiLCJlbXB0eUNlbGxzTGFyZ2UiLCJnZXRUZW1wbGF0ZSIsIm9uQ2hhbmdlU3RyIiwicmVwbGFjZSIsIm1ldGFQYXRoUGF0aCIsImFkZENvbmRpdGlvbmFsbHkiLCJCdWlsZGluZ0Jsb2NrQmFzZSIsIlRpdGxlTGV2ZWwiLCJBdXRvIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGb3JtLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW11bmljYXRpb25cIjtcbmltcG9ydCB0eXBlIHsgRmFjZXRUeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IEJ1aWxkaW5nQmxvY2tCYXNlIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrQmFzZVwiO1xuaW1wb3J0IHsgYmxvY2tBZ2dyZWdhdGlvbiwgYmxvY2tBdHRyaWJ1dGUsIGJsb2NrRXZlbnQsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB0eXBlIHsgRm9ybUNvbnRhaW5lciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9Gb3JtXCI7XG5pbXBvcnQgeyBjcmVhdGVGb3JtRGVmaW5pdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9Gb3JtXCI7XG5pbXBvcnQgeyBVSSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHsgZ2V0Rm9ybUNvbnRhaW5lcklEIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9JRFwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBlcXVhbCwgaWZFbHNlLCByZXNvbHZlQmluZGluZ1N0cmluZyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCBGb3JtSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2Zvcm0vRm9ybUhlbHBlclwiO1xuaW1wb3J0IHsgVGl0bGVMZXZlbCB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSB7ICRDb2x1bW5MYXlvdXRTZXR0aW5ncyB9IGZyb20gXCJzYXAvdWkvbGF5b3V0L2Zvcm0vQ29sdW1uTGF5b3V0XCI7XG5pbXBvcnQgdHlwZSB7ICRSZXNwb25zaXZlR3JpZExheW91dFNldHRpbmdzIH0gZnJvbSBcInNhcC91aS9sYXlvdXQvZm9ybS9SZXNwb25zaXZlR3JpZExheW91dFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBBbm5vdGF0aW9uSGVscGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQW5ub3RhdGlvbkhlbHBlclwiO1xuXG50eXBlIENvbHVtbkxheW91dCA9ICRDb2x1bW5MYXlvdXRTZXR0aW5ncyAmIHtcblx0dHlwZTogXCJDb2x1bW5MYXlvdXRcIjtcbn07XG50eXBlIFJlc3BvbnNpdmVHcmlkTGF5b3V0ID0gJFJlc3BvbnNpdmVHcmlkTGF5b3V0U2V0dGluZ3MgJiB7XG5cdHR5cGU6IFwiUmVzcG9uc2l2ZUdyaWRMYXlvdXRcIjtcbn07XG50eXBlIEZvcm1MYXlvdXRJbmZvcm1hdGlvbiA9IENvbHVtbkxheW91dCB8IFJlc3BvbnNpdmVHcmlkTGF5b3V0O1xuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIEZvcm0gYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogSXQgaXMgZGVzaWduZWQgdG8gd29yayBiYXNlZCBvbiBhIEZpZWxkR3JvdXAgYW5ub3RhdGlvbiBidXQgY2FuIGFsc28gd29yayBpZiB5b3UgcHJvdmlkZSBhIFJlZmVyZW5jZUZhY2V0IG9yIGEgQ29sbGVjdGlvbkZhY2V0XG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZvcm0gaWQ9XCJNeUZvcm1cIiBtZXRhUGF0aD1cIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwI0dlbmVyYWxJbmZvcm1hdGlvblwiIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy5Gb3JtXG4gKiBAcHVibGljXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJGb3JtXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdHB1YmxpY05hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdHJldHVyblR5cGVzOiBbXCJzYXAuZmUubWFjcm9zLmZvcm0uRm9ybUFQSVwiXVxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcm1CbG9jayBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0LyoqXG5cdCAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSBmb3JtIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcGF0aCBvZiB0aGUgY29udGV4dCB1c2VkIGluIHRoZSBjdXJyZW50IHBhZ2Ugb3IgYmxvY2suXG5cdCAqIFRoaXMgc2V0dGluZyBpcyBkZWZpbmVkIGJ5IHRoZSBmcmFtZXdvcmsuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLCBcIlNpbmdsZXRvblwiLCBcIkVudGl0eVR5cGVcIl1cblx0fSlcblx0Y29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbWV0YW1vZGVsLCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZXh0UGF0aC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0aXNQdWJsaWM6IHRydWUsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uVHlwZXM6IFtcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cFR5cGVcIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ29sbGVjdGlvbkZhY2V0XCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlZmVyZW5jZUZhY2V0XCJcblx0XHRdLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl1cblx0fSlcblx0bWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBUaGUgbWFuaWZlc3QgZGVmaW5lZCBmb3JtIGNvbnRhaW5lcnMgdG8gYmUgc2hvd24gaW4gdGhlIGFjdGlvbiBhcmVhIG9mIHRoZSB0YWJsZVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJhcnJheVwiIH0pXG5cdGZvcm1Db250YWluZXJzPzogRm9ybUNvbnRhaW5lcltdO1xuXG5cdC8qKlxuXHQgKiBDb250cm9sIHRoZSByZW5kZXJpbmcgb2YgdGhlIGZvcm0gY29udGFpbmVyIGxhYmVsc1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0dXNlRm9ybUNvbnRhaW5lckxhYmVscz86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRvZ2dsZSBQcmV2aWV3OiBQYXJ0IG9mIFByZXZpZXcgLyBQcmV2aWV3IHZpYSAnU2hvdyBNb3JlJyBCdXR0b25cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHBhcnRPZlByZXZpZXc6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdC8qKlxuXHQgKiBUaGUgdGl0bGUgb2YgdGhlIGZvcm0gY29udHJvbC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0dGl0bGU/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIFwiYXJpYS1sZXZlbFwiIG9mIHRoZSBmb3JtIHRpdGxlLCB0aXRsZXMgb2YgaW50ZXJuYWxseSB1c2VkIGZvcm0gY29udGFpbmVycyBhcmUgbmVzdGVkIHN1YnNlcXVlbnRseVxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkuY29yZS5UaXRsZUxldmVsXCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdHRpdGxlTGV2ZWw6IFRpdGxlTGV2ZWwgPSBUaXRsZUxldmVsLkF1dG87XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRkaXNwbGF5TW9kZT86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdC8qKlxuXHQgKiBcdElmIHNldCB0byBmYWxzZSwgdGhlIEZvcm0gaXMgbm90IHJlbmRlcmVkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRpc1Zpc2libGU6IHN0cmluZyA9IFwidHJ1ZVwiO1xuXHQvLyBJbmRlcGVuZGVudCBmcm9tIHRoZSBmb3JtIHRpdGxlLCBjYW4gYmUgYSBiaXQgY29uZnVzaW5nIGluIHN0YW5kYWxvbmUgdXNhZ2UgYXQgaXMgbm90IHNob3dpbmcgYW55dGhpbmcgYnkgZGVmYXVsdFxuXG5cdC8vIEp1c3QgcHJveGllZCBkb3duIHRvIHRoZSBGaWVsZCBtYXkgbmVlZCB0byBzZWUgaWYgbmVlZGVkIG9yIG5vdFxuXHRAYmxvY2tFdmVudCgpXG5cdG9uQ2hhbmdlPzogc3RyaW5nO1xuXG5cdEBibG9ja0FnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLmZvcm0uRm9ybUVsZW1lbnRcIiwgaXNQdWJsaWM6IHRydWUsIHNsb3Q6IFwiZm9ybUVsZW1lbnRzXCIsIGlzRGVmYXVsdDogdHJ1ZSB9KVxuXHRmb3JtRWxlbWVudHM/OiBhbnk7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIGxheW91dCB0byBiZSB1c2VkIHdpdGhpbiB0aGUgZm9ybS5cblx0ICogSXQgZGVmYXVsdHMgdG8gdGhlIENvbHVtbkxheW91dCwgYnV0IHlvdSBjYW4gYWxzbyB1c2UgYSBSZXNwb25zaXZlR3JpZExheW91dC5cblx0ICogQWxsIHRoZSBwcm9wZXJ0aWVzIG9mIHRoZSBSZXNwb25zaXZlR3JpZExheW91dCBjYW4gYmUgYWRkZWQgdG8gdGhlIGNvbmZpZ3VyYXRpb24uXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcIm9iamVjdFwiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRsYXlvdXQ6IEZvcm1MYXlvdXRJbmZvcm1hdGlvbiA9IHsgdHlwZTogXCJDb2x1bW5MYXlvdXRcIiwgY29sdW1uc006IDIsIGNvbHVtbnNYTDogNiwgY29sdW1uc0w6IDMsIGxhYmVsQ2VsbHNMYXJnZTogMTIgfTtcblxuXHQvLyBVc2VmdWwgZm9yIG91ciBkeW5hbWljIHRoaW5nIGJ1dCBhbHNvIGRlcGVuZHMgb24gdGhlIG1ldGFkYXRhIC0+IG1ha2Ugc3VyZSB0aGlzIGlzIHRha2VuIGludG8gYWNjb3VudFxuXHRfZWRpdGFibGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdF9hcGlJZDogc3RyaW5nO1xuXG5cdF9jb250ZW50SWQ6IHN0cmluZztcblxuXHRmYWNldFR5cGU6IHN0cmluZztcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPEZvcm1CbG9jaz4sIGNvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihwcm9wcywgY29uZmlndXJhdGlvbiwgbVNldHRpbmdzKTtcblx0XHRpZiAodGhpcy5tZXRhUGF0aCAmJiB0aGlzLmNvbnRleHRQYXRoICYmICh0aGlzLmZvcm1Db250YWluZXJzID09PSB1bmRlZmluZWQgfHwgdGhpcy5mb3JtQ29udGFpbmVycyA9PT0gbnVsbCkpIHtcblx0XHRcdGNvbnN0IG9Db250ZXh0T2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRcdGNvbnN0IG1FeHRyYVNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cdFx0XHRsZXQgb0ZhY2V0RGVmaW5pdGlvbiA9IG9Db250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0XHRsZXQgaGFzRmllbGRHcm91cCA9IGZhbHNlO1xuXHRcdFx0aWYgKG9GYWNldERlZmluaXRpb24gJiYgb0ZhY2V0RGVmaW5pdGlvbi4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRmllbGRHcm91cFR5cGUpIHtcblx0XHRcdFx0Ly8gV3JhcCB0aGUgZmFjZXQgaW4gYSBmYWtlIEZhY2V0IGFubm90YXRpb25cblx0XHRcdFx0aGFzRmllbGRHcm91cCA9IHRydWU7XG5cdFx0XHRcdG9GYWNldERlZmluaXRpb24gPSB7XG5cdFx0XHRcdFx0JFR5cGU6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXRcIixcblx0XHRcdFx0XHRMYWJlbDogb0ZhY2V0RGVmaW5pdGlvbi5MYWJlbCxcblx0XHRcdFx0XHRUYXJnZXQ6IHtcblx0XHRcdFx0XHRcdCR0YXJnZXQ6IG9GYWNldERlZmluaXRpb24sXG5cdFx0XHRcdFx0XHRmdWxseVF1YWxpZmllZE5hbWU6IG9GYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHRcdFx0cGF0aDogXCJcIixcblx0XHRcdFx0XHRcdHRlcm06IFwiXCIsXG5cdFx0XHRcdFx0XHR0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsXG5cdFx0XHRcdFx0XHR2YWx1ZTogZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvQ29udGV4dE9iamVjdFBhdGgpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uczoge30sXG5cdFx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBvRmFjZXREZWZpbml0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRtRXh0cmFTZXR0aW5nc1tvRmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZV0gPSB7IGZpZWxkczogdGhpcy5mb3JtRWxlbWVudHMgfTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgb0NvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQoXG5cdFx0XHRcdG9Db250ZXh0T2JqZWN0UGF0aCxcblx0XHRcdFx0Lyp0aGlzLmNvbnRleHRQYXRoKi8gdW5kZWZpbmVkLFxuXHRcdFx0XHRtU2V0dGluZ3MsXG5cdFx0XHRcdG1FeHRyYVNldHRpbmdzXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3Qgb0Zvcm1EZWZpbml0aW9uID0gY3JlYXRlRm9ybURlZmluaXRpb24ob0ZhY2V0RGVmaW5pdGlvbiwgdGhpcy5pc1Zpc2libGUsIG9Db252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdGlmIChoYXNGaWVsZEdyb3VwKSB7XG5cdFx0XHRcdG9Gb3JtRGVmaW5pdGlvbi5mb3JtQ29udGFpbmVyc1swXS5hbm5vdGF0aW9uUGF0aCA9IHRoaXMubWV0YVBhdGguZ2V0UGF0aCgpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5mb3JtQ29udGFpbmVycyA9IG9Gb3JtRGVmaW5pdGlvbi5mb3JtQ29udGFpbmVycztcblx0XHRcdHRoaXMudXNlRm9ybUNvbnRhaW5lckxhYmVscyA9IG9Gb3JtRGVmaW5pdGlvbi51c2VGb3JtQ29udGFpbmVyTGFiZWxzO1xuXHRcdFx0dGhpcy5mYWNldFR5cGUgPSBvRmFjZXREZWZpbml0aW9uICYmIG9GYWNldERlZmluaXRpb24uJFR5cGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuZmFjZXRUeXBlID0gdGhpcy5tZXRhUGF0aC5nZXRPYmplY3QoKT8uJFR5cGU7XG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmlzUHVibGljKSB7XG5cdFx0XHR0aGlzLl9hcGlJZCA9IHRoaXMuY3JlYXRlSWQoXCJGb3JtXCIpITtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IHRoaXMuaWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2FwaUlkID0gdGhpcy5pZDtcblx0XHRcdHRoaXMuX2NvbnRlbnRJZCA9IGAke3RoaXMuaWR9LWNvbnRlbnRgO1xuXHRcdH1cblx0XHQvLyBpZiBkaXNwbGF5TW9kZSA9PT0gdHJ1ZSAtPiBfZWRpdGFibGUgPSBmYWxzZVxuXHRcdC8vIGlmIGRpc3BsYXlNb2RlID09PSBmYWxzZSAtPiBfZWRpdGFibGUgPSB0cnVlXG5cdFx0Ly8gID0+IGlmIGRpc3BsYXlNb2RlID09PSB7bXlCaW5kaW5nVmFsdWV9IC0+IF9lZGl0YWJsZSA9IHtteUJpbmRpbmdWYWx1ZX0gPT09IHRydWUgPyB0cnVlIDogZmFsc2Vcblx0XHQvLyBpZiBEaXNwbGF5TW9kZSA9PT0gdW5kZWZpbmVkIC0+IF9lZGl0YWJsZSA9IHt1aT4vaXNFZGl0YWJsZX1cblx0XHRpZiAodGhpcy5kaXNwbGF5TW9kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLl9lZGl0YWJsZSA9IGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShlcXVhbChyZXNvbHZlQmluZGluZ1N0cmluZyh0aGlzLmRpc3BsYXlNb2RlLCBcImJvb2xlYW5cIiksIGZhbHNlKSwgdHJ1ZSwgZmFsc2UpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fZWRpdGFibGUgPSBjb21waWxlRXhwcmVzc2lvbihVSS5Jc0VkaXRhYmxlKTtcblx0XHR9XG5cdH1cblxuXHRnZXREYXRhRmllbGRDb2xsZWN0aW9uKGZvcm1Db250YWluZXI6IEZvcm1Db250YWluZXIsIGZhY2V0Q29udGV4dDogQ29udGV4dCkge1xuXHRcdGNvbnN0IGZhY2V0ID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKGZhY2V0Q29udGV4dCkudGFyZ2V0T2JqZWN0IGFzIEZhY2V0VHlwZXM7XG5cdFx0bGV0IG5hdmlnYXRpb25QYXRoO1xuXHRcdGxldCBpZFBhcnQ7XG5cdFx0aWYgKGZhY2V0LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldCkge1xuXHRcdFx0bmF2aWdhdGlvblBhdGggPSBBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKGZhY2V0LlRhcmdldC52YWx1ZSk7XG5cdFx0XHRpZFBhcnQgPSBmYWNldDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhdGhQYXRoID0gdGhpcy5jb250ZXh0UGF0aC5nZXRQYXRoKCk7XG5cdFx0XHRsZXQgZmFjZXRQYXRoID0gZmFjZXRDb250ZXh0LmdldFBhdGgoKTtcblx0XHRcdGlmIChmYWNldFBhdGguc3RhcnRzV2l0aChjb250ZXh0UGF0aFBhdGgpKSB7XG5cdFx0XHRcdGZhY2V0UGF0aCA9IGZhY2V0UGF0aC5zdWJzdHJpbmcoY29udGV4dFBhdGhQYXRoLmxlbmd0aCk7XG5cdFx0XHR9XG5cdFx0XHRuYXZpZ2F0aW9uUGF0aCA9IEFubm90YXRpb25IZWxwZXIuZ2V0TmF2aWdhdGlvblBhdGgoZmFjZXRQYXRoKTtcblx0XHRcdGlkUGFydCA9IGZhY2V0UGF0aDtcblx0XHR9XG5cdFx0Y29uc3QgdGl0bGVMZXZlbCA9IEZvcm1IZWxwZXIuZ2V0Rm9ybUNvbnRhaW5lclRpdGxlTGV2ZWwodGhpcy50aXRsZSwgdGhpcy50aXRsZUxldmVsKTtcblx0XHRjb25zdCB0aXRsZSA9IHRoaXMudXNlRm9ybUNvbnRhaW5lckxhYmVscyAmJiBmYWNldCA/IChBbm5vdGF0aW9uSGVscGVyLmxhYmVsKGZhY2V0LCB7IGNvbnRleHQ6IGZhY2V0Q29udGV4dCB9KSBhcyBzdHJpbmcpIDogXCJcIjtcblx0XHRjb25zdCBpZCA9IHRoaXMuaWQgPyBnZXRGb3JtQ29udGFpbmVySUQoaWRQYXJ0KSA6IHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiB4bWxgXG5cdFx0XHRcdFx0PG1hY3JvOkZvcm1Db250YWluZXJcblx0XHRcdFx0XHR4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3NcIlxuXHRcdFx0XHRcdCR7dGhpcy5hdHRyKFwiaWRcIiwgaWQpfVxuXHRcdFx0XHRcdHRpdGxlPVwiJHt0aXRsZX1cIlxuXHRcdFx0XHRcdHRpdGxlTGV2ZWw9XCIke3RpdGxlTGV2ZWx9XCJcblx0XHRcdFx0XHRjb250ZXh0UGF0aD1cIiR7bmF2aWdhdGlvblBhdGggPyBmb3JtQ29udGFpbmVyLmVudGl0eVNldCA6IHRoaXMuY29udGV4dFBhdGh9XCJcblx0XHRcdFx0XHRtZXRhUGF0aD1cIiR7ZmFjZXRDb250ZXh0fVwiXG5cdFx0XHRcdFx0ZGF0YUZpZWxkQ29sbGVjdGlvbj1cIiR7Zm9ybUNvbnRhaW5lci5mb3JtRWxlbWVudHN9XCJcblx0XHRcdFx0XHRuYXZpZ2F0aW9uUGF0aD1cIiR7bmF2aWdhdGlvblBhdGh9XCJcblx0XHRcdFx0XHR2aXNpYmxlPVwiJHtmb3JtQ29udGFpbmVyLmlzVmlzaWJsZX1cIlxuXHRcdFx0XHRcdGRpc3BsYXlNb2RlPVwiJHt0aGlzLmRpc3BsYXlNb2RlfVwiXG5cdFx0XHRcdFx0b25DaGFuZ2U9XCIke3RoaXMub25DaGFuZ2V9XCJcblx0XHRcdFx0XHRhY3Rpb25zPVwiJHtmb3JtQ29udGFpbmVyLmFjdGlvbnN9XCJcblx0XHRcdFx0PlxuXHRcdFx0XHQ8bWFjcm86Zm9ybUVsZW1lbnRzPlxuXHRcdFx0XHRcdDxzbG90IG5hbWU9XCJmb3JtRWxlbWVudHNcIiAvPlxuXHRcdFx0XHQ8L21hY3JvOmZvcm1FbGVtZW50cz5cblx0XHRcdDwvbWFjcm86Rm9ybUNvbnRhaW5lcj5gO1xuXHR9XG5cblx0Z2V0Rm9ybUNvbnRhaW5lcnMoKSB7XG5cdFx0aWYgKHRoaXMuZm9ybUNvbnRhaW5lcnMhLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmZhY2V0VHlwZS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ29sbGVjdGlvbkZhY2V0XCIpID49IDApIHtcblx0XHRcdHJldHVybiB0aGlzLmZvcm1Db250YWluZXJzIS5tYXAoKGZvcm1Db250YWluZXIsIGZvcm1Db250YWluZXJJZHgpID0+IHtcblx0XHRcdFx0aWYgKGZvcm1Db250YWluZXIuaXNWaXNpYmxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmFjZXRDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGZvcm1Db250YWluZXIuYW5ub3RhdGlvblBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdFx0XHRcdGNvbnN0IGZhY2V0ID0gZmFjZXRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGZhY2V0LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldCAmJlxuXHRcdFx0XHRcdFx0Rm9ybUhlbHBlci5pc1JlZmVyZW5jZUZhY2V0UGFydE9mUHJldmlldyhmYWNldCwgdGhpcy5wYXJ0T2ZQcmV2aWV3KVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0aWYgKGZhY2V0LlRhcmdldC4kQW5ub3RhdGlvblBhdGguJFR5cGUgPT09IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVHlwZXMuQWRkcmVzc1R5cGUpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHhtbGA8dGVtcGxhdGU6d2l0aCBwYXRoPVwiZm9ybUNvbnRhaW5lcnM+JHtmb3JtQ29udGFpbmVySWR4fVwiIHZhcj1cImZvcm1Db250YWluZXJcIj5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8dGVtcGxhdGU6d2l0aCBwYXRoPVwiZm9ybUNvbnRhaW5lcnM+JHtmb3JtQ29udGFpbmVySWR4fS9hbm5vdGF0aW9uUGF0aFwiIHZhcj1cImZhY2V0XCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLmZvcm0uQWRkcmVzc1NlY3Rpb25cIiB0eXBlPVwiWE1MXCIgLz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3RlbXBsYXRlOndpdGg+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDwvdGVtcGxhdGU6d2l0aD5gO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0RGF0YUZpZWxkQ29sbGVjdGlvbihmb3JtQ29udGFpbmVyLCBmYWNldENvbnRleHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gXCJcIjtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5mYWNldFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXRcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuZm9ybUNvbnRhaW5lcnMhLm1hcCgoZm9ybUNvbnRhaW5lcikgPT4ge1xuXHRcdFx0XHRpZiAoZm9ybUNvbnRhaW5lci5pc1Zpc2libGUpIHtcblx0XHRcdFx0XHRjb25zdCBmYWNldENvbnRleHQgPSB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoZm9ybUNvbnRhaW5lci5hbm5vdGF0aW9uUGF0aCwgdGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0RGF0YUZpZWxkQ29sbGVjdGlvbihmb3JtQ29udGFpbmVyLCBmYWNldENvbnRleHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBcIlwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBwcm9wZXIgbGF5b3V0IGluZm9ybWF0aW9uIGJhc2VkIG9uIHRoZSBgbGF5b3V0YCBwcm9wZXJ0eSBkZWZpbmVkIGV4dGVybmFsbHkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBsYXlvdXQgaW5mb3JtYXRpb24gZm9yIHRoZSB4bWwuXG5cdCAqL1xuXHRnZXRMYXlvdXRJbmZvcm1hdGlvbigpIHtcblx0XHRzd2l0Y2ggKHRoaXMubGF5b3V0LnR5cGUpIHtcblx0XHRcdGNhc2UgXCJSZXNwb25zaXZlR3JpZExheW91dFwiOlxuXHRcdFx0XHRyZXR1cm4geG1sYDxmOlJlc3BvbnNpdmVHcmlkTGF5b3V0IGFkanVzdExhYmVsU3Bhbj1cIiR7dGhpcy5sYXlvdXQuYWRqdXN0TGFiZWxTcGFufVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrcG9pbnRMPVwiJHt0aGlzLmxheW91dC5icmVha3BvaW50TH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVha3BvaW50TT1cIiR7dGhpcy5sYXlvdXQuYnJlYWtwb2ludE19XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWtwb2ludFhMPVwiJHt0aGlzLmxheW91dC5icmVha3BvaW50WEx9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29sdW1uc0w9XCIke3RoaXMubGF5b3V0LmNvbHVtbnNMfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNNPVwiJHt0aGlzLmxheW91dC5jb2x1bW5zTX1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb2x1bW5zWEw9XCIke3RoaXMubGF5b3V0LmNvbHVtbnNYTH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbXB0eVNwYW5MPVwiJHt0aGlzLmxheW91dC5lbXB0eVNwYW5MfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVtcHR5U3Bhbk09XCIke3RoaXMubGF5b3V0LmVtcHR5U3Bhbk19XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZW1wdHlTcGFuUz1cIiR7dGhpcy5sYXlvdXQuZW1wdHlTcGFuU31cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbXB0eVNwYW5YTD1cIiR7dGhpcy5sYXlvdXQuZW1wdHlTcGFuWEx9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWxTcGFuTD1cIiR7dGhpcy5sYXlvdXQubGFiZWxTcGFuTH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYWJlbFNwYW5NPVwiJHt0aGlzLmxheW91dC5sYWJlbFNwYW5NfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsU3BhblM9XCIke3RoaXMubGF5b3V0LmxhYmVsU3BhblN9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWxTcGFuWEw9XCIke3RoaXMubGF5b3V0LmxhYmVsU3BhblhMfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNpbmdsZUNvbnRhaW5lckZ1bGxTaXplPVwiJHt0aGlzLmxheW91dC5zaW5nbGVDb250YWluZXJGdWxsU2l6ZX1cIiAvPmA7XG5cdFx0XHRjYXNlIFwiQ29sdW1uTGF5b3V0XCI6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4geG1sYDxmOkNvbHVtbkxheW91dFxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNNPVwiJHt0aGlzLmxheW91dC5jb2x1bW5zTX1cIlxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNMPVwiJHt0aGlzLmxheW91dC5jb2x1bW5zTH1cIlxuXHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNYTD1cIiR7dGhpcy5sYXlvdXQuY29sdW1uc1hMfVwiXG5cdFx0XHRcdFx0XHRcdFx0bGFiZWxDZWxsc0xhcmdlPVwiJHt0aGlzLmxheW91dC5sYWJlbENlbGxzTGFyZ2V9XCJcblx0XHRcdFx0XHRcdFx0XHRlbXB0eUNlbGxzTGFyZ2U9XCIke3RoaXMubGF5b3V0LmVtcHR5Q2VsbHNMYXJnZX1cIiAvPmA7XG5cdFx0fVxuXHR9XG5cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0Y29uc3Qgb25DaGFuZ2VTdHIgPSAodGhpcy5vbkNoYW5nZSAmJiB0aGlzLm9uQ2hhbmdlLnJlcGxhY2UoXCJ7XCIsIFwiXFxcXHtcIikucmVwbGFjZShcIn1cIiwgXCJcXFxcfVwiKSkgfHwgXCJcIjtcblx0XHRjb25zdCBtZXRhUGF0aFBhdGggPSB0aGlzLm1ldGFQYXRoLmdldFBhdGgoKTtcblx0XHRjb25zdCBjb250ZXh0UGF0aFBhdGggPSB0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKTtcblx0XHRpZiAoIXRoaXMuaXNWaXNpYmxlKSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGA8bWFjcm86Rm9ybUFQSSB4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3MuZm9ybVwiXG5cdFx0XHRcdFx0eG1sbnM6bWFjcm9kYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0XHRcdFx0eG1sbnM6Zj1cInNhcC51aS5sYXlvdXQuZm9ybVwiXG5cdFx0XHRcdFx0eG1sbnM6Zmw9XCJzYXAudWkuZmxcIlxuXHRcdFx0XHRcdGlkPVwiJHt0aGlzLl9hcGlJZH1cIlxuXHRcdFx0XHRcdG1ldGFQYXRoPVwiJHttZXRhUGF0aFBhdGh9XCJcblx0XHRcdFx0XHRjb250ZXh0UGF0aD1cIiR7Y29udGV4dFBhdGhQYXRofVwiPlxuXHRcdFx0XHQ8ZjpGb3JtXG5cdFx0XHRcdFx0Zmw6ZGVsZWdhdGU9J3tcblx0XHRcdFx0XHRcdFwibmFtZVwiOiBcInNhcC9mZS9tYWNyb3MvZm9ybS9Gb3JtRGVsZWdhdGVcIixcblx0XHRcdFx0XHRcdFwiZGVsZWdhdGVUeXBlXCI6IFwiY29tcGxldGVcIlxuXHRcdFx0XHRcdH0nXG5cdFx0XHRcdFx0aWQ9XCIke3RoaXMuX2NvbnRlbnRJZH1cIlxuXHRcdFx0XHRcdGVkaXRhYmxlPVwiJHt0aGlzLl9lZGl0YWJsZX1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTplbnRpdHlTZXQ9XCJ7Y29udGV4dFBhdGg+QHNhcHVpLm5hbWV9XCJcblx0XHRcdFx0XHR2aXNpYmxlPVwiJHt0aGlzLmlzVmlzaWJsZX1cIlxuXHRcdFx0XHRcdGNsYXNzPVwic2FwVXhBUE9iamVjdFBhZ2VTdWJTZWN0aW9uQWxpZ25Db250ZW50XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6bmF2aWdhdGlvblBhdGg9XCIke2NvbnRleHRQYXRoUGF0aH1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTpvbkNoYW5nZT1cIiR7b25DaGFuZ2VTdHJ9XCJcblx0XHRcdFx0PlxuXHRcdFx0XHRcdCR7dGhpcy5hZGRDb25kaXRpb25hbGx5KFxuXHRcdFx0XHRcdFx0dGhpcy50aXRsZSAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0eG1sYDxmOnRpdGxlPlxuXHRcdFx0XHRcdFx0XHQ8Y29yZTpUaXRsZSBsZXZlbD1cIiR7dGhpcy50aXRsZUxldmVsfVwiIHRleHQ9XCIke3RoaXMudGl0bGV9XCIgLz5cblx0XHRcdFx0XHRcdDwvZjp0aXRsZT5gXG5cdFx0XHRcdFx0KX1cblx0XHRcdFx0XHQ8ZjpsYXlvdXQ+XG5cdFx0XHRcdFx0JHt0aGlzLmdldExheW91dEluZm9ybWF0aW9uKCl9XG5cblx0XHRcdFx0XHQ8L2Y6bGF5b3V0PlxuXHRcdFx0XHRcdDxmOmZvcm1Db250YWluZXJzPlxuXHRcdFx0XHRcdFx0JHt0aGlzLmdldEZvcm1Db250YWluZXJzKCl9XG5cdFx0XHRcdFx0PC9mOmZvcm1Db250YWluZXJzPlxuXHRcdFx0XHQ8L2Y6Rm9ybT5cblx0XHRcdDwvbWFjcm86Rm9ybUFQST5gO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFrRHFCQSxTQUFTO0VBcEI5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBYkEsT0FjQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxNQUFNO0lBQ1pDLFNBQVMsRUFBRSx3QkFBd0I7SUFDbkNDLGVBQWUsRUFBRSxlQUFlO0lBQ2hDQyxXQUFXLEVBQUUsQ0FBQyw0QkFBNEI7RUFDM0MsQ0FBQyxDQUFDLFVBT0FDLGNBQWMsQ0FBQztJ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
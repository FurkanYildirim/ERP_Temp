/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/MetaModelConverter"], function (BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, MetaModelConverter) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var _exports = {};
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  var blockAggregation = BuildingBlockSupport.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FormElementBlock = (
  /**
   * Building block used to create a form element based on the metadata provided by OData V4.
   *
   * @public
   * @since 1.90.0
   */
  _dec = defineBuildingBlock({
    name: "FormElement",
    publicNamespace: "sap.fe.macros",
    returnTypes: ["sap.ui.layout.form.FormElement"]
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty", "Singleton", "EntityType"]
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true,
    expectedTypes: ["Property"],
    expectedAnnotationTypes: ["com.sap.vocabularies.UI.v1.DataField", "com.sap.vocabularies.UI.v1.DataFieldWithUrl", "com.sap.vocabularies.UI.v1.DataFieldForAnnotation", "com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithAction", "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath", "com.sap.vocabularies.UI.v1.DataPointType"]
  }), _dec5 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec6 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec8 = blockAggregation({
    type: "sap.ui.core.Control",
    slot: "fields",
    isPublic: true,
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormElementBlock, _BuildingBlockBase);
    /**
     * The identifier of the FormElement building block.
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
     * Label shown for the field. If not set, the label from the annotations will be shown.
     *
     * @public
     */

    /**
     * If set to false, the FormElement is not rendered.
     *
     * @public
     */

    /**
     * Optional aggregation of controls that should be displayed inside the FormElement.
     * If not set, a default Field building block will be rendered
     *
     * @public
     */

    function FormElementBlock(props, configuration, mSettings) {
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "label", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "key", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fields", _descriptor7, _assertThisInitialized(_this));
      const oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      if (_this.label === undefined) {
        var _annotations$Common, _annotations$Common$L;
        _this.label = ((_annotations$Common = oContextObjectPath.targetObject.annotations.Common) === null || _annotations$Common === void 0 ? void 0 : (_annotations$Common$L = _annotations$Common.Label) === null || _annotations$Common$L === void 0 ? void 0 : _annotations$Common$L.toString()) ?? "";
      }
      return _this;
    }
    _exports = FormElementBlock;
    var _proto = FormElementBlock.prototype;
    _proto.getFields = function getFields() {
      if (this.fields) {
        return xml`<slot name="fields" />`;
      } else {
        return xml`<macros:Field
						metaPath="${this.metaPath}"
						contextPath="${this.contextPath}"
						id="${this.createId("FormElementField")}" />`;
      }
    };
    _proto.getTemplate = function getTemplate() {
      return xml`<f:FormElement xmlns:f="sap.ui.layout.form" id="${this.id}"
			key="${this.key}"
			label="${this.label}"
			visible="${this.visible}">
			<f:fields>
				${this.getFields()}
			</f:fields>
		</f:FormElement>`;
    };
    return FormElementBlock;
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "label", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "key", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "fields", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FormElementBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtRWxlbWVudEJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJwdWJsaWNOYW1lc3BhY2UiLCJyZXR1cm5UeXBlcyIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsImlzUHVibGljIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwiZXhwZWN0ZWRBbm5vdGF0aW9uVHlwZXMiLCJibG9ja0FnZ3JlZ2F0aW9uIiwic2xvdCIsImlzRGVmYXVsdCIsInByb3BzIiwiY29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsIm9Db250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm1ldGFQYXRoIiwiY29udGV4dFBhdGgiLCJsYWJlbCIsInVuZGVmaW5lZCIsInRhcmdldE9iamVjdCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiTGFiZWwiLCJ0b1N0cmluZyIsImdldEZpZWxkcyIsImZpZWxkcyIsInhtbCIsImNyZWF0ZUlkIiwiZ2V0VGVtcGxhdGUiLCJpZCIsImtleSIsInZpc2libGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRm9ybUVsZW1lbnQuYmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBTZXJ2aWNlT2JqZWN0IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0FnZ3JlZ2F0aW9uLCBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayB1c2VkIHRvIGNyZWF0ZSBhIGZvcm0gZWxlbWVudCBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKlxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuOTAuMFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiRm9ybUVsZW1lbnRcIixcblx0cHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0cmV0dXJuVHlwZXM6IFtcInNhcC51aS5sYXlvdXQuZm9ybS5Gb3JtRWxlbWVudFwiXVxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcm1FbGVtZW50QmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBUaGUgaWRlbnRpZmllciBvZiB0aGUgRm9ybUVsZW1lbnQgYnVpbGRpbmcgYmxvY2suXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcGF0aCBvZiB0aGUgY29udGV4dCB1c2VkIGluIHRoZSBjdXJyZW50IHBhZ2Ugb3IgYmxvY2suXG5cdCAqIFRoaXMgc2V0dGluZyBpcyBkZWZpbmVkIGJ5IHRoZSBmcmFtZXdvcmsuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLCBcIlNpbmdsZXRvblwiLCBcIkVudGl0eVR5cGVcIl1cblx0fSlcblx0Y29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbWV0YW1vZGVsLCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZXh0UGF0aC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0aXNQdWJsaWM6IHRydWUsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiUHJvcGVydHlcIl0sXG5cdFx0ZXhwZWN0ZWRBbm5vdGF0aW9uVHlwZXM6IFtcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhVcmxcIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCIsXG5cdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb25cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvblwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZVwiXG5cdFx0XVxuXHR9KVxuXHRtZXRhUGF0aCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIExhYmVsIHNob3duIGZvciB0aGUgZmllbGQuIElmIG5vdCBzZXQsIHRoZSBsYWJlbCBmcm9tIHRoZSBhbm5vdGF0aW9ucyB3aWxsIGJlIHNob3duLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSB9KVxuXHRsYWJlbD86IHN0cmluZztcblxuXHQvKipcblx0ICogSWYgc2V0IHRvIGZhbHNlLCB0aGUgRm9ybUVsZW1lbnQgaXMgbm90IHJlbmRlcmVkLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0dmlzaWJsZT86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0a2V5Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBPcHRpb25hbCBhZ2dyZWdhdGlvbiBvZiBjb250cm9scyB0aGF0IHNob3VsZCBiZSBkaXNwbGF5ZWQgaW5zaWRlIHRoZSBGb3JtRWxlbWVudC5cblx0ICogSWYgbm90IHNldCwgYSBkZWZhdWx0IEZpZWxkIGJ1aWxkaW5nIGJsb2NrIHdpbGwgYmUgcmVuZGVyZWRcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGJsb2NrQWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgc2xvdDogXCJmaWVsZHNcIiwgaXNQdWJsaWM6IHRydWUsIGlzRGVmYXVsdDogdHJ1ZSB9KVxuXHRmaWVsZHM/OiBDb250cm9sW107XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxGb3JtRWxlbWVudEJsb2NrPiwgY29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdHN1cGVyKHByb3BzLCBjb25maWd1cmF0aW9uLCBtU2V0dGluZ3MpO1xuXHRcdGNvbnN0IG9Db250ZXh0T2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRpZiAodGhpcy5sYWJlbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLmxhYmVsID0gKG9Db250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QgYXMgU2VydmljZU9iamVjdCkuYW5ub3RhdGlvbnMuQ29tbW9uPy5MYWJlbD8udG9TdHJpbmcoKSA/PyBcIlwiO1xuXHRcdH1cblx0fVxuXG5cdGdldEZpZWxkcygpIHtcblx0XHRpZiAodGhpcy5maWVsZHMpIHtcblx0XHRcdHJldHVybiB4bWxgPHNsb3QgbmFtZT1cImZpZWxkc1wiIC8+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGA8bWFjcm9zOkZpZWxkXG5cdFx0XHRcdFx0XHRtZXRhUGF0aD1cIiR7dGhpcy5tZXRhUGF0aH1cIlxuXHRcdFx0XHRcdFx0Y29udGV4dFBhdGg9XCIke3RoaXMuY29udGV4dFBhdGh9XCJcblx0XHRcdFx0XHRcdGlkPVwiJHt0aGlzLmNyZWF0ZUlkKFwiRm9ybUVsZW1lbnRGaWVsZFwiKX1cIiAvPmA7XG5cdFx0fVxuXHR9XG5cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0cmV0dXJuIHhtbGA8ZjpGb3JtRWxlbWVudCB4bWxuczpmPVwic2FwLnVpLmxheW91dC5mb3JtXCIgaWQ9XCIke3RoaXMuaWR9XCJcblx0XHRcdGtleT1cIiR7dGhpcy5rZXl9XCJcblx0XHRcdGxhYmVsPVwiJHt0aGlzLmxhYmVsfVwiXG5cdFx0XHR2aXNpYmxlPVwiJHt0aGlzLnZpc2libGV9XCI+XG5cdFx0XHQ8ZjpmaWVsZHM+XG5cdFx0XHRcdCR7dGhpcy5nZXRGaWVsZHMoKX1cblx0XHRcdDwvZjpmaWVsZHM+XG5cdFx0PC9mOkZvcm1FbGVtZW50PmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFvQnFCQSxnQkFBZ0I7RUFYckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsT0FNQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxhQUFhO0lBQ25CQyxlQUFlLEVBQUUsZUFBZTtJQUNoQ0MsV0FBVyxFQUFFLENBQUMsZ0NBQWdDO0VBQy9DLENBQUMsQ0FBQyxVQU9BQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFLElBQUk7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBU2xFSCxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFLElBQUk7SUFDZEMsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLG9CQUFvQixFQUFFLFdBQVcsRUFBRSxZQUFZO0VBQzdFLENBQUMsQ0FBQyxVQVFESixjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFLElBQUk7SUFDZEMsYUFBYSxFQUFFLENBQUMsVUFBVSxDQUFDO0lBQzNCQyx1QkFBdUIsRUFBRSxDQUN4QixzQ0FBc0MsRUFDdEMsNkNBQTZDLEVBQzdDLG1E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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/TypeGuards"], function (BuildingBlockBase, BuildingBlockSupport, MetaModelConverter, ModelHelper, TypeGuards) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var _exports = {};
  var isEntitySet = TypeGuards.isEntitySet;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ValueHelpBlock = (
  /**
   * Building block for creating a ValueHelp based on the provided OData V4 metadata.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:ValueHelp
   *   idPrefix="SomePrefix"
   *   property="{someProperty&gt;}"
   *   conditionModel="$filters"
   * /&gt;
   * </pre>
   *
   * @private
   */
  _dec = defineBuildingBlock({
    name: "ValueHelp",
    namespace: "sap.fe.macros",
    fragment: "sap.fe.macros.internal.valuehelp.ValueHelp"
  }), _dec2 = blockAttribute({
    type: "string"
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["Property"]
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "boolean"
  }), _dec7 = blockAttribute({
    type: "boolean"
  }), _dec8 = blockAttribute({
    type: "boolean"
  }), _dec9 = blockAttribute({
    type: "string"
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ValueHelpBlock, _BuildingBlockBase);
    /**
     * A prefix that is added to the generated ID of the value help.
     */

    /**
     * Defines the metadata path to the property.
     */

    /**
     * Indicator whether the value help is for a filter field.
     */

    /**
     * Indicates that this is a value help of a filter field. Necessary to decide if a
     * validation should occur on the back end or already on the client.
     */

    /**
     * Specifies the Sematic Date Range option for the filter field.
     */

    /**
     * Specifies whether the ValueHelp can be used with a MultiValueField
     */

    function ValueHelpBlock(props, _controlConfiguration, settings) {
      var _this;
      _this = _BuildingBlockBase.call(this, props) || this;
      _initializerDefineProperty(_this, "idPrefix", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "property", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "conditionModel", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterFieldValueHelp", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useSemanticDateRange", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useMultiValueField", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPrefix", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "requiresValidation", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_flexId", _descriptor10, _assertThisInitialized(_this));
      _this.requestGroupId = "$auto.Workers";
      _this.collaborationEnabled = false;
      const contextObject = getInvolvedDataModelObjects(_this.contextPath);
      const entitySetOrSingleton = contextObject.targetEntitySet;
      if (isEntitySet(entitySetOrSingleton)) {
        _this.collaborationEnabled = ModelHelper.isCollaborationDraftSupported(settings.models.metaModel);
      }
      return _this;
    }
    _exports = ValueHelpBlock;
    return ValueHelpBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "idPrefix", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "ValueHelp";
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "property", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "conditionModel", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "filterFieldValueHelp", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "useSemanticDateRange", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "useMultiValueField", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "navigationPrefix", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "requiresValidation", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "_flexId", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ValueHelpBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUhlbHBCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsImV4cGVjdGVkVHlwZXMiLCJwcm9wcyIsIl9jb250cm9sQ29uZmlndXJhdGlvbiIsInNldHRpbmdzIiwicmVxdWVzdEdyb3VwSWQiLCJjb2xsYWJvcmF0aW9uRW5hYmxlZCIsImNvbnRleHRPYmplY3QiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJjb250ZXh0UGF0aCIsImVudGl0eVNldE9yU2luZ2xldG9uIiwidGFyZ2V0RW50aXR5U2V0IiwiaXNFbnRpdHlTZXQiLCJNb2RlbEhlbHBlciIsImlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwibW9kZWxzIiwibWV0YU1vZGVsIiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZhbHVlSGVscC5ibG9jay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQnVpbGRpbmdCbG9ja0Jhc2UgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tCYXNlXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgeyBUZW1wbGF0ZVByb2Nlc3NvclNldHRpbmdzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBpc0VudGl0eVNldCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5cbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgVmFsdWVIZWxwIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBPRGF0YSBWNCBtZXRhZGF0YS5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86VmFsdWVIZWxwXG4gKiAgIGlkUHJlZml4PVwiU29tZVByZWZpeFwiXG4gKiAgIHByb3BlcnR5PVwie3NvbWVQcm9wZXJ0eSZndDt9XCJcbiAqICAgY29uZGl0aW9uTW9kZWw9XCIkZmlsdGVyc1wiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQHByaXZhdGVcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soeyBuYW1lOiBcIlZhbHVlSGVscFwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiLCBmcmFnbWVudDogXCJzYXAuZmUubWFjcm9zLmludGVybmFsLnZhbHVlaGVscC5WYWx1ZUhlbHBcIiB9KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmFsdWVIZWxwQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdC8qKlxuXHQgKiBBIHByZWZpeCB0aGF0IGlzIGFkZGVkIHRvIHRoZSBnZW5lcmF0ZWQgSUQgb2YgdGhlIHZhbHVlIGhlbHAuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkUHJlZml4ID0gXCJWYWx1ZUhlbHBcIjtcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgbWV0YWRhdGEgcGF0aCB0byB0aGUgcHJvcGVydHkuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsIHJlcXVpcmVkOiB0cnVlLCBleHBlY3RlZFR5cGVzOiBbXCJQcm9wZXJ0eVwiXSB9KVxuXHRwcm9wZXJ0eSE6IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRjb250ZXh0UGF0aCE6IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIEluZGljYXRvciB3aGV0aGVyIHRoZSB2YWx1ZSBoZWxwIGlzIGZvciBhIGZpbHRlciBmaWVsZC5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0Y29uZGl0aW9uTW9kZWwgPSBcIlwiO1xuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgdGhhdCB0aGlzIGlzIGEgdmFsdWUgaGVscCBvZiBhIGZpbHRlciBmaWVsZC4gTmVjZXNzYXJ5IHRvIGRlY2lkZSBpZiBhXG5cdCAqIHZhbGlkYXRpb24gc2hvdWxkIG9jY3VyIG9uIHRoZSBiYWNrIGVuZCBvciBhbHJlYWR5IG9uIHRoZSBjbGllbnQuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRmaWx0ZXJGaWVsZFZhbHVlSGVscCA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgdGhlIFNlbWF0aWMgRGF0ZSBSYW5nZSBvcHRpb24gZm9yIHRoZSBmaWx0ZXIgZmllbGQuXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHR1c2VTZW1hbnRpY0RhdGVSYW5nZSA9IHRydWU7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBWYWx1ZUhlbHAgY2FuIGJlIHVzZWQgd2l0aCBhIE11bHRpVmFsdWVGaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0dXNlTXVsdGlWYWx1ZUZpZWxkID0gZmFsc2U7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRuYXZpZ2F0aW9uUHJlZml4Pzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdHJlcXVpcmVzVmFsaWRhdGlvbiA9IGZhbHNlO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuXHRfZmxleElkPzogc3RyaW5nO1xuXG5cdHJlcXVlc3RHcm91cElkID0gXCIkYXV0by5Xb3JrZXJzXCI7XG5cblx0Y29sbGFib3JhdGlvbkVuYWJsZWQgPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPFZhbHVlSGVscEJsb2NrPiwgX2NvbnRyb2xDb25maWd1cmF0aW9uOiB1bmtub3duLCBzZXR0aW5nczogVGVtcGxhdGVQcm9jZXNzb3JTZXR0aW5ncykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdGNvbnN0IGNvbnRleHRPYmplY3QgPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3QgZW50aXR5U2V0T3JTaW5nbGV0b24gPSBjb250ZXh0T2JqZWN0LnRhcmdldEVudGl0eVNldDtcblx0XHRpZiAoaXNFbnRpdHlTZXQoZW50aXR5U2V0T3JTaW5nbGV0b24pKSB7XG5cdFx0XHR0aGlzLmNvbGxhYm9yYXRpb25FbmFibGVkID0gTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQoc2V0dGluZ3MubW9kZWxzLm1ldGFNb2RlbCk7XG5cdFx0fVxuXHR9XG59XG4i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
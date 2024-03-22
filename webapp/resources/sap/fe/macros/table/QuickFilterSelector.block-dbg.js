/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/FilterHelper", "sap/m/SegmentedButton", "sap/m/SegmentedButtonItem", "sap/m/Select", "sap/ui/core/InvisibleText", "sap/ui/core/Item", "sap/fe/core/jsx-runtime/jsx"], function (BuildingBlockSupport, RuntimeBuildingBlock, MetaModelConverter, BindingToolkit, StableIdHelper, DataModelPathHelper, FilterHelper, SegmentedButton, SegmentedButtonItem, Select, InvisibleText, Item, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var _exports = {};
  var isSelectionVariant = FilterHelper.isSelectionVariant;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getTargetNavigationPath = DataModelPathHelper.getTargetNavigationPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var notEqual = BindingToolkit.notEqual;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let QuickFilterSelector = (_dec = defineBuildingBlock({
    name: "QuickFilterSelector",
    namespace: "sap.fe.macros.table"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec5 = blockAttribute({
    type: "object",
    required: true
  }), _dec6 = blockAttribute({
    type: "function"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(QuickFilterSelector, _RuntimeBuildingBlock);
    function QuickFilterSelector(props) {
      var _this;
      _this = _RuntimeBuildingBlock.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterConfiguration", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onSelectionChange", _descriptor5, _assertThisInitialized(_this));
      return _this;
    }

    /**
     * Generates the selector as a SegmentedButton.
     *
     * @returns  The SegmentedButton
     */
    _exports = QuickFilterSelector;
    var _proto = QuickFilterSelector.prototype;
    _proto.getSegmentedButtonSelector = function getSegmentedButtonSelector() {
      const items = this.filterConfiguration.paths.map((path, index) => {
        return _jsx(SegmentedButtonItem, {
          ...this.getSelectorItemProperties(index)
        });
      });
      return _jsx(SegmentedButton, {
        id: this.id,
        enabled: notEqual(pathInModel("hasPendingFilters", "pageInternal"), true),
        ariaLabelledBy: [this.getSelectorAriaLabelledById()],
        items: items,
        selectionChange: event => {
          var _this$onSelectionChan;
          (_this$onSelectionChan = this.onSelectionChange) === null || _this$onSelectionChan === void 0 ? void 0 : _this$onSelectionChan.call(this, event);
        }
      });
    }

    /**
     * Generates the selector as a Select.
     *
     * @returns  The Select
     */;
    _proto.getSelectSelector = function getSelectSelector() {
      const items = this.filterConfiguration.paths.map((path, index) => {
        return _jsx(Item, {
          ...this.getSelectorItemProperties(index)
        });
      });
      return _jsx(Select, {
        id: this.id,
        enabled: notEqual(pathInModel("hasPendingFilters", "pageInternal"), true),
        ariaLabelledBy: [this.getSelectorAriaLabelledById()],
        autoAdjustWidth: true,
        items: items,
        change: event => {
          var _this$onSelectionChan2;
          (_this$onSelectionChan2 = this.onSelectionChange) === null || _this$onSelectionChan2 === void 0 ? void 0 : _this$onSelectionChan2.call(this, event);
        }
      });
    }

    /**
     * Gets the properties of the selector Item.
     *
     * @param index The index of the item into the selector
     * @returns  The properties
     */;
    _proto.getSelectorItemProperties = function getSelectorItemProperties(index) {
      return {
        key: this.filterConfiguration.paths[index].annotationPath,
        text: this.getSelectorItemText(index)
      };
    }

    /**
     * Generates the Id of the InvisibleText control.
     *
     * @returns  The Id
     */;
    _proto.getSelectorAriaLabelledById = function getSelectorAriaLabelledById() {
      return generate([this.id, "AriaText"]);
    }

    /**
     * Generates the text for the selector item.
     *
     * @param index The index of the item into the selector
     * @returns  The text
     */;
    _proto.getSelectorItemText = function getSelectorItemText(index) {
      var _selectionVariant$Tex;
      const countText = ` ({internal>quickFilters/counts/${index}})`;
      const dataTableModelPath = getInvolvedDataModelObjects(this.metaPath);
      const selectionVariant = enhanceDataModelPath(dataTableModelPath, this.filterConfiguration.paths[index].annotationPath).targetObject;
      const text = (selectionVariant === null || selectionVariant === void 0 ? void 0 : (_selectionVariant$Tex = selectionVariant.Text) === null || _selectionVariant$Tex === void 0 ? void 0 : _selectionVariant$Tex.toString()) ?? "";
      return `${text}${this.filterConfiguration.showCounts ? countText : ""}`;
    }

    /**
     * Registers the SideEffects control that must be executed when table cells that are related to configured filter(s) change.
     *
     * @param appComponent The appComponent
     */;
    _proto.registerSideEffectForQuickFilter = function registerSideEffectForQuickFilter(appComponent) {
      var _dataVisualizationMod;
      const dataVisualizationModelPath = getInvolvedDataModelObjects(this.metaPath, this.contextPath);
      const viewEntityType = (_dataVisualizationMod = dataVisualizationModelPath.contextLocation) === null || _dataVisualizationMod === void 0 ? void 0 : _dataVisualizationMod.targetEntityType.fullyQualifiedName;
      const tableNavigationPath = getTargetNavigationPath(dataVisualizationModelPath, true);
      const selectionVariantPaths = this.filterConfiguration.paths.map(info => info.annotationPath);
      if (tableNavigationPath && viewEntityType) {
        const sourceProperties = new Set();
        for (const selectionVariantPath of selectionVariantPaths) {
          const selectionVariant = enhanceDataModelPath(dataVisualizationModelPath, selectionVariantPath).targetObject; // We authorize SelectionVariant without SelectOptions even if it's not compliant with vocabularies
          if (selectionVariant.SelectOptions && isSelectionVariant(selectionVariant)) {
            selectionVariant.SelectOptions.forEach(selectOption => {
              var _selectOption$Propert;
              const propertyPath = (_selectOption$Propert = selectOption.PropertyName) === null || _selectOption$Propert === void 0 ? void 0 : _selectOption$Propert.value;
              if (propertyPath) {
                const propertyModelPath = enhanceDataModelPath(dataVisualizationModelPath, propertyPath);
                sourceProperties.add(getTargetObjectPath(propertyModelPath, true));
              }
            });
          }
        }
        appComponent.getSideEffectsService().addControlSideEffects(viewEntityType, {
          sourceProperties: Array.from(sourceProperties),
          targetEntities: [{
            $NavigationPropertyPath: tableNavigationPath
          }],
          sourceControlId: this.id
        });
      }
    }

    /**
     * Creates the invisibleText for the accessibility compliance.
     *
     * @returns  The InvisibleText
     */;
    _proto.getAccessibilityControl = function getAccessibilityControl() {
      const textBinding = `{sap.fe.i18n>M_TABLE_QUICKFILTER_ARIA}`;
      const invisibleText = _jsx(InvisibleText, {
        text: textBinding,
        id: this.getSelectorAriaLabelledById()
      });

      //Adds the invisibleText into the static, hidden area UI area container.
      invisibleText.toStatic();
      return invisibleText;
    };
    _proto.getContent = function getContent(view, appComponent) {
      if (this.filterConfiguration.showCounts) {
        this.registerSideEffectForQuickFilter(appComponent);
      }
      /**
       * The number of views defined for a table determines the UI control that lets users switch the table views:
       *  - A segmented button for a maximum of three views
       *  - A select control for four or more views.
       */
      const selector = this.filterConfiguration.paths.length > 3 ? this.getSelectSelector() : this.getSegmentedButtonSelector();
      selector.addDependent(this.getAccessibilityControl());
      return selector;
    };
    return QuickFilterSelector;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "filterConfiguration", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "onSelectionChange", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = QuickFilterSelector;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJRdWlja0ZpbHRlclNlbGVjdG9yIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJibG9ja0F0dHJpYnV0ZSIsInR5cGUiLCJyZXF1aXJlZCIsInByb3BzIiwiZ2V0U2VnbWVudGVkQnV0dG9uU2VsZWN0b3IiLCJpdGVtcyIsImZpbHRlckNvbmZpZ3VyYXRpb24iLCJwYXRocyIsIm1hcCIsInBhdGgiLCJpbmRleCIsImdldFNlbGVjdG9ySXRlbVByb3BlcnRpZXMiLCJpZCIsIm5vdEVxdWFsIiwicGF0aEluTW9kZWwiLCJnZXRTZWxlY3RvckFyaWFMYWJlbGxlZEJ5SWQiLCJldmVudCIsIm9uU2VsZWN0aW9uQ2hhbmdlIiwiZ2V0U2VsZWN0U2VsZWN0b3IiLCJrZXkiLCJhbm5vdGF0aW9uUGF0aCIsInRleHQiLCJnZXRTZWxlY3Rvckl0ZW1UZXh0IiwiZ2VuZXJhdGUiLCJjb3VudFRleHQiLCJkYXRhVGFibGVNb2RlbFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJtZXRhUGF0aCIsInNlbGVjdGlvblZhcmlhbnQiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsInRhcmdldE9iamVjdCIsIlRleHQiLCJ0b1N0cmluZyIsInNob3dDb3VudHMiLCJyZWdpc3RlclNpZGVFZmZlY3RGb3JRdWlja0ZpbHRlciIsImFwcENvbXBvbmVudCIsImRhdGFWaXN1YWxpemF0aW9uTW9kZWxQYXRoIiwiY29udGV4dFBhdGgiLCJ2aWV3RW50aXR5VHlwZSIsImNvbnRleHRMb2NhdGlvbiIsInRhcmdldEVudGl0eVR5cGUiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJ0YWJsZU5hdmlnYXRpb25QYXRoIiwiZ2V0VGFyZ2V0TmF2aWdhdGlvblBhdGgiLCJzZWxlY3Rpb25WYXJpYW50UGF0aHMiLCJpbmZvIiwic291cmNlUHJvcGVydGllcyIsIlNldCIsInNlbGVjdGlvblZhcmlhbnRQYXRoIiwiU2VsZWN0T3B0aW9ucyIsImlzU2VsZWN0aW9uVmFyaWFudCIsImZvckVhY2giLCJzZWxlY3RPcHRpb24iLCJwcm9wZXJ0eVBhdGgiLCJQcm9wZXJ0eU5hbWUiLCJ2YWx1ZSIsInByb3BlcnR5TW9kZWxQYXRoIiwiYWRkIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsImFkZENvbnRyb2xTaWRlRWZmZWN0cyIsIkFycmF5IiwiZnJvbSIsInRhcmdldEVudGl0aWVzIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJzb3VyY2VDb250cm9sSWQiLCJnZXRBY2Nlc3NpYmlsaXR5Q29udHJvbCIsInRleHRCaW5kaW5nIiwiaW52aXNpYmxlVGV4dCIsInRvU3RhdGljIiwiZ2V0Q29udGVudCIsInZpZXciLCJzZWxlY3RvciIsImxlbmd0aCIsImFkZERlcGVuZGVudCIsIlJ1bnRpbWVCdWlsZGluZ0Jsb2NrIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJRdWlja0ZpbHRlclNlbGVjdG9yLmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFNlbGVjdGlvblZhcmlhbnRUeXBlLCBTZWxlY3Rpb25WYXJpYW50VHlwZVR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgUnVudGltZUJ1aWxkaW5nQmxvY2sgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL1J1bnRpbWVCdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgdHlwZSB7IFRhYmxlRmlsdGVyc0NvbmZpZ3VyYXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgbm90RXF1YWwsIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgeyBlbmhhbmNlRGF0YU1vZGVsUGF0aCwgZ2V0VGFyZ2V0TmF2aWdhdGlvblBhdGgsIGdldFRhcmdldE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBpc1NlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9GaWx0ZXJIZWxwZXJcIjtcbmltcG9ydCBTZWdtZW50ZWRCdXR0b24gZnJvbSBcInNhcC9tL1NlZ21lbnRlZEJ1dHRvblwiO1xuaW1wb3J0IFNlZ21lbnRlZEJ1dHRvbkl0ZW0gZnJvbSBcInNhcC9tL1NlZ21lbnRlZEJ1dHRvbkl0ZW1cIjtcbmltcG9ydCBTZWxlY3QgZnJvbSBcInNhcC9tL1NlbGVjdFwiO1xuaW1wb3J0IEludmlzaWJsZVRleHQgZnJvbSBcInNhcC91aS9jb3JlL0ludmlzaWJsZVRleHRcIjtcbmltcG9ydCBJdGVtIGZyb20gXCJzYXAvdWkvY29yZS9JdGVtXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soeyBuYW1lOiBcIlF1aWNrRmlsdGVyU2VsZWN0b3JcIiwgbmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MudGFibGVcIiB9KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUXVpY2tGaWx0ZXJTZWxlY3RvciBleHRlbmRzIFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIHtcblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiB0cnVlXG5cdH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0bWV0YVBhdGghOiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0Y29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwib2JqZWN0XCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdGZpbHRlckNvbmZpZ3VyYXRpb24hOiBUYWJsZUZpbHRlcnNDb25maWd1cmF0aW9uO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiZnVuY3Rpb25cIiB9KVxuXHRvblNlbGVjdGlvbkNoYW5nZT86IEZ1bmN0aW9uO1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8UXVpY2tGaWx0ZXJTZWxlY3Rvcj4pIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cdH1cblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBzZWxlY3RvciBhcyBhIFNlZ21lbnRlZEJ1dHRvbi5cblx0ICpcblx0ICogQHJldHVybnMgIFRoZSBTZWdtZW50ZWRCdXR0b25cblx0ICovXG5cdHByaXZhdGUgZ2V0U2VnbWVudGVkQnV0dG9uU2VsZWN0b3IoKTogU2VnbWVudGVkQnV0dG9uIHtcblx0XHRjb25zdCBpdGVtcyA9IHRoaXMuZmlsdGVyQ29uZmlndXJhdGlvbi5wYXRocy5tYXAoKHBhdGgsIGluZGV4KSA9PiB7XG5cdFx0XHRyZXR1cm4gKDxTZWdtZW50ZWRCdXR0b25JdGVtIHsuLi50aGlzLmdldFNlbGVjdG9ySXRlbVByb3BlcnRpZXMoaW5kZXgpfSAvPikgYXMgU2VnbWVudGVkQnV0dG9uSXRlbTtcblx0XHR9KTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PFNlZ21lbnRlZEJ1dHRvblxuXHRcdFx0XHRpZD17dGhpcy5pZH1cblx0XHRcdFx0ZW5hYmxlZD17bm90RXF1YWwocGF0aEluTW9kZWwoXCJoYXNQZW5kaW5nRmlsdGVyc1wiLCBcInBhZ2VJbnRlcm5hbFwiKSwgdHJ1ZSl9XG5cdFx0XHRcdGFyaWFMYWJlbGxlZEJ5PXtbdGhpcy5nZXRTZWxlY3RvckFyaWFMYWJlbGxlZEJ5SWQoKV19XG5cdFx0XHRcdGl0ZW1zPXtpdGVtc31cblx0XHRcdFx0c2VsZWN0aW9uQ2hhbmdlPXsoZXZlbnQpID0+IHtcblx0XHRcdFx0XHR0aGlzLm9uU2VsZWN0aW9uQ2hhbmdlPy4oZXZlbnQpO1xuXHRcdFx0XHR9fVxuXHRcdFx0Lz5cblx0XHQpIGFzIFNlZ21lbnRlZEJ1dHRvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIHNlbGVjdG9yIGFzIGEgU2VsZWN0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyAgVGhlIFNlbGVjdFxuXHQgKi9cblx0cHJpdmF0ZSBnZXRTZWxlY3RTZWxlY3RvcigpOiBTZWxlY3Qge1xuXHRcdGNvbnN0IGl0ZW1zID0gdGhpcy5maWx0ZXJDb25maWd1cmF0aW9uLnBhdGhzLm1hcCgocGF0aCwgaW5kZXgpID0+IHtcblx0XHRcdHJldHVybiAoPEl0ZW0gey4uLnRoaXMuZ2V0U2VsZWN0b3JJdGVtUHJvcGVydGllcyhpbmRleCl9IC8+KSBhcyBJdGVtO1xuXHRcdH0pO1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8U2VsZWN0XG5cdFx0XHRcdGlkPXt0aGlzLmlkfVxuXHRcdFx0XHRlbmFibGVkPXtub3RFcXVhbChwYXRoSW5Nb2RlbChcImhhc1BlbmRpbmdGaWx0ZXJzXCIsIFwicGFnZUludGVybmFsXCIpLCB0cnVlKX1cblx0XHRcdFx0YXJpYUxhYmVsbGVkQnk9e1t0aGlzLmdldFNlbGVjdG9yQXJpYUxhYmVsbGVkQnlJZCgpXX1cblx0XHRcdFx0YXV0b0FkanVzdFdpZHRoPXt0cnVlfVxuXHRcdFx0XHRpdGVtcz17aXRlbXN9XG5cdFx0XHRcdGNoYW5nZT17KGV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5vblNlbGVjdGlvbkNoYW5nZT8uKGV2ZW50KTtcblx0XHRcdFx0fX1cblx0XHRcdC8+XG5cdFx0KSBhcyBTZWxlY3Q7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgcHJvcGVydGllcyBvZiB0aGUgc2VsZWN0b3IgSXRlbS5cblx0ICpcblx0ICogQHBhcmFtIGluZGV4IFRoZSBpbmRleCBvZiB0aGUgaXRlbSBpbnRvIHRoZSBzZWxlY3RvclxuXHQgKiBAcmV0dXJucyAgVGhlIHByb3BlcnRpZXNcblx0ICovXG5cdHByaXZhdGUgZ2V0U2VsZWN0b3JJdGVtUHJvcGVydGllcyhpbmRleDogbnVtYmVyKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGtleTogdGhpcy5maWx0ZXJDb25maWd1cmF0aW9uLnBhdGhzW2luZGV4XS5hbm5vdGF0aW9uUGF0aCxcblx0XHRcdHRleHQ6IHRoaXMuZ2V0U2VsZWN0b3JJdGVtVGV4dChpbmRleClcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlcyB0aGUgSWQgb2YgdGhlIEludmlzaWJsZVRleHQgY29udHJvbC5cblx0ICpcblx0ICogQHJldHVybnMgIFRoZSBJZFxuXHQgKi9cblx0cHJpdmF0ZSBnZXRTZWxlY3RvckFyaWFMYWJlbGxlZEJ5SWQoKSB7XG5cdFx0cmV0dXJuIGdlbmVyYXRlKFt0aGlzLmlkLCBcIkFyaWFUZXh0XCJdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZW5lcmF0ZXMgdGhlIHRleHQgZm9yIHRoZSBzZWxlY3RvciBpdGVtLlxuXHQgKlxuXHQgKiBAcGFyYW0gaW5kZXggVGhlIGluZGV4IG9mIHRoZSBpdGVtIGludG8gdGhlIHNlbGVjdG9yXG5cdCAqIEByZXR1cm5zICBUaGUgdGV4dFxuXHQgKi9cblx0cHJpdmF0ZSBnZXRTZWxlY3Rvckl0ZW1UZXh0KGluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGNvdW50VGV4dCA9IGAgKHtpbnRlcm5hbD5xdWlja0ZpbHRlcnMvY291bnRzLyR7aW5kZXh9fSlgO1xuXHRcdGNvbnN0IGRhdGFUYWJsZU1vZGVsUGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCBzZWxlY3Rpb25WYXJpYW50ID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZGF0YVRhYmxlTW9kZWxQYXRoLCB0aGlzLmZpbHRlckNvbmZpZ3VyYXRpb24ucGF0aHNbaW5kZXhdLmFubm90YXRpb25QYXRoKVxuXHRcdFx0LnRhcmdldE9iamVjdCBhcyBTZWxlY3Rpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZDtcblx0XHRjb25zdCB0ZXh0ID0gc2VsZWN0aW9uVmFyaWFudD8uVGV4dD8udG9TdHJpbmcoKSA/PyBcIlwiO1xuXHRcdHJldHVybiBgJHt0ZXh0fSR7dGhpcy5maWx0ZXJDb25maWd1cmF0aW9uLnNob3dDb3VudHMgPyBjb3VudFRleHQgOiBcIlwifWA7XG5cdH1cblxuXHQvKipcblx0ICogUmVnaXN0ZXJzIHRoZSBTaWRlRWZmZWN0cyBjb250cm9sIHRoYXQgbXVzdCBiZSBleGVjdXRlZCB3aGVuIHRhYmxlIGNlbGxzIHRoYXQgYXJlIHJlbGF0ZWQgdG8gY29uZmlndXJlZCBmaWx0ZXIocykgY2hhbmdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBhcHBDb21wb25lbnRcblx0ICovXG5cdHByaXZhdGUgcmVnaXN0ZXJTaWRlRWZmZWN0Rm9yUXVpY2tGaWx0ZXIoYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBkYXRhVmlzdWFsaXphdGlvbk1vZGVsUGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCB2aWV3RW50aXR5VHlwZSA9IGRhdGFWaXN1YWxpemF0aW9uTW9kZWxQYXRoLmNvbnRleHRMb2NhdGlvbj8udGFyZ2V0RW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWU7XG5cdFx0Y29uc3QgdGFibGVOYXZpZ2F0aW9uUGF0aCA9IGdldFRhcmdldE5hdmlnYXRpb25QYXRoKGRhdGFWaXN1YWxpemF0aW9uTW9kZWxQYXRoLCB0cnVlKTtcblx0XHRjb25zdCBzZWxlY3Rpb25WYXJpYW50UGF0aHMgPSB0aGlzLmZpbHRlckNvbmZpZ3VyYXRpb24ucGF0aHMubWFwKChpbmZvKSA9PiBpbmZvLmFubm90YXRpb25QYXRoKTtcblxuXHRcdGlmICh0YWJsZU5hdmlnYXRpb25QYXRoICYmIHZpZXdFbnRpdHlUeXBlKSB7XG5cdFx0XHRjb25zdCBzb3VyY2VQcm9wZXJ0aWVzOiBTZXQ8c3RyaW5nPiA9IG5ldyBTZXQoKTtcblx0XHRcdGZvciAoY29uc3Qgc2VsZWN0aW9uVmFyaWFudFBhdGggb2Ygc2VsZWN0aW9uVmFyaWFudFBhdGhzKSB7XG5cdFx0XHRcdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhVmlzdWFsaXphdGlvbk1vZGVsUGF0aCwgc2VsZWN0aW9uVmFyaWFudFBhdGgpXG5cdFx0XHRcdFx0LnRhcmdldE9iamVjdCBhcyBQYXJ0aWFsPFNlbGVjdGlvblZhcmlhbnRUeXBlVHlwZXM+OyAvLyBXZSBhdXRob3JpemUgU2VsZWN0aW9uVmFyaWFudCB3aXRob3V0IFNlbGVjdE9wdGlvbnMgZXZlbiBpZiBpdCdzIG5vdCBjb21wbGlhbnQgd2l0aCB2b2NhYnVsYXJpZXNcblx0XHRcdFx0aWYgKHNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucyAmJiBpc1NlbGVjdGlvblZhcmlhbnQoc2VsZWN0aW9uVmFyaWFudCkpIHtcblx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMuZm9yRWFjaCgoc2VsZWN0T3B0aW9uKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lPy52YWx1ZTtcblx0XHRcdFx0XHRcdGlmIChwcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgcHJvcGVydHlNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhVmlzdWFsaXphdGlvbk1vZGVsUGF0aCwgcHJvcGVydHlQYXRoKTtcblx0XHRcdFx0XHRcdFx0c291cmNlUHJvcGVydGllcy5hZGQoZ2V0VGFyZ2V0T2JqZWN0UGF0aChwcm9wZXJ0eU1vZGVsUGF0aCwgdHJ1ZSkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRhcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCkuYWRkQ29udHJvbFNpZGVFZmZlY3RzKHZpZXdFbnRpdHlUeXBlLCB7XG5cdFx0XHRcdHNvdXJjZVByb3BlcnRpZXM6IEFycmF5LmZyb20oc291cmNlUHJvcGVydGllcyksXG5cdFx0XHRcdHRhcmdldEVudGl0aWVzOiBbXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0JE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHRhYmxlTmF2aWdhdGlvblBhdGhcblx0XHRcdFx0XHR9XG5cdFx0XHRcdF0sXG5cdFx0XHRcdHNvdXJjZUNvbnRyb2xJZDogdGhpcy5pZFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgdGhlIGludmlzaWJsZVRleHQgZm9yIHRoZSBhY2Nlc3NpYmlsaXR5IGNvbXBsaWFuY2UuXG5cdCAqXG5cdCAqIEByZXR1cm5zICBUaGUgSW52aXNpYmxlVGV4dFxuXHQgKi9cblx0cHJpdmF0ZSBnZXRBY2Nlc3NpYmlsaXR5Q29udHJvbCgpIHtcblx0XHRjb25zdCB0ZXh0QmluZGluZyA9IGB7c2FwLmZlLmkxOG4+TV9UQUJMRV9RVUlDS0ZJTFRFUl9BUklBfWA7XG5cdFx0Y29uc3QgaW52aXNpYmxlVGV4dCA9ICg8SW52aXNpYmxlVGV4dCB0ZXh0PXt0ZXh0QmluZGluZ30gaWQ9e3RoaXMuZ2V0U2VsZWN0b3JBcmlhTGFiZWxsZWRCeUlkKCl9IC8+KSBhcyBJbnZpc2libGVUZXh0O1xuXG5cdFx0Ly9BZGRzIHRoZSBpbnZpc2libGVUZXh0IGludG8gdGhlIHN0YXRpYywgaGlkZGVuIGFyZWEgVUkgYXJlYSBjb250YWluZXIuXG5cdFx0aW52aXNpYmxlVGV4dC50b1N0YXRpYygpO1xuXHRcdHJldHVybiBpbnZpc2libGVUZXh0O1xuXHR9XG5cblx0Z2V0Q29udGVudCh2aWV3OiBWaWV3LCBhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCkge1xuXHRcdGlmICh0aGlzLmZpbHRlckNvbmZpZ3VyYXRpb24uc2hvd0NvdW50cykge1xuXHRcdFx0dGhpcy5yZWdpc3RlclNpZGVFZmZlY3RGb3JRdWlja0ZpbHRlcihhcHBDb21wb25lbnQpO1xuXHRcdH1cblx0XHQvKipcblx0XHQgKiBUaGUgbnVtYmVyIG9mIHZpZXdzIGRlZmluZWQgZm9yIGEgdGFibGUgZGV0ZXJtaW5lcyB0aGUgVUkgY29udHJvbCB0aGF0IGxldHMgdXNlcnMgc3dpdGNoIHRoZSB0YWJsZSB2aWV3czpcblx0XHQgKiAgLSBBIHNlZ21lbnRlZCBidXR0b24gZm9yIGEgbWF4aW11bSBvZiB0aHJlZSB2aWV3c1xuXHRcdCAqICAtIEEgc2VsZWN0IGNvbnRyb2wgZm9yIGZvdXIgb3IgbW9yZSB2aWV3cy5cblx0XHQgKi9cblx0XHRjb25zdCBzZWxlY3RvciA9IHRoaXMuZmlsdGVyQ29uZmlndXJhdGlvbi5wYXRocy5sZW5ndGggPiAzID8gdGhpcy5nZXRTZWxlY3RTZWxlY3RvcigpIDogdGhpcy5nZXRTZWdtZW50ZWRCdXR0b25TZWxlY3RvcigpO1xuXHRcdHNlbGVjdG9yLmFkZERlcGVuZGVudCh0aGlzLmdldEFjY2Vzc2liaWxpdHlDb250cm9sKCkpO1xuXHRcdHJldHVybiBzZWxlY3Rvcjtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01Bb0JxQkEsbUJBQW1CLFdBRHZDQyxtQkFBbUIsQ0FBQztJQUFFQyxJQUFJLEVBQUUscUJBQXFCO0lBQUVDLFNBQVMsRUFBRTtFQUFzQixDQUFDLENBQUMsVUFFckZDLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFHREYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRSxzQkFBc0I7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBR2hFRixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLHNCQUFzQjtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHaEVGLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHbERGLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVyxDQUFDLENBQUM7SUFBQTtJQUdyQyw2QkFBWUUsS0FBd0MsRUFBRTtNQUFBO01BQ3JELHlDQUFNQSxLQUFLLENBQUM7TUFBQztNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFDZDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBSkM7SUFBQTtJQUFBLE9BS1FDLDBCQUEwQixHQUFsQyxzQ0FBc0Q7TUFDckQsTUFBTUMsS0FBSyxHQUFHLElBQUksQ0FBQ0MsbUJBQW1CLENBQUNDLEtBQUssQ0FBQ0MsR0FBRyxDQUFDLENBQUNDLElBQUksRUFBRUMsS0FBSyxLQUFLO1FBQ2pFLE9BQVEsS0FBQyxtQkFBbUI7VUFBQSxHQUFLLElBQUksQ0FBQ0MseUJBQXlCLENB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QUksQ0FBQyxDQUFDO2NBQ25FO1lBQ0QsQ0FBQyxDQUFDO1VBQ0g7UUFDRDtRQUNBckIsWUFBWSxDQUFDd0IscUJBQXFCLEVBQUUsQ0FBQ0MscUJBQXFCLENBQUN0QixjQUFjLEVBQUU7VUFDMUVRLGdCQUFnQixFQUFFZSxLQUFLLENBQUNDLElBQUksQ0FBQ2hCLGdCQUFnQixDQUFDO1VBQzlDaUIsY0FBYyxFQUFFLENBQ2Y7WUFDQ0MsdUJBQXVCLEVBQUV0QjtVQUMxQixDQUFDLENBQ0Q7VUFDRHVCLGVBQWUsRUFBRSxJQUFJLENBQUNyRDtRQUN2QixDQUFDLENBQUM7TUFDSDtJQUNEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS1FzRCx1QkFBdUIsR0FBL0IsbUNBQWtDO01BQ2pDLE1BQU1DLFdBQVcsR0FBSSx3Q0FBdUM7TUFDNUQsTUFBTUMsYUFBYSxHQUFJLEtBQUMsYUFBYTtRQUFDLElBQUksRUFBRUQsV0FBWTtRQUFDLEVBQUUsRUFBRSxJQUFJLENBQUNwRCwyQkFBMkI7TUFBRyxFQUFxQjs7TUFFckg7TUFDQXFELGFBQWEsQ0FBQ0MsUUFBUSxFQUFFO01BQ3hCLE9BQU9ELGFBQWE7SUFDckIsQ0FBQztJQUFBLE9BRURFLFVBQVUsR0FBVixvQkFBV0MsSUFBVSxFQUFFcEMsWUFBMEIsRUFBRTtNQUNsRCxJQUFJLElBQUksQ0FBQzdCLG1CQUFtQixDQUFDMkIsVUFBVSxFQUFFO1FBQ3hDLElBQUksQ0FBQ0MsZ0NBQWdDLENBQUNDLFlBQVksQ0FBQztNQUNwRDtNQUNBO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7TUFDRSxNQUFNcUMsUUFBUSxHQUFHLElBQUksQ0FBQ2xFLG1CQUFtQixDQUFDQyxLQUFLLENBQUNrRSxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQ3ZELGlCQUFpQixFQUFFLEdBQUcsSUFBSSxDQUFDZCwwQkFBMEIsRUFBRTtNQUN6SG9FLFFBQVEsQ0FBQ0UsWUFBWSxDQUFDLElBQUksQ0FBQ1IsdUJBQXVCLEVBQUUsQ0FBQztNQUNyRCxPQUFPTSxRQUFRO0lBQ2hCLENBQUM7SUFBQTtFQUFBLEVBeksrQ0csb0JBQW9CO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQTtFQUFBO0FBQUEifQ==
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/library", "sap/fe/core/templating/CriticalityFormatters", "sap/m/Button", "sap/fe/core/jsx-runtime/jsx"], function (BuildingBlockSupport, RuntimeBuildingBlock, DataField, MetaModelConverter, library, CriticalityFormatters, Button, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var _exports = {};
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var isActionWithDialog = DataField.isActionWithDialog;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let DataFieldForActionBlock = (_dec = defineBuildingBlock({
    name: "DataFieldForAction",
    namespace: "sap.fe.macros.actions"
  }), _dec2 = blockAttribute({
    type: "object",
    required: true
  }), _dec3 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = blockAttribute({
    type: "string",
    required: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(DataFieldForActionBlock, _RuntimeBuildingBlock);
    function DataFieldForActionBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _RuntimeBuildingBlock.call(this, ...args) || this;
      _initializerDefineProperty(_this, "action", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor3, _assertThisInitialized(_this));
      return _this;
    }
    _exports = DataFieldForActionBlock;
    var _proto = DataFieldForActionBlock.prototype;
    _proto.getContent = function getContent(view) {
      const controller = view.getController();
      const dataViewModelPath = getInvolvedDataModelObjects(this.contextPath);
      const odataMetaModel = this.contextPath.getModel();
      const annotationPath = this.action.annotationPath;
      let pressEvent;
      if (annotationPath) {
        const annotationPathContext = odataMetaModel.getContext(annotationPath);
        const dataFieldContextModelPath = getInvolvedDataModelObjects(annotationPathContext);
        const dataFieldForAction = dataFieldContextModelPath.targetObject;
        if (dataFieldForAction) {
          var _dataViewModelPath$ta;
          const actionParameters = {
            entitySetName: (_dataViewModelPath$ta = dataViewModelPath.targetEntitySet) === null || _dataViewModelPath$ta === void 0 ? void 0 : _dataViewModelPath$ta.name,
            invocationGrouping: dataFieldForAction.InvocationGrouping === "UI.OperationGroupingType/ChangeSet" ? library.InvocationGrouping.ChangeSet : library.InvocationGrouping.Isolated,
            label: dataFieldForAction.Label,
            isNavigable: this.action.isNavigable,
            defaultValuesExtensionFunction: this.action.defaultValuesExtensionFunction
          };
          if (!this.action.command) {
            pressEvent = {
              press: () => {
                controller.handlers.onCallAction(view, dataFieldForAction.Action, {
                  ...actionParameters,
                  ...{
                    contexts: view.getBindingContext(),
                    model: view.getModel()
                  }
                });
              }
            };
          } else {
            pressEvent = {
              "jsx:command": `${this.action.command}|press`
            };
          }
          return _jsx(Button, {
            id: this.id,
            text: actionParameters.label,
            ...pressEvent,
            ariaHasPopup: isActionWithDialog(dataFieldContextModelPath.targetObject),
            visible: this.action.visible,
            enabled: this.action.enabled,
            type: CriticalityFormatters.buildExpressionForCriticalityButtonType(dataFieldContextModelPath)
          });
        }
      }
    };
    return DataFieldForActionBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "action", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DataFieldForActionBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEYXRhRmllbGRGb3JBY3Rpb25CbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJnZXRDb250ZW50IiwidmlldyIsImNvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwiZGF0YVZpZXdNb2RlbFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJjb250ZXh0UGF0aCIsIm9kYXRhTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJhbm5vdGF0aW9uUGF0aCIsImFjdGlvbiIsInByZXNzRXZlbnQiLCJhbm5vdGF0aW9uUGF0aENvbnRleHQiLCJnZXRDb250ZXh0IiwiZGF0YUZpZWxkQ29udGV4dE1vZGVsUGF0aCIsImRhdGFGaWVsZEZvckFjdGlvbiIsInRhcmdldE9iamVjdCIsImFjdGlvblBhcmFtZXRlcnMiLCJlbnRpdHlTZXROYW1lIiwidGFyZ2V0RW50aXR5U2V0IiwiaW52b2NhdGlvbkdyb3VwaW5nIiwiSW52b2NhdGlvbkdyb3VwaW5nIiwibGlicmFyeSIsIkNoYW5nZVNldCIsIklzb2xhdGVkIiwibGFiZWwiLCJMYWJlbCIsImlzTmF2aWdhYmxlIiwiZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uIiwiY29tbWFuZCIsInByZXNzIiwiaGFuZGxlcnMiLCJvbkNhbGxBY3Rpb24iLCJBY3Rpb24iLCJjb250ZXh0cyIsImdldEJpbmRpbmdDb250ZXh0IiwibW9kZWwiLCJpZCIsImlzQWN0aW9uV2l0aERpYWxvZyIsInZpc2libGUiLCJlbmFibGVkIiwiQ3JpdGljYWxpdHlGb3JtYXR0ZXJzIiwiYnVpbGRFeHByZXNzaW9uRm9yQ3JpdGljYWxpdHlCdXR0b25UeXBlIiwiUnVudGltZUJ1aWxkaW5nQmxvY2siXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRhdGFGaWVsZEZvckFjdGlvbi5ibG9jay50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBEYXRhRmllbGRGb3JBY3Rpb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9SdW50aW1lQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHsgaXNBY3Rpb25XaXRoRGlhbG9nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQgdHlwZSB7IEFubm90YXRpb25BY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQ29tbWFuZFByb3BlcnRpZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvanN4LXJ1bnRpbWUvanN4XCI7XG5pbXBvcnQgdHlwZSB7IENvcmVMaWIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IGxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCAqIGFzIENyaXRpY2FsaXR5Rm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Dcml0aWNhbGl0eUZvcm1hdHRlcnNcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sbGVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbnR5cGUgQ29udHJvbGxlcldpdGhBY3Rpb24gPSBDb250cm9sbGVyICYge1xuXHRoYW5kbGVyczoge1xuXHRcdG9uQ2FsbEFjdGlvbjogRnVuY3Rpb247XG5cdH07XG59O1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soeyBuYW1lOiBcIkRhdGFGaWVsZEZvckFjdGlvblwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5hY3Rpb25zXCIgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFGaWVsZEZvckFjdGlvbkJsb2NrIGV4dGVuZHMgUnVudGltZUJ1aWxkaW5nQmxvY2sge1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcIm9iamVjdFwiLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRhY3Rpb24hOiBBbm5vdGF0aW9uQWN0aW9uO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0Y29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRpZCE6IHN0cmluZztcblxuXHRnZXRDb250ZW50KHZpZXc6IFZpZXcpIHtcblx0XHRjb25zdCBjb250cm9sbGVyID0gdmlldy5nZXRDb250cm9sbGVyKCk7XG5cdFx0Y29uc3QgZGF0YVZpZXdNb2RlbFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3Qgb2RhdGFNZXRhTW9kZWwgPSB0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0Y29uc3QgYW5ub3RhdGlvblBhdGggPSB0aGlzLmFjdGlvbi5hbm5vdGF0aW9uUGF0aDtcblx0XHRsZXQgcHJlc3NFdmVudDogeyBwcmVzczogKGV2ZW50OiBFdmVudCkgPT4gdm9pZCB9IHwgeyBcImpzeDpjb21tYW5kXCI6IENvbW1hbmRQcm9wZXJ0aWVzIH07XG5cdFx0aWYgKGFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRjb25zdCBhbm5vdGF0aW9uUGF0aENvbnRleHQgPSBvZGF0YU1ldGFNb2RlbC5nZXRDb250ZXh0KGFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IGRhdGFGaWVsZENvbnRleHRNb2RlbFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoYW5ub3RhdGlvblBhdGhDb250ZXh0KTtcblx0XHRcdGNvbnN0IGRhdGFGaWVsZEZvckFjdGlvbiA9IGRhdGFGaWVsZENvbnRleHRNb2RlbFBhdGgudGFyZ2V0T2JqZWN0IGFzIERhdGFGaWVsZEZvckFjdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRcdGlmIChkYXRhRmllbGRGb3JBY3Rpb24pIHtcblx0XHRcdFx0Y29uc3QgYWN0aW9uUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0XHRlbnRpdHlTZXROYW1lOiBkYXRhVmlld01vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQ/Lm5hbWUsXG5cdFx0XHRcdFx0aW52b2NhdGlvbkdyb3VwaW5nOlxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkRm9yQWN0aW9uLkludm9jYXRpb25Hcm91cGluZyA9PT0gXCJVSS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCJcblx0XHRcdFx0XHRcdFx0PyAobGlicmFyeSBhcyBDb3JlTGliKS5JbnZvY2F0aW9uR3JvdXBpbmcuQ2hhbmdlU2V0XG5cdFx0XHRcdFx0XHRcdDogKGxpYnJhcnkgYXMgQ29yZUxpYikuSW52b2NhdGlvbkdyb3VwaW5nLklzb2xhdGVkLFxuXHRcdFx0XHRcdGxhYmVsOiBkYXRhRmllbGRGb3JBY3Rpb24uTGFiZWwgYXMgc3RyaW5nLFxuXHRcdFx0XHRcdGlzTmF2aWdhYmxlOiB0aGlzLmFjdGlvbi5pc05hdmlnYWJsZSxcblx0XHRcdFx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IHRoaXMuYWN0aW9uLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvblxuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiAoIXRoaXMuYWN0aW9uLmNvbW1hbmQpIHtcblx0XHRcdFx0XHRwcmVzc0V2ZW50ID0ge1xuXHRcdFx0XHRcdFx0cHJlc3M6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0KGNvbnRyb2xsZXIgYXMgQ29udHJvbGxlcldpdGhBY3Rpb24pLmhhbmRsZXJzLm9uQ2FsbEFjdGlvbih2aWV3LCBkYXRhRmllbGRGb3JBY3Rpb24uQWN0aW9uIGFzIHN0cmluZywge1xuXHRcdFx0XHRcdFx0XHRcdC4uLmFjdGlvblBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdFx0Li4ue1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dHM6IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdFx0XHRcdFx0XHRcdG1vZGVsOiB2aWV3LmdldE1vZGVsKClcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cHJlc3NFdmVudCA9IHsgXCJqc3g6Y29tbWFuZFwiOiBgJHt0aGlzLmFjdGlvbi5jb21tYW5kfXxwcmVzc2AgYXMgQ29tbWFuZFByb3BlcnRpZXMgfTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdGlkPXt0aGlzLmlkfVxuXHRcdFx0XHRcdFx0dGV4dD17YWN0aW9uUGFyYW1ldGVycy5sYWJlbH1cblx0XHRcdFx0XHRcdHsuLi5wcmVzc0V2ZW50fVxuXHRcdFx0XHRcdFx0YXJpYUhhc1BvcHVwPXtpc0FjdGlvbldpdGhEaWFsb2coZGF0YUZpZWxkQ29udGV4dE1vZGVsUGF0aC50YXJnZXRPYmplY3QgYXMgRGF0YUZpZWxkRm9yQWN0aW9uKX1cblx0XHRcdFx0XHRcdHZpc2libGU9e3RoaXMuYWN0aW9uLnZpc2libGV9XG5cdFx0XHRcdFx0XHRlbmFibGVkPXt0aGlzLmFjdGlvbi5lbmFibGVkfVxuXHRcdFx0XHRcdFx0dHlwZT17Q3JpdGljYWxpdHlGb3JtYXR0ZXJzLmJ1aWxkRXhwcmVzc2lvbkZvckNyaXRpY2FsaXR5QnV0dG9uVHlwZShkYXRhRmllbGRDb250ZXh0TW9kZWxQYXRoKX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQpIGFzIEJ1dHRvbjtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztNQXVCcUJBLHVCQUF1QixXQUQzQ0MsbUJBQW1CLENBQUM7SUFBRUMsSUFBSSxFQUFFLG9CQUFvQjtJQUFFQyxTQUFTLEVBQUU7RUFBd0IsQ0FBQyxDQUFDLFVBRXRGQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBR2xERixjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLHNCQUFzQjtJQUFFQyxRQUFRLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHaEVGLGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsUUFBUTtJQUNkQyxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUEsT0FHRkMsVUFBVSxHQUFWLG9CQUFXQyxJQUFVLEVBQUU7TUFDdEIsTUFBTUMsVUFBVSxH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
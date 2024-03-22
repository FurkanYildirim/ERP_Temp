/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/macros/actions/CustomAction.block", "sap/fe/macros/actions/DataFieldForAction.block", "sap/fe/macros/messages/MessageButton", "sap/m/Button", "sap/m/DraftIndicator", "sap/m/Menu", "sap/m/MenuButton", "sap/m/MenuItem", "sap/m/OverflowToolbar", "sap/m/OverflowToolbarLayoutData", "sap/m/ToolbarSpacer", "sap/ui/core/InvisibleText", "../../ObjectPageTemplating", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/jsxs"], function (BuildingBlockSupport, RuntimeBuildingBlock, BindingHelper, ManifestSettings, MetaModelConverter, BindingToolkit, ModelHelper, StableIdHelper, CustomActionBlock, DataFieldForActionBlock, MessageButton, Button, DraftIndicator, Menu, MenuButton, MenuItem, OverflowToolbar, OverflowToolbarLayoutData, ToolbarSpacer, InvisibleText, ObjectPageTemplating, _jsx, _jsxs) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var _exports = {};
  var generate = StableIdHelper.generate;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var ActionType = ManifestSettings.ActionType;
  var UI = BindingHelper.UI;
  var Draft = BindingHelper.Draft;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let FooterContentBlock = (_dec = defineBuildingBlock({
    name: "FooterContent",
    namespace: "sap.fe.templates.ObjectPage.view.fragments"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "array",
    required: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(FooterContentBlock, _RuntimeBuildingBlock);
    function FooterContentBlock(props) {
      var _ModelHelper$getDraft, _startingEntitySet$en;
      var _this;
      for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        others[_key - 1] = arguments[_key];
      }
      _this = _RuntimeBuildingBlock.call(this, props, ...others) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _this.isDraftValidation = false;
      _this.oDataMetaModel = _this.contextPath.getModel();
      _this.dataViewModelPath = getInvolvedDataModelObjects(_this.contextPath);
      const startingEntitySet = _this.dataViewModelPath.startingEntitySet;
      _this.isDraftValidation = !!((_ModelHelper$getDraft = ModelHelper.getDraftRoot(startingEntitySet)) !== null && _ModelHelper$getDraft !== void 0 && _ModelHelper$getDraft.PreparationAction && startingEntitySet !== null && startingEntitySet !== void 0 && (_startingEntitySet$en = startingEntitySet.entityType.annotations.Common) !== null && _startingEntitySet$en !== void 0 && _startingEntitySet$en.Messages);
      return _this;
    }
    _exports = FooterContentBlock;
    var _proto = FooterContentBlock.prototype;
    _proto.getActionModelPath = function getActionModelPath(action) {
      const annotationPath = action.annotationPath;
      if (annotationPath) {
        const actionContext = this.oDataMetaModel.getContext(annotationPath);
        return getInvolvedDataModelObjects(actionContext);
      }
      return undefined;
    }

    /**
     * Get the visibility of the ObjectPage footer content.
     *
     * @function
     * @name getVisibility
     * @returns The binding expression
     */;
    _proto.getVisibility = function getVisibility() {
      const _generateBindingsForActions = actions => {
        if (actions.length) {
          return actions.map(action => resolveBindingString(action.visible ?? true, "boolean"));
        }
        return [constant(false)];
      };
      // Actions are coming from the converter so only determining actions and not statically hidden are listed
      const determiningActions = this.actions.filter(action => action.type === ActionType.DataFieldForAction);
      const manifestActionBindings = _generateBindingsForActions(this.actions.filter(action => ObjectPageTemplating.isManifestAction(action)));
      const deterMiningActionBindings = _generateBindingsForActions(determiningActions);
      const isNotHiddenDeterminingAction = !!determiningActions.find(action => {
        var _actionContextModelPa, _actionContextModelPa2, _actionContextModelPa3;
        const actionContextModelPath = this.getActionModelPath(action);
        return !(actionContextModelPath !== null && actionContextModelPath !== void 0 && (_actionContextModelPa = actionContextModelPath.targetObject) !== null && _actionContextModelPa !== void 0 && (_actionContextModelPa2 = _actionContextModelPa.annotations) !== null && _actionContextModelPa2 !== void 0 && (_actionContextModelPa3 = _actionContextModelPa2.UI) !== null && _actionContextModelPa3 !== void 0 && _actionContextModelPa3.Hidden);
      });
      return or(isNotHiddenDeterminingAction, or(...manifestActionBindings), and(or(UI.IsEditable, or(...deterMiningActionBindings)), not(pathInModel("isCreateDialogOpen", "internal"))));
    };
    _proto.getDraftIndicator = function getDraftIndicator() {
      var _entitySet$annotation;
      const entitySet = this.dataViewModelPath.targetEntitySet || this.dataViewModelPath.startingEntitySet; // startingEntitySet is used on containment scenario
      const commonAnnotation = (_entitySet$annotation = entitySet.annotations) === null || _entitySet$annotation === void 0 ? void 0 : _entitySet$annotation.Common;
      if (commonAnnotation !== null && commonAnnotation !== void 0 && commonAnnotation.DraftRoot || commonAnnotation !== null && commonAnnotation !== void 0 && commonAnnotation.DraftNode) {
        return _jsx(DraftIndicator, {
          state: "{ui>/draftStatus}",
          visible: "{ui>/isEditable}"
        });
      }
      return undefined;
    };
    _proto.getApplyButton = function getApplyButton(view, emphasizedExpression) {
      const controller = view.getController();
      const viewData = view.getViewData();
      if (this.isDraftValidation && !viewData.isDesktop && !viewData.fclEnabled) {
        return _jsx(MenuButton, {
          text: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_APPLY_DRAFT}",
          defaultAction: () => controller._applyDocument(view.getBindingContext()),
          useDefaultActionOnly: "true",
          buttonMode: "Split",
          type: emphasizedExpression,
          visible: UI.IsEditable,
          children: _jsx(Menu, {
            children: _jsx(MenuItem, {
              text: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_VALIDATE_DRAFT}",
              press: () => controller._validateDocument()
            })
          })
        });
      }
      return _jsx(Button, {
        id: this.createId("StandardAction::Apply"),
        text: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_APPLY_DRAFT}",
        type: emphasizedExpression,
        enabled: true,
        press: () => controller._applyDocument(view.getBindingContext()),
        visible: "{ui>/isEditable}"
      });
    };
    _proto.getPrimary = function getPrimary(view, emphasizedExpression) {
      const viewData = view.getViewData();
      const controller = view.getController();
      if (this.isDraftValidation && !viewData.isDesktop) {
        return _jsx(MenuButton, {
          text: this.getTextSaveButton(),
          "jsx:command": "cmd:Save|defaultAction",
          useDefaultActionOnly: "true",
          buttonMode: "Split",
          type: emphasizedExpression,
          visible: UI.IsEditable,
          children: _jsx(Menu, {
            children: _jsx(MenuItem, {
              text: "{sap.fe.i18n>T_COMMON_OBJECT_PAGE_VALIDATE_DRAFT}",
              press: () => controller._validateDocument()
            })
          })
        });
      }
      return _jsx(Button, {
        id: this.createId("StandardAction::Save"),
        text: this.getTextSaveButton(),
        type: emphasizedExpression,
        visible: UI.IsEditable,
        enabled: true,
        "jsx:command": "cmd:Save|press"
      });
    };
    _proto.getTextSaveButton = function getTextSaveButton() {
      var _annotations$Session;
      const saveButtonText = this.getTranslatedText("T_OP_OBJECT_PAGE_SAVE");
      const createButtonText = this.getTranslatedText("T_OP_OBJECT_PAGE_CREATE");
      // If we're in sticky mode  -> the ui is in create mode, show Create, else show Save
      // If not -> we're in draft AND the draft is a new object (!IsActiveEntity && !HasActiveEntity), show create, else show save
      return ifElse(ifElse(((_annotations$Session = this.dataViewModelPath.startingEntitySet.annotations.Session) === null || _annotations$Session === void 0 ? void 0 : _annotations$Session.StickySessionSupported) !== undefined, UI.IsCreateMode, Draft.IsNewObject), createButtonText, saveButtonText);
    };
    _proto.getCancelButton = function getCancelButton() {
      return _jsx(Button, {
        id: this.createId("StandardAction::Cancel"),
        text: ModelHelper.isDraftRoot(this.dataViewModelPath.targetEntitySet) ? "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISCARD_DRAFT}" : "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_CANCEL}",
        "jsx:command": "cmd:Cancel|press",
        visible: UI.IsEditable,
        ariaHasPopup: compileExpression(ifElse(pathInModel("/isDocumentModified", "ui"), constant("Dialog"), constant("None"))),
        enabled: true,
        layoutData: _jsx(OverflowToolbarLayoutData, {
          priority: "NeverOverflow"
        })
      });
    };
    _proto.getDataFieldForActionButton = function getDataFieldForActionButton(action) {
      if (action.annotationPath) {
        return _jsx(DataFieldForActionBlock, {
          id: generate([this.id, this.getActionModelPath(action)]),
          action: action,
          contextPath: this.contextPath
        });
      }
    };
    _proto.getManifestButton = function getManifestButton(action) {
      if (ObjectPageTemplating.isManifestAction(action)) {
        return _jsx(CustomActionBlock, {
          id: generate(["fe", "FooterBar", action.id]),
          action: action
        });
      }
    };
    _proto.getActionControls = function getActionControls(view) {
      const emphasizedButtonExpression = ObjectPageTemplating.buildEmphasizedButtonExpression(this.dataViewModelPath);
      return this.actions.map(action => {
        switch (action.type) {
          case ActionType.DefaultApply:
            return this.getApplyButton(view, emphasizedButtonExpression);
          case ActionType.DataFieldForAction:
            return this.getDataFieldForActionButton(action);
          case ActionType.Primary:
            return this.getPrimary(view, emphasizedButtonExpression);
          case ActionType.Secondary:
            return this.getCancelButton();
          default:
            return this.getManifestButton(action);
        }
      }).filter(action => !!action);
    };
    _proto.getContent = function getContent(view) {
      const controller = view.getController();
      return _jsxs(OverflowToolbar, {
        id: this.id,
        asyncMode: true,
        visible: this.getVisibility(),
        children: [_jsx(InvisibleText, {
          id: this.createId("MessageButton::AriaText"),
          text: "{sap.fe.i18n>C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_BUTTON_ARIA_TEXT}"
        }), _jsx(MessageButton, {
          id: this.createId("MessageButton"),
          messageChange: () => controller._getFooterVisibility(),
          ariaLabelledBy: [this.createId("MessageButton::AriaText")],
          type: "Emphasized",
          ariaHasPopup: "Dialog"
        }), _jsx(ToolbarSpacer, {}), this.getDraftIndicator(), this.getActionControls(view)]
      });
    };
    return FooterContentBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FooterContentBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb290ZXJDb250ZW50QmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsInJlcXVpcmVkIiwicHJvcHMiLCJvdGhlcnMiLCJpc0RyYWZ0VmFsaWRhdGlvbiIsIm9EYXRhTWV0YU1vZGVsIiwiY29udGV4dFBhdGgiLCJnZXRNb2RlbCIsImRhdGFWaWV3TW9kZWxQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJNb2RlbEhlbHBlciIsImdldERyYWZ0Um9vdCIsIlByZXBhcmF0aW9uQWN0aW9uIiwiZW50aXR5VHlwZSIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiTWVzc2FnZXMiLCJnZXRBY3Rpb25Nb2RlbFBhdGgiLCJhY3Rpb24iLCJhbm5vdGF0aW9uUGF0aCIsImFjdGlvbkNvbnRleHQiLCJnZXRDb250ZXh0IiwidW5kZWZpbmVkIiwiZ2V0VmlzaWJpbGl0eSIsIl9nZW5lcmF0ZUJpbmRpbmdzRm9yQWN0aW9ucyIsImFjdGlvbnMiLCJsZW5ndGgiLCJtYXAiLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsInZpc2libGUiLCJjb25zdGFudCIsImRldGVybWluaW5nQWN0aW9ucyIsImZpbHRlciIsIkFjdGlvblR5cGUiLCJEYXRhRmllbGRGb3JBY3Rpb24iLCJtYW5pZmVzdEFjdGlvbkJpbmRpbmdzIiwiT2JqZWN0UGFnZVRlbXBsYXRpbmciLCJpc01hbmlmZXN0QWN0aW9uIiwiZGV0ZXJNaW5pbmdBY3Rpb25CaW5kaW5ncyIsImlzTm90SGlkZGVuRGV0ZXJtaW5pbmdBY3Rpb24iLCJmaW5kIiwiYWN0aW9uQ29udGV4dE1vZGVsUGF0aCIsInRhcmdldE9iamVjdCIsIlVJIiwiSGlkZGVuIiwib3IiLCJhbmQiLCJJc0VkaXRhYmxlIiwibm90IiwicGF0aEluTW9kZWwiLCJnZXREcmFmdEluZGljYXRvciIsImVudGl0eVNldCIsInRhcmdldEVudGl0eVNldCIsImNvbW1vbkFubm90YXRpb24iLCJEcmFmdFJvb3QiLCJEcmFmdE5vZGUiLCJnZXRBcHBseUJ1dHRvbiIsInZpZXciLCJlbXBoYXNpemVkRXhwcmVzc2lvbiIsImNvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwidmlld0RhdGEiLCJnZXRWaWV3RGF0YSIsImlzRGVza3RvcCIsImZjbEVuYWJsZWQiLCJfYXBwbHlEb2N1bWVudCIsImdldEJpbmRpbmdDb250ZXh0IiwiX3ZhbGlkYXRlRG9jdW1lbnQiLCJjcmVhdGVJZCIsImdldFByaW1hcnkiLCJnZXRUZXh0U2F2ZUJ1dHRvbiIsInNhdmVCdXR0b25UZXh0IiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJjcmVhdGVCdXR0b25UZXh0IiwiaWZFbHNlIiwiU2Vzc2lvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJJc0NyZWF0ZU1vZGUiLCJEcmFmdCIsIklzTmV3T2JqZWN0IiwiZ2V0Q2FuY2VsQnV0dG9uIiwiaXNEcmFmdFJvb3QiLCJjb21waWxlRXhwcmVzc2lvbiIsImdldERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbiIsImdlbmVyYXRlIiwiaWQiLCJnZXRNYW5pZmVzdEJ1dHRvbiIsImdldEFjdGlvbkNvbnRyb2xzIiwiZW1waGFzaXplZEJ1dHRvbkV4cHJlc3Npb24iLCJidWlsZEVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uIiwiRGVmYXVsdEFwcGx5IiwiUHJpbWFyeSIsIlNlY29uZGFyeSIsImdldENvbnRlbnQiLCJfZ2V0Rm9vdGVyVmlzaWJpbGl0eSIsIlJ1bnRpbWVCdWlsZGluZ0Jsb2NrIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGb290ZXJDb250ZW50LmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVudGl0eVNldCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhRmllbGRGb3JBY3Rpb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9SdW50aW1lQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHsgQmFzZUFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IERyYWZ0LCBVSSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBCYXNlTWFuaWZlc3RTZXR0aW5ncyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7XG5cdGFuZCxcblx0QmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGlmRWxzZSxcblx0bm90LFxuXHRvcixcblx0cGF0aEluTW9kZWwsXG5cdHJlc29sdmVCaW5kaW5nU3RyaW5nXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCBDdXN0b21BY3Rpb25CbG9jayBmcm9tIFwic2FwL2ZlL21hY3Jvcy9hY3Rpb25zL0N1c3RvbUFjdGlvbi5ibG9ja1wiO1xuaW1wb3J0IERhdGFGaWVsZEZvckFjdGlvbkJsb2NrIGZyb20gXCJzYXAvZmUvbWFjcm9zL2FjdGlvbnMvRGF0YUZpZWxkRm9yQWN0aW9uLmJsb2NrXCI7XG5pbXBvcnQgTWVzc2FnZUJ1dHRvbiBmcm9tIFwic2FwL2ZlL21hY3Jvcy9tZXNzYWdlcy9NZXNzYWdlQnV0dG9uXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEcmFmdEluZGljYXRvciBmcm9tIFwic2FwL20vRHJhZnRJbmRpY2F0b3JcIjtcbmltcG9ydCBNZW51IGZyb20gXCJzYXAvbS9NZW51XCI7XG5pbXBvcnQgTWVudUJ1dHRvbiBmcm9tIFwic2FwL20vTWVudUJ1dHRvblwiO1xuaW1wb3J0IE1lbnVJdGVtIGZyb20gXCJzYXAvbS9NZW51SXRlbVwiO1xuaW1wb3J0IE92ZXJmbG93VG9vbGJhciBmcm9tIFwic2FwL20vT3ZlcmZsb3dUb29sYmFyXCI7XG5pbXBvcnQgT3ZlcmZsb3dUb29sYmFyTGF5b3V0RGF0YSBmcm9tIFwic2FwL20vT3ZlcmZsb3dUb29sYmFyTGF5b3V0RGF0YVwiO1xuaW1wb3J0IFRvb2xiYXJTcGFjZXIgZnJvbSBcInNhcC9tL1Rvb2xiYXJTcGFjZXJcIjtcbmltcG9ydCB7IFByb3BlcnR5QmluZGluZ0luZm8gfSBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IEludmlzaWJsZVRleHQgZnJvbSBcInNhcC91aS9jb3JlL0ludmlzaWJsZVRleHRcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCB2NENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT2JqZWN0UGFnZUNvbnRyb2xsZXIgZnJvbSBcIi4uLy4uL09iamVjdFBhZ2VDb250cm9sbGVyLmNvbnRyb2xsZXJcIjtcbmltcG9ydCAqIGFzIE9iamVjdFBhZ2VUZW1wbGF0aW5nIGZyb20gXCIuLi8uLi9PYmplY3RQYWdlVGVtcGxhdGluZ1wiO1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7IG5hbWU6IFwiRm9vdGVyQ29udGVudFwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLnZpZXcuZnJhZ21lbnRzXCIgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvb3RlckNvbnRlbnRCbG9jayBleHRlbmRzIFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIHtcblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiB0cnVlXG5cdH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwiYXJyYXlcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0YWN0aW9ucyE6IEJhc2VBY3Rpb25bXTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIgfSlcblx0Y29udGV4dFBhdGg/OiBDb250ZXh0O1xuXG5cdG9EYXRhTWV0YU1vZGVsITogT0RhdGFNZXRhTW9kZWw7XG5cdGRhdGFWaWV3TW9kZWxQYXRoITogRGF0YU1vZGVsT2JqZWN0UGF0aDtcblx0aXNEcmFmdFZhbGlkYXRpb246IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPEZvb3RlckNvbnRlbnRCbG9jaz4sIC4uLm90aGVyczogYW55W10pIHtcblx0XHRzdXBlcihwcm9wcywgLi4ub3RoZXJzKTtcblx0XHR0aGlzLm9EYXRhTWV0YU1vZGVsID0gdGhpcy5jb250ZXh0UGF0aCEuZ2V0TW9kZWwoKSBhcyB1bmtub3duIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdHRoaXMuZGF0YVZpZXdNb2RlbFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5jb250ZXh0UGF0aCEpO1xuXHRcdGNvbnN0IHN0YXJ0aW5nRW50aXR5U2V0ID0gdGhpcy5kYXRhVmlld01vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldDtcblx0XHR0aGlzLmlzRHJhZnRWYWxpZGF0aW9uID0gISEoXG5cdFx0XHRNb2RlbEhlbHBlci5nZXREcmFmdFJvb3Qoc3RhcnRpbmdFbnRpdHlTZXQpPy5QcmVwYXJhdGlvbkFjdGlvbiAmJiBzdGFydGluZ0VudGl0eVNldD8uZW50aXR5VHlwZS5hbm5vdGF0aW9ucy5Db21tb24/Lk1lc3NhZ2VzXG5cdFx0KTtcblx0fVxuXG5cdHByaXZhdGUgZ2V0QWN0aW9uTW9kZWxQYXRoKGFjdGlvbjogQmFzZUFjdGlvbikge1xuXHRcdGNvbnN0IGFubm90YXRpb25QYXRoID0gYWN0aW9uLmFubm90YXRpb25QYXRoO1xuXHRcdGlmIChhbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0Y29uc3QgYWN0aW9uQ29udGV4dCA9IHRoaXMub0RhdGFNZXRhTW9kZWwuZ2V0Q29udGV4dChhbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRyZXR1cm4gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKGFjdGlvbkNvbnRleHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgT2JqZWN0UGFnZSBmb290ZXIgY29udGVudC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFZpc2liaWxpdHlcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuXHQgKi9cblx0Z2V0VmlzaWJpbGl0eSgpIHtcblx0XHRjb25zdCBfZ2VuZXJhdGVCaW5kaW5nc0ZvckFjdGlvbnMgPSAoYWN0aW9uczogQmFzZUFjdGlvbltdKSA9PiB7XG5cdFx0XHRpZiAoYWN0aW9ucy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIGFjdGlvbnMubWFwKChhY3Rpb24pID0+XG5cdFx0XHRcdFx0cmVzb2x2ZUJpbmRpbmdTdHJpbmcoYWN0aW9uLnZpc2libGUgPz8gdHJ1ZSwgXCJib29sZWFuXCIpXG5cdFx0XHRcdCkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W107XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gW2NvbnN0YW50KGZhbHNlKV07XG5cdFx0fTtcblx0XHQvLyBBY3Rpb25zIGFyZSBjb21pbmcgZnJvbSB0aGUgY29udmVydGVyIHNvIG9ubHkgZGV0ZXJtaW5pbmcgYWN0aW9ucyBhbmQgbm90IHN0YXRpY2FsbHkgaGlkZGVuIGFyZSBsaXN0ZWRcblx0XHRjb25zdCBkZXRlcm1pbmluZ0FjdGlvbnMgPSB0aGlzLmFjdGlvbnMuZmlsdGVyKChhY3Rpb24pID0+IGFjdGlvbi50eXBlID09PSBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbik7XG5cdFx0Y29uc3QgbWFuaWZlc3RBY3Rpb25CaW5kaW5ncyA9IF9nZW5lcmF0ZUJpbmRpbmdzRm9yQWN0aW9ucyhcblx0XHRcdHRoaXMuYWN0aW9ucy5maWx0ZXIoKGFjdGlvbikgPT4gT2JqZWN0UGFnZVRlbXBsYXRpbmcuaXNNYW5pZmVzdEFjdGlvbihhY3Rpb24pKVxuXHRcdCk7XG5cdFx0Y29uc3QgZGV0ZXJNaW5pbmdBY3Rpb25CaW5kaW5ncyA9IF9nZW5lcmF0ZUJpbmRpbmdzRm9yQWN0aW9ucyhkZXRlcm1pbmluZ0FjdGlvbnMpO1xuXG5cdFx0Y29uc3QgaXNOb3RIaWRkZW5EZXRlcm1pbmluZ0FjdGlvbiA9ICEhZGV0ZXJtaW5pbmdBY3Rpb25zLmZpbmQoKGFjdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgYWN0aW9uQ29udGV4dE1vZGVsUGF0aCA9IHRoaXMuZ2V0QWN0aW9uTW9kZWxQYXRoKGFjdGlvbik7XG5cdFx0XHRyZXR1cm4gIShhY3Rpb25Db250ZXh0TW9kZWxQYXRoPy50YXJnZXRPYmplY3QgYXMgRGF0YUZpZWxkRm9yQWN0aW9uIHwgdW5kZWZpbmVkKT8uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW47XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gb3IoXG5cdFx0XHRpc05vdEhpZGRlbkRldGVybWluaW5nQWN0aW9uLFxuXHRcdFx0b3IoLi4ubWFuaWZlc3RBY3Rpb25CaW5kaW5ncyksXG5cdFx0XHRhbmQob3IoVUkuSXNFZGl0YWJsZSwgb3IoLi4uZGV0ZXJNaW5pbmdBY3Rpb25CaW5kaW5ncykpLCBub3QocGF0aEluTW9kZWwoXCJpc0NyZWF0ZURpYWxvZ09wZW5cIiwgXCJpbnRlcm5hbFwiKSkpXG5cdFx0KTtcblx0fVxuXG5cdGdldERyYWZ0SW5kaWNhdG9yKCkge1xuXHRcdGNvbnN0IGVudGl0eVNldCA9ICh0aGlzLmRhdGFWaWV3TW9kZWxQYXRoLnRhcmdldEVudGl0eVNldCB8fCB0aGlzLmRhdGFWaWV3TW9kZWxQYXRoLnN0YXJ0aW5nRW50aXR5U2V0KSBhcyBFbnRpdHlTZXQ7IC8vIHN0YXJ0aW5nRW50aXR5U2V0IGlzIHVzZWQgb24gY29udGFpbm1lbnQgc2NlbmFyaW9cblx0XHRjb25zdCBjb21tb25Bbm5vdGF0aW9uID0gZW50aXR5U2V0LmFubm90YXRpb25zPy5Db21tb247XG5cdFx0aWYgKGNvbW1vbkFubm90YXRpb24/LkRyYWZ0Um9vdCB8fCBjb21tb25Bbm5vdGF0aW9uPy5EcmFmdE5vZGUpIHtcblx0XHRcdHJldHVybiA8RHJhZnRJbmRpY2F0b3Igc3RhdGU9XCJ7dWk+L2RyYWZ0U3RhdHVzfVwiIHZpc2libGU9XCJ7dWk+L2lzRWRpdGFibGV9XCIgLz47XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRwcml2YXRlIGdldEFwcGx5QnV0dG9uKHZpZXc6IFZpZXcsIGVtcGhhc2l6ZWRFeHByZXNzaW9uOiBQcm9wZXJ0eUJpbmRpbmdJbmZvKTogQnV0dG9uIHwgTWVudUJ1dHRvbiB7XG5cdFx0Y29uc3QgY29udHJvbGxlciA9IHZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIE9iamVjdFBhZ2VDb250cm9sbGVyO1xuXHRcdGNvbnN0IHZpZXdEYXRhID0gdmlldy5nZXRWaWV3RGF0YSgpIGFzIEJhc2VNYW5pZmVzdFNldHRpbmdzO1xuXHRcdGlmICh0aGlzLmlzRHJhZnRWYWxpZGF0aW9uICYmICF2aWV3RGF0YS5pc0Rlc2t0b3AgJiYgIXZpZXdEYXRhLmZjbEVuYWJsZWQpIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxNZW51QnV0dG9uXG5cdFx0XHRcdFx0dGV4dD1cIntzYXAuZmUuaTE4bj5UX0NPTU1PTl9PQkpFQ1RfUEFHRV9BUFBMWV9EUkFGVH1cIlxuXHRcdFx0XHRcdGRlZmF1bHRBY3Rpb249eygpID0+IGNvbnRyb2xsZXIuX2FwcGx5RG9jdW1lbnQodmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIHY0Q29udGV4dCl9XG5cdFx0XHRcdFx0dXNlRGVmYXVsdEFjdGlvbk9ubHk9XCJ0cnVlXCJcblx0XHRcdFx0XHRidXR0b25Nb2RlPVwiU3BsaXRcIlxuXHRcdFx0XHRcdHR5cGU9e2VtcGhhc2l6ZWRFeHByZXNzaW9ufVxuXHRcdFx0XHRcdHZpc2libGU9e1VJLklzRWRpdGFibGV9XG5cdFx0XHRcdD5cblx0XHRcdFx0XHQ8TWVudT5cblx0XHRcdFx0XHRcdDxNZW51SXRlbSB0ZXh0PVwie3NhcC5mZS5pMThuPlRfQ09NTU9OX09CSkVDVF9QQUdFX1ZBTElEQVRFX0RSQUZUfVwiIHByZXNzPXsoKSA9PiBjb250cm9sbGVyLl92YWxpZGF0ZURvY3VtZW50KCl9IC8+XG5cdFx0XHRcdFx0PC9NZW51PlxuXHRcdFx0XHQ8L01lbnVCdXR0b24+XG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRpZD17dGhpcy5jcmVhdGVJZChcIlN0YW5kYXJkQWN0aW9uOjpBcHBseVwiKX1cblx0XHRcdFx0dGV4dD1cIntzYXAuZmUuaTE4bj5UX0NPTU1PTl9PQkpFQ1RfUEFHRV9BUFBMWV9EUkFGVH1cIlxuXHRcdFx0XHR0eXBlPXtlbXBoYXNpemVkRXhwcmVzc2lvbn1cblx0XHRcdFx0ZW5hYmxlZD17dHJ1ZX1cblx0XHRcdFx0cHJlc3M9eygpID0+IGNvbnRyb2xsZXIuX2FwcGx5RG9jdW1lbnQodmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIHY0Q29udGV4dCl9XG5cdFx0XHRcdHZpc2libGU9XCJ7dWk+L2lzRWRpdGFibGV9XCJcblx0XHRcdC8+XG5cdFx0KTtcblx0fVxuXG5cdHByaXZhdGUgZ2V0UHJpbWFyeSh2aWV3OiBWaWV3LCBlbXBoYXNpemVkRXhwcmVzc2lvbjogUHJvcGVydHlCaW5kaW5nSW5mbyk6IEJ1dHRvbiB8IE1lbnVCdXR0b24ge1xuXHRcdGNvbnN0IHZpZXdEYXRhID0gdmlldy5nZXRWaWV3RGF0YSgpIGFzIEJhc2VNYW5pZmVzdFNldHRpbmdzO1xuXHRcdGNvbnN0IGNvbnRyb2xsZXIgPSB2aWV3LmdldENvbnRyb2xsZXIoKSBhcyBPYmplY3RQYWdlQ29udHJvbGxlcjtcblx0XHRpZiAodGhpcy5pc0RyYWZ0VmFsaWRhdGlvbiAmJiAhdmlld0RhdGEuaXNEZXNrdG9wKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8TWVudUJ1dHRvblxuXHRcdFx0XHRcdHRleHQ9e3RoaXMuZ2V0VGV4dFNhdmVCdXR0b24oKX1cblx0XHRcdFx0XHRqc3g6Y29tbWFuZD1cImNtZDpTYXZlfGRlZmF1bHRBY3Rpb25cIlxuXHRcdFx0XHRcdHVzZURlZmF1bHRBY3Rpb25Pbmx5PVwidHJ1ZVwiXG5cdFx0XHRcdFx0YnV0dG9uTW9kZT1cIlNwbGl0XCJcblx0XHRcdFx0XHR0eXBlPXtlbXBoYXNpemVkRXhwcmVzc2lvbn1cblx0XHRcdFx0XHR2aXNpYmxlPXtVSS5Jc0VkaXRhYmxlfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdFx0PE1lbnU+XG5cdFx0XHRcdFx0XHQ8TWVudUl0ZW0gdGV4dD1cIntzYXAuZmUuaTE4bj5UX0NPTU1PTl9PQkpFQ1RfUEFHRV9WQUxJREFURV9EUkFGVH1cIiBwcmVzcz17KCkgPT4gY29udHJvbGxlci5fdmFsaWRhdGVEb2N1bWVudCgpfSAvPlxuXHRcdFx0XHRcdDwvTWVudT5cblx0XHRcdFx0PC9NZW51QnV0dG9uPlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCdXR0b25cblx0XHRcdFx0aWQ9e3RoaXMuY3JlYXRlSWQoXCJTdGFuZGFyZEFjdGlvbjo6U2F2ZVwiKX1cblx0XHRcdFx0dGV4dD17dGhpcy5nZXRUZXh0U2F2ZUJ1dHRvbigpfVxuXHRcdFx0XHR0eXBlPXtlbXBoYXNpemVkRXhwcmVzc2lvbn1cblx0XHRcdFx0dmlzaWJsZT17VUkuSXNFZGl0YWJsZX1cblx0XHRcdFx0ZW5hYmxlZD17dHJ1ZX1cblx0XHRcdFx0anN4OmNvbW1hbmQ9XCJjbWQ6U2F2ZXxwcmVzc1wiXG5cdFx0XHQvPlxuXHRcdCk7XG5cdH1cblxuXHRwcml2YXRlIGdldFRleHRTYXZlQnV0dG9uKCkge1xuXHRcdGNvbnN0IHNhdmVCdXR0b25UZXh0ID0gdGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfT1BfT0JKRUNUX1BBR0VfU0FWRVwiKTtcblx0XHRjb25zdCBjcmVhdGVCdXR0b25UZXh0ID0gdGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfT1BfT0JKRUNUX1BBR0VfQ1JFQVRFXCIpO1xuXHRcdC8vIElmIHdlJ3JlIGluIHN0aWNreSBtb2RlICAtPiB0aGUgdWkgaXMgaW4gY3JlYXRlIG1vZGUsIHNob3cgQ3JlYXRlLCBlbHNlIHNob3cgU2F2ZVxuXHRcdC8vIElmIG5vdCAtPiB3ZSdyZSBpbiBkcmFmdCBBTkQgdGhlIGRyYWZ0IGlzIGEgbmV3IG9iamVjdCAoIUlzQWN0aXZlRW50aXR5ICYmICFIYXNBY3RpdmVFbnRpdHkpLCBzaG93IGNyZWF0ZSwgZWxzZSBzaG93IHNhdmVcblx0XHRyZXR1cm4gaWZFbHNlKFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHQodGhpcy5kYXRhVmlld01vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldCBhcyBFbnRpdHlTZXQpLmFubm90YXRpb25zLlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQgIT09IHVuZGVmaW5lZCxcblx0XHRcdFx0VUkuSXNDcmVhdGVNb2RlLFxuXHRcdFx0XHREcmFmdC5Jc05ld09iamVjdFxuXHRcdFx0KSxcblx0XHRcdGNyZWF0ZUJ1dHRvblRleHQsXG5cdFx0XHRzYXZlQnV0dG9uVGV4dFxuXHRcdCk7XG5cdH1cblxuXHRwcml2YXRlIGdldENhbmNlbEJ1dHRvbigpOiBCdXR0b24ge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdGlkPXt0aGlzLmNyZWF0ZUlkKFwiU3RhbmRhcmRBY3Rpb246OkNhbmNlbFwiKX1cblx0XHRcdFx0dGV4dD17XG5cdFx0XHRcdFx0TW9kZWxIZWxwZXIuaXNEcmFmdFJvb3QodGhpcy5kYXRhVmlld01vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQpXG5cdFx0XHRcdFx0XHQ/IFwie3NhcC5mZS5pMThuPkNfQ09NTU9OX09CSkVDVF9QQUdFX0RJU0NBUkRfRFJBRlR9XCJcblx0XHRcdFx0XHRcdDogXCJ7c2FwLmZlLmkxOG4+Q19DT01NT05fT0JKRUNUX1BBR0VfQ0FOQ0VMfVwiXG5cdFx0XHRcdH1cblx0XHRcdFx0anN4OmNvbW1hbmQ9XCJjbWQ6Q2FuY2VsfHByZXNzXCJcblx0XHRcdFx0dmlzaWJsZT17VUkuSXNFZGl0YWJsZX1cblx0XHRcdFx0YXJpYUhhc1BvcHVwPXtjb21waWxlRXhwcmVzc2lvbihpZkVsc2UocGF0aEluTW9kZWwoXCIvaXNEb2N1bWVudE1vZGlmaWVkXCIsIFwidWlcIiksIGNvbnN0YW50KFwiRGlhbG9nXCIpLCBjb25zdGFudChcIk5vbmVcIikpKX1cblx0XHRcdFx0ZW5hYmxlZD17dHJ1ZX1cblx0XHRcdFx0bGF5b3V0RGF0YT17PE92ZXJmbG93VG9vbGJhckxheW91dERhdGEgcHJpb3JpdHk9XCJOZXZlck92ZXJmbG93XCIgLz59XG5cdFx0XHQvPlxuXHRcdCk7XG5cdH1cblxuXHRwcml2YXRlIGdldERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbihhY3Rpb246IEJhc2VBY3Rpb24pOiBCdXR0b24gfCB1bmRlZmluZWQge1xuXHRcdGlmIChhY3Rpb24uYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxEYXRhRmllbGRGb3JBY3Rpb25CbG9ja1xuXHRcdFx0XHRcdGlkPXtnZW5lcmF0ZShbdGhpcy5pZCwgdGhpcy5nZXRBY3Rpb25Nb2RlbFBhdGgoYWN0aW9uKV0pfVxuXHRcdFx0XHRcdGFjdGlvbj17YWN0aW9ufVxuXHRcdFx0XHRcdGNvbnRleHRQYXRoPXt0aGlzLmNvbnRleHRQYXRofVxuXHRcdFx0XHQvPlxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGdldE1hbmlmZXN0QnV0dG9uKGFjdGlvbjogQmFzZUFjdGlvbik6IEJ1dHRvbiB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKE9iamVjdFBhZ2VUZW1wbGF0aW5nLmlzTWFuaWZlc3RBY3Rpb24oYWN0aW9uKSkge1xuXHRcdFx0cmV0dXJuIDxDdXN0b21BY3Rpb25CbG9jayBpZD17Z2VuZXJhdGUoW1wiZmVcIiwgXCJGb290ZXJCYXJcIiwgYWN0aW9uLmlkXSl9IGFjdGlvbj17YWN0aW9ufSAvPjtcblx0XHR9XG5cdH1cblxuXHRnZXRBY3Rpb25Db250cm9scyh2aWV3OiBWaWV3KSB7XG5cdFx0Y29uc3QgZW1waGFzaXplZEJ1dHRvbkV4cHJlc3Npb24gPSBPYmplY3RQYWdlVGVtcGxhdGluZy5idWlsZEVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uKHRoaXMuZGF0YVZpZXdNb2RlbFBhdGgpO1xuXHRcdHJldHVybiB0aGlzLmFjdGlvbnNcblx0XHRcdC5tYXAoKGFjdGlvbikgPT4ge1xuXHRcdFx0XHRzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG5cdFx0XHRcdFx0Y2FzZSBBY3Rpb25UeXBlLkRlZmF1bHRBcHBseTpcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmdldEFwcGx5QnV0dG9uKHZpZXcsIGVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uKTtcblx0XHRcdFx0XHRjYXNlIEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uKGFjdGlvbik7XG5cdFx0XHRcdFx0Y2FzZSBBY3Rpb25UeXBlLlByaW1hcnk6XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRQcmltYXJ5KHZpZXcsIGVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uKTtcblx0XHRcdFx0XHRjYXNlIEFjdGlvblR5cGUuU2Vjb25kYXJ5OlxuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0Q2FuY2VsQnV0dG9uKCk7XG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmdldE1hbmlmZXN0QnV0dG9uKGFjdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuZmlsdGVyKChhY3Rpb24pOiBhY3Rpb24gaXMgQnV0dG9uID0+ICEhYWN0aW9uKTtcblx0fVxuXG5cdGdldENvbnRlbnQodmlldzogVmlldykge1xuXHRcdGNvbnN0IGNvbnRyb2xsZXIgPSB2aWV3LmdldENvbnRyb2xsZXIoKSBhcyBPYmplY3RQYWdlQ29udHJvbGxlcjtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PE92ZXJmbG93VG9vbGJhciBpZD17dGhpcy5pZH0gYXN5bmNNb2RlPXt0cnVlfSB2aXNpYmxlPXt0aGlzLmdldFZpc2liaWxpdHkoKX0+XG5cdFx0XHRcdDxJbnZpc2libGVUZXh0XG5cdFx0XHRcdFx0aWQ9e3RoaXMuY3JlYXRlSWQoXCJNZXNzYWdlQnV0dG9uOjpBcmlhVGV4dFwiKX1cblx0XHRcdFx0XHR0ZXh0PVwie3NhcC5mZS5pMThuPkNfQ09NTU9OX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfQlVUVE9OX0FSSUFfVEVYVH1cIlxuXHRcdFx0XHQvPlxuXHRcdFx0XHQ8TWVzc2FnZUJ1dHRvblxuXHRcdFx0XHRcdGlkPXt0aGlzLmNyZWF0ZUlkKFwiTWVzc2FnZUJ1dHRvblwiKX1cblx0XHRcdFx0XHRtZXNzYWdlQ2hhbmdlPXsoKSA9PiBjb250cm9sbGVyLl9nZXRGb290ZXJWaXNpYmlsaXR5KCl9XG5cdFx0XHRcdFx0YXJpYUxhYmVsbGVkQnk9e1t0aGlzLmNyZWF0ZUlkKFwiTWVzc2FnZUJ1dHRvbjo6QXJpYVRleHRcIikgYXMgc3RyaW5nXX1cblx0XHRcdFx0XHR0eXBlPVwiRW1waGFzaXplZFwiXG5cdFx0XHRcdFx0YXJpYUhhc1BvcHVwPVwiRGlhbG9nXCJcblx0XHRcdFx0Lz5cblx0XHRcdFx0PFRvb2xiYXJTcGFjZXIgLz5cblx0XHRcdFx0e3RoaXMuZ2V0RHJhZnRJbmRpY2F0b3IoKX1cblx0XHRcdFx0e3RoaXMuZ2V0QWN0aW9uQ29udHJvbHModmlldyl9XG5cdFx0XHQ8L092ZXJmbG93VG9vbGJhcj5cblx0XHQpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQTZDcUJBLGtCQUFrQixXQUR0Q0MsbUJBQW1CLENBQUM7SUFBRUMsSUFBSSxFQUFFLGVBQWU7SUFBRUMsU0FBUyxFQUFFO0VBQTZDLENBQUMsQ0FBQyxVQUV0R0MsY0FBYyxDQUFDO0lBQ2ZDLElBQUksRUFBRSxRQUFRO0lBQ2RDLFFBQVEsRUFB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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ResourceModelHelper", "sap/m/Button", "sap/m/CustomListItem", "sap/m/Dialog", "sap/m/Label", "sap/m/List", "sap/m/Text", "sap/m/VBox", "sap/ui/core/CustomData", "sap/ui/core/library", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/jsxs", "sap/fe/core/jsx-runtime/Fragment"], function (Log, BuildingBlockSupport, RuntimeBuildingBlock, ClassSupport, ResourceModelHelper, Button, CustomListItem, Dialog, Label, List, Text, VBox, CustomData, library, _jsx, _jsxs, _Fragment) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var ValueState = library.ValueState;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var defineReference = ClassSupport.defineReference;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var DraftDataLossOptions;
  (function (DraftDataLossOptions) {
    DraftDataLossOptions["Save"] = "draftDataLossOptionSave";
    DraftDataLossOptions["Keep"] = "draftDataLossOptionKeep";
    DraftDataLossOptions["Discard"] = "draftDataLossOptionDiscard";
  })(DraftDataLossOptions || (DraftDataLossOptions = {}));
  let DraftDataLossDialogBlock = (_dec = defineBuildingBlock({
    name: "DraftDataLossDialog",
    namespace: "sap.fe.core.controllerextensions"
  }), _dec2 = defineReference(), _dec3 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(DraftDataLossDialogBlock, _RuntimeBuildingBlock);
    function DraftDataLossDialogBlock(props) {
      var _this;
      _this = _RuntimeBuildingBlock.call(this, props) || this;
      _initializerDefineProperty(_this, "dataLossDialog", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "optionsList", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    _exports = DraftDataLossDialogBlock;
    var _proto = DraftDataLossDialogBlock.prototype;
    /**
     * Opens the data loss dialog.
     *
     * @function
     * @name dataLossConfirmation
     */
    _proto.dataLossConfirmation = function dataLossConfirmation() {
      var _this$optionsList$cur;
      const view = this.controller.getView();
      this.dataLossResourceModel = getResourceModel(view);
      this.getContent();
      const dataLossConfirm = () => this.handleDataLossOk();
      (_this$optionsList$cur = this.optionsList.current) === null || _this$optionsList$cur === void 0 ? void 0 : _this$optionsList$cur.addEventDelegate({
        onsapenter: function () {
          dataLossConfirm();
        }
      });
      view.addDependent(this.dataLossDialog.current);
      this.openDataLossDialog();
      this.selectAndFocusFirstEntry();
    }

    /**
     * Executes the follow-up function and resolves/rejects the promise.
     *
     * @function
     * @name performAfterDiscardorKeepDraft
     * @param processFunctionOnDatalossOk Callback to process the draft handler
     * @param processFunctionOnDatalossCancel Callback to process the cancel function
     * @param controller Controller of the current view
     * @param skipBindingToView The parameter to skip the binding to the view
     */;
    _proto.performAfterDiscardorKeepDraft = async function performAfterDiscardorKeepDraft(processFunctionOnDatalossOk, processFunctionOnDatalossCancel, controller, skipBindingToView) {
      this.controller = controller;
      this.skipBindingToView = skipBindingToView;
      this.dataLossConfirmation();
      return new Promise((resolve, reject) => {
        this.onDataLossConfirmationFollowUpFunction = context => {
          const value = processFunctionOnDatalossOk(context);
          resolve(value);
        };
        this.onDataLossCancelFollowUpFunction = () => {
          processFunctionOnDatalossCancel();
          reject();
        };
      });
    }

    /**
     * Executes the logic when the data loss dialog is confirmed. The selection of an option resolves the promise and leads to the
     * processing of the originally triggered action like e.g. a back navigation.
     *
     * @function
     * @name handleDataLossOk
     */;
    _proto.handleDataLossOk = function handleDataLossOk() {
      const selectedKey = this.getSelectedKey();
      if (selectedKey === DraftDataLossOptions.Save) {
        this.saveDocument(this.controller).then(this.onDataLossConfirmationFollowUpFunction).catch(function (error) {
          Log.error("Error while saving document", error);
        });
        this.closeDataLossDialog();
      } else if (selectedKey === DraftDataLossOptions.Keep) {
        this.onDataLossConfirmationFollowUpFunction();
        this.closeDataLossDialog();
      } else if (selectedKey === DraftDataLossOptions.Discard) {
        this.discardDraft(this.controller, this.skipBindingToView).then(this.onDataLossConfirmationFollowUpFunction).catch(function (error) {
          Log.error("Error while discarding draft", error);
        });
        this.closeDataLossDialog();
      }
    }

    /**
     * Handler to close the dataloss dialog.
     *
     * @function
     * @name handleDataLossCancel
     */;
    _proto.handleDataLossCancel = function handleDataLossCancel() {
      this.onDataLossCancelFollowUpFunction();
      this.closeDataLossDialog();
    }

    /**
     * Sets the focus on the first list item of the dialog.
     *
     * @function
     * @name selectAndFocusFirstEntry
     */;
    _proto.selectAndFocusFirstEntry = function selectAndFocusFirstEntry() {
      var _this$optionsList$cur2, _this$optionsList$cur3;
      const firstListItemOption = (_this$optionsList$cur2 = this.optionsList.current) === null || _this$optionsList$cur2 === void 0 ? void 0 : _this$optionsList$cur2.getItems()[0];
      (_this$optionsList$cur3 = this.optionsList.current) === null || _this$optionsList$cur3 === void 0 ? void 0 : _this$optionsList$cur3.setSelectedItem(firstListItemOption);
      // We do not set the focus on the button, but catch the ENTER key in the dialog
      // and process it as Ok, since focusing the button was reported as an ACC issue
      firstListItemOption === null || firstListItemOption === void 0 ? void 0 : firstListItemOption.focus();
    }

    /**
     * Discards the draft.
     *
     * @function
     * @name discardDraft
     * @param controller Controller of the current view
     * @param skipBindingToView The parameter to skip the binding to the view
     * @returns A promise resolved if cancelDocument was successful
     */;
    _proto.discardDraft = async function discardDraft(controller, skipBindingToView) {
      const context = controller.getView().getBindingContext();
      const params = {
        skipBackNavigation: true,
        skipDiscardPopover: true,
        skipBindingToView: skipBindingToView !== undefined ? skipBindingToView : true
      };
      return controller.editFlow.cancelDocument(context, params);
    }

    /**
     * Saves the document. If the controller is of type ObjectPage, then internal _saveDocument is called, otherwise saveDocument
     * from EditFlow is called.
     *
     * @function
     * @name saveDocument
     * @param controller Controller of the current view
     * @returns A promise resolved if the save was successful
     */;
    _proto.saveDocument = function saveDocument(controller) {
      const context = controller.getView().getBindingContext();
      if (controller.isA("sap.fe.templates.ObjectPage.ObjectPageController")) {
        return controller._saveDocument(context);
      } else {
        return controller.editFlow.saveDocument(context, {});
      }
    }

    /**
     * Gets the key of the selected item from the list of options that was set via customData.
     *
     * @function
     * @name getSelectedKey
     * @returns The key of the currently selected item
     */;
    _proto.getSelectedKey = function getSelectedKey() {
      const optionsList = this.optionsList.current;
      return optionsList.getSelectedItem().data("itemKey");
    }

    /**
     * Handler to open the dataloss dialog.
     *
     * @function
     * @name openDataLossDialog
     */;
    _proto.openDataLossDialog = function openDataLossDialog() {
      var _this$dataLossDialog$;
      (_this$dataLossDialog$ = this.dataLossDialog.current) === null || _this$dataLossDialog$ === void 0 ? void 0 : _this$dataLossDialog$.open();
    }

    /**
     * Handler to close the dataloss dialog.
     *
     * @function
     * @name closeDataLossDialog
     */;
    _proto.closeDataLossDialog = function closeDataLossDialog() {
      var _this$dataLossDialog$2, _this$dataLossDialog$3;
      (_this$dataLossDialog$2 = this.dataLossDialog.current) === null || _this$dataLossDialog$2 === void 0 ? void 0 : _this$dataLossDialog$2.close();
      (_this$dataLossDialog$3 = this.dataLossDialog.current) === null || _this$dataLossDialog$3 === void 0 ? void 0 : _this$dataLossDialog$3.destroy();
    }

    /**
     * Returns the confirm button.
     *
     * @function
     * @name getConfirmButton
     * @returns A button
     */;
    _proto.getConfirmButton = function getConfirmButton() {
      return _jsx(Button, {
        text: this.dataLossResourceModel.getText("C_COMMON_DIALOG_OK"),
        type: "Emphasized",
        press: () => this.handleDataLossOk()
      });
    }

    /**
     * Returns the cancel button.
     *
     * @function
     * @name getCancelButton
     * @returns A button
     */;
    _proto.getCancelButton = function getCancelButton() {
      return _jsx(Button, {
        text: this.dataLossResourceModel.getText("C_COMMON_DIALOG_CANCEL"),
        press: () => this.handleDataLossCancel()
      });
    }

    /**
     * The building block render function.
     *
     * @returns An XML-based string
     */;
    _proto.getContent = function getContent() {
      var _this$controller$getV;
      const hasActiveEntity = (_this$controller$getV = this.controller.getView().getBindingContext()) === null || _this$controller$getV === void 0 ? void 0 : _this$controller$getV.getObject().HasActiveEntity;
      const description = hasActiveEntity ? this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_POPUP_MESSAGE_SAVE") : this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_POPUP_MESSAGE_CREATE");
      const createOrSaveLabel = hasActiveEntity ? this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_SAVE_DRAFT_RBL") : this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_CREATE_ENTITY_RBL");
      const createOrSaveText = hasActiveEntity ? this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_SAVE_DRAFT_TOL") : this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_CREATE_ENTITY_TOL");
      return _jsx(Dialog, {
        title: this.dataLossResourceModel.getText("WARNING"),
        state: ValueState.Warning,
        type: "Message",
        contentWidth: "22rem",
        ref: this.dataLossDialog,
        children: {
          content: _jsxs(_Fragment, {
            children: [_jsx(Text, {
              text: description,
              class: "sapUiTinyMarginBegin sapUiTinyMarginTopBottom"
            }), _jsxs(List, {
              mode: "SingleSelectLeft",
              showSeparators: "None",
              includeItemInSelection: "true",
              backgroundDesign: "Transparent",
              class: "sapUiNoContentPadding",
              ref: this.optionsList,
              children: [_jsx(CustomListItem, {
                customData: [new CustomData({
                  key: "itemKey",
                  value: "draftDataLossOptionSave"
                })],
                children: _jsxs(VBox, {
                  class: "sapUiTinyMargin",
                  children: [_jsx(Label, {
                    text: createOrSaveLabel,
                    design: "Bold"
                  }), _jsx(Text, {
                    text: createOrSaveText
                  })]
                })
              }), _jsx(CustomListItem, {
                customData: [new CustomData({
                  key: "itemKey",
                  value: "draftDataLossOptionKeep"
                })],
                children: _jsxs(VBox, {
                  class: "sapUiTinyMargin",
                  children: [_jsx(Label, {
                    text: this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_KEEP_DRAFT_RBL"),
                    design: "Bold"
                  }), _jsx(Text, {
                    text: this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_KEEP_DRAFT_TOL")
                  })]
                })
              }), _jsx(CustomListItem, {
                customData: [new CustomData({
                  key: "itemKey",
                  value: "draftDataLossOptionDiscard"
                })],
                children: _jsxs(VBox, {
                  class: "sapUiTinyMargin",
                  children: [_jsx(Label, {
                    text: this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_DISCARD_DRAFT_RBL"),
                    design: "Bold"
                  }), _jsx(Text, {
                    text: this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_DISCARD_DRAFT_TOL")
                  })]
                })
              })]
            })]
          }),
          buttons: _jsxs(_Fragment, {
            children: ["confirmButton = ", this.getConfirmButton(), "cancelButton = ", this.getCancelButton()]
          })
        }
      });
    };
    return DraftDataLossDialogBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "dataLossDialog", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "optionsList", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DraftDataLossDialogBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFmdERhdGFMb3NzT3B0aW9ucyIsIkRyYWZ0RGF0YUxvc3NEaWFsb2dCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiZGVmaW5lUmVmZXJlbmNlIiwicHJvcHMiLCJkYXRhTG9zc0NvbmZpcm1hdGlvbiIsInZpZXciLCJjb250cm9sbGVyIiwiZ2V0VmlldyIsImRhdGFMb3NzUmVzb3VyY2VNb2RlbCIsImdldFJlc291cmNlTW9kZWwiLCJnZXRDb250ZW50IiwiZGF0YUxvc3NDb25maXJtIiwiaGFuZGxlRGF0YUxvc3NPayIsIm9wdGlvbnNMaXN0IiwiY3VycmVudCIsImFkZEV2ZW50RGVsZWdhdGUiLCJvbnNhcGVudGVyIiwiYWRkRGVwZW5kZW50IiwiZGF0YUxvc3NEaWFsb2ciLCJvcGVuRGF0YUxvc3NEaWFsb2ciLCJzZWxlY3RBbmRGb2N1c0ZpcnN0RW50cnkiLCJwZXJmb3JtQWZ0ZXJEaXNjYXJkb3JLZWVwRHJhZnQiLCJwcm9jZXNzRnVuY3Rpb25PbkRhdGFsb3NzT2siLCJwcm9jZXNzRnVuY3Rpb25PbkRhdGFsb3NzQ2FuY2VsIiwic2tpcEJpbmRpbmdUb1ZpZXciLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9uRGF0YUxvc3NDb25maXJtYXRpb25Gb2xsb3dVcEZ1bmN0aW9uIiwiY29udGV4dCIsInZhbHVlIiwib25EYXRhTG9zc0NhbmNlbEZvbGxvd1VwRnVuY3Rpb24iLCJzZWxlY3RlZEtleSIsImdldFNlbGVjdGVkS2V5IiwiU2F2ZSIsInNhdmVEb2N1bWVudCIsInRoZW4iLCJjYXRjaCIsImVycm9yIiwiTG9nIiwiY2xvc2VEYXRhTG9zc0RpYWxvZyIsIktlZXAiLCJEaXNjYXJkIiwiZGlzY2FyZERyYWZ0IiwiaGFuZGxlRGF0YUxvc3NDYW5jZWwiLCJmaXJzdExpc3RJdGVtT3B0aW9uIiwiZ2V0SXRlbXMiLCJzZXRTZWxlY3RlZEl0ZW0iLCJmb2N1cyIsImdldEJpbmRpbmdDb250ZXh0IiwicGFyYW1zIiwic2tpcEJhY2tOYXZpZ2F0aW9uIiwic2tpcERpc2NhcmRQb3BvdmVyIiwidW5kZWZpbmVkIiwiZWRpdEZsb3ciLCJjYW5jZWxEb2N1bWVudCIsImlzQSIsIl9zYXZlRG9jdW1lbnQiLCJnZXRTZWxlY3RlZEl0ZW0iLCJkYXRhIiwib3BlbiIsImNsb3NlIiwiZGVzdHJveSIsImdldENvbmZpcm1CdXR0b24iLCJnZXRUZXh0IiwiZ2V0Q2FuY2VsQnV0dG9uIiwiaGFzQWN0aXZlRW50aXR5IiwiZ2V0T2JqZWN0IiwiSGFzQWN0aXZlRW50aXR5IiwiZGVzY3JpcHRpb24iLCJjcmVhdGVPclNhdmVMYWJlbCIsImNyZWF0ZU9yU2F2ZVRleHQiLCJWYWx1ZVN0YXRlIiwiV2FybmluZyIsImNvbnRlbnQiLCJDdXN0b21EYXRhIiwia2V5IiwiYnV0dG9ucyIsIlJ1bnRpbWVCdWlsZGluZ0Jsb2NrIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJEcmFmdERhdGFMb3NzRGlhbG9nLmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCBSdW50aW1lQnVpbGRpbmdCbG9jayBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvUnVudGltZUJ1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCB0eXBlIEVkaXRGbG93IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9FZGl0Rmxvd1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGRlZmluZVJlZmVyZW5jZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgUmVmIH0gZnJvbSBcInNhcC9mZS9jb3JlL2pzeC1ydW50aW1lL2pzeFwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgQ3VzdG9tTGlzdEl0ZW0gZnJvbSBcInNhcC9tL0N1c3RvbUxpc3RJdGVtXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBMYWJlbCBmcm9tIFwic2FwL20vTGFiZWxcIjtcbmltcG9ydCBMaXN0IGZyb20gXCJzYXAvbS9MaXN0XCI7XG5pbXBvcnQgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IFZCb3ggZnJvbSBcInNhcC9tL1ZCb3hcIjtcbmltcG9ydCBDdXN0b21EYXRhIGZyb20gXCJzYXAvdWkvY29yZS9DdXN0b21EYXRhXCI7XG5pbXBvcnQgdHlwZSBVSTVFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgeyBWYWx1ZVN0YXRlIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwiLi4vLi4vUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlTW9kZWwgZnJvbSBcIi4uLy4uL1Jlc291cmNlTW9kZWxcIjtcblxuLy9jdXN0b20gdHlwZSBmb3IgY29udHJvbGxlciBpbiBvcmRlciB0byBhbGxvdyBhZGRpdGlvbmFsIHByb3BlcnRpZXNcbnR5cGUgRGF0YUxvc3NDb250cm9sbGVyID0gUGFnZUNvbnRyb2xsZXIgJiB7IF9zYXZlRG9jdW1lbnQ6IEZ1bmN0aW9uOyBlZGl0RmxvdzogRWRpdEZsb3cgfTtcblxuZW51bSBEcmFmdERhdGFMb3NzT3B0aW9ucyB7XG5cdFNhdmUgPSBcImRyYWZ0RGF0YUxvc3NPcHRpb25TYXZlXCIsXG5cdEtlZXAgPSBcImRyYWZ0RGF0YUxvc3NPcHRpb25LZWVwXCIsXG5cdERpc2NhcmQgPSBcImRyYWZ0RGF0YUxvc3NPcHRpb25EaXNjYXJkXCJcbn1cblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkRyYWZ0RGF0YUxvc3NEaWFsb2dcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zXCJcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcmFmdERhdGFMb3NzRGlhbG9nQmxvY2sgZXh0ZW5kcyBSdW50aW1lQnVpbGRpbmdCbG9jayB7XG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8RHJhZnREYXRhTG9zc0RpYWxvZ0Jsb2NrPikge1xuXHRcdHN1cGVyKHByb3BzKTtcblx0fVxuXG5cdEBkZWZpbmVSZWZlcmVuY2UoKVxuXHRkYXRhTG9zc0RpYWxvZyE6IFJlZjxEaWFsb2c+O1xuXG5cdEBkZWZpbmVSZWZlcmVuY2UoKVxuXHRvcHRpb25zTGlzdCE6IFJlZjxMaXN0PjtcblxuXHRwcml2YXRlIG9uRGF0YUxvc3NDb25maXJtYXRpb25Gb2xsb3dVcEZ1bmN0aW9uITogKCkgPT4gdm9pZDtcblxuXHRwcml2YXRlIG9uRGF0YUxvc3NDYW5jZWxGb2xsb3dVcEZ1bmN0aW9uITogKCkgPT4gdm9pZDtcblxuXHRwcml2YXRlIGNvbnRyb2xsZXIhOiBEYXRhTG9zc0NvbnRyb2xsZXI7XG5cblx0cHJpdmF0ZSBkYXRhTG9zc1Jlc291cmNlTW9kZWwhOiBSZXNvdXJjZU1vZGVsO1xuXG5cdHByaXZhdGUgc2tpcEJpbmRpbmdUb1ZpZXchOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXG5cdC8qKlxuXHQgKiBPcGVucyB0aGUgZGF0YSBsb3NzIGRpYWxvZy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGRhdGFMb3NzQ29uZmlybWF0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGRhdGFMb3NzQ29uZmlybWF0aW9uKCkge1xuXHRcdGNvbnN0IHZpZXcgPSB0aGlzLmNvbnRyb2xsZXIuZ2V0VmlldygpO1xuXHRcdHRoaXMuZGF0YUxvc3NSZXNvdXJjZU1vZGVsID0gZ2V0UmVzb3VyY2VNb2RlbCh2aWV3KTtcblx0XHR0aGlzLmdldENvbnRlbnQoKTtcblx0XHRjb25zdCBkYXRhTG9zc0NvbmZpcm0gPSAoKSA9PiB0aGlzLmhhbmRsZURhdGFMb3NzT2soKTtcblx0XHR0aGlzLm9wdGlvbnNMaXN0LmN1cnJlbnQ/LmFkZEV2ZW50RGVsZWdhdGUoe1xuXHRcdFx0b25zYXBlbnRlcjogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRkYXRhTG9zc0NvbmZpcm0oKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHR2aWV3LmFkZERlcGVuZGVudCh0aGlzLmRhdGFMb3NzRGlhbG9nLmN1cnJlbnQgYXMgVUk1RWxlbWVudCk7XG5cdFx0dGhpcy5vcGVuRGF0YUxvc3NEaWFsb2coKTtcblx0XHR0aGlzLnNlbGVjdEFuZEZvY3VzRmlyc3RFbnRyeSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4ZWN1dGVzIHRoZSBmb2xsb3ctdXAgZnVuY3Rpb24gYW5kIHJlc29sdmVzL3JlamVjdHMgdGhlIHByb21pc2UuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBwZXJmb3JtQWZ0ZXJEaXNjYXJkb3JLZWVwRHJhZnRcblx0ICogQHBhcmFtIHByb2Nlc3NGdW5jdGlvbk9uRGF0YWxvc3NPayBDYWxsYmFjayB0byBwcm9jZXNzIHRoZSBkcmFmdCBoYW5kbGVyXG5cdCAqIEBwYXJhbSBwcm9jZXNzRnVuY3Rpb25PbkRhdGFsb3NzQ2FuY2VsIENhbGxiYWNrIHRvIHByb2Nlc3MgdGhlIGNhbmNlbCBmdW5jdGlvblxuXHQgKiBAcGFyYW0gY29udHJvbGxlciBDb250cm9sbGVyIG9mIHRoZSBjdXJyZW50IHZpZXdcblx0ICogQHBhcmFtIHNraXBCaW5kaW5nVG9WaWV3IFRoZSBwYXJhbWV0ZXIgdG8gc2tpcCB0aGUgYmluZGluZyB0byB0aGUgdmlld1xuXHQgKi9cblx0cHVibGljIGFzeW5jIHBlcmZvcm1BZnRlckRpc2NhcmRvcktlZXBEcmFmdChcblx0XHRwcm9jZXNzRnVuY3Rpb25PbkRhdGFsb3NzT2s6IEZ1bmN0aW9uLFxuXHRcdHByb2Nlc3NGdW5jdGlvbk9uRGF0YWxvc3NDYW5jZWw6IEZ1bmN0aW9uLFxuXHRcdGNvbnRyb2xsZXI6IERhdGFMb3NzQ29udHJvbGxlcixcblx0XHRza2lwQmluZGluZ1RvVmlldzogYm9vbGVhbiB8IHVuZGVmaW5lZFxuXHQpIHtcblx0XHR0aGlzLmNvbnRyb2xsZXIgPSBjb250cm9sbGVyO1xuXHRcdHRoaXMuc2tpcEJpbmRpbmdUb1ZpZXcgPSBza2lwQmluZGluZ1RvVmlldztcblx0XHR0aGlzLmRhdGFMb3NzQ29uZmlybWF0aW9uKCk7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlOiAodmFsdWU6IHVua25vd24pID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IHVua25vd24pID0+IHZvaWQpID0+IHtcblx0XHRcdHRoaXMub25EYXRhTG9zc0NvbmZpcm1hdGlvbkZvbGxvd1VwRnVuY3Rpb24gPSAoY29udGV4dD86IENvbnRleHQpID0+IHtcblx0XHRcdFx0Y29uc3QgdmFsdWUgPSBwcm9jZXNzRnVuY3Rpb25PbkRhdGFsb3NzT2soY29udGV4dCk7XG5cdFx0XHRcdHJlc29sdmUodmFsdWUpO1xuXHRcdFx0fTtcblx0XHRcdHRoaXMub25EYXRhTG9zc0NhbmNlbEZvbGxvd1VwRnVuY3Rpb24gPSAoKSA9PiB7XG5cdFx0XHRcdHByb2Nlc3NGdW5jdGlvbk9uRGF0YWxvc3NDYW5jZWwoKTtcblx0XHRcdFx0cmVqZWN0KCk7XG5cdFx0XHR9O1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV4ZWN1dGVzIHRoZSBsb2dpYyB3aGVuIHRoZSBkYXRhIGxvc3MgZGlhbG9nIGlzIGNvbmZpcm1lZC4gVGhlIHNlbGVjdGlvbiBvZiBhbiBvcHRpb24gcmVzb2x2ZXMgdGhlIHByb21pc2UgYW5kIGxlYWRzIHRvIHRoZVxuXHQgKiBwcm9jZXNzaW5nIG9mIHRoZSBvcmlnaW5hbGx5IHRyaWdnZXJlZCBhY3Rpb24gbGlrZSBlLmcuIGEgYmFjayBuYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaGFuZGxlRGF0YUxvc3NPa1xuXHQgKi9cblx0cHJpdmF0ZSBoYW5kbGVEYXRhTG9zc09rKCkge1xuXHRcdGNvbnN0IHNlbGVjdGVkS2V5ID0gdGhpcy5nZXRTZWxlY3RlZEtleSgpO1xuXHRcdGlmIChzZWxlY3RlZEtleSA9PT0gRHJhZnREYXRhTG9zc09wdGlvbnMuU2F2ZSkge1xuXHRcdFx0dGhpcy5zYXZlRG9jdW1lbnQodGhpcy5jb250cm9sbGVyKVxuXHRcdFx0XHQudGhlbih0aGlzLm9uRGF0YUxvc3NDb25maXJtYXRpb25Gb2xsb3dVcEZ1bmN0aW9uKVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycm9yOiBzdHJpbmcgfCB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBzYXZpbmcgZG9jdW1lbnRcIiwgZXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHRcdHRoaXMuY2xvc2VEYXRhTG9zc0RpYWxvZygpO1xuXHRcdH0gZWxzZSBpZiAoc2VsZWN0ZWRLZXkgPT09IERyYWZ0RGF0YUxvc3NPcHRpb25zLktlZXApIHtcblx0XHRcdHRoaXMub25EYXRhTG9zc0NvbmZpcm1hdGlvbkZvbGxvd1VwRnVuY3Rpb24oKTtcblx0XHRcdHRoaXMuY2xvc2VEYXRhTG9zc0RpYWxvZygpO1xuXHRcdH0gZWxzZSBpZiAoc2VsZWN0ZWRLZXkgPT09IERyYWZ0RGF0YUxvc3NPcHRpb25zLkRpc2NhcmQpIHtcblx0XHRcdHRoaXMuZGlzY2FyZERyYWZ0KHRoaXMuY29udHJvbGxlciwgdGhpcy5za2lwQmluZGluZ1RvVmlldylcblx0XHRcdFx0LnRoZW4odGhpcy5vbkRhdGFMb3NzQ29uZmlybWF0aW9uRm9sbG93VXBGdW5jdGlvbilcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZGlzY2FyZGluZyBkcmFmdFwiLCBlcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0dGhpcy5jbG9zZURhdGFMb3NzRGlhbG9nKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXIgdG8gY2xvc2UgdGhlIGRhdGFsb3NzIGRpYWxvZy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGhhbmRsZURhdGFMb3NzQ2FuY2VsXG5cdCAqL1xuXHRwcml2YXRlIGhhbmRsZURhdGFMb3NzQ2FuY2VsKCkge1xuXHRcdHRoaXMub25EYXRhTG9zc0NhbmNlbEZvbGxvd1VwRnVuY3Rpb24oKTtcblx0XHR0aGlzLmNsb3NlRGF0YUxvc3NEaWFsb2coKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBmb2N1cyBvbiB0aGUgZmlyc3QgbGlzdCBpdGVtIG9mIHRoZSBkaWFsb2cuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzZWxlY3RBbmRGb2N1c0ZpcnN0RW50cnlcblx0ICovXG5cdHByaXZhdGUgc2VsZWN0QW5kRm9jdXNGaXJzdEVudHJ5KCkge1xuXHRcdGNvbnN0IGZpcnN0TGlzdEl0ZW1PcHRpb246IEN1c3RvbUxpc3RJdGVtID0gdGhpcy5vcHRpb25zTGlzdC5jdXJyZW50Py5nZXRJdGVtcygpWzBdIGFzIEN1c3RvbUxpc3RJdGVtO1xuXHRcdHRoaXMub3B0aW9uc0xpc3QuY3VycmVudD8uc2V0U2VsZWN0ZWRJdGVtKGZpcnN0TGlzdEl0ZW1PcHRpb24pO1xuXHRcdC8vIFdlIGRvIG5vdCBzZXQgdGhlIGZvY3VzIG9uIHRoZSBidXR0b24sIGJ1dCBjYXRjaCB0aGUgRU5URVIga2V5IGluIHRoZSBkaWFsb2dcblx0XHQvLyBhbmQgcHJvY2VzcyBpdCBhcyBPaywgc2luY2UgZm9jdXNpbmcgdGhlIGJ1dHRvbiB3YXMgcmVwb3J0ZWQgYXMgYW4gQUNDIGlzc3VlXG5cdFx0Zmlyc3RMaXN0SXRlbU9wdGlvbj8uZm9jdXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNjYXJkcyB0aGUgZHJhZnQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBkaXNjYXJkRHJhZnRcblx0ICogQHBhcmFtIGNvbnRyb2xsZXIgQ29udHJvbGxlciBvZiB0aGUgY3VycmVudCB2aWV3XG5cdCAqIEBwYXJhbSBza2lwQmluZGluZ1RvVmlldyBUaGUgcGFyYW1ldGVyIHRvIHNraXAgdGhlIGJpbmRpbmcgdG8gdGhlIHZpZXdcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmVkIGlmIGNhbmNlbERvY3VtZW50IHdhcyBzdWNjZXNzZnVsXG5cdCAqL1xuXHRwdWJsaWMgYXN5bmMgZGlzY2FyZERyYWZ0KGNvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLCBza2lwQmluZGluZ1RvVmlldzogdW5rbm93bikge1xuXHRcdGNvbnN0IGNvbnRleHQgPSBjb250cm9sbGVyLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0Y29uc3QgcGFyYW1zID0ge1xuXHRcdFx0c2tpcEJhY2tOYXZpZ2F0aW9uOiB0cnVlLFxuXHRcdFx0c2tpcERpc2NhcmRQb3BvdmVyOiB0cnVlLFxuXHRcdFx0c2tpcEJpbmRpbmdUb1ZpZXc6IHNraXBCaW5kaW5nVG9WaWV3ICE9PSB1bmRlZmluZWQgPyBza2lwQmluZGluZ1RvVmlldyA6IHRydWVcblx0XHR9O1xuXHRcdHJldHVybiBjb250cm9sbGVyLmVkaXRGbG93LmNhbmNlbERvY3VtZW50KGNvbnRleHQsIHBhcmFtcyk7XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZXMgdGhlIGRvY3VtZW50LiBJZiB0aGUgY29udHJvbGxlciBpcyBvZiB0eXBlIE9iamVjdFBhZ2UsIHRoZW4gaW50ZXJuYWwgX3NhdmVEb2N1bWVudCBpcyBjYWxsZWQsIG90aGVyd2lzZSBzYXZlRG9jdW1lbnRcblx0ICogZnJvbSBFZGl0RmxvdyBpcyBjYWxsZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXZlRG9jdW1lbnRcblx0ICogQHBhcmFtIGNvbnRyb2xsZXIgQ29udHJvbGxlciBvZiB0aGUgY3VycmVudCB2aWV3XG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZlZCBpZiB0aGUgc2F2ZSB3YXMgc3VjY2Vzc2Z1bFxuXHQgKi9cblx0cHJpdmF0ZSBzYXZlRG9jdW1lbnQoY29udHJvbGxlcjogRGF0YUxvc3NDb250cm9sbGVyKSB7XG5cdFx0Y29uc3QgY29udGV4dCA9IGNvbnRyb2xsZXIuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRpZiAoY29udHJvbGxlci5pc0EoXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuT2JqZWN0UGFnZUNvbnRyb2xsZXJcIikpIHtcblx0XHRcdHJldHVybiBjb250cm9sbGVyLl9zYXZlRG9jdW1lbnQoY29udGV4dCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiAoY29udHJvbGxlciBhcyBEYXRhTG9zc0NvbnRyb2xsZXIpLmVkaXRGbG93LnNhdmVEb2N1bWVudChjb250ZXh0LCB7fSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGtleSBvZiB0aGUgc2VsZWN0ZWQgaXRlbSBmcm9tIHRoZSBsaXN0IG9mIG9wdGlvbnMgdGhhdCB3YXMgc2V0IHZpYSBjdXN0b21EYXRhLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0U2VsZWN0ZWRLZXlcblx0ICogQHJldHVybnMgVGhlIGtleSBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGl0ZW1cblx0ICovXG5cdHByaXZhdGUgZ2V0U2VsZWN0ZWRLZXkoKSB7XG5cdFx0Y29uc3Qgb3B0aW9uc0xpc3QgPSB0aGlzLm9wdGlvbnNMaXN0LmN1cnJlbnQgYXMgTGlzdDtcblx0XHRyZXR1cm4gb3B0aW9uc0xpc3QuZ2V0U2VsZWN0ZWRJdGVtKCkuZGF0YShcIml0ZW1LZXlcIik7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlciB0byBvcGVuIHRoZSBkYXRhbG9zcyBkaWFsb2cuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBvcGVuRGF0YUxvc3NEaWFsb2dcblx0ICovXG5cdHByaXZhdGUgb3BlbkRhdGFMb3NzRGlhbG9nKCkge1xuXHRcdHRoaXMuZGF0YUxvc3NEaWFsb2cuY3VycmVudD8ub3BlbigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXIgdG8gY2xvc2UgdGhlIGRhdGFsb3NzIGRpYWxvZy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGNsb3NlRGF0YUxvc3NEaWFsb2dcblx0ICovXG5cdHByaXZhdGUgY2xvc2VEYXRhTG9zc0RpYWxvZygpIHtcblx0XHR0aGlzLmRhdGFMb3NzRGlhbG9nLmN1cnJlbnQ/LmNsb3NlKCk7XG5cdFx0dGhpcy5kYXRhTG9zc0RpYWxvZy5jdXJyZW50Py5kZXN0cm95KCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY29uZmlybSBidXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb25maXJtQnV0dG9uXG5cdCAqIEByZXR1cm5zIEEgYnV0dG9uXG5cdCAqL1xuXHRwcml2YXRlIGdldENvbmZpcm1CdXR0b24oKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCdXR0b25cblx0XHRcdFx0dGV4dD17dGhpcy5kYXRhTG9zc1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX0RJQUxPR19PS1wiKX1cblx0XHRcdFx0dHlwZT17XCJFbXBoYXNpemVkXCJ9XG5cdFx0XHRcdHByZXNzPXsoKSA9PiB0aGlzLmhhbmRsZURhdGFMb3NzT2soKX1cblx0XHRcdC8+XG5cdFx0KSBhcyBCdXR0b247XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY2FuY2VsIGJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldENhbmNlbEJ1dHRvblxuXHQgKiBAcmV0dXJucyBBIGJ1dHRvblxuXHQgKi9cblx0cHJpdmF0ZSBnZXRDYW5jZWxCdXR0b24oKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdDxCdXR0b24gdGV4dD17dGhpcy5kYXRhTG9zc1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX0RJQUxPR19DQU5DRUxcIil9IHByZXNzPXsoKSA9PiB0aGlzLmhhbmRsZURhdGFMb3NzQ2FuY2VsKCl9IC8+XG5cdFx0KSBhcyBCdXR0b247XG5cdH1cblxuXHQvKipcblx0ICogVGhlIGJ1aWxkaW5nIGJsb2NrIHJlbmRlciBmdW5jdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZ1xuXHQgKi9cblx0Z2V0Q29udGVudCgpIHtcblx0XHRjb25zdCBoYXNBY3RpdmVFbnRpdHkgPSB0aGlzLmNvbnRyb2xsZXIuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldE9iamVjdCgpLkhhc0FjdGl2ZUVudGl0eTtcblx0XHRjb25zdCBkZXNjcmlwdGlvbiA9IGhhc0FjdGl2ZUVudGl0eVxuXHRcdFx0PyB0aGlzLmRhdGFMb3NzUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiU1RfRFJBRlRfREFUQUxPU1NfUE9QVVBfTUVTU0FHRV9TQVZFXCIpXG5cdFx0XHQ6IHRoaXMuZGF0YUxvc3NSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJTVF9EUkFGVF9EQVRBTE9TU19QT1BVUF9NRVNTQUdFX0NSRUFURVwiKTtcblx0XHRjb25zdCBjcmVhdGVPclNhdmVMYWJlbCA9IGhhc0FjdGl2ZUVudGl0eVxuXHRcdFx0PyB0aGlzLmRhdGFMb3NzUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiU1RfRFJBRlRfREFUQUxPU1NfU0FWRV9EUkFGVF9SQkxcIilcblx0XHRcdDogdGhpcy5kYXRhTG9zc1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlNUX0RSQUZUX0RBVEFMT1NTX0NSRUFURV9FTlRJVFlfUkJMXCIpO1xuXHRcdGNvbnN0IGNyZWF0ZU9yU2F2ZVRleHQgPSBoYXNBY3RpdmVFbnRpdHlcblx0XHRcdD8gdGhpcy5kYXRhTG9zc1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlNUX0RSQUZUX0RBVEFMT1NTX1NBVkVfRFJBRlRfVE9MXCIpXG5cdFx0XHQ6IHRoaXMuZGF0YUxvc3NSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJTVF9EUkFGVF9EQVRBTE9TU19DUkVBVEVfRU5USVRZX1RPTFwiKTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PERpYWxvZ1xuXHRcdFx0XHR0aXRsZT17dGhpcy5kYXRhTG9zc1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIldBUk5JTkdcIil9XG5cdFx0XHRcdHN0YXRlPXtWYWx1ZVN0YXRlLldhcm5pbmd9XG5cdFx0XHRcdHR5cGU9e1wiTWVzc2FnZVwifVxuXHRcdFx0XHRjb250ZW50V2lkdGg9e1wiMjJyZW1cIn1cblx0XHRcdFx0cmVmPXt0aGlzLmRhdGFMb3NzRGlhbG9nfVxuXHRcdFx0PlxuXHRcdFx0XHR7e1xuXHRcdFx0XHRcdGNvbnRlbnQ6IChcblx0XHRcdFx0XHRcdDw+XG5cdFx0XHRcdFx0XHRcdDxUZXh0IHRleHQ9e2Rlc2NyaXB0aW9ufSBjbGFzcz1cInNhcFVpVGlueU1hcmdpbkJlZ2luIHNhcFVpVGlueU1hcmdpblRvcEJvdHRvbVwiIC8+XG5cdFx0XHRcdFx0XHRcdDxMaXN0XG5cdFx0XHRcdFx0XHRcdFx0bW9kZT1cIlNpbmdsZVNlbGVjdExlZnRcIlxuXHRcdFx0XHRcdFx0XHRcdHNob3dTZXBhcmF0b3JzPVwiTm9uZVwiXG5cdFx0XHRcdFx0XHRcdFx0aW5jbHVkZUl0ZW1JblNlbGVjdGlvbj1cInRydWVcIlxuXHRcdFx0XHRcdFx0XHRcdGJhY2tncm91bmREZXNpZ249XCJUcmFuc3BhcmVudFwiXG5cdFx0XHRcdFx0XHRcdFx0Y2xhc3M9XCJzYXBVaU5vQ29udGVudFBhZGRpbmdcIlxuXHRcdFx0XHRcdFx0XHRcdHJlZj17dGhpcy5vcHRpb25zTGlzdH1cblx0XHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHRcdDxDdXN0b21MaXN0SXRlbSBjdXN0b21EYXRhPXtbbmV3IEN1c3RvbURhdGEoeyBrZXk6IFwiaXRlbUtleVwiLCB2YWx1ZTogXCJkcmFmdERhdGFMb3NzT3B0aW9uU2F2ZVwiIH0pXX0+XG5cdFx0XHRcdFx0XHRcdFx0XHQ8VkJveCBjbGFzcz1cInNhcFVpVGlueU1hcmdpblwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8TGFiZWwgdGV4dD17Y3JlYXRlT3JTYXZlTGFiZWx9IGRlc2lnbj1cIkJvbGRcIiAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8VGV4dCB0ZXh0PXtjcmVhdGVPclNhdmVUZXh0fSAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9WQm94PlxuXHRcdFx0XHRcdFx0XHRcdDwvQ3VzdG9tTGlzdEl0ZW0+XG5cdFx0XHRcdFx0XHRcdFx0PEN1c3RvbUxpc3RJdGVtIGN1c3RvbURhdGE9e1tuZXcgQ3VzdG9tRGF0YSh7IGtleTogXCJpdGVtS2V5XCIsIHZhbHVlOiBcImRyYWZ0RGF0YUxvc3NPcHRpb25LZWVwXCIgfSldfT5cblx0XHRcdFx0XHRcdFx0XHRcdDxWQm94IGNsYXNzPVwic2FwVWlUaW55TWFyZ2luXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxMYWJlbFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRleHQ9e3RoaXMuZGF0YUxvc3NSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJTVF9EUkFGVF9EQVRBTE9TU19LRUVQX0RSQUZUX1JCTFwiKX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZXNpZ249XCJCb2xkXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PFRleHQgdGV4dD17dGhpcy5kYXRhTG9zc1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlNUX0RSQUZUX0RBVEFMT1NTX0tFRVBfRFJBRlRfVE9MXCIpfSAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9WQm94PlxuXHRcdFx0XHRcdFx0XHRcdDwvQ3VzdG9tTGlzdEl0ZW0+XG5cdFx0XHRcdFx0XHRcdFx0PEN1c3RvbUxpc3RJdGVtIGN1c3RvbURhdGE9e1tuZXcgQ3VzdG9tRGF0YSh7IGtleTogXCJpdGVtS2V5XCIsIHZhbHVlOiBcImRyYWZ0RGF0YUxvc3NPcHRpb25EaXNjYXJkXCIgfSldfT5cblx0XHRcdFx0XHRcdFx0XHRcdDxWQm94IGNsYXNzPVwic2FwVWlUaW55TWFyZ2luXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxMYWJlbFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRleHQ9e3RoaXMuZGF0YUxvc3NSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJTVF9EUkFGVF9EQVRBTE9TU19ESVNDQVJEX0RSQUZUX1JCTFwiKX1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkZXNpZ249XCJCb2xkXCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PFRleHQgdGV4dD17dGhpcy5kYXRhTG9zc1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlNUX0RSQUZUX0RBVEFMT1NTX0RJU0NBUkRfRFJBRlRfVE9MXCIpfSAvPlxuXHRcdFx0XHRcdFx0XHRcdFx0PC9WQm94PlxuXHRcdFx0XHRcdFx0XHRcdDwvQ3VzdG9tTGlzdEl0ZW0+XG5cdFx0XHRcdFx0XHRcdDwvTGlzdD5cblx0XHRcdFx0XHRcdDwvPlxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0YnV0dG9uczogKFxuXHRcdFx0XHRcdFx0PD5cblx0XHRcdFx0XHRcdFx0Y29uZmlybUJ1dHRvbiA9IHt0aGlzLmdldENvbmZpcm1CdXR0b24oKX1cblx0XHRcdFx0XHRcdFx0Y2FuY2VsQnV0dG9uID0ge3RoaXMuZ2V0Q2FuY2VsQnV0dG9uKCl9XG5cdFx0XHRcdFx0XHQ8Lz5cblx0XHRcdFx0XHQpXG5cdFx0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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/controls/CommandExecution", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ClassSupport", "sap/m/Menu", "sap/m/MenuButton", "sap/m/MenuItem", "sap/suite/ui/commons/collaboration/CollaborationHelper", "sap/suite/ui/commons/collaboration/ServiceContainer", "sap/ui/core/CustomData", "sap/ui/performance/trace/FESRHelper", "sap/ushell/ui/footerbar/AddBookmarkButton", "./ShareAPI", "sap/fe/core/jsx-runtime/jsx"], function (Log, BuildingBlockSupport, RuntimeBuildingBlock, CommonUtils, CommandExecution, BindingHelper, BindingToolkit, ClassSupport, Menu, MenuButton, MenuItem, CollaborationHelper, ServiceContainer, CustomData, FESRHelper, AddBookmarkButton, ShareAPI, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6;
  var _exports = {};
  var defineReference = ClassSupport.defineReference;
  var not = BindingToolkit.not;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var UI = BindingHelper.UI;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let ShareBlock = (
  /**
   * Building block used to create the ‘Share’ functionality.
   * <br>
   * Please note that the 'Share in SAP Jam' option is only available on platforms that are integrated with SAP Jam.
   * <br>
   * If you are consuming this macro in an environment where the SAP Fiori launchpad is not available, then the 'Save as Tile' option is not visible.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Share
   * 	id="someID"
   *	visible="true"
   * /&gt;
   * </pre>
   *
   * @hideconstructor
   * @since 1.93.0
   */
  _dec = defineBuildingBlock({
    name: "Share",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    returnTypes: ["sap.fe.macros.share.ShareAPI"]
  }), _dec2 = blockAttribute({
    type: "string",
    required: true,
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "boolean",
    isPublic: true,
    bindable: true
  }), _dec4 = blockAttribute({
    type: "object",
    isPublic: false
  }), _dec5 = defineReference(), _dec6 = defineReference(), _dec7 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(ShareBlock, _RuntimeBuildingBlock);
    function ShareBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _RuntimeBuildingBlock.call(this, ...args) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "msTeamsOptions", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menuButton", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menu", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "saveAsTileMenuItem", _descriptor6, _assertThisInitialized(_this));
      return _this;
    }
    _exports = ShareBlock;
    var _proto = ShareBlock.prototype;
    /**
     * Retrieves the share option from the shell configuration asynchronously and prepare the content of the menu button.
     * Options order are:
     * - Send as Email
     * - Share as Jam (if available)
     * - Teams options (if available)
     * - Save as tile.
     *
     * @param view The view this building block is used in
     * @param appComponent The AppComponent instance
     */
    _proto._initializeMenuItems = async function _initializeMenuItems(view, appComponent) {
      const isTeamsModeActive = await CollaborationHelper.isTeamsModeActive();
      if (isTeamsModeActive) {
        var _this$menuButton$curr, _this$menuButton$curr2;
        //need to clear the visible property bindings otherwise when the binding value changes then it will set back the visible to the resolved value
        (_this$menuButton$curr = this.menuButton.current) === null || _this$menuButton$curr === void 0 ? void 0 : _this$menuButton$curr.unbindProperty("visible", true);
        (_this$menuButton$curr2 = this.menuButton.current) === null || _this$menuButton$curr2 === void 0 ? void 0 : _this$menuButton$curr2.setVisible(false);
        return;
      }
      const controller = view.getController();
      const shellServices = appComponent.getShellServices();
      const isPluginInfoStable = await shellServices.waitForPluginsLoad();
      if (!isPluginInfoStable) {
        var _this$menuButton$curr3;
        // In case the plugin info is not yet available we need to do this computation again on the next button click
        const internalButton = (_this$menuButton$curr3 = this.menuButton.current) === null || _this$menuButton$curr3 === void 0 ? void 0 : _this$menuButton$curr3.getAggregation("_control");
        internalButton === null || internalButton === void 0 ? void 0 : internalButton.attachEventOnce("press", {}, () => this._initializeMenuItems, this);
      }
      if (this.menu.current) {
        this.menu.current.addItem(_jsx(MenuItem, {
          text: this.getTranslatedText("T_SEMANTIC_CONTROL_SEND_EMAIL"),
          icon: "sap-icon://email",
          press: () => controller.share._triggerEmail()
        }));
        this._addShellBasedMenuItems(controller, shellServices);
      }
    };
    _proto._addShellBasedMenuItems = async function _addShellBasedMenuItems(controller, shellServices) {
      var _shellServices$getUse, _shellServices$getUse2, _this$msTeamsOptions;
      const hasUshell = shellServices.hasUShell();
      const hasJam = !!((_shellServices$getUse = (_shellServices$getUse2 = shellServices.getUser()).isJamActive) !== null && _shellServices$getUse !== void 0 && _shellServices$getUse.call(_shellServices$getUse2));
      const collaborationTeamsHelper = await ServiceContainer.getServiceAsync();
      const shareCollaborationOptions = collaborationTeamsHelper.getOptions({
        isShareAsCardEnabled: ((_this$msTeamsOptions = this.msTeamsOptions) === null || _this$msTeamsOptions === void 0 ? void 0 : _this$msTeamsOptions.enableCard) === "true"
      });
      if (hasUshell) {
        if (hasJam) {
          var _this$menu, _this$menu$current;
          this === null || this === void 0 ? void 0 : (_this$menu = this.menu) === null || _this$menu === void 0 ? void 0 : (_this$menu$current = _this$menu.current) === null || _this$menu$current === void 0 ? void 0 : _this$menu$current.addItem(_jsx(MenuItem, {
            text: this.getTranslatedText("T_COMMON_SAPFE_SHARE_JAM"),
            icon: "sap-icon://share-2",
            press: () => controller.share._triggerShareToJam()
          }));
        }
        // prepare teams menu items
        for (const collaborationOption of shareCollaborationOptions) {
          var _collaborationOption$, _collaborationOption$2, _this$menu2, _this$menu2$current;
          const menuItemSettings = {
            text: collaborationOption.text,
            icon: collaborationOption.icon,
            visible: ((_collaborationOption$ = collaborationOption.subOptions) === null || _collaborationOption$ === void 0 ? void 0 : _collaborationOption$.length) === 1 && collaborationOption.subOptions[0].key === "COLLABORATION_MSTEAMS_CARD" ? compileExpression(not(UI.IsEditable)) : undefined,
            items: []
          };
          if (collaborationOption !== null && collaborationOption !== void 0 && collaborationOption.subOptions && (collaborationOption === null || collaborationOption === void 0 ? void 0 : (_collaborationOption$2 = collaborationOption.subOptions) === null || _collaborationOption$2 === void 0 ? void 0 : _collaborationOption$2.length) > 0) {
            menuItemSettings.items = [];
            collaborationOption.subOptions.forEach(subOption => {
              const subMenuItem = new MenuItem({
                text: subOption.text,
                icon: subOption.icon,
                press: this.collaborationMenuItemPress,
                visible: subOption.key === "COLLABORATION_MSTEAMS_CARD" ? compileExpression(not(UI.IsEditable)) : undefined,
                customData: new CustomData({
                  key: "collaborationData",
                  value: subOption
                })
              });
              if (subOption.fesrStepName) {
                FESRHelper.setSemanticStepname(subMenuItem, "press", subOption.fesrStepName);
              }
              menuItemSettings.items.push(subMenuItem);
            });
          } else {
            // if there are no sub option then the main option should be clickable
            // so add a press handler.
            menuItemSettings.press = this.collaborationMenuItemPress;
            menuItemSettings["customData"] = new CustomData({
              key: "collaborationData",
              value: collaborationOption
            });
          }
          const menuItem = new MenuItem(menuItemSettings);
          if (menuItemSettings.press && collaborationOption.fesrStepName) {
            FESRHelper.setSemanticStepname(menuItem, "press", collaborationOption.fesrStepName);
          }
          this === null || this === void 0 ? void 0 : (_this$menu2 = this.menu) === null || _this$menu2 === void 0 ? void 0 : (_this$menu2$current = _this$menu2.current) === null || _this$menu2$current === void 0 ? void 0 : _this$menu2$current.addItem(menuItem);
        }
        // set save as tile
        // for now we need to create addBookmarkButton to use the save as tile feature.
        // In the future save as tile should be available as an API or a MenuItem so that it can be added to the Menu button.
        // This needs to be discussed with AddBookmarkButton team.
        const addBookmarkButton = new AddBookmarkButton();
        if (addBookmarkButton.getEnabled()) {
          var _this$menu3, _this$menu3$current;
          this === null || this === void 0 ? void 0 : (_this$menu3 = this.menu) === null || _this$menu3 === void 0 ? void 0 : (_this$menu3$current = _this$menu3.current) === null || _this$menu3$current === void 0 ? void 0 : _this$menu3$current.addItem(_jsx(MenuItem, {
            ref: this.saveAsTileMenuItem,
            text: addBookmarkButton.getText(),
            icon: addBookmarkButton.getIcon(),
            press: () => controller.share._saveAsTile(this.saveAsTileMenuItem.current),
            children: {
              dependents: [addBookmarkButton]
            }
          }));
        } else {
          addBookmarkButton.destroy();
        }
      }
    };
    _proto.collaborationMenuItemPress = async function collaborationMenuItemPress(event) {
      const clickedMenuItem = event.getSource();
      const collaborationTeamsHelper = await ServiceContainer.getServiceAsync();
      const view = CommonUtils.getTargetView(clickedMenuItem);
      const controller = view.getController();
      // call adapt share metadata so that the collaboration info model is updated with the required info
      await controller.share._adaptShareMetadata();
      const collaborationInfo = view.getModel("collaborationInfo").getData();
      collaborationTeamsHelper.share(clickedMenuItem.data("collaborationData"), collaborationInfo);
    };
    _proto.getContent = function getContent(view, appComponent) {
      // Ctrl+Shift+S is needed for the time being but this needs to be removed after backlog from menu button
      const menuButton = _jsx(ShareAPI, {
        id: this.id,
        children: _jsx(MenuButton, {
          ref: this.menuButton,
          icon: "sap-icon://action",
          visible: this.visible,
          tooltip: "{sap.fe.i18n>M_COMMON_SAPFE_ACTION_SHARE} (Ctrl+Shift+S)",
          children: _jsx(Menu, {
            ref: this.menu
          })
        })
      });
      view.addDependent(_jsx(CommandExecution, {
        visible: this.visible,
        enabled: this.visible,
        command: "Share",
        execute: () => {
          var _this$menuButton$curr4;
          return (_this$menuButton$curr4 = this.menuButton.current) === null || _this$menuButton$curr4 === void 0 ? void 0 : _this$menuButton$curr4.getMenu().openBy(this.menuButton.current, true);
        }
      }));
      // The initialization is asynchronous, so we just trigger it and hope for the best :D
      this.isInitialized = this._initializeMenuItems(view, appComponent).catch(error => {
        Log.error(error);
      });
      return menuButton;
    };
    return ShareBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return constant(true);
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "msTeamsOptions", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "menuButton", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "menu", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "saveAsTileMenuItem", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ShareBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFyZUJsb2NrIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJwdWJsaWNOYW1lc3BhY2UiLCJyZXR1cm5UeXBlcyIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsInJlcXVpcmVkIiwiaXNQdWJsaWMiLCJiaW5kYWJsZSIsImRlZmluZVJlZmVyZW5jZSIsIl9pbml0aWFsaXplTWVudUl0ZW1zIiwidmlldyIsImFwcENvbXBvbmVudCIsImlzVGVhbXNNb2RlQWN0aXZlIiwiQ29sbGFib3JhdGlvbkhlbHBlciIsIm1lbnVCdXR0b24iLCJjdXJyZW50IiwidW5iaW5kUHJvcGVydHkiLCJzZXRWaXNpYmxlIiwiY29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJzaGVsbFNlcnZpY2VzIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsImlzUGx1Z2luSW5mb1N0YWJsZSIsIndhaXRGb3JQbHVnaW5zTG9hZCIsImludGVybmFsQnV0dG9uIiwiZ2V0QWdncmVnYXRpb24iLCJhdHRhY2hFdmVudE9uY2UiLCJtZW51IiwiYWRkSXRlbSIsImdldFRyYW5zbGF0ZWRUZXh0Iiwic2hhcmUiLCJfdHJpZ2dlckVtYWlsIiwiX2FkZFNoZWxsQmFzZWRNZW51SXRlbXMiLCJoYXNVc2hlbGwiLCJoYXNVU2hlbGwiLCJoYXNKYW0iLCJnZXRVc2VyIiwiaXNKYW1BY3RpdmUiLCJjb2xsYWJvcmF0aW9uVGVhbXNIZWxwZXIiLCJTZXJ2aWNlQ29udGFpbmVyIiwiZ2V0U2VydmljZUFzeW5jIiwic2hhcmVDb2xsYWJvcmF0aW9uT3B0aW9ucyIsImdldE9wdGlvbnMiLCJpc1NoYXJlQXNDYXJkRW5hYmxlZCIsIm1zVGVhbXNPcHRpb25zIiwiZW5hYmxlQ2FyZCIsIl90cmlnZ2VyU2hhcmVUb0phbSIsImNvbGxhYm9yYXRpb25PcHRpb24iLCJtZW51SXRlbVNldHRpbmdzIiwidGV4dCIsImljb24iLCJ2aXNpYmxlIiwic3ViT3B0aW9ucyIsImxlbmd0aCIsImtleSIsImNvbXBpbGVFeHByZXNzaW9uIiwibm90IiwiVUkiLCJJc0VkaXRhYmxlIiwidW5kZWZpbmVkIiwiaXRlbXMiLCJmb3JFYWNoIiwic3ViT3B0aW9uIiwic3ViTWVudUl0ZW0iLCJNZW51SXRlbSIsInByZXNzIiwiY29sbGFib3JhdGlvbk1lbnVJdGVtUHJlc3MiLCJjdXN0b21EYXRhIiwiQ3VzdG9tRGF0YSIsInZhbHVlIiwiZmVzclN0ZXBOYW1lIiwiRkVTUkhlbHBlciIsInNldFNlbWFudGljU3RlcG5hbWUiLCJwdXNoIiwibWVudUl0ZW0iLCJhZGRCb29rbWFya0J1dHRvbiIsIkFkZEJvb2ttYXJrQnV0dG9uIiwiZ2V0RW5hYmxlZCIsInNhdmVBc1RpbGVNZW51SXRlbSIsImdldFRleHQiLCJnZXRJY29uIiwiX3NhdmVBc1RpbGUiLCJkZXBlbmRlbnRzIiwiZGVzdHJveSIsImV2ZW50IiwiY2xpY2tlZE1lbnVJdGVtIiwiZ2V0U291cmNlIiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiX2FkYXB0U2hhcmVNZXRhZGF0YSIsImNvbGxhYm9yYXRpb25JbmZvIiwiZ2V0TW9kZWwiLCJnZXREYXRhIiwiZGF0YSIsImdldENvbnRlbnQiLCJpZCIsImFkZERlcGVuZGVudCIsImdldE1lbnUiLCJvcGVuQnkiLCJpc0luaXRpYWxpemVkIiwiY2F0Y2giLCJlcnJvciIsIkxvZyIsIlJ1bnRpbWVCdWlsZGluZ0Jsb2NrIiwiY29uc3RhbnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNoYXJlLmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCBSdW50aW1lQnVpbGRpbmdCbG9jayBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvUnVudGltZUJ1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBDb21tYW5kRXhlY3V0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9scy9Db21tYW5kRXhlY3V0aW9uXCI7XG5pbXBvcnQgeyBVSSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBjb21waWxlRXhwcmVzc2lvbiwgY29uc3RhbnQsIG5vdCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBkZWZpbmVSZWZlcmVuY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IFJlZiB9IGZyb20gXCJzYXAvZmUvY29yZS9qc3gtcnVudGltZS9qc3hcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgSVNoZWxsU2VydmljZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2hlbGxTZXJ2aWNlc0ZhY3RvcnlcIjtcbmltcG9ydCBNZW51IGZyb20gXCJzYXAvbS9NZW51XCI7XG5pbXBvcnQgTWVudUJ1dHRvbiBmcm9tIFwic2FwL20vTWVudUJ1dHRvblwiO1xuaW1wb3J0IE1lbnVJdGVtLCB7ICRNZW51SXRlbVNldHRpbmdzIH0gZnJvbSBcInNhcC9tL01lbnVJdGVtXCI7XG5pbXBvcnQgQ29sbGFib3JhdGlvbkhlbHBlciBmcm9tIFwic2FwL3N1aXRlL3VpL2NvbW1vbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uSGVscGVyXCI7XG5pbXBvcnQgU2VydmljZUNvbnRhaW5lciBmcm9tIFwic2FwL3N1aXRlL3VpL2NvbW1vbnMvY29sbGFib3JhdGlvbi9TZXJ2aWNlQ29udGFpbmVyXCI7XG5pbXBvcnQgVGVhbXNIZWxwZXJTZXJ2aWNlLCB7IENvbGxhYm9yYXRpb25PcHRpb25zIH0gZnJvbSBcInNhcC9zdWl0ZS91aS9jb21tb25zL2NvbGxhYm9yYXRpb24vVGVhbXNIZWxwZXJTZXJ2aWNlXCI7XG5pbXBvcnQgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IEN1c3RvbURhdGEgZnJvbSBcInNhcC91aS9jb3JlL0N1c3RvbURhdGFcIjtcbmltcG9ydCBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgRkVTUkhlbHBlciBmcm9tIFwic2FwL3VpL3BlcmZvcm1hbmNlL3RyYWNlL0ZFU1JIZWxwZXJcIjtcbmltcG9ydCBBZGRCb29rbWFya0J1dHRvbiBmcm9tIFwic2FwL3VzaGVsbC91aS9mb290ZXJiYXIvQWRkQm9va21hcmtCdXR0b25cIjtcbmltcG9ydCBTaGFyZUFQSSBmcm9tIFwiLi9TaGFyZUFQSVwiO1xuXG50eXBlIE1zVGVhbXNPcHRpb25zVHlwZSA9IHtcblx0ZW5hYmxlQ2FyZDogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayB1c2VkIHRvIGNyZWF0ZSB0aGUg4oCYU2hhcmXigJkgZnVuY3Rpb25hbGl0eS5cbiAqIDxicj5cbiAqIFBsZWFzZSBub3RlIHRoYXQgdGhlICdTaGFyZSBpbiBTQVAgSmFtJyBvcHRpb24gaXMgb25seSBhdmFpbGFibGUgb24gcGxhdGZvcm1zIHRoYXQgYXJlIGludGVncmF0ZWQgd2l0aCBTQVAgSmFtLlxuICogPGJyPlxuICogSWYgeW91IGFyZSBjb25zdW1pbmcgdGhpcyBtYWNybyBpbiBhbiBlbnZpcm9ubWVudCB3aGVyZSB0aGUgU0FQIEZpb3JpIGxhdW5jaHBhZCBpcyBub3QgYXZhaWxhYmxlLCB0aGVuIHRoZSAnU2F2ZSBhcyBUaWxlJyBvcHRpb24gaXMgbm90IHZpc2libGUuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOlNoYXJlXG4gKiBcdGlkPVwic29tZUlEXCJcbiAqXHR2aXNpYmxlPVwidHJ1ZVwiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHNpbmNlIDEuOTMuMFxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiU2hhcmVcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0cHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0cmV0dXJuVHlwZXM6IFtcInNhcC5mZS5tYWNyb3Muc2hhcmUuU2hhcmVBUElcIl1cbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFyZUJsb2NrIGV4dGVuZHMgUnVudGltZUJ1aWxkaW5nQmxvY2sge1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0aWQhOiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRiaW5kYWJsZTogdHJ1ZVxuXHR9KVxuXHR2aXNpYmxlOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gPSBjb25zdGFudCh0cnVlKTtcblxuXHQvKipcblx0ICogVGhpcyBlbmFibGVzIHRoZSBvcHRpb25zIGZvciBNaWNyb3NvZnQgVGVhbXNcblx0ICogVGhlIGVuYWJsZUNhcmQgd2lsbCBiZSByZWNlaXZlZCBhcyB0cnVlIGZvciBPYmplY3QgUGFnZSBhbmQgZmFsc2UgZm9yIExpc3QgUmVwb3J0LlxuXHQgKiBUaGUgZW5hYmxlQ2hhdCBhbmQgZW5hYmxlVGFiIHdpbGwgcmVtYWluIHRydWVcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJvYmplY3RcIixcblx0XHRpc1B1YmxpYzogZmFsc2Vcblx0fSlcblx0bXNUZWFtc09wdGlvbnM/OiBNc1RlYW1zT3B0aW9uc1R5cGU7XG5cblx0QGRlZmluZVJlZmVyZW5jZSgpXG5cdG1lbnVCdXR0b24hOiBSZWY8TWVudUJ1dHRvbj47XG5cblx0QGRlZmluZVJlZmVyZW5jZSgpXG5cdG1lbnUhOiBSZWY8TWVudT47XG5cblx0QGRlZmluZVJlZmVyZW5jZSgpXG5cdHNhdmVBc1RpbGVNZW51SXRlbSE6IFJlZjxNZW51SXRlbT47XG5cblx0cHVibGljIGlzSW5pdGlhbGl6ZWQ/OiBQcm9taXNlPHZvaWQ+O1xuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHNoYXJlIG9wdGlvbiBmcm9tIHRoZSBzaGVsbCBjb25maWd1cmF0aW9uIGFzeW5jaHJvbm91c2x5IGFuZCBwcmVwYXJlIHRoZSBjb250ZW50IG9mIHRoZSBtZW51IGJ1dHRvbi5cblx0ICogT3B0aW9ucyBvcmRlciBhcmU6XG5cdCAqIC0gU2VuZCBhcyBFbWFpbFxuXHQgKiAtIFNoYXJlIGFzIEphbSAoaWYgYXZhaWxhYmxlKVxuXHQgKiAtIFRlYW1zIG9wdGlvbnMgKGlmIGF2YWlsYWJsZSlcblx0ICogLSBTYXZlIGFzIHRpbGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoaXMgYnVpbGRpbmcgYmxvY2sgaXMgdXNlZCBpblxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBBcHBDb21wb25lbnQgaW5zdGFuY2Vcblx0ICovXG5cdGFzeW5jIF9pbml0aWFsaXplTWVudUl0ZW1zKHZpZXc6IFZpZXcsIGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdFx0Y29uc3QgaXNUZWFtc01vZGVBY3RpdmUgPSBhd2FpdCBDb2xsYWJvcmF0aW9uSGVscGVyLmlzVGVhbXNNb2RlQWN0aXZlKCk7XG5cdFx0aWYgKGlzVGVhbXNNb2RlQWN0aXZlKSB7XG5cdFx0XHQvL25lZWQgdG8gY2xlYXIgdGhlIHZpc2libGUgcHJvcGVydHkgYmluZGluZ3Mgb3RoZXJ3aXNlIHdoZW4gdGhlIGJpbmRpbmcgdmFsdWUgY2hhbmdlcyB0aGVuIGl0IHdpbGwgc2V0IGJhY2sgdGhlIHZpc2libGUgdG8gdGhlIHJlc29sdmVkIHZhbHVlXG5cdFx0XHR0aGlzLm1lbnVCdXR0b24uY3VycmVudD8udW5iaW5kUHJvcGVydHkoXCJ2aXNpYmxlXCIsIHRydWUpO1xuXHRcdFx0dGhpcy5tZW51QnV0dG9uLmN1cnJlbnQ/LnNldFZpc2libGUoZmFsc2UpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBjb250cm9sbGVyID0gdmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXI7XG5cdFx0Y29uc3Qgc2hlbGxTZXJ2aWNlcyA9IGFwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0Y29uc3QgaXNQbHVnaW5JbmZvU3RhYmxlID0gYXdhaXQgc2hlbGxTZXJ2aWNlcy53YWl0Rm9yUGx1Z2luc0xvYWQoKTtcblx0XHRpZiAoIWlzUGx1Z2luSW5mb1N0YWJsZSkge1xuXHRcdFx0Ly8gSW4gY2FzZSB0aGUgcGx1Z2luIGluZm8gaXMgbm90IHlldCBhdmFpbGFibGUgd2UgbmVlZCB0byBkbyB0aGlzIGNvbXB1dGF0aW9uIGFnYWluIG9uIHRoZSBuZXh0IGJ1dHRvbiBjbGlja1xuXHRcdFx0Y29uc3QgaW50ZXJuYWxCdXR0b24gPSB0aGlzLm1lbnVCdXR0b24uY3VycmVudD8uZ2V0QWdncmVnYXRpb24oXCJfY29udHJvbFwiKSBhcyBNYW5hZ2VkT2JqZWN0O1xuXHRcdFx0aW50ZXJuYWxCdXR0b24/LmF0dGFjaEV2ZW50T25jZShcInByZXNzXCIsIHt9LCAoKSA9PiB0aGlzLl9pbml0aWFsaXplTWVudUl0ZW1zLCB0aGlzKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5tZW51LmN1cnJlbnQpIHtcblx0XHRcdHRoaXMubWVudS5jdXJyZW50LmFkZEl0ZW0oXG5cdFx0XHRcdDxNZW51SXRlbVxuXHRcdFx0XHRcdHRleHQ9e3RoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJUX1NFTUFOVElDX0NPTlRST0xfU0VORF9FTUFJTFwiKX1cblx0XHRcdFx0XHRpY29uPXtcInNhcC1pY29uOi8vZW1haWxcIn1cblx0XHRcdFx0XHRwcmVzcz17KCkgPT4gY29udHJvbGxlci5zaGFyZS5fdHJpZ2dlckVtYWlsKCl9XG5cdFx0XHRcdC8+XG5cdFx0XHQpO1xuXHRcdFx0dGhpcy5fYWRkU2hlbGxCYXNlZE1lbnVJdGVtcyhjb250cm9sbGVyLCBzaGVsbFNlcnZpY2VzKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBfYWRkU2hlbGxCYXNlZE1lbnVJdGVtcyhjb250cm9sbGVyOiBQYWdlQ29udHJvbGxlciwgc2hlbGxTZXJ2aWNlczogSVNoZWxsU2VydmljZXMpIHtcblx0XHRjb25zdCBoYXNVc2hlbGwgPSBzaGVsbFNlcnZpY2VzLmhhc1VTaGVsbCgpO1xuXHRcdGNvbnN0IGhhc0phbSA9ICEhc2hlbGxTZXJ2aWNlcy5nZXRVc2VyKCkuaXNKYW1BY3RpdmU/LigpO1xuXHRcdGNvbnN0IGNvbGxhYm9yYXRpb25UZWFtc0hlbHBlcjogVGVhbXNIZWxwZXJTZXJ2aWNlID0gYXdhaXQgU2VydmljZUNvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoKTtcblx0XHRjb25zdCBzaGFyZUNvbGxhYm9yYXRpb25PcHRpb25zOiBDb2xsYWJvcmF0aW9uT3B0aW9uc1tdID0gY29sbGFib3JhdGlvblRlYW1zSGVscGVyLmdldE9wdGlvbnMoe1xuXHRcdFx0aXNTaGFyZUFzQ2FyZEVuYWJsZWQ6IHRoaXMubXNUZWFtc09wdGlvbnM/LmVuYWJsZUNhcmQgPT09IFwidHJ1ZVwiXG5cdFx0fSk7XG5cdFx0aWYgKGhhc1VzaGVsbCkge1xuXHRcdFx0aWYgKGhhc0phbSkge1xuXHRcdFx0XHR0aGlzPy5tZW51Py5jdXJyZW50Py5hZGRJdGVtKFxuXHRcdFx0XHRcdDxNZW51SXRlbVxuXHRcdFx0XHRcdFx0dGV4dD17dGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfQ09NTU9OX1NBUEZFX1NIQVJFX0pBTVwiKX1cblx0XHRcdFx0XHRcdGljb249e1wic2FwLWljb246Ly9zaGFyZS0yXCJ9XG5cdFx0XHRcdFx0XHRwcmVzcz17KCkgPT4gY29udHJvbGxlci5zaGFyZS5fdHJpZ2dlclNoYXJlVG9KYW0oKX1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gcHJlcGFyZSB0ZWFtcyBtZW51IGl0ZW1zXG5cdFx0XHRmb3IgKGNvbnN0IGNvbGxhYm9yYXRpb25PcHRpb24gb2Ygc2hhcmVDb2xsYWJvcmF0aW9uT3B0aW9ucykge1xuXHRcdFx0XHRjb25zdCBtZW51SXRlbVNldHRpbmdzOiAkTWVudUl0ZW1TZXR0aW5ncyA9IHtcblx0XHRcdFx0XHR0ZXh0OiBjb2xsYWJvcmF0aW9uT3B0aW9uLnRleHQsXG5cdFx0XHRcdFx0aWNvbjogY29sbGFib3JhdGlvbk9wdGlvbi5pY29uLFxuXHRcdFx0XHRcdHZpc2libGU6XG5cdFx0XHRcdFx0XHRjb2xsYWJvcmF0aW9uT3B0aW9uLnN1Yk9wdGlvbnM/Lmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0XHRcdFx0Y29sbGFib3JhdGlvbk9wdGlvbi5zdWJPcHRpb25zWzBdLmtleSA9PT0gXCJDT0xMQUJPUkFUSU9OX01TVEVBTVNfQ0FSRFwiXG5cdFx0XHRcdFx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24obm90KFVJLklzRWRpdGFibGUpKVxuXHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRpdGVtczogW11cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAoY29sbGFib3JhdGlvbk9wdGlvbj8uc3ViT3B0aW9ucyAmJiBjb2xsYWJvcmF0aW9uT3B0aW9uPy5zdWJPcHRpb25zPy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0bWVudUl0ZW1TZXR0aW5ncy5pdGVtcyA9IFtdO1xuXHRcdFx0XHRcdGNvbGxhYm9yYXRpb25PcHRpb24uc3ViT3B0aW9ucy5mb3JFYWNoKChzdWJPcHRpb246IENvbGxhYm9yYXRpb25PcHRpb25zKSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBzdWJNZW51SXRlbSA9IG5ldyBNZW51SXRlbSh7XG5cdFx0XHRcdFx0XHRcdHRleHQ6IHN1Yk9wdGlvbi50ZXh0LFxuXHRcdFx0XHRcdFx0XHRpY29uOiBzdWJPcHRpb24uaWNvbixcblx0XHRcdFx0XHRcdFx0cHJlc3M6IHRoaXMuY29sbGFib3JhdGlvbk1lbnVJdGVtUHJlc3MsXG5cdFx0XHRcdFx0XHRcdHZpc2libGU6IHN1Yk9wdGlvbi5rZXkgPT09IFwiQ09MTEFCT1JBVElPTl9NU1RFQU1TX0NBUkRcIiA/IGNvbXBpbGVFeHByZXNzaW9uKG5vdChVSS5Jc0VkaXRhYmxlKSkgOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdGN1c3RvbURhdGE6IG5ldyBDdXN0b21EYXRhKHtcblx0XHRcdFx0XHRcdFx0XHRrZXk6IFwiY29sbGFib3JhdGlvbkRhdGFcIixcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogc3ViT3B0aW9uXG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmIChzdWJPcHRpb24uZmVzclN0ZXBOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdEZFU1JIZWxwZXIuc2V0U2VtYW50aWNTdGVwbmFtZShzdWJNZW51SXRlbSwgXCJwcmVzc1wiLCBzdWJPcHRpb24uZmVzclN0ZXBOYW1lKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdChtZW51SXRlbVNldHRpbmdzLml0ZW1zIGFzIE1lbnVJdGVtW10pLnB1c2goc3ViTWVudUl0ZW0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGlmIHRoZXJlIGFyZSBubyBzdWIgb3B0aW9uIHRoZW4gdGhlIG1haW4gb3B0aW9uIHNob3VsZCBiZSBjbGlja2FibGVcblx0XHRcdFx0XHQvLyBzbyBhZGQgYSBwcmVzcyBoYW5kbGVyLlxuXHRcdFx0XHRcdG1lbnVJdGVtU2V0dGluZ3MucHJlc3MgPSB0aGlzLmNvbGxhYm9yYXRpb25NZW51SXRlbVByZXNzO1xuXHRcdFx0XHRcdG1lbnVJdGVtU2V0dGluZ3NbXCJjdXN0b21EYXRhXCJdID0gbmV3IEN1c3RvbURhdGEoe1xuXHRcdFx0XHRcdFx0a2V5OiBcImNvbGxhYm9yYXRpb25EYXRhXCIsXG5cdFx0XHRcdFx0XHR2YWx1ZTogY29sbGFib3JhdGlvbk9wdGlvblxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IG1lbnVJdGVtID0gbmV3IE1lbnVJdGVtKG1lbnVJdGVtU2V0dGluZ3MpO1xuXHRcdFx0XHRpZiAobWVudUl0ZW1TZXR0aW5ncy5wcmVzcyAmJiBjb2xsYWJvcmF0aW9uT3B0aW9uLmZlc3JTdGVwTmFtZSkge1xuXHRcdFx0XHRcdEZFU1JIZWxwZXIuc2V0U2VtYW50aWNTdGVwbmFtZShtZW51SXRlbSwgXCJwcmVzc1wiLCBjb2xsYWJvcmF0aW9uT3B0aW9uLmZlc3JTdGVwTmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcz8ubWVudT8uY3VycmVudD8uYWRkSXRlbShtZW51SXRlbSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBzZXQgc2F2ZSBhcyB0aWxlXG5cdFx0XHQvLyBmb3Igbm93IHdlIG5lZWQgdG8gY3JlYXRlIGFkZEJvb2ttYXJrQnV0dG9uIHRvIHVzZSB0aGUgc2F2ZSBhcyB0aWxlIGZlYXR1cmUuXG5cdFx0XHQvLyBJbiB0aGUgZnV0dXJlIHNhdmUgYXMgdGlsZSBzaG91bGQgYmUgYXZhaWxhYmxlIGFzIGFuIEFQSSBvciBhIE1lbnVJdGVtIHNvIHRoYXQgaXQgY2FuIGJlIGFkZGVkIHRvIHRoZSBNZW51IGJ1dHRvbi5cblx0XHRcdC8vIFRoaXMgbmVlZHMgdG8gYmUgZGlzY3Vzc2VkIHdpdGggQWRkQm9va21hcmtCdXR0b24gdGVhbS5cblx0XHRcdGNvbnN0IGFkZEJvb2ttYXJrQnV0dG9uID0gbmV3IEFkZEJvb2ttYXJrQnV0dG9uKCk7XG5cdFx0XHRpZiAoYWRkQm9va21hcmtCdXR0b24uZ2V0RW5hYmxlZCgpKSB7XG5cdFx0XHRcdHRoaXM/Lm1lbnU/LmN1cnJlbnQ/LmFkZEl0ZW0oXG5cdFx0XHRcdFx0PE1lbnVJdGVtXG5cdFx0XHRcdFx0XHRyZWY9e3RoaXMuc2F2ZUFzVGlsZU1lbnVJdGVtfVxuXHRcdFx0XHRcdFx0dGV4dD17YWRkQm9va21hcmtCdXR0b24uZ2V0VGV4dCgpfVxuXHRcdFx0XHRcdFx0aWNvbj17YWRkQm9va21hcmtCdXR0b24uZ2V0SWNvbigpfVxuXHRcdFx0XHRcdFx0cHJlc3M9eygpID0+IGNvbnRyb2xsZXIuc2hhcmUuX3NhdmVBc1RpbGUodGhpcy5zYXZlQXNUaWxlTWVudUl0ZW0uY3VycmVudCl9XG5cdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0e3sgZGVwZW5kZW50czogW2FkZEJvb2ttYXJrQnV0dG9uXSB9fVxuXHRcdFx0XHRcdDwvTWVudUl0ZW0+XG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhZGRCb29rbWFya0J1dHRvbi5kZXN0cm95KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgY29sbGFib3JhdGlvbk1lbnVJdGVtUHJlc3MoZXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0Y29uc3QgY2xpY2tlZE1lbnVJdGVtID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgTWVudUl0ZW07XG5cdFx0Y29uc3QgY29sbGFib3JhdGlvblRlYW1zSGVscGVyOiBUZWFtc0hlbHBlclNlcnZpY2UgPSBhd2FpdCBTZXJ2aWNlQ29udGFpbmVyLmdldFNlcnZpY2VBc3luYygpO1xuXHRcdGNvbnN0IHZpZXc6IFZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KGNsaWNrZWRNZW51SXRlbSk7XG5cdFx0Y29uc3QgY29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIgPSB2aWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblx0XHQvLyBjYWxsIGFkYXB0IHNoYXJlIG1ldGFkYXRhIHNvIHRoYXQgdGhlIGNvbGxhYm9yYXRpb24gaW5mbyBtb2RlbCBpcyB1cGRhdGVkIHdpdGggdGhlIHJlcXVpcmVkIGluZm9cblx0XHRhd2FpdCBjb250cm9sbGVyLnNoYXJlLl9hZGFwdFNoYXJlTWV0YWRhdGEoKTtcblx0XHRjb25zdCBjb2xsYWJvcmF0aW9uSW5mbyA9ICh2aWV3LmdldE1vZGVsKFwiY29sbGFib3JhdGlvbkluZm9cIikgYXMgSlNPTk1vZGVsKS5nZXREYXRhKCk7XG5cdFx0Y29sbGFib3JhdGlvblRlYW1zSGVscGVyLnNoYXJlKGNsaWNrZWRNZW51SXRlbS5kYXRhKFwiY29sbGFib3JhdGlvbkRhdGFcIiksIGNvbGxhYm9yYXRpb25JbmZvKTtcblx0fVxuXG5cdGdldENvbnRlbnQodmlldzogVmlldywgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHQvLyBDdHJsK1NoaWZ0K1MgaXMgbmVlZGVkIGZvciB0aGUgdGltZSBiZWluZyBidXQgdGhpcyBuZWVkcyB0byBiZSByZW1vdmVkIGFmdGVyIGJhY2tsb2cgZnJvbSBtZW51IGJ1dHRvblxuXHRcdGNvbnN0IG1lbnVCdXR0b24gPSAoXG5cdFx0XHQ8U2hhcmVBUEkgaWQ9e3RoaXMuaWR9PlxuXHRcdFx0XHQ8TWVudUJ1dHRvblxuXHRcdFx0XHRcdHJlZj17dGhpcy5tZW51QnV0dG9ufVxuXHRcdFx0XHRcdGljb249e1wic2FwLWljb246Ly9hY3Rpb25cIn1cblx0XHRcdFx0XHR2aXNpYmxlPXt0aGlzLnZpc2libGUgYXMgYW55fVxuXHRcdFx0XHRcdHRvb2x0aXA9e1wie3NhcC5mZS5pMThuPk1fQ09NTU9OX1NBUEZFX0FDVElPTl9TSEFSRX0gKEN0cmwrU2hpZnQrUylcIn1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxNZW51IHJlZj17dGhpcy5tZW51fT48L01lbnU+XG5cdFx0XHRcdDwvTWVudUJ1dHRvbj5cblx0XHRcdDwvU2hhcmVBUEk+XG5cdFx0KTtcblx0XHR2aWV3LmFkZERlcGVuZGVudChcblx0XHRcdDxDb21tYW5kRXhlY3V0aW9uXG5cdFx0XHRcdHZpc2libGU9e3RoaXMudmlzaWJsZX1cblx0XHRcdFx0ZW5hYmxlZD17dGhpcy52aXNpYmxlfVxuXHRcdFx0XHRjb21tYW5kPVwiU2hhcmVcIlxuXHRcdFx0XHRleGVjdXRlPXsoKSA9PiB0aGlzLm1lbnVCdXR0b24uY3VycmVudD8uZ2V0TWVudSgpLm9wZW5CeSh0aGlzLm1lbnVCdXR0b24uY3VycmVudCwgdHJ1ZSl9XG5cdFx0XHQvPlxuXHRcdCk7XG5cdFx0Ly8gVGhlIGluaXRpYWxpemF0aW9uIGlzIGFzeW5jaHJvbm91cywgc28gd2UganVzdCB0cmlnZ2VyIGl0IGFuZCBob3BlIGZvciB0aGUgYmVzdCA6RFxuXHRcdHRoaXMuaXNJbml0aWFsaXplZCA9IHRoaXMuX2luaXRpYWxpemVNZW51SXRlbXModmlldywgYXBwQ29tcG9uZW50KS5jYXRjaCgoZXJyb3IpID0+IHtcblx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBtZW51QnV0dG9uO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUF3RHFCQSxVQUFVO0VBekIvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWxCQSxPQW1CQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxPQUFPO0lBQ2JDLFNBQVMsRUFBRSx3QkFBd0I7SUFDbkNDLGVBQWUsRUFBRSxlQUFlO0lBQ2hDQyxXQUFXLEVBQUUs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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/helpers/ClassSupport", "sap/m/Button", "sap/m/Dialog", "sap/m/library", "sap/m/Page", "sap/m/Panel", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/util/reflection/JsControlTreeModifier", "sap/fe/core/jsx-runtime/jsx"], function (BuildingBlockSupport, RuntimeBuildingBlock, ClassSupport, Button, Dialog, mLibrary, Page, Panel, Component, Core, JsControlTreeModifier, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var defineReference = ClassSupport.defineReference;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const ButtonType = mLibrary.ButtonType;
  let TableFullScreenDialogBlock = (_dec = defineBuildingBlock({
    name: "TableFullScreenDialog",
    namespace: "sap.fe.macros.table"
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(TableFullScreenDialogBlock, _RuntimeBuildingBlock);
    function TableFullScreenDialogBlock(props) {
      var _this;
      _this = _RuntimeBuildingBlock.call(this, props) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fullScreenButton", _descriptor2, _assertThisInitialized(_this));
      _this.fullScreenDialogContentPage = new Page();
      _this.enteringFullScreen = false;
      _this.messageBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      return _this;
    }
    _exports = TableFullScreenDialogBlock;
    var _proto = TableFullScreenDialogBlock.prototype;
    /**
     * Main handler for switching between full screen dialog and normal display.
     *
     * @function
     * @name onFullScreenToggle
     */
    _proto.onFullScreenToggle = async function onFullScreenToggle() {
      this.enteringFullScreen = !this.enteringFullScreen;
      this.tableAPI = this.getTableAPI();
      if (!this.tablePlaceHolderPanel) {
        this.tablePlaceHolderPanel = this.createTablePlaceHolderPanel();
      }
      if (this.enteringFullScreen) {
        var _this$fullScreenButto, _this$fullScreenButto2;
        // change the button icon and text
        (_this$fullScreenButto = this.fullScreenButton.current) === null || _this$fullScreenButto === void 0 ? void 0 : _this$fullScreenButto.setIcon("sap-icon://exit-full-screen");
        (_this$fullScreenButto2 = this.fullScreenButton.current) === null || _this$fullScreenButto2 === void 0 ? void 0 : _this$fullScreenButto2.setTooltip(this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MINIMIZE"));

        // Store the current location of the table to be able to move it back later
        this.nonFullScreenTableParent = this.tableAPI.getParent();
        this._originalAggregationName = await JsControlTreeModifier.getParentAggregationName(this.tableAPI);

        // Replace the current position of the table with an empty Panel as a placeholder
        this.nonFullScreenTableParent.setAggregation(this._originalAggregationName, this.tablePlaceHolderPanel);

        // Create the full screen dialog
        this.createDialog();

        // Move the table over into the content page in the dialog and open the dialog
        this.fullScreenDialogContentPage.addContent(this.tableAPI);
        this.fullScreenDialog.open();
      } else {
        var _this$fullScreenButto3, _this$fullScreenButto4;
        // change the button icon and text
        (_this$fullScreenButto3 = this.fullScreenButton.current) === null || _this$fullScreenButto3 === void 0 ? void 0 : _this$fullScreenButto3.setIcon("sap-icon://full-screen");
        (_this$fullScreenButto4 = this.fullScreenButton.current) === null || _this$fullScreenButto4 === void 0 ? void 0 : _this$fullScreenButto4.setTooltip(this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MAXIMIZE"));

        // Move the table back to the old place and close the dialog
        this.nonFullScreenTableParent.setAggregation(this._originalAggregationName, this.tableAPI);
        this.fullScreenDialog.close();
      }
    }

    /**
     * Determine a reference to the TableAPI control starting from the button.
     *
     * @function
     * @name getTableAPI
     * @returns The TableAPI
     */;
    _proto.getTableAPI = function getTableAPI() {
      let currentControl = this.fullScreenButton.current;
      do {
        currentControl = currentControl.getParent();
      } while (!currentControl.isA("sap.fe.macros.table.TableAPI"));
      return currentControl;
    }

    /**
     * Create the panel which acts as the placeholder for the table as long as it is displayed in the
     * full screen dialog.
     *
     * @function
     * @name createTablePlaceHolderPanel
     * @returns A Panel as placeholder for the table API
     */;
    _proto.createTablePlaceHolderPanel = function createTablePlaceHolderPanel() {
      const tablePlaceHolderPanel = new Panel({});
      tablePlaceHolderPanel.data("tableAPIreference", this.tableAPI);
      tablePlaceHolderPanel.data("FullScreenTablePlaceHolder", true);
      return tablePlaceHolderPanel;
    }

    /**
     * Create the full screen dialog.
     *
     * @function
     * @name createDialog
     */;
    _proto.createDialog = function createDialog() {
      if (!this.fullScreenDialog) {
        this.fullScreenDialog = new Dialog({
          showHeader: false,
          stretch: true,
          afterOpen: () => {
            this.afterDialogOpen();
          },
          beforeClose: () => {
            this.beforeDialogClose();
          },
          afterClose: () => {
            this.afterDialogClose();
          },
          endButton: this.getEndButton(),
          content: this.fullScreenDialogContentPage
        });
        // The below is needed for correctly setting the focus after adding a new row in
        // the table in fullscreen mode
        this.fullScreenDialog.data("FullScreenDialog", true);

        // Add the dialog as a dependent to the original parent of the table in order to not lose the context
        this.nonFullScreenTableParent.addDependent(this.fullScreenDialog);
      }
    }

    /**
     * Create the full screen dialog close button.
     *
     * @function
     * @name getEndButton
     * @returns The button control
     */;
    _proto.getEndButton = function getEndButton() {
      return new Button({
        text: this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_CLOSE"),
        type: ButtonType.Transparent,
        press: () => {
          // Just close the dialog here, all the needed processing is triggered
          // in beforeClose.
          // This ensures, that we only do it once event if the user presses the
          // ESC key and the Close button simultaneously
          this.fullScreenDialog.close();
        }
      });
    }

    /**
     * Set the focus back to the full screen button after opening the dialog.
     *
     * @function
     * @name afterDialogOpen
     */;
    _proto.afterDialogOpen = function afterDialogOpen() {
      var _this$fullScreenButto5;
      (_this$fullScreenButto5 = this.fullScreenButton.current) === null || _this$fullScreenButto5 === void 0 ? void 0 : _this$fullScreenButto5.focus();
    }

    /**
     * Handle dialog close via Esc. navigation etc.
     *
     * @function
     * @name beforeDialogClose
     */;
    _proto.beforeDialogClose = function beforeDialogClose() {
      // In case fullscreen dialog was closed due to navigation to another page/view/app, "Esc" click, etc. The dialog close
      // would be triggered externally and we need to clean up and move the table back to the old location
      if (this.tableAPI && this.enteringFullScreen) {
        this.onFullScreenToggle();
      }
    }

    /**
     * Some follow up after closing the dialog.
     *
     * @function
     * @name afterDialogClose
     */;
    _proto.afterDialogClose = function afterDialogClose() {
      var _this$fullScreenButto6;
      const component = Component.getOwnerComponentFor(this.tableAPI);
      const appComponent = Component.getOwnerComponentFor(component);
      (_this$fullScreenButto6 = this.fullScreenButton.current) === null || _this$fullScreenButto6 === void 0 ? void 0 : _this$fullScreenButto6.focus();
      // trigger the automatic scroll to the latest navigated row :
      appComponent.getRootViewController().getView().getController()._scrollTablesToLastNavigatedItems();
    }

    /**
     * The building block render function.
     *
     * @function
     * @name getContent
     * @returns An XML-based string with the definition of the full screen button
     */;
    _proto.getContent = function getContent() {
      return _jsx(Button, {
        ref: this.fullScreenButton,
        id: this.id,
        tooltip: this.messageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MAXIMIZE"),
        icon: "sap-icon://full-screen",
        press: () => this.onFullScreenToggle(),
        type: "Transparent",
        visible: true,
        enabled: true
      });
    };
    return TableFullScreenDialogBlock;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "fullScreenButton", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = TableFullScreenDialogBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibUxpYnJhcnkiLCJUYWJsZUZ1bGxTY3JlZW5EaWFsb2dCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJyZXF1aXJlZCIsImRlZmluZVJlZmVyZW5jZSIsInByb3BzIiwiZnVsbFNjcmVlbkRpYWxvZ0NvbnRlbnRQYWdlIiwiUGFnZSIsImVudGVyaW5nRnVsbFNjcmVlbiIsIm1lc3NhZ2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwib25GdWxsU2NyZWVuVG9nZ2xlIiwidGFibGVBUEkiLCJnZXRUYWJsZUFQSSIsInRhYmxlUGxhY2VIb2xkZXJQYW5lbCIsImNyZWF0ZVRhYmxlUGxhY2VIb2xkZXJQYW5lbCIsImZ1bGxTY3JlZW5CdXR0b24iLCJjdXJyZW50Iiwic2V0SWNvbiIsInNldFRvb2x0aXAiLCJnZXRUZXh0Iiwibm9uRnVsbFNjcmVlblRhYmxlUGFyZW50IiwiZ2V0UGFyZW50IiwiX29yaWdpbmFsQWdncmVnYXRpb25OYW1lIiwiSnNDb250cm9sVHJlZU1vZGlmaWVyIiwiZ2V0UGFyZW50QWdncmVnYXRpb25OYW1lIiwic2V0QWdncmVnYXRpb24iLCJjcmVhdGVEaWFsb2ciLCJhZGRDb250ZW50IiwiZnVsbFNjcmVlbkRpYWxvZyIsIm9wZW4iLCJjbG9zZSIsImN1cnJlbnRDb250cm9sIiwiaXNBIiwiUGFuZWwiLCJkYXRhIiwiRGlhbG9nIiwic2hvd0hlYWRlciIsInN0cmV0Y2giLCJhZnRlck9wZW4iLCJhZnRlckRpYWxvZ09wZW4iLCJiZWZvcmVDbG9zZSIsImJlZm9yZURpYWxvZ0Nsb3NlIiwiYWZ0ZXJDbG9zZSIsImFmdGVyRGlhbG9nQ2xvc2UiLCJlbmRCdXR0b24iLCJnZXRFbmRCdXR0b24iLCJjb250ZW50IiwiYWRkRGVwZW5kZW50IiwiQnV0dG9uIiwidGV4dCIsIlRyYW5zcGFyZW50IiwicHJlc3MiLCJmb2N1cyIsImNvbXBvbmVudCIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiYXBwQ29tcG9uZW50IiwiZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMiLCJnZXRDb250ZW50IiwiaWQiLCJSdW50aW1lQnVpbGRpbmdCbG9jayJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGFibGVGdWxsU2NyZWVuRGlhbG9nLmJsb2NrLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgeyBibG9ja0F0dHJpYnV0ZSwgZGVmaW5lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrU3VwcG9ydFwiO1xuaW1wb3J0IFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9SdW50aW1lQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGRlZmluZVJlZmVyZW5jZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgUmVmIH0gZnJvbSBcInNhcC9mZS9jb3JlL2pzeC1ydW50aW1lL2pzeFwiO1xuaW1wb3J0IFRhYmxlQVBJIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1RhYmxlQVBJXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IG1MaWJyYXJ5IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5pbXBvcnQgUGFnZSBmcm9tIFwic2FwL20vUGFnZVwiO1xuaW1wb3J0IFBhbmVsIGZyb20gXCJzYXAvbS9QYW5lbFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB7IEpzQ29udHJvbFRyZWVNb2RpZmllciB9IGZyb20gXCJzYXAvdWkvY29yZS91dGlsL3JlZmxlY3Rpb25cIjtcblxuY29uc3QgQnV0dG9uVHlwZSA9IG1MaWJyYXJ5LkJ1dHRvblR5cGU7XG5cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJUYWJsZUZ1bGxTY3JlZW5EaWFsb2dcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MudGFibGVcIlxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYmxlRnVsbFNjcmVlbkRpYWxvZ0Jsb2NrIGV4dGVuZHMgUnVudGltZUJ1aWxkaW5nQmxvY2sge1xuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPFRhYmxlRnVsbFNjcmVlbkRpYWxvZ0Jsb2NrPikge1xuXHRcdHN1cGVyKHByb3BzKTtcblx0XHR0aGlzLmVudGVyaW5nRnVsbFNjcmVlbiA9IGZhbHNlO1xuXHRcdHRoaXMubWVzc2FnZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLm1hY3Jvc1wiKTtcblx0fVxuXG5cdEBibG9ja0F0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGlzUHVibGljOiB0cnVlLCByZXF1aXJlZDogdHJ1ZSB9KVxuXHRwdWJsaWMgaWQhOiBzdHJpbmc7XG5cblx0QGRlZmluZVJlZmVyZW5jZSgpXG5cdGZ1bGxTY3JlZW5CdXR0b24hOiBSZWY8QnV0dG9uPjtcblxuXHR0YWJsZUFQSSE6IFRhYmxlQVBJO1xuXG5cdG1lc3NhZ2VCdW5kbGU6IFJlc291cmNlQnVuZGxlO1xuXG5cdGZ1bGxTY3JlZW5EaWFsb2chOiBEaWFsb2c7XG5cblx0ZW50ZXJpbmdGdWxsU2NyZWVuOiBib29sZWFuO1xuXG5cdG5vbkZ1bGxTY3JlZW5UYWJsZVBhcmVudCE6IENvbnRyb2w7XG5cblx0X29yaWdpbmFsQWdncmVnYXRpb25OYW1lITogc3RyaW5nO1xuXG5cdGZ1bGxTY3JlZW5EaWFsb2dDb250ZW50UGFnZSA9IG5ldyBQYWdlKCk7XG5cblx0dGFibGVQbGFjZUhvbGRlclBhbmVsITogUGFuZWw7XG5cblx0LyoqXG5cdCAqIE1haW4gaGFuZGxlciBmb3Igc3dpdGNoaW5nIGJldHdlZW4gZnVsbCBzY3JlZW4gZGlhbG9nIGFuZCBub3JtYWwgZGlzcGxheS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIG9uRnVsbFNjcmVlblRvZ2dsZVxuXHQgKi9cblx0cHVibGljIGFzeW5jIG9uRnVsbFNjcmVlblRvZ2dsZSgpIHtcblx0XHR0aGlzLmVudGVyaW5nRnVsbFNjcmVlbiA9ICF0aGlzLmVudGVyaW5nRnVsbFNjcmVlbjtcblx0XHR0aGlzLnRhYmxlQVBJID0gdGhpcy5nZXRUYWJsZUFQSSgpO1xuXHRcdGlmICghdGhpcy50YWJsZVBsYWNlSG9sZGVyUGFuZWwpIHtcblx0XHRcdHRoaXMudGFibGVQbGFjZUhvbGRlclBhbmVsID0gdGhpcy5jcmVhdGVUYWJsZVBsYWNlSG9sZGVyUGFuZWwoKTtcblx0XHR9XG5cblx0XHRpZiAodGhpcy5lbnRlcmluZ0Z1bGxTY3JlZW4pIHtcblx0XHRcdC8vIGNoYW5nZSB0aGUgYnV0dG9uIGljb24gYW5kIHRleHRcblx0XHRcdHRoaXMuZnVsbFNjcmVlbkJ1dHRvbi5jdXJyZW50Py5zZXRJY29uKFwic2FwLWljb246Ly9leGl0LWZ1bGwtc2NyZWVuXCIpO1xuXHRcdFx0dGhpcy5mdWxsU2NyZWVuQnV0dG9uLmN1cnJlbnQ/LnNldFRvb2x0aXAodGhpcy5tZXNzYWdlQnVuZGxlLmdldFRleHQoXCJNX0NPTU1PTl9UQUJMRV9GVUxMU0NSRUVOX01JTklNSVpFXCIpKTtcblxuXHRcdFx0Ly8gU3RvcmUgdGhlIGN1cnJlbnQgbG9jYXRpb24gb2YgdGhlIHRhYmxlIHRvIGJlIGFibGUgdG8gbW92ZSBpdCBiYWNrIGxhdGVyXG5cdFx0XHR0aGlzLm5vbkZ1bGxTY3JlZW5UYWJsZVBhcmVudCA9IHRoaXMudGFibGVBUEkuZ2V0UGFyZW50KCkhIGFzIENvbnRyb2w7XG5cdFx0XHR0aGlzLl9vcmlnaW5hbEFnZ3JlZ2F0aW9uTmFtZSA9IGF3YWl0IEpzQ29udHJvbFRyZWVNb2RpZmllci5nZXRQYXJlbnRBZ2dyZWdhdGlvbk5hbWUodGhpcy50YWJsZUFQSSk7XG5cblx0XHRcdC8vIFJlcGxhY2UgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIHRhYmxlIHdpdGggYW4gZW1wdHkgUGFuZWwgYXMgYSBwbGFjZWhvbGRlclxuXHRcdFx0dGhpcy5ub25GdWxsU2NyZWVuVGFibGVQYXJlbnQuc2V0QWdncmVnYXRpb24odGhpcy5fb3JpZ2luYWxBZ2dyZWdhdGlvbk5hbWUsIHRoaXMudGFibGVQbGFjZUhvbGRlclBhbmVsKTtcblxuXHRcdFx0Ly8gQ3JlYXRlIHRoZSBmdWxsIHNjcmVlbiBkaWFsb2dcblx0XHRcdHRoaXMuY3JlYXRlRGlhbG9nKCk7XG5cblx0XHRcdC8vIE1vdmUgdGhlIHRhYmxlIG92ZXIgaW50byB0aGUgY29udGVudCBwYWdlIGluIHRoZSBkaWFsb2cgYW5kIG9wZW4gdGhlIGRpYWxvZ1xuXHRcdFx0dGhpcy5mdWxsU2NyZWVuRGlhbG9nQ29udGVudFBhZ2UuYWRkQ29udGVudCh0aGlzLnRhYmxlQVBJKTtcblx0XHRcdHRoaXMuZnVsbFNjcmVlbkRpYWxvZy5vcGVuKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGNoYW5nZSB0aGUgYnV0dG9uIGljb24gYW5kIHRleHRcblx0XHRcdHRoaXMuZnVsbFNjcmVlbkJ1dHRvbi5jdXJyZW50Py5zZXRJY29uKFwic2FwLWljb246Ly9mdWxsLXNjcmVlblwiKTtcblx0XHRcdHRoaXMuZnVsbFNjcmVlbkJ1dHRvbi5jdXJyZW50Py5zZXRUb29sdGlwKHRoaXMubWVzc2FnZUJ1bmRsZS5nZXRUZXh0KFwiTV9DT01NT05fVEFCTEVfRlVMTFNDUkVFTl9NQVhJTUlaRVwiKSk7XG5cblx0XHRcdC8vIE1vdmUgdGhlIHRhYmxlIGJhY2sgdG8gdGhlIG9sZCBwbGFjZSBhbmQgY2xvc2UgdGhlIGRpYWxvZ1xuXHRcdFx0dGhpcy5ub25GdWxsU2NyZWVuVGFibGVQYXJlbnQuc2V0QWdncmVnYXRpb24odGhpcy5fb3JpZ2luYWxBZ2dyZWdhdGlvbk5hbWUsIHRoaXMudGFibGVBUEkpO1xuXHRcdFx0dGhpcy5mdWxsU2NyZWVuRGlhbG9nLmNsb3NlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERldGVybWluZSBhIHJlZmVyZW5jZSB0byB0aGUgVGFibGVBUEkgY29udHJvbCBzdGFydGluZyBmcm9tIHRoZSBidXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRUYWJsZUFQSVxuXHQgKiBAcmV0dXJucyBUaGUgVGFibGVBUElcblx0ICovXG5cdHByaXZhdGUgZ2V0VGFibGVBUEkoKTogVGFibGVBUEkge1xuXHRcdGxldCBjdXJyZW50Q29udHJvbDogQ29udHJvbCA9IHRoaXMuZnVsbFNjcmVlbkJ1dHRvbi5jdXJyZW50IGFzIENvbnRyb2w7XG5cdFx0ZG8ge1xuXHRcdFx0Y3VycmVudENvbnRyb2wgPSBjdXJyZW50Q29udHJvbC5nZXRQYXJlbnQoKSBhcyBDb250cm9sO1xuXHRcdH0gd2hpbGUgKCFjdXJyZW50Q29udHJvbC5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKTtcblx0XHRyZXR1cm4gY3VycmVudENvbnRyb2wgYXMgVGFibGVBUEk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBwYW5lbCB3aGljaCBhY3RzIGFzIHRoZSBwbGFjZWhvbGRlciBmb3IgdGhlIHRhYmxlIGFzIGxvbmcgYXMgaXQgaXMgZGlzcGxheWVkIGluIHRoZVxuXHQgKiBmdWxsIHNjcmVlbiBkaWFsb2cuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBjcmVhdGVUYWJsZVBsYWNlSG9sZGVyUGFuZWxcblx0ICogQHJldHVybnMgQSBQYW5lbCBhcyBwbGFjZWhvbGRlciBmb3IgdGhlIHRhYmxlIEFQSVxuXHQgKi9cblx0cHJpdmF0ZSBjcmVhdGVUYWJsZVBsYWNlSG9sZGVyUGFuZWwoKTogUGFuZWwge1xuXHRcdGNvbnN0IHRhYmxlUGxhY2VIb2xkZXJQYW5lbCA9IG5ldyBQYW5lbCh7fSk7XG5cdFx0dGFibGVQbGFjZUhvbGRlclBhbmVsLmRhdGEoXCJ0YWJsZUFQSXJlZmVyZW5jZVwiLCB0aGlzLnRhYmxlQVBJKTtcblx0XHR0YWJsZVBsYWNlSG9sZGVyUGFuZWwuZGF0YShcIkZ1bGxTY3JlZW5UYWJsZVBsYWNlSG9sZGVyXCIsIHRydWUpO1xuXHRcdHJldHVybiB0YWJsZVBsYWNlSG9sZGVyUGFuZWw7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBmdWxsIHNjcmVlbiBkaWFsb2cuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBjcmVhdGVEaWFsb2dcblx0ICovXG5cdHByaXZhdGUgY3JlYXRlRGlhbG9nKCkge1xuXHRcdGlmICghdGhpcy5mdWxsU2NyZWVuRGlhbG9nKSB7XG5cdFx0XHR0aGlzLmZ1bGxTY3JlZW5EaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdFx0c2hvd0hlYWRlcjogZmFsc2UsXG5cdFx0XHRcdHN0cmV0Y2g6IHRydWUsXG5cdFx0XHRcdGFmdGVyT3BlbjogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuYWZ0ZXJEaWFsb2dPcGVuKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGJlZm9yZUNsb3NlOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5iZWZvcmVEaWFsb2dDbG9zZSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRhZnRlckNsb3NlOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5hZnRlckRpYWxvZ0Nsb3NlKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVuZEJ1dHRvbjogdGhpcy5nZXRFbmRCdXR0b24oKSxcblx0XHRcdFx0Y29udGVudDogdGhpcy5mdWxsU2NyZWVuRGlhbG9nQ29udGVudFBhZ2Vcblx0XHRcdH0pO1xuXHRcdFx0Ly8gVGhlIGJlbG93IGlzIG5lZWRlZCBmb3IgY29ycmVjdGx5IHNldHRpbmcgdGhlIGZvY3VzIGFmdGVyIGFkZGluZyBhIG5ldyByb3cgaW5cblx0XHRcdC8vIHRoZSB0YWJsZSBpbiBmdWxsc2NyZWVuIG1vZGVcblx0XHRcdHRoaXMuZnVsbFNjcmVlbkRpYWxvZy5kYXRhKFwiRnVsbFNjcmVlbkRpYWxvZ1wiLCB0cnVlKTtcblxuXHRcdFx0Ly8gQWRkIHRoZSBkaWFsb2cgYXMgYSBkZXBlbmRlbnQgdG8gdGhlIG9yaWdpbmFsIHBhcmVudCBvZiB0aGUgdGFibGUgaW4gb3JkZXIgdG8gbm90IGxvc2UgdGhlIGNvbnRleHRcblx0XHRcdHRoaXMubm9uRnVsbFNjcmVlblRhYmxlUGFyZW50LmFkZERlcGVuZGVudCh0aGlzLmZ1bGxTY3JlZW5EaWFsb2cpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIGZ1bGwgc2NyZWVuIGRpYWxvZyBjbG9zZSBidXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRFbmRCdXR0b25cblx0ICogQHJldHVybnMgVGhlIGJ1dHRvbiBjb250cm9sXG5cdCAqL1xuXHRwcml2YXRlIGdldEVuZEJ1dHRvbigpIHtcblx0XHRyZXR1cm4gbmV3IEJ1dHRvbih7XG5cdFx0XHR0ZXh0OiB0aGlzLm1lc3NhZ2VCdW5kbGUuZ2V0VGV4dChcIk1fQ09NTU9OX1RBQkxFX0ZVTExTQ1JFRU5fQ0xPU0VcIiksXG5cdFx0XHR0eXBlOiBCdXR0b25UeXBlLlRyYW5zcGFyZW50LFxuXHRcdFx0cHJlc3M6ICgpID0+IHtcblx0XHRcdFx0Ly8gSnVzdCBjbG9zZSB0aGUgZGlhbG9nIGhlcmUsIGFsbCB0aGUgbmVlZGVkIHByb2Nlc3NpbmcgaXMgdHJpZ2dlcmVkXG5cdFx0XHRcdC8vIGluIGJlZm9yZUNsb3NlLlxuXHRcdFx0XHQvLyBUaGlzIGVuc3VyZXMsIHRoYXQgd2Ugb25seSBkbyBpdCBvbmNlIGV2ZW50IGlmIHRoZSB1c2VyIHByZXNzZXMgdGhlXG5cdFx0XHRcdC8vIEVTQyBrZXkgYW5kIHRoZSBDbG9zZSBidXR0b24gc2ltdWx0YW5lb3VzbHlcblx0XHRcdFx0dGhpcy5mdWxsU2NyZWVuRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0IHRoZSBmb2N1cyBiYWNrIHRvIHRoZSBmdWxsIHNjcmVlbiBidXR0b24gYWZ0ZXIgb3BlbmluZyB0aGUgZGlhbG9nLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgYWZ0ZXJEaWFsb2dPcGVuXG5cdCAqL1xuXHRwcml2YXRlIGFmdGVyRGlhbG9nT3BlbigpIHtcblx0XHR0aGlzLmZ1bGxTY3JlZW5CdXR0b24uY3VycmVudD8uZm9jdXMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGUgZGlhbG9nIGNsb3NlIHZpYSBFc2MuIG5hdmlnYXRpb24gZXRjLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgYmVmb3JlRGlhbG9nQ2xvc2Vcblx0ICovXG5cdHByaXZhdGUgYmVmb3JlRGlhbG9nQ2xvc2UoKSB7XG5cdFx0Ly8gSW4gY2FzZSBmdWxsc2NyZWVuIGRpYWxvZyB3YXMgY2xvc2VkIGR1ZSB0byBuYXZpZ2F0aW9uIHRvIGFub3RoZXIgcGFnZS92aWV3L2FwcCwgXCJFc2NcIiBjbGljaywgZXRjLiBUaGUgZGlhbG9nIGNsb3NlXG5cdFx0Ly8gd291bGQgYmUgdHJpZ2dlcmVkIGV4dGVybmFsbHkgYW5kIHdlIG5lZWQgdG8gY2xlYW4gdXAgYW5kIG1vdmUgdGhlIHRhYmxlIGJhY2sgdG8gdGhlIG9sZCBsb2NhdGlvblxuXHRcdGlmICh0aGlzLnRhYmxlQVBJICYmIHRoaXMuZW50ZXJpbmdGdWxsU2NyZWVuKSB7XG5cdFx0XHR0aGlzLm9uRnVsbFNjcmVlblRvZ2dsZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTb21lIGZvbGxvdyB1cCBhZnRlciBjbG9zaW5nIHRoZSBkaWFsb2cuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBhZnRlckRpYWxvZ0Nsb3NlXG5cdCAqL1xuXHRwcml2YXRlIGFmdGVyRGlhbG9nQ2xvc2UoKSB7XG5cdFx0Y29uc3QgY29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRoaXMudGFibGVBUEkpITtcblx0XHRjb25zdCBhcHBDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IoY29tcG9uZW50KSBhcyBBcHBDb21wb25lbnQ7XG5cdFx0dGhpcy5mdWxsU2NyZWVuQnV0dG9uLmN1cnJlbnQ/LmZvY3VzKCk7XG5cdFx0Ly8gdHJpZ2dlciB0aGUgYXV0b21hdGljIHNjcm9sbCB0byB0aGUgbGF0ZXN0IG5hdmlnYXRlZCByb3cgOlxuXHRcdChhcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLl9zY3JvbGxUYWJsZXNUb0xhc3ROYXZpZ2F0ZWRJdGVtcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayByZW5kZXIgZnVuY3Rpb24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb250ZW50XG5cdCAqIEByZXR1cm5zIEFuIFhNTC1iYXNlZCBzdHJpbmcgd2l0aCB0aGUgZGVmaW5pdGlvbiBvZiB0aGUgZnVsbCBzY3JlZW4gYnV0dG9uXG5cdCAqL1xuXHRnZXRDb250ZW50KCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdHJlZj17dGhpcy5mdWxsU2NyZWVuQnV0dG9ufVxuXHRcdFx0XHRpZD17dGhpcy5pZH1cblx0XHRcdFx0dG9vbHRpcD17dGhpcy5tZXNzYWdlQnVuZGxlLmdldFRleHQoXCJNX0NPTU1PTl9UQUJMRV9GVUxMU0NSRUVOX01BWElNSVpFXCIpfVxuXHRcdFx0XHRpY29uPXtcInNhcC1pY29uOi8vZnVsbC1zY3JlZW5cIn1cblx0XHRcdFx0cHJlc3M9eygpID0+IHRoaXMub25GdWxsU2NyZWVuVG9nZ2xlKCl9XG5cdFx0XHRcdHR5cGU9e1wiVHJhbnNwYXJlbnRcIn1cblx0XHRcdFx0dmlzaWJsZT17dHJ1ZX1cblx0XHRcdFx0ZW5hYmxlZD17dHJ1ZX1cblx0XHRcdC8+XG5cdFx0KSBhcyBCdXR0b247XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7O0VBa0JBLE1BQU1BLFVBQVUsR0FBR0MsUUFBUSxDQUFDRCxVQUFVO0VBQUMsSUFNbEJFLDBCQUEwQixXQUo5Q0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSx1QkFBdUI7SUFDN0JDLFNBQVMsRUFBRTtFQUNaLENBQUMsQ0FBQyxVQVFBQyxjQUFjLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFLElBQUk7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBR2xFQyxlQUFlLEVBQUU7SUFBQTtJQVRsQixvQ0FBWUMsS0FBK0MsRUFBRTtNQUFBO01BQzVELHlDQUFNQSxLQUFLLENBQUM7TUFBQztNQUFBO01BQUEsTUF1QmRDLDJCQUEyQixHQUFHLElBQUlDLElBQUksRUFBRTtNQXRCdkMsTUFBS0Msa0JBQWtCLEdBQUcsS0FBSztNQUMvQixNQUFLQyxhQUFhLEdBQUdDLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsZUFBZSxDQUFDO01BQUM7SUFDckU7SUFBQztJQUFBO0lBd0JEO0FBQ0Q7QUFDQTtBQUNB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
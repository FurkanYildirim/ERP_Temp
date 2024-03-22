/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/MessageHandler", "sap/fe/core/controllerextensions/PageReady", "sap/fe/core/controllerextensions/Paginator", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/library", "sap/fe/core/PageController", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/table/TableHelper", "sap/fe/macros/table/Utils", "sap/fe/navigation/SelectionVariant", "sap/fe/templates/ObjectPage/ExtensionAPI", "sap/fe/templates/TableScroller", "sap/m/InstanceManager", "sap/m/Link", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/message/Message", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/odata/v4/ODataListBinding", "./overrides/IntentBasedNavigation", "./overrides/InternalRouting", "./overrides/MessageHandler", "./overrides/Paginator", "./overrides/Share", "./overrides/ViewState"], function (Log, merge, ActionRuntime, CommonUtils, BusyLocker, ActivitySync, draft, IntentBasedNavigation, InternalIntentBasedNavigation, InternalRouting, MassEdit, MessageHandler, PageReady, Paginator, Placeholder, Share, ViewState, ClassSupport, ModelHelper, ResourceModelHelper, FELibrary, PageController, CommonHelper, DelegateUtil, TableHelper, TableUtils, SelectionVariant, ExtensionAPI, TableScroller, InstanceManager, Link, MessageBox, Core, Message, OverrideExecution, ODataListBinding, IntentBasedNavigationOverride, InternalRoutingOverride, MessageHandlerOverride, PaginatorOverride, ShareOverrides, ViewStateOverrides) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var isConnected = ActivitySync.isConnected;
  var disconnect = ActivitySync.disconnect;
  var connect = ActivitySync.connect;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const ProgrammingModel = FELibrary.ProgrammingModel;
  let ObjectPageController = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ObjectPageController"), _dec2 = usingExtension(Placeholder), _dec3 = usingExtension(Share.override(ShareOverrides)), _dec4 = usingExtension(InternalRouting.override(InternalRoutingOverride)), _dec5 = usingExtension(Paginator.override(PaginatorOverride)), _dec6 = usingExtension(MessageHandler.override(MessageHandlerOverride)), _dec7 = usingExtension(IntentBasedNavigation.override(IntentBasedNavigationOverride)), _dec8 = usingExtension(InternalIntentBasedNavigation.override({
    getNavigationMode: function () {
      const bIsStickyEditMode = this.getView().getController().getStickyEditMode && this.getView().getController().getStickyEditMode();
      return bIsStickyEditMode ? "explace" : undefined;
    }
  })), _dec9 = usingExtension(ViewState.override(ViewStateOverrides)), _dec10 = usingExtension(PageReady.override({
    isContextExpected: function () {
      return true;
    }
  })), _dec11 = usingExtension(MassEdit), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_PageController) {
    _inheritsLoose(ObjectPageController, _PageController);
    function ObjectPageController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _PageController.call(this, ...args) || this;
      _initializerDefineProperty(_this, "placeholder", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_routing", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "paginator", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pageReady", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor10, _assertThisInitialized(_this));
      _this.handlers = {
        /**
         * Invokes the page primary action on press of Ctrl+Enter.
         *
         * @param oController The page controller
         * @param oView
         * @param oContext Context for which the action is called
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @param [mConditions] Contains the following attributes:
         * @param [mConditions.positiveActionVisible] The visibility of sematic positive action
         * @param [mConditions.positiveActionEnabled] The enablement of semantic positive action
         * @param [mConditions.editActionVisible] The Edit button visibility
         * @param [mConditions.editActionEnabled] The enablement of Edit button
         * @ui5-restricted
         * @final
         */
        onPrimaryAction(oController, oView, oContext, sActionName, mParameters, mConditions) {
          const iViewLevel = oController.getView().getViewData().viewLevel;
          if (mConditions.positiveActionVisible) {
            if (mConditions.positiveActionEnabled) {
              oController.handlers.onCallAction(oView, sActionName, mParameters);
            }
          } else if (mConditions.editActionVisible) {
            if (mConditions.editActionEnabled) {
              oController._editDocument(oContext);
            }
          } else if (iViewLevel === 1 && oView.getModel("ui").getProperty("/isEditable")) {
            oController._saveDocument(oContext);
          } else if (oView.getModel("ui").getProperty("/isEditable")) {
            oController._applyDocument(oContext);
          }
        },
        /**
         * Manages the context change event on the tables.
         * The focus is set if this change is related to an editFlow action and
         * an event is fired on the objectPage messageButton.
         *
         * @param this The objectPage controller
         * @param event The UI5 event
         */
        async onTableContextChange(event) {
          var _this$_getTableBindin;
          const tableAPI = event.getSource();
          const table = tableAPI.content;
          const currentActionPromise = this.editFlow.getCurrentActionPromise();
          const tableContexts = (_this$_getTableBindin = this._getTableBinding(table)) === null || _this$_getTableBindin === void 0 ? void 0 : _this$_getTableBindin.getCurrentContexts();
          if (currentActionPromise && tableContexts !== null && tableContexts !== void 0 && tableContexts.length) {
            try {
              const actionResponse = await currentActionPromise;
              if ((actionResponse === null || actionResponse === void 0 ? void 0 : actionResponse.controlId) === table.getId()) {
                const actionData = actionResponse.oData;
                const keys = actionResponse.keys;
                const newItem = tableContexts.findIndex(tableContext => {
                  const tableData = tableContext.getObject();
                  return keys.every(key => tableData[key] === actionData[key]);
                });
                if (newItem !== -1) {
                  const dialog = InstanceManager.getOpenDialogs().find(dialog => dialog.data("FullScreenDialog") !== true);
                  if (dialog) {
                    // by design, a sap.m.dialog set the focus to the previous focused element when closing.
                    // we should wait for the dialog to be closed before set the focus to another element
                    dialog.attachEventOnce("afterClose", () => {
                      table.focusRow(newItem, true);
                    });
                  } else {
                    table.focusRow(newItem, true);
                  }
                  this.editFlow.deleteCurrentActionPromise();
                }
              }
            } catch (e) {
              Log.error(`An error occurs while scrolling to the newly created Item: ${e}`);
            }
          }
          // fire ModelContextChange on the message button whenever the table context changes
          this.messageButton.fireModelContextChange();
        },
        /**
         * Invokes an action - bound/unbound and sets the page dirty.
         *
         * @param oView
         * @param sActionName The name of the action to be called
         * @param [mParameters] Contains the following attributes:
         * @param [mParameters.contexts] Mandatory for a bound action, either one context or an array with contexts for which the action is called
         * @param [mParameters.model] Mandatory for an unbound action; an instance of an OData V4 model
         * @returns The action promise
         * @ui5-restricted
         * @final
         */
        onCallAction(oView, sActionName, mParameters) {
          const oController = oView.getController();
          return oController.editFlow.invokeAction(sActionName, mParameters).then(oController._showMessagePopover.bind(oController, undefined)).catch(oController._showMessagePopover.bind(oController));
        },
        onDataPointTitlePressed(oController, oSource, oManifestOutbound, sControlConfig, sCollectionPath) {
          oManifestOutbound = typeof oManifestOutbound === "string" ? JSON.parse(oManifestOutbound) : oManifestOutbound;
          const oTargetInfo = oManifestOutbound[sControlConfig],
            aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oTargetInfo),
            oDataPointOrChartBindingContext = oSource.getBindingContext(),
            sMetaPath = oDataPointOrChartBindingContext.getModel().getMetaModel().getMetaPath(oDataPointOrChartBindingContext.getPath());
          let aNavigationData = oController._getChartContextData(oDataPointOrChartBindingContext, sCollectionPath);
          let additionalNavigationParameters;
          aNavigationData = aNavigationData.map(function (oNavigationData) {
            return {
              data: oNavigationData,
              metaPath: sMetaPath + (sCollectionPath ? `/${sCollectionPath}` : "")
            };
          });
          if (oTargetInfo && oTargetInfo.parameters) {
            const oParams = oTargetInfo.parameters && oController._intentBasedNavigation.getOutboundParams(oTargetInfo.parameters);
            if (Object.keys(oParams).length > 0) {
              additionalNavigationParameters = oParams;
            }
          }
          if (oTargetInfo && oTargetInfo.semanticObject && oTargetInfo.action) {
            oController._intentBasedNavigation.navigate(oTargetInfo.semanticObject, oTargetInfo.action, {
              navigationContexts: aNavigationData,
              semanticObjectMapping: aSemanticObjectMapping,
              additionalNavigationParameters: additionalNavigationParameters
            });
          }
        },
        /**
         * Triggers an outbound navigation when a user chooses the chevron.
         *
         * @param oController
         * @param sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
         * @param oContext The context that contains the data for the target app
         * @param sCreatePath Create path when the chevron is created.
         * @returns Promise which is resolved once the navigation is triggered (??? maybe only once finished?)
         * @ui5-restricted
         * @final
         */
        onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
          return oController._intentBasedNavigation.onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath);
        },
        onNavigateChange(oEvent) {
          //will be called always when we click on a section tab
          this.getExtensionAPI().updateAppState();
          this.bSectionNavigated = true;
          const oInternalModelContext = this.getView().getBindingContext("internal");
          if (this.getView().getModel("ui").getProperty("/isEditable") && this.getView().getViewData().sectionLayout === "Tabs" && oInternalModelContext.getProperty("errorNavigationSectionFlag") === false) {
            const oSubSection = oEvent.getParameter("subSection");
            this._updateFocusInEditMode([oSubSection]);
          }
        },
        onVariantSelected: function () {
          this.getExtensionAPI().updateAppState();
        },
        onVariantSaved: function () {
          //TODO: Should remove this setTimeOut once Variant Management provides an api to fetch the current variant key on save
          setTimeout(() => {
            this.getExtensionAPI().updateAppState();
          }, 2000);
        },
        navigateToSubSection: function (oController, vDetailConfig) {
          const oDetailConfig = typeof vDetailConfig === "string" ? JSON.parse(vDetailConfig) : vDetailConfig;
          const oObjectPage = oController.getView().byId("fe::ObjectPage");
          let oSection;
          let oSubSection;
          if (oDetailConfig.sectionId) {
            oSection = oController.getView().byId(oDetailConfig.sectionId);
            oSubSection = oDetailConfig.subSectionId ? oController.getView().byId(oDetailConfig.subSectionId) : oSection && oSection.getSubSections() && oSection.getSubSections()[0];
          } else if (oDetailConfig.subSectionId) {
            oSubSection = oController.getView().byId(oDetailConfig.subSectionId);
            oSection = oSubSection && oSubSection.getParent();
          }
          if (!oSection || !oSubSection || !oSection.getVisible() || !oSubSection.getVisible()) {
            const sTitle = getResourceModel(oController).getText("C_ROUTING_NAVIGATION_DISABLED_TITLE", undefined, oController.getView().getViewData().entitySet);
            Log.error(sTitle);
            MessageBox.error(sTitle);
          } else {
            oObjectPage.scrollToSection(oSubSection.getId());
            // trigger iapp state change
            oObjectPage.fireNavigate({
              section: oSection,
              subSection: oSubSection
            });
          }
        },
        onStateChange() {
          this.getExtensionAPI().updateAppState();
        },
        closeOPMessageStrip: function () {
          this.getExtensionAPI().hideMessage();
        }
      };
      return _this;
    }
    var _proto = ObjectPageController.prototype;
    _proto.getExtensionAPI = function getExtensionAPI(sId) {
      if (sId) {
        // to allow local ID usage for custom pages we'll create/return own instances for custom sections
        this.mCustomSectionExtensionAPIs = this.mCustomSectionExtensionAPIs || {};
        if (!this.mCustomSectionExtensionAPIs[sId]) {
          this.mCustomSectionExtensionAPIs[sId] = new ExtensionAPI(this, sId);
        }
        return this.mCustomSectionExtensionAPIs[sId];
      } else {
        if (!this.extensionAPI) {
          this.extensionAPI = new ExtensionAPI(this);
        }
        return this.extensionAPI;
      }
    };
    _proto.onInit = function onInit() {
      _PageController.prototype.onInit.call(this);
      const oObjectPage = this._getObjectPageLayoutControl();

      // Setting defaults of internal model context
      const oInternalModelContext = this.getView().getBindingContext("internal");
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("externalNavigationContext", {
        page: true
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("relatedApps", {
        visibility: false,
        items: null
      });
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("batchGroups", this._getBatchGroupsForView());
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      if (oObjectPage.getEnableLazyLoading()) {
        //Attaching the event to make the subsection context binding active when it is visible.
        oObjectPage.attachEvent("subSectionEnteredViewPort", this._handleSubSectionEnteredViewPort.bind(this));
      }
      this.messageButton = this.getView().byId("fe::FooterBar::MessageButton");
      this.messageButton.oItemBinding.attachChange(this._fnShowOPMessage, this);
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("rootEditEnabled", true);
      oInternalModelContext === null || oInternalModelContext === void 0 ? void 0 : oInternalModelContext.setProperty("rootEditVisible", true);
    };
    _proto.onExit = function onExit() {
      if (this.mCustomSectionExtensionAPIs) {
        for (const sId of Object.keys(this.mCustomSectionExtensionAPIs)) {
          if (this.mCustomSectionExtensionAPIs[sId]) {
            this.mCustomSectionExtensionAPIs[sId].destroy();
          }
        }
        delete this.mCustomSectionExtensionAPIs;
      }
      if (this.extensionAPI) {
        this.extensionAPI.destroy();
      }
      delete this.extensionAPI;
      const oMessagePopover = this.messageButton ? this.messageButton.oMessagePopover : null;
      if (oMessagePopover && oMessagePopover.isOpen()) {
        oMessagePopover.close();
      }
      //when exiting we set keepAlive context to false
      const oContext = this.getView().getBindingContext();
      if (oContext && oContext.isKeepAlive()) {
        oContext.setKeepAlive(false);
      }
      if (isConnected(this.getView())) {
        disconnect(this.getView()); // Cleanup collaboration connection when leaving the app
      }
    }

    /**
     * Method to show the message strip on the object page.
     *
     * @private
     */;
    _proto._fnShowOPMessage = function _fnShowOPMessage() {
      const extensionAPI = this.getExtensionAPI();
      const view = this.getView();
      const messages = this.messageButton.oMessagePopover.getItems().map(item => item.getBindingContext("message").getObject()).filter(message => {
        var _view$getBindingConte;
        return message.getTargets()[0] === ((_view$getBindingConte = view.getBindingContext()) === null || _view$getBindingConte === void 0 ? void 0 : _view$getBindingConte.getPath());
      });
      if (extensionAPI) {
        extensionAPI.showMessages(messages);
      }
    };
    _proto._getTableBinding = function _getTableBinding(oTable) {
      return oTable && oTable.getRowBinding();
    }

    /**
     * Find the last visible subsection and add the sapUxAPObjectPageSubSectionFitContainer CSS class if it contains only a GridTable or a TreeTable.
     *
     * @param subSections The sub sections to look for
     * @private
     */;
    _proto.checkSectionsForNonResponsiveTable = function checkSectionsForNonResponsiveTable(subSections) {
      const changeClassForTables = (event, lastVisibleSubSection) => {
        var _this$searchTableInBl;
        const blocks = [...lastVisibleSubSection.getBlocks(), ...lastVisibleSubSection.getMoreBlocks()];
        const tableType = blocks.length === 1 && ((_this$searchTableInBl = this.searchTableInBlock(blocks[0])) === null || _this$searchTableInBl === void 0 ? void 0 : _this$searchTableInBl.getType());
        if (tableType && (tableType !== null && tableType !== void 0 && tableType.isA("sap.ui.mdc.table.GridTableType") || tableType !== null && tableType !== void 0 && tableType.isA("sap.ui.mdc.table.TreeTableType"))) {
          //In case there is only a single table in a subSection we fit that to the whole page so that the scrollbar comes only on table and not on page
          lastVisibleSubSection.addStyleClass("sapUxAPObjectPageSubSectionFitContainer");
          lastVisibleSubSection.detachEvent("modelContextChange", changeClassForTables, this);
        }
      };
      for (let subSectionIndex = subSections.length - 1; subSectionIndex >= 0; subSectionIndex--) {
        if (subSections[subSectionIndex].getVisible()) {
          const lastVisibleSubSection = subSections[subSectionIndex];
          // We need to attach this event in order to manage the Object Page Lazy Loading mechanism
          lastVisibleSubSection.attachEvent("modelContextChange", lastVisibleSubSection, changeClassForTables, this);
          break;
        }
      }
    }

    /**
     * Find a table in blocks of section.
     *
     * @param block One sub section block
     * @returns Table if exists
     */;
    _proto.searchTableInBlock = function searchTableInBlock(block) {
      const control = block.content;
      let tableAPI;
      if (block.isA("sap.fe.templates.ObjectPage.controls.SubSectionBlock")) {
        // The table may currently be shown in a full screen dialog, we can then get the reference to the TableAPI
        // control from the custom data of the place holder panel
        if (control.isA("sap.m.Panel") && control.data("FullScreenTablePlaceHolder")) {
          tableAPI = control.data("tableAPIreference");
        } else if (control.isA("sap.fe.macros.table.TableAPI")) {
          tableAPI = control;
        }
        if (tableAPI) {
          return tableAPI.content;
        }
      }
      return undefined;
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      var _this$oView$oViewData;
      PageController.prototype.onBeforeRendering.apply(this);
      // In the retrieveTextFromValueList scenario we need to ensure in case of reload/refresh that the meta model in the methode retrieveTextFromValueList of the FieldRuntime is available
      if ((_this$oView$oViewData = this.oView.oViewData) !== null && _this$oView$oViewData !== void 0 && _this$oView$oViewData.retrieveTextFromValueList && CommonHelper.getMetaModel() === undefined) {
        CommonHelper.setMetaModel(this.getAppComponent().getMetaModel());
      }
    };
    _proto.onAfterRendering = function onAfterRendering() {
      let subSections;
      if (this._getObjectPageLayoutControl().getUseIconTabBar()) {
        const sections = this._getObjectPageLayoutControl().getSections();
        for (const section of sections) {
          subSections = section.getSubSections();
          this.checkSectionsForNonResponsiveTable(subSections);
        }
      } else {
        subSections = this._getAllSubSections();
        this.checkSectionsForNonResponsiveTable(subSections);
      }
    };
    _proto._onBeforeBinding = function _onBeforeBinding(oContext, mParameters) {
      // TODO: we should check how this comes together with the transaction helper, same to the change in the afterBinding
      const aTables = this._findTables(),
        oObjectPage = this._getObjectPageLayoutControl(),
        oInternalModelContext = this.getView().getBindingContext("internal"),
        oInternalModel = this.getView().getModel("internal"),
        aBatchGroups = oInternalModelContext.getProperty("batchGroups"),
        iViewLevel = this.getView().getViewData().viewLevel;
      let oFastCreationRow;
      aBatchGroups.push("$auto");
      if (mParameters.bDraftNavigation !== true) {
        this._closeSideContent();
      }
      const opContext = oObjectPage.getBindingContext();
      if (opContext && opContext.hasPendingChanges() && !aBatchGroups.some(opContext.getModel().hasPendingChanges.bind(opContext.getModel()))) {
        /* 	In case there are pending changes for the creation row and no others we need to reset the changes
        					TODO: this is just a quick solution, this needs to be reworked
        					*/

        opContext.getBinding().resetChanges();
      }

      // For now we have to set the binding context to null for every fast creation row
      // TODO: Get rid of this coding or move it to another layer - to be discussed with MDC and model
      for (let i = 0; i < aTables.length; i++) {
        oFastCreationRow = aTables[i].getCreationRow();
        if (oFastCreationRow) {
          oFastCreationRow.setBindingContext(null);
        }
      }

      // Scroll to present Section so that bindings are enabled during navigation through paginator buttons, as there is no view rerendering/rebind
      const fnScrollToPresentSection = function () {
        if (!oObjectPage.isFirstRendering() && !mParameters.bPersistOPScroll) {
          oObjectPage.setSelectedSection(null);
        }
      };
      oObjectPage.attachEventOnce("modelContextChange", fnScrollToPresentSection);

      // if the structure of the ObjectPageLayout is changed then scroll to present Section
      // FIXME Is this really working as intended ? Initially this was onBeforeRendering, but never triggered onBeforeRendering because it was registered after it
      const oDelegateOnBefore = {
        onAfterRendering: fnScrollToPresentSection
      };
      oObjectPage.addEventDelegate(oDelegateOnBefore, this);
      this.pageReady.attachEventOnce("pageReady", function () {
        oObjectPage.removeEventDelegate(oDelegateOnBefore);
      });

      //Set the Binding for Paginators using ListBinding ID
      if (iViewLevel > 1) {
        let oBinding = mParameters && mParameters.listBinding;
        const oPaginatorCurrentContext = oInternalModel.getProperty("/paginatorCurrentContext");
        if (oPaginatorCurrentContext) {
          const oBindingToUse = oPaginatorCurrentContext.getBinding();
          this.paginator.initialize(oBindingToUse, oPaginatorCurrentContext);
          oInternalModel.setProperty("/paginatorCurrentContext", null);
        } else if (oBinding) {
          if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
            this.paginator.initialize(oBinding, oContext);
          } else {
            // if the binding type is not ODataListBinding because of a deeplink navigation or a refresh of the page
            // we need to create it
            const sBindingPath = oBinding.getPath();
            if (/\([^)]*\)$/.test(sBindingPath)) {
              // The current binding path ends with (xxx), so we create the listBinding by removing (xxx)
              const sListBindingPath = sBindingPath.replace(/\([^)]*\)$/, "");
              oBinding = new ODataListBinding(oBinding.oModel, sListBindingPath);
              const _setListBindingAsync = () => {
                if (oBinding.getContexts().length > 0) {
                  this.paginator.initialize(oBinding, oContext);
                  oBinding.detachEvent("change", _setListBindingAsync);
                }
              };
              oBinding.getContexts(0);
              oBinding.attachEvent("change", _setListBindingAsync);
            } else {
              // The current binding doesn't end with (xxx) --> the last segment is a 1-1 navigation, so we don't display the paginator
              this.paginator.initialize(undefined);
            }
          }
        }
      }
      if (oObjectPage.getEnableLazyLoading()) {
        const aSections = oObjectPage.getSections();
        const bUseIconTabBar = oObjectPage.getUseIconTabBar();
        let iSkip = 2;
        const bIsInEditMode = this.getView().getModel("ui").getProperty("/isEditable");
        const bEditableHeader = this.getView().getViewData().editableHeaderContent;
        for (let iSection = 0; iSection < aSections.length; iSection++) {
          const oSection = aSections[iSection];
          const aSubSections = oSection.getSubSections();
          for (let iSubSection = 0; iSubSection < aSubSections.length; iSubSection++, iSkip--) {
            // In IconTabBar mode keep the second section bound if there is an editable header and we are switching to display mode
            if (iSkip < 1 || bUseIconTabBar && (iSection > 1 || iSection === 1 && !bEditableHeader && !bIsInEditMode)) {
              const oSubSection = aSubSections[iSubSection];
              if (oSubSection.data().isVisibilityDynamic !== "true") {
                oSubSection.setBindingContext(null);
              }
            }
          }
        }
      }
      if (this.placeholder.isPlaceholderEnabled() && mParameters.showPlaceholder) {
        const oView = this.getView();
        const oNavContainer = oView.getParent().oContainer.getParent();
        if (oNavContainer) {
          oNavContainer.showPlaceholder({});
        }
      }
    };
    _proto._getFirstClickableElement = function _getFirstClickableElement(oObjectPage) {
      let oFirstClickableElement;
      const aActions = oObjectPage.getHeaderTitle() && oObjectPage.getHeaderTitle().getActions();
      if (aActions && aActions.length) {
        oFirstClickableElement = aActions.find(function (oAction) {
          // Due to the left alignment of the Draft switch and the collaborative draft avatar controls
          // there is a ToolbarSpacer in the actions aggregation which we need to exclude here!
          // Due to the ACC report, we also need not to check for the InvisibleText elements
          if (oAction.isA("sap.fe.macros.share.ShareAPI")) {
            // since ShareAPI does not have a disable property
            // hence there is no need to check if it is disbaled or not
            return oAction.getVisible();
          } else if (!oAction.isA("sap.ui.core.InvisibleText") && !oAction.isA("sap.m.ToolbarSpacer")) {
            return oAction.getVisible() && oAction.getEnabled();
          }
        });
      }
      return oFirstClickableElement;
    };
    _proto._getFirstEmptyMandatoryFieldFromSubSection = function _getFirstEmptyMandatoryFieldFromSubSection(aSubSections) {
      if (aSubSections) {
        for (let subSection = 0; subSection < aSubSections.length; subSection++) {
          const aBlocks = aSubSections[subSection].getBlocks();
          if (aBlocks) {
            for (let block = 0; block < aBlocks.length; block++) {
              let aFormContainers;
              if (aBlocks[block].isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getFormContainers();
              } else if (aBlocks[block].getContent && aBlocks[block].getContent() && aBlocks[block].getContent().isA("sap.ui.layout.form.Form")) {
                aFormContainers = aBlocks[block].getContent().getFormContainers();
              }
              if (aFormContainers) {
                for (let formContainer = 0; formContainer < aFormContainers.length; formContainer++) {
                  const aFormElements = aFormContainers[formContainer].getFormElements();
                  if (aFormElements) {
                    for (let formElement = 0; formElement < aFormElements.length; formElement++) {
                      const aFields = aFormElements[formElement].getFields();

                      // The first field is not necessarily an InputBase (e.g. could be a Text)
                      // So we need to check whether it has a getRequired method
                      try {
                        if (aFields[0].getRequired && aFields[0].getRequired() && !aFields[0].getValue()) {
                          return aFields[0];
                        }
                      } catch (error) {
                        Log.debug(`Error when searching for mandaotry empty field: ${error}`);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return undefined;
    };
    _proto._updateFocusInEditMode = function _updateFocusInEditMode(aSubSections) {
      const oObjectPage = this._getObjectPageLayoutControl();
      const oMandatoryField = this._getFirstEmptyMandatoryFieldFromSubSection(aSubSections);
      let oFieldToFocus;
      if (oMandatoryField) {
        oFieldToFocus = oMandatoryField.content.getContentEdit()[0];
      } else {
        oFieldToFocus = oObjectPage._getFirstEditableInput() || this._getFirstClickableElement(oObjectPage);
      }
      if (oFieldToFocus) {
        setTimeout(function () {
          // We set the focus in a timeeout, otherwise the focus sometimes goes to the TabBar
          oFieldToFocus.focus();
        }, 0);
      }
    };
    _proto._handleSubSectionEnteredViewPort = function _handleSubSectionEnteredViewPort(oEvent) {
      const oSubSection = oEvent.getParameter("subSection");
      oSubSection.setBindingContext(undefined);
    };
    _proto._onBackNavigationInDraft = function _onBackNavigationInDraft(oContext) {
      this.messageHandler.removeTransitionMessages();
      if (this.getAppComponent().getRouterProxy().checkIfBackHasSameContext()) {
        // Back nav will keep the same context --> no need to display the dialog
        history.back();
      } else {
        draft.processDataLossOrDraftDiscardConfirmation(function () {
          history.back();
        }, Function.prototype, oContext, this, false, draft.NavigationType.BackNavigation);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ;
    _proto._onAfterBinding = function _onAfterBinding(inputBindingContext, mParameters) {
      var _this$getView, _this$getView$getView;
      const viewLevel = (_this$getView = this.getView()) === null || _this$getView === void 0 ? void 0 : (_this$getView$getView = _this$getView.getViewData()) === null || _this$getView$getView === void 0 ? void 0 : _this$getView$getView.viewLevel;
      // we are clearing any previous data from recommendations every time we come to new OP
      // so that cached recommendations are not shown to user
      if (viewLevel && viewLevel === 1) {
        const currentContext = this.getView().getModel("internal").getProperty("/currentCtxt");
        if (currentContext && currentContext.getPath() !== inputBindingContext.getPath()) {
          this.getView().getModel("internal").setProperty("/recommendationsData", {});
        }
      }
      const oObjectPage = this._getObjectPageLayoutControl();
      const aTables = this._findTables();
      this._sideEffects.clearFieldGroupsValidity();

      // TODO: this is only a temp solution as long as the model fix the cache issue and we use this additional
      // binding with ownRequest
      const bindingContext = oObjectPage.getBindingContext();
      let aIBNActions = [];
      oObjectPage.getSections().forEach(function (oSection) {
        oSection.getSubSections().forEach(function (oSubSection) {
          aIBNActions = CommonUtils.getIBNActions(oSubSection, aIBNActions);
        });
      });

      // Assign internal binding contexts to oFormContainer:
      // 1. It is not possible to assign the internal binding context to the XML fragment
      // (FormContainer.fragment.xml) yet - it is used already for the data-structure.
      // 2. Another problem is, that FormContainers assigned to a 'MoreBlock' does not have an
      // internal model context at all.

      aTables.forEach(function (oTable) {
        const oInternalModelContext = oTable.getBindingContext("internal");
        if (oInternalModelContext) {
          oInternalModelContext.setProperty("creationRowFieldValidity", {});
          oInternalModelContext.setProperty("creationRowCustomValidity", {});
          aIBNActions = CommonUtils.getIBNActions(oTable, aIBNActions);

          // temporary workaround for BCP: 2080218004
          // Need to fix with BLI: FIORITECHP1-15274
          // only for edit mode, we clear the table cache
          // Workaround starts here!!
          const oTableRowBinding = oTable.getRowBinding();
          if (oTableRowBinding) {
            if (ModelHelper.isStickySessionSupported(oTableRowBinding.getModel().getMetaModel())) {
              // apply for both edit and display mode in sticky
              oTableRowBinding.removeCachesAndMessages("");
            }
          }
          // Workaround ends here!!

          // Clear the selection in the table and update action enablement accordingly
          // Will to be fixed with BLI: FIORITECHP1-24318
          const oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap")));
          ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, [], "table");
          oTable.clearSelection();
        }
      });
      CommonUtils.getSemanticTargetsFromPageModel(this, "_pageModel");
      //Retrieve Object Page header actions from Object Page title control
      const oObjectPageTitle = oObjectPage.getHeaderTitle();
      let aIBNHeaderActions = [];
      aIBNHeaderActions = CommonUtils.getIBNActions(oObjectPageTitle, aIBNHeaderActions);
      aIBNActions = aIBNActions.concat(aIBNHeaderActions);
      CommonUtils.updateDataFieldForIBNButtonsVisibility(aIBNActions, this.getView());
      let oModel, oFinalUIState;

      // this should not be needed at the all
      /**
       * @param oTable
       */
      const handleTableModifications = oTable => {
        const oBinding = this._getTableBinding(oTable),
          fnHandleTablePatchEvents = function () {
            TableHelper.enableFastCreationRow(oTable.getCreationRow(), oBinding.getPath(), oBinding.getContext(), oModel, oFinalUIState);
          };
        if (!oBinding) {
          Log.error(`Expected binding missing for table: ${oTable.getId()}`);
          return;
        }
        if (oBinding.oContext) {
          fnHandleTablePatchEvents();
        } else {
          const fnHandleChange = function () {
            if (oBinding.oContext) {
              fnHandleTablePatchEvents();
              oBinding.detachChange(fnHandleChange);
            }
          };
          oBinding.attachChange(fnHandleChange);
        }
      };
      if (bindingContext) {
        oModel = bindingContext.getModel();

        // Compute Edit Mode
        oFinalUIState = this.editFlow.computeEditMode(bindingContext);
        if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel())) {
          oFinalUIState.then(() => {
            if (this.getView().getModel("ui").getProperty("/isEditable")) {
              connect(this.getView());
            } else if (isConnected(this.getView())) {
              disconnect(this.getView()); // Cleanup collaboration connection in case we switch to another element (e.g. in FCL)
            }
          }).catch(function (oError) {
            Log.error("Error while waiting for the final UI State", oError);
          });
        }
        // update related apps
        this._updateRelatedApps();

        //Attach the patch sent and patch completed event to the object page binding so that we can react
        const oBinding = bindingContext.getBinding && bindingContext.getBinding() || bindingContext;

        // Attach the event handler only once to the same binding
        if (this.currentBinding !== oBinding) {
          oBinding.attachEvent("patchSent", {}, this.editFlow.handlePatchSent, this);
          this.currentBinding = oBinding;
        }
        aTables.forEach(function (oTable) {
          // access binding only after table is bound
          TableUtils.whenBound(oTable).then(handleTableModifications).catch(function (oError) {
            Log.error("Error while waiting for the table to be bound", oError);
          });
        });

        // should be called only after binding is ready hence calling it in onAfterBinding
        oObjectPage._triggerVisibleSubSectionsEvents();

        //To Compute the Edit Binding of the subObject page using root object page, create a context for draft root and update the edit button in sub OP using the context
        ActionRuntime.updateEditButtonVisibilityAndEnablement(this.getView());
      }
      this.displayCollaborationMessage(mParameters === null || mParameters === void 0 ? void 0 : mParameters.redirectedToNonDraft);
    }

    /**
     * Show a message strip if a redirection to a non-draft element has been done.
     * Remove the message strip in case we navigate to another object page.
     *
     * @param entityName Name of the Entity to be displayed in the message
     * @private
     */;
    _proto.displayCollaborationMessage = function displayCollaborationMessage(entityName) {
      const resourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
      if (this.collaborationMessage) {
        Core.getMessageManager().removeMessages([this.collaborationMessage]);
        delete this.collaborationMessage;
      }
      if (entityName) {
        var _this$getView2, _this$getView2$getBin;
        this.collaborationMessage = new Message({
          message: resourceBundle.getText("REROUTED_NAVIGATION_TO_SAVED_VERSION", [entityName]),
          type: "Information",
          target: (_this$getView2 = this.getView()) === null || _this$getView2 === void 0 ? void 0 : (_this$getView2$getBin = _this$getView2.getBindingContext()) === null || _this$getView2$getBin === void 0 ? void 0 : _this$getView2$getBin.getPath()
        });
        sap.ui.getCore().getMessageManager().addMessages([this.collaborationMessage]);
      }
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      const setFocus = () => {
        // Set the focus to the first action button, or to the first editable input if in editable mode
        const oObjectPage = this._getObjectPageLayoutControl();
        const isInDisplayMode = !this.getView().getModel("ui").getProperty("/isEditable");
        if (isInDisplayMode) {
          const oFirstClickableElement = this._getFirstClickableElement(oObjectPage);
          if (oFirstClickableElement) {
            oFirstClickableElement.focus();
          }
        } else {
          const oSelectedSection = Core.byId(oObjectPage.getSelectedSection());
          if (oSelectedSection) {
            this._updateFocusInEditMode(oSelectedSection.getSubSections());
          }
        }
      };
      const ctxt = this.getView().getBindingContext();
      // setting this model data to be used for recommendations binding
      this.getView().getModel("internal").setProperty("/currentCtxt", ctxt);

      // Apply app state only after the page is ready with the first section selected
      const oView = this.getView();
      const oInternalModelContext = oView.getBindingContext("internal");
      const oBindingContext = oView.getBindingContext();
      //Show popup while navigating back from object page in case of draft
      if (oBindingContext) {
        const bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (!bIsStickyMode) {
          const oAppComponent = CommonUtils.getAppComponent(oView);
          oAppComponent.getShellServices().setBackNavigation(() => this._onBackNavigationInDraft(oBindingContext));
        }
      }
      const viewId = this.getView().getId();
      this.getAppComponent().getAppStateHandler().applyAppState(viewId, this.getView()).then(() => {
        if (mParameters.forceFocus) {
          setFocus();
        }
      }).catch(function (Error) {
        Log.error("Error while setting the focus", Error);
      });
      oInternalModelContext.setProperty("errorNavigationSectionFlag", false);
      this._checkDataPointTitleForExternalNavigation();
    }

    /**
     * Get the status of edit mode for sticky session.
     *
     * @returns The status of edit mode for sticky session
     */;
    _proto.getStickyEditMode = function getStickyEditMode() {
      const oBindingContext = this.getView().getBindingContext && this.getView().getBindingContext();
      let bIsStickyEditMode = false;
      if (oBindingContext) {
        const bIsStickyMode = ModelHelper.isStickySessionSupported(oBindingContext.getModel().getMetaModel());
        if (bIsStickyMode) {
          bIsStickyEditMode = this.getView().getModel("ui").getProperty("/isEditable");
        }
      }
      return bIsStickyEditMode;
    };
    _proto._getObjectPageLayoutControl = function _getObjectPageLayoutControl() {
      return this.byId("fe::ObjectPage");
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      const oObjectPage = this._getObjectPageLayoutControl();
      const oObjectPageSubtitle = oObjectPage.getCustomData().find(function (oCustomData) {
        return oCustomData.getKey() === "ObjectPageSubtitle";
      });
      return {
        title: oObjectPage.data("ObjectPageTitle") || "",
        subtitle: oObjectPageSubtitle && oObjectPageSubtitle.getValue(),
        intent: "",
        icon: ""
      };
    };
    _proto._executeHeaderShortcut = function _executeHeaderShortcut(sId) {
      const sButtonId = `${this.getView().getId()}--${sId}`,
        oButton = this._getObjectPageLayoutControl().getHeaderTitle().getActions().find(function (oElement) {
          return oElement.getId() === sButtonId;
        });
      if (oButton) {
        CommonUtils.fireButtonPress(oButton);
      }
    };
    _proto._executeFooterShortcut = function _executeFooterShortcut(sId) {
      const sButtonId = `${this.getView().getId()}--${sId}`,
        oButton = this._getObjectPageLayoutControl().getFooter().getContent().find(function (oElement) {
          return oElement.getMetadata().getName() === "sap.m.Button" && oElement.getId() === sButtonId;
        });
      CommonUtils.fireButtonPress(oButton);
    };
    _proto._executeTabShortCut = function _executeTabShortCut(oExecution) {
      const oObjectPage = this._getObjectPageLayoutControl(),
        aSections = oObjectPage.getSections(),
        iSectionIndexMax = aSections.length - 1,
        sCommand = oExecution.oSource.getCommand();
      let newSection,
        iSelectedSectionIndex = oObjectPage.indexOfSection(this.byId(oObjectPage.getSelectedSection()));
      if (iSelectedSectionIndex !== -1 && iSectionIndexMax > 0) {
        if (sCommand === "NextTab") {
          if (iSelectedSectionIndex <= iSectionIndexMax - 1) {
            newSection = aSections[++iSelectedSectionIndex];
          }
        } else if (iSelectedSectionIndex !== 0) {
          // PreviousTab
          newSection = aSections[--iSelectedSectionIndex];
        }
        if (newSection) {
          oObjectPage.setSelectedSection(newSection);
          newSection.focus();
        }
      }
    };
    _proto._getFooterVisibility = function _getFooterVisibility() {
      const oInternalModelContext = this.getView().getBindingContext("internal");
      const sViewId = this.getView().getId();
      oInternalModelContext.setProperty("messageFooterContainsErrors", false);
      sap.ui.getCore().getMessageManager().getMessageModel().getData().forEach(function (oMessage) {
        if (oMessage.validation && oMessage.type === "Error" && oMessage.target.indexOf(sViewId) > -1) {
          oInternalModelContext.setProperty("messageFooterContainsErrors", true);
        }
      });
    };
    _proto._showMessagePopover = function _showMessagePopover(err, oRet) {
      if (err) {
        Log.error(err);
      }
      const rootViewController = this.getAppComponent().getRootViewController();
      const currentPageView = rootViewController.isFclEnabled() ? rootViewController.getRightmostView() : this.getAppComponent().getRootContainer().getCurrentPage();
      if (!currentPageView.isA("sap.m.MessagePage")) {
        const oMessageButton = this.messageButton,
          oMessagePopover = oMessageButton.oMessagePopover,
          oItemBinding = oMessagePopover.getBinding("items");
        if (oItemBinding.getLength() > 0 && !oMessagePopover.isOpen()) {
          oMessageButton.setVisible(true);
          // workaround to ensure that oMessageButton is rendered when openBy is called
          setTimeout(function () {
            oMessagePopover.openBy(oMessageButton);
          }, 0);
        }
      }
      return oRet;
    };
    _proto._editDocument = function _editDocument(oContext) {
      const oModel = this.getView().getModel("ui");
      BusyLocker.lock(oModel);
      return this.editFlow.editDocument.apply(this.editFlow, [oContext]).finally(function () {
        BusyLocker.unlock(oModel);
      });
    };
    _proto._validateDocument = async function _validateDocument() {
      const appComponent = this.getAppComponent();
      const control = Core.byId(Core.getCurrentFocusedControlId());
      const context = control === null || control === void 0 ? void 0 : control.getBindingContext();
      if (context && !context.isTransient()) {
        const sideEffectsService = appComponent.getSideEffectsService();
        const entityType = sideEffectsService.getEntityTypeFromContext(context);
        const globalSideEffects = entityType ? sideEffectsService.getGlobalODataEntitySideEffects(entityType) : [];
        // If there is at least one global SideEffects for the related entity, execute it/them
        if (globalSideEffects.length) {
          await this.editFlow.syncTask();
          return Promise.all(globalSideEffects.map(sideEffects => this._sideEffects.requestSideEffects(sideEffects, context)));
        }
        const draftRootContext = await CommonUtils.createRootContext(ProgrammingModel.Draft, this.getView(), appComponent);
        //Execute the draftValidation if there is no globalSideEffects (ignore ETags in collaboration draft)
        if (draftRootContext) {
          await this.editFlow.syncTask();
          return draft.executeDraftValidation(draftRootContext, appComponent, isConnected(this.getView()));
        }
      }
      return undefined;
    };
    _proto._saveDocument = async function _saveDocument(oContext) {
      const oModel = this.getView().getModel("ui"),
        aWaitCreateDocuments = [];
      // indicates if we are creating a new row in the OP
      let bExecuteSideEffectsOnError = false;
      BusyLocker.lock(oModel);
      this._findTables().forEach(oTable => {
        const oBinding = this._getTableBinding(oTable);
        const mParameters = {
          creationMode: oTable.data("creationMode"),
          creationRow: oTable.getCreationRow(),
          createAtEnd: oTable.data("createAtEnd") === "true"
        };
        const bCreateDocument = mParameters.creationRow && mParameters.creationRow.getBindingContext() && Object.keys(mParameters.creationRow.getBindingContext().getObject()).length > 1;
        if (bCreateDocument) {
          // the bSkipSideEffects is a parameter created when we click the save key. If we press this key
          // we don't execute the handleSideEffects funciton to avoid batch redundancy
          mParameters.bSkipSideEffects = true;
          bExecuteSideEffectsOnError = true;
          aWaitCreateDocuments.push(this.editFlow.createDocument(oBinding, mParameters).then(function () {
            return oBinding;
          }));
        }
      });
      try {
        const aBindings = await Promise.all(aWaitCreateDocuments);
        const mParameters = {
          bExecuteSideEffectsOnError: bExecuteSideEffectsOnError,
          bindings: aBindings
        };
        // We need to either reject or resolve a promise here and return it since this save
        // function is not only called when pressing the save button in the footer, but also
        // when the user selects create or save in a dataloss popup.
        // The logic of the dataloss popup needs to detect if the save had errors or not in order
        // to decide if the subsequent action - like a back navigation - has to be executed or not.
        try {
          await this.editFlow.saveDocument(oContext, mParameters);
        } catch (error) {
          // If the saveDocument in editFlow returns errors we need
          // to show the message popover here and ensure that the
          // dataloss logic does not perform the follow up function
          // like e.g. a back navigation hence we return a promise and reject it
          this._showMessagePopover(error);
          throw error;
        }
      } finally {
        if (BusyLocker.isLocked(oModel)) {
          BusyLocker.unlock(oModel);
        }
      }
    };
    _proto._cancelDocument = function _cancelDocument(oContext, mParameters) {
      mParameters.cancelButton = this.getView().byId(mParameters.cancelButton); //to get the reference of the cancel button from command execution
      return this.editFlow.cancelDocument(oContext, mParameters);
    };
    _proto._applyDocument = function _applyDocument(oContext) {
      return this.editFlow.applyDocument(oContext).catch(() => this._showMessagePopover());
    };
    _proto._updateRelatedApps = function _updateRelatedApps() {
      const oObjectPage = this._getObjectPageLayoutControl();
      const showRelatedApps = oObjectPage.data("showRelatedApps");
      if (showRelatedApps === "true" || showRelatedApps === true) {
        const appComponent = CommonUtils.getAppComponent(this.getView());
        CommonUtils.updateRelatedAppsDetails(oObjectPage, appComponent);
      }
    };
    _proto._findControlInSubSection = function _findControlInSubSection(aParentElement, aSubsection, aControls, bIsChart) {
      for (let element = 0; element < aParentElement.length; element++) {
        let oElement = aParentElement[element].getContent instanceof Function && aParentElement[element].getContent();
        if (bIsChart) {
          if (oElement && oElement.mAggregations && oElement.getAggregation("items")) {
            const aItems = oElement.getAggregation("items");
            aItems.forEach(function (oItem) {
              if (oItem.isA("sap.fe.macros.chart.ChartAPI")) {
                oElement = oItem;
              }
            });
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.layout.DynamicSideContent")) {
          oElement = oElement.getMainContent instanceof Function && oElement.getMainContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        // The table may currently be shown in a full screen dialog, we can then get the reference to the TableAPI
        // control from the custom data of the place holder panel
        if (oElement && oElement.isA && oElement.isA("sap.m.Panel") && oElement.data("FullScreenTablePlaceHolder")) {
          oElement = oElement.data("tableAPIreference");
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.table.TableAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Table")) {
          aControls.push(oElement);
        }
        if (oElement && oElement.isA && oElement.isA("sap.fe.macros.chart.ChartAPI")) {
          oElement = oElement.getContent instanceof Function && oElement.getContent();
          if (oElement && oElement.length > 0) {
            oElement = oElement[0];
          }
        }
        if (oElement && oElement.isA && oElement.isA("sap.ui.mdc.Chart")) {
          aControls.push(oElement);
        }
      }
    };
    _proto._getAllSubSections = function _getAllSubSections() {
      const oObjectPage = this._getObjectPageLayoutControl();
      let aSubSections = [];
      oObjectPage.getSections().forEach(function (oSection) {
        aSubSections = aSubSections.concat(oSection.getSubSections());
      });
      return aSubSections;
    };
    _proto._getAllBlocks = function _getAllBlocks() {
      let aBlocks = [];
      this._getAllSubSections().forEach(function (oSubSection) {
        aBlocks = aBlocks.concat(oSubSection.getBlocks());
      });
      return aBlocks;
    };
    _proto._findTables = function _findTables() {
      const aSubSections = this._getAllSubSections();
      const aTables = [];
      for (let subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aTables);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aTables);
      }
      return aTables;
    };
    _proto._findCharts = function _findCharts() {
      const aSubSections = this._getAllSubSections();
      const aCharts = [];
      for (let subSection = 0; subSection < aSubSections.length; subSection++) {
        this._findControlInSubSection(aSubSections[subSection].getBlocks(), aSubSections[subSection], aCharts, true);
        this._findControlInSubSection(aSubSections[subSection].getMoreBlocks(), aSubSections[subSection], aCharts, true);
      }
      return aCharts;
    };
    _proto._closeSideContent = function _closeSideContent() {
      this._getAllBlocks().forEach(function (oBlock) {
        const oContent = oBlock.getContent instanceof Function && oBlock.getContent();
        if (oContent && oContent.isA && oContent.isA("sap.ui.layout.DynamicSideContent")) {
          if (oContent.setShowSideContent instanceof Function) {
            oContent.setShowSideContent(false);
          }
        }
      });
    }

    /**
     * Chart Context is resolved for 1:n microcharts.
     *
     * @param oChartContext The Context of the MicroChart
     * @param sChartPath The collectionPath of the the chart
     * @returns Array of Attributes of the chart Context
     */;
    _proto._getChartContextData = function _getChartContextData(oChartContext, sChartPath) {
      const oContextData = oChartContext.getObject();
      let oChartContextData = [oContextData];
      if (oChartContext && sChartPath) {
        if (oContextData[sChartPath]) {
          oChartContextData = oContextData[sChartPath];
          delete oContextData[sChartPath];
          oChartContextData.push(oContextData);
        }
      }
      return oChartContextData;
    }

    /**
     * Scroll the tables to the row with the sPath
     *
     * @function
     * @name sap.fe.templates.ObjectPage.ObjectPageController.controller#_scrollTablesToRow
     * @param {string} sRowPath 'sPath of the table row'
     */;
    _proto._scrollTablesToRow = function _scrollTablesToRow(sRowPath) {
      if (this._findTables && this._findTables().length > 0) {
        const aTables = this._findTables();
        for (let i = 0; i < aTables.length; i++) {
          TableScroller.scrollTableToRow(aTables[i], sRowPath);
        }
      }
    }

    /**
     * Method to merge selected contexts and filters.
     *
     * @function
     * @name _mergeMultipleContexts
     * @param oPageContext Page context
     * @param aLineContext Selected Contexts
     * @param sChartPath Collection name of the chart
     * @returns Selection Variant Object
     */;
    _proto._mergeMultipleContexts = function _mergeMultipleContexts(oPageContext, aLineContext, sChartPath) {
      let aAttributes = [],
        aPageAttributes = [],
        oContext,
        sMetaPathLine,
        sPathLine;
      const sPagePath = oPageContext.getPath();
      const oMetaModel = oPageContext && oPageContext.getModel() && oPageContext.getModel().getMetaModel();
      const sMetaPathPage = oMetaModel && oMetaModel.getMetaPath(sPagePath).replace(/^\/*/, "");

      // Get single line context if necessary
      if (aLineContext && aLineContext.length) {
        oContext = aLineContext[0];
        sPathLine = oContext.getPath();
        sMetaPathLine = oMetaModel && oMetaModel.getMetaPath(sPathLine).replace(/^\/*/, "");
        aLineContext.forEach(oSingleContext => {
          if (sChartPath) {
            const oChartContextData = this._getChartContextData(oSingleContext, sChartPath);
            if (oChartContextData) {
              aAttributes = oChartContextData.map(function (oSubChartContextData) {
                return {
                  contextData: oSubChartContextData,
                  entitySet: `${sMetaPathPage}/${sChartPath}`
                };
              });
            }
          } else {
            aAttributes.push({
              contextData: oSingleContext.getObject(),
              entitySet: sMetaPathLine
            });
          }
        });
      }
      aPageAttributes.push({
        contextData: oPageContext.getObject(),
        entitySet: sMetaPathPage
      });
      // Adding Page Context to selection variant
      aPageAttributes = this._intentBasedNavigation.removeSensitiveData(aPageAttributes, sMetaPathPage);
      const oPageLevelSV = CommonUtils.addPageContextToSelectionVariant(new SelectionVariant(), aPageAttributes, this.getView());
      aAttributes = this._intentBasedNavigation.removeSensitiveData(aAttributes, sMetaPathPage);
      return {
        selectionVariant: oPageLevelSV,
        attributes: aAttributes
      };
    };
    _proto._getBatchGroupsForView = function _getBatchGroupsForView() {
      const oViewData = this.getView().getViewData(),
        oConfigurations = oViewData.controlConfiguration,
        aConfigurations = oConfigurations && Object.keys(oConfigurations),
        aBatchGroups = ["$auto.Heroes", "$auto.Decoration", "$auto.Workers"];
      if (aConfigurations && aConfigurations.length > 0) {
        aConfigurations.forEach(function (sKey) {
          const oConfiguration = oConfigurations[sKey];
          if (oConfiguration.requestGroupId === "LongRunners") {
            aBatchGroups.push("$auto.LongRunners");
          }
        });
      }
      return aBatchGroups;
    }

    /*
     * Reset Breadcrumb links
     *
     * @function
     * @param {sap.m.Breadcrumbs} [oSource] parent control
     * @description Used when context of the object page changes.
     *              This event callback is attached to modelContextChange
     *              event of the Breadcrumb control to catch context change.
     *              Then element binding and hrefs are updated for each link.
     *
     * @ui5-restricted
     * @experimental
     */;
    _proto._setBreadcrumbLinks = async function _setBreadcrumbLinks(oSource) {
      const oContext = oSource.getBindingContext(),
        oAppComponent = this.getAppComponent(),
        aPromises = [],
        aSkipParameterized = [],
        sNewPath = oContext === null || oContext === void 0 ? void 0 : oContext.getPath(),
        aPathParts = (sNewPath === null || sNewPath === void 0 ? void 0 : sNewPath.split("/")) ?? [],
        oMetaModel = oAppComponent && oAppComponent.getMetaModel();
      let sPath = "";
      try {
        aPathParts.shift();
        aPathParts.splice(-1, 1);
        aPathParts.forEach(function (sPathPart) {
          sPath += `/${sPathPart}`;
          const oRootViewController = oAppComponent.getRootViewController();
          const sParameterPath = oMetaModel.getMetaPath(sPath);
          const bResultContext = oMetaModel.getObject(`${sParameterPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
          if (bResultContext) {
            // We dont need to create a breadcrumb for Parameter path
            aSkipParameterized.push(1);
            return;
          } else {
            aSkipParameterized.push(0);
          }
          aPromises.push(oRootViewController.getTitleInfoFromPath(sPath));
        });
        const titleHierarchyInfos = await Promise.all(aPromises);
        let idx, hierarchyPosition, oLink;
        for (const titleHierarchyInfo of titleHierarchyInfos) {
          hierarchyPosition = titleHierarchyInfos.indexOf(titleHierarchyInfo);
          idx = hierarchyPosition - aSkipParameterized[hierarchyPosition];
          oLink = oSource.getLinks()[idx] ? oSource.getLinks()[idx] : new Link();
          //sCurrentEntity is a fallback value in case of empty title
          oLink.setText(titleHierarchyInfo.subtitle || titleHierarchyInfo.title);
          //We apply an additional encodeURI in case of special characters (ie "/") used in the url through the semantic keys
          oLink.setHref(encodeURI(titleHierarchyInfo.intent));
          if (!oSource.getLinks()[idx]) {
            oSource.addLink(oLink);
          }
        }
      } catch (error) {
        Log.error("Error while setting the breadcrumb links:" + error);
      }
    };
    _proto._checkDataPointTitleForExternalNavigation = function _checkDataPointTitleForExternalNavigation() {
      const oView = this.getView();
      const oInternalModelContext = oView.getBindingContext("internal");
      const oDataPoints = CommonUtils.getHeaderFacetItemConfigForExternalNavigation(oView.getViewData(), this.getAppComponent().getRoutingService().getOutbounds());
      const oShellServices = this.getAppComponent().getShellServices();
      const oPageContext = oView && oView.getBindingContext();
      oInternalModelContext.setProperty("isHeaderDPLinkVisible", {});
      if (oPageContext) {
        oPageContext.requestObject().then(function (oData) {
          fnGetLinks(oDataPoints, oData);
        }).catch(function (oError) {
          Log.error("Cannot retrieve the links from the shell service", oError);
        });
      }

      /**
       * @param oError
       */
      function fnOnError(oError) {
        Log.error(oError);
      }
      function fnSetLinkEnablement(id, aSupportedLinks) {
        const sLinkId = id;
        // process viable links from getLinks for all datapoints having outbound
        if (aSupportedLinks && aSupportedLinks.length === 1 && aSupportedLinks[0].supported) {
          oInternalModelContext.setProperty(`isHeaderDPLinkVisible/${sLinkId}`, true);
        }
      }

      /**
       * @param oSubDataPoints
       * @param oPageData
       */
      function fnGetLinks(oSubDataPoints, oPageData) {
        for (const sId in oSubDataPoints) {
          const oDataPoint = oSubDataPoints[sId];
          const oParams = {};
          const oLink = oView.byId(sId);
          if (!oLink) {
            // for data points configured in app descriptor but not annotated in the header
            continue;
          }
          const oLinkContext = oLink.getBindingContext();
          const oLinkData = oLinkContext && oLinkContext.getObject();
          let oMixedContext = merge({}, oPageData, oLinkData);
          // process semantic object mappings
          if (oDataPoint.semanticObjectMapping) {
            const aSemanticObjectMapping = oDataPoint.semanticObjectMapping;
            for (const item in aSemanticObjectMapping) {
              const oMapping = aSemanticObjectMapping[item];
              const sMainProperty = oMapping["LocalProperty"]["$PropertyPath"];
              const sMappedProperty = oMapping["SemanticObjectProperty"];
              if (sMainProperty !== sMappedProperty) {
                if (oMixedContext.hasOwnProperty(sMainProperty)) {
                  const oNewMapping = {};
                  oNewMapping[sMappedProperty] = oMixedContext[sMainProperty];
                  oMixedContext = merge({}, oMixedContext, oNewMapping);
                  delete oMixedContext[sMainProperty];
                }
              }
            }
          }
          if (oMixedContext) {
            for (const sKey in oMixedContext) {
              if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
                oParams[sKey] = oMixedContext[sKey];
              }
            }
          }
          // validate if a link must be rendered
          oShellServices.isNavigationSupported([{
            target: {
              semanticObject: oDataPoint.semanticObject,
              action: oDataPoint.action
            },
            params: oParams
          }]).then(aLinks => {
            return fnSetLinkEnablement(sId, aLinks);
          }).catch(fnOnError);
        }
      }
    };
    return ObjectPageController;
  }(PageController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "paginator", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "pageReady", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype)), _class2)) || _class);
  return ObjectPageController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQcm9ncmFtbWluZ01vZGVsIiwiRkVMaWJyYXJ5IiwiT2JqZWN0UGFnZUNvbnRyb2xsZXIiLCJkZWZpbmVVSTVDbGFzcyIsInVzaW5nRXh0ZW5zaW9uIiwiUGxhY2Vob2xkZXIiLCJTaGFyZSIsIm92ZXJyaWRlIiwiU2hhcmVPdmVycmlkZXMiLCJJbnRlcm5hbFJvdXRpbmciLCJJbnRlcm5hbFJvdXRpbmdPdmVycmlkZSIsIlBhZ2luYXRvciIsIlBhZ2luYXRvck92ZXJyaWRlIiwiTWVzc2FnZUhhbmRsZXIiLCJNZXNzYWdlSGFuZGxlck92ZXJyaWRlIiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uT3ZlcnJpZGUiLCJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldE5hdmlnYXRpb25Nb2RlIiwiYklzU3RpY2t5RWRpdE1vZGUiLCJnZXRWaWV3IiwiZ2V0Q29udHJvbGxlciIsImdldFN0aWNreUVkaXRNb2RlIiwidW5kZWZpbmVkIiwiVmlld1N0YXRlIiwiVmlld1N0YXRlT3ZlcnJpZGVzIiwiUGFnZVJlYWR5IiwiaXNDb250ZXh0RXhwZWN0ZWQiLCJNYXNzRWRpdCIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJoYW5kbGVycyIsIm9uUHJpbWFyeUFjdGlvbiIsIm9Db250cm9sbGVyIiwib1ZpZXciLCJvQ29udGV4dCIsInNBY3Rpb25OYW1lIiwibVBhcmFtZXRlcnMiLCJtQ29uZGl0aW9ucyIsImlWaWV3TGV2ZWwiLCJnZXRWaWV3RGF0YSIsInZpZXdMZXZlbCIsInBvc2l0aXZlQWN0aW9uVmlzaWJsZSIsInBvc2l0aXZlQWN0aW9uRW5hYmxlZCIsIm9uQ2FsbEFjdGlvbiIsImVkaXRBY3Rpb25WaXNpYmxlIiwiZWRpdEFjdGlvbkVuYWJsZWQiLCJfZWRpdERvY3VtZW50IiwiZ2V0TW9kZWwiLCJnZXRQcm9wZXJ0eSIsIl9zYXZlRG9jdW1lbnQiLCJfYXBwbHlEb2N1bWVudCIsIm9uVGFibGVDb250ZXh0Q2hhbmdlIiwiZXZlbnQiLCJ0YWJsZUFQSSIsImdldFNvdXJjZSIsInRhYmxlIiwiY29udGVudCIsImN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiZWRpdEZsb3ciLCJnZXRDdXJyZW50QWN0aW9uUHJvbWlzZSIsInRhYmxlQ29udGV4dHMiLCJfZ2V0VGFibGVCaW5kaW5nIiwiZ2V0Q3VycmVudENvbnRleHRzIiwibGVuZ3RoIiwiYWN0aW9uUmVzcG9uc2UiLCJjb250cm9sSWQiLCJnZXRJZCIsImFjdGlvbkRhdGEiLCJvRGF0YSIsImtleXMiLCJuZXdJdGVtIiwiZmluZEluZGV4IiwidGFibGVDb250ZXh0IiwidGFibGVEYXRhIiwiZ2V0T2JqZWN0IiwiZXZlcnkiLCJrZXkiLCJkaWFsb2ciLCJJbnN0YW5jZU1hbmFnZXIiLCJnZXRPcGVuRGlhbG9ncyIsImZpbmQiLCJkYXRhIiwiYXR0YWNoRXZlbnRPbmNlIiwiZm9jdXNSb3ciLCJkZWxldGVDdXJyZW50QWN0aW9uUHJvbWlzZSIsImUiLCJMb2ciLCJlcnJvciIsIm1lc3NhZ2VCdXR0b24iLCJmaXJlTW9kZWxDb250ZXh0Q2hhbmdlIiwiaW52b2tlQWN0aW9uIiwidGhlbiIsIl9zaG93TWVzc2FnZVBvcG92ZXIiLCJiaW5kIiwiY2F0Y2giLCJvbkRhdGFQb2ludFRpdGxlUHJlc3NlZCIsIm9Tb3VyY2UiLCJvTWFuaWZlc3RPdXRib3VuZCIsInNDb250cm9sQ29uZmlnIiwic0NvbGxlY3Rpb25QYXRoIiwiSlNPTiIsInBhcnNlIiwib1RhcmdldEluZm8iLCJhU2VtYW50aWNPYmplY3RNYXBwaW5nIiwiQ29tbW9uVXRpbHMiLCJnZXRTZW1hbnRpY09iamVjdE1hcHBpbmciLCJvRGF0YVBvaW50T3JDaGFydEJpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJzTWV0YVBhdGgiLCJnZXRNZXRhTW9kZWwiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJhTmF2aWdhdGlvbkRhdGEiLCJfZ2V0Q2hhcnRDb250ZXh0RGF0YSIsImFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycyIsIm1hcCIsIm9OYXZpZ2F0aW9uRGF0YSIsIm1ldGFQYXRoIiwicGFyYW1ldGVycyIsIm9QYXJhbXMiLCJfaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiZ2V0T3V0Ym91bmRQYXJhbXMiLCJPYmplY3QiLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsIm5hdmlnYXRlIiwibmF2aWdhdGlvbkNvbnRleHRzIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwib25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kIiwic091dGJvdW5kVGFyZ2V0Iiwic0NyZWF0ZVBhdGgiLCJvbk5hdmlnYXRlQ2hhbmdlIiwib0V2ZW50IiwiZ2V0RXh0ZW5zaW9uQVBJIiwidXBkYXRlQXBwU3RhdGUiLCJiU2VjdGlvbk5hdmlnYXRlZCIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsInNlY3Rpb25MYXlvdXQiLCJvU3ViU2VjdGlvbiIsImdldFBhcmFtZXRlciIsIl91cGRhdGVGb2N1c0luRWRpdE1vZGUiLCJvblZhcmlhbnRTZWxlY3RlZCIsIm9uVmFyaWFudFNhdmVkIiwic2V0VGltZW91dCIsIm5hdmlnYXRlVG9TdWJTZWN0aW9uIiwidkRldGFpbENvbmZpZyIsIm9EZXRhaWxDb25maWciLCJvT2JqZWN0UGFnZSIsImJ5SWQiLCJvU2VjdGlvbiIsInNlY3Rpb25JZCIsInN1YlNlY3Rpb25JZCIsImdldFN1YlNlY3Rpb25zIiwiZ2V0UGFyZW50IiwiZ2V0VmlzaWJsZSIsInNUaXRsZSIsImdldFJlc291cmNlTW9kZWwiLCJnZXRUZXh0IiwiZW50aXR5U2V0IiwiTWVzc2FnZUJveCIsInNjcm9sbFRvU2VjdGlvbiIsImZpcmVOYXZpZ2F0ZSIsInNlY3Rpb24iLCJzdWJTZWN0aW9uIiwib25TdGF0ZUNoYW5nZSIsImNsb3NlT1BNZXNzYWdlU3RyaXAiLCJoaWRlTWVzc2FnZSIsInNJZCIsIm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcyIsIkV4dGVuc2lvbkFQSSIsImV4dGVuc2lvbkFQSSIsIm9uSW5pdCIsIl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCIsInNldFByb3BlcnR5IiwicGFnZSIsInZpc2liaWxpdHkiLCJpdGVtcyIsIl9nZXRCYXRjaEdyb3Vwc0ZvclZpZXciLCJnZXRFbmFibGVMYXp5TG9hZGluZyIsImF0dGFjaEV2ZW50IiwiX2hhbmRsZVN1YlNlY3Rpb25FbnRlcmVkVmlld1BvcnQiLCJvSXRlbUJpbmRpbmciLCJhdHRhY2hDaGFuZ2UiLCJfZm5TaG93T1BNZXNzYWdlIiwib25FeGl0IiwiZGVzdHJveSIsIm9NZXNzYWdlUG9wb3ZlciIsImlzT3BlbiIsImNsb3NlIiwiaXNLZWVwQWxpdmUiLCJzZXRLZWVwQWxpdmUiLCJpc0Nvbm5lY3RlZCIsImRpc2Nvbm5lY3QiLCJ2aWV3IiwibWVzc2FnZXMiLCJnZXRJdGVtcyIsIml0ZW0iLCJmaWx0ZXIiLCJtZXNzYWdlIiwiZ2V0VGFyZ2V0cyIsInNob3dNZXNzYWdlcyIsIm9UYWJsZSIsImdldFJvd0JpbmRpbmciLCJjaGVja1NlY3Rpb25zRm9yTm9uUmVzcG9uc2l2ZVRhYmxlIiwic3ViU2VjdGlvbnMiLCJjaGFuZ2VDbGFzc0ZvclRhYmxlcyIsImxhc3RWaXNpYmxlU3ViU2VjdGlvbiIsImJsb2NrcyIsImdldEJsb2NrcyIsImdldE1vcmVCbG9ja3MiLCJ0YWJsZVR5cGUiLCJzZWFyY2hUYWJsZUluQmxvY2siLCJnZXRUeXBlIiwiaXNBIiwiYWRkU3R5bGVDbGFzcyIsImRldGFjaEV2ZW50Iiwic3ViU2VjdGlvbkluZGV4IiwiYmxvY2siLCJjb250cm9sIiwib25CZWZvcmVSZW5kZXJpbmciLCJQYWdlQ29udHJvbGxlciIsInByb3RvdHlwZSIsImFwcGx5Iiwib1ZpZXdEYXRhIiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsIkNvbW1vbkhlbHBlciIsInNldE1ldGFNb2RlbCIsImdldEFwcENvbXBvbmVudCIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJnZXRVc2VJY29uVGFiQmFyIiwic2VjdGlvbnMiLCJnZXRTZWN0aW9ucyIsIl9nZXRBbGxTdWJTZWN0aW9ucyIsIl9vbkJlZm9yZUJpbmRpbmciLCJhVGFibGVzIiwiX2ZpbmRUYWJsZXMiLCJvSW50ZXJuYWxNb2RlbCIsImFCYXRjaEdyb3VwcyIsIm9GYXN0Q3JlYXRpb25Sb3ciLCJwdXNoIiwiYkRyYWZ0TmF2aWdhdGlvbiIsIl9jbG9zZVNpZGVDb250ZW50Iiwib3BDb250ZXh0IiwiaGFzUGVuZGluZ0NoYW5nZXMiLCJzb21lIiwiZ2V0QmluZGluZyIsInJlc2V0Q2hhbmdlcyIsImkiLCJnZXRDcmVhdGlvblJvdyIsInNldEJpbmRpbmdDb250ZXh0IiwiZm5TY3JvbGxUb1ByZXNlbnRTZWN0aW9uIiwiaXNGaXJzdFJlbmRlcmluZyIsImJQZXJzaXN0T1BTY3JvbGwiLCJzZXRTZWxlY3RlZFNlY3Rpb24iLCJvRGVsZWdhdGVPbkJlZm9yZSIsImFkZEV2ZW50RGVsZWdhdGUiLCJwYWdlUmVhZHkiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwib0JpbmRpbmciLCJsaXN0QmluZGluZyIsIm9QYWdpbmF0b3JDdXJyZW50Q29udGV4dCIsIm9CaW5kaW5nVG9Vc2UiLCJwYWdpbmF0b3IiLCJpbml0aWFsaXplIiwic0JpbmRpbmdQYXRoIiwidGVzdCIsInNMaXN0QmluZGluZ1BhdGgiLCJyZXBsYWNlIiwiT0RhdGFMaXN0QmluZGluZyIsIm9Nb2RlbCIsIl9zZXRMaXN0QmluZGluZ0FzeW5jIiwiZ2V0Q29udGV4dHMiLCJhU2VjdGlvbnMiLCJiVXNlSWNvblRhYkJhciIsImlTa2lwIiwiYklzSW5FZGl0TW9kZSIsImJFZGl0YWJsZUhlYWRlciIsImVkaXRhYmxlSGVhZGVyQ29udGVudCIsImlTZWN0aW9uIiwiYVN1YlNlY3Rpb25zIiwiaVN1YlNlY3Rpb24iLCJpc1Zpc2liaWxpdHlEeW5hbWljIiwicGxhY2Vob2xkZXIiLCJpc1BsYWNlaG9sZGVyRW5hYmxlZCIsInNob3dQbGFjZWhvbGRlciIsIm9OYXZDb250YWluZXIiLCJvQ29udGFpbmVyIiwiX2dldEZpcnN0Q2xpY2thYmxlRWxlbWVudCIsIm9GaXJzdENsaWNrYWJsZUVsZW1lbnQiLCJhQWN0aW9ucyIsImdldEhlYWRlclRpdGxlIiwiZ2V0QWN0aW9ucyIsIm9BY3Rpb24iLCJnZXRFbmFibGVkIiwiX2dldEZpcnN0RW1wdHlNYW5kYXRvcnlGaWVsZEZyb21TdWJTZWN0aW9uIiwiYUJsb2NrcyIsImFGb3JtQ29udGFpbmVycyIsImdldEZvcm1Db250YWluZXJzIiwiZ2V0Q29udGVudCIsImZvcm1Db250YWluZXIiLCJhRm9ybUVsZW1lbnRzIiwiZ2V0Rm9ybUVsZW1lbnRzIiwiZm9ybUVsZW1lbnQiLCJhRmllbGRzIiwiZ2V0RmllbGRzIiwiZ2V0UmVxdWlyZWQiLCJnZXRWYWx1ZSIsImRlYnVnIiwib01hbmRhdG9yeUZpZWxkIiwib0ZpZWxkVG9Gb2N1cyIsImdldENvbnRlbnRFZGl0IiwiX2dldEZpcnN0RWRpdGFibGVJbnB1dCIsImZvY3VzIiwiX29uQmFja05hdmlnYXRpb25JbkRyYWZ0IiwibWVzc2FnZUhhbmRsZXIiLCJyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMiLCJnZXRSb3V0ZXJQcm94eSIsImNoZWNrSWZCYWNrSGFzU2FtZUNvbnRleHQiLCJoaXN0b3J5IiwiYmFjayIsImRyYWZ0IiwicHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24iLCJGdW5jdGlvbiIsIk5hdmlnYXRpb25UeXBlIiwiQmFja05hdmlnYXRpb24iLCJfb25BZnRlckJpbmRpbmciLCJpbnB1dEJpbmRpbmdDb250ZXh0IiwiY3VycmVudENvbnRleHQiLCJfc2lkZUVmZmVjdHMiLCJjbGVhckZpZWxkR3JvdXBzVmFsaWRpdHkiLCJiaW5kaW5nQ29udGV4dCIsImFJQk5BY3Rpb25zIiwiZm9yRWFjaCIsImdldElCTkFjdGlvbnMiLCJvVGFibGVSb3dCaW5kaW5nIiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJyZW1vdmVDYWNoZXNBbmRNZXNzYWdlcyIsIm9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAiLCJwYXJzZUN1c3RvbURhdGEiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRDdXN0b21EYXRhIiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnQiLCJjbGVhclNlbGVjdGlvbiIsImdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWwiLCJvT2JqZWN0UGFnZVRpdGxlIiwiYUlCTkhlYWRlckFjdGlvbnMiLCJjb25jYXQiLCJ1cGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSIsIm9GaW5hbFVJU3RhdGUiLCJoYW5kbGVUYWJsZU1vZGlmaWNhdGlvbnMiLCJmbkhhbmRsZVRhYmxlUGF0Y2hFdmVudHMiLCJUYWJsZUhlbHBlciIsImVuYWJsZUZhc3RDcmVhdGlvblJvdyIsImdldENvbnRleHQiLCJmbkhhbmRsZUNoYW5nZSIsImRldGFjaENoYW5nZSIsImNvbXB1dGVFZGl0TW9kZSIsImlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwiY29ubmVjdCIsIm9FcnJvciIsIl91cGRhdGVSZWxhdGVkQXBwcyIsImN1cnJlbnRCaW5kaW5nIiwiaGFuZGxlUGF0Y2hTZW50IiwiVGFibGVVdGlscyIsIndoZW5Cb3VuZCIsIl90cmlnZ2VyVmlzaWJsZVN1YlNlY3Rpb25zRXZlbnRzIiwidXBkYXRlRWRpdEJ1dHRvblZpc2liaWxpdHlBbmRFbmFibGVtZW50IiwiZGlzcGxheUNvbGxhYm9yYXRpb25NZXNzYWdlIiwicmVkaXJlY3RlZFRvTm9uRHJhZnQiLCJlbnRpdHlOYW1lIiwicmVzb3VyY2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiY29sbGFib3JhdGlvbk1lc3NhZ2UiLCJnZXRNZXNzYWdlTWFuYWdlciIsInJlbW92ZU1lc3NhZ2VzIiwiTWVzc2FnZSIsInR5cGUiLCJ0YXJnZXQiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJhZGRNZXNzYWdlcyIsIm9uUGFnZVJlYWR5Iiwic2V0Rm9jdXMiLCJpc0luRGlzcGxheU1vZGUiLCJvU2VsZWN0ZWRTZWN0aW9uIiwiZ2V0U2VsZWN0ZWRTZWN0aW9uIiwiY3R4dCIsIm9CaW5kaW5nQ29udGV4dCIsImJJc1N0aWNreU1vZGUiLCJvQXBwQ29tcG9uZW50IiwiZ2V0U2hlbGxTZXJ2aWNlcyIsInNldEJhY2tOYXZpZ2F0aW9uIiwidmlld0lkIiwiZ2V0QXBwU3RhdGVIYW5kbGVyIiwiYXBwbHlBcHBTdGF0ZSIsImZvcmNlRm9jdXMiLCJFcnJvciIsIl9jaGVja0RhdGFQb2ludFRpdGxlRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uIiwiX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uIiwib09iamVjdFBhZ2VTdWJ0aXRsZSIsIm9DdXN0b21EYXRhIiwiZ2V0S2V5IiwidGl0bGUiLCJzdWJ0aXRsZSIsImludGVudCIsImljb24iLCJfZXhlY3V0ZUhlYWRlclNob3J0Y3V0Iiwic0J1dHRvbklkIiwib0J1dHRvbiIsIm9FbGVtZW50IiwiZmlyZUJ1dHRvblByZXNzIiwiX2V4ZWN1dGVGb290ZXJTaG9ydGN1dCIsImdldEZvb3RlciIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsIl9leGVjdXRlVGFiU2hvcnRDdXQiLCJvRXhlY3V0aW9uIiwiaVNlY3Rpb25JbmRleE1heCIsInNDb21tYW5kIiwiZ2V0Q29tbWFuZCIsIm5ld1NlY3Rpb24iLCJpU2VsZWN0ZWRTZWN0aW9uSW5kZXgiLCJpbmRleE9mU2VjdGlvbiIsIl9nZXRGb290ZXJWaXNpYmlsaXR5Iiwic1ZpZXdJZCIsImdldE1lc3NhZ2VNb2RlbCIsImdldERhdGEiLCJvTWVzc2FnZSIsInZhbGlkYXRpb24iLCJpbmRleE9mIiwiZXJyIiwib1JldCIsInJvb3RWaWV3Q29udHJvbGxlciIsImdldFJvb3RWaWV3Q29udHJvbGxlciIsImN1cnJlbnRQYWdlVmlldyIsImlzRmNsRW5hYmxlZCIsImdldFJpZ2h0bW9zdFZpZXciLCJnZXRSb290Q29udGFpbmVyIiwiZ2V0Q3VycmVudFBhZ2UiLCJvTWVzc2FnZUJ1dHRvbiIsImdldExlbmd0aCIsInNldFZpc2libGUiLCJvcGVuQnkiLCJCdXN5TG9ja2VyIiwibG9jayIsImVkaXREb2N1bWVudCIsImZpbmFsbHkiLCJ1bmxvY2siLCJfdmFsaWRhdGVEb2N1bWVudCIsImFwcENvbXBvbmVudCIsImdldEN1cnJlbnRGb2N1c2VkQ29udHJvbElkIiwiY29udGV4dCIsImlzVHJhbnNpZW50Iiwic2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZW50aXR5VHlwZSIsImdldEVudGl0eVR5cGVGcm9tQ29udGV4dCIsImdsb2JhbFNpZGVFZmZlY3RzIiwiZ2V0R2xvYmFsT0RhdGFFbnRpdHlTaWRlRWZmZWN0cyIsInN5bmNUYXNrIiwiUHJvbWlzZSIsImFsbCIsInNpZGVFZmZlY3RzIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwiZHJhZnRSb290Q29udGV4dCIsImNyZWF0ZVJvb3RDb250ZXh0IiwiRHJhZnQiLCJleGVjdXRlRHJhZnRWYWxpZGF0aW9uIiwiYVdhaXRDcmVhdGVEb2N1bWVudHMiLCJiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciIsImNyZWF0aW9uTW9kZSIsImNyZWF0aW9uUm93IiwiY3JlYXRlQXRFbmQiLCJiQ3JlYXRlRG9jdW1lbnQiLCJiU2tpcFNpZGVFZmZlY3RzIiwiY3JlYXRlRG9jdW1lbnQiLCJhQmluZGluZ3MiLCJiaW5kaW5ncyIsInNhdmVEb2N1bWVudCIsImlzTG9ja2VkIiwiX2NhbmNlbERvY3VtZW50IiwiY2FuY2VsQnV0dG9uIiwiY2FuY2VsRG9jdW1lbnQiLCJhcHBseURvY3VtZW50Iiwic2hvd1JlbGF0ZWRBcHBzIiwidXBkYXRlUmVsYXRlZEFwcHNEZXRhaWxzIiwiX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uIiwiYVBhcmVudEVsZW1lbnQiLCJhU3Vic2VjdGlvbiIsImFDb250cm9scyIsImJJc0NoYXJ0IiwiZWxlbWVudCIsIm1BZ2dyZWdhdGlvbnMiLCJnZXRBZ2dyZWdhdGlvbiIsImFJdGVtcyIsIm9JdGVtIiwiZ2V0TWFpbkNvbnRlbnQiLCJfZ2V0QWxsQmxvY2tzIiwiX2ZpbmRDaGFydHMiLCJhQ2hhcnRzIiwib0Jsb2NrIiwib0NvbnRlbnQiLCJzZXRTaG93U2lkZUNvbnRlbnQiLCJvQ2hhcnRDb250ZXh0Iiwic0NoYXJ0UGF0aCIsIm9Db250ZXh0RGF0YSIsIm9DaGFydENvbnRleHREYXRhIiwiX3Njcm9sbFRhYmxlc1RvUm93Iiwic1Jvd1BhdGgiLCJUYWJsZVNjcm9sbGVyIiwic2Nyb2xsVGFibGVUb1JvdyIsIl9tZXJnZU11bHRpcGxlQ29udGV4dHMiLCJvUGFnZUNvbnRleHQiLCJhTGluZUNvbnRleHQiLCJhQXR0cmlidXRlcyIsImFQYWdlQXR0cmlidXRlcyIsInNNZXRhUGF0aExpbmUiLCJzUGF0aExpbmUiLCJzUGFnZVBhdGgiLCJvTWV0YU1vZGVsIiwic01ldGFQYXRoUGFnZSIsIm9TaW5nbGVDb250ZXh0Iiwib1N1YkNoYXJ0Q29udGV4dERhdGEiLCJjb250ZXh0RGF0YSIsInJlbW92ZVNlbnNpdGl2ZURhdGEiLCJvUGFnZUxldmVsU1YiLCJhZGRQYWdlQ29udGV4dFRvU2VsZWN0aW9uVmFyaWFudCIsIlNlbGVjdGlvblZhcmlhbnQiLCJzZWxlY3Rpb25WYXJpYW50IiwiYXR0cmlidXRlcyIsIm9Db25maWd1cmF0aW9ucyIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwiYUNvbmZpZ3VyYXRpb25zIiwic0tleSIsIm9Db25maWd1cmF0aW9uIiwicmVxdWVzdEdyb3VwSWQiLCJfc2V0QnJlYWRjcnVtYkxpbmtzIiwiYVByb21pc2VzIiwiYVNraXBQYXJhbWV0ZXJpemVkIiwic05ld1BhdGgiLCJhUGF0aFBhcnRzIiwic3BsaXQiLCJzUGF0aCIsInNoaWZ0Iiwic3BsaWNlIiwic1BhdGhQYXJ0Iiwib1Jvb3RWaWV3Q29udHJvbGxlciIsInNQYXJhbWV0ZXJQYXRoIiwiYlJlc3VsdENvbnRleHQiLCJnZXRUaXRsZUluZm9Gcm9tUGF0aCIsInRpdGxlSGllcmFyY2h5SW5mb3MiLCJpZHgiLCJoaWVyYXJjaHlQb3NpdGlvbiIsIm9MaW5rIiwidGl0bGVIaWVyYXJjaHlJbmZvIiwiZ2V0TGlua3MiLCJMaW5rIiwic2V0VGV4dCIsInNldEhyZWYiLCJlbmNvZGVVUkkiLCJhZGRMaW5rIiwib0RhdGFQb2ludHMiLCJnZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb24iLCJnZXRSb3V0aW5nU2VydmljZSIsImdldE91dGJvdW5kcyIsIm9TaGVsbFNlcnZpY2VzIiwicmVxdWVzdE9iamVjdCIsImZuR2V0TGlua3MiLCJmbk9uRXJyb3IiLCJmblNldExpbmtFbmFibGVtZW50IiwiaWQiLCJhU3VwcG9ydGVkTGlua3MiLCJzTGlua0lkIiwic3VwcG9ydGVkIiwib1N1YkRhdGFQb2ludHMiLCJvUGFnZURhdGEiLCJvRGF0YVBvaW50Iiwib0xpbmtDb250ZXh0Iiwib0xpbmtEYXRhIiwib01peGVkQ29udGV4dCIsIm1lcmdlIiwib01hcHBpbmciLCJzTWFpblByb3BlcnR5Iiwic01hcHBlZFByb3BlcnR5IiwiaGFzT3duUHJvcGVydHkiLCJvTmV3TWFwcGluZyIsImlzTmF2aWdhdGlvblN1cHBvcnRlZCIsInBhcmFtcyIsImFMaW5rcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiT2JqZWN0UGFnZUNvbnRyb2xsZXIuY29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IEFjdGlvblJ1bnRpbWUgZnJvbSBcInNhcC9mZS9jb3JlL0FjdGlvblJ1bnRpbWVcIjtcbmltcG9ydCB7IEZFVmlldyB9IGZyb20gXCJzYXAvZmUvY29yZS9CYXNlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCB7IGNvbm5lY3QsIGRpc2Nvbm5lY3QsIGlzQ29ubmVjdGVkIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlTeW5jXCI7XG5pbXBvcnQgZHJhZnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQgSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbFJvdXRpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsUm91dGluZ1wiO1xuaW1wb3J0IE1hc3NFZGl0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NYXNzRWRpdFwiO1xuaW1wb3J0IE1lc3NhZ2VIYW5kbGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NZXNzYWdlSGFuZGxlclwiO1xuaW1wb3J0IFBhZ2VSZWFkeSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGFnZVJlYWR5XCI7XG5pbXBvcnQgUGFnaW5hdG9yIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9QYWdpbmF0b3JcIjtcbmltcG9ydCBQbGFjZWhvbGRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGxhY2Vob2xkZXJcIjtcbmltcG9ydCBTaGFyZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2hhcmVcIjtcbmltcG9ydCBWaWV3U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1ZpZXdTdGF0ZVwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24sIHVzaW5nRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBGRUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgVmlld0RhdGEgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCB0eXBlIFRhYmxlQVBJIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1RhYmxlQVBJXCI7XG5pbXBvcnQgVGFibGVIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVIZWxwZXJcIjtcbmltcG9ydCBUYWJsZVV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1V0aWxzXCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IHR5cGUgU3ViU2VjdGlvbkJsb2NrIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvY29udHJvbHMvU3ViU2VjdGlvbkJsb2NrXCI7XG5pbXBvcnQgdHlwZSB7IGRlZmF1bHQgYXMgT2JqZWN0UGFnZUV4dGVuc2lvbkFQSSB9IGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvRXh0ZW5zaW9uQVBJXCI7XG5pbXBvcnQgeyBkZWZhdWx0IGFzIEV4dGVuc2lvbkFQSSB9IGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL09iamVjdFBhZ2UvRXh0ZW5zaW9uQVBJXCI7XG5pbXBvcnQgVGFibGVTY3JvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9UYWJsZVNjcm9sbGVyXCI7XG5pbXBvcnQgSW5zdGFuY2VNYW5hZ2VyIGZyb20gXCJzYXAvbS9JbnN0YW5jZU1hbmFnZXJcIjtcbmltcG9ydCBMaW5rIGZyb20gXCJzYXAvbS9MaW5rXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IHR5cGUgUG9wb3ZlciBmcm9tIFwic2FwL20vUG9wb3ZlclwiO1xuaW1wb3J0IFVJNUV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgQmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL0JpbmRpbmdcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFDb250ZXh0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhQ29udGV4dEJpbmRpbmdcIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIEJyZWFkQ3J1bWJzIGZyb20gXCJzYXAvdXhhcC9CcmVhZENydW1ic1wiO1xuaW1wb3J0IHR5cGUgT2JqZWN0UGFnZUR5bmFtaWNIZWFkZXJUaXRsZSBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZUR5bmFtaWNIZWFkZXJUaXRsZVwiO1xuaW1wb3J0IHR5cGUgT2JqZWN0UGFnZUxheW91dCBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZUxheW91dFwiO1xuaW1wb3J0IHR5cGUgT2JqZWN0UGFnZVNlY3Rpb24gZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VTZWN0aW9uXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlU3ViU2VjdGlvbiBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZVN1YlNlY3Rpb25cIjtcbmltcG9ydCBJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSBmcm9tIFwiLi9vdmVycmlkZXMvSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgSW50ZXJuYWxSb3V0aW5nT3ZlcnJpZGUgZnJvbSBcIi4vb3ZlcnJpZGVzL0ludGVybmFsUm91dGluZ1wiO1xuaW1wb3J0IE1lc3NhZ2VIYW5kbGVyT3ZlcnJpZGUgZnJvbSBcIi4vb3ZlcnJpZGVzL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgUGFnaW5hdG9yT3ZlcnJpZGUgZnJvbSBcIi4vb3ZlcnJpZGVzL1BhZ2luYXRvclwiO1xuaW1wb3J0IFNoYXJlT3ZlcnJpZGVzIGZyb20gXCIuL292ZXJyaWRlcy9TaGFyZVwiO1xuaW1wb3J0IFZpZXdTdGF0ZU92ZXJyaWRlcyBmcm9tIFwiLi9vdmVycmlkZXMvVmlld1N0YXRlXCI7XG5cbmNvbnN0IFByb2dyYW1taW5nTW9kZWwgPSBGRUxpYnJhcnkuUHJvZ3JhbW1pbmdNb2RlbDtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5PYmplY3RQYWdlQ29udHJvbGxlclwiKVxuY2xhc3MgT2JqZWN0UGFnZUNvbnRyb2xsZXIgZXh0ZW5kcyBQYWdlQ29udHJvbGxlciB7XG5cdG9WaWV3ITogYW55O1xuXG5cdEB1c2luZ0V4dGVuc2lvbihQbGFjZWhvbGRlcilcblx0cGxhY2Vob2xkZXIhOiBQbGFjZWhvbGRlcjtcblxuXHRAdXNpbmdFeHRlbnNpb24oU2hhcmUub3ZlcnJpZGUoU2hhcmVPdmVycmlkZXMpKVxuXHRzaGFyZSE6IFNoYXJlO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlcm5hbFJvdXRpbmcub3ZlcnJpZGUoSW50ZXJuYWxSb3V0aW5nT3ZlcnJpZGUpKVxuXHRfcm91dGluZyE6IEludGVybmFsUm91dGluZztcblxuXHRAdXNpbmdFeHRlbnNpb24oUGFnaW5hdG9yLm92ZXJyaWRlKFBhZ2luYXRvck92ZXJyaWRlKSlcblx0cGFnaW5hdG9yITogUGFnaW5hdG9yO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihNZXNzYWdlSGFuZGxlci5vdmVycmlkZShNZXNzYWdlSGFuZGxlck92ZXJyaWRlKSlcblx0bWVzc2FnZUhhbmRsZXIhOiBNZXNzYWdlSGFuZGxlcjtcblxuXHRAdXNpbmdFeHRlbnNpb24oSW50ZW50QmFzZWROYXZpZ2F0aW9uLm92ZXJyaWRlKEludGVudEJhc2VkTmF2aWdhdGlvbk92ZXJyaWRlKSlcblx0aW50ZW50QmFzZWROYXZpZ2F0aW9uITogSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbi5vdmVycmlkZSh7XG5cdFx0XHRnZXROYXZpZ2F0aW9uTW9kZTogZnVuY3Rpb24gKHRoaXM6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdGNvbnN0IGJJc1N0aWNreUVkaXRNb2RlID1cblx0XHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIE9iamVjdFBhZ2VDb250cm9sbGVyKS5nZXRTdGlja3lFZGl0TW9kZSAmJlxuXHRcdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgT2JqZWN0UGFnZUNvbnRyb2xsZXIpLmdldFN0aWNreUVkaXRNb2RlKCk7XG5cdFx0XHRcdHJldHVybiBiSXNTdGlja3lFZGl0TW9kZSA/IFwiZXhwbGFjZVwiIDogdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH0pXG5cdClcblx0X2ludGVudEJhc2VkTmF2aWdhdGlvbiE6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihWaWV3U3RhdGUub3ZlcnJpZGUoVmlld1N0YXRlT3ZlcnJpZGVzKSlcblx0dmlld1N0YXRlITogVmlld1N0YXRlO1xuXG5cdEB1c2luZ0V4dGVuc2lvbihcblx0XHRQYWdlUmVhZHkub3ZlcnJpZGUoe1xuXHRcdFx0aXNDb250ZXh0RXhwZWN0ZWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSlcblx0KVxuXHRwYWdlUmVhZHkhOiBQYWdlUmVhZHk7XG5cblx0QHVzaW5nRXh0ZW5zaW9uKE1hc3NFZGl0KVxuXHRtYXNzRWRpdCE6IE1hc3NFZGl0O1xuXG5cdHByaXZhdGUgbUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzPzogUmVjb3JkPHN0cmluZywgT2JqZWN0UGFnZUV4dGVuc2lvbkFQST47XG5cblx0cHJvdGVjdGVkIGV4dGVuc2lvbkFQST86IE9iamVjdFBhZ2VFeHRlbnNpb25BUEk7XG5cblx0cHJpdmF0ZSBiU2VjdGlvbk5hdmlnYXRlZD86IGJvb2xlYW47XG5cblx0cHJpdmF0ZSBzd2l0Y2hEcmFmdEFuZEFjdGl2ZVBvcE92ZXI/OiBQb3BvdmVyO1xuXG5cdHByaXZhdGUgY3VycmVudEJpbmRpbmc/OiBCaW5kaW5nO1xuXG5cdHByaXZhdGUgbWVzc2FnZUJ1dHRvbjogYW55O1xuXG5cdHByaXZhdGUgY29sbGFib3JhdGlvbk1lc3NhZ2U/OiBNZXNzYWdlO1xuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRFeHRlbnNpb25BUEkoc0lkPzogc3RyaW5nKTogRXh0ZW5zaW9uQVBJIHtcblx0XHRpZiAoc0lkKSB7XG5cdFx0XHQvLyB0byBhbGxvdyBsb2NhbCBJRCB1c2FnZSBmb3IgY3VzdG9tIHBhZ2VzIHdlJ2xsIGNyZWF0ZS9yZXR1cm4gb3duIGluc3RhbmNlcyBmb3IgY3VzdG9tIHNlY3Rpb25zXG5cdFx0XHR0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcyA9IHRoaXMubUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzIHx8IHt9O1xuXG5cdFx0XHRpZiAoIXRoaXMubUN1c3RvbVNlY3Rpb25FeHRlbnNpb25BUElzW3NJZF0pIHtcblx0XHRcdFx0dGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXNbc0lkXSA9IG5ldyBFeHRlbnNpb25BUEkodGhpcywgc0lkKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJc1tzSWRdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoIXRoaXMuZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHRcdHRoaXMuZXh0ZW5zaW9uQVBJID0gbmV3IEV4dGVuc2lvbkFQSSh0aGlzKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLmV4dGVuc2lvbkFQSTtcblx0XHR9XG5cdH1cblxuXHRvbkluaXQoKSB7XG5cdFx0c3VwZXIub25Jbml0KCk7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXG5cdFx0Ly8gU2V0dGluZyBkZWZhdWx0cyBvZiBpbnRlcm5hbCBtb2RlbCBjb250ZXh0XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwiZXh0ZXJuYWxOYXZpZ2F0aW9uQ29udGV4dFwiLCB7IHBhZ2U6IHRydWUgfSk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcInJlbGF0ZWRBcHBzXCIsIHtcblx0XHRcdHZpc2liaWxpdHk6IGZhbHNlLFxuXHRcdFx0aXRlbXM6IG51bGxcblx0XHR9KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwiYmF0Y2hHcm91cHNcIiwgdGhpcy5fZ2V0QmF0Y2hHcm91cHNGb3JWaWV3KCkpO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dD8uc2V0UHJvcGVydHkoXCJlcnJvck5hdmlnYXRpb25TZWN0aW9uRmxhZ1wiLCBmYWxzZSk7XG5cdFx0aWYgKG9PYmplY3RQYWdlLmdldEVuYWJsZUxhenlMb2FkaW5nKCkpIHtcblx0XHRcdC8vQXR0YWNoaW5nIHRoZSBldmVudCB0byBtYWtlIHRoZSBzdWJzZWN0aW9uIGNvbnRleHQgYmluZGluZyBhY3RpdmUgd2hlbiBpdCBpcyB2aXNpYmxlLlxuXHRcdFx0b09iamVjdFBhZ2UuYXR0YWNoRXZlbnQoXCJzdWJTZWN0aW9uRW50ZXJlZFZpZXdQb3J0XCIsIHRoaXMuX2hhbmRsZVN1YlNlY3Rpb25FbnRlcmVkVmlld1BvcnQuYmluZCh0aGlzKSk7XG5cdFx0fVxuXHRcdHRoaXMubWVzc2FnZUJ1dHRvbiA9IHRoaXMuZ2V0VmlldygpLmJ5SWQoXCJmZTo6Rm9vdGVyQmFyOjpNZXNzYWdlQnV0dG9uXCIpO1xuXHRcdHRoaXMubWVzc2FnZUJ1dHRvbi5vSXRlbUJpbmRpbmcuYXR0YWNoQ2hhbmdlKHRoaXMuX2ZuU2hvd09QTWVzc2FnZSwgdGhpcyk7XG5cdFx0b0ludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcInJvb3RFZGl0RW5hYmxlZFwiLCB0cnVlKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwicm9vdEVkaXRWaXNpYmxlXCIsIHRydWUpO1xuXHR9XG5cblx0b25FeGl0KCkge1xuXHRcdGlmICh0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcykge1xuXHRcdFx0Zm9yIChjb25zdCBzSWQgb2YgT2JqZWN0LmtleXModGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXMpKSB7XG5cdFx0XHRcdGlmICh0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJc1tzSWRdKSB7XG5cdFx0XHRcdFx0dGhpcy5tQ3VzdG9tU2VjdGlvbkV4dGVuc2lvbkFQSXNbc0lkXS5kZXN0cm95KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGRlbGV0ZSB0aGlzLm1DdXN0b21TZWN0aW9uRXh0ZW5zaW9uQVBJcztcblx0XHR9XG5cdFx0aWYgKHRoaXMuZXh0ZW5zaW9uQVBJKSB7XG5cdFx0XHR0aGlzLmV4dGVuc2lvbkFQSS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdGRlbGV0ZSB0aGlzLmV4dGVuc2lvbkFQSTtcblxuXHRcdGNvbnN0IG9NZXNzYWdlUG9wb3ZlciA9IHRoaXMubWVzc2FnZUJ1dHRvbiA/IHRoaXMubWVzc2FnZUJ1dHRvbi5vTWVzc2FnZVBvcG92ZXIgOiBudWxsO1xuXHRcdGlmIChvTWVzc2FnZVBvcG92ZXIgJiYgb01lc3NhZ2VQb3BvdmVyLmlzT3BlbigpKSB7XG5cdFx0XHRvTWVzc2FnZVBvcG92ZXIuY2xvc2UoKTtcblx0XHR9XG5cdFx0Ly93aGVuIGV4aXRpbmcgd2Ugc2V0IGtlZXBBbGl2ZSBjb250ZXh0IHRvIGZhbHNlXG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0aWYgKG9Db250ZXh0ICYmIG9Db250ZXh0LmlzS2VlcEFsaXZlKCkpIHtcblx0XHRcdG9Db250ZXh0LnNldEtlZXBBbGl2ZShmYWxzZSk7XG5cdFx0fVxuXHRcdGlmIChpc0Nvbm5lY3RlZCh0aGlzLmdldFZpZXcoKSkpIHtcblx0XHRcdGRpc2Nvbm5lY3QodGhpcy5nZXRWaWV3KCkpOyAvLyBDbGVhbnVwIGNvbGxhYm9yYXRpb24gY29ubmVjdGlvbiB3aGVuIGxlYXZpbmcgdGhlIGFwcFxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc2hvdyB0aGUgbWVzc2FnZSBzdHJpcCBvbiB0aGUgb2JqZWN0IHBhZ2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZm5TaG93T1BNZXNzYWdlKCkge1xuXHRcdGNvbnN0IGV4dGVuc2lvbkFQSSA9IHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCk7XG5cdFx0Y29uc3QgdmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdGNvbnN0IG1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlQnV0dG9uLm9NZXNzYWdlUG9wb3ZlclxuXHRcdFx0LmdldEl0ZW1zKClcblx0XHRcdC5tYXAoKGl0ZW06IGFueSkgPT4gaXRlbS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCkpXG5cdFx0XHQuZmlsdGVyKChtZXNzYWdlOiBNZXNzYWdlKSA9PiB7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmdldFRhcmdldHMoKVswXSA9PT0gdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCk7XG5cdFx0XHR9KTtcblxuXHRcdGlmIChleHRlbnNpb25BUEkpIHtcblx0XHRcdGV4dGVuc2lvbkFQSS5zaG93TWVzc2FnZXMobWVzc2FnZXMpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRUYWJsZUJpbmRpbmcob1RhYmxlOiBhbnkpIHtcblx0XHRyZXR1cm4gb1RhYmxlICYmIG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdH1cblxuXHQvKipcblx0ICogRmluZCB0aGUgbGFzdCB2aXNpYmxlIHN1YnNlY3Rpb24gYW5kIGFkZCB0aGUgc2FwVXhBUE9iamVjdFBhZ2VTdWJTZWN0aW9uRml0Q29udGFpbmVyIENTUyBjbGFzcyBpZiBpdCBjb250YWlucyBvbmx5IGEgR3JpZFRhYmxlIG9yIGEgVHJlZVRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc3ViU2VjdGlvbnMgVGhlIHN1YiBzZWN0aW9ucyB0byBsb29rIGZvclxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0cHJpdmF0ZSBjaGVja1NlY3Rpb25zRm9yTm9uUmVzcG9uc2l2ZVRhYmxlKHN1YlNlY3Rpb25zOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdKSB7XG5cdFx0Y29uc3QgY2hhbmdlQ2xhc3NGb3JUYWJsZXMgPSAoZXZlbnQ6IEV2ZW50LCBsYXN0VmlzaWJsZVN1YlNlY3Rpb246IE9iamVjdFBhZ2VTdWJTZWN0aW9uKSA9PiB7XG5cdFx0XHRjb25zdCBibG9ja3MgPSBbLi4ubGFzdFZpc2libGVTdWJTZWN0aW9uLmdldEJsb2NrcygpLCAuLi5sYXN0VmlzaWJsZVN1YlNlY3Rpb24uZ2V0TW9yZUJsb2NrcygpXTtcblx0XHRcdGNvbnN0IHRhYmxlVHlwZSA9IGJsb2Nrcy5sZW5ndGggPT09IDEgJiYgdGhpcy5zZWFyY2hUYWJsZUluQmxvY2soYmxvY2tzWzBdIGFzIFN1YlNlY3Rpb25CbG9jayk/LmdldFR5cGUoKTtcblx0XHRcdGlmICh0YWJsZVR5cGUgJiYgKHRhYmxlVHlwZT8uaXNBKFwic2FwLnVpLm1kYy50YWJsZS5HcmlkVGFibGVUeXBlXCIpIHx8IHRhYmxlVHlwZT8uaXNBKFwic2FwLnVpLm1kYy50YWJsZS5UcmVlVGFibGVUeXBlXCIpKSkge1xuXHRcdFx0XHQvL0luIGNhc2UgdGhlcmUgaXMgb25seSBhIHNpbmdsZSB0YWJsZSBpbiBhIHN1YlNlY3Rpb24gd2UgZml0IHRoYXQgdG8gdGhlIHdob2xlIHBhZ2Ugc28gdGhhdCB0aGUgc2Nyb2xsYmFyIGNvbWVzIG9ubHkgb24gdGFibGUgYW5kIG5vdCBvbiBwYWdlXG5cdFx0XHRcdGxhc3RWaXNpYmxlU3ViU2VjdGlvbi5hZGRTdHlsZUNsYXNzKFwic2FwVXhBUE9iamVjdFBhZ2VTdWJTZWN0aW9uRml0Q29udGFpbmVyXCIpO1xuXHRcdFx0XHRsYXN0VmlzaWJsZVN1YlNlY3Rpb24uZGV0YWNoRXZlbnQoXCJtb2RlbENvbnRleHRDaGFuZ2VcIiwgY2hhbmdlQ2xhc3NGb3JUYWJsZXMsIHRoaXMpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Zm9yIChsZXQgc3ViU2VjdGlvbkluZGV4ID0gc3ViU2VjdGlvbnMubGVuZ3RoIC0gMTsgc3ViU2VjdGlvbkluZGV4ID49IDA7IHN1YlNlY3Rpb25JbmRleC0tKSB7XG5cdFx0XHRpZiAoc3ViU2VjdGlvbnNbc3ViU2VjdGlvbkluZGV4XS5nZXRWaXNpYmxlKCkpIHtcblx0XHRcdFx0Y29uc3QgbGFzdFZpc2libGVTdWJTZWN0aW9uID0gc3ViU2VjdGlvbnNbc3ViU2VjdGlvbkluZGV4XTtcblx0XHRcdFx0Ly8gV2UgbmVlZCB0byBhdHRhY2ggdGhpcyBldmVudCBpbiBvcmRlciB0byBtYW5hZ2UgdGhlIE9iamVjdCBQYWdlIExhenkgTG9hZGluZyBtZWNoYW5pc21cblx0XHRcdFx0bGFzdFZpc2libGVTdWJTZWN0aW9uLmF0dGFjaEV2ZW50KFwibW9kZWxDb250ZXh0Q2hhbmdlXCIsIGxhc3RWaXNpYmxlU3ViU2VjdGlvbiwgY2hhbmdlQ2xhc3NGb3JUYWJsZXMsIHRoaXMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRmluZCBhIHRhYmxlIGluIGJsb2NrcyBvZiBzZWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gYmxvY2sgT25lIHN1YiBzZWN0aW9uIGJsb2NrXG5cdCAqIEByZXR1cm5zIFRhYmxlIGlmIGV4aXN0c1xuXHQgKi9cblx0cHJpdmF0ZSBzZWFyY2hUYWJsZUluQmxvY2soYmxvY2s6IFN1YlNlY3Rpb25CbG9jaykge1xuXHRcdGNvbnN0IGNvbnRyb2wgPSBibG9jay5jb250ZW50O1xuXHRcdGxldCB0YWJsZUFQSTogVGFibGVBUEkgfCB1bmRlZmluZWQ7XG5cdFx0aWYgKGJsb2NrLmlzQShcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5jb250cm9scy5TdWJTZWN0aW9uQmxvY2tcIikpIHtcblx0XHRcdC8vIFRoZSB0YWJsZSBtYXkgY3VycmVudGx5IGJlIHNob3duIGluIGEgZnVsbCBzY3JlZW4gZGlhbG9nLCB3ZSBjYW4gdGhlbiBnZXQgdGhlIHJlZmVyZW5jZSB0byB0aGUgVGFibGVBUElcblx0XHRcdC8vIGNvbnRyb2wgZnJvbSB0aGUgY3VzdG9tIGRhdGEgb2YgdGhlIHBsYWNlIGhvbGRlciBwYW5lbFxuXHRcdFx0aWYgKGNvbnRyb2wuaXNBKFwic2FwLm0uUGFuZWxcIikgJiYgY29udHJvbC5kYXRhKFwiRnVsbFNjcmVlblRhYmxlUGxhY2VIb2xkZXJcIikpIHtcblx0XHRcdFx0dGFibGVBUEkgPSBjb250cm9sLmRhdGEoXCJ0YWJsZUFQSXJlZmVyZW5jZVwiKTtcblx0XHRcdH0gZWxzZSBpZiAoY29udHJvbC5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0XHRcdHRhYmxlQVBJID0gY29udHJvbCBhcyBUYWJsZUFQSTtcblx0XHRcdH1cblx0XHRcdGlmICh0YWJsZUFQSSkge1xuXHRcdFx0XHRyZXR1cm4gdGFibGVBUEkuY29udGVudCBhcyBUYWJsZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRvbkJlZm9yZVJlbmRlcmluZygpIHtcblx0XHRQYWdlQ29udHJvbGxlci5wcm90b3R5cGUub25CZWZvcmVSZW5kZXJpbmcuYXBwbHkodGhpcyk7XG5cdFx0Ly8gSW4gdGhlIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Qgc2NlbmFyaW8gd2UgbmVlZCB0byBlbnN1cmUgaW4gY2FzZSBvZiByZWxvYWQvcmVmcmVzaCB0aGF0IHRoZSBtZXRhIG1vZGVsIGluIHRoZSBtZXRob2RlIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Qgb2YgdGhlIEZpZWxkUnVudGltZSBpcyBhdmFpbGFibGVcblx0XHRpZiAodGhpcy5vVmlldy5vVmlld0RhdGE/LnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QgJiYgQ29tbW9uSGVscGVyLmdldE1ldGFNb2RlbCgpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdENvbW1vbkhlbHBlci5zZXRNZXRhTW9kZWwodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0fVxuXHR9XG5cblx0b25BZnRlclJlbmRlcmluZygpIHtcblx0XHRsZXQgc3ViU2VjdGlvbnM6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW107XG5cdFx0aWYgKHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkuZ2V0VXNlSWNvblRhYkJhcigpKSB7XG5cdFx0XHRjb25zdCBzZWN0aW9ucyA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkuZ2V0U2VjdGlvbnMoKTtcblx0XHRcdGZvciAoY29uc3Qgc2VjdGlvbiBvZiBzZWN0aW9ucykge1xuXHRcdFx0XHRzdWJTZWN0aW9ucyA9IHNlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKTtcblx0XHRcdFx0dGhpcy5jaGVja1NlY3Rpb25zRm9yTm9uUmVzcG9uc2l2ZVRhYmxlKHN1YlNlY3Rpb25zKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c3ViU2VjdGlvbnMgPSB0aGlzLl9nZXRBbGxTdWJTZWN0aW9ucygpO1xuXHRcdFx0dGhpcy5jaGVja1NlY3Rpb25zRm9yTm9uUmVzcG9uc2l2ZVRhYmxlKHN1YlNlY3Rpb25zKTtcblx0XHR9XG5cdH1cblxuXHRfb25CZWZvcmVCaW5kaW5nKG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHQvLyBUT0RPOiB3ZSBzaG91bGQgY2hlY2sgaG93IHRoaXMgY29tZXMgdG9nZXRoZXIgd2l0aCB0aGUgdHJhbnNhY3Rpb24gaGVscGVyLCBzYW1lIHRvIHRoZSBjaGFuZ2UgaW4gdGhlIGFmdGVyQmluZGluZ1xuXHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9maW5kVGFibGVzKCksXG5cdFx0XHRvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCksXG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0b0ludGVybmFsTW9kZWwgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcImludGVybmFsXCIpLFxuXHRcdFx0YUJhdGNoR3JvdXBzID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiYmF0Y2hHcm91cHNcIiksXG5cdFx0XHRpVmlld0xldmVsID0gKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS52aWV3TGV2ZWw7XG5cdFx0bGV0IG9GYXN0Q3JlYXRpb25Sb3c7XG5cdFx0YUJhdGNoR3JvdXBzLnB1c2goXCIkYXV0b1wiKTtcblx0XHRpZiAobVBhcmFtZXRlcnMuYkRyYWZ0TmF2aWdhdGlvbiAhPT0gdHJ1ZSkge1xuXHRcdFx0dGhpcy5fY2xvc2VTaWRlQ29udGVudCgpO1xuXHRcdH1cblx0XHRjb25zdCBvcENvbnRleHQgPSBvT2JqZWN0UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0aWYgKFxuXHRcdFx0b3BDb250ZXh0ICYmXG5cdFx0XHRvcENvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSAmJlxuXHRcdFx0IWFCYXRjaEdyb3Vwcy5zb21lKG9wQ29udGV4dC5nZXRNb2RlbCgpLmhhc1BlbmRpbmdDaGFuZ2VzLmJpbmQob3BDb250ZXh0LmdldE1vZGVsKCkpKVxuXHRcdCkge1xuXHRcdFx0LyogXHRJbiBjYXNlIHRoZXJlIGFyZSBwZW5kaW5nIGNoYW5nZXMgZm9yIHRoZSBjcmVhdGlvbiByb3cgYW5kIG5vIG90aGVycyB3ZSBuZWVkIHRvIHJlc2V0IHRoZSBjaGFuZ2VzXG5cdFx0XHRcdFx0XHRcdFx0VE9ETzogdGhpcyBpcyBqdXN0IGEgcXVpY2sgc29sdXRpb24sIHRoaXMgbmVlZHMgdG8gYmUgcmV3b3JrZWRcblx0XHRcdFx0XHRcdFx0XHQqL1xuXG5cdFx0XHRvcENvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdH1cblxuXHRcdC8vIEZvciBub3cgd2UgaGF2ZSB0byBzZXQgdGhlIGJpbmRpbmcgY29udGV4dCB0byBudWxsIGZvciBldmVyeSBmYXN0IGNyZWF0aW9uIHJvd1xuXHRcdC8vIFRPRE86IEdldCByaWQgb2YgdGhpcyBjb2Rpbmcgb3IgbW92ZSBpdCB0byBhbm90aGVyIGxheWVyIC0gdG8gYmUgZGlzY3Vzc2VkIHdpdGggTURDIGFuZCBtb2RlbFxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVRhYmxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0b0Zhc3RDcmVhdGlvblJvdyA9IGFUYWJsZXNbaV0uZ2V0Q3JlYXRpb25Sb3coKTtcblx0XHRcdGlmIChvRmFzdENyZWF0aW9uUm93KSB7XG5cdFx0XHRcdG9GYXN0Q3JlYXRpb25Sb3cuc2V0QmluZGluZ0NvbnRleHQobnVsbCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gU2Nyb2xsIHRvIHByZXNlbnQgU2VjdGlvbiBzbyB0aGF0IGJpbmRpbmdzIGFyZSBlbmFibGVkIGR1cmluZyBuYXZpZ2F0aW9uIHRocm91Z2ggcGFnaW5hdG9yIGJ1dHRvbnMsIGFzIHRoZXJlIGlzIG5vIHZpZXcgcmVyZW5kZXJpbmcvcmViaW5kXG5cdFx0Y29uc3QgZm5TY3JvbGxUb1ByZXNlbnRTZWN0aW9uID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKCEob09iamVjdFBhZ2UgYXMgYW55KS5pc0ZpcnN0UmVuZGVyaW5nKCkgJiYgIW1QYXJhbWV0ZXJzLmJQZXJzaXN0T1BTY3JvbGwpIHtcblx0XHRcdFx0b09iamVjdFBhZ2Uuc2V0U2VsZWN0ZWRTZWN0aW9uKG51bGwgYXMgYW55KTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdG9PYmplY3RQYWdlLmF0dGFjaEV2ZW50T25jZShcIm1vZGVsQ29udGV4dENoYW5nZVwiLCBmblNjcm9sbFRvUHJlc2VudFNlY3Rpb24pO1xuXG5cdFx0Ly8gaWYgdGhlIHN0cnVjdHVyZSBvZiB0aGUgT2JqZWN0UGFnZUxheW91dCBpcyBjaGFuZ2VkIHRoZW4gc2Nyb2xsIHRvIHByZXNlbnQgU2VjdGlvblxuXHRcdC8vIEZJWE1FIElzIHRoaXMgcmVhbGx5IHdvcmtpbmcgYXMgaW50ZW5kZWQgPyBJbml0aWFsbHkgdGhpcyB3YXMgb25CZWZvcmVSZW5kZXJpbmcsIGJ1dCBuZXZlciB0cmlnZ2VyZWQgb25CZWZvcmVSZW5kZXJpbmcgYmVjYXVzZSBpdCB3YXMgcmVnaXN0ZXJlZCBhZnRlciBpdFxuXHRcdGNvbnN0IG9EZWxlZ2F0ZU9uQmVmb3JlID0ge1xuXHRcdFx0b25BZnRlclJlbmRlcmluZzogZm5TY3JvbGxUb1ByZXNlbnRTZWN0aW9uXG5cdFx0fTtcblx0XHRvT2JqZWN0UGFnZS5hZGRFdmVudERlbGVnYXRlKG9EZWxlZ2F0ZU9uQmVmb3JlLCB0aGlzKTtcblx0XHR0aGlzLnBhZ2VSZWFkeS5hdHRhY2hFdmVudE9uY2UoXCJwYWdlUmVhZHlcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0b09iamVjdFBhZ2UucmVtb3ZlRXZlbnREZWxlZ2F0ZShvRGVsZWdhdGVPbkJlZm9yZSk7XG5cdFx0fSk7XG5cblx0XHQvL1NldCB0aGUgQmluZGluZyBmb3IgUGFnaW5hdG9ycyB1c2luZyBMaXN0QmluZGluZyBJRFxuXHRcdGlmIChpVmlld0xldmVsID4gMSkge1xuXHRcdFx0bGV0IG9CaW5kaW5nID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMubGlzdEJpbmRpbmc7XG5cdFx0XHRjb25zdCBvUGFnaW5hdG9yQ3VycmVudENvbnRleHQgPSBvSW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShcIi9wYWdpbmF0b3JDdXJyZW50Q29udGV4dFwiKTtcblx0XHRcdGlmIChvUGFnaW5hdG9yQ3VycmVudENvbnRleHQpIHtcblx0XHRcdFx0Y29uc3Qgb0JpbmRpbmdUb1VzZSA9IG9QYWdpbmF0b3JDdXJyZW50Q29udGV4dC5nZXRCaW5kaW5nKCk7XG5cdFx0XHRcdHRoaXMucGFnaW5hdG9yLmluaXRpYWxpemUob0JpbmRpbmdUb1VzZSwgb1BhZ2luYXRvckN1cnJlbnRDb250ZXh0KTtcblx0XHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvcGFnaW5hdG9yQ3VycmVudENvbnRleHRcIiwgbnVsbCk7XG5cdFx0XHR9IGVsc2UgaWYgKG9CaW5kaW5nKSB7XG5cdFx0XHRcdGlmIChvQmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0XHRcdHRoaXMucGFnaW5hdG9yLmluaXRpYWxpemUob0JpbmRpbmcsIG9Db250ZXh0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBpZiB0aGUgYmluZGluZyB0eXBlIGlzIG5vdCBPRGF0YUxpc3RCaW5kaW5nIGJlY2F1c2Ugb2YgYSBkZWVwbGluayBuYXZpZ2F0aW9uIG9yIGEgcmVmcmVzaCBvZiB0aGUgcGFnZVxuXHRcdFx0XHRcdC8vIHdlIG5lZWQgdG8gY3JlYXRlIGl0XG5cdFx0XHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0JpbmRpbmcuZ2V0UGF0aCgpO1xuXHRcdFx0XHRcdGlmICgvXFwoW14pXSpcXCkkLy50ZXN0KHNCaW5kaW5nUGF0aCkpIHtcblx0XHRcdFx0XHRcdC8vIFRoZSBjdXJyZW50IGJpbmRpbmcgcGF0aCBlbmRzIHdpdGggKHh4eCksIHNvIHdlIGNyZWF0ZSB0aGUgbGlzdEJpbmRpbmcgYnkgcmVtb3ZpbmcgKHh4eClcblx0XHRcdFx0XHRcdGNvbnN0IHNMaXN0QmluZGluZ1BhdGggPSBzQmluZGluZ1BhdGgucmVwbGFjZSgvXFwoW14pXSpcXCkkLywgXCJcIik7XG5cdFx0XHRcdFx0XHRvQmluZGluZyA9IG5ldyAoT0RhdGFMaXN0QmluZGluZyBhcyBhbnkpKG9CaW5kaW5nLm9Nb2RlbCwgc0xpc3RCaW5kaW5nUGF0aCk7XG5cdFx0XHRcdFx0XHRjb25zdCBfc2V0TGlzdEJpbmRpbmdBc3luYyA9ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0aWYgKG9CaW5kaW5nLmdldENvbnRleHRzKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMucGFnaW5hdG9yLmluaXRpYWxpemUob0JpbmRpbmcsIG9Db250ZXh0KTtcblx0XHRcdFx0XHRcdFx0XHRvQmluZGluZy5kZXRhY2hFdmVudChcImNoYW5nZVwiLCBfc2V0TGlzdEJpbmRpbmdBc3luYyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdG9CaW5kaW5nLmdldENvbnRleHRzKDApO1xuXHRcdFx0XHRcdFx0b0JpbmRpbmcuYXR0YWNoRXZlbnQoXCJjaGFuZ2VcIiwgX3NldExpc3RCaW5kaW5nQXN5bmMpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBUaGUgY3VycmVudCBiaW5kaW5nIGRvZXNuJ3QgZW5kIHdpdGggKHh4eCkgLS0+IHRoZSBsYXN0IHNlZ21lbnQgaXMgYSAxLTEgbmF2aWdhdGlvbiwgc28gd2UgZG9uJ3QgZGlzcGxheSB0aGUgcGFnaW5hdG9yXG5cdFx0XHRcdFx0XHR0aGlzLnBhZ2luYXRvci5pbml0aWFsaXplKHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG9PYmplY3RQYWdlLmdldEVuYWJsZUxhenlMb2FkaW5nKCkpIHtcblx0XHRcdGNvbnN0IGFTZWN0aW9ucyA9IG9PYmplY3RQYWdlLmdldFNlY3Rpb25zKCk7XG5cdFx0XHRjb25zdCBiVXNlSWNvblRhYkJhciA9IG9PYmplY3RQYWdlLmdldFVzZUljb25UYWJCYXIoKTtcblx0XHRcdGxldCBpU2tpcCA9IDI7XG5cdFx0XHRjb25zdCBiSXNJbkVkaXRNb2RlID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpO1xuXHRcdFx0Y29uc3QgYkVkaXRhYmxlSGVhZGVyID0gKHRoaXMuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS5lZGl0YWJsZUhlYWRlckNvbnRlbnQ7XG5cdFx0XHRmb3IgKGxldCBpU2VjdGlvbiA9IDA7IGlTZWN0aW9uIDwgYVNlY3Rpb25zLmxlbmd0aDsgaVNlY3Rpb24rKykge1xuXHRcdFx0XHRjb25zdCBvU2VjdGlvbiA9IGFTZWN0aW9uc1tpU2VjdGlvbl07XG5cdFx0XHRcdGNvbnN0IGFTdWJTZWN0aW9ucyA9IG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKCk7XG5cdFx0XHRcdGZvciAobGV0IGlTdWJTZWN0aW9uID0gMDsgaVN1YlNlY3Rpb24gPCBhU3ViU2VjdGlvbnMubGVuZ3RoOyBpU3ViU2VjdGlvbisrLCBpU2tpcC0tKSB7XG5cdFx0XHRcdFx0Ly8gSW4gSWNvblRhYkJhciBtb2RlIGtlZXAgdGhlIHNlY29uZCBzZWN0aW9uIGJvdW5kIGlmIHRoZXJlIGlzIGFuIGVkaXRhYmxlIGhlYWRlciBhbmQgd2UgYXJlIHN3aXRjaGluZyB0byBkaXNwbGF5IG1vZGVcblx0XHRcdFx0XHRpZiAoaVNraXAgPCAxIHx8IChiVXNlSWNvblRhYkJhciAmJiAoaVNlY3Rpb24gPiAxIHx8IChpU2VjdGlvbiA9PT0gMSAmJiAhYkVkaXRhYmxlSGVhZGVyICYmICFiSXNJbkVkaXRNb2RlKSkpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvU3ViU2VjdGlvbiA9IGFTdWJTZWN0aW9uc1tpU3ViU2VjdGlvbl07XG5cdFx0XHRcdFx0XHRpZiAob1N1YlNlY3Rpb24uZGF0YSgpLmlzVmlzaWJpbGl0eUR5bmFtaWMgIT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRcdFx0XHRcdG9TdWJTZWN0aW9uLnNldEJpbmRpbmdDb250ZXh0KG51bGwgYXMgYW55KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAodGhpcy5wbGFjZWhvbGRlci5pc1BsYWNlaG9sZGVyRW5hYmxlZCgpICYmIG1QYXJhbWV0ZXJzLnNob3dQbGFjZWhvbGRlcikge1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRcdGNvbnN0IG9OYXZDb250YWluZXIgPSAob1ZpZXcuZ2V0UGFyZW50KCkgYXMgYW55KS5vQ29udGFpbmVyLmdldFBhcmVudCgpO1xuXHRcdFx0aWYgKG9OYXZDb250YWluZXIpIHtcblx0XHRcdFx0b05hdkNvbnRhaW5lci5zaG93UGxhY2Vob2xkZXIoe30pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9nZXRGaXJzdENsaWNrYWJsZUVsZW1lbnQob09iamVjdFBhZ2U6IGFueSkge1xuXHRcdGxldCBvRmlyc3RDbGlja2FibGVFbGVtZW50O1xuXHRcdGNvbnN0IGFBY3Rpb25zID0gb09iamVjdFBhZ2UuZ2V0SGVhZGVyVGl0bGUoKSAmJiBvT2JqZWN0UGFnZS5nZXRIZWFkZXJUaXRsZSgpLmdldEFjdGlvbnMoKTtcblx0XHRpZiAoYUFjdGlvbnMgJiYgYUFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRvRmlyc3RDbGlja2FibGVFbGVtZW50ID0gYUFjdGlvbnMuZmluZChmdW5jdGlvbiAob0FjdGlvbjogYW55KSB7XG5cdFx0XHRcdC8vIER1ZSB0byB0aGUgbGVmdCBhbGlnbm1lbnQgb2YgdGhlIERyYWZ0IHN3aXRjaCBhbmQgdGhlIGNvbGxhYm9yYXRpdmUgZHJhZnQgYXZhdGFyIGNvbnRyb2xzXG5cdFx0XHRcdC8vIHRoZXJlIGlzIGEgVG9vbGJhclNwYWNlciBpbiB0aGUgYWN0aW9ucyBhZ2dyZWdhdGlvbiB3aGljaCB3ZSBuZWVkIHRvIGV4Y2x1ZGUgaGVyZSFcblx0XHRcdFx0Ly8gRHVlIHRvIHRoZSBBQ0MgcmVwb3J0LCB3ZSBhbHNvIG5lZWQgbm90IHRvIGNoZWNrIGZvciB0aGUgSW52aXNpYmxlVGV4dCBlbGVtZW50c1xuXHRcdFx0XHRpZiAob0FjdGlvbi5pc0EoXCJzYXAuZmUubWFjcm9zLnNoYXJlLlNoYXJlQVBJXCIpKSB7XG5cdFx0XHRcdFx0Ly8gc2luY2UgU2hhcmVBUEkgZG9lcyBub3QgaGF2ZSBhIGRpc2FibGUgcHJvcGVydHlcblx0XHRcdFx0XHQvLyBoZW5jZSB0aGVyZSBpcyBubyBuZWVkIHRvIGNoZWNrIGlmIGl0IGlzIGRpc2JhbGVkIG9yIG5vdFxuXHRcdFx0XHRcdHJldHVybiBvQWN0aW9uLmdldFZpc2libGUoKTtcblx0XHRcdFx0fSBlbHNlIGlmICghb0FjdGlvbi5pc0EoXCJzYXAudWkuY29yZS5JbnZpc2libGVUZXh0XCIpICYmICFvQWN0aW9uLmlzQShcInNhcC5tLlRvb2xiYXJTcGFjZXJcIikpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5nZXRWaXNpYmxlKCkgJiYgb0FjdGlvbi5nZXRFbmFibGVkKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb0ZpcnN0Q2xpY2thYmxlRWxlbWVudDtcblx0fVxuXG5cdF9nZXRGaXJzdEVtcHR5TWFuZGF0b3J5RmllbGRGcm9tU3ViU2VjdGlvbihhU3ViU2VjdGlvbnM6IGFueSkge1xuXHRcdGlmIChhU3ViU2VjdGlvbnMpIHtcblx0XHRcdGZvciAobGV0IHN1YlNlY3Rpb24gPSAwOyBzdWJTZWN0aW9uIDwgYVN1YlNlY3Rpb25zLmxlbmd0aDsgc3ViU2VjdGlvbisrKSB7XG5cdFx0XHRcdGNvbnN0IGFCbG9ja3MgPSBhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0uZ2V0QmxvY2tzKCk7XG5cblx0XHRcdFx0aWYgKGFCbG9ja3MpIHtcblx0XHRcdFx0XHRmb3IgKGxldCBibG9jayA9IDA7IGJsb2NrIDwgYUJsb2Nrcy5sZW5ndGg7IGJsb2NrKyspIHtcblx0XHRcdFx0XHRcdGxldCBhRm9ybUNvbnRhaW5lcnM7XG5cblx0XHRcdFx0XHRcdGlmIChhQmxvY2tzW2Jsb2NrXS5pc0EoXCJzYXAudWkubGF5b3V0LmZvcm0uRm9ybVwiKSkge1xuXHRcdFx0XHRcdFx0XHRhRm9ybUNvbnRhaW5lcnMgPSBhQmxvY2tzW2Jsb2NrXS5nZXRGb3JtQ29udGFpbmVycygpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0XHRcdFx0YUJsb2Nrc1tibG9ja10uZ2V0Q29udGVudCAmJlxuXHRcdFx0XHRcdFx0XHRhQmxvY2tzW2Jsb2NrXS5nZXRDb250ZW50KCkgJiZcblx0XHRcdFx0XHRcdFx0YUJsb2Nrc1tibG9ja10uZ2V0Q29udGVudCgpLmlzQShcInNhcC51aS5sYXlvdXQuZm9ybS5Gb3JtXCIpXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0YUZvcm1Db250YWluZXJzID0gYUJsb2Nrc1tibG9ja10uZ2V0Q29udGVudCgpLmdldEZvcm1Db250YWluZXJzKCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChhRm9ybUNvbnRhaW5lcnMpIHtcblx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgZm9ybUNvbnRhaW5lciA9IDA7IGZvcm1Db250YWluZXIgPCBhRm9ybUNvbnRhaW5lcnMubGVuZ3RoOyBmb3JtQ29udGFpbmVyKyspIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBhRm9ybUVsZW1lbnRzID0gYUZvcm1Db250YWluZXJzW2Zvcm1Db250YWluZXJdLmdldEZvcm1FbGVtZW50cygpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhRm9ybUVsZW1lbnRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBmb3JtRWxlbWVudCA9IDA7IGZvcm1FbGVtZW50IDwgYUZvcm1FbGVtZW50cy5sZW5ndGg7IGZvcm1FbGVtZW50KyspIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgYUZpZWxkcyA9IGFGb3JtRWxlbWVudHNbZm9ybUVsZW1lbnRdLmdldEZpZWxkcygpO1xuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFRoZSBmaXJzdCBmaWVsZCBpcyBub3QgbmVjZXNzYXJpbHkgYW4gSW5wdXRCYXNlIChlLmcuIGNvdWxkIGJlIGEgVGV4dClcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gU28gd2UgbmVlZCB0byBjaGVjayB3aGV0aGVyIGl0IGhhcyBhIGdldFJlcXVpcmVkIG1ldGhvZFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChhRmllbGRzWzBdLmdldFJlcXVpcmVkICYmIGFGaWVsZHNbMF0uZ2V0UmVxdWlyZWQoKSAmJiAhYUZpZWxkc1swXS5nZXRWYWx1ZSgpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYUZpZWxkc1swXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0TG9nLmRlYnVnKGBFcnJvciB3aGVuIHNlYXJjaGluZyBmb3IgbWFuZGFvdHJ5IGVtcHR5IGZpZWxkOiAke2Vycm9yfWApO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRfdXBkYXRlRm9jdXNJbkVkaXRNb2RlKGFTdWJTZWN0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXG5cdFx0Y29uc3Qgb01hbmRhdG9yeUZpZWxkID0gdGhpcy5fZ2V0Rmlyc3RFbXB0eU1hbmRhdG9yeUZpZWxkRnJvbVN1YlNlY3Rpb24oYVN1YlNlY3Rpb25zKTtcblx0XHRsZXQgb0ZpZWxkVG9Gb2N1czogYW55O1xuXHRcdGlmIChvTWFuZGF0b3J5RmllbGQpIHtcblx0XHRcdG9GaWVsZFRvRm9jdXMgPSBvTWFuZGF0b3J5RmllbGQuY29udGVudC5nZXRDb250ZW50RWRpdCgpWzBdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRmllbGRUb0ZvY3VzID0gKG9PYmplY3RQYWdlIGFzIGFueSkuX2dldEZpcnN0RWRpdGFibGVJbnB1dCgpIHx8IHRoaXMuX2dldEZpcnN0Q2xpY2thYmxlRWxlbWVudChvT2JqZWN0UGFnZSk7XG5cdFx0fVxuXG5cdFx0aWYgKG9GaWVsZFRvRm9jdXMpIHtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvLyBXZSBzZXQgdGhlIGZvY3VzIGluIGEgdGltZWVvdXQsIG90aGVyd2lzZSB0aGUgZm9jdXMgc29tZXRpbWVzIGdvZXMgdG8gdGhlIFRhYkJhclxuXHRcdFx0XHRvRmllbGRUb0ZvY3VzLmZvY3VzKCk7XG5cdFx0XHR9LCAwKTtcblx0XHR9XG5cdH1cblxuXHRfaGFuZGxlU3ViU2VjdGlvbkVudGVyZWRWaWV3UG9ydChvRXZlbnQ6IGFueSkge1xuXHRcdGNvbnN0IG9TdWJTZWN0aW9uID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInN1YlNlY3Rpb25cIik7XG5cdFx0b1N1YlNlY3Rpb24uc2V0QmluZGluZ0NvbnRleHQodW5kZWZpbmVkKTtcblx0fVxuXG5cdF9vbkJhY2tOYXZpZ2F0aW9uSW5EcmFmdChvQ29udGV4dDogYW55KSB7XG5cdFx0dGhpcy5tZXNzYWdlSGFuZGxlci5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRpZiAodGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb3V0ZXJQcm94eSgpLmNoZWNrSWZCYWNrSGFzU2FtZUNvbnRleHQoKSkge1xuXHRcdFx0Ly8gQmFjayBuYXYgd2lsbCBrZWVwIHRoZSBzYW1lIGNvbnRleHQgLS0+IG5vIG5lZWQgdG8gZGlzcGxheSB0aGUgZGlhbG9nXG5cdFx0XHRoaXN0b3J5LmJhY2soKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZHJhZnQucHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24oXG5cdFx0XHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRoaXN0b3J5LmJhY2soKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0RnVuY3Rpb24ucHJvdG90eXBlLFxuXHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0dGhpcyxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGRyYWZ0Lk5hdmlnYXRpb25UeXBlLkJhY2tOYXZpZ2F0aW9uXG5cdFx0XHQpO1xuXHRcdH1cblx0fVxuXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0X29uQWZ0ZXJCaW5kaW5nKGlucHV0QmluZGluZ0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IHZpZXdMZXZlbCA9ICh0aGlzLmdldFZpZXcoKT8uZ2V0Vmlld0RhdGEoKSBhcyBWaWV3RGF0YSk/LnZpZXdMZXZlbDtcblx0XHQvLyB3ZSBhcmUgY2xlYXJpbmcgYW55IHByZXZpb3VzIGRhdGEgZnJvbSByZWNvbW1lbmRhdGlvbnMgZXZlcnkgdGltZSB3ZSBjb21lIHRvIG5ldyBPUFxuXHRcdC8vIHNvIHRoYXQgY2FjaGVkIHJlY29tbWVuZGF0aW9ucyBhcmUgbm90IHNob3duIHRvIHVzZXJcblx0XHRpZiAodmlld0xldmVsICYmIHZpZXdMZXZlbCA9PT0gMSkge1xuXHRcdFx0Y29uc3QgY3VycmVudENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcImludGVybmFsXCIpLmdldFByb3BlcnR5KFwiL2N1cnJlbnRDdHh0XCIpO1xuXHRcdFx0aWYgKGN1cnJlbnRDb250ZXh0ICYmIGN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSAhPT0gaW5wdXRCaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkpIHtcblx0XHRcdFx0dGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKS5zZXRQcm9wZXJ0eShcIi9yZWNvbW1lbmRhdGlvbnNEYXRhXCIsIHt9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdGNvbnN0IGFUYWJsZXMgPSB0aGlzLl9maW5kVGFibGVzKCk7XG5cblx0XHR0aGlzLl9zaWRlRWZmZWN0cy5jbGVhckZpZWxkR3JvdXBzVmFsaWRpdHkoKTtcblxuXHRcdC8vIFRPRE86IHRoaXMgaXMgb25seSBhIHRlbXAgc29sdXRpb24gYXMgbG9uZyBhcyB0aGUgbW9kZWwgZml4IHRoZSBjYWNoZSBpc3N1ZSBhbmQgd2UgdXNlIHRoaXMgYWRkaXRpb25hbFxuXHRcdC8vIGJpbmRpbmcgd2l0aCBvd25SZXF1ZXN0XG5cdFx0Y29uc3QgYmluZGluZ0NvbnRleHQgPSBvT2JqZWN0UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cblx0XHRsZXQgYUlCTkFjdGlvbnM6IGFueVtdID0gW107XG5cdFx0b09iamVjdFBhZ2UuZ2V0U2VjdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvU2VjdGlvbjogYW55KSB7XG5cdFx0XHRvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpLmZvckVhY2goZnVuY3Rpb24gKG9TdWJTZWN0aW9uOiBhbnkpIHtcblx0XHRcdFx0YUlCTkFjdGlvbnMgPSBDb21tb25VdGlscy5nZXRJQk5BY3Rpb25zKG9TdWJTZWN0aW9uLCBhSUJOQWN0aW9ucyk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHRcdC8vIEFzc2lnbiBpbnRlcm5hbCBiaW5kaW5nIGNvbnRleHRzIHRvIG9Gb3JtQ29udGFpbmVyOlxuXHRcdC8vIDEuIEl0IGlzIG5vdCBwb3NzaWJsZSB0byBhc3NpZ24gdGhlIGludGVybmFsIGJpbmRpbmcgY29udGV4dCB0byB0aGUgWE1MIGZyYWdtZW50XG5cdFx0Ly8gKEZvcm1Db250YWluZXIuZnJhZ21lbnQueG1sKSB5ZXQgLSBpdCBpcyB1c2VkIGFscmVhZHkgZm9yIHRoZSBkYXRhLXN0cnVjdHVyZS5cblx0XHQvLyAyLiBBbm90aGVyIHByb2JsZW0gaXMsIHRoYXQgRm9ybUNvbnRhaW5lcnMgYXNzaWduZWQgdG8gYSAnTW9yZUJsb2NrJyBkb2VzIG5vdCBoYXZlIGFuXG5cdFx0Ly8gaW50ZXJuYWwgbW9kZWwgY29udGV4dCBhdCBhbGwuXG5cblx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHRcdGlmIChvSW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dGaWVsZFZhbGlkaXR5XCIsIHt9KTtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dDdXN0b21WYWxpZGl0eVwiLCB7fSk7XG5cblx0XHRcdFx0YUlCTkFjdGlvbnMgPSBDb21tb25VdGlscy5nZXRJQk5BY3Rpb25zKG9UYWJsZSwgYUlCTkFjdGlvbnMpO1xuXG5cdFx0XHRcdC8vIHRlbXBvcmFyeSB3b3JrYXJvdW5kIGZvciBCQ1A6IDIwODAyMTgwMDRcblx0XHRcdFx0Ly8gTmVlZCB0byBmaXggd2l0aCBCTEk6IEZJT1JJVEVDSFAxLTE1Mjc0XG5cdFx0XHRcdC8vIG9ubHkgZm9yIGVkaXQgbW9kZSwgd2UgY2xlYXIgdGhlIHRhYmxlIGNhY2hlXG5cdFx0XHRcdC8vIFdvcmthcm91bmQgc3RhcnRzIGhlcmUhIVxuXHRcdFx0XHRjb25zdCBvVGFibGVSb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdFx0aWYgKG9UYWJsZVJvd0JpbmRpbmcpIHtcblx0XHRcdFx0XHRpZiAoTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKG9UYWJsZVJvd0JpbmRpbmcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSkpIHtcblx0XHRcdFx0XHRcdC8vIGFwcGx5IGZvciBib3RoIGVkaXQgYW5kIGRpc3BsYXkgbW9kZSBpbiBzdGlja3lcblx0XHRcdFx0XHRcdG9UYWJsZVJvd0JpbmRpbmcucmVtb3ZlQ2FjaGVzQW5kTWVzc2FnZXMoXCJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIFdvcmthcm91bmQgZW5kcyBoZXJlISFcblxuXHRcdFx0XHQvLyBDbGVhciB0aGUgc2VsZWN0aW9uIGluIHRoZSB0YWJsZSBhbmQgdXBkYXRlIGFjdGlvbiBlbmFibGVtZW50IGFjY29yZGluZ2x5XG5cdFx0XHRcdC8vIFdpbGwgdG8gYmUgZml4ZWQgd2l0aCBCTEk6IEZJT1JJVEVDSFAxLTI0MzE4XG5cdFx0XHRcdGNvbnN0IG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRcdENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcIm9wZXJhdGlvbkF2YWlsYWJsZU1hcFwiKSlcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnQob0ludGVybmFsTW9kZWxDb250ZXh0LCBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlTWFwLCBbXSwgXCJ0YWJsZVwiKTtcblxuXHRcdFx0XHRvVGFibGUuY2xlYXJTZWxlY3Rpb24oKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRDb21tb25VdGlscy5nZXRTZW1hbnRpY1RhcmdldHNGcm9tUGFnZU1vZGVsKHRoaXMsIFwiX3BhZ2VNb2RlbFwiKTtcblx0XHQvL1JldHJpZXZlIE9iamVjdCBQYWdlIGhlYWRlciBhY3Rpb25zIGZyb20gT2JqZWN0IFBhZ2UgdGl0bGUgY29udHJvbFxuXHRcdGNvbnN0IG9PYmplY3RQYWdlVGl0bGUgPSBvT2JqZWN0UGFnZS5nZXRIZWFkZXJUaXRsZSgpIGFzIE9iamVjdFBhZ2VEeW5hbWljSGVhZGVyVGl0bGU7XG5cdFx0bGV0IGFJQk5IZWFkZXJBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRcdGFJQk5IZWFkZXJBY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0SUJOQWN0aW9ucyhvT2JqZWN0UGFnZVRpdGxlLCBhSUJOSGVhZGVyQWN0aW9ucyk7XG5cdFx0YUlCTkFjdGlvbnMgPSBhSUJOQWN0aW9ucy5jb25jYXQoYUlCTkhlYWRlckFjdGlvbnMpO1xuXHRcdENvbW1vblV0aWxzLnVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5KGFJQk5BY3Rpb25zLCB0aGlzLmdldFZpZXcoKSk7XG5cblx0XHRsZXQgb01vZGVsOiBhbnksIG9GaW5hbFVJU3RhdGU6IGFueTtcblxuXHRcdC8vIHRoaXMgc2hvdWxkIG5vdCBiZSBuZWVkZWQgYXQgdGhlIGFsbFxuXHRcdC8qKlxuXHRcdCAqIEBwYXJhbSBvVGFibGVcblx0XHQgKi9cblx0XHRjb25zdCBoYW5kbGVUYWJsZU1vZGlmaWNhdGlvbnMgPSAob1RhYmxlOiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IG9CaW5kaW5nID0gdGhpcy5fZ2V0VGFibGVCaW5kaW5nKG9UYWJsZSksXG5cdFx0XHRcdGZuSGFuZGxlVGFibGVQYXRjaEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRUYWJsZUhlbHBlci5lbmFibGVGYXN0Q3JlYXRpb25Sb3coXG5cdFx0XHRcdFx0XHRvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKSxcblx0XHRcdFx0XHRcdG9CaW5kaW5nLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdG9CaW5kaW5nLmdldENvbnRleHQoKSxcblx0XHRcdFx0XHRcdG9Nb2RlbCxcblx0XHRcdFx0XHRcdG9GaW5hbFVJU3RhdGVcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRpZiAoIW9CaW5kaW5nKSB7XG5cdFx0XHRcdExvZy5lcnJvcihgRXhwZWN0ZWQgYmluZGluZyBtaXNzaW5nIGZvciB0YWJsZTogJHtvVGFibGUuZ2V0SWQoKX1gKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0JpbmRpbmcub0NvbnRleHQpIHtcblx0XHRcdFx0Zm5IYW5kbGVUYWJsZVBhdGNoRXZlbnRzKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmbkhhbmRsZUNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAob0JpbmRpbmcub0NvbnRleHQpIHtcblx0XHRcdFx0XHRcdGZuSGFuZGxlVGFibGVQYXRjaEV2ZW50cygpO1xuXHRcdFx0XHRcdFx0b0JpbmRpbmcuZGV0YWNoQ2hhbmdlKGZuSGFuZGxlQ2hhbmdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHRcdG9CaW5kaW5nLmF0dGFjaENoYW5nZShmbkhhbmRsZUNoYW5nZSk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChiaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0b01vZGVsID0gYmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKTtcblxuXHRcdFx0Ly8gQ29tcHV0ZSBFZGl0IE1vZGVcblx0XHRcdG9GaW5hbFVJU3RhdGUgPSB0aGlzLmVkaXRGbG93LmNvbXB1dGVFZGl0TW9kZShiaW5kaW5nQ29udGV4dCk7XG5cblx0XHRcdGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChvTW9kZWwuZ2V0TWV0YU1vZGVsKCkpKSB7XG5cdFx0XHRcdG9GaW5hbFVJU3RhdGVcblx0XHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbm5lY3QodGhpcy5nZXRWaWV3KCkpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChpc0Nvbm5lY3RlZCh0aGlzLmdldFZpZXcoKSkpIHtcblx0XHRcdFx0XHRcdFx0ZGlzY29ubmVjdCh0aGlzLmdldFZpZXcoKSk7IC8vIENsZWFudXAgY29sbGFib3JhdGlvbiBjb25uZWN0aW9uIGluIGNhc2Ugd2Ugc3dpdGNoIHRvIGFub3RoZXIgZWxlbWVudCAoZS5nLiBpbiBGQ0wpXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSB3YWl0aW5nIGZvciB0aGUgZmluYWwgVUkgU3RhdGVcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdC8vIHVwZGF0ZSByZWxhdGVkIGFwcHNcblx0XHRcdHRoaXMuX3VwZGF0ZVJlbGF0ZWRBcHBzKCk7XG5cblx0XHRcdC8vQXR0YWNoIHRoZSBwYXRjaCBzZW50IGFuZCBwYXRjaCBjb21wbGV0ZWQgZXZlbnQgdG8gdGhlIG9iamVjdCBwYWdlIGJpbmRpbmcgc28gdGhhdCB3ZSBjYW4gcmVhY3Rcblx0XHRcdGNvbnN0IG9CaW5kaW5nID0gKGJpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcgJiYgYmluZGluZ0NvbnRleHQuZ2V0QmluZGluZygpKSB8fCBiaW5kaW5nQ29udGV4dDtcblxuXHRcdFx0Ly8gQXR0YWNoIHRoZSBldmVudCBoYW5kbGVyIG9ubHkgb25jZSB0byB0aGUgc2FtZSBiaW5kaW5nXG5cdFx0XHRpZiAodGhpcy5jdXJyZW50QmluZGluZyAhPT0gb0JpbmRpbmcpIHtcblx0XHRcdFx0b0JpbmRpbmcuYXR0YWNoRXZlbnQoXCJwYXRjaFNlbnRcIiwge30sIHRoaXMuZWRpdEZsb3cuaGFuZGxlUGF0Y2hTZW50LCB0aGlzKTtcblx0XHRcdFx0dGhpcy5jdXJyZW50QmluZGluZyA9IG9CaW5kaW5nO1xuXHRcdFx0fVxuXG5cdFx0XHRhVGFibGVzLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRcdC8vIGFjY2VzcyBiaW5kaW5nIG9ubHkgYWZ0ZXIgdGFibGUgaXMgYm91bmRcblx0XHRcdFx0VGFibGVVdGlscy53aGVuQm91bmQob1RhYmxlKVxuXHRcdFx0XHRcdC50aGVuKGhhbmRsZVRhYmxlTW9kaWZpY2F0aW9ucylcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSB3YWl0aW5nIGZvciB0aGUgdGFibGUgdG8gYmUgYm91bmRcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBzaG91bGQgYmUgY2FsbGVkIG9ubHkgYWZ0ZXIgYmluZGluZyBpcyByZWFkeSBoZW5jZSBjYWxsaW5nIGl0IGluIG9uQWZ0ZXJCaW5kaW5nXG5cdFx0XHQob09iamVjdFBhZ2UgYXMgYW55KS5fdHJpZ2dlclZpc2libGVTdWJTZWN0aW9uc0V2ZW50cygpO1xuXG5cdFx0XHQvL1RvIENvbXB1dGUgdGhlIEVkaXQgQmluZGluZyBvZiB0aGUgc3ViT2JqZWN0IHBhZ2UgdXNpbmcgcm9vdCBvYmplY3QgcGFnZSwgY3JlYXRlIGEgY29udGV4dCBmb3IgZHJhZnQgcm9vdCBhbmQgdXBkYXRlIHRoZSBlZGl0IGJ1dHRvbiBpbiBzdWIgT1AgdXNpbmcgdGhlIGNvbnRleHRcblx0XHRcdEFjdGlvblJ1bnRpbWUudXBkYXRlRWRpdEJ1dHRvblZpc2liaWxpdHlBbmRFbmFibGVtZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHR9XG5cdFx0dGhpcy5kaXNwbGF5Q29sbGFib3JhdGlvbk1lc3NhZ2UobVBhcmFtZXRlcnM/LnJlZGlyZWN0ZWRUb05vbkRyYWZ0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93IGEgbWVzc2FnZSBzdHJpcCBpZiBhIHJlZGlyZWN0aW9uIHRvIGEgbm9uLWRyYWZ0IGVsZW1lbnQgaGFzIGJlZW4gZG9uZS5cblx0ICogUmVtb3ZlIHRoZSBtZXNzYWdlIHN0cmlwIGluIGNhc2Ugd2UgbmF2aWdhdGUgdG8gYW5vdGhlciBvYmplY3QgcGFnZS5cblx0ICpcblx0ICogQHBhcmFtIGVudGl0eU5hbWUgTmFtZSBvZiB0aGUgRW50aXR5IHRvIGJlIGRpc3BsYXllZCBpbiB0aGUgbWVzc2FnZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZGlzcGxheUNvbGxhYm9yYXRpb25NZXNzYWdlKGVudGl0eU5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IHJlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblxuXHRcdGlmICh0aGlzLmNvbGxhYm9yYXRpb25NZXNzYWdlKSB7XG5cdFx0XHRDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkucmVtb3ZlTWVzc2FnZXMoW3RoaXMuY29sbGFib3JhdGlvbk1lc3NhZ2VdKTtcblx0XHRcdGRlbGV0ZSB0aGlzLmNvbGxhYm9yYXRpb25NZXNzYWdlO1xuXHRcdH1cblxuXHRcdGlmIChlbnRpdHlOYW1lKSB7XG5cdFx0XHR0aGlzLmNvbGxhYm9yYXRpb25NZXNzYWdlID0gbmV3IE1lc3NhZ2Uoe1xuXHRcdFx0XHRtZXNzYWdlOiByZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiUkVST1VURURfTkFWSUdBVElPTl9UT19TQVZFRF9WRVJTSU9OXCIsIFtlbnRpdHlOYW1lXSksXG5cdFx0XHRcdHR5cGU6IFwiSW5mb3JtYXRpb25cIixcblx0XHRcdFx0dGFyZ2V0OiB0aGlzLmdldFZpZXcoKT8uZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpXG5cdFx0XHR9KTtcblx0XHRcdHNhcC51aS5nZXRDb3JlKCkuZ2V0TWVzc2FnZU1hbmFnZXIoKS5hZGRNZXNzYWdlcyhbdGhpcy5jb2xsYWJvcmF0aW9uTWVzc2FnZV0pO1xuXHRcdH1cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25QYWdlUmVhZHkobVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IHNldEZvY3VzID0gKCkgPT4ge1xuXHRcdFx0Ly8gU2V0IHRoZSBmb2N1cyB0byB0aGUgZmlyc3QgYWN0aW9uIGJ1dHRvbiwgb3IgdG8gdGhlIGZpcnN0IGVkaXRhYmxlIGlucHV0IGlmIGluIGVkaXRhYmxlIG1vZGVcblx0XHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRcdGNvbnN0IGlzSW5EaXNwbGF5TW9kZSA9ICF0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIik7XG5cblx0XHRcdGlmIChpc0luRGlzcGxheU1vZGUpIHtcblx0XHRcdFx0Y29uc3Qgb0ZpcnN0Q2xpY2thYmxlRWxlbWVudCA9IHRoaXMuX2dldEZpcnN0Q2xpY2thYmxlRWxlbWVudChvT2JqZWN0UGFnZSk7XG5cdFx0XHRcdGlmIChvRmlyc3RDbGlja2FibGVFbGVtZW50KSB7XG5cdFx0XHRcdFx0b0ZpcnN0Q2xpY2thYmxlRWxlbWVudC5mb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBvU2VsZWN0ZWRTZWN0aW9uOiBhbnkgPSBDb3JlLmJ5SWQob09iamVjdFBhZ2UuZ2V0U2VsZWN0ZWRTZWN0aW9uKCkpO1xuXHRcdFx0XHRpZiAob1NlbGVjdGVkU2VjdGlvbikge1xuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZUZvY3VzSW5FZGl0TW9kZShvU2VsZWN0ZWRTZWN0aW9uLmdldFN1YlNlY3Rpb25zKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBjdHh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHQvLyBzZXR0aW5nIHRoaXMgbW9kZWwgZGF0YSB0byBiZSB1c2VkIGZvciByZWNvbW1lbmRhdGlvbnMgYmluZGluZ1xuXHRcdHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwiaW50ZXJuYWxcIikuc2V0UHJvcGVydHkoXCIvY3VycmVudEN0eHRcIiwgY3R4dCk7XG5cblx0XHQvLyBBcHBseSBhcHAgc3RhdGUgb25seSBhZnRlciB0aGUgcGFnZSBpcyByZWFkeSB3aXRoIHRoZSBmaXJzdCBzZWN0aW9uIHNlbGVjdGVkXG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Ly9TaG93IHBvcHVwIHdoaWxlIG5hdmlnYXRpbmcgYmFjayBmcm9tIG9iamVjdCBwYWdlIGluIGNhc2Ugb2YgZHJhZnRcblx0XHRpZiAob0JpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRjb25zdCBiSXNTdGlja3lNb2RlID0gTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKChvQmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsKS5nZXRNZXRhTW9kZWwoKSk7XG5cdFx0XHRpZiAoIWJJc1N0aWNreU1vZGUpIHtcblx0XHRcdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvVmlldyk7XG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKCgpID0+IHRoaXMuX29uQmFja05hdmlnYXRpb25JbkRyYWZ0KG9CaW5kaW5nQ29udGV4dCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCB2aWV3SWQgPSB0aGlzLmdldFZpZXcoKS5nZXRJZCgpO1xuXHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KClcblx0XHRcdC5nZXRBcHBTdGF0ZUhhbmRsZXIoKVxuXHRcdFx0LmFwcGx5QXBwU3RhdGUodmlld0lkLCB0aGlzLmdldFZpZXcoKSlcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmZvcmNlRm9jdXMpIHtcblx0XHRcdFx0XHRzZXRGb2N1cygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChFcnJvcikge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBzZXR0aW5nIHRoZSBmb2N1c1wiLCBFcnJvcik7XG5cdFx0XHR9KTtcblxuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImVycm9yTmF2aWdhdGlvblNlY3Rpb25GbGFnXCIsIGZhbHNlKTtcblx0XHR0aGlzLl9jaGVja0RhdGFQb2ludFRpdGxlRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBzdGF0dXMgb2YgZWRpdCBtb2RlIGZvciBzdGlja3kgc2Vzc2lvbi5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHN0YXR1cyBvZiBlZGl0IG1vZGUgZm9yIHN0aWNreSBzZXNzaW9uXG5cdCAqL1xuXHRnZXRTdGlja3lFZGl0TW9kZSgpIHtcblx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCAmJiAodGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KTtcblx0XHRsZXQgYklzU3RpY2t5RWRpdE1vZGUgPSBmYWxzZTtcblx0XHRpZiAob0JpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRjb25zdCBiSXNTdGlja3lNb2RlID0gTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpKTtcblx0XHRcdGlmIChiSXNTdGlja3lNb2RlKSB7XG5cdFx0XHRcdGJJc1N0aWNreUVkaXRNb2RlID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gYklzU3RpY2t5RWRpdE1vZGU7XG5cdH1cblxuXHRfZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKSB7XG5cdFx0cmV0dXJuIHRoaXMuYnlJZChcImZlOjpPYmplY3RQYWdlXCIpIGFzIE9iamVjdFBhZ2VMYXlvdXQ7XG5cdH1cblxuXHRfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKSB7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlU3VidGl0bGUgPSBvT2JqZWN0UGFnZS5nZXRDdXN0b21EYXRhKCkuZmluZChmdW5jdGlvbiAob0N1c3RvbURhdGE6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9DdXN0b21EYXRhLmdldEtleSgpID09PSBcIk9iamVjdFBhZ2VTdWJ0aXRsZVwiO1xuXHRcdH0pO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0aXRsZTogb09iamVjdFBhZ2UuZGF0YShcIk9iamVjdFBhZ2VUaXRsZVwiKSB8fCBcIlwiLFxuXHRcdFx0c3VidGl0bGU6IG9PYmplY3RQYWdlU3VidGl0bGUgJiYgb09iamVjdFBhZ2VTdWJ0aXRsZS5nZXRWYWx1ZSgpLFxuXHRcdFx0aW50ZW50OiBcIlwiLFxuXHRcdFx0aWNvbjogXCJcIlxuXHRcdH07XG5cdH1cblxuXHRfZXhlY3V0ZUhlYWRlclNob3J0Y3V0KHNJZDogYW55KSB7XG5cdFx0Y29uc3Qgc0J1dHRvbklkID0gYCR7dGhpcy5nZXRWaWV3KCkuZ2V0SWQoKX0tLSR7c0lkfWAsXG5cdFx0XHRvQnV0dG9uID0gKHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkuZ2V0SGVhZGVyVGl0bGUoKSBhcyBPYmplY3RQYWdlRHluYW1pY0hlYWRlclRpdGxlKVxuXHRcdFx0XHQuZ2V0QWN0aW9ucygpXG5cdFx0XHRcdC5maW5kKGZ1bmN0aW9uIChvRWxlbWVudDogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9FbGVtZW50LmdldElkKCkgPT09IHNCdXR0b25JZDtcblx0XHRcdFx0fSk7XG5cdFx0aWYgKG9CdXR0b24pIHtcblx0XHRcdENvbW1vblV0aWxzLmZpcmVCdXR0b25QcmVzcyhvQnV0dG9uKTtcblx0XHR9XG5cdH1cblxuXHRfZXhlY3V0ZUZvb3RlclNob3J0Y3V0KHNJZDogYW55KSB7XG5cdFx0Y29uc3Qgc0J1dHRvbklkID0gYCR7dGhpcy5nZXRWaWV3KCkuZ2V0SWQoKX0tLSR7c0lkfWAsXG5cdFx0XHRvQnV0dG9uID0gKHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCkuZ2V0Rm9vdGVyKCkgYXMgYW55KS5nZXRDb250ZW50KCkuZmluZChmdW5jdGlvbiAob0VsZW1lbnQ6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0VsZW1lbnQuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkgPT09IFwic2FwLm0uQnV0dG9uXCIgJiYgb0VsZW1lbnQuZ2V0SWQoKSA9PT0gc0J1dHRvbklkO1xuXHRcdFx0fSk7XG5cdFx0Q29tbW9uVXRpbHMuZmlyZUJ1dHRvblByZXNzKG9CdXR0b24pO1xuXHR9XG5cblx0X2V4ZWN1dGVUYWJTaG9ydEN1dChvRXhlY3V0aW9uOiBhbnkpIHtcblx0XHRjb25zdCBvT2JqZWN0UGFnZSA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXRDb250cm9sKCksXG5cdFx0XHRhU2VjdGlvbnMgPSBvT2JqZWN0UGFnZS5nZXRTZWN0aW9ucygpLFxuXHRcdFx0aVNlY3Rpb25JbmRleE1heCA9IGFTZWN0aW9ucy5sZW5ndGggLSAxLFxuXHRcdFx0c0NvbW1hbmQgPSBvRXhlY3V0aW9uLm9Tb3VyY2UuZ2V0Q29tbWFuZCgpO1xuXHRcdGxldCBuZXdTZWN0aW9uLFxuXHRcdFx0aVNlbGVjdGVkU2VjdGlvbkluZGV4ID0gb09iamVjdFBhZ2UuaW5kZXhPZlNlY3Rpb24odGhpcy5ieUlkKG9PYmplY3RQYWdlLmdldFNlbGVjdGVkU2VjdGlvbigpKSBhcyBPYmplY3RQYWdlU2VjdGlvbik7XG5cdFx0aWYgKGlTZWxlY3RlZFNlY3Rpb25JbmRleCAhPT0gLTEgJiYgaVNlY3Rpb25JbmRleE1heCA+IDApIHtcblx0XHRcdGlmIChzQ29tbWFuZCA9PT0gXCJOZXh0VGFiXCIpIHtcblx0XHRcdFx0aWYgKGlTZWxlY3RlZFNlY3Rpb25JbmRleCA8PSBpU2VjdGlvbkluZGV4TWF4IC0gMSkge1xuXHRcdFx0XHRcdG5ld1NlY3Rpb24gPSBhU2VjdGlvbnNbKytpU2VsZWN0ZWRTZWN0aW9uSW5kZXhdO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGlTZWxlY3RlZFNlY3Rpb25JbmRleCAhPT0gMCkge1xuXHRcdFx0XHQvLyBQcmV2aW91c1RhYlxuXHRcdFx0XHRuZXdTZWN0aW9uID0gYVNlY3Rpb25zWy0taVNlbGVjdGVkU2VjdGlvbkluZGV4XTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG5ld1NlY3Rpb24pIHtcblx0XHRcdFx0b09iamVjdFBhZ2Uuc2V0U2VsZWN0ZWRTZWN0aW9uKG5ld1NlY3Rpb24pO1xuXHRcdFx0XHRuZXdTZWN0aW9uLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2dldEZvb3RlclZpc2liaWxpdHkoKSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRjb25zdCBzVmlld0lkID0gdGhpcy5nZXRWaWV3KCkuZ2V0SWQoKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJtZXNzYWdlRm9vdGVyQ29udGFpbnNFcnJvcnNcIiwgZmFsc2UpO1xuXHRcdHNhcC51aVxuXHRcdFx0LmdldENvcmUoKVxuXHRcdFx0LmdldE1lc3NhZ2VNYW5hZ2VyKClcblx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0LmdldERhdGEoKVxuXHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG9NZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9NZXNzYWdlLnZhbGlkYXRpb24gJiYgb01lc3NhZ2UudHlwZSA9PT0gXCJFcnJvclwiICYmIG9NZXNzYWdlLnRhcmdldC5pbmRleE9mKHNWaWV3SWQpID4gLTEpIHtcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJtZXNzYWdlRm9vdGVyQ29udGFpbnNFcnJvcnNcIiwgdHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHR9XG5cblx0X3Nob3dNZXNzYWdlUG9wb3ZlcihlcnI/OiBhbnksIG9SZXQ/OiBhbnkpIHtcblx0XHRpZiAoZXJyKSB7XG5cdFx0XHRMb2cuZXJyb3IoZXJyKTtcblx0XHR9XG5cdFx0Y29uc3Qgcm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb290Vmlld0NvbnRyb2xsZXIoKSBhcyBhbnk7XG5cdFx0Y29uc3QgY3VycmVudFBhZ2VWaWV3ID0gcm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpXG5cdFx0XHQ/IHJvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RWaWV3KClcblx0XHRcdDogKHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um9vdENvbnRhaW5lcigpIGFzIGFueSkuZ2V0Q3VycmVudFBhZ2UoKTtcblx0XHRpZiAoIWN1cnJlbnRQYWdlVmlldy5pc0EoXCJzYXAubS5NZXNzYWdlUGFnZVwiKSkge1xuXHRcdFx0Y29uc3Qgb01lc3NhZ2VCdXR0b24gPSB0aGlzLm1lc3NhZ2VCdXR0b24sXG5cdFx0XHRcdG9NZXNzYWdlUG9wb3ZlciA9IG9NZXNzYWdlQnV0dG9uLm9NZXNzYWdlUG9wb3Zlcixcblx0XHRcdFx0b0l0ZW1CaW5kaW5nID0gb01lc3NhZ2VQb3BvdmVyLmdldEJpbmRpbmcoXCJpdGVtc1wiKTtcblxuXHRcdFx0aWYgKG9JdGVtQmluZGluZy5nZXRMZW5ndGgoKSA+IDAgJiYgIW9NZXNzYWdlUG9wb3Zlci5pc09wZW4oKSkge1xuXHRcdFx0XHRvTWVzc2FnZUJ1dHRvbi5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdFx0XHQvLyB3b3JrYXJvdW5kIHRvIGVuc3VyZSB0aGF0IG9NZXNzYWdlQnV0dG9uIGlzIHJlbmRlcmVkIHdoZW4gb3BlbkJ5IGlzIGNhbGxlZFxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRvTWVzc2FnZVBvcG92ZXIub3BlbkJ5KG9NZXNzYWdlQnV0dG9uKTtcblx0XHRcdFx0fSwgMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvUmV0O1xuXHR9XG5cblx0X2VkaXREb2N1bWVudChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKTtcblx0XHRCdXN5TG9ja2VyLmxvY2sob01vZGVsKTtcblx0XHRyZXR1cm4gdGhpcy5lZGl0Rmxvdy5lZGl0RG9jdW1lbnQuYXBwbHkodGhpcy5lZGl0RmxvdywgW29Db250ZXh0XSkuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvTW9kZWwpO1xuXHRcdH0pO1xuXHR9XG5cblx0YXN5bmMgX3ZhbGlkYXRlRG9jdW1lbnQoKTogUHJvbWlzZTx2b2lkIHwgYW55W10gfCBPRGF0YUNvbnRleHRCaW5kaW5nPiB7XG5cdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKTtcblx0XHRjb25zdCBjb250cm9sID0gQ29yZS5ieUlkKENvcmUuZ2V0Q3VycmVudEZvY3VzZWRDb250cm9sSWQoKSk7XG5cdFx0Y29uc3QgY29udGV4dCA9IGNvbnRyb2w/LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0XHRpZiAoY29udGV4dCAmJiAhY29udGV4dC5pc1RyYW5zaWVudCgpKSB7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0c1NlcnZpY2UgPSBhcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0XHRjb25zdCBlbnRpdHlUeXBlID0gc2lkZUVmZmVjdHNTZXJ2aWNlLmdldEVudGl0eVR5cGVGcm9tQ29udGV4dChjb250ZXh0KTtcblx0XHRcdGNvbnN0IGdsb2JhbFNpZGVFZmZlY3RzID0gZW50aXR5VHlwZSA/IHNpZGVFZmZlY3RzU2VydmljZS5nZXRHbG9iYWxPRGF0YUVudGl0eVNpZGVFZmZlY3RzKGVudGl0eVR5cGUpIDogW107XG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgZ2xvYmFsIFNpZGVFZmZlY3RzIGZvciB0aGUgcmVsYXRlZCBlbnRpdHksIGV4ZWN1dGUgaXQvdGhlbVxuXHRcdFx0aWYgKGdsb2JhbFNpZGVFZmZlY3RzLmxlbmd0aCkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmVkaXRGbG93LnN5bmNUYXNrKCk7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmFsbChnbG9iYWxTaWRlRWZmZWN0cy5tYXAoKHNpZGVFZmZlY3RzKSA9PiB0aGlzLl9zaWRlRWZmZWN0cy5yZXF1ZXN0U2lkZUVmZmVjdHMoc2lkZUVmZmVjdHMsIGNvbnRleHQpKSk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBkcmFmdFJvb3RDb250ZXh0ID0gKGF3YWl0IENvbW1vblV0aWxzLmNyZWF0ZVJvb3RDb250ZXh0KFByb2dyYW1taW5nTW9kZWwuRHJhZnQsIHRoaXMuZ2V0VmlldygpLCBhcHBDb21wb25lbnQpKSBhcyBDb250ZXh0O1xuXHRcdFx0Ly9FeGVjdXRlIHRoZSBkcmFmdFZhbGlkYXRpb24gaWYgdGhlcmUgaXMgbm8gZ2xvYmFsU2lkZUVmZmVjdHMgKGlnbm9yZSBFVGFncyBpbiBjb2xsYWJvcmF0aW9uIGRyYWZ0KVxuXHRcdFx0aWYgKGRyYWZ0Um9vdENvbnRleHQpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5lZGl0Rmxvdy5zeW5jVGFzaygpO1xuXHRcdFx0XHRyZXR1cm4gZHJhZnQuZXhlY3V0ZURyYWZ0VmFsaWRhdGlvbihkcmFmdFJvb3RDb250ZXh0LCBhcHBDb21wb25lbnQsIGlzQ29ubmVjdGVkKHRoaXMuZ2V0VmlldygpKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRhc3luYyBfc2F2ZURvY3VtZW50KG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLmdldFZpZXcoKS5nZXRNb2RlbChcInVpXCIpLFxuXHRcdFx0YVdhaXRDcmVhdGVEb2N1bWVudHM6IGFueVtdID0gW107XG5cdFx0Ly8gaW5kaWNhdGVzIGlmIHdlIGFyZSBjcmVhdGluZyBhIG5ldyByb3cgaW4gdGhlIE9QXG5cdFx0bGV0IGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yID0gZmFsc2U7XG5cdFx0QnVzeUxvY2tlci5sb2NrKG9Nb2RlbCk7XG5cdFx0dGhpcy5fZmluZFRhYmxlcygpLmZvckVhY2goKG9UYWJsZTogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvQmluZGluZyA9IHRoaXMuX2dldFRhYmxlQmluZGluZyhvVGFibGUpO1xuXHRcdFx0Y29uc3QgbVBhcmFtZXRlcnM6IGFueSA9IHtcblx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBvVGFibGUuZGF0YShcImNyZWF0aW9uTW9kZVwiKSxcblx0XHRcdFx0Y3JlYXRpb25Sb3c6IG9UYWJsZS5nZXRDcmVhdGlvblJvdygpLFxuXHRcdFx0XHRjcmVhdGVBdEVuZDogb1RhYmxlLmRhdGEoXCJjcmVhdGVBdEVuZFwiKSA9PT0gXCJ0cnVlXCJcblx0XHRcdH07XG5cdFx0XHRjb25zdCBiQ3JlYXRlRG9jdW1lbnQgPVxuXHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGlvblJvdyAmJlxuXHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGlvblJvdy5nZXRCaW5kaW5nQ29udGV4dCgpICYmXG5cdFx0XHRcdE9iamVjdC5rZXlzKG1QYXJhbWV0ZXJzLmNyZWF0aW9uUm93LmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0T2JqZWN0KCkpLmxlbmd0aCA+IDE7XG5cdFx0XHRpZiAoYkNyZWF0ZURvY3VtZW50KSB7XG5cdFx0XHRcdC8vIHRoZSBiU2tpcFNpZGVFZmZlY3RzIGlzIGEgcGFyYW1ldGVyIGNyZWF0ZWQgd2hlbiB3ZSBjbGljayB0aGUgc2F2ZSBrZXkuIElmIHdlIHByZXNzIHRoaXMga2V5XG5cdFx0XHRcdC8vIHdlIGRvbid0IGV4ZWN1dGUgdGhlIGhhbmRsZVNpZGVFZmZlY3RzIGZ1bmNpdG9uIHRvIGF2b2lkIGJhdGNoIHJlZHVuZGFuY3lcblx0XHRcdFx0bVBhcmFtZXRlcnMuYlNraXBTaWRlRWZmZWN0cyA9IHRydWU7XG5cdFx0XHRcdGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yID0gdHJ1ZTtcblx0XHRcdFx0YVdhaXRDcmVhdGVEb2N1bWVudHMucHVzaChcblx0XHRcdFx0XHR0aGlzLmVkaXRGbG93LmNyZWF0ZURvY3VtZW50KG9CaW5kaW5nLCBtUGFyYW1ldGVycykudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0JpbmRpbmc7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBhQmluZGluZ3MgPSBhd2FpdCBQcm9taXNlLmFsbChhV2FpdENyZWF0ZURvY3VtZW50cyk7XG5cdFx0XHRjb25zdCBtUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0YkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3I6IGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yLFxuXHRcdFx0XHRiaW5kaW5nczogYUJpbmRpbmdzXG5cdFx0XHR9O1xuXHRcdFx0Ly8gV2UgbmVlZCB0byBlaXRoZXIgcmVqZWN0IG9yIHJlc29sdmUgYSBwcm9taXNlIGhlcmUgYW5kIHJldHVybiBpdCBzaW5jZSB0aGlzIHNhdmVcblx0XHRcdC8vIGZ1bmN0aW9uIGlzIG5vdCBvbmx5IGNhbGxlZCB3aGVuIHByZXNzaW5nIHRoZSBzYXZlIGJ1dHRvbiBpbiB0aGUgZm9vdGVyLCBidXQgYWxzb1xuXHRcdFx0Ly8gd2hlbiB0aGUgdXNlciBzZWxlY3RzIGNyZWF0ZSBvciBzYXZlIGluIGEgZGF0YWxvc3MgcG9wdXAuXG5cdFx0XHQvLyBUaGUgbG9naWMgb2YgdGhlIGRhdGFsb3NzIHBvcHVwIG5lZWRzIHRvIGRldGVjdCBpZiB0aGUgc2F2ZSBoYWQgZXJyb3JzIG9yIG5vdCBpbiBvcmRlclxuXHRcdFx0Ly8gdG8gZGVjaWRlIGlmIHRoZSBzdWJzZXF1ZW50IGFjdGlvbiAtIGxpa2UgYSBiYWNrIG5hdmlnYXRpb24gLSBoYXMgdG8gYmUgZXhlY3V0ZWQgb3Igbm90LlxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXdhaXQgdGhpcy5lZGl0Rmxvdy5zYXZlRG9jdW1lbnQob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdFx0Ly8gSWYgdGhlIHNhdmVEb2N1bWVudCBpbiBlZGl0RmxvdyByZXR1cm5zIGVycm9ycyB3ZSBuZWVkXG5cdFx0XHRcdC8vIHRvIHNob3cgdGhlIG1lc3NhZ2UgcG9wb3ZlciBoZXJlIGFuZCBlbnN1cmUgdGhhdCB0aGVcblx0XHRcdFx0Ly8gZGF0YWxvc3MgbG9naWMgZG9lcyBub3QgcGVyZm9ybSB0aGUgZm9sbG93IHVwIGZ1bmN0aW9uXG5cdFx0XHRcdC8vIGxpa2UgZS5nLiBhIGJhY2sgbmF2aWdhdGlvbiBoZW5jZSB3ZSByZXR1cm4gYSBwcm9taXNlIGFuZCByZWplY3QgaXRcblx0XHRcdFx0dGhpcy5fc2hvd01lc3NhZ2VQb3BvdmVyKGVycm9yKTtcblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKG9Nb2RlbCkpIHtcblx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob01vZGVsKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfY2FuY2VsRG9jdW1lbnQob0NvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdG1QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbiA9IHRoaXMuZ2V0VmlldygpLmJ5SWQobVBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uKTsgLy90byBnZXQgdGhlIHJlZmVyZW5jZSBvZiB0aGUgY2FuY2VsIGJ1dHRvbiBmcm9tIGNvbW1hbmQgZXhlY3V0aW9uXG5cdFx0cmV0dXJuIHRoaXMuZWRpdEZsb3cuY2FuY2VsRG9jdW1lbnQob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0fVxuXG5cdF9hcHBseURvY3VtZW50KG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0cmV0dXJuIHRoaXMuZWRpdEZsb3cuYXBwbHlEb2N1bWVudChvQ29udGV4dCkuY2F0Y2goKCkgPT4gdGhpcy5fc2hvd01lc3NhZ2VQb3BvdmVyKCkpO1xuXHR9XG5cblx0X3VwZGF0ZVJlbGF0ZWRBcHBzKCkge1xuXHRcdGNvbnN0IG9PYmplY3RQYWdlID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dENvbnRyb2woKTtcblx0XHRjb25zdCBzaG93UmVsYXRlZEFwcHMgPSBvT2JqZWN0UGFnZS5kYXRhKFwic2hvd1JlbGF0ZWRBcHBzXCIpO1xuXHRcdGlmIChzaG93UmVsYXRlZEFwcHMgPT09IFwidHJ1ZVwiIHx8IHNob3dSZWxhdGVkQXBwcyA9PT0gdHJ1ZSkge1xuXHRcdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHRcdENvbW1vblV0aWxzLnVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlscyhvT2JqZWN0UGFnZSwgYXBwQ29tcG9uZW50KTtcblx0XHR9XG5cdH1cblxuXHRfZmluZENvbnRyb2xJblN1YlNlY3Rpb24oYVBhcmVudEVsZW1lbnQ6IGFueSwgYVN1YnNlY3Rpb246IGFueSwgYUNvbnRyb2xzOiBhbnksIGJJc0NoYXJ0PzogYm9vbGVhbikge1xuXHRcdGZvciAobGV0IGVsZW1lbnQgPSAwOyBlbGVtZW50IDwgYVBhcmVudEVsZW1lbnQubGVuZ3RoOyBlbGVtZW50KyspIHtcblx0XHRcdGxldCBvRWxlbWVudCA9IGFQYXJlbnRFbGVtZW50W2VsZW1lbnRdLmdldENvbnRlbnQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBhUGFyZW50RWxlbWVudFtlbGVtZW50XS5nZXRDb250ZW50KCk7XG5cdFx0XHRpZiAoYklzQ2hhcnQpIHtcblx0XHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50Lm1BZ2dyZWdhdGlvbnMgJiYgb0VsZW1lbnQuZ2V0QWdncmVnYXRpb24oXCJpdGVtc1wiKSkge1xuXHRcdFx0XHRcdGNvbnN0IGFJdGVtcyA9IG9FbGVtZW50LmdldEFnZ3JlZ2F0aW9uKFwiaXRlbXNcIik7XG5cdFx0XHRcdFx0YUl0ZW1zLmZvckVhY2goZnVuY3Rpb24gKG9JdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChvSXRlbS5pc0EoXCJzYXAuZmUubWFjcm9zLmNoYXJ0LkNoYXJ0QVBJXCIpKSB7XG5cdFx0XHRcdFx0XHRcdG9FbGVtZW50ID0gb0l0ZW07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5pc0EgJiYgb0VsZW1lbnQuaXNBKFwic2FwLnVpLmxheW91dC5EeW5hbWljU2lkZUNvbnRlbnRcIikpIHtcblx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudC5nZXRNYWluQ29udGVudCBpbnN0YW5jZW9mIEZ1bmN0aW9uICYmIG9FbGVtZW50LmdldE1haW5Db250ZW50KCk7XG5cdFx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudFswXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gVGhlIHRhYmxlIG1heSBjdXJyZW50bHkgYmUgc2hvd24gaW4gYSBmdWxsIHNjcmVlbiBkaWFsb2csIHdlIGNhbiB0aGVuIGdldCB0aGUgcmVmZXJlbmNlIHRvIHRoZSBUYWJsZUFQSVxuXHRcdFx0Ly8gY29udHJvbCBmcm9tIHRoZSBjdXN0b20gZGF0YSBvZiB0aGUgcGxhY2UgaG9sZGVyIHBhbmVsXG5cdFx0XHRpZiAob0VsZW1lbnQgJiYgb0VsZW1lbnQuaXNBICYmIG9FbGVtZW50LmlzQShcInNhcC5tLlBhbmVsXCIpICYmIG9FbGVtZW50LmRhdGEoXCJGdWxsU2NyZWVuVGFibGVQbGFjZUhvbGRlclwiKSkge1xuXHRcdFx0XHRvRWxlbWVudCA9IG9FbGVtZW50LmRhdGEoXCJ0YWJsZUFQSXJlZmVyZW5jZVwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5pc0EgJiYgb0VsZW1lbnQuaXNBKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5UYWJsZUFQSVwiKSkge1xuXHRcdFx0XHRvRWxlbWVudCA9IG9FbGVtZW50LmdldENvbnRlbnQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBvRWxlbWVudC5nZXRDb250ZW50KCk7XG5cdFx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudFswXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50LmlzQSAmJiBvRWxlbWVudC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpKSB7XG5cdFx0XHRcdGFDb250cm9scy5wdXNoKG9FbGVtZW50KTtcblx0XHRcdH1cblx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5pc0EgJiYgb0VsZW1lbnQuaXNBKFwic2FwLmZlLm1hY3Jvcy5jaGFydC5DaGFydEFQSVwiKSkge1xuXHRcdFx0XHRvRWxlbWVudCA9IG9FbGVtZW50LmdldENvbnRlbnQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBvRWxlbWVudC5nZXRDb250ZW50KCk7XG5cdFx0XHRcdGlmIChvRWxlbWVudCAmJiBvRWxlbWVudC5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0b0VsZW1lbnQgPSBvRWxlbWVudFswXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG9FbGVtZW50ICYmIG9FbGVtZW50LmlzQSAmJiBvRWxlbWVudC5pc0EoXCJzYXAudWkubWRjLkNoYXJ0XCIpKSB7XG5cdFx0XHRcdGFDb250cm9scy5wdXNoKG9FbGVtZW50KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfZ2V0QWxsU3ViU2VjdGlvbnMoKSB7XG5cdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSB0aGlzLl9nZXRPYmplY3RQYWdlTGF5b3V0Q29udHJvbCgpO1xuXHRcdGxldCBhU3ViU2VjdGlvbnM6IGFueVtdID0gW107XG5cdFx0b09iamVjdFBhZ2UuZ2V0U2VjdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvU2VjdGlvbjogYW55KSB7XG5cdFx0XHRhU3ViU2VjdGlvbnMgPSBhU3ViU2VjdGlvbnMuY29uY2F0KG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKCkpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBhU3ViU2VjdGlvbnM7XG5cdH1cblxuXHRfZ2V0QWxsQmxvY2tzKCkge1xuXHRcdGxldCBhQmxvY2tzOiBhbnlbXSA9IFtdO1xuXHRcdHRoaXMuX2dldEFsbFN1YlNlY3Rpb25zKCkuZm9yRWFjaChmdW5jdGlvbiAob1N1YlNlY3Rpb246IGFueSkge1xuXHRcdFx0YUJsb2NrcyA9IGFCbG9ja3MuY29uY2F0KG9TdWJTZWN0aW9uLmdldEJsb2NrcygpKTtcblx0XHR9KTtcblx0XHRyZXR1cm4gYUJsb2Nrcztcblx0fVxuXG5cdF9maW5kVGFibGVzKCkge1xuXHRcdGNvbnN0IGFTdWJTZWN0aW9ucyA9IHRoaXMuX2dldEFsbFN1YlNlY3Rpb25zKCk7XG5cdFx0Y29uc3QgYVRhYmxlczogYW55W10gPSBbXTtcblx0XHRmb3IgKGxldCBzdWJTZWN0aW9uID0gMDsgc3ViU2VjdGlvbiA8IGFTdWJTZWN0aW9ucy5sZW5ndGg7IHN1YlNlY3Rpb24rKykge1xuXHRcdFx0dGhpcy5fZmluZENvbnRyb2xJblN1YlNlY3Rpb24oYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLmdldEJsb2NrcygpLCBhU3ViU2VjdGlvbnNbc3ViU2VjdGlvbl0sIGFUYWJsZXMpO1xuXHRcdFx0dGhpcy5fZmluZENvbnRyb2xJblN1YlNlY3Rpb24oYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLmdldE1vcmVCbG9ja3MoKSwgYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLCBhVGFibGVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIGFUYWJsZXM7XG5cdH1cblxuXHRfZmluZENoYXJ0cygpIHtcblx0XHRjb25zdCBhU3ViU2VjdGlvbnMgPSB0aGlzLl9nZXRBbGxTdWJTZWN0aW9ucygpO1xuXHRcdGNvbnN0IGFDaGFydHM6IGFueVtdID0gW107XG5cdFx0Zm9yIChsZXQgc3ViU2VjdGlvbiA9IDA7IHN1YlNlY3Rpb24gPCBhU3ViU2VjdGlvbnMubGVuZ3RoOyBzdWJTZWN0aW9uKyspIHtcblx0XHRcdHRoaXMuX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uKGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXS5nZXRCbG9ja3MoKSwgYVN1YlNlY3Rpb25zW3N1YlNlY3Rpb25dLCBhQ2hhcnRzLCB0cnVlKTtcblx0XHRcdHRoaXMuX2ZpbmRDb250cm9sSW5TdWJTZWN0aW9uKGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXS5nZXRNb3JlQmxvY2tzKCksIGFTdWJTZWN0aW9uc1tzdWJTZWN0aW9uXSwgYUNoYXJ0cywgdHJ1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiBhQ2hhcnRzO1xuXHR9XG5cblx0X2Nsb3NlU2lkZUNvbnRlbnQoKSB7XG5cdFx0dGhpcy5fZ2V0QWxsQmxvY2tzKCkuZm9yRWFjaChmdW5jdGlvbiAob0Jsb2NrOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db250ZW50ID0gb0Jsb2NrLmdldENvbnRlbnQgaW5zdGFuY2VvZiBGdW5jdGlvbiAmJiBvQmxvY2suZ2V0Q29udGVudCgpO1xuXHRcdFx0aWYgKG9Db250ZW50ICYmIG9Db250ZW50LmlzQSAmJiBvQ29udGVudC5pc0EoXCJzYXAudWkubGF5b3V0LkR5bmFtaWNTaWRlQ29udGVudFwiKSkge1xuXHRcdFx0XHRpZiAob0NvbnRlbnQuc2V0U2hvd1NpZGVDb250ZW50IGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRvQ29udGVudC5zZXRTaG93U2lkZUNvbnRlbnQoZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhcnQgQ29udGV4dCBpcyByZXNvbHZlZCBmb3IgMTpuIG1pY3JvY2hhcnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NoYXJ0Q29udGV4dCBUaGUgQ29udGV4dCBvZiB0aGUgTWljcm9DaGFydFxuXHQgKiBAcGFyYW0gc0NoYXJ0UGF0aCBUaGUgY29sbGVjdGlvblBhdGggb2YgdGhlIHRoZSBjaGFydFxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBBdHRyaWJ1dGVzIG9mIHRoZSBjaGFydCBDb250ZXh0XG5cdCAqL1xuXHRfZ2V0Q2hhcnRDb250ZXh0RGF0YShvQ2hhcnRDb250ZXh0OiBhbnksIHNDaGFydFBhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IG9Db250ZXh0RGF0YSA9IG9DaGFydENvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0bGV0IG9DaGFydENvbnRleHREYXRhID0gW29Db250ZXh0RGF0YV07XG5cdFx0aWYgKG9DaGFydENvbnRleHQgJiYgc0NoYXJ0UGF0aCkge1xuXHRcdFx0aWYgKG9Db250ZXh0RGF0YVtzQ2hhcnRQYXRoXSkge1xuXHRcdFx0XHRvQ2hhcnRDb250ZXh0RGF0YSA9IG9Db250ZXh0RGF0YVtzQ2hhcnRQYXRoXTtcblx0XHRcdFx0ZGVsZXRlIG9Db250ZXh0RGF0YVtzQ2hhcnRQYXRoXTtcblx0XHRcdFx0b0NoYXJ0Q29udGV4dERhdGEucHVzaChvQ29udGV4dERhdGEpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb0NoYXJ0Q29udGV4dERhdGE7XG5cdH1cblxuXHQvKipcblx0ICogU2Nyb2xsIHRoZSB0YWJsZXMgdG8gdGhlIHJvdyB3aXRoIHRoZSBzUGF0aFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLk9iamVjdFBhZ2VDb250cm9sbGVyLmNvbnRyb2xsZXIjX3Njcm9sbFRhYmxlc1RvUm93XG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzUm93UGF0aCAnc1BhdGggb2YgdGhlIHRhYmxlIHJvdydcblx0ICovXG5cblx0X3Njcm9sbFRhYmxlc1RvUm93KHNSb3dQYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAodGhpcy5fZmluZFRhYmxlcyAmJiB0aGlzLl9maW5kVGFibGVzKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3QgYVRhYmxlcyA9IHRoaXMuX2ZpbmRUYWJsZXMoKTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVRhYmxlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRUYWJsZVNjcm9sbGVyLnNjcm9sbFRhYmxlVG9Sb3coYVRhYmxlc1tpXSwgc1Jvd1BhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gbWVyZ2Ugc2VsZWN0ZWQgY29udGV4dHMgYW5kIGZpbHRlcnMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfbWVyZ2VNdWx0aXBsZUNvbnRleHRzXG5cdCAqIEBwYXJhbSBvUGFnZUNvbnRleHQgUGFnZSBjb250ZXh0XG5cdCAqIEBwYXJhbSBhTGluZUNvbnRleHQgU2VsZWN0ZWQgQ29udGV4dHNcblx0ICogQHBhcmFtIHNDaGFydFBhdGggQ29sbGVjdGlvbiBuYW1lIG9mIHRoZSBjaGFydFxuXHQgKiBAcmV0dXJucyBTZWxlY3Rpb24gVmFyaWFudCBPYmplY3Rcblx0ICovXG5cdF9tZXJnZU11bHRpcGxlQ29udGV4dHMob1BhZ2VDb250ZXh0OiBDb250ZXh0LCBhTGluZUNvbnRleHQ6IGFueVtdLCBzQ2hhcnRQYXRoOiBzdHJpbmcpIHtcblx0XHRsZXQgYUF0dHJpYnV0ZXM6IGFueVtdID0gW10sXG5cdFx0XHRhUGFnZUF0dHJpYnV0ZXMgPSBbXSxcblx0XHRcdG9Db250ZXh0LFxuXHRcdFx0c01ldGFQYXRoTGluZTogc3RyaW5nLFxuXHRcdFx0c1BhdGhMaW5lO1xuXG5cdFx0Y29uc3Qgc1BhZ2VQYXRoID0gb1BhZ2VDb250ZXh0LmdldFBhdGgoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1BhZ2VDb250ZXh0ICYmIG9QYWdlQ29udGV4dC5nZXRNb2RlbCgpICYmIG9QYWdlQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IHNNZXRhUGF0aFBhZ2UgPSBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhZ2VQYXRoKS5yZXBsYWNlKC9eXFwvKi8sIFwiXCIpO1xuXG5cdFx0Ly8gR2V0IHNpbmdsZSBsaW5lIGNvbnRleHQgaWYgbmVjZXNzYXJ5XG5cdFx0aWYgKGFMaW5lQ29udGV4dCAmJiBhTGluZUNvbnRleHQubGVuZ3RoKSB7XG5cdFx0XHRvQ29udGV4dCA9IGFMaW5lQ29udGV4dFswXTtcblx0XHRcdHNQYXRoTGluZSA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRcdHNNZXRhUGF0aExpbmUgPSBvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGhMaW5lKS5yZXBsYWNlKC9eXFwvKi8sIFwiXCIpO1xuXG5cdFx0XHRhTGluZUNvbnRleHQuZm9yRWFjaCgob1NpbmdsZUNvbnRleHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoc0NoYXJ0UGF0aCkge1xuXHRcdFx0XHRcdGNvbnN0IG9DaGFydENvbnRleHREYXRhID0gdGhpcy5fZ2V0Q2hhcnRDb250ZXh0RGF0YShvU2luZ2xlQ29udGV4dCwgc0NoYXJ0UGF0aCk7XG5cdFx0XHRcdFx0aWYgKG9DaGFydENvbnRleHREYXRhKSB7XG5cdFx0XHRcdFx0XHRhQXR0cmlidXRlcyA9IG9DaGFydENvbnRleHREYXRhLm1hcChmdW5jdGlvbiAob1N1YkNoYXJ0Q29udGV4dERhdGE6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHREYXRhOiBvU3ViQ2hhcnRDb250ZXh0RGF0YSxcblx0XHRcdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IGAke3NNZXRhUGF0aFBhZ2V9LyR7c0NoYXJ0UGF0aH1gXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUF0dHJpYnV0ZXMucHVzaCh7XG5cdFx0XHRcdFx0XHRjb250ZXh0RGF0YTogb1NpbmdsZUNvbnRleHQuZ2V0T2JqZWN0KCksXG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IHNNZXRhUGF0aExpbmVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGFQYWdlQXR0cmlidXRlcy5wdXNoKHtcblx0XHRcdGNvbnRleHREYXRhOiBvUGFnZUNvbnRleHQuZ2V0T2JqZWN0KCksXG5cdFx0XHRlbnRpdHlTZXQ6IHNNZXRhUGF0aFBhZ2Vcblx0XHR9KTtcblx0XHQvLyBBZGRpbmcgUGFnZSBDb250ZXh0IHRvIHNlbGVjdGlvbiB2YXJpYW50XG5cdFx0YVBhZ2VBdHRyaWJ1dGVzID0gdGhpcy5faW50ZW50QmFzZWROYXZpZ2F0aW9uLnJlbW92ZVNlbnNpdGl2ZURhdGEoYVBhZ2VBdHRyaWJ1dGVzLCBzTWV0YVBhdGhQYWdlKTtcblx0XHRjb25zdCBvUGFnZUxldmVsU1YgPSBDb21tb25VdGlscy5hZGRQYWdlQ29udGV4dFRvU2VsZWN0aW9uVmFyaWFudChuZXcgU2VsZWN0aW9uVmFyaWFudCgpLCBhUGFnZUF0dHJpYnV0ZXMsIHRoaXMuZ2V0VmlldygpKTtcblx0XHRhQXR0cmlidXRlcyA9IHRoaXMuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5yZW1vdmVTZW5zaXRpdmVEYXRhKGFBdHRyaWJ1dGVzLCBzTWV0YVBhdGhQYWdlKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudDogb1BhZ2VMZXZlbFNWLFxuXHRcdFx0YXR0cmlidXRlczogYUF0dHJpYnV0ZXNcblx0XHR9O1xuXHR9XG5cblx0X2dldEJhdGNoR3JvdXBzRm9yVmlldygpIHtcblx0XHRjb25zdCBvVmlld0RhdGEgPSB0aGlzLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSxcblx0XHRcdG9Db25maWd1cmF0aW9ucyA9IG9WaWV3RGF0YS5jb250cm9sQ29uZmlndXJhdGlvbixcblx0XHRcdGFDb25maWd1cmF0aW9ucyA9IG9Db25maWd1cmF0aW9ucyAmJiBPYmplY3Qua2V5cyhvQ29uZmlndXJhdGlvbnMpLFxuXHRcdFx0YUJhdGNoR3JvdXBzID0gW1wiJGF1dG8uSGVyb2VzXCIsIFwiJGF1dG8uRGVjb3JhdGlvblwiLCBcIiRhdXRvLldvcmtlcnNcIl07XG5cblx0XHRpZiAoYUNvbmZpZ3VyYXRpb25zICYmIGFDb25maWd1cmF0aW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhQ29uZmlndXJhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9Db25maWd1cmF0aW9uID0gb0NvbmZpZ3VyYXRpb25zW3NLZXldO1xuXHRcdFx0XHRpZiAob0NvbmZpZ3VyYXRpb24ucmVxdWVzdEdyb3VwSWQgPT09IFwiTG9uZ1J1bm5lcnNcIikge1xuXHRcdFx0XHRcdGFCYXRjaEdyb3Vwcy5wdXNoKFwiJGF1dG8uTG9uZ1J1bm5lcnNcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gYUJhdGNoR3JvdXBzO1xuXHR9XG5cblx0Lypcblx0ICogUmVzZXQgQnJlYWRjcnVtYiBsaW5rc1xuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHtzYXAubS5CcmVhZGNydW1ic30gW29Tb3VyY2VdIHBhcmVudCBjb250cm9sXG5cdCAqIEBkZXNjcmlwdGlvbiBVc2VkIHdoZW4gY29udGV4dCBvZiB0aGUgb2JqZWN0IHBhZ2UgY2hhbmdlcy5cblx0ICogICAgICAgICAgICAgIFRoaXMgZXZlbnQgY2FsbGJhY2sgaXMgYXR0YWNoZWQgdG8gbW9kZWxDb250ZXh0Q2hhbmdlXG5cdCAqICAgICAgICAgICAgICBldmVudCBvZiB0aGUgQnJlYWRjcnVtYiBjb250cm9sIHRvIGNhdGNoIGNvbnRleHQgY2hhbmdlLlxuXHQgKiAgICAgICAgICAgICAgVGhlbiBlbGVtZW50IGJpbmRpbmcgYW5kIGhyZWZzIGFyZSB1cGRhdGVkIGZvciBlYWNoIGxpbmsuXG5cdCAqXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZXhwZXJpbWVudGFsXG5cdCAqL1xuXHRhc3luYyBfc2V0QnJlYWRjcnVtYkxpbmtzKG9Tb3VyY2U6IEJyZWFkQ3J1bWJzKSB7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSBvU291cmNlLmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdGFQcm9taXNlczogUHJvbWlzZTx2b2lkPltdID0gW10sXG5cdFx0XHRhU2tpcFBhcmFtZXRlcml6ZWQ6IGFueVtdID0gW10sXG5cdFx0XHRzTmV3UGF0aCA9IG9Db250ZXh0Py5nZXRQYXRoKCksXG5cdFx0XHRhUGF0aFBhcnRzID0gc05ld1BhdGg/LnNwbGl0KFwiL1wiKSA/PyBbXSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvQXBwQ29tcG9uZW50ICYmIG9BcHBDb21wb25lbnQuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0bGV0IHNQYXRoID0gXCJcIjtcblx0XHR0cnkge1xuXHRcdFx0YVBhdGhQYXJ0cy5zaGlmdCgpO1xuXHRcdFx0YVBhdGhQYXJ0cy5zcGxpY2UoLTEsIDEpO1xuXHRcdFx0YVBhdGhQYXJ0cy5mb3JFYWNoKGZ1bmN0aW9uIChzUGF0aFBhcnQ6IGFueSkge1xuXHRcdFx0XHRzUGF0aCArPSBgLyR7c1BhdGhQYXJ0fWA7XG5cdFx0XHRcdGNvbnN0IG9Sb290Vmlld0NvbnRyb2xsZXIgPSBvQXBwQ29tcG9uZW50LmdldFJvb3RWaWV3Q29udHJvbGxlcigpO1xuXHRcdFx0XHRjb25zdCBzUGFyYW1ldGVyUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGgpO1xuXHRcdFx0XHRjb25zdCBiUmVzdWx0Q29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXJhbWV0ZXJQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKTtcblx0XHRcdFx0aWYgKGJSZXN1bHRDb250ZXh0KSB7XG5cdFx0XHRcdFx0Ly8gV2UgZG9udCBuZWVkIHRvIGNyZWF0ZSBhIGJyZWFkY3J1bWIgZm9yIFBhcmFtZXRlciBwYXRoXG5cdFx0XHRcdFx0YVNraXBQYXJhbWV0ZXJpemVkLnB1c2goMSk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFTa2lwUGFyYW1ldGVyaXplZC5wdXNoKDApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFQcm9taXNlcy5wdXNoKG9Sb290Vmlld0NvbnRyb2xsZXIuZ2V0VGl0bGVJbmZvRnJvbVBhdGgoc1BhdGgpKTtcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgdGl0bGVIaWVyYXJjaHlJbmZvczogYW55W10gPSBhd2FpdCBQcm9taXNlLmFsbChhUHJvbWlzZXMpO1xuXHRcdFx0bGV0IGlkeCwgaGllcmFyY2h5UG9zaXRpb24sIG9MaW5rO1xuXHRcdFx0Zm9yIChjb25zdCB0aXRsZUhpZXJhcmNoeUluZm8gb2YgdGl0bGVIaWVyYXJjaHlJbmZvcykge1xuXHRcdFx0XHRoaWVyYXJjaHlQb3NpdGlvbiA9IHRpdGxlSGllcmFyY2h5SW5mb3MuaW5kZXhPZih0aXRsZUhpZXJhcmNoeUluZm8pO1xuXHRcdFx0XHRpZHggPSBoaWVyYXJjaHlQb3NpdGlvbiAtIGFTa2lwUGFyYW1ldGVyaXplZFtoaWVyYXJjaHlQb3NpdGlvbl07XG5cdFx0XHRcdG9MaW5rID0gb1NvdXJjZS5nZXRMaW5rcygpW2lkeF0gPyBvU291cmNlLmdldExpbmtzKClbaWR4XSA6IG5ldyBMaW5rKCk7XG5cdFx0XHRcdC8vc0N1cnJlbnRFbnRpdHkgaXMgYSBmYWxsYmFjayB2YWx1ZSBpbiBjYXNlIG9mIGVtcHR5IHRpdGxlXG5cdFx0XHRcdG9MaW5rLnNldFRleHQodGl0bGVIaWVyYXJjaHlJbmZvLnN1YnRpdGxlIHx8IHRpdGxlSGllcmFyY2h5SW5mby50aXRsZSk7XG5cdFx0XHRcdC8vV2UgYXBwbHkgYW4gYWRkaXRpb25hbCBlbmNvZGVVUkkgaW4gY2FzZSBvZiBzcGVjaWFsIGNoYXJhY3RlcnMgKGllIFwiL1wiKSB1c2VkIGluIHRoZSB1cmwgdGhyb3VnaCB0aGUgc2VtYW50aWMga2V5c1xuXHRcdFx0XHRvTGluay5zZXRIcmVmKGVuY29kZVVSSSh0aXRsZUhpZXJhcmNoeUluZm8uaW50ZW50KSk7XG5cdFx0XHRcdGlmICghb1NvdXJjZS5nZXRMaW5rcygpW2lkeF0pIHtcblx0XHRcdFx0XHRvU291cmNlLmFkZExpbmsob0xpbmspO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgc2V0dGluZyB0aGUgYnJlYWRjcnVtYiBsaW5rczpcIiArIGVycm9yKTtcblx0XHR9XG5cdH1cblxuXHRfY2hlY2tEYXRhUG9pbnRUaXRsZUZvckV4dGVybmFsTmF2aWdhdGlvbigpIHtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0Y29uc3Qgb0RhdGFQb2ludHMgPSBDb21tb25VdGlscy5nZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb24oXG5cdFx0XHRvVmlldy5nZXRWaWV3RGF0YSgpIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuXHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRSb3V0aW5nU2VydmljZSgpLmdldE91dGJvdW5kcygpXG5cdFx0KTtcblx0XHRjb25zdCBvU2hlbGxTZXJ2aWNlcyA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdGNvbnN0IG9QYWdlQ29udGV4dCA9IG9WaWV3ICYmIChvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQpO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImlzSGVhZGVyRFBMaW5rVmlzaWJsZVwiLCB7fSk7XG5cdFx0aWYgKG9QYWdlQ29udGV4dCkge1xuXHRcdFx0b1BhZ2VDb250ZXh0XG5cdFx0XHRcdC5yZXF1ZXN0T2JqZWN0KClcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9EYXRhOiBhbnkpIHtcblx0XHRcdFx0XHRmbkdldExpbmtzKG9EYXRhUG9pbnRzLCBvRGF0YSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgcmV0cmlldmUgdGhlIGxpbmtzIGZyb20gdGhlIHNoZWxsIHNlcnZpY2VcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQHBhcmFtIG9FcnJvclxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGZuT25FcnJvcihvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKG9FcnJvcik7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZm5TZXRMaW5rRW5hYmxlbWVudChpZDogc3RyaW5nLCBhU3VwcG9ydGVkTGlua3M6IGFueSkge1xuXHRcdFx0Y29uc3Qgc0xpbmtJZCA9IGlkO1xuXHRcdFx0Ly8gcHJvY2VzcyB2aWFibGUgbGlua3MgZnJvbSBnZXRMaW5rcyBmb3IgYWxsIGRhdGFwb2ludHMgaGF2aW5nIG91dGJvdW5kXG5cdFx0XHRpZiAoYVN1cHBvcnRlZExpbmtzICYmIGFTdXBwb3J0ZWRMaW5rcy5sZW5ndGggPT09IDEgJiYgYVN1cHBvcnRlZExpbmtzWzBdLnN1cHBvcnRlZCkge1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoYGlzSGVhZGVyRFBMaW5rVmlzaWJsZS8ke3NMaW5rSWR9YCwgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQHBhcmFtIG9TdWJEYXRhUG9pbnRzXG5cdFx0ICogQHBhcmFtIG9QYWdlRGF0YVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGZuR2V0TGlua3Mob1N1YkRhdGFQb2ludHM6IGFueSwgb1BhZ2VEYXRhOiBhbnkpIHtcblx0XHRcdGZvciAoY29uc3Qgc0lkIGluIG9TdWJEYXRhUG9pbnRzKSB7XG5cdFx0XHRcdGNvbnN0IG9EYXRhUG9pbnQgPSBvU3ViRGF0YVBvaW50c1tzSWRdO1xuXHRcdFx0XHRjb25zdCBvUGFyYW1zOiBhbnkgPSB7fTtcblx0XHRcdFx0Y29uc3Qgb0xpbmsgPSBvVmlldy5ieUlkKHNJZCk7XG5cdFx0XHRcdGlmICghb0xpbmspIHtcblx0XHRcdFx0XHQvLyBmb3IgZGF0YSBwb2ludHMgY29uZmlndXJlZCBpbiBhcHAgZGVzY3JpcHRvciBidXQgbm90IGFubm90YXRlZCBpbiB0aGUgaGVhZGVyXG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3Qgb0xpbmtDb250ZXh0ID0gb0xpbmsuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRcdFx0Y29uc3Qgb0xpbmtEYXRhOiBhbnkgPSBvTGlua0NvbnRleHQgJiYgb0xpbmtDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRsZXQgb01peGVkQ29udGV4dDogYW55ID0gbWVyZ2Uoe30sIG9QYWdlRGF0YSwgb0xpbmtEYXRhKTtcblx0XHRcdFx0Ly8gcHJvY2VzcyBzZW1hbnRpYyBvYmplY3QgbWFwcGluZ3Ncblx0XHRcdFx0aWYgKG9EYXRhUG9pbnQuc2VtYW50aWNPYmplY3RNYXBwaW5nKSB7XG5cdFx0XHRcdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0TWFwcGluZyA9IG9EYXRhUG9pbnQuc2VtYW50aWNPYmplY3RNYXBwaW5nO1xuXHRcdFx0XHRcdGZvciAoY29uc3QgaXRlbSBpbiBhU2VtYW50aWNPYmplY3RNYXBwaW5nKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvTWFwcGluZyA9IGFTZW1hbnRpY09iamVjdE1hcHBpbmdbaXRlbV07XG5cdFx0XHRcdFx0XHRjb25zdCBzTWFpblByb3BlcnR5ID0gb01hcHBpbmdbXCJMb2NhbFByb3BlcnR5XCJdW1wiJFByb3BlcnR5UGF0aFwiXTtcblx0XHRcdFx0XHRcdGNvbnN0IHNNYXBwZWRQcm9wZXJ0eSA9IG9NYXBwaW5nW1wiU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiXTtcblx0XHRcdFx0XHRcdGlmIChzTWFpblByb3BlcnR5ICE9PSBzTWFwcGVkUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKG9NaXhlZENvbnRleHQuaGFzT3duUHJvcGVydHkoc01haW5Qcm9wZXJ0eSkpIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvTmV3TWFwcGluZzogYW55ID0ge307XG5cdFx0XHRcdFx0XHRcdFx0b05ld01hcHBpbmdbc01hcHBlZFByb3BlcnR5XSA9IG9NaXhlZENvbnRleHRbc01haW5Qcm9wZXJ0eV07XG5cdFx0XHRcdFx0XHRcdFx0b01peGVkQ29udGV4dCA9IG1lcmdlKHt9LCBvTWl4ZWRDb250ZXh0LCBvTmV3TWFwcGluZyk7XG5cdFx0XHRcdFx0XHRcdFx0ZGVsZXRlIG9NaXhlZENvbnRleHRbc01haW5Qcm9wZXJ0eV07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob01peGVkQ29udGV4dCkge1xuXHRcdFx0XHRcdGZvciAoY29uc3Qgc0tleSBpbiBvTWl4ZWRDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRpZiAoc0tleS5pbmRleE9mKFwiX1wiKSAhPT0gMCAmJiBzS2V5LmluZGV4T2YoXCJvZGF0YS5jb250ZXh0XCIpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRvUGFyYW1zW3NLZXldID0gb01peGVkQ29udGV4dFtzS2V5XTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gdmFsaWRhdGUgaWYgYSBsaW5rIG11c3QgYmUgcmVuZGVyZWRcblx0XHRcdFx0b1NoZWxsU2VydmljZXNcblx0XHRcdFx0XHQuaXNOYXZpZ2F0aW9uU3VwcG9ydGVkKFtcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9EYXRhUG9pbnQuc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0XHRcdFx0YWN0aW9uOiBvRGF0YVBvaW50LmFjdGlvblxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRwYXJhbXM6IG9QYXJhbXNcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRdKVxuXHRcdFx0XHRcdC50aGVuKChhTGlua3MpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBmblNldExpbmtFbmFibGVtZW50KHNJZCwgYUxpbmtzKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmbk9uRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGhhbmRsZXJzID0ge1xuXHRcdC8qKlxuXHRcdCAqIEludm9rZXMgdGhlIHBhZ2UgcHJpbWFyeSBhY3Rpb24gb24gcHJlc3Mgb2YgQ3RybCtFbnRlci5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBvQ29udHJvbGxlciBUaGUgcGFnZSBjb250cm9sbGVyXG5cdFx0ICogQHBhcmFtIG9WaWV3XG5cdFx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBhY3Rpb24gaXMgY2FsbGVkXG5cdFx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdFx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gQ29udGFpbnMgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHRcdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY29udGV4dHNdIE1hbmRhdG9yeSBmb3IgYSBib3VuZCBhY3Rpb24sIGVpdGhlciBvbmUgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIGNhbGxlZFxuXHRcdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubW9kZWxdIE1hbmRhdG9yeSBmb3IgYW4gdW5ib3VuZCBhY3Rpb247IGFuIGluc3RhbmNlIG9mIGFuIE9EYXRhIFY0IG1vZGVsXG5cdFx0ICogQHBhcmFtIFttQ29uZGl0aW9uc10gQ29udGFpbnMgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHRcdCAqIEBwYXJhbSBbbUNvbmRpdGlvbnMucG9zaXRpdmVBY3Rpb25WaXNpYmxlXSBUaGUgdmlzaWJpbGl0eSBvZiBzZW1hdGljIHBvc2l0aXZlIGFjdGlvblxuXHRcdCAqIEBwYXJhbSBbbUNvbmRpdGlvbnMucG9zaXRpdmVBY3Rpb25FbmFibGVkXSBUaGUgZW5hYmxlbWVudCBvZiBzZW1hbnRpYyBwb3NpdGl2ZSBhY3Rpb25cblx0XHQgKiBAcGFyYW0gW21Db25kaXRpb25zLmVkaXRBY3Rpb25WaXNpYmxlXSBUaGUgRWRpdCBidXR0b24gdmlzaWJpbGl0eVxuXHRcdCAqIEBwYXJhbSBbbUNvbmRpdGlvbnMuZWRpdEFjdGlvbkVuYWJsZWRdIFRoZSBlbmFibGVtZW50IG9mIEVkaXQgYnV0dG9uXG5cdFx0ICogQHVpNS1yZXN0cmljdGVkXG5cdFx0ICogQGZpbmFsXG5cdFx0ICovXG5cdFx0b25QcmltYXJ5QWN0aW9uKFxuXHRcdFx0b0NvbnRyb2xsZXI6IE9iamVjdFBhZ2VDb250cm9sbGVyLFxuXHRcdFx0b1ZpZXc6IEZFVmlldyxcblx0XHRcdG9Db250ZXh0OiBDb250ZXh0LFxuXHRcdFx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0XHRcdG1QYXJhbWV0ZXJzOiB1bmtub3duLFxuXHRcdFx0bUNvbmRpdGlvbnM6IHtcblx0XHRcdFx0cG9zaXRpdmVBY3Rpb25WaXNpYmxlOiBib29sZWFuO1xuXHRcdFx0XHRwb3NpdGl2ZUFjdGlvbkVuYWJsZWQ6IGJvb2xlYW47XG5cdFx0XHRcdGVkaXRBY3Rpb25WaXNpYmxlOiBib29sZWFuO1xuXHRcdFx0XHRlZGl0QWN0aW9uRW5hYmxlZDogYm9vbGVhbjtcblx0XHRcdH1cblx0XHQpIHtcblx0XHRcdGNvbnN0IGlWaWV3TGV2ZWwgPSAob0NvbnRyb2xsZXIuZ2V0VmlldygpLmdldFZpZXdEYXRhKCkgYXMgYW55KS52aWV3TGV2ZWw7XG5cdFx0XHRpZiAobUNvbmRpdGlvbnMucG9zaXRpdmVBY3Rpb25WaXNpYmxlKSB7XG5cdFx0XHRcdGlmIChtQ29uZGl0aW9ucy5wb3NpdGl2ZUFjdGlvbkVuYWJsZWQpIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5oYW5kbGVycy5vbkNhbGxBY3Rpb24ob1ZpZXcsIHNBY3Rpb25OYW1lLCBtUGFyYW1ldGVycyk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAobUNvbmRpdGlvbnMuZWRpdEFjdGlvblZpc2libGUpIHtcblx0XHRcdFx0aWYgKG1Db25kaXRpb25zLmVkaXRBY3Rpb25FbmFibGVkKSB7XG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIuX2VkaXREb2N1bWVudChvQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoaVZpZXdMZXZlbCA9PT0gMSAmJiBvVmlldy5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikpIHtcblx0XHRcdFx0b0NvbnRyb2xsZXIuX3NhdmVEb2N1bWVudChvQ29udGV4dCk7XG5cdFx0XHR9IGVsc2UgaWYgKG9WaWV3LmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSkge1xuXHRcdFx0XHRvQ29udHJvbGxlci5fYXBwbHlEb2N1bWVudChvQ29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIE1hbmFnZXMgdGhlIGNvbnRleHQgY2hhbmdlIGV2ZW50IG9uIHRoZSB0YWJsZXMuXG5cdFx0ICogVGhlIGZvY3VzIGlzIHNldCBpZiB0aGlzIGNoYW5nZSBpcyByZWxhdGVkIHRvIGFuIGVkaXRGbG93IGFjdGlvbiBhbmRcblx0XHQgKiBhbiBldmVudCBpcyBmaXJlZCBvbiB0aGUgb2JqZWN0UGFnZSBtZXNzYWdlQnV0dG9uLlxuXHRcdCAqXG5cdFx0ICogQHBhcmFtIHRoaXMgVGhlIG9iamVjdFBhZ2UgY29udHJvbGxlclxuXHRcdCAqIEBwYXJhbSBldmVudCBUaGUgVUk1IGV2ZW50XG5cdFx0ICovXG5cdFx0YXN5bmMgb25UYWJsZUNvbnRleHRDaGFuZ2UodGhpczogT2JqZWN0UGFnZUNvbnRyb2xsZXIsIGV2ZW50OiBVSTVFdmVudCkge1xuXHRcdFx0Y29uc3QgdGFibGVBUEkgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBUYWJsZUFQSTtcblx0XHRcdGNvbnN0IHRhYmxlID0gdGFibGVBUEkuY29udGVudCBhcyBUYWJsZTtcblx0XHRcdGNvbnN0IGN1cnJlbnRBY3Rpb25Qcm9taXNlID0gdGhpcy5lZGl0Rmxvdy5nZXRDdXJyZW50QWN0aW9uUHJvbWlzZSgpO1xuXHRcdFx0Y29uc3QgdGFibGVDb250ZXh0cyA9IHRoaXMuX2dldFRhYmxlQmluZGluZyh0YWJsZSk/LmdldEN1cnJlbnRDb250ZXh0cygpIGFzIENvbnRleHRbXSB8IHVuZGVmaW5lZDtcblxuXHRcdFx0aWYgKGN1cnJlbnRBY3Rpb25Qcm9taXNlICYmIHRhYmxlQ29udGV4dHM/Lmxlbmd0aCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IGFjdGlvblJlc3BvbnNlID0gYXdhaXQgY3VycmVudEFjdGlvblByb21pc2U7XG5cdFx0XHRcdFx0aWYgKGFjdGlvblJlc3BvbnNlPy5jb250cm9sSWQgPT09IHRhYmxlLmdldElkKCkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGFjdGlvbkRhdGEgPSBhY3Rpb25SZXNwb25zZS5vRGF0YTtcblx0XHRcdFx0XHRcdGNvbnN0IGtleXMgPSBhY3Rpb25SZXNwb25zZS5rZXlzO1xuXHRcdFx0XHRcdFx0Y29uc3QgbmV3SXRlbSA9IHRhYmxlQ29udGV4dHMuZmluZEluZGV4KCh0YWJsZUNvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgdGFibGVEYXRhID0gdGFibGVDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4ga2V5cy5ldmVyeSgoa2V5OiBzdHJpbmcpID0+IHRhYmxlRGF0YVtrZXldID09PSBhY3Rpb25EYXRhW2tleV0pO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRpZiAobmV3SXRlbSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZGlhbG9nID0gSW5zdGFuY2VNYW5hZ2VyLmdldE9wZW5EaWFsb2dzKCkuZmluZCgoZGlhbG9nKSA9PiBkaWFsb2cuZGF0YShcIkZ1bGxTY3JlZW5EaWFsb2dcIikgIT09IHRydWUpO1xuXHRcdFx0XHRcdFx0XHRpZiAoZGlhbG9nKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gYnkgZGVzaWduLCBhIHNhcC5tLmRpYWxvZyBzZXQgdGhlIGZvY3VzIHRvIHRoZSBwcmV2aW91cyBmb2N1c2VkIGVsZW1lbnQgd2hlbiBjbG9zaW5nLlxuXHRcdFx0XHRcdFx0XHRcdC8vIHdlIHNob3VsZCB3YWl0IGZvciB0aGUgZGlhbG9nIHRvIGJlIGNsb3NlZCBiZWZvcmUgc2V0IHRoZSBmb2N1cyB0byBhbm90aGVyIGVsZW1lbnRcblx0XHRcdFx0XHRcdFx0XHRkaWFsb2cuYXR0YWNoRXZlbnRPbmNlKFwiYWZ0ZXJDbG9zZVwiLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0YWJsZS5mb2N1c1JvdyhuZXdJdGVtLCB0cnVlKTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHR0YWJsZS5mb2N1c1JvdyhuZXdJdGVtLCB0cnVlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR0aGlzLmVkaXRGbG93LmRlbGV0ZUN1cnJlbnRBY3Rpb25Qcm9taXNlKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKGBBbiBlcnJvciBvY2N1cnMgd2hpbGUgc2Nyb2xsaW5nIHRvIHRoZSBuZXdseSBjcmVhdGVkIEl0ZW06ICR7ZX1gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gZmlyZSBNb2RlbENvbnRleHRDaGFuZ2Ugb24gdGhlIG1lc3NhZ2UgYnV0dG9uIHdoZW5ldmVyIHRoZSB0YWJsZSBjb250ZXh0IGNoYW5nZXNcblx0XHRcdHRoaXMubWVzc2FnZUJ1dHRvbi5maXJlTW9kZWxDb250ZXh0Q2hhbmdlKCk7XG5cdFx0fSxcblxuXHRcdC8qKlxuXHRcdCAqIEludm9rZXMgYW4gYWN0aW9uIC0gYm91bmQvdW5ib3VuZCBhbmQgc2V0cyB0aGUgcGFnZSBkaXJ0eS5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBvVmlld1xuXHRcdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uIHRvIGJlIGNhbGxlZFxuXHRcdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0XHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmNvbnRleHRzXSBNYW5kYXRvcnkgZm9yIGEgYm91bmQgYWN0aW9uLCBlaXRoZXIgb25lIGNvbnRleHQgb3IgYW4gYXJyYXkgd2l0aCBjb250ZXh0cyBmb3Igd2hpY2ggdGhlIGFjdGlvbiBpcyBjYWxsZWRcblx0XHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm1vZGVsXSBNYW5kYXRvcnkgZm9yIGFuIHVuYm91bmQgYWN0aW9uOyBhbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbFxuXHRcdCAqIEByZXR1cm5zIFRoZSBhY3Rpb24gcHJvbWlzZVxuXHRcdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHRcdCAqIEBmaW5hbFxuXHRcdCAqL1xuXHRcdG9uQ2FsbEFjdGlvbihvVmlldzogYW55LCBzQWN0aW9uTmFtZTogc3RyaW5nLCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKTtcblx0XHRcdHJldHVybiBvQ29udHJvbGxlci5lZGl0Rmxvd1xuXHRcdFx0XHQuaW52b2tlQWN0aW9uKHNBY3Rpb25OYW1lLCBtUGFyYW1ldGVycylcblx0XHRcdFx0LnRoZW4ob0NvbnRyb2xsZXIuX3Nob3dNZXNzYWdlUG9wb3Zlci5iaW5kKG9Db250cm9sbGVyLCB1bmRlZmluZWQpKVxuXHRcdFx0XHQuY2F0Y2gob0NvbnRyb2xsZXIuX3Nob3dNZXNzYWdlUG9wb3Zlci5iaW5kKG9Db250cm9sbGVyKSk7XG5cdFx0fSxcblx0XHRvbkRhdGFQb2ludFRpdGxlUHJlc3NlZChvQ29udHJvbGxlcjogYW55LCBvU291cmNlOiBhbnksIG9NYW5pZmVzdE91dGJvdW5kOiBhbnksIHNDb250cm9sQ29uZmlnOiBhbnksIHNDb2xsZWN0aW9uUGF0aDogYW55KSB7XG5cdFx0XHRvTWFuaWZlc3RPdXRib3VuZCA9IHR5cGVvZiBvTWFuaWZlc3RPdXRib3VuZCA9PT0gXCJzdHJpbmdcIiA/IEpTT04ucGFyc2Uob01hbmlmZXN0T3V0Ym91bmQpIDogb01hbmlmZXN0T3V0Ym91bmQ7XG5cdFx0XHRjb25zdCBvVGFyZ2V0SW5mbyA9IG9NYW5pZmVzdE91dGJvdW5kW3NDb250cm9sQ29uZmlnXSxcblx0XHRcdFx0YVNlbWFudGljT2JqZWN0TWFwcGluZyA9IENvbW1vblV0aWxzLmdldFNlbWFudGljT2JqZWN0TWFwcGluZyhvVGFyZ2V0SW5mbyksXG5cdFx0XHRcdG9EYXRhUG9pbnRPckNoYXJ0QmluZGluZ0NvbnRleHQgPSBvU291cmNlLmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRcdHNNZXRhUGF0aCA9IG9EYXRhUG9pbnRPckNoYXJ0QmluZGluZ0NvbnRleHRcblx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0XHRcdC5nZXRNZXRhUGF0aChvRGF0YVBvaW50T3JDaGFydEJpbmRpbmdDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRsZXQgYU5hdmlnYXRpb25EYXRhID0gb0NvbnRyb2xsZXIuX2dldENoYXJ0Q29udGV4dERhdGEob0RhdGFQb2ludE9yQ2hhcnRCaW5kaW5nQ29udGV4dCwgc0NvbGxlY3Rpb25QYXRoKTtcblx0XHRcdGxldCBhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnM7XG5cblx0XHRcdGFOYXZpZ2F0aW9uRGF0YSA9IGFOYXZpZ2F0aW9uRGF0YS5tYXAoZnVuY3Rpb24gKG9OYXZpZ2F0aW9uRGF0YTogYW55KSB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0ZGF0YTogb05hdmlnYXRpb25EYXRhLFxuXHRcdFx0XHRcdG1ldGFQYXRoOiBzTWV0YVBhdGggKyAoc0NvbGxlY3Rpb25QYXRoID8gYC8ke3NDb2xsZWN0aW9uUGF0aH1gIDogXCJcIilcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKG9UYXJnZXRJbmZvICYmIG9UYXJnZXRJbmZvLnBhcmFtZXRlcnMpIHtcblx0XHRcdFx0Y29uc3Qgb1BhcmFtcyA9IG9UYXJnZXRJbmZvLnBhcmFtZXRlcnMgJiYgb0NvbnRyb2xsZXIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5nZXRPdXRib3VuZFBhcmFtcyhvVGFyZ2V0SW5mby5wYXJhbWV0ZXJzKTtcblx0XHRcdFx0aWYgKE9iamVjdC5rZXlzKG9QYXJhbXMpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnMgPSBvUGFyYW1zO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAob1RhcmdldEluZm8gJiYgb1RhcmdldEluZm8uc2VtYW50aWNPYmplY3QgJiYgb1RhcmdldEluZm8uYWN0aW9uKSB7XG5cdFx0XHRcdG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ubmF2aWdhdGUob1RhcmdldEluZm8uc2VtYW50aWNPYmplY3QsIG9UYXJnZXRJbmZvLmFjdGlvbiwge1xuXHRcdFx0XHRcdG5hdmlnYXRpb25Db250ZXh0czogYU5hdmlnYXRpb25EYXRhLFxuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZzogYVNlbWFudGljT2JqZWN0TWFwcGluZyxcblx0XHRcdFx0XHRhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVyc1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdC8qKlxuXHRcdCAqIFRyaWdnZXJzIGFuIG91dGJvdW5kIG5hdmlnYXRpb24gd2hlbiBhIHVzZXIgY2hvb3NlcyB0aGUgY2hldnJvbi5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSBvQ29udHJvbGxlclxuXHRcdCAqIEBwYXJhbSBzT3V0Ym91bmRUYXJnZXQgTmFtZSBvZiB0aGUgb3V0Ym91bmQgdGFyZ2V0IChuZWVkcyB0byBiZSBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdClcblx0XHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgdGhhdCBjb250YWlucyB0aGUgZGF0YSBmb3IgdGhlIHRhcmdldCBhcHBcblx0XHQgKiBAcGFyYW0gc0NyZWF0ZVBhdGggQ3JlYXRlIHBhdGggd2hlbiB0aGUgY2hldnJvbiBpcyBjcmVhdGVkLlxuXHRcdCAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgb25jZSB0aGUgbmF2aWdhdGlvbiBpcyB0cmlnZ2VyZWQgKD8/PyBtYXliZSBvbmx5IG9uY2UgZmluaXNoZWQ/KVxuXHRcdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHRcdCAqIEBmaW5hbFxuXHRcdCAqL1xuXHRcdG9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZChvQ29udHJvbGxlcjogT2JqZWN0UGFnZUNvbnRyb2xsZXIsIHNPdXRib3VuZFRhcmdldDogc3RyaW5nLCBvQ29udGV4dDogYW55LCBzQ3JlYXRlUGF0aDogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gb0NvbnRyb2xsZXIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5vbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQob0NvbnRyb2xsZXIsIHNPdXRib3VuZFRhcmdldCwgb0NvbnRleHQsIHNDcmVhdGVQYXRoKTtcblx0XHR9LFxuXG5cdFx0b25OYXZpZ2F0ZUNoYW5nZSh0aGlzOiBPYmplY3RQYWdlQ29udHJvbGxlciwgb0V2ZW50OiBhbnkpIHtcblx0XHRcdC8vd2lsbCBiZSBjYWxsZWQgYWx3YXlzIHdoZW4gd2UgY2xpY2sgb24gYSBzZWN0aW9uIHRhYlxuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdFx0dGhpcy5iU2VjdGlvbk5hdmlnYXRlZCA9IHRydWU7XG5cblx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSAmJlxuXHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLnNlY3Rpb25MYXlvdXQgPT09IFwiVGFic1wiICYmXG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcImVycm9yTmF2aWdhdGlvblNlY3Rpb25GbGFnXCIpID09PSBmYWxzZVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IG9TdWJTZWN0aW9uID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInN1YlNlY3Rpb25cIik7XG5cdFx0XHRcdHRoaXMuX3VwZGF0ZUZvY3VzSW5FZGl0TW9kZShbb1N1YlNlY3Rpb25dKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdG9uVmFyaWFudFNlbGVjdGVkOiBmdW5jdGlvbiAodGhpczogT2JqZWN0UGFnZUNvbnRyb2xsZXIpIHtcblx0XHRcdHRoaXMuZ2V0RXh0ZW5zaW9uQVBJKCkudXBkYXRlQXBwU3RhdGUoKTtcblx0XHR9LFxuXHRcdG9uVmFyaWFudFNhdmVkOiBmdW5jdGlvbiAodGhpczogT2JqZWN0UGFnZUNvbnRyb2xsZXIpIHtcblx0XHRcdC8vVE9ETzogU2hvdWxkIHJlbW92ZSB0aGlzIHNldFRpbWVPdXQgb25jZSBWYXJpYW50IE1hbmFnZW1lbnQgcHJvdmlkZXMgYW4gYXBpIHRvIGZldGNoIHRoZSBjdXJyZW50IHZhcmlhbnQga2V5IG9uIHNhdmVcblx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLnVwZGF0ZUFwcFN0YXRlKCk7XG5cdFx0XHR9LCAyMDAwKTtcblx0XHR9LFxuXHRcdG5hdmlnYXRlVG9TdWJTZWN0aW9uOiBmdW5jdGlvbiAob0NvbnRyb2xsZXI6IE9iamVjdFBhZ2VDb250cm9sbGVyLCB2RGV0YWlsQ29uZmlnOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9EZXRhaWxDb25maWcgPSB0eXBlb2YgdkRldGFpbENvbmZpZyA9PT0gXCJzdHJpbmdcIiA/IEpTT04ucGFyc2UodkRldGFpbENvbmZpZykgOiB2RGV0YWlsQ29uZmlnO1xuXHRcdFx0Y29uc3Qgb09iamVjdFBhZ2UgPSBvQ29udHJvbGxlci5nZXRWaWV3KCkuYnlJZChcImZlOjpPYmplY3RQYWdlXCIpIGFzIE9iamVjdFBhZ2VMYXlvdXQ7XG5cdFx0XHRsZXQgb1NlY3Rpb247XG5cdFx0XHRsZXQgb1N1YlNlY3Rpb247XG5cdFx0XHRpZiAob0RldGFpbENvbmZpZy5zZWN0aW9uSWQpIHtcblx0XHRcdFx0b1NlY3Rpb24gPSBvQ29udHJvbGxlci5nZXRWaWV3KCkuYnlJZChvRGV0YWlsQ29uZmlnLnNlY3Rpb25JZCkgYXMgT2JqZWN0UGFnZVNlY3Rpb247XG5cdFx0XHRcdG9TdWJTZWN0aW9uID0gKFxuXHRcdFx0XHRcdG9EZXRhaWxDb25maWcuc3ViU2VjdGlvbklkXG5cdFx0XHRcdFx0XHQ/IG9Db250cm9sbGVyLmdldFZpZXcoKS5ieUlkKG9EZXRhaWxDb25maWcuc3ViU2VjdGlvbklkKVxuXHRcdFx0XHRcdFx0OiBvU2VjdGlvbiAmJiBvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpICYmIG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKClbMF1cblx0XHRcdFx0KSBhcyBPYmplY3RQYWdlU3ViU2VjdGlvbjtcblx0XHRcdH0gZWxzZSBpZiAob0RldGFpbENvbmZpZy5zdWJTZWN0aW9uSWQpIHtcblx0XHRcdFx0b1N1YlNlY3Rpb24gPSBvQ29udHJvbGxlci5nZXRWaWV3KCkuYnlJZChvRGV0YWlsQ29uZmlnLnN1YlNlY3Rpb25JZCkgYXMgT2JqZWN0UGFnZVN1YlNlY3Rpb247XG5cdFx0XHRcdG9TZWN0aW9uID0gb1N1YlNlY3Rpb24gJiYgKG9TdWJTZWN0aW9uLmdldFBhcmVudCgpIGFzIE9iamVjdFBhZ2VTZWN0aW9uKTtcblx0XHRcdH1cblx0XHRcdGlmICghb1NlY3Rpb24gfHwgIW9TdWJTZWN0aW9uIHx8ICFvU2VjdGlvbi5nZXRWaXNpYmxlKCkgfHwgIW9TdWJTZWN0aW9uLmdldFZpc2libGUoKSkge1xuXHRcdFx0XHRjb25zdCBzVGl0bGUgPSBnZXRSZXNvdXJjZU1vZGVsKG9Db250cm9sbGVyKS5nZXRUZXh0KFxuXHRcdFx0XHRcdFwiQ19ST1VUSU5HX05BVklHQVRJT05fRElTQUJMRURfVElUTEVcIixcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0KG9Db250cm9sbGVyLmdldFZpZXcoKS5nZXRWaWV3RGF0YSgpIGFzIGFueSkuZW50aXR5U2V0XG5cdFx0XHRcdCk7XG5cdFx0XHRcdExvZy5lcnJvcihzVGl0bGUpO1xuXHRcdFx0XHRNZXNzYWdlQm94LmVycm9yKHNUaXRsZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvT2JqZWN0UGFnZS5zY3JvbGxUb1NlY3Rpb24ob1N1YlNlY3Rpb24uZ2V0SWQoKSk7XG5cdFx0XHRcdC8vIHRyaWdnZXIgaWFwcCBzdGF0ZSBjaGFuZ2Vcblx0XHRcdFx0b09iamVjdFBhZ2UuZmlyZU5hdmlnYXRlKHtcblx0XHRcdFx0XHRzZWN0aW9uOiBvU2VjdGlvbixcblx0XHRcdFx0XHRzdWJTZWN0aW9uOiBvU3ViU2VjdGlvblxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0b25TdGF0ZUNoYW5nZSh0aGlzOiBPYmplY3RQYWdlQ29udHJvbGxlcikge1xuXHRcdFx0dGhpcy5nZXRFeHRlbnNpb25BUEkoKS51cGRhdGVBcHBTdGF0ZSgpO1xuXHRcdH0sXG5cdFx0Y2xvc2VPUE1lc3NhZ2VTdHJpcDogZnVuY3Rpb24gKHRoaXM6IE9iamVjdFBhZ2VDb250cm9sbGVyKSB7XG5cdFx0XHR0aGlzLmdldEV4dGVuc2lvbkFQSSgpLmhpZGVNZXNzYWdlKCk7XG5cdFx0fVxuXHR9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBPYmplY3RQYWdlQ29udHJvbGxl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
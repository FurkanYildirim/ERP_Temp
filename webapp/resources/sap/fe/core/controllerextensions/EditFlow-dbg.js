/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/editFlow/sticky", "sap/fe/core/controllerextensions/editFlow/TransactionHelper", "sap/fe/core/controllerextensions/Feedback", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageToast", "sap/m/Text", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/odata/v4/ODataListBinding", "../ActionRuntime"], function (Log, CommonUtils, BusyLocker, ActivitySync, CollaborationCommon, draft, sticky, TransactionHelper, Feedback, MetaModelConverter, ClassSupport, EditState, MetaModelFunction, ModelHelper, ResourceModelHelper, SemanticKeyHelper, FELibrary, Button, Dialog, MessageToast, Text, Core, coreLibrary, Message, ControllerExtension, OverrideExecution, ODataListBinding, ActionRuntime) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _class, _class2;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var getNonComputedVisibleFields = MetaModelFunction.getNonComputedVisibleFields;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertTypes = MetaModelConverter.convertTypes;
  var TriggerType = Feedback.TriggerType;
  var triggerConfiguredSurvey = Feedback.triggerConfiguredSurvey;
  var StandardActions = Feedback.StandardActions;
  var shareObject = CollaborationCommon.shareObject;
  var Activity = CollaborationCommon.Activity;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  const CreationMode = FELibrary.CreationMode,
    ProgrammingModel = FELibrary.ProgrammingModel,
    Constants = FELibrary.Constants,
    DraftStatus = FELibrary.DraftStatus,
    EditMode = FELibrary.EditMode,
    StartupMode = FELibrary.StartupMode,
    MessageType = coreLibrary.MessageType;

  /**
   * A controller extension offering hooks into the edit flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.90.0
   */
  let EditFlow = (_dec = defineUI5Class("sap.fe.core.controllerextensions.EditFlow"), _dec2 = publicExtension(), _dec3 = finalExtension(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = finalExtension(), _dec8 = publicExtension(), _dec9 = extensible(OverrideExecution.After), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = extensible(OverrideExecution.After), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec16 = publicExtension(), _dec17 = extensible(OverrideExecution.After), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = finalExtension(), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = extensible(OverrideExecution.After), _dec30 = publicExtension(), _dec31 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(EditFlow, _ControllerExtension);
    function EditFlow() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ControllerExtension.call(this, ...args) || this;
      _this.syncTasks = Promise.resolve();
      return _this;
    }
    var _proto = EditFlow.prototype;
    //////////////////////////////////////
    // Public methods
    //////////////////////////////////////
    _proto.getAppComponent = function getAppComponent() {
      return this.base.getAppComponent();
    }

    /**
     * Creates a draft document for an existing active document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext Context of the active document
     * @returns Promise resolves once the editable document is available
     * @alias sap.fe.core.controllerextensions.EditFlow#editDocument
     * @public
     * @since 1.90.0
     */;
    _proto.editDocument = async function editDocument(oContext) {
      const bDraftNavigation = true;
      const transactionHelper = this.getTransactionHelper();
      const oRootViewController = this._getRootViewController();
      const model = oContext.getModel();
      let rightmostContext, siblingInfo;
      const oViewData = this.getView().getViewData();
      const sProgrammingModel = this.getProgrammingModel(oContext);
      let oRootContext = oContext;
      const oView = this.base.getView();
      try {
        if ((oViewData === null || oViewData === void 0 ? void 0 : oViewData.viewLevel) > 1) {
          if (sProgrammingModel === ProgrammingModel.Draft || sProgrammingModel === ProgrammingModel.Sticky) {
            oRootContext = await CommonUtils.createRootContext(sProgrammingModel, oView, this.getAppComponent());
          }
        }
        await this.base.editFlow.onBeforeEdit({
          context: oRootContext
        });
        const oNewDocumentContext = await transactionHelper.editDocument(oRootContext, this.getView(), this.getAppComponent(), this.getMessageHandler());
        this._setStickySessionInternalProperties(sProgrammingModel, model);
        if (oNewDocumentContext) {
          this.setEditMode(EditMode.Editable, false);
          this.setDocumentModified(false);
          this.getMessageHandler().showMessageDialog();
          if (oNewDocumentContext !== oRootContext) {
            let contextToNavigate = oNewDocumentContext;
            if (this._isFclEnabled()) {
              rightmostContext = oRootViewController.getRightmostContext();
              siblingInfo = await this._computeSiblingInformation(oRootContext, rightmostContext, sProgrammingModel, true);
              siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, oNewDocumentContext);
              this._updatePathsInHistory(siblingInfo.pathMapping);
              if (siblingInfo.targetContext.getPath() != oNewDocumentContext.getPath()) {
                contextToNavigate = siblingInfo.targetContext;
              }
            } else if ((oViewData === null || oViewData === void 0 ? void 0 : oViewData.viewLevel) > 1) {
              const rootSiblingPath = oNewDocumentContext === null || oNewDocumentContext === void 0 ? void 0 : oNewDocumentContext.getPath();
              const rootContextInfo = {
                rootSiblingPath: rootSiblingPath,
                rootContextNotRequired: true
              };
              siblingInfo = await this._computeSiblingInformation(oRootContext, oContext, sProgrammingModel, true, rootContextInfo);
              contextToNavigate = this._getNavigationTargetForEdit(oContext, oNewDocumentContext, siblingInfo);
            }
            await this._handleNewContext(contextToNavigate, true, false, bDraftNavigation, true);
            if (sProgrammingModel === ProgrammingModel.Sticky) {
              // The stickyOn handler must be set after the navigation has been done,
              // as the URL may change in the case of FCL
              let stickyContext;
              if (this._isFclEnabled()) {
                // We need to use the kept-alive context used to bind the page
                stickyContext = oNewDocumentContext.getModel().getKeepAliveContext(oNewDocumentContext.getPath());
              } else {
                stickyContext = oNewDocumentContext;
              }
              this.handleStickyOn(stickyContext);
            } else if (ModelHelper.isCollaborationDraftSupported(model.getMetaModel())) {
              // according to UX in case of enabled collaboration draft we share the object immediately
              await shareObject(oNewDocumentContext);
            }
          }
        }
      } catch (oError) {
        Log.error("Error while editing the document", oError);
      }
    }

    /**
     * Deletes several documents.
     *
     * @param contextsToDelete The contexts of the documents to be deleted
     * @param parameters The parameters
     * @returns Promise resolved once the documents are deleted
     */;
    _proto.deleteMultipleDocuments = async function deleteMultipleDocuments(contextsToDelete, parameters) {
      if (parameters) {
        parameters.beforeDeleteCallBack = this.base.editFlow.onBeforeDelete;
        parameters.requestSideEffects = parameters.requestSideEffects !== false;
      } else {
        parameters = {
          beforeDeleteCallBack: this.base.editFlow.onBeforeDelete,
          requestSideEffects: true
        };
      }
      const lockObject = this.getGlobalUIModel();
      const parentControl = this.getView().byId(parameters.controlId);
      if (!parentControl) {
        throw new Error("parameter controlId missing or incorrect");
      } else {
        parameters.parentControl = parentControl;
      }
      const listBinding = parentControl.getBinding("items") || parentControl.getRowBinding();
      parameters.bFindActiveContexts = true;
      BusyLocker.lock(lockObject);
      try {
        await this.deleteDocumentTransaction(contextsToDelete, parameters);
        let result;

        // Multiple object deletion is triggered from a list
        // First clear the selection in the table as it's not valid any more
        if (parentControl.isA("sap.ui.mdc.Table")) {
          parentControl.clearSelection();
        }

        // Then refresh the list-binding (LR), or require side-effects (OP)
        const viewBindingContext = this.getView().getBindingContext();
        if (listBinding.isRoot()) {
          // keep promise chain pending until refresh of listbinding is completed
          result = new Promise(resolve => {
            listBinding.attachEventOnce("dataReceived", function () {
              resolve();
            });
          });
          listBinding.refresh();
        } else if (viewBindingContext) {
          // if there are transient contexts, we must avoid requesting side effects
          // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
          // if list binding is refreshed, transient contexts might be lost
          if (parameters.requestSideEffects && !CommonUtils.hasTransientContext(listBinding)) {
            this.getAppComponent().getSideEffectsService().requestSideEffectsForNavigationProperty(listBinding.getPath(), viewBindingContext);
          }
        }

        // deleting at least one object should also set the UI to dirty
        if (!this.getAppComponent()._isFclEnabled()) {
          EditState.setEditStateDirty();
        }
        ActivitySync.send(this.getView(), Activity.Delete, contextsToDelete.map(context => context.getPath()));
        return result;
      } catch (error) {
        Log.error("Error while deleting the document(s)", error);
      } finally {
        BusyLocker.unlock(lockObject);
      }
    }

    /**
     * Updates the draft status and displays the error messages if there are errors during an update.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param updatedContext Context of the updated field
     * @param updatePromise Promise to determine when the update operation is completed. The promise should be resolved when the update operation is completed, so the draft status can be updated.
     * @returns Promise resolves once draft status has been updated
     * @alias sap.fe.core.controllerextensions.EditFlow#updateDocument
     * @public
     * @since 1.90.0
     */;
    _proto.updateDocument = function updateDocument(updatedContext, updatePromise) {
      const originalBindingContext = this.getView().getBindingContext();
      const isDraft = this.getProgrammingModel(updatedContext) === ProgrammingModel.Draft;
      this.getMessageHandler().removeTransitionMessages();
      return this.syncTask(async () => {
        if (originalBindingContext) {
          this.setDocumentModified(true);
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          if (isDraft) {
            this.setDraftStatus(DraftStatus.Saving);
          }
        }
        try {
          await updatePromise;
          const currentBindingContext = this.getView().getBindingContext();
          if (!isDraft || !currentBindingContext || currentBindingContext !== originalBindingContext) {
            // If a navigation happened while oPromise was being resolved, the binding context of the page changed
            return;
          }

          // We're still on the same context
          const metaModel = currentBindingContext.getModel().getMetaModel();
          const entitySetName = metaModel.getMetaContext(currentBindingContext.getPath()).getObject("@sapui.name");
          const semanticKeys = SemanticKeyHelper.getSemanticKeys(metaModel, entitySetName);
          if (semanticKeys !== null && semanticKeys !== void 0 && semanticKeys.length) {
            const currentSemanticMapping = this._getSemanticMapping();
            const currentSemanticPath = currentSemanticMapping === null || currentSemanticMapping === void 0 ? void 0 : currentSemanticMapping.semanticPath,
              sChangedPath = SemanticKeyHelper.getSemanticPath(currentBindingContext, true);
            // currentSemanticPath could be null if we have navigated via deep link then there are no semanticMappings to calculate it from
            if (currentSemanticPath && currentSemanticPath !== sChangedPath) {
              await this._handleNewContext(currentBindingContext, true, false, true);
            }
          }
          this.setDraftStatus(DraftStatus.Saved);
        } catch (error) {
          Log.error("Error while updating the document", error);
          if (isDraft && originalBindingContext) {
            this.setDraftStatus(DraftStatus.Clear);
          }
        } finally {
          await this.getMessageHandler().showMessages();
        }
      });
    }

    // Internal only params ---
    // * @param {string} mParameters.creationMode The creation mode using one of the following:
    // *                    Sync - the creation is triggered and once the document is created, the navigation is done
    // *                    Async - the creation and the navigation to the instance are done in parallel
    // *                    Deferred - the creation is done on the target page
    // *                    CreationRow - The creation is done inline async so the user is not blocked
    // mParameters.creationRow Instance of the creation row - (TODO: get rid but use list bindings only)

    /**
     * Creates a new document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param vListBinding  ODataListBinding object or the binding path for a temporary list binding
     * @param mInParameters Contains the following attributes:
     * @param mInParameters.creationMode The creation mode using one of the following:
     *                    NewPage - the created document is shown in a new page, depending on whether metadata 'Sync', 'Async' or 'Deferred' is used
     *                    Inline - The creation is done inline (in a table)
     *                    External - The creation is done in a different application specified via the parameter 'outbound'
     * @param mInParameters.tableId ID of the table
     * @param mInParameters.outbound The navigation target where the document is created in case of creationMode 'External'
     * @param mInParameters.createAtEnd Specifies if the new entry should be created at the top or bottom of a table in case of creationMode 'Inline'
     * @returns Promise resolves once the object has been created
     * @alias sap.fe.core.controllerextensions.EditFlow#createDocument
     * @public
     * @since 1.90.0
     */;
    _proto.createDocument = async function createDocument(vListBinding, mInParameters) {
      var _oCreation;
      const transactionHelper = this.getTransactionHelper(),
        oLockObject = this.getGlobalUIModel();
      let oTable; //should be Table but there are missing methods into the def
      let mParameters = mInParameters;
      let oCreation;
      const bShouldBusyLock = !mParameters || mParameters.creationMode !== CreationMode.Inline && mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.External;
      let oExecCustomValidation = Promise.resolve([]);
      const oAppComponent = this.getAppComponent();
      oAppComponent.getRouterProxy().removeIAppStateKey();
      if (mParameters.creationMode === CreationMode.External) {
        // Create by navigating to an external target
        // TODO: Call appropriate function (currently using the same as for outbound chevron nav, and without any context - 3rd param)
        await this.syncTask();
        const oController = this.getView().getController();
        const sCreatePath = ModelHelper.getAbsoluteMetaPathForListBinding(this.base.getView(), vListBinding);
        oController.handlers.onChevronPressNavigateOutBound(oController, mParameters.outbound, undefined, sCreatePath);
        return;
      }
      if (mParameters.creationMode === CreationMode.CreationRow && mParameters.creationRow) {
        const oCreationRowObjects = mParameters.creationRow.getBindingContext().getObject();
        delete oCreationRowObjects["@$ui5.context.isTransient"];
        oTable = mParameters.creationRow.getParent();
        oExecCustomValidation = this.validateDocument(oTable.getBindingContext(), {
          data: oCreationRowObjects,
          customValidationFunction: oTable.getCreationRow().data("customValidationFunction")
        });

        // disableAddRowButtonForEmptyData is set to false in manifest converter (Table.ts) if customValidationFunction exists
        if (oTable.getCreationRow().data("disableAddRowButtonForEmptyData") === "true") {
          const oInternalModelContext = oTable.getBindingContext("internal");
          oInternalModelContext.setProperty("creationRowFieldValidity", {});
        }
      }
      if (mParameters.creationMode === CreationMode.Inline && mParameters.tableId) {
        oTable = this.getView().byId(mParameters.tableId);
      }
      if (oTable && oTable.isA("sap.ui.mdc.Table")) {
        const fnFocusOrScroll = mParameters.creationMode === CreationMode.Inline ? oTable.focusRow.bind(oTable) : oTable.scrollToIndex.bind(oTable);
        oTable.getRowBinding().attachEventOnce("change", async function () {
          await oCreation;
          fnFocusOrScroll(mParameters.createAtEnd ? oTable.getRowBinding().getLength() : 0, true);
        });
      }
      const handleSideEffects = async (oListBinding, oCreationPromise) => {
        try {
          const oNewContext = await oCreationPromise;
          // transient contexts are reliably removed once oNewContext.created() is resolved
          await oNewContext.created();
          const oBindingContext = this.getView().getBindingContext();
          // if there are transient contexts, we must avoid requesting side effects
          // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
          // if list binding is refreshed, transient contexts might be lost
          if (!CommonUtils.hasTransientContext(oListBinding)) {
            const appComponent = this.getAppComponent();
            appComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext);
          }
        } catch (oError) {
          Log.error("Error while creating the document", oError);
        }
      };

      /**
       * @param aValidationMessages Error messages from custom validation function
       */
      const createCustomValidationMessages = aValidationMessages => {
        var _oTable$getBindingCon;
        const sCustomValidationFunction = oTable && oTable.getCreationRow().data("customValidationFunction");
        const mCustomValidity = oTable && ((_oTable$getBindingCon = oTable.getBindingContext("internal")) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getProperty("creationRowCustomValidity"));
        const oMessageManager = Core.getMessageManager();
        const aCustomMessages = [];
        let oFieldControl;
        let sTarget;

        // Remove existing CustomValidation message
        oMessageManager.getMessageModel().getData().forEach(function (oMessage) {
          if (oMessage.code === sCustomValidationFunction) {
            oMessageManager.removeMessages(oMessage);
          }
        });
        aValidationMessages.forEach(oValidationMessage => {
          // Handle Bound CustomValidation message
          if (oValidationMessage.messageTarget) {
            var _oFieldControl$getBin;
            oFieldControl = Core.getControl(mCustomValidity[oValidationMessage.messageTarget].fieldId);
            sTarget = `${(_oFieldControl$getBin = oFieldControl.getBindingContext()) === null || _oFieldControl$getBin === void 0 ? void 0 : _oFieldControl$getBin.getPath()}/${oFieldControl.getBindingPath("value")}`;
            // Add validation message if still not exists
            if (oMessageManager.getMessageModel().getData().filter(function (oMessage) {
              return oMessage.target === sTarget;
            }).length === 0) {
              oMessageManager.addMessages(new Message({
                message: oValidationMessage.messageText,
                processor: this.getView().getModel(),
                type: MessageType.Error,
                code: sCustomValidationFunction,
                technical: false,
                persistent: false,
                target: sTarget
              }));
            }
            // Add controlId in order to get the focus handling of the error popover runable
            const aExistingValidationMessages = oMessageManager.getMessageModel().getData().filter(function (oMessage) {
              return oMessage.target === sTarget;
            });
            aExistingValidationMessages[0].addControlId(mCustomValidity[oValidationMessage.messageTarget].fieldId);

            // Handle Unbound CustomValidation message
          } else {
            aCustomMessages.push({
              code: sCustomValidationFunction,
              text: oValidationMessage.messageText,
              persistent: true,
              type: MessageType.Error
            });
          }
        });
        if (aCustomMessages.length > 0) {
          this.getMessageHandler().showMessageDialog({
            customMessages: aCustomMessages
          });
        }
      };
      const resolveCreationMode = (initialCreationMode, programmingModel, oListBinding, oMetaModel) => {
        if (initialCreationMode && initialCreationMode !== CreationMode.NewPage) {
          // use the passed creation mode
          return initialCreationMode;
        } else {
          // NewAction is not yet supported for NavigationProperty collection
          if (!oListBinding.isRelative()) {
            const sPath = oListBinding.getPath(),
              // if NewAction with parameters is present, then creation is 'Deferred'
              // in the absence of NewAction or NewAction with parameters, creation is async
              sNewAction = programmingModel === ProgrammingModel.Draft ? oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction`) : oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction`);
            if (sNewAction) {
              const aParameters = oMetaModel.getObject(`/${sNewAction}/@$ui5.overload/0/$Parameter`) || [];
              // binding parameter (eg: _it) is not considered
              if (aParameters.length > 1) {
                return CreationMode.Deferred;
              }
            }
          }
          const sMetaPath = oMetaModel.getMetaPath(oListBinding === null || oListBinding === void 0 ? void 0 : oListBinding.getHeaderContext().getPath());
          const aNonComputedVisibleKeyFields = getNonComputedVisibleFields(oMetaModel, sMetaPath, this.getAppComponent());
          if (aNonComputedVisibleKeyFields.length > 0) {
            return CreationMode.Deferred;
          }
          return CreationMode.Async;
        }
      };
      if (bShouldBusyLock) {
        BusyLocker.lock(oLockObject);
      }
      try {
        const aValidationMessages = await this.syncTask(oExecCustomValidation);
        if (aValidationMessages.length > 0) {
          createCustomValidationMessages(aValidationMessages);
          Log.error("Custom Validation failed");
          // if custom validation fails, we leave the method immediately
          return;
        }
        let oListBinding;
        mParameters = mParameters || {};
        if (vListBinding && typeof vListBinding === "object") {
          // we already get a list binding use this one
          oListBinding = vListBinding;
        } else if (typeof vListBinding === "string") {
          oListBinding = new ODataListBinding(this.getView().getModel(), vListBinding);
          mParameters.creationMode = CreationMode.Sync;
          delete mParameters.createAtEnd;
        } else {
          throw new Error("Binding object or path expected");
        }
        const oModel = oListBinding.getModel();
        const sProgrammingModel = this.getProgrammingModel(oListBinding);
        const resolvedCreationMode = resolveCreationMode(mParameters.creationMode, sProgrammingModel, oListBinding, oModel.getMetaModel());
        let mArgs;
        const oCreationRow = mParameters.creationRow;
        let oCreationRowContext;
        let oPayload;
        let sMetaPath;
        const oMetaModel = oModel.getMetaModel();
        const oRoutingListener = this.getInternalRouting();
        if (resolvedCreationMode !== CreationMode.Deferred) {
          if (resolvedCreationMode === CreationMode.CreationRow) {
            oCreationRowContext = oCreationRow.getBindingContext();
            sMetaPath = oMetaModel.getMetaPath(oCreationRowContext.getPath());
            // prefill data from creation row
            oPayload = oCreationRowContext.getObject();
            mParameters.data = {};
            Object.keys(oPayload).forEach(function (sPropertyPath) {
              const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
              // ensure navigation properties are not part of the payload, deep create not supported
              if (oProperty && oProperty.$kind === "NavigationProperty") {
                return;
              }
              mParameters.data[sPropertyPath] = oPayload[sPropertyPath];
            });
            await this._checkForValidationErrors( /*oCreationRowContext*/);
          }
          if (resolvedCreationMode === CreationMode.CreationRow || resolvedCreationMode === CreationMode.Inline) {
            var _oTable, _oTable$getParent, _oTable$getParent$get;
            mParameters.keepTransientContextOnFailed = false; // currently not fully supported
            // busy handling shall be done locally only
            mParameters.busyMode = "Local";
            mParameters.busyId = (_oTable = oTable) === null || _oTable === void 0 ? void 0 : (_oTable$getParent = _oTable.getParent()) === null || _oTable$getParent === void 0 ? void 0 : (_oTable$getParent$get = _oTable$getParent.getTableDefinition()) === null || _oTable$getParent$get === void 0 ? void 0 : _oTable$getParent$get.annotation.id;

            // take care on message handling, draft indicator (in case of draft)
            // Attach the create sent and create completed event to the object page binding so that we can react
            this.handleCreateEvents(oListBinding);
          }
          if (!mParameters.parentControl) {
            mParameters.parentControl = this.getView();
          }
          mParameters.beforeCreateCallBack = this.onBeforeCreate;

          // In case the application was called with preferredMode=autoCreateWith, we want to skip the
          // action parameter dialog
          mParameters.skipParameterDialog = oAppComponent.getStartupMode() === StartupMode.AutoCreate;
          oCreation = transactionHelper.createDocument(oListBinding, mParameters, this.getAppComponent(), this.getMessageHandler(), false);
          // SideEffects on Create
          // if Save is pressed directly after filling the CreationRow, no SideEffects request
          if (!mParameters.bSkipSideEffects) {
            handleSideEffects(oListBinding, oCreation);
          }
        }
        let oNavigation;
        switch (resolvedCreationMode) {
          case CreationMode.Deferred:
            oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
              bDeferredContext: true,
              editable: true,
              bForceFocus: true
            });
            break;
          case CreationMode.Async:
            oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
              asyncContext: oCreation,
              editable: true,
              bForceFocus: true
            });
            break;
          case CreationMode.Sync:
            mArgs = {
              editable: true,
              bForceFocus: true
            };
            if (sProgrammingModel == ProgrammingModel.Sticky || mParameters.createAction) {
              mArgs.transient = true;
            }
            oNavigation = (_oCreation = oCreation) === null || _oCreation === void 0 ? void 0 : _oCreation.then(function (oNewDocumentContext) {
              if (!oNewDocumentContext) {
                const coreResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
                return oRoutingListener.navigateToMessagePage(coreResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"), {
                  title: coreResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
                  description: coreResourceBundle.getText("C_EDITFLOW_SAPFE_CREATION_FAILED_DESCRIPTION")
                });
              } else {
                // In case the Sync creation was triggered for a deferred creation, we don't navigate forward
                // as we're already on the corresponding ObjectPage
                return mParameters.bFromDeferred ? oRoutingListener.navigateToContext(oNewDocumentContext, mArgs) : oRoutingListener.navigateForwardToContext(oNewDocumentContext, mArgs);
              }
            });
            break;
          case CreationMode.Inline:
            this.syncTask(oCreation);
            break;
          case CreationMode.CreationRow:
            // the creation row shall be cleared once the validation check was successful and
            // therefore the POST can be sent async to the backend
            try {
              const oCreationRowListBinding = oCreationRowContext.getBinding();
              const oNewTransientContext = oCreationRowListBinding.create();
              oCreationRow.setBindingContext(oNewTransientContext);

              // this is needed to avoid console errors TO be checked with model colleagues
              oNewTransientContext.created().catch(function () {
                Log.trace("transient fast creation context deleted");
              });
              oNavigation = oCreationRowContext.delete("$direct");
            } catch (oError) {
              // Reset busy indicator after a validation error
              if (BusyLocker.isLocked(this.getView().getModel("ui"))) {
                BusyLocker.unlock(this.getView().getModel("ui"));
              }
              Log.error("CreationRow navigation error: ", oError);
            }
            break;
          default:
            oNavigation = Promise.reject(`Unhandled creationMode ${resolvedCreationMode}`);
            break;
        }
        if (oCreation) {
          try {
            const aParams = await Promise.all([oCreation, oNavigation]);
            this._setStickySessionInternalProperties(sProgrammingModel, oModel);
            this.setEditMode(EditMode.Editable); // The createMode flag will be set in computeEditMode
            if (!oListBinding.isRelative() && sProgrammingModel === ProgrammingModel.Sticky) {
              var _entitySet$annotation, _entitySet$annotation2;
              // Workaround to tell the OP that we've created a new object from the LR
              const metaModel = oListBinding.getModel().getMetaModel();
              const metaContext = metaModel.bindContext(metaModel.getMetaPath(oListBinding.getPath()));
              const entitySet = getInvolvedDataModelObjects(metaContext).startingEntitySet;
              const newAction = entitySet === null || entitySet === void 0 ? void 0 : (_entitySet$annotation = entitySet.annotations.Session) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.StickySessionSupported) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.NewAction;
              this.getInternalModel().setProperty("/lastInvokedAction", newAction);
            }
            const oNewDocumentContext = aParams[0];
            if (oNewDocumentContext) {
              this.setDocumentModifiedOnCreate(oListBinding);
              if (!this._isFclEnabled()) {
                EditState.setEditStateDirty();
              }
              this._sendActivity(Activity.Create, oNewDocumentContext);
              if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel()) && !ActivitySync.isConnected(this.getView())) {
                // according to UX in case of enabled collaboration draft we share the object immediately
                await shareObject(oNewDocumentContext);
              }
            }
          } catch (error) {
            // TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
            if (error === Constants.CancelActionDialog || error === Constants.ActionExecutionFailed || error === Constants.CreationFailed) {
              // creation has been cancelled by user or failed in backend => in case we have navigated to transient context before, navigate back
              // the switch-statement above seems to indicate that this happens in creationModes deferred and async. But in fact, in these cases after the navigation from routeMatched in OP component
              // createDeferredContext is triggerd, which calls this method (createDocument) again - this time with creationMode sync. Therefore, also in that mode we need to trigger back navigation.
              // The other cases might still be needed in case the navigation fails.
              if (resolvedCreationMode === CreationMode.Sync || resolvedCreationMode === CreationMode.Deferred || resolvedCreationMode === CreationMode.Async) {
                oRoutingListener.navigateBackFromTransientState();
              }
            }
            throw error;
          }
        }
      } finally {
        if (bShouldBusyLock) {
          BusyLocker.unlock(oLockObject);
        }
      }
    }

    /**
     * Validates a document.
     *
     * @returns Promise resolves with result of the custom validation function
     */;
    _proto.validateDocument = function validateDocument(context, parameters) {
      return this.getTransactionHelper().validateDocument(context, parameters, this.getView());
    }

    /**
     * Creates several documents.
     *
     * @param listBinding The listBinding used to create the documents
     * @param dataForCreate The initial data for the new documents
     * @param createAtEnd True if the new contexts need to be created at the end of the list binding
     * @param isFromCopyPaste True if the creation has been triggered by a paste action
     * @param beforeCreateCallBack Callback to be called before the creation
     * @param createAsInactive True if the contexts need to be created as inactive
     * @param requestSideEffects True by default, false if SideEffects should not be requested
     * @returns A Promise with the newly created contexts.
     */;
    _proto.createMultipleDocuments = async function createMultipleDocuments(listBinding, dataForCreate, createAtEnd, isFromCopyPaste, beforeCreateCallBack) {
      let createAsInactive = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      let requestSideEffects = arguments.length > 6 ? arguments[6] : undefined;
      const transactionHelper = this.getTransactionHelper();
      const lockObject = this.getGlobalUIModel();
      const targetListBinding = listBinding;
      requestSideEffects = requestSideEffects !== false;
      BusyLocker.lock(lockObject);
      try {
        await this.syncTask();
        if (beforeCreateCallBack) {
          await beforeCreateCallBack({
            contextPath: targetListBinding.getPath()
          });
        }
        const metaModel = targetListBinding.getModel().getMetaModel();
        let metaPath;
        if (targetListBinding.getContext()) {
          metaPath = metaModel.getMetaPath(`${targetListBinding.getContext().getPath()}/${targetListBinding.getPath()}`);
        } else {
          metaPath = metaModel.getMetaPath(targetListBinding.getPath());
        }
        this.handleCreateEvents(targetListBinding);

        // Iterate on all items and store the corresponding creation promise
        const creationPromises = dataForCreate.map(propertyValues => {
          const createParameters = {
            data: {}
          };
          createParameters.keepTransientContextOnFailed = false; // currently not fully supported
          createParameters.busyMode = "None";
          createParameters.creationMode = CreationMode.CreationRow;
          createParameters.parentControl = this.getView();
          createParameters.createAtEnd = createAtEnd;
          createParameters.inactive = createAsInactive;

          // Remove navigation properties as we don't support deep create
          for (const propertyPath in propertyValues) {
            const property = metaModel.getObject(`${metaPath}/${propertyPath}`);
            if (property && property.$kind !== "NavigationProperty" && propertyPath.indexOf("/") < 0 && propertyValues[propertyPath]) {
              createParameters.data[propertyPath] = propertyValues[propertyPath];
            }
          }
          return transactionHelper.createDocument(targetListBinding, createParameters, this.getAppComponent(), this.getMessageHandler(), isFromCopyPaste);
        });
        const createdContexts = await Promise.all(creationPromises);
        if (!createAsInactive) {
          this.setDocumentModifiedOnCreate(targetListBinding);
        }
        // transient contexts are reliably removed once oNewContext.created() is resolved
        await Promise.all(createdContexts.map(newContext => {
          if (!newContext.bInactive) {
            return newContext.created();
          }
        }));
        const viewBindingContext = this.getView().getBindingContext();

        // if there are transient contexts, we must avoid requesting side effects
        // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
        // if list binding is refreshed, transient contexts might be lost
        if (requestSideEffects && !CommonUtils.hasTransientContext(targetListBinding)) {
          this.getAppComponent().getSideEffectsService().requestSideEffectsForNavigationProperty(targetListBinding.getPath(), viewBindingContext);
        }
        return createdContexts;
      } catch (err) {
        Log.error("Error while creating multiple documents.");
        throw err;
      } finally {
        BusyLocker.unlock(lockObject);
      }
    }

    /**
     * This function can be used to intercept the 'Save' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Save' action.
     * If you reject the promise, the 'Save' action is stopped and the user stays in edit mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeSave
     * @param _mParameters.context Page context that is going to be saved.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Save' action is triggered. If rejected, the 'Save' action is not triggered and the user stays in edit mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeSave
     * @public
     * @since 1.90.0
     */;
    _proto.onBeforeSave = function onBeforeSave(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    /**
     * This function can be used to intercept the 'Create' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Create' action.
     * If you reject the promise, the 'Create' action is stopped.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeCreate
     * @param _mParameters.contextPath Path pointing to the context on which Create action is triggered
     * @param _mParameters.createParameters Array of values that are filled in the Action Parameter Dialog
     * @returns A promise to be returned by the overridden method. If resolved, the 'Create' action is triggered. If rejected, the 'Create' action is not triggered.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeCreate
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeCreate = function onBeforeCreate(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    /**
     * This function can be used to intercept the 'Edit' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Edit' action.
     * If you reject the promise, the 'Edit' action is stopped and the user stays in display mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeEdit
     * @param _mParameters.context Page context that is going to be edited.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Edit' action is triggered. If rejected, the 'Edit' action is not triggered and the user stays in display mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeEdit
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeEdit = function onBeforeEdit(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    /**
     * This function can be used to intercept the 'Discard' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Discard' action.
     * If you reject the promise, the 'Discard' action is stopped and the user stays in edit mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeDiscard
     * @param _mParameters.context Page context that is going to be discarded.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Discard' action is triggered. If rejected, the 'Discard' action is not triggered and the user stays in edit mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDiscard
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeDiscard = function onBeforeDiscard(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    /**
     * This function can be used to intercept the 'Delete' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Delete' action.
     * If you reject the promise, the 'Delete' action is stopped.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param _mParameters Object containing the parameters passed to onBeforeDelete
     * @param _mParameters.contexts An array of contexts that are going to be deleted
     * @returns A promise to be returned by the overridden method. If resolved, the 'Delete' action is triggered. If rejected, the 'Delete' action is not triggered.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDelete
     * @public
     * @since 1.98.0
     */;
    _proto.onBeforeDelete = function onBeforeDelete(_mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    // Internal only params ---
    // @param {boolean} mParameters.bExecuteSideEffectsOnError Indicates whether SideEffects need to be ignored when user clicks on Save during an Inline creation
    // @param {object} mParameters.bindings List bindings of the tables in the view.
    // Both of the above parameters are for the same purpose. User can enter some information in the creation row(s) but does not 'Add row', instead clicks Save.
    // There can be more than one in the view.

    /**
     * Saves a new document after checking it.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the editable document
     * @param mParameters PRIVATE
     * @returns Promise resolves once save is complete
     * @alias sap.fe.core.controllerextensions.EditFlow#saveDocument
     * @public
     * @since 1.90.0
     */;
    _proto.saveDocument = async function saveDocument(oContext, mParameters) {
      mParameters = mParameters || {};
      const bExecuteSideEffectsOnError = mParameters.bExecuteSideEffectsOnError || undefined;
      const bDraftNavigation = true;
      const transactionHelper = this.getTransactionHelper();
      const aBindings = mParameters.bindings;
      try {
        await this.syncTask();
        // in case of saving / activating the bound transition messages shall be removed before the PATCH/POST
        // is sent to the backend
        this.getMessageHandler().removeTransitionMessages();
        await this._submitOpenChanges(oContext);
        await this._checkForValidationErrors();
        await this.base.editFlow.onBeforeSave({
          context: oContext
        });
        const sProgrammingModel = this.getProgrammingModel(oContext);
        const oRootViewController = this._getRootViewController();
        let siblingInfo;
        if ((sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) && oRootViewController.isFclEnabled()) {
          // No need to try to get rightmost context in case of a new object
          siblingInfo = await this._computeSiblingInformation(oContext, oRootViewController.getRightmostContext(), sProgrammingModel, true);
        }
        const activeDocumentContext = await transactionHelper.saveDocument(oContext, this.getAppComponent(), this._getResourceModel(), bExecuteSideEffectsOnError, aBindings, this.getMessageHandler(), this.getCreationMode());
        this._removeStickySessionInternalProperties(sProgrammingModel);
        this._sendActivity(Activity.Activate, activeDocumentContext);
        ActivitySync.disconnect(this.getView());
        this._triggerConfiguredSurvey(StandardActions.save, TriggerType.standardAction);
        this.setDocumentModified(false);
        this.setEditMode(EditMode.Display, false);
        this.getMessageHandler().showMessageDialog();
        if (activeDocumentContext !== oContext) {
          let contextToNavigate = activeDocumentContext;
          if (oRootViewController.isFclEnabled()) {
            siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, activeDocumentContext);
            this._updatePathsInHistory(siblingInfo.pathMapping);
            if (siblingInfo.targetContext.getPath() !== activeDocumentContext.getPath()) {
              contextToNavigate = siblingInfo.targetContext;
            }
          }
          await this._handleNewContext(contextToNavigate, false, false, bDraftNavigation, true);
        }
      } catch (oError) {
        if (!(oError && oError.canceled)) {
          Log.error("Error while saving the document", oError);
        }
        throw oError;
      }
    }

    /**
     * Switches the UI between draft and active document.
     *
     * @param oContext The context to switch from
     * @returns Promise resolved once the switch is done
     */;
    _proto.toggleDraftActive = async function toggleDraftActive(oContext) {
      const oContextData = oContext.getObject();
      let bEditable;
      const bIsDraft = oContext && this.getProgrammingModel(oContext) === ProgrammingModel.Draft;

      //toggle between draft and active document is only available for edit drafts and active documents with draft)
      if (!bIsDraft || !(!oContextData.IsActiveEntity && oContextData.HasActiveEntity || oContextData.IsActiveEntity && oContextData.HasDraftEntity)) {
        return;
      }
      if (!oContextData.IsActiveEntity && oContextData.HasActiveEntity) {
        //start Point: edit draft
        bEditable = false;
      } else {
        // start point active document
        bEditable = true;
      }
      try {
        const oRootViewController = this._getRootViewController();
        const oRightmostContext = oRootViewController.isFclEnabled() ? oRootViewController.getRightmostContext() : oContext;
        let siblingInfo = await this._computeSiblingInformation(oContext, oRightmostContext, ProgrammingModel.Draft, false);
        if (!siblingInfo && oContext !== oRightmostContext) {
          // Try to compute sibling info for the root context if it fails for the rightmost context
          // --> In case of FCL, if we try to switch between draft and active but a child entity has no sibling, the switch will close the child column
          siblingInfo = await this._computeSiblingInformation(oContext, oContext, ProgrammingModel.Draft, false);
        }
        if (siblingInfo) {
          this.setEditMode(bEditable ? EditMode.Editable : EditMode.Display, false); //switch to edit mode only if a draft is available

          if (oRootViewController.isFclEnabled()) {
            const lastSemanticMapping = this._getSemanticMapping();
            if ((lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.technicalPath) === oContext.getPath()) {
              const targetPath = siblingInfo.pathMapping[siblingInfo.pathMapping.length - 1].newPath;
              siblingInfo.pathMapping.push({
                oldPath: lastSemanticMapping.semanticPath,
                newPath: targetPath
              });
            }
            this._updatePathsInHistory(siblingInfo.pathMapping);
          }
          await this._handleNewContext(siblingInfo.targetContext, bEditable, true, true, true);
        } else {
          throw new Error("Error in EditFlow.toggleDraftActive - Cannot find sibling");
        }
      } catch (oError) {
        throw new Error(`Error in EditFlow.toggleDraftActive:${oError}`);
      }
    }

    // Internal only params ---
    // @param {sap.m.Button} mParameters.cancelButton - Currently this is passed as cancelButton internally (replaced by mParameters.control in the JSDoc below). Currently it is also mandatory.
    // Plan - This should not be mandatory. If not provided, we should have a default that can act as reference control for the discard popover OR we can show a dialog instead of a popover.

    /**
     * Discard the editable document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the editable document
     * @param mParameters Can contain the following attributes:
     * @param mParameters.control This is the control used to open the discard popover
     * @param mParameters.skipDiscardPopover Optional, supresses the discard popover and allows custom handling
     * @returns Promise resolves once editable document has been discarded
     * @alias sap.fe.core.controllerextensions.EditFlow#cancelDocument
     * @public
     * @since 1.90.0
     */;
    _proto.cancelDocument = async function cancelDocument(oContext, mParameters) {
      const transactionHelper = this.getTransactionHelper();
      const mInParameters = mParameters;
      let siblingInfo;
      let isNewDocument = false;
      mInParameters.cancelButton = mParameters.control || mInParameters.cancelButton;
      mInParameters.beforeCancelCallBack = this.base.editFlow.onBeforeDiscard;
      try {
        await this.syncTask();
        const sProgrammingModel = this.getProgrammingModel(oContext);
        if ((sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) && this._isFclEnabled()) {
          const oRootViewController = this._getRootViewController();

          // No need to try to get rightmost context in case of a new object
          siblingInfo = await this._computeSiblingInformation(oContext, oRootViewController.getRightmostContext(), sProgrammingModel, true);
        }
        const cancelResult = await transactionHelper.cancelDocument(oContext, mInParameters, this.getAppComponent(), this._getResourceModel(), this.getMessageHandler(), this.getCreationMode(), this.isDocumentModified());
        this._getRootViewController().getInstancedViews().forEach(view => {
          const context = view.getBindingContext();
          if (context && context.isKeepAlive()) {
            context.setKeepAlive(false);
          }
        });
        const bDraftNavigation = true;
        this._removeStickySessionInternalProperties(sProgrammingModel);
        this.setEditMode(EditMode.Display, false);
        this.setDocumentModified(false);
        this.setDraftStatus(DraftStatus.Clear);
        // we force the edit state even for FCL because the draft discard might not be implemented
        // and we may just delete the draft
        EditState.setEditStateDirty();
        if (!cancelResult) {
          this._sendActivity(Activity.Discard, undefined);
          ActivitySync.disconnect(this.getView());
          //in case of a new document, no activeContext is returned --> navigate back.
          if (!mInParameters.skipBackNavigation) {
            await this.getInternalRouting().navigateBackFromContext(oContext);
            isNewDocument = true;
          }
        } else {
          const oActiveDocumentContext = cancelResult;
          this._sendActivity(Activity.Discard, oActiveDocumentContext);
          ActivitySync.disconnect(this.getView());
          let contextToNavigate = oActiveDocumentContext;
          if (this._isFclEnabled()) {
            siblingInfo = siblingInfo ?? this._createSiblingInfo(oContext, oActiveDocumentContext);
            this._updatePathsInHistory(siblingInfo.pathMapping);
            if (siblingInfo.targetContext.getPath() !== oActiveDocumentContext.getPath()) {
              contextToNavigate = siblingInfo.targetContext;
            }
          }
          if (sProgrammingModel === ProgrammingModel.Draft) {
            // We need to load the semantic keys of the active context, as we need them
            // for the navigation
            await this._fetchSemanticKeyValues(oActiveDocumentContext);
            // We force the recreation of the context, so that it's created and bound in the same microtask,
            // so that all properties are loaded together by autoExpandSelect, so that when switching back to Edit mode
            // $$inheritExpandSelect takes all loaded properties into account (BCP 2070462265)
            if (!mInParameters.skipBindingToView) {
              await this._handleNewContext(contextToNavigate, false, true, bDraftNavigation, true);
            } else {
              return oActiveDocumentContext;
            }
          } else {
            //active context is returned in case of cancel of existing document
            await this._handleNewContext(contextToNavigate, false, false, bDraftNavigation, true);
          }
        }
        if (sProgrammingModel === ProgrammingModel.Draft) {
          //show Draft discarded message toast only for draft enabled apps
          this.showDocumentDiscardMessage(isNewDocument);
        }
      } catch (oError) {
        Log.error("Error while discarding the document", oError);
      }
    }

    /**
     * Brings up a message toast when a draft is discarded.
     *
     * @param isNewDocument This is a Boolean flag that determines whether the document is new or already exists.
     */;
    _proto.showDocumentDiscardMessage = function showDocumentDiscardMessage(isNewDocument) {
      const resourceModel = this._getResourceModel();
      const message = resourceModel.getText("C_TRANSACTION_HELPER_DISCARD_DRAFT_TOAST");
      if (isNewDocument == true) {
        const appComponent = this.getAppComponent();
        appComponent.getRoutingService().attachAfterRouteMatched(this.showMessageWhenNoContext, this);
      } else {
        MessageToast.show(message);
      }
    }

    /**
     * We use this function in showDocumentDiscardMessage when no context is passed.
     */;
    _proto.showMessageWhenNoContext = function showMessageWhenNoContext() {
      const resourceModel = this._getResourceModel();
      const message = resourceModel.getText("C_TRANSACTION_HELPER_DISCARD_DRAFT_TOAST");
      const appComponent = this.getAppComponent();
      MessageToast.show(message);
      appComponent.getRoutingService().detachAfterRouteMatched(this.showMessageWhenNoContext, this);
    }
    /**
     * Checks if a context corresponds to a draft root.
     *
     * @param context The context to check
     * @returns True if the context points to a draft root
     * @private
     */;
    _proto.isDraftRoot = function isDraftRoot(context) {
      const metaModel = context.getModel().getMetaModel();
      const metaContext = metaModel.getMetaContext(context.getPath());
      return ModelHelper.isDraftRoot(getInvolvedDataModelObjects(metaContext).targetEntitySet);
    }

    // Internal only params ---
    // @param {string} mParameters.entitySetName Name of the EntitySet to which the object belongs

    /**
     * Deletes the document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the document
     * @param mInParameters Can contain the following attributes:
     * @param mInParameters.title Title of the object being deleted
     * @param mInParameters.description Description of the object being deleted
     * @returns Promise resolves once document has been deleted
     * @alias sap.fe.core.controllerextensions.EditFlow#deleteDocument
     * @public
     * @since 1.90.0
     */;
    _proto.deleteDocument = async function deleteDocument(oContext, mInParameters) {
      const oAppComponent = this.getAppComponent();
      let mParameters = mInParameters;
      if (!mParameters) {
        mParameters = {
          bFindActiveContexts: false
        };
      } else {
        mParameters.bFindActiveContexts = false;
      }
      mParameters.beforeDeleteCallBack = this.base.editFlow.onBeforeDelete;
      try {
        if (this._isFclEnabled() && this.isDraftRoot(oContext) && oContext.getIndex() === undefined && oContext.getProperty("IsActiveEntity") === true && oContext.getProperty("HasDraftEntity") === true) {
          // Deleting an active entity which has a draft that could potentially be displayed in the ListReport (FCL case)
          // --> need to remove the draft from the LR and replace it with the active version, so that the ListBinding is properly refreshed
          // The condition 'oContext.getIndex() === undefined' makes sure the active version isn't already displayed in the LR
          mParameters.beforeDeleteCallBack = async parameters => {
            await this.base.editFlow.onBeforeDelete(parameters);
            try {
              const model = oContext.getModel();
              const siblingContext = model.bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
              const draftPath = await siblingContext.requestCanonicalPath();
              const draftContextToRemove = model.getKeepAliveContext(draftPath);
              draftContextToRemove.replaceWith(oContext);
            } catch (error) {
              Log.error("Error while replacing the draft instance in the LR ODLB", error);
            }
          };
        }
        await this.deleteDocumentTransaction(oContext, mParameters);

        // Single objet deletion is triggered from an OP header button (not from a list)
        // --> Mark UI dirty and navigate back to dismiss the OP
        if (!this._isFclEnabled()) {
          EditState.setEditStateDirty();
        }
        this._sendActivity(Activity.Delete, oContext);

        // After delete is successfull, we need to detach the setBackNavigation Methods
        if (oAppComponent) {
          oAppComponent.getShellServices().setBackNavigation();
        }
        if ((oAppComponent === null || oAppComponent === void 0 ? void 0 : oAppComponent.getStartupMode()) === StartupMode.Deeplink && !this._isFclEnabled()) {
          // In case the app has been launched with semantic keys, deleting the object we've landed on shall navigate back
          // to the app we came from (except for FCL, where we navigate to LR as usual)
          oAppComponent.getRouterProxy().exitFromApp();
        } else {
          this.getInternalRouting().navigateBackFromContext(oContext);
        }
      } catch (error) {
        Log.error("Error while deleting the document", error);
      }
    }

    /**
     * Submit the current set of changes and navigate back.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the document
     * @returns Promise resolves once the changes have been saved
     * @alias sap.fe.core.controllerextensions.EditFlow#applyDocument
     * @public
     * @since 1.90.0
     */;
    _proto.applyDocument = async function applyDocument(oContext) {
      const oLockObject = this.getGlobalUIModel();
      try {
        await this.syncTask();
        if (oContext.getModel().hasPendingChanges("$auto")) {
          BusyLocker.lock(oLockObject);
          await this._submitOpenChanges(oContext);
        }
        await this._checkForValidationErrors();
        await this.getMessageHandler().showMessageDialog();
        await this.getInternalRouting().navigateBackFromContext(oContext);
      } finally {
        if (BusyLocker.isLocked(oLockObject)) {
          BusyLocker.unlock(oLockObject);
        }
      }
    }

    // Internal only params ---
    // @param {boolean} [mParameters.bStaticAction] Boolean value for static action, undefined for other actions
    // @param {boolean} [mParameters.isNavigable] Boolean value indicating whether navigation is required after the action has been executed
    // Currently the parameter isNavigable is used internally and should be changed to requiresNavigation as it is a more apt name for this param

    /**
     * Invokes an action (bound or unbound) and tracks the changes so that other pages can be refreshed and show the updated data upon navigation.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param sActionName The name of the action to be called
     * @param mInParameters Contains the following attributes:
     * @param mInParameters.parameterValues A map of action parameter names and provided values
     * @param mInParameters.parameterValues.name Name of the parameter
     * @param mInParameters.parameterValues.value Value of the parameter
     * @param mInParameters.skipParameterDialog Skips the action parameter dialog if values are provided for all of them in parameterValues
     * @param mInParameters.contexts For a bound action, a context or an array with contexts for which the action is to be called must be provided
     * @param mInParameters.model For an unbound action, an instance of an OData V4 model must be provided
     * @param mInParameters.requiresNavigation Boolean value indicating whether navigation is required after the action has been executed. Navigation takes place to the context returned by the action
     * @param mInParameters.label A human-readable label for the action. This is needed in case the action has a parameter and a parameter dialog is shown to the user. The label will be used for the title of the dialog and for the confirmation button
     * @param mInParameters.invocationGrouping Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
     * @param mExtraParams PRIVATE
     * @returns A promise which resolves once the action has been executed, providing the response
     * @alias sap.fe.core.controllerextensions.EditFlow#invokeAction
     * @public
     * @since 1.90.0
     * @final
     */;
    _proto.invokeAction = async function invokeAction(sActionName, mInParameters, mExtraParams) {
      var _this$getView$getMode;
      let oControl;
      const transactionHelper = this.getTransactionHelper();
      let aParts;
      let sOverloadEntityType;
      let oCurrentActionCallBacks;
      const oView = this.base.getView();
      let mParameters = mInParameters || {};
      // Due to a mistake the invokeAction in the extensionAPI had a different API than this one.
      // The one from the extensionAPI doesn't exist anymore as we expose the full edit flow now but
      // due to compatibility reasons we still need to support the old signature
      if (mParameters.isA && mParameters.isA("sap.ui.model.odata.v4.Context") || Array.isArray(mParameters) || mExtraParams !== undefined) {
        const contexts = mParameters;
        mParameters = mExtraParams || {};
        if (contexts) {
          mParameters.contexts = contexts;
        } else {
          mParameters.model = this.getView().getModel();
        }
      }
      mParameters.isNavigable = mParameters.requiresNavigation || mParameters.isNavigable;

      // Determine if the referenced action is bound or unbound
      const convertedMetadata = convertTypes((_this$getView$getMode = this.getView().getModel()) === null || _this$getView$getMode === void 0 ? void 0 : _this$getView$getMode.getMetaModel());
      // The EntityContainer may NOT be missing, so it should not be able to be undefined, but since in our converted Metadata
      // it can be undefined, I need this workaround here of adding "" since indexOf does not accept something that's
      // undefined.
      if (sActionName.indexOf("" + convertedMetadata.entityContainer.name) > -1) {
        // Unbound actions are always referenced via the action import and we found the EntityContainer in the sActionName so
        // an unbound action is referenced!
        mParameters.isBound = false;
      } else {
        // No entity container in the sActionName, so either a bound or static action is referenced which is also bound!
        mParameters.isBound = true;
      }
      if (!mParameters.parentControl) {
        mParameters.parentControl = this.getView();
      }
      if (mParameters.controlId) {
        oControl = this.getView().byId(mParameters.controlId);
        if (oControl) {
          // TODO: currently this selected contexts update is done within the operation, should be moved out
          mParameters.internalModelContext = oControl.getBindingContext("internal");
        }
      } else {
        mParameters.internalModelContext = oView.getBindingContext("internal");
      }
      if (sActionName && sActionName.indexOf("(") > -1) {
        // get entity type of action overload and remove it from the action path
        // Example sActionName = "<ActionName>(Collection(<OverloadEntityType>))"
        // sActionName = aParts[0] --> <ActionName>
        // sOverloadEntityType = aParts[2] --> <OverloadEntityType>
        aParts = sActionName.split("(");
        sActionName = aParts[0];
        sOverloadEntityType = aParts[aParts.length - 1].replaceAll(")", "");
      }
      if (mParameters.bStaticAction) {
        if (oControl.isTableBound()) {
          mParameters.contexts = oControl.getRowBinding().getHeaderContext();
        } else {
          const sBindingPath = oControl.data("rowsBindingInfo").path,
            oListBinding = new ODataListBinding(this.getView().getModel(), sBindingPath);
          mParameters.contexts = oListBinding.getHeaderContext();
        }
        if (sOverloadEntityType && oControl.getBindingContext()) {
          mParameters.contexts = this._getActionOverloadContextFromMetadataPath(oControl.getBindingContext(), oControl.getRowBinding(), sOverloadEntityType);
        }
        if (mParameters.enableAutoScroll) {
          oCurrentActionCallBacks = this.createActionPromise(sActionName, oControl.sId);
        }
      }
      mParameters.bGetBoundContext = this._getBoundContext(oView, mParameters);
      // Need to know that the action is called from ObjectPage for changeSet Isolated workaround
      mParameters.bObjectPage = oView.getViewData().converterType === "ObjectPage";
      try {
        await this.syncTask();
        const oResponse = await transactionHelper.callAction(sActionName, mParameters, this.getView(), this.getAppComponent(), this.getMessageHandler());
        let listRefreshed;
        if (mParameters.contexts && mParameters.isBound === true) {
          listRefreshed = await this._refreshListIfRequired(this.getActionResponseDataAndKeys(sActionName, oResponse), mParameters.contexts[0]);
        }
        if (ActivitySync.isConnected(this.getView())) {
          let actionRequestedProperties = [];
          if (oResponse) {
            actionRequestedProperties = Array.isArray(oResponse) ? Object.keys(oResponse[0].value.getObject()) : Object.keys(oResponse.getObject());
          }
          this._sendActivity(Activity.Action, mParameters.contexts, sActionName, listRefreshed, actionRequestedProperties);
        }
        this._triggerConfiguredSurvey(sActionName, TriggerType.action);
        if (oCurrentActionCallBacks) {
          oCurrentActionCallBacks.fResolver(oResponse);
        }
        /*
        		We set the (upper) pages to dirty after an execution of an action
        		TODO: get rid of this workaround
        		This workaround is only needed as long as the model does not support the synchronization.
        		Once this is supported we don't need to set the pages to dirty anymore as the context itself
        		is already refreshed (it's just not reflected in the object page)
        		we explicitly don't call this method from the list report but only call it from the object page
        		as if it is called in the list report it's not needed - as we anyway will remove this logic
        		we can live with this
        		we need a context to set the upper pages to dirty - if there are more than one we use the
        		first one as they are anyway siblings
        		*/
        if (mParameters.contexts) {
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          this.getInternalModel().setProperty("/lastInvokedAction", sActionName);
        }
        if (mParameters.isNavigable) {
          let vContext = oResponse;
          if (Array.isArray(vContext) && vContext.length === 1) {
            vContext = vContext[0].value;
          }
          if (vContext && !Array.isArray(vContext)) {
            const oMetaModel = oView.getModel().getMetaModel();
            const sContextMetaPath = oMetaModel.getMetaPath(vContext.getPath());
            const _fnValidContexts = (contexts, applicableContexts) => {
              return contexts.filter(element => {
                if (applicableContexts) {
                  return applicableContexts.indexOf(element) > -1;
                }
                return true;
              });
            };
            const oActionContext = Array.isArray(mParameters.contexts) ? _fnValidContexts(mParameters.contexts, mParameters.applicableContexts)[0] : mParameters.contexts;
            const sActionContextMetaPath = oActionContext && oMetaModel.getMetaPath(oActionContext.getPath());
            if (sContextMetaPath != undefined && sContextMetaPath === sActionContextMetaPath) {
              if (oActionContext.getPath() !== vContext.getPath()) {
                this.getInternalRouting().navigateForwardToContext(vContext, {
                  checkNoHashChange: true,
                  noHistoryEntry: false
                });
              } else {
                Log.info("Navigation to the same context is not allowed");
              }
            }
          }
        }
        this.base.editFlow.onAfterActionExecution(sActionName);
        return oResponse;
      } catch (err) {
        if (oCurrentActionCallBacks) {
          oCurrentActionCallBacks.fRejector();
        }
        // FIXME: in most situations there is no handler for the rejected promises returnedq
        if (err === Constants.CancelActionDialog) {
          // This leads to console error. Actually the error is already handled (currently directly in press handler of end button in dialog), so it should not be forwarded
          // up to here. However, when dialog handling and backend execution are separated, information whether dialog was cancelled, or backend execution has failed needs
          // to be transported to the place responsible for connecting these two things.
          // TODO: remove special handling one dialog handling and backend execution are separated
          throw new Error("Dialog cancelled");
        } else if (!(err && (err.canceled || err.rejectedItems && err.rejectedItems[0].canceled))) {
          // TODO: analyze, whether this is of the same category as above
          throw new Error(`Error in EditFlow.invokeAction:${err}`);
        }
        // TODO: Any unexpected errors probably should not be ignored!
      }
    }

    /**
     * Hook which can be overridden after the action execution.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param _actionName Name of the action
     * @alias sap.fe.core.controllerextensions.EditFlow#onAfterActionExecution
     * @private
     * @since 1.114.0
     */;
    _proto.onAfterActionExecution = async function onAfterActionExecution(_actionName) {
      //to be overridden
    }

    /**
     * Secured execution of the given function. Ensures that the function is only executed when certain conditions are fulfilled.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param fnFunction The function to be executed. Should return a promise that is settled after completion of the execution. If nothing is returned, immediate completion is assumed.
     * @param mParameters Definitions of the preconditions to be checked before execution
     * @param mParameters.busy Defines the busy indicator
     * @param mParameters.busy.set Triggers a busy indicator when the function is executed.
     * @param mParameters.busy.check Executes function only if application isn't busy.
     * @param mParameters.updatesDocument This operation updates the current document without using the bound model and context. As a result, the draft status is updated if a draft document exists, and the user has to confirm the cancellation of the editing process.
     * @returns A promise that is rejected if the execution is prohibited and resolved by the promise returned by the fnFunction.
     * @alias sap.fe.core.controllerextensions.EditFlow#securedExecution
     * @public
     * @since 1.90.0
     */;
    _proto.securedExecution = function securedExecution(fnFunction, mParameters) {
      var _mParameters$busy, _mParameters$busy2;
      const bBusySet = (mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$busy = mParameters.busy) === null || _mParameters$busy === void 0 ? void 0 : _mParameters$busy.set) ?? true,
        bBusyCheck = (mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$busy2 = mParameters.busy) === null || _mParameters$busy2 === void 0 ? void 0 : _mParameters$busy2.check) ?? true,
        bUpdatesDocument = (mParameters === null || mParameters === void 0 ? void 0 : mParameters.updatesDocument) ?? false,
        oLockObject = this.getGlobalUIModel(),
        oContext = this.getView().getBindingContext(),
        bIsDraft = oContext && this.getProgrammingModel(oContext) === ProgrammingModel.Draft;
      if (bBusyCheck && BusyLocker.isLocked(oLockObject)) {
        return Promise.reject("Application already busy therefore execution rejected");
      }

      // we have to set busy and draft indicator immediately also the function might be executed later in queue
      if (bBusySet) {
        BusyLocker.lock(oLockObject);
      }
      if (bUpdatesDocument && bIsDraft) {
        this.setDraftStatus(DraftStatus.Saving);
      }
      this.getMessageHandler().removeTransitionMessages();
      return this.syncTask(fnFunction).then(() => {
        if (bUpdatesDocument) {
          this.setDocumentModified(true);
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          if (bIsDraft) {
            this.setDraftStatus(DraftStatus.Saved);
          }
        }
      }).catch(oError => {
        if (bUpdatesDocument && bIsDraft) {
          this.setDraftStatus(DraftStatus.Clear);
        }
        return Promise.reject(oError);
      }).finally(() => {
        if (bBusySet) {
          BusyLocker.unlock(oLockObject);
        }
        this.getMessageHandler().showMessageDialog();
      });
    }

    /**
     * Handles the patchSent event: register document modification.
     *
     * @param oEvent The event sent by the binding
     */;
    _proto.handlePatchSent = function handlePatchSent(oEvent) {
      var _this$getView, _this$getView$getBind;
      // In collaborative draft, disable ETag check for PATCH requests
      const isInCollaborativeDraft = ActivitySync.isConnected(this.getView());
      if (isInCollaborativeDraft) {
        oEvent.getSource().getModel().setIgnoreETag(true);
      }
      if (!((_this$getView = this.getView()) !== null && _this$getView !== void 0 && (_this$getView$getBind = _this$getView.getBindingContext("internal")) !== null && _this$getView$getBind !== void 0 && _this$getView$getBind.getProperty("skipPatchHandlers"))) {
        const sourceBinding = oEvent.getSource();
        // Create a promise that will be resolved or rejected when the path is completed
        const oPatchPromise = new Promise((resolve, reject) => {
          oEvent.getSource().attachEventOnce("patchCompleted", patchCompletedEvent => {
            // Re-enable ETag checks
            if (isInCollaborativeDraft) {
              oEvent.getSource().getModel().setIgnoreETag(false);
            }
            if (oEvent.getSource().isA("sap.ui.model.odata.v4.ODataListBinding")) {
              var _this$getView2;
              ActionRuntime.setActionEnablementAfterPatch(this.getView(), sourceBinding, (_this$getView2 = this.getView()) === null || _this$getView2 === void 0 ? void 0 : _this$getView2.getBindingContext("internal"));
            }
            const bSuccess = patchCompletedEvent.getParameter("success");
            if (bSuccess) {
              resolve();
            } else {
              reject();
            }
          });
        });
        this.updateDocument(sourceBinding, oPatchPromise);
      }
    }

    /**
     * Handles the CreateActivate event.
     *
     * @param oEvent The event sent by the binding
     */;
    _proto.handleCreateActivate = async function handleCreateActivate(oEvent) {
      const oBinding = oEvent.getSource();
      const transactionHelper = this.getTransactionHelper();
      const bAtEnd = true;
      const bInactive = true;
      const oParams = {
        creationMode: CreationMode.Inline,
        createAtEnd: bAtEnd,
        inactive: bInactive,
        keepTransientContextOnFailed: false,
        // currently not fully supported
        busyMode: "None"
      };
      try {
        var _activatedContext$cre;
        // Send notification to other users only after the creation has been finalized
        const activatedContext = oEvent.getParameter("context");
        (_activatedContext$cre = activatedContext.created()) === null || _activatedContext$cre === void 0 ? void 0 : _activatedContext$cre.then(() => {
          this._sendActivity(Activity.Create, activatedContext);
        }).catch(() => {
          Log.warning(`Failed to activate context ${activatedContext.getPath()}`);
        });

        // Create a new inactive context (empty row in the table)
        const newInactiveContext = await transactionHelper.createDocument(oBinding, oParams, this.getAppComponent(), this.getMessageHandler(), false);
        if (newInactiveContext) {
          if (!this._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
        }
      } catch (error) {
        Log.error("Failed to activate new row -", error);
      }
    }

    /**
     * Performs a task in sync with other tasks created via this function.
     * Returns the promise chain of the task.
     *
     * @param [newTask] Optional, a promise or function to be executed synchronously
     * @returns Promise resolves once the task is completed
     * @private
     */;
    _proto.syncTask = function syncTask(newTask) {
      if (newTask) {
        if (typeof newTask === "function") {
          this.syncTasks = this.syncTasks.then(newTask).catch(function () {
            return Promise.resolve();
          });
        } else {
          this.syncTasks = this.syncTasks.then(() => newTask).catch(function () {
            return Promise.resolve();
          });
        }
      }
      return this.syncTasks;
    }

    /**
     * Decides if a document is to be shown in display or edit mode.
     *
     * @param {sap.ui.model.odata.v4.Context} oContext The context to be displayed or edited
     * @returns {Promise} Promise resolves once the edit mode is computed
     */;
    _proto.computeEditMode = async function computeEditMode(context) {
      const programmingModel = this.getProgrammingModel(context);
      if (programmingModel === ProgrammingModel.Draft) {
        try {
          this.setDraftStatus(DraftStatus.Clear);
          const globalModel = this.getGlobalUIModel();
          globalModel.setProperty("/isEditablePending", true, undefined, true);
          const isActiveEntity = await context.requestObject("IsActiveEntity");
          if (isActiveEntity === false) {
            // in case the document is draft set it in edit mode
            this.setEditMode(EditMode.Editable);
            const hasActiveEntity = await context.requestObject("HasActiveEntity");
            this.setEditMode(undefined, !hasActiveEntity);
          } else {
            // active document, stay on display mode
            this.setEditMode(EditMode.Display, false);
          }
          globalModel.setProperty("/isEditablePending", false, undefined, true);
        } catch (error) {
          Log.error("Error while determining the editMode for draft", error);
          throw error;
        }
      } else if (programmingModel === ProgrammingModel.Sticky) {
        const lastInvokedActionName = this.getInternalModel().getProperty("/lastInvokedAction");
        if (lastInvokedActionName && this.isNewActionForSticky(lastInvokedActionName, context)) {
          this.setEditMode(EditMode.Editable, true);
          if (!this.getAppComponent()._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          this.handleStickyOn(context);
          this.getInternalModel().setProperty("/lastInvokedAction", undefined);
        }
      }
    }

    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////

    /**
     * Internal method to delete a context or an array of contexts.
     *
     * @param contexts The context(s) to be deleted
     * @param parameters Parameters for deletion
     */;
    _proto.deleteDocumentTransaction = async function deleteDocumentTransaction(contexts, parameters) {
      var _sap$ui$getCore$byId;
      const resourceModel = getResourceModel(this);
      const transactionHelper = this.getTransactionHelper();

      // TODO: this setting and removing of contexts shouldn't be in the transaction helper at all
      // for the time being I kept it and provide the internal model context to not break something
      parameters.internalModelContext = parameters.controlId ? (_sap$ui$getCore$byId = sap.ui.getCore().byId(parameters.controlId)) === null || _sap$ui$getCore$byId === void 0 ? void 0 : _sap$ui$getCore$byId.getBindingContext("internal") : null;
      await this.syncTask();
      await transactionHelper.deleteDocument(contexts, parameters, this.getAppComponent(), resourceModel, this.getMessageHandler());
    };
    _proto._getResourceModel = function _getResourceModel() {
      return getResourceModel(this.getView());
    };
    _proto.getTransactionHelper = function getTransactionHelper() {
      return TransactionHelper;
    };
    _proto.getMessageHandler = function getMessageHandler() {
      if (this.base.messageHandler) {
        return this.base.messageHandler;
      } else {
        throw new Error("Edit Flow works only with a given message handler");
      }
    };
    _proto.getInternalModel = function getInternalModel() {
      return this.getView().getModel("internal");
    };
    _proto.getGlobalUIModel = function getGlobalUIModel() {
      return this.getView().getModel("ui");
    }

    /**
     * Sets that the current page contains a newly created object.
     *
     * @param bCreationMode True if the object is new
     */;
    _proto.setCreationMode = function setCreationMode(bCreationMode) {
      const uiModelContext = this.getView().getBindingContext("ui");
      this.getGlobalUIModel().setProperty("createMode", bCreationMode, uiModelContext, true);
    }

    /**
     * Indicates whether the current page contains a newly created object or not.
     *
     * @returns True if the object is new
     */;
    _proto.getCreationMode = function getCreationMode() {
      const uiModelContext = this.getView().getBindingContext("ui");
      return !!this.getGlobalUIModel().getProperty("createMode", uiModelContext);
    }

    /**
     * Indicates whether the object being edited (or one of its sub-objects) has been modified or not.
     *
     * @returns True if the object has been modified
     */;
    _proto.isDocumentModified = function isDocumentModified() {
      return !!this.getGlobalUIModel().getProperty("/isDocumentModified");
    }

    /**
     * Sets that the object being edited (or one of its sub-objects) has been modified.
     *
     * @param modified True if the object has been modified
     */;
    _proto.setDocumentModified = function setDocumentModified(modified) {
      this.getGlobalUIModel().setProperty("/isDocumentModified", modified);
    }

    /**
     * Sets that the object being edited has been modified by creating a sub-object.
     *
     * @param listBinding The list binding on which the object has been created
     */;
    _proto.setDocumentModifiedOnCreate = function setDocumentModifiedOnCreate(listBinding) {
      // Set the modified flag only on relative listBindings, i.e. when creating a sub-object
      // If the listBinding is not relative, then it's a creation from the ListReport, and by default a newly created root object isn't considered as modified
      if (listBinding.isRelative()) {
        this.setDocumentModified(true);
      }
    }

    /**
     * Handles the create event: shows messages and in case of a draft, updates the draft indicator.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param binding OData list binding object
     */;
    _proto.handleCreateEvents = function handleCreateEvents(binding) {
      this.setDraftStatus(DraftStatus.Clear);
      const programmingModel = this.getProgrammingModel(binding);
      binding.attachEvent("createSent", () => {
        if (programmingModel === ProgrammingModel.Draft) {
          this.setDraftStatus(DraftStatus.Saving);
        }
      });
      binding.attachEvent("createCompleted", oEvent => {
        const success = oEvent.getParameter("success");
        if (programmingModel === ProgrammingModel.Draft) {
          this.setDraftStatus(success ? DraftStatus.Saved : DraftStatus.Clear);
        }
        this.getMessageHandler().showMessageDialog();
      });
    }

    /**
     * Updates the draft status message (displayed at the bottom of the page).
     *
     * @param draftStatus The draft status message
     */;
    _proto.setDraftStatus = function setDraftStatus(draftStatus) {
      this.getView().getModel("ui").setProperty("/draftStatus", draftStatus, undefined, true);
    }

    /**
     * Gets the programming model from a binding or a context.
     *
     * @param source The binding or context
     * @returns The programming model
     */;
    _proto.getProgrammingModel = function getProgrammingModel(source) {
      return this.getTransactionHelper().getProgrammingModel(source);
    }

    /**
     * Sets the edit mode.
     *
     * @param editMode The edit mode
     * @param isCreation True if the object has been newly created
     */;
    _proto.setEditMode = function setEditMode(editMode, isCreation) {
      // at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
      // rely on the global UI model to exist
      const globalModel = this.getGlobalUIModel();
      if (editMode) {
        globalModel.setProperty("/isEditable", editMode === "Editable", undefined, true);
      }
      if (isCreation !== undefined) {
        // Since setCreationMode is public in EditFlow and can be overriden, make sure to call it via the controller
        // to ensure any overrides are taken into account
        this.setCreationMode(isCreation);
      }
    }

    /**
     * Checks if an action corresponds to a create action for a sticky session.
     *
     * @param actionName The name of the action
     * @param context Context for the sticky session
     * @returns True if the action is a create action
     */;
    _proto.isNewActionForSticky = function isNewActionForSticky(actionName, context) {
      try {
        var _entitySet$annotation3;
        const metaModel = context.getModel().getMetaModel();
        const metaContext = metaModel.getMetaContext(context.getPath());
        const entitySet = getInvolvedDataModelObjects(metaContext).startingEntitySet;
        const stickySession = (_entitySet$annotation3 = entitySet.annotations.Session) === null || _entitySet$annotation3 === void 0 ? void 0 : _entitySet$annotation3.StickySessionSupported;
        if ((stickySession === null || stickySession === void 0 ? void 0 : stickySession.NewAction) === actionName) {
          return true;
        }
        if (stickySession !== null && stickySession !== void 0 && stickySession.AdditionalNewActions && (stickySession === null || stickySession === void 0 ? void 0 : stickySession.AdditionalNewActions.indexOf(actionName)) !== -1) {
          return true;
        }
        return false;
      } catch (error) {
        Log.info(error);
        return false;
      }
    }

    // TODO Move all sticky-related below to a sticky session manager class

    /**
     * Enables the sticky edit session.
     *
     * @param context The context being edited
     * @returns True in case of success, false otherwise
     */;
    _proto.handleStickyOn = function handleStickyOn(context) {
      const appComponent = this.getAppComponent();
      try {
        if (appComponent === undefined) {
          throw new Error("undefined AppComponent for function handleStickyOn");
        }
        if (!appComponent.getRouterProxy().hasNavigationGuard()) {
          const hashTracker = appComponent.getRouterProxy().getHash();
          const internalModel = this.getInternalModel();

          // Set a guard in the RouterProxy
          // A timeout is necessary, as with deferred creation the hashChanger is not updated yet with
          // the new hash, and the guard cannot be found in the managed history of the router proxy
          setTimeout(function () {
            appComponent.getRouterProxy().setNavigationGuard(context.getPath().substring(1));
          }, 0);

          // Setting back navigation on shell service, to get the dicard message box in case of sticky
          appComponent.getShellServices().setBackNavigation(this.onBackNavigationInSession.bind(this));
          this.dirtyStateProviderFunction = this.getDirtyStateProvider(appComponent, internalModel, hashTracker);
          appComponent.getShellServices().registerDirtyStateProvider(this.dirtyStateProviderFunction);

          // handle session timeout
          const i18nModel = this.base.getView().getModel("sap.fe.i18n");
          this.sessionTimeoutFunction = this.getSessionTimeoutFunction(context, i18nModel);
          this.getView().getModel().attachSessionTimeout(this.sessionTimeoutFunction);
          this.stickyDiscardAfterNavigationFunction = this.getRouteMatchedFunction(context, appComponent);
          appComponent.getRoutingService().attachRouteMatched(this.stickyDiscardAfterNavigationFunction);
        }
      } catch (error) {
        Log.info(error);
        return false;
      }
      return true;
    }

    /**
     * Disables the sticky edit session.
     *
     * @returns True in case of success, false otherwise
     */;
    _proto.handleStickyOff = function handleStickyOff() {
      const appComponent = this.getAppComponent();
      try {
        if (appComponent === undefined) {
          throw new Error("undefined AppComponent for function handleStickyOff");
        }
        if (appComponent.getRouterProxy) {
          // If we have exited from the app, CommonUtils.getAppComponent doesn't return a
          // sap.fe.core.AppComponent, hence the 'if' above
          appComponent.getRouterProxy().discardNavigationGuard();
        }
        if (this.dirtyStateProviderFunction) {
          appComponent.getShellServices().deregisterDirtyStateProvider(this.dirtyStateProviderFunction);
          this.dirtyStateProviderFunction = undefined;
        }
        const model = this.getView().getModel();
        if (model && this.sessionTimeoutFunction) {
          model.detachSessionTimeout(this.sessionTimeoutFunction);
        }
        appComponent.getRoutingService().detachRouteMatched(this.stickyDiscardAfterNavigationFunction);
        this.stickyDiscardAfterNavigationFunction = undefined;
        this.setEditMode(EditMode.Display, false);
        if (appComponent.getShellServices) {
          // If we have exited from the app, CommonUtils.getAppComponent doesn't return a
          // sap.fe.core.AppComponent, hence the 'if' above
          appComponent.getShellServices().setBackNavigation();
        }
      } catch (error) {
        Log.info(error);
        return false;
      }
      return true;
    };
    _proto._setStickySessionInternalProperties = function _setStickySessionInternalProperties(programmingModel, model) {
      if (programmingModel === ProgrammingModel.Sticky) {
        const internalModel = this.getInternalModel();
        internalModel.setProperty("/sessionOn", true);
        internalModel.setProperty("/stickySessionToken", model.getHttpHeaders(true)["SAP-ContextId"]);
      }
    }

    /**
     * Returns a callback function to be used as a DirtyStateProvider in the Shell.
     *
     * @param appComponent The app component
     * @param internalModel The model "internal"
     * @param hashTracker Hash tracker
     * @returns The callback function
     */;
    _proto.getDirtyStateProvider = function getDirtyStateProvider(appComponent, internalModel, hashTracker) {
      return navigationContext => {
        try {
          if (navigationContext === undefined) {
            throw new Error("Invalid input parameters for DirtyStateProvider function");
          }
          const targetHash = navigationContext.innerAppRoute;
          const routerProxy = appComponent.getRouterProxy();
          let lclHashTracker = "";
          let isDirty;
          const isSessionOn = internalModel.getProperty("/sessionOn");
          if (!isSessionOn) {
            // If the sticky session was terminated before hand.
            // Example in case of navigating away from application using IBN.
            return undefined;
          }
          if (!routerProxy.isNavigationFinalized()) {
            // If navigation is currently happening in RouterProxy, it's a transient state
            // (not dirty)
            isDirty = false;
            lclHashTracker = targetHash;
          } else if (hashTracker === targetHash) {
            // the hash didn't change so either the user attempts to refresh or to leave the app
            isDirty = true;
          } else if (routerProxy.checkHashWithGuard(targetHash) || routerProxy.isGuardCrossAllowedByUser()) {
            // the user attempts to navigate within the root object
            // or crossing the guard has already been allowed by the RouterProxy
            lclHashTracker = targetHash;
            isDirty = false;
          } else {
            // the user attempts to navigate within the app, for example back to the list report
            isDirty = true;
          }
          if (isDirty) {
            // the FLP doesn't call the dirty state provider anymore once it's dirty, as they can't
            // change this due to compatibility reasons we set it back to not-dirty
            setTimeout(function () {
              appComponent.getShellServices().setDirtyFlag(false);
            }, 0);
          } else {
            hashTracker = lclHashTracker;
          }
          return isDirty;
        } catch (error) {
          Log.info(error);
          return undefined;
        }
      };
    }

    /**
     * Returns a callback function to be used when a sticky session times out.
     *
     * @param stickyContext The context for the sticky session
     * @param i18nModel
     * @returns The callback function
     */;
    _proto.getSessionTimeoutFunction = function getSessionTimeoutFunction(stickyContext, i18nModel) {
      return () => {
        try {
          if (stickyContext === undefined) {
            throw new Error("Context missing for SessionTimeout function");
          }
          // remove transient messages since we will showing our own message
          this.getMessageHandler().removeTransitionMessages();
          const warningDialog = new Dialog({
            title: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_TITLE}",
            state: "Warning",
            content: new Text({
              text: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_MESSAGE}"
            }),
            beginButton: new Button({
              text: "{sap.fe.i18n>C_COMMON_DIALOG_OK}",
              type: "Emphasized",
              press: () => {
                // remove sticky handling after navigation since session has already been terminated
                this.handleStickyOff();
                this.getInternalRouting().navigateBackFromContext(stickyContext);
              }
            }),
            afterClose: function () {
              warningDialog.destroy();
            }
          });
          warningDialog.addStyleClass("sapUiContentPadding");
          warningDialog.setModel(i18nModel, "sap.fe.i18n");
          this.getView().addDependent(warningDialog);
          warningDialog.open();
        } catch (error) {
          Log.info(error);
          return undefined;
        }
        return true;
      };
    }

    /**
     * Returns a callback function for the onRouteMatched event in case of sticky edition.
     *
     * @param context The context being edited (root of the sticky session)
     * @param appComponent The app component
     * @returns The callback function
     */;
    _proto.getRouteMatchedFunction = function getRouteMatchedFunction(context, appComponent) {
      return () => {
        const currentHash = appComponent.getRouterProxy().getHash();
        // either current hash is empty so the user left the app or he navigated away from the object
        if (!currentHash || !appComponent.getRouterProxy().checkHashWithGuard(currentHash)) {
          this.discardStickySession(context);
          context.getModel().clearSessionContext();
        }
      };
    }

    /**
     * Ends a sticky session by discarding changes.
     *
     * @param context The context being edited (root of the sticky session)
     */;
    _proto.discardStickySession = async function discardStickySession(context) {
      const discardedContext = await sticky.discardDocument(context);
      if (discardedContext !== null && discardedContext !== void 0 && discardedContext.hasPendingChanges()) {
        discardedContext.getBinding().resetChanges();
      }
      if (!this.getCreationMode()) {
        discardedContext === null || discardedContext === void 0 ? void 0 : discardedContext.refresh();
      }
      this.handleStickyOff();
    }

    /**
     * Gets the internal routing extension.
     *
     * @returns The internal routing extension
     */;
    _proto.getInternalRouting = function getInternalRouting() {
      if (this.base._routing) {
        return this.base._routing;
      } else {
        throw new Error("Edit Flow works only with a given routing listener");
      }
    };
    _proto._getRootViewController = function _getRootViewController() {
      return this.getAppComponent().getRootViewController();
    };
    _proto._getSemanticMapping = function _getSemanticMapping() {
      return this.getAppComponent().getRoutingService().getLastSemanticMapping();
    }

    /**
     * Creates a new promise to wait for an action to be executed.
     *
     * @param actionName The name of the action
     * @param controlId The ID of the control
     * @returns {Function} The resolver function which can be used to externally resolve the promise
     */;
    _proto.createActionPromise = function createActionPromise(actionName, controlId) {
      let resolveFunction, rejectFunction;
      this.actionPromise = new Promise((resolve, reject) => {
        resolveFunction = resolve;
        rejectFunction = reject;
      }).then(oResponse => {
        return Object.assign({
          controlId
        }, this.getActionResponseDataAndKeys(actionName, oResponse));
      });
      return {
        fResolver: resolveFunction,
        fRejector: rejectFunction
      };
    }

    /**
     *
     * @param actionName The name of the action that is executed
     * @param response The bound action's response data or response context
     * @returns Object with data and names of the key fields of the response
     */;
    _proto.getActionResponseDataAndKeys = function getActionResponseDataAndKeys(actionName, response) {
      if (Array.isArray(response)) {
        if (response.length === 1) {
          response = response[0].value;
        } else {
          return null;
        }
      }
      if (!response) {
        return null;
      }
      const currentView = this.base.getView();
      const metaModelData = currentView.getModel().getMetaModel().getData();
      const actionReturnType = metaModelData && metaModelData[actionName] && metaModelData[actionName][0] && metaModelData[actionName][0].$ReturnType ? metaModelData[actionName][0].$ReturnType.$Type : null;
      const keys = actionReturnType && metaModelData[actionReturnType] ? metaModelData[actionReturnType].$Key : null;
      return {
        oData: response.getObject(),
        keys
      };
    };
    _proto.getCurrentActionPromise = function getCurrentActionPromise() {
      return this.actionPromise;
    };
    _proto.deleteCurrentActionPromise = function deleteCurrentActionPromise() {
      this.actionPromise = undefined;
    };
    _proto._scrollAndFocusOnInactiveRow = function _scrollAndFocusOnInactiveRow(table) {
      const rowBinding = table.getRowBinding();
      const activeRowIndex = rowBinding.getCount() || 0;
      if (table.data("tableType") !== "ResponsiveTable") {
        if (activeRowIndex > 0) {
          table.scrollToIndex(activeRowIndex - 1);
        }
        table.focusRow(activeRowIndex, true);
      } else {
        /* In a responsive table, the empty rows appear at the beginning of the table. But when we create more, they appear below the new line.
         * So we check the first inactive row first, then we set the focus on it when we press the button.
         * This doesn't impact the GridTable because they appear at the end, and we already focus the before-the-last row (because 2 empty rows exist)
         */
        const allRowContexts = rowBinding.getContexts();
        if (!(allRowContexts !== null && allRowContexts !== void 0 && allRowContexts.length)) {
          table.focusRow(activeRowIndex, true);
          return;
        }
        let focusRow = activeRowIndex,
          index = 0;
        for (const singleContext of allRowContexts) {
          if (singleContext.isInactive() && index < focusRow) {
            focusRow = index;
          }
          index++;
        }
        if (focusRow > 0) {
          table.scrollToIndex(focusRow);
        }
        table.focusRow(focusRow, true);
      }
    };
    _proto.createEmptyRowsAndFocus = async function createEmptyRowsAndFocus(table) {
      var _tableAPI$tableDefini, _tableAPI$tableDefini2, _table$getBindingCont;
      const tableAPI = table.getParent();
      if (tableAPI !== null && tableAPI !== void 0 && (_tableAPI$tableDefini = tableAPI.tableDefinition) !== null && _tableAPI$tableDefini !== void 0 && (_tableAPI$tableDefini2 = _tableAPI$tableDefini.control) !== null && _tableAPI$tableDefini2 !== void 0 && _tableAPI$tableDefini2.inlineCreationRowsHiddenInEditMode && !((_table$getBindingCont = table.getBindingContext("ui")) !== null && _table$getBindingCont !== void 0 && _table$getBindingCont.getProperty("createMode"))) {
        // With the parameter, we don't have empty rows in Edit mode, so we need to create them before setting the focus on them
        await tableAPI.setUpEmptyRows(table, true);
      }
      this._scrollAndFocusOnInactiveRow(table);
    };
    _proto._sendActivity = function _sendActivity(action, relatedContexts, actionName, refreshListBinding, actionRequestedProperties) {
      const content = Array.isArray(relatedContexts) ? relatedContexts.map(context => context.getPath()) : relatedContexts === null || relatedContexts === void 0 ? void 0 : relatedContexts.getPath();
      ActivitySync.send(this.getView(), action, content, actionName, refreshListBinding, actionRequestedProperties);
    };
    _proto._triggerConfiguredSurvey = function _triggerConfiguredSurvey(sActionName, triggerType) {
      triggerConfiguredSurvey(this.getView(), sActionName, triggerType);
    };
    _proto._submitOpenChanges = async function _submitOpenChanges(oContext) {
      const oModel = oContext.getModel(),
        oLockObject = this.getGlobalUIModel();
      try {
        // Submit any leftover changes that are not yet submitted
        // Currently we are using only 1 updateGroupId, hence submitting the batch directly here
        await oModel.submitBatch("$auto");

        // Wait for all currently running changes
        // For the time being we agreed with the v4 model team to use an internal method. We'll replace it once
        // a public or restricted method was provided
        await oModel.oRequestor.waitForRunningChangeRequests("$auto");

        // Check if all changes were submitted successfully
        if (oModel.hasPendingChanges("$auto")) {
          throw new Error("submit of open changes failed");
        }
      } finally {
        if (BusyLocker.isLocked(oLockObject)) {
          BusyLocker.unlock(oLockObject);
        }
      }
    };
    _proto._removeStickySessionInternalProperties = function _removeStickySessionInternalProperties(programmingModel) {
      if (programmingModel === ProgrammingModel.Sticky) {
        const internalModel = this.getInternalModel();
        internalModel.setProperty("/sessionOn", false);
        internalModel.setProperty("/stickySessionToken", undefined);
        this.handleStickyOff();
      }
    }

    /**
     * Method to display a 'discard' popover when exiting a sticky session.
     */;
    _proto.onBackNavigationInSession = function onBackNavigationInSession() {
      const view = this.base.getView();
      const routerProxy = this.getAppComponent().getRouterProxy();
      if (routerProxy.checkIfBackIsOutOfGuard()) {
        const bindingContext = view.getBindingContext();
        const programmingModel = this.getProgrammingModel(bindingContext);
        sticky.processDataLossConfirmation(async () => {
          await this.discardStickySession(bindingContext);
          this._removeStickySessionInternalProperties(programmingModel);
          history.back();
        }, view, programmingModel);
        return;
      }
      history.back();
    };
    _proto._handleNewContext = async function _handleNewContext(oContext, bEditable, bRecreateContext, bDraftNavigation) {
      let bForceFocus = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      if (!this._isFclEnabled()) {
        EditState.setEditStateDirty();
      }
      await this.getInternalRouting().navigateToContext(oContext, {
        checkNoHashChange: true,
        editable: bEditable,
        bPersistOPScroll: true,
        bRecreateContext: bRecreateContext,
        bDraftNavigation: bDraftNavigation,
        showPlaceholder: false,
        bForceFocus: bForceFocus,
        keepCurrentLayout: true
      });
    };
    _proto._getBoundContext = function _getBoundContext(view, params) {
      const viewLevel = view.getViewData().viewLevel;
      const bRefreshAfterAction = viewLevel > 1 || viewLevel === 1 && params.controlId;
      return !params.isNavigable || !!bRefreshAfterAction;
    }

    /**
     * Checks if there are validation (parse) errors for controls bound to a given context
     *
     * @function
     * @name _checkForValidationErrors
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns {Promise} Promise resolves if there are no validation errors, and rejects if there are validation errors
     */;
    _proto._checkForValidationErrors = function _checkForValidationErrors() {
      return this.syncTask().then(() => {
        const sViewId = this.getView().getId();
        const aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
        let oControl;
        let oMessage;
        if (!aMessages.length) {
          return Promise.resolve("No validation errors found");
        }
        for (let i = 0; i < aMessages.length; i++) {
          oMessage = aMessages[i];
          if (oMessage.validation) {
            oControl = Core.byId(oMessage.getControlId());
            while (oControl) {
              if (oControl.getId() === sViewId) {
                return Promise.reject("validation errors exist");
              }
              oControl = oControl.getParent();
            }
          }
        }
      });
    }

    /**
     * @function
     * @name _refreshListIfRequired
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oResponse The response of the bound action and the names of the key fields
     * @param oContext The bound context on which the action was executed
     * @returns Always resolves to param oResponse
     */;
    _proto._refreshListIfRequired = function _refreshListIfRequired(oResponse, oContext) {
      if (!oContext || !oResponse || !oResponse.oData) {
        return Promise.resolve(undefined);
      }
      const oBinding = oContext.getBinding();
      // refresh only lists
      if (oBinding && oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        const oContextData = oResponse.oData;
        const aKeys = oResponse.keys;
        const oCurrentData = oContext.getObject();
        let bReturnedContextIsSame = true;
        // ensure context is in the response
        if (Object.keys(oContextData).length) {
          // check if context in response is different than the bound context
          bReturnedContextIsSame = aKeys.every(function (sKey) {
            return oCurrentData[sKey] === oContextData[sKey];
          });
          if (!bReturnedContextIsSame) {
            return new Promise(resolve => {
              if (oBinding.isRoot()) {
                oBinding.attachEventOnce("dataReceived", function () {
                  resolve(!bReturnedContextIsSame);
                });
                oBinding.refresh();
              } else {
                const oAppComponent = this.getAppComponent();
                oAppComponent.getSideEffectsService().requestSideEffects([{
                  $NavigationPropertyPath: oBinding.getPath()
                }], oBinding.getContext()).then(function () {
                  resolve(!bReturnedContextIsSame);
                }, function () {
                  Log.error("Error while refreshing the table");
                  resolve(!bReturnedContextIsSame);
                }).catch(function (e) {
                  Log.error("Error while refreshing the table", e);
                });
              }
            });
          }
        }
      }
      // resolve with oResponse to not disturb the promise chain afterwards
      return Promise.resolve(undefined);
    };
    _proto._fetchSemanticKeyValues = function _fetchSemanticKeyValues(oContext) {
      const oMetaModel = oContext.getModel().getMetaModel(),
        sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name"),
        aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName);
      if (aSemanticKeys && aSemanticKeys.length) {
        const aRequestPromises = aSemanticKeys.map(function (oKey) {
          return oContext.requestObject(oKey.$PropertyPath);
        });
        return Promise.all(aRequestPromises);
      } else {
        return Promise.resolve();
      }
    }

    /**
     * Provides the latest context in the metadata hierarchy from rootBinding to given context pointing to given entityType
     * if any such context exists. Otherwise, it returns the original context.
     * Note: It is only needed as work-around for incorrect modelling. Correct modelling would imply a DataFieldForAction in a LineItem
     * to point to an overload defined either on the corresponding EntityType or a collection of the same.
     *
     * @param rootContext The context to start searching from
     * @param listBinding The listBinding of the table
     * @param overloadEntityType The ActionOverload entity type to search for
     * @returns Returns the context of the ActionOverload entity
     */;
    _proto._getActionOverloadContextFromMetadataPath = function _getActionOverloadContextFromMetadataPath(rootContext, listBinding, overloadEntityType) {
      const model = rootContext.getModel();
      const metaModel = model.getMetaModel();
      let contextSegments = listBinding.getPath().split("/");
      let currentContext = rootContext;

      // We expect that the last segment of the listBinding is the ListBinding of the table. Remove this from contextSegments
      // because it is incorrect to execute bindContext on a list. We do not anyway need to search this context for the overload.
      contextSegments.pop();
      if (contextSegments.length === 0) {
        contextSegments = [""]; // Don't leave contextSegments undefined
      }

      if (contextSegments[0] !== "") {
        contextSegments.unshift(""); // to also get the root context, i.e. the bindingContext of the table
      }
      // load all the parent contexts into an array
      const parentContexts = contextSegments.map(pathSegment => {
        if (pathSegment !== "") {
          currentContext = model.bindContext(pathSegment, currentContext).getBoundContext();
        } else {
          // Creating a new context using bindContext(...).getBoundContext() does not work if the etag is needed. According to model colleagues,
          // we should always use an existing context if possible.
          // Currently, the only example we know about is using the rootContext - and in this case, we can obviously reuse that existing context.
          // If other examples should come up, the best possible work around would be to request some data to get an existing context. To keep the
          // request as small and fast as possible, we should request only the first key property. As this would introduce asynchronism, and anyway
          // the whole logic is only part of work-around for incorrect modelling, we wait until we have an example needing it before implementing this.
          currentContext = rootContext;
        }
        return currentContext;
      }).reverse();
      // search for context backwards
      const overloadContext = parentContexts.find(parentContext => metaModel.getMetaContext(parentContext.getPath()).getObject("$Type") === overloadEntityType);
      return overloadContext || listBinding.getHeaderContext();
    };
    _proto._createSiblingInfo = function _createSiblingInfo(currentContext, newContext) {
      return {
        targetContext: newContext,
        pathMapping: [{
          oldPath: currentContext.getPath(),
          newPath: newContext.getPath()
        }]
      };
    };
    _proto._updatePathsInHistory = function _updatePathsInHistory(mappings) {
      const oAppComponent = this.getAppComponent();
      oAppComponent.getRouterProxy().setPathMapping(mappings);

      // Also update the semantic mapping in the routing service
      const lastSemanticMapping = this._getSemanticMapping();
      if (mappings.length && (lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.technicalPath) === mappings[mappings.length - 1].oldPath) {
        lastSemanticMapping.technicalPath = mappings[mappings.length - 1].newPath;
      }
    };
    _proto._getNavigationTargetForEdit = function _getNavigationTargetForEdit(context, newDocumentContext, siblingInfo) {
      let contextToNavigate;
      siblingInfo = siblingInfo ?? this._createSiblingInfo(context, newDocumentContext);
      this._updatePathsInHistory(siblingInfo.pathMapping);
      if (siblingInfo.targetContext.getPath() != newDocumentContext.getPath()) {
        contextToNavigate = siblingInfo.targetContext;
      }
      return contextToNavigate;
    }

    /**
     * This method creates a sibling context for a subobject page, and calculates a sibling path
     * for all intermediate paths between the object page and the subobject page.
     *
     * @param rootCurrentContext The context for the root of the draft
     * @param rightmostCurrentContext The context of the subobject
     * @param sProgrammingModel The programming model
     * @param doNotComputeIfRoot If true, we don't compute siblingInfo if the root and the rightmost contexts are the same
     * @param rootContextInfo The root context information of root of the draft
     * @returns Returns the siblingInformation object
     */;
    _proto._computeSiblingInformation = async function _computeSiblingInformation(rootCurrentContext, rightmostCurrentContext, sProgrammingModel, doNotComputeIfRoot, rootContextInfo) {
      rightmostCurrentContext = rightmostCurrentContext ?? rootCurrentContext;
      if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
        // Wrong usage !!
        Log.error("Cannot compute rightmost sibling context");
        throw new Error("Cannot compute rightmost sibling context");
      }
      if (doNotComputeIfRoot && rightmostCurrentContext.getPath() === rootCurrentContext.getPath()) {
        return Promise.resolve(undefined);
      }
      const model = rootCurrentContext.getModel();
      if (sProgrammingModel === ProgrammingModel.Draft) {
        return draft.computeSiblingInformation(rootCurrentContext, rightmostCurrentContext, rootContextInfo);
      } else {
        // If not in draft mode, we just recreate a context from the path of the rightmost context
        // No path mapping is needed
        return {
          targetContext: model.bindContext(rightmostCurrentContext.getPath()).getBoundContext(),
          pathMapping: []
        };
      }
    };
    _proto._isFclEnabled = function _isFclEnabled() {
      return this.getAppComponent()._isFclEnabled();
    };
    return EditFlow;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "editDocument", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "editDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "updateDocument", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "updateDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createDocument", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "createDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeSave", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeSave"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeCreate", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeCreate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeEdit", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeEdit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeDiscard", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeDiscard"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeDelete", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeDelete"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "saveDocument", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "saveDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "cancelDocument", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "cancelDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteDocument", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyDocument", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "applyDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "invokeAction", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "invokeAction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterActionExecution", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterActionExecution"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "securedExecution", [_dec30, _dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "securedExecution"), _class2.prototype)), _class2)) || _class);
  return EditFlow;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJQcm9ncmFtbWluZ01vZGVsIiwiQ29uc3RhbnRzIiwiRHJhZnRTdGF0dXMiLCJFZGl0TW9kZSIsIlN0YXJ0dXBNb2RlIiwiTWVzc2FnZVR5cGUiLCJjb3JlTGlicmFyeSIsIkVkaXRGbG93IiwiZGVmaW5lVUk1Q2xhc3MiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwic3luY1Rhc2tzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXRBcHBDb21wb25lbnQiLCJiYXNlIiwiZWRpdERvY3VtZW50Iiwib0NvbnRleHQiLCJiRHJhZnROYXZpZ2F0aW9uIiwidHJhbnNhY3Rpb25IZWxwZXIiLCJnZXRUcmFuc2FjdGlvbkhlbHBlciIsIm9Sb290Vmlld0NvbnRyb2xsZXIiLCJfZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwibW9kZWwiLCJnZXRNb2RlbCIsInJpZ2h0bW9zdENvbnRleHQiLCJzaWJsaW5nSW5mbyIsIm9WaWV3RGF0YSIsImdldFZpZXciLCJnZXRWaWV3RGF0YSIsInNQcm9ncmFtbWluZ01vZGVsIiwiZ2V0UHJvZ3JhbW1pbmdNb2RlbCIsIm9Sb290Q29udGV4dCIsIm9WaWV3Iiwidmlld0xldmVsIiwiRHJhZnQiLCJTdGlja3kiLCJDb21tb25VdGlscyIsImNyZWF0ZVJvb3RDb250ZXh0IiwiZWRpdEZsb3ciLCJvbkJlZm9yZUVkaXQiLCJjb250ZXh0Iiwib05ld0RvY3VtZW50Q29udGV4dCIsImdldE1lc3NhZ2VIYW5kbGVyIiwiX3NldFN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMiLCJzZXRFZGl0TW9kZSIsIkVkaXRhYmxlIiwic2V0RG9jdW1lbnRNb2RpZmllZCIsInNob3dNZXNzYWdlRGlhbG9nIiwiY29udGV4dFRvTmF2aWdhdGUiLCJfaXNGY2xFbmFibGVkIiwiZ2V0UmlnaHRtb3N0Q29udGV4dCIsIl9jb21wdXRlU2libGluZ0luZm9ybWF0aW9uIiwiX2NyZWF0ZVNpYmxpbmdJbmZvIiwiX3VwZGF0ZVBhdGhzSW5IaXN0b3J5IiwicGF0aE1hcHBpbmciLCJ0YXJnZXRDb250ZXh0IiwiZ2V0UGF0aCIsInJvb3RTaWJsaW5nUGF0aCIsInJvb3RDb250ZXh0SW5mbyIsInJvb3RDb250ZXh0Tm90UmVxdWlyZWQiLCJfZ2V0TmF2aWdhdGlvblRhcmdldEZvckVkaXQiLCJfaGFuZGxlTmV3Q29udGV4dCIsInN0aWNreUNvbnRleHQiLCJnZXRLZWVwQWxpdmVDb250ZXh0IiwiaGFuZGxlU3RpY2t5T24iLCJNb2RlbEhlbHBlciIsImlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwiZ2V0TWV0YU1vZGVsIiwic2hhcmVPYmplY3QiLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImRlbGV0ZU11bHRpcGxlRG9jdW1lbnRzIiwiY29udGV4dHNUb0RlbGV0ZSIsInBhcmFtZXRlcnMiLCJiZWZvcmVEZWxldGVDYWxsQmFjayIsIm9uQmVmb3JlRGVsZXRlIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwibG9ja09iamVjdCIsImdldEdsb2JhbFVJTW9kZWwiLCJwYXJlbnRDb250cm9sIiwiYnlJZCIsImNvbnRyb2xJZCIsIkVycm9yIiwibGlzdEJpbmRpbmciLCJnZXRCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsImJGaW5kQWN0aXZlQ29udGV4dHMiLCJCdXN5TG9ja2VyIiwibG9jayIsImRlbGV0ZURvY3VtZW50VHJhbnNhY3Rpb24iLCJyZXN1bHQiLCJpc0EiLCJjbGVhclNlbGVjdGlvbiIsInZpZXdCaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0IiwiaXNSb290IiwiYXR0YWNoRXZlbnRPbmNlIiwicmVmcmVzaCIsImhhc1RyYW5zaWVudENvbnRleHQiLCJnZXRTaWRlRWZmZWN0c1NlcnZpY2UiLCJyZXF1ZXN0U2lkZUVmZmVjdHNGb3JOYXZpZ2F0aW9uUHJvcGVydHkiLCJFZGl0U3RhdGUiLCJzZXRFZGl0U3RhdGVEaXJ0eSIsIkFjdGl2aXR5U3luYyIsInNlbmQiLCJBY3Rpdml0eSIsIkRlbGV0ZSIsIm1hcCIsInVubG9jayIsInVwZGF0ZURvY3VtZW50IiwidXBkYXRlZENvbnRleHQiLCJ1cGRhdGVQcm9taXNlIiwib3JpZ2luYWxCaW5kaW5nQ29udGV4dCIsImlzRHJhZnQiLCJyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMiLCJzeW5jVGFzayIsInNldERyYWZ0U3RhdHVzIiwiU2F2aW5nIiwiY3VycmVudEJpbmRpbmdDb250ZXh0IiwibWV0YU1vZGVsIiwiZW50aXR5U2V0TmFtZSIsImdldE1ldGFDb250ZXh0IiwiZ2V0T2JqZWN0Iiwic2VtYW50aWNLZXlzIiwiU2VtYW50aWNLZXlIZWxwZXIiLCJnZXRTZW1hbnRpY0tleXMiLCJsZW5ndGgiLCJjdXJyZW50U2VtYW50aWNNYXBwaW5nIiwiX2dldFNlbWFudGljTWFwcGluZyIsImN1cnJlbnRTZW1hbnRpY1BhdGgiLCJzZW1hbnRpY1BhdGgiLCJzQ2hhbmdlZFBhdGgiLCJnZXRTZW1hbnRpY1BhdGgiLCJTYXZlZCIsIkNsZWFyIiwic2hvd01lc3NhZ2VzIiwiY3JlYXRlRG9jdW1lbnQiLCJ2TGlzdEJpbmRpbmciLCJtSW5QYXJhbWV0ZXJzIiwib0xvY2tPYmplY3QiLCJvVGFibGUiLCJtUGFyYW1ldGVycyIsIm9DcmVhdGlvbiIsImJTaG91bGRCdXN5TG9jayIsImNyZWF0aW9uTW9kZSIsIklubGluZSIsIkNyZWF0aW9uUm93IiwiRXh0ZXJuYWwiLCJvRXhlY0N1c3RvbVZhbGlkYXRpb24iLCJvQXBwQ29tcG9uZW50IiwiZ2V0Um91dGVyUHJveHkiLCJyZW1vdmVJQXBwU3RhdGVLZXkiLCJvQ29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJzQ3JlYXRlUGF0aCIsImdldEFic29sdXRlTWV0YVBhdGhGb3JMaXN0QmluZGluZyIsImhhbmRsZXJzIiwib25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kIiwib3V0Ym91bmQiLCJ1bmRlZmluZWQiLCJjcmVhdGlvblJvdyIsIm9DcmVhdGlvblJvd09iamVjdHMiLCJnZXRQYXJlbnQiLCJ2YWxpZGF0ZURvY3VtZW50IiwiZGF0YSIsImN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiIsImdldENyZWF0aW9uUm93Iiwib0ludGVybmFsTW9kZWxDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJ0YWJsZUlkIiwiZm5Gb2N1c09yU2Nyb2xsIiwiZm9jdXNSb3ciLCJiaW5kIiwic2Nyb2xsVG9JbmRleCIsImNyZWF0ZUF0RW5kIiwiZ2V0TGVuZ3RoIiwiaGFuZGxlU2lkZUVmZmVjdHMiLCJvTGlzdEJpbmRpbmciLCJvQ3JlYXRpb25Qcm9taXNlIiwib05ld0NvbnRleHQiLCJjcmVhdGVkIiwib0JpbmRpbmdDb250ZXh0IiwiYXBwQ29tcG9uZW50IiwiY3JlYXRlQ3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VzIiwiYVZhbGlkYXRpb25NZXNzYWdlcyIsInNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJtQ3VzdG9tVmFsaWRpdHkiLCJnZXRQcm9wZXJ0eSIsIm9NZXNzYWdlTWFuYWdlciIsIkNvcmUiLCJnZXRNZXNzYWdlTWFuYWdlciIsImFDdXN0b21NZXNzYWdlcyIsIm9GaWVsZENvbnRyb2wiLCJzVGFyZ2V0IiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsImZvckVhY2giLCJvTWVzc2FnZSIsImNvZGUiLCJyZW1vdmVNZXNzYWdlcyIsIm9WYWxpZGF0aW9uTWVzc2FnZSIsIm1lc3NhZ2VUYXJnZXQiLCJnZXRDb250cm9sIiwiZmllbGRJZCIsImdldEJpbmRpbmdQYXRoIiwiZmlsdGVyIiwidGFyZ2V0IiwiYWRkTWVzc2FnZXMiLCJNZXNzYWdlIiwibWVzc2FnZSIsIm1lc3NhZ2VUZXh0IiwicHJvY2Vzc29yIiwidHlwZSIsInRlY2huaWNhbCIsInBlcnNpc3RlbnQiLCJhRXhpc3RpbmdWYWxpZGF0aW9uTWVzc2FnZXMiLCJhZGRDb250cm9sSWQiLCJwdXNoIiwidGV4dCIsImN1c3RvbU1lc3NhZ2VzIiwicmVzb2x2ZUNyZWF0aW9uTW9kZSIsImluaXRpYWxDcmVhdGlvbk1vZGUiLCJwcm9ncmFtbWluZ01vZGVsIiwib01ldGFNb2RlbCIsIk5ld1BhZ2UiLCJpc1JlbGF0aXZlIiwic1BhdGgiLCJzTmV3QWN0aW9uIiwiYVBhcmFtZXRlcnMiLCJEZWZlcnJlZCIsInNNZXRhUGF0aCIsImdldE1ldGFQYXRoIiwiZ2V0SGVhZGVyQ29udGV4dCIsImFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMiLCJnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMiLCJBc3luYyIsIk9EYXRhTGlzdEJpbmRpbmciLCJTeW5jIiwib01vZGVsIiwicmVzb2x2ZWRDcmVhdGlvbk1vZGUiLCJtQXJncyIsIm9DcmVhdGlvblJvdyIsIm9DcmVhdGlvblJvd0NvbnRleHQiLCJvUGF5bG9hZCIsIm9Sb3V0aW5nTGlzdGVuZXIiLCJnZXRJbnRlcm5hbFJvdXRpbmciLCJPYmplY3QiLCJrZXlzIiwic1Byb3BlcnR5UGF0aCIsIm9Qcm9wZXJ0eSIsIiRraW5kIiwiX2NoZWNrRm9yVmFsaWRhdGlvbkVycm9ycyIsImtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQiLCJidXN5TW9kZSIsImJ1c3lJZCIsImdldFRhYmxlRGVmaW5pdGlvbiIsImFubm90YXRpb24iLCJpZCIsImhhbmRsZUNyZWF0ZUV2ZW50cyIsImJlZm9yZUNyZWF0ZUNhbGxCYWNrIiwib25CZWZvcmVDcmVhdGUiLCJza2lwUGFyYW1ldGVyRGlhbG9nIiwiZ2V0U3RhcnR1cE1vZGUiLCJBdXRvQ3JlYXRlIiwiYlNraXBTaWRlRWZmZWN0cyIsIm9OYXZpZ2F0aW9uIiwibmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0IiwiYkRlZmVycmVkQ29udGV4dCIsImVkaXRhYmxlIiwiYkZvcmNlRm9jdXMiLCJhc3luY0NvbnRleHQiLCJjcmVhdGVBY3Rpb24iLCJ0cmFuc2llbnQiLCJ0aGVuIiwiY29yZVJlc291cmNlQnVuZGxlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwibmF2aWdhdGVUb01lc3NhZ2VQYWdlIiwiZ2V0VGV4dCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJiRnJvbURlZmVycmVkIiwibmF2aWdhdGVUb0NvbnRleHQiLCJvQ3JlYXRpb25Sb3dMaXN0QmluZGluZyIsIm9OZXdUcmFuc2llbnRDb250ZXh0IiwiY3JlYXRlIiwic2V0QmluZGluZ0NvbnRleHQiLCJjYXRjaCIsInRyYWNlIiwiZGVsZXRlIiwiaXNMb2NrZWQiLCJyZWplY3QiLCJhUGFyYW1zIiwiYWxsIiwibWV0YUNvbnRleHQiLCJiaW5kQ29udGV4dCIsImVudGl0eVNldCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsInN0YXJ0aW5nRW50aXR5U2V0IiwibmV3QWN0aW9uIiwiYW5ub3RhdGlvbnMiLCJTZXNzaW9uIiwiU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIk5ld0FjdGlvbiIsImdldEludGVybmFsTW9kZWwiLCJzZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUiLCJfc2VuZEFjdGl2aXR5IiwiQ3JlYXRlIiwiaXNDb25uZWN0ZWQiLCJDYW5jZWxBY3Rpb25EaWFsb2ciLCJBY3Rpb25FeGVjdXRpb25GYWlsZWQiLCJDcmVhdGlvbkZhaWxlZCIsIm5hdmlnYXRlQmFja0Zyb21UcmFuc2llbnRTdGF0ZSIsImNyZWF0ZU11bHRpcGxlRG9jdW1lbnRzIiwiZGF0YUZvckNyZWF0ZSIsImlzRnJvbUNvcHlQYXN0ZSIsImNyZWF0ZUFzSW5hY3RpdmUiLCJ0YXJnZXRMaXN0QmluZGluZyIsImNvbnRleHRQYXRoIiwibWV0YVBhdGgiLCJnZXRDb250ZXh0IiwiY3JlYXRpb25Qcm9taXNlcyIsInByb3BlcnR5VmFsdWVzIiwiY3JlYXRlUGFyYW1ldGVycyIsImluYWN0aXZlIiwicHJvcGVydHlQYXRoIiwicHJvcGVydHkiLCJpbmRleE9mIiwiY3JlYXRlZENvbnRleHRzIiwibmV3Q29udGV4dCIsImJJbmFjdGl2ZSIsImVyciIsIm9uQmVmb3JlU2F2ZSIsIl9tUGFyYW1ldGVycyIsIm9uQmVmb3JlRGlzY2FyZCIsInNhdmVEb2N1bWVudCIsImJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIiwiYUJpbmRpbmdzIiwiYmluZGluZ3MiLCJfc3VibWl0T3BlbkNoYW5nZXMiLCJpc0ZjbEVuYWJsZWQiLCJhY3RpdmVEb2N1bWVudENvbnRleHQiLCJfZ2V0UmVzb3VyY2VNb2RlbCIsImdldENyZWF0aW9uTW9kZSIsIl9yZW1vdmVTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzIiwiQWN0aXZhdGUiLCJkaXNjb25uZWN0IiwiX3RyaWdnZXJDb25maWd1cmVkU3VydmV5IiwiU3RhbmRhcmRBY3Rpb25zIiwic2F2ZSIsIlRyaWdnZXJUeXBlIiwic3RhbmRhcmRBY3Rpb24iLCJEaXNwbGF5IiwiY2FuY2VsZWQiLCJ0b2dnbGVEcmFmdEFjdGl2ZSIsIm9Db250ZXh0RGF0YSIsImJFZGl0YWJsZSIsImJJc0RyYWZ0IiwiSXNBY3RpdmVFbnRpdHkiLCJIYXNBY3RpdmVFbnRpdHkiLCJIYXNEcmFmdEVudGl0eSIsIm9SaWdodG1vc3RDb250ZXh0IiwibGFzdFNlbWFudGljTWFwcGluZyIsInRlY2huaWNhbFBhdGgiLCJ0YXJnZXRQYXRoIiwibmV3UGF0aCIsIm9sZFBhdGgiLCJjYW5jZWxEb2N1bWVudCIsImlzTmV3RG9jdW1lbnQiLCJjYW5jZWxCdXR0b24iLCJjb250cm9sIiwiYmVmb3JlQ2FuY2VsQ2FsbEJhY2siLCJjYW5jZWxSZXN1bHQiLCJpc0RvY3VtZW50TW9kaWZpZWQiLCJnZXRJbnN0YW5jZWRWaWV3cyIsInZpZXciLCJpc0tlZXBBbGl2ZSIsInNldEtlZXBBbGl2ZSIsIkRpc2NhcmQiLCJza2lwQmFja05hdmlnYXRpb24iLCJuYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dCIsIm9BY3RpdmVEb2N1bWVudENvbnRleHQiLCJfZmV0Y2hTZW1hbnRpY0tleVZhbHVlcyIsInNraXBCaW5kaW5nVG9WaWV3Iiwic2hvd0RvY3VtZW50RGlzY2FyZE1lc3NhZ2UiLCJyZXNvdXJjZU1vZGVsIiwiZ2V0Um91dGluZ1NlcnZpY2UiLCJhdHRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsInNob3dNZXNzYWdlV2hlbk5vQ29udGV4dCIsIk1lc3NhZ2VUb2FzdCIsInNob3ciLCJkZXRhY2hBZnRlclJvdXRlTWF0Y2hlZCIsImlzRHJhZnRSb290IiwidGFyZ2V0RW50aXR5U2V0IiwiZGVsZXRlRG9jdW1lbnQiLCJnZXRJbmRleCIsInNpYmxpbmdDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0IiwiZHJhZnRQYXRoIiwicmVxdWVzdENhbm9uaWNhbFBhdGgiLCJkcmFmdENvbnRleHRUb1JlbW92ZSIsInJlcGxhY2VXaXRoIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsInNldEJhY2tOYXZpZ2F0aW9uIiwiRGVlcGxpbmsiLCJleGl0RnJvbUFwcCIsImFwcGx5RG9jdW1lbnQiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImludm9rZUFjdGlvbiIsInNBY3Rpb25OYW1lIiwibUV4dHJhUGFyYW1zIiwib0NvbnRyb2wiLCJhUGFydHMiLCJzT3ZlcmxvYWRFbnRpdHlUeXBlIiwib0N1cnJlbnRBY3Rpb25DYWxsQmFja3MiLCJBcnJheSIsImlzQXJyYXkiLCJjb250ZXh0cyIsImlzTmF2aWdhYmxlIiwicmVxdWlyZXNOYXZpZ2F0aW9uIiwiY29udmVydGVkTWV0YWRhdGEiLCJjb252ZXJ0VHlwZXMiLCJlbnRpdHlDb250YWluZXIiLCJuYW1lIiwiaXNCb3VuZCIsImludGVybmFsTW9kZWxDb250ZXh0Iiwic3BsaXQiLCJyZXBsYWNlQWxsIiwiYlN0YXRpY0FjdGlvbiIsImlzVGFibGVCb3VuZCIsInNCaW5kaW5nUGF0aCIsInBhdGgiLCJfZ2V0QWN0aW9uT3ZlcmxvYWRDb250ZXh0RnJvbU1ldGFkYXRhUGF0aCIsImVuYWJsZUF1dG9TY3JvbGwiLCJjcmVhdGVBY3Rpb25Qcm9taXNlIiwic0lkIiwiYkdldEJvdW5kQ29udGV4dCIsIl9nZXRCb3VuZENvbnRleHQiLCJiT2JqZWN0UGFnZSIsImNvbnZlcnRlclR5cGUiLCJvUmVzcG9uc2UiLCJjYWxsQWN0aW9uIiwibGlzdFJlZnJlc2hlZCIsIl9yZWZyZXNoTGlzdElmUmVxdWlyZWQiLCJnZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzIiwiYWN0aW9uUmVxdWVzdGVkUHJvcGVydGllcyIsInZhbHVlIiwiQWN0aW9uIiwiYWN0aW9uIiwiZlJlc29sdmVyIiwidkNvbnRleHQiLCJzQ29udGV4dE1ldGFQYXRoIiwiX2ZuVmFsaWRDb250ZXh0cyIsImFwcGxpY2FibGVDb250ZXh0cyIsImVsZW1lbnQiLCJvQWN0aW9uQ29udGV4dCIsInNBY3Rpb25Db250ZXh0TWV0YVBhdGgiLCJjaGVja05vSGFzaENoYW5nZSIsIm5vSGlzdG9yeUVudHJ5IiwiaW5mbyIsIm9uQWZ0ZXJBY3Rpb25FeGVjdXRpb24iLCJmUmVqZWN0b3IiLCJyZWplY3RlZEl0ZW1zIiwiX2FjdGlvbk5hbWUiLCJzZWN1cmVkRXhlY3V0aW9uIiwiZm5GdW5jdGlvbiIsImJCdXN5U2V0IiwiYnVzeSIsInNldCIsImJCdXN5Q2hlY2siLCJjaGVjayIsImJVcGRhdGVzRG9jdW1lbnQiLCJ1cGRhdGVzRG9jdW1lbnQiLCJmaW5hbGx5IiwiaGFuZGxlUGF0Y2hTZW50Iiwib0V2ZW50IiwiaXNJbkNvbGxhYm9yYXRpdmVEcmFmdCIsImdldFNvdXJjZSIsInNldElnbm9yZUVUYWciLCJzb3VyY2VCaW5kaW5nIiwib1BhdGNoUHJvbWlzZSIsInBhdGNoQ29tcGxldGVkRXZlbnQiLCJBY3Rpb25SdW50aW1lIiwic2V0QWN0aW9uRW5hYmxlbWVudEFmdGVyUGF0Y2giLCJiU3VjY2VzcyIsImdldFBhcmFtZXRlciIsImhhbmRsZUNyZWF0ZUFjdGl2YXRlIiwib0JpbmRpbmciLCJiQXRFbmQiLCJvUGFyYW1zIiwiYWN0aXZhdGVkQ29udGV4dCIsIndhcm5pbmciLCJuZXdJbmFjdGl2ZUNvbnRleHQiLCJuZXdUYXNrIiwiY29tcHV0ZUVkaXRNb2RlIiwiZ2xvYmFsTW9kZWwiLCJpc0FjdGl2ZUVudGl0eSIsInJlcXVlc3RPYmplY3QiLCJoYXNBY3RpdmVFbnRpdHkiLCJsYXN0SW52b2tlZEFjdGlvbk5hbWUiLCJpc05ld0FjdGlvbkZvclN0aWNreSIsImdldFJlc291cmNlTW9kZWwiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJUcmFuc2FjdGlvbkhlbHBlciIsIm1lc3NhZ2VIYW5kbGVyIiwic2V0Q3JlYXRpb25Nb2RlIiwiYkNyZWF0aW9uTW9kZSIsInVpTW9kZWxDb250ZXh0IiwibW9kaWZpZWQiLCJiaW5kaW5nIiwiYXR0YWNoRXZlbnQiLCJzdWNjZXNzIiwiZHJhZnRTdGF0dXMiLCJzb3VyY2UiLCJlZGl0TW9kZSIsImlzQ3JlYXRpb24iLCJhY3Rpb25OYW1lIiwic3RpY2t5U2Vzc2lvbiIsIkFkZGl0aW9uYWxOZXdBY3Rpb25zIiwiaGFzTmF2aWdhdGlvbkd1YXJkIiwiaGFzaFRyYWNrZXIiLCJnZXRIYXNoIiwiaW50ZXJuYWxNb2RlbCIsInNldFRpbWVvdXQiLCJzZXROYXZpZ2F0aW9uR3VhcmQiLCJzdWJzdHJpbmciLCJvbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uIiwiZGlydHlTdGF0ZVByb3ZpZGVyRnVuY3Rpb24iLCJnZXREaXJ0eVN0YXRlUHJvdmlkZXIiLCJyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciIsImkxOG5Nb2RlbCIsInNlc3Npb25UaW1lb3V0RnVuY3Rpb24iLCJnZXRTZXNzaW9uVGltZW91dEZ1bmN0aW9uIiwiYXR0YWNoU2Vzc2lvblRpbWVvdXQiLCJzdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uRnVuY3Rpb24iLCJnZXRSb3V0ZU1hdGNoZWRGdW5jdGlvbiIsImF0dGFjaFJvdXRlTWF0Y2hlZCIsImhhbmRsZVN0aWNreU9mZiIsImRpc2NhcmROYXZpZ2F0aW9uR3VhcmQiLCJkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIiwiZGV0YWNoU2Vzc2lvblRpbWVvdXQiLCJkZXRhY2hSb3V0ZU1hdGNoZWQiLCJnZXRIdHRwSGVhZGVycyIsIm5hdmlnYXRpb25Db250ZXh0IiwidGFyZ2V0SGFzaCIsImlubmVyQXBwUm91dGUiLCJyb3V0ZXJQcm94eSIsImxjbEhhc2hUcmFja2VyIiwiaXNEaXJ0eSIsImlzU2Vzc2lvbk9uIiwiaXNOYXZpZ2F0aW9uRmluYWxpemVkIiwiY2hlY2tIYXNoV2l0aEd1YXJkIiwiaXNHdWFyZENyb3NzQWxsb3dlZEJ5VXNlciIsInNldERpcnR5RmxhZyIsIndhcm5pbmdEaWFsb2ciLCJEaWFsb2ciLCJzdGF0ZSIsImNvbnRlbnQiLCJUZXh0IiwiYmVnaW5CdXR0b24iLCJCdXR0b24iLCJwcmVzcyIsImFmdGVyQ2xvc2UiLCJkZXN0cm95IiwiYWRkU3R5bGVDbGFzcyIsInNldE1vZGVsIiwiYWRkRGVwZW5kZW50Iiwib3BlbiIsImN1cnJlbnRIYXNoIiwiZGlzY2FyZFN0aWNreVNlc3Npb24iLCJjbGVhclNlc3Npb25Db250ZXh0IiwiZGlzY2FyZGVkQ29udGV4dCIsInN0aWNreSIsImRpc2NhcmREb2N1bWVudCIsInJlc2V0Q2hhbmdlcyIsIl9yb3V0aW5nIiwiZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwiZ2V0TGFzdFNlbWFudGljTWFwcGluZyIsInJlc29sdmVGdW5jdGlvbiIsInJlamVjdEZ1bmN0aW9uIiwiYWN0aW9uUHJvbWlzZSIsImFzc2lnbiIsInJlc3BvbnNlIiwiY3VycmVudFZpZXciLCJtZXRhTW9kZWxEYXRhIiwiYWN0aW9uUmV0dXJuVHlwZSIsIiRSZXR1cm5UeXBlIiwiJFR5cGUiLCIkS2V5Iiwib0RhdGEiLCJnZXRDdXJyZW50QWN0aW9uUHJvbWlzZSIsImRlbGV0ZUN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiX3Njcm9sbEFuZEZvY3VzT25JbmFjdGl2ZVJvdyIsInRhYmxlIiwicm93QmluZGluZyIsImFjdGl2ZVJvd0luZGV4IiwiZ2V0Q291bnQiLCJhbGxSb3dDb250ZXh0cyIsImdldENvbnRleHRzIiwiaW5kZXgiLCJzaW5nbGVDb250ZXh0IiwiaXNJbmFjdGl2ZSIsImNyZWF0ZUVtcHR5Um93c0FuZEZvY3VzIiwidGFibGVBUEkiLCJ0YWJsZURlZmluaXRpb24iLCJpbmxpbmVDcmVhdGlvblJvd3NIaWRkZW5JbkVkaXRNb2RlIiwic2V0VXBFbXB0eVJvd3MiLCJyZWxhdGVkQ29udGV4dHMiLCJyZWZyZXNoTGlzdEJpbmRpbmciLCJ0cmlnZ2VyVHlwZSIsInRyaWdnZXJDb25maWd1cmVkU3VydmV5Iiwic3VibWl0QmF0Y2giLCJvUmVxdWVzdG9yIiwid2FpdEZvclJ1bm5pbmdDaGFuZ2VSZXF1ZXN0cyIsImNoZWNrSWZCYWNrSXNPdXRPZkd1YXJkIiwiYmluZGluZ0NvbnRleHQiLCJwcm9jZXNzRGF0YUxvc3NDb25maXJtYXRpb24iLCJoaXN0b3J5IiwiYmFjayIsImJSZWNyZWF0ZUNvbnRleHQiLCJiUGVyc2lzdE9QU2Nyb2xsIiwic2hvd1BsYWNlaG9sZGVyIiwia2VlcEN1cnJlbnRMYXlvdXQiLCJwYXJhbXMiLCJiUmVmcmVzaEFmdGVyQWN0aW9uIiwic1ZpZXdJZCIsImdldElkIiwiYU1lc3NhZ2VzIiwiaSIsInZhbGlkYXRpb24iLCJnZXRDb250cm9sSWQiLCJhS2V5cyIsIm9DdXJyZW50RGF0YSIsImJSZXR1cm5lZENvbnRleHRJc1NhbWUiLCJldmVyeSIsInNLZXkiLCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsImUiLCJzRW50aXR5U2V0TmFtZSIsImFTZW1hbnRpY0tleXMiLCJhUmVxdWVzdFByb21pc2VzIiwib0tleSIsIiRQcm9wZXJ0eVBhdGgiLCJyb290Q29udGV4dCIsIm92ZXJsb2FkRW50aXR5VHlwZSIsImNvbnRleHRTZWdtZW50cyIsImN1cnJlbnRDb250ZXh0IiwicG9wIiwidW5zaGlmdCIsInBhcmVudENvbnRleHRzIiwicGF0aFNlZ21lbnQiLCJyZXZlcnNlIiwib3ZlcmxvYWRDb250ZXh0IiwiZmluZCIsInBhcmVudENvbnRleHQiLCJtYXBwaW5ncyIsInNldFBhdGhNYXBwaW5nIiwibmV3RG9jdW1lbnRDb250ZXh0Iiwicm9vdEN1cnJlbnRDb250ZXh0IiwicmlnaHRtb3N0Q3VycmVudENvbnRleHQiLCJkb05vdENvbXB1dGVJZlJvb3QiLCJzdGFydHNXaXRoIiwiZHJhZnQiLCJjb21wdXRlU2libGluZ0luZm9ybWF0aW9uIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRWRpdEZsb3cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXQgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgQWN0aXZpdHlTeW5jIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0FjdGl2aXR5U3luY1wiO1xuaW1wb3J0IHsgQWN0aXZpdHksIHNoYXJlT2JqZWN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQ29sbGFib3JhdGlvbkNvbW1vblwiO1xuaW1wb3J0IHR5cGUgeyBSb290Q29udGV4dEluZm8sIFNpYmxpbmdJbmZvcm1hdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IGRyYWZ0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IHN0aWNreSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvc3RpY2t5XCI7XG5pbXBvcnQgVHJhbnNhY3Rpb25IZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L1RyYW5zYWN0aW9uSGVscGVyXCI7XG5pbXBvcnQgeyBTdGFuZGFyZEFjdGlvbnMsIHRyaWdnZXJDb25maWd1cmVkU3VydmV5LCBUcmlnZ2VyVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9GZWVkYmFja1wiO1xuaW1wb3J0IHR5cGUgSW50ZXJuYWxSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbFJvdXRpbmdcIjtcbmltcG9ydCB7IGNvbnZlcnRUeXBlcywgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXh0ZW5zaWJsZSwgZmluYWxFeHRlbnNpb24sIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEVkaXRTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9FZGl0U3RhdGVcIjtcbmltcG9ydCB7IGdldE5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01ldGFNb2RlbEZ1bmN0aW9uXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBTZW1hbnRpY0tleUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TZW1hbnRpY0tleUhlbHBlclwiO1xuaW1wb3J0IEZFTGlicmFyeSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBTZW1hbnRpY01hcHBpbmcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvUm91dGluZ1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBUYWJsZUFQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUFQSVwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBNZXNzYWdlVG9hc3QgZnJvbSBcInNhcC9tL01lc3NhZ2VUb2FzdFwiO1xuaW1wb3J0IFRleHQgZnJvbSBcInNhcC9tL1RleHRcIjtcbmltcG9ydCB0eXBlIEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBjb3JlTGlicmFyeSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9CaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YVY0Q29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCBBY3Rpb25SdW50aW1lIGZyb20gXCIuLi9BY3Rpb25SdW50aW1lXCI7XG5pbXBvcnQgdHlwZSB7IEJhc2VNYW5pZmVzdFNldHRpbmdzIH0gZnJvbSBcIi4uL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuXG5jb25zdCBDcmVhdGlvbk1vZGUgPSBGRUxpYnJhcnkuQ3JlYXRpb25Nb2RlLFxuXHRQcm9ncmFtbWluZ01vZGVsID0gRkVMaWJyYXJ5LlByb2dyYW1taW5nTW9kZWwsXG5cdENvbnN0YW50cyA9IEZFTGlicmFyeS5Db25zdGFudHMsXG5cdERyYWZ0U3RhdHVzID0gRkVMaWJyYXJ5LkRyYWZ0U3RhdHVzLFxuXHRFZGl0TW9kZSA9IEZFTGlicmFyeS5FZGl0TW9kZSxcblx0U3RhcnR1cE1vZGUgPSBGRUxpYnJhcnkuU3RhcnR1cE1vZGUsXG5cdE1lc3NhZ2VUeXBlID0gY29yZUxpYnJhcnkuTWVzc2FnZVR5cGU7XG5cbi8qKlxuICogQSBjb250cm9sbGVyIGV4dGVuc2lvbiBvZmZlcmluZyBob29rcyBpbnRvIHRoZSBlZGl0IGZsb3cgb2YgdGhlIGFwcGxpY2F0aW9uXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuOTAuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1wiKVxuY2xhc3MgRWRpdEZsb3cgZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHRwcml2YXRlIGRpcnR5U3RhdGVQcm92aWRlckZ1bmN0aW9uPzogRnVuY3Rpb247XG5cblx0cHJpdmF0ZSBzZXNzaW9uVGltZW91dEZ1bmN0aW9uPzogRnVuY3Rpb247XG5cblx0cHJpdmF0ZSBzdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uRnVuY3Rpb24/OiBGdW5jdGlvbjtcblxuXHRwcml2YXRlIHN5bmNUYXNrczogUHJvbWlzZTxhbnk+ID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cblx0cHJpdmF0ZSBhY3Rpb25Qcm9taXNlPzogUHJvbWlzZTxhbnk+O1xuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIFB1YmxpYyBtZXRob2RzXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cblx0Z2V0QXBwQ29tcG9uZW50KCk6IEFwcENvbXBvbmVudCB7XG5cdFx0cmV0dXJuIHRoaXMuYmFzZS5nZXRBcHBDb21wb25lbnQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZHJhZnQgZG9jdW1lbnQgZm9yIGFuIGV4aXN0aW5nIGFjdGl2ZSBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBhY3RpdmUgZG9jdW1lbnRcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIHRoZSBlZGl0YWJsZSBkb2N1bWVudCBpcyBhdmFpbGFibGVcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I2VkaXREb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBlZGl0RG9jdW1lbnQob0NvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBiRHJhZnROYXZpZ2F0aW9uID0gdHJ1ZTtcblx0XHRjb25zdCB0cmFuc2FjdGlvbkhlbHBlciA9IHRoaXMuZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKTtcblx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXHRcdGNvbnN0IG1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRsZXQgcmlnaHRtb3N0Q29udGV4dCwgc2libGluZ0luZm87XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gdGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBCYXNlTWFuaWZlc3RTZXR0aW5ncztcblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCk7XG5cdFx0bGV0IG9Sb290Q29udGV4dDogQ29udGV4dCA9IG9Db250ZXh0O1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKChvVmlld0RhdGE/LnZpZXdMZXZlbCBhcyBudW1iZXIpID4gMSkge1xuXHRcdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgfHwgc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRcdFx0b1Jvb3RDb250ZXh0ID0gKGF3YWl0IENvbW1vblV0aWxzLmNyZWF0ZVJvb3RDb250ZXh0KHNQcm9ncmFtbWluZ01vZGVsLCBvVmlldywgdGhpcy5nZXRBcHBDb21wb25lbnQoKSkpIGFzIENvbnRleHQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGF3YWl0IHRoaXMuYmFzZS5lZGl0Rmxvdy5vbkJlZm9yZUVkaXQoeyBjb250ZXh0OiBvUm9vdENvbnRleHQgfSk7XG5cdFx0XHRjb25zdCBvTmV3RG9jdW1lbnRDb250ZXh0ID0gYXdhaXQgdHJhbnNhY3Rpb25IZWxwZXIuZWRpdERvY3VtZW50KFxuXHRcdFx0XHRvUm9vdENvbnRleHQsXG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLFxuXHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKClcblx0XHRcdCk7XG5cblx0XHRcdHRoaXMuX3NldFN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMoc1Byb2dyYW1taW5nTW9kZWwsIG1vZGVsKTtcblxuXHRcdFx0aWYgKG9OZXdEb2N1bWVudENvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGl0TW9kZShFZGl0TW9kZS5FZGl0YWJsZSwgZmFsc2UpO1xuXHRcdFx0XHR0aGlzLnNldERvY3VtZW50TW9kaWZpZWQoZmFsc2UpO1xuXHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VEaWFsb2coKTtcblxuXHRcdFx0XHRpZiAob05ld0RvY3VtZW50Q29udGV4dCAhPT0gb1Jvb3RDb250ZXh0KSB7XG5cdFx0XHRcdFx0bGV0IGNvbnRleHRUb05hdmlnYXRlOiBDb250ZXh0IHwgdW5kZWZpbmVkID0gb05ld0RvY3VtZW50Q29udGV4dDtcblx0XHRcdFx0XHRpZiAodGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRcdHJpZ2h0bW9zdENvbnRleHQgPSBvUm9vdFZpZXdDb250cm9sbGVyLmdldFJpZ2h0bW9zdENvbnRleHQoKTtcblx0XHRcdFx0XHRcdHNpYmxpbmdJbmZvID0gYXdhaXQgdGhpcy5fY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihvUm9vdENvbnRleHQsIHJpZ2h0bW9zdENvbnRleHQsIHNQcm9ncmFtbWluZ01vZGVsLCB0cnVlKTtcblx0XHRcdFx0XHRcdHNpYmxpbmdJbmZvID0gc2libGluZ0luZm8gPz8gdGhpcy5fY3JlYXRlU2libGluZ0luZm8ob0NvbnRleHQsIG9OZXdEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdFx0XHRcdFx0aWYgKHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQuZ2V0UGF0aCgpICE9IG9OZXdEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHRUb05hdmlnYXRlID0gc2libGluZ0luZm8udGFyZ2V0Q29udGV4dDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKChvVmlld0RhdGE/LnZpZXdMZXZlbCBhcyBudW1iZXIpID4gMSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgcm9vdFNpYmxpbmdQYXRoID0gb05ld0RvY3VtZW50Q29udGV4dD8uZ2V0UGF0aCgpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgcm9vdENvbnRleHRJbmZvID0ge1xuXHRcdFx0XHRcdFx0XHRyb290U2libGluZ1BhdGg6IHJvb3RTaWJsaW5nUGF0aCxcblx0XHRcdFx0XHRcdFx0cm9vdENvbnRleHROb3RSZXF1aXJlZDogdHJ1ZVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdHNpYmxpbmdJbmZvID0gYXdhaXQgdGhpcy5fY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihcblx0XHRcdFx0XHRcdFx0b1Jvb3RDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0XHRcdFx0c1Byb2dyYW1taW5nTW9kZWwsXG5cdFx0XHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0XHRcdHJvb3RDb250ZXh0SW5mb1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGNvbnRleHRUb05hdmlnYXRlID0gdGhpcy5fZ2V0TmF2aWdhdGlvblRhcmdldEZvckVkaXQob0NvbnRleHQsIG9OZXdEb2N1bWVudENvbnRleHQsIHNpYmxpbmdJbmZvKSBhcyBDb250ZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVOZXdDb250ZXh0KGNvbnRleHRUb05hdmlnYXRlLCB0cnVlLCBmYWxzZSwgYkRyYWZ0TmF2aWdhdGlvbiwgdHJ1ZSk7XG5cdFx0XHRcdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSkge1xuXHRcdFx0XHRcdFx0Ly8gVGhlIHN0aWNreU9uIGhhbmRsZXIgbXVzdCBiZSBzZXQgYWZ0ZXIgdGhlIG5hdmlnYXRpb24gaGFzIGJlZW4gZG9uZSxcblx0XHRcdFx0XHRcdC8vIGFzIHRoZSBVUkwgbWF5IGNoYW5nZSBpbiB0aGUgY2FzZSBvZiBGQ0xcblx0XHRcdFx0XHRcdGxldCBzdGlja3lDb250ZXh0OiBDb250ZXh0O1xuXHRcdFx0XHRcdFx0aWYgKHRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFdlIG5lZWQgdG8gdXNlIHRoZSBrZXB0LWFsaXZlIGNvbnRleHQgdXNlZCB0byBiaW5kIHRoZSBwYWdlXG5cdFx0XHRcdFx0XHRcdHN0aWNreUNvbnRleHQgPSBvTmV3RG9jdW1lbnRDb250ZXh0LmdldE1vZGVsKCkuZ2V0S2VlcEFsaXZlQ29udGV4dChvTmV3RG9jdW1lbnRDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRzdGlja3lDb250ZXh0ID0gb05ld0RvY3VtZW50Q29udGV4dDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRoaXMuaGFuZGxlU3RpY2t5T24oc3RpY2t5Q29udGV4dCk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChtb2RlbC5nZXRNZXRhTW9kZWwoKSkpIHtcblx0XHRcdFx0XHRcdC8vIGFjY29yZGluZyB0byBVWCBpbiBjYXNlIG9mIGVuYWJsZWQgY29sbGFib3JhdGlvbiBkcmFmdCB3ZSBzaGFyZSB0aGUgb2JqZWN0IGltbWVkaWF0ZWx5XG5cdFx0XHRcdFx0XHRhd2FpdCBzaGFyZU9iamVjdChvTmV3RG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGVkaXRpbmcgdGhlIGRvY3VtZW50XCIsIG9FcnJvciBhcyBhbnkpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZWxldGVzIHNldmVyYWwgZG9jdW1lbnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dHNUb0RlbGV0ZSBUaGUgY29udGV4dHMgb2YgdGhlIGRvY3VtZW50cyB0byBiZSBkZWxldGVkXG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzIFRoZSBwYXJhbWV0ZXJzXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZWQgb25jZSB0aGUgZG9jdW1lbnRzIGFyZSBkZWxldGVkXG5cdCAqL1xuXHRhc3luYyBkZWxldGVNdWx0aXBsZURvY3VtZW50cyhjb250ZXh0c1RvRGVsZXRlOiBDb250ZXh0W10sIHBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGlmIChwYXJhbWV0ZXJzKSB7XG5cdFx0XHRwYXJhbWV0ZXJzLmJlZm9yZURlbGV0ZUNhbGxCYWNrID0gdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlRGVsZXRlO1xuXHRcdFx0cGFyYW1ldGVycy5yZXF1ZXN0U2lkZUVmZmVjdHMgPSBwYXJhbWV0ZXJzLnJlcXVlc3RTaWRlRWZmZWN0cyAhPT0gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdGJlZm9yZURlbGV0ZUNhbGxCYWNrOiB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVEZWxldGUsXG5cdFx0XHRcdHJlcXVlc3RTaWRlRWZmZWN0czogdHJ1ZVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y29uc3QgbG9ja09iamVjdCA9IHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpO1xuXHRcdGNvbnN0IHBhcmVudENvbnRyb2wgPSB0aGlzLmdldFZpZXcoKS5ieUlkKHBhcmFtZXRlcnMuY29udHJvbElkKTtcblx0XHRpZiAoIXBhcmVudENvbnRyb2wpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcInBhcmFtZXRlciBjb250cm9sSWQgbWlzc2luZyBvciBpbmNvcnJlY3RcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHBhcmFtZXRlcnMucGFyZW50Q29udHJvbCA9IHBhcmVudENvbnRyb2w7XG5cdFx0fVxuXHRcdGNvbnN0IGxpc3RCaW5kaW5nID0gKHBhcmVudENvbnRyb2wuZ2V0QmluZGluZyhcIml0ZW1zXCIpIHx8IChwYXJlbnRDb250cm9sIGFzIFRhYmxlKS5nZXRSb3dCaW5kaW5nKCkpIGFzIE9EYXRhTGlzdEJpbmRpbmc7XG5cdFx0cGFyYW1ldGVycy5iRmluZEFjdGl2ZUNvbnRleHRzID0gdHJ1ZTtcblx0XHRCdXN5TG9ja2VyLmxvY2sobG9ja09iamVjdCk7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5kZWxldGVEb2N1bWVudFRyYW5zYWN0aW9uKGNvbnRleHRzVG9EZWxldGUsIHBhcmFtZXRlcnMpO1xuXHRcdFx0bGV0IHJlc3VsdDtcblxuXHRcdFx0Ly8gTXVsdGlwbGUgb2JqZWN0IGRlbGV0aW9uIGlzIHRyaWdnZXJlZCBmcm9tIGEgbGlzdFxuXHRcdFx0Ly8gRmlyc3QgY2xlYXIgdGhlIHNlbGVjdGlvbiBpbiB0aGUgdGFibGUgYXMgaXQncyBub3QgdmFsaWQgYW55IG1vcmVcblx0XHRcdGlmIChwYXJlbnRDb250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0KHBhcmVudENvbnRyb2wgYXMgYW55KS5jbGVhclNlbGVjdGlvbigpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUaGVuIHJlZnJlc2ggdGhlIGxpc3QtYmluZGluZyAoTFIpLCBvciByZXF1aXJlIHNpZGUtZWZmZWN0cyAoT1ApXG5cdFx0XHRjb25zdCB2aWV3QmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0aWYgKChsaXN0QmluZGluZyBhcyBhbnkpLmlzUm9vdCgpKSB7XG5cdFx0XHRcdC8vIGtlZXAgcHJvbWlzZSBjaGFpbiBwZW5kaW5nIHVudGlsIHJlZnJlc2ggb2YgbGlzdGJpbmRpbmcgaXMgY29tcGxldGVkXG5cdFx0XHRcdHJlc3VsdCA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdFx0bGlzdEJpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlY2VpdmVkXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGxpc3RCaW5kaW5nLnJlZnJlc2goKTtcblx0XHRcdH0gZWxzZSBpZiAodmlld0JpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRcdC8vIGlmIHRoZXJlIGFyZSB0cmFuc2llbnQgY29udGV4dHMsIHdlIG11c3QgYXZvaWQgcmVxdWVzdGluZyBzaWRlIGVmZmVjdHNcblx0XHRcdFx0Ly8gdGhpcyBpcyBhdm9pZCBhIHBvdGVudGlhbCBsaXN0IHJlZnJlc2gsIHRoZXJlIGNvdWxkIGJlIGEgc2lkZSBlZmZlY3QgdGhhdCByZWZyZXNoZXMgdGhlIGxpc3QgYmluZGluZ1xuXHRcdFx0XHQvLyBpZiBsaXN0IGJpbmRpbmcgaXMgcmVmcmVzaGVkLCB0cmFuc2llbnQgY29udGV4dHMgbWlnaHQgYmUgbG9zdFxuXHRcdFx0XHRpZiAocGFyYW1ldGVycy5yZXF1ZXN0U2lkZUVmZmVjdHMgJiYgIUNvbW1vblV0aWxzLmhhc1RyYW5zaWVudENvbnRleHQobGlzdEJpbmRpbmcpKSB7XG5cdFx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKVxuXHRcdFx0XHRcdFx0LmdldFNpZGVFZmZlY3RzU2VydmljZSgpXG5cdFx0XHRcdFx0XHQucmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5KGxpc3RCaW5kaW5nLmdldFBhdGgoKSwgdmlld0JpbmRpbmdDb250ZXh0IGFzIENvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIGRlbGV0aW5nIGF0IGxlYXN0IG9uZSBvYmplY3Qgc2hvdWxkIGFsc28gc2V0IHRoZSBVSSB0byBkaXJ0eVxuXHRcdFx0aWYgKCF0aGlzLmdldEFwcENvbXBvbmVudCgpLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblx0XHRcdH1cblxuXHRcdFx0QWN0aXZpdHlTeW5jLnNlbmQoXG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHRBY3Rpdml0eS5EZWxldGUsXG5cdFx0XHRcdGNvbnRleHRzVG9EZWxldGUubWFwKChjb250ZXh0OiBDb250ZXh0KSA9PiBjb250ZXh0LmdldFBhdGgoKSlcblx0XHRcdCk7XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fSBjYXRjaCAoZXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZGVsZXRpbmcgdGhlIGRvY3VtZW50KHMpXCIsIGVycm9yKTtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0QnVzeUxvY2tlci51bmxvY2sobG9ja09iamVjdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGRyYWZ0IHN0YXR1cyBhbmQgZGlzcGxheXMgdGhlIGVycm9yIG1lc3NhZ2VzIGlmIHRoZXJlIGFyZSBlcnJvcnMgZHVyaW5nIGFuIHVwZGF0ZS5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSB1cGRhdGVkQ29udGV4dCBDb250ZXh0IG9mIHRoZSB1cGRhdGVkIGZpZWxkXG5cdCAqIEBwYXJhbSB1cGRhdGVQcm9taXNlIFByb21pc2UgdG8gZGV0ZXJtaW5lIHdoZW4gdGhlIHVwZGF0ZSBvcGVyYXRpb24gaXMgY29tcGxldGVkLiBUaGUgcHJvbWlzZSBzaG91bGQgYmUgcmVzb2x2ZWQgd2hlbiB0aGUgdXBkYXRlIG9wZXJhdGlvbiBpcyBjb21wbGV0ZWQsIHNvIHRoZSBkcmFmdCBzdGF0dXMgY2FuIGJlIHVwZGF0ZWQuXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSBkcmFmdCBzdGF0dXMgaGFzIGJlZW4gdXBkYXRlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjdXBkYXRlRG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0dXBkYXRlRG9jdW1lbnQodXBkYXRlZENvbnRleHQ6IG9iamVjdCwgdXBkYXRlUHJvbWlzZTogUHJvbWlzZTxhbnk+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb3JpZ2luYWxCaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3QgaXNEcmFmdCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbCh1cGRhdGVkQ29udGV4dCBhcyBCaW5kaW5nIHwgQ29udGV4dCkgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQ7XG5cblx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0cmV0dXJuIHRoaXMuc3luY1Rhc2soYXN5bmMgKCkgPT4ge1xuXHRcdFx0aWYgKG9yaWdpbmFsQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5zZXREb2N1bWVudE1vZGlmaWVkKHRydWUpO1xuXHRcdFx0XHRpZiAoIXRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoaXNEcmFmdCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2aW5nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCB1cGRhdGVQcm9taXNlO1xuXHRcdFx0XHRjb25zdCBjdXJyZW50QmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0XHRpZiAoIWlzRHJhZnQgfHwgIWN1cnJlbnRCaW5kaW5nQ29udGV4dCB8fCBjdXJyZW50QmluZGluZ0NvbnRleHQgIT09IG9yaWdpbmFsQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdFx0XHQvLyBJZiBhIG5hdmlnYXRpb24gaGFwcGVuZWQgd2hpbGUgb1Byb21pc2Ugd2FzIGJlaW5nIHJlc29sdmVkLCB0aGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBwYWdlIGNoYW5nZWRcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBXZSdyZSBzdGlsbCBvbiB0aGUgc2FtZSBjb250ZXh0XG5cdFx0XHRcdGNvbnN0IG1ldGFNb2RlbCA9IGN1cnJlbnRCaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdFx0XHRjb25zdCBlbnRpdHlTZXROYW1lID0gbWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KGN1cnJlbnRCaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkpLmdldE9iamVjdChcIkBzYXB1aS5uYW1lXCIpO1xuXHRcdFx0XHRjb25zdCBzZW1hbnRpY0tleXMgPSBTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY0tleXMobWV0YU1vZGVsLCBlbnRpdHlTZXROYW1lKTtcblx0XHRcdFx0aWYgKHNlbWFudGljS2V5cz8ubGVuZ3RoKSB7XG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudFNlbWFudGljTWFwcGluZyA9IHRoaXMuX2dldFNlbWFudGljTWFwcGluZygpO1xuXHRcdFx0XHRcdGNvbnN0IGN1cnJlbnRTZW1hbnRpY1BhdGggPSBjdXJyZW50U2VtYW50aWNNYXBwaW5nPy5zZW1hbnRpY1BhdGgsXG5cdFx0XHRcdFx0XHRzQ2hhbmdlZFBhdGggPSBTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY1BhdGgoY3VycmVudEJpbmRpbmdDb250ZXh0LCB0cnVlKTtcblx0XHRcdFx0XHQvLyBjdXJyZW50U2VtYW50aWNQYXRoIGNvdWxkIGJlIG51bGwgaWYgd2UgaGF2ZSBuYXZpZ2F0ZWQgdmlhIGRlZXAgbGluayB0aGVuIHRoZXJlIGFyZSBubyBzZW1hbnRpY01hcHBpbmdzIHRvIGNhbGN1bGF0ZSBpdCBmcm9tXG5cdFx0XHRcdFx0aWYgKGN1cnJlbnRTZW1hbnRpY1BhdGggJiYgY3VycmVudFNlbWFudGljUGF0aCAhPT0gc0NoYW5nZWRQYXRoKSB7XG5cdFx0XHRcdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVOZXdDb250ZXh0KGN1cnJlbnRCaW5kaW5nQ29udGV4dCBhcyBDb250ZXh0LCB0cnVlLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5TYXZlZCk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHVwZGF0aW5nIHRoZSBkb2N1bWVudFwiLCBlcnJvcik7XG5cdFx0XHRcdGlmIChpc0RyYWZ0ICYmIG9yaWdpbmFsQmluZGluZ0NvbnRleHQpIHtcblx0XHRcdFx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLkNsZWFyKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0YXdhaXQgdGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLnNob3dNZXNzYWdlcygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gSW50ZXJuYWwgb25seSBwYXJhbXMgLS0tXG5cdC8vICogQHBhcmFtIHtzdHJpbmd9IG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSBUaGUgY3JlYXRpb24gbW9kZSB1c2luZyBvbmUgb2YgdGhlIGZvbGxvd2luZzpcblx0Ly8gKiAgICAgICAgICAgICAgICAgICAgU3luYyAtIHRoZSBjcmVhdGlvbiBpcyB0cmlnZ2VyZWQgYW5kIG9uY2UgdGhlIGRvY3VtZW50IGlzIGNyZWF0ZWQsIHRoZSBuYXZpZ2F0aW9uIGlzIGRvbmVcblx0Ly8gKiAgICAgICAgICAgICAgICAgICAgQXN5bmMgLSB0aGUgY3JlYXRpb24gYW5kIHRoZSBuYXZpZ2F0aW9uIHRvIHRoZSBpbnN0YW5jZSBhcmUgZG9uZSBpbiBwYXJhbGxlbFxuXHQvLyAqICAgICAgICAgICAgICAgICAgICBEZWZlcnJlZCAtIHRoZSBjcmVhdGlvbiBpcyBkb25lIG9uIHRoZSB0YXJnZXQgcGFnZVxuXHQvLyAqICAgICAgICAgICAgICAgICAgICBDcmVhdGlvblJvdyAtIFRoZSBjcmVhdGlvbiBpcyBkb25lIGlubGluZSBhc3luYyBzbyB0aGUgdXNlciBpcyBub3QgYmxvY2tlZFxuXHQvLyBtUGFyYW1ldGVycy5jcmVhdGlvblJvdyBJbnN0YW5jZSBvZiB0aGUgY3JlYXRpb24gcm93IC0gKFRPRE86IGdldCByaWQgYnV0IHVzZSBsaXN0IGJpbmRpbmdzIG9ubHkpXG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gdkxpc3RCaW5kaW5nICBPRGF0YUxpc3RCaW5kaW5nIG9iamVjdCBvciB0aGUgYmluZGluZyBwYXRoIGZvciBhIHRlbXBvcmFyeSBsaXN0IGJpbmRpbmdcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMgQ29udGFpbnMgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgVGhlIGNyZWF0aW9uIG1vZGUgdXNpbmcgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG5cdCAqICAgICAgICAgICAgICAgICAgICBOZXdQYWdlIC0gdGhlIGNyZWF0ZWQgZG9jdW1lbnQgaXMgc2hvd24gaW4gYSBuZXcgcGFnZSwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgbWV0YWRhdGEgJ1N5bmMnLCAnQXN5bmMnIG9yICdEZWZlcnJlZCcgaXMgdXNlZFxuXHQgKiAgICAgICAgICAgICAgICAgICAgSW5saW5lIC0gVGhlIGNyZWF0aW9uIGlzIGRvbmUgaW5saW5lIChpbiBhIHRhYmxlKVxuXHQgKiAgICAgICAgICAgICAgICAgICAgRXh0ZXJuYWwgLSBUaGUgY3JlYXRpb24gaXMgZG9uZSBpbiBhIGRpZmZlcmVudCBhcHBsaWNhdGlvbiBzcGVjaWZpZWQgdmlhIHRoZSBwYXJhbWV0ZXIgJ291dGJvdW5kJ1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy50YWJsZUlkIElEIG9mIHRoZSB0YWJsZVxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5vdXRib3VuZCBUaGUgbmF2aWdhdGlvbiB0YXJnZXQgd2hlcmUgdGhlIGRvY3VtZW50IGlzIGNyZWF0ZWQgaW4gY2FzZSBvZiBjcmVhdGlvbk1vZGUgJ0V4dGVybmFsJ1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5jcmVhdGVBdEVuZCBTcGVjaWZpZXMgaWYgdGhlIG5ldyBlbnRyeSBzaG91bGQgYmUgY3JlYXRlZCBhdCB0aGUgdG9wIG9yIGJvdHRvbSBvZiBhIHRhYmxlIGluIGNhc2Ugb2YgY3JlYXRpb25Nb2RlICdJbmxpbmUnXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSB0aGUgb2JqZWN0IGhhcyBiZWVuIGNyZWF0ZWRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I2NyZWF0ZURvY3VtZW50XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGNyZWF0ZURvY3VtZW50KFxuXHRcdHZMaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyB8IHN0cmluZyxcblx0XHRtSW5QYXJhbWV0ZXJzOiB7XG5cdFx0XHRjcmVhdGlvbk1vZGU6IHN0cmluZztcblx0XHRcdHRhYmxlSWQ/OiBzdHJpbmc7XG5cdFx0XHRvdXRib3VuZD86IHN0cmluZztcblx0XHRcdGNyZWF0ZUF0RW5kPzogYm9vbGVhbjtcblx0XHR9XG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpLFxuXHRcdFx0b0xvY2tPYmplY3QgPSB0aGlzLmdldEdsb2JhbFVJTW9kZWwoKTtcblx0XHRsZXQgb1RhYmxlOiBhbnk7IC8vc2hvdWxkIGJlIFRhYmxlIGJ1dCB0aGVyZSBhcmUgbWlzc2luZyBtZXRob2RzIGludG8gdGhlIGRlZlxuXHRcdGxldCBtUGFyYW1ldGVyczogYW55ID0gbUluUGFyYW1ldGVycztcblx0XHRsZXQgb0NyZWF0aW9uOiBQcm9taXNlPENvbnRleHQ+IHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGJTaG91bGRCdXN5TG9jayA9XG5cdFx0XHQhbVBhcmFtZXRlcnMgfHxcblx0XHRcdChtUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5JbmxpbmUgJiZcblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cgJiZcblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuRXh0ZXJuYWwpO1xuXHRcdGxldCBvRXhlY0N1c3RvbVZhbGlkYXRpb24gPSBQcm9taXNlLnJlc29sdmUoW10pO1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGlzLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5yZW1vdmVJQXBwU3RhdGVLZXkoKTtcblxuXHRcdGlmIChtUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5FeHRlcm5hbCkge1xuXHRcdFx0Ly8gQ3JlYXRlIGJ5IG5hdmlnYXRpbmcgdG8gYW4gZXh0ZXJuYWwgdGFyZ2V0XG5cdFx0XHQvLyBUT0RPOiBDYWxsIGFwcHJvcHJpYXRlIGZ1bmN0aW9uIChjdXJyZW50bHkgdXNpbmcgdGhlIHNhbWUgYXMgZm9yIG91dGJvdW5kIGNoZXZyb24gbmF2LCBhbmQgd2l0aG91dCBhbnkgY29udGV4dCAtIDNyZCBwYXJhbSlcblx0XHRcdGF3YWl0IHRoaXMuc3luY1Rhc2soKTtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gdGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpO1xuXHRcdFx0Y29uc3Qgc0NyZWF0ZVBhdGggPSBNb2RlbEhlbHBlci5nZXRBYnNvbHV0ZU1ldGFQYXRoRm9yTGlzdEJpbmRpbmcodGhpcy5iYXNlLmdldFZpZXcoKSwgdkxpc3RCaW5kaW5nKTtcblxuXHRcdFx0KG9Db250cm9sbGVyIGFzIGFueSkuaGFuZGxlcnMub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyLCBtUGFyYW1ldGVycy5vdXRib3VuZCwgdW5kZWZpbmVkLCBzQ3JlYXRlUGF0aCk7XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cgJiYgbVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cpIHtcblx0XHRcdGNvbnN0IG9DcmVhdGlvblJvd09iamVjdHMgPSBtUGFyYW1ldGVycy5jcmVhdGlvblJvdy5nZXRCaW5kaW5nQ29udGV4dCgpLmdldE9iamVjdCgpO1xuXHRcdFx0ZGVsZXRlIG9DcmVhdGlvblJvd09iamVjdHNbXCJAJHVpNS5jb250ZXh0LmlzVHJhbnNpZW50XCJdO1xuXHRcdFx0b1RhYmxlID0gbVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cuZ2V0UGFyZW50KCk7XG5cdFx0XHRvRXhlY0N1c3RvbVZhbGlkYXRpb24gPSB0aGlzLnZhbGlkYXRlRG9jdW1lbnQob1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCksIHtcblx0XHRcdFx0ZGF0YTogb0NyZWF0aW9uUm93T2JqZWN0cyxcblx0XHRcdFx0Y3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uOiBvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKS5kYXRhKFwiY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXCIpXG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSBpcyBzZXQgdG8gZmFsc2UgaW4gbWFuaWZlc3QgY29udmVydGVyIChUYWJsZS50cykgaWYgY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uIGV4aXN0c1xuXHRcdFx0aWYgKG9UYWJsZS5nZXRDcmVhdGlvblJvdygpLmRhdGEoXCJkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhXCIpID09PSBcInRydWVcIikge1xuXHRcdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dGaWVsZFZhbGlkaXR5XCIsIHt9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuSW5saW5lICYmIG1QYXJhbWV0ZXJzLnRhYmxlSWQpIHtcblx0XHRcdG9UYWJsZSA9IHRoaXMuZ2V0VmlldygpLmJ5SWQobVBhcmFtZXRlcnMudGFibGVJZCkgYXMgVGFibGU7XG5cdFx0fVxuXG5cdFx0aWYgKG9UYWJsZSAmJiBvVGFibGUuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0Y29uc3QgZm5Gb2N1c09yU2Nyb2xsID1cblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuSW5saW5lID8gb1RhYmxlLmZvY3VzUm93LmJpbmQob1RhYmxlKSA6IG9UYWJsZS5zY3JvbGxUb0luZGV4LmJpbmQob1RhYmxlKTtcblx0XHRcdG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuYXR0YWNoRXZlbnRPbmNlKFwiY2hhbmdlXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0YXdhaXQgb0NyZWF0aW9uO1xuXHRcdFx0XHRmbkZvY3VzT3JTY3JvbGwobVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQgPyBvVGFibGUuZ2V0Um93QmluZGluZygpLmdldExlbmd0aCgpIDogMCwgdHJ1ZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRjb25zdCBoYW5kbGVTaWRlRWZmZWN0cyA9IGFzeW5jIChvTGlzdEJpbmRpbmc6IGFueSwgb0NyZWF0aW9uUHJvbWlzZTogUHJvbWlzZTxDb250ZXh0PikgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgb05ld0NvbnRleHQgPSBhd2FpdCBvQ3JlYXRpb25Qcm9taXNlO1xuXHRcdFx0XHQvLyB0cmFuc2llbnQgY29udGV4dHMgYXJlIHJlbGlhYmx5IHJlbW92ZWQgb25jZSBvTmV3Q29udGV4dC5jcmVhdGVkKCkgaXMgcmVzb2x2ZWRcblx0XHRcdFx0YXdhaXQgb05ld0NvbnRleHQuY3JlYXRlZCgpO1xuXHRcdFx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRcdC8vIGlmIHRoZXJlIGFyZSB0cmFuc2llbnQgY29udGV4dHMsIHdlIG11c3QgYXZvaWQgcmVxdWVzdGluZyBzaWRlIGVmZmVjdHNcblx0XHRcdFx0Ly8gdGhpcyBpcyBhdm9pZCBhIHBvdGVudGlhbCBsaXN0IHJlZnJlc2gsIHRoZXJlIGNvdWxkIGJlIGEgc2lkZSBlZmZlY3QgdGhhdCByZWZyZXNoZXMgdGhlIGxpc3QgYmluZGluZ1xuXHRcdFx0XHQvLyBpZiBsaXN0IGJpbmRpbmcgaXMgcmVmcmVzaGVkLCB0cmFuc2llbnQgY29udGV4dHMgbWlnaHQgYmUgbG9zdFxuXHRcdFx0XHRpZiAoIUNvbW1vblV0aWxzLmhhc1RyYW5zaWVudENvbnRleHQob0xpc3RCaW5kaW5nKSkge1xuXHRcdFx0XHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0XHRcdFx0YXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpLnJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eShvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpLCBvQmluZGluZ0NvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBjcmVhdGluZyB0aGUgZG9jdW1lbnRcIiwgb0Vycm9yKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQHBhcmFtIGFWYWxpZGF0aW9uTWVzc2FnZXMgRXJyb3IgbWVzc2FnZXMgZnJvbSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvblxuXHRcdCAqL1xuXHRcdGNvbnN0IGNyZWF0ZUN1c3RvbVZhbGlkYXRpb25NZXNzYWdlcyA9IChhVmFsaWRhdGlvbk1lc3NhZ2VzOiBhbnlbXSkgPT4ge1xuXHRcdFx0Y29uc3Qgc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiA9IG9UYWJsZSAmJiBvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKS5kYXRhKFwiY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXCIpO1xuXHRcdFx0Y29uc3QgbUN1c3RvbVZhbGlkaXR5ID0gb1RhYmxlICYmIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpPy5nZXRQcm9wZXJ0eShcImNyZWF0aW9uUm93Q3VzdG9tVmFsaWRpdHlcIik7XG5cdFx0XHRjb25zdCBvTWVzc2FnZU1hbmFnZXIgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cdFx0XHRjb25zdCBhQ3VzdG9tTWVzc2FnZXM6IGFueVtdID0gW107XG5cdFx0XHRsZXQgb0ZpZWxkQ29udHJvbDtcblx0XHRcdGxldCBzVGFyZ2V0OiBzdHJpbmc7XG5cblx0XHRcdC8vIFJlbW92ZSBleGlzdGluZyBDdXN0b21WYWxpZGF0aW9uIG1lc3NhZ2Vcblx0XHRcdG9NZXNzYWdlTWFuYWdlclxuXHRcdFx0XHQuZ2V0TWVzc2FnZU1vZGVsKClcblx0XHRcdFx0LmdldERhdGEoKVxuXHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdGlmIChvTWVzc2FnZS5jb2RlID09PSBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHRvTWVzc2FnZU1hbmFnZXIucmVtb3ZlTWVzc2FnZXMob01lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdGFWYWxpZGF0aW9uTWVzc2FnZXMuZm9yRWFjaCgob1ZhbGlkYXRpb25NZXNzYWdlOiBhbnkpID0+IHtcblx0XHRcdFx0Ly8gSGFuZGxlIEJvdW5kIEN1c3RvbVZhbGlkYXRpb24gbWVzc2FnZVxuXHRcdFx0XHRpZiAob1ZhbGlkYXRpb25NZXNzYWdlLm1lc3NhZ2VUYXJnZXQpIHtcblx0XHRcdFx0XHRvRmllbGRDb250cm9sID0gQ29yZS5nZXRDb250cm9sKG1DdXN0b21WYWxpZGl0eVtvVmFsaWRhdGlvbk1lc3NhZ2UubWVzc2FnZVRhcmdldF0uZmllbGRJZCkgYXMgQ29udHJvbDtcblx0XHRcdFx0XHRzVGFyZ2V0ID0gYCR7b0ZpZWxkQ29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCl9LyR7b0ZpZWxkQ29udHJvbC5nZXRCaW5kaW5nUGF0aChcInZhbHVlXCIpfWA7XG5cdFx0XHRcdFx0Ly8gQWRkIHZhbGlkYXRpb24gbWVzc2FnZSBpZiBzdGlsbCBub3QgZXhpc3RzXG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0b01lc3NhZ2VNYW5hZ2VyXG5cdFx0XHRcdFx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0XHRcdFx0XHQuZ2V0RGF0YSgpXG5cdFx0XHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9NZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb01lc3NhZ2UudGFyZ2V0ID09PSBzVGFyZ2V0O1xuXHRcdFx0XHRcdFx0XHR9KS5sZW5ndGggPT09IDBcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdG9NZXNzYWdlTWFuYWdlci5hZGRNZXNzYWdlcyhcblx0XHRcdFx0XHRcdFx0bmV3IE1lc3NhZ2Uoe1xuXHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2U6IG9WYWxpZGF0aW9uTWVzc2FnZS5tZXNzYWdlVGV4dCxcblx0XHRcdFx0XHRcdFx0XHRwcm9jZXNzb3I6IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogTWVzc2FnZVR5cGUuRXJyb3IsXG5cdFx0XHRcdFx0XHRcdFx0Y29kZTogc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbixcblx0XHRcdFx0XHRcdFx0XHR0ZWNobmljYWw6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdHBlcnNpc3RlbnQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdHRhcmdldDogc1RhcmdldFxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gQWRkIGNvbnRyb2xJZCBpbiBvcmRlciB0byBnZXQgdGhlIGZvY3VzIGhhbmRsaW5nIG9mIHRoZSBlcnJvciBwb3BvdmVyIHJ1bmFibGVcblx0XHRcdFx0XHRjb25zdCBhRXhpc3RpbmdWYWxpZGF0aW9uTWVzc2FnZXMgPSBvTWVzc2FnZU1hbmFnZXJcblx0XHRcdFx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0XHRcdFx0LmdldERhdGEoKVxuXHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb01lc3NhZ2UudGFyZ2V0ID09PSBzVGFyZ2V0O1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YUV4aXN0aW5nVmFsaWRhdGlvbk1lc3NhZ2VzWzBdLmFkZENvbnRyb2xJZChtQ3VzdG9tVmFsaWRpdHlbb1ZhbGlkYXRpb25NZXNzYWdlLm1lc3NhZ2VUYXJnZXRdLmZpZWxkSWQpO1xuXG5cdFx0XHRcdFx0Ly8gSGFuZGxlIFVuYm91bmQgQ3VzdG9tVmFsaWRhdGlvbiBtZXNzYWdlXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUN1c3RvbU1lc3NhZ2VzLnB1c2goe1xuXHRcdFx0XHRcdFx0Y29kZTogc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbixcblx0XHRcdFx0XHRcdHRleHQ6IG9WYWxpZGF0aW9uTWVzc2FnZS5tZXNzYWdlVGV4dCxcblx0XHRcdFx0XHRcdHBlcnNpc3RlbnQ6IHRydWUsXG5cdFx0XHRcdFx0XHR0eXBlOiBNZXNzYWdlVHlwZS5FcnJvclxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0aWYgKGFDdXN0b21NZXNzYWdlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZyh7XG5cdFx0XHRcdFx0Y3VzdG9tTWVzc2FnZXM6IGFDdXN0b21NZXNzYWdlc1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3QgcmVzb2x2ZUNyZWF0aW9uTW9kZSA9IChcblx0XHRcdGluaXRpYWxDcmVhdGlvbk1vZGU6IHN0cmluZyxcblx0XHRcdHByb2dyYW1taW5nTW9kZWw6IHN0cmluZyxcblx0XHRcdG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsXG5cdFx0KTogc3RyaW5nID0+IHtcblx0XHRcdGlmIChpbml0aWFsQ3JlYXRpb25Nb2RlICYmIGluaXRpYWxDcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5OZXdQYWdlKSB7XG5cdFx0XHRcdC8vIHVzZSB0aGUgcGFzc2VkIGNyZWF0aW9uIG1vZGVcblx0XHRcdFx0cmV0dXJuIGluaXRpYWxDcmVhdGlvbk1vZGU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBOZXdBY3Rpb24gaXMgbm90IHlldCBzdXBwb3J0ZWQgZm9yIE5hdmlnYXRpb25Qcm9wZXJ0eSBjb2xsZWN0aW9uXG5cdFx0XHRcdGlmICghb0xpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKSkge1xuXHRcdFx0XHRcdGNvbnN0IHNQYXRoID0gb0xpc3RCaW5kaW5nLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdC8vIGlmIE5ld0FjdGlvbiB3aXRoIHBhcmFtZXRlcnMgaXMgcHJlc2VudCwgdGhlbiBjcmVhdGlvbiBpcyAnRGVmZXJyZWQnXG5cdFx0XHRcdFx0XHQvLyBpbiB0aGUgYWJzZW5jZSBvZiBOZXdBY3Rpb24gb3IgTmV3QWN0aW9uIHdpdGggcGFyYW1ldGVycywgY3JlYXRpb24gaXMgYXN5bmNcblx0XHRcdFx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRcdFx0XHRwcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0XG5cdFx0XHRcdFx0XHRcdFx0PyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdC9OZXdBY3Rpb25gKVxuXHRcdFx0XHRcdFx0XHRcdDogb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZC9OZXdBY3Rpb25gKTtcblx0XHRcdFx0XHRpZiAoc05ld0FjdGlvbikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c05ld0FjdGlvbn0vQCR1aTUub3ZlcmxvYWQvMC8kUGFyYW1ldGVyYCkgfHwgW107XG5cdFx0XHRcdFx0XHQvLyBiaW5kaW5nIHBhcmFtZXRlciAoZWc6IF9pdCkgaXMgbm90IGNvbnNpZGVyZWRcblx0XHRcdFx0XHRcdGlmIChhUGFyYW1ldGVycy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBDcmVhdGlvbk1vZGUuRGVmZXJyZWQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0xpc3RCaW5kaW5nPy5nZXRIZWFkZXJDb250ZXh0KCkhLmdldFBhdGgoKSk7XG5cdFx0XHRcdGNvbnN0IGFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMgPSBnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMob01ldGFNb2RlbCwgc01ldGFQYXRoLCB0aGlzLmdldEFwcENvbXBvbmVudCgpKTtcblx0XHRcdFx0aWYgKGFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHJldHVybiBDcmVhdGlvbk1vZGUuRGVmZXJyZWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIENyZWF0aW9uTW9kZS5Bc3luYztcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKGJTaG91bGRCdXN5TG9jaykge1xuXHRcdFx0QnVzeUxvY2tlci5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGFWYWxpZGF0aW9uTWVzc2FnZXMgPSBhd2FpdCB0aGlzLnN5bmNUYXNrKG9FeGVjQ3VzdG9tVmFsaWRhdGlvbik7XG5cdFx0XHRpZiAoYVZhbGlkYXRpb25NZXNzYWdlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNyZWF0ZUN1c3RvbVZhbGlkYXRpb25NZXNzYWdlcyhhVmFsaWRhdGlvbk1lc3NhZ2VzKTtcblx0XHRcdFx0TG9nLmVycm9yKFwiQ3VzdG9tIFZhbGlkYXRpb24gZmFpbGVkXCIpO1xuXHRcdFx0XHQvLyBpZiBjdXN0b20gdmFsaWRhdGlvbiBmYWlscywgd2UgbGVhdmUgdGhlIG1ldGhvZCBpbW1lZGlhdGVseVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGxldCBvTGlzdEJpbmRpbmc6IGFueTtcblx0XHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cblx0XHRcdGlmICh2TGlzdEJpbmRpbmcgJiYgdHlwZW9mIHZMaXN0QmluZGluZyA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHQvLyB3ZSBhbHJlYWR5IGdldCBhIGxpc3QgYmluZGluZyB1c2UgdGhpcyBvbmVcblx0XHRcdFx0b0xpc3RCaW5kaW5nID0gdkxpc3RCaW5kaW5nO1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygdkxpc3RCaW5kaW5nID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdG9MaXN0QmluZGluZyA9IG5ldyAoT0RhdGFMaXN0QmluZGluZyBhcyBhbnkpKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCksIHZMaXN0QmluZGluZyk7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9IENyZWF0aW9uTW9kZS5TeW5jO1xuXHRcdFx0XHRkZWxldGUgbVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIG9iamVjdCBvciBwYXRoIGV4cGVjdGVkXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBvTW9kZWwgPSBvTGlzdEJpbmRpbmcuZ2V0TW9kZWwoKTtcblx0XHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsOiBzdHJpbmcgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwob0xpc3RCaW5kaW5nKTtcblx0XHRcdGNvbnN0IHJlc29sdmVkQ3JlYXRpb25Nb2RlID0gcmVzb2x2ZUNyZWF0aW9uTW9kZShcblx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlLFxuXHRcdFx0XHRzUHJvZ3JhbW1pbmdNb2RlbCxcblx0XHRcdFx0b0xpc3RCaW5kaW5nLFxuXHRcdFx0XHRvTW9kZWwuZ2V0TWV0YU1vZGVsKClcblx0XHRcdCk7XG5cdFx0XHRsZXQgbUFyZ3M6IGFueTtcblx0XHRcdGNvbnN0IG9DcmVhdGlvblJvdyA9IG1QYXJhbWV0ZXJzLmNyZWF0aW9uUm93O1xuXHRcdFx0bGV0IG9DcmVhdGlvblJvd0NvbnRleHQ6IGFueTtcblx0XHRcdGxldCBvUGF5bG9hZDogYW55O1xuXHRcdFx0bGV0IHNNZXRhUGF0aDogc3RyaW5nO1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IG9Sb3V0aW5nTGlzdGVuZXIgPSB0aGlzLmdldEludGVybmFsUm91dGluZygpO1xuXG5cdFx0XHRpZiAocmVzb2x2ZWRDcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5EZWZlcnJlZCkge1xuXHRcdFx0XHRpZiAocmVzb2x2ZWRDcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdykge1xuXHRcdFx0XHRcdG9DcmVhdGlvblJvd0NvbnRleHQgPSBvQ3JlYXRpb25Sb3cuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9DcmVhdGlvblJvd0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdFx0XHQvLyBwcmVmaWxsIGRhdGEgZnJvbSBjcmVhdGlvbiByb3dcblx0XHRcdFx0XHRvUGF5bG9hZCA9IG9DcmVhdGlvblJvd0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGF0YSA9IHt9O1xuXHRcdFx0XHRcdE9iamVjdC5rZXlzKG9QYXlsb2FkKS5mb3JFYWNoKGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vJHtzUHJvcGVydHlQYXRofWApO1xuXHRcdFx0XHRcdFx0Ly8gZW5zdXJlIG5hdmlnYXRpb24gcHJvcGVydGllcyBhcmUgbm90IHBhcnQgb2YgdGhlIHBheWxvYWQsIGRlZXAgY3JlYXRlIG5vdCBzdXBwb3J0ZWRcblx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHkgJiYgb1Byb3BlcnR5LiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRhdGFbc1Byb3BlcnR5UGF0aF0gPSBvUGF5bG9hZFtzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9jaGVja0ZvclZhbGlkYXRpb25FcnJvcnMoLypvQ3JlYXRpb25Sb3dDb250ZXh0Ki8pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZXNvbHZlZENyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93IHx8IHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuSW5saW5lKSB7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMua2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZCA9IGZhbHNlOyAvLyBjdXJyZW50bHkgbm90IGZ1bGx5IHN1cHBvcnRlZFxuXHRcdFx0XHRcdC8vIGJ1c3kgaGFuZGxpbmcgc2hhbGwgYmUgZG9uZSBsb2NhbGx5IG9ubHlcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5idXN5TW9kZSA9IFwiTG9jYWxcIjtcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5idXN5SWQgPSBvVGFibGU/LmdldFBhcmVudCgpPy5nZXRUYWJsZURlZmluaXRpb24oKT8uYW5ub3RhdGlvbi5pZDtcblxuXHRcdFx0XHRcdC8vIHRha2UgY2FyZSBvbiBtZXNzYWdlIGhhbmRsaW5nLCBkcmFmdCBpbmRpY2F0b3IgKGluIGNhc2Ugb2YgZHJhZnQpXG5cdFx0XHRcdFx0Ly8gQXR0YWNoIHRoZSBjcmVhdGUgc2VudCBhbmQgY3JlYXRlIGNvbXBsZXRlZCBldmVudCB0byB0aGUgb2JqZWN0IHBhZ2UgYmluZGluZyBzbyB0aGF0IHdlIGNhbiByZWFjdFxuXHRcdFx0XHRcdHRoaXMuaGFuZGxlQ3JlYXRlRXZlbnRzKG9MaXN0QmluZGluZyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wpIHtcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bVBhcmFtZXRlcnMuYmVmb3JlQ3JlYXRlQ2FsbEJhY2sgPSB0aGlzLm9uQmVmb3JlQ3JlYXRlO1xuXG5cdFx0XHRcdC8vIEluIGNhc2UgdGhlIGFwcGxpY2F0aW9uIHdhcyBjYWxsZWQgd2l0aCBwcmVmZXJyZWRNb2RlPWF1dG9DcmVhdGVXaXRoLCB3ZSB3YW50IHRvIHNraXAgdGhlXG5cdFx0XHRcdC8vIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2cgPSBvQXBwQ29tcG9uZW50LmdldFN0YXJ0dXBNb2RlKCkgPT09IFN0YXJ0dXBNb2RlLkF1dG9DcmVhdGU7XG5cblx0XHRcdFx0b0NyZWF0aW9uID0gdHJhbnNhY3Rpb25IZWxwZXIuY3JlYXRlRG9jdW1lbnQoXG5cdFx0XHRcdFx0b0xpc3RCaW5kaW5nLFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLFxuXHRcdFx0XHRcdGZhbHNlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdC8vIFNpZGVFZmZlY3RzIG9uIENyZWF0ZVxuXHRcdFx0XHQvLyBpZiBTYXZlIGlzIHByZXNzZWQgZGlyZWN0bHkgYWZ0ZXIgZmlsbGluZyB0aGUgQ3JlYXRpb25Sb3csIG5vIFNpZGVFZmZlY3RzIHJlcXVlc3Rcblx0XHRcdFx0aWYgKCFtUGFyYW1ldGVycy5iU2tpcFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0aGFuZGxlU2lkZUVmZmVjdHMob0xpc3RCaW5kaW5nLCBvQ3JlYXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGxldCBvTmF2aWdhdGlvbjtcblx0XHRcdHN3aXRjaCAocmVzb2x2ZWRDcmVhdGlvbk1vZGUpIHtcblx0XHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuRGVmZXJyZWQ6XG5cdFx0XHRcdFx0b05hdmlnYXRpb24gPSBvUm91dGluZ0xpc3RlbmVyLm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dChvTGlzdEJpbmRpbmcsIHtcblx0XHRcdFx0XHRcdGJEZWZlcnJlZENvbnRleHQ6IHRydWUsXG5cdFx0XHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdGJGb3JjZUZvY3VzOiB0cnVlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLkFzeW5jOlxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob0xpc3RCaW5kaW5nLCB7XG5cdFx0XHRcdFx0XHRhc3luY0NvbnRleHQ6IG9DcmVhdGlvbixcblx0XHRcdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0YkZvcmNlRm9jdXM6IHRydWVcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuU3luYzpcblx0XHRcdFx0XHRtQXJncyA9IHtcblx0XHRcdFx0XHRcdGVkaXRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0YkZvcmNlRm9jdXM6IHRydWVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSB8fCBtUGFyYW1ldGVycy5jcmVhdGVBY3Rpb24pIHtcblx0XHRcdFx0XHRcdG1BcmdzLnRyYW5zaWVudCA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gb0NyZWF0aW9uPy50aGVuKGZ1bmN0aW9uIChvTmV3RG9jdW1lbnRDb250ZXh0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICghb05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjb3JlUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZVRvTWVzc2FnZVBhZ2UoXG5cdFx0XHRcdFx0XHRcdFx0Y29yZVJlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9EQVRBX1JFQ0VJVkVEX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlOiBjb3JlUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IGNvcmVSZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19FRElURkxPV19TQVBGRV9DUkVBVElPTl9GQUlMRURfREVTQ1JJUFRJT05cIilcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBJbiBjYXNlIHRoZSBTeW5jIGNyZWF0aW9uIHdhcyB0cmlnZ2VyZWQgZm9yIGEgZGVmZXJyZWQgY3JlYXRpb24sIHdlIGRvbid0IG5hdmlnYXRlIGZvcndhcmRcblx0XHRcdFx0XHRcdFx0Ly8gYXMgd2UncmUgYWxyZWFkeSBvbiB0aGUgY29ycmVzcG9uZGluZyBPYmplY3RQYWdlXG5cdFx0XHRcdFx0XHRcdHJldHVybiBtUGFyYW1ldGVycy5iRnJvbURlZmVycmVkXG5cdFx0XHRcdFx0XHRcdFx0PyBvUm91dGluZ0xpc3RlbmVyLm5hdmlnYXRlVG9Db250ZXh0KG9OZXdEb2N1bWVudENvbnRleHQsIG1BcmdzKVxuXHRcdFx0XHRcdFx0XHRcdDogb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob05ld0RvY3VtZW50Q29udGV4dCwgbUFyZ3MpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5JbmxpbmU6XG5cdFx0XHRcdFx0dGhpcy5zeW5jVGFzayhvQ3JlYXRpb24pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdzpcblx0XHRcdFx0XHQvLyB0aGUgY3JlYXRpb24gcm93IHNoYWxsIGJlIGNsZWFyZWQgb25jZSB0aGUgdmFsaWRhdGlvbiBjaGVjayB3YXMgc3VjY2Vzc2Z1bCBhbmRcblx0XHRcdFx0XHQvLyB0aGVyZWZvcmUgdGhlIFBPU1QgY2FuIGJlIHNlbnQgYXN5bmMgdG8gdGhlIGJhY2tlbmRcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0NyZWF0aW9uUm93TGlzdEJpbmRpbmcgPSBvQ3JlYXRpb25Sb3dDb250ZXh0LmdldEJpbmRpbmcoKTtcblxuXHRcdFx0XHRcdFx0Y29uc3Qgb05ld1RyYW5zaWVudENvbnRleHQgPSBvQ3JlYXRpb25Sb3dMaXN0QmluZGluZy5jcmVhdGUoKTtcblx0XHRcdFx0XHRcdG9DcmVhdGlvblJvdy5zZXRCaW5kaW5nQ29udGV4dChvTmV3VHJhbnNpZW50Q29udGV4dCk7XG5cblx0XHRcdFx0XHRcdC8vIHRoaXMgaXMgbmVlZGVkIHRvIGF2b2lkIGNvbnNvbGUgZXJyb3JzIFRPIGJlIGNoZWNrZWQgd2l0aCBtb2RlbCBjb2xsZWFndWVzXG5cdFx0XHRcdFx0XHRvTmV3VHJhbnNpZW50Q29udGV4dC5jcmVhdGVkKCkuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRMb2cudHJhY2UoXCJ0cmFuc2llbnQgZmFzdCBjcmVhdGlvbiBjb250ZXh0IGRlbGV0ZWRcIik7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gb0NyZWF0aW9uUm93Q29udGV4dC5kZWxldGUoXCIkZGlyZWN0XCIpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHQvLyBSZXNldCBidXN5IGluZGljYXRvciBhZnRlciBhIHZhbGlkYXRpb24gZXJyb3Jcblx0XHRcdFx0XHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikpKSB7XG5cdFx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiQ3JlYXRpb25Sb3cgbmF2aWdhdGlvbiBlcnJvcjogXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gUHJvbWlzZS5yZWplY3QoYFVuaGFuZGxlZCBjcmVhdGlvbk1vZGUgJHtyZXNvbHZlZENyZWF0aW9uTW9kZX1gKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9DcmVhdGlvbikge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IGFQYXJhbXMgPSBhd2FpdCBQcm9taXNlLmFsbChbb0NyZWF0aW9uLCBvTmF2aWdhdGlvbl0pO1xuXHRcdFx0XHRcdHRoaXMuX3NldFN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMoc1Byb2dyYW1taW5nTW9kZWwsIG9Nb2RlbCk7XG5cblx0XHRcdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkVkaXRhYmxlKTsgLy8gVGhlIGNyZWF0ZU1vZGUgZmxhZyB3aWxsIGJlIHNldCBpbiBjb21wdXRlRWRpdE1vZGVcblx0XHRcdFx0XHRpZiAoIW9MaXN0QmluZGluZy5pc1JlbGF0aXZlKCkgJiYgc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRcdFx0XHQvLyBXb3JrYXJvdW5kIHRvIHRlbGwgdGhlIE9QIHRoYXQgd2UndmUgY3JlYXRlZCBhIG5ldyBvYmplY3QgZnJvbSB0aGUgTFJcblx0XHRcdFx0XHRcdGNvbnN0IG1ldGFNb2RlbCA9IG9MaXN0QmluZGluZy5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRcdFx0Y29uc3QgbWV0YUNvbnRleHQgPSBtZXRhTW9kZWwuYmluZENvbnRleHQobWV0YU1vZGVsLmdldE1ldGFQYXRoKG9MaXN0QmluZGluZy5nZXRQYXRoKCkpKTtcblx0XHRcdFx0XHRcdGNvbnN0IGVudGl0eVNldCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhtZXRhQ29udGV4dCkuc3RhcnRpbmdFbnRpdHlTZXQgYXMgRW50aXR5U2V0O1xuXHRcdFx0XHRcdFx0Y29uc3QgbmV3QWN0aW9uID0gZW50aXR5U2V0Py5hbm5vdGF0aW9ucy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy5OZXdBY3Rpb247XG5cdFx0XHRcdFx0XHR0aGlzLmdldEludGVybmFsTW9kZWwoKS5zZXRQcm9wZXJ0eShcIi9sYXN0SW52b2tlZEFjdGlvblwiLCBuZXdBY3Rpb24pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBvTmV3RG9jdW1lbnRDb250ZXh0ID0gYVBhcmFtc1swXTtcblx0XHRcdFx0XHRpZiAob05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHRcdFx0dGhpcy5zZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUob0xpc3RCaW5kaW5nKTtcblx0XHRcdFx0XHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR0aGlzLl9zZW5kQWN0aXZpdHkoQWN0aXZpdHkuQ3JlYXRlLCBvTmV3RG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHRcdGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChvTW9kZWwuZ2V0TWV0YU1vZGVsKCkpICYmICFBY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIGFjY29yZGluZyB0byBVWCBpbiBjYXNlIG9mIGVuYWJsZWQgY29sbGFib3JhdGlvbiBkcmFmdCB3ZSBzaGFyZSB0aGUgb2JqZWN0IGltbWVkaWF0ZWx5XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHNoYXJlT2JqZWN0KG9OZXdEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0XHQvLyBUT0RPOiBjdXJyZW50bHksIHRoZSBvbmx5IGVycm9ycyBoYW5kbGVkIGhlcmUgYXJlIHJhaXNlZCBhcyBzdHJpbmcgLSBzaG91bGQgYmUgY2hhbmdlZCB0byBFcnJvciBvYmplY3RzXG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0ZXJyb3IgPT09IENvbnN0YW50cy5DYW5jZWxBY3Rpb25EaWFsb2cgfHxcblx0XHRcdFx0XHRcdGVycm9yID09PSBDb25zdGFudHMuQWN0aW9uRXhlY3V0aW9uRmFpbGVkIHx8XG5cdFx0XHRcdFx0XHRlcnJvciA9PT0gQ29uc3RhbnRzLkNyZWF0aW9uRmFpbGVkXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHQvLyBjcmVhdGlvbiBoYXMgYmVlbiBjYW5jZWxsZWQgYnkgdXNlciBvciBmYWlsZWQgaW4gYmFja2VuZCA9PiBpbiBjYXNlIHdlIGhhdmUgbmF2aWdhdGVkIHRvIHRyYW5zaWVudCBjb250ZXh0IGJlZm9yZSwgbmF2aWdhdGUgYmFja1xuXHRcdFx0XHRcdFx0Ly8gdGhlIHN3aXRjaC1zdGF0ZW1lbnQgYWJvdmUgc2VlbXMgdG8gaW5kaWNhdGUgdGhhdCB0aGlzIGhhcHBlbnMgaW4gY3JlYXRpb25Nb2RlcyBkZWZlcnJlZCBhbmQgYXN5bmMuIEJ1dCBpbiBmYWN0LCBpbiB0aGVzZSBjYXNlcyBhZnRlciB0aGUgbmF2aWdhdGlvbiBmcm9tIHJvdXRlTWF0Y2hlZCBpbiBPUCBjb21wb25lbnRcblx0XHRcdFx0XHRcdC8vIGNyZWF0ZURlZmVycmVkQ29udGV4dCBpcyB0cmlnZ2VyZCwgd2hpY2ggY2FsbHMgdGhpcyBtZXRob2QgKGNyZWF0ZURvY3VtZW50KSBhZ2FpbiAtIHRoaXMgdGltZSB3aXRoIGNyZWF0aW9uTW9kZSBzeW5jLiBUaGVyZWZvcmUsIGFsc28gaW4gdGhhdCBtb2RlIHdlIG5lZWQgdG8gdHJpZ2dlciBiYWNrIG5hdmlnYXRpb24uXG5cdFx0XHRcdFx0XHQvLyBUaGUgb3RoZXIgY2FzZXMgbWlnaHQgc3RpbGwgYmUgbmVlZGVkIGluIGNhc2UgdGhlIG5hdmlnYXRpb24gZmFpbHMuXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuU3luYyB8fFxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlZENyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkRlZmVycmVkIHx8XG5cdFx0XHRcdFx0XHRcdHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuQXN5bmNcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRvUm91dGluZ0xpc3RlbmVyLm5hdmlnYXRlQmFja0Zyb21UcmFuc2llbnRTdGF0ZSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoYlNob3VsZEJ1c3lMb2NrKSB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVmFsaWRhdGVzIGEgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCByZXN1bHQgb2YgdGhlIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uXG5cdCAqL1xuXG5cdHZhbGlkYXRlRG9jdW1lbnQoY29udGV4dDogQ29udGV4dCwgcGFyYW1ldGVyczogYW55KTogUHJvbWlzZTxhbnk+IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpLnZhbGlkYXRlRG9jdW1lbnQoY29udGV4dCwgcGFyYW1ldGVycywgdGhpcy5nZXRWaWV3KCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgc2V2ZXJhbCBkb2N1bWVudHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBsaXN0QmluZGluZyBUaGUgbGlzdEJpbmRpbmcgdXNlZCB0byBjcmVhdGUgdGhlIGRvY3VtZW50c1xuXHQgKiBAcGFyYW0gZGF0YUZvckNyZWF0ZSBUaGUgaW5pdGlhbCBkYXRhIGZvciB0aGUgbmV3IGRvY3VtZW50c1xuXHQgKiBAcGFyYW0gY3JlYXRlQXRFbmQgVHJ1ZSBpZiB0aGUgbmV3IGNvbnRleHRzIG5lZWQgdG8gYmUgY3JlYXRlZCBhdCB0aGUgZW5kIG9mIHRoZSBsaXN0IGJpbmRpbmdcblx0ICogQHBhcmFtIGlzRnJvbUNvcHlQYXN0ZSBUcnVlIGlmIHRoZSBjcmVhdGlvbiBoYXMgYmVlbiB0cmlnZ2VyZWQgYnkgYSBwYXN0ZSBhY3Rpb25cblx0ICogQHBhcmFtIGJlZm9yZUNyZWF0ZUNhbGxCYWNrIENhbGxiYWNrIHRvIGJlIGNhbGxlZCBiZWZvcmUgdGhlIGNyZWF0aW9uXG5cdCAqIEBwYXJhbSBjcmVhdGVBc0luYWN0aXZlIFRydWUgaWYgdGhlIGNvbnRleHRzIG5lZWQgdG8gYmUgY3JlYXRlZCBhcyBpbmFjdGl2ZVxuXHQgKiBAcGFyYW0gcmVxdWVzdFNpZGVFZmZlY3RzIFRydWUgYnkgZGVmYXVsdCwgZmFsc2UgaWYgU2lkZUVmZmVjdHMgc2hvdWxkIG5vdCBiZSByZXF1ZXN0ZWRcblx0ICogQHJldHVybnMgQSBQcm9taXNlIHdpdGggdGhlIG5ld2x5IGNyZWF0ZWQgY29udGV4dHMuXG5cdCAqL1xuXHRhc3luYyBjcmVhdGVNdWx0aXBsZURvY3VtZW50cyhcblx0XHRsaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRkYXRhRm9yQ3JlYXRlOiBhbnlbXSxcblx0XHRjcmVhdGVBdEVuZDogYm9vbGVhbixcblx0XHRpc0Zyb21Db3B5UGFzdGU6IGJvb2xlYW4sXG5cdFx0YmVmb3JlQ3JlYXRlQ2FsbEJhY2s/OiBGdW5jdGlvbixcblx0XHRjcmVhdGVBc0luYWN0aXZlID0gZmFsc2UsXG5cdFx0cmVxdWVzdFNpZGVFZmZlY3RzPzogYm9vbGVhblxuXHQpIHtcblx0XHRjb25zdCB0cmFuc2FjdGlvbkhlbHBlciA9IHRoaXMuZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKTtcblx0XHRjb25zdCBsb2NrT2JqZWN0ID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cdFx0Y29uc3QgdGFyZ2V0TGlzdEJpbmRpbmcgPSBsaXN0QmluZGluZztcblxuXHRcdHJlcXVlc3RTaWRlRWZmZWN0cyA9IHJlcXVlc3RTaWRlRWZmZWN0cyAhPT0gZmFsc2U7XG5cblx0XHRCdXN5TG9ja2VyLmxvY2sobG9ja09iamVjdCk7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5zeW5jVGFzaygpO1xuXHRcdFx0aWYgKGJlZm9yZUNyZWF0ZUNhbGxCYWNrKSB7XG5cdFx0XHRcdGF3YWl0IGJlZm9yZUNyZWF0ZUNhbGxCYWNrKHsgY29udGV4dFBhdGg6IHRhcmdldExpc3RCaW5kaW5nLmdldFBhdGgoKSB9KTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gdGFyZ2V0TGlzdEJpbmRpbmcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGxldCBtZXRhUGF0aDogc3RyaW5nO1xuXG5cdFx0XHRpZiAodGFyZ2V0TGlzdEJpbmRpbmcuZ2V0Q29udGV4dCgpKSB7XG5cdFx0XHRcdG1ldGFQYXRoID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKGAke3RhcmdldExpc3RCaW5kaW5nLmdldENvbnRleHQoKS5nZXRQYXRoKCl9LyR7dGFyZ2V0TGlzdEJpbmRpbmcuZ2V0UGF0aCgpfWApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bWV0YVBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgodGFyZ2V0TGlzdEJpbmRpbmcuZ2V0UGF0aCgpKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5oYW5kbGVDcmVhdGVFdmVudHModGFyZ2V0TGlzdEJpbmRpbmcpO1xuXG5cdFx0XHQvLyBJdGVyYXRlIG9uIGFsbCBpdGVtcyBhbmQgc3RvcmUgdGhlIGNvcnJlc3BvbmRpbmcgY3JlYXRpb24gcHJvbWlzZVxuXHRcdFx0Y29uc3QgY3JlYXRpb25Qcm9taXNlcyA9IGRhdGFGb3JDcmVhdGUubWFwKChwcm9wZXJ0eVZhbHVlcykgPT4ge1xuXHRcdFx0XHRjb25zdCBjcmVhdGVQYXJhbWV0ZXJzOiBhbnkgPSB7IGRhdGE6IHt9IH07XG5cblx0XHRcdFx0Y3JlYXRlUGFyYW1ldGVycy5rZWVwVHJhbnNpZW50Q29udGV4dE9uRmFpbGVkID0gZmFsc2U7IC8vIGN1cnJlbnRseSBub3QgZnVsbHkgc3VwcG9ydGVkXG5cdFx0XHRcdGNyZWF0ZVBhcmFtZXRlcnMuYnVzeU1vZGUgPSBcIk5vbmVcIjtcblx0XHRcdFx0Y3JlYXRlUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgPSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3c7XG5cdFx0XHRcdGNyZWF0ZVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCA9IHRoaXMuZ2V0VmlldygpO1xuXHRcdFx0XHRjcmVhdGVQYXJhbWV0ZXJzLmNyZWF0ZUF0RW5kID0gY3JlYXRlQXRFbmQ7XG5cdFx0XHRcdGNyZWF0ZVBhcmFtZXRlcnMuaW5hY3RpdmUgPSBjcmVhdGVBc0luYWN0aXZlO1xuXG5cdFx0XHRcdC8vIFJlbW92ZSBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgYXMgd2UgZG9uJ3Qgc3VwcG9ydCBkZWVwIGNyZWF0ZVxuXHRcdFx0XHRmb3IgKGNvbnN0IHByb3BlcnR5UGF0aCBpbiBwcm9wZXJ0eVZhbHVlcykge1xuXHRcdFx0XHRcdGNvbnN0IHByb3BlcnR5ID0gbWV0YU1vZGVsLmdldE9iamVjdChgJHttZXRhUGF0aH0vJHtwcm9wZXJ0eVBhdGh9YCk7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0cHJvcGVydHkgJiZcblx0XHRcdFx0XHRcdHByb3BlcnR5LiRraW5kICE9PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eVBhdGguaW5kZXhPZihcIi9cIikgPCAwICYmXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlc1twcm9wZXJ0eVBhdGhdXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRjcmVhdGVQYXJhbWV0ZXJzLmRhdGFbcHJvcGVydHlQYXRoXSA9IHByb3BlcnR5VmFsdWVzW3Byb3BlcnR5UGF0aF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHRyYW5zYWN0aW9uSGVscGVyLmNyZWF0ZURvY3VtZW50KFxuXHRcdFx0XHRcdHRhcmdldExpc3RCaW5kaW5nLFxuXHRcdFx0XHRcdGNyZWF0ZVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKSxcblx0XHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCksXG5cdFx0XHRcdFx0aXNGcm9tQ29weVBhc3RlXG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0Y29uc3QgY3JlYXRlZENvbnRleHRzID0gYXdhaXQgUHJvbWlzZS5hbGwoY3JlYXRpb25Qcm9taXNlcyk7XG5cdFx0XHRpZiAoIWNyZWF0ZUFzSW5hY3RpdmUpIHtcblx0XHRcdFx0dGhpcy5zZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUodGFyZ2V0TGlzdEJpbmRpbmcpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gdHJhbnNpZW50IGNvbnRleHRzIGFyZSByZWxpYWJseSByZW1vdmVkIG9uY2Ugb05ld0NvbnRleHQuY3JlYXRlZCgpIGlzIHJlc29sdmVkXG5cdFx0XHRhd2FpdCBQcm9taXNlLmFsbChcblx0XHRcdFx0Y3JlYXRlZENvbnRleHRzLm1hcCgobmV3Q29udGV4dDogYW55KSA9PiB7XG5cdFx0XHRcdFx0aWYgKCFuZXdDb250ZXh0LmJJbmFjdGl2ZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG5ld0NvbnRleHQuY3JlYXRlZCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cblx0XHRcdGNvbnN0IHZpZXdCaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cblx0XHRcdC8vIGlmIHRoZXJlIGFyZSB0cmFuc2llbnQgY29udGV4dHMsIHdlIG11c3QgYXZvaWQgcmVxdWVzdGluZyBzaWRlIGVmZmVjdHNcblx0XHRcdC8vIHRoaXMgaXMgYXZvaWQgYSBwb3RlbnRpYWwgbGlzdCByZWZyZXNoLCB0aGVyZSBjb3VsZCBiZSBhIHNpZGUgZWZmZWN0IHRoYXQgcmVmcmVzaGVzIHRoZSBsaXN0IGJpbmRpbmdcblx0XHRcdC8vIGlmIGxpc3QgYmluZGluZyBpcyByZWZyZXNoZWQsIHRyYW5zaWVudCBjb250ZXh0cyBtaWdodCBiZSBsb3N0XG5cdFx0XHRpZiAocmVxdWVzdFNpZGVFZmZlY3RzICYmICFDb21tb25VdGlscy5oYXNUcmFuc2llbnRDb250ZXh0KHRhcmdldExpc3RCaW5kaW5nKSkge1xuXHRcdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpXG5cdFx0XHRcdFx0LmdldFNpZGVFZmZlY3RzU2VydmljZSgpXG5cdFx0XHRcdFx0LnJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eSh0YXJnZXRMaXN0QmluZGluZy5nZXRQYXRoKCksIHZpZXdCaW5kaW5nQ29udGV4dCBhcyBDb250ZXh0KTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGNyZWF0ZWRDb250ZXh0cztcblx0XHR9IGNhdGNoIChlcnI6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgY3JlYXRpbmcgbXVsdGlwbGUgZG9jdW1lbnRzLlwiKTtcblx0XHRcdHRocm93IGVycjtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0QnVzeUxvY2tlci51bmxvY2sobG9ja09iamVjdCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnU2F2ZScgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ1NhdmUnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdTYXZlJyBhY3Rpb24gaXMgc3RvcHBlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZVNhdmVcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIHNhdmVkLlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdG8gYmUgcmV0dXJuZWQgYnkgdGhlIG92ZXJyaWRkZW4gbWV0aG9kLiBJZiByZXNvbHZlZCwgdGhlICdTYXZlJyBhY3Rpb24gaXMgdHJpZ2dlcmVkLiBJZiByZWplY3RlZCwgdGhlICdTYXZlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I29uQmVmb3JlU2F2ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25CZWZvcmVTYXZlKF9tUGFyYW1ldGVycz86IHsgY29udGV4dD86IENvbnRleHQgfSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byBpbnRlcmNlcHQgdGhlICdDcmVhdGUnIGFjdGlvbi4gWW91IGNhbiBleGVjdXRlIGN1c3RvbSBjb2RpbmcgaW4gdGhpcyBmdW5jdGlvbi5cblx0ICogVGhlIGZyYW1ld29yayB3YWl0cyBmb3IgdGhlIHJldHVybmVkIHByb21pc2UgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIGNvbnRpbnVpbmcgdGhlICdDcmVhdGUnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdDcmVhdGUnIGFjdGlvbiBpcyBzdG9wcGVkLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZUNyZWF0ZVxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzLmNvbnRleHRQYXRoIFBhdGggcG9pbnRpbmcgdG8gdGhlIGNvbnRleHQgb24gd2hpY2ggQ3JlYXRlIGFjdGlvbiBpcyB0cmlnZ2VyZWRcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jcmVhdGVQYXJhbWV0ZXJzIEFycmF5IG9mIHZhbHVlcyB0aGF0IGFyZSBmaWxsZWQgaW4gdGhlIEFjdGlvbiBQYXJhbWV0ZXIgRGlhbG9nXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0byBiZSByZXR1cm5lZCBieSB0aGUgb3ZlcnJpZGRlbiBtZXRob2QuIElmIHJlc29sdmVkLCB0aGUgJ0NyZWF0ZScgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnQ3JlYXRlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZC5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZUNyZWF0ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjk4LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25CZWZvcmVDcmVhdGUoX21QYXJhbWV0ZXJzPzogeyBjb250ZXh0UGF0aD86IHN0cmluZzsgY3JlYXRlUGFyYW1ldGVycz86IGFueVtdIH0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnRWRpdCcgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ0VkaXQnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdFZGl0JyBhY3Rpb24gaXMgc3RvcHBlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZGlzcGxheSBtb2RlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZUVkaXRcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIGVkaXRlZC5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRvIGJlIHJldHVybmVkIGJ5IHRoZSBvdmVycmlkZGVuIG1ldGhvZC4gSWYgcmVzb2x2ZWQsIHRoZSAnRWRpdCcgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRWRpdCcgYWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQgYW5kIHRoZSB1c2VyIHN0YXlzIGluIGRpc3BsYXkgbW9kZS5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZUVkaXRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45OC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQmVmb3JlRWRpdChfbVBhcmFtZXRlcnM/OiB7IGNvbnRleHQ/OiBDb250ZXh0IH0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnRGlzY2FyZCcgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ0Rpc2NhcmQnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdEaXNjYXJkJyBhY3Rpb24gaXMgc3RvcHBlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gX21QYXJhbWV0ZXJzIE9iamVjdCBjb250YWluaW5nIHRoZSBwYXJhbWV0ZXJzIHBhc3NlZCB0byBvbkJlZm9yZURpc2NhcmRcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIGRpc2NhcmRlZC5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRvIGJlIHJldHVybmVkIGJ5IHRoZSBvdmVycmlkZGVuIG1ldGhvZC4gSWYgcmVzb2x2ZWQsIHRoZSAnRGlzY2FyZCcgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRGlzY2FyZCcgYWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQgYW5kIHRoZSB1c2VyIHN0YXlzIGluIGVkaXQgbW9kZS5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZURpc2NhcmRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45OC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uQmVmb3JlRGlzY2FyZChfbVBhcmFtZXRlcnM/OiB7IGNvbnRleHQ/OiBDb250ZXh0IH0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gY2FuIGJlIHVzZWQgdG8gaW50ZXJjZXB0IHRoZSAnRGVsZXRlJyBhY3Rpb24uIFlvdSBjYW4gZXhlY3V0ZSBjdXN0b20gY29kaW5nIGluIHRoaXMgZnVuY3Rpb24uXG5cdCAqIFRoZSBmcmFtZXdvcmsgd2FpdHMgZm9yIHRoZSByZXR1cm5lZCBwcm9taXNlIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nIHRoZSAnRGVsZXRlJyBhY3Rpb24uXG5cdCAqIElmIHlvdSByZWplY3QgdGhlIHByb21pc2UsIHRoZSAnRGVsZXRlJyBhY3Rpb24gaXMgc3RvcHBlZC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycyBPYmplY3QgY29udGFpbmluZyB0aGUgcGFyYW1ldGVycyBwYXNzZWQgdG8gb25CZWZvcmVEZWxldGVcblx0ICogQHBhcmFtIF9tUGFyYW1ldGVycy5jb250ZXh0cyBBbiBhcnJheSBvZiBjb250ZXh0cyB0aGF0IGFyZSBnb2luZyB0byBiZSBkZWxldGVkXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0byBiZSByZXR1cm5lZCBieSB0aGUgb3ZlcnJpZGRlbiBtZXRob2QuIElmIHJlc29sdmVkLCB0aGUgJ0RlbGV0ZScgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRGVsZXRlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZC5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZURlbGV0ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjk4LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25CZWZvcmVEZWxldGUoX21QYXJhbWV0ZXJzPzogeyBjb250ZXh0cz86IENvbnRleHRbXSB9KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXG5cdC8vIEludGVybmFsIG9ubHkgcGFyYW1zIC0tLVxuXHQvLyBAcGFyYW0ge2Jvb2xlYW59IG1QYXJhbWV0ZXJzLmJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIEluZGljYXRlcyB3aGV0aGVyIFNpZGVFZmZlY3RzIG5lZWQgdG8gYmUgaWdub3JlZCB3aGVuIHVzZXIgY2xpY2tzIG9uIFNhdmUgZHVyaW5nIGFuIElubGluZSBjcmVhdGlvblxuXHQvLyBAcGFyYW0ge29iamVjdH0gbVBhcmFtZXRlcnMuYmluZGluZ3MgTGlzdCBiaW5kaW5ncyBvZiB0aGUgdGFibGVzIGluIHRoZSB2aWV3LlxuXHQvLyBCb3RoIG9mIHRoZSBhYm92ZSBwYXJhbWV0ZXJzIGFyZSBmb3IgdGhlIHNhbWUgcHVycG9zZS4gVXNlciBjYW4gZW50ZXIgc29tZSBpbmZvcm1hdGlvbiBpbiB0aGUgY3JlYXRpb24gcm93KHMpIGJ1dCBkb2VzIG5vdCAnQWRkIHJvdycsIGluc3RlYWQgY2xpY2tzIFNhdmUuXG5cdC8vIFRoZXJlIGNhbiBiZSBtb3JlIHRoYW4gb25lIGluIHRoZSB2aWV3LlxuXG5cdC8qKlxuXHQgKiBTYXZlcyBhIG5ldyBkb2N1bWVudCBhZnRlciBjaGVja2luZyBpdC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQ29udGV4dCAgQ29udGV4dCBvZiB0aGUgZWRpdGFibGUgZG9jdW1lbnRcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIFBSSVZBVEVcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIHNhdmUgaXMgY29tcGxldGVcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I3NhdmVEb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBzYXZlRG9jdW1lbnQob0NvbnRleHQ6IENvbnRleHQsIG1QYXJhbWV0ZXJzOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdGNvbnN0IGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yID0gbVBhcmFtZXRlcnMuYkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IgfHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGJEcmFmdE5hdmlnYXRpb24gPSB0cnVlO1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IGFCaW5kaW5ncyA9IG1QYXJhbWV0ZXJzLmJpbmRpbmdzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuc3luY1Rhc2soKTtcblx0XHRcdC8vIGluIGNhc2Ugb2Ygc2F2aW5nIC8gYWN0aXZhdGluZyB0aGUgYm91bmQgdHJhbnNpdGlvbiBtZXNzYWdlcyBzaGFsbCBiZSByZW1vdmVkIGJlZm9yZSB0aGUgUEFUQ0gvUE9TVFxuXHRcdFx0Ly8gaXMgc2VudCB0byB0aGUgYmFja2VuZFxuXHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0YXdhaXQgdGhpcy5fc3VibWl0T3BlbkNoYW5nZXMob0NvbnRleHQpO1xuXHRcdFx0YXdhaXQgdGhpcy5fY2hlY2tGb3JWYWxpZGF0aW9uRXJyb3JzKCk7XG5cdFx0XHRhd2FpdCB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVTYXZlKHsgY29udGV4dDogb0NvbnRleHQgfSk7XG5cblx0XHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblx0XHRcdGNvbnN0IG9Sb290Vmlld0NvbnRyb2xsZXIgPSB0aGlzLl9nZXRSb290Vmlld0NvbnRyb2xsZXIoKSBhcyBhbnk7XG5cdFx0XHRsZXQgc2libGluZ0luZm86IFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRcdGlmIChcblx0XHRcdFx0KHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSB8fCBvQ29udGV4dC5nZXRQcm9wZXJ0eShcIkhhc0FjdGl2ZUVudGl0eVwiKSkgJiZcblx0XHRcdFx0b1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIE5vIG5lZWQgdG8gdHJ5IHRvIGdldCByaWdodG1vc3QgY29udGV4dCBpbiBjYXNlIG9mIGEgbmV3IG9iamVjdFxuXHRcdFx0XHRzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24oXG5cdFx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdFx0b1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0KCksXG5cdFx0XHRcdFx0c1Byb2dyYW1taW5nTW9kZWwsXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBhY3RpdmVEb2N1bWVudENvbnRleHQgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5zYXZlRG9jdW1lbnQoXG5cdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLFxuXHRcdFx0XHR0aGlzLl9nZXRSZXNvdXJjZU1vZGVsKCksXG5cdFx0XHRcdGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yLFxuXHRcdFx0XHRhQmluZGluZ3MsXG5cdFx0XHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKSxcblx0XHRcdFx0dGhpcy5nZXRDcmVhdGlvbk1vZGUoKVxuXHRcdFx0KTtcblx0XHRcdHRoaXMuX3JlbW92ZVN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMoc1Byb2dyYW1taW5nTW9kZWwpO1xuXG5cdFx0XHR0aGlzLl9zZW5kQWN0aXZpdHkoQWN0aXZpdHkuQWN0aXZhdGUsIGFjdGl2ZURvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRBY3Rpdml0eVN5bmMuZGlzY29ubmVjdCh0aGlzLmdldFZpZXcoKSk7XG5cblx0XHRcdHRoaXMuX3RyaWdnZXJDb25maWd1cmVkU3VydmV5KFN0YW5kYXJkQWN0aW9ucy5zYXZlLCBUcmlnZ2VyVHlwZS5zdGFuZGFyZEFjdGlvbik7XG5cblx0XHRcdHRoaXMuc2V0RG9jdW1lbnRNb2RpZmllZChmYWxzZSk7XG5cdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkRpc3BsYXksIGZhbHNlKTtcblx0XHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZygpO1xuXG5cdFx0XHRpZiAoYWN0aXZlRG9jdW1lbnRDb250ZXh0ICE9PSBvQ29udGV4dCkge1xuXHRcdFx0XHRsZXQgY29udGV4dFRvTmF2aWdhdGUgPSBhY3RpdmVEb2N1bWVudENvbnRleHQ7XG5cdFx0XHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0c2libGluZ0luZm8gPSBzaWJsaW5nSW5mbyA/PyB0aGlzLl9jcmVhdGVTaWJsaW5nSW5mbyhvQ29udGV4dCwgYWN0aXZlRG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVQYXRoc0luSGlzdG9yeShzaWJsaW5nSW5mby5wYXRoTWFwcGluZyk7XG5cdFx0XHRcdFx0aWYgKHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQuZ2V0UGF0aCgpICE9PSBhY3RpdmVEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0VG9OYXZpZ2F0ZSA9IHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXdhaXQgdGhpcy5faGFuZGxlTmV3Q29udGV4dChjb250ZXh0VG9OYXZpZ2F0ZSwgZmFsc2UsIGZhbHNlLCBiRHJhZnROYXZpZ2F0aW9uLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0aWYgKCEob0Vycm9yICYmIG9FcnJvci5jYW5jZWxlZCkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgc2F2aW5nIHRoZSBkb2N1bWVudFwiLCBvRXJyb3IpO1xuXHRcdFx0fVxuXHRcdFx0dGhyb3cgb0Vycm9yO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTd2l0Y2hlcyB0aGUgVUkgYmV0d2VlbiBkcmFmdCBhbmQgYWN0aXZlIGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgdG8gc3dpdGNoIGZyb21cblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlZCBvbmNlIHRoZSBzd2l0Y2ggaXMgZG9uZVxuXHQgKi9cblx0YXN5bmMgdG9nZ2xlRHJhZnRBY3RpdmUob0NvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvQ29udGV4dERhdGEgPSBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRsZXQgYkVkaXRhYmxlOiBib29sZWFuO1xuXHRcdGNvbnN0IGJJc0RyYWZ0ID0gb0NvbnRleHQgJiYgdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KSA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdDtcblxuXHRcdC8vdG9nZ2xlIGJldHdlZW4gZHJhZnQgYW5kIGFjdGl2ZSBkb2N1bWVudCBpcyBvbmx5IGF2YWlsYWJsZSBmb3IgZWRpdCBkcmFmdHMgYW5kIGFjdGl2ZSBkb2N1bWVudHMgd2l0aCBkcmFmdClcblx0XHRpZiAoXG5cdFx0XHQhYklzRHJhZnQgfHxcblx0XHRcdCEoXG5cdFx0XHRcdCghb0NvbnRleHREYXRhLklzQWN0aXZlRW50aXR5ICYmIG9Db250ZXh0RGF0YS5IYXNBY3RpdmVFbnRpdHkpIHx8XG5cdFx0XHRcdChvQ29udGV4dERhdGEuSXNBY3RpdmVFbnRpdHkgJiYgb0NvbnRleHREYXRhLkhhc0RyYWZ0RW50aXR5KVxuXHRcdFx0KVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICghb0NvbnRleHREYXRhLklzQWN0aXZlRW50aXR5ICYmIG9Db250ZXh0RGF0YS5IYXNBY3RpdmVFbnRpdHkpIHtcblx0XHRcdC8vc3RhcnQgUG9pbnQ6IGVkaXQgZHJhZnRcblx0XHRcdGJFZGl0YWJsZSA9IGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBzdGFydCBwb2ludCBhY3RpdmUgZG9jdW1lbnRcblx0XHRcdGJFZGl0YWJsZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG9Sb290Vmlld0NvbnRyb2xsZXIgPSB0aGlzLl9nZXRSb290Vmlld0NvbnRyb2xsZXIoKSBhcyBhbnk7XG5cdFx0XHRjb25zdCBvUmlnaHRtb3N0Q29udGV4dCA9IG9Sb290Vmlld0NvbnRyb2xsZXIuaXNGY2xFbmFibGVkKCkgPyBvUm9vdFZpZXdDb250cm9sbGVyLmdldFJpZ2h0bW9zdENvbnRleHQoKSA6IG9Db250ZXh0O1xuXHRcdFx0bGV0IHNpYmxpbmdJbmZvID0gYXdhaXQgdGhpcy5fY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihvQ29udGV4dCwgb1JpZ2h0bW9zdENvbnRleHQsIFByb2dyYW1taW5nTW9kZWwuRHJhZnQsIGZhbHNlKTtcblx0XHRcdGlmICghc2libGluZ0luZm8gJiYgb0NvbnRleHQgIT09IG9SaWdodG1vc3RDb250ZXh0KSB7XG5cdFx0XHRcdC8vIFRyeSB0byBjb21wdXRlIHNpYmxpbmcgaW5mbyBmb3IgdGhlIHJvb3QgY29udGV4dCBpZiBpdCBmYWlscyBmb3IgdGhlIHJpZ2h0bW9zdCBjb250ZXh0XG5cdFx0XHRcdC8vIC0tPiBJbiBjYXNlIG9mIEZDTCwgaWYgd2UgdHJ5IHRvIHN3aXRjaCBiZXR3ZWVuIGRyYWZ0IGFuZCBhY3RpdmUgYnV0IGEgY2hpbGQgZW50aXR5IGhhcyBubyBzaWJsaW5nLCB0aGUgc3dpdGNoIHdpbGwgY2xvc2UgdGhlIGNoaWxkIGNvbHVtblxuXHRcdFx0XHRzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24ob0NvbnRleHQsIG9Db250ZXh0LCBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0LCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc2libGluZ0luZm8pIHtcblx0XHRcdFx0dGhpcy5zZXRFZGl0TW9kZShiRWRpdGFibGUgPyBFZGl0TW9kZS5FZGl0YWJsZSA6IEVkaXRNb2RlLkRpc3BsYXksIGZhbHNlKTsgLy9zd2l0Y2ggdG8gZWRpdCBtb2RlIG9ubHkgaWYgYSBkcmFmdCBpcyBhdmFpbGFibGVcblxuXHRcdFx0XHRpZiAob1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdGNvbnN0IGxhc3RTZW1hbnRpY01hcHBpbmcgPSB0aGlzLl9nZXRTZW1hbnRpY01hcHBpbmcoKTtcblx0XHRcdFx0XHRpZiAobGFzdFNlbWFudGljTWFwcGluZz8udGVjaG5pY2FsUGF0aCA9PT0gb0NvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRQYXRoID0gc2libGluZ0luZm8ucGF0aE1hcHBpbmdbc2libGluZ0luZm8ucGF0aE1hcHBpbmcubGVuZ3RoIC0gMV0ubmV3UGF0aDtcblx0XHRcdFx0XHRcdHNpYmxpbmdJbmZvLnBhdGhNYXBwaW5nLnB1c2goeyBvbGRQYXRoOiBsYXN0U2VtYW50aWNNYXBwaW5nLnNlbWFudGljUGF0aCwgbmV3UGF0aDogdGFyZ2V0UGF0aCB9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXdhaXQgdGhpcy5faGFuZGxlTmV3Q29udGV4dChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0LCBiRWRpdGFibGUsIHRydWUsIHRydWUsIHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgaW4gRWRpdEZsb3cudG9nZ2xlRHJhZnRBY3RpdmUgLSBDYW5ub3QgZmluZCBzaWJsaW5nXCIpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKG9FcnJvcikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBFcnJvciBpbiBFZGl0Rmxvdy50b2dnbGVEcmFmdEFjdGl2ZToke29FcnJvcn1gKTtcblx0XHR9XG5cdH1cblxuXHQvLyBJbnRlcm5hbCBvbmx5IHBhcmFtcyAtLS1cblx0Ly8gQHBhcmFtIHtzYXAubS5CdXR0b259IG1QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbiAtIEN1cnJlbnRseSB0aGlzIGlzIHBhc3NlZCBhcyBjYW5jZWxCdXR0b24gaW50ZXJuYWxseSAocmVwbGFjZWQgYnkgbVBhcmFtZXRlcnMuY29udHJvbCBpbiB0aGUgSlNEb2MgYmVsb3cpLiBDdXJyZW50bHkgaXQgaXMgYWxzbyBtYW5kYXRvcnkuXG5cdC8vIFBsYW4gLSBUaGlzIHNob3VsZCBub3QgYmUgbWFuZGF0b3J5LiBJZiBub3QgcHJvdmlkZWQsIHdlIHNob3VsZCBoYXZlIGEgZGVmYXVsdCB0aGF0IGNhbiBhY3QgYXMgcmVmZXJlbmNlIGNvbnRyb2wgZm9yIHRoZSBkaXNjYXJkIHBvcG92ZXIgT1Igd2UgY2FuIHNob3cgYSBkaWFsb2cgaW5zdGVhZCBvZiBhIHBvcG92ZXIuXG5cblx0LyoqXG5cdCAqIERpc2NhcmQgdGhlIGVkaXRhYmxlIGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIG9Db250ZXh0ICBDb250ZXh0IG9mIHRoZSBlZGl0YWJsZSBkb2N1bWVudFxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgQ2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMuY29udHJvbCBUaGlzIGlzIHRoZSBjb250cm9sIHVzZWQgdG8gb3BlbiB0aGUgZGlzY2FyZCBwb3BvdmVyXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5za2lwRGlzY2FyZFBvcG92ZXIgT3B0aW9uYWwsIHN1cHJlc3NlcyB0aGUgZGlzY2FyZCBwb3BvdmVyIGFuZCBhbGxvd3MgY3VzdG9tIGhhbmRsaW5nXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSBlZGl0YWJsZSBkb2N1bWVudCBoYXMgYmVlbiBkaXNjYXJkZWRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I2NhbmNlbERvY3VtZW50XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGNhbmNlbERvY3VtZW50KG9Db250ZXh0OiBDb250ZXh0LCBtUGFyYW1ldGVyczogeyBjb250cm9sPzogb2JqZWN0OyBza2lwRGlzY2FyZFBvcG92ZXI/OiBib29sZWFuIH0pOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IG1JblBhcmFtZXRlcnM6IGFueSA9IG1QYXJhbWV0ZXJzO1xuXHRcdGxldCBzaWJsaW5nSW5mbzogU2libGluZ0luZm9ybWF0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdGxldCBpc05ld0RvY3VtZW50ID0gZmFsc2U7XG5cdFx0bUluUGFyYW1ldGVycy5jYW5jZWxCdXR0b24gPSBtUGFyYW1ldGVycy5jb250cm9sIHx8IG1JblBhcmFtZXRlcnMuY2FuY2VsQnV0dG9uO1xuXHRcdG1JblBhcmFtZXRlcnMuYmVmb3JlQ2FuY2VsQ2FsbEJhY2sgPSB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVEaXNjYXJkO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuc3luY1Rhc2soKTtcblx0XHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblx0XHRcdGlmICgoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5IHx8IG9Db250ZXh0LmdldFByb3BlcnR5KFwiSGFzQWN0aXZlRW50aXR5XCIpKSAmJiB0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRjb25zdCBvUm9vdFZpZXdDb250cm9sbGVyID0gdGhpcy5fZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXG5cdFx0XHRcdC8vIE5vIG5lZWQgdG8gdHJ5IHRvIGdldCByaWdodG1vc3QgY29udGV4dCBpbiBjYXNlIG9mIGEgbmV3IG9iamVjdFxuXHRcdFx0XHRzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24oXG5cdFx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdFx0b1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0KCksXG5cdFx0XHRcdFx0c1Byb2dyYW1taW5nTW9kZWwsXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBjYW5jZWxSZXN1bHQgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5jYW5jZWxEb2N1bWVudChcblx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdG1JblBhcmFtZXRlcnMsXG5cdFx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRcdHRoaXMuX2dldFJlc291cmNlTW9kZWwoKSxcblx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLFxuXHRcdFx0XHR0aGlzLmdldENyZWF0aW9uTW9kZSgpLFxuXHRcdFx0XHR0aGlzLmlzRG9jdW1lbnRNb2RpZmllZCgpXG5cdFx0XHQpO1xuXHRcdFx0dGhpcy5fZ2V0Um9vdFZpZXdDb250cm9sbGVyKClcblx0XHRcdFx0LmdldEluc3RhbmNlZFZpZXdzKClcblx0XHRcdFx0LmZvckVhY2goKHZpZXcpID0+IHtcblx0XHRcdFx0XHRjb25zdCBjb250ZXh0ID0gdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIE9EYXRhVjRDb250ZXh0O1xuXHRcdFx0XHRcdGlmIChjb250ZXh0ICYmIGNvbnRleHQuaXNLZWVwQWxpdmUoKSkge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5zZXRLZWVwQWxpdmUoZmFsc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRjb25zdCBiRHJhZnROYXZpZ2F0aW9uID0gdHJ1ZTtcblx0XHRcdHRoaXMuX3JlbW92ZVN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMoc1Byb2dyYW1taW5nTW9kZWwpO1xuXG5cdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkRpc3BsYXksIGZhbHNlKTtcblx0XHRcdHRoaXMuc2V0RG9jdW1lbnRNb2RpZmllZChmYWxzZSk7XG5cdFx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLkNsZWFyKTtcblx0XHRcdC8vIHdlIGZvcmNlIHRoZSBlZGl0IHN0YXRlIGV2ZW4gZm9yIEZDTCBiZWNhdXNlIHRoZSBkcmFmdCBkaXNjYXJkIG1pZ2h0IG5vdCBiZSBpbXBsZW1lbnRlZFxuXHRcdFx0Ly8gYW5kIHdlIG1heSBqdXN0IGRlbGV0ZSB0aGUgZHJhZnRcblx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0aWYgKCFjYW5jZWxSZXN1bHQpIHtcblx0XHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkRpc2NhcmQsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdEFjdGl2aXR5U3luYy5kaXNjb25uZWN0KHRoaXMuZ2V0VmlldygpKTtcblx0XHRcdFx0Ly9pbiBjYXNlIG9mIGEgbmV3IGRvY3VtZW50LCBubyBhY3RpdmVDb250ZXh0IGlzIHJldHVybmVkIC0tPiBuYXZpZ2F0ZSBiYWNrLlxuXHRcdFx0XHRpZiAoIW1JblBhcmFtZXRlcnMuc2tpcEJhY2tOYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5nZXRJbnRlcm5hbFJvdXRpbmcoKS5uYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dChvQ29udGV4dCk7XG5cdFx0XHRcdFx0aXNOZXdEb2N1bWVudCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG9BY3RpdmVEb2N1bWVudENvbnRleHQgPSBjYW5jZWxSZXN1bHQgYXMgQ29udGV4dDtcblx0XHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkRpc2NhcmQsIG9BY3RpdmVEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRBY3Rpdml0eVN5bmMuZGlzY29ubmVjdCh0aGlzLmdldFZpZXcoKSk7XG5cdFx0XHRcdGxldCBjb250ZXh0VG9OYXZpZ2F0ZSA9IG9BY3RpdmVEb2N1bWVudENvbnRleHQ7XG5cdFx0XHRcdGlmICh0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdHNpYmxpbmdJbmZvID0gc2libGluZ0luZm8gPz8gdGhpcy5fY3JlYXRlU2libGluZ0luZm8ob0NvbnRleHQsIG9BY3RpdmVEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdHRoaXMuX3VwZGF0ZVBhdGhzSW5IaXN0b3J5KHNpYmxpbmdJbmZvLnBhdGhNYXBwaW5nKTtcblx0XHRcdFx0XHRpZiAoc2libGluZ0luZm8udGFyZ2V0Q29udGV4dC5nZXRQYXRoKCkgIT09IG9BY3RpdmVEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0VG9OYXZpZ2F0ZSA9IHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHRcdFx0Ly8gV2UgbmVlZCB0byBsb2FkIHRoZSBzZW1hbnRpYyBrZXlzIG9mIHRoZSBhY3RpdmUgY29udGV4dCwgYXMgd2UgbmVlZCB0aGVtXG5cdFx0XHRcdFx0Ly8gZm9yIHRoZSBuYXZpZ2F0aW9uXG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5fZmV0Y2hTZW1hbnRpY0tleVZhbHVlcyhvQWN0aXZlRG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHQvLyBXZSBmb3JjZSB0aGUgcmVjcmVhdGlvbiBvZiB0aGUgY29udGV4dCwgc28gdGhhdCBpdCdzIGNyZWF0ZWQgYW5kIGJvdW5kIGluIHRoZSBzYW1lIG1pY3JvdGFzayxcblx0XHRcdFx0XHQvLyBzbyB0aGF0IGFsbCBwcm9wZXJ0aWVzIGFyZSBsb2FkZWQgdG9nZXRoZXIgYnkgYXV0b0V4cGFuZFNlbGVjdCwgc28gdGhhdCB3aGVuIHN3aXRjaGluZyBiYWNrIHRvIEVkaXQgbW9kZVxuXHRcdFx0XHRcdC8vICQkaW5oZXJpdEV4cGFuZFNlbGVjdCB0YWtlcyBhbGwgbG9hZGVkIHByb3BlcnRpZXMgaW50byBhY2NvdW50IChCQ1AgMjA3MDQ2MjI2NSlcblx0XHRcdFx0XHRpZiAoIW1JblBhcmFtZXRlcnMuc2tpcEJpbmRpbmdUb1ZpZXcpIHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoY29udGV4dFRvTmF2aWdhdGUsIGZhbHNlLCB0cnVlLCBiRHJhZnROYXZpZ2F0aW9uLCB0cnVlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9BY3RpdmVEb2N1bWVudENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vYWN0aXZlIGNvbnRleHQgaXMgcmV0dXJuZWQgaW4gY2FzZSBvZiBjYW5jZWwgb2YgZXhpc3RpbmcgZG9jdW1lbnRcblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVOZXdDb250ZXh0KGNvbnRleHRUb05hdmlnYXRlLCBmYWxzZSwgZmFsc2UsIGJEcmFmdE5hdmlnYXRpb24sIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQpIHtcblx0XHRcdFx0Ly9zaG93IERyYWZ0IGRpc2NhcmRlZCBtZXNzYWdlIHRvYXN0IG9ubHkgZm9yIGRyYWZ0IGVuYWJsZWQgYXBwc1xuXHRcdFx0XHR0aGlzLnNob3dEb2N1bWVudERpc2NhcmRNZXNzYWdlKGlzTmV3RG9jdW1lbnQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKG9FcnJvcikge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZGlzY2FyZGluZyB0aGUgZG9jdW1lbnRcIiwgb0Vycm9yIGFzIGFueSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEJyaW5ncyB1cCBhIG1lc3NhZ2UgdG9hc3Qgd2hlbiBhIGRyYWZ0IGlzIGRpc2NhcmRlZC5cblx0ICpcblx0ICogQHBhcmFtIGlzTmV3RG9jdW1lbnQgVGhpcyBpcyBhIEJvb2xlYW4gZmxhZyB0aGF0IGRldGVybWluZXMgd2hldGhlciB0aGUgZG9jdW1lbnQgaXMgbmV3IG9yIGFscmVhZHkgZXhpc3RzLlxuXHQgKi9cblx0c2hvd0RvY3VtZW50RGlzY2FyZE1lc3NhZ2UoaXNOZXdEb2N1bWVudD86IGJvb2xlYW4pIHtcblx0XHRjb25zdCByZXNvdXJjZU1vZGVsID0gdGhpcy5fZ2V0UmVzb3VyY2VNb2RlbCgpO1xuXHRcdGNvbnN0IG1lc3NhZ2UgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9ESVNDQVJEX0RSQUZUX1RPQVNUXCIpO1xuXHRcdGlmIChpc05ld0RvY3VtZW50ID09IHRydWUpIHtcblx0XHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0XHRhcHBDb21wb25lbnQuZ2V0Um91dGluZ1NlcnZpY2UoKS5hdHRhY2hBZnRlclJvdXRlTWF0Y2hlZCh0aGlzLnNob3dNZXNzYWdlV2hlbk5vQ29udGV4dCwgdGhpcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE1lc3NhZ2VUb2FzdC5zaG93KG1lc3NhZ2UpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBXZSB1c2UgdGhpcyBmdW5jdGlvbiBpbiBzaG93RG9jdW1lbnREaXNjYXJkTWVzc2FnZSB3aGVuIG5vIGNvbnRleHQgaXMgcGFzc2VkLlxuXHQgKi9cblx0c2hvd01lc3NhZ2VXaGVuTm9Db250ZXh0KCkge1xuXHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSB0aGlzLl9nZXRSZXNvdXJjZU1vZGVsKCk7XG5cdFx0Y29uc3QgbWVzc2FnZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0RJU0NBUkRfRFJBRlRfVE9BU1RcIik7XG5cdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKTtcblx0XHRNZXNzYWdlVG9hc3Quc2hvdyhtZXNzYWdlKTtcblx0XHRhcHBDb21wb25lbnQuZ2V0Um91dGluZ1NlcnZpY2UoKS5kZXRhY2hBZnRlclJvdXRlTWF0Y2hlZCh0aGlzLnNob3dNZXNzYWdlV2hlbk5vQ29udGV4dCwgdGhpcyk7XG5cdH1cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIGNvbnRleHQgY29ycmVzcG9uZHMgdG8gYSBkcmFmdCByb290LlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dCBUaGUgY29udGV4dCB0byBjaGVja1xuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBjb250ZXh0IHBvaW50cyB0byBhIGRyYWZ0IHJvb3Rcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByb3RlY3RlZCBpc0RyYWZ0Um9vdChjb250ZXh0OiBDb250ZXh0KTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gY29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IG1ldGFDb250ZXh0ID0gbWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KGNvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRyZXR1cm4gTW9kZWxIZWxwZXIuaXNEcmFmdFJvb3QoZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFDb250ZXh0KS50YXJnZXRFbnRpdHlTZXQpO1xuXHR9XG5cblx0Ly8gSW50ZXJuYWwgb25seSBwYXJhbXMgLS0tXG5cdC8vIEBwYXJhbSB7c3RyaW5nfSBtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lIE5hbWUgb2YgdGhlIEVudGl0eVNldCB0byB3aGljaCB0aGUgb2JqZWN0IGJlbG9uZ3NcblxuXHQvKipcblx0ICogRGVsZXRlcyB0aGUgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgIENvbnRleHQgb2YgdGhlIGRvY3VtZW50XG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzIENhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMudGl0bGUgVGl0bGUgb2YgdGhlIG9iamVjdCBiZWluZyBkZWxldGVkXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uIERlc2NyaXB0aW9uIG9mIHRoZSBvYmplY3QgYmVpbmcgZGVsZXRlZFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIG9uY2UgZG9jdW1lbnQgaGFzIGJlZW4gZGVsZXRlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjZGVsZXRlRG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgZGVsZXRlRG9jdW1lbnQob0NvbnRleHQ6IENvbnRleHQsIG1JblBhcmFtZXRlcnM6IHsgdGl0bGU6IHN0cmluZzsgZGVzY3JpcHRpb246IHN0cmluZyB9KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0bGV0IG1QYXJhbWV0ZXJzOiBhbnkgPSBtSW5QYXJhbWV0ZXJzO1xuXHRcdGlmICghbVBhcmFtZXRlcnMpIHtcblx0XHRcdG1QYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHRiRmluZEFjdGl2ZUNvbnRleHRzOiBmYWxzZVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bVBhcmFtZXRlcnMuYkZpbmRBY3RpdmVDb250ZXh0cyA9IGZhbHNlO1xuXHRcdH1cblx0XHRtUGFyYW1ldGVycy5iZWZvcmVEZWxldGVDYWxsQmFjayA9IHRoaXMuYmFzZS5lZGl0Rmxvdy5vbkJlZm9yZURlbGV0ZTtcblx0XHR0cnkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR0aGlzLl9pc0ZjbEVuYWJsZWQoKSAmJlxuXHRcdFx0XHR0aGlzLmlzRHJhZnRSb290KG9Db250ZXh0KSAmJlxuXHRcdFx0XHRvQ29udGV4dC5nZXRJbmRleCgpID09PSB1bmRlZmluZWQgJiZcblx0XHRcdFx0b0NvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSA9PT0gdHJ1ZSAmJlxuXHRcdFx0XHRvQ29udGV4dC5nZXRQcm9wZXJ0eShcIkhhc0RyYWZ0RW50aXR5XCIpID09PSB0cnVlXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gRGVsZXRpbmcgYW4gYWN0aXZlIGVudGl0eSB3aGljaCBoYXMgYSBkcmFmdCB0aGF0IGNvdWxkIHBvdGVudGlhbGx5IGJlIGRpc3BsYXllZCBpbiB0aGUgTGlzdFJlcG9ydCAoRkNMIGNhc2UpXG5cdFx0XHRcdC8vIC0tPiBuZWVkIHRvIHJlbW92ZSB0aGUgZHJhZnQgZnJvbSB0aGUgTFIgYW5kIHJlcGxhY2UgaXQgd2l0aCB0aGUgYWN0aXZlIHZlcnNpb24sIHNvIHRoYXQgdGhlIExpc3RCaW5kaW5nIGlzIHByb3Blcmx5IHJlZnJlc2hlZFxuXHRcdFx0XHQvLyBUaGUgY29uZGl0aW9uICdvQ29udGV4dC5nZXRJbmRleCgpID09PSB1bmRlZmluZWQnIG1ha2VzIHN1cmUgdGhlIGFjdGl2ZSB2ZXJzaW9uIGlzbid0IGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSBMUlxuXHRcdFx0XHRtUGFyYW1ldGVycy5iZWZvcmVEZWxldGVDYWxsQmFjayA9IGFzeW5jIChwYXJhbWV0ZXJzPzogeyBjb250ZXh0cz86IENvbnRleHRbXSB9KSA9PiB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlRGVsZXRlKHBhcmFtZXRlcnMpO1xuXG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnN0IG1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRcdFx0XHRcdGNvbnN0IHNpYmxpbmdDb250ZXh0ID0gbW9kZWwuYmluZENvbnRleHQoYCR7b0NvbnRleHQuZ2V0UGF0aCgpfS9TaWJsaW5nRW50aXR5YCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdFx0XHRjb25zdCBkcmFmdFBhdGggPSBhd2FpdCBzaWJsaW5nQ29udGV4dC5yZXF1ZXN0Q2Fub25pY2FsUGF0aCgpO1xuXHRcdFx0XHRcdFx0Y29uc3QgZHJhZnRDb250ZXh0VG9SZW1vdmUgPSBtb2RlbC5nZXRLZWVwQWxpdmVDb250ZXh0KGRyYWZ0UGF0aCk7XG5cdFx0XHRcdFx0XHRkcmFmdENvbnRleHRUb1JlbW92ZS5yZXBsYWNlV2l0aChvQ29udGV4dCk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlcGxhY2luZyB0aGUgZHJhZnQgaW5zdGFuY2UgaW4gdGhlIExSIE9ETEJcIiwgZXJyb3IgYXMgYW55KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IHRoaXMuZGVsZXRlRG9jdW1lbnRUcmFuc2FjdGlvbihvQ29udGV4dCwgbVBhcmFtZXRlcnMpO1xuXG5cdFx0XHQvLyBTaW5nbGUgb2JqZXQgZGVsZXRpb24gaXMgdHJpZ2dlcmVkIGZyb20gYW4gT1AgaGVhZGVyIGJ1dHRvbiAobm90IGZyb20gYSBsaXN0KVxuXHRcdFx0Ly8gLS0+IE1hcmsgVUkgZGlydHkgYW5kIG5hdmlnYXRlIGJhY2sgdG8gZGlzbWlzcyB0aGUgT1Bcblx0XHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9zZW5kQWN0aXZpdHkoQWN0aXZpdHkuRGVsZXRlLCBvQ29udGV4dCk7XG5cblx0XHRcdC8vIEFmdGVyIGRlbGV0ZSBpcyBzdWNjZXNzZnVsbCwgd2UgbmVlZCB0byBkZXRhY2ggdGhlIHNldEJhY2tOYXZpZ2F0aW9uIE1ldGhvZHNcblx0XHRcdGlmIChvQXBwQ29tcG9uZW50KSB7XG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvQXBwQ29tcG9uZW50Py5nZXRTdGFydHVwTW9kZSgpID09PSBTdGFydHVwTW9kZS5EZWVwbGluayAmJiAhdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0Ly8gSW4gY2FzZSB0aGUgYXBwIGhhcyBiZWVuIGxhdW5jaGVkIHdpdGggc2VtYW50aWMga2V5cywgZGVsZXRpbmcgdGhlIG9iamVjdCB3ZSd2ZSBsYW5kZWQgb24gc2hhbGwgbmF2aWdhdGUgYmFja1xuXHRcdFx0XHQvLyB0byB0aGUgYXBwIHdlIGNhbWUgZnJvbSAoZXhjZXB0IGZvciBGQ0wsIHdoZXJlIHdlIG5hdmlnYXRlIHRvIExSIGFzIHVzdWFsKVxuXHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuZXhpdEZyb21BcHAoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuZ2V0SW50ZXJuYWxSb3V0aW5nKCkubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBkZWxldGluZyB0aGUgZG9jdW1lbnRcIiwgZXJyb3IgYXMgYW55KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU3VibWl0IHRoZSBjdXJyZW50IHNldCBvZiBjaGFuZ2VzIGFuZCBuYXZpZ2F0ZSBiYWNrLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIG9Db250ZXh0ICBDb250ZXh0IG9mIHRoZSBkb2N1bWVudFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIG9uY2UgdGhlIGNoYW5nZXMgaGF2ZSBiZWVuIHNhdmVkXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNhcHBseURvY3VtZW50XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGFwcGx5RG9jdW1lbnQob0NvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvTG9ja09iamVjdCA9IHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuc3luY1Rhc2soKTtcblx0XHRcdGlmIChvQ29udGV4dC5nZXRNb2RlbCgpLmhhc1BlbmRpbmdDaGFuZ2VzKFwiJGF1dG9cIikpIHtcblx0XHRcdFx0QnVzeUxvY2tlci5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHRcdFx0YXdhaXQgdGhpcy5fc3VibWl0T3BlbkNoYW5nZXMob0NvbnRleHQpO1xuXHRcdFx0fVxuXHRcdFx0YXdhaXQgdGhpcy5fY2hlY2tGb3JWYWxpZGF0aW9uRXJyb3JzKCk7XG5cdFx0XHRhd2FpdCB0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHRcdGF3YWl0IHRoaXMuZ2V0SW50ZXJuYWxSb3V0aW5nKCkubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQpO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvTG9ja09iamVjdCkpIHtcblx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0xvY2tPYmplY3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEludGVybmFsIG9ubHkgcGFyYW1zIC0tLVxuXHQvLyBAcGFyYW0ge2Jvb2xlYW59IFttUGFyYW1ldGVycy5iU3RhdGljQWN0aW9uXSBCb29sZWFuIHZhbHVlIGZvciBzdGF0aWMgYWN0aW9uLCB1bmRlZmluZWQgZm9yIG90aGVyIGFjdGlvbnNcblx0Ly8gQHBhcmFtIHtib29sZWFufSBbbVBhcmFtZXRlcnMuaXNOYXZpZ2FibGVdIEJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIG5hdmlnYXRpb24gaXMgcmVxdWlyZWQgYWZ0ZXIgdGhlIGFjdGlvbiBoYXMgYmVlbiBleGVjdXRlZFxuXHQvLyBDdXJyZW50bHkgdGhlIHBhcmFtZXRlciBpc05hdmlnYWJsZSBpcyB1c2VkIGludGVybmFsbHkgYW5kIHNob3VsZCBiZSBjaGFuZ2VkIHRvIHJlcXVpcmVzTmF2aWdhdGlvbiBhcyBpdCBpcyBhIG1vcmUgYXB0IG5hbWUgZm9yIHRoaXMgcGFyYW1cblxuXHQvKipcblx0ICogSW52b2tlcyBhbiBhY3Rpb24gKGJvdW5kIG9yIHVuYm91bmQpIGFuZCB0cmFja3MgdGhlIGNoYW5nZXMgc28gdGhhdCBvdGhlciBwYWdlcyBjYW4gYmUgcmVmcmVzaGVkIGFuZCBzaG93IHRoZSB1cGRhdGVkIGRhdGEgdXBvbiBuYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzIEEgbWFwIG9mIGFjdGlvbiBwYXJhbWV0ZXIgbmFtZXMgYW5kIHByb3ZpZGVkIHZhbHVlc1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXMubmFtZSBOYW1lIG9mIHRoZSBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzLnZhbHVlIFZhbHVlIG9mIHRoZSBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZyBTa2lwcyB0aGUgYWN0aW9uIHBhcmFtZXRlciBkaWFsb2cgaWYgdmFsdWVzIGFyZSBwcm92aWRlZCBmb3IgYWxsIG9mIHRoZW0gaW4gcGFyYW1ldGVyVmFsdWVzXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmNvbnRleHRzIEZvciBhIGJvdW5kIGFjdGlvbiwgYSBjb250ZXh0IG9yIGFuIGFycmF5IHdpdGggY29udGV4dHMgZm9yIHdoaWNoIHRoZSBhY3Rpb24gaXMgdG8gYmUgY2FsbGVkIG11c3QgYmUgcHJvdmlkZWRcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMubW9kZWwgRm9yIGFuIHVuYm91bmQgYWN0aW9uLCBhbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbCBtdXN0IGJlIHByb3ZpZGVkXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnJlcXVpcmVzTmF2aWdhdGlvbiBCb29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciBuYXZpZ2F0aW9uIGlzIHJlcXVpcmVkIGFmdGVyIHRoZSBhY3Rpb24gaGFzIGJlZW4gZXhlY3V0ZWQuIE5hdmlnYXRpb24gdGFrZXMgcGxhY2UgdG8gdGhlIGNvbnRleHQgcmV0dXJuZWQgYnkgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5sYWJlbCBBIGh1bWFuLXJlYWRhYmxlIGxhYmVsIGZvciB0aGUgYWN0aW9uLiBUaGlzIGlzIG5lZWRlZCBpbiBjYXNlIHRoZSBhY3Rpb24gaGFzIGEgcGFyYW1ldGVyIGFuZCBhIHBhcmFtZXRlciBkaWFsb2cgaXMgc2hvd24gdG8gdGhlIHVzZXIuIFRoZSBsYWJlbCB3aWxsIGJlIHVzZWQgZm9yIHRoZSB0aXRsZSBvZiB0aGUgZGlhbG9nIGFuZCBmb3IgdGhlIGNvbmZpcm1hdGlvbiBidXR0b25cblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuaW52b2NhdGlvbkdyb3VwaW5nIE1vZGUgaG93IGFjdGlvbnMgYXJlIHRvIGJlIGNhbGxlZDogJ0NoYW5nZVNldCcgdG8gcHV0IGFsbCBhY3Rpb24gY2FsbHMgaW50byBvbmUgY2hhbmdlc2V0LCAnSXNvbGF0ZWQnIHRvIHB1dCB0aGVtIGludG8gc2VwYXJhdGUgY2hhbmdlc2V0c1xuXHQgKiBAcGFyYW0gbUV4dHJhUGFyYW1zIFBSSVZBVEVcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIG9uY2UgdGhlIGFjdGlvbiBoYXMgYmVlbiBleGVjdXRlZCwgcHJvdmlkaW5nIHRoZSByZXNwb25zZVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjaW52b2tlQWN0aW9uXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKiBAZmluYWxcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBpbnZva2VBY3Rpb24oXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0XHRtSW5QYXJhbWV0ZXJzPzoge1xuXHRcdFx0cGFyYW1ldGVyVmFsdWVzPzogeyBuYW1lOiBzdHJpbmc7IHZhbHVlOiBhbnkgfTtcblx0XHRcdHNraXBQYXJhbWV0ZXJEaWFsb2c/OiBib29sZWFuO1xuXHRcdFx0Y29udGV4dHM/OiBDb250ZXh0IHwgQ29udGV4dFtdO1xuXHRcdFx0bW9kZWw/OiBPRGF0YU1vZGVsO1xuXHRcdFx0cmVxdWlyZXNOYXZpZ2F0aW9uPzogYm9vbGVhbjtcblx0XHRcdGxhYmVsPzogc3RyaW5nO1xuXHRcdFx0aW52b2NhdGlvbkdyb3VwaW5nPzogc3RyaW5nO1xuXHRcdH0sXG5cdFx0bUV4dHJhUGFyYW1zPzogYW55XG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGxldCBvQ29udHJvbDogYW55O1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGxldCBhUGFydHM7XG5cdFx0bGV0IHNPdmVybG9hZEVudGl0eVR5cGU7XG5cdFx0bGV0IG9DdXJyZW50QWN0aW9uQ2FsbEJhY2tzOiBhbnk7XG5cdFx0Y29uc3Qgb1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXG5cdFx0bGV0IG1QYXJhbWV0ZXJzOiBhbnkgPSBtSW5QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdC8vIER1ZSB0byBhIG1pc3Rha2UgdGhlIGludm9rZUFjdGlvbiBpbiB0aGUgZXh0ZW5zaW9uQVBJIGhhZCBhIGRpZmZlcmVudCBBUEkgdGhhbiB0aGlzIG9uZS5cblx0XHQvLyBUaGUgb25lIGZyb20gdGhlIGV4dGVuc2lvbkFQSSBkb2Vzbid0IGV4aXN0IGFueW1vcmUgYXMgd2UgZXhwb3NlIHRoZSBmdWxsIGVkaXQgZmxvdyBub3cgYnV0XG5cdFx0Ly8gZHVlIHRvIGNvbXBhdGliaWxpdHkgcmVhc29ucyB3ZSBzdGlsbCBuZWVkIHRvIHN1cHBvcnQgdGhlIG9sZCBzaWduYXR1cmVcblx0XHRpZiAoXG5cdFx0XHQobVBhcmFtZXRlcnMuaXNBICYmIG1QYXJhbWV0ZXJzLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0XCIpKSB8fFxuXHRcdFx0QXJyYXkuaXNBcnJheShtUGFyYW1ldGVycykgfHxcblx0XHRcdG1FeHRyYVBhcmFtcyAhPT0gdW5kZWZpbmVkXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBjb250ZXh0cyA9IG1QYXJhbWV0ZXJzO1xuXHRcdFx0bVBhcmFtZXRlcnMgPSBtRXh0cmFQYXJhbXMgfHwge307XG5cdFx0XHRpZiAoY29udGV4dHMpIHtcblx0XHRcdFx0bVBhcmFtZXRlcnMuY29udGV4dHMgPSBjb250ZXh0cztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLm1vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRtUGFyYW1ldGVycy5pc05hdmlnYWJsZSA9IG1QYXJhbWV0ZXJzLnJlcXVpcmVzTmF2aWdhdGlvbiB8fCBtUGFyYW1ldGVycy5pc05hdmlnYWJsZTtcblxuXHRcdC8vIERldGVybWluZSBpZiB0aGUgcmVmZXJlbmNlZCBhY3Rpb24gaXMgYm91bmQgb3IgdW5ib3VuZFxuXHRcdGNvbnN0IGNvbnZlcnRlZE1ldGFkYXRhID0gY29udmVydFR5cGVzKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCk/LmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0XHQvLyBUaGUgRW50aXR5Q29udGFpbmVyIG1heSBOT1QgYmUgbWlzc2luZywgc28gaXQgc2hvdWxkIG5vdCBiZSBhYmxlIHRvIGJlIHVuZGVmaW5lZCwgYnV0IHNpbmNlIGluIG91ciBjb252ZXJ0ZWQgTWV0YWRhdGFcblx0XHQvLyBpdCBjYW4gYmUgdW5kZWZpbmVkLCBJIG5lZWQgdGhpcyB3b3JrYXJvdW5kIGhlcmUgb2YgYWRkaW5nIFwiXCIgc2luY2UgaW5kZXhPZiBkb2VzIG5vdCBhY2NlcHQgc29tZXRoaW5nIHRoYXQnc1xuXHRcdC8vIHVuZGVmaW5lZC5cblx0XHRpZiAoc0FjdGlvbk5hbWUuaW5kZXhPZihcIlwiICsgY29udmVydGVkTWV0YWRhdGEuZW50aXR5Q29udGFpbmVyLm5hbWUpID4gLTEpIHtcblx0XHRcdC8vIFVuYm91bmQgYWN0aW9ucyBhcmUgYWx3YXlzIHJlZmVyZW5jZWQgdmlhIHRoZSBhY3Rpb24gaW1wb3J0IGFuZCB3ZSBmb3VuZCB0aGUgRW50aXR5Q29udGFpbmVyIGluIHRoZSBzQWN0aW9uTmFtZSBzb1xuXHRcdFx0Ly8gYW4gdW5ib3VuZCBhY3Rpb24gaXMgcmVmZXJlbmNlZCFcblx0XHRcdG1QYXJhbWV0ZXJzLmlzQm91bmQgPSBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTm8gZW50aXR5IGNvbnRhaW5lciBpbiB0aGUgc0FjdGlvbk5hbWUsIHNvIGVpdGhlciBhIGJvdW5kIG9yIHN0YXRpYyBhY3Rpb24gaXMgcmVmZXJlbmNlZCB3aGljaCBpcyBhbHNvIGJvdW5kIVxuXHRcdFx0bVBhcmFtZXRlcnMuaXNCb3VuZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKCFtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sKSB7XG5cdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmNvbnRyb2xJZCkge1xuXHRcdFx0b0NvbnRyb2wgPSB0aGlzLmdldFZpZXcoKS5ieUlkKG1QYXJhbWV0ZXJzLmNvbnRyb2xJZCk7XG5cdFx0XHRpZiAob0NvbnRyb2wpIHtcblx0XHRcdFx0Ly8gVE9ETzogY3VycmVudGx5IHRoaXMgc2VsZWN0ZWQgY29udGV4dHMgdXBkYXRlIGlzIGRvbmUgd2l0aGluIHRoZSBvcGVyYXRpb24sIHNob3VsZCBiZSBtb3ZlZCBvdXRcblx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgPSBvQ29udHJvbC5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0fVxuXG5cdFx0aWYgKHNBY3Rpb25OYW1lICYmIHNBY3Rpb25OYW1lLmluZGV4T2YoXCIoXCIpID4gLTEpIHtcblx0XHRcdC8vIGdldCBlbnRpdHkgdHlwZSBvZiBhY3Rpb24gb3ZlcmxvYWQgYW5kIHJlbW92ZSBpdCBmcm9tIHRoZSBhY3Rpb24gcGF0aFxuXHRcdFx0Ly8gRXhhbXBsZSBzQWN0aW9uTmFtZSA9IFwiPEFjdGlvbk5hbWU+KENvbGxlY3Rpb24oPE92ZXJsb2FkRW50aXR5VHlwZT4pKVwiXG5cdFx0XHQvLyBzQWN0aW9uTmFtZSA9IGFQYXJ0c1swXSAtLT4gPEFjdGlvbk5hbWU+XG5cdFx0XHQvLyBzT3ZlcmxvYWRFbnRpdHlUeXBlID0gYVBhcnRzWzJdIC0tPiA8T3ZlcmxvYWRFbnRpdHlUeXBlPlxuXHRcdFx0YVBhcnRzID0gc0FjdGlvbk5hbWUuc3BsaXQoXCIoXCIpO1xuXHRcdFx0c0FjdGlvbk5hbWUgPSBhUGFydHNbMF07XG5cdFx0XHRzT3ZlcmxvYWRFbnRpdHlUeXBlID0gKGFQYXJ0c1thUGFydHMubGVuZ3RoIC0gMV0gYXMgYW55KS5yZXBsYWNlQWxsKFwiKVwiLCBcIlwiKTtcblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuYlN0YXRpY0FjdGlvbikge1xuXHRcdFx0aWYgKG9Db250cm9sLmlzVGFibGVCb3VuZCgpKSB7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNvbnRleHRzID0gb0NvbnRyb2wuZ2V0Um93QmluZGluZygpLmdldEhlYWRlckNvbnRleHQoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IG9Db250cm9sLmRhdGEoXCJyb3dzQmluZGluZ0luZm9cIikucGF0aCxcblx0XHRcdFx0XHRvTGlzdEJpbmRpbmcgPSBuZXcgKE9EYXRhTGlzdEJpbmRpbmcgYXMgYW55KSh0aGlzLmdldFZpZXcoKS5nZXRNb2RlbCgpLCBzQmluZGluZ1BhdGgpO1xuXHRcdFx0XHRtUGFyYW1ldGVycy5jb250ZXh0cyA9IG9MaXN0QmluZGluZy5nZXRIZWFkZXJDb250ZXh0KCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzT3ZlcmxvYWRFbnRpdHlUeXBlICYmIG9Db250cm9sLmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdFx0bVBhcmFtZXRlcnMuY29udGV4dHMgPSB0aGlzLl9nZXRBY3Rpb25PdmVybG9hZENvbnRleHRGcm9tTWV0YWRhdGFQYXRoKFxuXHRcdFx0XHRcdG9Db250cm9sLmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRcdFx0b0NvbnRyb2wuZ2V0Um93QmluZGluZygpLFxuXHRcdFx0XHRcdHNPdmVybG9hZEVudGl0eVR5cGVcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmVuYWJsZUF1dG9TY3JvbGwpIHtcblx0XHRcdFx0b0N1cnJlbnRBY3Rpb25DYWxsQmFja3MgPSB0aGlzLmNyZWF0ZUFjdGlvblByb21pc2Uoc0FjdGlvbk5hbWUsIG9Db250cm9sLnNJZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG1QYXJhbWV0ZXJzLmJHZXRCb3VuZENvbnRleHQgPSB0aGlzLl9nZXRCb3VuZENvbnRleHQob1ZpZXcsIG1QYXJhbWV0ZXJzKTtcblx0XHQvLyBOZWVkIHRvIGtub3cgdGhhdCB0aGUgYWN0aW9uIGlzIGNhbGxlZCBmcm9tIE9iamVjdFBhZ2UgZm9yIGNoYW5nZVNldCBJc29sYXRlZCB3b3JrYXJvdW5kXG5cdFx0bVBhcmFtZXRlcnMuYk9iamVjdFBhZ2UgPSAob1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmNvbnZlcnRlclR5cGUgPT09IFwiT2JqZWN0UGFnZVwiO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuc3luY1Rhc2soKTtcblx0XHRcdGNvbnN0IG9SZXNwb25zZSA9IGF3YWl0IHRyYW5zYWN0aW9uSGVscGVyLmNhbGxBY3Rpb24oXG5cdFx0XHRcdHNBY3Rpb25OYW1lLFxuXHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0dGhpcy5nZXRWaWV3KCksXG5cdFx0XHRcdHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksXG5cdFx0XHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKVxuXHRcdFx0KTtcblx0XHRcdGxldCBsaXN0UmVmcmVzaGVkOiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmNvbnRleHRzICYmIG1QYXJhbWV0ZXJzLmlzQm91bmQgPT09IHRydWUpIHtcblx0XHRcdFx0bGlzdFJlZnJlc2hlZCA9IGF3YWl0IHRoaXMuX3JlZnJlc2hMaXN0SWZSZXF1aXJlZChcblx0XHRcdFx0XHR0aGlzLmdldEFjdGlvblJlc3BvbnNlRGF0YUFuZEtleXMoc0FjdGlvbk5hbWUsIG9SZXNwb25zZSksXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuY29udGV4dHNbMF1cblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdGlmIChBY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpKSB7XG5cdFx0XHRcdGxldCBhY3Rpb25SZXF1ZXN0ZWRQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRpZiAob1Jlc3BvbnNlKSB7XG5cdFx0XHRcdFx0YWN0aW9uUmVxdWVzdGVkUHJvcGVydGllcyA9IEFycmF5LmlzQXJyYXkob1Jlc3BvbnNlKVxuXHRcdFx0XHRcdFx0PyBPYmplY3Qua2V5cyhvUmVzcG9uc2VbMF0udmFsdWUuZ2V0T2JqZWN0KCkpXG5cdFx0XHRcdFx0XHQ6IE9iamVjdC5rZXlzKG9SZXNwb25zZS5nZXRPYmplY3QoKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkFjdGlvbiwgbVBhcmFtZXRlcnMuY29udGV4dHMsIHNBY3Rpb25OYW1lLCBsaXN0UmVmcmVzaGVkLCBhY3Rpb25SZXF1ZXN0ZWRQcm9wZXJ0aWVzKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX3RyaWdnZXJDb25maWd1cmVkU3VydmV5KHNBY3Rpb25OYW1lLCBUcmlnZ2VyVHlwZS5hY3Rpb24pO1xuXG5cdFx0XHRpZiAob0N1cnJlbnRBY3Rpb25DYWxsQmFja3MpIHtcblx0XHRcdFx0b0N1cnJlbnRBY3Rpb25DYWxsQmFja3MuZlJlc29sdmVyKG9SZXNwb25zZSk7XG5cdFx0XHR9XG5cdFx0XHQvKlxuXHRcdFx0XHRcdFdlIHNldCB0aGUgKHVwcGVyKSBwYWdlcyB0byBkaXJ0eSBhZnRlciBhbiBleGVjdXRpb24gb2YgYW4gYWN0aW9uXG5cdFx0XHRcdFx0VE9ETzogZ2V0IHJpZCBvZiB0aGlzIHdvcmthcm91bmRcblx0XHRcdFx0XHRUaGlzIHdvcmthcm91bmQgaXMgb25seSBuZWVkZWQgYXMgbG9uZyBhcyB0aGUgbW9kZWwgZG9lcyBub3Qgc3VwcG9ydCB0aGUgc3luY2hyb25pemF0aW9uLlxuXHRcdFx0XHRcdE9uY2UgdGhpcyBpcyBzdXBwb3J0ZWQgd2UgZG9uJ3QgbmVlZCB0byBzZXQgdGhlIHBhZ2VzIHRvIGRpcnR5IGFueW1vcmUgYXMgdGhlIGNvbnRleHQgaXRzZWxmXG5cdFx0XHRcdFx0aXMgYWxyZWFkeSByZWZyZXNoZWQgKGl0J3MganVzdCBub3QgcmVmbGVjdGVkIGluIHRoZSBvYmplY3QgcGFnZSlcblx0XHRcdFx0XHR3ZSBleHBsaWNpdGx5IGRvbid0IGNhbGwgdGhpcyBtZXRob2QgZnJvbSB0aGUgbGlzdCByZXBvcnQgYnV0IG9ubHkgY2FsbCBpdCBmcm9tIHRoZSBvYmplY3QgcGFnZVxuXHRcdFx0XHRcdGFzIGlmIGl0IGlzIGNhbGxlZCBpbiB0aGUgbGlzdCByZXBvcnQgaXQncyBub3QgbmVlZGVkIC0gYXMgd2UgYW55d2F5IHdpbGwgcmVtb3ZlIHRoaXMgbG9naWNcblx0XHRcdFx0XHR3ZSBjYW4gbGl2ZSB3aXRoIHRoaXNcblx0XHRcdFx0XHR3ZSBuZWVkIGEgY29udGV4dCB0byBzZXQgdGhlIHVwcGVyIHBhZ2VzIHRvIGRpcnR5IC0gaWYgdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmUgd2UgdXNlIHRoZVxuXHRcdFx0XHRcdGZpcnN0IG9uZSBhcyB0aGV5IGFyZSBhbnl3YXkgc2libGluZ3Ncblx0XHRcdFx0XHQqL1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmNvbnRleHRzKSB7XG5cdFx0XHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmdldEludGVybmFsTW9kZWwoKS5zZXRQcm9wZXJ0eShcIi9sYXN0SW52b2tlZEFjdGlvblwiLCBzQWN0aW9uTmFtZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuaXNOYXZpZ2FibGUpIHtcblx0XHRcdFx0bGV0IHZDb250ZXh0ID0gb1Jlc3BvbnNlO1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2Q29udGV4dCkgJiYgdkNvbnRleHQubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdFx0dkNvbnRleHQgPSB2Q29udGV4dFswXS52YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodkNvbnRleHQgJiYgIUFycmF5LmlzQXJyYXkodkNvbnRleHQpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRcdFx0Y29uc3Qgc0NvbnRleHRNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgodkNvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdFx0XHRjb25zdCBfZm5WYWxpZENvbnRleHRzID0gKGNvbnRleHRzOiBhbnksIGFwcGxpY2FibGVDb250ZXh0czogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29udGV4dHMuZmlsdGVyKChlbGVtZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0aWYgKGFwcGxpY2FibGVDb250ZXh0cykge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBhcHBsaWNhYmxlQ29udGV4dHMuaW5kZXhPZihlbGVtZW50KSA+IC0xO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRjb25zdCBvQWN0aW9uQ29udGV4dCA9IEFycmF5LmlzQXJyYXkobVBhcmFtZXRlcnMuY29udGV4dHMpXG5cdFx0XHRcdFx0XHQ/IF9mblZhbGlkQ29udGV4dHMobVBhcmFtZXRlcnMuY29udGV4dHMsIG1QYXJhbWV0ZXJzLmFwcGxpY2FibGVDb250ZXh0cylbMF1cblx0XHRcdFx0XHRcdDogbVBhcmFtZXRlcnMuY29udGV4dHM7XG5cdFx0XHRcdFx0Y29uc3Qgc0FjdGlvbkNvbnRleHRNZXRhUGF0aCA9IG9BY3Rpb25Db250ZXh0ICYmIG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0FjdGlvbkNvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdFx0XHRpZiAoc0NvbnRleHRNZXRhUGF0aCAhPSB1bmRlZmluZWQgJiYgc0NvbnRleHRNZXRhUGF0aCA9PT0gc0FjdGlvbkNvbnRleHRNZXRhUGF0aCkge1xuXHRcdFx0XHRcdFx0aWYgKG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKSAhPT0gdkNvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuZ2V0SW50ZXJuYWxSb3V0aW5nKCkubmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KHZDb250ZXh0LCB7XG5cdFx0XHRcdFx0XHRcdFx0Y2hlY2tOb0hhc2hDaGFuZ2U6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0bm9IaXN0b3J5RW50cnk6IGZhbHNlXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0TG9nLmluZm8oXCJOYXZpZ2F0aW9uIHRvIHRoZSBzYW1lIGNvbnRleHQgaXMgbm90IGFsbG93ZWRcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmJhc2UuZWRpdEZsb3cub25BZnRlckFjdGlvbkV4ZWN1dGlvbihzQWN0aW9uTmFtZSk7XG5cdFx0XHRyZXR1cm4gb1Jlc3BvbnNlO1xuXHRcdH0gY2F0Y2ggKGVycjogYW55KSB7XG5cdFx0XHRpZiAob0N1cnJlbnRBY3Rpb25DYWxsQmFja3MpIHtcblx0XHRcdFx0b0N1cnJlbnRBY3Rpb25DYWxsQmFja3MuZlJlamVjdG9yKCk7XG5cdFx0XHR9XG5cdFx0XHQvLyBGSVhNRTogaW4gbW9zdCBzaXR1YXRpb25zIHRoZXJlIGlzIG5vIGhhbmRsZXIgZm9yIHRoZSByZWplY3RlZCBwcm9taXNlcyByZXR1cm5lZHFcblx0XHRcdGlmIChlcnIgPT09IENvbnN0YW50cy5DYW5jZWxBY3Rpb25EaWFsb2cpIHtcblx0XHRcdFx0Ly8gVGhpcyBsZWFkcyB0byBjb25zb2xlIGVycm9yLiBBY3R1YWxseSB0aGUgZXJyb3IgaXMgYWxyZWFkeSBoYW5kbGVkIChjdXJyZW50bHkgZGlyZWN0bHkgaW4gcHJlc3MgaGFuZGxlciBvZiBlbmQgYnV0dG9uIGluIGRpYWxvZyksIHNvIGl0IHNob3VsZCBub3QgYmUgZm9yd2FyZGVkXG5cdFx0XHRcdC8vIHVwIHRvIGhlcmUuIEhvd2V2ZXIsIHdoZW4gZGlhbG9nIGhhbmRsaW5nIGFuZCBiYWNrZW5kIGV4ZWN1dGlvbiBhcmUgc2VwYXJhdGVkLCBpbmZvcm1hdGlvbiB3aGV0aGVyIGRpYWxvZyB3YXMgY2FuY2VsbGVkLCBvciBiYWNrZW5kIGV4ZWN1dGlvbiBoYXMgZmFpbGVkIG5lZWRzXG5cdFx0XHRcdC8vIHRvIGJlIHRyYW5zcG9ydGVkIHRvIHRoZSBwbGFjZSByZXNwb25zaWJsZSBmb3IgY29ubmVjdGluZyB0aGVzZSB0d28gdGhpbmdzLlxuXHRcdFx0XHQvLyBUT0RPOiByZW1vdmUgc3BlY2lhbCBoYW5kbGluZyBvbmUgZGlhbG9nIGhhbmRsaW5nIGFuZCBiYWNrZW5kIGV4ZWN1dGlvbiBhcmUgc2VwYXJhdGVkXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkRpYWxvZyBjYW5jZWxsZWRcIik7XG5cdFx0XHR9IGVsc2UgaWYgKCEoZXJyICYmIChlcnIuY2FuY2VsZWQgfHwgKGVyci5yZWplY3RlZEl0ZW1zICYmIGVyci5yZWplY3RlZEl0ZW1zWzBdLmNhbmNlbGVkKSkpKSB7XG5cdFx0XHRcdC8vIFRPRE86IGFuYWx5emUsIHdoZXRoZXIgdGhpcyBpcyBvZiB0aGUgc2FtZSBjYXRlZ29yeSBhcyBhYm92ZVxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGluIEVkaXRGbG93Lmludm9rZUFjdGlvbjoke2Vycn1gKTtcblx0XHRcdH1cblx0XHRcdC8vIFRPRE86IEFueSB1bmV4cGVjdGVkIGVycm9ycyBwcm9iYWJseSBzaG91bGQgbm90IGJlIGlnbm9yZWQhXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhvb2sgd2hpY2ggY2FuIGJlIG92ZXJyaWRkZW4gYWZ0ZXIgdGhlIGFjdGlvbiBleGVjdXRpb24uXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gX2FjdGlvbk5hbWUgTmFtZSBvZiB0aGUgYWN0aW9uXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkFmdGVyQWN0aW9uRXhlY3V0aW9uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBzaW5jZSAxLjExNC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdGFzeW5jIG9uQWZ0ZXJBY3Rpb25FeGVjdXRpb24oX2FjdGlvbk5hbWU6IHN0cmluZykge1xuXHRcdC8vdG8gYmUgb3ZlcnJpZGRlblxuXHR9XG5cblx0LyoqXG5cdCAqIFNlY3VyZWQgZXhlY3V0aW9uIG9mIHRoZSBnaXZlbiBmdW5jdGlvbi4gRW5zdXJlcyB0aGF0IHRoZSBmdW5jdGlvbiBpcyBvbmx5IGV4ZWN1dGVkIHdoZW4gY2VydGFpbiBjb25kaXRpb25zIGFyZSBmdWxmaWxsZWQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gZm5GdW5jdGlvbiBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQuIFNob3VsZCByZXR1cm4gYSBwcm9taXNlIHRoYXQgaXMgc2V0dGxlZCBhZnRlciBjb21wbGV0aW9uIG9mIHRoZSBleGVjdXRpb24uIElmIG5vdGhpbmcgaXMgcmV0dXJuZWQsIGltbWVkaWF0ZSBjb21wbGV0aW9uIGlzIGFzc3VtZWQuXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBEZWZpbml0aW9ucyBvZiB0aGUgcHJlY29uZGl0aW9ucyB0byBiZSBjaGVja2VkIGJlZm9yZSBleGVjdXRpb25cblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLmJ1c3kgRGVmaW5lcyB0aGUgYnVzeSBpbmRpY2F0b3Jcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLmJ1c3kuc2V0IFRyaWdnZXJzIGEgYnVzeSBpbmRpY2F0b3Igd2hlbiB0aGUgZnVuY3Rpb24gaXMgZXhlY3V0ZWQuXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5idXN5LmNoZWNrIEV4ZWN1dGVzIGZ1bmN0aW9uIG9ubHkgaWYgYXBwbGljYXRpb24gaXNuJ3QgYnVzeS5cblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLnVwZGF0ZXNEb2N1bWVudCBUaGlzIG9wZXJhdGlvbiB1cGRhdGVzIHRoZSBjdXJyZW50IGRvY3VtZW50IHdpdGhvdXQgdXNpbmcgdGhlIGJvdW5kIG1vZGVsIGFuZCBjb250ZXh0LiBBcyBhIHJlc3VsdCwgdGhlIGRyYWZ0IHN0YXR1cyBpcyB1cGRhdGVkIGlmIGEgZHJhZnQgZG9jdW1lbnQgZXhpc3RzLCBhbmQgdGhlIHVzZXIgaGFzIHRvIGNvbmZpcm0gdGhlIGNhbmNlbGxhdGlvbiBvZiB0aGUgZWRpdGluZyBwcm9jZXNzLlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCBpcyByZWplY3RlZCBpZiB0aGUgZXhlY3V0aW9uIGlzIHByb2hpYml0ZWQgYW5kIHJlc29sdmVkIGJ5IHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IHRoZSBmbkZ1bmN0aW9uLlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjc2VjdXJlZEV4ZWN1dGlvblxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRzZWN1cmVkRXhlY3V0aW9uKFxuXHRcdGZuRnVuY3Rpb246IEZ1bmN0aW9uLFxuXHRcdG1QYXJhbWV0ZXJzPzoge1xuXHRcdFx0YnVzeT86IHtcblx0XHRcdFx0c2V0PzogYm9vbGVhbjtcblx0XHRcdFx0Y2hlY2s/OiBib29sZWFuO1xuXHRcdFx0fTtcblx0XHRcdHVwZGF0ZXNEb2N1bWVudD86IGJvb2xlYW47XG5cdFx0fVxuXHQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBiQnVzeVNldCA9IG1QYXJhbWV0ZXJzPy5idXN5Py5zZXQgPz8gdHJ1ZSxcblx0XHRcdGJCdXN5Q2hlY2sgPSBtUGFyYW1ldGVycz8uYnVzeT8uY2hlY2sgPz8gdHJ1ZSxcblx0XHRcdGJVcGRhdGVzRG9jdW1lbnQgPSBtUGFyYW1ldGVycz8udXBkYXRlc0RvY3VtZW50ID8/IGZhbHNlLFxuXHRcdFx0b0xvY2tPYmplY3QgPSB0aGlzLmdldEdsb2JhbFVJTW9kZWwoKSxcblx0XHRcdG9Db250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdGJJc0RyYWZ0ID0gb0NvbnRleHQgJiYgdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0IGFzIENvbnRleHQpID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0O1xuXG5cdFx0aWYgKGJCdXN5Q2hlY2sgJiYgQnVzeUxvY2tlci5pc0xvY2tlZChvTG9ja09iamVjdCkpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcIkFwcGxpY2F0aW9uIGFscmVhZHkgYnVzeSB0aGVyZWZvcmUgZXhlY3V0aW9uIHJlamVjdGVkXCIpO1xuXHRcdH1cblxuXHRcdC8vIHdlIGhhdmUgdG8gc2V0IGJ1c3kgYW5kIGRyYWZ0IGluZGljYXRvciBpbW1lZGlhdGVseSBhbHNvIHRoZSBmdW5jdGlvbiBtaWdodCBiZSBleGVjdXRlZCBsYXRlciBpbiBxdWV1ZVxuXHRcdGlmIChiQnVzeVNldCkge1xuXHRcdFx0QnVzeUxvY2tlci5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHR9XG5cdFx0aWYgKGJVcGRhdGVzRG9jdW1lbnQgJiYgYklzRHJhZnQpIHtcblx0XHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2aW5nKTtcblx0XHR9XG5cblx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5zeW5jVGFzayhmbkZ1bmN0aW9uIGFzICgpID0+IGFueSlcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0aWYgKGJVcGRhdGVzRG9jdW1lbnQpIHtcblx0XHRcdFx0XHR0aGlzLnNldERvY3VtZW50TW9kaWZpZWQodHJ1ZSk7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChiSXNEcmFmdCkge1xuXHRcdFx0XHRcdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5TYXZlZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKChvRXJyb3I6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoYlVwZGF0ZXNEb2N1bWVudCAmJiBiSXNEcmFmdCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuQ2xlYXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChvRXJyb3IpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKGJCdXN5U2V0KSB7XG5cdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0xvY2tPYmplY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyB0aGUgcGF0Y2hTZW50IGV2ZW50OiByZWdpc3RlciBkb2N1bWVudCBtb2RpZmljYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50IHNlbnQgYnkgdGhlIGJpbmRpbmdcblx0ICovXG5cdGhhbmRsZVBhdGNoU2VudChvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0Ly8gSW4gY29sbGFib3JhdGl2ZSBkcmFmdCwgZGlzYWJsZSBFVGFnIGNoZWNrIGZvciBQQVRDSCByZXF1ZXN0c1xuXHRcdGNvbnN0IGlzSW5Db2xsYWJvcmF0aXZlRHJhZnQgPSBBY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQodGhpcy5nZXRWaWV3KCkpO1xuXHRcdGlmIChpc0luQ29sbGFib3JhdGl2ZURyYWZ0KSB7XG5cdFx0XHQoKG9FdmVudC5nZXRTb3VyY2UoKSBhcyBCaW5kaW5nKS5nZXRNb2RlbCgpIGFzIGFueSkuc2V0SWdub3JlRVRhZyh0cnVlKTtcblx0XHR9XG5cdFx0aWYgKCEodGhpcy5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpPy5nZXRQcm9wZXJ0eShcInNraXBQYXRjaEhhbmRsZXJzXCIpKSB7XG5cdFx0XHRjb25zdCBzb3VyY2VCaW5kaW5nID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIE9EYXRhTGlzdEJpbmRpbmc7XG5cdFx0XHQvLyBDcmVhdGUgYSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvciByZWplY3RlZCB3aGVuIHRoZSBwYXRoIGlzIGNvbXBsZXRlZFxuXHRcdFx0Y29uc3Qgb1BhdGNoUHJvbWlzZSA9IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdFx0b0V2ZW50LmdldFNvdXJjZSgpLmF0dGFjaEV2ZW50T25jZShcInBhdGNoQ29tcGxldGVkXCIsIChwYXRjaENvbXBsZXRlZEV2ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHQvLyBSZS1lbmFibGUgRVRhZyBjaGVja3Ncblx0XHRcdFx0XHRpZiAoaXNJbkNvbGxhYm9yYXRpdmVEcmFmdCkge1xuXHRcdFx0XHRcdFx0KChvRXZlbnQuZ2V0U291cmNlKCkgYXMgQmluZGluZykuZ2V0TW9kZWwoKSBhcyBhbnkpLnNldElnbm9yZUVUYWcoZmFsc2UpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChvRXZlbnQuZ2V0U291cmNlKCkuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudEFmdGVyUGF0Y2goXG5cdFx0XHRcdFx0XHRcdHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHRcdFx0XHRzb3VyY2VCaW5kaW5nLFxuXHRcdFx0XHRcdFx0XHR0aGlzLmdldFZpZXcoKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgYlN1Y2Nlc3MgPSBwYXRjaENvbXBsZXRlZEV2ZW50LmdldFBhcmFtZXRlcihcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0aWYgKGJTdWNjZXNzKSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlamVjdCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMudXBkYXRlRG9jdW1lbnQoc291cmNlQmluZGluZywgb1BhdGNoUHJvbWlzZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIENyZWF0ZUFjdGl2YXRlIGV2ZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0V2ZW50IFRoZSBldmVudCBzZW50IGJ5IHRoZSBiaW5kaW5nXG5cdCAqL1xuXHRhc3luYyBoYW5kbGVDcmVhdGVBY3RpdmF0ZShvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0Y29uc3Qgb0JpbmRpbmcgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLmdldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cdFx0Y29uc3QgYkF0RW5kID0gdHJ1ZTtcblx0XHRjb25zdCBiSW5hY3RpdmUgPSB0cnVlO1xuXHRcdGNvbnN0IG9QYXJhbXM6IGFueSA9IHtcblx0XHRcdGNyZWF0aW9uTW9kZTogQ3JlYXRpb25Nb2RlLklubGluZSxcblx0XHRcdGNyZWF0ZUF0RW5kOiBiQXRFbmQsXG5cdFx0XHRpbmFjdGl2ZTogYkluYWN0aXZlLFxuXHRcdFx0a2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZDogZmFsc2UsIC8vIGN1cnJlbnRseSBub3QgZnVsbHkgc3VwcG9ydGVkXG5cdFx0XHRidXN5TW9kZTogXCJOb25lXCJcblx0XHR9O1xuXHRcdHRyeSB7XG5cdFx0XHQvLyBTZW5kIG5vdGlmaWNhdGlvbiB0byBvdGhlciB1c2VycyBvbmx5IGFmdGVyIHRoZSBjcmVhdGlvbiBoYXMgYmVlbiBmaW5hbGl6ZWRcblx0XHRcdGNvbnN0IGFjdGl2YXRlZENvbnRleHQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiY29udGV4dFwiKSBhcyBDb250ZXh0O1xuXHRcdFx0YWN0aXZhdGVkQ29udGV4dFxuXHRcdFx0XHQuY3JlYXRlZCgpXG5cdFx0XHRcdD8udGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkNyZWF0ZSwgYWN0aXZhdGVkQ29udGV4dCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaCgoKSA9PiB7XG5cdFx0XHRcdFx0TG9nLndhcm5pbmcoYEZhaWxlZCB0byBhY3RpdmF0ZSBjb250ZXh0ICR7YWN0aXZhdGVkQ29udGV4dC5nZXRQYXRoKCl9YCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHQvLyBDcmVhdGUgYSBuZXcgaW5hY3RpdmUgY29udGV4dCAoZW1wdHkgcm93IGluIHRoZSB0YWJsZSlcblx0XHRcdGNvbnN0IG5ld0luYWN0aXZlQ29udGV4dCA9IGF3YWl0IHRyYW5zYWN0aW9uSGVscGVyLmNyZWF0ZURvY3VtZW50KFxuXHRcdFx0XHRvQmluZGluZyBhcyBPRGF0YUxpc3RCaW5kaW5nLFxuXHRcdFx0XHRvUGFyYW1zLFxuXHRcdFx0XHR0aGlzLmdldEFwcENvbXBvbmVudCgpLFxuXHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCksXG5cdFx0XHRcdGZhbHNlXG5cdFx0XHQpO1xuXHRcdFx0aWYgKG5ld0luYWN0aXZlQ29udGV4dCkge1xuXHRcdFx0XHRpZiAoIXRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0TG9nLmVycm9yKFwiRmFpbGVkIHRvIGFjdGl2YXRlIG5ldyByb3cgLVwiLCBlcnJvciBhcyBhbnkpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQZXJmb3JtcyBhIHRhc2sgaW4gc3luYyB3aXRoIG90aGVyIHRhc2tzIGNyZWF0ZWQgdmlhIHRoaXMgZnVuY3Rpb24uXG5cdCAqIFJldHVybnMgdGhlIHByb21pc2UgY2hhaW4gb2YgdGhlIHRhc2suXG5cdCAqXG5cdCAqIEBwYXJhbSBbbmV3VGFza10gT3B0aW9uYWwsIGEgcHJvbWlzZSBvciBmdW5jdGlvbiB0byBiZSBleGVjdXRlZCBzeW5jaHJvbm91c2x5XG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSB0aGUgdGFzayBpcyBjb21wbGV0ZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHN5bmNUYXNrKG5ld1Rhc2s/OiAoKCkgPT4gYW55KSB8IFByb21pc2U8YW55Pikge1xuXHRcdGlmIChuZXdUYXNrKSB7XG5cdFx0XHRpZiAodHlwZW9mIG5ld1Rhc2sgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHR0aGlzLnN5bmNUYXNrcyA9IHRoaXMuc3luY1Rhc2tzLnRoZW4obmV3VGFzaykuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnN5bmNUYXNrcyA9IHRoaXMuc3luY1Rhc2tzXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT4gbmV3VGFzaylcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLnN5bmNUYXNrcztcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWNpZGVzIGlmIGEgZG9jdW1lbnQgaXMgdG8gYmUgc2hvd24gaW4gZGlzcGxheSBvciBlZGl0IG1vZGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9IG9Db250ZXh0IFRoZSBjb250ZXh0IHRvIGJlIGRpc3BsYXllZCBvciBlZGl0ZWRcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgcmVzb2x2ZXMgb25jZSB0aGUgZWRpdCBtb2RlIGlzIGNvbXB1dGVkXG5cdCAqL1xuXG5cdGFzeW5jIGNvbXB1dGVFZGl0TW9kZShjb250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgcHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChjb250ZXh0KTtcblxuXHRcdGlmIChwcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLkNsZWFyKTtcblx0XHRcdFx0Y29uc3QgZ2xvYmFsTW9kZWwgPSB0aGlzLmdldEdsb2JhbFVJTW9kZWwoKTtcblx0XHRcdFx0Z2xvYmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVBlbmRpbmdcIiwgdHJ1ZSwgdW5kZWZpbmVkLCB0cnVlKTtcblx0XHRcdFx0Y29uc3QgaXNBY3RpdmVFbnRpdHkgPSBhd2FpdCBjb250ZXh0LnJlcXVlc3RPYmplY3QoXCJJc0FjdGl2ZUVudGl0eVwiKTtcblx0XHRcdFx0aWYgKGlzQWN0aXZlRW50aXR5ID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdC8vIGluIGNhc2UgdGhlIGRvY3VtZW50IGlzIGRyYWZ0IHNldCBpdCBpbiBlZGl0IG1vZGVcblx0XHRcdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkVkaXRhYmxlKTtcblx0XHRcdFx0XHRjb25zdCBoYXNBY3RpdmVFbnRpdHkgPSBhd2FpdCBjb250ZXh0LnJlcXVlc3RPYmplY3QoXCJIYXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0XHRcdFx0dGhpcy5zZXRFZGl0TW9kZSh1bmRlZmluZWQsICFoYXNBY3RpdmVFbnRpdHkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGFjdGl2ZSBkb2N1bWVudCwgc3RheSBvbiBkaXNwbGF5IG1vZGVcblx0XHRcdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkRpc3BsYXksIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRnbG9iYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlUGVuZGluZ1wiLCBmYWxzZSwgdW5kZWZpbmVkLCB0cnVlKTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZGV0ZXJtaW5pbmcgdGhlIGVkaXRNb2RlIGZvciBkcmFmdFwiLCBlcnJvcik7XG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAocHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kpIHtcblx0XHRcdGNvbnN0IGxhc3RJbnZva2VkQWN0aW9uTmFtZSA9IHRoaXMuZ2V0SW50ZXJuYWxNb2RlbCgpLmdldFByb3BlcnR5KFwiL2xhc3RJbnZva2VkQWN0aW9uXCIpO1xuXHRcdFx0aWYgKGxhc3RJbnZva2VkQWN0aW9uTmFtZSAmJiB0aGlzLmlzTmV3QWN0aW9uRm9yU3RpY2t5KGxhc3RJbnZva2VkQWN0aW9uTmFtZSwgY29udGV4dCkpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGl0TW9kZShFZGl0TW9kZS5FZGl0YWJsZSwgdHJ1ZSk7XG5cdFx0XHRcdGlmICghdGhpcy5nZXRBcHBDb21wb25lbnQoKS5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLmhhbmRsZVN0aWNreU9uKGNvbnRleHQpO1xuXHRcdFx0XHR0aGlzLmdldEludGVybmFsTW9kZWwoKS5zZXRQcm9wZXJ0eShcIi9sYXN0SW52b2tlZEFjdGlvblwiLCB1bmRlZmluZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdC8vIFByaXZhdGUgbWV0aG9kc1xuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cdC8qKlxuXHQgKiBJbnRlcm5hbCBtZXRob2QgdG8gZGVsZXRlIGEgY29udGV4dCBvciBhbiBhcnJheSBvZiBjb250ZXh0cy5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRzIFRoZSBjb250ZXh0KHMpIHRvIGJlIGRlbGV0ZWRcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMgUGFyYW1ldGVycyBmb3IgZGVsZXRpb25cblx0ICovXG5cdHByaXZhdGUgYXN5bmMgZGVsZXRlRG9jdW1lbnRUcmFuc2FjdGlvbihjb250ZXh0czogQ29udGV4dCB8IENvbnRleHRbXSwgcGFyYW1ldGVyczogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwodGhpcyk7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLmdldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cblx0XHQvLyBUT0RPOiB0aGlzIHNldHRpbmcgYW5kIHJlbW92aW5nIG9mIGNvbnRleHRzIHNob3VsZG4ndCBiZSBpbiB0aGUgdHJhbnNhY3Rpb24gaGVscGVyIGF0IGFsbFxuXHRcdC8vIGZvciB0aGUgdGltZSBiZWluZyBJIGtlcHQgaXQgYW5kIHByb3ZpZGUgdGhlIGludGVybmFsIG1vZGVsIGNvbnRleHQgdG8gbm90IGJyZWFrIHNvbWV0aGluZ1xuXHRcdHBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgPSBwYXJhbWV0ZXJzLmNvbnRyb2xJZFxuXHRcdFx0PyBzYXAudWkuZ2V0Q29yZSgpLmJ5SWQocGFyYW1ldGVycy5jb250cm9sSWQpPy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpXG5cdFx0XHQ6IG51bGw7XG5cblx0XHRhd2FpdCB0aGlzLnN5bmNUYXNrKCk7XG5cdFx0YXdhaXQgdHJhbnNhY3Rpb25IZWxwZXIuZGVsZXRlRG9jdW1lbnQoY29udGV4dHMsIHBhcmFtZXRlcnMsIHRoaXMuZ2V0QXBwQ29tcG9uZW50KCksIHJlc291cmNlTW9kZWwsIHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKSk7XG5cdH1cblxuXHRfZ2V0UmVzb3VyY2VNb2RlbCgpOiBSZXNvdXJjZU1vZGVsIHtcblx0XHRyZXR1cm4gZ2V0UmVzb3VyY2VNb2RlbCh0aGlzLmdldFZpZXcoKSk7XG5cdH1cblxuXHRwcml2YXRlIGdldFRyYW5zYWN0aW9uSGVscGVyKCkge1xuXHRcdHJldHVybiBUcmFuc2FjdGlvbkhlbHBlcjtcblx0fVxuXG5cdHByaXZhdGUgZ2V0TWVzc2FnZUhhbmRsZXIoKSB7XG5cdFx0aWYgKHRoaXMuYmFzZS5tZXNzYWdlSGFuZGxlcikge1xuXHRcdFx0cmV0dXJuIHRoaXMuYmFzZS5tZXNzYWdlSGFuZGxlcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRWRpdCBGbG93IHdvcmtzIG9ubHkgd2l0aCBhIGdpdmVuIG1lc3NhZ2UgaGFuZGxlclwiKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIGdldEludGVybmFsTW9kZWwoKTogSlNPTk1vZGVsIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdH1cblxuXHRwcml2YXRlIGdldEdsb2JhbFVJTW9kZWwoKTogSlNPTk1vZGVsIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKSBhcyBKU09OTW9kZWw7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGF0IHRoZSBjdXJyZW50IHBhZ2UgY29udGFpbnMgYSBuZXdseSBjcmVhdGVkIG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIGJDcmVhdGlvbk1vZGUgVHJ1ZSBpZiB0aGUgb2JqZWN0IGlzIG5ld1xuXHQgKi9cblx0cHJpdmF0ZSBzZXRDcmVhdGlvbk1vZGUoYkNyZWF0aW9uTW9kZTogYm9vbGVhbikge1xuXHRcdGNvbnN0IHVpTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJ1aVwiKSBhcyBDb250ZXh0O1xuXHRcdHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpLnNldFByb3BlcnR5KFwiY3JlYXRlTW9kZVwiLCBiQ3JlYXRpb25Nb2RlLCB1aU1vZGVsQ29udGV4dCwgdHJ1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGN1cnJlbnQgcGFnZSBjb250YWlucyBhIG5ld2x5IGNyZWF0ZWQgb2JqZWN0IG9yIG5vdC5cblx0ICpcblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgb2JqZWN0IGlzIG5ld1xuXHQgKi9cblx0cHJpdmF0ZSBnZXRDcmVhdGlvbk1vZGUoKTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgdWlNb2RlbENvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dChcInVpXCIpIGFzIENvbnRleHQ7XG5cdFx0cmV0dXJuICEhdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCkuZ2V0UHJvcGVydHkoXCJjcmVhdGVNb2RlXCIsIHVpTW9kZWxDb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGUgb2JqZWN0IGJlaW5nIGVkaXRlZCAob3Igb25lIG9mIGl0cyBzdWItb2JqZWN0cykgaGFzIGJlZW4gbW9kaWZpZWQgb3Igbm90LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBvYmplY3QgaGFzIGJlZW4gbW9kaWZpZWRcblx0ICovXG5cdHByaXZhdGUgaXNEb2N1bWVudE1vZGlmaWVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiAhIXRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpLmdldFByb3BlcnR5KFwiL2lzRG9jdW1lbnRNb2RpZmllZFwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoYXQgdGhlIG9iamVjdCBiZWluZyBlZGl0ZWQgKG9yIG9uZSBvZiBpdHMgc3ViLW9iamVjdHMpIGhhcyBiZWVuIG1vZGlmaWVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gbW9kaWZpZWQgVHJ1ZSBpZiB0aGUgb2JqZWN0IGhhcyBiZWVuIG1vZGlmaWVkXG5cdCAqL1xuXHRwcml2YXRlIHNldERvY3VtZW50TW9kaWZpZWQobW9kaWZpZWQ6IGJvb2xlYW4pIHtcblx0XHR0aGlzLmdldEdsb2JhbFVJTW9kZWwoKS5zZXRQcm9wZXJ0eShcIi9pc0RvY3VtZW50TW9kaWZpZWRcIiwgbW9kaWZpZWQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhhdCB0aGUgb2JqZWN0IGJlaW5nIGVkaXRlZCBoYXMgYmVlbiBtb2RpZmllZCBieSBjcmVhdGluZyBhIHN1Yi1vYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBsaXN0QmluZGluZyBUaGUgbGlzdCBiaW5kaW5nIG9uIHdoaWNoIHRoZSBvYmplY3QgaGFzIGJlZW4gY3JlYXRlZFxuXHQgKi9cblx0cHJpdmF0ZSBzZXREb2N1bWVudE1vZGlmaWVkT25DcmVhdGUobGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcpIHtcblx0XHQvLyBTZXQgdGhlIG1vZGlmaWVkIGZsYWcgb25seSBvbiByZWxhdGl2ZSBsaXN0QmluZGluZ3MsIGkuZS4gd2hlbiBjcmVhdGluZyBhIHN1Yi1vYmplY3Rcblx0XHQvLyBJZiB0aGUgbGlzdEJpbmRpbmcgaXMgbm90IHJlbGF0aXZlLCB0aGVuIGl0J3MgYSBjcmVhdGlvbiBmcm9tIHRoZSBMaXN0UmVwb3J0LCBhbmQgYnkgZGVmYXVsdCBhIG5ld2x5IGNyZWF0ZWQgcm9vdCBvYmplY3QgaXNuJ3QgY29uc2lkZXJlZCBhcyBtb2RpZmllZFxuXHRcdGlmIChsaXN0QmluZGluZy5pc1JlbGF0aXZlKCkpIHtcblx0XHRcdHRoaXMuc2V0RG9jdW1lbnRNb2RpZmllZCh0cnVlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyB0aGUgY3JlYXRlIGV2ZW50OiBzaG93cyBtZXNzYWdlcyBhbmQgaW4gY2FzZSBvZiBhIGRyYWZ0LCB1cGRhdGVzIHRoZSBkcmFmdCBpbmRpY2F0b3IuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gYmluZGluZyBPRGF0YSBsaXN0IGJpbmRpbmcgb2JqZWN0XG5cdCAqL1xuXHRwcml2YXRlIGhhbmRsZUNyZWF0ZUV2ZW50cyhiaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nKSB7XG5cdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cblx0XHRjb25zdCBwcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKGJpbmRpbmcpO1xuXG5cdFx0YmluZGluZy5hdHRhY2hFdmVudChcImNyZWF0ZVNlbnRcIiwgKCkgPT4ge1xuXHRcdFx0aWYgKHByb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQpIHtcblx0XHRcdFx0dGhpcy5zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5TYXZpbmcpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGJpbmRpbmcuYXR0YWNoRXZlbnQoXCJjcmVhdGVDb21wbGV0ZWRcIiwgKG9FdmVudDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBzdWNjZXNzID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInN1Y2Nlc3NcIik7XG5cdFx0XHRpZiAocHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKHN1Y2Nlc3MgPyBEcmFmdFN0YXR1cy5TYXZlZCA6IERyYWZ0U3RhdHVzLkNsZWFyKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGRyYWZ0IHN0YXR1cyBtZXNzYWdlIChkaXNwbGF5ZWQgYXQgdGhlIGJvdHRvbSBvZiB0aGUgcGFnZSkuXG5cdCAqXG5cdCAqIEBwYXJhbSBkcmFmdFN0YXR1cyBUaGUgZHJhZnQgc3RhdHVzIG1lc3NhZ2Vcblx0ICovXG5cdHNldERyYWZ0U3RhdHVzKGRyYWZ0U3RhdHVzOiBzdHJpbmcpIHtcblx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKSBhcyBKU09OTW9kZWwpLnNldFByb3BlcnR5KFwiL2RyYWZ0U3RhdHVzXCIsIGRyYWZ0U3RhdHVzLCB1bmRlZmluZWQsIHRydWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHByb2dyYW1taW5nIG1vZGVsIGZyb20gYSBiaW5kaW5nIG9yIGEgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIHNvdXJjZSBUaGUgYmluZGluZyBvciBjb250ZXh0XG5cdCAqIEByZXR1cm5zIFRoZSBwcm9ncmFtbWluZyBtb2RlbFxuXHQgKi9cblx0cHJpdmF0ZSBnZXRQcm9ncmFtbWluZ01vZGVsKHNvdXJjZTogQ29udGV4dCB8IEJpbmRpbmcpOiB0eXBlb2YgUHJvZ3JhbW1pbmdNb2RlbCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKS5nZXRQcm9ncmFtbWluZ01vZGVsKHNvdXJjZSk7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgZWRpdCBtb2RlLlxuXHQgKlxuXHQgKiBAcGFyYW0gZWRpdE1vZGUgVGhlIGVkaXQgbW9kZVxuXHQgKiBAcGFyYW0gaXNDcmVhdGlvbiBUcnVlIGlmIHRoZSBvYmplY3QgaGFzIGJlZW4gbmV3bHkgY3JlYXRlZFxuXHQgKi9cblx0cHJpdmF0ZSBzZXRFZGl0TW9kZShlZGl0TW9kZT86IHN0cmluZywgaXNDcmVhdGlvbj86IGJvb2xlYW4pIHtcblx0XHQvLyBhdCB0aGlzIHBvaW50IG9mIHRpbWUgaXQncyBub3QgbWVhbnQgdG8gcmVsZWFzZSB0aGUgZWRpdCBmbG93IGZvciBmcmVlc3R5bGUgdXNhZ2UgdGhlcmVmb3JlIHdlIGNhblxuXHRcdC8vIHJlbHkgb24gdGhlIGdsb2JhbCBVSSBtb2RlbCB0byBleGlzdFxuXHRcdGNvbnN0IGdsb2JhbE1vZGVsID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cblx0XHRpZiAoZWRpdE1vZGUpIHtcblx0XHRcdGdsb2JhbE1vZGVsLnNldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIiwgZWRpdE1vZGUgPT09IFwiRWRpdGFibGVcIiwgdW5kZWZpbmVkLCB0cnVlKTtcblx0XHR9XG5cblx0XHRpZiAoaXNDcmVhdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBTaW5jZSBzZXRDcmVhdGlvbk1vZGUgaXMgcHVibGljIGluIEVkaXRGbG93IGFuZCBjYW4gYmUgb3ZlcnJpZGVuLCBtYWtlIHN1cmUgdG8gY2FsbCBpdCB2aWEgdGhlIGNvbnRyb2xsZXJcblx0XHRcdC8vIHRvIGVuc3VyZSBhbnkgb3ZlcnJpZGVzIGFyZSB0YWtlbiBpbnRvIGFjY291bnRcblx0XHRcdHRoaXMuc2V0Q3JlYXRpb25Nb2RlKGlzQ3JlYXRpb24pO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYW4gYWN0aW9uIGNvcnJlc3BvbmRzIHRvIGEgY3JlYXRlIGFjdGlvbiBmb3IgYSBzdGlja3kgc2Vzc2lvbi5cblx0ICpcblx0ICogQHBhcmFtIGFjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0IGZvciB0aGUgc3RpY2t5IHNlc3Npb25cblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgYWN0aW9uIGlzIGEgY3JlYXRlIGFjdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBpc05ld0FjdGlvbkZvclN0aWNreShhY3Rpb25OYW1lOiBzdHJpbmcsIGNvbnRleHQ6IENvbnRleHQpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gY29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0Y29uc3QgbWV0YUNvbnRleHQgPSBtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQoY29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0Y29uc3QgZW50aXR5U2V0ID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFDb250ZXh0KS5zdGFydGluZ0VudGl0eVNldCBhcyBFbnRpdHlTZXQ7XG5cdFx0XHRjb25zdCBzdGlja3lTZXNzaW9uID0gZW50aXR5U2V0LmFubm90YXRpb25zLlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQ7XG5cdFx0XHRpZiAoc3RpY2t5U2Vzc2lvbj8uTmV3QWN0aW9uID09PSBhY3Rpb25OYW1lKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHN0aWNreVNlc3Npb24/LkFkZGl0aW9uYWxOZXdBY3Rpb25zICYmIHN0aWNreVNlc3Npb24/LkFkZGl0aW9uYWxOZXdBY3Rpb25zLmluZGV4T2YoYWN0aW9uTmFtZSkgIT09IC0xKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdExvZy5pbmZvKGVycm9yIGFzIGFueSk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0Ly8gVE9ETyBNb3ZlIGFsbCBzdGlja3ktcmVsYXRlZCBiZWxvdyB0byBhIHN0aWNreSBzZXNzaW9uIG1hbmFnZXIgY2xhc3NcblxuXHQvKipcblx0ICogRW5hYmxlcyB0aGUgc3RpY2t5IGVkaXQgc2Vzc2lvbi5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGNvbnRleHQgYmVpbmcgZWRpdGVkXG5cdCAqIEByZXR1cm5zIFRydWUgaW4gY2FzZSBvZiBzdWNjZXNzLCBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdHByaXZhdGUgaGFuZGxlU3RpY2t5T24oY29udGV4dDogQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKGFwcENvbXBvbmVudCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBBcHBDb21wb25lbnQgZm9yIGZ1bmN0aW9uIGhhbmRsZVN0aWNreU9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWFwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmhhc05hdmlnYXRpb25HdWFyZCgpKSB7XG5cdFx0XHRcdGNvbnN0IGhhc2hUcmFja2VyID0gYXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuZ2V0SGFzaCgpO1xuXHRcdFx0XHRjb25zdCBpbnRlcm5hbE1vZGVsID0gdGhpcy5nZXRJbnRlcm5hbE1vZGVsKCk7XG5cblx0XHRcdFx0Ly8gU2V0IGEgZ3VhcmQgaW4gdGhlIFJvdXRlclByb3h5XG5cdFx0XHRcdC8vIEEgdGltZW91dCBpcyBuZWNlc3NhcnksIGFzIHdpdGggZGVmZXJyZWQgY3JlYXRpb24gdGhlIGhhc2hDaGFuZ2VyIGlzIG5vdCB1cGRhdGVkIHlldCB3aXRoXG5cdFx0XHRcdC8vIHRoZSBuZXcgaGFzaCwgYW5kIHRoZSBndWFyZCBjYW5ub3QgYmUgZm91bmQgaW4gdGhlIG1hbmFnZWQgaGlzdG9yeSBvZiB0aGUgcm91dGVyIHByb3h5XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGFwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLnNldE5hdmlnYXRpb25HdWFyZChjb250ZXh0LmdldFBhdGgoKS5zdWJzdHJpbmcoMSkpO1xuXHRcdFx0XHR9LCAwKTtcblxuXHRcdFx0XHQvLyBTZXR0aW5nIGJhY2sgbmF2aWdhdGlvbiBvbiBzaGVsbCBzZXJ2aWNlLCB0byBnZXQgdGhlIGRpY2FyZCBtZXNzYWdlIGJveCBpbiBjYXNlIG9mIHN0aWNreVxuXHRcdFx0XHRhcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKHRoaXMub25CYWNrTmF2aWdhdGlvbkluU2Vzc2lvbi5iaW5kKHRoaXMpKTtcblxuXHRcdFx0XHR0aGlzLmRpcnR5U3RhdGVQcm92aWRlckZ1bmN0aW9uID0gdGhpcy5nZXREaXJ0eVN0YXRlUHJvdmlkZXIoYXBwQ29tcG9uZW50LCBpbnRlcm5hbE1vZGVsLCBoYXNoVHJhY2tlcik7XG5cdFx0XHRcdGFwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkucmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIodGhpcy5kaXJ0eVN0YXRlUHJvdmlkZXJGdW5jdGlvbik7XG5cblx0XHRcdFx0Ly8gaGFuZGxlIHNlc3Npb24gdGltZW91dFxuXHRcdFx0XHRjb25zdCBpMThuTW9kZWwgPSB0aGlzLmJhc2UuZ2V0VmlldygpLmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIik7XG5cdFx0XHRcdHRoaXMuc2Vzc2lvblRpbWVvdXRGdW5jdGlvbiA9IHRoaXMuZ2V0U2Vzc2lvblRpbWVvdXRGdW5jdGlvbihjb250ZXh0LCBpMThuTW9kZWwpO1xuXHRcdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoKSBhcyBhbnkpLmF0dGFjaFNlc3Npb25UaW1lb3V0KHRoaXMuc2Vzc2lvblRpbWVvdXRGdW5jdGlvbik7XG5cblx0XHRcdFx0dGhpcy5zdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uRnVuY3Rpb24gPSB0aGlzLmdldFJvdXRlTWF0Y2hlZEZ1bmN0aW9uKGNvbnRleHQsIGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdGFwcENvbXBvbmVudC5nZXRSb3V0aW5nU2VydmljZSgpLmF0dGFjaFJvdXRlTWF0Y2hlZCh0aGlzLnN0aWNreURpc2NhcmRBZnRlck5hdmlnYXRpb25GdW5jdGlvbik7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdExvZy5pbmZvKGVycm9yIGFzIGFueSk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogRGlzYWJsZXMgdGhlIHN0aWNreSBlZGl0IHNlc3Npb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRydWUgaW4gY2FzZSBvZiBzdWNjZXNzLCBmYWxzZSBvdGhlcndpc2Vcblx0ICovXG5cdHByaXZhdGUgaGFuZGxlU3RpY2t5T2ZmKCk6IGJvb2xlYW4ge1xuXHRcdGNvbnN0IGFwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0dHJ5IHtcblx0XHRcdGlmIChhcHBDb21wb25lbnQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJ1bmRlZmluZWQgQXBwQ29tcG9uZW50IGZvciBmdW5jdGlvbiBoYW5kbGVTdGlja3lPZmZcIik7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkpIHtcblx0XHRcdFx0Ly8gSWYgd2UgaGF2ZSBleGl0ZWQgZnJvbSB0aGUgYXBwLCBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQgZG9lc24ndCByZXR1cm4gYVxuXHRcdFx0XHQvLyBzYXAuZmUuY29yZS5BcHBDb21wb25lbnQsIGhlbmNlIHRoZSAnaWYnIGFib3ZlXG5cdFx0XHRcdGFwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmRpc2NhcmROYXZpZ2F0aW9uR3VhcmQoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuZGlydHlTdGF0ZVByb3ZpZGVyRnVuY3Rpb24pIHtcblx0XHRcdFx0YXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5kZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKHRoaXMuZGlydHlTdGF0ZVByb3ZpZGVyRnVuY3Rpb24pO1xuXHRcdFx0XHR0aGlzLmRpcnR5U3RhdGVQcm92aWRlckZ1bmN0aW9uID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBtb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbDtcblx0XHRcdGlmIChtb2RlbCAmJiB0aGlzLnNlc3Npb25UaW1lb3V0RnVuY3Rpb24pIHtcblx0XHRcdFx0bW9kZWwuZGV0YWNoU2Vzc2lvblRpbWVvdXQodGhpcy5zZXNzaW9uVGltZW91dEZ1bmN0aW9uKTtcblx0XHRcdH1cblxuXHRcdFx0YXBwQ29tcG9uZW50LmdldFJvdXRpbmdTZXJ2aWNlKCkuZGV0YWNoUm91dGVNYXRjaGVkKHRoaXMuc3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbkZ1bmN0aW9uKTtcblx0XHRcdHRoaXMuc3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbkZ1bmN0aW9uID0gdW5kZWZpbmVkO1xuXG5cdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkRpc3BsYXksIGZhbHNlKTtcblxuXHRcdFx0aWYgKGFwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKSB7XG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgZXhpdGVkIGZyb20gdGhlIGFwcCwgQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50IGRvZXNuJ3QgcmV0dXJuIGFcblx0XHRcdFx0Ly8gc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50LCBoZW5jZSB0aGUgJ2lmJyBhYm92ZVxuXHRcdFx0XHRhcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdExvZy5pbmZvKGVycm9yIGFzIGFueSk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRfc2V0U3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyhwcm9ncmFtbWluZ01vZGVsOiBzdHJpbmcsIG1vZGVsOiBPRGF0YU1vZGVsKSB7XG5cdFx0aWYgKHByb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRjb25zdCBpbnRlcm5hbE1vZGVsID0gdGhpcy5nZXRJbnRlcm5hbE1vZGVsKCk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3Nlc3Npb25PblwiLCB0cnVlKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvc3RpY2t5U2Vzc2lvblRva2VuXCIsIChtb2RlbC5nZXRIdHRwSGVhZGVycyh0cnVlKSBhcyBhbnkpW1wiU0FQLUNvbnRleHRJZFwiXSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSB1c2VkIGFzIGEgRGlydHlTdGF0ZVByb3ZpZGVyIGluIHRoZSBTaGVsbC5cblx0ICpcblx0ICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgYXBwIGNvbXBvbmVudFxuXHQgKiBAcGFyYW0gaW50ZXJuYWxNb2RlbCBUaGUgbW9kZWwgXCJpbnRlcm5hbFwiXG5cdCAqIEBwYXJhbSBoYXNoVHJhY2tlciBIYXNoIHRyYWNrZXJcblx0ICogQHJldHVybnMgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGdldERpcnR5U3RhdGVQcm92aWRlcihhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgaW50ZXJuYWxNb2RlbDogSlNPTk1vZGVsLCBoYXNoVHJhY2tlcjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIChuYXZpZ2F0aW9uQ29udGV4dDogYW55KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAobmF2aWdhdGlvbkNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5wdXQgcGFyYW1ldGVycyBmb3IgRGlydHlTdGF0ZVByb3ZpZGVyIGZ1bmN0aW9uXCIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgdGFyZ2V0SGFzaCA9IG5hdmlnYXRpb25Db250ZXh0LmlubmVyQXBwUm91dGU7XG5cdFx0XHRcdGNvbnN0IHJvdXRlclByb3h5ID0gYXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCk7XG5cdFx0XHRcdGxldCBsY2xIYXNoVHJhY2tlciA9IFwiXCI7XG5cdFx0XHRcdGxldCBpc0RpcnR5OiBib29sZWFuO1xuXHRcdFx0XHRjb25zdCBpc1Nlc3Npb25PbiA9IGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoXCIvc2Vzc2lvbk9uXCIpO1xuXG5cdFx0XHRcdGlmICghaXNTZXNzaW9uT24pIHtcblx0XHRcdFx0XHQvLyBJZiB0aGUgc3RpY2t5IHNlc3Npb24gd2FzIHRlcm1pbmF0ZWQgYmVmb3JlIGhhbmQuXG5cdFx0XHRcdFx0Ly8gRXhhbXBsZSBpbiBjYXNlIG9mIG5hdmlnYXRpbmcgYXdheSBmcm9tIGFwcGxpY2F0aW9uIHVzaW5nIElCTi5cblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCFyb3V0ZXJQcm94eS5pc05hdmlnYXRpb25GaW5hbGl6ZWQoKSkge1xuXHRcdFx0XHRcdC8vIElmIG5hdmlnYXRpb24gaXMgY3VycmVudGx5IGhhcHBlbmluZyBpbiBSb3V0ZXJQcm94eSwgaXQncyBhIHRyYW5zaWVudCBzdGF0ZVxuXHRcdFx0XHRcdC8vIChub3QgZGlydHkpXG5cdFx0XHRcdFx0aXNEaXJ0eSA9IGZhbHNlO1xuXHRcdFx0XHRcdGxjbEhhc2hUcmFja2VyID0gdGFyZ2V0SGFzaDtcblx0XHRcdFx0fSBlbHNlIGlmIChoYXNoVHJhY2tlciA9PT0gdGFyZ2V0SGFzaCkge1xuXHRcdFx0XHRcdC8vIHRoZSBoYXNoIGRpZG4ndCBjaGFuZ2Ugc28gZWl0aGVyIHRoZSB1c2VyIGF0dGVtcHRzIHRvIHJlZnJlc2ggb3IgdG8gbGVhdmUgdGhlIGFwcFxuXHRcdFx0XHRcdGlzRGlydHkgPSB0cnVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHJvdXRlclByb3h5LmNoZWNrSGFzaFdpdGhHdWFyZCh0YXJnZXRIYXNoKSB8fCByb3V0ZXJQcm94eS5pc0d1YXJkQ3Jvc3NBbGxvd2VkQnlVc2VyKCkpIHtcblx0XHRcdFx0XHQvLyB0aGUgdXNlciBhdHRlbXB0cyB0byBuYXZpZ2F0ZSB3aXRoaW4gdGhlIHJvb3Qgb2JqZWN0XG5cdFx0XHRcdFx0Ly8gb3IgY3Jvc3NpbmcgdGhlIGd1YXJkIGhhcyBhbHJlYWR5IGJlZW4gYWxsb3dlZCBieSB0aGUgUm91dGVyUHJveHlcblx0XHRcdFx0XHRsY2xIYXNoVHJhY2tlciA9IHRhcmdldEhhc2g7XG5cdFx0XHRcdFx0aXNEaXJ0eSA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHRoZSB1c2VyIGF0dGVtcHRzIHRvIG5hdmlnYXRlIHdpdGhpbiB0aGUgYXBwLCBmb3IgZXhhbXBsZSBiYWNrIHRvIHRoZSBsaXN0IHJlcG9ydFxuXHRcdFx0XHRcdGlzRGlydHkgPSB0cnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGlzRGlydHkpIHtcblx0XHRcdFx0XHQvLyB0aGUgRkxQIGRvZXNuJ3QgY2FsbCB0aGUgZGlydHkgc3RhdGUgcHJvdmlkZXIgYW55bW9yZSBvbmNlIGl0J3MgZGlydHksIGFzIHRoZXkgY2FuJ3Rcblx0XHRcdFx0XHQvLyBjaGFuZ2UgdGhpcyBkdWUgdG8gY29tcGF0aWJpbGl0eSByZWFzb25zIHdlIHNldCBpdCBiYWNrIHRvIG5vdC1kaXJ0eVxuXHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0YXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXREaXJ0eUZsYWcoZmFsc2UpO1xuXHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGhhc2hUcmFja2VyID0gbGNsSGFzaFRyYWNrZXI7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gaXNEaXJ0eTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdExvZy5pbmZvKGVycm9yIGFzIGFueSk7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdXNlZCB3aGVuIGEgc3RpY2t5IHNlc3Npb24gdGltZXMgb3V0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc3RpY2t5Q29udGV4dCBUaGUgY29udGV4dCBmb3IgdGhlIHN0aWNreSBzZXNzaW9uXG5cdCAqIEBwYXJhbSBpMThuTW9kZWxcblx0ICogQHJldHVybnMgVGhlIGNhbGxiYWNrIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGdldFNlc3Npb25UaW1lb3V0RnVuY3Rpb24oc3RpY2t5Q29udGV4dDogQ29udGV4dCwgaTE4bk1vZGVsOiBNb2RlbCkge1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoc3RpY2t5Q29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ29udGV4dCBtaXNzaW5nIGZvciBTZXNzaW9uVGltZW91dCBmdW5jdGlvblwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyByZW1vdmUgdHJhbnNpZW50IG1lc3NhZ2VzIHNpbmNlIHdlIHdpbGwgc2hvd2luZyBvdXIgb3duIG1lc3NhZ2Vcblx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXG5cdFx0XHRcdGNvbnN0IHdhcm5pbmdEaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdFx0XHR0aXRsZTogXCJ7c2FwLmZlLmkxOG4+Q19FRElURkxPV19PQkpFQ1RfUEFHRV9TRVNTSU9OX0VYUElSRURfRElBTE9HX1RJVExFfVwiLFxuXHRcdFx0XHRcdHN0YXRlOiBcIldhcm5pbmdcIixcblx0XHRcdFx0XHRjb250ZW50OiBuZXcgVGV4dCh7IHRleHQ6IFwie3NhcC5mZS5pMThuPkNfRURJVEZMT1dfT0JKRUNUX1BBR0VfU0VTU0lPTl9FWFBJUkVEX0RJQUxPR19NRVNTQUdFfVwiIH0pLFxuXHRcdFx0XHRcdGJlZ2luQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0XHRcdHRleHQ6IFwie3NhcC5mZS5pMThuPkNfQ09NTU9OX0RJQUxPR19PS31cIixcblx0XHRcdFx0XHRcdHR5cGU6IFwiRW1waGFzaXplZFwiLFxuXHRcdFx0XHRcdFx0cHJlc3M6ICgpID0+IHtcblx0XHRcdFx0XHRcdFx0Ly8gcmVtb3ZlIHN0aWNreSBoYW5kbGluZyBhZnRlciBuYXZpZ2F0aW9uIHNpbmNlIHNlc3Npb24gaGFzIGFscmVhZHkgYmVlbiB0ZXJtaW5hdGVkXG5cdFx0XHRcdFx0XHRcdHRoaXMuaGFuZGxlU3RpY2t5T2ZmKCk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuZ2V0SW50ZXJuYWxSb3V0aW5nKCkubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQoc3RpY2t5Q29udGV4dCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0d2FybmluZ0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0d2FybmluZ0RpYWxvZy5hZGRTdHlsZUNsYXNzKFwic2FwVWlDb250ZW50UGFkZGluZ1wiKTtcblx0XHRcdFx0d2FybmluZ0RpYWxvZy5zZXRNb2RlbChpMThuTW9kZWwsIFwic2FwLmZlLmkxOG5cIik7XG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpLmFkZERlcGVuZGVudCh3YXJuaW5nRGlhbG9nKTtcblx0XHRcdFx0d2FybmluZ0RpYWxvZy5vcGVuKCk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRMb2cuaW5mbyhlcnJvciBhcyBhbnkpO1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIHRoZSBvblJvdXRlTWF0Y2hlZCBldmVudCBpbiBjYXNlIG9mIHN0aWNreSBlZGl0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dCBUaGUgY29udGV4dCBiZWluZyBlZGl0ZWQgKHJvb3Qgb2YgdGhlIHN0aWNreSBzZXNzaW9uKVxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBhcHAgY29tcG9uZW50XG5cdCAqIEByZXR1cm5zIFRoZSBjYWxsYmFjayBmdW5jdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBnZXRSb3V0ZU1hdGNoZWRGdW5jdGlvbihjb250ZXh0OiBDb250ZXh0LCBhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCkge1xuXHRcdHJldHVybiAoKSA9PiB7XG5cdFx0XHRjb25zdCBjdXJyZW50SGFzaCA9IGFwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmdldEhhc2goKTtcblx0XHRcdC8vIGVpdGhlciBjdXJyZW50IGhhc2ggaXMgZW1wdHkgc28gdGhlIHVzZXIgbGVmdCB0aGUgYXBwIG9yIGhlIG5hdmlnYXRlZCBhd2F5IGZyb20gdGhlIG9iamVjdFxuXHRcdFx0aWYgKCFjdXJyZW50SGFzaCB8fCAhYXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuY2hlY2tIYXNoV2l0aEd1YXJkKGN1cnJlbnRIYXNoKSkge1xuXHRcdFx0XHR0aGlzLmRpc2NhcmRTdGlja3lTZXNzaW9uKGNvbnRleHQpO1xuXHRcdFx0XHRjb250ZXh0LmdldE1vZGVsKCkuY2xlYXJTZXNzaW9uQ29udGV4dCgpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogRW5kcyBhIHN0aWNreSBzZXNzaW9uIGJ5IGRpc2NhcmRpbmcgY2hhbmdlcy5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHQgVGhlIGNvbnRleHQgYmVpbmcgZWRpdGVkIChyb290IG9mIHRoZSBzdGlja3kgc2Vzc2lvbilcblx0ICovXG5cdHByaXZhdGUgYXN5bmMgZGlzY2FyZFN0aWNreVNlc3Npb24oY29udGV4dDogQ29udGV4dCkge1xuXHRcdGNvbnN0IGRpc2NhcmRlZENvbnRleHQgPSBhd2FpdCBzdGlja3kuZGlzY2FyZERvY3VtZW50KGNvbnRleHQpO1xuXHRcdGlmIChkaXNjYXJkZWRDb250ZXh0Py5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRkaXNjYXJkZWRDb250ZXh0LmdldEJpbmRpbmcoKS5yZXNldENoYW5nZXMoKTtcblx0XHR9XG5cdFx0aWYgKCF0aGlzLmdldENyZWF0aW9uTW9kZSgpKSB7XG5cdFx0XHRkaXNjYXJkZWRDb250ZXh0Py5yZWZyZXNoKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5oYW5kbGVTdGlja3lPZmYoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBpbnRlcm5hbCByb3V0aW5nIGV4dGVuc2lvbi5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGludGVybmFsIHJvdXRpbmcgZXh0ZW5zaW9uXG5cdCAqL1xuXHRwcml2YXRlIGdldEludGVybmFsUm91dGluZygpOiBJbnRlcm5hbFJvdXRpbmcge1xuXHRcdGlmICh0aGlzLmJhc2UuX3JvdXRpbmcpIHtcblx0XHRcdHJldHVybiB0aGlzLmJhc2UuX3JvdXRpbmc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkVkaXQgRmxvdyB3b3JrcyBvbmx5IHdpdGggYSBnaXZlbiByb3V0aW5nIGxpc3RlbmVyXCIpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRSb290Vmlld0NvbnRyb2xsZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCk7XG5cdH1cblxuXHRfZ2V0U2VtYW50aWNNYXBwaW5nKCk6IFNlbWFudGljTWFwcGluZyB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGluZ1NlcnZpY2UoKS5nZXRMYXN0U2VtYW50aWNNYXBwaW5nKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBwcm9taXNlIHRvIHdhaXQgZm9yIGFuIGFjdGlvbiB0byBiZSBleGVjdXRlZC5cblx0ICpcblx0ICogQHBhcmFtIGFjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gY29udHJvbElkIFRoZSBJRCBvZiB0aGUgY29udHJvbFxuXHQgKiBAcmV0dXJucyB7RnVuY3Rpb259IFRoZSByZXNvbHZlciBmdW5jdGlvbiB3aGljaCBjYW4gYmUgdXNlZCB0byBleHRlcm5hbGx5IHJlc29sdmUgdGhlIHByb21pc2Vcblx0ICovXG5cdHByaXZhdGUgY3JlYXRlQWN0aW9uUHJvbWlzZShhY3Rpb25OYW1lOiBzdHJpbmcsIGNvbnRyb2xJZDogc3RyaW5nKSB7XG5cdFx0bGV0IHJlc29sdmVGdW5jdGlvbiwgcmVqZWN0RnVuY3Rpb247XG5cdFx0dGhpcy5hY3Rpb25Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0cmVzb2x2ZUZ1bmN0aW9uID0gcmVzb2x2ZTtcblx0XHRcdHJlamVjdEZ1bmN0aW9uID0gcmVqZWN0O1xuXHRcdH0pLnRoZW4oKG9SZXNwb25zZTogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gT2JqZWN0LmFzc2lnbih7IGNvbnRyb2xJZCB9LCB0aGlzLmdldEFjdGlvblJlc3BvbnNlRGF0YUFuZEtleXMoYWN0aW9uTmFtZSwgb1Jlc3BvbnNlKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHsgZlJlc29sdmVyOiByZXNvbHZlRnVuY3Rpb24sIGZSZWplY3RvcjogcmVqZWN0RnVuY3Rpb24gfTtcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gYWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uIHRoYXQgaXMgZXhlY3V0ZWRcblx0ICogQHBhcmFtIHJlc3BvbnNlIFRoZSBib3VuZCBhY3Rpb24ncyByZXNwb25zZSBkYXRhIG9yIHJlc3BvbnNlIGNvbnRleHRcblx0ICogQHJldHVybnMgT2JqZWN0IHdpdGggZGF0YSBhbmQgbmFtZXMgb2YgdGhlIGtleSBmaWVsZHMgb2YgdGhlIHJlc3BvbnNlXG5cdCAqL1xuXHRwcml2YXRlIGdldEFjdGlvblJlc3BvbnNlRGF0YUFuZEtleXMoYWN0aW9uTmFtZTogc3RyaW5nLCByZXNwb25zZTogYW55KSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkocmVzcG9uc2UpKSB7XG5cdFx0XHRpZiAocmVzcG9uc2UubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHJlc3BvbnNlID0gcmVzcG9uc2VbMF0udmFsdWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCFyZXNwb25zZSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGNvbnN0IGN1cnJlbnRWaWV3ID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHRjb25zdCBtZXRhTW9kZWxEYXRhID0gKGN1cnJlbnRWaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgYW55KS5nZXREYXRhKCk7XG5cdFx0Y29uc3QgYWN0aW9uUmV0dXJuVHlwZSA9XG5cdFx0XHRtZXRhTW9kZWxEYXRhICYmIG1ldGFNb2RlbERhdGFbYWN0aW9uTmFtZV0gJiYgbWV0YU1vZGVsRGF0YVthY3Rpb25OYW1lXVswXSAmJiBtZXRhTW9kZWxEYXRhW2FjdGlvbk5hbWVdWzBdLiRSZXR1cm5UeXBlXG5cdFx0XHRcdD8gbWV0YU1vZGVsRGF0YVthY3Rpb25OYW1lXVswXS4kUmV0dXJuVHlwZS4kVHlwZVxuXHRcdFx0XHQ6IG51bGw7XG5cdFx0Y29uc3Qga2V5cyA9IGFjdGlvblJldHVyblR5cGUgJiYgbWV0YU1vZGVsRGF0YVthY3Rpb25SZXR1cm5UeXBlXSA/IG1ldGFNb2RlbERhdGFbYWN0aW9uUmV0dXJuVHlwZV0uJEtleSA6IG51bGw7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0b0RhdGE6IHJlc3BvbnNlLmdldE9iamVjdCgpLFxuXHRcdFx0a2V5c1xuXHRcdH07XG5cdH1cblxuXHRnZXRDdXJyZW50QWN0aW9uUHJvbWlzZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5hY3Rpb25Qcm9taXNlO1xuXHR9XG5cblx0ZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UoKSB7XG5cdFx0dGhpcy5hY3Rpb25Qcm9taXNlID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0X3Njcm9sbEFuZEZvY3VzT25JbmFjdGl2ZVJvdyh0YWJsZTogVGFibGUpIHtcblx0XHRjb25zdCByb3dCaW5kaW5nID0gdGFibGUuZ2V0Um93QmluZGluZygpIGFzIE9EYXRhTGlzdEJpbmRpbmc7XG5cdFx0Y29uc3QgYWN0aXZlUm93SW5kZXg6IG51bWJlciA9IHJvd0JpbmRpbmcuZ2V0Q291bnQoKSB8fCAwO1xuXHRcdGlmICh0YWJsZS5kYXRhKFwidGFibGVUeXBlXCIpICE9PSBcIlJlc3BvbnNpdmVUYWJsZVwiKSB7XG5cdFx0XHRpZiAoYWN0aXZlUm93SW5kZXggPiAwKSB7XG5cdFx0XHRcdHRhYmxlLnNjcm9sbFRvSW5kZXgoYWN0aXZlUm93SW5kZXggLSAxKTtcblx0XHRcdH1cblx0XHRcdHRhYmxlLmZvY3VzUm93KGFjdGl2ZVJvd0luZGV4LCB0cnVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0LyogSW4gYSByZXNwb25zaXZlIHRhYmxlLCB0aGUgZW1wdHkgcm93cyBhcHBlYXIgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgdGFibGUuIEJ1dCB3aGVuIHdlIGNyZWF0ZSBtb3JlLCB0aGV5IGFwcGVhciBiZWxvdyB0aGUgbmV3IGxpbmUuXG5cdFx0XHQgKiBTbyB3ZSBjaGVjayB0aGUgZmlyc3QgaW5hY3RpdmUgcm93IGZpcnN0LCB0aGVuIHdlIHNldCB0aGUgZm9jdXMgb24gaXQgd2hlbiB3ZSBwcmVzcyB0aGUgYnV0dG9uLlxuXHRcdFx0ICogVGhpcyBkb2Vzbid0IGltcGFjdCB0aGUgR3JpZFRhYmxlIGJlY2F1c2UgdGhleSBhcHBlYXIgYXQgdGhlIGVuZCwgYW5kIHdlIGFscmVhZHkgZm9jdXMgdGhlIGJlZm9yZS10aGUtbGFzdCByb3cgKGJlY2F1c2UgMiBlbXB0eSByb3dzIGV4aXN0KVxuXHRcdFx0ICovXG5cdFx0XHRjb25zdCBhbGxSb3dDb250ZXh0cyA9IHJvd0JpbmRpbmcuZ2V0Q29udGV4dHMoKTtcblx0XHRcdGlmICghYWxsUm93Q29udGV4dHM/Lmxlbmd0aCkge1xuXHRcdFx0XHR0YWJsZS5mb2N1c1JvdyhhY3RpdmVSb3dJbmRleCwgdHJ1ZSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGxldCBmb2N1c1JvdyA9IGFjdGl2ZVJvd0luZGV4LFxuXHRcdFx0XHRpbmRleCA9IDA7XG5cdFx0XHRmb3IgKGNvbnN0IHNpbmdsZUNvbnRleHQgb2YgYWxsUm93Q29udGV4dHMpIHtcblx0XHRcdFx0aWYgKHNpbmdsZUNvbnRleHQuaXNJbmFjdGl2ZSgpICYmIGluZGV4IDwgZm9jdXNSb3cpIHtcblx0XHRcdFx0XHRmb2N1c1JvdyA9IGluZGV4O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGluZGV4Kys7XG5cdFx0XHR9XG5cdFx0XHRpZiAoZm9jdXNSb3cgPiAwKSB7XG5cdFx0XHRcdHRhYmxlLnNjcm9sbFRvSW5kZXgoZm9jdXNSb3cpO1xuXHRcdFx0fVxuXHRcdFx0dGFibGUuZm9jdXNSb3coZm9jdXNSb3csIHRydWUpO1xuXHRcdH1cblx0fVxuXHRhc3luYyBjcmVhdGVFbXB0eVJvd3NBbmRGb2N1cyh0YWJsZTogVGFibGUpIHtcblx0XHRjb25zdCB0YWJsZUFQSSA9IHRhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJO1xuXHRcdGlmIChcblx0XHRcdHRhYmxlQVBJPy50YWJsZURlZmluaXRpb24/LmNvbnRyb2w/LmlubGluZUNyZWF0aW9uUm93c0hpZGRlbkluRWRpdE1vZGUgJiZcblx0XHRcdCF0YWJsZS5nZXRCaW5kaW5nQ29udGV4dChcInVpXCIpPy5nZXRQcm9wZXJ0eShcImNyZWF0ZU1vZGVcIilcblx0XHQpIHtcblx0XHRcdC8vIFdpdGggdGhlIHBhcmFtZXRlciwgd2UgZG9uJ3QgaGF2ZSBlbXB0eSByb3dzIGluIEVkaXQgbW9kZSwgc28gd2UgbmVlZCB0byBjcmVhdGUgdGhlbSBiZWZvcmUgc2V0dGluZyB0aGUgZm9jdXMgb24gdGhlbVxuXHRcdFx0YXdhaXQgdGFibGVBUEkuc2V0VXBFbXB0eVJvd3ModGFibGUsIHRydWUpO1xuXHRcdH1cblx0XHR0aGlzLl9zY3JvbGxBbmRGb2N1c09uSW5hY3RpdmVSb3codGFibGUpO1xuXHR9XG5cblx0X3NlbmRBY3Rpdml0eShcblx0XHRhY3Rpb246IEFjdGl2aXR5LFxuXHRcdHJlbGF0ZWRDb250ZXh0czogQ29udGV4dCB8IENvbnRleHRbXSB8IHVuZGVmaW5lZCxcblx0XHRhY3Rpb25OYW1lPzogc3RyaW5nLFxuXHRcdHJlZnJlc2hMaXN0QmluZGluZz86IGJvb2xlYW4sXG5cdFx0YWN0aW9uUmVxdWVzdGVkUHJvcGVydGllcz86IHN0cmluZ1tdXG5cdCkge1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBBcnJheS5pc0FycmF5KHJlbGF0ZWRDb250ZXh0cykgPyByZWxhdGVkQ29udGV4dHMubWFwKChjb250ZXh0KSA9PiBjb250ZXh0LmdldFBhdGgoKSkgOiByZWxhdGVkQ29udGV4dHM/LmdldFBhdGgoKTtcblx0XHRBY3Rpdml0eVN5bmMuc2VuZCh0aGlzLmdldFZpZXcoKSwgYWN0aW9uLCBjb250ZW50LCBhY3Rpb25OYW1lLCByZWZyZXNoTGlzdEJpbmRpbmcsIGFjdGlvblJlcXVlc3RlZFByb3BlcnRpZXMpO1xuXHR9XG5cblx0X3RyaWdnZXJDb25maWd1cmVkU3VydmV5KHNBY3Rpb25OYW1lOiBzdHJpbmcsIHRyaWdnZXJUeXBlOiBUcmlnZ2VyVHlwZSkge1xuXHRcdHRyaWdnZXJDb25maWd1cmVkU3VydmV5KHRoaXMuZ2V0VmlldygpLCBzQWN0aW9uTmFtZSwgdHJpZ2dlclR5cGUpO1xuXHR9XG5cblx0YXN5bmMgX3N1Ym1pdE9wZW5DaGFuZ2VzKG9Db250ZXh0OiBhbnkpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRvTG9ja09iamVjdCA9IHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdC8vIFN1Ym1pdCBhbnkgbGVmdG92ZXIgY2hhbmdlcyB0aGF0IGFyZSBub3QgeWV0IHN1Ym1pdHRlZFxuXHRcdFx0Ly8gQ3VycmVudGx5IHdlIGFyZSB1c2luZyBvbmx5IDEgdXBkYXRlR3JvdXBJZCwgaGVuY2Ugc3VibWl0dGluZyB0aGUgYmF0Y2ggZGlyZWN0bHkgaGVyZVxuXHRcdFx0YXdhaXQgb01vZGVsLnN1Ym1pdEJhdGNoKFwiJGF1dG9cIik7XG5cblx0XHRcdC8vIFdhaXQgZm9yIGFsbCBjdXJyZW50bHkgcnVubmluZyBjaGFuZ2VzXG5cdFx0XHQvLyBGb3IgdGhlIHRpbWUgYmVpbmcgd2UgYWdyZWVkIHdpdGggdGhlIHY0IG1vZGVsIHRlYW0gdG8gdXNlIGFuIGludGVybmFsIG1ldGhvZC4gV2UnbGwgcmVwbGFjZSBpdCBvbmNlXG5cdFx0XHQvLyBhIHB1YmxpYyBvciByZXN0cmljdGVkIG1ldGhvZCB3YXMgcHJvdmlkZWRcblx0XHRcdGF3YWl0IG9Nb2RlbC5vUmVxdWVzdG9yLndhaXRGb3JSdW5uaW5nQ2hhbmdlUmVxdWVzdHMoXCIkYXV0b1wiKTtcblxuXHRcdFx0Ly8gQ2hlY2sgaWYgYWxsIGNoYW5nZXMgd2VyZSBzdWJtaXR0ZWQgc3VjY2Vzc2Z1bGx5XG5cdFx0XHRpZiAob01vZGVsLmhhc1BlbmRpbmdDaGFuZ2VzKFwiJGF1dG9cIikpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwic3VibWl0IG9mIG9wZW4gY2hhbmdlcyBmYWlsZWRcIik7XG5cdFx0XHR9XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKG9Mb2NrT2JqZWN0KSkge1xuXHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvTG9ja09iamVjdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X3JlbW92ZVN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMocHJvZ3JhbW1pbmdNb2RlbDogc3RyaW5nKSB7XG5cdFx0aWYgKHByb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRjb25zdCBpbnRlcm5hbE1vZGVsID0gdGhpcy5nZXRJbnRlcm5hbE1vZGVsKCk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3Nlc3Npb25PblwiLCBmYWxzZSk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3N0aWNreVNlc3Npb25Ub2tlblwiLCB1bmRlZmluZWQpO1xuXHRcdFx0dGhpcy5oYW5kbGVTdGlja3lPZmYoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRpc3BsYXkgYSAnZGlzY2FyZCcgcG9wb3ZlciB3aGVuIGV4aXRpbmcgYSBzdGlja3kgc2Vzc2lvbi5cblx0ICovXG5cdHByaXZhdGUgb25CYWNrTmF2aWdhdGlvbkluU2Vzc2lvbigpIHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5iYXNlLmdldFZpZXcoKTtcblx0XHRjb25zdCByb3V0ZXJQcm94eSA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGVyUHJveHkoKTtcblxuXHRcdGlmIChyb3V0ZXJQcm94eS5jaGVja0lmQmFja0lzT3V0T2ZHdWFyZCgpKSB7XG5cdFx0XHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdFx0Y29uc3QgcHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChiaW5kaW5nQ29udGV4dCk7XG5cblx0XHRcdHN0aWNreS5wcm9jZXNzRGF0YUxvc3NDb25maXJtYXRpb24oXG5cdFx0XHRcdGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHRhd2FpdCB0aGlzLmRpc2NhcmRTdGlja3lTZXNzaW9uKGJpbmRpbmdDb250ZXh0KTtcblx0XHRcdFx0XHR0aGlzLl9yZW1vdmVTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzKHByb2dyYW1taW5nTW9kZWwpO1xuXHRcdFx0XHRcdGhpc3RvcnkuYmFjaygpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR2aWV3LFxuXHRcdFx0XHRwcm9ncmFtbWluZ01vZGVsXG5cdFx0XHQpO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGhpc3RvcnkuYmFjaygpO1xuXHR9XG5cblx0YXN5bmMgX2hhbmRsZU5ld0NvbnRleHQoXG5cdFx0b0NvbnRleHQ6IENvbnRleHQsXG5cdFx0YkVkaXRhYmxlOiBib29sZWFuLFxuXHRcdGJSZWNyZWF0ZUNvbnRleHQ6IGJvb2xlYW4sXG5cdFx0YkRyYWZ0TmF2aWdhdGlvbjogYm9vbGVhbixcblx0XHRiRm9yY2VGb2N1cyA9IGZhbHNlXG5cdCkge1xuXHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdH1cblxuXHRcdGF3YWl0IHRoaXMuZ2V0SW50ZXJuYWxSb3V0aW5nKCkubmF2aWdhdGVUb0NvbnRleHQob0NvbnRleHQsIHtcblx0XHRcdGNoZWNrTm9IYXNoQ2hhbmdlOiB0cnVlLFxuXHRcdFx0ZWRpdGFibGU6IGJFZGl0YWJsZSxcblx0XHRcdGJQZXJzaXN0T1BTY3JvbGw6IHRydWUsXG5cdFx0XHRiUmVjcmVhdGVDb250ZXh0OiBiUmVjcmVhdGVDb250ZXh0LFxuXHRcdFx0YkRyYWZ0TmF2aWdhdGlvbjogYkRyYWZ0TmF2aWdhdGlvbixcblx0XHRcdHNob3dQbGFjZWhvbGRlcjogZmFsc2UsXG5cdFx0XHRiRm9yY2VGb2N1czogYkZvcmNlRm9jdXMsXG5cdFx0XHRrZWVwQ3VycmVudExheW91dDogdHJ1ZVxuXHRcdH0pO1xuXHR9XG5cblx0X2dldEJvdW5kQ29udGV4dCh2aWV3OiBhbnksIHBhcmFtczogYW55KSB7XG5cdFx0Y29uc3Qgdmlld0xldmVsID0gdmlldy5nZXRWaWV3RGF0YSgpLnZpZXdMZXZlbDtcblx0XHRjb25zdCBiUmVmcmVzaEFmdGVyQWN0aW9uID0gdmlld0xldmVsID4gMSB8fCAodmlld0xldmVsID09PSAxICYmIHBhcmFtcy5jb250cm9sSWQpO1xuXHRcdHJldHVybiAhcGFyYW1zLmlzTmF2aWdhYmxlIHx8ICEhYlJlZnJlc2hBZnRlckFjdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlcmUgYXJlIHZhbGlkYXRpb24gKHBhcnNlKSBlcnJvcnMgZm9yIGNvbnRyb2xzIGJvdW5kIHRvIGEgZ2l2ZW4gY29udGV4dFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2NoZWNrRm9yVmFsaWRhdGlvbkVycm9yc1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2UgcmVzb2x2ZXMgaWYgdGhlcmUgYXJlIG5vIHZhbGlkYXRpb24gZXJyb3JzLCBhbmQgcmVqZWN0cyBpZiB0aGVyZSBhcmUgdmFsaWRhdGlvbiBlcnJvcnNcblx0ICovXG5cblx0X2NoZWNrRm9yVmFsaWRhdGlvbkVycm9ycygpIHtcblx0XHRyZXR1cm4gdGhpcy5zeW5jVGFzaygpLnRoZW4oKCkgPT4ge1xuXHRcdFx0Y29uc3Qgc1ZpZXdJZCA9IHRoaXMuZ2V0VmlldygpLmdldElkKCk7XG5cdFx0XHRjb25zdCBhTWVzc2FnZXMgPSBzYXAudWkuZ2V0Q29yZSgpLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRcdFx0bGV0IG9Db250cm9sO1xuXHRcdFx0bGV0IG9NZXNzYWdlO1xuXG5cdFx0XHRpZiAoIWFNZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShcIk5vIHZhbGlkYXRpb24gZXJyb3JzIGZvdW5kXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFNZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRvTWVzc2FnZSA9IGFNZXNzYWdlc1tpXTtcblx0XHRcdFx0aWYgKG9NZXNzYWdlLnZhbGlkYXRpb24pIHtcblx0XHRcdFx0XHRvQ29udHJvbCA9IENvcmUuYnlJZChvTWVzc2FnZS5nZXRDb250cm9sSWQoKSk7XG5cdFx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0XHRpZiAob0NvbnRyb2wuZ2V0SWQoKSA9PT0gc1ZpZXdJZCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJ2YWxpZGF0aW9uIGVycm9ycyBleGlzdFwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9yZWZyZXNoTGlzdElmUmVxdWlyZWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvUmVzcG9uc2UgVGhlIHJlc3BvbnNlIG9mIHRoZSBib3VuZCBhY3Rpb24gYW5kIHRoZSBuYW1lcyBvZiB0aGUga2V5IGZpZWxkc1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGJvdW5kIGNvbnRleHQgb24gd2hpY2ggdGhlIGFjdGlvbiB3YXMgZXhlY3V0ZWRcblx0ICogQHJldHVybnMgQWx3YXlzIHJlc29sdmVzIHRvIHBhcmFtIG9SZXNwb25zZVxuXHQgKi9cblx0X3JlZnJlc2hMaXN0SWZSZXF1aXJlZChvUmVzcG9uc2U6IGFueSwgb0NvbnRleHQ6IENvbnRleHQpOiBQcm9taXNlPGJvb2xlYW4gfCB1bmRlZmluZWQ+IHtcblx0XHRpZiAoIW9Db250ZXh0IHx8ICFvUmVzcG9uc2UgfHwgIW9SZXNwb25zZS5vRGF0YSkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuXHRcdH1cblx0XHRjb25zdCBvQmluZGluZyA9IG9Db250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHQvLyByZWZyZXNoIG9ubHkgbGlzdHNcblx0XHRpZiAob0JpbmRpbmcgJiYgb0JpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdGNvbnN0IG9Db250ZXh0RGF0YSA9IG9SZXNwb25zZS5vRGF0YTtcblx0XHRcdGNvbnN0IGFLZXlzID0gb1Jlc3BvbnNlLmtleXM7XG5cdFx0XHRjb25zdCBvQ3VycmVudERhdGEgPSBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdGxldCBiUmV0dXJuZWRDb250ZXh0SXNTYW1lID0gdHJ1ZTtcblx0XHRcdC8vIGVuc3VyZSBjb250ZXh0IGlzIGluIHRoZSByZXNwb25zZVxuXHRcdFx0aWYgKE9iamVjdC5rZXlzKG9Db250ZXh0RGF0YSkubGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGNoZWNrIGlmIGNvbnRleHQgaW4gcmVzcG9uc2UgaXMgZGlmZmVyZW50IHRoYW4gdGhlIGJvdW5kIGNvbnRleHRcblx0XHRcdFx0YlJldHVybmVkQ29udGV4dElzU2FtZSA9IGFLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChzS2V5OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0N1cnJlbnREYXRhW3NLZXldID09PSBvQ29udGV4dERhdGFbc0tleV07XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoIWJSZXR1cm5lZENvbnRleHRJc1NhbWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUpID0+IHtcblx0XHRcdFx0XHRcdGlmICgob0JpbmRpbmcgYXMgYW55KS5pc1Jvb3QoKSkge1xuXHRcdFx0XHRcdFx0XHRvQmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoIWJSZXR1cm5lZENvbnRleHRJc1NhbWUpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0b0JpbmRpbmcucmVmcmVzaCgpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnRcblx0XHRcdFx0XHRcdFx0XHQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKClcblx0XHRcdFx0XHRcdFx0XHQucmVxdWVzdFNpZGVFZmZlY3RzKFt7ICROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBvQmluZGluZy5nZXRQYXRoKCkgfV0sIG9CaW5kaW5nLmdldENvbnRleHQoKSBhcyBDb250ZXh0KVxuXHRcdFx0XHRcdFx0XHRcdC50aGVuKFxuXHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKCFiUmV0dXJuZWRDb250ZXh0SXNTYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlZnJlc2hpbmcgdGhlIHRhYmxlXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKCFiUmV0dXJuZWRDb250ZXh0SXNTYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlZnJlc2hpbmcgdGhlIHRhYmxlXCIsIGUpO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIHJlc29sdmUgd2l0aCBvUmVzcG9uc2UgdG8gbm90IGRpc3R1cmIgdGhlIHByb21pc2UgY2hhaW4gYWZ0ZXJ3YXJkc1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcblx0fVxuXG5cdF9mZXRjaFNlbWFudGljS2V5VmFsdWVzKG9Db250ZXh0OiBDb250ZXh0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBhbnksXG5cdFx0XHRzRW50aXR5U2V0TmFtZSA9IG9NZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQob0NvbnRleHQuZ2V0UGF0aCgpKS5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKSxcblx0XHRcdGFTZW1hbnRpY0tleXMgPSBTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY0tleXMob01ldGFNb2RlbCwgc0VudGl0eVNldE5hbWUpO1xuXG5cdFx0aWYgKGFTZW1hbnRpY0tleXMgJiYgYVNlbWFudGljS2V5cy5sZW5ndGgpIHtcblx0XHRcdGNvbnN0IGFSZXF1ZXN0UHJvbWlzZXMgPSBhU2VtYW50aWNLZXlzLm1hcChmdW5jdGlvbiAob0tleTogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KG9LZXkuJFByb3BlcnR5UGF0aCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKGFSZXF1ZXN0UHJvbWlzZXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIHRoZSBsYXRlc3QgY29udGV4dCBpbiB0aGUgbWV0YWRhdGEgaGllcmFyY2h5IGZyb20gcm9vdEJpbmRpbmcgdG8gZ2l2ZW4gY29udGV4dCBwb2ludGluZyB0byBnaXZlbiBlbnRpdHlUeXBlXG5cdCAqIGlmIGFueSBzdWNoIGNvbnRleHQgZXhpc3RzLiBPdGhlcndpc2UsIGl0IHJldHVybnMgdGhlIG9yaWdpbmFsIGNvbnRleHQuXG5cdCAqIE5vdGU6IEl0IGlzIG9ubHkgbmVlZGVkIGFzIHdvcmstYXJvdW5kIGZvciBpbmNvcnJlY3QgbW9kZWxsaW5nLiBDb3JyZWN0IG1vZGVsbGluZyB3b3VsZCBpbXBseSBhIERhdGFGaWVsZEZvckFjdGlvbiBpbiBhIExpbmVJdGVtXG5cdCAqIHRvIHBvaW50IHRvIGFuIG92ZXJsb2FkIGRlZmluZWQgZWl0aGVyIG9uIHRoZSBjb3JyZXNwb25kaW5nIEVudGl0eVR5cGUgb3IgYSBjb2xsZWN0aW9uIG9mIHRoZSBzYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm9vdENvbnRleHQgVGhlIGNvbnRleHQgdG8gc3RhcnQgc2VhcmNoaW5nIGZyb21cblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIFRoZSBsaXN0QmluZGluZyBvZiB0aGUgdGFibGVcblx0ICogQHBhcmFtIG92ZXJsb2FkRW50aXR5VHlwZSBUaGUgQWN0aW9uT3ZlcmxvYWQgZW50aXR5IHR5cGUgdG8gc2VhcmNoIGZvclxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBjb250ZXh0IG9mIHRoZSBBY3Rpb25PdmVybG9hZCBlbnRpdHlcblx0ICovXG5cdF9nZXRBY3Rpb25PdmVybG9hZENvbnRleHRGcm9tTWV0YWRhdGFQYXRoKHJvb3RDb250ZXh0OiBDb250ZXh0LCBsaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZywgb3ZlcmxvYWRFbnRpdHlUeXBlOiBzdHJpbmcpOiBDb250ZXh0IHtcblx0XHRjb25zdCBtb2RlbDogT0RhdGFNb2RlbCA9IHJvb3RDb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3QgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGxldCBjb250ZXh0U2VnbWVudHM6IHN0cmluZ1tdID0gbGlzdEJpbmRpbmcuZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRsZXQgY3VycmVudENvbnRleHQ6IENvbnRleHQgPSByb290Q29udGV4dDtcblxuXHRcdC8vIFdlIGV4cGVjdCB0aGF0IHRoZSBsYXN0IHNlZ21lbnQgb2YgdGhlIGxpc3RCaW5kaW5nIGlzIHRoZSBMaXN0QmluZGluZyBvZiB0aGUgdGFibGUuIFJlbW92ZSB0aGlzIGZyb20gY29udGV4dFNlZ21lbnRzXG5cdFx0Ly8gYmVjYXVzZSBpdCBpcyBpbmNvcnJlY3QgdG8gZXhlY3V0ZSBiaW5kQ29udGV4dCBvbiBhIGxpc3QuIFdlIGRvIG5vdCBhbnl3YXkgbmVlZCB0byBzZWFyY2ggdGhpcyBjb250ZXh0IGZvciB0aGUgb3ZlcmxvYWQuXG5cdFx0Y29udGV4dFNlZ21lbnRzLnBvcCgpO1xuXHRcdGlmIChjb250ZXh0U2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRjb250ZXh0U2VnbWVudHMgPSBbXCJcIl07IC8vIERvbid0IGxlYXZlIGNvbnRleHRTZWdtZW50cyB1bmRlZmluZWRcblx0XHR9XG5cblx0XHRpZiAoY29udGV4dFNlZ21lbnRzWzBdICE9PSBcIlwiKSB7XG5cdFx0XHRjb250ZXh0U2VnbWVudHMudW5zaGlmdChcIlwiKTsgLy8gdG8gYWxzbyBnZXQgdGhlIHJvb3QgY29udGV4dCwgaS5lLiB0aGUgYmluZGluZ0NvbnRleHQgb2YgdGhlIHRhYmxlXG5cdFx0fVxuXHRcdC8vIGxvYWQgYWxsIHRoZSBwYXJlbnQgY29udGV4dHMgaW50byBhbiBhcnJheVxuXHRcdGNvbnN0IHBhcmVudENvbnRleHRzOiBDb250ZXh0W10gPSBjb250ZXh0U2VnbWVudHNcblx0XHRcdC5tYXAoKHBhdGhTZWdtZW50OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKHBhdGhTZWdtZW50ICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0Y3VycmVudENvbnRleHQgPSBtb2RlbC5iaW5kQ29udGV4dChwYXRoU2VnbWVudCwgY3VycmVudENvbnRleHQpLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIENyZWF0aW5nIGEgbmV3IGNvbnRleHQgdXNpbmcgYmluZENvbnRleHQoLi4uKS5nZXRCb3VuZENvbnRleHQoKSBkb2VzIG5vdCB3b3JrIGlmIHRoZSBldGFnIGlzIG5lZWRlZC4gQWNjb3JkaW5nIHRvIG1vZGVsIGNvbGxlYWd1ZXMsXG5cdFx0XHRcdFx0Ly8gd2Ugc2hvdWxkIGFsd2F5cyB1c2UgYW4gZXhpc3RpbmcgY29udGV4dCBpZiBwb3NzaWJsZS5cblx0XHRcdFx0XHQvLyBDdXJyZW50bHksIHRoZSBvbmx5IGV4YW1wbGUgd2Uga25vdyBhYm91dCBpcyB1c2luZyB0aGUgcm9vdENvbnRleHQgLSBhbmQgaW4gdGhpcyBjYXNlLCB3ZSBjYW4gb2J2aW91c2x5IHJldXNlIHRoYXQgZXhpc3RpbmcgY29udGV4dC5cblx0XHRcdFx0XHQvLyBJZiBvdGhlciBleGFtcGxlcyBzaG91bGQgY29tZSB1cCwgdGhlIGJlc3QgcG9zc2libGUgd29yayBhcm91bmQgd291bGQgYmUgdG8gcmVxdWVzdCBzb21lIGRhdGEgdG8gZ2V0IGFuIGV4aXN0aW5nIGNvbnRleHQuIFRvIGtlZXAgdGhlXG5cdFx0XHRcdFx0Ly8gcmVxdWVzdCBhcyBzbWFsbCBhbmQgZmFzdCBhcyBwb3NzaWJsZSwgd2Ugc2hvdWxkIHJlcXVlc3Qgb25seSB0aGUgZmlyc3Qga2V5IHByb3BlcnR5LiBBcyB0aGlzIHdvdWxkIGludHJvZHVjZSBhc3luY2hyb25pc20sIGFuZCBhbnl3YXlcblx0XHRcdFx0XHQvLyB0aGUgd2hvbGUgbG9naWMgaXMgb25seSBwYXJ0IG9mIHdvcmstYXJvdW5kIGZvciBpbmNvcnJlY3QgbW9kZWxsaW5nLCB3ZSB3YWl0IHVudGlsIHdlIGhhdmUgYW4gZXhhbXBsZSBuZWVkaW5nIGl0IGJlZm9yZSBpbXBsZW1lbnRpbmcgdGhpcy5cblx0XHRcdFx0XHRjdXJyZW50Q29udGV4dCA9IHJvb3RDb250ZXh0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjdXJyZW50Q29udGV4dDtcblx0XHRcdH0pXG5cdFx0XHQucmV2ZXJzZSgpO1xuXHRcdC8vIHNlYXJjaCBmb3IgY29udGV4dCBiYWNrd2FyZHNcblx0XHRjb25zdCBvdmVybG9hZENvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQgPSBwYXJlbnRDb250ZXh0cy5maW5kKFxuXHRcdFx0KHBhcmVudENvbnRleHQ6IENvbnRleHQpID0+XG5cdFx0XHRcdChtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQocGFyZW50Q29udGV4dC5nZXRQYXRoKCkpLmdldE9iamVjdChcIiRUeXBlXCIpIGFzIHVua25vd24gYXMgc3RyaW5nKSA9PT0gb3ZlcmxvYWRFbnRpdHlUeXBlXG5cdFx0KTtcblx0XHRyZXR1cm4gb3ZlcmxvYWRDb250ZXh0IHx8IGxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKSE7XG5cdH1cblxuXHRfY3JlYXRlU2libGluZ0luZm8oY3VycmVudENvbnRleHQ6IENvbnRleHQsIG5ld0NvbnRleHQ6IENvbnRleHQpOiBTaWJsaW5nSW5mb3JtYXRpb24ge1xuXHRcdHJldHVybiB7XG5cdFx0XHR0YXJnZXRDb250ZXh0OiBuZXdDb250ZXh0LFxuXHRcdFx0cGF0aE1hcHBpbmc6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG9sZFBhdGg6IGN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdFx0XHRuZXdQYXRoOiBuZXdDb250ZXh0LmdldFBhdGgoKVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fTtcblx0fVxuXG5cdF91cGRhdGVQYXRoc0luSGlzdG9yeShtYXBwaW5nczogeyBvbGRQYXRoOiBzdHJpbmc7IG5ld1BhdGg6IHN0cmluZyB9W10pIHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gdGhpcy5nZXRBcHBDb21wb25lbnQoKTtcblx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuc2V0UGF0aE1hcHBpbmcobWFwcGluZ3MpO1xuXG5cdFx0Ly8gQWxzbyB1cGRhdGUgdGhlIHNlbWFudGljIG1hcHBpbmcgaW4gdGhlIHJvdXRpbmcgc2VydmljZVxuXHRcdGNvbnN0IGxhc3RTZW1hbnRpY01hcHBpbmcgPSB0aGlzLl9nZXRTZW1hbnRpY01hcHBpbmcoKTtcblx0XHRpZiAobWFwcGluZ3MubGVuZ3RoICYmIGxhc3RTZW1hbnRpY01hcHBpbmc/LnRlY2huaWNhbFBhdGggPT09IG1hcHBpbmdzW21hcHBpbmdzLmxlbmd0aCAtIDFdLm9sZFBhdGgpIHtcblx0XHRcdGxhc3RTZW1hbnRpY01hcHBpbmcudGVjaG5pY2FsUGF0aCA9IG1hcHBpbmdzW21hcHBpbmdzLmxlbmd0aCAtIDFdLm5ld1BhdGg7XG5cdFx0fVxuXHR9XG5cblx0X2dldE5hdmlnYXRpb25UYXJnZXRGb3JFZGl0KGNvbnRleHQ6IENvbnRleHQsIG5ld0RvY3VtZW50Q29udGV4dDogQ29udGV4dCwgc2libGluZ0luZm86IFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZCkge1xuXHRcdGxldCBjb250ZXh0VG9OYXZpZ2F0ZTogQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0XHRzaWJsaW5nSW5mbyA9IHNpYmxpbmdJbmZvID8/IHRoaXMuX2NyZWF0ZVNpYmxpbmdJbmZvKGNvbnRleHQsIG5ld0RvY3VtZW50Q29udGV4dCk7XG5cdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdGlmIChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0LmdldFBhdGgoKSAhPSBuZXdEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRjb250ZXh0VG9OYXZpZ2F0ZSA9IHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0fVxuXHRcdHJldHVybiBjb250ZXh0VG9OYXZpZ2F0ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBjcmVhdGVzIGEgc2libGluZyBjb250ZXh0IGZvciBhIHN1Ym9iamVjdCBwYWdlLCBhbmQgY2FsY3VsYXRlcyBhIHNpYmxpbmcgcGF0aFxuXHQgKiBmb3IgYWxsIGludGVybWVkaWF0ZSBwYXRocyBiZXR3ZWVuIHRoZSBvYmplY3QgcGFnZSBhbmQgdGhlIHN1Ym9iamVjdCBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0gcm9vdEN1cnJlbnRDb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGUgcm9vdCBvZiB0aGUgZHJhZnRcblx0ICogQHBhcmFtIHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBzdWJvYmplY3Rcblx0ICogQHBhcmFtIHNQcm9ncmFtbWluZ01vZGVsIFRoZSBwcm9ncmFtbWluZyBtb2RlbFxuXHQgKiBAcGFyYW0gZG9Ob3RDb21wdXRlSWZSb290IElmIHRydWUsIHdlIGRvbid0IGNvbXB1dGUgc2libGluZ0luZm8gaWYgdGhlIHJvb3QgYW5kIHRoZSByaWdodG1vc3QgY29udGV4dHMgYXJlIHRoZSBzYW1lXG5cdCAqIEBwYXJhbSByb290Q29udGV4dEluZm8gVGhlIHJvb3QgY29udGV4dCBpbmZvcm1hdGlvbiBvZiByb290IG9mIHRoZSBkcmFmdFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBzaWJsaW5nSW5mb3JtYXRpb24gb2JqZWN0XG5cdCAqL1xuXHRhc3luYyBfY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihcblx0XHRyb290Q3VycmVudENvbnRleHQ6IENvbnRleHQsXG5cdFx0cmlnaHRtb3N0Q3VycmVudENvbnRleHQ6IENvbnRleHQgfCBudWxsIHwgdW5kZWZpbmVkLFxuXHRcdHNQcm9ncmFtbWluZ01vZGVsOiBzdHJpbmcsXG5cdFx0ZG9Ob3RDb21wdXRlSWZSb290OiBib29sZWFuLFxuXHRcdHJvb3RDb250ZXh0SW5mbz86IFJvb3RDb250ZXh0SW5mb1xuXHQpOiBQcm9taXNlPFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZD4ge1xuXHRcdHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0ID0gcmlnaHRtb3N0Q3VycmVudENvbnRleHQgPz8gcm9vdEN1cnJlbnRDb250ZXh0O1xuXHRcdGlmICghcmlnaHRtb3N0Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpLnN0YXJ0c1dpdGgocm9vdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSkpIHtcblx0XHRcdC8vIFdyb25nIHVzYWdlICEhXG5cdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgY29tcHV0ZSByaWdodG1vc3Qgc2libGluZyBjb250ZXh0XCIpO1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNvbXB1dGUgcmlnaHRtb3N0IHNpYmxpbmcgY29udGV4dFwiKTtcblx0XHR9XG5cdFx0aWYgKGRvTm90Q29tcHV0ZUlmUm9vdCAmJiByaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkgPT09IHJvb3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcblx0XHR9XG5cblx0XHRjb25zdCBtb2RlbCA9IHJvb3RDdXJyZW50Q29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0cmV0dXJuIGRyYWZ0LmNvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24ocm9vdEN1cnJlbnRDb250ZXh0LCByaWdodG1vc3RDdXJyZW50Q29udGV4dCwgcm9vdENvbnRleHRJbmZvKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gSWYgbm90IGluIGRyYWZ0IG1vZGUsIHdlIGp1c3QgcmVjcmVhdGUgYSBjb250ZXh0IGZyb20gdGhlIHBhdGggb2YgdGhlIHJpZ2h0bW9zdCBjb250ZXh0XG5cdFx0XHQvLyBObyBwYXRoIG1hcHBpbmcgaXMgbmVlZGVkXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0YXJnZXRDb250ZXh0OiBtb2RlbC5iaW5kQ29udGV4dChyaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkpLmdldEJvdW5kQ29udGV4dCgpLFxuXHRcdFx0XHRwYXRoTWFwcGluZzogW11cblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0X2lzRmNsRW5hYmxlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRBcHBDb21wb25lbnQoKS5faXNGY2xFbmFibGVkKCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRWRpdEZsb3c7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWlEQSxNQUFNQSxZQUFZLEdBQUdDLFNBQVMsQ0FBQ0QsWUFBWTtJQUMxQ0UsZ0JBQWdCLEdBQUdELFNBQVMsQ0FBQ0MsZ0JBQWdCO0lBQzdDQyxTQUFTLEdBQUdGLFNBQVMsQ0FBQ0UsU0FBUztJQUMv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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/editFlow/operations", "sap/fe/core/controllerextensions/editFlow/sticky", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/DeleteHelper", "sap/fe/core/helpers/FPMHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/m/MessageToast", "sap/m/Popover", "sap/m/Text", "sap/m/VBox", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel", "../../helpers/MetaModelFunction", "../../helpers/ToES6Promise"], function (Log, ActionRuntime, CommonUtils, BusyLocker, draft, operations, sticky, messageHandling, deleteHelper, FPMHelper, ModelHelper, ResourceModelHelper, StableIdHelper, FELibrary, Button, Dialog, MessageBox, MessageToast, Popover, Text, VBox, Core, Fragment, coreLibrary, XMLPreprocessor, XMLTemplateProcessor, JSONModel, MetaModelFunction, toES6Promise) {
  "use strict";

  var getRequiredPropertiesFromInsertRestrictions = MetaModelFunction.getRequiredPropertiesFromInsertRestrictions;
  var getNonComputedVisibleFields = MetaModelFunction.getNonComputedVisibleFields;
  var generate = StableIdHelper.generate;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  const CreationMode = FELibrary.CreationMode;
  const ProgrammingModel = FELibrary.ProgrammingModel;

  //Enums for delete text calculations for delete confirm dialog.
  const DeleteOptionTypes = deleteHelper.DeleteOptionTypes;
  const DeleteDialogContentControl = deleteHelper.DeleteDialogContentControl;

  /* Make sure that the mParameters is not the oEvent */
  function getParameters(mParameters) {
    if (mParameters && mParameters.getMetadata && mParameters.getMetadata().getName() === "sap.ui.base.Event") {
      mParameters = {};
    }
    return mParameters || {};
  }
  let TransactionHelper = /*#__PURE__*/function () {
    function TransactionHelper() {}
    var _proto = TransactionHelper.prototype;
    _proto.busyLock = function busyLock(appComponent, busyPath) {
      BusyLocker.lock(appComponent.getModel("ui"), busyPath);
    };
    _proto.busyUnlock = function busyUnlock(appComponent, busyPath) {
      BusyLocker.unlock(appComponent.getModel("ui"), busyPath);
    };
    _proto.getProgrammingModel = function getProgrammingModel(source) {
      let path;
      if (source.isA("sap.ui.model.odata.v4.Context")) {
        path = source.getPath();
      } else {
        path = (source.isRelative() ? source.getResolvedPath() : source.getPath()) ?? "";
      }
      const metaModel = source.getModel().getMetaModel();
      if (ModelHelper.isDraftSupported(metaModel, path)) {
        return ProgrammingModel.Draft;
      } else if (ModelHelper.isStickySessionSupported(metaModel)) {
        return ProgrammingModel.Sticky;
      } else {
        return ProgrammingModel.NonDraft;
      }
    }

    /**
     * Validates a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the document to be validated
     * @param [mParameters] Can contain the following attributes:
     * @param [mParameters.data] A map of data that should be validated
     * @param [mParameters.customValidationFunction] A string representing the path to the validation function
     * @param oView Contains the object of the current view
     * @returns Promise resolves with result of the custom validation function
     * @ui5-restricted
     * @final
     */;
    _proto.validateDocument = function validateDocument(oContext, mParameters, oView) {
      const sCustomValidationFunction = mParameters && mParameters.customValidationFunction;
      if (sCustomValidationFunction) {
        const sModule = sCustomValidationFunction.substring(0, sCustomValidationFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
          sFunctionName = sCustomValidationFunction.substring(sCustomValidationFunction.lastIndexOf(".") + 1, sCustomValidationFunction.length),
          mData = mParameters.data;
        delete mData["@$ui5.context.isTransient"];
        return FPMHelper.validationWrapper(sModule, sFunctionName, mData, oView, oContext);
      }
      return Promise.resolve([]);
    }

    /**
     * Creates a new document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oMainListBinding OData V4 ListBinding object
     * @param [mInParameters] Optional, can contain the following attributes:
     * @param [mInParameters.data] A map of data that should be sent within the POST
     * @param [mInParameters.busyMode] Global (default), Local, None TODO: to be refactored
     * @param [mInParameters.busyId] ID of the local busy indicator
     * @param [mInParameters.keepTransientContextOnFailed] If set, the context stays in the list if the POST failed and POST will be repeated with the next change
     * @param [mInParameters.inactive] If set, the context is set as inactive for empty rows
     * @param [mInParameters.skipParameterDialog] Skips the action parameter dialog
     * @param appComponent The app component
     * @param messageHandler The message handler extension
     * @param fromCopyPaste True if the creation has been triggered by a paste action
     * @returns Promise resolves with new binding context
     * @ui5-restricted
     * @final
     */;
    _proto.createDocument = async function createDocument(oMainListBinding, mInParameters, appComponent, messageHandler, fromCopyPaste) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const oModel = oMainListBinding.getModel(),
        oMetaModel = oModel.getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath()),
        sCreateHash = appComponent.getRouterProxy().getHash(),
        oComponentData = appComponent.getComponentData(),
        oStartupParameters = oComponentData && oComponentData.startupParameters || {},
        sNewAction = !oMainListBinding.isRelative() ? this._getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath) : undefined;
      const mBindingParameters = {
        $$patchWithoutSideEffects: true
      };
      const sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
      let sBusyPath = "/busy";
      let sFunctionName = oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) || oMetaModel.getObject(`${ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath))}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`);
      let bFunctionOnNavProp;
      let oNewDocumentContext;
      if (sFunctionName) {
        if (oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) && ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath)) !== sMetaPath) {
          bFunctionOnNavProp = true;
        } else {
          bFunctionOnNavProp = false;
        }
      }
      if (sMessagesPath) {
        mBindingParameters["$select"] = sMessagesPath;
      }
      const mParameters = getParameters(mInParameters);
      if (!oMainListBinding) {
        throw new Error("Binding required for new document creation");
      }
      const sProgrammingModel = this.getProgrammingModel(oMainListBinding);
      if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
        throw new Error("Create document only allowed for draft or sticky session supported services");
      }
      if (mParameters.busyMode === "Local") {
        sBusyPath = `/busyLocal/${mParameters.busyId}`;
      }
      mParameters.beforeCreateCallBack = fromCopyPaste ? null : mParameters.beforeCreateCallBack;
      this.busyLock(appComponent, sBusyPath);
      const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
      let oResult;
      try {
        if (sNewAction) {
          oResult = await this.callAction(sNewAction, {
            contexts: oMainListBinding.getHeaderContext(),
            showActionParameterDialog: true,
            label: this._getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore),
            bindingParameters: mBindingParameters,
            parentControl: mParameters.parentControl,
            bIsCreateAction: true,
            skipParameterDialog: mParameters.skipParameterDialog
          }, null, appComponent, messageHandler);
        } else {
          const bIsNewPageCreation = mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.Inline;
          const aNonComputedVisibleKeyFields = bIsNewPageCreation ? getNonComputedVisibleFields(oMetaModel, sMetaPath, appComponent) : [];
          sFunctionName = fromCopyPaste ? null : sFunctionName;
          let sFunctionPath, oFunctionContext;
          if (sFunctionName) {
            //bound to the source entity:
            if (bFunctionOnNavProp) {
              sFunctionPath = oMainListBinding.getContext() && `${oMetaModel.getMetaPath(oMainListBinding.getContext().getPath())}/${sFunctionName}`;
              oFunctionContext = oMainListBinding.getContext();
            } else {
              sFunctionPath = oMainListBinding.getHeaderContext() && `${oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath())}/${sFunctionName}`;
              oFunctionContext = oMainListBinding.getHeaderContext();
            }
          }
          const oFunction = sFunctionPath && oMetaModel.createBindingContext(sFunctionPath);
          try {
            let oData;
            try {
              const oContext = oFunction && oFunction.getObject() && oFunction.getObject()[0].$IsBound ? await operations.callBoundFunction(sFunctionName, oFunctionContext, oModel) : await operations.callFunctionImport(sFunctionName, oModel);
              if (oContext) {
                oData = oContext.getObject();
              }
            } catch (oError) {
              Log.error(`Error while executing the function ${sFunctionName}`, oError);
              throw oError;
            }
            mParameters.data = oData ? Object.assign({}, oData, mParameters.data) : mParameters.data;
            if (mParameters.data) {
              delete mParameters.data["@odata.context"];
            }
            if (aNonComputedVisibleKeyFields.length > 0) {
              oResult = await this._launchDialogWithKeyFields(oMainListBinding, aNonComputedVisibleKeyFields, oModel, mParameters, appComponent, messageHandler);
              oNewDocumentContext = oResult.newContext;
            } else {
              if (mParameters.beforeCreateCallBack) {
                await toES6Promise(mParameters.beforeCreateCallBack({
                  contextPath: oMainListBinding && oMainListBinding.getPath()
                }));
              }
              oNewDocumentContext = oMainListBinding.create(mParameters.data, true, mParameters.createAtEnd, mParameters.inactive);
              if (!mParameters.inactive) {
                oResult = await this.onAfterCreateCompletion(oMainListBinding, oNewDocumentContext, mParameters);
              }
            }
          } catch (oError) {
            Log.error("Error while creating the new document", oError);
            throw oError;
          }
        }
        oNewDocumentContext = oNewDocumentContext || oResult;
        await messageHandler.showMessageDialog({
          control: mParameters.parentControl
        });
        return oNewDocumentContext;
      } catch (error) {
        var _oNewDocumentContext;
        // TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
        await messageHandler.showMessageDialog({
          control: mParameters.parentControl
        });
        if ((error === FELibrary.Constants.ActionExecutionFailed || error === FELibrary.Constants.CancelActionDialog) && (_oNewDocumentContext = oNewDocumentContext) !== null && _oNewDocumentContext !== void 0 && _oNewDocumentContext.isTransient()) {
          // This is a workaround suggested by model as Context.delete results in an error
          // TODO: remove the $direct once model resolves this issue
          // this line shows the expected console error Uncaught (in promise) Error: Request canceled: POST Travel; group: submitLater
          oNewDocumentContext.delete("$direct");
        }
        throw error;
      } finally {
        this.busyUnlock(appComponent, sBusyPath);
      }
    };
    _proto._isDraftEnabled = function _isDraftEnabled(vContexts) {
      const contextForDraftModel = vContexts[0];
      const sProgrammingModel = this.getProgrammingModel(contextForDraftModel);
      return sProgrammingModel === ProgrammingModel.Draft;
    }

    /**
     * Delete one or multiple document(s).
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param contexts Contexts Either one context or an array with contexts to be deleted
     * @param mParameters Optional, can contain the following attributes:
     * @param mParameters.title Title of the object to be deleted
     * @param mParameters.description Description of the object to be deleted
     * @param mParameters.numberOfSelectedContexts Number of objects selected
     * @param mParameters.noDialog To disable the confirmation dialog
     * @param appComponent The appComponent
     * @param resourceModel The resource model to load text resources
     * @param messageHandler The message handler extension
     * @returns A Promise resolved once the documents are deleted
     */;
    _proto.deleteDocument = function deleteDocument(contexts, mParameters, appComponent, resourceModel, messageHandler) {
      const resourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
      let aParams;
      // delete document lock
      this.busyLock(appComponent);
      const contextsToDelete = Array.isArray(contexts) ? [...contexts] : [contexts];
      return new Promise((resolve, reject) => {
        try {
          const draftEnabled = this._isDraftEnabled(mParameters.selectedContexts || contextsToDelete);
          const items = [];
          let options = [];

          // items(texts) and options(checkBoxes and single default option) for confirm dialog.
          if (mParameters) {
            if (!mParameters.numberOfSelectedContexts) {
              // non-Table
              if (draftEnabled) {
                // Check if 1 of the drafts is locked by another user
                const lockedContext = contextsToDelete.find(context => {
                  const contextData = context.getObject();
                  return contextData.IsActiveEntity === true && contextData.HasDraftEntity === true && contextData.DraftAdministrativeData && contextData.DraftAdministrativeData.InProcessByUser && !contextData.DraftAdministrativeData.DraftIsCreatedByMe;
                });
                if (lockedContext) {
                  // Show message box with the name of the locking user and return
                  const lockingUserName = lockedContext.getObject().DraftAdministrativeData.InProcessByUser;
                  MessageBox.show(resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", [lockingUserName]), {
                    title: resourceModel.getText("C_COMMON_DELETE"),
                    onClose: reject
                  });
                  return;
                }
              }
              mParameters = getParameters(mParameters);
              let nonTableTxt = "";
              if (mParameters.title) {
                if (mParameters.description) {
                  aParams = [mParameters.title + " ", mParameters.description];
                } else {
                  aParams = [mParameters.title, ""];
                }
                nonTableTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", aParams, mParameters.entitySetName);
              } else {
                nonTableTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, mParameters.entitySetName);
              }
              options.push({
                type: DeleteOptionTypes.deletableContexts,
                contexts: contextsToDelete,
                text: nonTableTxt,
                selected: true,
                control: DeleteDialogContentControl.TEXT
              });
            } else {
              // Table
              let totalDeletable = contextsToDelete.length;
              if (draftEnabled) {
                totalDeletable += mParameters.draftsWithNonDeletableActive.length + mParameters.draftsWithDeletableActive.length + mParameters.unSavedContexts.length;
                deleteHelper.updateDraftOptionsForDeletableTexts(mParameters, contextsToDelete, totalDeletable, resourceModel, items, options);
              } else {
                const nonDeletableText = deleteHelper.getNonDeletableText(mParameters, totalDeletable, resourceModel);
                if (nonDeletableText) {
                  items.push(nonDeletableText);
                }
              }
              const optionsDeletableTexts = deleteHelper.getOptionsForDeletableTexts(mParameters, contextsToDelete, resourceModel);
              options = [...options, ...optionsDeletableTexts];
            }
          }

          // Content of Delete Dialog
          deleteHelper.updateContentForDeleteDialog(options, items);
          const vBox = new VBox({
            items: items
          });
          const sTitle = resourceBundleCore.getText("C_COMMON_DELETE");
          const fnConfirm = async () => {
            this.busyLock(appComponent);
            try {
              await deleteHelper.deleteConfirmHandler(options, mParameters, messageHandler, resourceModel, appComponent, draftEnabled);
              resolve();
            } catch (oError) {
              reject();
            } finally {
              this.busyUnlock(appComponent);
            }
          };
          let dialogConfirmed = false;
          const oDialog = new Dialog({
            title: sTitle,
            state: "Warning",
            content: [vBox],
            ariaLabelledBy: items,
            beginButton: new Button({
              text: resourceBundleCore.getText("C_COMMON_DELETE"),
              type: "Emphasized",
              press: function () {
                messageHandling.removeBoundTransitionMessages();
                dialogConfirmed = true;
                oDialog.close();
                fnConfirm();
              }
            }),
            endButton: new Button({
              text: resourceModel.getText("C_COMMON_DIALOG_CANCEL"),
              press: function () {
                oDialog.close();
              }
            }),
            afterClose: function () {
              oDialog.destroy();
              // if dialog is closed unconfirmed (e.g. via "Cancel" or Escape button), ensure to reject promise
              if (!dialogConfirmed) {
                reject();
              }
            }
          });
          if (mParameters.noDialog) {
            fnConfirm();
          } else {
            oDialog.addStyleClass("sapUiContentPadding");
            oDialog.open();
          }
        } finally {
          // delete document unlock
          this.busyUnlock(appComponent);
        }
      });
    }

    /**
     * Edits a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the active document
     * @param oView Current view
     * @param appComponent The appComponent
     * @param messageHandler The message handler extension
     * @returns Promise resolves with the new draft context in case of draft programming model
     * @ui5-restricted
     * @final
     */;
    _proto.editDocument = async function editDocument(oContext, oView, appComponent, messageHandler) {
      const sProgrammingModel = this.getProgrammingModel(oContext);
      if (!oContext) {
        throw new Error("Binding context to active document is required");
      }
      if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
        throw new Error("Edit is only allowed for draft or sticky session supported services");
      }
      this.busyLock(appComponent);
      // before triggering the edit action we'll have to remove all bound transition messages
      messageHandler.removeTransitionMessages();
      try {
        const oNewContext = sProgrammingModel === ProgrammingModel.Draft ? await draft.createDraftFromActiveDocument(oContext, appComponent, {
          bPreserveChanges: true,
          oView: oView
        }) : await sticky.editDocumentInStickySession(oContext, appComponent);
        await messageHandler.showMessageDialog();
        return oNewContext;
      } catch (err) {
        await messageHandler.showMessages({
          concurrentEditFlag: true
        });
        throw err;
      } finally {
        this.busyUnlock(appComponent);
      }
    }

    /**
     * Cancel 'edit' mode of a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the document to be canceled or deleted
     * @param [mInParameters] Optional, can contain the following attributes:
     * @param mInParameters.cancelButton Cancel Button of the discard popover (mandatory for now)
     * @param mInParameters.skipDiscardPopover Optional, supresses the discard popover incase of draft applications while navigating out of OP
     * @param appComponent The appComponent
     * @param resourceModel The model to load text resources
     * @param messageHandler The message handler extension
     * @param isNewObject True if we're trying to cancel a newly created object
     * @param isObjectModified True if the object has been modified by the user
     * @returns Promise resolves with ???
     * @ui5-restricted
     * @final
     */;
    _proto.cancelDocument = async function cancelDocument(oContext, mInParameters, appComponent, resourceModel, messageHandler, isNewObject, isObjectModified) {
      //context must always be passed - mandatory parameter
      if (!oContext) {
        throw new Error("No context exists. Pass a meaningful context");
      }
      this.busyLock(appComponent);
      const mParameters = getParameters(mInParameters);
      const oModel = oContext.getModel();
      const sProgrammingModel = this.getProgrammingModel(oContext);
      if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
        throw new Error("Cancel document only allowed for draft or sticky session supported services");
      }
      try {
        let returnedValue = false;
        if (sProgrammingModel === ProgrammingModel.Draft && !isObjectModified) {
          const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();
          const draftAdminData = await draftDataContext.requestObject();
          if (draftAdminData) {
            isObjectModified = draftAdminData.CreationDateTime !== draftAdminData.LastChangeDateTime;
          }
        }
        if (!mParameters.skipDiscardPopover) {
          await this._confirmDiscard(mParameters.cancelButton, isObjectModified, resourceModel);
        }
        if (oContext.isKeepAlive()) {
          // if the context is kept alive we set it again to detach the onBeforeDestroy callback and handle navigation here
          // the context needs to still be kept alive to be able to reset changes properly
          oContext.setKeepAlive(true, undefined);
        }
        if (mParameters.beforeCancelCallBack) {
          await mParameters.beforeCancelCallBack({
            context: oContext
          });
        }
        if (sProgrammingModel === ProgrammingModel.Draft) {
          if (isNewObject) {
            if (oContext.hasPendingChanges()) {
              oContext.getBinding().resetChanges();
            }
            returnedValue = await draft.deleteDraft(oContext, appComponent);
          } else {
            const oSiblingContext = oModel.bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
            try {
              const sCanonicalPath = await oSiblingContext.requestCanonicalPath();
              if (oContext.hasPendingChanges()) {
                oContext.getBinding().resetChanges();
              }
              returnedValue = oModel.bindContext(sCanonicalPath).getBoundContext();
            } finally {
              await draft.deleteDraft(oContext, appComponent);
            }
          }
        } else {
          const discardedContext = await sticky.discardDocument(oContext);
          if (discardedContext) {
            if (discardedContext.hasPendingChanges()) {
              discardedContext.getBinding().resetChanges();
            }
            if (!isNewObject) {
              discardedContext.refresh();
              returnedValue = discardedContext;
            }
          }
        }

        // remove existing bound transition messages
        messageHandler.removeTransitionMessages();
        // show unbound messages
        await messageHandler.showMessages();
        return returnedValue;
      } catch (err) {
        await messageHandler.showMessages();
        throw err;
      } finally {
        this.busyUnlock(appComponent);
      }
    }

    /**
     * Saves the document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param context Context of the document to be saved
     * @param appComponent The appComponent
     * @param resourceModel The model to load text resources
     * @param executeSideEffectsOnError True if we should execute side effects in case of an error
     * @param bindingsForSideEffects The listBindings to be used for executing side effects on error
     * @param messageHandler The message handler extension
     * @param isNewObject True if we're trying to cancel a newly created object
     * @returns Promise resolves with ???
     * @ui5-restricted
     * @final
     */;
    _proto.saveDocument = async function saveDocument(context, appComponent, resourceModel, executeSideEffectsOnError, bindingsForSideEffects, messageHandler, isNewObject) {
      const sProgrammingModel = this.getProgrammingModel(context);
      if (sProgrammingModel !== ProgrammingModel.Sticky && sProgrammingModel !== ProgrammingModel.Draft) {
        throw new Error("Save is only allowed for draft or sticky session supported services");
      }
      try {
        this.busyLock(appComponent);
        const oActiveDocument = sProgrammingModel === ProgrammingModel.Draft ? await draft.activateDocument(context, appComponent, {}, messageHandler) : await sticky.activateDocument(context, appComponent);
        const messagesReceived = messageHandling.getMessages().concat(messageHandling.getMessages(true, true)); // get unbound and bound messages present in the model
        if (!(messagesReceived.length === 1 && messagesReceived[0].type === coreLibrary.MessageType.Success)) {
          // show our object creation toast only if it is not coming from backend
          MessageToast.show(isNewObject ? resourceModel.getText("C_TRANSACTION_HELPER_OBJECT_CREATED") : resourceModel.getText("C_TRANSACTION_HELPER_OBJECT_SAVED"));
        }
        return oActiveDocument;
      } catch (err) {
        if (executeSideEffectsOnError && (bindingsForSideEffects === null || bindingsForSideEffects === void 0 ? void 0 : bindingsForSideEffects.length) > 0) {
          /* The sideEffects are executed only for table items in transient state */
          bindingsForSideEffects.forEach(listBinding => {
            if (!CommonUtils.hasTransientContext(listBinding)) {
              appComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(listBinding.getPath(), context);
            }
          });
        }
        await messageHandler.showMessages();
        throw err;
      } finally {
        this.busyUnlock(appComponent);
      }
    }

    /**
     * Calls a bound or unbound action.
     *
     * @function
     * @static
     * @name sap.fe.core.TransactionHelper.callAction
     * @memberof sap.fe.core.TransactionHelper
     * @param sActionName The name of the action to be called
     * @param [mParameters] Contains the following attributes:
     * @param [mParameters.parameterValues] A map of action parameter names and provided values
     * @param [mParameters.skipParameterDialog] Skips the parameter dialog if values are provided for all of them
     * @param [mParameters.contexts] Mandatory for a bound action: Either one context or an array with contexts for which the action is to be called
     * @param [mParameters.model] Mandatory for an unbound action: An instance of an OData V4 model
     * @param [mParameters.invocationGrouping] Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
     * @param [mParameters.label] A human-readable label for the action
     * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
     * @param oView Contains the object of the current view
     * @param appComponent The appComponent
     * @param messageHandler The message handler extension
     * @returns Promise resolves with an array of response objects (TODO: to be changed)
     * @ui5-restricted
     * @final
     */;
    _proto.callAction = async function callAction(sActionName, mParameters, oView, appComponent, messageHandler) {
      mParameters = getParameters(mParameters);
      let contextToProcess, oModel;
      const mBindingParameters = mParameters.bindingParameters;
      if (!sActionName) {
        throw new Error("Provide name of action to be executed");
      }
      // action imports are not directly obtained from the metaModel by it is present inside the entityContainer
      // and the acions it refers to present outside the entitycontainer, hence to obtain kind of the action
      // split() on its name was required
      const sName = sActionName.split("/")[1];
      sActionName = sName || sActionName;
      contextToProcess = sName ? undefined : mParameters.contexts;
      //checking whether the context is an array with more than 0 length or not an array(create action)
      if (contextToProcess && (Array.isArray(contextToProcess) && contextToProcess.length || !Array.isArray(contextToProcess))) {
        contextToProcess = Array.isArray(contextToProcess) ? contextToProcess[0] : contextToProcess;
        oModel = contextToProcess.getModel();
      }
      if (mParameters.model) {
        oModel = mParameters.model;
      }
      if (!oModel) {
        throw new Error("Pass a context for a bound action or pass the model for an unbound action");
      }
      // get the binding parameters $select and $expand for the side effect on this action
      // also gather additional property paths to be requested such as text associations
      const mSideEffectsParameters = appComponent.getSideEffectsService().getODataActionSideEffects(sActionName, contextToProcess) || {};
      try {
        let oResult;
        if (contextToProcess && oModel) {
          oResult = await operations.callBoundAction(sActionName, mParameters.contexts, oModel, appComponent, {
            parameterValues: mParameters.parameterValues,
            invocationGrouping: mParameters.invocationGrouping,
            label: mParameters.label,
            skipParameterDialog: mParameters.skipParameterDialog,
            mBindingParameters: mBindingParameters,
            entitySetName: mParameters.entitySetName,
            additionalSideEffect: mSideEffectsParameters,
            onSubmitted: () => {
              messageHandler.removeTransitionMessages();
              this.busyLock(appComponent);
            },
            onResponse: () => {
              this.busyUnlock(appComponent);
            },
            parentControl: mParameters.parentControl,
            controlId: mParameters.controlId,
            internalModelContext: mParameters.internalModelContext,
            operationAvailableMap: mParameters.operationAvailableMap,
            bIsCreateAction: mParameters.bIsCreateAction,
            bGetBoundContext: mParameters.bGetBoundContext,
            bObjectPage: mParameters.bObjectPage,
            messageHandler: messageHandler,
            defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
            selectedItems: mParameters.contexts
          });
        } else {
          oResult = await operations.callActionImport(sActionName, oModel, appComponent, {
            parameterValues: mParameters.parameterValues,
            label: mParameters.label,
            skipParameterDialog: mParameters.skipParameterDialog,
            bindingParameters: mBindingParameters,
            entitySetName: mParameters.entitySetName,
            onSubmitted: () => {
              this.busyLock(appComponent);
            },
            onResponse: () => {
              this.busyUnlock(appComponent);
            },
            parentControl: mParameters.parentControl,
            internalModelContext: mParameters.internalModelContext,
            operationAvailableMap: mParameters.operationAvailableMap,
            messageHandler: messageHandler,
            bObjectPage: mParameters.bObjectPage
          });
        }
        await this._handleActionResponse(messageHandler, mParameters, sActionName);
        return oResult;
      } catch (err) {
        await this._handleActionResponse(messageHandler, mParameters, sActionName);
        throw err;
      }
    }

    /**
     * Handles messages for action call.
     *
     * @function
     * @name sap.fe.core.TransactionHelper#_handleActionResponse
     * @memberof sap.fe.core.TransactionHelper
     * @param messageHandler The message handler extension
     * @param mParameters Parameters to be considered for the action.
     * @param sActionName The name of the action to be called
     * @returns Promise after message dialog is opened if required.
     * @ui5-restricted
     * @final
     */;
    _proto._handleActionResponse = function _handleActionResponse(messageHandler, mParameters, sActionName) {
      const aTransientMessages = messageHandling.getMessages(true, true);
      const actionName = mParameters.label ? mParameters.label : sActionName;
      if (aTransientMessages.length > 0 && mParameters && mParameters.internalModelContext) {
        mParameters.internalModelContext.setProperty("sActionName", mParameters.label ? mParameters.label : sActionName);
      }
      let control;
      if (mParameters.controlId) {
        control = mParameters.parentControl.byId(mParameters.controlId);
      } else {
        control = mParameters.parentControl;
      }
      return messageHandler.showMessages({
        sActionName: actionName,
        control: control
      });
    }

    /**
     * Handles validation errors for the 'Discard' action.
     *
     * @function
     * @name sap.fe.core.TransactionHelper#handleValidationError
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @ui5-restricted
     * @final
     */;
    _proto.handleValidationError = function handleValidationError() {
      const oMessageManager = Core.getMessageManager(),
        errorToRemove = oMessageManager.getMessageModel().getData().filter(function (error) {
          // only needs to handle validation messages, technical and persistent errors needs not to be checked here.
          if (error.validation) {
            return error;
          }
        });
      oMessageManager.removeMessages(errorToRemove);
    }

    /**
     * Creates a new Popover. Factory method to make unit tests easier.
     *
     * @param settings Initial parameters for the popover
     * @returns A new Popover
     */;
    _proto._createPopover = function _createPopover(settings) {
      return new Popover(settings);
    }

    /**
     * Shows a popover to confirm discard if needed.
     *
     * @static
     * @name sap.fe.core.TransactionHelper._showDiscardPopover
     * @memberof sap.fe.core.TransactionHelper
     * @param cancelButton The control which will open the popover
     * @param isModified True if the object has been modified and a confirmation popover must be shown
     * @param resourceModel The model to load text resources
     * @returns Promise resolves if user confirms discard, rejects if otherwise, rejects if no control passed to open popover
     * @ui5-restricted
     * @final
     */;
    _proto._confirmDiscard = function _confirmDiscard(cancelButton, isModified, resourceModel) {
      // If the data isn't modified, do not show any confirmation popover
      if (!isModified) {
        this.handleValidationError();
        return Promise.resolve();
      }
      cancelButton.setEnabled(false);
      return new Promise((resolve, reject) => {
        const confirmationPopover = this._createPopover({
          showHeader: false,
          placement: "Top"
        });
        confirmationPopover.addStyleClass("sapUiContentPadding");

        // Create the content of the popover
        const title = new Text({
          text: resourceModel.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_MESSAGE")
        });
        const confirmButton = new Button({
          text: resourceModel.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON"),
          width: "100%",
          press: () => {
            this.handleValidationError();
            confirmationPopover.data("continueDiscard", true);
            confirmationPopover.close();
          },
          ariaLabelledBy: [title]
        });
        confirmationPopover.addContent(new VBox({
          items: [title, confirmButton]
        }));

        // Attach handler
        confirmationPopover.attachBeforeOpen(() => {
          confirmationPopover.setInitialFocus(confirmButton);
        });
        confirmationPopover.attachAfterClose(() => {
          cancelButton.setEnabled(true);
          if (confirmationPopover.data("continueDiscard")) {
            resolve();
          } else {
            reject();
          }
        });
        confirmationPopover.openBy(cancelButton, false);
      });
    };
    _proto._launchDialogWithKeyFields = function _launchDialogWithKeyFields(oListBinding, mFields, oModel, mParameters, appComponent, messageHandler) {
      let oDialog;
      const oParentControl = mParameters.parentControl;

      // Crate a fake (transient) listBinding and context, just for the binding context of the dialog
      const oTransientListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
        $$updateGroupId: "submitLater"
      });
      oTransientListBinding.refreshInternal = function () {
        /* */
      };
      const oTransientContext = oTransientListBinding.create(mParameters.data, true);
      return new Promise(async (resolve, reject) => {
        const sFragmentName = "sap/fe/core/controls/NonComputedVisibleKeyFieldsDialog";
        const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
          resourceModel = getResourceModel(oParentControl),
          oMetaModel = oModel.getMetaModel(),
          aImmutableFields = [],
          sPath = oListBinding.isRelative() ? oListBinding.getResolvedPath() : oListBinding.getPath(),
          oEntitySetContext = oMetaModel.createBindingContext(sPath),
          sMetaPath = oMetaModel.getMetaPath(sPath);
        for (const i in mFields) {
          aImmutableFields.push(oMetaModel.createBindingContext(`${sMetaPath}/${mFields[i]}`));
        }
        const oImmutableCtxModel = new JSONModel(aImmutableFields);
        const oImmutableCtx = oImmutableCtxModel.createBindingContext("/");
        const aRequiredProperties = getRequiredPropertiesFromInsertRestrictions(sMetaPath, oMetaModel);
        const oRequiredPropertyPathsCtxModel = new JSONModel(aRequiredProperties);
        const oRequiredPropertyPathsCtx = oRequiredPropertyPathsCtxModel.createBindingContext("/");
        const oNewFragment = await XMLPreprocessor.process(oFragment, {
          name: sFragmentName
        }, {
          bindingContexts: {
            entitySet: oEntitySetContext,
            fields: oImmutableCtx,
            requiredProperties: oRequiredPropertyPathsCtx
          },
          models: {
            entitySet: oEntitySetContext.getModel(),
            fields: oImmutableCtx.getModel(),
            metaModel: oMetaModel,
            requiredProperties: oRequiredPropertyPathsCtxModel
          }
        });
        let aFormElements = [];
        const mFieldValueMap = {};
        const messageManager = Core.getMessageManager();
        const _removeMessagesForActionParamter = messageControlId => {
          const allMessages = messageManager.getMessageModel().getData();
          // also remove messages assigned to inner controls, but avoid removing messages for different paramters (with name being substring of another parameter name)
          const relevantMessages = allMessages.filter(msg => msg.getControlIds().some(controlId => controlId.includes(messageControlId)));
          messageManager.removeMessages(relevantMessages);
        };
        const oController = {
          /*
          	fired on focus out from field or on selecting a value from the valuehelp.
          	the create button (Continue) is always enabled.
          	liveChange is not fired when value is added from valuehelp.
          	value validation is done for create button.
          */
          handleChange: async event => {
            const fieldId = event.getParameter("id");
            const field = event.getSource();
            const actionParameterInfo = actionParameterInfos.find(actionParameterInfo => actionParameterInfo.field === field);
            _removeMessagesForActionParamter(fieldId);
            actionParameterInfo.validationPromise = event.getParameter("promise");
            try {
              actionParameterInfo.value = await actionParameterInfo.validationPromise;
              actionParameterInfo.hasError = false;
            } catch (error) {
              delete actionParameterInfo.value;
              actionParameterInfo.hasError = true;
            }
          },
          /*
          	fired on key press. the create button the create button (Continue) is always enabled.
          	liveChange is not fired when value is added from valuehelp.
          	value validation is done for create button.
          */
          handleLiveChange: event => {
            const fieldId = event.getParameter("id");
            _removeMessagesForActionParamter(fieldId);
          }
        };
        const oDialogContent = await Fragment.load({
          definition: oNewFragment,
          controller: oController
        });
        let oResult;
        const closeDialog = function () {
          //rejected/resolved the promis returned by _launchDialogWithKeyFields
          //as soon as the dialog is closed. Without waiting for the dialog's
          //animation to finish
          if (oResult.error) {
            reject(oResult.error);
          } else {
            resolve(oResult.response);
          }
          oDialog.close();
        };
        oDialog = new Dialog(generate(["CreateDialog", sMetaPath]), {
          title: resourceModel.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE"),
          content: [oDialogContent],
          beginButton: {
            text: resourceModel.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON"),
            type: "Emphasized",
            press: async _Event => {
              /* Validation of mandatory and value state for action parameters */
              if (!(await ActionRuntime.validateProperties(messageManager, actionParameterInfos, resourceModel))) {
                return;
              }
              BusyLocker.lock(oDialog);
              mParameters.bIsCreateDialog = true;
              try {
                const aValues = await Promise.all(Object.keys(mFieldValueMap).map(async function (sKey) {
                  const oValue = await mFieldValueMap[sKey];
                  const oDialogValue = {};
                  oDialogValue[sKey] = oValue;
                  return oDialogValue;
                }));
                if (mParameters.beforeCreateCallBack) {
                  await toES6Promise(mParameters.beforeCreateCallBack({
                    contextPath: oListBinding && oListBinding.getPath(),
                    createParameters: aValues
                  }));
                }
                const transientData = oTransientContext.getObject();
                const createData = {};
                Object.keys(transientData).forEach(function (sPropertyPath) {
                  const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
                  // ensure navigation properties are not part of the payload, deep create not supported
                  if (oProperty && oProperty.$kind === "NavigationProperty") {
                    return;
                  }
                  createData[sPropertyPath] = transientData[sPropertyPath];
                });
                const oNewDocumentContext = oListBinding.create(createData, true, mParameters.createAtEnd, mParameters.inactive);
                const oPromise = this.onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters);
                let oResponse = await oPromise;
                if (!oResponse || oResponse && oResponse.bKeepDialogOpen !== true) {
                  oResponse = oResponse ?? {};
                  oDialog.setBindingContext(null);
                  oResponse.newContext = oNewDocumentContext;
                  oResult = {
                    response: oResponse
                  };
                  closeDialog();
                }
              } catch (oError) {
                // in case of creation failed, dialog should stay open - to achieve the same, nothing has to be done (like in case of success with bKeepDialogOpen)
                if (oError !== FELibrary.Constants.CreationFailed) {
                  // other errors are not expected
                  oResult = {
                    error: oError
                  };
                  closeDialog();
                }
              } finally {
                BusyLocker.unlock(oDialog);
                messageHandler.showMessages();
              }
            }
          },
          endButton: {
            text: resourceModel.getText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL"),
            press: function () {
              oResult = {
                error: FELibrary.Constants.CancelActionDialog
              };
              closeDialog();
            }
          },
          afterClose: function () {
            var _oDialog$getBindingCo;
            /* When the dialog is cancelled, messages need to be removed in case the same action should be executed again */
            for (const actionParameterInfo of actionParameterInfos) {
              const fieldId = actionParameterInfo.field.getId();
              _removeMessagesForActionParamter(fieldId);
            }
            // show footer as per UX guidelines when dialog is not open
            (_oDialog$getBindingCo = oDialog.getBindingContext("internal")) === null || _oDialog$getBindingCo === void 0 ? void 0 : _oDialog$getBindingCo.setProperty("isCreateDialogOpen", false);
            oDialog.destroy();
            oTransientListBinding.destroy();
          }
        });
        aFormElements = oDialogContent === null || oDialogContent === void 0 ? void 0 : oDialogContent.getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");
        const actionParameterInfos = aFormElements.map(parameterField => {
          const field = parameterField.getFields()[0];
          const isMultiValue = field.isA("sap.ui.mdc.MultiValueField");
          return {
            parameter: parameterField,
            isMultiValue: isMultiValue,
            field: field,
            value: isMultiValue ? field.getItems() : field.getValue(),
            validationPromise: undefined,
            hasError: false
          };
        });
        if (oParentControl && oParentControl.addDependent) {
          // if there is a parent control specified add the dialog as dependent
          oParentControl.addDependent(oDialog);
        }
        oDialog.setBindingContext(oTransientContext);
        try {
          await CommonUtils.setUserDefaults(appComponent, aImmutableFields, oTransientContext, false, mParameters.createAction, mParameters.data);
          // footer must not be visible when the dialog is open as per UX guidelines
          oDialog.getBindingContext("internal").setProperty("isCreateDialogOpen", true);
          oDialog.open();
        } catch (oError) {
          await messageHandler.showMessages();
          throw oError;
        }
      });
    };
    _proto.onAfterCreateCompletion = function onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters) {
      let fnResolve;
      const oPromise = new Promise(resolve => {
        fnResolve = resolve;
      });
      const fnCreateCompleted = oEvent => {
        const oContext = oEvent.getParameter("context"),
          bSuccess = oEvent.getParameter("success");
        if (oContext === oNewDocumentContext) {
          oListBinding.detachCreateCompleted(fnCreateCompleted, this);
          fnResolve(bSuccess);
        }
      };
      const fnSafeContextCreated = () => {
        oNewDocumentContext.created().then(undefined, function () {
          Log.trace("transient creation context deleted");
        }).catch(function (contextError) {
          Log.trace("transient creation context deletion error", contextError);
        });
      };
      oListBinding.attachCreateCompleted(fnCreateCompleted, this);
      return oPromise.then(bSuccess => {
        if (!bSuccess) {
          if (!mParameters.keepTransientContextOnFailed) {
            // Cancel the pending POST and delete the context in the listBinding
            fnSafeContextCreated(); // To avoid a 'request cancelled' error in the console
            oListBinding.resetChanges();
            oListBinding.getModel().resetChanges(oListBinding.getUpdateGroupId());
            throw FELibrary.Constants.CreationFailed;
          }
          return {
            bKeepDialogOpen: true
          };
        } else {
          return oNewDocumentContext.created();
        }
      });
    }

    /**
     * Retrieves the name of the NewAction to be executed.
     *
     * @function
     * @static
     * @private
     * @name sap.fe.core.TransactionHelper._getNewAction
     * @memberof sap.fe.core.TransactionHelper
     * @param oStartupParameters Startup parameters of the application
     * @param sCreateHash Hash to be checked for action type
     * @param oMetaModel The MetaModel used to check for NewAction parameter
     * @param sMetaPath The MetaPath
     * @returns The name of the action
     * @ui5-restricted
     * @final
     */;
    _proto._getNewAction = function _getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath) {
      let sNewAction;
      if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=CREATEWITH") > -1) {
        const sPreferredMode = oStartupParameters.preferredMode[0];
        sNewAction = sPreferredMode.toUpperCase().indexOf("CREATEWITH:") > -1 ? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1) : undefined;
      } else if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=AUTOCREATEWITH") > -1) {
        const sPreferredMode = oStartupParameters.preferredMode[0];
        sNewAction = sPreferredMode.toUpperCase().indexOf("AUTOCREATEWITH:") > -1 ? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1) : undefined;
      } else {
        sNewAction = oMetaModel && oMetaModel.getObject !== undefined ? oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction`) || oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction`) : undefined;
      }
      return sNewAction;
    }

    /**
     * Retrieves the label for the title of a specific create action dialog, e.g. Create Sales Order from Quotation.
     *
     * The following priority is applied:
     * 1. label of line-item annotation.
     * 2. label annotated in the action.
     * 3. "Create" as a constant from i18n.
     *
     * @function
     * @static
     * @private
     * @name sap.fe.core.TransactionHelper._getSpecificCreateActionDialogLabel
     * @memberof sap.fe.core.TransactionHelper
     * @param oMetaModel The MetaModel used to check for the NewAction parameter
     * @param sMetaPath The MetaPath
     * @param sNewAction Contains the name of the action to be executed
     * @param oResourceBundleCore ResourceBundle to access the default Create label
     * @returns The label for the Create Action Dialog
     * @ui5-restricted
     * @final
     */;
    _proto._getSpecificCreateActionDialogLabel = function _getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore) {
      const fnGetLabelFromLineItemAnnotation = function () {
        if (oMetaModel && oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)) {
          const iLineItemIndex = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`).findIndex(function (oLineItem) {
            const aLineItemAction = oLineItem.Action ? oLineItem.Action.split("(") : undefined;
            return aLineItemAction ? aLineItemAction[0] === sNewAction : false;
          });
          return iLineItemIndex > -1 ? oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)[iLineItemIndex].Label : undefined;
        } else {
          return undefined;
        }
      };
      return fnGetLabelFromLineItemAnnotation() || oMetaModel && oMetaModel.getObject(`${sMetaPath}/${sNewAction}@com.sap.vocabularies.Common.v1.Label`) || oResourceBundleCore && oResourceBundleCore.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE");
    };
    return TransactionHelper;
  }();
  const singleton = new TransactionHelper();
  return singleton;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJQcm9ncmFtbWluZ01vZGVsIiwiRGVsZXRlT3B0aW9uVHlwZXMiLCJkZWxldGVIZWxwZXIiLCJEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbCIsImdldFBhcmFtZXRlcnMiLCJtUGFyYW1ldGVycyIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsIlRyYW5zYWN0aW9uSGVscGVyIiwiYnVzeUxvY2siLCJhcHBDb21wb25lbnQiLCJidXN5UGF0aCIsIkJ1c3lMb2NrZXIiLCJsb2NrIiwiZ2V0TW9kZWwiLCJidXN5VW5sb2NrIiwidW5sb2NrIiwiZ2V0UHJvZ3JhbW1pbmdNb2RlbCIsInNvdXJjZSIsInBhdGgiLCJpc0EiLCJnZXRQYXRoIiwiaXNSZWxhdGl2ZSIsImdldFJlc29sdmVkUGF0aCIsIm1ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsIk1vZGVsSGVscGVyIiwiaXNEcmFmdFN1cHBvcnRlZCIsIkRyYWZ0IiwiaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiU3RpY2t5IiwiTm9uRHJhZnQiLCJ2YWxpZGF0ZURvY3VtZW50Iiwib0NvbnRleHQiLCJvVmlldyIsInNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJzTW9kdWxlIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJyZXBsYWNlIiwic0Z1bmN0aW9uTmFtZSIsImxlbmd0aCIsIm1EYXRhIiwiZGF0YSIsIkZQTUhlbHBlciIsInZhbGlkYXRpb25XcmFwcGVyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJjcmVhdGVEb2N1bWVudCIsIm9NYWluTGlzdEJpbmRpbmciLCJtSW5QYXJhbWV0ZXJzIiwibWVzc2FnZUhhbmRsZXIiLCJmcm9tQ29weVBhc3RlIiwib01vZGVsIiwib01ldGFNb2RlbCIsInNNZXRhUGF0aCIsImdldE1ldGFQYXRoIiwiZ2V0SGVhZGVyQ29udGV4dCIsInNDcmVhdGVIYXNoIiwiZ2V0Um91dGVyUHJveHkiLCJnZXRIYXNoIiwib0NvbXBvbmVudERhdGEiLCJnZXRDb21wb25lbnREYXRhIiwib1N0YXJ0dXBQYXJhbWV0ZXJzIiwic3RhcnR1cFBhcmFtZXRlcnMiLCJzTmV3QWN0aW9uIiwiX2dldE5ld0FjdGlvbiIsInVuZGVmaW5lZCIsIm1CaW5kaW5nUGFyYW1ldGVycyIsIiQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHMiLCJzTWVzc2FnZXNQYXRoIiwiZ2V0T2JqZWN0Iiwic0J1c3lQYXRoIiwiZ2V0VGFyZ2V0RW50aXR5U2V0IiwiZ2V0Q29udGV4dCIsImJGdW5jdGlvbk9uTmF2UHJvcCIsIm9OZXdEb2N1bWVudENvbnRleHQiLCJFcnJvciIsInNQcm9ncmFtbWluZ01vZGVsIiwiYnVzeU1vZGUiLCJidXN5SWQiLCJiZWZvcmVDcmVhdGVDYWxsQmFjayIsIm9SZXNvdXJjZUJ1bmRsZUNvcmUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwib1Jlc3VsdCIsImNhbGxBY3Rpb24iLCJjb250ZXh0cyIsInNob3dBY3Rpb25QYXJhbWV0ZXJEaWFsb2ciLCJsYWJlbCIsIl9nZXRTcGVjaWZpY0NyZWF0ZUFjdGlvbkRpYWxvZ0xhYmVsIiwiYmluZGluZ1BhcmFtZXRlcnMiLCJwYXJlbnRDb250cm9sIiwiYklzQ3JlYXRlQWN0aW9uIiwic2tpcFBhcmFtZXRlckRpYWxvZyIsImJJc05ld1BhZ2VDcmVhdGlvbiIsImNyZWF0aW9uTW9kZSIsIkNyZWF0aW9uUm93IiwiSW5saW5lIiwiYU5vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkcyIsImdldE5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkcyIsInNGdW5jdGlvblBhdGgiLCJvRnVuY3Rpb25Db250ZXh0Iiwib0Z1bmN0aW9uIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJvRGF0YSIsIiRJc0JvdW5kIiwib3BlcmF0aW9ucyIsImNhbGxCb3VuZEZ1bmN0aW9uIiwiY2FsbEZ1bmN0aW9uSW1wb3J0Iiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJPYmplY3QiLCJhc3NpZ24iLCJfbGF1bmNoRGlhbG9nV2l0aEtleUZpZWxkcyIsIm5ld0NvbnRleHQiLCJ0b0VTNlByb21pc2UiLCJjb250ZXh0UGF0aCIsImNyZWF0ZSIsImNyZWF0ZUF0RW5kIiwiaW5hY3RpdmUiLCJvbkFmdGVyQ3JlYXRlQ29tcGxldGlvbiIsInNob3dNZXNzYWdlRGlhbG9nIiwiY29udHJvbCIsIkNvbnN0YW50cyIsIkFjdGlvbkV4ZWN1dGlvbkZhaWxlZCIsIkNhbmNlbEFjdGlvbkRpYWxvZyIsImlzVHJhbnNpZW50IiwiZGVsZXRlIiwiX2lzRHJhZnRFbmFibGVkIiwidkNvbnRleHRzIiwiY29udGV4dEZvckRyYWZ0TW9kZWwiLCJkZWxldGVEb2N1bWVudCIsInJlc291cmNlTW9kZWwiLCJyZXNvdXJjZUJ1bmRsZUNvcmUiLCJhUGFyYW1zIiwiY29udGV4dHNUb0RlbGV0ZSIsIkFycmF5IiwiaXNBcnJheSIsInJlamVjdCIsImRyYWZ0RW5hYmxlZCIsInNlbGVjdGVkQ29udGV4dHMiLCJpdGVtcyIsIm9wdGlvbnMiLCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMiLCJsb2NrZWRDb250ZXh0IiwiZmluZCIsImNvbnRleHQiLCJjb250ZXh0RGF0YSIsIklzQWN0aXZlRW50aXR5IiwiSGFzRHJhZnRFbnRpdHkiLCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YSIsIkluUHJvY2Vzc0J5VXNlciIsIkRyYWZ0SXNDcmVhdGVkQnlNZSIsImxvY2tpbmdVc2VyTmFtZSIsIk1lc3NhZ2VCb3giLCJzaG93IiwiZ2V0VGV4dCIsInRpdGxlIiwib25DbG9zZSIsIm5vblRhYmxlVHh0IiwiZGVzY3JpcHRpb24iLCJlbnRpdHlTZXROYW1lIiwicHVzaCIsInR5cGUiLCJkZWxldGFibGVDb250ZXh0cyIsInRleHQiLCJzZWxlY3RlZCIsIlRFWFQiLCJ0b3RhbERlbGV0YWJsZSIsImRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUiLCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlIiwidW5TYXZlZENvbnRleHRzIiwidXBkYXRlRHJhZnRPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMiLCJub25EZWxldGFibGVUZXh0IiwiZ2V0Tm9uRGVsZXRhYmxlVGV4dCIsIm9wdGlvbnNEZWxldGFibGVUZXh0cyIsImdldE9wdGlvbnNGb3JEZWxldGFibGVUZXh0cyIsInVwZGF0ZUNvbnRlbnRGb3JEZWxldGVEaWFsb2ciLCJ2Qm94IiwiVkJveCIsInNUaXRsZSIsImZuQ29uZmlybSIsImRlbGV0ZUNvbmZpcm1IYW5kbGVyIiwiZGlhbG9nQ29uZmlybWVkIiwib0RpYWxvZyIsIkRpYWxvZyIsInN0YXRlIiwiY29udGVudCIsImFyaWFMYWJlbGxlZEJ5IiwiYmVnaW5CdXR0b24iLCJCdXR0b24iLCJwcmVzcyIsIm1lc3NhZ2VIYW5kbGluZyIsInJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwiY2xvc2UiLCJlbmRCdXR0b24iLCJhZnRlckNsb3NlIiwiZGVzdHJveSIsIm5vRGlhbG9nIiwiYWRkU3R5bGVDbGFzcyIsIm9wZW4iLCJlZGl0RG9jdW1lbnQiLCJyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMiLCJvTmV3Q29udGV4dCIsImRyYWZ0IiwiY3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnQiLCJiUHJlc2VydmVDaGFuZ2VzIiwic3RpY2t5IiwiZWRpdERvY3VtZW50SW5TdGlja3lTZXNzaW9uIiwiZXJyIiwic2hvd01lc3NhZ2VzIiwiY29uY3VycmVudEVkaXRGbGFnIiwiY2FuY2VsRG9jdW1lbnQiLCJpc05ld09iamVjdCIsImlzT2JqZWN0TW9kaWZpZWQiLCJyZXR1cm5lZFZhbHVlIiwiZHJhZnREYXRhQ29udGV4dCIsImJpbmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0IiwiZHJhZnRBZG1pbkRhdGEiLCJyZXF1ZXN0T2JqZWN0IiwiQ3JlYXRpb25EYXRlVGltZSIsIkxhc3RDaGFuZ2VEYXRlVGltZSIsInNraXBEaXNjYXJkUG9wb3ZlciIsIl9jb25maXJtRGlzY2FyZCIsImNhbmNlbEJ1dHRvbiIsImlzS2VlcEFsaXZlIiwic2V0S2VlcEFsaXZlIiwiYmVmb3JlQ2FuY2VsQ2FsbEJhY2siLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImdldEJpbmRpbmciLCJyZXNldENoYW5nZXMiLCJkZWxldGVEcmFmdCIsIm9TaWJsaW5nQ29udGV4dCIsInNDYW5vbmljYWxQYXRoIiwicmVxdWVzdENhbm9uaWNhbFBhdGgiLCJkaXNjYXJkZWRDb250ZXh0IiwiZGlzY2FyZERvY3VtZW50IiwicmVmcmVzaCIsInNhdmVEb2N1bWVudCIsImV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IiLCJiaW5kaW5nc0ZvclNpZGVFZmZlY3RzIiwib0FjdGl2ZURvY3VtZW50IiwiYWN0aXZhdGVEb2N1bWVudCIsIm1lc3NhZ2VzUmVjZWl2ZWQiLCJnZXRNZXNzYWdlcyIsImNvbmNhdCIsImNvcmVMaWJyYXJ5IiwiTWVzc2FnZVR5cGUiLCJTdWNjZXNzIiwiTWVzc2FnZVRvYXN0IiwiZm9yRWFjaCIsImxpc3RCaW5kaW5nIiwiQ29tbW9uVXRpbHMiLCJoYXNUcmFuc2llbnRDb250ZXh0IiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwicmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5Iiwic0FjdGlvbk5hbWUiLCJjb250ZXh0VG9Qcm9jZXNzIiwic05hbWUiLCJzcGxpdCIsIm1vZGVsIiwibVNpZGVFZmZlY3RzUGFyYW1ldGVycyIsImdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMiLCJjYWxsQm91bmRBY3Rpb24iLCJwYXJhbWV0ZXJWYWx1ZXMiLCJpbnZvY2F0aW9uR3JvdXBpbmciLCJhZGRpdGlvbmFsU2lkZUVmZmVjdCIsIm9uU3VibWl0dGVkIiwib25SZXNwb25zZSIsImNvbnRyb2xJZCIsImludGVybmFsTW9kZWxDb250ZXh0Iiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiYkdldEJvdW5kQ29udGV4dCIsImJPYmplY3RQYWdlIiwiZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uIiwic2VsZWN0ZWRJdGVtcyIsImNhbGxBY3Rpb25JbXBvcnQiLCJfaGFuZGxlQWN0aW9uUmVzcG9uc2UiLCJhVHJhbnNpZW50TWVzc2FnZXMiLCJhY3Rpb25OYW1lIiwic2V0UHJvcGVydHkiLCJieUlkIiwiaGFuZGxlVmFsaWRhdGlvbkVycm9yIiwib01lc3NhZ2VNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJlcnJvclRvUmVtb3ZlIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsImZpbHRlciIsInZhbGlkYXRpb24iLCJyZW1vdmVNZXNzYWdlcyIsIl9jcmVhdGVQb3BvdmVyIiwic2V0dGluZ3MiLCJQb3BvdmVyIiwiaXNNb2RpZmllZCIsInNldEVuYWJsZWQiLCJjb25maXJtYXRpb25Qb3BvdmVyIiwic2hvd0hlYWRlciIsInBsYWNlbWVudCIsIlRleHQiLCJjb25maXJtQnV0dG9uIiwid2lkdGgiLCJhZGRDb250ZW50IiwiYXR0YWNoQmVmb3JlT3BlbiIsInNldEluaXRpYWxGb2N1cyIsImF0dGFjaEFmdGVyQ2xvc2UiLCJvcGVuQnkiLCJvTGlzdEJpbmRpbmciLCJtRmllbGRzIiwib1BhcmVudENvbnRyb2wiLCJvVHJhbnNpZW50TGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsIiQkdXBkYXRlR3JvdXBJZCIsInJlZnJlc2hJbnRlcm5hbCIsIm9UcmFuc2llbnRDb250ZXh0Iiwic0ZyYWdtZW50TmFtZSIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwiZ2V0UmVzb3VyY2VNb2RlbCIsImFJbW11dGFibGVGaWVsZHMiLCJzUGF0aCIsIm9FbnRpdHlTZXRDb250ZXh0IiwiaSIsIm9JbW11dGFibGVDdHhNb2RlbCIsIkpTT05Nb2RlbCIsIm9JbW11dGFibGVDdHgiLCJhUmVxdWlyZWRQcm9wZXJ0aWVzIiwiZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyIsIm9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHhNb2RlbCIsIm9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHgiLCJvTmV3RnJhZ21lbnQiLCJYTUxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwibmFtZSIsImJpbmRpbmdDb250ZXh0cyIsImVudGl0eVNldCIsImZpZWxkcyIsInJlcXVpcmVkUHJvcGVydGllcyIsIm1vZGVscyIsImFGb3JtRWxlbWVudHMiLCJtRmllbGRWYWx1ZU1hcCIsIm1lc3NhZ2VNYW5hZ2VyIiwiX3JlbW92ZU1lc3NhZ2VzRm9yQWN0aW9uUGFyYW10ZXIiLCJtZXNzYWdlQ29udHJvbElkIiwiYWxsTWVzc2FnZXMiLCJyZWxldmFudE1lc3NhZ2VzIiwibXNnIiwiZ2V0Q29udHJvbElkcyIsInNvbWUiLCJpbmNsdWRlcyIsIm9Db250cm9sbGVyIiwiaGFuZGxlQ2hhbmdlIiwiZXZlbnQiLCJmaWVsZElkIiwiZ2V0UGFyYW1ldGVyIiwiZmllbGQiLCJnZXRTb3VyY2UiLCJhY3Rpb25QYXJhbWV0ZXJJbmZvIiwiYWN0aW9uUGFyYW1ldGVySW5mb3MiLCJ2YWxpZGF0aW9uUHJvbWlzZSIsInZhbHVlIiwiaGFzRXJyb3IiLCJoYW5kbGVMaXZlQ2hhbmdlIiwib0RpYWxvZ0NvbnRlbnQiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiY29udHJvbGxlciIsImNsb3NlRGlhbG9nIiwicmVzcG9uc2UiLCJnZW5lcmF0ZSIsIl9FdmVudCIsIkFjdGlvblJ1bnRpbWUiLCJ2YWxpZGF0ZVByb3BlcnRpZXMiLCJiSXNDcmVhdGVEaWFsb2ciLCJhVmFsdWVzIiwiYWxsIiwia2V5cyIsIm1hcCIsInNLZXkiLCJvVmFsdWUiLCJvRGlhbG9nVmFsdWUiLCJjcmVhdGVQYXJhbWV0ZXJzIiwidHJhbnNpZW50RGF0YSIsImNyZWF0ZURhdGEiLCJzUHJvcGVydHlQYXRoIiwib1Byb3BlcnR5IiwiJGtpbmQiLCJvUHJvbWlzZSIsIm9SZXNwb25zZSIsImJLZWVwRGlhbG9nT3BlbiIsInNldEJpbmRpbmdDb250ZXh0IiwiQ3JlYXRpb25GYWlsZWQiLCJnZXRJZCIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0QWdncmVnYXRpb24iLCJwYXJhbWV0ZXJGaWVsZCIsImdldEZpZWxkcyIsImlzTXVsdGlWYWx1ZSIsInBhcmFtZXRlciIsImdldEl0ZW1zIiwiZ2V0VmFsdWUiLCJhZGREZXBlbmRlbnQiLCJzZXRVc2VyRGVmYXVsdHMiLCJjcmVhdGVBY3Rpb24iLCJmblJlc29sdmUiLCJmbkNyZWF0ZUNvbXBsZXRlZCIsIm9FdmVudCIsImJTdWNjZXNzIiwiZGV0YWNoQ3JlYXRlQ29tcGxldGVkIiwiZm5TYWZlQ29udGV4dENyZWF0ZWQiLCJjcmVhdGVkIiwidGhlbiIsInRyYWNlIiwiY2F0Y2giLCJjb250ZXh0RXJyb3IiLCJhdHRhY2hDcmVhdGVDb21wbGV0ZWQiLCJrZWVwVHJhbnNpZW50Q29udGV4dE9uRmFpbGVkIiwiZ2V0VXBkYXRlR3JvdXBJZCIsInByZWZlcnJlZE1vZGUiLCJ0b1VwcGVyQ2FzZSIsImluZGV4T2YiLCJzUHJlZmVycmVkTW9kZSIsInN1YnN0ciIsImZuR2V0TGFiZWxGcm9tTGluZUl0ZW1Bbm5vdGF0aW9uIiwiaUxpbmVJdGVtSW5kZXgiLCJmaW5kSW5kZXgiLCJvTGluZUl0ZW0iLCJhTGluZUl0ZW1BY3Rpb24iLCJBY3Rpb24iLCJMYWJlbCIsInNpbmdsZXRvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVHJhbnNhY3Rpb25IZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IEFjdGlvblJ1bnRpbWUsIHsgQWN0aW9uUGFyYW1ldGVySW5mbyB9IGZyb20gXCJzYXAvZmUvY29yZS9BY3Rpb25SdW50aW1lXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCBkcmFmdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCBvcGVyYXRpb25zIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9vcGVyYXRpb25zXCI7XG5pbXBvcnQgc3RpY2t5IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9zdGlja3lcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VIYW5kbGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9NZXNzYWdlSGFuZGxlclwiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgZGVsZXRlSGVscGVyLCB7IERlbGV0ZU9wdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0RlbGV0ZUhlbHBlclwiO1xuaW1wb3J0IEZQTUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IEZFTGlicmFyeSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IE1lc3NhZ2VUb2FzdCBmcm9tIFwic2FwL20vTWVzc2FnZVRvYXN0XCI7XG5pbXBvcnQgUG9wb3ZlciwgeyAkUG9wb3ZlclNldHRpbmdzIH0gZnJvbSBcInNhcC9tL1BvcG92ZXJcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgVkJveCBmcm9tIFwic2FwL20vVkJveFwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IEZyYWdtZW50IGZyb20gXCJzYXAvdWkvY29yZS9GcmFnbWVudFwiO1xuaW1wb3J0IGNvcmVMaWJyYXJ5IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBYTUxUZW1wbGF0ZVByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvWE1MVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB0eXBlIEZpZWxkIGZyb20gXCJzYXAvdWkvbWRjL0ZpZWxkXCI7XG5pbXBvcnQgdHlwZSBNdWx0aVZhbHVlRmllbGQgZnJvbSBcInNhcC91aS9tZGMvTXVsdGlWYWx1ZUZpZWxkXCI7XG5pbXBvcnQgdHlwZSBCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvQmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFWNENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgeyBnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMsIGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9NZXRhTW9kZWxGdW5jdGlvblwiO1xuaW1wb3J0IHRvRVM2UHJvbWlzZSBmcm9tIFwiLi4vLi4vaGVscGVycy9Ub0VTNlByb21pc2VcIjtcblxuY29uc3QgQ3JlYXRpb25Nb2RlID0gRkVMaWJyYXJ5LkNyZWF0aW9uTW9kZTtcbmNvbnN0IFByb2dyYW1taW5nTW9kZWwgPSBGRUxpYnJhcnkuUHJvZ3JhbW1pbmdNb2RlbDtcblxuLy9FbnVtcyBmb3IgZGVsZXRlIHRleHQgY2FsY3VsYXRpb25zIGZvciBkZWxldGUgY29uZmlybSBkaWFsb2cuXG5jb25zdCBEZWxldGVPcHRpb25UeXBlcyA9IGRlbGV0ZUhlbHBlci5EZWxldGVPcHRpb25UeXBlcztcbmNvbnN0IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sID0gZGVsZXRlSGVscGVyLkRlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sO1xuXG4vKiBNYWtlIHN1cmUgdGhhdCB0aGUgbVBhcmFtZXRlcnMgaXMgbm90IHRoZSBvRXZlbnQgKi9cbmZ1bmN0aW9uIGdldFBhcmFtZXRlcnMobVBhcmFtZXRlcnM6IGFueSkge1xuXHRpZiAobVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuZ2V0TWV0YWRhdGEgJiYgbVBhcmFtZXRlcnMuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkgPT09IFwic2FwLnVpLmJhc2UuRXZlbnRcIikge1xuXHRcdG1QYXJhbWV0ZXJzID0ge307XG5cdH1cblx0cmV0dXJuIG1QYXJhbWV0ZXJzIHx8IHt9O1xufVxuXG5jbGFzcyBUcmFuc2FjdGlvbkhlbHBlciB7XG5cdGJ1c3lMb2NrKGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LCBidXN5UGF0aD86IHN0cmluZykge1xuXHRcdEJ1c3lMb2NrZXIubG9jayhhcHBDb21wb25lbnQuZ2V0TW9kZWwoXCJ1aVwiKSwgYnVzeVBhdGgpO1xuXHR9XG5cblx0YnVzeVVubG9jayhhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgYnVzeVBhdGg/OiBzdHJpbmcpIHtcblx0XHRCdXN5TG9ja2VyLnVubG9jayhhcHBDb21wb25lbnQuZ2V0TW9kZWwoXCJ1aVwiKSwgYnVzeVBhdGgpO1xuXHR9XG5cblx0Z2V0UHJvZ3JhbW1pbmdNb2RlbChzb3VyY2U6IE9EYXRhVjRDb250ZXh0IHwgQmluZGluZyk6IHR5cGVvZiBQcm9ncmFtbWluZ01vZGVsIHtcblx0XHRsZXQgcGF0aDogc3RyaW5nO1xuXHRcdGlmIChzb3VyY2UuaXNBPE9EYXRhVjRDb250ZXh0PihcInNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0XCIpKSB7XG5cdFx0XHRwYXRoID0gc291cmNlLmdldFBhdGgoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGF0aCA9IChzb3VyY2UuaXNSZWxhdGl2ZSgpID8gc291cmNlLmdldFJlc29sdmVkUGF0aCgpIDogc291cmNlLmdldFBhdGgoKSkgPz8gXCJcIjtcblx0XHR9XG5cblx0XHRjb25zdCBtZXRhTW9kZWwgPSBzb3VyY2UuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRpZiAoTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChtZXRhTW9kZWwsIHBhdGgpKSB7XG5cdFx0XHRyZXR1cm4gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdDtcblx0XHR9IGVsc2UgaWYgKE1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChtZXRhTW9kZWwpKSB7XG5cdFx0XHRyZXR1cm4gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3k7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBQcm9ncmFtbWluZ01vZGVsLk5vbkRyYWZ0O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBWYWxpZGF0ZXMgYSBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGRvY3VtZW50IHRvIGJlIHZhbGlkYXRlZFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBDYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZGF0YV0gQSBtYXAgb2YgZGF0YSB0aGF0IHNob3VsZCBiZSB2YWxpZGF0ZWRcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5jdXN0b21WYWxpZGF0aW9uRnVuY3Rpb25dIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgcGF0aCB0byB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvblxuXHQgKiBAcGFyYW0gb1ZpZXcgQ29udGFpbnMgdGhlIG9iamVjdCBvZiB0aGUgY3VycmVudCB2aWV3XG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCByZXN1bHQgb2YgdGhlIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdHZhbGlkYXRlRG9jdW1lbnQob0NvbnRleHQ6IE9EYXRhVjRDb250ZXh0LCBtUGFyYW1ldGVyczogYW55LCBvVmlldzogVmlldyk6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3Qgc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiA9IG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbjtcblx0XHRpZiAoc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbikge1xuXHRcdFx0Y29uc3Qgc01vZHVsZSA9IHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24uc3Vic3RyaW5nKDAsIHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24ubGFzdEluZGV4T2YoXCIuXCIpIHx8IC0xKS5yZXBsYWNlKC9cXC4vZ2ksIFwiL1wiKSxcblx0XHRcdFx0c0Z1bmN0aW9uTmFtZSA9IHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24uc3Vic3RyaW5nKFxuXHRcdFx0XHRcdHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24ubGFzdEluZGV4T2YoXCIuXCIpICsgMSxcblx0XHRcdFx0XHRzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLmxlbmd0aFxuXHRcdFx0XHQpLFxuXHRcdFx0XHRtRGF0YSA9IG1QYXJhbWV0ZXJzLmRhdGE7XG5cdFx0XHRkZWxldGUgbURhdGFbXCJAJHVpNS5jb250ZXh0LmlzVHJhbnNpZW50XCJdO1xuXHRcdFx0cmV0dXJuIEZQTUhlbHBlci52YWxpZGF0aW9uV3JhcHBlcihzTW9kdWxlLCBzRnVuY3Rpb25OYW1lLCBtRGF0YSwgb1ZpZXcsIG9Db250ZXh0KTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIG9NYWluTGlzdEJpbmRpbmcgT0RhdGEgVjQgTGlzdEJpbmRpbmcgb2JqZWN0XG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVyc10gT3B0aW9uYWwsIGNhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzLmRhdGFdIEEgbWFwIG9mIGRhdGEgdGhhdCBzaG91bGQgYmUgc2VudCB3aXRoaW4gdGhlIFBPU1Rcblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzLmJ1c3lNb2RlXSBHbG9iYWwgKGRlZmF1bHQpLCBMb2NhbCwgTm9uZSBUT0RPOiB0byBiZSByZWZhY3RvcmVkXG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVycy5idXN5SWRdIElEIG9mIHRoZSBsb2NhbCBidXN5IGluZGljYXRvclxuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnMua2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZF0gSWYgc2V0LCB0aGUgY29udGV4dCBzdGF5cyBpbiB0aGUgbGlzdCBpZiB0aGUgUE9TVCBmYWlsZWQgYW5kIFBPU1Qgd2lsbCBiZSByZXBlYXRlZCB3aXRoIHRoZSBuZXh0IGNoYW5nZVxuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnMuaW5hY3RpdmVdIElmIHNldCwgdGhlIGNvbnRleHQgaXMgc2V0IGFzIGluYWN0aXZlIGZvciBlbXB0eSByb3dzXG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVycy5za2lwUGFyYW1ldGVyRGlhbG9nXSBTa2lwcyB0aGUgYWN0aW9uIHBhcmFtZXRlciBkaWFsb2dcblx0ICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgYXBwIGNvbXBvbmVudFxuXHQgKiBAcGFyYW0gbWVzc2FnZUhhbmRsZXIgVGhlIG1lc3NhZ2UgaGFuZGxlciBleHRlbnNpb25cblx0ICogQHBhcmFtIGZyb21Db3B5UGFzdGUgVHJ1ZSBpZiB0aGUgY3JlYXRpb24gaGFzIGJlZW4gdHJpZ2dlcmVkIGJ5IGEgcGFzdGUgYWN0aW9uXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCBuZXcgYmluZGluZyBjb250ZXh0XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGFzeW5jIGNyZWF0ZURvY3VtZW50KFxuXHRcdG9NYWluTGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcsXG5cdFx0bUluUGFyYW1ldGVyczpcblx0XHRcdHwge1xuXHRcdFx0XHRcdGRhdGE/OiBhbnk7XG5cdFx0XHRcdFx0YnVzeU1vZGU/OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0YnVzeUlkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0a2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZD86IGJvb2xlYW47XG5cdFx0XHRcdFx0aW5hY3RpdmU/OiBib29sZWFuO1xuXHRcdFx0ICB9XG5cdFx0XHR8IHVuZGVmaW5lZCxcblx0XHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0XHRtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXIsXG5cdFx0ZnJvbUNvcHlQYXN0ZTogYm9vbGVhblxuXHQpOiBQcm9taXNlPE9EYXRhVjRDb250ZXh0PiB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG5cdFx0Y29uc3Qgb01vZGVsID0gb01haW5MaXN0QmluZGluZy5nZXRNb2RlbCgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob01haW5MaXN0QmluZGluZy5nZXRIZWFkZXJDb250ZXh0KCkhLmdldFBhdGgoKSksXG5cdFx0XHRzQ3JlYXRlSGFzaCA9IGFwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmdldEhhc2goKSxcblx0XHRcdG9Db21wb25lbnREYXRhID0gYXBwQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKSxcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyA9IChvQ29tcG9uZW50RGF0YSAmJiBvQ29tcG9uZW50RGF0YS5zdGFydHVwUGFyYW1ldGVycykgfHwge30sXG5cdFx0XHRzTmV3QWN0aW9uID0gIW9NYWluTGlzdEJpbmRpbmcuaXNSZWxhdGl2ZSgpXG5cdFx0XHRcdD8gdGhpcy5fZ2V0TmV3QWN0aW9uKG9TdGFydHVwUGFyYW1ldGVycywgc0NyZWF0ZUhhc2gsIG9NZXRhTW9kZWwsIHNNZXRhUGF0aClcblx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgbUJpbmRpbmdQYXJhbWV0ZXJzOiBhbnkgPSB7ICQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHM6IHRydWUgfTtcblx0XHRjb25zdCBzTWVzc2FnZXNQYXRoID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzLyRQYXRoYCk7XG5cdFx0bGV0IHNCdXN5UGF0aCA9IFwiL2J1c3lcIjtcblx0XHRsZXQgc0Z1bmN0aW9uTmFtZSA9XG5cdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EZWZhdWx0VmFsdWVzRnVuY3Rpb25gKSB8fFxuXHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoXG5cdFx0XHRcdGAke01vZGVsSGVscGVyLmdldFRhcmdldEVudGl0eVNldChvTWV0YU1vZGVsLmdldENvbnRleHQoc01ldGFQYXRoKSl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EZWZhdWx0VmFsdWVzRnVuY3Rpb25gXG5cdFx0XHQpO1xuXHRcdGxldCBiRnVuY3Rpb25Pbk5hdlByb3A7XG5cdFx0bGV0IG9OZXdEb2N1bWVudENvbnRleHQ6IE9EYXRhVjRDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHRcdGlmIChzRnVuY3Rpb25OYW1lKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRlZmF1bHRWYWx1ZXNGdW5jdGlvbmApICYmXG5cdFx0XHRcdE1vZGVsSGVscGVyLmdldFRhcmdldEVudGl0eVNldChvTWV0YU1vZGVsLmdldENvbnRleHQoc01ldGFQYXRoKSkgIT09IHNNZXRhUGF0aFxuXHRcdFx0KSB7XG5cdFx0XHRcdGJGdW5jdGlvbk9uTmF2UHJvcCA9IHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRiRnVuY3Rpb25Pbk5hdlByb3AgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHNNZXNzYWdlc1BhdGgpIHtcblx0XHRcdG1CaW5kaW5nUGFyYW1ldGVyc1tcIiRzZWxlY3RcIl0gPSBzTWVzc2FnZXNQYXRoO1xuXHRcdH1cblx0XHRjb25zdCBtUGFyYW1ldGVycyA9IGdldFBhcmFtZXRlcnMobUluUGFyYW1ldGVycyk7XG5cdFx0aWYgKCFvTWFpbkxpc3RCaW5kaW5nKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIHJlcXVpcmVkIGZvciBuZXcgZG9jdW1lbnQgY3JlYXRpb25cIik7XG5cdFx0fVxuXHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9NYWluTGlzdEJpbmRpbmcpO1xuXHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCAhPT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCAmJiBzUHJvZ3JhbW1pbmdNb2RlbCAhPT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIkNyZWF0ZSBkb2N1bWVudCBvbmx5IGFsbG93ZWQgZm9yIGRyYWZ0IG9yIHN0aWNreSBzZXNzaW9uIHN1cHBvcnRlZCBzZXJ2aWNlc1wiKTtcblx0XHR9XG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmJ1c3lNb2RlID09PSBcIkxvY2FsXCIpIHtcblx0XHRcdHNCdXN5UGF0aCA9IGAvYnVzeUxvY2FsLyR7bVBhcmFtZXRlcnMuYnVzeUlkfWA7XG5cdFx0fVxuXHRcdG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrID0gZnJvbUNvcHlQYXN0ZSA/IG51bGwgOiBtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjaztcblx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCwgc0J1c3lQYXRoKTtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGVDb3JlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRsZXQgb1Jlc3VsdDogYW55O1xuXG5cdFx0dHJ5IHtcblx0XHRcdGlmIChzTmV3QWN0aW9uKSB7XG5cdFx0XHRcdG9SZXN1bHQgPSBhd2FpdCB0aGlzLmNhbGxBY3Rpb24oXG5cdFx0XHRcdFx0c05ld0FjdGlvbixcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb250ZXh0czogb01haW5MaXN0QmluZGluZy5nZXRIZWFkZXJDb250ZXh0KCksXG5cdFx0XHRcdFx0XHRzaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nOiB0cnVlLFxuXHRcdFx0XHRcdFx0bGFiZWw6IHRoaXMuX2dldFNwZWNpZmljQ3JlYXRlQWN0aW9uRGlhbG9nTGFiZWwob01ldGFNb2RlbCwgc01ldGFQYXRoLCBzTmV3QWN0aW9uLCBvUmVzb3VyY2VCdW5kbGVDb3JlKSxcblx0XHRcdFx0XHRcdGJpbmRpbmdQYXJhbWV0ZXJzOiBtQmluZGluZ1BhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRwYXJlbnRDb250cm9sOiBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdFx0YklzQ3JlYXRlQWN0aW9uOiB0cnVlLFxuXHRcdFx0XHRcdFx0c2tpcFBhcmFtZXRlckRpYWxvZzogbVBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZ1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRhcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXJcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGJJc05ld1BhZ2VDcmVhdGlvbiA9XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cgJiYgbVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuSW5saW5lO1xuXHRcdFx0XHRjb25zdCBhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzID0gYklzTmV3UGFnZUNyZWF0aW9uXG5cdFx0XHRcdFx0PyBnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMob01ldGFNb2RlbCwgc01ldGFQYXRoLCBhcHBDb21wb25lbnQpXG5cdFx0XHRcdFx0OiBbXTtcblx0XHRcdFx0c0Z1bmN0aW9uTmFtZSA9IGZyb21Db3B5UGFzdGUgPyBudWxsIDogc0Z1bmN0aW9uTmFtZTtcblx0XHRcdFx0bGV0IHNGdW5jdGlvblBhdGgsIG9GdW5jdGlvbkNvbnRleHQ7XG5cdFx0XHRcdGlmIChzRnVuY3Rpb25OYW1lKSB7XG5cdFx0XHRcdFx0Ly9ib3VuZCB0byB0aGUgc291cmNlIGVudGl0eTpcblx0XHRcdFx0XHRpZiAoYkZ1bmN0aW9uT25OYXZQcm9wKSB7XG5cdFx0XHRcdFx0XHRzRnVuY3Rpb25QYXRoID1cblx0XHRcdFx0XHRcdFx0b01haW5MaXN0QmluZGluZy5nZXRDb250ZXh0KCkgJiZcblx0XHRcdFx0XHRcdFx0YCR7b01ldGFNb2RlbC5nZXRNZXRhUGF0aChvTWFpbkxpc3RCaW5kaW5nLmdldENvbnRleHQoKS5nZXRQYXRoKCkpfS8ke3NGdW5jdGlvbk5hbWV9YDtcblx0XHRcdFx0XHRcdG9GdW5jdGlvbkNvbnRleHQgPSBvTWFpbkxpc3RCaW5kaW5nLmdldENvbnRleHQoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0Z1bmN0aW9uUGF0aCA9XG5cdFx0XHRcdFx0XHRcdG9NYWluTGlzdEJpbmRpbmcuZ2V0SGVhZGVyQ29udGV4dCgpICYmXG5cdFx0XHRcdFx0XHRcdGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob01haW5MaXN0QmluZGluZy5nZXRIZWFkZXJDb250ZXh0KCkhLmdldFBhdGgoKSl9LyR7c0Z1bmN0aW9uTmFtZX1gO1xuXHRcdFx0XHRcdFx0b0Z1bmN0aW9uQ29udGV4dCA9IG9NYWluTGlzdEJpbmRpbmcuZ2V0SGVhZGVyQ29udGV4dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBvRnVuY3Rpb24gPSBzRnVuY3Rpb25QYXRoICYmIChvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNGdW5jdGlvblBhdGgpIGFzIGFueSk7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRsZXQgb0RhdGE6IGFueTtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0NvbnRleHQgPVxuXHRcdFx0XHRcdFx0XHRvRnVuY3Rpb24gJiYgb0Z1bmN0aW9uLmdldE9iamVjdCgpICYmIG9GdW5jdGlvbi5nZXRPYmplY3QoKVswXS4kSXNCb3VuZFxuXHRcdFx0XHRcdFx0XHRcdD8gYXdhaXQgb3BlcmF0aW9ucy5jYWxsQm91bmRGdW5jdGlvbihzRnVuY3Rpb25OYW1lLCBvRnVuY3Rpb25Db250ZXh0LCBvTW9kZWwpXG5cdFx0XHRcdFx0XHRcdFx0OiBhd2FpdCBvcGVyYXRpb25zLmNhbGxGdW5jdGlvbkltcG9ydChzRnVuY3Rpb25OYW1lLCBvTW9kZWwpO1xuXHRcdFx0XHRcdFx0aWYgKG9Db250ZXh0KSB7XG5cdFx0XHRcdFx0XHRcdG9EYXRhID0gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihgRXJyb3Igd2hpbGUgZXhlY3V0aW5nIHRoZSBmdW5jdGlvbiAke3NGdW5jdGlvbk5hbWV9YCwgb0Vycm9yKTtcblx0XHRcdFx0XHRcdHRocm93IG9FcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGF0YSA9IG9EYXRhID8gT2JqZWN0LmFzc2lnbih7fSwgb0RhdGEsIG1QYXJhbWV0ZXJzLmRhdGEpIDogbVBhcmFtZXRlcnMuZGF0YTtcblx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuZGF0YSkge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG1QYXJhbWV0ZXJzLmRhdGFbXCJAb2RhdGEuY29udGV4dFwiXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0b1Jlc3VsdCA9IGF3YWl0IHRoaXMuX2xhdW5jaERpYWxvZ1dpdGhLZXlGaWVsZHMoXG5cdFx0XHRcdFx0XHRcdG9NYWluTGlzdEJpbmRpbmcsXG5cdFx0XHRcdFx0XHRcdGFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMsXG5cdFx0XHRcdFx0XHRcdG9Nb2RlbCxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdGFwcENvbXBvbmVudCxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXJcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRvTmV3RG9jdW1lbnRDb250ZXh0ID0gb1Jlc3VsdC5uZXdDb250ZXh0O1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuYmVmb3JlQ3JlYXRlQ2FsbEJhY2spIHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgdG9FUzZQcm9taXNlKFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHRQYXRoOiBvTWFpbkxpc3RCaW5kaW5nICYmIG9NYWluTGlzdEJpbmRpbmcuZ2V0UGF0aCgpXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b05ld0RvY3VtZW50Q29udGV4dCA9IG9NYWluTGlzdEJpbmRpbmcuY3JlYXRlKFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kYXRhLFxuXHRcdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGVBdEVuZCxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW5hY3RpdmVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLmluYWN0aXZlKSB7XG5cdFx0XHRcdFx0XHRcdG9SZXN1bHQgPSBhd2FpdCB0aGlzLm9uQWZ0ZXJDcmVhdGVDb21wbGV0aW9uKG9NYWluTGlzdEJpbmRpbmcsIG9OZXdEb2N1bWVudENvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgY3JlYXRpbmcgdGhlIG5ldyBkb2N1bWVudFwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdHRocm93IG9FcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRvTmV3RG9jdW1lbnRDb250ZXh0ID0gb05ld0RvY3VtZW50Q29udGV4dCB8fCBvUmVzdWx0O1xuXG5cdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZyh7IGNvbnRyb2w6IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wgfSk7XG5cdFx0XHRyZXR1cm4gb05ld0RvY3VtZW50Q29udGV4dCE7XG5cdFx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdC8vIFRPRE86IGN1cnJlbnRseSwgdGhlIG9ubHkgZXJyb3JzIGhhbmRsZWQgaGVyZSBhcmUgcmFpc2VkIGFzIHN0cmluZyAtIHNob3VsZCBiZSBjaGFuZ2VkIHRvIEVycm9yIG9iamVjdHNcblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKHsgY29udHJvbDogbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCB9KTtcblx0XHRcdGlmIChcblx0XHRcdFx0KGVycm9yID09PSBGRUxpYnJhcnkuQ29uc3RhbnRzLkFjdGlvbkV4ZWN1dGlvbkZhaWxlZCB8fCBlcnJvciA9PT0gRkVMaWJyYXJ5LkNvbnN0YW50cy5DYW5jZWxBY3Rpb25EaWFsb2cpICYmXG5cdFx0XHRcdG9OZXdEb2N1bWVudENvbnRleHQ/LmlzVHJhbnNpZW50KClcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBUaGlzIGlzIGEgd29ya2Fyb3VuZCBzdWdnZXN0ZWQgYnkgbW9kZWwgYXMgQ29udGV4dC5kZWxldGUgcmVzdWx0cyBpbiBhbiBlcnJvclxuXHRcdFx0XHQvLyBUT0RPOiByZW1vdmUgdGhlICRkaXJlY3Qgb25jZSBtb2RlbCByZXNvbHZlcyB0aGlzIGlzc3VlXG5cdFx0XHRcdC8vIHRoaXMgbGluZSBzaG93cyB0aGUgZXhwZWN0ZWQgY29uc29sZSBlcnJvciBVbmNhdWdodCAoaW4gcHJvbWlzZSkgRXJyb3I6IFJlcXVlc3QgY2FuY2VsZWQ6IFBPU1QgVHJhdmVsOyBncm91cDogc3VibWl0TGF0ZXJcblx0XHRcdFx0b05ld0RvY3VtZW50Q29udGV4dC5kZWxldGUoXCIkZGlyZWN0XCIpO1xuXHRcdFx0fVxuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMuYnVzeVVubG9jayhhcHBDb21wb25lbnQsIHNCdXN5UGF0aCk7XG5cdFx0fVxuXHR9XG5cblx0X2lzRHJhZnRFbmFibGVkKHZDb250ZXh0czogT0RhdGFWNENvbnRleHRbXSkge1xuXHRcdGNvbnN0IGNvbnRleHRGb3JEcmFmdE1vZGVsID0gdkNvbnRleHRzWzBdO1xuXHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKGNvbnRleHRGb3JEcmFmdE1vZGVsKTtcblx0XHRyZXR1cm4gc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQ7XG5cdH1cblxuXHQvKipcblx0ICogRGVsZXRlIG9uZSBvciBtdWx0aXBsZSBkb2N1bWVudChzKS5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIGNvbnRleHRzIENvbnRleHRzIEVpdGhlciBvbmUgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIHRvIGJlIGRlbGV0ZWRcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIE9wdGlvbmFsLCBjYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy50aXRsZSBUaXRsZSBvZiB0aGUgb2JqZWN0IHRvIGJlIGRlbGV0ZWRcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uIERlc2NyaXB0aW9uIG9mIHRoZSBvYmplY3QgdG8gYmUgZGVsZXRlZFxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMubnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIE51bWJlciBvZiBvYmplY3RzIHNlbGVjdGVkXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5ub0RpYWxvZyBUbyBkaXNhYmxlIHRoZSBjb25maXJtYXRpb24gZGlhbG9nXG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgVGhlIGFwcENvbXBvbmVudFxuXHQgKiBAcGFyYW0gcmVzb3VyY2VNb2RlbCBUaGUgcmVzb3VyY2UgbW9kZWwgdG8gbG9hZCB0ZXh0IHJlc291cmNlc1xuXHQgKiBAcGFyYW0gbWVzc2FnZUhhbmRsZXIgVGhlIG1lc3NhZ2UgaGFuZGxlciBleHRlbnNpb25cblx0ICogQHJldHVybnMgQSBQcm9taXNlIHJlc29sdmVkIG9uY2UgdGhlIGRvY3VtZW50cyBhcmUgZGVsZXRlZFxuXHQgKi9cblx0ZGVsZXRlRG9jdW1lbnQoXG5cdFx0Y29udGV4dHM6IE9EYXRhVjRDb250ZXh0IHwgT0RhdGFWNENvbnRleHRbXSxcblx0XHRtUGFyYW1ldGVyczogYW55LFxuXHRcdGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRcdHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyXG5cdCkge1xuXHRcdGNvbnN0IHJlc291cmNlQnVuZGxlQ29yZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0bGV0IGFQYXJhbXM7XG5cdFx0Ly8gZGVsZXRlIGRvY3VtZW50IGxvY2tcblx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCk7XG5cblx0XHRjb25zdCBjb250ZXh0c1RvRGVsZXRlID0gQXJyYXkuaXNBcnJheShjb250ZXh0cykgPyBbLi4uY29udGV4dHNdIDogW2NvbnRleHRzXTtcblxuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBkcmFmdEVuYWJsZWQgPSB0aGlzLl9pc0RyYWZ0RW5hYmxlZChtUGFyYW1ldGVycy5zZWxlY3RlZENvbnRleHRzIHx8IGNvbnRleHRzVG9EZWxldGUpO1xuXHRcdFx0XHRjb25zdCBpdGVtczogYW55W10gPSBbXTtcblx0XHRcdFx0bGV0IG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdID0gW107XG5cblx0XHRcdFx0Ly8gaXRlbXModGV4dHMpIGFuZCBvcHRpb25zKGNoZWNrQm94ZXMgYW5kIHNpbmdsZSBkZWZhdWx0IG9wdGlvbikgZm9yIGNvbmZpcm0gZGlhbG9nLlxuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cykge1xuXHRcdFx0XHRcdFx0Ly8gbm9uLVRhYmxlXG5cdFx0XHRcdFx0XHRpZiAoZHJhZnRFbmFibGVkKSB7XG5cdFx0XHRcdFx0XHRcdC8vIENoZWNrIGlmIDEgb2YgdGhlIGRyYWZ0cyBpcyBsb2NrZWQgYnkgYW5vdGhlciB1c2VyXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGxvY2tlZENvbnRleHQgPSBjb250ZXh0c1RvRGVsZXRlLmZpbmQoKGNvbnRleHQpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBjb250ZXh0RGF0YSA9IGNvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHREYXRhLklzQWN0aXZlRW50aXR5ID09PSB0cnVlICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0RGF0YS5IYXNEcmFmdEVudGl0eSA9PT0gdHJ1ZSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dERhdGEuRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEgJiZcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHREYXRhLkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhLkluUHJvY2Vzc0J5VXNlciAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0IWNvbnRleHREYXRhLkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhLkRyYWZ0SXNDcmVhdGVkQnlNZVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRpZiAobG9ja2VkQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIFNob3cgbWVzc2FnZSBib3ggd2l0aCB0aGUgbmFtZSBvZiB0aGUgbG9ja2luZyB1c2VyIGFuZCByZXR1cm5cblx0XHRcdFx0XHRcdFx0XHRjb25zdCBsb2NraW5nVXNlck5hbWUgPSBsb2NrZWRDb250ZXh0LmdldE9iamVjdCgpLkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhLkluUHJvY2Vzc0J5VXNlcjtcblx0XHRcdFx0XHRcdFx0XHRNZXNzYWdlQm94LnNob3coXG5cdFx0XHRcdFx0XHRcdFx0XHRyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1NJTkdMRV9PQkpFQ1RfTE9DS0VEXCIsIFtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bG9ja2luZ1VzZXJOYW1lXG5cdFx0XHRcdFx0XHRcdFx0XHRdKSxcblx0XHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGl0bGU6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX0RFTEVURVwiKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0b25DbG9zZTogcmVqZWN0XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzID0gZ2V0UGFyYW1ldGVycyhtUGFyYW1ldGVycyk7XG5cdFx0XHRcdFx0XHRsZXQgbm9uVGFibGVUeHQgPSBcIlwiO1xuXHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLnRpdGxlKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5kZXNjcmlwdGlvbikge1xuXHRcdFx0XHRcdFx0XHRcdGFQYXJhbXMgPSBbbVBhcmFtZXRlcnMudGl0bGUgKyBcIiBcIiwgbVBhcmFtZXRlcnMuZGVzY3JpcHRpb25dO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGFQYXJhbXMgPSBbbVBhcmFtZXRlcnMudGl0bGUsIFwiXCJdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG5vblRhYmxlVHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RJTkZPXCIsXG5cdFx0XHRcdFx0XHRcdFx0YVBhcmFtcyxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRub25UYWJsZVR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcblx0XHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfU0lOR1VMQVJcIixcblx0XHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0b3B0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0dHlwZTogRGVsZXRlT3B0aW9uVHlwZXMuZGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdGNvbnRleHRzOiBjb250ZXh0c1RvRGVsZXRlLFxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBub25UYWJsZVR4dCxcblx0XHRcdFx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2w6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLlRFWFRcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBUYWJsZVxuXHRcdFx0XHRcdFx0bGV0IHRvdGFsRGVsZXRhYmxlID0gY29udGV4dHNUb0RlbGV0ZS5sZW5ndGg7XG5cblx0XHRcdFx0XHRcdGlmIChkcmFmdEVuYWJsZWQpIHtcblx0XHRcdFx0XHRcdFx0dG90YWxEZWxldGFibGUgKz1cblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLmxlbmd0aCArXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZS5sZW5ndGggK1xuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnVuU2F2ZWRDb250ZXh0cy5sZW5ndGg7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZUhlbHBlci51cGRhdGVEcmFmdE9wdGlvbnNGb3JEZWxldGFibGVUZXh0cyhcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRjb250ZXh0c1RvRGVsZXRlLFxuXHRcdFx0XHRcdFx0XHRcdHRvdGFsRGVsZXRhYmxlLFxuXHRcdFx0XHRcdFx0XHRcdHJlc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdFx0aXRlbXMsXG5cdFx0XHRcdFx0XHRcdFx0b3B0aW9uc1xuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgbm9uRGVsZXRhYmxlVGV4dCA9IGRlbGV0ZUhlbHBlci5nZXROb25EZWxldGFibGVUZXh0KG1QYXJhbWV0ZXJzLCB0b3RhbERlbGV0YWJsZSwgcmVzb3VyY2VNb2RlbCk7XG5cdFx0XHRcdFx0XHRcdGlmIChub25EZWxldGFibGVUZXh0KSB7XG5cdFx0XHRcdFx0XHRcdFx0aXRlbXMucHVzaChub25EZWxldGFibGVUZXh0KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRjb25zdCBvcHRpb25zRGVsZXRhYmxlVGV4dHMgPSBkZWxldGVIZWxwZXIuZ2V0T3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzKFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0Y29udGV4dHNUb0RlbGV0ZSxcblx0XHRcdFx0XHRcdFx0cmVzb3VyY2VNb2RlbFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdG9wdGlvbnMgPSBbLi4ub3B0aW9ucywgLi4ub3B0aW9uc0RlbGV0YWJsZVRleHRzXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDb250ZW50IG9mIERlbGV0ZSBEaWFsb2dcblx0XHRcdFx0ZGVsZXRlSGVscGVyLnVwZGF0ZUNvbnRlbnRGb3JEZWxldGVEaWFsb2cob3B0aW9ucywgaXRlbXMpO1xuXHRcdFx0XHRjb25zdCB2Qm94ID0gbmV3IFZCb3goeyBpdGVtczogaXRlbXMgfSk7XG5cdFx0XHRcdGNvbnN0IHNUaXRsZSA9IHJlc291cmNlQnVuZGxlQ29yZS5nZXRUZXh0KFwiQ19DT01NT05fREVMRVRFXCIpO1xuXG5cdFx0XHRcdGNvbnN0IGZuQ29uZmlybSA9IGFzeW5jICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGF3YWl0IGRlbGV0ZUhlbHBlci5kZWxldGVDb25maXJtSGFuZGxlcihcblx0XHRcdFx0XHRcdFx0b3B0aW9ucyxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRyZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRhcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0XHRcdGRyYWZ0RW5hYmxlZFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0cmVqZWN0KCk7XG5cdFx0XHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0XHRcdHRoaXMuYnVzeVVubG9jayhhcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRsZXQgZGlhbG9nQ29uZmlybWVkID0gZmFsc2U7XG5cdFx0XHRcdGNvbnN0IG9EaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdFx0XHR0aXRsZTogc1RpdGxlLFxuXHRcdFx0XHRcdHN0YXRlOiBcIldhcm5pbmdcIixcblx0XHRcdFx0XHRjb250ZW50OiBbdkJveF0sXG5cdFx0XHRcdFx0YXJpYUxhYmVsbGVkQnk6IGl0ZW1zLFxuXHRcdFx0XHRcdGJlZ2luQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0XHRcdHRleHQ6IHJlc291cmNlQnVuZGxlQ29yZS5nZXRUZXh0KFwiQ19DT01NT05fREVMRVRFXCIpLFxuXHRcdFx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdFx0ZGlhbG9nQ29uZmlybWVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0XHRmbkNvbmZpcm0oKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRlbmRCdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHRcdFx0dGV4dDogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX0NBTkNFTFwiKSxcblx0XHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRhZnRlckNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRvRGlhbG9nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHRcdC8vIGlmIGRpYWxvZyBpcyBjbG9zZWQgdW5jb25maXJtZWQgKGUuZy4gdmlhIFwiQ2FuY2VsXCIgb3IgRXNjYXBlIGJ1dHRvbiksIGVuc3VyZSB0byByZWplY3QgcHJvbWlzZVxuXHRcdFx0XHRcdFx0aWYgKCFkaWFsb2dDb25maXJtZWQpIHtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGFzIGFueSk7XG5cdFx0XHRcdGlmIChtUGFyYW1ldGVycy5ub0RpYWxvZykge1xuXHRcdFx0XHRcdGZuQ29uZmlybSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9EaWFsb2cuYWRkU3R5bGVDbGFzcyhcInNhcFVpQ29udGVudFBhZGRpbmdcIik7XG5cdFx0XHRcdFx0b0RpYWxvZy5vcGVuKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdC8vIGRlbGV0ZSBkb2N1bWVudCB1bmxvY2tcblx0XHRcdFx0dGhpcy5idXN5VW5sb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogRWRpdHMgYSBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGFjdGl2ZSBkb2N1bWVudFxuXHQgKiBAcGFyYW0gb1ZpZXcgQ3VycmVudCB2aWV3XG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgVGhlIGFwcENvbXBvbmVudFxuXHQgKiBAcGFyYW0gbWVzc2FnZUhhbmRsZXIgVGhlIG1lc3NhZ2UgaGFuZGxlciBleHRlbnNpb25cblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyB3aXRoIHRoZSBuZXcgZHJhZnQgY29udGV4dCBpbiBjYXNlIG9mIGRyYWZ0IHByb2dyYW1taW5nIG1vZGVsXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGFzeW5jIGVkaXREb2N1bWVudChcblx0XHRvQ29udGV4dDogT0RhdGFWNENvbnRleHQsXG5cdFx0b1ZpZXc6IFZpZXcsXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyXG5cdCk6IFByb21pc2U8T0RhdGFWNENvbnRleHQgfCB1bmRlZmluZWQ+IHtcblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCk7XG5cdFx0aWYgKCFvQ29udGV4dCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQmluZGluZyBjb250ZXh0IHRvIGFjdGl2ZSBkb2N1bWVudCBpcyByZXF1aXJlZFwiKTtcblx0XHR9XG5cdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0ICYmIHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRWRpdCBpcyBvbmx5IGFsbG93ZWQgZm9yIGRyYWZ0IG9yIHN0aWNreSBzZXNzaW9uIHN1cHBvcnRlZCBzZXJ2aWNlc1wiKTtcblx0XHR9XG5cdFx0dGhpcy5idXN5TG9jayhhcHBDb21wb25lbnQpO1xuXHRcdC8vIGJlZm9yZSB0cmlnZ2VyaW5nIHRoZSBlZGl0IGFjdGlvbiB3ZSdsbCBoYXZlIHRvIHJlbW92ZSBhbGwgYm91bmQgdHJhbnNpdGlvbiBtZXNzYWdlc1xuXHRcdG1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG9OZXdDb250ZXh0ID1cblx0XHRcdFx0c1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnRcblx0XHRcdFx0XHQ/IGF3YWl0IGRyYWZ0LmNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50KG9Db250ZXh0LCBhcHBDb21wb25lbnQsIHtcblx0XHRcdFx0XHRcdFx0YlByZXNlcnZlQ2hhbmdlczogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0b1ZpZXc6IG9WaWV3XG5cdFx0XHRcdFx0ICB9IGFzIGFueSlcblx0XHRcdFx0XHQ6IGF3YWl0IHN0aWNreS5lZGl0RG9jdW1lbnRJblN0aWNreVNlc3Npb24ob0NvbnRleHQsIGFwcENvbXBvbmVudCk7XG5cblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKCk7XG5cdFx0XHRyZXR1cm4gb05ld0NvbnRleHQ7XG5cdFx0fSBjYXRjaCAoZXJyOiBhbnkpIHtcblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcyh7IGNvbmN1cnJlbnRFZGl0RmxhZzogdHJ1ZSB9KTtcblx0XHRcdHRocm93IGVycjtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0dGhpcy5idXN5VW5sb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENhbmNlbCAnZWRpdCcgbW9kZSBvZiBhIGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgZG9jdW1lbnQgdG8gYmUgY2FuY2VsZWQgb3IgZGVsZXRlZFxuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnNdIE9wdGlvbmFsLCBjYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbiBDYW5jZWwgQnV0dG9uIG9mIHRoZSBkaXNjYXJkIHBvcG92ZXIgKG1hbmRhdG9yeSBmb3Igbm93KVxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5za2lwRGlzY2FyZFBvcG92ZXIgT3B0aW9uYWwsIHN1cHJlc3NlcyB0aGUgZGlzY2FyZCBwb3BvdmVyIGluY2FzZSBvZiBkcmFmdCBhcHBsaWNhdGlvbnMgd2hpbGUgbmF2aWdhdGluZyBvdXQgb2YgT1Bcblx0ICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgYXBwQ29tcG9uZW50XG5cdCAqIEBwYXJhbSByZXNvdXJjZU1vZGVsIFRoZSBtb2RlbCB0byBsb2FkIHRleHQgcmVzb3VyY2VzXG5cdCAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlciBUaGUgbWVzc2FnZSBoYW5kbGVyIGV4dGVuc2lvblxuXHQgKiBAcGFyYW0gaXNOZXdPYmplY3QgVHJ1ZSBpZiB3ZSdyZSB0cnlpbmcgdG8gY2FuY2VsIGEgbmV3bHkgY3JlYXRlZCBvYmplY3Rcblx0ICogQHBhcmFtIGlzT2JqZWN0TW9kaWZpZWQgVHJ1ZSBpZiB0aGUgb2JqZWN0IGhhcyBiZWVuIG1vZGlmaWVkIGJ5IHRoZSB1c2VyXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCA/Pz9cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0YXN5bmMgY2FuY2VsRG9jdW1lbnQoXG5cdFx0b0NvbnRleHQ6IE9EYXRhVjRDb250ZXh0LFxuXHRcdG1JblBhcmFtZXRlcnM6IHsgY2FuY2VsQnV0dG9uOiBCdXR0b247IHNraXBEaXNjYXJkUG9wb3ZlcjogYm9vbGVhbiB9IHwgdW5kZWZpbmVkLFxuXHRcdGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRcdHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRcdGlzTmV3T2JqZWN0OiBib29sZWFuLFxuXHRcdGlzT2JqZWN0TW9kaWZpZWQ6IGJvb2xlYW5cblx0KTogUHJvbWlzZTxPRGF0YVY0Q29udGV4dCB8IGJvb2xlYW4+IHtcblx0XHQvL2NvbnRleHQgbXVzdCBhbHdheXMgYmUgcGFzc2VkIC0gbWFuZGF0b3J5IHBhcmFtZXRlclxuXHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIk5vIGNvbnRleHQgZXhpc3RzLiBQYXNzIGEgbWVhbmluZ2Z1bCBjb250ZXh0XCIpO1xuXHRcdH1cblx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0Y29uc3QgbVBhcmFtZXRlcnMgPSBnZXRQYXJhbWV0ZXJzKG1JblBhcmFtZXRlcnMpO1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQpO1xuXG5cdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0ICYmIHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2FuY2VsIGRvY3VtZW50IG9ubHkgYWxsb3dlZCBmb3IgZHJhZnQgb3Igc3RpY2t5IHNlc3Npb24gc3VwcG9ydGVkIHNlcnZpY2VzXCIpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0bGV0IHJldHVybmVkVmFsdWU6IE9EYXRhVjRDb250ZXh0IHwgYm9vbGVhbiA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgJiYgIWlzT2JqZWN0TW9kaWZpZWQpIHtcblx0XHRcdFx0Y29uc3QgZHJhZnREYXRhQ29udGV4dCA9IG9Nb2RlbC5iaW5kQ29udGV4dChgJHtvQ29udGV4dC5nZXRQYXRoKCl9L0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhYCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdGNvbnN0IGRyYWZ0QWRtaW5EYXRhID0gYXdhaXQgZHJhZnREYXRhQ29udGV4dC5yZXF1ZXN0T2JqZWN0KCk7XG5cdFx0XHRcdGlmIChkcmFmdEFkbWluRGF0YSkge1xuXHRcdFx0XHRcdGlzT2JqZWN0TW9kaWZpZWQgPSBkcmFmdEFkbWluRGF0YS5DcmVhdGlvbkRhdGVUaW1lICE9PSBkcmFmdEFkbWluRGF0YS5MYXN0Q2hhbmdlRGF0ZVRpbWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICghbVBhcmFtZXRlcnMuc2tpcERpc2NhcmRQb3BvdmVyKSB7XG5cdFx0XHRcdGF3YWl0IHRoaXMuX2NvbmZpcm1EaXNjYXJkKG1QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbiwgaXNPYmplY3RNb2RpZmllZCwgcmVzb3VyY2VNb2RlbCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0NvbnRleHQuaXNLZWVwQWxpdmUoKSkge1xuXHRcdFx0XHQvLyBpZiB0aGUgY29udGV4dCBpcyBrZXB0IGFsaXZlIHdlIHNldCBpdCBhZ2FpbiB0byBkZXRhY2ggdGhlIG9uQmVmb3JlRGVzdHJveSBjYWxsYmFjayBhbmQgaGFuZGxlIG5hdmlnYXRpb24gaGVyZVxuXHRcdFx0XHQvLyB0aGUgY29udGV4dCBuZWVkcyB0byBzdGlsbCBiZSBrZXB0IGFsaXZlIHRvIGJlIGFibGUgdG8gcmVzZXQgY2hhbmdlcyBwcm9wZXJseVxuXHRcdFx0XHRvQ29udGV4dC5zZXRLZWVwQWxpdmUodHJ1ZSwgdW5kZWZpbmVkKTtcblx0XHRcdH1cblx0XHRcdGlmIChtUGFyYW1ldGVycy5iZWZvcmVDYW5jZWxDYWxsQmFjaykge1xuXHRcdFx0XHRhd2FpdCBtUGFyYW1ldGVycy5iZWZvcmVDYW5jZWxDYWxsQmFjayh7IGNvbnRleHQ6IG9Db250ZXh0IH0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHRcdGlmIChpc05ld09iamVjdCkge1xuXHRcdFx0XHRcdGlmIChvQ29udGV4dC5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybmVkVmFsdWUgPSBhd2FpdCBkcmFmdC5kZWxldGVEcmFmdChvQ29udGV4dCwgYXBwQ29tcG9uZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBvU2libGluZ0NvbnRleHQgPSBvTW9kZWwuYmluZENvbnRleHQoYCR7b0NvbnRleHQuZ2V0UGF0aCgpfS9TaWJsaW5nRW50aXR5YCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnN0IHNDYW5vbmljYWxQYXRoID0gYXdhaXQgb1NpYmxpbmdDb250ZXh0LnJlcXVlc3RDYW5vbmljYWxQYXRoKCk7XG5cdFx0XHRcdFx0XHRpZiAob0NvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm5lZFZhbHVlID0gb01vZGVsLmJpbmRDb250ZXh0KHNDYW5vbmljYWxQYXRoKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0YXdhaXQgZHJhZnQuZGVsZXRlRHJhZnQob0NvbnRleHQsIGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBkaXNjYXJkZWRDb250ZXh0ID0gYXdhaXQgc3RpY2t5LmRpc2NhcmREb2N1bWVudChvQ29udGV4dCk7XG5cdFx0XHRcdGlmIChkaXNjYXJkZWRDb250ZXh0KSB7XG5cdFx0XHRcdFx0aWYgKGRpc2NhcmRlZENvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdFx0ZGlzY2FyZGVkQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghaXNOZXdPYmplY3QpIHtcblx0XHRcdFx0XHRcdGRpc2NhcmRlZENvbnRleHQucmVmcmVzaCgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuZWRWYWx1ZSA9IGRpc2NhcmRlZENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIHJlbW92ZSBleGlzdGluZyBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzXG5cdFx0XHRtZXNzYWdlSGFuZGxlci5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdC8vIHNob3cgdW5ib3VuZCBtZXNzYWdlc1xuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdFx0XHRyZXR1cm4gcmV0dXJuZWRWYWx1ZTtcblx0XHR9IGNhdGNoIChlcnI6IGFueSkge1xuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdHRoaXMuYnVzeVVubG9jayhhcHBDb21wb25lbnQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlcyB0aGUgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgb2YgdGhlIGRvY3VtZW50IHRvIGJlIHNhdmVkXG5cdCAqIEBwYXJhbSBhcHBDb21wb25lbnQgVGhlIGFwcENvbXBvbmVudFxuXHQgKiBAcGFyYW0gcmVzb3VyY2VNb2RlbCBUaGUgbW9kZWwgdG8gbG9hZCB0ZXh0IHJlc291cmNlc1xuXHQgKiBAcGFyYW0gZXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciBUcnVlIGlmIHdlIHNob3VsZCBleGVjdXRlIHNpZGUgZWZmZWN0cyBpbiBjYXNlIG9mIGFuIGVycm9yXG5cdCAqIEBwYXJhbSBiaW5kaW5nc0ZvclNpZGVFZmZlY3RzIFRoZSBsaXN0QmluZGluZ3MgdG8gYmUgdXNlZCBmb3IgZXhlY3V0aW5nIHNpZGUgZWZmZWN0cyBvbiBlcnJvclxuXHQgKiBAcGFyYW0gbWVzc2FnZUhhbmRsZXIgVGhlIG1lc3NhZ2UgaGFuZGxlciBleHRlbnNpb25cblx0ICogQHBhcmFtIGlzTmV3T2JqZWN0IFRydWUgaWYgd2UncmUgdHJ5aW5nIHRvIGNhbmNlbCBhIG5ld2x5IGNyZWF0ZWQgb2JqZWN0XG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCA/Pz9cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0YXN5bmMgc2F2ZURvY3VtZW50KFxuXHRcdGNvbnRleHQ6IE9EYXRhVjRDb250ZXh0LFxuXHRcdGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRcdHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwsXG5cdFx0ZXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvcjogYm9vbGVhbixcblx0XHRiaW5kaW5nc0ZvclNpZGVFZmZlY3RzOiBPRGF0YUxpc3RCaW5kaW5nW10sXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRcdGlzTmV3T2JqZWN0OiBib29sZWFuXG5cdCk6IFByb21pc2U8T0RhdGFWNENvbnRleHQ+IHtcblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChjb250ZXh0KTtcblx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5ICYmIHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJTYXZlIGlzIG9ubHkgYWxsb3dlZCBmb3IgZHJhZnQgb3Igc3RpY2t5IHNlc3Npb24gc3VwcG9ydGVkIHNlcnZpY2VzXCIpO1xuXHRcdH1cblxuXHRcdHRyeSB7XG5cdFx0XHR0aGlzLmJ1c3lMb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHRjb25zdCBvQWN0aXZlRG9jdW1lbnQgPVxuXHRcdFx0XHRzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdFxuXHRcdFx0XHRcdD8gYXdhaXQgZHJhZnQuYWN0aXZhdGVEb2N1bWVudChjb250ZXh0LCBhcHBDb21wb25lbnQsIHt9LCBtZXNzYWdlSGFuZGxlcilcblx0XHRcdFx0XHQ6IGF3YWl0IHN0aWNreS5hY3RpdmF0ZURvY3VtZW50KGNvbnRleHQsIGFwcENvbXBvbmVudCk7XG5cblx0XHRcdGNvbnN0IG1lc3NhZ2VzUmVjZWl2ZWQgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZXMoKS5jb25jYXQobWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VzKHRydWUsIHRydWUpKTsgLy8gZ2V0IHVuYm91bmQgYW5kIGJvdW5kIG1lc3NhZ2VzIHByZXNlbnQgaW4gdGhlIG1vZGVsXG5cdFx0XHRpZiAoIShtZXNzYWdlc1JlY2VpdmVkLmxlbmd0aCA9PT0gMSAmJiBtZXNzYWdlc1JlY2VpdmVkWzBdLnR5cGUgPT09IGNvcmVMaWJyYXJ5Lk1lc3NhZ2VUeXBlLlN1Y2Nlc3MpKSB7XG5cdFx0XHRcdC8vIHNob3cgb3VyIG9iamVjdCBjcmVhdGlvbiB0b2FzdCBvbmx5IGlmIGl0IGlzIG5vdCBjb21pbmcgZnJvbSBiYWNrZW5kXG5cdFx0XHRcdE1lc3NhZ2VUb2FzdC5zaG93KFxuXHRcdFx0XHRcdGlzTmV3T2JqZWN0XG5cdFx0XHRcdFx0XHQ/IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX09CSkVDVF9DUkVBVEVEXCIpXG5cdFx0XHRcdFx0XHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX09CSkVDVF9TQVZFRFwiKVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gb0FjdGl2ZURvY3VtZW50O1xuXHRcdH0gY2F0Y2ggKGVycjogYW55KSB7XG5cdFx0XHRpZiAoZXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciAmJiBiaW5kaW5nc0ZvclNpZGVFZmZlY3RzPy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdC8qIFRoZSBzaWRlRWZmZWN0cyBhcmUgZXhlY3V0ZWQgb25seSBmb3IgdGFibGUgaXRlbXMgaW4gdHJhbnNpZW50IHN0YXRlICovXG5cdFx0XHRcdGJpbmRpbmdzRm9yU2lkZUVmZmVjdHMuZm9yRWFjaCgobGlzdEJpbmRpbmcpID0+IHtcblx0XHRcdFx0XHRpZiAoIUNvbW1vblV0aWxzLmhhc1RyYW5zaWVudENvbnRleHQobGlzdEJpbmRpbmcpKSB7XG5cdFx0XHRcdFx0XHRhcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCkucmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5KGxpc3RCaW5kaW5nLmdldFBhdGgoKSwgY29udGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcygpO1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHR0aGlzLmJ1c3lVbmxvY2soYXBwQ29tcG9uZW50KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbHMgYSBib3VuZCBvciB1bmJvdW5kIGFjdGlvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBzdGF0aWNcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIuY2FsbEFjdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXNdIEEgbWFwIG9mIGFjdGlvbiBwYXJhbWV0ZXIgbmFtZXMgYW5kIHByb3ZpZGVkIHZhbHVlc1xuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2ddIFNraXBzIHRoZSBwYXJhbWV0ZXIgZGlhbG9nIGlmIHZhbHVlcyBhcmUgcHJvdmlkZWQgZm9yIGFsbCBvZiB0aGVtXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY29udGV4dHNdIE1hbmRhdG9yeSBmb3IgYSBib3VuZCBhY3Rpb246IEVpdGhlciBvbmUgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIHRvIGJlIGNhbGxlZFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm1vZGVsXSBNYW5kYXRvcnkgZm9yIGFuIHVuYm91bmQgYWN0aW9uOiBBbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmludm9jYXRpb25Hcm91cGluZ10gTW9kZSBob3cgYWN0aW9ucyBhcmUgdG8gYmUgY2FsbGVkOiAnQ2hhbmdlU2V0JyB0byBwdXQgYWxsIGFjdGlvbiBjYWxscyBpbnRvIG9uZSBjaGFuZ2VzZXQsICdJc29sYXRlZCcgdG8gcHV0IHRoZW0gaW50byBzZXBhcmF0ZSBjaGFuZ2VzZXRzXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubGFiZWxdIEEgaHVtYW4tcmVhZGFibGUgbGFiZWwgZm9yIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0XSBJZiBzcGVjaWZpZWQsIHRoZSBhY3Rpb24gcHJvbWlzZSByZXR1cm5zIHRoZSBib3VuZCBjb250ZXh0XG5cdCAqIEBwYXJhbSBvVmlldyBDb250YWlucyB0aGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHZpZXdcblx0ICogQHBhcmFtIGFwcENvbXBvbmVudCBUaGUgYXBwQ29tcG9uZW50XG5cdCAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlciBUaGUgbWVzc2FnZSBoYW5kbGVyIGV4dGVuc2lvblxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggYW4gYXJyYXkgb2YgcmVzcG9uc2Ugb2JqZWN0cyAoVE9ETzogdG8gYmUgY2hhbmdlZClcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0YXN5bmMgY2FsbEFjdGlvbihcblx0XHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRcdG1QYXJhbWV0ZXJzOiBhbnksXG5cdFx0b1ZpZXc6IFZpZXcgfCBudWxsLFxuXHRcdGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRcdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlclxuXHQpOiBQcm9taXNlPGFueT4ge1xuXHRcdG1QYXJhbWV0ZXJzID0gZ2V0UGFyYW1ldGVycyhtUGFyYW1ldGVycyk7XG5cdFx0bGV0IGNvbnRleHRUb1Byb2Nlc3MsIG9Nb2RlbDogYW55O1xuXHRcdGNvbnN0IG1CaW5kaW5nUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLmJpbmRpbmdQYXJhbWV0ZXJzO1xuXHRcdGlmICghc0FjdGlvbk5hbWUpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcIlByb3ZpZGUgbmFtZSBvZiBhY3Rpb24gdG8gYmUgZXhlY3V0ZWRcIik7XG5cdFx0fVxuXHRcdC8vIGFjdGlvbiBpbXBvcnRzIGFyZSBub3QgZGlyZWN0bHkgb2J0YWluZWQgZnJvbSB0aGUgbWV0YU1vZGVsIGJ5IGl0IGlzIHByZXNlbnQgaW5zaWRlIHRoZSBlbnRpdHlDb250YWluZXJcblx0XHQvLyBhbmQgdGhlIGFjaW9ucyBpdCByZWZlcnMgdG8gcHJlc2VudCBvdXRzaWRlIHRoZSBlbnRpdHljb250YWluZXIsIGhlbmNlIHRvIG9idGFpbiBraW5kIG9mIHRoZSBhY3Rpb25cblx0XHQvLyBzcGxpdCgpIG9uIGl0cyBuYW1lIHdhcyByZXF1aXJlZFxuXHRcdGNvbnN0IHNOYW1lID0gc0FjdGlvbk5hbWUuc3BsaXQoXCIvXCIpWzFdO1xuXHRcdHNBY3Rpb25OYW1lID0gc05hbWUgfHwgc0FjdGlvbk5hbWU7XG5cdFx0Y29udGV4dFRvUHJvY2VzcyA9IHNOYW1lID8gdW5kZWZpbmVkIDogbVBhcmFtZXRlcnMuY29udGV4dHM7XG5cdFx0Ly9jaGVja2luZyB3aGV0aGVyIHRoZSBjb250ZXh0IGlzIGFuIGFycmF5IHdpdGggbW9yZSB0aGFuIDAgbGVuZ3RoIG9yIG5vdCBhbiBhcnJheShjcmVhdGUgYWN0aW9uKVxuXHRcdGlmIChjb250ZXh0VG9Qcm9jZXNzICYmICgoQXJyYXkuaXNBcnJheShjb250ZXh0VG9Qcm9jZXNzKSAmJiBjb250ZXh0VG9Qcm9jZXNzLmxlbmd0aCkgfHwgIUFycmF5LmlzQXJyYXkoY29udGV4dFRvUHJvY2VzcykpKSB7XG5cdFx0XHRjb250ZXh0VG9Qcm9jZXNzID0gQXJyYXkuaXNBcnJheShjb250ZXh0VG9Qcm9jZXNzKSA/IGNvbnRleHRUb1Byb2Nlc3NbMF0gOiBjb250ZXh0VG9Qcm9jZXNzO1xuXHRcdFx0b01vZGVsID0gY29udGV4dFRvUHJvY2Vzcy5nZXRNb2RlbCgpO1xuXHRcdH1cblx0XHRpZiAobVBhcmFtZXRlcnMubW9kZWwpIHtcblx0XHRcdG9Nb2RlbCA9IG1QYXJhbWV0ZXJzLm1vZGVsO1xuXHRcdH1cblx0XHRpZiAoIW9Nb2RlbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUGFzcyBhIGNvbnRleHQgZm9yIGEgYm91bmQgYWN0aW9uIG9yIHBhc3MgdGhlIG1vZGVsIGZvciBhbiB1bmJvdW5kIGFjdGlvblwiKTtcblx0XHR9XG5cdFx0Ly8gZ2V0IHRoZSBiaW5kaW5nIHBhcmFtZXRlcnMgJHNlbGVjdCBhbmQgJGV4cGFuZCBmb3IgdGhlIHNpZGUgZWZmZWN0IG9uIHRoaXMgYWN0aW9uXG5cdFx0Ly8gYWxzbyBnYXRoZXIgYWRkaXRpb25hbCBwcm9wZXJ0eSBwYXRocyB0byBiZSByZXF1ZXN0ZWQgc3VjaCBhcyB0ZXh0IGFzc29jaWF0aW9uc1xuXHRcdGNvbnN0IG1TaWRlRWZmZWN0c1BhcmFtZXRlcnMgPSBhcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCkuZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyhzQWN0aW9uTmFtZSwgY29udGV4dFRvUHJvY2VzcykgfHwge307XG5cblx0XHR0cnkge1xuXHRcdFx0bGV0IG9SZXN1bHQ6IGFueTtcblx0XHRcdGlmIChjb250ZXh0VG9Qcm9jZXNzICYmIG9Nb2RlbCkge1xuXHRcdFx0XHRvUmVzdWx0ID0gYXdhaXQgb3BlcmF0aW9ucy5jYWxsQm91bmRBY3Rpb24oc0FjdGlvbk5hbWUsIG1QYXJhbWV0ZXJzLmNvbnRleHRzLCBvTW9kZWwsIGFwcENvbXBvbmVudCwge1xuXHRcdFx0XHRcdHBhcmFtZXRlclZhbHVlczogbVBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzLFxuXHRcdFx0XHRcdGludm9jYXRpb25Hcm91cGluZzogbVBhcmFtZXRlcnMuaW52b2NhdGlvbkdyb3VwaW5nLFxuXHRcdFx0XHRcdGxhYmVsOiBtUGFyYW1ldGVycy5sYWJlbCxcblx0XHRcdFx0XHRza2lwUGFyYW1ldGVyRGlhbG9nOiBtUGFyYW1ldGVycy5za2lwUGFyYW1ldGVyRGlhbG9nLFxuXHRcdFx0XHRcdG1CaW5kaW5nUGFyYW1ldGVyczogbUJpbmRpbmdQYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdGVudGl0eVNldE5hbWU6IG1QYXJhbWV0ZXJzLmVudGl0eVNldE5hbWUsXG5cdFx0XHRcdFx0YWRkaXRpb25hbFNpZGVFZmZlY3Q6IG1TaWRlRWZmZWN0c1BhcmFtZXRlcnMsXG5cdFx0XHRcdFx0b25TdWJtaXR0ZWQ6ICgpID0+IHtcblx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdFx0dGhpcy5idXN5TG9jayhhcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25SZXNwb25zZTogKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5idXN5VW5sb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwYXJlbnRDb250cm9sOiBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdGNvbnRyb2xJZDogbVBhcmFtZXRlcnMuY29udHJvbElkLFxuXHRcdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0OiBtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IG1QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCxcblx0XHRcdFx0XHRiSXNDcmVhdGVBY3Rpb246IG1QYXJhbWV0ZXJzLmJJc0NyZWF0ZUFjdGlvbixcblx0XHRcdFx0XHRiR2V0Qm91bmRDb250ZXh0OiBtUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0LFxuXHRcdFx0XHRcdGJPYmplY3RQYWdlOiBtUGFyYW1ldGVycy5iT2JqZWN0UGFnZSxcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcjogbWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24sXG5cdFx0XHRcdFx0c2VsZWN0ZWRJdGVtczogbVBhcmFtZXRlcnMuY29udGV4dHNcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUmVzdWx0ID0gYXdhaXQgb3BlcmF0aW9ucy5jYWxsQWN0aW9uSW1wb3J0KHNBY3Rpb25OYW1lLCBvTW9kZWwsIGFwcENvbXBvbmVudCwge1xuXHRcdFx0XHRcdHBhcmFtZXRlclZhbHVlczogbVBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzLFxuXHRcdFx0XHRcdGxhYmVsOiBtUGFyYW1ldGVycy5sYWJlbCxcblx0XHRcdFx0XHRza2lwUGFyYW1ldGVyRGlhbG9nOiBtUGFyYW1ldGVycy5za2lwUGFyYW1ldGVyRGlhbG9nLFxuXHRcdFx0XHRcdGJpbmRpbmdQYXJhbWV0ZXJzOiBtQmluZGluZ1BhcmFtZXRlcnMsXG5cdFx0XHRcdFx0ZW50aXR5U2V0TmFtZTogbVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZSxcblx0XHRcdFx0XHRvblN1Ym1pdHRlZDogKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5idXN5TG9jayhhcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25SZXNwb25zZTogKCkgPT4ge1xuXHRcdFx0XHRcdFx0dGhpcy5idXN5VW5sb2NrKGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwYXJlbnRDb250cm9sOiBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0OiBtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IG1QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCxcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcjogbWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0Yk9iamVjdFBhZ2U6IG1QYXJhbWV0ZXJzLmJPYmplY3RQYWdlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVBY3Rpb25SZXNwb25zZShtZXNzYWdlSGFuZGxlciwgbVBhcmFtZXRlcnMsIHNBY3Rpb25OYW1lKTtcblx0XHRcdHJldHVybiBvUmVzdWx0O1xuXHRcdH0gY2F0Y2ggKGVycjogYW55KSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVBY3Rpb25SZXNwb25zZShtZXNzYWdlSGFuZGxlciwgbVBhcmFtZXRlcnMsIHNBY3Rpb25OYW1lKTtcblx0XHRcdHRocm93IGVycjtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyBtZXNzYWdlcyBmb3IgYWN0aW9uIGNhbGwuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlciNfaGFuZGxlQWN0aW9uUmVzcG9uc2Vcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlciBUaGUgbWVzc2FnZSBoYW5kbGVyIGV4dGVuc2lvblxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgUGFyYW1ldGVycyB0byBiZSBjb25zaWRlcmVkIGZvciB0aGUgYWN0aW9uLlxuXHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbiB0byBiZSBjYWxsZWRcblx0ICogQHJldHVybnMgUHJvbWlzZSBhZnRlciBtZXNzYWdlIGRpYWxvZyBpcyBvcGVuZWQgaWYgcmVxdWlyZWQuXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdF9oYW5kbGVBY3Rpb25SZXNwb25zZShtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXIsIG1QYXJhbWV0ZXJzOiBhbnksIHNBY3Rpb25OYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBhVHJhbnNpZW50TWVzc2FnZXMgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZXModHJ1ZSwgdHJ1ZSk7XG5cdFx0Y29uc3QgYWN0aW9uTmFtZSA9IG1QYXJhbWV0ZXJzLmxhYmVsID8gbVBhcmFtZXRlcnMubGFiZWwgOiBzQWN0aW9uTmFtZTtcblx0XHRpZiAoYVRyYW5zaWVudE1lc3NhZ2VzLmxlbmd0aCA+IDAgJiYgbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwic0FjdGlvbk5hbWVcIiwgbVBhcmFtZXRlcnMubGFiZWwgPyBtUGFyYW1ldGVycy5sYWJlbCA6IHNBY3Rpb25OYW1lKTtcblx0XHR9XG5cdFx0bGV0IGNvbnRyb2w7XG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmNvbnRyb2xJZCkge1xuXHRcdFx0Y29udHJvbCA9IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wuYnlJZChtUGFyYW1ldGVycy5jb250cm9sSWQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb250cm9sID0gbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbDtcblx0XHR9XG5cdFx0cmV0dXJuIG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcyh7IHNBY3Rpb25OYW1lOiBhY3Rpb25OYW1lLCBjb250cm9sOiBjb250cm9sIH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdmFsaWRhdGlvbiBlcnJvcnMgZm9yIHRoZSAnRGlzY2FyZCcgYWN0aW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIjaGFuZGxlVmFsaWRhdGlvbkVycm9yXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGhhbmRsZVZhbGlkYXRpb25FcnJvcigpIHtcblx0XHRjb25zdCBvTWVzc2FnZU1hbmFnZXIgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCksXG5cdFx0XHRlcnJvclRvUmVtb3ZlID0gb01lc3NhZ2VNYW5hZ2VyXG5cdFx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0XHQuZ2V0RGF0YSgpXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKGVycm9yOiBhbnkpIHtcblx0XHRcdFx0XHQvLyBvbmx5IG5lZWRzIHRvIGhhbmRsZSB2YWxpZGF0aW9uIG1lc3NhZ2VzLCB0ZWNobmljYWwgYW5kIHBlcnNpc3RlbnQgZXJyb3JzIG5lZWRzIG5vdCB0byBiZSBjaGVja2VkIGhlcmUuXG5cdFx0XHRcdFx0aWYgKGVycm9yLnZhbGlkYXRpb24pIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdG9NZXNzYWdlTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhlcnJvclRvUmVtb3ZlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IFBvcG92ZXIuIEZhY3RvcnkgbWV0aG9kIHRvIG1ha2UgdW5pdCB0ZXN0cyBlYXNpZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBzZXR0aW5ncyBJbml0aWFsIHBhcmFtZXRlcnMgZm9yIHRoZSBwb3BvdmVyXG5cdCAqIEByZXR1cm5zIEEgbmV3IFBvcG92ZXJcblx0ICovXG5cdF9jcmVhdGVQb3BvdmVyKHNldHRpbmdzPzogJFBvcG92ZXJTZXR0aW5ncyk6IFBvcG92ZXIge1xuXHRcdHJldHVybiBuZXcgUG9wb3ZlcihzZXR0aW5ncyk7XG5cdH1cblxuXHQvKipcblx0ICogU2hvd3MgYSBwb3BvdmVyIHRvIGNvbmZpcm0gZGlzY2FyZCBpZiBuZWVkZWQuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIuX3Nob3dEaXNjYXJkUG9wb3ZlclxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHBhcmFtIGNhbmNlbEJ1dHRvbiBUaGUgY29udHJvbCB3aGljaCB3aWxsIG9wZW4gdGhlIHBvcG92ZXJcblx0ICogQHBhcmFtIGlzTW9kaWZpZWQgVHJ1ZSBpZiB0aGUgb2JqZWN0IGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBhIGNvbmZpcm1hdGlvbiBwb3BvdmVyIG11c3QgYmUgc2hvd25cblx0ICogQHBhcmFtIHJlc291cmNlTW9kZWwgVGhlIG1vZGVsIHRvIGxvYWQgdGV4dCByZXNvdXJjZXNcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBpZiB1c2VyIGNvbmZpcm1zIGRpc2NhcmQsIHJlamVjdHMgaWYgb3RoZXJ3aXNlLCByZWplY3RzIGlmIG5vIGNvbnRyb2wgcGFzc2VkIHRvIG9wZW4gcG9wb3ZlclxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRfY29uZmlybURpc2NhcmQoY2FuY2VsQnV0dG9uOiBCdXR0b24sIGlzTW9kaWZpZWQ6IGJvb2xlYW4sIHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyBJZiB0aGUgZGF0YSBpc24ndCBtb2RpZmllZCwgZG8gbm90IHNob3cgYW55IGNvbmZpcm1hdGlvbiBwb3BvdmVyXG5cdFx0aWYgKCFpc01vZGlmaWVkKSB7XG5cdFx0XHR0aGlzLmhhbmRsZVZhbGlkYXRpb25FcnJvcigpO1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblxuXHRcdGNhbmNlbEJ1dHRvbi5zZXRFbmFibGVkKGZhbHNlKTtcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Y29uc3QgY29uZmlybWF0aW9uUG9wb3ZlciA9IHRoaXMuX2NyZWF0ZVBvcG92ZXIoe1xuXHRcdFx0XHRzaG93SGVhZGVyOiBmYWxzZSxcblx0XHRcdFx0cGxhY2VtZW50OiBcIlRvcFwiXG5cdFx0XHR9KTtcblx0XHRcdGNvbmZpcm1hdGlvblBvcG92ZXIuYWRkU3R5bGVDbGFzcyhcInNhcFVpQ29udGVudFBhZGRpbmdcIik7XG5cblx0XHRcdC8vIENyZWF0ZSB0aGUgY29udGVudCBvZiB0aGUgcG9wb3ZlclxuXHRcdFx0Y29uc3QgdGl0bGUgPSBuZXcgVGV4dCh7XG5cdFx0XHRcdHRleHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0RSQUZUX0RJU0NBUkRfTUVTU0FHRVwiKVxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBjb25maXJtQnV0dG9uID0gbmV3IEJ1dHRvbih7XG5cdFx0XHRcdHRleHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0RSQUZUX0RJU0NBUkRfQlVUVE9OXCIpLFxuXHRcdFx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0XHRcdHByZXNzOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5oYW5kbGVWYWxpZGF0aW9uRXJyb3IoKTtcblx0XHRcdFx0XHRjb25maXJtYXRpb25Qb3BvdmVyLmRhdGEoXCJjb250aW51ZURpc2NhcmRcIiwgdHJ1ZSk7XG5cdFx0XHRcdFx0Y29uZmlybWF0aW9uUG9wb3Zlci5jbG9zZSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRhcmlhTGFiZWxsZWRCeTogW3RpdGxlXVxuXHRcdFx0fSk7XG5cdFx0XHRjb25maXJtYXRpb25Qb3BvdmVyLmFkZENvbnRlbnQobmV3IFZCb3goeyBpdGVtczogW3RpdGxlLCBjb25maXJtQnV0dG9uXSB9KSk7XG5cblx0XHRcdC8vIEF0dGFjaCBoYW5kbGVyXG5cdFx0XHRjb25maXJtYXRpb25Qb3BvdmVyLmF0dGFjaEJlZm9yZU9wZW4oKCkgPT4ge1xuXHRcdFx0XHRjb25maXJtYXRpb25Qb3BvdmVyLnNldEluaXRpYWxGb2N1cyhjb25maXJtQnV0dG9uKTtcblx0XHRcdH0pO1xuXHRcdFx0Y29uZmlybWF0aW9uUG9wb3Zlci5hdHRhY2hBZnRlckNsb3NlKCgpID0+IHtcblx0XHRcdFx0Y2FuY2VsQnV0dG9uLnNldEVuYWJsZWQodHJ1ZSk7XG5cdFx0XHRcdGlmIChjb25maXJtYXRpb25Qb3BvdmVyLmRhdGEoXCJjb250aW51ZURpc2NhcmRcIikpIHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVqZWN0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRjb25maXJtYXRpb25Qb3BvdmVyLm9wZW5CeShjYW5jZWxCdXR0b24sIGZhbHNlKTtcblx0XHR9KTtcblx0fVxuXG5cdF9sYXVuY2hEaWFsb2dXaXRoS2V5RmllbGRzKFxuXHRcdG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRtRmllbGRzOiBhbnksXG5cdFx0b01vZGVsOiBPRGF0YU1vZGVsLFxuXHRcdG1QYXJhbWV0ZXJzOiBhbnksXG5cdFx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyXG5cdCkge1xuXHRcdGxldCBvRGlhbG9nOiBEaWFsb2c7XG5cdFx0Y29uc3Qgb1BhcmVudENvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sO1xuXG5cdFx0Ly8gQ3JhdGUgYSBmYWtlICh0cmFuc2llbnQpIGxpc3RCaW5kaW5nIGFuZCBjb250ZXh0LCBqdXN0IGZvciB0aGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBkaWFsb2dcblx0XHRjb25zdCBvVHJhbnNpZW50TGlzdEJpbmRpbmcgPSBvTW9kZWwuYmluZExpc3Qob0xpc3RCaW5kaW5nLmdldFBhdGgoKSwgb0xpc3RCaW5kaW5nLmdldENvbnRleHQoKSwgW10sIFtdLCB7XG5cdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwic3VibWl0TGF0ZXJcIlxuXHRcdH0pO1xuXHRcdG9UcmFuc2llbnRMaXN0QmluZGluZy5yZWZyZXNoSW50ZXJuYWwgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHQvKiAqL1xuXHRcdH07XG5cdFx0Y29uc3Qgb1RyYW5zaWVudENvbnRleHQgPSBvVHJhbnNpZW50TGlzdEJpbmRpbmcuY3JlYXRlKG1QYXJhbWV0ZXJzLmRhdGEsIHRydWUpO1xuXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGFzeW5jIChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGNvbnN0IHNGcmFnbWVudE5hbWUgPSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL05vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkc0RpYWxvZ1wiO1xuXHRcdFx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIiksXG5cdFx0XHRcdHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9QYXJlbnRDb250cm9sKSxcblx0XHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0YUltbXV0YWJsZUZpZWxkczogYW55W10gPSBbXSxcblx0XHRcdFx0c1BhdGggPSAob0xpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKSA/IG9MaXN0QmluZGluZy5nZXRSZXNvbHZlZFBhdGgoKSA6IG9MaXN0QmluZGluZy5nZXRQYXRoKCkpIGFzIHN0cmluZyxcblx0XHRcdFx0b0VudGl0eVNldENvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNQYXRoKSBhcyBDb250ZXh0LFxuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0XHRcdGZvciAoY29uc3QgaSBpbiBtRmllbGRzKSB7XG5cdFx0XHRcdGFJbW11dGFibGVGaWVsZHMucHVzaChvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NNZXRhUGF0aH0vJHttRmllbGRzW2ldfWApKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IG9JbW11dGFibGVDdHhNb2RlbCA9IG5ldyBKU09OTW9kZWwoYUltbXV0YWJsZUZpZWxkcyk7XG5cdFx0XHRjb25zdCBvSW1tdXRhYmxlQ3R4ID0gb0ltbXV0YWJsZUN0eE1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0XHRcdGNvbnN0IGFSZXF1aXJlZFByb3BlcnRpZXMgPSBnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zKHNNZXRhUGF0aCwgb01ldGFNb2RlbCk7XG5cdFx0XHRjb25zdCBvUmVxdWlyZWRQcm9wZXJ0eVBhdGhzQ3R4TW9kZWwgPSBuZXcgSlNPTk1vZGVsKGFSZXF1aXJlZFByb3BlcnRpZXMpO1xuXHRcdFx0Y29uc3Qgb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eCA9IG9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHhNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdFx0XHRjb25zdCBvTmV3RnJhZ21lbnQgPSBhd2FpdCBYTUxQcmVwcm9jZXNzb3IucHJvY2Vzcyhcblx0XHRcdFx0b0ZyYWdtZW50LFxuXHRcdFx0XHR7IG5hbWU6IHNGcmFnbWVudE5hbWUgfSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdFx0XHRcdGZpZWxkczogb0ltbXV0YWJsZUN0eCxcblx0XHRcdFx0XHRcdHJlcXVpcmVkUHJvcGVydGllczogb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9FbnRpdHlTZXRDb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRmaWVsZHM6IG9JbW11dGFibGVDdHguZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdHJlcXVpcmVkUHJvcGVydGllczogb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eE1vZGVsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXHRcdFx0bGV0IGFGb3JtRWxlbWVudHM6IGFueVtdID0gW107XG5cdFx0XHRjb25zdCBtRmllbGRWYWx1ZU1hcDogYW55ID0ge307XG5cdFx0XHRjb25zdCBtZXNzYWdlTWFuYWdlciA9IENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0XHRcdGNvbnN0IF9yZW1vdmVNZXNzYWdlc0ZvckFjdGlvblBhcmFtdGVyID0gKG1lc3NhZ2VDb250cm9sSWQ6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRjb25zdCBhbGxNZXNzYWdlcyA9IG1lc3NhZ2VNYW5hZ2VyLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0XHRcdFx0Ly8gYWxzbyByZW1vdmUgbWVzc2FnZXMgYXNzaWduZWQgdG8gaW5uZXIgY29udHJvbHMsIGJ1dCBhdm9pZCByZW1vdmluZyBtZXNzYWdlcyBmb3IgZGlmZmVyZW50IHBhcmFtdGVycyAod2l0aCBuYW1lIGJlaW5nIHN1YnN0cmluZyBvZiBhbm90aGVyIHBhcmFtZXRlciBuYW1lKVxuXHRcdFx0XHRjb25zdCByZWxldmFudE1lc3NhZ2VzID0gYWxsTWVzc2FnZXMuZmlsdGVyKChtc2c6IE1lc3NhZ2UpID0+XG5cdFx0XHRcdFx0bXNnLmdldENvbnRyb2xJZHMoKS5zb21lKChjb250cm9sSWQ6IHN0cmluZykgPT4gY29udHJvbElkLmluY2x1ZGVzKG1lc3NhZ2VDb250cm9sSWQpKVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRtZXNzYWdlTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhyZWxldmFudE1lc3NhZ2VzKTtcblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0ge1xuXHRcdFx0XHQvKlxuXHRcdFx0XHRcdGZpcmVkIG9uIGZvY3VzIG91dCBmcm9tIGZpZWxkIG9yIG9uIHNlbGVjdGluZyBhIHZhbHVlIGZyb20gdGhlIHZhbHVlaGVscC5cblx0XHRcdFx0XHR0aGUgY3JlYXRlIGJ1dHRvbiAoQ29udGludWUpIGlzIGFsd2F5cyBlbmFibGVkLlxuXHRcdFx0XHRcdGxpdmVDaGFuZ2UgaXMgbm90IGZpcmVkIHdoZW4gdmFsdWUgaXMgYWRkZWQgZnJvbSB2YWx1ZWhlbHAuXG5cdFx0XHRcdFx0dmFsdWUgdmFsaWRhdGlvbiBpcyBkb25lIGZvciBjcmVhdGUgYnV0dG9uLlxuXHRcdFx0XHQqL1xuXHRcdFx0XHRoYW5kbGVDaGFuZ2U6IGFzeW5jIChldmVudDogRXZlbnQpID0+IHtcblx0XHRcdFx0XHRjb25zdCBmaWVsZElkID0gZXZlbnQuZ2V0UGFyYW1ldGVyKFwiaWRcIik7XG5cdFx0XHRcdFx0Y29uc3QgZmllbGQgPSBldmVudC5nZXRTb3VyY2UoKTtcblx0XHRcdFx0XHRjb25zdCBhY3Rpb25QYXJhbWV0ZXJJbmZvID0gYWN0aW9uUGFyYW1ldGVySW5mb3MuZmluZChcblx0XHRcdFx0XHRcdChhY3Rpb25QYXJhbWV0ZXJJbmZvKSA9PiBhY3Rpb25QYXJhbWV0ZXJJbmZvLmZpZWxkID09PSBmaWVsZFxuXHRcdFx0XHRcdCkgYXMgQWN0aW9uUGFyYW1ldGVySW5mbztcblx0XHRcdFx0XHRfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlcihmaWVsZElkKTtcblx0XHRcdFx0XHRhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbGlkYXRpb25Qcm9taXNlID0gZXZlbnQuZ2V0UGFyYW1ldGVyKFwicHJvbWlzZVwiKSBhcyBQcm9taXNlPHN0cmluZz47XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8udmFsdWUgPSBhd2FpdCBhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbGlkYXRpb25Qcm9taXNlO1xuXHRcdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mby5oYXNFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgYWN0aW9uUGFyYW1ldGVySW5mby52YWx1ZTtcblx0XHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8uaGFzRXJyb3IgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0Lypcblx0XHRcdFx0XHRmaXJlZCBvbiBrZXkgcHJlc3MuIHRoZSBjcmVhdGUgYnV0dG9uIHRoZSBjcmVhdGUgYnV0dG9uIChDb250aW51ZSkgaXMgYWx3YXlzIGVuYWJsZWQuXG5cdFx0XHRcdFx0bGl2ZUNoYW5nZSBpcyBub3QgZmlyZWQgd2hlbiB2YWx1ZSBpcyBhZGRlZCBmcm9tIHZhbHVlaGVscC5cblx0XHRcdFx0XHR2YWx1ZSB2YWxpZGF0aW9uIGlzIGRvbmUgZm9yIGNyZWF0ZSBidXR0b24uXG5cdFx0XHRcdCovXG5cdFx0XHRcdGhhbmRsZUxpdmVDaGFuZ2U6IChldmVudDogRXZlbnQpID0+IHtcblx0XHRcdFx0XHRjb25zdCBmaWVsZElkID0gZXZlbnQuZ2V0UGFyYW1ldGVyKFwiaWRcIik7XG5cdFx0XHRcdFx0X3JlbW92ZU1lc3NhZ2VzRm9yQWN0aW9uUGFyYW10ZXIoZmllbGRJZCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IG9EaWFsb2dDb250ZW50OiBhbnkgPSBhd2FpdCBGcmFnbWVudC5sb2FkKHtcblx0XHRcdFx0ZGVmaW5pdGlvbjogb05ld0ZyYWdtZW50LFxuXHRcdFx0XHRjb250cm9sbGVyOiBvQ29udHJvbGxlclxuXHRcdFx0fSk7XG5cdFx0XHRsZXQgb1Jlc3VsdDogYW55O1xuXHRcdFx0Y29uc3QgY2xvc2VEaWFsb2cgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vcmVqZWN0ZWQvcmVzb2x2ZWQgdGhlIHByb21pcyByZXR1cm5lZCBieSBfbGF1bmNoRGlhbG9nV2l0aEtleUZpZWxkc1xuXHRcdFx0XHQvL2FzIHNvb24gYXMgdGhlIGRpYWxvZyBpcyBjbG9zZWQuIFdpdGhvdXQgd2FpdGluZyBmb3IgdGhlIGRpYWxvZydzXG5cdFx0XHRcdC8vYW5pbWF0aW9uIHRvIGZpbmlzaFxuXHRcdFx0XHRpZiAob1Jlc3VsdC5lcnJvcikge1xuXHRcdFx0XHRcdHJlamVjdChvUmVzdWx0LmVycm9yKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXNvbHZlKG9SZXN1bHQucmVzcG9uc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdH07XG5cblx0XHRcdG9EaWFsb2cgPSBuZXcgRGlhbG9nKGdlbmVyYXRlKFtcIkNyZWF0ZURpYWxvZ1wiLCBzTWV0YVBhdGhdKSwge1xuXHRcdFx0XHR0aXRsZTogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfU0FQRkVfQUNUSU9OX0NSRUFURVwiKSxcblx0XHRcdFx0Y29udGVudDogW29EaWFsb2dDb250ZW50XSxcblx0XHRcdFx0YmVnaW5CdXR0b246IHtcblx0XHRcdFx0XHR0ZXh0OiByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9TQVBGRV9BQ1RJT05fQ1JFQVRFX0JVVFRPTlwiKSxcblx0XHRcdFx0XHR0eXBlOiBcIkVtcGhhc2l6ZWRcIixcblxuXHRcdFx0XHRcdHByZXNzOiBhc3luYyAoX0V2ZW50OiB1bmtub3duKSA9PiB7XG5cdFx0XHRcdFx0XHQvKiBWYWxpZGF0aW9uIG9mIG1hbmRhdG9yeSBhbmQgdmFsdWUgc3RhdGUgZm9yIGFjdGlvbiBwYXJhbWV0ZXJzICovXG5cdFx0XHRcdFx0XHRpZiAoIShhd2FpdCBBY3Rpb25SdW50aW1lLnZhbGlkYXRlUHJvcGVydGllcyhtZXNzYWdlTWFuYWdlciwgYWN0aW9uUGFyYW1ldGVySW5mb3MsIHJlc291cmNlTW9kZWwpKSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIubG9jayhvRGlhbG9nKTtcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmJJc0NyZWF0ZURpYWxvZyA9IHRydWU7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhVmFsdWVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRcdFx0XHRcdFx0T2JqZWN0LmtleXMobUZpZWxkVmFsdWVNYXApLm1hcChhc3luYyBmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBvVmFsdWUgPSBhd2FpdCBtRmllbGRWYWx1ZU1hcFtzS2V5XTtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9EaWFsb2dWYWx1ZTogYW55ID0ge307XG5cdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nVmFsdWVbc0tleV0gPSBvVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb0RpYWxvZ1ZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IHRvRVM2UHJvbWlzZShcblx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9MaXN0QmluZGluZyAmJiBvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjcmVhdGVQYXJhbWV0ZXJzOiBhVmFsdWVzXG5cdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y29uc3QgdHJhbnNpZW50RGF0YSA9IG9UcmFuc2llbnRDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjcmVhdGVEYXRhOiBhbnkgPSB7fTtcblx0XHRcdFx0XHRcdFx0T2JqZWN0LmtleXModHJhbnNpZW50RGF0YSkuZm9yRWFjaChmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1Byb3BlcnR5ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS8ke3NQcm9wZXJ0eVBhdGh9YCk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gZW5zdXJlIG5hdmlnYXRpb24gcHJvcGVydGllcyBhcmUgbm90IHBhcnQgb2YgdGhlIHBheWxvYWQsIGRlZXAgY3JlYXRlIG5vdCBzdXBwb3J0ZWRcblx0XHRcdFx0XHRcdFx0XHRpZiAob1Byb3BlcnR5ICYmIG9Qcm9wZXJ0eS4ka2luZCA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRjcmVhdGVEYXRhW3NQcm9wZXJ0eVBhdGhdID0gdHJhbnNpZW50RGF0YVtzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9OZXdEb2N1bWVudENvbnRleHQgPSBvTGlzdEJpbmRpbmcuY3JlYXRlKFxuXHRcdFx0XHRcdFx0XHRcdGNyZWF0ZURhdGEsXG5cdFx0XHRcdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGVBdEVuZCxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbmFjdGl2ZVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9Qcm9taXNlID0gdGhpcy5vbkFmdGVyQ3JlYXRlQ29tcGxldGlvbihvTGlzdEJpbmRpbmcsIG9OZXdEb2N1bWVudENvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRcdFx0bGV0IG9SZXNwb25zZTogYW55ID0gYXdhaXQgb1Byb21pc2U7XG5cdFx0XHRcdFx0XHRcdGlmICghb1Jlc3BvbnNlIHx8IChvUmVzcG9uc2UgJiYgb1Jlc3BvbnNlLmJLZWVwRGlhbG9nT3BlbiAhPT0gdHJ1ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRvUmVzcG9uc2UgPSBvUmVzcG9uc2UgPz8ge307XG5cdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5zZXRCaW5kaW5nQ29udGV4dChudWxsIGFzIGFueSk7XG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3BvbnNlLm5ld0NvbnRleHQgPSBvTmV3RG9jdW1lbnRDb250ZXh0O1xuXHRcdFx0XHRcdFx0XHRcdG9SZXN1bHQgPSB7IHJlc3BvbnNlOiBvUmVzcG9uc2UgfTtcblx0XHRcdFx0XHRcdFx0XHRjbG9zZURpYWxvZygpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHQvLyBpbiBjYXNlIG9mIGNyZWF0aW9uIGZhaWxlZCwgZGlhbG9nIHNob3VsZCBzdGF5IG9wZW4gLSB0byBhY2hpZXZlIHRoZSBzYW1lLCBub3RoaW5nIGhhcyB0byBiZSBkb25lIChsaWtlIGluIGNhc2Ugb2Ygc3VjY2VzcyB3aXRoIGJLZWVwRGlhbG9nT3Blbilcblx0XHRcdFx0XHRcdFx0aWYgKG9FcnJvciAhPT0gRkVMaWJyYXJ5LkNvbnN0YW50cy5DcmVhdGlvbkZhaWxlZCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIG90aGVyIGVycm9ycyBhcmUgbm90IGV4cGVjdGVkXG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3VsdCA9IHsgZXJyb3I6IG9FcnJvciB9O1xuXHRcdFx0XHRcdFx0XHRcdGNsb3NlRGlhbG9nKCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9EaWFsb2cpO1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVuZEJ1dHRvbjoge1xuXHRcdFx0XHRcdHRleHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX0FDVElPTl9QQVJBTUVURVJfRElBTE9HX0NBTkNFTFwiKSxcblx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b1Jlc3VsdCA9IHsgZXJyb3I6IEZFTGlicmFyeS5Db25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nIH07XG5cdFx0XHRcdFx0XHRjbG9zZURpYWxvZygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8qIFdoZW4gdGhlIGRpYWxvZyBpcyBjYW5jZWxsZWQsIG1lc3NhZ2VzIG5lZWQgdG8gYmUgcmVtb3ZlZCBpbiBjYXNlIHRoZSBzYW1lIGFjdGlvbiBzaG91bGQgYmUgZXhlY3V0ZWQgYWdhaW4gKi9cblx0XHRcdFx0XHRmb3IgKGNvbnN0IGFjdGlvblBhcmFtZXRlckluZm8gb2YgYWN0aW9uUGFyYW1ldGVySW5mb3MpIHtcblx0XHRcdFx0XHRcdGNvbnN0IGZpZWxkSWQgPSBhY3Rpb25QYXJhbWV0ZXJJbmZvLmZpZWxkLmdldElkKCk7XG5cdFx0XHRcdFx0XHRfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlcihmaWVsZElkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gc2hvdyBmb290ZXIgYXMgcGVyIFVYIGd1aWRlbGluZXMgd2hlbiBkaWFsb2cgaXMgbm90IG9wZW5cblx0XHRcdFx0XHQob0RpYWxvZy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KT8uc2V0UHJvcGVydHkoXCJpc0NyZWF0ZURpYWxvZ09wZW5cIiwgZmFsc2UpO1xuXHRcdFx0XHRcdG9EaWFsb2cuZGVzdHJveSgpO1xuXHRcdFx0XHRcdG9UcmFuc2llbnRMaXN0QmluZGluZy5kZXN0cm95KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gYXMgYW55KTtcblx0XHRcdGFGb3JtRWxlbWVudHMgPSBvRGlhbG9nQ29udGVudD8uZ2V0QWdncmVnYXRpb24oXCJmb3JtXCIpLmdldEFnZ3JlZ2F0aW9uKFwiZm9ybUNvbnRhaW5lcnNcIilbMF0uZ2V0QWdncmVnYXRpb24oXCJmb3JtRWxlbWVudHNcIik7XG5cdFx0XHRjb25zdCBhY3Rpb25QYXJhbWV0ZXJJbmZvcyA9IGFGb3JtRWxlbWVudHMubWFwKChwYXJhbWV0ZXJGaWVsZCkgPT4ge1xuXHRcdFx0XHRjb25zdCBmaWVsZDogRmllbGQgfCBNdWx0aVZhbHVlRmllbGQgPSBwYXJhbWV0ZXJGaWVsZC5nZXRGaWVsZHMoKVswXTtcblx0XHRcdFx0Y29uc3QgaXNNdWx0aVZhbHVlID0gZmllbGQuaXNBKFwic2FwLnVpLm1kYy5NdWx0aVZhbHVlRmllbGRcIik7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0cGFyYW1ldGVyOiBwYXJhbWV0ZXJGaWVsZCxcblx0XHRcdFx0XHRpc011bHRpVmFsdWU6IGlzTXVsdGlWYWx1ZSxcblx0XHRcdFx0XHRmaWVsZDogZmllbGQsXG5cdFx0XHRcdFx0dmFsdWU6IGlzTXVsdGlWYWx1ZSA/IChmaWVsZCBhcyBNdWx0aVZhbHVlRmllbGQpLmdldEl0ZW1zKCkgOiAoZmllbGQgYXMgRmllbGQpLmdldFZhbHVlKCksXG5cdFx0XHRcdFx0dmFsaWRhdGlvblByb21pc2U6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRoYXNFcnJvcjogZmFsc2Vcblx0XHRcdFx0fTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKG9QYXJlbnRDb250cm9sICYmIG9QYXJlbnRDb250cm9sLmFkZERlcGVuZGVudCkge1xuXHRcdFx0XHQvLyBpZiB0aGVyZSBpcyBhIHBhcmVudCBjb250cm9sIHNwZWNpZmllZCBhZGQgdGhlIGRpYWxvZyBhcyBkZXBlbmRlbnRcblx0XHRcdFx0b1BhcmVudENvbnRyb2wuYWRkRGVwZW5kZW50KG9EaWFsb2cpO1xuXHRcdFx0fVxuXG5cdFx0XHRvRGlhbG9nLnNldEJpbmRpbmdDb250ZXh0KG9UcmFuc2llbnRDb250ZXh0KTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGF3YWl0IENvbW1vblV0aWxzLnNldFVzZXJEZWZhdWx0cyhcblx0XHRcdFx0XHRhcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0YUltbXV0YWJsZUZpZWxkcyxcblx0XHRcdFx0XHRvVHJhbnNpZW50Q29udGV4dCxcblx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGVBY3Rpb24sXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGF0YVxuXHRcdFx0XHQpO1xuXHRcdFx0XHQvLyBmb290ZXIgbXVzdCBub3QgYmUgdmlzaWJsZSB3aGVuIHRoZSBkaWFsb2cgaXMgb3BlbiBhcyBwZXIgVVggZ3VpZGVsaW5lc1xuXHRcdFx0XHQob0RpYWxvZy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KS5zZXRQcm9wZXJ0eShcImlzQ3JlYXRlRGlhbG9nT3BlblwiLCB0cnVlKTtcblx0XHRcdFx0b0RpYWxvZy5vcGVuKCk7XG5cdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoKTtcblx0XHRcdFx0dGhyb3cgb0Vycm9yO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0b25BZnRlckNyZWF0ZUNvbXBsZXRpb24ob0xpc3RCaW5kaW5nOiBhbnksIG9OZXdEb2N1bWVudENvbnRleHQ6IGFueSwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGxldCBmblJlc29sdmU6IEZ1bmN0aW9uO1xuXHRcdGNvbnN0IG9Qcm9taXNlID0gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUpID0+IHtcblx0XHRcdGZuUmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBmbkNyZWF0ZUNvbXBsZXRlZCA9IChvRXZlbnQ6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgb0NvbnRleHQgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiY29udGV4dFwiKSxcblx0XHRcdFx0YlN1Y2Nlc3MgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwic3VjY2Vzc1wiKTtcblx0XHRcdGlmIChvQ29udGV4dCA9PT0gb05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHRvTGlzdEJpbmRpbmcuZGV0YWNoQ3JlYXRlQ29tcGxldGVkKGZuQ3JlYXRlQ29tcGxldGVkLCB0aGlzKTtcblx0XHRcdFx0Zm5SZXNvbHZlKGJTdWNjZXNzKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGNvbnN0IGZuU2FmZUNvbnRleHRDcmVhdGVkID0gKCkgPT4ge1xuXHRcdFx0b05ld0RvY3VtZW50Q29udGV4dFxuXHRcdFx0XHQuY3JlYXRlZCgpXG5cdFx0XHRcdC50aGVuKHVuZGVmaW5lZCwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdExvZy50cmFjZShcInRyYW5zaWVudCBjcmVhdGlvbiBjb250ZXh0IGRlbGV0ZWRcIik7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoY29udGV4dEVycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cudHJhY2UoXCJ0cmFuc2llbnQgY3JlYXRpb24gY29udGV4dCBkZWxldGlvbiBlcnJvclwiLCBjb250ZXh0RXJyb3IpO1xuXHRcdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0b0xpc3RCaW5kaW5nLmF0dGFjaENyZWF0ZUNvbXBsZXRlZChmbkNyZWF0ZUNvbXBsZXRlZCwgdGhpcyk7XG5cblx0XHRyZXR1cm4gb1Byb21pc2UudGhlbigoYlN1Y2Nlc3M6IGJvb2xlYW4pID0+IHtcblx0XHRcdGlmICghYlN1Y2Nlc3MpIHtcblx0XHRcdFx0aWYgKCFtUGFyYW1ldGVycy5rZWVwVHJhbnNpZW50Q29udGV4dE9uRmFpbGVkKSB7XG5cdFx0XHRcdFx0Ly8gQ2FuY2VsIHRoZSBwZW5kaW5nIFBPU1QgYW5kIGRlbGV0ZSB0aGUgY29udGV4dCBpbiB0aGUgbGlzdEJpbmRpbmdcblx0XHRcdFx0XHRmblNhZmVDb250ZXh0Q3JlYXRlZCgpOyAvLyBUbyBhdm9pZCBhICdyZXF1ZXN0IGNhbmNlbGxlZCcgZXJyb3IgaW4gdGhlIGNvbnNvbGVcblx0XHRcdFx0XHRvTGlzdEJpbmRpbmcucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0b0xpc3RCaW5kaW5nLmdldE1vZGVsKCkucmVzZXRDaGFuZ2VzKG9MaXN0QmluZGluZy5nZXRVcGRhdGVHcm91cElkKCkpO1xuXG5cdFx0XHRcdFx0dGhyb3cgRkVMaWJyYXJ5LkNvbnN0YW50cy5DcmVhdGlvbkZhaWxlZDtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4geyBiS2VlcERpYWxvZ09wZW46IHRydWUgfTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBvTmV3RG9jdW1lbnRDb250ZXh0LmNyZWF0ZWQoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIG5hbWUgb2YgdGhlIE5ld0FjdGlvbiB0byBiZSBleGVjdXRlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBzdGF0aWNcblx0ICogQHByaXZhdGVcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIuX2dldE5ld0FjdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHBhcmFtIG9TdGFydHVwUGFyYW1ldGVycyBTdGFydHVwIHBhcmFtZXRlcnMgb2YgdGhlIGFwcGxpY2F0aW9uXG5cdCAqIEBwYXJhbSBzQ3JlYXRlSGFzaCBIYXNoIHRvIGJlIGNoZWNrZWQgZm9yIGFjdGlvbiB0eXBlXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBNZXRhTW9kZWwgdXNlZCB0byBjaGVjayBmb3IgTmV3QWN0aW9uIHBhcmFtZXRlclxuXHQgKiBAcGFyYW0gc01ldGFQYXRoIFRoZSBNZXRhUGF0aFxuXHQgKiBAcmV0dXJucyBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdF9nZXROZXdBY3Rpb24ob1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnksIHNDcmVhdGVIYXNoOiBzdHJpbmcsIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBzTWV0YVBhdGg6IHN0cmluZykge1xuXHRcdGxldCBzTmV3QWN0aW9uO1xuXG5cdFx0aWYgKG9TdGFydHVwUGFyYW1ldGVycyAmJiBvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZSAmJiBzQ3JlYXRlSGFzaC50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJJLUFDVElPTj1DUkVBVEVXSVRIXCIpID4gLTEpIHtcblx0XHRcdGNvbnN0IHNQcmVmZXJyZWRNb2RlID0gb1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGVbMF07XG5cdFx0XHRzTmV3QWN0aW9uID1cblx0XHRcdFx0c1ByZWZlcnJlZE1vZGUudG9VcHBlckNhc2UoKS5pbmRleE9mKFwiQ1JFQVRFV0lUSDpcIikgPiAtMVxuXHRcdFx0XHRcdD8gc1ByZWZlcnJlZE1vZGUuc3Vic3RyKHNQcmVmZXJyZWRNb2RlLmxhc3RJbmRleE9mKFwiOlwiKSArIDEpXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyAmJlxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGUgJiZcblx0XHRcdHNDcmVhdGVIYXNoLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihcIkktQUNUSU9OPUFVVE9DUkVBVEVXSVRIXCIpID4gLTFcblx0XHQpIHtcblx0XHRcdGNvbnN0IHNQcmVmZXJyZWRNb2RlID0gb1N0YXJ0dXBQYXJhbWV0ZXJzLnByZWZlcnJlZE1vZGVbMF07XG5cdFx0XHRzTmV3QWN0aW9uID1cblx0XHRcdFx0c1ByZWZlcnJlZE1vZGUudG9VcHBlckNhc2UoKS5pbmRleE9mKFwiQVVUT0NSRUFURVdJVEg6XCIpID4gLTFcblx0XHRcdFx0XHQ/IHNQcmVmZXJyZWRNb2RlLnN1YnN0cihzUHJlZmVycmVkTW9kZS5sYXN0SW5kZXhPZihcIjpcIikgKyAxKVxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzTmV3QWN0aW9uID1cblx0XHRcdFx0b01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE9iamVjdCAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0PyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZC9OZXdBY3Rpb25gKSB8fFxuXHRcdFx0XHRcdCAgb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290L05ld0FjdGlvbmApXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiBzTmV3QWN0aW9uO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgbGFiZWwgZm9yIHRoZSB0aXRsZSBvZiBhIHNwZWNpZmljIGNyZWF0ZSBhY3Rpb24gZGlhbG9nLCBlLmcuIENyZWF0ZSBTYWxlcyBPcmRlciBmcm9tIFF1b3RhdGlvbi5cblx0ICpcblx0ICogVGhlIGZvbGxvd2luZyBwcmlvcml0eSBpcyBhcHBsaWVkOlxuXHQgKiAxLiBsYWJlbCBvZiBsaW5lLWl0ZW0gYW5ub3RhdGlvbi5cblx0ICogMi4gbGFiZWwgYW5ub3RhdGVkIGluIHRoZSBhY3Rpb24uXG5cdCAqIDMuIFwiQ3JlYXRlXCIgYXMgYSBjb25zdGFudCBmcm9tIGkxOG4uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAc3RhdGljXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyLl9nZXRTcGVjaWZpY0NyZWF0ZUFjdGlvbkRpYWxvZ0xhYmVsXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgTWV0YU1vZGVsIHVzZWQgdG8gY2hlY2sgZm9yIHRoZSBOZXdBY3Rpb24gcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGggVGhlIE1ldGFQYXRoXG5cdCAqIEBwYXJhbSBzTmV3QWN0aW9uIENvbnRhaW5zIHRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgZXhlY3V0ZWRcblx0ICogQHBhcmFtIG9SZXNvdXJjZUJ1bmRsZUNvcmUgUmVzb3VyY2VCdW5kbGUgdG8gYWNjZXNzIHRoZSBkZWZhdWx0IENyZWF0ZSBsYWJlbFxuXHQgKiBAcmV0dXJucyBUaGUgbGFiZWwgZm9yIHRoZSBDcmVhdGUgQWN0aW9uIERpYWxvZ1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRfZ2V0U3BlY2lmaWNDcmVhdGVBY3Rpb25EaWFsb2dMYWJlbChcblx0XHRvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0XHRzTWV0YVBhdGg6IHN0cmluZyxcblx0XHRzTmV3QWN0aW9uOiBzdHJpbmcsXG5cdFx0b1Jlc291cmNlQnVuZGxlQ29yZTogUmVzb3VyY2VCdW5kbGVcblx0KSB7XG5cdFx0Y29uc3QgZm5HZXRMYWJlbEZyb21MaW5lSXRlbUFubm90YXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAob01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbWApKSB7XG5cdFx0XHRcdGNvbnN0IGlMaW5lSXRlbUluZGV4ID0gb01ldGFNb2RlbFxuXHRcdFx0XHRcdC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTGluZUl0ZW1gKVxuXHRcdFx0XHRcdC5maW5kSW5kZXgoZnVuY3Rpb24gKG9MaW5lSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhTGluZUl0ZW1BY3Rpb24gPSBvTGluZUl0ZW0uQWN0aW9uID8gb0xpbmVJdGVtLkFjdGlvbi5zcGxpdChcIihcIikgOiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYUxpbmVJdGVtQWN0aW9uID8gYUxpbmVJdGVtQWN0aW9uWzBdID09PSBzTmV3QWN0aW9uIDogZmFsc2U7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBpTGluZUl0ZW1JbmRleCA+IC0xXG5cdFx0XHRcdFx0PyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbWApW2lMaW5lSXRlbUluZGV4XS5MYWJlbFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdGZuR2V0TGFiZWxGcm9tTGluZUl0ZW1Bbm5vdGF0aW9uKCkgfHxcblx0XHRcdChvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vJHtzTmV3QWN0aW9ufUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxgKSkgfHxcblx0XHRcdChvUmVzb3VyY2VCdW5kbGVDb3JlICYmIG9SZXNvdXJjZUJ1bmRsZUNvcmUuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX1NBUEZFX0FDVElPTl9DUkVBVEVcIikpXG5cdFx0KTtcblx0fVxufVxuXG5jb25zdCBzaW5nbGV0b24gPSBuZXcgVHJhbnNhY3Rpb25IZWxwZXIoKTtcbmV4cG9ydCBkZWZhdWx0IHNpbmdsZXRvbjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7RUE4Q0EsTUFBTUEsWUFBWSxHQUFHQyxTQUFTLENBQUNELFlBQVk7RUFDM0MsTUFBTUUsZ0JBQWdCLEdBQUdELFNBQVMsQ0FBQ0MsZ0JBQWdCOztFQUVuRDtFQUNBLE1BQU1DLGlCQUFpQixHQUFHQyxZQUFZLENBQUNELGlCQUFpQjtFQUN4RCxNQUFNRSwwQkFBMEIsR0FBR0QsWUFBWSxDQUFDQywwQkFBMEI7O0VBRTFFO0VBQ0EsU0FBU0MsYUFBYSxDQUFDQyxXQUFnQixFQUFFO0lBQ3hDLElBQUlBLFdBQVcsSUFBSUEsV0FBVyxDQUFDQyxXQUFXLElBQUlELFdBQVcsQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLE9BQU8sRUFBRSxLQUFLLG1CQUFtQixFQUFFO01BQzFHRixXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQ2pCO0lBQ0EsT0FBT0EsV0FBVyxJQUFJLENBQUMsQ0FBQztFQUN6QjtFQUFDLElBRUtHLGlCQUFpQjtJQUFBO0lBQUE7SUFBQSxPQUN0QkMsUUFBUSxHQUFSLGtCQUFTQyxZQUEwQixFQUFFQyxRQUFpQixFQUFFO01BQ3ZEQyxVQUFVLENBQUNDLElBQUksQ0FBQ0gsWUFBWSxDQUFDSSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUVILFFBQVEsQ0FBQztJQUN2RCxDQUFDO0lBQUEsT0FFREksVUFBVSxHQUFWLG9CQUFXTCxZQUEwQixFQUFFQyxRQUFpQixFQUFFO01BQ3pEQyxVQUFVLENBQUNJLE1BQU0sQ0FBQ04sWUFBWSxDQUFDSSxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUVILFFBQVEsQ0FBQztJQUN6RCxDQUFDO0lBQUEsT0FFRE0sbUJBQW1CLEdBQW5CLDZCQUFvQkMsTUFBZ0MsRUFB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
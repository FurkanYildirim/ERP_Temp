/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/ResourceModelHelper", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/m/Text", "sap/ui/core/Core", "../../operationsHelper", "./draftDataLossPopup"], function (Log, CommonUtils, messageHandling, ResourceModelHelper, Button, Dialog, MessageBox, Text, Core, operationsHelper, draftDataLossPopup) {
  "use strict";

  var getResourceModel = ResourceModelHelper.getResourceModel;
  /**
   * Interface for callbacks used in the functions
   *
   *
   * @author SAP SE
   * @since 1.54.0
   * @interface
   * @name sap.fe.core.actions.draft.ICallback
   * @private
   */

  /**
   * Callback to approve or reject the creation of a draft
   *
   * @name sap.fe.core.actions.draft.ICallback.beforeCreateDraftFromActiveDocument
   * @function
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
   * @returns {(boolean|Promise)} Approval of draft creation [true|false] or Promise that resolves with the boolean value
   * @private
   */

  /**
   * Callback after a draft was successully created
   *
   * @name sap.fe.core.actions.draft.ICallback.afterCreateDraftFromActiveDocument
   * @function
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the new draft
   * @param {sap.ui.model.odata.v4.Context} oActiveDocumentContext Context of the active document for the new draft
   * @returns {sap.ui.model.odata.v4.Context} oActiveDocumentContext
   * @private
   */

  /**
   * Callback to approve or reject overwriting an unsaved draft of another user
   *
   * @name sap.fe.core.actions.draft.ICallback.whenDecisionToOverwriteDocumentIsRequired
   * @function
   * @public
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
   * @returns {(boolean|Promise)} Approval to overwrite unsaved draft [true|false] or Promise that resolves with the boolean value
   * @ui5-restricted
   */
  /* Constants for draft operations */
  const draftOperations = {
    EDIT: "EditAction",
    ACTIVATION: "ActivationAction",
    DISCARD: "DiscardAction",
    PREPARE: "PreparationAction"
  };

  /**
   * Static functions for the draft programming model
   *
   * @namespace
   * @alias sap.fe.core.actions.draft
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.54.0
   */

  /**
   * Determines the action name for a draft operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation name
   * @returns The name of the draft operation
   */
  function getActionName(oContext, sOperation) {
    const oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/${sOperation}`);
  }
  /**
   * Creates an operation context binding for the given context and operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation (action or function import)
   * @param oOptions Options to create the operation context
   * @returns The context binding of the bound operation
   */
  function createOperation(oContext, sOperation, oOptions) {
    const sOperationName = getActionName(oContext, sOperation);
    return oContext.getModel().bindContext(`${sOperationName}(...)`, oContext, oOptions);
  }
  /**
   * Determines the return type for a draft operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation name
   * @returns The return type of the draft operation
   */
  function getReturnType(oContext, sOperation) {
    const oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject(`${sEntitySetPath}@com.sap.vocabularies.Common.v1.DraftRoot/${sOperation}/$ReturnType`);
  }
  /**
   * Check if optional draft prepare action exists.
   *
   * @param oContext The context that should be bound to the operation
   * @returns True if a a prepare action exists
   */
  function hasPrepareAction(oContext) {
    return !!getActionName(oContext, draftOperations.PREPARE);
  }
  /**
   * Creates a new draft from an active document.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param bPreserveChanges If true - existing changes from another user that are not locked are preserved and an error is sent from the backend, otherwise false - existing changes from another user that are not locked are overwritten</li>
   * @param oView If true - existing changes from another
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  async function executeDraftEditAction(oContext, bPreserveChanges, oView) {
    if (oContext.getProperty("IsActiveEntity")) {
      const oOptions = {
        $$inheritExpandSelect: true
      };
      const oOperation = createOperation(oContext, draftOperations.EDIT, oOptions);
      oOperation.setParameter("PreserveChanges", bPreserveChanges);
      const sGroupId = "direct";
      const resourceModel = getResourceModel(oView);
      const sActionName = resourceModel.getText("C_COMMON_OBJECT_PAGE_EDIT");
      //If the context is coming from a list binding we pass the flag true to replace the context by the active one
      const oEditPromise = oOperation.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
        label: sActionName,
        model: oContext.getModel()
      }, resourceModel, null, null, null, undefined, undefined), oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding"));
      oOperation.getModel().submitBatch(sGroupId);
      return await oEditPromise;
    } else {
      throw new Error("You cannot edit this draft document");
    }
  }

  /**
   * Executes the validation of the draft. The PrepareAction is triggered if the messages are annotated and entitySet gets a PreparationAction annotated.
   * If the operation succeeds and operation doesn't get a return type (RAP system) the messages are requested.
   *
   * @function
   * @param context Context for which the PrepareAction should be performed
   * @param appComponent The AppComponent
   * @param ignoreETag If set to true, ETags are ignored when executing the action
   * @returns Resolve function returns
   *  - the context of the operation if the action has been successfully executed
   *  - void if the action has failed
   *  - undefined if the action has not been triggered since the prerequisites are not met
   * @private
   * @ui5-restricted
   */
  async function executeDraftValidation(context, appComponent, ignoreETag) {
    if (draft.getMessagesPath(context) && draft.hasPrepareAction(context)) {
      try {
        if (!ignoreETag) {
          // We need to wait for the entity related to the context to post the action with the If-Match header
          // Some triggers (enter on table) can generate a promise in the cache so if we don't wait for the entity
          // the POST will be sent without If-Match and will generate an error on backend side.
          await context.getBinding().requestObject("");
        }
        const operation = await draft.executeDraftPreparationAction(context, context.getUpdateGroupId(), true, ignoreETag);
        // if there is no returned operation by executeDraftPreparationAction -> the action has failed
        if (operation && !getReturnType(context, draftOperations.PREPARE)) {
          requestMessages(context, appComponent.getSideEffectsService());
        }
        return operation;
      } catch (error) {
        Log.error("Error while requesting messages", error);
      }
    }
    return undefined;
  }

  /**
   * Activates a draft document. The draft will replace the sibling entity and will be deleted by the back end.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param oAppComponent The AppComponent
   * @param [sGroupId] The optional batch group in which the operation is to be executed
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  async function executeDraftActivationAction(oContext, oAppComponent, sGroupId) {
    const bHasPrepareAction = hasPrepareAction(oContext);

    // According to the draft spec if the service contains a prepare action and we trigger both prepare and
    // activate in one $batch the activate action is called with iF-Match=*
    const bIgnoreEtag = bHasPrepareAction;
    if (!oContext.getProperty("IsActiveEntity")) {
      const oOperation = createOperation(oContext, draftOperations.ACTIVATION, {
        $$inheritExpandSelect: true
      });
      const resourceModel = getResourceModel(oAppComponent);
      const sActionName = resourceModel.getText("C_OP_OBJECT_PAGE_SAVE");
      try {
        return await oOperation.execute(sGroupId, bIgnoreEtag, sGroupId ? operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
          label: sActionName,
          model: oContext.getModel()
        }, resourceModel, null, null, null, undefined, undefined) : undefined, oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding"));
      } catch (e) {
        if (bHasPrepareAction) {
          const actionName = getActionName(oContext, draftOperations.PREPARE),
            oSideEffectsService = oAppComponent.getSideEffectsService(),
            oBindingParameters = oSideEffectsService.getODataActionSideEffects(actionName, oContext),
            aTargetPaths = oBindingParameters && oBindingParameters.pathExpressions;
          if (aTargetPaths && aTargetPaths.length > 0) {
            try {
              await oSideEffectsService.requestSideEffects(aTargetPaths, oContext);
            } catch (oError) {
              Log.error("Error while requesting side effects", oError);
            }
          } else {
            try {
              await requestMessages(oContext, oSideEffectsService);
            } catch (oError) {
              Log.error("Error while requesting messages", oError);
            }
          }
        }
        throw e;
      }
    } else {
      throw new Error("The activation action cannot be executed on an active document");
    }
  }

  /**
   * Gets the supported message property path on the PrepareAction for a context.
   *
   * @function
   * @param oContext Context to be checked
   * @returns Path to the message
   * @private
   * @ui5-restricted
   */
  function getMessagePathForPrepare(oContext) {
    const oMetaModel = oContext.getModel().getMetaModel();
    const sContextPath = oMetaModel.getMetaPath(oContext.getPath());
    const oReturnType = getReturnType(oContext, draftOperations.PREPARE);
    // If there is no return parameter, it is not possible to request Messages.
    // RAP draft prepare has no return parameter
    return oReturnType ? oMetaModel.getObject(`${sContextPath}/@${"com.sap.vocabularies.Common.v1.Messages"}/$Path`) : null;
  }

  /**
   * Execute a preparation action.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param groupId The optional batch group in which we want to execute the operation
   * @param bMessages If set to true, the PREPARE action retrieves SAP_Messages
   * @param ignoreETag If set to true, ETag information is ignored when the action is executed
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  function executeDraftPreparationAction(oContext, groupId, bMessages, ignoreETag) {
    if (!oContext.getProperty("IsActiveEntity")) {
      const sMessagesPath = bMessages ? getMessagePathForPrepare(oContext) : null;
      const oOperation = createOperation(oContext, draftOperations.PREPARE, sMessagesPath ? {
        $select: sMessagesPath
      } : null);

      // TODO: side effects qualifier shall be even deprecated to be checked
      oOperation.setParameter("SideEffectsQualifier", "");
      const sGroupId = groupId || oOperation.getGroupId();
      return oOperation.execute(sGroupId, ignoreETag).then(function () {
        return oOperation;
      }).catch(function (oError) {
        Log.error("Error while executing the operation", oError);
      });
    } else {
      throw new Error("The preparation action cannot be executed on an active document");
    }
  }
  /**
   * Determines the message path for a context.
   *
   * @function
   * @param oContext Context for which the path shall be determined
   * @returns Message path, empty if not annotated
   * @private
   * @ui5-restricted
   */
  function getMessagesPath(oContext) {
    const oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
  }
  /**
   * Requests the messages if annotated for a given context.
   *
   * @function
   * @param oContext Context for which the messages shall be requested
   * @param oSideEffectsService Service for the SideEffects on SAP Fiori elements
   * @returns Promise which is resolved once messages were requested
   * @private
   * @ui5-restricted
   */
  function requestMessages(oContext, oSideEffectsService) {
    const sMessagesPath = draft.getMessagesPath(oContext);
    if (sMessagesPath) {
      return oSideEffectsService.requestSideEffects([sMessagesPath], oContext);
    }
    return Promise.resolve();
  }
  /**
   * Executes discard of a draft function using HTTP Post.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param oAppComponent App Component
   * @param bEnableStrictHandling
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  async function executeDraftDiscardAction(oContext, oAppComponent, bEnableStrictHandling) {
    if (!oContext.getProperty("IsActiveEntity")) {
      const oDiscardOperation = draft.createOperation(oContext, draftOperations.DISCARD);
      const resourceModel = oAppComponent && getResourceModel(oAppComponent);
      const sGroupId = "direct";
      const sActionName = (resourceModel === null || resourceModel === void 0 ? void 0 : resourceModel.getText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON")) || "";
      // as the discard action doesnt' send the active version in the response we do not use the replace in cache
      const oDiscardPromise = !bEnableStrictHandling ? oDiscardOperation.execute(sGroupId) : oDiscardOperation.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
        label: sActionName,
        model: oContext.getModel()
      }, resourceModel, null, null, null, undefined, undefined), false);
      oContext.getModel().submitBatch(sGroupId);
      return oDiscardPromise;
    } else {
      throw new Error("The discard action cannot be executed on an active document");
    }
  }

  /**
   * This method creates a sibling context for a subobject page and calculates a sibling path for all intermediate paths
   * between the object page and the subobject page.
   *
   * @param rootCurrentContext The context for the root of the draft
   * @param rightmostCurrentContext The context of the subobject page
   * @param rootContextInfo The context info of root of the draft
   * @returns The siblingInformation object
   */
  async function computeSiblingInformation(rootCurrentContext, rightmostCurrentContext, rootContextInfo) {
    if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
      // Wrong usage !!
      Log.error("Cannot compute rightmost sibling context");
      throw new Error("Cannot compute rightmost sibling context");
    }
    if (rightmostCurrentContext.getProperty("IsActiveEntity") === false && rightmostCurrentContext.getProperty("HasActiveEntity") === false) {
      // We already know the sibling for rightmostCurrentContext doesn't exist
      // --> No need to check canonical paths etc...
      return undefined;
    }
    const model = rootCurrentContext.getModel();
    try {
      // //////////////////////////////////////////////////////////////////
      // 1. Find all segments between the root object and the sub-object
      // Example: for root = /Param(aa)/Entity(bb) and rightMost = /Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)
      // ---> ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]

      // Find all segments in the rightmost path
      const additionalPath = rightmostCurrentContext.getPath().replace(rootCurrentContext.getPath(), "");
      const segments = additionalPath ? additionalPath.substring(1).split("/") : [];
      // First segment is always the full path of the root object, which can contain '/' in case of a parametrized entity
      segments.unshift(rootCurrentContext.getPath().substring(1));

      // //////////////////////////////////////////////////////////////////
      // 2. Request canonical paths of the sibling entity for each segment
      // Example: for ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]
      // --> request canonical paths for "Param(aa)/Entity(bb)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)/SiblingEntity"
      const oldPaths = [];
      const newPaths = [];
      let currentPath = "";

      // Computing sibling entity of root of the draft context is not required if the context is already in the sub-OP
      // Example: Edit in Sub-OP where new context is already available
      const paths = [...segments];
      if ((rootContextInfo === null || rootContextInfo === void 0 ? void 0 : rootContextInfo.rootContextNotRequired) === true) {
        var _rootCurrentContext$g;
        paths.shift();
        currentPath = "/" + (rootCurrentContext === null || rootCurrentContext === void 0 ? void 0 : (_rootCurrentContext$g = rootCurrentContext.getPath()) === null || _rootCurrentContext$g === void 0 ? void 0 : _rootCurrentContext$g.substring(1));
      }
      const canonicalPathPromises = paths.map(segment => {
        currentPath += `/${segment}`;
        oldPaths.unshift(currentPath);
        if (currentPath.endsWith(")")) {
          const siblingContext = model.bindContext(`${currentPath}/SiblingEntity`).getBoundContext();
          return siblingContext.requestCanonicalPath();
        } else {
          return Promise.resolve(undefined); // 1-1 relation
        }
      });

      // //////////////////////////////////////////////////////////////////
      // 3. Reconstruct the full paths from canonical paths (for path mapping)
      // Example: for canonical paths "/Param(aa)/Entity(bb-sibling)", "/Entity2(cc-sibling)", "/Entity3(dd-sibling)"
      // --> ["Param(aa)/Entity(bb-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)/_SubNav(dd-sibling)"]
      const canonicalPaths = await Promise.all(canonicalPathPromises);
      if ((rootContextInfo === null || rootContextInfo === void 0 ? void 0 : rootContextInfo.rootContextNotRequired) === true) {
        canonicalPaths.unshift(rootContextInfo === null || rootContextInfo === void 0 ? void 0 : rootContextInfo.rootSiblingPath);
        oldPaths.push(rootCurrentContext.getPath());
      }
      let siblingPath = "";
      canonicalPaths.forEach((canonicalPath, index) => {
        if (index !== 0) {
          if (segments[index].endsWith(")")) {
            const navigation = segments[index].replace(/\(.*$/, ""); // Keep only navigation name from the segment, i.e. aaa(xxx) --> aaa
            const keys = canonicalPath.replace(/.*\(/, "("); // Keep only the keys from the canonical path, i.e. aaa(xxx) --> (xxx)
            siblingPath += `/${navigation}${keys}`;
          } else {
            siblingPath += `/${segments[index]}`; // 1-1 relation
          }
        } else {
          siblingPath = canonicalPath; // To manage parametrized entities
        }

        newPaths.unshift(siblingPath);
      });
      return {
        targetContext: model.bindContext(siblingPath, undefined, {
          $$groupId: "$auto.Heroes"
        }).getBoundContext(),
        // Create the rightmost sibling context from its path
        pathMapping: oldPaths.map((oldPath, index) => {
          return {
            oldPath,
            newPath: newPaths[index]
          };
        })
      };
    } catch (error) {
      // A canonical path couldn't be resolved (because a sibling doesn't exist)
      return undefined;
    }
  }

  /**
   * Creates a draft document from an existing document.
   *
   * The function supports several hooks as there is a certain coreography defined.
   *
   * @function
   * @name sap.fe.core.actions.draft#createDraftFromActiveDocument
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the active document for the new draft
   * @param oAppComponent The AppComponent
   * @param mParameters The parameters
   * @param [mParameters.oView] The view
   * @param [mParameters.bPreserveChanges] Preserve changes of an existing draft of another user
   * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
   * @private
   * @ui5-restricted
   */
  async function createDraftFromActiveDocument(oContext, oAppComponent, mParameters) {
    const mParam = mParameters || {},
      bRunPreserveChangesFlow = typeof mParam.bPreserveChanges === "undefined" || typeof mParam.bPreserveChanges === "boolean" && mParam.bPreserveChanges; //default true

    /**
     * Overwrite the existing change.
     *
     * @returns Resolves with result of {@link sap.fe.core.actions#executeDraftEditAction}
     */
    async function overwriteChange() {
      //Overwrite existing changes
      const oModel = oContext.getModel();
      const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();
      const resourceModel = getResourceModel(mParameters.oView);
      const draftAdminData = await draftDataContext.requestObject();
      if (draftAdminData) {
        // remove all unbound transition messages as we show a special dialog
        messageHandling.removeUnboundTransitionMessages();
        let sInfo = draftAdminData.InProcessByUserDescription || draftAdminData.InProcessByUser;
        const sEntitySet = mParameters.oView.getViewData().entitySet;
        if (sInfo) {
          const sLockedByUserMsg = resourceModel.getText("C_DRAFT_OBJECT_PAGE_DRAFT_LOCKED_BY_USER", sInfo, sEntitySet);
          MessageBox.error(sLockedByUserMsg);
          throw new Error(sLockedByUserMsg);
        } else {
          sInfo = draftAdminData.CreatedByUserDescription || draftAdminData.CreatedByUser;
          const sUnsavedChangesMsg = resourceModel.getText("C_DRAFT_OBJECT_PAGE_DRAFT_UNSAVED_CHANGES", sInfo, sEntitySet);
          await draft.showEditConfirmationMessageBox(sUnsavedChangesMsg, oContext);
          return draft.executeDraftEditAction(oContext, false, mParameters.oView);
        }
      }
      throw new Error(`Draft creation aborted for document: ${oContext.getPath()}`);
    }
    if (!oContext) {
      throw new Error("Binding context to active document is required");
    }
    let oDraftContext;
    try {
      oDraftContext = await draft.executeDraftEditAction(oContext, bRunPreserveChangesFlow, mParameters.oView);
    } catch (oResponse) {
      if (oResponse.status === 409 || oResponse.status === 412 || oResponse.status === 423) {
        messageHandling.removeBoundTransitionMessages();
        messageHandling.removeUnboundTransitionMessages();
        const siblingInfo = await draft.computeSiblingInformation(oContext, oContext);
        if (siblingInfo !== null && siblingInfo !== void 0 && siblingInfo.targetContext) {
          //there is a context authorized to be edited by the current user
          await CommonUtils.waitForContextRequested(siblingInfo.targetContext);
          return siblingInfo.targetContext;
        } else {
          //there is no draft owned by the current user
          oDraftContext = await overwriteChange();
        }
      } else if (!(oResponse && oResponse.canceled)) {
        throw new Error(oResponse);
      }
    }
    if (oDraftContext) {
      var _oSideEffects$trigger;
      const sEditActionName = draft.getActionName(oDraftContext, draftOperations.EDIT);
      const oSideEffects = oAppComponent.getSideEffectsService().getODataActionSideEffects(sEditActionName, oDraftContext);
      if (oSideEffects !== null && oSideEffects !== void 0 && (_oSideEffects$trigger = oSideEffects.triggerActions) !== null && _oSideEffects$trigger !== void 0 && _oSideEffects$trigger.length) {
        await oAppComponent.getSideEffectsService().requestSideEffectsForODataAction(oSideEffects, oDraftContext);
        return oDraftContext;
      } else {
        return oDraftContext;
      }
    } else {
      return undefined;
    }
  }
  /**
   * Creates an active document from a draft document.
   *
   * The function supports several hooks as there is a certain choreography defined.
   *
   * @function
   * @name sap.fe.core.actions.draft#activateDocument
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the active document for the new draft
   * @param oAppComponent The AppComponent
   * @param mParameters The parameters
   * @param [mParameters.fnBeforeActivateDocument] Callback that allows a veto before the 'Create' request is executed
   * @param [mParameters.fnAfterActivateDocument] Callback for postprocessing after document was activated.
   * @param messageHandler The message handler
   * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
   * @private
   * @ui5-restricted
   */
  async function activateDocument(oContext, oAppComponent, mParameters, messageHandler) {
    const mParam = mParameters || {};
    if (!oContext) {
      throw new Error("Binding context to draft document is required");
    }
    const bExecute = mParam.fnBeforeActivateDocument ? await mParam.fnBeforeActivateDocument(oContext) : true;
    if (!bExecute) {
      throw new Error(`Activation of the document was aborted by extension for document: ${oContext.getPath()}`);
    }
    let oActiveDocumentContext;
    if (!hasPrepareAction(oContext)) {
      oActiveDocumentContext = await executeDraftActivationAction(oContext, oAppComponent);
    } else {
      /* activation requires preparation */
      const sBatchGroup = "draft";
      // we use the same batchGroup to force prepare and activate in a same batch but with different changeset
      let oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, false);
      oContext.getModel().submitBatch(sBatchGroup);
      const oActivatePromise = draft.executeDraftActivationAction(oContext, oAppComponent, sBatchGroup);
      try {
        const values = await Promise.all([oPreparePromise, oActivatePromise]);
        oActiveDocumentContext = values[1];
      } catch (err) {
        // BCP 2270084075
        // if the Activation fails, then the messages are retrieved from PREPARATION action
        const sMessagesPath = getMessagePathForPrepare(oContext);
        if (sMessagesPath) {
          oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, true);
          oContext.getModel().submitBatch(sBatchGroup);
          await oPreparePromise;
          const data = await oContext.requestObject();
          if (data[sMessagesPath].length > 0) {
            //if messages are available from the PREPARATION action, then previous transition messages are removed
            messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeTransitionMessages(false, false, oContext.getPath());
          }
        }
        throw err;
      }
    }
    return mParam.fnAfterActivateDocument ? mParam.fnAfterActivateDocument(oContext, oActiveDocumentContext) : oActiveDocumentContext;
  }

  /**
   * Display the confirmation dialog box after pressing the edit button of an object page with unsaved changes.
   *
   *
   * @function
   * @name sap.fe.core.actions.draft#showEditConfirmationMessageBox
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param sUnsavedChangesMsg Dialog box message informing the user that if he starts editing, the previous unsaved changes will be lost
   * @param oContext Context of the active document for the new draft
   * @returns Promise resolves
   * @private
   * @ui5-restricted
   */
  function showEditConfirmationMessageBox(sUnsavedChangesMsg, oContext) {
    const localI18nRef = Core.getLibraryResourceBundle("sap.fe.core");
    return new Promise(function (resolve, reject) {
      const oDialog = new Dialog({
        title: localI18nRef.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNING"),
        state: "Warning",
        content: new Text({
          text: sUnsavedChangesMsg
        }),
        beginButton: new Button({
          text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_EDIT"),
          type: "Emphasized",
          press: function () {
            oDialog.close();
            resolve(true);
          }
        }),
        endButton: new Button({
          text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_CANCEL"),
          press: function () {
            oDialog.close();
            reject(`Draft creation aborted for document: ${oContext.getPath()}`);
          }
        }),
        afterClose: function () {
          oDialog.destroy();
        }
      });
      oDialog.addStyleClass("sapUiContentPadding");
      oDialog.open();
    });
  }

  /**
   * HTTP POST call when DraftAction is present for Draft Delete; HTTP DELETE call when there is no DraftAction
   * and Active Instance always uses DELETE.
   *
   * @function
   * @name sap.fe.core.actions.draft#deleteDraft
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the document to be discarded
   * @param oAppComponent Context of the document to be discarded
   * @param bEnableStrictHandling
   * @private
   * @returns A Promise resolved when the context is deleted
   * @ui5-restricted
   */
  function deleteDraft(oContext, oAppComponent, bEnableStrictHandling) {
    const sDiscardAction = getActionName(oContext, draftOperations.DISCARD),
      bIsActiveEntity = oContext.getObject().IsActiveEntity;
    if (bIsActiveEntity || !bIsActiveEntity && !sDiscardAction) {
      //Use Delete in case of active entity and no discard action available for draft
      if (oContext.hasPendingChanges()) {
        return oContext.getBinding().resetChanges().then(function () {
          return oContext.delete();
        }).catch(function (error) {
          return Promise.reject(error);
        });
      } else {
        return oContext.delete();
      }
    } else {
      //Use Discard Post Action if it is a draft entity and discard action exists
      return executeDraftDiscardAction(oContext, oAppComponent, bEnableStrictHandling);
    }
  }
  const draft = {
    createDraftFromActiveDocument: createDraftFromActiveDocument,
    activateDocument: activateDocument,
    deleteDraft: deleteDraft,
    executeDraftEditAction: executeDraftEditAction,
    executeDraftValidation: executeDraftValidation,
    executeDraftPreparationAction: executeDraftPreparationAction,
    executeDraftActivationAction: executeDraftActivationAction,
    hasPrepareAction: hasPrepareAction,
    getMessagesPath: getMessagesPath,
    computeSiblingInformation: computeSiblingInformation,
    processDataLossOrDraftDiscardConfirmation: draftDataLossPopup.processDataLossOrDraftDiscardConfirmation,
    silentlyKeepDraftOnForwardNavigation: draftDataLossPopup.silentlyKeepDraftOnForwardNavigation,
    createOperation: createOperation,
    executeDraftDiscardAction: executeDraftDiscardAction,
    NavigationType: draftDataLossPopup.NavigationType,
    getActionName: getActionName,
    showEditConfirmationMessageBox: showEditConfirmationMessageBox
  };
  return draft;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJkcmFmdE9wZXJhdGlvbnMiLCJFRElUIiwiQUNUSVZBVElPTiIsIkRJU0NBUkQiLCJQUkVQQVJFIiwiZ2V0QWN0aW9uTmFtZSIsIm9Db250ZXh0Iiwic09wZXJhdGlvbiIsIm9Nb2RlbCIsImdldE1vZGVsIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInNFbnRpdHlTZXRQYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwiZ2V0T2JqZWN0IiwiY3JlYXRlT3BlcmF0aW9uIiwib09wdGlvbnMiLCJzT3BlcmF0aW9uTmFtZSIsImJpbmRDb250ZXh0IiwiZ2V0UmV0dXJuVHlwZSIsImhhc1ByZXBhcmVBY3Rpb24iLCJleGVjdXRlRHJhZnRFZGl0QWN0aW9uIiwiYlByZXNlcnZlQ2hhbmdlcyIsIm9WaWV3IiwiZ2V0UHJvcGVydHkiLCIkJGluaGVyaXRFeHBhbmRTZWxlY3QiLCJvT3BlcmF0aW9uIiwic2V0UGFyYW1ldGVyIiwic0dyb3VwSWQiLCJyZXNvdXJjZU1vZGVsIiwiZ2V0UmVzb3VyY2VNb2RlbCIsInNBY3Rpb25OYW1lIiwiZ2V0VGV4dCIsIm9FZGl0UHJvbWlzZSIsImV4ZWN1dGUiLCJ1bmRlZmluZWQiLCJvcGVyYXRpb25zSGVscGVyIiwiZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkIiwiYmluZCIsImRyYWZ0IiwibGFiZWwiLCJtb2RlbCIsImdldEJpbmRpbmciLCJpc0EiLCJzdWJtaXRCYXRjaCIsIkVycm9yIiwiZXhlY3V0ZURyYWZ0VmFsaWRhdGlvbiIsImNvbnRleHQiLCJhcHBDb21wb25lbnQiLCJpZ25vcmVFVGFnIiwiZ2V0TWVzc2FnZXNQYXRoIiwicmVxdWVzdE9iamVjdCIsIm9wZXJhdGlvbiIsImV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uIiwiZ2V0VXBkYXRlR3JvdXBJZCIsInJlcXVlc3RNZXNzYWdlcyIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsImVycm9yIiwiTG9nIiwiZXhlY3V0ZURyYWZ0QWN0aXZhdGlvbkFjdGlvbiIsIm9BcHBDb21wb25lbnQiLCJiSGFzUHJlcGFyZUFjdGlvbiIsImJJZ25vcmVFdGFnIiwiZSIsImFjdGlvbk5hbWUiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlIiwib0JpbmRpbmdQYXJhbWV0ZXJzIiwiZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyIsImFUYXJnZXRQYXRocyIsInBhdGhFeHByZXNzaW9ucyIsImxlbmd0aCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsIm9FcnJvciIsImdldE1lc3NhZ2VQYXRoRm9yUHJlcGFyZSIsInNDb250ZXh0UGF0aCIsIm9SZXR1cm5UeXBlIiwiZ3JvdXBJZCIsImJNZXNzYWdlcyIsInNNZXNzYWdlc1BhdGgiLCIkc2VsZWN0IiwiZ2V0R3JvdXBJZCIsInRoZW4iLCJjYXRjaCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZXhlY3V0ZURyYWZ0RGlzY2FyZEFjdGlvbiIsImJFbmFibGVTdHJpY3RIYW5kbGluZyIsIm9EaXNjYXJkT3BlcmF0aW9uIiwib0Rpc2NhcmRQcm9taXNlIiwiY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbiIsInJvb3RDdXJyZW50Q29udGV4dCIsInJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0Iiwicm9vdENvbnRleHRJbmZvIiwic3RhcnRzV2l0aCIsImFkZGl0aW9uYWxQYXRoIiwicmVwbGFjZSIsInNlZ21lbnRzIiwic3Vic3RyaW5nIiwic3BsaXQiLCJ1bnNoaWZ0Iiwib2xkUGF0aHMiLCJuZXdQYXRocyIsImN1cnJlbnRQYXRoIiwicGF0aHMiLCJyb290Q29udGV4dE5vdFJlcXVpcmVkIiwic2hpZnQiLCJjYW5vbmljYWxQYXRoUHJvbWlzZXMiLCJtYXAiLCJzZWdtZW50IiwiZW5kc1dpdGgiLCJzaWJsaW5nQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsInJlcXVlc3RDYW5vbmljYWxQYXRoIiwiY2Fub25pY2FsUGF0aHMiLCJhbGwiLCJyb290U2libGluZ1BhdGgiLCJwdXNoIiwic2libGluZ1BhdGgiLCJmb3JFYWNoIiwiY2Fub25pY2FsUGF0aCIsImluZGV4IiwibmF2aWdhdGlvbiIsImtleXMiLCJ0YXJnZXRDb250ZXh0IiwiJCRncm91cElkIiwicGF0aE1hcHBpbmciLCJvbGRQYXRoIiwibmV3UGF0aCIsImNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50IiwibVBhcmFtZXRlcnMiLCJtUGFyYW0iLCJiUnVuUHJlc2VydmVDaGFuZ2VzRmxvdyIsIm92ZXJ3cml0ZUNoYW5nZSIsImRyYWZ0RGF0YUNvbnRleHQiLCJkcmFmdEFkbWluRGF0YSIsIm1lc3NhZ2VIYW5kbGluZyIsInJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJzSW5mbyIsIkluUHJvY2Vzc0J5VXNlckRlc2NyaXB0aW9uIiwiSW5Qcm9jZXNzQnlVc2VyIiwic0VudGl0eVNldCIsImdldFZpZXdEYXRhIiwiZW50aXR5U2V0Iiwic0xvY2tlZEJ5VXNlck1zZyIsIk1lc3NhZ2VCb3giLCJDcmVhdGVkQnlVc2VyRGVzY3JpcHRpb24iLCJDcmVhdGVkQnlVc2VyIiwic1Vuc2F2ZWRDaGFuZ2VzTXNnIiwic2hvd0VkaXRDb25maXJtYXRpb25NZXNzYWdlQm94Iiwib0RyYWZ0Q29udGV4dCIsIm9SZXNwb25zZSIsInN0YXR1cyIsInJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwic2libGluZ0luZm8iLCJDb21tb25VdGlscyIsIndhaXRGb3JDb250ZXh0UmVxdWVzdGVkIiwiY2FuY2VsZWQiLCJzRWRpdEFjdGlvbk5hbWUiLCJvU2lkZUVmZmVjdHMiLCJ0cmlnZ2VyQWN0aW9ucyIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck9EYXRhQWN0aW9uIiwiYWN0aXZhdGVEb2N1bWVudCIsIm1lc3NhZ2VIYW5kbGVyIiwiYkV4ZWN1dGUiLCJmbkJlZm9yZUFjdGl2YXRlRG9jdW1lbnQiLCJvQWN0aXZlRG9jdW1lbnRDb250ZXh0Iiwic0JhdGNoR3JvdXAiLCJvUHJlcGFyZVByb21pc2UiLCJvQWN0aXZhdGVQcm9taXNlIiwidmFsdWVzIiwiZXJyIiwiZGF0YSIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsImZuQWZ0ZXJBY3RpdmF0ZURvY3VtZW50IiwibG9jYWxJMThuUmVmIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInJlamVjdCIsIm9EaWFsb2ciLCJEaWFsb2ciLCJ0aXRsZSIsInN0YXRlIiwiY29udGVudCIsIlRleHQiLCJ0ZXh0IiwiYmVnaW5CdXR0b24iLCJCdXR0b24iLCJ0eXBlIiwicHJlc3MiLCJjbG9zZSIsImVuZEJ1dHRvbiIsImFmdGVyQ2xvc2UiLCJkZXN0cm95IiwiYWRkU3R5bGVDbGFzcyIsIm9wZW4iLCJkZWxldGVEcmFmdCIsInNEaXNjYXJkQWN0aW9uIiwiYklzQWN0aXZlRW50aXR5IiwiSXNBY3RpdmVFbnRpdHkiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsInJlc2V0Q2hhbmdlcyIsImRlbGV0ZSIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiZHJhZnREYXRhTG9zc1BvcHVwIiwic2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uIiwiTmF2aWdhdGlvblR5cGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbImRyYWZ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9tZXNzYWdlSGFuZGxlci9tZXNzYWdlSGFuZGxpbmdcIjtcbmltcG9ydCB7IGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFNpZGVFZmZlY3RzU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhQ29udGV4dEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUNvbnRleHRCaW5kaW5nXCI7XG5pbXBvcnQgb3BlcmF0aW9uc0hlbHBlciBmcm9tIFwiLi4vLi4vb3BlcmF0aW9uc0hlbHBlclwiO1xuaW1wb3J0IHR5cGUgTWVzc2FnZUhhbmRsZXIgZnJvbSBcIi4uL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgZHJhZnREYXRhTG9zc1BvcHVwIGZyb20gXCIuL2RyYWZ0RGF0YUxvc3NQb3B1cFwiO1xuXG5leHBvcnQgdHlwZSBTaWJsaW5nSW5mb3JtYXRpb24gPSB7XG5cdHRhcmdldENvbnRleHQ6IENvbnRleHQ7XG5cdHBhdGhNYXBwaW5nOiB7IG9sZFBhdGg6IHN0cmluZzsgbmV3UGF0aDogc3RyaW5nIH1bXTtcbn07XG5cbmV4cG9ydCB0eXBlIFJvb3RDb250ZXh0SW5mbyA9IHtcblx0cm9vdENvbnRleHROb3RSZXF1aXJlZDogYm9vbGVhbjtcblx0cm9vdFNpYmxpbmdQYXRoOiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgY2FsbGJhY2tzIHVzZWQgaW4gdGhlIGZ1bmN0aW9uc1xuICpcbiAqXG4gKiBAYXV0aG9yIFNBUCBTRVxuICogQHNpbmNlIDEuNTQuMFxuICogQGludGVyZmFjZVxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdC5JQ2FsbGJhY2tcbiAqIEBwcml2YXRlXG4gKi9cblxuLyoqXG4gKiBDYWxsYmFjayB0byBhcHByb3ZlIG9yIHJlamVjdCB0aGUgY3JlYXRpb24gb2YgYSBkcmFmdFxuICpcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQuSUNhbGxiYWNrLmJlZm9yZUNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50XG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBhYnN0cmFjdFxuICogQHBhcmFtIHtzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcmV0dXJucyB7KGJvb2xlYW58UHJvbWlzZSl9IEFwcHJvdmFsIG9mIGRyYWZ0IGNyZWF0aW9uIFt0cnVlfGZhbHNlXSBvciBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgYm9vbGVhbiB2YWx1ZVxuICogQHByaXZhdGVcbiAqL1xuXG4vKipcbiAqIENhbGxiYWNrIGFmdGVyIGEgZHJhZnQgd2FzIHN1Y2Nlc3N1bGx5IGNyZWF0ZWRcbiAqXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0LklDYWxsYmFjay5hZnRlckNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50XG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBhYnN0cmFjdFxuICogQHBhcmFtIHtzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgbmV3IGRyYWZ0XG4gKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQWN0aXZlRG9jdW1lbnRDb250ZXh0IENvbnRleHQgb2YgdGhlIGFjdGl2ZSBkb2N1bWVudCBmb3IgdGhlIG5ldyBkcmFmdFxuICogQHJldHVybnMge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQWN0aXZlRG9jdW1lbnRDb250ZXh0XG4gKiBAcHJpdmF0ZVxuICovXG5cbi8qKlxuICogQ2FsbGJhY2sgdG8gYXBwcm92ZSBvciByZWplY3Qgb3ZlcndyaXRpbmcgYW4gdW5zYXZlZCBkcmFmdCBvZiBhbm90aGVyIHVzZXJcbiAqXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0LklDYWxsYmFjay53aGVuRGVjaXNpb25Ub092ZXJ3cml0ZURvY3VtZW50SXNSZXF1aXJlZFxuICogQGZ1bmN0aW9uXG4gKiBAcHVibGljXG4gKiBAc3RhdGljXG4gKiBAYWJzdHJhY3RcbiAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9IG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGFjdGl2ZSBkb2N1bWVudCBmb3IgdGhlIG5ldyBkcmFmdFxuICogQHJldHVybnMgeyhib29sZWFufFByb21pc2UpfSBBcHByb3ZhbCB0byBvdmVyd3JpdGUgdW5zYXZlZCBkcmFmdCBbdHJ1ZXxmYWxzZV0gb3IgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGJvb2xlYW4gdmFsdWVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG4vKiBDb25zdGFudHMgZm9yIGRyYWZ0IG9wZXJhdGlvbnMgKi9cbmNvbnN0IGRyYWZ0T3BlcmF0aW9ucyA9IHtcblx0RURJVDogXCJFZGl0QWN0aW9uXCIsXG5cdEFDVElWQVRJT046IFwiQWN0aXZhdGlvbkFjdGlvblwiLFxuXHRESVNDQVJEOiBcIkRpc2NhcmRBY3Rpb25cIixcblx0UFJFUEFSRTogXCJQcmVwYXJhdGlvbkFjdGlvblwiXG59O1xuXG4vKipcbiAqIFN0YXRpYyBmdW5jdGlvbnMgZm9yIHRoZSBkcmFmdCBwcm9ncmFtbWluZyBtb2RlbFxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0XG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbCBUaGlzIG1vZHVsZSBpcyBvbmx5IGZvciBleHBlcmltZW50YWwgdXNlISA8YnIvPjxiPlRoaXMgaXMgb25seSBhIFBPQyBhbmQgbWF5YmUgZGVsZXRlZDwvYj5cbiAqIEBzaW5jZSAxLjU0LjBcbiAqL1xuXG4vKipcbiAqIERldGVybWluZXMgdGhlIGFjdGlvbiBuYW1lIGZvciBhIGRyYWZ0IG9wZXJhdGlvbi5cbiAqXG4gKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgdGhhdCBzaG91bGQgYmUgYm91bmQgdG8gdGhlIG9wZXJhdGlvblxuICogQHBhcmFtIHNPcGVyYXRpb24gVGhlIG9wZXJhdGlvbiBuYW1lXG4gKiBAcmV0dXJucyBUaGUgbmFtZSBvZiB0aGUgZHJhZnQgb3BlcmF0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldEFjdGlvbk5hbWUob0NvbnRleHQ6IENvbnRleHQsIHNPcGVyYXRpb246IHN0cmluZykge1xuXHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0c0VudGl0eVNldFBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9Db250ZXh0LmdldFBhdGgoKSk7XG5cblx0cmV0dXJuIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290LyR7c09wZXJhdGlvbn1gKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhbiBvcGVyYXRpb24gY29udGV4dCBiaW5kaW5nIGZvciB0aGUgZ2l2ZW4gY29udGV4dCBhbmQgb3BlcmF0aW9uLlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IHNob3VsZCBiZSBib3VuZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcGFyYW0gc09wZXJhdGlvbiBUaGUgb3BlcmF0aW9uIChhY3Rpb24gb3IgZnVuY3Rpb24gaW1wb3J0KVxuICogQHBhcmFtIG9PcHRpb25zIE9wdGlvbnMgdG8gY3JlYXRlIHRoZSBvcGVyYXRpb24gY29udGV4dFxuICogQHJldHVybnMgVGhlIGNvbnRleHQgYmluZGluZyBvZiB0aGUgYm91bmQgb3BlcmF0aW9uXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZU9wZXJhdGlvbihvQ29udGV4dDogQ29udGV4dCwgc09wZXJhdGlvbjogc3RyaW5nLCBvT3B0aW9ucz86IGFueSkge1xuXHRjb25zdCBzT3BlcmF0aW9uTmFtZSA9IGdldEFjdGlvbk5hbWUob0NvbnRleHQsIHNPcGVyYXRpb24pO1xuXG5cdHJldHVybiBvQ29udGV4dC5nZXRNb2RlbCgpLmJpbmRDb250ZXh0KGAke3NPcGVyYXRpb25OYW1lfSguLi4pYCwgb0NvbnRleHQsIG9PcHRpb25zKTtcbn1cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgcmV0dXJuIHR5cGUgZm9yIGEgZHJhZnQgb3BlcmF0aW9uLlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IHNob3VsZCBiZSBib3VuZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcGFyYW0gc09wZXJhdGlvbiBUaGUgb3BlcmF0aW9uIG5hbWVcbiAqIEByZXR1cm5zIFRoZSByZXR1cm4gdHlwZSBvZiB0aGUgZHJhZnQgb3BlcmF0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldFJldHVyblR5cGUob0NvbnRleHQ6IENvbnRleHQsIHNPcGVyYXRpb246IHN0cmluZykge1xuXHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0c0VudGl0eVNldFBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9Db250ZXh0LmdldFBhdGgoKSk7XG5cblx0cmV0dXJuIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290LyR7c09wZXJhdGlvbn0vJFJldHVyblR5cGVgKTtcbn1cbi8qKlxuICogQ2hlY2sgaWYgb3B0aW9uYWwgZHJhZnQgcHJlcGFyZSBhY3Rpb24gZXhpc3RzLlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IHNob3VsZCBiZSBib3VuZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcmV0dXJucyBUcnVlIGlmIGEgYSBwcmVwYXJlIGFjdGlvbiBleGlzdHNcbiAqL1xuZnVuY3Rpb24gaGFzUHJlcGFyZUFjdGlvbihvQ29udGV4dDogQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gISFnZXRBY3Rpb25OYW1lKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuUFJFUEFSRSk7XG59XG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZHJhZnQgZnJvbSBhbiBhY3RpdmUgZG9jdW1lbnQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIGFjdGlvbiBzaG91bGQgYmUgcGVyZm9ybWVkXG4gKiBAcGFyYW0gYlByZXNlcnZlQ2hhbmdlcyBJZiB0cnVlIC0gZXhpc3RpbmcgY2hhbmdlcyBmcm9tIGFub3RoZXIgdXNlciB0aGF0IGFyZSBub3QgbG9ja2VkIGFyZSBwcmVzZXJ2ZWQgYW5kIGFuIGVycm9yIGlzIHNlbnQgZnJvbSB0aGUgYmFja2VuZCwgb3RoZXJ3aXNlIGZhbHNlIC0gZXhpc3RpbmcgY2hhbmdlcyBmcm9tIGFub3RoZXIgdXNlciB0aGF0IGFyZSBub3QgbG9ja2VkIGFyZSBvdmVyd3JpdHRlbjwvbGk+XG4gKiBAcGFyYW0gb1ZpZXcgSWYgdHJ1ZSAtIGV4aXN0aW5nIGNoYW5nZXMgZnJvbSBhbm90aGVyXG4gKiBAcmV0dXJucyBSZXNvbHZlIGZ1bmN0aW9uIHJldHVybnMgdGhlIGNvbnRleHQgb2YgdGhlIG9wZXJhdGlvblxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlRHJhZnRFZGl0QWN0aW9uKG9Db250ZXh0OiBDb250ZXh0LCBiUHJlc2VydmVDaGFuZ2VzOiBib29sZWFuLCBvVmlldzogYW55KTogUHJvbWlzZTxDb250ZXh0PiB7XG5cdGlmIChvQ29udGV4dC5nZXRQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpKSB7XG5cdFx0Y29uc3Qgb09wdGlvbnMgPSB7ICQkaW5oZXJpdEV4cGFuZFNlbGVjdDogdHJ1ZSB9O1xuXHRcdGNvbnN0IG9PcGVyYXRpb24gPSBjcmVhdGVPcGVyYXRpb24ob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5FRElULCBvT3B0aW9ucyk7XG5cdFx0b09wZXJhdGlvbi5zZXRQYXJhbWV0ZXIoXCJQcmVzZXJ2ZUNoYW5nZXNcIiwgYlByZXNlcnZlQ2hhbmdlcyk7XG5cdFx0Y29uc3Qgc0dyb3VwSWQgPSBcImRpcmVjdFwiO1xuXHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9WaWV3KTtcblx0XHRjb25zdCBzQWN0aW9uTmFtZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0VESVRcIik7XG5cdFx0Ly9JZiB0aGUgY29udGV4dCBpcyBjb21pbmcgZnJvbSBhIGxpc3QgYmluZGluZyB3ZSBwYXNzIHRoZSBmbGFnIHRydWUgdG8gcmVwbGFjZSB0aGUgY29udGV4dCBieSB0aGUgYWN0aXZlIG9uZVxuXHRcdGNvbnN0IG9FZGl0UHJvbWlzZSA9IG9PcGVyYXRpb24uZXhlY3V0ZShcblx0XHRcdHNHcm91cElkLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0KG9wZXJhdGlvbnNIZWxwZXIgYXMgYW55KS5mbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQuYmluZChcblx0XHRcdFx0ZHJhZnQsXG5cdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHR7IGxhYmVsOiBzQWN0aW9uTmFtZSwgbW9kZWw6IG9Db250ZXh0LmdldE1vZGVsKCkgfSxcblx0XHRcdFx0cmVzb3VyY2VNb2RlbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHR1bmRlZmluZWRcblx0XHRcdCksXG5cdFx0XHRvQ29udGV4dC5nZXRCaW5kaW5nKCkuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIilcblx0XHQpO1xuXHRcdG9PcGVyYXRpb24uZ2V0TW9kZWwoKS5zdWJtaXRCYXRjaChzR3JvdXBJZCk7XG5cdFx0cmV0dXJuIGF3YWl0IG9FZGl0UHJvbWlzZTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJZb3UgY2Fubm90IGVkaXQgdGhpcyBkcmFmdCBkb2N1bWVudFwiKTtcblx0fVxufVxuXG4vKipcbiAqIEV4ZWN1dGVzIHRoZSB2YWxpZGF0aW9uIG9mIHRoZSBkcmFmdC4gVGhlIFByZXBhcmVBY3Rpb24gaXMgdHJpZ2dlcmVkIGlmIHRoZSBtZXNzYWdlcyBhcmUgYW5ub3RhdGVkIGFuZCBlbnRpdHlTZXQgZ2V0cyBhIFByZXBhcmF0aW9uQWN0aW9uIGFubm90YXRlZC5cbiAqIElmIHRoZSBvcGVyYXRpb24gc3VjY2VlZHMgYW5kIG9wZXJhdGlvbiBkb2Vzbid0IGdldCBhIHJldHVybiB0eXBlIChSQVAgc3lzdGVtKSB0aGUgbWVzc2FnZXMgYXJlIHJlcXVlc3RlZC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBQcmVwYXJlQWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBhcHBDb21wb25lbnQgVGhlIEFwcENvbXBvbmVudFxuICogQHBhcmFtIGlnbm9yZUVUYWcgSWYgc2V0IHRvIHRydWUsIEVUYWdzIGFyZSBpZ25vcmVkIHdoZW4gZXhlY3V0aW5nIHRoZSBhY3Rpb25cbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJuc1xuICogIC0gdGhlIGNvbnRleHQgb2YgdGhlIG9wZXJhdGlvbiBpZiB0aGUgYWN0aW9uIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBleGVjdXRlZFxuICogIC0gdm9pZCBpZiB0aGUgYWN0aW9uIGhhcyBmYWlsZWRcbiAqICAtIHVuZGVmaW5lZCBpZiB0aGUgYWN0aW9uIGhhcyBub3QgYmVlbiB0cmlnZ2VyZWQgc2luY2UgdGhlIHByZXJlcXVpc2l0ZXMgYXJlIG5vdCBtZXRcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZURyYWZ0VmFsaWRhdGlvbihcblx0Y29udGV4dDogQ29udGV4dCxcblx0YXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdGlnbm9yZUVUYWc6IGJvb2xlYW5cbik6IFByb21pc2U8T0RhdGFDb250ZXh0QmluZGluZyB8IHZvaWQgfCB1bmRlZmluZWQ+IHtcblx0aWYgKGRyYWZ0LmdldE1lc3NhZ2VzUGF0aChjb250ZXh0KSAmJiBkcmFmdC5oYXNQcmVwYXJlQWN0aW9uKGNvbnRleHQpKSB7XG5cdFx0dHJ5IHtcblx0XHRcdGlmICghaWdub3JlRVRhZykge1xuXHRcdFx0XHQvLyBXZSBuZWVkIHRvIHdhaXQgZm9yIHRoZSBlbnRpdHkgcmVsYXRlZCB0byB0aGUgY29udGV4dCB0byBwb3N0IHRoZSBhY3Rpb24gd2l0aCB0aGUgSWYtTWF0Y2ggaGVhZGVyXG5cdFx0XHRcdC8vIFNvbWUgdHJpZ2dlcnMgKGVudGVyIG9uIHRhYmxlKSBjYW4gZ2VuZXJhdGUgYSBwcm9taXNlIGluIHRoZSBjYWNoZSBzbyBpZiB3ZSBkb24ndCB3YWl0IGZvciB0aGUgZW50aXR5XG5cdFx0XHRcdC8vIHRoZSBQT1NUIHdpbGwgYmUgc2VudCB3aXRob3V0IElmLU1hdGNoIGFuZCB3aWxsIGdlbmVyYXRlIGFuIGVycm9yIG9uIGJhY2tlbmQgc2lkZS5cblx0XHRcdFx0YXdhaXQgKGNvbnRleHQuZ2V0QmluZGluZygpIGFzIE9EYXRhQ29udGV4dEJpbmRpbmcpLnJlcXVlc3RPYmplY3QoXCJcIik7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBvcGVyYXRpb24gPSBhd2FpdCBkcmFmdC5leGVjdXRlRHJhZnRQcmVwYXJhdGlvbkFjdGlvbihjb250ZXh0LCBjb250ZXh0LmdldFVwZGF0ZUdyb3VwSWQoKSwgdHJ1ZSwgaWdub3JlRVRhZyk7XG5cdFx0XHQvLyBpZiB0aGVyZSBpcyBubyByZXR1cm5lZCBvcGVyYXRpb24gYnkgZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24gLT4gdGhlIGFjdGlvbiBoYXMgZmFpbGVkXG5cdFx0XHRpZiAob3BlcmF0aW9uICYmICFnZXRSZXR1cm5UeXBlKGNvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5QUkVQQVJFKSkge1xuXHRcdFx0XHRyZXF1ZXN0TWVzc2FnZXMoY29udGV4dCwgYXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvcGVyYXRpb247XG5cdFx0fSBjYXRjaCAoZXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVxdWVzdGluZyBtZXNzYWdlc1wiLCBlcnJvcik7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBBY3RpdmF0ZXMgYSBkcmFmdCBkb2N1bWVudC4gVGhlIGRyYWZ0IHdpbGwgcmVwbGFjZSB0aGUgc2libGluZyBlbnRpdHkgYW5kIHdpbGwgYmUgZGVsZXRlZCBieSB0aGUgYmFjayBlbmQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIGFjdGlvbiBzaG91bGQgYmUgcGVyZm9ybWVkXG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gW3NHcm91cElkXSBUaGUgb3B0aW9uYWwgYmF0Y2ggZ3JvdXAgaW4gd2hpY2ggdGhlIG9wZXJhdGlvbiBpcyB0byBiZSBleGVjdXRlZFxuICogQHJldHVybnMgUmVzb2x2ZSBmdW5jdGlvbiByZXR1cm5zIHRoZSBjb250ZXh0IG9mIHRoZSBvcGVyYXRpb25cbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZURyYWZ0QWN0aXZhdGlvbkFjdGlvbihvQ29udGV4dDogQ29udGV4dCwgb0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LCBzR3JvdXBJZD86IHN0cmluZyk6IFByb21pc2U8Q29udGV4dD4ge1xuXHRjb25zdCBiSGFzUHJlcGFyZUFjdGlvbiA9IGhhc1ByZXBhcmVBY3Rpb24ob0NvbnRleHQpO1xuXG5cdC8vIEFjY29yZGluZyB0byB0aGUgZHJhZnQgc3BlYyBpZiB0aGUgc2VydmljZSBjb250YWlucyBhIHByZXBhcmUgYWN0aW9uIGFuZCB3ZSB0cmlnZ2VyIGJvdGggcHJlcGFyZSBhbmRcblx0Ly8gYWN0aXZhdGUgaW4gb25lICRiYXRjaCB0aGUgYWN0aXZhdGUgYWN0aW9uIGlzIGNhbGxlZCB3aXRoIGlGLU1hdGNoPSpcblx0Y29uc3QgYklnbm9yZUV0YWcgPSBiSGFzUHJlcGFyZUFjdGlvbjtcblxuXHRpZiAoIW9Db250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikpIHtcblx0XHRjb25zdCBvT3BlcmF0aW9uID0gY3JlYXRlT3BlcmF0aW9uKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuQUNUSVZBVElPTiwgeyAkJGluaGVyaXRFeHBhbmRTZWxlY3Q6IHRydWUgfSk7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwob0FwcENvbXBvbmVudCk7XG5cdFx0Y29uc3Qgc0FjdGlvbk5hbWUgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX09QX09CSkVDVF9QQUdFX1NBVkVcIik7XG5cdFx0dHJ5IHtcblx0XHRcdHJldHVybiBhd2FpdCBvT3BlcmF0aW9uLmV4ZWN1dGUoXG5cdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRiSWdub3JlRXRhZyxcblx0XHRcdFx0c0dyb3VwSWRcblx0XHRcdFx0XHQ/IChvcGVyYXRpb25zSGVscGVyIGFzIGFueSkuZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkLmJpbmQoXG5cdFx0XHRcdFx0XHRcdGRyYWZ0LFxuXHRcdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0eyBsYWJlbDogc0FjdGlvbk5hbWUsIG1vZGVsOiBvQ29udGV4dC5nZXRNb2RlbCgpIH0sXG5cdFx0XHRcdFx0XHRcdHJlc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdFx0dW5kZWZpbmVkXG5cdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0XHRcdG9Db250ZXh0LmdldEJpbmRpbmcoKS5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKVxuXHRcdFx0KTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRpZiAoYkhhc1ByZXBhcmVBY3Rpb24pIHtcblx0XHRcdFx0Y29uc3QgYWN0aW9uTmFtZSA9IGdldEFjdGlvbk5hbWUob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5QUkVQQVJFKSxcblx0XHRcdFx0XHRvU2lkZUVmZmVjdHNTZXJ2aWNlID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKSxcblx0XHRcdFx0XHRvQmluZGluZ1BhcmFtZXRlcnMgPSBvU2lkZUVmZmVjdHNTZXJ2aWNlLmdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMoYWN0aW9uTmFtZSwgb0NvbnRleHQpLFxuXHRcdFx0XHRcdGFUYXJnZXRQYXRocyA9IG9CaW5kaW5nUGFyYW1ldGVycyAmJiBvQmluZGluZ1BhcmFtZXRlcnMucGF0aEV4cHJlc3Npb25zO1xuXHRcdFx0XHRpZiAoYVRhcmdldFBhdGhzICYmIGFUYXJnZXRQYXRocy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGF3YWl0IG9TaWRlRWZmZWN0c1NlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKGFUYXJnZXRQYXRocywgb0NvbnRleHQpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXF1ZXN0aW5nIHNpZGUgZWZmZWN0c1wiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0YXdhaXQgcmVxdWVzdE1lc3NhZ2VzKG9Db250ZXh0LCBvU2lkZUVmZmVjdHNTZXJ2aWNlKTtcblx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmVxdWVzdGluZyBtZXNzYWdlc1wiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhyb3cgZTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiVGhlIGFjdGl2YXRpb24gYWN0aW9uIGNhbm5vdCBiZSBleGVjdXRlZCBvbiBhbiBhY3RpdmUgZG9jdW1lbnRcIik7XG5cdH1cbn1cblxuLyoqXG4gKiBHZXRzIHRoZSBzdXBwb3J0ZWQgbWVzc2FnZSBwcm9wZXJ0eSBwYXRoIG9uIHRoZSBQcmVwYXJlQWN0aW9uIGZvciBhIGNvbnRleHQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCB0byBiZSBjaGVja2VkXG4gKiBAcmV0dXJucyBQYXRoIHRvIHRoZSBtZXNzYWdlXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VQYXRoRm9yUHJlcGFyZShvQ29udGV4dDogQ29udGV4dCk6IHN0cmluZyB8IG51bGwge1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRjb25zdCBvUmV0dXJuVHlwZSA9IGdldFJldHVyblR5cGUob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5QUkVQQVJFKTtcblx0Ly8gSWYgdGhlcmUgaXMgbm8gcmV0dXJuIHBhcmFtZXRlciwgaXQgaXMgbm90IHBvc3NpYmxlIHRvIHJlcXVlc3QgTWVzc2FnZXMuXG5cdC8vIFJBUCBkcmFmdCBwcmVwYXJlIGhhcyBubyByZXR1cm4gcGFyYW1ldGVyXG5cdHJldHVybiBvUmV0dXJuVHlwZSA/IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLk1lc3NhZ2VzfS8kUGF0aGApIDogbnVsbDtcbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgcHJlcGFyYXRpb24gYWN0aW9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBhY3Rpb24gc2hvdWxkIGJlIHBlcmZvcm1lZFxuICogQHBhcmFtIGdyb3VwSWQgVGhlIG9wdGlvbmFsIGJhdGNoIGdyb3VwIGluIHdoaWNoIHdlIHdhbnQgdG8gZXhlY3V0ZSB0aGUgb3BlcmF0aW9uXG4gKiBAcGFyYW0gYk1lc3NhZ2VzIElmIHNldCB0byB0cnVlLCB0aGUgUFJFUEFSRSBhY3Rpb24gcmV0cmlldmVzIFNBUF9NZXNzYWdlc1xuICogQHBhcmFtIGlnbm9yZUVUYWcgSWYgc2V0IHRvIHRydWUsIEVUYWcgaW5mb3JtYXRpb24gaXMgaWdub3JlZCB3aGVuIHRoZSBhY3Rpb24gaXMgZXhlY3V0ZWRcbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJucyB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uKG9Db250ZXh0OiBDb250ZXh0LCBncm91cElkPzogc3RyaW5nLCBiTWVzc2FnZXM/OiBib29sZWFuLCBpZ25vcmVFVGFnPzogYm9vbGVhbikge1xuXHRpZiAoIW9Db250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikpIHtcblx0XHRjb25zdCBzTWVzc2FnZXNQYXRoID0gYk1lc3NhZ2VzID8gZ2V0TWVzc2FnZVBhdGhGb3JQcmVwYXJlKG9Db250ZXh0KSA6IG51bGw7XG5cdFx0Y29uc3Qgb09wZXJhdGlvbiA9IGNyZWF0ZU9wZXJhdGlvbihvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLlBSRVBBUkUsIHNNZXNzYWdlc1BhdGggPyB7ICRzZWxlY3Q6IHNNZXNzYWdlc1BhdGggfSA6IG51bGwpO1xuXG5cdFx0Ly8gVE9ETzogc2lkZSBlZmZlY3RzIHF1YWxpZmllciBzaGFsbCBiZSBldmVuIGRlcHJlY2F0ZWQgdG8gYmUgY2hlY2tlZFxuXHRcdG9PcGVyYXRpb24uc2V0UGFyYW1ldGVyKFwiU2lkZUVmZmVjdHNRdWFsaWZpZXJcIiwgXCJcIik7XG5cblx0XHRjb25zdCBzR3JvdXBJZCA9IGdyb3VwSWQgfHwgb09wZXJhdGlvbi5nZXRHcm91cElkKCk7XG5cdFx0cmV0dXJuIG9PcGVyYXRpb25cblx0XHRcdC5leGVjdXRlKHNHcm91cElkLCBpZ25vcmVFVGFnKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gb09wZXJhdGlvbjtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGV4ZWN1dGluZyB0aGUgb3BlcmF0aW9uXCIsIG9FcnJvcik7XG5cdFx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGUgcHJlcGFyYXRpb24gYWN0aW9uIGNhbm5vdCBiZSBleGVjdXRlZCBvbiBhbiBhY3RpdmUgZG9jdW1lbnRcIik7XG5cdH1cbn1cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgbWVzc2FnZSBwYXRoIGZvciBhIGNvbnRleHQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIHBhdGggc2hhbGwgYmUgZGV0ZXJtaW5lZFxuICogQHJldHVybnMgTWVzc2FnZSBwYXRoLCBlbXB0eSBpZiBub3QgYW5ub3RhdGVkXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VzUGF0aChvQ29udGV4dDogQ29udGV4dCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRzRW50aXR5U2V0UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0cmV0dXJuIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzLyRQYXRoYCk7XG59XG4vKipcbiAqIFJlcXVlc3RzIHRoZSBtZXNzYWdlcyBpZiBhbm5vdGF0ZWQgZm9yIGEgZ2l2ZW4gY29udGV4dC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgbWVzc2FnZXMgc2hhbGwgYmUgcmVxdWVzdGVkXG4gKiBAcGFyYW0gb1NpZGVFZmZlY3RzU2VydmljZSBTZXJ2aWNlIGZvciB0aGUgU2lkZUVmZmVjdHMgb24gU0FQIEZpb3JpIGVsZW1lbnRzXG4gKiBAcmV0dXJucyBQcm9taXNlIHdoaWNoIGlzIHJlc29sdmVkIG9uY2UgbWVzc2FnZXMgd2VyZSByZXF1ZXN0ZWRcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gcmVxdWVzdE1lc3NhZ2VzKG9Db250ZXh0OiBDb250ZXh0LCBvU2lkZUVmZmVjdHNTZXJ2aWNlOiBTaWRlRWZmZWN0c1NlcnZpY2UpIHtcblx0Y29uc3Qgc01lc3NhZ2VzUGF0aCA9IGRyYWZ0LmdldE1lc3NhZ2VzUGF0aChvQ29udGV4dCk7XG5cdGlmIChzTWVzc2FnZXNQYXRoKSB7XG5cdFx0cmV0dXJuIG9TaWRlRWZmZWN0c1NlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKFtzTWVzc2FnZXNQYXRoXSwgb0NvbnRleHQpO1xuXHR9XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbn1cbi8qKlxuICogRXhlY3V0ZXMgZGlzY2FyZCBvZiBhIGRyYWZ0IGZ1bmN0aW9uIHVzaW5nIEhUVFAgUG9zdC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IEFwcCBDb21wb25lbnRcbiAqIEBwYXJhbSBiRW5hYmxlU3RyaWN0SGFuZGxpbmdcbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJucyB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVEcmFmdERpc2NhcmRBY3Rpb24ob0NvbnRleHQ6IENvbnRleHQsIG9BcHBDb21wb25lbnQ/OiBhbnksIGJFbmFibGVTdHJpY3RIYW5kbGluZz86IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0aWYgKCFvQ29udGV4dC5nZXRQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpKSB7XG5cdFx0Y29uc3Qgb0Rpc2NhcmRPcGVyYXRpb24gPSBkcmFmdC5jcmVhdGVPcGVyYXRpb24ob0NvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5ESVNDQVJEKTtcblx0XHRjb25zdCByZXNvdXJjZU1vZGVsID0gb0FwcENvbXBvbmVudCAmJiBnZXRSZXNvdXJjZU1vZGVsKG9BcHBDb21wb25lbnQpO1xuXHRcdGNvbnN0IHNHcm91cElkID0gXCJkaXJlY3RcIjtcblx0XHRjb25zdCBzQWN0aW9uTmFtZSA9IHJlc291cmNlTW9kZWw/LmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9EUkFGVF9ESVNDQVJEX0JVVFRPTlwiKSB8fCBcIlwiO1xuXHRcdC8vIGFzIHRoZSBkaXNjYXJkIGFjdGlvbiBkb2VzbnQnIHNlbmQgdGhlIGFjdGl2ZSB2ZXJzaW9uIGluIHRoZSByZXNwb25zZSB3ZSBkbyBub3QgdXNlIHRoZSByZXBsYWNlIGluIGNhY2hlXG5cdFx0Y29uc3Qgb0Rpc2NhcmRQcm9taXNlID0gIWJFbmFibGVTdHJpY3RIYW5kbGluZ1xuXHRcdFx0PyBvRGlzY2FyZE9wZXJhdGlvbi5leGVjdXRlKHNHcm91cElkKVxuXHRcdFx0OiBvRGlzY2FyZE9wZXJhdGlvbi5leGVjdXRlKFxuXHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHQob3BlcmF0aW9uc0hlbHBlciBhcyBhbnkpLmZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZC5iaW5kKFxuXHRcdFx0XHRcdFx0ZHJhZnQsXG5cdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdHsgbGFiZWw6IHNBY3Rpb25OYW1lLCBtb2RlbDogb0NvbnRleHQuZ2V0TW9kZWwoKSB9LFxuXHRcdFx0XHRcdFx0cmVzb3VyY2VNb2RlbCxcblx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdHVuZGVmaW5lZFxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0ZmFsc2Vcblx0XHRcdCAgKTtcblx0XHRvQ29udGV4dC5nZXRNb2RlbCgpLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0XHRyZXR1cm4gb0Rpc2NhcmRQcm9taXNlO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlRoZSBkaXNjYXJkIGFjdGlvbiBjYW5ub3QgYmUgZXhlY3V0ZWQgb24gYW4gYWN0aXZlIGRvY3VtZW50XCIpO1xuXHR9XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2QgY3JlYXRlcyBhIHNpYmxpbmcgY29udGV4dCBmb3IgYSBzdWJvYmplY3QgcGFnZSBhbmQgY2FsY3VsYXRlcyBhIHNpYmxpbmcgcGF0aCBmb3IgYWxsIGludGVybWVkaWF0ZSBwYXRoc1xuICogYmV0d2VlbiB0aGUgb2JqZWN0IHBhZ2UgYW5kIHRoZSBzdWJvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gcm9vdEN1cnJlbnRDb250ZXh0IFRoZSBjb250ZXh0IGZvciB0aGUgcm9vdCBvZiB0aGUgZHJhZnRcbiAqIEBwYXJhbSByaWdodG1vc3RDdXJyZW50Q29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgc3Vib2JqZWN0IHBhZ2VcbiAqIEBwYXJhbSByb290Q29udGV4dEluZm8gVGhlIGNvbnRleHQgaW5mbyBvZiByb290IG9mIHRoZSBkcmFmdFxuICogQHJldHVybnMgVGhlIHNpYmxpbmdJbmZvcm1hdGlvbiBvYmplY3RcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihcblx0cm9vdEN1cnJlbnRDb250ZXh0OiBDb250ZXh0LFxuXHRyaWdodG1vc3RDdXJyZW50Q29udGV4dDogQ29udGV4dCxcblx0cm9vdENvbnRleHRJbmZvPzogUm9vdENvbnRleHRJbmZvXG4pOiBQcm9taXNlPFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZD4ge1xuXHRpZiAoIXJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKS5zdGFydHNXaXRoKHJvb3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkpKSB7XG5cdFx0Ly8gV3JvbmcgdXNhZ2UgISFcblx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgY29tcHV0ZSByaWdodG1vc3Qgc2libGluZyBjb250ZXh0XCIpO1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjb21wdXRlIHJpZ2h0bW9zdCBzaWJsaW5nIGNvbnRleHRcIik7XG5cdH1cblxuXHRpZiAoXG5cdFx0cmlnaHRtb3N0Q3VycmVudENvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSA9PT0gZmFsc2UgJiZcblx0XHRyaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQcm9wZXJ0eShcIkhhc0FjdGl2ZUVudGl0eVwiKSA9PT0gZmFsc2Vcblx0KSB7XG5cdFx0Ly8gV2UgYWxyZWFkeSBrbm93IHRoZSBzaWJsaW5nIGZvciByaWdodG1vc3RDdXJyZW50Q29udGV4dCBkb2Vzbid0IGV4aXN0XG5cdFx0Ly8gLS0+IE5vIG5lZWQgdG8gY2hlY2sgY2Fub25pY2FsIHBhdGhzIGV0Yy4uLlxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRjb25zdCBtb2RlbCA9IHJvb3RDdXJyZW50Q29udGV4dC5nZXRNb2RlbCgpO1xuXHR0cnkge1xuXHRcdC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIDEuIEZpbmQgYWxsIHNlZ21lbnRzIGJldHdlZW4gdGhlIHJvb3Qgb2JqZWN0IGFuZCB0aGUgc3ViLW9iamVjdFxuXHRcdC8vIEV4YW1wbGU6IGZvciByb290ID0gL1BhcmFtKGFhKS9FbnRpdHkoYmIpIGFuZCByaWdodE1vc3QgPSAvUGFyYW0oYWEpL0VudGl0eShiYikvX05hdihjYykvX1N1Yk5hdihkZClcblx0XHQvLyAtLS0+IFtcIlBhcmFtKGFhKS9FbnRpdHkoYmIpXCIsIFwiX05hdihjYylcIiwgXCJfU3ViTmF2KGRkKVwiXVxuXG5cdFx0Ly8gRmluZCBhbGwgc2VnbWVudHMgaW4gdGhlIHJpZ2h0bW9zdCBwYXRoXG5cdFx0Y29uc3QgYWRkaXRpb25hbFBhdGggPSByaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkucmVwbGFjZShyb290Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpLCBcIlwiKTtcblx0XHRjb25zdCBzZWdtZW50cyA9IGFkZGl0aW9uYWxQYXRoID8gYWRkaXRpb25hbFBhdGguc3Vic3RyaW5nKDEpLnNwbGl0KFwiL1wiKSA6IFtdO1xuXHRcdC8vIEZpcnN0IHNlZ21lbnQgaXMgYWx3YXlzIHRoZSBmdWxsIHBhdGggb2YgdGhlIHJvb3Qgb2JqZWN0LCB3aGljaCBjYW4gY29udGFpbiAnLycgaW4gY2FzZSBvZiBhIHBhcmFtZXRyaXplZCBlbnRpdHlcblx0XHRzZWdtZW50cy51bnNoaWZ0KHJvb3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkuc3Vic3RyaW5nKDEpKTtcblxuXHRcdC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIDIuIFJlcXVlc3QgY2Fub25pY2FsIHBhdGhzIG9mIHRoZSBzaWJsaW5nIGVudGl0eSBmb3IgZWFjaCBzZWdtZW50XG5cdFx0Ly8gRXhhbXBsZTogZm9yIFtcIlBhcmFtKGFhKS9FbnRpdHkoYmIpXCIsIFwiX05hdihjYylcIiwgXCJfU3ViTmF2KGRkKVwiXVxuXHRcdC8vIC0tPiByZXF1ZXN0IGNhbm9uaWNhbCBwYXRocyBmb3IgXCJQYXJhbShhYSkvRW50aXR5KGJiKS9TaWJsaW5nRW50aXR5XCIsIFwiUGFyYW0oYWEpL0VudGl0eShiYikvX05hdihjYykvU2libGluZ0VudGl0eVwiLCBcIlBhcmFtKGFhKS9FbnRpdHkoYmIpL19OYXYoY2MpL19TdWJOYXYoZGQpL1NpYmxpbmdFbnRpdHlcIlxuXHRcdGNvbnN0IG9sZFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGNvbnN0IG5ld1BhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGxldCBjdXJyZW50UGF0aCA9IFwiXCI7XG5cblx0XHQvLyBDb21wdXRpbmcgc2libGluZyBlbnRpdHkgb2Ygcm9vdCBvZiB0aGUgZHJhZnQgY29udGV4dCBpcyBub3QgcmVxdWlyZWQgaWYgdGhlIGNvbnRleHQgaXMgYWxyZWFkeSBpbiB0aGUgc3ViLU9QXG5cdFx0Ly8gRXhhbXBsZTogRWRpdCBpbiBTdWItT1Agd2hlcmUgbmV3IGNvbnRleHQgaXMgYWxyZWFkeSBhdmFpbGFibGVcblx0XHRjb25zdCBwYXRocyA9IFsuLi5zZWdtZW50c107XG5cdFx0aWYgKHJvb3RDb250ZXh0SW5mbz8ucm9vdENvbnRleHROb3RSZXF1aXJlZCA9PT0gdHJ1ZSkge1xuXHRcdFx0cGF0aHMuc2hpZnQoKTtcblx0XHRcdGN1cnJlbnRQYXRoID0gXCIvXCIgKyByb290Q3VycmVudENvbnRleHQ/LmdldFBhdGgoKT8uc3Vic3RyaW5nKDEpO1xuXHRcdH1cblx0XHRjb25zdCBjYW5vbmljYWxQYXRoUHJvbWlzZXMgPSBwYXRocy5tYXAoKHNlZ21lbnQpID0+IHtcblx0XHRcdGN1cnJlbnRQYXRoICs9IGAvJHtzZWdtZW50fWA7XG5cdFx0XHRvbGRQYXRocy51bnNoaWZ0KGN1cnJlbnRQYXRoKTtcblx0XHRcdGlmIChjdXJyZW50UGF0aC5lbmRzV2l0aChcIilcIikpIHtcblx0XHRcdFx0Y29uc3Qgc2libGluZ0NvbnRleHQgPSBtb2RlbC5iaW5kQ29udGV4dChgJHtjdXJyZW50UGF0aH0vU2libGluZ0VudGl0eWApLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHRyZXR1cm4gc2libGluZ0NvbnRleHQucmVxdWVzdENhbm9uaWNhbFBhdGgoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTsgLy8gMS0xIHJlbGF0aW9uXG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0XHQvLyAzLiBSZWNvbnN0cnVjdCB0aGUgZnVsbCBwYXRocyBmcm9tIGNhbm9uaWNhbCBwYXRocyAoZm9yIHBhdGggbWFwcGluZylcblx0XHQvLyBFeGFtcGxlOiBmb3IgY2Fub25pY2FsIHBhdGhzIFwiL1BhcmFtKGFhKS9FbnRpdHkoYmItc2libGluZylcIiwgXCIvRW50aXR5MihjYy1zaWJsaW5nKVwiLCBcIi9FbnRpdHkzKGRkLXNpYmxpbmcpXCJcblx0XHQvLyAtLT4gW1wiUGFyYW0oYWEpL0VudGl0eShiYi1zaWJsaW5nKVwiLCBcIlBhcmFtKGFhKS9FbnRpdHkoYmItc2libGluZykvX05hdihjYy1zaWJsaW5nKVwiLCBcIlBhcmFtKGFhKS9FbnRpdHkoYmItc2libGluZykvX05hdihjYy1zaWJsaW5nKS9fU3ViTmF2KGRkLXNpYmxpbmcpXCJdXG5cdFx0Y29uc3QgY2Fub25pY2FsUGF0aHMgPSAoYXdhaXQgUHJvbWlzZS5hbGwoY2Fub25pY2FsUGF0aFByb21pc2VzKSkgYXMgc3RyaW5nW107XG5cblx0XHRpZiAocm9vdENvbnRleHRJbmZvPy5yb290Q29udGV4dE5vdFJlcXVpcmVkID09PSB0cnVlKSB7XG5cdFx0XHRjYW5vbmljYWxQYXRocy51bnNoaWZ0KHJvb3RDb250ZXh0SW5mbz8ucm9vdFNpYmxpbmdQYXRoKTtcblx0XHRcdG9sZFBhdGhzLnB1c2gocm9vdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0fVxuXHRcdGxldCBzaWJsaW5nUGF0aCA9IFwiXCI7XG5cdFx0Y2Fub25pY2FsUGF0aHMuZm9yRWFjaCgoY2Fub25pY2FsUGF0aCwgaW5kZXgpID0+IHtcblx0XHRcdGlmIChpbmRleCAhPT0gMCkge1xuXHRcdFx0XHRpZiAoc2VnbWVudHNbaW5kZXhdLmVuZHNXaXRoKFwiKVwiKSkge1xuXHRcdFx0XHRcdGNvbnN0IG5hdmlnYXRpb24gPSBzZWdtZW50c1tpbmRleF0ucmVwbGFjZSgvXFwoLiokLywgXCJcIik7IC8vIEtlZXAgb25seSBuYXZpZ2F0aW9uIG5hbWUgZnJvbSB0aGUgc2VnbWVudCwgaS5lLiBhYWEoeHh4KSAtLT4gYWFhXG5cdFx0XHRcdFx0Y29uc3Qga2V5cyA9IGNhbm9uaWNhbFBhdGgucmVwbGFjZSgvLipcXCgvLCBcIihcIik7IC8vIEtlZXAgb25seSB0aGUga2V5cyBmcm9tIHRoZSBjYW5vbmljYWwgcGF0aCwgaS5lLiBhYWEoeHh4KSAtLT4gKHh4eClcblx0XHRcdFx0XHRzaWJsaW5nUGF0aCArPSBgLyR7bmF2aWdhdGlvbn0ke2tleXN9YDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzaWJsaW5nUGF0aCArPSBgLyR7c2VnbWVudHNbaW5kZXhdfWA7IC8vIDEtMSByZWxhdGlvblxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzaWJsaW5nUGF0aCA9IGNhbm9uaWNhbFBhdGg7IC8vIFRvIG1hbmFnZSBwYXJhbWV0cml6ZWQgZW50aXRpZXNcblx0XHRcdH1cblx0XHRcdG5ld1BhdGhzLnVuc2hpZnQoc2libGluZ1BhdGgpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRhcmdldENvbnRleHQ6IG1vZGVsLmJpbmRDb250ZXh0KHNpYmxpbmdQYXRoLCB1bmRlZmluZWQsIHsgJCRncm91cElkOiBcIiRhdXRvLkhlcm9lc1wiIH0pLmdldEJvdW5kQ29udGV4dCgpLCAvLyBDcmVhdGUgdGhlIHJpZ2h0bW9zdCBzaWJsaW5nIGNvbnRleHQgZnJvbSBpdHMgcGF0aFxuXHRcdFx0cGF0aE1hcHBpbmc6IG9sZFBhdGhzLm1hcCgob2xkUGF0aCwgaW5kZXgpID0+IHtcblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRvbGRQYXRoLFxuXHRcdFx0XHRcdG5ld1BhdGg6IG5ld1BhdGhzW2luZGV4XVxuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHR9O1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdC8vIEEgY2Fub25pY2FsIHBhdGggY291bGRuJ3QgYmUgcmVzb2x2ZWQgKGJlY2F1c2UgYSBzaWJsaW5nIGRvZXNuJ3QgZXhpc3QpXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBkcmFmdCBkb2N1bWVudCBmcm9tIGFuIGV4aXN0aW5nIGRvY3VtZW50LlxuICpcbiAqIFRoZSBmdW5jdGlvbiBzdXBwb3J0cyBzZXZlcmFsIGhvb2tzIGFzIHRoZXJlIGlzIGEgY2VydGFpbiBjb3Jlb2dyYXBoeSBkZWZpbmVkLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdCNjcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudFxuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnRcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBhY3RpdmUgZG9jdW1lbnQgZm9yIHRoZSBuZXcgZHJhZnRcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IFRoZSBBcHBDb21wb25lbnRcbiAqIEBwYXJhbSBtUGFyYW1ldGVycyBUaGUgcGFyYW1ldGVyc1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5vVmlld10gVGhlIHZpZXdcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYlByZXNlcnZlQ2hhbmdlc10gUHJlc2VydmUgY2hhbmdlcyBvZiBhbiBleGlzdGluZyBkcmFmdCBvZiBhbm90aGVyIHVzZXJcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCB0aGUge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0IGNvbnRleHR9IG9mIHRoZSBuZXcgZHJhZnQgZG9jdW1lbnRcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gY3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnQoXG5cdG9Db250ZXh0OiBhbnksXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IHtcblx0XHRvVmlldzogVmlldztcblx0XHRiUHJlc2VydmVDaGFuZ2VzPzogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblx0fVxuKTogUHJvbWlzZTxDb250ZXh0IHwgdW5kZWZpbmVkPiB7XG5cdGNvbnN0IG1QYXJhbSA9IG1QYXJhbWV0ZXJzIHx8IHt9LFxuXHRcdGJSdW5QcmVzZXJ2ZUNoYW5nZXNGbG93ID1cblx0XHRcdHR5cGVvZiBtUGFyYW0uYlByZXNlcnZlQ2hhbmdlcyA9PT0gXCJ1bmRlZmluZWRcIiB8fCAodHlwZW9mIG1QYXJhbS5iUHJlc2VydmVDaGFuZ2VzID09PSBcImJvb2xlYW5cIiAmJiBtUGFyYW0uYlByZXNlcnZlQ2hhbmdlcyk7IC8vZGVmYXVsdCB0cnVlXG5cblx0LyoqXG5cdCAqIE92ZXJ3cml0ZSB0aGUgZXhpc3RpbmcgY2hhbmdlLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBSZXNvbHZlcyB3aXRoIHJlc3VsdCBvZiB7QGxpbmsgc2FwLmZlLmNvcmUuYWN0aW9ucyNleGVjdXRlRHJhZnRFZGl0QWN0aW9ufVxuXHQgKi9cblx0YXN5bmMgZnVuY3Rpb24gb3ZlcndyaXRlQ2hhbmdlKCkge1xuXHRcdC8vT3ZlcndyaXRlIGV4aXN0aW5nIGNoYW5nZXNcblx0XHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGNvbnN0IGRyYWZ0RGF0YUNvbnRleHQgPSBvTW9kZWwuYmluZENvbnRleHQoYCR7b0NvbnRleHQuZ2V0UGF0aCgpfS9EcmFmdEFkbWluaXN0cmF0aXZlRGF0YWApLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG1QYXJhbWV0ZXJzLm9WaWV3KTtcblx0XHRjb25zdCBkcmFmdEFkbWluRGF0YSA9IGF3YWl0IGRyYWZ0RGF0YUNvbnRleHQucmVxdWVzdE9iamVjdCgpO1xuXHRcdGlmIChkcmFmdEFkbWluRGF0YSkge1xuXHRcdFx0Ly8gcmVtb3ZlIGFsbCB1bmJvdW5kIHRyYW5zaXRpb24gbWVzc2FnZXMgYXMgd2Ugc2hvdyBhIHNwZWNpYWwgZGlhbG9nXG5cdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0bGV0IHNJbmZvID0gZHJhZnRBZG1pbkRhdGEuSW5Qcm9jZXNzQnlVc2VyRGVzY3JpcHRpb24gfHwgZHJhZnRBZG1pbkRhdGEuSW5Qcm9jZXNzQnlVc2VyO1xuXHRcdFx0Y29uc3Qgc0VudGl0eVNldCA9IChtUGFyYW1ldGVycy5vVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkuZW50aXR5U2V0O1xuXHRcdFx0aWYgKHNJbmZvKSB7XG5cdFx0XHRcdGNvbnN0IHNMb2NrZWRCeVVzZXJNc2cgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX0RSQUZUX09CSkVDVF9QQUdFX0RSQUZUX0xPQ0tFRF9CWV9VU0VSXCIsIHNJbmZvLCBzRW50aXR5U2V0KTtcblx0XHRcdFx0TWVzc2FnZUJveC5lcnJvcihzTG9ja2VkQnlVc2VyTXNnKTtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHNMb2NrZWRCeVVzZXJNc2cpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c0luZm8gPSBkcmFmdEFkbWluRGF0YS5DcmVhdGVkQnlVc2VyRGVzY3JpcHRpb24gfHwgZHJhZnRBZG1pbkRhdGEuQ3JlYXRlZEJ5VXNlcjtcblx0XHRcdFx0Y29uc3Qgc1Vuc2F2ZWRDaGFuZ2VzTXNnID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19EUkFGVF9PQkpFQ1RfUEFHRV9EUkFGVF9VTlNBVkVEX0NIQU5HRVNcIiwgc0luZm8sIHNFbnRpdHlTZXQpO1xuXHRcdFx0XHRhd2FpdCBkcmFmdC5zaG93RWRpdENvbmZpcm1hdGlvbk1lc3NhZ2VCb3goc1Vuc2F2ZWRDaGFuZ2VzTXNnLCBvQ29udGV4dCk7XG5cdFx0XHRcdHJldHVybiBkcmFmdC5leGVjdXRlRHJhZnRFZGl0QWN0aW9uKG9Db250ZXh0LCBmYWxzZSwgbVBhcmFtZXRlcnMub1ZpZXcpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0aHJvdyBuZXcgRXJyb3IoYERyYWZ0IGNyZWF0aW9uIGFib3J0ZWQgZm9yIGRvY3VtZW50OiAke29Db250ZXh0LmdldFBhdGgoKX1gKTtcblx0fVxuXG5cdGlmICghb0NvbnRleHQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIGNvbnRleHQgdG8gYWN0aXZlIGRvY3VtZW50IGlzIHJlcXVpcmVkXCIpO1xuXHR9XG5cdGxldCBvRHJhZnRDb250ZXh0OiBDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHR0cnkge1xuXHRcdG9EcmFmdENvbnRleHQgPSBhd2FpdCBkcmFmdC5leGVjdXRlRHJhZnRFZGl0QWN0aW9uKG9Db250ZXh0LCBiUnVuUHJlc2VydmVDaGFuZ2VzRmxvdywgbVBhcmFtZXRlcnMub1ZpZXcpO1xuXHR9IGNhdGNoIChvUmVzcG9uc2U6IGFueSkge1xuXHRcdGlmIChvUmVzcG9uc2Uuc3RhdHVzID09PSA0MDkgfHwgb1Jlc3BvbnNlLnN0YXR1cyA9PT0gNDEyIHx8IG9SZXNwb25zZS5zdGF0dXMgPT09IDQyMykge1xuXHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0Y29uc3Qgc2libGluZ0luZm8gPSBhd2FpdCBkcmFmdC5jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKG9Db250ZXh0LCBvQ29udGV4dCk7XG5cdFx0XHRpZiAoc2libGluZ0luZm8/LnRhcmdldENvbnRleHQpIHtcblx0XHRcdFx0Ly90aGVyZSBpcyBhIGNvbnRleHQgYXV0aG9yaXplZCB0byBiZSBlZGl0ZWQgYnkgdGhlIGN1cnJlbnQgdXNlclxuXHRcdFx0XHRhd2FpdCBDb21tb25VdGlscy53YWl0Rm9yQ29udGV4dFJlcXVlc3RlZChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0KTtcblx0XHRcdFx0cmV0dXJuIHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL3RoZXJlIGlzIG5vIGRyYWZ0IG93bmVkIGJ5IHRoZSBjdXJyZW50IHVzZXJcblx0XHRcdFx0b0RyYWZ0Q29udGV4dCA9IGF3YWl0IG92ZXJ3cml0ZUNoYW5nZSgpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoIShvUmVzcG9uc2UgJiYgb1Jlc3BvbnNlLmNhbmNlbGVkKSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKG9SZXNwb25zZSk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKG9EcmFmdENvbnRleHQpIHtcblx0XHRjb25zdCBzRWRpdEFjdGlvbk5hbWUgPSBkcmFmdC5nZXRBY3Rpb25OYW1lKG9EcmFmdENvbnRleHQsIGRyYWZ0T3BlcmF0aW9ucy5FRElUKTtcblx0XHRjb25zdCBvU2lkZUVmZmVjdHMgPSBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpLmdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMoc0VkaXRBY3Rpb25OYW1lLCBvRHJhZnRDb250ZXh0KTtcblx0XHRpZiAob1NpZGVFZmZlY3RzPy50cmlnZ2VyQWN0aW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRhd2FpdCBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpLnJlcXVlc3RTaWRlRWZmZWN0c0Zvck9EYXRhQWN0aW9uKG9TaWRlRWZmZWN0cywgb0RyYWZ0Q29udGV4dCk7XG5cdFx0XHRyZXR1cm4gb0RyYWZ0Q29udGV4dDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG9EcmFmdENvbnRleHQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn1cbi8qKlxuICogQ3JlYXRlcyBhbiBhY3RpdmUgZG9jdW1lbnQgZnJvbSBhIGRyYWZ0IGRvY3VtZW50LlxuICpcbiAqIFRoZSBmdW5jdGlvbiBzdXBwb3J0cyBzZXZlcmFsIGhvb2tzIGFzIHRoZXJlIGlzIGEgY2VydGFpbiBjaG9yZW9ncmFwaHkgZGVmaW5lZC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQjYWN0aXZhdGVEb2N1bWVudFxuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnRcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBhY3RpdmUgZG9jdW1lbnQgZm9yIHRoZSBuZXcgZHJhZnRcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IFRoZSBBcHBDb21wb25lbnRcbiAqIEBwYXJhbSBtUGFyYW1ldGVycyBUaGUgcGFyYW1ldGVyc1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5mbkJlZm9yZUFjdGl2YXRlRG9jdW1lbnRdIENhbGxiYWNrIHRoYXQgYWxsb3dzIGEgdmV0byBiZWZvcmUgdGhlICdDcmVhdGUnIHJlcXVlc3QgaXMgZXhlY3V0ZWRcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZm5BZnRlckFjdGl2YXRlRG9jdW1lbnRdIENhbGxiYWNrIGZvciBwb3N0cHJvY2Vzc2luZyBhZnRlciBkb2N1bWVudCB3YXMgYWN0aXZhdGVkLlxuICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXJcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCB0aGUge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0IGNvbnRleHR9IG9mIHRoZSBuZXcgZHJhZnQgZG9jdW1lbnRcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gYWN0aXZhdGVEb2N1bWVudChcblx0b0NvbnRleHQ6IENvbnRleHQsXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IHsgZm5CZWZvcmVBY3RpdmF0ZURvY3VtZW50PzogYW55OyBmbkFmdGVyQWN0aXZhdGVEb2N1bWVudD86IGFueSB9LFxuXHRtZXNzYWdlSGFuZGxlcj86IE1lc3NhZ2VIYW5kbGVyXG4pIHtcblx0Y29uc3QgbVBhcmFtID0gbVBhcmFtZXRlcnMgfHwge307XG5cdGlmICghb0NvbnRleHQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIGNvbnRleHQgdG8gZHJhZnQgZG9jdW1lbnQgaXMgcmVxdWlyZWRcIik7XG5cdH1cblxuXHRjb25zdCBiRXhlY3V0ZSA9IG1QYXJhbS5mbkJlZm9yZUFjdGl2YXRlRG9jdW1lbnQgPyBhd2FpdCBtUGFyYW0uZm5CZWZvcmVBY3RpdmF0ZURvY3VtZW50KG9Db250ZXh0KSA6IHRydWU7XG5cdGlmICghYkV4ZWN1dGUpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYEFjdGl2YXRpb24gb2YgdGhlIGRvY3VtZW50IHdhcyBhYm9ydGVkIGJ5IGV4dGVuc2lvbiBmb3IgZG9jdW1lbnQ6ICR7b0NvbnRleHQuZ2V0UGF0aCgpfWApO1xuXHR9XG5cblx0bGV0IG9BY3RpdmVEb2N1bWVudENvbnRleHQ6IGFueTtcblx0aWYgKCFoYXNQcmVwYXJlQWN0aW9uKG9Db250ZXh0KSkge1xuXHRcdG9BY3RpdmVEb2N1bWVudENvbnRleHQgPSBhd2FpdCBleGVjdXRlRHJhZnRBY3RpdmF0aW9uQWN0aW9uKG9Db250ZXh0LCBvQXBwQ29tcG9uZW50KTtcblx0fSBlbHNlIHtcblx0XHQvKiBhY3RpdmF0aW9uIHJlcXVpcmVzIHByZXBhcmF0aW9uICovXG5cdFx0Y29uc3Qgc0JhdGNoR3JvdXAgPSBcImRyYWZ0XCI7XG5cdFx0Ly8gd2UgdXNlIHRoZSBzYW1lIGJhdGNoR3JvdXAgdG8gZm9yY2UgcHJlcGFyZSBhbmQgYWN0aXZhdGUgaW4gYSBzYW1lIGJhdGNoIGJ1dCB3aXRoIGRpZmZlcmVudCBjaGFuZ2VzZXRcblx0XHRsZXQgb1ByZXBhcmVQcm9taXNlID0gZHJhZnQuZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24ob0NvbnRleHQsIHNCYXRjaEdyb3VwLCBmYWxzZSk7XG5cdFx0b0NvbnRleHQuZ2V0TW9kZWwoKS5zdWJtaXRCYXRjaChzQmF0Y2hHcm91cCk7XG5cdFx0Y29uc3Qgb0FjdGl2YXRlUHJvbWlzZSA9IGRyYWZ0LmV4ZWN1dGVEcmFmdEFjdGl2YXRpb25BY3Rpb24ob0NvbnRleHQsIG9BcHBDb21wb25lbnQsIHNCYXRjaEdyb3VwKTtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgdmFsdWVzID0gYXdhaXQgUHJvbWlzZS5hbGwoW29QcmVwYXJlUHJvbWlzZSwgb0FjdGl2YXRlUHJvbWlzZV0pO1xuXHRcdFx0b0FjdGl2ZURvY3VtZW50Q29udGV4dCA9IHZhbHVlc1sxXTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdC8vIEJDUCAyMjcwMDg0MDc1XG5cdFx0XHQvLyBpZiB0aGUgQWN0aXZhdGlvbiBmYWlscywgdGhlbiB0aGUgbWVzc2FnZXMgYXJlIHJldHJpZXZlZCBmcm9tIFBSRVBBUkFUSU9OIGFjdGlvblxuXHRcdFx0Y29uc3Qgc01lc3NhZ2VzUGF0aCA9IGdldE1lc3NhZ2VQYXRoRm9yUHJlcGFyZShvQ29udGV4dCk7XG5cdFx0XHRpZiAoc01lc3NhZ2VzUGF0aCkge1xuXHRcdFx0XHRvUHJlcGFyZVByb21pc2UgPSBkcmFmdC5leGVjdXRlRHJhZnRQcmVwYXJhdGlvbkFjdGlvbihvQ29udGV4dCwgc0JhdGNoR3JvdXAsIHRydWUpO1xuXHRcdFx0XHRvQ29udGV4dC5nZXRNb2RlbCgpLnN1Ym1pdEJhdGNoKHNCYXRjaEdyb3VwKTtcblx0XHRcdFx0YXdhaXQgb1ByZXBhcmVQcm9taXNlO1xuXHRcdFx0XHRjb25zdCBkYXRhID0gYXdhaXQgb0NvbnRleHQucmVxdWVzdE9iamVjdCgpO1xuXHRcdFx0XHRpZiAoZGF0YVtzTWVzc2FnZXNQYXRoXS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0Ly9pZiBtZXNzYWdlcyBhcmUgYXZhaWxhYmxlIGZyb20gdGhlIFBSRVBBUkFUSU9OIGFjdGlvbiwgdGhlbiBwcmV2aW91cyB0cmFuc2l0aW9uIG1lc3NhZ2VzIGFyZSByZW1vdmVkXG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXI/LnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyhmYWxzZSwgZmFsc2UsIG9Db250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRocm93IGVycjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG1QYXJhbS5mbkFmdGVyQWN0aXZhdGVEb2N1bWVudCA/IG1QYXJhbS5mbkFmdGVyQWN0aXZhdGVEb2N1bWVudChvQ29udGV4dCwgb0FjdGl2ZURvY3VtZW50Q29udGV4dCkgOiBvQWN0aXZlRG9jdW1lbnRDb250ZXh0O1xufVxuXG4vKipcbiAqIERpc3BsYXkgdGhlIGNvbmZpcm1hdGlvbiBkaWFsb2cgYm94IGFmdGVyIHByZXNzaW5nIHRoZSBlZGl0IGJ1dHRvbiBvZiBhbiBvYmplY3QgcGFnZSB3aXRoIHVuc2F2ZWQgY2hhbmdlcy5cbiAqXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0I3Nob3dFZGl0Q29uZmlybWF0aW9uTWVzc2FnZUJveFxuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnRcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSBzVW5zYXZlZENoYW5nZXNNc2cgRGlhbG9nIGJveCBtZXNzYWdlIGluZm9ybWluZyB0aGUgdXNlciB0aGF0IGlmIGhlIHN0YXJ0cyBlZGl0aW5nLCB0aGUgcHJldmlvdXMgdW5zYXZlZCBjaGFuZ2VzIHdpbGwgYmUgbG9zdFxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGFjdGl2ZSBkb2N1bWVudCBmb3IgdGhlIG5ldyBkcmFmdFxuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlc1xuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBzaG93RWRpdENvbmZpcm1hdGlvbk1lc3NhZ2VCb3goc1Vuc2F2ZWRDaGFuZ2VzTXNnOiBzdHJpbmcsIG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdGNvbnN0IGxvY2FsSTE4blJlZiA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkge1xuXHRcdGNvbnN0IG9EaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdHRpdGxlOiBsb2NhbEkxOG5SZWYuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX1dBUk5JTkdcIiksXG5cdFx0XHRzdGF0ZTogXCJXYXJuaW5nXCIsXG5cdFx0XHRjb250ZW50OiBuZXcgVGV4dCh7XG5cdFx0XHRcdHRleHQ6IHNVbnNhdmVkQ2hhbmdlc01zZ1xuXHRcdFx0fSksXG5cdFx0XHRiZWdpbkJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdHRleHQ6IGxvY2FsSTE4blJlZi5nZXRUZXh0KFwiQ19DT01NT05fT0JKRUNUX1BBR0VfRURJVFwiKSxcblx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdHJlc29sdmUodHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pLFxuXHRcdFx0ZW5kQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0dGV4dDogbG9jYWxJMThuUmVmLmdldFRleHQoXCJDX0NPTU1PTl9PQkpFQ1RfUEFHRV9DQU5DRUxcIiksXG5cdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdHJlamVjdChgRHJhZnQgY3JlYXRpb24gYWJvcnRlZCBmb3IgZG9jdW1lbnQ6ICR7b0NvbnRleHQuZ2V0UGF0aCgpfWApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSxcblx0XHRcdGFmdGVyQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0b0RpYWxvZy5hZGRTdHlsZUNsYXNzKFwic2FwVWlDb250ZW50UGFkZGluZ1wiKTtcblx0XHRvRGlhbG9nLm9wZW4oKTtcblx0fSk7XG59XG5cbi8qKlxuICogSFRUUCBQT1NUIGNhbGwgd2hlbiBEcmFmdEFjdGlvbiBpcyBwcmVzZW50IGZvciBEcmFmdCBEZWxldGU7IEhUVFAgREVMRVRFIGNhbGwgd2hlbiB0aGVyZSBpcyBubyBEcmFmdEFjdGlvblxuICogYW5kIEFjdGl2ZSBJbnN0YW5jZSBhbHdheXMgdXNlcyBERUxFVEUuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0I2RlbGV0ZURyYWZ0XG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdFxuICogQHN0YXRpY1xuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGRvY3VtZW50IHRvIGJlIGRpc2NhcmRlZFxuICogQHBhcmFtIG9BcHBDb21wb25lbnQgQ29udGV4dCBvZiB0aGUgZG9jdW1lbnQgdG8gYmUgZGlzY2FyZGVkXG4gKiBAcGFyYW0gYkVuYWJsZVN0cmljdEhhbmRsaW5nXG4gKiBAcHJpdmF0ZVxuICogQHJldHVybnMgQSBQcm9taXNlIHJlc29sdmVkIHdoZW4gdGhlIGNvbnRleHQgaXMgZGVsZXRlZFxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZURyYWZ0KG9Db250ZXh0OiBDb250ZXh0LCBvQXBwQ29tcG9uZW50PzogQXBwQ29tcG9uZW50LCBiRW5hYmxlU3RyaWN0SGFuZGxpbmc/OiBib29sZWFuKTogUHJvbWlzZTxib29sZWFuPiB7XG5cdGNvbnN0IHNEaXNjYXJkQWN0aW9uID0gZ2V0QWN0aW9uTmFtZShvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLkRJU0NBUkQpLFxuXHRcdGJJc0FjdGl2ZUVudGl0eSA9IG9Db250ZXh0LmdldE9iamVjdCgpLklzQWN0aXZlRW50aXR5O1xuXG5cdGlmIChiSXNBY3RpdmVFbnRpdHkgfHwgKCFiSXNBY3RpdmVFbnRpdHkgJiYgIXNEaXNjYXJkQWN0aW9uKSkge1xuXHRcdC8vVXNlIERlbGV0ZSBpbiBjYXNlIG9mIGFjdGl2ZSBlbnRpdHkgYW5kIG5vIGRpc2NhcmQgYWN0aW9uIGF2YWlsYWJsZSBmb3IgZHJhZnRcblx0XHRpZiAob0NvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0cmV0dXJuIG9Db250ZXh0XG5cdFx0XHRcdC5nZXRCaW5kaW5nKClcblx0XHRcdFx0LnJlc2V0Q2hhbmdlcygpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0NvbnRleHQuZGVsZXRlKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG5cdFx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gb0NvbnRleHQuZGVsZXRlKCk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdC8vVXNlIERpc2NhcmQgUG9zdCBBY3Rpb24gaWYgaXQgaXMgYSBkcmFmdCBlbnRpdHkgYW5kIGRpc2NhcmQgYWN0aW9uIGV4aXN0c1xuXHRcdHJldHVybiBleGVjdXRlRHJhZnREaXNjYXJkQWN0aW9uKG9Db250ZXh0LCBvQXBwQ29tcG9uZW50LCBiRW5hYmxlU3RyaWN0SGFuZGxpbmcpO1xuXHR9XG59XG5cbmNvbnN0IGRyYWZ0ID0ge1xuXHRjcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudDogY3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnQsXG5cdGFjdGl2YXRlRG9jdW1lbnQ6IGFjdGl2YXRlRG9jdW1lbnQsXG5cdGRlbGV0ZURyYWZ0OiBkZWxldGVEcmFmdCxcblx0ZXhlY3V0ZURyYWZ0RWRpdEFjdGlvbjogZXhlY3V0ZURyYWZ0RWRpdEFjdGlvbixcblx0ZXhlY3V0ZURyYWZ0VmFsaWRhdGlvbjogZXhlY3V0ZURyYWZ0VmFsaWRhdGlvbixcblx0ZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb246IGV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uLFxuXHRleGVjdXRlRHJhZnRBY3RpdmF0aW9uQWN0aW9uOiBleGVjdXRlRHJhZnRBY3RpdmF0aW9uQWN0aW9uLFxuXHRoYXNQcmVwYXJlQWN0aW9uOiBoYXNQcmVwYXJlQWN0aW9uLFxuXHRnZXRNZXNzYWdlc1BhdGg6IGdldE1lc3NhZ2VzUGF0aCxcblx0Y29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbjogY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbixcblx0cHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb246IGRyYWZ0RGF0YUxvc3NQb3B1cC5wcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbixcblx0c2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uOiBkcmFmdERhdGFMb3NzUG9wdXAuc2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uLFxuXHRjcmVhdGVPcGVyYXRpb246IGNyZWF0ZU9wZXJhdGlvbixcblx0ZXhlY3V0ZURyYWZ0RGlzY2FyZEFjdGlvbjogZXhlY3V0ZURyYWZ0RGlzY2FyZEFjdGlvbixcblx0TmF2aWdhdGlvblR5cGU6IGRyYWZ0RGF0YUxvc3NQb3B1cC5OYXZpZ2F0aW9uVHlwZSxcblx0Z2V0QWN0aW9uTmFtZTogZ2V0QWN0aW9uTmFtZSxcblx0c2hvd0VkaXRDb25maXJtYXRpb25NZXNzYWdlQm94OiBzaG93RWRpdENvbmZpcm1hdGlvbk1lc3NhZ2VCb3hcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRyYWZ0O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQTZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQTtFQUNBLE1BQU1BLGVBQWUsR0FBRztJQUN2QkMsSUFBSSxFQUFFLFlBQVk7SUFDbEJDLFVBQVUsRUFBRSxrQkFBa0I7SUFDOUJDLE9BQU8sRUFBRSxlQUFlO0lBQ3hCQyxPQUFPLEVBQUU7RUFDVixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLGFBQWEsQ0FBQ0MsUUFBaUIsRUFBRUMsVUFBa0IsRUFBRTtJQUM3RCxNQUFNQyxNQUFNLEdBQUdGLFFBQVEsQ0FBQ0csUUFBUSxFQUFFO01BQ2pDQyxVQUFVLEdBQUdGLE1BQU0sQ0FBQ0csWUFBWSxFQUFFO01BQ2xDQyxjQUFjLEdBQUdGLFVBQVUsQ0FBQ0csV0FBVyxDQUFDUCxRQUFRLENBQUNRLE9BQU8sRUFBRSxDQUFDO0lBRTVELE9BQU9KLFVBQVUsQ0FBQ0ssU0FBUyxDQUFFLEdBQUVILGNBQWUsNkNBQTRDTCxVQUFXLEVBQUMsQ0FBQztFQUN4RztFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTUyxlQUFlLENBQUNWLFFBQWlCLEVBQUVDLFVBQWtCLEVBQUVVLFFBQWMsRUFBRTtJQUMvRSxNQUFNQyxjQUFjLEdBQUdiLGFBQWEsQ0FBQ0MsUUFBUSxFQUFFQyxVQUFVLENBQUM7SUFFMUQsT0FBT0QsUUFBUSxDQUFDRyxRQUFRLEVBQUUsQ0FBQ1UsV0FBVyxDQUFFLEdBQUVELGNBQWUsT0FBTSxFQUFFWixRQUFRLEVBQUVXLFFBQVEsQ0FBQztFQUNyRjtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0csYUFBYSxDQUFDZCxRQUFpQixFQUFFQyxVQUFrQixFQUFFO0lBQzdELE1BQU1DLE1BQU0sR0FBR0YsUUFBUSxDQUFDRyxRQUFRLEVBQUU7TUFDakNDLFVBQVUsR0FBR0YsTUFBTSxDQUFDRyxZQUFZLEVBQUU7TUFDbENDLGNBQWMsR0FBR0YsVUFBVSxDQUFDRyxXQUFXLENBQUNQLFFBQVEsQ0FBQ1EsT0FBTyxFQUFFLENBQUM7SUFFNUQsT0FBT0osVUFBVSxDQUFDSyxTQUFTLENBQUUsR0FBRUgsY0FBZSw2Q0FBNENMLFVBQVcsY0FBYSxDQUFDO0VBQ3BIO0VBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU2MsZ0JBQWdCLENBQUNmLFFBQWlCLEVBQVc7SUFDckQsT0FBTyxDQUFDLENBQUNELGFBQWEsQ0FBQ0MsUUFBUSxFQUFFTixlQUFlLENBQUNJLE9BQU8sQ0FBQztFQUMxRDtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxlQUFla0Isc0JBQXNCLENBQUNoQixRQUFpQixFQUFFaUIsZ0JBQXlCLEVBQUVDLEtBQVUsRUFBb0I7SUFDakgsSUFBSWxCLFFBQVEsQ0FBQ21CLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO01BQzNDLE1BQU1SLFFBQVEsR0FBRztRQUFFUyxxQkFBcUIsRUFBRTtNQUFLLENBQUM7TUFDaEQsTUFBTUMsVUFBVSxHQUFHWCxlQUFlLENBQUNWLFFBQVEsRUFBRU4sZUFBZSxDQUFDQyxJQUFJLEVBQUVnQixRQUFRLENBQUM7TUFDNUVVLFVBQVUsQ0FBQ0MsWUFBWSxDQUFDLGlCQUFpQixFQUFFTCxnQkFBZ0IsQ0FBQztNQUM1RCxNQUFNTSxRQUFRLEdBQUcsUUFBUTtNQUN6QixNQUFNQyxhQUFhLEdBQUdDLGdCQUFnQixDQUFDUCxLQUFLLENBQUM7TUFDN0MsTUFBTVEsV0FBVyxHQUFHRixhQUFhLENBQUNHLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQztNQUN0RTtNQUNBLE1BQU1DLFlBQVksR0FBR1AsVUFBVSxDQUFDUSxPQUFPLENBQ3RDTixRQUFRLEVBQ1JPLFNBQVMsRUFDUkMsZ0JBQWdCLENBQVNDLHdCQUF3QixDQUFDQyxJQUFJLENBQ3REQyxLQUFLLEVBQ0xYLFFBQVEsRUFDUjtRQUFFWSxLQUFLLEVBQUVULFdBQVc7UUFBRVUsS0FBSyxFQUFFcEMsUUFBUSxDQUFDRyxRQUFRO01BQUcsQ0FBQyxFQUNsRHFCLGFBQWEsRUFDYixJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSk0sU0FBUyxFQUNUQSxTQUFTLENBQ1QsRUFDRDlCLFFBQVEsQ0FBQ3FDLFVBQVUsRUFBRSxDQUFDQyxHQUFHLENBQUMsd0NBQXdDLENBQUMsQ0FDbkU7TUFDRGpCLFVBQVUsQ0FBQ2xCLFFBQVEsRUFBRSxDQUFDb0MsV0FBVyxDQUFDaEIsUUFBUSxDQUFDO01BQzNDLE9BQU8sTUFBTUssWUFBWTtJQUMxQixDQUFDLE1BQU07TUFDTixNQUFNLElBQUlZLEtBQUssQ0FBQyxxQ0FBcUMsQ0FBQztJQUN2RDtFQUNEOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLGVBQWVDLHNCQUFzQixDQUNwQ0MsT0FBZ0IsRUFDaEJDLFlBQTBCLEVBQzFCQyxVQUFtQixFQUMrQjtJQUNsRCxJQUFJVixLQUFLLENBQUNXLGVBQWUsQ0FBQ0gsT0FBTyxDQUFDLElBQUlSLEtBQUssQ0FBQ25CLGdCQUFnQixDQUFDMkIsT0FBTyxDQUFDLEVBQUU7TUFDdEUsSUFBSTtRQUNILElBQUksQ0FBQ0UsVUFBVSxFQUFFO1VBQ2hCO1VBQ0E7VUFDQTtVQUNBLE1BQU9GLE9BQU8sQ0FBQ0wsVUFBVSxFQUFFLENBQXlCUyxhQUFhLENBQUMsRUFBRSxDQUFDO1FBQ3RFO1FBQ0EsTUFBTUMsU0FBUyxHQUFHLE1BQU1iLEtBQUssQ0FBQ2MsNkJBQTZCLENBQUNOLE9BQU8sRUFBRUEsT0FBTyxDQUFDTyxnQkFBZ0IsRUFBRSxFQUFFLElBQUksRUFBRUwsVUFBVSxDQUFDO1FBQ2xIO1FBQ0EsSUFBSUcsU0FBUyxJQUFJLENBQUNqQyxhQUFhLENBQUM0QixPQUFPLEVBQUVoRCxlQUFlLENBQUNJLE9BQU8sQ0FBQyxFQUFFO1VBQ2xFb0QsZUFBZSxDQUFDUixPQUFPLEVBQUVDLFlBQVksQ0FBQ1EscUJBQXFCLEVBQUUsQ0FBQztRQUMvRDtRQUNBLE9BQU9KLFNBQVM7TUFDakIsQ0FBQyxDQUFDLE9BQU9LLEtBQVUsRUFBRTtRQUNwQkMsR0FBRyxDQUFDRCxLQUFLLENBQUMsaUNBQWlDLEVBQUVBLEtBQUssQ0FBQztNQUNwRDtJQUNEO0lBRUEsT0FBT3RCLFNBQVM7RUFDakI7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLGVBQWV3Qiw0QkFBNEIsQ0FBQ3RELFFBQWlCLEVBQUV1RCxhQUEyQixFQUFFaEMsUUFBaUIsRUFBb0I7SUFDaEksTUFBTWlDLGlCQUFpQixHQUFHekMsZ0JBQWdCLENBQUNmLFFBQVEsQ0FBQzs7SUFFcEQ7SUFDQTtJQUNBLE1BQU15RCxXQUFXLEdBQUdELGlCQUFpQjtJQUVyQyxJQUFJLENBQUN4RCxRQUFRLENBQUNtQixXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtNQUM1QyxNQUFNRSxVQUFVLEdBQUdYLGVBQWUsQ0FBQ1YsUUFBUSxFQUFFTixlQUFlLENBQUNFLFVBQVUsRUFBRTtRQUFFd0IscUJBQXFCLEVBQUU7TUFBSyxDQUFDLENBQUM7TUFDekcsTUFBTUksYUFBYSxHQUFHQyxnQkFBZ0IsQ0FBQzhCLGFBQWEsQ0FBQztNQUNyRCxNQUFNN0IsV0FBVyxHQUFHRixhQUFhLENBQUNHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQztNQUNsRSxJQUFJO1FBQ0gsT0FBTyxNQUFNTixVQUFVLENBQUNRLE9BQU8sQ0FDOUJOLFFBQVEsRUFDUmtDLFdBQVcsRUFDWGxDLFFBQVEsR0FDSlEsZ0JBQWdCLENBQVNDLHdCQUF3QixDQUFDQyxJQUFJLENBQ3ZEQyxLQUFLLEVBQ0xYLFFBQVEsRUFDUjtVQUFFWSxLQUFLLEVBQUVULFdBQVc7VUFBRVUsS0FBSyxFQUFFcEMsUUFBUSxDQUFDRyxRQUFRO1FBQUcsQ0FBQyxFQUNsRHFCLGFBQWEsRUFDYixJQUFJLEVBQ0osSUFBSSxFQUNKLElBQUksRUFDSk0sU0FBUyxFQUNUQSxTQUFTLENBQ1IsR0FDREEsU0FBUyxFQUNaOUIsUUFBUSxDQUFDcUMsVUFBVSxFQUFFLENBQUNDLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxDQUNuRTtNQUNGLENBQUMsQ0FBQyxPQUFPb0IsQ0FBQyxFQUFFO1FBQ1gsSUFBSUYsaUJBQWlCLEVBQUU7VUFDdEIsTUFBTUcsVUFBVSxHQUFHNUQsYUFBYSxDQUFDQyxRQUFRLEVBQUVOLGVBQWUsQ0FBQ0ksT0FBTyxDQUFDO1lBQ2xFOEQsbUJBQW1CLEdBQUdMLGFBQWEsQ0FBQ0oscUJBQXFCLEVBQUU7WUFDM0RVLGtCQUFrQixHQUFHRCxtQkFBbUIsQ0FBQ0UseUJBQXlCLENBQUNILFVBQVUsRUFBRTNELFFBQVEsQ0FBQztZQUN4RitELFlBQVksR0FBR0Ysa0JBQWtCLElBQUlBLGtCQUFrQixDQUFDRyxlQUFlO1VBQ3hFLElBQUlELFlBQVksSUFBSUEsWUFBWSxDQUFDRSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQzVDLElBQUk7Y0FDSCxNQUFNTCxtQkFBbUIsQ0FBQ00sa0JBQWtCLENBQUNILFlBQVksRUFBRS9ELFFBQVEsQ0FBQztZQUNyRSxDQUFDLENBQUMsT0FBT21FLE1BQVcsRUFBRTtjQUNyQmQsR0FBRyxDQUFDRCxLQUFLLENBQUMscUNBQXFDLEVBQUVlLE1BQU0sQ0FBQztZQUN6RDtVQUNELENBQUMsTUFBTTtZQUNOLElBQUk7Y0FDSCxNQUFNakIsZUFBZSxDQUFDbEQsUUFBUSxFQUFFNEQsbUJBQW1CLENBQUM7WUFDckQsQ0FBQyxDQUFDLE9BQU9PLE1BQVcsRUFBRTtjQUNyQmQsR0FBRyxDQUFDRCxLQUFLLENBQUMsaUNBQWlDLEVBQUVlLE1BQU0sQ0FBQztZQUNyRDtVQUNEO1FBQ0Q7UUFDQSxNQUFNVCxDQUFDO01BQ1I7SUFDRCxDQUFDLE1BQU07TUFDTixNQUFNLElBQUlsQixLQUFLLENBQUMsZ0VBQWdFLENBQUM7SUFDbEY7RUFDRDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTNEIsd0JBQXdCLENBQUNwRSxRQUFpQixFQUFpQjtJQUNuRSxNQUFNSSxVQUFVLEdBQUdKLFFBQVEsQ0FBQ0csUUFBUSxFQUFFLENBQUNFLFlBQVksRUFBRTtJQUNyRCxNQUFNZ0UsWUFBWSxHQUFHakUsVUFBVSxDQUFDRyxXQUFXLENBQUNQLFFBQVEsQ0FBQ1EsT0FBTyxFQUFFLENBQUM7SUFDL0QsTUFBTThELFdBQVcsR0FBR3hELGFBQWEsQ0FBQ2QsUUFBUSxFQUFFTixlQUFlLENBQUNJLE9BQU8sQ0FBQztJQUNwRTtJQUNBO0lBQ0EsT0FBT3dFLFdBQVcsR0FBR2xFLFVBQVUsQ0FBQ0ssU0FBUyxDQUFFLEdBQUU0RCxZQUFhLEtBQUUseUNBQWlDLFFBQU8sQ0FBQyxHQUFHLElBQUk7RUFDN0c7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU3JCLDZCQUE2QixDQUFDaEQsUUFBaUIsRUFBRXVFLE9BQWdCLEVBQUVDLFNBQW1CLEVBQUU1QixVQUFvQixFQUFFO0lBQ3RILElBQUksQ0FBQzVDLFFBQVEsQ0FBQ21CLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO01BQzVDLE1BQU1zRCxhQUFhLEdBQUdELFNBQVMsR0FBR0osd0JBQXdCLENBQUNwRSxRQUFRLENBQUMsR0FBRyxJQUFJO01BQzNFLE1BQU1xQixVQUFVLEdBQUdYLGVBQWUsQ0FBQ1YsUUFBUSxFQUFFTixlQUFlLENBQUNJLE9BQU8sRUFBRTJFLGFBQWEsR0FBRztRQUFFQyxPQUFPLEVBQUVEO01BQWMsQ0FBQyxHQUFHLElBQUksQ0FBQzs7TUFFeEg7TUFDQXBELFVBQVUsQ0FBQ0MsWUFBWSxDQUFDLHNCQUFzQixFQUFFLEVBQUUsQ0FBQztNQUVuRCxNQUFNQyxRQUFRLEdBQUdnRCxPQUFPLElBQUlsRCxVQUFVLENBQUNzRCxVQUFVLEVBQUU7TUFDbkQsT0FBT3RELFVBQVUsQ0FDZlEsT0FBTyxDQUFDTixRQUFRLEVBQUVxQixVQUFVLENBQUMsQ0FDN0JnQyxJQUFJLENBQUMsWUFBWTtRQUNqQixPQUFPdkQsVUFBVTtNQUNsQixDQUFDLENBQUMsQ0FDRHdELEtBQUssQ0FBQyxVQUFVVixNQUFXLEVBQUU7UUFDN0JkLEdBQUcsQ0FBQ0QsS0FBSyxDQUFDLHFDQUFxQyxFQUFFZSxNQUFNLENBQUM7TUFDekQsQ0FBQyxDQUFDO0lBQ0osQ0FBQyxNQUFNO01BQ04sTUFBTSxJQUFJM0IsS0FBSyxDQUFDLGlFQUFpRSxDQUFDO0lBQ25GO0VBQ0Q7RUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTSyxlQUFlLENBQUM3QyxRQUFpQixFQUFzQjtJQUMvRCxNQUFNRSxNQUFNLEdBQUdGLFFBQVEsQ0FBQ0csUUFBUSxFQUFFO01BQ2pDQyxVQUFVLEdBQUdGLE1BQU0sQ0FBQ0csWUFBWSxFQUFFO01BQ2xDQyxjQUFjLEdBQUdGLFVBQVUsQ0FBQ0csV0FBVyxDQUFDUCxRQUFRLENBQUNRLE9BQU8sRUFBRSxDQUFDO0lBQzVELE9BQU9KLFVBQVUsQ0FBQ0ssU0FBUyxDQUFFLEdBQUVILGNBQWUsaURBQWdELENBQUM7RUFDaEc7RUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVM0QyxlQUFlLENBQUNsRCxRQUFpQixFQUFFNEQsbUJBQXVDLEVBQUU7SUFDcEYsTUFBTWEsYUFBYSxHQUFHdkMsS0FBSyxDQUFDVyxlQUFlLENBQUM3QyxRQUFRLENBQUM7SUFDckQsSUFBSXlFLGFBQWEsRUFBRTtNQUNsQixPQUFPYixtQkFBbUIsQ0FBQ00sa0JBQWtCLENBQUMsQ0FBQ08sYUFBYSxDQUFDLEVBQUV6RSxRQUFRLENBQUM7SUFDekU7SUFDQSxPQUFPOEUsT0FBTyxDQUFDQyxPQUFPLEVBQUU7RUFDekI7RUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsZUFBZUMseUJBQXlCLENBQUNoRixRQUFpQixFQUFFdUQsYUFBbUIsRUFBRTBCLHFCQUErQixFQUFvQjtJQUNuSSxJQUFJLENBQUNqRixRQUFRLENBQUNtQixXQUFXLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtNQUM1QyxNQUFNK0QsaUJBQWlCLEdBQUdoRCxLQUFLLENBQUN4QixlQUFlLENBQUNWLFFBQVEsRUFBRU4sZUFBZSxDQUFDRyxPQUFPLENBQUM7TUFDbEYsTUFBTTJCLGFBQWEsR0FBRytCLGFBQWEsSUFBSTlCLGdCQUFnQixDQUFDOEIsYUFBYSxDQUFDO01BQ3RFLE1BQU1oQyxRQUFRLEdBQUcsUUFBUTtNQUN6QixNQUFNRyxXQUFXLEdBQUcsQ0FBQUYsYUFBYSxhQUFiQSxhQUFhLHVCQUFiQSxhQUFhLENBQUVHLE9BQU8sQ0FBQywyQ0FBMkMsQ0FBQyxLQUFJLEVBQUU7TUFDN0Y7TUFDQSxNQUFNd0QsZUFBZSxHQUFHLENBQUNGLHFCQUFxQixHQUMzQ0MsaUJBQWlCLENBQUNyRCxPQUFPLENBQUNOLFFBQVEsQ0FBQyxHQUNuQzJELGlCQUFpQixDQUFDckQsT0FBTyxDQUN6Qk4sUUFBUSxFQUNSTyxTQUFTLEVBQ1JDLGdCQUFnQixDQUFTQyx3QkFBd0IsQ0FBQ0MsSUFBSSxDQUN0REMsS0FBSyxFQUNMWCxRQUFRLEVBQ1I7UUFBRVksS0FBSyxFQUFFVCxXQUFXO1FBQUVVLEtBQUssRUFBRXBDLFFBQVEsQ0FBQ0csUUFBUTtNQUFHLENBQUMsRUFDbERxQixhQUFhLEVBQ2IsSUFBSSxFQUNKLElBQUksRUFDSixJQUFJLEVBQ0pNLFNBQVMsRUFDVEEsU0FBUyxDQUNULEVBQ0QsS0FBSyxDQUNKO01BQ0o5QixRQUFRLENBQUNHLFFBQVEsRUFBRSxDQUFDb0MsV0FBVyxDQUFDaEIsUUFBUSxDQUFDO01BQ3pDLE9BQU80RCxlQUFlO0lBQ3ZCLENBQUMsTUFBTTtNQUNOLE1BQU0sSUFBSTNDLEtBQUssQ0FBQyw2REFBNkQsQ0FBQztJQUMvRTtFQUNEOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLGVBQWU0Qyx5QkFBeUIsQ0FDdkNDLGtCQUEyQixFQUMzQkMsdUJBQWdDLEVBQ2hDQyxlQUFpQyxFQUNTO0lBQzFDLElBQUksQ0FBQ0QsdUJBQXVCLENBQUM5RSxPQUFPLEVBQUUsQ0FBQ2dGLFVBQVUsQ0FBQ0gsa0JBQWtCLENBQUM3RSxPQUFPLEVBQUUsQ0FBQyxFQUFFO01BQ2hGO01BQ0E2QyxHQUFHLENBQUNELEtBQUssQ0FBQywwQ0FBMEMsQ0FBQztNQUNyRCxNQUFNLElBQUlaLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQztJQUM1RDtJQUVBLElBQ0M4Qyx1QkFBdUIsQ0FBQ25FLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEtBQUssSUFDL0RtRSx1QkFBdUIsQ0FBQ25FLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLEtBQUssRUFDL0Q7TUFDRDtNQUNBO01BQ0EsT0FBT1csU0FBUztJQUNqQjtJQUVBLE1BQU1NLEtBQUssR0FBR2lELGtCQUFrQixDQUFDbEYsUUFBUSxFQUFFO0lBQzNDLElBQUk7TUFDSDtNQUNBO01BQ0E7TUFDQTs7TUFFQTtNQUNBLE1BQU1zRixjQUFjLEdBQUdILHVCQUF1QixDQUFDOUUsT0FBTyxFQUFFLENBQUNrRixPQUFPLENBQUNMLGtCQUFrQixDQUFDN0UsT0FBTyxFQUFFLEVBQUUsRUFBRSxDQUFDO01BQ2xHLE1BQU1tRixRQUFRLEdBQUdGLGNBQWMsR0FBR0EsY0FBYyxDQUFDRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUNDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFO01BQzdFO01BQ0FGLFFBQVEsQ0FBQ0csT0FBTyxDQUFDVCxrQkFBa0IsQ0FBQzdFLE9BQU8sRUFBRSxDQUFDb0YsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDOztNQUUzRDtNQUNBO01BQ0E7TUFDQTtNQUNBLE1BQU1HLFFBQWtCLEdBQUcsRUFBRTtNQUM3QixNQUFNQyxRQUFrQixHQUFHLEVBQUU7TUFDN0IsSUFBSUMsV0FBVyxHQUFHLEVBQUU7O01BRXBCO01BQ0E7TUFDQSxNQUFNQyxLQUFLLEdBQUcsQ0FBQyxHQUFHUCxRQUFRLENBQUM7TUFDM0IsSUFBSSxDQUFBSixlQUFlLGFBQWZBLGVBQWUsdUJBQWZBLGVBQWUsQ0FBRVksc0JBQXNCLE1BQUssSUFBSSxFQUFFO1FBQUE7UUFDckRELEtBQUssQ0FBQ0UsS0FBSyxFQUFFO1FBQ2JILFdBQVcsR0FBRyxHQUFHLElBQUdaLGtCQUFrQixhQUFsQkEsa0JBQWtCLGdEQUFsQkEsa0JBQWtCLENBQUU3RSxPQUFPLEVBQUUsMERBQTdCLHNCQUErQm9GLFNBQVMsQ0FBQyxDQUFDLENBQUM7TUFDaEU7TUFDQSxNQUFNUyxxQkFBcUIsR0FBR0gsS0FBSyxDQUFDSSxHQUFHLENBQUVDLE9BQU8sSUFBSztRQUNwRE4sV0FBVyxJQUFLLElBQUdNLE9BQVEsRUFBQztRQUM1QlIsUUFBUSxDQUFDRCxPQUFPLENBQUNHLFdBQVcsQ0FBQztRQUM3QixJQUFJQSxXQUFXLENBQUNPLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtVQUM5QixNQUFNQyxjQUFjLEdBQUdyRSxLQUFLLENBQUN2QixXQUFXLENBQUUsR0FBRW9GLFdBQVksZ0JBQWUsQ0FBQyxDQUFDUyxlQUFlLEVBQUU7VUFDMUYsT0FBT0QsY0FBYyxDQUFDRSxvQkFBb0IsRUFBRTtRQUM3QyxDQUFDLE1BQU07VUFDTixPQUFPN0IsT0FBTyxDQUFDQyxPQUFPLENBQUNqRCxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ3BDO01BQ0QsQ0FBQyxDQUFDOztNQUVGO01BQ0E7TUFDQTtNQUNBO01BQ0EsTUFBTThFLGNBQWMsR0FBSSxNQUFNOUIsT0FBTyxDQUFDK0IsR0FBRyxDQUFDUixxQkFBcUIsQ0FBYztNQUU3RSxJQUFJLENBQUFkLGVBQWUsYUFBZkEsZUFBZSx1QkFBZkEsZUFBZSxDQUFFWSxzQkFBc0IsTUFBSyxJQUFJLEVBQUU7UUFDckRTLGNBQWMsQ0FBQ2QsT0FBTyxDQUFDUCxlQUFlLGFBQWZBLGVBQWUsdUJBQWZBLGVBQWUsQ0FBRXVCLGVBQWUsQ0FBQztRQUN4RGYsUUFBUSxDQUFDZ0IsSUFBSSxDQUFDMUIsa0JBQWtCLENBQUM3RSxPQUFPLEVBQUUsQ0FBQztNQUM1QztNQUNBLElBQUl3RyxXQUFXLEdBQUcsRUFBRTtNQUNwQkosY0FBYyxDQUFDSyxPQUFPLENBQUMsQ0FBQ0MsYUFBYSxFQUFFQyxLQUFLLEtBQUs7UUFDaEQsSUFBSUEsS0FBSyxLQUFLLENBQUMsRUFBRTtVQUNoQixJQUFJeEIsUUFBUSxDQUFDd0IsS0FBSyxDQUFDLENBQUNYLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNsQyxNQUFNWSxVQUFVLEdBQUd6QixRQUFRLENBQUN3QixLQUFLLENBQUMsQ0FBQ3pCLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6RCxNQUFNMkIsSUFBSSxHQUFHSCxhQUFhLENBQUN4QixPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDakRzQixXQUFXLElBQUssSUFBR0ksVUFBVyxHQUFFQyxJQUFLLEVBQUM7VUFDdkMsQ0FBQyxNQUFNO1lBQ05MLFdBQVcsSUFBSyxJQUFHckIsUUFBUSxDQUFDd0IsS0FBSyxDQUFFLEVBQUMsQ0FBQyxDQUFDO1VBQ3ZDO1FBQ0QsQ0FBQyxNQUFNO1VBQ05ILFdBQVcsR0FBR0UsYUFBYSxDQUFDLENBQUM7UUFDOUI7O1FBQ0FsQixRQUFRLENBQUNGLE9BQU8sQ0FBQ2tCLFdBQVcsQ0FBQztNQUM5QixDQUFDLENBQUM7TUFFRixPQUFPO1FBQ05NLGFBQWEsRUFBRWxGLEtBQUssQ0FBQ3ZCLFdBQVcsQ0FBQ21HLFdBQVcsRUFBRWxGLFNBQVMsRUFBRTtVQUFFeUYsU0FBUyxFQUFFO1FBQWUsQ0FBQyxDQUFDLENBQUNiLGVBQWUsRUFBRTtRQUFFO1FBQzNHYyxXQUFXLEVBQUV6QixRQUFRLENBQUNPLEdBQUcsQ0FBQyxDQUFDbUIsT0FBTyxFQUFFTixLQUFLLEtBQUs7VUFDN0MsT0FBTztZQUNOTSxPQUFPO1lBQ1BDLE9BQU8sRUFBRTFCLFFBQVEsQ0FBQ21CLEtBQUs7VUFDeEIsQ0FBQztRQUNGLENBQUM7TUFDRixDQUFDO0lBQ0YsQ0FBQyxDQUFDLE9BQU8vRCxLQUFLLEVBQUU7TUFDZjtNQUNBLE9BQU90QixTQUFTO0lBQ2pCO0VBQ0Q7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsZUFBZTZGLDZCQUE2QixDQUMzQzNILFFBQWEsRUFDYnVELGFBQTJCLEVBQzNCcUUsV0FHQyxFQUM4QjtJQUMvQixNQUFNQyxNQUFNLEdBQUdELFdBQVcsSUFBSSxDQUFDLENBQUM7TUFDL0JFLHVCQUF1QixHQUN0QixPQUFPRCxNQUFNLENBQUM1RyxnQkFBZ0IsS0FBSyxXQUFXLElBQUssT0FBTzRHLE1BQU0sQ0FBQzVHLGdCQUFnQixLQUFLLFNBQVMsSUFBSTRHLE1BQU0sQ0FBQzVHLGdCQUFpQixDQUFDLENBQUM7O0lBRS9IO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQyxlQUFlOEcsZUFBZSxHQUFHO01BQ2hDO01BQ0EsTUFBTTdILE1BQU0sR0FBR0YsUUFBUSxDQUFDRyxRQUFRLEVBQUU7TUFDbEMsTUFBTTZILGdCQUFnQixHQUFHOUgsTUFBTSxDQUFDVyxXQUFXLENBQUUsR0FBRWIsUUFBUSxDQUFDUSxPQUFPLEVBQUcsMEJBQXlCLENBQUMsQ0FBQ2tHLGVBQWUsRUFBRTtNQUM5RyxNQUFNbEYsYUFBYSxHQUFHQyxnQkFBZ0IsQ0FBQ21HLFdBQVcsQ0FBQzFHLEtBQUssQ0FBQztNQUN6RCxNQUFNK0csY0FBYyxHQUFHLE1BQU1ELGdCQUFnQixDQUFDbEYsYUFBYSxFQUFFO01BQzdELElBQUltRixjQUFjLEVBQUU7UUFDbkI7UUFDQUMsZUFBZSxDQUFDQywrQkFBK0IsRUFBRTtRQUNqRCxJQUFJQyxLQUFLLEdBQUdILGNBQWMsQ0FBQ0ksMEJBQTBCLElBQUlKLGNBQWMsQ0FBQ0ssZUFBZTtRQUN2RixNQUFNQyxVQUFVLEdBQUlYLFdBQVcsQ0FBQzFHLEtBQUssQ0FBQ3NILFdBQVcsRUFBRSxDQUFTQyxTQUFTO1FBQ3JFLElBQUlMLEtBQUssRUFBRTtVQUNWLE1BQU1NLGdCQUFnQixHQUFHbEgsYUFBYSxDQUFDRyxPQUFPLENBQUMsMENBQTBDLEVBQUV5RyxLQUFLLEVBQUVHLFVBQVUsQ0FBQztVQUM3R0ksVUFBVSxDQUFDdkYsS0FBSyxDQUFDc0YsZ0JBQWdCLENBQUM7VUFDbEMsTUFBTSxJQUFJbEcsS0FBSyxDQUFDa0csZ0JBQWdCLENBQUM7UUFDbEMsQ0FBQyxNQUFNO1VBQ05OLEtBQUssR0FBR0gsY0FBYyxDQUFDVyx3QkFBd0IsSUFBSVgsY0FBYyxDQUFDWSxhQUFhO1VBQy9FLE1BQU1DLGtCQUFrQixHQUFHdEgsYUFBYSxDQUFDRyxPQUFPLENBQUMsMkNBQTJDLEVBQUV5RyxLQUFLLEVBQUVHLFVBQVUsQ0FBQztVQUNoSCxNQUFNckcsS0FBSyxDQUFDNkcsOEJBQThCLENBQUNELGtCQUFrQixFQUFFOUksUUFBUSxDQUFDO1VBQ3hFLE9BQU9rQyxLQUFLLENBQUNsQixzQkFBc0IsQ0FBQ2hCLFFBQVEsRUFBRSxLQUFLLEVBQUU0SCxXQUFXLENBQUMxRyxLQUFLLENBQUM7UUFDeEU7TUFDRDtNQUNBLE1BQU0sSUFBSXNCLEtBQUssQ0FBRSx3Q0FBdUN4QyxRQUFRLENBQUNRLE9BQU8sRUFBRyxFQUFDLENBQUM7SUFDOUU7SUFFQSxJQUFJLENBQUNSLFFBQVEsRUFBRTtNQUNkLE1BQU0sSUFBSXdDLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQztJQUNsRTtJQUNBLElBQUl3RyxhQUFrQztJQUN0QyxJQUFJO01BQ0hBLGFBQWEsR0FBRyxNQUFNOUcsS0FBSyxDQUFDbEIsc0JBQXNCLENBQUNoQixRQUFRLEVBQUU4SCx1QkFBdUIsRUFBRUYsV0FBVyxDQUFDMUcsS0FBSyxDQUFDO0lBQ3pHLENBQUMsQ0FBQyxPQUFPK0gsU0FBYyxFQUFFO01BQ3hCLElBQUlBLFNBQVMsQ0FBQ0MsTUFBTSxLQUFLLEdBQUcsSUFBSUQsU0FBUyxDQUFDQyxNQUFNLEtBQUssR0FBRyxJQUFJRCxTQUFTLENBQUNDLE1BQU0sS0FBSyxHQUFHLEVBQUU7UUFDckZoQixlQUFlLENBQUNpQiw2QkFBNkIsRUFBRTtRQUMvQ2pCLGVBQWUsQ0FBQ0MsK0JBQStCLEVBQUU7UUFDakQsTUFBTWlCLFdBQVcsR0FBRyxNQUFNbEgsS0FBSyxDQUFDa0QseUJBQXlCLENBQUNwRixRQUFRLEVBQUVBLFFBQVEsQ0FBQztRQUM3RSxJQUFJb0osV0FBVyxhQUFYQSxXQUFXLGVBQVhBLFdBQVcsQ0FBRTlCLGFBQWEsRUFBRTtVQUMvQjtVQUNBLE1BQU0rQixXQUFXLENBQUNDLHVCQUF1QixDQUFDRixXQUFXLENBQUM5QixhQUFhLENBQUM7VUFDcEUsT0FBTzhCLFdBQVcsQ0FBQzlCLGFBQWE7UUFDakMsQ0FBQyxNQUFNO1VBQ047VUFDQTBCLGFBQWEsR0FBRyxNQUFNakIsZUFBZSxFQUFFO1FBQ3hDO01BQ0QsQ0FBQyxNQUFNLElBQUksRUFBRWtCLFNBQVMsSUFBSUEsU0FBUyxDQUFDTSxRQUFRLENBQUMsRUFBRTtRQUM5QyxNQUFNLElBQUkvRyxLQUFLLENBQUN5RyxTQUFTLENBQUM7TUFDM0I7SUFDRDtJQUVBLElBQUlELGFBQWEsRUFBRTtNQUFBO01BQ2xCLE1BQU1RLGVBQWUsR0FBR3RILEtBQUssQ0FBQ25DLGFBQWEsQ0FBQ2lKLGFBQWEsRUFBRXRKLGVBQWUsQ0FBQ0MsSUFBSSxDQUFDO01BQ2hGLE1BQU04SixZQUFZLEdBQUdsRyxhQUFhLENBQUNKLHFCQUFxQixFQUFFLENBQUNXLHlCQUF5QixDQUFDMEYsZUFBZSxFQUFFUixhQUFhLENBQUM7TUFDcEgsSUFBSVMsWUFBWSxhQUFaQSxZQUFZLHdDQUFaQSxZQUFZLENBQUVDLGNBQWMsa0RBQTVCLHNCQUE4QnpGLE1BQU0sRUFBRTtRQUN6QyxNQUFNVixhQUFhLENBQUNKLHFCQUFxQixFQUFFLENBQUN3RyxnQ0FBZ0MsQ0FBQ0YsWUFBWSxFQUFFVCxhQUFhLENBQUM7UUFDekcsT0FBT0EsYUFBYTtNQUNyQixDQUFDLE1BQU07UUFDTixPQUFPQSxhQUFhO01BQ3JCO0lBQ0QsQ0FBQyxNQUFNO01BQ04sT0FBT2xILFNBQVM7SUFDakI7RUFDRDtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsZUFBZThILGdCQUFnQixDQUM5QjVKLFFBQWlCLEVBQ2pCdUQsYUFBMkIsRUFDM0JxRSxXQUE4RSxFQUM5RWlDLGNBQStCLEVBQzlCO0lBQ0QsTUFBTWhDLE1BQU0sR0FBR0QsV0FBVyxJQUFJLENBQUMsQ0FBQztJQUNoQyxJQUFJLENBQUM1SCxRQUFRLEVBQUU7TUFDZCxNQUFNLElBQUl3QyxLQUFLLENBQUMsK0NBQStDLENBQUM7SUFDakU7SUFFQSxNQUFNc0gsUUFBUSxHQUFHakMsTUFBTSxDQUFDa0Msd0JBQXdCLEdBQUcsTUFBTWxDLE1BQU0sQ0FBQ2tDLHdCQUF3QixDQUFDL0osUUFBUSxDQUFDLEdBQUcsSUFBSTtJQUN6RyxJQUFJLENBQUM4SixRQUFRLEVBQUU7TUFDZCxNQUFNLElBQUl0SCxLQUFLLENBQUUscUVBQW9FeEMsUUFBUSxDQUFDUSxPQUFPLEVBQUcsRUFBQyxDQUFDO0lBQzNHO0lBRUEsSUFBSXdKLHNCQUEyQjtJQUMvQixJQUFJLENBQUNqSixnQkFBZ0IsQ0FBQ2YsUUFBUSxDQUFDLEVBQUU7TUFDaENnSyxzQkFBc0IsR0FBRyxNQUFNMUcsNEJBQTRCLENBQUN0RCxRQUFRLEVBQUV1RCxhQUFhLENBQUM7SUFDckYsQ0FBQyxNQUFNO01BQ047TUFDQSxNQUFNMEcsV0FBVyxHQUFHLE9BQU87TUFDM0I7TUFDQSxJQUFJQyxlQUFlLEdBQUdoSSxLQUFLLENBQUNjLDZCQUE2QixDQUFDaEQsUUFBUSxFQUFFaUssV0FBVyxFQUFFLEtBQUssQ0FBQztNQUN2RmpLLFFBQVEsQ0FBQ0csUUFBUSxFQUFFLENBQUNvQyxXQUFXLENBQUMwSCxXQUFXLENBQUM7TUFDNUMsTUFBTUUsZ0JBQWdCLEdBQUdqSSxLQUFLLENBQUNvQiw0QkFBNEIsQ0FBQ3RELFFBQVEsRUFBRXVELGFBQWEsRUFBRTBHLFdBQVcsQ0FBQztNQUNqRyxJQUFJO1FBQ0gsTUFBTUcsTUFBTSxHQUFHLE1BQU10RixPQUFPLENBQUMrQixHQUFHLENBQUMsQ0FBQ3FELGVBQWUsRUFBRUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNyRUgsc0JBQXNCLEdBQUdJLE1BQU0sQ0FBQyxDQUFDLENBQUM7TUFDbkMsQ0FBQyxDQUFDLE9BQU9DLEdBQUcsRUFBRTtRQUNiO1FBQ0E7UUFDQSxNQUFNNUYsYUFBYSxHQUFHTCx3QkFBd0IsQ0FBQ3BFLFFBQVEsQ0FBQztRQUN4RCxJQUFJeUUsYUFBYSxFQUFFO1VBQ2xCeUYsZUFBZSxHQUFHaEksS0FBSyxDQUFDYyw2QkFBNkIsQ0FBQ2hELFFBQVEsRUFBRWlLLFdBQVcsRUFBRSxJQUFJLENBQUM7VUFDbEZqSyxRQUFRLENBQUNHLFFBQVEsRUFBRSxDQUFDb0MsV0FBVyxDQUFDMEgsV0FBVyxDQUFDO1VBQzVDLE1BQU1DLGVBQWU7VUFDckIsTUFBTUksSUFBSSxHQUFHLE1BQU10SyxRQUFRLENBQUM4QyxhQUFhLEVBQUU7VUFDM0MsSUFBSXdILElBQUksQ0FBQzdGLGFBQWEsQ0FBQyxDQUFDUixNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ25DO1lBQ0E0RixjQUFjLGFBQWRBLGNBQWMsdUJBQWRBLGNBQWMsQ0FBRVUsd0JBQXdCLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRXZLLFFBQVEsQ0FBQ1EsT0FBTyxFQUFFLENBQUM7VUFDM0U7UUFDRDtRQUNBLE1BQU02SixHQUFHO01BQ1Y7SUFDRDtJQUNBLE9BQU94QyxNQUFNLENBQUMyQyx1QkFBdUIsR0FBRzNDLE1BQU0sQ0FBQzJDLHVCQUF1QixDQUFDeEssUUFBUSxFQUFFZ0ssc0JBQXNCLENBQUMsR0FBR0Esc0JBQXNCO0VBQ2xJOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTakIsOEJBQThCLENBQUNELGtCQUEwQixFQUFFOUksUUFBaUIsRUFBRTtJQUN0RixNQUFNeUssWUFBWSxHQUFHQyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQztJQUNqRSxPQUFPLElBQUk3RixPQUFPLENBQUMsVUFBVUMsT0FBNkIsRUFBRTZGLE1BQThCLEVBQUU7TUFDM0YsTUFBTUMsT0FBTyxHQUFHLElBQUlDLE1BQU0sQ0FBQztRQUMxQkMsS0FBSyxFQUFFTixZQUFZLENBQUM5SSxPQUFPLENBQUMsNERBQTRELENBQUM7UUFDekZxSixLQUFLLEVBQUUsU0FBUztRQUNoQkMsT0FBTyxFQUFFLElBQUlDLElBQUksQ0FBQztVQUNqQkMsSUFBSSxFQUFFckM7UUFDUCxDQUFDLENBQUM7UUFDRnNDLFdBQVcsRUFBRSxJQUFJQyxNQUFNLENBQUM7VUFDdkJGLElBQUksRUFBRVYsWUFBWSxDQUFDOUksT0FBTyxDQUFDLDJCQUEyQixDQUFDO1VBQ3ZEMkosSUFBSSxFQUFFLFlBQVk7VUFDbEJDLEtBQUssRUFBRSxZQUFZO1lBQ2xCVixPQUFPLENBQUNXLEtBQUssRUFBRTtZQUNmekcsT0FBTyxDQUFDLElBQUksQ0FBQztVQUNkO1FBQ0QsQ0FBQyxDQUFDO1FBQ0YwRyxTQUFTLEVBQUUsSUFBSUosTUFBTSxDQUFDO1VBQ3JCRixJQUFJLEVBQUVWLFlBQVksQ0FBQzlJLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQztVQUN6RDRKLEtBQUssRUFBRSxZQUFZO1lBQ2xCVixPQUFPLENBQUNXLEtBQUssRUFBRTtZQUNmWixNQUFNLENBQUUsd0NBQXVDNUssUUFBUSxDQUFDUSxPQUFPLEVBQUcsRUFBQyxDQUFDO1VBQ3JFO1FBQ0QsQ0FBQyxDQUFDO1FBQ0ZrTCxVQUFVLEVBQUUsWUFBWTtVQUN2QmIsT0FBTyxDQUFDYyxPQUFPLEVBQUU7UUFDbEI7TUFDRCxDQUFDLENBQUM7TUFDRmQsT0FBTyxDQUFDZSxhQUFhLENBQUMscUJBQXFCLENBQUM7TUFDNUNmLE9BQU8sQ0FBQ2dCLElBQUksRUFBRTtJQUNmLENBQUMsQ0FBQztFQUNIOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLFdBQVcsQ0FBQzlMLFFBQWlCLEVBQUV1RCxhQUE0QixFQUFFMEIscUJBQStCLEVBQW9CO0lBQ3hILE1BQU04RyxjQUFjLEdBQUdoTSxhQUFhLENBQUNDLFFBQVEsRUFBRU4sZUFBZSxDQUFDRyxPQUFPLENBQUM7TUFDdEVtTSxlQUFlLEdBQUdoTSxRQUFRLENBQUNTLFNBQVMsRUFBRSxDQUFDd0wsY0FBYztJQUV0RCxJQUFJRCxlQUFlLElBQUssQ0FBQ0EsZUFBZSxJQUFJLENBQUNELGNBQWUsRUFBRTtNQUM3RDtNQUNBLElBQUkvTCxRQUFRLENBQUNrTSxpQkFBaUIsRUFBRSxFQUFFO1FBQ2pDLE9BQU9sTSxRQUFRLENBQ2JxQyxVQUFVLEVBQUUsQ0FDWjhKLFlBQVksRUFBRSxDQUNkdkgsSUFBSSxDQUFDLFlBQVk7VUFDakIsT0FBTzVFLFFBQVEsQ0FBQ29NLE1BQU0sRUFBRTtRQUN6QixDQUFDLENBQUMsQ0FDRHZILEtBQUssQ0FBQyxVQUFVekIsS0FBVSxFQUFFO1VBQzVCLE9BQU8wQixPQUFPLENBQUM4RixNQUFNLENBQUN4SCxLQUFLLENBQUM7UUFDN0IsQ0FBQyxDQUFDO01BQ0osQ0FBQyxNQUFNO1FBQ04sT0FBT3BELFFBQVEsQ0FBQ29NLE1BQU0sRUFBRTtNQUN6QjtJQUNELENBQUMsTUFBTTtNQUNOO01BQ0EsT0FBT3BILHlCQUF5QixDQUFDaEYsUUFBUSxFQUFFdUQsYUFBYSxFQUFFMEIscUJBQXFCLENBQUM7SUFDakY7RUFDRDtFQUVBLE1BQU0vQyxLQUFLLEdBQUc7SUFDYnlGLDZCQUE2QixFQUFFQSw2QkFBNkI7SUFDNURpQyxnQkFBZ0IsRUFBRUEsZ0JBQWdCO0lBQ2xDa0MsV0FBVyxFQUFFQSxXQUFXO0lBQ3hCOUssc0JBQXNCLEVBQUVBLHNCQUFzQjtJQUM5Q3lCLHNCQUFzQixFQUFFQSxzQkFBc0I7SUFDOUNPLDZCQUE2QixFQUFFQSw2QkFBNkI7SUFDNURNLDRCQUE0QixFQUFFQSw0QkFBNEI7SUFDMUR2QyxnQkFBZ0IsRUFBRUEsZ0JBQWdCO0lBQ2xDOEIsZUFBZSxFQUFFQSxlQUFlO0lBQ2hDdUMseUJBQXlCLEVBQUVBLHlCQUF5QjtJQUNwRGlILHlDQUF5QyxFQUFFQyxrQkFBa0IsQ0FBQ0QseUNBQXlDO0lBQ3ZHRSxvQ0FBb0MsRUFBRUQsa0JBQWtCLENBQUNDLG9DQUFvQztJQUM3RjdMLGVBQWUsRUFBRUEsZUFBZTtJQUNoQ3NFLHlCQUF5QixFQUFFQSx5QkFBeUI7SUFDcER3SCxjQUFjLEVBQUVGLGtCQUFrQixDQUFDRSxjQUFjO0lBQ2pEek0sYUFBYSxFQUFFQSxhQUFhO0lBQzVCZ0osOEJBQThCLEVBQUVBO0VBQ2pDLENBQUM7RUFBQyxPQUVhN0csS0FBSztBQUFBIn0=
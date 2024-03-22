/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/FPMHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel", "../../../operationsHelper", "./_internal"], function (Log, ActionRuntime, CommonUtils, BusyLocker, messageHandling, FPMHelper, ResourceModelHelper, StableIdHelper, FELibrary, Button, Dialog, MessageBox, Core, Fragment, library, Message, XMLPreprocessor, XMLTemplateProcessor, JSONModel, operationsHelper, _internal) {
  "use strict";

  var _validateProperties = _internal._validateProperties;
  var _addMessageForActionParameter = _internal._addMessageForActionParameter;
  var MessageType = library.MessageType;
  var generate = StableIdHelper.generate;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  const Constants = FELibrary.Constants,
    InvocationGrouping = FELibrary.InvocationGrouping;
  const Action = MessageBox.Action;

  /**
   * Calls a bound action for one or multiple contexts.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callBoundAction
   * @memberof sap.fe.core.actions.operations
   * @param sActionName The name of the action to be called
   * @param contexts Either one context or an array with contexts for which the action is to be be called
   * @param oModel OData Model
   * @param oAppComponent The AppComponent
   * @param [mParameters] Optional, can contain the following attributes:
   * @param [mParameters.parameterValues] A map of action parameter names and provided values
   * @param [mParameters.mBindingParameters] A map of binding parameters that would be part of $select and $expand coming from side effects for bound actions
   * @param [mParameters.additionalSideEffect] Array of property paths to be requested in addition to actual target properties of the side effect
   * @param [mParameters.showActionParameterDialog] If set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
   * @param [mParameters.label] A human-readable label for the action
   * @param [mParameters.invocationGrouping] Mode how actions are to be called: Changeset to put all action calls into one changeset, Isolated to put them into separate changesets, defaults to Isolated
   * @param [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
   * @param [mParameters.defaultParameters] Can contain default parameters from FLP user defaults
   * @param [mParameters.parentControl] If specified, the dialogs are added as dependent of the parent control
   * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
   * @param [strictHandlingUtilities] Optional, utility flags and messages for strictHandling
   * @returns Promise resolves with an array of response objects (TODO: to be changed)
   * @private
   * @ui5-restricted
   */
  function callBoundAction(sActionName, contexts, oModel, oAppComponent, mParameters, strictHandlingUtilities) {
    if (!strictHandlingUtilities) {
      strictHandlingUtilities = {
        is412Executed: false,
        strictHandlingTransitionFails: [],
        strictHandlingPromises: [],
        strictHandlingWarningMessages: [],
        delaySuccessMessages: [],
        processedMessageIds: []
      };
    }
    if (!contexts || contexts.length === 0) {
      //In Freestyle apps bound actions can have no context
      return Promise.reject("Bound actions always requires at least one context");
    }
    // this method either accepts single context or an array of contexts
    // TODO: Refactor to an unambiguos API
    const isCalledWithArray = Array.isArray(contexts);

    // in case of single context wrap into an array for called methods (esp. callAction)
    mParameters.aContexts = isCalledWithArray ? contexts : [contexts];
    const oMetaModel = oModel.getMetaModel(),
      // Analyzing metaModelPath for action only from first context seems weird, but probably works in all existing szenarios - if several contexts are passed, they probably
      // belong to the same metamodelpath. TODO: Check, whether this can be improved / szenarios with different metaModelPaths might exist
      sActionPath = `${oMetaModel.getMetaPath(mParameters.aContexts[0].getPath())}/${sActionName}`,
      oBoundAction = oMetaModel.createBindingContext(`${sActionPath}/@$ui5.overload/0`);
    mParameters.isCriticalAction = getIsActionCritical(oMetaModel, sActionPath, mParameters.aContexts, oBoundAction);

    // Promise returned by callAction currently is rejected in case of execution for multiple contexts partly failing. This should be changed (some failing contexts do not mean
    // that function did not fulfill its task), but as this is a bigger refactoring, for the time being we need to deal with that at the calling place (i.e. here)
    // => provide the same handler (mapping back from array to single result/error if needed) for resolved/rejected case
    const extractSingleResult = function (result) {
      // single action could be resolved or rejected
      if (result[0].status === "fulfilled") {
        return result[0].value;
      } else {
        // In case of dialog cancellation, no array is returned => throw the result.
        // Ideally, differentiating should not be needed here => TODO: Find better solution when separating dialog handling (single object with single result) from backend
        // execution (potentially multiple objects)
        throw result[0].reason || result;
      }
    };
    return callAction(sActionName, oModel, oBoundAction, oAppComponent, mParameters, strictHandlingUtilities).then(result => {
      if (isCalledWithArray) {
        return result;
      } else {
        return extractSingleResult(result);
      }
    }, result => {
      if (isCalledWithArray) {
        throw result;
      } else {
        return extractSingleResult(result);
      }
    });
  }
  /**
   * Calls an action import.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callActionImport
   * @memberof sap.fe.core.actions.operations
   * @param sActionName The name of the action import to be called
   * @param oModel An instance of an OData V4 model
   * @param oAppComponent The AppComponent
   * @param [mParameters] Optional, can contain the following attributes:
   * @param [mParameters.parameterValues] A map of action parameter names and provided values
   * @param [mParameters.label] A human-readable label for the action
   * @param [mParameters.showActionParameterDialog] If set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
   * @param [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
   * @param [mParameters.defaultParameters] Can contain default parameters from FLP user defaults
   * @param [strictHandlingUtilities] Optional, utility flags and messages for strictHandling
   * @returns Promise resolves with an array of response objects (TODO: to be changed)
   * @private
   * @ui5-restricted
   */
  function callActionImport(sActionName, oModel, oAppComponent, mParameters, strictHandlingUtilities) {
    if (!oModel) {
      return Promise.reject("Action expects a model/context for execution");
    }
    const oMetaModel = oModel.getMetaModel(),
      sActionPath = oModel.bindContext(`/${sActionName}`).getPath(),
      oActionImport = oMetaModel.createBindingContext(`/${oMetaModel.createBindingContext(sActionPath).getObject("$Action")}/0`);
    mParameters.isCriticalAction = getIsActionCritical(oMetaModel, `${sActionPath}/@$ui5.overload`);
    return callAction(sActionName, oModel, oActionImport, oAppComponent, mParameters, strictHandlingUtilities);
  }
  function callBoundFunction(sFunctionName, context, oModel) {
    if (!context) {
      return Promise.reject("Bound functions always requires a context");
    }
    const oMetaModel = oModel.getMetaModel(),
      sFunctionPath = `${oMetaModel.getMetaPath(context.getPath())}/${sFunctionName}`,
      oBoundFunction = oMetaModel.createBindingContext(sFunctionPath);
    return _executeFunction(sFunctionName, oModel, oBoundFunction, context);
  }
  /**
   * Calls a function import.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callFunctionImport
   * @memberof sap.fe.core.actions.operations
   * @param sFunctionName The name of the function to be called
   * @param oModel An instance of an OData v4 model
   * @returns Promise resolves
   * @private
   */
  function callFunctionImport(sFunctionName, oModel) {
    if (!sFunctionName) {
      return Promise.resolve();
    }
    const oMetaModel = oModel.getMetaModel(),
      sFunctionPath = oModel.bindContext(`/${sFunctionName}`).getPath(),
      oFunctionImport = oMetaModel.createBindingContext(`/${oMetaModel.createBindingContext(sFunctionPath).getObject("$Function")}/0`);
    return _executeFunction(sFunctionName, oModel, oFunctionImport);
  }
  function _executeFunction(sFunctionName, oModel, oFunction, context) {
    let sGroupId;
    if (!oFunction || !oFunction.getObject()) {
      return Promise.reject(new Error(`Function ${sFunctionName} not found`));
    }
    if (context) {
      oFunction = oModel.bindContext(`${context.getPath()}/${sFunctionName}(...)`);
      sGroupId = "functionGroup";
    } else {
      oFunction = oModel.bindContext(`/${sFunctionName}(...)`);
      sGroupId = "functionImport";
    }
    const oFunctionPromise = oFunction.execute(sGroupId);
    oModel.submitBatch(sGroupId);
    return oFunctionPromise.then(function () {
      return oFunction.getBoundContext();
    });
  }
  function callAction(sActionName, oModel, oAction, oAppComponent, mParameters, strictHandlingUtilities) {
    if (!strictHandlingUtilities) {
      strictHandlingUtilities = {
        is412Executed: false,
        strictHandlingTransitionFails: [],
        strictHandlingPromises: [],
        strictHandlingWarningMessages: [],
        delaySuccessMessages: [],
        processedMessageIds: []
      };
    }
    mParameters.bGrouped = mParameters.invocationGrouping === InvocationGrouping.ChangeSet;
    return new Promise(async function (resolve, reject) {
      let mActionExecutionParameters = {};
      let fnDialog;
      let oActionPromise;
      //let failedActionPromise: any;
      const sActionLabel = mParameters.label;
      const bSkipParameterDialog = mParameters.skipParameterDialog;
      const aContexts = mParameters.aContexts;
      const bIsCreateAction = mParameters.bIsCreateAction;
      const bIsCriticalAction = mParameters.isCriticalAction;
      let oMetaModel;
      let sMetaPath;
      let sMessagesPath;
      let iMessageSideEffect;
      let bIsSameEntity;
      let oReturnType;
      let bValuesProvidedForAllParameters;
      const actionDefinition = oAction.getObject();
      if (!oAction || !oAction.getObject()) {
        return reject(new Error(`Action ${sActionName} not found`));
      }

      // Get the parameters of the action
      const aActionParameters = getActionParameters(oAction);

      // Check if the action has parameters and would need a parameter dialog
      // The parameter ResultIsActiveEntity is always hidden in the dialog! Hence if
      // this is the only parameter, this is treated as no parameter here because the
      // dialog would be empty!
      // FIXME: Should only ignore this if this is a 'create' action, otherwise it is just some normal parameter that happens to have this name
      const bActionNeedsParameterDialog = aActionParameters.length > 0 && !(aActionParameters.length === 1 && aActionParameters[0].$Name === "ResultIsActiveEntity");

      // Provided values for the action parameters from invokeAction call
      const aParameterValues = mParameters.parameterValues;

      // Determine startup parameters if provided
      const oComponentData = oAppComponent.getComponentData();
      const oStartupParameters = oComponentData && oComponentData.startupParameters || {};

      // In case an action parameter is needed, and we shall skip the dialog, check if values are provided for all parameters
      if (bActionNeedsParameterDialog && bSkipParameterDialog) {
        bValuesProvidedForAllParameters = _valuesProvidedForAllParameters(bIsCreateAction, aActionParameters, aParameterValues, oStartupParameters);
      }

      // Depending on the previously determined data, either set a dialog or leave it empty which
      // will lead to direct execution of the action without a dialog
      fnDialog = null;
      if (bActionNeedsParameterDialog) {
        if (!(bSkipParameterDialog && bValuesProvidedForAllParameters)) {
          fnDialog = showActionParameterDialog;
        }
      } else if (bIsCriticalAction) {
        fnDialog = confirmCriticalAction;
      }
      mActionExecutionParameters = {
        fnOnSubmitted: mParameters.onSubmitted,
        fnOnResponse: mParameters.onResponse,
        actionName: sActionName,
        model: oModel,
        aActionParameters: aActionParameters,
        bGetBoundContext: mParameters.bGetBoundContext,
        defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
        label: mParameters.label,
        selectedItems: mParameters.selectedItems
      };
      if (oAction.getObject("$IsBound")) {
        if (mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions) {
          oMetaModel = oModel.getMetaModel();
          sMetaPath = oMetaModel.getMetaPath(aContexts[0].getPath());
          sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
          if (sMessagesPath) {
            iMessageSideEffect = mParameters.additionalSideEffect.pathExpressions.findIndex(function (exp) {
              return typeof exp === "string" && exp === sMessagesPath;
            });

            // Add SAP_Messages by default if not annotated by side effects, action does not return a collection and
            // the return type is the same as the bound type
            oReturnType = oAction.getObject("$ReturnType");
            bIsSameEntity = oReturnType && !oReturnType.$isCollection && oAction.getModel().getObject(sMetaPath).$Type === oReturnType.$Type;
            if (iMessageSideEffect > -1 || bIsSameEntity) {
              // the message path is annotated as side effect. As there's no binding for it and the model does currently not allow
              // to add it at a later point of time we have to take care it's part of the $select of the POST, therefore moving it.
              mParameters.mBindingParameters = mParameters.mBindingParameters || {};
              if (oAction.getObject(`$ReturnType/$Type/${sMessagesPath}`) && (!mParameters.mBindingParameters.$select || mParameters.mBindingParameters.$select.split(",").indexOf(sMessagesPath) === -1)) {
                mParameters.mBindingParameters.$select = mParameters.mBindingParameters.$select ? `${mParameters.mBindingParameters.$select},${sMessagesPath}` : sMessagesPath;
                // Add side effects at entity level because $select stops these being returned by the action
                // Only if no other side effects were added for Messages
                if (iMessageSideEffect === -1) {
                  mParameters.additionalSideEffect.pathExpressions.push("*");
                }
                if (mParameters.additionalSideEffect.triggerActions.length === 0 && iMessageSideEffect > -1) {
                  // no trigger action therefore no need to request messages again
                  mParameters.additionalSideEffect.pathExpressions.splice(iMessageSideEffect, 1);
                }
              }
            }
          }
        }
        mActionExecutionParameters.aContexts = aContexts;
        mActionExecutionParameters.mBindingParameters = mParameters.mBindingParameters;
        mActionExecutionParameters.additionalSideEffect = mParameters.additionalSideEffect;
        mActionExecutionParameters.bGrouped = mParameters.invocationGrouping === InvocationGrouping.ChangeSet;
        mActionExecutionParameters.internalModelContext = mParameters.internalModelContext;
        mActionExecutionParameters.operationAvailableMap = mParameters.operationAvailableMap;
        mActionExecutionParameters.isCreateAction = bIsCreateAction;
        mActionExecutionParameters.bObjectPage = mParameters.bObjectPage;
        if (mParameters.controlId) {
          mActionExecutionParameters.control = mParameters.parentControl.byId(mParameters.controlId);
          mParameters.control = mActionExecutionParameters.control;
        } else {
          mActionExecutionParameters.control = mParameters.parentControl;
          mParameters.control = mParameters.parentControl;
        }
      }
      if (bIsCreateAction) {
        mActionExecutionParameters.bIsCreateAction = bIsCreateAction;
      }
      //check for skipping static actions
      const isStatic = (actionDefinition.$Parameter || []).some(aParameter => {
        return (actionDefinition.$EntitySetPath && actionDefinition.$EntitySetPath === aParameter.$Name || actionDefinition.$IsBound) && aParameter.$isCollection;
      });
      mActionExecutionParameters.isStatic = isStatic;
      if (fnDialog) {
        oActionPromise = fnDialog(sActionName, oAppComponent, sActionLabel, mActionExecutionParameters, aActionParameters, aParameterValues, oAction, mParameters.parentControl, mParameters.entitySetName, mParameters.messageHandler, strictHandlingUtilities);
        return oActionPromise.then(function (oOperationResult) {
          afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
          resolve(oOperationResult);
        }).catch(function (oOperationResult) {
          reject(oOperationResult);
        });
      } else {
        // Take over all provided parameter values and call the action.
        // This shall only happen if values are provided for all the parameters, otherwise the parameter dialog shall be shown which is ensured earlier
        if (aParameterValues) {
          for (const i in mActionExecutionParameters.aActionParameters) {
            var _aParameterValues$fin;
            mActionExecutionParameters.aActionParameters[i].value = aParameterValues === null || aParameterValues === void 0 ? void 0 : (_aParameterValues$fin = aParameterValues.find(element => element.name === mActionExecutionParameters.aActionParameters[i].$Name)) === null || _aParameterValues$fin === void 0 ? void 0 : _aParameterValues$fin.value;
          }
        } else {
          for (const i in mActionExecutionParameters.aActionParameters) {
            var _oStartupParameters$m;
            mActionExecutionParameters.aActionParameters[i].value = (_oStartupParameters$m = oStartupParameters[mActionExecutionParameters.aActionParameters[i].$Name]) === null || _oStartupParameters$m === void 0 ? void 0 : _oStartupParameters$m[0];
          }
        }
        let oOperationResult;
        try {
          oOperationResult = await _executeAction(oAppComponent, mActionExecutionParameters, mParameters.parentControl, mParameters.messageHandler, strictHandlingUtilities);
          const messages = Core.getMessageManager().getMessageModel().getData();
          if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
            strictHandlingUtilities.delaySuccessMessages = strictHandlingUtilities.delaySuccessMessages.concat(messages);
          }
          afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
          resolve(oOperationResult);
        } catch {
          reject(oOperationResult);
        } finally {
          var _mParameters$messageH, _mActionExecutionPara;
          if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
            try {
              const strictHandlingFails = strictHandlingUtilities.strictHandlingTransitionFails;
              const aFailedContexts = [];
              strictHandlingFails.forEach(function (fail) {
                aFailedContexts.push(fail.oAction.getContext());
              });
              mActionExecutionParameters.aContexts = aFailedContexts;
              const oFailedOperationResult = await _executeAction(oAppComponent, mActionExecutionParameters, mParameters.parentControl, mParameters.messageHandler, strictHandlingUtilities);
              strictHandlingUtilities.strictHandlingTransitionFails = [];
              Core.getMessageManager().addMessages(strictHandlingUtilities.delaySuccessMessages);
              afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
              resolve(oFailedOperationResult);
            } catch (oFailedOperationResult) {
              reject(oFailedOperationResult);
            }
          }
          let showGenericErrorMessageForChangeSet = false;
          if (mParameters.bGrouped && strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
            showGenericErrorMessageForChangeSet = true;
          }
          mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$messageH = mParameters.messageHandler) === null || _mParameters$messageH === void 0 ? void 0 : _mParameters$messageH.showMessageDialog({
            control: (_mActionExecutionPara = mActionExecutionParameters) === null || _mActionExecutionPara === void 0 ? void 0 : _mActionExecutionPara.control,
            onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
              return actionParameterShowMessageCallback(mParameters, aContexts, undefined, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
            },
            aSelectedContexts: mParameters.aContexts,
            sActionName: sActionLabel
          });
          if (strictHandlingUtilities) {
            strictHandlingUtilities = {
              is412Executed: false,
              strictHandlingTransitionFails: [],
              strictHandlingPromises: [],
              strictHandlingWarningMessages: [],
              delaySuccessMessages: [],
              processedMessageIds: []
            };
          }
        }
      }
    });
  }
  function confirmCriticalAction(sActionName, oAppComponent, sActionLabel, mParameters, aActionParameters, aParameterValues, oActionContext, oParentControl, entitySetName, messageHandler) {
    return new Promise((resolve, reject) => {
      let boundActionName = sActionName ? sActionName : null;
      boundActionName = boundActionName.indexOf(".") >= 0 ? boundActionName.split(".")[boundActionName.split(".").length - 1] : boundActionName;
      const suffixResourceKey = boundActionName && entitySetName ? `${entitySetName}|${boundActionName}` : "";
      const resourceModel = getResourceModel(oParentControl);
      const sConfirmationText = resourceModel.getText("C_OPERATIONS_ACTION_CONFIRM_MESSAGE", undefined, suffixResourceKey);
      MessageBox.confirm(sConfirmationText, {
        onClose: async function (sAction) {
          if (sAction === Action.OK) {
            try {
              const oOperation = await _executeAction(oAppComponent, mParameters, oParentControl, messageHandler);
              resolve(oOperation);
            } catch (oError) {
              try {
                await messageHandler.showMessageDialog();
                reject(oError);
              } catch (e) {
                reject(oError);
              }
            }
          } else {
            resolve(Constants.CancelActionDialog);
          }
        }
      });
    });
  }
  async function executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, after412, strictHandlingUtilities) {
    var _mParameters$aContext;
    const aResult = await _executeAction(oAppComponent, mParameters, oParentControl, messageHandler, strictHandlingUtilities);
    // If some entries were successful, and others have failed, the overall process is still successful. However, this was treated as rejection
    // before, and this currently is still kept, as long as dialog handling is mixed with backend process handling.
    // TODO: Refactor to only reject in case of overall process error.
    // For the time being: map to old logic to reject if at least one entry has failed
    // This check is only done for bound actions => aContexts not empty
    if ((_mParameters$aContext = mParameters.aContexts) !== null && _mParameters$aContext !== void 0 && _mParameters$aContext.length) {
      if (aResult !== null && aResult !== void 0 && aResult.some(oSingleResult => oSingleResult.status === "rejected")) {
        throw aResult;
      }
    }
    const messages = Core.getMessageManager().getMessageModel().getData();
    if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
      if (!after412) {
        strictHandlingUtilities.delaySuccessMessages = strictHandlingUtilities.delaySuccessMessages.concat(messages);
      } else {
        Core.getMessageManager().addMessages(strictHandlingUtilities.delaySuccessMessages);
        let showGenericErrorMessageForChangeSet = false;
        if (mParameters.bGrouped && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
          showGenericErrorMessageForChangeSet = true;
        }
        if (messages.length) {
          // BOUND TRANSITION AS PART OF SAP_MESSAGE
          oDialog.attachEventOnce("afterClose", function () {
            messageHandler.showMessageDialog({
              onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
              },
              control: mParameters.control,
              aSelectedContexts: mParameters.aContexts,
              sActionName: mParameters.label
            });
          });
        }
      }
    } else if (messages.length) {
      // BOUND TRANSITION AS PART OF SAP_MESSAGE
      let showGenericErrorMessageForChangeSet = false;
      if (mParameters.bGrouped && strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
        showGenericErrorMessageForChangeSet = true;
      }
      oDialog.attachEventOnce("afterClose", function () {
        messageHandler.showMessageDialog({
          isActionParameterDialogOpen: mParameters === null || mParameters === void 0 ? void 0 : mParameters.oDialog.isOpen(),
          onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
            return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
          },
          control: mParameters.control,
          aSelectedContexts: mParameters.aContexts,
          sActionName: mParameters.label
        });
      });
    }
    return aResult;
  }
  function afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition) {
    if (mActionExecutionParameters.internalModelContext && mActionExecutionParameters.operationAvailableMap && mActionExecutionParameters.aContexts && mActionExecutionParameters.aContexts.length && actionDefinition.$IsBound) {
      //check for skipping static actions
      const isStatic = mActionExecutionParameters.isStatic;
      if (!isStatic) {
        ActionRuntime.setActionEnablement(mActionExecutionParameters.internalModelContext, JSON.parse(mActionExecutionParameters.operationAvailableMap), mParameters.selectedItems, "table");
      } else if (mActionExecutionParameters.control) {
        const oControl = mActionExecutionParameters.control;
        if (oControl.isA("sap.ui.mdc.Table")) {
          const aSelectedContexts = oControl.getSelectedContexts();
          ActionRuntime.setActionEnablement(mActionExecutionParameters.internalModelContext, JSON.parse(mActionExecutionParameters.operationAvailableMap), aSelectedContexts, "table");
        }
      }
    }
  }
  function actionParameterShowMessageCallback(mParameters, aContexts, oDialog, messages, showMessageParametersIn, showGenericErrorMessageForChangeSet) {
    let showMessageBox = showMessageParametersIn.showMessageBox,
      showMessageDialog = showMessageParametersIn.showMessageDialog;
    const oControl = mParameters.control;
    const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    const unboundMessages = messages.filter(function (message) {
      return message.getTarget() === "";
    });
    const APDmessages = messages.filter(function (message) {
      var _mParameters$aActionP;
      return message.getTarget && message.getTarget().indexOf(mParameters.actionName) !== -1 && (mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$aActionP = mParameters.aActionParameters) === null || _mParameters$aActionP === void 0 ? void 0 : _mParameters$aActionP.some(function (actionParam) {
        return message.getTarget().indexOf(actionParam.$Name) !== -1;
      }));
    });
    APDmessages === null || APDmessages === void 0 ? void 0 : APDmessages.forEach(function (APDMessage) {
      APDMessage.isAPDTarget = true;
    });
    const errorTargetsInAPD = APDmessages.length ? true : false;
    let hasChangeSetModifiedMessage = false;
    if (showGenericErrorMessageForChangeSet && !errorTargetsInAPD) {
      hasChangeSetModifiedMessage = true;
      let sMessage = oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_ERROR_MESSAGES_TEXT");
      let sDescriptionText = oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_ERROR_MESSAGES_DETAIL_TEXT");
      const messageModel = Core.getMessageManager().getMessageModel();
      const messagesInModel = messageModel.getData();
      const aBoundMessages = messageHandling.getMessages(true);
      let genericMessage;
      const isEditable = oControl && oControl.getModel("ui").getProperty("/isEditable");
      const nonErrorMessageExistsInDialog = messages.findIndex(function (message) {
        return message.getType() === "Error" || message.getType() === "Warning";
      });
      const nonErrorMessageExistsInModel = messagesInModel.findIndex(function (message) {
        return message.getType() === "Error" || message.getType() === "Warning";
      });
      if (nonErrorMessageExistsInDialog !== 1 && nonErrorMessageExistsInModel !== -1) {
        if (messagesInModel.length === 1 && aBoundMessages.length === 1) {
          if (isEditable === false) {
            messagesInModel[0].setMessage(oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_SINGLE_ERROR_MESSAGE_TEXT") + "\n\n" + messagesInModel[0].getMessage());
          } else {
            sMessage = isEditable ? oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_SINGLE_ERROR_MESSAGE_TEXT_EDIT") : oResourceBundle.getText("C_COMMON_DIALOG_CANCEL_SINGLE_ERROR_MESSAGE_TEXT");
            sDescriptionText = "";
            genericMessage = new Message({
              message: sMessage,
              type: MessageType.Error,
              target: "",
              persistent: true,
              description: sDescriptionText,
              code: "FE_CUSTOM_MESSAGE_CHANGESET_ALL_FAILED"
            });
            messages.unshift(genericMessage);
            if (messages.length === 1) {
              showMessageBox = true;
              showMessageDialog = false;
            } else {
              showMessageDialog = true;
              showMessageBox = false;
            }
          }
        } else {
          genericMessage = new Message({
            message: sMessage,
            type: MessageType.Error,
            target: "",
            persistent: true,
            description: sDescriptionText,
            code: "FE_CUSTOM_MESSAGE_CHANGESET_ALL_FAILED"
          });
          messages.unshift(genericMessage);
          if (messages.length === 1) {
            showMessageBox = true;
            showMessageDialog = false;
          } else {
            showMessageDialog = true;
            showMessageBox = false;
          }
        }
      }
    }
    if (oDialog && oDialog.isOpen() && aContexts.length !== 0 && !mParameters.isStatic) {
      if (!mParameters.bGrouped) {
        //isolated
        if (aContexts.length > 1 || !errorTargetsInAPD) {
          // does not matter if error is in APD or not, if there are multiple contexts selected or if the error is not the APD, we close it.
          // TODO: Dilaog handling should not be part of message handling. Refactor accordingly - dialog should not be needed inside this method - neither
          // to ask whether it's open, nor to close/destroy it!
          oDialog.close();
          oDialog.destroy();
        }
      } else if (!errorTargetsInAPD) {
        //changeset
        oDialog.close();
        oDialog.destroy();
      }
    }
    let filteredMessages = [];
    const bIsAPDOpen = oDialog && oDialog.isOpen();
    if (!hasChangeSetModifiedMessage) {
      if (messages.length === 1 && messages[0].getTarget && messages[0].getTarget() !== undefined && messages[0].getTarget() !== "") {
        if (oControl && oControl.getModel("ui").getProperty("/isEditable") === false || !oControl) {
          // OP edit or LR
          showMessageBox = !errorTargetsInAPD;
          showMessageDialog = false;
        } else if (oControl && oControl.getModel("ui").getProperty("/isEditable") === true) {
          showMessageBox = false;
          showMessageDialog = false;
        }
      } else if (oControl) {
        if (oControl.getModel("ui").getProperty("/isEditable") === false) {
          if (bIsAPDOpen && errorTargetsInAPD) {
            showMessageDialog = false;
          }
        } else if (oControl.getModel("ui").getProperty("/isEditable") === true) {
          if (!bIsAPDOpen && errorTargetsInAPD) {
            showMessageDialog = true;
            filteredMessages = unboundMessages.concat(APDmessages);
          } else if (!bIsAPDOpen && unboundMessages.length === 0) {
            // error targets in APD => there is atleast one bound message. If there are unbound messages, dialog must be shown.
            // for draft entity, we already closed the APD
            showMessageDialog = false;
          }
        }
      }
    }
    return {
      showMessageBox: showMessageBox,
      showMessageDialog: showMessageDialog,
      filteredMessages: filteredMessages.length ? filteredMessages : messages,
      fnGetMessageSubtitle: oControl && oControl.isA("sap.ui.mdc.Table") && messageHandling.setMessageSubtitle.bind({}, oControl, aContexts),
      showChangeSetErrorDialog: mParameters.bGrouped
    };
  }

  /*
   * Currently, this method is responsible for showing the dialog and executing the action. The promise returned is pending while waiting for user input, as well as while the
   * back-end request is running. The promise is rejected when the user cancels the dialog and also when the back-end request fails.
   * TODO: Refactoring: Separate dialog handling from backend processing. Dialog handling should return a Promise resolving to parameters to be provided to backend. If dialog is
   * cancelled, that promise can be rejected. Method responsible for backend processing need to deal with multiple contexts - i.e. it should either return an array of Promises or
   * a Promise resolving to an array. In the latter case, that Promise should be resolved also when some or even all contexts failed in backend - the overall process still was
   * successful.
   *
   */

  function showActionParameterDialog(sActionName, oAppComponent, sActionLabel, mParameters, aActionParameters, aParameterValues, oActionContext, oParentControl, entitySetName, messageHandler, strictHandlingUtilities) {
    const sPath = _getPath(oActionContext, sActionName),
      metaModel = oActionContext.getModel().oModel.getMetaModel(),
      entitySetContext = metaModel.createBindingContext(sPath),
      sActionNamePath = oActionContext.getObject("$IsBound") ? oActionContext.getPath().split("/@$ui5.overload/0")[0] : oActionContext.getPath().split("/0")[0],
      actionNameContext = metaModel.createBindingContext(sActionNamePath),
      bIsCreateAction = mParameters.isCreateAction,
      sFragmentName = "sap/fe/core/controls/ActionParameterDialog";
    return new Promise(async function (resolve, reject) {
      let actionParameterInfos; // to be filled after fragment (for action parameter dialog) is loaded. Actually only needed during dialog processing, i.e. could be moved into the controller and directly initialized there, but only after moving all handlers (esp. press handler for action button) to controller.

      const messageManager = Core.getMessageManager();
      const _removeMessagesForActionParamter = parameter => {
        const allMessages = messageManager.getMessageModel().getData();
        const controlId = generate(["APD_", parameter.$Name]);
        // also remove messages assigned to inner controls, but avoid removing messages for different paramters (with name being substring of another parameter name)
        const relevantMessages = allMessages.filter(msg => msg.getControlIds().some(id => controlId.split("-").includes(id)));
        messageManager.removeMessages(relevantMessages);
      };
      const oController = {
        handleChange: async function (oEvent) {
          const field = oEvent.getSource();
          const actionParameterInfo = actionParameterInfos.find(actionParameterInfo => actionParameterInfo.field === field);
          // field value is being changed, thus existing messages related to that field are not valid anymore
          _removeMessagesForActionParamter(actionParameterInfo.parameter);
          // adapt info. Promise is resolved to value or rejected with exception containing message
          actionParameterInfo.validationPromise = oEvent.getParameter("promise");
          try {
            actionParameterInfo.value = await actionParameterInfo.validationPromise;
            actionParameterInfo.hasError = false;
          } catch (error) {
            delete actionParameterInfo.value;
            actionParameterInfo.hasError = true;
            _addMessageForActionParameter(messageManager, [{
              actionParameterInfo: actionParameterInfo,
              message: error.message
            }]);
          }
        }
      };
      const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
      const oParameterModel = new JSONModel({
        $displayMode: {}
      });
      try {
        const createdFragment = await XMLPreprocessor.process(oFragment, {
          name: sFragmentName
        }, {
          bindingContexts: {
            action: oActionContext,
            actionName: actionNameContext,
            entitySet: entitySetContext
          },
          models: {
            action: oActionContext.getModel(),
            actionName: actionNameContext.getModel(),
            entitySet: entitySetContext.getModel(),
            metaModel: entitySetContext.getModel()
          }
        });
        // TODO: move the dialog into the fragment and move the handlers to the oController
        const aContexts = mParameters.aContexts || [];
        const aFunctionParams = [];
        // eslint-disable-next-line prefer-const
        let oOperationBinding;
        await CommonUtils.setUserDefaults(oAppComponent, aActionParameters, oParameterModel, true);
        const oDialogContent = await Fragment.load({
          definition: createdFragment,
          controller: oController
        });
        actionParameterInfos = aActionParameters.map(actionParameter => {
          const field = Core.byId(generate(["APD_", actionParameter.$Name]));
          const isMultiValue = field.isA("sap.ui.mdc.MultiValueField");
          return {
            parameter: actionParameter,
            field: field,
            isMultiValue: isMultiValue
          };
        });
        const resourceModel = getResourceModel(oParentControl);
        let actionResult = {
          dialogCancelled: true,
          // to be set to false in case of successful action exection
          result: undefined
        };
        const oDialog = new Dialog(generate(["fe", "APD_", sActionName]), {
          title: sActionLabel || resourceModel.getText("C_OPERATIONS_ACTION_PARAMETER_DIALOG_TITLE"),
          content: [oDialogContent],
          escapeHandler: function () {
            // escape handler is meant to possibly suppress or postpone closing the dialog on escape (by calling "reject" on the provided object, or "resolve" only when
            // done with all tasks to happen before dialog can be closed). It's not intended to explicetly close the dialog here (that happens automatically when no
            // escapeHandler is provided or the resolve-callback is called) or for own wrap up tasks (like removing validition messages - this should happen in the
            // afterClose).
            // TODO: Move wrap up tasks to afterClose, and remove this method completely. Take care to also adapt end button press handler accordingly.
            // Currently only still needed to differentiate closing dialog after successful execution (uses resolve) from user cancellation (using reject)
            oDialog.close();
            //		reject(Constants.CancelActionDialog);
          },

          beginButton: new Button(generate(["fe", "APD_", sActionName, "Action", "Ok"]), {
            text: bIsCreateAction ? resourceModel.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON") : _getActionParameterActionName(resourceModel, sActionLabel, sActionName, entitySetName),
            type: "Emphasized",
            press: async function () {
              try {
                if (!(await _validateProperties(messageManager, actionParameterInfos, resourceModel))) {
                  return;
                }
                BusyLocker.lock(oDialog);
                try {
                  // TODO: due to using the search and value helps on the action dialog transient messages could appear
                  // we need an UX design for those to show them to the user - for now remove them before continuing
                  messageHandler.removeTransitionMessages();
                  // move parameter values from Dialog (SimpleForm) to mParameters.actionParameters so that they are available in the operation bindings for all contexts
                  let vParameterValue;
                  const oParameterContext = oOperationBinding && oOperationBinding.getParameterContext();
                  for (const i in aActionParameters) {
                    if (aActionParameters[i].$isCollection) {
                      const aMVFContent = oDialog.getModel("mvfview").getProperty(`/${aActionParameters[i].$Name}`),
                        aKeyValues = [];
                      for (const j in aMVFContent) {
                        aKeyValues.push(aMVFContent[j].Key);
                      }
                      vParameterValue = aKeyValues;
                    } else {
                      vParameterValue = oParameterContext.getProperty(aActionParameters[i].$Name);
                    }
                    aActionParameters[i].value = vParameterValue; // writing the current value (ueser input!) into the metamodel => should be refactored to use ActionParameterInfos instead. Used in setActionParameterDefaultValue
                    vParameterValue = undefined;
                  }
                  mParameters.label = sActionLabel;
                  try {
                    const aResult = await executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, false, strictHandlingUtilities);
                    actionResult = {
                      dialogCancelled: false,
                      result: aResult
                    };
                    oDialog.close();
                    // resolve(aResult);
                  } catch (oError) {
                    const messages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
                    if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
                      strictHandlingUtilities.delaySuccessMessages = strictHandlingUtilities.delaySuccessMessages.concat(messages);
                    }
                    throw oError;
                  } finally {
                    if (strictHandlingUtilities && strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
                      try {
                        const strictHandlingFails = strictHandlingUtilities.strictHandlingTransitionFails;
                        const aFailedContexts = [];
                        strictHandlingFails.forEach(function (fail) {
                          aFailedContexts.push(fail.oAction.getContext());
                        });
                        mParameters.aContexts = aFailedContexts;
                        const aResult = await executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, true, strictHandlingUtilities);
                        strictHandlingUtilities.strictHandlingTransitionFails = [];
                        actionResult = {
                          dialogCancelled: false,
                          result: aResult
                        };
                        // resolve(aResult);
                      } catch {
                        if (strictHandlingUtilities.is412Executed && strictHandlingUtilities.strictHandlingTransitionFails.length) {
                          Core.getMessageManager().addMessages(strictHandlingUtilities.delaySuccessMessages);
                        }
                        let showGenericErrorMessageForChangeSet = false;
                        if (mParameters.bGrouped && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
                          showGenericErrorMessageForChangeSet = true;
                        }
                        await messageHandler.showMessageDialog({
                          isActionParameterDialogOpen: oDialog.isOpen(),
                          onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                            return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
                          },
                          aSelectedContexts: mParameters.aContexts,
                          sActionName: sActionLabel
                        });
                      }
                    }
                    if (BusyLocker.isLocked(oDialog)) {
                      BusyLocker.unlock(oDialog);
                    }
                  }
                } catch (oError) {
                  let showMessageDialog = true;
                  let showGenericErrorMessageForChangeSet = false;
                  if (mParameters.bGrouped && strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length || checkforOtherMessages(mParameters.bGrouped) !== -1) {
                    showGenericErrorMessageForChangeSet = true;
                  }
                  await messageHandler.showMessages({
                    context: mParameters.aContexts[0],
                    isActionParameterDialogOpen: oDialog.isOpen(),
                    messagePageNavigationCallback: function () {
                      oDialog.close();
                    },
                    onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                      // Why is this implemented as callback? Apparently, all needed information is available beforehand
                      // TODO: refactor accordingly
                      const showMessageParameters = actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn, showGenericErrorMessageForChangeSet);
                      showMessageDialog = showMessageParameters.showMessageDialog;
                      return showMessageParameters;
                    },
                    aSelectedContexts: mParameters.aContexts,
                    sActionName: sActionLabel,
                    control: mParameters.control
                  });

                  // In case of backend validation error(s?), message shall not be shown in message dialog but next to the field on parameter dialog, which should
                  // stay open in this case => in this case, we must not resolve or reject the promise controlling the parameter dialog.
                  // In all other cases (e.g. other backend errors or user cancellation), the promise controlling the parameter dialog needs to be rejected to allow
                  // callers to react. (Example: If creation in backend after navigation to transient context fails, back navigation needs to be triggered)
                  // TODO: Refactor to separate dialog handling from backend request istead of taking decision based on message handling
                  if (showMessageDialog) {
                    if (oDialog.isOpen()) {
                      // do nothing, do not reject promise here
                      // We do not close the APM dialog if user enters a wrong value in of the fields that results in an error from the backend.
                      // The user can close the message dialog and the APM dialog would still be open on which he could enter a new value and trigger the action again.
                      // Earlier we were rejecting the promise on error here, and the call stack was destroyed as the promise was rejected and returned to EditFlow invoke action.
                      // But since the APM dialog was still open, a new promise was resolved in case the user retried the action and the object was created, but the navigation to object page was not taking place.
                    } else {
                      reject(oError);
                    }
                  }
                }
              } finally {
                if (strictHandlingUtilities) {
                  strictHandlingUtilities = {
                    is412Executed: false,
                    strictHandlingTransitionFails: [],
                    strictHandlingPromises: [],
                    strictHandlingWarningMessages: [],
                    delaySuccessMessages: [],
                    processedMessageIds: []
                  };
                }
                if (BusyLocker.isLocked(oDialog)) {
                  BusyLocker.unlock(oDialog);
                }
              }
            }
          }),
          endButton: new Button(generate(["fe", "APD_", sActionName, "Action", "Cancel"]), {
            text: resourceModel.getText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL"),
            press: function () {
              // TODO: cancel button should just close the dialog (similar to using escape). All wrap up tasks should be moved to afterClose.
              oDialog.close();
              // reject(Constants.CancelActionDialog);
            }
          }),

          // TODO: beforeOpen is just an event, i.e. not waiting for the Promise to be resolved. Check if tasks of this function need to be done before opening the dialog
          // - if yes, they need to be moved outside.
          // Assumption: Sometimes dialog can be seen without any fields for a short time - maybe this is caused by this asynchronity
          beforeOpen: async function (oEvent) {
            // clone event for actionWrapper as oEvent.oSource gets lost during processing of beforeOpen event handler
            const oCloneEvent = Object.assign({}, oEvent);
            messageHandler.removeTransitionMessages();
            const getDefaultValuesFunction = function () {
              const oMetaModel = oDialog.getModel().getMetaModel(),
                sActionPath = oActionContext.sPath && oActionContext.sPath.split("/@")[0],
                sDefaultValuesFunction = oMetaModel.getObject(`${sActionPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`);
              return sDefaultValuesFunction;
            };
            const fnSetDefaultsAndOpenDialog = async function (sBindingParameter) {
              const sBoundFunctionName = getDefaultValuesFunction();
              const prefillParameter = async function (sParamName, vParamDefaultValue) {
                // Case 1: There is a ParameterDefaultValue annotation
                if (vParamDefaultValue !== undefined) {
                  if (aContexts.length > 0 && vParamDefaultValue.$Path) {
                    try {
                      let vParamValue = await CommonUtils.requestSingletonProperty(vParamDefaultValue.$Path, oOperationBinding.getModel());
                      if (vParamValue === null) {
                        vParamValue = await oOperationBinding.getParameterContext().requestProperty(vParamDefaultValue.$Path);
                      }
                      if (aContexts.length > 1) {
                        // For multi select, need to loop over aContexts (as contexts cannot be retrieved via binding parameter of the operation binding)
                        let sPathForContext = vParamDefaultValue.$Path;
                        if (sPathForContext.indexOf(`${sBindingParameter}/`) === 0) {
                          sPathForContext = sPathForContext.replace(`${sBindingParameter}/`, "");
                        }
                        for (let i = 1; i < aContexts.length; i++) {
                          if (aContexts[i].getProperty(sPathForContext) !== vParamValue) {
                            // if the values from the contexts are not all the same, do not prefill
                            return {
                              paramName: sParamName,
                              value: undefined,
                              bNoPossibleValue: true
                            };
                          }
                        }
                      }
                      return {
                        paramName: sParamName,
                        value: vParamValue
                      };
                    } catch (oError) {
                      Log.error("Error while reading default action parameter", sParamName, mParameters.actionName);
                      return {
                        paramName: sParamName,
                        value: undefined,
                        bLatePropertyError: true
                      };
                    }
                  } else {
                    // Case 1.2: ParameterDefaultValue defines a fixed string value (i.e. vParamDefaultValue = 'someString')
                    return {
                      paramName: sParamName,
                      value: vParamDefaultValue
                    };
                  }
                } else if (oParameterModel && oParameterModel.oData[sParamName]) {
                  // Case 2: There is no ParameterDefaultValue annotation (=> look into the FLP User Defaults)

                  return {
                    paramName: sParamName,
                    value: oParameterModel.oData[sParamName]
                  };
                } else {
                  return {
                    paramName: sParamName,
                    value: undefined
                  };
                }
              };
              const getParameterDefaultValue = function (sParamName) {
                const oMetaModel = oDialog.getModel().getMetaModel(),
                  sActionParameterAnnotationPath = CommonUtils.getParameterPath(oActionContext.getPath(), sParamName) + "@",
                  oParameterAnnotations = oMetaModel.getObject(sActionParameterAnnotationPath),
                  oParameterDefaultValue = oParameterAnnotations && oParameterAnnotations["@com.sap.vocabularies.UI.v1.ParameterDefaultValue"]; // either { $Path: 'somePath' } or 'someString'
                return oParameterDefaultValue;
              };
              const aCurrentParamDefaultValue = [];
              let sParamName, vParameterDefaultValue;
              for (const i in aActionParameters) {
                sParamName = aActionParameters[i].$Name;
                vParameterDefaultValue = getParameterDefaultValue(sParamName);
                aCurrentParamDefaultValue.push(prefillParameter(sParamName, vParameterDefaultValue));
              }
              if (oActionContext.getObject("$IsBound") && aContexts.length > 0) {
                if (sBoundFunctionName && sBoundFunctionName.length > 0 && typeof sBoundFunctionName === "string") {
                  for (const i in aContexts) {
                    aFunctionParams.push(callBoundFunction(sBoundFunctionName, aContexts[i], mParameters.model));
                  }
                }
              }
              const aPrefillParamPromises = Promise.all(aCurrentParamDefaultValue);
              let aExecFunctionPromises = Promise.resolve([]);
              let oExecFunctionFromManifestPromise;
              if (aFunctionParams && aFunctionParams.length > 0) {
                aExecFunctionPromises = Promise.all(aFunctionParams);
              }
              if (mParameters.defaultValuesExtensionFunction) {
                const sModule = mParameters.defaultValuesExtensionFunction.substring(0, mParameters.defaultValuesExtensionFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
                  sFunctionName = mParameters.defaultValuesExtensionFunction.substring(mParameters.defaultValuesExtensionFunction.lastIndexOf(".") + 1, mParameters.defaultValuesExtensionFunction.length);
                oExecFunctionFromManifestPromise = FPMHelper.actionWrapper(oCloneEvent, sModule, sFunctionName, {
                  contexts: aContexts
                });
              }
              try {
                const aPromises = await Promise.all([aPrefillParamPromises, aExecFunctionPromises, oExecFunctionFromManifestPromise]);
                const currentParamDefaultValue = aPromises[0];
                const functionParams = aPromises[1];
                const oFunctionParamsFromManifest = aPromises[2];
                let sDialogParamName;

                // Fill the dialog with the earlier determined parameter values from the different sources
                for (const i in aActionParameters) {
                  var _aParameterValues$fin2;
                  sDialogParamName = aActionParameters[i].$Name;
                  // Parameter values provided in the call of invokeAction overrule other sources
                  const vParameterProvidedValue = aParameterValues === null || aParameterValues === void 0 ? void 0 : (_aParameterValues$fin2 = aParameterValues.find(element => element.name === aActionParameters[i].$Name)) === null || _aParameterValues$fin2 === void 0 ? void 0 : _aParameterValues$fin2.value;
                  if (vParameterProvidedValue) {
                    oOperationBinding.setParameter(aActionParameters[i].$Name, vParameterProvidedValue);
                  } else if (oFunctionParamsFromManifest && oFunctionParamsFromManifest.hasOwnProperty(sDialogParamName)) {
                    oOperationBinding.setParameter(aActionParameters[i].$Name, oFunctionParamsFromManifest[sDialogParamName]);
                  } else if (currentParamDefaultValue[i] && currentParamDefaultValue[i].value !== undefined) {
                    oOperationBinding.setParameter(aActionParameters[i].$Name, currentParamDefaultValue[i].value);
                    // if the default value had not been previously determined due to different contexts, we do nothing else
                  } else if (sBoundFunctionName && !currentParamDefaultValue[i].bNoPossibleValue) {
                    if (aContexts.length > 1) {
                      // we check if the function retrieves the same param value for all the contexts:
                      let j = 0;
                      while (j < aContexts.length - 1) {
                        if (functionParams[j] && functionParams[j + 1] && functionParams[j].getObject(sDialogParamName) === functionParams[j + 1].getObject(sDialogParamName)) {
                          j++;
                        } else {
                          break;
                        }
                      }
                      //param values are all the same:
                      if (j === aContexts.length - 1) {
                        oOperationBinding.setParameter(aActionParameters[i].$Name, functionParams[j].getObject(sDialogParamName));
                      }
                    } else if (functionParams[0] && functionParams[0].getObject(sDialogParamName)) {
                      //Only one context, then the default param values are to be verified from the function:

                      oOperationBinding.setParameter(aActionParameters[i].$Name, functionParams[0].getObject(sDialogParamName));
                    }
                  }
                }
                const bErrorFound = currentParamDefaultValue.some(function (oValue) {
                  if (oValue.bLatePropertyError) {
                    return oValue.bLatePropertyError;
                  }
                });
                // If at least one Default Property is a Late Property and an eTag error was raised.
                if (bErrorFound) {
                  const sText = resourceModel.getText("C_APP_COMPONENT_SAPFE_ETAG_LATE_PROPERTY");
                  MessageBox.warning(sText, {
                    contentWidth: "25em"
                  });
                }
              } catch (oError) {
                Log.error("Error while retrieving the parameter", oError);
              }
            };
            const fnAsyncBeforeOpen = async function () {
              if (oActionContext.getObject("$IsBound") && aContexts.length > 0) {
                const aParameters = oActionContext.getObject("$Parameter");
                const sBindingParameter = aParameters[0] && aParameters[0].$Name;
                try {
                  const oContextObject = await aContexts[0].requestObject();
                  if (oContextObject) {
                    oOperationBinding.setParameter(sBindingParameter, oContextObject);
                  }
                  await fnSetDefaultsAndOpenDialog(sBindingParameter);
                } catch (oError) {
                  Log.error("Error while retrieving the parameter", oError);
                }
              } else {
                await fnSetDefaultsAndOpenDialog();
              }
            };
            await fnAsyncBeforeOpen();

            // adding defaulted values only here after they are not set to the fields
            for (const actionParameterInfo of actionParameterInfos) {
              const value = actionParameterInfo.isMultiValue ? actionParameterInfo.field.getItems() : actionParameterInfo.field.getValue();
              actionParameterInfo.value = value;
              actionParameterInfo.validationPromise = Promise.resolve(value);
            }
          },
          afterClose: function () {
            // when the dialog is cancelled, messages need to be removed in case the same action should be executed again
            aActionParameters.forEach(_removeMessagesForActionParamter);
            oDialog.destroy();
            if (actionResult.dialogCancelled) {
              reject(Constants.CancelActionDialog);
            } else {
              resolve(actionResult.result);
            }
          }
        });
        mParameters.oDialog = oDialog;
        oDialog.setModel(oActionContext.getModel().oModel);
        oDialog.setModel(oParameterModel, "paramsModel");
        oDialog.bindElement({
          path: "/",
          model: "paramsModel"
        });

        // empty model to add elements dynamically depending on number of MVF fields defined on the dialog
        const oMVFModel = new JSONModel({});
        oDialog.setModel(oMVFModel, "mvfview");

        /* Event needed for removing messages of valid changed field */
        for (const actionParameterInfo of actionParameterInfos) {
          if (actionParameterInfo.isMultiValue) {
            var _actionParameterInfo$, _actionParameterInfo$2;
            actionParameterInfo === null || actionParameterInfo === void 0 ? void 0 : (_actionParameterInfo$ = actionParameterInfo.field) === null || _actionParameterInfo$ === void 0 ? void 0 : (_actionParameterInfo$2 = _actionParameterInfo$.getBinding("items")) === null || _actionParameterInfo$2 === void 0 ? void 0 : _actionParameterInfo$2.attachChange(() => {
              _removeMessagesForActionParamter(actionParameterInfo.parameter);
            });
          } else {
            var _actionParameterInfo$3, _actionParameterInfo$4;
            actionParameterInfo === null || actionParameterInfo === void 0 ? void 0 : (_actionParameterInfo$3 = actionParameterInfo.field) === null || _actionParameterInfo$3 === void 0 ? void 0 : (_actionParameterInfo$4 = _actionParameterInfo$3.getBinding("value")) === null || _actionParameterInfo$4 === void 0 ? void 0 : _actionParameterInfo$4.attachChange(() => {
              _removeMessagesForActionParamter(actionParameterInfo.parameter);
            });
          }
        }
        let sActionPath = `${sActionName}(...)`;
        if (!aContexts.length) {
          sActionPath = `/${sActionPath}`;
        }
        oDialog.bindElement({
          path: sActionPath
        });
        if (oParentControl) {
          // if there is a parent control specified add the dialog as dependent
          oParentControl.addDependent(oDialog);
        }
        if (aContexts.length > 0) {
          oDialog.setBindingContext(aContexts[0]); // use context of first selected line item
        }

        oOperationBinding = oDialog.getObjectBinding();
        oDialog.open();
      } catch (oError) {
        reject(oError);
      }
    });
  }
  function getActionParameters(oAction) {
    const aParameters = oAction.getObject("$Parameter") || [];
    if (aParameters && aParameters.length) {
      if (oAction.getObject("$IsBound")) {
        //in case of bound actions, ignore the first parameter and consider the rest
        return aParameters.slice(1, aParameters.length) || [];
      }
    }
    return aParameters;
  }
  function getIsActionCritical(oMetaModel, sPath, contexts, oBoundAction) {
    const vActionCritical = oMetaModel.getObject(`${sPath}@com.sap.vocabularies.Common.v1.IsActionCritical`);
    let sCriticalPath = vActionCritical && vActionCritical.$Path;
    if (!sCriticalPath) {
      // the static value scenario for isActionCritical
      return !!vActionCritical;
    }
    const aBindingParams = oBoundAction && oBoundAction.getObject("$Parameter"),
      aPaths = sCriticalPath && sCriticalPath.split("/"),
      bCondition = aBindingParams && aBindingParams.length && typeof aBindingParams === "object" && sCriticalPath && contexts && contexts.length;
    if (bCondition) {
      //in case binding patameters are there in path need to remove eg: - _it/isVerified => need to remove _it and the path should be isVerified
      aBindingParams.filter(function (oParams) {
        const index = aPaths && aPaths.indexOf(oParams.$Name);
        if (index > -1) {
          aPaths.splice(index, 1);
        }
      });
      sCriticalPath = aPaths.join("/");
      return contexts[0].getObject(sCriticalPath);
    } else if (sCriticalPath) {
      //if scenario is path based return the path value
      return contexts[0].getObject(sCriticalPath);
    }
  }
  function _getActionParameterActionName(resourceModel, sActionLabel, sActionName, sEntitySetName) {
    let boundActionName = sActionName ? sActionName : null;
    const aActionName = boundActionName.split(".");
    boundActionName = boundActionName.indexOf(".") >= 0 ? aActionName[aActionName.length - 1] : boundActionName;
    const suffixResourceKey = boundActionName && sEntitySetName ? `${sEntitySetName}|${boundActionName}` : "";
    const sKey = "ACTION_PARAMETER_DIALOG_ACTION_NAME";
    const bResourceKeyExists = resourceModel.checkIfResourceKeyExists(`${sKey}|${suffixResourceKey}`);
    if (sActionLabel) {
      if (bResourceKeyExists) {
        return resourceModel.getText(sKey, undefined, suffixResourceKey);
      } else if (resourceModel.checkIfResourceKeyExists(`${sKey}|${sEntitySetName}`)) {
        return resourceModel.getText(sKey, undefined, `${sEntitySetName}`);
      } else if (resourceModel.checkIfResourceKeyExists(`${sKey}`)) {
        return resourceModel.getText(sKey);
      } else {
        return sActionLabel;
      }
    } else {
      return resourceModel.getText("C_COMMON_DIALOG_OK");
    }
  }
  function executeDependingOnSelectedContexts(oAction, mParameters, bGetBoundContext, sGroupId, resourceModel, messageHandler, iContextLength, current_context_index, internalOperationsPromiseResolve, internalOperationsPromiseReject, strictHandlingUtilities) {
    let oActionPromise,
      bEnableStrictHandling = true;
    if (mParameters) {
      mParameters.internalOperationsPromiseResolve = internalOperationsPromiseResolve;
    }
    if (bGetBoundContext) {
      var _oProperty$;
      const sPath = oAction.getBoundContext().getPath();
      const sMetaPath = oAction.getModel().getMetaModel().getMetaPath(sPath);
      const oProperty = oAction.getModel().getMetaModel().getObject(sMetaPath);
      if (oProperty && ((_oProperty$ = oProperty[0]) === null || _oProperty$ === void 0 ? void 0 : _oProperty$.$kind) !== "Action") {
        //do not enable the strict handling if its not an action
        bEnableStrictHandling = false;
      }
    }
    if (!bEnableStrictHandling) {
      oActionPromise = oAction.execute(sGroupId).then(function () {
        internalOperationsPromiseResolve(oAction.getBoundContext());
        return oAction.getBoundContext();
      });
    } else {
      oActionPromise = bGetBoundContext ? oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, mParameters, resourceModel, current_context_index, oAction.getContext(), iContextLength, messageHandler, strictHandlingUtilities)).then(function () {
        if (strictHandlingUtilities && !mParameters.bGrouped) {
          update412TransistionMessages(oAction, sGroupId, strictHandlingUtilities, mParameters);
        }
        internalOperationsPromiseResolve(oAction.getBoundContext());
        return oAction.getBoundContext();
      }).catch(function () {
        if (strictHandlingUtilities && !mParameters.bGrouped) {
          update412TransistionMessages(oAction, sGroupId, strictHandlingUtilities, mParameters);
        }
        internalOperationsPromiseReject();
        return Promise.reject();
      }) : oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, mParameters, resourceModel, current_context_index, oAction.getContext(), iContextLength, messageHandler, strictHandlingUtilities)).then(function (result) {
        if (strictHandlingUtilities && !mParameters.bGrouped) {
          update412TransistionMessages(oAction, sGroupId, strictHandlingUtilities, mParameters);
        }
        internalOperationsPromiseResolve(result);
        return result;
      }).catch(function () {
        if (strictHandlingUtilities && !mParameters.bGrouped) {
          update412TransistionMessages(oAction, sGroupId, strictHandlingUtilities, mParameters);
        }
        internalOperationsPromiseReject();
        return Promise.reject();
      });
    }
    return oActionPromise.catch(() => {
      throw Constants.ActionExecutionFailed;
    });
  }
  /**
   * Updates the strictHandlingUtilites with the failed and successful transisition messages.
   *
   * @function
   * @static
   * @name update412TransistionMessages
   * @param oAction Action executed
   * @param sGroupId GroupId of the batch
   * @param [mParameters] Optional, contains attributes related to strickHandling
   * @param [strictHandlingUtilities] Optional, utility flags and messages for strictHandling
   * @returns Updated StrictHandlingUtilties
   * @private
   */
  function update412TransistionMessages(oAction, sGroupId, strictHandlingUtilities, mParameters) {
    const messages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
    let {
      processedMessageIds,
      delaySuccessMessages,
      strictHandlingTransitionFails
    } = strictHandlingUtilities;
    const transitionMessages = messages.filter(function (message) {
      //check if the transistion messages is already processed
      const isDuplicate = processedMessageIds.find(function (id) {
        return message.id === id;
      });
      // update the strictHandling with the success messages which needs to be shown later
      if (!isDuplicate) {
        processedMessageIds.push(message.id);
        if (message.type === MessageType.Success) {
          delaySuccessMessages.push(message);
        }
      }
      return message.persistent === true && message.type !== MessageType.Success && !isDuplicate;
    });
    //update the strictHandlingUtilites with the failed transistion messages which needs to be retriggered
    if (transitionMessages.length) {
      if (mParameters !== null && mParameters !== void 0 && mParameters.internalModelContext) {
        strictHandlingTransitionFails.push({
          oAction: oAction,
          groupId: sGroupId
        });
      }
    }
  }
  function createinternalOperationsPromiseForActionExecution() {
    let internalOperationsPromiseResolve = null,
      internalOperationsPromiseReject = null;
    const oLocalActionPromise = new Promise(function (resolve, reject) {
      internalOperationsPromiseResolve = resolve;
      internalOperationsPromiseReject = reject;
    }).catch(function (oError) {
      Log.error("Error while executing action ", oError);
    });
    return {
      oLocalActionPromise,
      internalOperationsPromiseResolve,
      internalOperationsPromiseReject
    };
  }
  function checkforOtherMessages(isChangeSet) {
    if (isChangeSet) {
      const aMessages = messageHandling.getMessages();
      return aMessages.findIndex(function (message) {
        return message.getType() === "Error" || message.getType() === "Warning";
      });
    }
    return -1;
  }
  function _executeAction(oAppComponent, mParameters, oParentControl, messageHandler, strictHandlingUtilities) {
    const aContexts = mParameters.aContexts || [];
    const oModel = mParameters.model;
    const aActionParameters = mParameters.aActionParameters || [];
    const sActionName = mParameters.actionName;
    const fnOnSubmitted = mParameters.fnOnSubmitted;
    const fnOnResponse = mParameters.fnOnResponse;
    const resourceModel = getResourceModel(oParentControl);
    let oAction;
    function setActionParameterDefaultValue() {
      if (aActionParameters && aActionParameters.length) {
        for (let j = 0; j < aActionParameters.length; j++) {
          if (!aActionParameters[j].value) {
            switch (aActionParameters[j].$Type) {
              case "Edm.String":
                aActionParameters[j].value = "";
                break;
              case "Edm.Boolean":
                aActionParameters[j].value = false;
                break;
              case "Edm.Byte":
              case "Edm.Int16":
              case "Edm.Int32":
              case "Edm.Int64":
                aActionParameters[j].value = 0;
                break;
              // tbc
              default:
                break;
            }
          }
          oAction.setParameter(aActionParameters[j].$Name, aActionParameters[j].value);
        }
      }
    }
    if (aContexts.length) {
      // TODO: refactor to direct use of Promise.allSettled
      return new Promise(function (resolve) {
        const mBindingParameters = mParameters.mBindingParameters;
        const bGrouped = mParameters.bGrouped;
        const bGetBoundContext = mParameters.bGetBoundContext;
        const aActionPromises = [];
        let oActionPromise;
        let i;
        let sGroupId;
        const ointernalOperationsPromiseObject = createinternalOperationsPromiseForActionExecution();
        const fnExecuteAction = function (actionContext, current_context_index, oSideEffect, iContextLength) {
          setActionParameterDefaultValue();
          const individualActionPromise = [];
          // For invocation grouping "isolated" need batch group per action call
          sGroupId = !bGrouped ? `$auto.${current_context_index}` : actionContext.getUpdateGroupId();
          mParameters.requestSideEffects = fnRequestSideEffects.bind(operations, oAppComponent, oSideEffect, mParameters, sGroupId, individualActionPromise);
          oActionPromise = executeDependingOnSelectedContexts(actionContext, mParameters, bGetBoundContext, sGroupId, resourceModel, messageHandler, iContextLength, current_context_index, ointernalOperationsPromiseObject.internalOperationsPromiseResolve, ointernalOperationsPromiseObject.internalOperationsPromiseReject, strictHandlingUtilities);
          aActionPromises.push(oActionPromise);
          individualActionPromise.push(ointernalOperationsPromiseObject.oLocalActionPromise);
          fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, individualActionPromise);
          return Promise.allSettled(individualActionPromise);
        };
        const fnExecuteSingleAction = function (actionContext, current_context_index, oSideEffect, iContextLength) {
          const individualActionPromise = [];
          setActionParameterDefaultValue();
          // For invocation grouping "isolated" need batch group per action call
          sGroupId = `apiMode${current_context_index}`;
          mParameters.requestSideEffects = fnRequestSideEffects.bind(operations, oAppComponent, oSideEffect, mParameters, sGroupId, individualActionPromise);
          oActionPromise = executeDependingOnSelectedContexts(actionContext, mParameters, bGetBoundContext, sGroupId, resourceModel, messageHandler, iContextLength, current_context_index, ointernalOperationsPromiseObject.internalOperationsPromiseResolve, ointernalOperationsPromiseObject.internalOperationsPromiseReject, strictHandlingUtilities);
          aActionPromises.push(oActionPromise);
          individualActionPromise.push(ointernalOperationsPromiseObject.oLocalActionPromise);
          fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, individualActionPromise);
          oModel.submitBatch(sGroupId);
          return Promise.allSettled(individualActionPromise);
        };
        async function fnExecuteChangeset() {
          const aChangeSetLocalPromises = [];
          for (i = 0; i < aContexts.length; i++) {
            oAction = oModel.bindContext(`${sActionName}(...)`, aContexts[i], mBindingParameters);
            aChangeSetLocalPromises.push(fnExecuteAction(oAction, aContexts.length <= 1 ? null : i, {
              context: aContexts[i],
              pathExpressions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions,
              triggerActions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.triggerActions
            }, aContexts.length));
          }
          (fnOnSubmitted || function noop() {
            /**/
          })(aActionPromises);
          await Promise.allSettled(aChangeSetLocalPromises);
          if (strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length) {
            try {
              const otherErrorMessageIndex = checkforOtherMessages(true);
              if (otherErrorMessageIndex === -1) {
                await operationsHelper.renderMessageView(mParameters, resourceModel, messageHandler, strictHandlingUtilities.strictHandlingWarningMessages, strictHandlingUtilities, aContexts.length > 1);
              } else {
                strictHandlingUtilities.strictHandlingPromises.forEach(function (shPromise) {
                  shPromise.resolve(false);
                });
                const messageModel = Core.getMessageManager().getMessageModel();
                const messagesInModel = messageModel.getData();
                messageModel.setData(messagesInModel.concat(strictHandlingUtilities.strictHandlingWarningMessages));
              }
            } catch {
              Log.error("Retriggering of strict handling actions failed");
            }
          }
          fnHandleResults();
        }
        async function fnExecuteSequentially(contextsToExecute) {
          // One action and its side effects are completed before the next action is executed
          (fnOnSubmitted || function noop() {
            /**/
          })(aActionPromises);
          function processOneAction(context, actionIndex, iContextLength) {
            oAction = oModel.bindContext(`${sActionName}(...)`, context, mBindingParameters);
            return fnExecuteSingleAction(oAction, actionIndex, {
              context: context,
              pathExpressions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions,
              triggerActions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.triggerActions
            }, iContextLength);
          }

          // serialization: processOneAction to be called for each entry in contextsToExecute only after the promise returned from the one before has been resolved
          await contextsToExecute.reduce(async (promise, context, id) => {
            await promise;
            await processOneAction(context, id + 1, aContexts.length);
          }, Promise.resolve());
          if (strictHandlingUtilities && strictHandlingUtilities.strictHandlingPromises.length) {
            await operationsHelper.renderMessageView(mParameters, resourceModel, messageHandler, strictHandlingUtilities.strictHandlingWarningMessages, strictHandlingUtilities, aContexts.length > 1);
          }
          fnHandleResults();
        }
        if (!bGrouped) {
          // For invocation grouping "isolated", ensure that each action and matching side effects
          // are processed before the next set is submitted. Workaround until JSON batch is available.
          // Allow also for List Report.
          fnExecuteSequentially(aContexts);
        } else {
          fnExecuteChangeset();
        }
        function fnHandleResults() {
          // Promise.allSettled will never be rejected. However, eslint requires either catch or return - thus we return the resulting Promise although no one will use it.
          return Promise.allSettled(aActionPromises).then(resolve);
        }
      }).finally(function () {
        (fnOnResponse || function noop() {
          /**/
        })();
      });
    } else {
      oAction = oModel.bindContext(`/${sActionName}(...)`);
      setActionParameterDefaultValue();
      const sGroupId = "actionImport";
      const oActionPromise = oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, {
        label: mParameters.label,
        model: oModel
      }, resourceModel, null, null, null, messageHandler, strictHandlingUtilities));
      oModel.submitBatch(sGroupId);
      // trigger onSubmitted "event"
      (fnOnSubmitted || function noop() {
        /**/
      })(oActionPromise);
      return oActionPromise.then(function (currentPromiseValue) {
        // Here we ensure that we return the response we got from an unbound action to the
        // caller BCP : 2270139279
        if (currentPromiseValue) {
          return currentPromiseValue;
        } else {
          var _oAction$getBoundCont, _oAction, _oAction$getBoundCont2;
          return (_oAction$getBoundCont = (_oAction = oAction).getBoundContext) === null || _oAction$getBoundCont === void 0 ? void 0 : (_oAction$getBoundCont2 = _oAction$getBoundCont.call(_oAction)) === null || _oAction$getBoundCont2 === void 0 ? void 0 : _oAction$getBoundCont2.getObject();
        }
      }).catch(function (oError) {
        Log.error("Error while executing action " + sActionName, oError);
        throw oError;
      }).finally(function () {
        (fnOnResponse || function noop() {
          /**/
        })();
      });
    }
  }
  function _getPath(oActionContext, sActionName) {
    let sPath = oActionContext.getPath();
    sPath = oActionContext.getObject("$IsBound") ? sPath.split("@$ui5.overload")[0] : sPath.split("/0")[0];
    return sPath.split(`/${sActionName}`)[0];
  }
  function _valuesProvidedForAllParameters(isCreateAction, actionParameters, parameterValues, startupParameters) {
    if (parameterValues) {
      // If showDialog is false but there are parameters from the invokeAction call, we need to check that values have been
      // provided for all of them
      for (const actionParameter of actionParameters) {
        if (actionParameter.$Name !== "ResultIsActiveEntity" && !(parameterValues !== null && parameterValues !== void 0 && parameterValues.find(element => element.name === actionParameter.$Name))) {
          // At least for one parameter no value has been provided, so we can't skip the dialog
          return false;
        }
      }
    } else if (isCreateAction && startupParameters) {
      // If parameters have been provided during application launch, we need to check if the set is complete
      // If not, the parameter dialog still needs to be shown.
      for (const actionParameter of actionParameters) {
        if (!startupParameters[actionParameter.$Name]) {
          // At least for one parameter no value has been provided, so we can't skip the dialog
          return false;
        }
      }
    }
    return true;
  }
  function fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, aLocalPromise) {
    const oSideEffectsService = oAppComponent.getSideEffectsService();
    let oLocalPromise;
    // trigger actions from side effects
    if (oSideEffect && oSideEffect.triggerActions && oSideEffect.triggerActions.length) {
      oSideEffect.triggerActions.forEach(function (sTriggerAction) {
        if (sTriggerAction) {
          oLocalPromise = oSideEffectsService.executeAction(sTriggerAction, oSideEffect.context, sGroupId);
          if (aLocalPromise) {
            aLocalPromise.push(oLocalPromise);
          }
        }
      });
    }
    // request side effects for this action
    // as we move the messages request to POST $select we need to be prepared for an empty array
    if (oSideEffect && oSideEffect.pathExpressions && oSideEffect.pathExpressions.length > 0) {
      oLocalPromise = oSideEffectsService.requestSideEffects(oSideEffect.pathExpressions, oSideEffect.context, sGroupId);
      if (aLocalPromise) {
        aLocalPromise.push(oLocalPromise);
      }
      oLocalPromise.then(function () {
        if (mParameters.operationAvailableMap && mParameters.internalModelContext) {
          ActionRuntime.setActionEnablement(mParameters.internalModelContext, JSON.parse(mParameters.operationAvailableMap), mParameters.selectedItems, "table");
        }
      }).catch(function (oError) {
        Log.error("Error while requesting side effects", oError);
      });
    }
  }

  /**
   * Static functions to call OData actions (bound/import) and functions (bound/import)
   *
   * @namespace
   * @alias sap.fe.core.actions.operations
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.56.0
   */
  const operations = {
    callBoundAction: callBoundAction,
    callActionImport: callActionImport,
    callBoundFunction: callBoundFunction,
    callFunctionImport: callFunctionImport,
    executeDependingOnSelectedContexts: executeDependingOnSelectedContexts,
    createinternalOperationsPromiseForActionExecution: createinternalOperationsPromiseForActionExecution,
    valuesProvidedForAllParameters: _valuesProvidedForAllParameters,
    getActionParameterActionName: _getActionParameterActionName,
    actionParameterShowMessageCallback: actionParameterShowMessageCallback,
    afterActionResolution: afterActionResolution,
    checkforOtherMessages: checkforOtherMessages
  };
  return operations;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25zdGFudHMiLCJGRUxpYnJhcnkiLCJJbnZvY2F0aW9uR3JvdXBpbmciLCJBY3Rpb24iLCJNZXNzYWdlQm94IiwiY2FsbEJvdW5kQWN0aW9uIiwic0FjdGlvbk5hbWUiLCJjb250ZXh0cyIsIm9Nb2RlbCIsIm9BcHBDb21wb25lbnQiLCJtUGFyYW1ldGVycyIsInN0cmljdEhhbmRsaW5nVXRpbGl0aWVzIiwiaXM0MTJFeGVjdXRlZCIsInN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzIiwic3RyaWN0SGFuZGxpbmdQcm9taXNlcyIsInN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzIiwiZGVsYXlTdWNjZXNzTWVzc2FnZXMiLCJwcm9jZXNzZWRNZXNzYWdlSWRzIiwibGVuZ3RoIiwiUHJvbWlzZSIsInJlamVjdCIsImlzQ2FsbGVkV2l0aEFycmF5IiwiQXJyYXkiLCJpc0FycmF5IiwiYUNvbnRleHRzIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInNBY3Rpb25QYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwib0JvdW5kQWN0aW9uIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJpc0NyaXRpY2FsQWN0aW9uIiwiZ2V0SXNBY3Rpb25Dcml0aWNhbCIsImV4dHJhY3RTaW5nbGVSZXN1bHQiLCJyZXN1bHQiLCJzdGF0dXMiLCJ2YWx1ZSIsInJlYXNvbiIsImNhbGxBY3Rpb24iLCJ0aGVuIiwiY2FsbEFjdGlvbkltcG9ydCIsImJpbmRDb250ZXh0Iiwib0FjdGlvbkltcG9ydCIsImdldE9iamVjdCIsImNhbGxCb3VuZEZ1bmN0aW9uIiwic0Z1bmN0aW9uTmFtZSIsImNvbnRleHQiLCJzRnVuY3Rpb25QYXRoIiwib0JvdW5kRnVuY3Rpb24iLCJfZXhlY3V0ZUZ1bmN0aW9uIiwiY2FsbEZ1bmN0aW9uSW1wb3J0IiwicmVzb2x2ZSIsIm9GdW5jdGlvbkltcG9ydCIsIm9GdW5jdGlvbiIsInNHcm91cElkIiwiRXJyb3IiLCJvRnVuY3Rpb25Qcm9taXNlIiwiZXhlY3V0ZSIsInN1Ym1pdEJhdGNoIiwiZ2V0Qm91bmRDb250ZXh0Iiwib0FjdGlvbiIsImJHcm91cGVkIiwiaW52b2NhdGlvbkdyb3VwaW5nIiwiQ2hhbmdlU2V0IiwibUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMiLCJmbkRpYWxvZyIsIm9BY3Rpb25Qcm9taXNlIiwic0FjdGlvbkxhYmVsIiwibGFiZWwiLCJiU2tpcFBhcmFtZXRlckRpYWxvZyIsInNraXBQYXJhbWV0ZXJEaWFsb2ciLCJiSXNDcmVhdGVBY3Rpb24iLCJiSXNDcml0aWNhbEFjdGlvbiIsInNNZXRhUGF0aCIsInNNZXNzYWdlc1BhdGgiLCJpTWVzc2FnZVNpZGVFZmZlY3QiLCJiSXNTYW1lRW50aXR5Iiwib1JldHVyblR5cGUiLCJiVmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzIiwiYWN0aW9uRGVmaW5pdGlvbiIsImFBY3Rpb25QYXJhbWV0ZXJzIiwiZ2V0QWN0aW9uUGFyYW1ldGVycyIsImJBY3Rpb25OZWVkc1BhcmFtZXRlckRpYWxvZyIsIiROYW1lIiwiYVBhcmFtZXRlclZhbHVlcyIsInBhcmFtZXRlclZhbHVlcyIsIm9Db21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsIm9TdGFydHVwUGFyYW1ldGVycyIsInN0YXJ0dXBQYXJhbWV0ZXJzIiwiX3ZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyIsInNob3dBY3Rpb25QYXJhbWV0ZXJEaWFsb2ciLCJjb25maXJtQ3JpdGljYWxBY3Rpb24iLCJmbk9uU3VibWl0dGVkIiwib25TdWJtaXR0ZWQiLCJmbk9uUmVzcG9uc2UiLCJvblJlc3BvbnNlIiwiYWN0aW9uTmFtZSIsIm1vZGVsIiwiYkdldEJvdW5kQ29udGV4dCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsInNlbGVjdGVkSXRlbXMiLCJhZGRpdGlvbmFsU2lkZUVmZmVjdCIsInBhdGhFeHByZXNzaW9ucyIsImZpbmRJbmRleCIsImV4cCIsIiRpc0NvbGxlY3Rpb24iLCJnZXRNb2RlbCIsIiRUeXBlIiwibUJpbmRpbmdQYXJhbWV0ZXJzIiwiJHNlbGVjdCIsInNwbGl0IiwiaW5kZXhPZiIsInB1c2giLCJ0cmlnZ2VyQWN0aW9ucyIsInNwbGljZSIsImludGVybmFsTW9kZWxDb250ZXh0Iiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiaXNDcmVhdGVBY3Rpb24iLCJiT2JqZWN0UGFnZSIsImNvbnRyb2xJZCIsImNvbnRyb2wiLCJwYXJlbnRDb250cm9sIiwiYnlJZCIsImlzU3RhdGljIiwiJFBhcmFtZXRlciIsInNvbWUiLCJhUGFyYW1ldGVyIiwiJEVudGl0eVNldFBhdGgiLCIkSXNCb3VuZCIsImVudGl0eVNldE5hbWUiLCJtZXNzYWdlSGFuZGxlciIsIm9PcGVyYXRpb25SZXN1bHQiLCJhZnRlckFjdGlvblJlc29sdXRpb24iLCJjYXRjaCIsImkiLCJmaW5kIiwiZWxlbWVudCIsIm5hbWUiLCJfZXhlY3V0ZUFjdGlvbiIsIm1lc3NhZ2VzIiwiQ29yZSIsImdldE1lc3NhZ2VNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsImNvbmNhdCIsInN0cmljdEhhbmRsaW5nRmFpbHMiLCJhRmFpbGVkQ29udGV4dHMiLCJmb3JFYWNoIiwiZmFpbCIsImdldENvbnRleHQiLCJvRmFpbGVkT3BlcmF0aW9uUmVzdWx0IiwiYWRkTWVzc2FnZXMiLCJzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldCIsImNoZWNrZm9yT3RoZXJNZXNzYWdlcyIsInNob3dNZXNzYWdlRGlhbG9nIiwib25CZWZvcmVTaG93TWVzc2FnZSIsImFNZXNzYWdlcyIsInNob3dNZXNzYWdlUGFyYW1ldGVyc0luIiwiYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayIsInVuZGVmaW5lZCIsImFTZWxlY3RlZENvbnRleHRzIiwib0FjdGlvbkNvbnRleHQiLCJvUGFyZW50Q29udHJvbCIsImJvdW5kQWN0aW9uTmFtZSIsInN1ZmZpeFJlc291cmNlS2V5IiwicmVzb3VyY2VNb2RlbCIsImdldFJlc291cmNlTW9kZWwiLCJzQ29uZmlybWF0aW9uVGV4dCIsImdldFRleHQiLCJjb25maXJtIiwib25DbG9zZSIsInNBY3Rpb24iLCJPSyIsIm9PcGVyYXRpb24iLCJvRXJyb3IiLCJlIiwiQ2FuY2VsQWN0aW9uRGlhbG9nIiwiZXhlY3V0ZUFQTUFjdGlvbiIsIm9EaWFsb2ciLCJhZnRlcjQxMiIsImFSZXN1bHQiLCJvU2luZ2xlUmVzdWx0IiwiYXR0YWNoRXZlbnRPbmNlIiwiaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2dPcGVuIiwiaXNPcGVuIiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnQiLCJKU09OIiwicGFyc2UiLCJvQ29udHJvbCIsImlzQSIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJzaG93TWVzc2FnZUJveCIsIm9SZXNvdXJjZUJ1bmRsZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsInVuYm91bmRNZXNzYWdlcyIsImZpbHRlciIsIm1lc3NhZ2UiLCJnZXRUYXJnZXQiLCJBUERtZXNzYWdlcyIsImFjdGlvblBhcmFtIiwiQVBETWVzc2FnZSIsImlzQVBEVGFyZ2V0IiwiZXJyb3JUYXJnZXRzSW5BUEQiLCJoYXNDaGFuZ2VTZXRNb2RpZmllZE1lc3NhZ2UiLCJzTWVzc2FnZSIsInNEZXNjcmlwdGlvblRleHQiLCJtZXNzYWdlTW9kZWwiLCJtZXNzYWdlc0luTW9kZWwiLCJhQm91bmRNZXNzYWdlcyIsIm1lc3NhZ2VIYW5kbGluZyIsImdldE1lc3NhZ2VzIiwiZ2VuZXJpY01lc3NhZ2UiLCJpc0VkaXRhYmxlIiwiZ2V0UHJvcGVydHkiLCJub25FcnJvck1lc3NhZ2VFeGlzdHNJbkRpYWxvZyIsImdldFR5cGUiLCJub25FcnJvck1lc3NhZ2VFeGlzdHNJbk1vZGVsIiwic2V0TWVzc2FnZSIsImdldE1lc3NhZ2UiLCJNZXNzYWdlIiwidHlwZSIsIk1lc3NhZ2VUeXBlIiwidGFyZ2V0IiwicGVyc2lzdGVudCIsImRlc2NyaXB0aW9uIiwiY29kZSIsInVuc2hpZnQiLCJjbG9zZSIsImRlc3Ryb3kiLCJmaWx0ZXJlZE1lc3NhZ2VzIiwiYklzQVBET3BlbiIsImZuR2V0TWVzc2FnZVN1YnRpdGxlIiwic2V0TWVzc2FnZVN1YnRpdGxlIiwiYmluZCIsInNob3dDaGFuZ2VTZXRFcnJvckRpYWxvZyIsInNQYXRoIiwiX2dldFBhdGgiLCJtZXRhTW9kZWwiLCJlbnRpdHlTZXRDb250ZXh0Iiwic0FjdGlvbk5hbWVQYXRoIiwiYWN0aW9uTmFtZUNvbnRleHQiLCJzRnJhZ21lbnROYW1lIiwiYWN0aW9uUGFyYW1ldGVySW5mb3MiLCJtZXNzYWdlTWFuYWdlciIsIl9yZW1vdmVNZXNzYWdlc0ZvckFjdGlvblBhcmFtdGVyIiwicGFyYW1ldGVyIiwiYWxsTWVzc2FnZXMiLCJnZW5lcmF0ZSIsInJlbGV2YW50TWVzc2FnZXMiLCJtc2ciLCJnZXRDb250cm9sSWRzIiwiaWQiLCJpbmNsdWRlcyIsInJlbW92ZU1lc3NhZ2VzIiwib0NvbnRyb2xsZXIiLCJoYW5kbGVDaGFuZ2UiLCJvRXZlbnQiLCJmaWVsZCIsImdldFNvdXJjZSIsImFjdGlvblBhcmFtZXRlckluZm8iLCJ2YWxpZGF0aW9uUHJvbWlzZSIsImdldFBhcmFtZXRlciIsImhhc0Vycm9yIiwiZXJyb3IiLCJfYWRkTWVzc2FnZUZvckFjdGlvblBhcmFtZXRlciIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwib1BhcmFtZXRlck1vZGVsIiwiSlNPTk1vZGVsIiwiJGRpc3BsYXlNb2RlIiwiY3JlYXRlZEZyYWdtZW50IiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsImJpbmRpbmdDb250ZXh0cyIsImFjdGlvbiIsImVudGl0eVNldCIsIm1vZGVscyIsImFGdW5jdGlvblBhcmFtcyIsIm9PcGVyYXRpb25CaW5kaW5nIiwiQ29tbW9uVXRpbHMiLCJzZXRVc2VyRGVmYXVsdHMiLCJvRGlhbG9nQ29udGVudCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwibWFwIiwiYWN0aW9uUGFyYW1ldGVyIiwiaXNNdWx0aVZhbHVlIiwiYWN0aW9uUmVzdWx0IiwiZGlhbG9nQ2FuY2VsbGVkIiwiRGlhbG9nIiwidGl0bGUiLCJjb250ZW50IiwiZXNjYXBlSGFuZGxlciIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwidGV4dCIsIl9nZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lIiwicHJlc3MiLCJfdmFsaWRhdGVQcm9wZXJ0aWVzIiwiQnVzeUxvY2tlciIsImxvY2siLCJyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMiLCJ2UGFyYW1ldGVyVmFsdWUiLCJvUGFyYW1ldGVyQ29udGV4dCIsImdldFBhcmFtZXRlckNvbnRleHQiLCJhTVZGQ29udGVudCIsImFLZXlWYWx1ZXMiLCJqIiwiS2V5Iiwic2FwIiwidWkiLCJnZXRDb3JlIiwiaXNMb2NrZWQiLCJ1bmxvY2siLCJzaG93TWVzc2FnZXMiLCJtZXNzYWdlUGFnZU5hdmlnYXRpb25DYWxsYmFjayIsInNob3dNZXNzYWdlUGFyYW1ldGVycyIsImVuZEJ1dHRvbiIsImJlZm9yZU9wZW4iLCJvQ2xvbmVFdmVudCIsIk9iamVjdCIsImFzc2lnbiIsImdldERlZmF1bHRWYWx1ZXNGdW5jdGlvbiIsInNEZWZhdWx0VmFsdWVzRnVuY3Rpb24iLCJmblNldERlZmF1bHRzQW5kT3BlbkRpYWxvZyIsInNCaW5kaW5nUGFyYW1ldGVyIiwic0JvdW5kRnVuY3Rpb25OYW1lIiwicHJlZmlsbFBhcmFtZXRlciIsInNQYXJhbU5hbWUiLCJ2UGFyYW1EZWZhdWx0VmFsdWUiLCIkUGF0aCIsInZQYXJhbVZhbHVlIiwicmVxdWVzdFNpbmdsZXRvblByb3BlcnR5IiwicmVxdWVzdFByb3BlcnR5Iiwic1BhdGhGb3JDb250ZXh0IiwicmVwbGFjZSIsInBhcmFtTmFtZSIsImJOb1Bvc3NpYmxlVmFsdWUiLCJMb2ciLCJiTGF0ZVByb3BlcnR5RXJyb3IiLCJvRGF0YSIsImdldFBhcmFtZXRlckRlZmF1bHRWYWx1ZSIsInNBY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uUGF0aCIsImdldFBhcmFtZXRlclBhdGgiLCJvUGFyYW1ldGVyQW5ub3RhdGlvbnMiLCJvUGFyYW1ldGVyRGVmYXVsdFZhbHVlIiwiYUN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZSIsInZQYXJhbWV0ZXJEZWZhdWx0VmFsdWUiLCJhUHJlZmlsbFBhcmFtUHJvbWlzZXMiLCJhbGwiLCJhRXhlY0Z1bmN0aW9uUHJvbWlzZXMiLCJvRXhlY0Z1bmN0aW9uRnJvbU1hbmlmZXN0UHJvbWlzZSIsInNNb2R1bGUiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsIkZQTUhlbHBlciIsImFjdGlvbldyYXBwZXIiLCJhUHJvbWlzZXMiLCJjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWUiLCJmdW5jdGlvblBhcmFtcyIsIm9GdW5jdGlvblBhcmFtc0Zyb21NYW5pZmVzdCIsInNEaWFsb2dQYXJhbU5hbWUiLCJ2UGFyYW1ldGVyUHJvdmlkZWRWYWx1ZSIsInNldFBhcmFtZXRlciIsImhhc093blByb3BlcnR5IiwiYkVycm9yRm91bmQiLCJvVmFsdWUiLCJzVGV4dCIsIndhcm5pbmciLCJjb250ZW50V2lkdGgiLCJmbkFzeW5jQmVmb3JlT3BlbiIsImFQYXJhbWV0ZXJzIiwib0NvbnRleHRPYmplY3QiLCJyZXF1ZXN0T2JqZWN0IiwiZ2V0SXRlbXMiLCJnZXRWYWx1ZSIsImFmdGVyQ2xvc2UiLCJzZXRNb2RlbCIsImJpbmRFbGVtZW50IiwicGF0aCIsIm9NVkZNb2RlbCIsImdldEJpbmRpbmciLCJhdHRhY2hDaGFuZ2UiLCJhZGREZXBlbmRlbnQiLCJzZXRCaW5kaW5nQ29udGV4dCIsImdldE9iamVjdEJpbmRpbmciLCJvcGVuIiwic2xpY2UiLCJ2QWN0aW9uQ3JpdGljYWwiLCJzQ3JpdGljYWxQYXRoIiwiYUJpbmRpbmdQYXJhbXMiLCJhUGF0aHMiLCJiQ29uZGl0aW9uIiwib1BhcmFtcyIsImluZGV4Iiwiam9pbiIsInNFbnRpdHlTZXROYW1lIiwiYUFjdGlvbk5hbWUiLCJzS2V5IiwiYlJlc291cmNlS2V5RXhpc3RzIiwiY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzIiwiZXhlY3V0ZURlcGVuZGluZ09uU2VsZWN0ZWRDb250ZXh0cyIsImlDb250ZXh0TGVuZ3RoIiwiY3VycmVudF9jb250ZXh0X2luZGV4IiwiaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmUiLCJpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVqZWN0IiwiYkVuYWJsZVN0cmljdEhhbmRsaW5nIiwib1Byb3BlcnR5IiwiJGtpbmQiLCJvcGVyYXRpb25zSGVscGVyIiwiZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkIiwib3BlcmF0aW9ucyIsInVwZGF0ZTQxMlRyYW5zaXN0aW9uTWVzc2FnZXMiLCJBY3Rpb25FeGVjdXRpb25GYWlsZWQiLCJ0cmFuc2l0aW9uTWVzc2FnZXMiLCJpc0R1cGxpY2F0ZSIsIlN1Y2Nlc3MiLCJncm91cElkIiwiY3JlYXRlaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZUZvckFjdGlvbkV4ZWN1dGlvbiIsIm9Mb2NhbEFjdGlvblByb21pc2UiLCJpc0NoYW5nZVNldCIsInNldEFjdGlvblBhcmFtZXRlckRlZmF1bHRWYWx1ZSIsImFBY3Rpb25Qcm9taXNlcyIsIm9pbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlT2JqZWN0IiwiZm5FeGVjdXRlQWN0aW9uIiwiYWN0aW9uQ29udGV4dCIsIm9TaWRlRWZmZWN0IiwiaW5kaXZpZHVhbEFjdGlvblByb21pc2UiLCJnZXRVcGRhdGVHcm91cElkIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwiZm5SZXF1ZXN0U2lkZUVmZmVjdHMiLCJhbGxTZXR0bGVkIiwiZm5FeGVjdXRlU2luZ2xlQWN0aW9uIiwiZm5FeGVjdXRlQ2hhbmdlc2V0IiwiYUNoYW5nZVNldExvY2FsUHJvbWlzZXMiLCJub29wIiwib3RoZXJFcnJvck1lc3NhZ2VJbmRleCIsInJlbmRlck1lc3NhZ2VWaWV3Iiwic2hQcm9taXNlIiwic2V0RGF0YSIsImZuSGFuZGxlUmVzdWx0cyIsImZuRXhlY3V0ZVNlcXVlbnRpYWxseSIsImNvbnRleHRzVG9FeGVjdXRlIiwicHJvY2Vzc09uZUFjdGlvbiIsImFjdGlvbkluZGV4IiwicmVkdWNlIiwicHJvbWlzZSIsImZpbmFsbHkiLCJjdXJyZW50UHJvbWlzZVZhbHVlIiwiYWN0aW9uUGFyYW1ldGVycyIsImFMb2NhbFByb21pc2UiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwib0xvY2FsUHJvbWlzZSIsInNUcmlnZ2VyQWN0aW9uIiwiZXhlY3V0ZUFjdGlvbiIsInZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyIsImdldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbImZhY2FkZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBBY3Rpb25SdW50aW1lIGZyb20gXCJzYXAvZmUvY29yZS9BY3Rpb25SdW50aW1lXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQnVzeUxvY2tlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvQnVzeUxvY2tlclwiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgRlBNSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0ZQTUhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmVzb3VyY2VNb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBGRUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCB0eXBlIEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSBGaWVsZCBmcm9tIFwic2FwL3VpL21kYy9GaWVsZFwiO1xuaW1wb3J0IHR5cGUgTXVsdGlWYWx1ZUZpZWxkIGZyb20gXCJzYXAvdWkvbWRjL011bHRpVmFsdWVGaWVsZFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcIi4uLy4uLy4uL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IG9wZXJhdGlvbnNIZWxwZXIsIHsgdHlwZSBTdHJpY3RIYW5kbGluZ1BhcmFtZXRlcnMsIHR5cGUgU3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgfSBmcm9tIFwiLi4vLi4vLi4vb3BlcmF0aW9uc0hlbHBlclwiO1xuaW1wb3J0IHR5cGUgTWVzc2FnZUhhbmRsZXIgZnJvbSBcIi4uLy4uL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgeyBBY3Rpb25QYXJhbWV0ZXIsIEFjdGlvblBhcmFtZXRlckluZm8sIF9hZGRNZXNzYWdlRm9yQWN0aW9uUGFyYW1ldGVyLCBfdmFsaWRhdGVQcm9wZXJ0aWVzIH0gZnJvbSBcIi4vX2ludGVybmFsXCI7XG5cbmNvbnN0IENvbnN0YW50cyA9IEZFTGlicmFyeS5Db25zdGFudHMsXG5cdEludm9jYXRpb25Hcm91cGluZyA9IEZFTGlicmFyeS5JbnZvY2F0aW9uR3JvdXBpbmc7XG5jb25zdCBBY3Rpb24gPSAoTWVzc2FnZUJveCBhcyBhbnkpLkFjdGlvbjtcblxuLyoqXG4gKiBDYWxscyBhIGJvdW5kIGFjdGlvbiBmb3Igb25lIG9yIG11bHRpcGxlIGNvbnRleHRzLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5vcGVyYXRpb25zLmNhbGxCb3VuZEFjdGlvblxuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9uc1xuICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG4gKiBAcGFyYW0gY29udGV4dHMgRWl0aGVyIG9uZSBjb250ZXh0IG9yIGFuIGFycmF5IHdpdGggY29udGV4dHMgZm9yIHdoaWNoIHRoZSBhY3Rpb24gaXMgdG8gYmUgYmUgY2FsbGVkXG4gKiBAcGFyYW0gb01vZGVsIE9EYXRhIE1vZGVsXG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBPcHRpb25hbCwgY2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuICogQHBhcmFtIFttUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXNdIEEgbWFwIG9mIGFjdGlvbiBwYXJhbWV0ZXIgbmFtZXMgYW5kIHByb3ZpZGVkIHZhbHVlc1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnNdIEEgbWFwIG9mIGJpbmRpbmcgcGFyYW1ldGVycyB0aGF0IHdvdWxkIGJlIHBhcnQgb2YgJHNlbGVjdCBhbmQgJGV4cGFuZCBjb21pbmcgZnJvbSBzaWRlIGVmZmVjdHMgZm9yIGJvdW5kIGFjdGlvbnNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3RdIEFycmF5IG9mIHByb3BlcnR5IHBhdGhzIHRvIGJlIHJlcXVlc3RlZCBpbiBhZGRpdGlvbiB0byBhY3R1YWwgdGFyZ2V0IHByb3BlcnRpZXMgb2YgdGhlIHNpZGUgZWZmZWN0XG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnNob3dBY3Rpb25QYXJhbWV0ZXJEaWFsb2ddIElmIHNldCBhbmQgaWYgcGFyYW1ldGVycyBleGlzdCB0aGUgdXNlciByZXRyaWV2ZXMgYSBkaWFsb2cgdG8gZmlsbCBpbiBwYXJhbWV0ZXJzLCBpZiBhY3Rpb25QYXJhbWV0ZXJzIGFyZSBwYXNzZWQgdGhleSBhcmUgc2hvd24gdG8gdGhlIHVzZXJcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubGFiZWxdIEEgaHVtYW4tcmVhZGFibGUgbGFiZWwgZm9yIHRoZSBhY3Rpb25cbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuaW52b2NhdGlvbkdyb3VwaW5nXSBNb2RlIGhvdyBhY3Rpb25zIGFyZSB0byBiZSBjYWxsZWQ6IENoYW5nZXNldCB0byBwdXQgYWxsIGFjdGlvbiBjYWxscyBpbnRvIG9uZSBjaGFuZ2VzZXQsIElzb2xhdGVkIHRvIHB1dCB0aGVtIGludG8gc2VwYXJhdGUgY2hhbmdlc2V0cywgZGVmYXVsdHMgdG8gSXNvbGF0ZWRcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMub25TdWJtaXR0ZWRdIEZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCBvbmNlIHRoZSBhY3Rpb25zIGFyZSBzdWJtaXR0ZWQgd2l0aCBhbiBhcnJheSBvZiBwcm9taXNlc1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5kZWZhdWx0UGFyYW1ldGVyc10gQ2FuIGNvbnRhaW4gZGVmYXVsdCBwYXJhbWV0ZXJzIGZyb20gRkxQIHVzZXIgZGVmYXVsdHNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbF0gSWYgc3BlY2lmaWVkLCB0aGUgZGlhbG9ncyBhcmUgYWRkZWQgYXMgZGVwZW5kZW50IG9mIHRoZSBwYXJlbnQgY29udHJvbFxuICogQHBhcmFtIFttUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0XSBJZiBzcGVjaWZpZWQsIHRoZSBhY3Rpb24gcHJvbWlzZSByZXR1cm5zIHRoZSBib3VuZCBjb250ZXh0XG4gKiBAcGFyYW0gW3N0cmljdEhhbmRsaW5nVXRpbGl0aWVzXSBPcHRpb25hbCwgdXRpbGl0eSBmbGFncyBhbmQgbWVzc2FnZXMgZm9yIHN0cmljdEhhbmRsaW5nXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggYW4gYXJyYXkgb2YgcmVzcG9uc2Ugb2JqZWN0cyAoVE9ETzogdG8gYmUgY2hhbmdlZClcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gY2FsbEJvdW5kQWN0aW9uKFxuXHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRjb250ZXh0czogYW55LFxuXHRvTW9kZWw6IGFueSxcblx0b0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRtUGFyYW1ldGVyczogYW55LFxuXHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcz86IFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG4pIHtcblx0aWYgKCFzdHJpY3RIYW5kbGluZ1V0aWxpdGllcykge1xuXHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzID0ge1xuXHRcdFx0aXM0MTJFeGVjdXRlZDogZmFsc2UsXG5cdFx0XHRzdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlsczogW10sXG5cdFx0XHRzdHJpY3RIYW5kbGluZ1Byb21pc2VzOiBbXSxcblx0XHRcdHN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzOiBbXSxcblx0XHRcdGRlbGF5U3VjY2Vzc01lc3NhZ2VzOiBbXSxcblx0XHRcdHByb2Nlc3NlZE1lc3NhZ2VJZHM6IFtdXG5cdFx0fTtcblx0fVxuXHRpZiAoIWNvbnRleHRzIHx8IGNvbnRleHRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdC8vSW4gRnJlZXN0eWxlIGFwcHMgYm91bmQgYWN0aW9ucyBjYW4gaGF2ZSBubyBjb250ZXh0XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KFwiQm91bmQgYWN0aW9ucyBhbHdheXMgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGNvbnRleHRcIik7XG5cdH1cblx0Ly8gdGhpcyBtZXRob2QgZWl0aGVyIGFjY2VwdHMgc2luZ2xlIGNvbnRleHQgb3IgYW4gYXJyYXkgb2YgY29udGV4dHNcblx0Ly8gVE9ETzogUmVmYWN0b3IgdG8gYW4gdW5hbWJpZ3VvcyBBUElcblx0Y29uc3QgaXNDYWxsZWRXaXRoQXJyYXkgPSBBcnJheS5pc0FycmF5KGNvbnRleHRzKTtcblxuXHQvLyBpbiBjYXNlIG9mIHNpbmdsZSBjb250ZXh0IHdyYXAgaW50byBhbiBhcnJheSBmb3IgY2FsbGVkIG1ldGhvZHMgKGVzcC4gY2FsbEFjdGlvbilcblx0bVBhcmFtZXRlcnMuYUNvbnRleHRzID0gaXNDYWxsZWRXaXRoQXJyYXkgPyBjb250ZXh0cyA6IFtjb250ZXh0c107XG5cblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHQvLyBBbmFseXppbmcgbWV0YU1vZGVsUGF0aCBmb3IgYWN0aW9uIG9ubHkgZnJvbSBmaXJzdCBjb250ZXh0IHNlZW1zIHdlaXJkLCBidXQgcHJvYmFibHkgd29ya3MgaW4gYWxsIGV4aXN0aW5nIHN6ZW5hcmlvcyAtIGlmIHNldmVyYWwgY29udGV4dHMgYXJlIHBhc3NlZCwgdGhleSBwcm9iYWJseVxuXHRcdC8vIGJlbG9uZyB0byB0aGUgc2FtZSBtZXRhbW9kZWxwYXRoLiBUT0RPOiBDaGVjaywgd2hldGhlciB0aGlzIGNhbiBiZSBpbXByb3ZlZCAvIHN6ZW5hcmlvcyB3aXRoIGRpZmZlcmVudCBtZXRhTW9kZWxQYXRocyBtaWdodCBleGlzdFxuXHRcdHNBY3Rpb25QYXRoID0gYCR7b01ldGFNb2RlbC5nZXRNZXRhUGF0aChtUGFyYW1ldGVycy5hQ29udGV4dHNbMF0uZ2V0UGF0aCgpKX0vJHtzQWN0aW9uTmFtZX1gLFxuXHRcdG9Cb3VuZEFjdGlvbiA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7c0FjdGlvblBhdGh9L0AkdWk1Lm92ZXJsb2FkLzBgKTtcblx0bVBhcmFtZXRlcnMuaXNDcml0aWNhbEFjdGlvbiA9IGdldElzQWN0aW9uQ3JpdGljYWwob01ldGFNb2RlbCwgc0FjdGlvblBhdGgsIG1QYXJhbWV0ZXJzLmFDb250ZXh0cywgb0JvdW5kQWN0aW9uKTtcblxuXHQvLyBQcm9taXNlIHJldHVybmVkIGJ5IGNhbGxBY3Rpb24gY3VycmVudGx5IGlzIHJlamVjdGVkIGluIGNhc2Ugb2YgZXhlY3V0aW9uIGZvciBtdWx0aXBsZSBjb250ZXh0cyBwYXJ0bHkgZmFpbGluZy4gVGhpcyBzaG91bGQgYmUgY2hhbmdlZCAoc29tZSBmYWlsaW5nIGNvbnRleHRzIGRvIG5vdCBtZWFuXG5cdC8vIHRoYXQgZnVuY3Rpb24gZGlkIG5vdCBmdWxmaWxsIGl0cyB0YXNrKSwgYnV0IGFzIHRoaXMgaXMgYSBiaWdnZXIgcmVmYWN0b3JpbmcsIGZvciB0aGUgdGltZSBiZWluZyB3ZSBuZWVkIHRvIGRlYWwgd2l0aCB0aGF0IGF0IHRoZSBjYWxsaW5nIHBsYWNlIChpLmUuIGhlcmUpXG5cdC8vID0+IHByb3ZpZGUgdGhlIHNhbWUgaGFuZGxlciAobWFwcGluZyBiYWNrIGZyb20gYXJyYXkgdG8gc2luZ2xlIHJlc3VsdC9lcnJvciBpZiBuZWVkZWQpIGZvciByZXNvbHZlZC9yZWplY3RlZCBjYXNlXG5cdGNvbnN0IGV4dHJhY3RTaW5nbGVSZXN1bHQgPSBmdW5jdGlvbiAocmVzdWx0OiBhbnkpIHtcblx0XHQvLyBzaW5nbGUgYWN0aW9uIGNvdWxkIGJlIHJlc29sdmVkIG9yIHJlamVjdGVkXG5cdFx0aWYgKHJlc3VsdFswXS5zdGF0dXMgPT09IFwiZnVsZmlsbGVkXCIpIHtcblx0XHRcdHJldHVybiByZXN1bHRbMF0udmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEluIGNhc2Ugb2YgZGlhbG9nIGNhbmNlbGxhdGlvbiwgbm8gYXJyYXkgaXMgcmV0dXJuZWQgPT4gdGhyb3cgdGhlIHJlc3VsdC5cblx0XHRcdC8vIElkZWFsbHksIGRpZmZlcmVudGlhdGluZyBzaG91bGQgbm90IGJlIG5lZWRlZCBoZXJlID0+IFRPRE86IEZpbmQgYmV0dGVyIHNvbHV0aW9uIHdoZW4gc2VwYXJhdGluZyBkaWFsb2cgaGFuZGxpbmcgKHNpbmdsZSBvYmplY3Qgd2l0aCBzaW5nbGUgcmVzdWx0KSBmcm9tIGJhY2tlbmRcblx0XHRcdC8vIGV4ZWN1dGlvbiAocG90ZW50aWFsbHkgbXVsdGlwbGUgb2JqZWN0cylcblx0XHRcdHRocm93IHJlc3VsdFswXS5yZWFzb24gfHwgcmVzdWx0O1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gY2FsbEFjdGlvbihzQWN0aW9uTmFtZSwgb01vZGVsLCBvQm91bmRBY3Rpb24sIG9BcHBDb21wb25lbnQsIG1QYXJhbWV0ZXJzLCBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcykudGhlbihcblx0XHQocmVzdWx0OiBhbnkpID0+IHtcblx0XHRcdGlmIChpc0NhbGxlZFdpdGhBcnJheSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGV4dHJhY3RTaW5nbGVSZXN1bHQocmVzdWx0KTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdChyZXN1bHQ6IGFueSkgPT4ge1xuXHRcdFx0aWYgKGlzQ2FsbGVkV2l0aEFycmF5KSB7XG5cdFx0XHRcdHRocm93IHJlc3VsdDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBleHRyYWN0U2luZ2xlUmVzdWx0KHJlc3VsdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHQpO1xufVxuLyoqXG4gKiBDYWxscyBhbiBhY3Rpb24gaW1wb3J0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5vcGVyYXRpb25zLmNhbGxBY3Rpb25JbXBvcnRcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLm9wZXJhdGlvbnNcbiAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uIGltcG9ydCB0byBiZSBjYWxsZWRcbiAqIEBwYXJhbSBvTW9kZWwgQW4gaW5zdGFuY2Ugb2YgYW4gT0RhdGEgVjQgbW9kZWxcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IFRoZSBBcHBDb21wb25lbnRcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdIE9wdGlvbmFsLCBjYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnBhcmFtZXRlclZhbHVlc10gQSBtYXAgb2YgYWN0aW9uIHBhcmFtZXRlciBuYW1lcyBhbmQgcHJvdmlkZWQgdmFsdWVzXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmxhYmVsXSBBIGh1bWFuLXJlYWRhYmxlIGxhYmVsIGZvciB0aGUgYWN0aW9uXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnNob3dBY3Rpb25QYXJhbWV0ZXJEaWFsb2ddIElmIHNldCBhbmQgaWYgcGFyYW1ldGVycyBleGlzdCB0aGUgdXNlciByZXRyaWV2ZXMgYSBkaWFsb2cgdG8gZmlsbCBpbiBwYXJhbWV0ZXJzLCBpZiBhY3Rpb25QYXJhbWV0ZXJzIGFyZSBwYXNzZWQgdGhleSBhcmUgc2hvd24gdG8gdGhlIHVzZXJcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMub25TdWJtaXR0ZWRdIEZ1bmN0aW9uIHdoaWNoIGlzIGNhbGxlZCBvbmNlIHRoZSBhY3Rpb25zIGFyZSBzdWJtaXR0ZWQgd2l0aCBhbiBhcnJheSBvZiBwcm9taXNlc1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5kZWZhdWx0UGFyYW1ldGVyc10gQ2FuIGNvbnRhaW4gZGVmYXVsdCBwYXJhbWV0ZXJzIGZyb20gRkxQIHVzZXIgZGVmYXVsdHNcbiAqIEBwYXJhbSBbc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNdIE9wdGlvbmFsLCB1dGlsaXR5IGZsYWdzIGFuZCBtZXNzYWdlcyBmb3Igc3RyaWN0SGFuZGxpbmdcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCBhbiBhcnJheSBvZiByZXNwb25zZSBvYmplY3RzIChUT0RPOiB0byBiZSBjaGFuZ2VkKVxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBjYWxsQWN0aW9uSW1wb3J0KFxuXHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRvTW9kZWw6IGFueSxcblx0b0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRtUGFyYW1ldGVyczogYW55LFxuXHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcz86IFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG4pIHtcblx0aWYgKCFvTW9kZWwpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJBY3Rpb24gZXhwZWN0cyBhIG1vZGVsL2NvbnRleHQgZm9yIGV4ZWN1dGlvblwiKTtcblx0fVxuXHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdHNBY3Rpb25QYXRoID0gb01vZGVsLmJpbmRDb250ZXh0KGAvJHtzQWN0aW9uTmFtZX1gKS5nZXRQYXRoKCksXG5cdFx0b0FjdGlvbkltcG9ydCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke29NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0FjdGlvblBhdGgpLmdldE9iamVjdChcIiRBY3Rpb25cIil9LzBgKTtcblx0bVBhcmFtZXRlcnMuaXNDcml0aWNhbEFjdGlvbiA9IGdldElzQWN0aW9uQ3JpdGljYWwob01ldGFNb2RlbCwgYCR7c0FjdGlvblBhdGh9L0AkdWk1Lm92ZXJsb2FkYCk7XG5cdHJldHVybiBjYWxsQWN0aW9uKHNBY3Rpb25OYW1lLCBvTW9kZWwsIG9BY3Rpb25JbXBvcnQsIG9BcHBDb21wb25lbnQsIG1QYXJhbWV0ZXJzLCBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyk7XG59XG5mdW5jdGlvbiBjYWxsQm91bmRGdW5jdGlvbihzRnVuY3Rpb25OYW1lOiBzdHJpbmcsIGNvbnRleHQ6IGFueSwgb01vZGVsOiBhbnkpIHtcblx0aWYgKCFjb250ZXh0KSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KFwiQm91bmQgZnVuY3Rpb25zIGFsd2F5cyByZXF1aXJlcyBhIGNvbnRleHRcIik7XG5cdH1cblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRzRnVuY3Rpb25QYXRoID0gYCR7b01ldGFNb2RlbC5nZXRNZXRhUGF0aChjb250ZXh0LmdldFBhdGgoKSl9LyR7c0Z1bmN0aW9uTmFtZX1gLFxuXHRcdG9Cb3VuZEZ1bmN0aW9uID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRnVuY3Rpb25QYXRoKTtcblx0cmV0dXJuIF9leGVjdXRlRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZSwgb01vZGVsLCBvQm91bmRGdW5jdGlvbiwgY29udGV4dCk7XG59XG4vKipcbiAqIENhbGxzIGEgZnVuY3Rpb24gaW1wb3J0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHN0YXRpY1xuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5vcGVyYXRpb25zLmNhbGxGdW5jdGlvbkltcG9ydFxuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9uc1xuICogQHBhcmFtIHNGdW5jdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZFxuICogQHBhcmFtIG9Nb2RlbCBBbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSB2NCBtb2RlbFxuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlc1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gY2FsbEZ1bmN0aW9uSW1wb3J0KHNGdW5jdGlvbk5hbWU6IHN0cmluZywgb01vZGVsOiBhbnkpIHtcblx0aWYgKCFzRnVuY3Rpb25OYW1lKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0c0Z1bmN0aW9uUGF0aCA9IG9Nb2RlbC5iaW5kQ29udGV4dChgLyR7c0Z1bmN0aW9uTmFtZX1gKS5nZXRQYXRoKCksXG5cdFx0b0Z1bmN0aW9uSW1wb3J0ID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgLyR7b01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRnVuY3Rpb25QYXRoKS5nZXRPYmplY3QoXCIkRnVuY3Rpb25cIil9LzBgKTtcblx0cmV0dXJuIF9leGVjdXRlRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZSwgb01vZGVsLCBvRnVuY3Rpb25JbXBvcnQpO1xufVxuZnVuY3Rpb24gX2V4ZWN1dGVGdW5jdGlvbihzRnVuY3Rpb25OYW1lOiBhbnksIG9Nb2RlbDogYW55LCBvRnVuY3Rpb246IGFueSwgY29udGV4dD86IGFueSkge1xuXHRsZXQgc0dyb3VwSWQ7XG5cdGlmICghb0Z1bmN0aW9uIHx8ICFvRnVuY3Rpb24uZ2V0T2JqZWN0KCkpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBGdW5jdGlvbiAke3NGdW5jdGlvbk5hbWV9IG5vdCBmb3VuZGApKTtcblx0fVxuXHRpZiAoY29udGV4dCkge1xuXHRcdG9GdW5jdGlvbiA9IG9Nb2RlbC5iaW5kQ29udGV4dChgJHtjb250ZXh0LmdldFBhdGgoKX0vJHtzRnVuY3Rpb25OYW1lfSguLi4pYCk7XG5cdFx0c0dyb3VwSWQgPSBcImZ1bmN0aW9uR3JvdXBcIjtcblx0fSBlbHNlIHtcblx0XHRvRnVuY3Rpb24gPSBvTW9kZWwuYmluZENvbnRleHQoYC8ke3NGdW5jdGlvbk5hbWV9KC4uLilgKTtcblx0XHRzR3JvdXBJZCA9IFwiZnVuY3Rpb25JbXBvcnRcIjtcblx0fVxuXHRjb25zdCBvRnVuY3Rpb25Qcm9taXNlID0gb0Z1bmN0aW9uLmV4ZWN1dGUoc0dyb3VwSWQpO1xuXHRvTW9kZWwuc3VibWl0QmF0Y2goc0dyb3VwSWQpO1xuXHRyZXR1cm4gb0Z1bmN0aW9uUHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gb0Z1bmN0aW9uLmdldEJvdW5kQ29udGV4dCgpO1xuXHR9KTtcbn1cbmZ1bmN0aW9uIGNhbGxBY3Rpb24oXG5cdHNBY3Rpb25OYW1lOiBhbnksXG5cdG9Nb2RlbDogYW55LFxuXHRvQWN0aW9uOiBhbnksXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGlmICghc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpIHtcblx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyA9IHtcblx0XHRcdGlzNDEyRXhlY3V0ZWQ6IGZhbHNlLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM6IFtdLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlczogW10sXG5cdFx0XHRzdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlczogW10sXG5cdFx0XHRkZWxheVN1Y2Nlc3NNZXNzYWdlczogW10sXG5cdFx0XHRwcm9jZXNzZWRNZXNzYWdlSWRzOiBbXVxuXHRcdH07XG5cdH1cblx0bVBhcmFtZXRlcnMuYkdyb3VwZWQgPSBtUGFyYW1ldGVycy5pbnZvY2F0aW9uR3JvdXBpbmcgPT09IEludm9jYXRpb25Hcm91cGluZy5DaGFuZ2VTZXQ7XG5cdHJldHVybiBuZXcgUHJvbWlzZShhc3luYyBmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkge1xuXHRcdGxldCBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVyczogYW55ID0ge307XG5cdFx0bGV0IGZuRGlhbG9nO1xuXHRcdGxldCBvQWN0aW9uUHJvbWlzZTtcblx0XHQvL2xldCBmYWlsZWRBY3Rpb25Qcm9taXNlOiBhbnk7XG5cdFx0Y29uc3Qgc0FjdGlvbkxhYmVsID0gbVBhcmFtZXRlcnMubGFiZWw7XG5cdFx0Y29uc3QgYlNraXBQYXJhbWV0ZXJEaWFsb2cgPSBtUGFyYW1ldGVycy5za2lwUGFyYW1ldGVyRGlhbG9nO1xuXHRcdGNvbnN0IGFDb250ZXh0cyA9IG1QYXJhbWV0ZXJzLmFDb250ZXh0cztcblx0XHRjb25zdCBiSXNDcmVhdGVBY3Rpb24gPSBtUGFyYW1ldGVycy5iSXNDcmVhdGVBY3Rpb247XG5cdFx0Y29uc3QgYklzQ3JpdGljYWxBY3Rpb24gPSBtUGFyYW1ldGVycy5pc0NyaXRpY2FsQWN0aW9uO1xuXHRcdGxldCBvTWV0YU1vZGVsO1xuXHRcdGxldCBzTWV0YVBhdGg7XG5cdFx0bGV0IHNNZXNzYWdlc1BhdGg6IGFueTtcblx0XHRsZXQgaU1lc3NhZ2VTaWRlRWZmZWN0O1xuXHRcdGxldCBiSXNTYW1lRW50aXR5O1xuXHRcdGxldCBvUmV0dXJuVHlwZTtcblx0XHRsZXQgYlZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycztcblx0XHRjb25zdCBhY3Rpb25EZWZpbml0aW9uID0gb0FjdGlvbi5nZXRPYmplY3QoKTtcblx0XHRpZiAoIW9BY3Rpb24gfHwgIW9BY3Rpb24uZ2V0T2JqZWN0KCkpIHtcblx0XHRcdHJldHVybiByZWplY3QobmV3IEVycm9yKGBBY3Rpb24gJHtzQWN0aW9uTmFtZX0gbm90IGZvdW5kYCkpO1xuXHRcdH1cblxuXHRcdC8vIEdldCB0aGUgcGFyYW1ldGVycyBvZiB0aGUgYWN0aW9uXG5cdFx0Y29uc3QgYUFjdGlvblBhcmFtZXRlcnMgPSBnZXRBY3Rpb25QYXJhbWV0ZXJzKG9BY3Rpb24pO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgdGhlIGFjdGlvbiBoYXMgcGFyYW1ldGVycyBhbmQgd291bGQgbmVlZCBhIHBhcmFtZXRlciBkaWFsb2dcblx0XHQvLyBUaGUgcGFyYW1ldGVyIFJlc3VsdElzQWN0aXZlRW50aXR5IGlzIGFsd2F5cyBoaWRkZW4gaW4gdGhlIGRpYWxvZyEgSGVuY2UgaWZcblx0XHQvLyB0aGlzIGlzIHRoZSBvbmx5IHBhcmFtZXRlciwgdGhpcyBpcyB0cmVhdGVkIGFzIG5vIHBhcmFtZXRlciBoZXJlIGJlY2F1c2UgdGhlXG5cdFx0Ly8gZGlhbG9nIHdvdWxkIGJlIGVtcHR5IVxuXHRcdC8vIEZJWE1FOiBTaG91bGQgb25seSBpZ25vcmUgdGhpcyBpZiB0aGlzIGlzIGEgJ2NyZWF0ZScgYWN0aW9uLCBvdGhlcndpc2UgaXQgaXMganVzdCBzb21lIG5vcm1hbCBwYXJhbWV0ZXIgdGhhdCBoYXBwZW5zIHRvIGhhdmUgdGhpcyBuYW1lXG5cdFx0Y29uc3QgYkFjdGlvbk5lZWRzUGFyYW1ldGVyRGlhbG9nID1cblx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzLmxlbmd0aCA+IDAgJiYgIShhQWN0aW9uUGFyYW1ldGVycy5sZW5ndGggPT09IDEgJiYgYUFjdGlvblBhcmFtZXRlcnNbMF0uJE5hbWUgPT09IFwiUmVzdWx0SXNBY3RpdmVFbnRpdHlcIik7XG5cblx0XHQvLyBQcm92aWRlZCB2YWx1ZXMgZm9yIHRoZSBhY3Rpb24gcGFyYW1ldGVycyBmcm9tIGludm9rZUFjdGlvbiBjYWxsXG5cdFx0Y29uc3QgYVBhcmFtZXRlclZhbHVlcyA9IG1QYXJhbWV0ZXJzLnBhcmFtZXRlclZhbHVlcztcblxuXHRcdC8vIERldGVybWluZSBzdGFydHVwIHBhcmFtZXRlcnMgaWYgcHJvdmlkZWRcblx0XHRjb25zdCBvQ29tcG9uZW50RGF0YSA9IG9BcHBDb21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpO1xuXHRcdGNvbnN0IG9TdGFydHVwUGFyYW1ldGVycyA9IChvQ29tcG9uZW50RGF0YSAmJiBvQ29tcG9uZW50RGF0YS5zdGFydHVwUGFyYW1ldGVycykgfHwge307XG5cblx0XHQvLyBJbiBjYXNlIGFuIGFjdGlvbiBwYXJhbWV0ZXIgaXMgbmVlZGVkLCBhbmQgd2Ugc2hhbGwgc2tpcCB0aGUgZGlhbG9nLCBjaGVjayBpZiB2YWx1ZXMgYXJlIHByb3ZpZGVkIGZvciBhbGwgcGFyYW1ldGVyc1xuXHRcdGlmIChiQWN0aW9uTmVlZHNQYXJhbWV0ZXJEaWFsb2cgJiYgYlNraXBQYXJhbWV0ZXJEaWFsb2cpIHtcblx0XHRcdGJWYWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnMgPSBfdmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzKFxuXHRcdFx0XHRiSXNDcmVhdGVBY3Rpb24sXG5cdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzLFxuXHRcdFx0XHRhUGFyYW1ldGVyVmFsdWVzLFxuXHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnNcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0Ly8gRGVwZW5kaW5nIG9uIHRoZSBwcmV2aW91c2x5IGRldGVybWluZWQgZGF0YSwgZWl0aGVyIHNldCBhIGRpYWxvZyBvciBsZWF2ZSBpdCBlbXB0eSB3aGljaFxuXHRcdC8vIHdpbGwgbGVhZCB0byBkaXJlY3QgZXhlY3V0aW9uIG9mIHRoZSBhY3Rpb24gd2l0aG91dCBhIGRpYWxvZ1xuXHRcdGZuRGlhbG9nID0gbnVsbDtcblx0XHRpZiAoYkFjdGlvbk5lZWRzUGFyYW1ldGVyRGlhbG9nKSB7XG5cdFx0XHRpZiAoIShiU2tpcFBhcmFtZXRlckRpYWxvZyAmJiBiVmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzKSkge1xuXHRcdFx0XHRmbkRpYWxvZyA9IHNob3dBY3Rpb25QYXJhbWV0ZXJEaWFsb2c7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChiSXNDcml0aWNhbEFjdGlvbikge1xuXHRcdFx0Zm5EaWFsb2cgPSBjb25maXJtQ3JpdGljYWxBY3Rpb247XG5cdFx0fVxuXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMgPSB7XG5cdFx0XHRmbk9uU3VibWl0dGVkOiBtUGFyYW1ldGVycy5vblN1Ym1pdHRlZCxcblx0XHRcdGZuT25SZXNwb25zZTogbVBhcmFtZXRlcnMub25SZXNwb25zZSxcblx0XHRcdGFjdGlvbk5hbWU6IHNBY3Rpb25OYW1lLFxuXHRcdFx0bW9kZWw6IG9Nb2RlbCxcblx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzOiBhQWN0aW9uUGFyYW1ldGVycyxcblx0XHRcdGJHZXRCb3VuZENvbnRleHQ6IG1QYXJhbWV0ZXJzLmJHZXRCb3VuZENvbnRleHQsXG5cdFx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbixcblx0XHRcdGxhYmVsOiBtUGFyYW1ldGVycy5sYWJlbCxcblx0XHRcdHNlbGVjdGVkSXRlbXM6IG1QYXJhbWV0ZXJzLnNlbGVjdGVkSXRlbXNcblx0XHR9O1xuXHRcdGlmIChvQWN0aW9uLmdldE9iamVjdChcIiRJc0JvdW5kXCIpKSB7XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QgJiYgbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QucGF0aEV4cHJlc3Npb25zKSB7XG5cdFx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoYUNvbnRleHRzWzBdLmdldFBhdGgoKSk7XG5cdFx0XHRcdHNNZXNzYWdlc1BhdGggPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcblxuXHRcdFx0XHRpZiAoc01lc3NhZ2VzUGF0aCkge1xuXHRcdFx0XHRcdGlNZXNzYWdlU2lkZUVmZmVjdCA9IG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucy5maW5kSW5kZXgoZnVuY3Rpb24gKGV4cDogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdHlwZW9mIGV4cCA9PT0gXCJzdHJpbmdcIiAmJiBleHAgPT09IHNNZXNzYWdlc1BhdGg7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHQvLyBBZGQgU0FQX01lc3NhZ2VzIGJ5IGRlZmF1bHQgaWYgbm90IGFubm90YXRlZCBieSBzaWRlIGVmZmVjdHMsIGFjdGlvbiBkb2VzIG5vdCByZXR1cm4gYSBjb2xsZWN0aW9uIGFuZFxuXHRcdFx0XHRcdC8vIHRoZSByZXR1cm4gdHlwZSBpcyB0aGUgc2FtZSBhcyB0aGUgYm91bmQgdHlwZVxuXHRcdFx0XHRcdG9SZXR1cm5UeXBlID0gb0FjdGlvbi5nZXRPYmplY3QoXCIkUmV0dXJuVHlwZVwiKTtcblx0XHRcdFx0XHRiSXNTYW1lRW50aXR5ID1cblx0XHRcdFx0XHRcdG9SZXR1cm5UeXBlICYmICFvUmV0dXJuVHlwZS4kaXNDb2xsZWN0aW9uICYmIG9BY3Rpb24uZ2V0TW9kZWwoKS5nZXRPYmplY3Qoc01ldGFQYXRoKS4kVHlwZSA9PT0gb1JldHVyblR5cGUuJFR5cGU7XG5cblx0XHRcdFx0XHRpZiAoaU1lc3NhZ2VTaWRlRWZmZWN0ID4gLTEgfHwgYklzU2FtZUVudGl0eSkge1xuXHRcdFx0XHRcdFx0Ly8gdGhlIG1lc3NhZ2UgcGF0aCBpcyBhbm5vdGF0ZWQgYXMgc2lkZSBlZmZlY3QuIEFzIHRoZXJlJ3Mgbm8gYmluZGluZyBmb3IgaXQgYW5kIHRoZSBtb2RlbCBkb2VzIGN1cnJlbnRseSBub3QgYWxsb3dcblx0XHRcdFx0XHRcdC8vIHRvIGFkZCBpdCBhdCBhIGxhdGVyIHBvaW50IG9mIHRpbWUgd2UgaGF2ZSB0byB0YWtlIGNhcmUgaXQncyBwYXJ0IG9mIHRoZSAkc2VsZWN0IG9mIHRoZSBQT1NULCB0aGVyZWZvcmUgbW92aW5nIGl0LlxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzIHx8IHt9O1xuXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdG9BY3Rpb24uZ2V0T2JqZWN0KGAkUmV0dXJuVHlwZS8kVHlwZS8ke3NNZXNzYWdlc1BhdGh9YCkgJiZcblx0XHRcdFx0XHRcdFx0KCFtUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnMuJHNlbGVjdCB8fFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycy4kc2VsZWN0LnNwbGl0KFwiLFwiKS5pbmRleE9mKHNNZXNzYWdlc1BhdGgpID09PSAtMSlcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnMuJHNlbGVjdCA9IG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycy4kc2VsZWN0XG5cdFx0XHRcdFx0XHRcdFx0PyBgJHttUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnMuJHNlbGVjdH0sJHtzTWVzc2FnZXNQYXRofWBcblx0XHRcdFx0XHRcdFx0XHQ6IHNNZXNzYWdlc1BhdGg7XG5cdFx0XHRcdFx0XHRcdC8vIEFkZCBzaWRlIGVmZmVjdHMgYXQgZW50aXR5IGxldmVsIGJlY2F1c2UgJHNlbGVjdCBzdG9wcyB0aGVzZSBiZWluZyByZXR1cm5lZCBieSB0aGUgYWN0aW9uXG5cdFx0XHRcdFx0XHRcdC8vIE9ubHkgaWYgbm8gb3RoZXIgc2lkZSBlZmZlY3RzIHdlcmUgYWRkZWQgZm9yIE1lc3NhZ2VzXG5cdFx0XHRcdFx0XHRcdGlmIChpTWVzc2FnZVNpZGVFZmZlY3QgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QucGF0aEV4cHJlc3Npb25zLnB1c2goXCIqXCIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnRyaWdnZXJBY3Rpb25zLmxlbmd0aCA9PT0gMCAmJiBpTWVzc2FnZVNpZGVFZmZlY3QgPiAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIG5vIHRyaWdnZXIgYWN0aW9uIHRoZXJlZm9yZSBubyBuZWVkIHRvIHJlcXVlc3QgbWVzc2FnZXMgYWdhaW5cblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMuc3BsaWNlKGlNZXNzYWdlU2lkZUVmZmVjdCwgMSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzID0gYUNvbnRleHRzO1xuXHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzO1xuXHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QgPSBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdDtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmJHcm91cGVkID0gbVBhcmFtZXRlcnMuaW52b2NhdGlvbkdyb3VwaW5nID09PSBJbnZvY2F0aW9uR3JvdXBpbmcuQ2hhbmdlU2V0O1xuXHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgPSBtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IG1QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcDtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmlzQ3JlYXRlQWN0aW9uID0gYklzQ3JlYXRlQWN0aW9uO1xuXHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYk9iamVjdFBhZ2UgPSBtUGFyYW1ldGVycy5iT2JqZWN0UGFnZTtcblx0XHRcdGlmIChtUGFyYW1ldGVycy5jb250cm9sSWQpIHtcblx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuY29udHJvbCA9IG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wuYnlJZChtUGFyYW1ldGVycy5jb250cm9sSWQpO1xuXHRcdFx0XHRtUGFyYW1ldGVycy5jb250cm9sID0gbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuY29udHJvbDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmNvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sO1xuXHRcdFx0XHRtUGFyYW1ldGVycy5jb250cm9sID0gbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGJJc0NyZWF0ZUFjdGlvbikge1xuXHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYklzQ3JlYXRlQWN0aW9uID0gYklzQ3JlYXRlQWN0aW9uO1xuXHRcdH1cblx0XHQvL2NoZWNrIGZvciBza2lwcGluZyBzdGF0aWMgYWN0aW9uc1xuXHRcdGNvbnN0IGlzU3RhdGljID0gKGFjdGlvbkRlZmluaXRpb24uJFBhcmFtZXRlciB8fCBbXSkuc29tZSgoYVBhcmFtZXRlcjogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQoKGFjdGlvbkRlZmluaXRpb24uJEVudGl0eVNldFBhdGggJiYgYWN0aW9uRGVmaW5pdGlvbi4kRW50aXR5U2V0UGF0aCA9PT0gYVBhcmFtZXRlci4kTmFtZSkgfHwgYWN0aW9uRGVmaW5pdGlvbi4kSXNCb3VuZCkgJiZcblx0XHRcdFx0YVBhcmFtZXRlci4kaXNDb2xsZWN0aW9uXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmlzU3RhdGljID0gaXNTdGF0aWM7XG5cdFx0aWYgKGZuRGlhbG9nKSB7XG5cdFx0XHRvQWN0aW9uUHJvbWlzZSA9IGZuRGlhbG9nKFxuXHRcdFx0XHRzQWN0aW9uTmFtZSxcblx0XHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdFx0c0FjdGlvbkxhYmVsLFxuXHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0YUFjdGlvblBhcmFtZXRlcnMsXG5cdFx0XHRcdGFQYXJhbWV0ZXJWYWx1ZXMsXG5cdFx0XHRcdG9BY3Rpb24sXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wsXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmVudGl0eVNldE5hbWUsXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLm1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0KTtcblx0XHRcdHJldHVybiBvQWN0aW9uUHJvbWlzZVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob09wZXJhdGlvblJlc3VsdDogYW55KSB7XG5cdFx0XHRcdFx0YWZ0ZXJBY3Rpb25SZXNvbHV0aW9uKG1QYXJhbWV0ZXJzLCBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycywgYWN0aW9uRGVmaW5pdGlvbik7XG5cdFx0XHRcdFx0cmVzb2x2ZShvT3BlcmF0aW9uUmVzdWx0KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvT3BlcmF0aW9uUmVzdWx0OiBhbnkpIHtcblx0XHRcdFx0XHRyZWplY3Qob09wZXJhdGlvblJlc3VsdCk7XG5cdFx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBUYWtlIG92ZXIgYWxsIHByb3ZpZGVkIHBhcmFtZXRlciB2YWx1ZXMgYW5kIGNhbGwgdGhlIGFjdGlvbi5cblx0XHRcdC8vIFRoaXMgc2hhbGwgb25seSBoYXBwZW4gaWYgdmFsdWVzIGFyZSBwcm92aWRlZCBmb3IgYWxsIHRoZSBwYXJhbWV0ZXJzLCBvdGhlcndpc2UgdGhlIHBhcmFtZXRlciBkaWFsb2cgc2hhbGwgYmUgc2hvd24gd2hpY2ggaXMgZW5zdXJlZCBlYXJsaWVyXG5cdFx0XHRpZiAoYVBhcmFtZXRlclZhbHVlcykge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5hQWN0aW9uUGFyYW1ldGVyc1tpXS52YWx1ZSA9IGFQYXJhbWV0ZXJWYWx1ZXM/LmZpbmQoXG5cdFx0XHRcdFx0XHQoZWxlbWVudDogYW55KSA9PiBlbGVtZW50Lm5hbWUgPT09IG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lXG5cdFx0XHRcdFx0KT8udmFsdWU7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvciAoY29uc3QgaSBpbiBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5hQWN0aW9uUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFBY3Rpb25QYXJhbWV0ZXJzW2ldLnZhbHVlID1cblx0XHRcdFx0XHRcdG9TdGFydHVwUGFyYW1ldGVyc1ttQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5hQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZV0/LlswXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bGV0IG9PcGVyYXRpb25SZXN1bHQ6IGFueTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdG9PcGVyYXRpb25SZXN1bHQgPSBhd2FpdCBfZXhlY3V0ZUFjdGlvbihcblx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMubWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRjb25zdCBtZXNzYWdlcyA9IENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKS5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJlxuXHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmlzNDEyRXhlY3V0ZWQgJiZcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscy5sZW5ndGhcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuZGVsYXlTdWNjZXNzTWVzc2FnZXMgPSBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcy5jb25jYXQobWVzc2FnZXMpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFmdGVyQWN0aW9uUmVzb2x1dGlvbihtUGFyYW1ldGVycywgbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMsIGFjdGlvbkRlZmluaXRpb24pO1xuXHRcdFx0XHRyZXNvbHZlKG9PcGVyYXRpb25SZXN1bHQpO1xuXHRcdFx0fSBjYXRjaCB7XG5cdFx0XHRcdHJlamVjdChvT3BlcmF0aW9uUmVzdWx0KTtcblx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJlxuXHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmlzNDEyRXhlY3V0ZWQgJiZcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscy5sZW5ndGhcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnN0IHN0cmljdEhhbmRsaW5nRmFpbHMgPSBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscztcblx0XHRcdFx0XHRcdGNvbnN0IGFGYWlsZWRDb250ZXh0cyA9IFtdIGFzIGFueTtcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nRmFpbHMuZm9yRWFjaChmdW5jdGlvbiAoZmFpbDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGFGYWlsZWRDb250ZXh0cy5wdXNoKGZhaWwub0FjdGlvbi5nZXRDb250ZXh0KCkpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5hQ29udGV4dHMgPSBhRmFpbGVkQ29udGV4dHM7XG5cdFx0XHRcdFx0XHRjb25zdCBvRmFpbGVkT3BlcmF0aW9uUmVzdWx0ID0gYXdhaXQgX2V4ZWN1dGVBY3Rpb24oXG5cdFx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5tZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscyA9IFtdO1xuXHRcdFx0XHRcdFx0Q29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLmFkZE1lc3NhZ2VzKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmRlbGF5U3VjY2Vzc01lc3NhZ2VzKTtcblx0XHRcdFx0XHRcdGFmdGVyQWN0aW9uUmVzb2x1dGlvbihtUGFyYW1ldGVycywgbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMsIGFjdGlvbkRlZmluaXRpb24pO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShvRmFpbGVkT3BlcmF0aW9uUmVzdWx0KTtcblx0XHRcdFx0XHR9IGNhdGNoIChvRmFpbGVkT3BlcmF0aW9uUmVzdWx0KSB7XG5cdFx0XHRcdFx0XHRyZWplY3Qob0ZhaWxlZE9wZXJhdGlvblJlc3VsdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldCA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0KG1QYXJhbWV0ZXJzLmJHcm91cGVkICYmIHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmIHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nUHJvbWlzZXMubGVuZ3RoKSB8fFxuXHRcdFx0XHRcdGNoZWNrZm9yT3RoZXJNZXNzYWdlcyhtUGFyYW1ldGVycy5iR3JvdXBlZCkgIT09IC0xXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHNob3dHZW5lcmljRXJyb3JNZXNzYWdlRm9yQ2hhbmdlU2V0ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRtUGFyYW1ldGVycz8ubWVzc2FnZUhhbmRsZXI/LnNob3dNZXNzYWdlRGlhbG9nKHtcblx0XHRcdFx0XHRjb250cm9sOiBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycz8uY29udHJvbCxcblx0XHRcdFx0XHRvbkJlZm9yZVNob3dNZXNzYWdlOiBmdW5jdGlvbiAoYU1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyc0luOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdGFNZXNzYWdlcyxcblx0XHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW4sXG5cdFx0XHRcdFx0XHRcdHNob3dHZW5lcmljRXJyb3JNZXNzYWdlRm9yQ2hhbmdlU2V0XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHM6IG1QYXJhbWV0ZXJzLmFDb250ZXh0cyxcblx0XHRcdFx0XHRzQWN0aW9uTmFtZTogc0FjdGlvbkxhYmVsXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpIHtcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyA9IHtcblx0XHRcdFx0XHRcdGlzNDEyRXhlY3V0ZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM6IFtdLFxuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlczogW10sXG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlczogW10sXG5cdFx0XHRcdFx0XHRkZWxheVN1Y2Nlc3NNZXNzYWdlczogW10sXG5cdFx0XHRcdFx0XHRwcm9jZXNzZWRNZXNzYWdlSWRzOiBbXVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuZnVuY3Rpb24gY29uZmlybUNyaXRpY2FsQWN0aW9uKFxuXHRzQWN0aW9uTmFtZTogYW55LFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdHNBY3Rpb25MYWJlbDogYW55LFxuXHRtUGFyYW1ldGVyczogYW55LFxuXHRhQWN0aW9uUGFyYW1ldGVyczogYW55LFxuXHRhUGFyYW1ldGVyVmFsdWVzOiBhbnksXG5cdG9BY3Rpb25Db250ZXh0OiBhbnksXG5cdG9QYXJlbnRDb250cm9sOiBhbnksXG5cdGVudGl0eVNldE5hbWU6IGFueSxcblx0bWVzc2FnZUhhbmRsZXI6IGFueVxuKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0bGV0IGJvdW5kQWN0aW9uTmFtZSA9IHNBY3Rpb25OYW1lID8gc0FjdGlvbk5hbWUgOiBudWxsO1xuXHRcdGJvdW5kQWN0aW9uTmFtZSA9XG5cdFx0XHRib3VuZEFjdGlvbk5hbWUuaW5kZXhPZihcIi5cIikgPj0gMCA/IGJvdW5kQWN0aW9uTmFtZS5zcGxpdChcIi5cIilbYm91bmRBY3Rpb25OYW1lLnNwbGl0KFwiLlwiKS5sZW5ndGggLSAxXSA6IGJvdW5kQWN0aW9uTmFtZTtcblx0XHRjb25zdCBzdWZmaXhSZXNvdXJjZUtleSA9IGJvdW5kQWN0aW9uTmFtZSAmJiBlbnRpdHlTZXROYW1lID8gYCR7ZW50aXR5U2V0TmFtZX18JHtib3VuZEFjdGlvbk5hbWV9YCA6IFwiXCI7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwob1BhcmVudENvbnRyb2wpO1xuXHRcdGNvbnN0IHNDb25maXJtYXRpb25UZXh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19PUEVSQVRJT05TX0FDVElPTl9DT05GSVJNX01FU1NBR0VcIiwgdW5kZWZpbmVkLCBzdWZmaXhSZXNvdXJjZUtleSk7XG5cblx0XHRNZXNzYWdlQm94LmNvbmZpcm0oc0NvbmZpcm1hdGlvblRleHQsIHtcblx0XHRcdG9uQ2xvc2U6IGFzeW5jIGZ1bmN0aW9uIChzQWN0aW9uOiBhbnkpIHtcblx0XHRcdFx0aWYgKHNBY3Rpb24gPT09IEFjdGlvbi5PSykge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvT3BlcmF0aW9uID0gYXdhaXQgX2V4ZWN1dGVBY3Rpb24ob0FwcENvbXBvbmVudCwgbVBhcmFtZXRlcnMsIG9QYXJlbnRDb250cm9sLCBtZXNzYWdlSGFuZGxlcik7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKG9PcGVyYXRpb24pO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdFx0XHRcdFx0XHRyZWplY3Qob0Vycm9yKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KG9FcnJvcik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlc29sdmUoQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBUE1BY3Rpb24oXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0b1BhcmVudENvbnRyb2w6IGFueSxcblx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRhQ29udGV4dHM6IGFueSxcblx0b0RpYWxvZzogYW55LFxuXHRhZnRlcjQxMjogYm9vbGVhbixcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGNvbnN0IGFSZXN1bHQgPSBhd2FpdCBfZXhlY3V0ZUFjdGlvbihvQXBwQ29tcG9uZW50LCBtUGFyYW1ldGVycywgb1BhcmVudENvbnRyb2wsIG1lc3NhZ2VIYW5kbGVyLCBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyk7XG5cdC8vIElmIHNvbWUgZW50cmllcyB3ZXJlIHN1Y2Nlc3NmdWwsIGFuZCBvdGhlcnMgaGF2ZSBmYWlsZWQsIHRoZSBvdmVyYWxsIHByb2Nlc3MgaXMgc3RpbGwgc3VjY2Vzc2Z1bC4gSG93ZXZlciwgdGhpcyB3YXMgdHJlYXRlZCBhcyByZWplY3Rpb25cblx0Ly8gYmVmb3JlLCBhbmQgdGhpcyBjdXJyZW50bHkgaXMgc3RpbGwga2VwdCwgYXMgbG9uZyBhcyBkaWFsb2cgaGFuZGxpbmcgaXMgbWl4ZWQgd2l0aCBiYWNrZW5kIHByb2Nlc3MgaGFuZGxpbmcuXG5cdC8vIFRPRE86IFJlZmFjdG9yIHRvIG9ubHkgcmVqZWN0IGluIGNhc2Ugb2Ygb3ZlcmFsbCBwcm9jZXNzIGVycm9yLlxuXHQvLyBGb3IgdGhlIHRpbWUgYmVpbmc6IG1hcCB0byBvbGQgbG9naWMgdG8gcmVqZWN0IGlmIGF0IGxlYXN0IG9uZSBlbnRyeSBoYXMgZmFpbGVkXG5cdC8vIFRoaXMgY2hlY2sgaXMgb25seSBkb25lIGZvciBib3VuZCBhY3Rpb25zID0+IGFDb250ZXh0cyBub3QgZW1wdHlcblx0aWYgKG1QYXJhbWV0ZXJzLmFDb250ZXh0cz8ubGVuZ3RoKSB7XG5cdFx0aWYgKGFSZXN1bHQ/LnNvbWUoKG9TaW5nbGVSZXN1bHQ6IGFueSkgPT4gb1NpbmdsZVJlc3VsdC5zdGF0dXMgPT09IFwicmVqZWN0ZWRcIikpIHtcblx0XHRcdHRocm93IGFSZXN1bHQ7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgbWVzc2FnZXMgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiYgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuaXM0MTJFeGVjdXRlZCAmJiBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscy5sZW5ndGgpIHtcblx0XHRpZiAoIWFmdGVyNDEyKSB7XG5cdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyA9IHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmRlbGF5U3VjY2Vzc01lc3NhZ2VzLmNvbmNhdChtZXNzYWdlcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKS5hZGRNZXNzYWdlcyhzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcyk7XG5cdFx0XHRsZXQgc2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgPSBmYWxzZTtcblx0XHRcdGlmIChcblx0XHRcdFx0KG1QYXJhbWV0ZXJzLmJHcm91cGVkICYmIHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nUHJvbWlzZXMubGVuZ3RoKSB8fFxuXHRcdFx0XHRjaGVja2Zvck90aGVyTWVzc2FnZXMobVBhcmFtZXRlcnMuYkdyb3VwZWQpICE9PSAtMVxuXHRcdFx0KSB7XG5cdFx0XHRcdHNob3dHZW5lcmljRXJyb3JNZXNzYWdlRm9yQ2hhbmdlU2V0ID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGlmIChtZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRcdFx0Ly8gQk9VTkQgVFJBTlNJVElPTiBBUyBQQVJUIE9GIFNBUF9NRVNTQUdFXG5cdFx0XHRcdG9EaWFsb2cuYXR0YWNoRXZlbnRPbmNlKFwiYWZ0ZXJDbG9zZVwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coe1xuXHRcdFx0XHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKGFNZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nLFxuXHRcdFx0XHRcdFx0XHRcdGFNZXNzYWdlcyxcblx0XHRcdFx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnNJbixcblx0XHRcdFx0XHRcdFx0XHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNvbnRyb2w6IG1QYXJhbWV0ZXJzLmNvbnRyb2wsXG5cdFx0XHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0czogbVBhcmFtZXRlcnMuYUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0c0FjdGlvbk5hbWU6IG1QYXJhbWV0ZXJzLmxhYmVsXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmIChtZXNzYWdlcy5sZW5ndGgpIHtcblx0XHQvLyBCT1VORCBUUkFOU0lUSU9OIEFTIFBBUlQgT0YgU0FQX01FU1NBR0Vcblx0XHRsZXQgc2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgPSBmYWxzZTtcblx0XHRpZiAoXG5cdFx0XHQobVBhcmFtZXRlcnMuYkdyb3VwZWQgJiYgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgJiYgc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdQcm9taXNlcy5sZW5ndGgpIHx8XG5cdFx0XHRjaGVja2Zvck90aGVyTWVzc2FnZXMobVBhcmFtZXRlcnMuYkdyb3VwZWQpICE9PSAtMVxuXHRcdCkge1xuXHRcdFx0c2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgPSB0cnVlO1xuXHRcdH1cblx0XHRvRGlhbG9nLmF0dGFjaEV2ZW50T25jZShcImFmdGVyQ2xvc2VcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0bWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coe1xuXHRcdFx0XHRpc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW46IG1QYXJhbWV0ZXJzPy5vRGlhbG9nLmlzT3BlbigpLFxuXHRcdFx0XHRvbkJlZm9yZVNob3dNZXNzYWdlOiBmdW5jdGlvbiAoYU1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyc0luOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayhcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0b0RpYWxvZyxcblx0XHRcdFx0XHRcdGFNZXNzYWdlcyxcblx0XHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVyc0luLFxuXHRcdFx0XHRcdFx0c2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRjb250cm9sOiBtUGFyYW1ldGVycy5jb250cm9sLFxuXHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0czogbVBhcmFtZXRlcnMuYUNvbnRleHRzLFxuXHRcdFx0XHRzQWN0aW9uTmFtZTogbVBhcmFtZXRlcnMubGFiZWxcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIGFSZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGFmdGVyQWN0aW9uUmVzb2x1dGlvbihtUGFyYW1ldGVyczogYW55LCBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVyczogYW55LCBhY3Rpb25EZWZpbml0aW9uOiBhbnkpIHtcblx0aWYgKFxuXHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzLmxlbmd0aCAmJlxuXHRcdGFjdGlvbkRlZmluaXRpb24uJElzQm91bmRcblx0KSB7XG5cdFx0Ly9jaGVjayBmb3Igc2tpcHBpbmcgc3RhdGljIGFjdGlvbnNcblx0XHRjb25zdCBpc1N0YXRpYyA9IG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmlzU3RhdGljO1xuXHRcdGlmICghaXNTdGF0aWMpIHtcblx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChcblx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRcdEpTT04ucGFyc2UobUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRcdFx0bVBhcmFtZXRlcnMuc2VsZWN0ZWRJdGVtcyxcblx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAobUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuY29udHJvbCkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5jb250cm9sO1xuXHRcdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0Y29uc3QgYVNlbGVjdGVkQ29udGV4dHMgPSBvQ29udHJvbC5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cdFx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRKU09OLnBhcnNlKG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCksXG5cdFx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFjdGlvblBhcmFtZXRlclNob3dNZXNzYWdlQ2FsbGJhY2soXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdGFDb250ZXh0czogYW55LFxuXHRvRGlhbG9nOiBhbnksXG5cdG1lc3NhZ2VzOiBhbnksXG5cdHNob3dNZXNzYWdlUGFyYW1ldGVyc0luOiB7IHNob3dNZXNzYWdlQm94OiBib29sZWFuOyBzaG93TWVzc2FnZURpYWxvZzogYm9vbGVhbiB9LFxuXHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldDogYm9vbGVhblxuKToge1xuXHRmbkdldE1lc3NhZ2VTdWJ0aXRsZTogRnVuY3Rpb24gfCB1bmRlZmluZWQ7XG5cdHNob3dNZXNzYWdlQm94OiBib29sZWFuO1xuXHRzaG93TWVzc2FnZURpYWxvZzogYm9vbGVhbjtcblx0ZmlsdGVyZWRNZXNzYWdlczogYW55W107XG5cdHNob3dDaGFuZ2VTZXRFcnJvckRpYWxvZzogYm9vbGVhbjtcbn0ge1xuXHRsZXQgc2hvd01lc3NhZ2VCb3ggPSBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbi5zaG93TWVzc2FnZUJveCxcblx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHNob3dNZXNzYWdlUGFyYW1ldGVyc0luLnNob3dNZXNzYWdlRGlhbG9nO1xuXHRjb25zdCBvQ29udHJvbCA9IG1QYXJhbWV0ZXJzLmNvbnRyb2w7XG5cdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdGNvbnN0IHVuYm91bmRNZXNzYWdlcyA9IG1lc3NhZ2VzLmZpbHRlcihmdW5jdGlvbiAobWVzc2FnZTogYW55KSB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0VGFyZ2V0KCkgPT09IFwiXCI7XG5cdH0pO1xuXHRjb25zdCBBUERtZXNzYWdlcyA9IG1lc3NhZ2VzLmZpbHRlcihmdW5jdGlvbiAobWVzc2FnZTogYW55KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdG1lc3NhZ2UuZ2V0VGFyZ2V0ICYmXG5cdFx0XHRtZXNzYWdlLmdldFRhcmdldCgpLmluZGV4T2YobVBhcmFtZXRlcnMuYWN0aW9uTmFtZSkgIT09IC0xICYmXG5cdFx0XHRtUGFyYW1ldGVycz8uYUFjdGlvblBhcmFtZXRlcnM/LnNvbWUoZnVuY3Rpb24gKGFjdGlvblBhcmFtOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0VGFyZ2V0KCkuaW5kZXhPZihhY3Rpb25QYXJhbS4kTmFtZSkgIT09IC0xO1xuXHRcdFx0fSlcblx0XHQpO1xuXHR9KTtcblx0QVBEbWVzc2FnZXM/LmZvckVhY2goZnVuY3Rpb24gKEFQRE1lc3NhZ2U6IGFueSkge1xuXHRcdEFQRE1lc3NhZ2UuaXNBUERUYXJnZXQgPSB0cnVlO1xuXHR9KTtcblxuXHRjb25zdCBlcnJvclRhcmdldHNJbkFQRCA9IEFQRG1lc3NhZ2VzLmxlbmd0aCA/IHRydWUgOiBmYWxzZTtcblx0bGV0IGhhc0NoYW5nZVNldE1vZGlmaWVkTWVzc2FnZSA9IGZhbHNlO1xuXHRpZiAoc2hvd0dlbmVyaWNFcnJvck1lc3NhZ2VGb3JDaGFuZ2VTZXQgJiYgIWVycm9yVGFyZ2V0c0luQVBEKSB7XG5cdFx0aGFzQ2hhbmdlU2V0TW9kaWZpZWRNZXNzYWdlID0gdHJ1ZTtcblx0XHRsZXQgc01lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX0RJQUxPR19DQU5DRUxfRVJST1JfTUVTU0FHRVNfVEVYVFwiKTtcblx0XHRsZXQgc0Rlc2NyaXB0aW9uVGV4dCA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX0NBTkNFTF9FUlJPUl9NRVNTQUdFU19ERVRBSUxfVEVYVFwiKTtcblx0XHRjb25zdCBtZXNzYWdlTW9kZWwgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCk7XG5cdFx0Y29uc3QgbWVzc2FnZXNJbk1vZGVsID0gbWVzc2FnZU1vZGVsLmdldERhdGEoKTtcblx0XHRjb25zdCBhQm91bmRNZXNzYWdlcyA9IG1lc3NhZ2VIYW5kbGluZy5nZXRNZXNzYWdlcyh0cnVlKTtcblx0XHRsZXQgZ2VuZXJpY01lc3NhZ2U7XG5cdFx0Y29uc3QgaXNFZGl0YWJsZSA9IG9Db250cm9sICYmIG9Db250cm9sLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblxuXHRcdGNvbnN0IG5vbkVycm9yTWVzc2FnZUV4aXN0c0luRGlhbG9nID0gbWVzc2FnZXMuZmluZEluZGV4KGZ1bmN0aW9uIChtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZS5nZXRUeXBlKCkgPT09IFwiRXJyb3JcIiB8fCBtZXNzYWdlLmdldFR5cGUoKSA9PT0gXCJXYXJuaW5nXCI7XG5cdFx0fSk7XG5cdFx0Y29uc3Qgbm9uRXJyb3JNZXNzYWdlRXhpc3RzSW5Nb2RlbCA9IG1lc3NhZ2VzSW5Nb2RlbC5maW5kSW5kZXgoZnVuY3Rpb24gKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcblx0XHRcdHJldHVybiBtZXNzYWdlLmdldFR5cGUoKSA9PT0gXCJFcnJvclwiIHx8IG1lc3NhZ2UuZ2V0VHlwZSgpID09PSBcIldhcm5pbmdcIjtcblx0XHR9KTtcblxuXHRcdGlmIChub25FcnJvck1lc3NhZ2VFeGlzdHNJbkRpYWxvZyAhPT0gMSAmJiBub25FcnJvck1lc3NhZ2VFeGlzdHNJbk1vZGVsICE9PSAtMSkge1xuXHRcdFx0aWYgKG1lc3NhZ2VzSW5Nb2RlbC5sZW5ndGggPT09IDEgJiYgYUJvdW5kTWVzc2FnZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdGlmIChpc0VkaXRhYmxlID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdG1lc3NhZ2VzSW5Nb2RlbFswXS5zZXRNZXNzYWdlKFxuXHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfQ0FOQ0VMX1NJTkdMRV9FUlJPUl9NRVNTQUdFX1RFWFRcIikgK1xuXHRcdFx0XHRcdFx0XHRcIlxcblxcblwiICtcblx0XHRcdFx0XHRcdFx0bWVzc2FnZXNJbk1vZGVsWzBdLmdldE1lc3NhZ2UoKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c01lc3NhZ2UgPSBpc0VkaXRhYmxlXG5cdFx0XHRcdFx0XHQ/IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX0NBTkNFTF9TSU5HTEVfRVJST1JfTUVTU0FHRV9URVhUX0VESVRcIilcblx0XHRcdFx0XHRcdDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfQ0FOQ0VMX1NJTkdMRV9FUlJPUl9NRVNTQUdFX1RFWFRcIik7XG5cdFx0XHRcdFx0c0Rlc2NyaXB0aW9uVGV4dCA9IFwiXCI7XG5cdFx0XHRcdFx0Z2VuZXJpY01lc3NhZ2UgPSBuZXcgTWVzc2FnZSh7XG5cdFx0XHRcdFx0XHRtZXNzYWdlOiBzTWVzc2FnZSxcblx0XHRcdFx0XHRcdHR5cGU6IE1lc3NhZ2VUeXBlLkVycm9yLFxuXHRcdFx0XHRcdFx0dGFyZ2V0OiBcIlwiLFxuXHRcdFx0XHRcdFx0cGVyc2lzdGVudDogdHJ1ZSxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzRGVzY3JpcHRpb25UZXh0LFxuXHRcdFx0XHRcdFx0Y29kZTogXCJGRV9DVVNUT01fTUVTU0FHRV9DSEFOR0VTRVRfQUxMX0ZBSUxFRFwiXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0bWVzc2FnZXMudW5zaGlmdChnZW5lcmljTWVzc2FnZSk7XG5cdFx0XHRcdFx0aWYgKG1lc3NhZ2VzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VCb3ggPSB0cnVlO1xuXHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBmYWxzZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSB0cnVlO1xuXHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VCb3ggPSBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGdlbmVyaWNNZXNzYWdlID0gbmV3IE1lc3NhZ2Uoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6IHNNZXNzYWdlLFxuXHRcdFx0XHRcdHR5cGU6IE1lc3NhZ2VUeXBlLkVycm9yLFxuXHRcdFx0XHRcdHRhcmdldDogXCJcIixcblx0XHRcdFx0XHRwZXJzaXN0ZW50OiB0cnVlLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzRGVzY3JpcHRpb25UZXh0LFxuXHRcdFx0XHRcdGNvZGU6IFwiRkVfQ1VTVE9NX01FU1NBR0VfQ0hBTkdFU0VUX0FMTF9GQUlMRURcIlxuXHRcdFx0XHR9KTtcblx0XHRcdFx0bWVzc2FnZXMudW5zaGlmdChnZW5lcmljTWVzc2FnZSk7XG5cdFx0XHRcdGlmIChtZXNzYWdlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZUJveCA9IHRydWU7XG5cdFx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHRydWU7XG5cdFx0XHRcdFx0c2hvd01lc3NhZ2VCb3ggPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChvRGlhbG9nICYmIG9EaWFsb2cuaXNPcGVuKCkgJiYgYUNvbnRleHRzLmxlbmd0aCAhPT0gMCAmJiAhbVBhcmFtZXRlcnMuaXNTdGF0aWMpIHtcblx0XHRpZiAoIW1QYXJhbWV0ZXJzLmJHcm91cGVkKSB7XG5cdFx0XHQvL2lzb2xhdGVkXG5cdFx0XHRpZiAoYUNvbnRleHRzLmxlbmd0aCA+IDEgfHwgIWVycm9yVGFyZ2V0c0luQVBEKSB7XG5cdFx0XHRcdC8vIGRvZXMgbm90IG1hdHRlciBpZiBlcnJvciBpcyBpbiBBUEQgb3Igbm90LCBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgY29udGV4dHMgc2VsZWN0ZWQgb3IgaWYgdGhlIGVycm9yIGlzIG5vdCB0aGUgQVBELCB3ZSBjbG9zZSBpdC5cblx0XHRcdFx0Ly8gVE9ETzogRGlsYW9nIGhhbmRsaW5nIHNob3VsZCBub3QgYmUgcGFydCBvZiBtZXNzYWdlIGhhbmRsaW5nLiBSZWZhY3RvciBhY2NvcmRpbmdseSAtIGRpYWxvZyBzaG91bGQgbm90IGJlIG5lZWRlZCBpbnNpZGUgdGhpcyBtZXRob2QgLSBuZWl0aGVyXG5cdFx0XHRcdC8vIHRvIGFzayB3aGV0aGVyIGl0J3Mgb3Blbiwgbm9yIHRvIGNsb3NlL2Rlc3Ryb3kgaXQhXG5cdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghZXJyb3JUYXJnZXRzSW5BUEQpIHtcblx0XHRcdC8vY2hhbmdlc2V0XG5cdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRvRGlhbG9nLmRlc3Ryb3koKTtcblx0XHR9XG5cdH1cblx0bGV0IGZpbHRlcmVkTWVzc2FnZXM6IGFueVtdID0gW107XG5cdGNvbnN0IGJJc0FQRE9wZW4gPSBvRGlhbG9nICYmIG9EaWFsb2cuaXNPcGVuKCk7XG5cdGlmICghaGFzQ2hhbmdlU2V0TW9kaWZpZWRNZXNzYWdlKSB7XG5cdFx0aWYgKG1lc3NhZ2VzLmxlbmd0aCA9PT0gMSAmJiBtZXNzYWdlc1swXS5nZXRUYXJnZXQgJiYgbWVzc2FnZXNbMF0uZ2V0VGFyZ2V0KCkgIT09IHVuZGVmaW5lZCAmJiBtZXNzYWdlc1swXS5nZXRUYXJnZXQoKSAhPT0gXCJcIikge1xuXHRcdFx0aWYgKChvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikgPT09IGZhbHNlKSB8fCAhb0NvbnRyb2wpIHtcblx0XHRcdFx0Ly8gT1AgZWRpdCBvciBMUlxuXHRcdFx0XHRzaG93TWVzc2FnZUJveCA9ICFlcnJvclRhcmdldHNJbkFQRDtcblx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBmYWxzZTtcblx0XHRcdH0gZWxzZSBpZiAob0NvbnRyb2wgJiYgb0NvbnRyb2wuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpID09PSB0cnVlKSB7XG5cdFx0XHRcdHNob3dNZXNzYWdlQm94ID0gZmFsc2U7XG5cdFx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChvQ29udHJvbCkge1xuXHRcdFx0aWYgKG9Db250cm9sLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0aWYgKGJJc0FQRE9wZW4gJiYgZXJyb3JUYXJnZXRzSW5BUEQpIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKG9Db250cm9sLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRpZiAoIWJJc0FQRE9wZW4gJiYgZXJyb3JUYXJnZXRzSW5BUEQpIHtcblx0XHRcdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHRydWU7XG5cdFx0XHRcdFx0ZmlsdGVyZWRNZXNzYWdlcyA9IHVuYm91bmRNZXNzYWdlcy5jb25jYXQoQVBEbWVzc2FnZXMpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCFiSXNBUERPcGVuICYmIHVuYm91bmRNZXNzYWdlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHQvLyBlcnJvciB0YXJnZXRzIGluIEFQRCA9PiB0aGVyZSBpcyBhdGxlYXN0IG9uZSBib3VuZCBtZXNzYWdlLiBJZiB0aGVyZSBhcmUgdW5ib3VuZCBtZXNzYWdlcywgZGlhbG9nIG11c3QgYmUgc2hvd24uXG5cdFx0XHRcdFx0Ly8gZm9yIGRyYWZ0IGVudGl0eSwgd2UgYWxyZWFkeSBjbG9zZWQgdGhlIEFQRFxuXHRcdFx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHNob3dNZXNzYWdlQm94OiBzaG93TWVzc2FnZUJveCxcblx0XHRzaG93TWVzc2FnZURpYWxvZzogc2hvd01lc3NhZ2VEaWFsb2csXG5cdFx0ZmlsdGVyZWRNZXNzYWdlczogZmlsdGVyZWRNZXNzYWdlcy5sZW5ndGggPyBmaWx0ZXJlZE1lc3NhZ2VzIDogbWVzc2FnZXMsXG5cdFx0Zm5HZXRNZXNzYWdlU3VidGl0bGU6XG5cdFx0XHRvQ29udHJvbCAmJiBvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpICYmIG1lc3NhZ2VIYW5kbGluZy5zZXRNZXNzYWdlU3VidGl0bGUuYmluZCh7fSwgb0NvbnRyb2wsIGFDb250ZXh0cyksXG5cdFx0c2hvd0NoYW5nZVNldEVycm9yRGlhbG9nOiBtUGFyYW1ldGVycy5iR3JvdXBlZFxuXHR9O1xufVxuXG4vKlxuICogQ3VycmVudGx5LCB0aGlzIG1ldGhvZCBpcyByZXNwb25zaWJsZSBmb3Igc2hvd2luZyB0aGUgZGlhbG9nIGFuZCBleGVjdXRpbmcgdGhlIGFjdGlvbi4gVGhlIHByb21pc2UgcmV0dXJuZWQgaXMgcGVuZGluZyB3aGlsZSB3YWl0aW5nIGZvciB1c2VyIGlucHV0LCBhcyB3ZWxsIGFzIHdoaWxlIHRoZVxuICogYmFjay1lbmQgcmVxdWVzdCBpcyBydW5uaW5nLiBUaGUgcHJvbWlzZSBpcyByZWplY3RlZCB3aGVuIHRoZSB1c2VyIGNhbmNlbHMgdGhlIGRpYWxvZyBhbmQgYWxzbyB3aGVuIHRoZSBiYWNrLWVuZCByZXF1ZXN0IGZhaWxzLlxuICogVE9ETzogUmVmYWN0b3Jpbmc6IFNlcGFyYXRlIGRpYWxvZyBoYW5kbGluZyBmcm9tIGJhY2tlbmQgcHJvY2Vzc2luZy4gRGlhbG9nIGhhbmRsaW5nIHNob3VsZCByZXR1cm4gYSBQcm9taXNlIHJlc29sdmluZyB0byBwYXJhbWV0ZXJzIHRvIGJlIHByb3ZpZGVkIHRvIGJhY2tlbmQuIElmIGRpYWxvZyBpc1xuICogY2FuY2VsbGVkLCB0aGF0IHByb21pc2UgY2FuIGJlIHJlamVjdGVkLiBNZXRob2QgcmVzcG9uc2libGUgZm9yIGJhY2tlbmQgcHJvY2Vzc2luZyBuZWVkIHRvIGRlYWwgd2l0aCBtdWx0aXBsZSBjb250ZXh0cyAtIGkuZS4gaXQgc2hvdWxkIGVpdGhlciByZXR1cm4gYW4gYXJyYXkgb2YgUHJvbWlzZXMgb3JcbiAqIGEgUHJvbWlzZSByZXNvbHZpbmcgdG8gYW4gYXJyYXkuIEluIHRoZSBsYXR0ZXIgY2FzZSwgdGhhdCBQcm9taXNlIHNob3VsZCBiZSByZXNvbHZlZCBhbHNvIHdoZW4gc29tZSBvciBldmVuIGFsbCBjb250ZXh0cyBmYWlsZWQgaW4gYmFja2VuZCAtIHRoZSBvdmVyYWxsIHByb2Nlc3Mgc3RpbGwgd2FzXG4gKiBzdWNjZXNzZnVsLlxuICpcbiAqL1xuXG5mdW5jdGlvbiBzaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nKFxuXHRzQWN0aW9uTmFtZTogc3RyaW5nLFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdHNBY3Rpb25MYWJlbDogc3RyaW5nLFxuXHRtUGFyYW1ldGVyczogYW55LFxuXHRhQWN0aW9uUGFyYW1ldGVyczogQWN0aW9uUGFyYW1ldGVyW10sXG5cdGFQYXJhbWV0ZXJWYWx1ZXM6IGFueSxcblx0b0FjdGlvbkNvbnRleHQ6IGFueSxcblx0b1BhcmVudENvbnRyb2w6IGFueSxcblx0ZW50aXR5U2V0TmFtZTogYW55LFxuXHRtZXNzYWdlSGFuZGxlcjogYW55LFxuXHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcz86IFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG4pIHtcblx0Y29uc3Qgc1BhdGggPSBfZ2V0UGF0aChvQWN0aW9uQ29udGV4dCwgc0FjdGlvbk5hbWUpLFxuXHRcdG1ldGFNb2RlbCA9IG9BY3Rpb25Db250ZXh0LmdldE1vZGVsKCkub01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdGVudGl0eVNldENvbnRleHQgPSBtZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpLFxuXHRcdHNBY3Rpb25OYW1lUGF0aCA9IG9BY3Rpb25Db250ZXh0LmdldE9iamVjdChcIiRJc0JvdW5kXCIpXG5cdFx0XHQ/IG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKS5zcGxpdChcIi9AJHVpNS5vdmVybG9hZC8wXCIpWzBdXG5cdFx0XHQ6IG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKS5zcGxpdChcIi8wXCIpWzBdLFxuXHRcdGFjdGlvbk5hbWVDb250ZXh0ID0gbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBY3Rpb25OYW1lUGF0aCksXG5cdFx0YklzQ3JlYXRlQWN0aW9uID0gbVBhcmFtZXRlcnMuaXNDcmVhdGVBY3Rpb24sXG5cdFx0c0ZyYWdtZW50TmFtZSA9IFwic2FwL2ZlL2NvcmUvY29udHJvbHMvQWN0aW9uUGFyYW1ldGVyRGlhbG9nXCI7XG5cdHJldHVybiBuZXcgUHJvbWlzZShhc3luYyBmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0bGV0IGFjdGlvblBhcmFtZXRlckluZm9zOiBBY3Rpb25QYXJhbWV0ZXJJbmZvW107IC8vIHRvIGJlIGZpbGxlZCBhZnRlciBmcmFnbWVudCAoZm9yIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nKSBpcyBsb2FkZWQuIEFjdHVhbGx5IG9ubHkgbmVlZGVkIGR1cmluZyBkaWFsb2cgcHJvY2Vzc2luZywgaS5lLiBjb3VsZCBiZSBtb3ZlZCBpbnRvIHRoZSBjb250cm9sbGVyIGFuZCBkaXJlY3RseSBpbml0aWFsaXplZCB0aGVyZSwgYnV0IG9ubHkgYWZ0ZXIgbW92aW5nIGFsbCBoYW5kbGVycyAoZXNwLiBwcmVzcyBoYW5kbGVyIGZvciBhY3Rpb24gYnV0dG9uKSB0byBjb250cm9sbGVyLlxuXG5cdFx0Y29uc3QgbWVzc2FnZU1hbmFnZXIgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cblx0XHRjb25zdCBfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlciA9IChwYXJhbWV0ZXI6IEFjdGlvblBhcmFtZXRlcikgPT4ge1xuXHRcdFx0Y29uc3QgYWxsTWVzc2FnZXMgPSBtZXNzYWdlTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0XHRjb25zdCBjb250cm9sSWQgPSBnZW5lcmF0ZShbXCJBUERfXCIsIHBhcmFtZXRlci4kTmFtZV0pO1xuXHRcdFx0Ly8gYWxzbyByZW1vdmUgbWVzc2FnZXMgYXNzaWduZWQgdG8gaW5uZXIgY29udHJvbHMsIGJ1dCBhdm9pZCByZW1vdmluZyBtZXNzYWdlcyBmb3IgZGlmZmVyZW50IHBhcmFtdGVycyAod2l0aCBuYW1lIGJlaW5nIHN1YnN0cmluZyBvZiBhbm90aGVyIHBhcmFtZXRlciBuYW1lKVxuXHRcdFx0Y29uc3QgcmVsZXZhbnRNZXNzYWdlcyA9IGFsbE1lc3NhZ2VzLmZpbHRlcigobXNnOiBNZXNzYWdlKSA9PlxuXHRcdFx0XHRtc2cuZ2V0Q29udHJvbElkcygpLnNvbWUoKGlkOiBzdHJpbmcpID0+IGNvbnRyb2xJZC5zcGxpdChcIi1cIikuaW5jbHVkZXMoaWQpKVxuXHRcdFx0KTtcblx0XHRcdG1lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKHJlbGV2YW50TWVzc2FnZXMpO1xuXHRcdH07XG5cblx0XHRjb25zdCBvQ29udHJvbGxlciA9IHtcblx0XHRcdGhhbmRsZUNoYW5nZTogYXN5bmMgZnVuY3Rpb24gKG9FdmVudDogRXZlbnQpIHtcblx0XHRcdFx0Y29uc3QgZmllbGQgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0XHRcdGNvbnN0IGFjdGlvblBhcmFtZXRlckluZm8gPSBhY3Rpb25QYXJhbWV0ZXJJbmZvcy5maW5kKFxuXHRcdFx0XHRcdChhY3Rpb25QYXJhbWV0ZXJJbmZvKSA9PiBhY3Rpb25QYXJhbWV0ZXJJbmZvLmZpZWxkID09PSBmaWVsZFxuXHRcdFx0XHQpIGFzIEFjdGlvblBhcmFtZXRlckluZm87XG5cdFx0XHRcdC8vIGZpZWxkIHZhbHVlIGlzIGJlaW5nIGNoYW5nZWQsIHRodXMgZXhpc3RpbmcgbWVzc2FnZXMgcmVsYXRlZCB0byB0aGF0IGZpZWxkIGFyZSBub3QgdmFsaWQgYW55bW9yZVxuXHRcdFx0XHRfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlcihhY3Rpb25QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlcik7XG5cdFx0XHRcdC8vIGFkYXB0IGluZm8uIFByb21pc2UgaXMgcmVzb2x2ZWQgdG8gdmFsdWUgb3IgcmVqZWN0ZWQgd2l0aCBleGNlcHRpb24gY29udGFpbmluZyBtZXNzYWdlXG5cdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8udmFsaWRhdGlvblByb21pc2UgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicHJvbWlzZVwiKSBhcyBQcm9taXNlPHN0cmluZz47XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mby52YWx1ZSA9IGF3YWl0IGFjdGlvblBhcmFtZXRlckluZm8udmFsaWRhdGlvblByb21pc2U7XG5cdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mby5oYXNFcnJvciA9IGZhbHNlO1xuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdGRlbGV0ZSBhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbHVlO1xuXHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8uaGFzRXJyb3IgPSB0cnVlO1xuXHRcdFx0XHRcdF9hZGRNZXNzYWdlRm9yQWN0aW9uUGFyYW1ldGVyKG1lc3NhZ2VNYW5hZ2VyLCBbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm86IGFjdGlvblBhcmFtZXRlckluZm8sXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2U6IChlcnJvciBhcyB7IG1lc3NhZ2U6IHN0cmluZyB9KS5tZXNzYWdlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cdFx0Y29uc3Qgb1BhcmFtZXRlck1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHQkZGlzcGxheU1vZGU6IHt9XG5cdFx0fSk7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgY3JlYXRlZEZyYWdtZW50ID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdG9GcmFnbWVudCxcblx0XHRcdFx0eyBuYW1lOiBzRnJhZ21lbnROYW1lIH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdGFjdGlvbjogb0FjdGlvbkNvbnRleHQsXG5cdFx0XHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb25OYW1lQ29udGV4dCxcblx0XHRcdFx0XHRcdGVudGl0eVNldDogZW50aXR5U2V0Q29udGV4dFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb246IG9BY3Rpb25Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb25OYW1lQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBlbnRpdHlTZXRDb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IGVudGl0eVNldENvbnRleHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHRcdC8vIFRPRE86IG1vdmUgdGhlIGRpYWxvZyBpbnRvIHRoZSBmcmFnbWVudCBhbmQgbW92ZSB0aGUgaGFuZGxlcnMgdG8gdGhlIG9Db250cm9sbGVyXG5cdFx0XHRjb25zdCBhQ29udGV4dHM6IGFueVtdID0gbVBhcmFtZXRlcnMuYUNvbnRleHRzIHx8IFtdO1xuXHRcdFx0Y29uc3QgYUZ1bmN0aW9uUGFyYW1zOiBhbnlbXSA9IFtdO1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxuXHRcdFx0bGV0IG9PcGVyYXRpb25CaW5kaW5nOiBhbnk7XG5cdFx0XHRhd2FpdCBDb21tb25VdGlscy5zZXRVc2VyRGVmYXVsdHMob0FwcENvbXBvbmVudCwgYUFjdGlvblBhcmFtZXRlcnMsIG9QYXJhbWV0ZXJNb2RlbCwgdHJ1ZSk7XG5cdFx0XHRjb25zdCBvRGlhbG9nQ29udGVudCA9IChhd2FpdCBGcmFnbWVudC5sb2FkKHtcblx0XHRcdFx0ZGVmaW5pdGlvbjogY3JlYXRlZEZyYWdtZW50LFxuXHRcdFx0XHRjb250cm9sbGVyOiBvQ29udHJvbGxlclxuXHRcdFx0fSkpIGFzIENvbnRyb2w7XG5cblx0XHRcdGFjdGlvblBhcmFtZXRlckluZm9zID0gYUFjdGlvblBhcmFtZXRlcnMubWFwKChhY3Rpb25QYXJhbWV0ZXIpID0+IHtcblx0XHRcdFx0Y29uc3QgZmllbGQgPSBDb3JlLmJ5SWQoZ2VuZXJhdGUoW1wiQVBEX1wiLCBhY3Rpb25QYXJhbWV0ZXIuJE5hbWVdKSkgYXMgRmllbGQgfCBNdWx0aVZhbHVlRmllbGQ7XG5cdFx0XHRcdGNvbnN0IGlzTXVsdGlWYWx1ZSA9IGZpZWxkLmlzQShcInNhcC51aS5tZGMuTXVsdGlWYWx1ZUZpZWxkXCIpO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHBhcmFtZXRlcjogYWN0aW9uUGFyYW1ldGVyLFxuXHRcdFx0XHRcdGZpZWxkOiBmaWVsZCxcblx0XHRcdFx0XHRpc011bHRpVmFsdWU6IGlzTXVsdGlWYWx1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9QYXJlbnRDb250cm9sKTtcblx0XHRcdGxldCBhY3Rpb25SZXN1bHQgPSB7XG5cdFx0XHRcdGRpYWxvZ0NhbmNlbGxlZDogdHJ1ZSwgLy8gdG8gYmUgc2V0IHRvIGZhbHNlIGluIGNhc2Ugb2Ygc3VjY2Vzc2Z1bCBhY3Rpb24gZXhlY3Rpb25cblx0XHRcdFx0cmVzdWx0OiB1bmRlZmluZWRcblx0XHRcdH07XG5cdFx0XHRjb25zdCBvRGlhbG9nID0gbmV3IERpYWxvZyhnZW5lcmF0ZShbXCJmZVwiLCBcIkFQRF9cIiwgc0FjdGlvbk5hbWVdKSwge1xuXHRcdFx0XHR0aXRsZTogc0FjdGlvbkxhYmVsIHx8IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfT1BFUkFUSU9OU19BQ1RJT05fUEFSQU1FVEVSX0RJQUxPR19USVRMRVwiKSxcblx0XHRcdFx0Y29udGVudDogW29EaWFsb2dDb250ZW50XSxcblx0XHRcdFx0ZXNjYXBlSGFuZGxlcjogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIGVzY2FwZSBoYW5kbGVyIGlzIG1lYW50IHRvIHBvc3NpYmx5IHN1cHByZXNzIG9yIHBvc3Rwb25lIGNsb3NpbmcgdGhlIGRpYWxvZyBvbiBlc2NhcGUgKGJ5IGNhbGxpbmcgXCJyZWplY3RcIiBvbiB0aGUgcHJvdmlkZWQgb2JqZWN0LCBvciBcInJlc29sdmVcIiBvbmx5IHdoZW5cblx0XHRcdFx0XHQvLyBkb25lIHdpdGggYWxsIHRhc2tzIHRvIGhhcHBlbiBiZWZvcmUgZGlhbG9nIGNhbiBiZSBjbG9zZWQpLiBJdCdzIG5vdCBpbnRlbmRlZCB0byBleHBsaWNldGx5IGNsb3NlIHRoZSBkaWFsb2cgaGVyZSAodGhhdCBoYXBwZW5zIGF1dG9tYXRpY2FsbHkgd2hlbiBub1xuXHRcdFx0XHRcdC8vIGVzY2FwZUhhbmRsZXIgaXMgcHJvdmlkZWQgb3IgdGhlIHJlc29sdmUtY2FsbGJhY2sgaXMgY2FsbGVkKSBvciBmb3Igb3duIHdyYXAgdXAgdGFza3MgKGxpa2UgcmVtb3ZpbmcgdmFsaWRpdGlvbiBtZXNzYWdlcyAtIHRoaXMgc2hvdWxkIGhhcHBlbiBpbiB0aGVcblx0XHRcdFx0XHQvLyBhZnRlckNsb3NlKS5cblx0XHRcdFx0XHQvLyBUT0RPOiBNb3ZlIHdyYXAgdXAgdGFza3MgdG8gYWZ0ZXJDbG9zZSwgYW5kIHJlbW92ZSB0aGlzIG1ldGhvZCBjb21wbGV0ZWx5LiBUYWtlIGNhcmUgdG8gYWxzbyBhZGFwdCBlbmQgYnV0dG9uIHByZXNzIGhhbmRsZXIgYWNjb3JkaW5nbHkuXG5cdFx0XHRcdFx0Ly8gQ3VycmVudGx5IG9ubHkgc3RpbGwgbmVlZGVkIHRvIGRpZmZlcmVudGlhdGUgY2xvc2luZyBkaWFsb2cgYWZ0ZXIgc3VjY2Vzc2Z1bCBleGVjdXRpb24gKHVzZXMgcmVzb2x2ZSkgZnJvbSB1c2VyIGNhbmNlbGxhdGlvbiAodXNpbmcgcmVqZWN0KVxuXHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHQvL1x0XHRyZWplY3QoQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZyk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGJlZ2luQnV0dG9uOiBuZXcgQnV0dG9uKGdlbmVyYXRlKFtcImZlXCIsIFwiQVBEX1wiLCBzQWN0aW9uTmFtZSwgXCJBY3Rpb25cIiwgXCJPa1wiXSksIHtcblx0XHRcdFx0XHR0ZXh0OiBiSXNDcmVhdGVBY3Rpb25cblx0XHRcdFx0XHRcdD8gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfU0FQRkVfQUNUSU9OX0NSRUFURV9CVVRUT05cIilcblx0XHRcdFx0XHRcdDogX2dldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWUocmVzb3VyY2VNb2RlbCwgc0FjdGlvbkxhYmVsLCBzQWN0aW9uTmFtZSwgZW50aXR5U2V0TmFtZSksXG5cdFx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdFx0cHJlc3M6IGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGlmICghKGF3YWl0IF92YWxpZGF0ZVByb3BlcnRpZXMobWVzc2FnZU1hbmFnZXIsIGFjdGlvblBhcmFtZXRlckluZm9zLCByZXNvdXJjZU1vZGVsKSkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRCdXN5TG9ja2VyLmxvY2sob0RpYWxvZyk7XG5cblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHQvLyBUT0RPOiBkdWUgdG8gdXNpbmcgdGhlIHNlYXJjaCBhbmQgdmFsdWUgaGVscHMgb24gdGhlIGFjdGlvbiBkaWFsb2cgdHJhbnNpZW50IG1lc3NhZ2VzIGNvdWxkIGFwcGVhclxuXHRcdFx0XHRcdFx0XHRcdC8vIHdlIG5lZWQgYW4gVVggZGVzaWduIGZvciB0aG9zZSB0byBzaG93IHRoZW0gdG8gdGhlIHVzZXIgLSBmb3Igbm93IHJlbW92ZSB0aGVtIGJlZm9yZSBjb250aW51aW5nXG5cdFx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gbW92ZSBwYXJhbWV0ZXIgdmFsdWVzIGZyb20gRGlhbG9nIChTaW1wbGVGb3JtKSB0byBtUGFyYW1ldGVycy5hY3Rpb25QYXJhbWV0ZXJzIHNvIHRoYXQgdGhleSBhcmUgYXZhaWxhYmxlIGluIHRoZSBvcGVyYXRpb24gYmluZGluZ3MgZm9yIGFsbCBjb250ZXh0c1xuXHRcdFx0XHRcdFx0XHRcdGxldCB2UGFyYW1ldGVyVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1BhcmFtZXRlckNvbnRleHQgPSBvT3BlcmF0aW9uQmluZGluZyAmJiBvT3BlcmF0aW9uQmluZGluZy5nZXRQYXJhbWV0ZXJDb250ZXh0KCk7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoYUFjdGlvblBhcmFtZXRlcnNbaV0uJGlzQ29sbGVjdGlvbikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBhTVZGQ29udGVudCA9IChvRGlhbG9nLmdldE1vZGVsKFwibXZmdmlld1wiKSBhcyBKU09OTW9kZWwpLmdldFByb3BlcnR5KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YC8ke2FBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lfWBcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFLZXlWYWx1ZXMgPSBbXTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBqIGluIGFNVkZDb250ZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YUtleVZhbHVlcy5wdXNoKGFNVkZDb250ZW50W2pdLktleSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0dlBhcmFtZXRlclZhbHVlID0gYUtleVZhbHVlcztcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZQYXJhbWV0ZXJWYWx1ZSA9IG9QYXJhbWV0ZXJDb250ZXh0LmdldFByb3BlcnR5KGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2ldLnZhbHVlID0gdlBhcmFtZXRlclZhbHVlOyAvLyB3cml0aW5nIHRoZSBjdXJyZW50IHZhbHVlICh1ZXNlciBpbnB1dCEpIGludG8gdGhlIG1ldGFtb2RlbCA9PiBzaG91bGQgYmUgcmVmYWN0b3JlZCB0byB1c2UgQWN0aW9uUGFyYW1ldGVySW5mb3MgaW5zdGVhZC4gVXNlZCBpbiBzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWVcblx0XHRcdFx0XHRcdFx0XHRcdHZQYXJhbWV0ZXJWYWx1ZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubGFiZWwgPSBzQWN0aW9uTGFiZWw7XG5cdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFSZXN1bHQgPSBhd2FpdCBleGVjdXRlQVBNQWN0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0b1BhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9EaWFsb2csXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdGFjdGlvblJlc3VsdCA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGlhbG9nQ2FuY2VsbGVkOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVzdWx0OiBhUmVzdWx0XG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gcmVzb2x2ZShhUmVzdWx0KTtcblx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgbWVzc2FnZXMgPSBzYXAudWkuZ2V0Q29yZSgpLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmRlbGF5U3VjY2Vzc01lc3NhZ2VzID1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5kZWxheVN1Y2Nlc3NNZXNzYWdlcy5jb25jYXQobWVzc2FnZXMpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0dGhyb3cgb0Vycm9yO1xuXHRcdFx0XHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmlzNDEyRXhlY3V0ZWQgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHMubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzdHJpY3RIYW5kbGluZ0ZhaWxzID0gc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgYUZhaWxlZENvbnRleHRzID0gW10gYXMgYW55O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nRmFpbHMuZm9yRWFjaChmdW5jdGlvbiAoZmFpbDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhRmFpbGVkQ29udGV4dHMucHVzaChmYWlsLm9BY3Rpb24uZ2V0Q29udGV4dCgpKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5hQ29udGV4dHMgPSBhRmFpbGVkQ29udGV4dHM7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgYVJlc3VsdCA9IGF3YWl0IGV4ZWN1dGVBUE1BY3Rpb24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFjdGlvblJlc3VsdCA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRpYWxvZ0NhbmNlbGxlZDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQ6IGFSZXN1bHRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIHJlc29sdmUoYVJlc3VsdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmlzNDEyRXhlY3V0ZWQgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Q29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLmFkZE1lc3NhZ2VzKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLmRlbGF5U3VjY2Vzc01lc3NhZ2VzKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHNob3dHZW5lcmljRXJyb3JNZXNzYWdlRm9yQ2hhbmdlU2V0ID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KG1QYXJhbWV0ZXJzLmJHcm91cGVkICYmIHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nUHJvbWlzZXMubGVuZ3RoKSB8fFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y2hlY2tmb3JPdGhlck1lc3NhZ2VzKG1QYXJhbWV0ZXJzLmJHcm91cGVkKSAhPT0gLTFcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNob3dHZW5lcmljRXJyb3JNZXNzYWdlRm9yQ2hhbmdlU2V0ID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0aXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2dPcGVuOiBvRGlhbG9nLmlzT3BlbigpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKGFNZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFNZXNzYWdlcyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnNJbixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFTZWxlY3RlZENvbnRleHRzOiBtUGFyYW1ldGVycy5hQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzQWN0aW9uTmFtZTogc0FjdGlvbkxhYmVsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKG9EaWFsb2cpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9EaWFsb2cpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRsZXQgc2hvd01lc3NhZ2VEaWFsb2cgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdGxldCBzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdChtUGFyYW1ldGVycy5iR3JvdXBlZCAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1Byb21pc2VzLmxlbmd0aCkgfHxcblx0XHRcdFx0XHRcdFx0XHRcdGNoZWNrZm9yT3RoZXJNZXNzYWdlcyhtUGFyYW1ldGVycy5iR3JvdXBlZCkgIT09IC0xXG5cdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRzaG93R2VuZXJpY0Vycm9yTWVzc2FnZUZvckNoYW5nZVNldCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcyh7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0OiBtUGFyYW1ldGVycy5hQ29udGV4dHNbMF0sXG5cdFx0XHRcdFx0XHRcdFx0XHRpc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW46IG9EaWFsb2cuaXNPcGVuKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlUGFnZU5hdmlnYXRpb25DYWxsYmFjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKGFNZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFdoeSBpcyB0aGlzIGltcGxlbWVudGVkIGFzIGNhbGxiYWNrPyBBcHBhcmVudGx5LCBhbGwgbmVlZGVkIGluZm9ybWF0aW9uIGlzIGF2YWlsYWJsZSBiZWZvcmVoYW5kXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFRPRE86IHJlZmFjdG9yIGFjY29yZGluZ2x5XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNob3dNZXNzYWdlUGFyYW1ldGVycyA9IGFjdGlvblBhcmFtZXRlclNob3dNZXNzYWdlQ2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9EaWFsb2csXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YU1lc3NhZ2VzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVyc0luLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNob3dHZW5lcmljRXJyb3JNZXNzYWdlRm9yQ2hhbmdlU2V0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlRGlhbG9nO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdGFTZWxlY3RlZENvbnRleHRzOiBtUGFyYW1ldGVycy5hQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRzQWN0aW9uTmFtZTogc0FjdGlvbkxhYmVsLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udHJvbDogbVBhcmFtZXRlcnMuY29udHJvbFxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0Ly8gSW4gY2FzZSBvZiBiYWNrZW5kIHZhbGlkYXRpb24gZXJyb3Iocz8pLCBtZXNzYWdlIHNoYWxsIG5vdCBiZSBzaG93biBpbiBtZXNzYWdlIGRpYWxvZyBidXQgbmV4dCB0byB0aGUgZmllbGQgb24gcGFyYW1ldGVyIGRpYWxvZywgd2hpY2ggc2hvdWxkXG5cdFx0XHRcdFx0XHRcdFx0Ly8gc3RheSBvcGVuIGluIHRoaXMgY2FzZSA9PiBpbiB0aGlzIGNhc2UsIHdlIG11c3Qgbm90IHJlc29sdmUgb3IgcmVqZWN0IHRoZSBwcm9taXNlIGNvbnRyb2xsaW5nIHRoZSBwYXJhbWV0ZXIgZGlhbG9nLlxuXHRcdFx0XHRcdFx0XHRcdC8vIEluIGFsbCBvdGhlciBjYXNlcyAoZS5nLiBvdGhlciBiYWNrZW5kIGVycm9ycyBvciB1c2VyIGNhbmNlbGxhdGlvbiksIHRoZSBwcm9taXNlIGNvbnRyb2xsaW5nIHRoZSBwYXJhbWV0ZXIgZGlhbG9nIG5lZWRzIHRvIGJlIHJlamVjdGVkIHRvIGFsbG93XG5cdFx0XHRcdFx0XHRcdFx0Ly8gY2FsbGVycyB0byByZWFjdC4gKEV4YW1wbGU6IElmIGNyZWF0aW9uIGluIGJhY2tlbmQgYWZ0ZXIgbmF2aWdhdGlvbiB0byB0cmFuc2llbnQgY29udGV4dCBmYWlscywgYmFjayBuYXZpZ2F0aW9uIG5lZWRzIHRvIGJlIHRyaWdnZXJlZClcblx0XHRcdFx0XHRcdFx0XHQvLyBUT0RPOiBSZWZhY3RvciB0byBzZXBhcmF0ZSBkaWFsb2cgaGFuZGxpbmcgZnJvbSBiYWNrZW5kIHJlcXVlc3QgaXN0ZWFkIG9mIHRha2luZyBkZWNpc2lvbiBiYXNlZCBvbiBtZXNzYWdlIGhhbmRsaW5nXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNob3dNZXNzYWdlRGlhbG9nKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob0RpYWxvZy5pc09wZW4oKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBkbyBub3RoaW5nLCBkbyBub3QgcmVqZWN0IHByb21pc2UgaGVyZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBXZSBkbyBub3QgY2xvc2UgdGhlIEFQTSBkaWFsb2cgaWYgdXNlciBlbnRlcnMgYSB3cm9uZyB2YWx1ZSBpbiBvZiB0aGUgZmllbGRzIHRoYXQgcmVzdWx0cyBpbiBhbiBlcnJvciBmcm9tIHRoZSBiYWNrZW5kLlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBUaGUgdXNlciBjYW4gY2xvc2UgdGhlIG1lc3NhZ2UgZGlhbG9nIGFuZCB0aGUgQVBNIGRpYWxvZyB3b3VsZCBzdGlsbCBiZSBvcGVuIG9uIHdoaWNoIGhlIGNvdWxkIGVudGVyIGEgbmV3IHZhbHVlIGFuZCB0cmlnZ2VyIHRoZSBhY3Rpb24gYWdhaW4uXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIEVhcmxpZXIgd2Ugd2VyZSByZWplY3RpbmcgdGhlIHByb21pc2Ugb24gZXJyb3IgaGVyZSwgYW5kIHRoZSBjYWxsIHN0YWNrIHdhcyBkZXN0cm95ZWQgYXMgdGhlIHByb21pc2Ugd2FzIHJlamVjdGVkIGFuZCByZXR1cm5lZCB0byBFZGl0RmxvdyBpbnZva2UgYWN0aW9uLlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBCdXQgc2luY2UgdGhlIEFQTSBkaWFsb2cgd2FzIHN0aWxsIG9wZW4sIGEgbmV3IHByb21pc2Ugd2FzIHJlc29sdmVkIGluIGNhc2UgdGhlIHVzZXIgcmV0cmllZCB0aGUgYWN0aW9uIGFuZCB0aGUgb2JqZWN0IHdhcyBjcmVhdGVkLCBidXQgdGhlIG5hdmlnYXRpb24gdG8gb2JqZWN0IHBhZ2Ugd2FzIG5vdCB0YWtpbmcgcGxhY2UuXG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZWplY3Qob0Vycm9yKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzdHJpY3RIYW5kbGluZ1V0aWxpdGllcykge1xuXHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0aXM0MTJFeGVjdXRlZDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlsczogW10sXG5cdFx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1Byb21pc2VzOiBbXSxcblx0XHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzOiBbXSxcblx0XHRcdFx0XHRcdFx0XHRcdGRlbGF5U3VjY2Vzc01lc3NhZ2VzOiBbXSxcblx0XHRcdFx0XHRcdFx0XHRcdHByb2Nlc3NlZE1lc3NhZ2VJZHM6IFtdXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvRGlhbG9nKSkge1xuXHRcdFx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9EaWFsb2cpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSxcblx0XHRcdFx0ZW5kQnV0dG9uOiBuZXcgQnV0dG9uKGdlbmVyYXRlKFtcImZlXCIsIFwiQVBEX1wiLCBzQWN0aW9uTmFtZSwgXCJBY3Rpb25cIiwgXCJDYW5jZWxcIl0pLCB7XG5cdFx0XHRcdFx0dGV4dDogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fQUNUSU9OX1BBUkFNRVRFUl9ESUFMT0dfQ0FOQ0VMXCIpLFxuXHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHQvLyBUT0RPOiBjYW5jZWwgYnV0dG9uIHNob3VsZCBqdXN0IGNsb3NlIHRoZSBkaWFsb2cgKHNpbWlsYXIgdG8gdXNpbmcgZXNjYXBlKS4gQWxsIHdyYXAgdXAgdGFza3Mgc2hvdWxkIGJlIG1vdmVkIHRvIGFmdGVyQ2xvc2UuXG5cdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHQvLyByZWplY3QoQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSxcblx0XHRcdFx0Ly8gVE9ETzogYmVmb3JlT3BlbiBpcyBqdXN0IGFuIGV2ZW50LCBpLmUuIG5vdCB3YWl0aW5nIGZvciB0aGUgUHJvbWlzZSB0byBiZSByZXNvbHZlZC4gQ2hlY2sgaWYgdGFza3Mgb2YgdGhpcyBmdW5jdGlvbiBuZWVkIHRvIGJlIGRvbmUgYmVmb3JlIG9wZW5pbmcgdGhlIGRpYWxvZ1xuXHRcdFx0XHQvLyAtIGlmIHllcywgdGhleSBuZWVkIHRvIGJlIG1vdmVkIG91dHNpZGUuXG5cdFx0XHRcdC8vIEFzc3VtcHRpb246IFNvbWV0aW1lcyBkaWFsb2cgY2FuIGJlIHNlZW4gd2l0aG91dCBhbnkgZmllbGRzIGZvciBhIHNob3J0IHRpbWUgLSBtYXliZSB0aGlzIGlzIGNhdXNlZCBieSB0aGlzIGFzeW5jaHJvbml0eVxuXHRcdFx0XHRiZWZvcmVPcGVuOiBhc3luYyBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0XHQvLyBjbG9uZSBldmVudCBmb3IgYWN0aW9uV3JhcHBlciBhcyBvRXZlbnQub1NvdXJjZSBnZXRzIGxvc3QgZHVyaW5nIHByb2Nlc3Npbmcgb2YgYmVmb3JlT3BlbiBldmVudCBoYW5kbGVyXG5cdFx0XHRcdFx0Y29uc3Qgb0Nsb25lRXZlbnQgPSBPYmplY3QuYXNzaWduKHt9LCBvRXZlbnQpO1xuXG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0Y29uc3QgZ2V0RGVmYXVsdFZhbHVlc0Z1bmN0aW9uID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IChvRGlhbG9nLmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdFx0XHRcdHNBY3Rpb25QYXRoID0gb0FjdGlvbkNvbnRleHQuc1BhdGggJiYgb0FjdGlvbkNvbnRleHQuc1BhdGguc3BsaXQoXCIvQFwiKVswXSxcblx0XHRcdFx0XHRcdFx0c0RlZmF1bHRWYWx1ZXNGdW5jdGlvbiA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdFx0XHRcdGAke3NBY3Rpb25QYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uYFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNEZWZhdWx0VmFsdWVzRnVuY3Rpb247XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRjb25zdCBmblNldERlZmF1bHRzQW5kT3BlbkRpYWxvZyA9IGFzeW5jIGZ1bmN0aW9uIChzQmluZGluZ1BhcmFtZXRlcj86IGFueSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc0JvdW5kRnVuY3Rpb25OYW1lID0gZ2V0RGVmYXVsdFZhbHVlc0Z1bmN0aW9uKCk7XG5cdFx0XHRcdFx0XHRjb25zdCBwcmVmaWxsUGFyYW1ldGVyID0gYXN5bmMgZnVuY3Rpb24gKHNQYXJhbU5hbWU6IGFueSwgdlBhcmFtRGVmYXVsdFZhbHVlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gQ2FzZSAxOiBUaGVyZSBpcyBhIFBhcmFtZXRlckRlZmF1bHRWYWx1ZSBhbm5vdGF0aW9uXG5cdFx0XHRcdFx0XHRcdGlmICh2UGFyYW1EZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhQ29udGV4dHMubGVuZ3RoID4gMCAmJiB2UGFyYW1EZWZhdWx0VmFsdWUuJFBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldCB2UGFyYW1WYWx1ZSA9IGF3YWl0IENvbW1vblV0aWxzLnJlcXVlc3RTaW5nbGV0b25Qcm9wZXJ0eShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1EZWZhdWx0VmFsdWUuJFBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodlBhcmFtVmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1WYWx1ZSA9IGF3YWl0IG9PcGVyYXRpb25CaW5kaW5nXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQuZ2V0UGFyYW1ldGVyQ29udGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQucmVxdWVzdFByb3BlcnR5KHZQYXJhbURlZmF1bHRWYWx1ZS4kUGF0aCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGFDb250ZXh0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gRm9yIG11bHRpIHNlbGVjdCwgbmVlZCB0byBsb29wIG92ZXIgYUNvbnRleHRzIChhcyBjb250ZXh0cyBjYW5ub3QgYmUgcmV0cmlldmVkIHZpYSBiaW5kaW5nIHBhcmFtZXRlciBvZiB0aGUgb3BlcmF0aW9uIGJpbmRpbmcpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHNQYXRoRm9yQ29udGV4dCA9IHZQYXJhbURlZmF1bHRWYWx1ZS4kUGF0aDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoc1BhdGhGb3JDb250ZXh0LmluZGV4T2YoYCR7c0JpbmRpbmdQYXJhbWV0ZXJ9L2ApID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzUGF0aEZvckNvbnRleHQgPSBzUGF0aEZvckNvbnRleHQucmVwbGFjZShgJHtzQmluZGluZ1BhcmFtZXRlcn0vYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAxOyBpIDwgYUNvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYUNvbnRleHRzW2ldLmdldFByb3BlcnR5KHNQYXRoRm9yQ29udGV4dCkgIT09IHZQYXJhbVZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGlmIHRoZSB2YWx1ZXMgZnJvbSB0aGUgY29udGV4dHMgYXJlIG5vdCBhbGwgdGhlIHNhbWUsIGRvIG5vdCBwcmVmaWxsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1OYW1lOiBzUGFyYW1OYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Yk5vUG9zc2libGVWYWx1ZTogdHJ1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4geyBwYXJhbU5hbWU6IHNQYXJhbU5hbWUsIHZhbHVlOiB2UGFyYW1WYWx1ZSB9O1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlYWRpbmcgZGVmYXVsdCBhY3Rpb24gcGFyYW1ldGVyXCIsIHNQYXJhbU5hbWUsIG1QYXJhbWV0ZXJzLmFjdGlvbk5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtTmFtZTogc1BhcmFtTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJMYXRlUHJvcGVydHlFcnJvcjogdHJ1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBDYXNlIDEuMjogUGFyYW1ldGVyRGVmYXVsdFZhbHVlIGRlZmluZXMgYSBmaXhlZCBzdHJpbmcgdmFsdWUgKGkuZS4gdlBhcmFtRGVmYXVsdFZhbHVlID0gJ3NvbWVTdHJpbmcnKVxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgcGFyYW1OYW1lOiBzUGFyYW1OYW1lLCB2YWx1ZTogdlBhcmFtRGVmYXVsdFZhbHVlIH07XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG9QYXJhbWV0ZXJNb2RlbCAmJiAob1BhcmFtZXRlck1vZGVsIGFzIGFueSkub0RhdGFbc1BhcmFtTmFtZV0pIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBDYXNlIDI6IFRoZXJlIGlzIG5vIFBhcmFtZXRlckRlZmF1bHRWYWx1ZSBhbm5vdGF0aW9uICg9PiBsb29rIGludG8gdGhlIEZMUCBVc2VyIERlZmF1bHRzKVxuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtTmFtZTogc1BhcmFtTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiAob1BhcmFtZXRlck1vZGVsIGFzIGFueSkub0RhdGFbc1BhcmFtTmFtZV1cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7IHBhcmFtTmFtZTogc1BhcmFtTmFtZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRjb25zdCBnZXRQYXJhbWV0ZXJEZWZhdWx0VmFsdWUgPSBmdW5jdGlvbiAoc1BhcmFtTmFtZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSAob0RpYWxvZy5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRcdFx0XHRcdHNBY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uUGF0aCA9IENvbW1vblV0aWxzLmdldFBhcmFtZXRlclBhdGgob0FjdGlvbkNvbnRleHQuZ2V0UGF0aCgpLCBzUGFyYW1OYW1lKSArIFwiQFwiLFxuXHRcdFx0XHRcdFx0XHRcdG9QYXJhbWV0ZXJBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNBY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uUGF0aCksXG5cdFx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlckRlZmF1bHRWYWx1ZSA9XG5cdFx0XHRcdFx0XHRcdFx0XHRvUGFyYW1ldGVyQW5ub3RhdGlvbnMgJiYgb1BhcmFtZXRlckFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlBhcmFtZXRlckRlZmF1bHRWYWx1ZVwiXTsgLy8gZWl0aGVyIHsgJFBhdGg6ICdzb21lUGF0aCcgfSBvciAnc29tZVN0cmluZydcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9QYXJhbWV0ZXJEZWZhdWx0VmFsdWU7XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRjb25zdCBhQ3VycmVudFBhcmFtRGVmYXVsdFZhbHVlID0gW107XG5cdFx0XHRcdFx0XHRsZXQgc1BhcmFtTmFtZSwgdlBhcmFtZXRlckRlZmF1bHRWYWx1ZTtcblx0XHRcdFx0XHRcdGZvciAoY29uc3QgaSBpbiBhQWN0aW9uUGFyYW1ldGVycykge1xuXHRcdFx0XHRcdFx0XHRzUGFyYW1OYW1lID0gYUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWU7XG5cdFx0XHRcdFx0XHRcdHZQYXJhbWV0ZXJEZWZhdWx0VmFsdWUgPSBnZXRQYXJhbWV0ZXJEZWZhdWx0VmFsdWUoc1BhcmFtTmFtZSk7XG5cdFx0XHRcdFx0XHRcdGFDdXJyZW50UGFyYW1EZWZhdWx0VmFsdWUucHVzaChwcmVmaWxsUGFyYW1ldGVyKHNQYXJhbU5hbWUsIHZQYXJhbWV0ZXJEZWZhdWx0VmFsdWUpKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKG9BY3Rpb25Db250ZXh0LmdldE9iamVjdChcIiRJc0JvdW5kXCIpICYmIGFDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzQm91bmRGdW5jdGlvbk5hbWUgJiYgc0JvdW5kRnVuY3Rpb25OYW1lLmxlbmd0aCA+IDAgJiYgdHlwZW9mIHNCb3VuZEZ1bmN0aW9uTmFtZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAoY29uc3QgaSBpbiBhQ29udGV4dHMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGFGdW5jdGlvblBhcmFtcy5wdXNoKGNhbGxCb3VuZEZ1bmN0aW9uKHNCb3VuZEZ1bmN0aW9uTmFtZSwgYUNvbnRleHRzW2ldLCBtUGFyYW1ldGVycy5tb2RlbCkpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRjb25zdCBhUHJlZmlsbFBhcmFtUHJvbWlzZXMgPSBQcm9taXNlLmFsbChhQ3VycmVudFBhcmFtRGVmYXVsdFZhbHVlKTtcblx0XHRcdFx0XHRcdGxldCBhRXhlY0Z1bmN0aW9uUHJvbWlzZXM6IFByb21pc2U8YW55W10+ID0gUHJvbWlzZS5yZXNvbHZlKFtdKTtcblx0XHRcdFx0XHRcdGxldCBvRXhlY0Z1bmN0aW9uRnJvbU1hbmlmZXN0UHJvbWlzZTtcblx0XHRcdFx0XHRcdGlmIChhRnVuY3Rpb25QYXJhbXMgJiYgYUZ1bmN0aW9uUGFyYW1zLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0YUV4ZWNGdW5jdGlvblByb21pc2VzID0gUHJvbWlzZS5hbGwoYUZ1bmN0aW9uUGFyYW1zKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc01vZHVsZSA9IG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvblxuXHRcdFx0XHRcdFx0XHRcdFx0LnN1YnN0cmluZygwLCBtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24ubGFzdEluZGV4T2YoXCIuXCIpIHx8IC0xKVxuXHRcdFx0XHRcdFx0XHRcdFx0LnJlcGxhY2UoL1xcLi9naSwgXCIvXCIpLFxuXHRcdFx0XHRcdFx0XHRcdHNGdW5jdGlvbk5hbWUgPSBtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24uc3Vic3RyaW5nKFxuXHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uLmxhc3RJbmRleE9mKFwiLlwiKSArIDEsXG5cdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24ubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0b0V4ZWNGdW5jdGlvbkZyb21NYW5pZmVzdFByb21pc2UgPSBGUE1IZWxwZXIuYWN0aW9uV3JhcHBlcihvQ2xvbmVFdmVudCwgc01vZHVsZSwgc0Z1bmN0aW9uTmFtZSwge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHRzOiBhQ29udGV4dHNcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFQcm9taXNlcyA9IGF3YWl0IFByb21pc2UuYWxsKFtcblx0XHRcdFx0XHRcdFx0XHRhUHJlZmlsbFBhcmFtUHJvbWlzZXMsXG5cdFx0XHRcdFx0XHRcdFx0YUV4ZWNGdW5jdGlvblByb21pc2VzLFxuXHRcdFx0XHRcdFx0XHRcdG9FeGVjRnVuY3Rpb25Gcm9tTWFuaWZlc3RQcm9taXNlXG5cdFx0XHRcdFx0XHRcdF0pO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWU6IGFueSA9IGFQcm9taXNlc1swXTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZnVuY3Rpb25QYXJhbXMgPSBhUHJvbWlzZXNbMV07XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9GdW5jdGlvblBhcmFtc0Zyb21NYW5pZmVzdCA9IGFQcm9taXNlc1syXTtcblx0XHRcdFx0XHRcdFx0bGV0IHNEaWFsb2dQYXJhbU5hbWU6IHN0cmluZztcblxuXHRcdFx0XHRcdFx0XHQvLyBGaWxsIHRoZSBkaWFsb2cgd2l0aCB0aGUgZWFybGllciBkZXRlcm1pbmVkIHBhcmFtZXRlciB2YWx1ZXMgZnJvbSB0aGUgZGlmZmVyZW50IHNvdXJjZXNcblx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0c0RpYWxvZ1BhcmFtTmFtZSA9IGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lO1xuXHRcdFx0XHRcdFx0XHRcdC8vIFBhcmFtZXRlciB2YWx1ZXMgcHJvdmlkZWQgaW4gdGhlIGNhbGwgb2YgaW52b2tlQWN0aW9uIG92ZXJydWxlIG90aGVyIHNvdXJjZXNcblx0XHRcdFx0XHRcdFx0XHRjb25zdCB2UGFyYW1ldGVyUHJvdmlkZWRWYWx1ZSA9IGFQYXJhbWV0ZXJWYWx1ZXM/LmZpbmQoXG5cdFx0XHRcdFx0XHRcdFx0XHQoZWxlbWVudDogYW55KSA9PiBlbGVtZW50Lm5hbWUgPT09IGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lXG5cdFx0XHRcdFx0XHRcdFx0KT8udmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZQYXJhbWV0ZXJQcm92aWRlZFZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvT3BlcmF0aW9uQmluZGluZy5zZXRQYXJhbWV0ZXIoYUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWUsIHZQYXJhbWV0ZXJQcm92aWRlZFZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG9GdW5jdGlvblBhcmFtc0Zyb21NYW5pZmVzdCAmJiBvRnVuY3Rpb25QYXJhbXNGcm9tTWFuaWZlc3QuaGFzT3duUHJvcGVydHkoc0RpYWxvZ1BhcmFtTmFtZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25CaW5kaW5nLnNldFBhcmFtZXRlcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0YUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9GdW5jdGlvblBhcmFtc0Zyb21NYW5pZmVzdFtzRGlhbG9nUGFyYW1OYW1lXVxuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZVtpXSAmJiBjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWVbaV0udmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuc2V0UGFyYW1ldGVyKGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lLCBjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWVbaV0udmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gaWYgdGhlIGRlZmF1bHQgdmFsdWUgaGFkIG5vdCBiZWVuIHByZXZpb3VzbHkgZGV0ZXJtaW5lZCBkdWUgdG8gZGlmZmVyZW50IGNvbnRleHRzLCB3ZSBkbyBub3RoaW5nIGVsc2Vcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHNCb3VuZEZ1bmN0aW9uTmFtZSAmJiAhY3VycmVudFBhcmFtRGVmYXVsdFZhbHVlW2ldLmJOb1Bvc3NpYmxlVmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChhQ29udGV4dHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBjaGVjayBpZiB0aGUgZnVuY3Rpb24gcmV0cmlldmVzIHRoZSBzYW1lIHBhcmFtIHZhbHVlIGZvciBhbGwgdGhlIGNvbnRleHRzOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgaiA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHdoaWxlIChqIDwgYUNvbnRleHRzLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvblBhcmFtc1tqXSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb25QYXJhbXNbaiArIDFdICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvblBhcmFtc1tqXS5nZXRPYmplY3Qoc0RpYWxvZ1BhcmFtTmFtZSkgPT09XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uUGFyYW1zW2ogKyAxXS5nZXRPYmplY3Qoc0RpYWxvZ1BhcmFtTmFtZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGorKztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vcGFyYW0gdmFsdWVzIGFyZSBhbGwgdGhlIHNhbWU6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChqID09PSBhQ29udGV4dHMubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25CaW5kaW5nLnNldFBhcmFtZXRlcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb25QYXJhbXNbal0uZ2V0T2JqZWN0KHNEaWFsb2dQYXJhbU5hbWUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChmdW5jdGlvblBhcmFtc1swXSAmJiBmdW5jdGlvblBhcmFtc1swXS5nZXRPYmplY3Qoc0RpYWxvZ1BhcmFtTmFtZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9Pbmx5IG9uZSBjb250ZXh0LCB0aGVuIHRoZSBkZWZhdWx0IHBhcmFtIHZhbHVlcyBhcmUgdG8gYmUgdmVyaWZpZWQgZnJvbSB0aGUgZnVuY3Rpb246XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuc2V0UGFyYW1ldGVyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uUGFyYW1zWzBdLmdldE9iamVjdChzRGlhbG9nUGFyYW1OYW1lKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjb25zdCBiRXJyb3JGb3VuZCA9IGN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZS5zb21lKGZ1bmN0aW9uIChvVmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChvVmFsdWUuYkxhdGVQcm9wZXJ0eUVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb1ZhbHVlLmJMYXRlUHJvcGVydHlFcnJvcjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHQvLyBJZiBhdCBsZWFzdCBvbmUgRGVmYXVsdCBQcm9wZXJ0eSBpcyBhIExhdGUgUHJvcGVydHkgYW5kIGFuIGVUYWcgZXJyb3Igd2FzIHJhaXNlZC5cblx0XHRcdFx0XHRcdFx0aWYgKGJFcnJvckZvdW5kKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc1RleHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX0FQUF9DT01QT05FTlRfU0FQRkVfRVRBR19MQVRFX1BST1BFUlRZXCIpO1xuXHRcdFx0XHRcdFx0XHRcdE1lc3NhZ2VCb3gud2FybmluZyhzVGV4dCwgeyBjb250ZW50V2lkdGg6IFwiMjVlbVwiIH0gYXMgYW55KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcmV0cmlldmluZyB0aGUgcGFyYW1ldGVyXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRjb25zdCBmbkFzeW5jQmVmb3JlT3BlbiA9IGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmIChvQWN0aW9uQ29udGV4dC5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSAmJiBhQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhUGFyYW1ldGVycyA9IG9BY3Rpb25Db250ZXh0LmdldE9iamVjdChcIiRQYXJhbWV0ZXJcIik7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNCaW5kaW5nUGFyYW1ldGVyID0gYVBhcmFtZXRlcnNbMF0gJiYgYVBhcmFtZXRlcnNbMF0uJE5hbWU7XG5cblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvQ29udGV4dE9iamVjdCA9IGF3YWl0IGFDb250ZXh0c1swXS5yZXF1ZXN0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9Db250ZXh0T2JqZWN0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvT3BlcmF0aW9uQmluZGluZy5zZXRQYXJhbWV0ZXIoc0JpbmRpbmdQYXJhbWV0ZXIsIG9Db250ZXh0T2JqZWN0KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgZm5TZXREZWZhdWx0c0FuZE9wZW5EaWFsb2coc0JpbmRpbmdQYXJhbWV0ZXIpO1xuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIHBhcmFtZXRlclwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRhd2FpdCBmblNldERlZmF1bHRzQW5kT3BlbkRpYWxvZygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRhd2FpdCBmbkFzeW5jQmVmb3JlT3BlbigpO1xuXG5cdFx0XHRcdFx0Ly8gYWRkaW5nIGRlZmF1bHRlZCB2YWx1ZXMgb25seSBoZXJlIGFmdGVyIHRoZXkgYXJlIG5vdCBzZXQgdG8gdGhlIGZpZWxkc1xuXHRcdFx0XHRcdGZvciAoY29uc3QgYWN0aW9uUGFyYW1ldGVySW5mbyBvZiBhY3Rpb25QYXJhbWV0ZXJJbmZvcykge1xuXHRcdFx0XHRcdFx0Y29uc3QgdmFsdWUgPSBhY3Rpb25QYXJhbWV0ZXJJbmZvLmlzTXVsdGlWYWx1ZVxuXHRcdFx0XHRcdFx0XHQ/IChhY3Rpb25QYXJhbWV0ZXJJbmZvLmZpZWxkIGFzIE11bHRpVmFsdWVGaWVsZCkuZ2V0SXRlbXMoKVxuXHRcdFx0XHRcdFx0XHQ6IChhY3Rpb25QYXJhbWV0ZXJJbmZvLmZpZWxkIGFzIEZpZWxkKS5nZXRWYWx1ZSgpO1xuXHRcdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mby52YWx1ZSA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mby52YWxpZGF0aW9uUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh2YWx1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRhZnRlckNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gd2hlbiB0aGUgZGlhbG9nIGlzIGNhbmNlbGxlZCwgbWVzc2FnZXMgbmVlZCB0byBiZSByZW1vdmVkIGluIGNhc2UgdGhlIHNhbWUgYWN0aW9uIHNob3VsZCBiZSBleGVjdXRlZCBhZ2FpblxuXHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzLmZvckVhY2goX3JlbW92ZU1lc3NhZ2VzRm9yQWN0aW9uUGFyYW10ZXIpO1xuXHRcdFx0XHRcdG9EaWFsb2cuZGVzdHJveSgpO1xuXHRcdFx0XHRcdGlmIChhY3Rpb25SZXN1bHQuZGlhbG9nQ2FuY2VsbGVkKSB7XG5cdFx0XHRcdFx0XHRyZWplY3QoQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZyk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlc29sdmUoYWN0aW9uUmVzdWx0LnJlc3VsdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdG1QYXJhbWV0ZXJzLm9EaWFsb2cgPSBvRGlhbG9nO1xuXHRcdFx0b0RpYWxvZy5zZXRNb2RlbChvQWN0aW9uQ29udGV4dC5nZXRNb2RlbCgpLm9Nb2RlbCk7XG5cdFx0XHRvRGlhbG9nLnNldE1vZGVsKG9QYXJhbWV0ZXJNb2RlbCwgXCJwYXJhbXNNb2RlbFwiKTtcblx0XHRcdG9EaWFsb2cuYmluZEVsZW1lbnQoe1xuXHRcdFx0XHRwYXRoOiBcIi9cIixcblx0XHRcdFx0bW9kZWw6IFwicGFyYW1zTW9kZWxcIlxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGVtcHR5IG1vZGVsIHRvIGFkZCBlbGVtZW50cyBkeW5hbWljYWxseSBkZXBlbmRpbmcgb24gbnVtYmVyIG9mIE1WRiBmaWVsZHMgZGVmaW5lZCBvbiB0aGUgZGlhbG9nXG5cdFx0XHRjb25zdCBvTVZGTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHt9KTtcblx0XHRcdG9EaWFsb2cuc2V0TW9kZWwob01WRk1vZGVsLCBcIm12ZnZpZXdcIik7XG5cblx0XHRcdC8qIEV2ZW50IG5lZWRlZCBmb3IgcmVtb3ZpbmcgbWVzc2FnZXMgb2YgdmFsaWQgY2hhbmdlZCBmaWVsZCAqL1xuXHRcdFx0Zm9yIChjb25zdCBhY3Rpb25QYXJhbWV0ZXJJbmZvIG9mIGFjdGlvblBhcmFtZXRlckluZm9zKSB7XG5cdFx0XHRcdGlmIChhY3Rpb25QYXJhbWV0ZXJJbmZvLmlzTXVsdGlWYWx1ZSkge1xuXHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8/LmZpZWxkPy5nZXRCaW5kaW5nKFwiaXRlbXNcIik/LmF0dGFjaENoYW5nZSgoKSA9PiB7XG5cdFx0XHRcdFx0XHRfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlcihhY3Rpb25QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mbz8uZmllbGQ/LmdldEJpbmRpbmcoXCJ2YWx1ZVwiKT8uYXR0YWNoQ2hhbmdlKCgpID0+IHtcblx0XHRcdFx0XHRcdF9yZW1vdmVNZXNzYWdlc0ZvckFjdGlvblBhcmFtdGVyKGFjdGlvblBhcmFtZXRlckluZm8ucGFyYW1ldGVyKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgc0FjdGlvblBhdGggPSBgJHtzQWN0aW9uTmFtZX0oLi4uKWA7XG5cdFx0XHRpZiAoIWFDb250ZXh0cy5sZW5ndGgpIHtcblx0XHRcdFx0c0FjdGlvblBhdGggPSBgLyR7c0FjdGlvblBhdGh9YDtcblx0XHRcdH1cblx0XHRcdG9EaWFsb2cuYmluZEVsZW1lbnQoe1xuXHRcdFx0XHRwYXRoOiBzQWN0aW9uUGF0aFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAob1BhcmVudENvbnRyb2wpIHtcblx0XHRcdFx0Ly8gaWYgdGhlcmUgaXMgYSBwYXJlbnQgY29udHJvbCBzcGVjaWZpZWQgYWRkIHRoZSBkaWFsb2cgYXMgZGVwZW5kZW50XG5cdFx0XHRcdG9QYXJlbnRDb250cm9sLmFkZERlcGVuZGVudChvRGlhbG9nKTtcblx0XHRcdH1cblx0XHRcdGlmIChhQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRvRGlhbG9nLnNldEJpbmRpbmdDb250ZXh0KGFDb250ZXh0c1swXSk7IC8vIHVzZSBjb250ZXh0IG9mIGZpcnN0IHNlbGVjdGVkIGxpbmUgaXRlbVxuXHRcdFx0fVxuXHRcdFx0b09wZXJhdGlvbkJpbmRpbmcgPSBvRGlhbG9nLmdldE9iamVjdEJpbmRpbmcoKTtcblx0XHRcdG9EaWFsb2cub3BlbigpO1xuXHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRyZWplY3Qob0Vycm9yKTtcblx0XHR9XG5cdH0pO1xufVxuZnVuY3Rpb24gZ2V0QWN0aW9uUGFyYW1ldGVycyhvQWN0aW9uOiBhbnkpIHtcblx0Y29uc3QgYVBhcmFtZXRlcnMgPSBvQWN0aW9uLmdldE9iamVjdChcIiRQYXJhbWV0ZXJcIikgfHwgW107XG5cdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5sZW5ndGgpIHtcblx0XHRpZiAob0FjdGlvbi5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSkge1xuXHRcdFx0Ly9pbiBjYXNlIG9mIGJvdW5kIGFjdGlvbnMsIGlnbm9yZSB0aGUgZmlyc3QgcGFyYW1ldGVyIGFuZCBjb25zaWRlciB0aGUgcmVzdFxuXHRcdFx0cmV0dXJuIGFQYXJhbWV0ZXJzLnNsaWNlKDEsIGFQYXJhbWV0ZXJzLmxlbmd0aCkgfHwgW107XG5cdFx0fVxuXHR9XG5cdHJldHVybiBhUGFyYW1ldGVycztcbn1cbmZ1bmN0aW9uIGdldElzQWN0aW9uQ3JpdGljYWwob01ldGFNb2RlbDogYW55LCBzUGF0aDogYW55LCBjb250ZXh0cz86IGFueSwgb0JvdW5kQWN0aW9uPzogYW55KSB7XG5cdGNvbnN0IHZBY3Rpb25Dcml0aWNhbCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNBY3Rpb25Dcml0aWNhbGApO1xuXHRsZXQgc0NyaXRpY2FsUGF0aCA9IHZBY3Rpb25Dcml0aWNhbCAmJiB2QWN0aW9uQ3JpdGljYWwuJFBhdGg7XG5cdGlmICghc0NyaXRpY2FsUGF0aCkge1xuXHRcdC8vIHRoZSBzdGF0aWMgdmFsdWUgc2NlbmFyaW8gZm9yIGlzQWN0aW9uQ3JpdGljYWxcblx0XHRyZXR1cm4gISF2QWN0aW9uQ3JpdGljYWw7XG5cdH1cblx0Y29uc3QgYUJpbmRpbmdQYXJhbXMgPSBvQm91bmRBY3Rpb24gJiYgb0JvdW5kQWN0aW9uLmdldE9iamVjdChcIiRQYXJhbWV0ZXJcIiksXG5cdFx0YVBhdGhzID0gc0NyaXRpY2FsUGF0aCAmJiBzQ3JpdGljYWxQYXRoLnNwbGl0KFwiL1wiKSxcblx0XHRiQ29uZGl0aW9uID1cblx0XHRcdGFCaW5kaW5nUGFyYW1zICYmIGFCaW5kaW5nUGFyYW1zLmxlbmd0aCAmJiB0eXBlb2YgYUJpbmRpbmdQYXJhbXMgPT09IFwib2JqZWN0XCIgJiYgc0NyaXRpY2FsUGF0aCAmJiBjb250ZXh0cyAmJiBjb250ZXh0cy5sZW5ndGg7XG5cdGlmIChiQ29uZGl0aW9uKSB7XG5cdFx0Ly9pbiBjYXNlIGJpbmRpbmcgcGF0YW1ldGVycyBhcmUgdGhlcmUgaW4gcGF0aCBuZWVkIHRvIHJlbW92ZSBlZzogLSBfaXQvaXNWZXJpZmllZCA9PiBuZWVkIHRvIHJlbW92ZSBfaXQgYW5kIHRoZSBwYXRoIHNob3VsZCBiZSBpc1ZlcmlmaWVkXG5cdFx0YUJpbmRpbmdQYXJhbXMuZmlsdGVyKGZ1bmN0aW9uIChvUGFyYW1zOiBhbnkpIHtcblx0XHRcdGNvbnN0IGluZGV4ID0gYVBhdGhzICYmIGFQYXRocy5pbmRleE9mKG9QYXJhbXMuJE5hbWUpO1xuXHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0YVBhdGhzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0c0NyaXRpY2FsUGF0aCA9IGFQYXRocy5qb2luKFwiL1wiKTtcblx0XHRyZXR1cm4gY29udGV4dHNbMF0uZ2V0T2JqZWN0KHNDcml0aWNhbFBhdGgpO1xuXHR9IGVsc2UgaWYgKHNDcml0aWNhbFBhdGgpIHtcblx0XHQvL2lmIHNjZW5hcmlvIGlzIHBhdGggYmFzZWQgcmV0dXJuIHRoZSBwYXRoIHZhbHVlXG5cdFx0cmV0dXJuIGNvbnRleHRzWzBdLmdldE9iamVjdChzQ3JpdGljYWxQYXRoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBfZ2V0QWN0aW9uUGFyYW1ldGVyQWN0aW9uTmFtZShyZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsLCBzQWN0aW9uTGFiZWw6IHN0cmluZywgc0FjdGlvbk5hbWU6IHN0cmluZywgc0VudGl0eVNldE5hbWU6IHN0cmluZykge1xuXHRsZXQgYm91bmRBY3Rpb25OYW1lOiBhbnkgPSBzQWN0aW9uTmFtZSA/IHNBY3Rpb25OYW1lIDogbnVsbDtcblx0Y29uc3QgYUFjdGlvbk5hbWUgPSBib3VuZEFjdGlvbk5hbWUuc3BsaXQoXCIuXCIpO1xuXHRib3VuZEFjdGlvbk5hbWUgPSBib3VuZEFjdGlvbk5hbWUuaW5kZXhPZihcIi5cIikgPj0gMCA/IGFBY3Rpb25OYW1lW2FBY3Rpb25OYW1lLmxlbmd0aCAtIDFdIDogYm91bmRBY3Rpb25OYW1lO1xuXHRjb25zdCBzdWZmaXhSZXNvdXJjZUtleSA9IGJvdW5kQWN0aW9uTmFtZSAmJiBzRW50aXR5U2V0TmFtZSA/IGAke3NFbnRpdHlTZXROYW1lfXwke2JvdW5kQWN0aW9uTmFtZX1gIDogXCJcIjtcblx0Y29uc3Qgc0tleSA9IFwiQUNUSU9OX1BBUkFNRVRFUl9ESUFMT0dfQUNUSU9OX05BTUVcIjtcblx0Y29uc3QgYlJlc291cmNlS2V5RXhpc3RzID0gcmVzb3VyY2VNb2RlbC5jaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMoYCR7c0tleX18JHtzdWZmaXhSZXNvdXJjZUtleX1gKTtcblx0aWYgKHNBY3Rpb25MYWJlbCkge1xuXHRcdGlmIChiUmVzb3VyY2VLZXlFeGlzdHMpIHtcblx0XHRcdHJldHVybiByZXNvdXJjZU1vZGVsLmdldFRleHQoc0tleSwgdW5kZWZpbmVkLCBzdWZmaXhSZXNvdXJjZUtleSk7XG5cdFx0fSBlbHNlIGlmIChyZXNvdXJjZU1vZGVsLmNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cyhgJHtzS2V5fXwke3NFbnRpdHlTZXROYW1lfWApKSB7XG5cdFx0XHRyZXR1cm4gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KHNLZXksIHVuZGVmaW5lZCwgYCR7c0VudGl0eVNldE5hbWV9YCk7XG5cdFx0fSBlbHNlIGlmIChyZXNvdXJjZU1vZGVsLmNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cyhgJHtzS2V5fWApKSB7XG5cdFx0XHRyZXR1cm4gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KHNLZXkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gc0FjdGlvbkxhYmVsO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX09LXCIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGV4ZWN1dGVEZXBlbmRpbmdPblNlbGVjdGVkQ29udGV4dHMoXG5cdG9BY3Rpb246IGFueSxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0YkdldEJvdW5kQ29udGV4dDogYm9vbGVhbixcblx0c0dyb3VwSWQ6IHN0cmluZyxcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCxcblx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyIHwgdW5kZWZpbmVkLFxuXHRpQ29udGV4dExlbmd0aDogbnVtYmVyIHwgbnVsbCxcblx0Y3VycmVudF9jb250ZXh0X2luZGV4OiBudW1iZXIgfCBudWxsLFxuXHRpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVzb2x2ZTogRnVuY3Rpb24sXG5cdGludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZWplY3Q6IEZ1bmN0aW9uLFxuXHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcz86IFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG4pIHtcblx0bGV0IG9BY3Rpb25Qcm9taXNlLFxuXHRcdGJFbmFibGVTdHJpY3RIYW5kbGluZyA9IHRydWU7XG5cdGlmIChtUGFyYW1ldGVycykge1xuXHRcdG1QYXJhbWV0ZXJzLmludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZXNvbHZlID0gaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmU7XG5cdH1cblx0aWYgKGJHZXRCb3VuZENvbnRleHQpIHtcblx0XHRjb25zdCBzUGF0aCA9IG9BY3Rpb24uZ2V0Qm91bmRDb250ZXh0KCkuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9BY3Rpb24uZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRNZXRhUGF0aChzUGF0aCk7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5ID0gb0FjdGlvbi5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChzTWV0YVBhdGgpO1xuXHRcdGlmIChvUHJvcGVydHkgJiYgb1Byb3BlcnR5WzBdPy4ka2luZCAhPT0gXCJBY3Rpb25cIikge1xuXHRcdFx0Ly9kbyBub3QgZW5hYmxlIHRoZSBzdHJpY3QgaGFuZGxpbmcgaWYgaXRzIG5vdCBhbiBhY3Rpb25cblx0XHRcdGJFbmFibGVTdHJpY3RIYW5kbGluZyA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdGlmICghYkVuYWJsZVN0cmljdEhhbmRsaW5nKSB7XG5cdFx0b0FjdGlvblByb21pc2UgPSBvQWN0aW9uLmV4ZWN1dGUoc0dyb3VwSWQpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0aW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmUob0FjdGlvbi5nZXRCb3VuZENvbnRleHQoKSk7XG5cdFx0XHRyZXR1cm4gb0FjdGlvbi5nZXRCb3VuZENvbnRleHQoKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRvQWN0aW9uUHJvbWlzZSA9IGJHZXRCb3VuZENvbnRleHRcblx0XHRcdD8gb0FjdGlvblxuXHRcdFx0XHRcdC5leGVjdXRlKFxuXHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHQob3BlcmF0aW9uc0hlbHBlciBhcyBhbnkpLmZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZC5iaW5kKFxuXHRcdFx0XHRcdFx0XHRvcGVyYXRpb25zLFxuXHRcdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdHJlc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRfY29udGV4dF9pbmRleCxcblx0XHRcdFx0XHRcdFx0b0FjdGlvbi5nZXRDb250ZXh0KCksXG5cdFx0XHRcdFx0XHRcdGlDb250ZXh0TGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXNcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmICFtUGFyYW1ldGVycy5iR3JvdXBlZCkge1xuXHRcdFx0XHRcdFx0XHR1cGRhdGU0MTJUcmFuc2lzdGlvbk1lc3NhZ2VzKFxuXHRcdFx0XHRcdFx0XHRcdG9BY3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMsXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnNcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZXNvbHZlKG9BY3Rpb24uZ2V0Qm91bmRDb250ZXh0KCkpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9BY3Rpb24uZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmICFtUGFyYW1ldGVycy5iR3JvdXBlZCkge1xuXHRcdFx0XHRcdFx0XHR1cGRhdGU0MTJUcmFuc2lzdGlvbk1lc3NhZ2VzKFxuXHRcdFx0XHRcdFx0XHRcdG9BY3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMsXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnNcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZWplY3QoKTtcblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHQ6IG9BY3Rpb25cblx0XHRcdFx0XHQuZXhlY3V0ZShcblx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0KG9wZXJhdGlvbnNIZWxwZXIgYXMgYW55KS5mbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQuYmluZChcblx0XHRcdFx0XHRcdFx0b3BlcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRyZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRjdXJyZW50X2NvbnRleHRfaW5kZXgsXG5cdFx0XHRcdFx0XHRcdG9BY3Rpb24uZ2V0Q29udGV4dCgpLFxuXHRcdFx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXN1bHQ6IGFueSkge1xuXHRcdFx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzICYmICFtUGFyYW1ldGVycy5iR3JvdXBlZCkge1xuXHRcdFx0XHRcdFx0XHR1cGRhdGU0MTJUcmFuc2lzdGlvbk1lc3NhZ2VzKFxuXHRcdFx0XHRcdFx0XHRcdG9BY3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMsXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnNcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZXNvbHZlKHJlc3VsdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmIChzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJiAhbVBhcmFtZXRlcnMuYkdyb3VwZWQpIHtcblx0XHRcdFx0XHRcdFx0dXBkYXRlNDEyVHJhbnNpc3Rpb25NZXNzYWdlcyhcblx0XHRcdFx0XHRcdFx0XHRvQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVqZWN0KCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoKTtcblx0XHRcdFx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBvQWN0aW9uUHJvbWlzZS5jYXRjaCgoKSA9PiB7XG5cdFx0dGhyb3cgQ29uc3RhbnRzLkFjdGlvbkV4ZWN1dGlvbkZhaWxlZDtcblx0fSk7XG59XG4vKipcbiAqIFVwZGF0ZXMgdGhlIHN0cmljdEhhbmRsaW5nVXRpbGl0ZXMgd2l0aCB0aGUgZmFpbGVkIGFuZCBzdWNjZXNzZnVsIHRyYW5zaXNpdGlvbiBtZXNzYWdlcy5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHVwZGF0ZTQxMlRyYW5zaXN0aW9uTWVzc2FnZXNcbiAqIEBwYXJhbSBvQWN0aW9uIEFjdGlvbiBleGVjdXRlZFxuICogQHBhcmFtIHNHcm91cElkIEdyb3VwSWQgb2YgdGhlIGJhdGNoXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzXSBPcHRpb25hbCwgY29udGFpbnMgYXR0cmlidXRlcyByZWxhdGVkIHRvIHN0cmlja0hhbmRsaW5nXG4gKiBAcGFyYW0gW3N0cmljdEhhbmRsaW5nVXRpbGl0aWVzXSBPcHRpb25hbCwgdXRpbGl0eSBmbGFncyBhbmQgbWVzc2FnZXMgZm9yIHN0cmljdEhhbmRsaW5nXG4gKiBAcmV0dXJucyBVcGRhdGVkIFN0cmljdEhhbmRsaW5nVXRpbHRpZXNcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZTQxMlRyYW5zaXN0aW9uTWVzc2FnZXMoXG5cdG9BY3Rpb246IENvbnRyb2wsXG5cdHNHcm91cElkOiBzdHJpbmcsXG5cdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzOiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllcyxcblx0bVBhcmFtZXRlcnM/OiBTdHJpY3RIYW5kbGluZ1BhcmFtZXRlcnMsXG4pIHtcblx0Y29uc3QgbWVzc2FnZXM6IEFycmF5PE1lc3NhZ2U+ID0gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0bGV0IHsgcHJvY2Vzc2VkTWVzc2FnZUlkcywgZGVsYXlTdWNjZXNzTWVzc2FnZXMsIHN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzIH0gPSBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyBhcyBTdHJpY3RIYW5kbGluZ1V0aWxpdGllcztcblx0Y29uc3QgdHJhbnNpdGlvbk1lc3NhZ2VzID0gbWVzc2FnZXMuZmlsdGVyKGZ1bmN0aW9uIChtZXNzYWdlOiBhbnkpIHtcblx0XHQvL2NoZWNrIGlmIHRoZSB0cmFuc2lzdGlvbiBtZXNzYWdlcyBpcyBhbHJlYWR5IHByb2Nlc3NlZFxuXHRcdGNvbnN0IGlzRHVwbGljYXRlID0gcHJvY2Vzc2VkTWVzc2FnZUlkcy5maW5kKGZ1bmN0aW9uIChpZDogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZS5pZCA9PT0gaWQ7XG5cdFx0fSk7XG5cdFx0Ly8gdXBkYXRlIHRoZSBzdHJpY3RIYW5kbGluZyB3aXRoIHRoZSBzdWNjZXNzIG1lc3NhZ2VzIHdoaWNoIG5lZWRzIHRvIGJlIHNob3duIGxhdGVyXG5cdFx0aWYgKCFpc0R1cGxpY2F0ZSkge1xuXHRcdFx0cHJvY2Vzc2VkTWVzc2FnZUlkcy5wdXNoKG1lc3NhZ2UuaWQpO1xuXHRcdFx0aWYgKG1lc3NhZ2UudHlwZSA9PT0gTWVzc2FnZVR5cGUuU3VjY2Vzcykge1xuXHRcdFx0XHRkZWxheVN1Y2Nlc3NNZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbWVzc2FnZS5wZXJzaXN0ZW50ID09PSB0cnVlICYmIG1lc3NhZ2UudHlwZSAhPT0gTWVzc2FnZVR5cGUuU3VjY2VzcyAmJiAhaXNEdXBsaWNhdGU7XG5cdH0pO1xuXHQvL3VwZGF0ZSB0aGUgc3RyaWN0SGFuZGxpbmdVdGlsaXRlcyB3aXRoIHRoZSBmYWlsZWQgdHJhbnNpc3Rpb24gbWVzc2FnZXMgd2hpY2ggbmVlZHMgdG8gYmUgcmV0cmlnZ2VyZWRcblx0aWYgKHRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRpZiAobVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0KSB7XG5cdFx0XHRzdHJpY3RIYW5kbGluZ1RyYW5zaXRpb25GYWlscy5wdXNoKHtcblx0XHRcdFx0b0FjdGlvbjogb0FjdGlvbixcblx0XHRcdFx0Z3JvdXBJZDogc0dyb3VwSWRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlRm9yQWN0aW9uRXhlY3V0aW9uKCkge1xuXHRsZXQgaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmU6IGFueSA9IG51bGwsXG5cdFx0aW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlamVjdDogYW55ID0gbnVsbDtcblx0Y29uc3Qgb0xvY2FsQWN0aW9uUHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblx0XHRpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0aW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlamVjdCA9IHJlamVjdDtcblx0fSkuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcikge1xuXHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGV4ZWN1dGluZyBhY3Rpb24gXCIsIG9FcnJvcik7XG5cdH0pO1xuXG5cdHJldHVybiB7IG9Mb2NhbEFjdGlvblByb21pc2UsIGludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZXNvbHZlLCBpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVqZWN0IH07XG59XG5cbmZ1bmN0aW9uIGNoZWNrZm9yT3RoZXJNZXNzYWdlcyhpc0NoYW5nZVNldDogYm9vbGVhbikge1xuXHRpZiAoaXNDaGFuZ2VTZXQpIHtcblx0XHRjb25zdCBhTWVzc2FnZXM6IE1lc3NhZ2VbXSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRNZXNzYWdlcygpO1xuXHRcdHJldHVybiBhTWVzc2FnZXMuZmluZEluZGV4KGZ1bmN0aW9uIChtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZS5nZXRUeXBlKCkgPT09IFwiRXJyb3JcIiB8fCBtZXNzYWdlLmdldFR5cGUoKSA9PT0gXCJXYXJuaW5nXCI7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBfZXhlY3V0ZUFjdGlvbihcblx0b0FwcENvbXBvbmVudDogYW55LFxuXHRtUGFyYW1ldGVyczogYW55LFxuXHRvUGFyZW50Q29udHJvbD86IGFueSxcblx0bWVzc2FnZUhhbmRsZXI/OiBNZXNzYWdlSGFuZGxlcixcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM/OiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuKSB7XG5cdGNvbnN0IGFDb250ZXh0cyA9IG1QYXJhbWV0ZXJzLmFDb250ZXh0cyB8fCBbXTtcblx0Y29uc3Qgb01vZGVsID0gbVBhcmFtZXRlcnMubW9kZWw7XG5cdGNvbnN0IGFBY3Rpb25QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnMgfHwgW107XG5cdGNvbnN0IHNBY3Rpb25OYW1lID0gbVBhcmFtZXRlcnMuYWN0aW9uTmFtZTtcblx0Y29uc3QgZm5PblN1Ym1pdHRlZCA9IG1QYXJhbWV0ZXJzLmZuT25TdWJtaXR0ZWQ7XG5cdGNvbnN0IGZuT25SZXNwb25zZSA9IG1QYXJhbWV0ZXJzLmZuT25SZXNwb25zZTtcblx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwob1BhcmVudENvbnRyb2wpO1xuXHRsZXQgb0FjdGlvbjogYW55O1xuXG5cdGZ1bmN0aW9uIHNldEFjdGlvblBhcmFtZXRlckRlZmF1bHRWYWx1ZSgpIHtcblx0XHRpZiAoYUFjdGlvblBhcmFtZXRlcnMgJiYgYUFjdGlvblBhcmFtZXRlcnMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFBY3Rpb25QYXJhbWV0ZXJzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmICghYUFjdGlvblBhcmFtZXRlcnNbal0udmFsdWUpIHtcblx0XHRcdFx0XHRzd2l0Y2ggKGFBY3Rpb25QYXJhbWV0ZXJzW2pdLiRUeXBlKSB7XG5cdFx0XHRcdFx0XHRjYXNlIFwiRWRtLlN0cmluZ1wiOlxuXHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tqXS52YWx1ZSA9IFwiXCI7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5Cb29sZWFuXCI6XG5cdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2pdLnZhbHVlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5CeXRlXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiRWRtLkludDE2XCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiRWRtLkludDMyXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiRWRtLkludDY0XCI6XG5cdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2pdLnZhbHVlID0gMDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHQvLyB0YmNcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRvQWN0aW9uLnNldFBhcmFtZXRlcihhQWN0aW9uUGFyYW1ldGVyc1tqXS4kTmFtZSwgYUFjdGlvblBhcmFtZXRlcnNbal0udmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRpZiAoYUNvbnRleHRzLmxlbmd0aCkge1xuXHRcdC8vIFRPRE86IHJlZmFjdG9yIHRvIGRpcmVjdCB1c2Ugb2YgUHJvbWlzZS5hbGxTZXR0bGVkXG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Y29uc3QgbUJpbmRpbmdQYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzO1xuXHRcdFx0Y29uc3QgYkdyb3VwZWQgPSBtUGFyYW1ldGVycy5iR3JvdXBlZDtcblx0XHRcdGNvbnN0IGJHZXRCb3VuZENvbnRleHQgPSBtUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0O1xuXHRcdFx0Y29uc3QgYUFjdGlvblByb21pc2VzOiBhbnlbXSA9IFtdO1xuXHRcdFx0bGV0IG9BY3Rpb25Qcm9taXNlO1xuXHRcdFx0bGV0IGk7XG5cdFx0XHRsZXQgc0dyb3VwSWQ6IHN0cmluZztcblx0XHRcdGNvbnN0IG9pbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlT2JqZWN0ID0gY3JlYXRlaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZUZvckFjdGlvbkV4ZWN1dGlvbigpO1xuXHRcdFx0Y29uc3QgZm5FeGVjdXRlQWN0aW9uID0gZnVuY3Rpb24gKGFjdGlvbkNvbnRleHQ6IGFueSwgY3VycmVudF9jb250ZXh0X2luZGV4OiBhbnksIG9TaWRlRWZmZWN0OiBhbnksIGlDb250ZXh0TGVuZ3RoOiBhbnkpIHtcblx0XHRcdFx0c2V0QWN0aW9uUGFyYW1ldGVyRGVmYXVsdFZhbHVlKCk7XG5cdFx0XHRcdGNvbnN0IGluZGl2aWR1YWxBY3Rpb25Qcm9taXNlOiBhbnkgPSBbXTtcblx0XHRcdFx0Ly8gRm9yIGludm9jYXRpb24gZ3JvdXBpbmcgXCJpc29sYXRlZFwiIG5lZWQgYmF0Y2ggZ3JvdXAgcGVyIGFjdGlvbiBjYWxsXG5cdFx0XHRcdHNHcm91cElkID0gIWJHcm91cGVkID8gYCRhdXRvLiR7Y3VycmVudF9jb250ZXh0X2luZGV4fWAgOiBhY3Rpb25Db250ZXh0LmdldFVwZGF0ZUdyb3VwSWQoKTtcblx0XHRcdFx0bVBhcmFtZXRlcnMucmVxdWVzdFNpZGVFZmZlY3RzID0gZm5SZXF1ZXN0U2lkZUVmZmVjdHMuYmluZChcblx0XHRcdFx0XHRvcGVyYXRpb25zLFxuXHRcdFx0XHRcdG9BcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0b1NpZGVFZmZlY3QsXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0aW5kaXZpZHVhbEFjdGlvblByb21pc2Vcblx0XHRcdFx0KTtcblx0XHRcdFx0b0FjdGlvblByb21pc2UgPSBleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzKFxuXHRcdFx0XHRcdGFjdGlvbkNvbnRleHQsXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0YkdldEJvdW5kQ29udGV4dCxcblx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRyZXNvdXJjZU1vZGVsLFxuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdGlDb250ZXh0TGVuZ3RoLFxuXHRcdFx0XHRcdGN1cnJlbnRfY29udGV4dF9pbmRleCxcblx0XHRcdFx0XHRvaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZU9iamVjdC5pbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVzb2x2ZSxcblx0XHRcdFx0XHRvaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZU9iamVjdC5pbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVqZWN0LFxuXHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFBY3Rpb25Qcm9taXNlcy5wdXNoKG9BY3Rpb25Qcm9taXNlKTtcblx0XHRcdFx0aW5kaXZpZHVhbEFjdGlvblByb21pc2UucHVzaChvaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZU9iamVjdC5vTG9jYWxBY3Rpb25Qcm9taXNlKTtcblx0XHRcdFx0Zm5SZXF1ZXN0U2lkZUVmZmVjdHMob0FwcENvbXBvbmVudCwgb1NpZGVFZmZlY3QsIG1QYXJhbWV0ZXJzLCBzR3JvdXBJZCwgaW5kaXZpZHVhbEFjdGlvblByb21pc2UpO1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGxTZXR0bGVkKGluZGl2aWR1YWxBY3Rpb25Qcm9taXNlKTtcblx0XHRcdH07XG5cdFx0XHRjb25zdCBmbkV4ZWN1dGVTaW5nbGVBY3Rpb24gPSBmdW5jdGlvbiAoYWN0aW9uQ29udGV4dDogYW55LCBjdXJyZW50X2NvbnRleHRfaW5kZXg6IGFueSwgb1NpZGVFZmZlY3Q6IGFueSwgaUNvbnRleHRMZW5ndGg6IGFueSkge1xuXHRcdFx0XHRjb25zdCBpbmRpdmlkdWFsQWN0aW9uUHJvbWlzZTogYW55ID0gW107XG5cdFx0XHRcdHNldEFjdGlvblBhcmFtZXRlckRlZmF1bHRWYWx1ZSgpO1xuXHRcdFx0XHQvLyBGb3IgaW52b2NhdGlvbiBncm91cGluZyBcImlzb2xhdGVkXCIgbmVlZCBiYXRjaCBncm91cCBwZXIgYWN0aW9uIGNhbGxcblx0XHRcdFx0c0dyb3VwSWQgPSBgYXBpTW9kZSR7Y3VycmVudF9jb250ZXh0X2luZGV4fWA7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLnJlcXVlc3RTaWRlRWZmZWN0cyA9IGZuUmVxdWVzdFNpZGVFZmZlY3RzLmJpbmQoXG5cdFx0XHRcdFx0b3BlcmF0aW9ucyxcblx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdG9TaWRlRWZmZWN0LFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdGluZGl2aWR1YWxBY3Rpb25Qcm9taXNlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdG9BY3Rpb25Qcm9taXNlID0gZXhlY3V0ZURlcGVuZGluZ09uU2VsZWN0ZWRDb250ZXh0cyhcblx0XHRcdFx0XHRhY3Rpb25Db250ZXh0LFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdGJHZXRCb3VuZENvbnRleHQsXG5cdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0cmVzb3VyY2VNb2RlbCxcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRjdXJyZW50X2NvbnRleHRfaW5kZXgsXG5cdFx0XHRcdFx0b2ludGVybmFsT3BlcmF0aW9uc1Byb21pc2VPYmplY3QuaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlc29sdmUsXG5cdFx0XHRcdFx0b2ludGVybmFsT3BlcmF0aW9uc1Byb21pc2VPYmplY3QuaW50ZXJuYWxPcGVyYXRpb25zUHJvbWlzZVJlamVjdCxcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRhQWN0aW9uUHJvbWlzZXMucHVzaChvQWN0aW9uUHJvbWlzZSk7XG5cdFx0XHRcdGluZGl2aWR1YWxBY3Rpb25Qcm9taXNlLnB1c2gob2ludGVybmFsT3BlcmF0aW9uc1Byb21pc2VPYmplY3Qub0xvY2FsQWN0aW9uUHJvbWlzZSk7XG5cdFx0XHRcdGZuUmVxdWVzdFNpZGVFZmZlY3RzKG9BcHBDb21wb25lbnQsIG9TaWRlRWZmZWN0LCBtUGFyYW1ldGVycywgc0dyb3VwSWQsIGluZGl2aWR1YWxBY3Rpb25Qcm9taXNlKTtcblx0XHRcdFx0b01vZGVsLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsU2V0dGxlZChpbmRpdmlkdWFsQWN0aW9uUHJvbWlzZSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRhc3luYyBmdW5jdGlvbiBmbkV4ZWN1dGVDaGFuZ2VzZXQoKSB7XG5cdFx0XHRcdGNvbnN0IGFDaGFuZ2VTZXRMb2NhbFByb21pc2VzID0gW10gYXMgYW55O1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgYUNvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0b0FjdGlvbiA9IG9Nb2RlbC5iaW5kQ29udGV4dChgJHtzQWN0aW9uTmFtZX0oLi4uKWAsIGFDb250ZXh0c1tpXSwgbUJpbmRpbmdQYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRhQ2hhbmdlU2V0TG9jYWxQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHRcdFx0Zm5FeGVjdXRlQWN0aW9uKFxuXHRcdFx0XHRcdFx0XHRvQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRhQ29udGV4dHMubGVuZ3RoIDw9IDEgPyBudWxsIDogaSxcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRleHQ6IGFDb250ZXh0c1tpXSxcblx0XHRcdFx0XHRcdFx0XHRwYXRoRXhwcmVzc2lvbnM6IG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ICYmIG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucyxcblx0XHRcdFx0XHRcdFx0XHR0cmlnZ2VyQWN0aW9uczogbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QgJiYgbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnNcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLmxlbmd0aFxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0KFxuXHRcdFx0XHRcdGZuT25TdWJtaXR0ZWQgfHxcblx0XHRcdFx0XHRmdW5jdGlvbiBub29wKCkge1xuXHRcdFx0XHRcdFx0LyoqL1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0KShhQWN0aW9uUHJvbWlzZXMpO1xuXG5cdFx0XHRcdGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChhQ2hhbmdlU2V0TG9jYWxQcm9taXNlcyk7XG5cdFx0XHRcdGlmIChzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJiBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1Byb21pc2VzLmxlbmd0aCkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvdGhlckVycm9yTWVzc2FnZUluZGV4ID0gY2hlY2tmb3JPdGhlck1lc3NhZ2VzKHRydWUpO1xuXHRcdFx0XHRcdFx0aWYgKG90aGVyRXJyb3JNZXNzYWdlSW5kZXggPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IG9wZXJhdGlvbnNIZWxwZXIucmVuZGVyTWVzc2FnZVZpZXcoXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdFx0cmVzb3VyY2VNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlcyxcblx0XHRcdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyxcblx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMubGVuZ3RoID4gMVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdQcm9taXNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzaFByb21pc2UpIHtcblx0XHRcdFx0XHRcdFx0XHRzaFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBtZXNzYWdlTW9kZWwgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG1lc3NhZ2VzSW5Nb2RlbCA9IG1lc3NhZ2VNb2RlbC5nZXREYXRhKCk7XG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VNb2RlbC5zZXREYXRhKG1lc3NhZ2VzSW5Nb2RlbC5jb25jYXQoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMuc3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXMpKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGNhdGNoIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIlJldHJpZ2dlcmluZyBvZiBzdHJpY3QgaGFuZGxpbmcgYWN0aW9ucyBmYWlsZWRcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGZuSGFuZGxlUmVzdWx0cygpO1xuXHRcdFx0fVxuXG5cdFx0XHRhc3luYyBmdW5jdGlvbiBmbkV4ZWN1dGVTZXF1ZW50aWFsbHkoY29udGV4dHNUb0V4ZWN1dGU6IENvbnRleHRbXSkge1xuXHRcdFx0XHQvLyBPbmUgYWN0aW9uIGFuZCBpdHMgc2lkZSBlZmZlY3RzIGFyZSBjb21wbGV0ZWQgYmVmb3JlIHRoZSBuZXh0IGFjdGlvbiBpcyBleGVjdXRlZFxuXHRcdFx0XHQoXG5cdFx0XHRcdFx0Zm5PblN1Ym1pdHRlZCB8fFxuXHRcdFx0XHRcdGZ1bmN0aW9uIG5vb3AoKSB7XG5cdFx0XHRcdFx0XHQvKiovXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpKGFBY3Rpb25Qcm9taXNlcyk7XG5cdFx0XHRcdGZ1bmN0aW9uIHByb2Nlc3NPbmVBY3Rpb24oY29udGV4dDogYW55LCBhY3Rpb25JbmRleDogYW55LCBpQ29udGV4dExlbmd0aDogYW55KSB7XG5cdFx0XHRcdFx0b0FjdGlvbiA9IG9Nb2RlbC5iaW5kQ29udGV4dChgJHtzQWN0aW9uTmFtZX0oLi4uKWAsIGNvbnRleHQsIG1CaW5kaW5nUGFyYW1ldGVycyk7XG5cdFx0XHRcdFx0cmV0dXJuIGZuRXhlY3V0ZVNpbmdsZUFjdGlvbihcblx0XHRcdFx0XHRcdG9BY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25JbmRleCxcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dDogY29udGV4dCxcblx0XHRcdFx0XHRcdFx0cGF0aEV4cHJlc3Npb25zOiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdCAmJiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMsXG5cdFx0XHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25zOiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdCAmJiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC50cmlnZ2VyQWN0aW9uc1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGlDb250ZXh0TGVuZ3RoXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIHNlcmlhbGl6YXRpb246IHByb2Nlc3NPbmVBY3Rpb24gdG8gYmUgY2FsbGVkIGZvciBlYWNoIGVudHJ5IGluIGNvbnRleHRzVG9FeGVjdXRlIG9ubHkgYWZ0ZXIgdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB0aGUgb25lIGJlZm9yZSBoYXMgYmVlbiByZXNvbHZlZFxuXHRcdFx0XHRhd2FpdCBjb250ZXh0c1RvRXhlY3V0ZS5yZWR1Y2UoYXN5bmMgKHByb21pc2U6IFByb21pc2U8dm9pZD4sIGNvbnRleHQ6IENvbnRleHQsIGlkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0XHRcdFx0XHRhd2FpdCBwcm9taXNlO1xuXHRcdFx0XHRcdGF3YWl0IHByb2Nlc3NPbmVBY3Rpb24oY29udGV4dCwgaWQgKyAxLCBhQ29udGV4dHMubGVuZ3RoKTtcblx0XHRcdFx0fSwgUHJvbWlzZS5yZXNvbHZlKCkpO1xuXG5cdFx0XHRcdGlmIChzdHJpY3RIYW5kbGluZ1V0aWxpdGllcyAmJiBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1Byb21pc2VzLmxlbmd0aCkge1xuXHRcdFx0XHRcdGF3YWl0IG9wZXJhdGlvbnNIZWxwZXIucmVuZGVyTWVzc2FnZVZpZXcoXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdHJlc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzLFxuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMsXG5cdFx0XHRcdFx0XHRhQ29udGV4dHMubGVuZ3RoID4gMVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm5IYW5kbGVSZXN1bHRzKCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghYkdyb3VwZWQpIHtcblx0XHRcdFx0Ly8gRm9yIGludm9jYXRpb24gZ3JvdXBpbmcgXCJpc29sYXRlZFwiLCBlbnN1cmUgdGhhdCBlYWNoIGFjdGlvbiBhbmQgbWF0Y2hpbmcgc2lkZSBlZmZlY3RzXG5cdFx0XHRcdC8vIGFyZSBwcm9jZXNzZWQgYmVmb3JlIHRoZSBuZXh0IHNldCBpcyBzdWJtaXR0ZWQuIFdvcmthcm91bmQgdW50aWwgSlNPTiBiYXRjaCBpcyBhdmFpbGFibGUuXG5cdFx0XHRcdC8vIEFsbG93IGFsc28gZm9yIExpc3QgUmVwb3J0LlxuXHRcdFx0XHRmbkV4ZWN1dGVTZXF1ZW50aWFsbHkoYUNvbnRleHRzKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZuRXhlY3V0ZUNoYW5nZXNldCgpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBmbkhhbmRsZVJlc3VsdHMoKSB7XG5cdFx0XHRcdC8vIFByb21pc2UuYWxsU2V0dGxlZCB3aWxsIG5ldmVyIGJlIHJlamVjdGVkLiBIb3dldmVyLCBlc2xpbnQgcmVxdWlyZXMgZWl0aGVyIGNhdGNoIG9yIHJldHVybiAtIHRodXMgd2UgcmV0dXJuIHRoZSByZXN1bHRpbmcgUHJvbWlzZSBhbHRob3VnaCBubyBvbmUgd2lsbCB1c2UgaXQuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmFsbFNldHRsZWQoYUFjdGlvblByb21pc2VzKS50aGVuKHJlc29sdmUpO1xuXHRcdFx0fVxuXHRcdH0pLmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0KFxuXHRcdFx0XHRmbk9uUmVzcG9uc2UgfHxcblx0XHRcdFx0ZnVuY3Rpb24gbm9vcCgpIHtcblx0XHRcdFx0XHQvKiovXG5cdFx0XHRcdH1cblx0XHRcdCkoKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRvQWN0aW9uID0gb01vZGVsLmJpbmRDb250ZXh0KGAvJHtzQWN0aW9uTmFtZX0oLi4uKWApO1xuXHRcdHNldEFjdGlvblBhcmFtZXRlckRlZmF1bHRWYWx1ZSgpO1xuXHRcdGNvbnN0IHNHcm91cElkID0gXCJhY3Rpb25JbXBvcnRcIjtcblx0XHRjb25zdCBvQWN0aW9uUHJvbWlzZSA9IG9BY3Rpb24uZXhlY3V0ZShcblx0XHRcdHNHcm91cElkLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0KG9wZXJhdGlvbnNIZWxwZXIgYXMgYW55KS5mbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQuYmluZChcblx0XHRcdFx0b3BlcmF0aW9ucyxcblx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdHsgbGFiZWw6IG1QYXJhbWV0ZXJzLmxhYmVsLCBtb2RlbDogb01vZGVsIH0sXG5cdFx0XHRcdHJlc291cmNlTW9kZWwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllc1xuXHRcdFx0KVxuXHRcdCk7XG5cdFx0b01vZGVsLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0XHQvLyB0cmlnZ2VyIG9uU3VibWl0dGVkIFwiZXZlbnRcIlxuXHRcdChcblx0XHRcdGZuT25TdWJtaXR0ZWQgfHxcblx0XHRcdGZ1bmN0aW9uIG5vb3AoKSB7XG5cdFx0XHRcdC8qKi9cblx0XHRcdH1cblx0XHQpKG9BY3Rpb25Qcm9taXNlKTtcblx0XHRyZXR1cm4gb0FjdGlvblByb21pc2Vcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChjdXJyZW50UHJvbWlzZVZhbHVlOiB1bmtub3duKSB7XG5cdFx0XHRcdC8vIEhlcmUgd2UgZW5zdXJlIHRoYXQgd2UgcmV0dXJuIHRoZSByZXNwb25zZSB3ZSBnb3QgZnJvbSBhbiB1bmJvdW5kIGFjdGlvbiB0byB0aGVcblx0XHRcdFx0Ly8gY2FsbGVyIEJDUCA6IDIyNzAxMzkyNzlcblx0XHRcdFx0aWYgKGN1cnJlbnRQcm9taXNlVmFsdWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gY3VycmVudFByb21pc2VWYWx1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5nZXRCb3VuZENvbnRleHQ/LigpPy5nZXRPYmplY3QoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZXhlY3V0aW5nIGFjdGlvbiBcIiArIHNBY3Rpb25OYW1lLCBvRXJyb3IpO1xuXHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQoXG5cdFx0XHRcdFx0Zm5PblJlc3BvbnNlIHx8XG5cdFx0XHRcdFx0ZnVuY3Rpb24gbm9vcCgpIHtcblx0XHRcdFx0XHRcdC8qKi9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdCkoKTtcblx0XHRcdH0pO1xuXHR9XG59XG5mdW5jdGlvbiBfZ2V0UGF0aChvQWN0aW9uQ29udGV4dDogYW55LCBzQWN0aW9uTmFtZTogYW55KSB7XG5cdGxldCBzUGF0aCA9IG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKTtcblx0c1BhdGggPSBvQWN0aW9uQ29udGV4dC5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSA/IHNQYXRoLnNwbGl0KFwiQCR1aTUub3ZlcmxvYWRcIilbMF0gOiBzUGF0aC5zcGxpdChcIi8wXCIpWzBdO1xuXHRyZXR1cm4gc1BhdGguc3BsaXQoYC8ke3NBY3Rpb25OYW1lfWApWzBdO1xufVxuXG5mdW5jdGlvbiBfdmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzKFxuXHRpc0NyZWF0ZUFjdGlvbjogYm9vbGVhbixcblx0YWN0aW9uUGFyYW1ldGVyczogUmVjb3JkPHN0cmluZywgYW55PltdLFxuXHRwYXJhbWV0ZXJWYWx1ZXM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+W10sXG5cdHN0YXJ0dXBQYXJhbWV0ZXJzPzogYW55XG4pOiBib29sZWFuIHtcblx0aWYgKHBhcmFtZXRlclZhbHVlcykge1xuXHRcdC8vIElmIHNob3dEaWFsb2cgaXMgZmFsc2UgYnV0IHRoZXJlIGFyZSBwYXJhbWV0ZXJzIGZyb20gdGhlIGludm9rZUFjdGlvbiBjYWxsLCB3ZSBuZWVkIHRvIGNoZWNrIHRoYXQgdmFsdWVzIGhhdmUgYmVlblxuXHRcdC8vIHByb3ZpZGVkIGZvciBhbGwgb2YgdGhlbVxuXHRcdGZvciAoY29uc3QgYWN0aW9uUGFyYW1ldGVyIG9mIGFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0YWN0aW9uUGFyYW1ldGVyLiROYW1lICE9PSBcIlJlc3VsdElzQWN0aXZlRW50aXR5XCIgJiZcblx0XHRcdFx0IXBhcmFtZXRlclZhbHVlcz8uZmluZCgoZWxlbWVudDogYW55KSA9PiBlbGVtZW50Lm5hbWUgPT09IGFjdGlvblBhcmFtZXRlci4kTmFtZSlcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBBdCBsZWFzdCBmb3Igb25lIHBhcmFtZXRlciBubyB2YWx1ZSBoYXMgYmVlbiBwcm92aWRlZCwgc28gd2UgY2FuJ3Qgc2tpcCB0aGUgZGlhbG9nXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAoaXNDcmVhdGVBY3Rpb24gJiYgc3RhcnR1cFBhcmFtZXRlcnMpIHtcblx0XHQvLyBJZiBwYXJhbWV0ZXJzIGhhdmUgYmVlbiBwcm92aWRlZCBkdXJpbmcgYXBwbGljYXRpb24gbGF1bmNoLCB3ZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBzZXQgaXMgY29tcGxldGVcblx0XHQvLyBJZiBub3QsIHRoZSBwYXJhbWV0ZXIgZGlhbG9nIHN0aWxsIG5lZWRzIHRvIGJlIHNob3duLlxuXHRcdGZvciAoY29uc3QgYWN0aW9uUGFyYW1ldGVyIG9mIGFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdGlmICghc3RhcnR1cFBhcmFtZXRlcnNbYWN0aW9uUGFyYW1ldGVyLiROYW1lXSkge1xuXHRcdFx0XHQvLyBBdCBsZWFzdCBmb3Igb25lIHBhcmFtZXRlciBubyB2YWx1ZSBoYXMgYmVlbiBwcm92aWRlZCwgc28gd2UgY2FuJ3Qgc2tpcCB0aGUgZGlhbG9nXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGZuUmVxdWVzdFNpZGVFZmZlY3RzKG9BcHBDb21wb25lbnQ6IGFueSwgb1NpZGVFZmZlY3Q6IGFueSwgbVBhcmFtZXRlcnM6IGFueSwgc0dyb3VwSWQ6IGFueSwgYUxvY2FsUHJvbWlzZT86IGFueSkge1xuXHRjb25zdCBvU2lkZUVmZmVjdHNTZXJ2aWNlID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0bGV0IG9Mb2NhbFByb21pc2U7XG5cdC8vIHRyaWdnZXIgYWN0aW9ucyBmcm9tIHNpZGUgZWZmZWN0c1xuXHRpZiAob1NpZGVFZmZlY3QgJiYgb1NpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnMgJiYgb1NpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0b1NpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoc1RyaWdnZXJBY3Rpb246IGFueSkge1xuXHRcdFx0aWYgKHNUcmlnZ2VyQWN0aW9uKSB7XG5cdFx0XHRcdG9Mb2NhbFByb21pc2UgPSBvU2lkZUVmZmVjdHNTZXJ2aWNlLmV4ZWN1dGVBY3Rpb24oc1RyaWdnZXJBY3Rpb24sIG9TaWRlRWZmZWN0LmNvbnRleHQsIHNHcm91cElkKTtcblx0XHRcdFx0aWYgKGFMb2NhbFByb21pc2UpIHtcblx0XHRcdFx0XHRhTG9jYWxQcm9taXNlLnB1c2gob0xvY2FsUHJvbWlzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHQvLyByZXF1ZXN0IHNpZGUgZWZmZWN0cyBmb3IgdGhpcyBhY3Rpb25cblx0Ly8gYXMgd2UgbW92ZSB0aGUgbWVzc2FnZXMgcmVxdWVzdCB0byBQT1NUICRzZWxlY3Qgd2UgbmVlZCB0byBiZSBwcmVwYXJlZCBmb3IgYW4gZW1wdHkgYXJyYXlcblx0aWYgKG9TaWRlRWZmZWN0ICYmIG9TaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucyAmJiBvU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMubGVuZ3RoID4gMCkge1xuXHRcdG9Mb2NhbFByb21pc2UgPSBvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhvU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMsIG9TaWRlRWZmZWN0LmNvbnRleHQsIHNHcm91cElkKTtcblx0XHRpZiAoYUxvY2FsUHJvbWlzZSkge1xuXHRcdFx0YUxvY2FsUHJvbWlzZS5wdXNoKG9Mb2NhbFByb21pc2UpO1xuXHRcdH1cblx0XHRvTG9jYWxQcm9taXNlXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmIChtUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXAgJiYgbVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnQoXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRcdEpTT04ucGFyc2UobVBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnNlbGVjdGVkSXRlbXMsXG5cdFx0XHRcdFx0XHRcInRhYmxlXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXF1ZXN0aW5nIHNpZGUgZWZmZWN0c1wiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBTdGF0aWMgZnVuY3Rpb25zIHRvIGNhbGwgT0RhdGEgYWN0aW9ucyAoYm91bmQvaW1wb3J0KSBhbmQgZnVuY3Rpb25zIChib3VuZC9pbXBvcnQpXG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9uc1xuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgZXhwZXJpbWVudGFsIHVzZSEgPGJyLz48Yj5UaGlzIGlzIG9ubHkgYSBQT0MgYW5kIG1heWJlIGRlbGV0ZWQ8L2I+XG4gKiBAc2luY2UgMS41Ni4wXG4gKi9cbmNvbnN0IG9wZXJhdGlvbnMgPSB7XG5cdGNhbGxCb3VuZEFjdGlvbjogY2FsbEJvdW5kQWN0aW9uLFxuXHRjYWxsQWN0aW9uSW1wb3J0OiBjYWxsQWN0aW9uSW1wb3J0LFxuXHRjYWxsQm91bmRGdW5jdGlvbjogY2FsbEJvdW5kRnVuY3Rpb24sXG5cdGNhbGxGdW5jdGlvbkltcG9ydDogY2FsbEZ1bmN0aW9uSW1wb3J0LFxuXHRleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzOiBleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzLFxuXHRjcmVhdGVpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlRm9yQWN0aW9uRXhlY3V0aW9uOiBjcmVhdGVpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlRm9yQWN0aW9uRXhlY3V0aW9uLFxuXHR2YWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnM6IF92YWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnMsXG5cdGdldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWU6IF9nZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lLFxuXHRhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrOiBhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrLFxuXHRhZnRlckFjdGlvblJlc29sdXRpb246IGFmdGVyQWN0aW9uUmVzb2x1dGlvbixcblx0Y2hlY2tmb3JPdGhlck1lc3NhZ2VzOiBjaGVja2Zvck90aGVyTWVzc2FnZXNcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9wZXJhdGlvbnM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztF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
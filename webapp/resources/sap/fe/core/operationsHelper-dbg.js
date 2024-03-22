/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/MessageBox", "sap/ui/core/message/Message", "sap/ui/model/json/JSONModel", "./controllerextensions/dialog/OperationsDialog.block", "./controllerextensions/messageHandler/messageHandling", "./formatters/TableFormatterTypes"], function (MessageBox, Message, JSONModel, OperationsDialogBlock, messageHandling, TableFormatterTypes) {
  "use strict";

  var MessageType = TableFormatterTypes.MessageType;
  function renderMessageView(mParameters, resourceModel, messageHandler, aMessages, strictHandlingUtilities, isMultiContext412, resolve, sGroupId, isUnboundAction) {
    const sActionName = mParameters.label;
    const oModel = mParameters.model;
    const strictHandlingPromises = strictHandlingUtilities === null || strictHandlingUtilities === void 0 ? void 0 : strictHandlingUtilities.strictHandlingPromises;
    let sMessage;
    let sCancelButtonTxt = resourceModel.getText("C_COMMON_DIALOG_CANCEL");
    let warningMessageText = "";
    let genericChangesetMessage = "";
    warningMessageText = mParameters.bGrouped ? resourceModel.getText("C_COMMON_DIALOG_CANCEL_MESSAGE_TEXT", [sActionName]) : resourceModel.getText("C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT");
    if (aMessages.length === 1) {
      const messageText = aMessages[0].getMessage();
      const identifierText = aMessages[0].getAdditionalText();
      genericChangesetMessage = resourceModel.getText("C_COMMON_DIALOG_CANCEL_SINGLE_MESSAGE_TEXT");
      if (!isMultiContext412) {
        sMessage = `${messageText}\n${resourceModel.getText("PROCEED")}`;
      } else if (identifierText !== undefined && identifierText !== "") {
        sCancelButtonTxt = mParameters.bGrouped ? sCancelButtonTxt : resourceModel.getText("C_COMMON_DIALOG_SKIP");
        const sHeaderInfoTypeName = mParameters.control.getParent().getTableDefinition().headerInfoTypeName;
        if (sHeaderInfoTypeName) {
          sMessage = `${sHeaderInfoTypeName.toString()} ${identifierText}: ${messageText}\n\n${warningMessageText}`;
        } else {
          sMessage = `${identifierText}: ${messageText}\n\n${warningMessageText}`;
        }
      } else {
        sCancelButtonTxt = mParameters.bGrouped ? sCancelButtonTxt : resourceModel.getText("C_COMMON_DIALOG_SKIP");
        sMessage = `${messageText}\n\n${warningMessageText}`;
      }
      if (isMultiContext412) {
        sMessage = `${genericChangesetMessage}\n\n${sMessage}`;
      }
      MessageBox.warning(sMessage, {
        title: resourceModel.getText("WARNING"),
        actions: [sActionName, sCancelButtonTxt],
        emphasizedAction: sActionName,
        onClose: function (sAction) {
          if (sAction === sActionName) {
            if (isUnboundAction) {
              // condition is true for unbound as well as static actions
              resolve(true);
              oModel.submitBatch(sGroupId);
              if (mParameters.requestSideEffects) {
                mParameters.requestSideEffects();
              }
            } else if (!isMultiContext412) {
              // condition true when mulitple contexts are selected but only one strict handling warning is recieved
              strictHandlingPromises[0].resolve(true);
              oModel.submitBatch(strictHandlingPromises[0].groupId);
              if (strictHandlingPromises[0].requestSideEffects) {
                strictHandlingPromises[0].requestSideEffects();
              }
            } else {
              strictHandlingPromises.forEach(function (sHPromise) {
                sHPromise.resolve(true);
                oModel.submitBatch(sHPromise.groupId);
                if (sHPromise.requestSideEffects) {
                  sHPromise.requestSideEffects();
                }
              });
              const strictHandlingFails = strictHandlingUtilities === null || strictHandlingUtilities === void 0 ? void 0 : strictHandlingUtilities.strictHandlingTransitionFails;
              if (strictHandlingFails.length > 0) {
                messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeTransitionMessages();
              }
            }
            if (strictHandlingUtilities) {
              strictHandlingUtilities.is412Executed = true;
            }
          } else {
            if (strictHandlingUtilities) {
              strictHandlingUtilities.is412Executed = false;
            }
            if (isUnboundAction) {
              resolve(false);
            } else if (!isMultiContext412) {
              strictHandlingPromises[0].resolve(false);
            } else {
              strictHandlingPromises.forEach(function (sHPromise) {
                sHPromise.resolve(false);
              });
            }
            if (mParameters.bGrouped) {
              MessageBox.information(resourceModel.getText("M_CHANGESET_CANCEL_MESSAGES"), {
                contentWidth: "150px"
              });
            }
          }
          if (strictHandlingUtilities) {
            strictHandlingUtilities.strictHandlingWarningMessages = [];
          }
        }
      });
    } else if (aMessages.length > 1) {
      if (isMultiContext412) {
        sCancelButtonTxt = mParameters.bGrouped ? sCancelButtonTxt : resourceModel.getText("C_COMMON_DIALOG_SKIP");
        const sWarningMessage = mParameters.bGrouped ? resourceModel.getText("C_COMMON_DIALOG_CANCEL_MESSAGES_WARNING") : resourceModel.getText("C_COMMON_DIALOG_SKIP_MESSAGES_WARNING");
        const sWarningDesc = mParameters.bGrouped ? resourceModel.getText("C_COMMON_DIALOG_CANCEL_MESSAGES_TEXT", [sActionName]) : resourceModel.getText("C_COMMON_DIALOG_SKIP_MESSAGES_TEXT", [sActionName]);
        const genericMessage = new Message({
          message: sWarningMessage,
          type: MessageType.Warning,
          target: undefined,
          persistent: true,
          description: sWarningDesc
        });
        aMessages = [genericMessage].concat(aMessages);
      }
      const oMessageDialogModel = new JSONModel();
      oMessageDialogModel.setData(aMessages);
      const bStrictHandlingFlow = true;
      const oMessageObject = messageHandling.prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow, isMultiContext412);
      const operationsDialog = new OperationsDialogBlock({
        messageObject: oMessageObject,
        isMultiContext412: isMultiContext412,
        isGrouped: mParameters === null || mParameters === void 0 ? void 0 : mParameters.bGrouped,
        resolve: resolve,
        model: oModel,
        groupId: sGroupId,
        actionName: sActionName,
        strictHandlingUtilities: strictHandlingUtilities,
        strictHandlingPromises: strictHandlingPromises,
        messageHandler: messageHandler,
        messageDialogModel: oMessageDialogModel,
        cancelButtonTxt: sCancelButtonTxt,
        showMessageInfo: function showMessageInfo() {
          MessageBox.information(resourceModel.getText("M_CHANGESET_CANCEL_MESSAGES"), {
            contentWidth: "150px"
          });
        }
      });
      operationsDialog.open();
    }
  }
  async function fnOnStrictHandlingFailed(sGroupId, mParameters, resourceModel, currentContextIndex, oContext, iContextLength, messageHandler, strictHandlingUtilities, a412Messages) {
    let shPromiseParams;
    if (currentContextIndex === null && iContextLength === null || currentContextIndex === 1 && iContextLength === 1) {
      return new Promise(function (resolve) {
        operationsHelper.renderMessageView(mParameters, resourceModel, messageHandler, a412Messages, strictHandlingUtilities, false, resolve, sGroupId, true);
      });
    }
    if (a412Messages.length) {
      var _mParameters$control, _mParameters$control$;
      const strictHandlingPromise = new Promise(function (resolve) {
        shPromiseParams = {
          requestSideEffects: mParameters.requestSideEffects,
          resolve: resolve,
          groupId: sGroupId
        };
      });
      strictHandlingUtilities.strictHandlingPromises.push(shPromiseParams);
      // copy existing 412 warning messages
      const aStrictHandlingWarningMessages = strictHandlingUtilities.strictHandlingWarningMessages;
      const sColumn = (_mParameters$control = mParameters.control) === null || _mParameters$control === void 0 ? void 0 : (_mParameters$control$ = _mParameters$control.getParent()) === null || _mParameters$control$ === void 0 ? void 0 : _mParameters$control$.getIdentifierColumn();
      let sValue = "";
      if (sColumn && iContextLength && iContextLength > 1) {
        sValue = oContext && oContext.getObject(sColumn);
      }

      // set type and subtitle for all warning messages
      a412Messages.forEach(function (msg) {
        msg.setType("Warning");
        msg.setAdditionalText(sValue);
        aStrictHandlingWarningMessages.push(msg);
      });
      strictHandlingUtilities.strictHandlingWarningMessages = aStrictHandlingWarningMessages;
      mParameters.internalOperationsPromiseResolve();
      return strictHandlingPromise;
    }
  }
  const operationsHelper = {
    renderMessageView: renderMessageView,
    fnOnStrictHandlingFailed: fnOnStrictHandlingFailed
  };
  return operationsHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZW5kZXJNZXNzYWdlVmlldyIsIm1QYXJhbWV0ZXJzIiwicmVzb3VyY2VNb2RlbCIsIm1lc3NhZ2VIYW5kbGVyIiwiYU1lc3NhZ2VzIiwic3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMiLCJpc011bHRpQ29udGV4dDQxMiIsInJlc29sdmUiLCJzR3JvdXBJZCIsImlzVW5ib3VuZEFjdGlvbiIsInNBY3Rpb25OYW1lIiwibGFiZWwiLCJvTW9kZWwiLCJtb2RlbCIsInN0cmljdEhhbmRsaW5nUHJvbWlzZXMiLCJzTWVzc2FnZSIsInNDYW5jZWxCdXR0b25UeHQiLCJnZXRUZXh0Iiwid2FybmluZ01lc3NhZ2VUZXh0IiwiZ2VuZXJpY0NoYW5nZXNldE1lc3NhZ2UiLCJiR3JvdXBlZCIsImxlbmd0aCIsIm1lc3NhZ2VUZXh0IiwiZ2V0TWVzc2FnZSIsImlkZW50aWZpZXJUZXh0IiwiZ2V0QWRkaXRpb25hbFRleHQiLCJ1bmRlZmluZWQiLCJzSGVhZGVySW5mb1R5cGVOYW1lIiwiY29udHJvbCIsImdldFBhcmVudCIsImdldFRhYmxlRGVmaW5pdGlvbiIsImhlYWRlckluZm9UeXBlTmFtZSIsInRvU3RyaW5nIiwiTWVzc2FnZUJveCIsIndhcm5pbmciLCJ0aXRsZSIsImFjdGlvbnMiLCJlbXBoYXNpemVkQWN0aW9uIiwib25DbG9zZSIsInNBY3Rpb24iLCJzdWJtaXRCYXRjaCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImdyb3VwSWQiLCJmb3JFYWNoIiwic0hQcm9taXNlIiwic3RyaWN0SGFuZGxpbmdGYWlscyIsInN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwiaXM0MTJFeGVjdXRlZCIsImluZm9ybWF0aW9uIiwiY29udGVudFdpZHRoIiwic3RyaWN0SGFuZGxpbmdXYXJuaW5nTWVzc2FnZXMiLCJzV2FybmluZ01lc3NhZ2UiLCJzV2FybmluZ0Rlc2MiLCJnZW5lcmljTWVzc2FnZSIsIk1lc3NhZ2UiLCJtZXNzYWdlIiwidHlwZSIsIk1lc3NhZ2VUeXBlIiwiV2FybmluZyIsInRhcmdldCIsInBlcnNpc3RlbnQiLCJkZXNjcmlwdGlvbiIsImNvbmNhdCIsIm9NZXNzYWdlRGlhbG9nTW9kZWwiLCJKU09OTW9kZWwiLCJzZXREYXRhIiwiYlN0cmljdEhhbmRsaW5nRmxvdyIsIm9NZXNzYWdlT2JqZWN0IiwibWVzc2FnZUhhbmRsaW5nIiwicHJlcGFyZU1lc3NhZ2VWaWV3Rm9yRGlhbG9nIiwib3BlcmF0aW9uc0RpYWxvZyIsIk9wZXJhdGlvbnNEaWFsb2dCbG9jayIsIm1lc3NhZ2VPYmplY3QiLCJpc0dyb3VwZWQiLCJhY3Rpb25OYW1lIiwibWVzc2FnZURpYWxvZ01vZGVsIiwiY2FuY2VsQnV0dG9uVHh0Iiwic2hvd01lc3NhZ2VJbmZvIiwib3BlbiIsImZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZCIsImN1cnJlbnRDb250ZXh0SW5kZXgiLCJvQ29udGV4dCIsImlDb250ZXh0TGVuZ3RoIiwiYTQxMk1lc3NhZ2VzIiwic2hQcm9taXNlUGFyYW1zIiwiUHJvbWlzZSIsIm9wZXJhdGlvbnNIZWxwZXIiLCJzdHJpY3RIYW5kbGluZ1Byb21pc2UiLCJwdXNoIiwiYVN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzIiwic0NvbHVtbiIsImdldElkZW50aWZpZXJDb2x1bW4iLCJzVmFsdWUiLCJnZXRPYmplY3QiLCJtc2ciLCJzZXRUeXBlIiwic2V0QWRkaXRpb25hbFRleHQiLCJpbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVzb2x2ZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsib3BlcmF0aW9uc0hlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCB0eXBlIFRhYmxlQVBJIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1RhYmxlQVBJXCI7XG5pbXBvcnQgdHlwZSBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9tZGMvQ29udHJvbFwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCBPcGVyYXRpb25zRGlhbG9nQmxvY2sgZnJvbSBcIi4vY29udHJvbGxlcmV4dGVuc2lvbnMvZGlhbG9nL09wZXJhdGlvbnNEaWFsb2cuYmxvY2tcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VIYW5kbGVyIGZyb20gXCIuL2NvbnRyb2xsZXJleHRlbnNpb25zL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCIuL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwiLi9mb3JtYXR0ZXJzL1RhYmxlRm9ybWF0dGVyVHlwZXNcIjtcbnR5cGUgU3RyaWN0SGFuZGxpbmdQcm9taXNlID0ge1xuXHRyZXNvbHZlOiBGdW5jdGlvbjtcblx0Z3JvdXBJZDogc3RyaW5nO1xuXHRyZXF1ZXN0U2lkZUVmZmVjdHM/OiBGdW5jdGlvbjtcbn07XG5leHBvcnQgdHlwZSBTdHJpY3RIYW5kbGluZ1BhcmFtZXRlcnMgPSB7XG5cdGludGVybmFsT3BlcmF0aW9uc1Byb21pc2VSZXNvbHZlOiBGdW5jdGlvbjtcblx0bGFiZWw6IHN0cmluZztcblx0bW9kZWw6IE9EYXRhTW9kZWw7XG5cdGludGVybmFsTW9kZWxDb250ZXh0PzogSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdGNvbnRyb2w6IENvbnRyb2w7XG5cdHJlcXVlc3RTaWRlRWZmZWN0cz86IEZ1bmN0aW9uO1xuXHRkaWFsb2c/OiBEaWFsb2c7XG5cdGJHcm91cGVkOiBib29sZWFuO1xufTtcbnR5cGUgT3BlcmF0aW9uc0hlbHBlciA9IHtcblx0cmVuZGVyTWVzc2FnZVZpZXc6IEZ1bmN0aW9uO1xuXHRmbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQ6IEZ1bmN0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgU3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMgPSB7XG5cdGlzNDEyRXhlY3V0ZWQ6IGJvb2xlYW47XG5cdHN0cmljdEhhbmRsaW5nVHJhbnNpdGlvbkZhaWxzOiBPYmplY3RbXTtcblx0c3RyaWN0SGFuZGxpbmdQcm9taXNlczogU3RyaWN0SGFuZGxpbmdQcm9taXNlW107XG5cdHN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzOiBNZXNzYWdlW107XG5cdGRlbGF5U3VjY2Vzc01lc3NhZ2VzOiBNZXNzYWdlW107XG5cdHByb2Nlc3NlZE1lc3NhZ2VJZHM6IHN0cmluZ1tdO1xufTtcblxuZnVuY3Rpb24gcmVuZGVyTWVzc2FnZVZpZXcoXG5cdG1QYXJhbWV0ZXJzOiBTdHJpY3RIYW5kbGluZ1BhcmFtZXRlcnMsXG5cdHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwsXG5cdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlciB8IHVuZGVmaW5lZCxcblx0YU1lc3NhZ2VzOiBNZXNzYWdlW10sXG5cdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzOiBTdHJpY3RIYW5kbGluZ1V0aWxpdGllcyxcblx0aXNNdWx0aUNvbnRleHQ0MTI6IGJvb2xlYW4sXG5cdHJlc29sdmU/OiBGdW5jdGlvbixcblx0c0dyb3VwSWQ/OiBzdHJpbmcsXG5cdGlzVW5ib3VuZEFjdGlvbj86IGJvb2xlYW5cbik6IHVua25vd247XG5mdW5jdGlvbiByZW5kZXJNZXNzYWdlVmlldyhcblx0bVBhcmFtZXRlcnM6IFN0cmljdEhhbmRsaW5nUGFyYW1ldGVycyxcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCxcblx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyIHwgdW5kZWZpbmVkLFxuXHRhTWVzc2FnZXM6IE1lc3NhZ2VbXSxcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM6IFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLFxuXHRpc011bHRpQ29udGV4dDQxMj86IGJvb2xlYW4sXG5cdHJlc29sdmU/OiBGdW5jdGlvbixcblx0c0dyb3VwSWQ/OiBzdHJpbmcsXG5cdGlzVW5ib3VuZEFjdGlvbj86IGJvb2xlYW5cbikge1xuXHRjb25zdCBzQWN0aW9uTmFtZSA9IG1QYXJhbWV0ZXJzLmxhYmVsO1xuXHRjb25zdCBvTW9kZWwgPSBtUGFyYW1ldGVycy5tb2RlbDtcblx0Y29uc3Qgc3RyaWN0SGFuZGxpbmdQcm9taXNlcyA9IHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzPy5zdHJpY3RIYW5kbGluZ1Byb21pc2VzO1xuXHRsZXQgc01lc3NhZ2U6IHN0cmluZztcblx0bGV0IHNDYW5jZWxCdXR0b25UeHQ6IHN0cmluZyA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX0RJQUxPR19DQU5DRUxcIik7XG5cdGxldCB3YXJuaW5nTWVzc2FnZVRleHQgPSBcIlwiO1xuXHRsZXQgZ2VuZXJpY0NoYW5nZXNldE1lc3NhZ2UgPSBcIlwiO1xuXHR3YXJuaW5nTWVzc2FnZVRleHQgPSBtUGFyYW1ldGVycy5iR3JvdXBlZFxuXHRcdD8gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX0NBTkNFTF9NRVNTQUdFX1RFWFRcIiwgW3NBY3Rpb25OYW1lXSlcblx0XHQ6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX0RJQUxPR19TS0lQX1NJTkdMRV9NRVNTQUdFX1RFWFRcIik7XG5cdGlmIChhTWVzc2FnZXMubGVuZ3RoID09PSAxKSB7XG5cdFx0Y29uc3QgbWVzc2FnZVRleHQgPSBhTWVzc2FnZXNbMF0uZ2V0TWVzc2FnZSgpO1xuXHRcdGNvbnN0IGlkZW50aWZpZXJUZXh0ID0gYU1lc3NhZ2VzWzBdLmdldEFkZGl0aW9uYWxUZXh0KCk7XG5cdFx0Z2VuZXJpY0NoYW5nZXNldE1lc3NhZ2UgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfQ0FOQ0VMX1NJTkdMRV9NRVNTQUdFX1RFWFRcIik7XG5cdFx0aWYgKCFpc011bHRpQ29udGV4dDQxMikge1xuXHRcdFx0c01lc3NhZ2UgPSBgJHttZXNzYWdlVGV4dH1cXG4ke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlBST0NFRURcIil9YDtcblx0XHR9IGVsc2UgaWYgKGlkZW50aWZpZXJUZXh0ICE9PSB1bmRlZmluZWQgJiYgaWRlbnRpZmllclRleHQgIT09IFwiXCIpIHtcblx0XHRcdHNDYW5jZWxCdXR0b25UeHQgPSBtUGFyYW1ldGVycy5iR3JvdXBlZCA/IHNDYW5jZWxCdXR0b25UeHQgOiByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfU0tJUFwiKTtcblx0XHRcdGNvbnN0IHNIZWFkZXJJbmZvVHlwZU5hbWUgPSAobVBhcmFtZXRlcnMuY29udHJvbC5nZXRQYXJlbnQoKSBhcyBUYWJsZUFQSSkuZ2V0VGFibGVEZWZpbml0aW9uKCkuaGVhZGVySW5mb1R5cGVOYW1lO1xuXHRcdFx0aWYgKHNIZWFkZXJJbmZvVHlwZU5hbWUpIHtcblx0XHRcdFx0c01lc3NhZ2UgPSBgJHtzSGVhZGVySW5mb1R5cGVOYW1lLnRvU3RyaW5nKCl9ICR7aWRlbnRpZmllclRleHR9OiAke21lc3NhZ2VUZXh0fVxcblxcbiR7d2FybmluZ01lc3NhZ2VUZXh0fWA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzTWVzc2FnZSA9IGAke2lkZW50aWZpZXJUZXh0fTogJHttZXNzYWdlVGV4dH1cXG5cXG4ke3dhcm5pbmdNZXNzYWdlVGV4dH1gO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzQ2FuY2VsQnV0dG9uVHh0ID0gbVBhcmFtZXRlcnMuYkdyb3VwZWQgPyBzQ2FuY2VsQnV0dG9uVHh0IDogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX1NLSVBcIik7XG5cdFx0XHRzTWVzc2FnZSA9IGAke21lc3NhZ2VUZXh0fVxcblxcbiR7d2FybmluZ01lc3NhZ2VUZXh0fWA7XG5cdFx0fVxuXHRcdGlmIChpc011bHRpQ29udGV4dDQxMikge1xuXHRcdFx0c01lc3NhZ2UgPSBgJHtnZW5lcmljQ2hhbmdlc2V0TWVzc2FnZX1cXG5cXG4ke3NNZXNzYWdlfWA7XG5cdFx0fVxuXHRcdE1lc3NhZ2VCb3gud2FybmluZyhzTWVzc2FnZSwge1xuXHRcdFx0dGl0bGU6IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIldBUk5JTkdcIiksXG5cdFx0XHRhY3Rpb25zOiBbc0FjdGlvbk5hbWUsIHNDYW5jZWxCdXR0b25UeHRdLFxuXHRcdFx0ZW1waGFzaXplZEFjdGlvbjogc0FjdGlvbk5hbWUsXG5cdFx0XHRvbkNsb3NlOiBmdW5jdGlvbiAoc0FjdGlvbjogc3RyaW5nKSB7XG5cdFx0XHRcdGlmIChzQWN0aW9uID09PSBzQWN0aW9uTmFtZSkge1xuXHRcdFx0XHRcdGlmIChpc1VuYm91bmRBY3Rpb24pIHtcblx0XHRcdFx0XHRcdC8vIGNvbmRpdGlvbiBpcyB0cnVlIGZvciB1bmJvdW5kIGFzIHdlbGwgYXMgc3RhdGljIGFjdGlvbnNcblx0XHRcdFx0XHRcdHJlc29sdmUhKHRydWUpO1xuXHRcdFx0XHRcdFx0b01vZGVsLnN1Ym1pdEJhdGNoKHNHcm91cElkISk7XG5cdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMucmVxdWVzdFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnJlcXVlc3RTaWRlRWZmZWN0cygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIWlzTXVsdGlDb250ZXh0NDEyKSB7XG5cdFx0XHRcdFx0XHQvLyBjb25kaXRpb24gdHJ1ZSB3aGVuIG11bGl0cGxlIGNvbnRleHRzIGFyZSBzZWxlY3RlZCBidXQgb25seSBvbmUgc3RyaWN0IGhhbmRsaW5nIHdhcm5pbmcgaXMgcmVjaWV2ZWRcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nUHJvbWlzZXNbMF0ucmVzb2x2ZSh0cnVlKTtcblx0XHRcdFx0XHRcdG9Nb2RlbC5zdWJtaXRCYXRjaChzdHJpY3RIYW5kbGluZ1Byb21pc2VzWzBdLmdyb3VwSWQpO1xuXHRcdFx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nUHJvbWlzZXNbMF0ucmVxdWVzdFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nUHJvbWlzZXNbMF0ucmVxdWVzdFNpZGVFZmZlY3RzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nUHJvbWlzZXMuZm9yRWFjaChmdW5jdGlvbiAoc0hQcm9taXNlOiBTdHJpY3RIYW5kbGluZ1Byb21pc2UpIHtcblx0XHRcdFx0XHRcdFx0c0hQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdG9Nb2RlbC5zdWJtaXRCYXRjaChzSFByb21pc2UuZ3JvdXBJZCk7XG5cdFx0XHRcdFx0XHRcdGlmIChzSFByb21pc2UucmVxdWVzdFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0XHRcdFx0c0hQcm9taXNlLnJlcXVlc3RTaWRlRWZmZWN0cygpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvbnN0IHN0cmljdEhhbmRsaW5nRmFpbHMgPSBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcz8uc3RyaWN0SGFuZGxpbmdUcmFuc2l0aW9uRmFpbHM7XG5cdFx0XHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdGYWlscy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyPy5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzKSB7XG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aWYgKHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzKSB7XG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5pczQxMkV4ZWN1dGVkID0gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChpc1VuYm91bmRBY3Rpb24pIHtcblx0XHRcdFx0XHRcdHJlc29sdmUhKGZhbHNlKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKCFpc011bHRpQ29udGV4dDQxMikge1xuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlc1swXS5yZXNvbHZlKGZhbHNlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzSFByb21pc2U6IFN0cmljdEhhbmRsaW5nUHJvbWlzZSkge1xuXHRcdFx0XHRcdFx0XHRzSFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmJHcm91cGVkKSB7XG5cdFx0XHRcdFx0XHRNZXNzYWdlQm94LmluZm9ybWF0aW9uKHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fQ0hBTkdFU0VUX0NBTkNFTF9NRVNTQUdFU1wiKSwge1xuXHRcdFx0XHRcdFx0XHRjb250ZW50V2lkdGg6IFwiMTUwcHhcIlxuXHRcdFx0XHRcdFx0fSBhcyBvYmplY3QpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdVdGlsaXRpZXMpIHtcblx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlcyA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoYU1lc3NhZ2VzLmxlbmd0aCA+IDEpIHtcblx0XHRpZiAoaXNNdWx0aUNvbnRleHQ0MTIpIHtcblx0XHRcdHNDYW5jZWxCdXR0b25UeHQgPSBtUGFyYW1ldGVycy5iR3JvdXBlZCA/IHNDYW5jZWxCdXR0b25UeHQgOiByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfU0tJUFwiKTtcblx0XHRcdGNvbnN0IHNXYXJuaW5nTWVzc2FnZSA9IG1QYXJhbWV0ZXJzLmJHcm91cGVkXG5cdFx0XHRcdD8gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX0NBTkNFTF9NRVNTQUdFU19XQVJOSU5HXCIpXG5cdFx0XHRcdDogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX1NLSVBfTUVTU0FHRVNfV0FSTklOR1wiKTtcblx0XHRcdGNvbnN0IHNXYXJuaW5nRGVzYyA9IG1QYXJhbWV0ZXJzLmJHcm91cGVkXG5cdFx0XHRcdD8gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX0NBTkNFTF9NRVNTQUdFU19URVhUXCIsIFtzQWN0aW9uTmFtZV0pXG5cdFx0XHRcdDogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19DT01NT05fRElBTE9HX1NLSVBfTUVTU0FHRVNfVEVYVFwiLCBbc0FjdGlvbk5hbWVdKTtcblx0XHRcdGNvbnN0IGdlbmVyaWNNZXNzYWdlID0gbmV3IE1lc3NhZ2Uoe1xuXHRcdFx0XHRtZXNzYWdlOiBzV2FybmluZ01lc3NhZ2UsXG5cdFx0XHRcdHR5cGU6IE1lc3NhZ2VUeXBlLldhcm5pbmcsXG5cdFx0XHRcdHRhcmdldDogdW5kZWZpbmVkLFxuXHRcdFx0XHRwZXJzaXN0ZW50OiB0cnVlLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogc1dhcm5pbmdEZXNjXG5cdFx0XHR9KTtcblx0XHRcdGFNZXNzYWdlcyA9IFtnZW5lcmljTWVzc2FnZV0uY29uY2F0KGFNZXNzYWdlcyk7XG5cdFx0fVxuXHRcdGNvbnN0IG9NZXNzYWdlRGlhbG9nTW9kZWwgPSBuZXcgSlNPTk1vZGVsKCk7XG5cdFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5zZXREYXRhKGFNZXNzYWdlcyk7XG5cdFx0Y29uc3QgYlN0cmljdEhhbmRsaW5nRmxvdyA9IHRydWU7XG5cdFx0Y29uc3Qgb01lc3NhZ2VPYmplY3QgPSBtZXNzYWdlSGFuZGxpbmcucHJlcGFyZU1lc3NhZ2VWaWV3Rm9yRGlhbG9nKG9NZXNzYWdlRGlhbG9nTW9kZWwsIGJTdHJpY3RIYW5kbGluZ0Zsb3csIGlzTXVsdGlDb250ZXh0NDEyKTtcblx0XHRjb25zdCBvcGVyYXRpb25zRGlhbG9nID0gbmV3IE9wZXJhdGlvbnNEaWFsb2dCbG9jayh7XG5cdFx0XHRtZXNzYWdlT2JqZWN0OiBvTWVzc2FnZU9iamVjdCxcblx0XHRcdGlzTXVsdGlDb250ZXh0NDEyOiBpc011bHRpQ29udGV4dDQxMixcblx0XHRcdGlzR3JvdXBlZDogbVBhcmFtZXRlcnM/LmJHcm91cGVkLFxuXHRcdFx0cmVzb2x2ZTogcmVzb2x2ZSxcblx0XHRcdG1vZGVsOiBvTW9kZWwsXG5cdFx0XHRncm91cElkOiBzR3JvdXBJZCxcblx0XHRcdGFjdGlvbk5hbWU6IHNBY3Rpb25OYW1lLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM6IHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLFxuXHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlczogc3RyaWN0SGFuZGxpbmdQcm9taXNlcyxcblx0XHRcdG1lc3NhZ2VIYW5kbGVyOiBtZXNzYWdlSGFuZGxlcixcblx0XHRcdG1lc3NhZ2VEaWFsb2dNb2RlbDogb01lc3NhZ2VEaWFsb2dNb2RlbCxcblx0XHRcdGNhbmNlbEJ1dHRvblR4dDogc0NhbmNlbEJ1dHRvblR4dCxcblx0XHRcdHNob3dNZXNzYWdlSW5mbzogZnVuY3Rpb24gc2hvd01lc3NhZ2VJbmZvKCkge1xuXHRcdFx0XHRNZXNzYWdlQm94LmluZm9ybWF0aW9uKHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fQ0hBTkdFU0VUX0NBTkNFTF9NRVNTQUdFU1wiKSwge1xuXHRcdFx0XHRcdGNvbnRlbnRXaWR0aDogXCIxNTBweFwiXG5cdFx0XHRcdH0gYXMgb2JqZWN0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRvcGVyYXRpb25zRGlhbG9nLm9wZW4oKTtcblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBmbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQoXG5cdHNHcm91cElkOiBzdHJpbmcsXG5cdG1QYXJhbWV0ZXJzOiBTdHJpY3RIYW5kbGluZ1BhcmFtZXRlcnMsXG5cdHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwsXG5cdGN1cnJlbnRDb250ZXh0SW5kZXg6IG51bWJlciB8IG51bGwsXG5cdG9Db250ZXh0OiBDb250ZXh0IHwgbnVsbCxcblx0aUNvbnRleHRMZW5ndGg6IG51bWJlciB8IG51bGwsXG5cdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlciB8IHVuZGVmaW5lZCxcblx0c3RyaWN0SGFuZGxpbmdVdGlsaXRpZXM6IFN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLFxuXHRhNDEyTWVzc2FnZXM6IE1lc3NhZ2VbXVxuKSB7XG5cdGxldCBzaFByb21pc2VQYXJhbXM6IFN0cmljdEhhbmRsaW5nUHJvbWlzZSB8IHVuZGVmaW5lZDtcblxuXHRpZiAoKGN1cnJlbnRDb250ZXh0SW5kZXggPT09IG51bGwgJiYgaUNvbnRleHRMZW5ndGggPT09IG51bGwpIHx8IChjdXJyZW50Q29udGV4dEluZGV4ID09PSAxICYmIGlDb250ZXh0TGVuZ3RoID09PSAxKSkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdFx0b3BlcmF0aW9uc0hlbHBlci5yZW5kZXJNZXNzYWdlVmlldyhcblx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdHJlc291cmNlTW9kZWwsXG5cdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRhNDEyTWVzc2FnZXMsXG5cdFx0XHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLFxuXHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0cmVzb2x2ZSxcblx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdHRydWVcblx0XHRcdCk7XG5cdFx0fSk7XG5cdH1cblxuXHRpZiAoYTQxMk1lc3NhZ2VzLmxlbmd0aCkge1xuXHRcdGNvbnN0IHN0cmljdEhhbmRsaW5nUHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRzaFByb21pc2VQYXJhbXMgPSB7XG5cdFx0XHRcdHJlcXVlc3RTaWRlRWZmZWN0czogbVBhcmFtZXRlcnMucmVxdWVzdFNpZGVFZmZlY3RzLFxuXHRcdFx0XHRyZXNvbHZlOiByZXNvbHZlLFxuXHRcdFx0XHRncm91cElkOiBzR3JvdXBJZFxuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdHN0cmljdEhhbmRsaW5nVXRpbGl0aWVzLnN0cmljdEhhbmRsaW5nUHJvbWlzZXMucHVzaChzaFByb21pc2VQYXJhbXMgYXMgU3RyaWN0SGFuZGxpbmdQcm9taXNlKTtcblx0XHQvLyBjb3B5IGV4aXN0aW5nIDQxMiB3YXJuaW5nIG1lc3NhZ2VzXG5cdFx0Y29uc3QgYVN0cmljdEhhbmRsaW5nV2FybmluZ01lc3NhZ2VzOiBNZXNzYWdlW10gPSBzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlcztcblx0XHRjb25zdCBzQ29sdW1uID0gKG1QYXJhbWV0ZXJzLmNvbnRyb2w/LmdldFBhcmVudCgpIGFzIFRhYmxlQVBJKT8uZ2V0SWRlbnRpZmllckNvbHVtbigpO1xuXHRcdGxldCBzVmFsdWUgPSBcIlwiO1xuXHRcdGlmIChzQ29sdW1uICYmIGlDb250ZXh0TGVuZ3RoICYmIGlDb250ZXh0TGVuZ3RoID4gMSkge1xuXHRcdFx0c1ZhbHVlID0gb0NvbnRleHQgJiYgb0NvbnRleHQuZ2V0T2JqZWN0KHNDb2x1bW4pO1xuXHRcdH1cblxuXHRcdC8vIHNldCB0eXBlIGFuZCBzdWJ0aXRsZSBmb3IgYWxsIHdhcm5pbmcgbWVzc2FnZXNcblx0XHRhNDEyTWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbiAobXNnOiBNZXNzYWdlKSB7XG5cdFx0XHRtc2cuc2V0VHlwZShcIldhcm5pbmdcIik7XG5cdFx0XHRtc2cuc2V0QWRkaXRpb25hbFRleHQoc1ZhbHVlKTtcblx0XHRcdGFTdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlcy5wdXNoKG1zZyk7XG5cdFx0fSk7XG5cblx0XHRzdHJpY3RIYW5kbGluZ1V0aWxpdGllcy5zdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlcyA9IGFTdHJpY3RIYW5kbGluZ1dhcm5pbmdNZXNzYWdlcztcblx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE9wZXJhdGlvbnNQcm9taXNlUmVzb2x2ZSgpO1xuXHRcdHJldHVybiBzdHJpY3RIYW5kbGluZ1Byb21pc2U7XG5cdH1cbn1cblxuY29uc3Qgb3BlcmF0aW9uc0hlbHBlcjogT3BlcmF0aW9uc0hlbHBlciA9IHtcblx0cmVuZGVyTWVzc2FnZVZpZXc6IHJlbmRlck1lc3NhZ2VWaWV3LFxuXHRmbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQ6IGZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZFxufTtcblxuZXhwb3J0IGRlZmF1bHQgb3BlcmF0aW9uc0hlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFzREEsU0FBU0EsaUJBQWlCLENBQ3pCQyxXQUFxQyxFQUNyQ0MsYUFBNEIsRUFDNUJDLGNBQTBDLEVBQzFDQyxTQUFvQixFQUNwQkMsdUJBQWdELEVBQ2hEQyxpQkFBMkIsRUFDM0JDLE9BQWtCLEVBQ2xCQyxRQUFpQixFQUNqQkMsZUFBeUIsRUFDeEI7SUFDRCxNQUFNQyxXQUFXLEdBQUdULFdBQVcsQ0FBQ1UsS0FBSztJQUNyQyxNQUFNQyxNQUFNLEdBQUdYLFdBQVcsQ0FBQ1ksS0FBSztJQUNoQyxNQUFNQyxzQkFBc0IsR0FBR1QsdUJBQXVCLGFBQXZCQSx1QkFBdUIsdUJBQXZCQSx1QkFBdUIsQ0FBRVMsc0JBQXNCO0lBQzlFLElBQUlDLFFBQWdCO0lBQ3BCLElBQUlDLGdCQUF3QixHQUFHZCxhQUFhLENBQUNlLE9BQU8sQ0FBQyx3QkFBd0IsQ0FBQztJQUM5RSxJQUFJQyxrQkFBa0IsR0FBRyxFQUFFO0lBQzNCLElBQUlDLHVCQUF1QixHQUFHLEVBQUU7SUFDaENELGtCQUFrQixHQUFHakIsV0FBVyxDQUFDbUIsUUFBUSxHQUN0Q2xCLGFBQWEsQ0FBQ2UsT0FBTyxDQUFDLHFDQUFxQyxFQUFFLENBQUNQLFdBQVcsQ0FBQyxDQUFDLEdBQzNFUixhQUFhLENBQUNlLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBQztJQUNwRSxJQUFJYixTQUFTLENBQUNpQixNQUFNLEtBQUssQ0FBQyxFQUFFO01BQzNCLE1BQU1DLFdBQVcsR0FBR2xCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQ21CLFVBQVUsRUFBRTtNQUM3QyxNQUFNQyxjQUFjLEdBQUdwQixTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUNxQixpQkFBaUIsRUFBRTtNQUN2RE4sdUJBQXVCLEdBQUdqQixhQUFhLENBQUNlLE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQztNQUM3RixJQUFJLENBQUNYLGlCQUFpQixFQUFFO1FBQ3ZCUyxRQUFRLEdBQUksR0FBRU8sV0FBWSxLQUFJcEIsYUFBYSxDQUFDZSxPQUFPLENBQUMsU0FBUyxDQUFFLEVBQUM7TUFDakUsQ0FBQyxNQUFNLElBQUlPLGNBQWMsS0FBS0UsU0FBUyxJQUFJRixjQUFjLEtBQUssRUFBRSxFQUFFO1FBQ2pFUixnQkFBZ0IsR0FBR2YsV0FBVyxDQUFDbUIsUUFBUSxHQUFHSixnQkFBZ0IsR0FBR2QsYUFBYSxDQUFDZSxPQUFPLENBQUMsc0JBQXNCLENBQUM7UUFDMUcsTUFBTVUsbUJBQW1CLEdBQUkxQixXQUFXLENBQUMyQixPQUFPLENBQUNDLFNBQVMsRUFBRSxDQUFjQyxrQkFBa0IsRUFBRSxDQUFDQyxrQkFBa0I7UUFDakgsSUFBSUosbUJBQW1CLEVBQUU7VUFDeEJaLFFBQVEsR0FBSSxHQUFFWSxtQkFBbUIsQ0FBQ0ssUUFBUSxFQUFHLElBQUdSLGNBQWUsS0FBSUYsV0FBWSxPQUFNSixrQkFBbUIsRUFBQztRQUMxRyxDQUFDLE1BQU07VUFDTkgsUUFBUSxHQUFJLEdBQUVTLGNBQWUsS0FBSUYsV0FBWSxPQUFNSixrQkFBbUIsRUFBQztRQUN4RTtNQUNELENBQUMsTUFBTTtRQUNORixnQkFBZ0IsR0FBR2YsV0FBVyxDQUFDbUIsUUFBUSxHQUFHSixnQkFBZ0IsR0FBR2QsYUFBYSxDQUFDZSxPQUFPLENBQUMsc0JBQXNCLENBQUM7UUFDMUdGLFFBQVEsR0FBSSxHQUFFTyxXQUFZLE9BQU1KLGtCQUFtQixFQUFDO01BQ3JEO01BQ0EsSUFBSVosaUJBQWlCLEVBQUU7UUFDdEJTLFFBQVEsR0FBSSxHQUFFSSx1QkFBd0IsT0FBTUosUUFBUyxFQUFDO01BQ3ZEO01BQ0FrQixVQUFVLENBQUNDLE9BQU8sQ0FBQ25CLFFBQVEsRUFBRTtRQUM1Qm9CLEtBQUssRUFBRWpDLGFBQWEsQ0FBQ2UsT0FBTyxDQUFDLFNBQVMsQ0FBQztRQUN2Q21CLE9BQU8sRUFBRSxDQUFDMUIsV0FBVyxFQUFFTSxnQkFBZ0IsQ0FBQztRQUN4Q3FCLGdCQUFnQixFQUFFM0IsV0FBVztRQUM3QjRCLE9BQU8sRUFBRSxVQUFVQyxPQUFlLEVBQUU7VUFDbkMsSUFBSUEsT0FBTyxLQUFLN0IsV0FBVyxFQUFFO1lBQzVCLElBQUlELGVBQWUsRUFBRTtjQUNwQjtjQUNBRixPQUFPLENBQUUsSUFBSSxDQUFDO2NBQ2RLLE1BQU0sQ0FBQzRCLFdBQVcsQ0FBQ2hDLFFBQVEsQ0FBRTtjQUM3QixJQUFJUCxXQUFXLENBQUN3QyxrQkFBa0IsRUFBRTtnQkFDbkN4QyxXQUFXLENBQUN3QyxrQkFBa0IsRUFBRTtjQUNqQztZQUNELENBQUMsTUFBTSxJQUFJLENBQUNuQyxpQkFBaUIsRUFBRTtjQUM5QjtjQUNBUSxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsQ0FBQ1AsT0FBTyxDQUFDLElBQUksQ0FBQztjQUN2Q0ssTUFBTSxDQUFDNEIsV0FBVyxDQUFDMUIsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUM0QixPQUFPLENBQUM7Y0FDckQsSUFBSTVCLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDMkIsa0JBQWtCLEVBQUU7Z0JBQ2pEM0Isc0JBQXNCLENBQUMsQ0FBQyxDQUFDLENBQUMyQixrQkFBa0IsRUFBRTtjQUMvQztZQUNELENBQUMsTUFBTTtjQUNOM0Isc0JBQXNCLENBQUM2QixPQUFPLENBQUMsVUFBVUMsU0FBZ0MsRUFBRTtnQkFDMUVBLFNBQVMsQ0FBQ3JDLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQ3ZCSyxNQUFNLENBQUM0QixXQUFXLENBQUNJLFNBQVMsQ0FBQ0YsT0FBTyxDQUFDO2dCQUNyQyxJQUFJRSxTQUFTLENBQUNILGtCQUFrQixFQUFFO2tCQUNqQ0csU0FBUyxDQUFDSCxrQkFBa0IsRUFBRTtnQkFDL0I7Y0FDRCxDQUFDLENBQUM7Y0FDRixNQUFNSSxtQkFBbUIsR0FBR3hDLHVCQUF1QixhQUF2QkEsdUJBQXVCLHVCQUF2QkEsdUJBQXVCLENBQUV5Qyw2QkFBNkI7Y0FDbEYsSUFBSUQsbUJBQW1CLENBQUN4QixNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUNuQ2xCLGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFNEMsd0JBQXdCLEVBQUU7Y0FDM0M7WUFDRDtZQUNBLElBQUkxQyx1QkFBdUIsRUFBRTtjQUM1QkEsdUJBQXVCLENBQUMyQyxhQUFhLEdBQUcsSUFBSTtZQUM3QztVQUNELENBQUMsTUFBTTtZQUNOLElBQUkzQyx1QkFBdUIsRUFBRTtjQUM1QkEsdUJBQXVCLENBQUMyQyxhQUFhLEdBQUcsS0FBSztZQUM5QztZQUNBLElBQUl2QyxlQUFlLEVBQUU7Y0FDcEJGLE9BQU8sQ0FBRSxLQUFLLENBQUM7WUFDaEIsQ0FBQyxNQUFNLElBQUksQ0FBQ0QsaUJBQWlCLEVBQUU7Y0FDOUJRLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxDQUFDUCxPQUFPLENBQUMsS0FBSyxDQUFDO1lBQ3pDLENBQUMsTUFBTTtjQUNOTyxzQkFBc0IsQ0FBQzZCLE9BQU8sQ0FBQyxVQUFVQyxTQUFnQyxFQUFFO2dCQUMxRUEsU0FBUyxDQUFDckMsT0FBTyxDQUFDLEtBQUssQ0FBQztjQUN6QixDQUFDLENBQUM7WUFDSDtZQUNBLElBQUlOLFdBQVcsQ0FBQ21CLFFBQVEsRUFBRTtjQUN6QmEsVUFBVSxDQUFDZ0IsV0FBVyxDQUFDL0MsYUFBYSxDQUFDZSxPQUFPLENBQUMsNkJBQTZCLENBQUMsRUFBRTtnQkFDNUVpQyxZQUFZLEVBQUU7Y0FDZixDQUFDLENBQVc7WUFDYjtVQUNEO1VBQ0EsSUFBSTdDLHVCQUF1QixFQUFFO1lBQzVCQSx1QkFBdUIsQ0FBQzhDLDZCQUE2QixHQUFHLEVBQUU7VUFDM0Q7UUFDRDtNQUNELENBQUMsQ0FBQztJQUNILENBQUMsTUFBTSxJQUFJL0MsU0FBUyxDQUFDaUIsTUFBTSxHQUFHLENBQUMsRUFBRTtNQUNoQyxJQUFJZixpQkFBaUIsRUFBRTtRQUN0QlUsZ0JBQWdCLEdBQUdmLFdBQVcsQ0FBQ21CLFFBQVEsR0FBR0osZ0JBQWdCLEdBQUdkLGFBQWEsQ0FBQ2UsT0FBTyxDQUFDLHNCQUFzQixDQUFDO1FBQzFHLE1BQU1tQyxlQUFlLEdBQUduRCxXQUFXLENBQUNtQixRQUFRLEdBQ3pDbEIsYUFBYSxDQUFDZSxPQUFPLENBQUMseUNBQXlDLENBQUMsR0FDaEVmLGFBQWEsQ0FBQ2UsT0FBTyxDQUFDLHVDQUF1QyxDQUFDO1FBQ2pFLE1BQU1vQyxZQUFZLEdBQUdwRCxXQUFXLENBQUNtQixRQUFRLEdBQ3RDbEIsYUFBYSxDQUFDZSxPQUFPLENBQUMsc0NBQXNDLEVBQUUsQ0FBQ1AsV0FBVyxDQUFDLENBQUMsR0FDNUVSLGFBQWEsQ0FBQ2UsT0FBTyxDQUFDLG9DQUFvQyxFQUFFLENBQUNQLFdBQVcsQ0FBQyxDQUFDO1FBQzdFLE1BQU00QyxjQUFjLEdBQUcsSUFBSUMsT0FBTyxDQUFDO1VBQ2xDQyxPQUFPLEVBQUVKLGVBQWU7VUFDeEJLLElBQUksRUFBRUMsV0FBVyxDQUFDQyxPQUFPO1VBQ3pCQyxNQUFNLEVBQUVsQyxTQUFTO1VBQ2pCbUMsVUFBVSxFQUFFLElBQUk7VUFDaEJDLFdBQVcsRUFBRVQ7UUFDZCxDQUFDLENBQUM7UUFDRmpELFNBQVMsR0FBRyxDQUFDa0QsY0FBYyxDQUFDLENBQUNTLE1BQU0sQ0FBQzNELFNBQVMsQ0FBQztNQUMvQztNQUNBLE1BQU00RCxtQkFBbUIsR0FBRyxJQUFJQyxTQUFTLEVBQUU7TUFDM0NELG1CQUFtQixDQUFDRSxPQUFPLENBQUM5RCxTQUFTLENBQUM7TUFDdEMsTUFBTStELG1CQUFtQixHQUFHLElBQUk7TUFDaEMsTUFBTUMsY0FBYyxHQUFHQyxlQUFlLENBQUNDLDJCQUEyQixDQUFDTixtQkFBbUIsRUFBRUcsbUJBQW1CLEVBQUU3RCxpQkFBaUIsQ0FBQztNQUMvSCxNQUFNaUUsZ0JBQWdCLEdBQUcsSUFBSUMscUJBQXFCLENBQUM7UUFDbERDLGFBQWEsRUFBRUwsY0FBYztRQUM3QjlELGlCQUFpQixFQUFFQSxpQkFBaUI7UUFDcENvRSxTQUFTLEVBQUV6RSxXQUFXLGFBQVhBLFdBQVcsdUJBQVhBLFdBQVcsQ0FBRW1CLFFBQVE7UUFDaENiLE9BQU8sRUFBRUEsT0FBTztRQUNoQk0sS0FBSyxFQUFFRCxNQUFNO1FBQ2I4QixPQUFPLEVBQUVsQyxRQUFRO1FBQ2pCbUUsVUFBVSxFQUFFakUsV0FBVztRQUN2QkwsdUJBQXVCLEVBQUVBLHVCQUF1QjtRQUNoRFMsc0JBQXNCLEVBQUVBLHNCQUFzQjtRQUM5Q1gsY0FBYyxFQUFFQSxjQUFjO1FBQzlCeUUsa0JBQWtCLEVBQUVaLG1CQUFtQjtRQUN2Q2EsZUFBZSxFQUFFN0QsZ0JBQWdCO1FBQ2pDOEQsZUFBZSxFQUFFLFNBQVNBLGVBQWUsR0FBRztVQUMzQzdDLFVBQVUsQ0FBQ2dCLFdBQVcsQ0FBQy9DLGFBQWEsQ0FBQ2UsT0FBTyxDQUFDLDZCQUE2QixDQUFDLEVBQUU7WUFDNUVpQyxZQUFZLEVBQUU7VUFDZixDQUFDLENBQVc7UUFDYjtNQUNELENBQUMsQ0FBQztNQUNGcUIsZ0JBQWdCLENBQUNRLElBQUksRUFBRTtJQUN4QjtFQUNEO0VBRUEsZUFBZUMsd0JBQXdCLENBQ3RDeEUsUUFBZ0IsRUFDaEJQLFdBQXFDLEVBQ3JDQyxhQUE0QixFQUM1QitFLG1CQUFrQyxFQUNsQ0MsUUFBd0IsRUFDeEJDLGNBQTZCLEVBQzdCaEYsY0FBMEMsRUFDMUNFLHVCQUFnRCxFQUNoRCtFLFlBQXVCLEVBQ3RCO0lBQ0QsSUFBSUMsZUFBa0Q7SUFFdEQsSUFBS0osbUJBQW1CLEtBQUssSUFBSSxJQUFJRSxjQUFjLEtBQUssSUFBSSxJQUFNRixtQkFBbUIsS0FBSyxDQUFDLElBQUlFLGNBQWMsS0FBSyxDQUFFLEVBQUU7TUFDckgsT0FBTyxJQUFJRyxPQUFPLENBQUMsVUFBVS9FLE9BQU8sRUFBRTtRQUNyQ2dGLGdCQUFnQixDQUFDdkYsaUJBQWlCLENBQ2pDQyxXQUFXLEVBQ1hDLGFBQWEsRUFDYkMsY0FBYyxFQUNkaUYsWUFBWSxFQUNaL0UsdUJBQXVCLEVBQ3ZCLEtBQUssRUFDTEUsT0FBTyxFQUNQQyxRQUFRLEVBQ1IsSUFBSSxDQUNKO01BQ0YsQ0FBQyxDQUFDO0lBQ0g7SUFFQSxJQUFJNEUsWUFBWSxDQUFDL0QsTUFBTSxFQUFFO01BQUE7TUFDeEIsTUFBTW1FLHFCQUFxQixHQUFHLElBQUlGLE9BQU8sQ0FBQyxVQUFVL0UsT0FBTyxFQUFFO1FBQzVEOEUsZUFBZSxHQUFHO1VBQ2pCNUMsa0JBQWtCLEVBQUV4QyxXQUFXLENBQUN3QyxrQkFBa0I7VUFDbERsQyxPQUFPLEVBQUVBLE9BQU87VUFDaEJtQyxPQUFPLEVBQUVsQztRQUNWLENBQUM7TUFDRixDQUFDLENBQUM7TUFFRkgsdUJBQXVCLENBQUNTLHNCQUFzQixDQUFDMkUsSUFBSSxDQUFDSixlQUFlLENBQTBCO01BQzdGO01BQ0EsTUFBTUssOEJBQXlDLEdBQUdyRix1QkFBdUIsQ0FBQzhDLDZCQUE2QjtNQUN2RyxNQUFNd0MsT0FBTywyQkFBSTFGLFdBQVcsQ0FBQzJCLE9BQU8sa0ZBQW5CLHFCQUFxQkMsU0FBUyxFQUFFLDBEQUFqQyxzQkFBZ0QrRCxtQkFBbUIsRUFBRTtNQUNyRixJQUFJQyxNQUFNLEdBQUcsRUFBRTtNQUNmLElBQUlGLE9BQU8sSUFBSVIsY0FBYyxJQUFJQSxjQUFjLEdBQUcsQ0FBQyxFQUFFO1FBQ3BEVSxNQUFNLEdBQUdYLFFBQVEsSUFBSUEsUUFBUSxDQUFDWSxTQUFTLENBQUNILE9BQU8sQ0FBQztNQUNqRDs7TUFFQTtNQUNBUCxZQUFZLENBQUN6QyxPQUFPLENBQUMsVUFBVW9ELEdBQVksRUFBRTtRQUM1Q0EsR0FBRyxDQUFDQyxPQUFPLENBQUMsU0FBUyxDQUFDO1FBQ3RCRCxHQUFHLENBQUNFLGlCQUFpQixDQUFDSixNQUFNLENBQUM7UUFDN0JILDhCQUE4QixDQUFDRCxJQUFJLENBQUNNLEdBQUcsQ0FBQztNQUN6QyxDQUFDLENBQUM7TUFFRjFGLHVCQUF1QixDQUFDOEMsNkJBQTZCLEdBQUd1Qyw4QkFBOEI7TUFDdEZ6RixXQUFXLENBQUNpRyxnQ0FBZ0MsRUFBRTtNQUM5QyxPQUFPVixxQkFBcUI7SUFDN0I7RUFDRDtFQUVBLE1BQU1ELGdCQUFrQyxHQUFHO0lBQzFDdkYsaUJBQWlCLEVBQUVBLGlCQUFpQjtJQUNwQ2dGLHdCQUF3QixFQUFFQTtFQUMzQixDQUFDO0VBQUMsT0FFYU8sZ0JBQWdCO0FBQUEifQ==
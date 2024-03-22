/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ResourceModelHelper", "sap/m/Bar", "sap/m/Button", "sap/m/Dialog", "sap/m/FormattedText", "sap/m/MessageBox", "sap/m/MessageItem", "sap/m/MessageToast", "sap/m/MessageView", "sap/m/Text", "sap/ui/core/Core", "sap/ui/core/format/DateFormat", "sap/ui/core/IconPool", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel", "sap/ui/model/Sorter"], function (ResourceModelHelper, Bar, Button, Dialog, FormattedText, MessageBox, MessageItem, MessageToast, MessageView, Text, Core, DateFormat, IconPool, CoreLib, Message, Filter, FilterOperator, JSONModel, Sorter) {
  "use strict";

  var getResourceModel = ResourceModelHelper.getResourceModel;
  const MessageType = CoreLib.MessageType;
  let aMessageList = [];
  let aMessageDataList = [];
  let aResolveFunctions = [];
  let oDialog;
  let oBackButton;
  let oMessageView;
  function fnFormatTechnicalDetails() {
    let sPreviousGroupName;

    // Insert technical detail if it exists
    function insertDetail(oProperty) {
      return oProperty.property ? "( ${" + oProperty.property + '} ? ("<p>' + oProperty.property.substr(Math.max(oProperty.property.lastIndexOf("/"), oProperty.property.lastIndexOf(".")) + 1) + ' : " + ' + "${" + oProperty.property + '} + "</p>") : "" )' : "";
    }
    // Insert groupname if it exists
    function insertGroupName(oProperty) {
      let sHTML = "";
      if (oProperty.groupName && oProperty.property && oProperty.groupName !== sPreviousGroupName) {
        sHTML += "( ${" + oProperty.property + '} ? "<br><h3>' + oProperty.groupName + '</h3>" : "" ) + ';
        sPreviousGroupName = oProperty.groupName;
      }
      return sHTML;
    }

    // List of technical details to be shown
    function getPaths() {
      const sTD = "technicalDetails"; // name of property in message model data for technical details
      return [{
        groupName: "",
        property: `${sTD}/status`
      }, {
        groupName: "",
        property: `${sTD}/statusText`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ComponentId`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ServiceId`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ServiceRepository`
      }, {
        groupName: "Application",
        property: `${sTD}/error/@SAP__common.Application/ServiceVersion`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ErrorResolution/Analysis`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ErrorResolution/Note`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ErrorResolution/DetailedNote`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.ExceptionCategory`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.TimeStamp`
      }, {
        groupName: "ErrorResolution",
        property: `${sTD}/error/@SAP__common.TransactionId`
      }, {
        groupName: "Messages",
        property: `${sTD}/error/code`
      }, {
        groupName: "Messages",
        property: `${sTD}/error/message`
      }];
    }
    let sHTML = "Object.keys(" + "${technicalDetails}" + ').length > 0 ? "<h2>Technical Details</h2>" : "" ';
    getPaths().forEach(function (oProperty) {
      sHTML = `${sHTML + insertGroupName(oProperty)}${insertDetail(oProperty)} + `;
    });
    return sHTML;
  }
  function fnFormatDescription() {
    return "(${" + 'description} ? (${' + 'description}) : "")';
  }
  /**
   * Calculates the highest priority message type(Error/Warning/Success/Information) from the available messages.
   *
   * @function
   * @name sap.fe.core.actions.messageHandling.fnGetHighestMessagePriority
   * @memberof sap.fe.core.actions.messageHandling
   * @param [aMessages] Messages list
   * @returns Highest priority message from the available messages
   * @private
   * @ui5-restricted
   */
  function fnGetHighestMessagePriority(aMessages) {
    let sMessagePriority = MessageType.None;
    const iLength = aMessages.length;
    const oMessageCount = {
      Error: 0,
      Warning: 0,
      Success: 0,
      Information: 0
    };
    for (let i = 0; i < iLength; i++) {
      ++oMessageCount[aMessages[i].getType()];
    }
    if (oMessageCount[MessageType.Error] > 0) {
      sMessagePriority = MessageType.Error;
    } else if (oMessageCount[MessageType.Warning] > 0) {
      sMessagePriority = MessageType.Warning;
    } else if (oMessageCount[MessageType.Success] > 0) {
      sMessagePriority = MessageType.Success;
    } else if (oMessageCount[MessageType.Information] > 0) {
      sMessagePriority = MessageType.Information;
    }
    return sMessagePriority;
  }
  // function which modify e-Tag messages only.
  // returns : true, if any e-Tag message is modified, otherwise false.
  function fnModifyETagMessagesOnly(oMessageManager, oResourceBundle, concurrentEditFlag) {
    const aMessages = oMessageManager.getMessageModel().getObject("/");
    let bMessagesModified = false;
    let sEtagMessage = "";
    aMessages.forEach(function (oMessage, i) {
      const oTechnicalDetails = oMessage.getTechnicalDetails && oMessage.getTechnicalDetails();
      if (oTechnicalDetails && oTechnicalDetails.httpStatus === 412 && oTechnicalDetails.isConcurrentModification) {
        if (concurrentEditFlag) {
          sEtagMessage = sEtagMessage || oResourceBundle.getText("C_APP_COMPONENT_SAPFE_ETAG_TECHNICAL_ISSUES_CONCURRENT_MODIFICATION");
        } else {
          sEtagMessage = sEtagMessage || oResourceBundle.getText("C_APP_COMPONENT_SAPFE_ETAG_TECHNICAL_ISSUES");
        }
        oMessageManager.removeMessages(aMessages[i]);
        oMessage.setMessage(sEtagMessage);
        oMessage.target = "";
        oMessageManager.addMessages(oMessage);
        bMessagesModified = true;
      }
    });
    return bMessagesModified;
  }
  // Dialog close Handling
  function dialogCloseHandler() {
    oDialog.close();
    oBackButton.setVisible(false);
    aMessageList = [];
    const oMessageDialogModel = oMessageView.getModel();
    if (oMessageDialogModel) {
      oMessageDialogModel.setData({});
    }
    removeUnboundTransitionMessages();
  }
  function getRetryAfterMessage(oMessage, bMessageDialog) {
    const dNow = new Date();
    const oTechnicalDetails = oMessage.getTechnicalDetails();
    const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    let sRetryAfterMessage;
    if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503 && oTechnicalDetails.retryAfter) {
      const dRetryAfter = oTechnicalDetails.retryAfter;
      let oDateFormat;
      if (dNow.getFullYear() !== dRetryAfter.getFullYear()) {
        //different years
        oDateFormat = DateFormat.getDateTimeInstance({
          pattern: "MMMM dd, yyyy 'at' hh:mm a"
        });
        sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR", [oDateFormat.format(dRetryAfter)]);
      } else if (dNow.getFullYear() == dRetryAfter.getFullYear()) {
        //same year
        if (bMessageDialog) {
          //less than 2 min
          sRetryAfterMessage = `${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE")} ${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_DESC")}`;
        } else if (dNow.getMonth() !== dRetryAfter.getMonth() || dNow.getDate() !== dRetryAfter.getDate()) {
          oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "MMMM dd 'at' hh:mm a"
          }); //different months or different days of same month
          sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR", [oDateFormat.format(dRetryAfter)]);
        } else {
          //same day
          oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "hh:mm a"
          });
          sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR_DAY", [oDateFormat.format(dRetryAfter)]);
        }
      }
    }
    if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503 && !oTechnicalDetails.retryAfter) {
      sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR_NO_RETRY_AFTER");
    }
    return sRetryAfterMessage;
  }
  function prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow, multi412) {
    let oMessageTemplate;
    if (!bStrictHandlingFlow) {
      const descriptionBinding = '{= ${description} ? "<html><body>" + ' + fnFormatDescription() + ' + "</html></body>" : "" }';
      const technicalDetailsBinding = '{= ${technicalDetails} ? "<html><body>" + ' + fnFormatTechnicalDetails() + ' + "</html></body>" : "" }';
      oMessageTemplate = new MessageItem(undefined, {
        counter: {
          path: "counter"
        },
        title: "{message}",
        subtitle: "{additionalText}",
        longtextUrl: "{descriptionUrl}",
        type: {
          path: "type"
        },
        groupName: "{headerName}",
        description: descriptionBinding + technicalDetailsBinding,
        markupDescription: true
      });
    } else if (multi412) {
      oMessageTemplate = new MessageItem(undefined, {
        counter: {
          path: "counter"
        },
        title: "{message}",
        subtitle: "{additionalText}",
        longtextUrl: "{descriptionUrl}",
        type: {
          path: "type"
        },
        description: "{description}",
        markupDescription: true
      });
    } else {
      oMessageTemplate = new MessageItem({
        title: "{message}",
        type: {
          path: "type"
        },
        longtextUrl: "{descriptionUrl}"
      });
    }
    oMessageView = new MessageView({
      showDetailsPageHeader: false,
      itemSelect: function () {
        oBackButton.setVisible(true);
      },
      items: {
        path: "/",
        template: oMessageTemplate
      }
    });
    oMessageView.setGroupItems(true);
    oBackButton = oBackButton || new Button({
      icon: IconPool.getIconURI("nav-back"),
      visible: false,
      press: function () {
        oMessageView.navigateBack();
        this.setVisible(false);
      }
    });
    // Update proper ETag Mismatch error
    oMessageView.setModel(oMessageDialogModel);
    return {
      oMessageView,
      oBackButton
    };
  }
  function showUnboundMessages(aCustomMessages, oContext, bShowBoundTransition, concurrentEditFlag, control, sActionName, bOnlyForTest, onBeforeShowMessage, viewType) {
    let aTransitionMessages = this.getMessages();
    const oMessageManager = Core.getMessageManager();
    let sHighestPriority;
    let sHighestPriorityText;
    const aFilters = [new Filter({
      path: "persistent",
      operator: FilterOperator.NE,
      value1: false
    })];
    let showMessageDialog = false,
      showMessageBox = false;
    if (bShowBoundTransition) {
      aTransitionMessages = aTransitionMessages.concat(getMessages(true, true));
      // we only want to show bound transition messages not bound state messages hence add a filter for the same
      aFilters.push(new Filter({
        path: "persistent",
        operator: FilterOperator.EQ,
        value1: true
      }));
      const fnCheckControlIdInDialog = function (aControlIds) {
        let index = Infinity,
          oControl = Core.byId(aControlIds[0]);
        const errorFieldControl = Core.byId(aControlIds[0]);
        while (oControl) {
          const fieldRankinDialog = oControl instanceof Dialog ? errorFieldControl.getParent().findElements(true).indexOf(errorFieldControl) : Infinity;
          if (oControl instanceof Dialog) {
            if (index > fieldRankinDialog) {
              index = fieldRankinDialog;
              // Set the focus to the dialog's control
              errorFieldControl.focus();
            }
            // messages with target inside sap.m.Dialog should not bring up the message dialog
            return false;
          }
          oControl = oControl.getParent();
        }
        return true;
      };
      aFilters.push(new Filter({
        path: "controlIds",
        test: fnCheckControlIdInDialog,
        caseSensitive: true
      }));
    } else {
      // only unbound messages have to be shown so add filter accordingly
      aFilters.push(new Filter({
        path: "target",
        operator: FilterOperator.EQ,
        value1: ""
      }));
    }
    if (aCustomMessages && aCustomMessages.length) {
      aCustomMessages.forEach(function (oMessage) {
        const messageCode = oMessage.code ? oMessage.code : "";
        oMessageManager.addMessages(new Message({
          message: oMessage.text,
          type: oMessage.type,
          target: "",
          persistent: true,
          code: messageCode
        }));
        //The target and persistent properties of the message are hardcoded as "" and true because the function deals with only unbound messages.
      });
    }

    const oMessageDialogModel = oMessageView && oMessageView.getModel() || new JSONModel();
    const bHasEtagMessage = this.modifyETagMessagesOnly(oMessageManager, Core.getLibraryResourceBundle("sap.fe.core"), concurrentEditFlag);
    if (aTransitionMessages.length === 1 && aTransitionMessages[0].getCode() === "503") {
      showMessageBox = true;
    } else if (aTransitionMessages.length !== 0) {
      showMessageDialog = true;
    }
    let showMessageParameters;
    let aModelDataArray = [];
    if (showMessageDialog || !showMessageBox && !onBeforeShowMessage) {
      const oListBinding = oMessageManager.getMessageModel().bindList("/", undefined, undefined, aFilters),
        aCurrentContexts = oListBinding.getCurrentContexts();
      if (aCurrentContexts && aCurrentContexts.length > 0) {
        showMessageDialog = true;
        // Don't show dialog incase there are no errors to show

        // if false, show messages in dialog
        // As fitering has already happened here hence
        // using the message model again for the message dialog view and then filtering on that binding again is unnecessary.
        // So we create new json model to use for the message dialog view.
        const aMessages = [];
        aCurrentContexts.forEach(function (currentContext) {
          const oMessage = currentContext.getObject();
          aMessages.push(oMessage);
          aMessageDataList = aMessages;
        });
        let existingMessages = [];
        if (Array.isArray(oMessageDialogModel.getData())) {
          existingMessages = oMessageDialogModel.getData();
        }
        const oUniqueObj = {};
        aModelDataArray = aMessageDataList.concat(existingMessages).filter(function (obj) {
          // remove entries having duplicate message ids
          return !oUniqueObj[obj.id] && (oUniqueObj[obj.id] = true);
        });
        oMessageDialogModel.setData(aModelDataArray);
      }
    }
    if (onBeforeShowMessage) {
      showMessageParameters = {
        showMessageBox,
        showMessageDialog
      };
      showMessageParameters = onBeforeShowMessage(aTransitionMessages, showMessageParameters);
      showMessageBox = showMessageParameters.showMessageBox;
      showMessageDialog = showMessageParameters.showMessageDialog;
      if (showMessageDialog || showMessageParameters.showChangeSetErrorDialog) {
        aModelDataArray = showMessageParameters.filteredMessages ? showMessageParameters.filteredMessages : aModelDataArray;
      }
    }
    if (aTransitionMessages.length === 0 && !aCustomMessages && !bHasEtagMessage) {
      // Don't show the popup if there are no transient messages
      return Promise.resolve(true);
    } else if (aTransitionMessages.length === 1 && aTransitionMessages[0].getType() === MessageType.Success && !aCustomMessages) {
      return new Promise(resolve => {
        MessageToast.show(aTransitionMessages[0].message);
        if (oMessageDialogModel) {
          oMessageDialogModel.setData({});
        }
        oMessageManager.removeMessages(aTransitionMessages);
        resolve();
      });
    } else if (showMessageDialog) {
      messageHandling.updateMessageObjectGroupName(aModelDataArray, control, sActionName, viewType);
      oMessageDialogModel.setData(aModelDataArray); // set the messages here so that if any of them are filtered for APD, they are filtered here as well.
      aResolveFunctions = aResolveFunctions || [];
      return new Promise(function (resolve, reject) {
        aResolveFunctions.push(resolve);
        Core.getLibraryResourceBundle("sap.fe.core", true).then(function (oResourceBundle) {
          const bStrictHandlingFlow = false;
          if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
            oMessageDialogModel.getData().forEach(function (oMessage) {
              showMessageParameters.fnGetMessageSubtitle(oMessage);
            });
          }
          const oMessageObject = prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow);
          const oSorter = new Sorter("", undefined, undefined, (obj1, obj2) => {
            const rankA = getMessageRank(obj1);
            const rankB = getMessageRank(obj2);
            if (rankA < rankB) {
              return -1;
            }
            if (rankA > rankB) {
              return 1;
            }
            return 0;
          });
          oMessageObject.oMessageView.getBinding("items").sort(oSorter);
          oDialog = oDialog && oDialog.isOpen() ? oDialog : new Dialog({
            resizable: true,
            endButton: new Button({
              press: function () {
                dialogCloseHandler();
                // also remove bound transition messages if we were showing them
                oMessageManager.removeMessages(aModelDataArray);
              },
              text: oResourceBundle.getText("C_COMMON_SAPFE_CLOSE")
            }),
            customHeader: new Bar({
              contentMiddle: [new Text({
                text: oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE")
              })],
              contentLeft: [oBackButton]
            }),
            contentWidth: "37.5em",
            contentHeight: "21.5em",
            verticalScrolling: false,
            afterClose: function () {
              for (let i = 0; i < aResolveFunctions.length; i++) {
                aResolveFunctions[i].call();
              }
              aResolveFunctions = [];
            }
          });
          oDialog.removeAllContent();
          oDialog.addContent(oMessageObject.oMessageView);
          if (bHasEtagMessage) {
            sap.ui.require(["sap/m/ButtonType"], function (ButtonType) {
              oDialog.setBeginButton(new Button({
                press: function () {
                  dialogCloseHandler();
                  if (oContext.hasPendingChanges()) {
                    oContext.getBinding().resetChanges();
                  }
                  oContext.refresh();
                },
                text: oResourceBundle.getText("C_COMMON_SAPFE_REFRESH"),
                type: ButtonType.Emphasized
              }));
            });
          } else {
            oDialog.destroyBeginButton();
          }
          sHighestPriority = fnGetHighestMessagePriority(oMessageView.getItems());
          sHighestPriorityText = getTranslatedTextForMessageDialog(sHighestPriority);
          oDialog.setState(sHighestPriority);
          oDialog.getCustomHeader().getContentMiddle()[0].setText(sHighestPriorityText);
          oMessageView.navigateBack();
          oDialog.open();
          if (bOnlyForTest) {
            resolve(oDialog);
          }
        }).catch(reject);
      });
    } else if (showMessageBox) {
      return new Promise(function (resolve) {
        const oMessage = aTransitionMessages[0];
        if (oMessage.technicalDetails && aMessageList.indexOf(oMessage.technicalDetails.originalMessage.message) === -1 || showMessageParameters && showMessageParameters.showChangeSetErrorDialog) {
          if (!showMessageParameters || !showMessageParameters.showChangeSetErrorDialog) {
            aMessageList.push(oMessage.technicalDetails.originalMessage.message);
          }
          let formattedTextString = "<html><body>";
          const retryAfterMessage = getRetryAfterMessage(oMessage, true);
          if (retryAfterMessage) {
            formattedTextString = `<h6>${retryAfterMessage}</h6><br>`;
          }
          if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
            showMessageParameters.fnGetMessageSubtitle(oMessage);
          }
          if (oMessage.getCode() !== "503" && oMessage.getAdditionalText() !== undefined) {
            formattedTextString = `${formattedTextString + oMessage.getAdditionalText()}: ${oMessage.getMessage()}</html></body>`;
          } else {
            formattedTextString = `${formattedTextString + oMessage.getMessage()}</html></body>`;
          }
          const formattedText = new FormattedText({
            htmlText: formattedTextString
          });
          MessageBox.error(formattedText, {
            onClose: function () {
              aMessageList = [];
              if (bShowBoundTransition) {
                removeBoundTransitionMessages();
              }
              removeUnboundTransitionMessages();
              resolve(true);
            }
          });
        }
      });
    } else {
      return Promise.resolve(true);
    }
  }

  /**
   * This function sets the group name for all messages in a dialog.
   *
   * @param aModelDataArray Messages array
   * @param control
   * @param sActionName
   * @param viewType
   */
  function updateMessageObjectGroupName(aModelDataArray, control, sActionName, viewType) {
    aModelDataArray.forEach(aModelData => {
      var _aModelData$target, _aModelData$getCode, _aModelData$target2;
      aModelData["headerName"] = "";
      if (!((_aModelData$target = aModelData.target) !== null && _aModelData$target !== void 0 && _aModelData$target.length) && ((_aModelData$getCode = aModelData.getCode) === null || _aModelData$getCode === void 0 ? void 0 : _aModelData$getCode.call(aModelData)) !== "FE_CUSTOM_MESSAGE_CHANGESET_ALL_FAILED") {
        // unbound transiiton messages
        aModelData["headerName"] = "General";
      } else if ((_aModelData$target2 = aModelData.target) !== null && _aModelData$target2 !== void 0 && _aModelData$target2.length) {
        // LR flow
        if (viewType === "ListReport") {
          messageHandling.setGroupNameLRTable(control, aModelData, sActionName);
        } else if (viewType === "ObjectPage") {
          // OP Display mode
          messageHandling.setGroupNameOPDisplayMode(aModelData, sActionName, control);
        } else {
          aModelData["headerName"] = messageHandling.getLastActionTextAndActionName(sActionName);
        }
      }
    });
  }

  /**
   * This function will set the group name of Message Object for LR table.
   *
   * @param oElem
   * @param aModelData
   * @param sActionName
   */
  function setGroupNameLRTable(oElem, aModelData, sActionName) {
    const oRowBinding = oElem && oElem.getRowBinding();
    if (oRowBinding) {
      var _aModelData$target3;
      const sElemeBindingPath = `${oElem.getRowBinding().getPath()}`;
      if (((_aModelData$target3 = aModelData.target) === null || _aModelData$target3 === void 0 ? void 0 : _aModelData$target3.indexOf(sElemeBindingPath)) === 0) {
        const allRowContexts = oRowBinding.getCurrentContexts();
        allRowContexts.forEach(rowContext => {
          var _aModelData$target4;
          if ((_aModelData$target4 = aModelData.target) !== null && _aModelData$target4 !== void 0 && _aModelData$target4.includes(rowContext.getPath())) {
            const contextPath = `${rowContext.getPath()}/`;
            const identifierColumn = oElem.getParent().getIdentifierColumn();
            const rowIdentifier = identifierColumn && rowContext.getObject()[identifierColumn];
            const columnPropertyName = messageHandling.getTableColProperty(oElem, aModelData, contextPath);
            const {
              sTableTargetColName
            } = messageHandling.getTableColInfo(oElem, columnPropertyName);

            // if target has some column name and column is visible in UI
            if (columnPropertyName && sTableTargetColName) {
              // header will be row Identifier, if found from above code otherwise it should be table name
              aModelData["headerName"] = rowIdentifier ? ` ${rowIdentifier}` : oElem.getHeader();
            } else {
              // if column data not found (may be the column is hidden), add grouping as Last Action
              aModelData["headerName"] = messageHandling.getLastActionTextAndActionName(sActionName);
            }
          }
        });
      }
    }
  }

  /**
   * This function will set the group name of Message Object in OP Display mode.
   *
   * @param aModelData Message Object
   * @param sActionName  Action name
   * @param control
   */
  function setGroupNameOPDisplayMode(aModelData, sActionName, control) {
    const oViewContext = control === null || control === void 0 ? void 0 : control.getBindingContext();
    const opLayout = (control === null || control === void 0 ? void 0 : control.getContent) && (control === null || control === void 0 ? void 0 : control.getContent()[0]);
    let bIsGeneralGroupName = true;
    if (opLayout) {
      messageHandling.getVisibleSectionsFromObjectPageLayout(opLayout).forEach(function (oSection) {
        const subSections = oSection.getSubSections();
        subSections.forEach(function (oSubSection) {
          oSubSection.findElements(true).forEach(function (oElem) {
            if (oElem.isA("sap.ui.mdc.Table")) {
              const oRowBinding = oElem.getRowBinding(),
                setSectionNameInGroup = true;
              let childTableElement;
              oElem.findElements(true).forEach(oElement => {
                if (oElement.isA("sap.m.Table") || oElement.isA("sap.ui.table.Table")) {
                  childTableElement = oElement;
                }
              });
              if (oRowBinding) {
                var _oElem$getRowBinding, _aModelData$target5;
                const sElemeBindingPath = `${oViewContext === null || oViewContext === void 0 ? void 0 : oViewContext.getPath()}/${(_oElem$getRowBinding = oElem.getRowBinding()) === null || _oElem$getRowBinding === void 0 ? void 0 : _oElem$getRowBinding.getPath()}`;
                if (((_aModelData$target5 = aModelData.target) === null || _aModelData$target5 === void 0 ? void 0 : _aModelData$target5.indexOf(sElemeBindingPath)) === 0) {
                  const obj = messageHandling.getTableColumnDataAndSetSubtile(aModelData, oElem, childTableElement, oRowBinding, sActionName, setSectionNameInGroup, fnCallbackSetGroupName);
                  const {
                    oTargetTableInfo
                  } = obj;
                  if (setSectionNameInGroup) {
                    const identifierColumn = oElem.getParent().getIdentifierColumn();
                    if (identifierColumn) {
                      const allRowContexts = oElem.getRowBinding().getContexts();
                      allRowContexts.forEach(rowContext => {
                        var _aModelData$target6;
                        if ((_aModelData$target6 = aModelData.target) !== null && _aModelData$target6 !== void 0 && _aModelData$target6.includes(rowContext.getPath())) {
                          const rowIdentifier = identifierColumn ? rowContext.getObject()[identifierColumn] : undefined;
                          aModelData["additionalText"] = `${rowIdentifier}, ${oTargetTableInfo.sTableTargetColName}`;
                        }
                      });
                    } else {
                      aModelData["additionalText"] = `${oTargetTableInfo.sTableTargetColName}`;
                    }
                    let headerName = oElem.getHeaderVisible() && oTargetTableInfo.tableHeader;
                    if (!headerName) {
                      headerName = oSubSection.getTitle();
                    } else {
                      const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
                      headerName = `${oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${headerName}`;
                    }
                    aModelData["headerName"] = headerName;
                    bIsGeneralGroupName = false;
                  }
                }
              }
            }
          });
        });
      });
    }
    if (bIsGeneralGroupName) {
      var _aModelData$target7;
      const sElemeBindingPath = `${oViewContext === null || oViewContext === void 0 ? void 0 : oViewContext.getPath()}`;
      if (((_aModelData$target7 = aModelData.target) === null || _aModelData$target7 === void 0 ? void 0 : _aModelData$target7.indexOf(sElemeBindingPath)) === 0) {
        // check if OP context path is part of target, set Last Action as group name
        const headerName = messageHandling.getLastActionTextAndActionName(sActionName);
        aModelData["headerName"] = headerName;
      } else {
        aModelData["headerName"] = "General";
      }
    }
  }
  function getLastActionTextAndActionName(sActionName) {
    const sLastActionText = Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_LAST_ACTION");
    return sActionName ? `${sLastActionText}: ${sActionName}` : "";
  }

  /**
   * This function will give rank based on Message Group/Header name, which will be used for Sorting messages in Message dialog
   * Last Action should be shown at top, next Row Id and last General.
   *
   * @param obj
   * @returns Rank of message
   */
  function getMessageRank(obj) {
    var _obj$headerName, _obj$headerName2;
    if ((_obj$headerName = obj.headerName) !== null && _obj$headerName !== void 0 && _obj$headerName.toString().includes("Last Action")) {
      return 1;
    } else if ((_obj$headerName2 = obj.headerName) !== null && _obj$headerName2 !== void 0 && _obj$headerName2.toString().includes("General")) {
      return 3;
    } else {
      return 2;
    }
  }

  /**
   * This function will set the group name which can either General or Last Action.
   *
   * @param aMessage
   * @param sActionName
   * @param bIsGeneralGroupName
   */
  const fnCallbackSetGroupName = (aMessage, sActionName, bIsGeneralGroupName) => {
    if (bIsGeneralGroupName) {
      const sGeneralGroupText = Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_GENERAL");
      aMessage["headerName"] = sGeneralGroupText;
    } else {
      aMessage["headerName"] = messageHandling.getLastActionTextAndActionName(sActionName);
    }
  };

  /**
   * This function will get the table row/column info and set subtitle.
   *
   * @param aMessage
   * @param oTable
   * @param oElement
   * @param oRowBinding
   * @param sActionName
   * @param setSectionNameInGroup
   * @param fnSetGroupName
   * @returns Table info and Subtitle.
   */
  function getTableColumnDataAndSetSubtile(aMessage, oTable, oElement, oRowBinding, sActionName, setSectionNameInGroup, fnSetGroupName) {
    const oTargetTableInfo = messageHandling.getTableAndTargetInfo(oTable, aMessage, oElement, oRowBinding);
    oTargetTableInfo.tableHeader = oTable.getHeader();
    let sControlId, bIsCreationRow;
    if (!oTargetTableInfo.oTableRowContext) {
      sControlId = aMessage.getControlIds().find(function (sId) {
        return messageHandling.isControlInTable(oTable, sId);
      });
    }
    if (sControlId) {
      const oControl = Core.byId(sControlId);
      bIsCreationRow = messageHandling.isControlPartOfCreationRow(oControl);
    }
    if (!oTargetTableInfo.sTableTargetColName) {
      // if the column is not present on UI or the target does not have a table field in it, use Last Action for grouping
      if (aMessage.persistent && sActionName) {
        fnSetGroupName(aMessage, sActionName);
        setSectionNameInGroup = false;
      }
    }
    const subTitle = messageHandling.getMessageSubtitle(aMessage, oTargetTableInfo.oTableRowBindingContexts, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oTable, bIsCreationRow);
    return {
      oTargetTableInfo,
      subTitle
    };
  }

  /**
   * This function will create the subtitle based on Table Row/Column data.
   *
   * @param message
   * @param oTableRowBindingContexts
   * @param oTableRowContext
   * @param sTableTargetColName
   * @param oTable
   * @param bIsCreationRow
   * @param oTargetedControl
   * @returns Message subtitle.
   */
  function getMessageSubtitle(message, oTableRowBindingContexts, oTableRowContext, sTableTargetColName, oTable, bIsCreationRow, oTargetedControl) {
    let sMessageSubtitle;
    let sRowSubtitleValue;
    const resourceModel = getResourceModel(oTable);
    const sTableFirstColProperty = oTable.getParent().getIdentifierColumn();
    const oColFromTableSettings = messageHandling.fetchColumnInfo(message, oTable);
    if (bIsCreationRow) {
      sMessageSubtitle = resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE", [resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE_CREATION_ROW_INDICATOR"), sTableTargetColName ? sTableTargetColName : oColFromTableSettings.label]);
    } else {
      const oTableFirstColBindingContextTextAnnotation = messageHandling.getTableFirstColBindingContextForTextAnnotation(oTable, oTableRowContext, sTableFirstColProperty);
      const sTableFirstColTextAnnotationPath = oTableFirstColBindingContextTextAnnotation ? oTableFirstColBindingContextTextAnnotation.getObject("$Path") : undefined;
      const sTableFirstColTextArrangement = sTableFirstColTextAnnotationPath && oTableFirstColBindingContextTextAnnotation ? oTableFirstColBindingContextTextAnnotation.getObject("@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember") : undefined;
      if (oTableRowBindingContexts.length > 0) {
        // set Row subtitle text
        if (oTargetedControl) {
          // The UI error is on the first column, we then get the control input as the row indicator:
          sRowSubtitleValue = oTargetedControl.getValue();
        } else if (oTableRowContext && sTableFirstColProperty) {
          sRowSubtitleValue = messageHandling.getTableFirstColValue(sTableFirstColProperty, oTableRowContext, sTableFirstColTextAnnotationPath, sTableFirstColTextArrangement);
        } else {
          sRowSubtitleValue = undefined;
        }
        // set the message subtitle
        const oColumnInfo = messageHandling.determineColumnInfo(oColFromTableSettings, resourceModel);
        if (sRowSubtitleValue && sTableTargetColName) {
          sMessageSubtitle = resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE", [sRowSubtitleValue, sTableTargetColName]);
        } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Hidden") {
          sMessageSubtitle = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${sRowSubtitleValue}, ${oColumnInfo.sColumnValue}`;
        } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Unknown") {
          sMessageSubtitle = resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE", [sRowSubtitleValue, oColumnInfo.sColumnValue]);
        } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "undefined") {
          sMessageSubtitle = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${sRowSubtitleValue}`;
        } else if (!sRowSubtitleValue && sTableTargetColName) {
          sMessageSubtitle = resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN") + ": " + sTableTargetColName;
        } else if (!sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Hidden") {
          sMessageSubtitle = oColumnInfo.sColumnValue;
        } else {
          sMessageSubtitle = null;
        }
      } else {
        sMessageSubtitle = null;
      }
    }
    return sMessageSubtitle;
  }

  /**
   * This function will get the first column for text Annotation, this is needed to set subtitle of Message.
   *
   * @param oTable
   * @param oTableRowContext
   * @param sTableFirstColProperty
   * @returns Binding context.
   */
  function getTableFirstColBindingContextForTextAnnotation(oTable, oTableRowContext, sTableFirstColProperty) {
    let oBindingContext;
    if (oTableRowContext && sTableFirstColProperty) {
      const oModel = oTable === null || oTable === void 0 ? void 0 : oTable.getModel();
      const oMetaModel = oModel === null || oModel === void 0 ? void 0 : oModel.getMetaModel();
      const sMetaPath = oMetaModel === null || oMetaModel === void 0 ? void 0 : oMetaModel.getMetaPath(oTableRowContext.getPath());
      if (oMetaModel !== null && oMetaModel !== void 0 && oMetaModel.getObject(`${sMetaPath}/${sTableFirstColProperty}@com.sap.vocabularies.Common.v1.Text/$Path`)) {
        oBindingContext = oMetaModel.createBindingContext(`${sMetaPath}/${sTableFirstColProperty}@com.sap.vocabularies.Common.v1.Text`);
      }
    }
    return oBindingContext;
  }

  /**
   * This function will get the value of first Column of Table, with its text Arrangement.
   *
   * @param sTableFirstColProperty
   * @param oTableRowContext
   * @param sTextAnnotationPath
   * @param sTextArrangement
   * @returns Column Value.
   */
  function getTableFirstColValue(sTableFirstColProperty, oTableRowContext, sTextAnnotationPath, sTextArrangement) {
    const sCodeValue = oTableRowContext.getValue(sTableFirstColProperty);
    let sTextValue;
    let sComputedValue = sCodeValue;
    if (sTextAnnotationPath) {
      if (sTableFirstColProperty.lastIndexOf("/") > 0) {
        // the target property is replaced with the text annotation path
        sTableFirstColProperty = sTableFirstColProperty.slice(0, sTableFirstColProperty.lastIndexOf("/") + 1);
        sTableFirstColProperty = sTableFirstColProperty.concat(sTextAnnotationPath);
      } else {
        sTableFirstColProperty = sTextAnnotationPath;
      }
      sTextValue = oTableRowContext.getValue(sTableFirstColProperty);
      if (sTextValue) {
        if (sTextArrangement) {
          const sEnumNumber = sTextArrangement.slice(sTextArrangement.indexOf("/") + 1);
          switch (sEnumNumber) {
            case "TextOnly":
              sComputedValue = sTextValue;
              break;
            case "TextFirst":
              sComputedValue = `${sTextValue} (${sCodeValue})`;
              break;
            case "TextLast":
              sComputedValue = `${sCodeValue} (${sTextValue})`;
              break;
            case "TextSeparate":
              sComputedValue = sCodeValue;
              break;
            default:
          }
        } else {
          sComputedValue = `${sTextValue} (${sCodeValue})`;
        }
      }
    }
    return sComputedValue;
  }

  /**
   * The method that is called to retrieve the column info from the associated message of the message popover.
   *
   * @private
   * @param oMessage Message object
   * @param oTable MdcTable
   * @returns Returns the column info.
   */
  function fetchColumnInfo(oMessage, oTable) {
    const sColNameFromMessageObj = oMessage === null || oMessage === void 0 ? void 0 : oMessage.getTargets()[0].split("/").pop();
    return oTable.getParent().getTableDefinition().columns.find(function (oColumn) {
      return oColumn.key.split("::").pop() === sColNameFromMessageObj;
    });
  }

  /**
   * This function get the Column data depending on its availability in Table, this is needed for setting subtitle of Message.
   *
   * @param oColFromTableSettings
   * @param resourceModel
   * @returns Column data.
   */
  function determineColumnInfo(oColFromTableSettings, resourceModel) {
    const oColumnInfo = {
      sColumnIndicator: String,
      sColumnValue: String
    };
    if (oColFromTableSettings) {
      // if column is neither in table definition nor personalization, show only row subtitle text
      if (oColFromTableSettings.availability === "Hidden") {
        oColumnInfo.sColumnValue = undefined;
        oColumnInfo.sColumnIndicator = "undefined";
      } else {
        //if column is in table personalization but not in table definition, show Column (Hidden) : <colName>
        oColumnInfo.sColumnValue = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")} (${resourceModel.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION")}): ${oColFromTableSettings.label}`;
        oColumnInfo.sColumnIndicator = "Hidden";
      }
    } else {
      oColumnInfo.sColumnValue = resourceModel.getText("T_MESSAGE_ITEM_SUBTITLE_INDICATOR_UNKNOWN");
      oColumnInfo.sColumnIndicator = "Unknown";
    }
    return oColumnInfo;
  }

  /**
   * This function check if a given control id is a part of Table.
   *
   * @param oTable
   * @param sControlId
   * @returns True if control is part of table.
   */
  function isControlInTable(oTable, sControlId) {
    const oControl = Core.byId(sControlId);
    if (oControl && !oControl.isA("sap.ui.table.Table") && !oControl.isA("sap.m.Table")) {
      return oTable.findElements(true, function (oElem) {
        return oElem.getId() === oControl;
      });
    }
    return false;
  }
  function isControlPartOfCreationRow(oControl) {
    let oParentControl = oControl === null || oControl === void 0 ? void 0 : oControl.getParent();
    while (oParentControl && !((_oParentControl = oParentControl) !== null && _oParentControl !== void 0 && _oParentControl.isA("sap.ui.table.Row")) && !((_oParentControl2 = oParentControl) !== null && _oParentControl2 !== void 0 && _oParentControl2.isA("sap.ui.table.CreationRow")) && !((_oParentControl3 = oParentControl) !== null && _oParentControl3 !== void 0 && _oParentControl3.isA("sap.m.ColumnListItem"))) {
      var _oParentControl, _oParentControl2, _oParentControl3;
      oParentControl = oParentControl.getParent();
    }
    return !!oParentControl && oParentControl.isA("sap.ui.table.CreationRow");
  }
  function getTranslatedTextForMessageDialog(sHighestPriority) {
    const resourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    switch (sHighestPriority) {
      case "Error":
        return resourceBundle.getText("C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERROR");
      case "Information":
        return resourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_INFO");
      case "Success":
        return resourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_SUCCESS");
      case "Warning":
        return resourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNING");
      default:
        return resourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE");
    }
  }
  function removeUnboundTransitionMessages() {
    removeTransitionMessages(false);
  }
  function removeBoundTransitionMessages(sPathToBeRemoved) {
    removeTransitionMessages(true, sPathToBeRemoved);
  }
  function getMessagesFromMessageModel(oMessageModel, sPathToBeRemoved) {
    if (sPathToBeRemoved === undefined) {
      return oMessageModel.getObject("/");
    }
    const listBinding = oMessageModel.bindList("/");
    listBinding.filter(new Filter({
      path: "target",
      operator: FilterOperator.StartsWith,
      value1: sPathToBeRemoved
    }));
    return listBinding.getCurrentContexts().map(function (oContext) {
      return oContext.getObject();
    });
  }
  function getMessages() {
    let bBoundMessages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    let bTransitionOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    let sPathToBeRemoved = arguments.length > 2 ? arguments[2] : undefined;
    let i;
    const oMessageManager = Core.getMessageManager(),
      oMessageModel = oMessageManager.getMessageModel(),
      oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
      aTransitionMessages = [];
    let aMessages = [];
    if (bBoundMessages && bTransitionOnly && sPathToBeRemoved) {
      aMessages = getMessagesFromMessageModel(oMessageModel, sPathToBeRemoved);
    } else {
      aMessages = oMessageModel.getObject("/");
    }
    for (i = 0; i < aMessages.length; i++) {
      if ((!bTransitionOnly || aMessages[i].persistent) && (bBoundMessages && aMessages[i].target !== "" || !bBoundMessages && (!aMessages[i].target || aMessages[i].target === ""))) {
        aTransitionMessages.push(aMessages[i]);
      }
    }
    for (i = 0; i < aTransitionMessages.length; i++) {
      if (aTransitionMessages[i].code === "503" && aTransitionMessages[i].message !== "" && aTransitionMessages[i].message.indexOf(oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")) === -1) {
        aTransitionMessages[i].message = `\n${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")}${aTransitionMessages[i].message}`;
      }
    }
    //Filtering messages again here to avoid showing pure technical messages raised by the model
    const backendMessages = [];
    for (i = 0; i < aTransitionMessages.length; i++) {
      if (aTransitionMessages[i].technicalDetails && (aTransitionMessages[i].technicalDetails.originalMessage !== undefined && aTransitionMessages[i].technicalDetails.originalMessage !== null || aTransitionMessages[i].technicalDetails.httpStatus !== undefined && aTransitionMessages[i].technicalDetails.httpStatus !== null) || aTransitionMessages[i].code) {
        backendMessages.push(aTransitionMessages[i]);
      }
    }
    return backendMessages;
  }
  function removeTransitionMessages(bBoundMessages, sPathToBeRemoved) {
    const aMessagesToBeDeleted = getMessages(bBoundMessages, true, sPathToBeRemoved);
    if (aMessagesToBeDeleted.length > 0) {
      Core.getMessageManager().removeMessages(aMessagesToBeDeleted);
    }
  }
  //TODO: This must be moved out of message handling
  function setMessageSubtitle(oTable, aContexts, message) {
    if (message.additionalText === undefined) {
      const subtitleColumn = oTable.getParent().getIdentifierColumn();
      const errorContext = aContexts.find(function (oContext) {
        return message.getTargets()[0].indexOf(oContext.getPath()) !== -1;
      });
      message.additionalText = errorContext ? errorContext.getObject()[subtitleColumn] : undefined;
    }
  }

  /**
   * The method retrieves the visible sections from an object page.
   *
   * @param oObjectPageLayout The objectPageLayout object for which we want to retrieve the visible sections.
   * @returns Array of visible sections.
   * @private
   */
  function getVisibleSectionsFromObjectPageLayout(oObjectPageLayout) {
    return oObjectPageLayout.getSections().filter(function (oSection) {
      return oSection.getVisible();
    });
  }

  /**
   * This function checks if control ids from message are a part of a given subsection.
   *
   * @param subSection
   * @param oMessageObject
   * @returns SubSection matching control ids.
   */
  function getControlFromMessageRelatingToSubSection(subSection, oMessageObject) {
    return subSection.findElements(true, oElem => {
      return fnFilterUponIds(oMessageObject.getControlIds(), oElem);
    }).sort(function (a, b) {
      // controls are sorted in order to have the table on top of the array
      // it will help to compute the subtitle of the message based on the type of related controls
      if (a.isA("sap.ui.mdc.Table") && !b.isA("sap.ui.mdc.Table")) {
        return -1;
      }
      return 1;
    });
  }
  function getTableColProperty(oTable, oMessageObject, oContextPath) {
    //this function escapes a string to use it as a regex
    const fnRegExpescape = function (s) {
      return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    };
    // based on the target path of the message we retrieve the property name.
    // to achieve it we remove the bindingContext path and the row binding path from the target
    if (!oContextPath) {
      var _oTable$getBindingCon;
      oContextPath = new RegExp(`${fnRegExpescape(`${(_oTable$getBindingCon = oTable.getBindingContext()) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getPath()}/${oTable.getRowBinding().getPath()}`)}\\(.*\\)/`);
    }
    return oMessageObject.getTargets()[0].replace(oContextPath, "");
  }

  /**
   * This function gives the column information if it matches with the property name from target of message.
   *
   * @param oTable
   * @param sTableTargetColProperty
   * @returns Column name and property.
   */
  function getTableColInfo(oTable, sTableTargetColProperty) {
    let sTableTargetColName;
    let oTableTargetCol = oTable.getColumns().find(function (column) {
      return column.getDataProperty() == sTableTargetColProperty;
    });
    if (!oTableTargetCol) {
      /* If the target column is not found, we check for a custom column */
      const oCustomColumn = oTable.getControlDelegate().getColumnsFor(oTable).find(function (oColumn) {
        if (!!oColumn.template && oColumn.propertyInfos) {
          return oColumn.propertyInfos[0] === sTableTargetColProperty || oColumn.propertyInfos[0].replace("Property::", "") === sTableTargetColProperty;
        } else {
          return false;
        }
      });
      if (oCustomColumn) {
        var _oTableTargetCol;
        oTableTargetCol = oCustomColumn;
        sTableTargetColProperty = (_oTableTargetCol = oTableTargetCol) === null || _oTableTargetCol === void 0 ? void 0 : _oTableTargetCol.name;
        sTableTargetColName = oTable.getColumns().find(function (oColumn) {
          return sTableTargetColProperty === oColumn.getDataProperty();
        }).getHeader();
      } else {
        /* If the target column is not found, we check for a field group */
        const aColumns = oTable.getControlDelegate().getColumnsFor(oTable);
        oTableTargetCol = aColumns.find(function (oColumn) {
          if (oColumn.key.indexOf("::FieldGroup::") !== -1) {
            var _oColumn$propertyInfo;
            return (_oColumn$propertyInfo = oColumn.propertyInfos) === null || _oColumn$propertyInfo === void 0 ? void 0 : _oColumn$propertyInfo.find(function () {
              return aColumns.find(function (tableColumn) {
                return tableColumn.relativePath === sTableTargetColProperty;
              });
            });
          }
        });
        /* check if the column with the field group is visible in the table: */
        let bIsTableTargetColVisible = false;
        if (oTableTargetCol && oTableTargetCol.label) {
          bIsTableTargetColVisible = oTable.getColumns().some(function (column) {
            return column.getHeader() === oTableTargetCol.label;
          });
        }
        sTableTargetColName = bIsTableTargetColVisible && oTableTargetCol.label;
        sTableTargetColProperty = bIsTableTargetColVisible && oTableTargetCol.key;
      }
    } else {
      sTableTargetColName = oTableTargetCol && oTableTargetCol.getHeader();
    }
    return {
      sTableTargetColName: sTableTargetColName,
      sTableTargetColProperty: sTableTargetColProperty
    };
  }

  /**
   * This function gives Table and column info if any of it matches the target from Message.
   *
   * @param oTable
   * @param oMessageObject
   * @param oElement
   * @param oRowBinding
   * @returns Table info matching the message target.
   */
  function getTableAndTargetInfo(oTable, oMessageObject, oElement, oRowBinding) {
    const oTargetTableInfo = {};
    oTargetTableInfo.sTableTargetColProperty = getTableColProperty(oTable, oMessageObject);
    const oTableColInfo = getTableColInfo(oTable, oTargetTableInfo.sTableTargetColProperty);
    oTargetTableInfo.oTableRowBindingContexts = oElement.isA("sap.ui.table.Table") ? oRowBinding.getContexts() : oRowBinding.getCurrentContexts();
    oTargetTableInfo.sTableTargetColName = oTableColInfo.sTableTargetColName;
    oTargetTableInfo.sTableTargetColProperty = oTableColInfo.sTableTargetColProperty;
    oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts.find(function (rowContext) {
      return rowContext && oMessageObject.getTargets()[0].indexOf(rowContext.getPath()) === 0;
    });
    return oTargetTableInfo;
  }

  /**
   *
   * @param aControlIds
   * @param oItem
   * @returns True if the item matches one of the controls
   */
  function fnFilterUponIds(aControlIds, oItem) {
    return aControlIds.some(function (sControlId) {
      if (sControlId === oItem.getId()) {
        return true;
      }
      return false;
    });
  }

  /**
   * This function gives the group name having section and subsection data.
   *
   * @param section
   * @param subSection
   * @param bMultipleSubSections
   * @param oTargetTableInfo
   * @param resourceModel
   * @returns Group name.
   */
  function createSectionGroupName(section, subSection, bMultipleSubSections, oTargetTableInfo, resourceModel) {
    return section.getTitle() + (subSection.getTitle() && bMultipleSubSections ? `, ${subSection.getTitle()}` : "") + (oTargetTableInfo ? `, ${resourceModel.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTargetTableInfo.tableHeader}` : "");
  }
  function bIsOrphanElement(oElement, aElements) {
    return !aElements.some(function (oElem) {
      let oParentElement = oElement.getParent();
      while (oParentElement && oParentElement !== oElem) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement ? true : false;
    });
  }

  /**
   * Static functions for Fiori Message Handling
   *
   * @namespace
   * @alias sap.fe.core.actions.messageHandling
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.56.0
   */
  const messageHandling = {
    getMessages: getMessages,
    showUnboundMessages: showUnboundMessages,
    removeUnboundTransitionMessages: removeUnboundTransitionMessages,
    removeBoundTransitionMessages: removeBoundTransitionMessages,
    modifyETagMessagesOnly: fnModifyETagMessagesOnly,
    getRetryAfterMessage: getRetryAfterMessage,
    prepareMessageViewForDialog: prepareMessageViewForDialog,
    setMessageSubtitle: setMessageSubtitle,
    getVisibleSectionsFromObjectPageLayout: getVisibleSectionsFromObjectPageLayout,
    getControlFromMessageRelatingToSubSection: getControlFromMessageRelatingToSubSection,
    fnFilterUponIds: fnFilterUponIds,
    getTableAndTargetInfo: getTableAndTargetInfo,
    createSectionGroupName: createSectionGroupName,
    bIsOrphanElement: bIsOrphanElement,
    getLastActionTextAndActionName: getLastActionTextAndActionName,
    getTableColumnDataAndSetSubtile: getTableColumnDataAndSetSubtile,
    getTableColInfo: getTableColInfo,
    getTableColProperty: getTableColProperty,
    getMessageSubtitle: getMessageSubtitle,
    determineColumnInfo: determineColumnInfo,
    fetchColumnInfo: fetchColumnInfo,
    getTableFirstColBindingContextForTextAnnotation: getTableFirstColBindingContextForTextAnnotation,
    getMessageRank: getMessageRank,
    fnCallbackSetGroupName: fnCallbackSetGroupName,
    getTableFirstColValue: getTableFirstColValue,
    setGroupNameOPDisplayMode: setGroupNameOPDisplayMode,
    updateMessageObjectGroupName: updateMessageObjectGroupName,
    setGroupNameLRTable: setGroupNameLRTable,
    isControlInTable: isControlInTable,
    isControlPartOfCreationRow: isControlPartOfCreationRow
  };
  return messageHandling;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlVHlwZSIsIkNvcmVMaWIiLCJhTWVzc2FnZUxpc3QiLCJhTWVzc2FnZURhdGFMaXN0IiwiYVJlc29sdmVGdW5jdGlvbnMiLCJvRGlhbG9nIiwib0JhY2tCdXR0b24iLCJvTWVzc2FnZVZpZXciLCJmbkZvcm1hdFRlY2huaWNhbERldGFpbHMiLCJzUHJldmlvdXNHcm91cE5hbWUiLCJpbnNlcnREZXRhaWwiLCJvUHJvcGVydHkiLCJwcm9wZXJ0eSIsInN1YnN0ciIsIk1hdGgiLCJtYXgiLCJsYXN0SW5kZXhPZiIsImluc2VydEdyb3VwTmFtZSIsInNIVE1MIiwiZ3JvdXBOYW1lIiwiZ2V0UGF0aHMiLCJzVEQiLCJmb3JFYWNoIiwiZm5Gb3JtYXREZXNjcmlwdGlvbiIsImZuR2V0SGlnaGVzdE1lc3NhZ2VQcmlvcml0eSIsImFNZXNzYWdlcyIsInNNZXNzYWdlUHJpb3JpdHkiLCJOb25lIiwiaUxlbmd0aCIsImxlbmd0aCIsIm9NZXNzYWdlQ291bnQiLCJFcnJvciIsIldhcm5pbmciLCJTdWNjZXNzIiwiSW5mb3JtYXRpb24iLCJpIiwiZ2V0VHlwZSIsImZuTW9kaWZ5RVRhZ01lc3NhZ2VzT25seSIsIm9NZXNzYWdlTWFuYWdlciIsIm9SZXNvdXJjZUJ1bmRsZSIsImNvbmN1cnJlbnRFZGl0RmxhZyIsImdldE1lc3NhZ2VNb2RlbCIsImdldE9iamVjdCIsImJNZXNzYWdlc01vZGlmaWVkIiwic0V0YWdNZXNzYWdlIiwib01lc3NhZ2UiLCJvVGVjaG5pY2FsRGV0YWlscyIsImdldFRlY2huaWNhbERldGFpbHMiLCJodHRwU3RhdHVzIiwiaXNDb25jdXJyZW50TW9kaWZpY2F0aW9uIiwiZ2V0VGV4dCIsInJlbW92ZU1lc3NhZ2VzIiwic2V0TWVzc2FnZSIsInRhcmdldCIsImFkZE1lc3NhZ2VzIiwiZGlhbG9nQ2xvc2VIYW5kbGVyIiwiY2xvc2UiLCJzZXRWaXNpYmxlIiwib01lc3NhZ2VEaWFsb2dNb2RlbCIsImdldE1vZGVsIiwic2V0RGF0YSIsInJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJnZXRSZXRyeUFmdGVyTWVzc2FnZSIsImJNZXNzYWdlRGlhbG9nIiwiZE5vdyIsIkRhdGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwic1JldHJ5QWZ0ZXJNZXNzYWdlIiwicmV0cnlBZnRlciIsImRSZXRyeUFmdGVyIiwib0RhdGVGb3JtYXQiLCJnZXRGdWxsWWVhciIsIkRhdGVGb3JtYXQiLCJnZXREYXRlVGltZUluc3RhbmNlIiwicGF0dGVybiIsImZvcm1hdCIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsInByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyIsImJTdHJpY3RIYW5kbGluZ0Zsb3ciLCJtdWx0aTQxMiIsIm9NZXNzYWdlVGVtcGxhdGUiLCJkZXNjcmlwdGlvbkJpbmRpbmciLCJ0ZWNobmljYWxEZXRhaWxzQmluZGluZyIsIk1lc3NhZ2VJdGVtIiwidW5kZWZpbmVkIiwiY291bnRlciIsInBhdGgiLCJ0aXRsZSIsInN1YnRpdGxlIiwibG9uZ3RleHRVcmwiLCJ0eXBlIiwiZGVzY3JpcHRpb24iLCJtYXJrdXBEZXNjcmlwdGlvbiIsIk1lc3NhZ2VWaWV3Iiwic2hvd0RldGFpbHNQYWdlSGVhZGVyIiwiaXRlbVNlbGVjdCIsIml0ZW1zIiwidGVtcGxhdGUiLCJzZXRHcm91cEl0ZW1zIiwiQnV0dG9uIiwiaWNvbiIsIkljb25Qb29sIiwiZ2V0SWNvblVSSSIsInZpc2libGUiLCJwcmVzcyIsIm5hdmlnYXRlQmFjayIsInNldE1vZGVsIiwic2hvd1VuYm91bmRNZXNzYWdlcyIsImFDdXN0b21NZXNzYWdlcyIsIm9Db250ZXh0IiwiYlNob3dCb3VuZFRyYW5zaXRpb24iLCJjb250cm9sIiwic0FjdGlvbk5hbWUiLCJiT25seUZvclRlc3QiLCJvbkJlZm9yZVNob3dNZXNzYWdlIiwidmlld1R5cGUiLCJhVHJhbnNpdGlvbk1lc3NhZ2VzIiwiZ2V0TWVzc2FnZXMiLCJnZXRNZXNzYWdlTWFuYWdlciIsInNIaWdoZXN0UHJpb3JpdHkiLCJzSGlnaGVzdFByaW9yaXR5VGV4dCIsImFGaWx0ZXJzIiwiRmlsdGVyIiwib3BlcmF0b3IiLCJGaWx0ZXJPcGVyYXRvciIsIk5FIiwidmFsdWUxIiwic2hvd01lc3NhZ2VEaWFsb2ciLCJzaG93TWVzc2FnZUJveCIsImNvbmNhdCIsInB1c2giLCJFUSIsImZuQ2hlY2tDb250cm9sSWRJbkRpYWxvZyIsImFDb250cm9sSWRzIiwiaW5kZXgiLCJJbmZpbml0eSIsIm9Db250cm9sIiwiYnlJZCIsImVycm9yRmllbGRDb250cm9sIiwiZmllbGRSYW5raW5EaWFsb2ciLCJEaWFsb2ciLCJnZXRQYXJlbnQiLCJmaW5kRWxlbWVudHMiLCJpbmRleE9mIiwiZm9jdXMiLCJ0ZXN0IiwiY2FzZVNlbnNpdGl2ZSIsIm1lc3NhZ2VDb2RlIiwiY29kZSIsIk1lc3NhZ2UiLCJtZXNzYWdlIiwidGV4dCIsInBlcnNpc3RlbnQiLCJKU09OTW9kZWwiLCJiSGFzRXRhZ01lc3NhZ2UiLCJtb2RpZnlFVGFnTWVzc2FnZXNPbmx5IiwiZ2V0Q29kZSIsInNob3dNZXNzYWdlUGFyYW1ldGVycyIsImFNb2RlbERhdGFBcnJheSIsIm9MaXN0QmluZGluZyIsImJpbmRMaXN0IiwiYUN1cnJlbnRDb250ZXh0cyIsImdldEN1cnJlbnRDb250ZXh0cyIsImN1cnJlbnRDb250ZXh0IiwiZXhpc3RpbmdNZXNzYWdlcyIsIkFycmF5IiwiaXNBcnJheSIsImdldERhdGEiLCJvVW5pcXVlT2JqIiwiZmlsdGVyIiwib2JqIiwiaWQiLCJzaG93Q2hhbmdlU2V0RXJyb3JEaWFsb2ciLCJmaWx0ZXJlZE1lc3NhZ2VzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJNZXNzYWdlVG9hc3QiLCJzaG93IiwibWVzc2FnZUhhbmRsaW5nIiwidXBkYXRlTWVzc2FnZU9iamVjdEdyb3VwTmFtZSIsInJlamVjdCIsInRoZW4iLCJmbkdldE1lc3NhZ2VTdWJ0aXRsZSIsIm9NZXNzYWdlT2JqZWN0Iiwib1NvcnRlciIsIlNvcnRlciIsIm9iajEiLCJvYmoyIiwicmFua0EiLCJnZXRNZXNzYWdlUmFuayIsInJhbmtCIiwiZ2V0QmluZGluZyIsInNvcnQiLCJpc09wZW4iLCJyZXNpemFibGUiLCJlbmRCdXR0b24iLCJjdXN0b21IZWFkZXIiLCJCYXIiLCJjb250ZW50TWlkZGxlIiwiVGV4dCIsImNvbnRlbnRMZWZ0IiwiY29udGVudFdpZHRoIiwiY29udGVudEhlaWdodCIsInZlcnRpY2FsU2Nyb2xsaW5nIiwiYWZ0ZXJDbG9zZSIsImNhbGwiLCJyZW1vdmVBbGxDb250ZW50IiwiYWRkQ29udGVudCIsInNhcCIsInVpIiwicmVxdWlyZSIsIkJ1dHRvblR5cGUiLCJzZXRCZWdpbkJ1dHRvbiIsImhhc1BlbmRpbmdDaGFuZ2VzIiwicmVzZXRDaGFuZ2VzIiwicmVmcmVzaCIsIkVtcGhhc2l6ZWQiLCJkZXN0cm95QmVnaW5CdXR0b24iLCJnZXRJdGVtcyIsImdldFRyYW5zbGF0ZWRUZXh0Rm9yTWVzc2FnZURpYWxvZyIsInNldFN0YXRlIiwiZ2V0Q3VzdG9tSGVhZGVyIiwiZ2V0Q29udGVudE1pZGRsZSIsInNldFRleHQiLCJvcGVuIiwiY2F0Y2giLCJ0ZWNobmljYWxEZXRhaWxzIiwib3JpZ2luYWxNZXNzYWdlIiwiZm9ybWF0dGVkVGV4dFN0cmluZyIsInJldHJ5QWZ0ZXJNZXNzYWdlIiwiZ2V0QWRkaXRpb25hbFRleHQiLCJnZXRNZXNzYWdlIiwiZm9ybWF0dGVkVGV4dCIsIkZvcm1hdHRlZFRleHQiLCJodG1sVGV4dCIsIk1lc3NhZ2VCb3giLCJlcnJvciIsIm9uQ2xvc2UiLCJyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyIsImFNb2RlbERhdGEiLCJzZXRHcm91cE5hbWVMUlRhYmxlIiwic2V0R3JvdXBOYW1lT1BEaXNwbGF5TW9kZSIsImdldExhc3RBY3Rpb25UZXh0QW5kQWN0aW9uTmFtZSIsIm9FbGVtIiwib1Jvd0JpbmRpbmciLCJnZXRSb3dCaW5kaW5nIiwic0VsZW1lQmluZGluZ1BhdGgiLCJnZXRQYXRoIiwiYWxsUm93Q29udGV4dHMiLCJyb3dDb250ZXh0IiwiaW5jbHVkZXMiLCJjb250ZXh0UGF0aCIsImlkZW50aWZpZXJDb2x1bW4iLCJnZXRJZGVudGlmaWVyQ29sdW1uIiwicm93SWRlbnRpZmllciIsImNvbHVtblByb3BlcnR5TmFtZSIsImdldFRhYmxlQ29sUHJvcGVydHkiLCJzVGFibGVUYXJnZXRDb2xOYW1lIiwiZ2V0VGFibGVDb2xJbmZvIiwiZ2V0SGVhZGVyIiwib1ZpZXdDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJvcExheW91dCIsImdldENvbnRlbnQiLCJiSXNHZW5lcmFsR3JvdXBOYW1lIiwiZ2V0VmlzaWJsZVNlY3Rpb25zRnJvbU9iamVjdFBhZ2VMYXlvdXQiLCJvU2VjdGlvbiIsInN1YlNlY3Rpb25zIiwiZ2V0U3ViU2VjdGlvbnMiLCJvU3ViU2VjdGlvbiIsImlzQSIsInNldFNlY3Rpb25OYW1lSW5Hcm91cCIsImNoaWxkVGFibGVFbGVtZW50Iiwib0VsZW1lbnQiLCJnZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlIiwiZm5DYWxsYmFja1NldEdyb3VwTmFtZSIsIm9UYXJnZXRUYWJsZUluZm8iLCJnZXRDb250ZXh0cyIsImhlYWRlck5hbWUiLCJnZXRIZWFkZXJWaXNpYmxlIiwidGFibGVIZWFkZXIiLCJnZXRUaXRsZSIsInNMYXN0QWN0aW9uVGV4dCIsInRvU3RyaW5nIiwiYU1lc3NhZ2UiLCJzR2VuZXJhbEdyb3VwVGV4dCIsIm9UYWJsZSIsImZuU2V0R3JvdXBOYW1lIiwiZ2V0VGFibGVBbmRUYXJnZXRJbmZvIiwic0NvbnRyb2xJZCIsImJJc0NyZWF0aW9uUm93Iiwib1RhYmxlUm93Q29udGV4dCIsImdldENvbnRyb2xJZHMiLCJmaW5kIiwic0lkIiwiaXNDb250cm9sSW5UYWJsZSIsImlzQ29udHJvbFBhcnRPZkNyZWF0aW9uUm93Iiwic3ViVGl0bGUiLCJnZXRNZXNzYWdlU3VidGl0bGUiLCJvVGFibGVSb3dCaW5kaW5nQ29udGV4dHMiLCJvVGFyZ2V0ZWRDb250cm9sIiwic01lc3NhZ2VTdWJ0aXRsZSIsInNSb3dTdWJ0aXRsZVZhbHVlIiwicmVzb3VyY2VNb2RlbCIsImdldFJlc291cmNlTW9kZWwiLCJzVGFibGVGaXJzdENvbFByb3BlcnR5Iiwib0NvbEZyb21UYWJsZVNldHRpbmdzIiwiZmV0Y2hDb2x1bW5JbmZvIiwibGFiZWwiLCJvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb24iLCJnZXRUYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRGb3JUZXh0QW5ub3RhdGlvbiIsInNUYWJsZUZpcnN0Q29sVGV4dEFubm90YXRpb25QYXRoIiwic1RhYmxlRmlyc3RDb2xUZXh0QXJyYW5nZW1lbnQiLCJnZXRWYWx1ZSIsImdldFRhYmxlRmlyc3RDb2xWYWx1ZSIsIm9Db2x1bW5JbmZvIiwiZGV0ZXJtaW5lQ29sdW1uSW5mbyIsInNDb2x1bW5JbmRpY2F0b3IiLCJzQ29sdW1uVmFsdWUiLCJvQmluZGluZ0NvbnRleHQiLCJvTW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsInNUZXh0QW5ub3RhdGlvblBhdGgiLCJzVGV4dEFycmFuZ2VtZW50Iiwic0NvZGVWYWx1ZSIsInNUZXh0VmFsdWUiLCJzQ29tcHV0ZWRWYWx1ZSIsInNsaWNlIiwic0VudW1OdW1iZXIiLCJzQ29sTmFtZUZyb21NZXNzYWdlT2JqIiwiZ2V0VGFyZ2V0cyIsInNwbGl0IiwicG9wIiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiY29sdW1ucyIsIm9Db2x1bW4iLCJrZXkiLCJTdHJpbmciLCJhdmFpbGFiaWxpdHkiLCJnZXRJZCIsIm9QYXJlbnRDb250cm9sIiwicmVzb3VyY2VCdW5kbGUiLCJyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMiLCJzUGF0aFRvQmVSZW1vdmVkIiwiZ2V0TWVzc2FnZXNGcm9tTWVzc2FnZU1vZGVsIiwib01lc3NhZ2VNb2RlbCIsImxpc3RCaW5kaW5nIiwiU3RhcnRzV2l0aCIsIm1hcCIsImJCb3VuZE1lc3NhZ2VzIiwiYlRyYW5zaXRpb25Pbmx5IiwiYmFja2VuZE1lc3NhZ2VzIiwiYU1lc3NhZ2VzVG9CZURlbGV0ZWQiLCJzZXRNZXNzYWdlU3VidGl0bGUiLCJhQ29udGV4dHMiLCJhZGRpdGlvbmFsVGV4dCIsInN1YnRpdGxlQ29sdW1uIiwiZXJyb3JDb250ZXh0Iiwib09iamVjdFBhZ2VMYXlvdXQiLCJnZXRTZWN0aW9ucyIsImdldFZpc2libGUiLCJnZXRDb250cm9sRnJvbU1lc3NhZ2VSZWxhdGluZ1RvU3ViU2VjdGlvbiIsInN1YlNlY3Rpb24iLCJmbkZpbHRlclVwb25JZHMiLCJhIiwiYiIsIm9Db250ZXh0UGF0aCIsImZuUmVnRXhwZXNjYXBlIiwicyIsInJlcGxhY2UiLCJSZWdFeHAiLCJzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSIsIm9UYWJsZVRhcmdldENvbCIsImdldENvbHVtbnMiLCJjb2x1bW4iLCJnZXREYXRhUHJvcGVydHkiLCJvQ3VzdG9tQ29sdW1uIiwiZ2V0Q29udHJvbERlbGVnYXRlIiwiZ2V0Q29sdW1uc0ZvciIsInByb3BlcnR5SW5mb3MiLCJuYW1lIiwiYUNvbHVtbnMiLCJ0YWJsZUNvbHVtbiIsInJlbGF0aXZlUGF0aCIsImJJc1RhYmxlVGFyZ2V0Q29sVmlzaWJsZSIsInNvbWUiLCJvVGFibGVDb2xJbmZvIiwib0l0ZW0iLCJjcmVhdGVTZWN0aW9uR3JvdXBOYW1lIiwic2VjdGlvbiIsImJNdWx0aXBsZVN1YlNlY3Rpb25zIiwiYklzT3JwaGFuRWxlbWVudCIsImFFbGVtZW50cyIsIm9QYXJlbnRFbGVtZW50Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJtZXNzYWdlSGFuZGxpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgeyBnZXRSZXNvdXJjZU1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVzb3VyY2VNb2RlbEhlbHBlclwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBCYXIgZnJvbSBcInNhcC9tL0JhclwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBGb3JtYXR0ZWRUZXh0IGZyb20gXCJzYXAvbS9Gb3JtYXR0ZWRUZXh0XCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IE1lc3NhZ2VJdGVtIGZyb20gXCJzYXAvbS9NZXNzYWdlSXRlbVwiO1xuaW1wb3J0IE1lc3NhZ2VUb2FzdCBmcm9tIFwic2FwL20vTWVzc2FnZVRvYXN0XCI7XG5pbXBvcnQgTWVzc2FnZVZpZXcgZnJvbSBcInNhcC9tL01lc3NhZ2VWaWV3XCI7XG5pbXBvcnQgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IHR5cGUgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBVSTVFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgRGF0ZUZvcm1hdCBmcm9tIFwic2FwL3VpL2NvcmUvZm9ybWF0L0RhdGVGb3JtYXRcIjtcbmltcG9ydCBJY29uUG9vbCBmcm9tIFwic2FwL3VpL2NvcmUvSWNvblBvb2xcIjtcbmltcG9ydCBDb3JlTGliIGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9CaW5kaW5nXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBPRGF0YVY0Q29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IFNvcnRlciBmcm9tIFwic2FwL3VpL21vZGVsL1NvcnRlclwiO1xuaW1wb3J0IENvbHVtbiBmcm9tIFwic2FwL3VpL3RhYmxlL0NvbHVtblwiO1xuaW1wb3J0IHR5cGUgT2JqZWN0UGFnZUxheW91dCBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZUxheW91dFwiO1xuaW1wb3J0IE9iamVjdFBhZ2VTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU2VjdGlvblwiO1xuaW1wb3J0IE9iamVjdFBhZ2VTdWJTZWN0aW9uIGZyb20gXCJzYXAvdXhhcC9PYmplY3RQYWdlU3ViU2VjdGlvblwiO1xuXG5jb25zdCBNZXNzYWdlVHlwZSA9IENvcmVMaWIuTWVzc2FnZVR5cGU7XG5sZXQgYU1lc3NhZ2VMaXN0OiBhbnlbXSA9IFtdO1xubGV0IGFNZXNzYWdlRGF0YUxpc3Q6IGFueVtdID0gW107XG5sZXQgYVJlc29sdmVGdW5jdGlvbnM6IGFueVtdID0gW107XG5sZXQgb0RpYWxvZzogRGlhbG9nO1xubGV0IG9CYWNrQnV0dG9uOiBCdXR0b247XG5sZXQgb01lc3NhZ2VWaWV3OiBNZXNzYWdlVmlldztcblxuZXhwb3J0IHR5cGUgTWVzc2FnZVdpdGhIZWFkZXIgPSBNZXNzYWdlICYge1xuXHRoZWFkZXJOYW1lPzogc3RyaW5nO1xuXHR0YXJnZXQ/OiBzdHJpbmc7XG5cdGFkZGl0aW9uYWxUZXh0Pzogc3RyaW5nO1xufTtcblxudHlwZSBUYXJnZXRUYWJsZUluZm9UeXBlID0ge1xuXHRvVGFibGVSb3dCaW5kaW5nQ29udGV4dHM6IE9EYXRhVjRDb250ZXh0W107XG5cdG9UYWJsZVJvd0NvbnRleHQ6IE9EYXRhVjRDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHRzVGFibGVUYXJnZXRDb2xOYW1lOiBzdHJpbmcgfCBib29sZWFuO1xuXHRzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTogc3RyaW5nO1xuXHR0YWJsZUhlYWRlcjogc3RyaW5nO1xufTtcblxudHlwZSBDb2xJbmZvQW5kU3VidGl0bGVUeXBlID0ge1xuXHRvVGFyZ2V0VGFibGVJbmZvOiBUYXJnZXRUYWJsZUluZm9UeXBlO1xuXHRzdWJUaXRsZT86IHN0cmluZyB8IG51bGw7XG59O1xuXG50eXBlIENvbHVtbkluZm9UeXBlID0ge1xuXHRzQ29sdW1uVmFsdWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0c0NvbHVtbkluZGljYXRvcjogc3RyaW5nO1xufTtcblxudHlwZSBDb2x1bW5XaXRoTGFiZWxUeXBlID0gQ29sdW1uICYge1xuXHRsYWJlbD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIG1lc3NhZ2VIYW5kbGluZ1R5cGUgPSB7XG5cdGdldE1lc3NhZ2VzOiAoYkJvdW5kTWVzc2FnZXM/OiBhbnksIGJUcmFuc2l0aW9uT25seT86IGFueSkgPT4gYW55W107XG5cdHNob3dVbmJvdW5kTWVzc2FnZXM6IChcblx0XHRhQ3VzdG9tTWVzc2FnZXM/OiBhbnlbXSxcblx0XHRvQ29udGV4dD86IGFueSxcblx0XHRiU2hvd0JvdW5kVHJhbnNpdGlvbj86IGJvb2xlYW4sXG5cdFx0Y29uY3VycmVudEVkaXRGbGFnPzogYm9vbGVhbixcblx0XHRvQ29udHJvbD86IENvbnRyb2wsXG5cdFx0c0FjdGlvbk5hbWU/OiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdFx0Yk9ubHlGb3JUZXN0PzogYm9vbGVhbixcblx0XHRvbkJlZm9yZVNob3dNZXNzYWdlPzogKG1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyczogYW55KSA9PiBhbnksXG5cdFx0dmlld1R5cGU/OiBzdHJpbmdcblx0KSA9PiBQcm9taXNlPGFueT47XG5cdHJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXM6ICgpID0+IHZvaWQ7XG5cdG1vZGlmeUVUYWdNZXNzYWdlc09ubHk6IChvTWVzc2FnZU1hbmFnZXI6IGFueSwgb1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSwgY29uY3VycmVudEVkaXRGbGFnOiBib29sZWFuIHwgdW5kZWZpbmVkKSA9PiBib29sZWFuO1xuXHRyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlczogKHNQYXRoVG9CZVJlbW92ZWQ/OiBzdHJpbmcpID0+IHZvaWQ7XG5cdGdldFJldHJ5QWZ0ZXJNZXNzYWdlOiAob01lc3NhZ2U6IGFueSwgYk1lc3NhZ2VEaWFsb2c/OiBhbnkpID0+IGFueTtcblx0cHJlcGFyZU1lc3NhZ2VWaWV3Rm9yRGlhbG9nOiAob01lc3NhZ2VEaWFsb2dNb2RlbDogSlNPTk1vZGVsLCBiU3RyaWN0SGFuZGxpbmdGbG93OiBib29sZWFuLCBpc011bHRpNDEyPzogYm9vbGVhbikgPT4gYW55O1xuXHRzZXRNZXNzYWdlU3VidGl0bGU6IChvVGFibGU6IFRhYmxlLCBhQ29udGV4dHM6IENvbnRleHRbXSwgbWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIpID0+IHZvaWQ7XG5cdGdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0OiAob09iamVjdFBhZ2VMYXlvdXQ6IENvbnRyb2wpID0+IGFueTtcblx0Z2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb246IChzdWJTZWN0aW9uOiBPYmplY3RQYWdlU3ViU2VjdGlvbiwgb01lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VXaXRoSGVhZGVyKSA9PiBVSTVFbGVtZW50W107XG5cdGZuRmlsdGVyVXBvbklkczogKGFDb250cm9sSWRzOiBzdHJpbmdbXSwgb0l0ZW06IFVJNUVsZW1lbnQpID0+IGJvb2xlYW47XG5cdGdldFRhYmxlQW5kVGFyZ2V0SW5mbzogKFxuXHRcdG9UYWJsZTogVGFibGUsXG5cdFx0b01lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VXaXRoSGVhZGVyLFxuXHRcdG9FbGVtZW50OiBVSTVFbGVtZW50IHwgdW5kZWZpbmVkLFxuXHRcdG9Sb3dCaW5kaW5nOiBCaW5kaW5nXG5cdCkgPT4gVGFyZ2V0VGFibGVJbmZvVHlwZTtcblx0Y3JlYXRlU2VjdGlvbkdyb3VwTmFtZTogKFxuXHRcdHNlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uLFxuXHRcdHN1YlNlY3Rpb246IE9iamVjdFBhZ2VTdWJTZWN0aW9uLFxuXHRcdGJNdWx0aXBsZVN1YlNlY3Rpb25zOiBib29sZWFuLFxuXHRcdG9UYXJnZXRUYWJsZUluZm86IFRhcmdldFRhYmxlSW5mb1R5cGUsXG5cdFx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbFxuXHQpID0+IHN0cmluZztcblx0YklzT3JwaGFuRWxlbWVudDogKG9FbGVtZW50OiBVSTVFbGVtZW50LCBhRWxlbWVudHM6IFVJNUVsZW1lbnRbXSkgPT4gYm9vbGVhbjtcblx0Z2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lOiAoc0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCkgPT4gc3RyaW5nO1xuXHRnZXRUYWJsZUNvbHVtbkRhdGFBbmRTZXRTdWJ0aWxlOiAoXG5cdFx0YU1lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyLFxuXHRcdG9UYWJsZTogVGFibGUsXG5cdFx0b0VsZW1lbnQ6IFVJNUVsZW1lbnQgfCB1bmRlZmluZWQsXG5cdFx0b1Jvd0JpbmRpbmc6IEJpbmRpbmcsXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHRzZXRTZWN0aW9uTmFtZUluR3JvdXA6IEJvb2xlYW4sXG5cdFx0Zm5DYWxsYmFja1NldEdyb3VwTmFtZTogYW55XG5cdCkgPT4gQ29sSW5mb0FuZFN1YnRpdGxlVHlwZTtcblx0Z2V0VGFibGVDb2xJbmZvOiAob1RhYmxlOiBDb250cm9sLCBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTogc3RyaW5nKSA9PiBhbnk7XG5cdGdldFRhYmxlQ29sUHJvcGVydHk6IChvVGFibGU6IENvbnRyb2wsIG9NZXNzYWdlT2JqZWN0OiBNZXNzYWdlV2l0aEhlYWRlciwgb0NvbnRleHRQYXRoPzogYW55KSA9PiBhbnk7XG5cdGdldE1lc3NhZ2VTdWJ0aXRsZTogKFxuXHRcdG1lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyLFxuXHRcdG9UYWJsZVJvd0JpbmRpbmdDb250ZXh0czogT0RhdGFWNENvbnRleHRbXSxcblx0XHRvVGFibGVSb3dDb250ZXh0OiBPRGF0YVY0Q29udGV4dCB8IHVuZGVmaW5lZCxcblx0XHRzVGFibGVUYXJnZXRDb2xOYW1lOiBzdHJpbmcgfCBib29sZWFuLFxuXHRcdG9UYWJsZTogVGFibGUsXG5cdFx0YklzQ3JlYXRpb25Sb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQsXG5cdFx0b1RhcmdldGVkQ29udHJvbD86IENvbnRyb2xcblx0KSA9PiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xuXHRkZXRlcm1pbmVDb2x1bW5JbmZvOiAob0NvbEZyb21UYWJsZVNldHRpbmdzOiBhbnksIHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwpID0+IENvbHVtbkluZm9UeXBlO1xuXHRmZXRjaENvbHVtbkluZm86IChvTWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsIG9UYWJsZTogVGFibGUpID0+IENvbHVtbjtcblx0Z2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb246IChcblx0XHRvVGFibGU6IFRhYmxlLFxuXHRcdG9UYWJsZVJvd0NvbnRleHQ6IE9EYXRhVjRDb250ZXh0IHwgdW5kZWZpbmVkLFxuXHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHk6IHN0cmluZ1xuXHQpID0+IENvbnRleHQgfCBudWxsIHwgdW5kZWZpbmVkO1xuXHRnZXRNZXNzYWdlUmFuazogKG9iajogTWVzc2FnZVdpdGhIZWFkZXIpID0+IG51bWJlcjtcblx0Zm5DYWxsYmFja1NldEdyb3VwTmFtZTogKGFNZXNzYWdlOiBNZXNzYWdlV2l0aEhlYWRlciwgc0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCwgYklzR2VuZXJhbEdyb3VwTmFtZT86IEJvb2xlYW4pID0+IGFueTtcblx0Z2V0VGFibGVGaXJzdENvbFZhbHVlOiAoXG5cdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eTogc3RyaW5nLFxuXHRcdG9UYWJsZVJvd0NvbnRleHQ6IENvbnRleHQsXG5cdFx0c1RleHRBbm5vdGF0aW9uUGF0aDogc3RyaW5nLFxuXHRcdHNUZXh0QXJyYW5nZW1lbnQ6IHN0cmluZ1xuXHQpID0+IHN0cmluZztcblx0c2V0R3JvdXBOYW1lT1BEaXNwbGF5TW9kZTogKGFNb2RlbERhdGE6IE1lc3NhZ2VXaXRoSGVhZGVyLCBzQWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLCBjb250cm9sOiBhbnkpID0+IHZvaWQ7XG5cdHVwZGF0ZU1lc3NhZ2VPYmplY3RHcm91cE5hbWU6IChcblx0XHRhTW9kZWxEYXRhQXJyYXk6IE1lc3NhZ2VXaXRoSGVhZGVyW10sXG5cdFx0Y29udHJvbDogQ29udHJvbCB8IHVuZGVmaW5lZCxcblx0XHRzQWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRcdHZpZXdUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWRcblx0KSA9PiB2b2lkO1xuXHRzZXRHcm91cE5hbWVMUlRhYmxlOiAoY29udHJvbDogQ29udHJvbCB8IHVuZGVmaW5lZCwgYU1vZGVsRGF0YTogTWVzc2FnZVdpdGhIZWFkZXIsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQpID0+IHZvaWQ7XG5cdGlzQ29udHJvbEluVGFibGU6IChvVGFibGU6IFRhYmxlLCBzQ29udHJvbElkOiBzdHJpbmcpID0+IFVJNUVsZW1lbnRbXSB8IGJvb2xlYW47XG5cdGlzQ29udHJvbFBhcnRPZkNyZWF0aW9uUm93OiAob0NvbnRyb2w6IFVJNUVsZW1lbnQgfCB1bmRlZmluZWQpID0+IGJvb2xlYW47XG59O1xuXG5mdW5jdGlvbiBmbkZvcm1hdFRlY2huaWNhbERldGFpbHMoKSB7XG5cdGxldCBzUHJldmlvdXNHcm91cE5hbWU6IHN0cmluZztcblxuXHQvLyBJbnNlcnQgdGVjaG5pY2FsIGRldGFpbCBpZiBpdCBleGlzdHNcblx0ZnVuY3Rpb24gaW5zZXJ0RGV0YWlsKG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eS5wcm9wZXJ0eVxuXHRcdFx0PyBcIiggJHtcIiArXG5cdFx0XHRcdFx0b1Byb3BlcnR5LnByb3BlcnR5ICtcblx0XHRcdFx0XHQnfSA/IChcIjxwPicgK1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eS5wcm9wZXJ0eS5zdWJzdHIoTWF0aC5tYXgob1Byb3BlcnR5LnByb3BlcnR5Lmxhc3RJbmRleE9mKFwiL1wiKSwgb1Byb3BlcnR5LnByb3BlcnR5Lmxhc3RJbmRleE9mKFwiLlwiKSkgKyAxKSArXG5cdFx0XHRcdFx0JyA6IFwiICsgJyArXG5cdFx0XHRcdFx0XCIke1wiICtcblx0XHRcdFx0XHRvUHJvcGVydHkucHJvcGVydHkgK1xuXHRcdFx0XHRcdCd9ICsgXCI8L3A+XCIpIDogXCJcIiApJ1xuXHRcdFx0OiBcIlwiO1xuXHR9XG5cdC8vIEluc2VydCBncm91cG5hbWUgaWYgaXQgZXhpc3RzXG5cdGZ1bmN0aW9uIGluc2VydEdyb3VwTmFtZShvUHJvcGVydHk6IGFueSkge1xuXHRcdGxldCBzSFRNTCA9IFwiXCI7XG5cdFx0aWYgKG9Qcm9wZXJ0eS5ncm91cE5hbWUgJiYgb1Byb3BlcnR5LnByb3BlcnR5ICYmIG9Qcm9wZXJ0eS5ncm91cE5hbWUgIT09IHNQcmV2aW91c0dyb3VwTmFtZSkge1xuXHRcdFx0c0hUTUwgKz0gXCIoICR7XCIgKyBvUHJvcGVydHkucHJvcGVydHkgKyAnfSA/IFwiPGJyPjxoMz4nICsgb1Byb3BlcnR5Lmdyb3VwTmFtZSArICc8L2gzPlwiIDogXCJcIiApICsgJztcblx0XHRcdHNQcmV2aW91c0dyb3VwTmFtZSA9IG9Qcm9wZXJ0eS5ncm91cE5hbWU7XG5cdFx0fVxuXHRcdHJldHVybiBzSFRNTDtcblx0fVxuXG5cdC8vIExpc3Qgb2YgdGVjaG5pY2FsIGRldGFpbHMgdG8gYmUgc2hvd25cblx0ZnVuY3Rpb24gZ2V0UGF0aHMoKSB7XG5cdFx0Y29uc3Qgc1REID0gXCJ0ZWNobmljYWxEZXRhaWxzXCI7IC8vIG5hbWUgb2YgcHJvcGVydHkgaW4gbWVzc2FnZSBtb2RlbCBkYXRhIGZvciB0ZWNobmljYWwgZGV0YWlsc1xuXHRcdHJldHVybiBbXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJcIiwgcHJvcGVydHk6IGAke3NURH0vc3RhdHVzYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiXCIsIHByb3BlcnR5OiBgJHtzVER9L3N0YXR1c1RleHRgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJBcHBsaWNhdGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uQXBwbGljYXRpb24vQ29tcG9uZW50SWRgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJBcHBsaWNhdGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uQXBwbGljYXRpb24vU2VydmljZUlkYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiQXBwbGljYXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkFwcGxpY2F0aW9uL1NlcnZpY2VSZXBvc2l0b3J5YCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiQXBwbGljYXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkFwcGxpY2F0aW9uL1NlcnZpY2VWZXJzaW9uYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiRXJyb3JSZXNvbHV0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5FcnJvclJlc29sdXRpb24vQW5hbHlzaXNgIH0sXG5cdFx0XHR7IGdyb3VwTmFtZTogXCJFcnJvclJlc29sdXRpb25cIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkVycm9yUmVzb2x1dGlvbi9Ob3RlYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiRXJyb3JSZXNvbHV0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5FcnJvclJlc29sdXRpb24vRGV0YWlsZWROb3RlYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiRXJyb3JSZXNvbHV0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5FeGNlcHRpb25DYXRlZ29yeWAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIkVycm9yUmVzb2x1dGlvblwiLCBwcm9wZXJ0eTogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uVGltZVN0YW1wYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiRXJyb3JSZXNvbHV0aW9uXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5UcmFuc2FjdGlvbklkYCB9LFxuXHRcdFx0eyBncm91cE5hbWU6IFwiTWVzc2FnZXNcIiwgcHJvcGVydHk6IGAke3NURH0vZXJyb3IvY29kZWAgfSxcblx0XHRcdHsgZ3JvdXBOYW1lOiBcIk1lc3NhZ2VzXCIsIHByb3BlcnR5OiBgJHtzVER9L2Vycm9yL21lc3NhZ2VgIH1cblx0XHRdO1xuXHR9XG5cblx0bGV0IHNIVE1MID0gXCJPYmplY3Qua2V5cyhcIiArIFwiJHt0ZWNobmljYWxEZXRhaWxzfVwiICsgJykubGVuZ3RoID4gMCA/IFwiPGgyPlRlY2huaWNhbCBEZXRhaWxzPC9oMj5cIiA6IFwiXCIgJztcblx0Z2V0UGF0aHMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvUHJvcGVydHk6IHsgZ3JvdXBOYW1lOiBzdHJpbmc7IHByb3BlcnR5OiBzdHJpbmcgfSkge1xuXHRcdHNIVE1MID0gYCR7c0hUTUwgKyBpbnNlcnRHcm91cE5hbWUob1Byb3BlcnR5KX0ke2luc2VydERldGFpbChvUHJvcGVydHkpfSArIGA7XG5cdH0pO1xuXHRyZXR1cm4gc0hUTUw7XG59XG5mdW5jdGlvbiBmbkZvcm1hdERlc2NyaXB0aW9uKCkge1xuXHRyZXR1cm4gXCIoJHtcIiArICdkZXNjcmlwdGlvbn0gPyAoJHsnICsgJ2Rlc2NyaXB0aW9ufSkgOiBcIlwiKSc7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgbWVzc2FnZSB0eXBlKEVycm9yL1dhcm5pbmcvU3VjY2Vzcy9JbmZvcm1hdGlvbikgZnJvbSB0aGUgYXZhaWxhYmxlIG1lc3NhZ2VzLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5tZXNzYWdlSGFuZGxpbmcuZm5HZXRIaWdoZXN0TWVzc2FnZVByaW9yaXR5XG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuYWN0aW9ucy5tZXNzYWdlSGFuZGxpbmdcbiAqIEBwYXJhbSBbYU1lc3NhZ2VzXSBNZXNzYWdlcyBsaXN0XG4gKiBAcmV0dXJucyBIaWdoZXN0IHByaW9yaXR5IG1lc3NhZ2UgZnJvbSB0aGUgYXZhaWxhYmxlIG1lc3NhZ2VzXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGZuR2V0SGlnaGVzdE1lc3NhZ2VQcmlvcml0eShhTWVzc2FnZXM6IGFueVtdKSB7XG5cdGxldCBzTWVzc2FnZVByaW9yaXR5ID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0Y29uc3QgaUxlbmd0aCA9IGFNZXNzYWdlcy5sZW5ndGg7XG5cdGNvbnN0IG9NZXNzYWdlQ291bnQ6IGFueSA9IHsgRXJyb3I6IDAsIFdhcm5pbmc6IDAsIFN1Y2Nlc3M6IDAsIEluZm9ybWF0aW9uOiAwIH07XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpTGVuZ3RoOyBpKyspIHtcblx0XHQrK29NZXNzYWdlQ291bnRbYU1lc3NhZ2VzW2ldLmdldFR5cGUoKV07XG5cdH1cblx0aWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuRXJyb3JdID4gMCkge1xuXHRcdHNNZXNzYWdlUHJpb3JpdHkgPSBNZXNzYWdlVHlwZS5FcnJvcjtcblx0fSBlbHNlIGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLldhcm5pbmddID4gMCkge1xuXHRcdHNNZXNzYWdlUHJpb3JpdHkgPSBNZXNzYWdlVHlwZS5XYXJuaW5nO1xuXHR9IGVsc2UgaWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuU3VjY2Vzc10gPiAwKSB7XG5cdFx0c01lc3NhZ2VQcmlvcml0eSA9IE1lc3NhZ2VUeXBlLlN1Y2Nlc3M7XG5cdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5JbmZvcm1hdGlvbl0gPiAwKSB7XG5cdFx0c01lc3NhZ2VQcmlvcml0eSA9IE1lc3NhZ2VUeXBlLkluZm9ybWF0aW9uO1xuXHR9XG5cdHJldHVybiBzTWVzc2FnZVByaW9yaXR5O1xufVxuLy8gZnVuY3Rpb24gd2hpY2ggbW9kaWZ5IGUtVGFnIG1lc3NhZ2VzIG9ubHkuXG4vLyByZXR1cm5zIDogdHJ1ZSwgaWYgYW55IGUtVGFnIG1lc3NhZ2UgaXMgbW9kaWZpZWQsIG90aGVyd2lzZSBmYWxzZS5cbmZ1bmN0aW9uIGZuTW9kaWZ5RVRhZ01lc3NhZ2VzT25seShvTWVzc2FnZU1hbmFnZXI6IGFueSwgb1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSwgY29uY3VycmVudEVkaXRGbGFnOiBib29sZWFuIHwgdW5kZWZpbmVkKSB7XG5cdGNvbnN0IGFNZXNzYWdlcyA9IG9NZXNzYWdlTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5nZXRPYmplY3QoXCIvXCIpO1xuXHRsZXQgYk1lc3NhZ2VzTW9kaWZpZWQgPSBmYWxzZTtcblx0bGV0IHNFdGFnTWVzc2FnZSA9IFwiXCI7XG5cdGFNZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55LCBpOiBhbnkpIHtcblx0XHRjb25zdCBvVGVjaG5pY2FsRGV0YWlscyA9IG9NZXNzYWdlLmdldFRlY2huaWNhbERldGFpbHMgJiYgb01lc3NhZ2UuZ2V0VGVjaG5pY2FsRGV0YWlscygpO1xuXHRcdGlmIChvVGVjaG5pY2FsRGV0YWlscyAmJiBvVGVjaG5pY2FsRGV0YWlscy5odHRwU3RhdHVzID09PSA0MTIgJiYgb1RlY2huaWNhbERldGFpbHMuaXNDb25jdXJyZW50TW9kaWZpY2F0aW9uKSB7XG5cdFx0XHRpZiAoY29uY3VycmVudEVkaXRGbGFnKSB7XG5cdFx0XHRcdHNFdGFnTWVzc2FnZSA9XG5cdFx0XHRcdFx0c0V0YWdNZXNzYWdlIHx8IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19BUFBfQ09NUE9ORU5UX1NBUEZFX0VUQUdfVEVDSE5JQ0FMX0lTU1VFU19DT05DVVJSRU5UX01PRElGSUNBVElPTlwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNFdGFnTWVzc2FnZSA9IHNFdGFnTWVzc2FnZSB8fCBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQVBQX0NPTVBPTkVOVF9TQVBGRV9FVEFHX1RFQ0hOSUNBTF9JU1NVRVNcIik7XG5cdFx0XHR9XG5cdFx0XHRvTWVzc2FnZU1hbmFnZXIucmVtb3ZlTWVzc2FnZXMoYU1lc3NhZ2VzW2ldKTtcblx0XHRcdG9NZXNzYWdlLnNldE1lc3NhZ2Uoc0V0YWdNZXNzYWdlKTtcblx0XHRcdG9NZXNzYWdlLnRhcmdldCA9IFwiXCI7XG5cdFx0XHRvTWVzc2FnZU1hbmFnZXIuYWRkTWVzc2FnZXMob01lc3NhZ2UpO1xuXHRcdFx0Yk1lc3NhZ2VzTW9kaWZpZWQgPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBiTWVzc2FnZXNNb2RpZmllZDtcbn1cbi8vIERpYWxvZyBjbG9zZSBIYW5kbGluZ1xuZnVuY3Rpb24gZGlhbG9nQ2xvc2VIYW5kbGVyKCkge1xuXHRvRGlhbG9nLmNsb3NlKCk7XG5cdG9CYWNrQnV0dG9uLnNldFZpc2libGUoZmFsc2UpO1xuXHRhTWVzc2FnZUxpc3QgPSBbXTtcblx0Y29uc3Qgb01lc3NhZ2VEaWFsb2dNb2RlbDogYW55ID0gb01lc3NhZ2VWaWV3LmdldE1vZGVsKCk7XG5cdGlmIChvTWVzc2FnZURpYWxvZ01vZGVsKSB7XG5cdFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5zZXREYXRhKHt9KTtcblx0fVxuXHRyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG59XG5mdW5jdGlvbiBnZXRSZXRyeUFmdGVyTWVzc2FnZShvTWVzc2FnZTogYW55LCBiTWVzc2FnZURpYWxvZz86IGFueSkge1xuXHRjb25zdCBkTm93ID0gbmV3IERhdGUoKTtcblx0Y29uc3Qgb1RlY2huaWNhbERldGFpbHMgPSBvTWVzc2FnZS5nZXRUZWNobmljYWxEZXRhaWxzKCk7XG5cdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdGxldCBzUmV0cnlBZnRlck1lc3NhZ2U7XG5cdGlmIChvVGVjaG5pY2FsRGV0YWlscyAmJiBvVGVjaG5pY2FsRGV0YWlscy5odHRwU3RhdHVzID09PSA1MDMgJiYgb1RlY2huaWNhbERldGFpbHMucmV0cnlBZnRlcikge1xuXHRcdGNvbnN0IGRSZXRyeUFmdGVyID0gb1RlY2huaWNhbERldGFpbHMucmV0cnlBZnRlcjtcblx0XHRsZXQgb0RhdGVGb3JtYXQ7XG5cdFx0aWYgKGROb3cuZ2V0RnVsbFllYXIoKSAhPT0gZFJldHJ5QWZ0ZXIuZ2V0RnVsbFllYXIoKSkge1xuXHRcdFx0Ly9kaWZmZXJlbnQgeWVhcnNcblx0XHRcdG9EYXRlRm9ybWF0ID0gRGF0ZUZvcm1hdC5nZXREYXRlVGltZUluc3RhbmNlKHtcblx0XHRcdFx0cGF0dGVybjogXCJNTU1NIGRkLCB5eXl5ICdhdCcgaGg6bW0gYVwiXG5cdFx0XHR9KTtcblx0XHRcdHNSZXRyeUFmdGVyTWVzc2FnZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19FUlJPUlwiLCBbb0RhdGVGb3JtYXQuZm9ybWF0KGRSZXRyeUFmdGVyKV0pO1xuXHRcdH0gZWxzZSBpZiAoZE5vdy5nZXRGdWxsWWVhcigpID09IGRSZXRyeUFmdGVyLmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdC8vc2FtZSB5ZWFyXG5cdFx0XHRpZiAoYk1lc3NhZ2VEaWFsb2cpIHtcblx0XHRcdFx0Ly9sZXNzIHRoYW4gMiBtaW5cblx0XHRcdFx0c1JldHJ5QWZ0ZXJNZXNzYWdlID0gYCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX1RJVExFXCIpfSAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFxuXHRcdFx0XHRcdFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19ERVNDXCJcblx0XHRcdFx0KX1gO1xuXHRcdFx0fSBlbHNlIGlmIChkTm93LmdldE1vbnRoKCkgIT09IGRSZXRyeUFmdGVyLmdldE1vbnRoKCkgfHwgZE5vdy5nZXREYXRlKCkgIT09IGRSZXRyeUFmdGVyLmdldERhdGUoKSkge1xuXHRcdFx0XHRvRGF0ZUZvcm1hdCA9IERhdGVGb3JtYXQuZ2V0RGF0ZVRpbWVJbnN0YW5jZSh7XG5cdFx0XHRcdFx0cGF0dGVybjogXCJNTU1NIGRkICdhdCcgaGg6bW0gYVwiXG5cdFx0XHRcdH0pOyAvL2RpZmZlcmVudCBtb250aHMgb3IgZGlmZmVyZW50IGRheXMgb2Ygc2FtZSBtb250aFxuXHRcdFx0XHRzUmV0cnlBZnRlck1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfRVJST1JcIiwgW29EYXRlRm9ybWF0LmZvcm1hdChkUmV0cnlBZnRlcildKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vc2FtZSBkYXlcblx0XHRcdFx0b0RhdGVGb3JtYXQgPSBEYXRlRm9ybWF0LmdldERhdGVUaW1lSW5zdGFuY2Uoe1xuXHRcdFx0XHRcdHBhdHRlcm46IFwiaGg6bW0gYVwiXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzUmV0cnlBZnRlck1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfRVJST1JfREFZXCIsIFtvRGF0ZUZvcm1hdC5mb3JtYXQoZFJldHJ5QWZ0ZXIpXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aWYgKG9UZWNobmljYWxEZXRhaWxzICYmIG9UZWNobmljYWxEZXRhaWxzLmh0dHBTdGF0dXMgPT09IDUwMyAmJiAhb1RlY2huaWNhbERldGFpbHMucmV0cnlBZnRlcikge1xuXHRcdHNSZXRyeUFmdGVyTWVzc2FnZSA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19FUlJPUl9OT19SRVRSWV9BRlRFUlwiKTtcblx0fVxuXHRyZXR1cm4gc1JldHJ5QWZ0ZXJNZXNzYWdlO1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlTWVzc2FnZVZpZXdGb3JEaWFsb2cob01lc3NhZ2VEaWFsb2dNb2RlbDogSlNPTk1vZGVsLCBiU3RyaWN0SGFuZGxpbmdGbG93OiBib29sZWFuLCBtdWx0aTQxMj86IGJvb2xlYW4pIHtcblx0bGV0IG9NZXNzYWdlVGVtcGxhdGU6IE1lc3NhZ2VJdGVtO1xuXHRpZiAoIWJTdHJpY3RIYW5kbGluZ0Zsb3cpIHtcblx0XHRjb25zdCBkZXNjcmlwdGlvbkJpbmRpbmcgPSAnez0gJHtkZXNjcmlwdGlvbn0gPyBcIjxodG1sPjxib2R5PlwiICsgJyArIGZuRm9ybWF0RGVzY3JpcHRpb24oKSArICcgKyBcIjwvaHRtbD48L2JvZHk+XCIgOiBcIlwiIH0nO1xuXHRcdGNvbnN0IHRlY2huaWNhbERldGFpbHNCaW5kaW5nID1cblx0XHRcdCd7PSAke3RlY2huaWNhbERldGFpbHN9ID8gXCI8aHRtbD48Ym9keT5cIiArICcgKyBmbkZvcm1hdFRlY2huaWNhbERldGFpbHMoKSArICcgKyBcIjwvaHRtbD48L2JvZHk+XCIgOiBcIlwiIH0nO1xuXHRcdG9NZXNzYWdlVGVtcGxhdGUgPSBuZXcgTWVzc2FnZUl0ZW0odW5kZWZpbmVkLCB7XG5cdFx0XHRjb3VudGVyOiB7IHBhdGg6IFwiY291bnRlclwiIH0sXG5cdFx0XHR0aXRsZTogXCJ7bWVzc2FnZX1cIixcblx0XHRcdHN1YnRpdGxlOiBcInthZGRpdGlvbmFsVGV4dH1cIixcblx0XHRcdGxvbmd0ZXh0VXJsOiBcIntkZXNjcmlwdGlvblVybH1cIixcblx0XHRcdHR5cGU6IHsgcGF0aDogXCJ0eXBlXCIgfSxcblx0XHRcdGdyb3VwTmFtZTogXCJ7aGVhZGVyTmFtZX1cIixcblx0XHRcdGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbkJpbmRpbmcgKyB0ZWNobmljYWxEZXRhaWxzQmluZGluZyxcblx0XHRcdG1hcmt1cERlc2NyaXB0aW9uOiB0cnVlXG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAobXVsdGk0MTIpIHtcblx0XHRvTWVzc2FnZVRlbXBsYXRlID0gbmV3IE1lc3NhZ2VJdGVtKHVuZGVmaW5lZCwge1xuXHRcdFx0Y291bnRlcjogeyBwYXRoOiBcImNvdW50ZXJcIiB9LFxuXHRcdFx0dGl0bGU6IFwie21lc3NhZ2V9XCIsXG5cdFx0XHRzdWJ0aXRsZTogXCJ7YWRkaXRpb25hbFRleHR9XCIsXG5cdFx0XHRsb25ndGV4dFVybDogXCJ7ZGVzY3JpcHRpb25Vcmx9XCIsXG5cdFx0XHR0eXBlOiB7IHBhdGg6IFwidHlwZVwiIH0sXG5cdFx0XHRkZXNjcmlwdGlvbjogXCJ7ZGVzY3JpcHRpb259XCIsXG5cdFx0XHRtYXJrdXBEZXNjcmlwdGlvbjogdHJ1ZVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdG9NZXNzYWdlVGVtcGxhdGUgPSBuZXcgTWVzc2FnZUl0ZW0oe1xuXHRcdFx0dGl0bGU6IFwie21lc3NhZ2V9XCIsXG5cdFx0XHR0eXBlOiB7IHBhdGg6IFwidHlwZVwiIH0sXG5cdFx0XHRsb25ndGV4dFVybDogXCJ7ZGVzY3JpcHRpb25Vcmx9XCJcblx0XHR9KTtcblx0fVxuXHRvTWVzc2FnZVZpZXcgPSBuZXcgTWVzc2FnZVZpZXcoe1xuXHRcdHNob3dEZXRhaWxzUGFnZUhlYWRlcjogZmFsc2UsXG5cdFx0aXRlbVNlbGVjdDogZnVuY3Rpb24gKCkge1xuXHRcdFx0b0JhY2tCdXR0b24uc2V0VmlzaWJsZSh0cnVlKTtcblx0XHR9LFxuXHRcdGl0ZW1zOiB7XG5cdFx0XHRwYXRoOiBcIi9cIixcblx0XHRcdHRlbXBsYXRlOiBvTWVzc2FnZVRlbXBsYXRlXG5cdFx0fVxuXHR9KTtcblx0b01lc3NhZ2VWaWV3LnNldEdyb3VwSXRlbXModHJ1ZSk7XG5cdG9CYWNrQnV0dG9uID1cblx0XHRvQmFja0J1dHRvbiB8fFxuXHRcdG5ldyBCdXR0b24oe1xuXHRcdFx0aWNvbjogSWNvblBvb2wuZ2V0SWNvblVSSShcIm5hdi1iYWNrXCIpLFxuXHRcdFx0dmlzaWJsZTogZmFsc2UsXG5cdFx0XHRwcmVzczogZnVuY3Rpb24gKHRoaXM6IEJ1dHRvbikge1xuXHRcdFx0XHRvTWVzc2FnZVZpZXcubmF2aWdhdGVCYWNrKCk7XG5cdFx0XHRcdHRoaXMuc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdC8vIFVwZGF0ZSBwcm9wZXIgRVRhZyBNaXNtYXRjaCBlcnJvclxuXHRvTWVzc2FnZVZpZXcuc2V0TW9kZWwob01lc3NhZ2VEaWFsb2dNb2RlbCk7XG5cdHJldHVybiB7XG5cdFx0b01lc3NhZ2VWaWV3LFxuXHRcdG9CYWNrQnV0dG9uXG5cdH07XG59XG5cbmZ1bmN0aW9uIHNob3dVbmJvdW5kTWVzc2FnZXMoXG5cdHRoaXM6IG1lc3NhZ2VIYW5kbGluZ1R5cGUsXG5cdGFDdXN0b21NZXNzYWdlcz86IGFueVtdLFxuXHRvQ29udGV4dD86IGFueSxcblx0YlNob3dCb3VuZFRyYW5zaXRpb24/OiBib29sZWFuLFxuXHRjb25jdXJyZW50RWRpdEZsYWc/OiBib29sZWFuLFxuXHRjb250cm9sPzogQ29udHJvbCxcblx0c0FjdGlvbk5hbWU/OiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdGJPbmx5Rm9yVGVzdD86IGJvb2xlYW4sXG5cdG9uQmVmb3JlU2hvd01lc3NhZ2U/OiAobWVzc2FnZXM6IGFueSwgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzOiBhbnkpID0+IGFueSxcblx0dmlld1R5cGU/OiBzdHJpbmdcbik6IFByb21pc2U8YW55PiB7XG5cdGxldCBhVHJhbnNpdGlvbk1lc3NhZ2VzID0gdGhpcy5nZXRNZXNzYWdlcygpO1xuXHRjb25zdCBvTWVzc2FnZU1hbmFnZXIgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cdGxldCBzSGlnaGVzdFByaW9yaXR5O1xuXHRsZXQgc0hpZ2hlc3RQcmlvcml0eVRleHQ7XG5cdGNvbnN0IGFGaWx0ZXJzID0gW25ldyBGaWx0ZXIoeyBwYXRoOiBcInBlcnNpc3RlbnRcIiwgb3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLk5FLCB2YWx1ZTE6IGZhbHNlIH0pXTtcblx0bGV0IHNob3dNZXNzYWdlRGlhbG9nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gZmFsc2UsXG5cdFx0c2hvd01lc3NhZ2VCb3g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSBmYWxzZTtcblxuXHRpZiAoYlNob3dCb3VuZFRyYW5zaXRpb24pIHtcblx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzID0gYVRyYW5zaXRpb25NZXNzYWdlcy5jb25jYXQoZ2V0TWVzc2FnZXModHJ1ZSwgdHJ1ZSkpO1xuXHRcdC8vIHdlIG9ubHkgd2FudCB0byBzaG93IGJvdW5kIHRyYW5zaXRpb24gbWVzc2FnZXMgbm90IGJvdW5kIHN0YXRlIG1lc3NhZ2VzIGhlbmNlIGFkZCBhIGZpbHRlciBmb3IgdGhlIHNhbWVcblx0XHRhRmlsdGVycy5wdXNoKG5ldyBGaWx0ZXIoeyBwYXRoOiBcInBlcnNpc3RlbnRcIiwgb3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLCB2YWx1ZTE6IHRydWUgfSkpO1xuXHRcdGNvbnN0IGZuQ2hlY2tDb250cm9sSWRJbkRpYWxvZyA9IGZ1bmN0aW9uIChhQ29udHJvbElkczogYW55KSB7XG5cdFx0XHRsZXQgaW5kZXggPSBJbmZpbml0eSxcblx0XHRcdFx0b0NvbnRyb2wgPSBDb3JlLmJ5SWQoYUNvbnRyb2xJZHNbMF0pIGFzIE1hbmFnZWRPYmplY3QgfCBudWxsO1xuXHRcdFx0Y29uc3QgZXJyb3JGaWVsZENvbnRyb2wgPSBDb3JlLmJ5SWQoYUNvbnRyb2xJZHNbMF0pIGFzIENvbnRyb2w7XG5cdFx0XHR3aGlsZSAob0NvbnRyb2wpIHtcblx0XHRcdFx0Y29uc3QgZmllbGRSYW5raW5EaWFsb2cgPVxuXHRcdFx0XHRcdG9Db250cm9sIGluc3RhbmNlb2YgRGlhbG9nXG5cdFx0XHRcdFx0XHQ/IChlcnJvckZpZWxkQ29udHJvbC5nZXRQYXJlbnQoKSBhcyBhbnkpLmZpbmRFbGVtZW50cyh0cnVlKS5pbmRleE9mKGVycm9yRmllbGRDb250cm9sKVxuXHRcdFx0XHRcdFx0OiBJbmZpbml0eTtcblx0XHRcdFx0aWYgKG9Db250cm9sIGluc3RhbmNlb2YgRGlhbG9nKSB7XG5cdFx0XHRcdFx0aWYgKGluZGV4ID4gZmllbGRSYW5raW5EaWFsb2cpIHtcblx0XHRcdFx0XHRcdGluZGV4ID0gZmllbGRSYW5raW5EaWFsb2c7XG5cdFx0XHRcdFx0XHQvLyBTZXQgdGhlIGZvY3VzIHRvIHRoZSBkaWFsb2cncyBjb250cm9sXG5cdFx0XHRcdFx0XHRlcnJvckZpZWxkQ29udHJvbC5mb2N1cygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBtZXNzYWdlcyB3aXRoIHRhcmdldCBpbnNpZGUgc2FwLm0uRGlhbG9nIHNob3VsZCBub3QgYnJpbmcgdXAgdGhlIG1lc3NhZ2UgZGlhbG9nXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9O1xuXHRcdGFGaWx0ZXJzLnB1c2goXG5cdFx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdFx0cGF0aDogXCJjb250cm9sSWRzXCIsXG5cdFx0XHRcdHRlc3Q6IGZuQ2hlY2tDb250cm9sSWRJbkRpYWxvZyxcblx0XHRcdFx0Y2FzZVNlbnNpdGl2ZTogdHJ1ZVxuXHRcdFx0fSlcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdC8vIG9ubHkgdW5ib3VuZCBtZXNzYWdlcyBoYXZlIHRvIGJlIHNob3duIHNvIGFkZCBmaWx0ZXIgYWNjb3JkaW5nbHlcblx0XHRhRmlsdGVycy5wdXNoKG5ldyBGaWx0ZXIoeyBwYXRoOiBcInRhcmdldFwiLCBvcGVyYXRvcjogRmlsdGVyT3BlcmF0b3IuRVEsIHZhbHVlMTogXCJcIiB9KSk7XG5cdH1cblx0aWYgKGFDdXN0b21NZXNzYWdlcyAmJiBhQ3VzdG9tTWVzc2FnZXMubGVuZ3RoKSB7XG5cdFx0YUN1c3RvbU1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG9NZXNzYWdlOiBhbnkpIHtcblx0XHRcdGNvbnN0IG1lc3NhZ2VDb2RlID0gb01lc3NhZ2UuY29kZSA/IG9NZXNzYWdlLmNvZGUgOiBcIlwiO1xuXHRcdFx0b01lc3NhZ2VNYW5hZ2VyLmFkZE1lc3NhZ2VzKFxuXHRcdFx0XHRuZXcgTWVzc2FnZSh7XG5cdFx0XHRcdFx0bWVzc2FnZTogb01lc3NhZ2UudGV4dCxcblx0XHRcdFx0XHR0eXBlOiBvTWVzc2FnZS50eXBlLFxuXHRcdFx0XHRcdHRhcmdldDogXCJcIixcblx0XHRcdFx0XHRwZXJzaXN0ZW50OiB0cnVlLFxuXHRcdFx0XHRcdGNvZGU6IG1lc3NhZ2VDb2RlXG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdFx0Ly9UaGUgdGFyZ2V0IGFuZCBwZXJzaXN0ZW50IHByb3BlcnRpZXMgb2YgdGhlIG1lc3NhZ2UgYXJlIGhhcmRjb2RlZCBhcyBcIlwiIGFuZCB0cnVlIGJlY2F1c2UgdGhlIGZ1bmN0aW9uIGRlYWxzIHdpdGggb25seSB1bmJvdW5kIG1lc3NhZ2VzLlxuXHRcdH0pO1xuXHR9XG5cdGNvbnN0IG9NZXNzYWdlRGlhbG9nTW9kZWwgPSAob01lc3NhZ2VWaWV3ICYmIChvTWVzc2FnZVZpZXcuZ2V0TW9kZWwoKSBhcyBKU09OTW9kZWwpKSB8fCBuZXcgSlNPTk1vZGVsKCk7XG5cdGNvbnN0IGJIYXNFdGFnTWVzc2FnZSA9IHRoaXMubW9kaWZ5RVRhZ01lc3NhZ2VzT25seShvTWVzc2FnZU1hbmFnZXIsIENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIiksIGNvbmN1cnJlbnRFZGl0RmxhZyk7XG5cblx0aWYgKGFUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoID09PSAxICYmIGFUcmFuc2l0aW9uTWVzc2FnZXNbMF0uZ2V0Q29kZSgpID09PSBcIjUwM1wiKSB7XG5cdFx0c2hvd01lc3NhZ2VCb3ggPSB0cnVlO1xuXHR9IGVsc2UgaWYgKGFUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoICE9PSAwKSB7XG5cdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSB0cnVlO1xuXHR9XG5cdGxldCBzaG93TWVzc2FnZVBhcmFtZXRlcnM6IGFueTtcblx0bGV0IGFNb2RlbERhdGFBcnJheTogTWVzc2FnZVdpdGhIZWFkZXJbXSA9IFtdO1xuXHRpZiAoc2hvd01lc3NhZ2VEaWFsb2cgfHwgKCFzaG93TWVzc2FnZUJveCAmJiAhb25CZWZvcmVTaG93TWVzc2FnZSkpIHtcblx0XHRjb25zdCBvTGlzdEJpbmRpbmcgPSBvTWVzc2FnZU1hbmFnZXIuZ2V0TWVzc2FnZU1vZGVsKCkuYmluZExpc3QoXCIvXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBhRmlsdGVycyksXG5cdFx0XHRhQ3VycmVudENvbnRleHRzID0gb0xpc3RCaW5kaW5nLmdldEN1cnJlbnRDb250ZXh0cygpO1xuXHRcdGlmIChhQ3VycmVudENvbnRleHRzICYmIGFDdXJyZW50Q29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSB0cnVlO1xuXHRcdFx0Ly8gRG9uJ3Qgc2hvdyBkaWFsb2cgaW5jYXNlIHRoZXJlIGFyZSBubyBlcnJvcnMgdG8gc2hvd1xuXG5cdFx0XHQvLyBpZiBmYWxzZSwgc2hvdyBtZXNzYWdlcyBpbiBkaWFsb2dcblx0XHRcdC8vIEFzIGZpdGVyaW5nIGhhcyBhbHJlYWR5IGhhcHBlbmVkIGhlcmUgaGVuY2Vcblx0XHRcdC8vIHVzaW5nIHRoZSBtZXNzYWdlIG1vZGVsIGFnYWluIGZvciB0aGUgbWVzc2FnZSBkaWFsb2cgdmlldyBhbmQgdGhlbiBmaWx0ZXJpbmcgb24gdGhhdCBiaW5kaW5nIGFnYWluIGlzIHVubmVjZXNzYXJ5LlxuXHRcdFx0Ly8gU28gd2UgY3JlYXRlIG5ldyBqc29uIG1vZGVsIHRvIHVzZSBmb3IgdGhlIG1lc3NhZ2UgZGlhbG9nIHZpZXcuXG5cdFx0XHRjb25zdCBhTWVzc2FnZXM6IGFueVtdID0gW107XG5cdFx0XHRhQ3VycmVudENvbnRleHRzLmZvckVhY2goZnVuY3Rpb24gKGN1cnJlbnRDb250ZXh0OiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgb01lc3NhZ2UgPSBjdXJyZW50Q29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0YU1lc3NhZ2VzLnB1c2gob01lc3NhZ2UpO1xuXHRcdFx0XHRhTWVzc2FnZURhdGFMaXN0ID0gYU1lc3NhZ2VzO1xuXHRcdFx0fSk7XG5cdFx0XHRsZXQgZXhpc3RpbmdNZXNzYWdlczogYW55W10gPSBbXTtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG9NZXNzYWdlRGlhbG9nTW9kZWwuZ2V0RGF0YSgpKSkge1xuXHRcdFx0XHRleGlzdGluZ01lc3NhZ2VzID0gb01lc3NhZ2VEaWFsb2dNb2RlbC5nZXREYXRhKCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBvVW5pcXVlT2JqOiBhbnkgPSB7fTtcblxuXHRcdFx0YU1vZGVsRGF0YUFycmF5ID0gYU1lc3NhZ2VEYXRhTGlzdC5jb25jYXQoZXhpc3RpbmdNZXNzYWdlcykuZmlsdGVyKGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdFx0Ly8gcmVtb3ZlIGVudHJpZXMgaGF2aW5nIGR1cGxpY2F0ZSBtZXNzYWdlIGlkc1xuXHRcdFx0XHRyZXR1cm4gIW9VbmlxdWVPYmpbb2JqLmlkXSAmJiAob1VuaXF1ZU9ialtvYmouaWRdID0gdHJ1ZSk7XG5cdFx0XHR9KTtcblx0XHRcdG9NZXNzYWdlRGlhbG9nTW9kZWwuc2V0RGF0YShhTW9kZWxEYXRhQXJyYXkpO1xuXHRcdH1cblx0fVxuXHRpZiAob25CZWZvcmVTaG93TWVzc2FnZSkge1xuXHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycyA9IHsgc2hvd01lc3NhZ2VCb3gsIHNob3dNZXNzYWdlRGlhbG9nIH07XG5cdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzID0gb25CZWZvcmVTaG93TWVzc2FnZShhVHJhbnNpdGlvbk1lc3NhZ2VzLCBzaG93TWVzc2FnZVBhcmFtZXRlcnMpO1xuXHRcdHNob3dNZXNzYWdlQm94ID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlQm94O1xuXHRcdHNob3dNZXNzYWdlRGlhbG9nID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlRGlhbG9nO1xuXHRcdGlmIChzaG93TWVzc2FnZURpYWxvZyB8fCBzaG93TWVzc2FnZVBhcmFtZXRlcnMuc2hvd0NoYW5nZVNldEVycm9yRGlhbG9nKSB7XG5cdFx0XHRhTW9kZWxEYXRhQXJyYXkgPSBzaG93TWVzc2FnZVBhcmFtZXRlcnMuZmlsdGVyZWRNZXNzYWdlcyA/IHNob3dNZXNzYWdlUGFyYW1ldGVycy5maWx0ZXJlZE1lc3NhZ2VzIDogYU1vZGVsRGF0YUFycmF5O1xuXHRcdH1cblx0fVxuXHRpZiAoYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggPT09IDAgJiYgIWFDdXN0b21NZXNzYWdlcyAmJiAhYkhhc0V0YWdNZXNzYWdlKSB7XG5cdFx0Ly8gRG9uJ3Qgc2hvdyB0aGUgcG9wdXAgaWYgdGhlcmUgYXJlIG5vIHRyYW5zaWVudCBtZXNzYWdlc1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdH0gZWxzZSBpZiAoYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggPT09IDEgJiYgYVRyYW5zaXRpb25NZXNzYWdlc1swXS5nZXRUeXBlKCkgPT09IE1lc3NhZ2VUeXBlLlN1Y2Nlc3MgJiYgIWFDdXN0b21NZXNzYWdlcykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuXHRcdFx0TWVzc2FnZVRvYXN0LnNob3coYVRyYW5zaXRpb25NZXNzYWdlc1swXS5tZXNzYWdlKTtcblx0XHRcdGlmIChvTWVzc2FnZURpYWxvZ01vZGVsKSB7XG5cdFx0XHRcdG9NZXNzYWdlRGlhbG9nTW9kZWwuc2V0RGF0YSh7fSk7XG5cdFx0XHR9XG5cdFx0XHRvTWVzc2FnZU1hbmFnZXIucmVtb3ZlTWVzc2FnZXMoYVRyYW5zaXRpb25NZXNzYWdlcyk7XG5cdFx0XHRyZXNvbHZlKCk7XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoc2hvd01lc3NhZ2VEaWFsb2cpIHtcblx0XHRtZXNzYWdlSGFuZGxpbmcudXBkYXRlTWVzc2FnZU9iamVjdEdyb3VwTmFtZShhTW9kZWxEYXRhQXJyYXksIGNvbnRyb2wsIHNBY3Rpb25OYW1lLCB2aWV3VHlwZSk7XG5cdFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5zZXREYXRhKGFNb2RlbERhdGFBcnJheSk7IC8vIHNldCB0aGUgbWVzc2FnZXMgaGVyZSBzbyB0aGF0IGlmIGFueSBvZiB0aGVtIGFyZSBmaWx0ZXJlZCBmb3IgQVBELCB0aGV5IGFyZSBmaWx0ZXJlZCBoZXJlIGFzIHdlbGwuXG5cdFx0YVJlc29sdmVGdW5jdGlvbnMgPSBhUmVzb2x2ZUZ1bmN0aW9ucyB8fCBbXTtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdGFSZXNvbHZlRnVuY3Rpb25zLnB1c2gocmVzb2x2ZSk7XG5cdFx0XHRDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIsIHRydWUpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgYlN0cmljdEhhbmRsaW5nRmxvdyA9IGZhbHNlO1xuXHRcdFx0XHRcdGlmIChzaG93TWVzc2FnZVBhcmFtZXRlcnMgJiYgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLmZuR2V0TWVzc2FnZVN1YnRpdGxlKSB7XG5cdFx0XHRcdFx0XHRvTWVzc2FnZURpYWxvZ01vZGVsLmdldERhdGEoKS5mb3JFYWNoKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycy5mbkdldE1lc3NhZ2VTdWJ0aXRsZShvTWVzc2FnZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBvTWVzc2FnZU9iamVjdCA9IHByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyhvTWVzc2FnZURpYWxvZ01vZGVsLCBiU3RyaWN0SGFuZGxpbmdGbG93KTtcblx0XHRcdFx0XHRjb25zdCBvU29ydGVyID0gbmV3IFNvcnRlcihcIlwiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgKG9iajE6IGFueSwgb2JqMjogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCByYW5rQSA9IGdldE1lc3NhZ2VSYW5rKG9iajEpO1xuXHRcdFx0XHRcdFx0Y29uc3QgcmFua0IgPSBnZXRNZXNzYWdlUmFuayhvYmoyKTtcblxuXHRcdFx0XHRcdFx0aWYgKHJhbmtBIDwgcmFua0IpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKHJhbmtBID4gcmFua0IpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdChvTWVzc2FnZU9iamVjdC5vTWVzc2FnZVZpZXcuZ2V0QmluZGluZyhcIml0ZW1zXCIpIGFzIE9EYXRhTGlzdEJpbmRpbmcpLnNvcnQob1NvcnRlcik7XG5cblx0XHRcdFx0XHRvRGlhbG9nID1cblx0XHRcdFx0XHRcdG9EaWFsb2cgJiYgb0RpYWxvZy5pc09wZW4oKVxuXHRcdFx0XHRcdFx0XHQ/IG9EaWFsb2dcblx0XHRcdFx0XHRcdFx0OiBuZXcgRGlhbG9nKHtcblx0XHRcdFx0XHRcdFx0XHRcdHJlc2l6YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRcdGVuZEJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGlhbG9nQ2xvc2VIYW5kbGVyKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gYWxzbyByZW1vdmUgYm91bmQgdHJhbnNpdGlvbiBtZXNzYWdlcyBpZiB3ZSB3ZXJlIHNob3dpbmcgdGhlbVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9NZXNzYWdlTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhhTW9kZWxEYXRhQXJyYXkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0NMT1NFXCIpXG5cdFx0XHRcdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdFx0XHRcdGN1c3RvbUhlYWRlcjogbmV3IEJhcih7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRlbnRNaWRkbGU6IFtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRuZXcgVGV4dCh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFXCIpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGVudExlZnQ6IFtvQmFja0J1dHRvbl1cblx0XHRcdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGVudFdpZHRoOiBcIjM3LjVlbVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGVudEhlaWdodDogXCIyMS41ZW1cIixcblx0XHRcdFx0XHRcdFx0XHRcdHZlcnRpY2FsU2Nyb2xsaW5nOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRcdGFmdGVyQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhUmVzb2x2ZUZ1bmN0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFSZXNvbHZlRnVuY3Rpb25zW2ldLmNhbGwoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhUmVzb2x2ZUZ1bmN0aW9ucyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQgIH0pO1xuXHRcdFx0XHRcdG9EaWFsb2cucmVtb3ZlQWxsQ29udGVudCgpO1xuXHRcdFx0XHRcdG9EaWFsb2cuYWRkQ29udGVudChvTWVzc2FnZU9iamVjdC5vTWVzc2FnZVZpZXcpO1xuXG5cdFx0XHRcdFx0aWYgKGJIYXNFdGFnTWVzc2FnZSkge1xuXHRcdFx0XHRcdFx0c2FwLnVpLnJlcXVpcmUoW1wic2FwL20vQnV0dG9uVHlwZVwiXSwgZnVuY3Rpb24gKEJ1dHRvblR5cGU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRvRGlhbG9nLnNldEJlZ2luQnV0dG9uKFxuXHRcdFx0XHRcdFx0XHRcdG5ldyBCdXR0b24oe1xuXHRcdFx0XHRcdFx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGlhbG9nQ2xvc2VIYW5kbGVyKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChvQ29udGV4dC5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0QmluZGluZygpLnJlc2V0Q2hhbmdlcygpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0LnJlZnJlc2goKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX1JFRlJFU0hcIiksXG5cdFx0XHRcdFx0XHRcdFx0XHR0eXBlOiBCdXR0b25UeXBlLkVtcGhhc2l6ZWRcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9EaWFsb2cuZGVzdHJveUJlZ2luQnV0dG9uKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNIaWdoZXN0UHJpb3JpdHkgPSBmbkdldEhpZ2hlc3RNZXNzYWdlUHJpb3JpdHkob01lc3NhZ2VWaWV3LmdldEl0ZW1zKCkpO1xuXHRcdFx0XHRcdHNIaWdoZXN0UHJpb3JpdHlUZXh0ID0gZ2V0VHJhbnNsYXRlZFRleHRGb3JNZXNzYWdlRGlhbG9nKHNIaWdoZXN0UHJpb3JpdHkpO1xuXHRcdFx0XHRcdG9EaWFsb2cuc2V0U3RhdGUoc0hpZ2hlc3RQcmlvcml0eSk7XG5cdFx0XHRcdFx0KG9EaWFsb2cuZ2V0Q3VzdG9tSGVhZGVyKCkgYXMgYW55KS5nZXRDb250ZW50TWlkZGxlKClbMF0uc2V0VGV4dChzSGlnaGVzdFByaW9yaXR5VGV4dCk7XG5cdFx0XHRcdFx0b01lc3NhZ2VWaWV3Lm5hdmlnYXRlQmFjaygpO1xuXHRcdFx0XHRcdG9EaWFsb2cub3BlbigpO1xuXHRcdFx0XHRcdGlmIChiT25seUZvclRlc3QpIHtcblx0XHRcdFx0XHRcdHJlc29sdmUob0RpYWxvZyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2gocmVqZWN0KTtcblx0XHR9KTtcblx0fSBlbHNlIGlmIChzaG93TWVzc2FnZUJveCkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdFx0Y29uc3Qgb01lc3NhZ2UgPSBhVHJhbnNpdGlvbk1lc3NhZ2VzWzBdO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQob01lc3NhZ2UudGVjaG5pY2FsRGV0YWlscyAmJiBhTWVzc2FnZUxpc3QuaW5kZXhPZihvTWVzc2FnZS50ZWNobmljYWxEZXRhaWxzLm9yaWdpbmFsTWVzc2FnZS5tZXNzYWdlKSA9PT0gLTEpIHx8XG5cdFx0XHRcdChzaG93TWVzc2FnZVBhcmFtZXRlcnMgJiYgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dDaGFuZ2VTZXRFcnJvckRpYWxvZylcblx0XHRcdCkge1xuXHRcdFx0XHRpZiAoIXNob3dNZXNzYWdlUGFyYW1ldGVycyB8fCAhc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dDaGFuZ2VTZXRFcnJvckRpYWxvZykge1xuXHRcdFx0XHRcdGFNZXNzYWdlTGlzdC5wdXNoKG9NZXNzYWdlLnRlY2huaWNhbERldGFpbHMub3JpZ2luYWxNZXNzYWdlLm1lc3NhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBmb3JtYXR0ZWRUZXh0U3RyaW5nID0gXCI8aHRtbD48Ym9keT5cIjtcblx0XHRcdFx0Y29uc3QgcmV0cnlBZnRlck1lc3NhZ2UgPSBnZXRSZXRyeUFmdGVyTWVzc2FnZShvTWVzc2FnZSwgdHJ1ZSk7XG5cdFx0XHRcdGlmIChyZXRyeUFmdGVyTWVzc2FnZSkge1xuXHRcdFx0XHRcdGZvcm1hdHRlZFRleHRTdHJpbmcgPSBgPGg2PiR7cmV0cnlBZnRlck1lc3NhZ2V9PC9oNj48YnI+YDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc2hvd01lc3NhZ2VQYXJhbWV0ZXJzICYmIHNob3dNZXNzYWdlUGFyYW1ldGVycy5mbkdldE1lc3NhZ2VTdWJ0aXRsZSkge1xuXHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycy5mbkdldE1lc3NhZ2VTdWJ0aXRsZShvTWVzc2FnZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9NZXNzYWdlLmdldENvZGUoKSAhPT0gXCI1MDNcIiAmJiBvTWVzc2FnZS5nZXRBZGRpdGlvbmFsVGV4dCgpICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRmb3JtYXR0ZWRUZXh0U3RyaW5nID0gYCR7Zm9ybWF0dGVkVGV4dFN0cmluZyArIG9NZXNzYWdlLmdldEFkZGl0aW9uYWxUZXh0KCl9OiAke29NZXNzYWdlLmdldE1lc3NhZ2UoKX08L2h0bWw+PC9ib2R5PmA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9ybWF0dGVkVGV4dFN0cmluZyA9IGAke2Zvcm1hdHRlZFRleHRTdHJpbmcgKyBvTWVzc2FnZS5nZXRNZXNzYWdlKCl9PC9odG1sPjwvYm9keT5gO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGZvcm1hdHRlZFRleHQ6IGFueSA9IG5ldyBGb3JtYXR0ZWRUZXh0KHtcblx0XHRcdFx0XHRodG1sVGV4dDogZm9ybWF0dGVkVGV4dFN0cmluZ1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0TWVzc2FnZUJveC5lcnJvcihmb3JtYXR0ZWRUZXh0LCB7XG5cdFx0XHRcdFx0b25DbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0YU1lc3NhZ2VMaXN0ID0gW107XG5cdFx0XHRcdFx0XHRpZiAoYlNob3dCb3VuZFRyYW5zaXRpb24pIHtcblx0XHRcdFx0XHRcdFx0cmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdHJlc29sdmUodHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHR9XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBzZXRzIHRoZSBncm91cCBuYW1lIGZvciBhbGwgbWVzc2FnZXMgaW4gYSBkaWFsb2cuXG4gKlxuICogQHBhcmFtIGFNb2RlbERhdGFBcnJheSBNZXNzYWdlcyBhcnJheVxuICogQHBhcmFtIGNvbnRyb2xcbiAqIEBwYXJhbSBzQWN0aW9uTmFtZVxuICogQHBhcmFtIHZpZXdUeXBlXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZU1lc3NhZ2VPYmplY3RHcm91cE5hbWUoXG5cdGFNb2RlbERhdGFBcnJheTogTWVzc2FnZVdpdGhIZWFkZXJbXSxcblx0Y29udHJvbDogQ29udHJvbCB8IHVuZGVmaW5lZCxcblx0c0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0dmlld1R5cGU6IHN0cmluZyB8IHVuZGVmaW5lZFxuKSB7XG5cdGFNb2RlbERhdGFBcnJheS5mb3JFYWNoKChhTW9kZWxEYXRhOiBNZXNzYWdlV2l0aEhlYWRlcikgPT4ge1xuXHRcdGFNb2RlbERhdGFbXCJoZWFkZXJOYW1lXCJdID0gXCJcIjtcblx0XHRpZiAoIWFNb2RlbERhdGEudGFyZ2V0Py5sZW5ndGggJiYgYU1vZGVsRGF0YS5nZXRDb2RlPy4oKSAhPT0gXCJGRV9DVVNUT01fTUVTU0FHRV9DSEFOR0VTRVRfQUxMX0ZBSUxFRFwiKSB7XG5cdFx0XHQvLyB1bmJvdW5kIHRyYW5zaWl0b24gbWVzc2FnZXNcblx0XHRcdGFNb2RlbERhdGFbXCJoZWFkZXJOYW1lXCJdID0gXCJHZW5lcmFsXCI7XG5cdFx0fSBlbHNlIGlmIChhTW9kZWxEYXRhLnRhcmdldD8ubGVuZ3RoKSB7XG5cdFx0XHQvLyBMUiBmbG93XG5cdFx0XHRpZiAodmlld1R5cGUgPT09IFwiTGlzdFJlcG9ydFwiKSB7XG5cdFx0XHRcdG1lc3NhZ2VIYW5kbGluZy5zZXRHcm91cE5hbWVMUlRhYmxlKGNvbnRyb2wsIGFNb2RlbERhdGEsIHNBY3Rpb25OYW1lKTtcblx0XHRcdH0gZWxzZSBpZiAodmlld1R5cGUgPT09IFwiT2JqZWN0UGFnZVwiKSB7XG5cdFx0XHRcdC8vIE9QIERpc3BsYXkgbW9kZVxuXHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcuc2V0R3JvdXBOYW1lT1BEaXNwbGF5TW9kZShhTW9kZWxEYXRhLCBzQWN0aW9uTmFtZSwgY29udHJvbCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRMYXN0QWN0aW9uVGV4dEFuZEFjdGlvbk5hbWUoc0FjdGlvbk5hbWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIHNldCB0aGUgZ3JvdXAgbmFtZSBvZiBNZXNzYWdlIE9iamVjdCBmb3IgTFIgdGFibGUuXG4gKlxuICogQHBhcmFtIG9FbGVtXG4gKiBAcGFyYW0gYU1vZGVsRGF0YVxuICogQHBhcmFtIHNBY3Rpb25OYW1lXG4gKi9cbmZ1bmN0aW9uIHNldEdyb3VwTmFtZUxSVGFibGUob0VsZW06IENvbnRyb2wgfCB1bmRlZmluZWQsIGFNb2RlbERhdGE6IE1lc3NhZ2VXaXRoSGVhZGVyLCBzQWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdGNvbnN0IG9Sb3dCaW5kaW5nID0gb0VsZW0gJiYgKG9FbGVtIGFzIFRhYmxlKS5nZXRSb3dCaW5kaW5nKCk7XG5cdGlmIChvUm93QmluZGluZykge1xuXHRcdGNvbnN0IHNFbGVtZUJpbmRpbmdQYXRoID0gYCR7KG9FbGVtIGFzIFRhYmxlKS5nZXRSb3dCaW5kaW5nKCkuZ2V0UGF0aCgpfWA7XG5cdFx0aWYgKGFNb2RlbERhdGEudGFyZ2V0Py5pbmRleE9mKHNFbGVtZUJpbmRpbmdQYXRoKSA9PT0gMCkge1xuXHRcdFx0Y29uc3QgYWxsUm93Q29udGV4dHMgPSAob1Jvd0JpbmRpbmcgYXMgT0RhdGFMaXN0QmluZGluZykuZ2V0Q3VycmVudENvbnRleHRzKCk7XG5cdFx0XHRhbGxSb3dDb250ZXh0cy5mb3JFYWNoKChyb3dDb250ZXh0OiBDb250ZXh0KSA9PiB7XG5cdFx0XHRcdGlmIChhTW9kZWxEYXRhLnRhcmdldD8uaW5jbHVkZXMocm93Q29udGV4dC5nZXRQYXRoKCkpKSB7XG5cdFx0XHRcdFx0Y29uc3QgY29udGV4dFBhdGggPSBgJHtyb3dDb250ZXh0LmdldFBhdGgoKX0vYDtcblx0XHRcdFx0XHRjb25zdCBpZGVudGlmaWVyQ29sdW1uID0gKG9FbGVtLmdldFBhcmVudCgpIGFzIGFueSkuZ2V0SWRlbnRpZmllckNvbHVtbigpO1xuXHRcdFx0XHRcdGNvbnN0IHJvd0lkZW50aWZpZXIgPSBpZGVudGlmaWVyQ29sdW1uICYmIHJvd0NvbnRleHQuZ2V0T2JqZWN0KClbaWRlbnRpZmllckNvbHVtbl07XG5cdFx0XHRcdFx0Y29uc3QgY29sdW1uUHJvcGVydHlOYW1lID0gbWVzc2FnZUhhbmRsaW5nLmdldFRhYmxlQ29sUHJvcGVydHkob0VsZW0sIGFNb2RlbERhdGEsIGNvbnRleHRQYXRoKTtcblx0XHRcdFx0XHRjb25zdCB7IHNUYWJsZVRhcmdldENvbE5hbWUgfSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRUYWJsZUNvbEluZm8ob0VsZW0sIGNvbHVtblByb3BlcnR5TmFtZSk7XG5cblx0XHRcdFx0XHQvLyBpZiB0YXJnZXQgaGFzIHNvbWUgY29sdW1uIG5hbWUgYW5kIGNvbHVtbiBpcyB2aXNpYmxlIGluIFVJXG5cdFx0XHRcdFx0aWYgKGNvbHVtblByb3BlcnR5TmFtZSAmJiBzVGFibGVUYXJnZXRDb2xOYW1lKSB7XG5cdFx0XHRcdFx0XHQvLyBoZWFkZXIgd2lsbCBiZSByb3cgSWRlbnRpZmllciwgaWYgZm91bmQgZnJvbSBhYm92ZSBjb2RlIG90aGVyd2lzZSBpdCBzaG91bGQgYmUgdGFibGUgbmFtZVxuXHRcdFx0XHRcdFx0YU1vZGVsRGF0YVtcImhlYWRlck5hbWVcIl0gPSByb3dJZGVudGlmaWVyID8gYCAke3Jvd0lkZW50aWZpZXJ9YCA6IChvRWxlbSBhcyBUYWJsZSkuZ2V0SGVhZGVyKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIGlmIGNvbHVtbiBkYXRhIG5vdCBmb3VuZCAobWF5IGJlIHRoZSBjb2x1bW4gaXMgaGlkZGVuKSwgYWRkIGdyb3VwaW5nIGFzIExhc3QgQWN0aW9uXG5cdFx0XHRcdFx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRMYXN0QWN0aW9uVGV4dEFuZEFjdGlvbk5hbWUoc0FjdGlvbk5hbWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIHNldCB0aGUgZ3JvdXAgbmFtZSBvZiBNZXNzYWdlIE9iamVjdCBpbiBPUCBEaXNwbGF5IG1vZGUuXG4gKlxuICogQHBhcmFtIGFNb2RlbERhdGEgTWVzc2FnZSBPYmplY3RcbiAqIEBwYXJhbSBzQWN0aW9uTmFtZSAgQWN0aW9uIG5hbWVcbiAqIEBwYXJhbSBjb250cm9sXG4gKi9cbmZ1bmN0aW9uIHNldEdyb3VwTmFtZU9QRGlzcGxheU1vZGUoYU1vZGVsRGF0YTogTWVzc2FnZVdpdGhIZWFkZXIsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsIGNvbnRyb2w6IGFueSkge1xuXHRjb25zdCBvVmlld0NvbnRleHQgPSBjb250cm9sPy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRjb25zdCBvcExheW91dDogQ29udHJvbCA9IGNvbnRyb2w/LmdldENvbnRlbnQgJiYgY29udHJvbD8uZ2V0Q29udGVudCgpWzBdO1xuXHRsZXQgYklzR2VuZXJhbEdyb3VwTmFtZSA9IHRydWU7XG5cdGlmIChvcExheW91dCkge1xuXHRcdG1lc3NhZ2VIYW5kbGluZy5nZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dChvcExheW91dCkuZm9yRWFjaChmdW5jdGlvbiAob1NlY3Rpb246IE9iamVjdFBhZ2VTZWN0aW9uKSB7XG5cdFx0XHRjb25zdCBzdWJTZWN0aW9ucyA9IG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKCk7XG5cdFx0XHRzdWJTZWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvU3ViU2VjdGlvbjogT2JqZWN0UGFnZVN1YlNlY3Rpb24pIHtcblx0XHRcdFx0b1N1YlNlY3Rpb24uZmluZEVsZW1lbnRzKHRydWUpLmZvckVhY2goZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob0VsZW0uaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSBvRWxlbS5nZXRSb3dCaW5kaW5nKCksXG5cdFx0XHRcdFx0XHRcdHNldFNlY3Rpb25OYW1lSW5Hcm91cCA9IHRydWU7XG5cdFx0XHRcdFx0XHRsZXQgY2hpbGRUYWJsZUVsZW1lbnQ6IFVJNUVsZW1lbnQgfCB1bmRlZmluZWQ7XG5cblx0XHRcdFx0XHRcdG9FbGVtLmZpbmRFbGVtZW50cyh0cnVlKS5mb3JFYWNoKChvRWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChvRWxlbWVudC5pc0EoXCJzYXAubS5UYWJsZVwiKSB8fCBvRWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikpIHtcblx0XHRcdFx0XHRcdFx0XHRjaGlsZFRhYmxlRWxlbWVudCA9IG9FbGVtZW50O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmIChvUm93QmluZGluZykge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzRWxlbWVCaW5kaW5nUGF0aCA9IGAke29WaWV3Q29udGV4dD8uZ2V0UGF0aCgpfS8ke29FbGVtLmdldFJvd0JpbmRpbmcoKT8uZ2V0UGF0aCgpfWA7XG5cdFx0XHRcdFx0XHRcdGlmIChhTW9kZWxEYXRhLnRhcmdldD8uaW5kZXhPZihzRWxlbWVCaW5kaW5nUGF0aCkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBvYmogPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZShcblx0XHRcdFx0XHRcdFx0XHRcdGFNb2RlbERhdGEsXG5cdFx0XHRcdFx0XHRcdFx0XHRvRWxlbSxcblx0XHRcdFx0XHRcdFx0XHRcdGNoaWxkVGFibGVFbGVtZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0b1Jvd0JpbmRpbmcsXG5cdFx0XHRcdFx0XHRcdFx0XHRzQWN0aW9uTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdHNldFNlY3Rpb25OYW1lSW5Hcm91cCxcblx0XHRcdFx0XHRcdFx0XHRcdGZuQ2FsbGJhY2tTZXRHcm91cE5hbWVcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHsgb1RhcmdldFRhYmxlSW5mbyB9ID0gb2JqO1xuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNldFNlY3Rpb25OYW1lSW5Hcm91cCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgaWRlbnRpZmllckNvbHVtbiA9IG9FbGVtLmdldFBhcmVudCgpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChpZGVudGlmaWVyQ29sdW1uKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFsbFJvd0NvbnRleHRzID0gb0VsZW0uZ2V0Um93QmluZGluZygpLmdldENvbnRleHRzKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFsbFJvd0NvbnRleHRzLmZvckVhY2goKHJvd0NvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYU1vZGVsRGF0YS50YXJnZXQ/LmluY2x1ZGVzKHJvd0NvbnRleHQuZ2V0UGF0aCgpKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgcm93SWRlbnRpZmllciA9IGlkZW50aWZpZXJDb2x1bW5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PyByb3dDb250ZXh0LmdldE9iamVjdCgpW2lkZW50aWZpZXJDb2x1bW5dXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YU1vZGVsRGF0YVtcImFkZGl0aW9uYWxUZXh0XCJdID0gYCR7cm93SWRlbnRpZmllcn0sICR7b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lfWA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFNb2RlbERhdGFbXCJhZGRpdGlvbmFsVGV4dFwiXSA9IGAke29UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZX1gO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgaGVhZGVyTmFtZSA9IG9FbGVtLmdldEhlYWRlclZpc2libGUoKSAmJiBvVGFyZ2V0VGFibGVJbmZvLnRhYmxlSGVhZGVyO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFoZWFkZXJOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGhlYWRlck5hbWUgPSBvU3ViU2VjdGlvbi5nZXRUaXRsZSgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aGVhZGVyTmFtZSA9IGAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX1RJVExFX1RBQkxFX0RFTk9NSU5BVE9SXCIpfTogJHtoZWFkZXJOYW1lfWA7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IGhlYWRlck5hbWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRiSXNHZW5lcmFsR3JvdXBOYW1lID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0aWYgKGJJc0dlbmVyYWxHcm91cE5hbWUpIHtcblx0XHRjb25zdCBzRWxlbWVCaW5kaW5nUGF0aCA9IGAke29WaWV3Q29udGV4dD8uZ2V0UGF0aCgpfWA7XG5cdFx0aWYgKGFNb2RlbERhdGEudGFyZ2V0Py5pbmRleE9mKHNFbGVtZUJpbmRpbmdQYXRoKSA9PT0gMCkge1xuXHRcdFx0Ly8gY2hlY2sgaWYgT1AgY29udGV4dCBwYXRoIGlzIHBhcnQgb2YgdGFyZ2V0LCBzZXQgTGFzdCBBY3Rpb24gYXMgZ3JvdXAgbmFtZVxuXHRcdFx0Y29uc3QgaGVhZGVyTmFtZSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRMYXN0QWN0aW9uVGV4dEFuZEFjdGlvbk5hbWUoc0FjdGlvbk5hbWUpO1xuXHRcdFx0YU1vZGVsRGF0YVtcImhlYWRlck5hbWVcIl0gPSBoZWFkZXJOYW1lO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhTW9kZWxEYXRhW1wiaGVhZGVyTmFtZVwiXSA9IFwiR2VuZXJhbFwiO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBnZXRMYXN0QWN0aW9uVGV4dEFuZEFjdGlvbk5hbWUoc0FjdGlvbk5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IHN0cmluZyB7XG5cdGNvbnN0IHNMYXN0QWN0aW9uVGV4dCA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIikuZ2V0VGV4dChcIlRfTUVTU0FHRV9CVVRUT05fU0FQRkVfTUVTU0FHRV9HUk9VUF9MQVNUX0FDVElPTlwiKTtcblx0cmV0dXJuIHNBY3Rpb25OYW1lID8gYCR7c0xhc3RBY3Rpb25UZXh0fTogJHtzQWN0aW9uTmFtZX1gIDogXCJcIjtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgZ2l2ZSByYW5rIGJhc2VkIG9uIE1lc3NhZ2UgR3JvdXAvSGVhZGVyIG5hbWUsIHdoaWNoIHdpbGwgYmUgdXNlZCBmb3IgU29ydGluZyBtZXNzYWdlcyBpbiBNZXNzYWdlIGRpYWxvZ1xuICogTGFzdCBBY3Rpb24gc2hvdWxkIGJlIHNob3duIGF0IHRvcCwgbmV4dCBSb3cgSWQgYW5kIGxhc3QgR2VuZXJhbC5cbiAqXG4gKiBAcGFyYW0gb2JqXG4gKiBAcmV0dXJucyBSYW5rIG9mIG1lc3NhZ2VcbiAqL1xuZnVuY3Rpb24gZ2V0TWVzc2FnZVJhbmsob2JqOiBNZXNzYWdlV2l0aEhlYWRlcik6IG51bWJlciB7XG5cdGlmIChvYmouaGVhZGVyTmFtZT8udG9TdHJpbmcoKS5pbmNsdWRlcyhcIkxhc3QgQWN0aW9uXCIpKSB7XG5cdFx0cmV0dXJuIDE7XG5cdH0gZWxzZSBpZiAob2JqLmhlYWRlck5hbWU/LnRvU3RyaW5nKCkuaW5jbHVkZXMoXCJHZW5lcmFsXCIpKSB7XG5cdFx0cmV0dXJuIDM7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIDI7XG5cdH1cbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgc2V0IHRoZSBncm91cCBuYW1lIHdoaWNoIGNhbiBlaXRoZXIgR2VuZXJhbCBvciBMYXN0IEFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gYU1lc3NhZ2VcbiAqIEBwYXJhbSBzQWN0aW9uTmFtZVxuICogQHBhcmFtIGJJc0dlbmVyYWxHcm91cE5hbWVcbiAqL1xuY29uc3QgZm5DYWxsYmFja1NldEdyb3VwTmFtZSA9IChhTWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsIGJJc0dlbmVyYWxHcm91cE5hbWU/OiBCb29sZWFuKSA9PiB7XG5cdGlmIChiSXNHZW5lcmFsR3JvdXBOYW1lKSB7XG5cdFx0Y29uc3Qgc0dlbmVyYWxHcm91cFRleHQgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJUX01FU1NBR0VfQlVUVE9OX1NBUEZFX01FU1NBR0VfR1JPVVBfR0VORVJBTFwiKTtcblx0XHRhTWVzc2FnZVtcImhlYWRlck5hbWVcIl0gPSBzR2VuZXJhbEdyb3VwVGV4dDtcblx0fSBlbHNlIHtcblx0XHRhTWVzc2FnZVtcImhlYWRlck5hbWVcIl0gPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TGFzdEFjdGlvblRleHRBbmRBY3Rpb25OYW1lKHNBY3Rpb25OYW1lKTtcblx0fVxufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgZ2V0IHRoZSB0YWJsZSByb3cvY29sdW1uIGluZm8gYW5kIHNldCBzdWJ0aXRsZS5cbiAqXG4gKiBAcGFyYW0gYU1lc3NhZ2VcbiAqIEBwYXJhbSBvVGFibGVcbiAqIEBwYXJhbSBvRWxlbWVudFxuICogQHBhcmFtIG9Sb3dCaW5kaW5nXG4gKiBAcGFyYW0gc0FjdGlvbk5hbWVcbiAqIEBwYXJhbSBzZXRTZWN0aW9uTmFtZUluR3JvdXBcbiAqIEBwYXJhbSBmblNldEdyb3VwTmFtZVxuICogQHJldHVybnMgVGFibGUgaW5mbyBhbmQgU3VidGl0bGUuXG4gKi9cbmZ1bmN0aW9uIGdldFRhYmxlQ29sdW1uRGF0YUFuZFNldFN1YnRpbGUoXG5cdGFNZXNzYWdlOiBNZXNzYWdlV2l0aEhlYWRlcixcblx0b1RhYmxlOiBUYWJsZSxcblx0b0VsZW1lbnQ6IFVJNUVsZW1lbnQgfCB1bmRlZmluZWQsXG5cdG9Sb3dCaW5kaW5nOiBCaW5kaW5nLFxuXHRzQWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRzZXRTZWN0aW9uTmFtZUluR3JvdXA6IEJvb2xlYW4sXG5cdGZuU2V0R3JvdXBOYW1lOiBhbnlcbikge1xuXHRjb25zdCBvVGFyZ2V0VGFibGVJbmZvID0gbWVzc2FnZUhhbmRsaW5nLmdldFRhYmxlQW5kVGFyZ2V0SW5mbyhvVGFibGUsIGFNZXNzYWdlLCBvRWxlbWVudCwgb1Jvd0JpbmRpbmcpO1xuXHRvVGFyZ2V0VGFibGVJbmZvLnRhYmxlSGVhZGVyID0gb1RhYmxlLmdldEhlYWRlcigpO1xuXG5cdGxldCBzQ29udHJvbElkLCBiSXNDcmVhdGlvblJvdztcblx0aWYgKCFvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQpIHtcblx0XHRzQ29udHJvbElkID0gYU1lc3NhZ2UuZ2V0Q29udHJvbElkcygpLmZpbmQoZnVuY3Rpb24gKHNJZDogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gbWVzc2FnZUhhbmRsaW5nLmlzQ29udHJvbEluVGFibGUob1RhYmxlLCBzSWQpO1xuXHRcdH0pO1xuXHR9XG5cblx0aWYgKHNDb250cm9sSWQpIHtcblx0XHRjb25zdCBvQ29udHJvbCA9IENvcmUuYnlJZChzQ29udHJvbElkKTtcblx0XHRiSXNDcmVhdGlvblJvdyA9IG1lc3NhZ2VIYW5kbGluZy5pc0NvbnRyb2xQYXJ0T2ZDcmVhdGlvblJvdyhvQ29udHJvbCk7XG5cdH1cblxuXHRpZiAoIW9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZSkge1xuXHRcdC8vIGlmIHRoZSBjb2x1bW4gaXMgbm90IHByZXNlbnQgb24gVUkgb3IgdGhlIHRhcmdldCBkb2VzIG5vdCBoYXZlIGEgdGFibGUgZmllbGQgaW4gaXQsIHVzZSBMYXN0IEFjdGlvbiBmb3IgZ3JvdXBpbmdcblx0XHRpZiAoKGFNZXNzYWdlIGFzIGFueSkucGVyc2lzdGVudCAmJiBzQWN0aW9uTmFtZSkge1xuXHRcdFx0Zm5TZXRHcm91cE5hbWUoYU1lc3NhZ2UsIHNBY3Rpb25OYW1lKTtcblx0XHRcdHNldFNlY3Rpb25OYW1lSW5Hcm91cCA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHN1YlRpdGxlID0gbWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VTdWJ0aXRsZShcblx0XHRhTWVzc2FnZSxcblx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyxcblx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQsXG5cdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lLFxuXHRcdG9UYWJsZSxcblx0XHRiSXNDcmVhdGlvblJvd1xuXHQpO1xuXG5cdHJldHVybiB7IG9UYXJnZXRUYWJsZUluZm8sIHN1YlRpdGxlIH07XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGNyZWF0ZSB0aGUgc3VidGl0bGUgYmFzZWQgb24gVGFibGUgUm93L0NvbHVtbiBkYXRhLlxuICpcbiAqIEBwYXJhbSBtZXNzYWdlXG4gKiBAcGFyYW0gb1RhYmxlUm93QmluZGluZ0NvbnRleHRzXG4gKiBAcGFyYW0gb1RhYmxlUm93Q29udGV4dFxuICogQHBhcmFtIHNUYWJsZVRhcmdldENvbE5hbWVcbiAqIEBwYXJhbSBvVGFibGVcbiAqIEBwYXJhbSBiSXNDcmVhdGlvblJvd1xuICogQHBhcmFtIG9UYXJnZXRlZENvbnRyb2xcbiAqIEByZXR1cm5zIE1lc3NhZ2Ugc3VidGl0bGUuXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VTdWJ0aXRsZShcblx0bWVzc2FnZTogTWVzc2FnZVdpdGhIZWFkZXIsXG5cdG9UYWJsZVJvd0JpbmRpbmdDb250ZXh0czogQ29udGV4dFtdLFxuXHRvVGFibGVSb3dDb250ZXh0OiBPRGF0YVY0Q29udGV4dCB8IHVuZGVmaW5lZCxcblx0c1RhYmxlVGFyZ2V0Q29sTmFtZTogc3RyaW5nIHwgYm9vbGVhbixcblx0b1RhYmxlOiBUYWJsZSxcblx0YklzQ3JlYXRpb25Sb3c6IGJvb2xlYW4gfCB1bmRlZmluZWQsXG5cdG9UYXJnZXRlZENvbnRyb2w/OiBDb250cm9sXG4pOiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkIHtcblx0bGV0IHNNZXNzYWdlU3VidGl0bGU7XG5cdGxldCBzUm93U3VidGl0bGVWYWx1ZTtcblx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwob1RhYmxlKTtcblx0Y29uc3Qgc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IChvVGFibGUgYXMgYW55KS5nZXRQYXJlbnQoKS5nZXRJZGVudGlmaWVyQ29sdW1uKCk7XG5cdGNvbnN0IG9Db2xGcm9tVGFibGVTZXR0aW5ncyA9IG1lc3NhZ2VIYW5kbGluZy5mZXRjaENvbHVtbkluZm8obWVzc2FnZSwgb1RhYmxlKTtcblx0aWYgKGJJc0NyZWF0aW9uUm93KSB7XG5cdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9JVEVNX1NVQlRJVExFXCIsIFtcblx0XHRcdHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9JVEVNX1NVQlRJVExFX0NSRUFUSU9OX1JPV19JTkRJQ0FUT1JcIiksXG5cdFx0XHRzVGFibGVUYXJnZXRDb2xOYW1lID8gc1RhYmxlVGFyZ2V0Q29sTmFtZSA6IChvQ29sRnJvbVRhYmxlU2V0dGluZ3MgYXMgQ29sdW1uV2l0aExhYmVsVHlwZSkubGFiZWxcblx0XHRdKTtcblx0fSBlbHNlIHtcblx0XHRjb25zdCBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb24gPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb24oXG5cdFx0XHRvVGFibGUsXG5cdFx0XHRvVGFibGVSb3dDb250ZXh0LFxuXHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdCk7XG5cdFx0Y29uc3Qgc1RhYmxlRmlyc3RDb2xUZXh0QW5ub3RhdGlvblBhdGggPSBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb25cblx0XHRcdD8gb1RhYmxlRmlyc3RDb2xCaW5kaW5nQ29udGV4dFRleHRBbm5vdGF0aW9uLmdldE9iamVjdChcIiRQYXRoXCIpXG5cdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRjb25zdCBzVGFibGVGaXJzdENvbFRleHRBcnJhbmdlbWVudCA9XG5cdFx0XHRzVGFibGVGaXJzdENvbFRleHRBbm5vdGF0aW9uUGF0aCAmJiBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb25cblx0XHRcdFx0PyBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb24uZ2V0T2JqZWN0KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudC8kRW51bU1lbWJlclwiKVxuXHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRpZiAob1RhYmxlUm93QmluZGluZ0NvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIHNldCBSb3cgc3VidGl0bGUgdGV4dFxuXHRcdFx0aWYgKG9UYXJnZXRlZENvbnRyb2wpIHtcblx0XHRcdFx0Ly8gVGhlIFVJIGVycm9yIGlzIG9uIHRoZSBmaXJzdCBjb2x1bW4sIHdlIHRoZW4gZ2V0IHRoZSBjb250cm9sIGlucHV0IGFzIHRoZSByb3cgaW5kaWNhdG9yOlxuXHRcdFx0XHRzUm93U3VidGl0bGVWYWx1ZSA9IChvVGFyZ2V0ZWRDb250cm9sIGFzIGFueSkuZ2V0VmFsdWUoKTtcblx0XHRcdH0gZWxzZSBpZiAob1RhYmxlUm93Q29udGV4dCAmJiBzVGFibGVGaXJzdENvbFByb3BlcnR5KSB7XG5cdFx0XHRcdHNSb3dTdWJ0aXRsZVZhbHVlID0gbWVzc2FnZUhhbmRsaW5nLmdldFRhYmxlRmlyc3RDb2xWYWx1ZShcblx0XHRcdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5LFxuXHRcdFx0XHRcdG9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdFx0c1RhYmxlRmlyc3RDb2xUZXh0QW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdFx0c1RhYmxlRmlyc3RDb2xUZXh0QXJyYW5nZW1lbnRcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNSb3dTdWJ0aXRsZVZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0Ly8gc2V0IHRoZSBtZXNzYWdlIHN1YnRpdGxlXG5cdFx0XHRjb25zdCBvQ29sdW1uSW5mbzogQ29sdW1uSW5mb1R5cGUgPSBtZXNzYWdlSGFuZGxpbmcuZGV0ZXJtaW5lQ29sdW1uSW5mbyhvQ29sRnJvbVRhYmxlU2V0dGluZ3MsIHJlc291cmNlTW9kZWwpO1xuXHRcdFx0aWYgKHNSb3dTdWJ0aXRsZVZhbHVlICYmIHNUYWJsZVRhcmdldENvbE5hbWUpIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9JVEVNX1NVQlRJVExFXCIsIFtzUm93U3VidGl0bGVWYWx1ZSwgc1RhYmxlVGFyZ2V0Q29sTmFtZV0pO1xuXHRcdFx0fSBlbHNlIGlmIChzUm93U3VidGl0bGVWYWx1ZSAmJiBvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID09PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBgJHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX01FU1NBR0VfR1JPVVBfREVTQ1JJUFRJT05fVEFCTEVfUk9XXCIpfTogJHtzUm93U3VidGl0bGVWYWx1ZX0sICR7XG5cdFx0XHRcdFx0b0NvbHVtbkluZm8uc0NvbHVtblZhbHVlXG5cdFx0XHRcdH1gO1xuXHRcdFx0fSBlbHNlIGlmIChzUm93U3VidGl0bGVWYWx1ZSAmJiBvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID09PSBcIlVua25vd25cIikge1xuXHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9NRVNTQUdFX0lURU1fU1VCVElUTEVcIiwgW3NSb3dTdWJ0aXRsZVZhbHVlLCBvQ29sdW1uSW5mby5zQ29sdW1uVmFsdWVdKTtcblx0XHRcdH0gZWxzZSBpZiAoc1Jvd1N1YnRpdGxlVmFsdWUgJiYgb0NvbHVtbkluZm8uc0NvbHVtbkluZGljYXRvciA9PT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gYCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX0RFU0NSSVBUSU9OX1RBQkxFX1JPV1wiKX06ICR7c1Jvd1N1YnRpdGxlVmFsdWV9YDtcblx0XHRcdH0gZWxzZSBpZiAoIXNSb3dTdWJ0aXRsZVZhbHVlICYmIHNUYWJsZVRhcmdldENvbE5hbWUpIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9DT0xVTU5cIikgKyBcIjogXCIgKyBzVGFibGVUYXJnZXRDb2xOYW1lO1xuXHRcdFx0fSBlbHNlIGlmICghc1Jvd1N1YnRpdGxlVmFsdWUgJiYgb0NvbHVtbkluZm8uc0NvbHVtbkluZGljYXRvciA9PT0gXCJIaWRkZW5cIikge1xuXHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gb0NvbHVtbkluZm8uc0NvbHVtblZhbHVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBudWxsO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBzTWVzc2FnZVN1YnRpdGxlO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gd2lsbCBnZXQgdGhlIGZpcnN0IGNvbHVtbiBmb3IgdGV4dCBBbm5vdGF0aW9uLCB0aGlzIGlzIG5lZWRlZCB0byBzZXQgc3VidGl0bGUgb2YgTWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlXG4gKiBAcGFyYW0gb1RhYmxlUm93Q29udGV4dFxuICogQHBhcmFtIHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcbiAqIEByZXR1cm5zIEJpbmRpbmcgY29udGV4dC5cbiAqL1xuZnVuY3Rpb24gZ2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb24oXG5cdG9UYWJsZTogVGFibGUsXG5cdG9UYWJsZVJvd0NvbnRleHQ6IE9EYXRhVjRDb250ZXh0IHwgdW5kZWZpbmVkLFxuXHRzVGFibGVGaXJzdENvbFByb3BlcnR5OiBzdHJpbmdcbik6IENvbnRleHQgfCBudWxsIHwgdW5kZWZpbmVkIHtcblx0bGV0IG9CaW5kaW5nQ29udGV4dDtcblx0aWYgKG9UYWJsZVJvd0NvbnRleHQgJiYgc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9UYWJsZT8uZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsPy5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzTWV0YVBhdGggPSAob01ldGFNb2RlbCBhcyBhbnkpPy5nZXRNZXRhUGF0aChvVGFibGVSb3dDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0aWYgKG9NZXRhTW9kZWw/LmdldE9iamVjdChgJHtzTWV0YVBhdGh9LyR7c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHQvJFBhdGhgKSkge1xuXHRcdFx0b0JpbmRpbmdDb250ZXh0ID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgJHtzTWV0YVBhdGh9LyR7c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9CaW5kaW5nQ29udGV4dDtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgZ2V0IHRoZSB2YWx1ZSBvZiBmaXJzdCBDb2x1bW4gb2YgVGFibGUsIHdpdGggaXRzIHRleHQgQXJyYW5nZW1lbnQuXG4gKlxuICogQHBhcmFtIHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcbiAqIEBwYXJhbSBvVGFibGVSb3dDb250ZXh0XG4gKiBAcGFyYW0gc1RleHRBbm5vdGF0aW9uUGF0aFxuICogQHBhcmFtIHNUZXh0QXJyYW5nZW1lbnRcbiAqIEByZXR1cm5zIENvbHVtbiBWYWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VGFibGVGaXJzdENvbFZhbHVlKFxuXHRzVGFibGVGaXJzdENvbFByb3BlcnR5OiBzdHJpbmcsXG5cdG9UYWJsZVJvd0NvbnRleHQ6IENvbnRleHQsXG5cdHNUZXh0QW5ub3RhdGlvblBhdGg6IHN0cmluZyxcblx0c1RleHRBcnJhbmdlbWVudDogc3RyaW5nXG4pOiBzdHJpbmcge1xuXHRjb25zdCBzQ29kZVZhbHVlID0gKG9UYWJsZVJvd0NvbnRleHQgYXMgYW55KS5nZXRWYWx1ZShzVGFibGVGaXJzdENvbFByb3BlcnR5KTtcblx0bGV0IHNUZXh0VmFsdWU7XG5cdGxldCBzQ29tcHV0ZWRWYWx1ZSA9IHNDb2RlVmFsdWU7XG5cdGlmIChzVGV4dEFubm90YXRpb25QYXRoKSB7XG5cdFx0aWYgKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkubGFzdEluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0Ly8gdGhlIHRhcmdldCBwcm9wZXJ0eSBpcyByZXBsYWNlZCB3aXRoIHRoZSB0ZXh0IGFubm90YXRpb24gcGF0aFxuXHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IHNUYWJsZUZpcnN0Q29sUHJvcGVydHkuc2xpY2UoMCwgc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eS5sYXN0SW5kZXhPZihcIi9cIikgKyAxKTtcblx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHkgPSBzVGFibGVGaXJzdENvbFByb3BlcnR5LmNvbmNhdChzVGV4dEFubm90YXRpb25QYXRoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IHNUZXh0QW5ub3RhdGlvblBhdGg7XG5cdFx0fVxuXHRcdHNUZXh0VmFsdWUgPSAob1RhYmxlUm93Q29udGV4dCBhcyBhbnkpLmdldFZhbHVlKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpO1xuXHRcdGlmIChzVGV4dFZhbHVlKSB7XG5cdFx0XHRpZiAoc1RleHRBcnJhbmdlbWVudCkge1xuXHRcdFx0XHRjb25zdCBzRW51bU51bWJlciA9IHNUZXh0QXJyYW5nZW1lbnQuc2xpY2Uoc1RleHRBcnJhbmdlbWVudC5pbmRleE9mKFwiL1wiKSArIDEpO1xuXHRcdFx0XHRzd2l0Y2ggKHNFbnVtTnVtYmVyKSB7XG5cdFx0XHRcdFx0Y2FzZSBcIlRleHRPbmx5XCI6XG5cdFx0XHRcdFx0XHRzQ29tcHV0ZWRWYWx1ZSA9IHNUZXh0VmFsdWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiVGV4dEZpcnN0XCI6XG5cdFx0XHRcdFx0XHRzQ29tcHV0ZWRWYWx1ZSA9IGAke3NUZXh0VmFsdWV9ICgke3NDb2RlVmFsdWV9KWA7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiVGV4dExhc3RcIjpcblx0XHRcdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gYCR7c0NvZGVWYWx1ZX0gKCR7c1RleHRWYWx1ZX0pYDtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJUZXh0U2VwYXJhdGVcIjpcblx0XHRcdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gc0NvZGVWYWx1ZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gYCR7c1RleHRWYWx1ZX0gKCR7c0NvZGVWYWx1ZX0pYDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHNDb21wdXRlZFZhbHVlO1xufVxuXG4vKipcbiAqIFRoZSBtZXRob2QgdGhhdCBpcyBjYWxsZWQgdG8gcmV0cmlldmUgdGhlIGNvbHVtbiBpbmZvIGZyb20gdGhlIGFzc29jaWF0ZWQgbWVzc2FnZSBvZiB0aGUgbWVzc2FnZSBwb3BvdmVyLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb01lc3NhZ2UgTWVzc2FnZSBvYmplY3RcbiAqIEBwYXJhbSBvVGFibGUgTWRjVGFibGVcbiAqIEByZXR1cm5zIFJldHVybnMgdGhlIGNvbHVtbiBpbmZvLlxuICovXG5mdW5jdGlvbiBmZXRjaENvbHVtbkluZm8ob01lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyLCBvVGFibGU6IFRhYmxlKTogQ29sdW1uIHtcblx0Y29uc3Qgc0NvbE5hbWVGcm9tTWVzc2FnZU9iaiA9IG9NZXNzYWdlPy5nZXRUYXJnZXRzKClbMF0uc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRyZXR1cm4gKG9UYWJsZSBhcyBhbnkpXG5cdFx0LmdldFBhcmVudCgpXG5cdFx0LmdldFRhYmxlRGVmaW5pdGlvbigpXG5cdFx0LmNvbHVtbnMuZmluZChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0NvbHVtbi5rZXkuc3BsaXQoXCI6OlwiKS5wb3AoKSA9PT0gc0NvbE5hbWVGcm9tTWVzc2FnZU9iajtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGdldCB0aGUgQ29sdW1uIGRhdGEgZGVwZW5kaW5nIG9uIGl0cyBhdmFpbGFiaWxpdHkgaW4gVGFibGUsIHRoaXMgaXMgbmVlZGVkIGZvciBzZXR0aW5nIHN1YnRpdGxlIG9mIE1lc3NhZ2UuXG4gKlxuICogQHBhcmFtIG9Db2xGcm9tVGFibGVTZXR0aW5nc1xuICogQHBhcmFtIHJlc291cmNlTW9kZWxcbiAqIEByZXR1cm5zIENvbHVtbiBkYXRhLlxuICovXG5mdW5jdGlvbiBkZXRlcm1pbmVDb2x1bW5JbmZvKG9Db2xGcm9tVGFibGVTZXR0aW5nczogYW55LCByZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsKTogQ29sdW1uSW5mb1R5cGUge1xuXHRjb25zdCBvQ29sdW1uSW5mbzogYW55ID0geyBzQ29sdW1uSW5kaWNhdG9yOiBTdHJpbmcsIHNDb2x1bW5WYWx1ZTogU3RyaW5nIH07XG5cdGlmIChvQ29sRnJvbVRhYmxlU2V0dGluZ3MpIHtcblx0XHQvLyBpZiBjb2x1bW4gaXMgbmVpdGhlciBpbiB0YWJsZSBkZWZpbml0aW9uIG5vciBwZXJzb25hbGl6YXRpb24sIHNob3cgb25seSByb3cgc3VidGl0bGUgdGV4dFxuXHRcdGlmIChvQ29sRnJvbVRhYmxlU2V0dGluZ3MuYXZhaWxhYmlsaXR5ID09PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uVmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID0gXCJ1bmRlZmluZWRcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9pZiBjb2x1bW4gaXMgaW4gdGFibGUgcGVyc29uYWxpemF0aW9uIGJ1dCBub3QgaW4gdGFibGUgZGVmaW5pdGlvbiwgc2hvdyBDb2x1bW4gKEhpZGRlbikgOiA8Y29sTmFtZT5cblx0XHRcdG9Db2x1bW5JbmZvLnNDb2x1bW5WYWx1ZSA9IGAke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9DT0xVTU5cIil9ICgke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcblx0XHRcdFx0XCJUX0NPTFVNTl9JTkRJQ0FUT1JfSU5fVEFCTEVfREVGSU5JVElPTlwiXG5cdFx0XHQpfSk6ICR7b0NvbEZyb21UYWJsZVNldHRpbmdzLmxhYmVsfWA7XG5cdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID0gXCJIaWRkZW5cIjtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0b0NvbHVtbkluZm8uc0NvbHVtblZhbHVlID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9NRVNTQUdFX0lURU1fU1VCVElUTEVfSU5ESUNBVE9SX1VOS05PV05cIik7XG5cdFx0b0NvbHVtbkluZm8uc0NvbHVtbkluZGljYXRvciA9IFwiVW5rbm93blwiO1xuXHR9XG5cdHJldHVybiBvQ29sdW1uSW5mbztcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNoZWNrIGlmIGEgZ2l2ZW4gY29udHJvbCBpZCBpcyBhIHBhcnQgb2YgVGFibGUuXG4gKlxuICogQHBhcmFtIG9UYWJsZVxuICogQHBhcmFtIHNDb250cm9sSWRcbiAqIEByZXR1cm5zIFRydWUgaWYgY29udHJvbCBpcyBwYXJ0IG9mIHRhYmxlLlxuICovXG5mdW5jdGlvbiBpc0NvbnRyb2xJblRhYmxlKG9UYWJsZTogVGFibGUsIHNDb250cm9sSWQ6IHN0cmluZyk6IFVJNUVsZW1lbnRbXSB8IGJvb2xlYW4ge1xuXHRjb25zdCBvQ29udHJvbDogYW55ID0gQ29yZS5ieUlkKHNDb250cm9sSWQpO1xuXHRpZiAob0NvbnRyb2wgJiYgIW9Db250cm9sLmlzQShcInNhcC51aS50YWJsZS5UYWJsZVwiKSAmJiAhb0NvbnRyb2wuaXNBKFwic2FwLm0uVGFibGVcIikpIHtcblx0XHRyZXR1cm4gb1RhYmxlLmZpbmRFbGVtZW50cyh0cnVlLCBmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdFx0cmV0dXJuIG9FbGVtLmdldElkKCkgPT09IG9Db250cm9sO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gaXNDb250cm9sUGFydE9mQ3JlYXRpb25Sb3cob0NvbnRyb2w6IFVJNUVsZW1lbnQgfCB1bmRlZmluZWQpIHtcblx0bGV0IG9QYXJlbnRDb250cm9sID0gb0NvbnRyb2w/LmdldFBhcmVudCgpO1xuXHR3aGlsZSAoXG5cdFx0b1BhcmVudENvbnRyb2wgJiZcblx0XHQhb1BhcmVudENvbnRyb2w/LmlzQShcInNhcC51aS50YWJsZS5Sb3dcIikgJiZcblx0XHQhb1BhcmVudENvbnRyb2w/LmlzQShcInNhcC51aS50YWJsZS5DcmVhdGlvblJvd1wiKSAmJlxuXHRcdCFvUGFyZW50Q29udHJvbD8uaXNBKFwic2FwLm0uQ29sdW1uTGlzdEl0ZW1cIilcblx0KSB7XG5cdFx0b1BhcmVudENvbnRyb2wgPSBvUGFyZW50Q29udHJvbC5nZXRQYXJlbnQoKTtcblx0fVxuXG5cdHJldHVybiAhIW9QYXJlbnRDb250cm9sICYmIG9QYXJlbnRDb250cm9sLmlzQShcInNhcC51aS50YWJsZS5DcmVhdGlvblJvd1wiKTtcbn1cblxuZnVuY3Rpb24gZ2V0VHJhbnNsYXRlZFRleHRGb3JNZXNzYWdlRGlhbG9nKHNIaWdoZXN0UHJpb3JpdHk6IGFueSkge1xuXHRjb25zdCByZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdHN3aXRjaCAoc0hpZ2hlc3RQcmlvcml0eSkge1xuXHRcdGNhc2UgXCJFcnJvclwiOlxuXHRcdFx0cmV0dXJuIHJlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX0VSUk9SXCIpO1xuXHRcdGNhc2UgXCJJbmZvcm1hdGlvblwiOlxuXHRcdFx0cmV0dXJuIHJlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRV9JTkZPXCIpO1xuXHRcdGNhc2UgXCJTdWNjZXNzXCI6XG5cdFx0XHRyZXR1cm4gcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX1NVQ0NFU1NcIik7XG5cdFx0Y2FzZSBcIldhcm5pbmdcIjpcblx0XHRcdHJldHVybiByZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfV0FSTklOR1wiKTtcblx0XHRkZWZhdWx0OlxuXHRcdFx0cmV0dXJuIHJlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRVwiKTtcblx0fVxufVxuZnVuY3Rpb24gcmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpIHtcblx0cmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKGZhbHNlKTtcbn1cbmZ1bmN0aW9uIHJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKHNQYXRoVG9CZVJlbW92ZWQ/OiBzdHJpbmcpIHtcblx0cmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKHRydWUsIHNQYXRoVG9CZVJlbW92ZWQpO1xufVxuXG5mdW5jdGlvbiBnZXRNZXNzYWdlc0Zyb21NZXNzYWdlTW9kZWwob01lc3NhZ2VNb2RlbDogYW55LCBzUGF0aFRvQmVSZW1vdmVkPzogc3RyaW5nKSB7XG5cdGlmIChzUGF0aFRvQmVSZW1vdmVkID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gb01lc3NhZ2VNb2RlbC5nZXRPYmplY3QoXCIvXCIpO1xuXHR9XG5cdGNvbnN0IGxpc3RCaW5kaW5nID0gb01lc3NhZ2VNb2RlbC5iaW5kTGlzdChcIi9cIik7XG5cblx0bGlzdEJpbmRpbmcuZmlsdGVyKFxuXHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0cGF0aDogXCJ0YXJnZXRcIixcblx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5TdGFydHNXaXRoLFxuXHRcdFx0dmFsdWUxOiBzUGF0aFRvQmVSZW1vdmVkXG5cdFx0fSlcblx0KTtcblxuXHRyZXR1cm4gbGlzdEJpbmRpbmcuZ2V0Q3VycmVudENvbnRleHRzKCkubWFwKGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIG9Db250ZXh0LmdldE9iamVjdCgpO1xuXHR9KTtcbn1cbmZ1bmN0aW9uIGdldE1lc3NhZ2VzKGJCb3VuZE1lc3NhZ2VzOiBib29sZWFuID0gZmFsc2UsIGJUcmFuc2l0aW9uT25seTogYm9vbGVhbiA9IGZhbHNlLCBzUGF0aFRvQmVSZW1vdmVkPzogc3RyaW5nKSB7XG5cdGxldCBpO1xuXHRjb25zdCBvTWVzc2FnZU1hbmFnZXIgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCksXG5cdFx0b01lc3NhZ2VNb2RlbCA9IG9NZXNzYWdlTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKSxcblx0XHRvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLFxuXHRcdGFUcmFuc2l0aW9uTWVzc2FnZXMgPSBbXTtcblx0bGV0IGFNZXNzYWdlczogYW55W10gPSBbXTtcblx0aWYgKGJCb3VuZE1lc3NhZ2VzICYmIGJUcmFuc2l0aW9uT25seSAmJiBzUGF0aFRvQmVSZW1vdmVkKSB7XG5cdFx0YU1lc3NhZ2VzID0gZ2V0TWVzc2FnZXNGcm9tTWVzc2FnZU1vZGVsKG9NZXNzYWdlTW9kZWwsIHNQYXRoVG9CZVJlbW92ZWQpO1xuXHR9IGVsc2Uge1xuXHRcdGFNZXNzYWdlcyA9IG9NZXNzYWdlTW9kZWwuZ2V0T2JqZWN0KFwiL1wiKTtcblx0fVxuXHRmb3IgKGkgPSAwOyBpIDwgYU1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKFxuXHRcdFx0KCFiVHJhbnNpdGlvbk9ubHkgfHwgYU1lc3NhZ2VzW2ldLnBlcnNpc3RlbnQpICYmXG5cdFx0XHQoKGJCb3VuZE1lc3NhZ2VzICYmIGFNZXNzYWdlc1tpXS50YXJnZXQgIT09IFwiXCIpIHx8ICghYkJvdW5kTWVzc2FnZXMgJiYgKCFhTWVzc2FnZXNbaV0udGFyZ2V0IHx8IGFNZXNzYWdlc1tpXS50YXJnZXQgPT09IFwiXCIpKSlcblx0XHQpIHtcblx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXMucHVzaChhTWVzc2FnZXNbaV0pO1xuXHRcdH1cblx0fVxuXG5cdGZvciAoaSA9IDA7IGkgPCBhVHJhbnNpdGlvbk1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aWYgKFxuXHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS5jb2RlID09PSBcIjUwM1wiICYmXG5cdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLm1lc3NhZ2UgIT09IFwiXCIgJiZcblx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0ubWVzc2FnZS5pbmRleE9mKG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19CQUNLRU5EX1BSRUZJWFwiKSkgPT09IC0xXG5cdFx0KSB7XG5cdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLm1lc3NhZ2UgPSBgXFxuJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfQkFDS0VORF9QUkVGSVhcIil9JHtcblx0XHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS5tZXNzYWdlXG5cdFx0XHR9YDtcblx0XHR9XG5cdH1cblx0Ly9GaWx0ZXJpbmcgbWVzc2FnZXMgYWdhaW4gaGVyZSB0byBhdm9pZCBzaG93aW5nIHB1cmUgdGVjaG5pY2FsIG1lc3NhZ2VzIHJhaXNlZCBieSB0aGUgbW9kZWxcblx0Y29uc3QgYmFja2VuZE1lc3NhZ2VzOiBhbnkgPSBbXTtcblx0Zm9yIChpID0gMDsgaSA8IGFUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoXG5cdFx0XHQoYVRyYW5zaXRpb25NZXNzYWdlc1tpXS50ZWNobmljYWxEZXRhaWxzICYmXG5cdFx0XHRcdCgoYVRyYW5zaXRpb25NZXNzYWdlc1tpXS50ZWNobmljYWxEZXRhaWxzLm9yaWdpbmFsTWVzc2FnZSAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS50ZWNobmljYWxEZXRhaWxzLm9yaWdpbmFsTWVzc2FnZSAhPT0gbnVsbCkgfHxcblx0XHRcdFx0XHQoYVRyYW5zaXRpb25NZXNzYWdlc1tpXS50ZWNobmljYWxEZXRhaWxzLmh0dHBTdGF0dXMgIT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0XHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS50ZWNobmljYWxEZXRhaWxzLmh0dHBTdGF0dXMgIT09IG51bGwpKSkgfHxcblx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0uY29kZVxuXHRcdCkge1xuXHRcdFx0YmFja2VuZE1lc3NhZ2VzLnB1c2goYVRyYW5zaXRpb25NZXNzYWdlc1tpXSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBiYWNrZW5kTWVzc2FnZXM7XG59XG5mdW5jdGlvbiByZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoYkJvdW5kTWVzc2FnZXM6IGFueSwgc1BhdGhUb0JlUmVtb3ZlZD86IHN0cmluZykge1xuXHRjb25zdCBhTWVzc2FnZXNUb0JlRGVsZXRlZCA9IGdldE1lc3NhZ2VzKGJCb3VuZE1lc3NhZ2VzLCB0cnVlLCBzUGF0aFRvQmVSZW1vdmVkKTtcblxuXHRpZiAoYU1lc3NhZ2VzVG9CZURlbGV0ZWQubGVuZ3RoID4gMCkge1xuXHRcdENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKS5yZW1vdmVNZXNzYWdlcyhhTWVzc2FnZXNUb0JlRGVsZXRlZCk7XG5cdH1cbn1cbi8vVE9ETzogVGhpcyBtdXN0IGJlIG1vdmVkIG91dCBvZiBtZXNzYWdlIGhhbmRsaW5nXG5mdW5jdGlvbiBzZXRNZXNzYWdlU3VidGl0bGUob1RhYmxlOiBUYWJsZSwgYUNvbnRleHRzOiBDb250ZXh0W10sIG1lc3NhZ2U6IE1lc3NhZ2VXaXRoSGVhZGVyKSB7XG5cdGlmIChtZXNzYWdlLmFkZGl0aW9uYWxUZXh0ID09PSB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBzdWJ0aXRsZUNvbHVtbiA9IChvVGFibGUuZ2V0UGFyZW50KCkgYXMgYW55KS5nZXRJZGVudGlmaWVyQ29sdW1uKCk7XG5cdFx0Y29uc3QgZXJyb3JDb250ZXh0ID0gYUNvbnRleHRzLmZpbmQoZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRcdHJldHVybiBtZXNzYWdlLmdldFRhcmdldHMoKVswXS5pbmRleE9mKG9Db250ZXh0LmdldFBhdGgoKSkgIT09IC0xO1xuXHRcdH0pO1xuXHRcdG1lc3NhZ2UuYWRkaXRpb25hbFRleHQgPSBlcnJvckNvbnRleHQgPyBlcnJvckNvbnRleHQuZ2V0T2JqZWN0KClbc3VidGl0bGVDb2x1bW5dIDogdW5kZWZpbmVkO1xuXHR9XG59XG5cbi8qKlxuICogVGhlIG1ldGhvZCByZXRyaWV2ZXMgdGhlIHZpc2libGUgc2VjdGlvbnMgZnJvbSBhbiBvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gb09iamVjdFBhZ2VMYXlvdXQgVGhlIG9iamVjdFBhZ2VMYXlvdXQgb2JqZWN0IGZvciB3aGljaCB3ZSB3YW50IHRvIHJldHJpZXZlIHRoZSB2aXNpYmxlIHNlY3Rpb25zLlxuICogQHJldHVybnMgQXJyYXkgb2YgdmlzaWJsZSBzZWN0aW9ucy5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0KG9PYmplY3RQYWdlTGF5b3V0OiBDb250cm9sIHwgT2JqZWN0UGFnZUxheW91dCkge1xuXHRyZXR1cm4gKG9PYmplY3RQYWdlTGF5b3V0IGFzIE9iamVjdFBhZ2VMYXlvdXQpLmdldFNlY3Rpb25zKCkuZmlsdGVyKGZ1bmN0aW9uIChvU2VjdGlvbjogT2JqZWN0UGFnZVNlY3Rpb24pIHtcblx0XHRyZXR1cm4gb1NlY3Rpb24uZ2V0VmlzaWJsZSgpO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiBjb250cm9sIGlkcyBmcm9tIG1lc3NhZ2UgYXJlIGEgcGFydCBvZiBhIGdpdmVuIHN1YnNlY3Rpb24uXG4gKlxuICogQHBhcmFtIHN1YlNlY3Rpb25cbiAqIEBwYXJhbSBvTWVzc2FnZU9iamVjdFxuICogQHJldHVybnMgU3ViU2VjdGlvbiBtYXRjaGluZyBjb250cm9sIGlkcy5cbiAqL1xuZnVuY3Rpb24gZ2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb24oc3ViU2VjdGlvbjogT2JqZWN0UGFnZVN1YlNlY3Rpb24sIG9NZXNzYWdlT2JqZWN0OiBNZXNzYWdlV2l0aEhlYWRlcik6IFVJNUVsZW1lbnRbXSB7XG5cdHJldHVybiBzdWJTZWN0aW9uXG5cdFx0LmZpbmRFbGVtZW50cyh0cnVlLCAob0VsZW06IGFueSkgPT4ge1xuXHRcdFx0cmV0dXJuIGZuRmlsdGVyVXBvbklkcyhvTWVzc2FnZU9iamVjdC5nZXRDb250cm9sSWRzKCksIG9FbGVtKTtcblx0XHR9KVxuXHRcdC5zb3J0KGZ1bmN0aW9uIChhOiBhbnksIGI6IGFueSkge1xuXHRcdFx0Ly8gY29udHJvbHMgYXJlIHNvcnRlZCBpbiBvcmRlciB0byBoYXZlIHRoZSB0YWJsZSBvbiB0b3Agb2YgdGhlIGFycmF5XG5cdFx0XHQvLyBpdCB3aWxsIGhlbHAgdG8gY29tcHV0ZSB0aGUgc3VidGl0bGUgb2YgdGhlIG1lc3NhZ2UgYmFzZWQgb24gdGhlIHR5cGUgb2YgcmVsYXRlZCBjb250cm9sc1xuXHRcdFx0aWYgKGEuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSAmJiAhYi5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpKSB7XG5cdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAxO1xuXHRcdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRUYWJsZUNvbFByb3BlcnR5KG9UYWJsZTogQ29udHJvbCwgb01lc3NhZ2VPYmplY3Q6IE1lc3NhZ2VXaXRoSGVhZGVyLCBvQ29udGV4dFBhdGg/OiBhbnkpIHtcblx0Ly90aGlzIGZ1bmN0aW9uIGVzY2FwZXMgYSBzdHJpbmcgdG8gdXNlIGl0IGFzIGEgcmVnZXhcblx0Y29uc3QgZm5SZWdFeHBlc2NhcGUgPSBmdW5jdGlvbiAoczogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHMucmVwbGFjZSgvWy0vXFxcXF4kKis/LigpfFtcXF17fV0vZywgXCJcXFxcJCZcIik7XG5cdH07XG5cdC8vIGJhc2VkIG9uIHRoZSB0YXJnZXQgcGF0aCBvZiB0aGUgbWVzc2FnZSB3ZSByZXRyaWV2ZSB0aGUgcHJvcGVydHkgbmFtZS5cblx0Ly8gdG8gYWNoaWV2ZSBpdCB3ZSByZW1vdmUgdGhlIGJpbmRpbmdDb250ZXh0IHBhdGggYW5kIHRoZSByb3cgYmluZGluZyBwYXRoIGZyb20gdGhlIHRhcmdldFxuXHRpZiAoIW9Db250ZXh0UGF0aCkge1xuXHRcdG9Db250ZXh0UGF0aCA9IG5ldyBSZWdFeHAoXG5cdFx0XHRgJHtmblJlZ0V4cGVzY2FwZShgJHtvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpfS8keyhvVGFibGUgYXMgVGFibGUpLmdldFJvd0JpbmRpbmcoKS5nZXRQYXRoKCl9YCl9XFxcXCguKlxcXFwpL2Bcblx0XHQpO1xuXHR9XG5cdHJldHVybiBvTWVzc2FnZU9iamVjdC5nZXRUYXJnZXRzKClbMF0ucmVwbGFjZShvQ29udGV4dFBhdGgsIFwiXCIpO1xufVxuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gZ2l2ZXMgdGhlIGNvbHVtbiBpbmZvcm1hdGlvbiBpZiBpdCBtYXRjaGVzIHdpdGggdGhlIHByb3BlcnR5IG5hbWUgZnJvbSB0YXJnZXQgb2YgbWVzc2FnZS5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlXG4gKiBAcGFyYW0gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHlcbiAqIEByZXR1cm5zIENvbHVtbiBuYW1lIGFuZCBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gZ2V0VGFibGVDb2xJbmZvKG9UYWJsZTogQ29udHJvbCwgc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk6IHN0cmluZykge1xuXHRsZXQgc1RhYmxlVGFyZ2V0Q29sTmFtZTogc3RyaW5nO1xuXHRsZXQgb1RhYmxlVGFyZ2V0Q29sID0gKG9UYWJsZSBhcyBUYWJsZSkuZ2V0Q29sdW1ucygpLmZpbmQoZnVuY3Rpb24gKGNvbHVtbjogYW55KSB7XG5cdFx0cmV0dXJuIGNvbHVtbi5nZXREYXRhUHJvcGVydHkoKSA9PSBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTtcblx0fSk7XG5cdGlmICghb1RhYmxlVGFyZ2V0Q29sKSB7XG5cdFx0LyogSWYgdGhlIHRhcmdldCBjb2x1bW4gaXMgbm90IGZvdW5kLCB3ZSBjaGVjayBmb3IgYSBjdXN0b20gY29sdW1uICovXG5cdFx0Y29uc3Qgb0N1c3RvbUNvbHVtbiA9IChvVGFibGUgYXMgVGFibGUpXG5cdFx0XHQuZ2V0Q29udHJvbERlbGVnYXRlKClcblx0XHRcdC5nZXRDb2x1bW5zRm9yKG9UYWJsZSlcblx0XHRcdC5maW5kKGZ1bmN0aW9uIChvQ29sdW1uOiBhbnkpIHtcblx0XHRcdFx0aWYgKCEhb0NvbHVtbi50ZW1wbGF0ZSAmJiBvQ29sdW1uLnByb3BlcnR5SW5mb3MpIHtcblx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0b0NvbHVtbi5wcm9wZXJ0eUluZm9zWzBdID09PSBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSB8fFxuXHRcdFx0XHRcdFx0b0NvbHVtbi5wcm9wZXJ0eUluZm9zWzBdLnJlcGxhY2UoXCJQcm9wZXJ0eTo6XCIsIFwiXCIpID09PSBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRpZiAob0N1c3RvbUNvbHVtbikge1xuXHRcdFx0b1RhYmxlVGFyZ2V0Q29sID0gb0N1c3RvbUNvbHVtbjtcblx0XHRcdHNUYWJsZVRhcmdldENvbFByb3BlcnR5ID0gKG9UYWJsZVRhcmdldENvbCBhcyBhbnkpPy5uYW1lO1xuXG5cdFx0XHRzVGFibGVUYXJnZXRDb2xOYW1lID0gKG9UYWJsZSBhcyBhbnkpXG5cdFx0XHRcdC5nZXRDb2x1bW5zKClcblx0XHRcdFx0LmZpbmQoZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA9PT0gb0NvbHVtbi5nZXREYXRhUHJvcGVydHkoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmdldEhlYWRlcigpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvKiBJZiB0aGUgdGFyZ2V0IGNvbHVtbiBpcyBub3QgZm91bmQsIHdlIGNoZWNrIGZvciBhIGZpZWxkIGdyb3VwICovXG5cdFx0XHRjb25zdCBhQ29sdW1ucyA9IChvVGFibGUgYXMgVGFibGUpLmdldENvbnRyb2xEZWxlZ2F0ZSgpLmdldENvbHVtbnNGb3Iob1RhYmxlKTtcblx0XHRcdG9UYWJsZVRhcmdldENvbCA9IGFDb2x1bW5zLmZpbmQoZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0XHRpZiAob0NvbHVtbi5rZXkuaW5kZXhPZihcIjo6RmllbGRHcm91cDo6XCIpICE9PSAtMSkge1xuXHRcdFx0XHRcdHJldHVybiBvQ29sdW1uLnByb3BlcnR5SW5mb3M/LmZpbmQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFDb2x1bW5zLmZpbmQoZnVuY3Rpb24gKHRhYmxlQ29sdW1uOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRhYmxlQ29sdW1uLnJlbGF0aXZlUGF0aCA9PT0gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHQvKiBjaGVjayBpZiB0aGUgY29sdW1uIHdpdGggdGhlIGZpZWxkIGdyb3VwIGlzIHZpc2libGUgaW4gdGhlIHRhYmxlOiAqL1xuXHRcdFx0bGV0IGJJc1RhYmxlVGFyZ2V0Q29sVmlzaWJsZSA9IGZhbHNlO1xuXHRcdFx0aWYgKG9UYWJsZVRhcmdldENvbCAmJiAob1RhYmxlVGFyZ2V0Q29sIGFzIGFueSkubGFiZWwpIHtcblx0XHRcdFx0YklzVGFibGVUYXJnZXRDb2xWaXNpYmxlID0gKG9UYWJsZSBhcyBUYWJsZSkuZ2V0Q29sdW1ucygpLnNvbWUoZnVuY3Rpb24gKGNvbHVtbjogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNvbHVtbi5nZXRIZWFkZXIoKSA9PT0gKG9UYWJsZVRhcmdldENvbCBhcyBhbnkpLmxhYmVsO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHNUYWJsZVRhcmdldENvbE5hbWUgPSBiSXNUYWJsZVRhcmdldENvbFZpc2libGUgJiYgKG9UYWJsZVRhcmdldENvbCBhcyBhbnkpLmxhYmVsO1xuXHRcdFx0c1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPSBiSXNUYWJsZVRhcmdldENvbFZpc2libGUgJiYgKG9UYWJsZVRhcmdldENvbCBhcyBhbnkpLmtleTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0c1RhYmxlVGFyZ2V0Q29sTmFtZSA9IG9UYWJsZVRhcmdldENvbCAmJiBvVGFibGVUYXJnZXRDb2wuZ2V0SGVhZGVyKCk7XG5cdH1cblx0cmV0dXJuIHsgc1RhYmxlVGFyZ2V0Q29sTmFtZTogc1RhYmxlVGFyZ2V0Q29sTmFtZSwgc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk6IHNUYWJsZVRhcmdldENvbFByb3BlcnR5IH07XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBnaXZlcyBUYWJsZSBhbmQgY29sdW1uIGluZm8gaWYgYW55IG9mIGl0IG1hdGNoZXMgdGhlIHRhcmdldCBmcm9tIE1lc3NhZ2UuXG4gKlxuICogQHBhcmFtIG9UYWJsZVxuICogQHBhcmFtIG9NZXNzYWdlT2JqZWN0XG4gKiBAcGFyYW0gb0VsZW1lbnRcbiAqIEBwYXJhbSBvUm93QmluZGluZ1xuICogQHJldHVybnMgVGFibGUgaW5mbyBtYXRjaGluZyB0aGUgbWVzc2FnZSB0YXJnZXQuXG4gKi9cbmZ1bmN0aW9uIGdldFRhYmxlQW5kVGFyZ2V0SW5mbyhvVGFibGU6IFRhYmxlLCBvTWVzc2FnZU9iamVjdDogTWVzc2FnZVdpdGhIZWFkZXIsIG9FbGVtZW50OiBhbnksIG9Sb3dCaW5kaW5nOiBCaW5kaW5nKTogVGFyZ2V0VGFibGVJbmZvVHlwZSB7XG5cdGNvbnN0IG9UYXJnZXRUYWJsZUluZm86IGFueSA9IHt9O1xuXHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5ID0gZ2V0VGFibGVDb2xQcm9wZXJ0eShvVGFibGUsIG9NZXNzYWdlT2JqZWN0KTtcblx0Y29uc3Qgb1RhYmxlQ29sSW5mbyA9IGdldFRhYmxlQ29sSW5mbyhvVGFibGUsIG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkpO1xuXHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyA9IG9FbGVtZW50LmlzQShcInNhcC51aS50YWJsZS5UYWJsZVwiKVxuXHRcdD8gKG9Sb3dCaW5kaW5nIGFzIE9EYXRhTGlzdEJpbmRpbmcpLmdldENvbnRleHRzKClcblx0XHQ6IChvUm93QmluZGluZyBhcyBPRGF0YUxpc3RCaW5kaW5nKS5nZXRDdXJyZW50Q29udGV4dHMoKTtcblx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lID0gb1RhYmxlQ29sSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lO1xuXHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5ID0gb1RhYmxlQ29sSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTtcblx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0ID0gb1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dCaW5kaW5nQ29udGV4dHMuZmluZChmdW5jdGlvbiAocm93Q29udGV4dDogYW55KSB7XG5cdFx0cmV0dXJuIHJvd0NvbnRleHQgJiYgb01lc3NhZ2VPYmplY3QuZ2V0VGFyZ2V0cygpWzBdLmluZGV4T2Yocm93Q29udGV4dC5nZXRQYXRoKCkpID09PSAwO1xuXHR9KTtcblx0cmV0dXJuIG9UYXJnZXRUYWJsZUluZm87XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBhQ29udHJvbElkc1xuICogQHBhcmFtIG9JdGVtXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBpdGVtIG1hdGNoZXMgb25lIG9mIHRoZSBjb250cm9sc1xuICovXG5mdW5jdGlvbiBmbkZpbHRlclVwb25JZHMoYUNvbnRyb2xJZHM6IHN0cmluZ1tdLCBvSXRlbTogVUk1RWxlbWVudCk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gYUNvbnRyb2xJZHMuc29tZShmdW5jdGlvbiAoc0NvbnRyb2xJZCkge1xuXHRcdGlmIChzQ29udHJvbElkID09PSBvSXRlbS5nZXRJZCgpKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9KTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGdpdmVzIHRoZSBncm91cCBuYW1lIGhhdmluZyBzZWN0aW9uIGFuZCBzdWJzZWN0aW9uIGRhdGEuXG4gKlxuICogQHBhcmFtIHNlY3Rpb25cbiAqIEBwYXJhbSBzdWJTZWN0aW9uXG4gKiBAcGFyYW0gYk11bHRpcGxlU3ViU2VjdGlvbnNcbiAqIEBwYXJhbSBvVGFyZ2V0VGFibGVJbmZvXG4gKiBAcGFyYW0gcmVzb3VyY2VNb2RlbFxuICogQHJldHVybnMgR3JvdXAgbmFtZS5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU2VjdGlvbkdyb3VwTmFtZShcblx0c2VjdGlvbjogT2JqZWN0UGFnZVNlY3Rpb24sXG5cdHN1YlNlY3Rpb246IE9iamVjdFBhZ2VTdWJTZWN0aW9uLFxuXHRiTXVsdGlwbGVTdWJTZWN0aW9uczogYm9vbGVhbixcblx0b1RhcmdldFRhYmxlSW5mbzogVGFyZ2V0VGFibGVJbmZvVHlwZSxcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbFxuKTogc3RyaW5nIHtcblx0cmV0dXJuIChcblx0XHRzZWN0aW9uLmdldFRpdGxlKCkgK1xuXHRcdChzdWJTZWN0aW9uLmdldFRpdGxlKCkgJiYgYk11bHRpcGxlU3ViU2VjdGlvbnMgPyBgLCAke3N1YlNlY3Rpb24uZ2V0VGl0bGUoKX1gIDogXCJcIikgK1xuXHRcdChvVGFyZ2V0VGFibGVJbmZvID8gYCwgJHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX01FU1NBR0VfR1JPVVBfVElUTEVfVEFCTEVfREVOT01JTkFUT1JcIil9OiAke29UYXJnZXRUYWJsZUluZm8udGFibGVIZWFkZXJ9YCA6IFwiXCIpXG5cdCk7XG59XG5cbmZ1bmN0aW9uIGJJc09ycGhhbkVsZW1lbnQob0VsZW1lbnQ6IFVJNUVsZW1lbnQsIGFFbGVtZW50czogVUk1RWxlbWVudFtdKTogYm9vbGVhbiB7XG5cdHJldHVybiAhYUVsZW1lbnRzLnNvbWUoZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRsZXQgb1BhcmVudEVsZW1lbnQgPSBvRWxlbWVudC5nZXRQYXJlbnQoKTtcblx0XHR3aGlsZSAob1BhcmVudEVsZW1lbnQgJiYgb1BhcmVudEVsZW1lbnQgIT09IG9FbGVtKSB7XG5cdFx0XHRvUGFyZW50RWxlbWVudCA9IG9QYXJlbnRFbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1BhcmVudEVsZW1lbnQgPyB0cnVlIDogZmFsc2U7XG5cdH0pO1xufVxuXG4vKipcbiAqIFN0YXRpYyBmdW5jdGlvbnMgZm9yIEZpb3JpIE1lc3NhZ2UgSGFuZGxpbmdcbiAqXG4gKiBAbmFtZXNwYWNlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuYWN0aW9ucy5tZXNzYWdlSGFuZGxpbmdcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGV4cGVyaW1lbnRhbCB1c2UhIDxici8+PGI+VGhpcyBpcyBvbmx5IGEgUE9DIGFuZCBtYXliZSBkZWxldGVkPC9iPlxuICogQHNpbmNlIDEuNTYuMFxuICovXG5jb25zdCBtZXNzYWdlSGFuZGxpbmc6IG1lc3NhZ2VIYW5kbGluZ1R5cGUgPSB7XG5cdGdldE1lc3NhZ2VzOiBnZXRNZXNzYWdlcyxcblx0c2hvd1VuYm91bmRNZXNzYWdlczogc2hvd1VuYm91bmRNZXNzYWdlcyxcblx0cmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlczogcmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcyxcblx0cmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXM6IHJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzLFxuXHRtb2RpZnlFVGFnTWVzc2FnZXNPbmx5OiBmbk1vZGlmeUVUYWdNZXNzYWdlc09ubHksXG5cdGdldFJldHJ5QWZ0ZXJNZXNzYWdlOiBnZXRSZXRyeUFmdGVyTWVzc2FnZSxcblx0cHJlcGFyZU1lc3NhZ2VWaWV3Rm9yRGlhbG9nOiBwcmVwYXJlTWVzc2FnZVZpZXdGb3JEaWFsb2csXG5cdHNldE1lc3NhZ2VTdWJ0aXRsZTogc2V0TWVzc2FnZVN1YnRpdGxlLFxuXHRnZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dDogZ2V0VmlzaWJsZVNlY3Rpb25zRnJvbU9iamVjdFBhZ2VMYXlvdXQsXG5cdGdldENvbnRyb2xGcm9tTWVzc2FnZVJlbGF0aW5nVG9TdWJTZWN0aW9uOiBnZXRDb250cm9sRnJvbU1lc3NhZ2VSZWxhdGluZ1RvU3ViU2VjdGlvbixcblx0Zm5GaWx0ZXJVcG9uSWRzOiBmbkZpbHRlclVwb25JZHMsXG5cdGdldFRhYmxlQW5kVGFyZ2V0SW5mbzogZ2V0VGFibGVBbmRUYXJnZXRJbmZvLFxuXHRjcmVhdGVTZWN0aW9uR3JvdXBOYW1lOiBjcmVhdGVTZWN0aW9uR3JvdXBOYW1lLFxuXHRiSXNPcnBoYW5FbGVtZW50OiBiSXNPcnBoYW5FbGVtZW50LFxuXHRnZXRMYXN0QWN0aW9uVGV4dEFuZEFjdGlvbk5hbWU6IGdldExhc3RBY3Rpb25UZXh0QW5kQWN0aW9uTmFtZSxcblx0Z2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZTogZ2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZSxcblx0Z2V0VGFibGVDb2xJbmZvOiBnZXRUYWJsZUNvbEluZm8sXG5cdGdldFRhYmxlQ29sUHJvcGVydHk6IGdldFRhYmxlQ29sUHJvcGVydHksXG5cdGdldE1lc3NhZ2VTdWJ0aXRsZTogZ2V0TWVzc2FnZVN1YnRpdGxlLFxuXHRkZXRlcm1pbmVDb2x1bW5JbmZvOiBkZXRlcm1pbmVDb2x1bW5JbmZvLFxuXHRmZXRjaENvbHVtbkluZm86IGZldGNoQ29sdW1uSW5mbyxcblx0Z2V0VGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0Rm9yVGV4dEFubm90YXRpb246IGdldFRhYmxlRmlyc3RDb2xCaW5kaW5nQ29udGV4dEZvclRleHRBbm5vdGF0aW9uLFxuXHRnZXRNZXNzYWdlUmFuazogZ2V0TWVzc2FnZVJhbmssXG5cdGZuQ2FsbGJhY2tTZXRHcm91cE5hbWU6IGZuQ2FsbGJhY2tTZXRHcm91cE5hbWUsXG5cdGdldFRhYmxlRmlyc3RDb2xWYWx1ZTogZ2V0VGFibGVGaXJzdENvbFZhbHVlLFxuXHRzZXRHcm91cE5hbWVPUERpc3BsYXlNb2RlOiBzZXRHcm91cE5hbWVPUERpc3BsYXlNb2RlLFxuXHR1cGRhdGVNZXNzYWdlT2JqZWN0R3JvdXBOYW1lOiB1cGRhdGVNZXNzYWdlT2JqZWN0R3JvdXBOYW1lLFxuXHRzZXRHcm91cE5hbWVMUlRhYmxlOiBzZXRHcm91cE5hbWVMUlRhYmxlLFxuXHRpc0NvbnRyb2xJblRhYmxlOiBpc0NvbnRyb2xJblRhYmxlLFxuXHRpc0NvbnRyb2xQYXJ0T2ZDcmVhdGlvblJvdzogaXNDb250cm9sUGFydE9mQ3JlYXRpb25Sb3dcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1lc3NhZ2VIYW5kbGluZztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFrQ0EsTUFBTUEsV0FBVyxHQUFHQyxPQUFPLENBQUNELFdBQVc7RUFDdkMsSUFBSUUsWUFBbUIsR0FBRyxFQUFFO0VBQzVCLElBQUlDLGdCQUF1QixHQUFHLEVBQUU7RUFDaEMsSUFBSUMsaUJBQXdCLEdBQUcsRUFBRTtFQUNqQyxJQUFJQyxPQUFlO0VBQ25CLElBQUlDLFdBQW1CO0VBQ3ZCLElBQUlDLFlBQXlCO0VBa0g3QixTQUFTQyx3QkFBd0IsR0FBRztJQUNuQyxJQUFJQyxrQkFBMEI7O0lBRTlCO0lBQ0EsU0FBU0MsWUFBWSxDQUFDQyxTQUFjLEVBQUU7TUFDckMsT0FBT0EsU0FBUyxDQUFDQyxRQUFRLEdBQ3RCLE1BQU0sR0FDTkQsU0FBUyxDQUFDQyxRQUFRLEdBQ2xCLFdBQVcsR0FDWEQsU0FBUyxDQUFDQyxRQUFRLENBQUNDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDQyxHQUFHLENBQUNKLFNBQVMsQ0FBQ0MsUUFBUSxDQUFDSSxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUVMLFNBQVMsQ0FBQ0MsUUFBUSxDQUFDSSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FDakgsU0FBUyxHQUNULElBQUksR0FDSkwsU0FBUyxDQUFDQyxRQUFRLEdBQ2xCLG9CQUFvQixHQUNwQixFQUFFO0lBQ047SUFDQTtJQUNBLFNBQVNLLGVBQWUsQ0FBQ04sU0FBYyxFQUFFO01BQ3hDLElBQUlPLEtBQUssR0FBRyxFQUFFO01BQ2QsSUFBSVAsU0FBUyxDQUFDUSxTQUFTLElBQUlSLFNBQVMsQ0FBQ0MsUUFBUSxJQUFJRCxTQUFTLENBQUNRLFNBQVMsS0FBS1Ysa0JBQWtCLEVBQUU7UUFDNUZTLEtBQUssSUFBSSxNQUFNLEdBQUdQLFNBQVMsQ0FBQ0MsUUFBUSxHQUFHLGVBQWUsR0FBR0QsU0FBUyxDQUFDUSxTQUFTLEdBQUcsa0JBQWtCO1FBQ2pHVixrQkFBa0IsR0FBR0UsU0FBUyxDQUFDUSxTQUFTO01BQ3pDO01BQ0EsT0FBT0QsS0FBSztJQUNiOztJQUVBO0lBQ0EsU0FBU0UsUUFBUSxHQUFHO01BQ25CLE1BQU1DLEdBQUcsR0FBRyxrQkFBa0IsQ0FBQyxDQUFDO01BQ2hDLE9BQU8sQ0FDTjtRQUFFRixTQUFTLEVBQUUsRUFBRTtRQUFFUCxRQUFRLEVBQUcsR0FBRVMsR0FBSTtNQUFTLENBQUMsRUFDNUM7UUFBRUYsU0FBUyxFQUFFLEVBQUU7UUFBRVAsUUFBUSxFQUFHLEdBQUVTLEdBQUk7TUFBYSxDQUFDLEVBQ2hEO1FBQUVGLFNBQVMsRUFBRSxhQUFhO1FBQUVQLFFBQVEsRUFBRyxHQUFFUyxHQUFJO01BQTZDLENBQUMsRUFDM0Y7UUFBRUYsU0FBUyxFQUFFLGFBQWE7UUFBRVAsUUFBUSxFQUFHLEdBQUVTLEdBQUk7TUFBMkMsQ0FBQyxFQUN6RjtRQUFFRixTQUFTLEVBQUUsYUFBYTtRQUFFUCxRQUFRLEVBQUcsR0FBRVMsR0FBSTtNQUFtRCxDQUFDLEVBQ2pHO1FBQUVGLFNBQVMsRUFBRSxhQUFhO1FBQUVQLFFBQVEsRUFBRyxHQUFFUyxHQUFJO01BQWdELENBQUMsRUFDOUY7UUFBRUYsU0FBUyxFQUFFLGlCQUFpQjtRQUFFUCxRQUFRLEVBQUcsR0FBRVMsR0FBSTtNQUE4QyxDQUFDLEVBQ2hHO1FBQUVGLFNBQVMsRUFBRSxpQkFBaUI7UUFBRVAsUUFBUSxFQUFHLEdBQUVTLEdBQUk7TUFBMEMsQ0FBQyxFQUM1RjtRQUFFRixTQUFTLEVBQUUsaUJBQWlCO1FBQUVQLFFBQVEsRUFBRyxHQUFFUyxHQUFJO01BQWtELENBQUMsRUFDcEc7UUFBRUYsU0FBUyxFQUFFLGlCQUFpQjtRQUFFUCxRQUFRLEVBQUcsR0FBRVMsR0FBSTtNQUF1QyxDQUFDLEVBQ3pGO1FBQUVGLFNBQVMsRUFBRSxpQkFBaUI7UUFBRVAsUUFBUSxFQUFHLEdBQUVTLEdBQUk7TUFBK0IsQ0FBQyxFQUNqRjtRQUFFRixTQUFTLEVBQUUsaUJBQWlCO1FBQUVQLFFBQVEsRUFBRyxHQUFFUyxHQUFJO01BQW1DLENBQUMsRUFDckY7UUFBRUYsU0FBUyxFQUFFLFVBQVU7UUFBRVAsUUFBUSxFQUFHLEdBQUVTLEdBQUk7TUFBYSxDQUFDLEVBQ3hEO1FBQUVGLFNBQVMsRUFBRSxVQUFVO1FBQUVQLFFBQVEsRUFBRyxHQUFFUyxHQUFJO01BQWdCLENBQUMsQ0FDM0Q7SUFDRjtJQUVBLElBQUlILEtBQUssR0FBRyxjQUFjLEdBQUcscUJBQXFCLEdBQUcsbURBQW1EO0lBQ3hHRSxRQUFRLEVBQUUsQ0FBQ0UsT0FBTyxDQUFDLFVBQVVYLFNBQWtELEVBQUU7TUFDaEZPLEtBQUssR0FBSSxHQUFFQSxLQUFLLEdBQUdELGVBQWUsQ0FBQ04sU0FBUyxDQUFFLEdBQUVELFlBQVksQ0FBQ0MsU0FBUyxDQUFFLEtBQUk7SUFDN0UsQ0FBQyxDQUFDO0lBQ0YsT0FBT08sS0FBSztFQUNiO0VBQ0EsU0FBU0ssbUJBQW1CLEdBQUc7SUFDOUIsT0FBTyxLQUFLLEdBQUcsb0JBQW9CLEdBQUcscUJBQXFCO0VBQzVEO0VBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLDJCQUEyQixDQUFDQyxTQUFnQixFQUFFO0lBQ3RELElBQUlDLGdCQUFnQixHQUFHMUIsV0FBVyxDQUFDMkIsSUFBSTtJQUN2QyxNQUFNQyxPQUFPLEdBQUdILFNBQVMsQ0FBQ0ksTUFBTTtJQUNoQyxNQUFNQyxhQUFrQixHQUFHO01BQUVDLEtBQUssRUFBRSxDQUFDO01BQUVDLE9BQU8sRUFBRSxDQUFDO01BQUVDLE9BQU8sRUFBRSxDQUFDO01BQUVDLFdBQVcsRUFBRTtJQUFFLENBQUM7SUFFL0UsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdQLE9BQU8sRUFBRU8sQ0FBQyxFQUFFLEVBQUU7TUFDakMsRUFBRUwsYUFBYSxDQUFDTCxTQUFTLENBQUNVLENBQUMsQ0FBQyxDQUFDQyxPQUFPLEVBQUUsQ0FBQztJQUN4QztJQUNBLElBQUlOLGFBQWEsQ0FBQzlCLFdBQVcsQ0FBQytCLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRTtNQUN6Q0wsZ0JBQWdCLEdBQUcxQixXQUFXLENBQUMrQixLQUFLO0lBQ3JDLENBQUMsTUFBTSxJQUFJRCxhQUFhLENBQUM5QixXQUFXLENBQUNnQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDbEROLGdCQUFnQixHQUFHMUIsV0FBVyxDQUFDZ0MsT0FBTztJQUN2QyxDQUFDLE1BQU0sSUFBSUYsYUFBYSxDQUFDOUIsV0FBVyxDQUFDaUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO01BQ2xEUCxnQkFBZ0IsR0FBRzFCLFdBQVcsQ0FBQ2lDLE9BQU87SUFDdkMsQ0FBQyxNQUFNLElBQUlILGFBQWEsQ0FBQzlCLFdBQVcsQ0FBQ2tDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRTtNQUN0RFIsZ0JBQWdCLEdBQUcxQixXQUFXLENBQUNrQyxXQUFXO0lBQzNDO0lBQ0EsT0FBT1IsZ0JBQWdCO0VBQ3hCO0VBQ0E7RUFDQTtFQUNBLFNBQVNXLHdCQUF3QixDQUFDQyxlQUFvQixFQUFFQyxlQUErQixFQUFFQyxrQkFBdUMsRUFBRTtJQUNqSSxNQUFNZixTQUFTLEdBQUdhLGVBQWUsQ0FBQ0csZUFBZSxFQUFFLENBQUNDLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDbEUsSUFBSUMsaUJBQWlCLEdBQUcsS0FBSztJQUM3QixJQUFJQyxZQUFZLEdBQUcsRUFBRTtJQUNyQm5CLFNBQVMsQ0FBQ0gsT0FBTyxDQUFDLFVBQVV1QixRQUFhLEVBQUVWLENBQU0sRUFBRTtNQUNsRCxNQUFNVyxpQkFBaUIsR0FBR0QsUUFBUSxDQUFDRSxtQkFBbUIsSUFBSUYsUUFBUSxDQUFDRSxtQkFBbUIsRUFBRTtNQUN4RixJQUFJRCxpQkFBaUIsSUFBSUEsaUJBQWlCLENBQUNFLFVBQVUsS0FBSyxHQUFHLElBQUlGLGlCQUFpQixDQUFDRyx3QkFBd0IsRUFBRTtRQUM1RyxJQUFJVCxrQkFBa0IsRUFBRTtVQUN2QkksWUFBWSxHQUNYQSxZQUFZLElBQUlMLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLHFFQUFxRSxDQUFDO1FBQ2hILENBQUMsTUFBTTtVQUNOTixZQUFZLEdBQUdBLFlBQVksSUFBSUwsZUFBZSxDQUFDVyxPQUFPLENBQUMsNkNBQTZDLENBQUM7UUFDdEc7UUFDQVosZUFBZSxDQUFDYSxjQUFjLENBQUMxQixTQUFTLENBQUNVLENBQUMsQ0FBQyxDQUFDO1FBQzVDVSxRQUFRLENBQUNPLFVBQVUsQ0FBQ1IsWUFBWSxDQUFDO1FBQ2pDQyxRQUFRLENBQUNRLE1BQU0sR0FBRyxFQUFFO1FBQ3BCZixlQUFlLENBQUNnQixXQUFXLENBQUNULFFBQVEsQ0FBQztRQUNyQ0YsaUJBQWlCLEdBQUcsSUFBSTtNQUN6QjtJQUNELENBQUMsQ0FBQztJQUNGLE9BQU9BLGlCQUFpQjtFQUN6QjtFQUNBO0VBQ0EsU0FBU1ksa0JBQWtCLEdBQUc7SUFDN0JsRCxPQUFPLENBQUNtRCxLQUFLLEVBQUU7SUFDZmxELFdBQVcsQ0FBQ21ELFVBQVUsQ0FBQyxLQUFLLENBQUM7SUFDN0J2RCxZQUFZLEdBQUcsRUFBRTtJQUNqQixNQUFNd0QsbUJBQXdCLEdBQUduRCxZQUFZLENBQUNvRCxRQUFRLEVBQUU7SUFDeEQsSUFBSUQsbUJBQW1CLEVBQUU7TUFDeEJBLG1CQUFtQixDQUFDRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEM7SUFDQUMsK0JBQStCLEVBQUU7RUFDbEM7RUFDQSxTQUFTQyxvQkFBb0IsQ0FBQ2pCLFFBQWEsRUFBRWtCLGNBQW9CLEVBQUU7SUFDbEUsTUFBTUMsSUFBSSxHQUFHLElBQUlDLElBQUksRUFBRTtJQUN2QixNQUFNbkIsaUJBQWlCLEdBQUdELFFBQVEsQ0FBQ0UsbUJBQW1CLEVBQUU7SUFDeEQsTUFBTVIsZUFBZSxHQUFHMkIsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUM7SUFDcEUsSUFBSUMsa0JBQWtCO0lBQ3RCLElBQUl0QixpQkFBaUIsSUFBSUEsaUJBQWlCLENBQUNFLFVBQVUsS0FBSyxHQUFHLElBQUlGLGlCQUFpQixDQUFDdUIsVUFBVSxFQUFFO01BQzlGLE1BQU1DLFdBQVcsR0FBR3hCLGlCQUFpQixDQUFDdUIsVUFBVTtNQUNoRCxJQUFJRSxXQUFXO01BQ2YsSUFBSVAsSUFBSSxDQUFDUSxXQUFXLEVBQUUsS0FBS0YsV0FBVyxDQUFDRSxXQUFXLEVBQUUsRUFBRTtRQUNyRDtRQUNBRCxXQUFXLEdBQUdFLFVBQVUsQ0FBQ0MsbUJBQW1CLENBQUM7VUFDNUNDLE9BQU8sRUFBRTtRQUNWLENBQUMsQ0FBQztRQUNGUCxrQkFBa0IsR0FBRzdCLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLG9DQUFvQyxFQUFFLENBQUNxQixXQUFXLENBQUNLLE1BQU0sQ0FBQ04sV0FBVyxDQUFDLENBQUMsQ0FBQztNQUN0SCxDQUFDLE1BQU0sSUFBSU4sSUFBSSxDQUFDUSxXQUFXLEVBQUUsSUFBSUYsV0FBVyxDQUFDRSxXQUFXLEVBQUUsRUFBRTtRQUMzRDtRQUNBLElBQUlULGNBQWMsRUFBRTtVQUNuQjtVQUNBSyxrQkFBa0IsR0FBSSxHQUFFN0IsZUFBZSxDQUFDVyxPQUFPLENBQUMsb0NBQW9DLENBQUUsSUFBR1gsZUFBZSxDQUFDVyxPQUFPLENBQy9HLG1DQUFtQyxDQUNsQyxFQUFDO1FBQ0osQ0FBQyxNQUFNLElBQUljLElBQUksQ0FBQ2EsUUFBUSxFQUFFLEtBQUtQLFdBQVcsQ0FBQ08sUUFBUSxFQUFFLElBQUliLElBQUksQ0FBQ2MsT0FBTyxFQUFFLEtBQUtSLFdBQVcsQ0FBQ1EsT0FBTyxFQUFFLEVBQUU7VUFDbEdQLFdBQVcsR0FBR0UsVUFBVSxDQUFDQyxtQkFBbUIsQ0FBQztZQUM1Q0MsT0FBTyxFQUFFO1VBQ1YsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUNKUCxrQkFBa0IsR0FBRzdCLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLG9DQUFvQyxFQUFFLENBQUNxQixXQUFXLENBQUNLLE1BQU0sQ0FBQ04sV0FBVyxDQUFDLENBQUMsQ0FBQztRQUN0SCxDQUFDLE1BQU07VUFDTjtVQUNBQyxXQUFXLEdBQUdFLFVBQVUsQ0FBQ0MsbUJBQW1CLENBQUM7WUFDNUNDLE9BQU8sRUFBRTtVQUNWLENBQUMsQ0FBQztVQUNGUCxrQkFBa0IsR0FBRzdCLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLHdDQUF3QyxFQUFFLENBQUNxQixXQUFXLENBQUNLLE1BQU0sQ0FBQ04sV0FBVyxDQUFDLENBQUMsQ0FBQztRQUMxSDtNQUNEO0lBQ0Q7SUFFQSxJQUFJeEIsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDRSxVQUFVLEtBQUssR0FBRyxJQUFJLENBQUNGLGlCQUFpQixDQUFDdUIsVUFBVSxFQUFFO01BQy9GRCxrQkFBa0IsR0FBRzdCLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLG1EQUFtRCxDQUFDO0lBQ2xHO0lBQ0EsT0FBT2tCLGtCQUFrQjtFQUMxQjtFQUVBLFNBQVNXLDJCQUEyQixDQUFDckIsbUJBQThCLEVBQUVzQixtQkFBNEIsRUFBRUMsUUFBa0IsRUFBRTtJQUN0SCxJQUFJQyxnQkFBNkI7SUFDakMsSUFBSSxDQUFDRixtQkFBbUIsRUFBRTtNQUN6QixNQUFNRyxrQkFBa0IsR0FBRyx1Q0FBdUMsR0FBRzVELG1CQUFtQixFQUFFLEdBQUcsNEJBQTRCO01BQ3pILE1BQU02RCx1QkFBdUIsR0FDNUIsNENBQTRDLEdBQUc1RSx3QkFBd0IsRUFBRSxHQUFHLDRCQUE0QjtNQUN6RzBFLGdCQUFnQixHQUFHLElBQUlHLFdBQVcsQ0FBQ0MsU0FBUyxFQUFFO1FBQzdDQyxPQUFPLEVBQUU7VUFBRUMsSUFBSSxFQUFFO1FBQVUsQ0FBQztRQUM1QkMsS0FBSyxFQUFFLFdBQVc7UUFDbEJDLFFBQVEsRUFBRSxrQkFBa0I7UUFDNUJDLFdBQVcsRUFBRSxrQkFBa0I7UUFDL0JDLElBQUksRUFBRTtVQUFFSixJQUFJLEVBQUU7UUFBTyxDQUFDO1FBQ3RCckUsU0FBUyxFQUFFLGNBQWM7UUFDekIwRSxXQUFXLEVBQUVWLGtCQUFrQixHQUFHQyx1QkFBdUI7UUFDekRVLGlCQUFpQixFQUFFO01BQ3BCLENBQUMsQ0FBQztJQUNILENBQUMsTUFBTSxJQUFJYixRQUFRLEVBQUU7TUFDcEJDLGdCQUFnQixHQUFHLElBQUlHLFdBQVcsQ0FBQ0MsU0FBUyxFQUFFO1FBQzdDQyxPQUFPLEVBQUU7VUFBRUMsSUFBSSxFQUFFO1FBQVUsQ0FBQztRQUM1QkMsS0FBSyxFQUFFLFdBQVc7UUFDbEJDLFFBQVEsRUFBRSxrQkFBa0I7UUFDNUJDLFdBQVcsRUFBRSxrQkFBa0I7UUFDL0JDLElBQUksRUFBRTtVQUFFSixJQUFJLEVBQUU7UUFBTyxDQUFDO1FBQ3RCSyxXQUFXLEVBQUUsZUFBZTtRQUM1QkMsaUJBQWlCLEVBQUU7TUFDcEIsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxNQUFNO01BQ05aLGdCQUFnQixHQUFHLElBQUlHLFdBQVcsQ0FBQztRQUNsQ0ksS0FBSyxFQUFFLFdBQVc7UUFDbEJHLElBQUksRUFBRTtVQUFFSixJQUFJLEVBQUU7UUFBTyxDQUFDO1FBQ3RCRyxXQUFXLEVBQUU7TUFDZCxDQUFDLENBQUM7SUFDSDtJQUNBcEYsWUFBWSxHQUFHLElBQUl3RixXQUFXLENBQUM7TUFDOUJDLHFCQUFxQixFQUFFLEtBQUs7TUFDNUJDLFVBQVUsRUFBRSxZQUFZO1FBQ3ZCM0YsV0FBVyxDQUFDbUQsVUFBVSxDQUFDLElBQUksQ0FBQztNQUM3QixDQUFDO01BQ0R5QyxLQUFLLEVBQUU7UUFDTlYsSUFBSSxFQUFFLEdBQUc7UUFDVFcsUUFBUSxFQUFFakI7TUFDWDtJQUNELENBQUMsQ0FBQztJQUNGM0UsWUFBWSxDQUFDNkYsYUFBYSxDQUFDLElBQUksQ0FBQztJQUNoQzlGLFdBQVcsR0FDVkEsV0FBVyxJQUNYLElBQUkrRixNQUFNLENBQUM7TUFDVkMsSUFBSSxFQUFFQyxRQUFRLENBQUNDLFVBQVUsQ0FBQyxVQUFVLENBQUM7TUFDckNDLE9BQU8sRUFBRSxLQUFLO01BQ2RDLEtBQUssRUFBRSxZQUF3QjtRQUM5Qm5HLFlBQVksQ0FBQ29HLFlBQVksRUFBRTtRQUMzQixJQUFJLENBQUNsRCxVQUFVLENBQUMsS0FBSyxDQUFDO01BQ3ZCO0lBQ0QsQ0FBQyxDQUFDO0lBQ0g7SUFDQWxELFlBQVksQ0FBQ3FHLFFBQVEsQ0FBQ2xELG1CQUFtQixDQUFDO0lBQzFDLE9BQU87TUFDTm5ELFlBQVk7TUFDWkQ7SUFDRCxDQUFDO0VBQ0Y7RUFFQSxTQUFTdUcsbUJBQW1CLENBRTNCQyxlQUF1QixFQUN2QkMsUUFBYyxFQUNkQyxvQkFBOEIsRUFDOUJ4RSxrQkFBNEIsRUFDNUJ5RSxPQUFpQixFQUNqQkMsV0FBZ0MsRUFDaENDLFlBQXNCLEVBQ3RCQyxtQkFBd0UsRUFDeEVDLFFBQWlCLEVBQ0Y7SUFDZixJQUFJQyxtQkFBbUIsR0FBRyxJQUFJLENBQUNDLFdBQVcsRUFBRTtJQUM1QyxNQUFNakYsZUFBZSxHQUFHNEIsSUFBSSxDQUFDc0QsaUJBQWlCLEVBQUU7SUFDaEQsSUFBSUMsZ0JBQWdCO0lBQ3BCLElBQUlDLG9CQUFvQjtJQUN4QixNQUFNQyxRQUFRLEdBQUcsQ0FBQyxJQUFJQyxNQUFNLENBQUM7TUFBRXBDLElBQUksRUFBRSxZQUFZO01BQUVxQyxRQUFRLEVBQUVDLGNBQWMsQ0FBQ0MsRUFBRTtNQUFFQyxNQUFNLEVBQUU7SUFBTSxDQUFDLENBQUMsQ0FBQztJQUNqRyxJQUFJQyxpQkFBc0MsR0FBRyxLQUFLO01BQ2pEQyxjQUFtQyxHQUFHLEtBQUs7SUFFNUMsSUFBSWxCLG9CQUFvQixFQUFFO01BQ3pCTSxtQkFBbUIsR0FBR0EsbUJBQW1CLENBQUNhLE1BQU0sQ0FBQ1osV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztNQUN6RTtNQUNBSSxRQUFRLENBQUNTLElBQUksQ0FBQyxJQUFJUixNQUFNLENBQUM7UUFBRXBDLElBQUksRUFBRSxZQUFZO1FBQUVxQyxRQUFRLEVBQUVDLGNBQWMsQ0FBQ08sRUFBRTtRQUFFTCxNQUFNLEVBQUU7TUFBSyxDQUFDLENBQUMsQ0FBQztNQUM1RixNQUFNTSx3QkFBd0IsR0FBRyxVQUFVQyxXQUFnQixFQUFFO1FBQzVELElBQUlDLEtBQUssR0FBR0MsUUFBUTtVQUNuQkMsUUFBUSxHQUFHeEUsSUFBSSxDQUFDeUUsSUFBSSxDQUFDSixXQUFXLENBQUMsQ0FBQyxDQUFDLENBQXlCO1FBQzdELE1BQU1LLGlCQUFpQixHQUFHMUUsSUFBSSxDQUFDeUUsSUFBSSxDQUFDSixXQUFXLENBQUMsQ0FBQyxDQUFDLENBQVk7UUFDOUQsT0FBT0csUUFBUSxFQUFFO1VBQ2hCLE1BQU1HLGlCQUFpQixHQUN0QkgsUUFBUSxZQUFZSSxNQUFNLEdBQ3RCRixpQkFBaUIsQ0FBQ0csU0FBUyxFQUFFLENBQVNDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQ0MsT0FBTyxDQUFDTCxpQkFBaUIsQ0FBQyxHQUNwRkgsUUFBUTtVQUNaLElBQUlDLFFBQVEsWUFBWUksTUFBTSxFQUFFO1lBQy9CLElBQUlOLEtBQUssR0FBR0ssaUJBQWlCLEVBQUU7Y0FDOUJMLEtBQUssR0FBR0ssaUJBQWlCO2NBQ3pCO2NBQ0FELGlCQUFpQixDQUFDTSxLQUFLLEVBQUU7WUFDMUI7WUFDQTtZQUNBLE9BQU8sS0FBSztVQUNiO1VBQ0FSLFFBQVEsR0FBR0EsUUFBUSxDQUFDSyxTQUFTLEVBQUU7UUFDaEM7UUFDQSxPQUFPLElBQUk7TUFDWixDQUFDO01BQ0RwQixRQUFRLENBQUNTLElBQUksQ0FDWixJQUFJUixNQUFNLENBQUM7UUFDVnBDLElBQUksRUFBRSxZQUFZO1FBQ2xCMkQsSUFBSSxFQUFFYix3QkFBd0I7UUFDOUJjLGFBQWEsRUFBRTtNQUNoQixDQUFDLENBQUMsQ0FDRjtJQUNGLENBQUMsTUFBTTtNQUNOO01BQ0F6QixRQUFRLENBQUNTLElBQUksQ0FBQyxJQUFJUixNQUFNLENBQUM7UUFBRXBDLElBQUksRUFBRSxRQUFRO1FBQUVxQyxRQUFRLEVBQUVDLGNBQWMsQ0FBQ08sRUFBRTtRQUFFTCxNQUFNLEVBQUU7TUFBRyxDQUFDLENBQUMsQ0FBQztJQUN2RjtJQUNBLElBQUlsQixlQUFlLElBQUlBLGVBQWUsQ0FBQ2pGLE1BQU0sRUFBRTtNQUM5Q2lGLGVBQWUsQ0FBQ3hGLE9BQU8sQ0FBQyxVQUFVdUIsUUFBYSxFQUFFO1FBQ2hELE1BQU13RyxXQUFXLEdBQUd4RyxRQUFRLENBQUN5RyxJQUFJLEdBQUd6RyxRQUFRLENBQUN5RyxJQUFJLEdBQUcsRUFBRTtRQUN0RGhILGVBQWUsQ0FBQ2dCLFdBQVcsQ0FDMUIsSUFBSWlHLE9BQU8sQ0FBQztVQUNYQyxPQUFPLEVBQUUzRyxRQUFRLENBQUM0RyxJQUFJO1VBQ3RCN0QsSUFBSSxFQUFFL0MsUUFBUSxDQUFDK0MsSUFBSTtVQUNuQnZDLE1BQU0sRUFBRSxFQUFFO1VBQ1ZxRyxVQUFVLEVBQUUsSUFBSTtVQUNoQkosSUFBSSxFQUFFRDtRQUNQLENBQUMsQ0FBQyxDQUNGO1FBQ0Q7TUFDRCxDQUFDLENBQUM7SUFDSDs7SUFDQSxNQUFNM0YsbUJBQW1CLEdBQUluRCxZQUFZLElBQUtBLFlBQVksQ0FBQ29ELFFBQVEsRUFBZ0IsSUFBSyxJQUFJZ0csU0FBUyxFQUFFO0lBQ3ZHLE1BQU1DLGVBQWUsR0FBRyxJQUFJLENBQUNDLHNCQUFzQixDQUFDdkgsZUFBZSxFQUFFNEIsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsRUFBRTNCLGtCQUFrQixDQUFDO0lBRXRJLElBQUk4RSxtQkFBbUIsQ0FBQ3pGLE1BQU0sS0FBSyxDQUFDLElBQUl5RixtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQ3dDLE9BQU8sRUFBRSxLQUFLLEtBQUssRUFBRTtNQUNuRjVCLGNBQWMsR0FBRyxJQUFJO0lBQ3RCLENBQUMsTUFBTSxJQUFJWixtQkFBbUIsQ0FBQ3pGLE1BQU0sS0FBSyxDQUFDLEVBQUU7TUFDNUNvRyxpQkFBaUIsR0FBRyxJQUFJO0lBQ3pCO0lBQ0EsSUFBSThCLHFCQUEwQjtJQUM5QixJQUFJQyxlQUFvQyxHQUFHLEVBQUU7SUFDN0MsSUFBSS9CLGlCQUFpQixJQUFLLENBQUNDLGNBQWMsSUFBSSxDQUFDZCxtQkFBb0IsRUFBRTtNQUNuRSxNQUFNNkMsWUFBWSxHQUFHM0gsZUFBZSxDQUFDRyxlQUFlLEVBQUUsQ0FBQ3lILFFBQVEsQ0FBQyxHQUFHLEVBQUU1RSxTQUFTLEVBQUVBLFNBQVMsRUFBRXFDLFFBQVEsQ0FBQztRQUNuR3dDLGdCQUFnQixHQUFHRixZQUFZLENBQUNHLGtCQUFrQixFQUFFO01BQ3JELElBQUlELGdCQUFnQixJQUFJQSxnQkFBZ0IsQ0FBQ3RJLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDcERvRyxpQkFBaUIsR0FBRyxJQUFJO1FBQ3hCOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EsTUFBTXhHLFNBQWdCLEdBQUcsRUFBRTtRQUMzQjBJLGdCQUFnQixDQUFDN0ksT0FBTyxDQUFDLFVBQVUrSSxjQUFtQixFQUFFO1VBQ3ZELE1BQU14SCxRQUFRLEdBQUd3SCxjQUFjLENBQUMzSCxTQUFTLEVBQUU7VUFDM0NqQixTQUFTLENBQUMyRyxJQUFJLENBQUN2RixRQUFRLENBQUM7VUFDeEIxQyxnQkFBZ0IsR0FBR3NCLFNBQVM7UUFDN0IsQ0FBQyxDQUFDO1FBQ0YsSUFBSTZJLGdCQUF1QixHQUFHLEVBQUU7UUFDaEMsSUFBSUMsS0FBSyxDQUFDQyxPQUFPLENBQUM5RyxtQkFBbUIsQ0FBQytHLE9BQU8sRUFBRSxDQUFDLEVBQUU7VUFDakRILGdCQUFnQixHQUFHNUcsbUJBQW1CLENBQUMrRyxPQUFPLEVBQUU7UUFDakQ7UUFDQSxNQUFNQyxVQUFlLEdBQUcsQ0FBQyxDQUFDO1FBRTFCVixlQUFlLEdBQUc3SixnQkFBZ0IsQ0FBQ2dJLE1BQU0sQ0FBQ21DLGdCQUFnQixDQUFDLENBQUNLLE1BQU0sQ0FBQyxVQUFVQyxHQUFHLEVBQUU7VUFDakY7VUFDQSxPQUFPLENBQUNGLFVBQVUsQ0FBQ0UsR0FBRyxDQUFDQyxFQUFFLENBQUMsS0FBS0gsVUFBVSxDQUFDRSxHQUFHLENBQUNDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUMxRCxDQUFDLENBQUM7UUFDRm5ILG1CQUFtQixDQUFDRSxPQUFPLENBQUNvRyxlQUFlLENBQUM7TUFDN0M7SUFDRDtJQUNBLElBQUk1QyxtQkFBbUIsRUFBRTtNQUN4QjJDLHFCQUFxQixHQUFHO1FBQUU3QixjQUFjO1FBQUVEO01BQWtCLENBQUM7TUFDN0Q4QixxQkFBcUIsR0FBRzNDLG1CQUFtQixDQUFDRSxtQkFBbUIsRUFBRXlDLHFCQUFxQixDQUFDO01BQ3ZGN0IsY0FBYyxHQUFHNkIscUJBQXFCLENBQUM3QixjQUFjO01BQ3JERCxpQkFBaUIsR0FBRzhCLHFCQUFxQixDQUFDOUIsaUJBQWlCO01BQzNELElBQUlBLGlCQUFpQixJQUFJOEIscUJBQXFCLENBQUNlLHdCQUF3QixFQUFFO1FBQ3hFZCxlQUFlLEdBQUdELHFCQUFxQixDQUFDZ0IsZ0JBQWdCLEdBQUdoQixxQkFBcUIsQ0FBQ2dCLGdCQUFnQixHQUFHZixlQUFlO01BQ3BIO0lBQ0Q7SUFDQSxJQUFJMUMsbUJBQW1CLENBQUN6RixNQUFNLEtBQUssQ0FBQyxJQUFJLENBQUNpRixlQUFlLElBQUksQ0FBQzhDLGVBQWUsRUFBRTtNQUM3RTtNQUNBLE9BQU9vQixPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDN0IsQ0FBQyxNQUFNLElBQUkzRCxtQkFBbUIsQ0FBQ3pGLE1BQU0sS0FBSyxDQUFDLElBQUl5RixtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQ2xGLE9BQU8sRUFBRSxLQUFLcEMsV0FBVyxDQUFDaUMsT0FBTyxJQUFJLENBQUM2RSxlQUFlLEVBQUU7TUFDNUgsT0FBTyxJQUFJa0UsT0FBTyxDQUFRQyxPQUFPLElBQUs7UUFDckNDLFlBQVksQ0FBQ0MsSUFBSSxDQUFDN0QsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUNrQyxPQUFPLENBQUM7UUFDakQsSUFBSTlGLG1CQUFtQixFQUFFO1VBQ3hCQSxtQkFBbUIsQ0FBQ0UsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDO1FBQ0F0QixlQUFlLENBQUNhLGNBQWMsQ0FBQ21FLG1CQUFtQixDQUFDO1FBQ25EMkQsT0FBTyxFQUFFO01BQ1YsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxNQUFNLElBQUloRCxpQkFBaUIsRUFBRTtNQUM3Qm1ELGVBQWUsQ0FBQ0MsNEJBQTRCLENBQUNyQixlQUFlLEVBQUUvQyxPQUFPLEVBQUVDLFdBQVcsRUFBRUcsUUFBUSxDQUFDO01BQzdGM0QsbUJBQW1CLENBQUNFLE9BQU8sQ0FBQ29HLGVBQWUsQ0FBQyxDQUFDLENBQUM7TUFDOUM1SixpQkFBaUIsR0FBR0EsaUJBQWlCLElBQUksRUFBRTtNQUMzQyxPQUFPLElBQUk0SyxPQUFPLENBQUMsVUFBVUMsT0FBNkIsRUFBRUssTUFBOEIsRUFBRTtRQUMzRmxMLGlCQUFpQixDQUFDZ0ksSUFBSSxDQUFDNkMsT0FBTyxDQUFDO1FBQy9CL0csSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLEVBQUUsSUFBSSxDQUFDLENBQ2hEb0gsSUFBSSxDQUFDLFVBQVVoSixlQUErQixFQUFFO1VBQ2hELE1BQU15QyxtQkFBbUIsR0FBRyxLQUFLO1VBQ2pDLElBQUkrRSxxQkFBcUIsSUFBSUEscUJBQXFCLENBQUN5QixvQkFBb0IsRUFBRTtZQUN4RTlILG1CQUFtQixDQUFDK0csT0FBTyxFQUFFLENBQUNuSixPQUFPLENBQUMsVUFBVXVCLFFBQWEsRUFBRTtjQUM5RGtILHFCQUFxQixDQUFDeUIsb0JBQW9CLENBQUMzSSxRQUFRLENBQUM7WUFDckQsQ0FBQyxDQUFDO1VBQ0g7VUFFQSxNQUFNNEksY0FBYyxHQUFHMUcsMkJBQTJCLENBQUNyQixtQkFBbUIsRUFBRXNCLG1CQUFtQixDQUFDO1VBQzVGLE1BQU0wRyxPQUFPLEdBQUcsSUFBSUMsTUFBTSxDQUFDLEVBQUUsRUFBRXJHLFNBQVMsRUFBRUEsU0FBUyxFQUFFLENBQUNzRyxJQUFTLEVBQUVDLElBQVMsS0FBSztZQUM5RSxNQUFNQyxLQUFLLEdBQUdDLGNBQWMsQ0FBQ0gsSUFBSSxDQUFDO1lBQ2xDLE1BQU1JLEtBQUssR0FBR0QsY0FBYyxDQUFDRixJQUFJLENBQUM7WUFFbEMsSUFBSUMsS0FBSyxHQUFHRSxLQUFLLEVBQUU7Y0FDbEIsT0FBTyxDQUFDLENBQUM7WUFDVjtZQUNBLElBQUlGLEtBQUssR0FBR0UsS0FBSyxFQUFFO2NBQ2xCLE9BQU8sQ0FBQztZQUNUO1lBQ0EsT0FBTyxDQUFDO1VBQ1QsQ0FBQyxDQUFDO1VBRURQLGNBQWMsQ0FBQ2xMLFlBQVksQ0FBQzBMLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBc0JDLElBQUksQ0FBQ1IsT0FBTyxDQUFDO1VBRW5GckwsT0FBTyxHQUNOQSxPQUFPLElBQUlBLE9BQU8sQ0FBQzhMLE1BQU0sRUFBRSxHQUN4QjlMLE9BQU8sR0FDUCxJQUFJeUksTUFBTSxDQUFDO1lBQ1hzRCxTQUFTLEVBQUUsSUFBSTtZQUNmQyxTQUFTLEVBQUUsSUFBSWhHLE1BQU0sQ0FBQztjQUNyQkssS0FBSyxFQUFFLFlBQVk7Z0JBQ2xCbkQsa0JBQWtCLEVBQUU7Z0JBQ3BCO2dCQUNBakIsZUFBZSxDQUFDYSxjQUFjLENBQUM2RyxlQUFlLENBQUM7Y0FDaEQsQ0FBQztjQUNEUCxJQUFJLEVBQUVsSCxlQUFlLENBQUNXLE9BQU8sQ0FBQyxzQkFBc0I7WUFDckQsQ0FBQyxDQUFDO1lBQ0ZvSixZQUFZLEVBQUUsSUFBSUMsR0FBRyxDQUFDO2NBQ3JCQyxhQUFhLEVBQUUsQ0FDZCxJQUFJQyxJQUFJLENBQUM7Z0JBQ1JoRCxJQUFJLEVBQUVsSCxlQUFlLENBQUNXLE9BQU8sQ0FBQyxvREFBb0Q7Y0FDbkYsQ0FBQyxDQUFDLENBQ0Y7Y0FDRHdKLFdBQVcsRUFBRSxDQUFDcE0sV0FBVztZQUMxQixDQUFDLENBQUM7WUFDRnFNLFlBQVksRUFBRSxRQUFRO1lBQ3RCQyxhQUFhLEVBQUUsUUFBUTtZQUN2QkMsaUJBQWlCLEVBQUUsS0FBSztZQUN4QkMsVUFBVSxFQUFFLFlBQVk7Y0FDdkIsS0FBSyxJQUFJM0ssQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHL0IsaUJBQWlCLENBQUN5QixNQUFNLEVBQUVNLENBQUMsRUFBRSxFQUFFO2dCQUNsRC9CLGlCQUFpQixDQUFDK0IsQ0FBQyxDQUFDLENBQUM0SyxJQUFJLEVBQUU7Y0FDNUI7Y0FDQTNNLGlCQUFpQixHQUFHLEVBQUU7WUFDdkI7VUFDQSxDQUFDLENBQUM7VUFDTkMsT0FBTyxDQUFDMk0sZ0JBQWdCLEVBQUU7VUFDMUIzTSxPQUFPLENBQUM0TSxVQUFVLENBQUN4QixjQUFjLENBQUNsTCxZQUFZLENBQUM7VUFFL0MsSUFBSXFKLGVBQWUsRUFBRTtZQUNwQnNELEdBQUcsQ0FBQ0MsRUFBRSxDQUFDQyxPQUFPLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLFVBQVVDLFVBQWUsRUFBRTtjQUMvRGhOLE9BQU8sQ0FBQ2lOLGNBQWMsQ0FDckIsSUFBSWpILE1BQU0sQ0FBQztnQkFDVkssS0FBSyxFQUFFLFlBQVk7a0JBQ2xCbkQsa0JBQWtCLEVBQUU7a0JBQ3BCLElBQUl3RCxRQUFRLENBQUN3RyxpQkFBaUIsRUFBRSxFQUFFO29CQUNqQ3hHLFFBQVEsQ0FBQ2tGLFVBQVUsRUFBRSxDQUFDdUIsWUFBWSxFQUFFO2tCQUNyQztrQkFDQXpHLFFBQVEsQ0FBQzBHLE9BQU8sRUFBRTtnQkFDbkIsQ0FBQztnQkFDRGhFLElBQUksRUFBRWxILGVBQWUsQ0FBQ1csT0FBTyxDQUFDLHdCQUF3QixDQUFDO2dCQUN2RDBDLElBQUksRUFBRXlILFVBQVUsQ0FBQ0s7Y0FDbEIsQ0FBQyxDQUFDLENBQ0Y7WUFDRixDQUFDLENBQUM7VUFDSCxDQUFDLE1BQU07WUFDTnJOLE9BQU8sQ0FBQ3NOLGtCQUFrQixFQUFFO1VBQzdCO1VBQ0FsRyxnQkFBZ0IsR0FBR2pHLDJCQUEyQixDQUFDakIsWUFBWSxDQUFDcU4sUUFBUSxFQUFFLENBQUM7VUFDdkVsRyxvQkFBb0IsR0FBR21HLGlDQUFpQyxDQUFDcEcsZ0JBQWdCLENBQUM7VUFDMUVwSCxPQUFPLENBQUN5TixRQUFRLENBQUNyRyxnQkFBZ0IsQ0FBQztVQUNqQ3BILE9BQU8sQ0FBQzBOLGVBQWUsRUFBRSxDQUFTQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxPQUFPLENBQUN2RyxvQkFBb0IsQ0FBQztVQUN0Rm5ILFlBQVksQ0FBQ29HLFlBQVksRUFBRTtVQUMzQnRHLE9BQU8sQ0FBQzZOLElBQUksRUFBRTtVQUNkLElBQUkvRyxZQUFZLEVBQUU7WUFDakI4RCxPQUFPLENBQUM1SyxPQUFPLENBQUM7VUFDakI7UUFDRCxDQUFDLENBQUMsQ0FDRDhOLEtBQUssQ0FBQzdDLE1BQU0sQ0FBQztNQUNoQixDQUFDLENBQUM7SUFDSCxDQUFDLE1BQU0sSUFBSXBELGNBQWMsRUFBRTtNQUMxQixPQUFPLElBQUk4QyxPQUFPLENBQUMsVUFBVUMsT0FBTyxFQUFFO1FBQ3JDLE1BQU1wSSxRQUFRLEdBQUd5RSxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFDdkMsSUFDRXpFLFFBQVEsQ0FBQ3VMLGdCQUFnQixJQUFJbE8sWUFBWSxDQUFDK0ksT0FBTyxDQUFDcEcsUUFBUSxDQUFDdUwsZ0JBQWdCLENBQUNDLGVBQWUsQ0FBQzdFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUMzR08scUJBQXFCLElBQUlBLHFCQUFxQixDQUFDZSx3QkFBeUIsRUFDeEU7VUFDRCxJQUFJLENBQUNmLHFCQUFxQixJQUFJLENBQUNBLHFCQUFxQixDQUFDZSx3QkFBd0IsRUFBRTtZQUM5RTVLLFlBQVksQ0FBQ2tJLElBQUksQ0FBQ3ZGLFFBQVEsQ0FBQ3VMLGdCQUFnQixDQUFDQyxlQUFlLENBQUM3RSxPQUFPLENBQUM7VUFDckU7VUFDQSxJQUFJOEUsbUJBQW1CLEdBQUcsY0FBYztVQUN4QyxNQUFNQyxpQkFBaUIsR0FBR3pLLG9CQUFvQixDQUFDakIsUUFBUSxFQUFFLElBQUksQ0FBQztVQUM5RCxJQUFJMEwsaUJBQWlCLEVBQUU7WUFDdEJELG1CQUFtQixHQUFJLE9BQU1DLGlCQUFrQixXQUFVO1VBQzFEO1VBQ0EsSUFBSXhFLHFCQUFxQixJQUFJQSxxQkFBcUIsQ0FBQ3lCLG9CQUFvQixFQUFFO1lBQ3hFekIscUJBQXFCLENBQUN5QixvQkFBb0IsQ0FBQzNJLFFBQVEsQ0FBQztVQUNyRDtVQUNBLElBQUlBLFFBQVEsQ0FBQ2lILE9BQU8sRUFBRSxLQUFLLEtBQUssSUFBSWpILFFBQVEsQ0FBQzJMLGlCQUFpQixFQUFFLEtBQUtsSixTQUFTLEVBQUU7WUFDL0VnSixtQkFBbUIsR0FBSSxHQUFFQSxtQkFBbUIsR0FBR3pMLFFBQVEsQ0FBQzJMLGlCQUFpQixFQUFHLEtBQUkzTCxRQUFRLENBQUM0TCxVQUFVLEVBQUcsZ0JBQWU7VUFDdEgsQ0FBQyxNQUFNO1lBQ05ILG1CQUFtQixHQUFJLEdBQUVBLG1CQUFtQixHQUFHekwsUUFBUSxDQUFDNEwsVUFBVSxFQUFHLGdCQUFlO1VBQ3JGO1VBQ0EsTUFBTUMsYUFBa0IsR0FBRyxJQUFJQyxhQUFhLENBQUM7WUFDNUNDLFFBQVEsRUFBRU47VUFDWCxDQUFDLENBQUM7VUFDRk8sVUFBVSxDQUFDQyxLQUFLLENBQUNKLGFBQWEsRUFBRTtZQUMvQkssT0FBTyxFQUFFLFlBQVk7Y0FDcEI3TyxZQUFZLEdBQUcsRUFBRTtjQUNqQixJQUFJOEcsb0JBQW9CLEVBQUU7Z0JBQ3pCZ0ksNkJBQTZCLEVBQUU7Y0FDaEM7Y0FDQW5MLCtCQUErQixFQUFFO2NBQ2pDb0gsT0FBTyxDQUFDLElBQUksQ0FBQztZQUNkO1VBQ0QsQ0FBQyxDQUFDO1FBQ0g7TUFDRCxDQUFDLENBQUM7SUFDSCxDQUFDLE1BQU07TUFDTixPQUFPRCxPQUFPLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDN0I7RUFDRDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0ksNEJBQTRCLENBQ3BDckIsZUFBb0MsRUFDcEMvQyxPQUE0QixFQUM1QkMsV0FBK0IsRUFDL0JHLFFBQTRCLEVBQzNCO0lBQ0QyQyxlQUFlLENBQUMxSSxPQUFPLENBQUUyTixVQUE2QixJQUFLO01BQUE7TUFDMURBLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFO01BQzdCLElBQUksd0JBQUNBLFVBQVUsQ0FBQzVMLE1BQU0sK0NBQWpCLG1CQUFtQnhCLE1BQU0sS0FBSSx3QkFBQW9OLFVBQVUsQ0FBQ25GLE9BQU8sd0RBQWxCLHlCQUFBbUYsVUFBVSxDQUFZLE1BQUssd0NBQXdDLEVBQUU7UUFDdEc7UUFDQUEsVUFBVSxDQUFDLFlBQVksQ0FBQyxHQUFHLFNBQVM7TUFDckMsQ0FBQyxNQUFNLDJCQUFJQSxVQUFVLENBQUM1TCxNQUFNLGdEQUFqQixvQkFBbUJ4QixNQUFNLEVBQUU7UUFDckM7UUFDQSxJQUFJd0YsUUFBUSxLQUFLLFlBQVksRUFBRTtVQUM5QitELGVBQWUsQ0FBQzhELG1CQUFtQixDQUFDakksT0FBTyxFQUFFZ0ksVUFBVSxFQUFFL0gsV0FBVyxDQUFDO1FBQ3RFLENBQUMsTUFBTSxJQUFJRyxRQUFRLEtBQUssWUFBWSxFQUFFO1VBQ3JDO1VBQ0ErRCxlQUFlLENBQUMrRCx5QkFBeUIsQ0FBQ0YsVUFBVSxFQUFFL0gsV0FBVyxFQUFFRCxPQUFPLENBQUM7UUFDNUUsQ0FBQyxNQUFNO1VBQ05nSSxVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUc3RCxlQUFlLENBQUNnRSw4QkFBOEIsQ0FBQ2xJLFdBQVcsQ0FBQztRQUN2RjtNQUNEO0lBQ0QsQ0FBQyxDQUFDO0VBQ0g7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTZ0ksbUJBQW1CLENBQUNHLEtBQTBCLEVBQUVKLFVBQTZCLEVBQUUvSCxXQUErQixFQUFFO0lBQ3hILE1BQU1vSSxXQUFXLEdBQUdELEtBQUssSUFBS0EsS0FBSyxDQUFXRSxhQUFhLEVBQUU7SUFDN0QsSUFBSUQsV0FBVyxFQUFFO01BQUE7TUFDaEIsTUFBTUUsaUJBQWlCLEdBQUksR0FBR0gsS0FBSyxDQUFXRSxhQUFhLEVBQUUsQ0FBQ0UsT0FBTyxFQUFHLEVBQUM7TUFDekUsSUFBSSx3QkFBQVIsVUFBVSxDQUFDNUwsTUFBTSx3REFBakIsb0JBQW1CNEYsT0FBTyxDQUFDdUcsaUJBQWlCLENBQUMsTUFBSyxDQUFDLEVBQUU7UUFDeEQsTUFBTUUsY0FBYyxHQUFJSixXQUFXLENBQXNCbEYsa0JBQWtCLEVBQUU7UUFDN0VzRixjQUFjLENBQUNwTyxPQUFPLENBQUVxTyxVQUFtQixJQUFLO1VBQUE7VUFDL0MsMkJBQUlWLFVBQVUsQ0FBQzVMLE1BQU0sZ0RBQWpCLG9CQUFtQnVNLFFBQVEsQ0FBQ0QsVUFBVSxDQUFDRixPQUFPLEVBQUUsQ0FBQyxFQUFFO1lBQ3RELE1BQU1JLFdBQVcsR0FBSSxHQUFFRixVQUFVLENBQUNGLE9BQU8sRUFBRyxHQUFFO1lBQzlDLE1BQU1LLGdCQUFnQixHQUFJVCxLQUFLLENBQUN0RyxTQUFTLEVBQUUsQ0FBU2dILG1CQUFtQixFQUFFO1lBQ3pFLE1BQU1DLGFBQWEsR0FBR0YsZ0JBQWdCLElBQUlILFVBQVUsQ0FBQ2pOLFNBQVMsRUFBRSxDQUFDb04sZ0JBQWdCLENBQUM7WUFDbEYsTUFBTUcsa0JBQWtCLEdBQUc3RSxlQUFlLENBQUM4RSxtQkFBbUIsQ0FBQ2IsS0FBSyxFQUFFSixVQUFVLEVBQUVZLFdBQVcsQ0FBQztZQUM5RixNQUFNO2NBQUVNO1lBQW9CLENBQUMsR0FBRy9FLGVBQWUsQ0FBQ2dGLGVBQWUsQ0FBQ2YsS0FBSyxFQUFFWSxrQkFBa0IsQ0FBQzs7WUFFMUY7WUFDQSxJQUFJQSxrQkFBa0IsSUFBSUUsbUJBQW1CLEVBQUU7Y0FDOUM7Y0FDQWxCLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBR2UsYUFBYSxHQUFJLElBQUdBLGFBQWMsRUFBQyxHQUFJWCxLQUFLLENBQVdnQixTQUFTLEVBQUU7WUFDOUYsQ0FBQyxNQUFNO2NBQ047Y0FDQXBCLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRzdELGVBQWUsQ0FBQ2dFLDhCQUE4QixDQUFDbEksV0FBVyxDQUFDO1lBQ3ZGO1VBQ0Q7UUFDRCxDQUFDLENBQUM7TUFDSDtJQUNEO0VBQ0Q7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTaUkseUJBQXlCLENBQUNGLFVBQTZCLEVBQUUvSCxXQUErQixFQUFFRCxPQUFZLEVBQUU7SUFDaEgsTUFBTXFKLFlBQVksR0FBR3JKLE9BQU8sYUFBUEEsT0FBTyx1QkFBUEEsT0FBTyxDQUFFc0osaUJBQWlCLEVBQUU7SUFDakQsTUFBTUMsUUFBaUIsR0FBRyxDQUFBdkosT0FBTyxhQUFQQSxPQUFPLHVCQUFQQSxPQUFPLENBQUV3SixVQUFVLE1BQUl4SixPQUFPLGFBQVBBLE9BQU8sdUJBQVBBLE9BQU8sQ0FBRXdKLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6RSxJQUFJQyxtQkFBbUIsR0FBRyxJQUFJO0lBQzlCLElBQUlGLFFBQVEsRUFBRTtNQUNicEYsZUFBZSxDQUFDdUYsc0NBQXNDLENBQUNILFFBQVEsQ0FBQyxDQUFDbFAsT0FBTyxDQUFDLFVBQVVzUCxRQUEyQixFQUFFO1FBQy9HLE1BQU1DLFdBQVcsR0FBR0QsUUFBUSxDQUFDRSxjQUFjLEVBQUU7UUFDN0NELFdBQVcsQ0FBQ3ZQLE9BQU8sQ0FBQyxVQUFVeVAsV0FBaUMsRUFBRTtVQUNoRUEsV0FBVyxDQUFDL0gsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDMUgsT0FBTyxDQUFDLFVBQVUrTixLQUFVLEVBQUU7WUFDNUQsSUFBSUEsS0FBSyxDQUFDMkIsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7Y0FDbEMsTUFBTTFCLFdBQVcsR0FBR0QsS0FBSyxDQUFDRSxhQUFhLEVBQUU7Z0JBQ3hDMEIscUJBQXFCLEdBQUcsSUFBSTtjQUM3QixJQUFJQyxpQkFBeUM7Y0FFN0M3QixLQUFLLENBQUNyRyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMxSCxPQUFPLENBQUU2UCxRQUFhLElBQUs7Z0JBQ25ELElBQUlBLFFBQVEsQ0FBQ0gsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJRyxRQUFRLENBQUNILEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO2tCQUN0RUUsaUJBQWlCLEdBQUdDLFFBQVE7Z0JBQzdCO2NBQ0QsQ0FBQyxDQUFDO2NBQ0YsSUFBSTdCLFdBQVcsRUFBRTtnQkFBQTtnQkFDaEIsTUFBTUUsaUJBQWlCLEdBQUksR0FBRWMsWUFBWSxhQUFaQSxZQUFZLHVCQUFaQSxZQUFZLENBQUViLE9BQU8sRUFBRyxJQUFDLHdCQUFFSixLQUFLLENBQUNFLGFBQWEsRUFBRSx5REFBckIscUJBQXVCRSxPQUFPLEVBQUcsRUFBQztnQkFDMUYsSUFBSSx3QkFBQVIsVUFBVSxDQUFDNUwsTUFBTSx3REFBakIsb0JBQW1CNEYsT0FBTyxDQUFDdUcsaUJBQWlCLENBQUMsTUFBSyxDQUFDLEVBQUU7a0JBQ3hELE1BQU01RSxHQUFHLEdBQUdRLGVBQWUsQ0FBQ2dHLCtCQUErQixDQUMxRG5DLFVBQVUsRUFDVkksS0FBSyxFQUNMNkIsaUJBQWlCLEVBQ2pCNUIsV0FBVyxFQUNYcEksV0FBVyxFQUNYK0oscUJBQXFCLEVBQ3JCSSxzQkFBc0IsQ0FDdEI7a0JBQ0QsTUFBTTtvQkFBRUM7a0JBQWlCLENBQUMsR0FBRzFHLEdBQUc7a0JBRWhDLElBQUlxRyxxQkFBcUIsRUFBRTtvQkFDMUIsTUFBTW5CLGdCQUFnQixHQUFHVCxLQUFLLENBQUN0RyxTQUFTLEVBQUUsQ0FBQ2dILG1CQUFtQixFQUFFO29CQUNoRSxJQUFJRCxnQkFBZ0IsRUFBRTtzQkFDckIsTUFBTUosY0FBYyxHQUFHTCxLQUFLLENBQUNFLGFBQWEsRUFBRSxDQUFDZ0MsV0FBVyxFQUFFO3NCQUMxRDdCLGNBQWMsQ0FBQ3BPLE9BQU8sQ0FBRXFPLFVBQW1CLElBQUs7d0JBQUE7d0JBQy9DLDJCQUFJVixVQUFVLENBQUM1TCxNQUFNLGdEQUFqQixvQkFBbUJ1TSxRQUFRLENBQUNELFVBQVUsQ0FBQ0YsT0FBTyxFQUFFLENBQUMsRUFBRTswQkFDdEQsTUFBTU8sYUFBYSxHQUFHRixnQkFBZ0IsR0FDbkNILFVBQVUsQ0FBQ2pOLFNBQVMsRUFBRSxDQUFDb04sZ0JBQWdCLENBQUMsR0FDeEN4SyxTQUFTOzBCQUNaMkosVUFBVSxDQUFDLGdCQUFnQixDQUFDLEdBQUksR0FBRWUsYUFBYyxLQUFJc0IsZ0JBQWdCLENBQUNuQixtQkFBb0IsRUFBQzt3QkFDM0Y7c0JBQ0QsQ0FBQyxDQUFDO29CQUNILENBQUMsTUFBTTtzQkFDTmxCLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFJLEdBQUVxQyxnQkFBZ0IsQ0FBQ25CLG1CQUFvQixFQUFDO29CQUN6RTtvQkFFQSxJQUFJcUIsVUFBVSxHQUFHbkMsS0FBSyxDQUFDb0MsZ0JBQWdCLEVBQUUsSUFBSUgsZ0JBQWdCLENBQUNJLFdBQVc7b0JBQ3pFLElBQUksQ0FBQ0YsVUFBVSxFQUFFO3NCQUNoQkEsVUFBVSxHQUFHVCxXQUFXLENBQUNZLFFBQVEsRUFBRTtvQkFDcEMsQ0FBQyxNQUFNO3NCQUNOLE1BQU1wUCxlQUFlLEdBQUcyQixJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQztzQkFDcEVxTixVQUFVLEdBQUksR0FBRWpQLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLHlDQUF5QyxDQUFFLEtBQUlzTyxVQUFXLEVBQUM7b0JBQ3BHO29CQUNBdkMsVUFBVSxDQUFDLFlBQVksQ0FBQyxHQUFHdUMsVUFBVTtvQkFDckNkLG1CQUFtQixHQUFHLEtBQUs7a0JBQzVCO2dCQUNEO2NBQ0Q7WUFDRDtVQUNELENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQztNQUNILENBQUMsQ0FBQztJQUNIO0lBRUEsSUFBSUEsbUJBQW1CLEVBQUU7TUFBQTtNQUN4QixNQUFNbEIsaUJBQWlCLEdBQUksR0FBRWMsWUFBWSxhQUFaQSxZQUFZLHVCQUFaQSxZQUFZLENBQUViLE9BQU8sRUFBRyxFQUFDO01BQ3RELElBQUksd0JBQUFSLFVBQVUsQ0FBQzVMLE1BQU0sd0RBQWpCLG9CQUFtQjRGLE9BQU8sQ0FBQ3VHLGlCQUFpQixDQUFDLE1BQUssQ0FBQyxFQUFFO1FBQ3hEO1FBQ0EsTUFBTWdDLFVBQVUsR0FBR3BHLGVBQWUsQ0FBQ2dFLDhCQUE4QixDQUFDbEksV0FBVyxDQUFDO1FBQzlFK0gsVUFBVSxDQUFDLFlBQVksQ0FBQyxHQUFHdUMsVUFBVTtNQUN0QyxDQUFDLE1BQU07UUFDTnZDLFVBQVUsQ0FBQyxZQUFZLENBQUMsR0FBRyxTQUFTO01BQ3JDO0lBQ0Q7RUFDRDtFQUVBLFNBQVNHLDhCQUE4QixDQUFDbEksV0FBK0IsRUFBVTtJQUNoRixNQUFNMEssZUFBZSxHQUFHMU4sSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsQ0FBQ2pCLE9BQU8sQ0FBQyxrREFBa0QsQ0FBQztJQUNoSSxPQUFPZ0UsV0FBVyxHQUFJLEdBQUUwSyxlQUFnQixLQUFJMUssV0FBWSxFQUFDLEdBQUcsRUFBRTtFQUMvRDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVM2RSxjQUFjLENBQUNuQixHQUFzQixFQUFVO0lBQUE7SUFDdkQsdUJBQUlBLEdBQUcsQ0FBQzRHLFVBQVUsNENBQWQsZ0JBQWdCSyxRQUFRLEVBQUUsQ0FBQ2pDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTtNQUN2RCxPQUFPLENBQUM7SUFDVCxDQUFDLE1BQU0sd0JBQUloRixHQUFHLENBQUM0RyxVQUFVLDZDQUFkLGlCQUFnQkssUUFBUSxFQUFFLENBQUNqQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUU7TUFDMUQsT0FBTyxDQUFDO0lBQ1QsQ0FBQyxNQUFNO01BQ04sT0FBTyxDQUFDO0lBQ1Q7RUFDRDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU15QixzQkFBc0IsR0FBRyxDQUFDUyxRQUEyQixFQUFFNUssV0FBK0IsRUFBRXdKLG1CQUE2QixLQUFLO0lBQy9ILElBQUlBLG1CQUFtQixFQUFFO01BQ3hCLE1BQU1xQixpQkFBaUIsR0FBRzdOLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxDQUFDLENBQUNqQixPQUFPLENBQUMsOENBQThDLENBQUM7TUFDOUg0TyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUdDLGlCQUFpQjtJQUMzQyxDQUFDLE1BQU07TUFDTkQsUUFBUSxDQUFDLFlBQVksQ0FBQyxHQUFHMUcsZUFBZSxDQUFDZ0UsOEJBQThCLENBQUNsSSxXQUFXLENBQUM7SUFDckY7RUFDRCxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNrSywrQkFBK0IsQ0FDdkNVLFFBQTJCLEVBQzNCRSxNQUFhLEVBQ2JiLFFBQWdDLEVBQ2hDN0IsV0FBb0IsRUFDcEJwSSxXQUErQixFQUMvQitKLHFCQUE4QixFQUM5QmdCLGNBQW1CLEVBQ2xCO0lBQ0QsTUFBTVgsZ0JBQWdCLEdBQUdsRyxlQUFlLENBQUM4RyxxQkFBcUIsQ0FBQ0YsTUFBTSxFQUFFRixRQUFRLEVBQUVYLFFBQVEsRUFBRTdCLFdBQVcsQ0FBQztJQUN2R2dDLGdCQUFnQixDQUFDSSxXQUFXLEdBQUdNLE1BQU0sQ0FBQzNCLFNBQVMsRUFBRTtJQUVqRCxJQUFJOEIsVUFBVSxFQUFFQyxjQUFjO0lBQzlCLElBQUksQ0FBQ2QsZ0JBQWdCLENBQUNlLGdCQUFnQixFQUFFO01BQ3ZDRixVQUFVLEdBQUdMLFFBQVEsQ0FBQ1EsYUFBYSxFQUFFLENBQUNDLElBQUksQ0FBQyxVQUFVQyxHQUFXLEVBQUU7UUFDakUsT0FBT3BILGVBQWUsQ0FBQ3FILGdCQUFnQixDQUFDVCxNQUFNLEVBQUVRLEdBQUcsQ0FBQztNQUNyRCxDQUFDLENBQUM7SUFDSDtJQUVBLElBQUlMLFVBQVUsRUFBRTtNQUNmLE1BQU16SixRQUFRLEdBQUd4RSxJQUFJLENBQUN5RSxJQUFJLENBQUN3SixVQUFVLENBQUM7TUFDdENDLGNBQWMsR0FBR2hILGVBQWUsQ0FBQ3NILDBCQUEwQixDQUFDaEssUUFBUSxDQUFDO0lBQ3RFO0lBRUEsSUFBSSxDQUFDNEksZ0JBQWdCLENBQUNuQixtQkFBbUIsRUFBRTtNQUMxQztNQUNBLElBQUsyQixRQUFRLENBQVNwSSxVQUFVLElBQUl4QyxXQUFXLEVBQUU7UUFDaEQrSyxjQUFjLENBQUNILFFBQVEsRUFBRTVLLFdBQVcsQ0FBQztRQUNyQytKLHFCQUFxQixHQUFHLEtBQUs7TUFDOUI7SUFDRDtJQUVBLE1BQU0wQixRQUFRLEdBQUd2SCxlQUFlLENBQUN3SCxrQkFBa0IsQ0FDbERkLFFBQVEsRUFDUlIsZ0JBQWdCLENBQUN1Qix3QkFBd0IsRUFDekN2QixnQkFBZ0IsQ0FBQ2UsZ0JBQWdCLEVBQ2pDZixnQkFBZ0IsQ0FBQ25CLG1CQUFtQixFQUNwQzZCLE1BQU0sRUFDTkksY0FBYyxDQUNkO0lBRUQsT0FBTztNQUFFZCxnQkFBZ0I7TUFBRXFCO0lBQVMsQ0FBQztFQUN0Qzs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQyxrQkFBa0IsQ0FDMUJwSixPQUEwQixFQUMxQnFKLHdCQUFtQyxFQUNuQ1IsZ0JBQTRDLEVBQzVDbEMsbUJBQXFDLEVBQ3JDNkIsTUFBYSxFQUNiSSxjQUFtQyxFQUNuQ1UsZ0JBQTBCLEVBQ0U7SUFDNUIsSUFBSUMsZ0JBQWdCO0lBQ3BCLElBQUlDLGlCQUFpQjtJQUNyQixNQUFNQyxhQUFhLEdBQUdDLGdCQUFnQixDQUFDbEIsTUFBTSxDQUFDO0lBQzlDLE1BQU1tQixzQkFBc0IsR0FBSW5CLE1BQU0sQ0FBU2pKLFNBQVMsRUFBRSxDQUFDZ0gsbUJBQW1CLEVBQUU7SUFDaEYsTUFBTXFELHFCQUFxQixHQUFHaEksZUFBZSxDQUFDaUksZUFBZSxDQUFDN0osT0FBTyxFQUFFd0ksTUFBTSxDQUFDO0lBQzlFLElBQUlJLGNBQWMsRUFBRTtNQUNuQlcsZ0JBQWdCLEdBQUdFLGFBQWEsQ0FBQy9QLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxDQUNuRStQLGFBQWEsQ0FBQy9QLE9BQU8sQ0FBQyxnREFBZ0QsQ0FBQyxFQUN2RWlOLG1CQUFtQixHQUFHQSxtQkFBbUIsR0FBSWlELHFCQUFxQixDQUF5QkUsS0FBSyxDQUNoRyxDQUFDO0lBQ0gsQ0FBQyxNQUFNO01BQ04sTUFBTUMsMENBQTBDLEdBQUduSSxlQUFlLENBQUNvSSwrQ0FBK0MsQ0FDakh4QixNQUFNLEVBQ05LLGdCQUFnQixFQUNoQmMsc0JBQXNCLENBQ3RCO01BQ0QsTUFBTU0sZ0NBQWdDLEdBQUdGLDBDQUEwQyxHQUNoRkEsMENBQTBDLENBQUM3USxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQzdENEMsU0FBUztNQUNaLE1BQU1vTyw2QkFBNkIsR0FDbENELGdDQUFnQyxJQUFJRiwwQ0FBMEMsR0FDM0VBLDBDQUEwQyxDQUFDN1EsU0FBUyxDQUFDLHlEQUF5RCxDQUFDLEdBQy9HNEMsU0FBUztNQUNiLElBQUl1Tix3QkFBd0IsQ0FBQ2hSLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDeEM7UUFDQSxJQUFJaVIsZ0JBQWdCLEVBQUU7VUFDckI7VUFDQUUsaUJBQWlCLEdBQUlGLGdCQUFnQixDQUFTYSxRQUFRLEVBQUU7UUFDekQsQ0FBQyxNQUFNLElBQUl0QixnQkFBZ0IsSUFBSWMsc0JBQXNCLEVBQUU7VUFDdERILGlCQUFpQixHQUFHNUgsZUFBZSxDQUFDd0kscUJBQXFCLENBQ3hEVCxzQkFBc0IsRUFDdEJkLGdCQUFnQixFQUNoQm9CLGdDQUFnQyxFQUNoQ0MsNkJBQTZCLENBQzdCO1FBQ0YsQ0FBQyxNQUFNO1VBQ05WLGlCQUFpQixHQUFHMU4sU0FBUztRQUM5QjtRQUNBO1FBQ0EsTUFBTXVPLFdBQTJCLEdBQUd6SSxlQUFlLENBQUMwSSxtQkFBbUIsQ0FBQ1YscUJBQXFCLEVBQUVILGFBQWEsQ0FBQztRQUM3RyxJQUFJRCxpQkFBaUIsSUFBSTdDLG1CQUFtQixFQUFFO1VBQzdDNEMsZ0JBQWdCLEdBQUdFLGFBQWEsQ0FBQy9QLE9BQU8sQ0FBQyx5QkFBeUIsRUFBRSxDQUFDOFAsaUJBQWlCLEVBQUU3QyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzlHLENBQUMsTUFBTSxJQUFJNkMsaUJBQWlCLElBQUlhLFdBQVcsQ0FBQ0UsZ0JBQWdCLEtBQUssUUFBUSxFQUFFO1VBQzFFaEIsZ0JBQWdCLEdBQUksR0FBRUUsYUFBYSxDQUFDL1AsT0FBTyxDQUFDLHVDQUF1QyxDQUFFLEtBQUk4UCxpQkFBa0IsS0FDMUdhLFdBQVcsQ0FBQ0csWUFDWixFQUFDO1FBQ0gsQ0FBQyxNQUFNLElBQUloQixpQkFBaUIsSUFBSWEsV0FBVyxDQUFDRSxnQkFBZ0IsS0FBSyxTQUFTLEVBQUU7VUFDM0VoQixnQkFBZ0IsR0FBR0UsYUFBYSxDQUFDL1AsT0FBTyxDQUFDLHlCQUF5QixFQUFFLENBQUM4UCxpQkFBaUIsRUFBRWEsV0FBVyxDQUFDRyxZQUFZLENBQUMsQ0FBQztRQUNuSCxDQUFDLE1BQU0sSUFBSWhCLGlCQUFpQixJQUFJYSxXQUFXLENBQUNFLGdCQUFnQixLQUFLLFdBQVcsRUFBRTtVQUM3RWhCLGdCQUFnQixHQUFJLEdBQUVFLGFBQWEsQ0FBQy9QLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBRSxLQUFJOFAsaUJBQWtCLEVBQUM7UUFDN0csQ0FBQyxNQUFNLElBQUksQ0FBQ0EsaUJBQWlCLElBQUk3QyxtQkFBbUIsRUFBRTtVQUNyRDRDLGdCQUFnQixHQUFHRSxhQUFhLENBQUMvUCxPQUFPLENBQUMsMENBQTBDLENBQUMsR0FBRyxJQUFJLEdBQUdpTixtQkFBbUI7UUFDbEgsQ0FBQyxNQUFNLElBQUksQ0FBQzZDLGlCQUFpQixJQUFJYSxXQUFXLENBQUNFLGdCQUFnQixLQUFLLFFBQVEsRUFBRTtVQUMzRWhCLGdCQUFnQixHQUFHYyxXQUFXLENBQUNHLFlBQVk7UUFDNUMsQ0FBQyxNQUFNO1VBQ05qQixnQkFBZ0IsR0FBRyxJQUFJO1FBQ3hCO01BQ0QsQ0FBQyxNQUFNO1FBQ05BLGdCQUFnQixHQUFHLElBQUk7TUFDeEI7SUFDRDtJQUVBLE9BQU9BLGdCQUFnQjtFQUN4Qjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU1MsK0NBQStDLENBQ3ZEeEIsTUFBYSxFQUNiSyxnQkFBNEMsRUFDNUNjLHNCQUE4QixFQUNEO0lBQzdCLElBQUljLGVBQWU7SUFDbkIsSUFBSTVCLGdCQUFnQixJQUFJYyxzQkFBc0IsRUFBRTtNQUMvQyxNQUFNZSxNQUFNLEdBQUdsQyxNQUFNLGFBQU5BLE1BQU0sdUJBQU5BLE1BQU0sQ0FBRXJPLFFBQVEsRUFBRTtNQUNqQyxNQUFNd1EsVUFBVSxHQUFHRCxNQUFNLGFBQU5BLE1BQU0sdUJBQU5BLE1BQU0sQ0FBRUUsWUFBWSxFQUFFO01BQ3pDLE1BQU1DLFNBQVMsR0FBSUYsVUFBVSxhQUFWQSxVQUFVLHVCQUFWQSxVQUFVLENBQVVHLFdBQVcsQ0FBQ2pDLGdCQUFnQixDQUFDNUMsT0FBTyxFQUFFLENBQUM7TUFDOUUsSUFBSTBFLFVBQVUsYUFBVkEsVUFBVSxlQUFWQSxVQUFVLENBQUV6UixTQUFTLENBQUUsR0FBRTJSLFNBQVUsSUFBR2xCLHNCQUF1Qiw0Q0FBMkMsQ0FBQyxFQUFFO1FBQzlHYyxlQUFlLEdBQUdFLFVBQVUsQ0FBQ0ksb0JBQW9CLENBQUUsR0FBRUYsU0FBVSxJQUFHbEIsc0JBQXVCLHNDQUFxQyxDQUFDO01BQ2hJO0lBQ0Q7SUFDQSxPQUFPYyxlQUFlO0VBQ3ZCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNMLHFCQUFxQixDQUM3QlQsc0JBQThCLEVBQzlCZCxnQkFBeUIsRUFDekJtQyxtQkFBMkIsRUFDM0JDLGdCQUF3QixFQUNmO0lBQ1QsTUFBTUMsVUFBVSxHQUFJckMsZ0JBQWdCLENBQVNzQixRQUFRLENBQUNSLHNCQUFzQixDQUFDO0lBQzdFLElBQUl3QixVQUFVO0lBQ2QsSUFBSUMsY0FBYyxHQUFHRixVQUFVO0lBQy9CLElBQUlGLG1CQUFtQixFQUFFO01BQ3hCLElBQUlyQixzQkFBc0IsQ0FBQ25TLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDaEQ7UUFDQW1TLHNCQUFzQixHQUFHQSxzQkFBc0IsQ0FBQzBCLEtBQUssQ0FBQyxDQUFDLEVBQUUxQixzQkFBc0IsQ0FBQ25TLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckdtUyxzQkFBc0IsR0FBR0Esc0JBQXNCLENBQUNoTCxNQUFNLENBQUNxTSxtQkFBbUIsQ0FBQztNQUM1RSxDQUFDLE1BQU07UUFDTnJCLHNCQUFzQixHQUFHcUIsbUJBQW1CO01BQzdDO01BQ0FHLFVBQVUsR0FBSXRDLGdCQUFnQixDQUFTc0IsUUFBUSxDQUFDUixzQkFBc0IsQ0FBQztNQUN2RSxJQUFJd0IsVUFBVSxFQUFFO1FBQ2YsSUFBSUYsZ0JBQWdCLEVBQUU7VUFDckIsTUFBTUssV0FBVyxHQUFHTCxnQkFBZ0IsQ0FBQ0ksS0FBSyxDQUFDSixnQkFBZ0IsQ0FBQ3hMLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7VUFDN0UsUUFBUTZMLFdBQVc7WUFDbEIsS0FBSyxVQUFVO2NBQ2RGLGNBQWMsR0FBR0QsVUFBVTtjQUMzQjtZQUNELEtBQUssV0FBVztjQUNmQyxjQUFjLEdBQUksR0FBRUQsVUFBVyxLQUFJRCxVQUFXLEdBQUU7Y0FDaEQ7WUFDRCxLQUFLLFVBQVU7Y0FDZEUsY0FBYyxHQUFJLEdBQUVGLFVBQVcsS0FBSUMsVUFBVyxHQUFFO2NBQ2hEO1lBQ0QsS0FBSyxjQUFjO2NBQ2xCQyxjQUFjLEdBQUdGLFVBQVU7Y0FDM0I7WUFDRDtVQUFRO1FBRVYsQ0FBQyxNQUFNO1VBQ05FLGNBQWMsR0FBSSxHQUFFRCxVQUFXLEtBQUlELFVBQVcsR0FBRTtRQUNqRDtNQUNEO0lBQ0Q7SUFDQSxPQUFPRSxjQUFjO0VBQ3RCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTdkIsZUFBZSxDQUFDeFEsUUFBMkIsRUFBRW1QLE1BQWEsRUFBVTtJQUM1RSxNQUFNK0Msc0JBQXNCLEdBQUdsUyxRQUFRLGFBQVJBLFFBQVEsdUJBQVJBLFFBQVEsQ0FBRW1TLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUNDLEdBQUcsRUFBRTtJQUN6RSxPQUFRbEQsTUFBTSxDQUNaakosU0FBUyxFQUFFLENBQ1hvTSxrQkFBa0IsRUFBRSxDQUNwQkMsT0FBTyxDQUFDN0MsSUFBSSxDQUFDLFVBQVU4QyxPQUFZLEVBQUU7TUFDckMsT0FBT0EsT0FBTyxDQUFDQyxHQUFHLENBQUNMLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQ0MsR0FBRyxFQUFFLEtBQUtILHNCQUFzQjtJQUNoRSxDQUFDLENBQUM7RUFDSjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNqQixtQkFBbUIsQ0FBQ1YscUJBQTBCLEVBQUVILGFBQTRCLEVBQWtCO0lBQ3RHLE1BQU1ZLFdBQWdCLEdBQUc7TUFBRUUsZ0JBQWdCLEVBQUV3QixNQUFNO01BQUV2QixZQUFZLEVBQUV1QjtJQUFPLENBQUM7SUFDM0UsSUFBSW5DLHFCQUFxQixFQUFFO01BQzFCO01BQ0EsSUFBSUEscUJBQXFCLENBQUNvQyxZQUFZLEtBQUssUUFBUSxFQUFFO1FBQ3BEM0IsV0FBVyxDQUFDRyxZQUFZLEdBQUcxTyxTQUFTO1FBQ3BDdU8sV0FBVyxDQUFDRSxnQkFBZ0IsR0FBRyxXQUFXO01BQzNDLENBQUMsTUFBTTtRQUNOO1FBQ0FGLFdBQVcsQ0FBQ0csWUFBWSxHQUFJLEdBQUVmLGFBQWEsQ0FBQy9QLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBRSxLQUFJK1AsYUFBYSxDQUFDL1AsT0FBTyxDQUN4SCx3Q0FBd0MsQ0FDdkMsTUFBS2tRLHFCQUFxQixDQUFDRSxLQUFNLEVBQUM7UUFDcENPLFdBQVcsQ0FBQ0UsZ0JBQWdCLEdBQUcsUUFBUTtNQUN4QztJQUNELENBQUMsTUFBTTtNQUNORixXQUFXLENBQUNHLFlBQVksR0FBR2YsYUFBYSxDQUFDL1AsT0FBTyxDQUFDLDJDQUEyQyxDQUFDO01BQzdGMlEsV0FBVyxDQUFDRSxnQkFBZ0IsR0FBRyxTQUFTO0lBQ3pDO0lBQ0EsT0FBT0YsV0FBVztFQUNuQjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNwQixnQkFBZ0IsQ0FBQ1QsTUFBYSxFQUFFRyxVQUFrQixFQUEwQjtJQUNwRixNQUFNekosUUFBYSxHQUFHeEUsSUFBSSxDQUFDeUUsSUFBSSxDQUFDd0osVUFBVSxDQUFDO0lBQzNDLElBQUl6SixRQUFRLElBQUksQ0FBQ0EsUUFBUSxDQUFDc0ksR0FBRyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQ3RJLFFBQVEsQ0FBQ3NJLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRTtNQUNwRixPQUFPZ0IsTUFBTSxDQUFDaEosWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVcUcsS0FBVSxFQUFFO1FBQ3RELE9BQU9BLEtBQUssQ0FBQ29HLEtBQUssRUFBRSxLQUFLL00sUUFBUTtNQUNsQyxDQUFDLENBQUM7SUFDSDtJQUNBLE9BQU8sS0FBSztFQUNiO0VBRUEsU0FBU2dLLDBCQUEwQixDQUFDaEssUUFBZ0MsRUFBRTtJQUNyRSxJQUFJZ04sY0FBYyxHQUFHaE4sUUFBUSxhQUFSQSxRQUFRLHVCQUFSQSxRQUFRLENBQUVLLFNBQVMsRUFBRTtJQUMxQyxPQUNDMk0sY0FBYyxJQUNkLHFCQUFDQSxjQUFjLDRDQUFkLGdCQUFnQjFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxLQUN4QyxzQkFBQzBFLGNBQWMsNkNBQWQsaUJBQWdCMUUsR0FBRyxDQUFDLDBCQUEwQixDQUFDLEtBQ2hELHNCQUFDMEUsY0FBYyw2Q0FBZCxpQkFBZ0IxRSxHQUFHLENBQUMsc0JBQXNCLENBQUMsR0FDM0M7TUFBQTtNQUNEMEUsY0FBYyxHQUFHQSxjQUFjLENBQUMzTSxTQUFTLEVBQUU7SUFDNUM7SUFFQSxPQUFPLENBQUMsQ0FBQzJNLGNBQWMsSUFBSUEsY0FBYyxDQUFDMUUsR0FBRyxDQUFDLDBCQUEwQixDQUFDO0VBQzFFO0VBRUEsU0FBU25ELGlDQUFpQyxDQUFDcEcsZ0JBQXFCLEVBQUU7SUFDakUsTUFBTWtPLGNBQWMsR0FBR3pSLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxDQUFDO0lBQ25FLFFBQVFzRCxnQkFBZ0I7TUFDdkIsS0FBSyxPQUFPO1FBQ1gsT0FBT2tPLGNBQWMsQ0FBQ3pTLE9BQU8sQ0FBQyxnREFBZ0QsQ0FBQztNQUNoRixLQUFLLGFBQWE7UUFDakIsT0FBT3lTLGNBQWMsQ0FBQ3pTLE9BQU8sQ0FBQyx5REFBeUQsQ0FBQztNQUN6RixLQUFLLFNBQVM7UUFDYixPQUFPeVMsY0FBYyxDQUFDelMsT0FBTyxDQUFDLDREQUE0RCxDQUFDO01BQzVGLEtBQUssU0FBUztRQUNiLE9BQU95UyxjQUFjLENBQUN6UyxPQUFPLENBQUMsNERBQTRELENBQUM7TUFDNUY7UUFDQyxPQUFPeVMsY0FBYyxDQUFDelMsT0FBTyxDQUFDLG9EQUFvRCxDQUFDO0lBQUM7RUFFdkY7RUFDQSxTQUFTVywrQkFBK0IsR0FBRztJQUMxQytSLHdCQUF3QixDQUFDLEtBQUssQ0FBQztFQUNoQztFQUNBLFNBQVM1Ryw2QkFBNkIsQ0FBQzZHLGdCQUF5QixFQUFFO0lBQ2pFRCx3QkFBd0IsQ0FBQyxJQUFJLEVBQUVDLGdCQUFnQixDQUFDO0VBQ2pEO0VBRUEsU0FBU0MsMkJBQTJCLENBQUNDLGFBQWtCLEVBQUVGLGdCQUF5QixFQUFFO0lBQ25GLElBQUlBLGdCQUFnQixLQUFLdlEsU0FBUyxFQUFFO01BQ25DLE9BQU95USxhQUFhLENBQUNyVCxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQ3BDO0lBQ0EsTUFBTXNULFdBQVcsR0FBR0QsYUFBYSxDQUFDN0wsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUUvQzhMLFdBQVcsQ0FBQ3JMLE1BQU0sQ0FDakIsSUFBSS9DLE1BQU0sQ0FBQztNQUNWcEMsSUFBSSxFQUFFLFFBQVE7TUFDZHFDLFFBQVEsRUFBRUMsY0FBYyxDQUFDbU8sVUFBVTtNQUNuQ2pPLE1BQU0sRUFBRTZOO0lBQ1QsQ0FBQyxDQUFDLENBQ0Y7SUFFRCxPQUFPRyxXQUFXLENBQUM1TCxrQkFBa0IsRUFBRSxDQUFDOEwsR0FBRyxDQUFDLFVBQVVuUCxRQUFhLEVBQUU7TUFDcEUsT0FBT0EsUUFBUSxDQUFDckUsU0FBUyxFQUFFO0lBQzVCLENBQUMsQ0FBQztFQUNIO0VBQ0EsU0FBUzZFLFdBQVcsR0FBK0Y7SUFBQSxJQUE5RjRPLGNBQXVCLHVFQUFHLEtBQUs7SUFBQSxJQUFFQyxlQUF3Qix1RUFBRyxLQUFLO0lBQUEsSUFBRVAsZ0JBQXlCO0lBQ2hILElBQUkxVCxDQUFDO0lBQ0wsTUFBTUcsZUFBZSxHQUFHNEIsSUFBSSxDQUFDc0QsaUJBQWlCLEVBQUU7TUFDL0N1TyxhQUFhLEdBQUd6VCxlQUFlLENBQUNHLGVBQWUsRUFBRTtNQUNqREYsZUFBZSxHQUFHMkIsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUM7TUFDOURtRCxtQkFBbUIsR0FBRyxFQUFFO0lBQ3pCLElBQUk3RixTQUFnQixHQUFHLEVBQUU7SUFDekIsSUFBSTBVLGNBQWMsSUFBSUMsZUFBZSxJQUFJUCxnQkFBZ0IsRUFBRTtNQUMxRHBVLFNBQVMsR0FBR3FVLDJCQUEyQixDQUFDQyxhQUFhLEVBQUVGLGdCQUFnQixDQUFDO0lBQ3pFLENBQUMsTUFBTTtNQUNOcFUsU0FBUyxHQUFHc1UsYUFBYSxDQUFDclQsU0FBUyxDQUFDLEdBQUcsQ0FBQztJQUN6QztJQUNBLEtBQUtQLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR1YsU0FBUyxDQUFDSSxNQUFNLEVBQUVNLENBQUMsRUFBRSxFQUFFO01BQ3RDLElBQ0MsQ0FBQyxDQUFDaVUsZUFBZSxJQUFJM1UsU0FBUyxDQUFDVSxDQUFDLENBQUMsQ0FBQ3VILFVBQVUsTUFDMUN5TSxjQUFjLElBQUkxVSxTQUFTLENBQUNVLENBQUMsQ0FBQyxDQUFDa0IsTUFBTSxLQUFLLEVBQUUsSUFBTSxDQUFDOFMsY0FBYyxLQUFLLENBQUMxVSxTQUFTLENBQUNVLENBQUMsQ0FBQyxDQUFDa0IsTUFBTSxJQUFJNUIsU0FBUyxDQUFDVSxDQUFDLENBQUMsQ0FBQ2tCLE1BQU0sS0FBSyxFQUFFLENBQUUsQ0FBQyxFQUM1SDtRQUNEaUUsbUJBQW1CLENBQUNjLElBQUksQ0FBQzNHLFNBQVMsQ0FBQ1UsQ0FBQyxDQUFDLENBQUM7TUFDdkM7SUFDRDtJQUVBLEtBQUtBLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR21GLG1CQUFtQixDQUFDekYsTUFBTSxFQUFFTSxDQUFDLEVBQUUsRUFBRTtNQUNoRCxJQUNDbUYsbUJBQW1CLENBQUNuRixDQUFDLENBQUMsQ0FBQ21ILElBQUksS0FBSyxLQUFLLElBQ3JDaEMsbUJBQW1CLENBQUNuRixDQUFDLENBQUMsQ0FBQ3FILE9BQU8sS0FBSyxFQUFFLElBQ3JDbEMsbUJBQW1CLENBQUNuRixDQUFDLENBQUMsQ0FBQ3FILE9BQU8sQ0FBQ1AsT0FBTyxDQUFDMUcsZUFBZSxDQUFDVyxPQUFPLENBQUMsNkNBQTZDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUNwSDtRQUNEb0UsbUJBQW1CLENBQUNuRixDQUFDLENBQUMsQ0FBQ3FILE9BQU8sR0FBSSxLQUFJakgsZUFBZSxDQUFDVyxPQUFPLENBQUMsNkNBQTZDLENBQUUsR0FDNUdvRSxtQkFBbUIsQ0FBQ25GLENBQUMsQ0FBQyxDQUFDcUgsT0FDdkIsRUFBQztNQUNIO0lBQ0Q7SUFDQTtJQUNBLE1BQU02TSxlQUFvQixHQUFHLEVBQUU7SUFDL0IsS0FBS2xVLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR21GLG1CQUFtQixDQUFDekYsTUFBTSxFQUFFTSxDQUFDLEVBQUUsRUFBRTtNQUNoRCxJQUNFbUYsbUJBQW1CLENBQUNuRixDQUFDLENBQUMsQ0FBQ2lNLGdCQUFnQixLQUNyQzlHLG1CQUFtQixDQUFDbkYsQ0FBQyxDQUFDLENBQUNpTSxnQkFBZ0IsQ0FBQ0MsZUFBZSxLQUFLL0ksU0FBUyxJQUN0RWdDLG1CQUFtQixDQUFDbkYsQ0FBQyxDQUFDLENBQUNpTSxnQkFBZ0IsQ0FBQ0MsZUFBZSxLQUFLLElBQUksSUFDL0QvRyxtQkFBbUIsQ0FBQ25GLENBQUMsQ0FBQyxDQUFDaU0sZ0JBQWdCLENBQUNwTCxVQUFVLEtBQUtzQyxTQUFTLElBQ2hFZ0MsbUJBQW1CLENBQUNuRixDQUFDLENBQUMsQ0FBQ2lNLGdCQUFnQixDQUFDcEwsVUFBVSxLQUFLLElBQUssQ0FBQyxJQUNoRXNFLG1CQUFtQixDQUFDbkYsQ0FBQyxDQUFDLENBQUNtSCxJQUFJLEVBQzFCO1FBQ0QrTSxlQUFlLENBQUNqTyxJQUFJLENBQUNkLG1CQUFtQixDQUFDbkYsQ0FBQyxDQUFDLENBQUM7TUFDN0M7SUFDRDtJQUNBLE9BQU9rVSxlQUFlO0VBQ3ZCO0VBQ0EsU0FBU1Qsd0JBQXdCLENBQUNPLGNBQW1CLEVBQUVOLGdCQUF5QixFQUFFO0lBQ2pGLE1BQU1TLG9CQUFvQixHQUFHL08sV0FBVyxDQUFDNE8sY0FBYyxFQUFFLElBQUksRUFBRU4sZ0JBQWdCLENBQUM7SUFFaEYsSUFBSVMsb0JBQW9CLENBQUN6VSxNQUFNLEdBQUcsQ0FBQyxFQUFFO01BQ3BDcUMsSUFBSSxDQUFDc0QsaUJBQWlCLEVBQUUsQ0FBQ3JFLGNBQWMsQ0FBQ21ULG9CQUFvQixDQUFDO0lBQzlEO0VBQ0Q7RUFDQTtFQUNBLFNBQVNDLGtCQUFrQixDQUFDdkUsTUFBYSxFQUFFd0UsU0FBb0IsRUFBRWhOLE9BQTBCLEVBQUU7SUFDNUYsSUFBSUEsT0FBTyxDQUFDaU4sY0FBYyxLQUFLblIsU0FBUyxFQUFFO01BQ3pDLE1BQU1vUixjQUFjLEdBQUkxRSxNQUFNLENBQUNqSixTQUFTLEVBQUUsQ0FBU2dILG1CQUFtQixFQUFFO01BQ3hFLE1BQU00RyxZQUFZLEdBQUdILFNBQVMsQ0FBQ2pFLElBQUksQ0FBQyxVQUFVeEwsUUFBYSxFQUFFO1FBQzVELE9BQU95QyxPQUFPLENBQUN3TCxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQy9MLE9BQU8sQ0FBQ2xDLFFBQVEsQ0FBQzBJLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO01BQ2xFLENBQUMsQ0FBQztNQUNGakcsT0FBTyxDQUFDaU4sY0FBYyxHQUFHRSxZQUFZLEdBQUdBLFlBQVksQ0FBQ2pVLFNBQVMsRUFBRSxDQUFDZ1UsY0FBYyxDQUFDLEdBQUdwUixTQUFTO0lBQzdGO0VBQ0Q7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTcUwsc0NBQXNDLENBQUNpRyxpQkFBNkMsRUFBRTtJQUM5RixPQUFRQSxpQkFBaUIsQ0FBc0JDLFdBQVcsRUFBRSxDQUFDbE0sTUFBTSxDQUFDLFVBQVVpRyxRQUEyQixFQUFFO01BQzFHLE9BQU9BLFFBQVEsQ0FBQ2tHLFVBQVUsRUFBRTtJQUM3QixDQUFDLENBQUM7RUFDSDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNDLHlDQUF5QyxDQUFDQyxVQUFnQyxFQUFFdkwsY0FBaUMsRUFBZ0I7SUFDckksT0FBT3VMLFVBQVUsQ0FDZmhPLFlBQVksQ0FBQyxJQUFJLEVBQUdxRyxLQUFVLElBQUs7TUFDbkMsT0FBTzRILGVBQWUsQ0FBQ3hMLGNBQWMsQ0FBQzZHLGFBQWEsRUFBRSxFQUFFakQsS0FBSyxDQUFDO0lBQzlELENBQUMsQ0FBQyxDQUNEbkQsSUFBSSxDQUFDLFVBQVVnTCxDQUFNLEVBQUVDLENBQU0sRUFBRTtNQUMvQjtNQUNBO01BQ0EsSUFBSUQsQ0FBQyxDQUFDbEcsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQ21HLENBQUMsQ0FBQ25HLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFO1FBQzVELE9BQU8sQ0FBQyxDQUFDO01BQ1Y7TUFDQSxPQUFPLENBQUM7SUFDVCxDQUFDLENBQUM7RUFDSjtFQUVBLFNBQVNkLG1CQUFtQixDQUFDOEIsTUFBZSxFQUFFdkcsY0FBaUMsRUFBRTJMLFlBQWtCLEVBQUU7SUFDcEc7SUFDQSxNQUFNQyxjQUFjLEdBQUcsVUFBVUMsQ0FBUyxFQUFFO01BQzNDLE9BQU9BLENBQUMsQ0FBQ0MsT0FBTyxDQUFDLHVCQUF1QixFQUFFLE1BQU0sQ0FBQztJQUNsRCxDQUFDO0lBQ0Q7SUFDQTtJQUNBLElBQUksQ0FBQ0gsWUFBWSxFQUFFO01BQUE7TUFDbEJBLFlBQVksR0FBRyxJQUFJSSxNQUFNLENBQ3ZCLEdBQUVILGNBQWMsQ0FBRSw0QkFBRXJGLE1BQU0sQ0FBQ3pCLGlCQUFpQixFQUFFLDBEQUExQixzQkFBNEJkLE9BQU8sRUFBRyxJQUFJdUMsTUFBTSxDQUFXekMsYUFBYSxFQUFFLENBQUNFLE9BQU8sRUFBRyxFQUFDLENBQUUsV0FBVSxDQUN2SDtJQUNGO0lBQ0EsT0FBT2hFLGNBQWMsQ0FBQ3VKLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDdUMsT0FBTyxDQUFDSCxZQUFZLEVBQUUsRUFBRSxDQUFDO0VBQ2hFOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU2hILGVBQWUsQ0FBQzRCLE1BQWUsRUFBRXlGLHVCQUErQixFQUFFO0lBQzFFLElBQUl0SCxtQkFBMkI7SUFDL0IsSUFBSXVILGVBQWUsR0FBSTFGLE1BQU0sQ0FBVzJGLFVBQVUsRUFBRSxDQUFDcEYsSUFBSSxDQUFDLFVBQVVxRixNQUFXLEVBQUU7TUFDaEYsT0FBT0EsTUFBTSxDQUFDQyxlQUFlLEVBQUUsSUFBSUosdUJBQXVCO0lBQzNELENBQUMsQ0FBQztJQUNGLElBQUksQ0FBQ0MsZUFBZSxFQUFFO01BQ3JCO01BQ0EsTUFBTUksYUFBYSxHQUFJOUYsTUFBTSxDQUMzQitGLGtCQUFrQixFQUFFLENBQ3BCQyxhQUFhLENBQUNoRyxNQUFNLENBQUMsQ0FDckJPLElBQUksQ0FBQyxVQUFVOEMsT0FBWSxFQUFFO1FBQzdCLElBQUksQ0FBQyxDQUFDQSxPQUFPLENBQUNsUCxRQUFRLElBQUlrUCxPQUFPLENBQUM0QyxhQUFhLEVBQUU7VUFDaEQsT0FDQzVDLE9BQU8sQ0FBQzRDLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBS1IsdUJBQXVCLElBQ3BEcEMsT0FBTyxDQUFDNEMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDVixPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxLQUFLRSx1QkFBdUI7UUFFaEYsQ0FBQyxNQUFNO1VBQ04sT0FBTyxLQUFLO1FBQ2I7TUFDRCxDQUFDLENBQUM7TUFDSCxJQUFJSyxhQUFhLEVBQUU7UUFBQTtRQUNsQkosZUFBZSxHQUFHSSxhQUFhO1FBQy9CTCx1QkFBdUIsdUJBQUlDLGVBQWUscURBQWhCLGlCQUEwQlEsSUFBSTtRQUV4RC9ILG1CQUFtQixHQUFJNkIsTUFBTSxDQUMzQjJGLFVBQVUsRUFBRSxDQUNacEYsSUFBSSxDQUFDLFVBQVU4QyxPQUFZLEVBQUU7VUFDN0IsT0FBT29DLHVCQUF1QixLQUFLcEMsT0FBTyxDQUFDd0MsZUFBZSxFQUFFO1FBQzdELENBQUMsQ0FBQyxDQUNEeEgsU0FBUyxFQUFFO01BQ2QsQ0FBQyxNQUFNO1FBQ047UUFDQSxNQUFNOEgsUUFBUSxHQUFJbkcsTUFBTSxDQUFXK0Ysa0JBQWtCLEVBQUUsQ0FBQ0MsYUFBYSxDQUFDaEcsTUFBTSxDQUFDO1FBQzdFMEYsZUFBZSxHQUFHUyxRQUFRLENBQUM1RixJQUFJLENBQUMsVUFBVThDLE9BQVksRUFBRTtVQUN2RCxJQUFJQSxPQUFPLENBQUNDLEdBQUcsQ0FBQ3JNLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1lBQUE7WUFDakQsZ0NBQU9vTSxPQUFPLENBQUM0QyxhQUFhLDBEQUFyQixzQkFBdUIxRixJQUFJLENBQUMsWUFBWTtjQUM5QyxPQUFPNEYsUUFBUSxDQUFDNUYsSUFBSSxDQUFDLFVBQVU2RixXQUFnQixFQUFFO2dCQUNoRCxPQUFPQSxXQUFXLENBQUNDLFlBQVksS0FBS1osdUJBQXVCO2NBQzVELENBQUMsQ0FBQztZQUNILENBQUMsQ0FBQztVQUNIO1FBQ0QsQ0FBQyxDQUFDO1FBQ0Y7UUFDQSxJQUFJYSx3QkFBd0IsR0FBRyxLQUFLO1FBQ3BDLElBQUlaLGVBQWUsSUFBS0EsZUFBZSxDQUFTcEUsS0FBSyxFQUFFO1VBQ3REZ0Ysd0JBQXdCLEdBQUl0RyxNQUFNLENBQVcyRixVQUFVLEVBQUUsQ0FBQ1ksSUFBSSxDQUFDLFVBQVVYLE1BQVcsRUFBRTtZQUNyRixPQUFPQSxNQUFNLENBQUN2SCxTQUFTLEVBQUUsS0FBTXFILGVBQWUsQ0FBU3BFLEtBQUs7VUFDN0QsQ0FBQyxDQUFDO1FBQ0g7UUFDQW5ELG1CQUFtQixHQUFHbUksd0JBQXdCLElBQUtaLGVBQWUsQ0FBU3BFLEtBQUs7UUFDaEZtRSx1QkFBdUIsR0FBR2Esd0JBQXdCLElBQUtaLGVBQWUsQ0FBU3BDLEdBQUc7TUFDbkY7SUFDRCxDQUFDLE1BQU07TUFDTm5GLG1CQUFtQixHQUFHdUgsZUFBZSxJQUFJQSxlQUFlLENBQUNySCxTQUFTLEVBQUU7SUFDckU7SUFDQSxPQUFPO01BQUVGLG1CQUFtQixFQUFFQSxtQkFBbUI7TUFBRXNILHVCQUF1QixFQUFFQTtJQUF3QixDQUFDO0VBQ3RHOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVN2RixxQkFBcUIsQ0FBQ0YsTUFBYSxFQUFFdkcsY0FBaUMsRUFBRTBGLFFBQWEsRUFBRTdCLFdBQW9CLEVBQXVCO0lBQzFJLE1BQU1nQyxnQkFBcUIsR0FBRyxDQUFDLENBQUM7SUFDaENBLGdCQUFnQixDQUFDbUcsdUJBQXVCLEdBQUd2SCxtQkFBbUIsQ0FBQzhCLE1BQU0sRUFBRXZHLGNBQWMsQ0FBQztJQUN0RixNQUFNK00sYUFBYSxHQUFHcEksZUFBZSxDQUFDNEIsTUFBTSxFQUFFVixnQkFBZ0IsQ0FBQ21HLHVCQUF1QixDQUFDO0lBQ3ZGbkcsZ0JBQWdCLENBQUN1Qix3QkFBd0IsR0FBRzFCLFFBQVEsQ0FBQ0gsR0FBRyxDQUFDLG9CQUFvQixDQUFDLEdBQzFFMUIsV0FBVyxDQUFzQmlDLFdBQVcsRUFBRSxHQUM5Q2pDLFdBQVcsQ0FBc0JsRixrQkFBa0IsRUFBRTtJQUN6RGtILGdCQUFnQixDQUFDbkIsbUJBQW1CLEdBQUdxSSxhQUFhLENBQUNySSxtQkFBbUI7SUFDeEVtQixnQkFBZ0IsQ0FBQ21HLHVCQUF1QixHQUFHZSxhQUFhLENBQUNmLHVCQUF1QjtJQUNoRm5HLGdCQUFnQixDQUFDZSxnQkFBZ0IsR0FBR2YsZ0JBQWdCLENBQUN1Qix3QkFBd0IsQ0FBQ04sSUFBSSxDQUFDLFVBQVU1QyxVQUFlLEVBQUU7TUFDN0csT0FBT0EsVUFBVSxJQUFJbEUsY0FBYyxDQUFDdUosVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMvTCxPQUFPLENBQUMwRyxVQUFVLENBQUNGLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQztJQUN4RixDQUFDLENBQUM7SUFDRixPQUFPNkIsZ0JBQWdCO0VBQ3hCOztFQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVMyRixlQUFlLENBQUMxTyxXQUFxQixFQUFFa1EsS0FBaUIsRUFBVztJQUMzRSxPQUFPbFEsV0FBVyxDQUFDZ1EsSUFBSSxDQUFDLFVBQVVwRyxVQUFVLEVBQUU7TUFDN0MsSUFBSUEsVUFBVSxLQUFLc0csS0FBSyxDQUFDaEQsS0FBSyxFQUFFLEVBQUU7UUFDakMsT0FBTyxJQUFJO01BQ1o7TUFDQSxPQUFPLEtBQUs7SUFDYixDQUFDLENBQUM7RUFDSDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNpRCxzQkFBc0IsQ0FDOUJDLE9BQTBCLEVBQzFCM0IsVUFBZ0MsRUFDaEM0QixvQkFBNkIsRUFDN0J0SCxnQkFBcUMsRUFDckMyQixhQUE0QixFQUNuQjtJQUNULE9BQ0MwRixPQUFPLENBQUNoSCxRQUFRLEVBQUUsSUFDakJxRixVQUFVLENBQUNyRixRQUFRLEVBQUUsSUFBSWlILG9CQUFvQixHQUFJLEtBQUk1QixVQUFVLENBQUNyRixRQUFRLEVBQUcsRUFBQyxHQUFHLEVBQUUsQ0FBQyxJQUNsRkwsZ0JBQWdCLEdBQUksS0FBSTJCLGFBQWEsQ0FBQy9QLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBRSxLQUFJb08sZ0JBQWdCLENBQUNJLFdBQVksRUFBQyxHQUFHLEVBQUUsQ0FBQztFQUVwSTtFQUVBLFNBQVNtSCxnQkFBZ0IsQ0FBQzFILFFBQW9CLEVBQUUySCxTQUF1QixFQUFXO0lBQ2pGLE9BQU8sQ0FBQ0EsU0FBUyxDQUFDUCxJQUFJLENBQUMsVUFBVWxKLEtBQVUsRUFBRTtNQUM1QyxJQUFJMEosY0FBYyxHQUFHNUgsUUFBUSxDQUFDcEksU0FBUyxFQUFFO01BQ3pDLE9BQU9nUSxjQUFjLElBQUlBLGNBQWMsS0FBSzFKLEtBQUssRUFBRTtRQUNsRDBKLGNBQWMsR0FBR0EsY0FBYyxDQUFDaFEsU0FBUyxFQUFFO01BQzVDO01BQ0EsT0FBT2dRLGNBQWMsR0FBRyxJQUFJLEdBQUcsS0FBSztJQUNyQyxDQUFDLENBQUM7RUFDSDs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNM04sZUFBb0MsR0FBRztJQUM1QzdELFdBQVcsRUFBRUEsV0FBVztJQUN4QlYsbUJBQW1CLEVBQUVBLG1CQUFtQjtJQUN4Q2hELCtCQUErQixFQUFFQSwrQkFBK0I7SUFDaEVtTCw2QkFBNkIsRUFBRUEsNkJBQTZCO0lBQzVEbkYsc0JBQXNCLEVBQUV4SCx3QkFBd0I7SUFDaER5QixvQkFBb0IsRUFBRUEsb0JBQW9CO0lBQzFDaUIsMkJBQTJCLEVBQUVBLDJCQUEyQjtJQUN4RHdSLGtCQUFrQixFQUFFQSxrQkFBa0I7SUFDdEM1RixzQ0FBc0MsRUFBRUEsc0NBQXNDO0lBQzlFb0cseUNBQXlDLEVBQUVBLHlDQUF5QztJQUNwRkUsZUFBZSxFQUFFQSxlQUFlO0lBQ2hDL0UscUJBQXFCLEVBQUVBLHFCQUFxQjtJQUM1Q3dHLHNCQUFzQixFQUFFQSxzQkFBc0I7SUFDOUNHLGdCQUFnQixFQUFFQSxnQkFBZ0I7SUFDbEN6Siw4QkFBOEIsRUFBRUEsOEJBQThCO0lBQzlEZ0MsK0JBQStCLEVBQUVBLCtCQUErQjtJQUNoRWhCLGVBQWUsRUFBRUEsZUFBZTtJQUNoQ0YsbUJBQW1CLEVBQUVBLG1CQUFtQjtJQUN4QzBDLGtCQUFrQixFQUFFQSxrQkFBa0I7SUFDdENrQixtQkFBbUIsRUFBRUEsbUJBQW1CO0lBQ3hDVCxlQUFlLEVBQUVBLGVBQWU7SUFDaENHLCtDQUErQyxFQUFFQSwrQ0FBK0M7SUFDaEd6SCxjQUFjLEVBQUVBLGNBQWM7SUFDOUJzRixzQkFBc0IsRUFBRUEsc0JBQXNCO0lBQzlDdUMscUJBQXFCLEVBQUVBLHFCQUFxQjtJQUM1Q3pFLHlCQUF5QixFQUFFQSx5QkFBeUI7SUFDcEQ5RCw0QkFBNEIsRUFBRUEsNEJBQTRCO0lBQzFENkQsbUJBQW1CLEVBQUVBLG1CQUFtQjtJQUN4Q3VELGdCQUFnQixFQUFFQSxnQkFBZ0I7SUFDbENDLDBCQUEwQixFQUFFQTtFQUM3QixDQUFDO0VBQUMsT0FFYXRILGVBQWU7QUFBQSJ9
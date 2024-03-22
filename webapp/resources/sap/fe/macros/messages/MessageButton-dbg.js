/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/UriParameters", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/macros/messages/MessagePopover", "sap/m/Button", "sap/m/ColumnListItem", "sap/m/Dialog", "sap/m/FormattedText", "sap/m/library", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/mvc/View", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"], function (Log, UriParameters, messageHandling, ClassSupport, ResourceModelHelper, MessagePopover, Button, ColumnListItem, Dialog, FormattedText, library, Core, coreLibrary, View, Filter, FilterOperator, Sorter) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var MessageType = coreLibrary.MessageType;
  var ButtonType = library.ButtonType;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let MessageButton = (_dec = defineUI5Class("sap.fe.macros.messages.MessageButton"), _dec2 = aggregation({
    type: "sap.fe.macros.messages.MessageFilter",
    multiple: true,
    singularName: "customFilter"
  }), _dec3 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_Button) {
    _inheritsLoose(MessageButton, _Button);
    function MessageButton(id, settings) {
      var _this;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _this = _Button.call(this, id, settings) || this;
      _initializerDefineProperty(_this, "customFilters", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageChange", _descriptor2, _assertThisInitialized(_this));
      _this.sGeneralGroupText = "";
      _this.sViewId = "";
      _this.sLastActionText = "";
      return _this;
    }
    var _proto = MessageButton.prototype;
    _proto.init = function init() {
      Button.prototype.init.apply(this);
      //press event handler attached to open the message popover
      this.attachPress(this.handleMessagePopoverPress, this);
      this.oMessagePopover = new MessagePopover();
      this.oItemBinding = this.oMessagePopover.getBinding("items");
      this.oItemBinding.attachChange(this._setMessageData, this);
      const messageButtonId = this.getId();
      if (messageButtonId) {
        this.oMessagePopover.addCustomData(new sap.ui.core.CustomData({
          key: "messageButtonId",
          value: messageButtonId
        })); // TODO check for custom data type
      }

      this.attachModelContextChange(this._applyFiltersAndSort.bind(this));
      this.oMessagePopover.attachActiveTitlePress(this._activeTitlePress.bind(this));
    }

    /**
     * The method that is called when a user clicks on the MessageButton control.
     *
     * @param oEvent Event object
     */;
    _proto.handleMessagePopoverPress = function handleMessagePopoverPress(oEvent) {
      this.oMessagePopover.toggle(oEvent.getSource());
    }

    /**
     * The method that groups the messages based on the section or subsection they belong to.
     * This method force the loading of contexts for all tables before to apply the grouping.
     *
     * @param oView Current view.
     * @returns Return promise.
     * @private
     */;
    _proto._applyGroupingAsync = async function _applyGroupingAsync(oView) {
      const aWaitForData = [];
      const oViewBindingContext = oView.getBindingContext();
      const _findTablesRelatedToMessages = view => {
        const oRes = [];
        const aMessages = this.oItemBinding.getContexts().map(function (oContext) {
          return oContext.getObject();
        });
        const oViewContext = view.getBindingContext();
        if (oViewContext) {
          const oObjectPage = view.getContent()[0];
          messageHandling.getVisibleSectionsFromObjectPageLayout(oObjectPage).forEach(function (oSection) {
            oSection.getSubSections().forEach(function (oSubSection) {
              oSubSection.findElements(true).forEach(function (oElem) {
                if (oElem.isA("sap.ui.mdc.Table")) {
                  for (let i = 0; i < aMessages.length; i++) {
                    const oRowBinding = oElem.getRowBinding();
                    if (oRowBinding) {
                      const sElemeBindingPath = `${oViewContext.getPath()}/${oElem.getRowBinding().getPath()}`;
                      if (aMessages[i].target.indexOf(sElemeBindingPath) === 0) {
                        oRes.push({
                          table: oElem,
                          subsection: oSubSection
                        });
                        break;
                      }
                    }
                  }
                }
              });
            });
          });
        }
        return oRes;
      };
      // Search for table related to Messages and initialize the binding context of the parent subsection to retrieve the data
      const oTables = _findTablesRelatedToMessages.bind(this)(oView);
      oTables.forEach(function (_oTable) {
        var _oMDCTable$getBinding;
        const oMDCTable = _oTable.table,
          oSubsection = _oTable.subsection;
        if (!oMDCTable.getBindingContext() || ((_oMDCTable$getBinding = oMDCTable.getBindingContext()) === null || _oMDCTable$getBinding === void 0 ? void 0 : _oMDCTable$getBinding.getPath()) !== (oViewBindingContext === null || oViewBindingContext === void 0 ? void 0 : oViewBindingContext.getPath())) {
          oSubsection.setBindingContext(oViewBindingContext);
          if (!oMDCTable.getRowBinding().isLengthFinal()) {
            aWaitForData.push(new Promise(function (resolve) {
              oMDCTable.getRowBinding().attachEventOnce("dataReceived", function () {
                resolve();
              });
            }));
          }
        }
      });
      const waitForGroupingApplied = new Promise(resolve => {
        setTimeout(async () => {
          this._applyGrouping();
          resolve();
        }, 0);
      });
      try {
        await Promise.all(aWaitForData);
        oView.getModel().checkMessages();
        await waitForGroupingApplied;
      } catch (err) {
        Log.error("Error while grouping the messages in the messagePopOver");
      }
    }

    /**
     * The method that groups the messages based on the section or subsection they belong to.
     *
     * @private
     */;
    _proto._applyGrouping = function _applyGrouping() {
      this.oObjectPageLayout = this._getObjectPageLayout(this, this.oObjectPageLayout);
      if (!this.oObjectPageLayout) {
        return;
      }
      const aMessages = this.oMessagePopover.getItems();
      this._checkControlIdInSections(aMessages);
    }

    /**
     * The method retrieves the binding context for the refError object.
     * The refError contains a map to store the indexes of the rows with errors.
     *
     * @param oTable The table for which we want to get the refError Object.
     * @returns Context of the refError.
     * @private
     */;
    _proto._getTableRefErrorContext = function _getTableRefErrorContext(oTable) {
      const oModel = oTable.getModel("internal");
      //initialize the refError property if it doesn't exist
      if (!oTable.getBindingContext("internal").getProperty("refError")) {
        oModel.setProperty("refError", {}, oTable.getBindingContext("internal"));
      }
      const sRefErrorContextPath = oTable.getBindingContext("internal").getPath() + "/refError/" + oTable.getBindingContext().getPath().replace("/", "$") + "$" + oTable.getRowBinding().getPath().replace("/", "$");
      const oContext = oModel.getContext(sRefErrorContextPath);
      if (!oContext.getProperty("")) {
        oModel.setProperty("", {}, oContext);
      }
      return oContext;
    };
    _proto._updateInternalModel = function _updateInternalModel(oTableRowContext, iRowIndex, sTableTargetColProperty, oTable, oMessageObject, bIsCreationRow) {
      let oTemp;
      if (bIsCreationRow) {
        oTemp = {
          rowIndex: "CreationRow",
          targetColProperty: sTableTargetColProperty ? sTableTargetColProperty : ""
        };
      } else {
        oTemp = {
          rowIndex: oTableRowContext ? iRowIndex : "",
          targetColProperty: sTableTargetColProperty ? sTableTargetColProperty : ""
        };
      }
      const oModel = oTable.getModel("internal"),
        oContext = this._getTableRefErrorContext(oTable);
      //we first remove the entries with obsolete message ids from the internal model before inserting the new error info :
      const aValidMessageIds = sap.ui.getCore().getMessageManager().getMessageModel().getData().map(function (message) {
        return message.id;
      });
      let aObsoleteMessagelIds;
      if (oContext.getProperty()) {
        aObsoleteMessagelIds = Object.keys(oContext.getProperty()).filter(function (internalMessageId) {
          return aValidMessageIds.indexOf(internalMessageId) === -1;
        });
        aObsoleteMessagelIds.forEach(function (obsoleteId) {
          delete oContext.getProperty()[obsoleteId];
        });
      }
      oModel.setProperty(oMessageObject.getId(), Object.assign({}, oContext.getProperty(oMessageObject.getId()) ? oContext.getProperty(oMessageObject.getId()) : {}, oTemp), oContext);
    }

    /**
     * The method that sets groups for transient messages.
     *
     * @param {object} message The transient message for which we want to compute and set group.
     * @param {string} sActionName The action name.
     * @private
     */;
    _proto._setGroupLabelForTransientMsg = function _setGroupLabelForTransientMsg(message, sActionName) {
      this.sLastActionText = this.sLastActionText ? this.sLastActionText : Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_LAST_ACTION");
      message.setGroupName(`${this.sLastActionText}: ${sActionName}`);
    }

    /**
     * The method that groups messages and adds the subtitle.
     *
     * @param {object} message The message we use to compute the group and subtitle.
     * @param {object} section The section containing the controls.
     * @param {object} subSection The subsection containing the controls.
     * @param {object} aElements List of controls from a subsection related to a message.
     * @param {boolean} bMultipleSubSections True if there is more than 1 subsection in the section.
     * @param {string} sActionName The action name.
     * @returns {object} Return the control targeted by the message.
     * @private
     */;
    _proto._computeMessageGroupAndSubTitle = function _computeMessageGroupAndSubTitle(message, section, subSection, aElements, bMultipleSubSections, sActionName) {
      var _message$getBindingCo;
      const resourceModel = getResourceModel(section);
      this.oItemBinding.detachChange(this._setMessageData, this);
      const oMessageObject = (_message$getBindingCo = message.getBindingContext("message")) === null || _message$getBindingCo === void 0 ? void 0 : _message$getBindingCo.getObject();
      const setSectionNameInGroup = true;
      let oElement, oTable, oTargetTableInfo, l, iRowIndex, oTargetedControl, bIsCreationRow;
      const bIsBackendMessage = new RegExp("^/").test(oMessageObject === null || oMessageObject === void 0 ? void 0 : oMessageObject.getTargets()[0]);
      if (bIsBackendMessage) {
        for (l = 0; l < aElements.length; l++) {
          oElement = aElements[l];
          oTargetedControl = oElement;
          if (oElement.isA("sap.m.Table") || oElement.isA("sap.ui.table.Table")) {
            oTable = oElement.getParent();
            const oRowBinding = oTable.getRowBinding();
            const fnCallbackSetGroupName = (oMessageObj, actionName) => {
              this._setGroupLabelForTransientMsg(message, actionName);
            };
            if (oRowBinding && oRowBinding.isLengthFinal() && oTable.getBindingContext()) {
              const obj = messageHandling.getTableColumnDataAndSetSubtile(oMessageObject, oTable, oElement, oRowBinding, sActionName, setSectionNameInGroup, fnCallbackSetGroupName);
              oTargetTableInfo = obj.oTargetTableInfo;
              if (obj.subTitle) {
                message.setSubtitle(obj.subTitle);
              }
              message.setActiveTitle(!!oTargetTableInfo.oTableRowContext);
              if (oTargetTableInfo.oTableRowContext) {
                this._formatMessageDescription(message, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oTable);
              }
              iRowIndex = oTargetTableInfo.oTableRowContext && oTargetTableInfo.oTableRowContext.getIndex();
              this._updateInternalModel(oTargetTableInfo.oTableRowContext, iRowIndex, oTargetTableInfo.sTableTargetColProperty, oTable, oMessageObject);
            }
          } else {
            message.setActiveTitle(true);
            //check if the targeted control is a child of one of the other controls
            const bIsTargetedControlOrphan = messageHandling.bIsOrphanElement(oTargetedControl, aElements);
            if (bIsTargetedControlOrphan) {
              //set the subtitle
              message.setSubtitle("");
              break;
            }
          }
        }
      } else {
        //There is only one elt as this is a frontEnd message
        oTargetedControl = aElements[0];
        oTable = this._getMdcTable(oTargetedControl);
        if (oTable) {
          oTargetTableInfo = {};
          oTargetTableInfo.tableHeader = oTable.getHeader();
          const iTargetColumnIndex = this._getTableColumnIndex(oTargetedControl);
          oTargetTableInfo.sTableTargetColProperty = iTargetColumnIndex > -1 ? oTable.getColumns()[iTargetColumnIndex].getDataProperty() : undefined;
          oTargetTableInfo.sTableTargetColName = oTargetTableInfo.sTableTargetColProperty && iTargetColumnIndex > -1 ? oTable.getColumns()[iTargetColumnIndex].getHeader() : undefined;
          bIsCreationRow = this._getTableRow(oTargetedControl).isA("sap.ui.table.CreationRow");
          if (!bIsCreationRow) {
            iRowIndex = this._getTableRowIndex(oTargetedControl);
            oTargetTableInfo.oTableRowBindingContexts = oTable.getRowBinding().getCurrentContexts();
            oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts[iRowIndex];
          }
          const sMessageSubtitle = messageHandling.getMessageSubtitle(oMessageObject, oTargetTableInfo.oTableRowBindingContexts, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oTable, bIsCreationRow, iTargetColumnIndex === 0 && oTargetedControl.getValueState() === "Error" ? oTargetedControl : undefined);
          //set the subtitle
          if (sMessageSubtitle) {
            message.setSubtitle(sMessageSubtitle);
          }
          message.setActiveTitle(true);
          this._updateInternalModel(oTargetTableInfo.oTableRowContext, iRowIndex, oTargetTableInfo.sTableTargetColProperty, oTable, oMessageObject, bIsCreationRow);
        }
      }
      if (setSectionNameInGroup) {
        const sectionBasedGroupName = messageHandling.createSectionGroupName(section, subSection, bMultipleSubSections, oTargetTableInfo, resourceModel);
        message.setGroupName(sectionBasedGroupName);
        const sViewId = this._getViewId(this.getId());
        const oView = Core.byId(sViewId);
        const oMessageTargetProperty = oMessageObject.getTargets()[0] && oMessageObject.getTargets()[0].split("/").pop();
        const oUIModel = oView === null || oView === void 0 ? void 0 : oView.getModel("internal");
        if (oUIModel && oUIModel.getProperty("/messageTargetProperty") && oMessageTargetProperty && oMessageTargetProperty === oUIModel.getProperty("/messageTargetProperty")) {
          this.oMessagePopover.fireActiveTitlePress({
            item: message
          });
          oUIModel.setProperty("/messageTargetProperty", false);
        }
      }
      this.oItemBinding.attachChange(this._setMessageData, this);
      return oTargetedControl;
    };
    _proto._checkControlIdInSections = function _checkControlIdInSections(aMessages) {
      let section, aSubSections, message, i, j, k;
      this.sGeneralGroupText = this.sGeneralGroupText ? this.sGeneralGroupText : Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_GENERAL");
      //Get all sections from the object page layout
      const aVisibleSections = messageHandling.getVisibleSectionsFromObjectPageLayout(this.oObjectPageLayout);
      if (aVisibleSections) {
        var _oView$getBindingCont;
        const viewId = this._getViewId(this.getId());
        const oView = Core.byId(viewId);
        const sActionName = oView === null || oView === void 0 ? void 0 : (_oView$getBindingCont = oView.getBindingContext("internal")) === null || _oView$getBindingCont === void 0 ? void 0 : _oView$getBindingCont.getProperty("sActionName");
        if (sActionName) {
          (oView === null || oView === void 0 ? void 0 : oView.getBindingContext("internal")).setProperty("sActionName", null);
        }
        for (i = aMessages.length - 1; i >= 0; --i) {
          // Loop over all messages
          message = aMessages[i];
          let bIsGeneralGroupName = true;
          for (j = aVisibleSections.length - 1; j >= 0; --j) {
            // Loop over all visible sections
            section = aVisibleSections[j];
            aSubSections = section.getSubSections();
            for (k = aSubSections.length - 1; k >= 0; --k) {
              // Loop over all sub-sections
              const subSection = aSubSections[k];
              const oMessageObject = message.getBindingContext("message").getObject();
              const aControls = messageHandling.getControlFromMessageRelatingToSubSection(subSection, oMessageObject);
              if (aControls.length > 0) {
                const oTargetedControl = this._computeMessageGroupAndSubTitle(message, section, subSection, aControls, aSubSections.length > 1, sActionName);
                // if we found table that matches with the message, we don't stop the loop
                // in case we find an additional control (eg mdc field) that also match with the message
                if (oTargetedControl && !oTargetedControl.isA("sap.m.Table") && !oTargetedControl.isA("sap.ui.table.Table")) {
                  j = k = -1;
                }
                bIsGeneralGroupName = false;
              }
            }
          }
          if (bIsGeneralGroupName) {
            const oMessageObject = message.getBindingContext("message").getObject();
            message.setActiveTitle(false);
            if (oMessageObject.persistent && sActionName) {
              this._setGroupLabelForTransientMsg(message, sActionName);
            } else {
              message.setGroupName(this.sGeneralGroupText);
            }
          }
        }
      }
    };
    _proto._findTargetForMessage = function _findTargetForMessage(message) {
      const messageObject = message.getBindingContext("message") && message.getBindingContext("message").getObject();
      if (messageObject && messageObject.target) {
        const oMetaModel = this.oObjectPageLayout && this.oObjectPageLayout.getModel() && this.oObjectPageLayout.getModel().getMetaModel(),
          contextPath = oMetaModel && oMetaModel.getMetaPath(messageObject.target),
          oContextPathMetadata = oMetaModel && oMetaModel.getObject(contextPath);
        if (oContextPathMetadata && oContextPathMetadata.$kind === "Property") {
          return true;
        }
      }
    };
    _proto._fnEnableBindings = function _fnEnableBindings(aSections) {
      if (UriParameters.fromQuery(window.location.search).get("sap-fe-xx-lazyloadingtest")) {
        return;
      }
      for (let iSection = 0; iSection < aSections.length; iSection++) {
        const oSection = aSections[iSection];
        let nonTableChartcontrolFound = false;
        const aSubSections = oSection.getSubSections();
        for (let iSubSection = 0; iSubSection < aSubSections.length; iSubSection++) {
          const oSubSection = aSubSections[iSubSection];
          const oAllBlocks = oSubSection.getBlocks();
          if (oAllBlocks) {
            for (let block = 0; block < oSubSection.getBlocks().length; block++) {
              var _oAllBlocks$block$get;
              if (oAllBlocks[block].getContent && !((_oAllBlocks$block$get = oAllBlocks[block].getContent()) !== null && _oAllBlocks$block$get !== void 0 && _oAllBlocks$block$get.isA("sap.fe.macros.table.TableAPI"))) {
                nonTableChartcontrolFound = true;
                break;
              }
            }
            if (nonTableChartcontrolFound) {
              oSubSection.setBindingContext(undefined);
            }
          }
          if (oSubSection.getBindingContext()) {
            this._findMessageGroupAfterRebinding();
            oSubSection.getBindingContext().getBinding().attachDataReceived(this._findMessageGroupAfterRebinding.bind(this));
          }
        }
      }
    };
    _proto._findMessageGroupAfterRebinding = function _findMessageGroupAfterRebinding() {
      const aMessages = this.oMessagePopover.getItems();
      this._checkControlIdInSections(aMessages);
    }

    /**
     * The method that retrieves the view ID (HTMLView/XMLView/JSONview/JSView/Templateview) of any control.
     *
     * @param sControlId ID of the control needed to retrieve the view ID
     * @returns The view ID of the control
     */;
    _proto._getViewId = function _getViewId(sControlId) {
      let sViewId,
        oControl = Core.byId(sControlId);
      while (oControl) {
        if (oControl instanceof View) {
          sViewId = oControl.getId();
          break;
        }
        oControl = oControl.getParent();
      }
      return sViewId;
    };
    _proto._setLongtextUrlDescription = function _setLongtextUrlDescription(sMessageDescriptionContent, oDiagnosisTitle) {
      this.oMessagePopover.setAsyncDescriptionHandler(function (config) {
        // This stores the old description
        const sOldDescription = sMessageDescriptionContent;
        // Here we can fetch the data and concatenate it to the old one
        // By default, the longtextUrl fetching will overwrite the description (with the default behaviour)
        // Here as we have overwritten the default async handler, which fetches and replaces the description of the item
        // we can manually modify it to include whatever needed.
        const sLongTextUrl = config.item.getLongtextUrl();
        if (sLongTextUrl) {
          jQuery.ajax({
            type: "GET",
            url: sLongTextUrl,
            success: function (data) {
              const sDiagnosisText = oDiagnosisTitle.getHtmlText() + data;
              config.item.setDescription(`${sOldDescription}${sDiagnosisText}`);
              config.promise.resolve();
            },
            error: function () {
              config.item.setDescription(sMessageDescriptionContent);
              const sError = `A request has failed for long text data. URL: ${sLongTextUrl}`;
              Log.error(sError);
              config.promise.reject(sError);
            }
          });
        }
      });
    };
    _proto._formatMessageDescription = function _formatMessageDescription(message, oTableRowContext, sTableTargetColName, oTable) {
      var _message$getBindingCo2;
      const resourceModel = getResourceModel(oTable);
      const sTableFirstColProperty = oTable.getParent().getIdentifierColumn();
      let sColumnInfo = "";
      const oMsgObj = (_message$getBindingCo2 = message.getBindingContext("message")) === null || _message$getBindingCo2 === void 0 ? void 0 : _message$getBindingCo2.getObject();
      const oColFromTableSettings = messageHandling.fetchColumnInfo(oMsgObj, oTable);
      if (sTableTargetColName) {
        // if column in present in table definition
        sColumnInfo = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")}: ${sTableTargetColName}`;
      } else if (oColFromTableSettings) {
        if (oColFromTableSettings.availability === "Hidden") {
          // if column in neither in table definition nor personalization
          if (message.getType() === "Error") {
            sColumnInfo = sTableFirstColProperty ? `${resourceModel.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR")} ${oTableRowContext.getValue(sTableFirstColProperty)}` + "." : `${resourceModel.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR")}` + ".";
          } else {
            sColumnInfo = sTableFirstColProperty ? `${resourceModel.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC")} ${oTableRowContext.getValue(sTableFirstColProperty)}` + "." : `${resourceModel.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC")}` + ".";
          }
        } else {
          // if column is not in table definition but in personalization
          //if no navigation to sub op then remove link to error field BCP : 2280168899
          if (!this._navigationConfigured(oTable)) {
            message.setActiveTitle(false);
          }
          sColumnInfo = `${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")}: ${oColFromTableSettings.label} (${resourceModel.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION")})`;
        }
      }
      const oFieldsAffectedTitle = new FormattedText({
        htmlText: `<html><body><strong>${resourceModel.getText("T_FIELDS_AFFECTED_TITLE")}</strong></body></html><br>`
      });
      let sFieldAffectedText;
      if (sTableFirstColProperty) {
        sFieldAffectedText = `${oFieldsAffectedTitle.getHtmlText()}<br>${resourceModel.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTable.getHeader()}<br>${resourceModel.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${oTableRowContext.getValue(sTableFirstColProperty)}<br>${sColumnInfo}<br>`;
      } else if (sColumnInfo == "" || !sColumnInfo) {
        sFieldAffectedText = "";
      } else {
        sFieldAffectedText = `${oFieldsAffectedTitle.getHtmlText()}<br>${resourceModel.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTable.getHeader()}<br>${sColumnInfo}<br>`;
      }
      const oDiagnosisTitle = new FormattedText({
        htmlText: `<html><body><strong>${resourceModel.getText("T_DIAGNOSIS_TITLE")}</strong></body></html><br>`
      });
      // get the UI messages from the message context to set it to Diagnosis section
      const sUIMessageDescription = message.getBindingContext("message").getObject().description;
      //set the description to null to reset it below
      message.setDescription(null);
      let sDiagnosisText = "";
      let sMessageDescriptionContent = "";
      if (message.getLongtextUrl()) {
        sMessageDescriptionContent = `${sFieldAffectedText}<br>`;
        this._setLongtextUrlDescription(sMessageDescriptionContent, oDiagnosisTitle);
      } else if (sUIMessageDescription) {
        sDiagnosisText = `${oDiagnosisTitle.getHtmlText()}<br>${sUIMessageDescription}`;
        sMessageDescriptionContent = `${sFieldAffectedText}<br>${sDiagnosisText}`;
        message.setDescription(sMessageDescriptionContent);
      } else {
        message.setDescription(sFieldAffectedText);
      }
    }

    /**
     * Method to set the button text, count and icon property based upon the message items
     * ButtonType:  Possible settings for warning and error messages are 'critical' and 'negative'.
     *
     *
     * @private
     */;
    _proto._setMessageData = function _setMessageData() {
      clearTimeout(this._setMessageDataTimeout);
      this._setMessageDataTimeout = setTimeout(async () => {
        const sIcon = "",
          oMessages = this.oMessagePopover.getItems(),
          oMessageCount = {
            Error: 0,
            Warning: 0,
            Success: 0,
            Information: 0
          },
          oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
          iMessageLength = oMessages.length;
        let sButtonType = ButtonType.Default,
          sMessageKey = "",
          sTooltipText = "",
          sMessageText = "";
        if (iMessageLength > 0) {
          for (let i = 0; i < iMessageLength; i++) {
            if (!oMessages[i].getType() || oMessages[i].getType() === "") {
              ++oMessageCount["Information"];
            } else {
              ++oMessageCount[oMessages[i].getType()];
            }
          }
          if (oMessageCount[MessageType.Error] > 0) {
            sButtonType = ButtonType.Negative;
          } else if (oMessageCount[MessageType.Warning] > 0) {
            sButtonType = ButtonType.Critical;
          } else if (oMessageCount[MessageType.Success] > 0) {
            sButtonType = ButtonType.Success;
          } else if (oMessageCount[MessageType.Information] > 0) {
            sButtonType = ButtonType.Neutral;
          }
          const totalNumberOfMessages = oMessageCount[MessageType.Error] + oMessageCount[MessageType.Warning] + oMessageCount[MessageType.Success] + oMessageCount[MessageType.Information];
          this.setText(totalNumberOfMessages.toString());
          if (oMessageCount.Error === 1) {
            sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERROR";
          } else if (oMessageCount.Error > 1) {
            sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_MULTIPLE_ERROR_TOOLTIP";
          } else if (!oMessageCount.Error && oMessageCount.Warning) {
            sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_WARNING_TOOLTIP";
          } else if (!oMessageCount.Error && !oMessageCount.Warning && oMessageCount.Information) {
            sMessageKey = "C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_INFO";
          } else if (!oMessageCount.Error && !oMessageCount.Warning && !oMessageCount.Information && oMessageCount.Success) {
            sMessageKey = "C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_SUCCESS";
          }
          if (sMessageKey) {
            sMessageText = oResourceBundle.getText(sMessageKey);
            sTooltipText = oMessageCount.Error ? `${oMessageCount.Error} ${sMessageText}` : sMessageText;
            this.setTooltip(sTooltipText);
          }
          this.setIcon(sIcon);
          this.setType(sButtonType);
          this.setVisible(true);
          const oView = Core.byId(this.sViewId);
          if (oView) {
            const oPageReady = oView.getController().pageReady;
            try {
              await oPageReady.waitPageReady();
              await this._applyGroupingAsync(oView);
            } catch (err) {
              Log.error("fail grouping messages");
            }
            this.fireMessageChange({
              iMessageLength: iMessageLength
            });
          }
          if (iMessageLength > 1) {
            this.oMessagePopover.navigateBack();
          }
        } else {
          this.setVisible(false);
          this.fireMessageChange({
            iMessageLength: iMessageLength
          });
        }
      }, 100);
    }

    /**
     * The method that is called when a user clicks on the title of the message.
     *
     * @function
     * @name _activeTitlePress
     * @private
     * @param oEvent Event object passed from the handler
     */;
    _proto._activeTitlePress = async function _activeTitlePress(oEvent) {
      const oInternalModelContext = this.getBindingContext("pageInternal");
      oInternalModelContext.setProperty("errorNavigationSectionFlag", true);
      const oItem = oEvent.getParameter("item"),
        oMessage = oItem.getBindingContext("message").getObject(),
        bIsBackendMessage = new RegExp("^/").test(oMessage.getTarget()),
        oView = Core.byId(this.sViewId);
      let oControl, sSectionTitle;
      const _defaultFocus = function (message, mdcTable) {
        const focusInfo = {
          preventScroll: true,
          targetInfo: message
        };
        mdcTable.focus(focusInfo);
      };

      //check if the pressed item is related to a table control
      if (oItem.getGroupName().indexOf("Table:") !== -1) {
        let oTargetMdcTable;
        if (bIsBackendMessage) {
          oTargetMdcTable = oMessage.controlIds.map(function (sControlId) {
            const control = Core.byId(sControlId);
            const oParentControl = control && control.getParent();
            return oParentControl && oParentControl.isA("sap.ui.mdc.Table") && oParentControl.getHeader() === oItem.getGroupName().split(", Table: ")[1] ? oParentControl : null;
          }).reduce(function (acc, val) {
            return val ? val : acc;
          });
          if (oTargetMdcTable) {
            sSectionTitle = oItem.getGroupName().split(", ")[0];
            try {
              await this._navigateFromMessageToSectionTableInIconTabBarMode(oTargetMdcTable, this.oObjectPageLayout, sSectionTitle);
              const oRefErrorContext = this._getTableRefErrorContext(oTargetMdcTable);
              const oRefError = oRefErrorContext.getProperty(oItem.getBindingContext("message").getObject().getId());
              const _setFocusOnTargetField = async (targetMdcTable, iRowIndex) => {
                const aTargetMdcTableRow = this._getMdcTableRows(targetMdcTable),
                  iFirstVisibleRow = this._getGridTable(targetMdcTable).getFirstVisibleRow();
                if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
                  const oTargetRow = aTargetMdcTableRow[iRowIndex - iFirstVisibleRow],
                    oTargetCell = this.getTargetCell(oTargetRow, oMessage);
                  if (oTargetCell) {
                    this.setFocusToControl(oTargetCell);
                    return undefined;
                  } else {
                    // control not found on table
                    const errorProperty = oMessage.getTarget().split("/").pop();
                    if (errorProperty) {
                      oView.getModel("internal").setProperty("/messageTargetProperty", errorProperty);
                    }
                    if (this._navigationConfigured(targetMdcTable)) {
                      return oView.getController()._routing.navigateForwardToContext(oTargetRow.getBindingContext());
                    } else {
                      return false;
                    }
                  }
                }
                return undefined;
              };
              if (oTargetMdcTable.data("tableType") === "GridTable" && oRefError.rowIndex !== "") {
                const iFirstVisibleRow = this._getGridTable(oTargetMdcTable).getFirstVisibleRow();
                try {
                  await oTargetMdcTable.scrollToIndex(oRefError.rowIndex);
                  const aTargetMdcTableRow = this._getMdcTableRows(oTargetMdcTable);
                  let iNewFirstVisibleRow, bScrollNeeded;
                  if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
                    iNewFirstVisibleRow = aTargetMdcTableRow[0].getParent().getFirstVisibleRow();
                    bScrollNeeded = iFirstVisibleRow - iNewFirstVisibleRow !== 0;
                  }
                  let oWaitControlIdAdded;
                  if (bScrollNeeded) {
                    //The scrollToIndex function does not wait for the UI update. As a workaround, pending a fix from MDC (BCP: 2170251631) we use the event "UIUpdated".
                    oWaitControlIdAdded = new Promise(function (resolve) {
                      Core.attachEvent("UIUpdated", resolve);
                    });
                  } else {
                    oWaitControlIdAdded = Promise.resolve();
                  }
                  await oWaitControlIdAdded;
                  setTimeout(async function () {
                    const focusOnTargetField = await _setFocusOnTargetField(oTargetMdcTable, oRefError.rowIndex);
                    if (focusOnTargetField === false) {
                      _defaultFocus(oMessage, oTargetMdcTable);
                    }
                  }, 0);
                } catch (err) {
                  Log.error("Error while focusing on error");
                }
              } else if (oTargetMdcTable.data("tableType") === "ResponsiveTable" && oRefError) {
                const focusOnMessageTargetControl = await this.focusOnMessageTargetControl(oView, oMessage, oTargetMdcTable, oRefError.rowIndex);
                if (focusOnMessageTargetControl === false) {
                  _defaultFocus(oMessage, oTargetMdcTable);
                }
              } else {
                this.focusOnMessageTargetControl(oView, oMessage);
              }
            } catch (err) {
              Log.error("Fail to navigate to Error control");
            }
          }
        } else {
          oControl = Core.byId(oMessage.controlIds[0]);
          //If the control underlying the frontEnd message is not within the current section, we first go into the target section:
          const oSelectedSection = Core.byId(this.oObjectPageLayout.getSelectedSection());
          if ((oSelectedSection === null || oSelectedSection === void 0 ? void 0 : oSelectedSection.findElements(true).indexOf(oControl)) === -1) {
            sSectionTitle = oItem.getGroupName().split(", ")[0];
            this._navigateFromMessageToSectionInIconTabBarMode(this.oObjectPageLayout, sSectionTitle);
          }
          this.setFocusToControl(oControl);
        }
      } else {
        // focus on control
        sSectionTitle = oItem.getGroupName().split(", ")[0];
        this._navigateFromMessageToSectionInIconTabBarMode(this.oObjectPageLayout, sSectionTitle);
        this.focusOnMessageTargetControl(oView, oMessage);
      }
    }

    /**
     * Retrieves a table cell targeted by a message.
     *
     * @param {object} targetRow A table row
     * @param {object} message Message targeting a cell
     * @returns {object} Returns the cell
     * @private
     */;
    _proto.getTargetCell = function getTargetCell(targetRow, message) {
      return message.getControlIds().length > 0 ? message.getControlIds().map(function (controlId) {
        const isControlInTable = targetRow.findElements(true, function (elem) {
          return elem.getId() === controlId;
        });
        return isControlInTable.length > 0 ? Core.byId(controlId) : null;
      }).reduce(function (acc, val) {
        return val ? val : acc;
      }) : null;
    }

    /**
     * Focus on the control targeted by a message.
     *
     * @param {object} view The current view
     * @param {object} message The message targeting the control on which we want to set the focus
     * @param {object} targetMdcTable The table targeted by the message (optional)
     * @param {number} rowIndex The row index of the table targeted by the message (optional)
     * @returns {Promise} Promise
     * @private
     */;
    _proto.focusOnMessageTargetControl = async function focusOnMessageTargetControl(view, message, targetMdcTable, rowIndex) {
      const aAllViewElements = view.findElements(true);
      const aErroneousControls = message.getControlIds().filter(function (sControlId) {
        return aAllViewElements.some(function (oElem) {
          return oElem.getId() === sControlId && oElem.getDomRef();
        });
      }).map(function (sControlId) {
        return Core.byId(sControlId);
      });
      const aNotTableErroneousControls = aErroneousControls.filter(function (oElem) {
        return !oElem.isA("sap.m.Table") && !oElem.isA("sap.ui.table.Table");
      });
      //The focus is set on Not Table control in priority
      if (aNotTableErroneousControls.length > 0) {
        this.setFocusToControl(aNotTableErroneousControls[0]);
        return undefined;
      } else if (aErroneousControls.length > 0) {
        const aTargetMdcTableRow = targetMdcTable ? targetMdcTable.findElements(true, function (oElem) {
          return oElem.isA(ColumnListItem.getMetadata().getName());
        }) : [];
        if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
          const oTargetRow = aTargetMdcTableRow[rowIndex];
          const oTargetCell = this.getTargetCell(oTargetRow, message);
          if (oTargetCell) {
            const oTargetField = oTargetCell.isA("sap.fe.macros.field.FieldAPI") ? oTargetCell.getContent().getContentEdit()[0] : oTargetCell.getItems()[0].getContent().getContentEdit()[0];
            this.setFocusToControl(oTargetField);
            return undefined;
          } else {
            const errorProperty = message.getTarget().split("/").pop();
            if (errorProperty) {
              view.getModel("internal").setProperty("/messageTargetProperty", errorProperty);
            }
            if (this._navigationConfigured(targetMdcTable)) {
              return view.getController()._routing.navigateForwardToContext(oTargetRow.getBindingContext());
            } else {
              return false;
            }
          }
        }
        return undefined;
      }
      return undefined;
    }

    /**
     *
     * @param obj The message object
     * @param aSections The array of sections in the object page
     * @returns The rank of the message
     */;
    _proto._getMessageRank = function _getMessageRank(obj, aSections) {
      if (aSections) {
        let section, aSubSections, subSection, j, k, aElements, aAllElements, sectionRank;
        for (j = aSections.length - 1; j >= 0; --j) {
          // Loop over all sections
          section = aSections[j];
          aSubSections = section.getSubSections();
          for (k = aSubSections.length - 1; k >= 0; --k) {
            // Loop over all sub-sections
            subSection = aSubSections[k];
            aAllElements = subSection.findElements(true); // Get all elements inside a sub-section
            //Try to find the control 1 inside the sub section
            aElements = aAllElements.filter(this._fnFilterUponId.bind(this, obj.getControlId()));
            sectionRank = j + 1;
            if (aElements.length > 0) {
              if (section.getVisible() && subSection.getVisible()) {
                if (!obj.hasOwnProperty("sectionName")) {
                  obj.sectionName = section.getTitle();
                }
                if (!obj.hasOwnProperty("subSectionName")) {
                  obj.subSectionName = subSection.getTitle();
                }
                return sectionRank * 10 + (k + 1);
              } else {
                // if section or subsection is invisible then group name would be Last Action
                // so ranking should be lower
                return 1;
              }
            }
          }
        }
        //if sub section title is Other messages, we return a high number(rank), which ensures
        //that messages belonging to this sub section always come later in messagePopover
        if (!obj.sectionName && !obj.subSectionName && obj.persistent) {
          return 1;
        }
        return 999;
      }
      return 999;
    }

    /**
     * Method to set the filters based upon the message items
     * The desired filter operation is:
     * ( filters provided by user && ( validation = true && Control should be present in view ) || messages for the current matching context ).
     *
     * @private
     */;
    _proto._applyFiltersAndSort = function _applyFiltersAndSort() {
      let oValidationFilters,
        oValidationAndContextFilter,
        oFilters,
        sPath,
        oSorter,
        oDialogFilter,
        objectPageLayoutSections = null;
      const aUserDefinedFilter = [];
      const filterOutMessagesInDialog = () => {
        const fnTest = aControlIds => {
          let index = Infinity,
            oControl = Core.byId(aControlIds[0]);
          const errorFieldControl = Core.byId(aControlIds[0]);
          while (oControl) {
            const fieldRankinDialog = oControl instanceof Dialog ? (errorFieldControl === null || errorFieldControl === void 0 ? void 0 : errorFieldControl.getParent()).findElements(true).indexOf(errorFieldControl) : Infinity;
            if (oControl instanceof Dialog) {
              if (index > fieldRankinDialog) {
                index = fieldRankinDialog;
                // Set the focus to the dialog's control
                this.setFocusToControl(errorFieldControl);
              }
              // messages for sap.m.Dialog should not appear in the message button
              return false;
            }
            oControl = oControl.getParent();
          }
          return true;
        };
        return new Filter({
          path: "controlIds",
          test: fnTest,
          caseSensitive: true
        });
      };
      //Filter function to verify if the control is part of the current view or not
      function getCheckControlInViewFilter() {
        const fnTest = function (aControlIds) {
          if (!aControlIds.length) {
            return false;
          }
          let oControl = Core.byId(aControlIds[0]);
          while (oControl) {
            if (oControl.getId() === sViewId) {
              return true;
            }
            if (oControl instanceof Dialog) {
              // messages for sap.m.Dialog should not appear in the message button
              return false;
            }
            oControl = oControl.getParent();
          }
          return false;
        };
        return new Filter({
          path: "controlIds",
          test: fnTest,
          caseSensitive: true
        });
      }
      if (!this.sViewId) {
        this.sViewId = this._getViewId(this.getId());
      }
      const sViewId = this.sViewId;
      //Add the filters provided by the user
      const aCustomFilters = this.getAggregation("customFilters");
      if (aCustomFilters) {
        aCustomFilters.forEach(function (filter) {
          aUserDefinedFilter.push(new Filter({
            path: filter.getProperty("path"),
            operator: filter.getProperty("operator"),
            value1: filter.getProperty("value1"),
            value2: filter.getProperty("value2")
          }));
        });
      }
      const oBindingContext = this.getBindingContext();
      if (!oBindingContext) {
        this.setVisible(false);
        return;
      } else {
        sPath = oBindingContext.getPath();
        //Filter for filtering out only validation messages which are currently present in the view
        oValidationFilters = new Filter({
          filters: [new Filter({
            path: "validation",
            operator: FilterOperator.EQ,
            value1: true
          }), getCheckControlInViewFilter()],
          and: true
        });
        //Filter for filtering out the bound messages i.e target starts with the context path
        oValidationAndContextFilter = new Filter({
          filters: [oValidationFilters, new Filter({
            path: "target",
            operator: FilterOperator.StartsWith,
            value1: sPath
          })],
          and: false
        });
        oDialogFilter = new Filter({
          filters: [filterOutMessagesInDialog()]
        });
      }
      const oValidationContextDialogFilters = new Filter({
        filters: [oValidationAndContextFilter, oDialogFilter],
        and: true
      });
      // and finally - if there any - add custom filter (via OR)
      if (aUserDefinedFilter.length > 0) {
        oFilters = new Filter({
          filters: [aUserDefinedFilter, oValidationContextDialogFilters],
          and: false
        });
      } else {
        oFilters = oValidationContextDialogFilters;
      }
      this.oItemBinding.filter(oFilters);
      this.oObjectPageLayout = this._getObjectPageLayout(this, this.oObjectPageLayout);
      // We support sorting only for ObjectPageLayout use-case.
      if (this.oObjectPageLayout) {
        oSorter = new Sorter("", null, null, (obj1, obj2) => {
          if (!objectPageLayoutSections) {
            objectPageLayoutSections = this.oObjectPageLayout && this.oObjectPageLayout.getSections();
          }
          const rankA = this._getMessageRank(obj1, objectPageLayoutSections);
          const rankB = this._getMessageRank(obj2, objectPageLayoutSections);
          if (rankA < rankB) {
            return -1;
          }
          if (rankA > rankB) {
            return 1;
          }
          return 0;
        });
        this.oItemBinding.sort(oSorter);
      }
    }

    /**
     *
     * @param sControlId
     * @param oItem
     * @returns True if the control ID matches the item ID
     */;
    _proto._fnFilterUponId = function _fnFilterUponId(sControlId, oItem) {
      return sControlId === oItem.getId();
    }

    /**
     * Retrieves the section based on section title and visibility.
     *
     * @param oObjectPage Object page.
     * @param sSectionTitle Section title.
     * @returns The section
     * @private
     */;
    _proto._getSectionBySectionTitle = function _getSectionBySectionTitle(oObjectPage, sSectionTitle) {
      let oSection;
      if (sSectionTitle) {
        const aSections = oObjectPage.getSections();
        for (let i = 0; i < aSections.length; i++) {
          if (aSections[i].getVisible() && aSections[i].getTitle() === sSectionTitle) {
            oSection = aSections[i];
            break;
          }
        }
      }
      return oSection;
    }

    /**
     * Navigates to the section if the object page uses an IconTabBar and if the current section is not the target of the navigation.
     *
     * @param oObjectPage Object page.
     * @param sSectionTitle Section title.
     * @private
     */;
    _proto._navigateFromMessageToSectionInIconTabBarMode = function _navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle) {
      const bUseIconTabBar = oObjectPage.getUseIconTabBar();
      if (bUseIconTabBar) {
        const oSection = this._getSectionBySectionTitle(oObjectPage, sSectionTitle);
        const sSelectedSectionId = oObjectPage.getSelectedSection();
        if (oSection && sSelectedSectionId !== oSection.getId()) {
          oObjectPage.setSelectedSection(oSection.getId());
        }
      }
    };
    _proto._navigateFromMessageToSectionTableInIconTabBarMode = async function _navigateFromMessageToSectionTableInIconTabBarMode(oTable, oObjectPage, sSectionTitle) {
      const oRowBinding = oTable.getRowBinding();
      const oTableContext = oTable.getBindingContext();
      const oOPContext = oObjectPage.getBindingContext();
      const bShouldWaitForTableRefresh = !(oTableContext === oOPContext);
      this._navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle);
      return new Promise(function (resolve) {
        if (bShouldWaitForTableRefresh) {
          oRowBinding.attachEventOnce("change", function () {
            resolve();
          });
        } else {
          resolve();
        }
      });
    }

    /**
     * Retrieves the MdcTable if it is found among any of the parent elements.
     *
     * @param oElement Control
     * @returns MDC table || undefined
     * @private
     */;
    _proto._getMdcTable = function _getMdcTable(oElement) {
      //check if the element has a table within any of its parents
      let oParentElement = oElement.getParent();
      while (oParentElement && !oParentElement.isA("sap.ui.mdc.Table")) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement && oParentElement.isA("sap.ui.mdc.Table") ? oParentElement : undefined;
    };
    _proto._getGridTable = function _getGridTable(oMdcTable) {
      return oMdcTable.findElements(true, function (oElem) {
        return oElem.isA("sap.ui.table.Table") && /** We check the element belongs to the MdcTable :*/
        oElem.getParent() === oMdcTable;
      })[0];
    }

    /**
     * Retrieves the table row (if available) containing the element.
     *
     * @param oElement Control
     * @returns Table row || undefined
     * @private
     */;
    _proto._getTableRow = function _getTableRow(oElement) {
      let oParentElement = oElement.getParent();
      while (oParentElement && !oParentElement.isA("sap.ui.table.Row") && !oParentElement.isA("sap.ui.table.CreationRow") && !oParentElement.isA(ColumnListItem.getMetadata().getName())) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement && (oParentElement.isA("sap.ui.table.Row") || oParentElement.isA("sap.ui.table.CreationRow") || oParentElement.isA(ColumnListItem.getMetadata().getName())) ? oParentElement : undefined;
    }

    /**
     * Retrieves the index of the table row containing the element.
     *
     * @param oElement Control
     * @returns Row index || undefined
     * @private
     */;
    _proto._getTableRowIndex = function _getTableRowIndex(oElement) {
      const oTableRow = this._getTableRow(oElement);
      let iRowIndex;
      if (oTableRow.isA("sap.ui.table.Row")) {
        iRowIndex = oTableRow.getIndex();
      } else {
        iRowIndex = oTableRow.getTable().getItems().findIndex(function (element) {
          return element.getId() === oTableRow.getId();
        });
      }
      return iRowIndex;
    }

    /**
     * Retrieves the index of the table column containing the element.
     *
     * @param oElement Control
     * @returns Column index || undefined
     * @private
     */;
    _proto._getTableColumnIndex = function _getTableColumnIndex(oElement) {
      const getTargetCellIndex = function (element, oTargetRow) {
        return oTargetRow.getCells().findIndex(function (oCell) {
          return oCell.getId() === element.getId();
        });
      };
      const getTargetColumnIndex = function (element, oTargetRow) {
        let oTargetElement = element.getParent(),
          iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
        while (oTargetElement && iTargetCellIndex < 0) {
          oTargetElement = oTargetElement.getParent();
          iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
        }
        return iTargetCellIndex;
      };
      const oTargetRow = this._getTableRow(oElement);
      let iTargetColumnIndex;
      iTargetColumnIndex = getTargetColumnIndex(oElement, oTargetRow);
      if (oTargetRow.isA("sap.ui.table.CreationRow")) {
        const sTargetCellId = oTargetRow.getCells()[iTargetColumnIndex].getId(),
          aTableColumns = oTargetRow.getTable().getColumns();
        iTargetColumnIndex = aTableColumns.findIndex(function (column) {
          if (column.getCreationTemplate()) {
            return sTargetCellId.search(column.getCreationTemplate().getId()) > -1 ? true : false;
          } else {
            return false;
          }
        });
      }
      return iTargetColumnIndex;
    };
    _proto._getMdcTableRows = function _getMdcTableRows(oMdcTable) {
      return oMdcTable.findElements(true, function (oElem) {
        return oElem.isA("sap.ui.table.Row") && /** We check the element belongs to the Mdc Table :*/
        oElem.getTable().getParent() === oMdcTable;
      });
    };
    _proto._getObjectPageLayout = function _getObjectPageLayout(oElement, oObjectPageLayout) {
      if (oObjectPageLayout) {
        return oObjectPageLayout;
      }
      oObjectPageLayout = oElement;
      //Iterate over parent till you have not reached the object page layout
      while (oObjectPageLayout && !oObjectPageLayout.isA("sap.uxap.ObjectPageLayout")) {
        oObjectPageLayout = oObjectPageLayout.getParent();
      }
      return oObjectPageLayout;
    }

    /**
     * The method that is called to check if a navigation is configured from the table to a sub object page.
     *
     * @private
     * @param table MdcTable
     * @returns Either true or false
     */;
    _proto._navigationConfigured = function _navigationConfigured(table) {
      // TODO: this logic would be moved to check the same at the template time to avoid the same check happening multiple times.
      const component = sap.ui.require("sap/ui/core/Component"),
        navObject = table && component.getOwnerComponentFor(table) && component.getOwnerComponentFor(table).getNavigation();
      let subOPConfigured = false,
        navConfigured = false;
      if (navObject && Object.keys(navObject).indexOf(table.getRowBinding().sPath) !== -1) {
        subOPConfigured = navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath] && navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath].detail && navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath].detail.route ? true : false;
      }
      navConfigured = subOPConfigured && (table === null || table === void 0 ? void 0 : table.getRowSettings().getRowActions()) && (table === null || table === void 0 ? void 0 : table.getRowSettings().getRowActions()[0].mProperties.type.indexOf("Navigation")) !== -1;
      return navConfigured;
    };
    _proto.setFocusToControl = function setFocusToControl(control) {
      const messagePopover = this.oMessagePopover;
      if (messagePopover && control && control.focus) {
        const fnFocus = () => {
          control.focus();
        };
        if (!messagePopover.isOpen()) {
          // when navigating to parent page to child page (on click of message), the child page might have a focus logic that might use a timeout.
          // we use the below timeouts to override this focus so that we focus on the target control of the message in the child page.
          setTimeout(fnFocus, 0);
        } else {
          const fnOnClose = () => {
            setTimeout(fnFocus, 0);
            messagePopover.detachEvent("afterClose", fnOnClose);
          };
          messagePopover.attachEvent("afterClose", fnOnClose);
          messagePopover.close();
        }
      } else {
        Log.warning("FE V4 : MessageButton : element doesn't have focus method for focusing.");
      }
    };
    return MessageButton;
  }(Button), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "customFilters", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "messageChange", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MessageButton;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlQnV0dG9uIiwiZGVmaW5lVUk1Q2xhc3MiLCJhZ2dyZWdhdGlvbiIsInR5cGUiLCJtdWx0aXBsZSIsInNpbmd1bGFyTmFtZSIsImV2ZW50IiwiaWQiLCJzZXR0aW5ncyIsInNHZW5lcmFsR3JvdXBUZXh0Iiwic1ZpZXdJZCIsInNMYXN0QWN0aW9uVGV4dCIsImluaXQiLCJCdXR0b24iLCJwcm90b3R5cGUiLCJhcHBseSIsImF0dGFjaFByZXNzIiwiaGFuZGxlTWVzc2FnZVBvcG92ZXJQcmVzcyIsIm9NZXNzYWdlUG9wb3ZlciIsIk1lc3NhZ2VQb3BvdmVyIiwib0l0ZW1CaW5kaW5nIiwiZ2V0QmluZGluZyIsImF0dGFjaENoYW5nZSIsIl9zZXRNZXNzYWdlRGF0YSIsIm1lc3NhZ2VCdXR0b25JZCIsImdldElkIiwiYWRkQ3VzdG9tRGF0YSIsInNhcCIsInVpIiwiY29yZSIsIkN1c3RvbURhdGEiLCJrZXkiLCJ2YWx1ZSIsImF0dGFjaE1vZGVsQ29udGV4dENoYW5nZSIsIl9hcHBseUZpbHRlcnNBbmRTb3J0IiwiYmluZCIsImF0dGFjaEFjdGl2ZVRpdGxlUHJlc3MiLCJfYWN0aXZlVGl0bGVQcmVzcyIsIm9FdmVudCIsInRvZ2dsZSIsImdldFNvdXJjZSIsIl9hcHBseUdyb3VwaW5nQXN5bmMiLCJvVmlldyIsImFXYWl0Rm9yRGF0YSIsIm9WaWV3QmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIl9maW5kVGFibGVzUmVsYXRlZFRvTWVzc2FnZXMiLCJ2aWV3Iiwib1JlcyIsImFNZXNzYWdlcyIsImdldENvbnRleHRzIiwibWFwIiwib0NvbnRleHQiLCJnZXRPYmplY3QiLCJvVmlld0NvbnRleHQiLCJvT2JqZWN0UGFnZSIsImdldENvbnRlbnQiLCJtZXNzYWdlSGFuZGxpbmciLCJnZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dCIsImZvckVhY2giLCJvU2VjdGlvbiIsImdldFN1YlNlY3Rpb25zIiwib1N1YlNlY3Rpb24iLCJmaW5kRWxlbWVudHMiLCJvRWxlbSIsImlzQSIsImkiLCJsZW5ndGgiLCJvUm93QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJzRWxlbWVCaW5kaW5nUGF0aCIsImdldFBhdGgiLCJ0YXJnZXQiLCJpbmRleE9mIiwicHVzaCIsInRhYmxlIiwic3Vic2VjdGlvbiIsIm9UYWJsZXMiLCJfb1RhYmxlIiwib01EQ1RhYmxlIiwib1N1YnNlY3Rpb24iLCJzZXRCaW5kaW5nQ29udGV4dCIsImlzTGVuZ3RoRmluYWwiLCJQcm9taXNlIiwicmVzb2x2ZSIsImF0dGFjaEV2ZW50T25jZSIsIndhaXRGb3JHcm91cGluZ0FwcGxpZWQiLCJzZXRUaW1lb3V0IiwiX2FwcGx5R3JvdXBpbmciLCJhbGwiLCJnZXRNb2RlbCIsImNoZWNrTWVzc2FnZXMiLCJlcnIiLCJMb2ciLCJlcnJvciIsIm9PYmplY3RQYWdlTGF5b3V0IiwiX2dldE9iamVjdFBhZ2VMYXlvdXQiLCJnZXRJdGVtcyIsIl9jaGVja0NvbnRyb2xJZEluU2VjdGlvbnMiLCJfZ2V0VGFibGVSZWZFcnJvckNvbnRleHQiLCJvVGFibGUiLCJvTW9kZWwiLCJnZXRQcm9wZXJ0eSIsInNldFByb3BlcnR5Iiwic1JlZkVycm9yQ29udGV4dFBhdGgiLCJyZXBsYWNlIiwiZ2V0Q29udGV4dCIsIl91cGRhdGVJbnRlcm5hbE1vZGVsIiwib1RhYmxlUm93Q29udGV4dCIsImlSb3dJbmRleCIsInNUYWJsZVRhcmdldENvbFByb3BlcnR5Iiwib01lc3NhZ2VPYmplY3QiLCJiSXNDcmVhdGlvblJvdyIsIm9UZW1wIiwicm93SW5kZXgiLCJ0YXJnZXRDb2xQcm9wZXJ0eSIsImFWYWxpZE1lc3NhZ2VJZHMiLCJnZXRDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJnZXRNZXNzYWdlTW9kZWwiLCJnZXREYXRhIiwibWVzc2FnZSIsImFPYnNvbGV0ZU1lc3NhZ2VsSWRzIiwiT2JqZWN0Iiwia2V5cyIsImZpbHRlciIsImludGVybmFsTWVzc2FnZUlkIiwib2Jzb2xldGVJZCIsImFzc2lnbiIsIl9zZXRHcm91cExhYmVsRm9yVHJhbnNpZW50TXNnIiwic0FjdGlvbk5hbWUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZ2V0VGV4dCIsInNldEdyb3VwTmFtZSIsIl9jb21wdXRlTWVzc2FnZUdyb3VwQW5kU3ViVGl0bGUiLCJzZWN0aW9uIiwic3ViU2VjdGlvbiIsImFFbGVtZW50cyIsImJNdWx0aXBsZVN1YlNlY3Rpb25zIiwicmVzb3VyY2VNb2RlbCIsImdldFJlc291cmNlTW9kZWwiLCJkZXRhY2hDaGFuZ2UiLCJzZXRTZWN0aW9uTmFtZUluR3JvdXAiLCJvRWxlbWVudCIsIm9UYXJnZXRUYWJsZUluZm8iLCJsIiwib1RhcmdldGVkQ29udHJvbCIsImJJc0JhY2tlbmRNZXNzYWdlIiwiUmVnRXhwIiwidGVzdCIsImdldFRhcmdldHMiLCJnZXRQYXJlbnQiLCJmbkNhbGxiYWNrU2V0R3JvdXBOYW1lIiwib01lc3NhZ2VPYmoiLCJhY3Rpb25OYW1lIiwib2JqIiwiZ2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZSIsInN1YlRpdGxlIiwic2V0U3VidGl0bGUiLCJzZXRBY3RpdmVUaXRsZSIsIl9mb3JtYXRNZXNzYWdlRGVzY3JpcHRpb24iLCJzVGFibGVUYXJnZXRDb2xOYW1lIiwiZ2V0SW5kZXgiLCJiSXNUYXJnZXRlZENvbnRyb2xPcnBoYW4iLCJiSXNPcnBoYW5FbGVtZW50IiwiX2dldE1kY1RhYmxlIiwidGFibGVIZWFkZXIiLCJnZXRIZWFkZXIiLCJpVGFyZ2V0Q29sdW1uSW5kZXgiLCJfZ2V0VGFibGVDb2x1bW5JbmRleCIsImdldENvbHVtbnMiLCJnZXREYXRhUHJvcGVydHkiLCJ1bmRlZmluZWQiLCJfZ2V0VGFibGVSb3ciLCJfZ2V0VGFibGVSb3dJbmRleCIsIm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyIsImdldEN1cnJlbnRDb250ZXh0cyIsInNNZXNzYWdlU3VidGl0bGUiLCJnZXRNZXNzYWdlU3VidGl0bGUiLCJnZXRWYWx1ZVN0YXRlIiwic2VjdGlvbkJhc2VkR3JvdXBOYW1lIiwiY3JlYXRlU2VjdGlvbkdyb3VwTmFtZSIsIl9nZXRWaWV3SWQiLCJieUlkIiwib01lc3NhZ2VUYXJnZXRQcm9wZXJ0eSIsInNwbGl0IiwicG9wIiwib1VJTW9kZWwiLCJmaXJlQWN0aXZlVGl0bGVQcmVzcyIsIml0ZW0iLCJhU3ViU2VjdGlvbnMiLCJqIiwiayIsImFWaXNpYmxlU2VjdGlvbnMiLCJ2aWV3SWQiLCJiSXNHZW5lcmFsR3JvdXBOYW1lIiwiYUNvbnRyb2xzIiwiZ2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb24iLCJwZXJzaXN0ZW50IiwiX2ZpbmRUYXJnZXRGb3JNZXNzYWdlIiwibWVzc2FnZU9iamVjdCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJjb250ZXh0UGF0aCIsImdldE1ldGFQYXRoIiwib0NvbnRleHRQYXRoTWV0YWRhdGEiLCIka2luZCIsIl9mbkVuYWJsZUJpbmRpbmdzIiwiYVNlY3Rpb25zIiwiVXJpUGFyYW1ldGVycyIsImZyb21RdWVyeSIsIndpbmRvdyIsImxvY2F0aW9uIiwic2VhcmNoIiwiZ2V0IiwiaVNlY3Rpb24iLCJub25UYWJsZUNoYXJ0Y29udHJvbEZvdW5kIiwiaVN1YlNlY3Rpb24iLCJvQWxsQmxvY2tzIiwiZ2V0QmxvY2tzIiwiYmxvY2siLCJfZmluZE1lc3NhZ2VHcm91cEFmdGVyUmViaW5kaW5nIiwiYXR0YWNoRGF0YVJlY2VpdmVkIiwic0NvbnRyb2xJZCIsIm9Db250cm9sIiwiVmlldyIsIl9zZXRMb25ndGV4dFVybERlc2NyaXB0aW9uIiwic01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQiLCJvRGlhZ25vc2lzVGl0bGUiLCJzZXRBc3luY0Rlc2NyaXB0aW9uSGFuZGxlciIsImNvbmZpZyIsInNPbGREZXNjcmlwdGlvbiIsInNMb25nVGV4dFVybCIsImdldExvbmd0ZXh0VXJsIiwialF1ZXJ5IiwiYWpheCIsInVybCIsInN1Y2Nlc3MiLCJkYXRhIiwic0RpYWdub3Npc1RleHQiLCJnZXRIdG1sVGV4dCIsInNldERlc2NyaXB0aW9uIiwicHJvbWlzZSIsInNFcnJvciIsInJlamVjdCIsInNUYWJsZUZpcnN0Q29sUHJvcGVydHkiLCJnZXRJZGVudGlmaWVyQ29sdW1uIiwic0NvbHVtbkluZm8iLCJvTXNnT2JqIiwib0NvbEZyb21UYWJsZVNldHRpbmdzIiwiZmV0Y2hDb2x1bW5JbmZvIiwiYXZhaWxhYmlsaXR5IiwiZ2V0VHlwZSIsImdldFZhbHVlIiwiX25hdmlnYXRpb25Db25maWd1cmVkIiwibGFiZWwiLCJvRmllbGRzQWZmZWN0ZWRUaXRsZSIsIkZvcm1hdHRlZFRleHQiLCJodG1sVGV4dCIsInNGaWVsZEFmZmVjdGVkVGV4dCIsInNVSU1lc3NhZ2VEZXNjcmlwdGlvbiIsImRlc2NyaXB0aW9uIiwiY2xlYXJUaW1lb3V0IiwiX3NldE1lc3NhZ2VEYXRhVGltZW91dCIsInNJY29uIiwib01lc3NhZ2VzIiwib01lc3NhZ2VDb3VudCIsIkVycm9yIiwiV2FybmluZyIsIlN1Y2Nlc3MiLCJJbmZvcm1hdGlvbiIsIm9SZXNvdXJjZUJ1bmRsZSIsImlNZXNzYWdlTGVuZ3RoIiwic0J1dHRvblR5cGUiLCJCdXR0b25UeXBlIiwiRGVmYXVsdCIsInNNZXNzYWdlS2V5Iiwic1Rvb2x0aXBUZXh0Iiwic01lc3NhZ2VUZXh0IiwiTWVzc2FnZVR5cGUiLCJOZWdhdGl2ZSIsIkNyaXRpY2FsIiwiTmV1dHJhbCIsInRvdGFsTnVtYmVyT2ZNZXNzYWdlcyIsInNldFRleHQiLCJ0b1N0cmluZyIsInNldFRvb2x0aXAiLCJzZXRJY29uIiwic2V0VHlwZSIsInNldFZpc2libGUiLCJvUGFnZVJlYWR5IiwiZ2V0Q29udHJvbGxlciIsInBhZ2VSZWFkeSIsIndhaXRQYWdlUmVhZHkiLCJmaXJlTWVzc2FnZUNoYW5nZSIsIm5hdmlnYXRlQmFjayIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsIm9JdGVtIiwiZ2V0UGFyYW1ldGVyIiwib01lc3NhZ2UiLCJnZXRUYXJnZXQiLCJzU2VjdGlvblRpdGxlIiwiX2RlZmF1bHRGb2N1cyIsIm1kY1RhYmxlIiwiZm9jdXNJbmZvIiwicHJldmVudFNjcm9sbCIsInRhcmdldEluZm8iLCJmb2N1cyIsImdldEdyb3VwTmFtZSIsIm9UYXJnZXRNZGNUYWJsZSIsImNvbnRyb2xJZHMiLCJjb250cm9sIiwib1BhcmVudENvbnRyb2wiLCJyZWR1Y2UiLCJhY2MiLCJ2YWwiLCJfbmF2aWdhdGVGcm9tTWVzc2FnZVRvU2VjdGlvblRhYmxlSW5JY29uVGFiQmFyTW9kZSIsIm9SZWZFcnJvckNvbnRleHQiLCJvUmVmRXJyb3IiLCJfc2V0Rm9jdXNPblRhcmdldEZpZWxkIiwidGFyZ2V0TWRjVGFibGUiLCJhVGFyZ2V0TWRjVGFibGVSb3ciLCJfZ2V0TWRjVGFibGVSb3dzIiwiaUZpcnN0VmlzaWJsZVJvdyIsIl9nZXRHcmlkVGFibGUiLCJnZXRGaXJzdFZpc2libGVSb3ciLCJvVGFyZ2V0Um93Iiwib1RhcmdldENlbGwiLCJnZXRUYXJnZXRDZWxsIiwic2V0Rm9jdXNUb0NvbnRyb2wiLCJlcnJvclByb3BlcnR5IiwiX3JvdXRpbmciLCJuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQiLCJzY3JvbGxUb0luZGV4IiwiaU5ld0ZpcnN0VmlzaWJsZVJvdyIsImJTY3JvbGxOZWVkZWQiLCJvV2FpdENvbnRyb2xJZEFkZGVkIiwiYXR0YWNoRXZlbnQiLCJmb2N1c09uVGFyZ2V0RmllbGQiLCJmb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2wiLCJvU2VsZWN0ZWRTZWN0aW9uIiwiZ2V0U2VsZWN0ZWRTZWN0aW9uIiwiX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25Jbkljb25UYWJCYXJNb2RlIiwidGFyZ2V0Um93IiwiZ2V0Q29udHJvbElkcyIsImNvbnRyb2xJZCIsImlzQ29udHJvbEluVGFibGUiLCJlbGVtIiwiYUFsbFZpZXdFbGVtZW50cyIsImFFcnJvbmVvdXNDb250cm9scyIsInNvbWUiLCJnZXREb21SZWYiLCJhTm90VGFibGVFcnJvbmVvdXNDb250cm9scyIsIkNvbHVtbkxpc3RJdGVtIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwib1RhcmdldEZpZWxkIiwiZ2V0Q29udGVudEVkaXQiLCJfZ2V0TWVzc2FnZVJhbmsiLCJhQWxsRWxlbWVudHMiLCJzZWN0aW9uUmFuayIsIl9mbkZpbHRlclVwb25JZCIsImdldENvbnRyb2xJZCIsImdldFZpc2libGUiLCJoYXNPd25Qcm9wZXJ0eSIsInNlY3Rpb25OYW1lIiwiZ2V0VGl0bGUiLCJzdWJTZWN0aW9uTmFtZSIsIm9WYWxpZGF0aW9uRmlsdGVycyIsIm9WYWxpZGF0aW9uQW5kQ29udGV4dEZpbHRlciIsIm9GaWx0ZXJzIiwic1BhdGgiLCJvU29ydGVyIiwib0RpYWxvZ0ZpbHRlciIsIm9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucyIsImFVc2VyRGVmaW5lZEZpbHRlciIsImZpbHRlck91dE1lc3NhZ2VzSW5EaWFsb2ciLCJmblRlc3QiLCJhQ29udHJvbElkcyIsImluZGV4IiwiSW5maW5pdHkiLCJlcnJvckZpZWxkQ29udHJvbCIsImZpZWxkUmFua2luRGlhbG9nIiwiRGlhbG9nIiwiRmlsdGVyIiwicGF0aCIsImNhc2VTZW5zaXRpdmUiLCJnZXRDaGVja0NvbnRyb2xJblZpZXdGaWx0ZXIiLCJhQ3VzdG9tRmlsdGVycyIsImdldEFnZ3JlZ2F0aW9uIiwib3BlcmF0b3IiLCJ2YWx1ZTEiLCJ2YWx1ZTIiLCJvQmluZGluZ0NvbnRleHQiLCJmaWx0ZXJzIiwiRmlsdGVyT3BlcmF0b3IiLCJFUSIsImFuZCIsIlN0YXJ0c1dpdGgiLCJvVmFsaWRhdGlvbkNvbnRleHREaWFsb2dGaWx0ZXJzIiwiU29ydGVyIiwib2JqMSIsIm9iajIiLCJnZXRTZWN0aW9ucyIsInJhbmtBIiwicmFua0IiLCJzb3J0IiwiX2dldFNlY3Rpb25CeVNlY3Rpb25UaXRsZSIsImJVc2VJY29uVGFiQmFyIiwiZ2V0VXNlSWNvblRhYkJhciIsInNTZWxlY3RlZFNlY3Rpb25JZCIsInNldFNlbGVjdGVkU2VjdGlvbiIsIm9UYWJsZUNvbnRleHQiLCJvT1BDb250ZXh0IiwiYlNob3VsZFdhaXRGb3JUYWJsZVJlZnJlc2giLCJvUGFyZW50RWxlbWVudCIsIm9NZGNUYWJsZSIsIm9UYWJsZVJvdyIsImdldFRhYmxlIiwiZmluZEluZGV4IiwiZWxlbWVudCIsImdldFRhcmdldENlbGxJbmRleCIsImdldENlbGxzIiwib0NlbGwiLCJnZXRUYXJnZXRDb2x1bW5JbmRleCIsIm9UYXJnZXRFbGVtZW50IiwiaVRhcmdldENlbGxJbmRleCIsInNUYXJnZXRDZWxsSWQiLCJhVGFibGVDb2x1bW5zIiwiY29sdW1uIiwiZ2V0Q3JlYXRpb25UZW1wbGF0ZSIsImNvbXBvbmVudCIsInJlcXVpcmUiLCJuYXZPYmplY3QiLCJnZXRPd25lckNvbXBvbmVudEZvciIsImdldE5hdmlnYXRpb24iLCJzdWJPUENvbmZpZ3VyZWQiLCJuYXZDb25maWd1cmVkIiwiZGV0YWlsIiwicm91dGUiLCJnZXRSb3dTZXR0aW5ncyIsImdldFJvd0FjdGlvbnMiLCJtUHJvcGVydGllcyIsIm1lc3NhZ2VQb3BvdmVyIiwiZm5Gb2N1cyIsImlzT3BlbiIsImZuT25DbG9zZSIsImRldGFjaEV2ZW50IiwiY2xvc2UiLCJ3YXJuaW5nIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNZXNzYWdlQnV0dG9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IFVyaVBhcmFtZXRlcnMgZnJvbSBcInNhcC9iYXNlL3V0aWwvVXJpUGFyYW1ldGVyc1wiO1xuaW1wb3J0IHsgRkVWaWV3IH0gZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9tZXNzYWdlSGFuZGxlci9tZXNzYWdlSGFuZGxpbmdcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcywgZXZlbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VGaWx0ZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvbWVzc2FnZXMvTWVzc2FnZUZpbHRlclwiO1xuaW1wb3J0IE1lc3NhZ2VQb3BvdmVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL21lc3NhZ2VzL01lc3NhZ2VQb3BvdmVyXCI7XG5pbXBvcnQgeyAkQnV0dG9uU2V0dGluZ3MsIGRlZmF1bHQgYXMgQnV0dG9uIH0gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IENvbHVtbkxpc3RJdGVtIGZyb20gXCJzYXAvbS9Db2x1bW5MaXN0SXRlbVwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgRm9ybWF0dGVkVGV4dCBmcm9tIFwic2FwL20vRm9ybWF0dGVkVGV4dFwiO1xuaW1wb3J0IHsgQnV0dG9uVHlwZSB9IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZUl0ZW0gZnJvbSBcInNhcC9tL01lc3NhZ2VJdGVtXCI7XG5pbXBvcnQgdHlwZSBDb3JlRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIFVJNUVsZW1lbnQgZnJvbSBcInNhcC91aS9jb3JlL0VsZW1lbnRcIjtcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgU29ydGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvU29ydGVyXCI7XG5pbXBvcnQgQ29sdW1uIGZyb20gXCJzYXAvdWkvdGFibGUvQ29sdW1uXCI7XG5pbXBvcnQgT2JqZWN0UGFnZVNlY3Rpb24gZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VTZWN0aW9uXCI7XG5pbXBvcnQgT2JqZWN0UGFnZVN1YlNlY3Rpb24gZnJvbSBcInNhcC91eGFwL09iamVjdFBhZ2VTdWJTZWN0aW9uXCI7XG5cbnR5cGUgTWVzc2FnZUNvdW50ID0ge1xuXHRFcnJvcjogbnVtYmVyO1xuXHRXYXJuaW5nOiBudW1iZXI7XG5cdFN1Y2Nlc3M6IG51bWJlcjtcblx0SW5mb3JtYXRpb246IG51bWJlcjtcbn07XG5cbnR5cGUgQ29sdW1uRGF0YVdpdGhBdmFpbGFiaWxpdHlUeXBlID0gQ29sdW1uICYge1xuXHRhdmFpbGFiaWxpdHk/OiBzdHJpbmc7XG5cdGxhYmVsPzogc3RyaW5nO1xufTtcblxudHlwZSAkTWVzc2FnZUJ1dHRvblNldHRpbmdzID0gJEJ1dHRvblNldHRpbmdzICYge1xuXHRtZXNzYWdlQ2hhbmdlOiBGdW5jdGlvbjtcbn07XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MubWVzc2FnZXMuTWVzc2FnZUJ1dHRvblwiKVxuY2xhc3MgTWVzc2FnZUJ1dHRvbiBleHRlbmRzIEJ1dHRvbiB7XG5cdGNvbnN0cnVjdG9yKGlkPzogc3RyaW5nIHwgJE1lc3NhZ2VCdXR0b25TZXR0aW5ncywgc2V0dGluZ3M/OiAkTWVzc2FnZUJ1dHRvblNldHRpbmdzKSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRzdXBlcihpZCwgc2V0dGluZ3MpO1xuXHR9XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUubWFjcm9zLm1lc3NhZ2VzLk1lc3NhZ2VGaWx0ZXJcIiwgbXVsdGlwbGU6IHRydWUsIHNpbmd1bGFyTmFtZTogXCJjdXN0b21GaWx0ZXJcIiB9KVxuXHRjdXN0b21GaWx0ZXJzITogTWVzc2FnZUZpbHRlcjtcblxuXHRAZXZlbnQoKVxuXHRtZXNzYWdlQ2hhbmdlITogRnVuY3Rpb247XG5cblx0cHJpdmF0ZSBvTWVzc2FnZVBvcG92ZXI6IGFueTtcblxuXHRwcml2YXRlIG9JdGVtQmluZGluZzogYW55O1xuXG5cdHByaXZhdGUgb09iamVjdFBhZ2VMYXlvdXQ6IGFueTtcblxuXHRwcml2YXRlIHNHZW5lcmFsR3JvdXBUZXh0ID0gXCJcIjtcblxuXHRwcml2YXRlIF9zZXRNZXNzYWdlRGF0YVRpbWVvdXQ6IGFueTtcblxuXHRwcml2YXRlIHNWaWV3SWQgPSBcIlwiO1xuXG5cdHByaXZhdGUgc0xhc3RBY3Rpb25UZXh0ID0gXCJcIjtcblxuXHRpbml0KCkge1xuXHRcdEJ1dHRvbi5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzKTtcblx0XHQvL3ByZXNzIGV2ZW50IGhhbmRsZXIgYXR0YWNoZWQgdG8gb3BlbiB0aGUgbWVzc2FnZSBwb3BvdmVyXG5cdFx0dGhpcy5hdHRhY2hQcmVzcyh0aGlzLmhhbmRsZU1lc3NhZ2VQb3BvdmVyUHJlc3MsIHRoaXMpO1xuXHRcdHRoaXMub01lc3NhZ2VQb3BvdmVyID0gbmV3IE1lc3NhZ2VQb3BvdmVyKCk7XG5cdFx0dGhpcy5vSXRlbUJpbmRpbmcgPSB0aGlzLm9NZXNzYWdlUG9wb3Zlci5nZXRCaW5kaW5nKFwiaXRlbXNcIik7XG5cdFx0dGhpcy5vSXRlbUJpbmRpbmcuYXR0YWNoQ2hhbmdlKHRoaXMuX3NldE1lc3NhZ2VEYXRhLCB0aGlzKTtcblx0XHRjb25zdCBtZXNzYWdlQnV0dG9uSWQgPSB0aGlzLmdldElkKCk7XG5cdFx0aWYgKG1lc3NhZ2VCdXR0b25JZCkge1xuXHRcdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIuYWRkQ3VzdG9tRGF0YShuZXcgKHNhcCBhcyBhbnkpLnVpLmNvcmUuQ3VzdG9tRGF0YSh7IGtleTogXCJtZXNzYWdlQnV0dG9uSWRcIiwgdmFsdWU6IG1lc3NhZ2VCdXR0b25JZCB9KSk7IC8vIFRPRE8gY2hlY2sgZm9yIGN1c3RvbSBkYXRhIHR5cGVcblx0XHR9XG5cdFx0dGhpcy5hdHRhY2hNb2RlbENvbnRleHRDaGFuZ2UodGhpcy5fYXBwbHlGaWx0ZXJzQW5kU29ydC5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLm9NZXNzYWdlUG9wb3Zlci5hdHRhY2hBY3RpdmVUaXRsZVByZXNzKHRoaXMuX2FjdGl2ZVRpdGxlUHJlc3MuYmluZCh0aGlzKSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB3aGVuIGEgdXNlciBjbGlja3Mgb24gdGhlIE1lc3NhZ2VCdXR0b24gY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIG9FdmVudCBFdmVudCBvYmplY3Rcblx0ICovXG5cdGhhbmRsZU1lc3NhZ2VQb3BvdmVyUHJlc3Mob0V2ZW50OiBDb3JlRXZlbnQpIHtcblx0XHR0aGlzLm9NZXNzYWdlUG9wb3Zlci50b2dnbGUob0V2ZW50LmdldFNvdXJjZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgZ3JvdXBzIHRoZSBtZXNzYWdlcyBiYXNlZCBvbiB0aGUgc2VjdGlvbiBvciBzdWJzZWN0aW9uIHRoZXkgYmVsb25nIHRvLlxuXHQgKiBUaGlzIG1ldGhvZCBmb3JjZSB0aGUgbG9hZGluZyBvZiBjb250ZXh0cyBmb3IgYWxsIHRhYmxlcyBiZWZvcmUgdG8gYXBwbHkgdGhlIGdyb3VwaW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1ZpZXcgQ3VycmVudCB2aWV3LlxuXHQgKiBAcmV0dXJucyBSZXR1cm4gcHJvbWlzZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFzeW5jIF9hcHBseUdyb3VwaW5nQXN5bmMob1ZpZXc6IEZFVmlldykge1xuXHRcdGNvbnN0IGFXYWl0Rm9yRGF0YTogUHJvbWlzZTx2b2lkPltdID0gW107XG5cdFx0Y29uc3Qgb1ZpZXdCaW5kaW5nQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3QgX2ZpbmRUYWJsZXNSZWxhdGVkVG9NZXNzYWdlcyA9ICh2aWV3OiBWaWV3KSA9PiB7XG5cdFx0XHRjb25zdCBvUmVzOiBhbnlbXSA9IFtdO1xuXHRcdFx0Y29uc3QgYU1lc3NhZ2VzID0gdGhpcy5vSXRlbUJpbmRpbmcuZ2V0Q29udGV4dHMoKS5tYXAoZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Db250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBvVmlld0NvbnRleHQgPSB2aWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRpZiAob1ZpZXdDb250ZXh0KSB7XG5cdFx0XHRcdGNvbnN0IG9PYmplY3RQYWdlOiBDb250cm9sID0gdmlldy5nZXRDb250ZW50KClbMF07XG5cdFx0XHRcdG1lc3NhZ2VIYW5kbGluZy5nZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dChvT2JqZWN0UGFnZSkuZm9yRWFjaChmdW5jdGlvbiAob1NlY3Rpb246IGFueSkge1xuXHRcdFx0XHRcdG9TZWN0aW9uLmdldFN1YlNlY3Rpb25zKCkuZm9yRWFjaChmdW5jdGlvbiAob1N1YlNlY3Rpb246IGFueSkge1xuXHRcdFx0XHRcdFx0b1N1YlNlY3Rpb24uZmluZEVsZW1lbnRzKHRydWUpLmZvckVhY2goZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKG9FbGVtLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFNZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSBvRWxlbS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob1Jvd0JpbmRpbmcpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc0VsZW1lQmluZGluZ1BhdGggPSBgJHtvVmlld0NvbnRleHQuZ2V0UGF0aCgpfS8ke29FbGVtLmdldFJvd0JpbmRpbmcoKS5nZXRQYXRoKCl9YDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGFNZXNzYWdlc1tpXS50YXJnZXQuaW5kZXhPZihzRWxlbWVCaW5kaW5nUGF0aCkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUmVzLnB1c2goeyB0YWJsZTogb0VsZW0sIHN1YnNlY3Rpb246IG9TdWJTZWN0aW9uIH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb1Jlcztcblx0XHR9O1xuXHRcdC8vIFNlYXJjaCBmb3IgdGFibGUgcmVsYXRlZCB0byBNZXNzYWdlcyBhbmQgaW5pdGlhbGl6ZSB0aGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBwYXJlbnQgc3Vic2VjdGlvbiB0byByZXRyaWV2ZSB0aGUgZGF0YVxuXHRcdGNvbnN0IG9UYWJsZXMgPSBfZmluZFRhYmxlc1JlbGF0ZWRUb01lc3NhZ2VzLmJpbmQodGhpcykob1ZpZXcpO1xuXHRcdG9UYWJsZXMuZm9yRWFjaChmdW5jdGlvbiAoX29UYWJsZSkge1xuXHRcdFx0Y29uc3Qgb01EQ1RhYmxlID0gX29UYWJsZS50YWJsZSxcblx0XHRcdFx0b1N1YnNlY3Rpb24gPSBfb1RhYmxlLnN1YnNlY3Rpb247XG5cdFx0XHRpZiAoIW9NRENUYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpIHx8IG9NRENUYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCkgIT09IG9WaWV3QmluZGluZ0NvbnRleHQ/LmdldFBhdGgoKSkge1xuXHRcdFx0XHRvU3Vic2VjdGlvbi5zZXRCaW5kaW5nQ29udGV4dChvVmlld0JpbmRpbmdDb250ZXh0KTtcblx0XHRcdFx0aWYgKCFvTURDVGFibGUuZ2V0Um93QmluZGluZygpLmlzTGVuZ3RoRmluYWwoKSkge1xuXHRcdFx0XHRcdGFXYWl0Rm9yRGF0YS5wdXNoKFxuXHRcdFx0XHRcdFx0bmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6IEZ1bmN0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdG9NRENUYWJsZS5nZXRSb3dCaW5kaW5nKCkuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlY2VpdmVkXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0Y29uc3Qgd2FpdEZvckdyb3VwaW5nQXBwbGllZCA9IG5ldyBQcm9taXNlKChyZXNvbHZlOiBGdW5jdGlvbikgPT4ge1xuXHRcdFx0c2V0VGltZW91dChhc3luYyAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuX2FwcGx5R3JvdXBpbmcoKTtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fSwgMCk7XG5cdFx0fSk7XG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IFByb21pc2UuYWxsKGFXYWl0Rm9yRGF0YSk7XG5cdFx0XHRvVmlldy5nZXRNb2RlbCgpLmNoZWNrTWVzc2FnZXMoKTtcblx0XHRcdGF3YWl0IHdhaXRGb3JHcm91cGluZ0FwcGxpZWQ7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBncm91cGluZyB0aGUgbWVzc2FnZXMgaW4gdGhlIG1lc3NhZ2VQb3BPdmVyXCIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgZ3JvdXBzIHRoZSBtZXNzYWdlcyBiYXNlZCBvbiB0aGUgc2VjdGlvbiBvciBzdWJzZWN0aW9uIHRoZXkgYmVsb25nIHRvLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2FwcGx5R3JvdXBpbmcoKSB7XG5cdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXQodGhpcywgdGhpcy5vT2JqZWN0UGFnZUxheW91dCk7XG5cdFx0aWYgKCF0aGlzLm9PYmplY3RQYWdlTGF5b3V0KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IGFNZXNzYWdlcyA9IHRoaXMub01lc3NhZ2VQb3BvdmVyLmdldEl0ZW1zKCk7XG5cdFx0dGhpcy5fY2hlY2tDb250cm9sSWRJblNlY3Rpb25zKGFNZXNzYWdlcyk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCByZXRyaWV2ZXMgdGhlIGJpbmRpbmcgY29udGV4dCBmb3IgdGhlIHJlZkVycm9yIG9iamVjdC5cblx0ICogVGhlIHJlZkVycm9yIGNvbnRhaW5zIGEgbWFwIHRvIHN0b3JlIHRoZSBpbmRleGVzIG9mIHRoZSByb3dzIHdpdGggZXJyb3JzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlIFRoZSB0YWJsZSBmb3Igd2hpY2ggd2Ugd2FudCB0byBnZXQgdGhlIHJlZkVycm9yIE9iamVjdC5cblx0ICogQHJldHVybnMgQ29udGV4dCBvZiB0aGUgcmVmRXJyb3IuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0VGFibGVSZWZFcnJvckNvbnRleHQob1RhYmxlOiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBvVGFibGUuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKTtcblx0XHQvL2luaXRpYWxpemUgdGhlIHJlZkVycm9yIHByb3BlcnR5IGlmIGl0IGRvZXNuJ3QgZXhpc3Rcblx0XHRpZiAoIW9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpLmdldFByb3BlcnR5KFwicmVmRXJyb3JcIikpIHtcblx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShcInJlZkVycm9yXCIsIHt9LCBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSk7XG5cdFx0fVxuXHRcdGNvbnN0IHNSZWZFcnJvckNvbnRleHRQYXRoID1cblx0XHRcdG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpLmdldFBhdGgoKSArXG5cdFx0XHRcIi9yZWZFcnJvci9cIiArXG5cdFx0XHRvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRQYXRoKCkucmVwbGFjZShcIi9cIiwgXCIkXCIpICtcblx0XHRcdFwiJFwiICtcblx0XHRcdG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0UGF0aCgpLnJlcGxhY2UoXCIvXCIsIFwiJFwiKTtcblx0XHRjb25zdCBvQ29udGV4dCA9IG9Nb2RlbC5nZXRDb250ZXh0KHNSZWZFcnJvckNvbnRleHRQYXRoKTtcblx0XHRpZiAoIW9Db250ZXh0LmdldFByb3BlcnR5KFwiXCIpKSB7XG5cdFx0XHRvTW9kZWwuc2V0UHJvcGVydHkoXCJcIiwge30sIG9Db250ZXh0KTtcblx0XHR9XG5cdFx0cmV0dXJuIG9Db250ZXh0O1xuXHR9XG5cblx0X3VwZGF0ZUludGVybmFsTW9kZWwoXG5cdFx0b1RhYmxlUm93Q29udGV4dDogYW55LFxuXHRcdGlSb3dJbmRleDogbnVtYmVyLFxuXHRcdHNUYWJsZVRhcmdldENvbFByb3BlcnR5OiBzdHJpbmcsXG5cdFx0b1RhYmxlOiBhbnksXG5cdFx0b01lc3NhZ2VPYmplY3Q6IGFueSxcblx0XHRiSXNDcmVhdGlvblJvdz86IGJvb2xlYW5cblx0KSB7XG5cdFx0bGV0IG9UZW1wO1xuXHRcdGlmIChiSXNDcmVhdGlvblJvdykge1xuXHRcdFx0b1RlbXAgPSB7XG5cdFx0XHRcdHJvd0luZGV4OiBcIkNyZWF0aW9uUm93XCIsXG5cdFx0XHRcdHRhcmdldENvbFByb3BlcnR5OiBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA/IHNUYWJsZVRhcmdldENvbFByb3BlcnR5IDogXCJcIlxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1RlbXAgPSB7XG5cdFx0XHRcdHJvd0luZGV4OiBvVGFibGVSb3dDb250ZXh0ID8gaVJvd0luZGV4IDogXCJcIixcblx0XHRcdFx0dGFyZ2V0Q29sUHJvcGVydHk6IHNUYWJsZVRhcmdldENvbFByb3BlcnR5ID8gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgOiBcIlwiXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRjb25zdCBvTW9kZWwgPSBvVGFibGUuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSxcblx0XHRcdG9Db250ZXh0ID0gdGhpcy5fZ2V0VGFibGVSZWZFcnJvckNvbnRleHQob1RhYmxlKTtcblx0XHQvL3dlIGZpcnN0IHJlbW92ZSB0aGUgZW50cmllcyB3aXRoIG9ic29sZXRlIG1lc3NhZ2UgaWRzIGZyb20gdGhlIGludGVybmFsIG1vZGVsIGJlZm9yZSBpbnNlcnRpbmcgdGhlIG5ldyBlcnJvciBpbmZvIDpcblx0XHRjb25zdCBhVmFsaWRNZXNzYWdlSWRzID0gc2FwLnVpXG5cdFx0XHQuZ2V0Q29yZSgpXG5cdFx0XHQuZ2V0TWVzc2FnZU1hbmFnZXIoKVxuXHRcdFx0LmdldE1lc3NhZ2VNb2RlbCgpXG5cdFx0XHQuZ2V0RGF0YSgpXG5cdFx0XHQubWFwKGZ1bmN0aW9uIChtZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG1lc3NhZ2UuaWQ7XG5cdFx0XHR9KTtcblx0XHRsZXQgYU9ic29sZXRlTWVzc2FnZWxJZHM7XG5cdFx0aWYgKG9Db250ZXh0LmdldFByb3BlcnR5KCkpIHtcblx0XHRcdGFPYnNvbGV0ZU1lc3NhZ2VsSWRzID0gT2JqZWN0LmtleXMob0NvbnRleHQuZ2V0UHJvcGVydHkoKSkuZmlsdGVyKGZ1bmN0aW9uIChpbnRlcm5hbE1lc3NhZ2VJZCkge1xuXHRcdFx0XHRyZXR1cm4gYVZhbGlkTWVzc2FnZUlkcy5pbmRleE9mKGludGVybmFsTWVzc2FnZUlkKSA9PT0gLTE7XG5cdFx0XHR9KTtcblx0XHRcdGFPYnNvbGV0ZU1lc3NhZ2VsSWRzLmZvckVhY2goZnVuY3Rpb24gKG9ic29sZXRlSWQpIHtcblx0XHRcdFx0ZGVsZXRlIG9Db250ZXh0LmdldFByb3BlcnR5KClbb2Jzb2xldGVJZF07XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0b01vZGVsLnNldFByb3BlcnR5KFxuXHRcdFx0b01lc3NhZ2VPYmplY3QuZ2V0SWQoKSxcblx0XHRcdE9iamVjdC5hc3NpZ24oe30sIG9Db250ZXh0LmdldFByb3BlcnR5KG9NZXNzYWdlT2JqZWN0LmdldElkKCkpID8gb0NvbnRleHQuZ2V0UHJvcGVydHkob01lc3NhZ2VPYmplY3QuZ2V0SWQoKSkgOiB7fSwgb1RlbXApLFxuXHRcdFx0b0NvbnRleHRcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBzZXRzIGdyb3VwcyBmb3IgdHJhbnNpZW50IG1lc3NhZ2VzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gbWVzc2FnZSBUaGUgdHJhbnNpZW50IG1lc3NhZ2UgZm9yIHdoaWNoIHdlIHdhbnQgdG8gY29tcHV0ZSBhbmQgc2V0IGdyb3VwLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc0FjdGlvbk5hbWUgVGhlIGFjdGlvbiBuYW1lLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NldEdyb3VwTGFiZWxGb3JUcmFuc2llbnRNc2cobWVzc2FnZTogYW55LCBzQWN0aW9uTmFtZTogc3RyaW5nKSB7XG5cdFx0dGhpcy5zTGFzdEFjdGlvblRleHQgPSB0aGlzLnNMYXN0QWN0aW9uVGV4dFxuXHRcdFx0PyB0aGlzLnNMYXN0QWN0aW9uVGV4dFxuXHRcdFx0OiBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJUX01FU1NBR0VfQlVUVE9OX1NBUEZFX01FU1NBR0VfR1JPVVBfTEFTVF9BQ1RJT05cIik7XG5cblx0XHRtZXNzYWdlLnNldEdyb3VwTmFtZShgJHt0aGlzLnNMYXN0QWN0aW9uVGV4dH06ICR7c0FjdGlvbk5hbWV9YCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGdyb3VwcyBtZXNzYWdlcyBhbmQgYWRkcyB0aGUgc3VidGl0bGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBtZXNzYWdlIFRoZSBtZXNzYWdlIHdlIHVzZSB0byBjb21wdXRlIHRoZSBncm91cCBhbmQgc3VidGl0bGUuXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBzZWN0aW9uIFRoZSBzZWN0aW9uIGNvbnRhaW5pbmcgdGhlIGNvbnRyb2xzLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gc3ViU2VjdGlvbiBUaGUgc3Vic2VjdGlvbiBjb250YWluaW5nIHRoZSBjb250cm9scy5cblx0ICogQHBhcmFtIHtvYmplY3R9IGFFbGVtZW50cyBMaXN0IG9mIGNvbnRyb2xzIGZyb20gYSBzdWJzZWN0aW9uIHJlbGF0ZWQgdG8gYSBtZXNzYWdlLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGJNdWx0aXBsZVN1YlNlY3Rpb25zIFRydWUgaWYgdGhlcmUgaXMgbW9yZSB0aGFuIDEgc3Vic2VjdGlvbiBpbiB0aGUgc2VjdGlvbi5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHNBY3Rpb25OYW1lIFRoZSBhY3Rpb24gbmFtZS5cblx0ICogQHJldHVybnMge29iamVjdH0gUmV0dXJuIHRoZSBjb250cm9sIHRhcmdldGVkIGJ5IHRoZSBtZXNzYWdlLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2NvbXB1dGVNZXNzYWdlR3JvdXBBbmRTdWJUaXRsZShcblx0XHRtZXNzYWdlOiBNZXNzYWdlSXRlbSxcblx0XHRzZWN0aW9uOiBPYmplY3RQYWdlU2VjdGlvbixcblx0XHRzdWJTZWN0aW9uOiBPYmplY3RQYWdlU3ViU2VjdGlvbixcblx0XHRhRWxlbWVudHM6IGFueVtdLFxuXHRcdGJNdWx0aXBsZVN1YlNlY3Rpb25zOiBib29sZWFuLFxuXHRcdHNBY3Rpb25OYW1lOiBzdHJpbmdcblx0KSB7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IGdldFJlc291cmNlTW9kZWwoc2VjdGlvbik7XG5cdFx0dGhpcy5vSXRlbUJpbmRpbmcuZGV0YWNoQ2hhbmdlKHRoaXMuX3NldE1lc3NhZ2VEYXRhLCB0aGlzKTtcblx0XHRjb25zdCBvTWVzc2FnZU9iamVjdCA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpPy5nZXRPYmplY3QoKSBhcyBNZXNzYWdlO1xuXHRcdGNvbnN0IHNldFNlY3Rpb25OYW1lSW5Hcm91cCA9IHRydWU7XG5cdFx0bGV0IG9FbGVtZW50LCBvVGFibGU6IGFueSwgb1RhcmdldFRhYmxlSW5mbzogYW55LCBsLCBpUm93SW5kZXgsIG9UYXJnZXRlZENvbnRyb2wsIGJJc0NyZWF0aW9uUm93O1xuXHRcdGNvbnN0IGJJc0JhY2tlbmRNZXNzYWdlID0gbmV3IFJlZ0V4cChcIl4vXCIpLnRlc3Qob01lc3NhZ2VPYmplY3Q/LmdldFRhcmdldHMoKVswXSk7XG5cdFx0aWYgKGJJc0JhY2tlbmRNZXNzYWdlKSB7XG5cdFx0XHRmb3IgKGwgPSAwOyBsIDwgYUVsZW1lbnRzLmxlbmd0aDsgbCsrKSB7XG5cdFx0XHRcdG9FbGVtZW50ID0gYUVsZW1lbnRzW2xdO1xuXHRcdFx0XHRvVGFyZ2V0ZWRDb250cm9sID0gb0VsZW1lbnQ7XG5cdFx0XHRcdGlmIChvRWxlbWVudC5pc0EoXCJzYXAubS5UYWJsZVwiKSB8fCBvRWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikpIHtcblx0XHRcdFx0XHRvVGFibGUgPSBvRWxlbWVudC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRjb25zdCBvUm93QmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0XHRcdFx0Y29uc3QgZm5DYWxsYmFja1NldEdyb3VwTmFtZSA9IChvTWVzc2FnZU9iajogYW55LCBhY3Rpb25OYW1lOiBzdHJpbmcpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuX3NldEdyb3VwTGFiZWxGb3JUcmFuc2llbnRNc2cobWVzc2FnZSwgYWN0aW9uTmFtZSk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpZiAob1Jvd0JpbmRpbmcgJiYgb1Jvd0JpbmRpbmcuaXNMZW5ndGhGaW5hbCgpICYmIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvYmogPSBtZXNzYWdlSGFuZGxpbmcuZ2V0VGFibGVDb2x1bW5EYXRhQW5kU2V0U3VidGlsZShcblx0XHRcdFx0XHRcdFx0b01lc3NhZ2VPYmplY3QsXG5cdFx0XHRcdFx0XHRcdG9UYWJsZSxcblx0XHRcdFx0XHRcdFx0b0VsZW1lbnQsXG5cdFx0XHRcdFx0XHRcdG9Sb3dCaW5kaW5nLFxuXHRcdFx0XHRcdFx0XHRzQWN0aW9uTmFtZSxcblx0XHRcdFx0XHRcdFx0c2V0U2VjdGlvbk5hbWVJbkdyb3VwLFxuXHRcdFx0XHRcdFx0XHRmbkNhbGxiYWNrU2V0R3JvdXBOYW1lXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mbyA9IG9iai5vVGFyZ2V0VGFibGVJbmZvO1xuXHRcdFx0XHRcdFx0aWYgKG9iai5zdWJUaXRsZSkge1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlLnNldFN1YnRpdGxlKG9iai5zdWJUaXRsZSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdG1lc3NhZ2Uuc2V0QWN0aXZlVGl0bGUoISFvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQpO1xuXG5cdFx0XHRcdFx0XHRpZiAob1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuX2Zvcm1hdE1lc3NhZ2VEZXNjcmlwdGlvbihcblx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCxcblx0XHRcdFx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbE5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0b1RhYmxlXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpUm93SW5kZXggPSBvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQgJiYgb1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0LmdldEluZGV4KCk7XG5cdFx0XHRcdFx0XHR0aGlzLl91cGRhdGVJbnRlcm5hbE1vZGVsKFxuXHRcdFx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdFx0XHRcdGlSb3dJbmRleCxcblx0XHRcdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0b1RhYmxlLFxuXHRcdFx0XHRcdFx0XHRvTWVzc2FnZU9iamVjdFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWVzc2FnZS5zZXRBY3RpdmVUaXRsZSh0cnVlKTtcblx0XHRcdFx0XHQvL2NoZWNrIGlmIHRoZSB0YXJnZXRlZCBjb250cm9sIGlzIGEgY2hpbGQgb2Ygb25lIG9mIHRoZSBvdGhlciBjb250cm9sc1xuXHRcdFx0XHRcdGNvbnN0IGJJc1RhcmdldGVkQ29udHJvbE9ycGhhbiA9IG1lc3NhZ2VIYW5kbGluZy5iSXNPcnBoYW5FbGVtZW50KG9UYXJnZXRlZENvbnRyb2wsIGFFbGVtZW50cyk7XG5cdFx0XHRcdFx0aWYgKGJJc1RhcmdldGVkQ29udHJvbE9ycGhhbikge1xuXHRcdFx0XHRcdFx0Ly9zZXQgdGhlIHN1YnRpdGxlXG5cdFx0XHRcdFx0XHRtZXNzYWdlLnNldFN1YnRpdGxlKFwiXCIpO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vVGhlcmUgaXMgb25seSBvbmUgZWx0IGFzIHRoaXMgaXMgYSBmcm9udEVuZCBtZXNzYWdlXG5cdFx0XHRvVGFyZ2V0ZWRDb250cm9sID0gYUVsZW1lbnRzWzBdO1xuXHRcdFx0b1RhYmxlID0gdGhpcy5fZ2V0TWRjVGFibGUob1RhcmdldGVkQ29udHJvbCk7XG5cdFx0XHRpZiAob1RhYmxlKSB7XG5cdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8gPSB7fTtcblx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby50YWJsZUhlYWRlciA9IG9UYWJsZS5nZXRIZWFkZXIoKTtcblx0XHRcdFx0Y29uc3QgaVRhcmdldENvbHVtbkluZGV4ID0gdGhpcy5fZ2V0VGFibGVDb2x1bW5JbmRleChvVGFyZ2V0ZWRDb250cm9sKTtcblx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA9XG5cdFx0XHRcdFx0aVRhcmdldENvbHVtbkluZGV4ID4gLTEgPyBvVGFibGUuZ2V0Q29sdW1ucygpW2lUYXJnZXRDb2x1bW5JbmRleF0uZ2V0RGF0YVByb3BlcnR5KCkgOiB1bmRlZmluZWQ7XG5cblx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lID1cblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5ICYmIGlUYXJnZXRDb2x1bW5JbmRleCA+IC0xXG5cdFx0XHRcdFx0XHQ/IG9UYWJsZS5nZXRDb2x1bW5zKClbaVRhcmdldENvbHVtbkluZGV4XS5nZXRIZWFkZXIoKVxuXHRcdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRcdGJJc0NyZWF0aW9uUm93ID0gdGhpcy5fZ2V0VGFibGVSb3cob1RhcmdldGVkQ29udHJvbCkuaXNBKFwic2FwLnVpLnRhYmxlLkNyZWF0aW9uUm93XCIpO1xuXHRcdFx0XHRpZiAoIWJJc0NyZWF0aW9uUm93KSB7XG5cdFx0XHRcdFx0aVJvd0luZGV4ID0gdGhpcy5fZ2V0VGFibGVSb3dJbmRleChvVGFyZ2V0ZWRDb250cm9sKTtcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0Q3VycmVudENvbnRleHRzKCk7XG5cdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0ID0gb1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dCaW5kaW5nQ29udGV4dHNbaVJvd0luZGV4XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBzTWVzc2FnZVN1YnRpdGxlID0gbWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VTdWJ0aXRsZShcblx0XHRcdFx0XHRvTWVzc2FnZU9iamVjdCxcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cyxcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xOYW1lLFxuXHRcdFx0XHRcdG9UYWJsZSxcblx0XHRcdFx0XHRiSXNDcmVhdGlvblJvdyxcblx0XHRcdFx0XHRpVGFyZ2V0Q29sdW1uSW5kZXggPT09IDAgJiYgb1RhcmdldGVkQ29udHJvbC5nZXRWYWx1ZVN0YXRlKCkgPT09IFwiRXJyb3JcIiA/IG9UYXJnZXRlZENvbnRyb2wgOiB1bmRlZmluZWRcblx0XHRcdFx0KTtcblx0XHRcdFx0Ly9zZXQgdGhlIHN1YnRpdGxlXG5cdFx0XHRcdGlmIChzTWVzc2FnZVN1YnRpdGxlKSB7XG5cdFx0XHRcdFx0bWVzc2FnZS5zZXRTdWJ0aXRsZShzTWVzc2FnZVN1YnRpdGxlKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG1lc3NhZ2Uuc2V0QWN0aXZlVGl0bGUodHJ1ZSk7XG5cblx0XHRcdFx0dGhpcy5fdXBkYXRlSW50ZXJuYWxNb2RlbChcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdFx0aVJvd0luZGV4LFxuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHksXG5cdFx0XHRcdFx0b1RhYmxlLFxuXHRcdFx0XHRcdG9NZXNzYWdlT2JqZWN0LFxuXHRcdFx0XHRcdGJJc0NyZWF0aW9uUm93XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHNldFNlY3Rpb25OYW1lSW5Hcm91cCkge1xuXHRcdFx0Y29uc3Qgc2VjdGlvbkJhc2VkR3JvdXBOYW1lID0gbWVzc2FnZUhhbmRsaW5nLmNyZWF0ZVNlY3Rpb25Hcm91cE5hbWUoXG5cdFx0XHRcdHNlY3Rpb24sXG5cdFx0XHRcdHN1YlNlY3Rpb24sXG5cdFx0XHRcdGJNdWx0aXBsZVN1YlNlY3Rpb25zLFxuXHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLFxuXHRcdFx0XHRyZXNvdXJjZU1vZGVsXG5cdFx0XHQpO1xuXG5cdFx0XHRtZXNzYWdlLnNldEdyb3VwTmFtZShzZWN0aW9uQmFzZWRHcm91cE5hbWUpO1xuXHRcdFx0Y29uc3Qgc1ZpZXdJZCA9IHRoaXMuX2dldFZpZXdJZCh0aGlzLmdldElkKCkpO1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb3JlLmJ5SWQoc1ZpZXdJZCBhcyBzdHJpbmcpO1xuXHRcdFx0Y29uc3Qgb01lc3NhZ2VUYXJnZXRQcm9wZXJ0eSA9IG9NZXNzYWdlT2JqZWN0LmdldFRhcmdldHMoKVswXSAmJiBvTWVzc2FnZU9iamVjdC5nZXRUYXJnZXRzKClbMF0uc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdFx0Y29uc3Qgb1VJTW9kZWwgPSBvVmlldz8uZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9VSU1vZGVsICYmXG5cdFx0XHRcdG9VSU1vZGVsLmdldFByb3BlcnR5KFwiL21lc3NhZ2VUYXJnZXRQcm9wZXJ0eVwiKSAmJlxuXHRcdFx0XHRvTWVzc2FnZVRhcmdldFByb3BlcnR5ICYmXG5cdFx0XHRcdG9NZXNzYWdlVGFyZ2V0UHJvcGVydHkgPT09IG9VSU1vZGVsLmdldFByb3BlcnR5KFwiL21lc3NhZ2VUYXJnZXRQcm9wZXJ0eVwiKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHRoaXMub01lc3NhZ2VQb3BvdmVyLmZpcmVBY3RpdmVUaXRsZVByZXNzKHsgaXRlbTogbWVzc2FnZSB9KTtcblx0XHRcdFx0b1VJTW9kZWwuc2V0UHJvcGVydHkoXCIvbWVzc2FnZVRhcmdldFByb3BlcnR5XCIsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5vSXRlbUJpbmRpbmcuYXR0YWNoQ2hhbmdlKHRoaXMuX3NldE1lc3NhZ2VEYXRhLCB0aGlzKTtcblx0XHRyZXR1cm4gb1RhcmdldGVkQ29udHJvbDtcblx0fVxuXG5cdF9jaGVja0NvbnRyb2xJZEluU2VjdGlvbnMoYU1lc3NhZ2VzOiBhbnlbXSkge1xuXHRcdGxldCBzZWN0aW9uLCBhU3ViU2VjdGlvbnMsIG1lc3NhZ2UsIGksIGosIGs7XG5cblx0XHR0aGlzLnNHZW5lcmFsR3JvdXBUZXh0ID0gdGhpcy5zR2VuZXJhbEdyb3VwVGV4dFxuXHRcdFx0PyB0aGlzLnNHZW5lcmFsR3JvdXBUZXh0XG5cdFx0XHQ6IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIikuZ2V0VGV4dChcIlRfTUVTU0FHRV9CVVRUT05fU0FQRkVfTUVTU0FHRV9HUk9VUF9HRU5FUkFMXCIpO1xuXHRcdC8vR2V0IGFsbCBzZWN0aW9ucyBmcm9tIHRoZSBvYmplY3QgcGFnZSBsYXlvdXRcblx0XHRjb25zdCBhVmlzaWJsZVNlY3Rpb25zID0gbWVzc2FnZUhhbmRsaW5nLmdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0KHRoaXMub09iamVjdFBhZ2VMYXlvdXQpO1xuXHRcdGlmIChhVmlzaWJsZVNlY3Rpb25zKSB7XG5cdFx0XHRjb25zdCB2aWV3SWQgPSB0aGlzLl9nZXRWaWV3SWQodGhpcy5nZXRJZCgpKTtcblx0XHRcdGNvbnN0IG9WaWV3ID0gQ29yZS5ieUlkKHZpZXdJZCk7XG5cdFx0XHRjb25zdCBzQWN0aW9uTmFtZSA9IG9WaWV3Py5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpPy5nZXRQcm9wZXJ0eShcInNBY3Rpb25OYW1lXCIpO1xuXHRcdFx0aWYgKHNBY3Rpb25OYW1lKSB7XG5cdFx0XHRcdChvVmlldz8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBhbnkpLnNldFByb3BlcnR5KFwic0FjdGlvbk5hbWVcIiwgbnVsbCk7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGkgPSBhTWVzc2FnZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcblx0XHRcdFx0Ly8gTG9vcCBvdmVyIGFsbCBtZXNzYWdlc1xuXHRcdFx0XHRtZXNzYWdlID0gYU1lc3NhZ2VzW2ldO1xuXHRcdFx0XHRsZXQgYklzR2VuZXJhbEdyb3VwTmFtZSA9IHRydWU7XG5cdFx0XHRcdGZvciAoaiA9IGFWaXNpYmxlU2VjdGlvbnMubGVuZ3RoIC0gMTsgaiA+PSAwOyAtLWopIHtcblx0XHRcdFx0XHQvLyBMb29wIG92ZXIgYWxsIHZpc2libGUgc2VjdGlvbnNcblx0XHRcdFx0XHRzZWN0aW9uID0gYVZpc2libGVTZWN0aW9uc1tqXTtcblx0XHRcdFx0XHRhU3ViU2VjdGlvbnMgPSBzZWN0aW9uLmdldFN1YlNlY3Rpb25zKCk7XG5cdFx0XHRcdFx0Zm9yIChrID0gYVN1YlNlY3Rpb25zLmxlbmd0aCAtIDE7IGsgPj0gMDsgLS1rKSB7XG5cdFx0XHRcdFx0XHQvLyBMb29wIG92ZXIgYWxsIHN1Yi1zZWN0aW9uc1xuXHRcdFx0XHRcdFx0Y29uc3Qgc3ViU2VjdGlvbiA9IGFTdWJTZWN0aW9uc1trXTtcblx0XHRcdFx0XHRcdGNvbnN0IG9NZXNzYWdlT2JqZWN0ID0gbWVzc2FnZS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGFDb250cm9scyA9IG1lc3NhZ2VIYW5kbGluZy5nZXRDb250cm9sRnJvbU1lc3NhZ2VSZWxhdGluZ1RvU3ViU2VjdGlvbihzdWJTZWN0aW9uLCBvTWVzc2FnZU9iamVjdCk7XG5cdFx0XHRcdFx0XHRpZiAoYUNvbnRyb2xzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb1RhcmdldGVkQ29udHJvbCA9IHRoaXMuX2NvbXB1dGVNZXNzYWdlR3JvdXBBbmRTdWJUaXRsZShcblx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRcdHNlY3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0c3ViU2VjdGlvbixcblx0XHRcdFx0XHRcdFx0XHRhQ29udHJvbHMsXG5cdFx0XHRcdFx0XHRcdFx0YVN1YlNlY3Rpb25zLmxlbmd0aCA+IDEsXG5cdFx0XHRcdFx0XHRcdFx0c0FjdGlvbk5hbWVcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0Ly8gaWYgd2UgZm91bmQgdGFibGUgdGhhdCBtYXRjaGVzIHdpdGggdGhlIG1lc3NhZ2UsIHdlIGRvbid0IHN0b3AgdGhlIGxvb3Bcblx0XHRcdFx0XHRcdFx0Ly8gaW4gY2FzZSB3ZSBmaW5kIGFuIGFkZGl0aW9uYWwgY29udHJvbCAoZWcgbWRjIGZpZWxkKSB0aGF0IGFsc28gbWF0Y2ggd2l0aCB0aGUgbWVzc2FnZVxuXHRcdFx0XHRcdFx0XHRpZiAob1RhcmdldGVkQ29udHJvbCAmJiAhb1RhcmdldGVkQ29udHJvbC5pc0EoXCJzYXAubS5UYWJsZVwiKSAmJiAhb1RhcmdldGVkQ29udHJvbC5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikpIHtcblx0XHRcdFx0XHRcdFx0XHRqID0gayA9IC0xO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJJc0dlbmVyYWxHcm91cE5hbWUgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGJJc0dlbmVyYWxHcm91cE5hbWUpIHtcblx0XHRcdFx0XHRjb25zdCBvTWVzc2FnZU9iamVjdCA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpLmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0QWN0aXZlVGl0bGUoZmFsc2UpO1xuXHRcdFx0XHRcdGlmIChvTWVzc2FnZU9iamVjdC5wZXJzaXN0ZW50ICYmIHNBY3Rpb25OYW1lKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl9zZXRHcm91cExhYmVsRm9yVHJhbnNpZW50TXNnKG1lc3NhZ2UsIHNBY3Rpb25OYW1lKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bWVzc2FnZS5zZXRHcm91cE5hbWUodGhpcy5zR2VuZXJhbEdyb3VwVGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2ZpbmRUYXJnZXRGb3JNZXNzYWdlKG1lc3NhZ2U6IGFueSkge1xuXHRcdGNvbnN0IG1lc3NhZ2VPYmplY3QgPSBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKSAmJiBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKS5nZXRPYmplY3QoKTtcblx0XHRpZiAobWVzc2FnZU9iamVjdCAmJiBtZXNzYWdlT2JqZWN0LnRhcmdldCkge1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9XG5cdFx0XHRcdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCAmJiB0aGlzLm9PYmplY3RQYWdlTGF5b3V0LmdldE1vZGVsKCkgJiYgdGhpcy5vT2JqZWN0UGFnZUxheW91dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRjb250ZXh0UGF0aCA9IG9NZXRhTW9kZWwgJiYgb01ldGFNb2RlbC5nZXRNZXRhUGF0aChtZXNzYWdlT2JqZWN0LnRhcmdldCksXG5cdFx0XHRcdG9Db250ZXh0UGF0aE1ldGFkYXRhID0gb01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE9iamVjdChjb250ZXh0UGF0aCk7XG5cdFx0XHRpZiAob0NvbnRleHRQYXRoTWV0YWRhdGEgJiYgb0NvbnRleHRQYXRoTWV0YWRhdGEuJGtpbmQgPT09IFwiUHJvcGVydHlcIikge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfZm5FbmFibGVCaW5kaW5ncyhhU2VjdGlvbnM6IGFueVtdKSB7XG5cdFx0aWYgKFVyaVBhcmFtZXRlcnMuZnJvbVF1ZXJ5KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldChcInNhcC1mZS14eC1sYXp5bG9hZGluZ3Rlc3RcIikpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Zm9yIChsZXQgaVNlY3Rpb24gPSAwOyBpU2VjdGlvbiA8IGFTZWN0aW9ucy5sZW5ndGg7IGlTZWN0aW9uKyspIHtcblx0XHRcdGNvbnN0IG9TZWN0aW9uID0gYVNlY3Rpb25zW2lTZWN0aW9uXTtcblx0XHRcdGxldCBub25UYWJsZUNoYXJ0Y29udHJvbEZvdW5kID0gZmFsc2U7XG5cdFx0XHRjb25zdCBhU3ViU2VjdGlvbnMgPSBvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpO1xuXHRcdFx0Zm9yIChsZXQgaVN1YlNlY3Rpb24gPSAwOyBpU3ViU2VjdGlvbiA8IGFTdWJTZWN0aW9ucy5sZW5ndGg7IGlTdWJTZWN0aW9uKyspIHtcblx0XHRcdFx0Y29uc3Qgb1N1YlNlY3Rpb24gPSBhU3ViU2VjdGlvbnNbaVN1YlNlY3Rpb25dO1xuXHRcdFx0XHRjb25zdCBvQWxsQmxvY2tzID0gb1N1YlNlY3Rpb24uZ2V0QmxvY2tzKCk7XG5cdFx0XHRcdGlmIChvQWxsQmxvY2tzKSB7XG5cdFx0XHRcdFx0Zm9yIChsZXQgYmxvY2sgPSAwOyBibG9jayA8IG9TdWJTZWN0aW9uLmdldEJsb2NrcygpLmxlbmd0aDsgYmxvY2srKykge1xuXHRcdFx0XHRcdFx0aWYgKG9BbGxCbG9ja3NbYmxvY2tdLmdldENvbnRlbnQgJiYgIW9BbGxCbG9ja3NbYmxvY2tdLmdldENvbnRlbnQoKT8uaXNBKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5UYWJsZUFQSVwiKSkge1xuXHRcdFx0XHRcdFx0XHRub25UYWJsZUNoYXJ0Y29udHJvbEZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChub25UYWJsZUNoYXJ0Y29udHJvbEZvdW5kKSB7XG5cdFx0XHRcdFx0XHRvU3ViU2VjdGlvbi5zZXRCaW5kaW5nQ29udGV4dCh1bmRlZmluZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1N1YlNlY3Rpb24uZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0XHRcdHRoaXMuX2ZpbmRNZXNzYWdlR3JvdXBBZnRlclJlYmluZGluZygpO1xuXHRcdFx0XHRcdG9TdWJTZWN0aW9uLmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0QmluZGluZygpLmF0dGFjaERhdGFSZWNlaXZlZCh0aGlzLl9maW5kTWVzc2FnZUdyb3VwQWZ0ZXJSZWJpbmRpbmcuYmluZCh0aGlzKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfZmluZE1lc3NhZ2VHcm91cEFmdGVyUmViaW5kaW5nKCkge1xuXHRcdGNvbnN0IGFNZXNzYWdlcyA9IHRoaXMub01lc3NhZ2VQb3BvdmVyLmdldEl0ZW1zKCk7XG5cdFx0dGhpcy5fY2hlY2tDb250cm9sSWRJblNlY3Rpb25zKGFNZXNzYWdlcyk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IHJldHJpZXZlcyB0aGUgdmlldyBJRCAoSFRNTFZpZXcvWE1MVmlldy9KU09Odmlldy9KU1ZpZXcvVGVtcGxhdGV2aWV3KSBvZiBhbnkgY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIHNDb250cm9sSWQgSUQgb2YgdGhlIGNvbnRyb2wgbmVlZGVkIHRvIHJldHJpZXZlIHRoZSB2aWV3IElEXG5cdCAqIEByZXR1cm5zIFRoZSB2aWV3IElEIG9mIHRoZSBjb250cm9sXG5cdCAqL1xuXHRfZ2V0Vmlld0lkKHNDb250cm9sSWQ6IHN0cmluZykge1xuXHRcdGxldCBzVmlld0lkLFxuXHRcdFx0b0NvbnRyb2wgPSBDb3JlLmJ5SWQoc0NvbnRyb2xJZCkgYXMgYW55O1xuXHRcdHdoaWxlIChvQ29udHJvbCkge1xuXHRcdFx0aWYgKG9Db250cm9sIGluc3RhbmNlb2YgVmlldykge1xuXHRcdFx0XHRzVmlld0lkID0gb0NvbnRyb2wuZ2V0SWQoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRvQ29udHJvbCA9IG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gc1ZpZXdJZDtcblx0fVxuXG5cdF9zZXRMb25ndGV4dFVybERlc2NyaXB0aW9uKHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50OiBzdHJpbmcsIG9EaWFnbm9zaXNUaXRsZTogYW55KSB7XG5cdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIuc2V0QXN5bmNEZXNjcmlwdGlvbkhhbmRsZXIoZnVuY3Rpb24gKGNvbmZpZzogYW55KSB7XG5cdFx0XHQvLyBUaGlzIHN0b3JlcyB0aGUgb2xkIGRlc2NyaXB0aW9uXG5cdFx0XHRjb25zdCBzT2xkRGVzY3JpcHRpb24gPSBzTWVzc2FnZURlc2NyaXB0aW9uQ29udGVudDtcblx0XHRcdC8vIEhlcmUgd2UgY2FuIGZldGNoIHRoZSBkYXRhIGFuZCBjb25jYXRlbmF0ZSBpdCB0byB0aGUgb2xkIG9uZVxuXHRcdFx0Ly8gQnkgZGVmYXVsdCwgdGhlIGxvbmd0ZXh0VXJsIGZldGNoaW5nIHdpbGwgb3ZlcndyaXRlIHRoZSBkZXNjcmlwdGlvbiAod2l0aCB0aGUgZGVmYXVsdCBiZWhhdmlvdXIpXG5cdFx0XHQvLyBIZXJlIGFzIHdlIGhhdmUgb3ZlcndyaXR0ZW4gdGhlIGRlZmF1bHQgYXN5bmMgaGFuZGxlciwgd2hpY2ggZmV0Y2hlcyBhbmQgcmVwbGFjZXMgdGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBpdGVtXG5cdFx0XHQvLyB3ZSBjYW4gbWFudWFsbHkgbW9kaWZ5IGl0IHRvIGluY2x1ZGUgd2hhdGV2ZXIgbmVlZGVkLlxuXHRcdFx0Y29uc3Qgc0xvbmdUZXh0VXJsID0gY29uZmlnLml0ZW0uZ2V0TG9uZ3RleHRVcmwoKTtcblx0XHRcdGlmIChzTG9uZ1RleHRVcmwpIHtcblx0XHRcdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0XHRcdHR5cGU6IFwiR0VUXCIsXG5cdFx0XHRcdFx0dXJsOiBzTG9uZ1RleHRVcmwsXG5cdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHNEaWFnbm9zaXNUZXh0ID0gb0RpYWdub3Npc1RpdGxlLmdldEh0bWxUZXh0KCkgKyBkYXRhO1xuXHRcdFx0XHRcdFx0Y29uZmlnLml0ZW0uc2V0RGVzY3JpcHRpb24oYCR7c09sZERlc2NyaXB0aW9ufSR7c0RpYWdub3Npc1RleHR9YCk7XG5cdFx0XHRcdFx0XHRjb25maWcucHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRlcnJvcjogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Y29uZmlnLml0ZW0uc2V0RGVzY3JpcHRpb24oc01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc0Vycm9yID0gYEEgcmVxdWVzdCBoYXMgZmFpbGVkIGZvciBsb25nIHRleHQgZGF0YS4gVVJMOiAke3NMb25nVGV4dFVybH1gO1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKHNFcnJvcik7XG5cdFx0XHRcdFx0XHRjb25maWcucHJvbWlzZS5yZWplY3Qoc0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0X2Zvcm1hdE1lc3NhZ2VEZXNjcmlwdGlvbihtZXNzYWdlOiBhbnksIG9UYWJsZVJvd0NvbnRleHQ6IGFueSwgc1RhYmxlVGFyZ2V0Q29sTmFtZTogc3RyaW5nLCBvVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9UYWJsZSk7XG5cdFx0Y29uc3Qgc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IG9UYWJsZS5nZXRQYXJlbnQoKS5nZXRJZGVudGlmaWVyQ29sdW1uKCk7XG5cdFx0bGV0IHNDb2x1bW5JbmZvID0gXCJcIjtcblx0XHRjb25zdCBvTXNnT2JqID0gbWVzc2FnZS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIik/LmdldE9iamVjdCgpO1xuXHRcdGNvbnN0IG9Db2xGcm9tVGFibGVTZXR0aW5nczogQ29sdW1uRGF0YVdpdGhBdmFpbGFiaWxpdHlUeXBlID0gbWVzc2FnZUhhbmRsaW5nLmZldGNoQ29sdW1uSW5mbyhvTXNnT2JqLCBvVGFibGUpO1xuXHRcdGlmIChzVGFibGVUYXJnZXRDb2xOYW1lKSB7XG5cdFx0XHQvLyBpZiBjb2x1bW4gaW4gcHJlc2VudCBpbiB0YWJsZSBkZWZpbml0aW9uXG5cdFx0XHRzQ29sdW1uSW5mbyA9IGAke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9DT0xVTU5cIil9OiAke3NUYWJsZVRhcmdldENvbE5hbWV9YDtcblx0XHR9IGVsc2UgaWYgKG9Db2xGcm9tVGFibGVTZXR0aW5ncykge1xuXHRcdFx0aWYgKG9Db2xGcm9tVGFibGVTZXR0aW5ncy5hdmFpbGFiaWxpdHkgPT09IFwiSGlkZGVuXCIpIHtcblx0XHRcdFx0Ly8gaWYgY29sdW1uIGluIG5laXRoZXIgaW4gdGFibGUgZGVmaW5pdGlvbiBub3IgcGVyc29uYWxpemF0aW9uXG5cdFx0XHRcdGlmIChtZXNzYWdlLmdldFR5cGUoKSA9PT0gXCJFcnJvclwiKSB7XG5cdFx0XHRcdFx0c0NvbHVtbkluZm8gPSBzVGFibGVGaXJzdENvbFByb3BlcnR5XG5cdFx0XHRcdFx0XHQ/IGAke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfQ09MVU1OX0FWQUlMQUJMRV9ESUFHTk9TSVNfTVNHREVTQ19FUlJPUlwiKX0gJHtvVGFibGVSb3dDb250ZXh0LmdldFZhbHVlKFxuXHRcdFx0XHRcdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdFx0XHRcdCAgKX1gICsgXCIuXCJcblx0XHRcdFx0XHRcdDogYCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9DT0xVTU5fQVZBSUxBQkxFX0RJQUdOT1NJU19NU0dERVNDX0VSUk9SXCIpfWAgKyBcIi5cIjtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzQ29sdW1uSW5mbyA9IHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdFx0XHRcdD8gYCR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9DT0xVTU5fQVZBSUxBQkxFX0RJQUdOT1NJU19NU0dERVNDXCIpfSAke29UYWJsZVJvd0NvbnRleHQuZ2V0VmFsdWUoXG5cdFx0XHRcdFx0XHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0ICApfWAgKyBcIi5cIlxuXHRcdFx0XHRcdFx0OiBgJHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX0NPTFVNTl9BVkFJTEFCTEVfRElBR05PU0lTX01TR0RFU0NcIil9YCArIFwiLlwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBpZiBjb2x1bW4gaXMgbm90IGluIHRhYmxlIGRlZmluaXRpb24gYnV0IGluIHBlcnNvbmFsaXphdGlvblxuXHRcdFx0XHQvL2lmIG5vIG5hdmlnYXRpb24gdG8gc3ViIG9wIHRoZW4gcmVtb3ZlIGxpbmsgdG8gZXJyb3IgZmllbGQgQkNQIDogMjI4MDE2ODg5OVxuXHRcdFx0XHRpZiAoIXRoaXMuX25hdmlnYXRpb25Db25maWd1cmVkKG9UYWJsZSkpIHtcblx0XHRcdFx0XHRtZXNzYWdlLnNldEFjdGl2ZVRpdGxlKGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzQ29sdW1uSW5mbyA9IGAke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9DT0xVTU5cIil9OiAke1xuXHRcdFx0XHRcdG9Db2xGcm9tVGFibGVTZXR0aW5ncy5sYWJlbFxuXHRcdFx0XHR9ICgke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfQ09MVU1OX0lORElDQVRPUl9JTl9UQUJMRV9ERUZJTklUSU9OXCIpfSlgO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRjb25zdCBvRmllbGRzQWZmZWN0ZWRUaXRsZSA9IG5ldyBGb3JtYXR0ZWRUZXh0KHtcblx0XHRcdGh0bWxUZXh0OiBgPGh0bWw+PGJvZHk+PHN0cm9uZz4ke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfRklFTERTX0FGRkVDVEVEX1RJVExFXCIpfTwvc3Ryb25nPjwvYm9keT48L2h0bWw+PGJyPmBcblx0XHR9KTtcblx0XHRsZXQgc0ZpZWxkQWZmZWN0ZWRUZXh0OiBTdHJpbmc7XG5cdFx0aWYgKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpIHtcblx0XHRcdHNGaWVsZEFmZmVjdGVkVGV4dCA9IGAke29GaWVsZHNBZmZlY3RlZFRpdGxlLmdldEh0bWxUZXh0KCl9PGJyPiR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFxuXHRcdFx0XHRcIlRfTUVTU0FHRV9HUk9VUF9USVRMRV9UQUJMRV9ERU5PTUlOQVRPUlwiXG5cdFx0XHQpfTogJHtvVGFibGUuZ2V0SGVhZGVyKCl9PGJyPiR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX0RFU0NSSVBUSU9OX1RBQkxFX1JPV1wiKX06ICR7b1RhYmxlUm93Q29udGV4dC5nZXRWYWx1ZShcblx0XHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdFx0KX08YnI+JHtzQ29sdW1uSW5mb308YnI+YDtcblx0XHR9IGVsc2UgaWYgKHNDb2x1bW5JbmZvID09IFwiXCIgfHwgIXNDb2x1bW5JbmZvKSB7XG5cdFx0XHRzRmllbGRBZmZlY3RlZFRleHQgPSBcIlwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzRmllbGRBZmZlY3RlZFRleHQgPSBgJHtvRmllbGRzQWZmZWN0ZWRUaXRsZS5nZXRIdG1sVGV4dCgpfTxicj4ke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcblx0XHRcdFx0XCJUX01FU1NBR0VfR1JPVVBfVElUTEVfVEFCTEVfREVOT01JTkFUT1JcIlxuXHRcdFx0KX06ICR7b1RhYmxlLmdldEhlYWRlcigpfTxicj4ke3NDb2x1bW5JbmZvfTxicj5gO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9EaWFnbm9zaXNUaXRsZSA9IG5ldyBGb3JtYXR0ZWRUZXh0KHtcblx0XHRcdGh0bWxUZXh0OiBgPGh0bWw+PGJvZHk+PHN0cm9uZz4ke3Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRfRElBR05PU0lTX1RJVExFXCIpfTwvc3Ryb25nPjwvYm9keT48L2h0bWw+PGJyPmBcblx0XHR9KTtcblx0XHQvLyBnZXQgdGhlIFVJIG1lc3NhZ2VzIGZyb20gdGhlIG1lc3NhZ2UgY29udGV4dCB0byBzZXQgaXQgdG8gRGlhZ25vc2lzIHNlY3Rpb25cblx0XHRjb25zdCBzVUlNZXNzYWdlRGVzY3JpcHRpb24gPSBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKS5nZXRPYmplY3QoKS5kZXNjcmlwdGlvbjtcblx0XHQvL3NldCB0aGUgZGVzY3JpcHRpb24gdG8gbnVsbCB0byByZXNldCBpdCBiZWxvd1xuXHRcdG1lc3NhZ2Uuc2V0RGVzY3JpcHRpb24obnVsbCk7XG5cdFx0bGV0IHNEaWFnbm9zaXNUZXh0ID0gXCJcIjtcblx0XHRsZXQgc01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQgPSBcIlwiO1xuXHRcdGlmIChtZXNzYWdlLmdldExvbmd0ZXh0VXJsKCkpIHtcblx0XHRcdHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50ID0gYCR7c0ZpZWxkQWZmZWN0ZWRUZXh0fTxicj5gO1xuXHRcdFx0dGhpcy5fc2V0TG9uZ3RleHRVcmxEZXNjcmlwdGlvbihzTWVzc2FnZURlc2NyaXB0aW9uQ29udGVudCwgb0RpYWdub3Npc1RpdGxlKTtcblx0XHR9IGVsc2UgaWYgKHNVSU1lc3NhZ2VEZXNjcmlwdGlvbikge1xuXHRcdFx0c0RpYWdub3Npc1RleHQgPSBgJHtvRGlhZ25vc2lzVGl0bGUuZ2V0SHRtbFRleHQoKX08YnI+JHtzVUlNZXNzYWdlRGVzY3JpcHRpb259YDtcblx0XHRcdHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50ID0gYCR7c0ZpZWxkQWZmZWN0ZWRUZXh0fTxicj4ke3NEaWFnbm9zaXNUZXh0fWA7XG5cdFx0XHRtZXNzYWdlLnNldERlc2NyaXB0aW9uKHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bWVzc2FnZS5zZXREZXNjcmlwdGlvbihzRmllbGRBZmZlY3RlZFRleHQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc2V0IHRoZSBidXR0b24gdGV4dCwgY291bnQgYW5kIGljb24gcHJvcGVydHkgYmFzZWQgdXBvbiB0aGUgbWVzc2FnZSBpdGVtc1xuXHQgKiBCdXR0b25UeXBlOiAgUG9zc2libGUgc2V0dGluZ3MgZm9yIHdhcm5pbmcgYW5kIGVycm9yIG1lc3NhZ2VzIGFyZSAnY3JpdGljYWwnIGFuZCAnbmVnYXRpdmUnLlxuXHQgKlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X3NldE1lc3NhZ2VEYXRhKCkge1xuXHRcdGNsZWFyVGltZW91dCh0aGlzLl9zZXRNZXNzYWdlRGF0YVRpbWVvdXQpO1xuXG5cdFx0dGhpcy5fc2V0TWVzc2FnZURhdGFUaW1lb3V0ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XG5cdFx0XHRjb25zdCBzSWNvbiA9IFwiXCIsXG5cdFx0XHRcdG9NZXNzYWdlcyA9IHRoaXMub01lc3NhZ2VQb3BvdmVyLmdldEl0ZW1zKCksXG5cdFx0XHRcdG9NZXNzYWdlQ291bnQ6IE1lc3NhZ2VDb3VudCA9IHsgRXJyb3I6IDAsIFdhcm5pbmc6IDAsIFN1Y2Nlc3M6IDAsIEluZm9ybWF0aW9uOiAwIH0sXG5cdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIiksXG5cdFx0XHRcdGlNZXNzYWdlTGVuZ3RoID0gb01lc3NhZ2VzLmxlbmd0aDtcblx0XHRcdGxldCBzQnV0dG9uVHlwZSA9IEJ1dHRvblR5cGUuRGVmYXVsdCxcblx0XHRcdFx0c01lc3NhZ2VLZXkgPSBcIlwiLFxuXHRcdFx0XHRzVG9vbHRpcFRleHQgPSBcIlwiLFxuXHRcdFx0XHRzTWVzc2FnZVRleHQgPSBcIlwiO1xuXHRcdFx0aWYgKGlNZXNzYWdlTGVuZ3RoID4gMCkge1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGlNZXNzYWdlTGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAoIW9NZXNzYWdlc1tpXS5nZXRUeXBlKCkgfHwgb01lc3NhZ2VzW2ldLmdldFR5cGUoKSA9PT0gXCJcIikge1xuXHRcdFx0XHRcdFx0KytvTWVzc2FnZUNvdW50W1wiSW5mb3JtYXRpb25cIl07XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdCsrb01lc3NhZ2VDb3VudFtvTWVzc2FnZXNbaV0uZ2V0VHlwZSgpIGFzIGtleW9mIE1lc3NhZ2VDb3VudF07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLkVycm9yXSA+IDApIHtcblx0XHRcdFx0XHRzQnV0dG9uVHlwZSA9IEJ1dHRvblR5cGUuTmVnYXRpdmU7XG5cdFx0XHRcdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5XYXJuaW5nXSA+IDApIHtcblx0XHRcdFx0XHRzQnV0dG9uVHlwZSA9IEJ1dHRvblR5cGUuQ3JpdGljYWw7XG5cdFx0XHRcdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5TdWNjZXNzXSA+IDApIHtcblx0XHRcdFx0XHRzQnV0dG9uVHlwZSA9IEJ1dHRvblR5cGUuU3VjY2Vzcztcblx0XHRcdFx0fSBlbHNlIGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLkluZm9ybWF0aW9uXSA+IDApIHtcblx0XHRcdFx0XHRzQnV0dG9uVHlwZSA9IEJ1dHRvblR5cGUuTmV1dHJhbDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHRvdGFsTnVtYmVyT2ZNZXNzYWdlcyA9XG5cdFx0XHRcdFx0b01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5FcnJvcl0gK1xuXHRcdFx0XHRcdG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuV2FybmluZ10gK1xuXHRcdFx0XHRcdG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuU3VjY2Vzc10gK1xuXHRcdFx0XHRcdG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuSW5mb3JtYXRpb25dO1xuXG5cdFx0XHRcdHRoaXMuc2V0VGV4dCh0b3RhbE51bWJlck9mTWVzc2FnZXMudG9TdHJpbmcoKSk7XG5cblx0XHRcdFx0aWYgKG9NZXNzYWdlQ291bnQuRXJyb3IgPT09IDEpIHtcblx0XHRcdFx0XHRzTWVzc2FnZUtleSA9IFwiQ19DT01NT05fU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRV9FUlJPUlwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9NZXNzYWdlQ291bnQuRXJyb3IgPiAxKSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VLZXkgPSBcIkNfQ09NTU9OX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfTVVMVElQTEVfRVJST1JfVE9PTFRJUFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCFvTWVzc2FnZUNvdW50LkVycm9yICYmIG9NZXNzYWdlQ291bnQuV2FybmluZykge1xuXHRcdFx0XHRcdHNNZXNzYWdlS2V5ID0gXCJDX0NPTU1PTl9TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1dBUk5JTkdfVE9PTFRJUFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCFvTWVzc2FnZUNvdW50LkVycm9yICYmICFvTWVzc2FnZUNvdW50Lldhcm5pbmcgJiYgb01lc3NhZ2VDb3VudC5JbmZvcm1hdGlvbikge1xuXHRcdFx0XHRcdHNNZXNzYWdlS2V5ID0gXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRV9JTkZPXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIW9NZXNzYWdlQ291bnQuRXJyb3IgJiYgIW9NZXNzYWdlQ291bnQuV2FybmluZyAmJiAhb01lc3NhZ2VDb3VudC5JbmZvcm1hdGlvbiAmJiBvTWVzc2FnZUNvdW50LlN1Y2Nlc3MpIHtcblx0XHRcdFx0XHRzTWVzc2FnZUtleSA9IFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfU1VDQ0VTU1wiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzTWVzc2FnZUtleSkge1xuXHRcdFx0XHRcdHNNZXNzYWdlVGV4dCA9IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KHNNZXNzYWdlS2V5KTtcblx0XHRcdFx0XHRzVG9vbHRpcFRleHQgPSBvTWVzc2FnZUNvdW50LkVycm9yID8gYCR7b01lc3NhZ2VDb3VudC5FcnJvcn0gJHtzTWVzc2FnZVRleHR9YCA6IHNNZXNzYWdlVGV4dDtcblx0XHRcdFx0XHR0aGlzLnNldFRvb2x0aXAoc1Rvb2x0aXBUZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldEljb24oc0ljb24pO1xuXHRcdFx0XHR0aGlzLnNldFR5cGUoc0J1dHRvblR5cGUpO1xuXHRcdFx0XHR0aGlzLnNldFZpc2libGUodHJ1ZSk7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gQ29yZS5ieUlkKHRoaXMuc1ZpZXdJZCkgYXMgRkVWaWV3O1xuXHRcdFx0XHRpZiAob1ZpZXcpIHtcblx0XHRcdFx0XHRjb25zdCBvUGFnZVJlYWR5ID0gKG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikucGFnZVJlYWR5O1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBvUGFnZVJlYWR5LndhaXRQYWdlUmVhZHkoKTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX2FwcGx5R3JvdXBpbmdBc3luYyhvVmlldyk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJmYWlsIGdyb3VwaW5nIG1lc3NhZ2VzXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVNZXNzYWdlQ2hhbmdlKHtcblx0XHRcdFx0XHRcdGlNZXNzYWdlTGVuZ3RoOiBpTWVzc2FnZUxlbmd0aFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChpTWVzc2FnZUxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHR0aGlzLm9NZXNzYWdlUG9wb3Zlci5uYXZpZ2F0ZUJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdFx0KHRoaXMgYXMgYW55KS5maXJlTWVzc2FnZUNoYW5nZSh7XG5cdFx0XHRcdFx0aU1lc3NhZ2VMZW5ndGg6IGlNZXNzYWdlTGVuZ3RoXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIDEwMCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB3aGVuIGEgdXNlciBjbGlja3Mgb24gdGhlIHRpdGxlIG9mIHRoZSBtZXNzYWdlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2FjdGl2ZVRpdGxlUHJlc3Ncblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIG9FdmVudCBFdmVudCBvYmplY3QgcGFzc2VkIGZyb20gdGhlIGhhbmRsZXJcblx0ICovXG5cdGFzeW5jIF9hY3RpdmVUaXRsZVByZXNzKG9FdmVudDogQ29yZUV2ZW50KSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5nZXRCaW5kaW5nQ29udGV4dChcInBhZ2VJbnRlcm5hbFwiKTtcblx0XHQob0ludGVybmFsTW9kZWxDb250ZXh0IGFzIGFueSkuc2V0UHJvcGVydHkoXCJlcnJvck5hdmlnYXRpb25TZWN0aW9uRmxhZ1wiLCB0cnVlKTtcblx0XHRjb25zdCBvSXRlbSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJpdGVtXCIpLFxuXHRcdFx0b01lc3NhZ2UgPSBvSXRlbS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCksXG5cdFx0XHRiSXNCYWNrZW5kTWVzc2FnZSA9IG5ldyBSZWdFeHAoXCJeL1wiKS50ZXN0KG9NZXNzYWdlLmdldFRhcmdldCgpKSxcblx0XHRcdG9WaWV3ID0gQ29yZS5ieUlkKHRoaXMuc1ZpZXdJZCkgYXMgVmlldztcblx0XHRsZXQgb0NvbnRyb2wsIHNTZWN0aW9uVGl0bGU7XG5cdFx0Y29uc3QgX2RlZmF1bHRGb2N1cyA9IGZ1bmN0aW9uIChtZXNzYWdlOiBhbnksIG1kY1RhYmxlOiBhbnkpIHtcblx0XHRcdGNvbnN0IGZvY3VzSW5mbyA9IHsgcHJldmVudFNjcm9sbDogdHJ1ZSwgdGFyZ2V0SW5mbzogbWVzc2FnZSB9O1xuXHRcdFx0bWRjVGFibGUuZm9jdXMoZm9jdXNJbmZvKTtcblx0XHR9O1xuXG5cdFx0Ly9jaGVjayBpZiB0aGUgcHJlc3NlZCBpdGVtIGlzIHJlbGF0ZWQgdG8gYSB0YWJsZSBjb250cm9sXG5cdFx0aWYgKG9JdGVtLmdldEdyb3VwTmFtZSgpLmluZGV4T2YoXCJUYWJsZTpcIikgIT09IC0xKSB7XG5cdFx0XHRsZXQgb1RhcmdldE1kY1RhYmxlOiBhbnk7XG5cdFx0XHRpZiAoYklzQmFja2VuZE1lc3NhZ2UpIHtcblx0XHRcdFx0b1RhcmdldE1kY1RhYmxlID0gb01lc3NhZ2UuY29udHJvbElkc1xuXHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKHNDb250cm9sSWQ6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0Y29uc3QgY29udHJvbCA9IENvcmUuYnlJZChzQ29udHJvbElkKTtcblx0XHRcdFx0XHRcdGNvbnN0IG9QYXJlbnRDb250cm9sID0gY29udHJvbCAmJiAoY29udHJvbC5nZXRQYXJlbnQoKSBhcyBhbnkpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9QYXJlbnRDb250cm9sICYmXG5cdFx0XHRcdFx0XHRcdG9QYXJlbnRDb250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgJiZcblx0XHRcdFx0XHRcdFx0b1BhcmVudENvbnRyb2wuZ2V0SGVhZGVyKCkgPT09IG9JdGVtLmdldEdyb3VwTmFtZSgpLnNwbGl0KFwiLCBUYWJsZTogXCIpWzFdXG5cdFx0XHRcdFx0XHRcdD8gb1BhcmVudENvbnRyb2xcblx0XHRcdFx0XHRcdFx0OiBudWxsO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LnJlZHVjZShmdW5jdGlvbiAoYWNjOiBhbnksIHZhbDogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdmFsID8gdmFsIDogYWNjO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAob1RhcmdldE1kY1RhYmxlKSB7XG5cdFx0XHRcdFx0c1NlY3Rpb25UaXRsZSA9IG9JdGVtLmdldEdyb3VwTmFtZSgpLnNwbGl0KFwiLCBcIilbMF07XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25UYWJsZUluSWNvblRhYkJhck1vZGUoXG5cdFx0XHRcdFx0XHRcdG9UYXJnZXRNZGNUYWJsZSxcblx0XHRcdFx0XHRcdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCxcblx0XHRcdFx0XHRcdFx0c1NlY3Rpb25UaXRsZVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGNvbnN0IG9SZWZFcnJvckNvbnRleHQgPSB0aGlzLl9nZXRUYWJsZVJlZkVycm9yQ29udGV4dChvVGFyZ2V0TWRjVGFibGUpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1JlZkVycm9yID0gb1JlZkVycm9yQ29udGV4dC5nZXRQcm9wZXJ0eShvSXRlbS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCkuZ2V0SWQoKSk7XG5cdFx0XHRcdFx0XHRjb25zdCBfc2V0Rm9jdXNPblRhcmdldEZpZWxkID0gYXN5bmMgKHRhcmdldE1kY1RhYmxlOiBhbnksIGlSb3dJbmRleDogbnVtYmVyKTogUHJvbWlzZTxhbnk+ID0+IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYVRhcmdldE1kY1RhYmxlUm93ID0gdGhpcy5fZ2V0TWRjVGFibGVSb3dzKHRhcmdldE1kY1RhYmxlKSxcblx0XHRcdFx0XHRcdFx0XHRpRmlyc3RWaXNpYmxlUm93ID0gdGhpcy5fZ2V0R3JpZFRhYmxlKHRhcmdldE1kY1RhYmxlKS5nZXRGaXJzdFZpc2libGVSb3coKTtcblx0XHRcdFx0XHRcdFx0aWYgKGFUYXJnZXRNZGNUYWJsZVJvdy5sZW5ndGggPiAwICYmIGFUYXJnZXRNZGNUYWJsZVJvd1swXSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9UYXJnZXRSb3cgPSBhVGFyZ2V0TWRjVGFibGVSb3dbaVJvd0luZGV4IC0gaUZpcnN0VmlzaWJsZVJvd10sXG5cdFx0XHRcdFx0XHRcdFx0XHRvVGFyZ2V0Q2VsbCA9IHRoaXMuZ2V0VGFyZ2V0Q2VsbChvVGFyZ2V0Um93LCBvTWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9UYXJnZXRDZWxsKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLnNldEZvY3VzVG9Db250cm9sKG9UYXJnZXRDZWxsKTtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdC8vIGNvbnRyb2wgbm90IGZvdW5kIG9uIHRhYmxlXG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBlcnJvclByb3BlcnR5ID0gb01lc3NhZ2UuZ2V0VGFyZ2V0KCkuc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGVycm9yUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0KG9WaWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsKS5zZXRQcm9wZXJ0eShcIi9tZXNzYWdlVGFyZ2V0UHJvcGVydHlcIiwgZXJyb3JQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5fbmF2aWdhdGlvbkNvbmZpZ3VyZWQodGFyZ2V0TWRjVGFibGUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiAob1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fcm91dGluZy5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1RhcmdldFJvdy5nZXRCaW5kaW5nQ29udGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0aWYgKG9UYXJnZXRNZGNUYWJsZS5kYXRhKFwidGFibGVUeXBlXCIpID09PSBcIkdyaWRUYWJsZVwiICYmIG9SZWZFcnJvci5yb3dJbmRleCAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBpRmlyc3RWaXNpYmxlUm93ID0gdGhpcy5fZ2V0R3JpZFRhYmxlKG9UYXJnZXRNZGNUYWJsZSkuZ2V0Rmlyc3RWaXNpYmxlUm93KCk7XG5cdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0YXdhaXQgb1RhcmdldE1kY1RhYmxlLnNjcm9sbFRvSW5kZXgob1JlZkVycm9yLnJvd0luZGV4KTtcblx0XHRcdFx0XHRcdFx0XHRjb25zdCBhVGFyZ2V0TWRjVGFibGVSb3cgPSB0aGlzLl9nZXRNZGNUYWJsZVJvd3Mob1RhcmdldE1kY1RhYmxlKTtcblx0XHRcdFx0XHRcdFx0XHRsZXQgaU5ld0ZpcnN0VmlzaWJsZVJvdywgYlNjcm9sbE5lZWRlZDtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYVRhcmdldE1kY1RhYmxlUm93Lmxlbmd0aCA+IDAgJiYgYVRhcmdldE1kY1RhYmxlUm93WzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpTmV3Rmlyc3RWaXNpYmxlUm93ID0gYVRhcmdldE1kY1RhYmxlUm93WzBdLmdldFBhcmVudCgpLmdldEZpcnN0VmlzaWJsZVJvdygpO1xuXHRcdFx0XHRcdFx0XHRcdFx0YlNjcm9sbE5lZWRlZCA9IGlGaXJzdFZpc2libGVSb3cgLSBpTmV3Rmlyc3RWaXNpYmxlUm93ICE9PSAwO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRsZXQgb1dhaXRDb250cm9sSWRBZGRlZDogUHJvbWlzZTx2b2lkPjtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYlNjcm9sbE5lZWRlZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly9UaGUgc2Nyb2xsVG9JbmRleCBmdW5jdGlvbiBkb2VzIG5vdCB3YWl0IGZvciB0aGUgVUkgdXBkYXRlLiBBcyBhIHdvcmthcm91bmQsIHBlbmRpbmcgYSBmaXggZnJvbSBNREMgKEJDUDogMjE3MDI1MTYzMSkgd2UgdXNlIHRoZSBldmVudCBcIlVJVXBkYXRlZFwiLlxuXHRcdFx0XHRcdFx0XHRcdFx0b1dhaXRDb250cm9sSWRBZGRlZCA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdENvcmUuYXR0YWNoRXZlbnQoXCJVSVVwZGF0ZWRcIiwgcmVzb2x2ZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0b1dhaXRDb250cm9sSWRBZGRlZCA9IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBvV2FpdENvbnRyb2xJZEFkZGVkO1xuXHRcdFx0XHRcdFx0XHRcdHNldFRpbWVvdXQoYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZm9jdXNPblRhcmdldEZpZWxkID0gYXdhaXQgX3NldEZvY3VzT25UYXJnZXRGaWVsZChvVGFyZ2V0TWRjVGFibGUsIG9SZWZFcnJvci5yb3dJbmRleCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZm9jdXNPblRhcmdldEZpZWxkID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRfZGVmYXVsdEZvY3VzKG9NZXNzYWdlLCBvVGFyZ2V0TWRjVGFibGUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBmb2N1c2luZyBvbiBlcnJvclwiKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChvVGFyZ2V0TWRjVGFibGUuZGF0YShcInRhYmxlVHlwZVwiKSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIiAmJiBvUmVmRXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sID0gYXdhaXQgdGhpcy5mb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2woXG5cdFx0XHRcdFx0XHRcdFx0b1ZpZXcsXG5cdFx0XHRcdFx0XHRcdFx0b01lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdFx0b1RhcmdldE1kY1RhYmxlLFxuXHRcdFx0XHRcdFx0XHRcdG9SZWZFcnJvci5yb3dJbmRleFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRpZiAoZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdFx0XHRcdF9kZWZhdWx0Rm9jdXMob01lc3NhZ2UsIG9UYXJnZXRNZGNUYWJsZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sKG9WaWV3LCBvTWVzc2FnZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJGYWlsIHRvIG5hdmlnYXRlIHRvIEVycm9yIGNvbnRyb2xcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvQ29udHJvbCA9IENvcmUuYnlJZChvTWVzc2FnZS5jb250cm9sSWRzWzBdKTtcblx0XHRcdFx0Ly9JZiB0aGUgY29udHJvbCB1bmRlcmx5aW5nIHRoZSBmcm9udEVuZCBtZXNzYWdlIGlzIG5vdCB3aXRoaW4gdGhlIGN1cnJlbnQgc2VjdGlvbiwgd2UgZmlyc3QgZ28gaW50byB0aGUgdGFyZ2V0IHNlY3Rpb246XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RlZFNlY3Rpb246IGFueSA9IENvcmUuYnlJZCh0aGlzLm9PYmplY3RQYWdlTGF5b3V0LmdldFNlbGVjdGVkU2VjdGlvbigpKTtcblx0XHRcdFx0aWYgKG9TZWxlY3RlZFNlY3Rpb24/LmZpbmRFbGVtZW50cyh0cnVlKS5pbmRleE9mKG9Db250cm9sKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRzU2VjdGlvblRpdGxlID0gb0l0ZW0uZ2V0R3JvdXBOYW1lKCkuc3BsaXQoXCIsIFwiKVswXTtcblx0XHRcdFx0XHR0aGlzLl9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZSh0aGlzLm9PYmplY3RQYWdlTGF5b3V0LCBzU2VjdGlvblRpdGxlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnNldEZvY3VzVG9Db250cm9sKG9Db250cm9sKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gZm9jdXMgb24gY29udHJvbFxuXHRcdFx0c1NlY3Rpb25UaXRsZSA9IG9JdGVtLmdldEdyb3VwTmFtZSgpLnNwbGl0KFwiLCBcIilbMF07XG5cdFx0XHR0aGlzLl9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZSh0aGlzLm9PYmplY3RQYWdlTGF5b3V0LCBzU2VjdGlvblRpdGxlKTtcblx0XHRcdHRoaXMuZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sKG9WaWV3LCBvTWVzc2FnZSk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyBhIHRhYmxlIGNlbGwgdGFyZ2V0ZWQgYnkgYSBtZXNzYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0Um93IEEgdGFibGUgcm93XG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBtZXNzYWdlIE1lc3NhZ2UgdGFyZ2V0aW5nIGEgY2VsbFxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSBSZXR1cm5zIHRoZSBjZWxsXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRnZXRUYXJnZXRDZWxsKHRhcmdldFJvdzogQ29sdW1uTGlzdEl0ZW0sIG1lc3NhZ2U6IE1lc3NhZ2UpOiBVSTVFbGVtZW50IHwgbnVsbCB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIG1lc3NhZ2UuZ2V0Q29udHJvbElkcygpLmxlbmd0aCA+IDBcblx0XHRcdD8gbWVzc2FnZVxuXHRcdFx0XHRcdC5nZXRDb250cm9sSWRzKClcblx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChjb250cm9sSWQ6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0Y29uc3QgaXNDb250cm9sSW5UYWJsZSA9ICh0YXJnZXRSb3cgYXMgYW55KS5maW5kRWxlbWVudHModHJ1ZSwgZnVuY3Rpb24gKGVsZW06IGFueSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gZWxlbS5nZXRJZCgpID09PSBjb250cm9sSWQ7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHJldHVybiBpc0NvbnRyb2xJblRhYmxlLmxlbmd0aCA+IDAgPyBDb3JlLmJ5SWQoY29udHJvbElkKSA6IG51bGw7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhY2M6IGFueSwgdmFsOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiB2YWwgPyB2YWwgOiBhY2M7XG5cdFx0XHRcdFx0fSlcblx0XHRcdDogbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBGb2N1cyBvbiB0aGUgY29udHJvbCB0YXJnZXRlZCBieSBhIG1lc3NhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSB2aWV3IFRoZSBjdXJyZW50IHZpZXdcblx0ICogQHBhcmFtIHtvYmplY3R9IG1lc3NhZ2UgVGhlIG1lc3NhZ2UgdGFyZ2V0aW5nIHRoZSBjb250cm9sIG9uIHdoaWNoIHdlIHdhbnQgdG8gc2V0IHRoZSBmb2N1c1xuXHQgKiBAcGFyYW0ge29iamVjdH0gdGFyZ2V0TWRjVGFibGUgVGhlIHRhYmxlIHRhcmdldGVkIGJ5IHRoZSBtZXNzYWdlIChvcHRpb25hbClcblx0ICogQHBhcmFtIHtudW1iZXJ9IHJvd0luZGV4IFRoZSByb3cgaW5kZXggb2YgdGhlIHRhYmxlIHRhcmdldGVkIGJ5IHRoZSBtZXNzYWdlIChvcHRpb25hbClcblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFzeW5jIGZvY3VzT25NZXNzYWdlVGFyZ2V0Q29udHJvbCh2aWV3OiBWaWV3LCBtZXNzYWdlOiBNZXNzYWdlLCB0YXJnZXRNZGNUYWJsZT86IGFueSwgcm93SW5kZXg/OiBudW1iZXIpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IGFBbGxWaWV3RWxlbWVudHMgPSB2aWV3LmZpbmRFbGVtZW50cyh0cnVlKTtcblx0XHRjb25zdCBhRXJyb25lb3VzQ29udHJvbHMgPSBtZXNzYWdlXG5cdFx0XHQuZ2V0Q29udHJvbElkcygpXG5cdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChzQ29udHJvbElkOiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIGFBbGxWaWV3RWxlbWVudHMuc29tZShmdW5jdGlvbiAob0VsZW0pIHtcblx0XHRcdFx0XHRyZXR1cm4gb0VsZW0uZ2V0SWQoKSA9PT0gc0NvbnRyb2xJZCAmJiBvRWxlbS5nZXREb21SZWYoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdFx0Lm1hcChmdW5jdGlvbiAoc0NvbnRyb2xJZDogc3RyaW5nKSB7XG5cdFx0XHRcdHJldHVybiBDb3JlLmJ5SWQoc0NvbnRyb2xJZCk7XG5cdFx0XHR9KTtcblx0XHRjb25zdCBhTm90VGFibGVFcnJvbmVvdXNDb250cm9scyA9IGFFcnJvbmVvdXNDb250cm9scy5maWx0ZXIoZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRcdHJldHVybiAhb0VsZW0uaXNBKFwic2FwLm0uVGFibGVcIikgJiYgIW9FbGVtLmlzQShcInNhcC51aS50YWJsZS5UYWJsZVwiKTtcblx0XHR9KTtcblx0XHQvL1RoZSBmb2N1cyBpcyBzZXQgb24gTm90IFRhYmxlIGNvbnRyb2wgaW4gcHJpb3JpdHlcblx0XHRpZiAoYU5vdFRhYmxlRXJyb25lb3VzQ29udHJvbHMubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5zZXRGb2N1c1RvQ29udHJvbChhTm90VGFibGVFcnJvbmVvdXNDb250cm9sc1swXSk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSBpZiAoYUVycm9uZW91c0NvbnRyb2xzLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IGFUYXJnZXRNZGNUYWJsZVJvdyA9IHRhcmdldE1kY1RhYmxlXG5cdFx0XHRcdD8gdGFyZ2V0TWRjVGFibGUuZmluZEVsZW1lbnRzKHRydWUsIGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0VsZW0uaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKTtcblx0XHRcdFx0ICB9KVxuXHRcdFx0XHQ6IFtdO1xuXHRcdFx0aWYgKGFUYXJnZXRNZGNUYWJsZVJvdy5sZW5ndGggPiAwICYmIGFUYXJnZXRNZGNUYWJsZVJvd1swXSkge1xuXHRcdFx0XHRjb25zdCBvVGFyZ2V0Um93ID0gYVRhcmdldE1kY1RhYmxlUm93W3Jvd0luZGV4IGFzIG51bWJlcl07XG5cdFx0XHRcdGNvbnN0IG9UYXJnZXRDZWxsID0gdGhpcy5nZXRUYXJnZXRDZWxsKG9UYXJnZXRSb3csIG1lc3NhZ2UpIGFzIGFueTtcblx0XHRcdFx0aWYgKG9UYXJnZXRDZWxsKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RhcmdldEZpZWxkID0gb1RhcmdldENlbGwuaXNBKFwic2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEFQSVwiKVxuXHRcdFx0XHRcdFx0PyBvVGFyZ2V0Q2VsbC5nZXRDb250ZW50KCkuZ2V0Q29udGVudEVkaXQoKVswXVxuXHRcdFx0XHRcdFx0OiBvVGFyZ2V0Q2VsbC5nZXRJdGVtcygpWzBdLmdldENvbnRlbnQoKS5nZXRDb250ZW50RWRpdCgpWzBdO1xuXHRcdFx0XHRcdHRoaXMuc2V0Rm9jdXNUb0NvbnRyb2wob1RhcmdldEZpZWxkKTtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGVycm9yUHJvcGVydHkgPSBtZXNzYWdlLmdldFRhcmdldCgpLnNwbGl0KFwiL1wiKS5wb3AoKTtcblx0XHRcdFx0XHRpZiAoZXJyb3JQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0KHZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwpLnNldFByb3BlcnR5KFwiL21lc3NhZ2VUYXJnZXRQcm9wZXJ0eVwiLCBlcnJvclByb3BlcnR5KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHRoaXMuX25hdmlnYXRpb25Db25maWd1cmVkKHRhcmdldE1kY1RhYmxlKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICh2aWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX3JvdXRpbmcubmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KG9UYXJnZXRSb3cuZ2V0QmluZGluZ0NvbnRleHQoKSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIG9iaiBUaGUgbWVzc2FnZSBvYmplY3Rcblx0ICogQHBhcmFtIGFTZWN0aW9ucyBUaGUgYXJyYXkgb2Ygc2VjdGlvbnMgaW4gdGhlIG9iamVjdCBwYWdlXG5cdCAqIEByZXR1cm5zIFRoZSByYW5rIG9mIHRoZSBtZXNzYWdlXG5cdCAqL1xuXHRfZ2V0TWVzc2FnZVJhbmsob2JqOiBhbnksIGFTZWN0aW9uczogYW55W10pIHtcblx0XHRpZiAoYVNlY3Rpb25zKSB7XG5cdFx0XHRsZXQgc2VjdGlvbiwgYVN1YlNlY3Rpb25zLCBzdWJTZWN0aW9uLCBqLCBrLCBhRWxlbWVudHMsIGFBbGxFbGVtZW50cywgc2VjdGlvblJhbms7XG5cdFx0XHRmb3IgKGogPSBhU2VjdGlvbnMubGVuZ3RoIC0gMTsgaiA+PSAwOyAtLWopIHtcblx0XHRcdFx0Ly8gTG9vcCBvdmVyIGFsbCBzZWN0aW9uc1xuXHRcdFx0XHRzZWN0aW9uID0gYVNlY3Rpb25zW2pdO1xuXHRcdFx0XHRhU3ViU2VjdGlvbnMgPSBzZWN0aW9uLmdldFN1YlNlY3Rpb25zKCk7XG5cdFx0XHRcdGZvciAoayA9IGFTdWJTZWN0aW9ucy5sZW5ndGggLSAxOyBrID49IDA7IC0taykge1xuXHRcdFx0XHRcdC8vIExvb3Agb3ZlciBhbGwgc3ViLXNlY3Rpb25zXG5cdFx0XHRcdFx0c3ViU2VjdGlvbiA9IGFTdWJTZWN0aW9uc1trXTtcblx0XHRcdFx0XHRhQWxsRWxlbWVudHMgPSBzdWJTZWN0aW9uLmZpbmRFbGVtZW50cyh0cnVlKTsgLy8gR2V0IGFsbCBlbGVtZW50cyBpbnNpZGUgYSBzdWItc2VjdGlvblxuXHRcdFx0XHRcdC8vVHJ5IHRvIGZpbmQgdGhlIGNvbnRyb2wgMSBpbnNpZGUgdGhlIHN1YiBzZWN0aW9uXG5cdFx0XHRcdFx0YUVsZW1lbnRzID0gYUFsbEVsZW1lbnRzLmZpbHRlcih0aGlzLl9mbkZpbHRlclVwb25JZC5iaW5kKHRoaXMsIG9iai5nZXRDb250cm9sSWQoKSkpO1xuXHRcdFx0XHRcdHNlY3Rpb25SYW5rID0gaiArIDE7XG5cdFx0XHRcdFx0aWYgKGFFbGVtZW50cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRpZiAoc2VjdGlvbi5nZXRWaXNpYmxlKCkgJiYgc3ViU2VjdGlvbi5nZXRWaXNpYmxlKCkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKCFvYmouaGFzT3duUHJvcGVydHkoXCJzZWN0aW9uTmFtZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRcdG9iai5zZWN0aW9uTmFtZSA9IHNlY3Rpb24uZ2V0VGl0bGUoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShcInN1YlNlY3Rpb25OYW1lXCIpKSB7XG5cdFx0XHRcdFx0XHRcdFx0b2JqLnN1YlNlY3Rpb25OYW1lID0gc3ViU2VjdGlvbi5nZXRUaXRsZSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzZWN0aW9uUmFuayAqIDEwICsgKGsgKyAxKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIGlmIHNlY3Rpb24gb3Igc3Vic2VjdGlvbiBpcyBpbnZpc2libGUgdGhlbiBncm91cCBuYW1lIHdvdWxkIGJlIExhc3QgQWN0aW9uXG5cdFx0XHRcdFx0XHRcdC8vIHNvIHJhbmtpbmcgc2hvdWxkIGJlIGxvd2VyXG5cdFx0XHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly9pZiBzdWIgc2VjdGlvbiB0aXRsZSBpcyBPdGhlciBtZXNzYWdlcywgd2UgcmV0dXJuIGEgaGlnaCBudW1iZXIocmFuayksIHdoaWNoIGVuc3VyZXNcblx0XHRcdC8vdGhhdCBtZXNzYWdlcyBiZWxvbmdpbmcgdG8gdGhpcyBzdWIgc2VjdGlvbiBhbHdheXMgY29tZSBsYXRlciBpbiBtZXNzYWdlUG9wb3ZlclxuXHRcdFx0aWYgKCFvYmouc2VjdGlvbk5hbWUgJiYgIW9iai5zdWJTZWN0aW9uTmFtZSAmJiBvYmoucGVyc2lzdGVudCkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiA5OTk7XG5cdFx0fVxuXHRcdHJldHVybiA5OTk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHNldCB0aGUgZmlsdGVycyBiYXNlZCB1cG9uIHRoZSBtZXNzYWdlIGl0ZW1zXG5cdCAqIFRoZSBkZXNpcmVkIGZpbHRlciBvcGVyYXRpb24gaXM6XG5cdCAqICggZmlsdGVycyBwcm92aWRlZCBieSB1c2VyICYmICggdmFsaWRhdGlvbiA9IHRydWUgJiYgQ29udHJvbCBzaG91bGQgYmUgcHJlc2VudCBpbiB2aWV3ICkgfHwgbWVzc2FnZXMgZm9yIHRoZSBjdXJyZW50IG1hdGNoaW5nIGNvbnRleHQgKS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9hcHBseUZpbHRlcnNBbmRTb3J0KCkge1xuXHRcdGxldCBvVmFsaWRhdGlvbkZpbHRlcnMsXG5cdFx0XHRvVmFsaWRhdGlvbkFuZENvbnRleHRGaWx0ZXIsXG5cdFx0XHRvRmlsdGVycyxcblx0XHRcdHNQYXRoLFxuXHRcdFx0b1NvcnRlcixcblx0XHRcdG9EaWFsb2dGaWx0ZXIsXG5cdFx0XHRvYmplY3RQYWdlTGF5b3V0U2VjdGlvbnM6IGFueSA9IG51bGw7XG5cdFx0Y29uc3QgYVVzZXJEZWZpbmVkRmlsdGVyOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IGZpbHRlck91dE1lc3NhZ2VzSW5EaWFsb2cgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBmblRlc3QgPSAoYUNvbnRyb2xJZHM6IHN0cmluZ1tdKSA9PiB7XG5cdFx0XHRcdGxldCBpbmRleCA9IEluZmluaXR5LFxuXHRcdFx0XHRcdG9Db250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKSBhcyBhbnk7XG5cdFx0XHRcdGNvbnN0IGVycm9yRmllbGRDb250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKTtcblx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmllbGRSYW5raW5EaWFsb2cgPVxuXHRcdFx0XHRcdFx0b0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2dcblx0XHRcdFx0XHRcdFx0PyAoZXJyb3JGaWVsZENvbnRyb2w/LmdldFBhcmVudCgpIGFzIGFueSkuZmluZEVsZW1lbnRzKHRydWUpLmluZGV4T2YoZXJyb3JGaWVsZENvbnRyb2wpXG5cdFx0XHRcdFx0XHRcdDogSW5maW5pdHk7XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sIGluc3RhbmNlb2YgRGlhbG9nKSB7XG5cdFx0XHRcdFx0XHRpZiAoaW5kZXggPiBmaWVsZFJhbmtpbkRpYWxvZykge1xuXHRcdFx0XHRcdFx0XHRpbmRleCA9IGZpZWxkUmFua2luRGlhbG9nO1xuXHRcdFx0XHRcdFx0XHQvLyBTZXQgdGhlIGZvY3VzIHRvIHRoZSBkaWFsb2cncyBjb250cm9sXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0Rm9jdXNUb0NvbnRyb2woZXJyb3JGaWVsZENvbnRyb2wpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gbWVzc2FnZXMgZm9yIHNhcC5tLkRpYWxvZyBzaG91bGQgbm90IGFwcGVhciBpbiB0aGUgbWVzc2FnZSBidXR0b25cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7XG5cdFx0XHRcdHBhdGg6IFwiY29udHJvbElkc1wiLFxuXHRcdFx0XHR0ZXN0OiBmblRlc3QsXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IHRydWVcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0Ly9GaWx0ZXIgZnVuY3Rpb24gdG8gdmVyaWZ5IGlmIHRoZSBjb250cm9sIGlzIHBhcnQgb2YgdGhlIGN1cnJlbnQgdmlldyBvciBub3Rcblx0XHRmdW5jdGlvbiBnZXRDaGVja0NvbnRyb2xJblZpZXdGaWx0ZXIoKSB7XG5cdFx0XHRjb25zdCBmblRlc3QgPSBmdW5jdGlvbiAoYUNvbnRyb2xJZHM6IHN0cmluZ1tdKSB7XG5cdFx0XHRcdGlmICghYUNvbnRyb2xJZHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBvQ29udHJvbDogYW55ID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKTtcblx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sLmdldElkKCkgPT09IHNWaWV3SWQpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAob0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2cpIHtcblx0XHRcdFx0XHRcdC8vIG1lc3NhZ2VzIGZvciBzYXAubS5EaWFsb2cgc2hvdWxkIG5vdCBhcHBlYXIgaW4gdGhlIG1lc3NhZ2UgYnV0dG9uXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0cGF0aDogXCJjb250cm9sSWRzXCIsXG5cdFx0XHRcdHRlc3Q6IGZuVGVzdCxcblx0XHRcdFx0Y2FzZVNlbnNpdGl2ZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmICghdGhpcy5zVmlld0lkKSB7XG5cdFx0XHR0aGlzLnNWaWV3SWQgPSB0aGlzLl9nZXRWaWV3SWQodGhpcy5nZXRJZCgpKSBhcyBzdHJpbmc7XG5cdFx0fVxuXHRcdGNvbnN0IHNWaWV3SWQgPSB0aGlzLnNWaWV3SWQ7XG5cdFx0Ly9BZGQgdGhlIGZpbHRlcnMgcHJvdmlkZWQgYnkgdGhlIHVzZXJcblx0XHRjb25zdCBhQ3VzdG9tRmlsdGVycyA9IHRoaXMuZ2V0QWdncmVnYXRpb24oXCJjdXN0b21GaWx0ZXJzXCIpIGFzIGFueTtcblx0XHRpZiAoYUN1c3RvbUZpbHRlcnMpIHtcblx0XHRcdGFDdXN0b21GaWx0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGZpbHRlcjogYW55KSB7XG5cdFx0XHRcdGFVc2VyRGVmaW5lZEZpbHRlci5wdXNoKFxuXHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogZmlsdGVyLmdldFByb3BlcnR5KFwicGF0aFwiKSxcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBmaWx0ZXIuZ2V0UHJvcGVydHkoXCJvcGVyYXRvclwiKSxcblx0XHRcdFx0XHRcdHZhbHVlMTogZmlsdGVyLmdldFByb3BlcnR5KFwidmFsdWUxXCIpLFxuXHRcdFx0XHRcdFx0dmFsdWUyOiBmaWx0ZXIuZ2V0UHJvcGVydHkoXCJ2YWx1ZTJcIilcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRpZiAoIW9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0dGhpcy5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdHJldHVybjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1BhdGggPSBvQmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0Ly9GaWx0ZXIgZm9yIGZpbHRlcmluZyBvdXQgb25seSB2YWxpZGF0aW9uIG1lc3NhZ2VzIHdoaWNoIGFyZSBjdXJyZW50bHkgcHJlc2VudCBpbiB0aGUgdmlld1xuXHRcdFx0b1ZhbGlkYXRpb25GaWx0ZXJzID0gbmV3IEZpbHRlcih7XG5cdFx0XHRcdGZpbHRlcnM6IFtcblx0XHRcdFx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRcdHBhdGg6IFwidmFsaWRhdGlvblwiLFxuXHRcdFx0XHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiB0cnVlXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0Z2V0Q2hlY2tDb250cm9sSW5WaWV3RmlsdGVyKClcblx0XHRcdFx0XSxcblx0XHRcdFx0YW5kOiB0cnVlXG5cdFx0XHR9KTtcblx0XHRcdC8vRmlsdGVyIGZvciBmaWx0ZXJpbmcgb3V0IHRoZSBib3VuZCBtZXNzYWdlcyBpLmUgdGFyZ2V0IHN0YXJ0cyB3aXRoIHRoZSBjb250ZXh0IHBhdGhcblx0XHRcdG9WYWxpZGF0aW9uQW5kQ29udGV4dEZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRmaWx0ZXJzOiBbXG5cdFx0XHRcdFx0b1ZhbGlkYXRpb25GaWx0ZXJzLFxuXHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogXCJ0YXJnZXRcIixcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5TdGFydHNXaXRoLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiBzUGF0aFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdFx0b0RpYWxvZ0ZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRmaWx0ZXJzOiBbZmlsdGVyT3V0TWVzc2FnZXNJbkRpYWxvZygpXVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9WYWxpZGF0aW9uQ29udGV4dERpYWxvZ0ZpbHRlcnMgPSBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IFtvVmFsaWRhdGlvbkFuZENvbnRleHRGaWx0ZXIsIG9EaWFsb2dGaWx0ZXJdLFxuXHRcdFx0YW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0Ly8gYW5kIGZpbmFsbHkgLSBpZiB0aGVyZSBhbnkgLSBhZGQgY3VzdG9tIGZpbHRlciAodmlhIE9SKVxuXHRcdGlmIChhVXNlckRlZmluZWRGaWx0ZXIubGVuZ3RoID4gMCkge1xuXHRcdFx0b0ZpbHRlcnMgPSBuZXcgKEZpbHRlciBhcyBhbnkpKHtcblx0XHRcdFx0ZmlsdGVyczogW2FVc2VyRGVmaW5lZEZpbHRlciwgb1ZhbGlkYXRpb25Db250ZXh0RGlhbG9nRmlsdGVyc10sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRmlsdGVycyA9IG9WYWxpZGF0aW9uQ29udGV4dERpYWxvZ0ZpbHRlcnM7XG5cdFx0fVxuXHRcdHRoaXMub0l0ZW1CaW5kaW5nLmZpbHRlcihvRmlsdGVycyk7XG5cdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXQodGhpcywgdGhpcy5vT2JqZWN0UGFnZUxheW91dCk7XG5cdFx0Ly8gV2Ugc3VwcG9ydCBzb3J0aW5nIG9ubHkgZm9yIE9iamVjdFBhZ2VMYXlvdXQgdXNlLWNhc2UuXG5cdFx0aWYgKHRoaXMub09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdG9Tb3J0ZXIgPSBuZXcgKFNvcnRlciBhcyBhbnkpKFwiXCIsIG51bGwsIG51bGwsIChvYmoxOiBhbnksIG9iajI6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoIW9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucykge1xuXHRcdFx0XHRcdG9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucyA9IHRoaXMub09iamVjdFBhZ2VMYXlvdXQgJiYgdGhpcy5vT2JqZWN0UGFnZUxheW91dC5nZXRTZWN0aW9ucygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHJhbmtBID0gdGhpcy5fZ2V0TWVzc2FnZVJhbmsob2JqMSwgb2JqZWN0UGFnZUxheW91dFNlY3Rpb25zKTtcblx0XHRcdFx0Y29uc3QgcmFua0IgPSB0aGlzLl9nZXRNZXNzYWdlUmFuayhvYmoyLCBvYmplY3RQYWdlTGF5b3V0U2VjdGlvbnMpO1xuXHRcdFx0XHRpZiAocmFua0EgPCByYW5rQikge1xuXHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmFua0EgPiByYW5rQikge1xuXHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLm9JdGVtQmluZGluZy5zb3J0KG9Tb3J0ZXIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NvbnRyb2xJZFxuXHQgKiBAcGFyYW0gb0l0ZW1cblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29udHJvbCBJRCBtYXRjaGVzIHRoZSBpdGVtIElEXG5cdCAqL1xuXHRfZm5GaWx0ZXJVcG9uSWQoc0NvbnRyb2xJZDogc3RyaW5nLCBvSXRlbTogYW55KSB7XG5cdFx0cmV0dXJuIHNDb250cm9sSWQgPT09IG9JdGVtLmdldElkKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBzZWN0aW9uIGJhc2VkIG9uIHNlY3Rpb24gdGl0bGUgYW5kIHZpc2liaWxpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvT2JqZWN0UGFnZSBPYmplY3QgcGFnZS5cblx0ICogQHBhcmFtIHNTZWN0aW9uVGl0bGUgU2VjdGlvbiB0aXRsZS5cblx0ICogQHJldHVybnMgVGhlIHNlY3Rpb25cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRTZWN0aW9uQnlTZWN0aW9uVGl0bGUob09iamVjdFBhZ2U6IGFueSwgc1NlY3Rpb25UaXRsZTogc3RyaW5nKSB7XG5cdFx0bGV0IG9TZWN0aW9uO1xuXHRcdGlmIChzU2VjdGlvblRpdGxlKSB7XG5cdFx0XHRjb25zdCBhU2VjdGlvbnMgPSBvT2JqZWN0UGFnZS5nZXRTZWN0aW9ucygpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhU2VjdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGFTZWN0aW9uc1tpXS5nZXRWaXNpYmxlKCkgJiYgYVNlY3Rpb25zW2ldLmdldFRpdGxlKCkgPT09IHNTZWN0aW9uVGl0bGUpIHtcblx0XHRcdFx0XHRvU2VjdGlvbiA9IGFTZWN0aW9uc1tpXTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1NlY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGVzIHRvIHRoZSBzZWN0aW9uIGlmIHRoZSBvYmplY3QgcGFnZSB1c2VzIGFuIEljb25UYWJCYXIgYW5kIGlmIHRoZSBjdXJyZW50IHNlY3Rpb24gaXMgbm90IHRoZSB0YXJnZXQgb2YgdGhlIG5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvT2JqZWN0UGFnZSBPYmplY3QgcGFnZS5cblx0ICogQHBhcmFtIHNTZWN0aW9uVGl0bGUgU2VjdGlvbiB0aXRsZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZShvT2JqZWN0UGFnZTogYW55LCBzU2VjdGlvblRpdGxlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBiVXNlSWNvblRhYkJhciA9IG9PYmplY3RQYWdlLmdldFVzZUljb25UYWJCYXIoKTtcblx0XHRpZiAoYlVzZUljb25UYWJCYXIpIHtcblx0XHRcdGNvbnN0IG9TZWN0aW9uID0gdGhpcy5fZ2V0U2VjdGlvbkJ5U2VjdGlvblRpdGxlKG9PYmplY3RQYWdlLCBzU2VjdGlvblRpdGxlKTtcblx0XHRcdGNvbnN0IHNTZWxlY3RlZFNlY3Rpb25JZCA9IG9PYmplY3RQYWdlLmdldFNlbGVjdGVkU2VjdGlvbigpO1xuXHRcdFx0aWYgKG9TZWN0aW9uICYmIHNTZWxlY3RlZFNlY3Rpb25JZCAhPT0gb1NlY3Rpb24uZ2V0SWQoKSkge1xuXHRcdFx0XHRvT2JqZWN0UGFnZS5zZXRTZWxlY3RlZFNlY3Rpb24ob1NlY3Rpb24uZ2V0SWQoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25UYWJsZUluSWNvblRhYkJhck1vZGUob1RhYmxlOiBhbnksIG9PYmplY3RQYWdlOiBhbnksIHNTZWN0aW9uVGl0bGU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRjb25zdCBvVGFibGVDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb09QQ29udGV4dCA9IG9PYmplY3RQYWdlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3QgYlNob3VsZFdhaXRGb3JUYWJsZVJlZnJlc2ggPSAhKG9UYWJsZUNvbnRleHQgPT09IG9PUENvbnRleHQpO1xuXHRcdHRoaXMuX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25Jbkljb25UYWJCYXJNb2RlKG9PYmplY3RQYWdlLCBzU2VjdGlvblRpdGxlKTtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6IEZ1bmN0aW9uKSB7XG5cdFx0XHRpZiAoYlNob3VsZFdhaXRGb3JUYWJsZVJlZnJlc2gpIHtcblx0XHRcdFx0b1Jvd0JpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiY2hhbmdlXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgTWRjVGFibGUgaWYgaXQgaXMgZm91bmQgYW1vbmcgYW55IG9mIHRoZSBwYXJlbnQgZWxlbWVudHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRWxlbWVudCBDb250cm9sXG5cdCAqIEByZXR1cm5zIE1EQyB0YWJsZSB8fCB1bmRlZmluZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRNZGNUYWJsZShvRWxlbWVudDogYW55KSB7XG5cdFx0Ly9jaGVjayBpZiB0aGUgZWxlbWVudCBoYXMgYSB0YWJsZSB3aXRoaW4gYW55IG9mIGl0cyBwYXJlbnRzXG5cdFx0bGV0IG9QYXJlbnRFbGVtZW50ID0gb0VsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0d2hpbGUgKG9QYXJlbnRFbGVtZW50ICYmICFvUGFyZW50RWxlbWVudC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpKSB7XG5cdFx0XHRvUGFyZW50RWxlbWVudCA9IG9QYXJlbnRFbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1BhcmVudEVsZW1lbnQgJiYgb1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSA/IG9QYXJlbnRFbGVtZW50IDogdW5kZWZpbmVkO1xuXHR9XG5cblx0X2dldEdyaWRUYWJsZShvTWRjVGFibGU6IGFueSkge1xuXHRcdHJldHVybiBvTWRjVGFibGUuZmluZEVsZW1lbnRzKHRydWUsIGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRvRWxlbS5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikgJiZcblx0XHRcdFx0LyoqIFdlIGNoZWNrIHRoZSBlbGVtZW50IGJlbG9uZ3MgdG8gdGhlIE1kY1RhYmxlIDoqL1xuXHRcdFx0XHRvRWxlbS5nZXRQYXJlbnQoKSA9PT0gb01kY1RhYmxlXG5cdFx0XHQpO1xuXHRcdH0pWzBdO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgdGFibGUgcm93IChpZiBhdmFpbGFibGUpIGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRWxlbWVudCBDb250cm9sXG5cdCAqIEByZXR1cm5zIFRhYmxlIHJvdyB8fCB1bmRlZmluZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRUYWJsZVJvdyhvRWxlbWVudDogYW55KSB7XG5cdFx0bGV0IG9QYXJlbnRFbGVtZW50ID0gb0VsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0d2hpbGUgKFxuXHRcdFx0b1BhcmVudEVsZW1lbnQgJiZcblx0XHRcdCFvUGFyZW50RWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpICYmXG5cdFx0XHQhb1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLkNyZWF0aW9uUm93XCIpICYmXG5cdFx0XHQhb1BhcmVudEVsZW1lbnQuaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKVxuXHRcdCkge1xuXHRcdFx0b1BhcmVudEVsZW1lbnQgPSBvUGFyZW50RWxlbWVudC5nZXRQYXJlbnQoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9QYXJlbnRFbGVtZW50ICYmXG5cdFx0XHQob1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLlJvd1wiKSB8fFxuXHRcdFx0XHRvUGFyZW50RWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuQ3JlYXRpb25Sb3dcIikgfHxcblx0XHRcdFx0b1BhcmVudEVsZW1lbnQuaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKSlcblx0XHRcdD8gb1BhcmVudEVsZW1lbnRcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgaW5kZXggb2YgdGhlIHRhYmxlIHJvdyBjb250YWluaW5nIHRoZSBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0VsZW1lbnQgQ29udHJvbFxuXHQgKiBAcmV0dXJucyBSb3cgaW5kZXggfHwgdW5kZWZpbmVkXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0VGFibGVSb3dJbmRleChvRWxlbWVudDogYW55KSB7XG5cdFx0Y29uc3Qgb1RhYmxlUm93ID0gdGhpcy5fZ2V0VGFibGVSb3cob0VsZW1lbnQpO1xuXHRcdGxldCBpUm93SW5kZXg7XG5cdFx0aWYgKG9UYWJsZVJvdy5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpKSB7XG5cdFx0XHRpUm93SW5kZXggPSBvVGFibGVSb3cuZ2V0SW5kZXgoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aVJvd0luZGV4ID0gb1RhYmxlUm93XG5cdFx0XHRcdC5nZXRUYWJsZSgpXG5cdFx0XHRcdC5nZXRJdGVtcygpXG5cdFx0XHRcdC5maW5kSW5kZXgoZnVuY3Rpb24gKGVsZW1lbnQ6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBlbGVtZW50LmdldElkKCkgPT09IG9UYWJsZVJvdy5nZXRJZCgpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGlSb3dJbmRleDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGluZGV4IG9mIHRoZSB0YWJsZSBjb2x1bW4gY29udGFpbmluZyB0aGUgZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIG9FbGVtZW50IENvbnRyb2xcblx0ICogQHJldHVybnMgQ29sdW1uIGluZGV4IHx8IHVuZGVmaW5lZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldFRhYmxlQ29sdW1uSW5kZXgob0VsZW1lbnQ6IGFueSkge1xuXHRcdGNvbnN0IGdldFRhcmdldENlbGxJbmRleCA9IGZ1bmN0aW9uIChlbGVtZW50OiBhbnksIG9UYXJnZXRSb3c6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9UYXJnZXRSb3cuZ2V0Q2VsbHMoKS5maW5kSW5kZXgoZnVuY3Rpb24gKG9DZWxsOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9DZWxsLmdldElkKCkgPT09IGVsZW1lbnQuZ2V0SWQoKTtcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0Y29uc3QgZ2V0VGFyZ2V0Q29sdW1uSW5kZXggPSBmdW5jdGlvbiAoZWxlbWVudDogYW55LCBvVGFyZ2V0Um93OiBhbnkpIHtcblx0XHRcdGxldCBvVGFyZ2V0RWxlbWVudCA9IGVsZW1lbnQuZ2V0UGFyZW50KCksXG5cdFx0XHRcdGlUYXJnZXRDZWxsSW5kZXggPSBnZXRUYXJnZXRDZWxsSW5kZXgob1RhcmdldEVsZW1lbnQsIG9UYXJnZXRSb3cpO1xuXHRcdFx0d2hpbGUgKG9UYXJnZXRFbGVtZW50ICYmIGlUYXJnZXRDZWxsSW5kZXggPCAwKSB7XG5cdFx0XHRcdG9UYXJnZXRFbGVtZW50ID0gb1RhcmdldEVsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdGlUYXJnZXRDZWxsSW5kZXggPSBnZXRUYXJnZXRDZWxsSW5kZXgob1RhcmdldEVsZW1lbnQsIG9UYXJnZXRSb3cpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGlUYXJnZXRDZWxsSW5kZXg7XG5cdFx0fTtcblx0XHRjb25zdCBvVGFyZ2V0Um93ID0gdGhpcy5fZ2V0VGFibGVSb3cob0VsZW1lbnQpO1xuXHRcdGxldCBpVGFyZ2V0Q29sdW1uSW5kZXg7XG5cdFx0aVRhcmdldENvbHVtbkluZGV4ID0gZ2V0VGFyZ2V0Q29sdW1uSW5kZXgob0VsZW1lbnQsIG9UYXJnZXRSb3cpO1xuXHRcdGlmIChvVGFyZ2V0Um93LmlzQShcInNhcC51aS50YWJsZS5DcmVhdGlvblJvd1wiKSkge1xuXHRcdFx0Y29uc3Qgc1RhcmdldENlbGxJZCA9IG9UYXJnZXRSb3cuZ2V0Q2VsbHMoKVtpVGFyZ2V0Q29sdW1uSW5kZXhdLmdldElkKCksXG5cdFx0XHRcdGFUYWJsZUNvbHVtbnMgPSBvVGFyZ2V0Um93LmdldFRhYmxlKCkuZ2V0Q29sdW1ucygpO1xuXHRcdFx0aVRhcmdldENvbHVtbkluZGV4ID0gYVRhYmxlQ29sdW1ucy5maW5kSW5kZXgoZnVuY3Rpb24gKGNvbHVtbjogYW55KSB7XG5cdFx0XHRcdGlmIChjb2x1bW4uZ2V0Q3JlYXRpb25UZW1wbGF0ZSgpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHNUYXJnZXRDZWxsSWQuc2VhcmNoKGNvbHVtbi5nZXRDcmVhdGlvblRlbXBsYXRlKCkuZ2V0SWQoKSkgPiAtMSA/IHRydWUgOiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gaVRhcmdldENvbHVtbkluZGV4O1xuXHR9XG5cblx0X2dldE1kY1RhYmxlUm93cyhvTWRjVGFibGU6IGFueSkge1xuXHRcdHJldHVybiBvTWRjVGFibGUuZmluZEVsZW1lbnRzKHRydWUsIGZ1bmN0aW9uIChvRWxlbTogYW55KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRvRWxlbS5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpICYmXG5cdFx0XHRcdC8qKiBXZSBjaGVjayB0aGUgZWxlbWVudCBiZWxvbmdzIHRvIHRoZSBNZGMgVGFibGUgOiovXG5cdFx0XHRcdG9FbGVtLmdldFRhYmxlKCkuZ2V0UGFyZW50KCkgPT09IG9NZGNUYWJsZVxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXG5cdF9nZXRPYmplY3RQYWdlTGF5b3V0KG9FbGVtZW50OiBhbnksIG9PYmplY3RQYWdlTGF5b3V0OiBhbnkpIHtcblx0XHRpZiAob09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdHJldHVybiBvT2JqZWN0UGFnZUxheW91dDtcblx0XHR9XG5cdFx0b09iamVjdFBhZ2VMYXlvdXQgPSBvRWxlbWVudDtcblx0XHQvL0l0ZXJhdGUgb3ZlciBwYXJlbnQgdGlsbCB5b3UgaGF2ZSBub3QgcmVhY2hlZCB0aGUgb2JqZWN0IHBhZ2UgbGF5b3V0XG5cdFx0d2hpbGUgKG9PYmplY3RQYWdlTGF5b3V0ICYmICFvT2JqZWN0UGFnZUxheW91dC5pc0EoXCJzYXAudXhhcC5PYmplY3RQYWdlTGF5b3V0XCIpKSB7XG5cdFx0XHRvT2JqZWN0UGFnZUxheW91dCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gb09iamVjdFBhZ2VMYXlvdXQ7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB0byBjaGVjayBpZiBhIG5hdmlnYXRpb24gaXMgY29uZmlndXJlZCBmcm9tIHRoZSB0YWJsZSB0byBhIHN1YiBvYmplY3QgcGFnZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHRhYmxlIE1kY1RhYmxlXG5cdCAqIEByZXR1cm5zIEVpdGhlciB0cnVlIG9yIGZhbHNlXG5cdCAqL1xuXHRfbmF2aWdhdGlvbkNvbmZpZ3VyZWQodGFibGU6IGFueSk6IGJvb2xlYW4ge1xuXHRcdC8vIFRPRE86IHRoaXMgbG9naWMgd291bGQgYmUgbW92ZWQgdG8gY2hlY2sgdGhlIHNhbWUgYXQgdGhlIHRlbXBsYXRlIHRpbWUgdG8gYXZvaWQgdGhlIHNhbWUgY2hlY2sgaGFwcGVuaW5nIG11bHRpcGxlIHRpbWVzLlxuXHRcdGNvbnN0IGNvbXBvbmVudCA9IHNhcC51aS5yZXF1aXJlKFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCIpLFxuXHRcdFx0bmF2T2JqZWN0ID0gdGFibGUgJiYgY29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKHRhYmxlKSAmJiBjb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IodGFibGUpLmdldE5hdmlnYXRpb24oKTtcblx0XHRsZXQgc3ViT1BDb25maWd1cmVkID0gZmFsc2UsXG5cdFx0XHRuYXZDb25maWd1cmVkID0gZmFsc2U7XG5cdFx0aWYgKG5hdk9iamVjdCAmJiBPYmplY3Qua2V5cyhuYXZPYmplY3QpLmluZGV4T2YodGFibGUuZ2V0Um93QmluZGluZygpLnNQYXRoKSAhPT0gLTEpIHtcblx0XHRcdHN1Yk9QQ29uZmlndXJlZCA9XG5cdFx0XHRcdG5hdk9iamVjdFt0YWJsZT8uZ2V0Um93QmluZGluZygpLnNQYXRoXSAmJlxuXHRcdFx0XHRuYXZPYmplY3RbdGFibGU/LmdldFJvd0JpbmRpbmcoKS5zUGF0aF0uZGV0YWlsICYmXG5cdFx0XHRcdG5hdk9iamVjdFt0YWJsZT8uZ2V0Um93QmluZGluZygpLnNQYXRoXS5kZXRhaWwucm91dGVcblx0XHRcdFx0XHQ/IHRydWVcblx0XHRcdFx0XHQ6IGZhbHNlO1xuXHRcdH1cblx0XHRuYXZDb25maWd1cmVkID1cblx0XHRcdHN1Yk9QQ29uZmlndXJlZCAmJlxuXHRcdFx0dGFibGU/LmdldFJvd1NldHRpbmdzKCkuZ2V0Um93QWN0aW9ucygpICYmXG5cdFx0XHR0YWJsZT8uZ2V0Um93U2V0dGluZ3MoKS5nZXRSb3dBY3Rpb25zKClbMF0ubVByb3BlcnRpZXMudHlwZS5pbmRleE9mKFwiTmF2aWdhdGlvblwiKSAhPT0gLTE7XG5cdFx0cmV0dXJuIG5hdkNvbmZpZ3VyZWQ7XG5cdH1cblxuXHRzZXRGb2N1c1RvQ29udHJvbChjb250cm9sPzogVUk1RWxlbWVudCkge1xuXHRcdGNvbnN0IG1lc3NhZ2VQb3BvdmVyID0gdGhpcy5vTWVzc2FnZVBvcG92ZXI7XG5cdFx0aWYgKG1lc3NhZ2VQb3BvdmVyICYmIGNvbnRyb2wgJiYgY29udHJvbC5mb2N1cykge1xuXHRcdFx0Y29uc3QgZm5Gb2N1cyA9ICgpID0+IHtcblx0XHRcdFx0Y29udHJvbC5mb2N1cygpO1xuXHRcdFx0fTtcblx0XHRcdGlmICghbWVzc2FnZVBvcG92ZXIuaXNPcGVuKCkpIHtcblx0XHRcdFx0Ly8gd2hlbiBuYXZpZ2F0aW5nIHRvIHBhcmVudCBwYWdlIHRvIGNoaWxkIHBhZ2UgKG9uIGNsaWNrIG9mIG1lc3NhZ2UpLCB0aGUgY2hpbGQgcGFnZSBtaWdodCBoYXZlIGEgZm9jdXMgbG9naWMgdGhhdCBtaWdodCB1c2UgYSB0aW1lb3V0LlxuXHRcdFx0XHQvLyB3ZSB1c2UgdGhlIGJlbG93IHRpbWVvdXRzIHRvIG92ZXJyaWRlIHRoaXMgZm9jdXMgc28gdGhhdCB3ZSBmb2N1cyBvbiB0aGUgdGFyZ2V0IGNvbnRyb2wgb2YgdGhlIG1lc3NhZ2UgaW4gdGhlIGNoaWxkIHBhZ2UuXG5cdFx0XHRcdHNldFRpbWVvdXQoZm5Gb2N1cywgMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBmbk9uQ2xvc2UgPSAoKSA9PiB7XG5cdFx0XHRcdFx0c2V0VGltZW91dChmbkZvY3VzLCAwKTtcblx0XHRcdFx0XHRtZXNzYWdlUG9wb3Zlci5kZXRhY2hFdmVudChcImFmdGVyQ2xvc2VcIiwgZm5PbkNsb3NlKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0bWVzc2FnZVBvcG92ZXIuYXR0YWNoRXZlbnQoXCJhZnRlckNsb3NlXCIsIGZuT25DbG9zZSk7XG5cdFx0XHRcdG1lc3NhZ2VQb3BvdmVyLmNsb3NlKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdExvZy53YXJuaW5nKFwiRkUgVjQgOiBNZXNzYWdlQnV0dG9uIDogZWxlbWVudCBkb2Vzbid0IGhhdmUgZm9jdXMgbWV0aG9kIGZvciBmb2N1c2luZy5cIik7XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lc3NhZ2VCdXR0b247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O01BK0NNQSxhQUFhLFdBRGxCQyxjQUFjLENBQUMsc0NBQXNDLENBQUMsVUFRckRDLFdBQVcsQ0FBQztJQUFFQyxJQUFJLEVBQUUsc0NBQXNDO0lBQUVDLFFBQVEsRUFBRSxJQUFJO0lBQUVDLFlBQVksRUFBRTtFQUFlLENBQUMsQ0FBQyxVQUczR0MsS0FBSyxFQUFFO0lBQUE7SUFUUix1QkFBWUMsRUFBb0MsRUFBRUMsUUFBaUMsRUFBRTtNQUFBO01BQ3BGO01BQ0E7TUFDQSwyQkFBTUQsRUFBRSxFQUFFQyxRQUFRLENBQUM7TUFBQztNQUFBO01BQUEsTUFlYkMsaUJBQWlCLEdBQUcsRUFBRTtNQUFBLE1BSXRCQyxPQUFPLEdBQUcsRUFBRTtNQUFBLE1BRVpDLGVBQWUsR0FBRyxFQUFFO01BQUE7SUFwQjVCO0lBQUM7SUFBQSxPQXNCREMsSUFBSSxHQUFKLGdCQUFPO01BQ05DLE1BQU0sQ0FBQ0MsU0FBUyxDQUFDRixJ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
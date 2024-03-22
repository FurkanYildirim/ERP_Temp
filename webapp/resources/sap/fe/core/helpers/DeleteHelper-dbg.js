/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/editFlow/draft", "sap/m/CheckBox", "sap/m/MessageToast", "sap/m/Text"], function (Log, draft, CheckBox, MessageToast, Text) {
  "use strict";

  var DeleteOptionTypes;
  (function (DeleteOptionTypes) {
    DeleteOptionTypes["deletableContexts"] = "deletableContexts";
    DeleteOptionTypes["draftsWithDeletableActive"] = "draftsWithDeletableActive";
    DeleteOptionTypes["unSavedContexts"] = "unSavedContexts";
    DeleteOptionTypes["draftsWithNonDeletableActive"] = "draftsWithNonDeletableActive";
    DeleteOptionTypes["draftsToDeleteBeforeActive"] = "draftsToDeleteBeforeActive";
  })(DeleteOptionTypes || (DeleteOptionTypes = {}));
  var DeleteDialogContentControl;
  (function (DeleteDialogContentControl) {
    DeleteDialogContentControl["CHECKBOX"] = "checkBox";
    DeleteDialogContentControl["TEXT"] = "text";
  })(DeleteDialogContentControl || (DeleteDialogContentControl = {}));
  function getUpdatedSelections(internalModelContext, type, selectedContexts, contextsToRemove) {
    const retSelectedContexts = [...selectedContexts];
    contextsToRemove.forEach(context => {
      const idx = retSelectedContexts.indexOf(context);
      if (idx !== -1) {
        retSelectedContexts.splice(idx, 1);
      }
    });
    internalModelContext.setProperty(type, []);
    return retSelectedContexts;
  }
  function clearSelectedContextsForOption(internalModelContext, option) {
    let selectedContexts = internalModelContext.getProperty("selectedContexts") || [];
    if (option.type === DeleteOptionTypes.deletableContexts) {
      selectedContexts = getUpdatedSelections(internalModelContext, DeleteOptionTypes.deletableContexts, selectedContexts, internalModelContext.getProperty(DeleteOptionTypes.deletableContexts) || []);
      const draftSiblingPairs = internalModelContext.getProperty(DeleteOptionTypes.draftsWithDeletableActive) || [];
      const drafts = draftSiblingPairs.map(contextPair => {
        return contextPair.draft;
      });
      selectedContexts = getUpdatedSelections(internalModelContext, DeleteOptionTypes.draftsWithDeletableActive, selectedContexts, drafts);
    } else {
      const contextsToRemove = internalModelContext.getProperty(option.type) || [];
      selectedContexts = getUpdatedSelections(internalModelContext, option.type, selectedContexts, contextsToRemove);
    }
    internalModelContext.setProperty("selectedContexts", selectedContexts);
    internalModelContext.setProperty("numberOfSelectedContexts", selectedContexts.length);
  }
  function afterDeleteProcess(parameters, options, contexts, resourceModel, lastDeletedRowIndex) {
    const {
      internalModelContext,
      entitySetName
    } = parameters;
    if (internalModelContext) {
      if (internalModelContext.getProperty("deleteEnabled") != undefined) {
        options.forEach(option => {
          // if an option is selected, then it is deleted. So, we need to remove them from selected contexts.
          if (option.selected) {
            clearSelectedContextsForOption(internalModelContext, option);
          }
        });
      }
      // if atleast one of the options is not selected, then the delete button needs to be enabled.
      internalModelContext.setProperty("deleteEnabled", options.some(option => !option.selected));
    }
    if (contexts.length === 1) {
      MessageToast.show(resourceModel.getText("C_TRANSACTION_HELPER_DELETE_TOAST_SINGULAR", undefined, entitySetName));
    } else {
      MessageToast.show(resourceModel.getText("C_TRANSACTION_HELPER_DELETE_TOAST_PLURAL", undefined, entitySetName));
    }
    deleteHelper.setFocusAfterDelete(parameters.parentControl, contexts.length, lastDeletedRowIndex);
  }
  async function setFocusAfterDelete(table, deletedRowsCount, lastDeletedRowIndex) {
    var _table$getRowBinding;
    const tableRowsCount = (_table$getRowBinding = table.getRowBinding()) === null || _table$getRowBinding === void 0 ? void 0 : _table$getRowBinding.getCount();
    const originalTableRowsCount = (tableRowsCount ?? 0) + deletedRowsCount;
    let nextFocusRowIndex;
    if (lastDeletedRowIndex !== -1 && tableRowsCount !== undefined && tableRowsCount > 0) {
      //If the last row is deleted, move the focus to previous row to it
      if (lastDeletedRowIndex === originalTableRowsCount - 1) {
        nextFocusRowIndex = tableRowsCount - 1;
        //For the normal scenario, move the focus to the next row
      } else {
        nextFocusRowIndex = lastDeletedRowIndex - deletedRowsCount + 1;
      }
      await table.focusRow(nextFocusRowIndex, false);
    } else {
      // For zero rows or default case, move focus to table
      table.focus();
    }
  }
  function getLockedContextUser(lockedContext) {
    const draftAdminData = lockedContext.getObject()["DraftAdministrativeData"];
    return draftAdminData && draftAdminData["InProcessByUser"] || "";
  }
  function getLockedObjectsText(resourceModel, numberOfSelectedContexts, lockedContexts) {
    let retTxt = "";
    if (numberOfSelectedContexts === 1 && lockedContexts.length === 1) {
      //only one unsaved object
      const lockedUser = getLockedContextUser(lockedContexts[0]);
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", [lockedUser]);
    } else if (lockedContexts.length == 1) {
      const lockedUser = getLockedContextUser(lockedContexts[0]);
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_LOCKED", [numberOfSelectedContexts, lockedUser]);
    } else if (lockedContexts.length > 1) {
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED", [lockedContexts.length, numberOfSelectedContexts]);
    }
    return retTxt;
  }
  function getNonDeletableActivesOfDraftsText(resourceModel, numberOfDrafts, totalDeletable) {
    let retTxt = "";
    if (totalDeletable === numberOfDrafts) {
      if (numberOfDrafts === 1) {
        retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFT_OF_NON_DELETABLE_ACTIVE");
      } else {
        retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_ONLY_DRAFTS_OF_NON_DELETABLE_ACTIVE");
      }
    } else if (numberOfDrafts === 1) {
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFT_OF_NON_DELETABLE_ACTIVE");
    } else {
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_DRAFTS_OF_NON_DELETABLE_ACTIVE");
    }
    return retTxt;
  }
  function getUnSavedContextUser(unSavedContext) {
    const draftAdminData = unSavedContext.getObject()["DraftAdministrativeData"];
    let sLastChangedByUser = "";
    if (draftAdminData) {
      sLastChangedByUser = draftAdminData["LastChangedByUserDescription"] || draftAdminData["LastChangedByUser"] || "";
    }
    return sLastChangedByUser;
  }
  function getUnsavedContextsText(resourceModel, numberOfSelectedContexts, unSavedContexts, totalDeletable) {
    let infoTxt = "",
      optionTxt = "",
      optionWithoutTxt = false;
    if (numberOfSelectedContexts === 1 && unSavedContexts.length === 1) {
      //only one unsaved object are selected
      const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
      infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES", [lastChangedByUser]);
      optionWithoutTxt = true;
    } else if (numberOfSelectedContexts === unSavedContexts.length) {
      //only multiple unsaved objects are selected
      infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES_MULTIPLE_OBJECTS");
      optionWithoutTxt = true;
    } else if (totalDeletable === unSavedContexts.length) {
      // non-deletable/locked exists, all deletable are unsaved by others
      if (unSavedContexts.length === 1) {
        const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
        infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_SINGULAR", [lastChangedByUser]);
      } else {
        infoTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_PLURAL");
      }
      optionWithoutTxt = true;
    } else if (totalDeletable > unSavedContexts.length) {
      // non-deletable/locked exists, deletable include unsaved and other types.
      if (unSavedContexts.length === 1) {
        const lastChangedByUser = getUnSavedContextUser(unSavedContexts[0]);
        optionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_SINGULAR", [lastChangedByUser]);
      } else {
        optionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_PLURAL");
      }
    }
    return {
      infoTxt,
      optionTxt,
      optionWithoutTxt
    };
  }
  function getNonDeletableText(mParameters, totalNumDeletableContexts, resourceModel) {
    const {
      numberOfSelectedContexts,
      entitySetName,
      lockedContexts = [],
      draftsWithNonDeletableActive = []
    } = mParameters;
    const nonDeletableContexts = numberOfSelectedContexts - (lockedContexts.length + totalNumDeletableContexts - draftsWithNonDeletableActive.length);
    let retTxt = "";
    if (nonDeletableContexts > 0 && (totalNumDeletableContexts === 0 || draftsWithNonDeletableActive.length === totalNumDeletableContexts)) {
      // 1. None of the ccontexts are deletable
      // 2. Only drafts of non deletable contexts exist.
      if (lockedContexts.length > 0) {
        // Locked contexts exist
        if (nonDeletableContexts === 1) {
          retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_SINGULAR");
        } else {
          retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_ALL_REMAINING_NON_DELETABLE_PLURAL");
        }
      } else if (nonDeletableContexts === 1) {
        // Only pure non-deletable contexts exist single
        retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_AND_ONE_OBJECT_NON_DELETABLE", undefined, entitySetName);
      } else {
        // Only pure non-deletable contexts exist multiple
        retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_MULTIPLE_AND_ALL_OBJECT_NON_DELETABLE", undefined, entitySetName);
      }
    } else if (nonDeletableContexts === 1) {
      // deletable and non-deletable exists together, single
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_NON_DELETABLE", [numberOfSelectedContexts], entitySetName);
    } else if (nonDeletableContexts > 1) {
      // deletable and non-deletable exists together, multiple
      retTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_NON_DELETABLE", [nonDeletableContexts, numberOfSelectedContexts], entitySetName);
    }
    return retTxt ? new Text({
      text: retTxt
    }) : undefined;
  }
  function getConfirmedDeletableContext(contexts, options) {
    return options.reduce((result, option) => {
      return option.selected && option.type !== DeleteOptionTypes.draftsToDeleteBeforeActive ? result.concat(option.contexts) : result;
    }, contexts);
  }
  function getDraftsToDeleteBeforeActive(options) {
    const contexts = [];
    return options.reduce((result, option) => {
      return option.selected && option.type === DeleteOptionTypes.draftsToDeleteBeforeActive ? result.concat(option.contexts) : result;
    }, contexts);
  }
  function updateDraftOptionsForDeletableTexts(mParameters, vContexts, totalDeletable, resourceModel, items, options) {
    const {
      numberOfSelectedContexts,
      draftsWithDeletableActive,
      unSavedContexts,
      lockedContexts,
      draftsWithNonDeletableActive
    } = mParameters;
    let lockedContextsTxt = "";

    // drafts with active
    if (draftsWithDeletableActive.length > 0) {
      const draftsToDeleteBeforeActive = [];
      draftsWithDeletableActive.forEach(deletableDraftInfo => {
        // In either cases, if an own draft is locked or not the draft needs to be discarded before deleting active record.
        draftsToDeleteBeforeActive.push(deletableDraftInfo.draft);
        vContexts.push(deletableDraftInfo.siblingInfo.targetContext);
      });
      if (draftsToDeleteBeforeActive.length > 0) {
        options.push({
          type: DeleteOptionTypes.draftsToDeleteBeforeActive,
          contexts: draftsToDeleteBeforeActive,
          selected: true
        });
      }
    }

    // items locked msg
    if (lockedContexts.length > 0) {
      lockedContextsTxt = deleteHelper.getLockedObjectsText(resourceModel, numberOfSelectedContexts, lockedContexts) || "";
      items.push(new Text({
        text: lockedContextsTxt
      }));
    }

    // non deletable msg
    const nonDeletableExists = numberOfSelectedContexts != totalDeletable - draftsWithNonDeletableActive.length + lockedContexts.length;
    const nonDeletableTextCtrl = nonDeletableExists && deleteHelper.getNonDeletableText(mParameters, totalDeletable, resourceModel);
    if (nonDeletableTextCtrl) {
      items.push(nonDeletableTextCtrl);
    }

    // option: unsaved changes by others
    if (unSavedContexts.length > 0) {
      const unsavedChangesTxts = deleteHelper.getUnsavedContextsText(resourceModel, numberOfSelectedContexts, unSavedContexts, totalDeletable) || {};
      if (unsavedChangesTxts.infoTxt) {
        items.push(new Text({
          text: unsavedChangesTxts.infoTxt
        }));
      }
      if (unsavedChangesTxts.optionTxt || unsavedChangesTxts.optionWithoutTxt) {
        options.push({
          type: DeleteOptionTypes.unSavedContexts,
          contexts: unSavedContexts,
          text: unsavedChangesTxts.optionTxt,
          selected: true,
          control: DeleteDialogContentControl.CHECKBOX
        });
      }
    }

    // option: drafts with active not deletable
    if (draftsWithNonDeletableActive.length > 0) {
      const nonDeletableActivesOfDraftsText = deleteHelper.getNonDeletableActivesOfDraftsText(resourceModel, draftsWithNonDeletableActive.length, totalDeletable) || "";
      if (nonDeletableActivesOfDraftsText) {
        options.push({
          type: DeleteOptionTypes.draftsWithNonDeletableActive,
          contexts: draftsWithNonDeletableActive,
          text: nonDeletableActivesOfDraftsText,
          selected: true,
          control: totalDeletable > 0 ? DeleteDialogContentControl.CHECKBOX : DeleteDialogContentControl.TEXT
        });
      }
    }
  }
  function updateContentForDeleteDialog(options, items) {
    if (options.length === 1) {
      // Single option doesn't need checkBox
      const option = options[0];
      if (option.text) {
        items.push(new Text({
          text: option.text
        }));
      }
    } else if (options.length > 1) {
      // Multiple Options

      // Texts
      options.forEach(option => {
        if (option.control === "text" && option.text) {
          items.push(new Text({
            text: option.text
          }));
        }
      });
      // CheckBoxs
      options.forEach(option => {
        if (option.control === "checkBox" && option.text) {
          items.push(new CheckBox({
            text: option.text,
            selected: true,
            select: function (oEvent) {
              const checkBox = oEvent.getSource();
              const selected = checkBox.getSelected();
              option.selected = selected;
            }
          }));
        }
      });
    }
  }

  /**
   * Get the selected record in UI for text rather than the context to delete.
   *
   * @param mParameters Delete parameters and information of selected contexts.
   * @param contextToDelete Context to check.
   * @returns Context for delete.
   */
  function _getOriginalSelectedRecord(mParameters, contextToDelete) {
    const {
      draftsWithDeletableActive
    } = mParameters;
    const ret = draftsWithDeletableActive.find(draftSiblingPair => draftSiblingPair.siblingInfo.targetContext === contextToDelete);
    return ret !== null && ret !== void 0 && ret.draft ? ret.draft : contextToDelete;
  }

  /**
   * Get options possible for delete of selected contexts.
   *
   * @param mParameters Delete parameters and information of selected contexts.
   * @param directDeletableContexts Contexts that can be deletable directly.
   * @param resourceModel Resource model.
   * @returns Options that are possible for selected records.
   */
  function getOptionsForDeletableTexts(mParameters, directDeletableContexts, resourceModel) {
    const {
      numberOfSelectedContexts,
      entitySetName,
      parentControl,
      description,
      lockedContexts,
      draftsWithNonDeletableActive,
      unSavedContexts
    } = mParameters;
    const totalDeletable = directDeletableContexts.length + draftsWithNonDeletableActive.length + unSavedContexts.length;
    const nonDeletableContexts = numberOfSelectedContexts - (lockedContexts.length + totalDeletable - draftsWithNonDeletableActive.length);
    const options = [];
    if (numberOfSelectedContexts === 1 && numberOfSelectedContexts === directDeletableContexts.length) {
      // single deletable context
      const oTable = parentControl;
      const sKey = oTable && oTable.getParent().getIdentifierColumn();
      let txt;
      let aParams = [];
      if (sKey) {
        const descriptionPath = description && description.path;
        let singleContext = directDeletableContexts[0];
        let oLineContextData = singleContext.getObject();
        if (!oLineContextData || Object.keys(oLineContextData).length === 0) {
          // In case original selected record is draft(in UI). The Active record needs to be deleted(directDeletableContexts has active record), but data is not requested. We get data from the draft.
          singleContext = _getOriginalSelectedRecord(mParameters, singleContext);
          oLineContextData = singleContext.getObject();
        }
        const sKeyValue = sKey ? oLineContextData[sKey] : undefined;
        const sDescription = descriptionPath && oLineContextData[descriptionPath];
        if (sKeyValue) {
          if (sDescription && description && sKey !== description.path) {
            aParams = [sKeyValue + " ", sDescription];
          } else {
            aParams = [sKeyValue, ""];
          }
          txt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", aParams, entitySetName);
        } else {
          txt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, entitySetName);
        }
      } else {
        txt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, entitySetName);
      }
      options.push({
        type: DeleteOptionTypes.deletableContexts,
        contexts: directDeletableContexts,
        text: txt,
        selected: true,
        control: DeleteDialogContentControl.TEXT
      });
    } else if (unSavedContexts.length !== totalDeletable && numberOfSelectedContexts > 0 && (directDeletableContexts.length > 0 || unSavedContexts.length > 0 && draftsWithNonDeletableActive.length > 0)) {
      if (numberOfSelectedContexts > directDeletableContexts.length && nonDeletableContexts + lockedContexts.length > 0) {
        // other types exists with pure deletable ones
        let deletableOptionTxt = "";
        if (totalDeletable === 1) {
          deletableOptionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR_NON_DELETABLE", undefined, entitySetName);
        } else {
          deletableOptionTxt = resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL_NON_DELETABLE", undefined, entitySetName);
        }
        options.unshift({
          type: DeleteOptionTypes.deletableContexts,
          contexts: directDeletableContexts,
          text: deletableOptionTxt,
          selected: true,
          control: DeleteDialogContentControl.TEXT
        });
      } else {
        // only deletable
        const allDeletableTxt = totalDeletable === 1 ? resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", undefined, entitySetName) : resourceModel.getText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL", undefined, entitySetName);
        options.push({
          type: DeleteOptionTypes.deletableContexts,
          contexts: directDeletableContexts,
          text: allDeletableTxt,
          selected: true,
          control: DeleteDialogContentControl.TEXT
        });
      }
    }
    return options;
  }
  async function deleteConfirmHandler(options, mParameters, messageHandler, resourceModel, appComponent, draftEnabled) {
    try {
      const contexts = deleteHelper.getConfirmedDeletableContext([], options);
      const lastDeletedRowIndex = contexts[contexts.length - 1].getIndex() ?? -1;
      const draftsToDeleteBeforeActive = getDraftsToDeleteBeforeActive(options);
      const {
        beforeDeleteCallBack,
        parentControl
      } = mParameters;
      if (beforeDeleteCallBack) {
        await beforeDeleteCallBack({
          contexts: contexts
        });
      }
      if (contexts && contexts.length) {
        try {
          const enableStrictHandling = contexts.length === 1 ? true : false;
          const draftErrors = [];
          await Promise.allSettled(draftsToDeleteBeforeActive.map(async function (context) {
            try {
              return await draft.deleteDraft(context, appComponent, enableStrictHandling);
            } catch (e) {
              Log.error(`FE : core : DeleteHelper : Error while discarding draft with path : ${context.getPath()}`);
              draftErrors.push(e);
            }
          }));
          await Promise.all(contexts.map(function (context) {
            if (draftEnabled && !context.getProperty("IsActiveEntity")) {
              //delete the draft
              return draft.deleteDraft(context, appComponent, enableStrictHandling);
            }
            return context.delete();
          }));
          await deleteHelper.afterDeleteProcess(mParameters, options, contexts, resourceModel, lastDeletedRowIndex);
          if (draftErrors.length > 0) {
            throw Error(`FE : core : DeleteHelper : Errors on draft delete : ${draftErrors}`);
          }
        } catch (error) {
          await messageHandler.showMessageDialog({
            control: parentControl
          });
          // re-throw error to enforce rejecting the general promise
          throw error;
        }
      }
    } catch (oError) {
      await messageHandler.showMessages();
      // re-throw error to enforce rejecting the general promise
      throw oError;
    }
  }

  // Table Runtime Helpers:

  /* refreshes data in internal model relevant for enablement of delete button according to selected contexts
  relevant data are: deletableContexts, draftsWithDeletableActive, draftsWithNonDeletableActive, unSavedContexts, deleteEnabled
  not relevant: lockedContexts
  */
  async function updateDeleteInfoForSelectedContexts(internalModelContext, selectedContexts) {
    const contextInfos = selectedContexts.map(context => {
      // assuming metaContext is the same for all contexts, still not relying on this assumption
      const metaContext = context.getModel().getMetaModel().getMetaContext(context.getCanonicalPath());
      const deletablePath = metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable/$Path");
      const staticDeletable = !deletablePath && metaContext.getProperty("@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable") !== false;
      // default values according to non-draft case (sticky behaves the same as non-draft from UI point of view regarding deletion)
      const info = {
        context: context,
        isDraftRoot: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftRoot"),
        isDraftNode: !!metaContext.getProperty("@com.sap.vocabularies.Common.v1.DraftNode"),
        isActive: true,
        hasActive: false,
        hasDraft: false,
        locked: false,
        deletable: deletablePath ? context.getProperty(deletablePath) : staticDeletable,
        siblingPromise: Promise.resolve(undefined),
        siblingInfo: undefined,
        siblingDeletable: false
      };
      if (info.isDraftRoot) {
        var _context$getObject;
        info.locked = !!((_context$getObject = context.getObject("DraftAdministrativeData")) !== null && _context$getObject !== void 0 && _context$getObject.InProcessByUser);
        info.hasDraft = context.getProperty("HasDraftEntity");
      }
      if (info.isDraftRoot) {
        info.isActive = context.getProperty("IsActiveEntity");
        info.hasActive = context.getProperty("HasActiveEntity");
        if (!info.isActive && info.hasActive) {
          // get sibling contexts (only relevant for draft root, not for nodes)
          // draft.computeSiblingInformation expects draft root as first parameter - if we are on a subnode, this is not given
          // - done wrong also above, but seems not to break anything
          // - why is draft.computeSiblingInformation not able to calculate draft root on its own?!
          // - and why is it not able to deal with contexts not draft enabled (of course they never have a sibling - could just return undefined)
          info.siblingPromise = draft.computeSiblingInformation(context, context).then(async siblingInformation => {
            // For draftWithDeletableActive bucket, currently also siblingInformation is put into internalModel and used
            // from there in case of deletion. Therefore, sibling needs to be retrieved in case of staticDeletable.
            // Possible improvement: Only read siblingInfo here if needed for determination of delete button enablement,
            // in other cases, read it only if deletion really happens.
            info.siblingInfo = siblingInformation;
            if (deletablePath) {
              var _siblingInformation$t;
              info.siblingDeletable = await (siblingInformation === null || siblingInformation === void 0 ? void 0 : (_siblingInformation$t = siblingInformation.targetContext) === null || _siblingInformation$t === void 0 ? void 0 : _siblingInformation$t.requestProperty(deletablePath));
            } else {
              info.siblingDeletable = staticDeletable;
            }
          });
        }
      }
      return info;
    });
    // wait for all siblingPromises. If no sibling exists, promise is resolved to undefined (but it's still a promise)
    await Promise.all(contextInfos.map(info => info.siblingPromise));
    const buckets = [{
      key: "draftsWithDeletableActive",
      // only for draft root: In that case, the delete request needs to be sent for the active (i.e. the sibling),
      // while in draft node, the delete request needs to be send for the draft itself
      value: contextInfos.filter(info => info.isDraftRoot && !info.isActive && info.hasActive && info.siblingDeletable)
    }, {
      key: "draftsWithNonDeletableActive",
      // only for draft root: For draft node, we only rely on information in the draft itself (not its active sibling)
      // application has to take care to set this correctly (in case active sibling must not be deletable, activation
      // of draft with deleted node would also delte active sibling => deletion of draft node to be avoided)
      value: contextInfos.filter(info => info.isDraftRoot && !info.isActive && info.hasActive && !info.siblingDeletable)
    }, {
      key: "lockedContexts",
      value: contextInfos.filter(info => info.isDraftRoot && info.isActive && info.hasDraft && info.locked)
    }, {
      key: "unSavedContexts",
      value: contextInfos.filter(info => info.isDraftRoot && info.isActive && info.hasDraft && !info.locked)
    },
    // non-draft/sticky and deletable
    // active draft root without any draft and deletable
    // created draft root (regardless of deletable)
    // draft node only according to its annotation
    {
      key: "deletableContexts",
      value: contextInfos.filter(info => !info.isDraftRoot && !info.isDraftNode && info.deletable || info.isDraftRoot && info.isActive && !info.hasDraft && info.deletable || info.isDraftRoot && !info.isActive && !info.hasActive || info.isDraftNode && info.deletable)
    }];
    for (const {
      key,
      value
    } of buckets) {
      internalModelContext.setProperty(key,
      // Currently, bucket draftsWithDeletableActive has a different structure (containing also sibling information, which is used
      // in case of deletion). Possible improvement: Read sibling information only when needed, and build all buckets with same
      // structure. However, in that case siblingInformation might need to be read twice (if already needed for button enablement),
      // thus a buffer probably would make sense.
      value.map(info => key === "draftsWithDeletableActive" ? {
        draft: info.context,
        siblingInfo: info.siblingInfo
      } : info.context));
    }
  }
  const deleteHelper = {
    getNonDeletableText,
    deleteConfirmHandler,
    getOptionsForDeletableTexts,
    updateContentForDeleteDialog,
    updateDraftOptionsForDeletableTexts,
    getConfirmedDeletableContext,
    getLockedObjectsText,
    getUnsavedContextsText,
    getNonDeletableActivesOfDraftsText,
    afterDeleteProcess,
    updateDeleteInfoForSelectedContexts,
    DeleteOptionTypes,
    DeleteDialogContentControl,
    setFocusAfterDelete
  };
  return deleteHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEZWxldGVPcHRpb25UeXBlcyIsIkRlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sIiwiZ2V0VXBkYXRlZFNlbGVjdGlvbnMiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsInR5cGUiLCJzZWxlY3RlZENvbnRleHRzIiwiY29udGV4dHNUb1JlbW92ZSIsInJldFNlbGVjdGVkQ29udGV4dHMiLCJmb3JFYWNoIiwiY29udGV4dCIsImlkeCIsImluZGV4T2YiLCJzcGxpY2UiLCJzZXRQcm9wZXJ0eSIsImNsZWFyU2VsZWN0ZWRDb250ZXh0c0Zvck9wdGlvbiIsIm9wdGlvbiIsImdldFByb3BlcnR5IiwiZGVsZXRhYmxlQ29udGV4dHMiLCJkcmFmdFNpYmxpbmdQYWlycyIsImRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUiLCJkcmFmdHMiLCJtYXAiLCJjb250ZXh0UGFpciIsImRyYWZ0IiwibGVuZ3RoIiwiYWZ0ZXJEZWxldGVQcm9jZXNzIiwicGFyYW1ldGVycyIsIm9wdGlvbnMiLCJjb250ZXh0cyIsInJlc291cmNlTW9kZWwiLCJsYXN0RGVsZXRlZFJvd0luZGV4IiwiZW50aXR5U2V0TmFtZSIsInVuZGVmaW5lZCIsInNlbGVjdGVkIiwic29tZSIsIk1lc3NhZ2VUb2FzdCIsInNob3ciLCJnZXRUZXh0IiwiZGVsZXRlSGVscGVyIiwic2V0Rm9jdXNBZnRlckRlbGV0ZSIsInBhcmVudENvbnRyb2wiLCJ0YWJsZSIsImRlbGV0ZWRSb3dzQ291bnQiLCJ0YWJsZVJvd3NDb3VudCIsImdldFJvd0JpbmRpbmciLCJnZXRDb3VudCIsIm9yaWdpbmFsVGFibGVSb3dzQ291bnQiLCJuZXh0Rm9jdXNSb3dJbmRleCIsImZvY3VzUm93IiwiZm9jdXMiLCJnZXRMb2NrZWRDb250ZXh0VXNlciIsImxvY2tlZENvbnRleHQiLCJkcmFmdEFkbWluRGF0YSIsImdldE9iamVjdCIsImdldExvY2tlZE9iamVjdHNUZXh0IiwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIiwibG9ja2VkQ29udGV4dHMiLCJyZXRUeHQiLCJsb2NrZWRVc2VyIiwiZ2V0Tm9uRGVsZXRhYmxlQWN0aXZlc09mRHJhZnRzVGV4dCIsIm51bWJlck9mRHJhZnRzIiwidG90YWxEZWxldGFibGUiLCJnZXRVblNhdmVkQ29udGV4dFVzZXIiLCJ1blNhdmVkQ29udGV4dCIsInNMYXN0Q2hhbmdlZEJ5VXNlciIsImdldFVuc2F2ZWRDb250ZXh0c1RleHQiLCJ1blNhdmVkQ29udGV4dHMiLCJpbmZvVHh0Iiwib3B0aW9uVHh0Iiwib3B0aW9uV2l0aG91dFR4dCIsImxhc3RDaGFuZ2VkQnlVc2VyIiwiZ2V0Tm9uRGVsZXRhYmxlVGV4dCIsIm1QYXJhbWV0ZXJzIiwidG90YWxOdW1EZWxldGFibGVDb250ZXh0cyIsImRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUiLCJub25EZWxldGFibGVDb250ZXh0cyIsIlRleHQiLCJ0ZXh0IiwiZ2V0Q29uZmlybWVkRGVsZXRhYmxlQ29udGV4dCIsInJlZHVjZSIsInJlc3VsdCIsImRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlIiwiY29uY2F0IiwiZ2V0RHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUiLCJ1cGRhdGVEcmFmdE9wdGlvbnNGb3JEZWxldGFibGVUZXh0cyIsInZDb250ZXh0cyIsIml0ZW1zIiwibG9ja2VkQ29udGV4dHNUeHQiLCJkZWxldGFibGVEcmFmdEluZm8iLCJwdXNoIiwic2libGluZ0luZm8iLCJ0YXJnZXRDb250ZXh0Iiwibm9uRGVsZXRhYmxlRXhpc3RzIiwibm9uRGVsZXRhYmxlVGV4dEN0cmwiLCJ1bnNhdmVkQ2hhbmdlc1R4dHMiLCJjb250cm9sIiwiQ0hFQ0tCT1giLCJub25EZWxldGFibGVBY3RpdmVzT2ZEcmFmdHNUZXh0IiwiVEVYVCIsInVwZGF0ZUNvbnRlbnRGb3JEZWxldGVEaWFsb2ciLCJDaGVja0JveCIsInNlbGVjdCIsIm9FdmVudCIsImNoZWNrQm94IiwiZ2V0U291cmNlIiwiZ2V0U2VsZWN0ZWQiLCJfZ2V0T3JpZ2luYWxTZWxlY3RlZFJlY29yZCIsImNvbnRleHRUb0RlbGV0ZSIsInJldCIsImZpbmQiLCJkcmFmdFNpYmxpbmdQYWlyIiwiZ2V0T3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzIiwiZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMiLCJkZXNjcmlwdGlvbiIsIm9UYWJsZSIsInNLZXkiLCJnZXRQYXJlbnQiLCJnZXRJZGVudGlmaWVyQ29sdW1uIiwidHh0IiwiYVBhcmFtcyIsImRlc2NyaXB0aW9uUGF0aCIsInBhdGgiLCJzaW5nbGVDb250ZXh0Iiwib0xpbmVDb250ZXh0RGF0YSIsIk9iamVjdCIsImtleXMiLCJzS2V5VmFsdWUiLCJzRGVzY3JpcHRpb24iLCJkZWxldGFibGVPcHRpb25UeHQiLCJ1bnNoaWZ0IiwiYWxsRGVsZXRhYmxlVHh0IiwiZGVsZXRlQ29uZmlybUhhbmRsZXIiLCJtZXNzYWdlSGFuZGxlciIsImFwcENvbXBvbmVudCIsImRyYWZ0RW5hYmxlZCIsImdldEluZGV4IiwiYmVmb3JlRGVsZXRlQ2FsbEJhY2siLCJlbmFibGVTdHJpY3RIYW5kbGluZyIsImRyYWZ0RXJyb3JzIiwiUHJvbWlzZSIsImFsbFNldHRsZWQiLCJkZWxldGVEcmFmdCIsImUiLCJMb2ciLCJlcnJvciIsImdldFBhdGgiLCJhbGwiLCJkZWxldGUiLCJFcnJvciIsInNob3dNZXNzYWdlRGlhbG9nIiwib0Vycm9yIiwic2hvd01lc3NhZ2VzIiwidXBkYXRlRGVsZXRlSW5mb0ZvclNlbGVjdGVkQ29udGV4dHMiLCJjb250ZXh0SW5mb3MiLCJtZXRhQ29udGV4dCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiZ2V0TWV0YUNvbnRleHQiLCJnZXRDYW5vbmljYWxQYXRoIiwiZGVsZXRhYmxlUGF0aCIsInN0YXRpY0RlbGV0YWJsZSIsImluZm8iLCJpc0RyYWZ0Um9vdCIsImlzRHJhZnROb2RlIiwiaXNBY3RpdmUiLCJoYXNBY3RpdmUiLCJoYXNEcmFmdCIsImxvY2tlZCIsImRlbGV0YWJsZSIsInNpYmxpbmdQcm9taXNlIiwicmVzb2x2ZSIsInNpYmxpbmdEZWxldGFibGUiLCJJblByb2Nlc3NCeVVzZXIiLCJjb21wdXRlU2libGluZ0luZm9ybWF0aW9uIiwidGhlbiIsInNpYmxpbmdJbmZvcm1hdGlvbiIsInJlcXVlc3RQcm9wZXJ0eSIsImJ1Y2tldHMiLCJrZXkiLCJ2YWx1ZSIsImZpbHRlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRGVsZXRlSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgZHJhZnQsIHsgU2libGluZ0luZm9ybWF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQgdHlwZSBNZXNzYWdlSGFuZGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvTWVzc2FnZUhhbmRsZXJcIjtcbmltcG9ydCBDaGVja0JveCBmcm9tIFwic2FwL20vQ2hlY2tCb3hcIjtcbmltcG9ydCBNZXNzYWdlVG9hc3QgZnJvbSBcInNhcC9tL01lc3NhZ2VUb2FzdFwiO1xuaW1wb3J0IFRleHQgZnJvbSBcInNhcC9tL1RleHRcIjtcblxuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBUYWJsZUFQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUFQSVwiO1xuaW1wb3J0IEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92Mi9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcIi4vTW9kZWxIZWxwZXJcIjtcblxuZW51bSBEZWxldGVPcHRpb25UeXBlcyB7XG5cdGRlbGV0YWJsZUNvbnRleHRzID0gXCJkZWxldGFibGVDb250ZXh0c1wiLFxuXHRkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlID0gXCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlXCIsXG5cdHVuU2F2ZWRDb250ZXh0cyA9IFwidW5TYXZlZENvbnRleHRzXCIsXG5cdGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUgPSBcImRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmVcIixcblx0ZHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUgPSBcImRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlXCJcbn1cblxuZW51bSBEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbCB7XG5cdENIRUNLQk9YID0gXCJjaGVja0JveFwiLFxuXHRURVhUID0gXCJ0ZXh0XCJcbn1cblxuZXhwb3J0IHR5cGUgRHJhZnRTaWJsaW5nUGFpciA9IHtcblx0ZHJhZnQ6IENvbnRleHQ7XG5cdHNpYmxpbmdJbmZvOiBTaWJsaW5nSW5mb3JtYXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBEZWxldGVPcHRpb24gPSB7XG5cdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzO1xuXHRjb250ZXh0czogQ29udGV4dFtdO1xuXHRzZWxlY3RlZDogYm9vbGVhbjtcblx0dGV4dD86IHN0cmluZztcblx0Y29udHJvbD86IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sO1xufTtcblxuZXhwb3J0IHR5cGUgTW9kZWxPYmplY3RQcm9wZXJ0aWVzID0ge1xuXHRkZWxldGFibGVDb250ZXh0czogQ29udGV4dFtdO1xuXHR1blNhdmVkQ29udGV4dHM6IENvbnRleHRbXTtcblx0ZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZTogQ29udGV4dFtdO1xuXHRsb2NrZWRDb250ZXh0czogQ29udGV4dFtdO1xuXHRkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlOiBEcmFmdFNpYmxpbmdQYWlyW107XG5cdGRlbGV0ZUVuYWJsZWQ6IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBEcmFmdEFkbWluaXN0cmF0aXZlRGF0YVR5cGUgPSB7XG5cdERyYWZ0VVVJRDogc3RyaW5nO1xuXHRJblByb2Nlc3NCeVVzZXI/OiBzdHJpbmc7XG5cdEluUHJvY2Vzc0J5VXNlckRlc2NyaXB0aW9uPzogc3RyaW5nO1xuXHRDcmVhdGVkQnlVc2VyRGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cdENyZWF0ZWRCeVVzZXI/OiBzdHJpbmc7XG5cdExhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb24/OiBzdHJpbmc7XG5cdExhc3RDaGFuZ2VkQnlVc2VyPzogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgRGVsZXRlUGFyYW1ldGVycyA9IHtcblx0aW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHM6IG51bWJlcjtcblx0ZW50aXR5U2V0TmFtZTogc3RyaW5nO1xuXHRwYXJlbnRDb250cm9sOiBDb250cm9sO1xuXHRkZXNjcmlwdGlvbjogeyBwYXRoOiBzdHJpbmcgfTtcblx0YmVmb3JlRGVsZXRlQ2FsbEJhY2s6IEZ1bmN0aW9uO1xuXHRkZWxldGFibGVDb250ZXh0czogQ29udGV4dFtdO1xuXHR1blNhdmVkQ29udGV4dHM6IENvbnRleHRbXTtcblx0ZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZTogQ29udGV4dFtdO1xuXHRsb2NrZWRDb250ZXh0czogQ29udGV4dFtdO1xuXHRkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlOiBEcmFmdFNpYmxpbmdQYWlyW107XG59O1xuXG5leHBvcnQgdHlwZSBEZWxldGVUZXh0SW5mbyA9IHtcblx0aW5mb1R4dD86IHN0cmluZztcblx0b3B0aW9uVHh0Pzogc3RyaW5nO1xuXHRvcHRpb25XaXRob3V0VHh0PzogYm9vbGVhbjtcbn07XG5cbmZ1bmN0aW9uIGdldFVwZGF0ZWRTZWxlY3Rpb25zKFxuXHRpbnRlcm5hbE1vZGVsQ29udGV4dDogSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLFxuXHRzZWxlY3RlZENvbnRleHRzOiBDb250ZXh0W10sXG5cdGNvbnRleHRzVG9SZW1vdmU6IENvbnRleHRbXVxuKTogQ29udGV4dFtdIHtcblx0Y29uc3QgcmV0U2VsZWN0ZWRDb250ZXh0czogQ29udGV4dFtdID0gWy4uLnNlbGVjdGVkQ29udGV4dHNdO1xuXHRjb250ZXh0c1RvUmVtb3ZlLmZvckVhY2goKGNvbnRleHQ6IENvbnRleHQpID0+IHtcblx0XHRjb25zdCBpZHggPSByZXRTZWxlY3RlZENvbnRleHRzLmluZGV4T2YoY29udGV4dCk7XG5cdFx0aWYgKGlkeCAhPT0gLTEpIHtcblx0XHRcdHJldFNlbGVjdGVkQ29udGV4dHMuc3BsaWNlKGlkeCwgMSk7XG5cdFx0fVxuXHR9KTtcblx0aW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkodHlwZSwgW10pO1xuXG5cdHJldHVybiByZXRTZWxlY3RlZENvbnRleHRzO1xufVxuXG5mdW5jdGlvbiBjbGVhclNlbGVjdGVkQ29udGV4dHNGb3JPcHRpb24oaW50ZXJuYWxNb2RlbENvbnRleHQ6IEludGVybmFsTW9kZWxDb250ZXh0LCBvcHRpb246IERlbGV0ZU9wdGlvbikge1xuXHRsZXQgc2VsZWN0ZWRDb250ZXh0cyA9IChpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIikgYXMgQ29udGV4dFtdKSB8fCBbXTtcblxuXHRpZiAob3B0aW9uLnR5cGUgPT09IERlbGV0ZU9wdGlvblR5cGVzLmRlbGV0YWJsZUNvbnRleHRzKSB7XG5cdFx0c2VsZWN0ZWRDb250ZXh0cyA9IGdldFVwZGF0ZWRTZWxlY3Rpb25zKFxuXHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHREZWxldGVPcHRpb25UeXBlcy5kZWxldGFibGVDb250ZXh0cyxcblx0XHRcdHNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShEZWxldGVPcHRpb25UeXBlcy5kZWxldGFibGVDb250ZXh0cykgfHwgW11cblx0XHQpO1xuXG5cdFx0Y29uc3QgZHJhZnRTaWJsaW5nUGFpcnMgPSBpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShEZWxldGVPcHRpb25UeXBlcy5kcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlKSB8fCBbXTtcblx0XHRjb25zdCBkcmFmdHMgPSBkcmFmdFNpYmxpbmdQYWlycy5tYXAoKGNvbnRleHRQYWlyOiBEcmFmdFNpYmxpbmdQYWlyKSA9PiB7XG5cdFx0XHRyZXR1cm4gY29udGV4dFBhaXIuZHJhZnQ7XG5cdFx0fSk7XG5cdFx0c2VsZWN0ZWRDb250ZXh0cyA9IGdldFVwZGF0ZWRTZWxlY3Rpb25zKFxuXHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHREZWxldGVPcHRpb25UeXBlcy5kcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlLFxuXHRcdFx0c2VsZWN0ZWRDb250ZXh0cyxcblx0XHRcdGRyYWZ0c1xuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgY29udGV4dHNUb1JlbW92ZSA9IGludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KG9wdGlvbi50eXBlKSB8fCBbXTtcblx0XHRzZWxlY3RlZENvbnRleHRzID0gZ2V0VXBkYXRlZFNlbGVjdGlvbnMoaW50ZXJuYWxNb2RlbENvbnRleHQsIG9wdGlvbi50eXBlLCBzZWxlY3RlZENvbnRleHRzLCBjb250ZXh0c1RvUmVtb3ZlKTtcblx0fVxuXHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIiwgc2VsZWN0ZWRDb250ZXh0cyk7XG5cdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXCIsIHNlbGVjdGVkQ29udGV4dHMubGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gYWZ0ZXJEZWxldGVQcm9jZXNzKFxuXHRwYXJhbWV0ZXJzOiBEZWxldGVQYXJhbWV0ZXJzLFxuXHRvcHRpb25zOiBEZWxldGVPcHRpb25bXSxcblx0Y29udGV4dHM6IENvbnRleHRbXSxcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCxcblx0bGFzdERlbGV0ZWRSb3dJbmRleDogbnVtYmVyXG4pIHtcblx0Y29uc3QgeyBpbnRlcm5hbE1vZGVsQ29udGV4dCwgZW50aXR5U2V0TmFtZSB9ID0gcGFyYW1ldGVycztcblx0aWYgKGludGVybmFsTW9kZWxDb250ZXh0KSB7XG5cdFx0aWYgKGludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiZGVsZXRlRW5hYmxlZFwiKSAhPSB1bmRlZmluZWQpIHtcblx0XHRcdG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uKSA9PiB7XG5cdFx0XHRcdC8vIGlmIGFuIG9wdGlvbiBpcyBzZWxlY3RlZCwgdGhlbiBpdCBpcyBkZWxldGVkLiBTbywgd2UgbmVlZCB0byByZW1vdmUgdGhlbSBmcm9tIHNlbGVjdGVkIGNvbnRleHRzLlxuXHRcdFx0XHRpZiAob3B0aW9uLnNlbGVjdGVkKSB7XG5cdFx0XHRcdFx0Y2xlYXJTZWxlY3RlZENvbnRleHRzRm9yT3B0aW9uKGludGVybmFsTW9kZWxDb250ZXh0LCBvcHRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Ly8gaWYgYXRsZWFzdCBvbmUgb2YgdGhlIG9wdGlvbnMgaXMgbm90IHNlbGVjdGVkLCB0aGVuIHRoZSBkZWxldGUgYnV0dG9uIG5lZWRzIHRvIGJlIGVuYWJsZWQuXG5cdFx0aW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXG5cdFx0XHRcImRlbGV0ZUVuYWJsZWRcIixcblx0XHRcdG9wdGlvbnMuc29tZSgob3B0aW9uKSA9PiAhb3B0aW9uLnNlbGVjdGVkKVxuXHRcdCk7XG5cdH1cblxuXHRpZiAoY29udGV4dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0TWVzc2FnZVRvYXN0LnNob3cocmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfREVMRVRFX1RPQVNUX1NJTkdVTEFSXCIsIHVuZGVmaW5lZCwgZW50aXR5U2V0TmFtZSkpO1xuXHR9IGVsc2Uge1xuXHRcdE1lc3NhZ2VUb2FzdC5zaG93KHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0RFTEVURV9UT0FTVF9QTFVSQUxcIiwgdW5kZWZpbmVkLCBlbnRpdHlTZXROYW1lKSk7XG5cdH1cblxuXHRkZWxldGVIZWxwZXIuc2V0Rm9jdXNBZnRlckRlbGV0ZShwYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wgYXMgVGFibGUsIGNvbnRleHRzLmxlbmd0aCwgbGFzdERlbGV0ZWRSb3dJbmRleCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNldEZvY3VzQWZ0ZXJEZWxldGUodGFibGU6IFRhYmxlLCBkZWxldGVkUm93c0NvdW50OiBudW1iZXIsIGxhc3REZWxldGVkUm93SW5kZXg6IG51bWJlcikge1xuXHRjb25zdCB0YWJsZVJvd3NDb3VudCA9ICh0YWJsZS5nZXRSb3dCaW5kaW5nKCkgYXMgT0RhdGFMaXN0QmluZGluZyk/LmdldENvdW50KCk7XG5cdGNvbnN0IG9yaWdpbmFsVGFibGVSb3dzQ291bnQgPSAodGFibGVSb3dzQ291bnQgPz8gMCkgKyBkZWxldGVkUm93c0NvdW50O1xuXHRsZXQgbmV4dEZvY3VzUm93SW5kZXg7XG5cblx0aWYgKGxhc3REZWxldGVkUm93SW5kZXggIT09IC0xICYmIHRhYmxlUm93c0NvdW50ICE9PSB1bmRlZmluZWQgJiYgdGFibGVSb3dzQ291bnQgPiAwKSB7XG5cdFx0Ly9JZiB0aGUgbGFzdCByb3cgaXMgZGVsZXRlZCwgbW92ZSB0aGUgZm9jdXMgdG8gcHJldmlvdXMgcm93IHRvIGl0XG5cdFx0aWYgKGxhc3REZWxldGVkUm93SW5kZXggPT09IG9yaWdpbmFsVGFibGVSb3dzQ291bnQgLSAxKSB7XG5cdFx0XHRuZXh0Rm9jdXNSb3dJbmRleCA9IHRhYmxlUm93c0NvdW50IC0gMTtcblx0XHRcdC8vRm9yIHRoZSBub3JtYWwgc2NlbmFyaW8sIG1vdmUgdGhlIGZvY3VzIHRvIHRoZSBuZXh0IHJvd1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXh0Rm9jdXNSb3dJbmRleCA9IGxhc3REZWxldGVkUm93SW5kZXggLSBkZWxldGVkUm93c0NvdW50ICsgMTtcblx0XHR9XG5cdFx0YXdhaXQgdGFibGUuZm9jdXNSb3cobmV4dEZvY3VzUm93SW5kZXgsIGZhbHNlKTtcblx0fSBlbHNlIHtcblx0XHQvLyBGb3IgemVybyByb3dzIG9yIGRlZmF1bHQgY2FzZSwgbW92ZSBmb2N1cyB0byB0YWJsZVxuXHRcdHRhYmxlLmZvY3VzKCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0TG9ja2VkQ29udGV4dFVzZXIobG9ja2VkQ29udGV4dDogQ29udGV4dCk6IHN0cmluZyB7XG5cdGNvbnN0IGRyYWZ0QWRtaW5EYXRhID0gbG9ja2VkQ29udGV4dC5nZXRPYmplY3QoKVtcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCJdIGFzIERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhVHlwZTtcblx0cmV0dXJuIChkcmFmdEFkbWluRGF0YSAmJiBkcmFmdEFkbWluRGF0YVtcIkluUHJvY2Vzc0J5VXNlclwiXSkgfHwgXCJcIjtcbn1cblxuZnVuY3Rpb24gZ2V0TG9ja2VkT2JqZWN0c1RleHQocmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCwgbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzOiBudW1iZXIsIGxvY2tlZENvbnRleHRzOiBDb250ZXh0W10pOiBzdHJpbmcge1xuXHRsZXQgcmV0VHh0ID0gXCJcIjtcblxuXHRpZiAobnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID09PSAxICYmIGxvY2tlZENvbnRleHRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdC8vb25seSBvbmUgdW5zYXZlZCBvYmplY3Rcblx0XHRjb25zdCBsb2NrZWRVc2VyID0gZ2V0TG9ja2VkQ29udGV4dFVzZXIobG9ja2VkQ29udGV4dHNbMF0pO1xuXHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfU0lOR0xFX09CSkVDVF9MT0NLRURcIiwgW2xvY2tlZFVzZXJdKTtcblx0fSBlbHNlIGlmIChsb2NrZWRDb250ZXh0cy5sZW5ndGggPT0gMSkge1xuXHRcdGNvbnN0IGxvY2tlZFVzZXIgPSBnZXRMb2NrZWRDb250ZXh0VXNlcihsb2NrZWRDb250ZXh0c1swXSk7XG5cdFx0cmV0VHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RJTkZPX0FORF9PTkVfT0JKRUNUX0xPQ0tFRFwiLCBbXG5cdFx0XHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRsb2NrZWRVc2VyXG5cdFx0XSk7XG5cdH0gZWxzZSBpZiAobG9ja2VkQ29udGV4dHMubGVuZ3RoID4gMSkge1xuXHRcdHJldFR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT19BTkRfRkVXX09CSkVDVFNfTE9DS0VEXCIsIFtcblx0XHRcdGxvY2tlZENvbnRleHRzLmxlbmd0aCxcblx0XHRcdG51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1xuXHRcdF0pO1xuXHR9XG5cblx0cmV0dXJuIHJldFR4dDtcbn1cblxuZnVuY3Rpb24gZ2V0Tm9uRGVsZXRhYmxlQWN0aXZlc09mRHJhZnRzVGV4dChyZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsLCBudW1iZXJPZkRyYWZ0czogbnVtYmVyLCB0b3RhbERlbGV0YWJsZTogbnVtYmVyKTogc3RyaW5nIHtcblx0bGV0IHJldFR4dCA9IFwiXCI7XG5cblx0aWYgKHRvdGFsRGVsZXRhYmxlID09PSBudW1iZXJPZkRyYWZ0cykge1xuXHRcdGlmIChudW1iZXJPZkRyYWZ0cyA9PT0gMSkge1xuXHRcdFx0cmV0VHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfT05MWV9EUkFGVF9PRl9OT05fREVMRVRBQkxFX0FDVElWRVwiKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0VHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfT05MWV9EUkFGVFNfT0ZfTk9OX0RFTEVUQUJMRV9BQ1RJVkVcIik7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG51bWJlck9mRHJhZnRzID09PSAxKSB7XG5cdFx0cmV0VHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfRFJBRlRfT0ZfTk9OX0RFTEVUQUJMRV9BQ1RJVkVcIik7XG5cdH0gZWxzZSB7XG5cdFx0cmV0VHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfRFJBRlRTX09GX05PTl9ERUxFVEFCTEVfQUNUSVZFXCIpO1xuXHR9XG5cblx0cmV0dXJuIHJldFR4dDtcbn1cblxuZnVuY3Rpb24gZ2V0VW5TYXZlZENvbnRleHRVc2VyKHVuU2F2ZWRDb250ZXh0OiBDb250ZXh0KTogc3RyaW5nIHtcblx0Y29uc3QgZHJhZnRBZG1pbkRhdGEgPSB1blNhdmVkQ29udGV4dC5nZXRPYmplY3QoKVtcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCJdIGFzIERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhVHlwZTtcblx0bGV0IHNMYXN0Q2hhbmdlZEJ5VXNlciA9IFwiXCI7XG5cdGlmIChkcmFmdEFkbWluRGF0YSkge1xuXHRcdHNMYXN0Q2hhbmdlZEJ5VXNlciA9IGRyYWZ0QWRtaW5EYXRhW1wiTGFzdENoYW5nZWRCeVVzZXJEZXNjcmlwdGlvblwiXSB8fCBkcmFmdEFkbWluRGF0YVtcIkxhc3RDaGFuZ2VkQnlVc2VyXCJdIHx8IFwiXCI7XG5cdH1cblxuXHRyZXR1cm4gc0xhc3RDaGFuZ2VkQnlVc2VyO1xufVxuXG5mdW5jdGlvbiBnZXRVbnNhdmVkQ29udGV4dHNUZXh0KFxuXHRyZXNvdXJjZU1vZGVsOiBSZXNvdXJjZU1vZGVsLFxuXHRudW1iZXJPZlNlbGVjdGVkQ29udGV4dHM6IG51bWJlcixcblx0dW5TYXZlZENvbnRleHRzOiBDb250ZXh0W10sXG5cdHRvdGFsRGVsZXRhYmxlOiBudW1iZXJcbik6IERlbGV0ZVRleHRJbmZvIHtcblx0bGV0IGluZm9UeHQgPSBcIlwiLFxuXHRcdG9wdGlvblR4dCA9IFwiXCIsXG5cdFx0b3B0aW9uV2l0aG91dFR4dCA9IGZhbHNlO1xuXHRpZiAobnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID09PSAxICYmIHVuU2F2ZWRDb250ZXh0cy5sZW5ndGggPT09IDEpIHtcblx0XHQvL29ubHkgb25lIHVuc2F2ZWQgb2JqZWN0IGFyZSBzZWxlY3RlZFxuXHRcdGNvbnN0IGxhc3RDaGFuZ2VkQnlVc2VyID0gZ2V0VW5TYXZlZENvbnRleHRVc2VyKHVuU2F2ZWRDb250ZXh0c1swXSk7XG5cdFx0aW5mb1R4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfVU5TQVZFRF9DSEFOR0VTXCIsIFtsYXN0Q2hhbmdlZEJ5VXNlcl0pO1xuXHRcdG9wdGlvbldpdGhvdXRUeHQgPSB0cnVlO1xuXHR9IGVsc2UgaWYgKG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9PT0gdW5TYXZlZENvbnRleHRzLmxlbmd0aCkge1xuXHRcdC8vb25seSBtdWx0aXBsZSB1bnNhdmVkIG9iamVjdHMgYXJlIHNlbGVjdGVkXG5cdFx0aW5mb1R4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfVU5TQVZFRF9DSEFOR0VTX01VTFRJUExFX09CSkVDVFNcIik7XG5cdFx0b3B0aW9uV2l0aG91dFR4dCA9IHRydWU7XG5cdH0gZWxzZSBpZiAodG90YWxEZWxldGFibGUgPT09IHVuU2F2ZWRDb250ZXh0cy5sZW5ndGgpIHtcblx0XHQvLyBub24tZGVsZXRhYmxlL2xvY2tlZCBleGlzdHMsIGFsbCBkZWxldGFibGUgYXJlIHVuc2F2ZWQgYnkgb3RoZXJzXG5cdFx0aWYgKHVuU2F2ZWRDb250ZXh0cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGNvbnN0IGxhc3RDaGFuZ2VkQnlVc2VyID0gZ2V0VW5TYXZlZENvbnRleHRVc2VyKHVuU2F2ZWRDb250ZXh0c1swXSk7XG5cdFx0XHRpbmZvVHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9VTlNBVkVEX0FORF9GRVdfT0JKRUNUU19MT0NLRURfU0lOR1VMQVJcIiwgW1xuXHRcdFx0XHRsYXN0Q2hhbmdlZEJ5VXNlclxuXHRcdFx0XSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGluZm9UeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1VOU0FWRURfQU5EX0ZFV19PQkpFQ1RTX0xPQ0tFRF9QTFVSQUxcIik7XG5cdFx0fVxuXHRcdG9wdGlvbldpdGhvdXRUeHQgPSB0cnVlO1xuXHR9IGVsc2UgaWYgKHRvdGFsRGVsZXRhYmxlID4gdW5TYXZlZENvbnRleHRzLmxlbmd0aCkge1xuXHRcdC8vIG5vbi1kZWxldGFibGUvbG9ja2VkIGV4aXN0cywgZGVsZXRhYmxlIGluY2x1ZGUgdW5zYXZlZCBhbmQgb3RoZXIgdHlwZXMuXG5cdFx0aWYgKHVuU2F2ZWRDb250ZXh0cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGNvbnN0IGxhc3RDaGFuZ2VkQnlVc2VyID0gZ2V0VW5TYXZlZENvbnRleHRVc2VyKHVuU2F2ZWRDb250ZXh0c1swXSk7XG5cdFx0XHRvcHRpb25UeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX0ZFV19PQkpFQ1RTX1VOU0FWRURfU0lOR1VMQVJcIiwgW1xuXHRcdFx0XHRsYXN0Q2hhbmdlZEJ5VXNlclxuXHRcdFx0XSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9wdGlvblR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT19BTkRfRkVXX09CSkVDVFNfVU5TQVZFRF9QTFVSQUxcIik7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHsgaW5mb1R4dCwgb3B0aW9uVHh0LCBvcHRpb25XaXRob3V0VHh0IH07XG59XG5cbmZ1bmN0aW9uIGdldE5vbkRlbGV0YWJsZVRleHQoXG5cdG1QYXJhbWV0ZXJzOiBEZWxldGVQYXJhbWV0ZXJzLFxuXHR0b3RhbE51bURlbGV0YWJsZUNvbnRleHRzOiBudW1iZXIsXG5cdHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWxcbik6IFRleHQgfCB1bmRlZmluZWQge1xuXHRjb25zdCB7IG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cywgZW50aXR5U2V0TmFtZSwgbG9ja2VkQ29udGV4dHMgPSBbXSwgZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSA9IFtdIH0gPSBtUGFyYW1ldGVycztcblx0Y29uc3Qgbm9uRGVsZXRhYmxlQ29udGV4dHMgPVxuXHRcdG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyAtIChsb2NrZWRDb250ZXh0cy5sZW5ndGggKyB0b3RhbE51bURlbGV0YWJsZUNvbnRleHRzIC0gZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGgpO1xuXHRsZXQgcmV0VHh0ID0gXCJcIjtcblxuXHRpZiAoXG5cdFx0bm9uRGVsZXRhYmxlQ29udGV4dHMgPiAwICYmXG5cdFx0KHRvdGFsTnVtRGVsZXRhYmxlQ29udGV4dHMgPT09IDAgfHwgZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGggPT09IHRvdGFsTnVtRGVsZXRhYmxlQ29udGV4dHMpXG5cdCkge1xuXHRcdC8vIDEuIE5vbmUgb2YgdGhlIGNjb250ZXh0cyBhcmUgZGVsZXRhYmxlXG5cdFx0Ly8gMi4gT25seSBkcmFmdHMgb2Ygbm9uIGRlbGV0YWJsZSBjb250ZXh0cyBleGlzdC5cblx0XHRpZiAobG9ja2VkQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0Ly8gTG9ja2VkIGNvbnRleHRzIGV4aXN0XG5cdFx0XHRpZiAobm9uRGVsZXRhYmxlQ29udGV4dHMgPT09IDEpIHtcblx0XHRcdFx0cmV0VHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9BTExfUkVNQUlOSU5HX05PTl9ERUxFVEFCTEVfU0lOR1VMQVJcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXRUeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX0FMTF9SRU1BSU5JTkdfTk9OX0RFTEVUQUJMRV9QTFVSQUxcIik7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChub25EZWxldGFibGVDb250ZXh0cyA9PT0gMSkge1xuXHRcdFx0Ly8gT25seSBwdXJlIG5vbi1kZWxldGFibGUgY29udGV4dHMgZXhpc3Qgc2luZ2xlXG5cdFx0XHRyZXRUeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXG5cdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9TSU5HTEVfQU5EX09ORV9PQkpFQ1RfTk9OX0RFTEVUQUJMRVwiLFxuXHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdGVudGl0eVNldE5hbWVcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIE9ubHkgcHVyZSBub24tZGVsZXRhYmxlIGNvbnRleHRzIGV4aXN0IG11bHRpcGxlXG5cdFx0XHRyZXRUeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXG5cdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9NVUxUSVBMRV9BTkRfQUxMX09CSkVDVF9OT05fREVMRVRBQkxFXCIsXG5cdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0ZW50aXR5U2V0TmFtZVxuXHRcdFx0KTtcblx0XHR9XG5cdH0gZWxzZSBpZiAobm9uRGVsZXRhYmxlQ29udGV4dHMgPT09IDEpIHtcblx0XHQvLyBkZWxldGFibGUgYW5kIG5vbi1kZWxldGFibGUgZXhpc3RzIHRvZ2V0aGVyLCBzaW5nbGVcblx0XHRyZXRUeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXG5cdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT19BTkRfT05FX09CSkVDVF9OT05fREVMRVRBQkxFXCIsXG5cdFx0XHRbbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXSxcblx0XHRcdGVudGl0eVNldE5hbWVcblx0XHQpO1xuXHR9IGVsc2UgaWYgKG5vbkRlbGV0YWJsZUNvbnRleHRzID4gMSkge1xuXHRcdC8vIGRlbGV0YWJsZSBhbmQgbm9uLWRlbGV0YWJsZSBleGlzdHMgdG9nZXRoZXIsIG11bHRpcGxlXG5cdFx0cmV0VHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFxuXHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX0ZFV19PQkpFQ1RTX05PTl9ERUxFVEFCTEVcIixcblx0XHRcdFtub25EZWxldGFibGVDb250ZXh0cywgbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXSxcblx0XHRcdGVudGl0eVNldE5hbWVcblx0XHQpO1xuXHR9XG5cblx0cmV0dXJuIHJldFR4dCA/IG5ldyBUZXh0KHsgdGV4dDogcmV0VHh0IH0pIDogdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBnZXRDb25maXJtZWREZWxldGFibGVDb250ZXh0KGNvbnRleHRzOiBDb250ZXh0W10sIG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdKTogQ29udGV4dFtdIHtcblx0cmV0dXJuIG9wdGlvbnMucmVkdWNlKChyZXN1bHQsIG9wdGlvbikgPT4ge1xuXHRcdHJldHVybiBvcHRpb24uc2VsZWN0ZWQgJiYgb3B0aW9uLnR5cGUgIT09IERlbGV0ZU9wdGlvblR5cGVzLmRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlID8gcmVzdWx0LmNvbmNhdChvcHRpb24uY29udGV4dHMpIDogcmVzdWx0O1xuXHR9LCBjb250ZXh0cyk7XG59XG5cbmZ1bmN0aW9uIGdldERyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlKG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdKTogQ29udGV4dFtdIHtcblx0Y29uc3QgY29udGV4dHM6IENvbnRleHRbXSA9IFtdO1xuXHRyZXR1cm4gb3B0aW9ucy5yZWR1Y2UoKHJlc3VsdCwgb3B0aW9uKSA9PiB7XG5cdFx0cmV0dXJuIG9wdGlvbi5zZWxlY3RlZCAmJiBvcHRpb24udHlwZSA9PT0gRGVsZXRlT3B0aW9uVHlwZXMuZHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUgPyByZXN1bHQuY29uY2F0KG9wdGlvbi5jb250ZXh0cykgOiByZXN1bHQ7XG5cdH0sIGNvbnRleHRzKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlRHJhZnRPcHRpb25zRm9yRGVsZXRhYmxlVGV4dHMoXG5cdG1QYXJhbWV0ZXJzOiBEZWxldGVQYXJhbWV0ZXJzLFxuXHR2Q29udGV4dHM6IENvbnRleHRbXSxcblx0dG90YWxEZWxldGFibGU6IG51bWJlcixcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbCxcblx0aXRlbXM6IENvbnRyb2xbXSxcblx0b3B0aW9uczogRGVsZXRlT3B0aW9uW11cbikge1xuXHRjb25zdCB7IG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cywgZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSwgdW5TYXZlZENvbnRleHRzLCBsb2NrZWRDb250ZXh0cywgZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSB9ID1cblx0XHRtUGFyYW1ldGVycztcblxuXHRsZXQgbG9ja2VkQ29udGV4dHNUeHQgPSBcIlwiO1xuXG5cdC8vIGRyYWZ0cyB3aXRoIGFjdGl2ZVxuXHRpZiAoZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZS5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3QgZHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmU6IENvbnRleHRbXSA9IFtdO1xuXHRcdGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUuZm9yRWFjaCgoZGVsZXRhYmxlRHJhZnRJbmZvOiBEcmFmdFNpYmxpbmdQYWlyKSA9PiB7XG5cdFx0XHQvLyBJbiBlaXRoZXIgY2FzZXMsIGlmIGFuIG93biBkcmFmdCBpcyBsb2NrZWQgb3Igbm90IHRoZSBkcmFmdCBuZWVkcyB0byBiZSBkaXNjYXJkZWQgYmVmb3JlIGRlbGV0aW5nIGFjdGl2ZSByZWNvcmQuXG5cdFx0XHRkcmFmdHNUb0RlbGV0ZUJlZm9yZUFjdGl2ZS5wdXNoKGRlbGV0YWJsZURyYWZ0SW5mby5kcmFmdCk7XG5cdFx0XHR2Q29udGV4dHMucHVzaChkZWxldGFibGVEcmFmdEluZm8uc2libGluZ0luZm8udGFyZ2V0Q29udGV4dCk7XG5cdFx0fSk7XG5cdFx0aWYgKGRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlLmxlbmd0aCA+IDApIHtcblx0XHRcdG9wdGlvbnMucHVzaCh7XG5cdFx0XHRcdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLmRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlLFxuXHRcdFx0XHRjb250ZXh0czogZHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUsXG5cdFx0XHRcdHNlbGVjdGVkOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvLyBpdGVtcyBsb2NrZWQgbXNnXG5cdGlmIChsb2NrZWRDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0bG9ja2VkQ29udGV4dHNUeHQgPSBkZWxldGVIZWxwZXIuZ2V0TG9ja2VkT2JqZWN0c1RleHQocmVzb3VyY2VNb2RlbCwgbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzLCBsb2NrZWRDb250ZXh0cykgfHwgXCJcIjtcblx0XHRpdGVtcy5wdXNoKG5ldyBUZXh0KHsgdGV4dDogbG9ja2VkQ29udGV4dHNUeHQgfSkpO1xuXHR9XG5cblx0Ly8gbm9uIGRlbGV0YWJsZSBtc2dcblx0Y29uc3Qgbm9uRGVsZXRhYmxlRXhpc3RzID0gbnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzICE9IHRvdGFsRGVsZXRhYmxlIC0gZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGggKyBsb2NrZWRDb250ZXh0cy5sZW5ndGg7XG5cdGNvbnN0IG5vbkRlbGV0YWJsZVRleHRDdHJsID0gbm9uRGVsZXRhYmxlRXhpc3RzICYmIGRlbGV0ZUhlbHBlci5nZXROb25EZWxldGFibGVUZXh0KG1QYXJhbWV0ZXJzLCB0b3RhbERlbGV0YWJsZSwgcmVzb3VyY2VNb2RlbCk7XG5cdGlmIChub25EZWxldGFibGVUZXh0Q3RybCkge1xuXHRcdGl0ZW1zLnB1c2gobm9uRGVsZXRhYmxlVGV4dEN0cmwpO1xuXHR9XG5cblx0Ly8gb3B0aW9uOiB1bnNhdmVkIGNoYW5nZXMgYnkgb3RoZXJzXG5cdGlmICh1blNhdmVkQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IHVuc2F2ZWRDaGFuZ2VzVHh0cyA9XG5cdFx0XHRkZWxldGVIZWxwZXIuZ2V0VW5zYXZlZENvbnRleHRzVGV4dChyZXNvdXJjZU1vZGVsLCBudW1iZXJPZlNlbGVjdGVkQ29udGV4dHMsIHVuU2F2ZWRDb250ZXh0cywgdG90YWxEZWxldGFibGUpIHx8IHt9O1xuXHRcdGlmICh1bnNhdmVkQ2hhbmdlc1R4dHMuaW5mb1R4dCkge1xuXHRcdFx0aXRlbXMucHVzaChuZXcgVGV4dCh7IHRleHQ6IHVuc2F2ZWRDaGFuZ2VzVHh0cy5pbmZvVHh0IH0pKTtcblx0XHR9XG5cdFx0aWYgKHVuc2F2ZWRDaGFuZ2VzVHh0cy5vcHRpb25UeHQgfHwgdW5zYXZlZENoYW5nZXNUeHRzLm9wdGlvbldpdGhvdXRUeHQpIHtcblx0XHRcdG9wdGlvbnMucHVzaCh7XG5cdFx0XHRcdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLnVuU2F2ZWRDb250ZXh0cyxcblx0XHRcdFx0Y29udGV4dHM6IHVuU2F2ZWRDb250ZXh0cyxcblx0XHRcdFx0dGV4dDogdW5zYXZlZENoYW5nZXNUeHRzLm9wdGlvblR4dCxcblx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdGNvbnRyb2w6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLkNIRUNLQk9YXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvLyBvcHRpb246IGRyYWZ0cyB3aXRoIGFjdGl2ZSBub3QgZGVsZXRhYmxlXG5cdGlmIChkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBub25EZWxldGFibGVBY3RpdmVzT2ZEcmFmdHNUZXh0ID1cblx0XHRcdGRlbGV0ZUhlbHBlci5nZXROb25EZWxldGFibGVBY3RpdmVzT2ZEcmFmdHNUZXh0KHJlc291cmNlTW9kZWwsIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUubGVuZ3RoLCB0b3RhbERlbGV0YWJsZSkgfHwgXCJcIjtcblx0XHRpZiAobm9uRGVsZXRhYmxlQWN0aXZlc09mRHJhZnRzVGV4dCkge1xuXHRcdFx0b3B0aW9ucy5wdXNoKHtcblx0XHRcdFx0dHlwZTogRGVsZXRlT3B0aW9uVHlwZXMuZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZSxcblx0XHRcdFx0Y29udGV4dHM6IGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUsXG5cdFx0XHRcdHRleHQ6IG5vbkRlbGV0YWJsZUFjdGl2ZXNPZkRyYWZ0c1RleHQsXG5cdFx0XHRcdHNlbGVjdGVkOiB0cnVlLFxuXHRcdFx0XHRjb250cm9sOiB0b3RhbERlbGV0YWJsZSA+IDAgPyBEZWxldGVEaWFsb2dDb250ZW50Q29udHJvbC5DSEVDS0JPWCA6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLlRFWFRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiB1cGRhdGVDb250ZW50Rm9yRGVsZXRlRGlhbG9nKG9wdGlvbnM6IERlbGV0ZU9wdGlvbltdLCBpdGVtczogQ29udHJvbFtdKSB7XG5cdGlmIChvcHRpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdC8vIFNpbmdsZSBvcHRpb24gZG9lc24ndCBuZWVkIGNoZWNrQm94XG5cdFx0Y29uc3Qgb3B0aW9uID0gb3B0aW9uc1swXTtcblx0XHRpZiAob3B0aW9uLnRleHQpIHtcblx0XHRcdGl0ZW1zLnB1c2gobmV3IFRleHQoeyB0ZXh0OiBvcHRpb24udGV4dCB9KSk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG9wdGlvbnMubGVuZ3RoID4gMSkge1xuXHRcdC8vIE11bHRpcGxlIE9wdGlvbnNcblxuXHRcdC8vIFRleHRzXG5cdFx0b3B0aW9ucy5mb3JFYWNoKChvcHRpb246IERlbGV0ZU9wdGlvbikgPT4ge1xuXHRcdFx0aWYgKG9wdGlvbi5jb250cm9sID09PSBcInRleHRcIiAmJiBvcHRpb24udGV4dCkge1xuXHRcdFx0XHRpdGVtcy5wdXNoKG5ldyBUZXh0KHsgdGV4dDogb3B0aW9uLnRleHQgfSkpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdC8vIENoZWNrQm94c1xuXHRcdG9wdGlvbnMuZm9yRWFjaCgob3B0aW9uOiBEZWxldGVPcHRpb24pID0+IHtcblx0XHRcdGlmIChvcHRpb24uY29udHJvbCA9PT0gXCJjaGVja0JveFwiICYmIG9wdGlvbi50ZXh0KSB7XG5cdFx0XHRcdGl0ZW1zLnB1c2goXG5cdFx0XHRcdFx0bmV3IENoZWNrQm94KHtcblx0XHRcdFx0XHRcdHRleHQ6IG9wdGlvbi50ZXh0LFxuXHRcdFx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0XHRzZWxlY3Q6IGZ1bmN0aW9uIChvRXZlbnQ6IEV2ZW50KSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGNoZWNrQm94ID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIENoZWNrQm94O1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzZWxlY3RlZCA9IGNoZWNrQm94LmdldFNlbGVjdGVkKCk7XG5cdFx0XHRcdFx0XHRcdG9wdGlvbi5zZWxlY3RlZCA9IHNlbGVjdGVkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBHZXQgdGhlIHNlbGVjdGVkIHJlY29yZCBpbiBVSSBmb3IgdGV4dCByYXRoZXIgdGhhbiB0aGUgY29udGV4dCB0byBkZWxldGUuXG4gKlxuICogQHBhcmFtIG1QYXJhbWV0ZXJzIERlbGV0ZSBwYXJhbWV0ZXJzIGFuZCBpbmZvcm1hdGlvbiBvZiBzZWxlY3RlZCBjb250ZXh0cy5cbiAqIEBwYXJhbSBjb250ZXh0VG9EZWxldGUgQ29udGV4dCB0byBjaGVjay5cbiAqIEByZXR1cm5zIENvbnRleHQgZm9yIGRlbGV0ZS5cbiAqL1xuZnVuY3Rpb24gX2dldE9yaWdpbmFsU2VsZWN0ZWRSZWNvcmQobVBhcmFtZXRlcnM6IERlbGV0ZVBhcmFtZXRlcnMsIGNvbnRleHRUb0RlbGV0ZTogQ29udGV4dCk6IENvbnRleHQge1xuXHRjb25zdCB7IGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUgfSA9IG1QYXJhbWV0ZXJzO1xuXHRjb25zdCByZXQgPSBkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlLmZpbmQoKGRyYWZ0U2libGluZ1BhaXIpID0+IGRyYWZ0U2libGluZ1BhaXIuc2libGluZ0luZm8udGFyZ2V0Q29udGV4dCA9PT0gY29udGV4dFRvRGVsZXRlKTtcblx0cmV0dXJuIHJldD8uZHJhZnQgPyByZXQuZHJhZnQgOiBjb250ZXh0VG9EZWxldGU7XG59XG5cbi8qKlxuICogR2V0IG9wdGlvbnMgcG9zc2libGUgZm9yIGRlbGV0ZSBvZiBzZWxlY3RlZCBjb250ZXh0cy5cbiAqXG4gKiBAcGFyYW0gbVBhcmFtZXRlcnMgRGVsZXRlIHBhcmFtZXRlcnMgYW5kIGluZm9ybWF0aW9uIG9mIHNlbGVjdGVkIGNvbnRleHRzLlxuICogQHBhcmFtIGRpcmVjdERlbGV0YWJsZUNvbnRleHRzIENvbnRleHRzIHRoYXQgY2FuIGJlIGRlbGV0YWJsZSBkaXJlY3RseS5cbiAqIEBwYXJhbSByZXNvdXJjZU1vZGVsIFJlc291cmNlIG1vZGVsLlxuICogQHJldHVybnMgT3B0aW9ucyB0aGF0IGFyZSBwb3NzaWJsZSBmb3Igc2VsZWN0ZWQgcmVjb3Jkcy5cbiAqL1xuZnVuY3Rpb24gZ2V0T3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzKFxuXHRtUGFyYW1ldGVyczogRGVsZXRlUGFyYW1ldGVycyxcblx0ZGlyZWN0RGVsZXRhYmxlQ29udGV4dHM6IENvbnRleHRbXSxcblx0cmVzb3VyY2VNb2RlbDogUmVzb3VyY2VNb2RlbFxuKTogRGVsZXRlT3B0aW9uW10ge1xuXHRjb25zdCB7XG5cdFx0bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzLFxuXHRcdGVudGl0eVNldE5hbWUsXG5cdFx0cGFyZW50Q29udHJvbCxcblx0XHRkZXNjcmlwdGlvbixcblx0XHRsb2NrZWRDb250ZXh0cyxcblx0XHRkcmFmdHNXaXRoTm9uRGVsZXRhYmxlQWN0aXZlLFxuXHRcdHVuU2F2ZWRDb250ZXh0c1xuXHR9ID0gbVBhcmFtZXRlcnM7XG5cdGNvbnN0IHRvdGFsRGVsZXRhYmxlID0gZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMubGVuZ3RoICsgZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGggKyB1blNhdmVkQ29udGV4dHMubGVuZ3RoO1xuXHRjb25zdCBub25EZWxldGFibGVDb250ZXh0cyA9IG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyAtIChsb2NrZWRDb250ZXh0cy5sZW5ndGggKyB0b3RhbERlbGV0YWJsZSAtIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUubGVuZ3RoKTtcblx0Y29uc3Qgb3B0aW9uczogRGVsZXRlT3B0aW9uW10gPSBbXTtcblxuXHRpZiAobnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID09PSAxICYmIG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9PT0gZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0Ly8gc2luZ2xlIGRlbGV0YWJsZSBjb250ZXh0XG5cdFx0Y29uc3Qgb1RhYmxlID0gcGFyZW50Q29udHJvbCBhcyBUYWJsZTtcblx0XHRjb25zdCBzS2V5ID0gb1RhYmxlICYmIChvVGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEkpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0XHRsZXQgdHh0O1xuXHRcdGxldCBhUGFyYW1zID0gW107XG5cdFx0aWYgKHNLZXkpIHtcblx0XHRcdGNvbnN0IGRlc2NyaXB0aW9uUGF0aCA9IGRlc2NyaXB0aW9uICYmIGRlc2NyaXB0aW9uLnBhdGg7XG5cdFx0XHRsZXQgc2luZ2xlQ29udGV4dCA9IGRpcmVjdERlbGV0YWJsZUNvbnRleHRzWzBdO1xuXHRcdFx0bGV0IG9MaW5lQ29udGV4dERhdGEgPSBzaW5nbGVDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0aWYgKCFvTGluZUNvbnRleHREYXRhIHx8IE9iamVjdC5rZXlzKG9MaW5lQ29udGV4dERhdGEpLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQvLyBJbiBjYXNlIG9yaWdpbmFsIHNlbGVjdGVkIHJlY29yZCBpcyBkcmFmdChpbiBVSSkuIFRoZSBBY3RpdmUgcmVjb3JkIG5lZWRzIHRvIGJlIGRlbGV0ZWQoZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMgaGFzIGFjdGl2ZSByZWNvcmQpLCBidXQgZGF0YSBpcyBub3QgcmVxdWVzdGVkLiBXZSBnZXQgZGF0YSBmcm9tIHRoZSBkcmFmdC5cblx0XHRcdFx0c2luZ2xlQ29udGV4dCA9IF9nZXRPcmlnaW5hbFNlbGVjdGVkUmVjb3JkKG1QYXJhbWV0ZXJzLCBzaW5nbGVDb250ZXh0KTtcblx0XHRcdFx0b0xpbmVDb250ZXh0RGF0YSA9IHNpbmdsZUNvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBzS2V5VmFsdWUgPSBzS2V5ID8gb0xpbmVDb250ZXh0RGF0YVtzS2V5XSA6IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IHNEZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uUGF0aCAmJiBvTGluZUNvbnRleHREYXRhW2Rlc2NyaXB0aW9uUGF0aF07XG5cdFx0XHRpZiAoc0tleVZhbHVlKSB7XG5cdFx0XHRcdGlmIChzRGVzY3JpcHRpb24gJiYgZGVzY3JpcHRpb24gJiYgc0tleSAhPT0gZGVzY3JpcHRpb24ucGF0aCkge1xuXHRcdFx0XHRcdGFQYXJhbXMgPSBbc0tleVZhbHVlICsgXCIgXCIsIHNEZXNjcmlwdGlvbl07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YVBhcmFtcyA9IFtzS2V5VmFsdWUsIFwiXCJdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT1wiLCBhUGFyYW1zLCBlbnRpdHlTZXROYW1lKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfU0lOR1VMQVJcIiwgdW5kZWZpbmVkLCBlbnRpdHlTZXROYW1lKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dHh0ID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RUSVRMRV9TSU5HVUxBUlwiLCB1bmRlZmluZWQsIGVudGl0eVNldE5hbWUpO1xuXHRcdH1cblx0XHRvcHRpb25zLnB1c2goe1xuXHRcdFx0dHlwZTogRGVsZXRlT3B0aW9uVHlwZXMuZGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHRjb250ZXh0czogZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHR0ZXh0OiB0eHQsXG5cdFx0XHRzZWxlY3RlZDogdHJ1ZSxcblx0XHRcdGNvbnRyb2w6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLlRFWFRcblx0XHR9KTtcblx0fSBlbHNlIGlmIChcblx0XHR1blNhdmVkQ29udGV4dHMubGVuZ3RoICE9PSB0b3RhbERlbGV0YWJsZSAmJlxuXHRcdG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA+IDAgJiZcblx0XHQoZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMubGVuZ3RoID4gMCB8fCAodW5TYXZlZENvbnRleHRzLmxlbmd0aCA+IDAgJiYgZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZS5sZW5ndGggPiAwKSlcblx0KSB7XG5cdFx0aWYgKG51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA+IGRpcmVjdERlbGV0YWJsZUNvbnRleHRzLmxlbmd0aCAmJiBub25EZWxldGFibGVDb250ZXh0cyArIGxvY2tlZENvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIG90aGVyIHR5cGVzIGV4aXN0cyB3aXRoIHB1cmUgZGVsZXRhYmxlIG9uZXNcblx0XHRcdGxldCBkZWxldGFibGVPcHRpb25UeHQgPSBcIlwiO1xuXHRcdFx0aWYgKHRvdGFsRGVsZXRhYmxlID09PSAxKSB7XG5cdFx0XHRcdGRlbGV0YWJsZU9wdGlvblR4dCA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcblx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfU0lOR1VMQVJfTk9OX0RFTEVUQUJMRVwiLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHRlbnRpdHlTZXROYW1lXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRkZWxldGFibGVPcHRpb25UeHQgPSByZXNvdXJjZU1vZGVsLmdldFRleHQoXG5cdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVFRJVExFX1BMVVJBTF9OT05fREVMRVRBQkxFXCIsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdGVudGl0eVNldE5hbWVcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdG9wdGlvbnMudW5zaGlmdCh7XG5cdFx0XHRcdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLmRlbGV0YWJsZUNvbnRleHRzLFxuXHRcdFx0XHRjb250ZXh0czogZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHRcdHRleHQ6IGRlbGV0YWJsZU9wdGlvblR4dCxcblx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdGNvbnRyb2w6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLlRFWFRcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBvbmx5IGRlbGV0YWJsZVxuXHRcdFx0Y29uc3QgYWxsRGVsZXRhYmxlVHh0ID1cblx0XHRcdFx0dG90YWxEZWxldGFibGUgPT09IDFcblx0XHRcdFx0XHQ/IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfU0lOR1VMQVJcIiwgdW5kZWZpbmVkLCBlbnRpdHlTZXROYW1lKVxuXHRcdFx0XHRcdDogcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RUSVRMRV9QTFVSQUxcIiwgdW5kZWZpbmVkLCBlbnRpdHlTZXROYW1lKTtcblx0XHRcdG9wdGlvbnMucHVzaCh7XG5cdFx0XHRcdHR5cGU6IERlbGV0ZU9wdGlvblR5cGVzLmRlbGV0YWJsZUNvbnRleHRzLFxuXHRcdFx0XHRjb250ZXh0czogZGlyZWN0RGVsZXRhYmxlQ29udGV4dHMsXG5cdFx0XHRcdHRleHQ6IGFsbERlbGV0YWJsZVR4dCxcblx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdGNvbnRyb2w6IERlbGV0ZURpYWxvZ0NvbnRlbnRDb250cm9sLlRFWFRcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBvcHRpb25zO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkZWxldGVDb25maXJtSGFuZGxlcihcblx0b3B0aW9uczogRGVsZXRlT3B0aW9uW10sXG5cdG1QYXJhbWV0ZXJzOiBEZWxldGVQYXJhbWV0ZXJzLFxuXHRtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXIsXG5cdHJlc291cmNlTW9kZWw6IFJlc291cmNlTW9kZWwsXG5cdGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRkcmFmdEVuYWJsZWQ6IGJvb2xlYW5cbikge1xuXHR0cnkge1xuXHRcdGNvbnN0IGNvbnRleHRzID0gZGVsZXRlSGVscGVyLmdldENvbmZpcm1lZERlbGV0YWJsZUNvbnRleHQoW10sIG9wdGlvbnMpO1xuXHRcdGNvbnN0IGxhc3REZWxldGVkUm93SW5kZXggPSBjb250ZXh0c1tjb250ZXh0cy5sZW5ndGggLSAxXS5nZXRJbmRleCgpID8/IC0xO1xuXHRcdGNvbnN0IGRyYWZ0c1RvRGVsZXRlQmVmb3JlQWN0aXZlID0gZ2V0RHJhZnRzVG9EZWxldGVCZWZvcmVBY3RpdmUob3B0aW9ucyk7XG5cblx0XHRjb25zdCB7IGJlZm9yZURlbGV0ZUNhbGxCYWNrLCBwYXJlbnRDb250cm9sIH0gPSBtUGFyYW1ldGVycztcblx0XHRpZiAoYmVmb3JlRGVsZXRlQ2FsbEJhY2spIHtcblx0XHRcdGF3YWl0IGJlZm9yZURlbGV0ZUNhbGxCYWNrKHsgY29udGV4dHM6IGNvbnRleHRzIH0pO1xuXHRcdH1cblxuXHRcdGlmIChjb250ZXh0cyAmJiBjb250ZXh0cy5sZW5ndGgpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IGVuYWJsZVN0cmljdEhhbmRsaW5nID0gY29udGV4dHMubGVuZ3RoID09PSAxID8gdHJ1ZSA6IGZhbHNlO1xuXHRcdFx0XHRjb25zdCBkcmFmdEVycm9yczogdW5rbm93bltdID0gW107XG5cdFx0XHRcdGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChcblx0XHRcdFx0XHRkcmFmdHNUb0RlbGV0ZUJlZm9yZUFjdGl2ZS5tYXAoYXN5bmMgZnVuY3Rpb24gKGNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhd2FpdCBkcmFmdC5kZWxldGVEcmFmdChjb250ZXh0LCBhcHBDb21wb25lbnQsIGVuYWJsZVN0cmljdEhhbmRsaW5nKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGU6IHVua25vd24pIHtcblx0XHRcdFx0XHRcdFx0TG9nLmVycm9yKGBGRSA6IGNvcmUgOiBEZWxldGVIZWxwZXIgOiBFcnJvciB3aGlsZSBkaXNjYXJkaW5nIGRyYWZ0IHdpdGggcGF0aCA6ICR7Y29udGV4dC5nZXRQYXRoKCl9YCk7XG5cdFx0XHRcdFx0XHRcdGRyYWZ0RXJyb3JzLnB1c2goZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblxuXHRcdFx0XHRhd2FpdCBQcm9taXNlLmFsbChcblx0XHRcdFx0XHRjb250ZXh0cy5tYXAoZnVuY3Rpb24gKGNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRcdFx0XHRcdGlmIChkcmFmdEVuYWJsZWQgJiYgIWNvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSkge1xuXHRcdFx0XHRcdFx0XHQvL2RlbGV0ZSB0aGUgZHJhZnRcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGRyYWZ0LmRlbGV0ZURyYWZ0KGNvbnRleHQsIGFwcENvbXBvbmVudCwgZW5hYmxlU3RyaWN0SGFuZGxpbmcpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRleHQuZGVsZXRlKCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblx0XHRcdFx0YXdhaXQgZGVsZXRlSGVscGVyLmFmdGVyRGVsZXRlUHJvY2VzcyhtUGFyYW1ldGVycywgb3B0aW9ucywgY29udGV4dHMsIHJlc291cmNlTW9kZWwsIGxhc3REZWxldGVkUm93SW5kZXgpO1xuXHRcdFx0XHRpZiAoZHJhZnRFcnJvcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdHRocm93IEVycm9yKGBGRSA6IGNvcmUgOiBEZWxldGVIZWxwZXIgOiBFcnJvcnMgb24gZHJhZnQgZGVsZXRlIDogJHtkcmFmdEVycm9yc31gKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coeyBjb250cm9sOiBwYXJlbnRDb250cm9sIH0pO1xuXHRcdFx0XHQvLyByZS10aHJvdyBlcnJvciB0byBlbmZvcmNlIHJlamVjdGluZyB0aGUgZ2VuZXJhbCBwcm9taXNlXG5cdFx0XHRcdHRocm93IGVycm9yO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdFx0Ly8gcmUtdGhyb3cgZXJyb3IgdG8gZW5mb3JjZSByZWplY3RpbmcgdGhlIGdlbmVyYWwgcHJvbWlzZVxuXHRcdHRocm93IG9FcnJvcjtcblx0fVxufVxuXG4vLyBUYWJsZSBSdW50aW1lIEhlbHBlcnM6XG5cbi8qIHJlZnJlc2hlcyBkYXRhIGluIGludGVybmFsIG1vZGVsIHJlbGV2YW50IGZvciBlbmFibGVtZW50IG9mIGRlbGV0ZSBidXR0b24gYWNjb3JkaW5nIHRvIHNlbGVjdGVkIGNvbnRleHRzXG5yZWxldmFudCBkYXRhIGFyZTogZGVsZXRhYmxlQ29udGV4dHMsIGRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmUsIGRyYWZ0c1dpdGhOb25EZWxldGFibGVBY3RpdmUsIHVuU2F2ZWRDb250ZXh0cywgZGVsZXRlRW5hYmxlZFxubm90IHJlbGV2YW50OiBsb2NrZWRDb250ZXh0c1xuKi9cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZURlbGV0ZUluZm9Gb3JTZWxlY3RlZENvbnRleHRzKGludGVybmFsTW9kZWxDb250ZXh0OiBJbnRlcm5hbE1vZGVsQ29udGV4dCwgc2VsZWN0ZWRDb250ZXh0czogQ29udGV4dFtdKSB7XG5cdHR5cGUgY29udGV4dEluZm8gPSB7XG5cdFx0Y29udGV4dDogQ29udGV4dDtcblx0XHRzaWJsaW5nUHJvbWlzZTogUHJvbWlzZTxTaWJsaW5nSW5mb3JtYXRpb24gfCB1bmRlZmluZWQgfCB2b2lkPjtcblx0XHRzaWJsaW5nSW5mbzogU2libGluZ0luZm9ybWF0aW9uIHwgdW5kZWZpbmVkO1xuXHRcdGlzRHJhZnRSb290OiBib29sZWFuO1xuXHRcdGlzRHJhZnROb2RlOiBib29sZWFuO1xuXHRcdGlzQWN0aXZlOiBib29sZWFuO1xuXHRcdGhhc0FjdGl2ZTogYm9vbGVhbjtcblx0XHRoYXNEcmFmdDogYm9vbGVhbjtcblx0XHRsb2NrZWQ6IGJvb2xlYW47XG5cdFx0ZGVsZXRhYmxlOiBib29sZWFuO1xuXHRcdHNpYmxpbmdEZWxldGFibGU6IGJvb2xlYW47XG5cdH07XG5cdGNvbnN0IGNvbnRleHRJbmZvcyA9IHNlbGVjdGVkQ29udGV4dHMubWFwKChjb250ZXh0KSA9PiB7XG5cdFx0Ly8gYXNzdW1pbmcgbWV0YUNvbnRleHQgaXMgdGhlIHNhbWUgZm9yIGFsbCBjb250ZXh0cywgc3RpbGwgbm90IHJlbHlpbmcgb24gdGhpcyBhc3N1bXB0aW9uXG5cdFx0Y29uc3QgbWV0YUNvbnRleHQgPSBjb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0TWV0YUNvbnRleHQoY29udGV4dC5nZXRDYW5vbmljYWxQYXRoKCkpO1xuXHRcdGNvbnN0IGRlbGV0YWJsZVBhdGggPSBtZXRhQ29udGV4dC5nZXRQcm9wZXJ0eShcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlbGV0ZVJlc3RyaWN0aW9ucy9EZWxldGFibGUvJFBhdGhcIik7XG5cdFx0Y29uc3Qgc3RhdGljRGVsZXRhYmxlID1cblx0XHRcdCFkZWxldGFibGVQYXRoICYmIG1ldGFDb250ZXh0LmdldFByb3BlcnR5KFwiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRGVsZXRlUmVzdHJpY3Rpb25zL0RlbGV0YWJsZVwiKSAhPT0gZmFsc2U7XG5cdFx0Ly8gZGVmYXVsdCB2YWx1ZXMgYWNjb3JkaW5nIHRvIG5vbi1kcmFmdCBjYXNlIChzdGlja3kgYmVoYXZlcyB0aGUgc2FtZSBhcyBub24tZHJhZnQgZnJvbSBVSSBwb2ludCBvZiB2aWV3IHJlZ2FyZGluZyBkZWxldGlvbilcblx0XHRjb25zdCBpbmZvOiBjb250ZXh0SW5mbyA9IHtcblx0XHRcdGNvbnRleHQ6IGNvbnRleHQsXG5cdFx0XHRpc0RyYWZ0Um9vdDogISFtZXRhQ29udGV4dC5nZXRQcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCIpLFxuXHRcdFx0aXNEcmFmdE5vZGU6ICEhbWV0YUNvbnRleHQuZ2V0UHJvcGVydHkoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZVwiKSxcblx0XHRcdGlzQWN0aXZlOiB0cnVlLFxuXHRcdFx0aGFzQWN0aXZlOiBmYWxzZSxcblx0XHRcdGhhc0RyYWZ0OiBmYWxzZSxcblx0XHRcdGxvY2tlZDogZmFsc2UsXG5cdFx0XHRkZWxldGFibGU6IGRlbGV0YWJsZVBhdGggPyBjb250ZXh0LmdldFByb3BlcnR5KGRlbGV0YWJsZVBhdGgpIDogc3RhdGljRGVsZXRhYmxlLFxuXHRcdFx0c2libGluZ1Byb21pc2U6IFByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpLFxuXHRcdFx0c2libGluZ0luZm86IHVuZGVmaW5lZCxcblx0XHRcdHNpYmxpbmdEZWxldGFibGU6IGZhbHNlXG5cdFx0fTtcblxuXHRcdGlmIChpbmZvLmlzRHJhZnRSb290KSB7XG5cdFx0XHRpbmZvLmxvY2tlZCA9ICEhY29udGV4dC5nZXRPYmplY3QoXCJEcmFmdEFkbWluaXN0cmF0aXZlRGF0YVwiKT8uSW5Qcm9jZXNzQnlVc2VyO1xuXHRcdFx0aW5mby5oYXNEcmFmdCA9IGNvbnRleHQuZ2V0UHJvcGVydHkoXCJIYXNEcmFmdEVudGl0eVwiKTtcblx0XHR9XG5cdFx0aWYgKGluZm8uaXNEcmFmdFJvb3QpIHtcblx0XHRcdGluZm8uaXNBY3RpdmUgPSBjb250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0XHRpbmZvLmhhc0FjdGl2ZSA9IGNvbnRleHQuZ2V0UHJvcGVydHkoXCJIYXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0XHRpZiAoIWluZm8uaXNBY3RpdmUgJiYgaW5mby5oYXNBY3RpdmUpIHtcblx0XHRcdFx0Ly8gZ2V0IHNpYmxpbmcgY29udGV4dHMgKG9ubHkgcmVsZXZhbnQgZm9yIGRyYWZ0IHJvb3QsIG5vdCBmb3Igbm9kZXMpXG5cdFx0XHRcdC8vIGRyYWZ0LmNvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24gZXhwZWN0cyBkcmFmdCByb290IGFzIGZpcnN0IHBhcmFtZXRlciAtIGlmIHdlIGFyZSBvbiBhIHN1Ym5vZGUsIHRoaXMgaXMgbm90IGdpdmVuXG5cdFx0XHRcdC8vIC0gZG9uZSB3cm9uZyBhbHNvIGFib3ZlLCBidXQgc2VlbXMgbm90IHRvIGJyZWFrIGFueXRoaW5nXG5cdFx0XHRcdC8vIC0gd2h5IGlzIGRyYWZ0LmNvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24gbm90IGFibGUgdG8gY2FsY3VsYXRlIGRyYWZ0IHJvb3Qgb24gaXRzIG93bj8hXG5cdFx0XHRcdC8vIC0gYW5kIHdoeSBpcyBpdCBub3QgYWJsZSB0byBkZWFsIHdpdGggY29udGV4dHMgbm90IGRyYWZ0IGVuYWJsZWQgKG9mIGNvdXJzZSB0aGV5IG5ldmVyIGhhdmUgYSBzaWJsaW5nIC0gY291bGQganVzdCByZXR1cm4gdW5kZWZpbmVkKVxuXHRcdFx0XHRpbmZvLnNpYmxpbmdQcm9taXNlID0gZHJhZnQuY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihjb250ZXh0LCBjb250ZXh0KS50aGVuKGFzeW5jIChzaWJsaW5nSW5mb3JtYXRpb24pID0+IHtcblx0XHRcdFx0XHQvLyBGb3IgZHJhZnRXaXRoRGVsZXRhYmxlQWN0aXZlIGJ1Y2tldCwgY3VycmVudGx5IGFsc28gc2libGluZ0luZm9ybWF0aW9uIGlzIHB1dCBpbnRvIGludGVybmFsTW9kZWwgYW5kIHVzZWRcblx0XHRcdFx0XHQvLyBmcm9tIHRoZXJlIGluIGNhc2Ugb2YgZGVsZXRpb24uIFRoZXJlZm9yZSwgc2libGluZyBuZWVkcyB0byBiZSByZXRyaWV2ZWQgaW4gY2FzZSBvZiBzdGF0aWNEZWxldGFibGUuXG5cdFx0XHRcdFx0Ly8gUG9zc2libGUgaW1wcm92ZW1lbnQ6IE9ubHkgcmVhZCBzaWJsaW5nSW5mbyBoZXJlIGlmIG5lZWRlZCBmb3IgZGV0ZXJtaW5hdGlvbiBvZiBkZWxldGUgYnV0dG9uIGVuYWJsZW1lbnQsXG5cdFx0XHRcdFx0Ly8gaW4gb3RoZXIgY2FzZXMsIHJlYWQgaXQgb25seSBpZiBkZWxldGlvbiByZWFsbHkgaGFwcGVucy5cblx0XHRcdFx0XHRpbmZvLnNpYmxpbmdJbmZvID0gc2libGluZ0luZm9ybWF0aW9uO1xuXHRcdFx0XHRcdGlmIChkZWxldGFibGVQYXRoKSB7XG5cdFx0XHRcdFx0XHRpbmZvLnNpYmxpbmdEZWxldGFibGUgPSBhd2FpdCBzaWJsaW5nSW5mb3JtYXRpb24/LnRhcmdldENvbnRleHQ/LnJlcXVlc3RQcm9wZXJ0eShkZWxldGFibGVQYXRoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aW5mby5zaWJsaW5nRGVsZXRhYmxlID0gc3RhdGljRGVsZXRhYmxlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpbmZvO1xuXHR9KTtcblx0Ly8gd2FpdCBmb3IgYWxsIHNpYmxpbmdQcm9taXNlcy4gSWYgbm8gc2libGluZyBleGlzdHMsIHByb21pc2UgaXMgcmVzb2x2ZWQgdG8gdW5kZWZpbmVkIChidXQgaXQncyBzdGlsbCBhIHByb21pc2UpXG5cdGF3YWl0IFByb21pc2UuYWxsKGNvbnRleHRJbmZvcy5tYXAoKGluZm8pID0+IGluZm8uc2libGluZ1Byb21pc2UpKTtcblxuXHRjb25zdCBidWNrZXRzID0gW1xuXHRcdHtcblx0XHRcdGtleTogXCJkcmFmdHNXaXRoRGVsZXRhYmxlQWN0aXZlXCIsXG5cdFx0XHQvLyBvbmx5IGZvciBkcmFmdCByb290OiBJbiB0aGF0IGNhc2UsIHRoZSBkZWxldGUgcmVxdWVzdCBuZWVkcyB0byBiZSBzZW50IGZvciB0aGUgYWN0aXZlIChpLmUuIHRoZSBzaWJsaW5nKSxcblx0XHRcdC8vIHdoaWxlIGluIGRyYWZ0IG5vZGUsIHRoZSBkZWxldGUgcmVxdWVzdCBuZWVkcyB0byBiZSBzZW5kIGZvciB0aGUgZHJhZnQgaXRzZWxmXG5cdFx0XHR2YWx1ZTogY29udGV4dEluZm9zLmZpbHRlcigoaW5mbykgPT4gaW5mby5pc0RyYWZ0Um9vdCAmJiAhaW5mby5pc0FjdGl2ZSAmJiBpbmZvLmhhc0FjdGl2ZSAmJiBpbmZvLnNpYmxpbmdEZWxldGFibGUpXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRrZXk6IFwiZHJhZnRzV2l0aE5vbkRlbGV0YWJsZUFjdGl2ZVwiLFxuXHRcdFx0Ly8gb25seSBmb3IgZHJhZnQgcm9vdDogRm9yIGRyYWZ0IG5vZGUsIHdlIG9ubHkgcmVseSBvbiBpbmZvcm1hdGlvbiBpbiB0aGUgZHJhZnQgaXRzZWxmIChub3QgaXRzIGFjdGl2ZSBzaWJsaW5nKVxuXHRcdFx0Ly8gYXBwbGljYXRpb24gaGFzIHRvIHRha2UgY2FyZSB0byBzZXQgdGhpcyBjb3JyZWN0bHkgKGluIGNhc2UgYWN0aXZlIHNpYmxpbmcgbXVzdCBub3QgYmUgZGVsZXRhYmxlLCBhY3RpdmF0aW9uXG5cdFx0XHQvLyBvZiBkcmFmdCB3aXRoIGRlbGV0ZWQgbm9kZSB3b3VsZCBhbHNvIGRlbHRlIGFjdGl2ZSBzaWJsaW5nID0+IGRlbGV0aW9uIG9mIGRyYWZ0IG5vZGUgdG8gYmUgYXZvaWRlZClcblx0XHRcdHZhbHVlOiBjb250ZXh0SW5mb3MuZmlsdGVyKChpbmZvKSA9PiBpbmZvLmlzRHJhZnRSb290ICYmICFpbmZvLmlzQWN0aXZlICYmIGluZm8uaGFzQWN0aXZlICYmICFpbmZvLnNpYmxpbmdEZWxldGFibGUpXG5cdFx0fSxcblx0XHR7IGtleTogXCJsb2NrZWRDb250ZXh0c1wiLCB2YWx1ZTogY29udGV4dEluZm9zLmZpbHRlcigoaW5mbykgPT4gaW5mby5pc0RyYWZ0Um9vdCAmJiBpbmZvLmlzQWN0aXZlICYmIGluZm8uaGFzRHJhZnQgJiYgaW5mby5sb2NrZWQpIH0sXG5cdFx0e1xuXHRcdFx0a2V5OiBcInVuU2F2ZWRDb250ZXh0c1wiLFxuXHRcdFx0dmFsdWU6IGNvbnRleHRJbmZvcy5maWx0ZXIoKGluZm8pID0+IGluZm8uaXNEcmFmdFJvb3QgJiYgaW5mby5pc0FjdGl2ZSAmJiBpbmZvLmhhc0RyYWZ0ICYmICFpbmZvLmxvY2tlZClcblx0XHR9LFxuXHRcdC8vIG5vbi1kcmFmdC9zdGlja3kgYW5kIGRlbGV0YWJsZVxuXHRcdC8vIGFjdGl2ZSBkcmFmdCByb290IHdpdGhvdXQgYW55IGRyYWZ0IGFuZCBkZWxldGFibGVcblx0XHQvLyBjcmVhdGVkIGRyYWZ0IHJvb3QgKHJlZ2FyZGxlc3Mgb2YgZGVsZXRhYmxlKVxuXHRcdC8vIGRyYWZ0IG5vZGUgb25seSBhY2NvcmRpbmcgdG8gaXRzIGFubm90YXRpb25cblx0XHR7XG5cdFx0XHRrZXk6IFwiZGVsZXRhYmxlQ29udGV4dHNcIixcblx0XHRcdHZhbHVlOiBjb250ZXh0SW5mb3MuZmlsdGVyKFxuXHRcdFx0XHQoaW5mbykgPT5cblx0XHRcdFx0XHQoIWluZm8uaXNEcmFmdFJvb3QgJiYgIWluZm8uaXNEcmFmdE5vZGUgJiYgaW5mby5kZWxldGFibGUpIHx8XG5cdFx0XHRcdFx0KGluZm8uaXNEcmFmdFJvb3QgJiYgaW5mby5pc0FjdGl2ZSAmJiAhaW5mby5oYXNEcmFmdCAmJiBpbmZvLmRlbGV0YWJsZSkgfHxcblx0XHRcdFx0XHQoaW5mby5pc0RyYWZ0Um9vdCAmJiAhaW5mby5pc0FjdGl2ZSAmJiAhaW5mby5oYXNBY3RpdmUpIHx8XG5cdFx0XHRcdFx0KGluZm8uaXNEcmFmdE5vZGUgJiYgaW5mby5kZWxldGFibGUpXG5cdFx0XHQpXG5cdFx0fVxuXHRdO1xuXG5cdGZvciAoY29uc3QgeyBrZXksIHZhbHVlIH0gb2YgYnVja2V0cykge1xuXHRcdGludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFxuXHRcdFx0a2V5LFxuXHRcdFx0Ly8gQ3VycmVudGx5LCBidWNrZXQgZHJhZnRzV2l0aERlbGV0YWJsZUFjdGl2ZSBoYXMgYSBkaWZmZXJlbnQgc3RydWN0dXJlIChjb250YWluaW5nIGFsc28gc2libGluZyBpbmZvcm1hdGlvbiwgd2hpY2ggaXMgdXNlZFxuXHRcdFx0Ly8gaW4gY2FzZSBvZiBkZWxldGlvbikuIFBvc3NpYmxlIGltcHJvdmVtZW50OiBSZWFkIHNpYmxpbmcgaW5mb3JtYXRpb24gb25seSB3aGVuIG5lZWRlZCwgYW5kIGJ1aWxkIGFsbCBidWNrZXRzIHdpdGggc2FtZVxuXHRcdFx0Ly8gc3RydWN0dXJlLiBIb3dldmVyLCBpbiB0aGF0IGNhc2Ugc2libGluZ0luZm9ybWF0aW9uIG1pZ2h0IG5lZWQgdG8gYmUgcmVhZCB0d2ljZSAoaWYgYWxyZWFkeSBuZWVkZWQgZm9yIGJ1dHRvbiBlbmFibGVtZW50KSxcblx0XHRcdC8vIHRodXMgYSBidWZmZXIgcHJvYmFibHkgd291bGQgbWFrZSBzZW5zZS5cblx0XHRcdHZhbHVlLm1hcCgoaW5mbykgPT5cblx0XHRcdFx0a2V5ID09PSBcImRyYWZ0c1dpdGhEZWxldGFibGVBY3RpdmVcIiA/IHsgZHJhZnQ6IGluZm8uY29udGV4dCwgc2libGluZ0luZm86IGluZm8uc2libGluZ0luZm8gfSA6IGluZm8uY29udGV4dFxuXHRcdFx0KVxuXHRcdCk7XG5cdH1cbn1cblxuY29uc3QgZGVsZXRlSGVscGVyID0ge1xuXHRnZXROb25EZWxldGFibGVUZXh0LFxuXHRkZWxldGVDb25maXJtSGFuZGxlcixcblx0Z2V0T3B0aW9uc0ZvckRlbGV0YWJsZVRleHRzLFxuXHR1cGRhdGVDb250ZW50Rm9yRGVsZXRlRGlhbG9nLFxuXHR1cGRhdGVEcmFmdE9wdGlvbnNGb3JEZWxldGFibGVUZXh0cyxcblx0Z2V0Q29uZmlybWVkRGVsZXRhYmxlQ29udGV4dCxcblx0Z2V0TG9ja2VkT2JqZWN0c1RleHQsXG5cdGdldFVuc2F2ZWRDb250ZXh0c1RleHQsXG5cdGdldE5vbkRlbGV0YWJsZUFjdGl2ZXNPZkRyYWZ0c1RleHQsXG5cdGFmdGVyRGVsZXRlUHJvY2Vzcyxcblx0dXBkYXRlRGVsZXRlSW5mb0ZvclNlbGVjdGVkQ29udGV4dHMsXG5cdERlbGV0ZU9wdGlvblR5cGVzLFxuXHREZWxldGVEaWFsb2dDb250ZW50Q29udHJvbCxcblx0c2V0Rm9jdXNBZnRlckRlbGV0ZVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZGVsZXRlSGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O01BaUJLQSxpQkFBaUI7RUFBQSxXQUFqQkEsaUJBQWlCO0lBQWpCQSxpQkFBaUI7SUFBakJBLGlCQUFpQjtJQUFqQkEsaUJBQWlCO0lBQWpCQSxpQkFBaUI7SUFBakJBLGlCQUFpQjtFQUFBLEdBQWpCQSxpQkFBaUIsS0FBakJBLGlCQUFpQjtFQUFBLElBUWpCQywwQkFBMEI7RUFBQSxXQUExQkEsMEJBQTBCO0lBQTFCQSwwQkFBMEI7SUFBMUJBLDBCQUEwQjtFQUFBLEdBQTFCQSwwQkFBMEIsS0FBMUJBLDBCQUEwQjtFQXlEL0IsU0FBU0Msb0JBQW9CLENBQzVCQyxvQkFBMEMsRUFDMUNDLElBQXVCLEVBQ3ZCQyxnQkFBMkIsRUFDM0JDLGdCQUEy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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/fe/macros/CommonHelper", "sap/fe/macros/controls/FieldWrapper", "sap/fe/macros/field/FieldAPI", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageType", "sap/m/library", "sap/m/MessageBox", "sap/m/ResponsivePopover", "sap/ui/core/Core", "sap/ui/core/IconPool", "sap/ui/Device", "sap/ui/model/Filter", "sap/ui/unified/FileUploaderParameter", "sap/ui/util/openWindow"], function (Log, CommonUtils, CollaborationActivitySync, CollaborationCommon, draft, KeepAliveHelper, ModelHelper, ResourceModelHelper, CommonHelper, FieldWrapper, FieldAPI, IllustratedMessage, IllustratedMessageType, mobilelibrary, MessageBox, ResponsivePopover, Core, IconPool, Device, Filter, FileUploaderParameter, openWindow) {
  "use strict";

  var system = Device.system;
  var getResourceModel = ResourceModelHelper.getResourceModel;
  var Activity = CollaborationCommon.Activity;
  /**
   * Gets the binding used for collaboration notifications.
   *
   * @param field
   * @returns The binding
   */
  function getCollaborationBinding(field) {
    let binding = field.getBindingContext().getBinding();
    if (!binding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
      const oView = CommonUtils.getTargetView(field);
      binding = oView.getBindingContext().getBinding();
    }
    return binding;
  }

  /**
   * Static class used by "sap.ui.mdc.Field" during runtime
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  const FieldRuntime = {
    resetChangesHandler: undefined,
    uploadPromises: undefined,
    /**
     * Triggers an internal navigation on the link pertaining to DataFieldWithNavigationPath.
     *
     * @param oSource Source of the press event
     * @param oController Instance of the controller
     * @param sNavPath The navigation path
     */
    onDataFieldWithNavigationPath: function (oSource, oController, sNavPath) {
      if (oController._routing) {
        let oBindingContext = oSource.getBindingContext();
        const oView = CommonUtils.getTargetView(oSource),
          oMetaModel = oBindingContext.getModel().getMetaModel(),
          fnNavigate = function (oContext) {
            if (oContext) {
              oBindingContext = oContext;
            }
            oController._routing.navigateToTarget(oBindingContext, sNavPath, true);
          };
        // Show draft loss confirmation dialog in case of Object page
        if (oView.getViewData().converterType === "ObjectPage" && !ModelHelper.isStickySessionSupported(oMetaModel)) {
          draft.processDataLossOrDraftDiscardConfirmation(fnNavigate, Function.prototype, oBindingContext, oView.getController(), true, draft.NavigationType.ForwardNavigation);
        } else {
          fnNavigate();
        }
      } else {
        Log.error("FieldRuntime: No routing listener controller extension found. Internal navigation aborted.", "sap.fe.macros.field.FieldRuntime", "onDataFieldWithNavigationPath");
      }
    },
    isDraftIndicatorVisible: function (sPropertyPath, sSemanticKeyHasDraftIndicator, HasDraftEntity, IsActiveEntity, hideDraftInfo) {
      if (IsActiveEntity !== undefined && HasDraftEntity !== undefined && (!IsActiveEntity || HasDraftEntity) && !hideDraftInfo) {
        return sPropertyPath === sSemanticKeyHasDraftIndicator;
      } else {
        return false;
      }
    },
    /**
     * Handler for the validateFieldGroup event.
     *
     * @function
     * @name onValidateFieldGroup
     * @param oController The controller of the page containing the field
     * @param oEvent The event object passed by the validateFieldGroup event
     */
    onValidateFieldGroup: function (oController, oEvent) {
      const oFEController = FieldRuntime._getExtensionController(oController);
      oFEController._sideEffects.handleFieldGroupChange(oEvent);
    },
    /**
     * Handler for the change event.
     * Store field group IDs of this field for requesting side effects when required.
     * We store them here to ensure a change in the value of the field has taken place.
     *
     * @function
     * @name handleChange
     * @param oController The controller of the page containing the field
     * @param oEvent The event object passed by the change event
     */
    handleChange: function (oController, oEvent) {
      const oSourceField = oEvent.getSource(),
        bIsTransient = oSourceField && oSourceField.getBindingContext().isTransient(),
        pValueResolved = oEvent.getParameter("promise") || Promise.resolve(),
        oSource = oEvent.getSource(),
        bValid = oEvent.getParameter("valid"),
        fieldValidity = this.getFieldStateOnChange(oEvent).state["validity"];

      // TODO: currently we have undefined and true... and our creation row implementation relies on this.
      // I would move this logic to this place as it's hard to understand for field consumer

      pValueResolved.then(function () {
        // The event is gone. For now we'll just recreate it again
        oEvent.oSource = oSource;
        oEvent.mParameters = {
          valid: bValid
        };
        FieldAPI.handleChange(oEvent, oController);
      }).catch(function /*oError: any*/
      () {
        // The event is gone. For now we'll just recreate it again
        oEvent.oSource = oSource;
        oEvent.mParameters = {
          valid: false
        };

        // as the UI might need to react on. We could provide a parameter to inform if validation
        // was successful?
        FieldAPI.handleChange(oEvent, oController);
      });

      // Use the FE Controller instead of the extensionAPI to access internal FE controllers
      const oFEController = FieldRuntime._getExtensionController(oController);
      oFEController.editFlow.syncTask(pValueResolved);

      // if the context is transient, it means the request would fail anyway as the record does not exist in reality
      // TODO: should the request be made in future if the context is transient?
      if (bIsTransient) {
        return;
      }

      // SIDE EFFECTS
      oFEController._sideEffects.handleFieldChange(oEvent, fieldValidity, pValueResolved);

      // Collaboration Draft Activity Sync
      const oField = oEvent.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled && fieldValidity) {
        var _ref, _oField$getBindingInf;
        /* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
        		unit or currency only the amount is considered) */
        const binding = getCollaborationBinding(oField);
        const data = [...(((_ref = oField.getBindingInfo("value") || oField.getBindingInfo("selected")) === null || _ref === void 0 ? void 0 : _ref.parts) || []), ...(((_oField$getBindingInf = oField.getBindingInfo("additionalValue")) === null || _oField$getBindingInf === void 0 ? void 0 : _oField$getBindingInf.parts) || [])].map(function (part) {
          if (part) {
            var _oField$getBindingCon;
            return `${(_oField$getBindingCon = oField.getBindingContext()) === null || _oField$getBindingCon === void 0 ? void 0 : _oField$getBindingCon.getPath()}/${part.path}`;
          }
        });
        const updateCollaboration = () => {
          if (binding.hasPendingChanges()) {
            // The value has been changed by the user --> wait until it's sent to the server before sending a notification to other users
            binding.attachEventOnce("patchCompleted", function () {
              CollaborationActivitySync.send(oField, Activity.Change, data);
            });
          } else {
            // No changes --> send a Undo notification
            CollaborationActivitySync.send(oField, Activity.Undo, data);
          }
        };
        if (oSourceField.isA("sap.ui.mdc.Field")) {
          pValueResolved.then(() => {
            updateCollaboration();
          }).catch(() => {
            updateCollaboration();
          });
        } else {
          updateCollaboration();
        }
      }
    },
    handleLiveChange: function (event) {
      // Collaboration Draft Activity Sync
      const field = event.getSource();
      if (CollaborationActivitySync.isConnected(field)) {
        /* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
        		unit or currency only the amount is considered) */
        const bindingPath = field.getBindingInfo("value").parts[0].path;
        const fullPath = `${field.getBindingContext().getPath()}/${bindingPath}`;
        CollaborationActivitySync.send(field, Activity.LiveChange, fullPath);

        // If the user reverted the change no change event is sent therefore we have to handle it here
        if (!this.resetChangesHandler) {
          this.resetChangesHandler = () => {
            // We need to wait a little bit for the focus to be updated
            setTimeout(() => {
              if (field.isA("sap.ui.mdc.Field")) {
                const focusedControl = Core.byId(Core.getCurrentFocusedControlId());
                if ((focusedControl === null || focusedControl === void 0 ? void 0 : focusedControl.getParent()) === field) {
                  // We're still un the same MDC Field --> do nothing
                  return;
                }
              }
              field.detachBrowserEvent("focusout", this.resetChangesHandler);
              delete this.resetChangesHandler;
              CollaborationActivitySync.send(field, Activity.Undo, fullPath);
            }, 100);
          };
          field.attachBrowserEvent("focusout", this.resetChangesHandler);
        }
      }
    },
    handleOpenPicker: function (oEvent) {
      // Collaboration Draft Activity Sync
      const oField = oEvent.getSource();
      const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        const sBindingPath = oField.getBindingInfo("value").parts[0].path;
        const sFullPath = `${oField.getBindingContext().getPath()}/${sBindingPath}`;
        CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);
      }
    },
    handleClosePicker: function (oEvent) {
      // Collaboration Draft Activity Sync
      const oField = oEvent.getSource();
      const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        const binding = getCollaborationBinding(oField);
        if (!binding.hasPendingChanges()) {
          // If there are no pending changes, the picker was closed without changing the value --> send a UNDO notification
          // In case there were changes, notifications are managed in handleChange
          const sBindingPath = oField.getBindingInfo("value").parts[0].path;
          const sFullPath = `${oField.getBindingContext().getPath()}/${sBindingPath}`;
          CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
        }
      }
    },
    _sendCollaborationMessageForFileUploader(fileUploader, activity) {
      const isCollaborationEnabled = CollaborationActivitySync.isConnected(fileUploader);
      if (isCollaborationEnabled) {
        var _fileUploader$getPare, _fileUploader$getBind;
        const bindingPath = (_fileUploader$getPare = fileUploader.getParent()) === null || _fileUploader$getPare === void 0 ? void 0 : _fileUploader$getPare.getProperty("propertyPath");
        const fullPath = `${(_fileUploader$getBind = fileUploader.getBindingContext()) === null || _fileUploader$getBind === void 0 ? void 0 : _fileUploader$getBind.getPath()}/${bindingPath}`;
        CollaborationActivitySync.send(fileUploader, activity, fullPath);
      }
    },
    handleOpenUploader: function (event) {
      // Collaboration Draft Activity Sync
      const fileUploader = event.getSource();
      FieldRuntime._sendCollaborationMessageForFileUploader(fileUploader, Activity.LiveChange);
    },
    handleCloseUploader: function (event) {
      // Collaboration Draft Activity Sync
      const fileUploader = event.getSource();
      FieldRuntime._sendCollaborationMessageForFileUploader(fileUploader, Activity.Undo);
    },
    /**
     * Gets the field value and validity on a change event.
     *
     * @function
     * @name fieldValidityOnChange
     * @param oEvent The event object passed by the change event
     * @returns Field value and validity
     */
    getFieldStateOnChange: function (oEvent) {
      let oSourceField = oEvent.getSource(),
        mFieldState = {};
      const _isBindingStateMessages = function (oBinding) {
        return oBinding && oBinding.getDataState() ? oBinding.getDataState().getInvalidValue() === undefined : true;
      };
      if (oSourceField.isA("sap.fe.macros.field.FieldAPI")) {
        oSourceField = oSourceField.getContent();
      }
      if (oSourceField.isA(FieldWrapper.getMetadata().getName()) && oSourceField.getEditMode() === "Editable") {
        oSourceField = oSourceField.getContentEdit()[0];
      }
      if (oSourceField.isA("sap.ui.mdc.Field")) {
        let bIsValid = oEvent.getParameter("valid") || oEvent.getParameter("isValid");
        if (bIsValid === undefined) {
          if (oSourceField.getMaxConditions() === 1) {
            const oValueBindingInfo = oSourceField.getBindingInfo("value");
            bIsValid = _isBindingStateMessages(oValueBindingInfo && oValueBindingInfo.binding);
          }
          if (oSourceField.getValue() === "" && !oSourceField.getProperty("required")) {
            bIsValid = true;
          }
        }
        mFieldState = {
          fieldValue: oSourceField.getValue(),
          validity: !!bIsValid
        };
      } else {
        // oSourceField extends from a FileUploader || Input || is a CheckBox
        const oBinding = oSourceField.getBinding("uploadUrl") || oSourceField.getBinding("value") || oSourceField.getBinding("selected");
        mFieldState = {
          fieldValue: oBinding && oBinding.getValue(),
          validity: _isBindingStateMessages(oBinding)
        };
      }
      return {
        field: oSourceField,
        state: mFieldState
      };
    },
    _fnFixHashQueryString: function (sCurrentHash) {
      if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
        // sCurrentHash can contain query string, cut it off!
        sCurrentHash = sCurrentHash.split("?")[0];
      }
      return sCurrentHash;
    },
    _fnGetLinkInformation: function (_oSource, _oLink, _sPropertyPath, _sValue, fnSetActive) {
      const oModel = _oLink && _oLink.getModel();
      const oMetaModel = oModel && oModel.getMetaModel();
      const sSemanticObjectName = _sValue || _oSource && _oSource.getValue();
      const oView = _oLink && CommonUtils.getTargetView(_oLink);
      const oInternalModelContext = oView && oView.getBindingContext("internal");
      const oAppComponent = oView && CommonUtils.getAppComponent(oView);
      const oShellServiceHelper = oAppComponent && oAppComponent.getShellServices();
      const pGetLinksPromise = oShellServiceHelper && oShellServiceHelper.getLinksWithCache([[{
        semanticObject: sSemanticObjectName
      }]]);
      const aSemanticObjectUnavailableActions = oMetaModel && oMetaModel.getObject(`${_sPropertyPath}@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions`);
      return {
        SemanticObjectName: sSemanticObjectName,
        SemanticObjectFullPath: _sPropertyPath,
        //sSemanticObjectFullPath,
        MetaModel: oMetaModel,
        InternalModelContext: oInternalModelContext,
        ShellServiceHelper: oShellServiceHelper,
        GetLinksPromise: pGetLinksPromise,
        SemanticObjectUnavailableActions: aSemanticObjectUnavailableActions,
        fnSetActive: fnSetActive
      };
    },
    _fnQuickViewHasNewCondition: function (oSemanticObjectPayload, _oLinkInfo) {
      if (oSemanticObjectPayload && oSemanticObjectPayload.path && oSemanticObjectPayload.path === _oLinkInfo.SemanticObjectFullPath) {
        // Got the resolved Semantic Object!
        const bResultingNewConditionForConditionalWrapper = oSemanticObjectPayload[!_oLinkInfo.SemanticObjectUnavailableActions ? "HasTargetsNotFiltered" : "HasTargets"];
        _oLinkInfo.fnSetActive(!!bResultingNewConditionForConditionalWrapper);
        return true;
      } else {
        return false;
      }
    },
    _fnQuickViewSetNewConditionForConditionalWrapper: function (_oLinkInfo, _oFinalSemanticObjects) {
      if (_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]) {
        let sTmpPath, oSemanticObjectPayload;
        const aSemanticObjectPaths = Object.keys(_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]);
        for (const iPathsCount in aSemanticObjectPaths) {
          sTmpPath = aSemanticObjectPaths[iPathsCount];
          oSemanticObjectPayload = _oFinalSemanticObjects[_oLinkInfo.SemanticObjectName] && _oFinalSemanticObjects[_oLinkInfo.SemanticObjectName][sTmpPath];
          if (FieldRuntime._fnQuickViewHasNewCondition(oSemanticObjectPayload, _oLinkInfo)) {
            break;
          }
        }
      }
    },
    _fnUpdateSemanticObjectsTargetModel: function (oEvent, sValue, oControl, _sPropertyPath) {
      const oSource = oEvent && oEvent.getSource();
      let fnSetActive;
      if (oControl.isA("sap.m.ObjectStatus")) {
        fnSetActive = bActive => oControl.setActive(bActive);
      }
      if (oControl.isA("sap.m.ObjectIdentifier")) {
        fnSetActive = bActive => oControl.setTitleActive(bActive);
      }
      const oConditionalWrapper = oControl && oControl.getParent();
      if (oConditionalWrapper && oConditionalWrapper.isA("sap.fe.macros.controls.ConditionalWrapper")) {
        fnSetActive = bActive => oConditionalWrapper.setCondition(bActive);
      }
      if (fnSetActive !== undefined) {
        const oLinkInfo = FieldRuntime._fnGetLinkInformation(oSource, oControl, _sPropertyPath, sValue, fnSetActive);
        oLinkInfo.fnSetActive = fnSetActive;
        const sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getAppComponent(oControl).getShellServices().getHash());
        CommonUtils.updateSemanticTargets([oLinkInfo.GetLinksPromise], [{
          semanticObject: oLinkInfo.SemanticObjectName,
          path: oLinkInfo.SemanticObjectFullPath
        }], oLinkInfo.InternalModelContext, sCurrentHash).then(function (oFinalSemanticObjects) {
          if (oFinalSemanticObjects) {
            FieldRuntime._fnQuickViewSetNewConditionForConditionalWrapper(oLinkInfo, oFinalSemanticObjects);
          }
        }).catch(function (oError) {
          Log.error("Cannot update Semantic Targets model", oError);
        });
      }
    },
    _checkControlHasModelAndBindingContext(_control) {
      if (!_control.getModel() || !_control.getBindingContext()) {
        return false;
      } else {
        return true;
      }
    },
    _checkCustomDataValueBeforeUpdatingSemanticObjectModel(_control, propertyPath, aCustomData) {
      let sSemanticObjectPathValue;
      let oValueBinding;
      const _fnCustomDataValueIsString = function (semanticObjectPathValue) {
        return !(semanticObjectPathValue !== null && typeof semanticObjectPathValue === "object");
      };
      // remove technical custom datas set by UI5
      aCustomData = aCustomData.filter(customData => customData.getKey() !== "sap-ui-custom-settings");
      for (const index in aCustomData) {
        sSemanticObjectPathValue = aCustomData[index].getValue();
        if (!sSemanticObjectPathValue && _fnCustomDataValueIsString(sSemanticObjectPathValue)) {
          oValueBinding = aCustomData[index].getBinding("value");
          if (oValueBinding) {
            oValueBinding.attachEventOnce("change", function (_oChangeEvent) {
              FieldRuntime._fnUpdateSemanticObjectsTargetModel(_oChangeEvent, null, _control, propertyPath);
            });
          }
        } else if (_fnCustomDataValueIsString(sSemanticObjectPathValue)) {
          FieldRuntime._fnUpdateSemanticObjectsTargetModel(null, sSemanticObjectPathValue, _control, propertyPath);
        }
      }
    },
    LinkModelContextChange: function (oEvent, sProperty, sPathToProperty) {
      const control = oEvent.getSource();
      if (FieldRuntime._checkControlHasModelAndBindingContext(control)) {
        const sPropertyPath = `${sPathToProperty}/${sProperty}`;
        const mdcLink = control.getDependents().length ? control.getDependents()[0] : undefined;
        const aCustomData = mdcLink === null || mdcLink === void 0 ? void 0 : mdcLink.getCustomData();
        if (aCustomData && aCustomData.length > 0) {
          FieldRuntime._checkCustomDataValueBeforeUpdatingSemanticObjectModel(control, sPropertyPath, aCustomData);
        }
      }
    },
    openExternalLink: function (event) {
      const source = event.getSource();
      if (source.data("url") && source.getProperty("text") !== "") {
        // This opens the link in the same tab as the link. It was done to be more consistent with other type of links.
        openWindow(source.data("url"), "_self");
      }
    },
    createPopoverWithNoTargets: function (mdcLink) {
      const mdcLinkId = mdcLink.getId();
      const illustratedMessageSettings = {
        title: getResourceModel(mdcLink).getText("M_ILLUSTRATEDMESSAGE_TITLE"),
        description: getResourceModel(mdcLink).getText("M_ILLUSTRATEDMESSAGE_DESCRIPTION"),
        enableFormattedText: true,
        illustrationSize: "Dot",
        // IllustratedMessageSize.Dot not available in "@types/openui5": "1.107.0"
        illustrationType: IllustratedMessageType.Tent
      };
      const illustratedMessage = new IllustratedMessage(`${mdcLinkId}-illustratedmessage`, illustratedMessageSettings);
      const popoverSettings = {
        horizontalScrolling: false,
        showHeader: system.phone,
        placement: mobilelibrary.PlacementType.Auto,
        content: [illustratedMessage],
        afterClose: function (event) {
          if (event.getSource()) {
            event.getSource().destroy();
          }
        }
      };
      return new ResponsivePopover(`${mdcLinkId}-popover`, popoverSettings);
    },
    openLink: async function (mdcLink, sapmLink) {
      try {
        const hRef = await mdcLink.getTriggerHref();
        if (!hRef) {
          try {
            const linkItems = await mdcLink.retrieveLinkItems();
            if ((linkItems === null || linkItems === void 0 ? void 0 : linkItems.length) === 0 && mdcLink.getPayload().hasQuickViewFacets === "false") {
              const popover = FieldRuntime.createPopoverWithNoTargets(mdcLink);
              mdcLink.addDependent(popover);
              popover.openBy(sapmLink);
            } else {
              await mdcLink.open(sapmLink);
            }
          } catch (error) {
            Log.error(`Cannot retrieve the QuickView Popover dialog: ${error}`);
          }
        } else {
          const view = CommonUtils.getTargetView(sapmLink);
          const appComponent = CommonUtils.getAppComponent(view);
          const shellService = appComponent.getShellServices();
          const shellHash = shellService.parseShellHash(hRef);
          const navArgs = {
            target: {
              semanticObject: shellHash.semanticObject,
              action: shellHash.action
            },
            params: shellHash.params
          };
          KeepAliveHelper.storeControlRefreshStrategyForHash(view, shellHash);
          if (CommonUtils.isStickyEditMode(sapmLink) !== true) {
            //URL params and xappState has been generated earlier hence using toExternal
            shellService.toExternal(navArgs, appComponent);
          } else {
            try {
              const newHref = await shellService.hrefForExternalAsync(navArgs, appComponent);
              openWindow(newHref);
            } catch (error) {
              Log.error(`Error while retireving hrefForExternal : ${error}`);
            }
          }
        }
      } catch (error) {
        Log.error(`Error triggering link Href: ${error}`);
      }
    },
    pressLink: async function (oEvent) {
      const oSource = oEvent.getSource();
      const sapmLink = oSource.isA("sap.m.ObjectIdentifier") ? oSource.findElements(false, elem => {
        return elem.isA("sap.m.Link");
      })[0] : oSource;
      if (oSource.getDependents() && oSource.getDependents().length > 0 && sapmLink.getProperty("text") !== "") {
        const oFieldInfo = oSource.getDependents()[0];
        if (oFieldInfo && oFieldInfo.isA("sap.ui.mdc.Link")) {
          await FieldRuntime.openLink(oFieldInfo, sapmLink);
        }
      }
      return sapmLink;
    },
    uploadStream: function (controller, event) {
      const fileUploader = event.getSource(),
        FEController = FieldRuntime._getExtensionController(controller),
        fileWrapper = fileUploader.getParent(),
        uploadUrl = fileWrapper.getUploadUrl();
      if (uploadUrl !== "") {
        var _fileUploader$getMode, _fileUploader$getBind2;
        fileWrapper.setUIBusy(true);

        // use uploadUrl from FileWrapper which returns a canonical URL
        fileUploader.setUploadUrl(uploadUrl);
        fileUploader.removeAllHeaderParameters();
        const token = (_fileUploader$getMode = fileUploader.getModel()) === null || _fileUploader$getMode === void 0 ? void 0 : _fileUploader$getMode.getHttpHeaders()["X-CSRF-Token"];
        if (token) {
          const headerParameterCSRFToken = new FileUploaderParameter();
          headerParameterCSRFToken.setName("x-csrf-token");
          headerParameterCSRFToken.setValue(token);
          fileUploader.addHeaderParameter(headerParameterCSRFToken);
        }
        const eTag = (_fileUploader$getBind2 = fileUploader.getBindingContext()) === null || _fileUploader$getBind2 === void 0 ? void 0 : _fileUploader$getBind2.getProperty("@odata.etag");
        if (eTag) {
          const headerParameterETag = new FileUploaderParameter();
          headerParameterETag.setName("If-Match");
          // Ignore ETag in collaboration draft
          headerParameterETag.setValue(CollaborationActivitySync.isConnected(fileUploader) ? "*" : eTag);
          fileUploader.addHeaderParameter(headerParameterETag);
        }
        const headerParameterAccept = new FileUploaderParameter();
        headerParameterAccept.setName("Accept");
        headerParameterAccept.setValue("application/json");
        fileUploader.addHeaderParameter(headerParameterAccept);

        // synchronize upload with other requests
        const uploadPromise = new Promise((resolve, reject) => {
          this.uploadPromises = this.uploadPromises || {};
          this.uploadPromises[fileUploader.getId()] = {
            resolve: resolve,
            reject: reject
          };
          fileUploader.upload();
        });
        FEController.editFlow.syncTask(uploadPromise);
      } else {
        MessageBox.error(getResourceModel(controller).getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT"));
      }
    },
    handleUploadComplete: function (event, propertyFileName, propertyPath, controller) {
      const status = event.getParameter("status"),
        fileUploader = event.getSource(),
        fileWrapper = fileUploader.getParent();
      fileWrapper.setUIBusy(false);
      const context = fileUploader.getBindingContext();
      if (status === 0 || status >= 400) {
        this._displayMessageForFailedUpload(event);
        this.uploadPromises[fileUploader.getId()].reject();
      } else {
        var _fileWrapper$avatar;
        const newETag = event.getParameter("headers").etag;
        if (newETag) {
          // set new etag for filename update, but without sending patch request
          context === null || context === void 0 ? void 0 : context.setProperty("@odata.etag", newETag, null);
        }

        // set filename for link text
        if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
          context === null || context === void 0 ? void 0 : context.setProperty(propertyFileName.path, fileUploader.getValue());
        }

        // delete the avatar cache that not gets updated otherwise
        (_fileWrapper$avatar = fileWrapper.avatar) === null || _fileWrapper$avatar === void 0 ? void 0 : _fileWrapper$avatar.refreshAvatarCacheBusting();
        this._callSideEffectsForStream(event, fileWrapper, controller);
        this.uploadPromises[fileUploader.getId()].resolve();
      }
      delete this.uploadPromises[fileUploader.getId()];

      // Collaboration Draft Activity Sync
      const isCollaborationEnabled = CollaborationActivitySync.isConnected(fileUploader);
      if (!isCollaborationEnabled || !context) {
        return;
      }
      const notificationData = [`${context.getPath()}/${propertyPath}`];
      if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
        notificationData.push(`${context.getPath()}/${propertyFileName.path}`);
      }
      let binding = context.getBinding();
      if (!binding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        const oView = CommonUtils.getTargetView(fileUploader);
        binding = oView.getBindingContext().getBinding();
      }
      if (binding.hasPendingChanges()) {
        binding.attachEventOnce("patchCompleted", () => {
          CollaborationActivitySync.send(fileWrapper, Activity.Change, notificationData);
        });
      } else {
        CollaborationActivitySync.send(fileWrapper, Activity.Change, notificationData);
      }
    },
    _displayMessageForFailedUpload: function (oEvent) {
      // handling of backend errors
      const sError = oEvent.getParameter("responseRaw") || oEvent.getParameter("response");
      let sMessageText, oError;
      try {
        oError = sError && JSON.parse(sError);
        sMessageText = oError.error && oError.error.message;
      } catch (e) {
        sMessageText = sError || getResourceModel(oEvent.getSource()).getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT");
      }
      MessageBox.error(sMessageText);
    },
    removeStream: function (event, propertyFileName, propertyPath, controller) {
      const deleteButton = event.getSource();
      const fileWrapper = deleteButton.getParent();
      const context = fileWrapper.getBindingContext();

      // streams are removed by assigning the null value
      context.setProperty(propertyPath, null);
      // When setting the property to null, the uploadUrl (@@MODEL.format) is set to "" by the model
      //	with that another upload is not possible before refreshing the page
      // (refreshing the page would recreate the URL)
      //	This is the workaround:
      //	We set the property to undefined only on the frontend which will recreate the uploadUrl
      context.setProperty(propertyPath, undefined, null);
      this._callSideEffectsForStream(event, fileWrapper, controller);

      // Collaboration Draft Activity Sync
      const bCollaborationEnabled = CollaborationActivitySync.isConnected(deleteButton);
      if (bCollaborationEnabled) {
        let binding = context.getBinding();
        if (!binding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          const oView = CommonUtils.getTargetView(deleteButton);
          binding = oView.getBindingContext().getBinding();
        }
        const data = [`${context.getPath()}/${propertyPath}`];
        if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
          data.push(`${context.getPath()}/${propertyFileName.path}`);
        }
        CollaborationActivitySync.send(deleteButton, Activity.LiveChange, data);
        binding.attachEventOnce("patchCompleted", function () {
          CollaborationActivitySync.send(deleteButton, Activity.Change, data);
        });
      }
    },
    _callSideEffectsForStream: function (oEvent, oControl, oController) {
      const oFEController = FieldRuntime._getExtensionController(oController);
      if (oControl && oControl.getBindingContext().isTransient()) {
        return;
      }
      if (oControl) {
        oEvent.oSource = oControl;
      }
      oFEController._sideEffects.handleFieldChange(oEvent, this.getFieldStateOnChange(oEvent).state["validity"]);
    },
    getIconForMimeType: function (sMimeType) {
      return IconPool.getIconForMimeType(sMimeType);
    },
    /**
     * Method to retrieve text from value list for DataField.
     *
     * @function
     * @name retrieveTextFromValueList
     * @param sPropertyValue The property value of the datafield
     * @param sPropertyFullPath The property full path's
     * @param sDisplayFormat The display format for the datafield
     * @returns The formatted value in corresponding display format.
     */
    retrieveTextFromValueList: function (sPropertyValue, sPropertyFullPath, sDisplayFormat) {
      let sTextProperty;
      let oMetaModel;
      let sPropertyName;
      if (sPropertyValue) {
        oMetaModel = CommonHelper.getMetaModel();
        sPropertyName = oMetaModel.getObject(`${sPropertyFullPath}@sapui.name`);
        return oMetaModel.requestValueListInfo(sPropertyFullPath, true).then(function (mValueListInfo) {
          // take the "" one if exists, otherwise take the first one in the object TODO: to be discussed
          const oValueListInfo = mValueListInfo[mValueListInfo[""] ? "" : Object.keys(mValueListInfo)[0]];
          const oValueListModel = oValueListInfo.$model;
          const oMetaModelValueList = oValueListModel.getMetaModel();
          const oParamWithKey = oValueListInfo.Parameters.find(function (oParameter) {
            return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
          });
          if (oParamWithKey && !oParamWithKey.ValueListProperty) {
            return Promise.reject(`Inconsistent value help annotation for ${sPropertyName}`);
          }
          const oTextAnnotation = oMetaModelValueList.getObject(`/${oValueListInfo.CollectionPath}/${oParamWithKey.ValueListProperty}@com.sap.vocabularies.Common.v1.Text`);
          if (oTextAnnotation && oTextAnnotation.$Path) {
            sTextProperty = oTextAnnotation.$Path;
            const oFilter = new Filter({
              path: oParamWithKey.ValueListProperty,
              operator: "EQ",
              value1: sPropertyValue
            });
            const oListBinding = oValueListModel.bindList(`/${oValueListInfo.CollectionPath}`, undefined, undefined, oFilter, {
              $select: sTextProperty
            });
            return oListBinding.requestContexts(0, 2);
          } else {
            sDisplayFormat = "Value";
            return sPropertyValue;
          }
        }).then(function (aContexts) {
          var _aContexts$;
          const sDescription = sTextProperty ? (_aContexts$ = aContexts[0]) === null || _aContexts$ === void 0 ? void 0 : _aContexts$.getObject()[sTextProperty] : "";
          switch (sDisplayFormat) {
            case "Description":
              return sDescription;
            case "DescriptionValue":
              return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [sDescription, sPropertyValue]);
            case "ValueDescription":
              return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [sPropertyValue, sDescription]);
            default:
              return sPropertyValue;
          }
        }).catch(function (oError) {
          const sMsg = oError.status && oError.status === 404 ? `Metadata not found (${oError.status}) for value help of property ${sPropertyFullPath}` : oError.message;
          Log.error(sMsg);
        });
      }
      return sPropertyValue;
    },
    handleTypeMissmatch: function (oEvent) {
      const resourceModel = getResourceModel(oEvent.getSource());
      MessageBox.error(resourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE"), {
        details: `<p><strong>${resourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_SELECTED")}</strong></p>${oEvent.getParameters().mimeType}<br><br>` + `<p><strong>${resourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_ALLOWED")}</strong></p>${oEvent.getSource().getMimeType().toString().replaceAll(",", ", ")}`,
        contentWidth: "150px"
      });
    },
    handleFileSizeExceed: function (oEvent) {
      MessageBox.error(getResourceModel(oEvent.getSource()).getText("M_FIELD_FILEUPLOADER_FILE_TOO_BIG", oEvent.getSource().getMaximumFileSize().toFixed(3)), {
        contentWidth: "150px"
      });
    },
    _getExtensionController: function (oController) {
      return oController.isA("sap.fe.core.ExtensionAPI") ? oController._controller : oController;
    }
  };

  /**
   * @global
   */
  return FieldRuntime;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDb2xsYWJvcmF0aW9uQmluZGluZyIsImZpZWxkIiwiYmluZGluZyIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZyIsImlzQSIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiRmllbGRSdW50aW1lIiwicmVzZXRDaGFuZ2VzSGFuZGxlciIsInVuZGVmaW5lZCIsInVwbG9hZFByb21pc2VzIiwib25EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGgiLCJvU291cmNlIiwib0NvbnRyb2xsZXIiLCJzTmF2UGF0aCIsIl9yb3V0aW5nIiwib0JpbmRpbmdDb250ZXh0Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiZm5OYXZpZ2F0ZSIsIm9Db250ZXh0IiwibmF2aWdhdGVUb1RhcmdldCIsImdldFZpZXdEYXRhIiwiY29udmVydGVyVHlwZSIsIk1vZGVsSGVscGVyIiwiaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiZHJhZnQiLCJwcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbiIsIkZ1bmN0aW9uIiwicHJvdG90eXBlIiwiZ2V0Q29udHJvbGxlciIsIk5hdmlnYXRpb25UeXBlIiwiRm9yd2FyZE5hdmlnYXRpb24iLCJMb2ciLCJlcnJvciIsImlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlIiwic1Byb3BlcnR5UGF0aCIsInNTZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yIiwiSGFzRHJhZnRFbnRpdHkiLCJJc0FjdGl2ZUVudGl0eSIsImhpZGVEcmFmdEluZm8iLCJvblZhbGlkYXRlRmllbGRHcm91cCIsIm9FdmVudCIsIm9GRUNvbnRyb2xsZXIiLCJfZ2V0RXh0ZW5zaW9uQ29udHJvbGxlciIsIl9zaWRlRWZmZWN0cyIsImhhbmRsZUZpZWxkR3JvdXBDaGFuZ2UiLCJoYW5kbGVDaGFuZ2UiLCJvU291cmNlRmllbGQiLCJnZXRTb3VyY2UiLCJiSXNUcmFuc2llbnQiLCJpc1RyYW5zaWVudCIsInBWYWx1ZVJlc29sdmVkIiwiZ2V0UGFyYW1ldGVyIiwiUHJvbWlzZSIsInJlc29sdmUiLCJiVmFsaWQiLCJmaWVsZFZhbGlkaXR5IiwiZ2V0RmllbGRTdGF0ZU9uQ2hhbmdlIiwic3RhdGUiLCJ0aGVuIiwibVBhcmFtZXRlcnMiLCJ2YWxpZCIsIkZpZWxkQVBJIiwiY2F0Y2giLCJlZGl0RmxvdyIsInN5bmNUYXNrIiwiaGFuZGxlRmllbGRDaGFuZ2UiLCJvRmllbGQiLCJiQ29sbGFib3JhdGlvbkVuYWJsZWQiLCJDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jIiwiaXNDb25uZWN0ZWQiLCJkYXRhIiwiZ2V0QmluZGluZ0luZm8iLCJwYXJ0cyIsIm1hcCIsInBhcnQiLCJnZXRQYXRoIiwicGF0aCIsInVwZGF0ZUNvbGxhYm9yYXRpb24iLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImF0dGFjaEV2ZW50T25jZSIsInNlbmQiLCJBY3Rpdml0eSIsIkNoYW5nZSIsIlVuZG8iLCJoYW5kbGVMaXZlQ2hhbmdlIiwiZXZlbnQiLCJiaW5kaW5nUGF0aCIsImZ1bGxQYXRoIiwiTGl2ZUNoYW5nZSIsInNldFRpbWVvdXQiLCJmb2N1c2VkQ29udHJvbCIsIkNvcmUiLCJieUlkIiwiZ2V0Q3VycmVudEZvY3VzZWRDb250cm9sSWQiLCJnZXRQYXJlbnQiLCJkZXRhY2hCcm93c2VyRXZlbnQiLCJhdHRhY2hCcm93c2VyRXZlbnQiLCJoYW5kbGVPcGVuUGlja2VyIiwic0JpbmRpbmdQYXRoIiwic0Z1bGxQYXRoIiwiaGFuZGxlQ2xvc2VQaWNrZXIiLCJfc2VuZENvbGxhYm9yYXRpb25NZXNzYWdlRm9yRmlsZVVwbG9hZGVyIiwiZmlsZVVwbG9hZGVyIiwiYWN0aXZpdHkiLCJpc0NvbGxhYm9yYXRpb25FbmFibGVkIiwiZ2V0UHJvcGVydHkiLCJoYW5kbGVPcGVuVXBsb2FkZXIiLCJoYW5kbGVDbG9zZVVwbG9hZGVyIiwibUZpZWxkU3RhdGUiLCJfaXNCaW5kaW5nU3RhdGVNZXNzYWdlcyIsIm9CaW5kaW5nIiwiZ2V0RGF0YVN0YXRlIiwiZ2V0SW52YWxpZFZhbHVlIiwiZ2V0Q29udGVudCIsIkZpZWxkV3JhcHBlciIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsImdldEVkaXRNb2RlIiwiZ2V0Q29udGVudEVkaXQiLCJiSXNWYWxpZCIsImdldE1heENvbmRpdGlvbnMiLCJvVmFsdWVCaW5kaW5nSW5mbyIsImdldFZhbHVlIiwiZmllbGRWYWx1ZSIsInZhbGlkaXR5IiwiX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nIiwic0N1cnJlbnRIYXNoIiwiaW5kZXhPZiIsInNwbGl0IiwiX2ZuR2V0TGlua0luZm9ybWF0aW9uIiwiX29Tb3VyY2UiLCJfb0xpbmsiLCJfc1Byb3BlcnR5UGF0aCIsIl9zVmFsdWUiLCJmblNldEFjdGl2ZSIsIm9Nb2RlbCIsInNTZW1hbnRpY09iamVjdE5hbWUiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50Iiwib1NoZWxsU2VydmljZUhlbHBlciIsImdldFNoZWxsU2VydmljZXMiLCJwR2V0TGlua3NQcm9taXNlIiwiZ2V0TGlua3NXaXRoQ2FjaGUiLCJzZW1hbnRpY09iamVjdCIsImFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsImdldE9iamVjdCIsIlNlbWFudGljT2JqZWN0TmFtZSIsIlNlbWFudGljT2JqZWN0RnVsbFBhdGgiLCJNZXRhTW9kZWwiLCJJbnRlcm5hbE1vZGVsQ29udGV4dCIsIlNoZWxsU2VydmljZUhlbHBlciIsIkdldExpbmtzUHJvbWlzZSIsIlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiX2ZuUXVpY2tWaWV3SGFzTmV3Q29uZGl0aW9uIiwib1NlbWFudGljT2JqZWN0UGF5bG9hZCIsIl9vTGlua0luZm8iLCJiUmVzdWx0aW5nTmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyIiwiX2ZuUXVpY2tWaWV3U2V0TmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyIiwiX29GaW5hbFNlbWFudGljT2JqZWN0cyIsInNUbXBQYXRoIiwiYVNlbWFudGljT2JqZWN0UGF0aHMiLCJPYmplY3QiLCJrZXlzIiwiaVBhdGhzQ291bnQiLCJfZm5VcGRhdGVTZW1hbnRpY09iamVjdHNUYXJnZXRNb2RlbCIsInNWYWx1ZSIsIm9Db250cm9sIiwiYkFjdGl2ZSIsInNldEFjdGl2ZSIsInNldFRpdGxlQWN0aXZlIiwib0NvbmRpdGlvbmFsV3JhcHBlciIsInNldENvbmRpdGlvbiIsIm9MaW5rSW5mbyIsImdldEhhc2giLCJ1cGRhdGVTZW1hbnRpY1RhcmdldHMiLCJvRmluYWxTZW1hbnRpY09iamVjdHMiLCJvRXJyb3IiLCJfY2hlY2tDb250cm9sSGFzTW9kZWxBbmRCaW5kaW5nQ29udGV4dCIsIl9jb250cm9sIiwiX2NoZWNrQ3VzdG9tRGF0YVZhbHVlQmVmb3JlVXBkYXRpbmdTZW1hbnRpY09iamVjdE1vZGVsIiwicHJvcGVydHlQYXRoIiwiYUN1c3RvbURhdGEiLCJzU2VtYW50aWNPYmplY3RQYXRoVmFsdWUiLCJvVmFsdWVCaW5kaW5nIiwiX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmciLCJzZW1hbnRpY09iamVjdFBhdGhWYWx1ZSIsImZpbHRlciIsImN1c3RvbURhdGEiLCJnZXRLZXkiLCJpbmRleCIsIl9vQ2hhbmdlRXZlbnQiLCJMaW5rTW9kZWxDb250ZXh0Q2hhbmdlIiwic1Byb3BlcnR5Iiwic1BhdGhUb1Byb3BlcnR5IiwiY29udHJvbCIsIm1kY0xpbmsiLCJnZXREZXBlbmRlbnRzIiwibGVuZ3RoIiwiZ2V0Q3VzdG9tRGF0YSIsIm9wZW5FeHRlcm5hbExpbmsiLCJzb3VyY2UiLCJvcGVuV2luZG93IiwiY3JlYXRlUG9wb3ZlcldpdGhOb1RhcmdldHMiLCJtZGNMaW5rSWQiLCJnZXRJZCIsImlsbHVzdHJhdGVkTWVzc2FnZVNldHRpbmdzIiwidGl0bGUiLCJnZXRSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsImRlc2NyaXB0aW9uIiwiZW5hYmxlRm9ybWF0dGVkVGV4dCIsImlsbHVzdHJhdGlvblNpemUiLCJpbGx1c3RyYXRpb25UeXBlIiwiSWxsdXN0cmF0ZWRNZXNzYWdlVHlwZSIsIlRlbnQiLCJpbGx1c3RyYXRlZE1lc3NhZ2UiLCJJbGx1c3RyYXRlZE1lc3NhZ2UiLCJwb3BvdmVyU2V0dGluZ3MiLCJob3Jpem9udGFsU2Nyb2xsaW5nIiwic2hvd0hlYWRlciIsInN5c3RlbSIsInBob25lIiwicGxhY2VtZW50IiwibW9iaWxlbGlicmFyeSIsIlBsYWNlbWVudFR5cGUiLCJBdXRvIiwiY29udGVudCIsImFmdGVyQ2xvc2UiLCJkZXN0cm95IiwiUmVzcG9uc2l2ZVBvcG92ZXIiLCJvcGVuTGluayIsInNhcG1MaW5rIiwiaFJlZiIsImdldFRyaWdnZXJIcmVmIiwibGlua0l0ZW1zIiwicmV0cmlldmVMaW5rSXRlbXMiLCJnZXRQYXlsb2FkIiwiaGFzUXVpY2tWaWV3RmFjZXRzIiwicG9wb3ZlciIsImFkZERlcGVuZGVudCIsIm9wZW5CeSIsIm9wZW4iLCJ2aWV3IiwiYXBwQ29tcG9uZW50Iiwic2hlbGxTZXJ2aWNlIiwic2hlbGxIYXNoIiwicGFyc2VTaGVsbEhhc2giLCJuYXZBcmdzIiwidGFyZ2V0IiwiYWN0aW9uIiwicGFyYW1zIiwiS2VlcEFsaXZlSGVscGVyIiwic3RvcmVDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9ySGFzaCIsImlzU3RpY2t5RWRpdE1vZGUiLCJ0b0V4dGVybmFsIiwibmV3SHJlZiIsImhyZWZGb3JFeHRlcm5hbEFzeW5jIiwicHJlc3NMaW5rIiwiZmluZEVsZW1lbnRzIiwiZWxlbSIsIm9GaWVsZEluZm8iLCJ1cGxvYWRTdHJlYW0iLCJjb250cm9sbGVyIiwiRkVDb250cm9sbGVyIiwiZmlsZVdyYXBwZXIiLCJ1cGxvYWRVcmwiLCJnZXRVcGxvYWRVcmwiLCJzZXRVSUJ1c3kiLCJzZXRVcGxvYWRVcmwiLCJyZW1vdmVBbGxIZWFkZXJQYXJhbWV0ZXJzIiwidG9rZW4iLCJnZXRIdHRwSGVhZGVycyIsImhlYWRlclBhcmFtZXRlckNTUkZUb2tlbiIsIkZpbGVVcGxvYWRlclBhcmFtZXRlciIsInNldE5hbWUiLCJzZXRWYWx1ZSIsImFkZEhlYWRlclBhcmFtZXRlciIsImVUYWciLCJoZWFkZXJQYXJhbWV0ZXJFVGFnIiwiaGVhZGVyUGFyYW1ldGVyQWNjZXB0IiwidXBsb2FkUHJvbWlzZSIsInJlamVjdCIsInVwbG9hZCIsIk1lc3NhZ2VCb3giLCJoYW5kbGVVcGxvYWRDb21wbGV0ZSIsInByb3BlcnR5RmlsZU5hbWUiLCJzdGF0dXMiLCJjb250ZXh0IiwiX2Rpc3BsYXlNZXNzYWdlRm9yRmFpbGVkVXBsb2FkIiwibmV3RVRhZyIsImV0YWciLCJzZXRQcm9wZXJ0eSIsImF2YXRhciIsInJlZnJlc2hBdmF0YXJDYWNoZUJ1c3RpbmciLCJfY2FsbFNpZGVFZmZlY3RzRm9yU3RyZWFtIiwibm90aWZpY2F0aW9uRGF0YSIsInB1c2giLCJzRXJyb3IiLCJzTWVzc2FnZVRleHQiLCJKU09OIiwicGFyc2UiLCJtZXNzYWdlIiwiZSIsInJlbW92ZVN0cmVhbSIsImRlbGV0ZUJ1dHRvbiIsImdldEljb25Gb3JNaW1lVHlwZSIsInNNaW1lVHlwZSIsIkljb25Qb29sIiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsInNQcm9wZXJ0eVZhbHVlIiwic1Byb3BlcnR5RnVsbFBhdGgiLCJzRGlzcGxheUZvcm1hdCIsInNUZXh0UHJvcGVydHkiLCJzUHJvcGVydHlOYW1lIiwiQ29tbW9uSGVscGVyIiwicmVxdWVzdFZhbHVlTGlzdEluZm8iLCJtVmFsdWVMaXN0SW5mbyIsIm9WYWx1ZUxpc3RJbmZvIiwib1ZhbHVlTGlzdE1vZGVsIiwiJG1vZGVsIiwib01ldGFNb2RlbFZhbHVlTGlzdCIsIm9QYXJhbVdpdGhLZXkiLCJQYXJhbWV0ZXJzIiwiZmluZCIsIm9QYXJhbWV0ZXIiLCJMb2NhbERhdGFQcm9wZXJ0eSIsIiRQcm9wZXJ0eVBhdGgiLCJWYWx1ZUxpc3RQcm9wZXJ0eSIsIm9UZXh0QW5ub3RhdGlvbiIsIkNvbGxlY3Rpb25QYXRoIiwiJFBhdGgiLCJvRmlsdGVyIiwiRmlsdGVyIiwib3BlcmF0b3IiLCJ2YWx1ZTEiLCJvTGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsIiRzZWxlY3QiLCJyZXF1ZXN0Q29udGV4dHMiLCJhQ29udGV4dHMiLCJzRGVzY3JpcHRpb24iLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJzTXNnIiwiaGFuZGxlVHlwZU1pc3NtYXRjaCIsInJlc291cmNlTW9kZWwiLCJkZXRhaWxzIiwiZ2V0UGFyYW1ldGVycyIsIm1pbWVUeXBlIiwiZ2V0TWltZVR5cGUiLCJ0b1N0cmluZyIsInJlcGxhY2VBbGwiLCJjb250ZW50V2lkdGgiLCJoYW5kbGVGaWxlU2l6ZUV4Y2VlZCIsImdldE1heGltdW1GaWxlU2l6ZSIsInRvRml4ZWQiLCJfY29udHJvbGxlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmllbGRSdW50aW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlTeW5jXCI7XG5pbXBvcnQgeyBBY3Rpdml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25Db21tb25cIjtcbmltcG9ydCBkcmFmdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCB0eXBlIHsgRW5oYW5jZVdpdGhVSTUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBLZWVwQWxpdmVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvS2VlcEFsaXZlSGVscGVyXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdldFJlc291cmNlTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZXNvdXJjZU1vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmllbGRXcmFwcGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2NvbnRyb2xzL0ZpZWxkV3JhcHBlclwiO1xuaW1wb3J0IHR5cGUgRmlsZVdyYXBwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvY29udHJvbHMvRmlsZVdyYXBwZXJcIjtcbmltcG9ydCBGaWVsZEFQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZEFQSVwiO1xuaW1wb3J0IHR5cGUgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBJbGx1c3RyYXRlZE1lc3NhZ2UsIHsgJElsbHVzdHJhdGVkTWVzc2FnZVNldHRpbmdzIH0gZnJvbSBcInNhcC9tL0lsbHVzdHJhdGVkTWVzc2FnZVwiO1xuaW1wb3J0IElsbHVzdHJhdGVkTWVzc2FnZVR5cGUgZnJvbSBcInNhcC9tL0lsbHVzdHJhdGVkTWVzc2FnZVR5cGVcIjtcbmltcG9ydCBtb2JpbGVsaWJyYXJ5IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBMaW5rIGZyb20gXCJzYXAvbS9MaW5rXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IFJlc3BvbnNpdmVQb3BvdmVyLCB7ICRSZXNwb25zaXZlUG9wb3ZlclNldHRpbmdzIH0gZnJvbSBcInNhcC9tL1Jlc3BvbnNpdmVQb3BvdmVyXCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBDdXN0b21EYXRhIGZyb20gXCJzYXAvdWkvY29yZS9DdXN0b21EYXRhXCI7XG5pbXBvcnQgSWNvblBvb2wgZnJvbSBcInNhcC91aS9jb3JlL0ljb25Qb29sXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sbGVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgc3lzdGVtIH0gZnJvbSBcInNhcC91aS9EZXZpY2VcIjtcbmltcG9ydCB0eXBlIHsgZGVmYXVsdCBhcyBNZGNMaW5rIH0gZnJvbSBcInNhcC91aS9tZGMvTGlua1wiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhQ29udGV4dEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUNvbnRleHRCaW5kaW5nXCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgRmlsZVVwbG9hZGVyIGZyb20gXCJzYXAvdWkvdW5pZmllZC9GaWxlVXBsb2FkZXJcIjtcbmltcG9ydCBGaWxlVXBsb2FkZXJQYXJhbWV0ZXIgZnJvbSBcInNhcC91aS91bmlmaWVkL0ZpbGVVcGxvYWRlclBhcmFtZXRlclwiO1xuaW1wb3J0IG9wZW5XaW5kb3cgZnJvbSBcInNhcC91aS91dGlsL29wZW5XaW5kb3dcIjtcblxuLyoqXG4gKiBHZXRzIHRoZSBiaW5kaW5nIHVzZWQgZm9yIGNvbGxhYm9yYXRpb24gbm90aWZpY2F0aW9ucy5cbiAqXG4gKiBAcGFyYW0gZmllbGRcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nXG4gKi9cbmZ1bmN0aW9uIGdldENvbGxhYm9yYXRpb25CaW5kaW5nKGZpZWxkOiBDb250cm9sKTogT0RhdGFMaXN0QmluZGluZyB8IE9EYXRhQ29udGV4dEJpbmRpbmcge1xuXHRsZXQgYmluZGluZyA9IChmaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQpLmdldEJpbmRpbmcoKTtcblxuXHRpZiAoIWJpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoZmllbGQpO1xuXHRcdGJpbmRpbmcgPSAob1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KS5nZXRCaW5kaW5nKCk7XG5cdH1cblxuXHRyZXR1cm4gYmluZGluZztcbn1cblxuLyoqXG4gKiBTdGF0aWMgY2xhc3MgdXNlZCBieSBcInNhcC51aS5tZGMuRmllbGRcIiBkdXJpbmcgcnVudGltZVxuICpcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsIFRoaXMgbW9kdWxlIGlzIG9ubHkgZm9yIGludGVybmFsL2V4cGVyaW1lbnRhbCB1c2UhXG4gKi9cbmNvbnN0IEZpZWxkUnVudGltZSA9IHtcblx0cmVzZXRDaGFuZ2VzSGFuZGxlcjogdW5kZWZpbmVkIGFzIGFueSxcblx0dXBsb2FkUHJvbWlzZXM6IHVuZGVmaW5lZCBhcyBhbnksXG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIGFuIGludGVybmFsIG5hdmlnYXRpb24gb24gdGhlIGxpbmsgcGVydGFpbmluZyB0byBEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBvU291cmNlIFNvdXJjZSBvZiB0aGUgcHJlc3MgZXZlbnRcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIEluc3RhbmNlIG9mIHRoZSBjb250cm9sbGVyXG5cdCAqIEBwYXJhbSBzTmF2UGF0aCBUaGUgbmF2aWdhdGlvbiBwYXRoXG5cdCAqL1xuXHRvbkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDogZnVuY3Rpb24gKG9Tb3VyY2U6IENvbnRyb2wsIG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlciwgc05hdlBhdGg6IHN0cmluZykge1xuXHRcdGlmIChvQ29udHJvbGxlci5fcm91dGluZykge1xuXHRcdFx0bGV0IG9CaW5kaW5nQ29udGV4dCA9IG9Tb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9Tb3VyY2UpLFxuXHRcdFx0XHRvTWV0YU1vZGVsID0gb0JpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdGZuTmF2aWdhdGUgPSBmdW5jdGlvbiAob0NvbnRleHQ/OiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0XHRcdG9CaW5kaW5nQ29udGV4dCA9IG9Db250ZXh0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvQ29udHJvbGxlci5fcm91dGluZy5uYXZpZ2F0ZVRvVGFyZ2V0KG9CaW5kaW5nQ29udGV4dCwgc05hdlBhdGgsIHRydWUpO1xuXHRcdFx0XHR9O1xuXHRcdFx0Ly8gU2hvdyBkcmFmdCBsb3NzIGNvbmZpcm1hdGlvbiBkaWFsb2cgaW4gY2FzZSBvZiBPYmplY3QgcGFnZVxuXHRcdFx0aWYgKChvVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkuY29udmVydGVyVHlwZSA9PT0gXCJPYmplY3RQYWdlXCIgJiYgIU1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvTWV0YU1vZGVsKSkge1xuXHRcdFx0XHRkcmFmdC5wcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbihcblx0XHRcdFx0XHRmbk5hdmlnYXRlLFxuXHRcdFx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZSxcblx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQsXG5cdFx0XHRcdFx0b1ZpZXcuZ2V0Q29udHJvbGxlcigpLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0ZHJhZnQuTmF2aWdhdGlvblR5cGUuRm9yd2FyZE5hdmlnYXRpb25cblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZuTmF2aWdhdGUoKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLmVycm9yKFxuXHRcdFx0XHRcIkZpZWxkUnVudGltZTogTm8gcm91dGluZyBsaXN0ZW5lciBjb250cm9sbGVyIGV4dGVuc2lvbiBmb3VuZC4gSW50ZXJuYWwgbmF2aWdhdGlvbiBhYm9ydGVkLlwiLFxuXHRcdFx0XHRcInNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRSdW50aW1lXCIsXG5cdFx0XHRcdFwib25EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcIlxuXHRcdFx0KTtcblx0XHR9XG5cdH0sXG5cdGlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlOiBmdW5jdGlvbiAoXG5cdFx0c1Byb3BlcnR5UGF0aDogYW55LFxuXHRcdHNTZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yOiBhbnksXG5cdFx0SGFzRHJhZnRFbnRpdHk6IGFueSxcblx0XHRJc0FjdGl2ZUVudGl0eTogYW55LFxuXHRcdGhpZGVEcmFmdEluZm86IGFueVxuXHQpIHtcblx0XHRpZiAoSXNBY3RpdmVFbnRpdHkgIT09IHVuZGVmaW5lZCAmJiBIYXNEcmFmdEVudGl0eSAhPT0gdW5kZWZpbmVkICYmICghSXNBY3RpdmVFbnRpdHkgfHwgSGFzRHJhZnRFbnRpdHkpICYmICFoaWRlRHJhZnRJbmZvKSB7XG5cdFx0XHRyZXR1cm4gc1Byb3BlcnR5UGF0aCA9PT0gc1NlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3I7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEhhbmRsZXIgZm9yIHRoZSB2YWxpZGF0ZUZpZWxkR3JvdXAgZXZlbnQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBvblZhbGlkYXRlRmllbGRHcm91cFxuXHQgKiBAcGFyYW0gb0NvbnRyb2xsZXIgVGhlIGNvbnRyb2xsZXIgb2YgdGhlIHBhZ2UgY29udGFpbmluZyB0aGUgZmllbGRcblx0ICogQHBhcmFtIG9FdmVudCBUaGUgZXZlbnQgb2JqZWN0IHBhc3NlZCBieSB0aGUgdmFsaWRhdGVGaWVsZEdyb3VwIGV2ZW50XG5cdCAqL1xuXHRvblZhbGlkYXRlRmllbGRHcm91cDogZnVuY3Rpb24gKG9Db250cm9sbGVyOiBvYmplY3QsIG9FdmVudDogb2JqZWN0KSB7XG5cdFx0Y29uc3Qgb0ZFQ29udHJvbGxlciA9IEZpZWxkUnVudGltZS5fZ2V0RXh0ZW5zaW9uQ29udHJvbGxlcihvQ29udHJvbGxlcik7XG5cdFx0b0ZFQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuaGFuZGxlRmllbGRHcm91cENoYW5nZShvRXZlbnQpO1xuXHR9LFxuXHQvKipcblx0ICogSGFuZGxlciBmb3IgdGhlIGNoYW5nZSBldmVudC5cblx0ICogU3RvcmUgZmllbGQgZ3JvdXAgSURzIG9mIHRoaXMgZmllbGQgZm9yIHJlcXVlc3Rpbmcgc2lkZSBlZmZlY3RzIHdoZW4gcmVxdWlyZWQuXG5cdCAqIFdlIHN0b3JlIHRoZW0gaGVyZSB0byBlbnN1cmUgYSBjaGFuZ2UgaW4gdGhlIHZhbHVlIG9mIHRoZSBmaWVsZCBoYXMgdGFrZW4gcGxhY2UuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBoYW5kbGVDaGFuZ2Vcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSBjb250cm9sbGVyIG9mIHRoZSBwYWdlIGNvbnRhaW5pbmcgdGhlIGZpZWxkXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50IG9iamVjdCBwYXNzZWQgYnkgdGhlIGNoYW5nZSBldmVudFxuXHQgKi9cblx0aGFuZGxlQ2hhbmdlOiBmdW5jdGlvbiAob0NvbnRyb2xsZXI6IG9iamVjdCwgb0V2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IG9Tb3VyY2VGaWVsZCA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBDb250cm9sLFxuXHRcdFx0YklzVHJhbnNpZW50ID0gb1NvdXJjZUZpZWxkICYmIChvU291cmNlRmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBhbnkpLmlzVHJhbnNpZW50KCksXG5cdFx0XHRwVmFsdWVSZXNvbHZlZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJwcm9taXNlXCIpIHx8IFByb21pc2UucmVzb2x2ZSgpLFxuXHRcdFx0b1NvdXJjZSA9IG9FdmVudC5nZXRTb3VyY2UoKSxcblx0XHRcdGJWYWxpZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWxpZFwiKSxcblx0XHRcdGZpZWxkVmFsaWRpdHkgPSB0aGlzLmdldEZpZWxkU3RhdGVPbkNoYW5nZShvRXZlbnQpLnN0YXRlW1widmFsaWRpdHlcIl07XG5cblx0XHQvLyBUT0RPOiBjdXJyZW50bHkgd2UgaGF2ZSB1bmRlZmluZWQgYW5kIHRydWUuLi4gYW5kIG91ciBjcmVhdGlvbiByb3cgaW1wbGVtZW50YXRpb24gcmVsaWVzIG9uIHRoaXMuXG5cdFx0Ly8gSSB3b3VsZCBtb3ZlIHRoaXMgbG9naWMgdG8gdGhpcyBwbGFjZSBhcyBpdCdzIGhhcmQgdG8gdW5kZXJzdGFuZCBmb3IgZmllbGQgY29uc3VtZXJcblxuXHRcdHBWYWx1ZVJlc29sdmVkXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8vIFRoZSBldmVudCBpcyBnb25lLiBGb3Igbm93IHdlJ2xsIGp1c3QgcmVjcmVhdGUgaXQgYWdhaW5cblx0XHRcdFx0KG9FdmVudCBhcyBhbnkpLm9Tb3VyY2UgPSBvU291cmNlO1xuXHRcdFx0XHQob0V2ZW50IGFzIGFueSkubVBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdFx0dmFsaWQ6IGJWYWxpZFxuXHRcdFx0XHR9O1xuXHRcdFx0XHQoRmllbGRBUEkgYXMgYW55KS5oYW5kbGVDaGFuZ2Uob0V2ZW50LCBvQ29udHJvbGxlcik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgvKm9FcnJvcjogYW55Ki8pIHtcblx0XHRcdFx0Ly8gVGhlIGV2ZW50IGlzIGdvbmUuIEZvciBub3cgd2UnbGwganVzdCByZWNyZWF0ZSBpdCBhZ2FpblxuXHRcdFx0XHQob0V2ZW50IGFzIGFueSkub1NvdXJjZSA9IG9Tb3VyY2U7XG5cdFx0XHRcdChvRXZlbnQgYXMgYW55KS5tUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0XHR2YWxpZDogZmFsc2Vcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQvLyBhcyB0aGUgVUkgbWlnaHQgbmVlZCB0byByZWFjdCBvbi4gV2UgY291bGQgcHJvdmlkZSBhIHBhcmFtZXRlciB0byBpbmZvcm0gaWYgdmFsaWRhdGlvblxuXHRcdFx0XHQvLyB3YXMgc3VjY2Vzc2Z1bD9cblx0XHRcdFx0KEZpZWxkQVBJIGFzIGFueSkuaGFuZGxlQ2hhbmdlKG9FdmVudCwgb0NvbnRyb2xsZXIpO1xuXHRcdFx0fSk7XG5cblx0XHQvLyBVc2UgdGhlIEZFIENvbnRyb2xsZXIgaW5zdGVhZCBvZiB0aGUgZXh0ZW5zaW9uQVBJIHRvIGFjY2VzcyBpbnRlcm5hbCBGRSBjb250cm9sbGVyc1xuXHRcdGNvbnN0IG9GRUNvbnRyb2xsZXIgPSBGaWVsZFJ1bnRpbWUuX2dldEV4dGVuc2lvbkNvbnRyb2xsZXIob0NvbnRyb2xsZXIpO1xuXG5cdFx0b0ZFQ29udHJvbGxlci5lZGl0Rmxvdy5zeW5jVGFzayhwVmFsdWVSZXNvbHZlZCk7XG5cblx0XHQvLyBpZiB0aGUgY29udGV4dCBpcyB0cmFuc2llbnQsIGl0IG1lYW5zIHRoZSByZXF1ZXN0IHdvdWxkIGZhaWwgYW55d2F5IGFzIHRoZSByZWNvcmQgZG9lcyBub3QgZXhpc3QgaW4gcmVhbGl0eVxuXHRcdC8vIFRPRE86IHNob3VsZCB0aGUgcmVxdWVzdCBiZSBtYWRlIGluIGZ1dHVyZSBpZiB0aGUgY29udGV4dCBpcyB0cmFuc2llbnQ/XG5cdFx0aWYgKGJJc1RyYW5zaWVudCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNJREUgRUZGRUNUU1xuXHRcdG9GRUNvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmhhbmRsZUZpZWxkQ2hhbmdlKG9FdmVudCwgZmllbGRWYWxpZGl0eSwgcFZhbHVlUmVzb2x2ZWQpO1xuXG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2wsXG5cdFx0XHRiQ29sbGFib3JhdGlvbkVuYWJsZWQgPSBDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKG9GaWVsZCk7XG5cblx0XHRpZiAoYkNvbGxhYm9yYXRpb25FbmFibGVkICYmIGZpZWxkVmFsaWRpdHkpIHtcblx0XHRcdC8qIFRPRE86IGZvciBub3cgd2UgdXNlIGFsd2F5cyB0aGUgZmlyc3QgYmluZGluZyBwYXJ0IChzbyBpbiBjYXNlIG9mIGNvbXBvc2l0ZSBiaW5kaW5ncyBsaWtlIGFtb3VudCBhbmRcblx0XHRcdFx0XHR1bml0IG9yIGN1cnJlbmN5IG9ubHkgdGhlIGFtb3VudCBpcyBjb25zaWRlcmVkKSAqL1xuXHRcdFx0Y29uc3QgYmluZGluZyA9IGdldENvbGxhYm9yYXRpb25CaW5kaW5nKG9GaWVsZCk7XG5cblx0XHRcdGNvbnN0IGRhdGEgPSBbXG5cdFx0XHRcdC4uLigoKG9GaWVsZC5nZXRCaW5kaW5nSW5mbyhcInZhbHVlXCIpIHx8IG9GaWVsZC5nZXRCaW5kaW5nSW5mbyhcInNlbGVjdGVkXCIpKSBhcyBhbnkpPy5wYXJ0cyB8fCBbXSksXG5cdFx0XHRcdC4uLigob0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwiYWRkaXRpb25hbFZhbHVlXCIpIGFzIGFueSk/LnBhcnRzIHx8IFtdKVxuXHRcdFx0XS5tYXAoZnVuY3Rpb24gKHBhcnQ6IGFueSkge1xuXHRcdFx0XHRpZiAocGFydCkge1xuXHRcdFx0XHRcdHJldHVybiBgJHtvRmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpfS8ke3BhcnQucGF0aH1gO1xuXHRcdFx0XHR9XG5cdFx0XHR9KSBhcyBbXTtcblxuXHRcdFx0Y29uc3QgdXBkYXRlQ29sbGFib3JhdGlvbiA9ICgpID0+IHtcblx0XHRcdFx0aWYgKGJpbmRpbmcuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdC8vIFRoZSB2YWx1ZSBoYXMgYmVlbiBjaGFuZ2VkIGJ5IHRoZSB1c2VyIC0tPiB3YWl0IHVudGlsIGl0J3Mgc2VudCB0byB0aGUgc2VydmVyIGJlZm9yZSBzZW5kaW5nIGEgbm90aWZpY2F0aW9uIHRvIG90aGVyIHVzZXJzXG5cdFx0XHRcdFx0YmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJwYXRjaENvbXBsZXRlZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQob0ZpZWxkLCBBY3Rpdml0eS5DaGFuZ2UsIGRhdGEpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIE5vIGNoYW5nZXMgLS0+IHNlbmQgYSBVbmRvIG5vdGlmaWNhdGlvblxuXHRcdFx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChvRmllbGQsIEFjdGl2aXR5LlVuZG8sIGRhdGEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0aWYgKG9Tb3VyY2VGaWVsZC5pc0EoXCJzYXAudWkubWRjLkZpZWxkXCIpKSB7XG5cdFx0XHRcdHBWYWx1ZVJlc29sdmVkXG5cdFx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdFx0dXBkYXRlQ29sbGFib3JhdGlvbigpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0XHRcdHVwZGF0ZUNvbGxhYm9yYXRpb24oKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHVwZGF0ZUNvbGxhYm9yYXRpb24oKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlTGl2ZUNoYW5nZTogZnVuY3Rpb24gKGV2ZW50OiBhbnkpIHtcblx0XHQvLyBDb2xsYWJvcmF0aW9uIERyYWZ0IEFjdGl2aXR5IFN5bmNcblx0XHRjb25zdCBmaWVsZCA9IGV2ZW50LmdldFNvdXJjZSgpO1xuXG5cdFx0aWYgKENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQoZmllbGQpKSB7XG5cdFx0XHQvKiBUT0RPOiBmb3Igbm93IHdlIHVzZSBhbHdheXMgdGhlIGZpcnN0IGJpbmRpbmcgcGFydCAoc28gaW4gY2FzZSBvZiBjb21wb3NpdGUgYmluZGluZ3MgbGlrZSBhbW91bnQgYW5kXG5cdFx0XHRcdFx0dW5pdCBvciBjdXJyZW5jeSBvbmx5IHRoZSBhbW91bnQgaXMgY29uc2lkZXJlZCkgKi9cblx0XHRcdGNvbnN0IGJpbmRpbmdQYXRoID0gZmllbGQuZ2V0QmluZGluZ0luZm8oXCJ2YWx1ZVwiKS5wYXJ0c1swXS5wYXRoO1xuXHRcdFx0Y29uc3QgZnVsbFBhdGggPSBgJHtmaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtiaW5kaW5nUGF0aH1gO1xuXHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKGZpZWxkLCBBY3Rpdml0eS5MaXZlQ2hhbmdlLCBmdWxsUGF0aCk7XG5cblx0XHRcdC8vIElmIHRoZSB1c2VyIHJldmVydGVkIHRoZSBjaGFuZ2Ugbm8gY2hhbmdlIGV2ZW50IGlzIHNlbnQgdGhlcmVmb3JlIHdlIGhhdmUgdG8gaGFuZGxlIGl0IGhlcmVcblx0XHRcdGlmICghdGhpcy5yZXNldENoYW5nZXNIYW5kbGVyKSB7XG5cdFx0XHRcdHRoaXMucmVzZXRDaGFuZ2VzSGFuZGxlciA9ICgpID0+IHtcblx0XHRcdFx0XHQvLyBXZSBuZWVkIHRvIHdhaXQgYSBsaXR0bGUgYml0IGZvciB0aGUgZm9jdXMgdG8gYmUgdXBkYXRlZFxuXHRcdFx0XHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKGZpZWxkLmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZm9jdXNlZENvbnRyb2wgPSBDb3JlLmJ5SWQoQ29yZS5nZXRDdXJyZW50Rm9jdXNlZENvbnRyb2xJZCgpKTtcblx0XHRcdFx0XHRcdFx0aWYgKGZvY3VzZWRDb250cm9sPy5nZXRQYXJlbnQoKSA9PT0gZmllbGQpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBXZSdyZSBzdGlsbCB1biB0aGUgc2FtZSBNREMgRmllbGQgLS0+IGRvIG5vdGhpbmdcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0ZmllbGQuZGV0YWNoQnJvd3NlckV2ZW50KFwiZm9jdXNvdXRcIiwgdGhpcy5yZXNldENoYW5nZXNIYW5kbGVyKTtcblx0XHRcdFx0XHRcdGRlbGV0ZSB0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXI7XG5cdFx0XHRcdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQoZmllbGQsIEFjdGl2aXR5LlVuZG8sIGZ1bGxQYXRoKTtcblx0XHRcdFx0XHR9LCAxMDApO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRmaWVsZC5hdHRhY2hCcm93c2VyRXZlbnQoXCJmb2N1c291dFwiLCB0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVPcGVuUGlja2VyOiBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHQvLyBDb2xsYWJvcmF0aW9uIERyYWZ0IEFjdGl2aXR5IFN5bmNcblx0XHRjb25zdCBvRmllbGQgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0Y29uc3QgYkNvbGxhYm9yYXRpb25FbmFibGVkID0gQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5pc0Nvbm5lY3RlZChvRmllbGQpO1xuXG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwidmFsdWVcIikucGFydHNbMF0ucGF0aDtcblx0XHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtzQmluZGluZ1BhdGh9YDtcblx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChvRmllbGQsIEFjdGl2aXR5LkxpdmVDaGFuZ2UsIHNGdWxsUGF0aCk7XG5cdFx0fVxuXHR9LFxuXHRoYW5kbGVDbG9zZVBpY2tlcjogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IGJDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQob0ZpZWxkKTtcblxuXHRcdGlmIChiQ29sbGFib3JhdGlvbkVuYWJsZWQpIHtcblx0XHRcdGNvbnN0IGJpbmRpbmcgPSBnZXRDb2xsYWJvcmF0aW9uQmluZGluZyhvRmllbGQpO1xuXHRcdFx0aWYgKCFiaW5kaW5nLmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgYXJlIG5vIHBlbmRpbmcgY2hhbmdlcywgdGhlIHBpY2tlciB3YXMgY2xvc2VkIHdpdGhvdXQgY2hhbmdpbmcgdGhlIHZhbHVlIC0tPiBzZW5kIGEgVU5ETyBub3RpZmljYXRpb25cblx0XHRcdFx0Ly8gSW4gY2FzZSB0aGVyZSB3ZXJlIGNoYW5nZXMsIG5vdGlmaWNhdGlvbnMgYXJlIG1hbmFnZWQgaW4gaGFuZGxlQ2hhbmdlXG5cdFx0XHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IG9GaWVsZC5nZXRCaW5kaW5nSW5mbyhcInZhbHVlXCIpLnBhcnRzWzBdLnBhdGg7XG5cdFx0XHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtzQmluZGluZ1BhdGh9YDtcblx0XHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKG9GaWVsZCwgQWN0aXZpdHkuVW5kbywgc0Z1bGxQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X3NlbmRDb2xsYWJvcmF0aW9uTWVzc2FnZUZvckZpbGVVcGxvYWRlcihmaWxlVXBsb2FkZXI6IEZpbGVVcGxvYWRlciwgYWN0aXZpdHk6IEFjdGl2aXR5KSB7XG5cdFx0Y29uc3QgaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQoZmlsZVVwbG9hZGVyKTtcblxuXHRcdGlmIChpc0NvbGxhYm9yYXRpb25FbmFibGVkKSB7XG5cdFx0XHRjb25zdCBiaW5kaW5nUGF0aCA9IGZpbGVVcGxvYWRlci5nZXRQYXJlbnQoKT8uZ2V0UHJvcGVydHkoXCJwcm9wZXJ0eVBhdGhcIik7XG5cdFx0XHRjb25zdCBmdWxsUGF0aCA9IGAke2ZpbGVVcGxvYWRlci5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCl9LyR7YmluZGluZ1BhdGh9YDtcblx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChmaWxlVXBsb2FkZXIsIGFjdGl2aXR5LCBmdWxsUGF0aCk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZU9wZW5VcGxvYWRlcjogZnVuY3Rpb24gKGV2ZW50OiBFdmVudCkge1xuXHRcdC8vIENvbGxhYm9yYXRpb24gRHJhZnQgQWN0aXZpdHkgU3luY1xuXHRcdGNvbnN0IGZpbGVVcGxvYWRlciA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIEZpbGVVcGxvYWRlcjtcblx0XHRGaWVsZFJ1bnRpbWUuX3NlbmRDb2xsYWJvcmF0aW9uTWVzc2FnZUZvckZpbGVVcGxvYWRlcihmaWxlVXBsb2FkZXIsIEFjdGl2aXR5LkxpdmVDaGFuZ2UpO1xuXHR9LFxuXHRoYW5kbGVDbG9zZVVwbG9hZGVyOiBmdW5jdGlvbiAoZXZlbnQ6IEV2ZW50KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3QgZmlsZVVwbG9hZGVyID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgRmlsZVVwbG9hZGVyO1xuXHRcdEZpZWxkUnVudGltZS5fc2VuZENvbGxhYm9yYXRpb25NZXNzYWdlRm9yRmlsZVVwbG9hZGVyKGZpbGVVcGxvYWRlciwgQWN0aXZpdHkuVW5kbyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGZpZWxkIHZhbHVlIGFuZCB2YWxpZGl0eSBvbiBhIGNoYW5nZSBldmVudC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGZpZWxkVmFsaWRpdHlPbkNoYW5nZVxuXHQgKiBAcGFyYW0gb0V2ZW50IFRoZSBldmVudCBvYmplY3QgcGFzc2VkIGJ5IHRoZSBjaGFuZ2UgZXZlbnRcblx0ICogQHJldHVybnMgRmllbGQgdmFsdWUgYW5kIHZhbGlkaXR5XG5cdCAqL1xuXHRnZXRGaWVsZFN0YXRlT25DaGFuZ2U6IGZ1bmN0aW9uIChvRXZlbnQ6IEV2ZW50KTogYW55IHtcblx0XHRsZXQgb1NvdXJjZUZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIGFueSxcblx0XHRcdG1GaWVsZFN0YXRlID0ge307XG5cdFx0Y29uc3QgX2lzQmluZGluZ1N0YXRlTWVzc2FnZXMgPSBmdW5jdGlvbiAob0JpbmRpbmc6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9CaW5kaW5nICYmIG9CaW5kaW5nLmdldERhdGFTdGF0ZSgpID8gb0JpbmRpbmcuZ2V0RGF0YVN0YXRlKCkuZ2V0SW52YWxpZFZhbHVlKCkgPT09IHVuZGVmaW5lZCA6IHRydWU7XG5cdFx0fTtcblx0XHRpZiAob1NvdXJjZUZpZWxkLmlzQShcInNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRBUElcIikpIHtcblx0XHRcdG9Tb3VyY2VGaWVsZCA9IChvU291cmNlRmllbGQgYXMgRW5oYW5jZVdpdGhVSTU8RmllbGRBUEk+KS5nZXRDb250ZW50KCk7XG5cdFx0fVxuXG5cdFx0aWYgKG9Tb3VyY2VGaWVsZC5pc0EoRmllbGRXcmFwcGVyLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKSAmJiBvU291cmNlRmllbGQuZ2V0RWRpdE1vZGUoKSA9PT0gXCJFZGl0YWJsZVwiKSB7XG5cdFx0XHRvU291cmNlRmllbGQgPSBvU291cmNlRmllbGQuZ2V0Q29udGVudEVkaXQoKVswXTtcblx0XHR9XG5cblx0XHRpZiAob1NvdXJjZUZpZWxkLmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdGxldCBiSXNWYWxpZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWxpZFwiKSB8fCBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiaXNWYWxpZFwiKTtcblx0XHRcdGlmIChiSXNWYWxpZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlmIChvU291cmNlRmllbGQuZ2V0TWF4Q29uZGl0aW9ucygpID09PSAxKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1ZhbHVlQmluZGluZ0luZm8gPSBvU291cmNlRmllbGQuZ2V0QmluZGluZ0luZm8oXCJ2YWx1ZVwiKTtcblx0XHRcdFx0XHRiSXNWYWxpZCA9IF9pc0JpbmRpbmdTdGF0ZU1lc3NhZ2VzKG9WYWx1ZUJpbmRpbmdJbmZvICYmIG9WYWx1ZUJpbmRpbmdJbmZvLmJpbmRpbmcpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvU291cmNlRmllbGQuZ2V0VmFsdWUoKSA9PT0gXCJcIiAmJiAhb1NvdXJjZUZpZWxkLmdldFByb3BlcnR5KFwicmVxdWlyZWRcIikpIHtcblx0XHRcdFx0XHRiSXNWYWxpZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG1GaWVsZFN0YXRlID0ge1xuXHRcdFx0XHRmaWVsZFZhbHVlOiBvU291cmNlRmllbGQuZ2V0VmFsdWUoKSxcblx0XHRcdFx0dmFsaWRpdHk6ICEhYklzVmFsaWRcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG9Tb3VyY2VGaWVsZCBleHRlbmRzIGZyb20gYSBGaWxlVXBsb2FkZXIgfHwgSW5wdXQgfHwgaXMgYSBDaGVja0JveFxuXHRcdFx0Y29uc3Qgb0JpbmRpbmcgPVxuXHRcdFx0XHRvU291cmNlRmllbGQuZ2V0QmluZGluZyhcInVwbG9hZFVybFwiKSB8fCBvU291cmNlRmllbGQuZ2V0QmluZGluZyhcInZhbHVlXCIpIHx8IG9Tb3VyY2VGaWVsZC5nZXRCaW5kaW5nKFwic2VsZWN0ZWRcIik7XG5cdFx0XHRtRmllbGRTdGF0ZSA9IHtcblx0XHRcdFx0ZmllbGRWYWx1ZTogb0JpbmRpbmcgJiYgb0JpbmRpbmcuZ2V0VmFsdWUoKSxcblx0XHRcdFx0dmFsaWRpdHk6IF9pc0JpbmRpbmdTdGF0ZU1lc3NhZ2VzKG9CaW5kaW5nKVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGZpZWxkOiBvU291cmNlRmllbGQsXG5cdFx0XHRzdGF0ZTogbUZpZWxkU3RhdGVcblx0XHR9O1xuXHR9LFxuXHRfZm5GaXhIYXNoUXVlcnlTdHJpbmc6IGZ1bmN0aW9uIChzQ3VycmVudEhhc2g6IGFueSkge1xuXHRcdGlmIChzQ3VycmVudEhhc2ggJiYgc0N1cnJlbnRIYXNoLmluZGV4T2YoXCI/XCIpICE9PSAtMSkge1xuXHRcdFx0Ly8gc0N1cnJlbnRIYXNoIGNhbiBjb250YWluIHF1ZXJ5IHN0cmluZywgY3V0IGl0IG9mZiFcblx0XHRcdHNDdXJyZW50SGFzaCA9IHNDdXJyZW50SGFzaC5zcGxpdChcIj9cIilbMF07XG5cdFx0fVxuXHRcdHJldHVybiBzQ3VycmVudEhhc2g7XG5cdH0sXG5cdF9mbkdldExpbmtJbmZvcm1hdGlvbjogZnVuY3Rpb24gKF9vU291cmNlOiBhbnksIF9vTGluazogYW55LCBfc1Byb3BlcnR5UGF0aDogYW55LCBfc1ZhbHVlOiBhbnksIGZuU2V0QWN0aXZlOiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBfb0xpbmsgJiYgX29MaW5rLmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbCAmJiBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0TmFtZSA9IF9zVmFsdWUgfHwgKF9vU291cmNlICYmIF9vU291cmNlLmdldFZhbHVlKCkpO1xuXHRcdGNvbnN0IG9WaWV3ID0gX29MaW5rICYmIENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoX29MaW5rKTtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldyAmJiBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBvVmlldyAmJiBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpO1xuXHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VIZWxwZXIgPSBvQXBwQ29tcG9uZW50ICYmIG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdGNvbnN0IHBHZXRMaW5rc1Byb21pc2UgPSBvU2hlbGxTZXJ2aWNlSGVscGVyICYmIG9TaGVsbFNlcnZpY2VIZWxwZXIuZ2V0TGlua3NXaXRoQ2FjaGUoW1t7IHNlbWFudGljT2JqZWN0OiBzU2VtYW50aWNPYmplY3ROYW1lIH1dXSk7XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID1cblx0XHRcdG9NZXRhTW9kZWwgJiYgb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7X3NQcm9wZXJ0eVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc2ApO1xuXHRcdHJldHVybiB7XG5cdFx0XHRTZW1hbnRpY09iamVjdE5hbWU6IHNTZW1hbnRpY09iamVjdE5hbWUsXG5cdFx0XHRTZW1hbnRpY09iamVjdEZ1bGxQYXRoOiBfc1Byb3BlcnR5UGF0aCwgLy9zU2VtYW50aWNPYmplY3RGdWxsUGF0aCxcblx0XHRcdE1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdEludGVybmFsTW9kZWxDb250ZXh0OiBvSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRTaGVsbFNlcnZpY2VIZWxwZXI6IG9TaGVsbFNlcnZpY2VIZWxwZXIsXG5cdFx0XHRHZXRMaW5rc1Byb21pc2U6IHBHZXRMaW5rc1Byb21pc2UsXG5cdFx0XHRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLFxuXHRcdFx0Zm5TZXRBY3RpdmU6IGZuU2V0QWN0aXZlXG5cdFx0fTtcblx0fSxcblx0X2ZuUXVpY2tWaWV3SGFzTmV3Q29uZGl0aW9uOiBmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0UGF5bG9hZDogYW55LCBfb0xpbmtJbmZvOiBhbnkpIHtcblx0XHRpZiAob1NlbWFudGljT2JqZWN0UGF5bG9hZCAmJiBvU2VtYW50aWNPYmplY3RQYXlsb2FkLnBhdGggJiYgb1NlbWFudGljT2JqZWN0UGF5bG9hZC5wYXRoID09PSBfb0xpbmtJbmZvLlNlbWFudGljT2JqZWN0RnVsbFBhdGgpIHtcblx0XHRcdC8vIEdvdCB0aGUgcmVzb2x2ZWQgU2VtYW50aWMgT2JqZWN0IVxuXHRcdFx0Y29uc3QgYlJlc3VsdGluZ05ld0NvbmRpdGlvbkZvckNvbmRpdGlvbmFsV3JhcHBlciA9XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdFBheWxvYWRbIV9vTGlua0luZm8uU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPyBcIkhhc1RhcmdldHNOb3RGaWx0ZXJlZFwiIDogXCJIYXNUYXJnZXRzXCJdO1xuXHRcdFx0X29MaW5rSW5mby5mblNldEFjdGl2ZSghIWJSZXN1bHRpbmdOZXdDb25kaXRpb25Gb3JDb25kaXRpb25hbFdyYXBwZXIpO1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdF9mblF1aWNrVmlld1NldE5ld0NvbmRpdGlvbkZvckNvbmRpdGlvbmFsV3JhcHBlcjogZnVuY3Rpb24gKF9vTGlua0luZm86IGFueSwgX29GaW5hbFNlbWFudGljT2JqZWN0czogYW55KSB7XG5cdFx0aWYgKF9vRmluYWxTZW1hbnRpY09iamVjdHNbX29MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWVdKSB7XG5cdFx0XHRsZXQgc1RtcFBhdGgsIG9TZW1hbnRpY09iamVjdFBheWxvYWQ7XG5cdFx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RQYXRocyA9IE9iamVjdC5rZXlzKF9vRmluYWxTZW1hbnRpY09iamVjdHNbX29MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWVdKTtcblx0XHRcdGZvciAoY29uc3QgaVBhdGhzQ291bnQgaW4gYVNlbWFudGljT2JqZWN0UGF0aHMpIHtcblx0XHRcdFx0c1RtcFBhdGggPSBhU2VtYW50aWNPYmplY3RQYXRoc1tpUGF0aHNDb3VudF07XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdFBheWxvYWQgPVxuXHRcdFx0XHRcdF9vRmluYWxTZW1hbnRpY09iamVjdHNbX29MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWVdICYmXG5cdFx0XHRcdFx0X29GaW5hbFNlbWFudGljT2JqZWN0c1tfb0xpbmtJbmZvLlNlbWFudGljT2JqZWN0TmFtZV1bc1RtcFBhdGhdO1xuXHRcdFx0XHRpZiAoRmllbGRSdW50aW1lLl9mblF1aWNrVmlld0hhc05ld0NvbmRpdGlvbihvU2VtYW50aWNPYmplY3RQYXlsb2FkLCBfb0xpbmtJbmZvKSkge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRfZm5VcGRhdGVTZW1hbnRpY09iamVjdHNUYXJnZXRNb2RlbDogZnVuY3Rpb24gKG9FdmVudDogYW55LCBzVmFsdWU6IGFueSwgb0NvbnRyb2w6IGFueSwgX3NQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdGNvbnN0IG9Tb3VyY2UgPSBvRXZlbnQgJiYgb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGxldCBmblNldEFjdGl2ZTtcblx0XHRpZiAob0NvbnRyb2wuaXNBKFwic2FwLm0uT2JqZWN0U3RhdHVzXCIpKSB7XG5cdFx0XHRmblNldEFjdGl2ZSA9IChiQWN0aXZlOiBib29sZWFuKSA9PiBvQ29udHJvbC5zZXRBY3RpdmUoYkFjdGl2ZSk7XG5cdFx0fVxuXHRcdGlmIChvQ29udHJvbC5pc0EoXCJzYXAubS5PYmplY3RJZGVudGlmaWVyXCIpKSB7XG5cdFx0XHRmblNldEFjdGl2ZSA9IChiQWN0aXZlOiBib29sZWFuKSA9PiBvQ29udHJvbC5zZXRUaXRsZUFjdGl2ZShiQWN0aXZlKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0NvbmRpdGlvbmFsV3JhcHBlciA9IG9Db250cm9sICYmIG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdGlmIChvQ29uZGl0aW9uYWxXcmFwcGVyICYmIG9Db25kaXRpb25hbFdyYXBwZXIuaXNBKFwic2FwLmZlLm1hY3Jvcy5jb250cm9scy5Db25kaXRpb25hbFdyYXBwZXJcIikpIHtcblx0XHRcdGZuU2V0QWN0aXZlID0gKGJBY3RpdmU6IGJvb2xlYW4pID0+IG9Db25kaXRpb25hbFdyYXBwZXIuc2V0Q29uZGl0aW9uKGJBY3RpdmUpO1xuXHRcdH1cblx0XHRpZiAoZm5TZXRBY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3Qgb0xpbmtJbmZvID0gRmllbGRSdW50aW1lLl9mbkdldExpbmtJbmZvcm1hdGlvbihvU291cmNlLCBvQ29udHJvbCwgX3NQcm9wZXJ0eVBhdGgsIHNWYWx1ZSwgZm5TZXRBY3RpdmUpO1xuXHRcdFx0b0xpbmtJbmZvLmZuU2V0QWN0aXZlID0gZm5TZXRBY3RpdmU7XG5cdFx0XHRjb25zdCBzQ3VycmVudEhhc2ggPSBGaWVsZFJ1bnRpbWUuX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nKENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvQ29udHJvbCkuZ2V0U2hlbGxTZXJ2aWNlcygpLmdldEhhc2goKSk7XG5cdFx0XHRDb21tb25VdGlscy51cGRhdGVTZW1hbnRpY1RhcmdldHMoXG5cdFx0XHRcdFtvTGlua0luZm8uR2V0TGlua3NQcm9taXNlXSxcblx0XHRcdFx0W3sgc2VtYW50aWNPYmplY3Q6IG9MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWUsIHBhdGg6IG9MaW5rSW5mby5TZW1hbnRpY09iamVjdEZ1bGxQYXRoIH1dLFxuXHRcdFx0XHRvTGlua0luZm8uSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRcdHNDdXJyZW50SGFzaFxuXHRcdFx0KVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob0ZpbmFsU2VtYW50aWNPYmplY3RzOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob0ZpbmFsU2VtYW50aWNPYmplY3RzKSB7XG5cdFx0XHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2ZuUXVpY2tWaWV3U2V0TmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyKG9MaW5rSW5mbywgb0ZpbmFsU2VtYW50aWNPYmplY3RzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgdXBkYXRlIFNlbWFudGljIFRhcmdldHMgbW9kZWxcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRfY2hlY2tDb250cm9sSGFzTW9kZWxBbmRCaW5kaW5nQ29udGV4dChfY29udHJvbDogQ29udHJvbCkge1xuXHRcdGlmICghX2NvbnRyb2wuZ2V0TW9kZWwoKSB8fCAhX2NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdF9jaGVja0N1c3RvbURhdGFWYWx1ZUJlZm9yZVVwZGF0aW5nU2VtYW50aWNPYmplY3RNb2RlbChfY29udHJvbDogQ29udHJvbCwgcHJvcGVydHlQYXRoOiBzdHJpbmcsIGFDdXN0b21EYXRhOiBDdXN0b21EYXRhW10pOiB2b2lkIHtcblx0XHRsZXQgc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlOiBhbnk7XG5cdFx0bGV0IG9WYWx1ZUJpbmRpbmc7XG5cdFx0Y29uc3QgX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmcgPSBmdW5jdGlvbiAoc2VtYW50aWNPYmplY3RQYXRoVmFsdWU6IGFueSkge1xuXHRcdFx0cmV0dXJuICEoc2VtYW50aWNPYmplY3RQYXRoVmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHNlbWFudGljT2JqZWN0UGF0aFZhbHVlID09PSBcIm9iamVjdFwiKTtcblx0XHR9O1xuXHRcdC8vIHJlbW92ZSB0ZWNobmljYWwgY3VzdG9tIGRhdGFzIHNldCBieSBVSTVcblx0XHRhQ3VzdG9tRGF0YSA9IGFDdXN0b21EYXRhLmZpbHRlcigoY3VzdG9tRGF0YSkgPT4gY3VzdG9tRGF0YS5nZXRLZXkoKSAhPT0gXCJzYXAtdWktY3VzdG9tLXNldHRpbmdzXCIpO1xuXHRcdGZvciAoY29uc3QgaW5kZXggaW4gYUN1c3RvbURhdGEpIHtcblx0XHRcdHNTZW1hbnRpY09iamVjdFBhdGhWYWx1ZSA9IGFDdXN0b21EYXRhW2luZGV4XS5nZXRWYWx1ZSgpO1xuXHRcdFx0aWYgKCFzU2VtYW50aWNPYmplY3RQYXRoVmFsdWUgJiYgX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmcoc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlKSkge1xuXHRcdFx0XHRvVmFsdWVCaW5kaW5nID0gYUN1c3RvbURhdGFbaW5kZXhdLmdldEJpbmRpbmcoXCJ2YWx1ZVwiKTtcblx0XHRcdFx0aWYgKG9WYWx1ZUJpbmRpbmcpIHtcblx0XHRcdFx0XHRvVmFsdWVCaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImNoYW5nZVwiLCBmdW5jdGlvbiAoX29DaGFuZ2VFdmVudDogYW55KSB7XG5cdFx0XHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2ZuVXBkYXRlU2VtYW50aWNPYmplY3RzVGFyZ2V0TW9kZWwoX29DaGFuZ2VFdmVudCwgbnVsbCwgX2NvbnRyb2wsIHByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmcoc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlKSkge1xuXHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2ZuVXBkYXRlU2VtYW50aWNPYmplY3RzVGFyZ2V0TW9kZWwobnVsbCwgc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlLCBfY29udHJvbCwgcHJvcGVydHlQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdExpbmtNb2RlbENvbnRleHRDaGFuZ2U6IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSwgc1Byb3BlcnR5OiBhbnksIHNQYXRoVG9Qcm9wZXJ0eTogYW55KTogdm9pZCB7XG5cdFx0Y29uc3QgY29udHJvbCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRpZiAoRmllbGRSdW50aW1lLl9jaGVja0NvbnRyb2xIYXNNb2RlbEFuZEJpbmRpbmdDb250ZXh0KGNvbnRyb2wpKSB7XG5cdFx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gYCR7c1BhdGhUb1Byb3BlcnR5fS8ke3NQcm9wZXJ0eX1gO1xuXHRcdFx0Y29uc3QgbWRjTGluayA9IGNvbnRyb2wuZ2V0RGVwZW5kZW50cygpLmxlbmd0aCA/IGNvbnRyb2wuZ2V0RGVwZW5kZW50cygpWzBdIDogdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgYUN1c3RvbURhdGEgPSBtZGNMaW5rPy5nZXRDdXN0b21EYXRhKCk7XG5cdFx0XHRpZiAoYUN1c3RvbURhdGEgJiYgYUN1c3RvbURhdGEubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2NoZWNrQ3VzdG9tRGF0YVZhbHVlQmVmb3JlVXBkYXRpbmdTZW1hbnRpY09iamVjdE1vZGVsKGNvbnRyb2wsIHNQcm9wZXJ0eVBhdGgsIGFDdXN0b21EYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG9wZW5FeHRlcm5hbExpbms6IGZ1bmN0aW9uIChldmVudDogRXZlbnQpIHtcblx0XHRjb25zdCBzb3VyY2UgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBhbnk7XG5cdFx0aWYgKHNvdXJjZS5kYXRhKFwidXJsXCIpICYmIHNvdXJjZS5nZXRQcm9wZXJ0eShcInRleHRcIikgIT09IFwiXCIpIHtcblx0XHRcdC8vIFRoaXMgb3BlbnMgdGhlIGxpbmsgaW4gdGhlIHNhbWUgdGFiIGFzIHRoZSBsaW5rLiBJdCB3YXMgZG9uZSB0byBiZSBtb3JlIGNvbnNpc3RlbnQgd2l0aCBvdGhlciB0eXBlIG9mIGxpbmtzLlxuXHRcdFx0b3BlbldpbmRvdyhzb3VyY2UuZGF0YShcInVybFwiKSwgXCJfc2VsZlwiKTtcblx0XHR9XG5cdH0sXG5cdGNyZWF0ZVBvcG92ZXJXaXRoTm9UYXJnZXRzOiBmdW5jdGlvbiAobWRjTGluazogTWRjTGluaykge1xuXHRcdGNvbnN0IG1kY0xpbmtJZCA9IG1kY0xpbmsuZ2V0SWQoKTtcblx0XHRjb25zdCBpbGx1c3RyYXRlZE1lc3NhZ2VTZXR0aW5nczogJElsbHVzdHJhdGVkTWVzc2FnZVNldHRpbmdzID0ge1xuXHRcdFx0dGl0bGU6IGdldFJlc291cmNlTW9kZWwobWRjTGluayBhcyB1bmtub3duIGFzIENvbnRyb2wpLmdldFRleHQoXCJNX0lMTFVTVFJBVEVETUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdGRlc2NyaXB0aW9uOiBnZXRSZXNvdXJjZU1vZGVsKG1kY0xpbmsgYXMgdW5rbm93biBhcyBDb250cm9sKS5nZXRUZXh0KFwiTV9JTExVU1RSQVRFRE1FU1NBR0VfREVTQ1JJUFRJT05cIiksXG5cdFx0XHRlbmFibGVGb3JtYXR0ZWRUZXh0OiB0cnVlLFxuXHRcdFx0aWxsdXN0cmF0aW9uU2l6ZTogXCJEb3RcIiwgLy8gSWxsdXN0cmF0ZWRNZXNzYWdlU2l6ZS5Eb3Qgbm90IGF2YWlsYWJsZSBpbiBcIkB0eXBlcy9vcGVudWk1XCI6IFwiMS4xMDcuMFwiXG5cdFx0XHRpbGx1c3RyYXRpb25UeXBlOiBJbGx1c3RyYXRlZE1lc3NhZ2VUeXBlLlRlbnRcblx0XHR9O1xuXHRcdGNvbnN0IGlsbHVzdHJhdGVkTWVzc2FnZSA9IG5ldyBJbGx1c3RyYXRlZE1lc3NhZ2UoYCR7bWRjTGlua0lkfS1pbGx1c3RyYXRlZG1lc3NhZ2VgLCBpbGx1c3RyYXRlZE1lc3NhZ2VTZXR0aW5ncyk7XG5cdFx0Y29uc3QgcG9wb3ZlclNldHRpbmdzOiAkUmVzcG9uc2l2ZVBvcG92ZXJTZXR0aW5ncyA9IHtcblx0XHRcdGhvcml6b250YWxTY3JvbGxpbmc6IGZhbHNlLFxuXHRcdFx0c2hvd0hlYWRlcjogc3lzdGVtLnBob25lLFxuXHRcdFx0cGxhY2VtZW50OiBtb2JpbGVsaWJyYXJ5LlBsYWNlbWVudFR5cGUuQXV0byxcblx0XHRcdGNvbnRlbnQ6IFtpbGx1c3RyYXRlZE1lc3NhZ2VdLFxuXHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKGV2ZW50KSB7XG5cdFx0XHRcdGlmIChldmVudC5nZXRTb3VyY2UoKSkge1xuXHRcdFx0XHRcdGV2ZW50LmdldFNvdXJjZSgpLmRlc3Ryb3koKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0cmV0dXJuIG5ldyBSZXNwb25zaXZlUG9wb3ZlcihgJHttZGNMaW5rSWR9LXBvcG92ZXJgLCBwb3BvdmVyU2V0dGluZ3MpO1xuXHR9LFxuXHRvcGVuTGluazogYXN5bmMgZnVuY3Rpb24gKG1kY0xpbms6IE1kY0xpbmssIHNhcG1MaW5rOiBMaW5rKSB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGhSZWYgPSBhd2FpdCBtZGNMaW5rLmdldFRyaWdnZXJIcmVmKCk7XG5cdFx0XHRpZiAoIWhSZWYpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBsaW5rSXRlbXMgPSBhd2FpdCBtZGNMaW5rLnJldHJpZXZlTGlua0l0ZW1zKCk7XG5cdFx0XHRcdFx0aWYgKGxpbmtJdGVtcz8ubGVuZ3RoID09PSAwICYmIChtZGNMaW5rIGFzIGFueSkuZ2V0UGF5bG9hZCgpLmhhc1F1aWNrVmlld0ZhY2V0cyA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBwb3BvdmVyOiBSZXNwb25zaXZlUG9wb3ZlciA9IEZpZWxkUnVudGltZS5jcmVhdGVQb3BvdmVyV2l0aE5vVGFyZ2V0cyhtZGNMaW5rKTtcblx0XHRcdFx0XHRcdG1kY0xpbmsuYWRkRGVwZW5kZW50KHBvcG92ZXIpO1xuXHRcdFx0XHRcdFx0cG9wb3Zlci5vcGVuQnkoc2FwbUxpbmsgYXMgdW5rbm93biBhcyBDb250cm9sKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YXdhaXQgbWRjTGluay5vcGVuKHNhcG1MaW5rIGFzIHVua25vd24gYXMgQ29udHJvbCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRcdExvZy5lcnJvcihgQ2Fubm90IHJldHJpZXZlIHRoZSBRdWlja1ZpZXcgUG9wb3ZlciBkaWFsb2c6ICR7ZXJyb3J9YCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHNhcG1MaW5rKTtcblx0XHRcdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHZpZXcpO1xuXHRcdFx0XHRjb25zdCBzaGVsbFNlcnZpY2UgPSBhcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdFx0XHRjb25zdCBzaGVsbEhhc2ggPSBzaGVsbFNlcnZpY2UucGFyc2VTaGVsbEhhc2goaFJlZik7XG5cdFx0XHRcdGNvbnN0IG5hdkFyZ3MgPSB7XG5cdFx0XHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogc2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBzaGVsbEhhc2guYWN0aW9uXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwYXJhbXM6IHNoZWxsSGFzaC5wYXJhbXNcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRLZWVwQWxpdmVIZWxwZXIuc3RvcmVDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9ySGFzaCh2aWV3LCBzaGVsbEhhc2gpO1xuXG5cdFx0XHRcdGlmIChDb21tb25VdGlscy5pc1N0aWNreUVkaXRNb2RlKHNhcG1MaW5rIGFzIHVua25vd24gYXMgQ29udHJvbCkgIT09IHRydWUpIHtcblx0XHRcdFx0XHQvL1VSTCBwYXJhbXMgYW5kIHhhcHBTdGF0ZSBoYXMgYmVlbiBnZW5lcmF0ZWQgZWFybGllciBoZW5jZSB1c2luZyB0b0V4dGVybmFsXG5cdFx0XHRcdFx0c2hlbGxTZXJ2aWNlLnRvRXh0ZXJuYWwobmF2QXJncyBhcyBhbnksIGFwcENvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnN0IG5ld0hyZWYgPSBhd2FpdCBzaGVsbFNlcnZpY2UuaHJlZkZvckV4dGVybmFsQXN5bmMobmF2QXJncywgYXBwQ29tcG9uZW50KTtcblx0XHRcdFx0XHRcdG9wZW5XaW5kb3cobmV3SHJlZik7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihgRXJyb3Igd2hpbGUgcmV0aXJldmluZyBocmVmRm9yRXh0ZXJuYWwgOiAke2Vycm9yfWApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRMb2cuZXJyb3IoYEVycm9yIHRyaWdnZXJpbmcgbGluayBIcmVmOiAke2Vycm9yfWApO1xuXHRcdH1cblx0fSxcblx0cHJlc3NMaW5rOiBhc3luYyBmdW5jdGlvbiAob0V2ZW50OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvU291cmNlID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IHNhcG1MaW5rID0gb1NvdXJjZS5pc0EoXCJzYXAubS5PYmplY3RJZGVudGlmaWVyXCIpXG5cdFx0XHQ/IG9Tb3VyY2UuZmluZEVsZW1lbnRzKGZhbHNlLCAoZWxlbTogRXZlbnQpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gZWxlbS5pc0EoXCJzYXAubS5MaW5rXCIpO1xuXHRcdFx0ICB9KVswXVxuXHRcdFx0OiBvU291cmNlO1xuXG5cdFx0aWYgKG9Tb3VyY2UuZ2V0RGVwZW5kZW50cygpICYmIG9Tb3VyY2UuZ2V0RGVwZW5kZW50cygpLmxlbmd0aCA+IDAgJiYgc2FwbUxpbmsuZ2V0UHJvcGVydHkoXCJ0ZXh0XCIpICE9PSBcIlwiKSB7XG5cdFx0XHRjb25zdCBvRmllbGRJbmZvID0gb1NvdXJjZS5nZXREZXBlbmRlbnRzKClbMF07XG5cdFx0XHRpZiAob0ZpZWxkSW5mbyAmJiBvRmllbGRJbmZvLmlzQShcInNhcC51aS5tZGMuTGlua1wiKSkge1xuXHRcdFx0XHRhd2FpdCBGaWVsZFJ1bnRpbWUub3Blbkxpbmsob0ZpZWxkSW5mbywgc2FwbUxpbmspO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2FwbUxpbms7XG5cdH0sXG5cdHVwbG9hZFN0cmVhbTogZnVuY3Rpb24gKGNvbnRyb2xsZXI6IENvbnRyb2xsZXIsIGV2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IGZpbGVVcGxvYWRlciA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIEZpbGVVcGxvYWRlcixcblx0XHRcdEZFQ29udHJvbGxlciA9IEZpZWxkUnVudGltZS5fZ2V0RXh0ZW5zaW9uQ29udHJvbGxlcihjb250cm9sbGVyKSxcblx0XHRcdGZpbGVXcmFwcGVyID0gZmlsZVVwbG9hZGVyLmdldFBhcmVudCgpIGFzIHVua25vd24gYXMgRmlsZVdyYXBwZXIsXG5cdFx0XHR1cGxvYWRVcmwgPSBmaWxlV3JhcHBlci5nZXRVcGxvYWRVcmwoKTtcblxuXHRcdGlmICh1cGxvYWRVcmwgIT09IFwiXCIpIHtcblx0XHRcdGZpbGVXcmFwcGVyLnNldFVJQnVzeSh0cnVlKTtcblxuXHRcdFx0Ly8gdXNlIHVwbG9hZFVybCBmcm9tIEZpbGVXcmFwcGVyIHdoaWNoIHJldHVybnMgYSBjYW5vbmljYWwgVVJMXG5cdFx0XHRmaWxlVXBsb2FkZXIuc2V0VXBsb2FkVXJsKHVwbG9hZFVybCk7XG5cblx0XHRcdGZpbGVVcGxvYWRlci5yZW1vdmVBbGxIZWFkZXJQYXJhbWV0ZXJzKCk7XG5cdFx0XHRjb25zdCB0b2tlbiA9IChmaWxlVXBsb2FkZXIuZ2V0TW9kZWwoKSBhcyBhbnkpPy5nZXRIdHRwSGVhZGVycygpW1wiWC1DU1JGLVRva2VuXCJdO1xuXHRcdFx0aWYgKHRva2VuKSB7XG5cdFx0XHRcdGNvbnN0IGhlYWRlclBhcmFtZXRlckNTUkZUb2tlbiA9IG5ldyBGaWxlVXBsb2FkZXJQYXJhbWV0ZXIoKTtcblx0XHRcdFx0aGVhZGVyUGFyYW1ldGVyQ1NSRlRva2VuLnNldE5hbWUoXCJ4LWNzcmYtdG9rZW5cIik7XG5cdFx0XHRcdGhlYWRlclBhcmFtZXRlckNTUkZUb2tlbi5zZXRWYWx1ZSh0b2tlbik7XG5cdFx0XHRcdGZpbGVVcGxvYWRlci5hZGRIZWFkZXJQYXJhbWV0ZXIoaGVhZGVyUGFyYW1ldGVyQ1NSRlRva2VuKTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGVUYWcgPSAoZmlsZVVwbG9hZGVyLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCB8IHVuZGVmaW5lZCB8IG51bGwpPy5nZXRQcm9wZXJ0eShcIkBvZGF0YS5ldGFnXCIpO1xuXHRcdFx0aWYgKGVUYWcpIHtcblx0XHRcdFx0Y29uc3QgaGVhZGVyUGFyYW1ldGVyRVRhZyA9IG5ldyBGaWxlVXBsb2FkZXJQYXJhbWV0ZXIoKTtcblx0XHRcdFx0aGVhZGVyUGFyYW1ldGVyRVRhZy5zZXROYW1lKFwiSWYtTWF0Y2hcIik7XG5cdFx0XHRcdC8vIElnbm9yZSBFVGFnIGluIGNvbGxhYm9yYXRpb24gZHJhZnRcblx0XHRcdFx0aGVhZGVyUGFyYW1ldGVyRVRhZy5zZXRWYWx1ZShDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKGZpbGVVcGxvYWRlcikgPyBcIipcIiA6IGVUYWcpO1xuXHRcdFx0XHRmaWxlVXBsb2FkZXIuYWRkSGVhZGVyUGFyYW1ldGVyKGhlYWRlclBhcmFtZXRlckVUYWcpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgaGVhZGVyUGFyYW1ldGVyQWNjZXB0ID0gbmV3IEZpbGVVcGxvYWRlclBhcmFtZXRlcigpO1xuXHRcdFx0aGVhZGVyUGFyYW1ldGVyQWNjZXB0LnNldE5hbWUoXCJBY2NlcHRcIik7XG5cdFx0XHRoZWFkZXJQYXJhbWV0ZXJBY2NlcHQuc2V0VmFsdWUoXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuXHRcdFx0ZmlsZVVwbG9hZGVyLmFkZEhlYWRlclBhcmFtZXRlcihoZWFkZXJQYXJhbWV0ZXJBY2NlcHQpO1xuXG5cdFx0XHQvLyBzeW5jaHJvbml6ZSB1cGxvYWQgd2l0aCBvdGhlciByZXF1ZXN0c1xuXHRcdFx0Y29uc3QgdXBsb2FkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlOiBhbnksIHJlamVjdDogYW55KSA9PiB7XG5cdFx0XHRcdHRoaXMudXBsb2FkUHJvbWlzZXMgPSB0aGlzLnVwbG9hZFByb21pc2VzIHx8IHt9O1xuXHRcdFx0XHR0aGlzLnVwbG9hZFByb21pc2VzW2ZpbGVVcGxvYWRlci5nZXRJZCgpXSA9IHtcblx0XHRcdFx0XHRyZXNvbHZlOiByZXNvbHZlLFxuXHRcdFx0XHRcdHJlamVjdDogcmVqZWN0XG5cdFx0XHRcdH07XG5cdFx0XHRcdGZpbGVVcGxvYWRlci51cGxvYWQoKTtcblx0XHRcdH0pO1xuXHRcdFx0RkVDb250cm9sbGVyLmVkaXRGbG93LnN5bmNUYXNrKHVwbG9hZFByb21pc2UpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRNZXNzYWdlQm94LmVycm9yKGdldFJlc291cmNlTW9kZWwoY29udHJvbGxlcikuZ2V0VGV4dChcIk1fRklFTERfRklMRVVQTE9BREVSX0FCT1JURURfVEVYVFwiKSk7XG5cdFx0fVxuXHR9LFxuXG5cdGhhbmRsZVVwbG9hZENvbXBsZXRlOiBmdW5jdGlvbiAoXG5cdFx0ZXZlbnQ6IEV2ZW50LFxuXHRcdHByb3BlcnR5RmlsZU5hbWU6IHsgcGF0aDogc3RyaW5nIH0gfCB1bmRlZmluZWQsXG5cdFx0cHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdFx0Y29udHJvbGxlcjogQ29udHJvbGxlclxuXHQpIHtcblx0XHRjb25zdCBzdGF0dXMgPSBldmVudC5nZXRQYXJhbWV0ZXIoXCJzdGF0dXNcIiksXG5cdFx0XHRmaWxlVXBsb2FkZXIgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBGaWxlVXBsb2FkZXIsXG5cdFx0XHRmaWxlV3JhcHBlciA9IGZpbGVVcGxvYWRlci5nZXRQYXJlbnQoKSBhcyB1bmtub3duIGFzIEZpbGVXcmFwcGVyO1xuXG5cdFx0ZmlsZVdyYXBwZXIuc2V0VUlCdXN5KGZhbHNlKTtcblxuXHRcdGNvbnN0IGNvbnRleHQgPSBmaWxlVXBsb2FkZXIuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0IHwgdW5kZWZpbmVkIHwgbnVsbDtcblx0XHRpZiAoc3RhdHVzID09PSAwIHx8IHN0YXR1cyA+PSA0MDApIHtcblx0XHRcdHRoaXMuX2Rpc3BsYXlNZXNzYWdlRm9yRmFpbGVkVXBsb2FkKGV2ZW50KTtcblx0XHRcdHRoaXMudXBsb2FkUHJvbWlzZXNbZmlsZVVwbG9hZGVyLmdldElkKCldLnJlamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBuZXdFVGFnID0gZXZlbnQuZ2V0UGFyYW1ldGVyKFwiaGVhZGVyc1wiKS5ldGFnO1xuXG5cdFx0XHRpZiAobmV3RVRhZykge1xuXHRcdFx0XHQvLyBzZXQgbmV3IGV0YWcgZm9yIGZpbGVuYW1lIHVwZGF0ZSwgYnV0IHdpdGhvdXQgc2VuZGluZyBwYXRjaCByZXF1ZXN0XG5cdFx0XHRcdGNvbnRleHQ/LnNldFByb3BlcnR5KFwiQG9kYXRhLmV0YWdcIiwgbmV3RVRhZywgbnVsbCBhcyBhbnkpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBzZXQgZmlsZW5hbWUgZm9yIGxpbmsgdGV4dFxuXHRcdFx0aWYgKHByb3BlcnR5RmlsZU5hbWU/LnBhdGgpIHtcblx0XHRcdFx0Y29udGV4dD8uc2V0UHJvcGVydHkocHJvcGVydHlGaWxlTmFtZS5wYXRoLCBmaWxlVXBsb2FkZXIuZ2V0VmFsdWUoKSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIGRlbGV0ZSB0aGUgYXZhdGFyIGNhY2hlIHRoYXQgbm90IGdldHMgdXBkYXRlZCBvdGhlcndpc2Vcblx0XHRcdGZpbGVXcmFwcGVyLmF2YXRhcj8ucmVmcmVzaEF2YXRhckNhY2hlQnVzdGluZygpO1xuXG5cdFx0XHR0aGlzLl9jYWxsU2lkZUVmZmVjdHNGb3JTdHJlYW0oZXZlbnQsIGZpbGVXcmFwcGVyLCBjb250cm9sbGVyKTtcblxuXHRcdFx0dGhpcy51cGxvYWRQcm9taXNlc1tmaWxlVXBsb2FkZXIuZ2V0SWQoKV0ucmVzb2x2ZSgpO1xuXHRcdH1cblxuXHRcdGRlbGV0ZSB0aGlzLnVwbG9hZFByb21pc2VzW2ZpbGVVcGxvYWRlci5nZXRJZCgpXTtcblxuXHRcdC8vIENvbGxhYm9yYXRpb24gRHJhZnQgQWN0aXZpdHkgU3luY1xuXHRcdGNvbnN0IGlzQ29sbGFib3JhdGlvbkVuYWJsZWQgPSBDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKGZpbGVVcGxvYWRlcik7XG5cdFx0aWYgKCFpc0NvbGxhYm9yYXRpb25FbmFibGVkIHx8ICFjb250ZXh0KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgbm90aWZpY2F0aW9uRGF0YSA9IFtgJHtjb250ZXh0LmdldFBhdGgoKX0vJHtwcm9wZXJ0eVBhdGh9YF07XG5cdFx0aWYgKHByb3BlcnR5RmlsZU5hbWU/LnBhdGgpIHtcblx0XHRcdG5vdGlmaWNhdGlvbkRhdGEucHVzaChgJHtjb250ZXh0LmdldFBhdGgoKX0vJHtwcm9wZXJ0eUZpbGVOYW1lLnBhdGh9YCk7XG5cdFx0fVxuXG5cdFx0bGV0IGJpbmRpbmcgPSBjb250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHRpZiAoIWJpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhmaWxlVXBsb2FkZXIpO1xuXHRcdFx0YmluZGluZyA9IChvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQpLmdldEJpbmRpbmcoKTtcblx0XHR9XG5cdFx0aWYgKGJpbmRpbmcuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0YmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJwYXRjaENvbXBsZXRlZFwiLCAoKSA9PiB7XG5cdFx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChmaWxlV3JhcHBlciwgQWN0aXZpdHkuQ2hhbmdlLCBub3RpZmljYXRpb25EYXRhKTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQoZmlsZVdyYXBwZXIsIEFjdGl2aXR5LkNoYW5nZSwgbm90aWZpY2F0aW9uRGF0YSk7XG5cdFx0fVxuXHR9LFxuXG5cdF9kaXNwbGF5TWVzc2FnZUZvckZhaWxlZFVwbG9hZDogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0Ly8gaGFuZGxpbmcgb2YgYmFja2VuZCBlcnJvcnNcblx0XHRjb25zdCBzRXJyb3IgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicmVzcG9uc2VSYXdcIikgfHwgb0V2ZW50LmdldFBhcmFtZXRlcihcInJlc3BvbnNlXCIpO1xuXHRcdGxldCBzTWVzc2FnZVRleHQsIG9FcnJvcjtcblx0XHR0cnkge1xuXHRcdFx0b0Vycm9yID0gc0Vycm9yICYmIEpTT04ucGFyc2Uoc0Vycm9yKTtcblx0XHRcdHNNZXNzYWdlVGV4dCA9IG9FcnJvci5lcnJvciAmJiBvRXJyb3IuZXJyb3IubWVzc2FnZTtcblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRzTWVzc2FnZVRleHQgPSBzRXJyb3IgfHwgZ2V0UmVzb3VyY2VNb2RlbChvRXZlbnQuZ2V0U291cmNlKCkpLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9BQk9SVEVEX1RFWFRcIik7XG5cdFx0fVxuXHRcdE1lc3NhZ2VCb3guZXJyb3Ioc01lc3NhZ2VUZXh0KTtcblx0fSxcblxuXHRyZW1vdmVTdHJlYW06IGZ1bmN0aW9uIChldmVudDogRXZlbnQsIHByb3BlcnR5RmlsZU5hbWU6IHsgcGF0aDogc3RyaW5nIH0gfCB1bmRlZmluZWQsIHByb3BlcnR5UGF0aDogc3RyaW5nLCBjb250cm9sbGVyOiBDb250cm9sbGVyKSB7XG5cdFx0Y29uc3QgZGVsZXRlQnV0dG9uID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgQnV0dG9uO1xuXHRcdGNvbnN0IGZpbGVXcmFwcGVyID0gZGVsZXRlQnV0dG9uLmdldFBhcmVudCgpIGFzIHVua25vd24gYXMgRmlsZVdyYXBwZXI7XG5cdFx0Y29uc3QgY29udGV4dCA9IGZpbGVXcmFwcGVyLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblxuXHRcdC8vIHN0cmVhbXMgYXJlIHJlbW92ZWQgYnkgYXNzaWduaW5nIHRoZSBudWxsIHZhbHVlXG5cdFx0Y29udGV4dC5zZXRQcm9wZXJ0eShwcm9wZXJ0eVBhdGgsIG51bGwpO1xuXHRcdC8vIFdoZW4gc2V0dGluZyB0aGUgcHJvcGVydHkgdG8gbnVsbCwgdGhlIHVwbG9hZFVybCAoQEBNT0RFTC5mb3JtYXQpIGlzIHNldCB0byBcIlwiIGJ5IHRoZSBtb2RlbFxuXHRcdC8vXHR3aXRoIHRoYXQgYW5vdGhlciB1cGxvYWQgaXMgbm90IHBvc3NpYmxlIGJlZm9yZSByZWZyZXNoaW5nIHRoZSBwYWdlXG5cdFx0Ly8gKHJlZnJlc2hpbmcgdGhlIHBhZ2Ugd291bGQgcmVjcmVhdGUgdGhlIFVSTClcblx0XHQvL1x0VGhpcyBpcyB0aGUgd29ya2Fyb3VuZDpcblx0XHQvL1x0V2Ugc2V0IHRoZSBwcm9wZXJ0eSB0byB1bmRlZmluZWQgb25seSBvbiB0aGUgZnJvbnRlbmQgd2hpY2ggd2lsbCByZWNyZWF0ZSB0aGUgdXBsb2FkVXJsXG5cdFx0Y29udGV4dC5zZXRQcm9wZXJ0eShwcm9wZXJ0eVBhdGgsIHVuZGVmaW5lZCwgbnVsbCBhcyBhbnkpO1xuXG5cdFx0dGhpcy5fY2FsbFNpZGVFZmZlY3RzRm9yU3RyZWFtKGV2ZW50LCBmaWxlV3JhcHBlciwgY29udHJvbGxlcik7XG5cblx0XHQvLyBDb2xsYWJvcmF0aW9uIERyYWZ0IEFjdGl2aXR5IFN5bmNcblx0XHRjb25zdCBiQ29sbGFib3JhdGlvbkVuYWJsZWQgPSBDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKGRlbGV0ZUJ1dHRvbik7XG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0bGV0IGJpbmRpbmcgPSBjb250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHRcdGlmICghYmluZGluZy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKSkge1xuXHRcdFx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoZGVsZXRlQnV0dG9uKTtcblx0XHRcdFx0YmluZGluZyA9IChvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQpLmdldEJpbmRpbmcoKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZGF0YSA9IFtgJHtjb250ZXh0LmdldFBhdGgoKX0vJHtwcm9wZXJ0eVBhdGh9YF07XG5cdFx0XHRpZiAocHJvcGVydHlGaWxlTmFtZT8ucGF0aCkge1xuXHRcdFx0XHRkYXRhLnB1c2goYCR7Y29udGV4dC5nZXRQYXRoKCl9LyR7cHJvcGVydHlGaWxlTmFtZS5wYXRofWApO1xuXHRcdFx0fVxuXHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKGRlbGV0ZUJ1dHRvbiwgQWN0aXZpdHkuTGl2ZUNoYW5nZSwgZGF0YSk7XG5cblx0XHRcdGJpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwicGF0Y2hDb21wbGV0ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQoZGVsZXRlQnV0dG9uLCBBY3Rpdml0eS5DaGFuZ2UsIGRhdGEpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXG5cdF9jYWxsU2lkZUVmZmVjdHNGb3JTdHJlYW06IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSwgb0NvbnRyb2w6IGFueSwgb0NvbnRyb2xsZXI6IGFueSkge1xuXHRcdGNvbnN0IG9GRUNvbnRyb2xsZXIgPSBGaWVsZFJ1bnRpbWUuX2dldEV4dGVuc2lvbkNvbnRyb2xsZXIob0NvbnRyb2xsZXIpO1xuXHRcdGlmIChvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpLmlzVHJhbnNpZW50KCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKG9Db250cm9sKSB7XG5cdFx0XHRvRXZlbnQub1NvdXJjZSA9IG9Db250cm9sO1xuXHRcdH1cblx0XHRvRkVDb250cm9sbGVyLl9zaWRlRWZmZWN0cy5oYW5kbGVGaWVsZENoYW5nZShvRXZlbnQsIHRoaXMuZ2V0RmllbGRTdGF0ZU9uQ2hhbmdlKG9FdmVudCkuc3RhdGVbXCJ2YWxpZGl0eVwiXSk7XG5cdH0sXG5cblx0Z2V0SWNvbkZvck1pbWVUeXBlOiBmdW5jdGlvbiAoc01pbWVUeXBlOiBhbnkpIHtcblx0XHRyZXR1cm4gSWNvblBvb2wuZ2V0SWNvbkZvck1pbWVUeXBlKHNNaW1lVHlwZSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byByZXRyaWV2ZSB0ZXh0IGZyb20gdmFsdWUgbGlzdCBmb3IgRGF0YUZpZWxkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdFxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5VmFsdWUgVGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBkYXRhZmllbGRcblx0ICogQHBhcmFtIHNQcm9wZXJ0eUZ1bGxQYXRoIFRoZSBwcm9wZXJ0eSBmdWxsIHBhdGgnc1xuXHQgKiBAcGFyYW0gc0Rpc3BsYXlGb3JtYXQgVGhlIGRpc3BsYXkgZm9ybWF0IGZvciB0aGUgZGF0YWZpZWxkXG5cdCAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgdmFsdWUgaW4gY29ycmVzcG9uZGluZyBkaXNwbGF5IGZvcm1hdC5cblx0ICovXG5cdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q6IGZ1bmN0aW9uIChzUHJvcGVydHlWYWx1ZTogc3RyaW5nLCBzUHJvcGVydHlGdWxsUGF0aDogc3RyaW5nLCBzRGlzcGxheUZvcm1hdDogc3RyaW5nKSB7XG5cdFx0bGV0IHNUZXh0UHJvcGVydHk6IHN0cmluZztcblx0XHRsZXQgb01ldGFNb2RlbDtcblx0XHRsZXQgc1Byb3BlcnR5TmFtZTogc3RyaW5nO1xuXHRcdGlmIChzUHJvcGVydHlWYWx1ZSkge1xuXHRcdFx0b01ldGFNb2RlbCA9IENvbW1vbkhlbHBlci5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdHNQcm9wZXJ0eU5hbWUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUHJvcGVydHlGdWxsUGF0aH1Ac2FwdWkubmFtZWApO1xuXHRcdFx0cmV0dXJuIG9NZXRhTW9kZWxcblx0XHRcdFx0LnJlcXVlc3RWYWx1ZUxpc3RJbmZvKHNQcm9wZXJ0eUZ1bGxQYXRoLCB0cnVlKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAobVZhbHVlTGlzdEluZm86IGFueSkge1xuXHRcdFx0XHRcdC8vIHRha2UgdGhlIFwiXCIgb25lIGlmIGV4aXN0cywgb3RoZXJ3aXNlIHRha2UgdGhlIGZpcnN0IG9uZSBpbiB0aGUgb2JqZWN0IFRPRE86IHRvIGJlIGRpc2N1c3NlZFxuXHRcdFx0XHRcdGNvbnN0IG9WYWx1ZUxpc3RJbmZvID0gbVZhbHVlTGlzdEluZm9bbVZhbHVlTGlzdEluZm9bXCJcIl0gPyBcIlwiIDogT2JqZWN0LmtleXMobVZhbHVlTGlzdEluZm8pWzBdXTtcblx0XHRcdFx0XHRjb25zdCBvVmFsdWVMaXN0TW9kZWwgPSBvVmFsdWVMaXN0SW5mby4kbW9kZWw7XG5cdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbFZhbHVlTGlzdCA9IG9WYWx1ZUxpc3RNb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdFx0XHRjb25zdCBvUGFyYW1XaXRoS2V5ID0gb1ZhbHVlTGlzdEluZm8uUGFyYW1ldGVycy5maW5kKGZ1bmN0aW9uIChvUGFyYW1ldGVyOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvUGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5ICYmIG9QYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gc1Byb3BlcnR5TmFtZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZiAob1BhcmFtV2l0aEtleSAmJiAhb1BhcmFtV2l0aEtleS5WYWx1ZUxpc3RQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGBJbmNvbnNpc3RlbnQgdmFsdWUgaGVscCBhbm5vdGF0aW9uIGZvciAke3NQcm9wZXJ0eU5hbWV9YCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IG9UZXh0QW5ub3RhdGlvbiA9IG9NZXRhTW9kZWxWYWx1ZUxpc3QuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdFx0YC8ke29WYWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofS8ke29QYXJhbVdpdGhLZXkuVmFsdWVMaXN0UHJvcGVydHl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0YFxuXHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRpZiAob1RleHRBbm5vdGF0aW9uICYmIG9UZXh0QW5ub3RhdGlvbi4kUGF0aCkge1xuXHRcdFx0XHRcdFx0c1RleHRQcm9wZXJ0eSA9IG9UZXh0QW5ub3RhdGlvbi4kUGF0aDtcblx0XHRcdFx0XHRcdGNvbnN0IG9GaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRcdFx0cGF0aDogb1BhcmFtV2l0aEtleS5WYWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0b3BlcmF0b3I6IFwiRVFcIixcblx0XHRcdFx0XHRcdFx0dmFsdWUxOiBzUHJvcGVydHlWYWx1ZVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRjb25zdCBvTGlzdEJpbmRpbmcgPSBvVmFsdWVMaXN0TW9kZWwuYmluZExpc3QoYC8ke29WYWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofWAsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBvRmlsdGVyLCB7XG5cdFx0XHRcdFx0XHRcdCRzZWxlY3Q6IHNUZXh0UHJvcGVydHlcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9MaXN0QmluZGluZy5yZXF1ZXN0Q29udGV4dHMoMCwgMik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNEaXNwbGF5Rm9ybWF0ID0gXCJWYWx1ZVwiO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNQcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGFDb250ZXh0czogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc0Rlc2NyaXB0aW9uID0gc1RleHRQcm9wZXJ0eSA/IGFDb250ZXh0c1swXT8uZ2V0T2JqZWN0KClbc1RleHRQcm9wZXJ0eV0gOiBcIlwiO1xuXHRcdFx0XHRcdHN3aXRjaCAoc0Rpc3BsYXlGb3JtYXQpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gc0Rlc2NyaXB0aW9uO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uVmFsdWVcIjpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIikuZ2V0VGV4dChcIkNfRk9STUFUX0ZPUl9URVhUX0FSUkFOR0VNRU5UXCIsIFtcblx0XHRcdFx0XHRcdFx0XHRzRGVzY3JpcHRpb24sXG5cdFx0XHRcdFx0XHRcdFx0c1Byb3BlcnR5VmFsdWVcblx0XHRcdFx0XHRcdFx0XSk7XG5cdFx0XHRcdFx0XHRjYXNlIFwiVmFsdWVEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKS5nZXRUZXh0KFwiQ19GT1JNQVRfRk9SX1RFWFRfQVJSQU5HRU1FTlRcIiwgW1xuXHRcdFx0XHRcdFx0XHRcdHNQcm9wZXJ0eVZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcdHNEZXNjcmlwdGlvblxuXHRcdFx0XHRcdFx0XHRdKTtcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzUHJvcGVydHlWYWx1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzTXNnID1cblx0XHRcdFx0XHRcdG9FcnJvci5zdGF0dXMgJiYgb0Vycm9yLnN0YXR1cyA9PT0gNDA0XG5cdFx0XHRcdFx0XHRcdD8gYE1ldGFkYXRhIG5vdCBmb3VuZCAoJHtvRXJyb3Iuc3RhdHVzfSkgZm9yIHZhbHVlIGhlbHAgb2YgcHJvcGVydHkgJHtzUHJvcGVydHlGdWxsUGF0aH1gXG5cdFx0XHRcdFx0XHRcdDogb0Vycm9yLm1lc3NhZ2U7XG5cdFx0XHRcdFx0TG9nLmVycm9yKHNNc2cpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHNQcm9wZXJ0eVZhbHVlO1xuXHR9LFxuXG5cdGhhbmRsZVR5cGVNaXNzbWF0Y2g6IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSkge1xuXHRcdGNvbnN0IHJlc291cmNlTW9kZWwgPSBnZXRSZXNvdXJjZU1vZGVsKG9FdmVudC5nZXRTb3VyY2UoKSk7XG5cdFx0TWVzc2FnZUJveC5lcnJvcihyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9XUk9OR19NSU1FVFlQRVwiKSwge1xuXHRcdFx0ZGV0YWlsczpcblx0XHRcdFx0YDxwPjxzdHJvbmc+JHtyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9XUk9OR19NSU1FVFlQRV9ERVRBSUxTX1NFTEVDVEVEXCIpfTwvc3Ryb25nPjwvcD4ke1xuXHRcdFx0XHRcdG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkubWltZVR5cGVcblx0XHRcdFx0fTxicj48YnI+YCArXG5cdFx0XHRcdGA8cD48c3Ryb25nPiR7cmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9GSUVMRF9GSUxFVVBMT0FERVJfV1JPTkdfTUlNRVRZUEVfREVUQUlMU19BTExPV0VEXCIpfTwvc3Ryb25nPjwvcD4ke29FdmVudFxuXHRcdFx0XHRcdC5nZXRTb3VyY2UoKVxuXHRcdFx0XHRcdC5nZXRNaW1lVHlwZSgpXG5cdFx0XHRcdFx0LnRvU3RyaW5nKClcblx0XHRcdFx0XHQucmVwbGFjZUFsbChcIixcIiwgXCIsIFwiKX1gLFxuXHRcdFx0Y29udGVudFdpZHRoOiBcIjE1MHB4XCJcblx0XHR9IGFzIGFueSk7XG5cdH0sXG5cblx0aGFuZGxlRmlsZVNpemVFeGNlZWQ6IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSAvKmlGaWxlU2l6ZTogYW55Ki8pIHtcblx0XHRNZXNzYWdlQm94LmVycm9yKFxuXHRcdFx0Z2V0UmVzb3VyY2VNb2RlbChvRXZlbnQuZ2V0U291cmNlKCkpLmdldFRleHQoXG5cdFx0XHRcdFwiTV9GSUVMRF9GSUxFVVBMT0FERVJfRklMRV9UT09fQklHXCIsXG5cdFx0XHRcdG9FdmVudC5nZXRTb3VyY2UoKS5nZXRNYXhpbXVtRmlsZVNpemUoKS50b0ZpeGVkKDMpXG5cdFx0XHQpLFxuXHRcdFx0e1xuXHRcdFx0XHRjb250ZW50V2lkdGg6IFwiMTUwcHhcIlxuXHRcdFx0fSBhcyBhbnlcblx0XHQpO1xuXHR9LFxuXG5cdF9nZXRFeHRlbnNpb25Db250cm9sbGVyOiBmdW5jdGlvbiAob0NvbnRyb2xsZXI6IGFueSkge1xuXHRcdHJldHVybiBvQ29udHJvbGxlci5pc0EoXCJzYXAuZmUuY29yZS5FeHRlbnNpb25BUElcIikgPyBvQ29udHJvbGxlci5fY29udHJvbGxlciA6IG9Db250cm9sbGVyO1xuXHR9XG59O1xuXG4vKipcbiAqIEBnbG9iYWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgRmllbGRSdW50aW1lO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBcUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLFNBQVNBLHVCQUF1QixDQUFDQyxLQUFjLEVBQTBDO0lBQ3hGLElBQUlDLE9BQU8sR0FBSUQsS0FBSyxDQUFDRSxpQkFBaUIsRUFBRSxDQUFhQyxVQUFVLEVBQUU7SUFFakUsSUFBSSxDQUFDRixPQUFPLENBQUNHLEdBQUcsQ0FBQyx3Q0FBd0MsQ0FBQyxFQUFFO01BQzNELE1BQU1DLEtBQUssR0FBR0MsV0FBVyxDQUFDQyxhQUFhLENBQUNQLEtBQUssQ0FBQztNQUM5Q0MsT0FBTyxHQUFJSSxLQUFLLENBQUNILGlCQUFpQixFQUFFLENBQWFDLFVBQVUsRUFBRTtJQUM5RDtJQUVBLE9BQU9GLE9BQU87RUFDZjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNTyxZQUFZLEdBQUc7SUFDcEJDLG1CQUFtQixFQUFFQyxTQUFnQjtJQUNyQ0MsY0FBYyxFQUFFRCxTQUFnQjtJQUVoQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDRSw2QkFBNkIsRUFBRSxVQUFVQyxPQUFnQixFQUFFQyxXQUEyQixFQUFFQyxRQUFnQixFQUFFO01BQ3pHLElBQUlELFdBQVcsQ0FBQ0UsUUFBUSxFQUFFO1FBQ3pCLElBQUlDLGVBQWUsR0FBR0osT0FBTyxDQUFDWCxpQkFBaUIsRUFBYTtRQUM1RCxNQUFNRyxLQUFLLEdBQUdDLFdBQVcsQ0FBQ0MsYUFBYSxD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
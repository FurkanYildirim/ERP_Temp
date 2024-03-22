/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/extend", "sap/base/util/ObjectPath", "sap/fe/core/helpers/ClassSupport", "sap/m/library", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/core/routing/HashChanger", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel"], function (Log, extend, ObjectPath, ClassSupport, library, Core, Fragment, ControllerExtension, OverrideExecution, HashChanger, XMLPreprocessor, XMLTemplateProcessor, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  let oLastFocusedControl;

  /**
   * A controller extension offering hooks into the routing flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.86.0
   */
  let ShareUtils = (_dec = defineUI5Class("sap.fe.core.controllerextensions.Share"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = finalExtension(), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(ShareUtils, _ControllerExtension);
    function ShareUtils() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = ShareUtils.prototype;
    _proto.onInit = function onInit() {
      const collaborationInfoModel = new JSONModel({
        url: "",
        appTitle: "",
        subTitle: "",
        minifyUrlForChat: true,
        appId: ""
      });
      this.base.getView().setModel(collaborationInfoModel, "collaborationInfo");
    };
    _proto.onExit = function onExit() {
      var _this$base, _this$base$getView;
      const collaborationInfoModel = (_this$base = this.base) === null || _this$base === void 0 ? void 0 : (_this$base$getView = _this$base.getView()) === null || _this$base$getView === void 0 ? void 0 : _this$base$getView.getModel("collaborationInfo");
      if (collaborationInfoModel) {
        collaborationInfoModel.destroy();
      }
    }

    /**
     * Opens the share sheet.
     *
     * @function
     * @param oControl The control to which the ActionSheet is opened.
     * @alias sap.fe.core.controllerextensions.Share#openShareSheet
     * @public
     * @since 1.93.0
     */;
    _proto.openShareSheet = function openShareSheet(oControl) {
      this._openShareSheetImpl(oControl);
    }

    /**
     * Adapts the metadata used while sharing the page URL via 'Send Email', 'Share in SAP Jam', and 'Save as Tile'.
     *
     * @function
     * @param oShareMetadata Object containing the share metadata.
     * @param oShareMetadata.url Default URL that will be used via 'Send Email', 'Share in SAP Jam', and 'Save as Tile'
     * @param oShareMetadata.title Default title that will be used as 'email subject' in 'Send Email', 'share text' in 'Share in SAP Jam' and 'title' in 'Save as Tile'
     * @param oShareMetadata.email Email-specific metadata.
     * @param oShareMetadata.email.url URL that will be used specifically for 'Send Email'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.email.title Title that will be used as "email subject" in 'Send Email'. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.jam SAP Jam-specific metadata.
     * @param oShareMetadata.jam.url URL that will be used specifically for 'Share in SAP Jam'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.jam.title Title that will be used as 'share text' in 'Share in SAP Jam'. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.tile Save as Tile-specific metadata.
     * @param oShareMetadata.tile.url URL that will be used specifically for 'Save as Tile'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.tile.title Title to be used for the tile. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.tile.subtitle Subtitle to be used for the tile.
     * @param oShareMetadata.tile.icon Icon to be used for the tile.
     * @param oShareMetadata.tile.queryUrl Query URL of an OData service from which data for a dynamic tile is read.
     * @returns Share Metadata or a Promise resolving the Share Metadata
     * @alias sap.fe.core.controllerextensions.Share#adaptShareMetadata
     * @public
     * @since 1.93.0
     */;
    _proto.adaptShareMetadata = function adaptShareMetadata(oShareMetadata) {
      return oShareMetadata;
    };
    _proto._openShareSheetImpl = async function _openShareSheetImpl(by) {
      let oShareActionSheet;
      const sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "",
        oShareMetadata = {
          url: window.location.origin + window.location.pathname + window.location.search + (sHash ? sBasePath + sHash : window.location.hash),
          title: document.title,
          email: {
            url: "",
            title: ""
          },
          jam: {
            url: "",
            title: ""
          },
          tile: {
            url: "",
            title: "",
            subtitle: "",
            icon: "",
            queryUrl: ""
          }
        };
      oLastFocusedControl = by;
      const setShareEmailData = function (shareActionSheet, oModelData) {
        const oShareMailModel = shareActionSheet.getModel("shareData");
        const oNewMailData = extend(oShareMailModel.getData(), oModelData);
        oShareMailModel.setData(oNewMailData);
      };
      try {
        const oModelData = await Promise.resolve(this.adaptShareMetadata(oShareMetadata));
        const fragmentController = {
          shareEmailPressed: function () {
            const oMailModel = oShareActionSheet.getModel("shareData");
            const oMailData = oMailModel.getData();
            const oResource = Core.getLibraryResourceBundle("sap.fe.core");
            const sEmailSubject = oMailData.email.title ? oMailData.email.title : oResource.getText("T_SHARE_UTIL_HELPER_SAPFE_EMAIL_SUBJECT", [oMailData.title]);
            library.URLHelper.triggerEmail(undefined, sEmailSubject, oMailData.email.url ? oMailData.email.url : oMailData.url);
          },
          shareMSTeamsPressed: function () {
            const msTeamsModel = oShareActionSheet.getModel("shareData");
            const msTeamsData = msTeamsModel.getData();
            const message = msTeamsData.email.title ? msTeamsData.email.title : msTeamsData.title;
            const url = msTeamsData.email.url ? msTeamsData.email.url : msTeamsData.url;
            const newWindowOpen = window.open("", "ms-teams-share-popup", "width=700,height=600");
            newWindowOpen.opener = null;
            newWindowOpen.location = `https://teams.microsoft.com/share?msgText=${encodeURIComponent(message)}&href=${encodeURIComponent(url)}`;
          },
          onSaveTilePress: function () {
            // TODO it seems that the press event is executed before the dialog is available - adding a timeout is a cheap workaround
            setTimeout(function () {
              var _Core$byId;
              (_Core$byId = Core.byId("bookmarkDialog")) === null || _Core$byId === void 0 ? void 0 : _Core$byId.attachAfterClose(function () {
                oLastFocusedControl.focus();
              });
            }, 0);
          },
          shareJamPressed: () => {
            this._doOpenJamShareDialog(oModelData.jam.title ? oModelData.jam.title : oModelData.title, oModelData.jam.url ? oModelData.jam.url : oModelData.url);
          }
        };
        fragmentController.onCancelPressed = function () {
          oShareActionSheet.close();
        };
        fragmentController.setShareSheet = function (oShareSheet) {
          by.shareSheet = oShareSheet;
        };
        const oThis = new JSONModel({});
        const oPreprocessorSettings = {
          bindingContexts: {
            this: oThis.createBindingContext("/")
          },
          models: {
            this: oThis
          }
        };
        const oTileData = {
          title: oModelData.tile.title ? oModelData.tile.title : oModelData.title,
          subtitle: oModelData.tile.subtitle,
          icon: oModelData.tile.icon,
          url: oModelData.tile.url ? oModelData.tile.url : oModelData.url.substring(oModelData.url.indexOf("#")),
          queryUrl: oModelData.tile.queryUrl
        };
        if (by.shareSheet) {
          oShareActionSheet = by.shareSheet;
          const oShareModel = oShareActionSheet.getModel("share");
          this._setStaticShareData(oShareModel);
          const oNewData = extend(oShareModel.getData(), oTileData);
          oShareModel.setData(oNewData);
          setShareEmailData(oShareActionSheet, oModelData);
          oShareActionSheet.openBy(by);
        } else {
          const sFragmentName = "sap.fe.macros.share.ShareSheet";
          const oPopoverFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
          try {
            const oFragment = await Promise.resolve(XMLPreprocessor.process(oPopoverFragment, {
              name: sFragmentName
            }, oPreprocessorSettings));
            oShareActionSheet = await Fragment.load({
              definition: oFragment,
              controller: fragmentController
            });
            oShareActionSheet.setModel(new JSONModel(oTileData || {}), "share");
            const oShareModel = oShareActionSheet.getModel("share");
            this._setStaticShareData(oShareModel);
            const oNewData = extend(oShareModel.getData(), oTileData);
            oShareModel.setData(oNewData);
            oShareActionSheet.setModel(new JSONModel(oModelData || {}), "shareData");
            setShareEmailData(oShareActionSheet, oModelData);
            by.addDependent(oShareActionSheet);
            oShareActionSheet.openBy(by);
            fragmentController.setShareSheet(oShareActionSheet);
          } catch (oError) {
            Log.error("Error while opening the share fragment", oError);
          }
        }
      } catch (oError) {
        Log.error("Error while fetching the share model data", oError);
      }
    };
    _proto._setStaticShareData = function _setStaticShareData(shareModel) {
      const oResource = Core.getLibraryResourceBundle("sap.fe.core");
      shareModel.setProperty("/jamButtonText", oResource.getText("T_COMMON_SAPFE_SHARE_JAM"));
      shareModel.setProperty("/emailButtonText", oResource.getText("T_SEMANTIC_CONTROL_SEND_EMAIL"));
      shareModel.setProperty("/msTeamsShareButtonText", oResource.getText("T_COMMON_SAPFE_SHARE_MSTEAMS"));
      // Share to Microsoft Teams is feature which for now only gets enabled for selected customers.
      // The switch "sapHorizonEnabled" and check for it was aligned with the Fiori launchpad team.
      if (ObjectPath.get("sap-ushell-config.renderers.fiori2.componentData.config.sapHorizonEnabled") === true) {
        shareModel.setProperty("/msTeamsVisible", true);
      } else {
        shareModel.setProperty("/msTeamsVisible", false);
      }
      const fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
      shareModel.setProperty("/jamVisible", !!fnGetUser && fnGetUser().isJamActive());
      shareModel.setProperty("/saveAsTileVisible", !!(sap && sap.ushell && sap.ushell.Container));
    }

    //the actual opening of the JAM share dialog
    ;
    _proto._doOpenJamShareDialog = function _doOpenJamShareDialog(text, sUrl) {
      const oShareDialog = Core.createComponent({
        name: "sap.collaboration.components.fiori.sharing.dialog",
        settings: {
          object: {
            id: sUrl,
            share: text
          }
        }
      });
      oShareDialog.open();
    }

    /**
     * Triggers the email flow.
     *
     * @returns {void}
     * @private
     */;
    _proto._triggerEmail = async function _triggerEmail() {
      const shareMetadata = await this._adaptShareMetadata();
      const oResource = Core.getLibraryResourceBundle("sap.fe.core");
      const sEmailSubject = shareMetadata.email.title ? shareMetadata.email.title : oResource.getText("T_SHARE_UTIL_HELPER_SAPFE_EMAIL_SUBJECT", [shareMetadata.title]);
      library.URLHelper.triggerEmail(undefined, sEmailSubject, shareMetadata.email.url ? shareMetadata.email.url : shareMetadata.url);
    }

    /**
     * Triggers the share to jam flow.
     *
     * @returns {void}
     * @private
     */;
    _proto._triggerShareToJam = async function _triggerShareToJam() {
      const shareMetadata = await this._adaptShareMetadata();
      this._doOpenJamShareDialog(shareMetadata.jam.title ? shareMetadata.jam.title : shareMetadata.title, shareMetadata.jam.url ? shareMetadata.jam.url : window.location.origin + window.location.pathname + shareMetadata.url);
    }

    /**
     * Triggers the save as tile flow.
     *
     * @param [source]
     * @returns {void}
     * @private
     */;
    _proto._saveAsTile = async function _saveAsTile(source) {
      const shareMetadata = await this._adaptShareMetadata(),
        internalAddBookmarkButton = source.getDependents()[0],
        sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
      shareMetadata.url = sHash ? sBasePath + sHash : window.location.hash;

      // set AddBookmarkButton properties
      internalAddBookmarkButton.setTitle(shareMetadata.tile.title ? shareMetadata.tile.title : shareMetadata.title);
      internalAddBookmarkButton.setSubtitle(shareMetadata.tile.subtitle);
      internalAddBookmarkButton.setTileIcon(shareMetadata.tile.icon);
      internalAddBookmarkButton.setCustomUrl(shareMetadata.tile.url ? shareMetadata.tile.url : shareMetadata.url);
      internalAddBookmarkButton.setServiceUrl(shareMetadata.tile.queryUrl);

      // addBookmarkButton fire press
      internalAddBookmarkButton.firePress();
    }

    /**
     * Call the adaptShareMetadata extension.
     *
     * @returns {object} Share Metadata
     * @private
     */;
    _proto._adaptShareMetadata = function _adaptShareMetadata() {
      const sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "",
        oShareMetadata = {
          url: window.location.origin + window.location.pathname + window.location.search + (sHash ? sBasePath + sHash : window.location.hash),
          title: document.title,
          email: {
            url: "",
            title: ""
          },
          jam: {
            url: "",
            title: ""
          },
          tile: {
            url: "",
            title: "",
            subtitle: "",
            icon: "",
            queryUrl: ""
          }
        };
      return this.adaptShareMetadata(oShareMetadata);
    };
    return ShareUtils;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "openShareSheet", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "openShareSheet"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptShareMetadata", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptShareMetadata"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_triggerEmail", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "_triggerEmail"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_triggerShareToJam", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "_triggerShareToJam"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_saveAsTile", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "_saveAsTile"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_adaptShareMetadata", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "_adaptShareMetadata"), _class2.prototype)), _class2)) || _class);
  return ShareUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvTGFzdEZvY3VzZWRDb250cm9sIiwiU2hhcmVVdGlscyIsImRlZmluZVVJNUNsYXNzIiwibWV0aG9kT3ZlcnJpZGUiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwib25Jbml0IiwiY29sbGFib3JhdGlvbkluZm9Nb2RlbCIsIkpTT05Nb2RlbCIsInVybCIsImFwcFRpdGxlIiwic3ViVGl0bGUiLCJtaW5pZnlVcmxGb3JDaGF0IiwiYXBwSWQiLCJiYXNlIiwiZ2V0VmlldyIsInNldE1vZGVsIiwib25FeGl0IiwiZ2V0TW9kZWwiLCJkZXN0cm95Iiwib3BlblNoYXJlU2hlZXQiLCJvQ29udHJvbCIsIl9vcGVuU2hhcmVTaGVldEltcGwiLCJhZGFwdFNoYXJlTWV0YWRhdGEiLCJvU2hhcmVNZXRhZGF0YSIsImJ5Iiwib1NoYXJlQWN0aW9uU2hlZXQiLCJzSGFzaCIsIkhhc2hDaGFuZ2VyIiwiZ2V0SW5zdGFuY2UiLCJnZXRIYXNoIiwic0Jhc2VQYXRoIiwiaHJlZkZvckFwcFNwZWNpZmljSGFzaCIsIndpbmRvdyIsImxvY2F0aW9uIiwib3JpZ2luIiwicGF0aG5hbWUiLCJzZWFyY2giLCJoYXNoIiwidGl0bGUiLCJkb2N1bWVudCIsImVtYWlsIiwiamFtIiwidGlsZSIsInN1YnRpdGxlIiwiaWNvbiIsInF1ZXJ5VXJsIiwic2V0U2hhcmVFbWFpbERhdGEiLCJzaGFyZUFjdGlvblNoZWV0Iiwib01vZGVsRGF0YSIsIm9TaGFyZU1haWxNb2RlbCIsIm9OZXdNYWlsRGF0YSIsImV4dGVuZCIsImdldERhdGEiLCJzZXREYXRhIiwiUHJvbWlzZSIsInJlc29sdmUiLCJmcmFnbWVudENvbnRyb2xsZXIiLCJzaGFyZUVtYWlsUHJlc3NlZCIsIm9NYWlsTW9kZWwiLCJvTWFpbERhdGEiLCJvUmVzb3VyY2UiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwic0VtYWlsU3ViamVjdCIsImdldFRleHQiLCJsaWJyYXJ5IiwiVVJMSGVscGVyIiwidHJpZ2dlckVtYWlsIiwidW5kZWZpbmVkIiwic2hhcmVNU1RlYW1zUHJlc3NlZCIsIm1zVGVhbXNNb2RlbCIsIm1zVGVhbXNEYXRhIiwibWVzc2FnZSIsIm5ld1dpbmRvd09wZW4iLCJvcGVuIiwib3BlbmVyIiwiZW5jb2RlVVJJQ29tcG9uZW50Iiwib25TYXZlVGlsZVByZXNzIiwic2V0VGltZW91dCIsImJ5SWQiLCJhdHRhY2hBZnRlckNsb3NlIiwiZm9jdXMiLCJzaGFyZUphbVByZXNzZWQiLCJfZG9PcGVuSmFtU2hhcmVEaWFsb2ciLCJvbkNhbmNlbFByZXNzZWQiLCJjbG9zZSIsInNldFNoYXJlU2hlZXQiLCJvU2hhcmVTaGVldCIsInNoYXJlU2hlZXQiLCJvVGhpcyIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsImJpbmRpbmdDb250ZXh0cyIsInRoaXMiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsIm1vZGVscyIsIm9UaWxlRGF0YSIsInN1YnN0cmluZyIsImluZGV4T2YiLCJvU2hhcmVNb2RlbCIsIl9zZXRTdGF0aWNTaGFyZURhdGEiLCJvTmV3RGF0YSIsIm9wZW5CeSIsInNGcmFnbWVudE5hbWUiLCJvUG9wb3ZlckZyYWdtZW50IiwiWE1MVGVtcGxhdGVQcm9jZXNzb3IiLCJsb2FkVGVtcGxhdGUiLCJvRnJhZ21lbnQiLCJYTUxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwibmFtZSIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwiYWRkRGVwZW5kZW50Iiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJzaGFyZU1vZGVsIiwic2V0UHJvcGVydHkiLCJPYmplY3RQYXRoIiwiZ2V0IiwiZm5HZXRVc2VyIiwiaXNKYW1BY3RpdmUiLCJzYXAiLCJ1c2hlbGwiLCJDb250YWluZXIiLCJ0ZXh0Iiwic1VybCIsIm9TaGFyZURpYWxvZyIsImNyZWF0ZUNvbXBvbmVudCIsInNldHRpbmdzIiwib2JqZWN0IiwiaWQiLCJzaGFyZSIsIl90cmlnZ2VyRW1haWwiLCJzaGFyZU1ldGFkYXRhIiwiX2FkYXB0U2hhcmVNZXRhZGF0YSIsIl90cmlnZ2VyU2hhcmVUb0phbSIsIl9zYXZlQXNUaWxlIiwic291cmNlIiwiaW50ZXJuYWxBZGRCb29rbWFya0J1dHRvbiIsImdldERlcGVuZGVudHMiLCJzZXRUaXRsZSIsInNldFN1YnRpdGxlIiwic2V0VGlsZUljb24iLCJzZXRDdXN0b21VcmwiLCJzZXRTZXJ2aWNlVXJsIiwiZmlyZVByZXNzIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2hhcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgZXh0ZW5kIGZyb20gXCJzYXAvYmFzZS91dGlsL2V4dGVuZFwiO1xuaW1wb3J0IE9iamVjdFBhdGggZnJvbSBcInNhcC9iYXNlL3V0aWwvT2JqZWN0UGF0aFwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBtZXRob2RPdmVycmlkZSwgcHVibGljRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSBBY3Rpb25TaGVldCBmcm9tIFwic2FwL20vQWN0aW9uU2hlZXRcIjtcbmltcG9ydCB0eXBlIERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgbGlicmFyeSBmcm9tIFwic2FwL20vbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCBIYXNoQ2hhbmdlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9IYXNoQ2hhbmdlclwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBYTUxUZW1wbGF0ZVByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvWE1MVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcIi4uL1BhZ2VDb250cm9sbGVyXCI7XG5cbmxldCBvTGFzdEZvY3VzZWRDb250cm9sOiBDb250cm9sO1xuXG4vKipcbiAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgaG9va3MgaW50byB0aGUgcm91dGluZyBmbG93IG9mIHRoZSBhcHBsaWNhdGlvblxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjg2LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuU2hhcmVcIilcbmNsYXNzIFNoYXJlVXRpbHMgZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRvbkluaXQoKTogdm9pZCB7XG5cdFx0Y29uc3QgY29sbGFib3JhdGlvbkluZm9Nb2RlbDogSlNPTk1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHR1cmw6IFwiXCIsXG5cdFx0XHRhcHBUaXRsZTogXCJcIixcblx0XHRcdHN1YlRpdGxlOiBcIlwiLFxuXHRcdFx0bWluaWZ5VXJsRm9yQ2hhdDogdHJ1ZSxcblx0XHRcdGFwcElkOiBcIlwiXG5cdFx0fSk7XG5cdFx0dGhpcy5iYXNlLmdldFZpZXcoKS5zZXRNb2RlbChjb2xsYWJvcmF0aW9uSW5mb01vZGVsLCBcImNvbGxhYm9yYXRpb25JbmZvXCIpO1xuXHR9XG5cblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25FeGl0KCk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbGxhYm9yYXRpb25JbmZvTW9kZWw6IEpTT05Nb2RlbCA9IHRoaXMuYmFzZT8uZ2V0VmlldygpPy5nZXRNb2RlbChcImNvbGxhYm9yYXRpb25JbmZvXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRpZiAoY29sbGFib3JhdGlvbkluZm9Nb2RlbCkge1xuXHRcdFx0Y29sbGFib3JhdGlvbkluZm9Nb2RlbC5kZXN0cm95KCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE9wZW5zIHRoZSBzaGFyZSBzaGVldC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBvQ29udHJvbCBUaGUgY29udHJvbCB0byB3aGljaCB0aGUgQWN0aW9uU2hlZXQgaXMgb3BlbmVkLlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuU2hhcmUjb3BlblNoYXJlU2hlZXRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45My4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0b3BlblNoYXJlU2hlZXQob0NvbnRyb2w6IG9iamVjdCkge1xuXHRcdHRoaXMuX29wZW5TaGFyZVNoZWV0SW1wbChvQ29udHJvbCk7XG5cdH1cblxuXHQvKipcblx0ICogQWRhcHRzIHRoZSBtZXRhZGF0YSB1c2VkIHdoaWxlIHNoYXJpbmcgdGhlIHBhZ2UgVVJMIHZpYSAnU2VuZCBFbWFpbCcsICdTaGFyZSBpbiBTQVAgSmFtJywgYW5kICdTYXZlIGFzIFRpbGUnLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBzaGFyZSBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnVybCBEZWZhdWx0IFVSTCB0aGF0IHdpbGwgYmUgdXNlZCB2aWEgJ1NlbmQgRW1haWwnLCAnU2hhcmUgaW4gU0FQIEphbScsIGFuZCAnU2F2ZSBhcyBUaWxlJ1xuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEudGl0bGUgRGVmYXVsdCB0aXRsZSB0aGF0IHdpbGwgYmUgdXNlZCBhcyAnZW1haWwgc3ViamVjdCcgaW4gJ1NlbmQgRW1haWwnLCAnc2hhcmUgdGV4dCcgaW4gJ1NoYXJlIGluIFNBUCBKYW0nIGFuZCAndGl0bGUnIGluICdTYXZlIGFzIFRpbGUnXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS5lbWFpbCBFbWFpbC1zcGVjaWZpYyBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmVtYWlsLnVybCBVUkwgdGhhdCB3aWxsIGJlIHVzZWQgc3BlY2lmaWNhbGx5IGZvciAnU2VuZCBFbWFpbCcuIFRoaXMgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIG9TaGFyZU1ldGFkYXRhLnVybC5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmVtYWlsLnRpdGxlIFRpdGxlIHRoYXQgd2lsbCBiZSB1c2VkIGFzIFwiZW1haWwgc3ViamVjdFwiIGluICdTZW5kIEVtYWlsJy4gVGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb1NoYXJlTWV0YWRhdGEudGl0bGUuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS5qYW0gU0FQIEphbS1zcGVjaWZpYyBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmphbS51cmwgVVJMIHRoYXQgd2lsbCBiZSB1c2VkIHNwZWNpZmljYWxseSBmb3IgJ1NoYXJlIGluIFNBUCBKYW0nLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS51cmwuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS5qYW0udGl0bGUgVGl0bGUgdGhhdCB3aWxsIGJlIHVzZWQgYXMgJ3NoYXJlIHRleHQnIGluICdTaGFyZSBpbiBTQVAgSmFtJy4gVGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb1NoYXJlTWV0YWRhdGEudGl0bGUuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aWxlIFNhdmUgYXMgVGlsZS1zcGVjaWZpYyBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUudXJsIFVSTCB0aGF0IHdpbGwgYmUgdXNlZCBzcGVjaWZpY2FsbHkgZm9yICdTYXZlIGFzIFRpbGUnLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS51cmwuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aWxlLnRpdGxlIFRpdGxlIHRvIGJlIHVzZWQgZm9yIHRoZSB0aWxlLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS50aXRsZS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUuc3VidGl0bGUgU3VidGl0bGUgdG8gYmUgdXNlZCBmb3IgdGhlIHRpbGUuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aWxlLmljb24gSWNvbiB0byBiZSB1c2VkIGZvciB0aGUgdGlsZS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUucXVlcnlVcmwgUXVlcnkgVVJMIG9mIGFuIE9EYXRhIHNlcnZpY2UgZnJvbSB3aGljaCBkYXRhIGZvciBhIGR5bmFtaWMgdGlsZSBpcyByZWFkLlxuXHQgKiBAcmV0dXJucyBTaGFyZSBNZXRhZGF0YSBvciBhIFByb21pc2UgcmVzb2x2aW5nIHRoZSBTaGFyZSBNZXRhZGF0YVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuU2hhcmUjYWRhcHRTaGFyZU1ldGFkYXRhXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTMuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRhZGFwdFNoYXJlTWV0YWRhdGEob1NoYXJlTWV0YWRhdGE6IHtcblx0XHR1cmw6IHN0cmluZztcblx0XHR0aXRsZTogc3RyaW5nO1xuXHRcdGVtYWlsPzogeyB1cmw6IHN0cmluZzsgdGl0bGU6IHN0cmluZyB9O1xuXHRcdGphbT86IHsgdXJsOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmcgfTtcblx0XHR0aWxlPzogeyB1cmw6IHN0cmluZzsgdGl0bGU6IHN0cmluZzsgc3VidGl0bGU6IHN0cmluZzsgaWNvbjogc3RyaW5nOyBxdWVyeVVybDogc3RyaW5nIH07XG5cdH0pOiBvYmplY3QgfCBQcm9taXNlPG9iamVjdD4ge1xuXHRcdHJldHVybiBvU2hhcmVNZXRhZGF0YTtcblx0fVxuXG5cdGFzeW5jIF9vcGVuU2hhcmVTaGVldEltcGwoYnk6IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGxldCBvU2hhcmVBY3Rpb25TaGVldDogQWN0aW9uU2hlZXQ7XG5cdFx0Y29uc3Qgc0hhc2ggPSBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKSxcblx0XHRcdHNCYXNlUGF0aCA9IChIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpIGFzIGFueSkuaHJlZkZvckFwcFNwZWNpZmljSGFzaFxuXHRcdFx0XHQ/IChIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpIGFzIGFueSkuaHJlZkZvckFwcFNwZWNpZmljSGFzaChcIlwiKVxuXHRcdFx0XHQ6IFwiXCIsXG5cdFx0XHRvU2hhcmVNZXRhZGF0YSA9IHtcblx0XHRcdFx0dXJsOlxuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gK1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArXG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnNlYXJjaCArXG5cdFx0XHRcdFx0KHNIYXNoID8gc0Jhc2VQYXRoICsgc0hhc2ggOiB3aW5kb3cubG9jYXRpb24uaGFzaCksXG5cdFx0XHRcdHRpdGxlOiBkb2N1bWVudC50aXRsZSxcblx0XHRcdFx0ZW1haWw6IHtcblx0XHRcdFx0XHR1cmw6IFwiXCIsXG5cdFx0XHRcdFx0dGl0bGU6IFwiXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0amFtOiB7XG5cdFx0XHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0XHRcdHRpdGxlOiBcIlwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRpbGU6IHtcblx0XHRcdFx0XHR1cmw6IFwiXCIsXG5cdFx0XHRcdFx0dGl0bGU6IFwiXCIsXG5cdFx0XHRcdFx0c3VidGl0bGU6IFwiXCIsXG5cdFx0XHRcdFx0aWNvbjogXCJcIixcblx0XHRcdFx0XHRxdWVyeVVybDogXCJcIlxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdG9MYXN0Rm9jdXNlZENvbnRyb2wgPSBieTtcblxuXHRcdGNvbnN0IHNldFNoYXJlRW1haWxEYXRhID0gZnVuY3Rpb24gKHNoYXJlQWN0aW9uU2hlZXQ6IGFueSwgb01vZGVsRGF0YTogYW55KSB7XG5cdFx0XHRjb25zdCBvU2hhcmVNYWlsTW9kZWwgPSBzaGFyZUFjdGlvblNoZWV0LmdldE1vZGVsKFwic2hhcmVEYXRhXCIpO1xuXHRcdFx0Y29uc3Qgb05ld01haWxEYXRhID0gZXh0ZW5kKG9TaGFyZU1haWxNb2RlbC5nZXREYXRhKCksIG9Nb2RlbERhdGEpO1xuXHRcdFx0b1NoYXJlTWFpbE1vZGVsLnNldERhdGEob05ld01haWxEYXRhKTtcblx0XHR9O1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG9Nb2RlbERhdGE6IGFueSA9IGF3YWl0IFByb21pc2UucmVzb2x2ZSh0aGlzLmFkYXB0U2hhcmVNZXRhZGF0YShvU2hhcmVNZXRhZGF0YSkpO1xuXHRcdFx0Y29uc3QgZnJhZ21lbnRDb250cm9sbGVyOiBhbnkgPSB7XG5cdFx0XHRcdHNoYXJlRW1haWxQcmVzc2VkOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb01haWxNb2RlbCA9IG9TaGFyZUFjdGlvblNoZWV0LmdldE1vZGVsKFwic2hhcmVEYXRhXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0XHRjb25zdCBvTWFpbERhdGEgPSBvTWFpbE1vZGVsLmdldERhdGEoKTtcblx0XHRcdFx0XHRjb25zdCBvUmVzb3VyY2UgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdFx0XHRcdGNvbnN0IHNFbWFpbFN1YmplY3QgPSBvTWFpbERhdGEuZW1haWwudGl0bGVcblx0XHRcdFx0XHRcdD8gb01haWxEYXRhLmVtYWlsLnRpdGxlXG5cdFx0XHRcdFx0XHQ6IG9SZXNvdXJjZS5nZXRUZXh0KFwiVF9TSEFSRV9VVElMX0hFTFBFUl9TQVBGRV9FTUFJTF9TVUJKRUNUXCIsIFtvTWFpbERhdGEudGl0bGVdKTtcblx0XHRcdFx0XHRsaWJyYXJ5LlVSTEhlbHBlci50cmlnZ2VyRW1haWwodW5kZWZpbmVkLCBzRW1haWxTdWJqZWN0LCBvTWFpbERhdGEuZW1haWwudXJsID8gb01haWxEYXRhLmVtYWlsLnVybCA6IG9NYWlsRGF0YS51cmwpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzaGFyZU1TVGVhbXNQcmVzc2VkOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y29uc3QgbXNUZWFtc01vZGVsID0gb1NoYXJlQWN0aW9uU2hlZXQuZ2V0TW9kZWwoXCJzaGFyZURhdGFcIikgYXMgSlNPTk1vZGVsO1xuXHRcdFx0XHRcdGNvbnN0IG1zVGVhbXNEYXRhID0gbXNUZWFtc01vZGVsLmdldERhdGEoKTtcblx0XHRcdFx0XHRjb25zdCBtZXNzYWdlID0gbXNUZWFtc0RhdGEuZW1haWwudGl0bGUgPyBtc1RlYW1zRGF0YS5lbWFpbC50aXRsZSA6IG1zVGVhbXNEYXRhLnRpdGxlO1xuXHRcdFx0XHRcdGNvbnN0IHVybCA9IG1zVGVhbXNEYXRhLmVtYWlsLnVybCA/IG1zVGVhbXNEYXRhLmVtYWlsLnVybCA6IG1zVGVhbXNEYXRhLnVybDtcblx0XHRcdFx0XHRjb25zdCBuZXdXaW5kb3dPcGVuID0gd2luZG93Lm9wZW4oXCJcIiwgXCJtcy10ZWFtcy1zaGFyZS1wb3B1cFwiLCBcIndpZHRoPTcwMCxoZWlnaHQ9NjAwXCIpO1xuXHRcdFx0XHRcdG5ld1dpbmRvd09wZW4hLm9wZW5lciA9IG51bGw7XG5cdFx0XHRcdFx0bmV3V2luZG93T3BlbiEubG9jYXRpb24gPSBgaHR0cHM6Ly90ZWFtcy5taWNyb3NvZnQuY29tL3NoYXJlP21zZ1RleHQ9JHtlbmNvZGVVUklDb21wb25lbnQoXG5cdFx0XHRcdFx0XHRtZXNzYWdlXG5cdFx0XHRcdFx0KX0maHJlZj0ke2VuY29kZVVSSUNvbXBvbmVudCh1cmwpfWA7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uU2F2ZVRpbGVQcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIFRPRE8gaXQgc2VlbXMgdGhhdCB0aGUgcHJlc3MgZXZlbnQgaXMgZXhlY3V0ZWQgYmVmb3JlIHRoZSBkaWFsb2cgaXMgYXZhaWxhYmxlIC0gYWRkaW5nIGEgdGltZW91dCBpcyBhIGNoZWFwIHdvcmthcm91bmRcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdChDb3JlLmJ5SWQoXCJib29rbWFya0RpYWxvZ1wiKSBhcyBEaWFsb2cpPy5hdHRhY2hBZnRlckNsb3NlKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0b0xhc3RGb2N1c2VkQ29udHJvbC5mb2N1cygpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHNoYXJlSmFtUHJlc3NlZDogKCkgPT4ge1xuXHRcdFx0XHRcdHRoaXMuX2RvT3BlbkphbVNoYXJlRGlhbG9nKFxuXHRcdFx0XHRcdFx0b01vZGVsRGF0YS5qYW0udGl0bGUgPyBvTW9kZWxEYXRhLmphbS50aXRsZSA6IG9Nb2RlbERhdGEudGl0bGUsXG5cdFx0XHRcdFx0XHRvTW9kZWxEYXRhLmphbS51cmwgPyBvTW9kZWxEYXRhLmphbS51cmwgOiBvTW9kZWxEYXRhLnVybFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGZyYWdtZW50Q29udHJvbGxlci5vbkNhbmNlbFByZXNzZWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdG9TaGFyZUFjdGlvblNoZWV0LmNsb3NlKCk7XG5cdFx0XHR9O1xuXG5cdFx0XHRmcmFnbWVudENvbnRyb2xsZXIuc2V0U2hhcmVTaGVldCA9IGZ1bmN0aW9uIChvU2hhcmVTaGVldDogYW55KSB7XG5cdFx0XHRcdGJ5LnNoYXJlU2hlZXQgPSBvU2hhcmVTaGVldDtcblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IG9UaGlzID0gbmV3IEpTT05Nb2RlbCh7fSk7XG5cdFx0XHRjb25zdCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdHRoaXM6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHR0aGlzOiBvVGhpc1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0Y29uc3Qgb1RpbGVEYXRhID0ge1xuXHRcdFx0XHR0aXRsZTogb01vZGVsRGF0YS50aWxlLnRpdGxlID8gb01vZGVsRGF0YS50aWxlLnRpdGxlIDogb01vZGVsRGF0YS50aXRsZSxcblx0XHRcdFx0c3VidGl0bGU6IG9Nb2RlbERhdGEudGlsZS5zdWJ0aXRsZSxcblx0XHRcdFx0aWNvbjogb01vZGVsRGF0YS50aWxlLmljb24sXG5cdFx0XHRcdHVybDogb01vZGVsRGF0YS50aWxlLnVybCA/IG9Nb2RlbERhdGEudGlsZS51cmwgOiBvTW9kZWxEYXRhLnVybC5zdWJzdHJpbmcob01vZGVsRGF0YS51cmwuaW5kZXhPZihcIiNcIikpLFxuXHRcdFx0XHRxdWVyeVVybDogb01vZGVsRGF0YS50aWxlLnF1ZXJ5VXJsXG5cdFx0XHR9O1xuXHRcdFx0aWYgKGJ5LnNoYXJlU2hlZXQpIHtcblx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQgPSBieS5zaGFyZVNoZWV0O1xuXG5cdFx0XHRcdGNvbnN0IG9TaGFyZU1vZGVsID0gb1NoYXJlQWN0aW9uU2hlZXQuZ2V0TW9kZWwoXCJzaGFyZVwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdHRoaXMuX3NldFN0YXRpY1NoYXJlRGF0YShvU2hhcmVNb2RlbCk7XG5cdFx0XHRcdGNvbnN0IG9OZXdEYXRhID0gZXh0ZW5kKG9TaGFyZU1vZGVsLmdldERhdGEoKSwgb1RpbGVEYXRhKTtcblx0XHRcdFx0b1NoYXJlTW9kZWwuc2V0RGF0YShvTmV3RGF0YSk7XG5cdFx0XHRcdHNldFNoYXJlRW1haWxEYXRhKG9TaGFyZUFjdGlvblNoZWV0LCBvTW9kZWxEYXRhKTtcblx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQub3BlbkJ5KGJ5KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHNGcmFnbWVudE5hbWUgPSBcInNhcC5mZS5tYWNyb3Muc2hhcmUuU2hhcmVTaGVldFwiO1xuXHRcdFx0XHRjb25zdCBvUG9wb3ZlckZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBvRnJhZ21lbnQgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUoXG5cdFx0XHRcdFx0XHRYTUxQcmVwcm9jZXNzb3IucHJvY2VzcyhvUG9wb3ZlckZyYWdtZW50LCB7IG5hbWU6IHNGcmFnbWVudE5hbWUgfSwgb1ByZXByb2Nlc3NvclNldHRpbmdzKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQgPSAoYXdhaXQgRnJhZ21lbnQubG9hZCh7XG5cdFx0XHRcdFx0XHRkZWZpbml0aW9uOiBvRnJhZ21lbnQsXG5cdFx0XHRcdFx0XHRjb250cm9sbGVyOiBmcmFnbWVudENvbnRyb2xsZXJcblx0XHRcdFx0XHR9KSkgYXMgYW55O1xuXG5cdFx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQuc2V0TW9kZWwobmV3IEpTT05Nb2RlbChvVGlsZURhdGEgfHwge30pLCBcInNoYXJlXCIpO1xuXHRcdFx0XHRcdGNvbnN0IG9TaGFyZU1vZGVsID0gb1NoYXJlQWN0aW9uU2hlZXQuZ2V0TW9kZWwoXCJzaGFyZVwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdFx0dGhpcy5fc2V0U3RhdGljU2hhcmVEYXRhKG9TaGFyZU1vZGVsKTtcblx0XHRcdFx0XHRjb25zdCBvTmV3RGF0YSA9IGV4dGVuZChvU2hhcmVNb2RlbC5nZXREYXRhKCksIG9UaWxlRGF0YSk7XG5cdFx0XHRcdFx0b1NoYXJlTW9kZWwuc2V0RGF0YShvTmV3RGF0YSk7XG5cblx0XHRcdFx0XHRvU2hhcmVBY3Rpb25TaGVldC5zZXRNb2RlbChuZXcgSlNPTk1vZGVsKG9Nb2RlbERhdGEgfHwge30pLCBcInNoYXJlRGF0YVwiKTtcblx0XHRcdFx0XHRzZXRTaGFyZUVtYWlsRGF0YShvU2hhcmVBY3Rpb25TaGVldCwgb01vZGVsRGF0YSk7XG5cblx0XHRcdFx0XHRieS5hZGREZXBlbmRlbnQob1NoYXJlQWN0aW9uU2hlZXQpO1xuXHRcdFx0XHRcdG9TaGFyZUFjdGlvblNoZWV0Lm9wZW5CeShieSk7XG5cdFx0XHRcdFx0ZnJhZ21lbnRDb250cm9sbGVyLnNldFNoYXJlU2hlZXQob1NoYXJlQWN0aW9uU2hlZXQpO1xuXHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIG9wZW5pbmcgdGhlIHNoYXJlIGZyYWdtZW50XCIsIG9FcnJvcik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZmV0Y2hpbmcgdGhlIHNoYXJlIG1vZGVsIGRhdGFcIiwgb0Vycm9yKTtcblx0XHR9XG5cdH1cblxuXHRfc2V0U3RhdGljU2hhcmVEYXRhKHNoYXJlTW9kZWw6IGFueSkge1xuXHRcdGNvbnN0IG9SZXNvdXJjZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0c2hhcmVNb2RlbC5zZXRQcm9wZXJ0eShcIi9qYW1CdXR0b25UZXh0XCIsIG9SZXNvdXJjZS5nZXRUZXh0KFwiVF9DT01NT05fU0FQRkVfU0hBUkVfSkFNXCIpKTtcblx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL2VtYWlsQnV0dG9uVGV4dFwiLCBvUmVzb3VyY2UuZ2V0VGV4dChcIlRfU0VNQU5USUNfQ09OVFJPTF9TRU5EX0VNQUlMXCIpKTtcblx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL21zVGVhbXNTaGFyZUJ1dHRvblRleHRcIiwgb1Jlc291cmNlLmdldFRleHQoXCJUX0NPTU1PTl9TQVBGRV9TSEFSRV9NU1RFQU1TXCIpKTtcblx0XHQvLyBTaGFyZSB0byBNaWNyb3NvZnQgVGVhbXMgaXMgZmVhdHVyZSB3aGljaCBmb3Igbm93IG9ubHkgZ2V0cyBlbmFibGVkIGZvciBzZWxlY3RlZCBjdXN0b21lcnMuXG5cdFx0Ly8gVGhlIHN3aXRjaCBcInNhcEhvcml6b25FbmFibGVkXCIgYW5kIGNoZWNrIGZvciBpdCB3YXMgYWxpZ25lZCB3aXRoIHRoZSBGaW9yaSBsYXVuY2hwYWQgdGVhbS5cblx0XHRpZiAoT2JqZWN0UGF0aC5nZXQoXCJzYXAtdXNoZWxsLWNvbmZpZy5yZW5kZXJlcnMuZmlvcmkyLmNvbXBvbmVudERhdGEuY29uZmlnLnNhcEhvcml6b25FbmFibGVkXCIpID09PSB0cnVlKSB7XG5cdFx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL21zVGVhbXNWaXNpYmxlXCIsIHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL21zVGVhbXNWaXNpYmxlXCIsIGZhbHNlKTtcblx0XHR9XG5cdFx0Y29uc3QgZm5HZXRVc2VyID0gT2JqZWN0UGF0aC5nZXQoXCJzYXAudXNoZWxsLkNvbnRhaW5lci5nZXRVc2VyXCIpO1xuXHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvamFtVmlzaWJsZVwiLCAhIWZuR2V0VXNlciAmJiBmbkdldFVzZXIoKS5pc0phbUFjdGl2ZSgpKTtcblx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL3NhdmVBc1RpbGVWaXNpYmxlXCIsICEhKHNhcCAmJiBzYXAudXNoZWxsICYmIHNhcC51c2hlbGwuQ29udGFpbmVyKSk7XG5cdH1cblxuXHQvL3RoZSBhY3R1YWwgb3BlbmluZyBvZiB0aGUgSkFNIHNoYXJlIGRpYWxvZ1xuXHRfZG9PcGVuSmFtU2hhcmVEaWFsb2codGV4dDogYW55LCBzVXJsPzogYW55KSB7XG5cdFx0Y29uc3Qgb1NoYXJlRGlhbG9nID0gQ29yZS5jcmVhdGVDb21wb25lbnQoe1xuXHRcdFx0bmFtZTogXCJzYXAuY29sbGFib3JhdGlvbi5jb21wb25lbnRzLmZpb3JpLnNoYXJpbmcuZGlhbG9nXCIsXG5cdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRvYmplY3Q6IHtcblx0XHRcdFx0XHRpZDogc1VybCxcblx0XHRcdFx0XHRzaGFyZTogdGV4dFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0KG9TaGFyZURpYWxvZyBhcyBhbnkpLm9wZW4oKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VycyB0aGUgZW1haWwgZmxvdy5cblx0ICpcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgX3RyaWdnZXJFbWFpbCgpIHtcblx0XHRjb25zdCBzaGFyZU1ldGFkYXRhOiBhbnkgPSBhd2FpdCB0aGlzLl9hZGFwdFNoYXJlTWV0YWRhdGEoKTtcblx0XHRjb25zdCBvUmVzb3VyY2UgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdGNvbnN0IHNFbWFpbFN1YmplY3QgPSBzaGFyZU1ldGFkYXRhLmVtYWlsLnRpdGxlXG5cdFx0XHQ/IHNoYXJlTWV0YWRhdGEuZW1haWwudGl0bGVcblx0XHRcdDogb1Jlc291cmNlLmdldFRleHQoXCJUX1NIQVJFX1VUSUxfSEVMUEVSX1NBUEZFX0VNQUlMX1NVQkpFQ1RcIiwgW3NoYXJlTWV0YWRhdGEudGl0bGVdKTtcblx0XHRsaWJyYXJ5LlVSTEhlbHBlci50cmlnZ2VyRW1haWwodW5kZWZpbmVkLCBzRW1haWxTdWJqZWN0LCBzaGFyZU1ldGFkYXRhLmVtYWlsLnVybCA/IHNoYXJlTWV0YWRhdGEuZW1haWwudXJsIDogc2hhcmVNZXRhZGF0YS51cmwpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIHRoZSBzaGFyZSB0byBqYW0gZmxvdy5cblx0ICpcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgX3RyaWdnZXJTaGFyZVRvSmFtKCkge1xuXHRcdGNvbnN0IHNoYXJlTWV0YWRhdGE6IGFueSA9IGF3YWl0IHRoaXMuX2FkYXB0U2hhcmVNZXRhZGF0YSgpO1xuXHRcdHRoaXMuX2RvT3BlbkphbVNoYXJlRGlhbG9nKFxuXHRcdFx0c2hhcmVNZXRhZGF0YS5qYW0udGl0bGUgPyBzaGFyZU1ldGFkYXRhLmphbS50aXRsZSA6IHNoYXJlTWV0YWRhdGEudGl0bGUsXG5cdFx0XHRzaGFyZU1ldGFkYXRhLmphbS51cmwgPyBzaGFyZU1ldGFkYXRhLmphbS51cmwgOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgc2hhcmVNZXRhZGF0YS51cmxcblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIHRoZSBzYXZlIGFzIHRpbGUgZmxvdy5cblx0ICpcblx0ICogQHBhcmFtIFtzb3VyY2VdXG5cdCAqIEByZXR1cm5zIHt2b2lkfVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIF9zYXZlQXNUaWxlKHNvdXJjZTogYW55KSB7XG5cdFx0Y29uc3Qgc2hhcmVNZXRhZGF0YTogYW55ID0gYXdhaXQgdGhpcy5fYWRhcHRTaGFyZU1ldGFkYXRhKCksXG5cdFx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uID0gc291cmNlLmdldERlcGVuZGVudHMoKVswXSxcblx0XHRcdHNIYXNoID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKS5nZXRIYXNoKCksXG5cdFx0XHRzQmFzZVBhdGggPSAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2hcblx0XHRcdFx0PyAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2goXCJcIilcblx0XHRcdFx0OiBcIlwiO1xuXHRcdHNoYXJlTWV0YWRhdGEudXJsID0gc0hhc2ggPyBzQmFzZVBhdGggKyBzSGFzaCA6IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXG5cdFx0Ly8gc2V0IEFkZEJvb2ttYXJrQnV0dG9uIHByb3BlcnRpZXNcblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLnNldFRpdGxlKHNoYXJlTWV0YWRhdGEudGlsZS50aXRsZSA/IHNoYXJlTWV0YWRhdGEudGlsZS50aXRsZSA6IHNoYXJlTWV0YWRhdGEudGl0bGUpO1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0U3VidGl0bGUoc2hhcmVNZXRhZGF0YS50aWxlLnN1YnRpdGxlKTtcblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLnNldFRpbGVJY29uKHNoYXJlTWV0YWRhdGEudGlsZS5pY29uKTtcblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLnNldEN1c3RvbVVybChzaGFyZU1ldGFkYXRhLnRpbGUudXJsID8gc2hhcmVNZXRhZGF0YS50aWxlLnVybCA6IHNoYXJlTWV0YWRhdGEudXJsKTtcblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLnNldFNlcnZpY2VVcmwoc2hhcmVNZXRhZGF0YS50aWxlLnF1ZXJ5VXJsKTtcblxuXHRcdC8vIGFkZEJvb2ttYXJrQnV0dG9uIGZpcmUgcHJlc3Ncblx0XHRpbnRlcm5hbEFkZEJvb2ttYXJrQnV0dG9uLmZpcmVQcmVzcygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGwgdGhlIGFkYXB0U2hhcmVNZXRhZGF0YSBleHRlbnNpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IFNoYXJlIE1ldGFkYXRhXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0X2FkYXB0U2hhcmVNZXRhZGF0YSgpIHtcblx0XHRjb25zdCBzSGFzaCA9IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpLFxuXHRcdFx0c0Jhc2VQYXRoID0gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoXG5cdFx0XHRcdD8gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoKFwiXCIpXG5cdFx0XHRcdDogXCJcIixcblx0XHRcdG9TaGFyZU1ldGFkYXRhID0ge1xuXHRcdFx0XHR1cmw6XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLm9yaWdpbiArXG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uc2VhcmNoICtcblx0XHRcdFx0XHQoc0hhc2ggPyBzQmFzZVBhdGggKyBzSGFzaCA6IHdpbmRvdy5sb2NhdGlvbi5oYXNoKSxcblx0XHRcdFx0dGl0bGU6IGRvY3VtZW50LnRpdGxlLFxuXHRcdFx0XHRlbWFpbDoge1xuXHRcdFx0XHRcdHVybDogXCJcIixcblx0XHRcdFx0XHR0aXRsZTogXCJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRqYW06IHtcblx0XHRcdFx0XHR1cmw6IFwiXCIsXG5cdFx0XHRcdFx0dGl0bGU6IFwiXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0dGlsZToge1xuXHRcdFx0XHRcdHVybDogXCJcIixcblx0XHRcdFx0XHR0aXRsZTogXCJcIixcblx0XHRcdFx0XHRzdWJ0aXRsZTogXCJcIixcblx0XHRcdFx0XHRpY29uOiBcIlwiLFxuXHRcdFx0XHRcdHF1ZXJ5VXJsOiBcIlwiXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0cmV0dXJuIHRoaXMuYWRhcHRTaGFyZU1ldGFkYXRhKG9TaGFyZU1ldGFkYXRhKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTaGFyZVV0aWxzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7O0VBa0JBLElBQUlBLG1CQUE0Qjs7RUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQSxJQVFNQyxVQUFVLFdBRGZDLGNBQWMsQ0FBQyx3Q0FBd0MsQ0FBQyxVQUl2REMsY0FBYyxFQUFFLFVBWWhCQSxjQUFjLEVBQUUsVUFpQmhCQyxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQTZCaEJELGVBQWUsRUFBRSxVQUNqQkUsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFVBK0xuQ0osZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsV0FnQmhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQWdCaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBMkJoQkQsZUFBZSxFQUFFLFdBQ2pCQyxjQUFjLEVBQUU7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEsT0F6VGpCSSxNQUFNLEdBRE4sa0JBQ2U7TUFDZCxNQUFNQyxzQkFBaUMsR0FBRyxJQUFJQyxTQUFTLENBQUM7UUFDdkRDLEdBQUcsRUFBRSxFQUFFO1FBQ1BDLFFBQVEsRUFBRSxFQUFFO1FBQ1pDLFFBQVEsRUFBRSxFQUFFO1FBQ1pDLGdCQUFnQixFQUFFLElBQUk7UUFDdEJDLEtBQUssRUFBRTtNQUNSLENBQUMsQ0FBQztNQUNGLElBQUksQ0FBQ0MsSUFBSSxDQUFDQyxPQUFPLEVBQUUsQ0FBQ0MsUUFBUSxDQUFDVCxzQkFBc0IsRUFBRSxtQkFBbUIsQ0FBQztJQUMxRSxDQUFDO0lBQUEsT0FHRFUsTUFBTSxHQUROLGtCQUNlO01BQUE7TUFDZCxNQUFNVixzQkFBaUMsaUJBQUcsSUFBSSxDQUFDTyxJQUFJLHFFQUFULFdBQVdDLE9BQU8sRUFBRSx1REFBcEIsbUJBQXNCRyxRQUFRLENBQUMsbUJBQW1CLENBQWM7TUFDMUcsSUFBSVgsc0JBQXNCLEVBQUU7UUFDM0JBLHNCQUFzQixDQUFDWSxPQUFPLEVBQUU7TUFDakM7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FSQztJQUFBLE9BV0FDLGNBQWMsR0FGZCx3QkFFZUMsUUFBZ0IsRUFBRTtNQUNoQyxJQUFJLENBQUNDLG1CQUFtQixDQUFDRCxRQUFRLENBQUM7SUFDbkM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BdkJDO0lBQUEsT0EwQkFFLGtCQUFrQixHQUZsQiw0QkFFbUJDLGNBTWxCLEVBQTRCO01BQzVCLE9BQU9BLGNBQWM7SUFDdEIsQ0FBQztJQUFBLE9BRUtGLG1CQUFtQixHQUF6QixtQ0FBMEJHLEVBQU8sRUFBaUI7TUFDakQsSUFBSUMsaUJBQThCO01BQ2xDLE1BQU1DLEtBQUssR0FBR0MsV0FBVyxDQUFDQyxXQUFXLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFO1FBQ2hEQyxTQUFTLEdBQUlILFdBQVcsQ0FBQ0MsV0FBVyxFQUFFLENBQVNHLHNCQUFzQixHQUNqRUosV0FBVyxDQUFDQyxXQUFXLEVBQUUsQ0FBU0csc0JBQXNCLENBQUMsRUFBRSxDQUFDLEdBQzdELEVBQUU7UUFDTFIsY0FBYyxHQUFHO1VBQ2hCZixHQUFHLEVBQ0Z3QixNQUFNLENBQUNDLFFBQVEsQ0FBQ0MsTUFBTSxHQUN0QkYsTUFBTSxDQUFDQyxRQUFRLENBQUNFLFFBQVEsR0FDeEJILE1BQU0sQ0FBQ0MsUUFBUSxDQUFDRyxNQUFNLElBQ3JCVixLQUFLLEdBQUdJLFNBQVMsR0FBR0osS0FBSyxHQUFHTSxNQUFNLENBQUNDLFFBQVEsQ0FBQ0ksSUFBSSxDQUFDO1VBQ25EQyxLQUFLLEVBQUVDLFFBQVEsQ0FBQ0QsS0FBSztVQUNyQkUsS0FBSyxFQUFFO1lBQ05oQyxHQUFHLEVBQUUsRUFBRTtZQUNQOEIsS0FBSyxFQUFFO1VBQ1IsQ0FBQztVQUNERyxHQUFHLEVBQUU7WUFDSmpDLEdBQUcsRUFBRSxFQUFFO1lBQ1A4QixLQUFLLEVBQUU7VUFDUixDQUFDO1VBQ0RJLElBQUksRUFBRTtZQUNMbEMsR0FBRyxFQUFFLEVBQUU7WUFDUDhCLEtBQUssRUFBRSxFQUFFO1lBQ1RLLFFBQVEsRUFBRSxFQUFFO1lBQ1pDLElBQUksRUFBRSxFQUFFO1lBQ1JDLFFBQVEsRUFBRTtVQUNYO1FBQ0QsQ0FBQztNQUNGakQsbUJBQW1CLEdBQUc0QixFQUFFO01BRXhCLE1BQU1zQixpQkFBaUIsR0FBRyxVQUFVQyxnQkFBcUIsRUFBRUMsVUFBZSxFQUFFO1FBQzNFLE1BQU1DLGVBQWUsR0FBR0YsZ0JBQWdCLENBQUM5QixRQUFRLENBQUMsV0FBVyxDQUFDO1FBQzlELE1BQU1pQyxZQUFZLEdBQUdDLE1BQU0sQ0FBQ0YsZUFBZSxDQUFDRyxPQUFPLEVBQUUsRUFBRUosVUFBVSxDQUFDO1FBQ2xFQyxlQUFlLENBQUNJLE9BQU8sQ0FBQ0gsWUFBWSxDQUFDO01BQ3RDLENBQUM7TUFFRCxJQUFJO1FBQ0gsTUFBTUYsVUFBZSxHQUFHLE1BQU1NLE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQ2pDLGtCQUFrQixDQUFDQyxjQUFjLENBQUMsQ0FBQztRQUN0RixNQUFNaUMsa0JBQXVCLEdBQUc7VUFDL0JDLGlCQUFpQixFQUFFLFlBQVk7WUFDOUIsTUFBTUMsVUFBVSxHQUFHakMsaUJBQWlCLENBQUNSLFFBQVEsQ0FBQyxXQUFXLENBQWM7WUFDdkUsTUFBTTBDLFNBQVMsR0FBR0QsVUFBVSxDQUFDTixPQUFPLEVBQUU7WUFDdEMsTUFBTVEsU0FBUyxHQUFHQyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQztZQUM5RCxNQUFNQyxhQUFhLEdBQUdKLFNBQVMsQ0FBQ25CLEtBQUssQ0FBQ0YsS0FBSyxHQUN4Q3FCLFNBQVMsQ0FBQ25CLEtBQUssQ0FBQ0YsS0FBSyxHQUNyQnNCLFNBQVMsQ0FBQ0ksT0FBTyxDQUFDLHlDQUF5QyxFQUFFLENBQUNMLFNBQVMsQ0FBQ3JCLEtBQUssQ0FBQyxDQUFDO1lBQ2xGMkIsT0FBTyxDQUFDQyxTQUFTLENBQUNDLFlBQVksQ0FBQ0MsU0FBUyxFQUFFTCxhQUFhLEVBQUVKLFNBQVMsQ0FBQ25CLEtBQUssQ0FBQ2hDLEdBQUcsR0FBR21ELFNBQVMsQ0FBQ25CLEtBQUssQ0FBQ2hDLEdBQUcsR0FBR21ELFNBQVMsQ0FBQ25ELEdBQUcsQ0FBQztVQUNwSCxDQUFDO1VBQ0Q2RCxtQkFBbUIsRUFBRSxZQUFZO1lBQ2hDLE1BQU1DLFlBQVksR0FBRzdDLGlCQUFpQixDQUFDUixRQUFRLENBQUMsV0FBVyxDQUFjO1lBQ3pFLE1BQU1zRCxXQUFXLEdBQUdELFlBQVksQ0FBQ2xCLE9BQU8sRUFBRTtZQUMxQyxNQUFNb0IsT0FBTyxHQUFHRCxXQUFXLENBQUMvQixLQUFLLENBQUNGLEtBQUssR0FBR2lDLFdBQVcsQ0FBQy9CLEtBQUssQ0FBQ0YsS0FBSyxHQUFHaUMsV0FBVyxDQUFDakMsS0FBSztZQUNyRixNQUFNOUIsR0FBRyxHQUFHK0QsV0FBVyxDQUFDL0IsS0FBSyxDQUFDaEMsR0FBRyxHQUFHK0QsV0FBVyxDQUFDL0IsS0FBSyxDQUFDaEMsR0FBRyxHQUFHK0QsV0FBVyxDQUFDL0QsR0FBRztZQUMzRSxNQUFNaUUsYUFBYSxHQUFHekMsTUFBTSxDQUFDMEMsSUFBSSxDQUFDLEVBQUUsRUFBRSxzQkFBc0IsRUFBRSxzQkFBc0IsQ0FBQztZQUNyRkQsYUFBYSxDQUFFRSxNQUFNLEdBQUcsSUFBSTtZQUM1QkYsYUFBYSxDQUFFeEMsUUFBUSxHQUFJLDZDQUE0QzJDLGtCQUFrQixDQUN4RkosT0FBTyxDQUNOLFNBQVFJLGtCQUFrQixDQUFDcEUsR0FBRyxDQUFFLEVBQUM7VUFDcEMsQ0FBQztVQUNEcUUsZUFBZSxFQUFFLFlBQVk7WUFDNUI7WUFDQUMsVUFBVSxDQUFDLFlBQVk7Y0FBQTtjQUN0QixjQUFDakIsSUFBSSxDQUFDa0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLCtDQUE1QixXQUF5Q0MsZ0JBQWdCLENBQUMsWUFBWTtnQkFDckVwRixtQkFBbUIsQ0FBQ3FGLEtBQUssRUFBRTtjQUM1QixDQUFDLENBQUM7WUFDSCxDQUFDLEVBQUUsQ0FBQyxDQUFDO1VBQ04sQ0FBQztVQUNEQyxlQUFlLEVBQUUsTUFBTTtZQUN0QixJQUFJLENBQUNDLHFCQUFxQixDQUN6Qm5DLFVBQVUsQ0FBQ1AsR0FBRyxDQUFDSCxLQUFLLEdBQUdVLFVBQVUsQ0FBQ1AsR0FBRyxDQUFDSCxLQUFLLEdBQUdVLFVBQVUsQ0FBQ1YsS0FBSyxFQUM5RFUsVUFBVSxDQUFDUCxHQUFHLENBQUNqQyxHQUFHLEdBQUd3QyxVQUFVLENBQUNQLEdBQUcsQ0FBQ2pDLEdBQUcsR0FBR3dDLFVBQVUsQ0FBQ3hDLEdBQUcsQ0FDeEQ7VUFDRjtRQUNELENBQUM7UUFFRGdELGtCQUFrQixDQUFDNEIsZUFBZSxHQUFHLFlBQVk7VUFDaEQzRCxpQkFBaUIsQ0FBQzRELEtBQUssRUFBRTtRQUMxQixDQUFDO1FBRUQ3QixrQkFBa0IsQ0FBQzhCLGFBQWEsR0FBRyxVQUFVQyxXQUFnQixFQUFFO1VBQzlEL0QsRUFBRSxDQUFDZ0UsVUFBVSxHQUFHRCxXQUFXO1FBQzVCLENBQUM7UUFFRCxNQUFNRSxLQUFLLEdBQUcsSUFBSWxGLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvQixNQUFNbUYscUJBQXFCLEdBQUc7VUFDN0JDLGVBQWUsRUFBRTtZQUNoQkMsSUFBSSxFQUFFSCxLQUFLLENBQUNJLG9CQUFvQixDQUFDLEdBQUc7VUFDckMsQ0FBQztVQUNEQyxNQUFNLEVBQUU7WUFDUEYsSUFBSSxFQUFFSDtVQUNQO1FBQ0QsQ0FBQztRQUNELE1BQU1NLFNBQVMsR0FBRztVQUNqQnpELEtBQUssRUFBRVUsVUFBVSxDQUFDTixJQUFJLENBQUNKLEtBQUssR0FBR1UsVUFBVSxDQUFDTixJQUFJLENBQUNKLEtBQUssR0FBR1UsVUFBVSxDQUFDVixLQUFLO1VBQ3ZFSyxRQUFRLEVBQUVLLFVBQVUsQ0FBQ04sSUFBSSxDQUFDQyxRQUFRO1VBQ2xDQyxJQUFJLEVBQUVJLFVBQVUsQ0FBQ04sSUFBSSxDQUFDRSxJQUFJO1VBQzFCcEMsR0FBRyxFQUFFd0MsVUFBVSxDQUFDTixJQUFJLENBQUNsQyxHQUFHLEdBQUd3QyxVQUFVLENBQUNOLElBQUksQ0FBQ2xDLEdBQUcsR0FBR3dDLFVBQVUsQ0FBQ3hDLEdBQUcsQ0FBQ3dGLFNBQVMsQ0FBQ2hELFVBQVUsQ0FBQ3hDLEdBQUcsQ0FBQ3lGLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztVQUN0R3BELFFBQVEsRUFBRUcsVUFBVSxDQUFDTixJQUFJLENBQUNHO1FBQzNCLENBQUM7UUFDRCxJQUFJckIsRUFBRSxDQUFDZ0UsVUFBVSxFQUFFO1VBQ2xCL0QsaUJBQWlCLEdBQUdELEVBQUUsQ0FBQ2dFLFVBQVU7VUFFakMsTUFBTVUsV0FBVyxHQUFHekUsaUJBQWlCLENBQUNSLFFBQVEsQ0FBQyxPQUFPLENBQWM7VUFDcEUsSUFBSSxDQUFDa0YsbUJBQW1CLENBQUNELFdBQVcsQ0FBQztVQUNyQyxNQUFNRSxRQUFRLEdBQUdqRCxNQUFNLENBQUMrQyxXQUFXLENBQUM5QyxPQUFPLEVBQUUsRUFBRTJDLFNBQVMsQ0FBQztVQUN6REcsV0FBVyxDQUFDN0MsT0FBTyxDQUFDK0MsUUFBUSxDQUFDO1VBQzdCdEQsaUJBQWlCLENBQUNyQixpQkFBaUIsRUFBRXVCLFVBQVUsQ0FBQztVQUNoRHZCLGlCQUFpQixDQUFDNEUsTUFBTSxDQUFDN0UsRUFBRSxDQUFDO1FBQzdCLENBQUMsTUFBTTtVQUNOLE1BQU04RSxhQUFhLEdBQUcsZ0NBQWdDO1VBQ3RELE1BQU1DLGdCQUFnQixHQUFHQyxvQkFBb0IsQ0FBQ0MsWUFBWSxDQUFDSCxhQUFhLEVBQUUsVUFBVSxDQUFDO1VBRXJGLElBQUk7WUFDSCxNQUFNSSxTQUFTLEdBQUcsTUFBTXBELE9BQU8sQ0FBQ0MsT0FBTyxDQUN0Q29ELGVBQWUsQ0FBQ0MsT0FBTyxDQUFDTCxnQkFBZ0IsRUFBRTtjQUFFTSxJQUFJLEVBQUVQO1lBQWMsQ0FBQyxFQUFFWixxQkFBcUIsQ0FBQyxDQUN6RjtZQUNEakUsaUJBQWlCLEdBQUksTUFBTXFGLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDO2NBQ3hDQyxVQUFVLEVBQUVOLFNBQVM7Y0FDckJPLFVBQVUsRUFBRXpEO1lBQ2IsQ0FBQyxDQUFTO1lBRVYvQixpQkFBaUIsQ0FBQ1YsUUFBUSxDQUFDLElBQUlSLFNBQVMsQ0FBQ3dGLFNBQVMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQztZQUNuRSxNQUFNRyxXQUFXLEdBQUd6RSxpQkFBaUIsQ0FBQ1IsUUFBUSxDQUFDLE9BQU8sQ0FBYztZQUNwRSxJQUFJLENBQUNrRixtQkFBbUIsQ0FBQ0QsV0FBVyxDQUFDO1lBQ3JDLE1BQU1FLFFBQVEsR0FBR2pELE1BQU0sQ0FBQytDLFdBQVcsQ0FBQzlDLE9BQU8sRUFBRSxFQUFFMkMsU0FBUyxDQUFDO1lBQ3pERyxXQUFXLENBQUM3QyxPQUFPLENBQUMrQyxRQUFRLENBQUM7WUFFN0IzRSxpQkFBaUIsQ0FBQ1YsUUFBUSxDQUFDLElBQUlSLFNBQVMsQ0FBQ3lDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQztZQUN4RUYsaUJBQWlCLENBQUNyQixpQkFBaUIsRUFBRXVCLFVBQVUsQ0FBQztZQUVoRHhCLEVBQUUsQ0FBQzBGLFlBQVksQ0FBQ3pGLGlCQUFpQixDQUFDO1lBQ2xDQSxpQkFBaUIsQ0FBQzRFLE1BQU0sQ0FBQzdFLEVBQUUsQ0FBQztZQUM1QmdDLGtCQUFrQixDQUFDOEIsYUFBYSxDQUFDN0QsaUJBQWlCLENBQUM7VUFDcEQsQ0FBQyxDQUFDLE9BQU8wRixNQUFXLEVBQUU7WUFDckJDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLHdDQUF3QyxFQUFFRixNQUFNLENBQUM7VUFDNUQ7UUFDRDtNQUNELENBQUMsQ0FBQyxPQUFPQSxNQUFXLEVBQUU7UUFDckJDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLDJDQUEyQyxFQUFFRixNQUFNLENBQUM7TUFDL0Q7SUFDRCxDQUFDO0lBQUEsT0FFRGhCLG1CQUFtQixHQUFuQiw2QkFBb0JtQixVQUFlLEVBQUU7TUFDcEMsTUFBTTFELFNBQVMsR0FBR0MsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUM7TUFDOUR3RCxVQUFVLENBQUNDLFdBQVcsQ0FBQyxnQkFBZ0IsRUFBRTNELFNBQVMsQ0FBQ0ksT0FBTyxDQUFDLDBCQUEwQixDQUFDLENBQUM7TUFDdkZzRCxVQUFVLENBQUNDLFdBQVcsQ0FBQyxrQkFBa0IsRUFBRTNELFNBQVMsQ0FBQ0ksT0FBTyxDQUFDLCtCQUErQixDQUFDLENBQUM7TUFDOUZzRCxVQUFVLENBQUNDLFdBQVcsQ0FBQyx5QkFBeUIsRUFBRTNELFNBQVMsQ0FBQ0ksT0FBTyxDQUFDLDhCQUE4QixDQUFDLENBQUM7TUFDcEc7TUFDQTtNQUNBLElBQUl3RCxVQUFVLENBQUNDLEdBQUcsQ0FBQywyRUFBMkUsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUN6R0gsVUFBVSxDQUFDQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDO01BQ2hELENBQUMsTUFBTTtRQUNORCxVQUFVLENBQUNDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxLQUFLLENBQUM7TUFDakQ7TUFDQSxNQUFNRyxTQUFTLEdBQUdGLFVBQVUsQ0FBQ0MsR0FBRyxDQUFDLDhCQUE4QixDQUFDO01BQ2hFSCxVQUFVLENBQUNDLFdBQVcsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDRyxTQUFTLElBQUlBLFNBQVMsRUFBRSxDQUFDQyxXQUFXLEVBQUUsQ0FBQztNQUMvRUwsVUFBVSxDQUFDQyxXQUFXLENBQUMsb0JBQW9CLEVBQUUsQ0FBQyxFQUFFSyxHQUFHLElBQUlBLEdBQUcsQ0FBQ0MsTUFBTSxJQUFJRCxHQUFHLENBQUNDLE1BQU0sQ0FBQ0MsU0FBUyxDQUFDLENBQUM7SUFDNUY7O0lBRUE7SUFBQTtJQUFBLE9BQ0EzQyxxQkFBcUIsR0FBckIsK0JBQXNCNEMsSUFBUyxFQUFFQyxJQUFVLEVBQUU7TUFDNUMsTUFBTUMsWUFBWSxHQUFHcEUsSUFBSSxDQUFDcUUsZUFBZSxDQUFDO1FBQ3pDckIsSUFBSSxFQUFFLG1EQUFtRDtRQUN6RHNCLFFBQVEsRUFBRTtVQUNUQyxNQUFNLEVBQUU7WUFDUEMsRUFBRSxFQUFFTCxJQUFJO1lBQ1JNLEtBQUssRUFBRVA7VUFDUjtRQUNEO01BQ0QsQ0FBQyxDQUFDO01BQ0RFLFlBQVksQ0FBU3ZELElBQUksRUFBRTtJQUM3Qjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BUU02RCxhQUFhLEdBRm5CLCtCQUVzQjtNQUNyQixNQUFNQyxhQUFrQixHQUFHLE1BQU0sSUFBSSxDQUFDQyxtQkFBbUIsRUFBRTtNQUMzRCxNQUFNN0UsU0FBUyxHQUFHQyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQztNQUM5RCxNQUFNQyxhQUFhLEdBQUd5RSxhQUFhLENBQUNoRyxLQUFLLENBQUNGLEtBQUssR0FDNUNrRyxhQUFhLENBQUNoRyxLQUFLLENBQUNGLEtBQUssR0FDekJzQixTQUFTLENBQUNJLE9BQU8sQ0FBQyx5Q0FBeUMsRUFBRSxDQUFDd0UsYUFBYSxDQUFDbEcsS0FBSyxDQUFDLENBQUM7TUFDdEYyQixPQUFPLENBQUNDLFNBQVMsQ0FBQ0MsWUFBWSxDQUFDQyxTQUFTLEVBQUVMLGFBQWEsRUFBRXlFLGFBQWEsQ0FBQ2hHLEtBQUssQ0FBQ2hDLEdBQUcsR0FBR2dJLGFBQWEsQ0FBQ2hHLEtBQUssQ0FBQ2hDLEdBQUcsR0FBR2dJLGFBQWEsQ0FBQ2hJLEdBQUcsQ0FBQztJQUNoSTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BUU1rSSxrQkFBa0IsR0FGeEIsb0NBRTJCO01BQzFCLE1BQU1GLGFBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUNDLG1CQUFtQixFQUFFO01BQzNELElBQUksQ0FBQ3RELHFCQUFxQixDQUN6QnFELGFBQWEsQ0FBQy9GLEdBQUcsQ0FBQ0gsS0FBSyxHQUFHa0csYUFBYSxDQUFDL0YsR0FBRyxDQUFDSCxLQUFLLEdBQUdrRyxhQUFhLENBQUNsRyxLQUFLLEVBQ3ZFa0csYUFBYSxDQUFDL0YsR0FBRyxDQUFDakMsR0FBRyxHQUFHZ0ksYUFBYSxDQUFDL0YsR0FBRyxDQUFDakMsR0FBRyxHQUFHd0IsTUFBTSxDQUFDQyxRQUFRLENBQUNDLE1BQU0sR0FBR0YsTUFBTSxDQUFDQyxRQUFRLENBQUNFLFFBQVEsR0FBR3FHLGFBQWEsQ0FBQ2hJLEdBQUcsQ0FDckg7SUFDRjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FTTW1JLFdBQVcsR0FGakIsMkJBRWtCQyxNQUFXLEVBQUU7TUFDOUIsTUFBTUosYUFBa0IsR0FBRyxNQUFNLElBQUksQ0FBQ0MsbUJBQW1CLEVBQUU7UUFDMURJLHlCQUF5QixHQUFHRCxNQUFNLENBQUNFLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNyRHBILEtBQUssR0FBR0MsV0FBVyxDQUFDQyxXQUFXLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFO1FBQzNDQyxTQUFTLEdBQUlILFdBQVcsQ0FBQ0MsV0FBVyxFQUFFLENBQVNHLHNCQUFzQixHQUNqRUosV0FBVyxDQUFDQyxXQUFXLEVBQUUsQ0FBU0csc0JBQXNCLENBQUMsRUFBRSxDQUFDLEdBQzdELEVBQUU7TUFDTnlHLGFBQWEsQ0FBQ2hJLEdBQUcsR0FBR2tCLEtBQUssR0FBR0ksU0FBUyxHQUFHSixLQUFLLEdBQUdNLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDSSxJQUFJOztNQUVwRTtNQUNBd0cseUJBQXlCLENBQUNFLFFBQVEsQ0FBQ1AsYUFBYSxDQUFDOUYsSUFBSSxDQUFDSixLQUFLLEdBQUdrRyxhQUFhLENBQUM5RixJQUFJLENBQUNKLEtBQUssR0FBR2tHLGFBQWEsQ0FBQ2xHLEtBQUssQ0FBQztNQUM3R3VHLHlCQUF5QixDQUFDRyxXQUFXLENBQUNSLGFBQWEsQ0FBQzlGLElBQUksQ0FBQ0MsUUFBUSxDQUFDO01BQ2xFa0cseUJBQXlCLENBQUNJLFdBQVcsQ0FBQ1QsYUFBYSxDQUFDOUYsSUFBSSxDQUFDRSxJQUFJLENBQUM7TUFDOURpRyx5QkFBeUIsQ0FBQ0ssWUFBWSxDQUFDVixhQUFhLENBQUM5RixJQUFJLENBQUNsQyxHQUFHLEdBQUdnSSxhQUFhLENBQUM5RixJQUFJLENBQUNsQyxHQUFHLEdBQUdnSSxhQUFhLENBQUNoSSxHQUFHLENBQUM7TUFDM0dxSSx5QkFBeUIsQ0FBQ00sYUFBYSxDQUFDWCxhQUFhLENBQUM5RixJQUFJLENBQUNHLFFBQVEsQ0FBQzs7TUFFcEU7TUFDQWdHLHlCQUF5QixDQUFDTyxTQUFTLEVBQUU7SUFDdEM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQVFBWCxtQkFBbUIsR0FGbkIsK0JBRXNCO01BQ3JCLE1BQU0vRyxLQUFLLEdBQUdDLFdBQVcsQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLE9BQU8sRUFBRTtRQUNoREMsU0FBUyxHQUFJSCxXQUFXLENBQUNDLFdBQVcsRUFBRSxDQUFTRyxzQkFBc0IsR0FDakVKLFdBQVcsQ0FBQ0MsV0FBVyxFQUFFLENBQVNHLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxHQUM3RCxFQUFFO1FBQ0xSLGNBQWMsR0FBRztVQUNoQmYsR0FBRyxFQUNGd0IsTUFBTSxDQUFDQyxRQUFRLENBQUNDLE1BQU0sR0FDdEJGLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDRSxRQUFRLEdBQ3hCSCxNQUFNLENBQUNDLFFBQVEsQ0FBQ0csTUFBTSxJQUNyQlYsS0FBSyxHQUFHSSxTQUFTLEdBQUdKLEtBQUssR0FBR00sTUFBTSxDQUFDQyxRQUFRLENBQUNJLElBQUksQ0FBQztVQUNuREMsS0FBSyxFQUFFQyxRQUFRLENBQUNELEtBQUs7VUFDckJFLEtBQUssRUFBRTtZQUNOaEMsR0FBRyxFQUFFLEVBQUU7WUFDUDhCLEtBQUssRUFBRTtVQUNSLENBQUM7VUFDREcsR0FBRyxFQUFFO1lBQ0pqQyxHQUFHLEVBQUUsRUFBRTtZQUNQOEIsS0FBSyxFQUFFO1VBQ1IsQ0FBQztVQUNESSxJQUFJLEVBQUU7WUFDTGxDLEdBQUcsRUFBRSxFQUFFO1lBQ1A4QixLQUFLLEVBQUUsRUFBRTtZQUNUSyxRQUFRLEVBQUUsRUFBRTtZQUNaQyxJQUFJLEVBQUUsRUFBRTtZQUNSQyxRQUFRLEVBQUU7VUFDWDtRQUNELENBQUM7TUFDRixPQUFPLElBQUksQ0FBQ3ZCLGtCQUFrQixDQUFDQyxjQUFjLENBQUM7SUFDL0MsQ0FBQztJQUFBO0VBQUEsRUEzVnVCOEgsbUJBQW1CO0VBQUEsT0E4VjdCeEosVUFBVTtBQUFBIn0=
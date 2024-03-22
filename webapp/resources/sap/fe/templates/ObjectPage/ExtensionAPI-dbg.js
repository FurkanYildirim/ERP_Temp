/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/ID", "sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/RecommendationHelper", "sap/fe/core/helpers/ResourceModelHelper", "sap/ui/core/InvisibleMessage", "sap/ui/core/library", "sap/ui/core/message/Message"], function (Log, CommonUtils, ID, ExtensionAPI, ClassSupport, RecommendationHelper, ResourceModelHelper, InvisibleMessage, library, Message) {
  "use strict";

  var _dec, _class;
  var MessageType = library.MessageType;
  var InvisibleMessageMode = library.InvisibleMessageMode;
  var recommendationHelper = RecommendationHelper.recommendationHelper;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var getSideContentLayoutID = ID.getSideContentLayoutID;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Extension API for object pages on SAP Fiori elements for OData V4.
   *
   * To correctly integrate your app extension coding with SAP Fiori elements, use only the extensionAPI of SAP Fiori elements. Don't access or manipulate controls, properties, models, or other internal objects created by the SAP Fiori elements framework.
   *
   * @alias sap.fe.templates.ObjectPage.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  let ObjectPageExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ObjectPageExtensionAPI, _ExtensionAPI);
    function ObjectPageExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ObjectPageExtensionAPI.prototype;
    /**
     * Refreshes either the whole object page or only parts of it.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#refresh
     * @param [vPath] Path or array of paths referring to entities or properties to be refreshed.
     * If omitted, the whole object page is refreshed. The path "" refreshes the entity assigned to the object page
     * without navigations
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh(vPath) {
      const oBindingContext = this._view.getBindingContext();
      if (!oBindingContext) {
        // nothing to be refreshed - do not block the app!
        return Promise.resolve();
      }
      const oAppComponent = CommonUtils.getAppComponent(this._view),
        oSideEffectsService = oAppComponent.getSideEffectsService(),
        oMetaModel = oBindingContext.getModel().getMetaModel(),
        oSideEffects = {
          targetProperties: [],
          targetEntities: []
        };
      let aPaths, sPath, sBaseEntitySet, sKind;
      if (vPath === undefined || vPath === null) {
        // we just add an empty path which should refresh the page with all dependent bindings
        oSideEffects.targetEntities.push({
          $NavigationPropertyPath: ""
        });
      } else {
        aPaths = Array.isArray(vPath) ? vPath : [vPath];
        sBaseEntitySet = this._controller.getOwnerComponent().getEntitySet();
        for (let i = 0; i < aPaths.length; i++) {
          sPath = aPaths[i];
          if (sPath === "") {
            // an empty path shall refresh the entity without dependencies which means * for the model
            oSideEffects.targetProperties.push("*");
          } else {
            sKind = oMetaModel.getObject(`/${sBaseEntitySet}/${sPath}/$kind`);
            if (sKind === "NavigationProperty") {
              oSideEffects.targetEntities.push({
                $NavigationPropertyPath: sPath
              });
            } else if (sKind) {
              oSideEffects.targetProperties.push(sPath);
            } else {
              return Promise.reject(`${sPath} is not a valid path to be refreshed`);
            }
          }
        }
      }
      return oSideEffectsService.requestSideEffects([...oSideEffects.targetEntities, ...oSideEffects.targetProperties], oBindingContext);
    }

    /**
     * Gets the list entries currently selected for the table.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getSelectedContexts
     * @param sTableId The ID identifying the table the selected context is requested for
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts(sTableId) {
      let oTable = this._view.byId(sTableId);
      if (oTable && oTable.isA("sap.fe.macros.table.TableAPI")) {
        oTable = oTable.getContent();
      }
      return oTable && oTable.isA("sap.ui.mdc.Table") && oTable.getSelectedContexts() || [];
    }

    /**
     * Displays or hides the side content of an object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showSideContent
     * @param sSubSectionKey Key of the side content fragment as defined in the manifest.json
     * @param [bShow] Optional Boolean flag to show or hide the side content
     * @public
     */;
    _proto.showSideContent = function showSideContent(sSubSectionKey, bShow) {
      const sBlockID = getSideContentLayoutID(sSubSectionKey),
        oBlock = this._view.byId(sBlockID),
        bBlockState = bShow === undefined ? !oBlock.getShowSideContent() : bShow;
      oBlock.setShowSideContent(bBlockState, false);
    }

    /**
     * Gets the bound context of the current object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getBindingContext
     * @returns Context bound to the object page
     * @public
     */;
    _proto.getBindingContext = function getBindingContext() {
      return this._view.getBindingContext();
    }

    /**
     * Build a message to be displayed below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#_buildOPMessage
     * @param {sap.ui.core.message.Message[]} messages Array of messages used to generated the message
     * @returns {Promise<Message>} Promise containing the generated message
     * @private
     */;
    _proto._buildOPMessage = async function _buildOPMessage(messages) {
      const view = this._view;
      const resourceModel = ResourceModelHelper.getResourceModel(view);
      let message = null;
      switch (messages.length) {
        case 0:
          break;
        case 1:
          message = messages[0];
          break;
        default:
          const messageStats = {
            Error: {
              id: 2,
              count: 0
            },
            Warning: {
              id: 1,
              count: 0
            },
            Information: {
              id: 0,
              count: 0
            }
          };
          message = messages.reduce((acc, currentValue) => {
            const currentType = currentValue.getType();
            acc.setType(messageStats[currentType].id > messageStats[acc.getType()].id ? currentType : acc.getType());
            messageStats[currentType].count++;
            return acc;
          }, new Message({
            type: MessageType.Information
          }));
          if (messageStats.Error.count === 0 && messageStats.Warning.count === 0 && messageStats.Information.count > 0) {
            message.setMessage(resourceModel.getText("OBJECTPAGESTATE_INFORMATION"));
          } else if (messageStats.Error.count > 0 && messageStats.Warning.count > 0 || messageStats.Information.count > 0) {
            message.setMessage(resourceModel.getText("OBJECTPAGESTATE_ISSUE"));
          } else {
            const messageResource = message.getType() === MessageType.Error ? "OBJECTPAGESTATE_ERROR" : "OBJECTPAGESTATE_WARNING";
            message.setMessage(resourceModel.getText(messageResource));
          }
      }
      return message;
    }

    /**
     * Displays the message strip between the title and the header of the ObjectPage.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showMessages
     * @param {sap.ui.core.message.Message} messages The message to be displayed
     * @public
     */;
    _proto.showMessages = async function showMessages(messages) {
      const view = this._view;
      const internalModelContext = view.getBindingContext("internal");
      try {
        const message = await this._buildOPMessage(messages);
        if (message) {
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", true);
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripText", message.getMessage());
          internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripType", message.getType());
          InvisibleMessage.getInstance().announce(message.getMessage(), InvisibleMessageMode.Assertive);
        } else {
          this.hideMessage();
        }
      } catch (err) {
        Log.error("Cannot display ObjectPage message");
      }
    }

    /**
     * Hides the message strip below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#hideMessage
     * @public
     */;
    _proto.hideMessage = function hideMessage() {
      const view = this._view;
      const internalModelContext = view.getBindingContext("internal");
      internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", false);
    }

    /**
     * This function will take the recommendation data details, transform it and update internal model with that.
     *
     * @param data Recommendation data for the app
     * @private
     */;
    _proto.setRecommendations = function setRecommendations(data) {
      recommendationHelper.transformRecommendationsForInternalStorage(data);
      this._view.getModel("internal").setProperty("/recommendationsData", data);
    };
    return ObjectPageExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ObjectPageExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3RQYWdlRXh0ZW5zaW9uQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJyZWZyZXNoIiwidlBhdGgiLCJvQmluZGluZ0NvbnRleHQiLCJfdmlldyIsImdldEJpbmRpbmdDb250ZXh0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJvQXBwQ29tcG9uZW50IiwiQ29tbW9uVXRpbHMiLCJnZXRBcHBDb21wb25lbnQiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib1NpZGVFZmZlY3RzIiwidGFyZ2V0UHJvcGVydGllcyIsInRhcmdldEVudGl0aWVzIiwiYVBhdGhzIiwic1BhdGgiLCJzQmFzZUVudGl0eVNldCIsInNLaW5kIiwidW5kZWZpbmVkIiwicHVzaCIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiQXJyYXkiLCJpc0FycmF5IiwiX2NvbnRyb2xsZXIiLCJnZXRPd25lckNvbXBvbmVudCIsImdldEVudGl0eVNldCIsImkiLCJsZW5ndGgiLCJnZXRPYmplY3QiLCJyZWplY3QiLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwic1RhYmxlSWQiLCJvVGFibGUiLCJieUlkIiwiaXNBIiwiZ2V0Q29udGVudCIsInNob3dTaWRlQ29udGVudCIsInNTdWJTZWN0aW9uS2V5IiwiYlNob3ciLCJzQmxvY2tJRCIsImdldFNpZGVDb250ZW50TGF5b3V0SUQiLCJvQmxvY2siLCJiQmxvY2tTdGF0ZSIsImdldFNob3dTaWRlQ29udGVudCIsInNldFNob3dTaWRlQ29udGVudCIsIl9idWlsZE9QTWVzc2FnZSIsIm1lc3NhZ2VzIiwidmlldyIsInJlc291cmNlTW9kZWwiLCJSZXNvdXJjZU1vZGVsSGVscGVyIiwiZ2V0UmVzb3VyY2VNb2RlbCIsIm1lc3NhZ2UiLCJtZXNzYWdlU3RhdHMiLCJFcnJvciIsImlkIiwiY291bnQiLCJXYXJuaW5nIiwiSW5mb3JtYXRpb24iLCJyZWR1Y2UiLCJhY2MiLCJjdXJyZW50VmFsdWUiLCJjdXJyZW50VHlwZSIsImdldFR5cGUiLCJzZXRUeXBlIiwiTWVzc2FnZSIsInR5cGUiLCJNZXNzYWdlVHlwZSIsInNldE1lc3NhZ2UiLCJnZXRUZXh0IiwibWVzc2FnZVJlc291cmNlIiwic2hvd01lc3NhZ2VzIiwiaW50ZXJuYWxNb2RlbENvbnRleHQiLCJzZXRQcm9wZXJ0eSIsImdldE1lc3NhZ2UiLCJJbnZpc2libGVNZXNzYWdlIiwiZ2V0SW5zdGFuY2UiLCJhbm5vdW5jZSIsIkludmlzaWJsZU1lc3NhZ2VNb2RlIiwiQXNzZXJ0aXZlIiwiaGlkZU1lc3NhZ2UiLCJlcnIiLCJMb2ciLCJlcnJvciIsInNldFJlY29tbWVuZGF0aW9ucyIsImRhdGEiLCJyZWNvbW1lbmRhdGlvbkhlbHBlciIsInRyYW5zZm9ybVJlY29tbWVuZGF0aW9uc0ZvckludGVybmFsU3RvcmFnZSIsIkV4dGVuc2lvbkFQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRXh0ZW5zaW9uQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgZ2V0U2lkZUNvbnRlbnRMYXlvdXRJRCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSURcIjtcbmltcG9ydCBFeHRlbnNpb25BUEkgZnJvbSBcInNhcC9mZS9jb3JlL0V4dGVuc2lvbkFQSVwiO1xuaW1wb3J0IHR5cGUgeyBFbmhhbmNlV2l0aFVJNSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IEluQ29tcGxldGVuZXNzSW5mb1R5cGUsIHJlY29tbWVuZGF0aW9uSGVscGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvUmVjb21tZW5kYXRpb25IZWxwZXJcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Jlc291cmNlTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSBUYWJsZUFQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUFQSVwiO1xuaW1wb3J0IEludmlzaWJsZU1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL0ludmlzaWJsZU1lc3NhZ2VcIjtcbmltcG9ydCB7IEludmlzaWJsZU1lc3NhZ2VNb2RlLCBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgdHlwZSBEeW5hbWljU2lkZUNvbnRlbnQgZnJvbSBcInNhcC91aS9sYXlvdXQvRHluYW1pY1NpZGVDb250ZW50XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbi8qKlxuICogRXh0ZW5zaW9uIEFQSSBmb3Igb2JqZWN0IHBhZ2VzIG9uIFNBUCBGaW9yaSBlbGVtZW50cyBmb3IgT0RhdGEgVjQuXG4gKlxuICogVG8gY29ycmVjdGx5IGludGVncmF0ZSB5b3VyIGFwcCBleHRlbnNpb24gY29kaW5nIHdpdGggU0FQIEZpb3JpIGVsZW1lbnRzLCB1c2Ugb25seSB0aGUgZXh0ZW5zaW9uQVBJIG9mIFNBUCBGaW9yaSBlbGVtZW50cy4gRG9uJ3QgYWNjZXNzIG9yIG1hbmlwdWxhdGUgY29udHJvbHMsIHByb3BlcnRpZXMsIG1vZGVscywgb3Igb3RoZXIgaW50ZXJuYWwgb2JqZWN0cyBjcmVhdGVkIGJ5IHRoZSBTQVAgRmlvcmkgZWxlbWVudHMgZnJhbWV3b3JrLlxuICpcbiAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuRXh0ZW5zaW9uQVBJXG4gKiBAcHVibGljXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAZmluYWxcbiAqIEBzaW5jZSAxLjc5LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSVwiKVxuY2xhc3MgT2JqZWN0UGFnZUV4dGVuc2lvbkFQSSBleHRlbmRzIEV4dGVuc2lvbkFQSSB7XG5cdC8qKlxuXHQgKiBSZWZyZXNoZXMgZWl0aGVyIHRoZSB3aG9sZSBvYmplY3QgcGFnZSBvciBvbmx5IHBhcnRzIG9mIGl0LlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNyZWZyZXNoXG5cdCAqIEBwYXJhbSBbdlBhdGhdIFBhdGggb3IgYXJyYXkgb2YgcGF0aHMgcmVmZXJyaW5nIHRvIGVudGl0aWVzIG9yIHByb3BlcnRpZXMgdG8gYmUgcmVmcmVzaGVkLlxuXHQgKiBJZiBvbWl0dGVkLCB0aGUgd2hvbGUgb2JqZWN0IHBhZ2UgaXMgcmVmcmVzaGVkLiBUaGUgcGF0aCBcIlwiIHJlZnJlc2hlcyB0aGUgZW50aXR5IGFzc2lnbmVkIHRvIHRoZSBvYmplY3QgcGFnZVxuXHQgKiB3aXRob3V0IG5hdmlnYXRpb25zXG5cdCAqIEByZXR1cm5zIFJlc29sdmVkIG9uY2UgdGhlIGRhdGEgaXMgcmVmcmVzaGVkIG9yIHJlamVjdGVkIGlmIHRoZSByZXF1ZXN0IGZhaWxlZFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRyZWZyZXNoKHZQYXRoOiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuX3ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRcdGlmICghb0JpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHQvLyBub3RoaW5nIHRvIGJlIHJlZnJlc2hlZCAtIGRvIG5vdCBibG9jayB0aGUgYXBwIVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuX3ZpZXcpLFxuXHRcdFx0b1NpZGVFZmZlY3RzU2VydmljZSA9IG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCksXG5cdFx0XHRvTWV0YU1vZGVsID0gb0JpbmRpbmdDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRvU2lkZUVmZmVjdHM6IFNpZGVFZmZlY3RzVGFyZ2V0VHlwZSA9IHtcblx0XHRcdFx0dGFyZ2V0UHJvcGVydGllczogW10sXG5cdFx0XHRcdHRhcmdldEVudGl0aWVzOiBbXVxuXHRcdFx0fTtcblx0XHRsZXQgYVBhdGhzLCBzUGF0aCwgc0Jhc2VFbnRpdHlTZXQsIHNLaW5kO1xuXG5cdFx0aWYgKHZQYXRoID09PSB1bmRlZmluZWQgfHwgdlBhdGggPT09IG51bGwpIHtcblx0XHRcdC8vIHdlIGp1c3QgYWRkIGFuIGVtcHR5IHBhdGggd2hpY2ggc2hvdWxkIHJlZnJlc2ggdGhlIHBhZ2Ugd2l0aCBhbGwgZGVwZW5kZW50IGJpbmRpbmdzXG5cdFx0XHRvU2lkZUVmZmVjdHMudGFyZ2V0RW50aXRpZXMucHVzaCh7XG5cdFx0XHRcdCROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBcIlwiXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YVBhdGhzID0gQXJyYXkuaXNBcnJheSh2UGF0aCkgPyB2UGF0aCA6IFt2UGF0aF07XG5cdFx0XHRzQmFzZUVudGl0eVNldCA9ICh0aGlzLl9jb250cm9sbGVyLmdldE93bmVyQ29tcG9uZW50KCkgYXMgYW55KS5nZXRFbnRpdHlTZXQoKTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhUGF0aHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0c1BhdGggPSBhUGF0aHNbaV07XG5cdFx0XHRcdGlmIChzUGF0aCA9PT0gXCJcIikge1xuXHRcdFx0XHRcdC8vIGFuIGVtcHR5IHBhdGggc2hhbGwgcmVmcmVzaCB0aGUgZW50aXR5IHdpdGhvdXQgZGVwZW5kZW5jaWVzIHdoaWNoIG1lYW5zICogZm9yIHRoZSBtb2RlbFxuXHRcdFx0XHRcdG9TaWRlRWZmZWN0cy50YXJnZXRQcm9wZXJ0aWVzLnB1c2goXCIqXCIpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNLaW5kID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke3NCYXNlRW50aXR5U2V0fS8ke3NQYXRofS8ka2luZGApO1xuXG5cdFx0XHRcdFx0aWYgKHNLaW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiKSB7XG5cdFx0XHRcdFx0XHRvU2lkZUVmZmVjdHMudGFyZ2V0RW50aXRpZXMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdCROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBzUGF0aFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChzS2luZCkge1xuXHRcdFx0XHRcdFx0b1NpZGVFZmZlY3RzLnRhcmdldFByb3BlcnRpZXMucHVzaChzUGF0aCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChgJHtzUGF0aH0gaXMgbm90IGEgdmFsaWQgcGF0aCB0byBiZSByZWZyZXNoZWRgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9TaWRlRWZmZWN0c1NlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKFsuLi5vU2lkZUVmZmVjdHMudGFyZ2V0RW50aXRpZXMsIC4uLm9TaWRlRWZmZWN0cy50YXJnZXRQcm9wZXJ0aWVzXSwgb0JpbmRpbmdDb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBsaXN0IGVudHJpZXMgY3VycmVudGx5IHNlbGVjdGVkIGZvciB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuRXh0ZW5zaW9uQVBJI2dldFNlbGVjdGVkQ29udGV4dHNcblx0ICogQHBhcmFtIHNUYWJsZUlkIFRoZSBJRCBpZGVudGlmeWluZyB0aGUgdGFibGUgdGhlIHNlbGVjdGVkIGNvbnRleHQgaXMgcmVxdWVzdGVkIGZvclxuXHQgKiBAcmV0dXJucyBBcnJheSBjb250YWluaW5nIHRoZSBzZWxlY3RlZCBjb250ZXh0c1xuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRTZWxlY3RlZENvbnRleHRzKHNUYWJsZUlkOiBzdHJpbmcpIHtcblx0XHRsZXQgb1RhYmxlID0gdGhpcy5fdmlldy5ieUlkKHNUYWJsZUlkKTtcblx0XHRpZiAob1RhYmxlICYmIG9UYWJsZS5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0XHRvVGFibGUgPSAob1RhYmxlIGFzIEVuaGFuY2VXaXRoVUk1PFRhYmxlQVBJPikuZ2V0Q29udGVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gKG9UYWJsZSAmJiBvVGFibGUuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSAmJiAob1RhYmxlIGFzIGFueSkuZ2V0U2VsZWN0ZWRDb250ZXh0cygpKSB8fCBbXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwbGF5cyBvciBoaWRlcyB0aGUgc2lkZSBjb250ZW50IG9mIGFuIG9iamVjdCBwYWdlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNzaG93U2lkZUNvbnRlbnRcblx0ICogQHBhcmFtIHNTdWJTZWN0aW9uS2V5IEtleSBvZiB0aGUgc2lkZSBjb250ZW50IGZyYWdtZW50IGFzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0Lmpzb25cblx0ICogQHBhcmFtIFtiU2hvd10gT3B0aW9uYWwgQm9vbGVhbiBmbGFnIHRvIHNob3cgb3IgaGlkZSB0aGUgc2lkZSBjb250ZW50XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNob3dTaWRlQ29udGVudChzU3ViU2VjdGlvbktleTogc3RyaW5nLCBiU2hvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IHNCbG9ja0lEID0gZ2V0U2lkZUNvbnRlbnRMYXlvdXRJRChzU3ViU2VjdGlvbktleSksXG5cdFx0XHRvQmxvY2sgPSB0aGlzLl92aWV3LmJ5SWQoc0Jsb2NrSUQpLFxuXHRcdFx0YkJsb2NrU3RhdGUgPSBiU2hvdyA9PT0gdW5kZWZpbmVkID8gIShvQmxvY2sgYXMgRHluYW1pY1NpZGVDb250ZW50KS5nZXRTaG93U2lkZUNvbnRlbnQoKSA6IGJTaG93O1xuXHRcdChvQmxvY2sgYXMgRHluYW1pY1NpZGVDb250ZW50KS5zZXRTaG93U2lkZUNvbnRlbnQoYkJsb2NrU3RhdGUsIGZhbHNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBib3VuZCBjb250ZXh0IG9mIHRoZSBjdXJyZW50IG9iamVjdCBwYWdlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNnZXRCaW5kaW5nQ29udGV4dFxuXHQgKiBAcmV0dXJucyBDb250ZXh0IGJvdW5kIHRvIHRoZSBvYmplY3QgcGFnZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRCaW5kaW5nQ29udGV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkIGEgbWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQgYmVsb3cgdGhlIGFuY2hvciBiYXIuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuRXh0ZW5zaW9uQVBJI19idWlsZE9QTWVzc2FnZVxuXHQgKiBAcGFyYW0ge3NhcC51aS5jb3JlLm1lc3NhZ2UuTWVzc2FnZVtdfSBtZXNzYWdlcyBBcnJheSBvZiBtZXNzYWdlcyB1c2VkIHRvIGdlbmVyYXRlZCB0aGUgbWVzc2FnZVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTxNZXNzYWdlPn0gUHJvbWlzZSBjb250YWluaW5nIHRoZSBnZW5lcmF0ZWQgbWVzc2FnZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YXN5bmMgX2J1aWxkT1BNZXNzYWdlKG1lc3NhZ2VzOiBNZXNzYWdlW10pOiBQcm9taXNlPE1lc3NhZ2UgfCBudWxsPiB7XG5cdFx0Y29uc3QgdmlldyA9IHRoaXMuX3ZpZXc7XG5cdFx0Y29uc3QgcmVzb3VyY2VNb2RlbCA9IFJlc291cmNlTW9kZWxIZWxwZXIuZ2V0UmVzb3VyY2VNb2RlbCh2aWV3KTtcblx0XHRsZXQgbWVzc2FnZTogTWVzc2FnZSB8IG51bGwgPSBudWxsO1xuXHRcdHN3aXRjaCAobWVzc2FnZXMubGVuZ3RoKSB7XG5cdFx0XHRjYXNlIDA6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHRtZXNzYWdlID0gbWVzc2FnZXNbMF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29uc3QgbWVzc2FnZVN0YXRzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge1xuXHRcdFx0XHRcdEVycm9yOiB7IGlkOiAyLCBjb3VudDogMCB9LFxuXHRcdFx0XHRcdFdhcm5pbmc6IHsgaWQ6IDEsIGNvdW50OiAwIH0sXG5cdFx0XHRcdFx0SW5mb3JtYXRpb246IHsgaWQ6IDAsIGNvdW50OiAwIH1cblx0XHRcdFx0fTtcblx0XHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2VzLnJlZHVjZSgoYWNjLCBjdXJyZW50VmFsdWUpID0+IHtcblx0XHRcdFx0XHRjb25zdCBjdXJyZW50VHlwZSA9IGN1cnJlbnRWYWx1ZS5nZXRUeXBlKCk7XG5cdFx0XHRcdFx0YWNjLnNldFR5cGUobWVzc2FnZVN0YXRzW2N1cnJlbnRUeXBlXS5pZCA+IG1lc3NhZ2VTdGF0c1thY2MuZ2V0VHlwZSgpXS5pZCA/IGN1cnJlbnRUeXBlIDogYWNjLmdldFR5cGUoKSk7XG5cdFx0XHRcdFx0bWVzc2FnZVN0YXRzW2N1cnJlbnRUeXBlXS5jb3VudCsrO1xuXHRcdFx0XHRcdHJldHVybiBhY2M7XG5cdFx0XHRcdH0sIG5ldyBNZXNzYWdlKHsgdHlwZTogTWVzc2FnZVR5cGUuSW5mb3JtYXRpb24gfSkpO1xuXG5cdFx0XHRcdGlmIChtZXNzYWdlU3RhdHMuRXJyb3IuY291bnQgPT09IDAgJiYgbWVzc2FnZVN0YXRzLldhcm5pbmcuY291bnQgPT09IDAgJiYgbWVzc2FnZVN0YXRzLkluZm9ybWF0aW9uLmNvdW50ID4gMCkge1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0TWVzc2FnZShyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJPQkpFQ1RQQUdFU1RBVEVfSU5GT1JNQVRJT05cIikpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKChtZXNzYWdlU3RhdHMuRXJyb3IuY291bnQgPiAwICYmIG1lc3NhZ2VTdGF0cy5XYXJuaW5nLmNvdW50ID4gMCkgfHwgbWVzc2FnZVN0YXRzLkluZm9ybWF0aW9uLmNvdW50ID4gMCkge1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0TWVzc2FnZShyZXNvdXJjZU1vZGVsLmdldFRleHQoXCJPQkpFQ1RQQUdFU1RBVEVfSVNTVUVcIikpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IG1lc3NhZ2VSZXNvdXJjZSA9IG1lc3NhZ2UuZ2V0VHlwZSgpID09PSBNZXNzYWdlVHlwZS5FcnJvciA/IFwiT0JKRUNUUEFHRVNUQVRFX0VSUk9SXCIgOiBcIk9CSkVDVFBBR0VTVEFURV9XQVJOSU5HXCI7XG5cdFx0XHRcdFx0bWVzc2FnZS5zZXRNZXNzYWdlKHJlc291cmNlTW9kZWwuZ2V0VGV4dChtZXNzYWdlUmVzb3VyY2UpKTtcblx0XHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gbWVzc2FnZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwbGF5cyB0aGUgbWVzc2FnZSBzdHJpcCBiZXR3ZWVuIHRoZSB0aXRsZSBhbmQgdGhlIGhlYWRlciBvZiB0aGUgT2JqZWN0UGFnZS5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUEkjc2hvd01lc3NhZ2VzXG5cdCAqIEBwYXJhbSB7c2FwLnVpLmNvcmUubWVzc2FnZS5NZXNzYWdlfSBtZXNzYWdlcyBUaGUgbWVzc2FnZSB0byBiZSBkaXNwbGF5ZWRcblx0ICogQHB1YmxpY1xuXHQgKi9cblxuXHRhc3luYyBzaG93TWVzc2FnZXMobWVzc2FnZXM6IE1lc3NhZ2VbXSkge1xuXHRcdGNvbnN0IHZpZXcgPSB0aGlzLl92aWV3O1xuXHRcdGNvbnN0IGludGVybmFsTW9kZWxDb250ZXh0ID0gdmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBtZXNzYWdlID0gYXdhaXQgdGhpcy5fYnVpbGRPUE1lc3NhZ2UobWVzc2FnZXMpO1xuXHRcdFx0aWYgKG1lc3NhZ2UpIHtcblx0XHRcdFx0KGludGVybmFsTW9kZWxDb250ZXh0IGFzIGFueSk/LnNldFByb3BlcnR5KFwiT1BNZXNzYWdlU3RyaXBWaXNpYmlsaXR5XCIsIHRydWUpO1xuXHRcdFx0XHQoaW50ZXJuYWxNb2RlbENvbnRleHQgYXMgYW55KT8uc2V0UHJvcGVydHkoXCJPUE1lc3NhZ2VTdHJpcFRleHRcIiwgbWVzc2FnZS5nZXRNZXNzYWdlKCkpO1xuXHRcdFx0XHQoaW50ZXJuYWxNb2RlbENvbnRleHQgYXMgYW55KT8uc2V0UHJvcGVydHkoXCJPUE1lc3NhZ2VTdHJpcFR5cGVcIiwgbWVzc2FnZS5nZXRUeXBlKCkpO1xuXHRcdFx0XHRJbnZpc2libGVNZXNzYWdlLmdldEluc3RhbmNlKCkuYW5ub3VuY2UobWVzc2FnZS5nZXRNZXNzYWdlKCksIEludmlzaWJsZU1lc3NhZ2VNb2RlLkFzc2VydGl2ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmhpZGVNZXNzYWdlKCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgZGlzcGxheSBPYmplY3RQYWdlIG1lc3NhZ2VcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhpZGVzIHRoZSBtZXNzYWdlIHN0cmlwIGJlbG93IHRoZSBhbmNob3IgYmFyLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNoaWRlTWVzc2FnZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRoaWRlTWVzc2FnZSgpIHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5fdmlldztcblx0XHRjb25zdCBpbnRlcm5hbE1vZGVsQ29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHQoaW50ZXJuYWxNb2RlbENvbnRleHQgYXMgYW55KT8uc2V0UHJvcGVydHkoXCJPUE1lc3NhZ2VTdHJpcFZpc2liaWxpdHlcIiwgZmFsc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gd2lsbCB0YWtlIHRoZSByZWNvbW1lbmRhdGlvbiBkYXRhIGRldGFpbHMsIHRyYW5zZm9ybSBpdCBhbmQgdXBkYXRlIGludGVybmFsIG1vZGVsIHdpdGggdGhhdC5cblx0ICpcblx0ICogQHBhcmFtIGRhdGEgUmVjb21tZW5kYXRpb24gZGF0YSBmb3IgdGhlIGFwcFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0c2V0UmVjb21tZW5kYXRpb25zKGRhdGE6IEluQ29tcGxldGVuZXNzSW5mb1R5cGUpIHtcblx0XHRyZWNvbW1lbmRhdGlvbkhlbHBlci50cmFuc2Zvcm1SZWNvbW1lbmRhdGlvbnNGb3JJbnRlcm5hbFN0b3JhZ2UoZGF0YSk7XG5cdFx0KHRoaXMuX3ZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwpLnNldFByb3BlcnR5KFwiL3JlY29tbWVuZGF0aW9uc0RhdGFcIiwgZGF0YSk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0UGFnZUV4dGVuc2lvbkFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0VBaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFWQSxJQVlNQSxzQkFBc0IsV0FEM0JDLGNBQWMsQ0FBQywwQ0FBMEMsQ0FBQztJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFFMUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFUQyxPQVVBQyxPQUFPLEdBQVAsaUJBQVFDLEtBQW9DLEVBQUU7TUFDN0MsTUFBTUMsZUFBZSxHQUFHLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxpQkFBaUIsRUFBYTtNQUNqRSxJQUFJLENBQUNGLGVBQWUsRUFBRTtRQUNyQjtRQUNBLE9BQU9HLE9BQU8sQ0FBQ0MsT0FBTyxFQUFFO01BQ3pCO01BQ0EsTUFBTUMsYUFBYSxHQUFHQyxXQUFXLENBQUNDLGVBQWUsQ0FBQyxJQUFJLENBQUNOLEtBQUssQ0FBQztRQUM1RE8sbUJBQW1CLEdBQUdILGFBQWEsQ0FBQ0kscUJBQXFCLEVBQUU7UUFDM0RDLFVBQVUsR0FBR1YsZUFBZSxDQUFDVyxRQUFRLEVBQUUsQ0FBQ0MsWUFBWSxFQUFFO1FBQ3REQyxZQUFtQyxHQUFHO1VBQ3JDQyxnQkFBZ0IsRUFBRSxFQUFFO1VBQ3BCQyxjQUFjLEVBQUU7UUFDakIsQ0FBQztNQUNGLElBQUlDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxjQUFjLEVBQUVDLEtBQUs7TUFFeEMsSUFBSXBCLEtBQUssS0FBS3FCLFNBQVMsSUFBSXJCLEtBQUssS0FBSyxJQUFJLEVBQUU7UUFDMUM7UUFDQWMsWUFBWSxDQUFDRSxjQUFjLENBQUNNLElBQUks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
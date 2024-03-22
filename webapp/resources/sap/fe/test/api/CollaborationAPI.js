/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/collaboration/ActivityBase", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/ui/model/json/JSONModel"], function (Log, ActivityBase, CollaborationCommon, draft, JSONModel) {
  "use strict";

  var Activity = CollaborationCommon.Activity;
  var initializeCollaboration = ActivityBase.initializeCollaboration;
  var endCollaboration = ActivityBase.endCollaboration;
  var broadcastCollaborationMessage = ActivityBase.broadcastCollaborationMessage;
  const CollaborationAPI = {
    _lastReceivedMessages: [],
    _rootPath: "",
    _oModel: undefined,
    _lockedPropertyPath: "",
    _internalModel: undefined,
    /**
     * Open an existing collaborative draft with a new user, and creates a 'ghost client' for this user.
     *
     * @param oContext The context of the collaborative draft
     * @param userID The ID of the user
     * @param userName The name of the user
     */
    enterDraft: function (oContext, userID, userName) {
      const webSocketBaseURL = oContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");
      if (!webSocketBaseURL) {
        Log.error("Cannot find WebSocketBaseURL annotation");
        return;
      }
      const sDraftUUID = oContext.getProperty("DraftAdministrativeData/DraftUUID");
      this._internalModel = new JSONModel({});
      const serviceUrl = oContext.getModel().getServiceUrl();
      initializeCollaboration({
        id: userID,
        name: userName,
        initialName: userName
      }, webSocketBaseURL, sDraftUUID, serviceUrl, this._internalModel, this._onMessageReceived.bind(this), true);
      this._rootPath = oContext.getPath();
      this._oModel = oContext.getModel();
    },
    /**
     * Checks if the ghost client has received a given message.
     *
     * @param message The message content to be looked for
     * @returns True if a previously received message matches the content
     */
    checkReceived: function (message) {
      if (this._lastReceivedMessages.length === 0) {
        return false;
      }
      const found = this._lastReceivedMessages.some(receivedMessage => {
        return (!message.userID || message.userID === receivedMessage.userID) && (!message.userAction || message.userAction === receivedMessage.userAction) && (!message.clientContent || message.clientContent === receivedMessage.clientContent);
      });
      this._lastReceivedMessages = []; // reset history to avoid finding the same message twice

      return found;
    },
    /**
     * Closes the ghost client and removes the user from the collaborative draft.
     */
    leaveDraft: function () {
      if (this._internalModel) {
        endCollaboration(this._internalModel);
        this._internalModel.destroy();
        this._internalModel = undefined;
      }
    },
    /**
     * Simulates that the user starts typing in an input (live change).
     *
     * @param sPropertyPath The path of the property being modified
     */
    startLiveChange: function (sPropertyPath) {
      if (this._internalModel) {
        if (this._lockedPropertyPath) {
          // Unlock previous property path
          this.undoChange();
        }
        this._lockedPropertyPath = sPropertyPath;
        broadcastCollaborationMessage(Activity.LiveChange, `${this._rootPath}/${sPropertyPath}`, this._internalModel);
      }
    },
    /**
     * Simulates that the user has modified a property.
     *
     * @param sPropertyPath The path of the property being modified
     * @param value The new value of the property being modified
     */
    updatePropertyValue: function (sPropertyPath, value) {
      if (this._internalModel) {
        if (this._lockedPropertyPath !== sPropertyPath) {
          this.startLiveChange(sPropertyPath);
        }
        const oContextBinding = this._oModel.bindContext(this._rootPath, undefined, {
          $$patchWithoutSideEffects: true,
          $$groupId: "$auto",
          $$updateGroupId: "$auto"
        });
        const oPropertyBinding = this._oModel.bindProperty(sPropertyPath, oContextBinding.getBoundContext());
        oPropertyBinding.requestValue().then(() => {
          oPropertyBinding.setValue(value);
          oContextBinding.attachEventOnce("patchCompleted", () => {
            broadcastCollaborationMessage(Activity.Change, `${this._rootPath}/${sPropertyPath}`, this._internalModel);
            this._lockedPropertyPath = "";
          });
        }).catch(function (err) {
          Log.error(err);
        });
      }
    },
    /**
     * Simulates that the user did an 'undo' (to be called after startLiveChange).
     */
    undoChange: function () {
      if (this._lockedPropertyPath) {
        broadcastCollaborationMessage(Activity.Undo, `${this._rootPath}/${this._lockedPropertyPath}`, this._internalModel);
        this._lockedPropertyPath = "";
      }
    },
    /**
     * Simulates that the user has discarded the draft.
     */
    discardDraft: function () {
      if (this._internalModel) {
        const draftContext = this._getDraftContext();
        draftContext.requestProperty("IsActiveEntity").then(() => {
          draft.deleteDraft(draftContext);
        }).then(() => {
          broadcastCollaborationMessage(Activity.Discard, this._rootPath.replace("IsActiveEntity=false", "IsActiveEntity=true"), this._internalModel);
          this._internalModel.destroy();
          this._internalModel = undefined;
        }).catch(function (err) {
          Log.error(err);
        });
      }
    },
    /**
     * Simulates that the user has deleted an object (child of draft root).
     *
     * @param objectPath The path of the object to delete
     */
    deleteObject: function (objectPath) {
      if (this._internalModel) {
        const objectContext = this._getObjectContext(objectPath);
        objectContext.requestProperty("IsActiveEntity").then(() => {
          objectContext.delete();
          broadcastCollaborationMessage(Activity.Delete, objectPath, this._internalModel);
        }).catch(err => {
          Log.error(err);
        });
      }
    },
    // /////////////////////////////
    // Private methods

    _getDraftContext: function () {
      return this._getObjectContext(this._rootPath);
    },
    _getObjectContext: function (path) {
      return this._oModel.bindContext(path, undefined, {
        $$patchWithoutSideEffects: true,
        $$groupId: "$auto",
        $$updateGroupId: "$auto"
      }).getBoundContext();
    },
    /**
     * Callback of the ghost client when receiving a message on the web socket.
     *
     * @param oMessage The message
     */
    _onMessageReceived: function (message) {
      message.userAction = message.userAction || message.clientAction;
      this._lastReceivedMessages.push(message);
      if (message.userAction === Activity.Join) {
        broadcastCollaborationMessage(Activity.JoinEcho, this._lockedPropertyPath ? `${this._rootPath}/${this._lockedPropertyPath}` : undefined, this._internalModel);
      }
    }
  };
  return CollaborationAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xsYWJvcmF0aW9uQVBJIiwiX2xhc3RSZWNlaXZlZE1lc3NhZ2VzIiwiX3Jvb3RQYXRoIiwiX29Nb2RlbCIsInVuZGVmaW5lZCIsIl9sb2NrZWRQcm9wZXJ0eVBhdGgiLCJfaW50ZXJuYWxNb2RlbCIsImVudGVyRHJhZnQiLCJvQ29udGV4dCIsInVzZXJJRCIsInVzZXJOYW1lIiwid2ViU29ja2V0QmFzZVVSTCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiZ2V0T2JqZWN0IiwiTG9nIiwiZXJyb3IiLCJzRHJhZnRVVUlEIiwiZ2V0UHJvcGVydHkiLCJKU09OTW9kZWwiLCJzZXJ2aWNlVXJsIiwiZ2V0U2VydmljZVVybCIsImluaXRpYWxpemVDb2xsYWJvcmF0aW9uIiwiaWQiLCJuYW1lIiwiaW5pdGlhbE5hbWUiLCJfb25NZXNzYWdlUmVjZWl2ZWQiLCJiaW5kIiwiZ2V0UGF0aCIsImNoZWNrUmVjZWl2ZWQiLCJtZXNzYWdlIiwibGVuZ3RoIiwiZm91bmQiLCJzb21lIiwicmVjZWl2ZWRNZXNzYWdlIiwidXNlckFjdGlvbiIsImNsaWVudENvbnRlbnQiLCJsZWF2ZURyYWZ0IiwiZW5kQ29sbGFib3JhdGlvbiIsImRlc3Ryb3kiLCJzdGFydExpdmVDaGFuZ2UiLCJzUHJvcGVydHlQYXRoIiwidW5kb0NoYW5nZSIsImJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlIiwiQWN0aXZpdHkiLCJMaXZlQ2hhbmdlIiwidXBkYXRlUHJvcGVydHlWYWx1ZSIsInZhbHVlIiwib0NvbnRleHRCaW5kaW5nIiwiYmluZENvbnRleHQiLCIkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzIiwiJCRncm91cElkIiwiJCR1cGRhdGVHcm91cElkIiwib1Byb3BlcnR5QmluZGluZyIsImJpbmRQcm9wZXJ0eSIsImdldEJvdW5kQ29udGV4dCIsInJlcXVlc3RWYWx1ZSIsInRoZW4iLCJzZXRWYWx1ZSIsImF0dGFjaEV2ZW50T25jZSIsIkNoYW5nZSIsImNhdGNoIiwiZXJyIiwiVW5kbyIsImRpc2NhcmREcmFmdCIsImRyYWZ0Q29udGV4dCIsIl9nZXREcmFmdENvbnRleHQiLCJyZXF1ZXN0UHJvcGVydHkiLCJkcmFmdCIsImRlbGV0ZURyYWZ0IiwiRGlzY2FyZCIsInJlcGxhY2UiLCJkZWxldGVPYmplY3QiLCJvYmplY3RQYXRoIiwib2JqZWN0Q29udGV4dCIsIl9nZXRPYmplY3RDb250ZXh0IiwiZGVsZXRlIiwiRGVsZXRlIiwicGF0aCIsImNsaWVudEFjdGlvbiIsInB1c2giLCJKb2luIiwiSm9pbkVjaG8iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbGxhYm9yYXRpb25BUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQge1xuXHRicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZSxcblx0ZW5kQ29sbGFib3JhdGlvbixcblx0aW5pdGlhbGl6ZUNvbGxhYm9yYXRpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlCYXNlXCI7XG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uQ29tbW9uXCI7XG5pbXBvcnQgeyBBY3Rpdml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25Db21tb25cIjtcbmltcG9ydCBkcmFmdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuXG5jb25zdCBDb2xsYWJvcmF0aW9uQVBJID0ge1xuXHRfbGFzdFJlY2VpdmVkTWVzc2FnZXM6IFtdIGFzIE1lc3NhZ2VbXSxcblx0X3Jvb3RQYXRoOiBcIlwiLFxuXHRfb01vZGVsOiB1bmRlZmluZWQgYXMgT0RhdGFNb2RlbCB8IHVuZGVmaW5lZCxcblx0X2xvY2tlZFByb3BlcnR5UGF0aDogXCJcIixcblx0X2ludGVybmFsTW9kZWw6IHVuZGVmaW5lZCBhcyBKU09OTW9kZWwgfCB1bmRlZmluZWQsXG5cblx0LyoqXG5cdCAqIE9wZW4gYW4gZXhpc3RpbmcgY29sbGFib3JhdGl2ZSBkcmFmdCB3aXRoIGEgbmV3IHVzZXIsIGFuZCBjcmVhdGVzIGEgJ2dob3N0IGNsaWVudCcgZm9yIHRoaXMgdXNlci5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBjb2xsYWJvcmF0aXZlIGRyYWZ0XG5cdCAqIEBwYXJhbSB1c2VySUQgVGhlIElEIG9mIHRoZSB1c2VyXG5cdCAqIEBwYXJhbSB1c2VyTmFtZSBUaGUgbmFtZSBvZiB0aGUgdXNlclxuXHQgKi9cblx0ZW50ZXJEcmFmdDogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0LCB1c2VySUQ6IHN0cmluZywgdXNlck5hbWU6IHN0cmluZykge1xuXHRcdGNvbnN0IHdlYlNvY2tldEJhc2VVUkw6IHN0cmluZyA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KFwiL0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuV2ViU29ja2V0QmFzZVVSTFwiKTtcblxuXHRcdGlmICghd2ViU29ja2V0QmFzZVVSTCkge1xuXHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IGZpbmQgV2ViU29ja2V0QmFzZVVSTCBhbm5vdGF0aW9uXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNEcmFmdFVVSUQ6IHN0cmluZyA9IG9Db250ZXh0LmdldFByb3BlcnR5KFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRVVUlEXCIpO1xuXHRcdHRoaXMuX2ludGVybmFsTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHt9KTtcblxuXHRcdGNvbnN0IHNlcnZpY2VVcmwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldFNlcnZpY2VVcmwoKTtcblxuXHRcdGluaXRpYWxpemVDb2xsYWJvcmF0aW9uKFxuXHRcdFx0e1xuXHRcdFx0XHRpZDogdXNlcklELFxuXHRcdFx0XHRuYW1lOiB1c2VyTmFtZSxcblx0XHRcdFx0aW5pdGlhbE5hbWU6IHVzZXJOYW1lXG5cdFx0XHR9LFxuXHRcdFx0d2ViU29ja2V0QmFzZVVSTCxcblx0XHRcdHNEcmFmdFVVSUQsXG5cdFx0XHRzZXJ2aWNlVXJsLFxuXHRcdFx0dGhpcy5faW50ZXJuYWxNb2RlbCxcblx0XHRcdHRoaXMuX29uTWVzc2FnZVJlY2VpdmVkLmJpbmQodGhpcyksXG5cdFx0XHR0cnVlXG5cdFx0KTtcblxuXHRcdHRoaXMuX3Jvb3RQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdHRoaXMuX29Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgZ2hvc3QgY2xpZW50IGhhcyByZWNlaXZlZCBhIGdpdmVuIG1lc3NhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlIGNvbnRlbnQgdG8gYmUgbG9va2VkIGZvclxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIGEgcHJldmlvdXNseSByZWNlaXZlZCBtZXNzYWdlIG1hdGNoZXMgdGhlIGNvbnRlbnRcblx0ICovXG5cdGNoZWNrUmVjZWl2ZWQ6IGZ1bmN0aW9uIChtZXNzYWdlOiBQYXJ0aWFsPE1lc3NhZ2U+KTogYm9vbGVhbiB7XG5cdFx0aWYgKHRoaXMuX2xhc3RSZWNlaXZlZE1lc3NhZ2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZvdW5kID0gdGhpcy5fbGFzdFJlY2VpdmVkTWVzc2FnZXMuc29tZSgocmVjZWl2ZWRNZXNzYWdlKSA9PiB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQoIW1lc3NhZ2UudXNlcklEIHx8IG1lc3NhZ2UudXNlcklEID09PSByZWNlaXZlZE1lc3NhZ2UudXNlcklEKSAmJlxuXHRcdFx0XHQoIW1lc3NhZ2UudXNlckFjdGlvbiB8fCBtZXNzYWdlLnVzZXJBY3Rpb24gPT09IHJlY2VpdmVkTWVzc2FnZS51c2VyQWN0aW9uKSAmJlxuXHRcdFx0XHQoIW1lc3NhZ2UuY2xpZW50Q29udGVudCB8fCBtZXNzYWdlLmNsaWVudENvbnRlbnQgPT09IHJlY2VpdmVkTWVzc2FnZS5jbGllbnRDb250ZW50KVxuXHRcdFx0KTtcblx0XHR9KTtcblxuXHRcdHRoaXMuX2xhc3RSZWNlaXZlZE1lc3NhZ2VzID0gW107IC8vIHJlc2V0IGhpc3RvcnkgdG8gYXZvaWQgZmluZGluZyB0aGUgc2FtZSBtZXNzYWdlIHR3aWNlXG5cblx0XHRyZXR1cm4gZm91bmQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENsb3NlcyB0aGUgZ2hvc3QgY2xpZW50IGFuZCByZW1vdmVzIHRoZSB1c2VyIGZyb20gdGhlIGNvbGxhYm9yYXRpdmUgZHJhZnQuXG5cdCAqL1xuXHRsZWF2ZURyYWZ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX2ludGVybmFsTW9kZWwpIHtcblx0XHRcdGVuZENvbGxhYm9yYXRpb24odGhpcy5faW50ZXJuYWxNb2RlbCk7XG5cdFx0XHR0aGlzLl9pbnRlcm5hbE1vZGVsLmRlc3Ryb3koKTtcblx0XHRcdHRoaXMuX2ludGVybmFsTW9kZWwgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBTaW11bGF0ZXMgdGhhdCB0aGUgdXNlciBzdGFydHMgdHlwaW5nIGluIGFuIGlucHV0IChsaXZlIGNoYW5nZSkuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJvcGVydHlQYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBiZWluZyBtb2RpZmllZFxuXHQgKi9cblx0c3RhcnRMaXZlQ2hhbmdlOiBmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0aWYgKHRoaXMuX2ludGVybmFsTW9kZWwpIHtcblx0XHRcdGlmICh0aGlzLl9sb2NrZWRQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0Ly8gVW5sb2NrIHByZXZpb3VzIHByb3BlcnR5IHBhdGhcblx0XHRcdFx0dGhpcy51bmRvQ2hhbmdlKCk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLl9sb2NrZWRQcm9wZXJ0eVBhdGggPSBzUHJvcGVydHlQYXRoO1xuXHRcdFx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UoQWN0aXZpdHkuTGl2ZUNoYW5nZSwgYCR7dGhpcy5fcm9vdFBhdGh9LyR7c1Byb3BlcnR5UGF0aH1gLCB0aGlzLl9pbnRlcm5hbE1vZGVsKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNpbXVsYXRlcyB0aGF0IHRoZSB1c2VyIGhhcyBtb2RpZmllZCBhIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5UGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgYmVpbmcgbW9kaWZpZWRcblx0ICogQHBhcmFtIHZhbHVlIFRoZSBuZXcgdmFsdWUgb2YgdGhlIHByb3BlcnR5IGJlaW5nIG1vZGlmaWVkXG5cdCAqL1xuXHR1cGRhdGVQcm9wZXJ0eVZhbHVlOiBmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogc3RyaW5nLCB2YWx1ZTogYW55KSB7XG5cdFx0aWYgKHRoaXMuX2ludGVybmFsTW9kZWwpIHtcblx0XHRcdGlmICh0aGlzLl9sb2NrZWRQcm9wZXJ0eVBhdGggIT09IHNQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0dGhpcy5zdGFydExpdmVDaGFuZ2Uoc1Byb3BlcnR5UGF0aCk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9Db250ZXh0QmluZGluZyA9IHRoaXMuX29Nb2RlbCEuYmluZENvbnRleHQodGhpcy5fcm9vdFBhdGgsIHVuZGVmaW5lZCwge1xuXHRcdFx0XHQkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzOiB0cnVlLFxuXHRcdFx0XHQkJGdyb3VwSWQ6IFwiJGF1dG9cIixcblx0XHRcdFx0JCR1cGRhdGVHcm91cElkOiBcIiRhdXRvXCJcblx0XHRcdH0pO1xuXG5cdFx0XHRjb25zdCBvUHJvcGVydHlCaW5kaW5nID0gdGhpcy5fb01vZGVsIS5iaW5kUHJvcGVydHkoc1Byb3BlcnR5UGF0aCwgb0NvbnRleHRCaW5kaW5nLmdldEJvdW5kQ29udGV4dCgpKTtcblxuXHRcdFx0b1Byb3BlcnR5QmluZGluZ1xuXHRcdFx0XHQucmVxdWVzdFZhbHVlKClcblx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eUJpbmRpbmcuc2V0VmFsdWUodmFsdWUpO1xuXHRcdFx0XHRcdG9Db250ZXh0QmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJwYXRjaENvbXBsZXRlZFwiLCAoKSA9PiB7XG5cdFx0XHRcdFx0XHRicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZShBY3Rpdml0eS5DaGFuZ2UsIGAke3RoaXMuX3Jvb3RQYXRofS8ke3NQcm9wZXJ0eVBhdGh9YCwgdGhpcy5faW50ZXJuYWxNb2RlbCEpO1xuXHRcdFx0XHRcdFx0dGhpcy5fbG9ja2VkUHJvcGVydHlQYXRoID0gXCJcIjtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoZXJyKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBTaW11bGF0ZXMgdGhhdCB0aGUgdXNlciBkaWQgYW4gJ3VuZG8nICh0byBiZSBjYWxsZWQgYWZ0ZXIgc3RhcnRMaXZlQ2hhbmdlKS5cblx0ICovXG5cdHVuZG9DaGFuZ2U6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5fbG9ja2VkUHJvcGVydHlQYXRoKSB7XG5cdFx0XHRicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZShBY3Rpdml0eS5VbmRvLCBgJHt0aGlzLl9yb290UGF0aH0vJHt0aGlzLl9sb2NrZWRQcm9wZXJ0eVBhdGh9YCwgdGhpcy5faW50ZXJuYWxNb2RlbCEpO1xuXHRcdFx0dGhpcy5fbG9ja2VkUHJvcGVydHlQYXRoID0gXCJcIjtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNpbXVsYXRlcyB0aGF0IHRoZSB1c2VyIGhhcyBkaXNjYXJkZWQgdGhlIGRyYWZ0LlxuXHQgKi9cblx0ZGlzY2FyZERyYWZ0OiBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKHRoaXMuX2ludGVybmFsTW9kZWwpIHtcblx0XHRcdGNvbnN0IGRyYWZ0Q29udGV4dCA9IHRoaXMuX2dldERyYWZ0Q29udGV4dCgpO1xuXG5cdFx0XHRkcmFmdENvbnRleHRcblx0XHRcdFx0LnJlcXVlc3RQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRkcmFmdC5kZWxldGVEcmFmdChkcmFmdENvbnRleHQpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UoXG5cdFx0XHRcdFx0XHRBY3Rpdml0eS5EaXNjYXJkLFxuXHRcdFx0XHRcdFx0dGhpcy5fcm9vdFBhdGgucmVwbGFjZShcIklzQWN0aXZlRW50aXR5PWZhbHNlXCIsIFwiSXNBY3RpdmVFbnRpdHk9dHJ1ZVwiKSxcblx0XHRcdFx0XHRcdHRoaXMuX2ludGVybmFsTW9kZWwhXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR0aGlzLl9pbnRlcm5hbE1vZGVsIS5kZXN0cm95KCk7XG5cdFx0XHRcdFx0dGhpcy5faW50ZXJuYWxNb2RlbCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnI6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihlcnIpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNpbXVsYXRlcyB0aGF0IHRoZSB1c2VyIGhhcyBkZWxldGVkIGFuIG9iamVjdCAoY2hpbGQgb2YgZHJhZnQgcm9vdCkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvYmplY3RQYXRoIFRoZSBwYXRoIG9mIHRoZSBvYmplY3QgdG8gZGVsZXRlXG5cdCAqL1xuXHRkZWxldGVPYmplY3Q6IGZ1bmN0aW9uIChvYmplY3RQYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAodGhpcy5faW50ZXJuYWxNb2RlbCkge1xuXHRcdFx0Y29uc3Qgb2JqZWN0Q29udGV4dCA9IHRoaXMuX2dldE9iamVjdENvbnRleHQob2JqZWN0UGF0aCk7XG5cblx0XHRcdG9iamVjdENvbnRleHRcblx0XHRcdFx0LnJlcXVlc3RQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRvYmplY3RDb250ZXh0LmRlbGV0ZSgpO1xuXHRcdFx0XHRcdGJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlKEFjdGl2aXR5LkRlbGV0ZSwgb2JqZWN0UGF0aCwgdGhpcy5faW50ZXJuYWxNb2RlbCEpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goKGVycikgPT4ge1xuXHRcdFx0XHRcdExvZy5lcnJvcihlcnIpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8gUHJpdmF0ZSBtZXRob2RzXG5cblx0X2dldERyYWZ0Q29udGV4dDogZnVuY3Rpb24gKCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldE9iamVjdENvbnRleHQodGhpcy5fcm9vdFBhdGgpO1xuXHR9LFxuXG5cdF9nZXRPYmplY3RDb250ZXh0OiBmdW5jdGlvbiAocGF0aDogc3RyaW5nKTogQ29udGV4dCB7XG5cdFx0cmV0dXJuIHRoaXMuX29Nb2RlbCEuYmluZENvbnRleHQocGF0aCwgdW5kZWZpbmVkLCB7XG5cdFx0XHQkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzOiB0cnVlLFxuXHRcdFx0JCRncm91cElkOiBcIiRhdXRvXCIsXG5cdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwiJGF1dG9cIlxuXHRcdH0pLmdldEJvdW5kQ29udGV4dCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBvZiB0aGUgZ2hvc3QgY2xpZW50IHdoZW4gcmVjZWl2aW5nIGEgbWVzc2FnZSBvbiB0aGUgd2ViIHNvY2tldC5cblx0ICpcblx0ICogQHBhcmFtIG9NZXNzYWdlIFRoZSBtZXNzYWdlXG5cdCAqL1xuXHRfb25NZXNzYWdlUmVjZWl2ZWQ6IGZ1bmN0aW9uIChtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdFx0bWVzc2FnZS51c2VyQWN0aW9uID0gbWVzc2FnZS51c2VyQWN0aW9uIHx8IG1lc3NhZ2UuY2xpZW50QWN0aW9uO1xuXHRcdHRoaXMuX2xhc3RSZWNlaXZlZE1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG5cblx0XHRpZiAobWVzc2FnZS51c2VyQWN0aW9uID09PSBBY3Rpdml0eS5Kb2luKSB7XG5cdFx0XHRicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZShcblx0XHRcdFx0QWN0aXZpdHkuSm9pbkVjaG8sXG5cdFx0XHRcdHRoaXMuX2xvY2tlZFByb3BlcnR5UGF0aCA/IGAke3RoaXMuX3Jvb3RQYXRofS8ke3RoaXMuX2xvY2tlZFByb3BlcnR5UGF0aH1gIDogdW5kZWZpbmVkLFxuXHRcdFx0XHR0aGlzLl9pbnRlcm5hbE1vZGVsIVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IENvbGxhYm9yYXRpb25BUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O0VBYUEsTUFBTUEsZ0JBQWdCLEdBQUc7SUFDeEJDLHFCQUFxQixFQUFFLEVBQWU7SUFD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
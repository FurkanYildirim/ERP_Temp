/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/collaboration/ActivityBase", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/converters/MetaModelConverter", "sap/m/MessageBox"], function (Log, CommonUtils, ActivityBase, CollaborationCommon, MetaModelConverter, MessageBox) {
  "use strict";

  var _exports = {};
  var getActivityKeyFromPath = CollaborationCommon.getActivityKeyFromPath;
  var CollaborationUtils = CollaborationCommon.CollaborationUtils;
  var Activity = CollaborationCommon.Activity;
  var isCollaborationConnected = ActivityBase.isCollaborationConnected;
  var initializeCollaboration = ActivityBase.initializeCollaboration;
  var endCollaboration = ActivityBase.endCollaboration;
  var broadcastCollaborationMessage = ActivityBase.broadcastCollaborationMessage;
  const MYACTIVITY = "/collaboration/myActivity";
  const ACTIVEUSERS = "/collaboration/activeUsers";
  const ACTIVITIES = "/collaboration/activities";
  const SYNCGROUPID = "$auto.sync";
  const isConnected = function (control) {
    const internalModel = control.getModel("internal");
    return isCollaborationConnected(internalModel);
  };
  _exports.isConnected = isConnected;
  const send = function (control, action, content, triggeredActionName, refreshListBinding, actionRequestedProperties) {
    if (isConnected(control)) {
      const internalModel = control.getModel("internal");
      const clientContent = Array.isArray(content) ? content.join("|") : content;
      const requestedProperties = actionRequestedProperties === null || actionRequestedProperties === void 0 ? void 0 : actionRequestedProperties.join("|");
      const myActivity = internalModel.getProperty(MYACTIVITY);
      if (action === Activity.LiveChange) {
        // To avoid unnecessary traffic we keep track of live changes and send it only once

        if (myActivity === clientContent) {
          return;
        } else {
          internalModel.setProperty(MYACTIVITY, clientContent);
        }
      } else {
        // No need to send an Undo message if there's no current activity
        if (action === Activity.Undo && myActivity === null) {
          return;
        }

        // user finished the activity
        internalModel.setProperty(MYACTIVITY, null);
      }
      broadcastCollaborationMessage(action, clientContent, internalModel, triggeredActionName, refreshListBinding, requestedProperties);
    }
  };
  _exports.send = send;
  const getWebSocketBaseURL = function (bindingContext) {
    return bindingContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");
  };
  const isCollaborationEnabled = function (view) {
    const bindingContext = (view === null || view === void 0 ? void 0 : view.getBindingContext) && view.getBindingContext();
    return !!(bindingContext && getWebSocketBaseURL(bindingContext));
  };
  _exports.isCollaborationEnabled = isCollaborationEnabled;
  const connect = async function (view) {
    const internalModel = view.getModel("internal");
    const me = CollaborationUtils.getMe(view);

    // Retrieving ME from shell service
    if (!me) {
      // no me = no shell = not sure what to do
      return;
    }
    const bindingContext = view.getBindingContext();
    const webSocketBaseURL = getWebSocketBaseURL(bindingContext);
    const serviceUrl = bindingContext.getModel().getServiceUrl();
    if (!webSocketBaseURL) {
      return;
    }
    const sDraftUUID = await bindingContext.requestProperty("DraftAdministrativeData/DraftUUID");
    if (!sDraftUUID) {
      return;
    }
    initializeCollaboration(me, webSocketBaseURL, sDraftUUID, serviceUrl, internalModel, message => {
      messageReceive(message, view);
    });
    internalModel.setProperty(MYACTIVITY, null);
  };
  _exports.connect = connect;
  const disconnect = function (control) {
    const internalModel = control.getModel("internal");
    endCollaboration(internalModel);
  };

  /**
   * Callback when a message is received from the websocket.
   *
   * @param message The message received
   * @param view The view that was used initially when connecting the websocket
   */
  _exports.disconnect = disconnect;
  function messageReceive(message, view) {
    var _activities;
    const internalModel = view.getModel("internal");
    let activeUsers = internalModel.getProperty(ACTIVEUSERS);
    let activities;
    let activityKey;
    const metaPath = calculateMetaPath(view, message.clientContent);
    message.userAction = message.userAction || message.clientAction;
    const sender = {
      id: message.userID,
      name: message.userDescription,
      initials: CollaborationUtils.formatInitials(message.userDescription),
      color: CollaborationUtils.getUserColor(message.userID, activeUsers, [])
    };
    let mactivity = sender;

    // eslint-disable-next-line default-case
    switch (message.userAction) {
      case Activity.Join:
      case Activity.JoinEcho:
        if (activeUsers.findIndex(user => user.id === sender.id) === -1) {
          activeUsers.unshift(sender);
          internalModel.setProperty(ACTIVEUSERS, activeUsers);
        }
        if (message.userAction === Activity.Join) {
          // we echo our existence to the newly entered user and also send the current activity if there is any
          broadcastCollaborationMessage(Activity.JoinEcho, internalModel.getProperty(MYACTIVITY), internalModel);
        }
        if (message.userAction === Activity.JoinEcho) {
          if (message.clientContent) {
            // another user was already typing therefore I want to see his activity immediately. Calling me again as a live change
            message.userAction = Activity.LiveChange;
            messageReceive(message, view);
          }
        }
        break;
      case Activity.Leave:
        // Removing the active user. Not removing "me" if I had the screen open in another session
        activeUsers = activeUsers.filter(user => user.id !== sender.id || user.me);
        internalModel.setProperty(ACTIVEUSERS, activeUsers);
        const allActivities = internalModel.getProperty(ACTIVITIES) || {};
        const removeUserActivities = function (bag) {
          if (Array.isArray(bag)) {
            return bag.filter(activity => activity.id !== sender.id);
          } else {
            for (const p in bag) {
              bag[p] = removeUserActivities(bag[p]);
            }
            return bag;
          }
        };
        removeUserActivities(allActivities);
        internalModel.setProperty(ACTIVITIES, allActivities);
        break;
      case Activity.Change:
        updateOnChange(view, message);
        break;
      case Activity.Create:
        // For create we actually just need to refresh the table
        updateOnCreate(view, message);
        break;
      case Activity.Delete:
        // For now also refresh the page but in case of deletion we need to inform the user
        updateOnDelete(view, message);
        break;
      case Activity.Activate:
        draftClosedByOtherUser(view, message.clientContent, CollaborationUtils.getText("C_COLLABORATIONDRAFT_ACTIVATE", sender.name));
        break;
      case Activity.Discard:
        draftClosedByOtherUser(view, message.clientContent, CollaborationUtils.getText("C_COLLABORATIONDRAFT_DISCARD", sender.name));
        break;
      case Activity.Action:
        updateOnAction(view, message);
        break;
      case Activity.LiveChange:
        mactivity = sender;
        mactivity.key = getActivityKeyFromPath(message.clientContent);

        // stupid JSON model...
        let initJSONModel = "";
        const parts = metaPath.split("/");
        for (let i = 1; i < parts.length - 1; i++) {
          initJSONModel += `/${parts[i]}`;
          if (!internalModel.getProperty(ACTIVITIES + initJSONModel)) {
            internalModel.setProperty(ACTIVITIES + initJSONModel, {});
          }
        }
        activities = internalModel.getProperty(ACTIVITIES + metaPath);
        activities = (_activities = activities) !== null && _activities !== void 0 && _activities.slice ? activities.slice() : [];
        activities.push(mactivity);
        internalModel.setProperty(ACTIVITIES + metaPath, activities);
        break;
      case Activity.Undo:
        // The user did a change but reverted it, therefore unblock the control
        activities = internalModel.getProperty(ACTIVITIES + metaPath);
        activityKey = getActivityKeyFromPath(message.clientContent);
        internalModel.setProperty(ACTIVITIES + metaPath, activities.filter(a => a.key !== activityKey));
        break;
    }
  }

  /**
   * Displays a message that the current draft was closed be another user, and navigates back to a proper view.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param path The path of the context to navigate to
   * @param messageText The message to display
   */
  function draftClosedByOtherUser(view, path, messageText) {
    disconnect(view);
    MessageBox.information(messageText);
    view.getBindingContext().getBinding().resetChanges().then(function () {
      navigate(path, view);
    }).catch(function () {
      Log.error("Pending Changes could not be reset - still navigating to active instance");
      navigate(path, view);
    });
  }

  /**
   * Updates data when a CHANGE message has been received.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param message The message received from the websocket
   */
  function updateOnChange(view, message) {
    const updatedObjectsPaths = message.clientContent.split("|");
    const metaModel = view.getModel().getMetaModel();
    const internalModel = view.getModel("internal");

    // Remove all locks corresponding to the paths
    updatedObjectsPaths.forEach(updatedPath => {
      var _currentActivities;
      const updatedMetaPath = metaModel.getMetaPath(updatedPath);
      const activityKey = getActivityKeyFromPath(updatedPath);
      let currentActivities = internalModel.getProperty(ACTIVITIES + updatedMetaPath) || [];
      currentActivities = ((_currentActivities = currentActivities) === null || _currentActivities === void 0 ? void 0 : _currentActivities.filter) && currentActivities.filter(activity => activity.key !== activityKey);
      if (currentActivities) {
        internalModel.setProperty(ACTIVITIES + updatedMetaPath, currentActivities);
      }
    });
    const currentPage = getCurrentPage(view);
    const currentContext = currentPage.getBindingContext();
    const requestPromises = updatedObjectsPaths.map(path => applyUpdatesForChange(view, path));

    // Simulate any change so the edit flow shows the draft indicator and sets the page to dirty
    currentPage.getController().editFlow.updateDocument(currentContext, Promise.all(requestPromises));
  }

  /**
   * Updates data corresponding to a path.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param propertyPathForUpdate Absolute path to the updated property
   * @returns A promise resolved when the data and its related side effects have been received
   */
  async function applyUpdatesForChange(view, propertyPathForUpdate) {
    const metaModel = view.getModel().getMetaModel();
    const metaContext = metaModel.getMetaContext(propertyPathForUpdate);
    const dataModelObject = MetaModelConverter.getInvolvedDataModelObjects(metaContext);
    const targetContextPath = propertyPathForUpdate.substring(0, propertyPathForUpdate.lastIndexOf("/")); // Remove property name
    const targetContext = findContextForUpdate(view, targetContextPath);
    const parentCollectionPath = targetContextPath.substring(0, targetContextPath.lastIndexOf("("));
    const parentContextPath = parentCollectionPath.substring(0, parentCollectionPath.lastIndexOf("/"));
    const parentContext = parentContextPath ? findContextForUpdate(view, parentContextPath) : undefined;
    if (!targetContext && !parentContext) {
      return; // No context for update
    }

    try {
      const sideEffectsPromises = [];
      const sideEffectsService = CollaborationUtils.getAppComponent(view).getSideEffectsService();
      if (targetContext) {
        // We have a target context, so we can retrieve the updated property
        const targetMetaPath = metaModel.getMetaPath(targetContext.getPath());
        const relativeMetaPathForUpdate = metaModel.getMetaPath(propertyPathForUpdate).replace(targetMetaPath, "").slice(1);
        sideEffectsPromises.push(sideEffectsService.requestSideEffects([relativeMetaPathForUpdate], targetContext, SYNCGROUPID));
      }

      // Get the fieldGroupIds corresponding to pathForUpdate
      const fieldGroupIds = sideEffectsService.computeFieldGroupIds(dataModelObject.targetEntityType.fullyQualifiedName, dataModelObject.targetObject.fullyQualifiedName);

      // Execute the side effects for the fieldGroupIds
      if (fieldGroupIds.length) {
        const pageController = view.getController();
        const sideEffectsMapForFieldGroup = pageController._sideEffects.getSideEffectsMapForFieldGroups(fieldGroupIds, targetContext || parentContext);
        Object.keys(sideEffectsMapForFieldGroup).forEach(sideEffectName => {
          const sideEffect = sideEffectsMapForFieldGroup[sideEffectName];
          sideEffectsPromises.push(pageController._sideEffects.requestSideEffects(sideEffect.sideEffects, sideEffect.context, SYNCGROUPID));
        });
      }
      await Promise.all(sideEffectsPromises);
    } catch (err) {
      Log.error("Failed to update data after change:" + err);
      throw err;
    }
  }

  /**
   * Updates data when a DELETE message has been received.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param message The message received from the websocket
   */
  function updateOnDelete(view, message) {
    const currentPage = getCurrentPage(view);
    const currentContext = currentPage.getBindingContext();
    const currentPath = currentContext.getPath();
    const deletedObjectPaths = message.clientContent.split("|");

    // check if user currently displays a deleted object or one of its descendants
    const deletedPathInUse = deletedObjectPaths.find(deletedPath => currentPath.startsWith(deletedPath));
    if (deletedPathInUse) {
      // any other user deleted the object I'm currently looking at. Inform the user we will navigate to root now
      MessageBox.information(CollaborationUtils.getText("C_COLLABORATIONDRAFT_DELETE", message.userDescription), {
        onClose: () => {
          // We retrieve the deleted context as a keep-alive, and disable its keepalive status,
          // so that it is properly destroyed when refreshing data
          const targetContext = currentContext.getModel().getKeepAliveContext(deletedPathInUse);
          targetContext.setKeepAlive(false);
          const requestPromise = applyUpdatesForCollection(view, deletedObjectPaths[0]);
          currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), requestPromise);
          currentPage.getController()._routing.navigateBackFromContext(targetContext);
        }
      });
    } else {
      const requestPromise = applyUpdatesForCollection(view, deletedObjectPaths[0]);
      currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), requestPromise);
    }
  }

  /**
   * Updates data when a CREATE message has been received.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param message The message received from the websocket
   */
  function updateOnCreate(view, message) {
    const currentPage = getCurrentPage(view);
    const createdObjectPaths = message.clientContent.split("|");
    const requestPromise = applyUpdatesForCollection(view, createdObjectPaths[0]);
    // Simulate a change so the edit flow shows the draft indicator and sets the page to dirty
    currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), requestPromise);
  }

  /**
   * Updates data in a collection.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param pathInCollection A path to an entity in the collection
   */
  async function applyUpdatesForCollection(view, pathInCollection) {
    const appComponent = CollaborationUtils.getAppComponent(view);
    const parentPath = pathInCollection.substring(0, pathInCollection.lastIndexOf("/"));
    const parentContext = findContextForUpdate(view, parentPath);
    if (parentContext) {
      try {
        const sideEffectsPromises = [];
        const metaModel = parentContext.getModel().getMetaModel();
        const metaPathForUpdate = metaModel.getMetaPath(pathInCollection);
        const parentMetaPath = metaModel.getMetaPath(parentContext.getPath());
        const relativePath = metaPathForUpdate.replace(`${parentMetaPath}/`, "");

        // Reload the collection
        const sideEffectsService = appComponent.getSideEffectsService();
        sideEffectsPromises.push(sideEffectsService.requestSideEffects([relativePath], parentContext, SYNCGROUPID));

        // Request the side effects for the collection
        sideEffectsPromises.push(sideEffectsService.requestSideEffectsForNavigationProperty(relativePath, parentContext, SYNCGROUPID));
        await Promise.all(sideEffectsPromises);
      } catch (err) {
        Log.error("Failed to update data after collection update:" + err);
      }
    }
  }

  /**
   * Updates data when a ACTION message has been received.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param message The message received from the websocket
   */
  function updateOnAction(view, message) {
    var _message$clientReques;
    const currentPage = getCurrentPage(view);
    const pathsForAction = message.clientContent.split("|");
    const actionName = message.clientTriggeredActionName || "";
    const requestedProperties = (_message$clientReques = message.clientRequestedProperties) === null || _message$clientReques === void 0 ? void 0 : _message$clientReques.split("|");
    const refreshListBinding = message.clientRefreshListBinding === "true";
    let requestPromises = [];
    if (refreshListBinding) {
      requestPromises.push(applyUpdatesForCollection(view, pathsForAction[0]));
    } else {
      requestPromises = pathsForAction.map(path => requestUpdateForAction(view, path, actionName, requestedProperties));
    }

    // Simulate any change so the edit flow shows the draft indicator and sets the page to dirty
    currentPage.getController().editFlow.updateDocument(currentPage.getBindingContext(), Promise.all(requestPromises));
  }

  /**
   * Updates side-effects data when an action has been triggered on a context.
   *
   * @param view The view that was used initially when connecting the websocket
   * @param pathForAction Path of the context to apply the action to
   * @param actionName Name of the action
   * @param requestedProperties
   * @returns Promise resolved when the side-effects data has been loaded
   */
  async function requestUpdateForAction(view, pathForAction, actionName, requestedProperties) {
    const targetContext = findContextForUpdate(view, pathForAction);
    if (!targetContext) {
      return;
    }
    const appComponent = CollaborationUtils.getAppComponent(view);
    const sideEffectService = appComponent.getSideEffectsService();
    const sideEffectsFromAction = sideEffectService.getODataActionSideEffects(actionName, targetContext);
    const sideEffectPromises = [];
    if (sideEffectsFromAction) {
      var _sideEffectsFromActio;
      if ((_sideEffectsFromActio = sideEffectsFromAction.pathExpressions) !== null && _sideEffectsFromActio !== void 0 && _sideEffectsFromActio.length) {
        sideEffectPromises.push(sideEffectService.requestSideEffects(sideEffectsFromAction.pathExpressions, targetContext, SYNCGROUPID));
      }
    }
    if (requestedProperties && requestedProperties.length > 0) {
      //clean-up of the properties to request list:
      const metaModel = view.getModel().getMetaModel();
      const metaPathForAction = calculateMetaPath(view, pathForAction);
      const dataModelPath = MetaModelConverter.getInvolvedDataModelObjects(metaModel.getContext(metaPathForAction));
      const propertiesToRequest = dataModelPath.targetEntityType.entityProperties.map(property => {
        return property.name;
      }).filter(prop => requestedProperties.includes(prop));
      if (propertiesToRequest.length > 0) {
        sideEffectPromises.push(sideEffectService.requestSideEffects(propertiesToRequest, targetContext, SYNCGROUPID));
      }
    }
    await Promise.all(sideEffectPromises);
  }

  /**
   * Finds a context to apply an update message (CHANGE, CREATE, DELETE or ACTION).
   *
   * @param view  The view that was used initially when connecting the websocket
   * @param path The path of the context to be found (shall point to an entity, not a property)
   * @returns A context if it could be found
   */
  function findContextForUpdate(view, path) {
    if (!path) {
      return undefined;
    }
    // Find all potential paths
    const targetPaths = [];
    while (!path.endsWith(")")) {
      targetPaths.unshift(path);
      path = path.substring(0, path.lastIndexOf("/"));
    }
    targetPaths.unshift(path);
    const parentCollectionPath = path.substring(0, path.lastIndexOf("(")); // Remove the last key

    let targetContext;
    let currentContext = getCurrentPage(view).getBindingContext();
    while (currentContext && !targetContext) {
      var _currentContext$getBi;
      if (targetPaths.indexOf(currentContext.getPath()) >= 0) {
        targetContext = currentContext;
      }
      currentContext = (_currentContext$getBi = currentContext.getBinding()) === null || _currentContext$getBi === void 0 ? void 0 : _currentContext$getBi.getContext();
    }
    if (targetContext) {
      // Found !
      return targetContext;
    }

    // Try to find the target context in a listBinding
    const model = getCurrentPage(view).getBindingContext().getModel();
    const parentListBinding = model.getAllBindings().find(binding => {
      const bindingPath = binding.isRelative() ? binding.getResolvedPath() : binding.getPath();
      return binding.isA("sap.ui.model.odata.v4.ODataListBinding") && bindingPath === parentCollectionPath;
    });
    // We've found a list binding that could contain the target context --> look for it
    targetContext = parentListBinding === null || parentListBinding === void 0 ? void 0 : parentListBinding.getAllCurrentContexts().find(context => {
      return targetPaths.indexOf(context.getPath()) >= 0;
    });
    return targetContext;
  }
  function navigate(path, view) {
    // TODO: routing.navigate doesn't consider semantic bookmarking
    const currentPage = getCurrentPage(view);
    const targetContext = view.getModel().bindContext(path).getBoundContext();
    currentPage.getController().routing.navigate(targetContext);
  }
  function getCurrentPage(view) {
    const appComponent = CollaborationUtils.getAppComponent(view);
    return CommonUtils.getCurrentPageView(appComponent);
  }

  /**
   * Calculates the metapath from one or more data path(s).
   *
   * @param view The current view
   * @param path One ore more data path(s), in case of multiple paths separated by '|'
   * @returns The calculated metaPath
   */
  function calculateMetaPath(view, path) {
    let metaPath = "";
    if (path) {
      // in case more than one path is sent all of them have to use the same metapath therefore we just consider the first one
      const dataPath = path.split("|")[0];
      metaPath = view.getModel().getMetaModel().getMetaPath(dataPath);
    }
    return metaPath;
  }
  return {
    connect: connect,
    disconnect: disconnect,
    isConnected: isConnected,
    isCollaborationEnabled: isCollaborationEnabled,
    send: send
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNWUFDVElWSVRZIiwiQUNUSVZFVVNFUlMiLCJBQ1RJVklUSUVTIiwiU1lOQ0dST1VQSUQiLCJpc0Nvbm5lY3RlZCIsImNvbnRyb2wiLCJpbnRlcm5hbE1vZGVsIiwiZ2V0TW9kZWwiLCJpc0NvbGxhYm9yYXRpb25Db25uZWN0ZWQiLCJzZW5kIiwiYWN0aW9uIiwiY29udGVudCIsInRyaWdnZXJlZEFjdGlvbk5hbWUiLCJyZWZyZXNoTGlzdEJpbmRpbmciLCJhY3Rpb25SZXF1ZXN0ZWRQcm9wZXJ0aWVzIiwiY2xpZW50Q29udGVudCIsIkFycmF5IiwiaXNBcnJheSIsImpvaW4iLCJyZXF1ZXN0ZWRQcm9wZXJ0aWVzIiwibXlBY3Rpdml0eSIsImdldFByb3BlcnR5IiwiQWN0aXZpdHkiLCJMaXZlQ2hhbmdlIiwic2V0UHJvcGVydHkiLCJVbmRvIiwiYnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UiLCJnZXRXZWJTb2NrZXRCYXNlVVJMIiwiYmluZGluZ0NvbnRleHQiLCJnZXRNZXRhTW9kZWwiLCJnZXRPYmplY3QiLCJpc0NvbGxhYm9yYXRpb25FbmFibGVkIiwidmlldyIsImdldEJpbmRpbmdDb250ZXh0IiwiY29ubmVjdCIsIm1lIiwiQ29sbGFib3JhdGlvblV0aWxzIiwiZ2V0TWUiLCJ3ZWJTb2NrZXRCYXNlVVJMIiwic2VydmljZVVybCIsImdldFNlcnZpY2VVcmwiLCJzRHJhZnRVVUlEIiwicmVxdWVzdFByb3BlcnR5IiwiaW5pdGlhbGl6ZUNvbGxhYm9yYXRpb24iLCJtZXNzYWdlIiwibWVzc2FnZVJlY2VpdmUiLCJkaXNjb25uZWN0IiwiZW5kQ29sbGFib3JhdGlvbiIsImFjdGl2ZVVzZXJzIiwiYWN0aXZpdGllcyIsImFjdGl2aXR5S2V5IiwibWV0YVBhdGgiLCJjYWxjdWxhdGVNZXRhUGF0aCIsInVzZXJBY3Rpb24iLCJjbGllbnRBY3Rpb24iLCJzZW5kZXIiLCJpZCIsInVzZXJJRCIsIm5hbWUiLCJ1c2VyRGVzY3JpcHRpb24iLCJpbml0aWFscyIsImZvcm1hdEluaXRpYWxzIiwiY29sb3IiLCJnZXRVc2VyQ29sb3IiLCJtYWN0aXZpdHkiLCJKb2luIiwiSm9pbkVjaG8iLCJmaW5kSW5kZXgiLCJ1c2VyIiwidW5zaGlmdCIsIkxlYXZlIiwiZmlsdGVyIiwiYWxsQWN0aXZpdGllcyIsInJlbW92ZVVzZXJBY3Rpdml0aWVzIiwiYmFnIiwiYWN0aXZpdHkiLCJwIiwiQ2hhbmdlIiwidXBkYXRlT25DaGFuZ2UiLCJDcmVhdGUiLCJ1cGRhdGVPbkNyZWF0ZSIsIkRlbGV0ZSIsInVwZGF0ZU9uRGVsZXRlIiwiQWN0aXZhdGUiLCJkcmFmdENsb3NlZEJ5T3RoZXJVc2VyIiwiZ2V0VGV4dCIsIkRpc2NhcmQiLCJBY3Rpb24iLCJ1cGRhdGVPbkFjdGlvbiIsImtleSIsImdldEFjdGl2aXR5S2V5RnJvbVBhdGgiLCJpbml0SlNPTk1vZGVsIiwicGFydHMiLCJzcGxpdCIsImkiLCJsZW5ndGgiLCJzbGljZSIsInB1c2giLCJhIiwicGF0aCIsIm1lc3NhZ2VUZXh0IiwiTWVzc2FnZUJveCIsImluZm9ybWF0aW9uIiwiZ2V0QmluZGluZyIsInJlc2V0Q2hhbmdlcyIsInRoZW4iLCJuYXZpZ2F0ZSIsImNhdGNoIiwiTG9nIiwiZXJyb3IiLCJ1cGRhdGVkT2JqZWN0c1BhdGhzIiwibWV0YU1vZGVsIiwiZm9yRWFjaCIsInVwZGF0ZWRQYXRoIiwidXBkYXRlZE1ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJjdXJyZW50QWN0aXZpdGllcyIsImN1cnJlbnRQYWdlIiwiZ2V0Q3VycmVudFBhZ2UiLCJjdXJyZW50Q29udGV4dCIsInJlcXVlc3RQcm9taXNlcyIsIm1hcCIsImFwcGx5VXBkYXRlc0ZvckNoYW5nZSIsImdldENvbnRyb2xsZXIiLCJlZGl0RmxvdyIsInVwZGF0ZURvY3VtZW50IiwiUHJvbWlzZSIsImFsbCIsInByb3BlcnR5UGF0aEZvclVwZGF0ZSIsIm1ldGFDb250ZXh0IiwiZ2V0TWV0YUNvbnRleHQiLCJkYXRhTW9kZWxPYmplY3QiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJ0YXJnZXRDb250ZXh0UGF0aCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwidGFyZ2V0Q29udGV4dCIsImZpbmRDb250ZXh0Rm9yVXBkYXRlIiwicGFyZW50Q29sbGVjdGlvblBhdGgiLCJwYXJlbnRDb250ZXh0UGF0aCIsInBhcmVudENvbnRleHQiLCJ1bmRlZmluZWQiLCJzaWRlRWZmZWN0c1Byb21pc2VzIiwic2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwidGFyZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwicmVsYXRpdmVNZXRhUGF0aEZvclVwZGF0ZSIsInJlcGxhY2UiLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJmaWVsZEdyb3VwSWRzIiwiY29tcHV0ZUZpZWxkR3JvdXBJZHMiLCJ0YXJnZXRFbnRpdHlUeXBlIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwidGFyZ2V0T2JqZWN0IiwicGFnZUNvbnRyb2xsZXIiLCJzaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXAiLCJfc2lkZUVmZmVjdHMiLCJnZXRTaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBzIiwiT2JqZWN0Iiwia2V5cyIsInNpZGVFZmZlY3ROYW1lIiwic2lkZUVmZmVjdCIsInNpZGVFZmZlY3RzIiwiY29udGV4dCIsImVyciIsImN1cnJlbnRQYXRoIiwiZGVsZXRlZE9iamVjdFBhdGhzIiwiZGVsZXRlZFBhdGhJblVzZSIsImZpbmQiLCJkZWxldGVkUGF0aCIsInN0YXJ0c1dpdGgiLCJvbkNsb3NlIiwiZ2V0S2VlcEFsaXZlQ29udGV4dCIsInNldEtlZXBBbGl2ZSIsInJlcXVlc3RQcm9taXNlIiwiYXBwbHlVcGRhdGVzRm9yQ29sbGVjdGlvbiIsIl9yb3V0aW5nIiwibmF2aWdhdGVCYWNrRnJvbUNvbnRleHQiLCJjcmVhdGVkT2JqZWN0UGF0aHMiLCJwYXRoSW5Db2xsZWN0aW9uIiwiYXBwQ29tcG9uZW50IiwicGFyZW50UGF0aCIsIm1ldGFQYXRoRm9yVXBkYXRlIiwicGFyZW50TWV0YVBhdGgiLCJyZWxhdGl2ZVBhdGgiLCJyZXF1ZXN0U2lkZUVmZmVjdHNGb3JOYXZpZ2F0aW9uUHJvcGVydHkiLCJwYXRoc0ZvckFjdGlvbiIsImFjdGlvbk5hbWUiLCJjbGllbnRUcmlnZ2VyZWRBY3Rpb25OYW1lIiwiY2xpZW50UmVxdWVzdGVkUHJvcGVydGllcyIsImNsaWVudFJlZnJlc2hMaXN0QmluZGluZyIsInJlcXVlc3RVcGRhdGVGb3JBY3Rpb24iLCJwYXRoRm9yQWN0aW9uIiwic2lkZUVmZmVjdFNlcnZpY2UiLCJzaWRlRWZmZWN0c0Zyb21BY3Rpb24iLCJnZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzIiwic2lkZUVmZmVjdFByb21pc2VzIiwicGF0aEV4cHJlc3Npb25zIiwibWV0YVBhdGhGb3JBY3Rpb24iLCJkYXRhTW9kZWxQYXRoIiwiZ2V0Q29udGV4dCIsInByb3BlcnRpZXNUb1JlcXVlc3QiLCJlbnRpdHlQcm9wZXJ0aWVzIiwicHJvcGVydHkiLCJwcm9wIiwiaW5jbHVkZXMiLCJ0YXJnZXRQYXRocyIsImVuZHNXaXRoIiwiaW5kZXhPZiIsIm1vZGVsIiwicGFyZW50TGlzdEJpbmRpbmciLCJnZXRBbGxCaW5kaW5ncyIsImJpbmRpbmciLCJiaW5kaW5nUGF0aCIsImlzUmVsYXRpdmUiLCJnZXRSZXNvbHZlZFBhdGgiLCJpc0EiLCJnZXRBbGxDdXJyZW50Q29udGV4dHMiLCJiaW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsInJvdXRpbmciLCJDb21tb25VdGlscyIsImdldEN1cnJlbnRQYWdlVmlldyIsImRhdGFQYXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBY3Rpdml0eVN5bmMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgRkVWaWV3IH0gZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQge1xuXHRicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZSxcblx0ZW5kQ29sbGFib3JhdGlvbixcblx0aW5pdGlhbGl6ZUNvbGxhYm9yYXRpb24sXG5cdGlzQ29sbGFib3JhdGlvbkNvbm5lY3RlZFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9BY3Rpdml0eUJhc2VcIjtcbmltcG9ydCB0eXBlIHsgTWVzc2FnZSwgVXNlciwgVXNlckFjdGl2aXR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQ29sbGFib3JhdGlvbkNvbW1vblwiO1xuaW1wb3J0IHsgQWN0aXZpdHksIENvbGxhYm9yYXRpb25VdGlscywgZ2V0QWN0aXZpdHlLZXlGcm9tUGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25Db21tb25cIjtcbmltcG9ydCB7IEZpZWxkU2lkZUVmZmVjdERpY3Rpb25hcnkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2lkZUVmZmVjdHNcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcblxuY29uc3QgTVlBQ1RJVklUWSA9IFwiL2NvbGxhYm9yYXRpb24vbXlBY3Rpdml0eVwiO1xuY29uc3QgQUNUSVZFVVNFUlMgPSBcIi9jb2xsYWJvcmF0aW9uL2FjdGl2ZVVzZXJzXCI7XG5jb25zdCBBQ1RJVklUSUVTID0gXCIvY29sbGFib3JhdGlvbi9hY3Rpdml0aWVzXCI7XG5jb25zdCBTWU5DR1JPVVBJRCA9IFwiJGF1dG8uc3luY1wiO1xuXG5leHBvcnQgY29uc3QgaXNDb25uZWN0ZWQgPSBmdW5jdGlvbiAoY29udHJvbDogQ29udHJvbCk6IGJvb2xlYW4ge1xuXHRjb25zdCBpbnRlcm5hbE1vZGVsID0gY29udHJvbC5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0cmV0dXJuIGlzQ29sbGFib3JhdGlvbkNvbm5lY3RlZChpbnRlcm5hbE1vZGVsKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZW5kID0gZnVuY3Rpb24gKFxuXHRjb250cm9sOiBDb250cm9sLFxuXHRhY3Rpb246IEFjdGl2aXR5LFxuXHRjb250ZW50OiBzdHJpbmcgfCBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcblx0dHJpZ2dlcmVkQWN0aW9uTmFtZT86IHN0cmluZyxcblx0cmVmcmVzaExpc3RCaW5kaW5nPzogYm9vbGVhbixcblx0YWN0aW9uUmVxdWVzdGVkUHJvcGVydGllcz86IHN0cmluZ1tdXG4pIHtcblx0aWYgKGlzQ29ubmVjdGVkKGNvbnRyb2wpKSB7XG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IGNvbnRyb2wuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0Y29uc3QgY2xpZW50Q29udGVudCA9IEFycmF5LmlzQXJyYXkoY29udGVudCkgPyBjb250ZW50LmpvaW4oXCJ8XCIpIDogY29udGVudDtcblx0XHRjb25zdCByZXF1ZXN0ZWRQcm9wZXJ0aWVzID0gYWN0aW9uUmVxdWVzdGVkUHJvcGVydGllcz8uam9pbihcInxcIik7XG5cdFx0Y29uc3QgbXlBY3Rpdml0eSA9IGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoTVlBQ1RJVklUWSk7XG5cdFx0aWYgKGFjdGlvbiA9PT0gQWN0aXZpdHkuTGl2ZUNoYW5nZSkge1xuXHRcdFx0Ly8gVG8gYXZvaWQgdW5uZWNlc3NhcnkgdHJhZmZpYyB3ZSBrZWVwIHRyYWNrIG9mIGxpdmUgY2hhbmdlcyBhbmQgc2VuZCBpdCBvbmx5IG9uY2VcblxuXHRcdFx0aWYgKG15QWN0aXZpdHkgPT09IGNsaWVudENvbnRlbnQpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShNWUFDVElWSVRZLCBjbGllbnRDb250ZW50KTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTm8gbmVlZCB0byBzZW5kIGFuIFVuZG8gbWVzc2FnZSBpZiB0aGVyZSdzIG5vIGN1cnJlbnQgYWN0aXZpdHlcblx0XHRcdGlmIChhY3Rpb24gPT09IEFjdGl2aXR5LlVuZG8gJiYgbXlBY3Rpdml0eSA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIHVzZXIgZmluaXNoZWQgdGhlIGFjdGl2aXR5XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KE1ZQUNUSVZJVFksIG51bGwpO1xuXHRcdH1cblxuXHRcdGJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlKGFjdGlvbiwgY2xpZW50Q29udGVudCwgaW50ZXJuYWxNb2RlbCwgdHJpZ2dlcmVkQWN0aW9uTmFtZSwgcmVmcmVzaExpc3RCaW5kaW5nLCByZXF1ZXN0ZWRQcm9wZXJ0aWVzKTtcblx0fVxufTtcblxuY29uc3QgZ2V0V2ViU29ja2V0QmFzZVVSTCA9IGZ1bmN0aW9uIChiaW5kaW5nQ29udGV4dDogQ29udGV4dCk6IHN0cmluZyB7XG5cdHJldHVybiBiaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLldlYlNvY2tldEJhc2VVUkxcIik7XG59O1xuXG5leHBvcnQgY29uc3QgaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IGZ1bmN0aW9uICh2aWV3OiBWaWV3KTogYm9vbGVhbiB7XG5cdGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gdmlldz8uZ2V0QmluZGluZ0NvbnRleHQgJiYgKHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KTtcblx0cmV0dXJuICEhKGJpbmRpbmdDb250ZXh0ICYmIGdldFdlYlNvY2tldEJhc2VVUkwoYmluZGluZ0NvbnRleHQpKTtcbn07XG5cbmV4cG9ydCBjb25zdCBjb25uZWN0ID0gYXN5bmMgZnVuY3Rpb24gKHZpZXc6IEZFVmlldykge1xuXHRjb25zdCBpbnRlcm5hbE1vZGVsID0gdmlldy5nZXRNb2RlbChcImludGVybmFsXCIpO1xuXHRjb25zdCBtZSA9IENvbGxhYm9yYXRpb25VdGlscy5nZXRNZSh2aWV3KTtcblxuXHQvLyBSZXRyaWV2aW5nIE1FIGZyb20gc2hlbGwgc2VydmljZVxuXHRpZiAoIW1lKSB7XG5cdFx0Ly8gbm8gbWUgPSBubyBzaGVsbCA9IG5vdCBzdXJlIHdoYXQgdG8gZG9cblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXHRjb25zdCB3ZWJTb2NrZXRCYXNlVVJMID0gZ2V0V2ViU29ja2V0QmFzZVVSTChiaW5kaW5nQ29udGV4dCk7XG5cdGNvbnN0IHNlcnZpY2VVcmwgPSBiaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldFNlcnZpY2VVcmwoKTtcblxuXHRpZiAoIXdlYlNvY2tldEJhc2VVUkwpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBzRHJhZnRVVUlEID0gYXdhaXQgYmluZGluZ0NvbnRleHQucmVxdWVzdFByb3BlcnR5KFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRVVUlEXCIpO1xuXHRpZiAoIXNEcmFmdFVVSUQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpbml0aWFsaXplQ29sbGFib3JhdGlvbihtZSwgd2ViU29ja2V0QmFzZVVSTCwgc0RyYWZ0VVVJRCwgc2VydmljZVVybCwgaW50ZXJuYWxNb2RlbCwgKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IHtcblx0XHRtZXNzYWdlUmVjZWl2ZShtZXNzYWdlLCB2aWV3KTtcblx0fSk7XG5cdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoTVlBQ1RJVklUWSwgbnVsbCk7XG59O1xuXG5leHBvcnQgY29uc3QgZGlzY29ubmVjdCA9IGZ1bmN0aW9uIChjb250cm9sOiBDb250cm9sKSB7XG5cdGNvbnN0IGludGVybmFsTW9kZWwgPSBjb250cm9sLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHRlbmRDb2xsYWJvcmF0aW9uKGludGVybmFsTW9kZWwpO1xufTtcblxuLyoqXG4gKiBDYWxsYmFjayB3aGVuIGEgbWVzc2FnZSBpcyByZWNlaXZlZCBmcm9tIHRoZSB3ZWJzb2NrZXQuXG4gKlxuICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UgcmVjZWl2ZWRcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoYXQgd2FzIHVzZWQgaW5pdGlhbGx5IHdoZW4gY29ubmVjdGluZyB0aGUgd2Vic29ja2V0XG4gKi9cbmZ1bmN0aW9uIG1lc3NhZ2VSZWNlaXZlKG1lc3NhZ2U6IE1lc3NhZ2UsIHZpZXc6IEZFVmlldykge1xuXHRjb25zdCBpbnRlcm5hbE1vZGVsOiBhbnkgPSB2aWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIik7XG5cdGxldCBhY3RpdmVVc2VyczogVXNlcltdID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVkVVU0VSUyk7XG5cdGxldCBhY3Rpdml0aWVzOiBVc2VyQWN0aXZpdHlbXTtcblx0bGV0IGFjdGl2aXR5S2V5OiBzdHJpbmc7XG5cdGNvbnN0IG1ldGFQYXRoID0gY2FsY3VsYXRlTWV0YVBhdGgodmlldywgbWVzc2FnZS5jbGllbnRDb250ZW50KTtcblx0bWVzc2FnZS51c2VyQWN0aW9uID0gbWVzc2FnZS51c2VyQWN0aW9uIHx8IG1lc3NhZ2UuY2xpZW50QWN0aW9uO1xuXG5cdGNvbnN0IHNlbmRlcjogVXNlciA9IHtcblx0XHRpZDogbWVzc2FnZS51c2VySUQsXG5cdFx0bmFtZTogbWVzc2FnZS51c2VyRGVzY3JpcHRpb24sXG5cdFx0aW5pdGlhbHM6IENvbGxhYm9yYXRpb25VdGlscy5mb3JtYXRJbml0aWFscyhtZXNzYWdlLnVzZXJEZXNjcmlwdGlvbiksXG5cdFx0Y29sb3I6IENvbGxhYm9yYXRpb25VdGlscy5nZXRVc2VyQ29sb3IobWVzc2FnZS51c2VySUQsIGFjdGl2ZVVzZXJzLCBbXSlcblx0fTtcblxuXHRsZXQgbWFjdGl2aXR5OiBVc2VyQWN0aXZpdHkgPSBzZW5kZXI7XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGRlZmF1bHQtY2FzZVxuXHRzd2l0Y2ggKG1lc3NhZ2UudXNlckFjdGlvbikge1xuXHRcdGNhc2UgQWN0aXZpdHkuSm9pbjpcblx0XHRjYXNlIEFjdGl2aXR5LkpvaW5FY2hvOlxuXHRcdFx0aWYgKGFjdGl2ZVVzZXJzLmZpbmRJbmRleCgodXNlcikgPT4gdXNlci5pZCA9PT0gc2VuZGVyLmlkKSA9PT0gLTEpIHtcblx0XHRcdFx0YWN0aXZlVXNlcnMudW5zaGlmdChzZW5kZXIpO1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KEFDVElWRVVTRVJTLCBhY3RpdmVVc2Vycyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtZXNzYWdlLnVzZXJBY3Rpb24gPT09IEFjdGl2aXR5LkpvaW4pIHtcblx0XHRcdFx0Ly8gd2UgZWNobyBvdXIgZXhpc3RlbmNlIHRvIHRoZSBuZXdseSBlbnRlcmVkIHVzZXIgYW5kIGFsc28gc2VuZCB0aGUgY3VycmVudCBhY3Rpdml0eSBpZiB0aGVyZSBpcyBhbnlcblx0XHRcdFx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UoQWN0aXZpdHkuSm9pbkVjaG8sIGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoTVlBQ1RJVklUWSksIGludGVybmFsTW9kZWwpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobWVzc2FnZS51c2VyQWN0aW9uID09PSBBY3Rpdml0eS5Kb2luRWNobykge1xuXHRcdFx0XHRpZiAobWVzc2FnZS5jbGllbnRDb250ZW50KSB7XG5cdFx0XHRcdFx0Ly8gYW5vdGhlciB1c2VyIHdhcyBhbHJlYWR5IHR5cGluZyB0aGVyZWZvcmUgSSB3YW50IHRvIHNlZSBoaXMgYWN0aXZpdHkgaW1tZWRpYXRlbHkuIENhbGxpbmcgbWUgYWdhaW4gYXMgYSBsaXZlIGNoYW5nZVxuXHRcdFx0XHRcdG1lc3NhZ2UudXNlckFjdGlvbiA9IEFjdGl2aXR5LkxpdmVDaGFuZ2U7XG5cdFx0XHRcdFx0bWVzc2FnZVJlY2VpdmUobWVzc2FnZSwgdmlldyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIEFjdGl2aXR5LkxlYXZlOlxuXHRcdFx0Ly8gUmVtb3ZpbmcgdGhlIGFjdGl2ZSB1c2VyLiBOb3QgcmVtb3ZpbmcgXCJtZVwiIGlmIEkgaGFkIHRoZSBzY3JlZW4gb3BlbiBpbiBhbm90aGVyIHNlc3Npb25cblx0XHRcdGFjdGl2ZVVzZXJzID0gYWN0aXZlVXNlcnMuZmlsdGVyKCh1c2VyKSA9PiB1c2VyLmlkICE9PSBzZW5kZXIuaWQgfHwgdXNlci5tZSk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KEFDVElWRVVTRVJTLCBhY3RpdmVVc2Vycyk7XG5cdFx0XHRjb25zdCBhbGxBY3Rpdml0aWVzID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVklUSUVTKSB8fCB7fTtcblx0XHRcdGNvbnN0IHJlbW92ZVVzZXJBY3Rpdml0aWVzID0gZnVuY3Rpb24gKGJhZzogYW55KSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGJhZykpIHtcblx0XHRcdFx0XHRyZXR1cm4gYmFnLmZpbHRlcigoYWN0aXZpdHkpID0+IGFjdGl2aXR5LmlkICE9PSBzZW5kZXIuaWQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgcCBpbiBiYWcpIHtcblx0XHRcdFx0XHRcdGJhZ1twXSA9IHJlbW92ZVVzZXJBY3Rpdml0aWVzKGJhZ1twXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBiYWc7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRyZW1vdmVVc2VyQWN0aXZpdGllcyhhbGxBY3Rpdml0aWVzKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUywgYWxsQWN0aXZpdGllcyk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgQWN0aXZpdHkuQ2hhbmdlOlxuXHRcdFx0dXBkYXRlT25DaGFuZ2UodmlldywgbWVzc2FnZSk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgQWN0aXZpdHkuQ3JlYXRlOlxuXHRcdFx0Ly8gRm9yIGNyZWF0ZSB3ZSBhY3R1YWxseSBqdXN0IG5lZWQgdG8gcmVmcmVzaCB0aGUgdGFibGVcblx0XHRcdHVwZGF0ZU9uQ3JlYXRlKHZpZXcsIG1lc3NhZ2UpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIEFjdGl2aXR5LkRlbGV0ZTpcblx0XHRcdC8vIEZvciBub3cgYWxzbyByZWZyZXNoIHRoZSBwYWdlIGJ1dCBpbiBjYXNlIG9mIGRlbGV0aW9uIHdlIG5lZWQgdG8gaW5mb3JtIHRoZSB1c2VyXG5cdFx0XHR1cGRhdGVPbkRlbGV0ZSh2aWV3LCBtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBBY3Rpdml0eS5BY3RpdmF0ZTpcblx0XHRcdGRyYWZ0Q2xvc2VkQnlPdGhlclVzZXIodmlldywgbWVzc2FnZS5jbGllbnRDb250ZW50LCBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0VGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0FDVElWQVRFXCIsIHNlbmRlci5uYW1lKSk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgQWN0aXZpdHkuRGlzY2FyZDpcblx0XHRcdGRyYWZ0Q2xvc2VkQnlPdGhlclVzZXIodmlldywgbWVzc2FnZS5jbGllbnRDb250ZW50LCBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0VGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0RJU0NBUkRcIiwgc2VuZGVyLm5hbWUpKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBBY3Rpdml0eS5BY3Rpb246XG5cdFx0XHR1cGRhdGVPbkFjdGlvbih2aWV3LCBtZXNzYWdlKTtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBBY3Rpdml0eS5MaXZlQ2hhbmdlOlxuXHRcdFx0bWFjdGl2aXR5ID0gc2VuZGVyO1xuXHRcdFx0bWFjdGl2aXR5LmtleSA9IGdldEFjdGl2aXR5S2V5RnJvbVBhdGgobWVzc2FnZS5jbGllbnRDb250ZW50KTtcblxuXHRcdFx0Ly8gc3R1cGlkIEpTT04gbW9kZWwuLi5cblx0XHRcdGxldCBpbml0SlNPTk1vZGVsOiBzdHJpbmcgPSBcIlwiO1xuXHRcdFx0Y29uc3QgcGFydHMgPSBtZXRhUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRmb3IgKGxldCBpID0gMTsgaSA8IHBhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuXHRcdFx0XHRpbml0SlNPTk1vZGVsICs9IGAvJHtwYXJ0c1tpXX1gO1xuXHRcdFx0XHRpZiAoIWludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoQUNUSVZJVElFUyArIGluaXRKU09OTW9kZWwpKSB7XG5cdFx0XHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShBQ1RJVklUSUVTICsgaW5pdEpTT05Nb2RlbCwge30pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGFjdGl2aXRpZXMgPSBpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KEFDVElWSVRJRVMgKyBtZXRhUGF0aCk7XG5cdFx0XHRhY3Rpdml0aWVzID0gYWN0aXZpdGllcz8uc2xpY2UgPyBhY3Rpdml0aWVzLnNsaWNlKCkgOiBbXTtcblx0XHRcdGFjdGl2aXRpZXMucHVzaChtYWN0aXZpdHkpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShBQ1RJVklUSUVTICsgbWV0YVBhdGgsIGFjdGl2aXRpZXMpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIEFjdGl2aXR5LlVuZG86XG5cdFx0XHQvLyBUaGUgdXNlciBkaWQgYSBjaGFuZ2UgYnV0IHJldmVydGVkIGl0LCB0aGVyZWZvcmUgdW5ibG9jayB0aGUgY29udHJvbFxuXHRcdFx0YWN0aXZpdGllcyA9IGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoQUNUSVZJVElFUyArIG1ldGFQYXRoKTtcblx0XHRcdGFjdGl2aXR5S2V5ID0gZ2V0QWN0aXZpdHlLZXlGcm9tUGF0aChtZXNzYWdlLmNsaWVudENvbnRlbnQpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcblx0XHRcdFx0QUNUSVZJVElFUyArIG1ldGFQYXRoLFxuXHRcdFx0XHRhY3Rpdml0aWVzLmZpbHRlcigoYSkgPT4gYS5rZXkgIT09IGFjdGl2aXR5S2V5KVxuXHRcdFx0KTtcblx0XHRcdGJyZWFrO1xuXHR9XG59XG5cbi8qKlxuICogRGlzcGxheXMgYSBtZXNzYWdlIHRoYXQgdGhlIGN1cnJlbnQgZHJhZnQgd2FzIGNsb3NlZCBiZSBhbm90aGVyIHVzZXIsIGFuZCBuYXZpZ2F0ZXMgYmFjayB0byBhIHByb3BlciB2aWV3LlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoYXQgd2FzIHVzZWQgaW5pdGlhbGx5IHdoZW4gY29ubmVjdGluZyB0aGUgd2Vic29ja2V0XG4gKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBvZiB0aGUgY29udGV4dCB0byBuYXZpZ2F0ZSB0b1xuICogQHBhcmFtIG1lc3NhZ2VUZXh0IFRoZSBtZXNzYWdlIHRvIGRpc3BsYXlcbiAqL1xuZnVuY3Rpb24gZHJhZnRDbG9zZWRCeU90aGVyVXNlcih2aWV3OiBGRVZpZXcsIHBhdGg6IHN0cmluZywgbWVzc2FnZVRleHQ6IHN0cmluZykge1xuXHRkaXNjb25uZWN0KHZpZXcpO1xuXHRNZXNzYWdlQm94LmluZm9ybWF0aW9uKG1lc3NhZ2VUZXh0KTtcblx0KHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KVxuXHRcdC5nZXRCaW5kaW5nKClcblx0XHQucmVzZXRDaGFuZ2VzKClcblx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRuYXZpZ2F0ZShwYXRoLCB2aWV3KTtcblx0XHR9KVxuXHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJQZW5kaW5nIENoYW5nZXMgY291bGQgbm90IGJlIHJlc2V0IC0gc3RpbGwgbmF2aWdhdGluZyB0byBhY3RpdmUgaW5zdGFuY2VcIik7XG5cdFx0XHRuYXZpZ2F0ZShwYXRoLCB2aWV3KTtcblx0XHR9KTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIGRhdGEgd2hlbiBhIENIQU5HRSBtZXNzYWdlIGhhcyBiZWVuIHJlY2VpdmVkLlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoYXQgd2FzIHVzZWQgaW5pdGlhbGx5IHdoZW4gY29ubmVjdGluZyB0aGUgd2Vic29ja2V0XG4gKiBAcGFyYW0gbWVzc2FnZSBUaGUgbWVzc2FnZSByZWNlaXZlZCBmcm9tIHRoZSB3ZWJzb2NrZXRcbiAqL1xuZnVuY3Rpb24gdXBkYXRlT25DaGFuZ2UodmlldzogRkVWaWV3LCBtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdGNvbnN0IHVwZGF0ZWRPYmplY3RzUGF0aHMgPSBtZXNzYWdlLmNsaWVudENvbnRlbnQuc3BsaXQoXCJ8XCIpO1xuXHRjb25zdCBtZXRhTW9kZWwgPSB2aWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdGNvbnN0IGludGVybmFsTW9kZWwgPSB2aWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIik7XG5cblx0Ly8gUmVtb3ZlIGFsbCBsb2NrcyBjb3JyZXNwb25kaW5nIHRvIHRoZSBwYXRoc1xuXHR1cGRhdGVkT2JqZWN0c1BhdGhzLmZvckVhY2goKHVwZGF0ZWRQYXRoKSA9PiB7XG5cdFx0Y29uc3QgdXBkYXRlZE1ldGFQYXRoID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKHVwZGF0ZWRQYXRoKTtcblx0XHRjb25zdCBhY3Rpdml0eUtleSA9IGdldEFjdGl2aXR5S2V5RnJvbVBhdGgodXBkYXRlZFBhdGgpO1xuXHRcdGxldCBjdXJyZW50QWN0aXZpdGllczogYW55W10gPSBpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KEFDVElWSVRJRVMgKyB1cGRhdGVkTWV0YVBhdGgpIHx8IFtdO1xuXHRcdGN1cnJlbnRBY3Rpdml0aWVzID0gY3VycmVudEFjdGl2aXRpZXM/LmZpbHRlciAmJiBjdXJyZW50QWN0aXZpdGllcy5maWx0ZXIoKGFjdGl2aXR5KSA9PiBhY3Rpdml0eS5rZXkgIT09IGFjdGl2aXR5S2V5KTtcblx0XHRpZiAoY3VycmVudEFjdGl2aXRpZXMpIHtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUyArIHVwZGF0ZWRNZXRhUGF0aCwgY3VycmVudEFjdGl2aXRpZXMpO1xuXHRcdH1cblx0fSk7XG5cblx0Y29uc3QgY3VycmVudFBhZ2UgPSBnZXRDdXJyZW50UGFnZSh2aWV3KTtcblx0Y29uc3QgY3VycmVudENvbnRleHQgPSBjdXJyZW50UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdGNvbnN0IHJlcXVlc3RQcm9taXNlcyA9IHVwZGF0ZWRPYmplY3RzUGF0aHMubWFwKChwYXRoKSA9PiBhcHBseVVwZGF0ZXNGb3JDaGFuZ2UodmlldywgcGF0aCkpO1xuXG5cdC8vIFNpbXVsYXRlIGFueSBjaGFuZ2Ugc28gdGhlIGVkaXQgZmxvdyBzaG93cyB0aGUgZHJhZnQgaW5kaWNhdG9yIGFuZCBzZXRzIHRoZSBwYWdlIHRvIGRpcnR5XG5cdGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5lZGl0Rmxvdy51cGRhdGVEb2N1bWVudChjdXJyZW50Q29udGV4dCwgUHJvbWlzZS5hbGwocmVxdWVzdFByb21pc2VzKSk7XG59XG5cbi8qKlxuICogVXBkYXRlcyBkYXRhIGNvcnJlc3BvbmRpbmcgdG8gYSBwYXRoLlxuICpcbiAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoYXQgd2FzIHVzZWQgaW5pdGlhbGx5IHdoZW4gY29ubmVjdGluZyB0aGUgd2Vic29ja2V0XG4gKiBAcGFyYW0gcHJvcGVydHlQYXRoRm9yVXBkYXRlIEFic29sdXRlIHBhdGggdG8gdGhlIHVwZGF0ZWQgcHJvcGVydHlcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSByZXNvbHZlZCB3aGVuIHRoZSBkYXRhIGFuZCBpdHMgcmVsYXRlZCBzaWRlIGVmZmVjdHMgaGF2ZSBiZWVuIHJlY2VpdmVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGFwcGx5VXBkYXRlc0ZvckNoYW5nZSh2aWV3OiBGRVZpZXcsIHByb3BlcnR5UGF0aEZvclVwZGF0ZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG5cdGNvbnN0IG1ldGFNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0Y29uc3QgbWV0YUNvbnRleHQgPSBtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQocHJvcGVydHlQYXRoRm9yVXBkYXRlKTtcblx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0ID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhtZXRhQ29udGV4dCk7XG5cdGNvbnN0IHRhcmdldENvbnRleHRQYXRoID0gcHJvcGVydHlQYXRoRm9yVXBkYXRlLnN1YnN0cmluZygwLCBwcm9wZXJ0eVBhdGhGb3JVcGRhdGUubGFzdEluZGV4T2YoXCIvXCIpKTsgLy8gUmVtb3ZlIHByb3BlcnR5IG5hbWVcblx0Y29uc3QgdGFyZ2V0Q29udGV4dCA9IGZpbmRDb250ZXh0Rm9yVXBkYXRlKHZpZXcsIHRhcmdldENvbnRleHRQYXRoKTtcblx0Y29uc3QgcGFyZW50Q29sbGVjdGlvblBhdGggPSB0YXJnZXRDb250ZXh0UGF0aC5zdWJzdHJpbmcoMCwgdGFyZ2V0Q29udGV4dFBhdGgubGFzdEluZGV4T2YoXCIoXCIpKTtcblx0Y29uc3QgcGFyZW50Q29udGV4dFBhdGggPSBwYXJlbnRDb2xsZWN0aW9uUGF0aC5zdWJzdHJpbmcoMCwgcGFyZW50Q29sbGVjdGlvblBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0Y29uc3QgcGFyZW50Q29udGV4dCA9IHBhcmVudENvbnRleHRQYXRoID8gZmluZENvbnRleHRGb3JVcGRhdGUodmlldywgcGFyZW50Q29udGV4dFBhdGgpIDogdW5kZWZpbmVkO1xuXG5cdGlmICghdGFyZ2V0Q29udGV4dCAmJiAhcGFyZW50Q29udGV4dCkge1xuXHRcdHJldHVybjsgLy8gTm8gY29udGV4dCBmb3IgdXBkYXRlXG5cdH1cblxuXHR0cnkge1xuXHRcdGNvbnN0IHNpZGVFZmZlY3RzUHJvbWlzZXM6IFByb21pc2U8YW55PltdID0gW107XG5cdFx0Y29uc3Qgc2lkZUVmZmVjdHNTZXJ2aWNlID0gQ29sbGFib3JhdGlvblV0aWxzLmdldEFwcENvbXBvbmVudCh2aWV3KS5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblxuXHRcdGlmICh0YXJnZXRDb250ZXh0KSB7XG5cdFx0XHQvLyBXZSBoYXZlIGEgdGFyZ2V0IGNvbnRleHQsIHNvIHdlIGNhbiByZXRyaWV2ZSB0aGUgdXBkYXRlZCBwcm9wZXJ0eVxuXHRcdFx0Y29uc3QgdGFyZ2V0TWV0YVBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgodGFyZ2V0Q29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0Y29uc3QgcmVsYXRpdmVNZXRhUGF0aEZvclVwZGF0ZSA9IG1ldGFNb2RlbC5nZXRNZXRhUGF0aChwcm9wZXJ0eVBhdGhGb3JVcGRhdGUpLnJlcGxhY2UodGFyZ2V0TWV0YVBhdGgsIFwiXCIpLnNsaWNlKDEpO1xuXHRcdFx0c2lkZUVmZmVjdHNQcm9taXNlcy5wdXNoKHNpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHMoW3JlbGF0aXZlTWV0YVBhdGhGb3JVcGRhdGVdLCB0YXJnZXRDb250ZXh0LCBTWU5DR1JPVVBJRCkpO1xuXHRcdH1cblxuXHRcdC8vIEdldCB0aGUgZmllbGRHcm91cElkcyBjb3JyZXNwb25kaW5nIHRvIHBhdGhGb3JVcGRhdGVcblx0XHRjb25zdCBmaWVsZEdyb3VwSWRzID0gc2lkZUVmZmVjdHNTZXJ2aWNlLmNvbXB1dGVGaWVsZEdyb3VwSWRzKFxuXHRcdFx0ZGF0YU1vZGVsT2JqZWN0LnRhcmdldEVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0ZGF0YU1vZGVsT2JqZWN0LnRhcmdldE9iamVjdC5mdWxseVF1YWxpZmllZE5hbWVcblx0XHQpO1xuXG5cdFx0Ly8gRXhlY3V0ZSB0aGUgc2lkZSBlZmZlY3RzIGZvciB0aGUgZmllbGRHcm91cElkc1xuXHRcdGlmIChmaWVsZEdyb3VwSWRzLmxlbmd0aCkge1xuXHRcdFx0Y29uc3QgcGFnZUNvbnRyb2xsZXIgPSB2aWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cCA9IHBhZ2VDb250cm9sbGVyLl9zaWRlRWZmZWN0cy5nZXRTaWRlRWZmZWN0c01hcEZvckZpZWxkR3JvdXBzKFxuXHRcdFx0XHRmaWVsZEdyb3VwSWRzLFxuXHRcdFx0XHR0YXJnZXRDb250ZXh0IHx8IHBhcmVudENvbnRleHRcblx0XHRcdCkgYXMgRmllbGRTaWRlRWZmZWN0RGljdGlvbmFyeTtcblx0XHRcdE9iamVjdC5rZXlzKHNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cCkuZm9yRWFjaCgoc2lkZUVmZmVjdE5hbWUpID0+IHtcblx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdCA9IHNpZGVFZmZlY3RzTWFwRm9yRmllbGRHcm91cFtzaWRlRWZmZWN0TmFtZV07XG5cdFx0XHRcdHNpZGVFZmZlY3RzUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRwYWdlQ29udHJvbGxlci5fc2lkZUVmZmVjdHMucmVxdWVzdFNpZGVFZmZlY3RzKHNpZGVFZmZlY3Quc2lkZUVmZmVjdHMsIHNpZGVFZmZlY3QuY29udGV4dCwgU1lOQ0dST1VQSUQpXG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRhd2FpdCBQcm9taXNlLmFsbChzaWRlRWZmZWN0c1Byb21pc2VzKTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0TG9nLmVycm9yKFwiRmFpbGVkIHRvIHVwZGF0ZSBkYXRhIGFmdGVyIGNoYW5nZTpcIiArIGVycik7XG5cdFx0dGhyb3cgZXJyO1xuXHR9XG59XG5cbi8qKlxuICogVXBkYXRlcyBkYXRhIHdoZW4gYSBERUxFVEUgbWVzc2FnZSBoYXMgYmVlbiByZWNlaXZlZC5cbiAqXG4gKiBAcGFyYW0gdmlldyBUaGUgdmlldyB0aGF0IHdhcyB1c2VkIGluaXRpYWxseSB3aGVuIGNvbm5lY3RpbmcgdGhlIHdlYnNvY2tldFxuICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UgcmVjZWl2ZWQgZnJvbSB0aGUgd2Vic29ja2V0XG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZU9uRGVsZXRlKHZpZXc6IFZpZXcsIG1lc3NhZ2U6IE1lc3NhZ2UpIHtcblx0Y29uc3QgY3VycmVudFBhZ2UgPSBnZXRDdXJyZW50UGFnZSh2aWV3KTtcblx0Y29uc3QgY3VycmVudENvbnRleHQgPSBjdXJyZW50UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdGNvbnN0IGN1cnJlbnRQYXRoID0gY3VycmVudENvbnRleHQuZ2V0UGF0aCgpO1xuXG5cdGNvbnN0IGRlbGV0ZWRPYmplY3RQYXRocyA9IG1lc3NhZ2UuY2xpZW50Q29udGVudC5zcGxpdChcInxcIik7XG5cblx0Ly8gY2hlY2sgaWYgdXNlciBjdXJyZW50bHkgZGlzcGxheXMgYSBkZWxldGVkIG9iamVjdCBvciBvbmUgb2YgaXRzIGRlc2NlbmRhbnRzXG5cdGNvbnN0IGRlbGV0ZWRQYXRoSW5Vc2UgPSBkZWxldGVkT2JqZWN0UGF0aHMuZmluZCgoZGVsZXRlZFBhdGgpID0+IGN1cnJlbnRQYXRoLnN0YXJ0c1dpdGgoZGVsZXRlZFBhdGgpKTtcblx0aWYgKGRlbGV0ZWRQYXRoSW5Vc2UpIHtcblx0XHQvLyBhbnkgb3RoZXIgdXNlciBkZWxldGVkIHRoZSBvYmplY3QgSSdtIGN1cnJlbnRseSBsb29raW5nIGF0LiBJbmZvcm0gdGhlIHVzZXIgd2Ugd2lsbCBuYXZpZ2F0ZSB0byByb290IG5vd1xuXHRcdE1lc3NhZ2VCb3guaW5mb3JtYXRpb24oQ29sbGFib3JhdGlvblV0aWxzLmdldFRleHQoXCJDX0NPTExBQk9SQVRJT05EUkFGVF9ERUxFVEVcIiwgbWVzc2FnZS51c2VyRGVzY3JpcHRpb24pLCB7XG5cdFx0XHRvbkNsb3NlOiAoKSA9PiB7XG5cdFx0XHRcdC8vIFdlIHJldHJpZXZlIHRoZSBkZWxldGVkIGNvbnRleHQgYXMgYSBrZWVwLWFsaXZlLCBhbmQgZGlzYWJsZSBpdHMga2VlcGFsaXZlIHN0YXR1cyxcblx0XHRcdFx0Ly8gc28gdGhhdCBpdCBpcyBwcm9wZXJseSBkZXN0cm95ZWQgd2hlbiByZWZyZXNoaW5nIGRhdGFcblx0XHRcdFx0Y29uc3QgdGFyZ2V0Q29udGV4dCA9IGN1cnJlbnRDb250ZXh0LmdldE1vZGVsKCkuZ2V0S2VlcEFsaXZlQ29udGV4dChkZWxldGVkUGF0aEluVXNlKTtcblx0XHRcdFx0dGFyZ2V0Q29udGV4dC5zZXRLZWVwQWxpdmUoZmFsc2UpO1xuXHRcdFx0XHRjb25zdCByZXF1ZXN0UHJvbWlzZSA9IGFwcGx5VXBkYXRlc0ZvckNvbGxlY3Rpb24odmlldywgZGVsZXRlZE9iamVjdFBhdGhzWzBdKTtcblx0XHRcdFx0Y3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlcigpLmVkaXRGbG93LnVwZGF0ZURvY3VtZW50KGN1cnJlbnRQYWdlLmdldEJpbmRpbmdDb250ZXh0KCksIHJlcXVlc3RQcm9taXNlKTtcblx0XHRcdFx0KGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX3JvdXRpbmcubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQodGFyZ2V0Q29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgcmVxdWVzdFByb21pc2UgPSBhcHBseVVwZGF0ZXNGb3JDb2xsZWN0aW9uKHZpZXcsIGRlbGV0ZWRPYmplY3RQYXRoc1swXSk7XG5cdFx0Y3VycmVudFBhZ2UuZ2V0Q29udHJvbGxlcigpLmVkaXRGbG93LnVwZGF0ZURvY3VtZW50KGN1cnJlbnRQYWdlLmdldEJpbmRpbmdDb250ZXh0KCksIHJlcXVlc3RQcm9taXNlKTtcblx0fVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgZGF0YSB3aGVuIGEgQ1JFQVRFIG1lc3NhZ2UgaGFzIGJlZW4gcmVjZWl2ZWQuXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgdGhhdCB3YXMgdXNlZCBpbml0aWFsbHkgd2hlbiBjb25uZWN0aW5nIHRoZSB3ZWJzb2NrZXRcbiAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlIHJlY2VpdmVkIGZyb20gdGhlIHdlYnNvY2tldFxuICovXG5mdW5jdGlvbiB1cGRhdGVPbkNyZWF0ZSh2aWV3OiBWaWV3LCBtZXNzYWdlOiBNZXNzYWdlKSB7XG5cdGNvbnN0IGN1cnJlbnRQYWdlID0gZ2V0Q3VycmVudFBhZ2Uodmlldyk7XG5cdGNvbnN0IGNyZWF0ZWRPYmplY3RQYXRocyA9IG1lc3NhZ2UuY2xpZW50Q29udGVudC5zcGxpdChcInxcIik7XG5cblx0Y29uc3QgcmVxdWVzdFByb21pc2UgPSBhcHBseVVwZGF0ZXNGb3JDb2xsZWN0aW9uKHZpZXcsIGNyZWF0ZWRPYmplY3RQYXRoc1swXSk7XG5cdC8vIFNpbXVsYXRlIGEgY2hhbmdlIHNvIHRoZSBlZGl0IGZsb3cgc2hvd3MgdGhlIGRyYWZ0IGluZGljYXRvciBhbmQgc2V0cyB0aGUgcGFnZSB0byBkaXJ0eVxuXHRjdXJyZW50UGFnZS5nZXRDb250cm9sbGVyKCkuZWRpdEZsb3cudXBkYXRlRG9jdW1lbnQoY3VycmVudFBhZ2UuZ2V0QmluZGluZ0NvbnRleHQoKSwgcmVxdWVzdFByb21pc2UpO1xufVxuXG4vKipcbiAqIFVwZGF0ZXMgZGF0YSBpbiBhIGNvbGxlY3Rpb24uXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgdGhhdCB3YXMgdXNlZCBpbml0aWFsbHkgd2hlbiBjb25uZWN0aW5nIHRoZSB3ZWJzb2NrZXRcbiAqIEBwYXJhbSBwYXRoSW5Db2xsZWN0aW9uIEEgcGF0aCB0byBhbiBlbnRpdHkgaW4gdGhlIGNvbGxlY3Rpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gYXBwbHlVcGRhdGVzRm9yQ29sbGVjdGlvbih2aWV3OiBWaWV3LCBwYXRoSW5Db2xsZWN0aW9uOiBzdHJpbmcpIHtcblx0Y29uc3QgYXBwQ29tcG9uZW50ID0gQ29sbGFib3JhdGlvblV0aWxzLmdldEFwcENvbXBvbmVudCh2aWV3KTtcblx0Y29uc3QgcGFyZW50UGF0aCA9IHBhdGhJbkNvbGxlY3Rpb24uc3Vic3RyaW5nKDAsIHBhdGhJbkNvbGxlY3Rpb24ubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0Y29uc3QgcGFyZW50Q29udGV4dCA9IGZpbmRDb250ZXh0Rm9yVXBkYXRlKHZpZXcsIHBhcmVudFBhdGgpO1xuXG5cdGlmIChwYXJlbnRDb250ZXh0KSB7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzUHJvbWlzZXM6IFByb21pc2U8YW55PltdID0gW107XG5cblx0XHRcdGNvbnN0IG1ldGFNb2RlbCA9IHBhcmVudENvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IG1ldGFQYXRoRm9yVXBkYXRlID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKHBhdGhJbkNvbGxlY3Rpb24pO1xuXHRcdFx0Y29uc3QgcGFyZW50TWV0YVBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgocGFyZW50Q29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0Y29uc3QgcmVsYXRpdmVQYXRoID0gbWV0YVBhdGhGb3JVcGRhdGUucmVwbGFjZShgJHtwYXJlbnRNZXRhUGF0aH0vYCwgXCJcIik7XG5cblx0XHRcdC8vIFJlbG9hZCB0aGUgY29sbGVjdGlvblxuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdHNTZXJ2aWNlID0gYXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRcdFx0c2lkZUVmZmVjdHNQcm9taXNlcy5wdXNoKHNpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHMoW3JlbGF0aXZlUGF0aF0sIHBhcmVudENvbnRleHQsIFNZTkNHUk9VUElEKSk7XG5cblx0XHRcdC8vIFJlcXVlc3QgdGhlIHNpZGUgZWZmZWN0cyBmb3IgdGhlIGNvbGxlY3Rpb25cblx0XHRcdHNpZGVFZmZlY3RzUHJvbWlzZXMucHVzaChzaWRlRWZmZWN0c1NlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5KHJlbGF0aXZlUGF0aCwgcGFyZW50Q29udGV4dCwgU1lOQ0dST1VQSUQpKTtcblxuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoc2lkZUVmZmVjdHNQcm9taXNlcyk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJGYWlsZWQgdG8gdXBkYXRlIGRhdGEgYWZ0ZXIgY29sbGVjdGlvbiB1cGRhdGU6XCIgKyBlcnIpO1xuXHRcdH1cblx0fVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgZGF0YSB3aGVuIGEgQUNUSU9OIG1lc3NhZ2UgaGFzIGJlZW4gcmVjZWl2ZWQuXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgdGhhdCB3YXMgdXNlZCBpbml0aWFsbHkgd2hlbiBjb25uZWN0aW5nIHRoZSB3ZWJzb2NrZXRcbiAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlIHJlY2VpdmVkIGZyb20gdGhlIHdlYnNvY2tldFxuICovXG5mdW5jdGlvbiB1cGRhdGVPbkFjdGlvbih2aWV3OiBGRVZpZXcsIG1lc3NhZ2U6IE1lc3NhZ2UpIHtcblx0Y29uc3QgY3VycmVudFBhZ2UgPSBnZXRDdXJyZW50UGFnZSh2aWV3KTtcblx0Y29uc3QgcGF0aHNGb3JBY3Rpb24gPSBtZXNzYWdlLmNsaWVudENvbnRlbnQuc3BsaXQoXCJ8XCIpO1xuXHRjb25zdCBhY3Rpb25OYW1lID0gbWVzc2FnZS5jbGllbnRUcmlnZ2VyZWRBY3Rpb25OYW1lIHx8IFwiXCI7XG5cdGNvbnN0IHJlcXVlc3RlZFByb3BlcnRpZXMgPSBtZXNzYWdlLmNsaWVudFJlcXVlc3RlZFByb3BlcnRpZXM/LnNwbGl0KFwifFwiKTtcblx0Y29uc3QgcmVmcmVzaExpc3RCaW5kaW5nID0gbWVzc2FnZS5jbGllbnRSZWZyZXNoTGlzdEJpbmRpbmcgPT09IFwidHJ1ZVwiO1xuXG5cdGxldCByZXF1ZXN0UHJvbWlzZXM6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXG5cdGlmIChyZWZyZXNoTGlzdEJpbmRpbmcpIHtcblx0XHRyZXF1ZXN0UHJvbWlzZXMucHVzaChhcHBseVVwZGF0ZXNGb3JDb2xsZWN0aW9uKHZpZXcsIHBhdGhzRm9yQWN0aW9uWzBdKSk7XG5cdH0gZWxzZSB7XG5cdFx0cmVxdWVzdFByb21pc2VzID0gcGF0aHNGb3JBY3Rpb24ubWFwKChwYXRoKSA9PiByZXF1ZXN0VXBkYXRlRm9yQWN0aW9uKHZpZXcsIHBhdGgsIGFjdGlvbk5hbWUsIHJlcXVlc3RlZFByb3BlcnRpZXMpKTtcblx0fVxuXG5cdC8vIFNpbXVsYXRlIGFueSBjaGFuZ2Ugc28gdGhlIGVkaXQgZmxvdyBzaG93cyB0aGUgZHJhZnQgaW5kaWNhdG9yIGFuZCBzZXRzIHRoZSBwYWdlIHRvIGRpcnR5XG5cdGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5lZGl0Rmxvdy51cGRhdGVEb2N1bWVudChjdXJyZW50UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpLCBQcm9taXNlLmFsbChyZXF1ZXN0UHJvbWlzZXMpKTtcbn1cblxuLyoqXG4gKiBVcGRhdGVzIHNpZGUtZWZmZWN0cyBkYXRhIHdoZW4gYW4gYWN0aW9uIGhhcyBiZWVuIHRyaWdnZXJlZCBvbiBhIGNvbnRleHQuXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgdGhhdCB3YXMgdXNlZCBpbml0aWFsbHkgd2hlbiBjb25uZWN0aW5nIHRoZSB3ZWJzb2NrZXRcbiAqIEBwYXJhbSBwYXRoRm9yQWN0aW9uIFBhdGggb2YgdGhlIGNvbnRleHQgdG8gYXBwbHkgdGhlIGFjdGlvbiB0b1xuICogQHBhcmFtIGFjdGlvbk5hbWUgTmFtZSBvZiB0aGUgYWN0aW9uXG4gKiBAcGFyYW0gcmVxdWVzdGVkUHJvcGVydGllc1xuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlZCB3aGVuIHRoZSBzaWRlLWVmZmVjdHMgZGF0YSBoYXMgYmVlbiBsb2FkZWRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gcmVxdWVzdFVwZGF0ZUZvckFjdGlvbihcblx0dmlldzogRkVWaWV3LFxuXHRwYXRoRm9yQWN0aW9uOiBzdHJpbmcsXG5cdGFjdGlvbk5hbWU6IHN0cmluZyxcblx0cmVxdWVzdGVkUHJvcGVydGllcz86IHN0cmluZ1tdXG4pOiBQcm9taXNlPHZvaWQ+IHtcblx0Y29uc3QgdGFyZ2V0Q29udGV4dCA9IGZpbmRDb250ZXh0Rm9yVXBkYXRlKHZpZXcsIHBhdGhGb3JBY3Rpb24pO1xuXHRpZiAoIXRhcmdldENvbnRleHQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBhcHBDb21wb25lbnQgPSBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHZpZXcpO1xuXHRjb25zdCBzaWRlRWZmZWN0U2VydmljZSA9IGFwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0Y29uc3Qgc2lkZUVmZmVjdHNGcm9tQWN0aW9uID0gc2lkZUVmZmVjdFNlcnZpY2UuZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyhhY3Rpb25OYW1lLCB0YXJnZXRDb250ZXh0KTtcblx0Y29uc3Qgc2lkZUVmZmVjdFByb21pc2VzOiBQcm9taXNlPGFueT5bXSA9IFtdO1xuXHRpZiAoc2lkZUVmZmVjdHNGcm9tQWN0aW9uKSB7XG5cdFx0aWYgKHNpZGVFZmZlY3RzRnJvbUFjdGlvbi5wYXRoRXhwcmVzc2lvbnM/Lmxlbmd0aCkge1xuXHRcdFx0c2lkZUVmZmVjdFByb21pc2VzLnB1c2goXG5cdFx0XHRcdHNpZGVFZmZlY3RTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhzaWRlRWZmZWN0c0Zyb21BY3Rpb24ucGF0aEV4cHJlc3Npb25zLCB0YXJnZXRDb250ZXh0LCBTWU5DR1JPVVBJRClcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG5cdGlmIChyZXF1ZXN0ZWRQcm9wZXJ0aWVzICYmIHJlcXVlc3RlZFByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuXHRcdC8vY2xlYW4tdXAgb2YgdGhlIHByb3BlcnRpZXMgdG8gcmVxdWVzdCBsaXN0OlxuXHRcdGNvbnN0IG1ldGFNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBtZXRhUGF0aEZvckFjdGlvbiA9IGNhbGN1bGF0ZU1ldGFQYXRoKHZpZXcsIHBhdGhGb3JBY3Rpb24pO1xuXHRcdGNvbnN0IGRhdGFNb2RlbFBhdGggPSBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFNb2RlbC5nZXRDb250ZXh0KG1ldGFQYXRoRm9yQWN0aW9uKSk7XG5cdFx0Y29uc3QgcHJvcGVydGllc1RvUmVxdWVzdCA9IGRhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5VHlwZS5lbnRpdHlQcm9wZXJ0aWVzXG5cdFx0XHQubWFwKChwcm9wZXJ0eTogUHJvcGVydHkpID0+IHtcblx0XHRcdFx0cmV0dXJuIHByb3BlcnR5Lm5hbWU7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbHRlcigocHJvcCkgPT4gcmVxdWVzdGVkUHJvcGVydGllcy5pbmNsdWRlcyhwcm9wKSk7XG5cdFx0aWYgKHByb3BlcnRpZXNUb1JlcXVlc3QubGVuZ3RoID4gMCkge1xuXHRcdFx0c2lkZUVmZmVjdFByb21pc2VzLnB1c2goc2lkZUVmZmVjdFNlcnZpY2UucmVxdWVzdFNpZGVFZmZlY3RzKHByb3BlcnRpZXNUb1JlcXVlc3QsIHRhcmdldENvbnRleHQsIFNZTkNHUk9VUElEKSk7XG5cdFx0fVxuXHR9XG5cblx0YXdhaXQgUHJvbWlzZS5hbGwoc2lkZUVmZmVjdFByb21pc2VzKTtcbn1cblxuLyoqXG4gKiBGaW5kcyBhIGNvbnRleHQgdG8gYXBwbHkgYW4gdXBkYXRlIG1lc3NhZ2UgKENIQU5HRSwgQ1JFQVRFLCBERUxFVEUgb3IgQUNUSU9OKS5cbiAqXG4gKiBAcGFyYW0gdmlldyAgVGhlIHZpZXcgdGhhdCB3YXMgdXNlZCBpbml0aWFsbHkgd2hlbiBjb25uZWN0aW5nIHRoZSB3ZWJzb2NrZXRcbiAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBjb250ZXh0IHRvIGJlIGZvdW5kIChzaGFsbCBwb2ludCB0byBhbiBlbnRpdHksIG5vdCBhIHByb3BlcnR5KVxuICogQHJldHVybnMgQSBjb250ZXh0IGlmIGl0IGNvdWxkIGJlIGZvdW5kXG4gKi9cbmZ1bmN0aW9uIGZpbmRDb250ZXh0Rm9yVXBkYXRlKHZpZXc6IFZpZXcsIHBhdGg6IHN0cmluZyk6IENvbnRleHQgfCB1bmRlZmluZWQge1xuXHRpZiAoIXBhdGgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdC8vIEZpbmQgYWxsIHBvdGVudGlhbCBwYXRoc1xuXHRjb25zdCB0YXJnZXRQYXRoczogc3RyaW5nW10gPSBbXTtcblx0d2hpbGUgKCFwYXRoLmVuZHNXaXRoKFwiKVwiKSkge1xuXHRcdHRhcmdldFBhdGhzLnVuc2hpZnQocGF0aCk7XG5cdFx0cGF0aCA9IHBhdGguc3Vic3RyaW5nKDAsIHBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0fVxuXHR0YXJnZXRQYXRocy51bnNoaWZ0KHBhdGgpO1xuXG5cdGNvbnN0IHBhcmVudENvbGxlY3Rpb25QYXRoID0gcGF0aC5zdWJzdHJpbmcoMCwgcGF0aC5sYXN0SW5kZXhPZihcIihcIikpOyAvLyBSZW1vdmUgdGhlIGxhc3Qga2V5XG5cblx0bGV0IHRhcmdldENvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdGxldCBjdXJyZW50Q29udGV4dCA9IGdldEN1cnJlbnRQYWdlKHZpZXcpLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCB8IHVuZGVmaW5lZDtcblx0d2hpbGUgKGN1cnJlbnRDb250ZXh0ICYmICF0YXJnZXRDb250ZXh0KSB7XG5cdFx0aWYgKHRhcmdldFBhdGhzLmluZGV4T2YoY3VycmVudENvbnRleHQuZ2V0UGF0aCgpKSA+PSAwKSB7XG5cdFx0XHR0YXJnZXRDb250ZXh0ID0gY3VycmVudENvbnRleHQ7XG5cdFx0fVxuXG5cdFx0Y3VycmVudENvbnRleHQgPSBjdXJyZW50Q29udGV4dC5nZXRCaW5kaW5nKCk/LmdldENvbnRleHQoKSBhcyBDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKHRhcmdldENvbnRleHQpIHtcblx0XHQvLyBGb3VuZCAhXG5cdFx0cmV0dXJuIHRhcmdldENvbnRleHQ7XG5cdH1cblxuXHQvLyBUcnkgdG8gZmluZCB0aGUgdGFyZ2V0IGNvbnRleHQgaW4gYSBsaXN0QmluZGluZ1xuXHRjb25zdCBtb2RlbCA9IGdldEN1cnJlbnRQYWdlKHZpZXcpLmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0TW9kZWwoKSBhcyBPRGF0YU1vZGVsO1xuXHRjb25zdCBwYXJlbnRMaXN0QmluZGluZyA9IG1vZGVsLmdldEFsbEJpbmRpbmdzKCkuZmluZCgoYmluZGluZykgPT4ge1xuXHRcdGNvbnN0IGJpbmRpbmdQYXRoID0gYmluZGluZy5pc1JlbGF0aXZlKCkgPyBiaW5kaW5nLmdldFJlc29sdmVkUGF0aCgpIDogYmluZGluZy5nZXRQYXRoKCk7XG5cdFx0cmV0dXJuIGJpbmRpbmcuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikgJiYgYmluZGluZ1BhdGggPT09IHBhcmVudENvbGxlY3Rpb25QYXRoO1xuXHR9KSBhcyBPRGF0YUxpc3RCaW5kaW5nIHwgdW5kZWZpbmVkO1xuXHQvLyBXZSd2ZSBmb3VuZCBhIGxpc3QgYmluZGluZyB0aGF0IGNvdWxkIGNvbnRhaW4gdGhlIHRhcmdldCBjb250ZXh0IC0tPiBsb29rIGZvciBpdFxuXHR0YXJnZXRDb250ZXh0ID0gcGFyZW50TGlzdEJpbmRpbmc/LmdldEFsbEN1cnJlbnRDb250ZXh0cygpLmZpbmQoKGNvbnRleHQpID0+IHtcblx0XHRyZXR1cm4gdGFyZ2V0UGF0aHMuaW5kZXhPZihjb250ZXh0LmdldFBhdGgoKSkgPj0gMDtcblx0fSk7XG5cblx0cmV0dXJuIHRhcmdldENvbnRleHQ7XG59XG5cbmZ1bmN0aW9uIG5hdmlnYXRlKHBhdGg6IHN0cmluZywgdmlldzogRkVWaWV3KSB7XG5cdC8vIFRPRE86IHJvdXRpbmcubmF2aWdhdGUgZG9lc24ndCBjb25zaWRlciBzZW1hbnRpYyBib29rbWFya2luZ1xuXHRjb25zdCBjdXJyZW50UGFnZSA9IGdldEN1cnJlbnRQYWdlKHZpZXcpO1xuXHRjb25zdCB0YXJnZXRDb250ZXh0ID0gdmlldy5nZXRNb2RlbCgpLmJpbmRDb250ZXh0KHBhdGgpLmdldEJvdW5kQ29udGV4dCgpO1xuXHRjdXJyZW50UGFnZS5nZXRDb250cm9sbGVyKCkucm91dGluZy5uYXZpZ2F0ZSh0YXJnZXRDb250ZXh0KTtcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFBhZ2UodmlldzogVmlldykge1xuXHRjb25zdCBhcHBDb21wb25lbnQgPSBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHZpZXcpO1xuXHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0Q3VycmVudFBhZ2VWaWV3KGFwcENvbXBvbmVudCk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbWV0YXBhdGggZnJvbSBvbmUgb3IgbW9yZSBkYXRhIHBhdGgocykuXG4gKlxuICogQHBhcmFtIHZpZXcgVGhlIGN1cnJlbnQgdmlld1xuICogQHBhcmFtIHBhdGggT25lIG9yZSBtb3JlIGRhdGEgcGF0aChzKSwgaW4gY2FzZSBvZiBtdWx0aXBsZSBwYXRocyBzZXBhcmF0ZWQgYnkgJ3wnXG4gKiBAcmV0dXJucyBUaGUgY2FsY3VsYXRlZCBtZXRhUGF0aFxuICovXG5mdW5jdGlvbiBjYWxjdWxhdGVNZXRhUGF0aCh2aWV3OiBGRVZpZXcsIHBhdGg/OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRsZXQgbWV0YVBhdGggPSBcIlwiO1xuXHRpZiAocGF0aCkge1xuXHRcdC8vIGluIGNhc2UgbW9yZSB0aGFuIG9uZSBwYXRoIGlzIHNlbnQgYWxsIG9mIHRoZW0gaGF2ZSB0byB1c2UgdGhlIHNhbWUgbWV0YXBhdGggdGhlcmVmb3JlIHdlIGp1c3QgY29uc2lkZXIgdGhlIGZpcnN0IG9uZVxuXHRcdGNvbnN0IGRhdGFQYXRoID0gcGF0aC5zcGxpdChcInxcIilbMF07XG5cdFx0bWV0YVBhdGggPSB2aWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0TWV0YVBhdGgoZGF0YVBhdGgpO1xuXHR9XG5cdHJldHVybiBtZXRhUGF0aDtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuXHRjb25uZWN0OiBjb25uZWN0LFxuXHRkaXNjb25uZWN0OiBkaXNjb25uZWN0LFxuXHRpc0Nvbm5lY3RlZDogaXNDb25uZWN0ZWQsXG5cdGlzQ29sbGFib3JhdGlvbkVuYWJsZWQ6IGlz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
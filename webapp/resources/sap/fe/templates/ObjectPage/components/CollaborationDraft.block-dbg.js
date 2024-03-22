/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/RuntimeBuildingBlock", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/CollaborationFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/TypeGuards", "sap/m/Avatar", "sap/m/Button", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/Dialog", "sap/m/HBox", "sap/m/Label", "sap/m/MessageStrip", "sap/m/MessageToast", "sap/m/ObjectStatus", "sap/m/ResponsivePopover", "sap/m/SearchField", "sap/m/Table", "sap/m/Text", "sap/m/Title", "sap/m/Toolbar", "sap/m/ToolbarSpacer", "sap/m/VBox", "sap/ui/core/library", "sap/ui/mdc/Field", "sap/ui/mdc/ValueHelp", "sap/ui/mdc/valuehelp/content/MTable", "sap/ui/mdc/valuehelp/Dialog", "sap/ui/mdc/valuehelp/Popover", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/jsxs", "sap/fe/core/jsx-runtime/Fragment"], function (BuildingBlockSupport, RuntimeBuildingBlock, CollaborationCommon, MetaModelConverter, collaborationFormatter, BindingToolkit, ModelHelper, TypeGuards, Avatar, Button, Column, ColumnListItem, Dialog, HBox, Label, MessageStrip, MessageToast, ObjectStatus, ResponsivePopover, SearchField, Table, Text, Title, Toolbar, ToolbarSpacer, VBox, library, Field, ValueHelp, MTable, MDCDialog, MDCPopover, _jsx, _jsxs, _Fragment) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var _exports = {};
  var ValueState = library.ValueState;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var UserStatus = CollaborationCommon.UserStatus;
  var UserEditingState = CollaborationCommon.UserEditingState;
  var shareObject = CollaborationCommon.shareObject;
  var CollaborationUtils = CollaborationCommon.CollaborationUtils;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const USERS_PARAMETERS = "Users";
  const USER_ID_PARAMETER = "UserID";
  let CollaborationDraft = (_dec = defineBuildingBlock({
    name: "CollaborationDraft",
    namespace: "sap.fe.templates.ObjectPage.components"
  }), _dec2 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_RuntimeBuildingBlock) {
    _inheritsLoose(CollaborationDraft, _RuntimeBuildingBlock);
    function CollaborationDraft(props) {
      var _this;
      for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        others[_key - 1] = arguments[_key];
      }
      _this = _RuntimeBuildingBlock.call(this, props, ...others) || this;
      _initializerDefineProperty(_this, "contextPath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor2, _assertThisInitialized(_this));
      _this.showCollaborationUserDetails = async event => {
        var _this$userDetailsPopo, _this$userDetailsPopo2;
        const source = event.getSource();
        if (!_this.userDetailsPopover) {
          _this.userDetailsPopover = _this.getUserDetailsPopover();
        }
        (_this$userDetailsPopo = _this.userDetailsPopover) === null || _this$userDetailsPopo === void 0 ? void 0 : _this$userDetailsPopo.setBindingContext(source.getBindingContext("internal"), "internal");
        (_this$userDetailsPopo2 = _this.userDetailsPopover) === null || _this$userDetailsPopo2 === void 0 ? void 0 : _this$userDetailsPopo2.openBy(source, false);
      };
      _this.manageCollaboration = () => {
        var _this$manageDialog;
        if (!_this.manageDialog) {
          _this.manageDialog = _this.getManageDialog();
        }
        _this.readInvitedUsers(_this.containingView);
        (_this$manageDialog = _this.manageDialog) === null || _this$manageDialog === void 0 ? void 0 : _this$manageDialog.open();
      };
      _this.formatUserStatus = userStatus => {
        switch (userStatus) {
          case UserStatus.CurrentlyEditing:
            return _this.getTranslatedText("C_COLLABORATIONDRAFT_USER_CURRENTLY_EDITING");
          case UserStatus.ChangesMade:
            return _this.getTranslatedText("C_COLLABORATIONDRAFT_USER_CHANGES_MADE");
          case UserStatus.NoChangesMade:
            return _this.getTranslatedText("C_COLLABORATIONDRAFT_USER_NO_CHANGES_MADE");
          case UserStatus.NotYetInvited:
          default:
            return _this.getTranslatedText("C_COLLABORATIONDRAFT_USER_NOT_YET_INVITED");
        }
      };
      _this.addUserFieldChanged = event => {
        const userInput = event.getSource();
        return event.getParameter("promise").then(function (newUserId) {
          const internalModelContext = userInput.getBindingContext("internal");
          const invitedUsers = internalModelContext.getProperty("invitedUsers") || [];
          if (invitedUsers.findIndex(user => user.id === newUserId) > -1) {
            userInput.setValueState("Error");
            userInput.setValueStateText(this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_USER_ERROR"));
          } else {
            userInput.setValueState("None");
            userInput.setValueStateText("");
          }
        }.bind(_assertThisInitialized(_this))).catch(function () {
          userInput.setValueState("Warning");
          userInput.setValueStateText(this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_USER_NOT_FOUND"));
        }.bind(_assertThisInitialized(_this)));
      };
      _this.inviteUser = async event => {
        var _this$manageDialogUse;
        const users = [];
        const source = event.getSource();
        const bindingContext = source.getBindingContext();
        const contexts = ((_this$manageDialogUse = _this.manageDialogUserTable) === null || _this$manageDialogUse === void 0 ? void 0 : _this$manageDialogUse.getBinding("items")).getContexts();
        let numberOfNewInvitedUsers = 0;
        contexts.forEach(function (context) {
          users.push({
            UserID: context.getProperty("id"),
            UserAccessRole: "O" // For now according to UX every user retrieves the owner role
          });

          if (context.getObject().status === 0) {
            numberOfNewInvitedUsers++;
          }
        });
        try {
          await shareObject(bindingContext, users);
          MessageToast.show(_this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_SUCCESS_TOAST", [numberOfNewInvitedUsers.toString()], _this.getSharedItemName(bindingContext)));
        } catch {
          MessageToast.show(_this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_FAILED_TOAST"));
        }
        _this.closeManageDialog();
      };
      _this.readInvitedUsers = async view => {
        const model = view.getModel();
        const parameters = {
          $select: "UserID,UserDescription,UserEditingState"
        };
        const invitedUserList = model.bindList("DraftAdministrativeData/DraftAdministrativeUser", view.getBindingContext(), [], [], parameters);
        const internalModelContext = view.getBindingContext("internal");

        // for now we set a limit to 100. there shouldn't be more than a few
        return invitedUserList.requestContexts(0, 100).then(function (contexts) {
          const invitedUsers = [];
          const activeUsers = view.getModel("internal").getProperty("/collaboration/activeUsers") || [];
          const me = CollaborationUtils.getMe(view);
          let userStatus;
          if ((contexts === null || contexts === void 0 ? void 0 : contexts.length) > 0) {
            contexts.forEach(function (oContext) {
              const userData = oContext.getObject();
              const isMe = (me === null || me === void 0 ? void 0 : me.id) === userData.UserID;
              const isActive = activeUsers.find(u => u.id === userData.UserID);
              let userDescription = userData.UserDescription || userData.UserID;
              const initials = CollaborationUtils.formatInitials(userDescription);
              userDescription += isMe ? ` (${CollaborationUtils.getText("C_COLLABORATIONDRAFT_YOU")})` : "";
              if (isActive) {
                userStatus = UserStatus.CurrentlyEditing;
              } else if (userData.UserEditingState === UserEditingState.InProgress) {
                userStatus = UserStatus.ChangesMade;
              } else {
                userStatus = UserStatus.NoChangesMade;
              }
              const user = {
                id: userData.UserID,
                name: userDescription,
                status: userStatus,
                color: CollaborationUtils.getUserColor(userData.UserID, activeUsers, invitedUsers),
                initials: initials,
                me: isMe
              };
              invitedUsers.push(user);
            });
          } else {
            //not yet shared, just add me
            invitedUsers.push(me);
          }
          internalModelContext.setProperty("collaboration/UserID", "");
          internalModelContext.setProperty("collaboration/UserDescription", "");
          internalModelContext.setProperty("collaboration/invitedUsers", invitedUsers);
        }).catch(function () {
          MessageToast.show(this.getTranslatedText("C_COLLABORATIONDRAFT_READING_USER_FAILED"));
        }.bind(_assertThisInitialized(_this)));
      };
      _this.closeManageDialog = () => {
        var _this$manageDialog2;
        (_this$manageDialog2 = _this.manageDialog) === null || _this$manageDialog2 === void 0 ? void 0 : _this$manageDialog2.close();
      };
      _this.contextObject = getInvolvedDataModelObjects(_this.contextPath);
      return _this;
    }

    /**
     * Event handler to create and show the user details popover.
     *
     * @param event The event object
     */
    _exports = CollaborationDraft;
    var _proto = CollaborationDraft.prototype;
    /**
     * Returns the user details popover.
     *
     * @returns The control tree
     */
    _proto.getUserDetailsPopover = function getUserDetailsPopover() {
      const userDetailsPopover = _jsx(ResponsivePopover, {
        showHeader: "false",
        class: "sapUiContentPadding",
        placement: "Bottom",
        children: _jsxs(HBox, {
          children: [_jsx(Avatar, {
            initials: "{internal>initials}",
            displaySize: "S"
          }), _jsxs(VBox, {
            children: [_jsx(Label, {
              class: "sapUiMediumMarginBegin",
              text: "{internal>name}"
            }), _jsx(Label, {
              class: "sapUiMediumMarginBegin",
              text: "{internal>id}"
            })]
          })]
        })
      });
      this.containingView.addDependent(userDetailsPopover);
      return userDetailsPopover;
    }

    /**
     * Event handler to create and open the manage dialog.
     *
     */;
    /**
     * Returns the manage dialog used to invite further users.
     *
     * @returns The control tree
     */
    _proto.getManageDialog = function getManageDialog() {
      const manageDialog = _jsx(Dialog, {
        title: this.getInvitationDialogTitleExpBinding(),
        children: {
          beginButton: _jsx(Button, {
            text: this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_DIALOG_CONFIRMATION"),
            press: this.inviteUser,
            type: "Emphasized"
          }),
          endButton: _jsx(Button, {
            text: this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_DIALOG_CANCEL"),
            press: this.closeManageDialog
          }),
          content: _jsxs(VBox, {
            class: "sapUiMediumMargin",
            children: [_jsx(VBox, {
              width: "40em",
              children: _jsx(MessageStrip, {
                text: this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_MESSAGESTRIP"),
                type: "Information",
                showIcon: "true",
                showCloseButton: "false",
                class: "sapUiMediumMarginBottom"
              })
            }), _jsx(Label, {
              text: this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_INPUT_LABEL")
            }), this.getManageDialogAddUserSection(), this.getManageDialogUserTable()]
          })
        }
      });
      this.containingView.addDependent(manageDialog);
      manageDialog.bindElement({
        model: "internal",
        path: "collaboration"
      });
      return manageDialog;
    }

    /**
     * Returns the table with the list of invited users.
     *
     * @returns The control tree
     */;
    _proto.getManageDialogUserTable = function getManageDialogUserTable() {
      this.manageDialogUserTable = _jsx(Table, {
        width: "40em",
        items: {
          path: "internal>invitedUsers"
        },
        children: {
          headerToolbar: _jsxs(Toolbar, {
            width: "100%",
            children: [_jsx(Title, {
              text: this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_TABLE_TOOLBAR_TITLE"),
              level: "H3"
            }), _jsx(ToolbarSpacer, {}), _jsx(SearchField, {
              width: "15em"
            }), "pn"]
          }),
          columns: _jsxs(_Fragment, {
            children: [_jsx(Column, {
              width: "3em"
            }), _jsx(Column, {
              width: "20em",
              children: _jsx(Text, {
                text: this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_TABLE_USER_COLUMN")
              })
            }), _jsx(Column, {
              width: "17em",
              children: _jsx(Text, {
                text: this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_TABLE_USER_STATUS_COLUMN")
              })
            }), _jsx(Column, {
              width: "5em"
            })]
          }),
          items: _jsxs(ColumnListItem, {
            vAlign: "Middle",
            highlight: "{= ${internal>transient} ? 'Information' : 'None' }",
            children: [_jsx(Avatar, {
              displaySize: "XS",
              backgroundColor: "Accent{internal>color}",
              initials: "{internal>initials}"
            }), _jsx(Text, {
              text: "{internal>name}"
            }), _jsx(ObjectStatus, {
              state: {
                path: "internal>status",
                formatter: this.formatUserStatusColor
              },
              text: {
                path: "internal>status",
                formatter: this.formatUserStatus
              }
            }), _jsx(HBox, {
              children: _jsx(Button, {
                icon: "sap-icon://decline",
                type: "Transparent",
                press: this.removeUser,
                visible: "{= !!${internal>transient} }"
              })
            })]
          })
        }
      });
      return this.manageDialogUserTable;
    }

    /**
     * Returns the section on the dialog related to the user field.
     *
     * @returns The control tree
     */;
    _proto.getManageDialogAddUserSection = function getManageDialogAddUserSection() {
      return _jsxs(HBox, {
        class: "sapUiMediumMarginBottom",
        width: "100%",
        children: [_jsx(Field, {
          value: "{internal>UserID}",
          additionalValue: "{internal>UserDescription}",
          display: "DescriptionValue",
          width: "37em",
          required: "true",
          fieldHelp: "userValueHelp",
          placeholder: this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_INPUT_PLACEHOLDER"),
          change: this.addUserFieldChanged,
          children: {
            dependents: _jsx(ValueHelp, {
              id: "userValueHelp",
              delegate: this.getValueHelpDelegate(),
              validateInput: "true",
              children: {
                typeahead: _jsx(MDCPopover, {
                  children: _jsx(MTable, {
                    caseSensitive: "true",
                    useAsValueHelp: "false"
                  })
                }),
                dialog: _jsx(MDCDialog, {})
              }
            })
          }
        }), _jsx(Button, {
          class: "sapUiTinyMarginBegin",
          text: this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_DIALOG_ADD_USER"),
          press: this.addUser
        })]
      });
    }

    /**
     * Formatter to set the user status depending on the editing status.
     *
     * @param userStatus The editing status of the user
     * @returns The user status
     */;
    /**
     * Formatter to set the user color depending on the editing status.
     *
     * @param userStatus The editing status of the user
     * @returns The user status color
     */
    _proto.formatUserStatusColor = function formatUserStatusColor(userStatus) {
      switch (userStatus) {
        case UserStatus.CurrentlyEditing:
          return ValueState.Success;
        case UserStatus.ChangesMade:
          return ValueState.Warning;
        case UserStatus.NoChangesMade:
        case UserStatus.NotYetInvited:
        default:
          return ValueState.Information;
      }
    }

    /**
     * Event handler to add the entered user to the list of invited users.
     *
     * @param event The event object of the remove button
     */;
    _proto.addUser = function addUser(event) {
      const addButton = event.getSource();
      const internalModelContext = addButton.getBindingContext("internal");
      const invitedUsers = internalModelContext.getProperty("invitedUsers") || [];
      const activeUsers = addButton.getModel("internal").getProperty("/collaboration/activeUsers");
      const newUser = {
        id: internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.getProperty("UserID"),
        name: internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.getProperty("UserDescription")
      };
      if (!(invitedUsers.findIndex(user => user.id === newUser.id) > -1 || newUser.id === newUser.name && newUser.id === "")) {
        newUser.name = newUser.name || newUser.id;
        newUser.initials = CollaborationUtils.formatInitials(newUser.name);
        newUser.color = CollaborationUtils.getUserColor(newUser.id, activeUsers, invitedUsers);
        newUser.transient = true;
        newUser.status = UserStatus.NotYetInvited;
        invitedUsers.unshift(newUser);
        internalModelContext.setProperty("invitedUsers", invitedUsers);
        internalModelContext.setProperty("UserID", "");
        internalModelContext.setProperty("UserDescription", "");
      }
    }

    /**
     * Sets the value state of the user field whenever changed.
     *
     * @param event The event object of the remove button
     * @returns Promise that is resolved once the value state was set.
     */;
    /**
     * Event handler to remove a user from the list of invited user.
     *
     * @param event The event object of the remove button
     */
    _proto.removeUser = function removeUser(event) {
      var _item$getBindingConte;
      const item = event.getSource();
      const internalModelContext = item === null || item === void 0 ? void 0 : item.getBindingContext("pageInternal");
      const deleteUserID = item === null || item === void 0 ? void 0 : (_item$getBindingConte = item.getBindingContext("internal")) === null || _item$getBindingConte === void 0 ? void 0 : _item$getBindingConte.getProperty("id");
      let invitedUsers = internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.getProperty("collaboration/invitedUsers");
      invitedUsers = invitedUsers.filter(user => user.id !== deleteUserID);
      internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("collaboration/invitedUsers", invitedUsers);
    }

    /**
     * Call the share action to update the list of invited users.
     *
     * @param event The event object of the invite button
     */;
    /**
     * Get the name of the object to be shared.
     *
     * @param bindingContext The context of the page.
     * @returns The name of the object to be shared.
     */
    _proto.getSharedItemName = function getSharedItemName(bindingContext) {
      var _this$contextObject$t;
      const headerInfo = (_this$contextObject$t = this.contextObject.targetObject.entityType.annotations.UI) === null || _this$contextObject$t === void 0 ? void 0 : _this$contextObject$t.HeaderInfo;
      let sharedItemName = "";
      const title = headerInfo === null || headerInfo === void 0 ? void 0 : headerInfo.Title;
      if (title) {
        sharedItemName = isPathAnnotationExpression(title.Value) ? bindingContext.getProperty(title.Value.path) : title.Value;
      }
      return sharedItemName || (headerInfo === null || headerInfo === void 0 ? void 0 : headerInfo.TypeName) || "";
    }

    /**
     * Generates the delegate payload for the user field value help.
     *
     * @returns The value help delegate payload
     */;
    _proto.getValueHelpDelegate = function getValueHelpDelegate() {
      // The non null assertion is safe here, because the action is only available if the annotation is present
      const actionName = this.contextObject.targetEntitySet.annotations.Common.DraftRoot.ShareAction.toString();
      // We are also sure that the action exist
      const action = this.contextObject.targetEntityType.resolvePath(actionName);
      // By definition the action has a parameter with the name "Users"
      const userParameters = action.parameters.find(param => param.name === USERS_PARAMETERS);
      return {
        name: "sap/fe/macros/valuehelp/ValueHelpDelegate",
        payload: {
          propertyPath: `/${userParameters.type}/${USER_ID_PARAMETER}`,
          qualifiers: {},
          valueHelpQualifier: "",
          isActionParameterDialog: true
        }
      };
    }

    /**
     * Generate the expression binding of the Invitation dialog.
     *
     * @returns The dialog title binding expression
     */;
    _proto.getInvitationDialogTitleExpBinding = function getInvitationDialogTitleExpBinding() {
      var _this$contextObject$t2, _headerInfo$Title;
      const headerInfo = (_this$contextObject$t2 = this.contextObject.targetEntityType.annotations.UI) === null || _this$contextObject$t2 === void 0 ? void 0 : _this$contextObject$t2.HeaderInfo;
      const title = getExpressionFromAnnotation(headerInfo === null || headerInfo === void 0 ? void 0 : (_headerInfo$Title = headerInfo.Title) === null || _headerInfo$Title === void 0 ? void 0 : _headerInfo$Title.Value, [], "");
      const params = ["C_COLLABORATIONDRAFT_INVITATION_DIALOG", constant(headerInfo === null || headerInfo === void 0 ? void 0 : headerInfo.TypeName), title];
      const titleExpression = formatResult(params, collaborationFormatter.getFormattedText);
      return compileExpression(titleExpression);
    }

    /**
     * Event handler to close the manage dialog.
     *
     */;
    /**
     * Returns the invite button if there's a share action on root level.
     *
     * @returns The control tree
     */
    _proto.getInviteButton = function getInviteButton() {
      var _this$contextObject$t3, _this$contextObject$t4, _this$contextObject$t5;
      if ((_this$contextObject$t3 = this.contextObject.targetEntitySet) !== null && _this$contextObject$t3 !== void 0 && (_this$contextObject$t4 = _this$contextObject$t3.annotations.Common) !== null && _this$contextObject$t4 !== void 0 && (_this$contextObject$t5 = _this$contextObject$t4.DraftRoot) !== null && _this$contextObject$t5 !== void 0 && _this$contextObject$t5.ShareAction) {
        return _jsx(HBox, {
          visible: "{ui>/isEditable}",
          alignItems: "Center",
          justifyContent: "Start",
          children: _jsx(Avatar, {
            backgroundColor: "TileIcon",
            src: "sap-icon://add-employee",
            displaySize: "XS",
            press: this.manageCollaboration
          })
        });
      } else {
        return _jsx(HBox, {});
      }
    }

    /**
     * Returns the content of the collaboration draft building block.
     *
     * @param view The view for which the building block is created
     * @returns The control tree
     */;
    _proto.getContent = function getContent(view) {
      this.containingView = view;
      if (ModelHelper.isCollaborationDraftSupported(this.contextPath.getModel())) {
        return _jsxs(_Fragment, {
          children: [_jsx(HBox, {
            items: {
              path: "internal>/collaboration/activeUsers"
            },
            class: "sapUiTinyMarginBegin",
            visible: "{= ${ui>/isEditable} && ${internal>/collaboration/connected} }",
            alignItems: "Center",
            justifyContent: "Start",
            children: _jsx(Avatar, {
              initials: "{internal>initials}",
              displaySize: "XS",
              backgroundColor: "Accent{internal>color}",
              press: this.showCollaborationUserDetails
            })
          }), this.getInviteButton()]
        });
      }
    };
    return CollaborationDraft;
  }(RuntimeBuildingBlock), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = CollaborationDraft;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVU0VSU19QQVJBTUVURVJTIiwiVVNFUl9JRF9QQVJBTUVURVIiLCJDb2xsYWJvcmF0aW9uRHJhZnQiLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsInJlcXVpcmVkIiwicHJvcHMiLCJvdGhlcnMiLCJzaG93Q29sbGFib3JhdGlvblVzZXJEZXRhaWxzIiwiZXZlbnQiLCJzb3VyY2UiLCJnZXRTb3VyY2UiLCJ1c2VyRGV0YWlsc1BvcG92ZXIiLCJnZXRVc2VyRGV0YWlsc1BvcG92ZXIiLCJzZXRCaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib3BlbkJ5IiwibWFuYWdlQ29sbGFib3JhdGlvbiIsIm1hbmFnZURpYWxvZyIsImdldE1hbmFnZURpYWxvZyIsInJlYWRJbnZpdGVkVXNlcnMiLCJjb250YWluaW5nVmlldyIsIm9wZW4iLCJmb3JtYXRVc2VyU3RhdHVzIiwidXNlclN0YXR1cyIsIlVzZXJTdGF0dXMiLCJDdXJyZW50bHlFZGl0aW5nIiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJDaGFuZ2VzTWFkZSIsIk5vQ2hhbmdlc01hZGUiLCJOb3RZZXRJbnZpdGVkIiwiYWRkVXNlckZpZWxkQ2hhbmdlZCIsInVzZXJJbnB1dCIsImdldFBhcmFtZXRlciIsInRoZW4iLCJuZXdVc2VySWQiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsImludml0ZWRVc2VycyIsImdldFByb3BlcnR5IiwiZmluZEluZGV4IiwidXNlciIsImlkIiwic2V0VmFsdWVTdGF0ZSIsInNldFZhbHVlU3RhdGVUZXh0IiwiYmluZCIsImNhdGNoIiwiaW52aXRlVXNlciIsInVzZXJzIiwiYmluZGluZ0NvbnRleHQiLCJjb250ZXh0cyIsIm1hbmFnZURpYWxvZ1VzZXJUYWJsZSIsImdldEJpbmRpbmciLCJnZXRDb250ZXh0cyIsIm51bWJlck9mTmV3SW52aXRlZFVzZXJzIiwiZm9yRWFjaCIsImNvbnRleHQiLCJwdXNoIiwiVXNlcklEIiwiVXNlckFjY2Vzc1JvbGUiLCJnZXRPYmplY3QiLCJzdGF0dXMiLCJzaGFyZU9iamVjdCIsIk1lc3NhZ2VUb2FzdCIsInNob3ciLCJ0b1N0cmluZyIsImdldFNoYXJlZEl0ZW1OYW1lIiwiY2xvc2VNYW5hZ2VEaWFsb2ciLCJ2aWV3IiwibW9kZWwiLCJnZXRNb2RlbCIsInBhcmFtZXRlcnMiLCIkc2VsZWN0IiwiaW52aXRlZFVzZXJMaXN0IiwiYmluZExpc3QiLCJyZXF1ZXN0Q29udGV4dHMiLCJhY3RpdmVVc2VycyIsIm1lIiwiQ29sbGFib3JhdGlvblV0aWxzIiwiZ2V0TWUiLCJsZW5ndGgiLCJvQ29udGV4dCIsInVzZXJEYXRhIiwiaXNNZSIsImlzQWN0aXZlIiwiZmluZCIsInUiLCJ1c2VyRGVzY3JpcHRpb24iLCJVc2VyRGVzY3JpcHRpb24iLCJpbml0aWFscyIsImZvcm1hdEluaXRpYWxzIiwiZ2V0VGV4dCIsIlVzZXJFZGl0aW5nU3RhdGUiLCJJblByb2dyZXNzIiwiY29sb3IiLCJnZXRVc2VyQ29sb3IiLCJzZXRQcm9wZXJ0eSIsImNsb3NlIiwiY29udGV4dE9iamVjdCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImNvbnRleHRQYXRoIiwiYWRkRGVwZW5kZW50IiwiZ2V0SW52aXRhdGlvbkRpYWxvZ1RpdGxlRXhwQmluZGluZyIsImJlZ2luQnV0dG9uIiwiZW5kQnV0dG9uIiwiY29udGVudCIsImdldE1hbmFnZURpYWxvZ0FkZFVzZXJTZWN0aW9uIiwiZ2V0TWFuYWdlRGlhbG9nVXNlclRhYmxlIiwiYmluZEVsZW1lbnQiLCJwYXRoIiwiaGVhZGVyVG9vbGJhciIsImNvbHVtbnMiLCJpdGVtcyIsImZvcm1hdHRlciIsImZvcm1hdFVzZXJTdGF0dXNDb2xvciIsInJlbW92ZVVzZXIiLCJkZXBlbmRlbnRzIiwiZ2V0VmFsdWVIZWxwRGVsZWdhdGUiLCJ0eXBlYWhlYWQiLCJkaWFsb2ciLCJhZGRVc2VyIiwiVmFsdWVTdGF0ZSIsIlN1Y2Nlc3MiLCJXYXJuaW5nIiwiSW5mb3JtYXRpb24iLCJhZGRCdXR0b24iLCJuZXdVc2VyIiwidHJhbnNpZW50IiwidW5zaGlmdCIsIml0ZW0iLCJkZWxldGVVc2VySUQiLCJmaWx0ZXIiLCJoZWFkZXJJbmZvIiwidGFyZ2V0T2JqZWN0IiwiZW50aXR5VHlwZSIsImFubm90YXRpb25zIiwiVUkiLCJIZWFkZXJJbmZvIiwic2hhcmVkSXRlbU5hbWUiLCJ0aXRsZSIsIlRpdGxlIiwiaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24iLCJWYWx1ZSIsIlR5cGVOYW1lIiwiYWN0aW9uTmFtZSIsInRhcmdldEVudGl0eVNldCIsIkNvbW1vbiIsIkRyYWZ0Um9vdCIsIlNoYXJlQWN0aW9uIiwiYWN0aW9uIiwidGFyZ2V0RW50aXR5VHlwZSIsInJlc29sdmVQYXRoIiwidXNlclBhcmFtZXRlcnMiLCJwYXJhbSIsInBheWxvYWQiLCJwcm9wZXJ0eVBhdGgiLCJxdWFsaWZpZXJzIiwidmFsdWVIZWxwUXVhbGlmaWVyIiwiaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2ciLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJwYXJhbXMiLCJjb25zdGFudCIsInRpdGxlRXhwcmVzc2lvbiIsImZvcm1hdFJlc3VsdCIsImNvbGxhYm9yYXRpb25Gb3JtYXR0ZXIiLCJnZXRGb3JtYXR0ZWRUZXh0IiwiY29tcGlsZUV4cHJlc3Npb24iLCJnZXRJbnZpdGVCdXR0b24iLCJnZXRDb250ZW50IiwiTW9kZWxIZWxwZXIiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsIlJ1bnRpbWVCdWlsZGluZ0Jsb2NrIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb2xsYWJvcmF0aW9uRHJhZnQuYmxvY2sudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFjdGlvbiBhcyBWb2NhYnVsYXJ5QWN0aW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL0VkbVwiO1xuaW1wb3J0IHsgRW50aXR5U2V0QW5ub3RhdGlvbnNfQ29tbW9uIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25fRWRtXCI7XG5pbXBvcnQgeyBEYXRhRmllbGQgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgdHlwZSB7IEZFVmlldyB9IGZyb20gXCJzYXAvZmUvY29yZS9CYXNlQ29udHJvbGxlclwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIGRlZmluZUJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1N1cHBvcnRcIjtcbmltcG9ydCBSdW50aW1lQnVpbGRpbmdCbG9jayBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvUnVudGltZUJ1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCB7XG5cdEJhY2tlbmRVc2VyLFxuXHRDb2xsYWJvcmF0aW9uVXRpbHMsXG5cdHNoYXJlT2JqZWN0LFxuXHRVc2VyLFxuXHRVc2VyRWRpdGluZ1N0YXRlLFxuXHRVc2VyU3RhdHVzXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25Db21tb25cIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IGNvbGxhYm9yYXRpb25Gb3JtYXR0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvQ29sbGFib3JhdGlvbkZvcm1hdHRlclwiO1xuaW1wb3J0IHtcblx0Q29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRjb25zdGFudCxcblx0Zm9ybWF0UmVzdWx0LFxuXHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyLCB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGlzUGF0aEFubm90YXRpb25FeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVHlwZUd1YXJkc1wiO1xuaW1wb3J0IHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IFZhbHVlSGVscFBheWxvYWQgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVMaXN0SGVscGVyXCI7XG5pbXBvcnQgQXZhdGFyIGZyb20gXCJzYXAvbS9BdmF0YXJcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IENvbHVtbiBmcm9tIFwic2FwL20vQ29sdW1uXCI7XG5pbXBvcnQgQ29sdW1uTGlzdEl0ZW0gZnJvbSBcInNhcC9tL0NvbHVtbkxpc3RJdGVtXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBIQm94IGZyb20gXCJzYXAvbS9IQm94XCI7XG5pbXBvcnQgSW5wdXQgZnJvbSBcInNhcC9tL0lucHV0XCI7XG5pbXBvcnQgTGFiZWwgZnJvbSBcInNhcC9tL0xhYmVsXCI7XG5pbXBvcnQgTWVzc2FnZVN0cmlwIGZyb20gXCJzYXAvbS9NZXNzYWdlU3RyaXBcIjtcbmltcG9ydCBNZXNzYWdlVG9hc3QgZnJvbSBcInNhcC9tL01lc3NhZ2VUb2FzdFwiO1xuaW1wb3J0IE9iamVjdFN0YXR1cyBmcm9tIFwic2FwL20vT2JqZWN0U3RhdHVzXCI7XG5pbXBvcnQgUG9wb3ZlciBmcm9tIFwic2FwL20vUG9wb3ZlclwiO1xuaW1wb3J0IFJlc3BvbnNpdmVQb3BvdmVyIGZyb20gXCJzYXAvbS9SZXNwb25zaXZlUG9wb3ZlclwiO1xuaW1wb3J0IFNlYXJjaEZpZWxkIGZyb20gXCJzYXAvbS9TZWFyY2hGaWVsZFwiO1xuaW1wb3J0IFRhYmxlIGZyb20gXCJzYXAvbS9UYWJsZVwiO1xuaW1wb3J0IFRleHQgZnJvbSBcInNhcC9tL1RleHRcIjtcbmltcG9ydCBUaXRsZSBmcm9tIFwic2FwL20vVGl0bGVcIjtcbmltcG9ydCBUb29sYmFyIGZyb20gXCJzYXAvbS9Ub29sYmFyXCI7XG5pbXBvcnQgVG9vbGJhclNwYWNlciBmcm9tIFwic2FwL20vVG9vbGJhclNwYWNlclwiO1xuaW1wb3J0IFZCb3ggZnJvbSBcInNhcC9tL1ZCb3hcIjtcbmltcG9ydCBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgeyBWYWx1ZVN0YXRlIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBGaWVsZCBmcm9tIFwic2FwL3VpL21kYy9GaWVsZFwiO1xuaW1wb3J0IFZhbHVlSGVscCBmcm9tIFwic2FwL3VpL21kYy9WYWx1ZUhlbHBcIjtcbmltcG9ydCBNVGFibGUgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2NvbnRlbnQvTVRhYmxlXCI7XG5pbXBvcnQgTURDRGlhbG9nIGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9EaWFsb2dcIjtcbmltcG9ydCBNRENQb3BvdmVyIGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9Qb3BvdmVyXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcblxuY29uc3QgVVNFUlNfUEFSQU1FVEVSUyA9IFwiVXNlcnNcIjtcbmNvbnN0IFVTRVJfSURfUEFSQU1FVEVSID0gXCJVc2VySURcIjtcblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soeyBuYW1lOiBcIkNvbGxhYm9yYXRpb25EcmFmdFwiLCBuYW1lc3BhY2U6IFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLmNvbXBvbmVudHNcIiB9KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ29sbGFib3JhdGlvbkRyYWZ0IGV4dGVuZHMgUnVudGltZUJ1aWxkaW5nQmxvY2sge1xuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBjb250ZXh0UGF0aCE6IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRwdWJsaWMgaWQ/OiBzdHJpbmc7XG5cblx0cHJpdmF0ZSBjb250ZXh0T2JqZWN0OiBEYXRhTW9kZWxPYmplY3RQYXRoO1xuXG5cdHByaXZhdGUgdXNlckRldGFpbHNQb3BvdmVyPzogUG9wb3ZlcjtcblxuXHRwcml2YXRlIG1hbmFnZURpYWxvZz86IERpYWxvZztcblxuXHRwcml2YXRlIG1hbmFnZURpYWxvZ1VzZXJUYWJsZT86IFRhYmxlO1xuXG5cdHByaXZhdGUgY29udGFpbmluZ1ZpZXchOiBGRVZpZXc7XG5cblx0Y29uc3RydWN0b3IocHJvcHM6IFByb3BlcnRpZXNPZjxDb2xsYWJvcmF0aW9uRHJhZnQ+LCAuLi5vdGhlcnM6IHVua25vd25bXSkge1xuXHRcdHN1cGVyKHByb3BzLCAuLi5vdGhlcnMpO1xuXHRcdHRoaXMuY29udGV4dE9iamVjdCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLmNvbnRleHRQYXRoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFdmVudCBoYW5kbGVyIHRvIGNyZWF0ZSBhbmQgc2hvdyB0aGUgdXNlciBkZXRhaWxzIHBvcG92ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgb2JqZWN0XG5cdCAqL1xuXHRzaG93Q29sbGFib3JhdGlvblVzZXJEZXRhaWxzID0gYXN5bmMgKGV2ZW50OiBFdmVudCkgPT4ge1xuXHRcdGNvbnN0IHNvdXJjZSA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2w7XG5cdFx0aWYgKCF0aGlzLnVzZXJEZXRhaWxzUG9wb3Zlcikge1xuXHRcdFx0dGhpcy51c2VyRGV0YWlsc1BvcG92ZXIgPSB0aGlzLmdldFVzZXJEZXRhaWxzUG9wb3ZlcigpO1xuXHRcdH1cblxuXHRcdHRoaXMudXNlckRldGFpbHNQb3BvdmVyPy5zZXRCaW5kaW5nQ29udGV4dChzb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCwgXCJpbnRlcm5hbFwiKTtcblx0XHR0aGlzLnVzZXJEZXRhaWxzUG9wb3Zlcj8ub3BlbkJ5KHNvdXJjZSwgZmFsc2UpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB1c2VyIGRldGFpbHMgcG9wb3Zlci5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRyb2wgdHJlZVxuXHQgKi9cblx0Z2V0VXNlckRldGFpbHNQb3BvdmVyKCkge1xuXHRcdGNvbnN0IHVzZXJEZXRhaWxzUG9wb3ZlciA9IChcblx0XHRcdDxSZXNwb25zaXZlUG9wb3ZlciBzaG93SGVhZGVyPVwiZmFsc2VcIiBjbGFzcz1cInNhcFVpQ29udGVudFBhZGRpbmdcIiBwbGFjZW1lbnQ9XCJCb3R0b21cIj5cblx0XHRcdFx0PEhCb3g+XG5cdFx0XHRcdFx0PEF2YXRhciBpbml0aWFscz1cIntpbnRlcm5hbD5pbml0aWFsc31cIiBkaXNwbGF5U2l6ZT1cIlNcIiAvPlxuXHRcdFx0XHRcdDxWQm94PlxuXHRcdFx0XHRcdFx0PExhYmVsIGNsYXNzPVwic2FwVWlNZWRpdW1NYXJnaW5CZWdpblwiIHRleHQ9XCJ7aW50ZXJuYWw+bmFtZX1cIiAvPlxuXHRcdFx0XHRcdFx0PExhYmVsIGNsYXNzPVwic2FwVWlNZWRpdW1NYXJnaW5CZWdpblwiIHRleHQ9XCJ7aW50ZXJuYWw+aWR9XCIgLz5cblx0XHRcdFx0XHQ8L1ZCb3g+XG5cdFx0XHRcdDwvSEJveD5cblx0XHRcdDwvUmVzcG9uc2l2ZVBvcG92ZXI+XG5cdFx0KTtcblxuXHRcdHRoaXMuY29udGFpbmluZ1ZpZXcuYWRkRGVwZW5kZW50KHVzZXJEZXRhaWxzUG9wb3Zlcik7XG5cblx0XHRyZXR1cm4gdXNlckRldGFpbHNQb3BvdmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gY3JlYXRlIGFuZCBvcGVuIHRoZSBtYW5hZ2UgZGlhbG9nLlxuXHQgKlxuXHQgKi9cblx0bWFuYWdlQ29sbGFib3JhdGlvbiA9ICgpID0+IHtcblx0XHRpZiAoIXRoaXMubWFuYWdlRGlhbG9nKSB7XG5cdFx0XHR0aGlzLm1hbmFnZURpYWxvZyA9IHRoaXMuZ2V0TWFuYWdlRGlhbG9nKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5yZWFkSW52aXRlZFVzZXJzKHRoaXMuY29udGFpbmluZ1ZpZXcpO1xuXHRcdHRoaXMubWFuYWdlRGlhbG9nPy5vcGVuKCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG1hbmFnZSBkaWFsb2cgdXNlZCB0byBpbnZpdGUgZnVydGhlciB1c2Vycy5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRyb2wgdHJlZVxuXHQgKi9cblx0Z2V0TWFuYWdlRGlhbG9nKCkge1xuXHRcdGNvbnN0IG1hbmFnZURpYWxvZyA9IChcblx0XHRcdDxEaWFsb2cgdGl0bGU9e3RoaXMuZ2V0SW52aXRhdGlvbkRpYWxvZ1RpdGxlRXhwQmluZGluZygpfT5cblx0XHRcdFx0e3tcblx0XHRcdFx0XHRiZWdpbkJ1dHRvbjogKFxuXHRcdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0XHR0ZXh0PXt0aGlzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfSU5WSVRBVElPTl9ESUFMT0dfQ09ORklSTUFUSU9OXCIpfVxuXHRcdFx0XHRcdFx0XHRwcmVzcz17dGhpcy5pbnZpdGVVc2VyfVxuXHRcdFx0XHRcdFx0XHR0eXBlPVwiRW1waGFzaXplZFwiXG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0ZW5kQnV0dG9uOiAoXG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdHRleHQ9e3RoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0NPTExBQk9SQVRJT05EUkFGVF9JTlZJVEFUSU9OX0RJQUxPR19DQU5DRUxcIil9XG5cdFx0XHRcdFx0XHRcdHByZXNzPXt0aGlzLmNsb3NlTWFuYWdlRGlhbG9nfVxuXHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdGNvbnRlbnQ6IChcblx0XHRcdFx0XHRcdDxWQm94IGNsYXNzPVwic2FwVWlNZWRpdW1NYXJnaW5cIj5cblx0XHRcdFx0XHRcdFx0PFZCb3ggd2lkdGg9XCI0MGVtXCI+XG5cdFx0XHRcdFx0XHRcdFx0PE1lc3NhZ2VTdHJpcFxuXHRcdFx0XHRcdFx0XHRcdFx0dGV4dD17dGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0lOVklUQVRJT05fTUVTU0FHRVNUUklQXCIpfVxuXHRcdFx0XHRcdFx0XHRcdFx0dHlwZT1cIkluZm9ybWF0aW9uXCJcblx0XHRcdFx0XHRcdFx0XHRcdHNob3dJY29uPVwidHJ1ZVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRzaG93Q2xvc2VCdXR0b249XCJmYWxzZVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRjbGFzcz1cInNhcFVpTWVkaXVtTWFyZ2luQm90dG9tXCJcblx0XHRcdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdFx0XHQ8L1ZCb3g+XG5cblx0XHRcdFx0XHRcdFx0PExhYmVsIHRleHQ9e3RoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0NPTExBQk9SQVRJT05EUkFGVF9JTlZJVEFUSU9OX0lOUFVUX0xBQkVMXCIpfSAvPlxuXG5cdFx0XHRcdFx0XHRcdHt0aGlzLmdldE1hbmFnZURpYWxvZ0FkZFVzZXJTZWN0aW9uKCl9XG5cblx0XHRcdFx0XHRcdFx0e3RoaXMuZ2V0TWFuYWdlRGlhbG9nVXNlclRhYmxlKCl9XG5cdFx0XHRcdFx0XHQ8L1ZCb3g+XG5cdFx0XHRcdFx0KVxuXHRcdFx0XHR9fVxuXHRcdFx0PC9EaWFsb2c+XG5cdFx0KTtcblxuXHRcdHRoaXMuY29udGFpbmluZ1ZpZXcuYWRkRGVwZW5kZW50KG1hbmFnZURpYWxvZyk7XG5cdFx0bWFuYWdlRGlhbG9nLmJpbmRFbGVtZW50KHtcblx0XHRcdG1vZGVsOiBcImludGVybmFsXCIsXG5cdFx0XHRwYXRoOiBcImNvbGxhYm9yYXRpb25cIlxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG1hbmFnZURpYWxvZztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSB0YWJsZSB3aXRoIHRoZSBsaXN0IG9mIGludml0ZWQgdXNlcnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjb250cm9sIHRyZWVcblx0ICovXG5cdGdldE1hbmFnZURpYWxvZ1VzZXJUYWJsZSgpIHtcblx0XHR0aGlzLm1hbmFnZURpYWxvZ1VzZXJUYWJsZSA9IChcblx0XHRcdDxUYWJsZSB3aWR0aD1cIjQwZW1cIiBpdGVtcz17eyBwYXRoOiBcImludGVybmFsPmludml0ZWRVc2Vyc1wiIH19PlxuXHRcdFx0XHR7e1xuXHRcdFx0XHRcdGhlYWRlclRvb2xiYXI6IChcblx0XHRcdFx0XHRcdDxUb29sYmFyIHdpZHRoPVwiMTAwJVwiPlxuXHRcdFx0XHRcdFx0XHQ8VGl0bGUgdGV4dD17dGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0lOVklUQVRJT05fVEFCTEVfVE9PTEJBUl9USVRMRVwiKX0gbGV2ZWw9XCJIM1wiIC8+XG5cdFx0XHRcdFx0XHRcdDxUb29sYmFyU3BhY2VyIC8+XG5cdFx0XHRcdFx0XHRcdDxTZWFyY2hGaWVsZCB3aWR0aD1cIjE1ZW1cIiAvPlxuXHRcdFx0XHRcdFx0XHRwblxuXHRcdFx0XHRcdFx0PC9Ub29sYmFyPlxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0Y29sdW1uczogKFxuXHRcdFx0XHRcdFx0PD5cblx0XHRcdFx0XHRcdFx0PENvbHVtbiB3aWR0aD1cIjNlbVwiIC8+XG5cdFx0XHRcdFx0XHRcdDxDb2x1bW4gd2lkdGg9XCIyMGVtXCI+XG5cdFx0XHRcdFx0XHRcdFx0PFRleHQgdGV4dD17dGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0lOVklUQVRJT05fVEFCTEVfVVNFUl9DT0xVTU5cIil9IC8+XG5cdFx0XHRcdFx0XHRcdDwvQ29sdW1uPlxuXHRcdFx0XHRcdFx0XHQ8Q29sdW1uIHdpZHRoPVwiMTdlbVwiPlxuXHRcdFx0XHRcdFx0XHRcdDxUZXh0IHRleHQ9e3RoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0NPTExBQk9SQVRJT05EUkFGVF9JTlZJVEFUSU9OX1RBQkxFX1VTRVJfU1RBVFVTX0NPTFVNTlwiKX0gLz5cblx0XHRcdFx0XHRcdFx0PC9Db2x1bW4+XG5cdFx0XHRcdFx0XHRcdDxDb2x1bW4gd2lkdGg9XCI1ZW1cIiAvPlxuXHRcdFx0XHRcdFx0PC8+XG5cdFx0XHRcdFx0KSxcblxuXHRcdFx0XHRcdGl0ZW1zOiAoXG5cdFx0XHRcdFx0XHQ8Q29sdW1uTGlzdEl0ZW0gdkFsaWduPVwiTWlkZGxlXCIgaGlnaGxpZ2h0PVwiez0gJHtpbnRlcm5hbD50cmFuc2llbnR9ID8gJ0luZm9ybWF0aW9uJyA6ICdOb25lJyB9XCI+XG5cdFx0XHRcdFx0XHRcdDxBdmF0YXIgZGlzcGxheVNpemU9XCJYU1wiIGJhY2tncm91bmRDb2xvcj1cIkFjY2VudHtpbnRlcm5hbD5jb2xvcn1cIiBpbml0aWFscz1cIntpbnRlcm5hbD5pbml0aWFsc31cIiAvPlxuXHRcdFx0XHRcdFx0XHQ8VGV4dCB0ZXh0PVwie2ludGVybmFsPm5hbWV9XCIgLz5cblx0XHRcdFx0XHRcdFx0PE9iamVjdFN0YXR1c1xuXHRcdFx0XHRcdFx0XHRcdHN0YXRlPXt7IHBhdGg6IFwiaW50ZXJuYWw+c3RhdHVzXCIsIGZvcm1hdHRlcjogdGhpcy5mb3JtYXRVc2VyU3RhdHVzQ29sb3IgfX1cblx0XHRcdFx0XHRcdFx0XHR0ZXh0PXt7IHBhdGg6IFwiaW50ZXJuYWw+c3RhdHVzXCIsIGZvcm1hdHRlcjogdGhpcy5mb3JtYXRVc2VyU3RhdHVzIH19XG5cdFx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0XHRcdDxIQm94PlxuXHRcdFx0XHRcdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRcdFx0XHRcdGljb249XCJzYXAtaWNvbjovL2RlY2xpbmVcIlxuXHRcdFx0XHRcdFx0XHRcdFx0dHlwZT1cIlRyYW5zcGFyZW50XCJcblx0XHRcdFx0XHRcdFx0XHRcdHByZXNzPXt0aGlzLnJlbW92ZVVzZXJ9XG5cdFx0XHRcdFx0XHRcdFx0XHR2aXNpYmxlPVwiez0gISEke2ludGVybmFsPnRyYW5zaWVudH0gfVwiXG5cdFx0XHRcdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHRcdFx0PC9IQm94PlxuXHRcdFx0XHRcdFx0PC9Db2x1bW5MaXN0SXRlbT5cblx0XHRcdFx0XHQpXG5cdFx0XHRcdH19XG5cdFx0XHQ8L1RhYmxlPlxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcy5tYW5hZ2VEaWFsb2dVc2VyVGFibGU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc2VjdGlvbiBvbiB0aGUgZGlhbG9nIHJlbGF0ZWQgdG8gdGhlIHVzZXIgZmllbGQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjb250cm9sIHRyZWVcblx0ICovXG5cdGdldE1hbmFnZURpYWxvZ0FkZFVzZXJTZWN0aW9uKCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8SEJveCBjbGFzcz1cInNhcFVpTWVkaXVtTWFyZ2luQm90dG9tXCIgd2lkdGg9XCIxMDAlXCI+XG5cdFx0XHRcdDxGaWVsZFxuXHRcdFx0XHRcdHZhbHVlPVwie2ludGVybmFsPlVzZXJJRH1cIlxuXHRcdFx0XHRcdGFkZGl0aW9uYWxWYWx1ZT1cIntpbnRlcm5hbD5Vc2VyRGVzY3JpcHRpb259XCJcblx0XHRcdFx0XHRkaXNwbGF5PVwiRGVzY3JpcHRpb25WYWx1ZVwiXG5cdFx0XHRcdFx0d2lkdGg9XCIzN2VtXCJcblx0XHRcdFx0XHRyZXF1aXJlZD1cInRydWVcIlxuXHRcdFx0XHRcdGZpZWxkSGVscD1cInVzZXJWYWx1ZUhlbHBcIlxuXHRcdFx0XHRcdHBsYWNlaG9sZGVyPXt0aGlzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfSU5WSVRBVElPTl9JTlBVVF9QTEFDRUhPTERFUlwiKX1cblx0XHRcdFx0XHRjaGFuZ2U9e3RoaXMuYWRkVXNlckZpZWxkQ2hhbmdlZH1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdHt7XG5cdFx0XHRcdFx0XHRkZXBlbmRlbnRzOiAoXG5cdFx0XHRcdFx0XHRcdDxWYWx1ZUhlbHAgaWQ9XCJ1c2VyVmFsdWVIZWxwXCIgZGVsZWdhdGU9e3RoaXMuZ2V0VmFsdWVIZWxwRGVsZWdhdGUoKX0gdmFsaWRhdGVJbnB1dD1cInRydWVcIj5cblx0XHRcdFx0XHRcdFx0XHR7e1xuXHRcdFx0XHRcdFx0XHRcdFx0dHlwZWFoZWFkOiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDxNRENQb3BvdmVyPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdDxNVGFibGUgY2FzZVNlbnNpdGl2ZT1cInRydWVcIiB1c2VBc1ZhbHVlSGVscD1cImZhbHNlXCIgLz5cblx0XHRcdFx0XHRcdFx0XHRcdFx0PC9NRENQb3BvdmVyPlxuXHRcdFx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFx0XHRcdGRpYWxvZzogPE1EQ0RpYWxvZyAvPlxuXHRcdFx0XHRcdFx0XHRcdH19XG5cdFx0XHRcdFx0XHRcdDwvVmFsdWVIZWxwPlxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdH19XG5cdFx0XHRcdDwvRmllbGQ+XG5cdFx0XHRcdDxCdXR0b25cblx0XHRcdFx0XHRjbGFzcz1cInNhcFVpVGlueU1hcmdpbkJlZ2luXCJcblx0XHRcdFx0XHR0ZXh0PXt0aGlzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfSU5WSVRBVElPTl9ESUFMT0dfQUREX1VTRVJcIil9XG5cdFx0XHRcdFx0cHJlc3M9e3RoaXMuYWRkVXNlcn1cblx0XHRcdFx0Lz5cblx0XHRcdDwvSEJveD5cblx0XHQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZvcm1hdHRlciB0byBzZXQgdGhlIHVzZXIgc3RhdHVzIGRlcGVuZGluZyBvbiB0aGUgZWRpdGluZyBzdGF0dXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB1c2VyU3RhdHVzIFRoZSBlZGl0aW5nIHN0YXR1cyBvZiB0aGUgdXNlclxuXHQgKiBAcmV0dXJucyBUaGUgdXNlciBzdGF0dXNcblx0ICovXG5cdGZvcm1hdFVzZXJTdGF0dXMgPSAodXNlclN0YXR1czogVXNlclN0YXR1cykgPT4ge1xuXHRcdHN3aXRjaCAodXNlclN0YXR1cykge1xuXHRcdFx0Y2FzZSBVc2VyU3RhdHVzLkN1cnJlbnRseUVkaXRpbmc6XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfVVNFUl9DVVJSRU5UTFlfRURJVElOR1wiKTtcblx0XHRcdGNhc2UgVXNlclN0YXR1cy5DaGFuZ2VzTWFkZTpcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0NPTExBQk9SQVRJT05EUkFGVF9VU0VSX0NIQU5HRVNfTUFERVwiKTtcblx0XHRcdGNhc2UgVXNlclN0YXR1cy5Ob0NoYW5nZXNNYWRlOlxuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX1VTRVJfTk9fQ0hBTkdFU19NQURFXCIpO1xuXHRcdFx0Y2FzZSBVc2VyU3RhdHVzLk5vdFlldEludml0ZWQ6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX1VTRVJfTk9UX1lFVF9JTlZJVEVEXCIpO1xuXHRcdH1cblx0fTtcblxuXHQvKipcblx0ICogRm9ybWF0dGVyIHRvIHNldCB0aGUgdXNlciBjb2xvciBkZXBlbmRpbmcgb24gdGhlIGVkaXRpbmcgc3RhdHVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gdXNlclN0YXR1cyBUaGUgZWRpdGluZyBzdGF0dXMgb2YgdGhlIHVzZXJcblx0ICogQHJldHVybnMgVGhlIHVzZXIgc3RhdHVzIGNvbG9yXG5cdCAqL1xuXHRmb3JtYXRVc2VyU3RhdHVzQ29sb3IodXNlclN0YXR1czogVXNlclN0YXR1cykge1xuXHRcdHN3aXRjaCAodXNlclN0YXR1cykge1xuXHRcdFx0Y2FzZSBVc2VyU3RhdHVzLkN1cnJlbnRseUVkaXRpbmc6XG5cdFx0XHRcdHJldHVybiBWYWx1ZVN0YXRlLlN1Y2Nlc3M7XG5cdFx0XHRjYXNlIFVzZXJTdGF0dXMuQ2hhbmdlc01hZGU6XG5cdFx0XHRcdHJldHVybiBWYWx1ZVN0YXRlLldhcm5pbmc7XG5cdFx0XHRjYXNlIFVzZXJTdGF0dXMuTm9DaGFuZ2VzTWFkZTpcblx0XHRcdGNhc2UgVXNlclN0YXR1cy5Ob3RZZXRJbnZpdGVkOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0cmV0dXJuIFZhbHVlU3RhdGUuSW5mb3JtYXRpb247XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gYWRkIHRoZSBlbnRlcmVkIHVzZXIgdG8gdGhlIGxpc3Qgb2YgaW52aXRlZCB1c2Vycy5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBvYmplY3Qgb2YgdGhlIHJlbW92ZSBidXR0b25cblx0ICovXG5cdGFkZFVzZXIoZXZlbnQ6IEV2ZW50KSB7XG5cdFx0Y29uc3QgYWRkQnV0dG9uID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgQnV0dG9uO1xuXHRcdGNvbnN0IGludGVybmFsTW9kZWxDb250ZXh0ID0gYWRkQnV0dG9uLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0Y29uc3QgaW52aXRlZFVzZXJzOiBVc2VyW10gPSBpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcImludml0ZWRVc2Vyc1wiKSB8fCBbXTtcblx0XHRjb25zdCBhY3RpdmVVc2VycyA9IChhZGRCdXR0b24uZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwpLmdldFByb3BlcnR5KFwiL2NvbGxhYm9yYXRpb24vYWN0aXZlVXNlcnNcIik7XG5cdFx0Y29uc3QgbmV3VXNlcjogVXNlciA9IHtcblx0XHRcdGlkOiBpbnRlcm5hbE1vZGVsQ29udGV4dD8uZ2V0UHJvcGVydHkoXCJVc2VySURcIiksXG5cdFx0XHRuYW1lOiBpbnRlcm5hbE1vZGVsQ29udGV4dD8uZ2V0UHJvcGVydHkoXCJVc2VyRGVzY3JpcHRpb25cIilcblx0XHR9O1xuXG5cdFx0aWYgKCEoaW52aXRlZFVzZXJzLmZpbmRJbmRleCgodXNlcikgPT4gdXNlci5pZCA9PT0gbmV3VXNlci5pZCkgPiAtMSB8fCAobmV3VXNlci5pZCA9PT0gbmV3VXNlci5uYW1lICYmIG5ld1VzZXIuaWQgPT09IFwiXCIpKSkge1xuXHRcdFx0bmV3VXNlci5uYW1lID0gbmV3VXNlci5uYW1lIHx8IG5ld1VzZXIuaWQ7XG5cdFx0XHRuZXdVc2VyLmluaXRpYWxzID0gQ29sbGFib3JhdGlvblV0aWxzLmZvcm1hdEluaXRpYWxzKG5ld1VzZXIubmFtZSk7XG5cdFx0XHRuZXdVc2VyLmNvbG9yID0gQ29sbGFib3JhdGlvblV0aWxzLmdldFVzZXJDb2xvcihuZXdVc2VyLmlkLCBhY3RpdmVVc2VycywgaW52aXRlZFVzZXJzKTtcblx0XHRcdG5ld1VzZXIudHJhbnNpZW50ID0gdHJ1ZTtcblx0XHRcdG5ld1VzZXIuc3RhdHVzID0gVXNlclN0YXR1cy5Ob3RZZXRJbnZpdGVkO1xuXHRcdFx0aW52aXRlZFVzZXJzLnVuc2hpZnQobmV3VXNlcik7XG5cdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImludml0ZWRVc2Vyc1wiLCBpbnZpdGVkVXNlcnMpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJVc2VySURcIiwgXCJcIik7XG5cdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcIlVzZXJEZXNjcmlwdGlvblwiLCBcIlwiKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgdmFsdWUgc3RhdGUgb2YgdGhlIHVzZXIgZmllbGQgd2hlbmV2ZXIgY2hhbmdlZC5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBvYmplY3Qgb2YgdGhlIHJlbW92ZSBidXR0b25cblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIG9uY2UgdGhlIHZhbHVlIHN0YXRlIHdhcyBzZXQuXG5cdCAqL1xuXHRhZGRVc2VyRmllbGRDaGFuZ2VkID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuXHRcdGNvbnN0IHVzZXJJbnB1dCA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIElucHV0O1xuXHRcdHJldHVybiBldmVudFxuXHRcdFx0LmdldFBhcmFtZXRlcihcInByb21pc2VcIilcblx0XHRcdC50aGVuKFxuXHRcdFx0XHRmdW5jdGlvbiAodGhpczogQ29sbGFib3JhdGlvbkRyYWZ0LCBuZXdVc2VySWQ6IHN0cmluZykge1xuXHRcdFx0XHRcdGNvbnN0IGludGVybmFsTW9kZWxDb250ZXh0ID0gdXNlcklucHV0LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRcdFx0Y29uc3QgaW52aXRlZFVzZXJzOiBVc2VyW10gPSBpbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcImludml0ZWRVc2Vyc1wiKSB8fCBbXTtcblx0XHRcdFx0XHRpZiAoaW52aXRlZFVzZXJzLmZpbmRJbmRleCgodXNlcikgPT4gdXNlci5pZCA9PT0gbmV3VXNlcklkKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHR1c2VySW5wdXQuc2V0VmFsdWVTdGF0ZShcIkVycm9yXCIpO1xuXHRcdFx0XHRcdFx0dXNlcklucHV0LnNldFZhbHVlU3RhdGVUZXh0KHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0NPTExBQk9SQVRJT05EUkFGVF9JTlZJVEFUSU9OX1VTRVJfRVJST1JcIikpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR1c2VySW5wdXQuc2V0VmFsdWVTdGF0ZShcIk5vbmVcIik7XG5cdFx0XHRcdFx0XHR1c2VySW5wdXQuc2V0VmFsdWVTdGF0ZVRleHQoXCJcIik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LmJpbmQodGhpcylcblx0XHRcdClcblx0XHRcdC5jYXRjaChcblx0XHRcdFx0ZnVuY3Rpb24gKHRoaXM6IENvbGxhYm9yYXRpb25EcmFmdCkge1xuXHRcdFx0XHRcdHVzZXJJbnB1dC5zZXRWYWx1ZVN0YXRlKFwiV2FybmluZ1wiKTtcblx0XHRcdFx0XHR1c2VySW5wdXQuc2V0VmFsdWVTdGF0ZVRleHQodGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0lOVklUQVRJT05fVVNFUl9OT1RfRk9VTkRcIikpO1xuXHRcdFx0XHR9LmJpbmQodGhpcylcblx0XHRcdCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVtb3ZlIGEgdXNlciBmcm9tIHRoZSBsaXN0IG9mIGludml0ZWQgdXNlci5cblx0ICpcblx0ICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCBvYmplY3Qgb2YgdGhlIHJlbW92ZSBidXR0b25cblx0ICovXG5cdHJlbW92ZVVzZXIoZXZlbnQ6IEV2ZW50KSB7XG5cdFx0Y29uc3QgaXRlbSA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2w7XG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbENvbnRleHQgPSBpdGVtPy5nZXRCaW5kaW5nQ29udGV4dChcInBhZ2VJbnRlcm5hbFwiKTtcblx0XHRjb25zdCBkZWxldGVVc2VySUQgPSBpdGVtPy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpPy5nZXRQcm9wZXJ0eShcImlkXCIpO1xuXHRcdGxldCBpbnZpdGVkVXNlcnM6IFVzZXJbXSA9IGludGVybmFsTW9kZWxDb250ZXh0Py5nZXRQcm9wZXJ0eShcImNvbGxhYm9yYXRpb24vaW52aXRlZFVzZXJzXCIpO1xuXHRcdGludml0ZWRVc2VycyA9IGludml0ZWRVc2Vycy5maWx0ZXIoKHVzZXIpID0+IHVzZXIuaWQgIT09IGRlbGV0ZVVzZXJJRCk7XG5cdFx0aW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwiY29sbGFib3JhdGlvbi9pbnZpdGVkVXNlcnNcIiwgaW52aXRlZFVzZXJzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsIHRoZSBzaGFyZSBhY3Rpb24gdG8gdXBkYXRlIHRoZSBsaXN0IG9mIGludml0ZWQgdXNlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBldmVudCBUaGUgZXZlbnQgb2JqZWN0IG9mIHRoZSBpbnZpdGUgYnV0dG9uXG5cdCAqL1xuXHRpbnZpdGVVc2VyID0gYXN5bmMgKGV2ZW50OiBFdmVudCkgPT4ge1xuXHRcdGNvbnN0IHVzZXJzOiBCYWNrZW5kVXNlcltdID0gW107XG5cdFx0Y29uc3Qgc291cmNlID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgQ29udHJvbDtcblx0XHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IHNvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0Y29uc3QgY29udGV4dHMgPSAodGhpcy5tYW5hZ2VEaWFsb2dVc2VyVGFibGU/LmdldEJpbmRpbmcoXCJpdGVtc1wiKSBhcyBPRGF0YUxpc3RCaW5kaW5nKS5nZXRDb250ZXh0cygpO1xuXHRcdGxldCBudW1iZXJPZk5ld0ludml0ZWRVc2VycyA9IDA7XG5cdFx0Y29udGV4dHMuZm9yRWFjaChmdW5jdGlvbiAoY29udGV4dCkge1xuXHRcdFx0dXNlcnMucHVzaCh7XG5cdFx0XHRcdFVzZXJJRDogY29udGV4dC5nZXRQcm9wZXJ0eShcImlkXCIpLFxuXHRcdFx0XHRVc2VyQWNjZXNzUm9sZTogXCJPXCIgLy8gRm9yIG5vdyBhY2NvcmRpbmcgdG8gVVggZXZlcnkgdXNlciByZXRyaWV2ZXMgdGhlIG93bmVyIHJvbGVcblx0XHRcdH0pO1xuXHRcdFx0aWYgKGNvbnRleHQuZ2V0T2JqZWN0KCkuc3RhdHVzID09PSAwKSB7XG5cdFx0XHRcdG51bWJlck9mTmV3SW52aXRlZFVzZXJzKys7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgc2hhcmVPYmplY3QoYmluZGluZ0NvbnRleHQsIHVzZXJzKTtcblx0XHRcdE1lc3NhZ2VUb2FzdC5zaG93KFxuXHRcdFx0XHR0aGlzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfSU5WSVRBVElPTl9TVUNDRVNTX1RPQVNUXCIsXG5cdFx0XHRcdFx0W251bWJlck9mTmV3SW52aXRlZFVzZXJzLnRvU3RyaW5nKCldLFxuXHRcdFx0XHRcdHRoaXMuZ2V0U2hhcmVkSXRlbU5hbWUoYmluZGluZ0NvbnRleHQpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSBjYXRjaCB7XG5cdFx0XHRNZXNzYWdlVG9hc3Quc2hvdyh0aGlzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfSU5WSVRBVElPTl9GQUlMRURfVE9BU1RcIikpO1xuXHRcdH1cblx0XHR0aGlzLmNsb3NlTWFuYWdlRGlhbG9nKCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIFJlYWRzIHRoZSBjdXJyZW50bHkgaW52aXRlZCB1c2VyIGFuZCBzdG9yZSBpdCBpbiB0aGUgaW50ZXJuYWwgbW9kZWwuXG5cdCAqXG5cdCAqIEBwYXJhbSB2aWV3IFRoZSBjdXJyZW50IHZpZXdcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIG9uY2UgdGhlIHVzZXJzIGFyZSByZWFkLlxuXHQgKi9cblx0cmVhZEludml0ZWRVc2VycyA9IGFzeW5jICh2aWV3OiBGRVZpZXcpID0+IHtcblx0XHRjb25zdCBtb2RlbCA9IHZpZXcuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBwYXJhbWV0ZXJzID0ge1xuXHRcdFx0JHNlbGVjdDogXCJVc2VySUQsVXNlckRlc2NyaXB0aW9uLFVzZXJFZGl0aW5nU3RhdGVcIlxuXHRcdH07XG5cdFx0Y29uc3QgaW52aXRlZFVzZXJMaXN0ID0gbW9kZWwuYmluZExpc3QoXG5cdFx0XHRcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0QWRtaW5pc3RyYXRpdmVVc2VyXCIsXG5cdFx0XHR2aWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCxcblx0XHRcdFtdLFxuXHRcdFx0W10sXG5cdFx0XHRwYXJhbWV0ZXJzXG5cdFx0KTtcblx0XHRjb25zdCBpbnRlcm5hbE1vZGVsQ29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblxuXHRcdC8vIGZvciBub3cgd2Ugc2V0IGEgbGltaXQgdG8gMTAwLiB0aGVyZSBzaG91bGRuJ3QgYmUgbW9yZSB0aGFuIGEgZmV3XG5cdFx0cmV0dXJuIGludml0ZWRVc2VyTGlzdFxuXHRcdFx0LnJlcXVlc3RDb250ZXh0cygwLCAxMDApXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoY29udGV4dHMpIHtcblx0XHRcdFx0Y29uc3QgaW52aXRlZFVzZXJzOiBVc2VyW10gPSBbXTtcblx0XHRcdFx0Y29uc3QgYWN0aXZlVXNlcnMgPSB2aWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIikuZ2V0UHJvcGVydHkoXCIvY29sbGFib3JhdGlvbi9hY3RpdmVVc2Vyc1wiKSB8fCBbXTtcblx0XHRcdFx0Y29uc3QgbWUgPSBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0TWUodmlldyk7XG5cdFx0XHRcdGxldCB1c2VyU3RhdHVzOiBVc2VyU3RhdHVzO1xuXHRcdFx0XHRpZiAoY29udGV4dHM/Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRjb250ZXh0cy5mb3JFYWNoKGZ1bmN0aW9uIChvQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgdXNlckRhdGEgPSBvQ29udGV4dC5nZXRPYmplY3QoKSBhcyBCYWNrZW5kVXNlcjtcblx0XHRcdFx0XHRcdGNvbnN0IGlzTWU6IGJvb2xlYW4gPSBtZT8uaWQgPT09IHVzZXJEYXRhLlVzZXJJRDtcblx0XHRcdFx0XHRcdGNvbnN0IGlzQWN0aXZlID0gYWN0aXZlVXNlcnMuZmluZCgodTogVXNlcikgPT4gdS5pZCA9PT0gdXNlckRhdGEuVXNlcklEKTtcblx0XHRcdFx0XHRcdGxldCB1c2VyRGVzY3JpcHRpb24gPSB1c2VyRGF0YS5Vc2VyRGVzY3JpcHRpb24gfHwgdXNlckRhdGEuVXNlcklEO1xuXHRcdFx0XHRcdFx0Y29uc3QgaW5pdGlhbHMgPSBDb2xsYWJvcmF0aW9uVXRpbHMuZm9ybWF0SW5pdGlhbHModXNlckRlc2NyaXB0aW9uKTtcblx0XHRcdFx0XHRcdHVzZXJEZXNjcmlwdGlvbiArPSBpc01lID8gYCAoJHtDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0VGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX1lPVVwiKX0pYCA6IFwiXCI7XG5cdFx0XHRcdFx0XHRpZiAoaXNBY3RpdmUpIHtcblx0XHRcdFx0XHRcdFx0dXNlclN0YXR1cyA9IFVzZXJTdGF0dXMuQ3VycmVudGx5RWRpdGluZztcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodXNlckRhdGEuVXNlckVkaXRpbmdTdGF0ZSA9PT0gVXNlckVkaXRpbmdTdGF0ZS5JblByb2dyZXNzKSB7XG5cdFx0XHRcdFx0XHRcdHVzZXJTdGF0dXMgPSBVc2VyU3RhdHVzLkNoYW5nZXNNYWRlO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dXNlclN0YXR1cyA9IFVzZXJTdGF0dXMuTm9DaGFuZ2VzTWFkZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Y29uc3QgdXNlcjogVXNlciA9IHtcblx0XHRcdFx0XHRcdFx0aWQ6IHVzZXJEYXRhLlVzZXJJRCxcblx0XHRcdFx0XHRcdFx0bmFtZTogdXNlckRlc2NyaXB0aW9uLFxuXHRcdFx0XHRcdFx0XHRzdGF0dXM6IHVzZXJTdGF0dXMsXG5cdFx0XHRcdFx0XHRcdGNvbG9yOiBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0VXNlckNvbG9yKHVzZXJEYXRhLlVzZXJJRCwgYWN0aXZlVXNlcnMsIGludml0ZWRVc2VycyksXG5cdFx0XHRcdFx0XHRcdGluaXRpYWxzOiBpbml0aWFscyxcblx0XHRcdFx0XHRcdFx0bWU6IGlzTWVcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpbnZpdGVkVXNlcnMucHVzaCh1c2VyKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvL25vdCB5ZXQgc2hhcmVkLCBqdXN0IGFkZCBtZVxuXHRcdFx0XHRcdGludml0ZWRVc2Vycy5wdXNoKG1lKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNvbGxhYm9yYXRpb24vVXNlcklEXCIsIFwiXCIpO1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNvbGxhYm9yYXRpb24vVXNlckRlc2NyaXB0aW9uXCIsIFwiXCIpO1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNvbGxhYm9yYXRpb24vaW52aXRlZFVzZXJzXCIsIGludml0ZWRVc2Vycyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKFxuXHRcdFx0XHRmdW5jdGlvbiAodGhpczogQ29sbGFib3JhdGlvbkRyYWZ0KSB7XG5cdFx0XHRcdFx0TWVzc2FnZVRvYXN0LnNob3codGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX1JFQURJTkdfVVNFUl9GQUlMRURcIikpO1xuXHRcdFx0XHR9LmJpbmQodGhpcylcblx0XHRcdCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIEdldCB0aGUgbmFtZSBvZiB0aGUgb2JqZWN0IHRvIGJlIHNoYXJlZC5cblx0ICpcblx0ICogQHBhcmFtIGJpbmRpbmdDb250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBwYWdlLlxuXHQgKiBAcmV0dXJucyBUaGUgbmFtZSBvZiB0aGUgb2JqZWN0IHRvIGJlIHNoYXJlZC5cblx0ICovXG5cdGdldFNoYXJlZEl0ZW1OYW1lKGJpbmRpbmdDb250ZXh0OiBDb250ZXh0KTogc3RyaW5nIHtcblx0XHRjb25zdCBoZWFkZXJJbmZvID0gdGhpcy5jb250ZXh0T2JqZWN0LnRhcmdldE9iamVjdC5lbnRpdHlUeXBlLmFubm90YXRpb25zLlVJPy5IZWFkZXJJbmZvO1xuXHRcdGxldCBzaGFyZWRJdGVtTmFtZSA9IFwiXCI7XG5cdFx0Y29uc3QgdGl0bGUgPSBoZWFkZXJJbmZvPy5UaXRsZTtcblx0XHRpZiAodGl0bGUpIHtcblx0XHRcdHNoYXJlZEl0ZW1OYW1lID0gaXNQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24odGl0bGUuVmFsdWUpID8gYmluZGluZ0NvbnRleHQuZ2V0UHJvcGVydHkodGl0bGUuVmFsdWUucGF0aCkgOiB0aXRsZS5WYWx1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIHNoYXJlZEl0ZW1OYW1lIHx8IGhlYWRlckluZm8/LlR5cGVOYW1lIHx8IFwiXCI7XG5cdH1cblxuXHQvKipcblx0ICogR2VuZXJhdGVzIHRoZSBkZWxlZ2F0ZSBwYXlsb2FkIGZvciB0aGUgdXNlciBmaWVsZCB2YWx1ZSBoZWxwLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgdmFsdWUgaGVscCBkZWxlZ2F0ZSBwYXlsb2FkXG5cdCAqL1xuXHRnZXRWYWx1ZUhlbHBEZWxlZ2F0ZSgpOiB7IG5hbWU6IHN0cmluZzsgcGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCB9IHtcblx0XHQvLyBUaGUgbm9uIG51bGwgYXNzZXJ0aW9uIGlzIHNhZmUgaGVyZSwgYmVjYXVzZSB0aGUgYWN0aW9uIGlzIG9ubHkgYXZhaWxhYmxlIGlmIHRoZSBhbm5vdGF0aW9uIGlzIHByZXNlbnRcblx0XHRjb25zdCBhY3Rpb25OYW1lID0gKFxuXHRcdFx0dGhpcy5jb250ZXh0T2JqZWN0LnRhcmdldEVudGl0eVNldCEuYW5ub3RhdGlvbnMuQ29tbW9uIGFzIEVudGl0eVNldEFubm90YXRpb25zX0NvbW1vblxuXHRcdCkuRHJhZnRSb290IS5TaGFyZUFjdGlvbiEudG9TdHJpbmcoKTtcblx0XHQvLyBXZSBhcmUgYWxzbyBzdXJlIHRoYXQgdGhlIGFjdGlvbiBleGlzdFxuXHRcdGNvbnN0IGFjdGlvbiA9IHRoaXMuY29udGV4dE9iamVjdC50YXJnZXRFbnRpdHlUeXBlLnJlc29sdmVQYXRoKGFjdGlvbk5hbWUpIGFzIFZvY2FidWxhcnlBY3Rpb247XG5cdFx0Ly8gQnkgZGVmaW5pdGlvbiB0aGUgYWN0aW9uIGhhcyBhIHBhcmFtZXRlciB3aXRoIHRoZSBuYW1lIFwiVXNlcnNcIlxuXHRcdGNvbnN0IHVzZXJQYXJhbWV0ZXJzID0gYWN0aW9uLnBhcmFtZXRlcnMuZmluZCgocGFyYW0pID0+IHBhcmFtLm5hbWUgPT09IFVTRVJTX1BBUkFNRVRFUlMpITtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiBcInNhcC9mZS9tYWNyb3MvdmFsdWVoZWxwL1ZhbHVlSGVscERlbGVnYXRlXCIsXG5cdFx0XHRwYXlsb2FkOiB7XG5cdFx0XHRcdHByb3BlcnR5UGF0aDogYC8ke3VzZXJQYXJhbWV0ZXJzLnR5cGV9LyR7VVNFUl9JRF9QQVJBTUVURVJ9YCxcblx0XHRcdFx0cXVhbGlmaWVyczoge30sXG5cdFx0XHRcdHZhbHVlSGVscFF1YWxpZmllcjogXCJcIixcblx0XHRcdFx0aXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2c6IHRydWVcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdlbmVyYXRlIHRoZSBleHByZXNzaW9uIGJpbmRpbmcgb2YgdGhlIEludml0YXRpb24gZGlhbG9nLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgZGlhbG9nIHRpdGxlIGJpbmRpbmcgZXhwcmVzc2lvblxuXHQgKi9cblx0Z2V0SW52aXRhdGlvbkRpYWxvZ1RpdGxlRXhwQmluZGluZygpOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdFx0Y29uc3QgaGVhZGVySW5mbyA9IHRoaXMuY29udGV4dE9iamVjdC50YXJnZXRFbnRpdHlUeXBlLmFubm90YXRpb25zLlVJPy5IZWFkZXJJbmZvO1xuXHRcdGNvbnN0IHRpdGxlID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKChoZWFkZXJJbmZvPy5UaXRsZSBhcyBEYXRhRmllbGQgfCB1bmRlZmluZWQpPy5WYWx1ZSwgW10sIFwiXCIpO1xuXHRcdGNvbnN0IHBhcmFtcyA9IFtcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0lOVklUQVRJT05fRElBTE9HXCIsIGNvbnN0YW50KGhlYWRlckluZm8/LlR5cGVOYW1lKSwgdGl0bGVdO1xuXHRcdGNvbnN0IHRpdGxlRXhwcmVzc2lvbiA9IGZvcm1hdFJlc3VsdChwYXJhbXMsIGNvbGxhYm9yYXRpb25Gb3JtYXR0ZXIuZ2V0Rm9ybWF0dGVkVGV4dCk7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKHRpdGxlRXhwcmVzc2lvbik7XG5cdH1cblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byBjbG9zZSB0aGUgbWFuYWdlIGRpYWxvZy5cblx0ICpcblx0ICovXG5cdGNsb3NlTWFuYWdlRGlhbG9nID0gKCkgPT4ge1xuXHRcdHRoaXMubWFuYWdlRGlhbG9nPy5jbG9zZSgpO1xuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBpbnZpdGUgYnV0dG9uIGlmIHRoZXJlJ3MgYSBzaGFyZSBhY3Rpb24gb24gcm9vdCBsZXZlbC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGNvbnRyb2wgdHJlZVxuXHQgKi9cblx0Z2V0SW52aXRlQnV0dG9uKCkge1xuXHRcdGlmICgodGhpcy5jb250ZXh0T2JqZWN0LnRhcmdldEVudGl0eVNldD8uYW5ub3RhdGlvbnMuQ29tbW9uIGFzIEVudGl0eVNldEFubm90YXRpb25zX0NvbW1vbik/LkRyYWZ0Um9vdD8uU2hhcmVBY3Rpb24pIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdDxIQm94IHZpc2libGU9XCJ7dWk+L2lzRWRpdGFibGV9XCIgYWxpZ25JdGVtcz1cIkNlbnRlclwiIGp1c3RpZnlDb250ZW50PVwiU3RhcnRcIj5cblx0XHRcdFx0XHQ8QXZhdGFyIGJhY2tncm91bmRDb2xvcj1cIlRpbGVJY29uXCIgc3JjPVwic2FwLWljb246Ly9hZGQtZW1wbG95ZWVcIiBkaXNwbGF5U2l6ZT1cIlhTXCIgcHJlc3M9e3RoaXMubWFuYWdlQ29sbGFib3JhdGlvbn0gLz5cblx0XHRcdFx0PC9IQm94PlxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIDxIQm94IC8+O1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjb250ZW50IG9mIHRoZSBjb2xsYWJvcmF0aW9uIGRyYWZ0IGJ1aWxkaW5nIGJsb2NrLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmlldyBUaGUgdmlldyBmb3Igd2hpY2ggdGhlIGJ1aWxkaW5nIGJsb2NrIGlzIGNyZWF0ZWRcblx0ICogQHJldHVybnMgVGhlIGNvbnRyb2wgdHJlZVxuXHQgKi9cblx0Z2V0Q29udGVudCh2aWV3OiBGRVZpZXcpIHtcblx0XHR0aGlzLmNvbnRhaW5pbmdWaWV3ID0gdmlldztcblxuXHRcdGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCh0aGlzLmNvbnRleHRQYXRoLmdldE1vZGVsKCkpKSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQ8PlxuXHRcdFx0XHRcdDxIQm94XG5cdFx0XHRcdFx0XHRpdGVtcz17eyBwYXRoOiBcImludGVybmFsPi9jb2xsYWJvcmF0aW9uL2FjdGl2ZVVzZXJzXCIgfX1cblx0XHRcdFx0XHRcdGNsYXNzPVwic2FwVWlUaW55TWFyZ2luQmVnaW5cIlxuXHRcdFx0XHRcdFx0dmlzaWJsZT1cIns9ICR7dWk+L2lzRWRpdGFibGV9ICZhbXA7JmFtcDsgJHtpbnRlcm5hbD4vY29sbGFib3JhdGlvbi9jb25uZWN0ZWR9IH1cIlxuXHRcdFx0XHRcdFx0YWxpZ25JdGVtcz1cIkNlbnRlclwiXG5cdFx0XHRcdFx0XHRqdXN0aWZ5Q29udGVudD1cIlN0YXJ0XCJcblx0XHRcdFx0XHQ+XG5cdFx0XHRcdFx0XHQ8QXZhdGFyXG5cdFx0XHRcdFx0XHRcdGluaXRpYWxzPVwie2ludGVybmFsPmluaXRpYWxzfVwiXG5cdFx0XHRcdFx0XHRcdGRpc3BsYXlTaXplPVwiWFNcIlxuXHRcdFx0XHRcdFx0XHRiYWNrZ3JvdW5kQ29sb3I9XCJBY2NlbnR7aW50ZXJuYWw+Y29sb3J9XCJcblx0XHRcdFx0XHRcdFx0cHJlc3M9e3RoaXMuc2hvd0NvbGxhYm9yYXRpb25Vc2VyRGV0YWlsc31cblx0XHRcdFx0XHRcdC8+XG5cdFx0XHRcdFx0PC9IQm94PlxuXHRcdFx0XHRcdHt0aGlzLmdldEludml0ZUJ1dHRvbigpfVxuXHRcdFx0XHQ8Lz5cblx0XHRcdCk7XG5cdFx0fVxuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUE0REEsTUFBTUEsZ0JBQWdCLEdBQUcsT0FBTztFQUNoQyxNQUFNQyxpQkFBaUIsR0FBRyxRQUFRO0VBQUMsSUFHZEMsa0JBQWtCLFdBRHRDQyxtQkFBbUIsQ0FBQztJQUFFQyxJQUFJLEVBQUUsb0JBQW9CO0lBQUVDLFNBQVMsRUFBRTtFQUF5QyxDQUFDLENBQUMsVUFFdkdDLGNBQWMsQ0FBQztJQUFFQyxJQUFJLEVBQUUsc0JBQXNCO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQUdoRUYsY0FBYyxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQztJQUFBO0lBYW5DLDRCQUFZRSxLQUF1QyxFQUF3QjtNQUFBO01BQUEsa0NBQW5CQyxNQUFNO1FBQU5BLE1BQU07TUFBQTtNQUM3RCx5Q0FBTUQsS0FBSyxFQUFFLEdBQUdDLE1BQU0sQ0FBQztNQUFDO01BQUE7TUFBQSxNQVN6QkMsNEJBQTRCLEdBQUcsTUFBT0MsS0FBWSxJQUFLO1FBQUE7UUFDdEQsTUFBTUMsTUFBTSxHQUFHRCxLQUFLLENBQUNFLFNBQVMsRUFBYTtRQUMzQyxJQUFJLENBQUMsTUFBS0Msa0JBQWtCLEVBQUU7VUFDN0IsTUFBS0Esa0JBQWtCLEdBQUcsTUFBS0MscUJBQXFCLEVBQUU7UUFDdkQ7UUFFQSwrQkFBS0Qsa0JBQWtCLDBEQUF2QixzQkFBeUJFLGlCQUFpQixDQUFDSixNQUFNLENBQUNLLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxFQUEwQixVQUFVLENBQUM7UUFDcEgsZ0NBQUtILGtCQUFrQiwyREFBdkIsdUJBQXlCSSxNQUFNLENBQUNOLE1BQU0sRUFBRSxLQUFLLENBQUM7TUFDL0MsQ0FBQztNQUFBLE1BNkJETyxtQkFBbUIsR0FBRyxNQUFNO1FBQUE7UUFDM0IsSUFBSSxDQUFDLE1BQUtDLFlBQVksRUFBRTtVQUN2QixNQUFLQSxZQUFZLEdBQUcsTUFBS0MsZUFBZSxFQUFFO1FBQzNDO1FBRUEsTUFBS0MsZ0JBQWdCLENBQUMsTUFBS0MsY0FBYyxDQUFDO1FBQzFDLDRCQUFLSCxZQUFZLHVEQUFqQixtQkFBbUJJLElBQUksRUFBRTtNQUMxQixDQUFDO01BQUEsTUErSkRDLGdCQUFnQixHQUFJQyxVQUFzQixJQUFLO1FBQzlDLFFBQVFBLFVBQVU7VUFDakIsS0FBS0MsVUFBVSxDQUFDQyxnQkFBZ0I7WUFDL0IsT0FBTyxNQUFLQyxpQkFBaUIsQ0FBQyw2Q0FBNkMsQ0FBQztVQUM3RSxLQUFLRixVQUFVLENBQUNHLFdBQVc7WUFDMUIsT0FBTyxNQUFLRCxpQkFBaUIsQ0FBQyx3Q0FBd0MsQ0FBQztVQUN4RSxLQUFLRixVQUFVLENBQUNJLGFBQWE7WUFDNUIsT0FBTyxNQUFLRixpQkFBaUIsQ0FBQywyQ0FBMkMsQ0FBQztVQUMzRSxLQUFLRixVQUFVLENBQUNLLGFBQWE7VUFDN0I7WUFDQyxPQUFPLE1BQUtILGlCQUFpQixDQUFDLDJDQUEyQyxDQUFDO1FBQUM7TUFFOUUsQ0FBQztNQUFBLE1BdURESSxtQkFBbUIsR0FBSXRCLEtBQVksSUFBSztRQUN2QyxNQUFNdUIsU0FBUyxHQUFHdkIsS0FBSyxDQUFDRSxTQUFTLEVBQVc7UUFDNUMsT0FBT0YsS0FBSyxDQUNWd0IsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUN2QkMsSUFBSSxDQUNKLFVBQW9DQyxTQUFpQixFQUFFO1VBQ3RELE1BQU1DLG9CQUFvQixHQUFHSixTQUFTLENBQUNqQixpQkFBaUIsQ0FBQyxVQUFVLENBQXlCO1VBQzVGLE1BQU1zQixZQUFvQixHQUFHRCxvQkFBb0IsQ0FBQ0UsV0FBVyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUU7VUFDbkYsSUFBSUQsWUFBWSxDQUFDRSxTQUFTLENBQUVDLElBQUksSUFBS0EsSUFBSSxDQUFDQyxFQUFFLEtBQUtOLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ2pFSCxTQUFTLENBQUNVLGFBQWEsQ0FBQyxPQUFPLENBQUM7WUFDaENWLFNBQVMsQ0FBQ1csaUJBQWlCLENBQUMsSUFBSSxDQUFDaEIsaUJBQWlCLENBQUMsNENBQTRDLENBQUMsQ0FBQztVQUNsRyxDQUFDLE1BQU07WUFDTkssU0FBUyxDQUFDVSxhQUFhLENBQUMsTUFBTSxDQUFDO1lBQy9CVixTQUFTLENBQUNXLGlCQUFpQixDQUFDLEVBQUUsQ0FBQztVQUNoQztRQUNELENBQUMsQ0FBQ0MsSUFBSSwrQkFBTSxDQUNaLENBQ0FDLEtBQUssQ0FDTCxZQUFvQztVQUNuQ2IsU0FBUyxDQUFDVSxhQUFhLENBQUMsU0FBUyxDQUFDO1VBQ2xDVixTQUFTLENBQUNXLGlCQUFpQixDQUFDLElBQUksQ0FBQ2hCLGlCQUFpQixDQUFDLGdEQUFnRCxDQUFDLENBQUM7UUFDdEcsQ0FBQyxDQUFDaUIsSUFBSSwrQkFBTSxDQUNaO01BQ0gsQ0FBQztNQUFBLE1BcUJERSxVQUFVLEdBQUcsTUFBT3JDLEtBQVksSUFBSztRQUFBO1FBQ3BDLE1BQU1zQyxLQUFvQixHQUFHLEVBQUU7UUFDL0IsTUFBTXJDLE1BQU0sR0FBR0QsS0FBSyxDQUFDRSxTQUFTLEVBQWE7UUFDM0MsTUFBTXFDLGNBQWMsR0FBR3RDLE1BQU0sQ0FBQ0ssaUJBQWlCLEVBQWE7UUFDNUQsTUFBTWtDLFFBQVEsR0FBRywwQkFBQyxNQUFLQyxxQkFBcUIsMERBQTFCLHNCQUE0QkMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFzQkMsV0FBVyxFQUFFO1FBQ3BHLElBQUlDLHVCQUF1QixHQUFHLENBQUM7UUFDL0JKLFFBQVEsQ0FBQ0ssT0FBTyxDQUFDLFVBQVVDLE9BQU8sRUFBRTtVQUNuQ1IsS0FBSyxDQUFDUyxJQUFJLENBQUM7WUFDVkMsTUFBTSxFQUFFRixPQUFPLENBQUNqQixXQUFXLENBQUMsSUFBSSxDQUFDO1lBQ2pDb0IsY0FBYyxFQUFFLEdBQUcsQ0FBQztVQUNyQixDQUFDLENBQUM7O1VBQ0YsSUFBSUgsT0FBTyxDQUFDSSxTQUFTLEVBQUUsQ0FBQ0MsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNyQ1AsdUJBQXVCLEVBQUU7VUFDMUI7UUFDRCxDQUFDLENBQUM7UUFFRixJQUFJO1VBQ0gsTUFBTVEsV0FBVyxDQUFDYixjQUFjLEVBQUVELEtBQUssQ0FBQztVQUN4Q2UsWUFBWSxDQUFDQyxJQUFJLENBQ2hCLE1BQUtwQyxpQkFBaUIsQ0FDckIsK0NBQStDLEVBQy9DLENBQUMwQix1QkFBdUIsQ0FBQ1csUUFBUSxFQUFFLENBQUMsRUFDcEMsTUFBS0MsaUJBQWlCLENBQUNqQixjQUFjLENBQUMsQ0FDdEMsQ0FDRDtRQUNGLENBQUMsQ0FBQyxNQUFNO1VBQ1BjLFlBQVksQ0FBQ0MsSUFBSSxDQUFDLE1BQUtwQyxpQkFBaUIsQ0FBQyw4Q0FBOEMsQ0FBQyxDQUFDO1FBQzFGO1FBQ0EsTUFBS3VDLGlCQUFpQixFQUFFO01BQ3pCLENBQUM7TUFBQSxNQVFEOUMsZ0JBQWdCLEdBQUcsTUFBTytDLElBQVksSUFBSztRQUMxQyxNQUFNQyxLQUFLLEdBQUdELElBQUksQ0FBQ0UsUUFBUSxFQUFFO1FBQzdCLE1BQU1DLFVBQVUsR0FBRztVQUNsQkMsT0FBTyxFQUFFO1FBQ1YsQ0FBQztRQUNELE1BQU1DLGVBQWUsR0FBR0osS0FBSyxDQUFDSyxRQUFRLENBQ3JDLGlEQUFpRCxFQUNqRE4sSUFBSSxDQUFDcEQsaUJBQWlCLEVBQUUsRUFDeEIsRUFBRSxFQUNGLEVBQUUsRUFDRnVELFVBQVUsQ0FDVjtRQUNELE1BQU1sQyxvQkFBb0IsR0FBRytCLElBQUksQ0FBQ3BELGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7O1FBRXZGO1FBQ0EsT0FBT3lELGVBQWUsQ0FDcEJFLGVBQWUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQ3ZCeEMsSUFBSSxDQUFDLFVBQVVlLFFBQVEsRUFBRTtVQUN6QixNQUFNWixZQUFvQixHQUFHLEVBQUU7VUFDL0IsTUFBTXNDLFdBQVcsR0FBR1IsSUFBSSxDQUFDRSxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMvQixXQUFXLENBQUMsNEJBQTRCLENBQUMsSUFBSSxFQUFFO1VBQzdGLE1BQU1zQyxFQUFFLEdBQUdDLGtCQUFrQixDQUFDQyxLQUFLLENBQUNYLElBQUksQ0FBQztVQUN6QyxJQUFJM0MsVUFBc0I7VUFDMUIsSUFBSSxDQUFBeUIsUUFBUSxhQUFSQSxRQUFRLHVCQUFSQSxRQUFRLENBQUU4QixNQUFNLElBQUcsQ0FBQyxFQUFFO1lBQ3pCOUIsUUFBUSxDQUFDSyxPQUFPLENBQUMsVUFBVTBCLFFBQVEsRUFBRTtjQUNwQyxNQUFNQyxRQUFRLEdBQUdELFFBQVEsQ0FBQ3JCLFNBQVMsRUFBaUI7Y0FDcEQsTUFBTXVCLElBQWEsR0FBRyxDQUFBTixFQUFFLGFBQUZBLEVBQUUsdUJBQUZBLEVBQUUsQ0FBRW5DLEVBQUUsTUFBS3dDLFFBQVEsQ0FBQ3hCLE1BQU07Y0FDaEQsTUFBTTBCLFFBQVEsR0FBR1IsV0FBVyxDQUFDUyxJQUFJLENBQUVDLENBQU8sSUFBS0EsQ0FBQyxDQUFDNUMsRUFBRSxLQUFLd0MsUUFBUSxDQUFDeEIsTUFBTSxDQUFDO2NBQ3hFLElBQUk2QixlQUFlLEdBQUdMLFFBQVEsQ0FBQ00sZUFBZSxJQUFJTixRQUFRLENBQUN4QixNQUFNO2NBQ2pFLE1BQU0rQixRQUFRLEdBQUdYLGtCQUFrQixDQUFDWSxjQUFjLENBQUNILGVBQWUsQ0FBQztjQUNuRUEsZUFBZSxJQUFJSixJQUFJLEdBQUksS0FBSUwsa0JBQWtCLENBQUNhLE9BQU8sQ0FBQywwQkFBMEIsQ0FBRSxHQUFFLEdBQUcsRUFBRTtjQUM3RixJQUFJUCxRQUFRLEVBQUU7Z0JBQ2IzRCxVQUFVLEdBQUdDLFVBQVUsQ0FBQ0MsZ0JBQWdCO2NBQ3pDLENBQUMsTUFBTSxJQUFJdUQsUUFBUSxDQUFDVSxnQkFBZ0IsS0FBS0EsZ0JBQWdCLENBQUNDLFVBQVUsRUFBRTtnQkFDckVwRSxVQUFVLEdBQUdDLFVBQVUsQ0FBQ0csV0FBVztjQUNwQyxDQUFDLE1BQU07Z0JBQ05KLFVBQVUsR0FBR0MsVUFBVSxDQUFDSSxhQUFhO2NBQ3RDO2NBRUEsTUFBTVcsSUFBVSxHQUFHO2dCQUNsQkMsRUFBRSxFQUFFd0MsUUFBUSxDQUFDeEIsTUFBTTtnQkFDbkJ4RCxJQUFJLEVBQUVxRixlQUFlO2dCQUNyQjFCLE1BQU0sRUFBRXBDLFVBQVU7Z0JBQ2xCcUUsS0FBSyxFQUFFaEIsa0JBQWtCLENBQUNpQixZQUFZLENBQUNiLFFBQVEsQ0FBQ3hCLE1BQU0sRUFBRWtCLFdBQVcsRUFBRXRDLFlBQVksQ0FBQztnQkFDbEZtRCxRQUFRLEVBQUVBLFFBQVE7Z0JBQ2xCWixFQUFFLEVBQUVNO2NBQ0wsQ0FBQztjQUNEN0MsWUFBWSxDQUFDbUIsSUFBSSxDQUFDaEIsSUFBSSxDQUFDO1lBQ3hCLENBQUMsQ0FBQztVQUNILENBQUMsTUFBTTtZQUNOO1lBQ0FILFlBQVksQ0FBQ21CLElBQUksQ0FBQ29CLEVBQUUsQ0FBQztVQUN0QjtVQUNBeEMsb0JBQW9CLENBQUMyRCxXQUFXLENBQUMsc0JBQXNCLEVBQUUsRUFBRSxDQUFDO1VBQzVEM0Qsb0JBQW9CLENBQUMyRCxXQUFXLENBQUMsK0JBQStCLEVBQUUsRUFBRSxDQUFDO1VBQ3JFM0Qsb0JBQW9CLENBQUMyRCxXQUFXLENBQUMsNEJBQTRCLEVBQUUxRCxZQUFZLENBQUM7UUFDN0UsQ0FBQyxDQUFDLENBQ0RRLEtBQUssQ0FDTCxZQUFvQztVQUNuQ2lCLFlBQVksQ0FBQ0MsSUFBSSxDQUFDLElBQUksQ0FBQ3BDLGlCQUFpQixDQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDdEYsQ0FBQyxDQUFDaUIsSUFBSSwrQkFBTSxDQUNaO01BQ0gsQ0FBQztNQUFBLE1BNkREc0IsaUJBQWlCLEdBQUcsTUFBTTtRQUFBO1FBQ3pCLDZCQUFLaEQsWUFBWSx3REFBakIsb0JBQW1COEUsS0FBSyxFQUFFO01BQzNCLENBQUM7TUFuZUEsTUFBS0MsYUFBYSxHQUFHQywyQkFBMkIsQ0FBQyxNQUFLQyxXQUFXLENBQUM7TUFBQztJQUNwRTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBSkM7SUFBQTtJQWVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFKQyxPQUtBdEYscUJBQXFCLEdBQXJCLGlDQUF3QjtNQUN2QixNQUFNRCxrQkFBa0IsR0FDdkIsS0FBQyxpQkFBaUI7UUFBQyxVQUFVLEVBQUMsT0FBTztRQUFDLEtBQUssRUFBQyxxQkFBcUI7UUFBQyxTQUFTLEVBQUMsUUFBUTtRQUFBLFVBQ25GLE1BQUMsSUFBSTtVQUFBLFdBQ0osS0FBQyxNQUFNO1lBQUMsUUFBUSxFQUFDLHFCQUFxQjtZQUFDLFdBQVcsRUFBQztVQUFHLEVBQUcsRUFDekQsTUFBQyxJQUFJO1lBQUEsV0FDSixLQUFDLEtBQUs7Y0FBQyxLQUFLLEVBQUMsd0JBQXdCO2NBQUMsSUFBSSxFQUFDO1lBQWlCLEVBQUcsRUFDL0QsS0FBQyxLQUFLO2NBQUMsS0FBSyxFQUFDLHdCQUF3QjtjQUFDLElBQUksRUFBQztZQUFlLEVBQUc7VUFBQSxFQUN2RDtRQUFBO01BQ0QsRUFFUjtNQUVELElBQUksQ0FBQ1MsY0FBYyxDQUFDK0UsWUFBWSxDQUFDeEYsa0JBQWtCLENBQUM7TUFFcEQsT0FBT0Esa0JBQWtCO0lBQzFCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBLE9BSEM7SUFhQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBSkMsT0FLQU8sZUFBZSxHQUFmLDJCQUFrQjtNQUNqQixNQUFNRCxZQUFZLEdBQ2pCLEtBQUMsTUFBTTtRQUFDLEtBQUssRUFBRSxJQUFJLENBQUNtRixrQ0FBa0MsRUFBRztRQUFBLFVBQ3ZEO1VBQ0FDLFdBQVcsRUFDVixLQUFDLE1BQU07WUFDTixJQUFJLEVBQUUsSUFBSSxDQUFDM0UsaUJBQWlCLENBQUMscURBQXFELENBQUU7WUFDcEYsS0FBSyxFQUFFLElBQUksQ0FBQ21CLFVBQVc7WUFDdkIsSUFBSSxFQUFDO1VBQVksRUFFbEI7VUFDRHlELFNBQVMsRUFDUixLQUFDLE1BQU07WUFDTixJQUFJLEVBQUUsSUFBSSxDQUFDNUUsaUJBQWlCLENBQUMsK0NBQStDLENBQUU7WUFDOUUsS0FBSyxFQUFFLElBQUksQ0FBQ3VDO1VBQWtCLEVBRS9CO1VBQ0RzQyxPQUFPLEVBQ04sTUFBQyxJQUFJO1lBQUMsS0FBSyxFQUFDLG1CQUFtQjtZQUFBLFdBQzlCLEtBQUMsSUFBSTtjQUFDLEtBQUssRUFBQyxNQUFNO2NBQUEsVUFDakIsS0FBQyxZQUFZO2dCQUNaLElBQUksRUFBRSxJQUFJLENBQUM3RSxpQkFBaUIsQ0FBQyw4Q0FBOEMsQ0FBRTtnQkFDN0UsSUFBSSxFQUFDLGFBQWE7Z0JBQ2xCLFFBQVEsRUFBQyxNQUFNO2dCQUNmLGVBQWUsRUFBQyxPQUFPO2dCQUN2QixLQUFLLEVBQUM7Y0FBeUI7WUFDOUIsRUFDSSxFQUVQLEtBQUMsS0FBSztjQUFDLElBQUksRUFBRSxJQUFJLENBQUNBLGlCQUFpQixDQUFDLDZDQUE2QztZQUFFLEVBQUcsRUFFckYsSUFBSSxDQUFDOEUsNkJBQTZCLEVBQUUsRUFFcEMsSUFBSSxDQUFDQyx3QkFBd0IsRUFBRTtVQUFBO1FBR25DO01BQUMsRUFFRjtNQUVELElBQUksQ0FBQ3JGLGNBQWMsQ0FBQytFLFlBQVksQ0FBQ2xGLFlBQVksQ0FBQztNQUM5Q0EsWUFBWSxDQUFDeUYsV0FBVyxDQUFDO1FBQ3hCdkMsS0FBSyxFQUFFLFVBQVU7UUFDakJ3QyxJQUFJLEVBQUU7TUFDUCxDQUFDLENBQUM7TUFFRixPQUFPMUYsWUFBWTtJQUNwQjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUtBd0Ysd0JBQXdCLEdBQXhCLG9DQUEyQjtNQUMxQixJQUFJLENBQUN4RCxxQkFBcUIsR0FDekIsS0FBQyxLQUFLO1FBQUMsS0FBSyxFQUFDLE1BQU07UUFBQyxLQUFLLEVBQUU7VUFBRTBELElBQUksRUFBRTtRQUF3QixDQUFFO1FBQUEsVUFDM0Q7VUFDQUMsYUFBYSxFQUNaLE1BQUMsT0FBTztZQUFDLEtBQUssRUFBQyxNQUFNO1lBQUEsV0FDcEIsS0FBQyxLQUFLO2NBQUMsSUFBSSxFQUFFLElBQUksQ0FBQ2xGLGlCQUFpQixDQUFDLHFEQUFxRCxDQUFFO2NBQUMsS0FBSyxFQUFDO1lBQUksRUFBRyxFQUN6RyxLQUFDLGFBQWEsS0FBRyxFQUNqQixLQUFDLFdBQVc7Y0FBQyxLQUFLLEVBQUM7WUFBTSxFQUFHO1VBQUEsRUFHN0I7VUFDRG1GLE9BQU8sRUFDTjtZQUFBLFdBQ0MsS0FBQyxNQUFNO2NBQUMsS0FBSyxFQUFDO1lBQUssRUFBRyxFQUN0QixLQUFDLE1BQU07Y0FBQyxLQUFLLEVBQUMsTUFBTTtjQUFBLFVBQ25CLEtBQUMsSUFBSTtnQkFBQyxJQUFJLEVBQUUsSUFBSSxDQUFDbkYsaUJBQWlCLENBQUMsbURBQW1EO2NBQUU7WUFBRyxFQUNuRixFQUNULEtBQUMsTUFBTTtjQUFDLEtBQUssRUFBQyxNQUFNO2NBQUEsVUFDbkIsS0FBQyxJQUFJO2dCQUFDLElBQUksRUFBRSxJQUFJLENBQUNBLGlCQUFpQixDQUFDLDBEQUEwRDtjQUFFO1lBQUcsRUFDMUYsRUFDVCxLQUFDLE1BQU07Y0FBQyxLQUFLLEVBQUM7WUFBSyxFQUFHO1VBQUEsRUFFdkI7VUFFRG9GLEtBQUssRUFDSixNQUFDLGNBQWM7WUFBQyxNQUFNLEVBQUMsUUFBUTtZQUFDLFNBQVMsRUFBQyxxREFBcUQ7WUFBQSxXQUM5RixLQUFDLE1BQU07Y0FBQyxXQUFXLEVBQUMsSUFBSTtjQUFDLGVBQWUsRUFBQyx3QkFBd0I7Y0FBQyxRQUFRLEVBQUM7WUFBcUIsRUFBRyxFQUNuRyxLQUFDLElBQUk7Y0FBQyxJQUFJLEVBQUM7WUFBaUIsRUFBRyxFQUMvQixLQUFDLFlBQVk7Y0FDWixLQUFLLEVBQUU7Z0JBQUVILElBQUksRUFBRSxpQkFBaUI7Z0JBQUVJLFNBQVMsRUFBRSxJQUFJLENBQUNDO2NBQXNCLENBQUU7Y0FDMUUsSUFBSSxFQUFFO2dCQUFFTCxJQUFJLEVBQUUsaUJBQWlCO2dCQUFFSSxTQUFTLEVBQUUsSUFBSSxDQUFDekY7Y0FBaUI7WUFBRSxFQUNuRSxFQUNGLEtBQUMsSUFBSTtjQUFBLFVBQ0osS0FBQyxNQUFNO2dCQUNOLElBQUksRUFBQyxvQkFBb0I7Z0JBQ3pCLElBQUksRUFBQyxhQUFhO2dCQUNsQixLQUFLLEVBQUUsSUFBSSxDQUFDMkYsVUFBVztnQkFDdkIsT0FBTyxFQUFDO2NBQThCO1lBQ3JDLEVBQ0k7VUFBQTtRQUdWO01BQUMsRUFFRjtNQUVELE9BQU8sSUFBSSxDQUFDaEUscUJBQXFCO0lBQ2xDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS0F1RCw2QkFBNkIsR0FBN0IseUNBQWdDO01BQy9CLE9BQ0MsTUFBQyxJQUFJO1FBQUMsS0FBSyxFQUFDLHlCQUF5QjtRQUFDLEtBQUssRUFBQyxNQUFNO1FBQUEsV0FDakQsS0FBQyxLQUFLO1VBQ0wsS0FBSyxFQUFDLG1CQUFtQjtVQUN6QixlQUFlLEVBQUMsNEJBQTRCO1VBQzVDLE9BQU8sRUFBQyxrQkFBa0I7VUFDMUIsS0FBSyxFQUFDLE1BQU07VUFDWixRQUFRLEVBQUMsTUFBTTtVQUNmLFNBQVMsRUFBQyxlQUFlO1VBQ3pCLFdBQVcsRUFBRSxJQUFJLENBQUM5RSxpQkFBaUIsQ0FBQyxtREFBbUQsQ0FBRTtVQUN6RixNQUFNLEVBQUUsSUFBSSxDQUFDSSxtQkFBb0I7VUFBQSxVQUVoQztZQUNBb0YsVUFBVSxFQUNULEtBQUMsU0FBUztjQUFDLEVBQUUsRUFBQyxlQUFlO2NBQUMsUUFBUSxFQUFFLElBQUksQ0FBQ0Msb0JBQW9CLEVBQUc7Y0FBQyxhQUFhLEVBQUMsTUFBTTtjQUFBLFVBQ3ZGO2dCQUNBQyxTQUFTLEVBQ1IsS0FBQyxVQUFVO2tCQUFBLFVBQ1YsS0FBQyxNQUFNO29CQUFDLGFBQWEsRUFBQyxNQUFNO29CQUFDLGNBQWMsRUFBQztrQkFBTztnQkFBRyxFQUV2RDtnQkFDREMsTUFBTSxFQUFFLEtBQUMsU0FBUztjQUNuQjtZQUFDO1VBR0o7UUFBQyxFQUNNLEVBQ1IsS0FBQyxNQUFNO1VBQ04sS0FBSyxFQUFDLHNCQUFzQjtVQUM1QixJQUFJLEVBQUUsSUFBSSxDQUFDM0YsaUJBQWlCLENBQUMsaURBQWlELENBQUU7VUFDaEYsS0FBSyxFQUFFLElBQUksQ0FBQzRGO1FBQVEsRUFDbkI7TUFBQSxFQUNJO0lBRVQ7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFvQkE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBTEMsT0FNQU4scUJBQXFCLEdBQXJCLCtCQUFzQnpGLFVBQXNCLEVBQUU7TUFDN0MsUUFBUUEsVUFBVTtRQUNqQixLQUFLQyxVQUFVLENBQUNDLGdCQUFnQjtVQUMvQixPQUFPOEYsVUFBVSxDQUFDQyxPQUFPO1FBQzFCLEtBQUtoRyxVQUFVLENBQUNHLFdBQVc7VUFDMUIsT0FBTzRGLFVBQVUsQ0FBQ0UsT0FBTztRQUMxQixLQUFLakcsVUFBVSxDQUFDSSxhQUFhO1FBQzdCLEtBQUtKLFVBQVUsQ0FBQ0ssYUFBYTtRQUM3QjtVQUNDLE9BQU8wRixVQUFVLENBQUNHLFdBQVc7TUFBQztJQUVqQzs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUtBSixPQUFPLEdBQVAsaUJBQVE5RyxLQUFZLEVBQUU7TUFDckIsTUFBTW1ILFNBQVMsR0FBR25ILEtBQUssQ0FBQ0UsU0FBUyxFQUFZO01BQzdDLE1BQU15QixvQkFBb0IsR0FBR3dGLFNBQVMsQ0FBQzdHLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7TUFDNUYsTUFBTXNCLFlBQW9CLEdBQUdELG9CQUFvQixDQUFDRSxXQUFXLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRTtNQUNuRixNQUFNcUMsV0FBVyxHQUFJaUQsU0FBUyxDQUFDdkQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFlL0IsV0FBVyxDQUFDLDRCQUE0QixDQUFDO01BQzNHLE1BQU11RixPQUFhLEdBQUc7UUFDckJwRixFQUFFLEVBQUVMLG9CQUFvQixhQUFwQkEsb0JBQW9CLHVCQUFwQkEsb0JBQW9CLENBQUVFLFdBQVcsQ0FBQyxRQUFRLENBQUM7UUFDL0NyQyxJQUFJLEVBQUVtQyxvQkFBb0IsYUFBcEJBLG9CQUFvQix1QkFBcEJBLG9CQUFvQixDQUFFRSxXQUFXLENBQUMsaUJBQWlCO01BQzFELENBQUM7TUFFRCxJQUFJLEVBQUVELFlBQVksQ0FBQ0UsU0FBUyxDQUFFQyxJQUFJLElBQUtBLElBQUksQ0FBQ0MsRUFBRSxLQUFLb0YsT0FBTyxDQUFDcEYsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUtvRixPQUFPLENBQUNwRixFQUFFLEtBQUtvRixPQUFPLENBQUM1SCxJQUFJLElBQUk0SCxPQUFPLENBQUNwRixFQUFFLEtBQUssRUFBRyxDQUFDLEVBQUU7UUFDM0hvRixPQUFPLENBQUM1SCxJQUFJLEdBQUc0SCxPQUFPLENBQUM1SCxJQUFJLElBQUk0SCxPQUFPLENBQUNwRixFQUFFO1FBQ3pDb0YsT0FBTyxDQUFDckMsUUFBUSxHQUFHWCxrQkFBa0IsQ0FBQ1ksY0FBYyxDQUFDb0MsT0FBTyxDQUFDNUgsSUFBSSxDQUFDO1FBQ2xFNEgsT0FBTyxDQUFDaEMsS0FBSyxHQUFHaEIsa0JBQWtCLENBQUNpQixZQUFZLENBQUMrQixPQUFPLENBQUNwRixFQUFFLEVBQUVrQyxXQUFXLEVBQUV0QyxZQUFZLENBQUM7UUFDdEZ3RixPQUFPLENBQUNDLFNBQVMsR0FBRyxJQUFJO1FBQ3hCRCxPQUFPLENBQUNqRSxNQUFNLEdBQUduQyxVQUFVLENBQUNLLGFBQWE7UUFDekNPLFlBQVksQ0FBQzBGLE9BQU8sQ0FBQ0YsT0FBTyxDQUFDO1FBQzdCekYsb0JBQW9CLENBQUMyRCxXQUFXLENBQUMsY0FBYyxFQUFFMUQsWUFBWSxDQUFDO1FBQzlERCxvQkFBb0IsQ0FBQzJELFdBQVcsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDO1FBQzlDM0Qsb0JBQW9CLENBQUMyRCxXQUFXLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDO01BQ3hEO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUErQkE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUpDLE9BS0FtQixVQUFVLEdBQVYsb0JBQVd6RyxLQUFZLEVBQUU7TUFBQTtNQUN4QixNQUFNdUgsSUFBSSxHQUFHdkgsS0FBSyxDQUFDRSxTQUFTLEVBQWE7TUFDekMsTUFBTXlCLG9CQUFvQixHQUFHNEYsSUFBSSxhQUFKQSxJQUFJLHVCQUFKQSxJQUFJLENBQUVqSCxpQkFBaUIsQ0FBQyxjQUFjLENBQUM7TUFDcEUsTUFBTWtILFlBQVksR0FBR0QsSUFBSSxhQUFKQSxJQUFJLGdEQUFKQSxJQUFJLENBQUVqSCxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsMERBQW5DLHNCQUFxQ3VCLFdBQVcsQ0FBQyxJQUFJLENBQUM7TUFDM0UsSUFBSUQsWUFBb0IsR0FBR0Qsb0JBQW9CLGFBQXBCQSxvQkFBb0IsdUJBQXBCQSxvQkFBb0IsQ0FBRUUsV0FBVyxDQUFDLDRCQUE0QixDQUFDO01BQzFGRCxZQUFZLEdBQUdBLFlBQVksQ0FBQzZGLE1BQU0sQ0FBRTFGLElBQUksSUFBS0EsSUFBSSxDQUFDQyxFQUFFLEtBQUt3RixZQUFZLENBQUM7TUFDdEU3RixvQkFBb0IsYUFBcEJBLG9CQUFvQix1QkFBcEJBLG9CQUFvQixDQUFFMkQsV0FBVyxDQUFDLDRCQUE0QixFQUFFMUQsWUFBWSxDQUFDO0lBQzlFOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQXlHQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFMQyxPQU1BNEIsaUJBQWlCLEdBQWpCLDJCQUFrQmpCLGNBQXVCLEVBQVU7TUFBQTtNQUNsRCxNQUFNbUYsVUFBVSw0QkFBRyxJQUFJLENBQUNsQyxhQUFhLENBQUNtQyxZQUFZLENBQUNDLFVBQVUsQ0FBQ0MsV0FBVyxDQUFDQyxFQUFFLDBEQUF6RCxzQkFBMkRDLFVBQVU7TUFDeEYsSUFBSUMsY0FBYyxHQUFHLEVBQUU7TUFDdkIsTUFBTUMsS0FBSyxHQUFHUCxVQUFVLGFBQVZBLFVBQVUsdUJBQVZBLFVBQVUsQ0FBRVEsS0FBSztNQUMvQixJQUFJRCxLQUFLLEVBQUU7UUFDVkQsY0FBYyxHQUFHRywwQkFBMEIsQ0FBQ0YsS0FBSyxDQUFDRyxLQUFLLENBQUMsR0FBRzdGLGNBQWMsQ0FBQ1YsV0FBVyxDQUFDb0csS0FBSyxDQUFDRyxLQUFLLENBQUNqQyxJQUFJLENBQUMsR0FBRzhCLEtBQUssQ0FBQ0csS0FBSztNQUN0SDtNQUNBLE9BQU9KLGNBQWMsS0FBSU4sVUFBVSxhQUFWQSxVQUFVLHVCQUFWQSxVQUFVLENBQUVXLFFBQVEsS0FBSSxFQUFFO0lBQ3BEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLE9BS0ExQixvQkFBb0IsR0FBcEIsZ0NBQW9FO01BQ25FO01BQ0EsTUFBTTJCLFVBQVUsR0FDZixJQUFJLENBQUM5QyxhQUFhLENBQUMrQyxlQUFlLENBQUVWLFdBQVcsQ0FBQ1csTUFBTSxDQUNyREMsU0FBUyxDQUFFQyxXQUFXLENBQUVuRixRQUFRLEVBQUU7TUFDcEM7TUFDQSxNQUFNb0YsTUFBTSxHQUFHLElBQUksQ0FBQ25ELGFBQWEsQ0FBQ29ELGdCQUFnQixDQUFDQyxXQUFXLENBQUNQLFVBQVUsQ0FBcUI7TUFDOUY7TUFDQSxNQUFNUSxjQUFjLEdBQUdILE1BQU0sQ0FBQzlFLFVBQVUsQ0FBQ2MsSUFBSSxDQUFFb0UsS0FBSyxJQUFLQSxLQUFLLENBQUN2SixJQUFJLEtBQUtKLGdCQUFnQixDQUFFO01BRTFGLE9BQU87UUFDTkksSUFBSSxFQUFFLDJDQUEyQztRQUNqRHdKLE9BQU8sRUFBRTtVQUNSQyxZQUFZLEVBQUcsSUFBR0gsY0FBYyxDQUFDbkosSUFBSyxJQUFHTixpQkFBa0IsRUFBQztVQUM1RDZKLFVBQVUsRUFBRSxDQUFDLENBQUM7VUFDZEMsa0JBQWtCLEVBQUUsRUFBRTtVQUN0QkMsdUJBQXVCLEVBQUU7UUFDMUI7TUFDRCxDQUFDO0lBQ0Y7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQSxPQUpDO0lBQUEsT0FLQXhELGtDQUFrQyxHQUFsQyw4Q0FBdUU7TUFBQTtNQUN0RSxNQUFNOEIsVUFBVSw2QkFBRyxJQUFJLENBQUNsQyxhQUFhLENBQUNvRCxnQkFBZ0IsQ0FBQ2YsV0FBVyxDQUFDQyxFQUFFLDJEQUFsRCx1QkFBb0RDLFVBQVU7TUFDakYsTUFBTUUsS0FBSyxHQUFHb0IsMkJBQTJCLENBQUUzQixVQUFVLGFBQVZBLFVBQVUsNENBQVZBLFVBQVUsQ0FBRVEsS0FBSyxzREFBbEIsa0JBQThDRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztNQUN0RyxNQUFNa0IsTUFBTSxHQUFHLENBQUMsd0NBQXdDLEVBQUVDLFFBQVEsQ0FBQzdCLFVBQVUsYUFBVkEsVUFBVSx1QkFBVkEsVUFBVSxDQUFFVyxRQUFRLENBQUMsRUFBRUosS0FBSyxDQUFDO01BQ2hHLE1BQU11QixlQUFlLEdBQUdDLFlBQVksQ0FBQ0gsTUFBTSxFQUFFSSxzQkFBc0IsQ0FBQ0MsZ0JBQWdCLENBQUM7TUFDckYsT0FBT0MsaUJBQWlCLENBQUNKLGVBQWUsQ0FBQztJQUMxQzs7SUFFQTtBQUNEO0FBQ0E7QUFDQSxPQUhDO0lBUUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUpDLE9BS0FLLGVBQWUsR0FBZiwyQkFBa0I7TUFBQTtNQUNqQiw4QkFBSyxJQUFJLENBQUNyRSxhQUFhLENBQUMrQyxlQUFlLDZFQUFsQyx1QkFBb0NWLFdBQVcsQ0FBQ1csTUFBTSw2RUFBdkQsdUJBQXlGQyxTQUFTLG1EQUFsRyx1QkFBb0dDLFdBQVcsRUFBRTtRQUNwSCxPQUNDLEtBQUMsSUFBSTtVQUFDLE9BQU8sRUFBQyxrQkFBa0I7VUFBQyxVQUFVLEVBQUMsUUFBUTtVQUFDLGNBQWMsRUFBQyxPQUFPO1VBQUEsVUFDMUUsS0FBQyxNQUFNO1lBQUMsZUFBZSxFQUFDLFVBQVU7WUFBQyxHQUFHLEVBQUMseUJBQXlCO1lBQUMsV0FBVyxFQUFDLElBQUk7WUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDbEk7VUFBb0I7UUFBRyxFQUMvRztNQUVULENBQUMsTUFBTTtRQUNOLE9BQU8sS0FBQyxJQUFJLEtBQUc7TUFDaEI7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLE9BTUFzSixVQUFVLEdBQVYsb0JBQVdwRyxJQUFZLEVBQUU7TUFDeEIsSUFBSSxDQUFDOUMsY0FBYyxHQUFHOEMsSUFBSTtNQUUxQixJQUFJcUcsV0FBVyxDQUFDQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUN0RSxXQUFXLENBQUM5QixRQUFRLEVBQUUsQ0FBQyxFQUFFO1FBQzNFLE9BQ0M7VUFBQSxXQUNDLEtBQUMsSUFBSTtZQUNKLEtBQUssRUFBRTtjQUFFdUMsSUFBSSxFQUFFO1lBQXNDLENBQUU7WUFDdkQsS0FBSyxFQUFDLHNCQUFzQjtZQUM1QixPQUFPLEVBQUMsZ0VBQXdFO1lBQ2hGLFVBQVUsRUFBQyxRQUFRO1lBQ25CLGNBQWMsRUFBQyxPQUFPO1lBQUEsVUFFdEIsS0FBQyxNQUFNO2NBQ04sUUFBUSxFQUFDLHFCQUFxQjtjQUM5QixXQUFXLEVBQUMsSUFBSTtjQUNoQixlQUFlLEVBQUMsd0JBQXdCO2NBQ3hDLEtBQUssRUFBRSxJQUFJLENBQUNwRztZQUE2QjtVQUN4QyxFQUNJLEVBQ04sSUFBSSxDQUFDOEosZUFBZSxFQUFFO1FBQUEsRUFDckI7TUFFTDtJQUNELENBQUM7SUFBQTtFQUFBLEVBdmlCOENJLG9CQUFvQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=
import { Action as VocabularyAction } from "@sap-ux/vocabularies-types/Edm";
import { EntitySetAnnotations_Common } from "@sap-ux/vocabularies-types/vocabularies/Common_Edm";
import { DataField } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type { FEView } from "sap/fe/core/BaseController";
import { blockAttribute, defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import {
	BackendUser,
	CollaborationUtils,
	shareObject,
	User,
	UserEditingState,
	UserStatus
} from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import collaborationFormatter from "sap/fe/core/formatters/CollaborationFormatter";
import {
	CompiledBindingToolkitExpression,
	compileExpression,
	constant,
	formatResult,
	getExpressionFromAnnotation
} from "sap/fe/core/helpers/BindingToolkit";
import { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import ModelHelper, { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import { isPathAnnotationExpression } from "sap/fe/core/helpers/TypeGuards";
import { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { ValueHelpPayload } from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import Avatar from "sap/m/Avatar";
import Button from "sap/m/Button";
import Column from "sap/m/Column";
import ColumnListItem from "sap/m/ColumnListItem";
import Dialog from "sap/m/Dialog";
import HBox from "sap/m/HBox";
import Input from "sap/m/Input";
import Label from "sap/m/Label";
import MessageStrip from "sap/m/MessageStrip";
import MessageToast from "sap/m/MessageToast";
import ObjectStatus from "sap/m/ObjectStatus";
import Popover from "sap/m/Popover";
import ResponsivePopover from "sap/m/ResponsivePopover";
import SearchField from "sap/m/SearchField";
import Table from "sap/m/Table";
import Text from "sap/m/Text";
import Title from "sap/m/Title";
import Toolbar from "sap/m/Toolbar";
import ToolbarSpacer from "sap/m/ToolbarSpacer";
import VBox from "sap/m/VBox";
import Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import { ValueState } from "sap/ui/core/library";
import Field from "sap/ui/mdc/Field";
import ValueHelp from "sap/ui/mdc/ValueHelp";
import MTable from "sap/ui/mdc/valuehelp/content/MTable";
import MDCDialog from "sap/ui/mdc/valuehelp/Dialog";
import MDCPopover from "sap/ui/mdc/valuehelp/Popover";
import type JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

const USERS_PARAMETERS = "Users";
const USER_ID_PARAMETER = "UserID";

@defineBuildingBlock({ name: "CollaborationDraft", namespace: "sap.fe.templates.ObjectPage.components" })
export default class CollaborationDraft extends RuntimeBuildingBlock {
	@blockAttribute({ type: "sap.ui.model.Context", required: true })
	public contextPath!: Context;

	@blockAttribute({ type: "string" })
	public id?: string;

	private contextObject: DataModelObjectPath;

	private userDetailsPopover?: Popover;

	private manageDialog?: Dialog;

	private manageDialogUserTable?: Table;

	private containingView!: FEView;

	constructor(props: PropertiesOf<CollaborationDraft>, ...others: unknown[]) {
		super(props, ...others);
		this.contextObject = getInvolvedDataModelObjects(this.contextPath);
	}

	/**
	 * Event handler to create and show the user details popover.
	 *
	 * @param event The event object
	 */
	showCollaborationUserDetails = async (event: Event) => {
		const source = event.getSource() as Control;
		if (!this.userDetailsPopover) {
			this.userDetailsPopover = this.getUserDetailsPopover();
		}

		this.userDetailsPopover?.setBindingContext(source.getBindingContext("internal") as InternalModelContext, "internal");
		this.userDetailsPopover?.openBy(source, false);
	};

	/**
	 * Returns the user details popover.
	 *
	 * @returns The control tree
	 */
	getUserDetailsPopover() {
		const userDetailsPopover = (
			<ResponsivePopover showHeader="false" class="sapUiContentPadding" placement="Bottom">
				<HBox>
					<Avatar initials="{internal>initials}" displaySize="S" />
					<VBox>
						<Label class="sapUiMediumMarginBegin" text="{internal>name}" />
						<Label class="sapUiMediumMarginBegin" text="{internal>id}" />
					</VBox>
				</HBox>
			</ResponsivePopover>
		);

		this.containingView.addDependent(userDetailsPopover);

		return userDetailsPopover;
	}

	/**
	 * Event handler to create and open the manage dialog.
	 *
	 */
	manageCollaboration = () => {
		if (!this.manageDialog) {
			this.manageDialog = this.getManageDialog();
		}

		this.readInvitedUsers(this.containingView);
		this.manageDialog?.open();
	};

	/**
	 * Returns the manage dialog used to invite further users.
	 *
	 * @returns The control tree
	 */
	getManageDialog() {
		const manageDialog = (
			<Dialog title={this.getInvitationDialogTitleExpBinding()}>
				{{
					beginButton: (
						<Button
							text={this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_DIALOG_CONFIRMATION")}
							press={this.inviteUser}
							type="Emphasized"
						/>
					),
					endButton: (
						<Button
							text={this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_DIALOG_CANCEL")}
							press={this.closeManageDialog}
						/>
					),
					content: (
						<VBox class="sapUiMediumMargin">
							<VBox width="40em">
								<MessageStrip
									text={this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_MESSAGESTRIP")}
									type="Information"
									showIcon="true"
									showCloseButton="false"
									class="sapUiMediumMarginBottom"
								/>
							</VBox>

							<Label text={this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_INPUT_LABEL")} />

							{this.getManageDialogAddUserSection()}

							{this.getManageDialogUserTable()}
						</VBox>
					)
				}}
			</Dialog>
		);

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
	 */
	getManageDialogUserTable() {
		this.manageDialogUserTable = (
			<Table width="40em" items={{ path: "internal>invitedUsers" }}>
				{{
					headerToolbar: (
						<Toolbar width="100%">
							<Title text={this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_TABLE_TOOLBAR_TITLE")} level="H3" />
							<ToolbarSpacer />
							<SearchField width="15em" />
							pn
						</Toolbar>
					),
					columns: (
						<>
							<Column width="3em" />
							<Column width="20em">
								<Text text={this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_TABLE_USER_COLUMN")} />
							</Column>
							<Column width="17em">
								<Text text={this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_TABLE_USER_STATUS_COLUMN")} />
							</Column>
							<Column width="5em" />
						</>
					),

					items: (
						<ColumnListItem vAlign="Middle" highlight="{= ${internal>transient} ? 'Information' : 'None' }">
							<Avatar displaySize="XS" backgroundColor="Accent{internal>color}" initials="{internal>initials}" />
							<Text text="{internal>name}" />
							<ObjectStatus
								state={{ path: "internal>status", formatter: this.formatUserStatusColor }}
								text={{ path: "internal>status", formatter: this.formatUserStatus }}
							/>
							<HBox>
								<Button
									icon="sap-icon://decline"
									type="Transparent"
									press={this.removeUser}
									visible="{= !!${internal>transient} }"
								/>
							</HBox>
						</ColumnListItem>
					)
				}}
			</Table>
		);

		return this.manageDialogUserTable;
	}

	/**
	 * Returns the section on the dialog related to the user field.
	 *
	 * @returns The control tree
	 */
	getManageDialogAddUserSection() {
		return (
			<HBox class="sapUiMediumMarginBottom" width="100%">
				<Field
					value="{internal>UserID}"
					additionalValue="{internal>UserDescription}"
					display="DescriptionValue"
					width="37em"
					required="true"
					fieldHelp="userValueHelp"
					placeholder={this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_INPUT_PLACEHOLDER")}
					change={this.addUserFieldChanged}
				>
					{{
						dependents: (
							<ValueHelp id="userValueHelp" delegate={this.getValueHelpDelegate()} validateInput="true">
								{{
									typeahead: (
										<MDCPopover>
											<MTable caseSensitive="true" useAsValueHelp="false" />
										</MDCPopover>
									),
									dialog: <MDCDialog />
								}}
							</ValueHelp>
						)
					}}
				</Field>
				<Button
					class="sapUiTinyMarginBegin"
					text={this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_DIALOG_ADD_USER")}
					press={this.addUser}
				/>
			</HBox>
		);
	}

	/**
	 * Formatter to set the user status depending on the editing status.
	 *
	 * @param userStatus The editing status of the user
	 * @returns The user status
	 */
	formatUserStatus = (userStatus: UserStatus) => {
		switch (userStatus) {
			case UserStatus.CurrentlyEditing:
				return this.getTranslatedText("C_COLLABORATIONDRAFT_USER_CURRENTLY_EDITING");
			case UserStatus.ChangesMade:
				return this.getTranslatedText("C_COLLABORATIONDRAFT_USER_CHANGES_MADE");
			case UserStatus.NoChangesMade:
				return this.getTranslatedText("C_COLLABORATIONDRAFT_USER_NO_CHANGES_MADE");
			case UserStatus.NotYetInvited:
			default:
				return this.getTranslatedText("C_COLLABORATIONDRAFT_USER_NOT_YET_INVITED");
		}
	};

	/**
	 * Formatter to set the user color depending on the editing status.
	 *
	 * @param userStatus The editing status of the user
	 * @returns The user status color
	 */
	formatUserStatusColor(userStatus: UserStatus) {
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
	 */
	addUser(event: Event) {
		const addButton = event.getSource() as Button;
		const internalModelContext = addButton.getBindingContext("internal") as InternalModelContext;
		const invitedUsers: User[] = internalModelContext.getProperty("invitedUsers") || [];
		const activeUsers = (addButton.getModel("internal") as JSONModel).getProperty("/collaboration/activeUsers");
		const newUser: User = {
			id: internalModelContext?.getProperty("UserID"),
			name: internalModelContext?.getProperty("UserDescription")
		};

		if (!(invitedUsers.findIndex((user) => user.id === newUser.id) > -1 || (newUser.id === newUser.name && newUser.id === ""))) {
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
	 */
	addUserFieldChanged = (event: Event) => {
		const userInput = event.getSource() as Input;
		return event
			.getParameter("promise")
			.then(
				function (this: CollaborationDraft, newUserId: string) {
					const internalModelContext = userInput.getBindingContext("internal") as InternalModelContext;
					const invitedUsers: User[] = internalModelContext.getProperty("invitedUsers") || [];
					if (invitedUsers.findIndex((user) => user.id === newUserId) > -1) {
						userInput.setValueState("Error");
						userInput.setValueStateText(this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_USER_ERROR"));
					} else {
						userInput.setValueState("None");
						userInput.setValueStateText("");
					}
				}.bind(this)
			)
			.catch(
				function (this: CollaborationDraft) {
					userInput.setValueState("Warning");
					userInput.setValueStateText(this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_USER_NOT_FOUND"));
				}.bind(this)
			);
	};

	/**
	 * Event handler to remove a user from the list of invited user.
	 *
	 * @param event The event object of the remove button
	 */
	removeUser(event: Event) {
		const item = event.getSource() as Control;
		const internalModelContext = item?.getBindingContext("pageInternal");
		const deleteUserID = item?.getBindingContext("internal")?.getProperty("id");
		let invitedUsers: User[] = internalModelContext?.getProperty("collaboration/invitedUsers");
		invitedUsers = invitedUsers.filter((user) => user.id !== deleteUserID);
		internalModelContext?.setProperty("collaboration/invitedUsers", invitedUsers);
	}

	/**
	 * Call the share action to update the list of invited users.
	 *
	 * @param event The event object of the invite button
	 */
	inviteUser = async (event: Event) => {
		const users: BackendUser[] = [];
		const source = event.getSource() as Control;
		const bindingContext = source.getBindingContext() as Context;
		const contexts = (this.manageDialogUserTable?.getBinding("items") as ODataListBinding).getContexts();
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
			MessageToast.show(
				this.getTranslatedText(
					"C_COLLABORATIONDRAFT_INVITATION_SUCCESS_TOAST",
					[numberOfNewInvitedUsers.toString()],
					this.getSharedItemName(bindingContext)
				)
			);
		} catch {
			MessageToast.show(this.getTranslatedText("C_COLLABORATIONDRAFT_INVITATION_FAILED_TOAST"));
		}
		this.closeManageDialog();
	};

	/**
	 * Reads the currently invited user and store it in the internal model.
	 *
	 * @param view The current view
	 * @returns Promise that is resolved once the users are read.
	 */
	readInvitedUsers = async (view: FEView) => {
		const model = view.getModel();
		const parameters = {
			$select: "UserID,UserDescription,UserEditingState"
		};
		const invitedUserList = model.bindList(
			"DraftAdministrativeData/DraftAdministrativeUser",
			view.getBindingContext() as Context,
			[],
			[],
			parameters
		);
		const internalModelContext = view.getBindingContext("internal") as InternalModelContext;

		// for now we set a limit to 100. there shouldn't be more than a few
		return invitedUserList
			.requestContexts(0, 100)
			.then(function (contexts) {
				const invitedUsers: User[] = [];
				const activeUsers = view.getModel("internal").getProperty("/collaboration/activeUsers") || [];
				const me = CollaborationUtils.getMe(view);
				let userStatus: UserStatus;
				if (contexts?.length > 0) {
					contexts.forEach(function (oContext) {
						const userData = oContext.getObject() as BackendUser;
						const isMe: boolean = me?.id === userData.UserID;
						const isActive = activeUsers.find((u: User) => u.id === userData.UserID);
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

						const user: User = {
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
			})
			.catch(
				function (this: CollaborationDraft) {
					MessageToast.show(this.getTranslatedText("C_COLLABORATIONDRAFT_READING_USER_FAILED"));
				}.bind(this)
			);
	};

	/**
	 * Get the name of the object to be shared.
	 *
	 * @param bindingContext The context of the page.
	 * @returns The name of the object to be shared.
	 */
	getSharedItemName(bindingContext: Context): string {
		const headerInfo = this.contextObject.targetObject.entityType.annotations.UI?.HeaderInfo;
		let sharedItemName = "";
		const title = headerInfo?.Title;
		if (title) {
			sharedItemName = isPathAnnotationExpression(title.Value) ? bindingContext.getProperty(title.Value.path) : title.Value;
		}
		return sharedItemName || headerInfo?.TypeName || "";
	}

	/**
	 * Generates the delegate payload for the user field value help.
	 *
	 * @returns The value help delegate payload
	 */
	getValueHelpDelegate(): { name: string; payload: ValueHelpPayload } {
		// The non null assertion is safe here, because the action is only available if the annotation is present
		const actionName = (
			this.contextObject.targetEntitySet!.annotations.Common as EntitySetAnnotations_Common
		).DraftRoot!.ShareAction!.toString();
		// We are also sure that the action exist
		const action = this.contextObject.targetEntityType.resolvePath(actionName) as VocabularyAction;
		// By definition the action has a parameter with the name "Users"
		const userParameters = action.parameters.find((param) => param.name === USERS_PARAMETERS)!;

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
	 */
	getInvitationDialogTitleExpBinding(): CompiledBindingToolkitExpression {
		const headerInfo = this.contextObject.targetEntityType.annotations.UI?.HeaderInfo;
		const title = getExpressionFromAnnotation((headerInfo?.Title as DataField | undefined)?.Value, [], "");
		const params = ["C_COLLABORATIONDRAFT_INVITATION_DIALOG", constant(headerInfo?.TypeName), title];
		const titleExpression = formatResult(params, collaborationFormatter.getFormattedText);
		return compileExpression(titleExpression);
	}

	/**
	 * Event handler to close the manage dialog.
	 *
	 */
	closeManageDialog = () => {
		this.manageDialog?.close();
	};

	/**
	 * Returns the invite button if there's a share action on root level.
	 *
	 * @returns The control tree
	 */
	getInviteButton() {
		if ((this.contextObject.targetEntitySet?.annotations.Common as EntitySetAnnotations_Common)?.DraftRoot?.ShareAction) {
			return (
				<HBox visible="{ui>/isEditable}" alignItems="Center" justifyContent="Start">
					<Avatar backgroundColor="TileIcon" src="sap-icon://add-employee" displaySize="XS" press={this.manageCollaboration} />
				</HBox>
			);
		} else {
			return <HBox />;
		}
	}

	/**
	 * Returns the content of the collaboration draft building block.
	 *
	 * @param view The view for which the building block is created
	 * @returns The control tree
	 */
	getContent(view: FEView) {
		this.containingView = view;

		if (ModelHelper.isCollaborationDraftSupported(this.contextPath.getModel())) {
			return (
				<>
					<HBox
						items={{ path: "internal>/collaboration/activeUsers" }}
						class="sapUiTinyMarginBegin"
						visible="{= ${ui>/isEditable} &amp;&amp; ${internal>/collaboration/connected} }"
						alignItems="Center"
						justifyContent="Start"
					>
						<Avatar
							initials="{internal>initials}"
							displaySize="XS"
							backgroundColor="Accent{internal>color}"
							press={this.showCollaborationUserDetails}
						/>
					</HBox>
					{this.getInviteButton()}
				</>
			);
		}
	}
}

import Log from "sap/base/Log";
import {
	broadcastCollaborationMessage,
	endCollaboration,
	initializeCollaboration
} from "sap/fe/core/controllerextensions/collaboration/ActivityBase";
import type { Message } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import { Activity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import draft from "sap/fe/core/controllerextensions/editFlow/draft";
import JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/odata/v4/Context";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";

const CollaborationAPI = {
	_lastReceivedMessages: [] as Message[],
	_rootPath: "",
	_oModel: undefined as ODataModel | undefined,
	_lockedPropertyPath: "",
	_internalModel: undefined as JSONModel | undefined,

	/**
	 * Open an existing collaborative draft with a new user, and creates a 'ghost client' for this user.
	 *
	 * @param oContext The context of the collaborative draft
	 * @param userID The ID of the user
	 * @param userName The name of the user
	 */
	enterDraft: function (oContext: Context, userID: string, userName: string) {
		const webSocketBaseURL: string = oContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");

		if (!webSocketBaseURL) {
			Log.error("Cannot find WebSocketBaseURL annotation");
			return;
		}

		const sDraftUUID: string = oContext.getProperty("DraftAdministrativeData/DraftUUID");
		this._internalModel = new JSONModel({});

		const serviceUrl = oContext.getModel().getServiceUrl();

		initializeCollaboration(
			{
				id: userID,
				name: userName,
				initialName: userName
			},
			webSocketBaseURL,
			sDraftUUID,
			serviceUrl,
			this._internalModel,
			this._onMessageReceived.bind(this),
			true
		);

		this._rootPath = oContext.getPath();
		this._oModel = oContext.getModel();
	},

	/**
	 * Checks if the ghost client has received a given message.
	 *
	 * @param message The message content to be looked for
	 * @returns True if a previously received message matches the content
	 */
	checkReceived: function (message: Partial<Message>): boolean {
		if (this._lastReceivedMessages.length === 0) {
			return false;
		}

		const found = this._lastReceivedMessages.some((receivedMessage) => {
			return (
				(!message.userID || message.userID === receivedMessage.userID) &&
				(!message.userAction || message.userAction === receivedMessage.userAction) &&
				(!message.clientContent || message.clientContent === receivedMessage.clientContent)
			);
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
	startLiveChange: function (sPropertyPath: string) {
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
	updatePropertyValue: function (sPropertyPath: string, value: any) {
		if (this._internalModel) {
			if (this._lockedPropertyPath !== sPropertyPath) {
				this.startLiveChange(sPropertyPath);
			}

			const oContextBinding = this._oModel!.bindContext(this._rootPath, undefined, {
				$$patchWithoutSideEffects: true,
				$$groupId: "$auto",
				$$updateGroupId: "$auto"
			});

			const oPropertyBinding = this._oModel!.bindProperty(sPropertyPath, oContextBinding.getBoundContext());

			oPropertyBinding
				.requestValue()
				.then(() => {
					oPropertyBinding.setValue(value);
					oContextBinding.attachEventOnce("patchCompleted", () => {
						broadcastCollaborationMessage(Activity.Change, `${this._rootPath}/${sPropertyPath}`, this._internalModel!);
						this._lockedPropertyPath = "";
					});
				})
				.catch(function (err) {
					Log.error(err);
				});
		}
	},

	/**
	 * Simulates that the user did an 'undo' (to be called after startLiveChange).
	 */
	undoChange: function () {
		if (this._lockedPropertyPath) {
			broadcastCollaborationMessage(Activity.Undo, `${this._rootPath}/${this._lockedPropertyPath}`, this._internalModel!);
			this._lockedPropertyPath = "";
		}
	},

	/**
	 * Simulates that the user has discarded the draft.
	 */
	discardDraft: function () {
		if (this._internalModel) {
			const draftContext = this._getDraftContext();

			draftContext
				.requestProperty("IsActiveEntity")
				.then(() => {
					draft.deleteDraft(draftContext);
				})
				.then(() => {
					broadcastCollaborationMessage(
						Activity.Discard,
						this._rootPath.replace("IsActiveEntity=false", "IsActiveEntity=true"),
						this._internalModel!
					);
					this._internalModel!.destroy();
					this._internalModel = undefined;
				})
				.catch(function (err: any) {
					Log.error(err);
				});
		}
	},

	/**
	 * Simulates that the user has deleted an object (child of draft root).
	 *
	 * @param objectPath The path of the object to delete
	 */
	deleteObject: function (objectPath: string) {
		if (this._internalModel) {
			const objectContext = this._getObjectContext(objectPath);

			objectContext
				.requestProperty("IsActiveEntity")
				.then(() => {
					objectContext.delete();
					broadcastCollaborationMessage(Activity.Delete, objectPath, this._internalModel!);
				})
				.catch((err) => {
					Log.error(err);
				});
		}
	},

	// /////////////////////////////
	// Private methods

	_getDraftContext: function (): any {
		return this._getObjectContext(this._rootPath);
	},

	_getObjectContext: function (path: string): Context {
		return this._oModel!.bindContext(path, undefined, {
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
	_onMessageReceived: function (message: Message) {
		message.userAction = message.userAction || message.clientAction;
		this._lastReceivedMessages.push(message);

		if (message.userAction === Activity.Join) {
			broadcastCollaborationMessage(
				Activity.JoinEcho,
				this._lockedPropertyPath ? `${this._rootPath}/${this._lockedPropertyPath}` : undefined,
				this._internalModel!
			);
		}
	}
};

export default CollaborationAPI;

import Log from "sap/base/Log";
import { defineBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockSupport";
import RuntimeBuildingBlock from "sap/fe/core/buildingBlocks/RuntimeBuildingBlock";
import type EditFlow from "sap/fe/core/controllerextensions/EditFlow";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import { defineReference } from "sap/fe/core/helpers/ClassSupport";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import type { Ref } from "sap/fe/core/jsx-runtime/jsx";
import Button from "sap/m/Button";
import CustomListItem from "sap/m/CustomListItem";
import Dialog from "sap/m/Dialog";
import Label from "sap/m/Label";
import List from "sap/m/List";
import Text from "sap/m/Text";
import VBox from "sap/m/VBox";
import CustomData from "sap/ui/core/CustomData";
import type UI5Element from "sap/ui/core/Element";
import { ValueState } from "sap/ui/core/library";
import type Context from "sap/ui/model/odata/v4/Context";
import type PageController from "../../PageController";
import type ResourceModel from "../../ResourceModel";

//custom type for controller in order to allow additional properties
type DataLossController = PageController & { _saveDocument: Function; editFlow: EditFlow };

enum DraftDataLossOptions {
	Save = "draftDataLossOptionSave",
	Keep = "draftDataLossOptionKeep",
	Discard = "draftDataLossOptionDiscard"
}

@defineBuildingBlock({
	name: "DraftDataLossDialog",
	namespace: "sap.fe.core.controllerextensions"
})
export default class DraftDataLossDialogBlock extends RuntimeBuildingBlock {
	constructor(props: PropertiesOf<DraftDataLossDialogBlock>) {
		super(props);
	}

	@defineReference()
	dataLossDialog!: Ref<Dialog>;

	@defineReference()
	optionsList!: Ref<List>;

	private onDataLossConfirmationFollowUpFunction!: () => void;

	private onDataLossCancelFollowUpFunction!: () => void;

	private controller!: DataLossController;

	private dataLossResourceModel!: ResourceModel;

	private skipBindingToView!: boolean | undefined;

	/**
	 * Opens the data loss dialog.
	 *
	 * @function
	 * @name dataLossConfirmation
	 */
	private dataLossConfirmation() {
		const view = this.controller.getView();
		this.dataLossResourceModel = getResourceModel(view);
		this.getContent();
		const dataLossConfirm = () => this.handleDataLossOk();
		this.optionsList.current?.addEventDelegate({
			onsapenter: function () {
				dataLossConfirm();
			}
		});
		view.addDependent(this.dataLossDialog.current as UI5Element);
		this.openDataLossDialog();
		this.selectAndFocusFirstEntry();
	}

	/**
	 * Executes the follow-up function and resolves/rejects the promise.
	 *
	 * @function
	 * @name performAfterDiscardorKeepDraft
	 * @param processFunctionOnDatalossOk Callback to process the draft handler
	 * @param processFunctionOnDatalossCancel Callback to process the cancel function
	 * @param controller Controller of the current view
	 * @param skipBindingToView The parameter to skip the binding to the view
	 */
	public async performAfterDiscardorKeepDraft(
		processFunctionOnDatalossOk: Function,
		processFunctionOnDatalossCancel: Function,
		controller: DataLossController,
		skipBindingToView: boolean | undefined
	) {
		this.controller = controller;
		this.skipBindingToView = skipBindingToView;
		this.dataLossConfirmation();
		return new Promise((resolve: (value: unknown) => void, reject: (reason?: unknown) => void) => {
			this.onDataLossConfirmationFollowUpFunction = (context?: Context) => {
				const value = processFunctionOnDatalossOk(context);
				resolve(value);
			};
			this.onDataLossCancelFollowUpFunction = () => {
				processFunctionOnDatalossCancel();
				reject();
			};
		});
	}

	/**
	 * Executes the logic when the data loss dialog is confirmed. The selection of an option resolves the promise and leads to the
	 * processing of the originally triggered action like e.g. a back navigation.
	 *
	 * @function
	 * @name handleDataLossOk
	 */
	private handleDataLossOk() {
		const selectedKey = this.getSelectedKey();
		if (selectedKey === DraftDataLossOptions.Save) {
			this.saveDocument(this.controller)
				.then(this.onDataLossConfirmationFollowUpFunction)
				.catch(function (error: string | undefined) {
					Log.error("Error while saving document", error);
				});
			this.closeDataLossDialog();
		} else if (selectedKey === DraftDataLossOptions.Keep) {
			this.onDataLossConfirmationFollowUpFunction();
			this.closeDataLossDialog();
		} else if (selectedKey === DraftDataLossOptions.Discard) {
			this.discardDraft(this.controller, this.skipBindingToView)
				.then(this.onDataLossConfirmationFollowUpFunction)
				.catch(function (error: string | undefined) {
					Log.error("Error while discarding draft", error);
				});
			this.closeDataLossDialog();
		}
	}

	/**
	 * Handler to close the dataloss dialog.
	 *
	 * @function
	 * @name handleDataLossCancel
	 */
	private handleDataLossCancel() {
		this.onDataLossCancelFollowUpFunction();
		this.closeDataLossDialog();
	}

	/**
	 * Sets the focus on the first list item of the dialog.
	 *
	 * @function
	 * @name selectAndFocusFirstEntry
	 */
	private selectAndFocusFirstEntry() {
		const firstListItemOption: CustomListItem = this.optionsList.current?.getItems()[0] as CustomListItem;
		this.optionsList.current?.setSelectedItem(firstListItemOption);
		// We do not set the focus on the button, but catch the ENTER key in the dialog
		// and process it as Ok, since focusing the button was reported as an ACC issue
		firstListItemOption?.focus();
	}

	/**
	 * Discards the draft.
	 *
	 * @function
	 * @name discardDraft
	 * @param controller Controller of the current view
	 * @param skipBindingToView The parameter to skip the binding to the view
	 * @returns A promise resolved if cancelDocument was successful
	 */
	public async discardDraft(controller: PageController, skipBindingToView: unknown) {
		const context = controller.getView().getBindingContext() as Context;
		const params = {
			skipBackNavigation: true,
			skipDiscardPopover: true,
			skipBindingToView: skipBindingToView !== undefined ? skipBindingToView : true
		};
		return controller.editFlow.cancelDocument(context, params);
	}

	/**
	 * Saves the document. If the controller is of type ObjectPage, then internal _saveDocument is called, otherwise saveDocument
	 * from EditFlow is called.
	 *
	 * @function
	 * @name saveDocument
	 * @param controller Controller of the current view
	 * @returns A promise resolved if the save was successful
	 */
	private saveDocument(controller: DataLossController) {
		const context = controller.getView().getBindingContext() as Context;
		if (controller.isA("sap.fe.templates.ObjectPage.ObjectPageController")) {
			return controller._saveDocument(context);
		} else {
			return (controller as DataLossController).editFlow.saveDocument(context, {});
		}
	}

	/**
	 * Gets the key of the selected item from the list of options that was set via customData.
	 *
	 * @function
	 * @name getSelectedKey
	 * @returns The key of the currently selected item
	 */
	private getSelectedKey() {
		const optionsList = this.optionsList.current as List;
		return optionsList.getSelectedItem().data("itemKey");
	}

	/**
	 * Handler to open the dataloss dialog.
	 *
	 * @function
	 * @name openDataLossDialog
	 */
	private openDataLossDialog() {
		this.dataLossDialog.current?.open();
	}

	/**
	 * Handler to close the dataloss dialog.
	 *
	 * @function
	 * @name closeDataLossDialog
	 */
	private closeDataLossDialog() {
		this.dataLossDialog.current?.close();
		this.dataLossDialog.current?.destroy();
	}

	/**
	 * Returns the confirm button.
	 *
	 * @function
	 * @name getConfirmButton
	 * @returns A button
	 */
	private getConfirmButton() {
		return (
			<Button
				text={this.dataLossResourceModel.getText("C_COMMON_DIALOG_OK")}
				type={"Emphasized"}
				press={() => this.handleDataLossOk()}
			/>
		) as Button;
	}

	/**
	 * Returns the cancel button.
	 *
	 * @function
	 * @name getCancelButton
	 * @returns A button
	 */
	private getCancelButton() {
		return (
			<Button text={this.dataLossResourceModel.getText("C_COMMON_DIALOG_CANCEL")} press={() => this.handleDataLossCancel()} />
		) as Button;
	}

	/**
	 * The building block render function.
	 *
	 * @returns An XML-based string
	 */
	getContent() {
		const hasActiveEntity = this.controller.getView().getBindingContext()?.getObject().HasActiveEntity;
		const description = hasActiveEntity
			? this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_POPUP_MESSAGE_SAVE")
			: this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_POPUP_MESSAGE_CREATE");
		const createOrSaveLabel = hasActiveEntity
			? this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_SAVE_DRAFT_RBL")
			: this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_CREATE_ENTITY_RBL");
		const createOrSaveText = hasActiveEntity
			? this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_SAVE_DRAFT_TOL")
			: this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_CREATE_ENTITY_TOL");
		return (
			<Dialog
				title={this.dataLossResourceModel.getText("WARNING")}
				state={ValueState.Warning}
				type={"Message"}
				contentWidth={"22rem"}
				ref={this.dataLossDialog}
			>
				{{
					content: (
						<>
							<Text text={description} class="sapUiTinyMarginBegin sapUiTinyMarginTopBottom" />
							<List
								mode="SingleSelectLeft"
								showSeparators="None"
								includeItemInSelection="true"
								backgroundDesign="Transparent"
								class="sapUiNoContentPadding"
								ref={this.optionsList}
							>
								<CustomListItem customData={[new CustomData({ key: "itemKey", value: "draftDataLossOptionSave" })]}>
									<VBox class="sapUiTinyMargin">
										<Label text={createOrSaveLabel} design="Bold" />
										<Text text={createOrSaveText} />
									</VBox>
								</CustomListItem>
								<CustomListItem customData={[new CustomData({ key: "itemKey", value: "draftDataLossOptionKeep" })]}>
									<VBox class="sapUiTinyMargin">
										<Label
											text={this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_KEEP_DRAFT_RBL")}
											design="Bold"
										/>
										<Text text={this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_KEEP_DRAFT_TOL")} />
									</VBox>
								</CustomListItem>
								<CustomListItem customData={[new CustomData({ key: "itemKey", value: "draftDataLossOptionDiscard" })]}>
									<VBox class="sapUiTinyMargin">
										<Label
											text={this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_DISCARD_DRAFT_RBL")}
											design="Bold"
										/>
										<Text text={this.dataLossResourceModel.getText("ST_DRAFT_DATALOSS_DISCARD_DRAFT_TOL")} />
									</VBox>
								</CustomListItem>
							</List>
						</>
					),
					buttons: (
						<>
							confirmButton = {this.getConfirmButton()}
							cancelButton = {this.getCancelButton()}
						</>
					)
				}}
			</Dialog>
		) as Dialog;
	}
}

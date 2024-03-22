import type {
	DataFieldAbstractTypes,
	DataFieldForAction,
	DataFieldForIntentBasedNavigation
} from "@sap-ux/vocabularies-types/vocabularies/UI";

import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor";
import {
	isDataFieldForAction,
	isDataFieldForIntentBasedNavigation,
	isDataModelObjectPathForActionWithDialog
} from "sap/fe/core/converters/annotations/DataField";
import type { AnnotationAction, BaseAction, CustomAction } from "sap/fe/core/converters/controls/Common/Action";
import { ButtonType } from "sap/fe/core/converters/controls/Common/Action";
import type { StandardActionConfigType } from "sap/fe/core/converters/controls/Common/table/StandardActions";
import { ActionType } from "sap/fe/core/converters/ManifestSettings";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import type { MetaModelContext } from "sap/fe/core/templating/UIFormatters";
import { getDataModelObjectPath } from "sap/fe/core/templating/UIFormatters";
import CommonHelper from "../CommonHelper";
import DefaultActionHandler from "../internal/helpers/DefaultActionHandler";
import type TableBlock from "./Table.block";
import TableHelper from "./TableHelper";

/**
 * Generates the xml string for the DataFieldForAction MenuItem.
 *
 * @param dataField DataField for action
 * @param action The name of the action
 * @param menuItemAction The menuItemAction to be evaluated
 * @param table The instance of the table building block
 * @returns The xml string for the DataFieldForAction MenuItem
 */
function getMenuItemForAction(
	dataField: DataFieldForAction,
	action: BaseAction | AnnotationAction | CustomAction,
	menuItemAction: BaseAction,
	table: TableBlock
) {
	if (!menuItemAction.annotationPath) return;
	const actionContextPath = CommonHelper.getActionContext(
		table.metaPath.getModel().createBindingContext(menuItemAction.annotationPath + "/Action")!
	);
	const actionContext = table.metaPath.getModel().createBindingContext(actionContextPath);
	const dataFieldDataModelObjectPath = actionContext
		? MetaModelConverter.getInvolvedDataModelObjects(actionContext, table.collection)
		: undefined;
	const isBound = dataField.ActionTarget?.isBound;
	const isOperationAvailable = dataField.ActionTarget?.annotations?.Core?.OperationAvailable?.valueOf() !== false;
	const press = menuItemAction.command
		? "cmd:" + menuItemAction.command
		: TableHelper.pressEventDataFieldForActionButton(
				{
					contextObjectPath: table.contextObjectPath,
					id: table.id
				},
				dataField,
				table.collectionEntity.name,
				table.tableDefinition.operationAvailableMap,
				actionContext.getObject(),
				action.isNavigable,
				menuItemAction.enableAutoScroll,
				menuItemAction.defaultValuesExtensionFunction
		  );
	const enabled =
		menuItemAction.enabled !== undefined
			? menuItemAction.enabled
			: TableHelper.isDataFieldForActionEnabled(
					table.tableDefinition,
					dataField.Action,
					!!isBound,
					actionContext.getObject(),
					menuItemAction.enableOnSelect,
					dataFieldDataModelObjectPath?.targetEntityType
			  );
	if (isBound !== true || isOperationAvailable) {
		return xml`<MenuItem
				text="${dataField.Label}"
				press="${press}"
				enabled="${enabled}"
				visible="${menuItemAction.visible}"
				/>`;
	}
}

/**
 * Generates the xml string for the DataFieldForIntentBasedNavigation MenuItem.
 *
 * @param dataField DataField for IntentBasedNavigation
 * @param menuItemAction The menuItemAction to be evaluated
 * @param table The instance of the table building block
 * @returns The xml string for the DataFieldForIntentBasedNavigation MenuItem
 */
function getMenuItemForIntentBasedNavigation(dataField: DataFieldForIntentBasedNavigation, menuItemAction: BaseAction, table: TableBlock) {
	const dataFieldContext = menuItemAction.annotationPath
		? table.metaPath.getModel().createBindingContext(menuItemAction.annotationPath)
		: null;
	return xml`<MenuItem xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
			text="${dataField.Label}"
			press="${
				menuItemAction.command
					? "cmd:" + menuItemAction.command
					: CommonHelper.getPressHandlerForDataFieldForIBN(
							dataFieldContext?.getObject(),
							"${internal>selectedContexts}",
							!table.tableDefinition.enableAnalytics
					  )
			}"
			enabled="${
				menuItemAction.enabled !== undefined
					? menuItemAction.enabled
					: TableHelper.isDataFieldForIBNEnabled(
							{
								collection: table.collection,
								tableDefinition: table.tableDefinition
							},
							dataField,
							dataField.RequiresContext,
							dataField.NavigationAvailable
					  )
			}"
			visible="${menuItemAction.visible}"
			macrodata:IBNData="${
				!dataField.RequiresContext ? `{semanticObject: '${dataField.SemanticObject}' , action : '${dataField.Action}'}` : undefined
			}"
		/>`;
}

/**
 * Generates the xml string for the MenuItem based on the type of the menuItemAction.
 *
 * @param action The name of the action
 * @param menuItemAction The menuItemAction to be evaluated
 * @param table The instance of the table building block
 * @returns The xml string for the MenuItem
 */
function getMenuItem(action: BaseAction | AnnotationAction | CustomAction, menuItemAction: BaseAction, table: TableBlock) {
	const dataField = menuItemAction.annotationPath
		? (table.convertedMetaData.resolvePath(menuItemAction.annotationPath).target as DataFieldAbstractTypes)
		: undefined;

	switch (dataField && menuItemAction.type) {
		case "ForAction":
			if (isDataFieldForAction(dataField!)) {
				return getMenuItemForAction(dataField, action, menuItemAction, table);
			}
			break;
		case "ForNavigation":
			if (isDataFieldForIntentBasedNavigation(dataField!)) {
				return getMenuItemForIntentBasedNavigation(dataField, menuItemAction, table);
			}
			break;
		default:
	}

	const actionPress = (menuItemAction as CustomAction).noWrap
		? menuItemAction.press
		: CommonHelper.buildActionWrapper(menuItemAction as CustomAction, { id: table.id });
	return xml`<MenuItem
				core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
				text="${menuItemAction?.text}"
				press="${menuItemAction.command ? "cmd:" + menuItemAction.command : actionPress}"
				visible="${menuItemAction.visible}"
				enabled="${menuItemAction.enabled}"
			/>`;
}

/**
 * Generates the xml string for the DataFieldForActionButton.
 *
 * @param dataField DataField for action
 * @param action The name of the action
 * @param table The instance of the table building block
 * @returns The xml string for the DataFieldForActionButton
 */
function getDataFieldButtonForAction(
	dataField: DataFieldForAction,
	action: BaseAction | AnnotationAction | CustomAction,
	table: TableBlock
) {
	const dataFieldActionContext = table.metaPath.getModel().createBindingContext(action.annotationPath + "/Action");
	const actionContextPath = CommonHelper.getActionContext(dataFieldActionContext!);
	const actionContext = table.metaPath.getModel().createBindingContext(actionContextPath);
	const dataFieldDataModelObjectPath = actionContext
		? MetaModelConverter.getInvolvedDataModelObjects(actionContext, table.collection)
		: undefined;
	const isBound = dataField.ActionTarget?.isBound;
	const press = action.command
		? "cmd:" + action.command
		: TableHelper.pressEventDataFieldForActionButton(
				{
					contextObjectPath: table.contextObjectPath,
					id: table.id
				},
				dataField,
				table.collectionEntity.name,
				table.tableDefinition.operationAvailableMap,
				actionContext.getObject(),
				action.isNavigable,
				action.enableAutoScroll,
				action.defaultValuesExtensionFunction
		  );
	const enabled =
		action.enabled !== undefined
			? action.enabled
			: TableHelper.isDataFieldForActionEnabled(
					table.tableDefinition,
					dataField.Action,
					!!isBound,
					actionContext.getObject(),
					action.enableOnSelect,
					dataFieldDataModelObjectPath?.targetEntityType
			  );
	return xml`<Button xmlns="sap.m"
					id="${generate([table.id, dataField])}"
					text="${dataField.Label}"
					ariaHasPopup="${isDataModelObjectPathForActionWithDialog(
						getDataModelObjectPath({} as MetaModelContext, { context: dataFieldActionContext! })!
					)}"
					press="${press}"
					type="${ButtonType.Transparent}"
					enabled="${enabled}"
					visible="${action.visible}"
				/>`;
}

/**
 * Generates the xml string for the DataFieldForIntentBasedNavigation Button.
 *
 * @param dataField DataField for IntentBasedNavigation
 * @param action The name of the action
 * @param table The instance of the table building block
 * @returns The xml string for the DataFieldForIntentBasedNavigation Button
 */
function getDataFieldButtonForIntentBasedNavigation(
	dataField: DataFieldForIntentBasedNavigation,
	action: BaseAction | AnnotationAction | CustomAction,
	table: TableBlock
) {
	const dataFieldContext = action.annotationPath ? table.metaPath.getModel().createBindingContext(action.annotationPath) : null;
	return xml`<Button xmlns="sap.m"
					id="${generate([table.id, dataField])}"
					text="${dataField.Label}"
					press="${
						action.command
							? "cmd:" + action.command
							: CommonHelper.getPressHandlerForDataFieldForIBN(
									dataFieldContext?.getObject(),
									"${internal>selectedContexts}",
									!table.tableDefinition.enableAnalytics
							  )
					}"
					type="${ButtonType.Transparent}"
					enabled="${
						action.enabled !== undefined
							? action.enabled
							: TableHelper.isDataFieldForIBNEnabled(
									{
										collection: table.collection,
										tableDefinition: table.tableDefinition
									},
									dataField,
									dataField.RequiresContext,
									dataField.NavigationAvailable
							  )
					}"
					visible="${action.visible}"
					macrodata:IBNData="${
						!dataField.RequiresContext
							? "{semanticObject: '" + dataField.SemanticObject + "' , action : '" + dataField.Action + "'}"
							: undefined
					}"
				/>`;
}

/**
 * Generates the xml string for the button based on the type of the action.
 *
 * @param action The name of the action
 * @param table The instance of the table building block
 * @returns The xml string for the button
 */
function getDataFieldButton(action: BaseAction | AnnotationAction | CustomAction, table: TableBlock) {
	const dataField = action.annotationPath
		? (table.convertedMetaData.resolvePath(action.annotationPath).target as DataFieldAbstractTypes)
		: undefined;
	let template = "";
	if (!dataField) {
		return template;
	}
	switch (action.type) {
		case "ForAction":
			if (isDataFieldForAction(dataField)) {
				const isBound = dataField.ActionTarget?.isBound;
				const isOperationAvailable = dataField.ActionTarget?.annotations?.Core?.OperationAvailable?.valueOf() !== false;
				if (isBound !== true || isOperationAvailable) {
					template += getDataFieldButtonForAction(dataField, action, table);
				}
			}
			break;
		case "ForNavigation":
			if (isDataFieldForIntentBasedNavigation(dataField)) {
				template += getDataFieldButtonForIntentBasedNavigation(dataField, action, table);
			}
			break;
		default:
	}

	return template !== ""
		? `<mdcat:ActionToolbarAction
			xmlns="sap.m"
			xmlns:mdcat="sap.ui.mdc.actiontoolbar"
			xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">
			${template}
			</mdcat:ActionToolbarAction>`
		: "";
}

/**
 * Generates the xml string for the MenuButton control which enables the user to show a hierarchical menu.
 *
 * @param action The name of the action
 * @param table The instance of the table building block
 * @returns The xml string for the MenuButton control
 */
function getMenuButton(action: BaseAction | AnnotationAction | CustomAction, table: TableBlock) {
	let xmltemplate = `<mdcat:ActionToolbarAction
						xmlns="sap.m"
						xmlns:mdcat="sap.ui.mdc.actiontoolbar">`;
	const defaultAction = (action as CustomAction).defaultAction as CustomAction | BaseAction | undefined;
	const dataFieldForDefaultAction = defaultAction?.annotationPath
		? table.convertedMetaData.resolvePath(defaultAction.annotationPath).target
		: null;
	const defaultActionContext = defaultAction?.annotationPath
		? CommonHelper.getActionContext(table.metaPath.getModel().createBindingContext(defaultAction.annotationPath + "/Action")!)
		: null;
	xmltemplate += xml`<MenuButton
						text="${action.text}"
						type="${ButtonType.Transparent}"
						menuPosition="BeginBottom"
						id="${generate([table.id, action.id])}"
						visible="${action.visible}"
						enabled="${action.enabled}"
						useDefaultActionOnly="${DefaultActionHandler.getUseDefaultActionOnly(action)}"
						buttonMode="${DefaultActionHandler.getButtonMode(action)}"
						defaultAction="${DefaultActionHandler.getDefaultActionHandler(table, action, dataFieldForDefaultAction, defaultActionContext)}"
						>
					<menu>
						<Menu>`;
	action.menu?.forEach((menuItemAction) => {
		if (typeof menuItemAction !== "string") {
			xmltemplate += getMenuItem(action, menuItemAction, table);
		}
	});
	xmltemplate += `</Menu>
				</menu>
			</MenuButton>
		</mdcat:ActionToolbarAction>`;
	return xmltemplate;
}

/**
 * Generates the xml string for the default button.
 *
 * @param action The name of the action
 * @param table The instance of the table building block
 * @returns The xml string for the default button.
 */
function getDefaultButton(action: CustomAction, table: TableBlock) {
	const actionPress = action.noWrap ? action.press : CommonHelper.buildActionWrapper(action, { id: table.id });
	return xml`<mdcat:ActionToolbarAction
		xmlns="sap.m"
		xmlns:mdcat="sap.ui.mdc.actiontoolbar">
		<Button
			core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
			id="${generate([table.id, action.id])}"
			text="${action.text}"
			press="${action.command ? "cmd:" + action.command : actionPress}"
			type="${ButtonType.Transparent}"
			visible="${action.visible}"
			enabled="${action.enabled}"
		/>
	</mdcat:ActionToolbarAction>`;
}

/**
 * Generates the xml string for actions based on the type of the action.
 *
 * @param table The instance of the table building block
 * @returns The xml string representation of the action
 */
function getActions(table: TableBlock) {
	return table.tableDefinition.actions
		.map((action) => {
			switch (action.type) {
				case "Default":
					if ("noWrap" in action) {
						return getDefaultButton(action, table);
					}
					break;
				case "Menu":
					return getMenuButton(action, table);
				default:
			}
			return getDataFieldButton(action, table);
		})
		.join("");
}

/**
 * Generates the xml string for the create button.
 *
 * @param standardActions Stantard actions to be evaluated
 * @param table The instance of the table building block
 * @returns The xml string for the create button
 */
function getCreateButton(standardActions: Record<string, StandardActionConfigType>, table: TableBlock) {
	if (table.tableDefinition.annotation.standardActions.isInsertUpdateTemplated && standardActions.create.isTemplated !== "false") {
		return xml`<mdcat:ActionToolbarAction
					xmlns="sap.m"
					xmlns:mdcat="sap.ui.mdc.actiontoolbar"
					xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">
						<Button
							id="${generate([table.id, "StandardAction", "Create"])}"
							text="{sap.fe.i18n>M_COMMON_TABLE_CREATE}"
							press="cmd:Create"
							type="${ButtonType.Transparent}"
							visible="${standardActions.create.visible}"
							enabled="${standardActions.create.enabled}"
							macrodata:IBNData="${TableHelper.getIBNData(table.createOutboundDetail)}"
						/>
					</mdcat:ActionToolbarAction>`;
	}
	return "";
}

/**
 * Generates the xml string for the delete button.
 *
 * @param standardActions Stantard actions to be evaluated
 * @param table The instance of the table building block
 * @returns The xml string for the delete button
 */
function getDeleteButton(standardActions: Record<string, StandardActionConfigType>, table: TableBlock) {
	if (standardActions.delete.isTemplated !== "false") {
		return xml`<mdcat:ActionToolbarAction
					xmlns="sap.m"
					xmlns:mdcat="sap.ui.mdc.actiontoolbar">
					<Button
						id="${generate([table.id, "StandardAction", "Delete"])}"
						text="{sap.fe.i18n>M_COMMON_TABLE_DELETE}"
						press="cmd:DeleteEntry"
						type="${ButtonType.Transparent}"
						visible="${standardActions.delete.visible}"
						enabled="${standardActions.delete.enabled}"
					/>
				</mdcat:ActionToolbarAction>`;
	}
	return "";
}

/**
 * Generates the xml string for standard actions based on the type of the standard action.
 *
 * @param table The instance of the table building block
 * @returns The xml string representation of the standard action
 */
function getStandardActions(table: TableBlock) {
	let xmltemplate = ``;
	const standardActions = table.tableDefinition.annotation.standardActions.actions;

	xmltemplate += getCreateButton(standardActions, table);

	//  Generates the xml string for the copy button.
	table.tableDefinition.actions
		.filter((action) => action.type === ActionType.Copy)
		.forEach((action) => {
			const dataField = action.annotationPath
				? (table.convertedMetaData.resolvePath(action.annotationPath).target as DataFieldForAction)
				: undefined;
			xmltemplate += `<mdcat:ActionToolbarAction
					xmlns="sap.m"
					xmlns:mdcat="sap.ui.mdc.actiontoolbar">`;

			xmltemplate += xml`<Button
							id="${generate([table.id, dataField])}"
							text="${action.text}"
							press="${
								dataField
									? TableHelper.pressEventDataFieldForActionButton(
											{
												contextObjectPath: table.contextObjectPath,
												id: table.id
											},
											dataField,
											table.collectionEntity.name,
											table.tableDefinition.operationAvailableMap,
											"${internal>selectedContexts}",
											action.isNavigable,
											action.enableAutoScroll,
											action.defaultValuesExtensionFunction
									  )
									: undefined
							}"
							type="${ButtonType.Transparent}"
							enabled="${action.enabled}"
							visible="${action.visible}"
						/>`;

			xmltemplate += `</mdcat:ActionToolbarAction>`;
		});

	xmltemplate += getDeleteButton(standardActions, table);

	//  Generates the xml string for the massEdit button.
	if (table.tableDefinition.annotation.standardActions.isInsertUpdateTemplated && standardActions.massEdit.isTemplated !== "false") {
		xmltemplate += xml`<mdcat:ActionToolbarAction xmlns="sap.m" xmlns:mdcat="sap.ui.mdc.actiontoolbar">
			<Button
				id="${generate([table.id, "StandardAction", "MassEdit"])}"
				text="{sap.fe.i18n>M_COMMON_TABLE_MASSEDIT}"
				press="API.onMassEditButtonPressed($event, $controller)"
				visible="${standardActions.massEdit.visible}"
				enabled="${standardActions.massEdit.enabled}"
			/>
		</mdcat:ActionToolbarAction>`;
	}

	if (standardActions.insights.isTemplated !== "false") {
		xmltemplate += xml`<mdcat:ActionToolbarAction xmlns="sap.m" xmlns:mdcat="sap.ui.mdc.actiontoolbar">
			<Button
				id="${generate([table.id, "StandardAction", "Insights"])}"
				text="{sap.fe.i18n>M_COMMON_INSIGHTS_CARD}"
				press="API.onAddCardToInsightsPressed($event, $controller)"
				visible="${standardActions.insights.visible}"
				enabled="${standardActions.insights.enabled}"
			>
				<layoutData>
					<OverflowToolbarLayoutData priority="AlwaysOverflow" />
				</layoutData>
			</Button>
		</mdcat:ActionToolbarAction>`;
	}
	return xmltemplate;
}

/**
 * Generates the xml string for BasicSearch.
 *
 * @param table The instance of the table building block
 * @returns The xml string representation of the BasicSearch
 */
function getBasicSearch(table: TableBlock) {
	if (table.useBasicSearch) {
		return xml`<mdcat:ActionToolbarAction xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:macroTable="sap.fe.macros.table">
						<macroTable:BasicSearch id="${table.filterBarId}" useDraftEditState="${table._collectionIsDraftEnabled}"/>
					</mdcat:ActionToolbarAction>`;
	}
	return "";
}

/**
 * Generates the xml string for TableFullScreenDialog.
 *
 * @param table The instance of the table building block
 * @returns The xml string representation of the TableFullScreenDialog
 */
function getFullScreen(table: TableBlock) {
	if (table.enableFullScreen) {
		return xml`<mdcat:ActionToolbarAction xmlns:mdcat="sap.ui.mdc.actiontoolbar" xmlns:macroTable="sap.fe.macros.table">
						<macroTable:TableFullScreenDialog id="${generate([table.id, "StandardAction", "FullScreen"])}" />
					</mdcat:ActionToolbarAction>`;
	}
	return "";
}

/**
 * Generates the xml string for actions.
 *
 * @param table The instance of the table building block
 * @returns The xml string representation of the actions
 */
export function getTableActionTemplate(table: TableBlock) {
	return getBasicSearch(table) + getActions(table) + getStandardActions(table) + getFullScreen(table);
}

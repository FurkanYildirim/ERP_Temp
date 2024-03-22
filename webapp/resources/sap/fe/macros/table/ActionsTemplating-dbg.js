/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/UIFormatters", "../CommonHelper", "../internal/helpers/DefaultActionHandler", "./TableHelper"], function (BuildingBlockTemplateProcessor, DataField, Action, ManifestSettings, MetaModelConverter, StableIdHelper, UIFormatters, CommonHelper, DefaultActionHandler, TableHelper) {
  "use strict";

  var _exports = {};
  var getDataModelObjectPath = UIFormatters.getDataModelObjectPath;
  var generate = StableIdHelper.generate;
  var ActionType = ManifestSettings.ActionType;
  var ButtonType = Action.ButtonType;
  var isDataModelObjectPathForActionWithDialog = DataField.isDataModelObjectPathForActionWithDialog;
  var isDataFieldForIntentBasedNavigation = DataField.isDataFieldForIntentBasedNavigation;
  var isDataFieldForAction = DataField.isDataFieldForAction;
  var xml = BuildingBlockTemplateProcessor.xml;
  /**
   * Generates the xml string for the DataFieldForAction MenuItem.
   *
   * @param dataField DataField for action
   * @param action The name of the action
   * @param menuItemAction The menuItemAction to be evaluated
   * @param table The instance of the table building block
   * @returns The xml string for the DataFieldForAction MenuItem
   */
  function getMenuItemForAction(dataField, action, menuItemAction, table) {
    var _dataField$ActionTarg, _dataField$ActionTarg2, _dataField$ActionTarg3, _dataField$ActionTarg4, _dataField$ActionTarg5;
    if (!menuItemAction.annotationPath) return;
    const actionContextPath = CommonHelper.getActionContext(table.metaPath.getModel().createBindingContext(menuItemAction.annotationPath + "/Action"));
    const actionContext = table.metaPath.getModel().createBindingContext(actionContextPath);
    const dataFieldDataModelObjectPath = actionContext ? MetaModelConverter.getInvolvedDataModelObjects(actionContext, table.collection) : undefined;
    const isBound = (_dataField$ActionTarg = dataField.ActionTarget) === null || _dataField$ActionTarg === void 0 ? void 0 : _dataField$ActionTarg.isBound;
    const isOperationAvailable = ((_dataField$ActionTarg2 = dataField.ActionTarget) === null || _dataField$ActionTarg2 === void 0 ? void 0 : (_dataField$ActionTarg3 = _dataField$ActionTarg2.annotations) === null || _dataField$ActionTarg3 === void 0 ? void 0 : (_dataField$ActionTarg4 = _dataField$ActionTarg3.Core) === null || _dataField$ActionTarg4 === void 0 ? void 0 : (_dataField$ActionTarg5 = _dataField$ActionTarg4.OperationAvailable) === null || _dataField$ActionTarg5 === void 0 ? void 0 : _dataField$ActionTarg5.valueOf()) !== false;
    const press = menuItemAction.command ? "cmd:" + menuItemAction.command : TableHelper.pressEventDataFieldForActionButton({
      contextObjectPath: table.contextObjectPath,
      id: table.id
    }, dataField, table.collectionEntity.name, table.tableDefinition.operationAvailableMap, actionContext.getObject(), action.isNavigable, menuItemAction.enableAutoScroll, menuItemAction.defaultValuesExtensionFunction);
    const enabled = menuItemAction.enabled !== undefined ? menuItemAction.enabled : TableHelper.isDataFieldForActionEnabled(table.tableDefinition, dataField.Action, !!isBound, actionContext.getObject(), menuItemAction.enableOnSelect, dataFieldDataModelObjectPath === null || dataFieldDataModelObjectPath === void 0 ? void 0 : dataFieldDataModelObjectPath.targetEntityType);
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
  function getMenuItemForIntentBasedNavigation(dataField, menuItemAction, table) {
    const dataFieldContext = menuItemAction.annotationPath ? table.metaPath.getModel().createBindingContext(menuItemAction.annotationPath) : null;
    return xml`<MenuItem xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
			text="${dataField.Label}"
			press="${menuItemAction.command ? "cmd:" + menuItemAction.command : CommonHelper.getPressHandlerForDataFieldForIBN(dataFieldContext === null || dataFieldContext === void 0 ? void 0 : dataFieldContext.getObject(), "${internal>selectedContexts}", !table.tableDefinition.enableAnalytics)}"
			enabled="${menuItemAction.enabled !== undefined ? menuItemAction.enabled : TableHelper.isDataFieldForIBNEnabled({
      collection: table.collection,
      tableDefinition: table.tableDefinition
    }, dataField, dataField.RequiresContext, dataField.NavigationAvailable)}"
			visible="${menuItemAction.visible}"
			macrodata:IBNData="${!dataField.RequiresContext ? `{semanticObject: '${dataField.SemanticObject}' , action : '${dataField.Action}'}` : undefined}"
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
  function getMenuItem(action, menuItemAction, table) {
    const dataField = menuItemAction.annotationPath ? table.convertedMetaData.resolvePath(menuItemAction.annotationPath).target : undefined;
    switch (dataField && menuItemAction.type) {
      case "ForAction":
        if (isDataFieldForAction(dataField)) {
          return getMenuItemForAction(dataField, action, menuItemAction, table);
        }
        break;
      case "ForNavigation":
        if (isDataFieldForIntentBasedNavigation(dataField)) {
          return getMenuItemForIntentBasedNavigation(dataField, menuItemAction, table);
        }
        break;
      default:
    }
    const actionPress = menuItemAction.noWrap ? menuItemAction.press : CommonHelper.buildActionWrapper(menuItemAction, {
      id: table.id
    });
    return xml`<MenuItem
				core:require="{FPM: 'sap/fe/core/helpers/FPMHelper'}"
				text="${menuItemAction === null || menuItemAction === void 0 ? void 0 : menuItemAction.text}"
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
  function getDataFieldButtonForAction(dataField, action, table) {
    var _dataField$ActionTarg6;
    const dataFieldActionContext = table.metaPath.getModel().createBindingContext(action.annotationPath + "/Action");
    const actionContextPath = CommonHelper.getActionContext(dataFieldActionContext);
    const actionContext = table.metaPath.getModel().createBindingContext(actionContextPath);
    const dataFieldDataModelObjectPath = actionContext ? MetaModelConverter.getInvolvedDataModelObjects(actionContext, table.collection) : undefined;
    const isBound = (_dataField$ActionTarg6 = dataField.ActionTarget) === null || _dataField$ActionTarg6 === void 0 ? void 0 : _dataField$ActionTarg6.isBound;
    const press = action.command ? "cmd:" + action.command : TableHelper.pressEventDataFieldForActionButton({
      contextObjectPath: table.contextObjectPath,
      id: table.id
    }, dataField, table.collectionEntity.name, table.tableDefinition.operationAvailableMap, actionContext.getObject(), action.isNavigable, action.enableAutoScroll, action.defaultValuesExtensionFunction);
    const enabled = action.enabled !== undefined ? action.enabled : TableHelper.isDataFieldForActionEnabled(table.tableDefinition, dataField.Action, !!isBound, actionContext.getObject(), action.enableOnSelect, dataFieldDataModelObjectPath === null || dataFieldDataModelObjectPath === void 0 ? void 0 : dataFieldDataModelObjectPath.targetEntityType);
    return xml`<Button xmlns="sap.m"
					id="${generate([table.id, dataField])}"
					text="${dataField.Label}"
					ariaHasPopup="${isDataModelObjectPathForActionWithDialog(getDataModelObjectPath({}, {
      context: dataFieldActionContext
    }))}"
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
  function getDataFieldButtonForIntentBasedNavigation(dataField, action, table) {
    const dataFieldContext = action.annotationPath ? table.metaPath.getModel().createBindingContext(action.annotationPath) : null;
    return xml`<Button xmlns="sap.m"
					id="${generate([table.id, dataField])}"
					text="${dataField.Label}"
					press="${action.command ? "cmd:" + action.command : CommonHelper.getPressHandlerForDataFieldForIBN(dataFieldContext === null || dataFieldContext === void 0 ? void 0 : dataFieldContext.getObject(), "${internal>selectedContexts}", !table.tableDefinition.enableAnalytics)}"
					type="${ButtonType.Transparent}"
					enabled="${action.enabled !== undefined ? action.enabled : TableHelper.isDataFieldForIBNEnabled({
      collection: table.collection,
      tableDefinition: table.tableDefinition
    }, dataField, dataField.RequiresContext, dataField.NavigationAvailable)}"
					visible="${action.visible}"
					macrodata:IBNData="${!dataField.RequiresContext ? "{semanticObject: '" + dataField.SemanticObject + "' , action : '" + dataField.Action + "'}" : undefined}"
				/>`;
  }

  /**
   * Generates the xml string for the button based on the type of the action.
   *
   * @param action The name of the action
   * @param table The instance of the table building block
   * @returns The xml string for the button
   */
  function getDataFieldButton(action, table) {
    const dataField = action.annotationPath ? table.convertedMetaData.resolvePath(action.annotationPath).target : undefined;
    let template = "";
    if (!dataField) {
      return template;
    }
    switch (action.type) {
      case "ForAction":
        if (isDataFieldForAction(dataField)) {
          var _dataField$ActionTarg7, _dataField$ActionTarg8, _dataField$ActionTarg9, _dataField$ActionTarg10, _dataField$ActionTarg11;
          const isBound = (_dataField$ActionTarg7 = dataField.ActionTarget) === null || _dataField$ActionTarg7 === void 0 ? void 0 : _dataField$ActionTarg7.isBound;
          const isOperationAvailable = ((_dataField$ActionTarg8 = dataField.ActionTarget) === null || _dataField$ActionTarg8 === void 0 ? void 0 : (_dataField$ActionTarg9 = _dataField$ActionTarg8.annotations) === null || _dataField$ActionTarg9 === void 0 ? void 0 : (_dataField$ActionTarg10 = _dataField$ActionTarg9.Core) === null || _dataField$ActionTarg10 === void 0 ? void 0 : (_dataField$ActionTarg11 = _dataField$ActionTarg10.OperationAvailable) === null || _dataField$ActionTarg11 === void 0 ? void 0 : _dataField$ActionTarg11.valueOf()) !== false;
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
    return template !== "" ? `<mdcat:ActionToolbarAction
			xmlns="sap.m"
			xmlns:mdcat="sap.ui.mdc.actiontoolbar"
			xmlns:macrodata="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1">
			${template}
			</mdcat:ActionToolbarAction>` : "";
  }

  /**
   * Generates the xml string for the MenuButton control which enables the user to show a hierarchical menu.
   *
   * @param action The name of the action
   * @param table The instance of the table building block
   * @returns The xml string for the MenuButton control
   */
  function getMenuButton(action, table) {
    var _action$menu;
    let xmltemplate = `<mdcat:ActionToolbarAction
						xmlns="sap.m"
						xmlns:mdcat="sap.ui.mdc.actiontoolbar">`;
    const defaultAction = action.defaultAction;
    const dataFieldForDefaultAction = defaultAction !== null && defaultAction !== void 0 && defaultAction.annotationPath ? table.convertedMetaData.resolvePath(defaultAction.annotationPath).target : null;
    const defaultActionContext = defaultAction !== null && defaultAction !== void 0 && defaultAction.annotationPath ? CommonHelper.getActionContext(table.metaPath.getModel().createBindingContext(defaultAction.annotationPath + "/Action")) : null;
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
    (_action$menu = action.menu) === null || _action$menu === void 0 ? void 0 : _action$menu.forEach(menuItemAction => {
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
  function getDefaultButton(action, table) {
    const actionPress = action.noWrap ? action.press : CommonHelper.buildActionWrapper(action, {
      id: table.id
    });
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
  function getActions(table) {
    return table.tableDefinition.actions.map(action => {
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
    }).join("");
  }

  /**
   * Generates the xml string for the create button.
   *
   * @param standardActions Stantard actions to be evaluated
   * @param table The instance of the table building block
   * @returns The xml string for the create button
   */
  function getCreateButton(standardActions, table) {
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
  function getDeleteButton(standardActions, table) {
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
  function getStandardActions(table) {
    let xmltemplate = ``;
    const standardActions = table.tableDefinition.annotation.standardActions.actions;
    xmltemplate += getCreateButton(standardActions, table);

    //  Generates the xml string for the copy button.
    table.tableDefinition.actions.filter(action => action.type === ActionType.Copy).forEach(action => {
      const dataField = action.annotationPath ? table.convertedMetaData.resolvePath(action.annotationPath).target : undefined;
      xmltemplate += `<mdcat:ActionToolbarAction
					xmlns="sap.m"
					xmlns:mdcat="sap.ui.mdc.actiontoolbar">`;
      xmltemplate += xml`<Button
							id="${generate([table.id, dataField])}"
							text="${action.text}"
							press="${dataField ? TableHelper.pressEventDataFieldForActionButton({
        contextObjectPath: table.contextObjectPath,
        id: table.id
      }, dataField, table.collectionEntity.name, table.tableDefinition.operationAvailableMap, "${internal>selectedContexts}", action.isNavigable, action.enableAutoScroll, action.defaultValuesExtensionFunction) : undefined}"
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
  function getBasicSearch(table) {
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
  function getFullScreen(table) {
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
  function getTableActionTemplate(table) {
    return getBasicSearch(table) + getActions(table) + getStandardActions(table) + getFullScreen(table);
  }
  _exports.getTableActionTemplate = getTableActionTemplate;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRNZW51SXRlbUZvckFjdGlvbiIsImRhdGFGaWVsZCIsImFjdGlvbiIsIm1lbnVJdGVtQWN0aW9uIiwidGFibGUiLCJhbm5vdGF0aW9uUGF0aCIsImFjdGlvbkNvbnRleHRQYXRoIiwiQ29tbW9uSGVscGVyIiwiZ2V0QWN0aW9uQ29udGV4dCIsIm1ldGFQYXRoIiwiZ2V0TW9kZWwiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImFjdGlvbkNvbnRleHQiLCJkYXRhRmllbGREYXRhTW9kZWxPYmplY3RQYXRoIiwiTWV0YU1vZGVsQ29udmVydGVyIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiY29sbGVjdGlvbiIsInVuZGVmaW5lZCIsImlzQm91bmQiLCJBY3Rpb25UYXJnZXQiLCJpc09wZXJhdGlvbkF2YWlsYWJsZSIsImFubm90YXRpb25zIiwiQ29yZSIsIk9wZXJhdGlvbkF2YWlsYWJsZSIsInZhbHVlT2YiLCJwcmVzcyIsImNvbW1hbmQiLCJUYWJsZUhlbHBlciIsInByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJjb250ZXh0T2JqZWN0UGF0aCIsImlkIiwiY29sbGVjdGlvbkVudGl0eSIsIm5hbWUiLCJ0YWJsZURlZmluaXRpb24iLCJvcGVyYXRpb25BdmFpbGFibGVNYXAiLCJnZXRPYmplY3QiLCJpc05hdmlnYWJsZSIsImVuYWJsZUF1dG9TY3JvbGwiLCJkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24iLCJlbmFibGVkIiwiaXNEYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkIiwiQWN0aW9uIiwiZW5hYmxlT25TZWxlY3QiLCJ0YXJnZXRFbnRpdHlUeXBlIiwieG1sIiwiTGFiZWwiLCJ2aXNpYmxlIiwiZ2V0TWVudUl0ZW1Gb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJkYXRhRmllbGRDb250ZXh0IiwiZ2V0UHJlc3NIYW5kbGVyRm9yRGF0YUZpZWxkRm9ySUJOIiwiZW5hYmxlQW5hbHl0aWNzIiwiaXNEYXRhRmllbGRGb3JJQk5FbmFibGVkIiwiUmVxdWlyZXNDb250ZXh0IiwiTmF2aWdhdGlvbkF2YWlsYWJsZSIsIlNlbWFudGljT2JqZWN0IiwiZ2V0TWVudUl0ZW0iLCJjb252ZXJ0ZWRNZXRhRGF0YSIsInJlc29sdmVQYXRoIiwidGFyZ2V0IiwidHlwZSIsImlzRGF0YUZpZWxkRm9yQWN0aW9uIiwiaXNEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJhY3Rpb25QcmVzcyIsIm5vV3JhcCIsImJ1aWxkQWN0aW9uV3JhcHBlciIsInRleHQiLCJnZXREYXRhRmllbGRCdXR0b25Gb3JBY3Rpb24iLCJkYXRhRmllbGRBY3Rpb25Db250ZXh0IiwiZ2VuZXJhdGUiLCJpc0RhdGFNb2RlbE9iamVjdFBhdGhGb3JBY3Rpb25XaXRoRGlhbG9nIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsImNvbnRleHQiLCJCdXR0b25UeXBlIiwiVHJhbnNwYXJlbnQiLCJnZXREYXRhRmllbGRCdXR0b25Gb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJnZXREYXRhRmllbGRCdXR0b24iLCJ0ZW1wbGF0ZSIsImdldE1lbnVCdXR0b24iLCJ4bWx0ZW1wbGF0ZSIsImRlZmF1bHRBY3Rpb24iLCJkYXRhRmllbGRGb3JEZWZhdWx0QWN0aW9uIiwiZGVmYXVsdEFjdGlvbkNvbnRleHQiLCJEZWZhdWx0QWN0aW9uSGFuZGxlciIsImdldFVzZURlZmF1bHRBY3Rpb25Pbmx5IiwiZ2V0QnV0dG9uTW9kZSIsImdldERlZmF1bHRBY3Rpb25IYW5kbGVyIiwibWVudSIsImZvckVhY2giLCJnZXREZWZhdWx0QnV0dG9uIiwiZ2V0QWN0aW9ucyIsImFjdGlvbnMiLCJtYXAiLCJqb2luIiwiZ2V0Q3JlYXRlQnV0dG9uIiwic3RhbmRhcmRBY3Rpb25zIiwiYW5ub3RhdGlvbiIsImlzSW5zZXJ0VXBkYXRlVGVtcGxhdGVkIiwiY3JlYXRlIiwiaXNUZW1wbGF0ZWQiLCJnZXRJQk5EYXRhIiwiY3JlYXRlT3V0Ym91bmREZXRhaWwiLCJnZXREZWxldGVCdXR0b24iLCJkZWxldGUiLCJnZXRTdGFuZGFyZEFjdGlvbnMiLCJmaWx0ZXIiLCJBY3Rpb25UeXBlIiwiQ29weSIsIm1hc3NFZGl0IiwiaW5zaWdodHMiLCJnZXRCYXNpY1NlYXJjaCIsInVzZUJhc2ljU2VhcmNoIiwiZmlsdGVyQmFySWQiLCJfY29sbGVjdGlvbklzRHJhZnRFbmFibGVkIiwiZ2V0RnVsbFNjcmVlbiIsImVuYWJsZUZ1bGxTY3JlZW4iLCJnZXRUYWJsZUFjdGlvblRlbXBsYXRlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBY3Rpb25zVGVtcGxhdGluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XG5cdERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdERhdGFGaWVsZEZvckFjdGlvbixcblx0RGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcblxuaW1wb3J0IHsgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHtcblx0aXNEYXRhRmllbGRGb3JBY3Rpb24sXG5cdGlzRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLFxuXHRpc0RhdGFNb2RlbE9iamVjdFBhdGhGb3JBY3Rpb25XaXRoRGlhbG9nXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2Fubm90YXRpb25zL0RhdGFGaWVsZFwiO1xuaW1wb3J0IHR5cGUgeyBBbm5vdGF0aW9uQWN0aW9uLCBCYXNlQWN0aW9uLCBDdXN0b21BY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBCdXR0b25UeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vdGFibGUvU3RhbmRhcmRBY3Rpb25zXCI7XG5pbXBvcnQgeyBBY3Rpb25UeXBlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBNZXRhTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgeyBnZXREYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCIuLi9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBEZWZhdWx0QWN0aW9uSGFuZGxlciBmcm9tIFwiLi4vaW50ZXJuYWwvaGVscGVycy9EZWZhdWx0QWN0aW9uSGFuZGxlclwiO1xuaW1wb3J0IHR5cGUgVGFibGVCbG9jayBmcm9tIFwiLi9UYWJsZS5ibG9ja1wiO1xuaW1wb3J0IFRhYmxlSGVscGVyIGZyb20gXCIuL1RhYmxlSGVscGVyXCI7XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB4bWwgc3RyaW5nIGZvciB0aGUgRGF0YUZpZWxkRm9yQWN0aW9uIE1lbnVJdGVtLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIGZvciBhY3Rpb25cbiAqIEBwYXJhbSBhY3Rpb24gVGhlIG5hbWUgb2YgdGhlIGFjdGlvblxuICogQHBhcmFtIG1lbnVJdGVtQWN0aW9uIFRoZSBtZW51SXRlbUFjdGlvbiB0byBiZSBldmFsdWF0ZWRcbiAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIHRhYmxlIGJ1aWxkaW5nIGJsb2NrXG4gKiBAcmV0dXJucyBUaGUgeG1sIHN0cmluZyBmb3IgdGhlIERhdGFGaWVsZEZvckFjdGlvbiBNZW51SXRlbVxuICovXG5mdW5jdGlvbiBnZXRNZW51SXRlbUZvckFjdGlvbihcblx0ZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JBY3Rpb24sXG5cdGFjdGlvbjogQmFzZUFjdGlvbiB8IEFubm90YXRpb25BY3Rpb24gfCBDdXN0b21BY3Rpb24sXG5cdG1lbnVJdGVtQWN0aW9uOiBCYXNlQWN0aW9uLFxuXHR0YWJsZTogVGFibGVCbG9ja1xuKSB7XG5cdGlmICghbWVudUl0ZW1BY3Rpb24uYW5ub3RhdGlvblBhdGgpIHJldHVybjtcblx0Y29uc3QgYWN0aW9uQ29udGV4dFBhdGggPSBDb21tb25IZWxwZXIuZ2V0QWN0aW9uQ29udGV4dChcblx0XHR0YWJsZS5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG1lbnVJdGVtQWN0aW9uLmFubm90YXRpb25QYXRoICsgXCIvQWN0aW9uXCIpIVxuXHQpO1xuXHRjb25zdCBhY3Rpb25Db250ZXh0ID0gdGFibGUubWV0YVBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChhY3Rpb25Db250ZXh0UGF0aCk7XG5cdGNvbnN0IGRhdGFGaWVsZERhdGFNb2RlbE9iamVjdFBhdGggPSBhY3Rpb25Db250ZXh0XG5cdFx0PyBNZXRhTW9kZWxDb252ZXJ0ZXIuZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKGFjdGlvbkNvbnRleHQsIHRhYmxlLmNvbGxlY3Rpb24pXG5cdFx0OiB1bmRlZmluZWQ7XG5cdGNvbnN0IGlzQm91bmQgPSBkYXRhRmllbGQuQWN0aW9uVGFyZ2V0Py5pc0JvdW5kO1xuXHRjb25zdCBpc09wZXJhdGlvbkF2YWlsYWJsZSA9IGRhdGFGaWVsZC5BY3Rpb25UYXJnZXQ/LmFubm90YXRpb25zPy5Db3JlPy5PcGVyYXRpb25BdmFpbGFibGU/LnZhbHVlT2YoKSAhPT0gZmFsc2U7XG5cdGNvbnN0IHByZXNzID0gbWVudUl0ZW1BY3Rpb24uY29tbWFuZFxuXHRcdD8gXCJjbWQ6XCIgKyBtZW51SXRlbUFjdGlvbi5jb21tYW5kXG5cdFx0OiBUYWJsZUhlbHBlci5wcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uKFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y29udGV4dE9iamVjdFBhdGg6IHRhYmxlLmNvbnRleHRPYmplY3RQYXRoLFxuXHRcdFx0XHRcdGlkOiB0YWJsZS5pZFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRkYXRhRmllbGQsXG5cdFx0XHRcdHRhYmxlLmNvbGxlY3Rpb25FbnRpdHkubmFtZSxcblx0XHRcdFx0dGFibGUudGFibGVEZWZpbml0aW9uLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCxcblx0XHRcdFx0YWN0aW9uQ29udGV4dC5nZXRPYmplY3QoKSxcblx0XHRcdFx0YWN0aW9uLmlzTmF2aWdhYmxlLFxuXHRcdFx0XHRtZW51SXRlbUFjdGlvbi5lbmFibGVBdXRvU2Nyb2xsLFxuXHRcdFx0XHRtZW51SXRlbUFjdGlvbi5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb25cblx0XHQgICk7XG5cdGNvbnN0IGVuYWJsZWQgPVxuXHRcdG1lbnVJdGVtQWN0aW9uLmVuYWJsZWQgIT09IHVuZGVmaW5lZFxuXHRcdFx0PyBtZW51SXRlbUFjdGlvbi5lbmFibGVkXG5cdFx0XHQ6IFRhYmxlSGVscGVyLmlzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZChcblx0XHRcdFx0XHR0YWJsZS50YWJsZURlZmluaXRpb24sXG5cdFx0XHRcdFx0ZGF0YUZpZWxkLkFjdGlvbixcblx0XHRcdFx0XHQhIWlzQm91bmQsXG5cdFx0XHRcdFx0YWN0aW9uQ29udGV4dC5nZXRPYmplY3QoKSxcblx0XHRcdFx0XHRtZW51SXRlbUFjdGlvbi5lbmFibGVPblNlbGVjdCxcblx0XHRcdFx0XHRkYXRhRmllbGREYXRhTW9kZWxPYmplY3RQYXRoPy50YXJnZXRFbnRpdHlUeXBlXG5cdFx0XHQgICk7XG5cdGlmIChpc0JvdW5kICE9PSB0cnVlIHx8IGlzT3BlcmF0aW9uQXZhaWxhYmxlKSB7XG5cdFx0cmV0dXJuIHhtbGA8TWVudUl0ZW1cblx0XHRcdFx0dGV4dD1cIiR7ZGF0YUZpZWxkLkxhYmVsfVwiXG5cdFx0XHRcdHByZXNzPVwiJHtwcmVzc31cIlxuXHRcdFx0XHRlbmFibGVkPVwiJHtlbmFibGVkfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke21lbnVJdGVtQWN0aW9uLnZpc2libGV9XCJcblx0XHRcdFx0Lz5gO1xuXHR9XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB4bWwgc3RyaW5nIGZvciB0aGUgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIE1lbnVJdGVtLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGF0YUZpZWxkIGZvciBJbnRlbnRCYXNlZE5hdmlnYXRpb25cbiAqIEBwYXJhbSBtZW51SXRlbUFjdGlvbiBUaGUgbWVudUl0ZW1BY3Rpb24gdG8gYmUgZXZhbHVhdGVkXG4gKiBAcGFyYW0gdGFibGUgVGhlIGluc3RhbmNlIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuICogQHJldHVybnMgVGhlIHhtbCBzdHJpbmcgZm9yIHRoZSBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gTWVudUl0ZW1cbiAqL1xuZnVuY3Rpb24gZ2V0TWVudUl0ZW1Gb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24oZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sIG1lbnVJdGVtQWN0aW9uOiBCYXNlQWN0aW9uLCB0YWJsZTogVGFibGVCbG9jaykge1xuXHRjb25zdCBkYXRhRmllbGRDb250ZXh0ID0gbWVudUl0ZW1BY3Rpb24uYW5ub3RhdGlvblBhdGhcblx0XHQ/IHRhYmxlLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQobWVudUl0ZW1BY3Rpb24uYW5ub3RhdGlvblBhdGgpXG5cdFx0OiBudWxsO1xuXHRyZXR1cm4geG1sYDxNZW51SXRlbSB4bWxuczptYWNyb2RhdGE9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUuQ3VzdG9tRGF0YS8xXCJcblx0XHRcdHRleHQ9XCIke2RhdGFGaWVsZC5MYWJlbH1cIlxuXHRcdFx0cHJlc3M9XCIke1xuXHRcdFx0XHRtZW51SXRlbUFjdGlvbi5jb21tYW5kXG5cdFx0XHRcdFx0PyBcImNtZDpcIiArIG1lbnVJdGVtQWN0aW9uLmNvbW1hbmRcblx0XHRcdFx0XHQ6IENvbW1vbkhlbHBlci5nZXRQcmVzc0hhbmRsZXJGb3JEYXRhRmllbGRGb3JJQk4oXG5cdFx0XHRcdFx0XHRcdGRhdGFGaWVsZENvbnRleHQ/LmdldE9iamVjdCgpLFxuXHRcdFx0XHRcdFx0XHRcIiR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c31cIixcblx0XHRcdFx0XHRcdFx0IXRhYmxlLnRhYmxlRGVmaW5pdGlvbi5lbmFibGVBbmFseXRpY3Ncblx0XHRcdFx0XHQgIClcblx0XHRcdH1cIlxuXHRcdFx0ZW5hYmxlZD1cIiR7XG5cdFx0XHRcdG1lbnVJdGVtQWN0aW9uLmVuYWJsZWQgIT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdD8gbWVudUl0ZW1BY3Rpb24uZW5hYmxlZFxuXHRcdFx0XHRcdDogVGFibGVIZWxwZXIuaXNEYXRhRmllbGRGb3JJQk5FbmFibGVkKFxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Y29sbGVjdGlvbjogdGFibGUuY29sbGVjdGlvbixcblx0XHRcdFx0XHRcdFx0XHR0YWJsZURlZmluaXRpb246IHRhYmxlLnRhYmxlRGVmaW5pdGlvblxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRkYXRhRmllbGQsXG5cdFx0XHRcdFx0XHRcdGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQsXG5cdFx0XHRcdFx0XHRcdGRhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlXG5cdFx0XHRcdFx0ICApXG5cdFx0XHR9XCJcblx0XHRcdHZpc2libGU9XCIke21lbnVJdGVtQWN0aW9uLnZpc2libGV9XCJcblx0XHRcdG1hY3JvZGF0YTpJQk5EYXRhPVwiJHtcblx0XHRcdFx0IWRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQgPyBge3NlbWFudGljT2JqZWN0OiAnJHtkYXRhRmllbGQuU2VtYW50aWNPYmplY3R9JyAsIGFjdGlvbiA6ICcke2RhdGFGaWVsZC5BY3Rpb259J31gIDogdW5kZWZpbmVkXG5cdFx0XHR9XCJcblx0XHQvPmA7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB4bWwgc3RyaW5nIGZvciB0aGUgTWVudUl0ZW0gYmFzZWQgb24gdGhlIHR5cGUgb2YgdGhlIG1lbnVJdGVtQWN0aW9uLlxuICpcbiAqIEBwYXJhbSBhY3Rpb24gVGhlIG5hbWUgb2YgdGhlIGFjdGlvblxuICogQHBhcmFtIG1lbnVJdGVtQWN0aW9uIFRoZSBtZW51SXRlbUFjdGlvbiB0byBiZSBldmFsdWF0ZWRcbiAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIHRhYmxlIGJ1aWxkaW5nIGJsb2NrXG4gKiBAcmV0dXJucyBUaGUgeG1sIHN0cmluZyBmb3IgdGhlIE1lbnVJdGVtXG4gKi9cbmZ1bmN0aW9uIGdldE1lbnVJdGVtKGFjdGlvbjogQmFzZUFjdGlvbiB8IEFubm90YXRpb25BY3Rpb24gfCBDdXN0b21BY3Rpb24sIG1lbnVJdGVtQWN0aW9uOiBCYXNlQWN0aW9uLCB0YWJsZTogVGFibGVCbG9jaykge1xuXHRjb25zdCBkYXRhRmllbGQgPSBtZW51SXRlbUFjdGlvbi5hbm5vdGF0aW9uUGF0aFxuXHRcdD8gKHRhYmxlLmNvbnZlcnRlZE1ldGFEYXRhLnJlc29sdmVQYXRoKG1lbnVJdGVtQWN0aW9uLmFubm90YXRpb25QYXRoKS50YXJnZXQgYXMgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcylcblx0XHQ6IHVuZGVmaW5lZDtcblxuXHRzd2l0Y2ggKGRhdGFGaWVsZCAmJiBtZW51SXRlbUFjdGlvbi50eXBlKSB7XG5cdFx0Y2FzZSBcIkZvckFjdGlvblwiOlxuXHRcdFx0aWYgKGlzRGF0YUZpZWxkRm9yQWN0aW9uKGRhdGFGaWVsZCEpKSB7XG5cdFx0XHRcdHJldHVybiBnZXRNZW51SXRlbUZvckFjdGlvbihkYXRhRmllbGQsIGFjdGlvbiwgbWVudUl0ZW1BY3Rpb24sIHRhYmxlKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJGb3JOYXZpZ2F0aW9uXCI6XG5cdFx0XHRpZiAoaXNEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24oZGF0YUZpZWxkISkpIHtcblx0XHRcdFx0cmV0dXJuIGdldE1lbnVJdGVtRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uKGRhdGFGaWVsZCwgbWVudUl0ZW1BY3Rpb24sIHRhYmxlKTtcblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdH1cblxuXHRjb25zdCBhY3Rpb25QcmVzcyA9IChtZW51SXRlbUFjdGlvbiBhcyBDdXN0b21BY3Rpb24pLm5vV3JhcFxuXHRcdD8gbWVudUl0ZW1BY3Rpb24ucHJlc3Ncblx0XHQ6IENvbW1vbkhlbHBlci5idWlsZEFjdGlvbldyYXBwZXIobWVudUl0ZW1BY3Rpb24gYXMgQ3VzdG9tQWN0aW9uLCB7IGlkOiB0YWJsZS5pZCB9KTtcblx0cmV0dXJuIHhtbGA8TWVudUl0ZW1cblx0XHRcdFx0Y29yZTpyZXF1aXJlPVwie0ZQTTogJ3NhcC9mZS9jb3JlL2hlbHBlcnMvRlBNSGVscGVyJ31cIlxuXHRcdFx0XHR0ZXh0PVwiJHttZW51SXRlbUFjdGlvbj8udGV4dH1cIlxuXHRcdFx0XHRwcmVzcz1cIiR7bWVudUl0ZW1BY3Rpb24uY29tbWFuZCA/IFwiY21kOlwiICsgbWVudUl0ZW1BY3Rpb24uY29tbWFuZCA6IGFjdGlvblByZXNzfVwiXG5cdFx0XHRcdHZpc2libGU9XCIke21lbnVJdGVtQWN0aW9uLnZpc2libGV9XCJcblx0XHRcdFx0ZW5hYmxlZD1cIiR7bWVudUl0ZW1BY3Rpb24uZW5hYmxlZH1cIlxuXHRcdFx0Lz5gO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgeG1sIHN0cmluZyBmb3IgdGhlIERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbi5cbiAqXG4gKiBAcGFyYW0gZGF0YUZpZWxkIERhdGFGaWVsZCBmb3IgYWN0aW9uXG4gKiBAcGFyYW0gYWN0aW9uIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cbiAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIHRhYmxlIGJ1aWxkaW5nIGJsb2NrXG4gKiBAcmV0dXJucyBUaGUgeG1sIHN0cmluZyBmb3IgdGhlIERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvblxuICovXG5mdW5jdGlvbiBnZXREYXRhRmllbGRCdXR0b25Gb3JBY3Rpb24oXG5cdGRhdGFGaWVsZDogRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRhY3Rpb246IEJhc2VBY3Rpb24gfCBBbm5vdGF0aW9uQWN0aW9uIHwgQ3VzdG9tQWN0aW9uLFxuXHR0YWJsZTogVGFibGVCbG9ja1xuKSB7XG5cdGNvbnN0IGRhdGFGaWVsZEFjdGlvbkNvbnRleHQgPSB0YWJsZS5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGFjdGlvbi5hbm5vdGF0aW9uUGF0aCArIFwiL0FjdGlvblwiKTtcblx0Y29uc3QgYWN0aW9uQ29udGV4dFBhdGggPSBDb21tb25IZWxwZXIuZ2V0QWN0aW9uQ29udGV4dChkYXRhRmllbGRBY3Rpb25Db250ZXh0ISk7XG5cdGNvbnN0IGFjdGlvbkNvbnRleHQgPSB0YWJsZS5tZXRhUGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGFjdGlvbkNvbnRleHRQYXRoKTtcblx0Y29uc3QgZGF0YUZpZWxkRGF0YU1vZGVsT2JqZWN0UGF0aCA9IGFjdGlvbkNvbnRleHRcblx0XHQ/IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMoYWN0aW9uQ29udGV4dCwgdGFibGUuY29sbGVjdGlvbilcblx0XHQ6IHVuZGVmaW5lZDtcblx0Y29uc3QgaXNCb3VuZCA9IGRhdGFGaWVsZC5BY3Rpb25UYXJnZXQ/LmlzQm91bmQ7XG5cdGNvbnN0IHByZXNzID0gYWN0aW9uLmNvbW1hbmRcblx0XHQ/IFwiY21kOlwiICsgYWN0aW9uLmNvbW1hbmRcblx0XHQ6IFRhYmxlSGVscGVyLnByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24oXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjb250ZXh0T2JqZWN0UGF0aDogdGFibGUuY29udGV4dE9iamVjdFBhdGgsXG5cdFx0XHRcdFx0aWQ6IHRhYmxlLmlkXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRhdGFGaWVsZCxcblx0XHRcdFx0dGFibGUuY29sbGVjdGlvbkVudGl0eS5uYW1lLFxuXHRcdFx0XHR0YWJsZS50YWJsZURlZmluaXRpb24ub3BlcmF0aW9uQXZhaWxhYmxlTWFwLFxuXHRcdFx0XHRhY3Rpb25Db250ZXh0LmdldE9iamVjdCgpLFxuXHRcdFx0XHRhY3Rpb24uaXNOYXZpZ2FibGUsXG5cdFx0XHRcdGFjdGlvbi5lbmFibGVBdXRvU2Nyb2xsLFxuXHRcdFx0XHRhY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uXG5cdFx0ICApO1xuXHRjb25zdCBlbmFibGVkID1cblx0XHRhY3Rpb24uZW5hYmxlZCAhPT0gdW5kZWZpbmVkXG5cdFx0XHQ/IGFjdGlvbi5lbmFibGVkXG5cdFx0XHQ6IFRhYmxlSGVscGVyLmlzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZChcblx0XHRcdFx0XHR0YWJsZS50YWJsZURlZmluaXRpb24sXG5cdFx0XHRcdFx0ZGF0YUZpZWxkLkFjdGlvbixcblx0XHRcdFx0XHQhIWlzQm91bmQsXG5cdFx0XHRcdFx0YWN0aW9uQ29udGV4dC5nZXRPYmplY3QoKSxcblx0XHRcdFx0XHRhY3Rpb24uZW5hYmxlT25TZWxlY3QsXG5cdFx0XHRcdFx0ZGF0YUZpZWxkRGF0YU1vZGVsT2JqZWN0UGF0aD8udGFyZ2V0RW50aXR5VHlwZVxuXHRcdFx0ICApO1xuXHRyZXR1cm4geG1sYDxCdXR0b24geG1sbnM9XCJzYXAubVwiXG5cdFx0XHRcdFx0aWQ9XCIke2dlbmVyYXRlKFt0YWJsZS5pZCwgZGF0YUZpZWxkXSl9XCJcblx0XHRcdFx0XHR0ZXh0PVwiJHtkYXRhRmllbGQuTGFiZWx9XCJcblx0XHRcdFx0XHRhcmlhSGFzUG9wdXA9XCIke2lzRGF0YU1vZGVsT2JqZWN0UGF0aEZvckFjdGlvbldpdGhEaWFsb2coXG5cdFx0XHRcdFx0XHRnZXREYXRhTW9kZWxPYmplY3RQYXRoKHt9IGFzIE1ldGFNb2RlbENvbnRleHQsIHsgY29udGV4dDogZGF0YUZpZWxkQWN0aW9uQ29udGV4dCEgfSkhXG5cdFx0XHRcdFx0KX1cIlxuXHRcdFx0XHRcdHByZXNzPVwiJHtwcmVzc31cIlxuXHRcdFx0XHRcdHR5cGU9XCIke0J1dHRvblR5cGUuVHJhbnNwYXJlbnR9XCJcblx0XHRcdFx0XHRlbmFibGVkPVwiJHtlbmFibGVkfVwiXG5cdFx0XHRcdFx0dmlzaWJsZT1cIiR7YWN0aW9uLnZpc2libGV9XCJcblx0XHRcdFx0Lz5gO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgeG1sIHN0cmluZyBmb3IgdGhlIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiBCdXR0b24uXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBEYXRhRmllbGQgZm9yIEludGVudEJhc2VkTmF2aWdhdGlvblxuICogQHBhcmFtIGFjdGlvbiBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uXG4gKiBAcGFyYW0gdGFibGUgVGhlIGluc3RhbmNlIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuICogQHJldHVybnMgVGhlIHhtbCBzdHJpbmcgZm9yIHRoZSBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gQnV0dG9uXG4gKi9cbmZ1bmN0aW9uIGdldERhdGFGaWVsZEJ1dHRvbkZvckludGVudEJhc2VkTmF2aWdhdGlvbihcblx0ZGF0YUZpZWxkOiBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdGFjdGlvbjogQmFzZUFjdGlvbiB8IEFubm90YXRpb25BY3Rpb24gfCBDdXN0b21BY3Rpb24sXG5cdHRhYmxlOiBUYWJsZUJsb2NrXG4pIHtcblx0Y29uc3QgZGF0YUZpZWxkQ29udGV4dCA9IGFjdGlvbi5hbm5vdGF0aW9uUGF0aCA/IHRhYmxlLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYWN0aW9uLmFubm90YXRpb25QYXRoKSA6IG51bGw7XG5cdHJldHVybiB4bWxgPEJ1dHRvbiB4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RhYmxlLmlkLCBkYXRhRmllbGRdKX1cIlxuXHRcdFx0XHRcdHRleHQ9XCIke2RhdGFGaWVsZC5MYWJlbH1cIlxuXHRcdFx0XHRcdHByZXNzPVwiJHtcblx0XHRcdFx0XHRcdGFjdGlvbi5jb21tYW5kXG5cdFx0XHRcdFx0XHRcdD8gXCJjbWQ6XCIgKyBhY3Rpb24uY29tbWFuZFxuXHRcdFx0XHRcdFx0XHQ6IENvbW1vbkhlbHBlci5nZXRQcmVzc0hhbmRsZXJGb3JEYXRhRmllbGRGb3JJQk4oXG5cdFx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGRDb250ZXh0Py5nZXRPYmplY3QoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFwiJHtpbnRlcm5hbD5zZWxlY3RlZENvbnRleHRzfVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0IXRhYmxlLnRhYmxlRGVmaW5pdGlvbi5lbmFibGVBbmFseXRpY3Ncblx0XHRcdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0fVwiXG5cdFx0XHRcdFx0dHlwZT1cIiR7QnV0dG9uVHlwZS5UcmFuc3BhcmVudH1cIlxuXHRcdFx0XHRcdGVuYWJsZWQ9XCIke1xuXHRcdFx0XHRcdFx0YWN0aW9uLmVuYWJsZWQgIT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0XHQ/IGFjdGlvbi5lbmFibGVkXG5cdFx0XHRcdFx0XHRcdDogVGFibGVIZWxwZXIuaXNEYXRhRmllbGRGb3JJQk5FbmFibGVkKFxuXHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb2xsZWN0aW9uOiB0YWJsZS5jb2xsZWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0YWJsZURlZmluaXRpb246IHRhYmxlLnRhYmxlRGVmaW5pdGlvblxuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdGRhdGFGaWVsZCxcblx0XHRcdFx0XHRcdFx0XHRcdGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGQuTmF2aWdhdGlvbkF2YWlsYWJsZVxuXHRcdFx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHR9XCJcblx0XHRcdFx0XHR2aXNpYmxlPVwiJHthY3Rpb24udmlzaWJsZX1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTpJQk5EYXRhPVwiJHtcblx0XHRcdFx0XHRcdCFkYXRhRmllbGQuUmVxdWlyZXNDb250ZXh0XG5cdFx0XHRcdFx0XHRcdD8gXCJ7c2VtYW50aWNPYmplY3Q6ICdcIiArIGRhdGFGaWVsZC5TZW1hbnRpY09iamVjdCArIFwiJyAsIGFjdGlvbiA6ICdcIiArIGRhdGFGaWVsZC5BY3Rpb24gKyBcIid9XCJcblx0XHRcdFx0XHRcdFx0OiB1bmRlZmluZWRcblx0XHRcdFx0XHR9XCJcblx0XHRcdFx0Lz5gO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgeG1sIHN0cmluZyBmb3IgdGhlIGJ1dHRvbiBiYXNlZCBvbiB0aGUgdHlwZSBvZiB0aGUgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSBhY3Rpb24gVGhlIG5hbWUgb2YgdGhlIGFjdGlvblxuICogQHBhcmFtIHRhYmxlIFRoZSBpbnN0YW5jZSBvZiB0aGUgdGFibGUgYnVpbGRpbmcgYmxvY2tcbiAqIEByZXR1cm5zIFRoZSB4bWwgc3RyaW5nIGZvciB0aGUgYnV0dG9uXG4gKi9cbmZ1bmN0aW9uIGdldERhdGFGaWVsZEJ1dHRvbihhY3Rpb246IEJhc2VBY3Rpb24gfCBBbm5vdGF0aW9uQWN0aW9uIHwgQ3VzdG9tQWN0aW9uLCB0YWJsZTogVGFibGVCbG9jaykge1xuXHRjb25zdCBkYXRhRmllbGQgPSBhY3Rpb24uYW5ub3RhdGlvblBhdGhcblx0XHQ/ICh0YWJsZS5jb252ZXJ0ZWRNZXRhRGF0YS5yZXNvbHZlUGF0aChhY3Rpb24uYW5ub3RhdGlvblBhdGgpLnRhcmdldCBhcyBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKVxuXHRcdDogdW5kZWZpbmVkO1xuXHRsZXQgdGVtcGxhdGUgPSBcIlwiO1xuXHRpZiAoIWRhdGFGaWVsZCkge1xuXHRcdHJldHVybiB0ZW1wbGF0ZTtcblx0fVxuXHRzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XG5cdFx0Y2FzZSBcIkZvckFjdGlvblwiOlxuXHRcdFx0aWYgKGlzRGF0YUZpZWxkRm9yQWN0aW9uKGRhdGFGaWVsZCkpIHtcblx0XHRcdFx0Y29uc3QgaXNCb3VuZCA9IGRhdGFGaWVsZC5BY3Rpb25UYXJnZXQ/LmlzQm91bmQ7XG5cdFx0XHRcdGNvbnN0IGlzT3BlcmF0aW9uQXZhaWxhYmxlID0gZGF0YUZpZWxkLkFjdGlvblRhcmdldD8uYW5ub3RhdGlvbnM/LkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZT8udmFsdWVPZigpICE9PSBmYWxzZTtcblx0XHRcdFx0aWYgKGlzQm91bmQgIT09IHRydWUgfHwgaXNPcGVyYXRpb25BdmFpbGFibGUpIHtcblx0XHRcdFx0XHR0ZW1wbGF0ZSArPSBnZXREYXRhRmllbGRCdXR0b25Gb3JBY3Rpb24oZGF0YUZpZWxkLCBhY3Rpb24sIHRhYmxlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBcIkZvck5hdmlnYXRpb25cIjpcblx0XHRcdGlmIChpc0RhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbihkYXRhRmllbGQpKSB7XG5cdFx0XHRcdHRlbXBsYXRlICs9IGdldERhdGFGaWVsZEJ1dHRvbkZvckludGVudEJhc2VkTmF2aWdhdGlvbihkYXRhRmllbGQsIGFjdGlvbiwgdGFibGUpO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0fVxuXG5cdHJldHVybiB0ZW1wbGF0ZSAhPT0gXCJcIlxuXHRcdD8gYDxtZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uXG5cdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdHhtbG5zOm1kY2F0PVwic2FwLnVpLm1kYy5hY3Rpb250b29sYmFyXCJcblx0XHRcdHhtbG5zOm1hY3JvZGF0YT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIj5cblx0XHRcdCR7dGVtcGxhdGV9XG5cdFx0XHQ8L21kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24+YFxuXHRcdDogXCJcIjtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHhtbCBzdHJpbmcgZm9yIHRoZSBNZW51QnV0dG9uIGNvbnRyb2wgd2hpY2ggZW5hYmxlcyB0aGUgdXNlciB0byBzaG93IGEgaGllcmFyY2hpY2FsIG1lbnUuXG4gKlxuICogQHBhcmFtIGFjdGlvbiBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uXG4gKiBAcGFyYW0gdGFibGUgVGhlIGluc3RhbmNlIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuICogQHJldHVybnMgVGhlIHhtbCBzdHJpbmcgZm9yIHRoZSBNZW51QnV0dG9uIGNvbnRyb2xcbiAqL1xuZnVuY3Rpb24gZ2V0TWVudUJ1dHRvbihhY3Rpb246IEJhc2VBY3Rpb24gfCBBbm5vdGF0aW9uQWN0aW9uIHwgQ3VzdG9tQWN0aW9uLCB0YWJsZTogVGFibGVCbG9jaykge1xuXHRsZXQgeG1sdGVtcGxhdGUgPSBgPG1kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb25cblx0XHRcdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHRcdFx0eG1sbnM6bWRjYXQ9XCJzYXAudWkubWRjLmFjdGlvbnRvb2xiYXJcIj5gO1xuXHRjb25zdCBkZWZhdWx0QWN0aW9uID0gKGFjdGlvbiBhcyBDdXN0b21BY3Rpb24pLmRlZmF1bHRBY3Rpb24gYXMgQ3VzdG9tQWN0aW9uIHwgQmFzZUFjdGlvbiB8IHVuZGVmaW5lZDtcblx0Y29uc3QgZGF0YUZpZWxkRm9yRGVmYXVsdEFjdGlvbiA9IGRlZmF1bHRBY3Rpb24/LmFubm90YXRpb25QYXRoXG5cdFx0PyB0YWJsZS5jb252ZXJ0ZWRNZXRhRGF0YS5yZXNvbHZlUGF0aChkZWZhdWx0QWN0aW9uLmFubm90YXRpb25QYXRoKS50YXJnZXRcblx0XHQ6IG51bGw7XG5cdGNvbnN0IGRlZmF1bHRBY3Rpb25Db250ZXh0ID0gZGVmYXVsdEFjdGlvbj8uYW5ub3RhdGlvblBhdGhcblx0XHQ/IENvbW1vbkhlbHBlci5nZXRBY3Rpb25Db250ZXh0KHRhYmxlLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoZGVmYXVsdEFjdGlvbi5hbm5vdGF0aW9uUGF0aCArIFwiL0FjdGlvblwiKSEpXG5cdFx0OiBudWxsO1xuXHR4bWx0ZW1wbGF0ZSArPSB4bWxgPE1lbnVCdXR0b25cblx0XHRcdFx0XHRcdHRleHQ9XCIke2FjdGlvbi50ZXh0fVwiXG5cdFx0XHRcdFx0XHR0eXBlPVwiJHtCdXR0b25UeXBlLlRyYW5zcGFyZW50fVwiXG5cdFx0XHRcdFx0XHRtZW51UG9zaXRpb249XCJCZWdpbkJvdHRvbVwiXG5cdFx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RhYmxlLmlkLCBhY3Rpb24uaWRdKX1cIlxuXHRcdFx0XHRcdFx0dmlzaWJsZT1cIiR7YWN0aW9uLnZpc2libGV9XCJcblx0XHRcdFx0XHRcdGVuYWJsZWQ9XCIke2FjdGlvbi5lbmFibGVkfVwiXG5cdFx0XHRcdFx0XHR1c2VEZWZhdWx0QWN0aW9uT25seT1cIiR7RGVmYXVsdEFjdGlvbkhhbmRsZXIuZ2V0VXNlRGVmYXVsdEFjdGlvbk9ubHkoYWN0aW9uKX1cIlxuXHRcdFx0XHRcdFx0YnV0dG9uTW9kZT1cIiR7RGVmYXVsdEFjdGlvbkhhbmRsZXIuZ2V0QnV0dG9uTW9kZShhY3Rpb24pfVwiXG5cdFx0XHRcdFx0XHRkZWZhdWx0QWN0aW9uPVwiJHtEZWZhdWx0QWN0aW9uSGFuZGxlci5nZXREZWZhdWx0QWN0aW9uSGFuZGxlcih0YWJsZSwgYWN0aW9uLCBkYXRhRmllbGRGb3JEZWZhdWx0QWN0aW9uLCBkZWZhdWx0QWN0aW9uQ29udGV4dCl9XCJcblx0XHRcdFx0XHRcdD5cblx0XHRcdFx0XHQ8bWVudT5cblx0XHRcdFx0XHRcdDxNZW51PmA7XG5cdGFjdGlvbi5tZW51Py5mb3JFYWNoKChtZW51SXRlbUFjdGlvbikgPT4ge1xuXHRcdGlmICh0eXBlb2YgbWVudUl0ZW1BY3Rpb24gIT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHhtbHRlbXBsYXRlICs9IGdldE1lbnVJdGVtKGFjdGlvbiwgbWVudUl0ZW1BY3Rpb24sIHRhYmxlKTtcblx0XHR9XG5cdH0pO1xuXHR4bWx0ZW1wbGF0ZSArPSBgPC9NZW51PlxuXHRcdFx0XHQ8L21lbnU+XG5cdFx0XHQ8L01lbnVCdXR0b24+XG5cdFx0PC9tZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPmA7XG5cdHJldHVybiB4bWx0ZW1wbGF0ZTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHhtbCBzdHJpbmcgZm9yIHRoZSBkZWZhdWx0IGJ1dHRvbi5cbiAqXG4gKiBAcGFyYW0gYWN0aW9uIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cbiAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIHRhYmxlIGJ1aWxkaW5nIGJsb2NrXG4gKiBAcmV0dXJucyBUaGUgeG1sIHN0cmluZyBmb3IgdGhlIGRlZmF1bHQgYnV0dG9uLlxuICovXG5mdW5jdGlvbiBnZXREZWZhdWx0QnV0dG9uKGFjdGlvbjogQ3VzdG9tQWN0aW9uLCB0YWJsZTogVGFibGVCbG9jaykge1xuXHRjb25zdCBhY3Rpb25QcmVzcyA9IGFjdGlvbi5ub1dyYXAgPyBhY3Rpb24ucHJlc3MgOiBDb21tb25IZWxwZXIuYnVpbGRBY3Rpb25XcmFwcGVyKGFjdGlvbiwgeyBpZDogdGFibGUuaWQgfSk7XG5cdHJldHVybiB4bWxgPG1kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb25cblx0XHR4bWxucz1cInNhcC5tXCJcblx0XHR4bWxuczptZGNhdD1cInNhcC51aS5tZGMuYWN0aW9udG9vbGJhclwiPlxuXHRcdDxCdXR0b25cblx0XHRcdGNvcmU6cmVxdWlyZT1cIntGUE06ICdzYXAvZmUvY29yZS9oZWxwZXJzL0ZQTUhlbHBlcid9XCJcblx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGFibGUuaWQsIGFjdGlvbi5pZF0pfVwiXG5cdFx0XHR0ZXh0PVwiJHthY3Rpb24udGV4dH1cIlxuXHRcdFx0cHJlc3M9XCIke2FjdGlvbi5jb21tYW5kID8gXCJjbWQ6XCIgKyBhY3Rpb24uY29tbWFuZCA6IGFjdGlvblByZXNzfVwiXG5cdFx0XHR0eXBlPVwiJHtCdXR0b25UeXBlLlRyYW5zcGFyZW50fVwiXG5cdFx0XHR2aXNpYmxlPVwiJHthY3Rpb24udmlzaWJsZX1cIlxuXHRcdFx0ZW5hYmxlZD1cIiR7YWN0aW9uLmVuYWJsZWR9XCJcblx0XHQvPlxuXHQ8L21kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24+YDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHhtbCBzdHJpbmcgZm9yIGFjdGlvbnMgYmFzZWQgb24gdGhlIHR5cGUgb2YgdGhlIGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gdGFibGUgVGhlIGluc3RhbmNlIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuICogQHJldHVybnMgVGhlIHhtbCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFjdGlvblxuICovXG5mdW5jdGlvbiBnZXRBY3Rpb25zKHRhYmxlOiBUYWJsZUJsb2NrKSB7XG5cdHJldHVybiB0YWJsZS50YWJsZURlZmluaXRpb24uYWN0aW9uc1xuXHRcdC5tYXAoKGFjdGlvbikgPT4ge1xuXHRcdFx0c3dpdGNoIChhY3Rpb24udHlwZSkge1xuXHRcdFx0XHRjYXNlIFwiRGVmYXVsdFwiOlxuXHRcdFx0XHRcdGlmIChcIm5vV3JhcFwiIGluIGFjdGlvbikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGdldERlZmF1bHRCdXR0b24oYWN0aW9uLCB0YWJsZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiTWVudVwiOlxuXHRcdFx0XHRcdHJldHVybiBnZXRNZW51QnV0dG9uKGFjdGlvbiwgdGFibGUpO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGdldERhdGFGaWVsZEJ1dHRvbihhY3Rpb24sIHRhYmxlKTtcblx0XHR9KVxuXHRcdC5qb2luKFwiXCIpO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgeG1sIHN0cmluZyBmb3IgdGhlIGNyZWF0ZSBidXR0b24uXG4gKlxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9ucyBTdGFudGFyZCBhY3Rpb25zIHRvIGJlIGV2YWx1YXRlZFxuICogQHBhcmFtIHRhYmxlIFRoZSBpbnN0YW5jZSBvZiB0aGUgdGFibGUgYnVpbGRpbmcgYmxvY2tcbiAqIEByZXR1cm5zIFRoZSB4bWwgc3RyaW5nIGZvciB0aGUgY3JlYXRlIGJ1dHRvblxuICovXG5mdW5jdGlvbiBnZXRDcmVhdGVCdXR0b24oc3RhbmRhcmRBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGU+LCB0YWJsZTogVGFibGVCbG9jaykge1xuXHRpZiAodGFibGUudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc3RhbmRhcmRBY3Rpb25zLmlzSW5zZXJ0VXBkYXRlVGVtcGxhdGVkICYmIHN0YW5kYXJkQWN0aW9ucy5jcmVhdGUuaXNUZW1wbGF0ZWQgIT09IFwiZmFsc2VcIikge1xuXHRcdHJldHVybiB4bWxgPG1kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb25cblx0XHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0XHR4bWxuczptZGNhdD1cInNhcC51aS5tZGMuYWN0aW9udG9vbGJhclwiXG5cdFx0XHRcdFx0eG1sbnM6bWFjcm9kYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiPlxuXHRcdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RhYmxlLmlkLCBcIlN0YW5kYXJkQWN0aW9uXCIsIFwiQ3JlYXRlXCJdKX1cIlxuXHRcdFx0XHRcdFx0XHR0ZXh0PVwie3NhcC5mZS5pMThuPk1fQ09NTU9OX1RBQkxFX0NSRUFURX1cIlxuXHRcdFx0XHRcdFx0XHRwcmVzcz1cImNtZDpDcmVhdGVcIlxuXHRcdFx0XHRcdFx0XHR0eXBlPVwiJHtCdXR0b25UeXBlLlRyYW5zcGFyZW50fVwiXG5cdFx0XHRcdFx0XHRcdHZpc2libGU9XCIke3N0YW5kYXJkQWN0aW9ucy5jcmVhdGUudmlzaWJsZX1cIlxuXHRcdFx0XHRcdFx0XHRlbmFibGVkPVwiJHtzdGFuZGFyZEFjdGlvbnMuY3JlYXRlLmVuYWJsZWR9XCJcblx0XHRcdFx0XHRcdFx0bWFjcm9kYXRhOklCTkRhdGE9XCIke1RhYmxlSGVscGVyLmdldElCTkRhdGEodGFibGUuY3JlYXRlT3V0Ym91bmREZXRhaWwpfVwiXG5cdFx0XHRcdFx0XHQvPlxuXHRcdFx0XHRcdDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHR9XG5cdHJldHVybiBcIlwiO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgeG1sIHN0cmluZyBmb3IgdGhlIGRlbGV0ZSBidXR0b24uXG4gKlxuICogQHBhcmFtIHN0YW5kYXJkQWN0aW9ucyBTdGFudGFyZCBhY3Rpb25zIHRvIGJlIGV2YWx1YXRlZFxuICogQHBhcmFtIHRhYmxlIFRoZSBpbnN0YW5jZSBvZiB0aGUgdGFibGUgYnVpbGRpbmcgYmxvY2tcbiAqIEByZXR1cm5zIFRoZSB4bWwgc3RyaW5nIGZvciB0aGUgZGVsZXRlIGJ1dHRvblxuICovXG5mdW5jdGlvbiBnZXREZWxldGVCdXR0b24oc3RhbmRhcmRBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBTdGFuZGFyZEFjdGlvbkNvbmZpZ1R5cGU+LCB0YWJsZTogVGFibGVCbG9jaykge1xuXHRpZiAoc3RhbmRhcmRBY3Rpb25zLmRlbGV0ZS5pc1RlbXBsYXRlZCAhPT0gXCJmYWxzZVwiKSB7XG5cdFx0cmV0dXJuIHhtbGA8bWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvblxuXHRcdFx0XHRcdHhtbG5zPVwic2FwLm1cIlxuXHRcdFx0XHRcdHhtbG5zOm1kY2F0PVwic2FwLnVpLm1kYy5hY3Rpb250b29sYmFyXCI+XG5cdFx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdFx0aWQ9XCIke2dlbmVyYXRlKFt0YWJsZS5pZCwgXCJTdGFuZGFyZEFjdGlvblwiLCBcIkRlbGV0ZVwiXSl9XCJcblx0XHRcdFx0XHRcdHRleHQ9XCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fVEFCTEVfREVMRVRFfVwiXG5cdFx0XHRcdFx0XHRwcmVzcz1cImNtZDpEZWxldGVFbnRyeVwiXG5cdFx0XHRcdFx0XHR0eXBlPVwiJHtCdXR0b25UeXBlLlRyYW5zcGFyZW50fVwiXG5cdFx0XHRcdFx0XHR2aXNpYmxlPVwiJHtzdGFuZGFyZEFjdGlvbnMuZGVsZXRlLnZpc2libGV9XCJcblx0XHRcdFx0XHRcdGVuYWJsZWQ9XCIke3N0YW5kYXJkQWN0aW9ucy5kZWxldGUuZW5hYmxlZH1cIlxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHR9XG5cdHJldHVybiBcIlwiO1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyB0aGUgeG1sIHN0cmluZyBmb3Igc3RhbmRhcmQgYWN0aW9ucyBiYXNlZCBvbiB0aGUgdHlwZSBvZiB0aGUgc3RhbmRhcmQgYWN0aW9uLlxuICpcbiAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIHRhYmxlIGJ1aWxkaW5nIGJsb2NrXG4gKiBAcmV0dXJucyBUaGUgeG1sIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgc3RhbmRhcmQgYWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldFN0YW5kYXJkQWN0aW9ucyh0YWJsZTogVGFibGVCbG9jaykge1xuXHRsZXQgeG1sdGVtcGxhdGUgPSBgYDtcblx0Y29uc3Qgc3RhbmRhcmRBY3Rpb25zID0gdGFibGUudGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc3RhbmRhcmRBY3Rpb25zLmFjdGlvbnM7XG5cblx0eG1sdGVtcGxhdGUgKz0gZ2V0Q3JlYXRlQnV0dG9uKHN0YW5kYXJkQWN0aW9ucywgdGFibGUpO1xuXG5cdC8vICBHZW5lcmF0ZXMgdGhlIHhtbCBzdHJpbmcgZm9yIHRoZSBjb3B5IGJ1dHRvbi5cblx0dGFibGUudGFibGVEZWZpbml0aW9uLmFjdGlvbnNcblx0XHQuZmlsdGVyKChhY3Rpb24pID0+IGFjdGlvbi50eXBlID09PSBBY3Rpb25UeXBlLkNvcHkpXG5cdFx0LmZvckVhY2goKGFjdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgZGF0YUZpZWxkID0gYWN0aW9uLmFubm90YXRpb25QYXRoXG5cdFx0XHRcdD8gKHRhYmxlLmNvbnZlcnRlZE1ldGFEYXRhLnJlc29sdmVQYXRoKGFjdGlvbi5hbm5vdGF0aW9uUGF0aCkudGFyZ2V0IGFzIERhdGFGaWVsZEZvckFjdGlvbilcblx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHR4bWx0ZW1wbGF0ZSArPSBgPG1kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb25cblx0XHRcdFx0XHR4bWxucz1cInNhcC5tXCJcblx0XHRcdFx0XHR4bWxuczptZGNhdD1cInNhcC51aS5tZGMuYWN0aW9udG9vbGJhclwiPmA7XG5cblx0XHRcdHhtbHRlbXBsYXRlICs9IHhtbGA8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGFibGUuaWQsIGRhdGFGaWVsZF0pfVwiXG5cdFx0XHRcdFx0XHRcdHRleHQ9XCIke2FjdGlvbi50ZXh0fVwiXG5cdFx0XHRcdFx0XHRcdHByZXNzPVwiJHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGRcblx0XHRcdFx0XHRcdFx0XHRcdD8gVGFibGVIZWxwZXIucHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb250ZXh0T2JqZWN0UGF0aDogdGFibGUuY29udGV4dE9iamVjdFBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZDogdGFibGUuaWRcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGFGaWVsZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0YWJsZS5jb2xsZWN0aW9uRW50aXR5Lm5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dGFibGUudGFibGVEZWZpbml0aW9uLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcIiR7aW50ZXJuYWw+c2VsZWN0ZWRDb250ZXh0c31cIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhY3Rpb24uaXNOYXZpZ2FibGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmVuYWJsZUF1dG9TY3JvbGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvblxuXHRcdFx0XHRcdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0XHR9XCJcblx0XHRcdFx0XHRcdFx0dHlwZT1cIiR7QnV0dG9uVHlwZS5UcmFuc3BhcmVudH1cIlxuXHRcdFx0XHRcdFx0XHRlbmFibGVkPVwiJHthY3Rpb24uZW5hYmxlZH1cIlxuXHRcdFx0XHRcdFx0XHR2aXNpYmxlPVwiJHthY3Rpb24udmlzaWJsZX1cIlxuXHRcdFx0XHRcdFx0Lz5gO1xuXG5cdFx0XHR4bWx0ZW1wbGF0ZSArPSBgPC9tZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPmA7XG5cdFx0fSk7XG5cblx0eG1sdGVtcGxhdGUgKz0gZ2V0RGVsZXRlQnV0dG9uKHN0YW5kYXJkQWN0aW9ucywgdGFibGUpO1xuXG5cdC8vICBHZW5lcmF0ZXMgdGhlIHhtbCBzdHJpbmcgZm9yIHRoZSBtYXNzRWRpdCBidXR0b24uXG5cdGlmICh0YWJsZS50YWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuaXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQgJiYgc3RhbmRhcmRBY3Rpb25zLm1hc3NFZGl0LmlzVGVtcGxhdGVkICE9PSBcImZhbHNlXCIpIHtcblx0XHR4bWx0ZW1wbGF0ZSArPSB4bWxgPG1kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24geG1sbnM9XCJzYXAubVwiIHhtbG5zOm1kY2F0PVwic2FwLnVpLm1kYy5hY3Rpb250b29sYmFyXCI+XG5cdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGFibGUuaWQsIFwiU3RhbmRhcmRBY3Rpb25cIiwgXCJNYXNzRWRpdFwiXSl9XCJcblx0XHRcdFx0dGV4dD1cIntzYXAuZmUuaTE4bj5NX0NPTU1PTl9UQUJMRV9NQVNTRURJVH1cIlxuXHRcdFx0XHRwcmVzcz1cIkFQSS5vbk1hc3NFZGl0QnV0dG9uUHJlc3NlZCgkZXZlbnQsICRjb250cm9sbGVyKVwiXG5cdFx0XHRcdHZpc2libGU9XCIke3N0YW5kYXJkQWN0aW9ucy5tYXNzRWRpdC52aXNpYmxlfVwiXG5cdFx0XHRcdGVuYWJsZWQ9XCIke3N0YW5kYXJkQWN0aW9ucy5tYXNzRWRpdC5lbmFibGVkfVwiXG5cdFx0XHQvPlxuXHRcdDwvbWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbj5gO1xuXHR9XG5cblx0aWYgKHN0YW5kYXJkQWN0aW9ucy5pbnNpZ2h0cy5pc1RlbXBsYXRlZCAhPT0gXCJmYWxzZVwiKSB7XG5cdFx0eG1sdGVtcGxhdGUgKz0geG1sYDxtZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uIHhtbG5zPVwic2FwLm1cIiB4bWxuczptZGNhdD1cInNhcC51aS5tZGMuYWN0aW9udG9vbGJhclwiPlxuXHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RhYmxlLmlkLCBcIlN0YW5kYXJkQWN0aW9uXCIsIFwiSW5zaWdodHNcIl0pfVwiXG5cdFx0XHRcdHRleHQ9XCJ7c2FwLmZlLmkxOG4+TV9DT01NT05fSU5TSUdIVFNfQ0FSRH1cIlxuXHRcdFx0XHRwcmVzcz1cIkFQSS5vbkFkZENhcmRUb0luc2lnaHRzUHJlc3NlZCgkZXZlbnQsICRjb250cm9sbGVyKVwiXG5cdFx0XHRcdHZpc2libGU9XCIke3N0YW5kYXJkQWN0aW9ucy5pbnNpZ2h0cy52aXNpYmxlfVwiXG5cdFx0XHRcdGVuYWJsZWQ9XCIke3N0YW5kYXJkQWN0aW9ucy5pbnNpZ2h0cy5lbmFibGVkfVwiXG5cdFx0XHQ+XG5cdFx0XHRcdDxsYXlvdXREYXRhPlxuXHRcdFx0XHRcdDxPdmVyZmxvd1Rvb2xiYXJMYXlvdXREYXRhIHByaW9yaXR5PVwiQWx3YXlzT3ZlcmZsb3dcIiAvPlxuXHRcdFx0XHQ8L2xheW91dERhdGE+XG5cdFx0XHQ8L0J1dHRvbj5cblx0XHQ8L21kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24+YDtcblx0fVxuXHRyZXR1cm4geG1sdGVtcGxhdGU7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB4bWwgc3RyaW5nIGZvciBCYXNpY1NlYXJjaC5cbiAqXG4gKiBAcGFyYW0gdGFibGUgVGhlIGluc3RhbmNlIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuICogQHJldHVybnMgVGhlIHhtbCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIEJhc2ljU2VhcmNoXG4gKi9cbmZ1bmN0aW9uIGdldEJhc2ljU2VhcmNoKHRhYmxlOiBUYWJsZUJsb2NrKSB7XG5cdGlmICh0YWJsZS51c2VCYXNpY1NlYXJjaCkge1xuXHRcdHJldHVybiB4bWxgPG1kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24geG1sbnM6bWRjYXQ9XCJzYXAudWkubWRjLmFjdGlvbnRvb2xiYXJcIiB4bWxuczptYWNyb1RhYmxlPVwic2FwLmZlLm1hY3Jvcy50YWJsZVwiPlxuXHRcdFx0XHRcdFx0PG1hY3JvVGFibGU6QmFzaWNTZWFyY2ggaWQ9XCIke3RhYmxlLmZpbHRlckJhcklkfVwiIHVzZURyYWZ0RWRpdFN0YXRlPVwiJHt0YWJsZS5fY29sbGVjdGlvbklzRHJhZnRFbmFibGVkfVwiLz5cblx0XHRcdFx0XHQ8L21kY2F0OkFjdGlvblRvb2xiYXJBY3Rpb24+YDtcblx0fVxuXHRyZXR1cm4gXCJcIjtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgdGhlIHhtbCBzdHJpbmcgZm9yIFRhYmxlRnVsbFNjcmVlbkRpYWxvZy5cbiAqXG4gKiBAcGFyYW0gdGFibGUgVGhlIGluc3RhbmNlIG9mIHRoZSB0YWJsZSBidWlsZGluZyBibG9ja1xuICogQHJldHVybnMgVGhlIHhtbCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIFRhYmxlRnVsbFNjcmVlbkRpYWxvZ1xuICovXG5mdW5jdGlvbiBnZXRGdWxsU2NyZWVuKHRhYmxlOiBUYWJsZUJsb2NrKSB7XG5cdGlmICh0YWJsZS5lbmFibGVGdWxsU2NyZWVuKSB7XG5cdFx0cmV0dXJuIHhtbGA8bWRjYXQ6QWN0aW9uVG9vbGJhckFjdGlvbiB4bWxuczptZGNhdD1cInNhcC51aS5tZGMuYWN0aW9udG9vbGJhclwiIHhtbG5zOm1hY3JvVGFibGU9XCJzYXAuZmUubWFjcm9zLnRhYmxlXCI+XG5cdFx0XHRcdFx0XHQ8bWFjcm9UYWJsZTpUYWJsZUZ1bGxTY3JlZW5EaWFsb2cgaWQ9XCIke2dlbmVyYXRlKFt0YWJsZS5pZCwgXCJTdGFuZGFyZEFjdGlvblwiLCBcIkZ1bGxTY3JlZW5cIl0pfVwiIC8+XG5cdFx0XHRcdFx0PC9tZGNhdDpBY3Rpb25Ub29sYmFyQWN0aW9uPmA7XG5cdH1cblx0cmV0dXJuIFwiXCI7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIHRoZSB4bWwgc3RyaW5nIGZvciBhY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB0YWJsZSBUaGUgaW5zdGFuY2Ugb2YgdGhlIHRhYmxlIGJ1aWxkaW5nIGJsb2NrXG4gKiBAcmV0dXJucyBUaGUgeG1sIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgYWN0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVBY3Rpb25UZW1wbGF0ZSh0YWJsZTogVGFibGVCbG9jaykge1xuXHRyZXR1cm4gZ2V0QmFzaWNTZWFyY2godGFibGUpICsgZ2V0QWN0aW9ucyh0YWJsZSkgKyBnZXRTdGFuZGFyZEFjdGlvbnModGFibGUpICsgZ2V0RnVsbFNjcmVlbih0YWJsZSk7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUF5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0Esb0JBQW9CLENBQzVCQyxTQUE2QixFQUM3QkMsTUFBb0QsRUFDcERDLGNBQTBCLEVBQzFCQyxLQUFpQixFQUNoQjtJQUFBO0lBQ0QsSUFBSSxDQUFDRCxjQUFjLENBQUNFLGNBQWMsRUFBRTtJQUNwQyxNQUFNQyxpQkFBaUIsR0FBR0MsWUFBWSxDQUFDQyxnQkFBZ0IsQ0FDdERKLEtBQUssQ0FBQ0ssUUFBUSxDQUFDQyxRQUFRLEVBQUUsQ0FBQ0Msb0JBQW9CLENBQUNSLGNBQWMsQ0FBQ0UsY0FBYyxHQUFHLFNBQVMsQ0FBQyxDQUN6RjtJQUNELE1BQU1PLGFBQWEsR0FBR1IsS0FBSyxDQUFDSyxRQUFRLENBQUNDLFFBQVEsRUFBRSxDQUFDQyxvQkFBb0IsQ0FBQ0wsaUJBQWlCLENBQUM7SUFDdkYsTUFBTU8sNEJBQTRCLEdBQUdELGFBQWEsR0FDL0NFLGtCQUFrQixDQUFDQywyQkFBMkIsQ0FBQ0gsYUFBYSxFQUFFUixLQUFLLENBQUNZLFVBQVUsQ0FBQyxHQUMvRUMsU0FBUztJQUNaLE1BQU1DLE9BQU8sNEJBQUdqQixTQUFTLENBQUNrQixZQUFZLDBEQUF0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
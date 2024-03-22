/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff3610.horizon.ui","sap/sac/df/firefly/ff3350.cell.engine.ui","sap/sac/df/firefly/ff3450.contextmenu.engine.ui"
],
function(oFF)
{
"use strict";

oFF.MenuEnginePlugin = function() {};
oFF.MenuEnginePlugin.prototype = new oFF.XObject();
oFF.MenuEnginePlugin.prototype._ff_c = "MenuEnginePlugin";

oFF.MenuEnginePlugin.NAME = "Name";
oFF.MenuEnginePlugin.CONFIG = "Config";
oFF.MenuEnginePlugin.REFRESH_MENU_GENERATOR = "RefreshMenuGenerator";
oFF.MenuEnginePlugin.PLUGIN_NAME = "MenuEngine";
oFF.MenuEnginePlugin.LOAD_BASE_CONFIGURATION = "LoadBaseConfiguration";
oFF.MenuEnginePlugin.LOAD_PLUGIN_CONFIGURATION = "LoadPluginConfiguration";
oFF.MenuEnginePlugin.REGISTER_MENU_ACTION = "RegisterMenuAction";
oFF.MenuEnginePlugin.CHECK_HAS_MENU = "CheckHasMenu";
oFF.MenuEnginePlugin.UPDATE_MENU = "UpdateMenu";
oFF.MenuEnginePlugin.UPDATE_TOOLBAR = "UpdateToolbar";
oFF.MenuEnginePlugin.prototype.m_menuTreeGenerator = null;
oFF.MenuEnginePlugin.prototype.m_menuMapper = null;
oFF.MenuEnginePlugin.prototype.getDescription = function()
{
	return "Plugin for accessing the menu engine";
};
oFF.MenuEnginePlugin.prototype.getName = function()
{
	return oFF.MenuEnginePlugin.PLUGIN_NAME;
};
oFF.MenuEnginePlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMMAND;
};
oFF.MenuEnginePlugin.prototype.getDisplayName = function()
{
	return "Menu engine plugin";
};
oFF.MenuEnginePlugin.prototype.getPluginCategory = function()
{
	return oFF.HuHorizonPluginCategory.OTHER;
};
oFF.MenuEnginePlugin.prototype.processConfig = function(config)
{
	if (oFF.notNull(config))
	{
		this.getOrCreateMenuMapper().setConfiguration(config);
	}
};
oFF.MenuEnginePlugin.prototype.destroyPlugin = function()
{
	this.m_menuMapper = oFF.XObjectExt.release(this.m_menuMapper);
	this.m_menuTreeGenerator = oFF.XObjectExt.release(this.m_menuTreeGenerator);
};
oFF.MenuEnginePlugin.prototype.setupPlugin = function(controller)
{
	this.getOrCreateMenuMapper();
	return null;
};
oFF.MenuEnginePlugin.prototype.getOrCreateMenuMapper = function()
{
	if (oFF.isNull(this.m_menuTreeGenerator))
	{
		this.m_menuTreeGenerator = oFF.CMEFactory.createMenuTreeGenerator();
	}
	if (oFF.isNull(this.m_menuMapper))
	{
		this.m_menuMapper = oFF.CmeUiGenericMenuMapper.create(this.m_menuTreeGenerator);
	}
	return this.m_menuMapper;
};
oFF.MenuEnginePlugin.prototype.registerActions = function(commandController)
{
	commandController.registerAction(oFF.MenuEnginePlugin.LOAD_BASE_CONFIGURATION,  function(context1, customData1){
		this.getOrCreateMenuMapper().setConfiguration(customData1);
		return null;
	}.bind(this));
	commandController.registerAction(oFF.MenuEnginePlugin.LOAD_PLUGIN_CONFIGURATION,  function(context2, customData2){
		var configWrapper = customData2;
		this.m_menuMapper.loadPluginMenuConfiguration(configWrapper.getStringByKey(oFF.MenuEnginePlugin.NAME), configWrapper.getStructureByKey(oFF.MenuEnginePlugin.CONFIG));
		return null;
	}.bind(this));
	commandController.registerAction(oFF.MenuEnginePlugin.REGISTER_MENU_ACTION,  function(context3, customData3){
		var actionWrapper = customData3;
		var action = actionWrapper.getAction();
		if (action.isSelectOption())
		{
			oFF.CMEFactory.getRegistry().registerOption(actionWrapper.getRegistrationKey(), action);
		}
		else
		{
			oFF.CMEFactory.getRegistry().registerAction(actionWrapper.getRegistrationKey(), action);
		}
		return null;
	}.bind(this));
	commandController.registerAction(oFF.MenuEnginePlugin.CHECK_HAS_MENU,  function(context5, customData5){
		return this.checkHasMenu(customData5);
	}.bind(this));
	commandController.registerAction(oFF.MenuEnginePlugin.UPDATE_MENU,  function(context6, customData6){
		return this.updateMenu(customData6);
	}.bind(this));
	commandController.registerAction(oFF.MenuEnginePlugin.UPDATE_TOOLBAR,  function(context7, customData7){
		return this.updateToolbar(customData7);
	}.bind(this));
	commandController.registerAction(oFF.MenuEnginePlugin.REFRESH_MENU_GENERATOR,  function(context8, customData8){
		this.getOrCreateMenuMapper().markDirty();
		return null;
	}.bind(this));
};
oFF.MenuEnginePlugin.prototype.updateToolbar = function(toolbarUpdateWrapper)
{
	var contextAccess = toolbarUpdateWrapper.getContextAccess();
	this.m_menuMapper.populateToolbar(toolbarUpdateWrapper.getToolbarWidget(), contextAccess.getLocalContext(), contextAccess.getUiContext());
	return null;
};
oFF.MenuEnginePlugin.prototype.updateMenu = function(customData)
{
	var consumer =  function(resolve, reject){
		this.updateMenuInternal(customData, resolve, reject);
	}.bind(this);
	return oFF.XPromise.create(consumer);
};
oFF.MenuEnginePlugin.prototype.updateMenuInternal = function(wrapper, resolve, reject)
{
	var control = wrapper.getReferenceControl();
	var biconsumer =  function(md, menu){
		var success = oFF.notNull(md) && oFF.notNull(menu);
		if (success)
		{
			if (oFF.notNull(control))
			{
				menu.openAt(control);
			}
			else
			{
				menu.openAtPosition(wrapper.getXCoordinate(), wrapper.getYCoordinate());
			}
		}
		resolve(oFF.XBooleanValue.create(success));
	}.bind(this);
	var contextAccess = wrapper.getContextAccess();
	this.m_menuMapper.createContextMenu(wrapper.getGenesis(), contextAccess.getLocalContext(), contextAccess.getUiContext(), biconsumer);
};
oFF.MenuEnginePlugin.prototype.checkHasMenu = function(customData)
{
	var consumer =  function(resolve, reject){
		this.checkMenuInternal(customData, resolve, reject);
	}.bind(this);
	return oFF.XPromise.create(consumer);
};
oFF.MenuEnginePlugin.prototype.checkMenuInternal = function(customData, resolve, reject)
{
	var contextAccess = customData;
	this.m_menuMapper.checkMenu(contextAccess.getLocalContext(), contextAccess.getUiContext(),  function(md){
		resolve(oFF.XBooleanValue.create(oFF.notNull(md) && md.hasEffectiveSubItems()));
	}.bind(this));
};

oFF.HpSimpleToastCommandPlugin = function() {};
oFF.HpSimpleToastCommandPlugin.prototype = new oFF.XObject();
oFF.HpSimpleToastCommandPlugin.prototype._ff_c = "HpSimpleToastCommandPlugin";

oFF.HpSimpleToastCommandPlugin.PLUGIN_NAME = "SimpleToastCommand";
oFF.HpSimpleToastCommandPlugin.prototype.getName = function()
{
	return oFF.HpSimpleToastCommandPlugin.PLUGIN_NAME;
};
oFF.HpSimpleToastCommandPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMMAND;
};
oFF.HpSimpleToastCommandPlugin.prototype.getDisplayName = function()
{
	return "Simple Toast Command";
};
oFF.HpSimpleToastCommandPlugin.prototype.getDescription = function()
{
	return "Show a toast with the specified message.";
};
oFF.HpSimpleToastCommandPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuHorizonPluginCategory.DEBUG;
};
oFF.HpSimpleToastCommandPlugin.prototype.processConfig = function(config) {};
oFF.HpSimpleToastCommandPlugin.prototype.setupPlugin = function(controller)
{
	return null;
};
oFF.HpSimpleToastCommandPlugin.prototype.registerActions = function(commandController)
{
	commandController.registerAction("show",  function(context, customData){
		oFF.XLogger.println(context.getDataSpace().getStringByKeyExt("simpleToastMessage", "No message in data space!"));
		var testDataSpaceValue = context.getDataSpace().getStringByKey("test");
		if (oFF.XStringUtils.isNotNullAndNotEmpty(testDataSpaceValue))
		{
			oFF.XLogger.println(oFF.XStringUtils.concatenate2("We got test in data space!! Value: ", testDataSpaceValue));
		}
		commandController.addInfoMessage("Simple action executed!", "'show' action executed!", null);
		return null;
	}.bind(this));
};
oFF.HpSimpleToastCommandPlugin.prototype.destroyPlugin = function() {};

oFF.HpHorizonDebugDocumentPlugin = function() {};
oFF.HpHorizonDebugDocumentPlugin.prototype = new oFF.XObject();
oFF.HpHorizonDebugDocumentPlugin.prototype._ff_c = "HpHorizonDebugDocumentPlugin";

oFF.HpHorizonDebugDocumentPlugin.PLUGIN_NAME = "HorizonDebugDocument";
oFF.HpHorizonDebugDocumentPlugin.prototype.getName = function()
{
	return oFF.HpHorizonDebugDocumentPlugin.PLUGIN_NAME;
};
oFF.HpHorizonDebugDocumentPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.DOCUMENT;
};
oFF.HpHorizonDebugDocumentPlugin.prototype.getDisplayName = function()
{
	return "Horizon Debug Document";
};
oFF.HpHorizonDebugDocumentPlugin.prototype.getDescription = function()
{
	return "A document used to debug horizon.";
};
oFF.HpHorizonDebugDocumentPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuHorizonPluginCategory.DEBUG;
};
oFF.HpHorizonDebugDocumentPlugin.prototype.processConfig = function(config) {};
oFF.HpHorizonDebugDocumentPlugin.prototype.setupPlugin = function(controller)
{
	controller.getDataSpace().putString("Type", "This is a document level data space");
	controller.getDataSpace().putString("simpleToastMessage", "Document data context");
	return null;
};
oFF.HpHorizonDebugDocumentPlugin.prototype.layoutDocument = function(documentController)
{
	documentController.addNewComponentPlugin(oFF.HpHorizonSimpleDebugPlugin.PLUGIN_NAME, null);
	documentController.addNewComponentPlugin(oFF.HpHorizonExtendedDebugPlugin.PLUGIN_NAME, null);
	documentController.getLocalNotificationCenter().addObserverForName("interPluginNotificationDocumentTest",  function(notifaData){
		documentController.getGenesis().showSuccessToast("Received inter-plugin document notification!");
	}.bind(this));
	documentController.addSuccessMessage("Debug document", "Debug document successfully starated!", null);
	documentController.addInfoMessage("Testing info message", "Info message fromd ebug document", null);
	documentController.addInfoMessage("Another info message test", "Grouping test", null);
};
oFF.HpHorizonDebugDocumentPlugin.prototype.destroyPlugin = function() {};
oFF.HpHorizonDebugDocumentPlugin.prototype.onResize = function(offsetWidth, offsetHeight) {};
oFF.HpHorizonDebugDocumentPlugin.prototype.didBecameVisible = function() {};
oFF.HpHorizonDebugDocumentPlugin.prototype.didBecameHidden = function() {};

oFF.HpHorizonExtendedDebugPlugin = function() {};
oFF.HpHorizonExtendedDebugPlugin.prototype = new oFF.XObject();
oFF.HpHorizonExtendedDebugPlugin.prototype._ff_c = "HpHorizonExtendedDebugPlugin";

oFF.HpHorizonExtendedDebugPlugin.PLUGIN_NAME = "HorizonExtendedDebug";
oFF.HpHorizonExtendedDebugPlugin.prototype.m_configJson = null;
oFF.HpHorizonExtendedDebugPlugin.prototype.m_controller = null;
oFF.HpHorizonExtendedDebugPlugin.prototype.m_genesis = null;
oFF.HpHorizonExtendedDebugPlugin.prototype.getName = function()
{
	return oFF.HpHorizonExtendedDebugPlugin.PLUGIN_NAME;
};
oFF.HpHorizonExtendedDebugPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMPONENT;
};
oFF.HpHorizonExtendedDebugPlugin.prototype.getDisplayName = function()
{
	return "Horizon Extended Debug";
};
oFF.HpHorizonExtendedDebugPlugin.prototype.getDescription = function()
{
	return "A extended debug view for horizon.";
};
oFF.HpHorizonExtendedDebugPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuHorizonPluginCategory.DEBUG;
};
oFF.HpHorizonExtendedDebugPlugin.prototype.processConfig = function(config)
{
	this.m_configJson = config;
};
oFF.HpHorizonExtendedDebugPlugin.prototype.setupPlugin = function(controller)
{
	this.m_controller = controller;
	controller.addDataSpaceChangedListener( function(key){
		this.getGenesis().showSuccessToast("Context space change!");
	}.bind(this));
	controller.getLocalNotificationCenter().addObserverForName("interPluginNotificationViewTest",  function(notifaData){
		this.getGenesis().showWarningToast("Received inter-plugin view notification!");
	}.bind(this));
	controller.getLocalNotificationCenter().addObserverForName("interPluginNotificationViewTestNative",  function(notifaData2){
		this.getGenesis().showSuccessToast("Got a notification from a pure native plugin!");
	}.bind(this));
	return null;
};
oFF.HpHorizonExtendedDebugPlugin.prototype.buildPluginUi = function(genesis)
{
	this.m_genesis = genesis;
	var mainLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	mainLayout.useMaxWidth();
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	mainLayout.setPadding(oFF.UiCssBoxEdges.create("0.5rem"));
	mainLayout.addNewItemOfType(oFF.UiType.TITLE).setText("Horizon extended debug plugin!");
	mainLayout.addNewItemOfType(oFF.UiType.LABEL).setText(this.getConfigJson().getStringByKeyExt("desc", "default desc")).setMargin(oFF.UiCssBoxEdges.create("0 0 0.5rem 0"));
	this.showDebugInfo(mainLayout);
};
oFF.HpHorizonExtendedDebugPlugin.prototype.destroyPlugin = function()
{
	this.m_configJson = null;
	this.m_controller = null;
	this.m_genesis = null;
};
oFF.HpHorizonExtendedDebugPlugin.prototype.onResize = function(offsetWidth, offsetHeight) {};
oFF.HpHorizonExtendedDebugPlugin.prototype.didBecameVisible = function() {};
oFF.HpHorizonExtendedDebugPlugin.prototype.didBecameHidden = function() {};
oFF.HpHorizonExtendedDebugPlugin.prototype.showDebugInfo = function(mainLayout)
{
	var debugLayout = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	debugLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	debugLayout.useMaxWidth();
	debugLayout.setBackgroundDesign(oFF.UiBackgroundDesign.SOLID);
	this.addSectionTitle(debugLayout, "Workspace");
	var isVirtualSpace = this._getPluginController().getMainController().getWorkspaceManager().isVirtualWorkspace();
	this.addNewInfoLabel(debugLayout, "Virtual Workspace", this.convertBooleanToString(isVirtualSpace));
	if (!isVirtualSpace)
	{
		this.addNewInfoLabel(debugLayout, "Workspace Dir", this._getPluginController().getMainController().getWorkspaceManager().getWorkspaceDirectory().getUri().getPath());
		this.addNewInfoLabel(debugLayout, "Horizon Dir", this._getPluginController().getMainController().getWorkspaceManager().getHorizonDirectory().getUri().getPath());
		this.addNewInfoLabel(debugLayout, "Settings Dir", this._getPluginController().getMainController().getWorkspaceManager().getSettingsDirectory().getUri().getPath());
		this.addNewInfoLabel(debugLayout, "Plugin Settings Dir", this._getPluginController().getMainController().getWorkspaceManager().getPluginSettingsDirectory().getUri().getPath());
	}
	this.addSectionTitle(debugLayout, "Configurations");
	var configBase = this._getPluginController().getMainController().getConfigManager();
	this.addNewJson(debugLayout, configBase.getJson(), "Global Configuration");
	this.addNewJson(debugLayout, this.getConfigJson(), "My Configuration");
	this.addSectionTitle(debugLayout, "Plugins");
	this.addNewInfoLabel(debugLayout, "Registered plugins", this.convertListToString(oFF.HuPluginRegistration.getAllRegisteredPluginNames()));
	this.addNewInfoLabel(debugLayout, "Loaded plugins", this.convertListToString(oFF.HuPluginRegistration.getAllLoadedPluginNames()));
	this.addNewInfoLabel(debugLayout, "Startup plugins", this.convertListToString(this._getPluginController().getMainController().getConfigManager().getPluginsConfiguration().getAllStartupPlugins()));
	this.addNewInfoLabel(debugLayout, "Available commands", this.convertListToString(this._getPluginController().getMainController().getCommandManager().getAllRunningCommandSpaces()));
};
oFF.HpHorizonExtendedDebugPlugin.prototype.addSectionTitle = function(layout, text)
{
	var tmpSectionTitle = layout.addNewItemOfType(oFF.UiType.TITLE);
	tmpSectionTitle.setText(text);
	tmpSectionTitle.setMargin(oFF.UiCssBoxEdges.create("0.5rem 0 0.3rem 0"));
};
oFF.HpHorizonExtendedDebugPlugin.prototype.addNewInfoLabel = function(layout, text, value)
{
	var wrapperLayout = layout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	wrapperLayout.setDirection(oFF.UiFlexDirection.ROW);
	wrapperLayout.useMaxWidth();
	var tmpLabelLbl = wrapperLayout.addNewItemOfType(oFF.UiType.LABEL);
	tmpLabelLbl.setText(text);
	tmpLabelLbl.setTooltip(text);
	tmpLabelLbl.setShowColon(true);
	tmpLabelLbl.setFlex("0 0 150px");
	tmpLabelLbl.setMargin(oFF.UiCssBoxEdges.create("0 0.5rem 0 0"));
	var tmpValueLbl = wrapperLayout.addNewItemOfType(oFF.UiType.LABEL);
	tmpValueLbl.setText(value);
	tmpValueLbl.setFontWeight(oFF.UiFontWeight.BOLD);
	tmpValueLbl.setWrapping(true);
};
oFF.HpHorizonExtendedDebugPlugin.prototype.addNewJson = function(layout, json, text)
{
	if (oFF.notNull(json) && (json.isStructure() || json.isList()))
	{
		var tmpSerializer = oFF.PrSerializerFactory.newSerializer(false, true, 2);
		var serializedJson = tmpSerializer.serialize(json);
		var tmpPanel = layout.addNewItemOfType(oFF.UiType.PANEL);
		tmpPanel.setExpandable(true);
		tmpPanel.setExpanded(false);
		tmpPanel.setText(text);
		var tmpCodeEditor = tmpPanel.setNewContent(oFF.UiType.CODE_EDITOR);
		tmpCodeEditor.setValue(serializedJson);
		tmpCodeEditor.setCodeType("json");
		tmpCodeEditor.setHeight(oFF.UiCssLength.create("200px"));
		oFF.XTimeout.timeout(300,  function(){
			tmpCodeEditor.prettyPrint();
		}.bind(this));
		oFF.XObjectExt.release(tmpSerializer);
	}
};
oFF.HpHorizonExtendedDebugPlugin.prototype.convertBooleanToString = function(boolVal)
{
	if (boolVal)
	{
		return "YES";
	}
	else
	{
		return "NO";
	}
};
oFF.HpHorizonExtendedDebugPlugin.prototype.convertListToString = function(stringList)
{
	var listStr = oFF.XCollectionUtils.join(stringList, ", ");
	if (oFF.XStringUtils.isNullOrEmpty(listStr))
	{
		listStr = "-= None =-";
	}
	return listStr;
};
oFF.HpHorizonExtendedDebugPlugin.prototype.getConfigJson = function()
{
	return this.m_configJson;
};
oFF.HpHorizonExtendedDebugPlugin.prototype.getGenesis = function()
{
	return this.m_genesis;
};
oFF.HpHorizonExtendedDebugPlugin.prototype._getPluginController = function()
{
	return this.m_controller;
};

oFF.HpHorizonSimpleDebugPlugin = function() {};
oFF.HpHorizonSimpleDebugPlugin.prototype = new oFF.XObject();
oFF.HpHorizonSimpleDebugPlugin.prototype._ff_c = "HpHorizonSimpleDebugPlugin";

oFF.HpHorizonSimpleDebugPlugin.PLUGIN_NAME = "HorizonSimpleDebug";
oFF.HpHorizonSimpleDebugPlugin.prototype.m_controller = null;
oFF.HpHorizonSimpleDebugPlugin.prototype.getName = function()
{
	return oFF.HpHorizonSimpleDebugPlugin.PLUGIN_NAME;
};
oFF.HpHorizonSimpleDebugPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMPONENT;
};
oFF.HpHorizonSimpleDebugPlugin.prototype.getDisplayName = function()
{
	return "Horizon Simple Debug";
};
oFF.HpHorizonSimpleDebugPlugin.prototype.getDescription = function()
{
	return "A simple debug view for horizon.";
};
oFF.HpHorizonSimpleDebugPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuHorizonPluginCategory.DEBUG;
};
oFF.HpHorizonSimpleDebugPlugin.prototype.processConfig = function(config) {};
oFF.HpHorizonSimpleDebugPlugin.prototype.setupPlugin = function(controller)
{
	this.m_controller = controller;
	return null;
};
oFF.HpHorizonSimpleDebugPlugin.prototype.buildPluginUi = function(genesis)
{
	var mainLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	mainLayout.addNewItemOfType(oFF.UiType.BUTTON).setText("Simple Debug action!").registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.getController().getDataSpace().putString("test", "testContextSpaceData");
	}.bind(this)));
	mainLayout.addNewItemOfType(oFF.UiType.BUTTON).setText("Run simple toast command").registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent2){
		this.getController().executeAction(oFF.XStringUtils.concatenate2(oFF.HpSimpleToastCommandPlugin.PLUGIN_NAME, ".show"), null);
	}.bind(this)));
	mainLayout.addNewItemOfType(oFF.UiType.BUTTON).setText("Post inter-plugin document notification").registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent3){
		this.getController().getLocalNotificationCenter().postNotificationWithName("interPluginNotificationDocumentTest", null);
	}.bind(this)));
	mainLayout.addNewItemOfType(oFF.UiType.BUTTON).setText("Post inter-plugin view notification").registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent4){
		this.getController().getLocalNotificationCenter().postNotificationWithName("interPluginNotificationViewTest", null);
	}.bind(this)));
};
oFF.HpHorizonSimpleDebugPlugin.prototype.destroyPlugin = function()
{
	this.m_controller = null;
};
oFF.HpHorizonSimpleDebugPlugin.prototype.onResize = function(offsetWidth, offsetHeight) {};
oFF.HpHorizonSimpleDebugPlugin.prototype.didBecameVisible = function() {};
oFF.HpHorizonSimpleDebugPlugin.prototype.didBecameHidden = function() {};
oFF.HpHorizonSimpleDebugPlugin.prototype.getController = function()
{
	return this.m_controller;
};

oFF.HorizonMenuEngineDebugPlugin = function() {};
oFF.HorizonMenuEngineDebugPlugin.prototype = new oFF.XObject();
oFF.HorizonMenuEngineDebugPlugin.prototype._ff_c = "HorizonMenuEngineDebugPlugin";

oFF.HorizonMenuEngineDebugPlugin.PLUGIN_NAME = "HorizonMenuEngineDebug";
oFF.HorizonMenuEngineDebugPlugin.prototype.m_controller = null;
oFF.HorizonMenuEngineDebugPlugin.prototype.m_selectedOption = null;
oFF.HorizonMenuEngineDebugPlugin.prototype.m_toolbarWidget = null;
oFF.HorizonMenuEngineDebugPlugin.prototype.getName = function()
{
	return oFF.HorizonMenuEngineDebugPlugin.PLUGIN_NAME;
};
oFF.HorizonMenuEngineDebugPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMPONENT;
};
oFF.HorizonMenuEngineDebugPlugin.prototype.getDisplayName = function()
{
	return "Menu Engine Horizon Debug";
};
oFF.HorizonMenuEngineDebugPlugin.prototype.getDescription = function()
{
	return "A debug view for the menu engine in horizon.";
};
oFF.HorizonMenuEngineDebugPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuHorizonPluginCategory.DEBUG;
};
oFF.HorizonMenuEngineDebugPlugin.prototype.processConfig = function(config) {};
oFF.HorizonMenuEngineDebugPlugin.prototype.setupPlugin = function(controller)
{
	this.m_controller = controller;
	return null;
};
oFF.HorizonMenuEngineDebugPlugin.prototype.buildPluginUi = function(genesis)
{
	if (oFF.isNull(this.m_toolbarWidget))
	{
		this.m_toolbarWidget = oFF.UtToolbarWidget.create(genesis);
		this.m_toolbarWidget.addCssClass("ffHorizonMenuDebugToolbar");
	}
	var mainLayout = genesis.newRoot(oFF.UiType.FLEX_LAYOUT);
	mainLayout.addItem(this.m_toolbarWidget.getView());
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	mainLayout.addNewItemOfType(oFF.UiType.BUTTON).setText("Load Menu Configuration").registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent5){
		this.getController().executeAction(oFF.XStringUtils.concatenate3(oFF.MenuEnginePlugin.PLUGIN_NAME, ".", oFF.MenuEnginePlugin.LOAD_BASE_CONFIGURATION), this.getSimpleMenuConfig());
		this.synchronizeToolbar();
	}.bind(this)));
	mainLayout.addNewItemOfType(oFF.UiType.BUTTON).setText("Register Menu Actions").registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent6){
		this.registerMenuActions();
		this.synchronizeToolbar();
	}.bind(this)));
	var menuButton = mainLayout.addNewItemOfType(oFF.UiType.BUTTON);
	menuButton.setText("Show Menu").registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent7){
		this.showMenu(menuButton);
	}.bind(this)));
};
oFF.HorizonMenuEngineDebugPlugin.prototype.synchronizeToolbar = function()
{
	var context = oFF.CMEFactory.createContext();
	var contextAccess = oFF.CMEFactory.createContextAccess(context, "Gds.Qb.Table.Toolbar");
	this.getController().executeAction(oFF.XStringUtils.concatenate3(oFF.MenuEnginePlugin.PLUGIN_NAME, ".", oFF.MenuEnginePlugin.UPDATE_TOOLBAR), oFF.CMEToolbarUpdateWrapper.create(contextAccess, this.m_toolbarWidget));
};
oFF.HorizonMenuEngineDebugPlugin.prototype.showMenu = function(element)
{
	var context = oFF.CMEFactory.createContext();
	var contextAccess = oFF.CMEFactory.createContextAccess(context, "Gds.Qb.Builder.PresentationSettings");
	var contextMenuUpdateWrapper = oFF.CMEContextMenuUpdateWrapper.createWithReferenceControl(contextAccess, element);
	this.getController().executeAction(oFF.XStringUtils.concatenate3(oFF.MenuEnginePlugin.PLUGIN_NAME, ".", oFF.MenuEnginePlugin.UPDATE_MENU), contextMenuUpdateWrapper);
};
oFF.HorizonMenuEngineDebugPlugin.prototype.registerMenuActions = function()
{
	var PANEL_PRESENTATION = "Panel.Presentation";
	var PANEL_PRESENTATION_DESCRIPTION = "Panel.Presentation.Description";
	var PANEL_PRESENTATION_ID = "Panel.Presentation.Id";
	var PANEL_PRESENTATION_ID_AND_DESCRIPTION = "Panel.Presentation.IdAndDescription";
	var PANEL_PRESENTATION_DESCRIPTION_AND_ID = "Panel.Presentation.DescriptionAndId";
	var PANEL_PRESENTATION_TOGGLE_DESCRIPTION = "Panel.Presentation.Toggle.Description";
	var PANEL_PRESENTATION_TOGGLE_ID = "Panel.Presentation.Toggle.Id";
	var panelPresentationDescription = oFF.CMEFactory.createSelectionOption();
	panelPresentationDescription.setNameProvider( function(descriptionName){
		return PANEL_PRESENTATION_DESCRIPTION;
	}.bind(this));
	panelPresentationDescription.setTextProvider( function(descriptionText){
		return "Description";
	}.bind(this));
	this.registerAction(PANEL_PRESENTATION_DESCRIPTION, panelPresentationDescription);
	var panelPresentationId = oFF.CMEFactory.createSelectionOption();
	panelPresentationId.setNameProvider( function(idName){
		return PANEL_PRESENTATION_ID;
	}.bind(this));
	panelPresentationId.setTextProvider( function(idText){
		return "Id";
	}.bind(this));
	this.registerAction(PANEL_PRESENTATION_ID, panelPresentationId);
	var panelPresentationIdAndDescription = oFF.CMEFactory.createSelectionOption();
	panelPresentationIdAndDescription.setNameProvider( function(idAndDescriptionName){
		return PANEL_PRESENTATION_ID_AND_DESCRIPTION;
	}.bind(this));
	panelPresentationIdAndDescription.setTextProvider( function(idAndDescriptionText){
		return "Id and Description";
	}.bind(this));
	this.registerAction(PANEL_PRESENTATION_ID_AND_DESCRIPTION, panelPresentationIdAndDescription);
	var panelPresentationDescriptionAndId = oFF.CMEFactory.createSelectionOption();
	panelPresentationDescriptionAndId.setNameProvider( function(descriptionAndIdName){
		return PANEL_PRESENTATION_DESCRIPTION_AND_ID;
	}.bind(this));
	panelPresentationDescriptionAndId.setTextProvider( function(descriptionAndIdText){
		return "Description and Id";
	}.bind(this));
	this.registerAction(PANEL_PRESENTATION_DESCRIPTION_AND_ID, panelPresentationDescriptionAndId);
	var action = oFF.CMEFactory.createSingleSelectAction();
	action.setNameProvider( function(nameContext){
		return PANEL_PRESENTATION;
	}.bind(this));
	action.setTextProvider( function(textContext){
		return "Presentation Options";
	}.bind(this));
	action.setEnabledProvider( function(enabledContext){
		return true;
	}.bind(this));
	action.setOptionsRetriever( function(optionsContext){
		var options = oFF.XList.create();
		options.add(panelPresentationDescription);
		options.add(panelPresentationId);
		options.add(panelPresentationIdAndDescription);
		options.add(panelPresentationDescriptionAndId);
		return options;
	}.bind(this));
	action.setSelectionRetriever( function(selectionContext){
		return this.m_selectedOption;
	}.bind(this));
	action.setSelectionConsumer( function(consumerContext, selectionOption){
		this.m_selectedOption = selectionOption;
		this.synchronizeToolbar();
	}.bind(this));
	this.registerAction(PANEL_PRESENTATION, action);
	var toggleAction = oFF.CMEFactory.createToggleAction();
	toggleAction.setNameProvider( function(toggleIdName){
		return PANEL_PRESENTATION_TOGGLE_ID;
	}.bind(this));
	toggleAction.setTextProvider( function(toggleIdText){
		return "Id";
	}.bind(this));
	toggleAction.setProvider( function(toggleIdProviderContext){
		return this.m_selectedOption === panelPresentationId || this.m_selectedOption === panelPresentationIdAndDescription || this.m_selectedOption === panelPresentationDescriptionAndId;
	}.bind(this));
	toggleAction.setConsumer( function(toggleIdConsumerContext, toggleIdConsumerValue){
		if (toggleIdConsumerValue.getBoolean())
		{
			if (oFF.isNull(this.m_selectedOption) || this.m_selectedOption === panelPresentationId)
			{
				this.m_selectedOption = panelPresentationId;
			}
			else
			{
				this.m_selectedOption = panelPresentationIdAndDescription;
			}
		}
		else if (this.m_selectedOption === panelPresentationId || oFF.isNull(this.m_selectedOption))
		{
			this.m_selectedOption = null;
		}
		else
		{
			this.m_selectedOption = panelPresentationDescription;
		}
		this.synchronizeToolbar();
	}.bind(this));
	this.registerAction(PANEL_PRESENTATION_TOGGLE_ID, toggleAction);
	toggleAction = oFF.CMEFactory.createToggleAction();
	toggleAction.setNameProvider( function(toggleDescName){
		return PANEL_PRESENTATION_TOGGLE_DESCRIPTION;
	}.bind(this));
	toggleAction.setTextProvider( function(toggleDescText){
		return "Description";
	}.bind(this));
	toggleAction.setProvider( function(toggleDescProviderContext){
		return this.m_selectedOption === panelPresentationDescription || this.m_selectedOption === panelPresentationIdAndDescription || this.m_selectedOption === panelPresentationDescriptionAndId;
	}.bind(this));
	toggleAction.setConsumer( function(toggleDescConsumerContext, toggleDescConsumerValue){
		if (toggleDescConsumerValue.getBoolean())
		{
			if (oFF.isNull(this.m_selectedOption) || this.m_selectedOption === panelPresentationDescription)
			{
				this.m_selectedOption = panelPresentationDescription;
			}
			else
			{
				this.m_selectedOption = panelPresentationIdAndDescription;
			}
		}
		else if (this.m_selectedOption === panelPresentationDescription || oFF.isNull(this.m_selectedOption))
		{
			this.m_selectedOption = null;
		}
		else
		{
			this.m_selectedOption = panelPresentationId;
		}
		this.synchronizeToolbar();
	}.bind(this));
	this.registerAction(PANEL_PRESENTATION_TOGGLE_DESCRIPTION, toggleAction);
	this.getController().executeAction(oFF.XStringUtils.concatenate3(oFF.MenuEnginePlugin.PLUGIN_NAME, ".", oFF.MenuEnginePlugin.REFRESH_MENU_GENERATOR), null);
};
oFF.HorizonMenuEngineDebugPlugin.prototype.registerAction = function(name, action)
{
	this.getController().executeAction(oFF.XStringUtils.concatenate3(oFF.MenuEnginePlugin.PLUGIN_NAME, ".", oFF.MenuEnginePlugin.REGISTER_MENU_ACTION), oFF.CMEActionWrapper.create(name, action));
};
oFF.HorizonMenuEngineDebugPlugin.prototype.getSimpleMenuConfig = function()
{
	return oFF.JsonParserFactory.createFromSafeString("{ \"EngineVersion\": \"0.0.2\", \"LoggingEnabled\": false, \"Menus\": [{ \"Name\": \"Gds.Qb.Table.Toolbar\", \"UiContext\": [ \"Gds.Qb.Table.Toolbar\" ], \"Items\": [{ \"Action\": \"Panel.Presentation.Toggle.Id\", \"Icon\": \"key\" }, { \"Action\": \"Panel.Presentation.Toggle.Description\", \"Icon\": \"fpa/text-abc\" } ] }, { \"Name\": \"Gds.Qb.Builder.PresentationSettings\", \"UiContext\": [ \"Gds.Qb.Builder.PresentationSettings\" ], \"Items\": [{ \"Action\": \"Panel.Presentation\", \"Items\": [{     \"Option\": \"Panel.Presentation.Description\" }, {     \"Option\": \"Panel.Presentation.Id\" }, { \"Option\": \"Panel.Presentation.IdAndDescription\" } ] }, { \"Action\": \"Panel.Sort\" } ] } ] }").asStructure();
};
oFF.HorizonMenuEngineDebugPlugin.prototype.destroyPlugin = function()
{
	this.m_controller = null;
};
oFF.HorizonMenuEngineDebugPlugin.prototype.onResize = function(offsetWidth, offsetHeight) {};
oFF.HorizonMenuEngineDebugPlugin.prototype.didBecameVisible = function() {};
oFF.HorizonMenuEngineDebugPlugin.prototype.didBecameHidden = function() {};
oFF.HorizonMenuEngineDebugPlugin.prototype.getController = function()
{
	return this.m_controller;
};

oFF.HpTextEditorPlugin = function() {};
oFF.HpTextEditorPlugin.prototype = new oFF.XObject();
oFF.HpTextEditorPlugin.prototype._ff_c = "HpTextEditorPlugin";

oFF.HpTextEditorPlugin.PLUGIN_NAME = "HorizonTextEditor";
oFF.HpTextEditorPlugin.prototype.m_codeEditor = null;
oFF.HpTextEditorPlugin.prototype.m_initialText = null;
oFF.HpTextEditorPlugin.prototype.m_codeType = null;
oFF.HpTextEditorPlugin.prototype.getName = function()
{
	return oFF.HpTextEditorPlugin.PLUGIN_NAME;
};
oFF.HpTextEditorPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMPONENT;
};
oFF.HpTextEditorPlugin.prototype.getDisplayName = function()
{
	return "Text Editor";
};
oFF.HpTextEditorPlugin.prototype.getDescription = function()
{
	return "A simple text editor for horizon.";
};
oFF.HpTextEditorPlugin.prototype.getPluginCategory = function()
{
	return oFF.HuHorizonPluginCategory.SYSTEM;
};
oFF.HpTextEditorPlugin.prototype.processConfig = function(config)
{
	this.m_initialText = config.getStringByKey("text");
	this.m_codeType = config.getStringByKeyExt("codeType", "text");
};
oFF.HpTextEditorPlugin.prototype.setupPlugin = function(controller)
{
	return null;
};
oFF.HpTextEditorPlugin.prototype.buildPluginUi = function(genesis)
{
	this.m_codeEditor = genesis.newRoot(oFF.UiType.CODE_EDITOR);
	this.m_codeEditor.useMaxSpace();
	this.m_codeEditor.setValue(this.m_initialText);
	this.m_codeEditor.setCodeType(this.m_codeType);
	this.m_codeEditor.registerOnFileDrop(oFF.UiLambdaFileDropListener.create( function(controlEvent){
		var fileContent = controlEvent.getParameters().getStringByKeyExt(oFF.UiEventParams.PARAM_FILE_CONTENT, null);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(fileContent))
		{
			this.m_codeEditor.setValue(fileContent);
		}
	}.bind(this)));
	this.m_codeEditor.focus();
};
oFF.HpTextEditorPlugin.prototype.destroyPlugin = function()
{
	this.m_codeEditor = oFF.XObjectExt.release(this.m_codeEditor);
};
oFF.HpTextEditorPlugin.prototype.onResize = function(offsetWidth, offsetHeight) {};
oFF.HpTextEditorPlugin.prototype.didBecameVisible = function() {};
oFF.HpTextEditorPlugin.prototype.didBecameHidden = function() {};

oFF.HorizonUiPluginsModule = function() {};
oFF.HorizonUiPluginsModule.prototype = new oFF.DfModule();
oFF.HorizonUiPluginsModule.prototype._ff_c = "HorizonUiPluginsModule";

oFF.HorizonUiPluginsModule.s_module = null;
oFF.HorizonUiPluginsModule.getInstance = function()
{
	if (oFF.isNull(oFF.HorizonUiPluginsModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.HorizonUiModule.getInstance());
		oFF.HorizonUiPluginsModule.s_module = oFF.DfModule.startExt(new oFF.HorizonUiPluginsModule());
		oFF.HuPluginRegistration.registerPluginByClass(oFF.XClass.create(oFF.HpHorizonSimpleDebugPlugin));
		oFF.HuPluginRegistration.registerPluginByClass(oFF.XClass.create(oFF.HpHorizonExtendedDebugPlugin));
		oFF.HuPluginRegistration.registerPluginByClass(oFF.XClass.create(oFF.HpHorizonDebugDocumentPlugin));
		oFF.HuPluginRegistration.registerPluginByClass(oFF.XClass.create(oFF.HpSimpleToastCommandPlugin));
		oFF.HuPluginRegistration.registerPluginByClass(oFF.XClass.create(oFF.HpTextEditorPlugin));
		oFF.HuPluginRegistration.registerPluginByClass(oFF.XClass.create(oFF.HorizonMenuEngineDebugPlugin));
		oFF.HuPluginRegistration.registerPluginByClass(oFF.XClass.create(oFF.MenuEnginePlugin));
		oFF.DfModule.stopExt(oFF.HorizonUiPluginsModule.s_module);
	}
	return oFF.HorizonUiPluginsModule.s_module;
};
oFF.HorizonUiPluginsModule.prototype.getName = function()
{
	return "ff3620.horizon.ui.plugins";
};

oFF.HorizonUiPluginsModule.getInstance();

return sap.firefly;
	} );
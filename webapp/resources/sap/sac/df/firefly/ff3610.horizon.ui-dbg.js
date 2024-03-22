/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff3600.horizon.ui.api"
],
function(oFF)
{
"use strict";

oFF.HuHorizonConstants = {

	PARAM_CONFIG:"config",
	PARAM_CONFIG_FILE:"configFile",
	PARAM_WORKSPACE:"workspace",
	DEBUG_LOG_ENV_VARIABLE:"ff_horizon_debug",
	DEBUG_LOG_ENABLED:false,
	DEFAULT_HOME_DIRECTORY:"/home/main/",
	DEFAULT_PLUGIN_DIRECTORY:"${ff_resources}/programs/horizon/plugins",
	ALT_PLUGIN_DIRECTORY:"/home/main/horizon/plugins",
	SELECTED_WORKSPACE_PATH_KEY:"selectedWorkSpacePath"
};

oFF.HuHorizonInternalNotifications = {

	PLUGIN_STARTED:"com.oFF.Horizon.Notification.PluginStarted",
	PLUGIN_STARTED_PLUGIN_NAME_NOTIFI_DATA:"com.oFF.Horizon.NotificationData.PluginStartedPluginName",
	PLUGIN_STARTED_PLUGIN_TYPE_NOTIFI_DATA:"com.oFF.Horizon.NotificationData.PluginStartedPluginType",
	DOCUMENT_TITLE_CHANGED:"com.oFF.Horizon.Notification.DocumentTitleChanged",
	DOCUMENT_TITLE_CHANGED_NEW_TITLE_NOTIFI_DATA:"com.oFF.Horizon.NotificationData.DocumentTitleChangedNewTitle",
	MESSAGE_MANAGER_STATUS_CHANGED:"com.oFF.Horizon.Notification.MessageManagerStatusChanged",
	MESSAGE_MANAGER_STATUS_CHANGED_NEW_STATUS_NOTIFI_DATA:"com.oFF.Horizon.NotificationData.MessageManagerStatusChangedNewStatus",
	MESSAGE_MANAGER_NEW_MESSAGE:"com.oFF.Horizon.Notification.MessageManagerNewMessage",
	MESSAGE_MANAGER_NEW_MESSAGE_MESSAGE_NOTIFI_DATA:"com.oFF.Horizon.NotificationData.MessageManagerNewMessageMessage",
	MESSAGE_MANAGER_CLEAR_MESSAGES:"com.oFF.Horizon.Notification.MessageManagerClearMessages",
	MESSAGE_MANAGER_CLEAR_MESSAGES_MESSAGE_TYPE_NOTIFI_DATA:"com.oFF.Horizon.NotificationData.MessageManagerClearMessagesMessageType",
	MESSAGE_MANAGER_CLEAR_ALL_MESSAGES:"com.oFF.Horizon.Notification.MessageManagerClearAllMessages",
	STATUS_BAR_MANAGER_CLEAR_MESSAGES_PRESSED:"com.oFF.Horizon.Notification.StatusBarManagerClearMessagesPressed",
	STATUS_BAR_MANAGER_CLEAR_MESSAGES_PRESSED_MESSAGE_TYPE_NOTIFY_DATA:"com.oFF.Horizon.NotificationData.StatusBarManagerClearMessagesPressedMessageType"
};

oFF.HuPluginFactory = {

	newPluginInstance:function(pluginName)
	{
			var pluginClass = oFF.HuPluginRegistration.getPluginClass(pluginName);
		if (oFF.notNull(pluginClass))
		{
			var newInstance = pluginClass.newInstance(null);
			return newInstance;
		}
		return null;
	}
};

oFF.HuPluginRegistration = {

	s_pluginsDefs:null,
	staticSetup:function()
	{
			oFF.HuPluginRegistration.s_pluginsDefs = oFF.XLinkedHashMapByString.create();
	},
	registerPluginByClass:function(pluginClass)
	{
			if (oFF.notNull(pluginClass))
		{
			try
			{
				var tmpInstance = pluginClass.newInstance(null);
				var pluginName = tmpInstance.getName();
				if (!oFF.HuPluginRegistration.s_pluginsDefs.containsKey(pluginName))
				{
					var newPluginDef = oFF.HuPluginDef.create(pluginName);
					newPluginDef.setFactoryClass(pluginClass);
					oFF.HuPluginRegistration.s_pluginsDefs.put(pluginName, newPluginDef);
				}
				else
				{
					var existingPluginDef = oFF.HuPluginRegistration.s_pluginsDefs.getByKey(pluginName);
					if (existingPluginDef.getFactoryClass() === null)
					{
						existingPluginDef.setFactoryClass(pluginClass);
					}
				}
				tmpInstance = null;
			}
			catch (e)
			{
				throw oFF.XException.createRuntimeException("Failed to register plugin class! Class might be invalid!");
			}
		}
	},
	registerPluginByManifest:function(pluginManifest)
	{
			if (oFF.notNull(pluginManifest))
		{
			var pluginName = pluginManifest.getName();
			if (!oFF.HuPluginRegistration.s_pluginsDefs.containsKey(pluginName))
			{
				var newPluginDef = oFF.HuPluginDef.create(pluginName);
				newPluginDef.setManifest(pluginManifest);
				oFF.HuPluginRegistration.s_pluginsDefs.put(pluginName, newPluginDef);
			}
			else
			{
				var existingPluginDef = oFF.HuPluginRegistration.s_pluginsDefs.getByKey(pluginName);
				if (existingPluginDef.getManifest() === null)
				{
					existingPluginDef.setManifest(pluginManifest);
				}
			}
		}
	},
	getPluginDef:function(pluginName)
	{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(pluginName))
		{
			return oFF.HuPluginRegistration.s_pluginsDefs.getByKey(pluginName);
		}
		return null;
	},
	getPluginClass:function(pluginName)
	{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(pluginName))
		{
			var tmpPluginDef = oFF.HuPluginRegistration.s_pluginsDefs.getByKey(pluginName);
			if (oFF.notNull(tmpPluginDef))
			{
				return tmpPluginDef.getFactoryClass();
			}
		}
		return null;
	},
	isPluginLoaded:function(pluginName)
	{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(pluginName))
		{
			var tmpPluginDef = oFF.HuPluginRegistration.s_pluginsDefs.getByKey(pluginName);
			if (oFF.notNull(tmpPluginDef))
			{
				return tmpPluginDef.isPluginLoaded();
			}
		}
		return false;
	},
	canPluginBeInitialized:function(pluginName)
	{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(pluginName))
		{
			var tmpPluginDef = oFF.HuPluginRegistration.s_pluginsDefs.getByKey(pluginName);
			if (oFF.notNull(tmpPluginDef))
			{
				return tmpPluginDef.canBeInitialized();
			}
		}
		return false;
	},
	hasManifest:function(pluginName)
	{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(pluginName))
		{
			var tmpPluginDef = oFF.HuPluginRegistration.s_pluginsDefs.getByKey(pluginName);
			if (oFF.notNull(tmpPluginDef))
			{
				return tmpPluginDef.getManifest() !== null;
			}
		}
		return false;
	},
	getAllRegisteredPluginNames:function()
	{
			var tmpPluginNamesSorted = oFF.HuPluginRegistration.s_pluginsDefs.getKeysAsReadOnlyListOfString().createListOfStringCopy();
		tmpPluginNamesSorted.sortByDirection(oFF.XSortDirection.ASCENDING);
		return tmpPluginNamesSorted;
	},
	getAllLoadedPluginNamesByType:function(pluginType)
	{
			var tmpStringList = oFF.XListOfString.create();
		oFF.XCollectionUtils.forEach(oFF.HuPluginRegistration.s_pluginsDefs.getValuesAsReadOnlyList(),  function(tmpPluginDef){
			if (tmpPluginDef.isPluginLoaded() && (oFF.isNull(pluginType) || tmpPluginDef.getPluginType() === pluginType))
			{
				tmpStringList.add(tmpPluginDef.getName());
			}
		}.bind(this));
		tmpStringList.sortByDirection(oFF.XSortDirection.ASCENDING);
		return tmpStringList;
	},
	getAllLoadedPluginNames:function()
	{
			return oFF.HuPluginRegistration.getAllLoadedPluginNamesByType(null);
	},
	loadApiPlugins:function()
	{
			var apiPlugins = oFF.HuPluginRegistrationApi.getAllApiPlugins();
		if (oFF.notNull(apiPlugins) && apiPlugins.size() > 0)
		{
			oFF.XCollectionUtils.forEachString(apiPlugins,  function(apiPluginName){
				if (!oFF.HuPluginRegistration.isPluginLoaded(apiPluginName))
				{
					oFF.HuPluginRegistration.registerPluginByClass(oFF.HuPluginRegistrationApi.getPluginClass(apiPluginName));
				}
			}.bind(this));
		}
	}
};

oFF.HuPluginContainerConfigConstants = {

	SIZE_KEY:"size",
	WIDTH_KEY:"width",
	HEIGHT_KEY:"height"
};

oFF.HuPluginContainerConfig = function() {};
oFF.HuPluginContainerConfig.prototype = new oFF.XObject();
oFF.HuPluginContainerConfig.prototype._ff_c = "HuPluginContainerConfig";

oFF.HuPluginContainerConfig.createFromConfig = function(pluginConfig)
{
	var newInstance = new oFF.HuPluginContainerConfig();
	newInstance.setupByConfig(pluginConfig);
	return newInstance;
};
oFF.HuPluginContainerConfig.prototype.m_size = null;
oFF.HuPluginContainerConfig.prototype.releaseObject = function()
{
	this.m_size = oFF.XObjectExt.release(this.m_size);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuPluginContainerConfig.prototype.setupByConfig = function(pluginConfig)
{
	this.m_size = oFF.UiSize.createEmpty();
	this.parseConfig(pluginConfig);
};
oFF.HuPluginContainerConfig.prototype.getSize = function()
{
	return this.m_size;
};
oFF.HuPluginContainerConfig.prototype.setSize = function(sizeElement)
{
	if (oFF.notNull(sizeElement))
	{
		if (sizeElement.isStructure())
		{
			var sizeStruct = sizeElement.asStructure();
			var widthCss = sizeStruct.getStringByKey(oFF.HuPluginContainerConfigConstants.WIDTH_KEY);
			var heightCss = sizeStruct.getStringByKey(oFF.HuPluginContainerConfigConstants.HEIGHT_KEY);
			this.m_size.setByCss(widthCss, heightCss);
		}
		else if (sizeElement.isString())
		{
			var sizeStr = sizeElement.asString().getString();
			this.m_size.setByCss(sizeStr, sizeStr);
		}
	}
};
oFF.HuPluginContainerConfig.prototype.parseConfig = function(configStruct)
{
	if (oFF.notNull(configStruct) && configStruct.isStructure())
	{
		this.setSize(configStruct.getByKey(oFF.HuPluginContainerConfigConstants.SIZE_KEY));
	}
};

oFF.HuPluginManifestConstants = {

	NAME_KEY:"Name",
	DESCRIPTION_KEY:"Description",
	DISPLAY_NAME_KEY:"DisplayName",
	PLUGIN_TYPE_KEY:"Type",
	PLUGIN_CATEGORY_KEY:"Category",
	MODULES_KEY:"Modules",
	URL_KEY:"Url"
};

oFF.HuUtils = {

	formatLogWithContextName:function(contextName, logline)
	{
			if (oFF.XStringUtils.isNotNullAndNotEmpty(contextName))
		{
			return oFF.XStringUtils.concatenate4("(", contextName, ") ", logline);
		}
		return logline;
	}
};

oFF.HuHorizonConfigConstants = {

	CONFIG_FILE_NAME:"horizon.cfg",
	CONFIGIGURATION_SECTION:"configuration",
	PLUGINS_SECTION:"plugins",
	COMMANDS_SECTION:"commands",
	TOOLBAR_SECTION:"toolbar"
};

oFF.HuHorizonWorkspaceConstants = {

	HORIZON_DIR_NAME:".horizon",
	SETTINGS_DIR_NAME:"settings",
	PLUGIN_SETTINGS_DIR_NAME:"plugins",
	STATE_FILE_NAME:"state.json"
};

oFF.HuConfigurationConstants = {

	TITLE:"title",
	MENU_VISIBLE:"menuVisible",
	TOOLBAR_VISIBLE:"toolbarVisible",
	STATUS_BAR_VISIBLE:"statusBarVisible",
	PLUGIN_DIRECTORIES:"pluginDirectories",
	ALLOW_VIEW_REORDERING:"allowViewReordering"
};

oFF.HuPluginConfigurationConstants = {

	NAME:"name",
	PLUGIN:"plugin",
	CONFIG:"config"
};

oFF.HuToolbarConfigurationConstants = {

	ACTION:"action",
	NAME:"name",
	TEXT:"text",
	ICON:"icon",
	TOOLTIP:"tooltip",
	GROUP:"group"
};

oFF.HuMessage = function() {};
oFF.HuMessage.prototype = new oFF.XObject();
oFF.HuMessage.prototype._ff_c = "HuMessage";

oFF.HuMessage.createInformation = function(title, subtitle, description, messageGroup)
{
	var newStatusObj = new oFF.HuMessage();
	newStatusObj.setupMessageObject(title, subtitle, description, oFF.HuMessageType.INFORMATION, messageGroup);
	return newStatusObj;
};
oFF.HuMessage.createSuccess = function(title, subtitle, description, messageGroup)
{
	var newStatusObj = new oFF.HuMessage();
	newStatusObj.setupMessageObject(title, subtitle, description, oFF.HuMessageType.SUCCESS, messageGroup);
	return newStatusObj;
};
oFF.HuMessage.createWarning = function(title, subtitle, description, messageGroup)
{
	var newStatusObj = new oFF.HuMessage();
	newStatusObj.setupMessageObject(title, subtitle, description, oFF.HuMessageType.WARNING, messageGroup);
	return newStatusObj;
};
oFF.HuMessage.createError = function(title, subtitle, description, messageGroup)
{
	var newStatusObj = new oFF.HuMessage();
	newStatusObj.setupMessageObject(title, subtitle, description, oFF.HuMessageType.ERROR, messageGroup);
	return newStatusObj;
};
oFF.HuMessage.prototype.m_title = null;
oFF.HuMessage.prototype.m_subtitle = null;
oFF.HuMessage.prototype.m_description = null;
oFF.HuMessage.prototype.m_messageType = null;
oFF.HuMessage.prototype.m_messageGroup = null;
oFF.HuMessage.prototype.releaseObject = function()
{
	this.m_messageType = null;
	this.m_messageGroup = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuMessage.prototype.setupMessageObject = function(title, subtitle, description, messageType, messageGroup)
{
	this.m_title = title;
	this.m_subtitle = subtitle;
	this.m_description = description;
	this.m_messageType = messageType;
	this.m_messageGroup = messageGroup;
	if (oFF.isNull(this.m_messageType))
	{
		this.m_messageType = oFF.HuMessageType.INFORMATION;
	}
	if (oFF.isNull(this.m_messageGroup))
	{
		this.m_messageGroup = oFF.HuMessageGroup.SYSTEM;
	}
};
oFF.HuMessage.prototype.getTitle = function()
{
	return this.m_title;
};
oFF.HuMessage.prototype.getSubtitle = function()
{
	return this.m_subtitle;
};
oFF.HuMessage.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.HuMessage.prototype.getMessageType = function()
{
	return this.m_messageType;
};
oFF.HuMessage.prototype.getMessageGroup = function()
{
	return this.m_messageGroup;
};

oFF.HuLogger = function() {};
oFF.HuLogger.prototype = new oFF.XObject();
oFF.HuLogger.prototype._ff_c = "HuLogger";

oFF.HuLogger.INFO_PREFIX = "[Info] ";
oFF.HuLogger.DEBUG_PREFIX = "[Debug] ";
oFF.HuLogger.createNewLogger = function()
{
	var newLogger = new oFF.HuLogger();
	return newLogger;
};
oFF.HuLogger.prototype.m_isDebugLogEnabled = false;
oFF.HuLogger.prototype.releaseObject = function()
{
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuLogger.prototype.setDebugEnabled = function(enabled)
{
	this.m_isDebugLogEnabled = enabled;
};
oFF.HuLogger.prototype.logInfo = function(logline)
{
	oFF.XLogger.println(oFF.XStringUtils.concatenate2(oFF.HuLogger.INFO_PREFIX, logline));
};
oFF.HuLogger.prototype.logDebug = function(logline)
{
	if (this.m_isDebugLogEnabled)
	{
		oFF.XLogger.println(oFF.XStringUtils.concatenate2(oFF.HuLogger.DEBUG_PREFIX, logline));
	}
};

oFF.HuHorizonDebugService = function() {};
oFF.HuHorizonDebugService.prototype = new oFF.XObject();
oFF.HuHorizonDebugService.prototype._ff_c = "HuHorizonDebugService";

oFF.HuHorizonDebugService.create = function(process)
{
	var newInstance = new oFF.HuHorizonDebugService();
	newInstance.setupInternal(process);
	return newInstance;
};
oFF.HuHorizonDebugService.prototype.m_process = null;
oFF.HuHorizonDebugService.prototype.releaseObject = function()
{
	this.m_process = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuHorizonDebugService.prototype.setupInternal = function(process)
{
	this.m_process = process;
};
oFF.HuHorizonDebugService.prototype.isDebugModeEnabled = function()
{
	return this.getProcess().getEnvironment().getBooleanByKeyExt(oFF.HuHorizonConstants.DEBUG_LOG_ENV_VARIABLE, oFF.HuHorizonConstants.DEBUG_LOG_ENABLED);
};
oFF.HuHorizonDebugService.prototype.presentPluginProcessTaskManger = function()
{
	var taskManagerPrgRunner = oFF.SuTaskManager.createDialogRunnerForProcessId(this.getProcess(), this.getProcess().getProcessId());
	taskManagerPrgRunner.runProgram();
};
oFF.HuHorizonDebugService.prototype.getProcess = function()
{
	return this.m_process;
};

oFF.HuPluginNameConfig = function() {};
oFF.HuPluginNameConfig.prototype = new oFF.XObject();
oFF.HuPluginNameConfig.prototype._ff_c = "HuPluginNameConfig";

oFF.HuPluginNameConfig.create = function(pluginName, configJson, name)
{
	var newInstance = new oFF.HuPluginNameConfig();
	newInstance.setupInternal(pluginName, configJson, name);
	return newInstance;
};
oFF.HuPluginNameConfig.prototype.m_pluginName = null;
oFF.HuPluginNameConfig.prototype.m_name = null;
oFF.HuPluginNameConfig.prototype.m_config = null;
oFF.HuPluginNameConfig.prototype.releaseObject = function()
{
	this.m_pluginName = null;
	this.m_config = null;
	this.m_name = null;
};
oFF.HuPluginNameConfig.prototype.setupInternal = function(pluginName, configJson, name)
{
	this.m_pluginName = pluginName;
	this.m_config = configJson;
	this.m_name = name;
};
oFF.HuPluginNameConfig.prototype.getName = function()
{
	return this.m_name;
};
oFF.HuPluginNameConfig.prototype.getPluginName = function()
{
	return this.m_pluginName;
};
oFF.HuPluginNameConfig.prototype.getConfig = function()
{
	return this.m_config;
};

oFF.HuToolbarItem = function() {};
oFF.HuToolbarItem.prototype = new oFF.XObject();
oFF.HuToolbarItem.prototype._ff_c = "HuToolbarItem";

oFF.HuToolbarItem.create = function(actionId, name, text, icon, tooltip, group)
{
	var newStatusObj = new oFF.HuToolbarItem();
	newStatusObj.setupToolbarItem(actionId, name, text, icon, tooltip, group);
	return newStatusObj;
};
oFF.HuToolbarItem.prototype.m_actionId = null;
oFF.HuToolbarItem.prototype.m_name = null;
oFF.HuToolbarItem.prototype.m_text = null;
oFF.HuToolbarItem.prototype.m_icon = null;
oFF.HuToolbarItem.prototype.m_tooltip = null;
oFF.HuToolbarItem.prototype.m_group = null;
oFF.HuToolbarItem.prototype.releaseObject = function()
{
	this.m_group = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuToolbarItem.prototype.setupToolbarItem = function(actionId, name, text, icon, tooltip, group)
{
	this.m_actionId = actionId;
	this.m_name = name;
	this.m_text = text;
	this.m_icon = icon;
	this.m_tooltip = tooltip;
	this.m_group = group;
	if (oFF.XStringUtils.isNullOrEmpty(this.m_icon))
	{
		this.m_icon = "question-mark";
	}
	if (oFF.isNull(this.m_group))
	{
		this.m_group = oFF.HuToolbarGroup.UNGROUPED;
	}
};
oFF.HuToolbarItem.prototype.isValid = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_actionId);
};
oFF.HuToolbarItem.prototype.getActionId = function()
{
	return this.m_actionId;
};
oFF.HuToolbarItem.prototype.getName = function()
{
	return this.m_name;
};
oFF.HuToolbarItem.prototype.getText = function()
{
	return this.m_text;
};
oFF.HuToolbarItem.prototype.getIcon = function()
{
	return this.m_icon;
};
oFF.HuToolbarItem.prototype.getTooltip = function()
{
	return this.m_tooltip;
};
oFF.HuToolbarItem.prototype.getGroup = function()
{
	return this.m_group;
};

oFF.HuHorizonBootConfig = function() {};
oFF.HuHorizonBootConfig.prototype = new oFF.XObjectExt();
oFF.HuHorizonBootConfig.prototype._ff_c = "HuHorizonBootConfig";

oFF.HuHorizonBootConfig.create = function()
{
	var newInstance = new oFF.HuHorizonBootConfig();
	newInstance.setupBootConfig();
	return newInstance;
};
oFF.HuHorizonBootConfig.prototype.m_configStr = null;
oFF.HuHorizonBootConfig.prototype.m_configFilePath = null;
oFF.HuHorizonBootConfig.prototype.releaseObject = function()
{
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.HuHorizonBootConfig.prototype.setupBootConfig = function() {};
oFF.HuHorizonBootConfig.prototype.setConfigString = function(configStr)
{
	this.m_configStr = configStr;
};
oFF.HuHorizonBootConfig.prototype.getConfigString = function()
{
	return this.m_configStr;
};
oFF.HuHorizonBootConfig.prototype.setConfigFilePath = function(configFilePath)
{
	this.m_configFilePath = configFilePath;
};
oFF.HuHorizonBootConfig.prototype.getConfigFilePath = function()
{
	return this.m_configFilePath;
};
oFF.HuHorizonBootConfig.prototype.shouldBootIntoVirtualWorkspace = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.getConfigString()) || oFF.XStringUtils.isNotNullAndNotEmpty(this.getConfigFilePath());
};

oFF.HuPluginManifest = function() {};
oFF.HuPluginManifest.prototype = new oFF.XObject();
oFF.HuPluginManifest.prototype._ff_c = "HuPluginManifest";

oFF.HuPluginManifest.createByStructure = function(argumentStruct)
{
	var newManifest = new oFF.HuPluginManifest();
	newManifest.setupByStructure(argumentStruct);
	if (newManifest.isValid())
	{
		return newManifest;
	}
	return null;
};
oFF.HuPluginManifest.prototype.m_name = null;
oFF.HuPluginManifest.prototype.m_description = null;
oFF.HuPluginManifest.prototype.m_displayName = null;
oFF.HuPluginManifest.prototype.m_pluginType = null;
oFF.HuPluginManifest.prototype.m_pluginCategory = null;
oFF.HuPluginManifest.prototype.m_moduleDependencies = null;
oFF.HuPluginManifest.prototype.m_url = null;
oFF.HuPluginManifest.prototype.releaseObject = function()
{
	this.m_pluginType = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuPluginManifest.prototype.setupInternal = function()
{
	this.m_moduleDependencies = oFF.XListOfString.create();
};
oFF.HuPluginManifest.prototype.setupByStructure = function(struct)
{
	this.setupInternal();
	this.parseStructure(struct);
};
oFF.HuPluginManifest.prototype.getName = function()
{
	return this.m_name;
};
oFF.HuPluginManifest.prototype.getDescription = function()
{
	return this.m_description;
};
oFF.HuPluginManifest.prototype.getDisplayName = function()
{
	return this.m_displayName;
};
oFF.HuPluginManifest.prototype.getPluginType = function()
{
	return this.m_pluginType;
};
oFF.HuPluginManifest.prototype.getPluginCategory = function()
{
	return this.m_pluginCategory;
};
oFF.HuPluginManifest.prototype.getDependencies = function()
{
	return this.m_moduleDependencies;
};
oFF.HuPluginManifest.prototype.getUrl = function()
{
	return this.m_url;
};
oFF.HuPluginManifest.prototype.setName = function(name)
{
	this.m_name = name;
};
oFF.HuPluginManifest.prototype.setDescription = function(description)
{
	this.m_description = description;
};
oFF.HuPluginManifest.prototype.setDisplayName = function(displayName)
{
	this.m_displayName = displayName;
};
oFF.HuPluginManifest.prototype.setPluginType = function(pluginType)
{
	this.m_pluginType = pluginType;
};
oFF.HuPluginManifest.prototype.setPluginCategory = function(pluginCategory)
{
	this.m_pluginCategory = pluginCategory;
};
oFF.HuPluginManifest.prototype.addModuleDependency = function(moduleName)
{
	if (!this.m_moduleDependencies.contains(moduleName))
	{
		this.m_moduleDependencies.add(moduleName);
	}
};
oFF.HuPluginManifest.prototype.setUrl = function(url)
{
	this.m_url = url;
};
oFF.HuPluginManifest.prototype.isValid = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_name);
};
oFF.HuPluginManifest.prototype.parseStructure = function(manifestStructure)
{
	if (oFF.notNull(manifestStructure) && manifestStructure.isStructure())
	{
		this.setName(manifestStructure.getStringByKey(oFF.HuPluginManifestConstants.NAME_KEY));
		this.setDescription(manifestStructure.getStringByKey(oFF.HuPluginManifestConstants.DESCRIPTION_KEY));
		this.setDisplayName(manifestStructure.getStringByKey(oFF.HuPluginManifestConstants.DISPLAY_NAME_KEY));
		this.setPluginType(oFF.HuHorizonPluginType.lookup(manifestStructure.getStringByKey(oFF.HuPluginManifestConstants.PLUGIN_TYPE_KEY)));
		this.setPluginCategory(oFF.HuHorizonPluginCategory.lookup(manifestStructure.getStringByKey(oFF.HuPluginManifestConstants.PLUGIN_CATEGORY_KEY)));
		this.processModuleDependencies(manifestStructure.getListByKey(oFF.HuPluginManifestConstants.MODULES_KEY));
		this.setUrl(manifestStructure.getStringByKey(oFF.HuPluginManifestConstants.URL_KEY));
	}
	else
	{
		throw oFF.XException.createRuntimeException("Missing or invalid plugin manifest json!");
	}
};
oFF.HuPluginManifest.prototype.processModuleDependencies = function(dependeciesList)
{
	if (oFF.notNull(dependeciesList) && dependeciesList.isList())
	{
		for (var k = 0; k < dependeciesList.size(); k++)
		{
			if (dependeciesList.getElementTypeAt(k) === oFF.PrElementType.STRING)
			{
				var tmpDependency = dependeciesList.getStringAt(k);
				this.addModuleDependency(tmpDependency);
			}
		}
	}
};

oFF.HuDfHorizonProcessor = function() {};
oFF.HuDfHorizonProcessor.prototype = new oFF.XObject();
oFF.HuDfHorizonProcessor.prototype._ff_c = "HuDfHorizonProcessor";

oFF.HuDfHorizonProcessor.prototype.m_logger = null;
oFF.HuDfHorizonProcessor.prototype.releaseObject = function()
{
	this.m_logger = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuDfHorizonProcessor.prototype.setupWithLogger = function(logger)
{
	this.m_logger = logger;
};
oFF.HuDfHorizonProcessor.prototype.getLogger = function()
{
	return this.m_logger;
};
oFF.HuDfHorizonProcessor.prototype.getLogContextName = function()
{
	return this.getProcessorName();
};
oFF.HuDfHorizonProcessor.prototype.logInfo = function(logline)
{
	if (this.getLogger() !== null)
	{
		this.getLogger().logInfo(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
	}
};
oFF.HuDfHorizonProcessor.prototype.logDebug = function(logline)
{
	if (this.getLogger() !== null)
	{
		this.getLogger().logDebug(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
	}
};

oFF.HuPluginLoaderService = function() {};
oFF.HuPluginLoaderService.prototype = new oFF.XObject();
oFF.HuPluginLoaderService.prototype._ff_c = "HuPluginLoaderService";

oFF.HuPluginLoaderService.create = function(logger, process)
{
	var newInstance = new oFF.HuPluginLoaderService();
	newInstance.setupInternal(logger, process);
	return newInstance;
};
oFF.HuPluginLoaderService.prototype.m_logger = null;
oFF.HuPluginLoaderService.prototype.m_process = null;
oFF.HuPluginLoaderService.prototype.m_modulesInProgressList = null;
oFF.HuPluginLoaderService.prototype.releaseObject = function()
{
	this.m_logger = null;
	this.m_process = null;
	this.m_modulesInProgressList.clear();
	this.m_modulesInProgressList = oFF.XObjectExt.release(this.m_modulesInProgressList);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuPluginLoaderService.prototype.setupInternal = function(logger, process)
{
	this.m_logger = logger;
	if (oFF.isNull(this.m_logger))
	{
		this.m_logger = oFF.HuLogger.createNewLogger();
	}
	this.m_process = process;
	this.m_modulesInProgressList = oFF.XList.create();
};
oFF.HuPluginLoaderService.prototype.getLogger = function()
{
	return this.m_logger;
};
oFF.HuPluginLoaderService.prototype.getLogContextName = function()
{
	return "Plugin Loader";
};
oFF.HuPluginLoaderService.prototype.logInfo = function(logline)
{
	this.getLogger().logInfo(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuPluginLoaderService.prototype.logDebug = function(logline)
{
	this.getLogger().logDebug(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuPluginLoaderService.prototype.loadPlugin = function(pluginDef)
{
	var loadPluginPromise = oFF.XPromise.create( function(resolve, reject){
		if (pluginDef.isPluginLoaded())
		{
			this.logDebug(oFF.XStringUtils.concatenate2("Plugin already loaded: ", pluginDef.getName()));
			resolve(oFF.XBooleanValue.create(true));
		}
		else
		{
			if (pluginDef.canLoadLibraryByUrl())
			{
				this.loadPluginLibrary(pluginDef).onFinally( function(){
					resolve(oFF.XBooleanValue.create(true));
				}.bind(this));
			}
			else
			{
				this.loadPluginModuleDependencies(pluginDef).onFinally( function(){
					resolve(oFF.XBooleanValue.create(true));
				}.bind(this));
			}
		}
	}.bind(this));
	return loadPluginPromise;
};
oFF.HuPluginLoaderService.prototype.getProcess = function()
{
	return this.m_process;
};
oFF.HuPluginLoaderService.prototype.getModuleManager = function()
{
	return this.getProcess().getKernel();
};
oFF.HuPluginLoaderService.prototype.loadPluginModuleDependencies = function(pluginDef)
{
	var loadManifestModulesPromise = oFF.XPromise.create( function(resolve, reject){
		if (oFF.isNull(pluginDef) || pluginDef.getManifest() === null || pluginDef.isPluginLoaded())
		{
			resolve(oFF.XBooleanValue.create(true));
			return;
		}
		var pluginModules = pluginDef.getManifest().getDependencies();
		if (oFF.isNull(pluginModules) || pluginModules.size() === 0)
		{
			resolve(oFF.XBooleanValue.create(true));
			return;
		}
		this.getLogger().logDebug(oFF.XStringUtils.concatenate4("Loading ", pluginDef.getName(), " module dependencies: ", oFF.XCollectionUtils.join(pluginModules, ", ")));
		this.getModuleManager().processMultiModulesLoad(oFF.SyncType.NON_BLOCKING, pluginModules, oFF.UiLambdaModuleLoadedMultiListener.create( function(extResult2, modules2){
			this.logDebug(oFF.XStringUtils.concatenate3("Dependencies for plugin ", pluginDef.getName(), " successfully loaded!"));
			resolve(oFF.XBooleanValue.create(true));
		}.bind(this)), null);
	}.bind(this));
	return loadManifestModulesPromise;
};
oFF.HuPluginLoaderService.prototype.loadPluginLibrary = function(pluginDef)
{
	var loadLibraryPromise = oFF.XPromise.create( function(resolve, reject){
		var pluginLibrary = oFF.ModuleManager.getModuleDef(pluginDef.getName());
		if (oFF.isNull(pluginLibrary))
		{
			pluginLibrary = oFF.ModuleManager.registerLibrary(pluginDef.getName(), pluginDef.getName(), pluginDef.getManifest().getUrl());
		}
		if (oFF.notNull(pluginLibrary))
		{
			this.getLogger().logDebug(oFF.XStringUtils.concatenate2("Loading plugin library: ", pluginDef.getName()));
			var moduleNames = oFF.XListOfString.create();
			moduleNames.add(pluginLibrary.getName());
			this.getModuleManager().processMultiModulesLoad(oFF.SyncType.NON_BLOCKING, moduleNames, oFF.UiLambdaModuleLoadedMultiListener.create( function(extResult2, modules2){
				this.getLogger().logDebug(oFF.XStringUtils.concatenate4("Plugin library ", pluginDef.getManifest().getName(), " successfully loaded from: ", pluginDef.getManifest().getUrl()));
				resolve(oFF.XBooleanValue.create(true));
			}.bind(this)), null);
		}
		else
		{
			this.logDebug(oFF.XStringUtils.concatenate2("Library not found: ", pluginDef.getName()));
			resolve(oFF.XBooleanValue.create(true));
		}
	}.bind(this));
	return loadLibraryPromise;
};

oFF.HuDfHorizonBootAction = function() {};
oFF.HuDfHorizonBootAction.prototype = new oFF.XObjectExt();
oFF.HuDfHorizonBootAction.prototype._ff_c = "HuDfHorizonBootAction";

oFF.HuDfHorizonBootAction.prototype.m_bootController = null;
oFF.HuDfHorizonBootAction.prototype.releaseObject = function()
{
	this.m_bootController = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.HuDfHorizonBootAction.prototype.setupWithBootController = function(bootController)
{
	this.m_bootController = bootController;
	this.setupAction();
};
oFF.HuDfHorizonBootAction.prototype.getLocalStorage = function()
{
	return this.getBootController().getLocalStorage();
};
oFF.HuDfHorizonBootAction.prototype.getLocalNotificationCenter = function()
{
	return this.getBootController().getLocalNotificationCenter();
};
oFF.HuDfHorizonBootAction.prototype.getLogger = function()
{
	return this.getBootController().getLogger();
};
oFF.HuDfHorizonBootAction.prototype.getLogContextName = function()
{
	return "Boot Action";
};
oFF.HuDfHorizonBootAction.prototype.logInfo = function(logline)
{
	this.getLogger().logInfo(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuDfHorizonBootAction.prototype.logDebug = function(logline)
{
	this.getLogger().logDebug(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuDfHorizonBootAction.prototype.getBootController = function()
{
	return this.m_bootController;
};

oFF.HuDfHorizonManager = function() {};
oFF.HuDfHorizonManager.prototype = new oFF.XObject();
oFF.HuDfHorizonManager.prototype._ff_c = "HuDfHorizonManager";

oFF.HuDfHorizonManager.prototype.m_toolContext = null;
oFF.HuDfHorizonManager.prototype.releaseObject = function()
{
	this.m_toolContext = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuDfHorizonManager.prototype.setupWithToolsContext = function(toolContext)
{
	this.m_toolContext = toolContext;
	this.logDebug("-> Init");
	this.setupManager();
};
oFF.HuDfHorizonManager.prototype.setToolsContext = function(toolsContext)
{
	this.m_toolContext = toolsContext;
};
oFF.HuDfHorizonManager.prototype.getLocalStorage = function()
{
	return this.m_toolContext.getLocalStorage();
};
oFF.HuDfHorizonManager.prototype.getLocalNotificationCenter = function()
{
	return this.m_toolContext.getLocalNotificationCenter();
};
oFF.HuDfHorizonManager.prototype.getLogger = function()
{
	return this.m_toolContext.getLogger();
};
oFF.HuDfHorizonManager.prototype.getLogContextName = function()
{
	return this.getManagerName();
};
oFF.HuDfHorizonManager.prototype.logInfo = function(logline)
{
	if (this.getLogger() !== null)
	{
		this.getLogger().logInfo(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
	}
};
oFF.HuDfHorizonManager.prototype.logDebug = function(logline)
{
	if (this.getLogger() !== null)
	{
		this.getLogger().logDebug(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
	}
};

oFF.HuPluginDef = function() {};
oFF.HuPluginDef.prototype = new oFF.XObject();
oFF.HuPluginDef.prototype._ff_c = "HuPluginDef";

oFF.HuPluginDef.create = function(name)
{
	var newInstance = new oFF.HuPluginDef();
	newInstance.setupWithName(name);
	return newInstance;
};
oFF.HuPluginDef.prototype.m_name = null;
oFF.HuPluginDef.prototype.m_factoryClass = null;
oFF.HuPluginDef.prototype.m_metadataInstance = null;
oFF.HuPluginDef.prototype.m_manifest = null;
oFF.HuPluginDef.prototype.releaseObject = function()
{
	this.m_factoryClass = null;
	this.m_metadataInstance = null;
	this.m_manifest = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuPluginDef.prototype.setupWithName = function(name)
{
	this.m_name = name;
};
oFF.HuPluginDef.prototype.setFactoryClass = function(factoryClass)
{
	if (oFF.isNull(this.m_factoryClass))
	{
		this.m_factoryClass = factoryClass;
		this.createMetadataInstance(factoryClass);
	}
};
oFF.HuPluginDef.prototype.setManifest = function(manifest)
{
	if (oFF.isNull(this.m_manifest))
	{
		this.m_manifest = manifest;
	}
};
oFF.HuPluginDef.prototype.setMetadata = function(metadata)
{
	if (oFF.isNull(this.m_metadataInstance))
	{
		this.m_metadataInstance = metadata;
	}
};
oFF.HuPluginDef.prototype.getFactoryClass = function()
{
	return this.m_factoryClass;
};
oFF.HuPluginDef.prototype.getMetadata = function()
{
	return this.m_metadataInstance;
};
oFF.HuPluginDef.prototype.getManifest = function()
{
	return this.m_manifest;
};
oFF.HuPluginDef.prototype.isPluginLoaded = function()
{
	return this.getFactoryClass() !== null;
};
oFF.HuPluginDef.prototype.canLoadLibraryByUrl = function()
{
	return this.getManifest() !== null && oFF.XStringUtils.isNotNullAndNotEmpty(this.getManifest().getUrl()) && oFF.XLanguage.getLanguage() === oFF.XLanguage.JAVASCRIPT || oFF.XLanguage.getLanguage() === oFF.XLanguage.TYPESCRIPT;
};
oFF.HuPluginDef.prototype.canBeInitialized = function()
{
	return this.isPluginLoaded() && this.getPluginType() !== null;
};
oFF.HuPluginDef.prototype.isPluginFullyValid = function()
{
	return this.canBeInitialized() && this.getManifest() !== null;
};
oFF.HuPluginDef.prototype.getName = function()
{
	if (oFF.XStringUtils.isNullOrEmpty(this.m_name))
	{
		try
		{
			this.m_name = this.getMetadata().getName();
		}
		catch (error)
		{
			if (this.getManifest() !== null && oFF.XStringUtils.isNotNullAndNotEmpty(this.getManifest().getName()))
			{
				this.m_name = this.getManifest().getName();
			}
		}
	}
	return this.m_name;
};
oFF.HuPluginDef.prototype.getDescription = function()
{
	var description = null;
	try
	{
		description = this.getMetadata().getDescription();
	}
	catch (error)
	{
		if (this.getManifest() !== null && oFF.XStringUtils.isNotNullAndNotEmpty(this.getManifest().getDescription()))
		{
			description = this.getManifest().getDescription();
		}
	}
	return description;
};
oFF.HuPluginDef.prototype.getDisplayName = function()
{
	var displayName = null;
	try
	{
		displayName = this.getMetadata().getDisplayName();
	}
	catch (error)
	{
		if (this.getManifest() !== null && oFF.XStringUtils.isNotNullAndNotEmpty(this.getManifest().getDisplayName()))
		{
			displayName = this.getManifest().getDisplayName();
		}
	}
	return displayName;
};
oFF.HuPluginDef.prototype.getPluginType = function()
{
	var pluginType = null;
	try
	{
		pluginType = this.getMetadata().getPluginType();
	}
	catch (error)
	{
		if (this.getManifest() !== null && this.getManifest().getPluginType() !== null)
		{
			pluginType = this.getManifest().getPluginType();
		}
	}
	return pluginType;
};
oFF.HuPluginDef.prototype.getPluginCategory = function()
{
	var pluginCategory = oFF.HuHorizonPluginCategory.OTHER;
	try
	{
		pluginCategory = this.getMetadata().getPluginCategory();
	}
	catch (error)
	{
		if (this.getManifest() !== null && this.getManifest().getPluginCategory() !== null)
		{
			pluginCategory = this.getManifest().getPluginCategory();
		}
	}
	return pluginCategory;
};
oFF.HuPluginDef.prototype.getDependencies = function()
{
	if (this.getManifest() !== null)
	{
		return this.getManifest().getDependencies();
	}
	return null;
};
oFF.HuPluginDef.prototype.getUrl = function()
{
	if (this.getManifest() !== null)
	{
		return this.getManifest().getUrl();
	}
	return null;
};
oFF.HuPluginDef.prototype.createMetadataInstance = function(metadataClass)
{
	if (oFF.notNull(metadataClass))
	{
		var tmpInstance = metadataClass.newInstance(null);
		this.m_metadataInstance = tmpInstance;
	}
	else
	{
		throw oFF.XException.createRuntimeException("Failed to create plugin manifest from metadata class! Class might be invalid!");
	}
};

oFF.HuConfigurationGeneralProcessor = function() {};
oFF.HuConfigurationGeneralProcessor.prototype = new oFF.HuDfHorizonProcessor();
oFF.HuConfigurationGeneralProcessor.prototype._ff_c = "HuConfigurationGeneralProcessor";

oFF.HuConfigurationGeneralProcessor.create = function(logger, configurationJson)
{
	var newInstance = new oFF.HuConfigurationGeneralProcessor();
	newInstance.setupWithLogger(logger);
	newInstance.setupWitJson(configurationJson);
	return newInstance;
};
oFF.HuConfigurationGeneralProcessor.prototype.m_configurationJson = null;
oFF.HuConfigurationGeneralProcessor.prototype.releaseObject = function()
{
	this.m_configurationJson = null;
	oFF.HuDfHorizonProcessor.prototype.releaseObject.call( this );
};
oFF.HuConfigurationGeneralProcessor.prototype.setupWitJson = function(configurationJson)
{
	this.m_configurationJson = configurationJson;
};
oFF.HuConfigurationGeneralProcessor.prototype.getProcessorName = function()
{
	return "General Configuration Processor";
};
oFF.HuConfigurationGeneralProcessor.prototype.getWorkspaceTitle = function()
{
	return this.getConfigurationJson().getStringByKeyExt(oFF.HuConfigurationConstants.TITLE, "Horizon");
};
oFF.HuConfigurationGeneralProcessor.prototype.setWorkspaceTitle = function(newTitle)
{
	this.getConfigurationJson().putString(oFF.HuConfigurationConstants.TITLE, newTitle);
	return this;
};
oFF.HuConfigurationGeneralProcessor.prototype.isMenuVisible = function()
{
	return this.getConfigurationJson().getBooleanByKeyExt(oFF.HuConfigurationConstants.MENU_VISIBLE, true);
};
oFF.HuConfigurationGeneralProcessor.prototype.setMenuVisible = function(visible)
{
	this.getConfigurationJson().putBoolean(oFF.HuConfigurationConstants.MENU_VISIBLE, visible);
	return this;
};
oFF.HuConfigurationGeneralProcessor.prototype.isToolbarVisible = function()
{
	return this.getConfigurationJson().getBooleanByKeyExt(oFF.HuConfigurationConstants.TOOLBAR_VISIBLE, true);
};
oFF.HuConfigurationGeneralProcessor.prototype.isToolbarPropertySet = function()
{
	return this.getConfigurationJson().containsKey(oFF.HuConfigurationConstants.TOOLBAR_VISIBLE);
};
oFF.HuConfigurationGeneralProcessor.prototype.setToolbarVisible = function(visible)
{
	this.getConfigurationJson().putBoolean(oFF.HuConfigurationConstants.TOOLBAR_VISIBLE, visible);
	return this;
};
oFF.HuConfigurationGeneralProcessor.prototype.isStatusBarVisible = function()
{
	return this.getConfigurationJson().getBooleanByKeyExt(oFF.HuConfigurationConstants.STATUS_BAR_VISIBLE, true);
};
oFF.HuConfigurationGeneralProcessor.prototype.setStatusBarVisible = function(visible)
{
	this.getConfigurationJson().putBoolean(oFF.HuConfigurationConstants.STATUS_BAR_VISIBLE, visible);
	return this;
};
oFF.HuConfigurationGeneralProcessor.prototype.getPluginDirectories = function()
{
	var pluginDirList = this.getConfigurationJson().getListByKey(oFF.HuConfigurationConstants.PLUGIN_DIRECTORIES);
	var tmpList = oFF.XListOfString.create();
	if (oFF.notNull(pluginDirList))
	{
		for (var k = 0; k < pluginDirList.size(); k++)
		{
			if (pluginDirList.getElementTypeAt(k) === oFF.PrElementType.STRING)
			{
				var tmpPath = pluginDirList.getStringAt(k);
				tmpList.add(tmpPath);
			}
		}
	}
	return tmpList;
};
oFF.HuConfigurationGeneralProcessor.prototype.addPluginDirectory = function(directory)
{
	var pluginDirList = this.getConfigurationJson().getListByKey(oFF.HuConfigurationConstants.PLUGIN_DIRECTORIES);
	if (oFF.isNull(pluginDirList))
	{
		pluginDirList = this.getConfigurationJson().putNewList(oFF.HuConfigurationConstants.PLUGIN_DIRECTORIES);
	}
	if (oFF.XStringUtils.isNotNullAndNotEmpty(directory))
	{
		pluginDirList.addString(directory);
	}
	return this;
};
oFF.HuConfigurationGeneralProcessor.prototype.removePluginDirectory = function(directory)
{
	var pluginDirList = this.getConfigurationJson().getListByKey(oFF.HuConfigurationConstants.PLUGIN_DIRECTORIES);
	if (oFF.isNull(pluginDirList))
	{
		pluginDirList = this.getConfigurationJson().putNewList(oFF.HuConfigurationConstants.PLUGIN_DIRECTORIES);
	}
	if (oFF.XStringUtils.isNotNullAndNotEmpty(directory))
	{
		pluginDirList.removeElement(oFF.PrFactory.createString(directory));
	}
	return this;
};
oFF.HuConfigurationGeneralProcessor.prototype.isViewReorderingAllowed = function()
{
	return this.getConfigurationJson().getBooleanByKeyExt(oFF.HuConfigurationConstants.ALLOW_VIEW_REORDERING, false);
};
oFF.HuConfigurationGeneralProcessor.prototype.setViewReorderingAllowed = function(allowReordering)
{
	this.getConfigurationJson().putBoolean(oFF.HuConfigurationConstants.ALLOW_VIEW_REORDERING, allowReordering);
	return this;
};
oFF.HuConfigurationGeneralProcessor.prototype.getConfigurationJson = function()
{
	return this.m_configurationJson;
};

oFF.HuConfigurationPluginsProcessor = function() {};
oFF.HuConfigurationPluginsProcessor.prototype = new oFF.HuDfHorizonProcessor();
oFF.HuConfigurationPluginsProcessor.prototype._ff_c = "HuConfigurationPluginsProcessor";

oFF.HuConfigurationPluginsProcessor.create = function(logger, pluginsConfigJson, commandsConfigJson)
{
	var newInstance = new oFF.HuConfigurationPluginsProcessor();
	newInstance.setupWithLogger(logger);
	newInstance.setupWithPluginsJson(pluginsConfigJson, commandsConfigJson);
	return newInstance;
};
oFF.HuConfigurationPluginsProcessor.prototype.m_allConfigPlugins = null;
oFF.HuConfigurationPluginsProcessor.prototype.m_startupViewPlugins = null;
oFF.HuConfigurationPluginsProcessor.prototype.m_commandPluginsToStart = null;
oFF.HuConfigurationPluginsProcessor.prototype.m_invalidPluginNames = null;
oFF.HuConfigurationPluginsProcessor.prototype.releaseObject = function()
{
	oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_commandPluginsToStart);
	oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_startupViewPlugins);
	oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_allConfigPlugins);
	this.m_invalidPluginNames = oFF.XObjectExt.release(this.m_invalidPluginNames);
	oFF.HuDfHorizonProcessor.prototype.releaseObject.call( this );
};
oFF.HuConfigurationPluginsProcessor.prototype.setupWithPluginsJson = function(pluginsConfigJson, commandsConfigJson)
{
	this.m_allConfigPlugins = oFF.XList.create();
	this.m_startupViewPlugins = oFF.XList.create();
	this.m_commandPluginsToStart = oFF.XList.create();
	this.m_invalidPluginNames = oFF.XListOfString.create();
	this._processConfigSection(pluginsConfigJson);
	this._processConfigSection(commandsConfigJson);
	this._validatePlugins();
	this._groupPlugins();
};
oFF.HuConfigurationPluginsProcessor.prototype.getProcessorName = function()
{
	return "Plugins Configuration Processor";
};
oFF.HuConfigurationPluginsProcessor.prototype.getAllStartupPlugins = function()
{
	var startupList = oFF.XListOfString.create();
	oFF.XCollectionUtils.forEach(this.m_allConfigPlugins,  function(startupItem){
		startupList.add(startupItem.getPluginName());
	}.bind(this));
	return startupList;
};
oFF.HuConfigurationPluginsProcessor.prototype.hasStartupViewPlugins = function()
{
	return this.m_startupViewPlugins.hasElements();
};
oFF.HuConfigurationPluginsProcessor.prototype.processStartupViewPlugins = function(consumer)
{
	if (oFF.notNull(consumer))
	{
		oFF.XCollectionUtils.forEach(this.m_startupViewPlugins,  function(startupView){
			consumer(startupView);
		}.bind(this));
	}
};
oFF.HuConfigurationPluginsProcessor.prototype.processCommands = function(consumer)
{
	if (oFF.notNull(consumer))
	{
		oFF.XCollectionUtils.forEach(this.m_commandPluginsToStart,  function(startupCommand){
			consumer(startupCommand);
		}.bind(this));
	}
};
oFF.HuConfigurationPluginsProcessor.prototype.getInvalidPluginNames = function()
{
	return this.m_invalidPluginNames;
};
oFF.HuConfigurationPluginsProcessor.prototype._processConfigSection = function(pluginsConfigJson)
{
	if (oFF.notNull(pluginsConfigJson))
	{
		if (pluginsConfigJson.isStructure())
		{
			this._processPluginStructure(pluginsConfigJson.asStructure());
		}
		else if (pluginsConfigJson.isList())
		{
			this._processPluginList(pluginsConfigJson.asList());
		}
		else if (pluginsConfigJson.isString())
		{
			this._processPluginString(pluginsConfigJson.asString());
		}
	}
};
oFF.HuConfigurationPluginsProcessor.prototype._processPluginStructure = function(pluginsStruct)
{
	var keysList = pluginsStruct.getKeysAsReadOnlyListOfString();
	oFF.XCollectionUtils.forEachString(keysList,  function(tmpKey){
		var pluginName = pluginsStruct.getStructureByKey(tmpKey).getStringByKey(oFF.HuPluginConfigurationConstants.PLUGIN);
		if (oFF.XStringUtils.isNullOrEmpty(pluginName))
		{
			pluginName = tmpKey;
		}
		if (oFF.XStringUtils.isNotNullAndNotEmpty(pluginName))
		{
			var name = pluginsStruct.getStructureByKey(tmpKey).getStringByKey(oFF.HuPluginConfigurationConstants.NAME);
			var configStruct = pluginsStruct.getStructureByKey(tmpKey).getStructureByKey(oFF.HuPluginConfigurationConstants.CONFIG);
			if (oFF.isNull(configStruct))
			{
				configStruct = pluginsStruct.getStructureByKey(tmpKey);
			}
			if (oFF.isNull(configStruct))
			{
				configStruct = oFF.PrFactory.createStructure();
			}
			var newPluginNameConfigWrapper = oFF.HuPluginNameConfig.create(pluginName, configStruct, name);
			this.m_allConfigPlugins.add(newPluginNameConfigWrapper);
		}
	}.bind(this));
};
oFF.HuConfigurationPluginsProcessor.prototype._processPluginList = function(pluginList)
{
	oFF.XCollectionUtils.forEach(pluginList,  function(tmpElement){
		if (tmpElement.isStructure())
		{
			var tmpStruct = tmpElement.asStructure();
			var pluginName = tmpStruct.getStringByKey(oFF.HuPluginConfigurationConstants.PLUGIN);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(pluginName))
			{
				var name = tmpStruct.getStringByKey(oFF.HuPluginConfigurationConstants.NAME);
				var configStruct = tmpStruct.getStructureByKey(oFF.HuPluginConfigurationConstants.CONFIG);
				if (oFF.isNull(configStruct))
				{
					configStruct = oFF.PrFactory.createStructure();
				}
				var newPluginNameConfigWrapper = oFF.HuPluginNameConfig.create(pluginName, configStruct, name);
				this.m_allConfigPlugins.add(newPluginNameConfigWrapper);
			}
		}
		else if (tmpElement.isString())
		{
			var tmpName = tmpElement.asString().getString();
			var newPluginNameConfigWrapper2 = oFF.HuPluginNameConfig.create(tmpName, oFF.PrFactory.createStructure(), null);
			this.m_allConfigPlugins.add(newPluginNameConfigWrapper2);
		}
	}.bind(this));
};
oFF.HuConfigurationPluginsProcessor.prototype._processPluginString = function(pluginsString)
{
	var pluginName = pluginsString.getString();
	var newPluginNameConfigWrapper = oFF.HuPluginNameConfig.create(pluginName, oFF.PrFactory.createStructure(), null);
	this.m_allConfigPlugins.add(newPluginNameConfigWrapper);
};
oFF.HuConfigurationPluginsProcessor.prototype._validatePlugins = function()
{
	if (oFF.notNull(this.m_allConfigPlugins) && this.m_allConfigPlugins.size() > 0)
	{
		var newAllPluginList = oFF.XList.create();
		oFF.XCollectionUtils.forEach(this.m_allConfigPlugins,  function(tmpPluginWrapper){
			var pluginName = tmpPluginWrapper.getPluginName();
			var canBeInitialized = oFF.HuPluginRegistration.canPluginBeInitialized(pluginName);
			if (canBeInitialized)
			{
				newAllPluginList.add(tmpPluginWrapper);
			}
			else
			{
				this.m_invalidPluginNames.add(pluginName);
			}
		}.bind(this));
		this.m_allConfigPlugins.clear();
		this.m_allConfigPlugins = oFF.XObjectExt.release(this.m_allConfigPlugins);
		this.m_allConfigPlugins = newAllPluginList;
	}
};
oFF.HuConfigurationPluginsProcessor.prototype._groupPlugins = function()
{
	if (oFF.notNull(this.m_allConfigPlugins) && this.m_allConfigPlugins.size() > 0)
	{
		oFF.XCollectionUtils.forEach(this.m_allConfigPlugins,  function(tmpPluginWrapper){
			var tmpPluginDef = oFF.HuPluginRegistration.getPluginDef(tmpPluginWrapper.getPluginName());
			if (tmpPluginDef.getPluginType() === oFF.HuHorizonPluginType.COMPONENT)
			{
				this.m_startupViewPlugins.add(tmpPluginWrapper);
			}
			else if (tmpPluginDef.getPluginType() === oFF.HuHorizonPluginType.DOCUMENT)
			{
				this.m_startupViewPlugins.add(tmpPluginWrapper);
			}
			else if (tmpPluginDef.getPluginType() === oFF.HuHorizonPluginType.COMMAND)
			{
				this.m_commandPluginsToStart.add(tmpPluginWrapper);
			}
		}.bind(this));
	}
};

oFF.HuConfigurationToolbarProcessor = function() {};
oFF.HuConfigurationToolbarProcessor.prototype = new oFF.HuDfHorizonProcessor();
oFF.HuConfigurationToolbarProcessor.prototype._ff_c = "HuConfigurationToolbarProcessor";

oFF.HuConfigurationToolbarProcessor.create = function(logger, toolbarConfigJson)
{
	var newInstance = new oFF.HuConfigurationToolbarProcessor();
	newInstance.setupWithLogger(logger);
	newInstance.setupWithToolbarJson(toolbarConfigJson);
	return newInstance;
};
oFF.HuConfigurationToolbarProcessor.prototype.m_allToolbarItems = null;
oFF.HuConfigurationToolbarProcessor.prototype.m_allGroupsInOrder = null;
oFF.HuConfigurationToolbarProcessor.prototype.m_groupedToolbarItems = null;
oFF.HuConfigurationToolbarProcessor.prototype.releaseObject = function()
{
	this.m_groupedToolbarItems.clear();
	this.m_groupedToolbarItems = oFF.XObjectExt.release(this.m_groupedToolbarItems);
	this.m_allGroupsInOrder.clear();
	this.m_allGroupsInOrder = oFF.XObjectExt.release(this.m_allGroupsInOrder);
	this.m_allToolbarItems = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_allToolbarItems);
	oFF.HuDfHorizonProcessor.prototype.releaseObject.call( this );
};
oFF.HuConfigurationToolbarProcessor.prototype.setupWithToolbarJson = function(toolbarConfigJson)
{
	this.m_allToolbarItems = oFF.XList.create();
	this.m_allGroupsInOrder = oFF.XList.create();
	this.m_groupedToolbarItems = oFF.XLinkedHashMapByString.create();
	this._processToolbarSection(toolbarConfigJson);
	this._createGroupsAndGroupItems();
};
oFF.HuConfigurationToolbarProcessor.prototype.getProcessorName = function()
{
	return "Toolbar Configuration Processor";
};
oFF.HuConfigurationToolbarProcessor.prototype.getAllToolbarItems = function()
{
	return this.m_allToolbarItems;
};
oFF.HuConfigurationToolbarProcessor.prototype.getAllGroupsInOrder = function()
{
	return this.m_allGroupsInOrder;
};
oFF.HuConfigurationToolbarProcessor.prototype.getAllToolbarItemsGrouped = function()
{
	return this.m_groupedToolbarItems;
};
oFF.HuConfigurationToolbarProcessor.prototype.hasToolbarItems = function()
{
	return this.getAllToolbarItems().hasElements();
};
oFF.HuConfigurationToolbarProcessor.prototype._processToolbarSection = function(toolbarConfigJson)
{
	if (oFF.notNull(toolbarConfigJson))
	{
		if (toolbarConfigJson.isList())
		{
			this._processToolbarList(toolbarConfigJson.asList());
		}
	}
};
oFF.HuConfigurationToolbarProcessor.prototype._processToolbarList = function(toolbarList)
{
	oFF.XCollectionUtils.forEach(toolbarList,  function(tmpElement){
		if (tmpElement.isStructure())
		{
			var tmpStruct = tmpElement.asStructure();
			var actionId = tmpStruct.getStringByKey(oFF.HuToolbarConfigurationConstants.ACTION);
			if (oFF.XStringUtils.isNotNullAndNotEmpty(actionId))
			{
				var name = tmpStruct.getStringByKey(oFF.HuToolbarConfigurationConstants.NAME);
				var text = tmpStruct.getStringByKey(oFF.HuToolbarConfigurationConstants.TEXT);
				var icon = tmpStruct.getStringByKey(oFF.HuToolbarConfigurationConstants.ICON);
				var tooltip = tmpStruct.getStringByKey(oFF.HuToolbarConfigurationConstants.TOOLTIP);
				var groupName = tmpStruct.getStringByKey(oFF.HuToolbarConfigurationConstants.GROUP);
				var tmpGroup = oFF.HuToolbarGroup.UNGROUPED;
				if (oFF.XStringUtils.isNotNullAndNotEmpty(groupName))
				{
					tmpGroup = oFF.HuToolbarGroup.createCustomGroupIfNecessary(groupName);
				}
				var newToolbarItem = oFF.HuToolbarItem.create(actionId, name, text, icon, tooltip, tmpGroup);
				this.m_allToolbarItems.add(newToolbarItem);
			}
		}
		else if (tmpElement.isString())
		{
			var actionId2 = tmpElement.asString().getString();
			var newToolbarItem2 = oFF.HuToolbarItem.create(actionId2, null, null, null, null, null);
			this.m_allToolbarItems.add(newToolbarItem2);
		}
	}.bind(this));
};
oFF.HuConfigurationToolbarProcessor.prototype._createGroupsAndGroupItems = function()
{
	if (oFF.notNull(this.m_allToolbarItems) && this.m_allToolbarItems.size() > 0)
	{
		oFF.XCollectionUtils.forEach(this.m_allToolbarItems,  function(tmpToolbarItem){
			var tmpGroup = tmpToolbarItem.getGroup();
			if (tmpGroup !== oFF.HuToolbarGroup.UNGROUPED && !this.m_allGroupsInOrder.contains(tmpGroup))
			{
				this.m_allGroupsInOrder.add(tmpGroup);
			}
			var groupList = this.m_groupedToolbarItems.getByKey(tmpGroup.getName());
			if (oFF.isNull(groupList))
			{
				groupList = oFF.XList.create();
				this.m_groupedToolbarItems.put(tmpGroup.getName(), groupList);
			}
			groupList.add(tmpToolbarItem);
		}.bind(this));
		if (this.m_groupedToolbarItems.containsKey(oFF.HuToolbarGroup.UNGROUPED.getName()))
		{
			this.m_allGroupsInOrder.add(oFF.HuToolbarGroup.UNGROUPED);
		}
	}
};

oFF.HuPluginManifestProcessor = function() {};
oFF.HuPluginManifestProcessor.prototype = new oFF.HuDfHorizonProcessor();
oFF.HuPluginManifestProcessor.prototype._ff_c = "HuPluginManifestProcessor";

oFF.HuPluginManifestProcessor.create = function(logger, process)
{
	var newInstance = new oFF.HuPluginManifestProcessor();
	newInstance.setupWithLogger(logger);
	newInstance.setupInternal(process);
	return newInstance;
};
oFF.HuPluginManifestProcessor.prototype.m_process = null;
oFF.HuPluginManifestProcessor.prototype.m_pluginLoader = null;
oFF.HuPluginManifestProcessor.prototype.releaseObject = function()
{
	this.m_process = null;
	this.m_pluginLoader = oFF.XObjectExt.release(this.m_pluginLoader);
	oFF.HuDfHorizonProcessor.prototype.releaseObject.call( this );
};
oFF.HuPluginManifestProcessor.prototype.setupInternal = function(process)
{
	this.m_process = process;
	this.m_pluginLoader = oFF.HuPluginLoaderService.create(this.getLogger(), this.getProcess());
};
oFF.HuPluginManifestProcessor.prototype.getProcessorName = function()
{
	return "Plugin Manifest Processor";
};
oFF.HuPluginManifestProcessor.prototype.processPluginManifestDirectories = function(directories)
{
	var loadPluginsPromise = oFF.XPromise.create( function(resolve, reject){
		var pluginLoadPromiseList = oFF.XList.create();
		oFF.XCollectionUtils.forEach(directories,  function(tmpDir){
			pluginLoadPromiseList.add(this.processPluginManifestDirectory(tmpDir));
		}.bind(this));
		var allPluginLoadPromise = oFF.XPromise.allSettled(pluginLoadPromiseList);
		allPluginLoadPromise.onFinally( function(){
			resolve(oFF.XBooleanValue.create(true));
		}.bind(this));
	}.bind(this));
	return loadPluginsPromise;
};
oFF.HuPluginManifestProcessor.prototype.getProcess = function()
{
	return this.m_process;
};
oFF.HuPluginManifestProcessor.prototype.getPluginLoader = function()
{
	return this.m_pluginLoader;
};
oFF.HuPluginManifestProcessor.prototype.processPluginManifestDirectory = function(dir)
{
	if (oFF.notNull(dir))
	{
		var pluginDirLoadPromise = oFF.XPromise.create( function(resolve, reject){
			this.getLogger().logDebug(oFF.XStringUtils.concatenate2("Processing plugin dir: ", dir.getUri().getPath()));
			oFF.UtFilePromise.isExisting(dir).then( function(isExisting){
				if (isExisting.getBoolean())
				{
					this.logDebug("Plugins dir existing!");
					oFF.UtFilePromise.fetchChildren(dir).then( function(dirChildren){
						this.logDebug(oFF.XStringUtils.concatenate3("Plugin directory has ", oFF.XInteger.convertToString(dirChildren.size()), " number of items!"));
						this.processDirectoryChildren(dirChildren).onFinally( function(){
							resolve(oFF.XBooleanValue.create(true));
						}.bind(this));
						return dirChildren;
					}.bind(this), reject);
				}
				else
				{
					this.logDebug("Plugins dir NOT existing!");
					resolve(oFF.XBooleanValue.create(true));
				}
				return isExisting;
			}.bind(this), reject);
		}.bind(this));
		return pluginDirLoadPromise;
	}
	return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
};
oFF.HuPluginManifestProcessor.prototype.processDirectoryChildren = function(dirChildren)
{
	var loadDirectoryChildrenPromise = oFF.XPromise.create( function(resolve, reject){
		var directoryChildrenLoadList = oFF.XList.create();
		oFF.XCollectionUtils.forEach(dirChildren,  function(tmpChild){
			if (!tmpChild.isHidden())
			{
				directoryChildrenLoadList.add(this.processPluginManifestFile(tmpChild));
			}
		}.bind(this));
		var dirChildrenLoadPromise = oFF.XPromise.allSettled(directoryChildrenLoadList);
		dirChildrenLoadPromise.onFinally( function(){
			resolve(oFF.XBooleanValue.create(true));
		}.bind(this));
	}.bind(this));
	return loadDirectoryChildrenPromise;
};
oFF.HuPluginManifestProcessor.prototype.processPluginManifestFile = function(file)
{
	var loadFilePromise = oFF.XPromise.create( function(resolve, reject){
		oFF.UtFilePromise.loadJsonContent(file).then( function(fileJson){
			var tmpManifest = oFF.HuPluginManifest.createByStructure(fileJson);
			if (oFF.notNull(tmpManifest))
			{
				this.logDebug(oFF.XStringUtils.concatenate2("Plugin manifest loaded successfully: ", tmpManifest.getName()));
				if (oFF.HuPluginRegistration.getPluginDef(tmpManifest.getName()) === null)
				{
					oFF.HuPluginRegistration.registerPluginByManifest(tmpManifest);
					var tmpPluginDef = oFF.HuPluginRegistration.getPluginDef(tmpManifest.getName());
					if (oFF.notNull(tmpPluginDef) && !tmpPluginDef.isPluginLoaded())
					{
						this.getPluginLoader().loadPlugin(tmpPluginDef).onFinally( function(){
							resolve(oFF.XBooleanValue.create(true));
						}.bind(this));
					}
				}
				else if (!oFF.HuPluginRegistration.isPluginLoaded(tmpManifest.getName()))
				{
					this.getPluginLoader().loadPlugin(oFF.HuPluginRegistration.getPluginDef(tmpManifest.getName())).onFinally( function(){
						resolve(oFF.XBooleanValue.create(true));
					}.bind(this));
				}
				else
				{
					if (!oFF.HuPluginRegistration.hasManifest(tmpManifest.getName()))
					{
						this.logDebug("Plugin registered but has no manifest! Adding manifest!");
						oFF.HuPluginRegistration.registerPluginByManifest(tmpManifest);
					}
					else
					{
						this.logDebug("Plugin already registered!");
					}
					resolve(oFF.XBooleanValue.create(true));
				}
			}
			else
			{
				this.logDebug("Failed to process plugin file!");
				resolve(oFF.XBooleanValue.create(true));
			}
			return fileJson;
		}.bind(this), reject);
	}.bind(this));
	return loadFilePromise;
};

oFF.HuEmptyWorkspaceView = function() {};
oFF.HuEmptyWorkspaceView.prototype = new oFF.DfUiView();
oFF.HuEmptyWorkspaceView.prototype._ff_c = "HuEmptyWorkspaceView";

oFF.HuEmptyWorkspaceView.create = function(genesis)
{
	var newView = new oFF.HuEmptyWorkspaceView();
	newView.initView(genesis);
	return newView;
};
oFF.HuEmptyWorkspaceView.prototype.m_messageLbl = null;
oFF.HuEmptyWorkspaceView.prototype.m_reloadConfigProcedure = null;
oFF.HuEmptyWorkspaceView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.HuEmptyWorkspaceView.prototype.destroyView = function()
{
	this.m_messageLbl = oFF.XObjectExt.release(this.m_messageLbl);
	this.m_reloadConfigProcedure = null;
};
oFF.HuEmptyWorkspaceView.prototype.setupView = function() {};
oFF.HuEmptyWorkspaceView.prototype.layoutView = function(viewControl)
{
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.useMaxSpace();
	viewControl.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	viewControl.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	this.m_messageLbl = viewControl.addNewItemOfType(oFF.UiType.LABEL);
	this.m_messageLbl.setWrapping(true);
	this.m_messageLbl.setMaxWidth(oFF.UiCssLength.create("75%"));
	var actionButtonRow = viewControl.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	actionButtonRow.setDirection(oFF.UiFlexDirection.ROW);
	actionButtonRow.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	actionButtonRow.setMargin(oFF.UiCssBoxEdges.create("1rem 0 0 0"));
	var reloadConfigBtn = actionButtonRow.addNewItemOfType(oFF.UiType.BUTTON);
	reloadConfigBtn.setText("Reload config");
	reloadConfigBtn.setIcon("refresh");
	reloadConfigBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		this.notifyReloadConfigButtonPressed();
	}.bind(this)));
	reloadConfigBtn.setVisible(false);
};
oFF.HuEmptyWorkspaceView.prototype.setMessageText = function(text)
{
	if (oFF.notNull(this.m_messageLbl))
	{
		this.m_messageLbl.setText(text);
	}
};
oFF.HuEmptyWorkspaceView.prototype.setReloadConfigButtonPressedProcdeure = function(procedure)
{
	this.m_reloadConfigProcedure = procedure;
};
oFF.HuEmptyWorkspaceView.prototype.notifyReloadConfigButtonPressed = function()
{
	if (oFF.notNull(this.m_reloadConfigProcedure))
	{
		this.m_reloadConfigProcedure();
	}
};

oFF.HuSplashScreenView = function() {};
oFF.HuSplashScreenView.prototype = new oFF.DfUiView();
oFF.HuSplashScreenView.prototype._ff_c = "HuSplashScreenView";

oFF.HuSplashScreenView.create = function(genesis)
{
	var newView = new oFF.HuSplashScreenView();
	newView.initView(genesis);
	return newView;
};
oFF.HuSplashScreenView.prototype.m_splashImagePath = null;
oFF.HuSplashScreenView.prototype.m_splashImage = null;
oFF.HuSplashScreenView.prototype.m_currentBootActionLbl = null;
oFF.HuSplashScreenView.prototype.m_splashProgressIndicator = null;
oFF.HuSplashScreenView.prototype.m_splashMessageStrip = null;
oFF.HuSplashScreenView.prototype.getViewControl = function(genesis)
{
	return genesis.newControl(oFF.UiType.FLEX_LAYOUT);
};
oFF.HuSplashScreenView.prototype.destroyView = function()
{
	this.m_splashImage = oFF.XObjectExt.release(this.m_splashImage);
	this.m_currentBootActionLbl = oFF.XObjectExt.release(this.m_currentBootActionLbl);
	this.m_splashProgressIndicator = oFF.XObjectExt.release(this.m_splashProgressIndicator);
	this.m_splashMessageStrip = oFF.XObjectExt.release(this.m_splashMessageStrip);
};
oFF.HuSplashScreenView.prototype.setupView = function() {};
oFF.HuSplashScreenView.prototype.layoutView = function(viewControl)
{
	viewControl.setDirection(oFF.UiFlexDirection.COLUMN);
	viewControl.useMaxSpace();
	viewControl.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	this.m_splashImage = viewControl.addNewItemOfType(oFF.UiType.IMAGE);
	this.m_splashImage.setSrc(this.m_splashImagePath);
	this.m_splashImage.useMaxSpace();
	this.m_splashImage.setImageMode(oFF.UiImageMode.BACKGROUND);
	this.m_splashImage.setBackgroundSize("contain");
	this.m_splashImage.setBackgroundPosition("center");
	this.m_splashImage.setMargin(oFF.UiCssBoxEdges.create("1rem 0 0 0"));
	this.m_currentBootActionLbl = viewControl.addNewItemOfType(oFF.UiType.LABEL);
	this.m_currentBootActionLbl.setTextAlign(oFF.UiTextAlign.CENTER);
	this.m_currentBootActionLbl.setFlex("0 0 auto");
	this.m_currentBootActionLbl.setMargin(oFF.UiCssBoxEdges.create("1rem 0 0 0"));
	this.m_currentBootActionLbl.setVisible(false);
	this.m_currentBootActionLbl.setText("");
	this.m_splashProgressIndicator = viewControl.addNewItemOfType(oFF.UiType.PROGRESS_INDICATOR);
	this.m_splashProgressIndicator.setWidth(oFF.UiCssLength.create("50%"));
	this.m_splashProgressIndicator.setMargin(oFF.UiCssBoxEdges.create("0 0 0.5rem 0"));
	this.m_splashMessageStrip = viewControl.addNewItemOfType(oFF.UiType.MESSAGE_STRIP);
	this.m_splashMessageStrip.setMessageType(oFF.UiMessageType.ERROR);
	this.m_splashMessageStrip.setMargin(oFF.UiCssBoxEdges.create("0 0 1rem 0"));
	this.m_splashMessageStrip.setShowCloseButton(false);
	this.m_splashMessageStrip.setVisible(false);
};
oFF.HuSplashScreenView.prototype.setSplashScreenImagePath = function(imgPath)
{
	this.m_splashImagePath = imgPath;
	if (oFF.notNull(this.m_splashImage))
	{
		this.m_splashImage.setSrc(imgPath);
	}
};
oFF.HuSplashScreenView.prototype.setCurrentStatusText = function(statusText)
{
	if (oFF.notNull(this.m_currentBootActionLbl))
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(statusText))
		{
			this.m_currentBootActionLbl.setVisible(true);
		}
		else
		{
			this.m_currentBootActionLbl.setVisible(false);
		}
		this.m_currentBootActionLbl.setText(statusText);
	}
};
oFF.HuSplashScreenView.prototype.setCurrentPercentValue = function(percentValue)
{
	if (oFF.notNull(this.m_splashProgressIndicator))
	{
		this.m_splashProgressIndicator.setPercentValue(percentValue);
	}
};
oFF.HuSplashScreenView.prototype.setErrorMessage = function(errorMsg)
{
	if (oFF.notNull(this.m_splashMessageStrip))
	{
		if (oFF.XStringUtils.isNotNullAndNotEmpty(errorMsg))
		{
			this.m_splashMessageStrip.setVisible(true);
		}
		else
		{
			this.m_splashMessageStrip.setVisible(false);
		}
		this.m_splashMessageStrip.setText(errorMsg);
	}
};

oFF.HuHorizonBootControllerStatus = function() {};
oFF.HuHorizonBootControllerStatus.prototype = new oFF.XConstant();
oFF.HuHorizonBootControllerStatus.prototype._ff_c = "HuHorizonBootControllerStatus";

oFF.HuHorizonBootControllerStatus.INITIAL = null;
oFF.HuHorizonBootControllerStatus.BOOT_IN_PROGRESS = null;
oFF.HuHorizonBootControllerStatus.BOOT_ERROR = null;
oFF.HuHorizonBootControllerStatus.BOOT_FINISHED = null;
oFF.HuHorizonBootControllerStatus.WORKSPACE_SWITCH_IN_PROGRESS = null;
oFF.HuHorizonBootControllerStatus.WORKSPACE_SWITCH_FINISHED = null;
oFF.HuHorizonBootControllerStatus.staticSetup = function()
{
	oFF.HuHorizonBootControllerStatus.INITIAL = oFF.HuHorizonBootControllerStatus.createWithName("Initial");
	oFF.HuHorizonBootControllerStatus.BOOT_IN_PROGRESS = oFF.HuHorizonBootControllerStatus.createWithName("BootInProgress");
	oFF.HuHorizonBootControllerStatus.BOOT_ERROR = oFF.HuHorizonBootControllerStatus.createWithName("BootError");
	oFF.HuHorizonBootControllerStatus.BOOT_FINISHED = oFF.HuHorizonBootControllerStatus.createWithName("BootFinished");
	oFF.HuHorizonBootControllerStatus.WORKSPACE_SWITCH_IN_PROGRESS = oFF.HuHorizonBootControllerStatus.createWithName("WorkspaceSwitchInProgress");
	oFF.HuHorizonBootControllerStatus.WORKSPACE_SWITCH_FINISHED = oFF.HuHorizonBootControllerStatus.createWithName("WorkspaceSwitchFinished");
};
oFF.HuHorizonBootControllerStatus.createWithName = function(name)
{
	return oFF.XConstant.setupName(new oFF.HuHorizonBootControllerStatus(), name);
};

oFF.HuHorizonConfigBootAction = function() {};
oFF.HuHorizonConfigBootAction.prototype = new oFF.HuDfHorizonBootAction();
oFF.HuHorizonConfigBootAction.prototype._ff_c = "HuHorizonConfigBootAction";

oFF.HuHorizonConfigBootAction.create = function(bootController)
{
	var newInstance = new oFF.HuHorizonConfigBootAction();
	newInstance.setupWithBootController(bootController);
	return newInstance;
};
oFF.HuHorizonConfigBootAction.prototype.m_configFile = null;
oFF.HuHorizonConfigBootAction.prototype.m_configStr = null;
oFF.HuHorizonConfigBootAction.prototype.m_configFilePath = null;
oFF.HuHorizonConfigBootAction.prototype.releaseObject = function()
{
	this.m_configFile = oFF.XObjectExt.release(this.m_configFile);
	oFF.HuDfHorizonBootAction.prototype.releaseObject.call( this );
};
oFF.HuHorizonConfigBootAction.prototype.setupAction = function() {};
oFF.HuHorizonConfigBootAction.prototype.getActionName = function()
{
	return "Config";
};
oFF.HuHorizonConfigBootAction.prototype.executeBootAction = function()
{
	if (this.getBootController().getWorkspaceManager() !== null && !this.getBootController().getWorkspaceManager().isVirtualWorkspace() && this.getBootController().getWorkspaceManager().getWorkspaceDirectory() !== null)
	{
		this.m_configFile = this.getBootController().getWorkspaceManager().getWorkspaceDirectory().newChild(oFF.HuHorizonConfigConstants.CONFIG_FILE_NAME);
	}
	if (this.getBootController().getWorkspaceManager() !== null && this.getBootController().getWorkspaceManager().isVirtualWorkspace() && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_configStr))
	{
		var parsedJson = this.parseStringifiedJson(this.m_configStr);
		if (oFF.notNull(parsedJson))
		{
			this.getBootController().initConfigManager(parsedJson);
			return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
		}
	}
	if (oFF.isNull(this.m_configFile) && this.getBootController().getWorkspaceManager() !== null && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_configFilePath))
	{
		this.m_configFile = oFF.XFile.createWithVars(this.getBootController().getProcess(), this.m_configFilePath);
	}
	var bootPromise = oFF.XPromise.create( function(resolve, reject){
		this.loadConfigJson(this.m_configFile).then( function(tmpConfig){
			this.getBootController().initConfigManager(tmpConfig);
			resolve(oFF.XBooleanValue.create(true));
			return tmpConfig;
		}.bind(this),  function(loadConfigError){
			if (loadConfigError.getErrorType() === oFF.HuErrorType.CONFIG_SYNTAX_ERROR)
			{
				reject(oFF.XError.create("Syntax error! Could not read configuration file!"));
			}
			else
			{
				this.getBootController().initConfigManager(null);
				if (loadConfigError.getErrorType() === oFF.HuErrorType.CONFIG_FILE_NOT_FOUND && this.shouldCreateConfigFileIfNeeded())
				{
					this.createConfigFile().onFinally( function(){
						resolve(oFF.XBooleanValue.create(true));
					}.bind(this));
				}
				else
				{
					resolve(oFF.XBooleanValue.create(true));
				}
			}
		}.bind(this));
	}.bind(this));
	return bootPromise;
};
oFF.HuHorizonConfigBootAction.prototype.setConfigStr = function(configStr)
{
	this.m_configStr = configStr;
};
oFF.HuHorizonConfigBootAction.prototype.setConfigFilePath = function(configFilePath)
{
	this.m_configFilePath = configFilePath;
};
oFF.HuHorizonConfigBootAction.prototype.loadConfigJson = function(configFile)
{
	var configFileLoadPromise = oFF.XPromise.create( function(resolve, reject){
		oFF.UtFilePromise.isExisting(configFile).then( function(isExisting){
			if (isExisting.getBoolean())
			{
				oFF.UtFilePromise.loadJsonContent(this.m_configFile).then( function(tmpConfigJson){
					resolve(tmpConfigJson);
					return tmpConfigJson;
				}.bind(this),  function(loadError){
					reject(oFF.XError.create("Cannot read file!").setErrorType(oFF.HuErrorType.CONFIG_SYNTAX_ERROR));
				}.bind(this));
			}
			else
			{
				reject(oFF.XError.create("File does not exist!").setErrorType(oFF.HuErrorType.CONFIG_FILE_NOT_FOUND));
			}
			return isExisting;
		}.bind(this),  function(fileExistingError){
			reject(oFF.XError.create(fileExistingError.getText()).attachCause(fileExistingError).setErrorType(oFF.HuErrorType.CONFIG_FILE_NOT_FOUND));
		}.bind(this));
	}.bind(this));
	return configFileLoadPromise;
};
oFF.HuHorizonConfigBootAction.prototype.createConfigFile = function()
{
	return oFF.UtFilePromise.saveContent(this.m_configFile, this.getBootController().getConfigManager().getSaveContent()).then( function(savedFile){
		return savedFile;
	}.bind(this), null);
};
oFF.HuHorizonConfigBootAction.prototype.parseStringifiedJson = function(stringifiedJson)
{
	var parsedJson = null;
	if (oFF.XStringUtils.isNotNullAndNotEmpty(stringifiedJson))
	{
		var parser = oFF.JsonParserFactory.newInstance();
		var tmpElement = parser.parse(stringifiedJson);
		if (oFF.notNull(tmpElement) && tmpElement.isStructure())
		{
			parsedJson = tmpElement;
		}
		parser = oFF.XObjectExt.release(parser);
	}
	return parsedJson;
};
oFF.HuHorizonConfigBootAction.prototype.shouldCreateConfigFileIfNeeded = function()
{
	return this.getBootController().getWorkspaceManager() !== null && !this.getBootController().getWorkspaceManager().isVirtualWorkspace() && this.getBootController().getWorkspaceManager().getWorkspaceDirectory() !== null;
};

oFF.HuHorizonFinalizeSetupBootAction = function() {};
oFF.HuHorizonFinalizeSetupBootAction.prototype = new oFF.HuDfHorizonBootAction();
oFF.HuHorizonFinalizeSetupBootAction.prototype._ff_c = "HuHorizonFinalizeSetupBootAction";

oFF.HuHorizonFinalizeSetupBootAction.create = function(bootController)
{
	var newInstance = new oFF.HuHorizonFinalizeSetupBootAction();
	newInstance.setupWithBootController(bootController);
	return newInstance;
};
oFF.HuHorizonFinalizeSetupBootAction.prototype.releaseObject = function()
{
	oFF.HuDfHorizonBootAction.prototype.releaseObject.call( this );
};
oFF.HuHorizonFinalizeSetupBootAction.prototype.setupAction = function() {};
oFF.HuHorizonFinalizeSetupBootAction.prototype.getActionName = function()
{
	return "FinalizeSetup";
};
oFF.HuHorizonFinalizeSetupBootAction.prototype.executeBootAction = function()
{
	return this.getBootController().finalizeMainControllerSetup();
};

oFF.HuHorizonPluginsBootAction = function() {};
oFF.HuHorizonPluginsBootAction.prototype = new oFF.HuDfHorizonBootAction();
oFF.HuHorizonPluginsBootAction.prototype._ff_c = "HuHorizonPluginsBootAction";

oFF.HuHorizonPluginsBootAction.create = function(bootController)
{
	var newInstance = new oFF.HuHorizonPluginsBootAction();
	newInstance.setupWithBootController(bootController);
	return newInstance;
};
oFF.HuHorizonPluginsBootAction.prototype.releaseObject = function()
{
	oFF.HuDfHorizonBootAction.prototype.releaseObject.call( this );
};
oFF.HuHorizonPluginsBootAction.prototype.setupAction = function()
{
	this.logDebug(oFF.XStringUtils.concatenate2("Number of registered plugins: ", oFF.XInteger.convertToString(oFF.HuPluginRegistration.getAllLoadedPluginNames().size())));
};
oFF.HuHorizonPluginsBootAction.prototype.getActionName = function()
{
	return "Plugins";
};
oFF.HuHorizonPluginsBootAction.prototype.executeBootAction = function()
{
	var bootPromise = oFF.XPromise.create( function(resolve, reject){
		this.loadPluginManifests().then( function(tmpExisting){
			this.loadApiPlugins().then( function(boolRes){
				resolve(oFF.XBooleanValue.create(true));
				return boolRes;
			}.bind(this), reject);
			return tmpExisting;
		}.bind(this), reject);
	}.bind(this));
	return bootPromise;
};
oFF.HuHorizonPluginsBootAction.prototype.loadPluginManifests = function()
{
	var pluginDirList = oFF.XList.create();
	pluginDirList.add(oFF.XFile.createWithVars(this.getBootController().getProcess(), oFF.HuHorizonConstants.DEFAULT_PLUGIN_DIRECTORY));
	pluginDirList.add(oFF.XFile.createWithVars(this.getBootController().getProcess(), oFF.HuHorizonConstants.ALT_PLUGIN_DIRECTORY));
	oFF.XCollectionUtils.forEachString(this.getBootController().getConfigManager().getProgramConfiguration().getPluginDirectories(),  function(tmpDir){
		pluginDirList.add(oFF.XFile.createWithVars(this.getBootController().getProcess(), tmpDir));
	}.bind(this));
	var newLoader = oFF.HuPluginManifestProcessor.create(this.getBootController().getLogger(), this.getBootController().getProcess());
	return newLoader.processPluginManifestDirectories(pluginDirList);
};
oFF.HuHorizonPluginsBootAction.prototype.loadApiPlugins = function()
{
	var apiPluginsLoadPromise = oFF.XPromise.create( function(resolve, reject){
		oFF.HuPluginRegistration.loadApiPlugins();
		resolve(oFF.XBooleanValue.create(true));
	}.bind(this));
	return apiPluginsLoadPromise;
};

oFF.HuHorizonWorkspaceBootAction = function() {};
oFF.HuHorizonWorkspaceBootAction.prototype = new oFF.HuDfHorizonBootAction();
oFF.HuHorizonWorkspaceBootAction.prototype._ff_c = "HuHorizonWorkspaceBootAction";

oFF.HuHorizonWorkspaceBootAction.create = function(bootController)
{
	var newInstance = new oFF.HuHorizonWorkspaceBootAction();
	newInstance.setupWithBootController(bootController);
	return newInstance;
};
oFF.HuHorizonWorkspaceBootAction.prototype.releaseObject = function()
{
	oFF.HuDfHorizonBootAction.prototype.releaseObject.call( this );
};
oFF.HuHorizonWorkspaceBootAction.prototype.setupAction = function() {};
oFF.HuHorizonWorkspaceBootAction.prototype.getActionName = function()
{
	return "Workspace";
};
oFF.HuHorizonWorkspaceBootAction.prototype.executeBootAction = function()
{
	if (this.getBootController().getBootConfig().shouldBootIntoVirtualWorkspace())
	{
		this.getBootController().initWorkspaceManager(null);
		return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
	}
	else
	{
		var bootPromise = oFF.XPromise.create( function(resolve, reject){
			this.selectWorkspace().then( function(directory){
				if (oFF.notNull(directory))
				{
					this.handleDirectorySelected(directory).then( function(isSuccess){
						resolve(oFF.XBooleanValue.create(true));
						return isSuccess;
					}.bind(this), reject);
				}
				else
				{
					reject(oFF.XError.create("No workspace selected! Cannot continue!"));
				}
				return directory;
			}.bind(this), reject);
		}.bind(this));
		return bootPromise;
	}
};
oFF.HuHorizonWorkspaceBootAction.prototype.presentWorkspaceDirectorySelection = function()
{
	return this.showWorkspaceSelectionDialog();
};
oFF.HuHorizonWorkspaceBootAction.prototype.switchWorkspace = function(directory)
{
	return this.handleDirectorySelected(directory);
};
oFF.HuHorizonWorkspaceBootAction.prototype.handleDirectorySelected = function(directory)
{
	this.saveSelectedWorspaceDirPath(directory);
	return this.getBootController().initWorkspaceManager(directory);
};
oFF.HuHorizonWorkspaceBootAction.prototype.selectWorkspace = function()
{
	var savedWorkspaceDirectoryPath = this.getBootController().getLocalStorage().getStringByKey(oFF.HuHorizonConstants.SELECTED_WORKSPACE_PATH_KEY);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(savedWorkspaceDirectoryPath))
	{
		var workspaceDirSelectionPromise = oFF.XPromise.create( function(resolve, reject){
			var savedWorkspaceDir = oFF.XFile.createWithVars(this.getBootController().getProcess(), savedWorkspaceDirectoryPath);
			oFF.UtFilePromise.isExisting(savedWorkspaceDir).then( function(isExisting){
				if (isExisting.getBoolean())
				{
					resolve(savedWorkspaceDir);
				}
				else
				{
					this.logDebug("Saved workspace does not exist!");
					this.showWorkspaceSelectionDialog().then( function(selectedDir){
						resolve(selectedDir);
						return selectedDir;
					}.bind(this), reject);
				}
				return isExisting;
			}.bind(this), reject);
		}.bind(this));
		return workspaceDirSelectionPromise;
	}
	return this.showWorkspaceSelectionDialog();
};
oFF.HuHorizonWorkspaceBootAction.prototype.showWorkspaceSelectionDialog = function()
{
	var workspaceSelectionPromise = oFF.XPromise.create( function(resolve, reject){
		var selectionPopups = oFF.HuHorizonWorkspaceSelectionPopup.create(this.getBootController());
		if (this.getBootController().getWorkspaceManager() !== null && this.getBootController().getWorkspaceManager().getWorkspaceDirectory() !== null)
		{
			selectionPopups.setInputValue(this.getBootController().getWorkspaceManager().getWorkspaceDirectory().getUri().getPath());
		}
		else
		{
			selectionPopups.setInputValue(oFF.HuHorizonConstants.DEFAULT_HOME_DIRECTORY);
		}
		selectionPopups.setInputConsumer( function(selectedPath){
			if (oFF.XStringUtils.isNotNullAndNotEmpty(selectedPath))
			{
				var selectedDirectory = oFF.XFile.createWithVars(this.getBootController().getProcess(), selectedPath);
				resolve(selectedDirectory);
			}
			else
			{
				reject(oFF.XError.create("Invalid directory path!"));
			}
		}.bind(this));
		selectionPopups.setCancelProcedure( function(){
			reject(oFF.XError.create("Please specify a workspace to proceed!"));
		}.bind(this));
		selectionPopups.open();
	}.bind(this));
	return workspaceSelectionPromise;
};
oFF.HuHorizonWorkspaceBootAction.prototype.saveSelectedWorspaceDirPath = function(workspaceDir)
{
	if (oFF.notNull(workspaceDir))
	{
		var selectedWorkspaceDirPath = workspaceDir.getUri().getPath();
		this.getBootController().getLocalStorage().putString(oFF.HuHorizonConstants.SELECTED_WORKSPACE_PATH_KEY, selectedWorkspaceDirPath);
	}
};

oFF.HuHorizonControllerStatus = function() {};
oFF.HuHorizonControllerStatus.prototype = new oFF.XConstant();
oFF.HuHorizonControllerStatus.prototype._ff_c = "HuHorizonControllerStatus";

oFF.HuHorizonControllerStatus.INITIAL = null;
oFF.HuHorizonControllerStatus.BOOTING = null;
oFF.HuHorizonControllerStatus.READY = null;
oFF.HuHorizonControllerStatus.staticSetup = function()
{
	oFF.HuHorizonControllerStatus.INITIAL = oFF.HuHorizonControllerStatus.createWithName("Initial");
	oFF.HuHorizonControllerStatus.BOOTING = oFF.HuHorizonControllerStatus.createWithName("Booting");
	oFF.HuHorizonControllerStatus.READY = oFF.HuHorizonControllerStatus.createWithName("Ready");
};
oFF.HuHorizonControllerStatus.createWithName = function(name)
{
	return oFF.XConstant.setupName(new oFF.HuHorizonControllerStatus(), name);
};

oFF.HuHorizonMainController = function() {};
oFF.HuHorizonMainController.prototype = new oFF.XObjectExt();
oFF.HuHorizonMainController.prototype._ff_c = "HuHorizonMainController";

oFF.HuHorizonMainController.create = function(horizonPrgInstance)
{
	var newInstance = new oFF.HuHorizonMainController();
	newInstance.setupWithProgramInstance(horizonPrgInstance);
	return newInstance;
};
oFF.HuHorizonMainController.prototype.m_programInstance = null;
oFF.HuHorizonMainController.prototype.m_loggerInstance = null;
oFF.HuHorizonMainController.prototype.m_globalDataSpace = null;
oFF.HuHorizonMainController.prototype.m_workspaceManager = null;
oFF.HuHorizonMainController.prototype.m_horizonConfigManager = null;
oFF.HuHorizonMainController.prototype.m_horizonPluginManager = null;
oFF.HuHorizonMainController.prototype.m_horizonCommandManager = null;
oFF.HuHorizonMainController.prototype.m_stateManager = null;
oFF.HuHorizonMainController.prototype.m_messageManager = null;
oFF.HuHorizonMainController.prototype.m_shellController = null;
oFF.HuHorizonMainController.prototype.m_uiController = null;
oFF.HuHorizonMainController.prototype.m_debugService = null;
oFF.HuHorizonMainController.prototype.m_activeBootController = null;
oFF.HuHorizonMainController.prototype.m_statusChangedListeners = null;
oFF.HuHorizonMainController.prototype.m_currentStatus = null;
oFF.HuHorizonMainController.prototype.releaseObject = function()
{
	this.m_horizonCommandManager = oFF.XObjectExt.release(this.m_horizonCommandManager);
	this.m_horizonPluginManager = oFF.XObjectExt.release(this.m_horizonPluginManager);
	this.m_stateManager = oFF.XObjectExt.release(this.m_stateManager);
	this.m_messageManager = oFF.XObjectExt.release(this.m_messageManager);
	this.m_activeBootController = oFF.XObjectExt.release(this.m_activeBootController);
	this.m_uiController = oFF.XObjectExt.release(this.m_uiController);
	this.m_shellController = oFF.XObjectExt.release(this.m_shellController);
	this.m_workspaceManager = oFF.XObjectExt.release(this.m_workspaceManager);
	this.m_horizonConfigManager = oFF.XObjectExt.release(this.m_horizonConfigManager);
	this.m_globalDataSpace = oFF.XObjectExt.release(this.m_globalDataSpace);
	this.m_currentStatus = null;
	this.m_statusChangedListeners = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_statusChangedListeners);
	this.m_debugService = oFF.XObjectExt.release(this.m_debugService);
	this.m_loggerInstance = oFF.XObjectExt.release(this.m_loggerInstance);
	this.m_programInstance = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.HuHorizonMainController.prototype.setupWithProgramInstance = function(horizonPrgInstance)
{
	this.m_programInstance = horizonPrgInstance;
	this.m_debugService = oFF.HuHorizonDebugService.create(this.getProcess());
	this.m_loggerInstance = oFF.HuLogger.createNewLogger();
	this.m_loggerInstance.setDebugEnabled(this.m_debugService.isDebugModeEnabled());
	this.m_statusChangedListeners = oFF.XList.create();
	this.m_currentStatus = oFF.HuHorizonControllerStatus.INITIAL;
	this.m_shellController = oFF.HuHorizonShellController.create(this);
};
oFF.HuHorizonMainController.prototype.getMainController = function()
{
	return this;
};
oFF.HuHorizonMainController.prototype.getGenesis = function()
{
	return this.getProgramInstance().getGenesis();
};
oFF.HuHorizonMainController.prototype.getProcess = function()
{
	return this.getProgramInstance().getProcess();
};
oFF.HuHorizonMainController.prototype.getSession = function()
{
	return this.getProgramInstance().getSession();
};
oFF.HuHorizonMainController.prototype.getLogger = function()
{
	return this.m_loggerInstance;
};
oFF.HuHorizonMainController.prototype.getLogContextName = function()
{
	return "Controller";
};
oFF.HuHorizonMainController.prototype.logInfo = function(logline)
{
	this.getLogger().logInfo(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuHorizonMainController.prototype.logDebug = function(logline)
{
	this.getLogger().logDebug(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuHorizonMainController.prototype.isDebugMode = function()
{
	return this.getDebugService().isDebugModeEnabled();
};
oFF.HuHorizonMainController.prototype.getLocalStorage = function()
{
	return this.getProcess().getLocalStorage();
};
oFF.HuHorizonMainController.prototype.getLocalNotificationCenter = function()
{
	return this.getProcess().getLocalNotificationCenter();
};
oFF.HuHorizonMainController.prototype.getDataSpace = function()
{
	return this.m_globalDataSpace;
};
oFF.HuHorizonMainController.prototype.getWorkspaceManager = function()
{
	return this.m_workspaceManager;
};
oFF.HuHorizonMainController.prototype.getConfigManager = function()
{
	return this.m_horizonConfigManager;
};
oFF.HuHorizonMainController.prototype.getPluginManager = function()
{
	return this.m_horizonPluginManager;
};
oFF.HuHorizonMainController.prototype.getCommandManager = function()
{
	return this.m_horizonCommandManager;
};
oFF.HuHorizonMainController.prototype.getStateManager = function()
{
	return this.m_stateManager;
};
oFF.HuHorizonMainController.prototype.getMessageManager = function()
{
	return this.m_messageManager;
};
oFF.HuHorizonMainController.prototype.getShellController = function()
{
	return this.m_shellController;
};
oFF.HuHorizonMainController.prototype.getUiController = function()
{
	return this.m_uiController;
};
oFF.HuHorizonMainController.prototype.getDebugService = function()
{
	return this.m_debugService;
};
oFF.HuHorizonMainController.prototype.addStatusChangedListener = function(listener)
{
	this.m_statusChangedListeners.add(oFF.XConsumerHolder.create(listener));
};
oFF.HuHorizonMainController.prototype.removeStatusChangedListener = function(listener)
{
	oFF.XCollectionUtils.removeIf(this.m_statusChangedListeners,  function(tmpConsumerHolder){
		return tmpConsumerHolder.getConsumer() === listener;
	}.bind(this));
};
oFF.HuHorizonMainController.prototype.getProgramInstance = function()
{
	return this.m_programInstance;
};
oFF.HuHorizonMainController.prototype.getCurrentControllerStatus = function()
{
	return this.m_currentStatus;
};
oFF.HuHorizonMainController.prototype.setControllerStatus = function(status)
{
	if (oFF.notNull(status) && this.m_currentStatus !== status)
	{
		this.m_currentStatus = status;
		this.logDebug(oFF.XStringUtils.concatenate2("Status changed to: ", status.getName()));
		this._handleStatusChangedInternal(status);
		this._notifyListenersStatusChanged(status);
	}
};
oFF.HuHorizonMainController.prototype.setLoggerInstance = function(logger)
{
	if (oFF.notNull(logger))
	{
		this.m_loggerInstance = logger;
	}
};
oFF.HuHorizonMainController.prototype.initiateBoot = function(configStr, configFilePath, workspacePath)
{
	this.setControllerStatus(oFF.HuHorizonControllerStatus.BOOTING);
	this.m_activeBootController = oFF.HuHorizonBootController.create(this);
	this.m_activeBootController.setConfigString(configStr);
	this.m_activeBootController.setConfigFilePath(configFilePath);
	var bootPromise = this.m_activeBootController.executeRegularBoot();
	bootPromise.then( function(isSuccess){
		this._handleSuccessfulBoot();
		return isSuccess;
	}.bind(this), null);
	return bootPromise;
};
oFF.HuHorizonMainController.prototype.requestWorkspaceSwitch = function()
{
	this.m_activeBootController = oFF.HuHorizonBootController.create(this);
	this.m_activeBootController.addStatusChangedListener( function(booCtrlStatus){
		if (booCtrlStatus === oFF.HuHorizonBootControllerStatus.WORKSPACE_SWITCH_IN_PROGRESS)
		{
			this.setControllerStatus(oFF.HuHorizonControllerStatus.BOOTING);
		}
	}.bind(this));
	var bootPromise = this.m_activeBootController.executeWorkspaceSwitch();
	bootPromise.then( function(isSuccess){
		this._handleSuccessfulBoot();
		return isSuccess;
	}.bind(this), null);
};
oFF.HuHorizonMainController.prototype.initWorkspaceManager = function(workspaceDirectory)
{
	if (this.getCurrentControllerStatus() !== oFF.HuHorizonControllerStatus.READY)
	{
		this.logDebug("Init -> Workspace manager");
		this.m_workspaceManager = oFF.HuHorizonWorkspaceManager.create(this, workspaceDirectory);
	}
	else
	{
		this._throwInvalidStateException();
	}
};
oFF.HuHorizonMainController.prototype.initConfigManager = function(configStruct)
{
	if (this.getCurrentControllerStatus() !== oFF.HuHorizonControllerStatus.READY)
	{
		this.logDebug("Init -> Config manager");
		this.m_horizonConfigManager = oFF.HuHorizonConfigManager.create(this, configStruct);
	}
	else
	{
		this._throwInvalidStateException();
	}
};
oFF.HuHorizonMainController.prototype.finalizeControllerSetup = function()
{
	if (this.getCurrentControllerStatus() !== oFF.HuHorizonControllerStatus.READY)
	{
		this.logDebug("Init -> Finalize setup");
		this.logDebug("Init -> Initialize global data space");
		this.m_globalDataSpace = oFF.HuDataSpace.create();
		this.logDebug("Init -> Process plugin configuration");
		this.getConfigManager().processPluginConfiguration();
		this._createInvalidPluginMessagesIfNeeded();
		this.logDebug("Init -> Create plugin manager");
		this.m_horizonPluginManager = oFF.HuHorizonPluginManager.create(this);
		this.logDebug("Init -> Create command manager");
		this.m_horizonCommandManager = oFF.HuHorizonCommandManager.create(this);
		this.logDebug("Init -> Create state manager");
		this.m_stateManager = oFF.HuHorizonStateManager.create(this);
		this.logDebug("Init -> Initialize config command plugins");
		this._initAllConfigCommandPlugins();
		this.logDebug("Init -> Create Ui controller");
		this.m_uiController = oFF.HuHorizonUiController.create(this);
	}
	else
	{
		this._throwInvalidStateException();
	}
};
oFF.HuHorizonMainController.prototype._notifyListenersStatusChanged = function(status)
{
	oFF.XCollectionUtils.forEach(this.m_statusChangedListeners,  function(tmpListener){
		tmpListener.accept(status);
	}.bind(this));
};
oFF.HuHorizonMainController.prototype._throwInvalidStateException = function()
{
	throw oFF.XException.createRuntimeException("Cannot replace manger instance as controller is already in ready state!");
};
oFF.HuHorizonMainController.prototype._initAllConfigCommandPlugins = function()
{
	this.getConfigManager().getPluginsConfiguration().processCommands( function(tmpPluginNameConfig){
		this._initializeCommandPluginIfNeeded(tmpPluginNameConfig.getPluginName(), tmpPluginNameConfig.getConfig());
	}.bind(this));
};
oFF.HuHorizonMainController.prototype._initializeCommandPluginIfNeeded = function(commandPluginName, config)
{
	if (!this.getCommandManager().isCommandSpaceRegistered(commandPluginName))
	{
		var newCommandInstance = this.getPluginManager().newCommandPluginInstance(commandPluginName, this.getMainController(), config);
		if (oFF.notNull(newCommandInstance))
		{
			this.logDebug(oFF.XStringUtils.concatenate2("Registering command --> ", newCommandInstance.getCommandSpaceName()));
			this.getCommandManager().registerCommandInstance(newCommandInstance);
		}
	}
	else
	{
		this.logDebug(oFF.XStringUtils.concatenate2("Command plugin already registered and running --> ", commandPluginName));
	}
};
oFF.HuHorizonMainController.prototype._handleStatusChangedInternal = function(controllerStatus)
{
	if (controllerStatus === oFF.HuHorizonControllerStatus.BOOTING)
	{
		this._prepareBoot();
	}
	else if (controllerStatus === oFF.HuHorizonControllerStatus.READY)
	{
		this._controllerReady();
	}
};
oFF.HuHorizonMainController.prototype._prepareBoot = function()
{
	this.logDebug("Init -> Prepare boot...");
	this.getShellController().getMenuManager().setMenuVisible(false);
	this.m_messageManager = oFF.XObjectExt.release(this.m_messageManager);
	this.m_messageManager = oFF.HuHorizonMessageManager.create(this);
	this.m_globalDataSpace = oFF.XObjectExt.release(this.m_globalDataSpace);
	this.m_workspaceManager = oFF.XObjectExt.release(this.m_workspaceManager);
	this.m_horizonConfigManager = oFF.XObjectExt.release(this.m_horizonConfigManager);
	this.m_horizonPluginManager = oFF.XObjectExt.release(this.m_horizonPluginManager);
	this.m_horizonCommandManager = oFF.XObjectExt.release(this.m_horizonCommandManager);
	this.m_stateManager = oFF.XObjectExt.release(this.m_stateManager);
	this.m_uiController = oFF.XObjectExt.release(this.m_uiController);
};
oFF.HuHorizonMainController.prototype._controllerReady = function()
{
	this.logDebug("Init -> Controller ready...");
	this.getMessageManager().setStatus("Ready...");
	this.getShellController().reInitShell();
	this.getUiController().reInitUi();
	this._setInitialStatus();
};
oFF.HuHorizonMainController.prototype._createInvalidPluginMessagesIfNeeded = function()
{
	var invalidPlugins = this.getConfigManager().getPluginsConfiguration().getInvalidPluginNames();
	if (oFF.notNull(invalidPlugins) && invalidPlugins.size() > 0)
	{
		oFF.XCollectionUtils.forEachString(invalidPlugins,  function(invalidPluginName){
			var messageSubtitle = oFF.XStringUtils.concatenate3("The plugin with name ", invalidPluginName, " was not found!");
			this.getMessageManager().addSystemWarningMessage("Invalid plugin!", messageSubtitle, null);
		}.bind(this));
	}
};
oFF.HuHorizonMainController.prototype._setInitialStatus = function()
{
	if (!this.getConfigManager().getPluginsConfiguration().hasStartupViewPlugins())
	{
		this.getMessageManager().setStatus("No startup document or component plugins specified in the configuration...");
	}
};
oFF.HuHorizonMainController.prototype._handleSuccessfulBoot = function()
{
	this.m_activeBootController = oFF.XObjectExt.release(this.m_activeBootController);
	this.setControllerStatus(oFF.HuHorizonControllerStatus.READY);
};

oFF.HuDataSpace = function() {};
oFF.HuDataSpace.prototype = new oFF.XObjectExt();
oFF.HuDataSpace.prototype._ff_c = "HuDataSpace";

oFF.HuDataSpace.create = function()
{
	var contextDataSpace = new oFF.HuDataSpace();
	contextDataSpace.setupSpace();
	return contextDataSpace;
};
oFF.HuDataSpace.prototype.m_structure = null;
oFF.HuDataSpace.prototype.m_objMap = null;
oFF.HuDataSpace.prototype.m_dataSpaceChangedConsumerMap = null;
oFF.HuDataSpace.prototype.m_keyObserverMap = null;
oFF.HuDataSpace.prototype.releaseObject = function()
{
	this.m_structure = oFF.XObjectExt.release(this.m_structure);
	this.m_objMap = oFF.XObjectExt.release(this.m_objMap);
	this.m_dataSpaceChangedConsumerMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_dataSpaceChangedConsumerMap);
	this.m_keyObserverMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_keyObserverMap);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.HuDataSpace.prototype.setupSpace = function()
{
	this.m_structure = oFF.PrFactory.createStructure();
	this.m_objMap = oFF.XHashMapByString.create();
	this.m_dataSpaceChangedConsumerMap = oFF.XHashMapByString.create();
	this.m_keyObserverMap = oFF.XHashMapByString.create();
};
oFF.HuDataSpace.prototype.addSpaceChangedListener = function(listener)
{
	if (oFF.notNull(listener))
	{
		var listenerUuid = oFF.XGuid.getGuid();
		listenerUuid = oFF.XStringUtils.concatenate2("dsChanged_", listenerUuid);
		this.m_dataSpaceChangedConsumerMap.put(listenerUuid, oFF.XConsumerHolder.create(listener));
		return listenerUuid;
	}
	return null;
};
oFF.HuDataSpace.prototype.removeSpaceChangedListener = function(listener)
{
	oFF.XCollectionUtils.removeFromMapIf(this.m_dataSpaceChangedConsumerMap,  function(key, value){
		return value.getConsumer() === listener;
	}.bind(this));
};
oFF.HuDataSpace.prototype.removeSpaceChangedListenerByUuid = function(listenerUuid)
{
	this.m_dataSpaceChangedConsumerMap.remove(listenerUuid);
};
oFF.HuDataSpace.prototype.addKeyObserver = function(key, callback)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(key) && oFF.notNull(callback))
	{
		if (!this.m_keyObserverMap.containsKey(key))
		{
			this.m_keyObserverMap.put(key, oFF.XHashMapByString.create());
		}
		var observerUuid = oFF.XGuid.getGuid();
		observerUuid = oFF.XStringUtils.concatenate4("dsObserver_", key, "_", observerUuid);
		this.m_keyObserverMap.getByKey(key).put(observerUuid, oFF.XProcedureHolder.create(callback));
		return observerUuid;
	}
	return null;
};
oFF.HuDataSpace.prototype.removeKeyObserver = function(callback)
{
	oFF.XCollectionUtils.forEach(this.m_keyObserverMap.getValuesAsReadOnlyList(),  function(keyMap){
		oFF.XCollectionUtils.removeFromMapIf(keyMap,  function(key, value){
			return value.getProcedure() === callback;
		}.bind(this));
	}.bind(this));
};
oFF.HuDataSpace.prototype.removeKeyObserverByUuid = function(observerUuid)
{
	oFF.XCollectionUtils.forEach(this.m_keyObserverMap,  function(keyMap){
		if (keyMap.containsKey(observerUuid))
		{
			keyMap.remove(observerUuid);
		}
	}.bind(this));
};
oFF.HuDataSpace.prototype.containsKey = function(key)
{
	return this.m_structure.containsKey(key) || this.m_objMap.containsKey(key);
};
oFF.HuDataSpace.prototype.remove = function(key)
{
	if (this.m_structure.containsKey(key))
	{
		this.m_structure.remove(key);
		this._fireDataSpaceChangedEvent(key);
	}
	else if (this.m_objMap.containsKey(key))
	{
		this.m_objMap.remove(key);
		this._fireDataSpaceChangedEvent(key);
	}
};
oFF.HuDataSpace.prototype.getStringByKey = function(name)
{
	return this.m_structure.getStringByKey(name);
};
oFF.HuDataSpace.prototype.getStringByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getStringByKeyExt(name, defaultValue);
};
oFF.HuDataSpace.prototype.getIntegerByKey = function(name)
{
	return this.m_structure.getIntegerByKey(name);
};
oFF.HuDataSpace.prototype.getIntegerByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getIntegerByKeyExt(name, defaultValue);
};
oFF.HuDataSpace.prototype.getLongByKey = function(name)
{
	return this.m_structure.getLongByKey(name);
};
oFF.HuDataSpace.prototype.getLongByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getLongByKeyExt(name, defaultValue);
};
oFF.HuDataSpace.prototype.getDoubleByKey = function(name)
{
	return this.m_structure.getDoubleByKey(name);
};
oFF.HuDataSpace.prototype.getDoubleByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getDoubleByKeyExt(name, defaultValue);
};
oFF.HuDataSpace.prototype.getBooleanByKey = function(name)
{
	return this.m_structure.getBooleanByKey(name);
};
oFF.HuDataSpace.prototype.getBooleanByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getBooleanByKeyExt(name, defaultValue);
};
oFF.HuDataSpace.prototype.hasNullByKey = function(name)
{
	return this.m_structure.hasNullByKey(name);
};
oFF.HuDataSpace.prototype.getXObjectByKey = function(name)
{
	return this.m_objMap.getByKey(name);
};
oFF.HuDataSpace.prototype.getXObjectByKeyExt = function(name, defaultValue)
{
	var tmpObj = this.m_objMap.getByKey(name);
	if (oFF.notNull(tmpObj))
	{
		return tmpObj;
	}
	return defaultValue;
};
oFF.HuDataSpace.prototype.putString = function(name, stringValue)
{
	this.m_structure.putString(name, stringValue);
	this._fireDataSpaceChangedEvent(name);
};
oFF.HuDataSpace.prototype.putStringNotNull = function(name, stringValue)
{
	this.m_structure.putStringNotNull(name, stringValue);
	this._fireDataSpaceChangedEvent(name);
};
oFF.HuDataSpace.prototype.putStringNotNullAndNotEmpty = function(name, stringValue)
{
	this.m_structure.putStringNotNullAndNotEmpty(name, stringValue);
	this._fireDataSpaceChangedEvent(name);
};
oFF.HuDataSpace.prototype.putInteger = function(name, intValue)
{
	this.m_structure.putInteger(name, intValue);
	this._fireDataSpaceChangedEvent(name);
};
oFF.HuDataSpace.prototype.putLong = function(name, longValue)
{
	this.m_structure.putLong(name, longValue);
	this._fireDataSpaceChangedEvent(name);
};
oFF.HuDataSpace.prototype.putDouble = function(name, doubleValue)
{
	this.m_structure.putDouble(name, doubleValue);
	this._fireDataSpaceChangedEvent(name);
};
oFF.HuDataSpace.prototype.putBoolean = function(key, booleanValue)
{
	this.m_structure.putBoolean(key, booleanValue);
	this._fireDataSpaceChangedEvent(key);
};
oFF.HuDataSpace.prototype.putNull = function(name)
{
	this.m_structure.putNull(name);
	this._fireDataSpaceChangedEvent(name);
};
oFF.HuDataSpace.prototype.putXObject = function(name, objValue)
{
	this.m_objMap.put(name, objValue);
	this._fireDataSpaceChangedEvent(name);
};
oFF.HuDataSpace.prototype._fireDataSpaceChangedEvent = function(changedKey)
{
	var tmpKeyMap = this.m_keyObserverMap.getByKey(changedKey);
	if (oFF.notNull(tmpKeyMap) && tmpKeyMap.size() > 0)
	{
		oFF.XCollectionUtils.forEach(tmpKeyMap.getValuesAsReadOnlyList(),  function(tmpCallback){
			tmpCallback.execute();
		}.bind(this));
	}
	oFF.XCollectionUtils.forEach(this.m_dataSpaceChangedConsumerMap.getValuesAsReadOnlyList(),  function(tmpListener){
		tmpListener.accept(changedKey);
	}.bind(this));
};

oFF.HuDfHorizonUiManager = function() {};
oFF.HuDfHorizonUiManager.prototype = new oFF.HuDfHorizonManager();
oFF.HuDfHorizonUiManager.prototype._ff_c = "HuDfHorizonUiManager";

oFF.HuDfHorizonUiManager.prototype.m_genesis = null;
oFF.HuDfHorizonUiManager.prototype.releaseObject = function()
{
	this.m_genesis = null;
	oFF.HuDfHorizonManager.prototype.releaseObject.call( this );
};
oFF.HuDfHorizonUiManager.prototype.setupManagerWithGenesis = function(toolContext, genesis)
{
	this.m_genesis = genesis;
	this.setupWithToolsContext(toolContext);
};
oFF.HuDfHorizonUiManager.prototype.getGenesis = function()
{
	return this.m_genesis;
};

oFF.HuDfHorizonPluginController = function() {};
oFF.HuDfHorizonPluginController.prototype = new oFF.XObjectExt();
oFF.HuDfHorizonPluginController.prototype._ff_c = "HuDfHorizonPluginController";

oFF.HuDfHorizonPluginController.prototype.m_uuid = null;
oFF.HuDfHorizonPluginController.prototype.m_pluginSubApplication = null;
oFF.HuDfHorizonPluginController.prototype.m_pluginProcess = null;
oFF.HuDfHorizonPluginController.prototype.m_pluginDefRef = null;
oFF.HuDfHorizonPluginController.prototype.m_pluginInstance = null;
oFF.HuDfHorizonPluginController.prototype.m_parentController = null;
oFF.HuDfHorizonPluginController.prototype.m_configJson = null;
oFF.HuDfHorizonPluginController.prototype.m_dataSpaceChangedUuidList = null;
oFF.HuDfHorizonPluginController.prototype.m_pluginStorage = null;
oFF.HuDfHorizonPluginController.prototype.releaseObject = function()
{
	this._getPluginInstance().destroyPlugin();
	this._cleanUpDataSpaceListeners();
	this._destroySpecificPlugin();
	this.m_pluginDefRef = null;
	this.m_parentController = null;
	this.m_configJson = oFF.XObjectExt.release(this.m_configJson);
	this.m_pluginStorage = oFF.XObjectExt.release(this.m_pluginStorage);
	this.m_pluginSubApplication = oFF.XObjectExt.release(this.m_pluginSubApplication);
	this.m_pluginProcess = oFF.XObjectExt.release(this.m_pluginProcess);
	this.m_pluginInstance = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.HuDfHorizonPluginController.prototype.getProcess = function()
{
	return this.m_pluginProcess;
};
oFF.HuDfHorizonPluginController.prototype.getSession = function()
{
	return this.getProcess();
};
oFF.HuDfHorizonPluginController.prototype.getApplication = function()
{
	return this.m_pluginSubApplication;
};
oFF.HuDfHorizonPluginController.prototype.getLocalStorage = function()
{
	return this._getParentController().getLocalStorage();
};
oFF.HuDfHorizonPluginController.prototype.getLocalNotificationCenter = function()
{
	return this._getParentController().getLocalNotificationCenter();
};
oFF.HuDfHorizonPluginController.prototype.getLogger = function()
{
	return this._getParentController().getLogger();
};
oFF.HuDfHorizonPluginController.prototype.getLogContextName = function()
{
	return "Plugin";
};
oFF.HuDfHorizonPluginController.prototype.logInfo = function(logline)
{
	this.getLogger().logInfo(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuDfHorizonPluginController.prototype.logDebug = function(logline)
{
	this.getLogger().logDebug(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuDfHorizonPluginController.prototype.getConfigJson = function()
{
	if (oFF.isNull(this.m_configJson))
	{
		this.m_configJson = oFF.PrFactory.createStructure();
	}
	return this.m_configJson;
};
oFF.HuDfHorizonPluginController.prototype.executeAction = function(actionId, customData)
{
	if (this._getParentController() !== null)
	{
		return this._getParentController().getMainController().getCommandManager().executeAction(actionId, this, customData);
	}
	return oFF.XPromise.reject(oFF.XError.create("Critical error during action execution!"));
};
oFF.HuDfHorizonPluginController.prototype.addDataSpaceChangedListener = function(listener)
{
	if (oFF.isNull(this.m_dataSpaceChangedUuidList))
	{
		this.m_dataSpaceChangedUuidList = oFF.XListOfString.create();
	}
	var listenerUuid = this._getDataSpaceBase().addSpaceChangedListener(listener);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(listenerUuid))
	{
		this.m_dataSpaceChangedUuidList.add(listenerUuid);
	}
	return listenerUuid;
};
oFF.HuDfHorizonPluginController.prototype.removeDataSpaceChangedListener = function(listenerUuid)
{
	this._getDataSpaceBase().removeSpaceChangedListenerByUuid(listenerUuid);
	if (oFF.notNull(this.m_dataSpaceChangedUuidList))
	{
		this.m_dataSpaceChangedUuidList.removeElement(listenerUuid);
	}
};
oFF.HuDfHorizonPluginController.prototype.actionExists = function(actionId)
{
	if (this._getParentController() !== null)
	{
		return this._getParentController().getMainController().getCommandManager().actionExists(actionId);
	}
	return false;
};
oFF.HuDfHorizonPluginController.prototype.getAllActionIds = function()
{
	if (this._getParentController() !== null)
	{
		return this._getParentController().getMainController().getCommandManager().getAllActionIds();
	}
	return oFF.XListOfString.create();
};
oFF.HuDfHorizonPluginController.prototype.getMainController = function()
{
	return this._getParentController().getMainController();
};
oFF.HuDfHorizonPluginController.prototype.getUuid = function()
{
	return this.m_uuid;
};
oFF.HuDfHorizonPluginController.prototype.getName = function()
{
	return this._getPluginDef().getName();
};
oFF.HuDfHorizonPluginController.prototype.getDescription = function()
{
	return this._getPluginDef().getDescription();
};
oFF.HuDfHorizonPluginController.prototype.getDisplayName = function()
{
	return this._getPluginDef().getDisplayName();
};
oFF.HuDfHorizonPluginController.prototype.getPluginCategory = function()
{
	return this._getPluginDef().getPluginCategory();
};
oFF.HuDfHorizonPluginController.prototype.getDataSpace = function()
{
	return this._getParentController().getDataSpace();
};
oFF.HuDfHorizonPluginController.prototype.getPluginStorage = function()
{
	return this.m_pluginStorage;
};
oFF.HuDfHorizonPluginController.prototype.addInfoMessage = function(title, subtitle, description)
{
	this.getMainController().getMessageManager().addInfoMessage(title, subtitle, description, this._getPluginMessageGroup());
};
oFF.HuDfHorizonPluginController.prototype.addSuccessMessage = function(title, subtitle, description)
{
	this.getMainController().getMessageManager().addSuccessMessage(title, subtitle, description, this._getPluginMessageGroup());
};
oFF.HuDfHorizonPluginController.prototype.addWarningMessage = function(title, subtitle, description)
{
	this.getMainController().getMessageManager().addWarningMessage(title, subtitle, description, this._getPluginMessageGroup());
};
oFF.HuDfHorizonPluginController.prototype.addErrorMessage = function(title, subtitle, description)
{
	this.getMainController().getMessageManager().addErrorMessage(title, subtitle, description, this._getPluginMessageGroup());
};
oFF.HuDfHorizonPluginController.prototype.setParentController = function(parentController)
{
	if (oFF.isNull(this.m_parentController) && oFF.notNull(parentController))
	{
		this.m_parentController = parentController;
	}
};
oFF.HuDfHorizonPluginController.prototype.setPluginInstance = function(pluginInstance)
{
	if (oFF.isNull(this.m_pluginInstance) && oFF.notNull(pluginInstance))
	{
		this.m_pluginInstance = pluginInstance;
	}
};
oFF.HuDfHorizonPluginController.prototype.setPluginDef = function(pluginDef)
{
	if (oFF.isNull(this.m_pluginDefRef) && oFF.notNull(pluginDef))
	{
		this.m_pluginDefRef = pluginDef;
	}
};
oFF.HuDfHorizonPluginController.prototype.setConfigJson = function(configJson)
{
	if (oFF.isNull(this.m_configJson) && oFF.notNull(configJson))
	{
		this.m_configJson = configJson.clone();
	}
};
oFF.HuDfHorizonPluginController.prototype.run = function()
{
	if (oFF.isNull(this.m_parentController) || oFF.isNull(this.m_pluginInstance))
	{
		throw oFF.XException.createRuntimeException("Failed to run plugin! Missing parent controller or plugin instance!");
	}
	if (oFF.isNull(this.m_uuid))
	{
		this.m_uuid = oFF.XGuid.getGuid();
		this.m_pluginStorage = oFF.HuPluginDataStorage.create(null);
		this._createSubProcess();
		this._initSpecificPlugin();
		try
		{
			this._getPluginInstance().processConfig(this.getConfigJson());
			var setupPromise = this._setupSpecificPlugin();
			if (oFF.isNull(setupPromise))
			{
				this._runSpecificPlugin();
			}
			else
			{
				this._setPluginUiBusy(true);
				setupPromise.onCatch( function(error){
					this._handlePluginSetupError(error);
				}.bind(this)).onFinally( function(){
					this._setPluginUiBusy(false);
					this._runSpecificPlugin();
				}.bind(this));
			}
		}
		catch (err)
		{
			this._handlePluginStartupException(oFF.XError.createWithThrowable(err));
		}
		this._postPluginStartedNotification();
	}
	else
	{
		throw oFF.XException.createRuntimeException("Ilegal state! The plugin is already running.");
	}
};
oFF.HuDfHorizonPluginController.prototype.kill = function()
{
	this.releaseObject();
};
oFF.HuDfHorizonPluginController.prototype._getPluginDef = function()
{
	return this.m_pluginDefRef;
};
oFF.HuDfHorizonPluginController.prototype._getParentController = function()
{
	return this.m_parentController;
};
oFF.HuDfHorizonPluginController.prototype._getPluginInstance = function()
{
	return this.m_pluginInstance;
};
oFF.HuDfHorizonPluginController.prototype._createSubProcess = function()
{
	var mainApplication = this._getParentController().getProcess().getApplication();
	var newProcess = this._getParentController().getProcess().newChildProcess(oFF.ProcessType.PLUGIN);
	newProcess.setDescription(this.getName());
	this.m_pluginProcess = newProcess;
	this.m_pluginSubApplication = mainApplication.newSubApplication(this.m_pluginProcess);
	newProcess.registerOnEvent(oFF.ProcessEventLambdaListener.create( function(event, eventType){
		if (eventType === oFF.ProcessEventType.TERMINATED)
		{
			this.m_pluginProcess = null;
			this.kill();
		}
	}.bind(this)));
};
oFF.HuDfHorizonPluginController.prototype._getDataSpaceBase = function()
{
	return this.getDataSpace();
};
oFF.HuDfHorizonPluginController.prototype._postPluginStartedNotification = function()
{
	var pluginStartedNotificationData = oFF.XNotificationData.create();
	pluginStartedNotificationData.putString(oFF.HuHorizonInternalNotifications.PLUGIN_STARTED_PLUGIN_NAME_NOTIFI_DATA, this.getName());
	pluginStartedNotificationData.putXObject(oFF.HuHorizonInternalNotifications.PLUGIN_STARTED_PLUGIN_TYPE_NOTIFI_DATA, this.getPluginType());
	this.getLocalNotificationCenter().postNotificationWithName(oFF.HuHorizonInternalNotifications.PLUGIN_STARTED, pluginStartedNotificationData);
};
oFF.HuDfHorizonPluginController.prototype._handlePluginStartupException = function(error)
{
	this.addErrorMessage("Startup failed!", "Error during plugin startup!", error.getText());
	oFF.XLogger.println(oFF.XException.getStackTrace(error.getThrowable(), 0));
};
oFF.HuDfHorizonPluginController.prototype._cleanUpDataSpaceListeners = function()
{
	if (oFF.notNull(this.m_dataSpaceChangedUuidList) && this.m_dataSpaceChangedUuidList.size() > 0)
	{
		if (this._getDataSpaceBase() !== null)
		{
			oFF.XCollectionUtils.forEachString(this.m_dataSpaceChangedUuidList,  function(listnerUuid){
				this._getDataSpaceBase().removeSpaceChangedListenerByUuid(listnerUuid);
			}.bind(this));
		}
		this.m_dataSpaceChangedUuidList.clear();
	}
	this.m_dataSpaceChangedUuidList = oFF.XObjectExt.release(this.m_dataSpaceChangedUuidList);
};
oFF.HuDfHorizonPluginController.prototype._getPluginMessageGroup = function()
{
	return oFF.HuMessageGroup.createForPluginNameIfNecessary(this.getName(), this.getDisplayName());
};
oFF.HuDfHorizonPluginController.prototype._handlePluginSetupError = function(setupError)
{
	this.addErrorMessage("Setup failed!", "Error during plugin setup!", setupError.getText());
};

oFF.HuHorizonDfPopup = function() {};
oFF.HuHorizonDfPopup.prototype = new oFF.DfUiPopup();
oFF.HuHorizonDfPopup.prototype._ff_c = "HuHorizonDfPopup";

oFF.HuHorizonDfPopup.prototype.m_controller = null;
oFF.HuHorizonDfPopup.prototype.releaseObject = function()
{
	this.m_controller = null;
	oFF.DfUiPopup.prototype.releaseObject.call( this );
};
oFF.HuHorizonDfPopup.prototype.setupPopup = function(genesis)
{
	oFF.DfUiPopup.prototype.setupPopup.call( this , genesis);
};
oFF.HuHorizonDfPopup.prototype.setupWithController = function(controller)
{
	this.m_controller = controller;
	this.setupPopup(controller.getGenesis());
};
oFF.HuHorizonDfPopup.prototype.getGenericController = function()
{
	return this.m_controller;
};

oFF.HuPluginDataStorage = function() {};
oFF.HuPluginDataStorage.prototype = new oFF.XObject();
oFF.HuPluginDataStorage.prototype._ff_c = "HuPluginDataStorage";

oFF.HuPluginDataStorage.create = function(storageFile)
{
	var pluginStorage = new oFF.HuPluginDataStorage();
	pluginStorage.setupStorage(storageFile);
	return pluginStorage;
};
oFF.HuPluginDataStorage.prototype.m_storageFile = null;
oFF.HuPluginDataStorage.prototype.m_structure = null;
oFF.HuPluginDataStorage.prototype.releaseObject = function()
{
	this.m_structure = oFF.XObjectExt.release(this.m_structure);
	this.m_storageFile = oFF.XObjectExt.release(this.m_storageFile);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.HuPluginDataStorage.prototype.setupStorage = function(storageFile)
{
	this.m_storageFile = storageFile;
	this.m_structure = oFF.PrFactory.createStructure();
};
oFF.HuPluginDataStorage.prototype.save = function()
{
	return null;
};
oFF.HuPluginDataStorage.prototype.clearStorage = function()
{
	this.m_structure.clear();
	this.savePluginStorageInternal();
};
oFF.HuPluginDataStorage.prototype.hasData = function()
{
	return this.m_structure.hasElements();
};
oFF.HuPluginDataStorage.prototype.getStringByKey = function(name)
{
	return this.m_structure.getStringByKey(name);
};
oFF.HuPluginDataStorage.prototype.getStringByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getStringByKeyExt(name, defaultValue);
};
oFF.HuPluginDataStorage.prototype.getIntegerByKey = function(name)
{
	return this.m_structure.getIntegerByKey(name);
};
oFF.HuPluginDataStorage.prototype.getIntegerByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getIntegerByKeyExt(name, defaultValue);
};
oFF.HuPluginDataStorage.prototype.getLongByKey = function(name)
{
	return this.m_structure.getLongByKey(name);
};
oFF.HuPluginDataStorage.prototype.getLongByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getLongByKeyExt(name, defaultValue);
};
oFF.HuPluginDataStorage.prototype.getDoubleByKey = function(name)
{
	return this.m_structure.getDoubleByKey(name);
};
oFF.HuPluginDataStorage.prototype.getDoubleByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getDoubleByKeyExt(name, defaultValue);
};
oFF.HuPluginDataStorage.prototype.getBooleanByKey = function(name)
{
	return this.m_structure.getBooleanByKey(name);
};
oFF.HuPluginDataStorage.prototype.getBooleanByKeyExt = function(name, defaultValue)
{
	return this.m_structure.getBooleanByKeyExt(name, defaultValue);
};
oFF.HuPluginDataStorage.prototype.hasNullByKey = function(name)
{
	return this.m_structure.hasNullByKey(name);
};
oFF.HuPluginDataStorage.prototype.putString = function(name, stringValue)
{
	this.m_structure.putString(name, stringValue);
	this.savePluginStorageInternal();
};
oFF.HuPluginDataStorage.prototype.putStringNotNull = function(name, stringValue)
{
	this.m_structure.putStringNotNull(name, stringValue);
	this.savePluginStorageInternal();
};
oFF.HuPluginDataStorage.prototype.putStringNotNullAndNotEmpty = function(name, stringValue)
{
	this.m_structure.putStringNotNullAndNotEmpty(name, stringValue);
	this.savePluginStorageInternal();
};
oFF.HuPluginDataStorage.prototype.putInteger = function(name, intValue)
{
	this.m_structure.putInteger(name, intValue);
	this.savePluginStorageInternal();
};
oFF.HuPluginDataStorage.prototype.putLong = function(name, longValue)
{
	this.m_structure.putLong(name, longValue);
	this.savePluginStorageInternal();
};
oFF.HuPluginDataStorage.prototype.putDouble = function(name, doubleValue)
{
	this.m_structure.putDouble(name, doubleValue);
	this.savePluginStorageInternal();
};
oFF.HuPluginDataStorage.prototype.putBoolean = function(key, booleanValue)
{
	this.m_structure.putBoolean(key, booleanValue);
	this.savePluginStorageInternal();
};
oFF.HuPluginDataStorage.prototype.putNull = function(name)
{
	this.m_structure.putNull(name);
	this.savePluginStorageInternal();
};
oFF.HuPluginDataStorage.prototype.savePluginStorageInternal = function() {};

oFF.HuDfSubController = function() {};
oFF.HuDfSubController.prototype = new oFF.XObjectExt();
oFF.HuDfSubController.prototype._ff_c = "HuDfSubController";

oFF.HuDfSubController.prototype.m_mainController = null;
oFF.HuDfSubController.prototype.releaseObject = function()
{
	this.m_mainController = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.HuDfSubController.prototype.setupWithMainController = function(mainController)
{
	this.m_mainController = mainController;
	this.setupController();
};
oFF.HuDfSubController.prototype.getMainController = function()
{
	return this.m_mainController;
};
oFF.HuDfSubController.prototype.getGenesis = function()
{
	return this.getMainController().getGenesis();
};
oFF.HuDfSubController.prototype.getProcess = function()
{
	return this.getMainController().getProcess();
};
oFF.HuDfSubController.prototype.getSession = function()
{
	return this.getMainController().getSession();
};
oFF.HuDfSubController.prototype.getLocalStorage = function()
{
	return this.getMainController().getLocalStorage();
};
oFF.HuDfSubController.prototype.getLocalNotificationCenter = function()
{
	return this.getMainController().getLocalNotificationCenter();
};
oFF.HuDfSubController.prototype.getLogger = function()
{
	return this.getMainController().getLogger();
};
oFF.HuDfSubController.prototype.getLogContextName = function()
{
	return this.getControllerName();
};
oFF.HuDfSubController.prototype.logInfo = function(logline)
{
	this.getLogger().logInfo(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuDfSubController.prototype.logDebug = function(logline)
{
	this.getLogger().logDebug(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuDfSubController.prototype.getDebugService = function()
{
	return this.getMainController().getDebugService();
};
oFF.HuDfSubController.prototype.isDebugMode = function()
{
	return this.getDebugService().isDebugModeEnabled();
};
oFF.HuDfSubController.prototype.getMainGenesis = function()
{
	return this.getMainController().getProgramInstance().getGenesis();
};

oFF.HuHorizonCommandManager = function() {};
oFF.HuHorizonCommandManager.prototype = new oFF.HuDfHorizonManager();
oFF.HuHorizonCommandManager.prototype._ff_c = "HuHorizonCommandManager";

oFF.HuHorizonCommandManager.create = function(toolsContext)
{
	var newInstance = new oFF.HuHorizonCommandManager();
	newInstance.setupWithToolsContext(toolsContext);
	return newInstance;
};
oFF.HuHorizonCommandManager.prototype.m_registeredCommandPlugins = null;
oFF.HuHorizonCommandManager.prototype.releaseObject = function()
{
	this.m_registeredCommandPlugins.clear();
	this.m_registeredCommandPlugins = oFF.XObjectExt.release(this.m_registeredCommandPlugins);
	oFF.HuDfHorizonManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonCommandManager.prototype.setupManager = function()
{
	this.m_registeredCommandPlugins = oFF.XHashMapByString.create();
};
oFF.HuHorizonCommandManager.prototype.getManagerName = function()
{
	return "Command Manager";
};
oFF.HuHorizonCommandManager.prototype.registerCommandInstance = function(commandPluginInstance)
{
	if (oFF.notNull(commandPluginInstance))
	{
		var commandSpaceName = commandPluginInstance.getCommandSpaceName();
		if (!this.m_registeredCommandPlugins.containsKey(commandSpaceName))
		{
			this.m_registeredCommandPlugins.put(commandPluginInstance.getCommandSpaceName(), commandPluginInstance);
		}
	}
};
oFF.HuHorizonCommandManager.prototype.executeAction = function(actionId, context, customData)
{
	var executionError = "Unknown error during action execution!";
	var isValid = this._validateActionId(actionId);
	if (isValid)
	{
		var commandSpace = this._getCommandSpace(actionId);
		var tmpCommandPlugin = this.m_registeredCommandPlugins.getByKey(commandSpace);
		if (oFF.notNull(tmpCommandPlugin))
		{
			var actionName = this._getActionName(actionId);
			if (tmpCommandPlugin.hasAction(actionName))
			{
				var commandPromise = tmpCommandPlugin.executeCommandSpaceAction(actionName, context, customData);
				if (oFF.isNull(commandPromise))
				{
					commandPromise = oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
				}
				return commandPromise;
			}
			else
			{
				executionError = oFF.XStringUtils.concatenate4("Action ", actionName, " not found on command space ", commandSpace);
			}
		}
		else
		{
			executionError = oFF.XStringUtils.concatenate2("Command space not found: ", commandSpace);
		}
	}
	else
	{
		executionError = oFF.XStringUtils.concatenate2("Invalid action id: ", actionId);
	}
	this.logInfo(executionError);
	return oFF.XPromise.reject(oFF.XError.create(executionError));
};
oFF.HuHorizonCommandManager.prototype.getAllRunningCommandSpaces = function()
{
	return this.m_registeredCommandPlugins.getKeysAsReadOnlyListOfString();
};
oFF.HuHorizonCommandManager.prototype.isCommandSpaceRegistered = function(commandPluginName)
{
	return this.m_registeredCommandPlugins.containsKey(commandPluginName);
};
oFF.HuHorizonCommandManager.prototype.actionExists = function(actionId)
{
	var isValid = this._validateActionId(actionId);
	if (isValid)
	{
		var commandSpace = this._getCommandSpace(actionId);
		var tmpCommandPlugin = this.m_registeredCommandPlugins.getByKey(commandSpace);
		if (oFF.notNull(tmpCommandPlugin))
		{
			var actionName = this._getActionName(actionId);
			if (tmpCommandPlugin.hasAction(actionName))
			{
				return true;
			}
		}
	}
	return false;
};
oFF.HuHorizonCommandManager.prototype.getAllActionIds = function()
{
	var actionIdsList = oFF.XListOfString.create();
	oFF.XCollectionUtils.forEach(this.m_registeredCommandPlugins.getValuesAsReadOnlyList(),  function(commandPlugin){
		actionIdsList.addAll(commandPlugin.getAllActionNames());
	}.bind(this));
	return actionIdsList;
};
oFF.HuHorizonCommandManager.prototype._validateActionId = function(actionId)
{
	var result = oFF.XStringTokenizer.splitString(actionId, ".");
	return oFF.notNull(result) && result.size() === 2;
};
oFF.HuHorizonCommandManager.prototype._getCommandSpace = function(actionId)
{
	var result = oFF.XStringTokenizer.splitString(actionId, ".");
	if (oFF.notNull(result) && result.size() === 2)
	{
		return result.get(0);
	}
	return null;
};
oFF.HuHorizonCommandManager.prototype._getActionName = function(actionId)
{
	var result = oFF.XStringTokenizer.splitString(actionId, ".");
	if (oFF.notNull(result) && result.size() === 2)
	{
		return result.get(1);
	}
	return null;
};

oFF.HuHorizonConfigManager = function() {};
oFF.HuHorizonConfigManager.prototype = new oFF.HuDfHorizonManager();
oFF.HuHorizonConfigManager.prototype._ff_c = "HuHorizonConfigManager";

oFF.HuHorizonConfigManager.create = function(toolsContext, configStruct)
{
	var newInstance = new oFF.HuHorizonConfigManager();
	newInstance.setupWithToolsContext(toolsContext);
	newInstance.processJson(configStruct);
	return newInstance;
};
oFF.HuHorizonConfigManager.prototype.m_configJson = null;
oFF.HuHorizonConfigManager.prototype.m_configurationProcessor = null;
oFF.HuHorizonConfigManager.prototype.m_pluginConfigProcessor = null;
oFF.HuHorizonConfigManager.prototype.m_toolbarConfigProcessor = null;
oFF.HuHorizonConfigManager.prototype.releaseObject = function()
{
	this.m_pluginConfigProcessor = oFF.XObjectExt.release(this.m_pluginConfigProcessor);
	this.m_configurationProcessor = oFF.XObjectExt.release(this.m_configurationProcessor);
	this.m_toolbarConfigProcessor = oFF.XObjectExt.release(this.m_toolbarConfigProcessor);
	this.m_configJson = oFF.XObjectExt.release(this.m_configJson);
	oFF.HuDfHorizonManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonConfigManager.prototype.setupManager = function() {};
oFF.HuHorizonConfigManager.prototype.processJson = function(configStruct)
{
	if (oFF.isNull(configStruct))
	{
		this.m_configJson = oFF.PrFactory.createStructure();
		this.setupEmptyConfig();
	}
	else
	{
		this.m_configJson = configStruct.clone();
		this.validateExistingConfig();
	}
	this.m_configurationProcessor = oFF.HuConfigurationGeneralProcessor.create(this.getLogger(), this.getConfigurationSection());
	this.m_toolbarConfigProcessor = oFF.HuConfigurationToolbarProcessor.create(this.getLogger(), this.getToolbarSection());
};
oFF.HuHorizonConfigManager.prototype.getManagerName = function()
{
	return "Config Manager";
};
oFF.HuHorizonConfigManager.prototype.getSaveContent = function()
{
	var jsonString = oFF.PrUtils.serialize(this.getJson(), false, true, 2);
	return oFF.XContent.createStringContent(oFF.ContentType.JSON, jsonString);
};
oFF.HuHorizonConfigManager.prototype.getJson = function()
{
	return this.m_configJson;
};
oFF.HuHorizonConfigManager.prototype.getProgramConfiguration = function()
{
	return this.m_configurationProcessor;
};
oFF.HuHorizonConfigManager.prototype.processPluginConfiguration = function()
{
	this.m_pluginConfigProcessor = oFF.HuConfigurationPluginsProcessor.create(this.getLogger(), this.getPluginsSection(), this.getCommandsSection());
};
oFF.HuHorizonConfigManager.prototype.getPluginsConfiguration = function()
{
	return this.m_pluginConfigProcessor;
};
oFF.HuHorizonConfigManager.prototype.getToolbarConfiguration = function()
{
	return this.m_toolbarConfigProcessor;
};
oFF.HuHorizonConfigManager.prototype.setupEmptyConfig = function()
{
	this.validateExistingConfig();
};
oFF.HuHorizonConfigManager.prototype.validateExistingConfig = function()
{
	if (!this.m_configJson.containsKey(oFF.HuHorizonConfigConstants.CONFIGIGURATION_SECTION))
	{
		this.m_configJson.putNewStructure(oFF.HuHorizonConfigConstants.CONFIGIGURATION_SECTION);
	}
	if (!this.m_configJson.containsKey(oFF.HuHorizonConfigConstants.PLUGINS_SECTION))
	{
		this.m_configJson.putNewList(oFF.HuHorizonConfigConstants.PLUGINS_SECTION);
	}
	if (!this.m_configJson.containsKey(oFF.HuHorizonConfigConstants.COMMANDS_SECTION))
	{
		this.m_configJson.putNewList(oFF.HuHorizonConfigConstants.COMMANDS_SECTION);
	}
	if (!this.m_configJson.containsKey(oFF.HuHorizonConfigConstants.TOOLBAR_SECTION))
	{
		this.m_configJson.putNewList(oFF.HuHorizonConfigConstants.TOOLBAR_SECTION);
	}
};
oFF.HuHorizonConfigManager.prototype.getConfigurationSection = function()
{
	return this.getJson().getStructureByKey(oFF.HuHorizonConfigConstants.CONFIGIGURATION_SECTION);
};
oFF.HuHorizonConfigManager.prototype.getPluginsSection = function()
{
	return this.getJson().getByKey(oFF.HuHorizonConfigConstants.PLUGINS_SECTION);
};
oFF.HuHorizonConfigManager.prototype.getCommandsSection = function()
{
	return this.getJson().getByKey(oFF.HuHorizonConfigConstants.COMMANDS_SECTION);
};
oFF.HuHorizonConfigManager.prototype.getToolbarSection = function()
{
	return this.getJson().getByKey(oFF.HuHorizonConfigConstants.TOOLBAR_SECTION);
};

oFF.HuHorizonMenuManager = function() {};
oFF.HuHorizonMenuManager.prototype = new oFF.HuDfHorizonManager();
oFF.HuHorizonMenuManager.prototype._ff_c = "HuHorizonMenuManager";

oFF.HuHorizonMenuManager.create = function(toolsContext, programInstance)
{
	var newInstance = new oFF.HuHorizonMenuManager();
	newInstance.setupWithToolsContext(toolsContext);
	newInstance.setProgramInstance(programInstance);
	return newInstance;
};
oFF.HuHorizonMenuManager.prototype.m_programInstance = null;
oFF.HuHorizonMenuManager.prototype.m_menuButtons = null;
oFF.HuHorizonMenuManager.prototype.releaseObject = function()
{
	this.m_menuButtons = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_menuButtons);
	this.clearMenuButtons();
	this.m_programInstance = null;
	oFF.HuDfHorizonManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonMenuManager.prototype.setupManager = function()
{
	this.m_menuButtons = oFF.XList.create();
};
oFF.HuHorizonMenuManager.prototype.setProgramInstance = function(programInstance)
{
	this.m_programInstance = programInstance;
};
oFF.HuHorizonMenuManager.prototype.getManagerName = function()
{
	return "Menu Manager";
};
oFF.HuHorizonMenuManager.prototype.setMenuVisible = function(visible)
{
	this.getProgramInstance().setProgramMenuVisible(visible);
};
oFF.HuHorizonMenuManager.prototype.isMenuVisible = function()
{
	return this.getProgramInstance().isProgramMenuVisible();
};
oFF.HuHorizonMenuManager.prototype.clearMenuButtons = function()
{
	this.getMenuControl().clearItems();
};
oFF.HuHorizonMenuManager.prototype.addMenuButton = function(text, icon, pressConsumer)
{
	var tmpButton = this.getProgramInstance().addProgramMenuButton(text, icon, pressConsumer);
	this.m_menuButtons.add(tmpButton);
	return tmpButton;
};
oFF.HuHorizonMenuManager.prototype.getAllMenuButtons = function()
{
	return this.m_menuButtons;
};
oFF.HuHorizonMenuManager.prototype.getProgramInstance = function()
{
	return this.m_programInstance;
};
oFF.HuHorizonMenuManager.prototype.getMenuControl = function()
{
	return this.getProgramInstance().getProgramMenu();
};

oFF.HuHorizonMessageManager = function() {};
oFF.HuHorizonMessageManager.prototype = new oFF.HuDfHorizonManager();
oFF.HuHorizonMessageManager.prototype._ff_c = "HuHorizonMessageManager";

oFF.HuHorizonMessageManager.create = function(toolsContext)
{
	var newInstance = new oFF.HuHorizonMessageManager();
	newInstance.setupWithToolsContext(toolsContext);
	return newInstance;
};
oFF.HuHorizonMessageManager.prototype.m_statusMessage = null;
oFF.HuHorizonMessageManager.prototype.m_infoMessages = null;
oFF.HuHorizonMessageManager.prototype.m_successMessages = null;
oFF.HuHorizonMessageManager.prototype.m_warningMessages = null;
oFF.HuHorizonMessageManager.prototype.m_errorMessages = null;
oFF.HuHorizonMessageManager.prototype.m_statusBarClearMessagesPressedObserverId = null;
oFF.HuHorizonMessageManager.prototype.releaseObject = function()
{
	this.m_infoMessages = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_infoMessages);
	this.m_successMessages = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_successMessages);
	this.m_warningMessages = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_warningMessages);
	this.m_errorMessages = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_errorMessages);
	this.getLocalNotificationCenter().removeObserverByUuid(this.m_statusBarClearMessagesPressedObserverId);
	this.m_statusBarClearMessagesPressedObserverId = null;
	oFF.HuDfHorizonManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonMessageManager.prototype.setupManager = function()
{
	this.m_infoMessages = oFF.XList.create();
	this.m_successMessages = oFF.XList.create();
	this.m_warningMessages = oFF.XList.create();
	this.m_errorMessages = oFF.XList.create();
	this._observeStatusBarClearMessagesPressedNotification();
};
oFF.HuHorizonMessageManager.prototype.getManagerName = function()
{
	return "Message Manager";
};
oFF.HuHorizonMessageManager.prototype.setStatus = function(statusMsg)
{
	this.m_statusMessage = statusMsg;
	this._postStatusChangedNotification();
};
oFF.HuHorizonMessageManager.prototype.getStatus = function()
{
	return this.m_statusMessage;
};
oFF.HuHorizonMessageManager.prototype.addInfoMessage = function(title, subtitle, description, messageGroup)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(title))
	{
		var newInfoMessage = oFF.HuMessage.createInformation(title, subtitle, description, messageGroup);
		this.m_infoMessages.add(newInfoMessage);
		this._postNewMessageNotification(newInfoMessage);
	}
};
oFF.HuHorizonMessageManager.prototype.addSuccessMessage = function(title, subtitle, description, messageGroup)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(title))
	{
		var newSuccessMessage = oFF.HuMessage.createSuccess(title, subtitle, description, messageGroup);
		this.m_successMessages.add(newSuccessMessage);
		this._postNewMessageNotification(newSuccessMessage);
	}
};
oFF.HuHorizonMessageManager.prototype.addWarningMessage = function(title, subtitle, description, messageGroup)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(title))
	{
		var newWarningMessage = oFF.HuMessage.createWarning(title, subtitle, description, messageGroup);
		this.m_warningMessages.add(newWarningMessage);
		this._postNewMessageNotification(newWarningMessage);
	}
};
oFF.HuHorizonMessageManager.prototype.addErrorMessage = function(title, subtitle, description, messageGroup)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(title))
	{
		var newErrorMessage = oFF.HuMessage.createError(title, subtitle, description, messageGroup);
		this.m_errorMessages.add(newErrorMessage);
		this._postNewMessageNotification(newErrorMessage);
	}
};
oFF.HuHorizonMessageManager.prototype.addSystemInfoMessage = function(title, subtitle, description)
{
	this.addInfoMessage(title, subtitle, description, oFF.HuMessageGroup.SYSTEM);
};
oFF.HuHorizonMessageManager.prototype.addSystemSuccessMessage = function(title, subtitle, description)
{
	this.addSuccessMessage(title, subtitle, description, oFF.HuMessageGroup.SYSTEM);
};
oFF.HuHorizonMessageManager.prototype.addSystemWarningMessage = function(title, subtitle, description)
{
	this.addWarningMessage(title, subtitle, description, oFF.HuMessageGroup.SYSTEM);
};
oFF.HuHorizonMessageManager.prototype.addSystemErrorMessage = function(title, subtitle, description)
{
	this.addErrorMessage(title, subtitle, description, oFF.HuMessageGroup.SYSTEM);
};
oFF.HuHorizonMessageManager.prototype.getAllInfoMessages = function()
{
	return this.m_infoMessages;
};
oFF.HuHorizonMessageManager.prototype.getAllSuccessMessages = function()
{
	return this.m_successMessages;
};
oFF.HuHorizonMessageManager.prototype.getAllWarningMessages = function()
{
	return this.m_warningMessages;
};
oFF.HuHorizonMessageManager.prototype.getAllErrorMessages = function()
{
	return this.m_errorMessages;
};
oFF.HuHorizonMessageManager.prototype.getAllMessages = function()
{
	var allMessages = oFF.XList.create();
	allMessages.addAll(this.getAllInfoMessages());
	allMessages.addAll(this.getAllSuccessMessages());
	allMessages.addAll(this.getAllWarningMessages());
	allMessages.addAll(this.getAllErrorMessages());
	return allMessages;
};
oFF.HuHorizonMessageManager.prototype.clearInfoMessages = function()
{
	this._clearMessagesByType(oFF.HuMessageType.INFORMATION);
	this._postMessagesClearNotification(oFF.HuMessageType.INFORMATION);
};
oFF.HuHorizonMessageManager.prototype.clearSuccessMessages = function()
{
	this._clearMessagesByType(oFF.HuMessageType.SUCCESS);
	this._postMessagesClearNotification(oFF.HuMessageType.SUCCESS);
};
oFF.HuHorizonMessageManager.prototype.clearWarningMessages = function()
{
	this._clearMessagesByType(oFF.HuMessageType.WARNING);
	this._postMessagesClearNotification(oFF.HuMessageType.WARNING);
};
oFF.HuHorizonMessageManager.prototype.clearErrorMessages = function()
{
	this._clearMessagesByType(oFF.HuMessageType.ERROR);
	this._postMessagesClearNotification(oFF.HuMessageType.ERROR);
};
oFF.HuHorizonMessageManager.prototype.clearAllMessages = function()
{
	this.clearInfoMessages();
	this.clearSuccessMessages();
	this.clearWarningMessages();
	this.clearErrorMessages();
	this._postAllMessagesClearNotification();
};
oFF.HuHorizonMessageManager.prototype.hasInfoMessages = function()
{
	return this.m_infoMessages.size() > 0;
};
oFF.HuHorizonMessageManager.prototype.hasSuccessMessages = function()
{
	return this.m_successMessages.size() > 0;
};
oFF.HuHorizonMessageManager.prototype.hasWarningMessages = function()
{
	return this.m_warningMessages.size() > 0;
};
oFF.HuHorizonMessageManager.prototype.hasErrorMessages = function()
{
	return this.m_errorMessages.size() > 0;
};
oFF.HuHorizonMessageManager.prototype.hasMessages = function()
{
	return this.hasInfoMessages() || this.hasSuccessMessages() || this.hasWarningMessages() || this.hasErrorMessages();
};
oFF.HuHorizonMessageManager.prototype._clearMessagesByType = function(messageType)
{
	if (messageType === oFF.HuMessageType.INFORMATION)
	{
		oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_infoMessages);
		this.m_infoMessages.clear();
	}
	else if (messageType === oFF.HuMessageType.SUCCESS)
	{
		oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_successMessages);
		this.m_successMessages.clear();
	}
	else if (messageType === oFF.HuMessageType.WARNING)
	{
		oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_warningMessages);
		this.m_warningMessages.clear();
	}
	else if (messageType === oFF.HuMessageType.ERROR)
	{
		oFF.XCollectionUtils.releaseEntriesFromCollection(this.m_errorMessages);
		this.m_errorMessages.clear();
	}
};
oFF.HuHorizonMessageManager.prototype._postStatusChangedNotification = function()
{
	var notifyData = oFF.XNotificationData.create();
	notifyData.putString(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_STATUS_CHANGED_NEW_STATUS_NOTIFI_DATA, this.m_statusMessage);
	this.getLocalNotificationCenter().postNotificationWithName(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_STATUS_CHANGED, notifyData);
};
oFF.HuHorizonMessageManager.prototype._postNewMessageNotification = function(newMessage)
{
	var notifyData = oFF.XNotificationData.create();
	notifyData.putXObject(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_NEW_MESSAGE_MESSAGE_NOTIFI_DATA, newMessage);
	this.getLocalNotificationCenter().postNotificationWithName(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_NEW_MESSAGE, notifyData);
};
oFF.HuHorizonMessageManager.prototype._postMessagesClearNotification = function(messageType)
{
	var notifyData = oFF.XNotificationData.create();
	notifyData.putXObject(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_CLEAR_MESSAGES_MESSAGE_TYPE_NOTIFI_DATA, messageType);
	this.getLocalNotificationCenter().postNotificationWithName(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_CLEAR_MESSAGES, notifyData);
};
oFF.HuHorizonMessageManager.prototype._postAllMessagesClearNotification = function()
{
	this.getLocalNotificationCenter().postNotificationWithName(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_CLEAR_ALL_MESSAGES, null);
};
oFF.HuHorizonMessageManager.prototype._observeStatusBarClearMessagesPressedNotification = function()
{
	if (oFF.XStringUtils.isNullOrEmpty(this.m_statusBarClearMessagesPressedObserverId))
	{
		this.m_statusBarClearMessagesPressedObserverId = this.getLocalNotificationCenter().addObserverForName(oFF.HuHorizonInternalNotifications.STATUS_BAR_MANAGER_CLEAR_MESSAGES_PRESSED,  function(notifyData){
			var messageType = notifyData.getXObjectByKey(oFF.HuHorizonInternalNotifications.STATUS_BAR_MANAGER_CLEAR_MESSAGES_PRESSED_MESSAGE_TYPE_NOTIFY_DATA);
			this._clearMessagesByType(messageType);
		}.bind(this));
	}
};

oFF.HuHorizonPluginManager = function() {};
oFF.HuHorizonPluginManager.prototype = new oFF.HuDfHorizonManager();
oFF.HuHorizonPluginManager.prototype._ff_c = "HuHorizonPluginManager";

oFF.HuHorizonPluginManager.create = function(toolsContext)
{
	var newInstance = new oFF.HuHorizonPluginManager();
	newInstance.setupWithToolsContext(toolsContext);
	return newInstance;
};
oFF.HuHorizonPluginManager.prototype.m_runningViewPlugins = null;
oFF.HuHorizonPluginManager.prototype.m_runningCommandPlugins = null;
oFF.HuHorizonPluginManager.prototype.releaseObject = function()
{
	this.m_runningViewPlugins = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_runningViewPlugins);
	this.m_runningCommandPlugins = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_runningCommandPlugins);
	oFF.HuDfHorizonManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonPluginManager.prototype.setupManager = function()
{
	this.m_runningViewPlugins = oFF.XHashMapByString.create();
	this.m_runningCommandPlugins = oFF.XHashMapByString.create();
};
oFF.HuHorizonPluginManager.prototype.getManagerName = function()
{
	return "Plugin Manager";
};
oFF.HuHorizonPluginManager.prototype.newViewPluginInstance = function(pluginName, parentController, config)
{
	if (oFF.HuPluginRegistration.isPluginLoaded(pluginName))
	{
		var newGenericViewPlugin = this._newGenericViewPlugin(pluginName, parentController, config);
		if (oFF.notNull(newGenericViewPlugin))
		{
			this.m_runningViewPlugins.put(newGenericViewPlugin.getUuid(), newGenericViewPlugin);
			return newGenericViewPlugin;
		}
	}
	else
	{
		this.logDebug(oFF.XStringUtils.concatenate2("Plugin not available, cannot create instance -> ", pluginName));
	}
	return null;
};
oFF.HuHorizonPluginManager.prototype.newCommandPluginInstance = function(pluginName, controller, config)
{
	var newCommandPlugin = this._newCommandPlugin(pluginName, controller, config);
	if (oFF.notNull(newCommandPlugin))
	{
		this.m_runningCommandPlugins.put(newCommandPlugin.getUuid(), newCommandPlugin);
		return newCommandPlugin;
	}
	else
	{
		this.logDebug(oFF.XStringUtils.concatenate2("Plugin not enabled, cannot create instance -> ", pluginName));
	}
	return null;
};
oFF.HuHorizonPluginManager.prototype.getViewPluginByUuid = function(pluginUuid)
{
	return this.m_runningViewPlugins.getByKey(pluginUuid);
};
oFF.HuHorizonPluginManager.prototype.getCommandPluginByUuid = function(pluginUuid)
{
	return this.m_runningCommandPlugins.getByKey(pluginUuid);
};
oFF.HuHorizonPluginManager.prototype.killPluginByUuid = function(pluginUuid)
{
	var tmpPlugin = null;
	if (this.m_runningViewPlugins.containsKey(pluginUuid))
	{
		tmpPlugin = this.m_runningViewPlugins.getByKey(pluginUuid);
	}
	else if (this.m_runningCommandPlugins.containsKey(pluginUuid))
	{
		tmpPlugin = this.m_runningCommandPlugins.getByKey(pluginUuid);
	}
	if (oFF.notNull(tmpPlugin))
	{
		tmpPlugin.kill();
		return true;
	}
	return false;
};
oFF.HuHorizonPluginManager.prototype._getPluginType = function(pluginInstance, pluginName)
{
	if (oFF.notNull(pluginInstance))
	{
		var pluginManifest = oFF.HuPluginRegistration.getPluginDef(pluginName).getManifest();
		if (oFF.notNull(pluginManifest) && pluginManifest.getPluginType() !== null)
		{
			return pluginManifest.getPluginType();
		}
		return pluginInstance.getPluginType();
	}
	return null;
};
oFF.HuHorizonPluginManager.prototype._setupPluginAndRun = function(pluginBase, pluginInstance, parentController, pluginConfig, pluginDef)
{
	if (oFF.notNull(pluginBase) && oFF.notNull(pluginInstance) && oFF.notNull(parentController))
	{
		pluginBase.setPluginInstance(pluginInstance);
		pluginBase.setParentController(parentController);
		pluginBase.setConfigJson(pluginConfig);
		pluginBase.setPluginDef(pluginDef);
		pluginBase.run();
	}
};
oFF.HuHorizonPluginManager.prototype._newComponentPlugin = function(pluginName, parentController, config)
{
	var newPluginInstance = oFF.HuPluginFactory.newPluginInstance(pluginName);
	if (oFF.notNull(newPluginInstance) && newPluginInstance.getPluginType() === oFF.HuHorizonPluginType.COMPONENT)
	{
		var newComponentPlugin = new oFF.HuComponentPluginController();
		this._setupPluginAndRun(newComponentPlugin, newPluginInstance, parentController, config, oFF.HuPluginRegistration.getPluginDef(pluginName));
		return newComponentPlugin;
	}
	return null;
};
oFF.HuHorizonPluginManager.prototype._newDocumentPlugin = function(pluginName, parentController, config)
{
	var newPluginInstance = oFF.HuPluginFactory.newPluginInstance(pluginName);
	if (oFF.notNull(newPluginInstance) && newPluginInstance.getPluginType() === oFF.HuHorizonPluginType.DOCUMENT)
	{
		var newDocumentPlugin = new oFF.HuDocumentPluginController();
		this._setupPluginAndRun(newDocumentPlugin, newPluginInstance, parentController, config, oFF.HuPluginRegistration.getPluginDef(pluginName));
		return newDocumentPlugin;
	}
	return null;
};
oFF.HuHorizonPluginManager.prototype._newCommandPlugin = function(pluginName, controller, config)
{
	var newPluginInstance = oFF.HuPluginFactory.newPluginInstance(pluginName);
	if (oFF.notNull(newPluginInstance) && newPluginInstance.getPluginType() === oFF.HuHorizonPluginType.COMMAND)
	{
		var newCommandPlugin = new oFF.HuCommandPluginController();
		this._setupPluginAndRun(newCommandPlugin, newPluginInstance, controller, config, oFF.HuPluginRegistration.getPluginDef(pluginName));
		return newCommandPlugin;
	}
	return null;
};
oFF.HuHorizonPluginManager.prototype._newGenericViewPlugin = function(pluginName, parentController, config)
{
	var newPluginInstance = oFF.HuPluginFactory.newPluginInstance(pluginName);
	if (oFF.notNull(newPluginInstance))
	{
		var pluginType = this._getPluginType(newPluginInstance, pluginName);
		if (pluginType === oFF.HuHorizonPluginType.COMPONENT)
		{
			return this._newComponentPlugin(pluginName, parentController, config);
		}
		else if (pluginType === oFF.HuHorizonPluginType.DOCUMENT)
		{
			return this._newDocumentPlugin(pluginName, parentController, config);
		}
	}
	return null;
};

oFF.HuHorizonStateManager = function() {};
oFF.HuHorizonStateManager.prototype = new oFF.HuDfHorizonManager();
oFF.HuHorizonStateManager.prototype._ff_c = "HuHorizonStateManager";

oFF.HuHorizonStateManager.create = function(toolsContext)
{
	var newInstance = new oFF.HuHorizonStateManager();
	newInstance.setupWithToolsContext(toolsContext);
	return newInstance;
};
oFF.HuHorizonStateManager.prototype.releaseObject = function()
{
	oFF.HuDfHorizonManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonStateManager.prototype.setupManager = function() {};
oFF.HuHorizonStateManager.prototype.getManagerName = function()
{
	return "State Manager";
};

oFF.HuHorizonWorkspaceManager = function() {};
oFF.HuHorizonWorkspaceManager.prototype = new oFF.HuDfHorizonManager();
oFF.HuHorizonWorkspaceManager.prototype._ff_c = "HuHorizonWorkspaceManager";

oFF.HuHorizonWorkspaceManager.create = function(toolsContext, workspaceDir)
{
	var newInstance = new oFF.HuHorizonWorkspaceManager();
	newInstance.setupWithToolsContext(toolsContext);
	newInstance.processWorkspaceDir(workspaceDir);
	return newInstance;
};
oFF.HuHorizonWorkspaceManager.prototype.m_workspaceDir = null;
oFF.HuHorizonWorkspaceManager.prototype.m_horizonDir = null;
oFF.HuHorizonWorkspaceManager.prototype.m_settingsDir = null;
oFF.HuHorizonWorkspaceManager.prototype.m_pluginSettingsDir = null;
oFF.HuHorizonWorkspaceManager.prototype.m_stateFile = null;
oFF.HuHorizonWorkspaceManager.prototype.m_isVirtualWorkspace = false;
oFF.HuHorizonWorkspaceManager.prototype.releaseObject = function()
{
	this.m_stateFile = oFF.XObjectExt.release(this.m_stateFile);
	this.m_pluginSettingsDir = oFF.XObjectExt.release(this.m_pluginSettingsDir);
	this.m_settingsDir = oFF.XObjectExt.release(this.m_settingsDir);
	this.m_horizonDir = oFF.XObjectExt.release(this.m_horizonDir);
	this.m_workspaceDir = oFF.XObjectExt.release(this.m_workspaceDir);
	oFF.HuDfHorizonManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonWorkspaceManager.prototype.setupManager = function() {};
oFF.HuHorizonWorkspaceManager.prototype.processWorkspaceDir = function(workspaceDir)
{
	this.m_workspaceDir = workspaceDir;
	if (oFF.isNull(this.m_workspaceDir))
	{
		this.m_isVirtualWorkspace = true;
		this.logDebug("No workspace directory specified! Settings cannot be preserved!");
	}
};
oFF.HuHorizonWorkspaceManager.prototype.getManagerName = function()
{
	return "Workspace Manager";
};
oFF.HuHorizonWorkspaceManager.prototype.prepareSubDirectoriesIfNecessary = function()
{
	if (oFF.notNull(this.m_workspaceDir))
	{
		var prepareWorkspacePromise = oFF.XPromise.create( function(resolve, reject){
			this.prepareHorizonDirIfNecessary().then( function(isSuccess){
				this.prepareSettingsDirIfNecessary().then( function(isSuccess2){
					this.preparePluginSettingsDirIfNecessary().then( function(isSuccess3){
						resolve(oFF.XBooleanValue.create(true));
						return isSuccess3;
					}.bind(this), reject);
					return isSuccess2;
				}.bind(this), reject);
				return isSuccess;
			}.bind(this), reject);
		}.bind(this));
		return prepareWorkspacePromise;
	}
	return oFF.XPromise.reject(oFF.XError.create("No workspace directory specified"));
};
oFF.HuHorizonWorkspaceManager.prototype.getWorkspaceDirectory = function()
{
	return this.m_workspaceDir;
};
oFF.HuHorizonWorkspaceManager.prototype.getHorizonDirectory = function()
{
	return this.m_horizonDir;
};
oFF.HuHorizonWorkspaceManager.prototype.getSettingsDirectory = function()
{
	return this.m_settingsDir;
};
oFF.HuHorizonWorkspaceManager.prototype.getPluginSettingsDirectory = function()
{
	return this.m_pluginSettingsDir;
};
oFF.HuHorizonWorkspaceManager.prototype.getStateFile = function()
{
	return this.m_stateFile;
};
oFF.HuHorizonWorkspaceManager.prototype.isVirtualWorkspace = function()
{
	return this.m_isVirtualWorkspace;
};
oFF.HuHorizonWorkspaceManager.prototype.prepareHorizonDirIfNecessary = function()
{
	if (this.getSettingsDirectory() === null)
	{
		var prepareHorizonDirPromise = oFF.XPromise.create( function(resolve, reject){
			var horizonDir = this.m_workspaceDir.newChild(oFF.HuHorizonWorkspaceConstants.HORIZON_DIR_NAME);
			this.prepareDirIfNecessary(horizonDir).then( function(newDir){
				this.m_horizonDir = horizonDir;
				this.prepareStateFileIfNecessary().then( function(newFile){
					resolve(oFF.XBooleanValue.create(true));
					return newFile;
				}.bind(this), reject);
				return newDir;
			}.bind(this), reject);
		}.bind(this));
		return prepareHorizonDirPromise;
	}
	return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
};
oFF.HuHorizonWorkspaceManager.prototype.prepareSettingsDirIfNecessary = function()
{
	if (this.getSettingsDirectory() === null)
	{
		var prepareSettingsDirPromise = oFF.XPromise.create( function(resolve, reject){
			var settingsDir = this.getHorizonDirectory().newChild(oFF.HuHorizonWorkspaceConstants.SETTINGS_DIR_NAME);
			this.prepareDirIfNecessary(settingsDir).then( function(newDir){
				this.m_settingsDir = settingsDir;
				resolve(oFF.XBooleanValue.create(true));
				return newDir;
			}.bind(this), reject);
		}.bind(this));
		return prepareSettingsDirPromise;
	}
	return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
};
oFF.HuHorizonWorkspaceManager.prototype.preparePluginSettingsDirIfNecessary = function()
{
	if (this.getPluginSettingsDirectory() === null)
	{
		var preparePluginSettingsDirPromise = oFF.XPromise.create( function(resolve, reject){
			var pluginSettingsDir = this.getSettingsDirectory().newChild(oFF.HuHorizonWorkspaceConstants.PLUGIN_SETTINGS_DIR_NAME);
			this.prepareDirIfNecessary(pluginSettingsDir).then( function(newDir){
				this.m_pluginSettingsDir = pluginSettingsDir;
				resolve(oFF.XBooleanValue.create(true));
				return newDir;
			}.bind(this), reject);
		}.bind(this));
		return preparePluginSettingsDirPromise;
	}
	return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
};
oFF.HuHorizonWorkspaceManager.prototype.prepareStateFileIfNecessary = function()
{
	if (this.getStateFile() === null)
	{
		var prepareStateFilePromise = oFF.XPromise.create( function(resolve, reject){
			var stateFile = this.getHorizonDirectory().newChild(oFF.HuHorizonWorkspaceConstants.STATE_FILE_NAME);
			this.prepareFileIfNecessary(stateFile).then( function(newFile){
				this.m_stateFile = stateFile;
				resolve(oFF.XBooleanValue.create(true));
				return newFile;
			}.bind(this), reject);
		}.bind(this));
		return prepareStateFilePromise;
	}
	return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
};
oFF.HuHorizonWorkspaceManager.prototype.prepareDirIfNecessary = function(dir)
{
	var validateDirPromise = oFF.XPromise.create( function(resolve, reject){
		oFF.UtFilePromise.isExisting(dir).then( function(isDirExisting){
			if (isDirExisting.getBoolean())
			{
				resolve(dir);
			}
			else
			{
				oFF.UtFilePromise.mkdir(dir, false).then( function(newDir){
					resolve(dir);
					return newDir;
				}.bind(this), reject);
			}
			return isDirExisting;
		}.bind(this), reject);
	}.bind(this));
	return validateDirPromise;
};
oFF.HuHorizonWorkspaceManager.prototype.prepareFileIfNecessary = function(file)
{
	var validateFilePromise = oFF.XPromise.create( function(resolve, reject){
		oFF.UtFilePromise.isExisting(file).then( function(isExisting){
			if (isExisting.getBoolean())
			{
				resolve(file);
			}
			else
			{
				oFF.UtFilePromise.saveContent(file, oFF.XContent.createStringContent(oFF.ContentType.JSON, "")).then( function(newFile){
					resolve(file);
					return newFile;
				}.bind(this), reject);
			}
			return isExisting;
		}.bind(this), reject);
	}.bind(this));
	return validateFilePromise;
};

oFF.HuMessageGroup = function() {};
oFF.HuMessageGroup.prototype = new oFF.XConstant();
oFF.HuMessageGroup.prototype._ff_c = "HuMessageGroup";

oFF.HuMessageGroup.SYSTEM = null;
oFF.HuMessageGroup.PLUGIN = null;
oFF.HuMessageGroup.s_pluginGroups = null;
oFF.HuMessageGroup.staticSetup = function()
{
	oFF.HuMessageGroup.s_pluginGroups = oFF.XHashMapByString.create();
	oFF.HuMessageGroup.SYSTEM = oFF.HuMessageGroup.createWithName("System");
	oFF.HuMessageGroup.PLUGIN = oFF.HuMessageGroup.createWithName("Plugin");
};
oFF.HuMessageGroup.createWithName = function(name)
{
	var newGroup = oFF.XConstant.setupName(new oFF.HuMessageGroup(), name);
	newGroup.setDisplayName(name);
	return newGroup;
};
oFF.HuMessageGroup.createForPluginNameIfNecessary = function(name, displayName)
{
	var pluginGroup = oFF.HuMessageGroup.s_pluginGroups.getByKey(name);
	if (oFF.isNull(pluginGroup))
	{
		pluginGroup = oFF.HuMessageGroup.createWithName(name);
		pluginGroup.setDisplayName(oFF.XStringUtils.isNotNullAndNotEmpty(displayName) ? displayName : name);
		oFF.HuMessageGroup.s_pluginGroups.put(name, pluginGroup);
	}
	return oFF.HuMessageGroup.s_pluginGroups.getByKey(name);
};
oFF.HuMessageGroup.prototype.m_displayName = null;
oFF.HuMessageGroup.prototype.setDisplayName = function(displayName)
{
	this.m_displayName = displayName;
};
oFF.HuMessageGroup.prototype.getDisplayName = function()
{
	return this.m_displayName;
};

oFF.HuMessageType = function() {};
oFF.HuMessageType.prototype = new oFF.XConstant();
oFF.HuMessageType.prototype._ff_c = "HuMessageType";

oFF.HuMessageType.INFORMATION = null;
oFF.HuMessageType.SUCCESS = null;
oFF.HuMessageType.WARNING = null;
oFF.HuMessageType.ERROR = null;
oFF.HuMessageType.staticSetup = function()
{
	oFF.HuMessageType.INFORMATION = oFF.HuMessageType.createWithName("Information");
	oFF.HuMessageType.SUCCESS = oFF.HuMessageType.createWithName("Success");
	oFF.HuMessageType.WARNING = oFF.HuMessageType.createWithName("Warning");
	oFF.HuMessageType.ERROR = oFF.HuMessageType.createWithName("Error");
};
oFF.HuMessageType.createWithName = function(name)
{
	return oFF.XConstant.setupName(new oFF.HuMessageType(), name);
};

oFF.HuToolbarGroup = function() {};
oFF.HuToolbarGroup.prototype = new oFF.XConstant();
oFF.HuToolbarGroup.prototype._ff_c = "HuToolbarGroup";

oFF.HuToolbarGroup.DEBUG = null;
oFF.HuToolbarGroup.UNGROUPED = null;
oFF.HuToolbarGroup.s_customGroups = null;
oFF.HuToolbarGroup.staticSetup = function()
{
	oFF.HuToolbarGroup.s_customGroups = oFF.XHashMapByString.create();
	oFF.HuToolbarGroup.DEBUG = oFF.HuToolbarGroup.createWithName("Debug");
	oFF.HuToolbarGroup.UNGROUPED = oFF.HuToolbarGroup.createWithName("Ungrouped");
};
oFF.HuToolbarGroup.createWithName = function(name)
{
	var newGroup = oFF.XConstant.setupName(new oFF.HuToolbarGroup(), name);
	return newGroup;
};
oFF.HuToolbarGroup.createCustomGroupIfNecessary = function(name)
{
	var customGroup = oFF.HuToolbarGroup.s_customGroups.getByKey(name);
	if (oFF.isNull(customGroup))
	{
		customGroup = oFF.HuToolbarGroup.createWithName(name);
		oFF.HuToolbarGroup.s_customGroups.put(name, customGroup);
	}
	return oFF.HuToolbarGroup.s_customGroups.getByKey(name);
};

oFF.HuHorizonBootController = function() {};
oFF.HuHorizonBootController.prototype = new oFF.HuDfSubController();
oFF.HuHorizonBootController.prototype._ff_c = "HuHorizonBootController";

oFF.HuHorizonBootController.create = function(mainController)
{
	var newInstance = new oFF.HuHorizonBootController();
	newInstance.setupWithMainController(mainController);
	return newInstance;
};
oFF.HuHorizonBootController.prototype.m_bootConfig = null;
oFF.HuHorizonBootController.prototype.m_bootActionsSequenceList = null;
oFF.HuHorizonBootController.prototype.m_currentAction = null;
oFF.HuHorizonBootController.prototype.m_numberOfBootActions = 0;
oFF.HuHorizonBootController.prototype.m_bootError = false;
oFF.HuHorizonBootController.prototype.m_currentStatus = null;
oFF.HuHorizonBootController.prototype.m_statusChangedListeners = null;
oFF.HuHorizonBootController.prototype.m_splashScreen = null;
oFF.HuHorizonBootController.prototype.releaseObject = function()
{
	this.m_bootConfig = oFF.XObjectExt.release(this.m_bootConfig);
	this.m_bootActionsSequenceList = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_bootActionsSequenceList);
	this.m_currentAction = null;
	this.m_currentStatus = null;
	this.m_statusChangedListeners = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_statusChangedListeners);
	this.m_splashScreen = oFF.XObjectExt.release(this.m_splashScreen);
	oFF.HuDfSubController.prototype.releaseObject.call( this );
};
oFF.HuHorizonBootController.prototype.setupController = function()
{
	this.m_statusChangedListeners = oFF.XList.create();
	this.m_currentStatus = oFF.HuHorizonBootControllerStatus.INITIAL;
	this.m_bootConfig = oFF.HuHorizonBootConfig.create();
	this.m_bootActionsSequenceList = oFF.XList.create();
};
oFF.HuHorizonBootController.prototype.getControllerName = function()
{
	return "Boot Controller";
};
oFF.HuHorizonBootController.prototype.executeRegularBoot = function()
{
	this._prepareRegularBoot();
	return this._startRegularBoot();
};
oFF.HuHorizonBootController.prototype.getBootConfig = function()
{
	return this.m_bootConfig;
};
oFF.HuHorizonBootController.prototype.executeWorkspaceSwitch = function()
{
	this._prepareWorkspaceSwitch();
	return this._startWorkspaceSwitch();
};
oFF.HuHorizonBootController.prototype.setConfigString = function(configStr)
{
	this.m_bootConfig.setConfigString(configStr);
};
oFF.HuHorizonBootController.prototype.setConfigFilePath = function(configFilePath)
{
	this.m_bootConfig.setConfigFilePath(configFilePath);
};
oFF.HuHorizonBootController.prototype.initWorkspaceManager = function(workspaceDir)
{
	this.getMainController().initWorkspaceManager(workspaceDir);
	return this.getMainController().getWorkspaceManager().prepareSubDirectoriesIfNecessary();
};
oFF.HuHorizonBootController.prototype.getWorkspaceManager = function()
{
	return this.getMainController().getWorkspaceManager();
};
oFF.HuHorizonBootController.prototype.initConfigManager = function(configStruct)
{
	this.getMainController().initConfigManager(configStruct);
	return oFF.XPromise.resolve(oFF.XBooleanValue.create(true));
};
oFF.HuHorizonBootController.prototype.getConfigManager = function()
{
	return this.getMainController().getConfigManager();
};
oFF.HuHorizonBootController.prototype.finalizeMainControllerSetup = function()
{
	var addManagersPromise = oFF.XPromise.create( function(resolve, reject){
		try
		{
			this.getMainController().finalizeControllerSetup();
			resolve(oFF.XBooleanValue.create(true));
		}
		catch (err)
		{
			var tmpError = oFF.XError.create("Error during boot finalization!").attachCause(oFF.XError.createWithThrowable(err));
			reject(tmpError);
		}
	}.bind(this));
	return addManagersPromise;
};
oFF.HuHorizonBootController.prototype.getCurrentStatus = function()
{
	return this.m_currentStatus;
};
oFF.HuHorizonBootController.prototype.addStatusChangedListener = function(listener)
{
	this.m_statusChangedListeners.add(oFF.XConsumerHolder.create(listener));
};
oFF.HuHorizonBootController.prototype.removeStatusChangedListener = function(listener)
{
	oFF.XCollectionUtils.removeIf(this.m_statusChangedListeners,  function(tmpConsumerHolder){
		return tmpConsumerHolder.getConsumer() === listener;
	}.bind(this));
};
oFF.HuHorizonBootController.prototype._logBootActionStart = function(action)
{
	this.logDebug(oFF.XStringUtils.concatenate2("### Starting action: -> ", action.getActionName()));
};
oFF.HuHorizonBootController.prototype._logBootActionFinish = function(action)
{
	this.logDebug(oFF.XStringUtils.concatenate2("### Finished action: -> ", action.getActionName()));
};
oFF.HuHorizonBootController.prototype._setStatus = function(status)
{
	if (oFF.notNull(status) && this.m_currentStatus !== status)
	{
		this.m_currentStatus = status;
		this.logDebug(oFF.XStringUtils.concatenate2("Controller status changed to: ", status.getName()));
		this._notifyStatusChanged(status);
	}
};
oFF.HuHorizonBootController.prototype._notifyStatusChanged = function(status)
{
	oFF.XCollectionUtils.forEach(this.m_statusChangedListeners,  function(tmpListener){
		tmpListener.accept(status);
	}.bind(this));
};
oFF.HuHorizonBootController.prototype._presentSplashScreen = function()
{
	var resolvedImagePath = this.getMainController().getProcess().resolvePath("${ff_mimes}/images/horizon/splashScreen.png");
	this.m_splashScreen = oFF.HuSplashScreenView.create(this.getGenesis());
	this.m_splashScreen.setSplashScreenImagePath(resolvedImagePath);
	this.getMainGenesis().setRoot(this.m_splashScreen.getView());
};
oFF.HuHorizonBootController.prototype._prepareRegularBoot = function()
{
	this.m_bootActionsSequenceList.clear();
	this.m_bootError = false;
	var tmpConfigBootAction = oFF.HuHorizonConfigBootAction.create(this);
	tmpConfigBootAction.setConfigStr(this.getBootConfig().getConfigString());
	tmpConfigBootAction.setConfigFilePath(this.getBootConfig().getConfigFilePath());
	this.m_bootActionsSequenceList.add(oFF.HuHorizonWorkspaceBootAction.create(this));
	this.m_bootActionsSequenceList.add(tmpConfigBootAction);
	this.m_bootActionsSequenceList.add(oFF.HuHorizonPluginsBootAction.create(this));
	this.m_bootActionsSequenceList.add(oFF.HuHorizonFinalizeSetupBootAction.create(this));
	this.m_numberOfBootActions = this.m_bootActionsSequenceList.size();
};
oFF.HuHorizonBootController.prototype._startRegularBoot = function()
{
	this._presentSplashScreen();
	this._setStatus(oFF.HuHorizonBootControllerStatus.BOOT_IN_PROGRESS);
	return this._processBootActionsInOrder().then( function(isSuccess){
		this._setStatus(oFF.HuHorizonBootControllerStatus.BOOT_FINISHED);
		return isSuccess;
	}.bind(this), null);
};
oFF.HuHorizonBootController.prototype._prepareWorkspaceSwitch = function()
{
	this.m_bootActionsSequenceList.clear();
	this.m_bootError = false;
	this.m_bootActionsSequenceList.add(oFF.HuHorizonConfigBootAction.create(this));
	this.m_bootActionsSequenceList.add(oFF.HuHorizonPluginsBootAction.create(this));
	this.m_bootActionsSequenceList.add(oFF.HuHorizonFinalizeSetupBootAction.create(this));
	this.m_numberOfBootActions = this.m_bootActionsSequenceList.size();
};
oFF.HuHorizonBootController.prototype._startWorkspaceSwitch = function()
{
	return this._switchWorkspaceInternal().then( function(isSuccess){
		this._setStatus(oFF.HuHorizonBootControllerStatus.WORKSPACE_SWITCH_FINISHED);
		return isSuccess;
	}.bind(this), null);
};
oFF.HuHorizonBootController.prototype._switchWorkspaceInternal = function()
{
	var switchWorkspacePromise = oFF.XPromise.create( function(resolve, reject){
		var workspaceBootAction = oFF.HuHorizonWorkspaceBootAction.create(this);
		workspaceBootAction.presentWorkspaceDirectorySelection().then( function(directory){
			if (oFF.notNull(directory))
			{
				this._presentSplashScreen();
				this._setStatus(oFF.HuHorizonBootControllerStatus.WORKSPACE_SWITCH_IN_PROGRESS);
				this._logBootActionStart(workspaceBootAction);
				workspaceBootAction.switchWorkspace(directory).then( function(isSuccess){
					this._logBootActionFinish(workspaceBootAction);
					this._processBootActionsInOrder().then( function(isSuccess2){
						resolve(oFF.XBooleanValue.create(true));
						return isSuccess2;
					}.bind(this), null);
					return isSuccess;
				}.bind(this), reject);
			}
			else
			{
				reject(oFF.XError.create("Missing workspace directory!"));
			}
			return directory;
		}.bind(this),  function(errMsg){
			this.logDebug("Workspace switch cancelled!");
		}.bind(this));
	}.bind(this));
	return switchWorkspacePromise;
};
oFF.HuHorizonBootController.prototype._processBootActionsInOrder = function()
{
	var booPromise = oFF.XPromise.create( function(resolve, reject){
		this._processCurrentBootAction(resolve, reject);
	}.bind(this));
	return booPromise;
};
oFF.HuHorizonBootController.prototype._processCurrentBootAction = function(resolve, reject)
{
	if (oFF.notNull(this.m_bootActionsSequenceList) && this.m_bootActionsSequenceList.size() > 0)
	{
		this.m_currentAction = this.m_bootActionsSequenceList.removeAt(0);
		this._setCurrentActionLbl();
		this._logBootActionStart(this.m_currentAction);
		this.m_currentAction.executeBootAction().then( function(isSuccess){
			this._logBootActionFinish(this.m_currentAction);
			this._setProgressIndicatorValue();
			this._processCurrentBootAction(resolve, reject);
			return isSuccess;
		}.bind(this),  function(error){
			var errorMsg = oFF.XStringUtils.concatenate2("Error during startup! Reason: ", error.getText());
			this._showBootError(errorMsg);
			reject(error);
		}.bind(this));
	}
	else
	{
		this.m_currentAction = null;
		this._setCurrentActionLbl();
		resolve(oFF.XBooleanValue.create(true));
	}
};
oFF.HuHorizonBootController.prototype._setCurrentActionLbl = function()
{
	var currentActionStr = null;
	if (oFF.notNull(this.m_currentAction) && !this.m_bootError)
	{
		currentActionStr = oFF.XStringUtils.concatenate2("Proccessing: ", this.m_currentAction.getActionName());
	}
	else if (oFF.notNull(this.m_currentAction) && this.m_bootError)
	{
		currentActionStr = oFF.XStringUtils.concatenate2("Boot interrupted during: ", this.m_currentAction.getActionName());
	}
	else if (this.m_bootError)
	{
		currentActionStr = "Boot error...";
	}
	else
	{
		currentActionStr = "Boot finished...";
	}
	this.m_splashScreen.setCurrentStatusText(currentActionStr);
};
oFF.HuHorizonBootController.prototype._setProgressIndicatorValue = function()
{
	var leftActions = this.m_bootActionsSequenceList.size();
	var percentValue = leftActions / this.m_numberOfBootActions;
	percentValue = percentValue * 100;
	percentValue = 100 - percentValue;
	this.m_splashScreen.setCurrentPercentValue(percentValue);
};
oFF.HuHorizonBootController.prototype._showBootError = function(errorMsg)
{
	if (oFF.XStringUtils.isNotNullAndNotEmpty(errorMsg))
	{
		this.m_splashScreen.setErrorMessage(errorMsg);
		this.m_bootError = true;
		this._setCurrentActionLbl();
	}
	else
	{
		this.m_splashScreen.setErrorMessage(null);
	}
};

oFF.HuCommandPluginController = function() {};
oFF.HuCommandPluginController.prototype = new oFF.HuDfHorizonPluginController();
oFF.HuCommandPluginController.prototype._ff_c = "HuCommandPluginController";

oFF.HuCommandPluginController.prototype.m_actionMap = null;
oFF.HuCommandPluginController.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMMAND;
};
oFF.HuCommandPluginController.prototype.toString = function()
{
	var strBuf = oFF.XStringBuffer.create();
	strBuf.append("[Command] ");
	strBuf.append(this.getCommandSpaceName());
	if (oFF.XStringUtils.isNotNullAndNotEmpty(this.getDescription()))
	{
		strBuf.append(" - ");
		strBuf.append(this.getDescription());
	}
	return strBuf.toString();
};
oFF.HuCommandPluginController.prototype._initSpecificPlugin = function()
{
	this.m_actionMap = oFF.XHashMapByString.create();
};
oFF.HuCommandPluginController.prototype._setupSpecificPlugin = function()
{
	return this._getCommandPluginInstance().setupPlugin(this);
};
oFF.HuCommandPluginController.prototype._setPluginUiBusy = function(busy) {};
oFF.HuCommandPluginController.prototype._runSpecificPlugin = function()
{
	this._getCommandPluginInstance().registerActions(this);
};
oFF.HuCommandPluginController.prototype._destroySpecificPlugin = function()
{
	this.m_actionMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_actionMap);
};
oFF.HuCommandPluginController.prototype.registerAction = function(actionName, _function)
{
	this.m_actionMap.put(actionName, oFF.XBiFunctionHolder.create(_function));
};
oFF.HuCommandPluginController.prototype.getCommandSpaceName = function()
{
	return this.getName();
};
oFF.HuCommandPluginController.prototype.executeCommandSpaceAction = function(actionName, context, customData)
{
	var tmpFunction = this.m_actionMap.getByKey(actionName);
	if (oFF.notNull(tmpFunction))
	{
		return tmpFunction.apply(context, customData);
	}
	return null;
};
oFF.HuCommandPluginController.prototype.hasAction = function(actionaName)
{
	return this.m_actionMap.containsKey(actionaName);
};
oFF.HuCommandPluginController.prototype.getAllActionNames = function()
{
	return this.m_actionMap.getKeysAsReadOnlyListOfString();
};
oFF.HuCommandPluginController.prototype._getCommandPluginInstance = function()
{
	return this._getPluginInstance();
};

oFF.HuDfViewPluginController = function() {};
oFF.HuDfViewPluginController.prototype = new oFF.HuDfHorizonPluginController();
oFF.HuDfViewPluginController.prototype._ff_c = "HuDfViewPluginController";

oFF.HuDfViewPluginController.prototype.m_pluginGenesis = null;
oFF.HuDfViewPluginController.prototype.m_viewPluginWrapper = null;
oFF.HuDfViewPluginController.prototype.m_containerConfig = null;
oFF.HuDfViewPluginController.prototype._initSpecificPlugin = function()
{
	this.m_containerConfig = oFF.HuPluginContainerConfig.createFromConfig(this.getConfigJson());
	var mainGenesis = this._getParentController().getMainController().getGenesis();
	if (oFF.isNull(mainGenesis))
	{
		throw oFF.XException.createRuntimeException("Missing genesis! Cannot create view plugin!");
	}
	this.m_viewPluginWrapper = mainGenesis.newControl(oFF.UiType.CONTENT_WRAPPER);
	this.m_viewPluginWrapper.useMaxSpace();
	var innerGenesis = oFF.UiGenesis.create(this.m_viewPluginWrapper);
	this.m_pluginGenesis = innerGenesis;
	this._initSpecificViewPlugin();
};
oFF.HuDfViewPluginController.prototype._setPluginUiBusy = function(busy)
{
	if (this.getPluginWrapperView() !== null)
	{
		this.getPluginWrapperView().setBusy(busy);
	}
};
oFF.HuDfViewPluginController.prototype._destroySpecificPlugin = function()
{
	this._destroySpecificViewPlugin();
	this.m_containerConfig = oFF.XObjectExt.release(this.m_containerConfig);
	this.m_viewPluginWrapper = oFF.XObjectExt.release(this.m_viewPluginWrapper);
	this.m_pluginGenesis = oFF.XObjectExt.release(this.m_pluginGenesis);
};
oFF.HuDfViewPluginController.prototype.getView = function()
{
	return this.getPluginWrapperView();
};
oFF.HuDfViewPluginController.prototype.getPluginWrapperView = function()
{
	return this.m_viewPluginWrapper;
};
oFF.HuDfViewPluginController.prototype.getPluginContainerConfig = function()
{
	return this.m_containerConfig;
};
oFF.HuDfViewPluginController.prototype.onPluginContainerResize = function(offsetWidth, offsetHeight)
{
	try
	{
		this._getViewPluginInstance().onResize(offsetWidth, offsetHeight);
	}
	catch (err)
	{
		this.logDebug("Missing onResize method on the plugin instance!");
	}
};
oFF.HuDfViewPluginController.prototype._getPluginGenesis = function()
{
	return this.m_pluginGenesis;
};
oFF.HuDfViewPluginController.prototype._getViewPluginInstance = function()
{
	return this._getPluginInstance();
};

oFF.HuHorizonWorkspaceSelectionPopup = function() {};
oFF.HuHorizonWorkspaceSelectionPopup.prototype = new oFF.HuHorizonDfPopup();
oFF.HuHorizonWorkspaceSelectionPopup.prototype._ff_c = "HuHorizonWorkspaceSelectionPopup";

oFF.HuHorizonWorkspaceSelectionPopup.create = function(controller)
{
	var dialog = new oFF.HuHorizonWorkspaceSelectionPopup();
	dialog.setupWithController(controller);
	return dialog;
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.m_inputConsumer = null;
oFF.HuHorizonWorkspaceSelectionPopup.prototype.m_cancelProcedure = null;
oFF.HuHorizonWorkspaceSelectionPopup.prototype.m_input = null;
oFF.HuHorizonWorkspaceSelectionPopup.prototype.releaseObject = function()
{
	this.m_inputConsumer = null;
	this.m_cancelProcedure = null;
	this.m_input = oFF.XObjectExt.release(this.m_input);
	oFF.HuHorizonDfPopup.prototype.releaseObject.call( this );
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.configurePopup = function(dialog)
{
	dialog.setTitle("Horizon workspace");
	dialog.setWidth(oFF.UiCssLength.create("600px"));
	this.addButton(null, oFF.UiButtonType.DEFAULT, "Cancel", "sys-cancel-2", oFF.UiLambdaPressListener.create( function(controlEvent){
		this.cancelPopup();
	}.bind(this)));
	this.addButton(null, oFF.UiButtonType.PRIMARY, "Launch", "begin", oFF.UiLambdaPressListener.create( function(controlEvent2){
		this.confirmPopup();
	}.bind(this)));
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.buildPopupContent = function(genesis)
{
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	var dlgLabel = mainLayout.addNewItemOfType(oFF.UiType.LABEL);
	dlgLabel.setText("Select a directory as a workspace");
	dlgLabel.setFontWeight(oFF.UiFontWeight.BOLD);
	var dlgDescLabel = mainLayout.addNewItemOfType(oFF.UiType.LABEL);
	dlgDescLabel.setText("Horizon uses the workspace directory to store settings and state artifacts.");
	dlgDescLabel.setMargin(oFF.UiCssBoxEdges.create("0 0 0.5rem 0"));
	this.m_input = mainLayout.addNewItemOfType(oFF.UiType.INPUT);
	this.m_input.setShowValueHelp(true);
	this.m_input.registerOnEnter(oFF.UiLambdaEnterListener.create( function(controlEvent){
		this.confirmPopup();
	}.bind(this)));
	this.m_input.registerOnValueHelpRequest(oFF.UiLambdaValueHelpRequestListener.create( function(controlEvent2){
		this.presentDirectorySelection();
	}.bind(this)));
	genesis.setRoot(mainLayout);
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.setInputConsumer = function(consumer)
{
	this.m_inputConsumer = consumer;
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.setCancelProcedure = function(procedure)
{
	this.m_cancelProcedure = procedure;
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.setInputValue = function(value)
{
	if (oFF.notNull(this.m_input))
	{
		this.m_input.setValue(value);
	}
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.confirmPopup = function()
{
	if (oFF.notNull(this.m_inputConsumer) && oFF.notNull(this.m_input))
	{
		this.m_inputConsumer(this.m_input.getValue());
	}
	this.close();
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.cancelPopup = function()
{
	if (oFF.notNull(this.m_cancelProcedure))
	{
		this.m_cancelProcedure();
	}
	this.close();
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.presentDirectorySelection = function()
{
	var config = oFF.SuResourceExplorerConfigWrapper.create();
	config.setTitle("Select a directory as a workspace");
	config.setInitialPath(oFF.HuHorizonConstants.DEFAULT_HOME_DIRECTORY);
	oFF.SuResourceExplorerPromise.selectDirectory(this.getGenericController().getProcess(), config).then( function(selectedDir){
		if (oFF.notNull(selectedDir))
		{
			this.m_input.setValue(selectedDir.getUri().getPath());
		}
		return selectedDir;
	}.bind(this),  function(errMsg){
		this.getGenesis().showErrorToast(errMsg.getText());
	}.bind(this));
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.onAfterOpen = function(event)
{
	if (oFF.notNull(this.m_input))
	{
		this.m_input.focus();
	}
};
oFF.HuHorizonWorkspaceSelectionPopup.prototype.onAfterClose = function(event) {};

oFF.HuHorizonShellController = function() {};
oFF.HuHorizonShellController.prototype = new oFF.HuDfSubController();
oFF.HuHorizonShellController.prototype._ff_c = "HuHorizonShellController";

oFF.HuHorizonShellController.create = function(mainController)
{
	var newInstance = new oFF.HuHorizonShellController();
	newInstance.setupWithMainController(mainController);
	return newInstance;
};
oFF.HuHorizonShellController.prototype.m_menuManager = null;
oFF.HuHorizonShellController.prototype.releaseObject = function()
{
	oFF.HuDfSubController.prototype.releaseObject.call( this );
};
oFF.HuHorizonShellController.prototype.setupController = function()
{
	this.m_menuManager = oFF.HuHorizonMenuManager.create(this, this.getMainController().getProgramInstance());
	this._registerDocumentPluginTitleChanged();
};
oFF.HuHorizonShellController.prototype.getControllerName = function()
{
	return "Shell Controller";
};
oFF.HuHorizonShellController.prototype.reInitShell = function()
{
	this.getMenuManager().clearMenuButtons();
	this._renderFileMenu();
	this._renderDebugMenuIfNeeded();
	this._applyInitialConfig();
};
oFF.HuHorizonShellController.prototype.setTitle = function(title)
{
	this.getMainController().getProgramInstance().setContainerTitle(title);
};
oFF.HuHorizonShellController.prototype.isEmbedded = function()
{
	return this.getMainController().getProgramInstance().isContainerEmbedded();
};
oFF.HuHorizonShellController.prototype.getMenuManager = function()
{
	return this.m_menuManager;
};
oFF.HuHorizonShellController.prototype._applyInitialConfig = function()
{
	this.setTitle(this.getMainController().getConfigManager().getProgramConfiguration().getWorkspaceTitle());
	this.getMenuManager().setMenuVisible(this.getMainController().getConfigManager().getProgramConfiguration().isMenuVisible());
};
oFF.HuHorizonShellController.prototype._renderFileMenu = function()
{
	this.getMenuManager().addMenuButton("File", null,  function(controlEvent){
		this._presentFileMenu(controlEvent);
	}.bind(this));
};
oFF.HuHorizonShellController.prototype._renderDebugMenuIfNeeded = function()
{
	if (this.isDebugMode())
	{
		this.getMenuManager().addMenuButton("Debug", null,  function(controlEvent){
			this._presentDebugMenu(controlEvent);
		}.bind(this));
	}
};
oFF.HuHorizonShellController.prototype._registerDocumentPluginTitleChanged = function()
{
	this.getLocalNotificationCenter().addObserverForName(oFF.HuHorizonInternalNotifications.DOCUMENT_TITLE_CHANGED,  function(data){
		var newTitle = data.getStringByKey(oFF.HuHorizonInternalNotifications.DOCUMENT_TITLE_CHANGED_NEW_TITLE_NOTIFI_DATA);
		this.logDebug(oFF.HuHorizonInternalNotifications.DOCUMENT_TITLE_CHANGED);
		this.logDebug(newTitle);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(newTitle))
		{
			this.setTitle(newTitle);
		}
	}.bind(this));
};
oFF.HuHorizonShellController.prototype._presentFileMenu = function(controlEvent)
{
	if (oFF.notNull(controlEvent) && controlEvent.getControl() !== null)
	{
		var fileMenu = this.getGenesis().newControl(oFF.UiType.MENU);
		var preferencesMenuItem = fileMenu.addNewItem();
		preferencesMenuItem.setText("Preferences...");
		preferencesMenuItem.setIcon("settings");
		preferencesMenuItem.setEnabled(true);
		preferencesMenuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent2){
			var settingsDlgRunner = oFF.ProgramRunner.createRunner(this.getProcess(), oFF.SuSettingsDialog.DEFAULT_PROGRAM_NAME);
			settingsDlgRunner.runProgram();
		}.bind(this)));
		var availablePluginsMenuItem = fileMenu.addNewItem();
		availablePluginsMenuItem.setText("Available plugins...");
		availablePluginsMenuItem.setIcon("switch-views");
		availablePluginsMenuItem.setEnabled(true);
		availablePluginsMenuItem.setSectionStart(true);
		availablePluginsMenuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent3){
			this.presentPluginList();
		}.bind(this)));
		if (!this.getMainController().getWorkspaceManager().isVirtualWorkspace())
		{
			var switchWorkspaceMenuItem = fileMenu.addNewItem();
			switchWorkspaceMenuItem.setText("Switch workspace...");
			switchWorkspaceMenuItem.setIcon("list");
			switchWorkspaceMenuItem.setEnabled(true);
			switchWorkspaceMenuItem.setSectionStart(true);
			switchWorkspaceMenuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent4){
				this.getMainController().requestWorkspaceSwitch();
			}.bind(this)));
		}
		if (!this.isEmbedded())
		{
			var exitMenuItem = fileMenu.addNewItem();
			exitMenuItem.setText("Exit");
			exitMenuItem.setIcon("decline");
			exitMenuItem.setEnabled(true);
			exitMenuItem.setSectionStart(true);
			exitMenuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent5){
				this.getMainController().getProgramInstance().terminate();
			}.bind(this)));
		}
		fileMenu.openAt(controlEvent.getControl());
	}
};
oFF.HuHorizonShellController.prototype.presentPluginList = function()
{
	var pluginListDialogRunner = oFF.ProgramRunner.createRunner(this.getProcess(), oFF.HuPluginListDialog.DEFAULT_PROGRAM_NAME);
	pluginListDialogRunner.setBooleanArgument("showAll", this.isDebugMode());
	pluginListDialogRunner.runProgram();
};
oFF.HuHorizonShellController.prototype._presentDebugMenu = function(controlEvent)
{
	if (oFF.notNull(controlEvent) && controlEvent.getControl() !== null)
	{
		var debugMenu = this.getGenesis().newControl(oFF.UiType.MENU);
		var preferencesMenuItem = debugMenu.addNewItem();
		preferencesMenuItem.setText("Plugin processes...");
		preferencesMenuItem.setIcon("instance");
		preferencesMenuItem.setEnabled(true);
		preferencesMenuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent2){
			this.getDebugService().presentPluginProcessTaskManger();
		}.bind(this)));
		debugMenu.openAt(controlEvent.getControl());
	}
};

oFF.HuHorizonUiController = function() {};
oFF.HuHorizonUiController.prototype = new oFF.HuDfSubController();
oFF.HuHorizonUiController.prototype._ff_c = "HuHorizonUiController";

oFF.HuHorizonUiController.create = function(mainController)
{
	var newInstance = new oFF.HuHorizonUiController();
	newInstance.setupWithMainController(mainController);
	return newInstance;
};
oFF.HuHorizonUiController.prototype.m_statusBarManager = null;
oFF.HuHorizonUiController.prototype.m_toolbarManager = null;
oFF.HuHorizonUiController.prototype.m_viewManager = null;
oFF.HuHorizonUiController.prototype.m_mainLayout = null;
oFF.HuHorizonUiController.prototype.releaseObject = function()
{
	this.m_statusBarManager = oFF.XObjectExt.release(this.m_statusBarManager);
	this.m_toolbarManager = oFF.XObjectExt.release(this.m_toolbarManager);
	this.m_viewManager = oFF.XObjectExt.release(this.m_viewManager);
	this.m_mainLayout = oFF.XObjectExt.release(this.m_mainLayout);
	this.getMainGenesis().clearUi();
	oFF.HuDfSubController.prototype.releaseObject.call( this );
};
oFF.HuHorizonUiController.prototype.setupController = function()
{
	this.m_statusBarManager = oFF.HuHorizonStatusBarManager.create(this, this.getGenesis());
	this.m_toolbarManager = oFF.HuHorizonToolbarManager.create(this, this.getGenesis());
	this.m_viewManager = oFF.HuHorizonViewManager.create(this, this.getGenesis(), "ffHorizonMainContent");
};
oFF.HuHorizonUiController.prototype.getControllerName = function()
{
	return "Ui Controller";
};
oFF.HuHorizonUiController.prototype.reInitUi = function()
{
	this.logDebug("Initialize Ui");
	this.m_mainLayout = this.getGenesis().newControl(oFF.UiType.FLEX_LAYOUT);
	this.m_mainLayout.useMaxSpace();
	this.m_mainLayout.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_mainLayout.setBackgroundDesign(oFF.UiBackgroundDesign.SOLID);
	this.m_mainLayout.addItem(this.getToolbarManager().getView());
	this.m_mainLayout.addItem(this.getViewManager().getView());
	this.m_mainLayout.addItem(this.getStatusBarManager().getView());
	this._applyInitialConfig();
	this.getMainGenesis().setRoot(this.m_mainLayout);
	this._applyInitialStatusBarState();
	this._renderToolbar();
	this._renderPlugins();
	this.logDebug("Ui initialized!");
};
oFF.HuHorizonUiController.prototype.getStatusBarManager = function()
{
	return this.m_statusBarManager;
};
oFF.HuHorizonUiController.prototype.getToolbarManager = function()
{
	return this.m_toolbarManager;
};
oFF.HuHorizonUiController.prototype.getViewManager = function()
{
	return this.m_viewManager;
};
oFF.HuHorizonUiController.prototype._applyInitialConfig = function()
{
	this.logDebug("Applying initial ui config");
	this.getToolbarManager().setToolbarVisible(this._shouldShowToolbar());
	this.getStatusBarManager().setStatusBarVisible(this.getMainController().getConfigManager().getProgramConfiguration().isStatusBarVisible());
};
oFF.HuHorizonUiController.prototype._applyInitialStatusBarState = function()
{
	this.logDebug("Applying initial status bar state");
	var initialStatusMsg = this.getMainController().getMessageManager().getStatus();
	if (oFF.XStringUtils.isNotNullAndNotEmpty(initialStatusMsg))
	{
		this.getStatusBarManager().setStatusMessage(initialStatusMsg);
	}
	if (this.getMainController().getMessageManager().hasMessages())
	{
		this.getStatusBarManager().addAllMessages(this.getMainController().getMessageManager().getAllMessages());
	}
};
oFF.HuHorizonUiController.prototype._renderToolbar = function()
{
	this.logDebug("Rendering --- toolbar");
	this._createDebugToolbarGroupIfNeeded();
	this._generateToolbarItemsIfNeeded();
	this.getToolbarManager().renderToolbar();
};
oFF.HuHorizonUiController.prototype._renderPlugins = function()
{
	this.logDebug("Rendering --- plugins");
	if (this.getMainController().getConfigManager().getPluginsConfiguration().hasStartupViewPlugins())
	{
		this.getMainController().getConfigManager().getPluginsConfiguration().processStartupViewPlugins( function(tmpPluginNameConfig){
			var newViewPluginInstance = this.getMainController().getPluginManager().newViewPluginInstance(tmpPluginNameConfig.getPluginName(), this.getMainController(), tmpPluginNameConfig.getConfig());
			if (oFF.notNull(newViewPluginInstance))
			{
				this.logDebug(oFF.XStringUtils.concatenate2("Rendering plugin --> ", newViewPluginInstance.getName()));
				this.getViewManager().addPluginView(newViewPluginInstance);
			}
		}.bind(this));
	}
	else
	{
		this._presentEmptyWorkspaceView();
		this.logDebug("No view plugins specified in the configuration! Nothing to render...");
	}
};
oFF.HuHorizonUiController.prototype._presentEmptyWorkspaceView = function()
{
	var emptyWorkspaceView = oFF.HuEmptyWorkspaceView.create(this.getGenesis());
	emptyWorkspaceView.setMessageText("No document or component plugins specified in the configuration...");
	emptyWorkspaceView.setReloadConfigButtonPressedProcdeure( function(){
		this.getGenesis().showInfoToast("Works...");
	}.bind(this));
	this.m_mainLayout.removeItem(this.getViewManager().getView());
	this.m_mainLayout.insertItem(emptyWorkspaceView.getView(), 1);
};
oFF.HuHorizonUiController.prototype._shouldShowToolbar = function()
{
	if (this.getMainController().getConfigManager().getProgramConfiguration().isToolbarPropertySet())
	{
		return this.getMainController().getConfigManager().getProgramConfiguration().isToolbarVisible();
	}
	return this.isDebugMode() || this.getMainController().getConfigManager().getToolbarConfiguration().hasToolbarItems();
};
oFF.HuHorizonUiController.prototype._createDebugToolbarGroupIfNeeded = function()
{
	if (this.isDebugMode())
	{
		var debugGroup = this.getToolbarManager().createNewGroup(oFF.HuToolbarGroup.DEBUG.getName());
		debugGroup.addButton("test", "test", "test", "accept").setPressConsumer( function(event){
			this.getGenesis().showErrorToast("Works!");
		}.bind(this));
		debugGroup.addButton("commandTest", "commandTest", "commandTest", "action").setPressConsumer( function(event2){
			this.getMainController().getCommandManager().executeAction("SimpleToastCommand.show", this.getMainController(), null);
		}.bind(this));
	}
};
oFF.HuHorizonUiController.prototype._generateToolbarItemsIfNeeded = function()
{
	if (this.getMainController().getConfigManager().getToolbarConfiguration().hasToolbarItems())
	{
		var allGroups = this.getMainController().getConfigManager().getToolbarConfiguration().getAllGroupsInOrder();
		oFF.XCollectionUtils.forEach(allGroups,  function(tmpGroup){
			this.getToolbarManager().createNewGroup(tmpGroup.getName());
		}.bind(this));
		var allToolbarItems = this.getMainController().getConfigManager().getToolbarConfiguration().getAllToolbarItems();
		oFF.XCollectionUtils.forEach(allToolbarItems,  function(tmpToolbarItem){
			var tmpGroup2 = this.getToolbarManager().getGroupByNameCreateIfNeeded(tmpToolbarItem.getGroup().getName());
			if (oFF.notNull(tmpGroup2))
			{
				var tmpBtn = tmpGroup2.addButton(tmpToolbarItem.getName(), tmpToolbarItem.getText(), tmpToolbarItem.getTooltip(), tmpToolbarItem.getIcon());
				tmpBtn.setPressConsumer( function(event2){
					this.getMainController().getCommandManager().executeAction(tmpToolbarItem.getActionId(), this.getMainController(), null);
				}.bind(this));
				tmpBtn.setEnabled(this.getMainController().getCommandManager().actionExists(tmpToolbarItem.getActionId()));
			}
		}.bind(this));
	}
};

oFF.HuComponentPluginController = function() {};
oFF.HuComponentPluginController.prototype = new oFF.HuDfViewPluginController();
oFF.HuComponentPluginController.prototype._ff_c = "HuComponentPluginController";

oFF.HuComponentPluginController.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMPONENT;
};
oFF.HuComponentPluginController.prototype._initSpecificViewPlugin = function()
{
	this.getPluginWrapperView().addCssClass("ffHorizonComponentPlugin");
};
oFF.HuComponentPluginController.prototype._setupSpecificPlugin = function()
{
	return this._getComponentPluginInstance().setupPlugin(this);
};
oFF.HuComponentPluginController.prototype._runSpecificPlugin = function()
{
	this._getComponentPluginInstance().buildPluginUi(this.getGenesis());
};
oFF.HuComponentPluginController.prototype._destroySpecificViewPlugin = function() {};
oFF.HuComponentPluginController.prototype.getGenesis = function()
{
	return this._getPluginGenesis();
};
oFF.HuComponentPluginController.prototype._getComponentPluginInstance = function()
{
	return this._getPluginInstance();
};

oFF.HuDocumentPluginController = function() {};
oFF.HuDocumentPluginController.prototype = new oFF.HuDfViewPluginController();
oFF.HuDocumentPluginController.prototype._ff_c = "HuDocumentPluginController";

oFF.HuDocumentPluginController.prototype.m_documentTitle = null;
oFF.HuDocumentPluginController.prototype.m_documentDataSpace = null;
oFF.HuDocumentPluginController.prototype.m_documentViewManager = null;
oFF.HuDocumentPluginController.prototype.m_documentPluginManager = null;
oFF.HuDocumentPluginController.prototype.m_globalDataSpaceChangedUuidList = null;
oFF.HuDocumentPluginController.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.DOCUMENT;
};
oFF.HuDocumentPluginController.prototype.getDataSpace = function()
{
	return this.m_documentDataSpace;
};
oFF.HuDocumentPluginController.prototype._initSpecificViewPlugin = function()
{
	this.getPluginWrapperView().addCssClass("ffHorizonDocumentPlugin");
	this.getPluginWrapperView().setMinHeight(oFF.UiCssLength.create("0"));
	this.getPluginWrapperView().setFlex("1");
	this.m_documentDataSpace = oFF.HuDataSpace.create();
	this.m_documentPluginManager = oFF.HuHorizonPluginManager.create(this);
	this.m_documentViewManager = oFF.HuHorizonViewManager.create(this, this._getPluginGenesis(), "ffHorizonDocumentPluginContainer");
	this.setRoot(this.getPluginContainerView());
	this.setDocumentTitle(this.getDisplayName());
};
oFF.HuDocumentPluginController.prototype._setupSpecificPlugin = function()
{
	return this._getDocumentPluginInstance().setupPlugin(this);
};
oFF.HuDocumentPluginController.prototype._runSpecificPlugin = function()
{
	this._getDocumentPluginInstance().layoutDocument(this);
};
oFF.HuDocumentPluginController.prototype._destroySpecificViewPlugin = function()
{
	this._cleanUpGlobalDataSpaceListeners();
	this.m_documentPluginManager = oFF.XObjectExt.release(this.m_documentPluginManager);
	this.m_documentViewManager = oFF.XObjectExt.release(this.m_documentViewManager);
	this.m_documentDataSpace = oFF.XObjectExt.release(this.m_documentDataSpace);
};
oFF.HuDocumentPluginController.prototype.getGenesis = function()
{
	return this._getPluginGenesis();
};
oFF.HuDocumentPluginController.prototype.getMainController = function()
{
	return this._getParentController().getMainController();
};
oFF.HuDocumentPluginController.prototype.setDocumentTitle = function(title)
{
	this.m_documentTitle = title;
	this._postDocumentTitleChangedNotification();
};
oFF.HuDocumentPluginController.prototype.setBusy = function(busy)
{
	this._setPluginUiBusy(busy);
};
oFF.HuDocumentPluginController.prototype.getGlobalDataSpace = function()
{
	return this._getParentController().getDataSpace();
};
oFF.HuDocumentPluginController.prototype.addGlobalDataSpaceChangedListener = function(listener)
{
	if (oFF.isNull(this.m_globalDataSpaceChangedUuidList))
	{
		this.m_globalDataSpaceChangedUuidList = oFF.XListOfString.create();
	}
	var listenerUuid = this._getGlobalDataSpaceBase().addSpaceChangedListener(listener);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(listenerUuid))
	{
		this.m_globalDataSpaceChangedUuidList.add(listenerUuid);
	}
	return listenerUuid;
};
oFF.HuDocumentPluginController.prototype.removeGlobalDataSpaceChangedListener = function(listenerUuid)
{
	this._getGlobalDataSpaceBase().removeSpaceChangedListenerByUuid(listenerUuid);
	if (oFF.notNull(this.m_globalDataSpaceChangedUuidList))
	{
		this.m_globalDataSpaceChangedUuidList.removeElement(listenerUuid);
	}
};
oFF.HuDocumentPluginController.prototype.getAllAvailableComponentPlugins = function()
{
	return oFF.HuPluginRegistration.getAllLoadedPluginNamesByType(oFF.HuHorizonPluginType.COMPONENT);
};
oFF.HuDocumentPluginController.prototype.newComponentPlugin = function(pluginName, config)
{
	var newViewPlugin = this._getDocumentPluginManager().newViewPluginInstance(pluginName, this, config);
	if (oFF.notNull(newViewPlugin))
	{
		return newViewPlugin.getUuid();
	}
	return null;
};
oFF.HuDocumentPluginController.prototype.addNewComponentPlugin = function(pluginName, config)
{
	var newViewPlugin = this._getDocumentPluginManager().newViewPluginInstance(pluginName, this, config);
	if (oFF.notNull(newViewPlugin))
	{
		this._getDocumentViewManager().addPluginView(newViewPlugin);
		return newViewPlugin.getUuid();
	}
	return null;
};
oFF.HuDocumentPluginController.prototype.destroyComponentPlugin = function(pluginUuid)
{
	var tmpViewPlugin = this._getDocumentPluginManager().getViewPluginByUuid(pluginUuid);
	if (oFF.notNull(tmpViewPlugin))
	{
		this._getDocumentViewManager().removePluginView(tmpViewPlugin);
		this._getDocumentPluginManager().killPluginByUuid(pluginUuid);
	}
};
oFF.HuDocumentPluginController.prototype.hideComponentPlugin = function(pluginUuid)
{
	var tmpViewPlugin = this._getDocumentPluginManager().getViewPluginByUuid(pluginUuid);
	if (oFF.notNull(tmpViewPlugin))
	{
		this._getDocumentViewManager().removePluginView(tmpViewPlugin);
	}
};
oFF.HuDocumentPluginController.prototype.showComponentPlugin = function(pluginUuid)
{
	var tmpViewPlugin = this._getDocumentPluginManager().getViewPluginByUuid(pluginUuid);
	if (oFF.notNull(tmpViewPlugin))
	{
		this._getDocumentViewManager().addPluginView(tmpViewPlugin);
	}
};
oFF.HuDocumentPluginController.prototype.getPluginView = function(pluginUuid)
{
	var tmpViewPlugin = this._getDocumentPluginManager().getViewPluginByUuid(pluginUuid);
	if (oFF.notNull(tmpViewPlugin))
	{
		return tmpViewPlugin.getPluginWrapperView();
	}
	return null;
};
oFF.HuDocumentPluginController.prototype.getPluginContainerView = function()
{
	return this._getDocumentViewManager().getView();
};
oFF.HuDocumentPluginController.prototype.setRoot = function(control)
{
	if (this.getPluginContainerView().getParent() === this.getPluginWrapperView())
	{
		this.getPluginWrapperView().clearContent();
	}
	this._getPluginGenesis().setRoot(control);
};
oFF.HuDocumentPluginController.prototype.getTitle = function()
{
	return this.m_documentTitle;
};
oFF.HuDocumentPluginController.prototype._getDocumentPluginInstance = function()
{
	return this._getPluginInstance();
};
oFF.HuDocumentPluginController.prototype._getDocumentViewManager = function()
{
	return this.m_documentViewManager;
};
oFF.HuDocumentPluginController.prototype._getDocumentPluginManager = function()
{
	return this.m_documentPluginManager;
};
oFF.HuDocumentPluginController.prototype._getGlobalDataSpaceBase = function()
{
	return this.getGlobalDataSpace();
};
oFF.HuDocumentPluginController.prototype._cleanUpGlobalDataSpaceListeners = function()
{
	if (oFF.notNull(this.m_globalDataSpaceChangedUuidList) && this.m_globalDataSpaceChangedUuidList.size() > 0)
	{
		if (this._getGlobalDataSpaceBase() !== null)
		{
			oFF.XCollectionUtils.forEachString(this.m_globalDataSpaceChangedUuidList,  function(listnerUuid){
				this._getGlobalDataSpaceBase().removeSpaceChangedListenerByUuid(listnerUuid);
			}.bind(this));
		}
		this.m_globalDataSpaceChangedUuidList.clear();
	}
	this.m_globalDataSpaceChangedUuidList = oFF.XObjectExt.release(this.m_globalDataSpaceChangedUuidList);
};
oFF.HuDocumentPluginController.prototype._postDocumentTitleChangedNotification = function()
{
	var documentTitleChangedNotificationData = oFF.XNotificationData.create();
	documentTitleChangedNotificationData.putString(oFF.HuHorizonInternalNotifications.DOCUMENT_TITLE_CHANGED_NEW_TITLE_NOTIFI_DATA, this.getTitle());
	this.getLocalNotificationCenter().postNotificationWithName(oFF.HuHorizonInternalNotifications.DOCUMENT_TITLE_CHANGED, documentTitleChangedNotificationData);
};

oFF.HuErrorType = function() {};
oFF.HuErrorType.prototype = new oFF.XErrorType();
oFF.HuErrorType.prototype._ff_c = "HuErrorType";

oFF.HuErrorType.CONFIG_ERROR = null;
oFF.HuErrorType.CONFIG_FILE_NOT_FOUND = null;
oFF.HuErrorType.CONFIG_SYNTAX_ERROR = null;
oFF.HuErrorType.staticSetupHorizon = function()
{
	oFF.HuErrorType.CONFIG_ERROR = oFF.HuErrorType.createHorizonError("ConfigError", null);
	oFF.HuErrorType.CONFIG_FILE_NOT_FOUND = oFF.HuErrorType.createHorizonError("ConfigFileNotFound", oFF.HuErrorType.CONFIG_ERROR);
	oFF.HuErrorType.CONFIG_SYNTAX_ERROR = oFF.HuErrorType.createHorizonError("ConfigSyntaxError", oFF.HuErrorType.CONFIG_ERROR);
};
oFF.HuErrorType.createHorizonError = function(constant, parent)
{
	return oFF.XErrorType.createError(new oFF.HuErrorType(), constant, parent);
};

oFF.HuHorizonStatusBarManager = function() {};
oFF.HuHorizonStatusBarManager.prototype = new oFF.HuDfHorizonUiManager();
oFF.HuHorizonStatusBarManager.prototype._ff_c = "HuHorizonStatusBarManager";

oFF.HuHorizonStatusBarManager.ICON_MARGIN = "0 5px 0 5px";
oFF.HuHorizonStatusBarManager.ACTIVITY_INDICATOR_ICON_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAsQAAALEBxi1JjQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAMUSURBVEiJrZZLbFVVFIa/f5/Ti7UWq4bYFNHgQEwkyqAiieiAxGBMjGmJqEQiAx048ZmYaNL2WkwLEZSXGlNmTUysASJOQElQGBGMKWEAxoF1QlQMYNPXvfec/TvoU0ofof2Ha6/z/Wutfc7ZW8ykom9RyH8XnIjmMLXJMd7R8Iz5M0gzruzzEl3L+4D6scigxNG4Ktl6+jGaJb7AvLT+Pv0wm0G4YfTDrEnX8l+nwAFqiFxhs3IFlgJ3ElgG8O0FNx885zfn7sBWaM92W3p7vGqgBkDmy9iavI5kgJ8v+dbGBg0dP+eagSXu7+tH764N0wr+XyC055+NwS37Y8ekEUCiayocoLFBQwAbH9HgPyUdWlpQ1+wdtGevCrqAaLONtrR7bFzP4+QQRcUbAaaq86zvHyn5yL9l/bRng94ASAEoul7knwIYvU9b0j3xVFv6zVzgcWUl1lwZ0cPG6cRUAILyD4DbgDPEsGu+wOvVsl6HC4FNaaLHx2Maex3/BOosb6Sl6vubNRjX1uNeeXmIF9edY2fK1exJpDrgEnl6YqFwgBD5/HLFT59crZGUEBqxEZzyPDZyPvpjhGOJWHF7HV+lIXq5Bdi/LQYc4Mcm7QX2AqSIaoAYQmmxDB7o8fKBgXx/JefrFPsvJIJdvyjzASplmoczNUVzbxoV+oQxrFokPlcrdAexuhDDLlH0gwr5BaDimNRT1JXFMgIIFHURdB6oIomvLBSYHqg8lezOhsKOyp5RA8BwAEB2Kx1etqCKS7rbw65GapiM9jhRe96r9sxqz06yz0tuiv6eR/ex03eMhyb/psXyGoVwCqgFvnNMXqao/nmBP3F1GMgPesRbHDnKjqrnJjqaNCj0Wt4MlIFnFbKzbM+emRO+vbJBA/GMM7ZQGj2Lpi5PP5M/Kq9TDD3AitEM/WJzBOJplP4NZMTsHhQelb0JWEvZUCK64LfoKOyf3QCgw3eFctbqoNdg9EufJgNlw4hMlc9b6Qt06uL1aTPfKgBa/BAx2ybpCeyVNrXKVUAexBp2iCdR1U461DsT4j8tvEUHScegaAAAAABJRU5ErkJggg==";
oFF.HuHorizonStatusBarManager.create = function(toolsContext, genesis)
{
	var newInstance = new oFF.HuHorizonStatusBarManager();
	newInstance.setupManagerWithGenesis(toolsContext, genesis);
	return newInstance;
};
oFF.HuHorizonStatusBarManager.prototype.m_wrapperLayout = null;
oFF.HuHorizonStatusBarManager.prototype.m_statusLabel = null;
oFF.HuHorizonStatusBarManager.prototype.m_infoIcon = null;
oFF.HuHorizonStatusBarManager.prototype.m_successIcon = null;
oFF.HuHorizonStatusBarManager.prototype.m_warningsIcon = null;
oFF.HuHorizonStatusBarManager.prototype.m_errorsIcon = null;
oFF.HuHorizonStatusBarManager.prototype.m_networkActivityIndicator = null;
oFF.HuHorizonStatusBarManager.prototype.m_statusChangedObserverId = null;
oFF.HuHorizonStatusBarManager.prototype.m_newMessagesObserverId = null;
oFF.HuHorizonStatusBarManager.prototype.m_clearMessagesObserverId = null;
oFF.HuHorizonStatusBarManager.prototype.m_clearAllMessagesObserverId = null;
oFF.HuHorizonStatusBarManager.prototype.releaseObject = function()
{
	this.getLocalNotificationCenter().removeObserverByUuid(this.m_statusChangedObserverId);
	this.m_statusChangedObserverId = null;
	this.getLocalNotificationCenter().removeObserverByUuid(this.m_newMessagesObserverId);
	this.m_newMessagesObserverId = null;
	this.getLocalNotificationCenter().removeObserverByUuid(this.m_clearMessagesObserverId);
	this.m_clearMessagesObserverId = null;
	this.getLocalNotificationCenter().removeObserverByUuid(this.m_clearAllMessagesObserverId);
	this.m_clearAllMessagesObserverId = null;
	this.m_networkActivityIndicator = oFF.XObjectExt.release(this.m_networkActivityIndicator);
	this.m_infoIcon = oFF.XObjectExt.release(this.m_infoIcon);
	this.m_successIcon = oFF.XObjectExt.release(this.m_successIcon);
	this.m_errorsIcon = oFF.XObjectExt.release(this.m_errorsIcon);
	this.m_warningsIcon = oFF.XObjectExt.release(this.m_warningsIcon);
	this.m_statusLabel = oFF.XObjectExt.release(this.m_statusLabel);
	this.m_wrapperLayout = oFF.XObjectExt.release(this.m_wrapperLayout);
	oFF.HuDfHorizonUiManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonStatusBarManager.prototype.setupManager = function()
{
	this._observeStatusChangedNotification();
	this._observeNewMessagesNotification();
	this._observeClearMessagesNotification();
	this._observeClearAllMessagesNotification();
};
oFF.HuHorizonStatusBarManager.prototype.getManagerName = function()
{
	return "StatusBar Manager";
};
oFF.HuHorizonStatusBarManager.prototype.getView = function()
{
	return this.createStatusBarIfNeeded();
};
oFF.HuHorizonStatusBarManager.prototype.setStatusBarVisible = function(visible)
{
	this.getView().setVisible(visible);
};
oFF.HuHorizonStatusBarManager.prototype.isStatusBarVisible = function()
{
	return this.getView().isVisible();
};
oFF.HuHorizonStatusBarManager.prototype.toggleStatusBar = function()
{
	this.setStatusBarVisible(!this.isStatusBarVisible());
};
oFF.HuHorizonStatusBarManager.prototype.setStatusMessage = function(message)
{
	this._updateStatusLabel(message, null);
};
oFF.HuHorizonStatusBarManager.prototype.addAllMessages = function(messages)
{
	oFF.XCollectionUtils.forEach(messages,  function(message){
		this._addMessage(message);
	}.bind(this));
};
oFF.HuHorizonStatusBarManager.prototype.showNetworkActivityIndicator = function()
{
	this._setNetworkActivityIndicatorVisible(true);
};
oFF.HuHorizonStatusBarManager.prototype.hideNetworkActivityIndicator = function()
{
	this._setNetworkActivityIndicatorVisible(false);
};
oFF.HuHorizonStatusBarManager.prototype.createStatusBarIfNeeded = function()
{
	if (oFF.isNull(this.m_wrapperLayout))
	{
		this.m_wrapperLayout = this.getGenesis().newControl(oFF.UiType.FLEX_LAYOUT);
		this.m_wrapperLayout.addCssClass("ffHorizonStatusBar");
		this.m_wrapperLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
		this.m_wrapperLayout.setFlex("0 0 auto");
		this.m_wrapperLayout.setBackgroundDesign(oFF.UiBackgroundDesign.SOLID);
		this.m_wrapperLayout.setPadding(oFF.UiCssBoxEdges.create("5px"));
		this.m_wrapperLayout.setHeight(oFF.UiCssLength.create("30px"));
		this.m_wrapperLayout.addItem(this._getStatusLabel());
		this.m_wrapperLayout.addItem(this._getInfoMessageIcon().getView());
		this.m_wrapperLayout.addItem(this._getSuccessMessageIcon().getView());
		this.m_wrapperLayout.addItem(this._getWarningMessageIcon().getView());
		this.m_wrapperLayout.addItem(this._getErrorMessageIcon().getView());
		this.m_wrapperLayout.addItem(this._getNetworkActivityIndicator());
	}
	return this.m_wrapperLayout;
};
oFF.HuHorizonStatusBarManager.prototype._getStatusLabel = function()
{
	if (oFF.isNull(this.m_statusLabel))
	{
		this.m_statusLabel = this.getGenesis().newControl(oFF.UiType.LABEL);
		this.m_statusLabel.setFlex("auto");
	}
	return this.m_statusLabel;
};
oFF.HuHorizonStatusBarManager.prototype._getNetworkActivityIndicator = function()
{
	if (oFF.isNull(this.m_networkActivityIndicator))
	{
		this.m_networkActivityIndicator = this.getGenesis().newControl(oFF.UiType.ACTIVITY_INDICATOR);
		this.m_networkActivityIndicator.setIconSize(oFF.UiCssLength.create("1rem"));
		this.m_networkActivityIndicator.setSrc(oFF.HuHorizonStatusBarManager.ACTIVITY_INDICATOR_ICON_BASE64);
		this.m_networkActivityIndicator.setTooltip("Requesting backend data...");
		this.m_networkActivityIndicator.setMargin(oFF.UiCssBoxEdges.create(oFF.HuHorizonStatusBarManager.ICON_MARGIN));
		this.m_networkActivityIndicator.setFlex("0 0 auto");
		this.m_networkActivityIndicator.setVisible(false);
	}
	return this.m_networkActivityIndicator;
};
oFF.HuHorizonStatusBarManager.prototype._getInfoMessageIcon = function()
{
	if (oFF.isNull(this.m_infoIcon))
	{
		this.m_infoIcon = oFF.UtMessageIconWidget.create(this.getGenesis(), oFF.UiMessageType.INFORMATION);
		this.m_infoIcon.setMargin(oFF.UiCssBoxEdges.create(oFF.HuHorizonStatusBarManager.ICON_MARGIN));
		this.m_infoIcon.setVisible(false);
		this.m_infoIcon.setShowClearButton(true);
		this.m_infoIcon.setClearPressProcedure( function(){
			this._clearMessagesByType(oFF.HuMessageType.INFORMATION);
			this._postClearMessagesPressedNotification(oFF.HuMessageType.INFORMATION);
		}.bind(this));
	}
	return this.m_infoIcon;
};
oFF.HuHorizonStatusBarManager.prototype._getSuccessMessageIcon = function()
{
	if (oFF.isNull(this.m_successIcon))
	{
		this.m_successIcon = oFF.UtMessageIconWidget.create(this.getGenesis(), oFF.UiMessageType.SUCCESS);
		this.m_successIcon.setMargin(oFF.UiCssBoxEdges.create(oFF.HuHorizonStatusBarManager.ICON_MARGIN));
		this.m_successIcon.setVisible(false);
		this.m_successIcon.setShowClearButton(true);
		this.m_successIcon.setClearPressProcedure( function(){
			this._clearMessagesByType(oFF.HuMessageType.SUCCESS);
			this._postClearMessagesPressedNotification(oFF.HuMessageType.SUCCESS);
		}.bind(this));
	}
	return this.m_successIcon;
};
oFF.HuHorizonStatusBarManager.prototype._getWarningMessageIcon = function()
{
	if (oFF.isNull(this.m_warningsIcon))
	{
		this.m_warningsIcon = oFF.UtMessageIconWidget.create(this.getGenesis(), oFF.UiMessageType.WARNING);
		this.m_warningsIcon.setMargin(oFF.UiCssBoxEdges.create(oFF.HuHorizonStatusBarManager.ICON_MARGIN));
		this.m_warningsIcon.setVisible(false);
		this.m_warningsIcon.setShowClearButton(true);
		this.m_warningsIcon.setClearPressProcedure( function(){
			this._clearMessagesByType(oFF.HuMessageType.WARNING);
			this._postClearMessagesPressedNotification(oFF.HuMessageType.WARNING);
		}.bind(this));
	}
	return this.m_warningsIcon;
};
oFF.HuHorizonStatusBarManager.prototype._getErrorMessageIcon = function()
{
	if (oFF.isNull(this.m_errorsIcon))
	{
		this.m_errorsIcon = oFF.UtMessageIconWidget.create(this.getGenesis(), oFF.UiMessageType.ERROR);
		this.m_errorsIcon.setMargin(oFF.UiCssBoxEdges.create(oFF.HuHorizonStatusBarManager.ICON_MARGIN));
		this.m_errorsIcon.setVisible(false);
		this.m_errorsIcon.setShowClearButton(true);
		this.m_errorsIcon.setClearPressProcedure( function(){
			this._clearMessagesByType(oFF.HuMessageType.ERROR);
			this._postClearMessagesPressedNotification(oFF.HuMessageType.ERROR);
		}.bind(this));
	}
	return this.m_errorsIcon;
};
oFF.HuHorizonStatusBarManager.prototype._updateStatusLabel = function(message, color)
{
	this._getStatusLabel().setText(message);
	this._getStatusLabel().setFontColor(color);
};
oFF.HuHorizonStatusBarManager.prototype._setNetworkActivityIndicatorVisible = function(visible)
{
	this._getNetworkActivityIndicator().setVisible(visible);
};
oFF.HuHorizonStatusBarManager.prototype._addMessage = function(message)
{
	if (oFF.notNull(message))
	{
		if (message.getMessageType() === oFF.HuMessageType.INFORMATION)
		{
			this._addMessageToIconWidget(message, this._getInfoMessageIcon());
		}
		else if (message.getMessageType() === oFF.HuMessageType.SUCCESS)
		{
			this._addMessageToIconWidget(message, this._getSuccessMessageIcon());
		}
		else if (message.getMessageType() === oFF.HuMessageType.WARNING)
		{
			this._addMessageToIconWidget(message, this._getWarningMessageIcon());
		}
		else if (message.getMessageType() === oFF.HuMessageType.ERROR)
		{
			this._addMessageToIconWidget(message, this._getErrorMessageIcon());
			if (this.isStatusBarVisible())
			{
				this._getErrorMessageIcon().open();
			}
		}
	}
};
oFF.HuHorizonStatusBarManager.prototype._addMessageToIconWidget = function(newMessage, iconWidget)
{
	if (oFF.notNull(newMessage) && oFF.notNull(iconWidget))
	{
		iconWidget.addMessage(newMessage.getTitle(), newMessage.getSubtitle(), newMessage.getDescription(), newMessage.getMessageGroup().getDisplayName());
		if (!iconWidget.isVisible() && iconWidget.getNumberOfMessages() > 0)
		{
			iconWidget.setVisible(true);
		}
	}
};
oFF.HuHorizonStatusBarManager.prototype._clearMessagesByType = function(messageType)
{
	if (messageType === oFF.HuMessageType.INFORMATION)
	{
		this._clearMessagesForIconWidget(this._getInfoMessageIcon());
	}
	else if (messageType === oFF.HuMessageType.SUCCESS)
	{
		this._clearMessagesForIconWidget(this._getSuccessMessageIcon());
	}
	else if (messageType === oFF.HuMessageType.WARNING)
	{
		this._clearMessagesForIconWidget(this._getWarningMessageIcon());
	}
	else if (messageType === oFF.HuMessageType.ERROR)
	{
		this._clearMessagesForIconWidget(this._getErrorMessageIcon());
	}
};
oFF.HuHorizonStatusBarManager.prototype._clearAllMessages = function()
{
	this._clearMessagesByType(oFF.HuMessageType.INFORMATION);
	this._clearMessagesByType(oFF.HuMessageType.SUCCESS);
	this._clearMessagesByType(oFF.HuMessageType.WARNING);
	this._clearMessagesByType(oFF.HuMessageType.ERROR);
};
oFF.HuHorizonStatusBarManager.prototype._clearMessagesForIconWidget = function(iconWidget)
{
	if (oFF.notNull(iconWidget))
	{
		iconWidget.clearAllMessages();
		if (iconWidget.isVisible() && iconWidget.getNumberOfMessages() === 0)
		{
			iconWidget.setVisible(false);
		}
	}
};
oFF.HuHorizonStatusBarManager.prototype._postClearMessagesPressedNotification = function(messageType)
{
	var notifyData = oFF.XNotificationData.create();
	notifyData.putXObject(oFF.HuHorizonInternalNotifications.STATUS_BAR_MANAGER_CLEAR_MESSAGES_PRESSED_MESSAGE_TYPE_NOTIFY_DATA, messageType);
	this.getLocalNotificationCenter().postNotificationWithName(oFF.HuHorizonInternalNotifications.STATUS_BAR_MANAGER_CLEAR_MESSAGES_PRESSED, notifyData);
};
oFF.HuHorizonStatusBarManager.prototype._observeStatusChangedNotification = function()
{
	if (oFF.XStringUtils.isNullOrEmpty(this.m_statusChangedObserverId))
	{
		this.m_statusChangedObserverId = this.getLocalNotificationCenter().addObserverForName(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_STATUS_CHANGED,  function(notifyData){
			var newStatusMsg = notifyData.getStringByKey(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_STATUS_CHANGED_NEW_STATUS_NOTIFI_DATA);
			this.setStatusMessage(newStatusMsg);
		}.bind(this));
	}
};
oFF.HuHorizonStatusBarManager.prototype._observeNewMessagesNotification = function()
{
	if (oFF.XStringUtils.isNullOrEmpty(this.m_newMessagesObserverId))
	{
		this.m_newMessagesObserverId = this.getLocalNotificationCenter().addObserverForName(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_NEW_MESSAGE,  function(notifyData){
			var newMessage = notifyData.getXObjectByKey(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_NEW_MESSAGE_MESSAGE_NOTIFI_DATA);
			this._addMessage(newMessage);
		}.bind(this));
	}
};
oFF.HuHorizonStatusBarManager.prototype._observeClearMessagesNotification = function()
{
	if (oFF.XStringUtils.isNullOrEmpty(this.m_clearMessagesObserverId))
	{
		this.m_clearMessagesObserverId = this.getLocalNotificationCenter().addObserverForName(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_CLEAR_MESSAGES,  function(notifyData){
			var messageType = notifyData.getXObjectByKey(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_CLEAR_MESSAGES_MESSAGE_TYPE_NOTIFI_DATA);
			this._clearMessagesByType(messageType);
		}.bind(this));
	}
};
oFF.HuHorizonStatusBarManager.prototype._observeClearAllMessagesNotification = function()
{
	if (oFF.XStringUtils.isNullOrEmpty(this.m_clearAllMessagesObserverId))
	{
		this.m_clearAllMessagesObserverId = this.getLocalNotificationCenter().addObserverForName(oFF.HuHorizonInternalNotifications.MESSAGE_MANAGER_CLEAR_ALL_MESSAGES,  function(notifyData){
			this._clearAllMessages();
		}.bind(this));
	}
};

oFF.HuHorizonToolbarManager = function() {};
oFF.HuHorizonToolbarManager.prototype = new oFF.HuDfHorizonUiManager();
oFF.HuHorizonToolbarManager.prototype._ff_c = "HuHorizonToolbarManager";

oFF.HuHorizonToolbarManager.create = function(toolsContext, genesis)
{
	var newInstance = new oFF.HuHorizonToolbarManager();
	newInstance.setupManagerWithGenesis(toolsContext, genesis);
	return newInstance;
};
oFF.HuHorizonToolbarManager.prototype.m_toolbarWidget = null;
oFF.HuHorizonToolbarManager.prototype.m_groupMap = null;
oFF.HuHorizonToolbarManager.prototype.releaseObject = function()
{
	this.m_groupMap.clear();
	this.m_groupMap = oFF.XObjectExt.release(this.m_groupMap);
	this.m_toolbarWidget = oFF.XObjectExt.release(this.m_toolbarWidget);
	oFF.HuDfHorizonUiManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonToolbarManager.prototype.setupManager = function()
{
	this.m_groupMap = oFF.XLinkedHashMapByString.create();
};
oFF.HuHorizonToolbarManager.prototype.getManagerName = function()
{
	return "Toolbar Manager";
};
oFF.HuHorizonToolbarManager.prototype.getView = function()
{
	return this.createToolbarIfNeeded().getView();
};
oFF.HuHorizonToolbarManager.prototype.setToolbarVisible = function(visible)
{
	this.createToolbarIfNeeded().getView().setVisible(visible);
};
oFF.HuHorizonToolbarManager.prototype.isToolbarVisible = function()
{
	return this.createToolbarIfNeeded().getView().isVisible();
};
oFF.HuHorizonToolbarManager.prototype.createNewGroup = function(groupName)
{
	var tmpGroup = this.getGroupByName(groupName);
	if (oFF.isNull(tmpGroup))
	{
		tmpGroup = this.createToolbarIfNeeded().getToolbarSection().newGroup();
		this.m_groupMap.put(groupName, tmpGroup);
	}
	return tmpGroup;
};
oFF.HuHorizonToolbarManager.prototype.getGroupByName = function(groupName)
{
	return this.m_groupMap.getByKey(groupName);
};
oFF.HuHorizonToolbarManager.prototype.getGroupByNameCreateIfNeeded = function(groupName)
{
	var tmpGroup = this.getGroupByName(groupName);
	if (oFF.isNull(tmpGroup))
	{
		tmpGroup = this.createNewGroup(groupName);
	}
	return tmpGroup;
};
oFF.HuHorizonToolbarManager.prototype.hasItems = function()
{
	if (oFF.notNull(this.m_groupMap) && this.m_groupMap.hasElements())
	{
		var foundGroup = oFF.XCollectionUtils.findFirst(this.m_groupMap,  function(tmpGroup){
			return tmpGroup.getItems() !== null && tmpGroup.getItems().hasElements();
		}.bind(this));
		return oFF.notNull(foundGroup);
	}
	return false;
};
oFF.HuHorizonToolbarManager.prototype.renderToolbar = function()
{
	if (oFF.notNull(this.m_groupMap) && this.m_groupMap.hasElements())
	{
		oFF.XCollectionUtils.forEach(this.m_groupMap,  function(tmpGroup){
			this.createToolbarIfNeeded().getToolbarSection().addGroup(tmpGroup);
		}.bind(this));
	}
};
oFF.HuHorizonToolbarManager.prototype.clearToolbarGroups = function()
{
	this.m_groupMap.clear();
	this.createToolbarIfNeeded().clearItems();
};
oFF.HuHorizonToolbarManager.prototype.createToolbarIfNeeded = function()
{
	if (oFF.isNull(this.m_toolbarWidget))
	{
		this.m_toolbarWidget = oFF.UtToolbarWidget.create(this.getGenesis());
		this.m_toolbarWidget.addCssClass("ffHorizonToolbar");
	}
	return this.m_toolbarWidget;
};

oFF.HuHorizonViewManager = function() {};
oFF.HuHorizonViewManager.prototype = new oFF.HuDfHorizonUiManager();
oFF.HuHorizonViewManager.prototype._ff_c = "HuHorizonViewManager";

oFF.HuHorizonViewManager.create = function(toolsContext, genesis, wrapperCssClass)
{
	var newInstance = new oFF.HuHorizonViewManager();
	newInstance._setWrapperCssClass(wrapperCssClass);
	newInstance.setupManagerWithGenesis(toolsContext, genesis);
	return newInstance;
};
oFF.HuHorizonViewManager.prototype.m_viewWrapper = null;
oFF.HuHorizonViewManager.prototype.m_mainInteractiveSplitter = null;
oFF.HuHorizonViewManager.prototype.m_wrapperCssClass = null;
oFF.HuHorizonViewManager.prototype.m_splitterItemMap = null;
oFF.HuHorizonViewManager.prototype.releaseObject = function()
{
	this.m_mainInteractiveSplitter = oFF.XObjectExt.release(this.m_mainInteractiveSplitter);
	this.m_viewWrapper = oFF.XObjectExt.release(this.m_viewWrapper);
	this.m_splitterItemMap = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_splitterItemMap);
	oFF.HuDfHorizonUiManager.prototype.releaseObject.call( this );
};
oFF.HuHorizonViewManager.prototype.setupManager = function()
{
	this.m_splitterItemMap = oFF.XHashMapByString.create();
	this.m_viewWrapper = this.getGenesis().newControl(oFF.UiType.CONTENT_WRAPPER);
	this.m_viewWrapper.addCssClass(this.m_wrapperCssClass);
	this.m_viewWrapper.setMinHeight(oFF.UiCssLength.create("0"));
	this.m_viewWrapper.useMaxSpace();
	this.m_viewWrapper.setFlex("1");
};
oFF.HuHorizonViewManager.prototype.getManagerName = function()
{
	return "View Manager";
};
oFF.HuHorizonViewManager.prototype.getView = function()
{
	return this.m_viewWrapper;
};
oFF.HuHorizonViewManager.prototype.addPluginView = function(viewPluginController)
{
	if (oFF.notNull(viewPluginController) && !this.m_splitterItemMap.containsKey(viewPluginController.getUuid()))
	{
		var splitterItem = this._createAndAddViewPluginWrapper(viewPluginController);
		this.m_splitterItemMap.put(viewPluginController.getUuid(), splitterItem);
	}
};
oFF.HuHorizonViewManager.prototype.removePluginView = function(viewPluginController)
{
	if (oFF.notNull(viewPluginController))
	{
		var tmpSplitterItem = this.m_splitterItemMap.remove(viewPluginController.getUuid());
		if (oFF.notNull(tmpSplitterItem))
		{
			this._getMainInteractiveSplitter().removeItem(tmpSplitterItem);
			tmpSplitterItem = oFF.XObjectExt.release(tmpSplitterItem);
		}
	}
};
oFF.HuHorizonViewManager.prototype.isPluginVisible = function(viewPluginController)
{
	if (oFF.notNull(viewPluginController))
	{
		return this.m_splitterItemMap.containsKey(viewPluginController.getUuid());
	}
	return false;
};
oFF.HuHorizonViewManager.prototype._setWrapperCssClass = function(cssClass)
{
	this.m_wrapperCssClass = cssClass;
};
oFF.HuHorizonViewManager.prototype._getMainInteractiveSplitter = function()
{
	if (oFF.isNull(this.m_mainInteractiveSplitter))
	{
		this.m_mainInteractiveSplitter = this.m_viewWrapper.setNewContent(oFF.UiType.INTERACTIVE_SPLITTER);
		this.m_mainInteractiveSplitter.setOrientation(oFF.UiOrientation.HORIZONTAL);
		this.m_mainInteractiveSplitter.setEnableReordering(false);
		this.m_mainInteractiveSplitter.useMaxSpace();
	}
	return this.m_mainInteractiveSplitter;
};
oFF.HuHorizonViewManager.prototype._createAndAddViewPluginWrapper = function(viewPluginController)
{
	if (oFF.notNull(viewPluginController))
	{
		var splitterItem = this._getMainInteractiveSplitter().addNewItem();
		splitterItem.setContent(viewPluginController.getPluginWrapperView());
		if (viewPluginController.getPluginContainerConfig() !== null && viewPluginController.getPluginContainerConfig().getSize().getWidth() !== null)
		{
			splitterItem.setWidth(viewPluginController.getPluginContainerConfig().getSize().getWidth());
		}
		splitterItem.registerOnResize(oFF.UiLambdaResizeListener.create( function(resizeEvent){
			viewPluginController.onPluginContainerResize(resizeEvent.getOffsetWidth(), resizeEvent.getOffsetHeight());
		}.bind(this)));
		this._getMainInteractiveSplitter().addItem(splitterItem);
		return splitterItem;
	}
	return null;
};

oFF.HuHorizon = function() {};
oFF.HuHorizon.prototype = new oFF.DfUiProgram();
oFF.HuHorizon.prototype._ff_c = "HuHorizon";

oFF.HuHorizon.DEFAULT_PROGRAM_NAME = "Horizon";
oFF.HuHorizon.createRunnerWithConfiguration = function(parentProcess, configStr)
{
	var tmpRunner = oFF.ProgramRunner.createRunner(parentProcess, oFF.HuHorizon.DEFAULT_PROGRAM_NAME);
	tmpRunner.setArgument(oFF.HuHorizonConstants.PARAM_CONFIG, configStr);
	return tmpRunner;
};
oFF.HuHorizon.prototype.m_controller = null;
oFF.HuHorizon.prototype.m_allNotificationsObserverUuid = null;
oFF.HuHorizon.prototype.newProgram = function()
{
	var prg = new oFF.HuHorizon();
	prg.setup();
	return prg;
};
oFF.HuHorizon.prototype.getProgramName = function()
{
	return oFF.HuHorizon.DEFAULT_PROGRAM_NAME;
};
oFF.HuHorizon.prototype.releaseObject = function()
{
	this._deregisterAllNotificationsObserver();
	this.m_controller = oFF.XObjectExt.release(this.m_controller);
	oFF.DfUiProgram.prototype.releaseObject.call( this );
};
oFF.HuHorizon.prototype.getLogSeverity = function()
{
	return oFF.DfUiProgram.prototype.getLogSeverity.call( this );
};
oFF.HuHorizon.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("70vw", "70vh");
};
oFF.HuHorizon.prototype.isShowMenuBar = function()
{
	return true;
};
oFF.HuHorizon.prototype.getMenuBarDisplayName = function()
{
	return null;
};
oFF.HuHorizon.prototype.canTerminate = function()
{
	return oFF.DfUiProgram.prototype.canTerminate.call( this );
};
oFF.HuHorizon.prototype.getContainerCssClass = function()
{
	return "ffHorizonProgram";
};
oFF.HuHorizon.prototype.showActivityIndicatorOnSetupPromise = function()
{
	return false;
};
oFF.HuHorizon.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.HuHorizonConstants.PARAM_CONFIG, "A stringified json containing the horizon configuration.");
	metadata.addParameter(oFF.HuHorizonConstants.PARAM_CONFIG_FILE, "A path pointing to a file containing the configuration.");
	metadata.addParameter(oFF.HuHorizonConstants.PARAM_WORKSPACE, "A path to the workspace directory which should be used.");
};
oFF.HuHorizon.prototype.processArguments = function(args) {};
oFF.HuHorizon.prototype.setupProgram = function()
{
	var prgArgs = this.getArguments();
	var argConfig = prgArgs.getStringByKey(oFF.HuHorizonConstants.PARAM_CONFIG);
	var argConfigFile = prgArgs.getStringByKey(oFF.HuHorizonConstants.PARAM_CONFIG_FILE);
	var argWorkspacePath = prgArgs.getStringByKey(oFF.HuHorizonConstants.PARAM_WORKSPACE);
	this.m_controller = oFF.HuHorizonMainController.create(this);
	this._registerPluginStartedObserver();
	this._registerAllNotificationsObserver();
	return this.m_controller.initiateBoot(argConfig, argConfigFile, argWorkspacePath);
};
oFF.HuHorizon.prototype.buildUi = function(genesis) {};
oFF.HuHorizon.prototype.getLogger = function()
{
	return this._getController().getLogger();
};
oFF.HuHorizon.prototype.getLogContextName = function()
{
	return "Program";
};
oFF.HuHorizon.prototype.logInfo = function(logline)
{
	this.getLogger().logInfo(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuHorizon.prototype.logDebug = function(logline)
{
	this.getLogger().logDebug(oFF.HuUtils.formatLogWithContextName(this.getLogContextName(), logline));
};
oFF.HuHorizon.prototype.executeAction = function(actionId, customData)
{
	if (this._getController() !== null && this._getController().getCommandManager() !== null)
	{
		return this._getController().getCommandManager().executeAction(actionId, this._getController(), customData);
	}
	return oFF.XPromise.reject(oFF.XError.create("Failed to execute action! Unknown error!"));
};
oFF.HuHorizon.prototype._getController = function()
{
	return this.m_controller;
};
oFF.HuHorizon.prototype._registerPluginStartedObserver = function()
{
	this.getLocalNotificationCenter().addObserverForName(oFF.HuHorizonInternalNotifications.PLUGIN_STARTED,  function(data){
		this.logDebug(oFF.HuHorizonInternalNotifications.PLUGIN_STARTED);
		this.logDebug(data.getStringByKey(oFF.HuHorizonInternalNotifications.PLUGIN_STARTED_PLUGIN_NAME_NOTIFI_DATA));
		var tmpPluginType = data.getXObjectByKey(oFF.HuHorizonInternalNotifications.PLUGIN_STARTED_PLUGIN_TYPE_NOTIFI_DATA);
		if (oFF.notNull(tmpPluginType))
		{
			this.logDebug(tmpPluginType.getName());
		}
	}.bind(this));
};
oFF.HuHorizon.prototype._registerAllNotificationsObserver = function()
{
	if (this._getController().isDebugMode())
	{
		var notificationCenterBase = this.getLocalNotificationCenter();
		this.m_allNotificationsObserverUuid = notificationCenterBase.addAllObserverConsumer( function(notifyName, notifyData){
			this.logDebug(oFF.XStringUtils.concatenate2("Notification posted -> ", notifyName));
		}.bind(this));
	}
};
oFF.HuHorizon.prototype._deregisterAllNotificationsObserver = function()
{
	var notificationCenterBase = this.getLocalNotificationCenter();
	notificationCenterBase.removeAllObserverByUuid(this.m_allNotificationsObserverUuid);
};
oFF.HuHorizon.prototype.getProgramMenu = function()
{
	return this.getMenuBar();
};
oFF.HuHorizon.prototype.setProgramMenuVisible = function(visible)
{
	this.showMenuBar(visible);
};
oFF.HuHorizon.prototype.isProgramMenuVisible = function()
{
	return this.isMenuBarVisible();
};
oFF.HuHorizon.prototype.addProgramMenuButton = function(text, icon, pressConsumer)
{
	return this.addMenuBarButton(text, icon, null, pressConsumer);
};
oFF.HuHorizon.prototype.setContainerTitle = function(newTitle)
{
	this.setTitle(newTitle);
};
oFF.HuHorizon.prototype.isContainerEmbedded = function()
{
	return this.isEmbedded();
};

oFF.HuPluginListDialog = function() {};
oFF.HuPluginListDialog.prototype = new oFF.DfUiDialogProgram();
oFF.HuPluginListDialog.prototype._ff_c = "HuPluginListDialog";

oFF.HuPluginListDialog.DEFAULT_PROGRAM_NAME = "HorizonPluginListDialog";
oFF.HuPluginListDialog.PARAM_SHOW_ALL = "showAll";
oFF.HuPluginListDialog.prototype.m_searchableListView = null;
oFF.HuPluginListDialog.prototype.m_pluginDetailsContainer = null;
oFF.HuPluginListDialog.prototype.m_isShowAll = false;
oFF.HuPluginListDialog.prototype.newProgram = function()
{
	var prg = new oFF.HuPluginListDialog();
	prg.setup();
	return prg;
};
oFF.HuPluginListDialog.prototype.getProgramName = function()
{
	return oFF.HuPluginListDialog.DEFAULT_PROGRAM_NAME;
};
oFF.HuPluginListDialog.prototype.releaseObject = function()
{
	this.m_searchableListView = oFF.XObjectExt.release(this.m_searchableListView);
	this.m_pluginDetailsContainer = oFF.XObjectExt.release(this.m_pluginDetailsContainer);
	oFF.DfUiDialogProgram.prototype.releaseObject.call( this );
};
oFF.HuPluginListDialog.prototype.getLogSeverity = function()
{
	return oFF.DfUiDialogProgram.prototype.getLogSeverity.call( this );
};
oFF.HuPluginListDialog.prototype.getDialogButtons = function(genesis)
{
	var closeBtn = genesis.newControl(oFF.UiType.DIALOG_BUTTON);
	closeBtn.setText("Close");
	closeBtn.setIcon("sys-cancel-2");
	closeBtn.registerOnPress(oFF.UiLambdaPressListener.create( function(event){
		this.terminate();
	}.bind(this)));
	var tmpList = oFF.XList.create();
	tmpList.add(closeBtn);
	return tmpList;
};
oFF.HuPluginListDialog.prototype.getDefaultContainerSize = function()
{
	return oFF.UiSize.createByCss("800px", "60vh");
};
oFF.HuPluginListDialog.prototype.prepareProgramMetadata = function(metadata)
{
	metadata.addParameter(oFF.HuPluginListDialog.PARAM_SHOW_ALL, "Whether to show all the plugins, including debug ones!");
};
oFF.HuPluginListDialog.prototype.processArguments = function(args)
{
	this.m_isShowAll = args.getBooleanByKeyExt(oFF.HuPluginListDialog.PARAM_SHOW_ALL, false);
};
oFF.HuPluginListDialog.prototype.setupProgram = function()
{
	this.setTitle("Horizon Plugin List");
	return null;
};
oFF.HuPluginListDialog.prototype.buildUi = function(genesis)
{
	var mainLayout = genesis.newControl(oFF.UiType.FLEX_LAYOUT);
	mainLayout.useMaxSpace();
	mainLayout.setDirection(oFF.UiFlexDirection.ROW);
	mainLayout.setAlignItems(oFF.UiFlexAlignItems.CENTER);
	mainLayout.setJustifyContent(oFF.UiFlexJustifyContent.CENTER);
	mainLayout.setWrap(oFF.UiFlexWrap.NO_WRAP);
	mainLayout.setBackgroundDesign(oFF.UiBackgroundDesign.SOLID);
	this.m_searchableListView = oFF.UtSearchableListView.create(this.getGenesis(), null);
	this.m_searchableListView.setSearchFieldPlaceholder("Search plugin...");
	this.m_searchableListView.setListItemSelectedConsumer( function(selectedListItem){
		var tmpPluginDef = selectedListItem.getCustomObject();
		this.updateDetails(tmpPluginDef);
	}.bind(this));
	var searchableListWrapper = this.m_searchableListView.getView();
	searchableListWrapper.setWidth(oFF.UiCssLength.create("250px"));
	searchableListWrapper.setFlex("0 0 250px ");
	searchableListWrapper.setBorderWidth(oFF.UiCssBoxEdges.create("0px 1px 0px 0px"));
	searchableListWrapper.setBorderColor(oFF.UiColor.GREY);
	searchableListWrapper.setBorderStyle(oFF.UiBorderStyle.SOLID);
	mainLayout.addItem(searchableListWrapper);
	this.m_pluginDetailsContainer = mainLayout.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
	this.m_pluginDetailsContainer.useMaxHeight();
	this.m_pluginDetailsContainer.setDirection(oFF.UiFlexDirection.COLUMN);
	this.m_pluginDetailsContainer.setJustifyContent(oFF.UiFlexJustifyContent.START);
	this.m_pluginDetailsContainer.setAlignItems(oFF.UiFlexAlignItems.START);
	this.m_pluginDetailsContainer.setMinWidth(oFF.UiCssLength.create("0"));
	this.m_pluginDetailsContainer.setFlex("auto");
	this.m_pluginDetailsContainer.setBackgroundColor(oFF.UiColor.WHITE);
	genesis.setRoot(mainLayout);
	this.prepareUi();
};
oFF.HuPluginListDialog.prototype.prepareUi = function()
{
	this.fillPluginList();
	if (oFF.notNull(this.m_searchableListView) && this.m_searchableListView.getListItems().hasElements())
	{
		var tmpListItem = this.m_searchableListView.getListItems().get(0);
		this.m_searchableListView.selectItem(tmpListItem);
		var tmpPluginDef = tmpListItem.getCustomObject();
		this.updateDetails(tmpPluginDef);
	}
};
oFF.HuPluginListDialog.prototype.fillPluginList = function()
{
	if (oFF.notNull(this.m_searchableListView))
	{
		var sortedPluginNames = oFF.HuPluginRegistration.getAllRegisteredPluginNames();
		var itemList = oFF.XList.create();
		oFF.XCollectionUtils.forEachString(sortedPluginNames,  function(pluginName){
			var tmpPluginDef = oFF.HuPluginRegistration.getPluginDef(pluginName);
			if (oFF.notNull(tmpPluginDef) && !tmpPluginDef.getPluginCategory().isDebug() || this.m_isShowAll)
			{
				var newListItem = this.getGenesis().newControl(oFF.UiType.LIST_ITEM);
				newListItem.setName(tmpPluginDef.getName());
				newListItem.setText(this.getListItemText(tmpPluginDef));
				newListItem.setCustomObject(tmpPluginDef);
				newListItem.setIcon(this.getIconForPlugin(tmpPluginDef));
				newListItem.setTooltip(tmpPluginDef.getName());
				newListItem.setHighlight(this.getHighlightForPlugin(tmpPluginDef));
				itemList.add(newListItem);
			}
		}.bind(this));
		if (oFF.notNull(itemList) && itemList.hasElements())
		{
			this.m_searchableListView.setListItems(itemList);
		}
	}
};
oFF.HuPluginListDialog.prototype.updateDetails = function(pluginDef)
{
	if (oFF.notNull(this.m_pluginDetailsContainer) && oFF.notNull(pluginDef))
	{
		this.m_pluginDetailsContainer.clearItems();
		this.showPluginDetails(pluginDef);
	}
};
oFF.HuPluginListDialog.prototype.showPluginDetails = function(pluginDef)
{
	if (oFF.notNull(this.m_pluginDetailsContainer))
	{
		var detailsLayout = this.m_pluginDetailsContainer.addNewItemOfType(oFF.UiType.FLEX_LAYOUT);
		detailsLayout.setDirection(oFF.UiFlexDirection.COLUMN);
		detailsLayout.useMaxWidth();
		detailsLayout.useMaxHeight();
		detailsLayout.setPadding(oFF.UiCssBoxEdges.create("0.5rem"));
		var pluginTitle = detailsLayout.addNewItemOfType(oFF.UiType.TITLE);
		pluginTitle.setText(this.getListItemText(pluginDef));
		pluginTitle.setTitleLevel(oFF.UiTitleLevel.H_4);
		pluginTitle.setTitleStyle(oFF.UiTitleLevel.H_4);
		pluginTitle.setMargin(oFF.UiCssBoxEdges.create("0.5rem"));
		pluginTitle.setWrapping(false);
		pluginTitle.setFlex("0 0 auto");
		pluginTitle.setBorderColor(oFF.UiColor.GREY);
		pluginTitle.setBorderWidth(oFF.UiCssBoxEdges.create("0px 0px 1px 0px"));
		pluginTitle.setBorderStyle(oFF.UiBorderStyle.SOLID);
		var pluginNameLbl = this.createNewLabel("Plugin name", pluginDef.getName(), true);
		detailsLayout.addItem(pluginNameLbl);
		var pluginTypeLbl = this.createNewLabel("Plugin type", pluginDef.getPluginType() !== null ? pluginDef.getPluginType().getName() : "Unknown", true);
		detailsLayout.addItem(pluginTypeLbl);
		var descriptionLbl = this.createNewLabel("Description", pluginDef.getDescription(), true);
		detailsLayout.addItem(descriptionLbl);
		var categoryLbl = this.createNewLabel("Category", pluginDef.getPluginCategory().getName(), true);
		detailsLayout.addItem(categoryLbl);
		var isPluginLoadedLbl = this.createNewLabel("Is loaded", pluginDef.isPluginLoaded() ? "Yes" : "No", true);
		detailsLayout.addItem(isPluginLoadedLbl);
		var hasManifestLbl = this.createNewLabel("Has manifest", pluginDef.getManifest() !== null ? "Yes" : "No", true);
		detailsLayout.addItem(hasManifestLbl);
		var modulesLbl = this.createNewLabel("Modules", oFF.XCollectionUtils.join(pluginDef.getDependencies(), ", "), true);
		detailsLayout.addItem(modulesLbl);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(pluginDef.getUrl()))
		{
			var sourceUrlLbl = this.createNewLabel("Source url", pluginDef.getUrl(), true);
			detailsLayout.addItem(sourceUrlLbl);
		}
	}
};
oFF.HuPluginListDialog.prototype.createNewLabel = function(label, text, wrapping)
{
	var labelLayout = this.getGenesis().newControl(oFF.UiType.FLEX_LAYOUT);
	labelLayout.setDirection(oFF.UiFlexDirection.ROW);
	labelLayout.setMargin(oFF.UiCssBoxEdges.create("5px"));
	var tmpLabelLbl = labelLayout.addNewItemOfType(oFF.UiType.LABEL);
	tmpLabelLbl.setText(oFF.XStringUtils.concatenate2(label, ": "));
	tmpLabelLbl.setFlex("0 0 100px");
	var tmpTextLbl = labelLayout.addNewItemOfType(oFF.UiType.LABEL);
	tmpTextLbl.setText(oFF.XStringUtils.isNotNullAndNotEmpty(text) ? text : "-");
	tmpTextLbl.setFontWeight(oFF.UiFontWeight.BOLD);
	tmpTextLbl.setWrapping(wrapping);
	return labelLayout;
};
oFF.HuPluginListDialog.prototype.getListItemText = function(tmpPluginDef)
{
	var itemText = "Unknown";
	if (oFF.notNull(tmpPluginDef))
	{
		itemText = tmpPluginDef.getDisplayName();
		if (oFF.XStringUtils.isNullOrEmpty(itemText))
		{
			itemText = tmpPluginDef.getName();
		}
	}
	return itemText;
};
oFF.HuPluginListDialog.prototype.getIconForPlugin = function(pluginDef)
{
	if (oFF.notNull(pluginDef))
	{
		if (pluginDef.getPluginType() === oFF.HuHorizonPluginType.COMPONENT)
		{
			return "screen-split-two";
		}
		else if (pluginDef.getPluginType() === oFF.HuHorizonPluginType.DOCUMENT)
		{
			return "document";
		}
		else if (pluginDef.getPluginType() === oFF.HuHorizonPluginType.COMMAND)
		{
			return "command-line-interfaces";
		}
	}
	return "question-mark";
};
oFF.HuPluginListDialog.prototype.getHighlightForPlugin = function(pluginDef)
{
	if (oFF.notNull(pluginDef))
	{
		if (pluginDef.isPluginFullyValid())
		{
			return oFF.UiMessageType.SUCCESS;
		}
		else if (pluginDef.canBeInitialized())
		{
			return oFF.UiMessageType.INFORMATION;
		}
	}
	return oFF.UiMessageType.ERROR;
};

oFF.HorizonUiModule = function() {};
oFF.HorizonUiModule.prototype = new oFF.DfModule();
oFF.HorizonUiModule.prototype._ff_c = "HorizonUiModule";

oFF.HorizonUiModule.s_module = null;
oFF.HorizonUiModule.getInstance = function()
{
	if (oFF.isNull(oFF.HorizonUiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.HorizonUiApiModule.getInstance());
		oFF.HorizonUiModule.s_module = oFF.DfModule.startExt(new oFF.HorizonUiModule());
		oFF.HuHorizonBootControllerStatus.staticSetup();
		oFF.HuHorizonControllerStatus.staticSetup();
		oFF.HuMessageType.staticSetup();
		oFF.HuMessageGroup.staticSetup();
		oFF.HuToolbarGroup.staticSetup();
		oFF.HuErrorType.staticSetupHorizon();
		oFF.HuPluginRegistration.staticSetup();
		oFF.ProgramRegistration.setProgramFactory(new oFF.HuHorizon());
		oFF.ProgramRegistration.setProgramFactory(new oFF.HuPluginListDialog());
		oFF.DfModule.stopExt(oFF.HorizonUiModule.s_module);
	}
	return oFF.HorizonUiModule.s_module;
};
oFF.HorizonUiModule.prototype.getName = function()
{
	return "ff3610.horizon.ui";
};

oFF.HorizonUiModule.getInstance();

return sap.firefly;
	} );
/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff3100.system.ui"
],
function(oFF)
{
"use strict";

oFF.HuPluginRegistrationApi = {

	s_pluginsClasses:null,
	staticSetup:function()
	{
			oFF.HuPluginRegistrationApi.s_pluginsClasses = oFF.XLinkedHashMapByString.create();
	},
	registerPluginByClass:function(pluginClass)
	{
			if (oFF.notNull(pluginClass))
		{
			try
			{
				var tmpInstance = pluginClass.newInstance(null);
				var pluginName = tmpInstance.getName();
				if (!oFF.HuPluginRegistrationApi.s_pluginsClasses.containsKey(pluginName))
				{
					oFF.HuPluginRegistrationApi.s_pluginsClasses.put(pluginName, pluginClass);
				}
				tmpInstance = null;
			}
			catch (e)
			{
				throw oFF.XException.createRuntimeException("Failed to register plugin class! Class might be invalid!");
			}
		}
	},
	getPluginClass:function(pluginName)
	{
			return oFF.HuPluginRegistrationApi.s_pluginsClasses.getByKey(pluginName);
	},
	getAllApiPlugins:function()
	{
			var tmpPluginNamesSorted = oFF.HuPluginRegistrationApi.s_pluginsClasses.getKeysAsReadOnlyListOfString().createListOfStringCopy();
		tmpPluginNamesSorted.sortByDirection(oFF.XSortDirection.ASCENDING);
		return tmpPluginNamesSorted;
	}
};

oFF.HuDfHorizonPlugin = function() {};
oFF.HuDfHorizonPlugin.prototype = new oFF.XObject();
oFF.HuDfHorizonPlugin.prototype._ff_c = "HuDfHorizonPlugin";

oFF.HuDfHorizonPlugin.prototype.getName = function()
{
	return this.getPluginName();
};
oFF.HuDfHorizonPlugin.prototype.processConfig = function(config) {};
oFF.HuDfHorizonPlugin.prototype.destroyPlugin = function()
{
	this._internalCleanup();
};
oFF.HuDfHorizonPlugin.prototype.getController = function()
{
	return this._getControllerInternal();
};
oFF.HuDfHorizonPlugin.prototype.getConfig = function()
{
	return this._getControllerInternal().getConfigJson();
};
oFF.HuDfHorizonPlugin.prototype.getDataSpace = function()
{
	return this._getControllerInternal().getDataSpace();
};
oFF.HuDfHorizonPlugin.prototype.executeAction = function(actionId, customObject)
{
	this._getControllerInternal().executeAction(actionId, customObject);
};
oFF.HuDfHorizonPlugin.prototype.addInfoMessage = function(title, subtitle, description)
{
	this.getController().addInfoMessage(title, subtitle, description);
};
oFF.HuDfHorizonPlugin.prototype.addSuccessMessage = function(title, subtitle, description)
{
	this.getController().addSuccessMessage(title, subtitle, description);
};
oFF.HuDfHorizonPlugin.prototype.addWarningMessage = function(title, subtitle, description)
{
	this.getController().addWarningMessage(title, subtitle, description);
};
oFF.HuDfHorizonPlugin.prototype.addErrorMessage = function(title, subtitle, description)
{
	this.getController().addErrorMessage(title, subtitle, description);
};

oFF.HuDfCommandPlugin = function() {};
oFF.HuDfCommandPlugin.prototype = new oFF.HuDfHorizonPlugin();
oFF.HuDfCommandPlugin.prototype._ff_c = "HuDfCommandPlugin";

oFF.HuDfCommandPlugin.prototype.m_commandController = null;
oFF.HuDfCommandPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMMAND;
};
oFF.HuDfCommandPlugin.prototype.setupPlugin = function(controller)
{
	this.m_commandController = controller;
	return null;
};
oFF.HuDfCommandPlugin.prototype._getControllerInternal = function()
{
	return this.getCommandController();
};
oFF.HuDfCommandPlugin.prototype._internalCleanup = function()
{
	this.m_commandController = null;
};
oFF.HuDfCommandPlugin.prototype.getCommandController = function()
{
	return this.m_commandController;
};

oFF.HuDfComponentPlugin = function() {};
oFF.HuDfComponentPlugin.prototype = new oFF.HuDfHorizonPlugin();
oFF.HuDfComponentPlugin.prototype._ff_c = "HuDfComponentPlugin";

oFF.HuDfComponentPlugin.prototype.m_componentController = null;
oFF.HuDfComponentPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.COMPONENT;
};
oFF.HuDfComponentPlugin.prototype.setupPlugin = function(controller)
{
	this.m_componentController = controller;
	return null;
};
oFF.HuDfComponentPlugin.prototype.onResize = function(offsetWidth, offsetHeight) {};
oFF.HuDfComponentPlugin.prototype.didBecameVisible = function() {};
oFF.HuDfComponentPlugin.prototype.didBecameHidden = function() {};
oFF.HuDfComponentPlugin.prototype._getControllerInternal = function()
{
	return this.getComponentController();
};
oFF.HuDfComponentPlugin.prototype._internalCleanup = function()
{
	this.m_componentController = null;
};
oFF.HuDfComponentPlugin.prototype.getComponentController = function()
{
	return this.m_componentController;
};

oFF.HuDfDocumentPlugin = function() {};
oFF.HuDfDocumentPlugin.prototype = new oFF.HuDfHorizonPlugin();
oFF.HuDfDocumentPlugin.prototype._ff_c = "HuDfDocumentPlugin";

oFF.HuDfDocumentPlugin.prototype.m_documentController = null;
oFF.HuDfDocumentPlugin.prototype.getPluginType = function()
{
	return oFF.HuHorizonPluginType.DOCUMENT;
};
oFF.HuDfDocumentPlugin.prototype.setupPlugin = function(controller)
{
	this.m_documentController = controller;
	return null;
};
oFF.HuDfDocumentPlugin.prototype.onResize = function(offsetWidth, offsetHeight) {};
oFF.HuDfDocumentPlugin.prototype.didBecameVisible = function() {};
oFF.HuDfDocumentPlugin.prototype.didBecameHidden = function() {};
oFF.HuDfDocumentPlugin.prototype._getControllerInternal = function()
{
	return this.getDocumentController();
};
oFF.HuDfDocumentPlugin.prototype._internalCleanup = function()
{
	this.m_documentController = null;
};
oFF.HuDfDocumentPlugin.prototype.getDocumentController = function()
{
	return this.m_documentController;
};
oFF.HuDfDocumentPlugin.prototype.getGlobalDataSpace = function()
{
	return this.getDocumentController().getGlobalDataSpace();
};

oFF.HuHorizonPluginCategory = function() {};
oFF.HuHorizonPluginCategory.prototype = new oFF.UiBaseConstant();
oFF.HuHorizonPluginCategory.prototype._ff_c = "HuHorizonPluginCategory";

oFF.HuHorizonPluginCategory.SYSTEM = null;
oFF.HuHorizonPluginCategory.OLAP = null;
oFF.HuHorizonPluginCategory.TOOL = null;
oFF.HuHorizonPluginCategory.DEBUG = null;
oFF.HuHorizonPluginCategory.OTHER = null;
oFF.HuHorizonPluginCategory.s_lookup = null;
oFF.HuHorizonPluginCategory.staticSetup = function()
{
	oFF.HuHorizonPluginCategory.s_lookup = oFF.XHashMapByString.create();
	oFF.HuHorizonPluginCategory.SYSTEM = oFF.HuHorizonPluginCategory.createWithName("System");
	oFF.HuHorizonPluginCategory.OLAP = oFF.HuHorizonPluginCategory.createWithName("Olap");
	oFF.HuHorizonPluginCategory.TOOL = oFF.HuHorizonPluginCategory.createWithName("Tool");
	oFF.HuHorizonPluginCategory.DEBUG = oFF.HuHorizonPluginCategory.createWithName("Debug").setIsDebug();
	oFF.HuHorizonPluginCategory.OTHER = oFF.HuHorizonPluginCategory.createWithName("Other");
};
oFF.HuHorizonPluginCategory.createWithName = function(name)
{
	var newType = oFF.UiBaseConstant.createUiConstant(new oFF.HuHorizonPluginCategory(), name, oFF.HuHorizonPluginCategory.s_lookup);
	newType.m_isDebug = false;
	return newType;
};
oFF.HuHorizonPluginCategory.lookup = function(name)
{
	return oFF.UiBaseConstant.lookupConstant(name, oFF.HuHorizonPluginCategory.s_lookup);
};
oFF.HuHorizonPluginCategory.prototype.m_isDebug = false;
oFF.HuHorizonPluginCategory.prototype.isDebug = function()
{
	return this.m_isDebug;
};
oFF.HuHorizonPluginCategory.prototype.setIsDebug = function()
{
	this.m_isDebug = true;
	return this;
};

oFF.HuHorizonPluginType = function() {};
oFF.HuHorizonPluginType.prototype = new oFF.UiBaseConstant();
oFF.HuHorizonPluginType.prototype._ff_c = "HuHorizonPluginType";

oFF.HuHorizonPluginType.COMPONENT = null;
oFF.HuHorizonPluginType.DOCUMENT = null;
oFF.HuHorizonPluginType.COMMAND = null;
oFF.HuHorizonPluginType.TOOLBAR_EXTENSION = null;
oFF.HuHorizonPluginType.MENU_EXTENSION = null;
oFF.HuHorizonPluginType.s_lookup = null;
oFF.HuHorizonPluginType.staticSetup = function()
{
	oFF.HuHorizonPluginType.s_lookup = oFF.XHashMapByString.create();
	oFF.HuHorizonPluginType.COMPONENT = oFF.HuHorizonPluginType.createWithName("Component").setHasUi();
	oFF.HuHorizonPluginType.DOCUMENT = oFF.HuHorizonPluginType.createWithName("Document").setHasUi();
	oFF.HuHorizonPluginType.COMMAND = oFF.HuHorizonPluginType.createWithName("Command");
	oFF.HuHorizonPluginType.TOOLBAR_EXTENSION = oFF.HuHorizonPluginType.createWithName("ToolbarExtension");
	oFF.HuHorizonPluginType.MENU_EXTENSION = oFF.HuHorizonPluginType.createWithName("MenuExtension");
};
oFF.HuHorizonPluginType.createWithName = function(name)
{
	var newType = oFF.UiBaseConstant.createUiConstant(new oFF.HuHorizonPluginType(), name, oFF.HuHorizonPluginType.s_lookup);
	newType.m_hasUi = false;
	return newType;
};
oFF.HuHorizonPluginType.lookup = function(name)
{
	return oFF.UiBaseConstant.lookupConstant(name, oFF.HuHorizonPluginType.s_lookup);
};
oFF.HuHorizonPluginType.prototype.m_hasUi = false;
oFF.HuHorizonPluginType.prototype.hasUi = function()
{
	return this.m_hasUi;
};
oFF.HuHorizonPluginType.prototype.setHasUi = function()
{
	this.m_hasUi = true;
	return this;
};

oFF.HorizonUiApiModule = function() {};
oFF.HorizonUiApiModule.prototype = new oFF.DfModule();
oFF.HorizonUiApiModule.prototype._ff_c = "HorizonUiApiModule";

oFF.HorizonUiApiModule.s_module = null;
oFF.HorizonUiApiModule.getInstance = function()
{
	if (oFF.isNull(oFF.HorizonUiApiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.SystemUiModule.getInstance());
		oFF.HorizonUiApiModule.s_module = oFF.DfModule.startExt(new oFF.HorizonUiApiModule());
		oFF.HuHorizonPluginType.staticSetup();
		oFF.HuHorizonPluginCategory.staticSetup();
		oFF.HuPluginRegistrationApi.staticSetup();
		oFF.DfModule.stopExt(oFF.HorizonUiApiModule.s_module);
	}
	return oFF.HorizonUiApiModule.s_module;
};
oFF.HorizonUiApiModule.prototype.getName = function()
{
	return "ff3600.horizon.ui.api";
};

oFF.HorizonUiApiModule.getInstance();

return sap.firefly;
	} );
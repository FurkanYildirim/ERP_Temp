/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff1040.kernel.native"
],
function(oFF)
{
"use strict";

oFF.DataManifestConstants = {

};

oFF.DpBindingFactory = function() {};
oFF.DpBindingFactory.prototype = new oFF.XObject();
oFF.DpBindingFactory.prototype._ff_c = "DpBindingFactory";

oFF.DpBindingFactory.s_factories = null;
oFF.DpBindingFactory.staticSetup = function()
{
	oFF.DpBindingFactory.s_factories = oFF.XHashMapByString.create();
};
oFF.DpBindingFactory.registerFactory = function(componentType, factory)
{
	oFF.DpBindingFactory.s_factories.put(componentType.getName(), factory);
};
oFF.DpBindingFactory.createBindingProvider = function(component, path)
{
	var factory = null;
	var componentType = component.getComponentType();
	while (oFF.notNull(componentType))
	{
		var name = componentType.getName();
		factory = oFF.DpBindingFactory.s_factories.getByKey(name);
		if (oFF.notNull(factory))
		{
			break;
		}
		componentType = componentType.getParent();
	}
	var bindingProvider = null;
	if (oFF.notNull(factory))
	{
		bindingProvider = factory.newBindingProvider(component, path);
	}
	return bindingProvider;
};

oFF.DpDataManifestFactory = {

	HAS_ERROR:"HasError",
	ERROR_TEXT:"ErrorText",
	create:function(errorText)
	{
			var dataManifest = oFF.PrFactory.createStructure();
		dataManifest.putBoolean(oFF.DpDataManifestFactory.HAS_ERROR, true);
		dataManifest.putString(oFF.DpDataManifestFactory.ERROR_TEXT, errorText);
		return dataManifest;
	},
	createByMessages:function(messages)
	{
			var dataManifest = oFF.PrFactory.createStructure();
		if (oFF.notNull(messages) && messages.hasErrors())
		{
			dataManifest.putBoolean(oFF.DpDataManifestFactory.HAS_ERROR, true);
			dataManifest.putString(oFF.DpDataManifestFactory.ERROR_TEXT, messages.getSummary());
		}
		return dataManifest;
	}
};

oFF.DpBindingStringFactory = function() {};
oFF.DpBindingStringFactory.prototype = new oFF.DpBindingFactory();
oFF.DpBindingStringFactory.prototype._ff_c = "DpBindingStringFactory";

oFF.DpBindingStringFactory.staticSetupStringBindingFactory = function()
{
	oFF.DpBindingFactory.registerFactory(oFF.XValueType.STRING, new oFF.DpBindingStringFactory());
};
oFF.DpBindingStringFactory.prototype.newBindingProvider = function(component, path)
{
	var dp = component;
	return oFF.DpBindingStringProvider.create(dp, path);
};

oFF.DpBindingStringProvider = function() {};
oFF.DpBindingStringProvider.prototype = new oFF.XObject();
oFF.DpBindingStringProvider.prototype._ff_c = "DpBindingStringProvider";

oFF.DpBindingStringProvider.create = function(dp, path)
{
	var newObject = new oFF.DpBindingStringProvider();
	newObject.m_dp = dp;
	newObject.m_path = path;
	return newObject;
};
oFF.DpBindingStringProvider.prototype.m_dp = null;
oFF.DpBindingStringProvider.prototype.m_path = null;
oFF.DpBindingStringProvider.prototype.getSenderBindings = function()
{
	var list = oFF.XList.create();
	list.add(oFF.SemanticBindingType.STRING);
	list.add(oFF.SemanticBindingType.INTEGER);
	return list;
};
oFF.DpBindingStringProvider.prototype.getReceiverBindings = function()
{
	var list = oFF.XList.create();
	list.add(oFF.SemanticBindingType.STRING);
	list.add(oFF.SemanticBindingType.INTEGER);
	return list;
};
oFF.DpBindingStringProvider.prototype.getSenderProtocolBindings = function(type)
{
	var list = oFF.XList.create();
	list.add(oFF.ProtocolBindingType.STRING);
	list.add(oFF.ProtocolBindingType.INTEGER);
	return list;
};
oFF.DpBindingStringProvider.prototype.getReceiverProtocolBindings = function(type)
{
	var list = oFF.XList.create();
	list.add(oFF.ProtocolBindingType.STRING);
	list.add(oFF.ProtocolBindingType.INTEGER);
	return list;
};
oFF.DpBindingStringProvider.prototype.newSenderBinding = function(type, protocol)
{
	return oFF.DpBindingStringSender.create(this.m_dp, this.m_path);
};
oFF.DpBindingStringProvider.prototype.newReceiverBinding = function(type, protocol)
{
	return oFF.DpBindingStringReceiver.create(this.m_dp, this.m_path);
};

oFF.DpBindingStringReceiver = function() {};
oFF.DpBindingStringReceiver.prototype = new oFF.XObject();
oFF.DpBindingStringReceiver.prototype._ff_c = "DpBindingStringReceiver";

oFF.DpBindingStringReceiver.create = function(dp, path)
{
	var receiver = new oFF.DpBindingStringReceiver();
	receiver.m_dp = dp;
	receiver.m_path = path;
	return receiver;
};
oFF.DpBindingStringReceiver.prototype.m_dp = null;
oFF.DpBindingStringReceiver.prototype.m_path = null;
oFF.DpBindingStringReceiver.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_RECEIVER;
};
oFF.DpBindingStringReceiver.prototype.isReceiverReady = function()
{
	return true;
};
oFF.DpBindingStringReceiver.prototype.registerReceiverReadyListener = function(listener, customIdentifier) {};
oFF.DpBindingStringReceiver.prototype.unregisterReceiverReadyListener = function(listener) {};
oFF.DpBindingStringReceiver.prototype.setDataManifest = function(dataManifest) {};
oFF.DpBindingStringReceiver.prototype.setString = function(value)
{
	this.m_dp.setString(value);
};
oFF.DpBindingStringReceiver.prototype.getString = function()
{
	return this.m_dp.getString();
};
oFF.DpBindingStringReceiver.prototype.setInteger = function(value)
{
	this.m_dp.setString(oFF.XInteger.convertToString(value));
};
oFF.DpBindingStringReceiver.prototype.getInteger = function()
{
	return oFF.XInteger.convertFromString(this.getString());
};

oFF.DpBindingStringSender = function() {};
oFF.DpBindingStringSender.prototype = new oFF.XObject();
oFF.DpBindingStringSender.prototype._ff_c = "DpBindingStringSender";

oFF.DpBindingStringSender.create = function(dp, path)
{
	var sender = new oFF.DpBindingStringSender();
	sender.m_dp = dp;
	sender.m_path = path;
	return sender;
};
oFF.DpBindingStringSender.prototype.m_dp = null;
oFF.DpBindingStringSender.prototype.m_path = null;
oFF.DpBindingStringSender.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_SENDER;
};
oFF.DpBindingStringSender.prototype.isSenderValueReady = function()
{
	return true;
};
oFF.DpBindingStringSender.prototype.registerValueChangedListener = function(listener, customIdentifier) {};
oFF.DpBindingStringSender.prototype.unregisterValueChangedListener = function(listener) {};
oFF.DpBindingStringSender.prototype.processSenderUpdate = function() {};
oFF.DpBindingStringSender.prototype.getDataManifest = function()
{
	return null;
};
oFF.DpBindingStringSender.prototype.getInteger = function()
{
	return oFF.XInteger.convertFromString(this.getString());
};
oFF.DpBindingStringSender.prototype.getString = function()
{
	return this.m_dp.getString();
};

oFF.DpBinding = function() {};
oFF.DpBinding.prototype = new oFF.DfProcessContext();
oFF.DpBinding.prototype._ff_c = "DpBinding";

oFF.DpBinding.prototype.m_sender = null;
oFF.DpBinding.prototype.m_receiver = null;
oFF.DpBinding.prototype.m_pullOnReceiverReady = false;
oFF.DpBinding.prototype.m_cacheId = null;
oFF.DpBinding.prototype.m_dataError = null;
oFF.DpBinding.prototype.m_cacheDataManifest = null;
oFF.DpBinding.prototype.m_dataBinding = null;
oFF.DpBinding.prototype.m_protocolBinding = null;
oFF.DpBinding.prototype.setupExt = function(process, dataBinding, protocolBinding)
{
	this.setupProcessContext(process);
	this.m_dataBinding = dataBinding;
	this.m_protocolBinding = protocolBinding;
};
oFF.DpBinding.prototype.releaseObject = function()
{
	if (oFF.notNull(this.m_sender))
	{
		this.m_sender.unregisterValueChangedListener(this);
	}
	if (oFF.notNull(this.m_receiver))
	{
		this.m_receiver.unregisterReceiverReadyListener(this);
	}
	this.m_sender = oFF.XObjectExt.release(this.m_sender);
	this.m_receiver = oFF.XObjectExt.release(this.m_receiver);
	oFF.DfProcessContext.prototype.releaseObject.call( this );
};
oFF.DpBinding.prototype.bind = function(sender, receiver, pullOnReceiverReady)
{
	this.m_sender = sender;
	this.m_receiver = receiver;
	this.m_pullOnReceiverReady = pullOnReceiverReady;
	if (oFF.notNull(this.m_sender))
	{
		this.m_sender.registerValueChangedListener(this, null);
	}
	if (oFF.notNull(this.m_receiver) && pullOnReceiverReady)
	{
		this.m_receiver.registerReceiverReadyListener(this, null);
	}
	this.transport();
};
oFF.DpBinding.prototype.onSenderValueChanged = function(sender, customIdentifier)
{
	this.transport();
};
oFF.DpBinding.prototype.onReceiverReadyChanged = function(receiver, customIdentifier)
{
	this.transport();
};
oFF.DpBinding.prototype.transport = function()
{
	if (oFF.notNull(this.m_sender) && oFF.notNull(this.m_receiver))
	{
		if (this.m_pullOnReceiverReady === false || this.m_receiver.isReceiverReady())
		{
			if (this.m_sender.isSenderValueReady() === false)
			{
				this.m_sender.processSenderUpdate();
				var isReady = this.m_sender.isSenderValueReady();
				if (isReady === false)
				{
					this.transportDataFromCache();
					this.transferDataManifestFromCache();
				}
			}
			else
			{
				this.transportData();
				this.transferDataManifest();
			}
		}
	}
};
oFF.DpBinding.prototype.transportDataFromCache = function() {};
oFF.DpBinding.prototype.getSender = function()
{
	return this.m_sender;
};
oFF.DpBinding.prototype.getReceiver = function()
{
	return this.m_receiver;
};
oFF.DpBinding.prototype.getCacheId = function()
{
	return this.m_cacheId;
};
oFF.DpBinding.prototype.setCacheId = function(cacheId)
{
	this.m_cacheId = cacheId;
};
oFF.DpBinding.prototype.transferDataManifest = function()
{
	if (oFF.notNull(this.m_sender))
	{
		var dataManifest = null;
		if (oFF.notNull(this.m_dataError))
		{
			dataManifest = oFF.DpDataManifestFactory.create(this.m_dataError);
		}
		else
		{
			try
			{
				dataManifest = this.m_sender.getDataManifest();
			}
			catch (e)
			{
				this.m_dataError = oFF.XException.getStackTrace(e, 0);
				this.log(this.m_dataError);
			}
		}
		if (oFF.notNull(this.m_receiver))
		{
			if (oFF.notNull(dataManifest))
			{
				try
				{
					this.m_receiver.setDataManifest(dataManifest);
				}
				catch (f)
				{
					this.log(oFF.XException.getStackTrace(f, 0));
				}
			}
		}
		this.m_dataError = null;
	}
};
oFF.DpBinding.prototype.transferDataManifestFromCache = function()
{
	if (oFF.notNull(this.m_sender))
	{
		if (oFF.notNull(this.m_receiver))
		{
			if (oFF.notNull(this.m_cacheDataManifest))
			{
				try
				{
					this.m_receiver.setDataManifest(this.m_cacheDataManifest);
				}
				catch (f)
				{
					this.log(oFF.XException.getStackTrace(f, 0));
				}
			}
		}
		this.m_dataError = null;
		this.m_cacheDataManifest = null;
	}
};

oFF.DpBindingManager = function() {};
oFF.DpBindingManager.prototype = new oFF.DfProcessContext();
oFF.DpBindingManager.prototype._ff_c = "DpBindingManager";

oFF.DpBindingManager.create = function(process)
{
	var newObj = new oFF.DpBindingManager();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.DpBindingManager.doBinding = function(process, senderType, receiverType, protocolBinding, senderProvider, receiverProvider, cacheIdentifier, pullOnReceiverReady)
{
	var binding = null;
	var theProtocolBinding = protocolBinding;
	if (oFF.isNull(theProtocolBinding))
	{
		theProtocolBinding = receiverType.getDefaultProtocol();
	}
	var sender = senderProvider.newSenderBinding(senderType, theProtocolBinding);
	var receiver = receiverProvider.newReceiverBinding(receiverType, theProtocolBinding);
	if (oFF.notNull(sender) && oFF.notNull(receiver))
	{
		if (theProtocolBinding.isTypeOf(oFF.ProtocolBindingType.JSON))
		{
			binding = oFF.DpBindingJson.create(process, receiverType, theProtocolBinding, true);
		}
		else if (theProtocolBinding.isTypeOf(oFF.ProtocolBindingType.STRING))
		{
			binding = oFF.DpBindingString.create(process, receiverType, theProtocolBinding);
		}
		else if (theProtocolBinding.isTypeOf(oFF.ProtocolBindingType.INTEGER))
		{
			binding = oFF.DpBindingInteger.create(process, receiverType, theProtocolBinding);
		}
		if (oFF.notNull(binding))
		{
			binding.setCacheId(cacheIdentifier);
			binding.bind(sender, receiver, pullOnReceiverReady);
		}
	}
	return binding;
};
oFF.DpBindingManager.prototype.selectSpecificBindingProvider = oFF.noSupport;
oFF.DpBindingManager.prototype.bindTogether = function(senderExpression, senderDefaultDomain, senderContextObject, receiverExpression, receiverDefaultDomain, receiverContextObject, type, cacheIdentifier, pullOnReceiverReady, isNeo)
{
	var senderProvider = null;
	var receiverProvider = null;
	if (isNeo === true || oFF.XString.startsWith(senderExpression, "ui:"))
	{
		senderProvider = this.getBindingProvider2(senderExpression, senderDefaultDomain, senderContextObject);
	}
	else
	{
		senderProvider = this.getBindingProvider2(senderExpression, senderDefaultDomain, senderContextObject);
	}
	receiverProvider = this.getBindingProvider2(receiverExpression, receiverDefaultDomain, receiverContextObject);
	if (oFF.notNull(senderProvider) && oFF.notNull(receiverProvider))
	{
		return this.doBindingWithProviders(senderProvider, receiverProvider, type, cacheIdentifier, pullOnReceiverReady);
	}
	else
	{
		return null;
	}
};
oFF.DpBindingManager.prototype.getBindingProvider = function(expression, defaultDomain, contextObject, mergeIntoSpace)
{
	var theExpression = expression;
	if (oFF.isNull(theExpression) && oFF.notNull(defaultDomain))
	{
		theExpression = oFF.XStringUtils.concatenate2(defaultDomain.getName(), ":");
	}
	if (oFF.notNull(theExpression))
	{
		var parser = oFF.SigSelParser.create();
		var result = parser.parse(theExpression);
		if (result.isValid())
		{
			var ops = result.getData();
			var session = this.getSession();
			var selector = session.getSelector();
			if (ops.size() >= 1)
			{
				var operation = ops.get(0);
				var object1 = selector.selectComponentByOp(operation, defaultDomain, contextObject, -1, mergeIntoSpace);
				return object1;
			}
		}
	}
	return null;
};
oFF.DpBindingManager.prototype.getBindingProvider2 = function(expression, defaultDomain, contextObject)
{
	var component = null;
	var operation = null;
	var theExpression = expression;
	if (oFF.isNull(theExpression) && oFF.notNull(defaultDomain))
	{
		theExpression = oFF.XStringUtils.concatenate2(defaultDomain.getName(), ":");
	}
	if (oFF.notNull(theExpression))
	{
		var parser = oFF.SigSelParser.create();
		var result = parser.parse(theExpression);
		if (result.isValid())
		{
			var ops = result.getData();
			var session = this.getSession();
			var selector = session.getSelector();
			if (ops.size() >= 1)
			{
				operation = ops.get(0);
				component = selector.selectComponentByOp(operation, defaultDomain, contextObject, -1, false);
			}
		}
	}
	var provider = null;
	if (oFF.notNull(operation) && oFF.notNull(component))
	{
		provider = oFF.DpBindingFactory.createBindingProvider(component, operation.getSelectedProperty());
	}
	return provider;
};
oFF.DpBindingManager.prototype.doBindingWithProviders = function(senderProvider, receiverProvider, type, cacheIdentifier, pullOnReceiverReady)
{
	var process = this.getProcess();
	var senderType = null;
	var receiverType = null;
	if (oFF.notNull(senderProvider) && oFF.notNull(receiverProvider))
	{
		var senderBindings = senderProvider.getSenderBindings();
		var receiverBindings = receiverProvider.getReceiverBindings();
		if (oFF.notNull(type))
		{
			for (var s = 0; s < senderBindings.size(); s++)
			{
				senderType = senderBindings.get(s);
				if (senderType.isEqualTo(type))
				{
					break;
				}
				senderType = null;
			}
			for (var r = 0; r < receiverBindings.size(); r++)
			{
				receiverType = receiverBindings.get(r);
				if (type.isTypeOf(receiverType))
				{
					break;
				}
				receiverType = null;
			}
		}
		if (oFF.isNull(senderType) || oFF.isNull(receiverType))
		{
			for (var i = 0; i < receiverBindings.size(); i++)
			{
				receiverType = receiverBindings.get(i);
				if (senderBindings.contains(receiverType))
				{
					senderType = receiverType;
					break;
				}
			}
		}
		if (oFF.notNull(senderType) && oFF.notNull(receiverType))
		{
			var senderProtocols = senderProvider.getSenderProtocolBindings(senderType);
			var receiverProtocols = receiverProvider.getReceiverProtocolBindings(receiverType);
			var protocol = null;
			if (oFF.notNull(receiverProtocols) && oFF.notNull(senderProtocols))
			{
				for (var k = 0; k < receiverProtocols.size(); k++)
				{
					var currentProtocol = receiverProtocols.get(k);
					if (senderProtocols.contains(currentProtocol))
					{
						protocol = currentProtocol;
						break;
					}
				}
			}
			return oFF.DpBindingManager.doBinding(process, senderType, receiverType, protocol, senderProvider, receiverProvider, cacheIdentifier, pullOnReceiverReady);
		}
	}
	return null;
};
oFF.DpBindingManager.prototype.selectComponentByExpr = function(sigSelExpression, defaultDomain, contextObject, maximumCount, mergeIntoSpace)
{
	var session = this.getSession();
	var selector = session.getSelector();
	return selector.selectComponentByExpr(sigSelExpression, defaultDomain, contextObject, maximumCount, mergeIntoSpace);
};
oFF.DpBindingManager.prototype.selectComponentsByExpr = function(sigSelExpression, defaultDomain, contextObject, maximumCount)
{
	var session = this.getSession();
	var selector = session.getSelector();
	return selector.selectComponentsByExpr(sigSelExpression, defaultDomain, contextObject, maximumCount);
};
oFF.DpBindingManager.prototype.selectComponentsByOp = function(operation, defaultDomain, contextObject, maximumCount)
{
	var session = this.getSession();
	var selector = session.getSelector();
	return selector.selectComponentsByOp(operation, defaultDomain, contextObject, maximumCount);
};
oFF.DpBindingManager.prototype.selectComponentByOp = function(operation, defaultDomain, contextObject, maximumCount, mergeIntoSpace)
{
	var session = this.getSession();
	var selector = session.getSelector();
	return selector.selectComponentByOp(operation, defaultDomain, contextObject, maximumCount, mergeIntoSpace);
};

oFF.DpBindingInteger = function() {};
oFF.DpBindingInteger.prototype = new oFF.DpBinding();
oFF.DpBindingInteger.prototype._ff_c = "DpBindingInteger";

oFF.DpBindingInteger.create = function(process, dataBinding, protocolBinding)
{
	var newObj = new oFF.DpBindingInteger();
	newObj.setupExt(process, dataBinding, protocolBinding);
	return newObj;
};
oFF.DpBindingInteger.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_ADAPTER_INT;
};
oFF.DpBindingInteger.prototype.transportData = function()
{
	var intValue = this.m_sender.getInteger();
	this.m_receiver.setInteger(intValue);
};

oFF.DpBindingJson = function() {};
oFF.DpBindingJson.prototype = new oFF.DpBinding();
oFF.DpBindingJson.prototype._ff_c = "DpBindingJson";

oFF.DpBindingJson.create = function(process, dataBinding, protocolBinding, checkForChanges)
{
	var newObj = new oFF.DpBindingJson();
	newObj.setupExt(process, dataBinding, protocolBinding);
	newObj.m_checkForChanges = checkForChanges;
	return newObj;
};
oFF.DpBindingJson.prototype.m_checkForChanges = false;
oFF.DpBindingJson.prototype.m_lastChecksum = null;
oFF.DpBindingJson.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_ADAPTER_JSON;
};
oFF.DpBindingJson.prototype.transportData = function()
{
	if (oFF.notNull(this.m_sender))
	{
		try
		{
			var element = this.m_sender.getElement();
			this.putInCache(element);
			this.setAtReceiver(element);
		}
		catch (e)
		{
			this.m_dataError = oFF.XException.getStackTrace(e, 0);
			this.log(this.m_dataError);
		}
	}
};
oFF.DpBindingJson.prototype.transportDataFromCache = function()
{
	try
	{
		var element = this.pullFromCache();
		this.setAtReceiver(element);
	}
	catch (e)
	{
		this.log(oFF.XException.getStackTrace(e, 0));
	}
};
oFF.DpBindingJson.prototype.putInCache = function(element)
{
	var cacheId = this.getCacheId();
	if (oFF.notNull(cacheId) && oFF.notNull(element))
	{
		var cacheManager = this.getProcess().getCacheManager();
		if (oFF.notNull(cacheManager))
		{
			var cache = cacheManager.getSubCache("dpbinding");
			if (oFF.notNull(cache))
			{
				cache.put(cacheId, element, null);
			}
		}
	}
};
oFF.DpBindingJson.prototype.pullFromCache = function()
{
	var element = null;
	var cacheId = this.getCacheId();
	if (oFF.notNull(cacheId))
	{
		var cacheManager = this.getProcess().getCacheManager();
		if (oFF.notNull(cacheManager))
		{
			var cache = cacheManager.getSubCache("dpbinding");
			if (oFF.notNull(cache))
			{
				element = cache.getByKey(cacheId);
			}
		}
	}
	return element;
};
oFF.DpBindingJson.prototype.setAtReceiver = function(element)
{
	if (oFF.notNull(this.m_receiver) && oFF.notNull(element))
	{
		var performApply = true;
		if (this.m_checkForChanges)
		{
			var normalized = oFF.PrUtils.serialize(element, true, false, 0);
			var newChecksum = oFF.XSha1.createSHA1(normalized);
			if (oFF.notNull(newChecksum) && oFF.notNull(this.m_lastChecksum))
			{
				if (oFF.XString.isEqual(newChecksum, this.m_lastChecksum))
				{
					performApply = false;
				}
			}
			this.m_lastChecksum = newChecksum;
		}
		if (performApply)
		{
			this.m_receiver.setElement(element);
		}
	}
};

oFF.DpBindingString = function() {};
oFF.DpBindingString.prototype = new oFF.DpBinding();
oFF.DpBindingString.prototype._ff_c = "DpBindingString";

oFF.DpBindingString.create = function(process, dataBinding, protocolBinding)
{
	var newObj = new oFF.DpBindingString();
	newObj.setupExt(process, dataBinding, protocolBinding);
	return newObj;
};
oFF.DpBindingString.prototype.getComponentType = function()
{
	return oFF.IoComponentType.BINDING_ADAPTER_STRING;
};
oFF.DpBindingString.prototype.transportData = function()
{
	var stringValue = this.m_sender.getString();
	this.m_receiver.setString(stringValue);
};

oFF.DpSelection = function() {};
oFF.DpSelection.prototype = new oFF.XObjectExt();
oFF.DpSelection.prototype._ff_c = "DpSelection";

oFF.DpSelection.create = function(list)
{
	var newObj = new oFF.DpSelection();
	newObj.m_list = list;
	return newObj;
};
oFF.DpSelection.prototype.m_list = null;
oFF.DpSelection.prototype.getComponentType = function()
{
	return oFF.KernelComponentType.SIGSEL_RESULT_LIST;
};
oFF.DpSelection.prototype.getValuesAsReadOnlyList = function()
{
	return this.m_list;
};
oFF.DpSelection.prototype.getIterator = function()
{
	return this.m_list.getIterator();
};
oFF.DpSelection.prototype.contains = function(element)
{
	return this.m_list.contains(element);
};
oFF.DpSelection.prototype.isEmpty = function()
{
	return this.m_list.isEmpty();
};
oFF.DpSelection.prototype.hasElements = function()
{
	return this.m_list.hasElements();
};
oFF.DpSelection.prototype.size = function()
{
	return this.m_list.size();
};
oFF.DpSelection.prototype.get = function(index)
{
	return this.m_list.get(index);
};
oFF.DpSelection.prototype.getIndex = function(element)
{
	return this.m_list.getIndex(element);
};

oFF.DataProviderPool = function() {};
oFF.DataProviderPool.prototype = new oFF.XObjectExt();
oFF.DataProviderPool.prototype._ff_c = "DataProviderPool";

oFF.DataProviderPool.createGlobal = function(process)
{
	var newObj = new oFF.DataProviderPool();
	newObj.setupExt(oFF.ProtocolType.FS_DP, process);
	return newObj;
};
oFF.DataProviderPool.createLocal = function(process)
{
	var newObj = new oFF.DataProviderPool();
	newObj.setupExt(oFF.ProtocolType.FS_DP, process);
	return newObj;
};
oFF.DataProviderPool.prototype.m_poolUri = null;
oFF.DataProviderPool.prototype.m_dataProviders = null;
oFF.DataProviderPool.prototype.m_process = null;
oFF.DataProviderPool.prototype.setupExt = function(protocolType, process)
{
	var uri = oFF.XUri.create();
	uri.setProtocolType(protocolType);
	this.m_poolUri = uri;
	this.m_process = process;
	this.m_dataProviders = oFF.XHashMapByString.create();
};
oFF.DataProviderPool.prototype.getPoolUri = function()
{
	return this.m_poolUri;
};
oFF.DataProviderPool.prototype.addDataProvider = function(name, dataProvider)
{
	this.m_dataProviders.put(name, dataProvider);
};
oFF.DataProviderPool.prototype.getDataProviderByUri = function(uri)
{
	var dp = null;
	var pool = this.getPool(uri);
	if (oFF.notNull(pool))
	{
		var name = uri.getPathContainer().getFileName();
		if (oFF.notNull(name))
		{
			dp = pool.getDataProviderByName(name);
		}
	}
	return dp;
};
oFF.DataProviderPool.prototype.getPool = function(uri)
{
	var pool = null;
	var targetType = uri.getProtocolType();
	if (targetType === oFF.ProtocolType.FS_DP)
	{
		pool = this.getGlobalPool();
	}
	else if (targetType === oFF.ProtocolType.FS_DP)
	{
		pool = this.getLocalPool(uri);
	}
	return pool;
};
oFF.DataProviderPool.prototype.getLocalPool = function(uri)
{
	var pool = null;
	var path = uri.getPath();
	var elements = oFF.XStringTokenizer.splitString(path, oFF.XUri.PATH_SEPARATOR);
	var process = this.m_process.getKernel().getKernelProcess();
	for (var i = 1; i < elements.size() - 1 && oFF.notNull(process); i++)
	{
		var name = elements.get(i);
		if (oFF.XString.startsWith(name, "."))
		{
			name = oFF.XString.substring(name, 1, -1);
			process = process.getChildProcessById(name);
		}
		else
		{
			process = null;
		}
	}
	if (oFF.notNull(process))
	{
		pool = process.getDataProviderPool();
	}
	return pool;
};
oFF.DataProviderPool.prototype.getGlobalPool = function()
{
	var pool;
	if (this.m_poolUri.getProtocolType() === oFF.ProtocolType.FS_DP)
	{
		pool = this;
	}
	else
	{
		pool = this.m_process.getSubSystem(oFF.SubSystemType.DATA_PROVIDER_POOL);
	}
	return pool;
};
oFF.DataProviderPool.prototype.getDataProviderByName = function(name)
{
	return this.m_dataProviders.getByKey(name);
};
oFF.DataProviderPool.prototype.remove = function(key)
{
	return this.m_dataProviders.remove(key);
};
oFF.DataProviderPool.prototype.clear = function()
{
	this.m_dataProviders.clear();
};
oFF.DataProviderPool.prototype.size = function()
{
	return this.m_dataProviders.size();
};
oFF.DataProviderPool.prototype.isEmpty = function()
{
	return this.m_dataProviders.isEmpty();
};
oFF.DataProviderPool.prototype.hasElements = function()
{
	return this.m_dataProviders.hasElements();
};
oFF.DataProviderPool.prototype.containsKey = function(key)
{
	return this.m_dataProviders.containsKey(key);
};
oFF.DataProviderPool.prototype.getKeysAsReadOnlyListOfString = function()
{
	return this.m_dataProviders.getKeysAsReadOnlyListOfString();
};
oFF.DataProviderPool.prototype.getKeysAsIteratorOfString = function()
{
	return this.m_dataProviders.getKeysAsIteratorOfString();
};
oFF.DataProviderPool.prototype.getByKey = function(key)
{
	return this.m_dataProviders.getByKey(key);
};

oFF.ProtocolBindingType = function() {};
oFF.ProtocolBindingType.prototype = new oFF.XConstantWithParent();
oFF.ProtocolBindingType.prototype._ff_c = "ProtocolBindingType";

oFF.ProtocolBindingType.STRING = null;
oFF.ProtocolBindingType.INTEGER = null;
oFF.ProtocolBindingType.JSON = null;
oFF.ProtocolBindingType.ABSTRACT_CHART_PROTOCOL = null;
oFF.ProtocolBindingType.HIGH_CHART_PROTOCOL = null;
oFF.ProtocolBindingType.GOOGLE_CHART_PROTOCOL = null;
oFF.ProtocolBindingType.VIZ_FRAME_PROTOCOL = null;
oFF.ProtocolBindingType.MICRO_CHART_PROTOCOL = null;
oFF.ProtocolBindingType.VAL_CHART_PROTOCOL = null;
oFF.ProtocolBindingType.SAP_KPI_PROTOCOL = null;
oFF.ProtocolBindingType.PLAIN_GRID = null;
oFF.ProtocolBindingType.FIREFLY_GRID = null;
oFF.ProtocolBindingType.SAC_TABLE_GRID = null;
oFF.ProtocolBindingType.CUSTOM = null;
oFF.ProtocolBindingType.s_instances = null;
oFF.ProtocolBindingType.create = function(name, parent)
{
	var newConstant = new oFF.ProtocolBindingType();
	newConstant.setupExt(name, parent);
	oFF.ProtocolBindingType.s_instances.put(name, newConstant);
	return newConstant;
};
oFF.ProtocolBindingType.lookup = function(name)
{
	return oFF.ProtocolBindingType.s_instances.getByKey(name);
};
oFF.ProtocolBindingType.staticSetup = function()
{
	oFF.ProtocolBindingType.s_instances = oFF.XHashMapByString.create();
	oFF.ProtocolBindingType.STRING = oFF.ProtocolBindingType.create("String", null);
	oFF.ProtocolBindingType.INTEGER = oFF.ProtocolBindingType.create("Integer", null);
	oFF.ProtocolBindingType.JSON = oFF.ProtocolBindingType.create("Json", null);
	oFF.ProtocolBindingType.ABSTRACT_CHART_PROTOCOL = oFF.ProtocolBindingType.create("Chart", oFF.ProtocolBindingType.JSON);
	oFF.ProtocolBindingType.HIGH_CHART_PROTOCOL = oFF.ProtocolBindingType.create("HighChart", oFF.ProtocolBindingType.ABSTRACT_CHART_PROTOCOL);
	oFF.ProtocolBindingType.GOOGLE_CHART_PROTOCOL = oFF.ProtocolBindingType.create("GoogleChart", oFF.ProtocolBindingType.ABSTRACT_CHART_PROTOCOL);
	oFF.ProtocolBindingType.VIZ_FRAME_PROTOCOL = oFF.ProtocolBindingType.create("VizFrame", oFF.ProtocolBindingType.ABSTRACT_CHART_PROTOCOL);
	oFF.ProtocolBindingType.MICRO_CHART_PROTOCOL = oFF.ProtocolBindingType.create("MicroChart", oFF.ProtocolBindingType.ABSTRACT_CHART_PROTOCOL);
	oFF.ProtocolBindingType.VAL_CHART_PROTOCOL = oFF.ProtocolBindingType.create("ValChart", oFF.ProtocolBindingType.ABSTRACT_CHART_PROTOCOL);
	oFF.ProtocolBindingType.SAP_KPI_PROTOCOL = oFF.ProtocolBindingType.create("SapKpiProtocol", oFF.ProtocolBindingType.JSON);
	oFF.ProtocolBindingType.PLAIN_GRID = oFF.ProtocolBindingType.create("PlainGrid", oFF.ProtocolBindingType.JSON);
	oFF.ProtocolBindingType.FIREFLY_GRID = oFF.ProtocolBindingType.create("FireflyGrid", oFF.ProtocolBindingType.JSON);
	oFF.ProtocolBindingType.SAC_TABLE_GRID = oFF.ProtocolBindingType.create("SacTableGrid", oFF.ProtocolBindingType.JSON);
	oFF.ProtocolBindingType.CUSTOM = oFF.ProtocolBindingType.create("Custom", oFF.ProtocolBindingType.JSON);
};
oFF.ProtocolBindingType.createCustomProtocolBindingType = function(name)
{
	var parent = oFF.ProtocolBindingType.CUSTOM;
	var existing = oFF.ProtocolBindingType.lookup(name);
	if (oFF.notNull(existing))
	{
		throw oFF.XException.createRuntimeException("Custom protocol binding type with the same name but different parent type is already existing");
	}
	return oFF.ProtocolBindingType.create(name, parent);
};

oFF.SemanticBindingType = function() {};
oFF.SemanticBindingType.prototype = new oFF.XConstantWithParent();
oFF.SemanticBindingType.prototype._ff_c = "SemanticBindingType";

oFF.SemanticBindingType.STRING = null;
oFF.SemanticBindingType.INTEGER = null;
oFF.SemanticBindingType.JSON = null;
oFF.SemanticBindingType.SINGLE = null;
oFF.SemanticBindingType.MULTI = null;
oFF.SemanticBindingType.GRID = null;
oFF.SemanticBindingType.TABLE = null;
oFF.SemanticBindingType.CHART = null;
oFF.SemanticBindingType.KPI = null;
oFF.SemanticBindingType.COLUMN = null;
oFF.SemanticBindingType.BAR = null;
oFF.SemanticBindingType.LINE = null;
oFF.SemanticBindingType.BOXPLOT = null;
oFF.SemanticBindingType.PIE = null;
oFF.SemanticBindingType.VARIABLEPIE = null;
oFF.SemanticBindingType.BELLCURVE = null;
oFF.SemanticBindingType.AREA = null;
oFF.SemanticBindingType.SPLINE = null;
oFF.SemanticBindingType.WORDCLOUD = null;
oFF.SemanticBindingType.SCATTER = null;
oFF.SemanticBindingType.VARIWIDE = null;
oFF.SemanticBindingType.BUBBLE = null;
oFF.SemanticBindingType.COMBBCL = null;
oFF.SemanticBindingType.HEATMAP = null;
oFF.SemanticBindingType.TREEMAP = null;
oFF.SemanticBindingType.TIMESERIES = null;
oFF.SemanticBindingType.CUSTOM = null;
oFF.SemanticBindingType.s_instances = null;
oFF.SemanticBindingType.create = function(name, parent, protocol)
{
	var newConstant = new oFF.SemanticBindingType();
	newConstant.setupExt(name, parent);
	newConstant.m_defaultProtocol = protocol;
	oFF.SemanticBindingType.s_instances.put(name, newConstant);
	return newConstant;
};
oFF.SemanticBindingType.lookup = function(name)
{
	return oFF.SemanticBindingType.s_instances.getByKey(name);
};
oFF.SemanticBindingType.staticSetup = function()
{
	oFF.SemanticBindingType.s_instances = oFF.XHashMapByString.create();
	oFF.SemanticBindingType.STRING = oFF.SemanticBindingType.create("String", null, oFF.ProtocolBindingType.STRING);
	oFF.SemanticBindingType.INTEGER = oFF.SemanticBindingType.create("Integer", null, oFF.ProtocolBindingType.INTEGER);
	oFF.SemanticBindingType.JSON = oFF.SemanticBindingType.create("Json", null, oFF.ProtocolBindingType.JSON);
	oFF.SemanticBindingType.SINGLE = oFF.SemanticBindingType.create("Single", oFF.SemanticBindingType.JSON, null);
	oFF.SemanticBindingType.MULTI = oFF.SemanticBindingType.create("Multi", oFF.SemanticBindingType.JSON, null);
	oFF.SemanticBindingType.TABLE = oFF.SemanticBindingType.create("Table", oFF.SemanticBindingType.SINGLE, null);
	oFF.SemanticBindingType.GRID = oFF.SemanticBindingType.create("Grid", oFF.SemanticBindingType.SINGLE, null);
	oFF.SemanticBindingType.CHART = oFF.SemanticBindingType.create("Chart", oFF.SemanticBindingType.SINGLE, oFF.ProtocolBindingType.HIGH_CHART_PROTOCOL);
	oFF.SemanticBindingType.COMBBCL = oFF.SemanticBindingType.create("Combbcl", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.TIMESERIES = oFF.SemanticBindingType.create("Timeseries", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.COLUMN = oFF.SemanticBindingType.create("Column", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.BAR = oFF.SemanticBindingType.create("Bar", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.LINE = oFF.SemanticBindingType.create("Line", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.PIE = oFF.SemanticBindingType.create("Pie", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.WORDCLOUD = oFF.SemanticBindingType.create("WordCloud", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.BELLCURVE = oFF.SemanticBindingType.create("BellCurve", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.AREA = oFF.SemanticBindingType.create("Area", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.SCATTER = oFF.SemanticBindingType.create("Scatter", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.SPLINE = oFF.SemanticBindingType.create("Spline", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.VARIABLEPIE = oFF.SemanticBindingType.create("VariablePie", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.VARIWIDE = oFF.SemanticBindingType.create("Variwide", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.BOXPLOT = oFF.SemanticBindingType.create("BoxPlot", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.BUBBLE = oFF.SemanticBindingType.create("Bubble", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.HEATMAP = oFF.SemanticBindingType.create("Heatmap", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.TREEMAP = oFF.SemanticBindingType.create("Treemap", oFF.SemanticBindingType.CHART, null);
	oFF.SemanticBindingType.KPI = oFF.SemanticBindingType.create("Kpi", oFF.SemanticBindingType.SINGLE, oFF.ProtocolBindingType.SAP_KPI_PROTOCOL);
	oFF.SemanticBindingType.CUSTOM = oFF.SemanticBindingType.create("Custom", oFF.SemanticBindingType.SINGLE, null);
};
oFF.SemanticBindingType.prototype.m_defaultProtocol = null;
oFF.SemanticBindingType.prototype.getDefaultProtocol = function()
{
	if (oFF.notNull(this.m_defaultProtocol))
	{
		return this.m_defaultProtocol;
	}
	var theParent = this.getParent();
	if (oFF.isNull(theParent))
	{
		return null;
	}
	return theParent.getDefaultProtocol();
};

oFF.FsDpPoolFileSystem = function() {};
oFF.FsDpPoolFileSystem.prototype = new oFF.DfXFileSystem();
oFF.FsDpPoolFileSystem.prototype._ff_c = "FsDpPoolFileSystem";

oFF.FsDpPoolFileSystem.DEFINITION = "{\"attributes\":{\"os.changedAt\":4568973857,\"os.changedBy\":\"kelly\",\"os.createdAt\":2384238478,\"os.createdBy\":\"johndoe\",\"os.node.type\":\"folder\",\"os.res.type\":\"folder.root\"},\"children\":[{\"attributes\":{\"os.is_shared\":true,\"os.node.description\":\"program directory\",\"os.node.type\":\"folder\",\"os.res.type\":\"folder.programs\"},\"children\":[{\"name\":\"dir\"}],\"name\":\"prg\"},{\"attributes\":{\"os.createdBy\":\"anonymous\",\"os.createdBy.displayName\":\"Anonymous\",\"os.node.description\":\"a fancy directory with a custom icon\",\"os.node.icon\":\"sap-icon:\\/\\/sap-box\",\"os.node.type\":\"folder\",\"os.res.type\":\"folder.programs\"},\"children\":[{\"attributes\":{\"os.displayName\":\"displayName\",\"os.node.description\":\"the description\"},\"name\":\"file name\"},{\"attributes\":{\"contentlib.sourceResource\":{\"os.node.description\":\"child of fancy dir\",\"os.node.type\":\"FOLDER\"},\"os.node.description\":\"a link to child dir\",\"os.node.type\":\"LINK\",\"os.uniqueId\":\"link-to-child-dir\"},\"name\":\"link to child dir\"},{\"attributes\":{\"contentlib.sourceResource\":{\"os.createdBy\":\"anonymous\",\"os.createdBy.displayName\":\"Anonymous\",\"os.is_shared\":true,\"os.node.description\":\"a fancy file with a custom icon\",\"os.node.icon\":\"sap-icon:\\/\\/bar-code\"},\"os.node.description\":\"a link to fancy file\",\"os.node.type\":\"LINK\",\"os.uniqueId\":\"link-to-fancy-file\"},\"name\":\"link to fancy file\"},{\"attributes\":{\"os.node.description\":\"a file whose name is translated (by name)\",\"os.uniqueId\":\"name-translated-file\"},\"name\":\"WONT_SEE_THIS_NAME\"},{\"attributes\":{\"os.node.description\":\"a file whose name is translated (by url)\",\"os.uniqueId\":\"url-translated-file\"},\"name\":\"WONT_SEE_THIS_URL\"},{\"attributes\":{\"os.node.description\":\"child of fancy dir\",\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"os.node.description\":\"grandchild of fancy dir\"},\"name\":\"grandchild file\"}],\"name\":\"child dir\"},{\"attributes\":{\"os.is_shared\":true},\"name\":\"boring file\"},{\"attributes\":{\"os.createdBy\":\"anonymous\",\"os.createdBy.displayName\":\"Anonymous\",\"os.is_shared\":true,\"os.node.description\":\"a fancy file with a custom icon\",\"os.node.icon\":\"sap-icon:\\/\\/bar-code\"},\"name\":\"fancy file\"},{\"attributes\":{\"description\":\"this file was created by DEMO\",\"os.createdBy\":\"DEMO\",\"os.createdBy.displayName\":\"Demo user\",\"os.ignoreQuickFilters\":true},\"name\":\"DEMO's cool file\"},{\"attributes\":{\"description\":\"this file was shared\",\"os.is_shared\":true},\"name\":\"file shared with you\"},{\"attributes\":{\"os.createdBy\":\"USERNAME\",\"os.node.description\":\"a json file\"},\"name\":\"a-json-file.json\"},{\"attributes\":{\"os.createdBy\":\"ADMIN\",\"os.createdBy.displayName\":\"John\",\"os.node.description\":\"this file belongs to John\"},\"name\":\"John's file\"},{\"attributes\":{\"os.node.description\":\"directory with a lot of children\"},\"children\":[{\"attributes\":{\"os.node.description\":\"file number 0\"},\"name\":\"file0\"},{\"attributes\":{\"os.node.description\":\"file number 1\"},\"name\":\"file1\"},{\"attributes\":{\"os.node.description\":\"file number 2\"},\"name\":\"file2\"},{\"attributes\":{\"os.node.description\":\"file number 3\"},\"name\":\"file3\"},{\"attributes\":{\"os.node.description\":\"file number 4\"},\"name\":\"file4\"},{\"attributes\":{\"os.node.description\":\"file number 5\"},\"name\":\"file5\"},{\"attributes\":{\"os.node.description\":\"file number 6\"},\"name\":\"file6\"},{\"attributes\":{\"os.node.description\":\"file number 7\"},\"name\":\"file7\"},{\"attributes\":{\"os.node.description\":\"file number 8\"},\"name\":\"file8\"},{\"attributes\":{\"os.node.description\":\"file number 9\"},\"name\":\"file9\"},{\"attributes\":{\"os.node.description\":\"file number 10\"},\"name\":\"file10\"},{\"attributes\":{\"os.node.description\":\"file number 11\"},\"name\":\"file11\"},{\"attributes\":{\"os.node.description\":\"file number 12\"},\"name\":\"file12\"},{\"attributes\":{\"os.node.description\":\"file number 13\"},\"name\":\"file13\"},{\"attributes\":{\"os.node.description\":\"file number 14\"},\"name\":\"file14\"},{\"attributes\":{\"os.node.description\":\"file number 15\"},\"name\":\"file15\"},{\"attributes\":{\"os.node.description\":\"file number 16\"},\"name\":\"file16\"},{\"attributes\":{\"os.node.description\":\"file number 17\"},\"name\":\"file17\"},{\"attributes\":{\"os.node.description\":\"file number 18\"},\"name\":\"file18\"},{\"attributes\":{\"os.node.description\":\"file number 19\"},\"name\":\"file19\"},{\"attributes\":{\"os.node.description\":\"file number 20\"},\"name\":\"file20\"},{\"attributes\":{\"os.node.description\":\"file number 21\"},\"name\":\"file21\"},{\"attributes\":{\"os.node.description\":\"file number 22\"},\"name\":\"file22\"},{\"attributes\":{\"os.node.description\":\"file number 23\"},\"name\":\"file23\"},{\"attributes\":{\"os.node.description\":\"file number 24\"},\"name\":\"file24\"},{\"attributes\":{\"os.node.description\":\"file number 25\"},\"name\":\"file25\"},{\"attributes\":{\"os.node.description\":\"file number 26\"},\"name\":\"file26\"},{\"attributes\":{\"os.node.description\":\"file number 27\"},\"name\":\"file27\"},{\"attributes\":{\"os.node.description\":\"file number 28\"},\"name\":\"file28\"},{\"attributes\":{\"os.node.description\":\"file number 29\"},\"name\":\"file29\"},{\"attributes\":{\"os.node.description\":\"file number 30\"},\"name\":\"file30\"},{\"attributes\":{\"os.node.description\":\"file number 31\"},\"name\":\"file31\"},{\"attributes\":{\"os.node.description\":\"file number 32\"},\"name\":\"file32\"},{\"attributes\":{\"os.node.description\":\"file number 33\"},\"name\":\"file33\"},{\"attributes\":{\"os.node.description\":\"file number 34\"},\"name\":\"file34\"},{\"attributes\":{\"os.node.description\":\"file number 35\"},\"name\":\"file35\"},{\"attributes\":{\"os.node.description\":\"file number 36\"},\"name\":\"file36\"},{\"attributes\":{\"os.node.description\":\"file number 37\"},\"name\":\"file37\"},{\"attributes\":{\"os.node.description\":\"file number 38\"},\"name\":\"file38\"},{\"attributes\":{\"os.node.description\":\"file number 39\"},\"name\":\"file39\"},{\"attributes\":{\"os.node.description\":\"another directory with a lot of chlidren\"},\"children\":[{\"attributes\":{\"os.node.description\":\"file number 0\"},\"name\":\"file0\"},{\"attributes\":{\"os.node.description\":\"file number 1\"},\"name\":\"file1\"},{\"attributes\":{\"os.node.description\":\"file number 2\"},\"name\":\"file2\"},{\"attributes\":{\"os.node.description\":\"file number 3\"},\"name\":\"file3\"},{\"attributes\":{\"os.node.description\":\"file number 4\"},\"name\":\"file4\"},{\"attributes\":{\"os.node.description\":\"file number 5\"},\"name\":\"file5\"},{\"attributes\":{\"os.node.description\":\"file number 6\"},\"name\":\"file6\"},{\"attributes\":{\"os.node.description\":\"file number 7\"},\"name\":\"file7\"},{\"attributes\":{\"os.node.description\":\"file number 8\"},\"name\":\"file8\"},{\"attributes\":{\"os.node.description\":\"file number 9\"},\"name\":\"file9\"},{\"attributes\":{\"os.node.description\":\"file number 10\"},\"name\":\"file10\"},{\"attributes\":{\"os.node.description\":\"file number 11\"},\"name\":\"file11\"},{\"attributes\":{\"os.node.description\":\"file number 12\"},\"name\":\"file12\"},{\"attributes\":{\"os.node.description\":\"file number 13\"},\"name\":\"file13\"},{\"attributes\":{\"os.node.description\":\"file number 14\"},\"name\":\"file14\"},{\"attributes\":{\"os.node.description\":\"file number 15\"},\"name\":\"file15\"},{\"attributes\":{\"os.node.description\":\"file number 16\"},\"name\":\"file16\"},{\"attributes\":{\"os.node.description\":\"file number 17\"},\"name\":\"file17\"},{\"attributes\":{\"os.node.description\":\"file number 18\"},\"name\":\"file18\"},{\"attributes\":{\"os.node.description\":\"file number 19\"},\"name\":\"file19\"},{\"attributes\":{\"os.node.description\":\"file number 20\"},\"name\":\"file20\"},{\"attributes\":{\"os.node.description\":\"file number 21\"},\"name\":\"file21\"},{\"attributes\":{\"os.node.description\":\"file number 22\"},\"name\":\"file22\"},{\"attributes\":{\"os.node.description\":\"file number 23\"},\"name\":\"file23\"},{\"attributes\":{\"os.node.description\":\"file number 24\"},\"name\":\"file24\"},{\"attributes\":{\"os.node.description\":\"file number 25\"},\"name\":\"file25\"},{\"attributes\":{\"os.node.description\":\"file number 26\"},\"name\":\"file26\"},{\"attributes\":{\"os.node.description\":\"file number 27\"},\"name\":\"file27\"},{\"attributes\":{\"os.node.description\":\"file number 28\"},\"name\":\"file28\"},{\"attributes\":{\"os.node.description\":\"file number 29\"},\"name\":\"file29\"},{\"attributes\":{\"os.node.description\":\"file number 30\"},\"name\":\"file30\"},{\"attributes\":{\"os.node.description\":\"file number 31\"},\"name\":\"file31\"},{\"attributes\":{\"os.node.description\":\"file number 32\"},\"name\":\"file32\"},{\"attributes\":{\"os.node.description\":\"file number 33\"},\"name\":\"file33\"},{\"attributes\":{\"os.node.description\":\"file number 34\"},\"name\":\"file34\"},{\"attributes\":{\"os.node.description\":\"file number 35\"},\"name\":\"file35\"},{\"attributes\":{\"os.node.description\":\"file number 36\"},\"name\":\"file36\"},{\"attributes\":{\"os.node.description\":\"file number 37\"},\"name\":\"file37\"},{\"attributes\":{\"os.node.description\":\"file number 38\"},\"name\":\"file38\"},{\"attributes\":{\"os.node.description\":\"file number 39\"},\"name\":\"file39\"}],\"name\":\"huge dir\"}],\"name\":\"big dir\"}],\"name\":\"fancy dir\"},{\"attributes\":{\"os.node.description\":\"sdk directory\",\"os.node.type\":\"folder\",\"os.res.type\":\"folder.generic\"},\"children\":[{\"name\":\"test\"}],\"name\":\"sdk\"},{\"attributes\":{\"os.node.description\":\"sys folder\",\"os.node.type\":\"folder\",\"os.res.type\":\"folder.systems\"},\"children\":[{\"attributes\":{\"olap.ds.system\":\"KIW\",\"os.node.description\":\"KIW connection to BW system\",\"os.node.type\":\"folder\",\"os.res.type\":\"system\",\"os.sys.type\":\"BW\"},\"children\":[{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"olap.ds.name\":\"0BICS_C03_BICSTEST_Q0000\",\"olap.ds.type\":\"query\",\"os.node.type\":\"leaf\"},\"name\":\"0BICS_C03_BICSTEST_Q0000\"},{\"attributes\":{\"olap.ds.name\":\"0BICS_C03_BICSTEST_Q0034\",\"olap.ds.type\":\"query\",\"os.node.type\":\"leaf\"},\"name\":\"0BICS_C03_BICSTEST_Q0034\"}],\"name\":\"query\"}],\"name\":\"olap\"}],\"name\":\"KIW\"},{\"attributes\":{\"olap.ds.system\":\"B4S\",\"os.node.description\":\"B4S connection to BW system\",\"os.node.type\":\"folder\",\"os.res.type\":\"system\",\"os.sys.type\":\"BW\"},\"children\":[{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"olap.ds.name\":\"\\/BWTEST01\\/RTC2A1_Q0001\",\"olap.ds.type\":\"query\",\"os.node.type\":\"leaf\"},\"name\":\"/BWTEST01/RTC2A1_Q0001\"},{\"attributes\":{\"olap.ds.name\":\"0BICSADSO1_BICSTEST_Q0001\",\"olap.ds.type\":\"query\",\"os.node.type\":\"leaf\"},\"name\":\"0BICSADSO1_BICSTEST_Q0001\"},{\"attributes\":{\"olap.ds.name\":\"0BICSADSO1_BICSTEST_Q0002\",\"olap.ds.type\":\"query\",\"os.node.type\":\"leaf\"},\"name\":\"0BICSADSO1_BICSTEST_Q0002\"}],\"name\":\"query\"}],\"name\":\"olap\"}],\"name\":\"B4S\"},{\"attributes\":{\"os.node.description\":\"gipsy connection to MDS system\",\"os.node.type\":\"folder\",\"os.res.type\":\"system\",\"os.sys.type\":\"HANA\"},\"children\":[{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"olap.db.type\":\"view\",\"olap.ds.name\":\"LIQUID_SALES_AV1\",\"olap.ds.package\":\"liquid-sqe\",\"olap.ds.schema\":\"_SYS_BIC\",\"olap.ds.type\":\"view\"},\"name\":\"LIQUID_SALES_AV1\"},{\"attributes\":{\"olap.db.type\":\"view\",\"olap.ds.name\":\"LIQUID_SALES_AV1_HIER\",\"olap.ds.package\":\"liquid-sqe\",\"olap.ds.schema\":\"_SYS_BIC\",\"olap.ds.type\":\"view\"},\"name\":\"LIQUID_SALES_AV1_HIER\"}],\"name\":\"view\"},{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"olap.db.type\":\"inamodel\",\"olap.ds.name\":\"CUBE_LIQUID_SALES_AV1_COMPLETE\",\"olap.ds.package\":\"\",\"olap.ds.schema\":\"LIQUID_SQE\",\"olap.ds.type\":\"inamodel\"},\"name\":\"CUBE_LIQUID_SALES_AV1_COMPLETE\"}],\"name\":\"inamodel\"}],\"name\":\"olap\"}],\"name\":\"gipsy\"},{\"attributes\":{\"os.node.type\":\"folder\",\"os.res.type\":\"system\",\"os.sys.role\":\"Main\",\"os.sys.type\":\"ORCA\"},\"children\":[{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"olap.db.type\":\"view\",\"olap.ds.name\":\"LIQUID_SALES_AV1\",\"olap.ds.package\":\"liquid-sqe\",\"olap.ds.schema\":\"_SYS_BIC\",\"olap.ds.type\":\"view\"},\"name\":\"LIQUID_SALES_AV1\"},{\"attributes\":{\"olap.db.type\":\"view\",\"olap.ds.name\":\"LIQUID_SALES_AV1_HIER\",\"olap.ds.package\":\"liquid-sqe\",\"olap.ds.schema\":\"_SYS_BIC\",\"olap.ds.type\":\"view\"},\"name\":\"LIQUID_SALES_AV1_HIER\"}],\"name\":\"view\"},{\"attributes\":{\"os.node.type\":\"inamodel\"},\"children\":[{\"attributes\":{\"olap.db.type\":\"inamodel\",\"olap.ds.name\":\"CUBE_LIQUID_SALES_AV1_COMPLETE\",\"olap.ds.package\":\"\",\"olap.ds.schema\":\"LIQUID_SQE\",\"olap.ds.type\":\"inamodel\"},\"name\":\"CUBE_LIQUID_SALES_AV1_COMPLETE\"}],\"name\":\"inamodel\"}],\"name\":\"olap\"},{\"children\":[{\"attributes\":{\"os.node.type\":\"FOLDER\"},\"children\":[{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"}],\"description\":\"Public\",\"os.changedBy\":\"\",\"os.changedBy.displayName\":\"\",\"os.createdBy\":\"\",\"os.createdBy.displayName\":\"\",\"os.displayName\":\"PUBLIC\",\"os.mobile.support\":0,\"os.node.icon\":\"sap-icon:\\/\\/fpa\\/folder\",\"os.node.subType\":\"\",\"os.node.type\":\"FOLDER\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"PUBLIC\",\"os.ownerType\":\"PUBLIC\",\"os.parentUniqueId\":\"ROOT\",\"os.uniqueId\":\"PUBLIC\",\"os.updateCount\":0},\"children\":[{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"},{\"name\":\"PUBLIC\",\"os.displayName\":\"Public\"}],\"contentlib.packageId\":\"t.TEST\",\"description\":\"\",\"os.changedBy\":\"\",\"os.changedBy.displayName\":\"\",\"os.createdBy\":\"\",\"os.createdBy.displayName\":\"\",\"os.displayName\":\"Models\",\"os.mobile.support\":0,\"os.node.subType\":\"\",\"os.node.type\":\"FOLDER\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"PUBLIC\",\"os.ownerType\":\"PUBLIC\",\"os.parentUniqueId\":\"PUBLIC\",\"os.uniqueId\":\"MODELS\",\"os.updateCount\":0},\"children\":[],\"name\":\"MODELS\"}],\"name\":\"PUBLIC\"},{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"}],\"description\":\"Input Forms\",\"os.changedBy\":\"\",\"os.changedBy.displayName\":\"\",\"os.createdBy\":\"\",\"os.createdBy.displayName\":\"\",\"os.displayName\":\"INPUT_SCHEDULE\",\"os.mobile.support\":0,\"os.node.icon\":\"sap-icon:\\/\\/fpa\\/input-form\",\"os.node.subType\":\"\",\"os.node.type\":\"FOLDER\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"INPUT_SCHEDULE\",\"os.ownerType\":\"INPUT_SCHEDULE\",\"os.parentUniqueId\":\"ROOT\",\"os.uniqueId\":\"INPUT_SCHEDULE\",\"os.updateCount\":0},\"children\":[],\"name\":\"INPUT_SCHEDULE\"},{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"}],\"description\":\"\",\"os.changedBy\":\"\",\"os.changedBy.displayName\":\"\",\"os.createdBy\":\"\",\"os.createdBy.displayName\":\"\",\"os.displayName\":\"SAC Content\",\"os.mobile.support\":0,\"os.node.icon\":\"sap-icon:\\/\\/fpa\\/folder\",\"os.node.subType\":\"\",\"os.node.type\":\"FOLDER\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"SYSTEM\",\"os.ownerType\":\"SYSTEM\",\"os.parentUniqueId\":\"SYSTEM\",\"os.uniqueId\":\"SAC_CONTENT\",\"os.updateCount\":0},\"children\":[],\"name\":\"SAC_CONTENT\"},{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"}],\"description\":\"Samples\",\"os.changedBy\":\"\",\"os.changedBy.displayName\":\"\",\"os.createdBy\":\"\",\"os.createdBy.displayName\":\"\",\"os.displayName\":\"SAMPLES\",\"os.mobile.support\":0,\"os.node.icon\":\"sap-icon:\\/\\/fpa\\/folder\",\"os.node.subType\":\"\",\"os.node.type\":\"FOLDER\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"SYSTEM\",\"os.ownerType\":\"SYSTEM\",\"os.parentUniqueId\":\"SYSTEM\",\"os.uniqueId\":\"SAMPLES\",\"os.updateCount\":0},\"children\":[{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"},{\"name\":\"SAMPLES\",\"os.displayName\":\"Samples\"}],\"contentlib.packageId\":\"sap.epm\",\"description\":\"Model for the sample story\",\"os.changedBy\":\"\",\"os.changedBy.displayName\":\"\",\"os.createdBy\":\"\",\"os.createdBy.displayName\":\"\",\"os.displayName\":\"BestRunJuice_SampleModel\",\"os.is_shared\":false,\"os.mobile.support\":0,\"os.node.icon\":\"sap-icon:\\/\\/fpa\\/models\",\"os.node.subType\":\"ANALYTIC\",\"os.node.type\":\"CUBE\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"SAMPLES\",\"os.ownerType\":\"SAMPLES\",\"os.parentUniqueId\":\"SAMPLES\",\"os.shared\":false,\"os.shared_to_any\":true,\"os.uniqueId\":\"sap.epm:BestRunJuice_SampleModel\",\"os.updateCount\":0},\"name\":\"sap.epm:BestRunJuice_SampleModel\"}],\"name\":\"SAMPLES\"},{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"}],\"contentlib.packageId\":\"t.18\",\"description\":\"\",\"os.changedBy\":\"DEMO\",\"os.changedBy.displayName\":\"Demo user\",\"os.createdBy\":\"DEMO\",\"os.createdBy.displayName\":\"Demo user\",\"os.displayName\":\"New Insight dragonfly\",\"os.is_shared\":false,\"os.mobile.support\":0,\"os.node.icon\":\"sap-icon:\\/\\/fpa\\/chart-table\",\"os.node.subType\":\"INSIGHT\",\"os.node.type\":\"STORY\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"PRIVATE_DEMO\",\"os.ownerType\":\"PRIVATE\",\"os.parentUniqueId\":\"PRIVATE_DEMO\",\"os.shared\":true,\"os.shared_to_any\":false,\"os.uniqueId\":\"2840108354E61A69043CC0E4A400ED51\",\"os.updateCount\":0},\"name\":\"2840108354E61A69043CC0E4A400ED51\"},{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"}],\"description\":\"\",\"os.displayName\":\"It's not an insight\",\"os.node.icon\":\"sap-icon:\\/\\/fpa\\/chart-table\",\"os.node.subType\":\"\",\"os.node.type\":\"STORY\"},\"name\":\"a-machine-name\"},{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"sys\",\"os.displayName\":\"sys\",\"os.uniqueId\":\"sys\"},{\"name\":\"EHS\",\"os.displayName\":\"EHS\",\"os.uniqueId\":\"EHS\"},{\"name\":\"clib\",\"os.displayName\":\"clib\",\"os.uniqueId\":\"clib\"},{\"name\":\"MyFiles\",\"os.displayName\":\"MyFiles\",\"os.uniqueId\":\"MyFiles\"}],\"contentlib.packageId\":\"t.18\",\"contentlib.sourceResource\":{\"contentlib.packageId\":\"t.18\",\"description\":\"Model for the sample story\",\"os.changedBy\":\"DEMO2\",\"os.changedBy.displayName\":\"Demo User2\",\"os.createdBy\":\"DEMO2\",\"os.createdBy.displayName\":\"Demo User2\",\"os.displayName\":\"Shared model\",\"os.node.subType\":\"ANALYTIC\",\"os.node.type\":\"CUBE\",\"os.parentUniqueId\":\"PRIVATE_DEMO2\",\"os.uniqueId\":\"123456789E61A69043CC0E4A400ED51\",\"os.updateCount\":0},\"description\":\"Model for the sample story\",\"os.changedBy\":\"DEMO2\",\"os.changedBy.displayName\":\"Demo user2\",\"os.createdBy\":\"DEMO2\",\"os.createdBy.displayName\":\"Demo user2\",\"os.displayName\":\"Shared model\",\"os.is_shared\":true,\"os.mobile.support\":0,\"os.node.icon\":\"sap-icon:\\/\\/fpa\\/models\",\"os.node.type\":\"LINK\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"SHARED\",\"os.ownerType\":\"SHARED\",\"os.parentUniqueId\":\"SHARED\",\"os.shared\":true,\"os.shared_to_any\":false,\"os.uniqueId\":\"123456789E61A69043CC0E4A400ED51_SHARED\",\"os.updateCount\":0},\"name\":\"123456789E61A69043CC0E4A400ED51_SHARED\"}],\"name\":\"MyFiles\"},{\"attributes\":{\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"sys\",\"os.displayName\":\"sys\",\"os.uniqueId\":\"sys\"},{\"name\":\"EHS\",\"os.displayName\":\"EHS\",\"os.uniqueId\":\"EHS\"},{\"name\":\"clib\",\"os.displayName\":\"clib\",\"os.uniqueId\":\"clib\"},{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\",\"os.uniqueId\":\"My Files\"},{\"name\":\"SAMPLES\",\"os.displayName\":\"Samples\",\"os.uniqueId\":\"SAMPLES\"}],\"contentlib.packageId\":\"sap.epm\",\"description\":\"Model for the sample story\",\"os.changedBy\":\"\",\"os.changedBy.displayName\":\"\",\"os.createdBy\":\"\",\"os.createdBy.displayName\":\"\",\"os.displayName\":\"BestRunJuice_SampleModel\",\"os.is_shared\":true,\"os.mobile.support\":0,\"os.node.subType\":\"ANALYTIC\",\"os.node.type\":\"CUBE\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"SAMPLES\",\"os.ownerType\":\"SAMPLES\",\"os.parentUniqueId\":\"SAMPLES\",\"os.shared\":false,\"os.shared_to_any\":true,\"os.uniqueId\":\"sap.epm:BestRunJuice_SampleModel\",\"os.updateCount\":0},\"name\":\"sap.epm:BestRunJuice_SampleModel\"}],\"name\":\"Catalog\"},{\"attributes\":{},\"children\":[],\"name\":\"Workspaces\"},{\"attributes\":{\"description\":\"Recent files for user\",\"os.node.type\":\"folder\"},\"children\":[{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"}],\"contentlib.packageId\":\"t.18\",\"description\":\"\",\"os.changedBy\":\"DEMO\",\"os.changedBy.displayName\":\"Demo user\",\"os.createdBy\":\"DEMO\",\"os.createdBy.displayName\":\"Demo user\",\"os.displayName\":\"New Insight dragonfly\",\"os.isLink\":true,\"os.is_shared\":false,\"os.linkUrl\":\"MyFiles\\/\",\"os.mobile.support\":0,\"os.node.subType\":\"INSIGHT\",\"os.node.type\":\"STORY\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"PRIVATE_DEMO\",\"os.ownerType\":\"PRIVATE\",\"os.parentUniqueId\":\"PRIVATE_DEMO\",\"os.shared\":true,\"os.shared_to_any\":false,\"os.uniqueId\":\"2840108354E61A69043CC0E4A400ED51\",\"os.updateCount\":0},\"name\":\"2840108354E61A69043CC0E4A400ED51\"},{\"attributes\":{\"contentlib.ancestorResource\":[{\"name\":\"MyFiles\",\"os.displayName\":\"My Files\"},{\"name\":\"SAMPLES\",\"os.displayName\":\"Samples\"}],\"contentlib.packageId\":\"sap.epm\",\"description\":\"Model for the sample story\",\"os.changedBy\":\"\",\"os.changedBy.displayName\":\"\",\"os.createdBy\":\"\",\"os.createdBy.displayName\":\"\",\"os.displayName\":\"BestRunJuice_SampleModel\",\"os.isLink\":true,\"os.is_shared\":true,\"os.linkUrl\":\"MyFiles\\/SAMPLES\\/\",\"os.mobile.support\":0,\"os.node.subType\":\"ANALYTIC\",\"os.node.type\":\"CUBE\",\"os.originalLanguage\":\"E\",\"os.ownerFolder\":\"SAMPLES\",\"os.ownerType\":\"SAMPLES\",\"os.parentUniqueId\":\"SAMPLES\",\"os.shared\":false,\"os.shared_to_any\":true,\"os.uniqueId\":\"sap.epm:BestRunJuice_SampleModel\",\"os.updateCount\":0},\"name\":\"sap.epm:BestRunJuice_SampleModel\"}],\"name\":\"RecentFiles\"}],\"name\":\"clib\"}],\"name\":\"EHS\"}],\"name\":\"sys\"}],\"name\":\"root\"}";
oFF.FsDpPoolFileSystem.create = function(process)
{
	var newObj = new oFF.FsDpPoolFileSystem();
	newObj.setupProcessContext(process);
	return newObj;
};
oFF.FsDpPoolFileSystem.prototype.m_fs = null;
oFF.FsDpPoolFileSystem.prototype.setupProcessContext = function(process)
{
	oFF.DfXFileSystem.prototype.setupProcessContext.call( this , process);
	this.m_fs = oFF.JsonParserFactory.createFromString(oFF.FsDpPoolFileSystem.DEFINITION);
};
oFF.FsDpPoolFileSystem.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.FS_DP;
};
oFF.FsDpPoolFileSystem.prototype.getFileType = function(file)
{
	if (this.isDirectoryExt(file))
	{
		return oFF.XFileType.DIR;
	}
	else
	{
		return oFF.XFileType.FILE;
	}
};
oFF.FsDpPoolFileSystem.prototype.isExistingExt = function(file)
{
	var targetUri = file.getTargetUri();
	var fileStructure = this.getFileStructure(targetUri);
	return oFF.notNull(fileStructure);
};
oFF.FsDpPoolFileSystem.prototype.isFileExt = function(file)
{
	return !this.isDirectoryExt(file);
};
oFF.FsDpPoolFileSystem.prototype.isDirectoryExt = function(file)
{
	var targetUri = file.getTargetUri();
	var fileStructure = this.getFileStructure(targetUri);
	return oFF.notNull(fileStructure) ? fileStructure.containsKey("children") : false;
};
oFF.FsDpPoolFileSystem.prototype.getAttributes = function(file)
{
	var result = null;
	var targetUri = file.getTargetUri();
	var fileStructure = this.getFileStructure(targetUri);
	result = this.prepareMetadata(fileStructure);
	if (oFF.isNull(result))
	{
		result = oFF.DfXFileSystem.prototype.getAttributes.call( this , file);
	}
	return result;
};
oFF.FsDpPoolFileSystem.prototype.getChildrenMetadata = function(file)
{
	var children = oFF.XList.create();
	var targetUri = file.getTargetUri();
	var fileStructure = this.getFileStructure(targetUri);
	if (oFF.notNull(fileStructure))
	{
		var childList = fileStructure.getListByKey("children");
		if (oFF.notNull(childList))
		{
			for (var i = 0; i < childList.size(); i++)
			{
				var currentChild = childList.getStructureAt(i);
				var updatedChild = this.prepareMetadata(currentChild);
				children.add(updatedChild);
			}
		}
	}
	return children;
};
oFF.FsDpPoolFileSystem.prototype.getFileStructure = function(uri)
{
	var pathContainer = uri.getPathContainer();
	var elements = pathContainer.getPathNames();
	var element = null;
	if (pathContainer.isAbsolute() === true)
	{
		element = this.m_fs;
		for (var k = 0; k < elements.size() && oFF.notNull(element); k++)
		{
			var name = elements.get(k);
			var childList = element.getListByKey("children");
			element = null;
			if (oFF.notNull(childList))
			{
				for (var i = 0; i < childList.size(); i++)
				{
					var currentChild = childList.getStructureAt(i);
					var currentName = currentChild.getStringByKey("name");
					if (oFF.XString.isEqual(name, currentName))
					{
						element = currentChild;
						break;
					}
				}
			}
		}
	}
	return element;
};
oFF.FsDpPoolFileSystem.prototype.prepareMetadata = function(myElement)
{
	var metadata = null;
	if (oFF.notNull(myElement))
	{
		metadata = myElement.getStructureByKey("attributes");
		if (oFF.notNull(metadata))
		{
			metadata = oFF.PrStructure.createDeepCopy(metadata);
		}
		else
		{
			metadata = oFF.PrFactory.createStructure();
		}
		var theName = myElement.getStringByKey("name");
		var isDir = myElement.containsKey("children");
		if (metadata.containsKey(oFF.XFileAttribute.NAME.getName()) === false)
		{
			metadata.putString(oFF.XFileAttribute.NAME.getName(), theName);
		}
		if (metadata.containsKey(oFF.XFileAttribute.DISPLAY_NAME.getName()) === false)
		{
			metadata.putString(oFF.XFileAttribute.DISPLAY_NAME.getName(), theName);
		}
		if (metadata.containsKey(oFF.XFileAttribute.FILE_TYPE.getName()) === false)
		{
			if (isDir === true)
			{
				metadata.putString(oFF.XFileAttribute.FILE_TYPE.getName(), oFF.XFileType.DIR.getName());
			}
			else
			{
				metadata.putString(oFF.XFileAttribute.FILE_TYPE.getName(), oFF.XFileType.FILE.getName());
			}
		}
		metadata.putBoolean(oFF.XFileAttribute.IS_DIRECTORY.getName(), isDir);
		metadata.putBoolean(oFF.XFileAttribute.IS_FILE.getName(), !isDir);
		metadata.putBoolean(oFF.XFileAttribute.IS_HIDDEN.getName(), false);
		metadata.putBoolean(oFF.XFileAttribute.IS_EXECUTABLE.getName(), false);
		metadata.putBoolean(oFF.XFileAttribute.IS_READABLE.getName(), true);
		metadata.putBoolean(oFF.XFileAttribute.IS_WRITEABLE.getName(), false);
		metadata.putBoolean(oFF.XFileAttribute.IS_EXISTING.getName(), true);
		metadata.putLong(oFF.XFileAttribute.SIZE.getName(), 0);
	}
	return metadata;
};

oFF.SubSysFsDpPoolPrg = function() {};
oFF.SubSysFsDpPoolPrg.prototype = new oFF.DfSubSysFilesystem();
oFF.SubSysFsDpPoolPrg.prototype._ff_c = "SubSysFsDpPoolPrg";

oFF.SubSysFsDpPoolPrg.DEFAULT_PROGRAM_NAME = "@SubSys.FileSystem.fsdp";
oFF.SubSysFsDpPoolPrg.prototype.m_fs = null;
oFF.SubSysFsDpPoolPrg.prototype.newProgram = function()
{
	var prg = new oFF.SubSysFsDpPoolPrg();
	prg.setup();
	return prg;
};
oFF.SubSysFsDpPoolPrg.prototype.getProgramName = function()
{
	return oFF.SubSysFsDpPoolPrg.DEFAULT_PROGRAM_NAME;
};
oFF.SubSysFsDpPoolPrg.prototype.runProcess = function()
{
	var process = this.getProcess();
	this.m_fs = oFF.FsDpPoolFileSystem.create(process);
	this.activateSubSystem(null, oFF.SubSystemStatus.ACTIVE);
	return false;
};
oFF.SubSysFsDpPoolPrg.prototype.getFileSystem = function(protocolType)
{
	return this.m_fs;
};
oFF.SubSysFsDpPoolPrg.prototype.getProtocolType = function()
{
	return oFF.ProtocolType.FS_DP;
};

oFF.XFsDpPoolActionFetch = function() {};
oFF.XFsDpPoolActionFetch.prototype = new oFF.SyncActionExt();
oFF.XFsDpPoolActionFetch.prototype._ff_c = "XFsDpPoolActionFetch";

oFF.XFsDpPoolActionFetch.createAndRun = function(syncType, listener, customIdentifier, fsmr, uri)
{
	var object = new oFF.XFsDpPoolActionFetch();
	object.setupActionAndRun(syncType, listener, customIdentifier, fsmr);
	return object;
};
oFF.XFsDpPoolActionFetch.prototype.processSynchronization = function(syncType)
{
	var fileSystem = this.getActionContext().getFileSystem(oFF.ProtocolType.FS_DP);
	this.setData(fileSystem);
	return false;
};
oFF.XFsDpPoolActionFetch.prototype.callListener = function(extResult, listener, data, customIdentifier)
{
	listener.onFileSystemFetched(extResult, data, customIdentifier);
};

oFF.BindingModule = function() {};
oFF.BindingModule.prototype = new oFF.DfModule();
oFF.BindingModule.prototype._ff_c = "BindingModule";

oFF.BindingModule.s_module = null;
oFF.BindingModule.getInstance = function()
{
	if (oFF.isNull(oFF.BindingModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.KernelNativeModule.getInstance());
		oFF.BindingModule.s_module = oFF.DfModule.startExt(new oFF.BindingModule());
		oFF.ProtocolBindingType.staticSetup();
		oFF.SemanticBindingType.staticSetup();
		oFF.DpBindingFactory.staticSetup();
		oFF.DpBindingStringFactory.staticSetupStringBindingFactory();
		oFF.ProgramRegistration.setProgramFactory(new oFF.SubSysFsDpPoolPrg());
		oFF.DfModule.stopExt(oFF.BindingModule.s_module);
	}
	return oFF.BindingModule.s_module;
};
oFF.BindingModule.prototype.getName = function()
{
	return "ff2010.binding";
};

oFF.BindingModule.getInstance();

return sap.firefly;
	} );
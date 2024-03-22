/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff3400.contextmenu.engine","sap/sac/df/firefly/ff2220.ui.tools"
],
function(oFF)
{
"use strict";

oFF.CmeUiGenericFactoryCustomToolbarFiller = function() {};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype = new oFF.XObject();
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype._ff_c = "CmeUiGenericFactoryCustomToolbarFiller";

oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_NEVER_VALUE = 0;
oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_LOW_VALUE = 1;
oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_HIGH_VALUE = 2;
oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_DISAPPEAR_VALUE = 3;
oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_ALWAYS_VALUE = 4;
oFF.CmeUiGenericFactoryCustomToolbarFiller.create = function()
{
	var instance = new oFF.CmeUiGenericFactoryCustomToolbarFiller();
	return instance;
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.hasItemElements = function(topLevelItem)
{
	return oFF.XCollectionUtils.hasElements(topLevelItem.getToolbarSection().getGroups());
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.getItemCount = function(menuItem)
{
	return menuItem.getToolbarSection().getGroupCount();
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.createGroupItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, hasDefaultAction, currentDefaultAction)
{
	var group = this.getRelevantGroup(topLevelItem, isSectionStart);
	var menuItem = group.addMenu(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), hasDefaultAction);
	menuItem.setIcon(icon);
	menuItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	menuItem.setName(name);
	menuItem.setEnabled(enabled && (!hasDefaultAction || oFF.notNull(currentDefaultAction)));
	if (oFF.notNull(currentDefaultAction) && enabled)
	{
		menuItem.setPressConsumer( function(ev){
			currentDefaultAction();
		}.bind(this));
	}
	this.applyOverflowPriority(menuItem, overflowPriority);
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.applyOverflowPriority = function(menuItem, overflowPriority)
{
	switch (overflowPriority)
	{
		case oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_ALWAYS_VALUE:
			menuItem.setOverflowPriority(oFF.UiToolbarPriority.ALWAYS_OVERFLOW);
			break;

		case oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_DISAPPEAR_VALUE:
			menuItem.setOverflowPriority(oFF.UiToolbarPriority.DISAPPEAR);
			break;

		case oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_HIGH_VALUE:
			menuItem.setOverflowPriority(oFF.UiToolbarPriority.HIGH);
			break;

		case oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_LOW_VALUE:
			menuItem.setOverflowPriority(oFF.UiToolbarPriority.LOW);
			break;

		case oFF.CmeUiGenericFactoryCustomToolbarFiller.OVERFLOW_PRIORITY_NEVER_VALUE:
			menuItem.setOverflowPriority(oFF.UiToolbarPriority.NEVER_OVERFLOW);
			break;
	}
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.getRelevantGroup = function(topLevelItem, isSectionStart)
{
	var group;
	if (isSectionStart || !this.hasItemElements(topLevelItem))
	{
		group = topLevelItem.getToolbarSection().addNewGroup();
	}
	else
	{
		var groups = topLevelItem.getToolbarSection().getGroups();
		group = groups.get(groups.size() - 1);
	}
	return group;
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.createTriggerItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure)
{
	var group = this.getRelevantGroup(topLevelItem, isSectionStart);
	var menuItem = group.addButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	menuItem.setPressConsumer( function(ev){
		procedure();
	}.bind(this));
	this.applyOverflowPriority(menuItem, overflowPriority);
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.createToggleItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure, active, stateIcon)
{
	var group = this.getRelevantGroup(topLevelItem, isSectionStart);
	var menuItem = group.addToggleButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	menuItem.setPressConsumer( function(ev){
		procedure();
	}.bind(this));
	menuItem.setPressed(active === oFF.TriStateBool._TRUE);
	this.applyOverflowPriority(menuItem, overflowPriority);
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.createTitleItem = function(container, sectionStart, overflowPriority, name, text, icon, explanation) {};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.synchronizeGroupMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, hasDefaultAction, defaultAction)
{
	uiItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	uiItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	uiItem.setEnabled(enabled && (!hasDefaultAction || oFF.notNull(defaultAction)));
	if (oFF.notNull(defaultAction) && enabled)
	{
		uiItem.setPressConsumer( function(ev){
			defaultAction();
		}.bind(this));
	}
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.synchronizeToggleMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command, active, stateIcon)
{
	var toggleItem = uiItem;
	toggleItem.setEnabled(enabled);
	toggleItem.setPressConsumer( function(ev){
		command();
	}.bind(this));
	toggleItem.setPressed(active === oFF.TriStateBool._TRUE);
	toggleItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	toggleItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	toggleItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.synchronizeTriggerMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command)
{
	var button = uiItem;
	button.setEnabled(enabled);
	button.setPressConsumer( function(ev){
		command();
	}.bind(this));
	button.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	button.setIcon(icon);
	uiItem.setEnabled(enabled);
	button.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.supportsSynchronization = function()
{
	return true;
};
oFF.CmeUiGenericFactoryCustomToolbarFiller.prototype.clearGroup = function(container)
{
	var items = container.getToolbarSection().getGroups();
	container.getToolbarSection().clearItems();
	oFF.XCollectionUtils.releaseEntriesFromCollection(items);
};

oFF.CmeUiGenericFactoryCustomToolbarFixed = function() {};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype = new oFF.XObject();
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype._ff_c = "CmeUiGenericFactoryCustomToolbarFixed";

oFF.CmeUiGenericFactoryCustomToolbarFixed.create = function()
{
	var instance = new oFF.CmeUiGenericFactoryCustomToolbarFixed();
	return instance;
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.hasItemElements = function(topLevelItem)
{
	return oFF.XCollectionUtils.hasElements(topLevelItem.getFixedToolbarSection().getView().getItems());
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.getItemCount = function(menuItem)
{
	return menuItem.getFixedToolbarSection().getView().getItems().size();
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.createGroupItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, hasDefaultAction, currentDefaultAction)
{
	var genesis = topLevelItem.getFixedToolbarSection().getGenesis();
	if (isSectionStart && this.hasItemElements(topLevelItem))
	{
		topLevelItem.getFixedToolbarSection().addControl(genesis.newControl(oFF.UiType.SEPARATOR));
	}
	var menuToPopulate = genesis.newControl(oFF.UiType.MENU);
	var menuItem = topLevelItem.getFixedToolbarSection().addNewButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(controlEvent){
		menuToPopulate.openAt(controlEvent.getControl());
	}.bind(this)));
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	return menuToPopulate;
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.createTriggerItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure)
{
	var genesis = topLevelItem.getFixedToolbarSection().getGenesis();
	if (isSectionStart && this.hasItemElements(topLevelItem))
	{
		topLevelItem.getFixedToolbarSection().addControl(genesis.newControl(oFF.UiType.SEPARATOR));
	}
	var menuItem = topLevelItem.getFixedToolbarSection().addNewButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(ev){
		procedure();
	}.bind(this)));
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.createToggleItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure, active, stateIcon)
{
	var genesis = topLevelItem.getFixedToolbarSection().getGenesis();
	if (isSectionStart && this.hasItemElements(topLevelItem))
	{
		topLevelItem.getFixedToolbarSection().addControl(genesis.newControl(oFF.UiType.SEPARATOR));
	}
	var menuItem = topLevelItem.getFixedToolbarSection().addNewToggleButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(ev){
		procedure();
	}.bind(this)));
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	menuItem.setPressed(active === oFF.TriStateBool._TRUE);
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.createTitleItem = function(container, sectionStart, overflowPriority, name, text, icon, explanation) {};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.synchronizeGroupMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, hasDefaultAction, defaultAction)
{
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.synchronizeToggleMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command, active, stateIcon)
{
	var toggleItem = uiItem;
	toggleItem.setEnabled(enabled);
	toggleItem.registerOnPress(oFF.UiLambdaPressListener.create( function(ev){
		command();
	}.bind(this)));
	toggleItem.setPressed(active === oFF.TriStateBool._TRUE);
	toggleItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	toggleItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	toggleItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.synchronizeTriggerMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command)
{
	uiItem.setEnabled(enabled);
	uiItem.registerOnPress(oFF.UiLambdaPressListener.create( function(ev){
		command();
	}.bind(this)));
	uiItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	uiItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.supportsSynchronization = function()
{
	return true;
};
oFF.CmeUiGenericFactoryCustomToolbarFixed.prototype.clearGroup = function(container)
{
	container.getFixedToolbarSection().clearItems();
};

oFF.CmeUiGenericFactoryCustomToolbarItem = function() {};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype = new oFF.XObject();
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype._ff_c = "CmeUiGenericFactoryCustomToolbarItem";

oFF.CmeUiGenericFactoryCustomToolbarItem.create = function()
{
	var instance = new oFF.CmeUiGenericFactoryCustomToolbarItem();
	return instance;
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.hasItemElements = function(topLevelItem)
{
	return oFF.XCollectionUtils.hasElements(topLevelItem.getItems());
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.getItemCount = function(menuItem)
{
	return !oFF.XCollectionUtils.hasElements(menuItem.getItems()) ? 0 : menuItem.getItems().size();
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.createGroupItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, hasDefaultAction, currentDefaultAction)
{
	var menuItem = topLevelItem.addButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	var menuToPopulate = menuItem.getView().getUiManager().getGenesis().newControl(oFF.UiType.MENU);
	menuItem.setPressConsumer(this.createPressConsumer(menuToPopulate));
	return menuToPopulate;
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.createTriggerItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure)
{
	var menuItem = topLevelItem.addButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	menuItem.setPressConsumer( function(ev){
		procedure();
	}.bind(this));
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.createToggleItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure, active, stateIcon)
{
	var menuItem = topLevelItem.addToggleButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	menuItem.setPressConsumer( function(ev){
		procedure();
	}.bind(this));
	menuItem.setPressed(active === oFF.TriStateBool._TRUE);
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.createTitleItem = function(container, sectionStart, overflowPriority, name, text, icon, explanation) {};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.createPressConsumer = function(menuToPopulate)
{
	return  function(controlEvent){
		menuToPopulate.openAt(controlEvent.getControl());
	}.bind(this);
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.synchronizeGroupMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, hasDefaultAction, defaultAction)
{
	uiItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	uiItem.setEnabled(enabled);
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.synchronizeToggleMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command, active, stateIcon)
{
	var toggleItem = uiItem;
	toggleItem.setEnabled(enabled);
	toggleItem.setPressConsumer( function(ev){
		command();
	}.bind(this));
	toggleItem.setPressed(active === oFF.TriStateBool._TRUE);
	toggleItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	toggleItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	toggleItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.synchronizeTriggerMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command)
{
	var button = uiItem;
	button.setEnabled(enabled);
	button.setPressConsumer( function(ev){
		command();
	}.bind(this));
	button.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	button.setIcon(icon);
	uiItem.setEnabled(enabled);
	button.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.supportsSynchronization = function()
{
	return true;
};
oFF.CmeUiGenericFactoryCustomToolbarItem.prototype.clearGroup = function(container)
{
	var items = container.getItems();
	container.clearItems();
	oFF.XCollectionUtils.releaseEntriesFromCollection(items);
};

oFF.CmeUiGenericFactoryCustomToolbarMenuSub = function() {};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype = new oFF.XObject();
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype._ff_c = "CmeUiGenericFactoryCustomToolbarMenuSub";

oFF.CmeUiGenericFactoryCustomToolbarMenuSub.create = function()
{
	var instance = new oFF.CmeUiGenericFactoryCustomToolbarMenuSub();
	return instance;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.hasItemElements = function(topLevelItem)
{
	return false;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.getItemCount = function(menuItem)
{
	return 0;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.createGroupItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, hasDefaultAction, currentDefaultAction)
{
	var menuItem = topLevelItem.addMenuItem(name, text, icon);
	menuItem.setSectionStart(isSectionStart);
	menuItem.setTooltip(explanation);
	menuItem.setEnabled(enabled);
	if (oFF.XStringUtils.isNullOrEmpty(icon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.createTriggerItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure)
{
	var menuItem = topLevelItem.addMenuItem(name, text, icon);
	menuItem.setSectionStart(isSectionStart);
	menuItem.setTooltip(explanation);
	menuItem.setEnabled(enabled);
	menuItem.setPressConsumer( function(ev){
		procedure();
	}.bind(this));
	if (oFF.XStringUtils.isNullOrEmpty(icon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.createToggleItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure, active, stateIcon)
{
	var menuItem = topLevelItem.addMenuItem(name, text, stateIcon);
	menuItem.setSectionStart(isSectionStart);
	menuItem.setTooltip(explanation);
	menuItem.setEnabled(enabled);
	menuItem.setPressConsumer( function(ev){
		procedure();
	}.bind(this));
	if (oFF.XStringUtils.isNullOrEmpty(stateIcon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.createTitleItem = function(container, sectionStart, overflowPriority, name, text, icon, explanation)
{
	var menuItem = container.addMenuItem(name, text, oFF.XStringUtils.isNullOrEmpty(icon) ? oFF.CmeUiGenericMenuMapper.DEFAULT_TITLE_MENU_ICON : icon);
	menuItem.setTooltip(explanation);
	menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.TITLE_MENU_CSS_CLASS);
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.synchronizeGroupMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, hasDefaultAction, defaultAction)
{
	uiItem.setText(text);
	uiItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	uiItem.setEnabled(enabled);
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.synchronizeToggleMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command, active, stateIcon)
{
	uiItem.setEnabled(enabled);
	uiItem.setPressConsumer( function(ev){
		command();
	}.bind(this));
	uiItem.setText(text);
	uiItem.setIcon(stateIcon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.synchronizeTriggerMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command)
{
	uiItem.setEnabled(enabled);
	uiItem.setPressConsumer( function(ev){
		command();
	}.bind(this));
	uiItem.setText(text);
	uiItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.supportsSynchronization = function()
{
	return true;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSub.prototype.clearGroup = function(container)
{
	container.clearItems();
};

oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub = function() {};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype = new oFF.XObject();
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype._ff_c = "CmeUiGenericFactoryCustomToolbarMenuSubSub";

oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.create = function()
{
	var instance = new oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub();
	return instance;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.hasItemElements = function(topLevelItem)
{
	return false;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.getItemCount = function(menuItem)
{
	return 0;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.createGroupItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, hasDefaultAction, currentDefaultAction)
{
	var menuItem = topLevelItem.addMenuItem(name, text, icon);
	menuItem.setSectionStart(isSectionStart);
	menuItem.setTooltip(explanation);
	menuItem.setEnabled(enabled);
	if (oFF.XStringUtils.isNullOrEmpty(icon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.createTriggerItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure)
{
	var menuItem = topLevelItem.addMenuItem(name, text, icon);
	menuItem.setSectionStart(isSectionStart);
	menuItem.setTooltip(explanation);
	menuItem.setEnabled(enabled);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		procedure();
	}.bind(this)));
	if (oFF.XStringUtils.isNullOrEmpty(icon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.createToggleItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure, active, stateIcon)
{
	var menuItem = topLevelItem.addMenuItem(name, text, stateIcon);
	menuItem.setSectionStart(isSectionStart);
	menuItem.setTooltip(explanation);
	menuItem.setEnabled(enabled);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		procedure();
	}.bind(this)));
	if (oFF.XStringUtils.isNullOrEmpty(stateIcon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.createTitleItem = function(container, sectionStart, overflowPriority, name, text, icon, explanation)
{
	var menuItem = container.addMenuItem(name, text, oFF.XStringUtils.isNullOrEmpty(icon) ? oFF.CmeUiGenericMenuMapper.DEFAULT_TITLE_MENU_ICON : icon);
	menuItem.setSectionStart(sectionStart);
	menuItem.setText(text);
	menuItem.setTooltip(explanation);
	menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.TITLE_MENU_CSS_CLASS);
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.synchronizeGroupMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, hasDefaultAction, defaultAction)
{
	uiItem.setText(text);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
	uiItem.setEnabled(enabled);
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.synchronizeToggleMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command, active, stateIcon)
{
	uiItem.setEnabled(enabled);
	uiItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		command();
	}.bind(this)));
	uiItem.setText(text);
	uiItem.setIcon(stateIcon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.synchronizeTriggerMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command)
{
	uiItem.setEnabled(enabled);
	uiItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		command();
	}.bind(this)));
	uiItem.setText(text);
	uiItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.supportsSynchronization = function()
{
	return true;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.prototype.clearGroup = function(container)
{
	container.clearItems();
};

oFF.CmeUiGenericFactoryCustomToolbarMenuTop = function() {};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype = new oFF.XObject();
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype._ff_c = "CmeUiGenericFactoryCustomToolbarMenuTop";

oFF.CmeUiGenericFactoryCustomToolbarMenuTop.create = function()
{
	var instance = new oFF.CmeUiGenericFactoryCustomToolbarMenuTop();
	return instance;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.hasItemElements = function(topLevelItem)
{
	return oFF.XCollectionUtils.hasElements(topLevelItem.getItems());
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.getItemCount = function(menuItem)
{
	return !oFF.XCollectionUtils.hasElements(menuItem.getItems()) ? 0 : menuItem.getItems().size();
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.createGroupItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, hasDefaultAction, currentDefaultAction)
{
	var menuItem = topLevelItem.addMenu(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), hasDefaultAction);
	menuItem.setName(name);
	menuItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	menuItem.setEnabled(enabled && (!hasDefaultAction || oFF.notNull(currentDefaultAction)));
	if (oFF.notNull(currentDefaultAction) && enabled)
	{
		menuItem.setPressConsumer( function(pressed){
			currentDefaultAction();
		}.bind(this));
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.createTriggerItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure)
{
	var menuItem = topLevelItem.addButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	menuItem.setPressConsumer( function(ev){
		procedure();
	}.bind(this));
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.createToggleItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure, active, stateIcon)
{
	var menuItem = topLevelItem.addToggleButton(name, oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text), oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation), icon);
	menuItem.setName(name);
	menuItem.setEnabled(enabled);
	menuItem.setPressConsumer( function(ev){
		procedure();
	}.bind(this));
	menuItem.setPressed(active === oFF.TriStateBool._TRUE);
	return menuItem;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.createTitleItem = function(container, sectionStart, overflowPriority, name, text, icon, explanation) {};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.synchronizeGroupMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, hasDefaultAction, defaultAction)
{
	uiItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	uiItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	uiItem.setEnabled(enabled && (!hasDefaultAction || oFF.notNull(defaultAction)));
	if (oFF.notNull(defaultAction) && enabled)
	{
		uiItem.setPressConsumer( function(ev){
			defaultAction();
		}.bind(this));
	}
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.synchronizeToggleMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command, active, stateIcon)
{
	var menuItem = uiItem;
	menuItem.setEnabled(enabled);
	menuItem.setPressConsumer( function(ev){
		command();
	}.bind(this));
	menuItem.setPressed(active === oFF.TriStateBool._TRUE);
	menuItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	menuItem.setIcon(stateIcon);
	menuItem.setEnabled(enabled);
	menuItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.synchronizeTriggerMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command)
{
	var button = uiItem;
	button.setEnabled(enabled);
	button.setPressConsumer( function(ev){
		command();
	}.bind(this));
	button.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	button.setIcon(icon);
	uiItem.setEnabled(enabled);
	button.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.supportsSynchronization = function()
{
	return true;
};
oFF.CmeUiGenericFactoryCustomToolbarMenuTop.prototype.clearGroup = function(container)
{
	var items = container.getItems();
	container.clearItems();
	oFF.XCollectionUtils.releaseEntriesFromCollection(items);
};

oFF.CmeUiGenericFactoryStandardMenuSub = function() {};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype = new oFF.XObject();
oFF.CmeUiGenericFactoryStandardMenuSub.prototype._ff_c = "CmeUiGenericFactoryStandardMenuSub";

oFF.CmeUiGenericFactoryStandardMenuSub.create = function()
{
	var instance = new oFF.CmeUiGenericFactoryStandardMenuSub();
	return instance;
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.createGroupItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, hasDefaultAction, currentDefaultAction)
{
	var menuItem = topLevelItem.addNewItem();
	menuItem.setSectionStart(isSectionStart);
	menuItem.setName(name);
	menuItem.setText(text);
	menuItem.setTooltip(explanation);
	menuItem.setIcon(icon);
	menuItem.setEnabled(enabled);
	if (oFF.XStringUtils.isNullOrEmpty(icon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.createTriggerItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure)
{
	var menuItem = topLevelItem.addNewItem();
	menuItem.setSectionStart(isSectionStart);
	menuItem.setName(name);
	menuItem.setText(text);
	menuItem.setTooltip(explanation);
	menuItem.setIcon(icon);
	menuItem.setEnabled(enabled);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		procedure();
	}.bind(this)));
	if (oFF.XStringUtils.isNullOrEmpty(icon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.createToggleItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure, active, stateIcon)
{
	var menuItem = topLevelItem.addNewItem();
	menuItem.setSectionStart(isSectionStart);
	menuItem.setName(name);
	menuItem.setText(text);
	menuItem.setTooltip(explanation);
	menuItem.setEnabled(enabled);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		procedure();
	}.bind(this)));
	menuItem.setIcon(stateIcon);
	if (oFF.XStringUtils.isNullOrEmpty(stateIcon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.createTitleItem = function(container, sectionStart, overflowPriority, name, text, icon, explanation)
{
	var menuItem = container.addNewItem();
	menuItem.setSectionStart(sectionStart);
	menuItem.setName(name);
	menuItem.setText(text);
	menuItem.setTooltip(explanation);
	menuItem.setIcon(oFF.XStringUtils.isNullOrEmpty(icon) ? oFF.CmeUiGenericMenuMapper.DEFAULT_TITLE_MENU_ICON : icon);
	menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.TITLE_MENU_CSS_CLASS);
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.hasItemElements = function(topLevelItem)
{
	return oFF.XCollectionUtils.hasElements(topLevelItem.getItems());
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.getItemCount = function(menuItem)
{
	return menuItem.getItemCount();
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.synchronizeGroupMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, hasDefaultAction, defaultAction)
{
	uiItem.setText(text);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
	uiItem.setEnabled(enabled);
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.synchronizeToggleMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command, active, stateIcon)
{
	uiItem.setEnabled(enabled);
	uiItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		command();
	}.bind(this)));
	uiItem.setText(text);
	uiItem.setIcon(stateIcon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.synchronizeTriggerMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command)
{
	uiItem.setEnabled(enabled);
	uiItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		command();
	}.bind(this)));
	uiItem.setText(text);
	uiItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.supportsSynchronization = function()
{
	return true;
};
oFF.CmeUiGenericFactoryStandardMenuSub.prototype.clearGroup = function(container)
{
	var items = container.getItems();
	container.clearItems();
	oFF.XCollectionUtils.releaseEntriesFromCollection(items);
};

oFF.CmeUiGenericFactoryStandardMenuTop = function() {};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype = new oFF.XObject();
oFF.CmeUiGenericFactoryStandardMenuTop.prototype._ff_c = "CmeUiGenericFactoryStandardMenuTop";

oFF.CmeUiGenericFactoryStandardMenuTop.create = function()
{
	var instance = new oFF.CmeUiGenericFactoryStandardMenuTop();
	return instance;
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.hasItemElements = function(topLevelItem)
{
	return oFF.XCollectionUtils.hasElements(topLevelItem.getItems());
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.getItemCount = function(menuItem)
{
	return menuItem.getItemCount();
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.createGroupItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, hasDefaultAction, currentDefaultAction)
{
	var menuItem = topLevelItem.addNewItem();
	menuItem.setSectionStart(isSectionStart);
	menuItem.setName(name);
	menuItem.setText(text);
	menuItem.setTooltip(explanation);
	menuItem.setIcon(icon);
	menuItem.setEnabled(enabled);
	if (oFF.XStringUtils.isNullOrEmpty(icon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.createTriggerItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure)
{
	var menuItem = topLevelItem.addNewItem();
	menuItem.setSectionStart(isSectionStart);
	menuItem.setName(name);
	menuItem.setText(text);
	menuItem.setTooltip(explanation);
	menuItem.setIcon(icon);
	menuItem.setEnabled(enabled);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		procedure();
	}.bind(this)));
	if (oFF.XStringUtils.isNullOrEmpty(icon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.createToggleItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure, active, stateIcon)
{
	var menuItem = topLevelItem.addNewItem();
	menuItem.setSectionStart(isSectionStart);
	menuItem.setName(name);
	menuItem.setText(text);
	menuItem.setTooltip(explanation);
	menuItem.setEnabled(enabled);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		procedure();
	}.bind(this)));
	menuItem.setIcon(stateIcon);
	if (oFF.XStringUtils.isNullOrEmpty(stateIcon))
	{
		menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS);
	}
	return menuItem;
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.createTitleItem = function(container, sectionStart, overflowPriority, name, text, icon, explanation)
{
	var menuItem = container.addNewItem();
	menuItem.setSectionStart(sectionStart);
	menuItem.setName(name);
	menuItem.setText(text);
	menuItem.setTooltip(explanation);
	menuItem.setIcon(oFF.XStringUtils.isNullOrEmpty(icon) ? oFF.CmeUiGenericMenuMapper.DEFAULT_TITLE_MENU_ICON : icon);
	menuItem.addCssClass(oFF.CmeUiGenericMenuMapper.TITLE_MENU_CSS_CLASS);
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.synchronizeGroupMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, hasDefaultAction, defaultAction)
{
	uiItem.setText(text);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
	uiItem.setEnabled(enabled);
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.synchronizeToggleMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command, active, stateIcon)
{
	uiItem.setEnabled(enabled);
	uiItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		command();
	}.bind(this)));
	uiItem.setText(text);
	uiItem.setIcon(stateIcon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.synchronizeTriggerMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command)
{
	uiItem.setEnabled(enabled);
	uiItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		command();
	}.bind(this)));
	uiItem.setText(text);
	uiItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(explanation);
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.supportsSynchronization = function()
{
	return true;
};
oFF.CmeUiGenericFactoryStandardMenuTop.prototype.clearGroup = function(container)
{
	var items = container.getItems();
	container.clearItems();
	oFF.XCollectionUtils.releaseEntriesFromCollection(items);
};

oFF.CmeUiGenericFactoryStandardToolbarItem = function() {};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype = new oFF.XObject();
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype._ff_c = "CmeUiGenericFactoryStandardToolbarItem";

oFF.CmeUiGenericFactoryStandardToolbarItem.create = function()
{
	var instance = new oFF.CmeUiGenericFactoryStandardToolbarItem();
	return instance;
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.hasItemElements = function(topLevelItem)
{
	return oFF.XCollectionUtils.hasElements(topLevelItem.getItems());
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.getItemCount = function(menuItem)
{
	return menuItem.getItemCount();
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.createGroupItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, hasDefaultAction, currentDefaultAction)
{
	if (isSectionStart)
	{
		topLevelItem.addNewItemOfType(oFF.UiType.SEPARATOR);
	}
	var menuItem = topLevelItem.addNewItemOfType(oFF.UiType.BUTTON);
	menuItem.setName(name);
	menuItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	menuItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	menuItem.setIcon(icon);
	menuItem.setEnabled(enabled);
	var menuToPopulate = menuItem.getUiManager().getGenesis().newControl(oFF.UiType.MENU);
	menuItem.registerOnPress(this.createSubMenuRenderListener(menuToPopulate));
	return menuToPopulate;
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.createTriggerItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure)
{
	if (isSectionStart)
	{
		topLevelItem.addNewItemOfType(oFF.UiType.SEPARATOR);
	}
	var menuItem = topLevelItem.addNewItemOfType(oFF.UiType.BUTTON);
	menuItem.setName(name);
	menuItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	menuItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	menuItem.setIcon(icon);
	menuItem.setEnabled(enabled);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		procedure();
	}.bind(this)));
	return menuItem;
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.createToggleItem = function(topLevelItem, isSectionStart, overflowPriority, name, text, icon, enabled, explanation, highlight, unhighlight, procedure, active, stateIcon)
{
	if (isSectionStart)
	{
		topLevelItem.addNewItemOfType(oFF.UiType.SEPARATOR);
	}
	var menuItem = topLevelItem.addNewItemOfType(oFF.UiType.TOGGLE_BUTTON);
	menuItem.setName(name);
	menuItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	menuItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	menuItem.setEnabled(enabled);
	menuItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		procedure();
	}.bind(this)));
	menuItem.setIcon(icon);
	menuItem.setPressed(active === oFF.TriStateBool._TRUE);
	return menuItem;
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.createTitleItem = function(container, sectionStart, overflowPriority, name, text, icon, explanation) {};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.createSubMenuRenderListener = function(menuToPopulate)
{
	return oFF.UiLambdaPressListener.create( function(controlEvent){
		menuToPopulate.openAt(controlEvent.getControl());
	}.bind(this));
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.synchronizeGroupMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, hasDefaultAction, defaultAction)
{
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	uiItem.setEnabled(enabled);
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.synchronizeToggleMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command, active, stateIcon)
{
	uiItem.setEnabled(enabled);
	uiItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		command();
	}.bind(this)));
	uiItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	uiItem.setIcon(stateIcon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
	uiItem.setIcon(icon);
	uiItem.setPressed(active === oFF.TriStateBool._TRUE);
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.synchronizeTriggerMenuItem = function(uiItem, text, icon, enabled, explanation, highlightProcedure, unHighlightProcedure, command)
{
	uiItem.setEnabled(enabled);
	uiItem.registerOnPress(oFF.UiLambdaPressListener.create( function(p){
		command();
	}.bind(this)));
	uiItem.setText(oFF.CmeUiGenericFactoryToolbarMapping.getEffectiveToolbarItemText(icon, text));
	uiItem.setIcon(icon);
	uiItem.setEnabled(enabled);
	uiItem.setTooltip(oFF.CmeUiGenericFactoryToolbarMapping.getToolbarItemTooltipText(text, explanation));
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.supportsSynchronization = function()
{
	return true;
};
oFF.CmeUiGenericFactoryStandardToolbarItem.prototype.clearGroup = function(container)
{
	var items = container.getItems();
	container.clearItems();
	oFF.XCollectionUtils.releaseEntriesFromCollection(items);
};

oFF.CmeUiGenericFactoryToolbarMapping = {

	getToolbarItemTooltipText:function(text, explanation)
	{
			if (oFF.XStringUtils.isNullOrEmpty(explanation))
		{
			return text;
		}
		else
		{
			return oFF.XStringUtils.concatenate3(text, ": ", explanation);
		}
	},
	getEffectiveToolbarItemText:function(icon, text)
	{
			return oFF.XStringUtils.isNullOrEmpty(icon) ? text : null;
	}
};

oFF.CmeUiGenericLocalizationMapper = function() {};
oFF.CmeUiGenericLocalizationMapper.prototype = new oFF.XObject();
oFF.CmeUiGenericLocalizationMapper.prototype._ff_c = "CmeUiGenericLocalizationMapper";

oFF.CmeUiGenericLocalizationMapper.create = function()
{
	return new oFF.CmeUiGenericLocalizationMapper();
};
oFF.CmeUiGenericLocalizationMapper.prototype.getMappedValue = function(key, replacements, localizator)
{
	if (!oFF.XCollectionUtils.hasElements(replacements))
	{
		return localizator.getText(key);
	}
	else if (replacements.size() === 1)
	{
		return localizator.getTextWithPlaceholder(key, replacements.get(0));
	}
	else
	{
		return localizator.getTextWithPlaceholder2(key, replacements.get(0), replacements.get(1));
	}
};

oFF.CMEContextMenuUpdateWrapper = function() {};
oFF.CMEContextMenuUpdateWrapper.prototype = new oFF.XObject();
oFF.CMEContextMenuUpdateWrapper.prototype._ff_c = "CMEContextMenuUpdateWrapper";

oFF.CMEContextMenuUpdateWrapper.createWithReferenceControl = function(contextAccess, control)
{
	var instance = new oFF.CMEContextMenuUpdateWrapper();
	instance.m_contextAccess = contextAccess;
	instance.m_referenceControl = control;
	instance.m_genesis = control.getUiManager().getGenesis();
	return instance;
};
oFF.CMEContextMenuUpdateWrapper.createWithCoordinates = function(contextAccess, genesis, xCoordinate, yCoordinate)
{
	var instance = new oFF.CMEContextMenuUpdateWrapper();
	instance.m_contextAccess = contextAccess;
	instance.m_genesis = genesis;
	instance.m_xCoordinate = xCoordinate;
	instance.m_yCoordinate = yCoordinate;
	return instance;
};
oFF.CMEContextMenuUpdateWrapper.prototype.m_contextAccess = null;
oFF.CMEContextMenuUpdateWrapper.prototype.m_xCoordinate = 0;
oFF.CMEContextMenuUpdateWrapper.prototype.m_yCoordinate = 0;
oFF.CMEContextMenuUpdateWrapper.prototype.m_referenceControl = null;
oFF.CMEContextMenuUpdateWrapper.prototype.m_genesis = null;
oFF.CMEContextMenuUpdateWrapper.prototype.releaseObject = function()
{
	this.m_referenceControl = null;
	this.m_genesis = null;
	this.m_xCoordinate = 0;
	this.m_yCoordinate = 0;
	this.m_contextAccess = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEContextMenuUpdateWrapper.prototype.getContextAccess = function()
{
	return this.m_contextAccess;
};
oFF.CMEContextMenuUpdateWrapper.prototype.getXCoordinate = function()
{
	return this.m_xCoordinate;
};
oFF.CMEContextMenuUpdateWrapper.prototype.getYCoordinate = function()
{
	return this.m_yCoordinate;
};
oFF.CMEContextMenuUpdateWrapper.prototype.getReferenceControl = function()
{
	return this.m_referenceControl;
};
oFF.CMEContextMenuUpdateWrapper.prototype.getGenesis = function()
{
	return this.m_genesis;
};

oFF.CMEToolbarUpdateWrapper = function() {};
oFF.CMEToolbarUpdateWrapper.prototype = new oFF.XObject();
oFF.CMEToolbarUpdateWrapper.prototype._ff_c = "CMEToolbarUpdateWrapper";

oFF.CMEToolbarUpdateWrapper.create = function(contextAccess, toolbarWidget)
{
	var instance = new oFF.CMEToolbarUpdateWrapper();
	instance.m_contextAccess = contextAccess;
	instance.m_toolbarWidget = toolbarWidget;
	return instance;
};
oFF.CMEToolbarUpdateWrapper.prototype.m_toolbarWidget = null;
oFF.CMEToolbarUpdateWrapper.prototype.m_contextAccess = null;
oFF.CMEToolbarUpdateWrapper.prototype.releaseObject = function()
{
	this.m_toolbarWidget = null;
	this.m_contextAccess = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CMEToolbarUpdateWrapper.prototype.getContextAccess = function()
{
	return this.m_contextAccess;
};
oFF.CMEToolbarUpdateWrapper.prototype.getToolbarWidget = function()
{
	return this.m_toolbarWidget;
};

oFF.CmeUiGenericMenuMapper = function() {};
oFF.CmeUiGenericMenuMapper.prototype = new oFF.XObject();
oFF.CmeUiGenericMenuMapper.prototype._ff_c = "CmeUiGenericMenuMapper";

oFF.CmeUiGenericMenuMapper.NON_ICON_CSS_CLASS = "gdsNullIcon";
oFF.CmeUiGenericMenuMapper.TITLE_MENU_CSS_CLASS = "gdsTitleMenuItem";
oFF.CmeUiGenericMenuMapper.DEFAULT_TITLE_MENU_ICON = "slim-arrow-down";
oFF.CmeUiGenericMenuMapper.CONTEXT_MENU = "contextMenu";
oFF.CmeUiGenericMenuMapper.CONTEXT_MENU_CLASS = "contextMenu";
oFF.CmeUiGenericMenuMapper.create = function(menuTreeGenerator)
{
	var mapper = new oFF.CmeUiGenericMenuMapper();
	mapper.m_menuTreeGenerator = menuTreeGenerator;
	mapper.setup();
	return mapper;
};
oFF.CmeUiGenericMenuMapper.prototype.m_pristine = false;
oFF.CmeUiGenericMenuMapper.prototype.m_menuTreeGenerator = null;
oFF.CmeUiGenericMenuMapper.prototype.m_menuItemMapper = null;
oFF.CmeUiGenericMenuMapper.prototype.m_menuMapper = null;
oFF.CmeUiGenericMenuMapper.prototype.m_gdsToolbarMenuItemMapper = null;
oFF.CmeUiGenericMenuMapper.prototype.m_gdsToolbarMenuSubMapper = null;
oFF.CmeUiGenericMenuMapper.prototype.m_gdsToolbarCustomMapper = null;
oFF.CmeUiGenericMenuMapper.prototype.m_gdsToolbarFixedMapper = null;
oFF.CmeUiGenericMenuMapper.prototype.m_gdsToolbarPopulator = null;
oFF.CmeUiGenericMenuMapper.prototype.m_gdsToolbarFixedPopulator = null;
oFF.CmeUiGenericMenuMapper.prototype.m_gdsMenuPopulator = null;
oFF.CmeUiGenericMenuMapper.prototype.m_configuration = null;
oFF.CmeUiGenericMenuMapper.prototype.m_uiCache = null;
oFF.CmeUiGenericMenuMapper.prototype.setConfiguration = function(configuration)
{
	this.m_configuration = configuration;
	this.m_pristine = false;
};
oFF.CmeUiGenericMenuMapper.prototype.markDirty = function()
{
	this.m_pristine = false;
};
oFF.CmeUiGenericMenuMapper.prototype.releaseObject = function()
{
	this.m_pristine = false;
	this.m_uiCache = oFF.XObjectExt.release(this.m_uiCache);
	this.m_menuTreeGenerator = oFF.XObjectExt.release(this.m_menuTreeGenerator);
	this.m_menuItemMapper = oFF.XObjectExt.release(this.m_menuItemMapper);
	this.m_menuMapper = oFF.XObjectExt.release(this.m_menuMapper);
	this.m_gdsMenuPopulator = oFF.XObjectExt.release(this.m_gdsMenuPopulator);
	this.m_gdsToolbarMenuItemMapper = oFF.XObjectExt.release(this.m_gdsToolbarMenuItemMapper);
	this.m_gdsToolbarMenuSubMapper = oFF.XObjectExt.release(this.m_gdsToolbarMenuSubMapper);
	this.m_gdsToolbarCustomMapper = oFF.XObjectExt.release(this.m_gdsToolbarCustomMapper);
	this.m_gdsToolbarFixedMapper = oFF.XObjectExt.release(this.m_gdsToolbarFixedMapper);
	this.m_gdsToolbarPopulator = oFF.XObjectExt.release(this.m_gdsToolbarPopulator);
	this.m_gdsToolbarFixedPopulator = oFF.XObjectExt.release(this.m_gdsToolbarFixedPopulator);
	this.m_configuration = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.CmeUiGenericMenuMapper.prototype.setup = function()
{
	this.m_uiCache = oFF.CMEFactory.createUiCache();
	var localizationTextMapper = oFF.CmeUiGenericLocalizationMapper.create();
	var standardMenuSubFactory = oFF.CmeUiGenericFactoryStandardMenuSub.create();
	this.m_menuItemMapper = oFF.CMEFactory.createMenuTreePopulator(standardMenuSubFactory, this.m_uiCache);
	var standardMenuTopFactory = oFF.CmeUiGenericFactoryStandardMenuTop.create();
	this.m_menuMapper = oFF.CMEFactory.createMenuTreePopulatorWithSubMapper(standardMenuTopFactory, this.m_menuItemMapper, this.m_uiCache);
	var toolbarMenuFactory = oFF.CmeUiGenericFactoryCustomToolbarMenuSubSub.create();
	this.m_gdsToolbarMenuItemMapper = oFF.CMEFactory.createMenuTreePopulatorWithSubMapper(toolbarMenuFactory, this.m_menuItemMapper, this.m_uiCache);
	var customToolbarMenuSubFactory = oFF.CmeUiGenericFactoryCustomToolbarMenuSub.create();
	this.m_gdsToolbarMenuSubMapper = oFF.CMEFactory.createMenuTreePopulatorWithSubMapper(customToolbarMenuSubFactory, this.m_gdsToolbarMenuItemMapper, this.m_uiCache);
	var toolbarItemFactory = oFF.CmeUiGenericFactoryCustomToolbarFiller.create();
	this.m_gdsToolbarCustomMapper = oFF.CMEFactory.createMenuTreePopulatorWithSubMapper(toolbarItemFactory, this.m_gdsToolbarMenuSubMapper, this.m_uiCache);
	var toolbarFixedFactory = oFF.CmeUiGenericFactoryCustomToolbarFixed.create();
	this.m_gdsToolbarFixedMapper = oFF.CMEFactory.createMenuTreePopulatorWithSubMapper(toolbarFixedFactory, this.m_menuMapper, this.m_uiCache);
	this.m_gdsToolbarPopulator = this.m_menuTreeGenerator.createMenuFiller(this.m_gdsToolbarCustomMapper, localizationTextMapper);
	this.m_gdsToolbarFixedPopulator = this.m_menuTreeGenerator.createMenuFiller(this.m_gdsToolbarFixedMapper, localizationTextMapper);
	this.m_gdsMenuPopulator = this.m_menuTreeGenerator.createMenuFiller(this.m_menuMapper, localizationTextMapper);
};
oFF.CmeUiGenericMenuMapper.prototype.registerActions = function(actionsRegistrator, localizationProvider)
{
	actionsRegistrator.registerActions(oFF.CMEFactory.getRegistry(), localizationProvider);
	this.m_pristine = false;
};
oFF.CmeUiGenericMenuMapper.prototype.loadPluginMenuConfiguration = function(name, pluginConfig)
{
	var success = false;
	var menuGenerator = this.getMenuTreeGenerator();
	if (oFF.notNull(menuGenerator))
	{
		menuGenerator.loadPluginConfiguration(name, pluginConfig);
		success = true;
	}
	return success;
};
oFF.CmeUiGenericMenuMapper.prototype.getMenuTreeGenerator = function()
{
	return this.m_menuTreeGenerator;
};
oFF.CmeUiGenericMenuMapper.prototype.checkMenu = function(context, uiContext, treeConsumer)
{
	this.ensureMenu();
	this.m_menuTreeGenerator.generate(context, uiContext, treeConsumer);
};
oFF.CmeUiGenericMenuMapper.prototype.ensureMenu = function()
{
	if (!this.m_pristine && oFF.notNull(this.m_configuration))
	{
		this.m_menuTreeGenerator.loadConfiguration(this.m_configuration);
	}
	this.m_pristine = true;
};
oFF.CmeUiGenericMenuMapper.prototype.createContextMenu = function(genesis, context, uiContext, success)
{
	if (oFF.notNull(this.m_gdsMenuPopulator))
	{
		this.ensureMenu();
		var menuName = this.m_menuTreeGenerator.getTopMenuName(context, uiContext);
		if (oFF.XStringUtils.isNotNullAndNotEmpty(menuName))
		{
			var menuItem = this.m_uiCache.getOrCreateCachedMenu(menuName,  function(){
				var contextMenu = genesis.newControl(oFF.UiType.MENU);
				contextMenu.setName(oFF.CmeUiGenericMenuMapper.CONTEXT_MENU);
				contextMenu.addCssClass(oFF.CmeUiGenericMenuMapper.CONTEXT_MENU_CLASS);
				return contextMenu;
			}.bind(this));
			this.m_gdsMenuPopulator.populateMenu(menuItem, context, uiContext, oFF.UiLocalizationCenter.getCenter(), null, success);
		}
	}
};
oFF.CmeUiGenericMenuMapper.prototype.populateToolbar = function(menu, context, uiContext)
{
	var clearer = null;
	if (oFF.notNull(this.m_gdsToolbarPopulator))
	{
		this.ensureMenu();
		this.m_gdsToolbarPopulator.populateMenu(menu, context, uiContext, oFF.UiLocalizationCenter.getCenter(), clearer, null);
	}
};
oFF.CmeUiGenericMenuMapper.prototype.populateToolbarFixedSection = function(menu, context, uiContext)
{
	var clearer = null;
	if (oFF.notNull(this.m_gdsToolbarFixedPopulator))
	{
		this.ensureMenu();
		this.m_gdsToolbarFixedPopulator.populateMenu(menu, context, uiContext, oFF.UiLocalizationCenter.getCenter(), clearer, null);
	}
};
oFF.CmeUiGenericMenuMapper.prototype.getUiCache = function()
{
	return this.m_uiCache;
};

oFF.ContextMenuEngineUiModule = function() {};
oFF.ContextMenuEngineUiModule.prototype = new oFF.DfModule();
oFF.ContextMenuEngineUiModule.prototype._ff_c = "ContextMenuEngineUiModule";

oFF.ContextMenuEngineUiModule.s_module = null;
oFF.ContextMenuEngineUiModule.getInstance = function()
{
	if (oFF.isNull(oFF.ContextMenuEngineUiModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.ContextMenuEngineModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.UiToolsModule.getInstance());
		oFF.ContextMenuEngineUiModule.s_module = oFF.DfModule.startExt(new oFF.ContextMenuEngineUiModule());
		oFF.DfModule.stopExt(oFF.ContextMenuEngineUiModule.s_module);
	}
	return oFF.ContextMenuEngineUiModule.s_module;
};
oFF.ContextMenuEngineUiModule.prototype.getName = function()
{
	return "ff3450.contextmenu.engine.ui";
};

oFF.ContextMenuEngineUiModule.getInstance();

return sap.firefly;
	} );
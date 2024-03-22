/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/gantt/utils/GanttFlexibilityUtils"],function(n){"use strict";return{hideControl:"default",unhideControl:"default",moveControls:"default",GanttContainerZoomLevel:{changeHandler:{applyChange:function(n,e,t){var a=t.modifier,r=n.getContent(),i=r["propertyName"],o=r["newValue"],l=r["oldValue"];n.setRevertData(l);if(e.initialSettings){e.initialSettings.zoomLevel=o}a.setPropertyBindingOrProperty(e,i,o);return true},revertChange:function(n,e,t){var a=t.modifier;var r=n.getRevertData();var i=n.getContent(),o=i["propertyName"];if(e.initialSettings){e.initialSettings.zoomLevel=r}a.setPropertyBindingOrProperty(e,o,r);n.resetRevertData();return true},completeChangeContent:function(n,e,t){return},getCondenserInfo:function(n){return{affectedControl:n.getSelector(),classification:sap.ui.fl.condenser.Classification.LastOneWins,uniqueKey:"GanttContainerZoomLevel"}}},layers:{USER:true}},GanttContainerEnableTimeScrollSync:n.fnChangeHandler("GanttContainerEnableTimeScrollSync"),GanttContainerEnableCursorLine:n.fnChangeHandler("GanttContainerEnableCursorLine"),GanttContainerEnableNowLine:n.fnChangeHandler("GanttContainerEnableNowLine"),GanttContainerEnableVerticalLine:n.fnChangeHandler("GanttContainerEnableVerticalLine"),GanttContainerEnableAdhocLine:n.fnChangeHandler("GanttContainerEnableAdhocLine"),GanttContainerEnableDeltaLine:n.fnChangeHandler("GanttContainerEnableDeltaLine"),GanttContainerEnableNonWorkingTime:n.fnChangeHandler("GanttContainerEnableNonWorkingTime"),GanttContainerDisplayType:n.fnChangeHandler("GanttContainerDisplayType"),GanttContainerEnableStatusBar:n.fnChangeHandler("GanttContainerEnableStatusBar"),GanttContainerCustom:{changeHandler:{applyChange:function(n,e,t){e.getVariantHandler().apply(n,e,t);e.getToolbar().updateCustomSettingsConfig();return true},revertChange:function(n,e,t){e.getVariantHandler().revert(n,e,t);e.getToolbar().updateCustomSettingsConfig();return true},completeChangeContent:function(n,e,t){var a=e.content.dependentControls;if(a.length>0){a.forEach(function(e){n.addDependentControl(e,e.toUpperCase(),t)})}return},getCondenserInfo:function(n){return{affectedControl:n.getSelector(),classification:sap.ui.fl.condenser.Classification.LastOneWins,uniqueKey:"GanttContainerCustom"}}},layers:{USER:true}},ganttChartContainerSettings:n.fnCustomisationChangeHandler("ganttChartContainerSettings")}},true);
//# sourceMappingURL=GanttChartContainer.flexibility.js.map
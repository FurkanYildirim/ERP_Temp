/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["../../TableDelegate","../../table/V4AnalyticsPropertyHelper","../../util/loadModules","sap/m/ColumnPopoverSelectListItem","sap/m/MessageBox","sap/ui/core/Item","sap/ui/core/Core","sap/ui/core/library","sap/ui/core/format/ListFormat","sap/ui/base/ManagedObjectObserver","sap/ui/mdc/odata/v4/TypeMap","sap/ui/mdc/enums/TableP13nMode","sap/ui/mdc/enums/TableType"],function(e,t,r,n,i,a,o,u,l,s,g,p,f){"use strict";var c=new window.WeakMap;var T=Object.assign({},e);T.getTypeMap=function(e){return g};T.getPropertyHelperClass=function(){return t};T.preInit=function(){return Promise.resolve()};T.initializeContent=function(t){return e.initializeContent.apply(this,arguments).then(function(){if(!c.has(t)){c.set(t,{})}return C(t)}).then(function(){_(t)})};T.initializeSelection=function(t){if(t._bV4LegacySelectionEnabled){return e.initializeSelection.apply(this,arguments)}if(t._isOfType(f.Table,true)){return d(t)}else{return e.initializeSelection.apply(this,arguments)}};function d(t){var n={Single:"Single",SingleMaster:"Single",Multi:"MultiToggle"};return r("sap/ui/table/plugins/ODataV4Selection").then(function(r){var i=r[0];if(t._bV4LegacySelectionEnabled){return e.initializeSelection.call(this,t)}t._oTable.addPlugin(new i({limit:"{$sap.ui.mdc.Table#type>/selectionLimit}",enableNotification:true,hideHeaderSelector:"{= !${$sap.ui.mdc.Table#type>/showHeaderSelector} }",selectionMode:{path:"$sap.ui.mdc.Table>/selectionMode",formatter:function(e){return n[e]}},enabled:{path:"$sap.ui.mdc.Table>/selectionMode",formatter:function(e){return e in n}},selectionChange:function(e){t._onSelectionChange({selectAll:e.getParameter("selectAll")})}}))})}T.getSelectedContexts=function(t){if(!t._oTable){return[]}if(t._bV4LegacySelectionEnabled){return e.getSelectedContexts.apply(this,arguments)}if(t._isOfType(f.Table,true)){var r=t._oTable.getPlugins().find(function(e){return e.isA("sap.ui.table.plugins.ODataV4Selection")});return r?r.getSelectedContexts():[]}return e.getSelectedContexts.apply(this,arguments)};T.validateState=function(t,r,n){var i=e.validateState.apply(this,arguments);var a;var o=sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");if(n=="Sort"&&r.sorters){if(G(t)&&!E(t,r.items,r.sorters)){a={validation:u.MessageType.Information,message:o.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")}}}else if(n=="Group"){if(r.aggregations){var s=Object.keys(r.aggregations);var g=[];var p=l.getInstance();s.forEach(function(e){var r=t.getPropertyHelper().getProperty(e);if(r&&r.groupable){g.push(e)}});if(g.length){a={validation:u.MessageType.Information,message:o.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_TOTALS",[p.format(g)])}}}else if(t._isOfType(f.ResponsiveTable)){if(!E(t,r.items,r.groupLevels)){a={validation:u.MessageType.Information,message:o.getText("table.PERSONALIZATION_DIALOG_GROUP_RESTRICTION_VISIBLE")}}}}else if(n=="Column"){var c;var s=r.aggregations&&Object.keys(r.aggregations);if(!E(t,r.items,s)){c=o.getText("table.PERSONALIZATION_DIALOG_TOTAL_RESTRICTION")}if(G(t)&&!E(t,r.items,r.sorters)){c=c?c+"\n"+o.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION"):o.getText("table.PERSONALIZATION_DIALOG_SORT_RESTRICTION")}if(c){a={validation:u.MessageType.Information,message:c}}}return N(i,a)};T.updateBinding=function(e,t,r){if(!r||r.getPath()!=t.path){this.rebind(e,t);return}var n=r.getRootBinding();var i=n&&!n.isSuspended();try{if(i){n.suspend()}_(e,t);r.changeParameters(t.parameters);r.filter(t.filters,"Application");r.sort(t.sorter)}catch(a){this.rebind(e,t);if(n==r){i=false}}finally{if(i&&n.isSuspended()){n.resume()}}if(e._bV4LegacySelectionEnabled&&e._isOfType(f.Table)){var a=e._oTable&&e._oTable.getPlugins()[0]?e._oTable.getPlugins()[0].oInnerSelectionPlugin:null;if(a){a._bInternalTrigger=true}e.clearSelection();if(a){delete a._bInternalTrigger}}};T.rebind=function(t,r){_(t,r);e.rebind.apply(this,arguments)};T.addColumnMenuItems=function(e,t){var r=e.getPropertyHelper();var n=r.getProperty(t.getPropertyKey());var i=[];if(!n){return[]}if(e.isGroupingEnabled()){var a=n.getGroupableProperties();if(a.length>0){i.push(b(a,t))}}if(e.isAggregationEnabled()){var u=n.getAggregatableProperties().filter(function(e){return e.extension.customAggregate!=null});if(u.length>0){i.push(m(u,t))}}var l=e._oPopover;if(l){l.getItems().forEach(function(e,t,r){var n=e.getLabel();var i=o.getLibraryResourceBundle("sap.ui.mdc");if(n===i.getText("table.SETTINGS_GROUP")||n===i.getText("table.SETTINGS_TOTALS")){r[t].destroy()}if(r.length==0){l.destroy()}})}return i};T.getSupportedP13nModes=function(t){var r=e.getSupportedP13nModes.apply(this,arguments);if(t._isOfType(f.Table)){if(!r.includes(p.Group)){r.push(p.Group)}if(!r.includes(p.Aggregate)){r.push(p.Aggregate)}}return r};T.getGroupSorter=function(t,r){var n=t.getPropertyHelper();var i=t._getVisibleProperties().find(function(e){var t=n.getProperty(e.name);return t.getSimpleProperties().find(function(e){return e.name===r})});if(!i){return undefined}return e.getGroupSorter.apply(this,arguments)};T.getSupportedFeatures=function(t){var r=e.getSupportedFeatures.apply(this,arguments);var n=t._isOfType(f.TreeTable);return Object.assign(r,{expandAll:n,collapseAll:n})};T.expandAll=function(e){if(!this.getSupportedFeatures(e).expandAll){return}var t=e.getRowBinding();if(t){t.setAggregation(Object.assign(t.getAggregation(),{expandTo:999}))}};T.collapseAll=function(e){if(!this.getSupportedFeatures(e).collapseAll){return}var t=e.getRowBinding();if(t){t.setAggregation(Object.assign(t.getAggregation(),{expandTo:1}))}};function b(e,t){var r=e.map(function(e){return new a({text:e.label,key:e.name})});if(r.length>0){return new n({items:r,label:o.getLibraryResourceBundle("sap.ui.mdc").getText("table.SETTINGS_GROUP"),icon:"sap-icon://group-2",action:[{sName:"Group",oMDCColumn:t},S,this]})}}function m(e,t){var r=e.map(function(e){return new a({text:e.label,key:e.name})});if(r.length>0){return new n({items:r,label:o.getLibraryResourceBundle("sap.ui.mdc").getText("table.SETTINGS_TOTALS"),icon:"sap-icon://sum",action:[{sName:"Aggregate",oMDCColumn:t},S,this]})}}function S(e,t){var r=t.sName,n=t.oMDCColumn.getParent(),a=n.getCurrentState().groupLevels||[],u=n.getCurrentState().aggregations||{},l=Object.keys(u),s=false,g=e.getParameter("property"),p=r==="Aggregate"?a:l,f=p.filter(function(e){return r==="Aggregate"?e.name===g:e===g}).length>0;if(f){var c=o.getLibraryResourceBundle("sap.ui.mdc");var T;var d;var b;if(r==="Aggregate"){T=c.getText("table.SETTINGS_WARNING_TITLE_TOTALS");d=c.getText("table.SETTINGS_MESSAGE2");b=c.getText("table.SETTINGS_WARNING_BUTTON_TOTALS")}else{T=c.getText("table.SETTINGS_WARNING_TITLE_GROUPS");d=c.getText("table.SETTINGS_MESSAGE1");b=c.getText("table.SETTINGS_WARNING_BUTTON_GROUP")}s=true;i.warning(d,{id:n.getId()+"-messageBox",title:T,actions:[b,c.getText("table.SETTINGS_WARNING_BUTTON_CANCEL")],onClose:function(e){if(e===b){y(r,n,g)}}})}if(r==="Aggregate"&&!s){v(r,n,g)}else if(r==="Group"&&!s){v(r,n,g)}}function v(e,t,r){if(e==="Group"){t._onCustomGroup(r)}else{t._onCustomAggregate(r)}}function y(e,t,r){if(e==="Aggregate"){t._onCustomGroup(r);t._onCustomAggregate(r)}else if(e==="Group"){t._onCustomAggregate(r);t._onCustomGroup(r)}}function _(e,t){var r=c.get(e).plugin;if(!r||r.isDestroyed()){return}var n=e._getGroupedProperties().map(function(e){return e.name});var i=Object.keys(e._getAggregatedProperties());var a=t?t.parameters["$search"]:undefined;if(a){delete t.parameters["$search"]}var o={visible:I(e),groupLevels:n,grandTotal:i,subtotals:i,columnState:P(e,i),search:a};r.setAggregationInfo(o)}function I(e){var t=new Set;e.getColumns().forEach(function(r){var n=e.getPropertyHelper().getProperty(r.getPropertyKey());if(!n){return}n.getSimpleProperties().forEach(function(e){t.add(e.name)})});return Array.from(t)}function P(e,t){var r={};e.getColumns().forEach(function(n){var i=n.getId()+"-innerColumn";var a=O(e,n,t);var o=a.length>0;if(i in r){r[i].subtotals=o||r[i].subtotals;r[i].grandTotal=o||r[i].grandTotal;return}r[i]={subtotals:o,grandTotal:o};h(e,a).forEach(function(e){i=e.getId()+"-innerColumn";if(i in r){r[i].subtotals=o||r[i].subtotals;r[i].grandTotal=o||r[i].grandTotal}else{r[i]={subtotals:o,grandTotal:o}}})});return r}function A(e,t){var r=e.getPropertyHelper().getProperty(t.getPropertyKey());if(!r){return[]}else{return r.getSimpleProperties()}}function O(e,t,r){return A(e,t).filter(function(e){return r.includes(e.name)})}function h(e,t){var r=[];t.forEach(function(e){if(e.unitProperty){r.push(e.unitProperty)}});return e.getColumns().filter(function(t){return A(e,t).some(function(e){return r.includes(e)})})}function E(e,t,r){var n=[];if(t){t.forEach(function(t){e.getPropertyHelper().getProperty(t.name).getSimpleProperties().forEach(function(e){n.push(e.name)})})}var i=r?r.every(function(e){return n.find(function(t){return e.name?e.name===t:e===t})}):true;return i}function N(e,t){var r={Error:1,Warning:2,Information:3,None:4};if(!t||r[t.validation]-r[e.validation]>0){return e}else{return t}}function G(e){return(e.isGroupingEnabled()||e.isAggregationEnabled())&&e._isOfType(f.Table)}function C(e){if(e._isOfType(f.Table)){return(G(e)?R(e):L(e)).then(function(){return x(e)})}return Promise.resolve()}function R(e){var t=c.get(e);var n=t.plugin;if(n&&!n.isDestroyed()){n.activate();return Promise.resolve()}return Promise.all([e.awaitPropertyHelper(),r("sap/ui/table/plugins/V4Aggregation")]).then(function(r){var i=r[1][0];var a=e.getControlDelegate();n=new i({groupHeaderFormatter:function(t,r){return a.formatGroupHeader(e,t,r)}});n.setPropertyInfos(e.getPropertyHelper().getPropertiesForPlugin());e.propertiesFinalized().then(function(){n.setPropertyInfos(e.getPropertyHelper().getPropertiesForPlugin())});e._oTable.addDependent(n);t.plugin=n})}function L(e){var t=c.get(e);if(t.plugin){t.plugin.deactivate()}return Promise.resolve()}function x(e){var t=c.get(e);if(!t.observer){t.observer=new s(function(t){C(e)});t.observer.observe(e,{properties:["p13nMode"]})}}return T});
//# sourceMappingURL=TableDelegate.js.map
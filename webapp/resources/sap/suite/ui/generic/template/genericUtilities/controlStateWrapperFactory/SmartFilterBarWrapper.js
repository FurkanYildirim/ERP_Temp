sap.ui.define([],function(){"use strict";var t="sap.suite.ui.generic.template.customData",e="sap.suite.ui.generic.template.extensionData",a="sap.suite.ui.generic.template.genericData";function r(r,i,n){var s=false;var o=[];var l,u,c;var m=new Promise(function(t){u=t});function f(){if(typeof r!=="string"){F(r)}m.then(function(){l.getInitializedPromise().then(function(){o=l.getAllFilterItems(true)})})}function g(r){l.attachBeforeVariantFetch(function(){var t=Object.create(null);t[a]=r.getManagedControlStates();t[a].customFilters=n.oCustomFiltersWrapper.getState();l.setCustomFilterData(t)});l.attachAfterVariantLoad(function(i){var s=l.getCustomFilterData();var o=s[a].customFilters||{editState:s[a].editStateFilter,appExtension:s[t],adaptationExtensions:s[e]};n.oCustomFiltersWrapper.setState(o);r.setManagedControlStates(s[a]);r.setHeaderState(!i.getParameter("executeOnSelect"))})}function p(){if(!l){return c}var t=l.getUiState();var e=t.getSelectionVariant().SelectOptions;e=e&&e.filter(function(t){return t.PropertyName!==a});return{selectOptions:e,parameters:t.getSelectionVariant().Parameters,semanticDates:t.getSemanticDates(),addedFilterItems:l.getAllFilterItems(true).filter(function(t){return t.getGroupName()!==sap.ui.comp.filterbar.FilterBar.INTERNAL_GROUP&&t.getVisibleInFilterBar()}).map(function(t){return t.getName()}),removedFilterItems:o.filter(function(t){return!t.getVisibleInFilterBar()}).map(function(t){return t.getName()}),customFilters:n.oCustomFiltersWrapper.getState()}}function S(t){if(JSON.stringify(t)===JSON.stringify(p())){return}s=true;c=t;m.then(function(){var t=l.getUiState(),e=l.getSmartVariant(),a=e.currentVariantGetModified();t.getSelectionVariant().SelectOptions=c&&c.selectOptions;t.getSelectionVariant().Parameters=c&&c.parameters;t.setSemanticDates(c&&c.semanticDates);l.setUiState(t,{replace:true,strictMode:true});n.oCustomFiltersWrapper.setState(c&&c.customFilters);l.getAllFilterItems().forEach(function(t){if(c&&c.addedFilterItems&&c.addedFilterItems.includes(t.getName())){t.setVisibleInFilterBar()}if(c&&c.removedFilterItems&&c.removedFilterItems.includes(t.getName())){t.setVisibleInFilterBar(false)}});e.currentVariantSetModified(a)});l.refreshFiltersCount();s=false}function d(t){function e(){if(!s){t()}}m.then(function(){l.attachFilterChange(function(){if(!l.isDialogOpen()){e()}});l.attachFiltersDialogClosed(e);n.oCustomFiltersWrapper.attachStateChanged(e)});l.attachFiltersDialogClosed(e);n.oCustomFiltersWrapper.attachStateChanged(function(){e();if(!s){l.getSmartVariant()&&l.getSmartVariant().currentVariantSetModified(true)}})}function F(t){l=t;u(l)}f();return{getState:p,setState:S,setControl:F,attachStateChanged:d,setSVMWrapperCallbacks:g,bVMConnection:l.getSmartVariant(),suppressSelection:l.setSuppressSelection.bind(l)}}return r});
//# sourceMappingURL=SmartFilterBarWrapper.js.map
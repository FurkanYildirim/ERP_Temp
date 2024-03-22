sap.ui.define(["sap/ui/base/Object","sap/base/util/extend"],function(t,e){"use strict";function n(t,e,n,r){var a;r.getChartAsync().then(function(t){a=t});function o(){return r.getAvailableChartTypes()}function i(){return a.getBinding("data")}function u(){return a}function s(){return r.getChartBindingPath()}function c(){return r.getItems()}function g(){var t=[];r.getChartAsync().then(function(n){var r=n;if(r&&r.getMetadata().getName()==="sap.chart.Chart"){var a=false;var o=r.getSelectionBehavior();var i=e.getSelectionPoints(r,o);if(i&&i.count>0){if(o==="DATAPOINT"){a=true}var u=i.dataPoints;var s=[];for(var c=0;c<u.length;c++){if(a){if(u[c].context){t.push(u[c].context)}}else{s.push(u[c].dimensions)}}if(!a){t[0]=s}}}});return t}function l(){return r.getModel()}function d(){return e.setEnabledToolbarButtons(r)}function f(){return e.setEnabledFooterButtons(r)}function p(t){r.attachAfterVariantInitialise(function(){r.setCurrentVariantId(t)});r.setCurrentVariantId(t)}function h(){r.rebindChart()}function v(t){var e=r.getModel().getMetaModel();var n=e.getODataEntitySet(r&&r.getEntitySet());var a=e.getODataEntityType(n.entityType);var o=a.property;return o.some(function(e){return e.name===t.Property})}function C(t){var e=r.getUiState();var n=e.getPresentationVariant();var a=t.filter(function(t){return v(t)});var o=n&&n.SortOrder?a.concat(n.SortOrder):a;n.SortOrder=o;e.setPresentationVariant(n);r.setUiState(e)}function y(){return r.getToolbar()}return{getBinding:i,getBindingPath:s,getInnerChart:u,getAvailableChartTypes:o,getItems:c,getSelectedContexts:g,getCurrentContexts:Function.prototype,getVisibleProperties:Function.prototype,getBindingInfo:Function.prototype,getModel:l,setEnabledToolbarButtons:d,setEnabledFooterButtons:f,setCurrentVariantId:p,setCurrentTableVariantId:Function.prototype,setCurrentChartVariantId:p,refresh:Function.prototype,rebind:h,applyNavigationSortOrder:C,getToolbar:y,scrollToSelectedItemAsPerChildContext:Function.prototype}}return t.extend("sap.suite.ui.generic.template.lib.presentationControl.SmartChartHandler",{constructor:function(t,r,a,o){e(this,n(t,r,a,o))}})});
//# sourceMappingURL=SmartChartHandler.js.map
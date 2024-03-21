/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/p13n/Engine","sap/ui/mdc/flexibility/Util"],function(e,n){"use strict";var t={};var a=function(e,n){var t=function(n){if(e._pQueue===n){delete e._pQueue}};e._pQueue=e._pQueue instanceof Promise?e._pQueue.then(n):n();e._pQueue.then(t.bind(null,e._pQueue));return e._pQueue};t.createSetChangeHandler=function(t){if(!t||!t.hasOwnProperty("aggregation")||!t.hasOwnProperty("property")){throw new Error("Please provide a map containing the affected aggregation and property name!")}var r=t.aggregation;var g=t.property;var o=function(n,t,o){return a(t,function(){return e.getInstance().readXConfig(t,{propertyBag:o}).then(function(a){var u=null;if(a&&a.aggregations&&a.aggregations[r]&&a.aggregations[r][n.getContent().name]&&a.aggregations[r][n.getContent().name][g]){u=a.aggregations[r][n.getContent().name][g]}n.setRevertData({name:n.getContent().name,value:u});return e.getInstance().enhanceXConfig(t,{controlMeta:{aggregation:r,property:g},name:n.getContent().name,value:n.getContent().value,propertyBag:o})})})};var u=function(n,t,a){return e.getInstance().enhanceXConfig(t,{controlMeta:{aggregation:r,property:g},name:n.getRevertData().name,value:n.getRevertData().value,propertyBag:a}).then(function(){n.resetRevertData()})};return n.createChangeHandler({apply:o,revert:u})};return t});
//# sourceMappingURL=xConfigFlex.js.map
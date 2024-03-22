/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/mdc/util/IdentifierUtil","sap/ui/mdc/enums/ConditionValidated","sap/ui/mdc/condition/ConditionConverter","sap/ui/mdc/condition/FilterConverter","sap/base/Log","sap/base/util/merge"],function(e,t,i,r,n,a){"use strict";var o=function(e){if(e&&e.getTypeMap){return e.getTypeMap()}if(e&&e.getTypeUtil){return e.getTypeUtil()}return e};var u={getPropertyByKey:function(t,i){var r=null;t.some(function(t){if(e.getPropertyPath(t)===i){r=t}return r!=null});if(!r){t.some(function(t){if(e.getPropertyKey(t)===i){r=t}return r!=null})}return r},getConditionsMap:function(e,i){var r,a,o={};if(!e||!e.isA("sap.ui.mdc.FilterBar")){n.error("instance of sap.ui.mdc.FilterBar expected");return o}var u=e.getInternalConditions();for(var s in u){if(i.indexOf(s)>=0){r=[];if(u[s]){for(var f=0;f<u[s].length;f++){a={};a.operator=u[s][f].operator;if(a.operator==="EQ"&&u[s][f].validated===t.Validated){a.values=[u[s][f].values[0]]}else{a.values=u[s][f].values}r.push(a)}o[s]=r}}}return o},getFilterInfo:function(e,t,s,f){var p={};var l={};if(s&&s.length>0){Object.keys(t).forEach(function(e){var i=s.find(function(t){return t.name===e});var r=i&&i.path?i.path:e;l[r]=t[e]})}else{l=t}f=f?f:[];var d,c,g={},y;var v={};if(s&&s.length>0){for(c in l){if(f.indexOf(c)<0){var h=u.getPropertyByKey(s,c);if(h){v[c]={type:h.typeConfig.typeInstance,caseSensitive:h.caseSensitive,baseType:h.typeConfig.baseType};g[c]=[];for(d=0;d<l[c].length;d++){y=a({},l[c][d]);g[c].push(i.toType(y,h.typeConfig.typeInstance,o(e)))}}else{n.error("sap.ui.mdc.util.FilterUitl.js :","could not find propertyMetadata of : "+c)}}}if(Object.keys(g).length>0){p.filters=r.createFilters(g,v)}}return p},getRequiredFieldNamesWithoutValues:function(e){var t=[];if(e&&e._getRequiredPropertyNames&&e._getConditionModel){e._getRequiredPropertyNames().forEach(function(i){var r=e._getConditionModel().getConditions(i);if(!r||r.length===0){t.push(i)}})}return t}};return u});
//# sourceMappingURL=FilterUtil.js.map
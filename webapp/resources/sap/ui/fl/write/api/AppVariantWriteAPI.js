/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/ChangesController","sap/ui/fl/write/_internal/SaveAs","sap/ui/fl/write/_internal/connectors/LrepConnector","sap/ui/fl/write/api/FeaturesAPI","sap/ui/fl/write/_internal/Versions"],function(e,r,t,n,i){"use strict";var a=function(r,n){if(!n.layer){return Promise.reject("Layer must be provided")}var i=e.getFlexControllerInstance(n.selector);n.reference=i.getComponentName();n.url="/sap/bc/lrep";return t.appVariant[r](n)};var s={saveAs:function(t){if(!t.layer){return Promise.reject("Layer must be provided")}if(!t.id){return Promise.reject("App variant ID must be provided")}var a=e.getFlexControllerInstance(t.selector);t.reference=a.getComponentName();return n.isVersioningEnabled(t.layer).then(function(e){if(e){t.parentVersion=i.getVersionsModel(t).getProperty("/displayedVersion")}return r.saveAs(t)})},deleteAppVariant:function(t){if(!t.layer){return Promise.reject("Layer must be provided")}var n=e.getFlexControllerInstance(t.selector);t.id=n.getComponentName();return r.deleteAppVariant(t)},listAllAppVariants:function(e){if(!e.layer){return Promise.reject("Layer must be provided")}return a("list",e)},getManifest:function(e){if(!e.layer){return Promise.reject("Layer must be provided")}if(!e.appVarUrl){return Promise.reject("appVarUrl must be provided")}return t.appVariant.getManifest(e)},assignCatalogs:function(e){if(!e.layer){return Promise.reject("Layer must be provided")}if(!e.assignFromAppId){return Promise.reject("assignFromAppId must be provided")}if(!e.action){return Promise.reject("action must be provided")}return a("assignCatalogs",e)},unassignCatalogs:function(e){if(!e.layer){return Promise.reject("Layer must be provided")}if(!e.action){return Promise.reject("action must be provided")}return a("unassignCatalogs",e)}};return s});
//# sourceMappingURL=AppVariantWriteAPI.js.map
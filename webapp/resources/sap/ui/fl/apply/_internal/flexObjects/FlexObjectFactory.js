/* !
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/restricted/_pick","sap/base/util/ObjectPath","sap/ui/core/Core","sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange","sap/ui/fl/apply/_internal/flexObjects/CompVariant","sap/ui/fl/apply/_internal/flexObjects/ControllerExtensionChange","sap/ui/fl/apply/_internal/flexObjects/FlexObject","sap/ui/fl/apply/_internal/flexObjects/FlVariant","sap/ui/fl/Layer","sap/ui/fl/Utils"],function(e,t,n,r,a,o,i,c,s,l){"use strict";var p={BASE_FLEX_OBJECT:i,COMP_VARIANT_OBJECT:a,FL_VARIANT_OBJECT:c,CONTROLLER_EXTENSION:o,APP_DESCRIPTOR_CHANGE:r};function u(e){if(e.fileType==="variant"){return p.COMP_VARIANT_OBJECT}else if(e.fileType==="ctrl_variant"){return p.FL_VARIANT_OBJECT}else if(e.changeType==="codeExt"){return p.CONTROLLER_EXTENSION}else if(e.appDescriptorChange){return p.APP_DESCRIPTOR_CHANGE}return p.BASE_FLEX_OBJECT}function f(e){var t=e.type||e.changeType;var r=e.fileName||e.id||l.createDefaultFileName(t);return{id:r,layer:e.layer,content:e.content,texts:e.texts,supportInformation:{service:e.ODataService,command:e.command,compositeCommand:e.compositeCommand,generator:e.generator,sapui5Version:n.getConfiguration().getVersion().toString(),sourceSystem:e.sourceSystem,sourceClient:e.sourceClient,originalLanguage:e.originalLanguage,user:e.user},flexObjectMetadata:{changeType:t,reference:e.reference,packageName:e.packageName}}}var g={};g.createFromFileContent=function(e,r){var a=Object.assign({},e);var o=r||u(a);if(!o){throw new Error("Unknown file type")}a.support=Object.assign({generator:"FlexObjectFactory.createFromFileContent",sapui5Version:n.getConfiguration().getVersion().toString()},a.support||{});var c=o.getMappingInfo();var s=i.mapFileContent(a,c);var l=Object.entries(s).reduce(function(e,n){t.set(n[0].split("."),n[1],e);return e},{});var p=new o(l);return p};g.createAppDescriptorChange=function(e){e.compositeCommand=e.compositeCommand||e.support&&e.support.compositeCommand;var t=f(e);return new r(t)};g.createControllerExtensionChange=function(e){e.generator=e.generator||"FlexObjectFactory.createControllerExtensionChange";e.changeType="codeExt";e.content={codeRef:e.codeRef};var t=f(e);t.flexObjectMetadata.moduleName=e.moduleName;t.controllerName=e.controllerName;return new o(t)};g.createFlVariant=function(e){e.generator=e.generator||"FlexObjectFactory.createFlVariant";var t=f(e);t.variantManagementReference=e.variantManagementReference;t.variantReference=e.variantReference;t.contexts=e.contexts;t.texts={variantName:{value:e.variantName,type:"XFLD"}};return new c(t)};g.createCompVariant=function(e){e.generator=e.generator||"FlexObjectFactory.createCompVariant";e.user=t.get("support.user",e);var n=f(e);n.variantId=e.variantId||n.id;n.contexts=e.contexts;n.favorite=e.favorite;n.persisted=e.persisted;n.persistencyKey=e.persistencyKey||t.get("selector.persistencyKey",e);if(e.layer===s.VENDOR||e.layer===s.CUSTOMER_BASE){n.favorite=true}if(e.executeOnSelection!==undefined){n.executeOnSelection=e.executeOnSelection}else{n.executeOnSelection=n.content&&(n.content.executeOnSelect||n.content.executeOnSelection)}return new a(n)};return g});
//# sourceMappingURL=FlexObjectFactory.js.map
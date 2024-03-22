/* !
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/restricted/_pick","sap/base/util/ObjectPath","sap/ui/core/Core","sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange","sap/ui/fl/apply/_internal/flexObjects/CompVariant","sap/ui/fl/apply/_internal/flexObjects/ControllerExtensionChange","sap/ui/fl/apply/_internal/flexObjects/FlexObject","sap/ui/fl/apply/_internal/flexObjects/FlVariant","sap/ui/fl/apply/_internal/flexObjects/States","sap/ui/fl/apply/_internal/flexObjects/UIChange","sap/ui/fl/Layer","sap/ui/fl/LayerUtils","sap/ui/fl/Utils"],function(e,t,n,r,a,i,o,c,s,l,p,u,f){"use strict";var g={BASE_FLEX_OBJECT:o,COMP_VARIANT_OBJECT:a,FL_VARIANT_OBJECT:c,CONTROLLER_EXTENSION:i,APP_DESCRIPTOR_CHANGE:r,UI_CHANGE:l};function m(e){if(e.fileType==="variant"){return g.COMP_VARIANT_OBJECT}else if(e.fileType==="ctrl_variant"){return g.FL_VARIANT_OBJECT}else if(e.changeType==="codeExt"){return g.CONTROLLER_EXTENSION}else if(e.appDescriptorChange){return g.APP_DESCRIPTOR_CHANGE}return g.UI_CHANGE}function C(e){var t=e.type||e.changeType;var r=e.fileName||e.id||f.createDefaultFileName(t);return{id:r,adaptationId:e.adaptationId,layer:e.layer,content:e.content,texts:e.texts,supportInformation:{service:e.ODataService,oDataInformation:e.oDataInformation,command:e.command,compositeCommand:e.compositeCommand,generator:e.generator,sapui5Version:n.getConfiguration().getVersion().toString(),sourceChangeFileName:e.support&&e.support.sourceChangeFileName,sourceSystem:e.sourceSystem,sourceClient:e.sourceClient,originalLanguage:e.originalLanguage,user:e.user},flexObjectMetadata:{changeType:t,reference:e.reference,packageName:e.packageName,projectId:e.projectId}}}var O={};O.createFromFileContent=function(e,r,a){var i=Object.assign({},e);var c=r||m(i);if(!c){throw new Error("Unknown file type")}i.support=Object.assign({generator:"FlexObjectFactory.createFromFileContent",sapui5Version:n.getConfiguration().getVersion().toString()},i.support||{});var l=c.getMappingInfo();var p=o.mapFileContent(i,l);var u=Object.entries(p).reduce(function(e,n){t.set(n[0].split("."),n[1],e);return e},{});var f=new c(u);if(a){f.setProperty("state",s.LifecycleState.PERSISTED)}return f};O.createUIChange=function(e){var t=C(e);if(!t.layer){t.layer=e.isUserDependent?p.USER:u.getCurrentLayer()}t.selector=e.selector;t.jsOnly=e.jsOnly;t.variantReference=e.variantReference;t.fileType=e.fileType||"change";return new l(t)};O.createAppDescriptorChange=function(e){e.compositeCommand=e.compositeCommand||e.support&&e.support.compositeCommand;var t=C(e);return new r(t)};O.createControllerExtensionChange=function(e){e.generator=e.generator||"FlexObjectFactory.createControllerExtensionChange";e.changeType="codeExt";e.content={codeRef:e.codeRef};var t=C(e);t.flexObjectMetadata.moduleName=e.moduleName;t.controllerName=e.controllerName;return new i(t)};O.createFlVariant=function(e){e.generator=e.generator||"FlexObjectFactory.createFlVariant";var t=C(e);t.variantManagementReference=e.variantManagementReference;t.variantReference=e.variantReference;t.contexts=e.contexts;t.texts={variantName:{value:e.variantName,type:"XFLD"}};return new c(t)};O.createCompVariant=function(e){e.generator=e.generator||"FlexObjectFactory.createCompVariant";e.user=t.get("support.user",e);var n=C(e);n.variantId=e.variantId||n.id;n.contexts=e.contexts;n.favorite=e.favorite;n.persisted=e.persisted;n.persistencyKey=e.persistencyKey||t.get("selector.persistencyKey",e);if(e.layer===p.VENDOR||e.layer===p.CUSTOMER_BASE){n.favorite=true}if(e.executeOnSelection!==undefined){n.executeOnSelection=e.executeOnSelection}else{n.executeOnSelection=n.content&&(n.content.executeOnSelect||n.content.executeOnSelection)}return new a(n)};return O});
//# sourceMappingURL=FlexObjectFactory.js.map
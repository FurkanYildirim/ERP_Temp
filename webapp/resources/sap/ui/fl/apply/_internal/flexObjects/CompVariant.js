/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/util/restricted/_pick","sap/ui/fl/apply/_internal/flexObjects/States","sap/ui/fl/apply/_internal/flexObjects/Variant","sap/ui/fl/LayerUtils","sap/ui/fl/Layer","sap/ui/fl/registry/Settings","sap/ui/fl/Utils"],function(t,e,r,n,i,a,s){"use strict";var o=r.extend("sap.ui.fl.apply._internal.flexObjects.CompVariant",{metadata:{properties:{persisted:{type:"boolean",defaultValue:true},persistencyKey:{type:"string"}},aggregations:{revertData:{type:"sap.ui.base.ManagedObject",multiple:true,singularName:"revertData"},changes:{type:"sap.ui.base.ManagedObject",multiple:true}}},constructor:function(t){r.apply(this,arguments);this.setFileType("variant");if(t.favorite!==undefined){this.setFavorite(!!t.favorite)}else if(t.layer===i.VENDOR||t.layer===i.CUSTOMER_BASE){this.setFavorite(true)}}});o.STANDARD_VARIANT_ID="*standard*";o.getMappingInfo=function(){return Object.assign(r.getMappingInfo(),{persistencyKey:"selector.persistencyKey",variantId:"variantId"})};o.prototype.getMappingInfo=function(){return o.getMappingInfo()};function p(t){var e=a.getInstanceOrUndef();var r=e&&e.getUserId();return!r||!t||r.toUpperCase()===t.toUpperCase()}function u(t,e,r){if(e){return t===e}else if(t===i.USER){return true}var s=a.getInstanceOrUndef();if(n.isSapUiLayerParameterProvided()){e=n.getCurrentLayer()}else if(!e){e=s.isPublicLayerAvailable()?i.PUBLIC:i.CUSTOMER}var o=t===e;var u=s.isKeyUser()||p(r);return o&&u}function f(t){return!t||s.getCurrentLanguage()===t}function c(t,e){var r=a.getInstanceOrUndef();if(!r){return true}if(!t||!e){return true}var n=r.getSystem();var i=r.getClient();return n===t&&e===i}o.prototype.getPackage=function(){return this.getFlexObjectMetadata().packageName};o.prototype.isVariant=function(){return true};o.prototype.isRenameEnabled=function(t){return!this.getStandardVariant()&&this.isEditEnabled(t)&&f(this.getSupportInformation().originalLanguage)};o.prototype.isEditEnabled=function(t){var e=t&&n.isDeveloperLayer(t);var r=c(this.getSupportInformation().sourceSystem,this.getSupportInformation().sourceClient);var i=u(this.getLayer(),t,this.getOwnerId());return e||r&&i};o.prototype.isDeleteEnabled=function(t){var e=c(this.getSupportInformation().sourceSystem,this.getSupportInformation().sourceClient);return e&&u(this.getLayer(),t,this.getOwnerId())&&!this.getStandardVariant()};o.prototype.storeFavorite=function(t){if(t!==this.getFavorite()){this.setState(e.LifecycleState.DIRTY);this.setFavorite(t)}};o.prototype.getOwnerId=function(){return this.getSupportInformation().user||""};o.prototype.storeContent=function(t){this.setContent(t)};o.prototype.storeExecuteOnSelection=function(t){if(t!==this.getExecuteOnSelection()){this.setState(e.LifecycleState.DIRTY);this.setExecuteOnSelection(t)}};o.prototype.storeName=function(t){this.setName(t)};o.prototype.storeContexts=function(t){this.setContexts(t);this.setState(e.LifecycleState.DIRTY)};o.prototype.cloneFileContentWithNewId=function(){var t=r.prototype.cloneFileContentWithNewId.apply(this,arguments);t.variantId=t.fileName;return t};return o});
//# sourceMappingURL=CompVariant.js.map
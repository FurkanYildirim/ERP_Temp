/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexState/compVariants/Utils","sap/ui/fl/apply/_internal/flexState/ManifestUtils","sap/ui/fl/write/api/ContextBasedAdaptationsAPI","sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState","sap/ui/fl/write/_internal/transport/TransportSelection","sap/base/util/UriParameters","sap/ui/fl/registry/Settings"],function(t,e,n,a,r,i,o){"use strict";function c(n,a){n.persistencyKey=t.getPersistencyKey(n.control);if(!n.reference){n.reference=e.getFlexReferenceForControl(n.control)}return a(n)}function u(t){var a=t.layer||t.changeSpecificData&&t.changeSpecificData.layer;if(a){if(!t.changeSpecificData){t.changeSpecificData={}}if(!t.reference){t.reference=e.getFlexReferenceForControl(t.control)}var r={layer:a,control:t.control,reference:t.reference};if(n.hasAdaptationsModel(r)){t.changeSpecificData.adaptationId=n.getDisplayedAdaptationId(r)}}}var f={addVariant:function(t){u(t);return c(t,a.addVariant)},updateVariant:function(t){u(t);return c(t,a.updateVariant)},updateVariantContent:function(t){u(t);t.action=a.updateActionType.UPDATE;return c(t,a.updateVariant)},saveVariantContent:function(t){t.action=a.updateActionType.SAVE;return c(t,a.updateVariant)},discardVariantContent:function(t){t.action=a.updateActionType.DISCARD;return c(t,a.discardVariantContent)},updateVariantMetadata:function(t){u(t);t.action=a.updateActionType.UPDATE_METADATA;return c(t,a.updateVariant)},removeVariant:function(t){u(t);return c(t,a.removeVariant)},revert:function(t){return c(t,a.revert)},save:function(t){return c(t,a.persist)},setDefaultVariantId:function(t){u(t);return c(t,a.setDefault)},isVariantSharingEnabled:function(){return o.getInstance().then(function(t){return t.isVariantSharingEnabled()})},isVariantPersonalizationEnabled:function(){return o.getInstance().then(function(t){return t.isVariantPersonalizationEnabled()})},isVariantAdaptationEnabled:function(){return o.getInstance().then(function(t){return t.isVariantAdaptationEnabled()})},overrideStandardVariant:function(t){c(t,a.overrideStandardVariant)},revertSetDefaultVariantId:function(t){return c(t,a.revertSetDefaultVariantId)},_getTransportSelection:function(){function t(){var t=i.fromQuery(window.location.search).get("sap-ui-layer")||"";return!!t}var e=new r;e.selectTransport=function(n,a,i,o,c,u){if(!t()){a(e._createEventObject(n,{transportId:""}));return}r.prototype.selectTransport.call(this,n,a,i,o,c,u)};return e}};return f});
//# sourceMappingURL=SmartVariantManagementWriteAPI.js.map
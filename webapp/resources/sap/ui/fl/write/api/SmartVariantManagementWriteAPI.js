/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexState/compVariants/Utils","sap/ui/fl/apply/_internal/flexState/ManifestUtils","sap/ui/fl/write/_internal/flexState/compVariants/CompVariantState","sap/ui/fl/write/_internal/transport/TransportSelection","sap/base/util/UriParameters","sap/ui/fl/registry/Settings"],function(t,n,e,a,r,i){"use strict";function u(e,a){e.persistencyKey=t.getPersistencyKey(e.control);if(!e.reference){e.reference=n.getFlexReferenceForControl(e.control)}return a(e)}var o={addVariant:function(t){return u(t,e.addVariant)},updateVariant:function(t){return u(t,e.updateVariant)},updateVariantContent:function(t){t.action=e.updateActionType.UPDATE;return u(t,e.updateVariant)},saveVariantContent:function(t){t.action=e.updateActionType.SAVE;return u(t,e.updateVariant)},discardVariantContent:function(t){t.action=e.updateActionType.DISCARD;return u(t,e.discardVariantContent)},updateVariantMetadata:function(t){t.action=e.updateActionType.UPDATE_METADATA;return u(t,e.updateVariant)},removeVariant:function(t){return u(t,e.removeVariant)},revert:function(t){return u(t,e.revert)},save:function(t){return u(t,e.persist)},setDefaultVariantId:function(t){return u(t,e.setDefault)},isVariantSharingEnabled:function(){return i.getInstance().then(function(t){return t.isVariantSharingEnabled()})},isVariantPersonalizationEnabled:function(){return i.getInstance().then(function(t){return t.isVariantPersonalizationEnabled()})},isVariantAdaptationEnabled:function(){return i.getInstance().then(function(t){return t.isVariantAdaptationEnabled()})},overrideStandardVariant:function(t){u(t,e.overrideStandardVariant)},revertSetDefaultVariantId:function(t){return u(t,e.revertSetDefaultVariantId)},_getTransportSelection:function(){function t(){var t=r.fromQuery(window.location.search).get("sap-ui-layer")||"";return!!t}var n=new a;n.selectTransport=function(e,r,i,u,o,c){if(!t()){r(n._createEventObject(e,{transportId:""}));return}a.prototype.selectTransport.call(this,e,r,i,u,o,c)};return n}};return o});
//# sourceMappingURL=SmartVariantManagementWriteAPI.js.map
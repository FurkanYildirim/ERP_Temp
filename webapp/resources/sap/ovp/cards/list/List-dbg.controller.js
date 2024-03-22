/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/ovp/cards/generic/base/list/BaseList.controller",
    "sap/ovp/filter/FilterUtils",
    "sap/ui/core/Core"
], function (
    BaseListController,
    FilterUtils,
    Core
) {
    "use strict";

    return BaseListController.extend("sap.ovp.cards.list.List", {
        onInit: function () {
            //The base controller lifecycle methods are not called by default, so they have to be called
            //Take reference from function mixinControllerDefinition in sap/ui/core/mvc/Controller.js
            BaseListController.prototype.onInit.apply(this, arguments);
            var that = this;
            this.eventhandler = function (sChannelId, sEventName, aFilters) {
                FilterUtils.applyFiltersToV2Card(aFilters, that);
            };
            this.GloabalEventBus = Core.getEventBus();
            if (this.oMainComponent && this.oMainComponent.isMacroFilterBar) {
                this.GloabalEventBus.subscribe("OVPGlobalfilter", "OVPGlobalFilterSeacrhfired", that.eventhandler);
            }
        },
        onAfterRendering: function () {
            BaseListController.prototype.onAfterRendering.apply(this, arguments);
        }
    });
});

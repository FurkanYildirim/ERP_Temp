/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/ovp/cards/generic/base/list/BaseList.controller",
    "sap/ovp/filter/FilterUtils",
    "sap/ui/core/Core",
    "sap/ovp/cards/OVPCardAsAPIUtils",
    "sap/ovp/cards/Filterhelper"
], function (
    BaseListController,
    FilterUtils,
    Core,
    OVPCardAsAPIUtils,
    Filterhelper
) {
    "use strict";

    return BaseListController.extend("sap.ovp.cards.v4.list.List", {
        onInit: function () {
            //The base controller lifecycle methods are not called by default, so they have to be called
            //Take reference from function mixinControllerDefinition in sap/ui/core/mvc/Controller.js
            BaseListController.prototype.onInit.apply(this, arguments);
            var that = this;
            this.eventhandler = function (sChannelId, sEventName, aFilters) {
                FilterUtils.applyFiltersToV4Card(aFilters, that);
            };
            this.GloabalEventBus = Core.getEventBus();
            if (
                this.oMainComponent &&
                (this.oMainComponent.isMacroFilterBar || this.oMainComponent.oGlobalFilter)
            ) {
                this.GloabalEventBus.subscribe("OVPGlobalfilter", "OVPGlobalFilterSeacrhfired", that.eventhandler);
            }
        },

        onAfterRendering: function () {
            BaseListController.prototype.onAfterRendering.apply(this, arguments);
            if (!OVPCardAsAPIUtils.checkIfAPIIsUsed(this)) {
                var oCardPropertiesModel = this.getCardPropertiesModel();
                var cardmanifestModel = this.getOwnerComponent().getModel("ui").getData().cards;
                var relfilters = [];
                var sEntityType = this.getEntitySet() && this.getEntitySet()["$Type"];
                var oContext = sEntityType && this.getMetaModel().getContext("/" + sEntityType);
                if (oContext) {
                    var entityType = oContext.getObject();
                    this.selectionVaraintFilter = Filterhelper.getSelectionVariantFilters(
                        cardmanifestModel,
                        oCardPropertiesModel,
                        this.getEntityType()
                    );
                }
                var oMainComponent = this.oCardComponentData.mainComponent;
                if (oMainComponent.getGlobalFilter()) {
                    relfilters = Filterhelper._getEntityRelevantFilters(
                        entityType,
                        oMainComponent.oGlobalFilter.getFilters()
                    );
                }
                if (oMainComponent.getMacroFilterBar()) {
                    var aFilters = oMainComponent.aFilters;
                    relfilters = Filterhelper._getEntityRelevantFilters(entityType, aFilters);
                }
                relfilters = Filterhelper.mergeFilters(relfilters, this.selectionVaraintFilter);
                if (this.getCardItemsBinding()) {
                    this.getCardItemsBinding().filter(relfilters);
                }
                if (this.getKPIBinding()) {
                    this.getKPIBinding().filter(relfilters);
                }
            }
        },
        onExit: function () {
            BaseListController.prototype.onExit.apply(this, arguments);
        }
    });
});
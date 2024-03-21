sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History"
], function(Controller, JSONModel, MessageBox, History) {
    "use strict";

    return Controller.extend("digiNode.controller.rootView", {

        onInit: function() {

        },

        onObjectMatched: function(oEvent) {

        },

        onBeforeRendering: function() {

        },

        onAfterRendering: function() {

        },

        onRouteMatched: function(oEvent) {

        },

        onCollapseExpandPress: function() {
            var oSideNavigation = this.byId("sideNavigation");
            var bExpanded = oSideNavigation.getExpanded();

            oSideNavigation.setExpanded(!bExpanded);
        },

        onItemSelect: function(oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo(sKey);
        }
    });

});

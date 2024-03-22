/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define([
    "sap/ovp/cards/generic/Component",
    "sap/ovp/cards/jUtils",
    "sap/ovp/cards/charts/VizAnnotationManager" /** Required to load VizAnnotationManager for card creation using OVPCardAsAPIUtils API */
], function (
    CardComponent,
    jUtils,
    VizAnnotationManager
) {
    "use strict";

    return CardComponent.extend("sap.ovp.cards.charts.analytical.Component", {
        // use inline declaration instead of component.json to save 1 round trip
        metadata: {
            properties: {
                headerExtensionFragment: {
                    type: "string",
                    defaultValue: "sap.ovp.cards.generic.KPIHeader"
                },
                contentFragment: {
                    type: "string",
                    defaultValue: "sap.ovp.cards.charts.analytical.analyticalChart"
                },
                controllerName: {
                    type: "string",
                    defaultValue: "sap.ovp.cards.charts.analytical.analyticalChart"
                },
                enableAddToInsights : {
                    type: "boolean",
                    defaultValue: true
                }
            },
            version: "1.115.0",
            library: "sap.ovp",
            includes: [],
            dependencies: {
                libs: ["sap.viz"],
                components: []
            },
            config: {}
        },

        onAfterRendering: function () {
            jUtils.setAttributeToMultipleElements(".tabindex0", "tabindex", 0);
            jUtils.setAttributeToMultipleElements(".tabindex-1", "tabindex", -1);
        }
    });
});

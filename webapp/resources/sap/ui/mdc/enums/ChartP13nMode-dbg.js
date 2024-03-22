/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the personalization mode of the chart.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.ChartP13nMode
     * @since 1.115
     * @public
     */
    var ChartP13nMode = {
        /**
         * Item personalization is enabled.
         *
         * @public
         */
        Item: "Item",
        /**
         * Sort personalization is enabled.
         *
         * @public
         */
        Sort: "Sort",
        /**
         * Chart type personalization is enabled.
         *
         * @public
         */
        Type: "Type",
        /**
         * Filter personalization is enabled.
         *
         * @public
         */
        Filter: "Filter"
    };

    return ChartP13nMode;

}, /* bExport= */ true);
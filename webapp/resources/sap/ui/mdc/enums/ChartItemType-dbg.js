/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
    "use strict";

    /**
     * @enum {string}
     * @private
     * @since 1.115
     * @alias sap.ui.mdc.enums.ChartItemType
     */
    var ChartItemType = {
        /**
         * Dimension Item
         * @public
         */
        Dimension: "Dimension",
        /**
         * Measure Item
         * @public
         */
        Measure: "Measure"
    };

    return ChartItemType;

}, /* bExport= */ true);
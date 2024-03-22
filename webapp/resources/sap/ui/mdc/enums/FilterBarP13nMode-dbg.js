/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the personalization mode of the filter bar.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.FilterBarP13nMode
     * @since 1.115
     * @public
     */
    var FilterBarP13nMode = {
        /**
         * Filter item personalization is enabled.
         *
         * @public
         */
        Item: "Item",
        /**
         * Condition personalization is enabled.
         *
         * @public
         */
        Value: "Value"
    };

    return FilterBarP13nMode;

}, /* bExport= */ true);
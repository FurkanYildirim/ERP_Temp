/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the personalization mode of the table.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.TableP13nMode
     * @since 1.115
     * @public
     */
    var TableP13nMode = {
        /**
         * Column personalization is enabled.
         *
         * @public
         */
        Column: "Column",
        /**
         * Sort personalization is enabled.
         *
         * @public
         */
        Sort: "Sort",
        /**
         * Filter personalization is enabled.
         *
         * @public
         */
        Filter: "Filter",
        /**
         * Group personalization is enabled.
         *
         * @public
         */
        Group: "Group",
        /**
         * Aggregation personalization is enabled.
         *
         * @public
         */
        Aggregate: "Aggregate"
    };

    return TableP13nMode;

}, /* bExport= */ true);
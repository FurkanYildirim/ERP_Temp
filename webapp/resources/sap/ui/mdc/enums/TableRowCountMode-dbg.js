/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the row count mode of the GridTable.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.TableRowCountMode
     * @since 1.115
     * @public
     */
    var TableRowCountMode = {
        /**
         * The table automatically fills the height of the surrounding container.
         *
         * @public
         */
        Auto: "Auto",
        /**
         * The table always has as many rows as defined in the <code>rowCount</code> property of <code>GridTableType</code>.
         *
         * @public
         */
        Fixed: "Fixed"
    };

    return TableRowCountMode;

}, /* bExport= */ true);
/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the mode of the table.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.TableSelectionMode
     * @since 1.115
     * @public
     */
    var TableSelectionMode = {
        /**
         * No rows/items can be selected (default).
         * @public
         */
        None: "None",
        /**
         * Only one row/item can be selected at a time.
         * @public
         */
        Single: "Single",
        /**
         * Only one row/item can be selected at a time. Should be used for navigation scenarios to indicate the navigated row/item. If this selection
         * mode is used, no <code>rowPress</code> event is fired.
         * @public
         */
        SingleMaster: "SingleMaster",
        /**
         * Multiple rows/items can be selected at a time.
         * @public
         */
        Multi: "Multi"
    };

    return TableSelectionMode;

}, /* bExport= */ true);
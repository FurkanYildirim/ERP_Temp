/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Enumeration of the <code>multiSelectMode</code> in <code>ListBase</code>.
     * @enum {string}
     * @private
     * @alias sap.ui.mdc.enums.TableMultiSelectMode
     * @since 1.115
     * @ui5-restricted sap.ui.mdc
     */
    var TableMultiSelectMode = {
        /**
         * Renders the <code>selectAll</code> checkbox (default behavior).
         * @public
         */
        Default: "Default",

        /**
         * Renders the <code>clearAll</code> icon.
         * @public
         */
        ClearAll: "ClearAll"
    };

    return TableMultiSelectMode;

}, /* bExport= */ true);
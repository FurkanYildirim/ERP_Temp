/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
    "use strict";

    /**
     *
     * Defines the growing options of the responsive table.
     *
     * @enum {string}
     * @alias sap.ui.mdc.enums.TableGrowingMode
     * @since 1.115
     * @public
     */
    var TableGrowingMode = {
        /**
         * Growing does not take place (<code>growing</code> is not set in the responsive table)
         *
         * @public
         */
        None: "None",
        /**
         * Basic growing takes place (<code>growing</code> is set in the responsive table)
         *
         * @public
         */
        Basic: "Basic",
        /**
         * Growing with <code>scroll</code> takes place (<code>growing</code> and <code>growingScrollToLoad</code> are set in the responsive table)
         *
         * @public
         */
        Scroll: "Scroll"
    };

    return TableGrowingMode;

}, /* bExport= */ true);
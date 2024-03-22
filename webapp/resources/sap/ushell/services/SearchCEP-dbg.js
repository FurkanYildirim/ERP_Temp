// Copyright (c) 2009-2023 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's Search for myHome.
 *
 * @version 1.115.1
 */
sap.ui.define([
    "sap/base/Log"
], function (Log) {
    "use strict";

    var COMPONENT_NAME = "sap.ushell.services.SearchCEP";
    var EMPTY_SEARCH_RESULTS = {
        count: 0,
        data: []
    };

    /**
     * This method MUST be called by the Unified Shell's container only, others
     * MUST call <code>sap.ushell.Container.getServiceAsync("SearchCEP").then(function (SearchCEP) {});</code>.
     * Constructs a new instance of the SearchCEP service.
     *
     * The Unified Shell's search service for CEP myHome.
     *
     * @param {object} oAdapter the service adapter for the search service, as already provided by the container
     * @param {object} oContainerInterface oContainerInterface
     * @param {string} sParameter sParameter
     * @param {object} oConfig oConfig
     *
     * @name sap.ushell.services.SearchCEP
     * @class
     * @see sap.ushell.services.Container#getServiceAsync
     * @since 1.101.0
     * @private
     */
    function SearchCEP (oAdapter, oContainerInterface, sParameter, oConfig) {
        this.oAdapter = oAdapter;
    }

    /**
     * Searching applications.
     * @param {string} sQuery The query string to search.
     *
     * @returns {Promise} Promise resolving the search result (array of application objects)
     *
     * @private
     * @since 1.101.0
     */
    SearchCEP.prototype.execSearch = function (sQuery) {
        var that = this;
        return new Promise(function (fnResolve) {
            that.oAdapter.execSearch(sQuery).then(fnResolve, function (vError) {
                // in case of error, log it and return
                // an empty result for the search control to work properly
                Log.error("execSearch of the adapter failed", vError, COMPONENT_NAME);
                fnResolve({});
            });
        });
    };

    SearchCEP.prototype.suggest = function (oParameters) {
        return this.search(oParameters);
    };


    /**
     * @typedef SearchResults
     * @type {object}
     * @property {int} count the total number of results
     * @property {object[]} data an array of search results
     */

    /**
     * Execute the search.
     *
     * @param {object} oParameters the parametes for the search.
     * @param {string} oParameters.searchTerm the search term.
     * @param {int} [oParameters.skip] (optional) the specified number of results are skipped.
     * @param {int} [oParameters.top]
     *                  (optional) only the specified top (first) results are returned.
     * @param {object|sap.ui.model.Filter} [oParameters.filter] (optional) the filter json configuration or Filter object.
     *    Defined as json (expected by sap.ui.model.Filter) or as a sap.ui.model.Filter instance
     * @param {object|sap.ui.model.Sorter} [oParameters.sort] (optional) the sorter json configuration or Sorter object
     *    Defined as json (expected by sap.ui.model.Sorter) or as a sap.ui.model.Sorter instance
     *
     * @returns {Promise<SearchResults>} Promise resolving the search results
     *
     * @private
     * @since 1.115.0
     */
    SearchCEP.prototype.search = function (oParameters) {
        if (typeof (this.oAdapter.search) === "function") {
            return this.oAdapter.search(oParameters);
        }

        return Promise.resolve(EMPTY_SEARCH_RESULTS);
    };


    SearchCEP.hasNoAdapter = false;
    return SearchCEP;
}, true /* bExport */);

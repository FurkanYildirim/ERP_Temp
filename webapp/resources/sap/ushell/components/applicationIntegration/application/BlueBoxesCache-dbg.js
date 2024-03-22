// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/thirdparty/URI",
    "sap/base/Log"
], function (URI, Log) {
    "use strict";

    var oCacheStorage = {};

    function init () {
        oCacheStorage = {};
    }

    function getSize () {
        return Object.keys(oCacheStorage).length;
    }

    function add (sUrl, oIframe) {
        var oKeyValues = getBlueBoxCacheKeyValues(sUrl);
        oCacheStorage[oKeyValues.sKey] = {
            oContainer: oIframe,
            oKeyValues: oKeyValues
        };
    }

    function remove (sUrl) {
        var sKey = getBlueBoxCacheKeyValues(sUrl).sKey;
        if (oCacheStorage[sKey]) {
            delete oCacheStorage[sKey];
        }
    }

    function get (sUrl) {
        if (sUrl === undefined || getSize() === 0) {
            return undefined;
        }
        var sKey = getBlueBoxCacheKeyValues(sUrl).sKey;

        return (sKey && oCacheStorage.hasOwnProperty(sKey) ? oCacheStorage[sKey].oContainer : undefined);
    }

    function getById (sId) {
        for (var sKey in oCacheStorage) {
            if (oCacheStorage.hasOwnProperty(sKey)) {
                var oEntry = oCacheStorage[sKey].oContainer;

                if (oEntry.sId === sId) {
                    return oEntry;
                }
            }
        }

        return undefined;
    }

    function getBlueBoxCacheKeyValues (sUrl) {
        var oUri,
            sOrigin,
            oParams,
            sIframeHint = "",
            sUI5Version = "",
            sKeepAlive = "",
            sTestUniqueId = "",
            oRes = {
                sKey: "",
                sOrigin: "",
                sIframeHint: "",
                sUI5Version: "",
                sKeepAlive: ""
            };

        //special cases
        if (sUrl === undefined || sUrl === "" || sUrl === "../") {
            oRes.sKey = sUrl;
            return oRes;
        }

        try {
            oUri = new URI(sUrl);
            if (sUrl.charAt(0) === "/") {
                sOrigin = window.location.origin;
            } else {
                sOrigin = oUri.origin();
            }
            if (sOrigin === undefined || sOrigin === "") {
                sOrigin = oUri.path();
                if (sOrigin === undefined || sOrigin === "") {
                    sOrigin = sUrl;
                }
            }
            oParams = oUri.query(true);
            if (oParams.hasOwnProperty("sap-iframe-hint")) {
                oRes.sIframeHint = oParams["sap-iframe-hint"];
                sIframeHint = "@" + oRes.sIframeHint;
            }
            if (oParams.hasOwnProperty("sap-ui-version")) {
                oRes.sUI5Version = oParams["sap-ui-version"];
                sUI5Version = "@" + oRes.sUI5Version;
            }
            if ((sIframeHint === "@GUI" || sIframeHint === "@WDA" || sIframeHint === "@WCF") && oParams.hasOwnProperty("sap-keep-alive")) {
                oRes.sKeepAlive = oParams["sap-keep-alive"];
                sKeepAlive = "@" + oRes.sKeepAlive + "-" + sUrl;
            }
            if (oParams.hasOwnProperty("sap-testcflp-iframeid")) {
                sTestUniqueId = "@" + oParams["sap-testcflp-iframeid"];
            }
        } catch (ex) {
            Log.error(
                "URL '" + sUrl + "' can not be parsed: " + ex,
                "sap.ushell.components.applicationIntegration.application.BlueBoxHandler"
            );
            sOrigin = sUrl;
        }

        oRes.sOrigin = sOrigin;
        oRes.sKey = sOrigin + sIframeHint + sUI5Version + sKeepAlive + sTestUniqueId;

        return oRes;
    }

    return {
        init: init,
        getSize: getSize,
        add: add,
        remove: remove,
        get: get,
        getById: getById,
        getBlueBoxCacheKeyValues: getBlueBoxCacheKeyValues
    };
}, /* bExport= */ false);

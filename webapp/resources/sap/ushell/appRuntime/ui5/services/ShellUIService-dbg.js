// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ui/core/service/ServiceFactory",
    "sap/ui/core/service/Service",
    "../../../ui5service/_ShellUIService/shelluiservice.class.factory",
    "sap/ushell/appRuntime/ui5/AppRuntimePostMessageAPI",
    "sap/ushell/appRuntime/ui5/AppRuntimeService",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/utils/clone"
], function (ServiceFactoryRegistry, ServiceFactory, Service, fnDefineClass, AppRuntimePostMessageAPI, AppRuntimeService, AppRuntimeContext, jQuery, UrlParsing, clone) {
    "use strict";

    var oService = fnDefineClass({
        serviceRegistry: ServiceFactoryRegistry,
        serviceFactory: ServiceFactory,
        service: Service
    });

    var sLastSetTitle,
        bRegistered = false,
        fnBackNavigationCallback;

    var ShellUIServiceProxy = oService.extend("sap.ushell.appRuntime.services.ShellUIService", {

        setTitle: function (sTitle) {
            sLastSetTitle = sTitle;
            return AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.services.ShellUIService.setTitle", {
                    sTitle: sTitle
                });
        },

        getTitle: function () {
            return sLastSetTitle;
        },

        setHierarchy: function (aHierarchyLevels) {
            var fnSendSetHierarchy = function (aHierarchyLevelsTmp) {
                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.ShellUIService.setHierarchy", {
                        aHierarchyLevels: aHierarchyLevelsTmp
                    });
            };

            if (AppRuntimeContext.getIsScube() === true && Array.isArray(aHierarchyLevels) && aHierarchyLevels.length > 0) {
                _convertIntentsForScube(aHierarchyLevels).then(function (aNewHierarchyLevels) {
                    fnSendSetHierarchy(aNewHierarchyLevels);
                });
                return;
            }

            fnSendSetHierarchy(aHierarchyLevels);
        },

        setRelatedApps: function (aRelatedApps) {
            var fnSendRelatedApps = function (aRelatedAppsTmp) {
                AppRuntimeService.sendMessageToOuterShell(
                    "sap.ushell.services.ShellUIService.setRelatedApps", {
                        aRelatedApps: aRelatedAppsTmp
                    });
            };

            if (AppRuntimeContext.getIsScube() === true && Array.isArray(aRelatedApps) && aRelatedApps.length > 0) {
                _convertIntentsForScube(aRelatedApps).then(function (aNewRelatedApps) {
                    fnSendRelatedApps(aNewRelatedApps);
                });
                return;

            }

            fnSendRelatedApps(aRelatedApps);
        },

        setBackNavigation: function (fnCallback) {
            if (!bRegistered) {
                bRegistered = true;
                AppRuntimePostMessageAPI.registerCommHandlers({
                    "sap.ushell.appRuntime": {
                        oServiceCalls: {
                            handleBackNavigation: {
                                executeServiceCallFn: function (oServiceParams) {
                                    if (fnBackNavigationCallback) {
                                        fnBackNavigationCallback();
                                    } else if (AppRuntimeContext.checkDataLossAndContinue()) {
                                        window.history.back();
                                    }
                                    return new jQuery.Deferred().resolve().promise();
                                }
                            }
                        }
                    }
                });
            }

            fnBackNavigationCallback = fnCallback;
            AppRuntimeService.sendMessageToOuterShell(
                "sap.ushell.ui5service.ShellUIService.setBackNavigation", {
                    callbackMessage: {
                        service: "sap.ushell.appRuntime.handleBackNavigation"
                    }
                });
        },

        _getBackNavigationCallback: function () {
            return fnBackNavigationCallback;
        },

        _resetBackNavigationCallback: function () {
            this.setBackNavigation();
        }
    });

    function _convertIntentsForScube (aAppsIntents) {
        return new Promise(function (fnResolve) {
            var aAppsIntentsCopy = clone(aAppsIntents);
            var aIntents = [];
            var oParsedHash;

            aIntents = aAppsIntentsCopy.map(function (oApp) {
                return {
                    target: {
                        shellHash: oApp.intent
                    }
                };
            });

            sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavService) {
                oCrossAppNavService.isNavigationSupported(aIntents, undefined, true).then(function (aIntentsSupported) {
                    for (var i = 0; i < aIntentsSupported.length; i++) {
                        if (!aIntentsSupported[i].supported) {
                            oParsedHash = UrlParsing.parseShellHash(aAppsIntentsCopy[i].intent);
                            oParsedHash.params["sap-shell-so"] = oParsedHash.semanticObject;
                            oParsedHash.params["sap-shell-action"] = oParsedHash.action;
                            oParsedHash.params["sap-remote-system"] = AppRuntimeContext.getRemoteSystemId();
                            oParsedHash.semanticObject = "Shell";
                            oParsedHash.action = "startIntent";
                            aAppsIntentsCopy[i].intent = "#" + UrlParsing.constructShellHash(oParsedHash);
                        }
                    }
                    fnResolve(aAppsIntentsCopy);
                });
            });
        });
    }

    return ShellUIServiceProxy;
});

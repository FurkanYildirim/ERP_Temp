/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Core",
    "sap/base/security/URLListValidator",
    "./CollaborationHelper",
    "./BaseHelperService",
    "sap/ui/core/Element",
    "./ContactHelper",
    "sap/ui/Device"
], function (Log, Core, URLListValidator, CollaborationHelper, BaseHelperService, Element, ContactHelper, Device) {
    "use strict";

    /**
     * Provides the Share options
     * @namespace
     * @since 1.104
     * @alias module:sap/suite/ui/commons/collaboration/TeamsHelperService
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    var TeamsHelperService = BaseHelperService.extend("sap.suite.ui.commons.collaboration.TeamsHelperService", {
        constructor: function (oProviderConfig) {
            this._providerConfig = oProviderConfig;
            this._providerConfig.shareAsLinkUrl = "https://teams.microsoft.com/share";
            this._getShareAsTabUrl().then(function(sShareAsTabUrl) {
                this._providerConfig.shareAsTabUrl = sShareAsTabUrl;
            }.bind(this));
        }
    });

    /**
     * sTeamsAppID is hardcoded as of now, will be changed when app is published at org level.
     */
    var COLLABORATION_MSTEAMS_APPID = 'db5b69c6-0430-4ae1-8d6e-a65c2220b50c';
    var oLogger = Log.getLogger("sap.suite.ui.commons.collaboration.TeamsHelperService");

    var oResourceBundle = Core.getLibraryResourceBundle("sap.suite.ui.commons");
    var PARAM_SAP_CARD_TITLE = "sap-ui-xx-cardTitle";
    var oHash;

    /**
     * Gives list of all Collaboration Options
     * @param {object} oParams Optional argument in case consumer wants to influence the options, otherwise pass as undefined
     * @param {boolean} oParams.isShareAsLinkEnabled Allow Share as Chat option
     * @param {boolean} oParams.isShareAsTabEnabled Allow Share as Tab option
     * @param {boolean} oParams.isShareAsCardEnabled Allow Share as Card option
     * @returns {array} Array of available options
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    TeamsHelperService.prototype.getOptions = function (oParams) {
        var oTeamsParams = {
            isShareAsLinkEnabled: (oParams && typeof oParams.isShareAsLinkEnabled !== 'undefined') ? oParams.isShareAsLinkEnabled : true,
            isShareAsTabEnabled: (oParams && typeof oParams.isShareAsTabEnabled !== 'undefined') ? oParams.isShareAsTabEnabled : true,
            isShareAsCardEnabled: (oParams && typeof oParams.isShareAsCardEnabled !== 'undefined') ? oParams.isShareAsCardEnabled : false
        };

        var aOptions = [];
        var aFinalOptions = [];

        if (Device.system.desktop) {
            if (oTeamsParams.isShareAsLinkEnabled) {
                if (this._providerConfig.isShareAsLinkEnabled) {
                    aOptions.push({
                        "text": oResourceBundle.getText("COLLABORATION_MSTEAMS_CHAT"),
                        "key": "COLLABORATION_MSTEAMS_CHAT",
                        "icon": "sap-icon://post",
                        "fesrStepName": "MST:ShareAsLink"
                    });
                } else {
                    oLogger.info("Share as Chat option is not enabled in the tenant");
                }
            } else {
                oLogger.info("Consumer disable Share as Chat option");
            }
        } else {
            oLogger.info("Share as Chat option is not supported in Phone and Tablet");
        }

        if (Device.system.desktop) {
            if (oTeamsParams.isShareAsTabEnabled) {
                if (this._providerConfig.isShareAsTabEnabled) {
                    aOptions.push({
                        "text": oResourceBundle.getText("COLLABORATION_MSTEAMS_TAB"),
                        "key": "COLLABORATION_MSTEAMS_TAB",
                        "icon": "sap-icon://image-viewer",
                        "fesrStepName": "MST:ShareAsTab"
                    });
                } else {
                    oLogger.info("Share as Tab option is not enabled in the tenant");
                }
            } else {
                oLogger.info("Consumer disable Share as Tab option");
            }
        } else {
            oLogger.info("Share as Tab option is not supported in Phone and Tablet");
        }

        if (Device.system.desktop) {
            if (oTeamsParams.isShareAsCardEnabled) {
                // TODO: Share as Card option is enabled only based on the Feature flag. Communication arrangement will not expose
                // this flag in UI Extension 9.0 delivery. This code will have to be changed to check
                // this._providerConfig.isShareAsCardEnabled once communication arrangement expose this switch and make generally
                // available. Till then feature will work based on the feature toggle
                if (this._isFeatureFlagEnabled()) {
                    aOptions.push({
                        "text": oResourceBundle.getText("COLLABORATION_MSTEAMS_CARD"),
                        "key": "COLLABORATION_MSTEAMS_CARD",
                        "icon": "sap-icon://ui-notifications",
                        "fesrStepName": "MST:ShareAsCard"
                    });
                } else {
                    oLogger.info("Share as Card option is not enabled in the tenant");
                }
            } else {
                oLogger.info("Consumer disable Share as Card option");
            }
        } else {
            oLogger.info("Share as Card option is not supported in Phone and Tablet");
        }

        if (aOptions.length === 1) {
            aFinalOptions = aOptions;
            if (aFinalOptions[0].key === "COLLABORATION_MSTEAMS_CHAT") {
                aFinalOptions[0].text = oResourceBundle.getText("COLLABORATION_MSTEAMS_CHAT_SINGLE");
            } else if (aFinalOptions[0].key === "COLLABORATION_MSTEAMS_TAB") {
                aFinalOptions[0].text = oResourceBundle.getText("COLLABORATION_MSTEAMS_TAB_SINGLE");
            } else if (aFinalOptions[0].key === "COLLABORATION_MSTEAMS_CARD") {
                aFinalOptions[0].text = oResourceBundle.getText("COLLABORATION_MSTEAMS_CARD_SINGLE");
            }
            return aFinalOptions;
        }

        if (aOptions.length > 1) {
            aFinalOptions.push({
                "type": "microsoft",
                "text": oResourceBundle.getText("COLLABORATION_MSTEAMS_SHARE"),
                "icon": "sap-icon://collaborate",
                "subOptions": aOptions
            });
        }

        return aFinalOptions;
    };

    /**
     * Method to be called to trigger the share operation
     *
     * @param {Object} oOption Option Object/SubObject which is clicked
     * @param {Object} oParams Parameter object which contain the information to share
     * @param {string} oParams.url Url of the application which needs to be shared
     * @param {string} oParams.appTitle Title of the application which needs to be used while integration
     * @param {string} oParams.subTitle Title of the object page which needs to be used while integration
     * @param {boolean} oParams.minifyUrlForChat Experimental flag. Set to true to minify the Url in chat scenario
     * @returns {void}
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    TeamsHelperService.prototype.share = function (oOption, oParams) {

        if (!oParams.url) {
            oLogger.error("url is not supplied in object so terminating Click");
            return;
        }

        if (!URLListValidator.validate(oParams.url)) {
            oLogger.error("Invalid URL supplied");
            return;
        }

        if (oOption.key === "COLLABORATION_MSTEAMS_CHAT") {
            this._shareAsChat(oParams);
            return;
        }

        if (oOption.key === "COLLABORATION_MSTEAMS_TAB") {
            this._shareAsTab(oParams);
            return;
        }

        if (oOption.key === "COLLABORATION_MSTEAMS_CARD") {
            this._shareAsCard(oParams);
            return;
        }
    };

    /**
     * Helper method which shares the URL as Link
     *
     * @param {Object} oParams Parameter object which contain the information to share
     * @param {string} oParams.url Url of the application which needs to be shared
     * @param {string} oParams.appTitle Title of the application which needs to be used in the chat message
     * @param {string} oParams.subTitle Title of the object page which needs to be used in the chat message
     * @param {boolean} oParams.minifyUrlForChat Experimental flag. Set to true to minify the Url.
     * @returns {void}
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    TeamsHelperService.prototype._shareAsChat = function (oParams) {
        var newWindow = window.open(
            "",
            "_blank",
            "width=700,height=600"
        );
        var sMessage = oParams.appTitle;
        if (oParams.subTitle.length > 0) {
            sMessage += ": " + oParams.subTitle;
        }

        newWindow.opener = null;
        if (oParams.minifyUrlForChat) {
			CollaborationHelper.compactHash(oParams.url, []).then(function (sShortURL) {
				newWindow.location = this._providerConfig.shareAsLinkUrl + "?msgText=" + encodeURIComponent(sMessage) + "&href=" + encodeURIComponent(sShortURL.url);
			}.bind(this));
		} else {
			newWindow.location = this._providerConfig.shareAsLinkUrl + "?msgText=" + encodeURIComponent(sMessage) + "&href=" + encodeURIComponent(oParams.url);
		}
    };

    /**
     * Helper method which shares the application as a Tab in MS Teams
     *
     * @param {Object} oParams Parameter object which contain the information to share
     * @param {string} oParams.url Url of the application which needs to be shared
     * @param {string} oParams.appTitle Title of the application which needs to be used in the Tab title
     * @param {string} oParams.subTitle Title of the object page which needs to be used in the Tab title
     * @returns {void}
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    TeamsHelperService.prototype._shareAsTab = function (oParams) {
        var sAppUri = oParams.url;
        var iIndexOfHash = sAppUri.indexOf('#');
        if (iIndexOfHash !== -1) {
            var sUriForHeaderLess = sAppUri.substring(0, iIndexOfHash);
            var iIndexOfQuestionMark = sUriForHeaderLess.indexOf('?', 0);
            var sParam = 'appState=lean&sap-collaboration-teams=true';
            if (iIndexOfQuestionMark !== -1) {
                sUriForHeaderLess = sUriForHeaderLess.substring(0, iIndexOfQuestionMark + 1) + sParam + '&' + sUriForHeaderLess.substring(iIndexOfQuestionMark + 1);
            } else {
                sUriForHeaderLess += ("?" + sParam);
            }
            sAppUri = sUriForHeaderLess + sAppUri.substring(iIndexOfHash);
            oHash = undefined;
            sAppUri = this._addNavmodeInUrl(sAppUri);
        }

        var oData = {
            "subEntityId": {
                "url": sAppUri,
                "appTitle": oParams.appTitle,
                "subTitle": oParams.subTitle,
                "mode": "tab"
            }
        };
        if (oParams.minifyUrlForChat) {
			CollaborationHelper.compactHash(sAppUri, []).then(function (sShortURL) {
				oData.subEntityId.url = this._addNavmodeInUrl(sShortURL.url);
				var sURL = this._providerConfig.shareAsTabUrl + "?&context=" + encodeURIComponent(JSON.stringify(oData));
		        sap.m.URLHelper.redirect(sURL, true);
			}.bind(this));
		} else {
			var sURL = this._providerConfig.shareAsTabUrl + "?&context=" + encodeURIComponent(JSON.stringify(oData));
			sap.m.URLHelper.redirect(sURL, true);
		}
    };

    TeamsHelperService.prototype._addNavmodeInUrl = function (sURL) {
        var oUshellContainer = sap.ushell && sap.ushell.Container;
        var oURLParsing = oUshellContainer && oUshellContainer.getService("URLParsing");
        var sAppUri = sURL;
        var iIndexOfHash = sAppUri.indexOf('#');
        var oHashPartOfUri = oURLParsing.parseShellHash(sAppUri.substring(iIndexOfHash));
        if (!oHash) {
            oHash = oHashPartOfUri;
        }
        oHash.params['sap-ushell-navmode'] = 'explace';
        oHash.params['sap-ushell-next-navmode'] = 'explace';
        oHashPartOfUri.params = oHash.params;
        var sHashOfUri = oURLParsing.constructShellHash(oHashPartOfUri);
        sAppUri = sAppUri.substring(0, iIndexOfHash) + '#' + sHashOfUri;
        return sAppUri;
    };

    /**
     * Helper method which shares the URL as Card
     *
     * @param {Object} oParams Parameter object which contain the information to share
     * @param {string} oParams.url Url of the application which needs to be shared
     * @returns {void}
     * @private
     * @ui5-restricted
     * @experimental Since 1.108
     */
    TeamsHelperService.prototype._shareAsCard = function (oParams) {
        var newWindow = window.open(
            "",
            "_blank",
            "width=700,height=600"
        );


        newWindow.opener = null;

        if (oParams.minifyUrlForChat) {
			CollaborationHelper.compactHash(oParams.url, []).then(function (sShortURL) {
				newWindow.location = this._addCardTitleInUrl(sShortURL.url, oParams.appTitle);
			}.bind(this));
		} else {
			newWindow.location = this._addCardTitleInUrl(oParams.url, oParams.appTitle);
		}
    };

    TeamsHelperService.prototype._addCardTitleInUrl = function(sUrl, sAppTitle) {
        sUrl = sUrl + "&" + PARAM_SAP_CARD_TITLE + "=" + sAppTitle;
        sUrl = this._providerConfig.shareAsLinkUrl + "?href=" + encodeURIComponent(sUrl);
        return sUrl;
    };

    TeamsHelperService.prototype._getShareAsTabUrl = function () {
        return this._getApplicationID().then(function(sTeamsAppID) {
            return "https://teams.microsoft.com/l/entity/" + sTeamsAppID + "/tab";
        });
    };

    TeamsHelperService.prototype._getApplicationID = function () {
        var oUshellContainer = sap.ushell && sap.ushell.Container;
        var oURLParsing = oUshellContainer && oUshellContainer.getService("URLParsing");
        return CollaborationHelper._getCurrentUrl().then(function (sCurrentUrl) {
            var sBeforeHashURL = sCurrentUrl.split("#")[0];
            if (sBeforeHashURL.indexOf('?') !== -1) {
                var oParsedUrl = oURLParsing && oURLParsing.parseParameters(sBeforeHashURL.substring(sBeforeHashURL.indexOf('?')));
                if (oParsedUrl &&
                    oParsedUrl["sap-collaboration-xx-TeamsAppId"] &&
                    oParsedUrl["sap-collaboration-xx-TeamsAppId"][0] &&
                    oParsedUrl["sap-collaboration-xx-TeamsAppId"][0].length > 0) {
                    return Promise.resolve(oParsedUrl["sap-collaboration-xx-TeamsAppId"][0]);
                }
                return Promise.resolve(COLLABORATION_MSTEAMS_APPID);
            } else {
                return Promise.resolve(COLLABORATION_MSTEAMS_APPID);
            }
        });
    };

    TeamsHelperService.prototype._isFeatureFlagEnabled = function () {
        if (window["sap-ushell-config"] &&
			window["sap-ushell-config"].renderers &&
			window["sap-ushell-config"].renderers.fiori2 &&
			window["sap-ushell-config"].renderers.fiori2.componentData &&
			window["sap-ushell-config"].renderers.fiori2.componentData.config &&
			window["sap-ushell-config"].renderers.fiori2.componentData.config.sapHorizonEnabled) {
                return true;
            }

        return false;
    };

    /**
     * Checks if collaboration with contacts is supported in teams AD
     *
     * @returns {boolean} A boolean indicating collaboration is supported
     * @private
     */

    TeamsHelperService.prototype.isContactsCollaborationSupported = function () {
        return true;
    };

    /**
     * Enables collaboration with contacts in teams AD
     * @param {string} sEmail email of the contact to enable the communication
     * @private
     */

    TeamsHelperService.prototype.enableContactsCollaboration = function (sEmail) {
        if (this._providerConfig.applicationId && this._providerConfig.tenantId && sEmail) {
            if (!this.oContactHelper) {
                this.oContactHelper = new ContactHelper(this._providerConfig);
            }
            return this.oContactHelper.loadContactPopover(sEmail);
        }
    };

    return TeamsHelperService;
});
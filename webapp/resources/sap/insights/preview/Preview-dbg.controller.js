/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(['sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/resource/ResourceModel',
    "sap/m/MessageToast",
    '../CardHelper',
    "sap/base/util/UriParameters",
    "../utils/CardPreviewManager",
    "sap/ui/Device",
    "../utils/DeviceType",
    "../utils/AppConstants",
    "sap/base/Log"], function (Controller, JSONModel, ResourceModel, MessageToast, CardHelper, UriParameters, CardPreviewManager, Device, DeviceType, AppConstants, Log) {
        var oLogger = Log.getLogger("sap.insights.preview.Preview");
        return Controller.extend('sap.insights.preview.Preview', {
            onInit: function () {
                this._oPreviewModel = new JSONModel({
                    descriptor: {},
                    previewDescriptor: {},
                    oConfCard: {},
                    oOrgCard: {}
                });
                this.getView().setModel(this._oPreviewModel, "cardPreviewModel");
                this.I18_BUNDLE = sap.ui.getCore().getLibraryResourceBundle("sap.insights");
                this.getView().setModel(new ResourceModel({ bundle: this.I18_BUNDLE }), "i18n");
                Device.resize.attachHandler(this._adjustLayoutStyles.bind(this));
                this._adjustLayoutStyles();
                if (this._oPreviewModel.getProperty("/bDesktop") === true) {
                    this._oPreviewModel.setProperty("/bShowCardPreview", true);
                }
            },
            save: function () {
                var oCard = this.getView().getModel("cardPreviewModel").getProperty("/oConfCard");
                if ((oCard["sap.card"].header.title).trim()) {
                    // oCard["sap.insights"].visible = oCard["sap.insights"].visible || false;
                    oCard["sap.insights"].visible = true;
                    this._getPreviewDialog().setBusy(true);
                    var oCardwAction = CardPreviewManager.insertActionsManifest(oCard, this.getView().getModel("cardPreviewModel").getProperty("/oOrgCard"));
                    CardHelper.getServiceAsync().then(function (oCardHelperServiceInstance) {
                        oCardHelperServiceInstance.createCard(oCardwAction).then(function (oCreatedCard) {
                            MessageToast.show(this.I18_BUNDLE.getText("Card_Created"));
                            this._getPreviewDialog().setBusy(false);
                            this.cancel();
                        }.bind(this)).catch(function (oError) {
                            MessageToast.show(oError.message);
                            this._getPreviewDialog().setBusy(false);
                        }.bind(this));
                    }.bind(this));
                } else {
                    var oTitle = this.getView().byId("titleTextInput");
                    oTitle.focus();
                }
            },
            _adjustLayoutStyles: function () {
                var sDeviceType = DeviceType.getDialogBasedDevice();
                if (sDeviceType === AppConstants.DEVICE_TYPES.Desktop) {
                    this._oPreviewModel.setProperty("/bDesktop", true);
                } else {
                    this._oPreviewModel.setProperty("/bDesktop", false);
                }
            },
            cancel: function () {
                this._oPreviewModel.setProperty("/bShowCardPreview", false);
                this._getPreviewDialog().close();
            },
            handleTitleChange: function (oEvent) {
                var oTitleInput = oEvent.getSource();
                var sTitleText = oTitleInput.getValue().trim();
                var oCard;
                if ( this._oPreviewModel.getProperty("/bDesktop")) {
                    oCard = this.getView().byId("defaultPreviewCardLS");
                } else {
                    oCard = this.getView().byId("defaultPreviewCardSD");
                }
                if (sTitleText) {
                    oTitleInput.setValueState("None");
                    oTitleInput.setValueStateText("");
                    if (oCard.getCardHeader()) {
                        oCard.getCardHeader().setTitle(sTitleText);
                    }
                    this.getView().byId("addPreviewCard").setEnabled(true);
                } else {
                    oTitleInput.setValueState("Error");
                    oTitleInput.setValueStateText(this.I18_BUNDLE.getText("INT_Preview_Title_ValueStateText"));
                    this.getView().byId("addPreviewCard").setEnabled(false);
                }
                oCard.refresh();
            },
            handleSubTitleChange: function(oEvent) {
                var oSubTitleInput = oEvent.getSource();
                var sSubTitleText = oSubTitleInput.getValue();
                var oCard;
                if ( this._oPreviewModel.getProperty("/bDesktop")) {
                  oCard = this.getView().byId("defaultPreviewCardLS");
                } else {
                  oCard = this.getView().byId("defaultPreviewCardSD");
                }
                if (oCard.getCardHeader()) {
                  oCard.getCardHeader().setSubtitle(sSubTitleText);
                }
                oCard.refresh();
            },
            handleVisibilityChange: function(oEvent) {
                var oModel = this.getView().getModel("cardPreviewModel");
                var val = oEvent.getParameter("state");
                var oCard = oModel.getProperty("/descriptor");
                oCard["sap.insights"].visible = val;
                oModel.setProperty("/descriptor", oCard);
            },
            showCardSelectionDialog: function () {
                this._getPreviewDialog().close();
                var oModel = this.getView().getModel("cardPreviewModel");
                var oCard = oModel.getProperty("/descriptor");
                CardHelper.getServiceAsync("UIService").then(function (oCardUIHelperInstance) {
                    oCardUIHelperInstance._showCardSelectionDialog(oCard);
                });
            },
            _getPreviewDialog: function () {
                return this.getView().byId('previewDialog');
            },
            _onCardManifestApplied: function(oEvent) {
                var oCard = oEvent.getSource();
                oCard.attachEvent("_error", this._onCardLoadFailure.bind(this, oCard));
                oCard.attachEvent("stateChanged", this._onCardStateChanged.bind(this, oCard));
                oCard.attachEvent("_contentReady", this._onCardContentReady.bind(this, oCard));
            },
            _onCardLoadFailure: function (oCard, oError) {
                // Integration card has removed throwing error when there is no data available eg: batch call respond with 0 items
                // so no more required to check for specific error message
                if (oError && oError.getParameters() && oError.getParameters().message) { //need to revisit the logic of disabling add button when there is error
                   // this.bCardError = true; //
                }
            },
            _onCardStateChanged: function (oCard) {
                var oModel = this.getView().getModel("cardPreviewModel");
                var oManifest = oCard.getManifest();
                var oTitleValue = oManifest["sap.card"].header.title;
                if (oCard.isReady() && !this.bCardError && oTitleValue && oTitleValue.trim()) {
                    oModel.setProperty("/bAddButton", true);
                } else {
                    oModel.setProperty("/bAddButton", false);
                }
            },
            _onCardContentReady: function (oCard) {
                var oModel = this.getView().getModel("cardPreviewModel");
                if (CardPreviewManager.hasVizData(oCard)) {
                    oModel.setProperty("/bCardHasData", true);
                } else {
                    oModel.setProperty("/bCardHasData", false);
                }
            },
            _callPreview: function(oManifest) {
                var sCardName , bDesktopMode;
                bDesktopMode = this._oPreviewModel.getProperty("/bDesktop");
                this._oPreviewModel.setProperty("/bShowCardPreview", true);
                sCardName = bDesktopMode ? "defaultPreviewCardLS" : "defaultPreviewCardSD";
                if ( this.getView().byId(sCardName)) {
                  this.getView().byId(sCardName).refresh();
                }
            },
            _callClosePreview: function(oManifest) {
                this._oPreviewModel.setProperty("/bShowCardPreview", false);
            },
            showPreview: function (oCard, bTransform, calledInternally) {
                var oModel = this.getView().getModel("cardPreviewModel");
                return CardHelper.getServiceAsync().then(function (oCardHelperServiceInstance) {
                    return oCardHelperServiceInstance.getUserCards().then(function (aCards) {
                        var aVisibleCards = aCards.filter(function (oCard) {
                            return oCard.visibility;
                        });
                        if (aVisibleCards.length > 9) {
                            oCard["sap.insights"].visible = false;
                        }
                        oModel.setProperty("/oOrgCard", oCard);
                        var oConfCard = JSON.parse(JSON.stringify(oCard));
                        oModel.setProperty("/descriptor", oCard);

                        /* Get Manifest For Preview  */
                        oConfCard = CardPreviewManager.getCardPreviewManifest(oCard);
                        oModel.setProperty("/oConfCard", oConfCard);

                        if (!calledInternally){
                            oModel.setProperty("/bAddButton", false);
                        }
                        this.bCardError = false;
                        var oTitle = this.getView().byId("titleTextInput");
                        oTitle.setValueState("None");
                        var oSapCard = oCard["sap.card"];
                        if ( (oSapCard.type === "Table" || oSapCard.type === "Analytical" ) && bTransform && !oModel.getProperty("/bConfigureOpen") && !calledInternally) {
                            // additionl check to decide whether to show preview based on configuredialogstate
                            oModel.setProperty("/bConfigureOpen", true);
                            return this.showCardConfigureDialog(oCard);
                        } else if (!bTransform) {
                            this._formatTitle(oTitle.getValue());
                            this._getPreviewDialog().open();
                            oModel.setProperty("/bConfigureOpen", false);
                            return Promise.resolve();
                        }
                    }.bind(this));
                }.bind(this))
                .catch(function(oError) {
                    if (oModel.getProperty("/bConfigureOpen")) {
                        oModel.setProperty("/bConfigureOpen", false);
                    }
                    oLogger.error(oError.message);
                    return Promise.reject(oError);
                });
            },
            _formatTitle: function(sTitle) {
                var oControl = this.getView().byId("titleTextInput");

                if (sTitle && sTitle.trim()) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                    this.getView().byId("addPreviewCard").setEnabled(true);
                } else {
                    oControl.setValueState("Error");
                    oControl.setValueStateText(this.I18_BUNDLE.getText("INT_Preview_Title_ValueStateText"));
                    this.getView().byId("addPreviewCard").setEnabled(false);
                }

            },
            showHouseOfCardsDialog: function(oEvent) {
                this.getView().setBusy(true);
                var oCard = this.getView().getModel("cardPreviewModel").getProperty("/descriptor");
                CardHelper.getServiceAsync("UIService").then(function (oCardUIHelperInstance) {
                  oCardUIHelperInstance.showHouseOfCardsDialog(oCard).then(function () {
                    this.getView().setBusy(false);
                    this._getPreviewDialog().close();
                  }.bind(this));
                }.bind(this)).catch(function (oError) {
                  MessageToast.show(oError.message);
                });
            },
            showCardConfigureDialog: function (oCard) {
                return CardHelper.getServiceAsync("UIService")
                  .then(
                    function(oCardUIHelperInstance) {
                        return oCardUIHelperInstance._showCardConfigureDialog(oCard).then(
                            function() {
                              this.getView().setBusy(false);
                              return Promise.resolve();
                            }.bind(this)
                        );
                    }.bind(this)
                  ).catch(function(oError) {
                        MessageToast.show(oError.message);
                        oLogger.error(oError.message);
                        return Promise.reject(oError);
                    });
            },
            isConfigureEnabled: function() {
            var sConfigureCardEnable =
                UriParameters.fromQuery(window.location.search).get(
                "configure-cards"
                ) || "";
            return sConfigureCardEnable.toUpperCase() === "TRUE" ? true : false;
            }
        });
    });

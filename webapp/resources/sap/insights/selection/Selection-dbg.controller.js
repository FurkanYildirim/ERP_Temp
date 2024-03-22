/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(
    [
        'sap/ui/model/resource/ResourceModel',
        '../CardHelper',
        "sap/m/MessageBox",
        "sap/m/MessageToast",
        "../base/Base.controller",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "sap/base/util/UriParameters",
        "sap/m/FormattedText",
        "sap/m/Link",
        "sap/ui/core/Fragment",
        "../utils/CardRanking",
        "../utils/BatchHelper",
        "../utils/CardPreviewManager",
        'sap/ui/model/json/JSONModel',
        "../base/InMemoryCachingHost"
    ],
    function (
        ResourceModel,
        CardHelper,
        MessageBox,
        MessageToast,
        BaseController,
        Filter,
        FilterOperator,
        UriParameters,
        FormattedText,
        Link,
        Fragment,
        CardRanking,
        BatchHelper,
        CardPreviewManager,
        JSONModel,
        InMemoryCachingHost
    ) {
        return BaseController.extend('sap.insights.selection.Selection', {
            onInit: function () {
                var I18_BUNDLE = sap.ui.getCore().getLibraryResourceBundle("sap.insights");
                this.getView().setModel(new ResourceModel({ bundle: I18_BUNDLE }), "i18n");
                this.i18Bundle = this.getView().getModel("i18n").getResourceBundle();
                this.oNavCon = this.getView().byId("selectionNavCon");
                this.oNavCon.setBusy(true);
                this.bHasRankingProperty = true;
                this.getView().setModel(new JSONModel({
                    selectionDialogOpen: false
                }), "cardSelectionModel");
                /* Todo: Move this to onBeforeRendering (Currently as it's not getting binded to DOM, onBeforeRendering or onAfterRendering is not triggered) */
                this.initUserCards();
                var sHostId = this.createId("ManageCardHost");
                this.host = new InMemoryCachingHost(sHostId);
                this.getView().addDependent(this.host);
            },
            showSelectionDialog: function (oCard) {
                this.orgCard = oCard;
                this.getView().getModel("cardSelectionModel").setProperty("/selectionDialogOpen", true);
                this._getSelectionDialog().open();
            },
            _getSelectionDialog: function () {
                return this.getView().byId('insightsSelectionDialog');
            },
            _getSelectionFragment: function () {
                return this.getView().byId("flexContainerCardsContent");
            },
            _getCardListPage: function () {
                return this.getView().byId("insightCardPage");
            },
            _getPreviewPage: function () {
                return this.getView().byId("previewPage");
            },
            closeDialog: function () {
                CardHelper.getServiceAsync("UIService").then(function (oInstance) {
                    this.oNavCon.to(this._getCardListPage());
                    this.getView().getModel("cardSelectionModel").setProperty("/selectionDialogOpen", false);
                    this._getSelectionDialog().close();
                    oInstance.showCardPreview(this.orgCard, true);
                }.bind(this));
            },
            isConfigureEnabled: function() {
                var sConfigureCardEnable = UriParameters.fromQuery(window.location.search).get("configure-cards") || "";
                return sConfigureCardEnable.toUpperCase() === "TRUE" ? true : false;
            },
            handleCardListItemPress: function (oEvent, oDynCard) {
                var oModel = this.getView().getModel("view");
                oModel.setProperty("/showConfigButton", false);
                if (oEvent) {
                    this.currentCardPreviewPath = oEvent.getSource().getBindingContextPath();
                } else if (oDynCard) {
                    this.currentCardPreviewPath = oDynCard.getBindingContextPath();
                }
                var oCard = oModel.getProperty(this.currentCardPreviewPath);
                var cardTitle = oCard.descriptorContent["sap.card"].header.title;
                oModel.setProperty("/selectedCardTitle", cardTitle);
                var oSapCard = oModel.getProperty(this.currentCardPreviewPath).descriptorContent["sap.card"];
                var oMainIndicator = oSapCard.header.mainIndicator;
                if ((oSapCard.type === "Table" || oMainIndicator) && this.isConfigureEnabled()) {
                    oModel.setProperty("/showConfigButton", true);
                }
                var oPage = this.getView().byId("previewPage");
                this.oNavCon.to(oPage);

                var oContext = oModel.createBindingContext(this.currentCardPreviewPath);
                // this.byId("previewCard").setBindingContext(oContext, "view");
                /* Get Manifest For Preview  */
                var aPreviewManifest = CardPreviewManager.getCardPreviewManifest(oCard.descriptorContent);
                oModel.setProperty("/previewDescriptor", aPreviewManifest);

                this.byId("insightsPreviewOverflowLayer").setBindingContext(oContext, "view");
                var oFormElement = this.byId("smartForm");
                oFormElement.removeAllItems();
                this._setSmartFormForCardEdit(oModel.getProperty(this.currentCardPreviewPath));
                this.oCardHelperServiceInstance.getParentAppDetails(oModel.getProperty(this.currentCardPreviewPath)).then(function(oParentAppDetails) {
                    oModel.setProperty("/parentAppTitle", oParentAppDetails.title);
                    oModel.setProperty("/parentAppUrl", oParentAppDetails.semanticURL);
                    oModel.setProperty("/parentAppsectionVisible", this.getIsNavigationEnabled(oParentAppDetails));
                }.bind(this));
            },
            setCopyVisible: function () {
                var oModel = this.getView().getModel("view");
                oModel.setProperty("/showCopyButton", false);
                oModel.setProperty("/showFilterBy", false);
                var oManifest = oModel.getProperty("/previewDescriptor");
                if (oManifest) {
                    var oCardDataSource = oManifest["sap.app"].dataSources;
                    var oFilterService = oCardDataSource.filterService;
                    var uri = oFilterService && oFilterService.uri;
                    var oTempSettings = oFilterService && oFilterService.settings;
                    if (uri && oTempSettings) {
                        oModel.setProperty("/showFilterBy", true);
                    }
                    if (oModel.getProperty("/showFilterBy") && oManifest["sap.insights"].isDtCardCopy) {
                        oModel.setProperty("/showCopyButton", true);
                    }
                }
            },
            handleCardVisibilityToggle: function (oEvent) {
                this._getSelectionFragment().setBusy(true);
                var oEventParameters = oEvent.getSource();
                var sPath = oEventParameters.getBindingContext("view").getPath();
                var oCard = this.getView().getModel("view").getProperty(sPath);
                var bToggleValue = oEventParameters.getSelected();
                oCard.visibility = bToggleValue;
                oCard.descriptorContent["sap.insights"].visible = bToggleValue;
                this.setSelectedCards();
                this.oCardHelperServiceInstance.updateCard(oCard.descriptorContent, true).then(function () {
                    this._getSelectionFragment().setBusy(false);
                }.bind(this)).catch(function (oError) {
                    oCard.visibility = !bToggleValue;
                    oCard.descriptorContent["sap.insights"].visible = !bToggleValue;
                    this.getView().getModel("view").refresh();
                    this._getSelectionFragment().setBusy(false);
                    MessageToast.show(oError.message);
                }.bind(this));
            },
            setSelectedCards: function () {
                var insightsCardsListTable = this.byId("insightsCardsListTable");
                if (insightsCardsListTable) {
                    this.getView().getModel("view").setProperty("/visibleCardCount", this.getSelectedCards().length);
                }
            },
            onEditInsightCardsDrop: function (oEvent) {
                if (!this.bHasRankingProperty){
                    MessageToast.show(this.i18Bundle.getText('cardDnDUnavailable'));
                    return;
                }
                var oDragItem = oEvent.getParameter("draggedControl"),
                    iDragItemIndex = oDragItem.getParent().indexOfItem(oDragItem),
                    oDropItem = oEvent.getParameter("droppedControl"),
                    iDropItemIndex = oDragItem.getParent().indexOfItem(oDropItem);

                if (iDragItemIndex !== iDropItemIndex) {
                    var aUpdatedCards = this._setCardsRanking(iDragItemIndex, iDropItemIndex);
                    aUpdatedCards = aUpdatedCards.map(function(oCard){
                        var sCardId = oCard.descriptorContent["sap.app"].id;
                        oCard.descriptorContent["sap.insights"].ranking = oCard.rank;
                        oCard.descriptorContent = JSON.stringify(oCard.descriptorContent);
                        return {
                            id: sCardId,
                            descriptorContent: oCard.descriptorContent
                        };
                    });
                    try {
                        this._getSelectionFragment().setBusy(true);
                        BatchHelper.createMultipartRequest(aUpdatedCards)
                            .then(function () {
                                return this.initUserCards(true);
                            }.bind(this))
                            .finally(function () {
                                this._getSelectionFragment().setBusy(false);
                            }.bind(this));
                    } catch (e) {
                        this._getSelectionFragment().setBusy(false);
                    }
                }
            },
            handleCardDeleteConfirm: function () {
                MessageBox.show(this.i18Bundle.getText("deleteCardMsg"), {
                    icon: MessageBox.Icon.WARNING,
                    title: this.i18Bundle.getText("delete"),
                    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.DELETE,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.DELETE) {
                            this.handleCardDelete(this.currentCardPreviewPath);
                        }
                    }.bind(this)
                });
            },
            handleCardDelete: function (sPath) {
                var oModel = this.getView().getModel("view");
                this._getPreviewPage().setBusy(true);
                var oCard = oModel.getProperty(sPath);
                var sCardId = oCard.descriptorContent["sap.app"].id;
                var sCardTitle = oCard.descriptorContent["sap.card"].header.title;
                this.oCardHelperServiceInstance.deleteCard(sCardId).then(function () {
                    this._getPreviewPage().setBusy(false);
                    MessageToast.show(this.i18Bundle.getText("deleteCardSuccess", sCardTitle));
                    var aNewCardSet = oModel.getProperty("/cards").filter(function (oCard) {
                        return oCard.descriptorContent["sap.app"].id !== sCardId;
                    });
                    var aVisibleCards = aNewCardSet.filter(function (oCard) {
                        return oCard.visibility;
                    });
                    oModel.setProperty("/cards", aNewCardSet);
                    oModel.setProperty("/cardCount", aNewCardSet.length);
                    oModel.setProperty("/visibleCardCount", aVisibleCards.length);
                    this.setDTCards();
                    this.oNavCon.back();
                    this.setSelectedCards();

                }.bind(this)).catch(function (oError) {
                    this._getPreviewPage().setBusy(false);
                    MessageToast.show(oError.message);
                }.bind(this));
            },
            getSelectedCards: function () {
                var aCards = this.getView().getModel("view").getProperty("/cards");
                aCards = aCards.filter(function (oCard) {
                    return oCard.visibility;
                });
                return aCards;
            },
            initUserCards: function (bForceUpdate) {
                return CardHelper.getServiceAsync().then(function (oService) {
                    this.oCardHelperServiceInstance = oService;
                    return this.oCardHelperServiceInstance.getUserCardModel(bForceUpdate).then(function (userCardModel) {
                        this.getView().setModel(userCardModel, "view");
                        var aCards = this.getView().getModel("view").getProperty("/cards");
                        var iVisibleCount = 0;
                        aCards.forEach(function (oCard) {
                            if (oCard.visibility) {
                                if (++iVisibleCount > 10) {
                                    oCard.visibility = false;
                                }
                            }
                            if (oCard.rank === 0) {
                                oCard.rank = 500;
                            }

                            /* In case Ranking propert is missing or Ranking to Rank mapping is missing Disable DnD Functionality */
                            if (!oCard.descriptorContent["sap.insights"].ranking || oCard.descriptorContent["sap.insights"].ranking !== oCard.rank) {
                                this.bHasRankingProperty = false;
                            }
                        }.bind(this));
                        var oModel = this.getView().getModel("view");
                        oModel.setProperty("/cards", aCards);
                        oModel.setProperty("/bShowMainIndicator", false);
                        oModel.setProperty("/bMainIndicator", false);
                        this.oSmartFormMap = {};
                        this._createOdataModelsforDialog(aCards);
                        this.setDTCards();
                        var bDeleteAllEnabled = this.isDeleteAllCardsEnabled();
                        oModel.setProperty("/deleteAllEnabled", bDeleteAllEnabled);
                        this.oNavCon.setBusy(false);
                        this.getView().getModel("cardSelectionModel").setProperty("/selectionDialogOpen", false);
                        return Promise.resolve();
                    }.bind(this));
                }.bind(this));
            },
            _setCardsRanking: function (iDragIndex, iDropIndex) {
                /* Read Cards from UI for scenario of cards filtered by search field */
                var aCards = this.byId("insightsCardsListTable").getItems().map(function(oItem){
                        return oItem.getBindingContext("view").getObject();
                    });

                if (iDragIndex < iDropIndex) {
                    return CardRanking.reorder(aCards, iDragIndex, iDropIndex + 1);
                }

                return CardRanking.reorder(aCards, iDragIndex, iDropIndex);
            },
            onNavBack: function () {
                this.oNavCon.back();
            },
            navigateToCopyCard: function () {
                var oPage = this.getView().byId("insightsCopyCardView");
                var oCard = this.getView().getModel("view").getProperty(this.currentCardPreviewPath);
                this.oNavCon.to(oPage);
                oPage.getController().initCopyCard(oCard);
            },
            navigateToConfigureCard: function() {
                var oPage = this.getView().byId("insightsConfigureCardView");
                var oCard = this.getView().getModel("view").getProperty(this.currentCardPreviewPath);
                oPage.getController().initConfigureCard(oCard,true);
            },
            onCardSearch: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var filter = new Filter("descriptorContent/sap.card/header/title", FilterOperator.Contains, sQuery);
                var aFilters = [];
                aFilters.push(filter);
                var oList = this.byId("insightsCardsListTable");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },
            refreshCardList: function () {
                var bIsDeleteAllEnable = this.isDeleteAllCardsEnabled(),
                    sContent;

                /* In case of delete all cards parameter true */
                if (bIsDeleteAllEnable) {
                    sContent = this.i18Bundle.getText("deleteAllCardsMsg");
                } else {
                    var aDTCards = this.getView().getModel("view").getProperty("/DTCards");
                    var sContentText = '<p>' + this.i18Bundle.getText("refreshAllCards") + '</p>';
                    sContentText += '<ul>';
                    aDTCards.forEach(function(oDTCard){
                        sContentText +=  '<li class="sapUiTinyMarginBottom">' + oDTCard.descriptorContent["sap.card"].header.title + '</li>';
                    });
                    sContentText += '</ul>';
                    sContent = new FormattedText({ htmlText: sContentText });
                }

                MessageBox.show(sContent, {
                    icon: MessageBox.Icon.WARNING,
                    title: this.i18Bundle.getText("refresh"),
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            this.oNavCon.setBusy(true);
                            this.oCardHelperServiceInstance._refreshUserCards(bIsDeleteAllEnable).then(function(){
                                this.initUserCards();
                            }.bind(this));
                        }
                    }.bind(this)
                });
            },
            isDeleteAllCardsEnabled: function () {
                var sEnableDeleteAllCardsFlag = UriParameters.fromQuery(window.location.search).get("delete-all-cards") || "";
                return sEnableDeleteAllCardsFlag.toUpperCase() === "TRUE" ? true : false;
            },
            /* Method to allow applications to navigate to parent app of the card */
            navigateToParentApp:function() {
                var oModel = this.getView().getModel("view");
                var sUrl = oModel.getProperty("/parentAppUrl");
                sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNavigator) {
                    oCrossAppNavigator.toExternal({
                        target: {
                            shellHash: sUrl
                        }
                    });
                    this.oNavCon.back();
                }.bind(this));
            },

            showCardPreviewPopover: function(oEvent) {
                var oModel = this.getView().getModel("view");
                var selectedCardPath = oEvent.getSource().getParent().getBindingContext('view').getPath();
                var oCard = oModel.getProperty(selectedCardPath);
                var oLink = oEvent.getSource();

                 /* Get Manifest For Preview  */
                 var aPreviewManifest = CardPreviewManager.getCardPreviewManifest(oCard.descriptorContent);
                 oModel.setProperty("/previewDescriptor", aPreviewManifest);


                if (!this._oCardPreviewPopover) {
                    Fragment.load({
                        id: "cardPreviewPopover",
                        name: "sap.insights.selection.cardPreviewPopover",
                        controller: this
                    }).then(
                        function (oPopover) {
                            this._oCardPreviewPopover = oPopover;
                            this.getView().addDependent(oPopover);
                            oPopover.openBy(oLink);
                        }.bind(this)
                    );
                } else {
                    this._oCardPreviewPopover.openBy(oLink);
                }
            },

            /* Method to allow applications to navigate to any card preview */
            navigateToCardPreview:function(sCardId) {
                var oModel = this.getView().getModel("view");
                var aCards = oModel.getProperty("/cards");
                var iCardIndex = aCards.findIndex(function(oCard){
                    return oCard.descriptorContent["sap.app"].id === sCardId;
                });
                if (iCardIndex !== -1){
                    var aCardList = this.getView().byId("insightsCardsListTable").getItems();
                    this.handleCardListItemPress(null,aCardList[iCardIndex]);
                }
            },

            /* Method to check if parent app navigation is supported */
            getIsNavigationEnabled: function(oParentAppDetails) {
                return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation")
                    .then(function (crossApplicationNavigationService) {
                        return crossApplicationNavigationService.isNavigationSupported([{
                            target: {
                                semanticObject: oParentAppDetails.semanticObject,
                                action: oParentAppDetails.action
                            }
                        }]);
                    })
                    .then(function(aResponses){
                        return aResponses[0].supported || false;
                    });
            },

            /* Set DT cards for refresh */
            setDTCards: function() {
                var oModel = this.getView().getModel("view");
                var aCards = oModel.getProperty("/cards");
                var aDTCards = aCards.filter(function(oCard){
                    return oCard.descriptorContent["sap.insights"].isDtCardCopy;
                });
                oModel.setProperty("/DTCards", aDTCards);
            }
        });
    });

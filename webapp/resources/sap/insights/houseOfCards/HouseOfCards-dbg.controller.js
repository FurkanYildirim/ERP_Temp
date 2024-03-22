/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        "sap/ui/integration/widgets/Card",
        "sap/ui/integration/Host",
        "../utils/Transformations",
        "sap/ui/model/resource/ResourceModel",
        "sap/ui/model/json/JSONModel",
        "../CardHelper",
        "../utils/CardPreviewManager",
        "sap/ui/Device",
        "../utils/AppConstants",
        "../utils/DeviceType",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        "../base/InMemoryCachingHost"
    ],
    function (Controller, Card, Host, Transformations, ResourceModel, JSONModel, CardHelper, CardPreviewManager,  Device, AppConstants, DeviceType, Filter, FilterOperator, InMemoryCachingHost) {
        "use strict";

        return Controller.extend("sap.insights.houseofcards.houseofcards", {
            onInit: function () {
                var sHostId = this.createId("HouseOfCardsHost");
                this.I18_BUNDLE = sap.ui.getCore().getLibraryResourceBundle("sap.insights");
                this.getView().setModel(new ResourceModel({ bundle: this.I18_BUNDLE }), "i18n");
                this._oHocViewModel = new JSONModel({
                    oCard: {},
                    oSelected: {},
                    bShowPreview: false,
                    aCards: [],
                    aPreviewCards: [],
                    aAllowedChartTypes: [],
                    sOriginalChartType: ""
                });
                this.getView().setModel(this._oHocViewModel, "hocModel");
                Device.resize.attachHandler(this._adjustLayoutStyles.bind(this));
                this._adjustLayoutStyles();
                this.host = new InMemoryCachingHost(sHostId, {
                    action: function (oEvent) {
                        var oCard = oEvent.getParameter("card") || {};
                        if ( this.getView().getModel("configureView")) {
                            this.getView().getModel("configureView").setProperty("/oConfCard", oCard.getManifest());
                        }
                   // this.saveCard(oCard);
                    }.bind(this)
                });
            },
            onChartTypePress: function (oEvent) {
                var oEventParameters = oEvent.getParameter("listItem");
                if (oEventParameters.getBindingContext("hocModel")) {
                    var sChartPath = oEventParameters.getBindingContext("hocModel").getPath();
                    var oCard =  this._oHocViewModel.getProperty(sChartPath);
                    var oContainer = this.byId("CardContainer");
                    var oPrevSelectedCard;
                    var oContainerItems = oContainer.getItems();
                    var sPrevSelectedpath = this._oHocViewModel.getProperty("/selectedPath");
                    oContainerItems.forEach(function(oCardItem) {
                        if (oCardItem.getBindingContext("hocModel")) {
                            var sCardItemPath = oCardItem.getBindingContext("hocModel").getPath();
                            if (sCardItemPath === sPrevSelectedpath && sPrevSelectedpath !== sChartPath) {
                                oPrevSelectedCard = oCardItem;
                            }
                        }
                    });
                    if (oPrevSelectedCard) {
                        oPrevSelectedCard.removeStyleClass("sapThemeHighlight-asBorderColor");
                    }
                    this._oHocViewModel.setProperty("/oSelected", oCard);
                    this._oHocViewModel.setProperty("/selectedPath", sChartPath);
                    var aPathSplit = sChartPath.split("/");
                    var sIndex = aPathSplit[aPathSplit.length - 1];
                    var oCardwAction = this._oHocViewModel.getProperty("/aCards/" + sIndex);
                    if ( this.getView().getModel("configureView")) {
                        this.getView().getModel("configureView").setProperty("/oConfCard", oCardwAction);
                        this.getView().byId("previewCardHoCSD").refresh();
                    }
                    var oChartCombo = this.getView().byId("hocChartCombo");
                    oChartCombo.setSelectedKey(oCard["sap.card"].content.chartType);
                }
            },

            onChartTypeSearch: function (oEvent) {
                var sQuery = '';
                if (oEvent) {
                  sQuery = oEvent.getSource().getValue();
                }
                var filter = new Filter("sap.card/content/chartType", FilterOperator.Contains, sQuery);
                var aFilters = [];
                aFilters.push(filter);
                var oList = this.byId("insightsCardsTypeTable");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },
            _onCardLoadFailure: function (oCard, oError) {
                this.byId("CardContainer").removeItem(oCard.sId);
            },
            _onCardStateChanged: function (oCard) {
                var oVizChart = oCard.getAggregation("_content") && oCard.getAggregation("_content").getAggregation("_content");
                if (oVizChart && oVizChart.attachRenderComplete) {
                    oVizChart.attachRenderComplete(function(oEvent){
                        var sErrorType = oEvent.getSource()._errorType;
                        if (sErrorType) {
                            this.byId("CardContainer").removeItem(oCard.sId);
                        }
                    }.bind(this));
                }
                var sChartType = oCard.getManifest()["sap.card"].content.chartType;
                var sOriginalChartType = this._oHocViewModel.getProperty("/sOriginalChartType");
                if (!CardPreviewManager.hasVizData(oCard) && sChartType !== sOriginalChartType) {
                    var aPreviewCards = this._oHocViewModel.getProperty("/aPreviewCards");
                    var iIndex = aPreviewCards.findIndex(function(oCard){
                        return oCard["sap.card"].content.chartType === sChartType;
                    });
                    if (iIndex > -1) {
                        this.byId("CardContainer").removeItem(iIndex);
                        aPreviewCards.splice(iIndex, 1);
                        this._oHocViewModel.setProperty("/aPreviewCards", aPreviewCards);
                    }
                }
            },
            createHouseOfCards: function () {
                var oCard = this._oHocViewModel.getProperty("/oCard");
                var sOriginalChartType = oCard["sap.card"].content.chartType;
                this._oHocViewModel.setProperty("/sOriginalChartType", sOriginalChartType);
                this._oHocViewModel.setProperty("/aCards", []);
                this._oHocViewModel.setProperty("/aPreviewCards", []);
                var oContainer = this.byId("CardContainer");
                var oCardCloneManifest = JSON.parse(JSON.stringify(oCard));
                var oCardSection = oCardCloneManifest["sap.card"];
                var oDefaultAggregation = oContainer.getMetadata().getDefaultAggregation();
                var aCards = [], aPreviewCards = [];
                var oSelectedCard;

                oContainer.removeAllAggregation(oDefaultAggregation.name);

                if (oCardSection.type === "Analytical") {
                    var aAllowedChartTypes = oCard["sap.insights"].allowedChartTypes;
                    var aChartTypes = [];
                    if (aAllowedChartTypes) {
                        this._oHocViewModel.setProperty("/aAllowedChartTypes", aAllowedChartTypes);
                        aChartTypes = aAllowedChartTypes.map(function(oChartType){
                            return oChartType.key;
                        });
                        // in V4 version aChartTypes details are sent differently hence check if it satisfies the v4 structure
                        var aCharts = aChartTypes.filter(function (oChart) {
                            return !!oChart;
                        });
                        if (aCharts.length === 0) {
                            aChartTypes = aAllowedChartTypes.map(function(oChartType){
                                return oChartType.chart;
                            });
                        }
                    }
                    aCards = Transformations.transformAnalyticalManifest(oCardCloneManifest, aChartTypes);
                    // aCards = aCards.concat(Transformations.createChartToListOrTableOptions(oCardCloneManifest));
                    } else if (oCardSection.type === "List") {
                        aCards = Transformations.createListOptions(oCardCloneManifest);
                    } else if (oCardSection.type === "Table") {
                        aCards = Transformations.createTableOptions(oCardCloneManifest);
                }

                aCards = aCards.filter(function (oCardToCheck) {
                    return !!oCardToCheck;
                });

                if (aCards.length === 0) {
                    //No transformed cards add original one
                    aCards.push(oCardCloneManifest);
                } else {
                    // Bring Original ChartType manifest to Top
                    var iIndex = aCards.findIndex(function(oCard){
                        return oCard["sap.card"].content.chartType === sOriginalChartType;
                    });
                    aCards.splice(iIndex, 1);
                    aCards.unshift(oCardCloneManifest);
                }

                aCards.forEach( function (oCardManifest) {
                    var oPreviewCloneManifest = JSON.parse(JSON.stringify(oCardManifest));
                    var aPreviewCard = CardPreviewManager.getCardPreviewManifest(oPreviewCloneManifest);
                    aPreviewCards.push(aPreviewCard);
                });
                this._oHocViewModel.setProperty("/aCards", aCards);
                this._oHocViewModel.setProperty("/aPreviewCards", aPreviewCards); //without actions
                if (!this._oHocViewModel.getProperty("/selectedPath")) {
                    this.byId("idHoCScrollContainer").scrollTo(0);
                    var oSearchField = this.byId("chartTypeSearch");
                    oSearchField.setValue('');
                    this.onChartTypeSearch();
                }
                if (!this._oHocViewModel.getProperty("/oSelected") || Object.keys(this._oHocViewModel.getProperty("/oSelected")).length === 0) {
                  this._oHocViewModel.setProperty("/oSelected", aPreviewCards[0]); // //without actions
                  if ( this.getView().getModel("configureView")) {
                      this.getView().getModel("configureView").setProperty("/oConfCard", aCards[0]); //with actions
                  }
                  this._oHocViewModel.setProperty("/selectedPath", "/aPreviewCards/0");
                } else {
                  oSelectedCard = this._oHocViewModel.getProperty("/oSelected");
                  var oConfCard = this.getView().getModel("configureView").getProperty("/oConfCard");
                  oSelectedCard["sap.card"].header.title =  oConfCard["sap.card"].header.title;
                  oSelectedCard["sap.card"].header.subTitle =  oConfCard["sap.card"].header.subTitle;
                  this.getView().byId("previewCardHoC").refresh();
                }
                oSelectedCard = this._oHocViewModel.getProperty("/oSelected");
                var oChartCombo = this.getView().byId("hocChartCombo");
                oChartCombo.setSelectedKey(oSelectedCard["sap.card"].content.chartType);
            },
            onCardRender : function(oEvent) {
                var oCard = oEvent.getSource();
                oCard.attachManifestApplied(function(oEvent) {
                    var oCard = oEvent.getSource();
                //   oCard.setHost(this.host);
                    var oContainer = this.byId("CardContainer");
                    var oContainerItems = oContainer.getItems();
                    oContainerItems.forEach(function(oCardItem) {
                        if (oCardItem.getBindingContext("hocModel")) {
                            var sCardItemPath = oCardItem.getBindingContext("hocModel").getPath();
                            if (this._oHocViewModel.getProperty("/selectedPath") === sCardItemPath && (oCardItem.sId === oCard.sId)) {
                                oCardItem.addStyleClass("sapThemeHighlight-asBorderColor");
                                oCardItem.focus();
                                this.byId("idHoCScrollContainer").scrollToElement(oCardItem);
                            }
                        }
                    }.bind(this));
                    if (oCard.getCardHeader()) {
                        var oHeader = oCard.getCardHeader();
                        oHeader.addStyleClass('sapFCardHeaderToolbarFocused'); // to remove border from card header
                    }
                    oCard.attachEvent("_error", this._onCardLoadFailure.bind(this, oCard));
                    oCard.attachEvent("stateChanged", this._onCardStateChanged.bind(this, oCard));
                }.bind(this));
                var oCardDom = oCard.getDomRef();
                oCardDom.removeEventListener("click",this.onClickFunction.bind(this, oCard));
                oCardDom.addEventListener("click",this.onClickFunction.bind(this, oCard),{capture:true});
            },
            setBorderStyleSelectedCard: function (sSelectedPath) {
                var oContainer = this.byId("CardContainer");
                var oContainerItems = oContainer.getItems();
                var oCard;
                oContainerItems.forEach(function(oCardItem) {
                  if (oCardItem.getBindingContext("hocModel")) {
                    var sCardItemPath = oCardItem.getBindingContext("hocModel").getPath();
                    if (sSelectedPath && !oCard && sCardItemPath === sSelectedPath) {
                        oCard = oCardItem;
                    }
                  }
                });
                if (oCard) {
                  setTimeout(function() {
                    oCard.addStyleClass("sapThemeHighlight-asBorderColor");
                  }, 0);
                  oCard.focus();
                }
            },
            onClickFunction: function(oCard, sSelectedPath) {
                var oContainer = this.byId("CardContainer");
                var oPrevSelectedCard;
                var oContainerItems = oContainer.getItems();
                var sPrevSelectedpath = this._oHocViewModel.getProperty("/selectedPath");
                oContainerItems.forEach(function(oCardItem) {
                    if (oCardItem.getBindingContext("hocModel")) {
                        var sCardItemPath = oCardItem.getBindingContext("hocModel").getPath();
                        if (sSelectedPath && !oCard && sCardItemPath === sSelectedPath) {
                            oCard = oCardItem;
                        }
                        if (sCardItemPath === sPrevSelectedpath && sPrevSelectedpath !== sSelectedPath) {
                            oPrevSelectedCard = oCardItem;
                        }
                    }
                });
                if (oContainer.getItems()[0].hasStyleClass("sapThemeHighlight-asBorderColor")) {
                    oContainer.getItems()[0].removeStyleClass("sapThemeHighlight-asBorderColor");
                } else if (oPrevSelectedCard) {
                    oPrevSelectedCard.removeStyleClass("sapThemeHighlight-asBorderColor");
                }
                if (oCard) {
                    setTimeout(function() {
                        oCard.addStyleClass("sapThemeHighlight-asBorderColor");
                    }, 0);
                    oCard.focus();
                    this.byId("idHoCScrollContainer").scrollToElement(oCard);
                    var sPath = oCard.getBindingContext("hocModel").getPath();
                    this._oHocViewModel.setProperty("/selectedPath",sPath);
                    var aPathSplit = sPath.split("/");
                    var sIndex = aPathSplit[aPathSplit.length - 1];
                    var oCardwAction = this._oHocViewModel.getProperty("/aCards/" + sIndex);
                    this._oHocViewModel.setProperty("/oSelected", oCard.getManifest());
                    if ( this.getView().getModel("configureView")) {
                        this.getView().getModel("configureView").setProperty("/oConfCard", oCardwAction);
                        this.getView().byId("previewCardHoC").refresh();
                    }
                    var oChartCombo = this.getView().byId("hocChartCombo");
                    oChartCombo.setSelectedKey(oCard.getManifest()["sap.card"].content.chartType);
                }
            },
            saveCard: function (oCard) {
                return new Promise(function (resolve) {
                    CardHelper.getServiceAsync("UIService").then(function (oService) {
                        var oManifest = oCard.getManifestRawJson();
                        var oHouseOfCardsDialog = this.byId("houseofcardseditordialog");
                        if (oHouseOfCardsDialog) {
                            oHouseOfCardsDialog.close();
                        }
                        oService.showCardPreview(oManifest, false, true).then(function () {
                            resolve();
                        });
                    }.bind(this));
                }.bind(this));
            },

            setChartDetail: function(sChartType, sKey) {
                var oChartTypes = AppConstants.CHART_TYPE_DETAILS;
                if (sKey === 'icon') {
                    return oChartTypes[sChartType] ? oChartTypes[sChartType].icon : oChartTypes["default"].icon;
                }
                if (sKey === "title") {
                    return oChartTypes[sChartType] ? oChartTypes[sChartType].title : sChartType.replaceAll("_", " ");
                }
            },
            _adjustLayoutStyles: function () {
                var sDeviceType = DeviceType.getDialogBasedDevice();
                if (sDeviceType === AppConstants.DEVICE_TYPES.Desktop) {
                    this._oHocViewModel.setProperty("/bDesktop", true);
                } else {
                    this._oHocViewModel.setProperty("/bDesktop", false);
                }
            },
            showHouseOfCardsDialog: function (oCard) {
                this._oHocViewModel.setProperty("/oCard", oCard);
                if (this._oHocViewModel.getProperty("/bDesktop")) {
                  this._oHocViewModel.setProperty("/bShowPreview",true);
                } else {
                  this._oHocViewModel.setProperty("/bShowPreview",false);
                }
                if (!Object.keys(this._oHocViewModel.getProperty("/oSelected")).length) {
                    this._oHocViewModel.setProperty("/selectedPath", '');
                    if ( this.getView().byId("chartTypeSearch")) {
                        this.getView().byId("chartTypeSearch").setValue('');
                        this.onChartTypeSearch();
                    }
                    this.createHouseOfCards();
                } else if (this._oHocViewModel.getProperty("/selectedPath")) {
                    this.setBorderStyleSelectedCard(this._oHocViewModel.getProperty("/selectedPath"));
                }
            },
            _callPreview: function(oManifest) {
                var bDesktopMode = this._oHocViewModel.getProperty("/bDesktop");
                var sCardName = bDesktopMode ? "previewCardHoC" : "previewCardHoCSD";
                this._oHocViewModel.setProperty("/bShowPreview",true);
                if ( this.getView().byId(sCardName)) {
                    this.getView().byId(sCardName).refresh();
                }
            },
            _callShowPreview: function(oManifest) {
                this._oHocViewModel.setProperty("/bShowPreview", true);
                var bDesktopMode = this._oHocViewModel.getProperty("/bDesktop");
                var sCardName = bDesktopMode ? "previewCardHoC" : "previewCardHoCSD";
                if ( this.getView().byId(sCardName)) {
                    this.getView().byId(sCardName).refresh();
                }
            },
            _callClosePreview: function(oManifest) {
                this._oHocViewModel.setProperty("/bShowPreview",false);
            },
            selectionChange: function (oEvent) {
                var oEventParameters = oEvent.getParameters();
                var oSelectedItem = oEventParameters.selectedItem;
                var sSelectedPath = oSelectedItem && oSelectedItem.getBindingContext("hocModel").getPath();
                this.onClickFunction(null, sSelectedPath);
            },
            closeDialog: function () {
                var oHouseOfCardsDialog = this.byId("houseofcardseditordialog");
                CardHelper.getServiceAsync("UIService").then(function (oService) {
                    var oCard = this._oHocViewModel.getProperty("/oCard");
                    if (oHouseOfCardsDialog) {
                        oHouseOfCardsDialog.close();
                    }
                    oService.showCardPreview(oCard, false, true);
                }.bind(this));
            },
            formatChartName: function (sChartType) {
                var aAllowedChartTypes = this._oHocViewModel.getProperty("/aAllowedChartTypes");
                var oChartType = aAllowedChartTypes.find(function(oChartType){
                    return oChartType.key === sChartType;
                });

                if (oChartType){
                    return oChartType.text;
                }
                return sChartType;
            }
        });
    }
);

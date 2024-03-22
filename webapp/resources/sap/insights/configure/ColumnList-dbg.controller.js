
/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
  'sap/ui/model/json/JSONModel',
  'sap/ui/model/resource/ResourceModel',
  "../base/Base.controller",
  "../CardHelper",
  "sap/m/MessageToast",
  "sap/base/Log",
  "sap/ui/Device",
  "../utils/AppConstants",
  "../utils/DeviceType",
  "../utils/Transformations",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "../base/InMemoryCachingHost",
  "../utils/CardPreviewManager"
], function (
  JSONModel,
  ResourceModel,
  BaseController,
  CardHelper,
  MessageToast,
  Log,
  Device,
  AppConstants,
  DeviceType,
  Transformations,
  Filter,
  FilterOperator,
  InMemoryCachingHost,
  CardPreviewManager
) {
  "use strict";
  var oLogger = Log.getLogger("sap.insights.configure.ColumnList");
  return BaseController.extend('sap.insights.configure.ColumnList', {
    onInit: function () {
      this._oConfigureViewModel = new JSONModel({
        oOrgCard: {},
        oConfCard: {},
        aCards: [],
        bDialogOpen: false,
        visibleColumnCount: 0
      });
      this.getView().setModel(this._oConfigureViewModel, "configureView");
      var I18_BUNDLE = sap.ui.getCore().getLibraryResourceBundle("sap.insights");
      this.getView().setModel(new ResourceModel({ bundle: I18_BUNDLE }), "i18n");
      this.i18Bundle = this.getView().getModel("i18n").getResourceBundle();
      Device.resize.attachHandler(this._adjustLayoutStyles.bind(this));
      this._adjustLayoutStyles();
      if (this._oConfigureViewModel.getProperty("/bDesktop") === true) {
        this._oConfigureViewModel.setProperty("/bShowCardPreview", true);
      }
      var testNavCon = this.getView().byId("navCon");
      var oHoCView = this._getHoCView();
      oHoCView.then(function(oHView) {
        testNavCon.addPage(oHView);
      });
      var sHostId = this.createId("transactionalCardHost");
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
    _getHoCView: function() {
      return  CardHelper.getServiceAsync("UIService").then( function(oInstance) {
              return oInstance._getXMLView("sap.insights.houseOfCards.HouseOfCardsDialog", "hocViewPage");
      }); //manually adding the HocPage view so that only one model is created and the created model get cached while invoking _getXMLView
    },
    _getConfigureCardPage: function () {
      return this.getView().byId('insightCardColumnPage');
    },
    showColumnListDialog: function (oCard) {
      try {
        this.orgCard = oCard;
        this._oConfigureViewModel.setProperty("/bTransform", true);
        this.initConfigureCard(oCard, false);
        this._getColumnListDialog().open();
        this._oConfigureViewModel.setProperty("/bDialogOpen", true);
      } catch (oError) {
        throw new Error(oError);
      }
    },
    save: function () {
      var oCard = this._oConfigureViewModel.getProperty("/oConfCard");
      if (oCard["sap.card"].header.title) {
          // oCard["sap.insights"].visible = oCard["sap.insights"].visible || false;
          oCard["sap.insights"].visible = true;
          this._getColumnListDialog().setBusy(true);
          var oCardwAction = CardPreviewManager.insertActionsManifest(oCard, this._oConfigureViewModel.getProperty("/oOrgCard"));
          CardHelper.getServiceAsync().then(function (oCardHelperServiceInstance) {
              oCardHelperServiceInstance.createCard(oCardwAction).then(function (oCreatedCard) {
                  MessageToast.show(this.i18Bundle.getText("Card_Created"));
                  this._getColumnListDialog().setBusy(false);
                  this._getColumnListDialog().close();
                  this.closeDialog();
              }.bind(this)
              ).catch(function (oError) {
                  MessageToast.show(oError.message);
                  this._getColumnListDialog().setBusy(false);
                  this.closeDialog();
              }.bind(this));
          }.bind(this));
      } else {
          var oTitle = this.getView().byId("titleTextInput");
          oTitle.focus();
      }
  },
    _getColumnListDialog: function () {
      return this.getView().byId('insightsColumnListDialog');
    },
    _callPreview: function(oManifest) {
      var sCardName , bDesktopMode;
      bDesktopMode = this._oConfigureViewModel.getProperty("/bDesktop");
      if ( this.getView().byId("navCon") &&  this.getView().byId("navCon").getCurrentPage().sId === this.getView().byId("insightCardColumnPage").sId ) {
        this._oConfigureViewModel.setProperty("/bShowPreview", true);
        sCardName = bDesktopMode ? "previewCard" : "previewColCardSD";

      } else if ( this.getView().byId("navCon") &&  this.getView().byId("navCon").getCurrentPage().sId === this.getView().byId("insightCardPreviewPage").sId ) {
        this._oConfigureViewModel.setProperty("/bShowCardPreview", true);
        sCardName = bDesktopMode ? "previewCardLS" : "previewCardSD";
      } else if (this.getView().byId("navCon") &&  this.getView().byId("navCon").getCurrentPage().sId === this.getView().byId("insightsHoCView").sId) {
        this._oConfigureViewModel.setProperty("/bShowHoCPage", true);
      }
      if ( this.getView().byId(sCardName)) {
        this.getView().byId(sCardName).refresh();
      }
     },
    //  setReady: function() {
    //   this._oConfigureViewModel.setProperty("/bCardReady", true);
    //  },
     _callPreviewPage: function(oManifest) {
      this._oConfigureViewModel.setProperty("/bShowPreview", false);
      this._oConfigureViewModel.setProperty("/bPreview", true);
      this._oConfigureViewModel.setProperty("/bShowCardPreview", false);
      if (this.getView().byId("navCon")) {
        var oCardPreviewPage = this.getView().byId("insightCardPreviewPage");
        var bDesktopMode = this._oConfigureViewModel.getProperty("/bDesktop");
        var sCardName = bDesktopMode ? "previewCardLS" : "previewCardSD";
        if ( this.getView().byId(sCardName)) {
          this.getView().byId(sCardName).refresh();
        }
        var oTitleInput = this.getView().byId("titleTextInput");
        if (oManifest) {
          if (oManifest["sap.card"].header.title && oManifest["sap.card"].header.title.trim()) {
            this.getView().byId("nextButton").setEnabled(true);
            oTitleInput.setValueState("None");
            oTitleInput.setValueStateText("");
          } else {
            this.getView().byId("nextButton").setEnabled(false);
            oTitleInput.setValueState("Error");
            oTitleInput.setValueStateText(this.i18Bundle.getText("INT_Preview_Title_ValueStateText"));
          }
        }
        this.getView().byId("navCon").to(oCardPreviewPage);
      }
     },
    _callShowPreview: function(oManifest) {
      this._oConfigureViewModel.setProperty("/bShowPreview", true);
      this._oConfigureViewModel.setProperty("/bRefresh", false);
      var bDesktopMode = this._oConfigureViewModel.getProperty("/bDesktop");
      var sCardName = bDesktopMode ? "previewCard" : "previewColCardSD";
      if ( this.getView().byId(sCardName)) {
        this.getView().byId(sCardName).refresh();
      }
     },
    //  refreshCardData: function(oManifest) {
    //   this._oConfigureViewModel.setProperty("/bShowPreview", true);
    //   this._oConfigureViewModel.setProperty("/bRefresh", false);
    //   var bDesktopMode = this._oConfigureViewModel.getProperty("/bDesktop");
    //   var sCardName = bDesktopMode ? "previewCard" : "previewColCardSD";
    //   if ( this.getView().byId(sCardName)) {
    //     var sCardId = oManifest["sap.app"].id;
    //     InMemoryCachingHost.prototype.clearCache(sCardId);
    //     this.getView().byId(sCardName).refresh();
    //   }
    //  },
     _callClosePreview: function(oManifest) {
      if ( this.getView().byId("navCon") &&  this.getView().byId("navCon").getCurrentPage().sId === this.getView().byId("insightCardColumnPage").sId ) {
        this._oConfigureViewModel.setProperty("/bShowPreview", false);
      } else if ( this.getView().byId("navCon") &&  this.getView().byId("navCon").getCurrentPage().sId === this.getView().byId("insightCardPreviewPage").sId ) {
        this._oConfigureViewModel.setProperty("/bShowCardPreview", false);
      }
    },

    closeDialog: function() {
      this._getColumnListDialog().close();
    },

    afterCloseDialog : function () {
      CardHelper.getServiceAsync("UIService").then(
        function(oInstance) {
          return oInstance
            ._setPreviewModelProperty("/bConfigureOpen", false)
            .then(
              function() {
                this._oConfigureViewModel.setProperty("/bShowPreview", false);
                this._oConfigureViewModel.setProperty("/bPreview", false);
                this._oConfigureViewModel.setProperty("/bDialogOpen", false);
                this._oConfigureViewModel.setProperty("/bShowHoCPage", false); // indicate navigation to hoc page
                this._oConfigureViewModel.setProperty("/columnPage", false); // indicate navigation to column page
                this._oConfigureViewModel.setProperty("/oConfCard", {});
                this._oConfigureViewModel.setProperty("/oOrgCard", {});
                if ( this.getView().byId("columnSearch")) {
                  this.getView().byId("columnSearch").setValue('');
                  this.onColumnSearch();
                }
              }.bind(this)
            ).then(function(){
              return oInstance
              ._setHoCModelProperty("/oSelected", {});
            });
        }.bind(this)
      );
    },
    _adjustLayoutStyles: function () {
      var sDeviceType = DeviceType.getDialogBasedDevice();
      if (sDeviceType === AppConstants.DEVICE_TYPES.Desktop) {
        this._oConfigureViewModel
        .setProperty("/bDesktop", true);
      } else {
        this._oConfigureViewModel
        .setProperty("/bDesktop", false);
      }
    },

    handleTitleChange: function (oEvent) {
      var oTitleInput = oEvent.getSource();
      var sTitleText = oTitleInput.getValue().trim();
      var oCard;
      if ( this._oConfigureViewModel.getProperty("/bDesktop")) {
        oCard = this.getView().byId("previewCardLS");
      } else {
        oCard = this.getView().byId("previewCardSD");
      }

      if (sTitleText) {
          this.getView().byId("nextButton").setEnabled(true);
          oTitleInput.setValueState("None");
          oTitleInput.setValueStateText("");
          if (oCard.getCardHeader()) {
            oCard.getCardHeader().setTitle(sTitleText);
          }
      } else {
          oTitleInput.setValueState("Error");
          oTitleInput.setValueStateText(this.i18Bundle.getText("INT_Preview_Title_ValueStateText"));
          this.getView().byId("nextButton").setEnabled(false);
      }
      oCard.refresh();
  },
  handleSubTitleChange: function(oEvent) {
      var oSubTitleInput = oEvent.getSource();
      var sSubTitleText = oSubTitleInput.getValue();
      var oCard;

      if ( this._oConfigureViewModel.getProperty("/bDesktop")) {
        oCard = this.getView().byId("previewCardLS");
      } else {
        oCard = this.getView().byId("previewCardSD");
      }
      if (oCard.getCardHeader()) {
        oCard.getCardHeader().setSubtitle(sSubTitleText);
      }
      oCard.refresh();
  },

  initConfigureCard: function(oCard, bCalledInternally) {
    var oOrgCard = oCard,
      oConfCard;
    var oSelectionView = sap.ui
      .getCore()
      .byId("myhomeSettingsView--INSIGHTS_CARDS");

      this._oConfigureViewModel.setProperty("/oOrgCard", oOrgCard);
      oConfCard = JSON.parse(JSON.stringify(oOrgCard)); // Deep copy original card

      //create card without actions
      oConfCard  = CardPreviewManager.getCardPreviewManifest(oConfCard);
      this._oConfigureViewModel.setProperty("/oConfCard", oConfCard);
    var oContext = this._oConfigureViewModel.createBindingContext(
      "/oConfCard"
    );
    this.getView()
      .byId("insightCardColumnPage")
      .setBindingContext(oContext, "configureCardView");
    this._oConfigureViewModel.setProperty("/visibleColumnCount", 0);
    this._oConfigureViewModel.setProperty("/bMainIndicator", false);
    this._oConfigureViewModel.setProperty("/bShowMainIndicator", false);
    this._oConfigureViewModel.setProperty("/bRefresh", true);
    // this._oConfigureViewModel.setProperty("/bCardReady", false); //******testtttttt card ready for hide n show preview*/
    if (oConfCard) {
      var oSapCard = oConfCard["sap.card"];
      if (oSapCard.type === "Table") {
        var bDesktopMode = this._oConfigureViewModel.getProperty("/bDesktop");
        var oSegButton = bDesktopMode ? this.getView().byId('columnSegButton') : this.getView().byId('sdColumnSegButton');
        oSegButton.setSelectedKey("list");
        this.setColumnAndKPIValue(oConfCard, oSelectionView);
      } else if (oSapCard.type === "Analytical") {
        this._oConfigureViewModel.setProperty("/bShowHoCPage", true);
        this._callPreviewPage(oConfCard);
      }
    }
  },
  onColumnSearch: function(oEvent) {
    var sQuery = '';
    if (oEvent) {
      sQuery = oEvent.getSource().getValue();
    }
    var filter = new Filter("title", FilterOperator.Contains, sQuery);
    var aFilters = [];
    aFilters.push(filter);
    var oList = this.byId("insightsCardsEditColumnsListTable");
    var oBinding = oList.getBinding("items");
    oBinding.filter(aFilters, "Test");
  },
  onSegmentedSelectionChange: function (oEvent) {
    var bDesktopMode = this._oConfigureViewModel.getProperty("/bDesktop");
    var oSegmentedButton = bDesktopMode ? this.byId('columnSegButton') : this.byId('sdColumnSegButton') ,
    sSelectedKey = oSegmentedButton.getSelectedKey();
    if (sSelectedKey === "table") {
      var aListCardTest = Transformations.createListOptions(this._oConfigureViewModel.getProperty("/oConfCard"));
      var aCardTable = aListCardTest
      .filter(function(oCard) {
        if (oCard) {
          return oCard["sap.card"].type === "Table";
        }
      });
      if (aCardTable.length) {
        this._oConfigureViewModel.setProperty("/oConfCard", aCardTable[0]);
        var oColumns =  aCardTable[0]["sap.card"].content.row.columns;
        this._oConfigureViewModel.setProperty("/cardColumn", oColumns);
      }
    } else if (sSelectedKey === "list") {
      var aTabCardTest = Transformations.createTableOptions(this._oConfigureViewModel.getProperty("/oConfCard"));
      var aCardList = aTabCardTest
      .filter(function(oCard) {
        if (oCard) {
          return oCard["sap.card"].type === "List";
        }
      });
      if (aCardList.length) {
        this._oConfigureViewModel.setProperty("/oConfCard", aCardList[0]);
        var aAttributes =  aCardList[0]["sap.card"].content.item.attributes;
        this._oConfigureViewModel.setProperty("/cardColumn", aAttributes);
      }
    }
  },

  setColumnAndKPIValue: function(oCard) {
    var oSapCard = oCard["sap.card"];
    if (oSapCard.type === "Table") {
      var oColumns;
      oColumns =  oSapCard.content.row.columns;
      this._oConfigureViewModel.setProperty("/cardColumn", oColumns);
      var aVisibleColumns = oColumns
        .map(function(oCol) {
          oCol["visible"] = oCol["visible"] ? oCol["visible"] : false;
          return oCol;
        })
        .filter(function(oColumn) {
          return oColumn.visible;
        });
      this._oConfigureViewModel.setProperty(
        "/visibleColumnCount",
        aVisibleColumns.length
      );
      var aCardTest = Transformations.createTableOptions(this._oConfigureViewModel.getProperty("/oConfCard"));
          var aCardList = aCardTest
          .filter(function(oCard) {
              return oCard["sap.card"].type === "List";
          });
          if (aCardList.length) {
            this._oConfigureViewModel.setProperty("/oConfCard", aCardList[0]);
            var aAttributes =  aCardList[0]["sap.card"].content.item.attributes;
            this._oConfigureViewModel.setProperty("/cardColumn", aAttributes);
          }
    }
    this._callPreviewPage(oCard);

  },

   // function for drag and drop of pages section
   _onColumnDrop: function (oEvent) {
    var sInsertPosition = oEvent.getParameter("dropPosition"),
      oDragItem = oEvent.getParameter("draggedControl"),
      aDragItemPath = oDragItem.getBindingContextPath().split("/"),
        // to get the index of element - with getBindingContextPath will get a string like "/cardColumn/12"
      iDragItemIndex = Number(aDragItemPath[2]),
      oDropItem = oEvent.getParameter("droppedControl"),
      aDropItemPath = oDropItem.getBindingContextPath().split("/"),
      iDropItemIndex = Number(aDropItemPath[2]),
      oColumns = this._oConfigureViewModel.getProperty("/cardColumn");

      if (sInsertPosition === "Before" && iDragItemIndex === iDropItemIndex - 1) {
          iDropItemIndex--;
      } else if (sInsertPosition === "After" && iDragItemIndex === iDropItemIndex + 1) {
          iDropItemIndex++;
      }

      if (iDragItemIndex !== iDropItemIndex) {
          if (sInsertPosition === "Before" && iDragItemIndex < iDropItemIndex) {
              iDropItemIndex--;
          } else if (sInsertPosition === "After" && iDragItemIndex > iDropItemIndex) {
              iDropItemIndex++;
          }
          // take the moved item from dragIndex and add to dropindex
          var oItemMoved = oColumns.splice(iDragItemIndex, 1)[0];
          oColumns.splice(iDropItemIndex, 0, oItemMoved);
          this._oConfigureViewModel.setProperty("/cardColumn",oColumns);
          //do auto refresh of card preview in desktop when columns selection change
          if (this._oConfigureViewModel.getProperty("/bDesktop") === true) {
            this._callShowPreview(this._oConfigureViewModel.getProperty("/oConfCard"));
          }

      }
  },
  _callNextPage: function (oConfCard) {
    try {
      var oHoCPage = sap.ui.getCore().byId("hocViewPage");
      //get House of cards view
      if (oConfCard) {
        var oSapCard = oConfCard["sap.card"];
        if (oSapCard.type === "Table" || oSapCard.type === "List") {
          var bDesktopMode = this._oConfigureViewModel.getProperty("/bDesktop");
          var oSegButton = bDesktopMode ? this.getView().byId("columnSegButton") : this.getView().byId('sdColumnSegButton');
          if (!oSegButton.getSelectedKey()) {
            oSegButton.setSelectedKey("list");
          }
          if (!this._oConfigureViewModel.getProperty("/columnPage")) {
            this.getView().byId("columnSearch").setValue('');
            this.onColumnSearch();
          }
          this._oConfigureViewModel.setProperty("/oConfCard", oConfCard);
          var oConfPage = this.getView().byId("insightCardColumnPage");
          if (this._oConfigureViewModel.getProperty("/bDesktop")) {
            this.getView().byId("previewCard").refresh();
          } else {
            this.getView().byId("previewColCardSD").refresh();
          }
          this._oConfigureViewModel.setProperty("/columnPage", true);
          this.getView().byId("navCon").to(oConfPage); //TEST
        } else if (oSapCard.type === "Analytical") {
            if (oHoCPage) {
              oHoCPage.getController().showHouseOfCardsDialog(oConfCard);
              if (!this._oConfigureViewModel.getProperty("/bShowHoCPage")) {
                sap.ui.getCore().byId("chartTypeSearch").setValue('');
                oHoCPage.getController().onChartTypeSearch();
              }
              this.getView().byId("navCon").to(oHoCPage);
            } else {
                this._getHoCView().then(function(oHView) {
                  oHView.getController().showHouseOfCardsDialog(oConfCard);
                  this.getView().byId("navCon").to(oHView);
                }.bind(this));
            }

        } else {
          this._callPreview(oConfCard);
        }
      }
      this._oConfigureViewModel.setProperty("/bPreview", false);
    } catch (oError) {
      oLogger.error(oError.message);
      MessageToast.show(oError.message);
      throw new Error(oError);
    }

  },
  _formatTitle: function (sTitlePath) {
    var sTitleName = sTitlePath.replace("{","").replace("}","");
    return sTitleName;

  },
  handleKPIVisibilityToggle: function(oEvent, t) {
    var oEventParameters = oEvent.getSource();
    var bToggleValue = oEventParameters.getSelected();
    var oCard = this._oConfigureViewModel.getProperty("/oConfCard");
    var oSapCard = oCard["sap.card"];
    var sHeaderType = oSapCard.header.type;
    if (bToggleValue && sHeaderType !== "Numeric") {
      oSapCard.header.type = "Numeric";
    } else {
      oSapCard.header.type = "Default";
    }
    this._oConfigureViewModel.setProperty(
      "/bShowMainIndicator",
      bToggleValue
    );
  },
  handleColumnVisibilityToggle: function(oEvent) {
    var oEventParameters = oEvent.getSource();
    var sColumnPath = oEventParameters
      .getBindingContext("configureView")
      .getPath();
    var oColumn = this._oConfigureViewModel.getProperty(sColumnPath);
    var bToggleValue = oEventParameters.getSelected();
    oColumn["visible"] = bToggleValue;
    var oColumnCount = this._oConfigureViewModel.getProperty(
      "/visibleColumnCount"
    );
    this._oConfigureViewModel.setProperty(
      "/visibleColumnCount",
      bToggleValue ? oColumnCount + 1 : oColumnCount - 1
    );
    this._oConfigureViewModel.setProperty("/bRefresh", true);
    //do auto refresh of card preview in desktop when columns selection change
    if (this._oConfigureViewModel.getProperty("/bDesktop") === true) {
      this._callShowPreview(this._oConfigureViewModel.getProperty("/oConfCard"));
    }
  },

  navigateToCopy: function(oCard) {
    var oConfigureCard = JSON.parse(
      JSON.stringify(
        this._oConfigureViewModel.getProperty("/oOrginalManifest")
      )
    );
    oConfigureCard.descriptorContent = JSON.parse(JSON.stringify(oCard));
    var oPage = this.oSelectionController.byId("insightsCopyCardView");
    this.oNavCon.to(oPage);
    oPage.getController().initCopyCard(oConfigureCard);
  },
  onNavBack: function() {
    var oPreviewPageId = this.getView().byId("insightCardPreviewPage").sId;
    var oConfView = this.getView().byId("navCon").getCurrentPage().getModel("configureView");
    if (oPreviewPageId ===  this.getView().byId("navCon").getPreviousPage().sId) {
      if (oConfView && oConfView.getProperty("/oConfCard")) {
        this._callPreviewPage(oConfView.getProperty("/oConfCard"));
      } else {
        this._callPreviewPage();
      }
    }
  }
});
});

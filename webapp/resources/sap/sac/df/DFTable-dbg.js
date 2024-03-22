/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/
sap.ui.define("sap/sac/df/DFTable", [
  "sap/ui/core/Control",
  "sap/base/Log",
  "sap/sac/df/firefly/library"
], function (Control, Log, FF) {
  var EMPTY_DP = "FA.EMPTY_DP";
  /**
   * Constructor for a new <code>DFTable</code> control.
   *
   * @class DFTable A Table control based on Multidimensional Model
   * @private
   * @experimental
   * @extends sap.ui.core.Control
   *
   * @author SAP SE
   * @version 1.115.0
   *
   * @constructor
   * @private
   * @alias sap.sac.df.DFTable
   */
  var DFTable = Control.extend("sap.sac.df.DFTable",/** @lends sap.ui.core.Control.prototype */ {
    metadata: {
      library: "sap.sac.df",
      properties: {
        /**
         * Name of the Data Provider within {sap.sac.df.olap.MultiDimModel}
         * which is displayed and available for interactions
         */
        dataProviderName: {
          type: "string"
        },
        /**
         * Name of the Multi dimensional model {sap.sac.df.olap.MultiDimModel}
         */
        multiDimModelId: {
          type: "string",
          defaultValue: "om"
        },
        /**
         * Whether the table is enabled or not
         */
        enabled: {
          type: "boolean",
          defaultValue: false
        },
        /**
         * Width of the table
         */
        width: {
          type: "sap.ui.core.CSSSize",
          defaultValue: "100%"
        },
        /**
         * Height of the table
         */
        height: {
          type: "sap.ui.core.CSSSize",
          defaultValue: "100%"
        },
      }
    },

    //##############-------- CONTROL LIFECYCLE METHODS -----------###############

    renderer: {
      apiVersion: 2,
      render: function render(oRm, oControl) {
        // Just render a placeholder div.
        // onAfterRendering will inject the Interactive table view as a child.
        oRm
          .openStart("div", oControl)
          .class("sapUiZenDFTable")
          .style("opacity", oControl._getOpacity())
          .style("zIndex", oControl._getZIndex())
          .style("height", oControl.getHeight())
          .style("width", oControl.getWidth())
          .openEnd()
          .close("div");
      }
    },

    onAfterRendering: function () {
      if (Control.prototype.onAfterRendering) {
        Control.prototype.onAfterRendering.apply(this, arguments);
      }

      if (this.mInnerTable) {
        this._updateQueryManager();
        this._attachInnerTableToControl();
      } else {
        Log.info("DF: Start - DFTable - onAfterRendering");
        this.setBusy(true);
        this._loadMultiDimModel()
          .then(this._setDataProvider.bind(this))
          .then(this._initInnerTable.bind(this))
          .finally(function () {
            this.setBusy(false);
            Log.info("DF: End - DFTable - onAfterRendering");
          }.bind(this));
      }
    },

    exit: function () {
      if (this.mInnerTable) {
        var oTableView = this.mInnerTable.getView();
        oTableView.getNativeControl().destroy();
        oTableView.destroy();
        if (this.mInnerTable.destroyView) {
          this.mInnerTable.destroyView();
        }
        this.mRootControl.destroy();
      }
      delete this.mInnerTable;
      delete this.mRootControl;
      delete this.mDataProviderInstance;

      Control.prototype.exit.apply(this, arguments);
    },

    //##############-------- UTILITY METHODS -----------###############

    /**
     * Refresh the contents of the table.
     */
    refresh: function () {
      if (this.mInnerTable) {
        this.mInnerTable.refreshView();
        this.setEnabled(true);
      }
    },

    /**
     * Clear the contents of the table.
     */
    clear: function () {
      if (this.mInnerTable) {
        this.mInnerTable.clearTable();
      }
    },

    //-------- Setter methods
    /**
     * Sets the data provider name.
     * @param sName the data provider name.
     */
    setDataProviderName: function (sName) {
      if (!sName) {
        sName = EMPTY_DP;
      } else if (sName.startsWith("$")) {
        sName = this._getUrlParams("dataProviderName");
      }

      var sOldDPName = this.getDataProviderName();
      if (sOldDPName === sName) {
        return;
      }

      this._setDataProvider()
        .catch(function (oError) {
          Log.error(oError);
        });
      this.setEnabled(false);
      this.setProperty("dataProviderName", sName, true);
    },

    /**
     * Sets whether the control is enabled for interaction
     * @param bIsEnabled the enabled state
     */
    setEnabled: function (bIsEnabled) {
      this.setProperty("enabled", bIsEnabled, true);
      var oDomElement = document.getElementById(this.getId());
      if (oDomElement) {
        oDomElement.style.opacity = this._getOpacity();
        oDomElement.style.zIndex = this._getZIndex();
      }
    },

    /**
     * Sets whether the control is busy
     * @param bIsBusy the busy state
     */
    setBusy: function (bIsBusy) {
      if (this.mInnerTable) {
        this.mInnerTable.setBusy(bIsBusy);
      }
    },

    //##############-------- PRIVATE METHODS -----------###############

    //----------- Getters
    _getOpacity: function () {
      return this.getEnabled() ? "1" : "0.4";
    },

    _getZIndex: function () {
      return this.getEnabled() ? "1" : "-1";
    },

    _getMultiDimModel: function () {
      return this.getModel(this.getMultiDimModelId());
    },

    _getUrlParams: function (key) {
      return (window.location.href.split(key + "=")[1] || "").split("&")[0];
    },

    _getFireflyUiManager: function (oModel) {
      var oSession = oModel.getSession();
      oSession.openSubSystem(FF.SubSystemType.GUI);
      return oSession.getSubSystem(FF.SubSystemType.GUI);
    },

    //--------- Inner table related methods.
    _attachInnerTableToControl: function () {
      if (this.mRootControl) {
        var oTableDiv = this.$();
        if(oTableDiv.children().length === 0) {
          oTableDiv.css("position", "relative");
          this.mRootControl.renderIntoAnchor(this.getId(), oTableDiv[0]);
        }
      }
    },

    _initInnerTable : function () {
      var oModel = this._getMultiDimModel();
      if (oModel) {
        var oUiManager = this._getFireflyUiManager(oModel);
        this.mRootControl = oUiManager.newBasicControl(FF.UiType.ROOT, null, this.getId() + "--inner_tbl_cont", "Interactive table container");
        var oGenesis = FF.UiGenesis.create(this.mRootControl);
        // Instantiate Firefly table view under the root control.
        this.mInnerTable = FF.AuGdsQbInteractiveTableView.create(oGenesis);
        this.mInnerTable.setLocalizationProvider(FF.UiLocalizationCenter.getCenter());
        oGenesis.setRoot(this.mInnerTable.getView());
        if(this.mDataProviderInstance) {
          this._updateQueryManager();
          this._attachInnerTableToControl();
        } else {
          Log.info("Data provider is not initialized. No Data to be shown.");
        }
      } else {
        Log.info("Could not retrieve MultiDimModel. Failed to initialize DFTable.");
      }
    },

    //---------- Data provider related methods.
    _loadMultiDimModel: function () {
      Log.info("DF: Start - model initialize");
      return Promise.resolve().then(function () {
        var oModel = this._getMultiDimModel();
        if(oModel) {
          oModel.attachEvent("queryAdded", null, this._onQueryAdded, this);
          return oModel.loaded();
        }
        return Promise.reject("DF: MultiDimModel is not initialized");
      }.bind(this));
    },

    _onQueryAdded: function(oEvent) {
      var sDPName = oEvent.getParameter("dataProviderName");
      // update DataProvider instance
      if (sDPName === this.getDataProviderName()) {
        return this._setDataProvider();
      }
    },

    _setDataProvider: function () {
      return Promise.resolve().then(function () {
        Log.info("DF: Set Data provider");
        var sDPName = this.getDataProviderName();
        if (sDPName) {
          if (sDPName === EMPTY_DP) {
            Log.info("DF: Updated - Data provider to null");
            this.mDataProviderInstance = null;
          } else {
            var oModel = this._getMultiDimModel();
            if(oModel) {
              this.mDataProviderInstance = oModel.getDataProvider(sDPName);
              if (this.mDataProviderInstance) {
                Log.info("DF: Updated - Data provider to " + sDPName);
                this._updateQueryManager();
                this._attachInnerTableToControl();
              } else {
                Log.info("DF: No Data provider found.");
              }
            } else {
              Log.info("DF: MultiDimModel is not initialized.");
            }
          }
          return Promise.resolve(null);
        } else {
          throw new Error("Data provider name must be specified");
        }
      }.bind(this));
    },

    _updateQueryManager: function () {
      if (this.mInnerTable) {
        var oQueryManager = null;
        if (this.mDataProviderInstance) {
          oQueryManager = this.mDataProviderInstance.getQueryManager();
        }
        Log.info("DF: Updated - Query manager of DFTable");
        this.mInnerTable.queryManagerUpdated(oQueryManager);
      }
    },
  });

  return DFTable;
});

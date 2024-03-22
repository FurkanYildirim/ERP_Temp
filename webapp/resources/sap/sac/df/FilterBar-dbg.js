/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define("sap/sac/df/FilterBar", [
  "sap/ui/mdc/FilterBar",
  "sap/sac/df/variablebar/FilterBarHandler"
], function (FilterBar, FilterBarHandler) {

  /**
   * Constructor for a new Filter Bar.
   *
   * @class A FilterBar control based on Multidimensional Model
   * @private
   * @experimental
   * @extends sap.ui.mdc.FilterBar
   *
   * @author SAP SE
   * @version 1.115.0
   *
   * @constructor
   * @private
   * @alias sap.sac.df.FilterBar
   */
  var DFFilterBar = FilterBar.extend("sap.sac.df.FilterBar",/** @lends sap.sac.df.FilterBar.prototype */ {
    metadata: {
      library: "sap.sac.df",
      properties: {
        /**
         * ID of multiDimModel
         **/
        multiDimModelId: {
          type: "string",
          defaultValue: "om"
        },
        /**
         * Mode
         **/
        mode: {
          type: "string",
          defaultValue: "VariablesOfDataProvider"
        }
      },
      events: {
        /**
				 * Fires before update variable of multidimension model after input value or open value help of variable.
				 */
        beforeFilterChange: {
          parameters: {
            /**
						 * Indicates whether value help dialog is going to open.
						 */
            beforeValueHelpOpen: {type : "boolean"}
          }
        },
        /**
				 * Fires when cancel change in the value help dialog.
				 */
        cancelFilterChange: {}
      },
      publicMethods: [
        /**
         * Initialise Filter Bar after meta data is loaded
         **/
        "initialiseFilterBar"
      ]
    },
    renderer: "sap.ui.mdc.FilterBarRenderer",

    init: function () {
      if (FilterBar.prototype.init) {
        FilterBar.prototype.init.apply(this, arguments);
      }
      this.setP13nMode(["Item", "Value"]);
      this.setDelegate({name: "sap/sac/df/variablebar/FilterBarDelegate"});

    },

    _getMultiDimModel: function () {
      var oModel = this.getModel();
      return oModel ? oModel : this.getParent().getModel(this.getMultiDimModelId());
    },

    initialiseFilterBar: function (oModel) {
      var that = this;
      oModel ? this.setModel(oModel) : this.setModel(this._getMultiDimModel());
      this._oFilterBarHandler = FilterBarHandler.initialise(that);
    }
  });

  return DFFilterBar;
});

/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/

// To enable the loading of our thirdparty grid bundle and also get access to the exported objects,
// we have to tell ui5 what the bundle exports globally and ues a shim for this.
sap.ui.loader.config({
  async: true,
  shim: {
    "sap/sac/df/thirdparty/sac.internal.grid.main.2.3.0-5ce62ed29d6c40846369eb8b6bca193a80d45dfb": {
      amd: true,
      exports: "sapSacGrid" // name of the global variable under which we export our external API
    },
    "sap/sac/df/thirdparty/interact":{
      amd: true,
      exports: "interact"
    }
  }
});

/**
 * Initialization Code and shared classes of library sap.sac.df.
 */
sap.ui.define(
  [
    "sap/sac/df/types/SystemType",
    "sap/sac/df/thirdparty/sac.internal.grid.main.2.3.0-5ce62ed29d6c40846369eb8b6bca193a80d45dfb",
    "sap/sac/df/thirdparty/interact",
    "sap/ui/core/library",
    "sap/ui/layout/library",
    "sap/ui/layout/cssgrid/GridBasicLayout",
    "sap/ui/table/library",
    "sap/f/library",
    "sap/m/library",
    "sap/sac/df/utils/FpaIcons"
  ],
  function (
    SystemType, sapSacGrid
  ) {
    /**
     * Dragonfly Library.  Provides models and control to access Multidimensional Data via InA protocol and Firefly library
     *
     * @namespace
     * @alias sap.sac.df
     * @public
     * @experimental
     * @author SAP SE
     * @version 1.115.0
     */

    var thisLib = sap.ui.getCore().initLibrary(
      {
        name: "sap.sac.df",
        dependencies: [
          "sap.ui.core",
          "sap.ui.layout",
          "sap.ui.table",
          "sap.m",
          "sap.ui.mdc",
          "sap.ui.fl",
          "sap.tnt"
        ],
        components: [],
        types: [
          "sap.sac.df.types.SystemType"
        ],
        interfaces: [],
        controls: [
          "sap.sac.df.DFProgram",
          "sap.sac.df.FlexAnalysis"
        ],
        models: [
          "sap.sac.df.olap.MultiDimModel",
          "sap.sac.df.DFKernel"
        ],
        elements: [
          "sap.sac.df.FlexAnalysisPanel"
        ],
        version: "1.115.0",
        extensions: {
          flChangeHandlers: {
            "sap.sac.df.FilterBar": "sap/ui/mdc/flexibility/FilterBar"
          }
        }
      }
    );

    thisLib.types = {};
    /**
     *  @alias sap.sac.df.types.SystemType
     */
    thisLib.types.SystemType = SystemType;

    window.sactable = sapSacGrid;
    return thisLib;
  }
);

/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.loader.config({async:true,shim:{"sap/sac/df/thirdparty/sac.internal.grid.main.2.3.0-5ce62ed29d6c40846369eb8b6bca193a80d45dfb":{amd:true,exports:"sapSacGrid"},"sap/sac/df/thirdparty/interact":{amd:true,exports:"interact"}}});sap.ui.define(["sap/sac/df/types/SystemType","sap/sac/df/thirdparty/sac.internal.grid.main.2.3.0-5ce62ed29d6c40846369eb8b6bca193a80d45dfb","sap/sac/df/thirdparty/interact","sap/ui/core/library","sap/ui/layout/library","sap/ui/layout/cssgrid/GridBasicLayout","sap/ui/table/library","sap/f/library","sap/m/library","sap/sac/df/utils/FpaIcons"],function(a,s){var e=sap.ui.getCore().initLibrary({name:"sap.sac.df",dependencies:["sap.ui.core","sap.ui.layout","sap.ui.table","sap.m","sap.ui.mdc","sap.ui.fl","sap.tnt"],components:[],types:["sap.sac.df.types.SystemType"],interfaces:[],controls:["sap.sac.df.DFProgram","sap.sac.df.FlexAnalysis"],models:["sap.sac.df.olap.MultiDimModel","sap.sac.df.DFKernel"],elements:["sap.sac.df.FlexAnalysisPanel"],version:"1.115.0",extensions:{flChangeHandlers:{"sap.sac.df.FilterBar":"sap/ui/mdc/flexibility/FilterBar"}}});e.types={};e.types.SystemType=a;window.sactable=s;return e});
//# sourceMappingURL=library.js.map
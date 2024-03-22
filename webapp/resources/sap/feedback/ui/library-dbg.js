"use strict";

sap.ui.define(["sap/ui/core/library", "sap/ui/core/Core"], function (sap_ui_core_library, Core) {
  // delegate further initialization of this library to the Core
  var thisLib = /* sap.ui.getCore() */Core.initLibrary({
    name: 'sap.feedback.ui',
    dependencies: ['sap.ui.core'],
    interfaces: [],
    elements: [],
    noLibraryCSS: true,
    version: '1.115.0'
  });
  return thisLib;
});
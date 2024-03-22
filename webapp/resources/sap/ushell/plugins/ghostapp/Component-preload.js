//@ui5-bundle sap/ushell/plugins/ghostapp/Component-preload.js
sap.ui.require.preload({
	"sap/ushell/plugins/ghostapp/Component.js":function(){
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/generic/app/AppComponent"],function(e){"use strict";return e.extend("sap.ushell.plugins.ghostapp.Component",{metadata:{manifest:"json",library:"sap.ushell"}})});
},
	"sap/ushell/plugins/ghostapp/FakeModel.js":function(){
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/model/odata/v2/ODataModel"],function(e){"use strict";var t=e.extend("sap.ushell.plugins.ghostapp.FakeModel",{constructor:function(t,a){e.apply(this,arguments);this.setDeferredGroups(["undefined",this.sDefaultChangeGroup])},setDeferredGroups:function(){e.prototype.setDeferredGroups.apply(this,arguments);this.mDeferredGroups.undefined="undefined"}});t.getMetadata().getName=function(){return"sap.ui.model.odata.v2.ODataModel"};return t});
},
	"sap/ushell/plugins/ghostapp/manifest.json":'{"_version":"1.2.0","sap.app":{"_version":"1.2.0","id":"sap.ushell.plugins.ghostapp","i18n":"i18n/i18n.properties","type":"application","applicationVersion":{"version":"11.7.0-SNAPSHOT"},"title":"Warmup Application","description":"List report app for code warm-up during idle time","tags":{"keywords":[]},"ach":"MM-FIO-IM-SGM","dataSources":{"mainService":{"uri":"/ghostapp-c9f1f0bd-ff78-4660-9a1f-295814f00fe0/","settings":{"localUri":"localService/metadata.xml"}}},"offline":false,"resources":"resources.json","sourceTemplate":{"id":"ui5template.smarttemplate","version":"1.0.0"}},"sap.fiori":{"_version":"1.1.0","registrationIds":["F0000"],"archeType":"analytical"},"sap.ui":{"_version":"1.1.0","technology":"UI5","icons":{"icon":"","favIcon":"","phone":"","phone@2":"","tablet":"","tablet@2":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true},"supportedThemes":["sap_hcb","sap_bluecrystal"]},"sap.ui5":{"_version":"1.1.0","services":{"ShellUIService":{"factoryName":"sap.ushell.plugins.appwarmup.ShellUIService"}},"resources":{"js":[],"css":[]},"config":{"sapFiori2Adaptation":true},"dependencies":{"minUI5Version":"1.53.0-SNAPSHOT","libs":{"sap.ui.core":{},"sap.m":{"lazy":false},"sap.ui.comp":{"lazy":false},"sap.ui.generic.app":{"minVersion":"1.34.0"},"sap.uxap":{"lazy":false},"sap.suite.ui.generic.template":{}}},"models":{"":{"dataSource":"mainService","preload":true,"type":"sap.ushell.plugins.ghostapp.FakeModel","settings":{"defaultBindingMode":"TwoWay","defaultCountMode":"Inline","tokenHandling":false,"refreshAfterChange":false}}},"extends":{"extensions":{}},"contentDensities":{"compact":true,"cozy":true},"componentName":"sap.ushell.plugins.ghostapp"},"sap.ui.generic.app":{"_version":"1.1.0","settings":{"ghostapp":true},"pages":[{"entitySet":"MaterialMultiStockByDates","component":{"name":"sap.suite.ui.generic.template.ListReport","list":true,"settings":{"smartVariantManagement":true}}}]},"sap.platform.abap":{"_version":"1.1.0","uri":"/sap/bc/ui5_ui5/sap/stock_multimas1"},"sap.platform.hcp":{"_version":"1.1.0","uri":""},"sap.copilot":{"_version":"1.0.0","contextAnalysis":{"allowAddingObjectsFromAppScreenToCollection":false}}}'
});
//# sourceMappingURL=Component-preload.js.map
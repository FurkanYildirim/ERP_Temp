// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["./abap.configure.ushell","./abap.load.launchpad","./boottask","sap/ushell/bootstrap/common/common.configure.ui5","sap/ushell/bootstrap/common/common.configure.ui5.extractLibs","sap/ushell/bootstrap/common/common.load.bootstrapExtension","sap/ushell/bootstrap/common/common.debug.mode","sap/ushell/bootstrap/common/common.load.core-min"],function(a,o,s,l,e,t,p,m){"use strict";var n;window["sap-ui-debug"]=p.isDebug();n=a();l({ushellConfig:n,libs:e(n),theme:"sap_belize",platform:"abap",platformAdapters:{abap:"sap.ushell_abap.adapters.abap",hana:"sap.ushell_abap.adapters.hana"},bootTask:s.start,onInitCallback:o});m.load(n.ushell.customPreload);t(n)});
//# sourceMappingURL=abap-def.js.map
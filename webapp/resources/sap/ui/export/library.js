/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
sap.ui.define(["sap/ui/core/library"],function(e){"use strict";var r=sap.ui.getCore().initLibrary({name:"sap.ui.export",dependencies:["sap.ui.core"],types:["sap.ui.export.EdmType","sap.ui.export.FileType"],interfaces:[],controls:[],elements:[],version:"1.115.1"});r.EdmType={BigNumber:"BigNumber",Boolean:"Boolean",Currency:"Currency",Date:"Date",DateTime:"DateTime",Enumeration:"Enumeration",Number:"Number",Percentage:"Percentage",String:"String",Time:"Time"};r.FileType={CSV:"CSV",GSHEET:"GSHEET",PDF:"PDF",XLSX:"XLSX"};r.Destination={LOCAL:"LOCAL",REMOTE:"REMOTE"};sap.ui.loader.config({shim:{"sap/ui/export/js/XLSXBuilder":{amd:true,exports:"XLSXBuilder"},"sap/ui/export/js/XLSXExportUtils":{amd:true,exports:"XLSXExportUtils"}}});return r});
//# sourceMappingURL=library.js.map
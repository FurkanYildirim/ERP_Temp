/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define("sap/sac/df/types/export/PDFConfig",["sap/ui/base/ManagedObject","sap/sac/df/firefly/library"],function(e,t){"use strict";return e.extend("sap.sac.df.types.export.PDFConfig",{metadata:{properties:{pageSize:{type:"string",defaultValue:"a4"},fontSize:{type:"number",defaultValue:6},orientation:{type:"string",defaultValue:"landscape"},builtInFont:{type:"string",defaultValue:"Helvetica"},autoSize:{type:"boolean",defaultValue:true},freezeRows:{type:"number"},numberLocation:{type:"string"},enablePdfAppendix:{type:"boolean",defaultValue:false}}},getFireflyConfig:function(e){var i=t.PdfConfig.createDefault(t.PrFactory.createStructure(),e);i.setPageSize(this.getPageSize());i.setFontSize(this.getFontSize());i.setOrientation(this.getOrientation());i.setBuiltInFont(this.getBuiltInFont());i.setAutoSize(this.getAutoSize());i.setFreezeRows(this.getFreezeRows());i.setNumberLocation(this.getNumberLocation());i.setEnablePdfAppendix(this.getEnablePdfAppendix());return i},PAGE_SIZE_LEGAL:t.PdfConfig.PAGE_SIZE_LEGAL,PAGE_SIZE_LETTER:t.PdfConfig.PAGE_SIZE_LETTER,PAGE_SIZE_A5:t.PdfConfig.PAGE_SIZE_A5,PAGE_SIZE_A4:t.PdfConfig.PAGE_SIZE_A4,PAGE_SIZE_A3:t.PdfConfig.PAGE_SIZE_A3,PAGE_SIZE_A2:t.PdfConfig.PAGE_SIZE_A2,PDF_ORIENT_LANDSCAPE:t.PdfConfig.PDF_ORIENT_LANDSCAPE,PDF_ORIENT_PORTRAIT:t.PdfConfig.PDF_ORIENT_PORTRAIT,PAGE_NUMBER_LOC_FOOTER:t.PdfConfig.PAGE_NUMBER_LOC_FOOTER,PAGE_NUMBER_LOC_HEADER:t.PdfConfig.PAGE_NUMBER_LOC_HEADER,PAGE_NUMBER_LOC_NONE:t.PdfConfig.PAGE_NUMBER_LOC_NONE})});
//# sourceMappingURL=PDFConfig.js.map
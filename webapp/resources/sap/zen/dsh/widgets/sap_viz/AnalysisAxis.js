/*
 * SAPUI5
  (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log","sap/zen/dsh/widgets/sap_viz/DimensionLabels","sap/zen/dsh/widgets/sap_viz/funcUtils","sap/zen/dsh/widgets/sap_viz/typeUtils"],function(e,i,s,n){"use strict";e.info("Load AnalysisAxis");var t=function(e){this._dimensionLabels=[];this.init(e)};t.prototype.init=function(e){for(var s=0;s<e.length;s++){this._dimensionLabels[s]=new i(e[s]["name"],e[s]["type"]?e[s]["type"]:"Dimension",e[s]["values"]);this._dimensionLabels[s].fake(e[s]["isFake"]?e[s]["isFake"]:false);this._dimensionLabels[s].infos(e[s]["infos"]?e[s]["infos"]:null)}};t.prototype.getDimensionLabels=function(){return this._dimensionLabels};t.prototype.getType=function(){return"analysisAxis"};t.prototype.validate=function(){var e=1;var i=this.getDimensionLabels();if(i.length===0){s.error("IDS_ERROR_DIMENSION_NOT_ZERO")}for(var t=0;t<i.length;t++){if(t===0){e=i[t].getValues().length;if(n.isExist(i[t].infos())&&e!==i[t].infos().length){s.error("IDS_ERROR_DIMENSION_WRONG_COUNT")}}else{if(e!==i[t].getValues().length){s.error("IDS_ERROR_DIMENSION_WRONG_LABELS_COUNT")}if(n.isExist(i[t].infos())&&e!==i[t].infos().length){s.error("IDS_ERROR_DIMENSION_WRONG_COUNT")}}}return e};t.prototype.hasFakeData=function(){var e=this.getDimensionLabels();for(var i=0;i<e.length;i++){if(e[i].fake()){return true}}return false};return t});
//# sourceMappingURL=AnalysisAxis.js.map
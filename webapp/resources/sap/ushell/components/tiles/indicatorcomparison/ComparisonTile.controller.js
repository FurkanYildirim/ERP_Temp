// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/components/tiles/generic","sap/m/library","sap/ui/thirdparty/jquery","sap/base/Log"],function(e,i,jQuery,t){"use strict";var a=i.DeviationIndicator;var o=i.ValueColor;var l=i.Size;var s=i.LoadState;var n=i.FrameType;var r=e.extend("sap.ushell.components.tiles.indicatorcomparison.ComparisonTile",{onInit:function(){this.KPI_VALUE_REQUIRED=false},_processDataForComparisonChart:function(e,i,t){var a=[],o={},l,s,n;var r;var T=[];var E=this;var c=null;for(l=0;l<e.results.length;l++){var u=e.results[l]}T=sap.ushell.components.tiles.indicatorTileUtils.util.getAllMeasuresWithLabelText(this.oTileApi.url.addSystemToServiceUrl(this.oConfig.EVALUATION.ODATA_URL),this.oConfig.EVALUATION.ODATA_ENTITYSET);for(l=0,n=T.length;l<n;l++){s=T[l];o[s.key]=s.value}var h=E.oConfig.TILE_PROPERTIES.COLUMN_NAMES||E.oConfig.EVALUATION.COLUMN_NAMES;for(l=0;l<h.length;l++){var p={};var C=h[l];p.value=Number(u[C.COLUMN_NAME]);var f=Number(u[C.COLUMN_NAME]);var I=false;var L=0;var d=E._getEvaluationThresholdMeasures();var A=d?Array.prototype.indexOf.call(d,C.COLUMN_NAME):-1;if(A>-1){I=true;L=E.oConfig.EVALUATION.SCALING}if(E.oConfig.EVALUATION.SCALING==-2&&I){f*=100}var g=E.isCurrencyMeasure(C.COLUMN_NAME);if(t&&t[l]&&u[t[l].name]){c=u[t[l].name]}r=sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(f,L,E.oConfig.EVALUATION.SCALING,E.oConfig.EVALUATION.DECIMAL_PRECISION,g,c);if(E.oConfig.EVALUATION.SCALING==-2&&I){r+=" %"}p.displayValue=r.toString();if(t){if(t[l]&&u[t[l].name]){p.displayValue+=" "+u[t[l].name]}}p.color=C.semanticColor;p.title=o[C.COLUMN_NAME]||C.COLUMN_NAME;p.measure=C.COLUMN_NAME;p.isCurM=g;a.push(p)}return a},fetchChartData:function(e,i,a,o){function l(e,i){var t=false;if(e&&e.results&&e.results.length){for(var a=0,o=i.length;a<o&&!t;a++){t=e.results[0][i[a].COLUMN_NAME]!==null}}return t}var s=this;try{var n=this.oConfig.EVALUATION.ODATA_ENTITYSET;var r=this.oConfig.EVALUATION.COLUMN_NAME;var T=r,E;if(this.oConfig.TILE_PROPERTIES.COLUMN_NAMES){for(E=0;E<this.oConfig.TILE_PROPERTIES.COLUMN_NAMES.length;E++){if(this.oConfig.TILE_PROPERTIES.COLUMN_NAMES[E].COLUMN_NAME!=this.oConfig.EVALUATION.COLUMN_NAME){T=T+","+this.oConfig.TILE_PROPERTIES.COLUMN_NAMES[E].COLUMN_NAME}}}else{for(E=0;E<this.oConfig.EVALUATION.COLUMN_NAMES.length;E++){if(this.oConfig.EVALUATION.COLUMN_NAMES[E].COLUMN_NAME!=this.oConfig.EVALUATION.COLUMN_NAME){T=T+","+this.oConfig.EVALUATION.COLUMN_NAMES[E].COLUMN_NAME}}}var c=sap.ushell.components.tiles.indicatorTileUtils.util.getBoolValue(e);var u=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(s.oConfig.TILE_PROPERTIES.id);if(sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(s.oConfig)){if(u){var h=u.Data&&JSON.parse(u.Data)}}var p=s.oTileApi.configuration.getParameterValueAsString("timeStamp");var C=sap.ushell.components.tiles.indicatorTileUtils.util.isCacheValid(s.oConfig.TILE_PROPERTIES.id,p,s.chipCacheTime,s.chipCacheTimeUnit,s.tilePressed);if(h&&!h.rightData||!u||!C&&s.oTileApi.visible.isVisible()||c||i&&s.oTileApi.visible.isVisible()||s.getView().getViewData().refresh){if(s.kpiValueFetchDeferred){s.kpiValueFetchDeferred=false;var f=sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.oConfig.EVALUATION_FILTERS,this.oConfig.ADDITIONAL_FILTERS);var I=sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(s.oRunTimeODataModel,n,T,null,f,3);this.comparisionChartODataRef=I.model.read(I.uri,null,null,true,function(e){s.kpiValueFetchDeferred=true;var i={};if(I.unit){i.unit=I.unit}if(l(e,s.oConfig.TILE_PROPERTIES.COLUMN_NAMES||s.oConfig.EVALUATION.COLUMN_NAMES)){s.oConfig.TILE_PROPERTIES.FINALVALUE=e;s.oConfig.TILE_PROPERTIES.FINALVALUE=s._processDataForComparisonChart(s.oConfig.TILE_PROPERTIES.FINALVALUE,T.split(",")[0],I.unit);i.data=s.oConfig.TILE_PROPERTIES.FINALVALUE;var t={};s.cacheTime=sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate();t.ChipId=s.oConfig.TILE_PROPERTIES.id;t.Data=JSON.stringify(i);t.CacheMaxAge=Number(s.chipCacheTime);t.CacheMaxAgeUnit=s.chipCacheTimeUnit;t.CacheType=1;var o=s.getLocalCache(t);s.updateDatajobScheduled=false;var n=s.oConfig.TILE_PROPERTIES.id+"data";var r=sap.ushell.components.tiles.indicatorTileUtils.util.getScheduledJob(n);if(r){clearTimeout(r);r=undefined}if(!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(s.oConfig)){sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(s.oConfig.TILE_PROPERTIES.id,o);var E=false;if(u){E=true}if(s.chipCacheTime){sap.ushell.components.tiles.indicatorTileUtils.util.writeFrontendCacheByChipAndUserId(s.oTileApi,s.oConfig.TILE_PROPERTIES.id,t,E,function(e){if(e){s.cacheTime=e&&e.CachedTime;sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(s.oConfig.TILE_PROPERTIES.id,e);s.setTimeStamp()}if(s.chipCacheTime&&!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(s.oConfig)){jQuery.proxy(s.setTimeStamp(s.cacheTime),s)}})}}else{var c=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(s.oConfig.TILE_PROPERTIES.id),h;if(c){if(!c.CachedTime){c.CachedTime=sap.ushell.components.tiles.indicatorTileUtils.util.getUTCDate()}h=c.Data;if(h){h=JSON.parse(h);h.rightData=i}c.Data=JSON.stringify(h);sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(s.oConfig.TILE_PROPERTIES.id,c)}else{h={};h.rightData=i;o.Data=JSON.stringify(h);sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(s.oConfig.TILE_PROPERTIES.id,o)}s.cacheWriteData=i}a.call(s,s.oConfig.TILE_PROPERTIES.FINALVALUE)}else if(e.results.length==0){s.oConfig.TILE_PROPERTIES.FINALVALUE=e;if(sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(s.oConfig.TILE_PROPERTIES.id)){i=sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(s.oConfig.TILE_PROPERTIES.id);i.data=e}else{i.data=e}sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(s.oConfig.TILE_PROPERTIES.id,i);a.call(s,s.oConfig.TILE_PROPERTIES.FINALVALUE);s.setNoData()}else{sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(s.oConfig.TILE_PROPERTIES.id,{empty:"empty"});s.setNoData()}},function(e){s.kpiValueFetchDeferred=true;if(e&&e.response){t.error(e.message+" : "+e.request.requestUri);o.call(s,e)}})}}else if(u&&u.Data){var L;var d=s.oConfig&&s.oConfig.TILE_PROPERTIES&&s.oConfig.TILE_PROPERTIES.tileType;if(d.indexOf("DT-")==-1){L=u.Data&&JSON.parse(u.Data)}else{L=u.Data&&JSON.parse(u.Data);L=L.rightData}s.cacheTime=u.CachedTime;if(s.chipCacheTime&&!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(s.oConfig)){jQuery.proxy(s.setTimeStamp(s.cacheTime),s)}if(L.data&&L.data.length){s.oConfig.TILE_PROPERTIES.FINALVALUE=L.data;a.call(s,s.oConfig.TILE_PROPERTIES.FINALVALUE)}else{s.oConfig.TILE_PROPERTIES.FINALVALUE=L.data;a.call(s,s.oConfig.TILE_PROPERTIES.FINALVALUE);s.setNoData()}}else{s.setNoData()}}catch(e){s.kpiValueFetchDeferred=true;o.call(s,e)}},doProcess:function(e,i){var t=this;this.setTextInTile();this.fetchChartData(e,i,function(e){this.CALCULATED_KPI_VALUE=e;this._updateTileModel({data:this.CALCULATED_KPI_VALUE});if(t.oConfig.TILE_PROPERTIES.frameType==n.TwoByOne){t.oKpiTileView.oGenericTile.setFrameType(n.TwoByOne);t.getView().getViewData().parentController._updateTileModel(this.getTile().getModel().getData());var i={};i.data=this.CALCULATED_KPI_VALUE;t.getView().getViewData().deferredObj.resolve()}else{t.oKpiTileView.oGenericTile.setFrameType(n.OneByOne);t.oKpiTileView.oGenericTile.removeAllTileContent();t.oKpiTileView.oGenericTile.addTileContent(t.oKpiTileView.oNVConfS);this.oKpiTileView.oGenericTile.setState(s.Loaded)}this.setToolTip(null,this.CALCULATED_KPI_VALUE,"COMP");if(this.chipCacheTime&&!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(this.oConfig)){sap.ushell.components.tiles.indicatorTileUtils.util.scheduleFetchDataJob.call(this,this.oTileApi.visible.isVisible())}},this.logError)},doDummyProcess:function(){var e=this;this.setTextInTile();e._updateTileModel({value:8888,size:l.Auto,frameType:n.OneByOne,state:s.Loading,valueColor:o.Error,indicator:a.None,title:"Liquidity Structure",footer:"Current Quarter",description:"Apr 1st 2013 (B$)",data:[{title:"Measure 1",value:1.2,color:"Good"},{title:"Measure 2",value:.78,color:"Good"},{title:"Measure 3",value:1.4,color:"Error"}]});this.oKpiTileView.oGenericTile.setState(s.Loaded)}});return r});
//# sourceMappingURL=ComparisonTile.controller.js.map
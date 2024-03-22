// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/resources","sap/base/util/ObjectPath","sap/ui/thirdparty/jquery","sap/ushell/library","sap/ushell/utils/chipsUtils","sap/base/Log","sap/ushell/Config"],function(i,t,jQuery,e,a,o,r){"use strict";var l=e.DisplayFormat;function n(){this.S_COMPONENT_NAME="sap.ushell.services.VisualizationDataProvider";this._init.apply(this,arguments)}n.prototype._init=function(i){this.oLaunchPageAdapter=i;this.oCatalogTilePromise=null};n.prototype._getCatalogTileIndex=function(){if(this._oCatalogTileIndexPromise){return this._oCatalogTileIndexPromise}var i=this.oLaunchPageAdapter;return i._getCatalogTileIndex()};n.prototype._getCatalogTiles=function(){if(this.oCatalogTilePromise){return this.oCatalogTilePromise}var i=this.oLaunchPageAdapter;this.oCatalogTilePromise=new Promise(function(t,e){i.getCatalogs().then(function(a){var o=[];var l=[];var n=[];var s={};for(var u=0;u<a.length;u++){if(typeof a[u].ui2catalog==="undefined"||a[u].ui2catalog.getType()!=="REMOTE"){o.push(i.getCatalogTiles(a[u]).then(function(i){l.push(i)}))}}jQuery.when.apply(null,o).done(function(){n=[].concat.apply([],l);for(var e=0;e<n.length;e++){var a=i.getCatalogTileId(n[e]);if(r.last("/core/stableIDs/enabled")){a=i.getStableCatalogTileId(n[e])}s[a]=n[e]}t(s)}).fail(e)}).fail(e)});return this.oCatalogTilePromise};n.prototype.getVisualizationData=function(){var t;var e=this.oLaunchPageAdapter;if(this._oVisualizationDataPromise){return this._oVisualizationDataPromise}this._oVisualizationDataPromise=Promise.all([this._getCatalogTiles(),this._getCatalogTileIndex()]).then(function(i){var a=i[0];t=i[1];var o=Object.keys(a).filter(function(i){return e.isTileIntentSupported(a[i])}).map(function(i){var t=a[i];if(!e.getCatalogTilePreviewTitle(t)){return new Promise(function(i,a){e.getCatalogTileViewControl(t).done(i).fail(a)}).then(function(e){return{id:i,catalogTile:t,view:e}})}return Promise.resolve({id:i,catalogTile:t})});return Promise.all(o)}).then(function(i){return i.reduce(function(i,a){var o=a.id;var r=a.view;var l=a.catalogTile;var n=l.getChip().getBaseChipId();i.visualizations[o]={vizType:n,title:e.getCatalogTilePreviewTitle(l),subTitle:e.getCatalogTilePreviewSubtitle(l),icon:e.getCatalogTilePreviewIcon(l),info:e.getCatalogTilePreviewInfo(l),keywords:e.getCatalogTileKeywords(l),size:e.getCatalogTileSize(l),indicatorDataSource:e.getCatalogTilePreviewIndicatorDataSource(l),url:e.getCatalogTileTargetURL(l),numberUnit:e.getCatalogTileNumberUnit(l),isCustomTile:e.isCustomTile&&e.isCustomTile(l)};if(r){r.destroy()}if(t[o]){i.visualizations[o]._instantiationData={platform:"ABAP",simplifiedChipFormat:false,chip:t[o]}}if(i.visualizations[o].isCustomTile&&!i.vizTypes[n]){i.vizTypes[n]={id:n,url:undefined,vizOptions:{displayFormats:this._getDisplayFormats(l,i.visualizations[o].size)},tileSize:i.visualizations[o].size}}return i}.bind(this),{visualizations:{},vizTypes:{},page:{}})}.bind(this)).catch(function(t){var e={component:this.S_COMPONENT_NAME,description:i.i18n.getText("VisualizationDataProvider.CannotLoadData"),detail:t};return Promise.reject(e)}.bind(this));return this._oVisualizationDataPromise};n.prototype._getDisplayFormats=function(i,t){var e=["tile"];var a="tile";var o=i.getContract("types");if(o){e=o.getAvailableTypes();a=o.getDefaultType()}return{supported:this._mapDisplayFormats(e,t),default:this._mapDisplayFormats([a],t)[0]}};n.prototype._mapDisplayFormats=function(i,t){var e={tile:l.Standard,tilewide:l.StandardWide,link:l.Compact,flat:l.Flat,flatwide:l.FlatWide};return i.map(function(i){i=e[i];if(i===l.Standard&&t==="1x2"){return l.StandardWide}return i})};n.prototype.loadVizType=function(i){var t={chipId:i};return a.loadChipInstanceFromSimplifiedChip(t).then(function(t){var e=a.getTileSize(t);return{id:i,url:undefined,vizOptions:{displayFormats:this._getDisplayFormats(t,e)},tileSize:e}}.bind(this)).catch(function(t){o.error("The chipInstance '"+i+"' could not be loaded: ",t)})};n.hasNoAdapter=false;return n});
//# sourceMappingURL=VisualizationDataProvider.js.map
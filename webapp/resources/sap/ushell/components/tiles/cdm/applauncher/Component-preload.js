//@ui5-bundle sap/ushell/components/tiles/cdm/applauncher/Component-preload.js
sap.ui.require.preload({
	"sap/ushell/components/tiles/cdm/applauncher/Component.js":function(){
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/XMLView","sap/ui/core/UIComponent"],function(t,e){"use strict";return e.extend("sap.ushell.components.tiles.cdm.applauncher.Component",{metadata:{interfaces:["sap.ui.core.IAsyncContentCreation"]},createContent:function(){var e=this.getComponentData();var n=e.properties.tilePersonalization||{};var o=e.startupParameters;if(o&&o["sap-system"]){n["sap-system"]=o["sap-system"][0]}return t.create({viewName:"sap.ushell.components.tiles.cdm.applauncher.StaticTile",viewData:{properties:e.properties,configuration:n}}).then(function(t){this._oController=t.getController();t.getContent()[0].bindTileContent({path:"/properties",factory:this._oController._getTileContent.bind(this._oController)});return t}.bind(this))},tileSetVisualProperties:function(t){if(this._oController){this._oController.updatePropertiesHandler(t)}},tileRefresh:function(){},tileSetVisible:function(t){},tileSetEditMode:function(t){if(this._oController){this._oController.editModeHandler(t)}},exit:function(){this._oController=null}})});
},
	"sap/ushell/components/tiles/cdm/applauncher/StaticTile.controller.js":function(){
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ushell/library","sap/ui/core/mvc/Controller","sap/ushell/Config","sap/ushell/utils/WindowUtils","sap/ui/model/json/JSONModel","sap/m/library","sap/base/Log","sap/ushell/utils/UrlParsing"],function(e,t,i,r,o,n,s,a){"use strict";var l=n.GenericTileScope;var p=n.GenericTileMode;var c=e.DisplayFormat;var u=e.AppType;return t.extend("sap.ushell.components.tiles.cdm.applauncher.StaticTile",{_aDoables:[],_getConfiguration:function(){var e=this.getView().getViewData();e.properties.sizeBehavior=i.last("/core/home/sizeBehavior");e.properties.wrappingType=i.last("/core/home/wrappingType");return e},_setShowContentProviderInfoOnVisualizations:function(e,t,i){if(!e){i.setProperty("/properties/showContentProviderInfoOnVisualizations",false);return Promise.resolve()}return sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(e){return e.getSystemContext(t)}).then(function(e){i.setProperty("/properties/contentProviderLabel",e.label);i.setProperty("/properties/showContentProviderInfoOnVisualizations",true)}).catch(function(e){s.error("StaticTile.controller threw an error:",e)})},onInit:function(){var e=this.getView();var t=new o;t.setData(this._getConfiguration());e.setModel(t);this._aDoables.push(i.on("/core/home/sizeBehavior").do(function(e){t.setProperty("/properties/sizeBehavior",e)}));var r=this.getView().getViewData();var n=r.properties;var s=r.properties.contentProviderId;n.mode=n.mode||(n.icon?"ContentMode":"HeaderMode");if(n.displayFormat===c.Compact&&n.title&&n.targetURL){t.setProperty("/properties/mode",p.LineMode)}switch(n.displayFormat){case c.Flat:t.setProperty("/properties/frameType","OneByHalf");break;case c.FlatWide:t.setProperty("/properties/frameType","TwoByHalf");break;case c.StandardWide:t.setProperty("/properties/frameType","TwoByOne");break;default:{t.setProperty("/properties/frameType","OneByOne")}}this._setShowContentProviderInfoOnVisualizations(i.last("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations"),s,t);this._aDoables.push(i.on("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations").do(function(e){this._setShowContentProviderInfoOnVisualizations(e,s,t)}.bind(this)))},onExit:function(){this._aDoables.forEach(function(e){e.off()});this._aDoables=[]},editModeHandler:function(e){var t=e?l.ActionMore:l.Display;this.getView().getModel().setProperty("/properties/scope",t)},onPress:function(e){var t=this.getView().getViewData().properties;if(e.getSource().getScope&&e.getSource().getScope()===l.Display){var o=this._createTargetUrl();if(!o){return}if(o[0]==="#"){hasher.setHash(o)}else{var n=i.last("/core/shell/enableRecentActivity")&&i.last("/core/shell/enableRecentActivityLogging");if(n){var s={title:t.title,appType:u.URL,url:t.targetURL,appId:t.targetURL};sap.ushell.Container.getRenderer("fiori2").logRecentActivity(s)}r.openURL(o,"_blank")}}},updatePropertiesHandler:function(e){var t=this.getView().getContent()[0];var i=t.getTileContent()[0];if(typeof e.title!=="undefined"){t.setHeader(e.title)}if(typeof e.subtitle!=="undefined"){t.setSubheader(e.subtitle)}if(typeof e.icon!=="undefined"){i.getContent().setSrc(e.icon)}if(typeof e.info!=="undefined"){i.setFooter(e.info)}},_createTargetUrl:function(){var e=this.getView().getViewData().properties.targetURL;var t=this.getView().getViewData().configuration["sap-system"];var i;if(e&&t){if(a.isIntentUrl(e)){i=a.parseShellHash(e);if(!i.params){i.params={}}i.params["sap-system"]=t;e="#"+a.constructShellHash(i)}else{e+=(e.indexOf("?")<0?"?":"&")+"sap-system="+t}}return e},_getLeanUrl:function(){return r.getLeanURL(this._createTargetUrl())},_getTileContent:function(e,t){var i=t.getPath().split("/");i.pop();var r=t.getProperty(i.join("/"));if(r!==this.oLastBindingObject||this.oTileContent&&this.oTileContent.bIsDestroyed){this.oLastBindingObject=r;this.oTileContent=this.getView().byId(r.icon?"imageTileContent":"standardTileContent").clone()}return this.oTileContent},_getCurrentProperties:function(){var e=this.getView().getContent()[0];var t=e.getTileContent()[0];var r=i.last("/core/home/sizeBehavior");return{title:e.getHeader(),subtitle:e.getSubheader(),info:t.getFooter(),icon:t.getContent().getSrc(),mode:e.getMode(),sizeBehavior:r}}})},true);
},
	"sap/ushell/components/tiles/cdm/applauncher/StaticTile.view.js":function(){
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/View","sap/m/GenericTile","sap/m/ImageContent","sap/m/TileContent"],function(e,t,r,i){"use strict";return e.extend("sap.ushell.components.tiles.cdm.applauncher.StaticTile",{getControllerName:function(){return"sap.ushell.components.tiles.cdm.applauncher.StaticTile"},createContent:function(e){this.setHeight("100%");this.setWidth("100%");if(this.getContent().length===1){return this.getContent()[0]}return new t({mode:"{/properties/mode}",header:"{/properties/title}",scope:"{/properties/scope}",subheader:"{/properties/subtitle}",size:"Auto",sizeBehavior:"{/properties/sizeBehavior}",frameType:"{/properties/frameType}",wrappingType:"{/properties/wrappingType}",url:{path:"/properties/targetURL",formatter:e._getLeanUrl.bind(e)},tileContent:new i({size:"Auto",footer:"{/properties/info}",content:new r({src:"{/properties/icon}"})}),press:[e.onPress,e],additionalTooltip:"{/properties/contentProviderLabel}"})}})});
},
	"sap/ushell/components/tiles/cdm/applauncher/StaticTile.view.xml":'<mvc:View\n    xmlns="sap.m"\n    xmlns:mvc="sap.ui.core.mvc"\n    controllerName="sap.ushell.components.tiles.cdm.applauncher.StaticTile"\n    height="100%"\n    width="100%"><GenericTile\n        additionalTooltip="{/properties/contentProviderLabel}"\n        systemInfo="{= ${/properties/showContentProviderInfoOnVisualizations} ? ${/properties/contentProviderLabel} : \'\'}"\n        frameType="{/properties/frameType}"\n        header="{/properties/title}"\n        mode="{/properties/mode}"\n        scope="{/properties/scope}"\n        sizeBehavior="{/properties/sizeBehavior}"\n        subheader="{/properties/subtitle}"\n        url="{\n            path: \'/properties/targetURL\',\n            formatter: \'._getLeanUrl\'\n        }"\n        wrappingType="{/properties/wrappingType}"\n        press=".onPress"><dependents><TileContent id="standardTileContent" footer="{/properties/info}" /><TileContent id="imageTileContent" footer="{/properties/info}"><ImageContent src="{/properties/icon}" /></TileContent></dependents></GenericTile></mvc:View>\n',
	"sap/ushell/components/tiles/cdm/applauncher/manifest.json":'{"_version":"1.21.0","sap.flp":{"type":"tile","tileSize":"1x1","vizOptions":{"displayFormats":{"supported":["standard","standardWide","compact","flat","flatWide"],"default":"standard"}}},"sap.app":{"id":"sap.ushell.components.tiles.cdm.applauncher","type":"component","applicationVersion":{"version":"1.0.0"},"title":"","tags":{"keywords":[]},"ach":"CA-FE-FLP-COR"},"sap.ui":{"_version":"1.1.0","technology":"UI5","icons":{"icon":""},"deviceTypes":{"desktop":true,"tablet":true,"phone":true},"supportedThemes":["sap_hcb","sap_belize","sap_belize_plus"]},"sap.ui5":{"_version":"1.1.0","componentName":"sap.ushell.components.tiles.cdm.applauncher","dependencies":{"minUI5Version":"1.42","libs":{"sap.m":{}}},"rootView":{"viewName":"sap.ushell.components.tiles.cdm.applauncher.StaticTile","type":"XML"},"handleValidation":false,"contentDensities":{"compact":true,"cozy":true}}}'
});
//# sourceMappingURL=Component-preload.js.map

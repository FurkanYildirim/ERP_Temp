// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/XMLView","sap/ui/core/UIComponent"],function(t,e){"use strict";return e.extend("sap.ushell.components.tiles.cdm.applauncher.Component",{metadata:{interfaces:["sap.ui.core.IAsyncContentCreation"]},createContent:function(){var e=this.getComponentData();var n=e.properties.tilePersonalization||{};var o=e.startupParameters;if(o&&o["sap-system"]){n["sap-system"]=o["sap-system"][0]}return t.create({viewName:"sap.ushell.components.tiles.cdm.applauncher.StaticTile",viewData:{properties:e.properties,configuration:n}}).then(function(t){this._oController=t.getController();t.getContent()[0].bindTileContent({path:"/properties",factory:this._oController._getTileContent.bind(this._oController)});return t}.bind(this))},tileSetVisualProperties:function(t){if(this._oController){this._oController.updatePropertiesHandler(t)}},tileRefresh:function(){},tileSetVisible:function(t){},tileSetEditMode:function(t){if(this._oController){this._oController.editModeHandler(t)}},exit:function(){this._oController=null}})});
//# sourceMappingURL=Component.js.map
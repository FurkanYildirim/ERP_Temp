// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/View","sap/m/GenericTile","sap/m/ImageContent","sap/m/TileContent","sap/ushell/components/tiles/applauncher/StaticTile.controller"],function(e,t,n,i){"use strict";sap.ui.jsview("sap.ushell.components.tiles.applauncher.StaticTile",{getControllerName:function(){return"sap.ushell.components.tiles.applauncher.StaticTile"},createContent:function(){this.setHeight("100%");this.setWidth("100%");return this.getTileControl()},getTileControl:function(){var e=this.getController();if(this.getContent().length===1){return this.getContent()[0]}return new t({mode:"{= ${/mode} || (${/config/display_icon_url} ? 'ContentMode' : 'HeaderMode') }",header:"{/config/display_title_text}",subheader:"{/config/display_subtitle_text}",sizeBehavior:"{/sizeBehavior}",wrappingType:"{/wrappingType}",url:{parts:["/targetURL","/nav/navigation_target_url"],formatter:e.formatters.leanURL},size:"Auto",tileContent:new i({size:"Auto",footer:"{/config/display_info_text}",content:new n({src:"{/config/display_icon_url}"})}),press:[e.onPress,e]})},getMode:function(){return this.getModel().getProperty("/mode")||(this.getModel().getProperty("/config/display_icon_url")?"ContentMode":"HeaderMode")}})});
//# sourceMappingURL=StaticTile.view.js.map
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ushell/components/tiles/utils","sap/ui/core/ListItem"],function(e,t,n){"use strict";return e.extend("sap.ushell.components.tiles.applauncher.Configuration",{onConfigurationInputChange:function(e){t.checkInput(this.getView(),e)},aDefaultObjects:[{obj:"",name:""}],onInit:function(){var e=this.getView(),i=e.byId("targetUrl"),o=e.byId("navigation_semantic_objectInput"),a=e.byId("navigation_semantic_actionInput"),c=t.getResourceBundleModel();e.setModel(c,"i18n");var l=c.getResourceBundle();e.setViewName("sap.ushell.components.tiles.applauncher.Configuration");t.createSemanticObjectModel(this,o,this.aDefaultObjects);t.createActionModel(this,a);o.attachChange(function(t){var n=t.getSource().getValue();e.getModel().setProperty("/config/navigation_semantic_object",n)});function u(e){return!e}i.bindProperty("enabled",{formatter:u,path:"/config/navigation_use_semantic_object"});var s=new n({key:"URL",text:l.getText("configuration.tile_actions.table.target_type.url")});e.byId("targetTypeCB").addItem(s);s=new n({key:"INT",text:l.getText("configuration.tile_actions.table.target_type.intent")});e.byId("targetTypeCB").addItem(s)},onAfterRendering:function(){t.updateMessageStripForOriginalLanguage(this.getView())},onValueHelpRequest:function(e){t.objectSelectOnValueHelpRequest(this,e,false)},onActionValueHelpRequest:function(e){t.actionSelectOnValueHelpRequest(this,e,false)},onCheckBoxChange:function(e){var n=this.getView(),i=n.byId("navigation_semantic_objectInput"),o=i.getModel(),a=e.getSource().getSelected();o.setProperty("/enabled",a);t.checkInput(this.getView(),e)},onIconValueHelpRequest:function(e){t.iconSelectOnValueHelpRequest(this,e,false)},onSelectIconClose:function(){t.onSelectIconClose(this.getView())},onSelectIconOk:function(){t.onSelectIconOk(this.getView())},handleTargetTypeChange:function(e){t.onTargetTypeChange(e)},onTileActionValueHelp:function(e){t.objectSelectOnValueHelpRequest(this,e,true)},onTileActionIconValueHelp:function(e){t.iconSelectOnValueHelpRequest(this,e,true)},addRow:function(){t.addTileActionsRow(this.getView())},deleteRow:function(){t.deleteTileActionsRow(this.getView())}})});
//# sourceMappingURL=Configuration.controller.js.map
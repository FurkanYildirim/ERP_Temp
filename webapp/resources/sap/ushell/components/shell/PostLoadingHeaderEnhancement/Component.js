// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/Device","sap/ui/core/Component","sap/ui/core/Core","sap/ui/core/CustomData","sap/ui/core/IconPool","sap/ushell/Config","sap/ushell/EventHub","sap/ushell/library","sap/ushell/resources","sap/ushell/ui/shell/ShellHeadItem","sap/ui/core/Configuration"],function(e,t,n,i,a,o,r,l,p,s,u){"use strict";var c=l.AppTitleState;var h=l.FloatingNumberType;var d=[];return t.extend("sap.ushell.components.shell.PostLoadingHeaderEnhancement.Component",{metadata:{library:"sap.ushell"},init:function(){var e=sap.ushell.Container.getRenderer("fiori2").getShellConfig();d.push(this._createBackButton());d.push(this._createOverflowButton());if(e.moveAppFinderActionToShellHeader&&o.last("/core/catalog/enabled")&&!e.disableAppFinder){d.push(this._createAppFinderButton())}if(e.moveContactSupportActionToShellHeader){this._createSupportButton().then(function(e){d.push(e)})}this._createShellNavigationMenu(e);var t=n.byId("shell-header");t.updateAggregation("headItems");t.updateAggregation("headEndItems")},_createBackButton:function(){var e=u.getRTL()?"feeder-arrow":"nav-back";var t=new s({id:"backBtn",tooltip:p.i18n.getText("backBtn_tooltip"),ariaLabel:p.i18n.getText("backBtn_tooltip"),icon:a.getIconURI(e),press:function(){r.emit("navigateBack",Date.now())}});return t.getId()},_createOverflowButton:function(){var t=sap.ushell.Container.getRenderer("fiori2").getShellController().getModel();var n=new s({id:"endItemsOverflowBtn",tooltip:{path:"/notificationsCount",formatter:function(e){return this.tooltipFormatter(e)}},ariaLabel:p.i18n.getText("shellHeaderOverflowBtn_tooltip"),ariaHaspopup:"dialog",icon:"sap-icon://overflow",floatingNumber:"{/notificationsCount}",floatingNumberMaxValue:e.system.phone?99:999,floatingNumberType:h.OverflowButton,press:function(e){r.emit("showEndItemOverflow",e.getSource().getId(),true)}});n.setModel(t);return n.getId()},_createAppFinderButton:function(){var e=new s({id:"openCatalogBtn",text:p.i18n.getText("open_appFinderBtn"),tooltip:p.i18n.getText("open_appFinderBtn"),icon:"sap-icon://sys-find",press:function(){sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(e){e.toExternal({target:{semanticObject:"Shell",action:"appfinder"}})})}});if(o.last("/core/extension/enableHelp")){e.addStyleClass("help-id-openCatalogActionItem")}return e.getId()},_createSupportButton:function(){return new Promise(function(e){sap.ui.require(["sap/ushell/ui/footerbar/ContactSupportButton"],function(t){var i="ContactSupportBtn";var a=n.byId(i);if(!a){var o=new t("tempContactSupportBtn",{visible:true});var r=o.getIcon();var l=o.getText();a=new s({id:i,icon:r,tooltip:l,text:l,ariaHaspopup:"dialog",press:function(){o.firePress()}})}e(i)})})},_createShellNavigationMenu:function(e){return new Promise(function(t){sap.ui.require(["sap/m/StandardListItem","sap/ushell/ui/shell/NavigationMiniTile","sap/ushell/ui/shell/ShellNavigationMenu"],function(a,o,l){var p="shellNavigationMenu";var s=function(e,t){var n=t.getProperty("icon")||"sap-icon://circle-task-2",o=t.getProperty("title"),l=t.getProperty("subtitle"),p=t.getProperty("intent");var s=new a({type:"Active",title:o,description:l,icon:n,wrapping:true,customData:[new i({key:"intent",value:p})],press:function(){if(p&&p[0]==="#"){r.emit("navigateFromShellApplicationNavigationMenu",p,true)}}}).addStyleClass("sapUshellNavigationMenuListItems");return s};var u=function(e,t){var n=t.getProperty("icon"),i=t.getProperty("title"),a=t.getProperty("subtitle"),l=t.getProperty("intent");return new o({title:i,subtitle:a,icon:n,intent:l,press:function(){var e=this.getIntent();if(e&&e[0]==="#"){r.emit("navigateFromShellApplicationNavigationMenu",e,true)}}})};var h=new l(p,{title:"{/application/title}",description:"{/title}",icon:"{/application/icon}",showRelatedApps:e.appState!=="lean",items:{path:"/application/hierarchy",factory:s.bind(this)},miniTiles:{path:"/application/relatedApps",factory:u.bind(this)},visible:{path:"/ShellAppTitleState",formatter:function(e){return e===c.ShellNavMenu}}});var g=n.byId("shell-header");h.setModel(g.getModel());var f=n.byId("shellAppTitle");if(f){f.setNavigationMenu(h)}d.push(p);t(h)}.bind(this))})},exit:function(){d.forEach(function(e){var t=n.byId(e);if(t){t.destroy()}});d=[]}})});
//# sourceMappingURL=Component.js.map
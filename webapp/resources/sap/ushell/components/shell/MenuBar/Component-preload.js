//@ui5-bundle sap/ushell/components/shell/MenuBar/Component-preload.js
sap.ui.require.preload({
	"sap/ushell/components/shell/MenuBar/Component.js":function(){
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/UIComponent","sap/ui/core/ComponentContainer","sap/ui/core/mvc/XMLView","sap/ushell/Config"],function(e,n,i,t){"use strict";return e.extend("sap.ushell.components.shell.MenuBar.Component",{metadata:{manifest:"json",library:"sap.ushell",interfaces:["sap.ui.core.IAsyncContentCreation"]},init:function(){e.prototype.init.apply(this,arguments);this.oMenuModelPromise=sap.ushell.Container.getServiceAsync("Menu").then(function(e){return Promise.all([e.isMenuEnabled(),e.getMenuModel()])}).then(function(e){var i=e[0];var t=e[1];this.setModel(t,"menu");if(i){return this.oViewPromise.then(function(){var e=new n({id:"menuBarComponentContainer",component:this});sap.ushell.Container.getRenderer().setNavigationBar(e)}.bind(this))}}.bind(this))},createContent:function(){if(t.last("/core/menu/personalization/enabled")){this.oViewPromise=i.create({viewName:"sap.ushell.components.shell.MenuBar.view.MenuBarPersonalization"})}else{this.oViewPromise=i.create({viewName:"sap.ushell.components.shell.MenuBar.view.MenuBar"})}return this.oViewPromise}})});
},
	"sap/ushell/components/shell/MenuBar/controller/MenuBar.controller.js":function(){
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/CustomData","sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/base/util/ObjectPath","sap/ushell/EventHub","sap/ushell/resources","sap/ushell/utils/WindowUtils","sap/m/IconTabFilter","sap/m/IconTabSeparator","sap/ushell/utils","sap/ushell/Config"],function(e,t,n,i,a,r,s,o,u,h,l){"use strict";return t.extend("sap.ushell.components.shell.MenuBar.controller.MenuBar",{onInit:function(){this.oContainerRouter=sap.ushell.Container.getRenderer().getRouter();this.oContainerRouter.getRoute("home").attachMatched(this._selectIndexAfterRouteChange,this);this.oContainerRouter.getRoute("openFLPPage").attachMatched(this._selectIndexAfterRouteChange,this);this.oContainerRouter.getRoute("openWorkPage").attachMatched(this._selectIndexAfterRouteChange,this);this.oEventHubListener=a.on("enableMenuBarNavigation").do(function(e){this.getView().getModel("viewConfiguration").setProperty("/enableMenuBarNavigation",e)}.bind(this));var e=new n({selectedKey:"None Existing Key",enableMenuBarNavigation:true,ariaTexts:{headerLabel:r.i18n.getText("SpacePageNavgiationRegion")}});this.getView().setModel(e,"viewConfiguration");this.oURLParsingService=sap.ushell.Container.getServiceAsync("URLParsing");this.oGetDefaultSpacePromise=sap.ushell.Container.getServiceAsync("Menu").then(function(e){return e.getDefaultSpace()});this._selectIndexAfterRouteChange();var t=this.byId("navigationBar");if(t){t.removeStyleClass("sapContrast")}},onMenuItemSelection:function(e){var t=e.getParameter("key");var n=this.getView().getModel("menu");var i=n.getProperty("/");var a=this._getNestedMenuEntryByUid(i,t);if(a.type==="IBN"){this._performCrossApplicationNavigation(a.target)}if(a.type==="URL"){this._openURL(a.target)}},_getNestedMenuEntry:function(e,t){return e.reduce(function(e,n){if(e){return e}if(t(n)){return n}if(n.menuEntries){return this._getNestedMenuEntry(n.menuEntries,t)}}.bind(this),undefined)},_getNestedMenuEntryByUid:function(e,t){function n(e){return e.uid===t}return this._getNestedMenuEntry(e,n)},_performCrossApplicationNavigation:function(e){return sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then(function(t){var n={};e.parameters.forEach(function(e){if(e.name&&e.value){n[e.name]=[e.value]}});t.toExternal({target:{semanticObject:e.semanticObject,action:e.action},params:n})})},_openURL:function(e){s.openURL(e.url,"_blank")},_selectIndexAfterRouteChange:function(){var e=this.getView().getModel("viewConfiguration");return Promise.all([this.oURLParsingService,this.oGetDefaultSpacePromise,this.getOwnerComponent().oMenuModelPromise]).then(function(t){var n=t[0];var a=t[1];var r;var s=window.hasher.getHash();var o=n.parseShellHash(s);var u=this.getView().getModel("menu").getProperty("/");if(o.semanticObject==="Shell"&&o.action==="home"){if(l.last("/core/homeApp/enabled")){r=this._getHomeAppUID(u)||""}else{var h=a&&a.children&&a.children[0];r=h?this._getMenuUID(u,a.id,h.id)||"":""}e.setProperty("/selectedKey",r)}else{var c=i.get("params.spaceId.0",o);var d=i.get("params.pageId.0",o);var g=e.getProperty("/selectedKey");var p=this._getNestedMenuEntryByUid(u,g);if(this._hasSpaceIdAndPageId(p,c,d)){r=p.uid}else{r=this._getMenuUID(u,c,d)}if(r){e.setProperty("/selectedKey",r)}else{e.setProperty("/selectedKey","None Existing Key")}}}.bind(this))},_getMenuUID:function(e,t,n){function i(e){return this._hasSpaceIdAndPageId(e,t,n)}var a=this._getNestedMenuEntry(e,i.bind(this));return a&&a.uid},_getHomeAppUID:function(e){function t(e){return e.target.semanticObject==="Shell"&&e.target.action==="home"}var n=this._getNestedMenuEntry(e,t.bind(this));return n&&n.uid},_hasSpaceIdAndPageId:function(e,t,n){var a=i.get("target.parameters",e)||[];var r=a.find(function(e){return e.name==="spaceId"&&e.value===t});var s=a.find(function(e){return e.name==="pageId"&&e.value===n});return r!==undefined&&s!==undefined},_menuFactory:function(t,n){if(n.oModel.getProperty(n.sPath).type==="separator"){return new u}return new o(t,{key:"{menu>uid}",text:"{menu>title}",enabled:"{viewConfiguration>/enableMenuBarNavigation}",items:{path:"menu>menuEntries",factory:this._menuFactory.bind(this)}}).addCustomData(new e({key:"help-id",value:"{= 'MenuEntry-' + ${menu>help-id}}",writeToDom:"{= !!${menu>help-id}}"}))},onExit:function(){this.oEventHubListener.off()}})});
},
	"sap/ushell/components/shell/MenuBar/manifest.json":'{"_version":"1.21.0","sap.app":{"id":"sap.ushell.components.shell.MenuBar","applicationVersion":{"version":"1.115.1"},"i18n":{"bundleUrl":"../../../renderers/fiori2/resources/resources.properties","supportedLocales":["","ar","bg","ca","cs","da","de","el","en","en_US","en_US_sappsd","en_US_saptrc","es","et","fi","fr","hi","hr","hu","it","iw","ja","kk","ko","lt","lv","ms","nl","no","pl","pt","ro","ru","sh","sk","sl","sv","th","tr","uk","vi","zh_CN","zh_TW"],"fallbackLocale":"en"},"type":"component","title":"","resources":"resources.json"},"sap.ui":{"technology":"UI5","deviceTypes":{"desktop":true,"tablet":true,"phone":true}},"sap.ui5":{"dependencies":{"minUI5Version":"1.114","libs":{"sap.ui.core":{},"sap.m":{},"sap.tnt":{}}},"models":{},"contentDensities":{"compact":true,"cozy":true}}}',
	"sap/ushell/components/shell/MenuBar/view/MenuBar.view.xml":'<mvc:View xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:mvc="sap.ui.core.mvc"\n    controllerName="sap.ushell.components.shell.MenuBar.controller.MenuBar"\n    displayBlock="true"><IconTabHeader\n        class="sapUshellShellTabBar"\n        ariaTexts="{viewConfiguration>/ariaTexts}"\n        mode="Inline"\n        items="{\n            path: \'menu>/\',\n            factory: \'._menuFactory\'\n        }"\n        selectedKey="{viewConfiguration>/selectedKey}"\n        select=".onMenuItemSelection"><customData><core:CustomData\n                key="sap-ui-fastnavgroup"\n                value="true"\n                writeToDom="true"/></customData></IconTabHeader></mvc:View>\n',
	"sap/ushell/components/shell/MenuBar/view/MenuBarPersonalization.view.xml":'<mvc:View xmlns="sap.m"\n    xmlns:core="sap.ui.core"\n    xmlns:mvc="sap.ui.core.mvc"\n    xmlns:tnt="sap.tnt"\n    controllerName="sap.ushell.components.shell.MenuBar.controller.MenuBar"\n    displayBlock="true"><tnt:ToolHeader\n        id= "navigationBar"\n        class="sapUshellShellToolHeader"><core:ComponentContainer\n            manifest="true"\n            async="true"\n            propagateModel="true"\n            name="sap.ushell.components.shell.NavigationBarMenu"\n            lifecycle="Container"\n            id="navigationBarMenu" /><IconTabHeader\n            class="sapUshellShellTabBar"\n            ariaTexts="{viewConfiguration>/ariaTexts}"\n            mode="Inline"\n            items="{\n                path: \'menu>/\',\n                filters: { path: \'pinned\', operator: \'EQ\', value1: true },\n                sorter: { path: \'pinnedSortOrder\', descending: false },\n                factory: \'._menuFactory\'\n            }"\n            selectedKey="{viewConfiguration>/selectedKey}"\n            select=".onMenuItemSelection"></IconTabHeader><tnt:customData><core:CustomData\n                key="sap-ui-fastnavgroup"\n                value="true"\n                writeToDom="true"/></tnt:customData></tnt:ToolHeader></mvc:View>\n'
});
//# sourceMappingURL=Component-preload.js.map

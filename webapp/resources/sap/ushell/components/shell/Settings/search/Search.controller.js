// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/View","sap/ui/core/mvc/Controller"],function(e,n){"use strict";return n.extend("sap.ushell.components.shell.Settings.search.Search",{onInit:function(){this._loadContent()},_loadContent:function(){var n=this.getView().byId("searchContent");e.create({id:"searchPrefsDialogView",viewName:"module:sap/esh/search/ui/userpref/SearchPrefsDialog.view"}).then(function(e){n.addItem(e)})},onCancel:function(){this.oView.getModel().cancelPreferences()},onSave:function(){return this.oView.getModel().savePreferences()}})});
//# sourceMappingURL=Search.controller.js.map
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/XMLView","sap/ui/core/UIComponent"],function(t,n){"use strict";return n.extend("sap.ushell.components.shell.Settings.userDefaults.Component",{metadata:{manifest:"json"},init:function(){n.prototype.init.apply(this,arguments)},onSave:function(){return this.getRootControl().getController().onSave()},onCancel:function(){this.getRootControl().getController().onCancel()},exit:function(){}})});
//# sourceMappingURL=Component.js.map
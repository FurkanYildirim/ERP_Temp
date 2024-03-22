// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/thirdparty/jquery","sap/m/Button","./ShellFloatingActionRenderer","sap/ushell/library"],function(jQuery,t,e){"use strict";var i=t.extend("sap.ushell.ui.shell.ShellFloatingAction",{metadata:{library:"sap.ushell"},renderer:e});i.prototype.init=function(){this.addStyleClass("sapUshellShellFloatingAction");if(t.prototype.init){t.prototype.init.apply(this,arguments)}};i.prototype.exit=function(){t.prototype.exit.apply(this,arguments)};i.prototype.onAfterRendering=function(){if(this.data("transformY")){this.removeStyleClass("sapUshellShellFloatingActionTransition");jQuery(this.getDomRef()).css("transform","translateY("+this.data("transformY")+")")}else{this.addStyleClass("sapUshellShellFloatingActionTransition")}};return i});
//# sourceMappingURL=ShellFloatingAction.js.map
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["../Category"],function(t){"use strict";var e=t.extend("sap.ushell.components.cepsearchresult.app.util.controls.categories.Workpage",{renderer:t.getMetadata().getRenderer()});e.prototype.getViewSettings=function(){return{views:[{key:"list",icon:"sap-icon://text-align-justified"}],default:"list"}};e.prototype.getItemAvatarSettings=function(){return t.prototype.getItemAvatarSettings.apply(this,["{data>icon}"])};return e});
//# sourceMappingURL=Workpage.js.map
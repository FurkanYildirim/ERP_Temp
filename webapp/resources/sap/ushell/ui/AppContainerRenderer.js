/*!
 * Copyright (c) 2009-2023 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ushell/resources"],function(e){"use strict";var n={apiVersion:2};n.render=function(n,r){if(!r.getVisible()){return}n.openStart("main",r);n.attr("role","main");n.attr("aria-label",e.i18n.getText("ShellContent.AriaLabel"));n.openEnd();r.getPages().forEach(function(e){n.renderControl(e)});n.close("main")};return n},true);
//# sourceMappingURL=AppContainerRenderer.js.map
/*
 * Copyright (C) 2009-2014 SAP SE or an SAP affiliate company. All rights reserved
 */
jQuery.sap.declare("sap.ca.scfld.md.Startup");sap.ca.scfld.md.Startup={};sap.ca.scfld.md.Startup.init=function(t,e){var a=function(){var a=e.byId("fioriContent");if(a){jQuery.sap.require("sap.ca.scfld.md.app.Application");var p=new sap.ca.scfld.md.app.Application({identity:t,component:e.getView().getViewData().component,oViewHook:a.getId()});p.setIdentity(t);return true}return false};if(!a()){jQuery(a)}var p="<style> "+".sapMSplitAppFullscreen > .sapMSplitContainerMaster { position: fixed; height: 0; left: -10000px; width: 0; } "+".sapMSplitAppFullscreen > .sapMSplitContainerDetail .sapMSplitContainerMasterBtn { display: none; } "+"</style>";jQuery("head").append(p)};
//# sourceMappingURL=Startup.js.map
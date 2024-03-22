// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/UIComponent","sap/m/SearchField","sap/m/Button","sap/m/ResponsivePopover","sap/ui/core/Fragment","sap/ui/model/json/JSONModel","sap/ushell/components/shell/SearchCEP/SearchCEP.controller","sap/base/Log","sap/ushell/resources","sap/ui/core/IconPool","sap/ushell/renderers/fiori2/search/util","sap/ushell/ui/shell/ShellHeadItem","sap/ui/Device","sap/ui/core/Core","sap/ui/thirdparty/jquery"],function(e,t,i,s,n,o,r,a,h,l,c,S,d,u,jQuery){"use strict";return e.extend("sap.ushell.components.shell.SearchCEP.Component",{metadata:{version:"1.115.1",library:["sap.ushell","sap.ushell.components.shell"],dependencies:{libs:["sap.m"]}},createContent:function(){try{this.oRenderer=sap.ushell.Container.getRenderer("fiori2");this.oShellHeader=u.byId("shell-header");this.oRenderer.addHeaderEndItem({id:"sf",tooltip:"{i18n>openSearchBtn}",text:"{i18n>search}",ariaLabel:"{i18n>openSearchBtn}",icon:l.getIconURI("search"),visible:true,showSeparator:false,press:this.onShellSearchButtonPressed.bind(this)},true,false);this.oShellSearchBtn=u.byId("sf");this.oShellSearchBtn.addEventDelegate({onkeydown:this._keyDownSearchBtn.bind(this)});var e={width:"90%",placeholder:h.i18n.getText("search"),tooltip:h.i18n.getText("search"),enableSuggestions:true,suggest:this.onSuggest.bind(this),search:this.onSearch.bind(this)};this.oSF=new t("PlaceHolderSearchField",e);this.oSF.addStyleClass("sapUshellCEPSearchCenter");var i=this.getScreenSize();if(i==="S"){this.initSearchSSize()}else if(i==="M"||i==="L"){this.initSearchMLSizes()}else if(i==="XL"){this.initSearchXLSize()}this.oShellHeader.setSearch(this.oSF);this.oSearchCEPController=new r;this.oSF.addEventDelegate({onfocusin:this._onfocusin.bind(this),onAfterRendering:this._onAfterRendering.bind(this)});this.oSearchCEPController.getHomePageApps()}catch(e){a.info("Failed to create CEP search field content"+e)}u.getEventBus().publish("shell","searchCompLoaded",{delay:0})},initSearchSSize:function(){this.oSF.setWidth("60%");this.oShellHeader.setSearchState("COL",35,false)},initSearchMLSizes:function(){this.oShellHeader.setSearchState("COL",35,false)},initSearchXLSize:function(){this.oShellSearchBtn.setVisible(false);this.oShellHeader.setSearchState("EXP",35,false)},_onAfterRendering:function(e){jQuery(this.oSF.getDomRef()).find("#PlaceHolderSearchField-search").attr("title",h.i18n.getText("search"))},_onfocusin:function(e){if(this.oSF.getEnableSuggestions()&&d.system.phone){jQuery(this.oSF.getDomRef()).find("input").attr("inputmode","search")}},onSuggest:function(e){if(this.oSF.getEnableSuggestions()&&d.system.phone){jQuery(this.oSF.getDomRef()).find("input").attr("inputmode","search")}if(u.byId("CEPSearchField")){this.oSearchCEPController.onSuggest(e)}else{this.oSearchCEPController.onInit()}},onSearch:function(e){if(u.byId("CEPSearchField")){this.oSearchCEPController.onSearch(e)}},exit:function(){this.oSearchCEPController.onExit()},expandSearch:function(){this.oShellHeader.setSearchState("EXP_S",35,false);this.oSF.focus()},onShellSearchButtonPressed:function(){this.oShellSearchBtn.setVisible(false);this.expandSearch()},collapseSearch:function(){this.oShellHeader.setSearchState("COL",35,false);this.oShellSearchBtn.setVisible(true)},getScreenSize:function(){var e=d.media.getCurrentRange(d.media.RANGESETS.SAP_STANDARD_EXTENDED);if(e.from>=1440){return"XL"}else if(e.from>=1024){return"L"}else if(e.from>=600){return"M"}else if(e.from>=0){return"S"}},_keyDownSearchBtn:function(e){if(e.code===13||e.code==="Enter"){setTimeout(function(){this.oSF.focus()}.bind(this),500)}}})});
//# sourceMappingURL=Component.js.map
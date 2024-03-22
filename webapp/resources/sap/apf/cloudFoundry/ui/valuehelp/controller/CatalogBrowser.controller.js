sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/IconPool","sap/ui/core/library","sap/ui/core/ValueState","sap/ui/core/Item","sap/ui/model/json/JSONModel","sap/ui/model/odata/v2/ODataModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/Sorter","sap/m/MessageToast","sap/apf/cloudFoundry/ui/utils/ODataServiceUtils"],function(e,t,a,r,i,n,s,o,l,c,u,S){"use strict";r=a.ValueState;var d="sap.apf.cloudFoundry.ui.valuehelp";var v={BACK:-1,DESTINATIONS:0,CATALOG:1,URL:2,OVERVIEW:3,OVERVIEW_REDUCED:4,OVERVIEW_SERVICEONLY:5};function h(e,t){return e.getManifestObject().resolveUri(t).toString()}return e.extend(d+".controller.CatalogBrowser",{onInit:function(){var e=this.getOwnerComponent();var t=h(e,e.getManifestEntry("/sap.app/dataSources/apf.destinationCatalog.destinations").uri);this.sDestination=undefined;this.sService=undefined;this.oCoreApi=e.oCoreApi;var a=this.getDialog();var i=this.getView();a.removeStyleClass("sapUiPopupWithPadding");a.addStyleClass("sapMSelectDialog");var s=new n({Title:this.translate("selectDestination"),Destination:"",Service:"",ServiceUrlValueState:r.None,SearchEnabled:true,ButtonOkEnabled:false,ButtonSelectEnabled:false,ButtonBackEnabled:false});i.setModel(s,"ui");var o=new n(t);i.setModel(o,"destinations");o.attachRequestCompleted(function(){this.oDestinationStatusPromises=S.pingDestinations(o.getData().destinations)}.bind(this));this.addCustomEventDelegates();a.open()},addCustomEventDelegates:function(){var e=this.getView();e.byId("urlInput").addEventDelegate({onkeypress:function(e){if(e.key==="Enter"){this.onSelectServiceUrl()}}.bind(this)})},onSelectDestination:function(e){this.destinationPath=e.getSource().getBindingContext("destinations").getPath();var t=this.getView();var a=t.getModel("destinations");var r=a.getObject(this.destinationPath);this.destinationSearch=t.byId("searchField").getValue();t.byId("searchField").setValue("");this.oDestinationStatusPromises[r.name].then(function(e){switch(e){case S.DESTINATION_TYPE.SERVICE:this.navigate(v.OVERVIEW_SERVICEONLY,{destination:r.name});this.setIsAnalyticalService();t.byId("serviceOnlyOverview").bindElement({path:this.destinationPath,model:"destinations"});break;case S.DESTINATION_TYPE.CATALOG:this.navigate(v.CATALOG,{destination:r.name});this.attachCatalogModel(r.name);break;default:var a=t.byId("urlInput");a.setValue("");a.removeAllItems();a.setShowButton(false);this.navigate(v.URL,{destination:r.name});S.discoverServices(r.name).then(function(e){if(e.length>0){e.forEach(function(e){a.addItem(new i({text:e.Url}))});a.setShowButton(true)}}).catch(function(){});break}}.bind(this))},attachCatalogModel:function(e){var t=this.getView();var a=t.byId("navContainer").getCurrentPage().getContent()[0];a.bindItems({path:"catalog>/ServiceCollection",sorter:new c("TechnicalServiceName",false),parameters:{custom:{search:""}},template:a.getBindingInfo("items").template});var r=new s(S.getCatalogURL(e));t.setModel(r,"catalog");var i=t.byId("selectService");i.setBusy(true);r.attachMetadataLoaded(function(){i.setBusy(false)});r.attachMetadataFailed(function(e){this.onBack();u.show(this.translate("destinationError",e.getParameter("responseText")));i.setBusy(false)}.bind(this))},onSelectService:function(e){var t=this.getView();var a=e.getSource().getBindingContext("catalog");var r=S.getRelativeServiceURL(a.getProperty("ServiceUrl"));this.navigate(v.OVERVIEW,{service:r});this.setIsAnalyticalService();var i=a.getPath();t.byId("destinationOverview").bindElement({path:this.destinationPath,model:"destinations"});t.byId("serviceOverview").bindElement({path:i,model:"catalog"})},onSelectServiceUrl:function(){var e=this.getView();var t=e.getModel("ui");var a=e.byId("urlInput").getValue();if(!a.startsWith("/")){t.setProperty("/ServiceUrlValueState",r.Error);return}t.setProperty("/ServiceUrlValueState",r.None);this.navigate(v.OVERVIEW_REDUCED,{service:a});this.setIsAnalyticalService();e.byId("reducedDestinationOverview").bindElement({path:this.destinationPath,model:"destinations"})},onCancel:function(){this.getDialog().close();this.getDialog().destroy();this.getView().destroy();this.destroy()},onBack:function(){var e=this.getView();var t=this.navigate(v.BACK);switch(t){case v.DESTINATIONS:e.byId("searchField").setValue(this.destinationSearch);break;default:break}},onOk:function(){var e=this.getView();var t=e.getModel("ui");var a=S.getFullServiceURL(t.getProperty("/Destination"),t.getProperty("/Service"));var r=this.getView().getViewData();r.parentControl.fireEvent("selectService",{sSelectedService:a});this.getDialog().close();this.getDialog().destroy();this.getView().destroy();this.destroy()},onLiveChangeSearch:function(e){var t=e.getParameter("newValue");var a=t?300:0;var r=this;clearTimeout(this.iLiveChangeTimer);if(a){this.iLiveChangeTimer=setTimeout(function(){r.executeSearch(t)},a)}else{this.executeSearch(t)}},onSearch:function(e){this.executeSearch(e.getSource().getValue())},executeSearch:function(e){var t=this.getView();var a=t.byId("navContainer").getCurrentPage().getContent()[0];var r=t.getModel("ui").getProperty("/Destination")!=="";if(r){a.bindItems({path:"catalog>/ServiceCollection",sorter:new c("TechnicalServiceName",false),parameters:{custom:{search:e}},template:a.getBindingInfo("items").template})}else{a.getBinding("items").filter(new o({filters:[new o({path:"name",operator:l.Contains,value1:e}),new o({path:"description",operator:l.Contains,value1:e})],and:false}))}},setIsAnalyticalService:function(){var e=this.getView().getModel("ui");var t=e.getProperty("/Destination");var a=e.getProperty("/Service");e.setProperty("/ServiceStatus",S.SERVICE_STATUS.PENDING);return S.isAnalyticalService(t,a).then(function(t){e.setProperty("/ServiceStatus",t)}).catch(function(t){e.setProperty("/ServiceStatus",t)})},serviceStatusIcon:function(e){switch(e){case S.SERVICE_STATUS.ANALYTICAL_SERVICE:return t.getIconURI("status-positive");case S.SERVICE_STATUS.NOT_ANALYTICAL_SERVICE:return t.getIconURI("status-critical");case S.SERVICE_STATUS.WRONG_ODATA_VERSION:return t.getIconURI("status-error");case S.SERVICE_STATUS.NOT_ACCESSIBLE:return t.getIconURI("status-error");default:return t.getIconURI("status-inactive")}},serviceStatusState:function(e){switch(e){case S.SERVICE_STATUS.ANALYTICAL_SERVICE:return r.Success;case S.SERVICE_STATUS.NOT_ANALYTICAL_SERVICE:return r.Warning;case S.SERVICE_STATUS.WRONG_ODATA_VERSION:return r.Error;case S.SERVICE_STATUS.NOT_ACCESSIBLE:return r.Error;default:return r.None}},serviceStatusText:function(e){switch(e){case S.SERVICE_STATUS.ANALYTICAL_SERVICE:return this.translate("analyticalService");case S.SERVICE_STATUS.NOT_ANALYTICAL_SERVICE:return this.translate("nonAnalyticalService");case S.SERVICE_STATUS.WRONG_ODATA_VERSION:return this.translate("wrongOdataVersion");case S.SERVICE_STATUS.NOT_ACCESSIBLE:return this.translate("serviceNotAccessible");default:return this.translate("pending")}},proxyTypeIcon:function(e){switch(e){case"OnPremise":return t.getIconURI("it-host");default:return t.getIconURI("cloud")}},proxyTypeText:function(e){switch(e){case"OnPremise":return this.translate("onPremise");default:return this.translate("cloud")}},translate:function(e){return this.oCoreApi.getText(e,Array.prototype.slice.call(arguments,1))},getRelativeServiceURL:S.getRelativeServiceURL,navigate:function(e,t){var a=this.getView();var i=a.getModel("ui");var n=a.byId("navContainer");t=t||{};t.destination=t.destination||i.getProperty("/Destination");t.service=t.service||i.getProperty("/Service");var s;if(e<0){var o=n.getPreviousPage();s=n.indexOfPage(o)}else{s=e}switch(s){case v.DESTINATIONS:i.setProperty("/Title",this.translate("selectDestination"));i.setProperty("/Destination","");i.setProperty("/Service","");i.setProperty("/ServiceUrlValueState",r.None);i.setProperty("/SearchEnabled",true);i.setProperty("/ButtonOkEnabled",false);i.setProperty("/ButtonSelectEnabled",false);i.setProperty("/ButtonBackEnabled",false);break;case v.CATALOG:i.setProperty("/Title",this.translate("selectService",t.destination));i.setProperty("/Destination",t.destination);i.setProperty("/Service","");i.setProperty("/ServiceUrlValueState",r.None);i.setProperty("/SearchEnabled",true);i.setProperty("/ButtonOkEnabled",false);i.setProperty("/ButtonSelectEnabled",false);i.setProperty("/ButtonBackEnabled",true);break;case v.URL:i.setProperty("/Title",this.translate("enterService",t.destination));i.setProperty("/Destination",t.destination);i.setProperty("/Service","");i.setProperty("/ServiceUrlValueState",r.None);i.setProperty("/SearchEnabled",false);i.setProperty("/ButtonOkEnabled",false);i.setProperty("/ButtonSelectEnabled",true);i.setProperty("/ButtonBackEnabled",true);break;case v.OVERVIEW:i.setProperty("/Title",this.translate("overview"));i.setProperty("/Destination",t.destination);i.setProperty("/Service",t.service);i.setProperty("/ServiceUrlValueState",r.None);i.setProperty("/SearchEnabled",false);i.setProperty("/ButtonOkEnabled",true);i.setProperty("/ButtonSelectEnabled",false);i.setProperty("/ButtonBackEnabled",true);break;case v.OVERVIEW_REDUCED:i.setProperty("/Title",this.translate("overview"));i.setProperty("/Destination",t.destination);i.setProperty("/Service",t.service);i.setProperty("/ServiceUrlValueState",r.None);i.setProperty("/SearchEnabled",false);i.setProperty("/ButtonOkEnabled",true);i.setProperty("/ButtonSelectEnabled",false);i.setProperty("/ButtonBackEnabled",true);break;case v.OVERVIEW_SERVICEONLY:i.setProperty("/Title",this.translate("overview"));i.setProperty("/Destination",t.destination);i.setProperty("/Service","");i.setProperty("/ServiceUrlValueState",r.None);i.setProperty("/SearchEnabled",false);i.setProperty("/ButtonOkEnabled",true);i.setProperty("/ButtonSelectEnabled",false);i.setProperty("/ButtonBackEnabled",true);break;default:i.setProperty("/Title",this.translate("selectDestination"));i.setProperty("/Destination","");i.setProperty("/Service","");i.setProperty("/ServiceUrlValueState",r.None);i.setProperty("/SearchEnabled",true);i.setProperty("/ButtonOkEnabled",false);i.setProperty("/ButtonSelectEnabled",false);i.setProperty("/ButtonBackEnabled",false);s=v.DESTINATIONS;break}if(e<0){n.back()}else{var l=n.getPages()[s];n.to(l)}return s},getDialog:function(){var e=this.getView().byId("catalogBrowser");var t=this.getView();if(!e){e=sap.ui.xmlfragment(t.getId(),d+".fragment.CatalogBrowser",this);t.addDependent(e)}return e}})});
//# sourceMappingURL=CatalogBrowser.controller.js.map
/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2018 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/UIComponent","sap/apf/modeler/core/instance","sap/m/routing/RouteMatchedHandler","sap/apf/modeler/ui/utils/APFRouter","sap/apf/modeler/ui/utils/constants","sap/apf/modeler/ui/utils/APFTree","sap/apf/core/layeredRepositoryProxy","sap/apf/core/constants","sap/ui/core/mvc/ViewType","sap/ui/thirdparty/jquery","sap/ui/dom/includeStylesheet"],function(e,a,t,i,o,n,s,r,p,jQuery,c){"use strict";var u=e.extend("sap.apf.modeler.Component",{oCoreApi:null,metadata:{manifest:"json",library:"sap.apf"},init:function(){var a,t;var i;if(this.initHasAlreadyBeenCalled){return}this.initHasAlreadyBeenCalled=true;var o=jQuery.extend({},true,this.getMetadata().getManifest());var n=u.prototype.getMetadata().getManifest();if(o["sap.app"].crossNavigation&&o["sap.app"].crossNavigation.outbounds&&o["sap.app"].crossNavigation.outbounds.navigateToGenericRuntime){i=o["sap.app"].crossNavigation.outbounds.navigateToGenericRuntime}if(o["sap.app"].dataSources&&o["sap.app"].dataSources.AnalyticalConfigurationServiceRoot){a=o["sap.app"].dataSources.AnalyticalConfigurationServiceRoot.uri}else{a=sap.apf.core.constants.modelerPersistenceServiceRoot}var s={serviceRoot:a};var r=this.getInjections();r.instances=r.instances||{};r.instances.component=this;r.functions=r.functions||{};if(i){r.functions.getNavigationTargetForGenericRuntime=function(){return i}}else{r.functions.getNavigationTargetForGenericRuntime=function(){if(o["sap.app"]&&o["sap.app"].id==="fnd.apf.dts1"){return{semanticObject:"FioriApplication",action:"executeAPFConfigurationS4HANA"}}return{semanticObject:"FioriApplication",action:"executeAPFConfiguration"}}}if(o["sap.app"].dataSources&&o["sap.app"].dataSources.GatewayCatalogService){t=o["sap.app"].dataSources.GatewayCatalogService.uri}else if(n["sap.app"].dataSources&&n["sap.app"].dataSources.GatewayCatalogService){t=n["sap.app"].dataSources.GatewayCatalogService.uri}r.functions.getCatalogServiceUri=function(){return t};this.oCoreApi=new sap.apf.modeler.core.Instance(s,r);var l=this.oCoreApi.getUriGenerator().getApfLocation();c(l+"modeler/resources/css/configModeler.css","configModelerCss");e.prototype.init.apply(this,arguments);this.getRouter().initialize();var d=sap.ui.view({viewName:"sap.apf.modeler.ui.view.messageHandler",type:p.XML,viewData:this.oCoreApi});var f=d.getController().showMessage;this.oCoreApi.setCallbackForMessageHandling(f.bind(d.getController()))},createContent:function(){var e=sap.ui.view({viewName:"sap.apf.modeler.ui.view.applicationList",type:p.XML,viewData:this.oCoreApi});this.oCoreApi.getUriGenerator().getApfLocation();return e},getInjections:function(){return{instances:{},exits:{}}}});return u},true);
//# sourceMappingURL=Component.js.map
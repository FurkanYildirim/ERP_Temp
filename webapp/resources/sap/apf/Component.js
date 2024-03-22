/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
sap.ui.define(["sap/ui/core/UIComponent","sap/apf/api"],function(t,i){"use strict";var p=t.extend("sap.apf.Component",{oApi:null,metadata:{config:{fullWidth:true},name:"CoreComponent",version:"0.0.1",publicMethods:["getApi"],dependencies:{libs:["sap.m","sap.ui.layout","sap.viz","sap.ui.comp","sap.suite.ui.commons"]}},init:function(){if(!this.oApi){this.oApi=new sap.apf.Api(this)}var i=this.oApi.getStartParameterFacade().getApplicationConfigurationPath();if(i){this.oApi.loadApplicationConfig(i)}t.prototype.init.apply(this,arguments)},createContent:function(){t.prototype.createContent.apply(this,arguments);return this.oApi.startApf()},exit:function(){try{this.oApi.destroy()}catch(t){}},getApi:function(){return this.oApi}});return p},true);
//# sourceMappingURL=Component.js.map
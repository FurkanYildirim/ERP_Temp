/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2015 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/UIComponent","sap/apf/api","sap/apf/cloudFoundry/uiHandler","sap/ui/thirdparty/jquery"],function(t,e,i,jQuery){"use strict";var n=t.extend("sap.apf.base.Component",{metadata:{manifest:"json",library:"sap.apf",publicMethods:["getApi"]},oApi:null,init:function(){var e;var i;var s;if(!this.oApi){e=n.prototype.getMetadata().getManifest();i=jQuery.extend({},true,this.getMetadata().getManifest());if(this.getMetadata().getAllProperties().injectedApfApi){s=this.getMetadata().getAllProperties().injectedApfApi.appData.Constructor}else{s=sap.apf.Api}this.oApi=new s(this,undefined,{manifest:i,baseManifest:e});if(this.oApi.startupSucceeded()){t.prototype.init.apply(this,arguments)}}else{return}if(this.getInjections()&&this.getInjections().functions&&this.getInjections().functions.isUsingCloudFoundryProxy&&typeof this.getInjections().functions.isUsingCloudFoundryProxy==="function"&&this.getInjections().functions.isUsingCloudFoundryProxy()===true){sap.apf.cloudFoundry.uiHandler.initRuntime(this)}},createContent:function(){t.prototype.createContent.apply(this,arguments);return this.oApi.startApf()},exit:function(){this.oApi.destroy()},getApi:function(){return this.oApi},getInjections:function(){return{exits:{},instances:{},functions:{},constructors:{},probe:function(){}}}});return n},true);
//# sourceMappingURL=Component.js.map
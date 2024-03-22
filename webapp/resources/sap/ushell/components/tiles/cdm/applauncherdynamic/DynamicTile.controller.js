// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/mvc/Controller","sap/ushell/components/tiles/utils","sap/ui/core/format/NumberFormat","sap/ushell/Config","sap/ushell/utils/WindowUtils","sap/ui/model/json/JSONModel","sap/m/library","sap/ushell/library","sap/base/Log","sap/base/util/merge","sap/ushell/utils/DynamicTileRequest","sap/ushell/utils","sap/ushell/utils/UrlParsing"],function(e,t,r,i,a,o,s,n,l,u,f,p,d){"use strict";var c=s.GenericTileScope;var h=s.DeviationIndicator;var m=s.ValueColor;var g=s.FrameType;var v=n.DisplayFormat;var b=n.AppType;var y="sap.ushell.components.tiles.cdm.applauncherdynamic.DynamicTile";var _="<RESET>";var D={title:"",subtitle:"",icon:"",info:"",infoState:m.Neutral,targetURL:"",number_value:"...",number_unit:"",number_factor:"",number_state_arrow:h.None,number_value_state:m.Neutral};return e.extend(y,{_aDoables:[],timer:null,iLastTimeoutStart:0,oDataRequest:null,bShouldNotRefreshDataAfterInit:false,_getConfiguration:function(e){var t={};var r;t.configuration=e.configuration;t.properties=e.properties;t.properties.info=t.properties.info||D.info;t.properties.number_value=D.number_value;t.properties.number_value_state=D.number_value_state;t.properties.number_state_arrow=D.number_state_arrow;t.properties.number_factor=D.number_factor;t.properties.number_unit=t.properties.numberUnit||D.number_unit;var a=t.configuration["sap-system"];var o=t.properties.targetURL;if(o&&a){if(d.isIntentUrl(o)){r=d.parseShellHash(o);if(!r.params){r.params={}}r.params["sap-system"]=a;o="#"+d.constructShellHash(r)}else{o+=(o.indexOf("?")<0?"?":"&")+"sap-system="+a}t.properties.targetURL=o}t.properties.sizeBehavior=i.last("/core/home/sizeBehavior");t.properties.wrappingType=i.last("/core/home/wrappingType");switch(t.properties.displayFormat){case v.Flat:t.properties.frameType=g.OneByHalf;break;case v.FlatWide:t.properties.frameType=g.TwoByHalf;break;case v.StandardWide:t.properties.frameType=g.TwoByOne;break;default:{t.properties.frameType=g.OneByOne}}t.originalProperties=u({},e.properties);return t},_setShowContentProviderInfoOnVisualizations:function(e,t,r){if(!e){r.setProperty("/properties/showContentProviderInfoOnVisualizations",false);return Promise.resolve()}return sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(e){return e.getSystemContext(t)}).then(function(e){r.setProperty("/properties/contentProviderLabel",e.label);r.setProperty("/properties/showContentProviderInfoOnVisualizations",true)}).catch(function(e){l.error("DynamicTile.controller threw an error:",e)})},onInit:function(){var e=this.getView();var t=new o;var r=e.getViewData();var a=r.properties;t.setData(this._getConfiguration(r));var s=a.contentProviderId;this._setShowContentProviderInfoOnVisualizations(i.last("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations"),s,t);this._aDoables.push(i.on("/core/contentProviders/providerInfo/showContentProviderInfoOnVisualizations").do(function(e){this._setShowContentProviderInfoOnVisualizations(e,s,t)}.bind(this)));e.setModel(t);this._aDoables.push(i.on("/core/home/sizeBehavior").do(function(e){t.setProperty("/properties/sizeBehavior",e)}))},refreshHandler:function(){this.loadData(0,true)},visibleHandler:function(e){if(e){if(!this.oDataRequest||this.timer===null){this.initRequestInterval()}}else{this.stopRequests()}},editModeHandler:function(e){var t=e?c.ActionMore:c.Display;this.getView().getModel().setProperty("/properties/scope",t)},updateVisualPropertiesHandler:function(e){var t=this.getView().getModel().getProperty("/properties");var r=this.getView().getModel().getProperty("/originalProperties");if(p.isDefined(e.title)){t.title=e.title;r.title=e.title}if(p.isDefined(e.subtitle)){t.subtitle=e.subtitle;r.subtitle=e.subtitle}if(p.isDefined(e.icon)){t.icon=e.icon;r.icon=e.icon}if(p.isDefined(e.targetURL)){t.targetURL=e.targetURL;r.targetURL=e.targetURL}if(p.isDefined(e.info)){t.info=e.info;r.info=e.info}this.getView().getModel().refresh()},stopRequests:function(){if(this.timer){clearTimeout(this.timer);this.timer=null}if(this.oDataRequest){this.oDataRequest.abort()}},onPress:function(e){if(e.getSource().getScope&&e.getSource().getScope()===c.Display){var t=this.getView().getModel().getProperty("/properties/targetURL");var r=this.getView().getModel().getProperty("/properties/title");if(!t){return}else if(t[0]==="#"){hasher.setHash(t)}else{var o=i.last("/core/shell/enableRecentActivity")&&i.last("/core/shell/enableRecentActivityLogging");if(o){var s={title:r,appType:b.URL,url:t,appId:t};sap.ushell.Container.getRenderer("fiori2").logRecentActivity(s)}a.openURL(t,"_blank")}}},initRequestInterval:function(){var e=this.getView().getModel();var t=e.getProperty("/configuration/serviceRefreshInterval");if(!t||t==="0"){t=0;if(this.oDataRequest){this.bShouldNotRefreshDataAfterInit=true}}else if(t<10){var r=e.getProperty("/configuration/serviceUrl");l.warning("Refresh Interval "+t+" seconds for service URL "+r+" is less than 10 seconds, which is not supported. Increased to 10 seconds automatically.",null,y);t=10}this.loadData(t,false)},loadData:function(e,t){if(!t&&this.bShouldNotRefreshDataAfterInit){return}var r=this.getView().getModel();var i=r.getProperty("/configuration/serviceUrl");if(!i){l.error("No service URL given!",y);this._setTileIntoErrorState();return}var a=e*1e3-(Date.now()-this.iLastTimeoutStart);if(!t&&!this.timer&&a>0){l.info("Started timeout to call "+i+" again in "+Math.ceil(a/1e3)+" seconds",null,y);this.timer=setTimeout(this.loadData.bind(this,e,false),p.sanitizeTimeoutDelay(a));return}if(!this.oDataRequest||this.oDataRequest.sUrl!==i){if(this.oDataRequest){this.oDataRequest.destroy()}var o=r.getProperty("/properties/contentProviderId");var s={dataSource:r.getProperty("/properties/dataSource")};this.oDataRequest=new f(i,this.successHandlerFn.bind(this),this.errorHandlerFn.bind(this),o,s)}else if(this.oDataRequest){this.oDataRequest.refresh()}if(e>0){l.info("Started timeout to call "+i+" again in "+e+" seconds",null,y);this.iLastTimeoutStart=Date.now();this.timer=setTimeout(this.loadData.bind(this,e,false),p.sanitizeTimeoutDelay(e*1e3))}},successHandlerFn:function(e){this.updatePropertiesHandler(e)},errorHandlerFn:function(e){var t=e&&e.message?e.message:e;var r=this.getView().getModel().getProperty("/configuration/serviceUrl");if(e.statusText==="Abort"||e.aborted===true){l.info("Data request from service "+r+" was aborted",null,y);this.bShouldNotRefreshDataAfterInit=false}else{if(e.response){t+=" - "+e.response.statusCode+" "+e.response.statusText}l.error("Failed to update data via service "+r+": "+t,null,y);this._setTileIntoErrorState()}},_setTileIntoErrorState:function(){var e=t.getResourceBundleModel().getResourceBundle();this.updatePropertiesHandler({number:"???",info:e.getText("dynamic_data.error")})},_normalizeNumber:function(e,t,i,a){var o;if(isNaN(e)){o=e}else{var s=r.getFloatInstance({maxFractionDigits:a});if(!i){var n=Math.abs(e);if(n>=1e9){i="B";e/=1e9}else if(n>=1e6){i="M";e/=1e6}else if(n>=1e3){i="K";e/=1e3}}o=s.format(e)}var l=o;var u=l[t-1];t-=u==="."||u===","?1:0;l=l.substring(0,t);return{displayNumber:l,numberFactor:i}},updatePropertiesHandler:function(e){var t=this.getView().getModel().getProperty("/originalProperties");var a=this.getView().getModel().getProperty("/properties");var o=[{dataField:"title",modelField:"title"},{dataField:"subtitle",modelField:"subtitle"},{dataField:"icon",modelField:"icon"},{dataField:"info",modelField:"info"},{dataField:"infoState",modelField:"infoState"},{dataField:"targetURL",modelField:"targetURL"},{dataField:"stateArrow",modelField:"number_state_arrow"},{dataField:"numberState",modelField:"number_value_state"},{dataField:"numberUnit",modelField:"number_unit"},{dataField:"numberFactor",modelField:"number_factor"}];o.forEach(function(r){var i=e[r.dataField];var o=!i;var s=D[r.modelField];if(o){a[r.modelField]=t[r.modelField]||s}else if(this._isResetValue(i)){a[r.modelField]=s}else{a[r.modelField]=i}}.bind(this));a.number_value=!isNaN(e.number)?e.number:D.number_value;a.number_digits=e.numberDigits>=0?e.numberDigits:4;var s=[];if(e.targetParams){s.push(e.targetParams)}if(e.results){var n;var l;var u=0;e.results.forEach(function(e){l=e.number||0;if(typeof l==="string"){l=parseFloat(l)}u+=l;n=e.targetParams;if(n){s.push(n)}});a.number_value=u}if(s.length>0){var f=a.targetURL.indexOf("?")!==-1?"&":"?";a.targetURL+=f+s.join("&")}if(!isNaN(e.number)){if(typeof e.number==="string"){e.number=e.number.trim()}var p=this._shouldProcessDigits(e.number,e.numberDigits);var d=a.icon?4:5;if(e.number&&e.number.toString().length>=d||p){var c=this._normalizeNumber(e.number,d,e.numberFactor,e.numberDigits);a.number_factor=c.numberFactor;a.number_value=c.displayNumber}else{var h=r.getFloatInstance({maxFractionDigits:d});a.number_value=h.format(e.number)}}a.sizeBehavior=i.last("/core/home/sizeBehavior");this.getView().getModel().refresh()},_shouldProcessDigits:function(e,t){var r;e=typeof e!=="string"?e.toString():e;if(e.indexOf(".")!==-1){r=e.split(".")[1].length;if(r>t){return true}}return false},_getLeanUrl:function(e){return a.getLeanURL(e)},_formatValueColor:function(e){if(e==="Positive"){return m.Good}if(e==="Negative"){return m.Error}return m[e]||m.Neutral},_getValueColor:function(e){var t=this._formatValueColor(e);if(t===m.Neutral){return m.None}return t},_isResetValue:function(e){if(typeof e!=="string"){return false}return e===_},onExit:function(){if(this.oDataRequest){this.stopRequests();this.oDataRequest.destroy()}this._aDoables.forEach(function(e){e.off()});this._aDoables=[]}})},true);
//# sourceMappingURL=DynamicTile.controller.js.map
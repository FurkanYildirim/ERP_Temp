//Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/base/Log","sap/base/util/deepExtend","sap/base/util/ObjectPath","sap/ui/core/UIComponent","sap/ushell/components/contentFinder/model/GraphQLModel"],function(t,e,i,a,r){"use strict";var s={widgetGallery:"widgetGallery",appSearchTiles:"appSearch_tiles",appSearchCards:"appSearch_cards"};var n={appSearch_tiles:["sap.ushell.StaticAppLauncher","sap.ushell.DynamicAppLauncher"],appSearch_cards:["sap.card"]};var o={navigationTargets:s,activeNavigationTarget:s.widgetGallery,restrictedMode:false,widgetGallery:{widgetGroups:[]},appSearch:{growingThreshold:30,visualizationsLoaded:false,selectedAppCount:0,hasSelectables:true,currentSelectedTreeNode:"",searchTerm:"",filteredAppCount:0,showSelectedPressed:false,originalVisualizations:{cards:[],tiles:[]},visualizations:{cards:[],tiles:[]},totalCount:0,originalRestrictedVisualizations:[],restrictedVisualizations:[]}};return a.extend("sap.ushell.components.contentFinder.Component",{metadata:{manifest:"json",library:"sap.ushell"},logComponent:"sap.ushell.components.ContentFinder.Component",init:function(){a.prototype.init.apply(this,arguments);this.oResourceBundle=this.getModel("i18n").getResourceBundle();this.oRootView=this.getRootControl();this.aRegisteredEvents=[];var t=new r;t.setSizeLimit(Infinity);this.setModel(t);this._initializeModel();this._oRootControlLoadedPromise=this.rootControlLoaded().then(function(){this.oNavContainer=this.oRootView.byId("contentFinderNavContainer");this.oContentFinderWidgetGalleryPage=this.oRootView.byId("contentFinderWidgetGalleryPage");this.oContentFinderAppSearchPage=this.oRootView.byId("contentFinderAppSearchPage");this.oDialog=this.oRootView.byId("contentFinderDialog")}.bind(this))},show:function(t){if(t&&!Object.values(s).includes(t)){return Promise.reject(new Error("Invalid navigation target provided. Could not open ContentFinder dialog."))}t=t||s.widgetGallery;return this.navigate(t).then(function(){this.oDialog.open()}.bind(this))},setWidgetGroups:function(t){this.getModel().setProperty("/widgetGallery/widgetGroups",t)},queryVisualizations:function(t,e){var i=this.getModel();var a=i.getProperty("/activeNavigationTarget");var r=n[a]||[];if(!this._bLoading){this._bLoading=true;i.setProperty("/appSearch/visualizationsLoaded",false);this.fireEvent("visualizationFilterApplied",{pagination:{skip:t,top:i.getProperty("/appSearch/growingThreshold")},types:r,search:e||null})}},setVisualizationData:function(t){var a=i.get("Visualizations.nodes",t)||[];var r=i.get("Visualizations.totalCount",t)||0;var s=this.getModel();var n=this._prepareTiles(a);var o=this._prepareCards(a);s.setProperty("/appSearch/originalVisualizations/tiles",e([],n));s.setProperty("/appSearch/originalVisualizations/cards",e([],o));s.setProperty("/appSearch/visualizations/tiles",e([],n));s.setProperty("/appSearch/visualizations/cards",e([],o));s.setProperty("/appSearch/totalCount",r);s.setProperty("/appSearch/visualizationsLoaded",true);this._updateVisualizationsRestricted();this._bLoading=false},setVisualizationDataPaginated:function(t){var a=i.get("Visualizations.nodes",t)||[];var r=i.get("Visualizations.totalCount",t)||0;var s=this.getModel();var n=this._prepareTiles(a);var o=this._prepareCards(a);var l=s.getProperty("/appSearch/originalVisualizations/tiles");var p=s.getProperty("/appSearch/originalVisualizations/cards");var c=s.getProperty("/appSearch/visualizations/tiles");var d=s.getProperty("/appSearch/visualizations/cards");s.setProperty("/appSearch/originalVisualizations/tiles",l.concat(e([],n)));s.setProperty("/appSearch/originalVisualizations/cards",p.concat(e([],o)));s.setProperty("/appSearch/visualizations/tiles",c.concat(e([],n)));s.setProperty("/appSearch/visualizations/cards",d.concat(e([],o)));s.setProperty("/appSearch/totalCount",r);s.setProperty("/appSearch/visualizationsLoaded",true);this._updateVisualizationsRestricted();this._bLoading=false},setRestrictedMode:function(t){this.getModel().setProperty("/restrictedMode",!!t)},setContextData:function(t){var a=i.get("restrictedVisualizations",t)||[];var r=this.getModel();r.setProperty("/appSearch/originalRestrictedVisualizations",e([],a));r.setProperty("/appSearch/restrictedVisualizations",e([],a));this._updateVisualizationsRestricted()},getNavContainer:function(){return this._oRootControlLoadedPromise.then(function(){return this.oNavContainer}.bind(this))},getSelectedAppBoxes:function(){var t=this.getModel().getProperty("/appSearch/visualizations");var e=[];Object.values(t).forEach(function(t){var i=t.filter(function(t){return t.selected});e=e.concat(i)});return e},addVisualizations:function(){var t=this.getSelectedAppBoxes();if(t.length>0){this.fireEvent("visualizationsAdded",{visualizations:t})}},attachContentFinderClosed:function(t,e){this.aRegisteredEvents.push({id:"contentFinderClosed",callback:t,listener:e});this.attachEventOnce("contentFinderClosed",t,e);return this},attachWidgetSelected:function(t,e,i){this.aRegisteredEvents.push({id:"widgetSelected",callback:e,listener:i});this.attachEventOnce("widgetSelected",t,e,i);return this},attachVisualizationsAdded:function(t,e,i){this.aRegisteredEvents.push({id:"visualizationsAdded",callback:e,listener:i});this.attachEventOnce("visualizationsAdded",t,e,i);return this},attachVisualizationFilterApplied:function(t,e,i){this.aRegisteredEvents.push({id:"visualizationFilterApplied",callback:e,listener:i});this.attachEvent("visualizationFilterApplied",t,e,i);return this},resetAppSearch:function(){var t=this.getModel().getData();var i=e({},o.appSearch);i.originalVisualizations=e({},t.appSearch.originalVisualizations);i.originalRestrictedVisualizations=[].concat(t.appSearch.originalRestrictedVisualizations);i.visualizations=e({},t.appSearch.originalVisualizations);i.restrictedVisualizations=[].concat(t.appSearch.originalRestrictedVisualizations);t.appSearch=i;this.getModel().setData(t)},navigate:function(t){var e=this.getModel();e.setProperty("/activeNavigationTarget",t);if(t===s.appSearchTiles||t===s.appSearchCards){e.setProperty("/appSearch/originalVisualizations/tiles",[]);e.setProperty("/appSearch/originalVisualizations/cards",[]);e.setProperty("/appSearch/visualizations/tiles",[]);e.setProperty("/appSearch/visualizations/cards",[]);this._bLoading=false;this.queryVisualizations(0);return this.getNavContainer().then(function(t){t.to(this.oContentFinderAppSearchPage)}.bind(this))}return this.getNavContainer().then(function(t){t.to(this.oContentFinderWidgetGalleryPage)}.bind(this))},_initializeModel:function(){this.getModel().setData(e({},o))},_prepareTiles:function(e){var a=e.filter(function(t){return["sap.ushell.StaticAppLauncher","sap.ushell.DynamicAppLauncher"].indexOf(t.Type)>-1});return a.map(function(e){if(!e.Descriptor){t.error("No Descriptor available. Cannot load this tile!",null,this.logComponent);return}var a=e.Descriptor["sap.app"];var r=e.Descriptor["sap.fiori"];var s="";if(r){s=r.registrationIds[0]}else if(a&&a.hasOwnProperty("id")){s=a.id}return{id:e.Id,appId:s,icon:i.get("icons.icon",e.Descriptor["sap.ui"])||"",info:a&&a.info||"",launchUrl:e.Descriptor["sap.flp"]&&e.Descriptor["sap.flp"].target||"",subtitle:a&&a.subTitle||"",title:a&&a.title||"",type:e.Type,dataHelpId:e.Id,vizData:e,selected:false,added:false}}.bind(this))},_prepareCards:function(e){var a=e.filter(function(t){return t.Type==="sap.card"});return a.map(function(e){if(!e.Descriptor){t.error("No Descriptor available. Cannot load this card!",null,this.logComponent);return}var a=e.Descriptor["sap.app"];var r=a&&a.id||"";return{id:e.Id,appId:r,icon:i.get("icons.icon",e.Descriptor["sap.ui"])||"",info:a&&a.info||"",subtitle:a&&a.subTitle||"",title:a&&a.title||"",type:e.Type,manifest:e.Descriptor,dataHelpId:e.Id,vizData:e}}.bind(this))},_updateVisualizationsRestricted:function(){var t=this.getModel();var e=t.getProperty("/appSearch/restrictedVisualizations");var i=t.getProperty("/appSearch/visualizations/tiles");var a=i.map(function(t){t.added=e.includes(t.id);return t});t.setProperty("/appSearch/visualizations/tiles",a)},_unregisterEvents:function(){this.aRegisteredEvents.forEach(function(t){var e=t.id;var i=t.callback;var a=t.listener;this.detachEvent(e,i,a)}.bind(this));this.aRegisteredEvents=[]}})});
//# sourceMappingURL=Component.js.map
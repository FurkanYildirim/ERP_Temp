/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ui/core/UIComponent","sap/ui/model/json/JSONModel","sap/ovp/cards/CommonUtils","sap/ui/Device","sap/ui/model/resource/ResourceModel","sap/ui/core/mvc/ViewType","sap/base/util/merge","sap/ovp/app/OVPUtils","sap/ovp/app/OVPLogger","sap/ui/core/mvc/XMLView","sap/ui/base/Object","sap/ui/core/Core"],function(e,t,a,n,i,o,r,s,l,p,d,c){"use strict";var u=new l("OVP.generic.base.Component");return e.extend("sap.ovp.cards.generic.base.Component",{metadata:{properties:{contentFragment:{type:"string"},controllerName:{type:"string",defaultValue:"sap.ovp.cards.generic.Card"},headerExtensionFragment:{type:"string"},contentPosition:{type:"string",defaultValue:"Middle"},headerFragment:{type:"string",defaultValue:"sap.ovp.cards.generic.Header"},footerFragment:{type:"string"},identificationAnnotationPath:{type:"string",defaultValue:"com.sap.vocabularies.UI.v1.Identification"},selectionAnnotationPath:{type:"string"},filters:{type:"object"},parameters:{type:"object"},addODataSelect:{type:"boolean",defaultValue:false},enableAddToInsights:{type:"boolean",defaultValue:false}},version:"1.115.0",library:"sap.ovp",includes:[],dependencies:{libs:[],components:[]},config:{}},setSelectionVariant:function(e,t){if(/^@/.test(e)){e=e.slice(1)}t.selectionAnnotationPath=e},setPresentationVariant:function(e,t,a){if(/^@/.test(e)){e=e.slice(1)}t.presentationAnnotationPath=e;var n=e.split("/");var i=n.length===1?a[e].Visualizations:a[n[0]][n[1]][n[2]].Visualizations;var o;for(o=0;o<i.length;o++){var r=i[o].AnnotationPath;if(r){if(/^@/.test(r)){r=r.slice(1)}if(/.LineItem/.test(r)){t.annotationPath=r;break}}}for(o=0;o<i.length;o++){var r=i[o].AnnotationPath;if(r){if(/^@/.test(r)){r=r.slice(1)}if(/.Chart/.test(r)){t.chartAnnotationPath=r;break}}}},setDataPointAnnotationPath:function(e,t){if(/^@/.test(e)){e=e.slice(1)}t.dataPointAnnotationPath=e},getCustomPreprocessor:function(){},getPreprocessors:function(e){var i=this.getComponentData(),o=i.settings,l=i.model,p,d,c,u;if(o.description&&!o.subTitle){o.subTitle=o.description}if(l&&a.isODataV4(l)){p=l&&l.getMetaModel();var f="/"+o.entitySet;var d=p.getObject(f);u=p.createBindingContext(f);if(d&&d["$Type"]){c=p.createBindingContext("/"+d["$Type"])}}else if(l&&o.entitySet){p=l&&l.getMetaModel();var v=p.getODataEntitySet(o.entitySet);var h=p.getODataEntitySet(o.entitySet,true);d=p.getODataEntityType(v.entityType);u=p.createBindingContext(h);c=p.createBindingContext(d.$path)}var g=this._getCardPropertyDefaults();var m=this._completeLayoutDefaults(g,o);var y,C;if(i.appComponent&&i.appComponent.getModel("ui")&&i.appComponent.getModel("ui").oData){var b=i.appComponent.getModel("ui").oData;y=b.showDateInRelativeFormat;C=b.disableTableCardFlexibility}else{if(i.showDateInRelativeFormat){y=i.showDateInRelativeFormat}if(i.disableTableCardFlexibility){C=i.disableTableCardFlexibility}}if(i.ovpCardsAsApi&&i.parentView&&typeof i.parentView.getViewName==="function"&&i.parentView.getViewName()!=="sap.ovp.cards.rta.SettingsDialog"){i.settings.enableAddToInsights=false}var P=i&&i.appComponent&&i.appComponent.ovpConfig||{};var D=true;if(i.ovpCardsAsApi){D=false}var V=P.bInsightDTEnabled||P.bInsightRTEnabled||false;if(P.isTeamsModeActive){V=false}var I={metaModel:p,entityType:d,webkitSupport:n.browser.webkit,layoutDetail:m&&m.cardLayout?m.cardLayout.containerLayout:"fixed",bInsightDTEnabled:P.bInsightDTEnabled||false,bInsightRTEnabled:P.bInsightRTEnabled||false,bInsightEnabled:V,showDateInRelativeFormat:y,disableTableCardFlexibility:C,cardId:i.cardId,enableAdditionalActionsManageCards:D};if(!!i&&!!i.cardId){var A=i.mainComponent;var T=null;if(!!A){T=A._getCardFromManifest(i.cardId)?A._getCardFromManifest(i.cardId).template:null}else{T=i.template}if(!!T){I.template=T}var M=["sap.ovp.cards.v4.charts.analytical","sap.ovp.cards.v4.table","sap.ovp.cards.v4.list"];if(P.enableV4Insight&&M.includes(T)){i.settings.enableAddToInsights=true}}g.densityStyle=a._setCardpropertyDensityAttribute();if(i.errorReason){var S=i.errorReason;var L=S.getParameters?S.getParameters():S.mParameters;var w="sap-icon://message-error";if(L&&L.response){g.errorStatusCode=L.response.statusCode;g.errorStatusText=L.response.statusText;g.responseText=L.response.responseText;g.sMessageIcon=L.response.sIcon?L.response.sIcon:w}}if(m){I.cardLayout=m.cardLayout}if(g.state!=="Error"){if(o&&o.kpiAnnotationPath){var O=d[o.kpiAnnotationPath];var R=g.contentFragment;if(O&&["sap.ovp.cards.charts.analytical.analyticalChart","sap.ovp.cards.v4.charts.analytical.analyticalChart","sap.ovp.cards.charts.smart.analyticalChart"].includes(R)){var x=O.SelectionVariant&&O.SelectionVariant.Path?O.SelectionVariant.Path:o.kpiAnnotationPath+"/SelectionVariant";if(x){this.setSelectionVariant(x,o)}var F=O.Detail&&O.Detail.DefaultPresentationVariant&&O.Detail.DefaultPresentationVariant.Path?O.Detail.DefaultPresentationVariant.Path:o.kpiAnnotationPath+"/Detail/DefaultPresentationVariant";if(F){this.setPresentationVariant(F,o,d)}var B=O.DataPoint&&O.DataPoint.Path?O.DataPoint.Path:o.kpiAnnotationPath+"/DataPoint";if(B){this.setDataPointAnnotationPath(B,o)}}}else if(o&&o.selectionPresentationAnnotationPath){var k=d[o.selectionPresentationAnnotationPath];if(k){var x=k.SelectionVariant&&k.SelectionVariant.Path;if(x){this.setSelectionVariant(x,o)}var F=k.PresentationVariant&&k.PresentationVariant.Path;if(F){this.setPresentationVariant(F,o,d)}}}}if(i.ovpCardsAsApi&&o.ignoreSelectionVariant){o.selectionAnnotationPath="";var _=[];for(var E=0;!!o.filters&&E<o.filters.length;E++){_.push({id:"headerFilterText--"+(E+1),index:E})}o.idForExternalFilters=_}if(!!I.entityType&&!!o.selectionAnnotationPath&&!!I.entityType[o.selectionAnnotationPath]){var U=I.entityType[o.selectionAnnotationPath].SelectOptions;for(var j=0;!!U&&j<U.length;j++){U[j].id="headerFilterText--"+(j+1)}I.entityType[o.selectionAnnotationPath].SelectOptions=U}if((I.template==="sap.ovp.cards.linklist"||I.template==="sap.ovp.cards.v4.linklist")&&!!o.staticContent){for(var N=0;N<o.staticContent.length;N++){o.staticContent[N].id="linkListItem--"+(N+1)}if(o.staticContent){g.showRefresh=false}}else if(I.template==="sap.ovp.cards.charts.analytical"||I.template==="sap.ovp.cards.v4.charts.analytical"){o.dataStep=o.dataStep?o.dataStep:10}g=s.merge(true,{},I,g,o);var H=new t(g);var K={xml:{bindingContexts:{entityType:c,entitySet:u},models:{device:a.deviceModel,entityType:p,entitySet:p,ovpMeta:p,ovpCardProperties:H,ovplibResourceBundle:e,ovpConstants:a.ovpConstantModel},ovpCardProperties:H,dataModel:l,_ovpCache:{}}};return r({},this.getCustomPreprocessor(),K)},_completeLayoutDefaults:function(e,t){var a={},n=this.getComponentData(),i=null,o=null;if(n.appComponent){i=n.appComponent.getOvpConfig()}if(!i){return null}if(i.containerLayout==="resizable"&&n.cardId&&e.contentFragment!=="sap.ovp.cards.quickview.Quickview"){o=n.appComponent.getDashboardLayoutUtil();var r=n.cardId;var s=o.aCards.filter(function(e){return e.id===r});a.cardLayout=s[0].dashboardLayout;a.cardLayout.containerLayout=i.containerLayout;a.cardLayout.iRowHeightPx=o.ROW_HEIGHT_PX;a.cardLayout.iCardBorderPx=o.CARD_BORDER_PX;a.cardLayout.headerHeight=s[0].dashboardLayout.headerHeight}return a},_getCardPropertyDefaults:function(){var e={};var t=this.getMetadata().getAllProperties();var a;for(var n in t){a=t[n];if(a.defaultValue!==undefined){e[a.name]=a.defaultValue}}return e},getOvplibResourceBundle:function(){if(!this.ovplibResourceBundle){var e=c.getLibraryResourceBundle("sap.ovp");this.ovplibResourceBundle=e?new i({bundleUrl:e.oUrlInfo.url}):null}return this.ovplibResourceBundle},_getCacheKeys:function(){var e=this.getComponentData&&this.getComponentData();if(e.ovpCardsAsApi){return}if(e.appComponent&&!d.isA(e.appComponent,"sap.ui.base.ManagedObject")){return}var t=e&&e.settings&&e.settings.isObjectStream;if(t){return}var a=e&&e.model;if(a){var n=[];if(a.metadataLoaded&&typeof a.metadataLoaded==="function"){var i=a.metadataLoaded().then(function(e){var t;if(e&&e.lastModified){t=new Date(e.lastModified).getTime()+""}else{u.error("No valid cache key segment last modification date provided by the OData Model");t=(new Date).getTime()+""}return t});n.push(i)}if(a.annotationsLoaded&&typeof a.metadataLoaded==="function"){var o=a.annotationsLoaded().then(function(e){var t=0;if(e){for(var a=0;a<e.length;a++){if(e[a].lastModified){var n=new Date(e[a].lastModified).getTime();if(n>t){t=n}}}}if(t===0){u.error("No valid cache key segment last modification date provided by OData annotations");t=(new Date).getTime()}return t+""});n.push(o)}return n}},createContent:function(){var e=this.getComponentData&&this.getComponentData();var t=e.model;var n;var i;var r=e&&e.mainComponent;var s=r&&r.oModelViewMap;var l=e&&e.modelName;var d=function(){if(t&&l){t.bIncludeInCurrentBatch=false;if(s&&l&&s[l]&&s[l][e.cardId]){delete s[l][e.cardId];if(Object.keys(s[l]).length>0){t.bIncludeInCurrentBatch=true}}}};if(e&&e.mainComponent){n=e.mainComponent._getOvplibResourceBundle()}else{n=this.getOvplibResourceBundle()}i=this.getPreprocessors(n);var c={preprocessors:i,type:o.XML,viewName:a.isODataV4(t)?"sap.ovp.cards.v4.generic.Card":"sap.ovp.cards.generic.Card"};var u=this._getCacheKeys();if(u&&u.length&&u.length>0){c.async=true;c.cache={keys:u}}var f=this._getCardPropertyDefaults().state;var v=e.cardId+(f?f:"Original");if(!f){v=v+(e.settings.selectedKey?"_Tab"+e.settings.selectedKey:"")}if(t&&t.bUseBatch&&!c.async){d()}if(e.appComponent&&typeof e.appComponent.createId==="function"){v=e.appComponent.createId(v)}var h=new p(e.containerId==="dialogCard"?undefined:v,c);if(c.async){var g=h.onControllerConnected;h.onControllerConnected=function(){if(t&&t.bUseBatch){d()}g.apply(h,arguments)}}h.setModel(t);if(e.i18n){h.setModel(e.i18n,"@i18n")}h.setModel(i.xml.ovpCardProperties,"ovpCardProperties");h.setModel(n,"ovplibResourceBundle");return h}})});
//# sourceMappingURL=Component.js.map
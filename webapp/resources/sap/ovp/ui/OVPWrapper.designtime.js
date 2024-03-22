/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ovp/app/resources","sap/ovp/cards/CommonUtils","sap/ovp/app/OVPUtils"],function(a,t,e){"use strict";var r=[];function o(a){var e=function(a){var t=a.hasStyleClass("sapUiSizeCompact")&&a.hasStyleClass("dropDrownCompact"),e=a.hasStyleClass("sapUiSizeCozy")&&a.hasStyleClass("sapOvpDropDownPadding")&&a.hasStyleClass("dropDrownCozy");return t||e};var o=function(a){var t=a.hasStyleClass("sapOvpHeaderCounter");return t};var s=function(a){var t=a.hasStyleClass("cardHeaderText")&&a.hasStyleClass("sapOvpKPIHeaderTrendPercentStyle"),e=a.hasStyleClass("KpiDeviationText")&&a.hasStyleClass("sapOvpKPIHeaderTrendPercentStyle");return t||e};var i=function(a){var t=false;for(var e=0;e<r.length;e++){if(a.sId&&a.sId.indexOf(r[e])>-1){t=true}}return t};var n=a.getMetadata().getName();if(a.oComponentData&&a.oComponentData.mainComponent&&a.oComponentData.mainComponent.oCards){var p=a.oComponentData.mainComponent.oCards.filter(function(t){return t.id===a.oComponentData.cardId})[0];var l=p.template;var d=t.getApp().byId(a.oContainer.sId).getComponentInstance().getRootControl().getController();var m=d.getCardPropertiesModel().getProperty("/headerExtensionFragment");if(l&&!l.startsWith("sap.ovp.cards")&&m&&!m.startsWith("sap.ovp.cards")){if(r.indexOf(a.oComponentData.cardId)===-1){r.push(a.oComponentData.cardId)}}}var u=[{type:"sap.m.FlexBox",id:"kpiHBoxNumeric",hasValidator:false},{type:"sap.m.Button",id:"sapOvpCardAdditionalActions",hasValidator:false},{type:"sap.m.Text",id:"ovpTargetValue",hasValidator:true,fnValidator:s},{type:"sap.m.Text",id:"kpiNumberPercentage",hasValidator:true,fnValidator:s},{type:"sap.m.Text",id:"ovpCountHeader",hasValidator:true,fnValidator:o},{type:"sap.m.List",id:"ovpLinkList",hasValidator:false},{type:"sap.m.CustomListItem",id:"linkListItem",hasValidator:false},{type:"sap.m.CustomListItem",id:"ovpList",hasValidator:false},{type:"sap.m.Text",id:"ovpList",hasValidator:false},{type:"sap.ui.comp.navpopover.SmartLink",id:"ovpList",hasValidator:false},{type:"sap.m.Link",id:"ovpList",hasValidator:false},{type:"sap.ui.comp.navpopover.SmartLink",id:"ovpTable",hasValidator:false},{type:"sap.m.VBox",id:"kpiHeader",hasValidator:false},{type:"sap.m.Toolbar",id:"toolbar",hasValidator:true,fnValidator:e},{type:"sap.m.StandardListItem",id:"listItem",hasValidator:false},{type:"sap.m.Text",id:"Original--ovpHeaderTitle",hasValidator:true,fnValidator:i},{type:"sap.m.Text",id:"Original--SubTitle-Text",hasValidator:true,fnValidator:i}];for(var v in u){if(n===u[v].type&&a&&a.getId()&&a.getId().indexOf(u[v].id)>-1){if(u[v].hasValidator){return u[v].fnValidator(a)}else{return true}}}return false}return{default:{controllerExtensionTemplate:"sap/ovp/ui/OVPControllerExtensionTemplate",actions:{},aggregations:{DynamicPage:{propagateMetadata:function(a){var r=a.getMetadata().getName();var s=t._getLayer();var i=t.getQueryParameterValue("fiori-tools-rta-mode");var n=o(a);if(n){return{actions:"not-adaptable"}}else if(r!=="sap.ovp.ui.EasyScanLayout"&&r!=="sap.ui.core.ComponentContainer"&&!((s&&s===e.Layers.customer_base||i)&&r==="sap.ui.comp.smartfilterbar.SmartFilterBar")){return{actions:{remove:null,reveal:null}}}},propagateRelevantContainer:false}}},strict:{actions:{},name:{singular:a&&a.getText("Card"),plural:a&&a.getText("Cards")}}}},false);
//# sourceMappingURL=OVPWrapper.designtime.js.map
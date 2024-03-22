/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ovp/cards/CommonUtils","sap/ui/fl/write/api/ControlPersonalizationWriteAPI","sap/ovp/app/OVPLogger"],function(a,r,n){"use strict";var e=new n("OVP.cards.PersonanlizationUtils");function t(a,r){r.every(function(r){if(r.id===a.cardId){r.selectedKey=a.selectedKey;return false}return true});return r}function o(a,r){r.every(function(r){if(r.id===a.cardId){r.visibility=a.visibility;return false}return true});return r}function i(r,n,e){var t=a.getApp(),o=t._getCardId(r.id);n.every(function(a){if(a.id===o){a.visibility=e;return false}return true});return n}function u(a,r){var n=[];var e,t;e=r.filter(function(a){return a.visibility});r.forEach(function(a,r){if(!a.visibility){n.push({card:a,index:r})}});if(!e[a.oldPosition]||!e[a.position]){return r}t=e[a.oldPosition];e[a.oldPosition]=e[a.position];e[a.position]=t;n.forEach(function(a){e.splice(a.index,0,a.card)});r=e;return r}function s(a,r){r.every(function(r){if(r.id===a.cardId){Object.keys(a.dashboardLayout).forEach(function(n){if(!r.dashboardLayout[n]){r.dashboardLayout[n]={}}if(a.dashboardLayout[n].rowSpan){r.dashboardLayout[n].rowSpan=a.dashboardLayout[n].rowSpan}if(a.dashboardLayout[n].colSpan){r.dashboardLayout[n].colSpan=a.dashboardLayout[n].colSpan}if(a.dashboardLayout[n].maxColSpan){r.dashboardLayout[n].maxColSpan=a.dashboardLayout[n].maxColSpan}if(a.dashboardLayout[n].noOfItems){r.dashboardLayout[n].noOfItems=a.dashboardLayout[n].noOfItems}if(a.dashboardLayout[n].hasOwnProperty("autoSpan")){r.dashboardLayout[n].autoSpan=a.dashboardLayout[n].autoSpan}if(a.dashboardLayout[n].row){r.dashboardLayout[n].row=a.dashboardLayout[n].row}if(a.dashboardLayout[n].column){r.dashboardLayout[n].col=a.dashboardLayout[n].column}if(a.dashboardLayout[n].hasOwnProperty("showOnlyHeader")){r.dashboardLayout[n].showOnlyHeader=a.dashboardLayout[n].showOnlyHeader}});return false}return true});return r}function d(a,r){if(!Array.isArray(r)||!a){return a}var n=[];a.forEach(function(a){var r={};Object.keys(a).forEach(function(n){r[n]=a[n]});n.push(r)});var e={VENDOR:[],CUSTOMER_BASE:[],CUSTOMER:[],USER:[]};var d=r.reduce(function(a,r){a[r.getLayer()].push(r);return a},e);var c=[].concat(d["VENDOR"],d["CUSTOMER_BASE"],d["CUSTOMER"],d["USER"]);c.forEach(function(a){switch(a.getChangeType()){case"viewSwitch":n=t(a.getContent(),n);break;case"visibility":n=o(a.getContent(),n);break;case"hideCardContainer":n=i(a.getContent().card,n,false);break;case"unhideCardContainer":n=i(a.getContent().card,n,true);break;case"position":n=u(a.getContent(),n);break;case"dragOrResize":n=s(a.getContent(),n);break;default:break}});return n}function c(a,r){var n=a.filter(function(a){var n=false;r.forEach(function(r){if(a.id===r.id){n=true;return}});return!n});return r.concat(n)}function f(n,t){var o=a.getApp();var i={};if(o.getOwnerComponent()){i=o.getOwnerComponent().oOvpConfig}if(o.getUIModel().getProperty("/bRTAActive")||i.bInsightDTEnabled){return}var u=t?t.byId("ovpLayout"):null;var s=[],d=[],c=[];if(!Array.isArray(n)){n=[n]}n.forEach(function(a){var r=a.content.cardId;a.jsOnly=true;s.push({selectorElement:t.byId(r),changeSpecificData:a});d.push(t.byId(r));c.push(a.changeType)});r.isCondensingEnabled().then(function(a){if(a){return y(s,u)}else{return h(d,c).finally(function(){return y(s,u)})}}).then(function(){e.info("Personalization changes have been saved in lrep backend")}).catch(function(a){e.error("Personalization changes were not saved",a)})}function h(a,n){return r.reset({selectors:a,changeTypes:n})}function y(a,n){return r.add({changes:a},true).then(function(a){return r.save({changes:a,selector:n})})}var l={mergeChanges:d,addMissingCardsFromManifest:c,savePersonalization:f};return l},true);
//# sourceMappingURL=PersonalizationUtils.js.map
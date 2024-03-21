/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/fl/write/api/FieldExtensibility","sap/ui/fl/Utils","sap/ui/fl/Layer","sap/ui/fl/LayerUtils","sap/ui/dt/OverlayUtil","sap/ui/dt/DOMUtil","sap/ui/dt/ElementUtil","sap/ui/dt/MetadataPropagationUtil","sap/ui/rta/util/hasStableId","sap/m/MessageBox","sap/ui/rta/util/BindingsExtractor","sap/base/util/restricted/_omit","sap/ui/model/json/JSONModel","sap/ui/core/Fragment"],function(jQuery,e,t,r,n,i,a,l,o,s,u,g,c,f,d){"use strict";var v={};v.RESOLVED_PROMISE=Promise.resolve(true);v._sFocusableOverlayClass=".sapUiDtOverlaySelectable";v._sRtaStyleClassName="";v.getRtaStyleClassName=function(){return v._sRtaStyleClassName};v.setRtaStyleClassName=function(e){if(e===r.USER){v._sRtaStyleClassName=""}else if(n.getLayerIndex(e)>-1){v._sRtaStyleClassName="sapUiRTABorder"}};v.isServiceUpToDate=function(t){return e.isExtensibilityEnabled(t).then(function(r){if(r){var n=t.getModel();if(n&&n.sServiceUrl){return e.isServiceOutdated(n.sServiceUrl).then(function(t){if(t){e.setServiceValid(n.sServiceUrl);sap.ui.getCore().getEventBus().publish("sap.ui.core.UnrecoverableClientStateCorruption","RequestReload",{})}})}}})};v.openRemoveConfirmationDialog=function(e,t){var r=sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");var n;return new Promise(function(e){n=r.getText("CTX_REMOVE_TITLE");var i={messageText:t,titleText:n,icon:"sap-icon://question-mark",removeText:r.getText("BTN_FREP_REMOVE"),cancelText:r.getText("BTN_FREP_CANCEL")};var a=new f;a.setData(i);var l;var o=function(){if(l){l.close();l.destroy();l=null}};var s={removeField:function(){o();e(true)},closeDialog:function(){o();e(false)}};if(!l){d.load({name:"sap.ui.rta.view.RemoveElementDialog",controller:s}).then(function(e){l=e;l.setModel(a);l.addStyleClass(v.getRtaStyleClassName());l.open()})}else{l.addStyleClass(v.getRtaStyleClassName());l.open()}})};v.isOverlaySelectable=function(e){return e.isSelectable()&&a.isVisible(e.getDomRef())};v.getPropertyValue=function(e,t){var r=e.getMetadata().getPropertyLikeSetting(t);var n=r._sGetter;return e[n]()};v.getOverlayInstanceForDom=function(e){var t=jQuery(e).attr("id");if(t){return sap.ui.getCore().byId(t)}};v.getFocusedOverlay=function(){if(document.activeElement){var e=sap.ui.getCore().byId(document.activeElement.id);if(e&&e.isA("sap.ui.dt.ElementOverlay")){return e}}};v.getFocusableParentOverlay=function(e){if(!e){return undefined}var t=e.getParentElementOverlay();while(t&&!t.getSelectable()){t=t.getParentElementOverlay()}return t};v.getFirstFocusableDescendantOverlay=function(e){return i.getFirstDescendantByCondition(e,this.isOverlaySelectable)};v.getLastFocusableDescendantOverlay=function(e){return i.getLastDescendantByCondition(e,this.isOverlaySelectable)};v.getNextFocusableSiblingOverlay=function(e){var t=true;var r=i.getNextSiblingOverlay(e);while(r&&!this.isOverlaySelectable(r)){r=i.getNextSiblingOverlay(r)}if(!r){r=this._findSiblingOverlay(e,t)}return r};v.getPreviousFocusableSiblingOverlay=function(e){var t=false;var r=i.getPreviousSiblingOverlay(e);while(r&&!this.isOverlaySelectable(r)){r=i.getPreviousSiblingOverlay(r)}if(!r){r=this._findSiblingOverlay(e,t)}return r};v._findSiblingOverlay=function(e,t){var r=e.getParentElementOverlay();if(r){var n=t?i.getNextSiblingOverlay(r):i.getPreviousSiblingOverlay(r);if(!n){return this._findSiblingOverlay(r,t)}var a=t?this.getFirstFocusableDescendantOverlay(n):this.getLastFocusableDescendantOverlay(n);return a}return undefined};v.getIndex=function(e,t,r,n){var i;if(n&&typeof n==="function"){i=n(e,t)}else{var a=e.getMetadata();var l=a.getAggregation(r);var o=l._sGetter;var s=e[o]();if(Array.isArray(s)&&t){i=s.indexOf(t)+1}else{i=0}}return i};v.createFieldLabelId=function(e,t,r){return(e.getId()+"_"+t+"_"+r).replace("/","_")};v.getElementBindingPaths=function(e){var t={};if(e.mBindingInfos){for(var r in e.mBindingInfos){var n=e.mBindingInfos[r].parts[0].path?e.mBindingInfos[r].parts[0].path:"";n=n.split("/")[n.split("/").length-1];t[n]={valueProperty:r}}}return t};v.isOriginalFioriToolbarAccessible=function(){var e=v.getFiori2Renderer();return e&&e.getRootControl&&e.getRootControl().getOUnifiedShell().getHeader()};v.getFiori2Renderer=function(){var e=t.getUshellContainer()||{};return typeof e.getRenderer==="function"?e.getRenderer("fiori2"):undefined};v.extendWith=function(e,t,r){if(!(typeof r==="function")){throw new Error("In order to use extendWith() utility function fnCustomizer should be provided!")}for(var n in t){if(t.hasOwnProperty(n)){if(r(e[n],t[n],n,e,t)){e[n]=t[n]}}}};v.isElementInViewport=function(e){if(e instanceof jQuery){e=e.get(0)}var t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&t.right<=(window.innerWidth||document.documentElement.clientWidth)};v.showMessageBox=function(e,t,r){return sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta",true).then(function(n){r=r||{};var i=n.getText(t,r.error?[r.error.userMessage||r.error.message||r.error]:undefined);var a=r.titleKey&&n.getText(r.titleKey);var l=c(r,["titleKey","error"]);l.title=a;l.styleClass=v.getRtaStyleClassName();return y(e,i,l)})};function y(e,t,r){return new Promise(function(n){r.onClose=n;u[e](t,r)})}v.checkSourceTargetBindingCompatibility=function(e,t,r){r=r||e.getModel();var n=g.collectBindingPaths(e,r);var i;var a;if(n.bindingPaths.length===0){return true}i=g.getBindingContextPath(e);a=g.getBindingContextPath(t);if(i===a){return true}return false};v.doIfAllControlsAreAvailable=function(e,t){if(e.every(function(e){return e&&!e._bIsBeingDestroyed})){return t()}};v.buildHashMapFromArray=function(e,t,r){return e.reduce(function(e,n){e[n[t]]=n[r];return e},{})};v.checkTargetZone=function(e,t,r,n){function i(e,t,r,n){var i=e.getDesignTimeMetadata();var a=i.getAction("move",t);if(!a){return Promise.resolve(false)}return n.hasChangeHandler(a.changeType,r)}return l.checkTargetZone(e,t,n).then(function(n){if(!n){return false}var a=t.getElement();var l=e.getParent();var u=t.getRelevantContainer();if(!a||!l){return false}var g=l.getElement();var c=e.getDesignTimeMetadata();var f=o.getRelevantContainerForPropagation(c.getData(),a);f=f||g;if(!u||!f||!s(l)||u!==f){return false}if(t.getParent().getElement()!==g&&!v.checkSourceTargetBindingCompatibility(a,g)){return false}return i(e,a,f,r)})};return v},true);
//# sourceMappingURL=Utils.js.map
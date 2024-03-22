/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/write/api/FieldExtensibility","sap/ui/fl/Utils","sap/ui/fl/Layer","sap/ui/fl/LayerUtils","sap/ui/fl/write/api/Version","sap/ui/dt/OverlayUtil","sap/ui/dt/DOMUtil","sap/ui/dt/ElementUtil","sap/ui/dt/MetadataPropagationUtil","sap/ui/rta/util/hasStableId","sap/m/MessageBox","sap/ui/rta/util/BindingsExtractor","sap/base/util/restricted/_omit","sap/ui/model/json/JSONModel","sap/ui/core/Fragment","sap/ui/core/Core"],function(e,t,n,r,i,a,o,l,s,u,c,g,f,d,v,y){"use strict";var m={};m.RESOLVED_PROMISE=Promise.resolve(true);m._sFocusableOverlayClass=".sapUiDtOverlaySelectable";m._sRtaStyleClassName="";m.getRtaStyleClassName=function(){return m._sRtaStyleClassName};m.setRtaStyleClassName=function(e){if(e===n.USER){m._sRtaStyleClassName=""}else if(r.getLayerIndex(e)>-1){m._sRtaStyleClassName="sapUiRTABorder"}};m.isServiceUpToDate=function(t){return e.isExtensibilityEnabled(t).then(function(n){if(n){var r=t.getModel();if(r&&r.sServiceUrl){return e.isServiceOutdated(r.sServiceUrl).then(function(t){if(t){e.setServiceValid(r.sServiceUrl);y.getEventBus().publish("sap.ui.core.UnrecoverableClientStateCorruption","RequestReload",{})}})}}return undefined})};m.openRemoveConfirmationDialog=function(e,t){var n=y.getLibraryResourceBundle("sap.ui.rta");var r;return new Promise(function(e){r=n.getText("CTX_REMOVE_TITLE");var i={messageText:t,titleText:r,icon:"sap-icon://question-mark",removeText:n.getText("BTN_FREP_REMOVE"),cancelText:n.getText("BTN_FREP_CANCEL")};var a=new d;a.setData(i);var o;var l=function(){if(o){o.close();o.destroy();o=null}};var s={removeField:function(){l();e(true)},closeDialog:function(){l();e(false)}};if(!o){v.load({name:"sap.ui.rta.view.RemoveElementDialog",controller:s}).then(function(e){o=e;o.setModel(a);o.addStyleClass(m.getRtaStyleClassName());o.open()})}else{o.addStyleClass(m.getRtaStyleClassName());o.open()}})};m.isOverlaySelectable=function(e){return e.isSelectable()&&o.isVisible(e.getDomRef())};m.getPropertyValue=function(e,t){var n=e.getMetadata().getPropertyLikeSetting(t);var r=n._sGetter;return e[r]()};m.getOverlayInstanceForDom=function(e){var t=e.getAttribute("id");if(t){return y.byId(t)}return undefined};m.getFocusedOverlay=function(){if(document.activeElement){var e=y.byId(document.activeElement.id);if(e&&e.isA("sap.ui.dt.ElementOverlay")){return e}}return undefined};m.getFocusableParentOverlay=function(e){if(!e){return undefined}var t=e.getParentElementOverlay();while(t&&!t.getSelectable()){t=t.getParentElementOverlay()}return t};m.getFirstFocusableDescendantOverlay=function(e){return a.getFirstDescendantByCondition(e,this.isOverlaySelectable)};m.getLastFocusableDescendantOverlay=function(e){return a.getLastDescendantByCondition(e,this.isOverlaySelectable)};m.getNextFocusableSiblingOverlay=function(e){var t=true;var n=a.getNextSiblingOverlay(e);while(n&&!this.isOverlaySelectable(n)){n=a.getNextSiblingOverlay(n)}if(!n){n=this._findSiblingOverlay(e,t)}return n};m.getPreviousFocusableSiblingOverlay=function(e){var t=false;var n=a.getPreviousSiblingOverlay(e);while(n&&!this.isOverlaySelectable(n)){n=a.getPreviousSiblingOverlay(n)}if(!n){n=this._findSiblingOverlay(e,t)}return n};m._findSiblingOverlay=function(e,t){var n=e.getParentElementOverlay();if(n){var r=t?a.getNextSiblingOverlay(n):a.getPreviousSiblingOverlay(n);if(!r){return this._findSiblingOverlay(n,t)}var i=t?this.getFirstFocusableDescendantOverlay(r):this.getLastFocusableDescendantOverlay(r);return i}return undefined};m.getIndex=function(e,t,n,r){var i;if(r&&typeof r==="function"){i=r(e,t)}else{var a=e.getMetadata();var o=a.getAggregation(n);var l=o._sGetter;var s=e[l]();if(Array.isArray(s)&&t){i=s.indexOf(t)+1}else{i=0}}return i};m.createFieldLabelId=function(e,t,n){return(e.getId()+"_"+t+"_"+n).replace("/","_")};m.getElementBindingPaths=function(e){var t={};if(e.mBindingInfos){for(var n in e.mBindingInfos){var r=e.mBindingInfos[n].parts[0].path?e.mBindingInfos[n].parts[0].path:"";r=r.split("/")[r.split("/").length-1];t[r]={valueProperty:n}}}return t};m.isOriginalFioriToolbarAccessible=function(){var e=m.getFiori2Renderer();return e&&e.getRootControl&&e.getRootControl().getShellHeader()};m.getFiori2Renderer=function(){var e=t.getUshellContainer()||{};return typeof e.getRenderer==="function"?e.getRenderer("fiori2"):undefined};m.extendWith=function(e,t,n){if(!(typeof n==="function")){throw new Error("In order to use extendWith() utility function fnCustomizer should be provided!")}for(var r in t){if(t.hasOwnProperty(r)){if(n(e[r],t[r],r,e,t)){e[r]=t[r]}}}};m.isElementInViewport=function(e){e=e.jquery?e.get(0):e;var t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&t.right<=(window.innerWidth||document.documentElement.clientWidth)};m.showMessageBox=function(e,t,n){return y.getLibraryResourceBundle("sap.ui.rta",true).then(function(r){n=n||{};var i=r.getText(t,n.error?[n.error.userMessage||n.error.message||n.error]:undefined);var a=n.titleKey&&r.getText(n.titleKey);var o=n.actionKeys&&n.actionKeys.map(function(e){return r.getText(e)});var l=n.emphasizedActionKey?r.getText(n.emphasizedActionKey):undefined;var s=n.showCancel;var u=f(n,["titleKey","error","actionKeys","emphasizedAction","emphasizedActionKey","showCancel"]);u.title=a;u.styleClass=m.getRtaStyleClassName();u.actions=u.actions||o;u.emphasizedAction=l||n.emphasizedAction;if(s){u.actions.push(c.Action.CANCEL)}return p(e,i,u)})};function p(e,t,n){return new Promise(function(r){n.onClose=r;c[e](t,n)})}m.checkSourceTargetBindingCompatibility=function(e,t,n){n=n||e.getModel();var r=g.collectBindingPaths(e,n);var i;var a;if(r.bindingPaths.length===0){return true}i=g.getBindingContextPath(e);a=g.getBindingContextPath(t);if(i===a){return true}return false};m.doIfAllControlsAreAvailable=function(e,t){if(e.every(function(e){return e&&!e._bIsBeingDestroyed})){return t()}return undefined};m.buildHashMapFromArray=function(e,t,n){return e.reduce(function(e,r){e[r[t]]=r[n];return e},{})};m.checkTargetZone=function(e,t,n,r){function i(e,t,n,r){var i=e.getDesignTimeMetadata();var a=i.getAction("move",t);if(!a){return Promise.resolve(false)}return r.hasChangeHandler(a.changeType,n)}return l.checkTargetZone(e,t,r).then(function(r){if(!r){return false}var a=t.getElement();var o=e.getParent();var l=t.getRelevantContainer();if(!a||!o){return false}var c=o.getElement();var g=e.getDesignTimeMetadata();var f=s.getRelevantContainerForPropagation(g.getData(),a);f=f||c;if(!l||!f||!u(o)||l!==f){return false}if(t.getParent().getElement()!==c&&!m.checkSourceTargetBindingCompatibility(a,c)){return false}return i(e,a,f,n)})};m.checkDraftOverwrite=function(e){var t=e.getProperty("/backendDraft");var n=e.getProperty("/displayedVersion")===i.Number.Draft;if(n||!t){return Promise.resolve(false)}return m.showMessageBox("warning","MSG_DRAFT_DISCARD_AND_CREATE_NEW_DIALOG",{titleKey:"TIT_DRAFT_DISCARD_DIALOG",actions:[c.Action.OK,c.Action.CANCEL],emphasizedAction:c.Action.OK}).then(function(e){if(e!==c.Action.OK){throw"cancel"}return true})};return m},true);
//# sourceMappingURL=Utils.js.map
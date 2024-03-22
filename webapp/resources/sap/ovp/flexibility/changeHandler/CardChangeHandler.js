/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ovp/cards/CommonUtils"],function(e){"use strict";function r(){return{changeHandler:{},layers:{VENDOR:true,CUSTOMER_BASE:true,CUSTOMER:true,USER:true}}}function t(r){var t=r.getContent();if(!t.card){var n={card:{id:e.removePrefixAndReturnLocalId(t.id),idIsLocal:true}};return n}return t}var n={changeHandler:{applyChange:function(r,t,n){var a=e.getApp();a.appendIncomingDeltaChange(r);return},completeChangeContent:function(e,r,t){return},revertChange:function(e,r,t){return}},layers:{CUSTOMER_BASE:true,CUSTOMER:true,USER:true}};var a={changeHandler:"default",layers:{CUSTOMER_BASE:true,CUSTOMER:true,USER:true}};var i=r();var o=r();i.changeHandler.applyChange=function(e,r,n){e.setContent(t(e));return l(e,r,n,false)};i.changeHandler.revertChange=function(e,r,t){return d(e,r,t,true)};i.changeHandler.completeChangeContent=function(r,t,n){var a=e.removePrefixAndReturnLocalId(t.removedElement.id);var i={card:{id:a,idIsLocal:true}};return Promise.resolve().then(function(){r.setContent(i)})};o.changeHandler.applyChange=function(e,r,n){e.setContent(t(e));return l(e,r,n,true)};o.changeHandler.revertChange=function(e,r,t){return d(e,r,t,false)};o.changeHandler.completeChangeContent=function(r,t,n){var a=e.removePrefixAndReturnLocalId(t.revealedElementId);var i={card:{id:a,idIsLocal:true}};return Promise.resolve().then(function(){r.setContent(i)})};function d(r,t,n,a){var i=n.modifier,o=n.appComponent,d=e.getApp(),l=d.getUIModel(),s=d.getLayout(),u=o.createId(r.getRevertData().id),C=i.bySelector(r.getRevertData(),o);i.setVisible(C,a);r.resetRevertData();if(l.getProperty("/containerLayout")==="resizable"){var c=s.getDashboardLayoutUtil();c.updateCardVisibility([{id:c.getCardIdFromComponent(u),visibility:a}])}s.rerender();return Promise.resolve(true)}function l(r,t,n,a){var i=n.modifier,o=e.getApp(),d=o&&o.getView();if(!d){throw new Error("Main view is not initialized yet.")}var l=o.getUIModel(),s=o.getLayout(),u=r.getContent(),C=n.appComponent,c=C.createId(u.card.id),g=i.bySelector(u.card,C,d);var f=o.deltaChanges.filter(function(e){return e.getSelector().id===u.card.id&&e.getChangeType()==="visibility"});if(o.aManifestOrderedCards){for(var v=0;v<o.aManifestOrderedCards.length;v++){var p=c;var h=p.indexOf("---")+3;var m=p.substring(h);if(o.aManifestOrderedCards[v].id===m.split("--")[1]){o.oView.oController.aManifestOrderedCards[v].visibility=r.getChangeType()==="hideCardContainer"?false:true}}}if(!o.aManifestOrderedCards||f.length===0){r.setRevertData(u.card);i.setVisible(g,a);if(l.getProperty("/containerLayout")==="resizable"){var y=s.getDashboardLayoutUtil();if(y.aCards){y.updateCardVisibility([{id:y.getCardIdFromComponent(c),visibility:a}])}o.appendIncomingDeltaChange(r)}if(a){var I=d.byId(c);if(!I.getComponentInstance()&&o.bFinishedCardsCreationProcess){var R=o._getCardFromManifest(o._getCardId(c));o.recreateRTAClonedCard(R)}}s.rerender();return Promise.resolve(true)}return Promise.resolve(false)}return{HideCardContainer:i,UnhideCardContainer:o,PersonalizationDefaultConfig:n,UnhideControlConfig:a}});
//# sourceMappingURL=CardChangeHandler.js.map
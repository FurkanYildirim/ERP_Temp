/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/base/Log","sap/ui/model/json/JSONModel","sap/ui/core/Core"],function(e,t,r){"use strict";var a="/sap/opu/odata4/ui2/insights_srv/srvd/ui2/";var i=a+"insights_cards_repo_srv/0001/";var n="INSIGHTS_CARDS";var s=a+"insights_cards_read_srv/0001/"+n;var o="POST";var d="PUT";var c=e.getLogger("sap.insights.CardHelper");var u=sap.ui.getCore().getLibraryResourceBundle("sap.insights");var p="sap.insights.preview.Preview",l="sap.insights.selection.Selection",h="sap.insights.selection.SelectionDialog",f="sap.insights.copy.Copy",g="sap.insights.houseOfCards.HouseOfCardsDialog",C="sap.insights.configure.ColumnListDialog";function v(e){return i+n+"('"+e+"')"}function m(){return fetch(i,{method:"HEAD",headers:{"X-CSRF-Token":"Fetch"}}).then(function(e){var t=e.headers.get("X-CSRF-Token");if(e.ok&&t){return t}M(u.getText("tokenFetchError"))})}function y(e,t,r){if([d,o].indexOf(r)===-1){M("Method not supported.")}var a=e["sap.app"].id;var s=r===d?v(a):i+n;e={descriptorContent:JSON.stringify(e),id:a};var c=JSON.stringify(e);return fetch(s,{method:r,headers:{"X-CSRF-Token":t,"content-type":"application/json;odata.metadata=minimal;charset=utf-8"},body:c}).then(function(e){return e.json()}).then(function(e){if(e.error){M(e.error.message)}return JSON.parse(e.descriptorContent)})}function b(e,t){var r=i+n+"/com.sap.gateway.srvd.ui2.insights_cards_repo_srv.v0001.setRank?";var a=JSON.stringify({changedCards:JSON.stringify(e)});return fetch(r,{method:o,headers:{"X-CSRF-Token":t,"content-type":"application/json;odata.metadata=minimal;charset=utf-8"},body:a}).then(function(e){return e.json()}).then(function(e){if(e.error){M(e.error.message)}e.value.forEach(function(e){if(e.descriptorContent){e.descriptorContent=JSON.parse(e.descriptorContent)}});return e.value})}function P(e){var t=e.split(".");if(t[0]!=="user"){M("sap.app.id value should start with user.<id>.")}}function w(e,t){return fetch(v(e),{method:"DELETE",headers:{"X-CSRF-Token":t}}).then(function(e){return e.ok?{}:e.json()}).then(function(t){if(t.error){M(t.error.message)}return e})}function L(){var e="sap.insights is not enabled for this system.";var t="ux.eng.s4producthomes1";try{var r=window["sap-ushell-config"];var a=r.apps.insights.enabled;var i=r.ushell.homeApp.component.name;var n=i===t;var s=r.ushell.spaces.myHome.enabled;var o=r.ushell.spaces.enabled;if(a&&s&&n&&o){return Promise.resolve(true)}return Promise.reject(new Error(e))}catch(t){return Promise.reject(new Error(e))}}function M(e){c.error(e);throw new Error(e)}function S(e){var t=false;if(e&&e.parameters&&e.parameters.ibnTarget&&e.parameters.ibnTarget.semanticObject&&e.parameters.ibnTarget.action){t=true}if(e&&e.ibnTarget&&e.ibnTarget.semanticObject&&e.ibnTarget.action){t=true}return t}function _(e){var t=false;if(!e["sap.app"]){c.error("Invalid card manifest. sap.app namespace do not exists.");t=true}if(!t&&!e["sap.app"].id){c.error("Invalid card manifest. sap.app.id do not exists.");t=true}if(!t){P(e["sap.app"].id,false)}if(!t&&!e["sap.app"].type){c.error("Invalid card manifest. sap.app.type do not exists.");t=true}if(!t&&e["sap.app"].type.toLowerCase()!=="card"){c.error("Invalid card manifest. invalid value for sap.app.type, expected card.");t=true}if(!t&&!e["sap.card"]){c.error("Invalid card manifest. sap.card namespace do not exists.");t=true}if(!t&&!e["sap.card"].type){c.error("Invalid card manifest. sap.card.type do not exists.");t=true}var r=["Analytical","List","Table"];if(!t&&r.indexOf(e["sap.card"].type)===-1){c.error("Invalid card manifest. Invalid value for sap.card.type. Supported types: "+r);t=true}if(!t&&!e["sap.insights"]){c.error("Invalid card manifest. sap.insights namespace do not exists.");t=true}if(!t&&!e["sap.insights"].parentAppId){c.error("Invalid card manifest. sap.insights.parentAppId do not exists.");t=true}if(!t&&!e["sap.insights"].cardType){c.error("Invalid card manifest. sap.insights.cardType do not exists.");t=true}if(!t&&e["sap.insights"].cardType!=="RT"){c.error("Invalid card manifest. Invalid value for sap.insights.cardType, supported value is RT");t=true}if(!t&&!e["sap.insights"].versions||!e["sap.insights"].versions.ui5){c.error("Invalid card manifest. Invalid value for sap.insights version");t=true}if(!t&&e["sap.insights"].templateName==="OVP"){var a,i,n,s=false,o=e["sap.card"].type;if(o==="Analytical"){a=e["sap.card"].content.actions||[];i=e["sap.card"].header.actions||[];a=a.filter(function(e){return e.type==="Navigation"&&e.parameters&&e.parameters.ibnTarget&&e.parameters.ibnTarget.semanticObject&&e.parameters.ibnTarget.action});i=i.filter(function(e){return e.type==="Navigation"&&e.parameters&&e.parameters.ibnTarget&&e.parameters.ibnTarget.semanticObject&&e.parameters.ibnTarget.action});if(a.length>0||i.length>0){s=true}if(e["sap.card"].configuration.parameters.state&&e["sap.card"].configuration.parameters.state.value){n=JSON.parse(e["sap.card"].configuration.parameters.state.value);s=S(n)}}if(o==="List"||o==="Table"){a=(o==="List"?e["sap.card"].content.item.actions:e["sap.card"].content.row.actions)||[];i=e["sap.card"].header.actions||[];a=a.filter(function(e){return e.type==="Navigation"});i=i.filter(function(e){return e.type==="Navigation"});if(a.length>0||i.length>0){var d={},p={};if(e["sap.card"].configuration.parameters.headerState&&e["sap.card"].configuration.parameters.headerState.value){d=JSON.parse(e["sap.card"].configuration.parameters.headerState.value)}if(e["sap.card"].configuration.parameters.lineItemState&&e["sap.card"].configuration.parameters.lineItemState.value){p=JSON.parse(e["sap.card"].configuration.parameters.lineItemState.value)}var l=S(d),h=S(p);s=l||h}}if(!s){c.error("Invalid card manifest. Card should have navigation.");t=true}}if(t){throw new Error(u.getText("invalidManifest"))}}var T={localCardCache:{},userCardModel:(new t).setDefaultBindingMode("OneWay"),suggestedCardModel:(new t).setDefaultBindingMode("OneWay"),parentAppDetailsCache:{},_mergeCard:function(e,t,r){try{if(!r){_(e)}}catch(e){return Promise.reject(e)}this.suggestedCardModel.setProperty("/isLoading",true);return m().then(function(r){return y(e,r,t)}).then(function(e){this.localCardCache={};this.suggestedCardModel.setProperty("/isLoading",false);return e}.bind(this)).catch(function(e){this.suggestedCardModel.setProperty("/isLoading",false);return Promise.reject(e)}.bind(this))},createCard:function(e,t){return this._mergeCard(e,o,t)},updateCard:function(e,t){return this._mergeCard(e,d,t)},deleteCard:function(e){try{P(e)}catch(e){return Promise.reject(e)}this.suggestedCardModel.setProperty("/isLoading",true);return m().then(function(t){return w(e,t)}).then(function(e){this.localCardCache={};this.suggestedCardModel.setProperty("/isLoading",false);return e}.bind(this))},getUserCards:function(e){if(e){this.localCardCache={}}if(this.localCardCache.userCards){return Promise.resolve(this.localCardCache.userCards)}var t=s+"?$orderby=rank";return this._readCard(t).then(function(e){this.localCardCache.userCards=e;return e}.bind(this))},getUserCardModel:function(e){return this.getUserCards(e).then(function(e){var t=e.filter(function(e){return e.visibility});this.userCardModel.setProperty("/cards",e);this.userCardModel.setProperty("/cardCount",e.length);this.userCardModel.setProperty("/visibleCardCount",t.length);return this.userCardModel}.bind(this))},getSuggestedCards:function(){if(this.localCardCache.suggestedCards){return Promise.resolve(this.localCardCache.suggestedCards)}var e=s+"?$filter=visibility eq true&$select=descriptorContent,visibility,rank&$orderby=rank&$skip=0&$top=10";return this._readCard(e).then(function(e){this.localCardCache.suggestedCards=e;return e}.bind(this))},getSuggestedCardModel:function(){return this.getSuggestedCards().then(function(e){this.suggestedCardModel.setProperty("/cards",e);this.suggestedCardModel.setProperty("/cardCount",e.length);this.suggestedCardModel.setProperty("/isLoading",false);return this.suggestedCardModel}.bind(this))},_readCard:function(e){return fetch(e).then(function(e){if(e.ok){return e.json()}M("Cannot read user's suggested cards.")}).then(function(e){e.value.forEach(function(e){if(e.descriptorContent){e.descriptorContent=JSON.parse(e.descriptorContent)}});return e.value})},setCardsRanking:function(e){this.suggestedCardModel.setProperty("/isLoading",true);return m().then(function(t){return b(e,t)}).then(function(e){this.localCardCache={};this.suggestedCardModel.setProperty("/isLoading",false);return e}.bind(this))},_refreshUserCards:function(e){this.suggestedCardModel.setProperty("/isLoading",true);var t=e?{deleteAllCards:"X"}:{};return new Promise(function(e){fetch(i,{method:"HEAD",headers:{"X-CSRF-Token":"Fetch"}}).then(function(r){var a=r.headers.get("X-CSRF-Token");fetch(i+n+"/com.sap.gateway.srvd.ui2.insights_cards_repo_srv.v0001.deleteCards?",{method:"POST",headers:{"X-CSRF-Token":a,"content-type":"application/json;odata.metadata=minimal;charset=utf-8"},body:JSON.stringify(t)}).then(function(){this.localCardCache={};this.suggestedCardModel.setProperty("/isLoading",false);e()}.bind(this))}.bind(this))}.bind(this))},getParentAppDetails:function(e){if(this.parentAppDetailsCache[e.descriptorContent["sap.app"].id]){return Promise.resolve(this.parentAppDetailsCache[e.descriptorContent["sap.app"].id])}var t={};return sap.ushell.Container.getServiceAsync("ClientSideTargetResolution").then(function(r){var a=r._oAdapter._aInbounds||[];var i=a.find(function(t){return t.resolutionResult&&t.resolutionResult.applicationDependencies&&t.resolutionResult.applicationDependencies.name===e.descriptorContent["sap.insights"].parentAppId});if(i){t.semanticObject=i.semanticObject;t.action=i.action;t.semanticURL="#"+i.semanticObject+"-"+i.action;t.title=e.descriptorContent["sap.app"].title;this.parentAppDetailsCache[e.descriptorContent["sap.app"].id]=t}return t}.bind(this))}};var O={_oViewCache:{},_getLoadLibraryPromise:function(e){var t;switch(e){case p:t=Promise.all([r.loadLibrary("sap.m"),r.loadLibrary("sap.ui.integration"),r.loadLibrary("sap.viz")]);break;case l:case h:case g:t=Promise.all([r.loadLibrary("sap.m"),r.loadLibrary("sap.ui.core"),r.loadLibrary("sap.f"),r.loadLibrary("sap.ui.integration"),r.loadLibrary("sap.ui.layout"),r.loadLibrary("sap.viz")]);break;case C:case f:t=Promise.all([r.loadLibrary("sap.m"),r.loadLibrary("sap.ui.core"),r.loadLibrary("sap.f"),r.loadLibrary("sap.ui.integration"),r.loadLibrary("sap.ui.layout")]);break;default:break}return t},_getXMLView:function(e,t){return new Promise(function(r,a){if(this._oViewCache[e]){return r(this._oViewCache[e])}return this._getLoadLibraryPromise(e).then(function(){return sap.ui.core.mvc.XMLView.create({viewName:e,id:t?t:""}).then(function(t){this._oViewCache[e]=t;return r(this._oViewCache[e])}.bind(this))}.bind(this))}.bind(this))},showCardPreview:function(e,t,r){if(!this.oCardLoadPromise){this.oCardLoadPromise=this._getXMLView(p).then(function(a){return a.getController().showPreview(e,t,r)}).finally(function(){this.oCardLoadPromise=null}.bind(this))}return this.oCardLoadPromise},_getPreviewModelProperty:function(e){return this._getXMLView(p).then(function(t){var r=t.getController().getView().getModel("cardPreviewModel");return r.getProperty(e)})},_setPreviewModelProperty:function(e,t){return this._getXMLView(p).then(function(r){var a=r.getController().getView().getModel("cardPreviewModel");return a.setProperty(e,t)})},_showCardSelectionDialog:function(e){return this._getXMLView(h).then(function(t){return t.getController().showSelectionDialog(e)})},_showCardConfigureDialog:function(e){return this._getXMLView(C).then(function(t){var r=t.getController().getView().getModel("configureView");if(!r.getProperty("/bDialogOpen")){return t.getController().showColumnListDialog(e)}}).catch(function(e){return Promise.reject(e)})},showHouseOfCardsDialog:function(e){return this._getXMLView(g).then(function(t){return t.getController().showHouseOfCardsDialog(e)})},_setHoCModelProperty:function(e,t){return this._getXMLView(g).then(function(r){var a=r.getController().getView().getModel("hocModel");return a.setProperty(e,t)})}};return{getServiceAsync:function(e){return L().then(function(){if(e==="UIService"){return O}return T}).catch(function(e){return Promise.reject(e)})}}});
//# sourceMappingURL=CardHelper.js.map
// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/UIComponent","sap/m/FlexBox","sap/f/cards/Header"],function(e,t){"use strict";var r=e.extend("sap.ushell.components.cepsearchresult.cards.searchresultwidget.Component",{onCardReady:function(e){this._oCard=e;this._oCard.addStyleClass("sapCEPSearchResultCard");this._mCardParameters=e.getCombinedParameters();this._oResourceBundle=this.getModel("i18n").getResourceBundle();if(this._bContent){this.addContent()}},createContent:function(){if(this.getAggregation("rootControl")){return this.getAggregation("rootControl")}var e=new t({width:"100%",direction:"Column"});this._bContent=true;if(this._oCard){this.addContent()}return e},editionLoaded:function(){return new Promise(function(e){sap.ui.require(["sap/ushell/components/cepsearchresult/app/util/Edition"],function(t){this._oEdition=new t(t.getEditionName());e(this._oEdition.loaded())}.bind(this))}.bind(this))},search:function(e){this._oCategory.search(e)},addContent:function(){this.editionLoaded().then(function(){this._oCategory=this.createCategory();this.addCategory(this.getRootControl());this.updateCardHeader();this._oCard.getModel("parameters").setProperty("/init/value",true)}.bind(this))},addCategory:function(e){e.addItem(this._oCategory);this.search(this._mCardParameters.searchTerm)},createCategory:function(){var e=this._mCardParameters;var t=this._oEdition.createCategoryInstance(e.category,{pageSize:e.pageSize,showFooter:e.footer!=="none",showHeader:false,initialPlaceholder:true,allowViewSwitch:e.allowViewSwitch,highlightResult:e.highlightResult,currentView:e.view||"categoryDefault",useIllustrations:true,beforeSearch:function(e){this.updateCardHeader(e.getParameters());this._oCard.fireEvent("beforeSearch",e.getParameters())}.bind(this),afterSearch:function(e){this.updateCardHeader(e.getParameters());this._oCard.fireEvent("afterSearch",e.getParameters())}.bind(this),afterRendering:function(e){this._oCard.fireEvent("afterRendering",e.getParameters());if(this._mCardParameters.header!=="none"){t.getDomRef().style.borderTop="1px solid var(--sapUiListBorderColor)"}}.bind(this)});t.setFooter(e.footer);return t},updateCardHeader:function(e){var t=this._oCard.getCardHeader(),r=this._oCategory,a,o;if(this._mCardParameters.header==="default"){t.setIconVisible(!!r.getDefaultIcon()).setIconDisplayShape(r._oCategoryConfig.icon.shape).setIconBackgroundColor(r._oCategoryConfig.icon.backgroundColor).setIconSrc(r.getDefaultIcon());a=r.translate("Card.Title");o=this._oResourceBundle.getText("CARD.List.Title.SearchResults",["'"+this._mCardParameters.searchTerm+"'"])}else{t.setIconVisible(!!this._oCard.getManifestEntry("/sap.card/header/icon/src")).setIconDisplayShape(this._oCard.getManifestEntry("/sap.card/header/icon/shape")).setIconBackgroundColor(this._oCard.getManifestEntry("/sap.card/header/icon/backgroundColor")).setIconSrc(this._oCard.getManifestEntry("/sap.card/header/icon/src"));a=this._oCard.getManifestEntry("/sap.card/header/title");o=this._oCard.getManifestEntry("/sap.card/header/subtitle");a=a.replace("($searchText)",this._mCardParameters.searchTerm);o=o.replace("($searchText)",this._mCardParameters.searchTerm)}if(!e||!Number.isInteger(e.count)){if(this._mCardParameters.header==="custom"){a=a.replace("($count)","--");o=o.replace("($count)","--")}t.setStatusText("")}else if(Number.isInteger(e.count)){var i=this._oResourceBundle.getText("CARD.List.RowStatus",[Math.min(e.skip+1,e.count),Math.min(e.skip+e.top,e.count),e.count]);t.setStatusText(e.count>0?i:"");if(this._mCardParameters.header==="default"){a=a+" (($count))"}a=a.replace("($count)",e.count);o=o.replace("($count)",e.count)}t.setTitle(a);t.setSubtitle(o)}});return r});
//# sourceMappingURL=Component.js.map
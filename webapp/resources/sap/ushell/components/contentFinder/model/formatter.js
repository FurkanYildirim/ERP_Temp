// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define([],function(){"use strict";return{formatDialogTitle:function(e){var t=this.getView().getModel("i18n").getResourceBundle();var r=this.getView().getModel();if(e===r.getProperty("/navigationTargets/widgetGallery")){return t.getText("ContentFinder.WidgetGallery.Title")}else if(e===r.getProperty("/navigationTargets/appSearchTiles")){return t.getText("ContentFinder.AppSearch.AddTiles.Title")}else if(e===r.getProperty("/navigationTargets/appSearchCards")){return t.getText("ContentFinder.AppSearch.AddCards.Title")}return""},formatAppSearchTitle:function(e,t,r,i,n,a,l){var p=this.getView().getModel("i18n").getResourceBundle();var g="";var o=false;if(e==="appSearch_tiles"){o=!!n.length;if(!o){g=p.getText("ContentFinder.AppSearch.Title.NoTiles")}else{g=p.getText("ContentFinder.AppSearch.Title.AllTiles",n.length)}if(r){if(i){g=p.getText("ContentFinder.AppSearch.Title.SelectedApp",i)}else{g=p.getText("ContentFinder.AppSearch.Title.NoSelectedApp")}}}if(e==="appSearch_cards"){o=!!a.length;if(!o){g=p.getText("ContentFinder.AppSearch.Title.NoCards")}else{g=p.getText("ContentFinder.AppSearch.Title.AllCards",a.length)}}if(t&&!o){g=p.getText("ContentFinder.AppSearch.Title.NoSearchResult",t)}if(t&&o){g=p.getText("ContentFinder.AppSearch.Title.SearchResult",[t,l])}return g},addButtonIsVisibleInAppSearch:function(e){var t=this.getView().getModel();return e===t.getProperty("/navigationTargets/appSearchTiles")}}});
//# sourceMappingURL=formatter.js.map
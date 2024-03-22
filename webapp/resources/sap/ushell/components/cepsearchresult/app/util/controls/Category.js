// Copyright (c) 2009-2023 SAP SE, All Rights Reserved
sap.ui.define(["sap/ui/core/Control","sap/ui/model/json/JSONModel","sap/m/Title","sap/m/List","sap/m/CustomListItem","sap/m/FlexBox","sap/m/Avatar","sap/m/ObjectIdentifier","sap/m/OverflowToolbar","sap/m/ToolbarSpacer","sap/m/Button","sap/m/SegmentedButton","sap/m/SegmentedButtonItem","sap/m/IllustratedMessage","./Paginator","../appendStyleVars","sap/ui/dom/includeStylesheet","./Highlighter","sap/ui/core/ResizeHandler","sap/m/library"],function(t,e,i,s,o,a,r,n,h,l,u,p,g,c,d,f,_,y,m,C){"use strict";f(["sapUiShadowLevel0","sapUiElementBorderCornerRadius","sapUiMarginSmall","sapUiMarginMedium","sapUiMarginTiny","sapUiListBorderColor","sapUiListBackground","sapUiLink","sapMFontMediumSize","sapUiIndication8HoverBackground","sapUiButtonCriticalBackground","sapUiAccentBackgroundColor10","sapUiButtonNegativeActiveBackground","sapUiButtonSuccessActiveBackground","sapUiButtonNeutralBackground","sapUiTileBackground","sapUiExtraLightBG"]);_(sap.ui.require.toUrl("sap/ushell/components/cepsearchresult/app/util/controls/Category.css"));var S=C.IllustratedMessageType;n.prototype._handlePress=function(t){var e=t.target;if(this.getTitleActive()&&this.getDomRef().querySelector(".sapMObjectIdentifierTitle").contains(e)){this.fireTitlePress({domRef:e});t.setMarked()}};var w=t.extend("sap.ushell.components.cepsearchresult.app.util.controls.Category",{constructor:function(e,i,s){this._oCategoryConfig=e;this._oEdition=i;t.apply(this,[s])},metadata:{properties:{pageSize:{type:"int",defaultValue:10},showHeader:{type:"boolean",defaultValue:true},showFooter:{type:"boolean",defaultValue:true},allowViewSwitch:{type:"boolean",defaultValue:true},currentView:{type:"string",defaultValue:"categoryDefault"},highlightResult:{type:"boolean",defaultValue:true},useIllustrations:{type:"boolean",defaultValue:false},initialPlaceholder:{type:"boolean",defaultValue:false}},aggregations:{_header:{type:"sap.ui.core.Control",multiple:false},_list:{type:"sap.ui.core.Control",multiple:false},_footer:{type:"sap.ui.core.Control",multiple:false},_nodata:{type:"sap.ui.core.Control",multiple:false}},events:{itemNavigate:{},viewAll:{},beforeSearch:{},afterSearch:{},afterRendering:{}}},renderer:function(t,e){t.openStart("div",e);t.class("sapUiCEPSearchCat");t.openEnd();var i=e.getAggregation("_header"),s=e.getAggregation("_list"),o=e.getAggregation("_footer"),a=e.getAggregation("_nodata");if(i){t.renderControl(i)}if(e.getUseIllustrations()&&a&&a.getVisible()){t.renderControl(a)}else if(s){t.renderControl(s)}if(o){t.renderControl(o)}t.close("div")}});w._iDataRefreshMs=1e9;w._iCountRefreshMs=1e9;w.CustomListItem=o.extend("sap.ushell.components.cepsearchresult.app.util.controls.Category.CustomListItem",{renderer:o.getMetadata().getRenderer()});w.CustomListItem.prototype.onAfterRendering=function(){if(o.prototype.onAfterRendering){o.prototype.onAfterRendering.apply(this,arguments)}this._activeHandling(this.$())};w.CustomListItem.prototype._activeHandling=function(t){t.removeClass("sapMLIBActive");t.removeClass("sapMLIBActionable");t.removeClass("sapMLIBHoverable");t.toggleClass("sapUiCEPSearchCatLIActive",this._active);if(this.isActionable(true)){t.toggleClass("sapUiCEPSearchCatLIHoverable",!this._active)}};w.SearchResultList=s.extend("sap.ushell.components.cepsearchresult.app.util.controls.Category.SearchResultList",{renderer:s.getMetadata().getRenderer()});w.SearchResultList.prototype._getCurrentColCount=function(){if(this.getDomRef()){var t=this.getDomRef().querySelectorAll(".sapMListItems > LI"),e=1,i=t[0].offsetTop;for(var s=1;s<t.length&&t[s].offsetTop<=i;s++){e++}return e}};w.SearchResultList.prototype._startItemNavigation=function(){s.prototype._startItemNavigation.apply(this,[false]);if(this._oItemNavigation){var t=Array.from(this.getDomRef().querySelectorAll(".sapMGT"));if(t.length>0){this._oItemNavigation.setItemDomRefs(t)}}this._oItemNavigation.setTableMode(false,true).setColumns(this._getCurrentColCount())};w.prototype.init=function(){var t=this.getResourceModel();this.setModel(t,"i18n");this.setModel(new e({}),"data");this._oResourceBundle=t.getResourceBundle();this._iCurrentCount=0;this._oDirty={iDataFetchRequired:0,iCountFetchRequired:0};this._oNoDataIllustration=null;this._oErrorIllustration=null;this._iCurrentHeight=0;this._iAfterRendering=0;this._iAfterRenderingEventDelay=60;this.addContent()};w.prototype.addContent=function(){this.setAggregation("_header",this.createHeader());this.setAggregation("_list",this.createList());this.setAggregation("_footer",this.createFooter())};w.prototype.getKey=function(){return this._oCategoryConfig.name};w.prototype.translate=function(t,e){var i=this._oCategoryConfig.translation;return this._oResourceBundle.getText(i+"."+t,e||[])};w.prototype.updateDataModel=function(t){this.setModel(new e(t),"data")};w.prototype.initialData=function(t){var e=this.getModel("data");if(!e&&this.getInitialPlaceholder()&&this.getPlaceholderData()){var i=[];for(var s=0;s<t;s++){i.push(this.getPlaceholderData())}this.updateDataModel({data:i})}};w.prototype.resetDataRequired=function(t,e,i){if(this._bResetData){this._sSearchTerm=t;this._iSkip=e;this._iTop=i;return true}var s=this.getVisible();if(this._sSearchTerm===t&&(this._iSkip===e&&this._iTop===i&&(s&&this._oDirty.iDataFetchRequired>Date.now()))||!s&&this._oDirty.iCountFetchRequired>Date.now()){return false}this._sSearchTerm=t;this._iSkip=e;this._iTop=i;return true};w.prototype.resetData=function(){this._bResetData=true;this.updateDataModel({})};w.prototype.search=function(t,e,i){i=isNaN(i)||i<0?this._iTop||this.getPageSize():i;e=isNaN(e)||e<0?this._iSkip||0:e;if(typeof t!=="string"){t=this.getSearchTerm()}var s=this.getVisible(),o=this._sSearchTerm!==t,a,r=this.getModel("data").getData()||{};if(!this.resetDataRequired(t,e,i)){this.fireFetchEvent("before","skipped",r);this.fireFetchEvent("after","skipped",r);return}this._iCurrentCount=0;this._bResetData=false;this._bIsLoading=true;this.fireFetchEvent("before",s?"data":"count",performance.now(),r);if(s){this.setNoDataText(this.translate("LoadingData"),"Loading");this.initialData(i);this.showLoadingPlaceholder(true);this._oDirty.iDataFetchRequired=Date.now()+w._iDataRefreshMs;a=this.fetchData(t,e,i);a=a.then(this.applyDataChange.bind(this,o))}else{a=this.fetchCount(t,e,i);a=a.then(this.applyCount.bind(this))}this._oDirty.iCountFetchRequired=Date.now()+w._iCountRefreshMs;if(a){a.then(function(t){this._iCurrentCount=t.count||0;this.setNoDataText(this.translate("NoData"),"NoData");this.fireFetchEvent("after",s?"data":"count",t)}.bind(this))}};w.prototype.applyDataChange=function(t,e){var i={count:e.count,top:this._iTop,skip:this._iSkip,page:Math.floor(this._iSkip/this._iTop)+1,data:e.data};this.showLoadingPlaceholder(false,function(){this.updateDataModel(i);this.fixHeight(t)}.bind(this));return i};w.prototype.applyCount=function(t){var e={count:t.count,top:this._iTop,skip:this._iSkip,page:Math.floor(this._iSkip/this._iTop)+1,data:[]};this.updateDataModel(e);return e};w.prototype.fireFetchEvent=function(t,e,i){var s={count:i?i.count||0:0,category:this.getKey(),top:this._iTop,skip:this._iSkip,page:this._iSkip/this._iTop+1,searchTerm:this._sSearchTerm,visible:this.getVisible(),time:performance.now(),fetchType:e};if(t==="before"){this.fireBeforeSearch(s)}else if(t==="after"){this.fireAfterSearch(s)}};w.prototype.fetchData=function(t,e,i){return Promise.resolve({data:[],count:0})};w.prototype.fetchCount=function(t,e,i){return Promise.resolve({data:[],count:0})};w.prototype.showLoadingPlaceholder=function(t,e){if(t){if(this._iShowLoader){clearTimeout(this._iShowLoader)}this._iShowLoader=setTimeout(function(){this._oList.addStyleClass("loading")}.bind(this),200)}else if(this._iShowLoader){clearTimeout(this._iShowLoader);this._iShowLoader=setTimeout(function(){this._oList.removeStyleClass("loading");if(e){e()}this.invalidate();this._bIsLoading=false}.bind(this),this._oList.hasStyleClass("loading")?100:0)}};w.prototype.isLoading=function(){return this._bIsLoading};w.prototype.getPlaceholderData=function(){return{text:" ",description:" "}};w.prototype.refreshData=function(){this._oDirty.iDataFetchRequired=0;this.search(this.getSearchTerm(),0,this.getPageSize())};w.prototype.bindListViewItems=function(t){var e=this.getItemTemplate(t);this._oList.addStyleClass(t);this._oList.bindItems({path:"data>/data",template:e})};w.prototype.setNoDataText=function(t,e){this.updateIllustration(t,"Hide");if(this._oList&&!this.bPaging){this._oList.setNoDataText(" ");this.updateIllustration(t,e);this._oList.setNoDataText(t)}};w.prototype.getItemTemplate=function(t){var e=null;switch(t){case"card":e=this.createCardItemTemplate();break;case"tile":e=this.createTileItemTemplate();break;default:e=this.createListItemTemplate()}return e.addStyleClass("sapUiCEPSearchCatLI "+t+" "+this.getKey())};w.prototype.setFooter=function(t){if(t==="viewAll"){this.setAggregation("_footer",this.createFooter(t))}};w.prototype.createHeader=function(){this._oHeader=new h({content:[new l({width:".5rem"}),this.createTitle(),this.createCounter(),new l,this.createViewButtons(),new l({width:"1rem"})]}).addStyleClass("sapUiCEPSearchCatHeaderTB");return this._oHeader};w.prototype.getPaginatorSettings=function(){return{visible:true,count:"{= ${data>/count}}",pageSize:"{= ${data>/top}}",currentPage:"{= ${data>/page}}",selectPage:function(t){this.fixHeight();this.bPaging=true;this.search(this.getSearchTerm(),t.getParameter("startIndex"),t.getParameter("pageSize"));this.bPaging=false}.bind(this)}};w.prototype.getSearchTerm=function(){return this._sSearchTerm||""};w.prototype.getResultCount=function(){this.getModel("data").getProperty("/count")};w.prototype.getResourceModel=function(){return this._oEdition.getResourceModel()};w.prototype.getViewSettings=function(){return{views:[{key:"list",icon:"sap-icon://text-align-justified"},{key:"card",icon:"sap-icon://business-card"}],default:"list"}};w.prototype.getDefaultIcon=function(){return this._oCategoryConfig.icon.src};w.prototype.getCurrentView=function(){var t=this.getProperty("currentView");if(t==="categoryDefault"){this.setProperty("currentView",this.getViewSettings().default);return this.getViewSettings().default}return t};w.prototype.setShowHeader=function(t){this._oHeader.setVisible(t);this._oList.removeStyleClass("noheader");if(!t){this._oList.addStyleClass("noheader")}return this.setProperty("showHeader",t)};w.prototype.setShowFooter=function(t){this.getAggregation("_footer").setVisible(t);return this.setProperty("showFooter",t)};w.prototype.setAllowViewSwitch=function(t){this._oViewSwitch.setVisible(t&&this._oViewSwitch.getItems().length>1);return this.setProperty("allowViewSwitch",t)};w.prototype.setCurrentView=function(t){var e=this.getCurrentView();if(e!==t){this._oList.unbindItems();this.setProperty("currentView",t);t=this.getCurrentView();this._oViewSwitch.setSelectedKey(t);this._oList.removeStyleClass(e);this.bindListViewItems(t);this._oList.addStyleClass(t);this._iCurrentHeight=0}return this};w.prototype.setPageSize=function(t){this.setProperty("pageSize",t);if(this.getDomRef()){this.refreshData()}return this};w.prototype.createCounter=function(){return new i({text:"{= isNaN(${data>/count}) ? '...' : '('+ ${data>/count} + ')'}",level:"H4"})};w.prototype.createTitle=function(){this._oTitle=new i({text:this._oCategoryConfig.title,level:"H4"});return this._oTitle};w.prototype.createList=function(){this._oList=new w.SearchResultList({inset:false,noDataText:" ",growingThreshold:this.getPageSize()});this._oList.addStyleClass("sapUiCEPSearchCatList");this.bindListViewItems(this.getCurrentView());return this._oList};w.prototype.createViewButtons=function(){var t=this.getViewSettings();var e=t.views.map(function(t){var e=t.key.charAt(0).toUpperCase()+t.key.slice(1);t.tooltip="{i18n>CATEGORY.Views."+e+"ButtonTooltip}";return new g(t)});this._oViewSwitch=new p({selectedKey:this.getCurrentView(),visible:e.length>1,items:e,selectionChange:function(t){var e=t.getParameter("item");this.setCurrentView(e.getKey())}.bind(this)});return this._oViewSwitch};w.prototype.createDefaultItemTemplate=function(){var t=new w.CustomListItem({press:this.itemNavigate.bind(this),type:"Active",content:[new a({direction:"Column",items:[new a({direction:"Row",items:[new r(this.getItemAvatarSettings()).addStyleClass("sapUiSmallMarginBegin"),new n(this.getItemObjectIdentifierSettings()).addStyleClass("sapUiSmallMarginBeginEnd")]})]})]});return t};w.prototype.getItemObjectIdentifierSettings=function(){return{text:"{data>description}",title:"{data>title}",titleActive:"{= !!${data>_navigation} || !!${data>url}}",titlePress:this.itemNavigate.bind(this)}};w.prototype.getItemAvatarSettings=function(t){return{fallbackIcon:this._oCategoryConfig.icon.src,src:t||"{data>icon}",displaySize:this._oCategoryConfig.icon.size,displayShape:this._oCategoryConfig.icon.shape,backgroundColor:this._oCategoryConfig.icon.backgroundColor}};w.prototype.createListItemTemplate=function(){return this.createDefaultItemTemplate().addStyleClass("list")};w.prototype.createCardItemTemplate=function(){return this.createListItemTemplate().addStyleClass("card")};w.prototype.createTileItemTemplate=function(){return this.createListItemTemplate().addStyleClass("tile")};w.prototype.createFooter=function(t){if(t==="viewAll"){this._oFooter=new h({style:"Clear",content:[new l,new u({text:"{i18n>CATEGORIES.All.ViewAll}",press:function(){this.fireViewAll({key:this.getKey(),currentView:this.getCurrentView()})}.bind(this)}),new l({width:"1rem"})]}).addStyleClass("sapCEPCategoryFooterTB")}else{this._oFooter=new h({style:"Clear",content:[new l,new d(this.getPaginatorSettings())]}).addStyleClass("sapCEPCategoryFooterTB")}return this._oFooter};w.prototype.itemNavigate=function(t){};w.prototype.updateIllustration=function(t,e){if(!this.getUseIllustrations()){return}if(!this._oNoDataIllustration){this._oNoDataIllustration=new c({illustrationType:S.SimpleNotFoundMagnifier,enableDefaultTitleAndDescription:false,illustrationSize:"Spot",additionalContent:[new u({text:this._oResourceBundle.getText("CATEGORY.Views.RefreshButton"),visible:false,press:function(){this.fixHeight();setTimeout(function(){this.refreshData()}.bind(this),600);this.updateIllustration(this.translate("LoadingData"),"Loading")}.bind(this)})]})}if(this._iCurrentCount===0){if(e==="NoData"){if(this._iCurrentCount===0){this._oNoDataIllustration.setTitle(t);this._oNoDataIllustration.setIllustrationType(S.SimpleNotFoundMagnifier);this.setAggregation("_nodata",this._oNoDataIllustration);this._oNoDataIllustration.getAdditionalContent()[0].setVisible(true)}}else if(e==="Loading"){if(this._iCurrentCount===0){this._oNoDataIllustration.setTitle(t);this._oNoDataIllustration.setIllustrationType(S.SimpleNotFoundMagnifier);this.setAggregation("_nodata",this._oNoDataIllustration);this._oNoDataIllustration.getAdditionalContent()[0].setVisible(false)}}}else{this.setAggregation("_nodata",null)}};w.prototype.fixHeight=function(t){if(!this.getDomRef()){return}if(t){this.getDomRef().style.setProperty("--tmpPageSize","unset");this._iCurrentHeight=0;return}if(this._oList&&this._oList.getVisible()&&this._oList.getDomRef()){this._iCurrentHeight=Math.max(this._oList.getDomRef().offsetHeight,this._iCurrentHeight)}if(this._iCurrentHeight){this.getDomRef().style.setProperty("--tmpPageSize",this._iCurrentHeight+"px")}};w.prototype.onResize=function(t){if(this._oList&&this._oList._oItemNavigation){this._oList._oItemNavigation.setColumns(this._oList._getCurrentColCount())}if(t.oldSize&&t.size&&t.oldSize.width!==t.size.width){this._iCurrentHeight=0;this.fixHeight()}};w.prototype.onBeforeRendering=function(){if(this._oHighlighter){this._oHighlighter.destroy()}this._oHighlighter=null;if(this._iResizeListenerId){m.deregister(this._iResizeListenerId);this._iResizeListenerId=null}};w.prototype.onAfterRendering=function(){if(!this._iResizeListenerId){this._fnResizeListener=this.onResize.bind(this);this._iResizeListenerId=m.register(this,this._fnResizeListener)}if(!this._oHighlighter&&this.getHighlightResult()){this._oHighlighter=new y(this.getDomRef(),{isCaseSensitive:false,shouldBeObserved:true,querySelector:".sapUiCEPSearchCatLI"});this._oHighlighter.highlight(this.getSearchTerm())}this.fixHeight();if(this._iAfterRendering){clearTimeout(this._iAfterRendering)}this._iAfterRendering=setTimeout(function(){this.fireAfterRendering.bind(this)();this._iAfterRendering=null}.bind(this),this._iAfterRenderingEventDelay)};return w});
//# sourceMappingURL=Category.js.map
/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/ovp/cards/generic/Card.controller","sap/ovp/cards/charts/VizAnnotationManager","sap/viz/ui5/data/FlattenedDataset","sap/ovp/cards/OVPCardAsAPIUtils","sap/ovp/app/resources","sap/base/util/each","sap/ovp/app/OVPLogger","sap/ui/core/Fragment","sap/ovp/filter/FilterUtils","sap/ui/core/Core","sap/ovp/cards/Integration/IntegrationCard","sap/ui/Device","sap/ovp/cards/charts/Utils","sap/ui/dom/units/Rem","sap/m/MessageBox"],function(t,e,a,i,r,s,o,n,d,h,l,u,p,g,v){"use strict";var c=new o("OVP.analytical.analyticalChart");return t.extend("sap.ovp.cards.charts.analytical.analyticalChart",{onInit:function(){t.prototype.onInit.apply(this,arguments);e.formatChartAxes();var a=this;this.eventhandler=function(t,e,i){d.applyFiltersToV2Card(i,a)};this.GloabalEventBus=h.getEventBus();if(this.oMainComponent&&this.oMainComponent.isMacroFilterBar){this.GloabalEventBus.subscribe("OVPGlobalfilter","OVPGlobalFilterSeacrhfired",a.eventhandler)}this.iPreviousRowSpan=0;this.bdataLoadedToEnableAddToInsight=false},onBeforeRendering:function(){if(this.bCardProcessed){return}e.validateCardConfiguration(this);var t=this.getView().byId("analyticalChart");var i=this.getOwnerComponent().getComponentData();if(t){t.setHeight("21rem")}if(this.getCardPropertiesModel().getProperty("/layoutDetail")==="resizable"&&i&&i.appComponent){var r=i.appComponent.getDashboardLayoutUtil();var s=r.dashboardLayoutModel.getCardById(i.cardId);if(s.dashboardLayout.autoSpan&&t){t.setHeight("21rem")}}var o=this.getView().byId("vbLayout");var d;var h=false;var l=new a({data:{path:"/"}});this.isVizPropSet=h;this.oDataSet=l;this.vizFrame=t;this.vbLayout=o;if(!t){c.error(e.constants.ERROR_NO_CHART+": ("+this.getView().getId()+")")}else{this.vbLayout.setBusy(true);d=t.getModel("ovpCardProperties").getProperty("/navigation");if(d===undefined||d=="datapointNav"||d!="headerNav"){e.getSelectedDataPoint(t,this)}t.destroyDataset();var u=t.getParent().getBinding("data");this._handleKPIHeader();if(u&&u.getPath()){u.attachDataReceived(this.onDataReceived.bind(this));u.attachDataRequested(this.onDataRequested.bind(this))}else{n.load("sap.ovp.cards.charts.generic.noData").then(function(t){var e=this.getCardContentContainer();e.removeAllItems();e.addItem(t)}.bind(this))}t.addEventDelegate({onmouseover:function(){var e=t._oOvpVizFrameTooltip;if(e){e._oPopup.close()}}})}this.bCardProcessed=true},onAfterRendering:function(){t.prototype.onAfterRendering.apply(this,arguments);if(!i.checkIfAPIIsUsed(this)&&this.getCardPropertiesModel().getProperty("/layoutDetail")==="resizable"){var e=this.oDashboardLayoutUtil.dashboardLayoutModel.getCardById(this.cardId);var a=this.oDashboardLayoutUtil.getCardDomId(this.cardId);var r=document.getElementById(a);var s=this.getHeaderHeight();if(!e.dashboardLayout.autoSpan){if(r){var o=r.getElementsByClassName("sapOvpWrapper")[0];if(o){o.style.height=e.dashboardLayout.rowSpan*this.oDashboardLayoutUtil.ROW_HEIGHT_PX+2-(s+2*this.oDashboardLayoutUtil.CARD_BORDER_PX)+"px"}}}if(e.dashboardLayout.showOnlyHeader){r.classList.add("sapOvpMinHeightContainer")}var n=this.getView().byId("analyticalChart");if(n){n.setHeight(this._calculateVizFrameHeight()+"px");this._calculateWidth()}}},onDataReceived:function(t){var a=this;var i=this.getView().byId("analyticalChart");var o=this.getView().byId("bubbleText");var n=r.getText("BUBBLESIZE");this.oDataSet.bindData("analyticalmodel>/","");i.setDataset(this.oDataSet);var d=i.getParent();if(!this.isVizPropSet){e.buildVizAttributes(i,d,this);this.isVizPropSet=true;if(o!=undefined){var h=i.getFeeds();s(h,function(t,e){if(h[t].getUid()=="bubbleWidth"){o.setText(n+" "+h[t].getValues())}})}e.hideDateTimeAxis(i)}if(this.getCardPropertiesModel()&&this.getCardPropertiesModel().getData()&&this.getCardPropertiesModel().getData().colorPalette&&i.getVizType()==="stacked_column"){var l=i.getDataset().getDimensions(),g=i.getFeeds(),v,c;for(var y=0;y<g.length;y++){if(g[y].getUid()==="color"){v=g[y].getValues()[0];break}}for(var b=0;b<l.length;b++){if(l[b].getName()===v){c=l[b];break}}if(v&&c){var f={};f["bDescending"]=true;c.setSorter(f)}}var C=t?t.getParameter("data"):null;e.setChartUoMTitle(i,C);if(this.bFlag==true){this.bFlag=false;this.vbLayout.setBusy(false)}else{setTimeout(function(){a.vbLayout.setBusy(false);a.bdataLoadedToEnableAddToInsight=true},0)}e.checkNoData(t,this.getCardContentContainer(),i);if(u.system.phone){if(this.getCardPropertiesModel().getProperty("/layoutDetail")==="resizable"){var m=this.oDashboardLayoutUtil.dashboardLayoutModel.getCardById(this.cardId);var P=Math.max(m.dashboardLayout.rowSpan,this.iPreviousRowSpan);this.iPreviousRowSpan=P}if(p.isDataSetEmpty(t)){i.setHeight(50+"px")}else{var D=this._calculateVizFrameHeight();if(D!==undefined&&typeof D==="number"){i.setHeight(D+"px")}}}},onDataRequested:function(){this.vbLayout.setBusy(true)},getCardItemsBinding:function(){var t=this.getView().byId("analyticalChart");if(t&&t.getParent()){return t.getParent().getBinding("data")}return null},resizeCard:function(t){var a=this.getCardPropertiesModel();this.newCardLayout=t;a.setProperty("/cardLayout/rowSpan",t.rowSpan);a.setProperty("/cardLayout/colSpan",t.colSpan);var i=this.getCardPropertiesModel().getProperty("/cardLayout");var o=this.getHeaderHeight();var n=this.getView().getDomRef().querySelectorAll(".sapOvpWrapper");for(var d=0;d<n.length;d++){n[d].style.height=t.rowSpan*i.iRowHeightPx+2-(o+2*i.iCardBorderPx)+"px"}var h=this.getView().byId("analyticalChart");var l=this.getView().byId("bubbleText");if(h){if(h.getVizType()==="timeseries_bubble"||h.getVizType()==="bubble"){if(i.colSpan>1){l.setVisible(false)}else{l.setVisible(true)}}h.setHeight(this._calculateVizFrameHeight()+"px");this._calculateWidth()}var u=this.getView().byId("ovpCardContentContainer").getDomRef();if(u){if(!t.showOnlyHeader){u.classList.remove("sapOvpContentHidden")}else{u.classList.add("sapOvpContentHidden")}}var p=r.getText("BUBBLESIZE");this.oDataSet.bindData("analyticalmodel>/","");this.vizFrame.setDataset(this.oDataSet);var g=h.getParent();if(!this.isVizPropSet){e.buildVizAttributes(h,g,this);this.isVizPropSet=true;if(l!=undefined){var v=h.getFeeds();s(v,function(t,e){if(v[t].getUid()=="bubbleWidth"){l.setText(p+" "+v[t].getValues())}})}e.hideDateTimeAxis(h)}e.reprioritizeContent(this.newCardLayout,h)},_calculateVizFrameHeight:function(){var t;if(this.getCardPropertiesModel().getProperty("/layoutDetail")==="resizable"){var e=this.getView().byId("analyticalChart");var a=this.oDashboardLayoutUtil.dashboardLayoutModel.getCardById(this.cardId);var i=this.getView().getController();var r=this.getItemHeight(i,"toolbar");var s=this.getHeaderHeight();var o=(e.getVizType()==="timeseries_bubble"||e.getVizType()==="bubble")&&a.dashboardLayout.colSpan===1?43:0;var n=u.system.phone&&this.iPreviousRowSpan>0?this.iPreviousRowSpan:a.dashboardLayout.rowSpan;t=n*this.oDashboardLayoutUtil.ROW_HEIGHT_PX+2-(s+2*this.oDashboardLayoutUtil.CARD_BORDER_PX+r+o+30);var d=e.sId;var h=this._calculateVizLegendGroupHeight(t);var l=this.getView().byId(d);if(l){l.setVizProperties(h)}}else{t=g.toPx(21)}return t},_calculateVizLegendGroupHeight:function(t){var e;if(t<=270){e=.1}else{var a=240;e=(t-a)/t}var i={legendGroup:{layout:{height:e}}};return i},_calculateWidth:function(){var t=this.oDashboardLayoutUtil.dashboardLayoutModel.getCardById(this.cardId);var e=this.getView().byId("analyticalChart");if(t){var a=parseInt(t.dashboardLayout.width,10);var i=e.getVizType();var r=e.sId;if(i==="donut"){var s=this._calculateVizLegendGroupWidth(a);var o=this.getView().byId(r);if(o){o.setVizProperties(s)}}}},_calculateVizLegendGroupWidth:function(t){var e;if(t<=600){e=.25}else if(t<=900){e=.55}else if(t>=1200){e=.7}else{e=.65}var a={legendGroup:{layout:{maxWidth:e}}};return a},refreshCard:function(){this.getView().rerender()},onShowInsightCardPreview:function(){var t=this.getView();var e=t.getController();var a=e.oCardComponentData;var i=this;if(this.checkIBNNavigationExistsForCard()){l.showCard({vizFrame:e.vizFrame,entitySet:e.entitySet,entityType:e.entityType,cardComponentName:"Analytical",cardComponentData:a,cardComponent:e.oCardComponent,view:t}).then(function(t){i.saveGeneratedCardManifest(t)})}else{v.error(r.getText("INT_IBN_NAVIGATION_NOT_FOUND_ERROR_MESSAGE_TEXT"))}}})});
//# sourceMappingURL=analyticalChart.controller.js.map
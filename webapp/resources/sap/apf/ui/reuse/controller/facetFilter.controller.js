/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
*/
sap.ui.define(["sap/apf/ui/utils/facetFilterListHandler","sap/apf/ui/utils/facetFilterListConverter","sap/apf/ui/utils/facetFilterValueFormatter","sap/m/FacetFilter","sap/ui/Device"],function(e,t,i,a,r){"use strict";function s(e){e.getView().byId("idAPFFacetFilter").removeAllLists();var t=e.getView().getViewData();var i=t.aConfiguredFilters;i.forEach(function(i){var a=new sap.apf.ui.utils.FacetFilterListHandler(t.oCoreApi,t.oUiApi,i);e.getView().byId("idAPFFacetFilter").addList(a.createFacetFilterList())})}sap.ui.controller("sap.apf.ui.reuse.controller.facetFilter",{onInit:function(){var e=this;if(r.system.desktop){e.getView().addStyleClass("sapUiSizeCompact")}s(e)},onResetPress:function(){var e=this;e.getView().getViewData().oStartFilterHandler.resetVisibleStartFilters();e.getView().getViewData().oUiApi.selectionChanged(true)}})});
//# sourceMappingURL=facetFilter.controller.js.map
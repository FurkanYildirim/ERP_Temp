/*!
* SAP APF Analysis Path Framework
* 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
*/
/**
* @class facetFilter
* @name  facetFilter
* @description Creates the facet filter
* @memberOf sap.apf.ui.reuse.view
* 
 */
sap.ui.define([
	"sap/m/FacetFilter",
	"sap/ui/Device",
	"sap/ui/core/mvc/JSView" // provides sap.ui.jsview
], function(FacetFilter, Device) {
	'use strict';
	sap.ui.jsview("sap.apf.ui.reuse.view.facetFilter", {
		getControllerName : function() {
			return "sap.apf.ui.reuse.controller.facetFilter";
		},
		createContent : function(oController) {
			var oFacetFilter = new FacetFilter(oController.createId("idAPFFacetFilter"), {
				type : "Simple",
				showReset : true,
				showPopoverOKButton : true,
				reset : oController.onResetPress.bind(oController)
			}).addStyleClass('facetFilterInitialAlign');
			if (Device.system.desktop) {
				oFacetFilter.addStyleClass("facetfilter");
			}
			return oFacetFilter;
		}
	});
});

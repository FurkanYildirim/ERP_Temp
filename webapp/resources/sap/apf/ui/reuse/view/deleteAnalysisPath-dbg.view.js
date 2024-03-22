/*!
 * SAP APF Analysis Path Framework
 * 
 * (c) Copyright 2012-2014 SAP AG. All rights reserved
 */
/* global window*/
sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/library",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/mvc/JSView" // provides sap.ui.jsview
], function(
	Button,
	Dialog,
	mobileLibrary,
	List,
	StandardListItem,
	Device,
	jQuery
) {
	"use strict";
	var ListMode = mobileLibrary.ListMode;

	sap.ui.jsview("sap.apf.ui.reuse.view.deleteAnalysisPath", {
		getControllerName : function() {
			return "sap.apf.ui.reuse.controller.deleteAnalysisPath";
		},
		createContent : function(oController) {
			var contentWidth = jQuery(window).height() * 0.6 + "px"; // height and width for the dialog relative to the window
			var contentHeight = jQuery(window).height() * 0.6 + "px";
			this.oCoreApi = this.getViewData().oInject.oCoreApi;
			this.oUiApi = this.getViewData().oInject.uiApi;
			var self = this;
			var list = new List({
				mode : ListMode.Delete,
				items : {
					path : "/GalleryElements",
					template : new StandardListItem({
						title : "{AnalysisPathName}",
						description : "{description}",
						tooltip : "{AnalysisPathName}"
					})
				},
				"delete" : oController.handleDeleteOfDialog.bind(oController)
			});
			var oDialog = new Dialog({
				title : self.oCoreApi.getTextNotHtmlEncoded("delPath"),
				contentWidth : contentWidth,
				contentHeight : contentHeight,
				content : list,
				leftButton : new Button({
					text : self.oCoreApi.getTextNotHtmlEncoded("close"),
					press : function() {
						oDialog.close();
						self.oUiApi.getLayoutView().setBusy(false);
					}
				}),
				afterClose : function() {
					self.destroy();
				}
			});
			if (Device.system.desktop) {
				this.addStyleClass("sapUiSizeCompact");
				oDialog.addStyleClass("sapUiSizeCompact");
			}
			return oDialog;
		}
	});
});

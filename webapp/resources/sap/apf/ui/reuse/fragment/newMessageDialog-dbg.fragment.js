/*!
 * SAP APF Analysis Path Framework
 *
 * (c) Copyright 2012-2014 SAP SE. All rights reserved
 */
/* global sap*/
/**
 *@class newMessageDialog
 *@name  newMessageDialog Fragment
 *@description Dialog to make sure dirty paths got saved
 *@memberOf sap.apf.ui.reuse.view
 * 
 */
sap.ui.define([
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/library",
	"sap/m/Text",
	"sap/ui/core/Fragment" // provides sap.ui.jsfragment
], function(
	Button,
	Dialog,
	mobileLibrary,
	Text
) {
	"use strict";
	var DialogType = mobileLibrary.DialogType;

	sap.ui.jsfragment("sap.apf.ui.reuse.fragment.newMessageDialog", {
		createContent : function(oController) {
			var yesButton = new Button(oController.createId("idYesButton"), {
				text : oController.oCoreApi.getTextNotHtmlEncoded("yes")
			});
			var noButton = new Button(oController.createId("idNoButton"), {
				text : oController.oCoreApi.getTextNotHtmlEncoded("no")
			});
			var newDialog = new Dialog(oController.createId("idNewDialog"), {
				type : DialogType.Standard,
				title : oController.oCoreApi.getTextNotHtmlEncoded("newPath"),
				content : new Text({
					text : oController.oCoreApi.getTextNotHtmlEncoded("analysis-path-not-saved")
				}).addStyleClass("textStyle"),
				buttons : [ yesButton, noButton ],
				afterClose : function() {
					newDialog.destroy();
				}
			});
			return newDialog;
		}
	});
});

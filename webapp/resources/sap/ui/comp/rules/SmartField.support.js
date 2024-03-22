/*!
 * SAPUI5
 * (c) Copyright 2009-2023 SAP SE. All rights reserved.
 */
/**
 * Defines support rules of the SmartField control of sap.ui.layout library.
 */
sap.ui.define(["sap/ui/core/LabelEnablement", "sap/ui/comp/odata/MetadataAnalyser", "sap/ui/support/library"],
	function(LabelEnablement, MetadataAnalyser, SupportLib) {
	"use strict";

	// shortcuts
	var Categories = SupportLib.Categories; // Accessibility, Performance, Memory, ...
	var Severity = SupportLib.Severity; // Hint, Warning, Error
	var Audiences = SupportLib.Audiences; // Control, Internal, Application

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/* eslint-disable no-lonely-if */

	var oSmartFieldLabelRule = {
		id: "smartFieldLabel",
		audiences: [Audiences.Application],
		categories: [Categories.Usability],
		enabled: true,
		minversion: "1.48",
		title: "SmartField: Use of SmartLabel",
		description: "SmartField must be labelled by the SmartLabel control, not by the sap.m.Label control",
		resolution: "Use a SmartLabel control to label the SmartField control",
		resolutionurls: [{
				text: "API Reference: SmartField",
				href:"https://ui5.sap.com/#/api/sap.ui.comp.smartfield.SmartField"
			}],
		check: function (oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField")
			.forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				var aLabels = LabelEnablement.getReferencingLabels(oSmartField);

				for (var i = 0; i < aLabels.length; i++) {
					var oLabel = sap.ui.getCore().byId(aLabels[i]);
					if (!oLabel.isA("sap.ui.comp.smartfield.SmartLabel")) {
						oIssueManager.addIssue({
							severity: Severity.Medium,
							details: "SmartField " + sId + " labelled by wrong Label.",
							context: {
								id: oLabel.getId()
							}
						});
					}
				}

			});
		}
	};

	var oSmartFieldValueBindingContext = {
		id: "smartFieldValueBindingContext",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.60",
		async: false,
		title: "SmartField: the value property is bound but there is no binding context available",
		description: "When the value property of the SmartField control is bound but there is no binding context available, the control can't " +
			"resolve its service metadata or property values so the control behaves as if it were used without data binding and " +
			"service metadata. This will result in a control without value.",
		resolution: "Make sure the control has binding context",
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField").filter(function(oSmartField) {
				return oSmartField.isBound("value");
			}).forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				if (!oSmartField.getBindingContext()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "SmartField " + sId + " has its value property bound but its binding context is undefined.",
						context: {id: sId}
					});
				}
			});
		}
	};

	var oSmartFieldVisibleBindingContext = {
		id: "smartFieldVisibleBindingContext",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.60",
		async: false,
		title: "SmartField: the visible property is bound but there is no binding context available",
		description: "When the visible property of the SmartField control is bound but there is no binding context available, the control can't " +
			"resolve its service metadata or property values so the control behaves as if it were used without data binding and " +
			"service metadata. This will result in a visible control as the default value for the visible property is `true`.",
		resolution: "Make sure the control has a binding context",
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField").filter(function(oSmartField) {
				return oSmartField.isBound("visible");
			}).forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				if (!oSmartField.getBindingContext()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "SmartField " + sId + " has its visible property bound but its binding context is undefined.",
						context: {id: sId}
					});
				}
			});
		}
	};

	var oSmartFieldMandatoryBindingContext = {
		id: "smartFieldMandatoryBindingContext",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.60",
		async: false,
		title: "SmartField: the mandatory property is bound but there is no binding context available",
		description: "When the mandatory property of the SmartField control is bound but there is no binding context available, the control can't " +
			"resolve its service metadata or property values so the control behaves as if it were used without data binding and " +
			"service metadata. This will result in a control which is not marked as mandatory as the default value for the " +
			"property is `false`.",
		resolution: "Make sure the control has a binding context",
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField").filter(function(oSmartField) {
				return oSmartField.isBound("mandatory");
			}).forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				if (!oSmartField.getBindingContext()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "SmartField " + sId + " has its mandatory property bound but its binding context is undefined.",
						context: {id: sId}
					});
				}
			});
		}
	};

	var oSmartFieldEditableBindingContext = {
		id: "smartFieldEditableBindingContext",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.60",
		async: false,
		title: "SmartField: the editable property is bound but there is no binding context available",
		description: "When the editable property of the SmartField control is bound but there is no binding context available, the control can't " +
			"resolve its service metadata or property values so the control behaves as if it were used without data binding and " +
			"service metadata. This will result in a control which is editable as the default value for the property is `true`.",
		resolution: "Make sure the control has a binding context",
		check: function(oIssueManager, oCoreFacade, oScope) {
			oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField").filter(function(oSmartField) {
				return oSmartField.isBound("editable");
			}).forEach(function(oSmartField) {
				var sId = oSmartField.getId();
				if (!oSmartField.getBindingContext()) {
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "SmartField " + sId + " has its editable property bound but its binding context is undefined.",
						context: {id: sId}
					});
				}
			});
		}
	};

	var oSmartFieldNotVisible = {
		id: "smartFieldNotVisible",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.114",
		async: false,
		title: "SmartField: not visualizing in the application",
		description: "The inner controls are not created or the SmartField is not visible at all",
		resolution: "Make sure the control has a binding context, value property binding, and the visible property is set to true",
		check: function(oIssueManager, oCoreFacade, oScope) {
			var iIndex,
				aDetails,
				bHasBindingContext,
				bHasValuePropertyBinding,
				bIsVisible,
				oSmartField,
				aSmartFields = oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField");

			for (iIndex = 0; iIndex < aSmartFields.length; iIndex++) {
				aDetails = [];
				oSmartField = aSmartFields[iIndex];
				bHasBindingContext = oSmartField.getBindingContext();
				bHasValuePropertyBinding = oSmartField.isBound("value");
				bIsVisible = oSmartField.getVisible();

				if (!bHasBindingContext) {
					aDetails.push("Valid Binding Context");
				}

				if (!bHasValuePropertyBinding) {
					aDetails.push("Valid 'value' property Binding");
				}

				if (bHasBindingContext && bHasValuePropertyBinding && !bIsVisible) {
					aDetails.push("its 'visible' property is true");
				}

				if (aDetails !== null){
					oIssueManager.addIssue({
						severity: Severity.High,
						details: "SmartField doesn't meet the requirements for: " + aDetails.join(", "),
						context: {id: oSmartField.getId()}
					});
				}
			}
		}
	};

	var oSmartFieldLocalTimeZoneOnly = {
		id: "smartFieldLocalTimeZoneOnly",
		audiences: [Audiences.Application],
		categories: [Categories.Bindings],
		minversion: "1.114",
		async: false,
		title: "SmartField: DateTimeTimezone type",
		description: "Local timezone always taken",
		resolution: "Make sure that there is a time zone value",
		resolutionurls: [
			{
				text: "SmartField with DateTimeTimezone type - local timezone always taken",
				href: "https://sap.stackenterprise.co/questions/12948"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope) {
			var iIndex,
				sTimeZonePath,
				mTimeZoneValue,
				oEdmProperty,
				oFactory,
				oSmartField,
				aSmartFields = oScope.getElementsByClassName("sap.ui.comp.smartfield.SmartField");

			for (iIndex = 0; iIndex < aSmartFields.length; iIndex++) {
				oSmartField = aSmartFields[iIndex];
				oFactory = oSmartField.getControlFactory();

				if (oFactory.isA("sap.ui.comp.smartfield.ODataControlFactory")) {
					oEdmProperty = oFactory.getEdmProperty();
					sTimeZonePath = oEdmProperty && MetadataAnalyser.getTimezonePropertyPath(oEdmProperty);
					mTimeZoneValue = oSmartField.getBindingContext().getProperty(sTimeZonePath);

					if (sTimeZonePath && !mTimeZoneValue) {
						oIssueManager.addIssue({
							severity: Severity.High,
							details: "SmartField has Timezone annotation but doesn't have time zone value in the current Binding Context.",
							context: {id: oSmartField.getId()}
						});
					}
				}
			}
		}
	};

	return [
		oSmartFieldLabelRule,
		oSmartFieldValueBindingContext,
		oSmartFieldVisibleBindingContext,
		oSmartFieldMandatoryBindingContext,
		oSmartFieldEditableBindingContext,
		oSmartFieldNotVisible,
		oSmartFieldLocalTimeZoneOnly
	];

}, true);

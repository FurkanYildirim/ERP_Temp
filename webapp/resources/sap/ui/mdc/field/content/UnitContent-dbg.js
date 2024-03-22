/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent",
	"sap/ui/model/Filter",
	"sap/base/util/isEmptyObject",
	"sap/base/util/merge",
	"sap/base/util/ObjectPath",
	"sap/ui/mdc/enums/FieldEditMode"
], function(DefaultContent, Filter, isEmptyObject, merge, ObjectPath, FieldEditMode) {
	"use strict";


	var _getUnitTypeInstance = function (oTypeUtil, oType, oFormatOptions, oConstraints, bShowNumber, bShowMeasure) {
		return oTypeUtil.getUnitTypeInstance ? oTypeUtil.getUnitTypeInstance(oType, bShowNumber, bShowMeasure) : oTypeUtil.getDataTypeInstance(oType.getMetadata().getName(), oFormatOptions, oConstraints, {showNumber: bShowNumber, showMeasure: bShowMeasure});
	};

	/**
	 * Object-based definition of the unit content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enums.ContentMode}.
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.UnitContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 */
	var UnitContent = Object.assign({}, DefaultContent, {
		getEdit: function() {
			return ["sap/ui/mdc/field/FieldInput", "sap/ui/core/InvisibleText"];
		},
		getEditMultiValue: function() {
			return ["sap/ui/mdc/field/FieldMultiInput", "sap/ui/mdc/field/FieldInput", "sap/m/Token", "sap/ui/core/InvisibleText"];
		},
		getEditMultiLine: function() {
			return [null];
		},
		getUseDefaultFieldHelp: function() {
			return false;
		},
		createEdit: function(oContentFactory, aControlClasses, sId) {
			oContentFactory.setIsMeasure(true); // FieldHelp only on unit field
			var Input = aControlClasses[0];
			var InvisibleText = aControlClasses[1];
			var oConditionsType = oContentFactory.getConditionsType();
			this._adjustDataTypeForUnit(oContentFactory);

			var sInvisibleTextId = InvisibleText.getStaticId("sap.ui.mdc", "field.NUMBER");
			var aControls = [];
			var oInput1 = new Input(sId, {
				value: { path: "$field>/conditions", type: oConditionsType },
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				valueHelpIconSrc: "sap-icon://slim-arrow-down",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				showValueHelp: false,
				width: "70%",
				tooltip: "{$field>/tooltip}",
				autocomplete: false,
				fieldGroupIds: [oContentFactory.getField().getId()], // use FieldGroup to fire change only if focus leaved complete Field
				ariaDescribedBy: [sInvisibleTextId],
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange()
			});
			oInput1._setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oInput1);
			aControls.push(oInput1);
			aControls = this._addUnitControl(oContentFactory, aControls, sId, Input, InvisibleText);

			return aControls;
		},
		createEditMultiValue: function(oContentFactory, aControlClasses, sId) {
			oContentFactory.setIsMeasure(true); // FieldHelp only on unit field
			var MultiInput = aControlClasses[0];
			var Token = aControlClasses[2]; // is loaded by MultiInput
			var Input = aControlClasses[1];
			var InvisibleText = aControlClasses[3];
			var oConditionType = oContentFactory.getConditionType();
			var oConditionsType = oContentFactory.getConditionsType();
			this._adjustDataTypeForUnit(oContentFactory);

			var aControls = [];
			var oToken = new Token(sId + "-token", {
				text: {
					path: '$field>',
					type: oConditionType
				}
			});

			var oFilter = new Filter({
				path: "values",
				test: function(aValues) {
					// do not show tokens for units without measure
					if (!Array.isArray(aValues[0]) || aValues[0][0]) {
						return true;
					} else {
						return false;
					}
				}
			});

			var sInvisibleTextId = InvisibleText.getStaticId("sap.ui.mdc", "field.NUMBER");
			var oMultiInput = new MultiInput(sId, {
				value: { path: "$field>/conditions", type: oConditionsType }, // only for parsing
				placeholder: "{$field>/placeholder}",
				textAlign: "{$field>/textAlign}",
				textDirection: "{$field>/textDirection}",
				required: "{$field>/required}",
				editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditable },
				enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
				valueState: "{$field>/valueState}",
				valueStateText: "{$field>/valueStateText}",
				showValueHelp: false,
				width: "70%",
				tooltip: "{$field>/tooltip}",
				fieldGroupIds: [oContentFactory.getField().getId()], // use FieldGroup to fire change only if focus leaved complete Field
				ariaDescribedBy: [sInvisibleTextId],
				tokens: { path: "$field>/conditions", template: oToken, filters: [oFilter] },
				dependents: [oToken], // to destroy it if MultiInput is destroyed
				change: oContentFactory.getHandleContentChange(),
				liveChange: oContentFactory.getHandleContentLiveChange(),
				tokenUpdate: oContentFactory.getHandleTokenUpdate()
			});
			oMultiInput._setPreferUserInteraction(true);
			oContentFactory.setAriaLabelledBy(oMultiInput);
			aControls.push(oMultiInput);
			aControls = this._addUnitControl(oContentFactory, aControls, sId, Input, InvisibleText);

			return aControls;
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.UnitContent - createEditMultiLine not defined!");
		},
		_addUnitControl: function(oContentFactory, aControls, sId, Input, InvisibleText) {
			var oUnitConditionsType = oContentFactory.getUnitConditionsType();

			if (oContentFactory.getField().getEditMode() === FieldEditMode.EditableDisplay) {
				aControls[0].bindProperty("description", { path: "$field>/conditions", type: oUnitConditionsType });
				aControls[0].setWidth("100%");
				aControls[0].setFieldWidth("70%");
			} else {
				var sInvisibleTextId;
				var oType = oContentFactory.getUnitOriginalType();
				var sName = oType && oType.getMetadata().getName();
				if (sName && sName.indexOf("Currency") >= 0) { // TODO: better solution
					sInvisibleTextId = InvisibleText.getStaticId("sap.ui.mdc", "field.CURRENCY");
				} else {
					sInvisibleTextId = InvisibleText.getStaticId("sap.ui.mdc", "field.UNIT");
				}

				var oInput = new Input(sId + "-unit", {
					value: { path: "$field>/conditions", type: oUnitConditionsType },
					placeholder: "{$field>/placeholder}",
					textAlign: "{$field>/textAlign}",
					textDirection: "{$field>/textDirection}",
					required: "{$field>/required}",
					editable: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEditableUnit },
					enabled: { path: "$field>/editMode", formatter: oContentFactory.getMetadata()._oClass._getEnabled },
					valueState: "{$field>/valueState}",
					valueHelpIconSrc: oContentFactory.getFieldHelpIcon(),
					valueStateText: "{$field>/valueStateText}",
					showValueHelp: "{$field>/_fieldHelpEnabled}",
					ariaAttributes: "{$field>/_ariaAttributes}",
					width: "30%",
					tooltip: "{$field>/tooltip}",
					autocomplete: false,
					fieldGroupIds: [oContentFactory.getField().getId()], // use FieldGroup to fire change only if focus leaved complete Field
					ariaDescribedBy: [sInvisibleTextId],
					change: oContentFactory.getHandleContentChange(),
					liveChange: oContentFactory.getHandleContentLiveChange(),
					valueHelpRequest: oContentFactory.getHandleValueHelpRequest()
				});

				oInput._setPreferUserInteraction(true);
				oContentFactory.setAriaLabelledBy(oInput);
				aControls.push(oInput);
			}

			return aControls;
		},
		_adjustDataTypeForUnit: function(oContentFactory) {
			var oField = oContentFactory.getField();
			var TypeMap = oField.getTypeMap();
			var oType = oContentFactory.retrieveDataType();
			var oFormatOptions = oType.getFormatOptions();
			var oConstraints = oType.getConstraints();
			var bShowMeasure = !oFormatOptions || !oFormatOptions.hasOwnProperty("showMeasure") || oFormatOptions.showMeasure;
			var bShowNumber = !oFormatOptions || !oFormatOptions.hasOwnProperty("showNumber") || oFormatOptions.showNumber;

			// if measure and number needs to be shown -> create new type
			if (bShowMeasure && bShowNumber) {
				var oClonedFormatOptions = merge({},oFormatOptions);
				var oClonedConstraints = isEmptyObject(oConstraints) ? undefined : merge({}, oConstraints);

				// Type for number
				var oNewType = _getUnitTypeInstance(TypeMap, oType, oClonedFormatOptions, oClonedConstraints, true, false);
				oContentFactory.setUnitOriginalType(oContentFactory.getDataType());
				TypeMap.initializeInternalType(oNewType, oContentFactory.getFieldTypeInitialization());
				oContentFactory.setDataType(oNewType);

				// type for unit
				oNewType = _getUnitTypeInstance(TypeMap, oType, oClonedFormatOptions, oClonedConstraints, false, true);
				TypeMap.initializeInternalType(oNewType, oContentFactory.getFieldTypeInitialization());
				oContentFactory.setUnitType(oNewType);
				oContentFactory.updateConditionType();
			}
		}
	});

	return UnitContent;
});
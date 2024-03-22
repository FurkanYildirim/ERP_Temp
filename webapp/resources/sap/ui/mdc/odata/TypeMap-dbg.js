/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	'../DefaultTypeMap',
	'sap/ui/mdc/enums/BaseType'
], function(DefaultTypeMap, BaseType) {
"use strict";

	/**
	* @class OData-specific <code>TypeMap</code> configuration
	*
	* <b>Note:</b> This <code>TypeMap</code> implementation contains the following types:
	*
	* <ul>
	* <li>sap.ui.model.type.Boolean (alias Boolean)</li>
	* <li>sap.ui.model.type.Currency (alias Currency)</li>
	* <li>sap.ui.model.type.Date (alias Date)</li>
	* <li>sap.ui.model.type.DateTime (alias DateTime)</li>
	* <li>sap.ui.model.type.Float (alias Float)</li>
	* <li>sap.ui.model.type.Integer (alias Integer)</li>
	* <li>sap.ui.model.type.String (alias String)</li>
	* <li>sap.ui.model.type.Time (alias Time)</li>
	* <li>sap.ui.model.type.Unit (alias Unit)</li>
	* <li>sap.ui.model.odata.type.Stream (alias Edm.Binary)</li>
	* <li>sap.ui.model.odata.type.Boolean (alias Edm.Boolean)</li>
	* <li>sap.ui.model.odata.type.Byte (alias Edm.Byte)</li>
	* <li>sap.ui.model.odata.type.Date (alias Edm.Date)</li>
	* <li>sap.ui.model.odata.type.DateTime (alias Edm.DateTime)</li>
	* <li>sap.ui.model.odata.type.DateTimeOffset (alias Edm.DateTimeOffset)</li>
	* <li>sap.ui.model.odata.type.Decimal (alias Edm.Decimal)</li>
	* <li>sap.ui.model.odata.type.Double (alias Edm.Double)</li>
	* <li>sap.ui.model.odata.type.Single (alias Edm.Float)</li>
	* <li>sap.ui.model.odata.type.Guid (alias Edm.Guid)</li>
	* <li>sap.ui.model.odata.type.Int16 (alias Edm.Int16)</li>
	* <li>sap.ui.model.odata.type.Int32 (alias Edm.Int32)</li>
	* <li>sap.ui.model.odata.type.Int64 (alias Edm.Int64)</li>
	* <li>sap.ui.model.odata.type.SByte (alias Edm.SByte)</li>
	* <li>sap.ui.model.odata.type.Single (alias Edm.Single)</li>
	* <li>sap.ui.model.odata.type.Stream (alias Edm.Stream)</li>
	* <li>sap.ui.model.odata.type.String (alias Edm.String)</li>
	* <li>sap.ui.model.odata.type.Time (alias Edm.Time)</li>
	* <li>sap.ui.model.odata.type.TimeOfDay (alias Edm.TimeOfDay)</li>
	* </ul>
	*
	* @author SAP SE
	* @version 1.115.1
	* @public
	* @since 1.114.0
	* @namespace
	* @alias module:sap/ui/mdc/odata/TypeMap
	* @extends module:sap/ui/mdc/DefaultTypeMap
	*/
	var ODataTypeMap = Object.assign({}, DefaultTypeMap);

	ODataTypeMap.getDateTimeBaseType = function (oFormatOptions, oConstraints) {
		if (oConstraints && oConstraints.displayFormat === "Date") {
			return BaseType.Date;
		} else {
			return BaseType.DateTime;
		}
	};

	ODataTypeMap.import(DefaultTypeMap);

	ODataTypeMap.set("sap.ui.model.odata.type.Boolean", BaseType.Boolean);
	ODataTypeMap.set("sap.ui.model.odata.type.Byte", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Currency", DefaultTypeMap.getUnitBaseType, DefaultTypeMap.getUnitOptions);
	ODataTypeMap.set("sap.ui.model.odata.type.Date", BaseType.Date);
	ODataTypeMap.set("sap.ui.model.odata.type.DateTime", ODataTypeMap.getDateTimeBaseType);
	ODataTypeMap.set("sap.ui.model.odata.type.DateTimeOffset", BaseType.DateTime);
	ODataTypeMap.set("sap.ui.model.odata.type.DateTimeWithTimezone", BaseType.DateTime);
	ODataTypeMap.set("sap.ui.model.odata.type.Decimal", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Double", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Guid", BaseType.String);
	ODataTypeMap.set("sap.ui.model.odata.type.Int16", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Int32", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Int64", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.SByte", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Single", BaseType.Numeric);
	ODataTypeMap.set("sap.ui.model.odata.type.Stream", BaseType.String);
	ODataTypeMap.set("sap.ui.model.odata.type.String", BaseType.String);
	ODataTypeMap.set("sap.ui.model.odata.type.Time", BaseType.Time);
	ODataTypeMap.set("sap.ui.model.odata.type.TimeOfDay", BaseType.Time);
	ODataTypeMap.set("sap.ui.model.odata.type.Unit", DefaultTypeMap.getUnitBaseType, DefaultTypeMap.getUnitOptions);


	// Alias configuration
	ODataTypeMap.setAlias("Edm.Binary", "sap.ui.model.odata.type.Stream");
	ODataTypeMap.setAlias("Edm.Boolean", "sap.ui.model.odata.type.Boolean");
	ODataTypeMap.setAlias("Edm.Byte", "sap.ui.model.odata.type.Byte");
	ODataTypeMap.setAlias("Edm.Date", "sap.ui.model.odata.type.Date");
	ODataTypeMap.setAlias("Edm.DateTime", "sap.ui.model.odata.type.DateTime");
	ODataTypeMap.setAlias("Edm.DateTimeOffset", "sap.ui.model.odata.type.DateTimeOffset");
	ODataTypeMap.setAlias("Edm.Decimal", "sap.ui.model.odata.type.Decimal");
	ODataTypeMap.setAlias("Edm.Double", "sap.ui.model.odata.type.Double");
	ODataTypeMap.setAlias("Edm.Float", "sap.ui.model.odata.type.Single");
	ODataTypeMap.setAlias("Edm.Guid", "sap.ui.model.odata.type.Guid");
	ODataTypeMap.setAlias("Edm.Int16", "sap.ui.model.odata.type.Int16");
	ODataTypeMap.setAlias("Edm.Int32", "sap.ui.model.odata.type.Int32");
	ODataTypeMap.setAlias("Edm.Int64", "sap.ui.model.odata.type.Int64");
	ODataTypeMap.setAlias("Edm.SByte", "sap.ui.model.odata.type.SByte");
	ODataTypeMap.setAlias("Edm.Single", "sap.ui.model.odata.type.Single");
	ODataTypeMap.setAlias("Edm.Stream", "sap.ui.model.odata.type.Stream");
	ODataTypeMap.setAlias("Edm.String", "sap.ui.model.odata.type.String");
	ODataTypeMap.setAlias("Edm.Time", "sap.ui.model.odata.type.Time");
	ODataTypeMap.setAlias("Edm.TimeOfDay", "sap.ui.model.odata.type.TimeOfDay");

	/*
	 * For sap.ui.model.odata.type.Currency and sap.ui.model.odata.type.Unit the
	 * CompositeBinding has 3 parts, Number, Currency/Unit and unit map.
	 * On the first call of formatValue the unit map is analyzed and stored inside the
	 * Type. Later, on parsing it is used. Without initializing the unit map parsing is
	 * not working.
	 *
	 * In the sap.ui.mdc.Field the Type is created via Binding. So when the value of the Field
	 * gets the unit map for the first time we need to initialize the type via formatValue.
	 * (As no condition is created if there is no number or unit formatValue might not be called before
	 * first user input.)
	 *
	 * We return the given unit map in the TypeInitialization object to allow to initialize the "cloned"
	 * Unit/Currency-Type (internally used by the two Input controls for number and unit) with the unit map.
	 */
	ODataTypeMap.initializeTypeFromValue = function(oType, vValue) {

		if (oType && this.getBaseType(oType.getMetadata().getName()) === BaseType.Unit && Array.isArray(vValue) && vValue.length > 2) {
			if (vValue[2] !== undefined) {
				var oTypeInitialization = {mCustomUnits: vValue[2]};
				this.initializeInternalType(oType, oTypeInitialization);
				return oTypeInitialization;
			}
		} else {
			return {}; // to mark initialization as finished as not needed for normal types
		}

		return null; // not all needed information are given right now.

	};

	ODataTypeMap.initializeInternalType = function(oType, oTypeInitialization) {

		if (oTypeInitialization && oTypeInitialization.mCustomUnits !== undefined) {
			// if already initialized initialize new type too.
			oType.formatValue([null, null, oTypeInitialization.mCustomUnits], "string");
		}

	};

	ODataTypeMap.freeze();

	return ODataTypeMap;
});
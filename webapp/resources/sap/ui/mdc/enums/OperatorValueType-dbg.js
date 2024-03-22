/*!
 * OpenUI5
 * (c) Copyright 2009-2023 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function() {
	"use strict";

	/**
	 * Defines what data type is used for parse or format the condition values on a {@link sap.ui.mdc.condition.Operator Operator}.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.115
	 * @alias sap.ui.mdc.enums.OperatorValueType
	 */
	var OperatorValueType = {
		/**
		 * The <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used.
		 *
		 * @public
		 */
		Self: "self",

		/**
		 * A simple string type is used to display static text.
		 *
		 * @public
		 */
		Static: "static",

		/**
		 * The <code>Type</code> of the <code>Field</code> or <code>FilterField</code> using the <code>Operator</code> is used
		 * for validation, but the user input is used as value.
		 *
		 * @public
		 */
		SelfNoParse: "selfNoParse"
	};

	return OperatorValueType;

}, /* bExport= */ true);

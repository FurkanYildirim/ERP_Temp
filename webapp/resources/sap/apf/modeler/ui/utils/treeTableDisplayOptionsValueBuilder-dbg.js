sap.ui.define(
	[
		"sap/apf/modeler/ui/utils/displayOptionsValueBuilder",
		"sap/apf/utils/exportToGlobal"
	],
	function(displayOptionsValueBuilder, exportToGlobal) {
		"use strict";
		function TreeTableDisplayOptionsValueBuilder(oTextReader, oOptionsValueModelBuilder) {
		sap.apf.modeler.ui.utils.DisplayOptionsValueBuilder.apply(this, [ oTextReader, oOptionsValueModelBuilder ]);
		}
		TreeTableDisplayOptionsValueBuilder.prototype = Object.create(sap.apf.modeler.ui.utils.DisplayOptionsValueBuilder.prototype);
		TreeTableDisplayOptionsValueBuilder.prototype.constructor = TreeTableDisplayOptionsValueBuilder;
		TreeTableDisplayOptionsValueBuilder.prototype.getLabelDisplayOptions = function() {
			var aLabelDisplayOptionTypes = [ {
				key : "key",
				name : this.oTextReader("key")
			}, {
				key : "text",
				name : this.oTextReader("text")
			} ];
			return this.oOptionsValueModelBuilder.prepareModel(aLabelDisplayOptionTypes, aLabelDisplayOptionTypes.length);
		};
		TreeTableDisplayOptionsValueBuilder.prototype.getValidatedLabelDisplayOptions = function() {
			var oTextManipulator = sap.apf.modeler.ui.utils.textManipulator;
			var aLabelDisplayOptionTypes = [ {
				key : "key",
				name : this.oTextReader("key")
			}, {
				key : oTextManipulator.addPrefixText([ "text" ], this.oTextReader)[0],
				name : oTextManipulator.addPrefixText([ this.oTextReader("text") ], this.oTextReader)[0]
			} ];
			return this.oOptionsValueModelBuilder.prepareModel(aLabelDisplayOptionTypes, aLabelDisplayOptionTypes.length);
		};

		// compatiblity export as the global name and the module name differ
		exportToGlobal("sap.apf.modeler.ui.utils.TreeTableDisplayOptionsValueBuilder", TreeTableDisplayOptionsValueBuilder);

		return TreeTableDisplayOptionsValueBuilder;
	}
);
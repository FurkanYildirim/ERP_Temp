import "sap/fe/core/library";
import "sap/fe/macros/filter/type/MultiValue";
import "sap/fe/macros/filter/type/Range";
import "sap/fe/macros/macroLibrary";
import Core from "sap/ui/core/Core";
import Fragment from "sap/ui/core/Fragment";
import "sap/ui/core/library";
import "sap/ui/core/XMLTemplateProcessor";
import "sap/ui/mdc/field/ConditionsType";
import "sap/ui/mdc/library";
import "sap/ui/unified/library";

/**
 * Library containing the building blocks for SAP Fiori elements.
 *
 * @namespace
 * @name sap.fe.macros
 * @public
 */
export const macrosNamespace = "sap.fe.macros";

// library dependencies
const thisLib = Core.initLibrary({
	name: "sap.fe.macros",
	dependencies: ["sap.ui.core", "sap.ui.mdc", "sap.ui.unified", "sap.fe.core"],
	types: ["sap.fe.macros.NavigationType"],
	interfaces: [],
	controls: [],
	elements: [],
	// eslint-disable-next-line no-template-curly-in-string
	version: "${version}",
	noLibraryCSS: true
}) as any;

thisLib.NavigationType = {
	/**
	 * For External Navigation
	 *
	 * @public
	 */
	External: "External",

	/**
	 * For In-Page Navigation
	 *
	 * @public
	 */
	InPage: "InPage",

	/**
	 * For No Navigation
	 *
	 * @public
	 */
	None: "None"
};

Fragment.registerType("CUSTOM", {
	load: (Fragment as any).getType("XML").load,
	init: function (mSettings: any, ...args: any[]) {
		const currentController = mSettings.containingView.getController();
		let targetControllerExtension = currentController;
		if (currentController && !currentController.isA("sap.fe.core.ExtensionAPI")) {
			targetControllerExtension = currentController.getExtensionAPI(mSettings.id);
		}
		mSettings.containingView = {
			oController: targetControllerExtension
		};
		return (Fragment as any).getType("XML").init.apply(this, [mSettings, args]);
	}
});

export default thisLib;

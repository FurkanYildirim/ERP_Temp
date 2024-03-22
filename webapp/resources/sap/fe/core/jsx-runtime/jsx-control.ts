import BuildingBlockBase from "sap/fe/core/buildingBlocks/BuildingBlockBase";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileConstant, compileExpression, isBindingToolkitExpression, isConstant } from "sap/fe/core/helpers/BindingToolkit";
import type { ControlProperties, JSXContext, NonControlProperties, Ref } from "sap/fe/core/jsx-runtime/jsx";
import Text from "sap/m/Text";
import DataType from "sap/ui/base/DataType";
import type ManagedObjectMetadata from "sap/ui/base/ManagedObjectMetadata";
import type Control from "sap/ui/core/Control";
import type { $ControlSettings } from "sap/ui/core/Control";
import type Element from "sap/ui/core/Element";
import EventHandlerResolver from "sap/ui/core/mvc/EventHandlerResolver";

const addChildAggregation = function (aggregationChildren: any, aggregationName: string, child: any) {
	if (child === undefined || typeof child === "string") {
		return;
	}
	if (!aggregationChildren[aggregationName]) {
		aggregationChildren[aggregationName] = [];
	}
	if (isChildAnElement(child)) {
		aggregationChildren[aggregationName].push(child);
	} else if (Array.isArray(child)) {
		child.forEach((subChild) => {
			addChildAggregation(aggregationChildren, aggregationName, subChild);
		});
	} else {
		Object.keys(child).forEach((childKey) => {
			addChildAggregation(aggregationChildren, childKey, child[childKey]);
		});
	}
};
const isChildAnElement = function <T>(children?: Element | ControlProperties<T>): children is Element {
	return (children as Element)?.isA?.("sap.ui.core.Element");
};
const isAControl = function (children?: typeof Control | Function): children is typeof Control {
	return !!(children as typeof Control)?.getMetadata;
};

function processAggregations(metadata: ManagedObjectMetadata, mSettings: Record<string, unknown>) {
	const metadataAggregations = metadata.getAllAggregations();
	const defaultAggregationName = metadata.getDefaultAggregationName();
	const aggregationChildren: Record<string, string[]> = {};
	addChildAggregation(aggregationChildren, defaultAggregationName, mSettings.children);
	delete mSettings.children;
	// find out which aggregation are bound (both in children and directly under it)
	Object.keys(metadataAggregations).forEach((aggregationName) => {
		if (aggregationChildren[aggregationName] !== undefined) {
			if (mSettings.hasOwnProperty(aggregationName)) {
				// always use the first item as template according to UI5 logic
				(mSettings as any)[aggregationName].template = aggregationChildren[aggregationName][0];
			} else {
				(mSettings as any)[aggregationName] = aggregationChildren[aggregationName];
			}
		}
	});
}

/**
 * Processes the properties.
 *
 * If the property is a bindingToolkit expression we need to compile it.
 * Else if the property is set as string (compiled binding expression returns string by default even if it's a boolean, int, etc.) and it doesn't match with expected
 * format the value is parsed to provide expected format.
 *
 * @param metadata Metadata of the control
 * @param settings Settings of the control
 * @returns {void}
 */
function processProperties(metadata: ManagedObjectMetadata, settings: Record<string, unknown>) {
	let settingsKey: keyof typeof settings;
	for (settingsKey in settings) {
		const value = settings[settingsKey];
		if (isBindingToolkitExpression(value)) {
			const bindingToolkitExpression: BindingToolkitExpression<unknown> = value;
			if (isConstant(bindingToolkitExpression)) {
				settings[settingsKey] = compileConstant(bindingToolkitExpression, false, true, true);
			} else {
				settings[settingsKey] = compileExpression(bindingToolkitExpression);
			}
		} else if (typeof value === "string" && !value.startsWith("{")) {
			const propertyType = (metadata.getAllProperties()[settingsKey] as any)?.getType?.();
			if (propertyType && propertyType instanceof DataType && ["boolean", "int", "float"].indexOf(propertyType.getName()) > -1) {
				settings[settingsKey] = propertyType.parseValue(value);
			}
		}
	}
}

/**
 * Processes the command.
 *
 * Resolves the command set on the control via the intrinsic class attribute "jsx:command".
 * If no command has been set or the targeted event doesn't exist, no configuration is set.
 *
 * @param metadata Metadata of the control
 * @param settings Settings of the control
 * @returns {void}
 */
function processCommand(metadata: ManagedObjectMetadata, settings: Record<string, unknown>) {
	const commandProperty = settings["jsx:command"];
	if (commandProperty) {
		const [command, eventName] = (commandProperty as string).split("|");
		const event = metadata.getAllEvents()[eventName];
		if (event && command.startsWith("cmd:")) {
			settings[event.name] = EventHandlerResolver.resolveEventHandler(command);
		}
	}
	delete settings["jsx:command"];
}

const jsxControl = function <T extends Element>(
	ControlType: typeof Control | Function,
	settings: NonControlProperties<T> & { key: string; children?: Element | ControlProperties<T>; ref?: Ref<T>; class?: string },
	key: string,
	jsxContext: JSXContext
): Control | Control[] {
	let targetControl;

	if ((ControlType as any)?.isFragment) {
		targetControl = settings.children;
	} else if ((ControlType as typeof BuildingBlockBase)?.isRuntime) {
		const runtimeBuildingBlock = new (ControlType as any)(settings);
		targetControl = runtimeBuildingBlock.getContent(jsxContext.view, jsxContext.appComponent);
	} else if (isAControl(ControlType)) {
		const metadata = ControlType.getMetadata();
		if (key !== undefined) {
			settings["key"] = key;
		}
		processCommand(metadata, settings);
		processAggregations(metadata, settings);
		const classDef = settings.class;
		const refDef = settings.ref;
		delete settings.ref;
		delete settings.class;
		processProperties(metadata, settings);
		targetControl = new ControlType(settings as $ControlSettings);
		if (classDef) {
			targetControl.addStyleClass(classDef);
		}
		if (refDef) {
			refDef.setCurrent(targetControl as any);
		}
	} else if (typeof ControlType === "function") {
		const controlTypeFn = ControlType;
		targetControl = controlTypeFn(settings as $ControlSettings);
	} else {
		targetControl = new Text({ text: "Missing component " + (ControlType as any) });
	}

	return targetControl;
};

export default jsxControl;

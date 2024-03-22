import type { EntitySet, Property, PropertyAnnotationValue, PropertyPath } from "@sap-ux/vocabularies-types";
import type { DataFieldAbstractTypes, DataFieldTypes, HeaderInfoType } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { Draft, UI } from "sap/fe/core/converters/helpers/BindingHelper";
import valueFormatters from "sap/fe/core/formatters/ValueFormatter";
import type { BindingToolkitExpression, PathInModelExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	compileExpression,
	concat,
	constant,
	formatResult,
	formatWithTypeInformation,
	getExpressionFromAnnotation,
	ifElse,
	isEmpty,
	not,
	or,
	pathInModel,
	resolveBindingString,
	transformRecursively
} from "sap/fe/core/helpers/BindingToolkit";
import { isPathAnnotationExpression, isPropertyPathExpression } from "sap/fe/core/helpers/TypeGuards";
import type { ViewData } from "sap/fe/core/services/TemplatedViewServiceFactory";
import { getLabelForConnectedFields } from "sap/fe/core/templating/DataFieldFormatters";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { enhanceDataModelPath, getContextRelativeTargetObjectPath, getRelativePaths } from "sap/fe/core/templating/DataModelPathHelper";
import type { DisplayMode } from "sap/fe/core/templating/UIFormatters";
import * as UIFormatters from "sap/fe/core/templating/UIFormatters";

type BindingExpressionTuple = [BindingToolkitExpression<string>, BindingToolkitExpression<string>] | [BindingToolkitExpression<string>];

export const formatValueRecursively = function (
	bindingExpressionToEnhance: BindingToolkitExpression<string>,
	fullContextPath: DataModelObjectPath
): BindingToolkitExpression<string> {
	return transformRecursively(bindingExpressionToEnhance, "PathInModel", (expression) => {
		let outExpression = expression;
		if (expression.modelName === undefined) {
			// In case of default model we then need to resolve the text arrangement property
			const oPropertyDataModelPath = enhanceDataModelPath(fullContextPath, expression.path);
			outExpression = formatWithTypeInformation(oPropertyDataModelPath.targetObject, expression);
		}
		return outExpression;
	});
};

/**
 * Get property definition from data model object path.
 *
 * @param propertyDataModelObject The property data model object
 * @returns The property
 */
const getPropertyDefinition = (propertyDataModelObject: DataModelObjectPath) => {
	const propertyPathOrProperty = propertyDataModelObject.targetObject as PropertyPath | Property;
	return isPropertyPathExpression(propertyPathOrProperty) ? propertyPathOrProperty.$target : propertyPathOrProperty;
};

/**
 * Checks whether an associated active entity exists.
 *
 * @param fullContextPath The full path to the context
 * @returns The expression-binding string
 */
const isOrHasActiveEntity = (fullContextPath: DataModelObjectPath) => {
	const draftRoot = (fullContextPath.targetEntitySet as EntitySet | undefined)?.annotations?.Common?.DraftRoot;
	const draftNode = (fullContextPath.targetEntitySet as EntitySet | undefined)?.annotations?.Common?.DraftNode;
	if (!!draftRoot || !!draftNode) {
		return not(Draft.IsNewObject);
	}
	return false;
};

/**
 * Checks if title value expression is empty.
 *
 * @param titleValueExpression The title value expression
 * @returns The expression-binding string
 */
const isTitleEmptyBooleanExpression = (titleValueExpression: BindingToolkitExpression<string>) =>
	titleValueExpression._type === "Constant" ? constant(!titleValueExpression.value) : isEmpty(titleValueExpression);

/**
 * Retrieves the title expression binding.
 *
 * @param propertyDataModelPath The full path to the property context
 * @param propertyBindingExpression The binding expression of the property above
 * @param [fieldFormatOptions] The format options of the field
 * @param fieldFormatOptions.displayMode
 * @param [alwaysShowDescriptionAndValue] The flag to always display description
 * @returns The expression-binding parameters
 */
const getTitleBindingWithTextArrangement = function (
	propertyDataModelPath: DataModelObjectPath,
	propertyBindingExpression: BindingToolkitExpression<string>,
	fieldFormatOptions?: { displayMode?: DisplayMode },
	alwaysShowDescriptionAndValue?: boolean
): BindingExpressionTuple {
	const targetDisplayModeOverride = fieldFormatOptions?.displayMode;
	const propertyDefinition = getPropertyDefinition(propertyDataModelPath);
	const targetDisplayMode = targetDisplayModeOverride || UIFormatters.getDisplayMode(propertyDataModelPath);
	const commonText = propertyDefinition.annotations.Common?.Text;
	const relativeLocation = getRelativePaths(propertyDataModelPath);
	const showDescriptionAndValue =
		alwaysShowDescriptionAndValue ??
		!!(propertyDataModelPath.targetObject as Property | undefined)?.annotations?.Common?.SemanticObject;
	propertyBindingExpression = formatWithTypeInformation(propertyDefinition, propertyBindingExpression);

	let params: BindingExpressionTuple = [propertyBindingExpression];
	if (targetDisplayMode !== "Value" && commonText) {
		switch (targetDisplayMode) {
			case "Description":
				params = [getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>];
				break;
			case "DescriptionValue":
				params = [
					getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>,
					ifElse(
						!!commonText.annotations?.UI?.TextArrangement,
						propertyBindingExpression,
						ifElse(showDescriptionAndValue, propertyBindingExpression, constant(""))
					)
				];
				break;
			case "ValueDescription":
				params = [
					propertyBindingExpression,
					getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>
				];
				break;
		}
	}
	return params;
};

/**
 * Recursively add the text arrangement to a title binding expression.
 *
 * @param bindingExpressionToEnhance The binding expression to be enhanced
 * @param path The data field data model object path
 * @returns An updated expression containing the text arrangement binding parameters
 */
const addTextArrangementToTitleBindingExpression = function (
	bindingExpressionToEnhance: BindingToolkitExpression<unknown>,
	path: DataModelObjectPath
) {
	return transformRecursively(bindingExpressionToEnhance, "PathInModel", (expression: PathInModelExpression<unknown>) => {
		if (expression.modelName !== undefined) return expression;
		// In case of default model we then need to resolve the text arrangement property
		const propertyDataModelPath = enhanceDataModelPath(path, expression.path);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return getTitleBindingWithTextArrangement(propertyDataModelPath, expression) as unknown as BindingToolkitExpression<any>;
	});
};

/**
 * Gets binding expression for create mode title.
 *
 * @param viewData The associated view data
 * @param [typeName] The type name from the object page header info
 * @param typeName.TypeName
 * @returns The expression-binding string
 */
const getCreateModeTitle = function (viewData: ViewData, { TypeName: typeName }: HeaderInfoType): BindingToolkitExpression<string> {
	const titleNoHeaderInfo = pathInModel("T_NEW_OBJECT", "sap.fe.i18n");
	let createModeTitle: string | BindingToolkitExpression<string> = titleNoHeaderInfo;
	if (
		viewData.resourceModel.getText("T_NEW_OBJECT", undefined, viewData.entitySet) ===
		viewData.resourceModel.getText("T_NEW_OBJECT_DEFAULT", undefined, viewData.entitySet)
	) {
		//T_NEW_OBJECT has not been customized
		const titleWithHeaderInfo = viewData.resourceModel.getText(
			"T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE",
			undefined,
			viewData.entitySet
		);
		createModeTitle = (typeName as string | PropertyAnnotationValue<string>)
			? concat(titleWithHeaderInfo, ": ", resolveBindingString(typeName.toString()))
			: titleNoHeaderInfo;
	}
	return formatResult([createModeTitle], valueFormatters.formatTitle);
};

/**
 * Checks whether an empty string should be used.
 *
 * @param path The meta path pointing to the property used for the title
 * @returns The expression-binding string
 */
const shouldForceEmptyString = (path: DataModelObjectPath) => {
	const propertyDefinition = getPropertyDefinition(path);
	if (propertyDefinition && propertyDefinition.annotations?.Core?.Computed) {
		return UI.IsInactive;
	} else {
		return constant(false);
	}
};

/**
 * Gets title value expression from object page header info.
 *
 * @param fullContextPath The full path to the context
 * @param headerInfoTitle The title value from the object page header info
 * @param getTextBindingExpression The function to get the text binding expression
 * @returns The expression-binding string
 */
const getTitleValueExpressionFromHeaderInfo = function (
	fullContextPath: DataModelObjectPath,
	headerInfoTitle: DataFieldAbstractTypes,
	getTextBindingExpression: Function
) {
	let titleValueExpression;
	if (headerInfoTitle.$Type === UIAnnotationTypes.DataField) {
		titleValueExpression = getExpressionFromAnnotation((headerInfoTitle as DataFieldTypes).Value);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		if ((headerInfoTitle as DataFieldTypes).Value?.$target?.annotations.Common?.Text?.annotations?.UI?.TextArrangement) {
			// In case an explicit text arrangement was set we make use of it in the description as well
			titleValueExpression = addTextArrangementToTitleBindingExpression(titleValueExpression, fullContextPath);
		}
		titleValueExpression = formatValueRecursively(titleValueExpression as BindingToolkitExpression<string>, fullContextPath);
	}
	if (
		headerInfoTitle.$Type === UIAnnotationTypes.DataFieldForAnnotation &&
		headerInfoTitle.Target.$target.$Type === UIAnnotationTypes.ConnectedFieldsType
	) {
		const connectedFieldsPath = enhanceDataModelPath(fullContextPath, "$Type/@UI.HeaderInfo/Title/Target/$AnnotationPath");
		titleValueExpression = getLabelForConnectedFields(
			connectedFieldsPath,
			getTextBindingExpression,
			false
		) as BindingToolkitExpression<string>;
	}
	return titleValueExpression;
};

/**
 * Creates binding expression for Object Page, List Report, Quick View and other titles.
 *
 * @param path The data model object path
 * @param getTextBindingExpression The function to get the text binding expression
 * @param [fieldFormatOptions] The format options of the field
 * @param fieldFormatOptions.displayMode
 * @param [headerInfo] The object page header info
 * @param [viewData] The associated view data
 * @param [alwaysShowDescriptionAndValue] The flag to always display description
 * @returns The compiled expression-binding string
 */
export const getTitleBindingExpression = function (
	path: DataModelObjectPath,
	getTextBindingExpression: Function,
	fieldFormatOptions?: { displayMode?: DisplayMode },
	headerInfo?: HeaderInfoType,
	viewData?: ViewData,
	alwaysShowDescriptionAndValue?: boolean
) {
	let createModeTitle: BindingToolkitExpression<string> | string = pathInModel("T_NEW_OBJECT", "sap.fe.i18n");
	let titleValueExpression;

	// received header info for object page
	if (headerInfo?.Title?.$Type && viewData) {
		titleValueExpression = getTitleValueExpressionFromHeaderInfo(path, headerInfo.Title, getTextBindingExpression);
		createModeTitle = getCreateModeTitle(viewData, headerInfo);
	}

	// needed for quickview
	if (isPathAnnotationExpression(path.targetObject)) {
		path = enhanceDataModelPath(path, path.targetObject.path);
	}

	const propertyBindingExpression: BindingToolkitExpression<unknown> = pathInModel(getContextRelativeTargetObjectPath(path));
	let params: BindingExpressionTuple;
	if (titleValueExpression) {
		params = Array.isArray(titleValueExpression) ? (titleValueExpression as unknown as BindingExpressionTuple) : [titleValueExpression];
	} else {
		params = getTitleBindingWithTextArrangement(path, propertyBindingExpression, fieldFormatOptions, alwaysShowDescriptionAndValue);
	}
	const isTitleEmpty = isTitleEmptyBooleanExpression(params[0]);
	const forceEmptyString = shouldForceEmptyString(path);
	const formattedExpression = formatResult(params, valueFormatters.formatTitle);

	titleValueExpression = ifElse(
		isTitleEmpty,
		ifElse(
			forceEmptyString,
			"",
			ifElse(
				or(UI.IsCreateMode, not(isOrHasActiveEntity(path))),
				createModeTitle,
				pathInModel("T_ANNOTATION_HELPER_DEFAULT_HEADER_TITLE_NO_HEADER_INFO", "sap.fe.i18n")
			)
		),
		formattedExpression
	);

	return compileExpression(titleValueExpression);
};

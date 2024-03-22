import { StandardActionsContext } from "../controls/Common/table/StandardActions";
import ConverterContext from "../ConverterContext";
import { TemplateType } from "../ManifestSettings";

/**
 * Gets the boolean value for the 'visible' property of the 'AddCardToInsights' action.
 *
 * @param cardType
 * @param converterContext
 * @param visualizationPath
 * @param standardActionsContext
 * @returns Boolean value for the 'visible' property of the 'AddCardToInsights' action.
 */
export function getInsightsVisibility(
	cardType: "Analytical" | "Table",
	converterContext: ConverterContext,
	visualizationPath: string,
	standardActionsContext?: StandardActionsContext
): boolean {
	let tableManifestConfig, isResponsiveTable;

	const isMultiEntity = converterContext.getManifestWrapper().hasMultipleEntitySets();
	const isMultipleVisualizations = converterContext.getManifestWrapper().hasMultipleVisualizations();
	const viewConfig = converterContext.getManifestWrapper().getViewConfiguration();
	const isMultiTabs = viewConfig !== undefined && viewConfig.paths.length > 1 ? true : false;
	const templateBindingExpression = converterContext.getTemplateType() === TemplateType.ListReport;
	const vizPathConfiguration = converterContext.getManifestControlConfiguration(visualizationPath);
	const enableAddCardToInsights =
		cardType === "Analytical"
			? vizPathConfiguration?.enableAddCardToInsights ?? true
			: vizPathConfiguration?.tableSettings?.enableAddCardToInsights ?? true;

	if (cardType === "Table") {
		tableManifestConfig = standardActionsContext?.tableManifestConfiguration;
		isResponsiveTable = tableManifestConfig?.type === "ResponsiveTable";
	}

	return (
		enableAddCardToInsights &&
		templateBindingExpression &&
		!isMultiEntity &&
		!isMultiTabs &&
		(cardType === "Table" ? (isResponsiveTable ?? false) && !isMultipleVisualizations : true)
	);
}

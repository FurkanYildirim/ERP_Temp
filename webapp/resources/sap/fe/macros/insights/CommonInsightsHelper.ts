import type { Property } from "@sap-ux/vocabularies-types";
import type { ISOCurrency, Unit } from "@sap-ux/vocabularies-types/vocabularies/Measures";
import type { default as Chart } from "sap/chart/Chart";
import CommonUtils from "sap/fe/core/CommonUtils";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, concat, getExpressionFromAnnotation, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import { getResourceModel } from "sap/fe/core/helpers/ResourceModelHelper";
import type { AllowedChartType, InsightsCardColumnsType } from "sap/insights/CardHelper";
import Core from "sap/ui/core/Core";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import type Table from "sap/ui/mdc/Table";
import type MetaModel from "sap/ui/model/MetaModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type ChartAPI from "../chart/ChartAPI";
import type FilterBarAPI from "../filterBar/FilterBarAPI";
import type TableAPI from "../table/TableAPI";
import type { InnerChartType } from "./AnalyticalInsightsHelper";
import { getChartProperties, getDimensions, getFeeds, getMeasures } from "./AnalyticalInsightsHelper";
import type { ChartContentType, InsightsParamsType } from "./InsightsCardHelper";
import { IntegrationCardType, showErrorMessageForInsightsCard } from "./InsightsCardHelper";

type GroupLevel = {
	name: string;
};
type ControlDelegate = {
	getInnerChart: Function;
};
type DataBinding = {
	binding: ODataListBinding;
};
type ChartType = Chart & { getFilter: Function; getControlDelegate: Function; getHeader: Function; getLegendVisible: Function };

/**
 * Checks if the insights card creation is possible.
 *
 * @param control
 * @param insightsRelevantColumns
 * @returns True if the insights card can be created.
 */
async function isInsightsCardCreationPossible(control: Table | ChartType, insightsRelevantColumns?: InsightsCardColumnsType[]) {
	try {
		const filterBar = Core.byId((control as Table).getFilter());
		const controlState = (await StateUtil.retrieveExternalState(control)) as Record<string, Object | undefined>;
		let isSemanticDateFilterApplied = false;
		let isControlLevelFilterApplied = false;
		if (filterBar !== undefined) {
			isSemanticDateFilterApplied = (filterBar.getParent() as FilterBarAPI).isSemanticDateFilterApplied();
		}

		if (controlState.filter) {
			const controlLevelFilterKeys = Object.keys(controlState.filter);
			for (const key of controlLevelFilterKeys) {
				const controlStateFilter = controlState.filter[key as keyof Object];
				if (Array.isArray(controlStateFilter) && controlStateFilter.length) {
					isControlLevelFilterApplied = true;
					break;
				}
			}
		}

		if (
			isControlLevelFilterApplied ||
			isSemanticDateFilterApplied ||
			(insightsRelevantColumns ? insightsRelevantColumns.length === 0 : false)
		) {
			return false;
		}
		return true;
	} catch {
		throw Error("Error retrieving control states");
	}
}

/**
 * Filters the columns that can be shown on the insights card from the visible columns on the table.
 *
 * @param tableAPI
 * @returns A list of columns that can be shown on the insightsCard.
 */
export function getInsightsRelevantColumns(tableAPI: TableAPI) {
	const table = tableAPI.content as Table;
	const visibleColumns = table.getColumns();
	const supportedColumnNames: string[] = [];
	const metaModel: MetaModel | undefined = table.getModel()?.getMetaModel();
	const metaPath = table.data("metaPath") as string;
	tableAPI.getTableDefinition().columns.forEach(function (column) {
		if (column.isInsightsSupported === true) {
			supportedColumnNames.push(column.name);
		}
	});

	return visibleColumns
		.filter(function (column) {
			return supportedColumnNames.includes(column.getDataProperty());
		})
		.map(function (supportedColumn) {
			const dataProperty: string = supportedColumn.getDataProperty(),
				propertyContext = metaModel?.getContext(metaPath + "/" + dataProperty) as Context,
				dataModel = getInvolvedDataModelObjects(propertyContext),
				propertyTargetObject = dataModel.targetObject as Property,
				uomBinding = getUomBinding(propertyTargetObject, dataProperty),
				columnText = uomBinding ? uomBinding : getTextArrangementForColumn(propertyTargetObject, dataProperty);
			return {
				visible: false,
				name: columnText,
				label: supportedColumn.getProperty("header") as string
			};
		});
}

/**
 * Constructs the insights parameters from the table that is required to create the insights card.
 *
 * @param controlAPI
 * @param cardType
 * @param insightsRelevantColumns
 * @returns The insights parameters from the table.
 */
export async function createInsightsParams(
	controlAPI: TableAPI | ChartAPI,
	cardType: IntegrationCardType,
	insightsRelevantColumns?: InsightsCardColumnsType[]
) {
	let controlState;
	const control = controlAPI.content;
	const filterbarID = (control as Table).getFilter() !== "" ? (control as Table).getFilter() : undefined;
	const isCardCreationSupported = await isInsightsCardCreationPossible(control as Table, insightsRelevantColumns);
	if (!isCardCreationSupported) {
		showErrorMessageForInsightsCard(cardType, getResourceModel(controlAPI));
		return;
	}
	try {
		controlState = (await StateUtil.retrieveExternalState(control)) as Record<string, Object>;
	} catch {
		throw Error("Error retrieving control states");
	}

	const entitySetPath =
		cardType === IntegrationCardType.table ? (control.data("metaPath") as string) : (control.data("targetCollectionPath") as string);
	const appComponent = CommonUtils.getAppComponent(control);
	const appManifest = appComponent.getManifestEntry("sap.app");
	const serviceUrl = (control.getModel() as ODataModel).getServiceUrl();
	let queryUrl = "";
	const insightsParams: InsightsParamsType = {
		appComponent: appComponent,
		type: cardType,
		requestParameters: {
			serviceUrl: "",
			queryUrl: "",
			groupBy: undefined
		},
		content: {
			cardTitle: "",
			insightsRelevantColumns: []
		},
		parentAppId: appManifest.id,
		parameters: {
			filterbarID: filterbarID
		},
		entitySetPath: entitySetPath
	};

	if (cardType === IntegrationCardType.table) {
		insightsParams.content = {
			cardTitle: (control as Table).getHeader(),
			insightsRelevantColumns: insightsRelevantColumns ?? []
		};
		queryUrl = ((control as Table).getRowBinding() as ODataListBinding).getDownloadUrl();

		insightsParams.content.cardTitle = (control as Table).getHeader();
		insightsParams.parentAppId = appManifest.id;
		const groupProperty =
			Array.isArray(controlState.groupLevels) && controlState.groupLevels.length
				? (controlState.groupLevels[0] as GroupLevel).name
				: undefined;
		if (groupProperty !== undefined) {
			const groupPropertyName = groupProperty.includes("::") ? groupProperty.split("::")[1] : groupProperty;
			insightsParams.requestParameters.groupBy = {
				property: groupPropertyName
			};
		}
	} else {
		const chart = control as unknown as ChartType;
		const innerChart: InnerChartType = (chart.getControlDelegate() as ControlDelegate).getInnerChart(chart) as InnerChartType;

		const chartContent: ChartContentType = {
			cardTitle: chart.getHeader() as string,
			legendVisible: false,
			chartType: chart.getChartType(),
			measures: getMeasures(innerChart),
			dimensions: getDimensions(innerChart),
			feeds: getFeeds(innerChart),
			allowedChartTypes: (innerChart.getAvailableChartTypes() as AllowedChartType).available,
			chartProperties: getChartProperties(innerChart)
		};

		insightsParams.content = chartContent;

		queryUrl = (innerChart.getBindingInfo("data") as DataBinding).binding.getDownloadUrl();
	}

	insightsParams.requestParameters.serviceUrl = serviceUrl;
	insightsParams.requestParameters.queryUrl = queryUrl.includes(serviceUrl) ? queryUrl.split(serviceUrl)[1] : queryUrl;

	return insightsParams;
}

function getTextArrangementForColumn(propertyTargetObject: Property, property: string) {
	const propertyParts = property.split("/");
	let navigationPath;
	if (propertyParts.length > 1) {
		propertyParts.pop();
		navigationPath = propertyParts.join();
	}
	const text = propertyTargetObject.annotations.Common?.Text;
	const textArrangement = text?.annotations?.UI?.TextArrangement?.valueOf() as string;

	const propertyBinding = pathInModel(property);
	let columnBindingValue;
	if (text) {
		const textBinding = getExpressionFromAnnotation(text, navigationPath ? [navigationPath] : []) as BindingToolkitExpression<string>;
		if (textArrangement === "UI.TextArrangementType/TextLast") {
			columnBindingValue = concat(propertyBinding, " (", textBinding, ")");
		} else if (textArrangement === "UI.TextArrangementType/TextOnly") {
			columnBindingValue = textBinding;
		} else if (textArrangement === "UI.TextArrangementType/TextSeparate") {
			columnBindingValue = propertyBinding;
		} else {
			columnBindingValue = concat(textBinding, " (", propertyBinding, ")");
		}
	} else {
		columnBindingValue = propertyBinding;
	}
	return compileExpression(columnBindingValue);
}

function getUomBinding(propertyTargetObject: Property, property: string) {
	const uom: ISOCurrency | Unit | undefined =
		propertyTargetObject.annotations.Measures?.ISOCurrency || propertyTargetObject.annotations.Measures?.Unit;
	if (!uom) {
		return;
	} else {
		const propertyBinding = pathInModel(property);
		return compileExpression(concat(propertyBinding, " ", getExpressionFromAnnotation(uom) as BindingToolkitExpression<string>));
	}
}

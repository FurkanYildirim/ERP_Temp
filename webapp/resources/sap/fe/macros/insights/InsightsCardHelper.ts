import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";

import * as ResourceModelHelper from "sap/fe/core/helpers/ResourceModelHelper";
import type ResourceModel from "sap/fe/core/ResourceModel";
import SelectionVariant from "sap/fe/navigation/SelectionVariant";
import type {
	AllowedChartTypes,
	CardConfigParamsType,
	CardHelperInstanceType,
	InsightsCardColumnsType,
	InsightsCardManifest,
	InsightsManifestType
} from "sap/insights/CardHelper";
import CardHelper from "sap/insights/CardHelper";
import MessageBox from "sap/m/MessageBox";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import type {
	ActionParamsType,
	CardConfigType,
	CardConfigurationType,
	CardContentType,
	CardDataType,
	CardHeaderType,
	ChartCardContentType,
	ChartPropertyType,
	DimensionType,
	FeedType,
	IntegrationCardColumnsType,
	MeasureType
} from "sap/ui/integration/widgets/Card";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import type FilterBar from "sap/ui/mdc/FilterBar";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import VersionInfo from "sap/ui/VersionInfo";
import type { ParsedHashType } from "sap/ushell";

export enum IntegrationCardType {
	table = "Table",
	analytical = "Analytical"
}

export type InsightRequestParameters = {
	// all parameters related to request for the data
	serviceUrl: string;
	queryUrl: string;
	groupBy?: GroupByType;
};

export type GroupByType = {
	property: string;
	descending?: boolean;
};

export type TableContentType = {
	cardTitle: string;
	insightsRelevantColumns: InsightsCardColumnsType[];
};

export type ParameterType = {
	filterbarID?: string; // Filterbar ID
	sensitiveProperties?: [string];
};

export type ChartContentType = {
	cardTitle: string;
	dimensions: DimensionType[];
	measures: MeasureType[];
	feeds: FeedType[];
	chartType: string;
	legendVisible: boolean;
	allowedChartTypes: AllowedChartTypes[];
	chartProperties: ChartPropertyType;
};

export type InsightsParamsType = {
	appComponent: AppComponent;
	type: IntegrationCardType;
	requestParameters: InsightRequestParameters;
	content: TableContentType | ChartContentType;
	parentAppId: string;
	parameters: ParameterType;
	entitySetPath: string;
};

const MAX_TABLE_RECORDS = 15;
const tableContentTopQuery = `$top=${MAX_TABLE_RECORDS}`;

/**
 * Constructs an array of columns in the format expected by the insights card.
 *
 * @param selectedColumns
 * @returns The card columns that are to be displayed on the insights card.
 */
function getColumnsToShow(selectedColumns: InsightsCardColumnsType[]): IntegrationCardColumnsType[] {
	const cardColumns: IntegrationCardColumnsType[] = [];
	selectedColumns.forEach(function (column: InsightsCardColumnsType) {
		cardColumns.push({
			title: column.label,
			value: column.name,
			visible: column.visible
		});
	});
	return cardColumns;
}

/**
 * Constructs the card content for the insights card.
 * Includes the configuration of a navigation action and the creation of bindings to read the data from the response of the back end.
 *
 * @param insightsParams
 * @returns The card content for the insights card.
 */
function getCardContent(insightsParams: InsightsParamsType): CardContentType {
	const columns = getColumnsToShow((insightsParams.content as TableContentType).insightsRelevantColumns);
	const cardContent: CardContentType = {
		data: {
			path: "/response/value"
		},
		maxItems: 15,
		row: {
			columns: columns,
			actions: [
				{
					type: "Navigation",
					parameters: "{= extension.formatters.getNavigationContext(${parameters>/state/value}, ${})}"
				}
			]
		}
	};
	if (insightsParams.requestParameters.groupBy) {
		const groupConditionName = insightsParams.requestParameters.groupBy.property;
		const groupDescending = insightsParams.requestParameters.groupBy.descending;
		cardContent.group = {
			title: "{" + groupConditionName + "}",
			order: {
				path: groupConditionName,
				dir: groupDescending === true ? "DESC" : "ASC"
			}
		};
	}
	return cardContent;
}

/**
 * Creates the chart card content for the insights card.
 *
 * @param insightsParams
 * @returns The chart card content
 */
function getChartCardContent(insightsParams: InsightsParamsType): ChartCardContentType {
	return {
		chartType: (insightsParams.content as ChartContentType).chartType,
		chartProperties: (insightsParams.content as ChartContentType).chartProperties as unknown as ChartPropertyType,
		data: { path: "/response/value" },
		dimensions: (insightsParams.content as ChartContentType).dimensions,
		measures: (insightsParams.content as ChartContentType).measures,
		feeds: (insightsParams.content as ChartContentType).feeds,
		actions: [
			{
				type: "Navigation",
				parameters: "{= extension.formatters.getNavigationContext(${parameters>/state/value}, ${})}"
			}
		],
		actionableArea: "Chart"
	};
}

/**
 * Constructs the request object to fetch data for the insights card.
 *
 * @param insightsParams
 * @returns The request data for the insights card.
 */
function getCardData(insightsParams: InsightsParamsType): CardDataType {
	let queryUrl = insightsParams.requestParameters.queryUrl;
	// fetch only the first 15 records
	queryUrl = insightsParams.type === IntegrationCardType.table ? `${queryUrl}&${tableContentTopQuery}` : queryUrl;
	return {
		request: {
			url: "{{destinations.service}}" + insightsParams.requestParameters.serviceUrl + "$batch",
			method: "POST",
			headers: {
				"X-CSRF-Token": "{{csrfTokens.token1}}"
			},
			batch: {
				response: {
					method: "GET",
					url: queryUrl,
					headers: {
						Accept: "application/json"
					}
				}
			}
		}
	};
}

/**
 * Constructs the card header for the insights card.
 * Includes the status to be shown and the navigation action to be configured on the insights card.
 *
 * @param insightsParams
 * @returns The card header
 */
function getCardHeader(insightsParams: InsightsParamsType): CardHeaderType {
	const cardHeader: CardHeaderType = {
		title: (insightsParams.content as TableContentType).cardTitle,
		actions: [
			{
				type: "Navigation",
				parameters: "{= extension.formatters.getNavigationContext(${parameters>/state/value})}"
			}
		]
	};
	if (insightsParams.type === IntegrationCardType.table) {
		cardHeader.status = {
			text: "{/response/@odata.count}" // number of records on LR received as part of the request
		};
	}
	return cardHeader;
}

/**
 * Construct the action object that is required by the insights card.
 * This is used to configure the navigation from the card to the source application.
 *
 * @param appComponent
 * @returns The action object
 */
function getActionObject(appComponent: AppComponent): string {
	const shellServiceHelper = appComponent.getShellServices();
	const hash = shellServiceHelper.getHash();
	const parsedHash = shellServiceHelper.parseShellHash(hash) as ParsedHashType;
	const navigationService = appComponent.getNavigationService();
	const actionParams: ActionParamsType = {
		parameters: {
			ibnTarget: {
				semanticObject: parsedHash.semanticObject,
				action: parsedHash.action
			},
			ibnParams: {
				sensitiveProps: [],
				nhHybridIAppStateKey: navigationService.getIAppStateKey()
			}
		}
	};
	return JSON.stringify(actionParams);
}

/**
 * Construct the card configuration parameters required by the insights card.
 * This includes filters, parameters, sensitive properties and the action object for the navigation.
 *
 * @param filters The record of filters
 * @param appComponent Application component
 * @param entitySetPath Entity set path
 * @returns The card configuration parameters
 */
async function getCardConfigParameters(
	filterbarID: string | undefined,
	appComponent: AppComponent,
	entitySetPath: string
): Promise<CardConfigParamsType> {
	const cardConfigParams: CardConfigParamsType = {
		state: {
			value: getActionObject(appComponent)
		},
		_relevantODataFilters: {
			value: [] as string[]
		},
		_relevantODataParameters: {
			value: [] as string[]
		},
		_mandatoryODataFilters: {
			value: [] as string[]
		},
		_mandatoryODataParameters: {
			value: [] as string[]
		},
		sensitiveProps: [] as string[],
		_entitySet: {
			value: entitySetPath
		}
	};

	const filterBarState = filterbarID
		? ((await StateUtil.retrieveExternalState(Core.byId(filterbarID) as FilterBar)) as Record<string, Object>)
		: undefined;
	const filters = filterBarState?.filter as Record<string, ConditionObject[]>;
	if (filters !== undefined) {
		for (const filterProp of Object.keys(filters)) {
			let filterPropSV = new SelectionVariant();
			const newFilterObject = {
				filterConditions: {
					[filterProp]: filters[filterProp]
				}
			};
			filterPropSV = CommonUtils.addExternalStateFiltersToSelectionVariant(
				filterPropSV,
				newFilterObject as { filterConditions: Record<string, ConditionObject[]> },
				Core.byId(filterbarID) as FilterBar,
				undefined
			);
			if (filterPropSV.getSelectOptionsPropertyNames().length) {
				// add to insights only if filters exist
				const reconstructedSV = {
					id: filterPropSV.getID(),
					Parameters: [],
					SelectOptions: [
						{
							PropertyName: filterProp,
							Ranges: filterPropSV.getSelectOption(filterProp)
						}
					]
				};
				cardConfigParams[filterProp] = {
					value: JSON.stringify(reconstructedSV),
					type: "string"
				};
				cardConfigParams._relevantODataFilters.value.push(filterProp);
			}
		}
	}
	return cardConfigParams;
}

/**
 * Construct the card configuration for the insights card.
 *
 * @param insightsParams
 * @returns The card configuration for the insights card.
 */
async function getCardConfig(insightsParams: InsightsParamsType): Promise<CardConfigurationType> {
	const cardConfiguration: CardConfigurationType = {};
	const serviceUrl = insightsParams.requestParameters.serviceUrl;
	cardConfiguration.destinations = { service: { name: "(default)", defaultUrl: "/" } };
	cardConfiguration.csrfTokens = {
		token1: {
			data: {
				request: {
					url: serviceUrl,
					method: "HEAD",
					headers: {
						"X-CSRF-Token": "Fetch"
					}
				}
			}
		}
	};
	const filterbarID = insightsParams.parameters.filterbarID;
	const cardConfigParams = await getCardConfigParameters(filterbarID, insightsParams.appComponent, insightsParams.entitySetPath);
	cardConfiguration.parameters = cardConfigParams;
	return cardConfiguration;
}

/**
 * Construct the manifest entry for sap.card namespace of the insights card.
 *
 * @param insightsParams
 * @returns The card manifest entry for the sap.card namespace
 */
async function getIntegrationCardManifest(insightsParams: InsightsParamsType): Promise<CardConfigType> {
	const cardConfig: CardConfigType = {
		type: insightsParams.type
	};
	cardConfig.configuration = await getCardConfig(insightsParams);
	cardConfig.header = getCardHeader(insightsParams);
	cardConfig.data = getCardData(insightsParams);
	if (insightsParams.type === IntegrationCardType.analytical) {
		cardConfig.content = getChartCardContent(insightsParams);
	} else {
		cardConfig.content = getCardContent(insightsParams);
	}
	cardConfig.extension = "module:sap/insights/CardExtension";
	return cardConfig;
}

/**
 * Construct the manifest entry for sap.insights namespace of the insights card.
 *
 * @param insightsParams
 * @returns The card manifest entry for the sap.insights namespace
 */
async function getManifestSapInsights(insightsParams: InsightsParamsType): Promise<InsightsManifestType> {
	const ui5Version = await VersionInfo.load();
	const manifestParams: InsightsManifestType = {
		parentAppId: insightsParams.parentAppId,
		cardType: "RT",
		versions: {
			ui5: ui5Version.version + "-" + ui5Version.buildTimestamp
		},
		filterEntitySet: insightsParams.entitySetPath
	};
	if (insightsParams.type === IntegrationCardType.analytical) {
		manifestParams.allowedChartTypes = (insightsParams.content as ChartContentType).allowedChartTypes;
	}
	return manifestParams;
}
/**
 * Creates the card manifest for the insights card.
 *
 * @param insightsParams
 * @returns The insights card
 */
export async function createCardManifest(insightsParams: InsightsParamsType): Promise<InsightsCardManifest> {
	const appComponent = insightsParams.appComponent,
		appManifest = { ...appComponent.getManifestEntry("sap.app") },
		ui5Manifest = { ...appComponent.getManifestEntry("sap.ui5") };
	const defaultModel = ui5Manifest.models[""];
	const dataSourceService = defaultModel.dataSource ? defaultModel.dataSource : "";
	const insightsCardManifest: InsightsCardManifest = {};
	const sapAppId = `user.${appManifest.id}.${Date.now()}`;
	appManifest.id = sapAppId;
	appManifest.type = "card";
	appManifest.dataSources.filterService = { ...appManifest.dataSources[dataSourceService] };
	insightsCardManifest["sap.app"] = appManifest;
	insightsCardManifest["sap.card"] = await getIntegrationCardManifest(insightsParams);
	insightsCardManifest["sap.insights"] = await getManifestSapInsights(insightsParams);
	return insightsCardManifest;
}

/**
 * Create the manifest of the insights card and show a preview of the card that is created.
 *
 * @param insightsParams
 */
export async function showInsightsCardPreview(insightsParams: InsightsParamsType) {
	try {
		const cardHelperInstance = (await CardHelper.getServiceAsync("UIService")) as CardHelperInstanceType;
		const card: InsightsCardManifest = await createCardManifest(insightsParams);
		cardHelperInstance.showCardPreview(card, true);
	} catch (e) {
		genericErrorMessageForInsightsCard(insightsParams.appComponent);
		Log.error("Card creation failed");
	}
}

/**
 * Display a message box for the scenarios where the insights card cannot be created.
 *
 * @param controlType
 * @param resourceModel
 */
export function showErrorMessageForInsightsCard(controlType: IntegrationCardType, resourceModel: ResourceModel) {
	const headerText = `<strong>
		${resourceModel.getText("M_CARD_POSSIBLE_CAUSES")}
		</strong>`;
	let contentText = "";
	const footerText = `${resourceModel.getText("M_CARD_FOOTER_INFO")}`;
	if (controlType === IntegrationCardType.table) {
		contentText = `<ul><li>
			${resourceModel.getText("M_CARD_FAILURE_REASON_DATE_RANGE_FILTERS")}
			</li><li>
			${resourceModel.getText("M_CARD_FAILURE_TABLE_REASON_TABLE_LEVEL_FILTERS")}
			</li><li>
			${resourceModel.getText("M_CARD_FAILURE_TABLE_REASON_UNSUPPORTED_COLUMNS")}
			</li></ul>`;
	} else {
		contentText = `<ul><li>
			${resourceModel.getText("M_CARD_FAILURE_REASON_DATE_RANGE_FILTERS")}
			</li><li>
			${resourceModel.getText("M_CARD_FAILURE_CHART_REASON_CHART_LEVEL_FILTERS")}
			</li></ul>`;
	}
	const formattedTextString = headerText + contentText + footerText;
	MessageBox.error(resourceModel.getText("M_CARD_CREATION_FAILURE"), {
		onClose: function () {
			throw new Error("Insights is not supported");
		},
		details: formattedTextString
	});
}

export function genericErrorMessageForInsightsCard(scope: AppComponent | Control) {
	const resourceModel = ResourceModelHelper.getResourceModel(scope);
	MessageBox.error(resourceModel.getText("M_CARD_FAILURE_GENERIC"));
}

import type { default as InnerChart } from "sap/chart/Chart";
import type Dimension from "sap/chart/data/Dimension";
import type Measure from "sap/chart/data/Measure";
import type { ChartPropertyType, DimensionType, FeedType, MeasureType } from "sap/ui/integration/widgets/Card";
import type Control from "sap/ui/mdc/Control";

type VizFrame = {
	getVizProperties: Function;
	getFeeds: Function;
};

export type InnerChartType = InnerChart & { getBindingInfo: Function; getAggregation: Function };

/**
 * Get measures of the chart.
 *
 * @param innerChart
 * @returns Measures of the chart.
 */
export function getMeasures(innerChart: InnerChartType): MeasureType[] {
	let measures: MeasureType[] = [];
	measures = innerChart.getMeasures().map((measure: Measure) => {
		return {
			name: measure.getLabel(),
			value: "{" + measure.getName() + "}"
		};
	});
	return measures;
}

/**
 * Get dimensions of the chart.
 *
 * @param innerChart
 * @returns Dimensions of the chart.
 */
export function getDimensions(innerChart: InnerChartType): DimensionType[] {
	let dimensions: DimensionType[] = [];
	dimensions = innerChart.getDimensions().map((dimension: Dimension) => {
		if (dimension.getTextProperty()) {
			return {
				name: dimension.getLabel(),
				value: "{" + dimension.getTextProperty() + "}"
			};
		} else {
			return {
				name: dimension.getLabel(),
				value: "{" + dimension.getName() + "}"
			};
		}
	});
	return dimensions;
}

/**
 * Get feeds of the chart.
 *
 * @param innerChart
 * @returns Feeds of the chart.
 */
export function getFeeds(innerChart: InnerChartType): FeedType[] {
	const vizFeeds = (innerChart.getAggregation("_vizFrame") as VizFrame).getFeeds() as Control[];
	const feeds: FeedType[][] = vizFeeds.map((feed: Control) => {
		return (feed.getProperty("values") as Control[]).map((feedValue: Control) => {
			const label = getLabel(innerChart, feedValue.getProperty("name") as string, feedValue.getProperty("type") as string);
			const feedType: FeedType = {
				type: feed.getProperty("type") as string,
				uid: feed.getProperty("uid") as string,
				values: [label] as string[]
			};
			return feedType;
		});
	});
	return feeds.flat();
}

/**
 * Get measure label or dimension label of the chart.
 *
 * @param innerChart
 * @param name
 * @param type
 * @returns Measure label or Dimension label of the chart.
 */

export function getLabel(innerChart: InnerChartType, name: string, type: string): string {
	let label: string;
	const measures = innerChart.getMeasures();
	const dimensions = innerChart.getDimensions();
	if (type === "Dimension") {
		label =
			dimensions
				.filter((dimension: Dimension) => {
					return dimension.getName() === name;
				})[0]
				.getLabel() || name;
	} else {
		label =
			measures
				.filter((measure: Measure) => {
					return measure.getName() === name;
				})[0]
				.getLabel() || name;
	}
	return label;
}

/**
 * Get chart properties.
 *
 * @param innerChart
 * @returns Chart properties.
 */

export function getChartProperties(innerChart: InnerChartType): ChartPropertyType {
	return (innerChart.getAggregation("_vizFrame") as VizFrame).getVizProperties() as ChartPropertyType;
}

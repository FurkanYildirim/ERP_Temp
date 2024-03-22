import { InCompletenessInfoType } from "sap/fe/core/helpers/RecommendationHelper";
import { additionalValueHelper } from "sap/fe/macros/internal/valuehelp/AdditionalValueHelper";
import { ValueState } from "sap/ui/core/library";
import type Field from "sap/ui/mdc/Field";
import type MTable from "sap/ui/mdc/valuehelp/content/MTable";
import Context from "sap/ui/model/odata/v4/Context";

/**
 * Growing formatter used for growing and growingThreshold.
 *
 * @param this Valuehelp Table
 * @param recommendationData Data fetched from recommendation model
 * @param propertyPath Property Path of the Field
 * @returns Boolean value for growing and growingThreshold properties
 */
function getGrowing(this: MTable, recommendationData: InCompletenessInfoType | undefined, propertyPath: string) {
	const values =
		additionalValueHelper.getRelevantRecommendations(recommendationData || {}, this.getBindingContext() as Context, propertyPath) || [];
	if (values.length > 0) {
		//if there are relevant recommendations then return true
		return true;
	}
	return false;
}
getGrowing.__functionName = "sap.fe.macros.internal.valuehelp.AdditionalValueFormatter#getGrowing";

function formatValueState(
	this: Field,
	all_recommendations: InCompletenessInfoType,
	currentPageContext: Context,
	sourcepath?: string,
	fieldContainerType?: string
) {
	let valueStateTypeData = ValueState.None;
	if (!this.getValue()) {
		// only if the existing state is none, we will override state based on recommendations data, else we keep it as is

		if (this.getValueState() == "None" || (this.data("hasRecommendations") && this.getValueState() == "Information")) {
			// currentPageContext - refers to binding context of view, so this may not be correct data for table, in case of OP.
			// so we use this.getBindingContext
			// for other cases like form, we can still use page context data, this will give correct context for both OP and SubOP.
			let bindingContext;
			if (fieldContainerType === "Table") {
				bindingContext = this.getBindingContext() as Context;
			} else {
				bindingContext = currentPageContext;
			}
			if (bindingContext && sourcepath) {
				const values =
					additionalValueHelper.getRelevantRecommendations(
						all_recommendations || {},
						this.getBindingContext() as Context,
						sourcepath
					) || [];
				if (values.length) {
					this.data("hasRecommendations", true);
					valueStateTypeData = ValueState.Information;
				}
			}
		} else {
			valueStateTypeData = this.getValueState() as ValueState;
		}
		if (valueStateTypeData === "Information") {
			this.setValueStateText(" ");
		}
	}
	return valueStateTypeData;
}
formatValueState.__functionName = "sap.fe.macros.internal.valuehelp.AdditionalValueFormatter#formatValueState";

// See https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters for more detail on this weird syntax
/**
 * Collection of AdditionalValue formatters.
 *
 * @param this The context
 * @param sName The inner function name
 * @param oArgs The inner function parameters
 * @returns The value from the inner function
 */
const additionalValueFormatter = function (this: object, sName: string, ...oArgs: any[]): any {
	if (additionalValueFormatter.hasOwnProperty(sName)) {
		return (additionalValueFormatter as any)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};

additionalValueFormatter.getGrowing = getGrowing;
additionalValueFormatter.formatValueState = formatValueState;

/**
 * @global
 */
export default additionalValueFormatter;

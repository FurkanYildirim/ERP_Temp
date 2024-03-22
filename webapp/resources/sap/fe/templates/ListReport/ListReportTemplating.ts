// Template Helpers for the List Report
import { ListReportDefinition } from "sap/fe/core/converters/templates/ListReportConverter";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { ViewData } from "sap/fe/core/services/TemplatedViewServiceFactory";

/**
 * Method returns an VariantBackReference expression based on variantManagement and oConverterContext value.
 *
 * @function
 * @name getVariantBackReference
 * @param viewData Object Containing View Data
 * @param converterContextObject Object containing converted context
 * @returns {string}
 */

export const getVariantBackReference = function (viewData: ViewData, converterContextObject: ListReportDefinition) {
	if (viewData && viewData.variantManagement === "Page") {
		return "fe::PageVariantManagement";
	}
	if (viewData && viewData.variantManagement === "Control") {
		return generate([converterContextObject.filterBarId, "VariantManagement"]);
	}
	return undefined;
};

export const getDefaultPath = function (aViews: any) {
	for (let i = 0; i < aViews.length; i++) {
		if (aViews[i].defaultPath) {
			return aViews[i].defaultPath;
		}
	}
};

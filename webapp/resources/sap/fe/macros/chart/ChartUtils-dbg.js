/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/macros/filter/FilterUtils", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "../CommonHelper", "../table/Utils"], function (CommonUtils, FilterUtil, Filter, FilterOperator, CommonHelper, Utils) {
  "use strict";

  const ChartUtils = {
    /**
     * Method that returns the chart filters stored in the UI model.
     *
     * @param oMdcChart The MDC_Chart control
     * @param bClearSelections Clears chart selections in the UI model if true
     * @returns The chart selections
     */
    getChartSelections: function (oMdcChart, bClearSelections) {
      // get chart selections
      if (bClearSelections) {
        this.getChartModel(oMdcChart, "", {});
      }
      const aVizSelections = this.getChartModel(oMdcChart, "filters");
      return aVizSelections || [];
    },
    /**
     * Method that returns the chart selections as a filter.
     *
     * @param oMdcChart The MDC_Chart control
     * @returns Filter containing chart selections
     */
    getChartFilters: function (oMdcChart) {
      // get chart selections as a filter
      const aFilters = this.getChartSelections(oMdcChart) || [];
      return new Filter(aFilters);
    },
    /**
     * Method that sets the chart selections as in the UI model.
     *
     * @param oMdcChart The MDC_Chart control
     */
    setChartFilters: function (oMdcChart) {
      // saving selections in each drill stack for future use
      const oDrillStack = this.getChartModel(oMdcChart, "drillStack") || {};
      const oChart = oMdcChart.getControlDelegate().getInnerChart(oMdcChart);
      const aChartFilters = [];
      let aVisibleDimensions;
      function addChartFilters(aSelectedData) {
        for (const item in aSelectedData) {
          const aDimFilters = [];
          for (const i in aVisibleDimensions) {
            const sPath = aVisibleDimensions[i];
            const sValue = aSelectedData[item].data[sPath];
            if (sValue !== undefined) {
              aDimFilters.push(new Filter({
                path: sPath,
                operator: FilterOperator.EQ,
                value1: sValue
              }));
            }
          }
          if (aDimFilters.length > 0) {
            aChartFilters.push(new Filter(aDimFilters, true));
          }
        }
      }
      if (oChart) {
        const aVizSelections = this.getVizSelection(oChart);
        aVisibleDimensions = oChart.getVisibleDimensions();
        const aDimensions = this.getDimensionsFromDrillStack(oChart);
        if (aDimensions.length > 0) {
          this.getChartModel(oMdcChart, "drillStack", {});
          oDrillStack[aDimensions.toString()] = aVizSelections;
          this.getChartModel(oMdcChart, "drillStack", oDrillStack);
        }
        if (aVizSelections.length > 0) {
          // creating filters with selections in the current drillstack
          addChartFilters(aVizSelections);
        } else {
          // creating filters with selections in the previous drillstack when there are no selections in the current drillstack
          const aDrillStackKeys = Object.keys(oDrillStack) || [];
          const aPrevDrillStackData = oDrillStack[aDrillStackKeys[aDrillStackKeys.length - 2]] || [];
          addChartFilters(aPrevDrillStackData);
        }
        this.getChartModel(oMdcChart, "filters", aChartFilters);
      }
    },
    /**
     * Method that returns the chart selections as a filter.
     *
     * @param oChart The inner chart control
     * @returns The filters in the filter bar
     */
    getFilterBarFilterInfo: function (oChart) {
      return FilterUtil.getFilterInfo(oChart.getFilter(), {
        targetControl: oChart
      });
    },
    /**
     * Method that returns the filters for the chart and filter bar.
     *
     * @param oChart The inner chart control
     * @returns The new filter containing the filters for both the chart and the filter bar
     */
    getAllFilterInfo: function (oChart) {
      const oFilters = this.getFilterBarFilterInfo(oChart);
      const aChartFilters = this.getChartFilters(oChart);
      // Get filters added through personalization dialog filter option
      const aP13nProperties = Utils.getP13nFilters(oChart);
      // Retrieve selection presentation variant path from custom data
      const selectionPresentationVariantPath = CommonHelper.parseCustomData(oChart.data("selectionPresentationVariantPath")) ? CommonHelper.parseCustomData(oChart.data("selectionPresentationVariantPath")).data : "";
      // Check if SV is present in SPV, if yes get the Sv values
      const aSelctionVariant = selectionPresentationVariantPath ? CommonUtils.getFiltersInfoForSV(oChart, selectionPresentationVariantPath, true) : null;
      if (aChartFilters && aChartFilters.aFilters && aChartFilters.aFilters.length) {
        oFilters.filters.push(aChartFilters);
      }
      if (aP13nProperties.length > 0) {
        aP13nProperties.forEach(element => {
          if (element.aFilters && element.aFilters.length > 0) {
            // if we filter using more than one field
            element.aFilters.forEach(filterValue => {
              oFilters.filters.push(filterValue);
            });
          } else {
            // if we filter using only one field
            oFilters.filters.push(element);
          }
        });
      }
      if (aSelctionVariant && aSelctionVariant.filters.length > 0) {
        aSelctionVariant.filters.forEach(filterValue => {
          oFilters.filters.push(filterValue.aFilters[0]);
        });
      }
      return oFilters;
    },
    /**
     * Method that returns selected data in the chart.
     *
     * @param oChart The inner chart control
     * @returns The selected chart data
     */
    getChartSelectedData: function (oChart) {
      let aSelectedPoints = [];
      // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
      switch (oChart.getSelectionBehavior()) {
        case "DATAPOINT":
          aSelectedPoints = oChart.getSelectedDataPoints().dataPoints;
          break;
        case "CATEGORY":
          aSelectedPoints = oChart.getSelectedCategories().categories;
          break;
        case "SERIES":
          aSelectedPoints = oChart.getSelectedSeries().series;
          break;
      }
      return aSelectedPoints;
    },
    /**
     * Method to get filters, drillstack and selected contexts in the UI model.
     * Can also be used to set data in the model.
     *
     * @param oMdcChart The MDC_Chart control
     * @param sPath The path in the UI model from which chart data is to be set/fetched
     * @param vData The chart info to be set
     * @returns The chart info (filters/drillstack/selectedContexts)
     */
    getChartModel: function (oMdcChart, sPath, vData) {
      const oInternalModelContext = oMdcChart.getBindingContext("internal");
      if (!oInternalModelContext) {
        return false;
      }
      if (vData) {
        oInternalModelContext.setProperty(sPath, vData);
      }
      return oInternalModelContext && oInternalModelContext.getObject(sPath);
    },
    /**
     * Method to fetch the current drillstack dimensions.
     *
     * @param oChart The inner chart control
     * @returns The current drillstack dimensions
     */
    getDimensionsFromDrillStack: function (oChart) {
      const aCurrentDrillStack = oChart.getDrillStack() || [];
      const aCurrentDrillView = aCurrentDrillStack.pop() || {};
      return aCurrentDrillView.dimension || [];
    },
    /**
     * Method to fetch chart selections.
     *
     * @param oChart The inner chart control
     * @returns The chart selections
     */
    getVizSelection: function (oChart) {
      return oChart && oChart._getVizFrame() && oChart._getVizFrame().vizSelection() || [];
    }
  };
  return ChartUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDaGFydFV0aWxzIiwiZ2V0Q2hhcnRTZWxlY3Rpb25zIiwib01kY0NoYXJ0IiwiYkNsZWFyU2VsZWN0aW9ucyIsImdldENoYXJ0TW9kZWwiLCJhVml6U2VsZWN0aW9ucyIsImdldENoYXJ0RmlsdGVycyIsImFGaWx0ZXJzIiwiRmlsdGVyIiwic2V0Q2hhcnRGaWx0ZXJzIiwib0RyaWxsU3RhY2siLCJvQ2hhcnQiLCJnZXRDb250cm9sRGVsZWdhdGUiLCJnZXRJbm5lckNoYXJ0IiwiYUNoYXJ0RmlsdGVycyIsImFWaXNpYmxlRGltZW5zaW9ucyIsImFkZENoYXJ0RmlsdGVycyIsImFTZWxlY3RlZERhdGEiLCJpdGVtIiwiYURpbUZpbHRlcnMiLCJpIiwic1BhdGgiLCJzVmFsdWUiLCJkYXRhIiwidW5kZWZpbmVkIiwicHVzaCIsInBhdGgiLCJvcGVyYXRvciIsIkZpbHRlck9wZXJhdG9yIiwiRVEiLCJ2YWx1ZTEiLCJsZW5ndGgiLCJnZXRWaXpTZWxlY3Rpb24iLCJnZXRWaXNpYmxlRGltZW5zaW9ucyIsImFEaW1lbnNpb25zIiwiZ2V0RGltZW5zaW9uc0Zyb21EcmlsbFN0YWNrIiwidG9TdHJpbmciLCJhRHJpbGxTdGFja0tleXMiLCJPYmplY3QiLCJrZXlzIiwiYVByZXZEcmlsbFN0YWNrRGF0YSIsImdldEZpbHRlckJhckZpbHRlckluZm8iLCJGaWx0ZXJVdGlsIiwiZ2V0RmlsdGVySW5mbyIsImdldEZpbHRlciIsInRhcmdldENvbnRyb2wiLCJnZXRBbGxGaWx0ZXJJbmZvIiwib0ZpbHRlcnMiLCJhUDEzblByb3BlcnRpZXMiLCJVdGlscyIsImdldFAxM25GaWx0ZXJzIiwic2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJDb21tb25IZWxwZXIiLCJwYXJzZUN1c3RvbURhdGEiLCJhU2VsY3Rpb25WYXJpYW50IiwiQ29tbW9uVXRpbHMiLCJnZXRGaWx0ZXJzSW5mb0ZvclNWIiwiZmlsdGVycyIsImZvckVhY2giLCJlbGVtZW50IiwiZmlsdGVyVmFsdWUiLCJnZXRDaGFydFNlbGVjdGVkRGF0YSIsImFTZWxlY3RlZFBvaW50cyIsImdldFNlbGVjdGlvbkJlaGF2aW9yIiwiZ2V0U2VsZWN0ZWREYXRhUG9pbnRzIiwiZGF0YVBvaW50cyIsImdldFNlbGVjdGVkQ2F0ZWdvcmllcyIsImNhdGVnb3JpZXMiLCJnZXRTZWxlY3RlZFNlcmllcyIsInNlcmllcyIsInZEYXRhIiwib0ludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJzZXRQcm9wZXJ0eSIsImdldE9iamVjdCIsImFDdXJyZW50RHJpbGxTdGFjayIsImdldERyaWxsU3RhY2siLCJhQ3VycmVudERyaWxsVmlldyIsInBvcCIsImRpbWVuc2lvbiIsIl9nZXRWaXpGcmFtZSIsInZpelNlbGVjdGlvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhcnRVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBDaGFydCBmcm9tIFwic2FwL2NoYXJ0L0NoYXJ0XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBGaWx0ZXJVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgTURDQ2hhcnQgZnJvbSBcInNhcC91aS9tZGMvQ2hhcnRcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCBGaWx0ZXJPcGVyYXRvciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlck9wZXJhdG9yXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCIuLi9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBVdGlscyBmcm9tIFwiLi4vdGFibGUvVXRpbHNcIjtcblxuY29uc3QgQ2hhcnRVdGlscyA9IHtcblx0LyoqXG5cdCAqIE1ldGhvZCB0aGF0IHJldHVybnMgdGhlIGNoYXJ0IGZpbHRlcnMgc3RvcmVkIGluIHRoZSBVSSBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIG9NZGNDaGFydCBUaGUgTURDX0NoYXJ0IGNvbnRyb2xcblx0ICogQHBhcmFtIGJDbGVhclNlbGVjdGlvbnMgQ2xlYXJzIGNoYXJ0IHNlbGVjdGlvbnMgaW4gdGhlIFVJIG1vZGVsIGlmIHRydWVcblx0ICogQHJldHVybnMgVGhlIGNoYXJ0IHNlbGVjdGlvbnNcblx0ICovXG5cdGdldENoYXJ0U2VsZWN0aW9uczogZnVuY3Rpb24gKG9NZGNDaGFydDogTURDQ2hhcnQsIGJDbGVhclNlbGVjdGlvbnM/OiBib29sZWFuKSB7XG5cdFx0Ly8gZ2V0IGNoYXJ0IHNlbGVjdGlvbnNcblx0XHRpZiAoYkNsZWFyU2VsZWN0aW9ucykge1xuXHRcdFx0dGhpcy5nZXRDaGFydE1vZGVsKG9NZGNDaGFydCwgXCJcIiwge30pO1xuXHRcdH1cblx0XHRjb25zdCBhVml6U2VsZWN0aW9ucyA9IHRoaXMuZ2V0Q2hhcnRNb2RlbChvTWRjQ2hhcnQsIFwiZmlsdGVyc1wiKTtcblx0XHRyZXR1cm4gYVZpelNlbGVjdGlvbnMgfHwgW107XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdGhhdCByZXR1cm5zIHRoZSBjaGFydCBzZWxlY3Rpb25zIGFzIGEgZmlsdGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gb01kY0NoYXJ0IFRoZSBNRENfQ2hhcnQgY29udHJvbFxuXHQgKiBAcmV0dXJucyBGaWx0ZXIgY29udGFpbmluZyBjaGFydCBzZWxlY3Rpb25zXG5cdCAqL1xuXHRnZXRDaGFydEZpbHRlcnM6IGZ1bmN0aW9uIChvTWRjQ2hhcnQ6IE1EQ0NoYXJ0KSB7XG5cdFx0Ly8gZ2V0IGNoYXJ0IHNlbGVjdGlvbnMgYXMgYSBmaWx0ZXJcblx0XHRjb25zdCBhRmlsdGVycyA9IHRoaXMuZ2V0Q2hhcnRTZWxlY3Rpb25zKG9NZGNDaGFydCkgfHwgW107XG5cdFx0cmV0dXJuIG5ldyBGaWx0ZXIoYUZpbHRlcnMpO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRoYXQgc2V0cyB0aGUgY2hhcnQgc2VsZWN0aW9ucyBhcyBpbiB0aGUgVUkgbW9kZWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWRjQ2hhcnQgVGhlIE1EQ19DaGFydCBjb250cm9sXG5cdCAqL1xuXHRzZXRDaGFydEZpbHRlcnM6IGZ1bmN0aW9uIChvTWRjQ2hhcnQ6IE1EQ0NoYXJ0KSB7XG5cdFx0Ly8gc2F2aW5nIHNlbGVjdGlvbnMgaW4gZWFjaCBkcmlsbCBzdGFjayBmb3IgZnV0dXJlIHVzZVxuXHRcdGNvbnN0IG9EcmlsbFN0YWNrID0gdGhpcy5nZXRDaGFydE1vZGVsKG9NZGNDaGFydCwgXCJkcmlsbFN0YWNrXCIpIHx8ICh7fSBhcyBhbnkpO1xuXHRcdGNvbnN0IG9DaGFydCA9IChvTWRjQ2hhcnQgYXMgYW55KS5nZXRDb250cm9sRGVsZWdhdGUoKS5nZXRJbm5lckNoYXJ0KG9NZGNDaGFydCk7XG5cdFx0Y29uc3QgYUNoYXJ0RmlsdGVyczogYW55W10gPSBbXTtcblx0XHRsZXQgYVZpc2libGVEaW1lbnNpb25zOiBhbnk7XG5cblx0XHRmdW5jdGlvbiBhZGRDaGFydEZpbHRlcnMoYVNlbGVjdGVkRGF0YTogYW55KSB7XG5cdFx0XHRmb3IgKGNvbnN0IGl0ZW0gaW4gYVNlbGVjdGVkRGF0YSkge1xuXHRcdFx0XHRjb25zdCBhRGltRmlsdGVycyA9IFtdO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gYVZpc2libGVEaW1lbnNpb25zKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1BhdGggPSBhVmlzaWJsZURpbWVuc2lvbnNbaV07XG5cdFx0XHRcdFx0Y29uc3Qgc1ZhbHVlID0gYVNlbGVjdGVkRGF0YVtpdGVtXS5kYXRhW3NQYXRoXTtcblx0XHRcdFx0XHRpZiAoc1ZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdGFEaW1GaWx0ZXJzLnB1c2goXG5cdFx0XHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0XHRcdHBhdGg6IHNQYXRoLFxuXHRcdFx0XHRcdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSxcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZTE6IHNWYWx1ZVxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGFEaW1GaWx0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRhQ2hhcnRGaWx0ZXJzLnB1c2gobmV3IEZpbHRlcihhRGltRmlsdGVycywgdHJ1ZSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvQ2hhcnQpIHtcblx0XHRcdGNvbnN0IGFWaXpTZWxlY3Rpb25zID0gdGhpcy5nZXRWaXpTZWxlY3Rpb24ob0NoYXJ0KTtcblx0XHRcdGFWaXNpYmxlRGltZW5zaW9ucyA9IG9DaGFydC5nZXRWaXNpYmxlRGltZW5zaW9ucygpO1xuXHRcdFx0Y29uc3QgYURpbWVuc2lvbnMgPSB0aGlzLmdldERpbWVuc2lvbnNGcm9tRHJpbGxTdGFjayhvQ2hhcnQpO1xuXHRcdFx0aWYgKGFEaW1lbnNpb25zLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhpcy5nZXRDaGFydE1vZGVsKG9NZGNDaGFydCwgXCJkcmlsbFN0YWNrXCIsIHt9KTtcblx0XHRcdFx0b0RyaWxsU3RhY2tbYURpbWVuc2lvbnMudG9TdHJpbmcoKV0gPSBhVml6U2VsZWN0aW9ucztcblx0XHRcdFx0dGhpcy5nZXRDaGFydE1vZGVsKG9NZGNDaGFydCwgXCJkcmlsbFN0YWNrXCIsIG9EcmlsbFN0YWNrKTtcblx0XHRcdH1cblx0XHRcdGlmIChhVml6U2VsZWN0aW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdC8vIGNyZWF0aW5nIGZpbHRlcnMgd2l0aCBzZWxlY3Rpb25zIGluIHRoZSBjdXJyZW50IGRyaWxsc3RhY2tcblx0XHRcdFx0YWRkQ2hhcnRGaWx0ZXJzKGFWaXpTZWxlY3Rpb25zKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGNyZWF0aW5nIGZpbHRlcnMgd2l0aCBzZWxlY3Rpb25zIGluIHRoZSBwcmV2aW91cyBkcmlsbHN0YWNrIHdoZW4gdGhlcmUgYXJlIG5vIHNlbGVjdGlvbnMgaW4gdGhlIGN1cnJlbnQgZHJpbGxzdGFja1xuXHRcdFx0XHRjb25zdCBhRHJpbGxTdGFja0tleXMgPSBPYmplY3Qua2V5cyhvRHJpbGxTdGFjaykgfHwgW107XG5cdFx0XHRcdGNvbnN0IGFQcmV2RHJpbGxTdGFja0RhdGEgPSBvRHJpbGxTdGFja1thRHJpbGxTdGFja0tleXNbYURyaWxsU3RhY2tLZXlzLmxlbmd0aCAtIDJdXSB8fCBbXTtcblx0XHRcdFx0YWRkQ2hhcnRGaWx0ZXJzKGFQcmV2RHJpbGxTdGFja0RhdGEpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5nZXRDaGFydE1vZGVsKG9NZGNDaGFydCwgXCJmaWx0ZXJzXCIsIGFDaGFydEZpbHRlcnMpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0aGF0IHJldHVybnMgdGhlIGNoYXJ0IHNlbGVjdGlvbnMgYXMgYSBmaWx0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ2hhcnQgVGhlIGlubmVyIGNoYXJ0IGNvbnRyb2xcblx0ICogQHJldHVybnMgVGhlIGZpbHRlcnMgaW4gdGhlIGZpbHRlciBiYXJcblx0ICovXG5cdGdldEZpbHRlckJhckZpbHRlckluZm86IGZ1bmN0aW9uIChvQ2hhcnQ6IE1EQ0NoYXJ0KSB7XG5cdFx0cmV0dXJuIEZpbHRlclV0aWwuZ2V0RmlsdGVySW5mbyhvQ2hhcnQuZ2V0RmlsdGVyKCksIHtcblx0XHRcdHRhcmdldENvbnRyb2w6IG9DaGFydFxuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRoYXQgcmV0dXJucyB0aGUgZmlsdGVycyBmb3IgdGhlIGNoYXJ0IGFuZCBmaWx0ZXIgYmFyLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NoYXJ0IFRoZSBpbm5lciBjaGFydCBjb250cm9sXG5cdCAqIEByZXR1cm5zIFRoZSBuZXcgZmlsdGVyIGNvbnRhaW5pbmcgdGhlIGZpbHRlcnMgZm9yIGJvdGggdGhlIGNoYXJ0IGFuZCB0aGUgZmlsdGVyIGJhclxuXHQgKi9cblx0Z2V0QWxsRmlsdGVySW5mbzogZnVuY3Rpb24gKG9DaGFydDogTURDQ2hhcnQpIHtcblx0XHRjb25zdCBvRmlsdGVycyA9IHRoaXMuZ2V0RmlsdGVyQmFyRmlsdGVySW5mbyhvQ2hhcnQpO1xuXHRcdGNvbnN0IGFDaGFydEZpbHRlcnMgPSB0aGlzLmdldENoYXJ0RmlsdGVycyhvQ2hhcnQpIGFzIGFueTtcblx0XHQvLyBHZXQgZmlsdGVycyBhZGRlZCB0aHJvdWdoIHBlcnNvbmFsaXphdGlvbiBkaWFsb2cgZmlsdGVyIG9wdGlvblxuXHRcdGNvbnN0IGFQMTNuUHJvcGVydGllcyA9IFV0aWxzLmdldFAxM25GaWx0ZXJzKG9DaGFydCk7XG5cdFx0Ly8gUmV0cmlldmUgc2VsZWN0aW9uIHByZXNlbnRhdGlvbiB2YXJpYW50IHBhdGggZnJvbSBjdXN0b20gZGF0YVxuXHRcdGNvbnN0IHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoID0gQ29tbW9uSGVscGVyLnBhcnNlQ3VzdG9tRGF0YShvQ2hhcnQuZGF0YShcInNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoXCIpKVxuXHRcdFx0PyBDb21tb25IZWxwZXIucGFyc2VDdXN0b21EYXRhKG9DaGFydC5kYXRhKFwic2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFBhdGhcIikpLmRhdGFcblx0XHRcdDogXCJcIjtcblx0XHQvLyBDaGVjayBpZiBTViBpcyBwcmVzZW50IGluIFNQViwgaWYgeWVzIGdldCB0aGUgU3YgdmFsdWVzXG5cdFx0Y29uc3QgYVNlbGN0aW9uVmFyaWFudCA9IHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRQYXRoXG5cdFx0XHQ/IENvbW1vblV0aWxzLmdldEZpbHRlcnNJbmZvRm9yU1Yob0NoYXJ0LCBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50UGF0aCwgdHJ1ZSlcblx0XHRcdDogbnVsbDtcblxuXHRcdGlmIChhQ2hhcnRGaWx0ZXJzICYmIGFDaGFydEZpbHRlcnMuYUZpbHRlcnMgJiYgYUNoYXJ0RmlsdGVycy5hRmlsdGVycy5sZW5ndGgpIHtcblx0XHRcdG9GaWx0ZXJzLmZpbHRlcnMucHVzaChhQ2hhcnRGaWx0ZXJzKTtcblx0XHR9XG5cblx0XHRpZiAoYVAxM25Qcm9wZXJ0aWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdGFQMTNuUHJvcGVydGllcy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG5cdFx0XHRcdGlmIChlbGVtZW50LmFGaWx0ZXJzICYmIGVsZW1lbnQuYUZpbHRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdC8vIGlmIHdlIGZpbHRlciB1c2luZyBtb3JlIHRoYW4gb25lIGZpZWxkXG5cdFx0XHRcdFx0ZWxlbWVudC5hRmlsdGVycy5mb3JFYWNoKChmaWx0ZXJWYWx1ZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRvRmlsdGVycy5maWx0ZXJzLnB1c2goZmlsdGVyVmFsdWUpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGlmIHdlIGZpbHRlciB1c2luZyBvbmx5IG9uZSBmaWVsZFxuXHRcdFx0XHRcdG9GaWx0ZXJzLmZpbHRlcnMucHVzaChlbGVtZW50KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKGFTZWxjdGlvblZhcmlhbnQgJiYgYVNlbGN0aW9uVmFyaWFudC5maWx0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdGFTZWxjdGlvblZhcmlhbnQuZmlsdGVycy5mb3JFYWNoKChmaWx0ZXJWYWx1ZTogYW55KSA9PiB7XG5cdFx0XHRcdG9GaWx0ZXJzLmZpbHRlcnMucHVzaChmaWx0ZXJWYWx1ZS5hRmlsdGVyc1swXSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gb0ZpbHRlcnM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0aGF0IHJldHVybnMgc2VsZWN0ZWQgZGF0YSBpbiB0aGUgY2hhcnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ2hhcnQgVGhlIGlubmVyIGNoYXJ0IGNvbnRyb2xcblx0ICogQHJldHVybnMgVGhlIHNlbGVjdGVkIGNoYXJ0IGRhdGFcblx0ICovXG5cdGdldENoYXJ0U2VsZWN0ZWREYXRhOiBmdW5jdGlvbiAob0NoYXJ0OiBDaGFydCkge1xuXHRcdGxldCBhU2VsZWN0ZWRQb2ludHMgPSBbXTtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3N3aXRjaC1leGhhdXN0aXZlbmVzcy1jaGVja1xuXHRcdHN3aXRjaCAob0NoYXJ0LmdldFNlbGVjdGlvbkJlaGF2aW9yKCkpIHtcblx0XHRcdGNhc2UgXCJEQVRBUE9JTlRcIjpcblx0XHRcdFx0YVNlbGVjdGVkUG9pbnRzID0gKG9DaGFydC5nZXRTZWxlY3RlZERhdGFQb2ludHMoKSBhcyBhbnkpLmRhdGFQb2ludHM7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkNBVEVHT1JZXCI6XG5cdFx0XHRcdGFTZWxlY3RlZFBvaW50cyA9IChvQ2hhcnQuZ2V0U2VsZWN0ZWRDYXRlZ29yaWVzKCkgYXMgYW55KS5jYXRlZ29yaWVzO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJTRVJJRVNcIjpcblx0XHRcdFx0YVNlbGVjdGVkUG9pbnRzID0gKG9DaGFydC5nZXRTZWxlY3RlZFNlcmllcygpIGFzIGFueSkuc2VyaWVzO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cmV0dXJuIGFTZWxlY3RlZFBvaW50cztcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgZmlsdGVycywgZHJpbGxzdGFjayBhbmQgc2VsZWN0ZWQgY29udGV4dHMgaW4gdGhlIFVJIG1vZGVsLlxuXHQgKiBDYW4gYWxzbyBiZSB1c2VkIHRvIHNldCBkYXRhIGluIHRoZSBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIG9NZGNDaGFydCBUaGUgTURDX0NoYXJ0IGNvbnRyb2xcblx0ICogQHBhcmFtIHNQYXRoIFRoZSBwYXRoIGluIHRoZSBVSSBtb2RlbCBmcm9tIHdoaWNoIGNoYXJ0IGRhdGEgaXMgdG8gYmUgc2V0L2ZldGNoZWRcblx0ICogQHBhcmFtIHZEYXRhIFRoZSBjaGFydCBpbmZvIHRvIGJlIHNldFxuXHQgKiBAcmV0dXJucyBUaGUgY2hhcnQgaW5mbyAoZmlsdGVycy9kcmlsbHN0YWNrL3NlbGVjdGVkQ29udGV4dHMpXG5cdCAqL1xuXHRnZXRDaGFydE1vZGVsOiBmdW5jdGlvbiAob01kY0NoYXJ0OiBNRENDaGFydCwgc1BhdGg6IHN0cmluZywgdkRhdGE/OiBvYmplY3QgfCBhbnlbXSkge1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9NZGNDaGFydC5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdGlmICghb0ludGVybmFsTW9kZWxDb250ZXh0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKHZEYXRhKSB7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc1BhdGgsIHZEYXRhKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9JbnRlcm5hbE1vZGVsQ29udGV4dCAmJiBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0T2JqZWN0KHNQYXRoKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBmZXRjaCB0aGUgY3VycmVudCBkcmlsbHN0YWNrIGRpbWVuc2lvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ2hhcnQgVGhlIGlubmVyIGNoYXJ0IGNvbnRyb2xcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgZHJpbGxzdGFjayBkaW1lbnNpb25zXG5cdCAqL1xuXHRnZXREaW1lbnNpb25zRnJvbURyaWxsU3RhY2s6IGZ1bmN0aW9uIChvQ2hhcnQ6IENoYXJ0KSB7XG5cdFx0Y29uc3QgYUN1cnJlbnREcmlsbFN0YWNrID0gb0NoYXJ0LmdldERyaWxsU3RhY2soKSB8fCBbXTtcblx0XHRjb25zdCBhQ3VycmVudERyaWxsVmlldyA9IGFDdXJyZW50RHJpbGxTdGFjay5wb3AoKSB8fCAoe30gYXMgYW55KTtcblx0XHRyZXR1cm4gYUN1cnJlbnREcmlsbFZpZXcuZGltZW5zaW9uIHx8IFtdO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGZldGNoIGNoYXJ0IHNlbGVjdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ2hhcnQgVGhlIGlubmVyIGNoYXJ0IGNvbnRyb2xcblx0ICogQHJldHVybnMgVGhlIGNoYXJ0IHNlbGVjdGlvbnNcblx0ICovXG5cdGdldFZpelNlbGVjdGlvbjogZnVuY3Rpb24gKG9DaGFydDogYW55KSB7XG5cdFx0cmV0dXJuIChvQ2hhcnQgJiYgb0NoYXJ0Ll9nZXRWaXpGcmFtZSgpICYmIG9DaGFydC5fZ2V0Vml6RnJhbWUoKS52aXpTZWxlY3Rpb24oKSkgfHwgW107XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IENoYXJ0VXRpbHM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFVQSxNQUFNQSxVQUFVLEdBQUc7SUFDbEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0Msa0JBQWtCLEVBQUUsVUFBVUMsU0FBbUIsRUFBRUMsZ0JBQTBCLEVBQUU7TUFDOUU7TUFDQSxJQUFJQSxnQkFBZ0IsRUFBRTtRQUNyQixJQUFJLENBQUNDLGFBQWEsQ0FBQ0YsU0FBUyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztNQUN0QztNQUNBLE1BQU1HLGNBQWMsR0FBRyxJQUFJLENBQUNELGFBQWEsQ0FBQ0YsU0FBUyxFQUFFLFNBQVMsQ0FBQztNQUMvRCxPQUFPRyxjQUFjLElBQUksRUFBRTtJQUM1QixDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLGVBQWUsRUFBRSxVQUFVSixT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
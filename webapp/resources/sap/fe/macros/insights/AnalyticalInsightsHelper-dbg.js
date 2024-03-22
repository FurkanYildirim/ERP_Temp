/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Get measures of the chart.
   *
   * @param innerChart
   * @returns Measures of the chart.
   */
  function getMeasures(innerChart) {
    let measures = [];
    measures = innerChart.getMeasures().map(measure => {
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
  _exports.getMeasures = getMeasures;
  function getDimensions(innerChart) {
    let dimensions = [];
    dimensions = innerChart.getDimensions().map(dimension => {
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
  _exports.getDimensions = getDimensions;
  function getFeeds(innerChart) {
    const vizFeeds = innerChart.getAggregation("_vizFrame").getFeeds();
    const feeds = vizFeeds.map(feed => {
      return feed.getProperty("values").map(feedValue => {
        const label = getLabel(innerChart, feedValue.getProperty("name"), feedValue.getProperty("type"));
        const feedType = {
          type: feed.getProperty("type"),
          uid: feed.getProperty("uid"),
          values: [label]
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
  _exports.getFeeds = getFeeds;
  function getLabel(innerChart, name, type) {
    let label;
    const measures = innerChart.getMeasures();
    const dimensions = innerChart.getDimensions();
    if (type === "Dimension") {
      label = dimensions.filter(dimension => {
        return dimension.getName() === name;
      })[0].getLabel() || name;
    } else {
      label = measures.filter(measure => {
        return measure.getName() === name;
      })[0].getLabel() || name;
    }
    return label;
  }

  /**
   * Get chart properties.
   *
   * @param innerChart
   * @returns Chart properties.
   */
  _exports.getLabel = getLabel;
  function getChartProperties(innerChart) {
    return innerChart.getAggregation("_vizFrame").getVizProperties();
  }
  _exports.getChartProperties = getChartProperties;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRNZWFzdXJlcyIsImlubmVyQ2hhcnQiLCJtZWFzdXJlcyIsIm1hcCIsIm1lYXN1cmUiLCJuYW1lIiwiZ2V0TGFiZWwiLCJ2YWx1ZSIsImdldE5hbWUiLCJnZXREaW1lbnNpb25zIiwiZGltZW5zaW9ucyIsImRpbWVuc2lvbiIsImdldFRleHRQcm9wZXJ0eSIsImdldEZlZWRzIiwidml6RmVlZHMiLCJnZXRBZ2dyZWdhdGlvbiIsImZlZWRzIiwiZmVlZCIsImdldFByb3BlcnR5IiwiZmVlZFZhbHVlIiwibGFiZWwiLCJmZWVkVHlwZSIsInR5cGUiLCJ1aWQiLCJ2YWx1ZXMiLCJmbGF0IiwiZmlsdGVyIiwiZ2V0Q2hhcnRQcm9wZXJ0aWVzIiwiZ2V0Vml6UHJvcGVydGllcyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQW5hbHl0aWNhbEluc2lnaHRzSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgZGVmYXVsdCBhcyBJbm5lckNoYXJ0IH0gZnJvbSBcInNhcC9jaGFydC9DaGFydFwiO1xuaW1wb3J0IHR5cGUgRGltZW5zaW9uIGZyb20gXCJzYXAvY2hhcnQvZGF0YS9EaW1lbnNpb25cIjtcbmltcG9ydCB0eXBlIE1lYXN1cmUgZnJvbSBcInNhcC9jaGFydC9kYXRhL01lYXN1cmVcIjtcbmltcG9ydCB0eXBlIHsgQ2hhcnRQcm9wZXJ0eVR5cGUsIERpbWVuc2lvblR5cGUsIEZlZWRUeXBlLCBNZWFzdXJlVHlwZSB9IGZyb20gXCJzYXAvdWkvaW50ZWdyYXRpb24vd2lkZ2V0cy9DYXJkXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvbWRjL0NvbnRyb2xcIjtcblxudHlwZSBWaXpGcmFtZSA9IHtcblx0Z2V0Vml6UHJvcGVydGllczogRnVuY3Rpb247XG5cdGdldEZlZWRzOiBGdW5jdGlvbjtcbn07XG5cbmV4cG9ydCB0eXBlIElubmVyQ2hhcnRUeXBlID0gSW5uZXJDaGFydCAmIHsgZ2V0QmluZGluZ0luZm86IEZ1bmN0aW9uOyBnZXRBZ2dyZWdhdGlvbjogRnVuY3Rpb24gfTtcblxuLyoqXG4gKiBHZXQgbWVhc3VyZXMgb2YgdGhlIGNoYXJ0LlxuICpcbiAqIEBwYXJhbSBpbm5lckNoYXJ0XG4gKiBAcmV0dXJucyBNZWFzdXJlcyBvZiB0aGUgY2hhcnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRNZWFzdXJlcyhpbm5lckNoYXJ0OiBJbm5lckNoYXJ0VHlwZSk6IE1lYXN1cmVUeXBlW10ge1xuXHRsZXQgbWVhc3VyZXM6IE1lYXN1cmVUeXBlW10gPSBbXTtcblx0bWVhc3VyZXMgPSBpbm5lckNoYXJ0LmdldE1lYXN1cmVzKCkubWFwKChtZWFzdXJlOiBNZWFzdXJlKSA9PiB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6IG1lYXN1cmUuZ2V0TGFiZWwoKSxcblx0XHRcdHZhbHVlOiBcIntcIiArIG1lYXN1cmUuZ2V0TmFtZSgpICsgXCJ9XCJcblx0XHR9O1xuXHR9KTtcblx0cmV0dXJuIG1lYXN1cmVzO1xufVxuXG4vKipcbiAqIEdldCBkaW1lbnNpb25zIG9mIHRoZSBjaGFydC5cbiAqXG4gKiBAcGFyYW0gaW5uZXJDaGFydFxuICogQHJldHVybnMgRGltZW5zaW9ucyBvZiB0aGUgY2hhcnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREaW1lbnNpb25zKGlubmVyQ2hhcnQ6IElubmVyQ2hhcnRUeXBlKTogRGltZW5zaW9uVHlwZVtdIHtcblx0bGV0IGRpbWVuc2lvbnM6IERpbWVuc2lvblR5cGVbXSA9IFtdO1xuXHRkaW1lbnNpb25zID0gaW5uZXJDaGFydC5nZXREaW1lbnNpb25zKCkubWFwKChkaW1lbnNpb246IERpbWVuc2lvbikgPT4ge1xuXHRcdGlmIChkaW1lbnNpb24uZ2V0VGV4dFByb3BlcnR5KCkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG5hbWU6IGRpbWVuc2lvbi5nZXRMYWJlbCgpLFxuXHRcdFx0XHR2YWx1ZTogXCJ7XCIgKyBkaW1lbnNpb24uZ2V0VGV4dFByb3BlcnR5KCkgKyBcIn1cIlxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bmFtZTogZGltZW5zaW9uLmdldExhYmVsKCksXG5cdFx0XHRcdHZhbHVlOiBcIntcIiArIGRpbWVuc2lvbi5nZXROYW1lKCkgKyBcIn1cIlxuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gZGltZW5zaW9ucztcbn1cblxuLyoqXG4gKiBHZXQgZmVlZHMgb2YgdGhlIGNoYXJ0LlxuICpcbiAqIEBwYXJhbSBpbm5lckNoYXJ0XG4gKiBAcmV0dXJucyBGZWVkcyBvZiB0aGUgY2hhcnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRGZWVkcyhpbm5lckNoYXJ0OiBJbm5lckNoYXJ0VHlwZSk6IEZlZWRUeXBlW10ge1xuXHRjb25zdCB2aXpGZWVkcyA9IChpbm5lckNoYXJ0LmdldEFnZ3JlZ2F0aW9uKFwiX3ZpekZyYW1lXCIpIGFzIFZpekZyYW1lKS5nZXRGZWVkcygpIGFzIENvbnRyb2xbXTtcblx0Y29uc3QgZmVlZHM6IEZlZWRUeXBlW11bXSA9IHZpekZlZWRzLm1hcCgoZmVlZDogQ29udHJvbCkgPT4ge1xuXHRcdHJldHVybiAoZmVlZC5nZXRQcm9wZXJ0eShcInZhbHVlc1wiKSBhcyBDb250cm9sW10pLm1hcCgoZmVlZFZhbHVlOiBDb250cm9sKSA9PiB7XG5cdFx0XHRjb25zdCBsYWJlbCA9IGdldExhYmVsKGlubmVyQ2hhcnQsIGZlZWRWYWx1ZS5nZXRQcm9wZXJ0eShcIm5hbWVcIikgYXMgc3RyaW5nLCBmZWVkVmFsdWUuZ2V0UHJvcGVydHkoXCJ0eXBlXCIpIGFzIHN0cmluZyk7XG5cdFx0XHRjb25zdCBmZWVkVHlwZTogRmVlZFR5cGUgPSB7XG5cdFx0XHRcdHR5cGU6IGZlZWQuZ2V0UHJvcGVydHkoXCJ0eXBlXCIpIGFzIHN0cmluZyxcblx0XHRcdFx0dWlkOiBmZWVkLmdldFByb3BlcnR5KFwidWlkXCIpIGFzIHN0cmluZyxcblx0XHRcdFx0dmFsdWVzOiBbbGFiZWxdIGFzIHN0cmluZ1tdXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIGZlZWRUeXBlO1xuXHRcdH0pO1xuXHR9KTtcblx0cmV0dXJuIGZlZWRzLmZsYXQoKTtcbn1cblxuLyoqXG4gKiBHZXQgbWVhc3VyZSBsYWJlbCBvciBkaW1lbnNpb24gbGFiZWwgb2YgdGhlIGNoYXJ0LlxuICpcbiAqIEBwYXJhbSBpbm5lckNoYXJ0XG4gKiBAcGFyYW0gbmFtZVxuICogQHBhcmFtIHR5cGVcbiAqIEByZXR1cm5zIE1lYXN1cmUgbGFiZWwgb3IgRGltZW5zaW9uIGxhYmVsIG9mIHRoZSBjaGFydC5cbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGFiZWwoaW5uZXJDaGFydDogSW5uZXJDaGFydFR5cGUsIG5hbWU6IHN0cmluZywgdHlwZTogc3RyaW5nKTogc3RyaW5nIHtcblx0bGV0IGxhYmVsOiBzdHJpbmc7XG5cdGNvbnN0IG1lYXN1cmVzID0gaW5uZXJDaGFydC5nZXRNZWFzdXJlcygpO1xuXHRjb25zdCBkaW1lbnNpb25zID0gaW5uZXJDaGFydC5nZXREaW1lbnNpb25zKCk7XG5cdGlmICh0eXBlID09PSBcIkRpbWVuc2lvblwiKSB7XG5cdFx0bGFiZWwgPVxuXHRcdFx0ZGltZW5zaW9uc1xuXHRcdFx0XHQuZmlsdGVyKChkaW1lbnNpb246IERpbWVuc2lvbikgPT4ge1xuXHRcdFx0XHRcdHJldHVybiBkaW1lbnNpb24uZ2V0TmFtZSgpID09PSBuYW1lO1xuXHRcdFx0XHR9KVswXVxuXHRcdFx0XHQuZ2V0TGFiZWwoKSB8fCBuYW1lO1xuXHR9IGVsc2Uge1xuXHRcdGxhYmVsID1cblx0XHRcdG1lYXN1cmVzXG5cdFx0XHRcdC5maWx0ZXIoKG1lYXN1cmU6IE1lYXN1cmUpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gbWVhc3VyZS5nZXROYW1lKCkgPT09IG5hbWU7XG5cdFx0XHRcdH0pWzBdXG5cdFx0XHRcdC5nZXRMYWJlbCgpIHx8IG5hbWU7XG5cdH1cblx0cmV0dXJuIGxhYmVsO1xufVxuXG4vKipcbiAqIEdldCBjaGFydCBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSBpbm5lckNoYXJ0XG4gKiBAcmV0dXJucyBDaGFydCBwcm9wZXJ0aWVzLlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGFydFByb3BlcnRpZXMoaW5uZXJDaGFydDogSW5uZXJDaGFydFR5cGUpOiBDaGFydFByb3BlcnR5VHlwZSB7XG5cdHJldHVybiAoaW5uZXJDaGFydC5nZXRBZ2dyZWdhdGlvbihcIl92aXpGcmFtZVwiKSBhcyBWaXpGcmFtZSkuZ2V0Vml6UHJvcGVydGllcygpIGFzIENoYXJ0UHJvcGVydHlUeXBlO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNBLFdBQVcsQ0FBQ0MsVUFBMEIsRUFBaUI7SUFDdEUsSUFBSUMsUUFBdUIsR0FBRyxFQUFFO0lBQ2hDQSxRQUFRLEdBQUdELFVBQVUsQ0FBQ0QsV0FBVyxFQUFFLENBQUNHLEdBQUcsQ0FBRUMsT0FBZ0IsSUFBSztNQUM3RCxPQUFPO1FBQ05DLElBQUksRUFBRUQsT0FBTyxDQUFDRSxRQUFRLEVBQUU7UUFDeEJDLEtBQUssRUFBRSxHQUFHLEdBQUdILE9BQU8sQ0FBQ0ksT0FBTyxFQUFFLEdBQUc7TUFDbEMsQ0FBQztJQUNGLENBQUMsQ0FBQztJQUNGLE9BQU9OLFFBQVE7RUFDaEI7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEE7RUFNTyxTQUFTTyxhQUFhLENBQUNSLFVBQTBCLEVBQW1CO0lBQzFFLElBQUlTLFVBQTJCLEdBQUcsRUFBRTtJQUNwQ0EsVUFBVSxHQUFHVCxVQUFVLENBQUNRLGFBQWEsRUFBRSxDQUFDTixHQUFHLENBQUVRLFNBQW9CLElBQUs7TUFDckUsSUFBSUEsU0FBUyxDQUFDQyxlQUFlLEVBQUUsRUFBRTtRQUNoQyxPQUFPO1VBQ05QLElBQUksRUFBRU0sU0FBUyxDQUFDTCxRQUFRLEVBQUU7VUFDMUJDLEtBQUssRUFB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
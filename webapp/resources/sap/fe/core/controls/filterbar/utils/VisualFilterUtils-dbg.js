/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/templating/FilterHelper", "sap/ui/core/format/NumberFormat", "sap/ui/mdc/condition/Condition", "sap/ui/model/odata/type/DateTimeOffset"], function (Log, FilterHelper, NumberFormat, Condition, DateTimeOffset) {
  "use strict";

  var getTypeCompliantValue = FilterHelper.getTypeCompliantValue;
  var getRangeProperty = FilterHelper.getRangeProperty;
  const VisualFilterUtils = {
    /**
     * Applies the median scale to the chart data.
     *
     * @param oInteractiveChart InteractiveChart in the VisualFilter control
     * @param oView Instance of the view
     * @param sVFId VisualFilter control ID
     * @param sInfoPath Internal model context path to store info.
     */
    applyMedianScaleToChartData: function (oInteractiveChart, oView, sVFId, sInfoPath) {
      const oData = [];
      const sMeasure = oInteractiveChart.data("measure");
      const oInternalModelContext = oView.getBindingContext("internal");
      const aAggregation = oInteractiveChart.getPoints && oInteractiveChart.getPoints() || oInteractiveChart.getBars && oInteractiveChart.getBars() || oInteractiveChart.getSegments && oInteractiveChart.getSegments();
      for (let i = 0; i < aAggregation.length; i++) {
        oData.push(aAggregation[i].getBindingContext().getObject());
      }
      const scaleFactor = this._getMedianScaleFactor(oData, sMeasure);
      if (scaleFactor && scaleFactor.iShortRefNumber && scaleFactor.scale) {
        oInternalModelContext.setProperty(`scalefactor/${sInfoPath}`, scaleFactor.scale);
        oInternalModelContext.setProperty(`scalefactorNumber/${sInfoPath}`, scaleFactor.iShortRefNumber);
      } else {
        oInternalModelContext.setProperty(`scalefactor/${sInfoPath}`, "");
        oInternalModelContext.setProperty(`scalefactorNumber/${sInfoPath}`, "");
        const oScaleTitle = oView.byId(`${sVFId}::ScaleUoMTitle`);
        const oMeasureDimensionTitle = oView.byId(`${sVFId}::MeasureDimensionTitle`);
        const sText = oScaleTitle.getText();
        if (sText === " | ") {
          oScaleTitle.setText("");
          oMeasureDimensionTitle.setTooltip(oMeasureDimensionTitle.getText());
        }
      }
    },
    /**
     * Returns the median scale factor.
     *
     * @param oData VisualFilter data
     * @param sMeasureField Path of the measure
     * @returns Object containing scale and iShortRefNumber
     */
    _getMedianScaleFactor: function (oData, sMeasureField) {
      let i;
      let scaleFactor;
      oData.sort(function (a, b) {
        if (Number(a[sMeasureField]) < Number(b[sMeasureField])) {
          return -1;
        }
        if (Number(a[sMeasureField]) > Number(b[sMeasureField])) {
          return 1;
        }
        return 0;
      });
      if (oData.length > 0) {
        // get median index
        const iMid = oData.length / 2,
          // get mid of array
          // if iMid is whole number, array length is even, calculate median
          // if iMid is not whole number, array length is odd, take median as iMid - 1
          iMedian = iMid % 1 === 0 ? (parseFloat(oData[iMid - 1][sMeasureField]) + parseFloat(oData[iMid][sMeasureField])) / 2 : parseFloat(oData[Math.floor(iMid)][sMeasureField]),
          // get scale factor on median
          val = iMedian;
        for (i = 0; i < 14; i++) {
          scaleFactor = Math.pow(10, i);
          if (Math.round(Math.abs(val) / scaleFactor) < 10) {
            break;
          }
        }
      }
      const fixedInteger = NumberFormat.getIntegerInstance({
        style: "short",
        showScale: false,
        shortRefNumber: scaleFactor
      });

      // apply scale factor to other values and check
      for (i = 0; i < oData.length; i++) {
        const aData = oData[i],
          sScaledValue = fixedInteger.format(aData[sMeasureField]),
          aScaledValueParts = sScaledValue.split(".");
        // if scaled value has only 0 before decimal or 0 after decimal (example: 0.02)
        // then ignore this scale factor else proceed with this scale factor
        // if scaled value divided by 1000 is >= 1000 then also ignore scale factor
        if (!aScaledValueParts[1] && parseInt(aScaledValueParts[0], 10) === 0 || aScaledValueParts[1] && parseInt(aScaledValueParts[0], 10) === 0 && aScaledValueParts[1].indexOf("0") === 0 || sScaledValue / 1000 >= 1000) {
          scaleFactor = undefined;
          break;
        }
      }
      return {
        iShortRefNumber: scaleFactor,
        scale: scaleFactor ? fixedInteger.getScale() : ""
      };
    },
    /**
     * Returns the formatted number according to the rules of VisualChartFilters.
     *
     * @param value Value which needs to be formatted
     * @param scaleFactor ScaleFactor to which the value needs to be scaled
     * @param numberOfFractionalDigits NumberOfFractionalDigits digits in the decimals according to scale
     * @param currency Currency code
     * @returns The formatted number
     */
    getFormattedNumber: function (value, scaleFactor, numberOfFractionalDigits, currency) {
      let fixedInteger;
      value = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
      if (currency) {
        const currencyFormat = NumberFormat.getCurrencyInstance({
          showMeasure: false
        });
        return currencyFormat.format(parseFloat(value), currency);
        // parseFloat(value) is required otherwise -ve value are wrongly rounded off
        // Example: "-1.9" rounds off to -1 instead of -2. however -1.9 rounds off to -2
      } else if (scaleFactor) {
        fixedInteger = NumberFormat.getFloatInstance({
          style: "short",
          showScale: false,
          shortRefNumber: scaleFactor,
          shortDecimals: numberOfFractionalDigits
        });
        return fixedInteger.format(parseFloat(value));
      } else {
        fixedInteger = NumberFormat.getFloatInstance({
          decimals: numberOfFractionalDigits
        });
        return fixedInteger.format(parseFloat(value));
      }
    },
    /**
     * Applies the UOM to the title of the visual filter control.
     *
     * @param oInteractiveChart InteractiveChart in the VisualFilter control
     * @param oContextData Data of the VisualFilter
     * @param oView Instance of the view
     * @param sInfoPath Internal model context path to store info.
     */
    applyUOMToTitle: function (oInteractiveChart, oContextData, oView, sInfoPath) {
      const vUOM = oInteractiveChart.data("uom");
      let sUOM;
      let sCurrency;
      if (vUOM && vUOM["ISOCurrency"]) {
        sUOM = vUOM["ISOCurrency"];
        sCurrency = sUOM.$Path ? oContextData[sUOM.$Path] : sUOM;
      } else if (vUOM && vUOM["Unit"]) {
        sUOM = vUOM["Unit"];
      }
      if (sUOM) {
        const sUOMValue = sUOM.$Path ? oContextData[sUOM.$Path] : sUOM;
        const oInternalModelContext = oView.getBindingContext("internal");
        oInternalModelContext.setProperty(`uom/${sInfoPath}`, sUOMValue);
        if (sCurrency) {
          oInternalModelContext.setProperty(`currency/${sInfoPath}`, sUOMValue);
        }
      }
    },
    /**
     * Updates the scale factor in the title of the visual filter.
     *
     * @param oInteractiveChart InteractiveChart in the VisualFilter control
     * @param oView Instance of the view
     * @param sVFId VisualFilter control ID
     * @param sInfoPath Internal model context path to store info.
     */
    updateChartScaleFactorTitle: function (oInteractiveChart, oView, sVFId, sInfoPath) {
      if (!oInteractiveChart.data("scalefactor")) {
        this.applyMedianScaleToChartData(oInteractiveChart, oView, sVFId, sInfoPath);
      } else {
        const fixedInteger = NumberFormat.getIntegerInstance({
          style: "short",
          showScale: false,
          shortRefNumber: oInteractiveChart.data("scalefactor")
        });
        const oInternalModelContext = oView.getBindingContext("internal");
        const scale = fixedInteger.getScale() ? fixedInteger.getScale() : "";
        oInternalModelContext.setProperty(`scalefactor/${sInfoPath}`, scale);
      }
    },
    /**
     *
     * @param s18nMessageTitle Text of the error message title.
     * @param s18nMessage Text of the error message description.
     * @param sInfoPath Internal model context path to store info.
     * @param oView Instance of the view.
     */
    applyErrorMessageAndTitle: function (s18nMessageTitle, s18nMessage, sInfoPath, oView) {
      const oInternalModelContext = oView.getBindingContext("internal");
      oInternalModelContext.setProperty(sInfoPath, {});
      oInternalModelContext.setProperty(sInfoPath, {
        errorMessageTitle: s18nMessageTitle,
        errorMessage: s18nMessage,
        showError: true
      });
    },
    /**
     * Checks if multiple units are present.
     *
     * @param oContexts Contexts of the VisualFilter
     * @param sUnitfield The path of the unit field
     * @returns Returns if multiple units are configured or not
     */
    checkMulitUnit: function (oContexts, sUnitfield) {
      const aData = [];
      if (oContexts && sUnitfield) {
        for (let i = 0; i < oContexts.length; i++) {
          const aContextData = oContexts[i] && oContexts[i].getObject();
          aData.push(aContextData[sUnitfield]);
        }
      }
      return !!aData.reduce(function (data, key) {
        return data === key ? data : NaN;
      });
    },
    /**
     * Sets an error message if multiple UOM are present.
     *
     * @param oData Data of the VisualFilter control
     * @param oInteractiveChart InteractiveChart in the VisualFilter control
     * @param sInfoPath Internal model context path to store info.
     * @param oResourceBundle The resource bundle
     * @param oView Instance of the view
     */
    setMultiUOMMessage: function (oData, oInteractiveChart, sInfoPath, oResourceBundle, oView) {
      const vUOM = oInteractiveChart.data("uom");
      const sIsCurrency = vUOM && vUOM["ISOCurrency"] && vUOM["ISOCurrency"].$Path;
      const sIsUnit = vUOM && vUOM["Unit"] && vUOM["Unit"].$Path;
      const sUnitfield = sIsCurrency || sIsUnit;
      let s18nMessageTitle, s18nMessage;
      if (sUnitfield) {
        if (!this.checkMulitUnit(oData, sUnitfield)) {
          if (sIsCurrency) {
            s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
            s18nMessage = oResourceBundle.getText("M_VISUAL_FILTERS_MULTIPLE_CURRENCY", sUnitfield);
            this.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInfoPath, oView);
            Log.warning(`Filter is set for multiple Currency for${sUnitfield}`);
          } else if (sIsUnit) {
            s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
            s18nMessage = oResourceBundle.getText("M_VISUAL_FILTERS_MULTIPLE_UNIT", sUnitfield);
            this.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInfoPath, oView);
            Log.warning(`Filter is set for multiple UOMs for${sUnitfield}`);
          }
        }
      }
    },
    /**
     * Sets an error message if response data is empty.
     *
     * @param sInfoPath Internal model context path to store info.
     * @param oResourceBundle The resource bundle
     * @param oView Instance of the view
     */
    setNoDataMessage: function (sInfoPath, oResourceBundle, oView) {
      const s18nMessageTitle = oResourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE");
      const s18nMessage = oResourceBundle.getText("M_VISUAL_FILTER_NO_DATA_TEXT");
      this.applyErrorMessageAndTitle(s18nMessageTitle, s18nMessage, sInfoPath, oView);
    },
    convertFilterCondions: function (oFilterConditions) {
      const oConvertedConditions = {};
      Object.keys(oFilterConditions).forEach(function (sKey) {
        const aConvertedConditions = [];
        const aConditions = oFilterConditions[sKey];
        for (let i = 0; i < aConditions.length; i++) {
          const values = aConditions[i].value2 ? [aConditions[i].value1, aConditions[i].value2] : [aConditions[i].value1];
          aConvertedConditions.push(Condition.createCondition(aConditions[i].operator, values, null, null, "Validated"));
        }
        if (aConvertedConditions.length) {
          oConvertedConditions[sKey] = aConvertedConditions;
        }
      });
      return oConvertedConditions;
    },
    getCustomConditions: function (Range, oValidProperty, sPropertyName) {
      let value1, value2;
      if (oValidProperty.$Type === "Edm.DateTimeOffset") {
        value1 = this._parseDateTime(getTypeCompliantValue(this._formatDateTime(Range.Low), oValidProperty.$Type));
        value2 = Range.High ? this._parseDateTime(getTypeCompliantValue(this._formatDateTime(Range.High), oValidProperty.$Type)) : null;
      } else {
        value1 = Range.Low;
        value2 = Range.High ? Range.High : null;
      }
      return {
        operator: Range.Option ? getRangeProperty(Range.Option.$EnumMember || Range.Option) : null,
        value1: value1,
        value2: value2,
        path: sPropertyName
      };
    },
    _parseDateTime: function (sValue) {
      return this._getDateTimeTypeInstance().parseValue(sValue, "string");
    },
    _formatDateTime: function (sValue) {
      return this._getDateTimeTypeInstance().formatValue(sValue, "string");
    },
    _getDateTimeTypeInstance: function () {
      return new DateTimeOffset({
        pattern: "yyyy-MM-ddTHH:mm:ssZ",
        calendarType: "Gregorian"
      }, {
        V4: true
      });
    },
    /**
     * Get error info when required inParameters or required filters are not available.
     *
     * @function
     * @name getErrorInfoForNoInitialOverlay
     * @param notMatchedConditions Property names(inParameters or required filters) for which values are not available .
     * @param resourceBundle ResourceBundle for translated texts.
     * @param entitySetPath EntitySet Path for property label annotation.
     * @param metaModel Default metamodel.
     * @returns Error info containing texts for title and message.
     */
    getErrorInfoForNoInitialOverlay: function (notMatchedConditions, resourceBundle, entitySetPath, metaModel) {
      let ret;
      if (notMatchedConditions.length > 1) {
        ret = {
          showError: true,
          errorMessageTitle: resourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
          errorMessage: resourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_MULTIPLEVF")
        };
      } else if (notMatchedConditions.length === 1) {
        const label = metaModel.getObject(`${entitySetPath}/${notMatchedConditions[0]}@com.sap.vocabularies.Common.v1.Label`) || notMatchedConditions[0];
        ret = {
          showError: true,
          errorMessageTitle: resourceBundle.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE"),
          errorMessage: resourceBundle.getText("M_VISUAL_FILTERS_PROVIDE_FILTER_VAL_SINGLEVF", [label])
        };
      }
      return ret;
    }
  };
  return VisualFilterUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXJVdGlscyIsImFwcGx5TWVkaWFuU2NhbGVUb0NoYXJ0RGF0YSIsIm9JbnRlcmFjdGl2ZUNoYXJ0Iiwib1ZpZXciLCJzVkZJZCIsInNJbmZvUGF0aCIsIm9EYXRhIiwic01lYXN1cmUiLCJkYXRhIiwib0ludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJhQWdncmVnYXRpb24iLCJnZXRQb2ludHMiLCJnZXRCYXJzIiwiZ2V0U2VnbWVudHMiLCJpIiwibGVuZ3RoIiwicHVzaCIsImdldE9iamVjdCIsInNjYWxlRmFjdG9yIiwiX2dldE1lZGlhblNjYWxlRmFjdG9yIiwiaVNob3J0UmVmTnVtYmVyIiwic2NhbGUiLCJzZXRQcm9wZXJ0eSIsIm9TY2FsZVRpdGxlIiwiYnlJZCIsIm9NZWFzdXJlRGltZW5zaW9uVGl0bGUiLCJzVGV4dCIsImdldFRleHQiLCJzZXRUZXh0Iiwic2V0VG9vbHRpcCIsInNNZWFzdXJlRmllbGQiLCJzb3J0IiwiYSIsImIiLCJOdW1iZXIiLCJpTWlkIiwiaU1lZGlhbiIsInBhcnNlRmxvYXQiLCJNYXRoIiwiZmxvb3IiLCJ2YWwiLCJwb3ciLCJyb3VuZCIsImFicyIsImZpeGVkSW50ZWdlciIsIk51bWJlckZvcm1hdCIsImdldEludGVnZXJJbnN0YW5jZSIsInN0eWxlIiwic2hvd1NjYWxlIiwic2hvcnRSZWZOdW1iZXIiLCJhRGF0YSIsInNTY2FsZWRWYWx1ZSIsImZvcm1hdCIsImFTY2FsZWRWYWx1ZVBhcnRzIiwic3BsaXQiLCJwYXJzZUludCIsImluZGV4T2YiLCJ1bmRlZmluZWQiLCJnZXRTY2FsZSIsImdldEZvcm1hdHRlZE51bWJlciIsInZhbHVlIiwibnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzIiwiY3VycmVuY3kiLCJyZXBsYWNlIiwiY3VycmVuY3lGb3JtYXQiLCJnZXRDdXJyZW5jeUluc3RhbmNlIiwic2hvd01lYXN1cmUiLCJnZXRGbG9hdEluc3RhbmNlIiwic2hvcnREZWNpbWFscyIsImRlY2ltYWxzIiwiYXBwbHlVT01Ub1RpdGxlIiwib0NvbnRleHREYXRhIiwidlVPTSIsInNVT00iLCJzQ3VycmVuY3kiLCIkUGF0aCIsInNVT01WYWx1ZSIsInVwZGF0ZUNoYXJ0U2NhbGVGYWN0b3JUaXRsZSIsImFwcGx5RXJyb3JNZXNzYWdlQW5kVGl0bGUiLCJzMThuTWVzc2FnZVRpdGxlIiwiczE4bk1lc3NhZ2UiLCJlcnJvck1lc3NhZ2VUaXRsZSIsImVycm9yTWVzc2FnZSIsInNob3dFcnJvciIsImNoZWNrTXVsaXRVbml0Iiwib0NvbnRleHRzIiwic1VuaXRmaWVsZCIsImFDb250ZXh0RGF0YSIsInJlZHVjZSIsImtleSIsIk5hTiIsInNldE11bHRpVU9NTWVzc2FnZSIsIm9SZXNvdXJjZUJ1bmRsZSIsInNJc0N1cnJlbmN5Iiwic0lzVW5pdCIsIkxvZyIsIndhcm5pbmciLCJzZXROb0RhdGFNZXNzYWdlIiwiY29udmVydEZpbHRlckNvbmRpb25zIiwib0ZpbHRlckNvbmRpdGlvbnMiLCJvQ29udmVydGVkQ29uZGl0aW9ucyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwic0tleSIsImFDb252ZXJ0ZWRDb25kaXRpb25zIiwiYUNvbmRpdGlvbnMiLCJ2YWx1ZXMiLCJ2YWx1ZTIiLCJ2YWx1ZTEiLCJDb25kaXRpb24iLCJjcmVhdGVDb25kaXRpb24iLCJvcGVyYXRvciIsImdldEN1c3RvbUNvbmRpdGlvbnMiLCJSYW5nZSIsIm9WYWxpZFByb3BlcnR5Iiwic1Byb3BlcnR5TmFtZSIsIiRUeXBlIiwiX3BhcnNlRGF0ZVRpbWUiLCJnZXRUeXBlQ29tcGxpYW50VmFsdWUiLCJfZm9ybWF0RGF0ZVRpbWUiLCJMb3ciLCJIaWdoIiwiT3B0aW9uIiwiZ2V0UmFuZ2VQcm9wZXJ0eSIsIiRFbnVtTWVtYmVyIiwicGF0aCIsInNWYWx1ZSIsIl9nZXREYXRlVGltZVR5cGVJbnN0YW5jZSIsInBhcnNlVmFsdWUiLCJmb3JtYXRWYWx1ZSIsIkRhdGVUaW1lT2Zmc2V0IiwicGF0dGVybiIsImNhbGVuZGFyVHlwZSIsIlY0IiwiZ2V0RXJyb3JJbmZvRm9yTm9Jbml0aWFsT3ZlcmxheSIsIm5vdE1hdGNoZWRDb25kaXRpb25zIiwicmVzb3VyY2VCdW5kbGUiLCJlbnRpdHlTZXRQYXRoIiwibWV0YU1vZGVsIiwicmV0IiwibGFiZWwiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZpc3VhbEZpbHRlclV0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0UmFuZ2VQcm9wZXJ0eSwgZ2V0VHlwZUNvbXBsaWFudFZhbHVlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRmlsdGVySGVscGVyXCI7XG5pbXBvcnQgdHlwZSBUaXRsZSBmcm9tIFwic2FwL20vVGl0bGVcIjtcbmltcG9ydCBOdW1iZXJGb3JtYXQgZnJvbSBcInNhcC91aS9jb3JlL2Zvcm1hdC9OdW1iZXJGb3JtYXRcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCB0eXBlIENvbmRpdGlvblZhbGlkYXRlZCBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0NvbmRpdGlvblZhbGlkYXRlZFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9NZXRhTW9kZWxcIjtcbmltcG9ydCBEYXRlVGltZU9mZnNldCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3R5cGUvRGF0ZVRpbWVPZmZzZXRcIjtcblxuY29uc3QgVmlzdWFsRmlsdGVyVXRpbHMgPSB7XG5cdC8qKlxuXHQgKiBBcHBsaWVzIHRoZSBtZWRpYW4gc2NhbGUgdG8gdGhlIGNoYXJ0IGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSBvSW50ZXJhY3RpdmVDaGFydCBJbnRlcmFjdGl2ZUNoYXJ0IGluIHRoZSBWaXN1YWxGaWx0ZXIgY29udHJvbFxuXHQgKiBAcGFyYW0gb1ZpZXcgSW5zdGFuY2Ugb2YgdGhlIHZpZXdcblx0ICogQHBhcmFtIHNWRklkIFZpc3VhbEZpbHRlciBjb250cm9sIElEXG5cdCAqIEBwYXJhbSBzSW5mb1BhdGggSW50ZXJuYWwgbW9kZWwgY29udGV4dCBwYXRoIHRvIHN0b3JlIGluZm8uXG5cdCAqL1xuXHRhcHBseU1lZGlhblNjYWxlVG9DaGFydERhdGE6IGZ1bmN0aW9uIChvSW50ZXJhY3RpdmVDaGFydDogYW55LCBvVmlldzogVmlldywgc1ZGSWQ6IHN0cmluZywgc0luZm9QYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCBvRGF0YSA9IFtdO1xuXHRcdGNvbnN0IHNNZWFzdXJlID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcIm1lYXN1cmVcIik7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRjb25zdCBhQWdncmVnYXRpb24gPVxuXHRcdFx0KG9JbnRlcmFjdGl2ZUNoYXJ0LmdldFBvaW50cyAmJiBvSW50ZXJhY3RpdmVDaGFydC5nZXRQb2ludHMoKSkgfHxcblx0XHRcdChvSW50ZXJhY3RpdmVDaGFydC5nZXRCYXJzICYmIG9JbnRlcmFjdGl2ZUNoYXJ0LmdldEJhcnMoKSkgfHxcblx0XHRcdChvSW50ZXJhY3RpdmVDaGFydC5nZXRTZWdtZW50cyAmJiBvSW50ZXJhY3RpdmVDaGFydC5nZXRTZWdtZW50cygpKTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFBZ2dyZWdhdGlvbi5sZW5ndGg7IGkrKykge1xuXHRcdFx0b0RhdGEucHVzaChhQWdncmVnYXRpb25baV0uZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRPYmplY3QoKSk7XG5cdFx0fVxuXHRcdGNvbnN0IHNjYWxlRmFjdG9yID0gdGhpcy5fZ2V0TWVkaWFuU2NhbGVGYWN0b3Iob0RhdGEsIHNNZWFzdXJlKTtcblx0XHRpZiAoc2NhbGVGYWN0b3IgJiYgc2NhbGVGYWN0b3IuaVNob3J0UmVmTnVtYmVyICYmIHNjYWxlRmFjdG9yLnNjYWxlKSB7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoYHNjYWxlZmFjdG9yLyR7c0luZm9QYXRofWAsIHNjYWxlRmFjdG9yLnNjYWxlKTtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShgc2NhbGVmYWN0b3JOdW1iZXIvJHtzSW5mb1BhdGh9YCwgc2NhbGVGYWN0b3IuaVNob3J0UmVmTnVtYmVyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KGBzY2FsZWZhY3Rvci8ke3NJbmZvUGF0aH1gLCBcIlwiKTtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShgc2NhbGVmYWN0b3JOdW1iZXIvJHtzSW5mb1BhdGh9YCwgXCJcIik7XG5cdFx0XHRjb25zdCBvU2NhbGVUaXRsZSA9IG9WaWV3LmJ5SWQoYCR7c1ZGSWR9OjpTY2FsZVVvTVRpdGxlYCkgYXMgVGl0bGU7XG5cdFx0XHRjb25zdCBvTWVhc3VyZURpbWVuc2lvblRpdGxlID0gb1ZpZXcuYnlJZChgJHtzVkZJZH06Ok1lYXN1cmVEaW1lbnNpb25UaXRsZWApIGFzIFRpdGxlO1xuXHRcdFx0Y29uc3Qgc1RleHQgPSBvU2NhbGVUaXRsZS5nZXRUZXh0KCk7XG5cdFx0XHRpZiAoc1RleHQgPT09IFwiIHwgXCIpIHtcblx0XHRcdFx0b1NjYWxlVGl0bGUuc2V0VGV4dChcIlwiKTtcblx0XHRcdFx0b01lYXN1cmVEaW1lbnNpb25UaXRsZS5zZXRUb29sdGlwKG9NZWFzdXJlRGltZW5zaW9uVGl0bGUuZ2V0VGV4dCgpKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIG1lZGlhbiBzY2FsZSBmYWN0b3IuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRGF0YSBWaXN1YWxGaWx0ZXIgZGF0YVxuXHQgKiBAcGFyYW0gc01lYXN1cmVGaWVsZCBQYXRoIG9mIHRoZSBtZWFzdXJlXG5cdCAqIEByZXR1cm5zIE9iamVjdCBjb250YWluaW5nIHNjYWxlIGFuZCBpU2hvcnRSZWZOdW1iZXJcblx0ICovXG5cdF9nZXRNZWRpYW5TY2FsZUZhY3RvcjogZnVuY3Rpb24gKG9EYXRhOiBhbnlbXSwgc01lYXN1cmVGaWVsZDogc3RyaW5nKSB7XG5cdFx0bGV0IGk7XG5cdFx0bGV0IHNjYWxlRmFjdG9yO1xuXHRcdG9EYXRhLnNvcnQoZnVuY3Rpb24gKGE6IGFueSwgYjogYW55KSB7XG5cdFx0XHRpZiAoTnVtYmVyKGFbc01lYXN1cmVGaWVsZF0pIDwgTnVtYmVyKGJbc01lYXN1cmVGaWVsZF0pKSB7XG5cdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdH1cblx0XHRcdGlmIChOdW1iZXIoYVtzTWVhc3VyZUZpZWxkXSkgPiBOdW1iZXIoYltzTWVhc3VyZUZpZWxkXSkpIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gMDtcblx0XHR9KTtcblx0XHRpZiAob0RhdGEubGVuZ3RoID4gMCkge1xuXHRcdFx0Ly8gZ2V0IG1lZGlhbiBpbmRleFxuXHRcdFx0Y29uc3QgaU1pZCA9IG9EYXRhLmxlbmd0aCAvIDIsIC8vIGdldCBtaWQgb2YgYXJyYXlcblx0XHRcdFx0Ly8gaWYgaU1pZCBpcyB3aG9sZSBudW1iZXIsIGFycmF5IGxlbmd0aCBpcyBldmVuLCBjYWxjdWxhdGUgbWVkaWFuXG5cdFx0XHRcdC8vIGlmIGlNaWQgaXMgbm90IHdob2xlIG51bWJlciwgYXJyYXkgbGVuZ3RoIGlzIG9kZCwgdGFrZSBtZWRpYW4gYXMgaU1pZCAtIDFcblx0XHRcdFx0aU1lZGlhbiA9XG5cdFx0XHRcdFx0aU1pZCAlIDEgPT09IDBcblx0XHRcdFx0XHRcdD8gKHBhcnNlRmxvYXQob0RhdGFbaU1pZCAtIDFdW3NNZWFzdXJlRmllbGRdKSArIHBhcnNlRmxvYXQob0RhdGFbaU1pZF1bc01lYXN1cmVGaWVsZF0pKSAvIDJcblx0XHRcdFx0XHRcdDogcGFyc2VGbG9hdChvRGF0YVtNYXRoLmZsb29yKGlNaWQpXVtzTWVhc3VyZUZpZWxkXSksXG5cdFx0XHRcdC8vIGdldCBzY2FsZSBmYWN0b3Igb24gbWVkaWFuXG5cdFx0XHRcdHZhbCA9IGlNZWRpYW47XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDwgMTQ7IGkrKykge1xuXHRcdFx0XHRzY2FsZUZhY3RvciA9IE1hdGgucG93KDEwLCBpKTtcblx0XHRcdFx0aWYgKE1hdGgucm91bmQoTWF0aC5hYnModmFsKSAvIHNjYWxlRmFjdG9yKSA8IDEwKSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBmaXhlZEludGVnZXIgPSBOdW1iZXJGb3JtYXQuZ2V0SW50ZWdlckluc3RhbmNlKHtcblx0XHRcdHN0eWxlOiBcInNob3J0XCIsXG5cdFx0XHRzaG93U2NhbGU6IGZhbHNlLFxuXHRcdFx0c2hvcnRSZWZOdW1iZXI6IHNjYWxlRmFjdG9yXG5cdFx0fSk7XG5cblx0XHQvLyBhcHBseSBzY2FsZSBmYWN0b3IgdG8gb3RoZXIgdmFsdWVzIGFuZCBjaGVja1xuXHRcdGZvciAoaSA9IDA7IGkgPCBvRGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgYURhdGEgPSBvRGF0YVtpXSxcblx0XHRcdFx0c1NjYWxlZFZhbHVlID0gZml4ZWRJbnRlZ2VyLmZvcm1hdChhRGF0YVtzTWVhc3VyZUZpZWxkXSkgYXMgYW55LFxuXHRcdFx0XHRhU2NhbGVkVmFsdWVQYXJ0cyA9IHNTY2FsZWRWYWx1ZS5zcGxpdChcIi5cIik7XG5cdFx0XHQvLyBpZiBzY2FsZWQgdmFsdWUgaGFzIG9ubHkgMCBiZWZvcmUgZGVjaW1hbCBvciAwIGFmdGVyIGRlY2ltYWwgKGV4YW1wbGU6IDAuMDIpXG5cdFx0XHQvLyB0aGVuIGlnbm9yZSB0aGlzIHNjYWxlIGZhY3RvciBlbHNlIHByb2NlZWQgd2l0aCB0aGlzIHNjYWxlIGZhY3RvclxuXHRcdFx0Ly8gaWYgc2NhbGVkIHZhbHVlIGRpdmlkZWQgYnkgMTAwMCBpcyA+PSAxMDAwIHRoZW4gYWxzbyBpZ25vcmUgc2NhbGUgZmFjdG9yXG5cdFx0XHRpZiAoXG5cdFx0XHRcdCghYVNjYWxlZFZhbHVlUGFydHNbMV0gJiYgcGFyc2VJbnQoYVNjYWxlZFZhbHVlUGFydHNbMF0sIDEwKSA9PT0gMCkgfHxcblx0XHRcdFx0KGFTY2FsZWRWYWx1ZVBhcnRzWzFdICYmIHBhcnNlSW50KGFTY2FsZWRWYWx1ZVBhcnRzWzBdLCAxMCkgPT09IDAgJiYgYVNjYWxlZFZhbHVlUGFydHNbMV0uaW5kZXhPZihcIjBcIikgPT09IDApIHx8XG5cdFx0XHRcdHNTY2FsZWRWYWx1ZSAvIDEwMDAgPj0gMTAwMFxuXHRcdFx0KSB7XG5cdFx0XHRcdHNjYWxlRmFjdG9yID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlTaG9ydFJlZk51bWJlcjogc2NhbGVGYWN0b3IsXG5cdFx0XHRzY2FsZTogc2NhbGVGYWN0b3IgPyAoZml4ZWRJbnRlZ2VyIGFzIGFueSkuZ2V0U2NhbGUoKSA6IFwiXCJcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmb3JtYXR0ZWQgbnVtYmVyIGFjY29yZGluZyB0byB0aGUgcnVsZXMgb2YgVmlzdWFsQ2hhcnRGaWx0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWUgVmFsdWUgd2hpY2ggbmVlZHMgdG8gYmUgZm9ybWF0dGVkXG5cdCAqIEBwYXJhbSBzY2FsZUZhY3RvciBTY2FsZUZhY3RvciB0byB3aGljaCB0aGUgdmFsdWUgbmVlZHMgdG8gYmUgc2NhbGVkXG5cdCAqIEBwYXJhbSBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHMgTnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzIGRpZ2l0cyBpbiB0aGUgZGVjaW1hbHMgYWNjb3JkaW5nIHRvIHNjYWxlXG5cdCAqIEBwYXJhbSBjdXJyZW5jeSBDdXJyZW5jeSBjb2RlXG5cdCAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgbnVtYmVyXG5cdCAqL1xuXHRnZXRGb3JtYXR0ZWROdW1iZXI6IGZ1bmN0aW9uICh2YWx1ZTogc3RyaW5nIHwgbnVtYmVyLCBzY2FsZUZhY3Rvcj86IG51bWJlciwgbnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzPzogbnVtYmVyLCBjdXJyZW5jeT86IHN0cmluZykge1xuXHRcdGxldCBmaXhlZEludGVnZXI7XG5cdFx0dmFsdWUgPSB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgPyBOdW1iZXIodmFsdWUucmVwbGFjZSgvLC9nLCBcIlwiKSkgOiB2YWx1ZTtcblxuXHRcdGlmIChjdXJyZW5jeSkge1xuXHRcdFx0Y29uc3QgY3VycmVuY3lGb3JtYXQgPSBOdW1iZXJGb3JtYXQuZ2V0Q3VycmVuY3lJbnN0YW5jZSh7XG5cdFx0XHRcdHNob3dNZWFzdXJlOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gY3VycmVuY3lGb3JtYXQuZm9ybWF0KHBhcnNlRmxvYXQodmFsdWUgYXMgYW55KSwgY3VycmVuY3kpO1xuXHRcdFx0Ly8gcGFyc2VGbG9hdCh2YWx1ZSkgaXMgcmVxdWlyZWQgb3RoZXJ3aXNlIC12ZSB2YWx1ZSBhcmUgd3JvbmdseSByb3VuZGVkIG9mZlxuXHRcdFx0Ly8gRXhhbXBsZTogXCItMS45XCIgcm91bmRzIG9mZiB0byAtMSBpbnN0ZWFkIG9mIC0yLiBob3dldmVyIC0xLjkgcm91bmRzIG9mZiB0byAtMlxuXHRcdH0gZWxzZSBpZiAoc2NhbGVGYWN0b3IpIHtcblx0XHRcdGZpeGVkSW50ZWdlciA9IE51bWJlckZvcm1hdC5nZXRGbG9hdEluc3RhbmNlKHtcblx0XHRcdFx0c3R5bGU6IFwic2hvcnRcIixcblx0XHRcdFx0c2hvd1NjYWxlOiBmYWxzZSxcblx0XHRcdFx0c2hvcnRSZWZOdW1iZXI6IHNjYWxlRmFjdG9yLFxuXHRcdFx0XHRzaG9ydERlY2ltYWxzOiBudW1iZXJPZkZyYWN0aW9uYWxEaWdpdHNcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGZpeGVkSW50ZWdlci5mb3JtYXQocGFyc2VGbG9hdCh2YWx1ZSBhcyBhbnkpKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Zml4ZWRJbnRlZ2VyID0gTnVtYmVyRm9ybWF0LmdldEZsb2F0SW5zdGFuY2Uoe1xuXHRcdFx0XHRkZWNpbWFsczogbnVtYmVyT2ZGcmFjdGlvbmFsRGlnaXRzXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBmaXhlZEludGVnZXIuZm9ybWF0KHBhcnNlRmxvYXQodmFsdWUgYXMgYW55KSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBcHBsaWVzIHRoZSBVT00gdG8gdGhlIHRpdGxlIG9mIHRoZSB2aXN1YWwgZmlsdGVyIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBvSW50ZXJhY3RpdmVDaGFydCBJbnRlcmFjdGl2ZUNoYXJ0IGluIHRoZSBWaXN1YWxGaWx0ZXIgY29udHJvbFxuXHQgKiBAcGFyYW0gb0NvbnRleHREYXRhIERhdGEgb2YgdGhlIFZpc3VhbEZpbHRlclxuXHQgKiBAcGFyYW0gb1ZpZXcgSW5zdGFuY2Ugb2YgdGhlIHZpZXdcblx0ICogQHBhcmFtIHNJbmZvUGF0aCBJbnRlcm5hbCBtb2RlbCBjb250ZXh0IHBhdGggdG8gc3RvcmUgaW5mby5cblx0ICovXG5cdGFwcGx5VU9NVG9UaXRsZTogZnVuY3Rpb24gKG9JbnRlcmFjdGl2ZUNoYXJ0OiBhbnksIG9Db250ZXh0RGF0YTogYW55LCBvVmlldzogVmlldywgc0luZm9QYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCB2VU9NID0gb0ludGVyYWN0aXZlQ2hhcnQuZGF0YShcInVvbVwiKTtcblx0XHRsZXQgc1VPTTtcblx0XHRsZXQgc0N1cnJlbmN5O1xuXHRcdGlmICh2VU9NICYmIHZVT01bXCJJU09DdXJyZW5jeVwiXSkge1xuXHRcdFx0c1VPTSA9IHZVT01bXCJJU09DdXJyZW5jeVwiXTtcblx0XHRcdHNDdXJyZW5jeSA9IHNVT00uJFBhdGggPyBvQ29udGV4dERhdGFbc1VPTS4kUGF0aF0gOiBzVU9NO1xuXHRcdH0gZWxzZSBpZiAodlVPTSAmJiB2VU9NW1wiVW5pdFwiXSkge1xuXHRcdFx0c1VPTSA9IHZVT01bXCJVbml0XCJdO1xuXHRcdH1cblx0XHRpZiAoc1VPTSkge1xuXHRcdFx0Y29uc3Qgc1VPTVZhbHVlID0gc1VPTS4kUGF0aCA/IG9Db250ZXh0RGF0YVtzVU9NLiRQYXRoXSA6IHNVT007XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KGB1b20vJHtzSW5mb1BhdGh9YCwgc1VPTVZhbHVlKTtcblx0XHRcdGlmIChzQ3VycmVuY3kpIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KGBjdXJyZW5jeS8ke3NJbmZvUGF0aH1gLCBzVU9NVmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIHNjYWxlIGZhY3RvciBpbiB0aGUgdGl0bGUgb2YgdGhlIHZpc3VhbCBmaWx0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBvSW50ZXJhY3RpdmVDaGFydCBJbnRlcmFjdGl2ZUNoYXJ0IGluIHRoZSBWaXN1YWxGaWx0ZXIgY29udHJvbFxuXHQgKiBAcGFyYW0gb1ZpZXcgSW5zdGFuY2Ugb2YgdGhlIHZpZXdcblx0ICogQHBhcmFtIHNWRklkIFZpc3VhbEZpbHRlciBjb250cm9sIElEXG5cdCAqIEBwYXJhbSBzSW5mb1BhdGggSW50ZXJuYWwgbW9kZWwgY29udGV4dCBwYXRoIHRvIHN0b3JlIGluZm8uXG5cdCAqL1xuXHR1cGRhdGVDaGFydFNjYWxlRmFjdG9yVGl0bGU6IGZ1bmN0aW9uIChvSW50ZXJhY3RpdmVDaGFydDogYW55LCBvVmlldzogVmlldywgc1ZGSWQ6IHN0cmluZywgc0luZm9QYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAoIW9JbnRlcmFjdGl2ZUNoYXJ0LmRhdGEoXCJzY2FsZWZhY3RvclwiKSkge1xuXHRcdFx0dGhpcy5hcHBseU1lZGlhblNjYWxlVG9DaGFydERhdGEob0ludGVyYWN0aXZlQ2hhcnQsIG9WaWV3LCBzVkZJZCwgc0luZm9QYXRoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgZml4ZWRJbnRlZ2VyID0gTnVtYmVyRm9ybWF0LmdldEludGVnZXJJbnN0YW5jZSh7XG5cdFx0XHRcdHN0eWxlOiBcInNob3J0XCIsXG5cdFx0XHRcdHNob3dTY2FsZTogZmFsc2UsXG5cdFx0XHRcdHNob3J0UmVmTnVtYmVyOiBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwic2NhbGVmYWN0b3JcIilcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdGNvbnN0IHNjYWxlID0gZml4ZWRJbnRlZ2VyLmdldFNjYWxlKCkgPyBmaXhlZEludGVnZXIuZ2V0U2NhbGUoKSA6IFwiXCI7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoYHNjYWxlZmFjdG9yLyR7c0luZm9QYXRofWAsIHNjYWxlKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBzMThuTWVzc2FnZVRpdGxlIFRleHQgb2YgdGhlIGVycm9yIG1lc3NhZ2UgdGl0bGUuXG5cdCAqIEBwYXJhbSBzMThuTWVzc2FnZSBUZXh0IG9mIHRoZSBlcnJvciBtZXNzYWdlIGRlc2NyaXB0aW9uLlxuXHQgKiBAcGFyYW0gc0luZm9QYXRoIEludGVybmFsIG1vZGVsIGNvbnRleHQgcGF0aCB0byBzdG9yZSBpbmZvLlxuXHQgKiBAcGFyYW0gb1ZpZXcgSW5zdGFuY2Ugb2YgdGhlIHZpZXcuXG5cdCAqL1xuXHRhcHBseUVycm9yTWVzc2FnZUFuZFRpdGxlOiBmdW5jdGlvbiAoczE4bk1lc3NhZ2VUaXRsZTogc3RyaW5nLCBzMThuTWVzc2FnZTogc3RyaW5nLCBzSW5mb1BhdGg6IHN0cmluZywgb1ZpZXc6IFZpZXcpIHtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShzSW5mb1BhdGgsIHt9KTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoc0luZm9QYXRoLCB7XG5cdFx0XHRlcnJvck1lc3NhZ2VUaXRsZTogczE4bk1lc3NhZ2VUaXRsZSxcblx0XHRcdGVycm9yTWVzc2FnZTogczE4bk1lc3NhZ2UsXG5cdFx0XHRzaG93RXJyb3I6IHRydWVcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIENoZWNrcyBpZiBtdWx0aXBsZSB1bml0cyBhcmUgcHJlc2VudC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0cyBDb250ZXh0cyBvZiB0aGUgVmlzdWFsRmlsdGVyXG5cdCAqIEBwYXJhbSBzVW5pdGZpZWxkIFRoZSBwYXRoIG9mIHRoZSB1bml0IGZpZWxkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgaWYgbXVsdGlwbGUgdW5pdHMgYXJlIGNvbmZpZ3VyZWQgb3Igbm90XG5cdCAqL1xuXHRjaGVja011bGl0VW5pdDogZnVuY3Rpb24gKG9Db250ZXh0czogQ29udGV4dFtdLCBzVW5pdGZpZWxkOiBzdHJpbmcpIHtcblx0XHRjb25zdCBhRGF0YSA9IFtdO1xuXHRcdGlmIChvQ29udGV4dHMgJiYgc1VuaXRmaWVsZCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvQ29udGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgYUNvbnRleHREYXRhID0gb0NvbnRleHRzW2ldICYmIG9Db250ZXh0c1tpXS5nZXRPYmplY3QoKTtcblx0XHRcdFx0YURhdGEucHVzaChhQ29udGV4dERhdGFbc1VuaXRmaWVsZF0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gISFhRGF0YS5yZWR1Y2UoZnVuY3Rpb24gKGRhdGE6IGFueSwga2V5OiBhbnkpIHtcblx0XHRcdHJldHVybiBkYXRhID09PSBrZXkgPyBkYXRhIDogTmFOO1xuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXRzIGFuIGVycm9yIG1lc3NhZ2UgaWYgbXVsdGlwbGUgVU9NIGFyZSBwcmVzZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGEgRGF0YSBvZiB0aGUgVmlzdWFsRmlsdGVyIGNvbnRyb2xcblx0ICogQHBhcmFtIG9JbnRlcmFjdGl2ZUNoYXJ0IEludGVyYWN0aXZlQ2hhcnQgaW4gdGhlIFZpc3VhbEZpbHRlciBjb250cm9sXG5cdCAqIEBwYXJhbSBzSW5mb1BhdGggSW50ZXJuYWwgbW9kZWwgY29udGV4dCBwYXRoIHRvIHN0b3JlIGluZm8uXG5cdCAqIEBwYXJhbSBvUmVzb3VyY2VCdW5kbGUgVGhlIHJlc291cmNlIGJ1bmRsZVxuXHQgKiBAcGFyYW0gb1ZpZXcgSW5zdGFuY2Ugb2YgdGhlIHZpZXdcblx0ICovXG5cdHNldE11bHRpVU9NTWVzc2FnZTogZnVuY3Rpb24gKFxuXHRcdG9EYXRhOiBDb250ZXh0W10sXG5cdFx0b0ludGVyYWN0aXZlQ2hhcnQ6IGFueSxcblx0XHRzSW5mb1BhdGg6IHN0cmluZyxcblx0XHRvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLFxuXHRcdG9WaWV3OiBWaWV3XG5cdCkge1xuXHRcdGNvbnN0IHZVT00gPSBvSW50ZXJhY3RpdmVDaGFydC5kYXRhKFwidW9tXCIpO1xuXHRcdGNvbnN0IHNJc0N1cnJlbmN5ID0gdlVPTSAmJiB2VU9NW1wiSVNPQ3VycmVuY3lcIl0gJiYgdlVPTVtcIklTT0N1cnJlbmN5XCJdLiRQYXRoO1xuXHRcdGNvbnN0IHNJc1VuaXQgPSB2VU9NICYmIHZVT01bXCJVbml0XCJdICYmIHZVT01bXCJVbml0XCJdLiRQYXRoO1xuXHRcdGNvbnN0IHNVbml0ZmllbGQgPSBzSXNDdXJyZW5jeSB8fCBzSXNVbml0O1xuXHRcdGxldCBzMThuTWVzc2FnZVRpdGxlLCBzMThuTWVzc2FnZTtcblx0XHRpZiAoc1VuaXRmaWVsZCkge1xuXHRcdFx0aWYgKCF0aGlzLmNoZWNrTXVsaXRVbml0KG9EYXRhLCBzVW5pdGZpZWxkKSkge1xuXHRcdFx0XHRpZiAoc0lzQ3VycmVuY3kpIHtcblx0XHRcdFx0XHRzMThuTWVzc2FnZVRpdGxlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIik7XG5cdFx0XHRcdFx0czE4bk1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfTVVMVElQTEVfQ1VSUkVOQ1lcIiwgc1VuaXRmaWVsZCk7XG5cdFx0XHRcdFx0dGhpcy5hcHBseUVycm9yTWVzc2FnZUFuZFRpdGxlKHMxOG5NZXNzYWdlVGl0bGUsIHMxOG5NZXNzYWdlLCBzSW5mb1BhdGgsIG9WaWV3KTtcblx0XHRcdFx0XHRMb2cud2FybmluZyhgRmlsdGVyIGlzIHNldCBmb3IgbXVsdGlwbGUgQ3VycmVuY3kgZm9yJHtzVW5pdGZpZWxkfWApO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHNJc1VuaXQpIHtcblx0XHRcdFx0XHRzMThuTWVzc2FnZVRpdGxlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIik7XG5cdFx0XHRcdFx0czE4bk1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfTVVMVElQTEVfVU5JVFwiLCBzVW5pdGZpZWxkKTtcblx0XHRcdFx0XHR0aGlzLmFwcGx5RXJyb3JNZXNzYWdlQW5kVGl0bGUoczE4bk1lc3NhZ2VUaXRsZSwgczE4bk1lc3NhZ2UsIHNJbmZvUGF0aCwgb1ZpZXcpO1xuXHRcdFx0XHRcdExvZy53YXJuaW5nKGBGaWx0ZXIgaXMgc2V0IGZvciBtdWx0aXBsZSBVT01zIGZvciR7c1VuaXRmaWVsZH1gKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU2V0cyBhbiBlcnJvciBtZXNzYWdlIGlmIHJlc3BvbnNlIGRhdGEgaXMgZW1wdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBzSW5mb1BhdGggSW50ZXJuYWwgbW9kZWwgY29udGV4dCBwYXRoIHRvIHN0b3JlIGluZm8uXG5cdCAqIEBwYXJhbSBvUmVzb3VyY2VCdW5kbGUgVGhlIHJlc291cmNlIGJ1bmRsZVxuXHQgKiBAcGFyYW0gb1ZpZXcgSW5zdGFuY2Ugb2YgdGhlIHZpZXdcblx0ICovXG5cdHNldE5vRGF0YU1lc3NhZ2U6IGZ1bmN0aW9uIChzSW5mb1BhdGg6IHN0cmluZywgb1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSwgb1ZpZXc6IFZpZXcpIHtcblx0XHRjb25zdCBzMThuTWVzc2FnZVRpdGxlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIik7XG5cdFx0Y29uc3QgczE4bk1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUl9OT19EQVRBX1RFWFRcIik7XG5cdFx0dGhpcy5hcHBseUVycm9yTWVzc2FnZUFuZFRpdGxlKHMxOG5NZXNzYWdlVGl0bGUsIHMxOG5NZXNzYWdlLCBzSW5mb1BhdGgsIG9WaWV3KTtcblx0fSxcblx0Y29udmVydEZpbHRlckNvbmRpb25zOiBmdW5jdGlvbiAob0ZpbHRlckNvbmRpdGlvbnM6IGFueSkge1xuXHRcdGNvbnN0IG9Db252ZXJ0ZWRDb25kaXRpb25zOiBhbnkgPSB7fTtcblx0XHRPYmplY3Qua2V5cyhvRmlsdGVyQ29uZGl0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRjb25zdCBhQ29udmVydGVkQ29uZGl0aW9ucyA9IFtdO1xuXHRcdFx0Y29uc3QgYUNvbmRpdGlvbnMgPSBvRmlsdGVyQ29uZGl0aW9uc1tzS2V5XTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUNvbmRpdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3QgdmFsdWVzID0gYUNvbmRpdGlvbnNbaV0udmFsdWUyID8gW2FDb25kaXRpb25zW2ldLnZhbHVlMSwgYUNvbmRpdGlvbnNbaV0udmFsdWUyXSA6IFthQ29uZGl0aW9uc1tpXS52YWx1ZTFdO1xuXHRcdFx0XHRhQ29udmVydGVkQ29uZGl0aW9ucy5wdXNoKFxuXHRcdFx0XHRcdENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oYUNvbmRpdGlvbnNbaV0ub3BlcmF0b3IsIHZhbHVlcywgbnVsbCwgbnVsbCwgXCJWYWxpZGF0ZWRcIiBhcyBDb25kaXRpb25WYWxpZGF0ZWQpXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoYUNvbnZlcnRlZENvbmRpdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRcdG9Db252ZXJ0ZWRDb25kaXRpb25zW3NLZXldID0gYUNvbnZlcnRlZENvbmRpdGlvbnM7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG9Db252ZXJ0ZWRDb25kaXRpb25zO1xuXHR9LFxuXHRnZXRDdXN0b21Db25kaXRpb25zOiBmdW5jdGlvbiAoUmFuZ2U6IGFueSwgb1ZhbGlkUHJvcGVydHk6IGFueSwgc1Byb3BlcnR5TmFtZTogYW55KSB7XG5cdFx0bGV0IHZhbHVlMSwgdmFsdWUyO1xuXHRcdGlmIChvVmFsaWRQcm9wZXJ0eS4kVHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikge1xuXHRcdFx0dmFsdWUxID0gdGhpcy5fcGFyc2VEYXRlVGltZShnZXRUeXBlQ29tcGxpYW50VmFsdWUodGhpcy5fZm9ybWF0RGF0ZVRpbWUoUmFuZ2UuTG93KSwgb1ZhbGlkUHJvcGVydHkuJFR5cGUpKTtcblx0XHRcdHZhbHVlMiA9IFJhbmdlLkhpZ2ggPyB0aGlzLl9wYXJzZURhdGVUaW1lKGdldFR5cGVDb21wbGlhbnRWYWx1ZSh0aGlzLl9mb3JtYXREYXRlVGltZShSYW5nZS5IaWdoKSwgb1ZhbGlkUHJvcGVydHkuJFR5cGUpKSA6IG51bGw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhbHVlMSA9IFJhbmdlLkxvdztcblx0XHRcdHZhbHVlMiA9IFJhbmdlLkhpZ2ggPyBSYW5nZS5IaWdoIDogbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdG9wZXJhdG9yOiBSYW5nZS5PcHRpb24gPyBnZXRSYW5nZVByb3BlcnR5KFJhbmdlLk9wdGlvbi4kRW51bU1lbWJlciB8fCBSYW5nZS5PcHRpb24pIDogbnVsbCxcblx0XHRcdHZhbHVlMTogdmFsdWUxLFxuXHRcdFx0dmFsdWUyOiB2YWx1ZTIsXG5cdFx0XHRwYXRoOiBzUHJvcGVydHlOYW1lXG5cdFx0fTtcblx0fSxcblx0X3BhcnNlRGF0ZVRpbWU6IGZ1bmN0aW9uIChzVmFsdWU6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLl9nZXREYXRlVGltZVR5cGVJbnN0YW5jZSgpLnBhcnNlVmFsdWUoc1ZhbHVlLCBcInN0cmluZ1wiKTtcblx0fSxcblx0X2Zvcm1hdERhdGVUaW1lOiBmdW5jdGlvbiAoc1ZhbHVlOiBhbnkpIHtcblx0XHRyZXR1cm4gdGhpcy5fZ2V0RGF0ZVRpbWVUeXBlSW5zdGFuY2UoKS5mb3JtYXRWYWx1ZShzVmFsdWUsIFwic3RyaW5nXCIpO1xuXHR9LFxuXHRfZ2V0RGF0ZVRpbWVUeXBlSW5zdGFuY2U6IGZ1bmN0aW9uICgpIHtcblx0XHRyZXR1cm4gbmV3IERhdGVUaW1lT2Zmc2V0KHsgcGF0dGVybjogXCJ5eXl5LU1NLWRkVEhIOm1tOnNzWlwiLCBjYWxlbmRhclR5cGU6IFwiR3JlZ29yaWFuXCIgfSwgeyBWNDogdHJ1ZSB9KTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IGVycm9yIGluZm8gd2hlbiByZXF1aXJlZCBpblBhcmFtZXRlcnMgb3IgcmVxdWlyZWQgZmlsdGVycyBhcmUgbm90IGF2YWlsYWJsZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEVycm9ySW5mb0Zvck5vSW5pdGlhbE92ZXJsYXlcblx0ICogQHBhcmFtIG5vdE1hdGNoZWRDb25kaXRpb25zIFByb3BlcnR5IG5hbWVzKGluUGFyYW1ldGVycyBvciByZXF1aXJlZCBmaWx0ZXJzKSBmb3Igd2hpY2ggdmFsdWVzIGFyZSBub3QgYXZhaWxhYmxlIC5cblx0ICogQHBhcmFtIHJlc291cmNlQnVuZGxlIFJlc291cmNlQnVuZGxlIGZvciB0cmFuc2xhdGVkIHRleHRzLlxuXHQgKiBAcGFyYW0gZW50aXR5U2V0UGF0aCBFbnRpdHlTZXQgUGF0aCBmb3IgcHJvcGVydHkgbGFiZWwgYW5ub3RhdGlvbi5cblx0ICogQHBhcmFtIG1ldGFNb2RlbCBEZWZhdWx0IG1ldGFtb2RlbC5cblx0ICogQHJldHVybnMgRXJyb3IgaW5mbyBjb250YWluaW5nIHRleHRzIGZvciB0aXRsZSBhbmQgbWVzc2FnZS5cblx0ICovXG5cdGdldEVycm9ySW5mb0Zvck5vSW5pdGlhbE92ZXJsYXk6IGZ1bmN0aW9uIChcblx0XHRub3RNYXRjaGVkQ29uZGl0aW9uczogc3RyaW5nW10sXG5cdFx0cmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLFxuXHRcdGVudGl0eVNldFBhdGg6IHN0cmluZyxcblx0XHRtZXRhTW9kZWw6IE1ldGFNb2RlbFxuXHQpIHtcblx0XHRsZXQgcmV0O1xuXHRcdGlmIChub3RNYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGggPiAxKSB7XG5cdFx0XHRyZXQgPSB7XG5cdFx0XHRcdHNob3dFcnJvcjogdHJ1ZSxcblx0XHRcdFx0ZXJyb3JNZXNzYWdlVGl0bGU6IHJlc291cmNlQnVuZGxlLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIiksXG5cdFx0XHRcdGVycm9yTWVzc2FnZTogcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfUFJPVklERV9GSUxURVJfVkFMX01VTFRJUExFVkZcIilcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChub3RNYXRjaGVkQ29uZGl0aW9ucy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGNvbnN0IGxhYmVsID1cblx0XHRcdFx0KG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0UGF0aH0vJHtub3RNYXRjaGVkQ29uZGl0aW9uc1swXX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsYCkgYXMgc3RyaW5nKSB8fFxuXHRcdFx0XHRub3RNYXRjaGVkQ29uZGl0aW9uc1swXTtcblx0XHRcdHJldCA9IHtcblx0XHRcdFx0c2hvd0Vycm9yOiB0cnVlLFxuXHRcdFx0XHRlcnJvck1lc3NhZ2VUaXRsZTogcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUlNfRVJST1JfTUVTU0FHRV9USVRMRVwiKSxcblx0XHRcdFx0ZXJyb3JNZXNzYWdlOiByZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSU19QUk9WSURFX0ZJTFRFUl9WQUxfU0lOR0xFVkZcIiwgW2xhYmVsXSlcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiByZXQ7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZpc3VhbEZpbHRlclV0aWxzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7RUFhQSxNQUFNQSxpQkFBaUIsR0FBRztJQUN6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
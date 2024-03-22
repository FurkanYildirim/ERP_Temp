/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/strings/whitespaceReplacer", "sap/ui/core/Core", "sap/ui/core/format/DateFormat"], function (whitespaceReplacer, Core, DateFormat) {
  "use strict";

  var _exports = {};
  /**
   * Collection of table formatters.
   *
   * @param this The context
   * @param sName The inner function name
   * @param oArgs The inner function parameters
   * @returns The value from the inner function
   */
  const valueFormatters = function (sName) {
    if (valueFormatters.hasOwnProperty(sName)) {
      for (var _len = arguments.length, oArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        oArgs[_key - 1] = arguments[_key];
      }
      return valueFormatters[sName].apply(this, oArgs);
    } else {
      return "";
    }
  };
  const formatWithBrackets = (firstPart, secondPart) => {
    if (firstPart && secondPart) {
      return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [firstPart, secondPart]);
    } else {
      return firstPart || secondPart || "";
    }
  };
  formatWithBrackets.__functionName = "sap.fe.core.formatters.ValueFormatter#formatWithBrackets";
  const formatTitle = (firstPart, secondPart) => {
    return secondPart ? formatWithBrackets(whitespaceReplacer(firstPart), whitespaceReplacer(secondPart)) : whitespaceReplacer(firstPart);
  };
  formatTitle.__functionName = "sap.fe.core.formatters.ValueFormatter#formatTitle";
  const formatWithPercentage = sValue => {
    return sValue !== null && sValue !== undefined ? `${sValue} %` : "";
  };
  formatWithPercentage.__functionName = "sap.fe.core.formatters.ValueFormatter#formatWithPercentage";
  const computePercentage = (value, target, sUnit) => {
    let sPercentString;
    //BCP: 2370008548 If the base value is undefined return "0" by default
    if (value === undefined) {
      return "0";
    }
    const iValue = typeof value === "string" ? parseFloat(value) : value;
    const iTarget = typeof target === "string" ? parseFloat(target) : target;
    if (sUnit === "%") {
      if (iValue > 100) {
        sPercentString = "100";
      } else if (iValue <= 0) {
        sPercentString = "0";
      } else {
        sPercentString = typeof value === "string" ? value : value === null || value === void 0 ? void 0 : value.toString();
      }
    } else if (iValue > iTarget) {
      sPercentString = "100";
    } else if (iValue <= 0) {
      sPercentString = "0";
    } else {
      sPercentString = iValue && iTarget ? (iValue / iTarget * 100).toString() : "0";
    }
    return sPercentString;
  };
  computePercentage.__functionName = "sap.fe.core.formatters.ValueFormatter#computePercentage";
  const formatCriticalityIcon = val => {
    let sIcon;
    if (val === "UI.CriticalityType/Negative" || val === "1" || val === 1) {
      sIcon = "sap-icon://message-error";
    } else if (val === "UI.CriticalityType/Critical" || val === "2" || val === 2) {
      sIcon = "sap-icon://message-warning";
    } else if (val === "UI.CriticalityType/Positive" || val === "3" || val === 3) {
      sIcon = "sap-icon://message-success";
    } else if (val === "UI.CriticalityType/Information" || val === "5" || val === 5) {
      sIcon = "sap-icon://message-information";
    } else {
      sIcon = "";
    }
    return sIcon;
  };
  formatCriticalityIcon.__functionName = "sap.fe.core.formatters.ValueFormatter#formatCriticalityIcon";
  _exports.formatCriticalityIcon = formatCriticalityIcon;
  const formatCriticalityValueState = val => {
    let sValueState;
    if (val === "UI.CriticalityType/Negative" || val === "1" || val === 1) {
      sValueState = "Error";
    } else if (val === "UI.CriticalityType/Critical" || val === "2" || val === 2) {
      sValueState = "Warning";
    } else if (val === "UI.CriticalityType/Positive" || val === "3" || val === 3) {
      sValueState = "Success";
    } else if (val === "UI.CriticalityType/Information" || val === "5" || val === 5) {
      sValueState = "Information";
    } else {
      sValueState = "None";
    }
    return sValueState;
  };
  formatCriticalityValueState.__functionName = "sap.fe.core.formatters.ValueFormatter#formatCriticalityValueState";
  _exports.formatCriticalityValueState = formatCriticalityValueState;
  const formatCriticalityButtonType = val => {
    let sType;
    if (val === "UI.CriticalityType/Negative" || val === "1" || val === 1) {
      sType = "Reject";
    } else if (val === "UI.CriticalityType/Positive" || val === "3" || val === 3) {
      sType = "Accept";
    } else {
      sType = "Default";
    }
    return sType;
  };
  formatCriticalityButtonType.__functionName = "sap.fe.core.formatters.ValueFormatter#formatCriticalityButtonType";
  _exports.formatCriticalityButtonType = formatCriticalityButtonType;
  const formatCriticalityColorMicroChart = val => {
    let sColor;
    if (val === "UI.CriticalityType/Negative" || val === "1" || val === 1) {
      sColor = "Error";
    } else if (val === "UI.CriticalityType/Critical" || val === "2" || val === 2) {
      sColor = "Critical";
    } else if (val === "UI.CriticalityType/Positive" || val === "3" || val === 3) {
      sColor = "Good";
    } else {
      sColor = "Neutral";
    }
    return sColor;
  };
  formatCriticalityColorMicroChart.__functionName = "sap.fe.core.formatters.ValueFormatter#formatCriticalityColorMicroChart";
  _exports.formatCriticalityColorMicroChart = formatCriticalityColorMicroChart;
  const formatProgressIndicatorText = (value, target, unit) => {
    if (value && target && unit) {
      var _localeData$dateField, _localeData$units, _localeData$units$sho;
      const unitSplit = unit.split("-");
      const searchUnit = `${unitSplit[1] === undefined ? unit : unitSplit[1]}-narrow`;
      const dateFormat = DateFormat.getDateInstance();
      const localeData = dateFormat.oLocaleData.mData;
      const oResourceModel = Core.getLibraryResourceBundle("sap.fe.macros");
      let unitDisplayed = unit;
      if (localeData !== null && localeData !== void 0 && (_localeData$dateField = localeData.dateFields[searchUnit]) !== null && _localeData$dateField !== void 0 && _localeData$dateField.displayName) {
        unitDisplayed = localeData.dateFields[searchUnit].displayName;
      } else if (localeData !== null && localeData !== void 0 && (_localeData$units = localeData.units) !== null && _localeData$units !== void 0 && (_localeData$units$sho = _localeData$units.short[unit]) !== null && _localeData$units$sho !== void 0 && _localeData$units$sho.displayName) {
        unitDisplayed = localeData.units.short[unit].displayName;
      }
      return oResourceModel.getText("T_COMMON_PROGRESS_INDICATOR_DISPLAY_VALUE_WITH_UOM", [value, target, unitDisplayed]);
    }
  };
  formatProgressIndicatorText.__functionName = "sap.fe.core.formatters.ValueFormatter#formatProgressIndicatorText";
  _exports.formatProgressIndicatorText = formatProgressIndicatorText;
  const formatToKeepWhitespace = value => {
    return value === null || value === undefined ? "" : whitespaceReplacer(value + "");
  };
  formatToKeepWhitespace.__functionName = "sap.fe.core.formatters.ValueFormatter#formatToKeepWhitespace";
  _exports.formatToKeepWhitespace = formatToKeepWhitespace;
  valueFormatters.formatWithBrackets = formatWithBrackets;
  valueFormatters.formatTitle = formatTitle;
  valueFormatters.formatWithPercentage = formatWithPercentage;
  valueFormatters.computePercentage = computePercentage;
  valueFormatters.formatCriticalityIcon = formatCriticalityIcon;
  valueFormatters.formatCriticalityValueState = formatCriticalityValueState;
  valueFormatters.formatCriticalityButtonType = formatCriticalityButtonType;
  valueFormatters.formatCriticalityColorMicroChart = formatCriticalityColorMicroChart;
  valueFormatters.formatProgressIndicatorText = formatProgressIndicatorText;
  valueFormatters.formatToKeepWhitespace = formatToKeepWhitespace;
  /**
   * @global
   */
  return valueFormatters;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ2YWx1ZUZvcm1hdHRlcnMiLCJzTmFtZSIsImhhc093blByb3BlcnR5Iiwib0FyZ3MiLCJhcHBseSIsImZvcm1hdFdpdGhCcmFja2V0cyIsImZpcnN0UGFydCIsInNlY29uZFBhcnQiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZ2V0VGV4dCIsIl9fZnVuY3Rpb25OYW1lIiwiZm9ybWF0VGl0bGUiLCJ3aGl0ZXNwYWNlUmVwbGFjZXIiLCJmb3JtYXRXaXRoUGVyY2VudGFnZSIsInNWYWx1ZSIsInVuZGVmaW5lZCIsImNvbXB1dGVQZXJjZW50YWdlIiwidmFsdWUiLCJ0YXJnZXQiLCJzVW5pdCIsInNQZXJjZW50U3RyaW5nIiwiaVZhbHVlIiwicGFyc2VGbG9hdCIsImlUYXJnZXQiLCJ0b1N0cmluZyIsImZvcm1hdENyaXRpY2FsaXR5SWNvbiIsInZhbCIsInNJY29uIiwiZm9ybWF0Q3JpdGljYWxpdHlWYWx1ZVN0YXRlIiwic1ZhbHVlU3RhdGUiLCJmb3JtYXRDcml0aWNhbGl0eUJ1dHRvblR5cGUiLCJzVHlwZSIsImZvcm1hdENyaXRpY2FsaXR5Q29sb3JNaWNyb0NoYXJ0Iiwic0NvbG9yIiwiZm9ybWF0UHJvZ3Jlc3NJbmRpY2F0b3JUZXh0IiwidW5pdCIsInVuaXRTcGxpdCIsInNwbGl0Iiwic2VhcmNoVW5pdCIsImRhdGVGb3JtYXQiLCJEYXRlRm9ybWF0IiwiZ2V0RGF0ZUluc3RhbmNlIiwibG9jYWxlRGF0YSIsIm9Mb2NhbGVEYXRhIiwibURhdGEiLCJvUmVzb3VyY2VNb2RlbCIsInVuaXREaXNwbGF5ZWQiLCJkYXRlRmllbGRzIiwiZGlzcGxheU5hbWUiLCJ1bml0cyIsInNob3J0IiwiZm9ybWF0VG9LZWVwV2hpdGVzcGFjZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmFsdWVGb3JtYXR0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHdoaXRlc3BhY2VSZXBsYWNlciBmcm9tIFwic2FwL2Jhc2Uvc3RyaW5ncy93aGl0ZXNwYWNlUmVwbGFjZXJcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRGF0ZUZvcm1hdCBmcm9tIFwic2FwL3VpL2NvcmUvZm9ybWF0L0RhdGVGb3JtYXRcIjtcbi8qKlxuICogQ29sbGVjdGlvbiBvZiB0YWJsZSBmb3JtYXR0ZXJzLlxuICpcbiAqIEBwYXJhbSB0aGlzIFRoZSBjb250ZXh0XG4gKiBAcGFyYW0gc05hbWUgVGhlIGlubmVyIGZ1bmN0aW9uIG5hbWVcbiAqIEBwYXJhbSBvQXJncyBUaGUgaW5uZXIgZnVuY3Rpb24gcGFyYW1ldGVyc1xuICogQHJldHVybnMgVGhlIHZhbHVlIGZyb20gdGhlIGlubmVyIGZ1bmN0aW9uXG4gKi9cbmNvbnN0IHZhbHVlRm9ybWF0dGVycyA9IGZ1bmN0aW9uICh0aGlzOiBvYmplY3QsIHNOYW1lOiBzdHJpbmcsIC4uLm9BcmdzOiBhbnlbXSk6IGFueSB7XG5cdGlmICh2YWx1ZUZvcm1hdHRlcnMuaGFzT3duUHJvcGVydHkoc05hbWUpKSB7XG5cdFx0cmV0dXJuICh2YWx1ZUZvcm1hdHRlcnMgYXMgYW55KVtzTmFtZV0uYXBwbHkodGhpcywgb0FyZ3MpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIlwiO1xuXHR9XG59O1xuXG5jb25zdCBmb3JtYXRXaXRoQnJhY2tldHMgPSAoZmlyc3RQYXJ0Pzogc3RyaW5nLCBzZWNvbmRQYXJ0Pzogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0aWYgKGZpcnN0UGFydCAmJiBzZWNvbmRQYXJ0KSB7XG5cdFx0cmV0dXJuIENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIikuZ2V0VGV4dChcIkNfRk9STUFUX0ZPUl9URVhUX0FSUkFOR0VNRU5UXCIsIFtmaXJzdFBhcnQsIHNlY29uZFBhcnRdKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmlyc3RQYXJ0IHx8IHNlY29uZFBhcnQgfHwgXCJcIjtcblx0fVxufTtcbmZvcm1hdFdpdGhCcmFja2V0cy5fX2Z1bmN0aW9uTmFtZSA9IFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5WYWx1ZUZvcm1hdHRlciNmb3JtYXRXaXRoQnJhY2tldHNcIjtcblxuY29uc3QgZm9ybWF0VGl0bGUgPSAoZmlyc3RQYXJ0Pzogc3RyaW5nLCBzZWNvbmRQYXJ0Pzogc3RyaW5nKTogc3RyaW5nID0+IHtcblx0cmV0dXJuIHNlY29uZFBhcnQgPyBmb3JtYXRXaXRoQnJhY2tldHMod2hpdGVzcGFjZVJlcGxhY2VyKGZpcnN0UGFydCksIHdoaXRlc3BhY2VSZXBsYWNlcihzZWNvbmRQYXJ0KSkgOiB3aGl0ZXNwYWNlUmVwbGFjZXIoZmlyc3RQYXJ0KTtcbn07XG5mb3JtYXRUaXRsZS5fX2Z1bmN0aW9uTmFtZSA9IFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5WYWx1ZUZvcm1hdHRlciNmb3JtYXRUaXRsZVwiO1xuXG5jb25zdCBmb3JtYXRXaXRoUGVyY2VudGFnZSA9IChzVmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuXHRyZXR1cm4gc1ZhbHVlICE9PSBudWxsICYmIHNWYWx1ZSAhPT0gdW5kZWZpbmVkID8gYCR7c1ZhbHVlfSAlYCA6IFwiXCI7XG59O1xuZm9ybWF0V2l0aFBlcmNlbnRhZ2UuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVmFsdWVGb3JtYXR0ZXIjZm9ybWF0V2l0aFBlcmNlbnRhZ2VcIjtcblxuY29uc3QgY29tcHV0ZVBlcmNlbnRhZ2UgPSAodmFsdWU6IHN0cmluZyB8IG51bWJlciwgdGFyZ2V0OiBzdHJpbmcgfCBudW1iZXIsIHNVbml0Pzogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcblx0bGV0IHNQZXJjZW50U3RyaW5nOiBzdHJpbmc7XG5cdC8vQkNQOiAyMzcwMDA4NTQ4IElmIHRoZSBiYXNlIHZhbHVlIGlzIHVuZGVmaW5lZCByZXR1cm4gXCIwXCIgYnkgZGVmYXVsdFxuXHRpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBcIjBcIjtcblx0fVxuXG5cdGNvbnN0IGlWYWx1ZTogbnVtYmVyID0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiID8gcGFyc2VGbG9hdCh2YWx1ZSkgOiB2YWx1ZTtcblx0Y29uc3QgaVRhcmdldDogbnVtYmVyID0gdHlwZW9mIHRhcmdldCA9PT0gXCJzdHJpbmdcIiA/IHBhcnNlRmxvYXQodGFyZ2V0KSA6IHRhcmdldDtcblxuXHRpZiAoc1VuaXQgPT09IFwiJVwiKSB7XG5cdFx0aWYgKGlWYWx1ZSA+IDEwMCkge1xuXHRcdFx0c1BlcmNlbnRTdHJpbmcgPSBcIjEwMFwiO1xuXHRcdH0gZWxzZSBpZiAoaVZhbHVlIDw9IDApIHtcblx0XHRcdHNQZXJjZW50U3RyaW5nID0gXCIwXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNQZXJjZW50U3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiID8gdmFsdWUgOiB2YWx1ZT8udG9TdHJpbmcoKTtcblx0XHR9XG5cdH0gZWxzZSBpZiAoaVZhbHVlID4gaVRhcmdldCkge1xuXHRcdHNQZXJjZW50U3RyaW5nID0gXCIxMDBcIjtcblx0fSBlbHNlIGlmIChpVmFsdWUgPD0gMCkge1xuXHRcdHNQZXJjZW50U3RyaW5nID0gXCIwXCI7XG5cdH0gZWxzZSB7XG5cdFx0c1BlcmNlbnRTdHJpbmcgPSBpVmFsdWUgJiYgaVRhcmdldCA/ICgoaVZhbHVlIC8gaVRhcmdldCkgKiAxMDApLnRvU3RyaW5nKCkgOiBcIjBcIjtcblx0fVxuXHRyZXR1cm4gc1BlcmNlbnRTdHJpbmc7XG59O1xuY29tcHV0ZVBlcmNlbnRhZ2UuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVmFsdWVGb3JtYXR0ZXIjY29tcHV0ZVBlcmNlbnRhZ2VcIjtcblxuZXhwb3J0IGNvbnN0IGZvcm1hdENyaXRpY2FsaXR5SWNvbiA9ICh2YWw/OiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuXHRsZXQgc0ljb246IHN0cmluZztcblx0aWYgKHZhbCA9PT0gXCJVSS5Dcml0aWNhbGl0eVR5cGUvTmVnYXRpdmVcIiB8fCB2YWwgPT09IFwiMVwiIHx8IHZhbCA9PT0gMSkge1xuXHRcdHNJY29uID0gXCJzYXAtaWNvbjovL21lc3NhZ2UtZXJyb3JcIjtcblx0fSBlbHNlIGlmICh2YWwgPT09IFwiVUkuQ3JpdGljYWxpdHlUeXBlL0NyaXRpY2FsXCIgfHwgdmFsID09PSBcIjJcIiB8fCB2YWwgPT09IDIpIHtcblx0XHRzSWNvbiA9IFwic2FwLWljb246Ly9tZXNzYWdlLXdhcm5pbmdcIjtcblx0fSBlbHNlIGlmICh2YWwgPT09IFwiVUkuQ3JpdGljYWxpdHlUeXBlL1Bvc2l0aXZlXCIgfHwgdmFsID09PSBcIjNcIiB8fCB2YWwgPT09IDMpIHtcblx0XHRzSWNvbiA9IFwic2FwLWljb246Ly9tZXNzYWdlLXN1Y2Nlc3NcIjtcblx0fSBlbHNlIGlmICh2YWwgPT09IFwiVUkuQ3JpdGljYWxpdHlUeXBlL0luZm9ybWF0aW9uXCIgfHwgdmFsID09PSBcIjVcIiB8fCB2YWwgPT09IDUpIHtcblx0XHRzSWNvbiA9IFwic2FwLWljb246Ly9tZXNzYWdlLWluZm9ybWF0aW9uXCI7XG5cdH0gZWxzZSB7XG5cdFx0c0ljb24gPSBcIlwiO1xuXHR9XG5cdHJldHVybiBzSWNvbjtcbn07XG5mb3JtYXRDcml0aWNhbGl0eUljb24uX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVmFsdWVGb3JtYXR0ZXIjZm9ybWF0Q3JpdGljYWxpdHlJY29uXCI7XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRDcml0aWNhbGl0eVZhbHVlU3RhdGUgPSAodmFsPzogc3RyaW5nIHwgbnVtYmVyKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcblx0bGV0IHNWYWx1ZVN0YXRlOiBzdHJpbmc7XG5cdGlmICh2YWwgPT09IFwiVUkuQ3JpdGljYWxpdHlUeXBlL05lZ2F0aXZlXCIgfHwgdmFsID09PSBcIjFcIiB8fCB2YWwgPT09IDEpIHtcblx0XHRzVmFsdWVTdGF0ZSA9IFwiRXJyb3JcIjtcblx0fSBlbHNlIGlmICh2YWwgPT09IFwiVUkuQ3JpdGljYWxpdHlUeXBlL0NyaXRpY2FsXCIgfHwgdmFsID09PSBcIjJcIiB8fCB2YWwgPT09IDIpIHtcblx0XHRzVmFsdWVTdGF0ZSA9IFwiV2FybmluZ1wiO1xuXHR9IGVsc2UgaWYgKHZhbCA9PT0gXCJVSS5Dcml0aWNhbGl0eVR5cGUvUG9zaXRpdmVcIiB8fCB2YWwgPT09IFwiM1wiIHx8IHZhbCA9PT0gMykge1xuXHRcdHNWYWx1ZVN0YXRlID0gXCJTdWNjZXNzXCI7XG5cdH0gZWxzZSBpZiAodmFsID09PSBcIlVJLkNyaXRpY2FsaXR5VHlwZS9JbmZvcm1hdGlvblwiIHx8IHZhbCA9PT0gXCI1XCIgfHwgdmFsID09PSA1KSB7XG5cdFx0c1ZhbHVlU3RhdGUgPSBcIkluZm9ybWF0aW9uXCI7XG5cdH0gZWxzZSB7XG5cdFx0c1ZhbHVlU3RhdGUgPSBcIk5vbmVcIjtcblx0fVxuXHRyZXR1cm4gc1ZhbHVlU3RhdGU7XG59O1xuZm9ybWF0Q3JpdGljYWxpdHlWYWx1ZVN0YXRlLl9fZnVuY3Rpb25OYW1lID0gXCJzYXAuZmUuY29yZS5mb3JtYXR0ZXJzLlZhbHVlRm9ybWF0dGVyI2Zvcm1hdENyaXRpY2FsaXR5VmFsdWVTdGF0ZVwiO1xuXG5leHBvcnQgY29uc3QgZm9ybWF0Q3JpdGljYWxpdHlCdXR0b25UeXBlID0gKHZhbD86IHN0cmluZyB8IG51bWJlcik6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG5cdGxldCBzVHlwZTogc3RyaW5nO1xuXHRpZiAodmFsID09PSBcIlVJLkNyaXRpY2FsaXR5VHlwZS9OZWdhdGl2ZVwiIHx8IHZhbCA9PT0gXCIxXCIgfHwgdmFsID09PSAxKSB7XG5cdFx0c1R5cGUgPSBcIlJlamVjdFwiO1xuXHR9IGVsc2UgaWYgKHZhbCA9PT0gXCJVSS5Dcml0aWNhbGl0eVR5cGUvUG9zaXRpdmVcIiB8fCB2YWwgPT09IFwiM1wiIHx8IHZhbCA9PT0gMykge1xuXHRcdHNUeXBlID0gXCJBY2NlcHRcIjtcblx0fSBlbHNlIHtcblx0XHRzVHlwZSA9IFwiRGVmYXVsdFwiO1xuXHR9XG5cdHJldHVybiBzVHlwZTtcbn07XG5mb3JtYXRDcml0aWNhbGl0eUJ1dHRvblR5cGUuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVmFsdWVGb3JtYXR0ZXIjZm9ybWF0Q3JpdGljYWxpdHlCdXR0b25UeXBlXCI7XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRDcml0aWNhbGl0eUNvbG9yTWljcm9DaGFydCA9ICh2YWw/OiBzdHJpbmcgfCBudW1iZXIpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuXHRsZXQgc0NvbG9yOiBzdHJpbmc7XG5cdGlmICh2YWwgPT09IFwiVUkuQ3JpdGljYWxpdHlUeXBlL05lZ2F0aXZlXCIgfHwgdmFsID09PSBcIjFcIiB8fCB2YWwgPT09IDEpIHtcblx0XHRzQ29sb3IgPSBcIkVycm9yXCI7XG5cdH0gZWxzZSBpZiAodmFsID09PSBcIlVJLkNyaXRpY2FsaXR5VHlwZS9Dcml0aWNhbFwiIHx8IHZhbCA9PT0gXCIyXCIgfHwgdmFsID09PSAyKSB7XG5cdFx0c0NvbG9yID0gXCJDcml0aWNhbFwiO1xuXHR9IGVsc2UgaWYgKHZhbCA9PT0gXCJVSS5Dcml0aWNhbGl0eVR5cGUvUG9zaXRpdmVcIiB8fCB2YWwgPT09IFwiM1wiIHx8IHZhbCA9PT0gMykge1xuXHRcdHNDb2xvciA9IFwiR29vZFwiO1xuXHR9IGVsc2Uge1xuXHRcdHNDb2xvciA9IFwiTmV1dHJhbFwiO1xuXHR9XG5cdHJldHVybiBzQ29sb3I7XG59O1xuZm9ybWF0Q3JpdGljYWxpdHlDb2xvck1pY3JvQ2hhcnQuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuVmFsdWVGb3JtYXR0ZXIjZm9ybWF0Q3JpdGljYWxpdHlDb2xvck1pY3JvQ2hhcnRcIjtcblxuZXhwb3J0IGNvbnN0IGZvcm1hdFByb2dyZXNzSW5kaWNhdG9yVGV4dCA9ICh2YWx1ZTogYW55LCB0YXJnZXQ6IGFueSwgdW5pdDogYW55KTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcblx0aWYgKHZhbHVlICYmIHRhcmdldCAmJiB1bml0KSB7XG5cdFx0Y29uc3QgdW5pdFNwbGl0ID0gdW5pdC5zcGxpdChcIi1cIik7XG5cdFx0Y29uc3Qgc2VhcmNoVW5pdCA9IGAke3VuaXRTcGxpdFsxXSA9PT0gdW5kZWZpbmVkID8gdW5pdCA6IHVuaXRTcGxpdFsxXX0tbmFycm93YDtcblx0XHRjb25zdCBkYXRlRm9ybWF0ID0gRGF0ZUZvcm1hdC5nZXREYXRlSW5zdGFuY2UoKSBhcyBhbnk7XG5cdFx0Y29uc3QgbG9jYWxlRGF0YSA9IGRhdGVGb3JtYXQub0xvY2FsZURhdGEubURhdGE7XG5cdFx0Y29uc3Qgb1Jlc291cmNlTW9kZWwgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cdFx0bGV0IHVuaXREaXNwbGF5ZWQgPSB1bml0O1xuXHRcdGlmIChsb2NhbGVEYXRhPy5kYXRlRmllbGRzW3NlYXJjaFVuaXRdPy5kaXNwbGF5TmFtZSkge1xuXHRcdFx0dW5pdERpc3BsYXllZCA9IGxvY2FsZURhdGEuZGF0ZUZpZWxkc1tzZWFyY2hVbml0XS5kaXNwbGF5TmFtZTtcblx0XHR9IGVsc2UgaWYgKGxvY2FsZURhdGE/LnVuaXRzPy5zaG9ydFt1bml0XT8uZGlzcGxheU5hbWUpIHtcblx0XHRcdHVuaXREaXNwbGF5ZWQgPSBsb2NhbGVEYXRhLnVuaXRzLnNob3J0W3VuaXRdLmRpc3BsYXlOYW1lO1xuXHRcdH1cblxuXHRcdHJldHVybiBvUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiVF9DT01NT05fUFJPR1JFU1NfSU5ESUNBVE9SX0RJU1BMQVlfVkFMVUVfV0lUSF9VT01cIiwgW3ZhbHVlLCB0YXJnZXQsIHVuaXREaXNwbGF5ZWRdKTtcblx0fVxufTtcbmZvcm1hdFByb2dyZXNzSW5kaWNhdG9yVGV4dC5fX2Z1bmN0aW9uTmFtZSA9IFwic2FwLmZlLmNvcmUuZm9ybWF0dGVycy5WYWx1ZUZvcm1hdHRlciNmb3JtYXRQcm9ncmVzc0luZGljYXRvclRleHRcIjtcblxuZXhwb3J0IGNvbnN0IGZvcm1hdFRvS2VlcFdoaXRlc3BhY2UgPSAodmFsdWU6IHN0cmluZyB8IGJvb2xlYW4gfCBudW1iZXIpOiBzdHJpbmcgPT4ge1xuXHRyZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCA/IFwiXCIgOiB3aGl0ZXNwYWNlUmVwbGFjZXIodmFsdWUgKyBcIlwiKTtcbn07XG5mb3JtYXRUb0tlZXBXaGl0ZXNwYWNlLl9fZnVuY3Rpb25OYW1lID0gXCJzYXAuZmUuY29yZS5mb3JtYXR0ZXJzLlZhbHVlRm9ybWF0dGVyI2Zvcm1hdFRvS2VlcFdoaXRlc3BhY2VcIjtcblxudmFsdWVGb3JtYXR0ZXJzLmZvcm1hdFdpdGhCcmFja2V0cyA9IGZvcm1hdFdpdGhCcmFja2V0cztcbnZhbHVlRm9ybWF0dGVycy5mb3JtYXRUaXRsZSA9IGZvcm1hdFRpdGxlO1xudmFsdWVGb3JtYXR0ZXJzLmZvcm1hdFdpdGhQZXJjZW50YWdlID0gZm9ybWF0V2l0aFBlcmNlbnRhZ2U7XG52YWx1ZUZvcm1hdHRlcnMuY29tcHV0ZVBlcmNlbnRhZ2UgPSBjb21wdXRlUGVyY2VudGFnZTtcbnZhbHVlRm9ybWF0dGVycy5mb3JtYXRDcml0aWNhbGl0eUljb24gPSBmb3JtYXRDcml0aWNhbGl0eUljb247XG52YWx1ZUZvcm1hdHRlcnMuZm9ybWF0Q3JpdGljYWxpdHlWYWx1ZVN0YXRlID0gZm9ybWF0Q3JpdGljYWxpdHlWYWx1ZVN0YXRlO1xudmFsdWVGb3JtYXR0ZXJzLmZvcm1hdENyaXRpY2FsaXR5QnV0dG9uVHlwZSA9IGZvcm1hdENyaXRpY2FsaXR5QnV0dG9uVHlwZTtcbnZhbHVlRm9ybWF0dGVycy5mb3JtYXRDcml0aWNhbGl0eUNvbG9yTWljcm9DaGFydCA9IGZvcm1hdENyaXRpY2FsaXR5Q29sb3JNaWNyb0NoYXJ0O1xudmFsdWVGb3JtYXR0ZXJzLmZvcm1hdFByb2dyZXNzSW5kaWNhdG9yVGV4dCA9IGZvcm1hdFByb2dyZXNzSW5kaWNhdG9yVGV4dDtcbnZhbHVlRm9ybWF0dGVycy5mb3JtYXRUb0tlZXBXaGl0ZXNwYWNlID0gZm9ybWF0VG9LZWVwV2hpdGVzcGFjZTtcbi8qKlxuICogQGdsb2JhbFxuICovXG5leHBvcnQgZGVmYXVsdCB2YWx1ZUZvcm1hdHRlcnM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLE1BQU1BLGVBQWUsR0FBRyxVQUF3QkMsS0FBYSxFQUF3QjtJQUNwRixJQUFJRCxlQUFlLENBQUNFLGNBQWMsQ0FBQ0QsS0FBSyxDQUFDLEVBQUU7TUFBQSxrQ0FEc0JFLEtBQUs7UUFBTEEsS0FBSztNQUFBO01BRXJFLE9BQVFILGVBQWUsQ0FBU0MsS0FBSyxDQUFDLENBQUNHLEtBQUssQ0FBQyxJQUFJLEVBQUVELEtBQUssQ0FBQztJQUMxRCxDQUFDLE1BQU07TUFDTixPQUFPLEVBQUU7SUFDVjtFQUNELENBQUM7RUFFRCxNQUFNRSxrQkFBa0IsR0FBRyxDQUFDQyxTQUFrQixFQUFFQyxVQUFtQixLQUFhO0lBQy9FLElBQUlELFNBQVMsSUFBSUMsVUFBVSxFQUFFO01BQzVCLE9BQU9DLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxDQUFDLENBQUNDLE9BQU8sQ0FBQywrQkFBK0IsRUFBRSxDQUFDSixTQUFTLEVBQUVDLFVBQVUsQ0FBQyxDQUFDO0lBQ3RILENBQUMsTUFBTTtNQUNOLE9BQU9ELFNBQVMsSUFBSUMsVUFBVSxJQUFJLEVBQUU7SUFDckM7RUFDRCxDQUFDO0VBQ0RGLGtCQUFrQixDQUFDTSxjQUFjLEdBQUcsMERBQTBEO0VBRTlGLE1BQU1DLFdBQVcsR0FBRyxDQUFDTixTQUFrQixFQUFFQyxVQUFtQixLQUFhO0lBQ3hFLE9BQU9BLFVBQVUsR0FBR0Ysa0JBQWtCLENBQUNRLGtCQUFrQixDQUFDUCxTQUFTLENBQUMsRUFBRU8sa0JBQWtC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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit"], function (BindingToolkit) {
  "use strict";

  var _exports = {};
  var or = BindingToolkit.or;
  var isConstant = BindingToolkit.isConstant;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  /**
   * Create the binding expression to check if the property is read only or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's read only
   */
  const isReadOnlyExpression = function (oTarget, relativePath) {
    var _oTarget$annotations, _oTarget$annotations$, _oTarget$annotations$2;
    const oFieldControlValue = oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$annotations = oTarget.annotations) === null || _oTarget$annotations === void 0 ? void 0 : (_oTarget$annotations$ = _oTarget$annotations.Common) === null || _oTarget$annotations$ === void 0 ? void 0 : (_oTarget$annotations$2 = _oTarget$annotations$.FieldControl) === null || _oTarget$annotations$2 === void 0 ? void 0 : _oTarget$annotations$2.valueOf();
    if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
      return or(equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 1), equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "1"));
    }
    return constant(oFieldControlValue === "Common.FieldControlType/ReadOnly");
  };

  /**
   * Create the binding expression to check if the property is disabled or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's disabled
   */
  _exports.isReadOnlyExpression = isReadOnlyExpression;
  const isDisabledExpression = function (oTarget, relativePath) {
    var _oTarget$annotations2, _oTarget$annotations3, _oTarget$annotations4;
    const oFieldControlValue = oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$annotations2 = oTarget.annotations) === null || _oTarget$annotations2 === void 0 ? void 0 : (_oTarget$annotations3 = _oTarget$annotations2.Common) === null || _oTarget$annotations3 === void 0 ? void 0 : (_oTarget$annotations4 = _oTarget$annotations3.FieldControl) === null || _oTarget$annotations4 === void 0 ? void 0 : _oTarget$annotations4.valueOf();
    if (typeof oFieldControlValue === "object" && !!oFieldControlValue) {
      return or(equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), 0), equal(getExpressionFromAnnotation(oFieldControlValue, relativePath), "0"));
    }
    return constant(oFieldControlValue === "Common.FieldControlType/Inapplicable");
  };

  /**
   * Create the binding expression to check if the property is editable or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's not editable
   */
  _exports.isDisabledExpression = isDisabledExpression;
  const isNonEditableExpression = function (oTarget, relativePath) {
    return or(isReadOnlyExpression(oTarget, relativePath), isDisabledExpression(oTarget, relativePath));
  };

  /**
   * Create the binding expression to check if the property is read only or not.
   *
   * @param oTarget The target property or DataField
   * @param relativePath Array of navigation properties pointing to the location of field control property
   * @returns The binding expression resolving to a Boolean being true if it's read only
   */
  _exports.isNonEditableExpression = isNonEditableExpression;
  const isRequiredExpression = function (oTarget, relativePath) {
    var _oTarget$annotations5, _oTarget$annotations6, _oTarget$annotations7;
    const oFieldControlValue = (_oTarget$annotations5 = oTarget.annotations) === null || _oTarget$annotations5 === void 0 ? void 0 : (_oTarget$annotations6 = _oTarget$annotations5.Common) === null || _oTarget$annotations6 === void 0 ? void 0 : (_oTarget$annotations7 = _oTarget$annotations6.FieldControl) === null || _oTarget$annotations7 === void 0 ? void 0 : _oTarget$annotations7.valueOf();
    const fieldControlValue = getExpressionFromAnnotation(oFieldControlValue, relativePath);
    return or(isConstant(fieldControlValue) && equal(fieldControlValue, "Common.FieldControlType/Mandatory"), equal(fieldControlValue, 7), equal(fieldControlValue, "7"));
  };
  _exports.isRequiredExpression = isRequiredExpression;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc1JlYWRPbmx5RXhwcmVzc2lvbiIsIm9UYXJnZXQiLCJyZWxhdGl2ZVBhdGgiLCJvRmllbGRDb250cm9sVmFsdWUiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIkZpZWxkQ29udHJvbCIsInZhbHVlT2YiLCJvciIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiY29uc3RhbnQiLCJpc0Rpc2FibGVkRXhwcmVzc2lvbiIsImlzTm9uRWRpdGFibGVFeHByZXNzaW9uIiwiaXNSZXF1aXJlZEV4cHJlc3Npb24iLCJmaWVsZENvbnRyb2xWYWx1ZSIsImlzQ29uc3RhbnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkQ29udHJvbEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFjdGlvblBhcmFtZXRlciwgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbnN0YW50LCBlcXVhbCwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLCBpc0NvbnN0YW50LCBvciB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gY2hlY2sgaWYgdGhlIHByb3BlcnR5IGlzIHJlYWQgb25seSBvciBub3QuXG4gKlxuICogQHBhcmFtIG9UYXJnZXQgVGhlIHRhcmdldCBwcm9wZXJ0eSBvciBEYXRhRmllbGRcbiAqIEBwYXJhbSByZWxhdGl2ZVBhdGggQXJyYXkgb2YgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIHBvaW50aW5nIHRvIHRoZSBsb2NhdGlvbiBvZiBmaWVsZCBjb250cm9sIHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIHJlc29sdmluZyB0byBhIEJvb2xlYW4gYmVpbmcgdHJ1ZSBpZiBpdCdzIHJlYWQgb25seVxuICovXG5leHBvcnQgY29uc3QgaXNSZWFkT25seUV4cHJlc3Npb24gPSBmdW5jdGlvbiAob1RhcmdldDogUHJvcGVydHkgfCB1bmRlZmluZWQsIHJlbGF0aXZlUGF0aD86IHN0cmluZ1tdKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0Y29uc3Qgb0ZpZWxkQ29udHJvbFZhbHVlID0gb1RhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uRmllbGRDb250cm9sPy52YWx1ZU9mKCk7XG5cdGlmICh0eXBlb2Ygb0ZpZWxkQ29udHJvbFZhbHVlID09PSBcIm9iamVjdFwiICYmICEhb0ZpZWxkQ29udHJvbFZhbHVlKSB7XG5cdFx0cmV0dXJuIG9yKFxuXHRcdFx0ZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9GaWVsZENvbnRyb2xWYWx1ZSwgcmVsYXRpdmVQYXRoKSwgMSksXG5cdFx0XHRlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0ZpZWxkQ29udHJvbFZhbHVlLCByZWxhdGl2ZVBhdGgpLCBcIjFcIilcblx0XHQpO1xuXHR9XG5cdHJldHVybiBjb25zdGFudChvRmllbGRDb250cm9sVmFsdWUgPT09IFwiQ29tbW9uLkZpZWxkQ29udHJvbFR5cGUvUmVhZE9ubHlcIik7XG59O1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGNoZWNrIGlmIHRoZSBwcm9wZXJ0eSBpcyBkaXNhYmxlZCBvciBub3QuXG4gKlxuICogQHBhcmFtIG9UYXJnZXQgVGhlIHRhcmdldCBwcm9wZXJ0eSBvciBEYXRhRmllbGRcbiAqIEBwYXJhbSByZWxhdGl2ZVBhdGggQXJyYXkgb2YgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIHBvaW50aW5nIHRvIHRoZSBsb2NhdGlvbiBvZiBmaWVsZCBjb250cm9sIHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIHJlc29sdmluZyB0byBhIEJvb2xlYW4gYmVpbmcgdHJ1ZSBpZiBpdCdzIGRpc2FibGVkXG4gKi9cbmV4cG9ydCBjb25zdCBpc0Rpc2FibGVkRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChvVGFyZ2V0OiBQcm9wZXJ0eSwgcmVsYXRpdmVQYXRoPzogc3RyaW5nW10pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBvRmllbGRDb250cm9sVmFsdWUgPSBvVGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5GaWVsZENvbnRyb2w/LnZhbHVlT2YoKTtcblx0aWYgKHR5cGVvZiBvRmllbGRDb250cm9sVmFsdWUgPT09IFwib2JqZWN0XCIgJiYgISFvRmllbGRDb250cm9sVmFsdWUpIHtcblx0XHRyZXR1cm4gb3IoXG5cdFx0XHRlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0ZpZWxkQ29udHJvbFZhbHVlLCByZWxhdGl2ZVBhdGgpLCAwKSxcblx0XHRcdGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRmllbGRDb250cm9sVmFsdWUsIHJlbGF0aXZlUGF0aCksIFwiMFwiKVxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIGNvbnN0YW50KG9GaWVsZENvbnRyb2xWYWx1ZSA9PT0gXCJDb21tb24uRmllbGRDb250cm9sVHlwZS9JbmFwcGxpY2FibGVcIik7XG59O1xuXG4vKipcbiAqIENyZWF0ZSB0aGUgYmluZGluZyBleHByZXNzaW9uIHRvIGNoZWNrIGlmIHRoZSBwcm9wZXJ0eSBpcyBlZGl0YWJsZSBvciBub3QuXG4gKlxuICogQHBhcmFtIG9UYXJnZXQgVGhlIHRhcmdldCBwcm9wZXJ0eSBvciBEYXRhRmllbGRcbiAqIEBwYXJhbSByZWxhdGl2ZVBhdGggQXJyYXkgb2YgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIHBvaW50aW5nIHRvIHRoZSBsb2NhdGlvbiBvZiBmaWVsZCBjb250cm9sIHByb3BlcnR5XG4gKiBAcmV0dXJucyBUaGUgYmluZGluZyBleHByZXNzaW9uIHJlc29sdmluZyB0byBhIEJvb2xlYW4gYmVpbmcgdHJ1ZSBpZiBpdCdzIG5vdCBlZGl0YWJsZVxuICovXG5leHBvcnQgY29uc3QgaXNOb25FZGl0YWJsZUV4cHJlc3Npb24gPSBmdW5jdGlvbiAob1RhcmdldDogUHJvcGVydHksIHJlbGF0aXZlUGF0aD86IHN0cmluZ1tdKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0cmV0dXJuIG9yKGlzUmVhZE9ubHlFeHByZXNzaW9uKG9UYXJnZXQsIHJlbGF0aXZlUGF0aCksIGlzRGlzYWJsZWRFeHByZXNzaW9uKG9UYXJnZXQsIHJlbGF0aXZlUGF0aCkpO1xufTtcblxuLyoqXG4gKiBDcmVhdGUgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiB0byBjaGVjayBpZiB0aGUgcHJvcGVydHkgaXMgcmVhZCBvbmx5IG9yIG5vdC5cbiAqXG4gKiBAcGFyYW0gb1RhcmdldCBUaGUgdGFyZ2V0IHByb3BlcnR5IG9yIERhdGFGaWVsZFxuICogQHBhcmFtIHJlbGF0aXZlUGF0aCBBcnJheSBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgcG9pbnRpbmcgdG8gdGhlIGxvY2F0aW9uIG9mIGZpZWxkIGNvbnRyb2wgcHJvcGVydHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gcmVzb2x2aW5nIHRvIGEgQm9vbGVhbiBiZWluZyB0cnVlIGlmIGl0J3MgcmVhZCBvbmx5XG4gKi9cbmV4cG9ydCBjb25zdCBpc1JlcXVpcmVkRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChcblx0b1RhcmdldDogUHJvcGVydHkgfCBBY3Rpb25QYXJhbWV0ZXIsXG5cdHJlbGF0aXZlUGF0aD86IHN0cmluZ1tdXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRjb25zdCBvRmllbGRDb250cm9sVmFsdWUgPSBvVGFyZ2V0LmFubm90YXRpb25zPy5Db21tb24/LkZpZWxkQ29udHJvbD8udmFsdWVPZigpO1xuXHRjb25zdCBmaWVsZENvbnRyb2xWYWx1ZSA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihvRmllbGRDb250cm9sVmFsdWUsIHJlbGF0aXZlUGF0aCk7XG5cdHJldHVybiBvcihcblx0XHRpc0NvbnN0YW50KGZpZWxkQ29udHJvbFZhbHVlKSAmJiBlcXVhbChmaWVsZENvbnRyb2xWYWx1ZSwgXCJDb21tb24uRmllbGRDb250cm9sVHlwZS9NYW5kYXRvcnlcIiksXG5cdFx0ZXF1YWwoZmllbGRDb250cm9sVmFsdWUsIDcpLFxuXHRcdGVxdWFsKGZpZWxkQ29udHJvbFZhbHVlLCBcIjdcIilcblx0KTtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7RUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLE1BQU1BLG9CQUFvQixHQUFHLFVBQVVDLE9BQTZCLEVBQUVDLFlBQXVCLEVBQXFDO0lBQUE7SUFDeEksTUFBTUMsa0JBQWtCLEdBQUdGLE9BQU8sYUFBUEEsT0FBTywrQ0FBUEEsT0FBTyxDQUFFRyxXQUFXLGtGQUFwQixxQkFBc0JDLE1BQU0sb0ZBQTVCLHNCQUE4QkMsWUFBWSwyREFBMUMsdUJBQTRDQyxPQUFPLEVBQUU7SUFDaEYsSUFBSSxPQUFPSixrQkFBa0IsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDQSxrQkFBa0IsRUFBRTtNQUNuRSxPQUFPSyxFQUFFLENBQ1JDLEtBQUssQ0FBQ0MsMkJBQTJCLENBQUNQLGtCQUFrQixFQUFFRCxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDdkVPLEtBQUssQ0FBQ0MsMkJBQTJCLENBQUNQLGtCQUFrQixFQUFFRCxZQUFZLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FDekU7SUFDRjtJQUNBLE9BQU9TLFFBQVEsQ0FBQ1Isa0JBQWtCLEtBQUssa0NBQWtDLENBQUM7RUFDM0UsQ0FBQzs7RUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BO0VBT08sTUFBTVMsb0JBQW9CLEdBQUcsVUFBVVgsT0FBaUIsRUFBRUMsWUFBdUIsRUFBcUM7SUFBQTtJQUM1SCxNQUFNQyxrQkFBa0IsR0FBR0YsT0FBTyxhQUFQQSxPQUFPLGdEQUFQQSxPQUFPLENBQUVHLFdBQVcsbUZBQXBCLHNCQUFzQkMsTUFBTSxtRkFBNUIsc0JBQThCQyxZQUFZLDBEQUExQyxzQkFBNENDLE9BQU8sRUFBRTtJQUNoRixJQUFJLE9BQU9KLGtCQUFrQixLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUNBLGtCQUFrQixFQUFFO01BQ25FLE9BQU9LLEVBQUUsQ0FDUkMsS0FBSyxDQUFDQywyQkFBMkIsQ0FBQ1Asa0JBQWtCLEVBQUVELFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUN2RU8sS0FBSyxDQUFDQywyQkFBMkIsQ0FBQ1Asa0JBQWtCLEVBQUVELFlBQVksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUN6RTtJQUNGO0lBQ0EsT0FBT1MsUUFBUSxDQUFDUixrQkFBa0IsS0FBSyxzQ0FBc0MsQ0FBQztFQUMvRSxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkE7RUFPTyxNQUFNVSx1QkFBdUIsR0FBRyxVQUFVWixPQUFpQixFQUFFQyxZQUF1QixFQUFxQztJQUMvSCxPQUFPTSxFQUFFLENBQUNSLG9CQUFvQixDQUFDQyxPQUFPLEVBQUVDLFlBQVksQ0FBQyxFQUFFVSxvQkFBb0IsQ0FBQ1gsT0FBTyxFQUFFQyxZQUFZLENBQUMsQ0FBQztFQUNwRyxDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkE7RUFPTyxNQUFNWSxvQkFBb0IsR0FBRyxVQUNuQ2IsT0FBbUMsRUFDbkNDLFlBQXVCLEVBQ2E7SUFBQTtJQUNwQyxNQUFNQyxrQkFBa0IsNEJBQUdGLE9BQU8sQ0FBQ0csV0FBVyxtRkFBbkIsc0JBQXFCQyxNQUFNLG1GQUEzQixzQkFBNkJDLFlBQVksMERBQXpDLHNCQUEyQ0MsT0FBTyxFQUFFO0lBQy9FLE1BQU1RLGlCQUFpQixHQUFHTCwyQkFBMkIsQ0FBQ1Asa0JBQWtCLEVBQUVELFlBQVksQ0FBQztJQUN2RixPQUFPTSxFQUFFLENBQ1JRLFVBQVUsQ0FBQ0QsaUJBQWlCLENBQUMsSUFBSU4sS0FBSyxDQUFDTSxpQkFBaUIsRUFBRSxtQ0FBbUMsQ0FBQyxFQUM5Rk4sS0FBSyxDQUFDTSxpQkFBaUIsRUFBRSxDQUFDLENBQUMsRUFDM0JOLEtBQUssQ0FBQ00saUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQzdCO0VBQ0YsQ0FBQztFQUFDO0VBQUE7QUFBQSJ9
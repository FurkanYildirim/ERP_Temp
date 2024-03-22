/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/macros/table/delegates/TableDelegate"], function (CommonUtils, TableDelegate) {
  "use strict";

  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * This class is experimental and not intended for productive usage, since the API/behavior has not been finalized.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69.0
   * @alias sap.fe.macros.TableDelegate
   */
  const TreeTableDelegate = Object.assign({}, TableDelegate, {
    apiVersion: 2,
    _internalUpdateBindingInfo: function (table, bindingInfo) {
      var _bindingInfo$paramete;
      TableDelegate._internalUpdateBindingInfo.apply(this, [table, bindingInfo]);
      const payload = table.getPayload();
      bindingInfo.parameters.$$aggregation = {
        ...bindingInfo.parameters.$$aggregation,
        ...{
          hierarchyQualifier: payload === null || payload === void 0 ? void 0 : payload.hierarchyQualifier
        },
        // Setting the expandTo parameter to a high value forces the treeTable to expand all nodes when the search is applied
        ...{
          expandTo: (_bindingInfo$paramete = bindingInfo.parameters.$$aggregation) !== null && _bindingInfo$paramete !== void 0 && _bindingInfo$paramete.search ? 100 : payload === null || payload === void 0 ? void 0 : payload.initialExpansionLevel
        }
      };
    },
    updateBindingInfoWithSearchQuery: function (bindingInfo, filterInfo, filter) {
      bindingInfo.filters = filter;
      if (filterInfo.search) {
        bindingInfo.parameters.$$aggregation = {
          ...bindingInfo.parameters.$$aggregation,
          ...{
            search: CommonUtils.normalizeSearchTerm(filterInfo.search)
          }
        };
      } else {
        var _bindingInfo$paramete2, _bindingInfo$paramete3;
        (_bindingInfo$paramete2 = bindingInfo.parameters) === null || _bindingInfo$paramete2 === void 0 ? true : (_bindingInfo$paramete3 = _bindingInfo$paramete2.$$aggregation) === null || _bindingInfo$paramete3 === void 0 ? true : delete _bindingInfo$paramete3.search;
      }
    }
  });
  return TreeTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUcmVlVGFibGVEZWxlZ2F0ZSIsIk9iamVjdCIsImFzc2lnbiIsIlRhYmxlRGVsZWdhdGUiLCJhcGlWZXJzaW9uIiwiX2ludGVybmFsVXBkYXRlQmluZGluZ0luZm8iLCJ0YWJsZSIsImJpbmRpbmdJbmZvIiwiYXBwbHkiLCJwYXlsb2FkIiwiZ2V0UGF5bG9hZCIsInBhcmFtZXRlcnMiLCIkJGFnZ3JlZ2F0aW9uIiwiaGllcmFyY2h5UXVhbGlmaWVyIiwiZXhwYW5kVG8iLCJzZWFyY2giLCJpbml0aWFsRXhwYW5zaW9uTGV2ZWwiLCJ1cGRhdGVCaW5kaW5nSW5mb1dpdGhTZWFyY2hRdWVyeSIsImZpbHRlckluZm8iLCJmaWx0ZXIiLCJmaWx0ZXJzIiwiQ29tbW9uVXRpbHMiLCJub3JtYWxpemVTZWFyY2hUZXJtIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUcmVlVGFibGVEZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgVGFibGVEZWxlZ2F0ZSBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9kZWxlZ2F0ZXMvVGFibGVEZWxlZ2F0ZVwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL0ZpbHRlclwiO1xuXG4vKipcbiAqIEhlbHBlciBjbGFzcyBmb3Igc2FwLnVpLm1kYy5UYWJsZS5cbiAqIDxoMz48Yj5Ob3RlOjwvYj48L2gzPlxuICogVGhpcyBjbGFzcyBpcyBleHBlcmltZW50YWwgYW5kIG5vdCBpbnRlbmRlZCBmb3IgcHJvZHVjdGl2ZSB1c2FnZSwgc2luY2UgdGhlIEFQSS9iZWhhdmlvciBoYXMgbm90IGJlZW4gZmluYWxpemVkLlxuICpcbiAqIEBhdXRob3IgU0FQIFNFXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNpbmNlIDEuNjkuMFxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVEZWxlZ2F0ZVxuICovXG5jb25zdCBUcmVlVGFibGVEZWxlZ2F0ZSA9IE9iamVjdC5hc3NpZ24oe30sIFRhYmxlRGVsZWdhdGUsIHtcblx0YXBpVmVyc2lvbjogMixcblx0X2ludGVybmFsVXBkYXRlQmluZGluZ0luZm86IGZ1bmN0aW9uICh0YWJsZTogYW55LCBiaW5kaW5nSW5mbzogYW55KSB7XG5cdFx0VGFibGVEZWxlZ2F0ZS5faW50ZXJuYWxVcGRhdGVCaW5kaW5nSW5mby5hcHBseSh0aGlzLCBbdGFibGUsIGJpbmRpbmdJbmZvXSk7XG5cblx0XHRjb25zdCBwYXlsb2FkID0gdGFibGUuZ2V0UGF5bG9hZCgpO1xuXHRcdGJpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJCRhZ2dyZWdhdGlvbiA9IHtcblx0XHRcdC4uLmJpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJCRhZ2dyZWdhdGlvbixcblx0XHRcdC4uLnsgaGllcmFyY2h5UXVhbGlmaWVyOiBwYXlsb2FkPy5oaWVyYXJjaHlRdWFsaWZpZXIgfSxcblx0XHRcdC8vIFNldHRpbmcgdGhlIGV4cGFuZFRvIHBhcmFtZXRlciB0byBhIGhpZ2ggdmFsdWUgZm9yY2VzIHRoZSB0cmVlVGFibGUgdG8gZXhwYW5kIGFsbCBub2RlcyB3aGVuIHRoZSBzZWFyY2ggaXMgYXBwbGllZFxuXHRcdFx0Li4ueyBleHBhbmRUbzogYmluZGluZ0luZm8ucGFyYW1ldGVycy4kJGFnZ3JlZ2F0aW9uPy5zZWFyY2ggPyAxMDAgOiBwYXlsb2FkPy5pbml0aWFsRXhwYW5zaW9uTGV2ZWwgfVxuXHRcdH07XG5cdH0sXG5cdHVwZGF0ZUJpbmRpbmdJbmZvV2l0aFNlYXJjaFF1ZXJ5OiBmdW5jdGlvbiAoYmluZGluZ0luZm86IGFueSwgZmlsdGVySW5mbzogYW55LCBmaWx0ZXI6IEZpbHRlcikge1xuXHRcdGJpbmRpbmdJbmZvLmZpbHRlcnMgPSBmaWx0ZXI7XG5cdFx0aWYgKGZpbHRlckluZm8uc2VhcmNoKSB7XG5cdFx0XHRiaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiQkYWdncmVnYXRpb24gPSB7XG5cdFx0XHRcdC4uLmJpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJCRhZ2dyZWdhdGlvbixcblx0XHRcdFx0Li4ue1xuXHRcdFx0XHRcdHNlYXJjaDogQ29tbW9uVXRpbHMubm9ybWFsaXplU2VhcmNoVGVybShmaWx0ZXJJbmZvLnNlYXJjaClcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGVsZXRlIGJpbmRpbmdJbmZvLnBhcmFtZXRlcnM/LiQkYWdncmVnYXRpb24/LnNlYXJjaDtcblx0XHR9XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBUcmVlVGFibGVEZWxlZ2F0ZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxNQUFNQSxpQkFBaUIsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVDLGFBQWEsRUFBRTtJQUMxREMsVUFBVSxFQUFFLENBQUM7SUFDYkMsMEJBQTBCLEVBQUUsVUFBVUMsS0FBVSxFQUFFQyxXQUFnQixFQUFFO01BQUE7TUFDbkVKLGFBQWEsQ0FBQ0UsMEJBQTBCLENBQUNHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQ0YsS0FBSyxFQUFFQyxXQUFXLENBQUMsQ0FBQztNQUUxRSxNQUFNRSxPQUFPLEdBQUdILEtBQUssQ0FBQ0ksVUFBVSxFQUFFO01BQ2xDSCxXQUFXLENBQUNJLFVBQVUsQ0FBQ0MsYUFBYSxHQUFHO1FBQ3RDLEdBQUdMLFdBQVcsQ0FBQ0ksVUFBVSxDQUFDQyxhQUFhO1FBQ3ZDLEdBQUc7VUFBRUMsa0JBQWtCLEVBQUVKLE9BQU8sYUFBUEEsT0FBTyx1QkFBUEEsT0FBTyxDQUFFSTtRQUFtQixDQUFDO1FBQ3REO1FBQ0EsR0FBRztVQUFFQyxRQUFRLEVBQUUseUJBQUFQLFdBQVcsQ0FBQ0ksVUFBVSxDQUFDQyxhQUFhLGtEQUFwQyxzQkFBc0NHLE1BQU0sR0FBRyxHQUFHLEdBQUdOLE9BQU8sYUFBUEEsT0FBTyx1QkFBUEEsT0FBTyxDQUFFTztRQUFzQjtNQUNwRyxDQUFDO0lBQ0YsQ0FBQztJQUNEQyxnQ0FBZ0MsRUFBRSxVQUFVVixXQUFnQixFQUFFVyxVQUFlLEVBQUVDLE1BQWMsRUFBRTtNQUM5RlosV0FBVyxDQUFDYSxPQUFPLEdBQUdELE1BQU07TUFDNUIsSUFBSUQsVUFBVSxDQUFDSCxNQUFNLEVBQUU7UUFDdEJSLFdBQVcsQ0FBQ0ksVUFBVSxDQUFDQyxhQUFhLEdBQUc7VUFDdEMsR0FBR0wsV0FBVyxDQUFDSSxVQUFVLENBQUNDLGFBQWE7VUFDdkMsR0FBRztZQUNGRyxNQUFNLEVBQUVNLFdBQVcsQ0FBQ0MsbUJBQW1CLENBQUNKLFVBQVUsQ0FBQ0gsTUFBTTtVQUMxRDtRQUNELENBQUM7TUFDRixDQUFDLE1BQU07UUFBQTtRQUNOLDBCQUFPUixXQUFXLENBQUNJLFVBQVUsbUZBQXRCLHVCQUF3QkMsYUFBYSx5REFBNUMsT0FBTyx1QkFBdUNHLE1BQU07TUFDckQ7SUFDRDtFQUNELENBQUMsQ0FBQztFQUFDLE9BRVlmLGlCQUFpQjtBQUFBIn0=
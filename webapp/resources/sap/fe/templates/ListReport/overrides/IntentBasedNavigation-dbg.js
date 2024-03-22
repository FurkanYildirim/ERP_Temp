/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils"], function (CommonUtils) {
  "use strict";

  const IntentBasedNavigationOverride = {
    adaptNavigationContext: function (oSelectionVariant, oTargetInfo) {
      const oView = this.base.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl();
      // Adding filter bar values to the navigation does not make sense if no context has been selected.
      // Hence only consider filter bar values when SelectionVariant is not empty
      if (oFilterBar && !oSelectionVariant.isEmpty()) {
        const oViewData = oView.getViewData(),
          sRootPath = oViewData.fullContextPath;
        let oFilterBarConditions = Object.assign({}, this.base.getView().getController().filterBarConditions);
        let aParameters = [];
        if (oViewData.contextPath) {
          const oMetaModel = oView.getModel().getMetaModel(),
            oParameterInfo = CommonUtils.getParameterInfo(oMetaModel, oViewData.contextPath),
            oParamProperties = oParameterInfo.parameterProperties;
          aParameters = oParamProperties && Object.keys(oParamProperties) || [];
        }
        oFilterBarConditions = oController._intentBasedNavigation.prepareFiltersForExternalNavigation(oFilterBarConditions, sRootPath, aParameters);
        const oMultipleModeControl = oController._getMultiModeControl();
        if (oMultipleModeControl) {
          // Do we need to exclude Fields (multi tables mode with multi entity sets)?
          const oTabsModel = oMultipleModeControl.getTabsModel();
          if (oTabsModel) {
            var _oMultipleModeControl;
            const aIgnoredFieldsForTab = oTabsModel.getProperty(`/${(_oMultipleModeControl = oMultipleModeControl.content) === null || _oMultipleModeControl === void 0 ? void 0 : _oMultipleModeControl.getSelectedKey()}/notApplicable/fields`);
            if (Array.isArray(aIgnoredFieldsForTab) && aIgnoredFieldsForTab.length > 0) {
              aIgnoredFieldsForTab.forEach(function (sProperty) {
                delete oFilterBarConditions.filterConditions[sProperty];
              });
            }
          }
        }

        // TODO: move this also into the intent based navigation controller extension
        CommonUtils.addExternalStateFiltersToSelectionVariant(oSelectionVariant, oFilterBarConditions, oFilterBar, oTargetInfo);
        delete oTargetInfo.propertiesWithoutConflict;
      }
    },
    getEntitySet: function () {
      return this.base.getCurrentEntitySet();
    }
  };
  return IntentBasedNavigationOverride;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlbnRCYXNlZE5hdmlnYXRpb25PdmVycmlkZSIsImFkYXB0TmF2aWdhdGlvbkNvbnRleHQiLCJvU2VsZWN0aW9uVmFyaWFudCIsIm9UYXJnZXRJbmZvIiwib1ZpZXciLCJiYXNlIiwiZ2V0VmlldyIsIm9Db250cm9sbGVyIiwiZ2V0Q29udHJvbGxlciIsIm9GaWx0ZXJCYXIiLCJfZ2V0RmlsdGVyQmFyQ29udHJvbCIsImlzRW1wdHkiLCJvVmlld0RhdGEiLCJnZXRWaWV3RGF0YSIsInNSb290UGF0aCIsImZ1bGxDb250ZXh0UGF0aCIsIm9GaWx0ZXJCYXJDb25kaXRpb25zIiwiT2JqZWN0IiwiYXNzaWduIiwiZmlsdGVyQmFyQ29uZGl0aW9ucyIsImFQYXJhbWV0ZXJzIiwiY29udGV4dFBhdGgiLCJvTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJvUGFyYW1ldGVySW5mbyIsIkNvbW1vblV0aWxzIiwiZ2V0UGFyYW1ldGVySW5mbyIsIm9QYXJhbVByb3BlcnRpZXMiLCJwYXJhbWV0ZXJQcm9wZXJ0aWVzIiwia2V5cyIsIl9pbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJwcmVwYXJlRmlsdGVyc0ZvckV4dGVybmFsTmF2aWdhdGlvbiIsIm9NdWx0aXBsZU1vZGVDb250cm9sIiwiX2dldE11bHRpTW9kZUNvbnRyb2wiLCJvVGFic01vZGVsIiwiZ2V0VGFic01vZGVsIiwiYUlnbm9yZWRGaWVsZHNGb3JUYWIiLCJnZXRQcm9wZXJ0eSIsImNvbnRlbnQiLCJnZXRTZWxlY3RlZEtleSIsIkFycmF5IiwiaXNBcnJheSIsImxlbmd0aCIsImZvckVhY2giLCJzUHJvcGVydHkiLCJmaWx0ZXJDb25kaXRpb25zIiwiYWRkRXh0ZXJuYWxTdGF0ZUZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQiLCJwcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0IiwiZ2V0RW50aXR5U2V0IiwiZ2V0Q3VycmVudEVudGl0eVNldCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSW50ZW50QmFzZWROYXZpZ2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIEludGVudEJhc2VkTmF2aWdhdGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgdHlwZSBMaXN0UmVwb3J0Q29udHJvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0UmVwb3J0L0xpc3RSZXBvcnRDb250cm9sbGVyLmNvbnRyb2xsZXJcIjtcblxuY29uc3QgSW50ZW50QmFzZWROYXZpZ2F0aW9uT3ZlcnJpZGUgPSB7XG5cdGFkYXB0TmF2aWdhdGlvbkNvbnRleHQ6IGZ1bmN0aW9uICh0aGlzOiBJbnRlbnRCYXNlZE5hdmlnYXRpb24sIG9TZWxlY3Rpb25WYXJpYW50OiBhbnksIG9UYXJnZXRJbmZvOiBhbnkpIHtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuYmFzZS5nZXRWaWV3KCksXG5cdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRcdG9GaWx0ZXJCYXIgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdC8vIEFkZGluZyBmaWx0ZXIgYmFyIHZhbHVlcyB0byB0aGUgbmF2aWdhdGlvbiBkb2VzIG5vdCBtYWtlIHNlbnNlIGlmIG5vIGNvbnRleHQgaGFzIGJlZW4gc2VsZWN0ZWQuXG5cdFx0Ly8gSGVuY2Ugb25seSBjb25zaWRlciBmaWx0ZXIgYmFyIHZhbHVlcyB3aGVuIFNlbGVjdGlvblZhcmlhbnQgaXMgbm90IGVtcHR5XG5cdFx0aWYgKG9GaWx0ZXJCYXIgJiYgIW9TZWxlY3Rpb25WYXJpYW50LmlzRW1wdHkoKSkge1xuXHRcdFx0Y29uc3Qgb1ZpZXdEYXRhID0gb1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnksXG5cdFx0XHRcdHNSb290UGF0aCA9IG9WaWV3RGF0YS5mdWxsQ29udGV4dFBhdGg7XG5cdFx0XHRsZXQgb0ZpbHRlckJhckNvbmRpdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgYW55KS5maWx0ZXJCYXJDb25kaXRpb25zKTtcblx0XHRcdGxldCBhUGFyYW1ldGVyczogYW55W10gPSBbXTtcblxuXHRcdFx0aWYgKG9WaWV3RGF0YS5jb250ZXh0UGF0aCkge1xuXHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1ZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0XHRvUGFyYW1ldGVySW5mbyA9IENvbW1vblV0aWxzLmdldFBhcmFtZXRlckluZm8ob01ldGFNb2RlbCwgb1ZpZXdEYXRhLmNvbnRleHRQYXRoKSxcblx0XHRcdFx0XHRvUGFyYW1Qcm9wZXJ0aWVzID0gb1BhcmFtZXRlckluZm8ucGFyYW1ldGVyUHJvcGVydGllcztcblx0XHRcdFx0YVBhcmFtZXRlcnMgPSAob1BhcmFtUHJvcGVydGllcyAmJiBPYmplY3Qua2V5cyhvUGFyYW1Qcm9wZXJ0aWVzKSkgfHwgW107XG5cdFx0XHR9XG5cblx0XHRcdG9GaWx0ZXJCYXJDb25kaXRpb25zID0gb0NvbnRyb2xsZXIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5wcmVwYXJlRmlsdGVyc0ZvckV4dGVybmFsTmF2aWdhdGlvbihcblx0XHRcdFx0b0ZpbHRlckJhckNvbmRpdGlvbnMsXG5cdFx0XHRcdHNSb290UGF0aCxcblx0XHRcdFx0YVBhcmFtZXRlcnNcblx0XHRcdCk7XG5cblx0XHRcdGNvbnN0IG9NdWx0aXBsZU1vZGVDb250cm9sID0gb0NvbnRyb2xsZXIuX2dldE11bHRpTW9kZUNvbnRyb2woKTtcblx0XHRcdGlmIChvTXVsdGlwbGVNb2RlQ29udHJvbCkge1xuXHRcdFx0XHQvLyBEbyB3ZSBuZWVkIHRvIGV4Y2x1ZGUgRmllbGRzIChtdWx0aSB0YWJsZXMgbW9kZSB3aXRoIG11bHRpIGVudGl0eSBzZXRzKT9cblx0XHRcdFx0Y29uc3Qgb1RhYnNNb2RlbCA9IG9NdWx0aXBsZU1vZGVDb250cm9sLmdldFRhYnNNb2RlbCgpO1xuXHRcdFx0XHRpZiAob1RhYnNNb2RlbCkge1xuXHRcdFx0XHRcdGNvbnN0IGFJZ25vcmVkRmllbGRzRm9yVGFiID0gb1RhYnNNb2RlbC5nZXRQcm9wZXJ0eShcblx0XHRcdFx0XHRcdGAvJHtvTXVsdGlwbGVNb2RlQ29udHJvbC5jb250ZW50Py5nZXRTZWxlY3RlZEtleSgpfS9ub3RBcHBsaWNhYmxlL2ZpZWxkc2Bcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KGFJZ25vcmVkRmllbGRzRm9yVGFiKSAmJiBhSWdub3JlZEZpZWxkc0ZvclRhYi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRhSWdub3JlZEZpZWxkc0ZvclRhYi5mb3JFYWNoKGZ1bmN0aW9uIChzUHJvcGVydHk6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgb0ZpbHRlckJhckNvbmRpdGlvbnMuZmlsdGVyQ29uZGl0aW9uc1tzUHJvcGVydHldO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRPRE86IG1vdmUgdGhpcyBhbHNvIGludG8gdGhlIGludGVudCBiYXNlZCBuYXZpZ2F0aW9uIGNvbnRyb2xsZXIgZXh0ZW5zaW9uXG5cdFx0XHRDb21tb25VdGlscy5hZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudChvU2VsZWN0aW9uVmFyaWFudCwgb0ZpbHRlckJhckNvbmRpdGlvbnMsIG9GaWx0ZXJCYXIsIG9UYXJnZXRJbmZvKTtcblx0XHRcdGRlbGV0ZSBvVGFyZ2V0SW5mby5wcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0O1xuXHRcdH1cblx0fSxcblx0Z2V0RW50aXR5U2V0OiBmdW5jdGlvbiAodGhpczogSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0cmV0dXJuICh0aGlzLmJhc2UgYXMgYW55KS5nZXRDdXJyZW50RW50aXR5U2V0KCk7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IEludGVudEJhc2VkTmF2aWdhdGlvbk92ZXJyaWRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBSUEsTUFBTUEsNkJBQTZCLEdBQUc7SUFDckNDLHNCQUFzQixFQUFFLFVBQXVDQyxpQkFBc0IsRUFBRUMsV0FBZ0IsRUFBRTtNQUN4RyxNQUFNQyxLQUFLLEdBQUcsSUFBSSxDQUFDQyxJQUFJLENBQUNDLE9BQU8sRUFBRTtRQUNoQ0MsV0FBVyxHQUFHSCxLQUFLLENBQUNJLGFBQWEsRUFBMEI7UUFDM0RDLFVBQVUsR0FBR0YsV0FBVyxDQUFDRyxvQkFBb0IsRUFBRTtNQUNoRDtNQUNBO01BQ0EsSUFBSUQsVUFBVSxJQUFJLENBQUNQLGlCQUFpQixDQUFDUyxPQUFPLEVBQUUsRUFBRTtRQUMvQyxNQUFNQyxTQUFTLEdBQUdSLEtBQUssQ0FBQ1MsV0FBVyxFQUFTO1VBQzNDQyxTQUFTLEdBQUdGLFNBQVMsQ0FBQ0csZUFBZTtRQUN0QyxJQUFJQyxvQkFBb0IsR0FBR0MsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUcsSUFBSSxDQUFDYixJQUFJLENBQUNDLE9BQU8sRUFBRSxDQUFDRSxhQUFhLEVBQUUsQ0FBU1csbUJBQW1CLENBQUM7UUFDOUcsSUFBSUMsV0FBa0IsR0FBRyxFQUFFO1FBRTNCLElBQUlSLFNBQVMsQ0FBQ1MsV0FBVyxFQUFFO1VBQzFCLE1BQU1DLFVBQVUsR0FBR2xCLEtBQUssQ0FBQ21CLFFBQVEsRUFBRSxDQUFDQyxZQUFZLEVBQUU7WUFDakRDLGNBQWMsR0FBR0MsV0FBVyxDQUFDQyxnQkFBZ0IsQ0FBQ0wsVUFBVSxFQUFFVixTQUFTLENBQUNTLFdBQVcsQ0FBQztZQUNoRk8sZ0JBQWdCLEdBQUdILGNBQWMsQ0FBQ0ksbUJBQW1CO1VBQ3REVCxXQUFXLEdBQUlRLGdCQUFnQixJQUFJWCxNQUFNLENBQUNhLElBQUksQ0FBQ0YsZ0JBQWdCLENBQUMsSUFBSyxFQUFFO1FBQ3hFO1FBRUFaLG9CQUFvQixHQUFHVCxXQUFXLENBQUN3QixzQkFBc0IsQ0FBQ0MsbUNBQW1DLENBQzVGaEIsb0JBQW9CLEVBQ3BCRixTQUFTLEVBQ1RNLFdBQVcsQ0FDWDtRQUVELE1BQU1hLG9CQUFvQixHQUFHMUIsV0FBVyxDQUFDMkIsb0JBQW9CLEVBQUU7UUFDL0QsSUFBSUQsb0JBQW9CLEVBQUU7VUFDekI7VUFDQSxNQUFNRSxVQUFVLEdBQUdGLG9CQUFvQixDQUFDRyxZQUFZLEVBQUU7VUFDdEQsSUFBSUQsVUFBVSxFQUFFO1lBQUE7WUFDZixNQUFNRSxvQkFBb0IsR0FBR0YsVUFBVSxDQUFDRyxXQUFXLENBQ2pELElBQUMseUJBQUVMLG9CQUFvQixDQUFDTSxPQUFPLDBEQUE1QixzQkFBOEJDLGNBQWMsRUFBRyx1QkFBc0IsQ0FDekU7WUFDRCxJQUFJQyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0wsb0JBQW9CLENBQUMsSUFBSUEsb0JBQW9CLENBQUNNLE1BQU0sR0FBRyxDQUFDLEVBQUU7Y0FDM0VOLG9CQUFvQixDQUFDTyxPQUFPLENBQUMsVUFBVUMsU0FBYyxFQUFFO2dCQUN0RCxPQUFPN0Isb0JBQW9CLENBQUM4QixnQkFBZ0IsQ0FBQ0QsU0FBUyxDQUFDO2NBQ3hELENBQUMsQ0FBQztZQUNIO1VBQ0Q7UUFDRDs7UUFFQTtRQUNBbkIsV0FBVyxDQUFDcUIseUNBQXlDLENBQUM3QyxpQkFBaUIsRUFBRWMsb0JBQW9CLEVBQUVQLFVBQVUsRUFBRU4sV0FBVyxDQUFDO1FBQ3ZILE9BQU9BLFdBQVcsQ0FBQzZDLHlCQUF5QjtNQUM3QztJQUNELENBQUM7SUFDREMsWUFBWSxFQUFFLFlBQXVDO01BQ3BELE9BQVEsSUFBSSxDQUFDNUMsSUFBSSxDQUFTNkMsbUJBQW1CLEVBQUU7SUFDaEQ7RUFDRCxDQUFDO0VBQUMsT0FFYWxELDZCQUE2QjtBQUFBIn0=
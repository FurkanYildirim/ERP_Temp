/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core", "sap/ui/model/Filter", "sap/ui/model/FilterType", "sap/ui/model/Sorter"], function (Core, Filter, FilterType, Sorter) {
  "use strict";

  var _exports = {};
  var AdditionalValueGroupKey;
  (function (AdditionalValueGroupKey) {
    AdditionalValueGroupKey["recommendation"] = "recommendation";
    AdditionalValueGroupKey["recentValue"] = "recentValue";
  })(AdditionalValueGroupKey || (AdditionalValueGroupKey = {}));
  _exports.AdditionalValueGroupKey = AdditionalValueGroupKey;
  const additionalValueHelper = {
    /**
     * This function is responsible to create context based on additional value filters and custom sorter and request contexts from it.
     *
     * @param additionalValues Array of additional values
     * @param valueHelpListBinding List binding
     * @param valueHelpBindingInfo The binding info object to be used to bind the list to the model
     * @returns Additional value contexts
     */
    requestForAdditionalValueContextData: async function (additionalValues, valueHelpListBinding, valueHelpBindingInfo) {
      // reverse the array so that while creating transient context first additional value is grouped first
      const reverseAdditionalValues = [...additionalValues].reverse();
      if (!valueHelpListBinding.isSuspended()) {
        valueHelpListBinding.suspend();
      }
      if (valueHelpBindingInfo.parameters) {
        valueHelpListBinding.changeParameters(valueHelpBindingInfo.parameters);
      }

      // check if there is any input in the field
      // This information is used to determine
      // if to show the "others" section or not
      // and also to determine if typeAhead should open or not
      const searchTerm = valueHelpBindingInfo.parameters.$search;
      const additionalValueFilters = this.getAdditionalValueFilters(reverseAdditionalValues, [...this.getValueHelpBindingFilters(valueHelpBindingInfo)]);
      valueHelpBindingInfo.parameters.$search = searchTerm;
      // add custom sorter to take care of grouping the additional values
      const sorter = [this.getSorter()];
      const additionalValuesListBinding = valueHelpListBinding.getModel().bindList(valueHelpBindingInfo.path, undefined, sorter, additionalValueFilters, valueHelpBindingInfo.parameters);
      // get recommendation contexts from backend
      const additionalValueContexts = await additionalValuesListBinding.requestContexts();
      return additionalValueContexts.map(context => context.getObject());
    },
    /**
     * This function is responsible to fetch the valuehelp binding filters.
     *
     * @param valueHelpBindingInfo The binding info object to be used to bind the list to the model
     * @returns Filters of valuehelp binding
     */
    getValueHelpBindingFilters: function (valueHelpBindingInfo) {
      // get all existing filters from the binding info
      // this + additional value filters will be used later on to fetch additional values from the backend
      if (valueHelpBindingInfo.filters) {
        if (Array.isArray(valueHelpBindingInfo.filters)) {
          return valueHelpBindingInfo.filters;
        } else {
          return [valueHelpBindingInfo.filters];
        }
      }
      return [];
    },
    /**
     * This function resumes the suspended list binding and then resets changes on it.
     *
     * @param valueHelpListBinding List binding
     */
    resumeValueListBindingAndResetChanges: async function (valueHelpListBinding) {
      if (valueHelpListBinding.isSuspended()) {
        valueHelpListBinding.resume();
      }
      // get rid of existing transient contexts.

      // destroying causes issues sometimes, contexts are not always available to destroy but appear afterwards magically
      try {
        await valueHelpListBinding.resetChanges();
      } catch (error) {
        //We do not do anything here as we know the model will always throw an error and this will fill up the console with errors.
      }
    },
    /**
     * This function is used to sort and filter the Others group which contains other values which are not additional values.
     *
     * @param valueHelpListBinding List Binding
     * @param valueHelpBindingInfo The binding info object to be used to bind the list to the model
     * @param uniqueAdditionalValues Array of additional values which contain values which are unique to each group
     */
    sortAndFilterOthers: function (valueHelpListBinding, valueHelpBindingInfo, uniqueAdditionalValues) {
      // filtering on valueListBinding is required to show the "Others" section
      // We should only filter on valueHelpBinding when there is search term entered
      // otherwise we do not want to show the "Others" section
      const otherGroupFilters = this.createFiltersForOthersGroup(uniqueAdditionalValues, this.getValueHelpBindingFilters(valueHelpBindingInfo));
      valueHelpListBinding.filter([otherGroupFilters], FilterType.Application);
      valueHelpListBinding.sort(this.getSorter());
    },
    /**
     * This functions creates the filters for additional values.
     *
     * @param reverseAdditionalValues Array of additional values in reverse order
     * @param filters Existing valuehelp binding filters
     * @returns Additional value filters
     */
    getAdditionalValueFilters: function (reverseAdditionalValues, filters) {
      reverseAdditionalValues.forEach(additionalValue => {
        if (additionalValue.values.length > 0) {
          const values = additionalValue.values;
          const propertyPath = additionalValue.propertyPath;
          // add additional value filters to existing filters from the binding info
          values.forEach(value => {
            // update the value help binding info to get additional values from the backend
            filters.push(new Filter({
              path: propertyPath,
              value1: value,
              operator: "EQ"
            }));
          });
        }
      });
      return filters;
    },
    /**
     * This function returns a custom sorter which will be used to group additional values and also create Others group.
     *
     * @returns Custom Sorter containing different groups
     */
    getSorter: function () {
      // This sorter will return a custom sorter
      return new Sorter("", false, this.getSorterFunction);
    },
    /**
     * This function is a callback to the custom sorter.
     *
     * @param context Context of the Field
     * @returns Group key that can be used for sorting
     */
    getSorterFunction: function (context) {
      const resourceBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      //get the client side annotation to figure out the groupkey
      const groupKey = context.getProperty("@$fe.additionalValueGroupKey");
      if (groupKey === AdditionalValueGroupKey.recommendation) {
        return resourceBundle.getText("M_ADDITIONALVALUEHELPER_RECOMMENDATIONS");
      } else if (groupKey === AdditionalValueGroupKey.recentValue) {
        return resourceBundle.getText("M_ADDITIONALVALUEHELPER_RECENTVALUE");
      } else {
        return resourceBundle.getText("M_ADDITIONALVALUEHELPER_OTHERS");
      }
    },
    /**
     * This function is used to create transient contexts for the additional values.
     *
     * @param additionalValueContextData Array of Contexts created for additional values
     * @param reverseAdditionalValues Array of additional values in reverse order
     * @param valueHelpListBinding List Binding
     */
    createAdditionalValueTransientContexts: function (additionalValueContextData, reverseAdditionalValues, valueHelpListBinding) {
      if (additionalValueContextData.length > 0) {
        // recommendations exist in the valuehelp
        // now add transient context to the list binding per additional value group
        reverseAdditionalValues.forEach(additionalValue => {
          const values = additionalValue.values;
          const propertyPath = additionalValue.propertyPath;
          const groupKey = additionalValue.groupKey;
          //sorting and looping through the additionalValueContextData to create transient contexts
          this.sortAdditionalValueContextDataAndCreateContexts(additionalValueContextData, values, propertyPath, valueHelpListBinding, groupKey);
        });
      }
    },
    /**
     * This function is used to sort the additional value context data and create contexts.
     *
     * @param additionalValueContextData Array of Contexts created for additional values
     * @param values Array of values which are a part of additionalvalues
     * @param propertyPath Path pointing to the property of the field
     * @param valueHelpListBinding List Binding
     * @param groupKey AdditionalValueGroupKey
     */
    sortAdditionalValueContextDataAndCreateContexts: function (additionalValueContextData, values, propertyPath, valueHelpListBinding, groupKey) {
      [...values].reverse().forEach(value => {
        additionalValueContextData.forEach(contextData => {
          if (value === contextData[propertyPath]) {
            contextData["@$fe.additionalValueGroupKey"] = groupKey;
            valueHelpListBinding.create(contextData);
          }
        });
      });
    },
    /**
     * This function will remove the duplicate values which are a part of different additional value groups.
     *
     * @param additionalValueContextData Array of Contexts created for additional values
     * @param additionalValues Array of additional values
     * @returns Array of additional values which contain unique values in each group
     */
    removeDuplicateAdditionalValues: function (additionalValueContextData, additionalValues) {
      const uniqueAdditionalValues = [];
      //create a deep copy to make sure we dont alter the original additionalvalues
      additionalValues.forEach(additionalValue => {
        const values = [...additionalValue.values];
        const propertyPath = additionalValue.propertyPath;
        const groupKey = additionalValue.groupKey;
        uniqueAdditionalValues.push({
          values,
          propertyPath,
          groupKey
        });
      });
      //loop through the additionalValueContextData and uniqueAdditionalValues to see if there are any duplicates and then remove them
      additionalValueContextData.forEach(contextData => {
        let duplicateFlag = false;
        uniqueAdditionalValues.forEach(additionalValue => {
          const values = additionalValue.values;
          const propertyPath = additionalValue.propertyPath;
          if (values.includes(contextData[propertyPath])) {
            if (duplicateFlag) {
              // if we find a duplicate then remove it from the array
              values.splice(values.indexOf(contextData[propertyPath]), 1);
            } else {
              duplicateFlag = true;
            }
          }
        });
      });
      return uniqueAdditionalValues;
    },
    /**
     * This function is used to create filters to fetch values other than additional values.
     *
     * @param uniqueAdditionalValues Array of additional values which contain values which are unique to each group
     * @param valuehelpFilters Filters which are already a part of ValueHelp Binding
     * @returns Filters for Others group
     */
    createFiltersForOthersGroup: function (uniqueAdditionalValues, valuehelpFilters) {
      const filters = [];
      //create filters not equal to the values of uniqueAdditionalValues
      uniqueAdditionalValues.forEach(additionalValue => {
        const values = additionalValue.values;
        const propertyPath = additionalValue.propertyPath;
        values.forEach(value => {
          filters.push(new Filter({
            path: propertyPath,
            value1: value,
            operator: "NE"
          }));
        });
      });
      //set and to true for the uniqueAdditionalValues filters
      const uniqueAdditionalValuesFilters = new Filter({
        filters: filters,
        and: true
      });
      //check if filters are already present on valuehelpbinding and push uniqueAdditionalValuesFilters into the valuehelpbinding filters
      if (valuehelpFilters.length > 0) {
        valuehelpFilters.push(uniqueAdditionalValuesFilters);
        return new Filter({
          filters: valuehelpFilters,
          and: true
        });
      } else {
        //if no pre existing filters are present then return uniqueAdditionalValuesFilters
        return uniqueAdditionalValuesFilters;
      }
    },
    /**
     * This functions returns the relevant recommendations for the valuelist.
     *
     * @param data Object containing recommendation model data
     * @param bindingContext Binding context of the Field
     * @param propertyPath Property Path of the Field
     * @returns Relevant recommendations for the valuelist
     */
    getRelevantRecommendations: function (data, bindingContext, propertyPath) {
      const values = [];
      let relevantRecommendations;
      if (Object.keys(data).length > 0) {
        //get the right property path by eliminating the starting / and also main entityset name
        propertyPath = this.getRecommendationPropertyPath(propertyPath);
        //get the recommendations based on property path and binding context passed
        relevantRecommendations = this.getAdditionalValueFromPropertyPath(propertyPath, data, bindingContext);
        //if we get recommendations then push the values
        if (Object.keys(relevantRecommendations).length > 0) {
          relevantRecommendations.additionalValues.forEach(valueData => {
            values.push(valueData.value);
          });
          return values;
        } else {
          //if recommendations are not found then return null
          return null;
        }
      }
    },
    /**
     * This function is responsible to fetch the exact object from an array of objects that contains relevant recommendationData based on keys.
     *
     * @param recommendationData Array containing additional values
     * @param bindingContext Binding context of the Field
     * @returns Relevant object from an array of object that contains the additional value
     */
    getAdditionalValueFromKeys: function (recommendationData, bindingContext) {
      const contextData = bindingContext === null || bindingContext === void 0 ? void 0 : bindingContext.getObject();
      let result = {};
      //loop through the recommendationData and check if the keyProperties match with the binding context data
      if (bindingContext && contextData) {
        if (Array.isArray(recommendationData)) {
          recommendationData.forEach(recData => {
            const keyProperties = recData.keyProperties;
            let allKeysMatch = true;
            for (const key in keyProperties) {
              if (keyProperties[key] !== contextData[key]) {
                allKeysMatch = false;
                break;
              }
            }
            //if every key value matches with the binding context data then assign it to result which will be returned
            if (allKeysMatch) {
              result = recData;
            }
          });
        }
      }
      return result;
    },
    /**
     * This function is responsible for getting the additional value based on property path and binding context passed.
     *
     * @param propertyPath Property path of the field
     * @param recommendationData Object containing additional value
     * @param bindingContext Binding context of the field
     * @returns Additional value based on property path and binding context passed
     */
    getAdditionalValueFromPropertyPath: function (propertyPath, recommendationData, bindingContext) {
      //create a copy of the recommendationData to store its previous value as it will change because of the recursive approach
      let oldData = Object.assign(recommendationData, {});
      //check if property path exists on the recommendationData object and if so then return the object pointing to the property path
      if (Object.keys(recommendationData).includes(propertyPath)) {
        return recommendationData[propertyPath];
      } else {
        //if property path is not present then check if it is 1:n mapping and we need to do a recursive approach to land on the exact object containing the relevant recommendations
        //continue the while loop till the property path is found in the previous recommendationData
        while (Object.keys(oldData).length > 0 && !Object.keys(oldData).includes(propertyPath)) {
          // as it might be 1:n mapping so first seperate the navprop name and actual prop name to make sure we find the navprop first and then from its pointing object we find the property path
          //eg: _Item/Material will be first divided into _Item and we search for it and then from its relevant object we search for Material
          const propertyPaths = propertyPath.split("/");
          if (propertyPaths.length > 1) {
            //getting the navprop path
            const navPropPath = propertyPaths[0];
            //removing the navprop path from propertypaths so that we only check for actual property path
            propertyPaths.splice(0, 1);
            propertyPath = propertyPaths.join("/");
            //using getAdditionalValueFromPropertyPath and passing navPropPath we get the exact array of objects pointing to the navProp
            recommendationData = this.getAdditionalValueFromPropertyPath(navPropPath, recommendationData, bindingContext);
            //no pass the array of objects of navProp to getAdditionalValueFromKeys and get the exact object that contains the recommendationData based on keys
            recommendationData = this.getAdditionalValueFromKeys(recommendationData, bindingContext);
            if (Object.keys(recommendationData).length > 0) {
              //set the recommendationData to oldData before assigning the new value to it
              oldData = Object.assign(recommendationData, {});
              //here we check for the actual property path from the object we found from getAdditionalValueFromKeys
              //eg: Material can be found in the object which is part of array of objects of _Item
              recommendationData = this.getAdditionalValueFromPropertyPath(propertyPath, recommendationData, bindingContext);
            } else {
              return {};
            }
          } else {
            return {};
          }
        }
        return recommendationData;
      }
    },
    /**
     * This function returns the property path of the field by removing the leading '/' and main entity set name.
     *
     * @param propertyPath Property Path of the Field
     * @returns Property path of the field by removing the leading '/' and main entity set name.
     */
    getRecommendationPropertyPath: function (propertyPath) {
      //First we split the property path based on /
      const propertyPaths = propertyPath.split("/");
      //Now remove the first two elements of the array. As first element will always be '' and second element will be main entity set name
      propertyPaths.splice(0, 2);
      //Now join the remaining elements to create a new property path and return it
      return propertyPaths.join("/");
    },
    /**
     * This function checks if the listbinding contains transient contexts and they match the existing additional values. This is to ensure
     * we do not create duplicate transient contexts.
     *
     * @param listBinding List Binding
     * @param additionalValues Array of additional values which contain values which are unique to each group
     * @returns Boolean value which tells whether the list binding contains duplicate transient contexts or not
     */
    doesTransientContextsAlreadyExist: function (listBinding, additionalValues) {
      const contexts = listBinding.getAllCurrentContexts();
      let doesTransientContextExists = false;
      additionalValues.forEach(additionalValue => {
        const values = additionalValue.values;
        const propertyPath = additionalValue.propertyPath;
        //looping through the contexts to check if they are transient and contain values
        contexts.forEach(context => {
          const contextData = context.getObject();
          const isTransient = context.isTransient();
          //We check if the context is transient and has the value in it
          if (values.includes(contextData[propertyPath]) && isTransient === true) {
            doesTransientContextExists = true;
            return;
          }
        });
      });
      return doesTransientContextExists;
    }
  };
  _exports.additionalValueHelper = additionalValueHelper;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBZGRpdGlvbmFsVmFsdWVHcm91cEtleSIsImFkZGl0aW9uYWxWYWx1ZUhlbHBlciIsInJlcXVlc3RGb3JBZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YSIsImFkZGl0aW9uYWxWYWx1ZXMiLCJ2YWx1ZUhlbHBMaXN0QmluZGluZyIsInZhbHVlSGVscEJpbmRpbmdJbmZvIiwicmV2ZXJzZUFkZGl0aW9uYWxWYWx1ZXMiLCJyZXZlcnNlIiwiaXNTdXNwZW5kZWQiLCJzdXNwZW5kIiwicGFyYW1ldGVycyIsImNoYW5nZVBhcmFtZXRlcnMiLCJzZWFyY2hUZXJtIiwiJHNlYXJjaCIsImFkZGl0aW9uYWxWYWx1ZUZpbHRlcnMiLCJnZXRBZGRpdGlvbmFsVmFsdWVGaWx0ZXJzIiwiZ2V0VmFsdWVIZWxwQmluZGluZ0ZpbHRlcnMiLCJzb3J0ZXIiLCJnZXRTb3J0ZXIiLCJhZGRpdGlvbmFsVmFsdWVzTGlzdEJpbmRpbmciLCJnZXRNb2RlbCIsImJpbmRMaXN0IiwicGF0aCIsInVuZGVmaW5lZCIsImFkZGl0aW9uYWxWYWx1ZUNvbnRleHRzIiwicmVxdWVzdENvbnRleHRzIiwibWFwIiwiY29udGV4dCIsImdldE9iamVjdCIsImZpbHRlcnMiLCJBcnJheSIsImlzQXJyYXkiLCJyZXN1bWVWYWx1ZUxpc3RCaW5kaW5nQW5kUmVzZXRDaGFuZ2VzIiwicmVzdW1lIiwicmVzZXRDaGFuZ2VzIiwiZXJyb3IiLCJzb3J0QW5kRmlsdGVyT3RoZXJzIiwidW5pcXVlQWRkaXRpb25hbFZhbHVlcyIsIm90aGVyR3JvdXBGaWx0ZXJzIiwiY3JlYXRlRmlsdGVyc0Zvck90aGVyc0dyb3VwIiwiZmlsdGVyIiwiRmlsdGVyVHlwZSIsIkFwcGxpY2F0aW9uIiwic29ydCIsImZvckVhY2giLCJhZGRpdGlvbmFsVmFsdWUiLCJ2YWx1ZXMiLCJsZW5ndGgiLCJwcm9wZXJ0eVBhdGgiLCJ2YWx1ZSIsInB1c2giLCJGaWx0ZXIiLCJ2YWx1ZTEiLCJvcGVyYXRvciIsIlNvcnRlciIsImdldFNvcnRlckZ1bmN0aW9uIiwicmVzb3VyY2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZ3JvdXBLZXkiLCJnZXRQcm9wZXJ0eSIsInJlY29tbWVuZGF0aW9uIiwiZ2V0VGV4dCIsInJlY2VudFZhbHVlIiwiY3JlYXRlQWRkaXRpb25hbFZhbHVlVHJhbnNpZW50Q29udGV4dHMiLCJhZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YSIsInNvcnRBZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YUFuZENyZWF0ZUNvbnRleHRzIiwiY29udGV4dERhdGEiLCJjcmVhdGUiLCJyZW1vdmVEdXBsaWNhdGVBZGRpdGlvbmFsVmFsdWVzIiwiZHVwbGljYXRlRmxhZyIsImluY2x1ZGVzIiwic3BsaWNlIiwiaW5kZXhPZiIsInZhbHVlaGVscEZpbHRlcnMiLCJ1bmlxdWVBZGRpdGlvbmFsVmFsdWVzRmlsdGVycyIsImFuZCIsImdldFJlbGV2YW50UmVjb21tZW5kYXRpb25zIiwiZGF0YSIsImJpbmRpbmdDb250ZXh0IiwicmVsZXZhbnRSZWNvbW1lbmRhdGlvbnMiLCJPYmplY3QiLCJrZXlzIiwiZ2V0UmVjb21tZW5kYXRpb25Qcm9wZXJ0eVBhdGgiLCJnZXRBZGRpdGlvbmFsVmFsdWVGcm9tUHJvcGVydHlQYXRoIiwidmFsdWVEYXRhIiwiZ2V0QWRkaXRpb25hbFZhbHVlRnJvbUtleXMiLCJyZWNvbW1lbmRhdGlvbkRhdGEiLCJyZXN1bHQiLCJyZWNEYXRhIiwia2V5UHJvcGVydGllcyIsImFsbEtleXNNYXRjaCIsImtleSIsIm9sZERhdGEiLCJhc3NpZ24iLCJwcm9wZXJ0eVBhdGhzIiwic3BsaXQiLCJuYXZQcm9wUGF0aCIsImpvaW4iLCJkb2VzVHJhbnNpZW50Q29udGV4dHNBbHJlYWR5RXhpc3QiLCJsaXN0QmluZGluZyIsImNvbnRleHRzIiwiZ2V0QWxsQ3VycmVudENvbnRleHRzIiwiZG9lc1RyYW5zaWVudENvbnRleHRFeGlzdHMiLCJpc1RyYW5zaWVudCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQWRkaXRpb25hbFZhbHVlSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0SW5Db21wbGV0ZW5lc3NJbmZvVHlwZSxcblx0SW50ZXJuYWxQcm9wZXJ0eUFkZGl0aW9uYWxWYWx1ZSxcblx0S2V5UHJvcGVydGllc0RhdGFUeXBlLFxuXHRSZWNvbW1lbmRhdGlvbkRhdGFGb3JOYXZQcm9wZXJ0eVR5cGUsXG5cdFJlY29tbWVuZGF0aW9uRGF0YUlubmVyT2JqZWN0VHlwZVxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9SZWNvbW1lbmRhdGlvbkhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBBZ2dyZWdhdGlvbkJpbmRpbmdJbmZvIH0gZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgRmlsdGVyVHlwZSBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclR5cGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IFNvcnRlciBmcm9tIFwic2FwL3VpL21vZGVsL1NvcnRlclwiO1xuXG5lbnVtIEFkZGl0aW9uYWxWYWx1ZUdyb3VwS2V5IHtcblx0cmVjb21tZW5kYXRpb24gPSBcInJlY29tbWVuZGF0aW9uXCIsXG5cdHJlY2VudFZhbHVlID0gXCJyZWNlbnRWYWx1ZVwiXG59XG5leHBvcnQgdHlwZSBBZGRpdGlvbmFsVmFsdWVUeXBlID0ge1xuXHRwcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0dmFsdWVzOiAoc3RyaW5nIHwgbnVtYmVyKVtdO1xuXHRncm91cEtleTogQWRkaXRpb25hbFZhbHVlR3JvdXBLZXk7IC8vIHVuaXF1ZSBpZGVudGlmaWVyIGZvciB0aGUgZ3JvdXBcbn07XG50eXBlIEJpbmRpbmdJbmZvUGFyYW1ldGVycyA9IHtcblx0JHNlYXJjaDogc3RyaW5nO1xufTtcbnR5cGUgQWRkaXRpb25WYWx1ZURlZmluaXRpb24gPSBJbkNvbXBsZXRlbmVzc0luZm9UeXBlIHwgUmVjb21tZW5kYXRpb25EYXRhRm9yTmF2UHJvcGVydHlUeXBlW10gfCBJbnRlcm5hbFByb3BlcnR5QWRkaXRpb25hbFZhbHVlIHwge307XG5jb25zdCBhZGRpdGlvbmFsVmFsdWVIZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHJlc3BvbnNpYmxlIHRvIGNyZWF0ZSBjb250ZXh0IGJhc2VkIG9uIGFkZGl0aW9uYWwgdmFsdWUgZmlsdGVycyBhbmQgY3VzdG9tIHNvcnRlciBhbmQgcmVxdWVzdCBjb250ZXh0cyBmcm9tIGl0LlxuXHQgKlxuXHQgKiBAcGFyYW0gYWRkaXRpb25hbFZhbHVlcyBBcnJheSBvZiBhZGRpdGlvbmFsIHZhbHVlc1xuXHQgKiBAcGFyYW0gdmFsdWVIZWxwTGlzdEJpbmRpbmcgTGlzdCBiaW5kaW5nXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHBCaW5kaW5nSW5mbyBUaGUgYmluZGluZyBpbmZvIG9iamVjdCB0byBiZSB1c2VkIHRvIGJpbmQgdGhlIGxpc3QgdG8gdGhlIG1vZGVsXG5cdCAqIEByZXR1cm5zIEFkZGl0aW9uYWwgdmFsdWUgY29udGV4dHNcblx0ICovXG5cdHJlcXVlc3RGb3JBZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YTogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdGFkZGl0aW9uYWxWYWx1ZXM6IEFkZGl0aW9uYWxWYWx1ZVR5cGVbXSxcblx0XHR2YWx1ZUhlbHBMaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHR2YWx1ZUhlbHBCaW5kaW5nSW5mbzogQWdncmVnYXRpb25CaW5kaW5nSW5mb1xuXHQpIHtcblx0XHQvLyByZXZlcnNlIHRoZSBhcnJheSBzbyB0aGF0IHdoaWxlIGNyZWF0aW5nIHRyYW5zaWVudCBjb250ZXh0IGZpcnN0IGFkZGl0aW9uYWwgdmFsdWUgaXMgZ3JvdXBlZCBmaXJzdFxuXHRcdGNvbnN0IHJldmVyc2VBZGRpdGlvbmFsVmFsdWVzID0gWy4uLmFkZGl0aW9uYWxWYWx1ZXNdLnJldmVyc2UoKTtcblx0XHRpZiAoIXZhbHVlSGVscExpc3RCaW5kaW5nLmlzU3VzcGVuZGVkKCkpIHtcblx0XHRcdHZhbHVlSGVscExpc3RCaW5kaW5nLnN1c3BlbmQoKTtcblx0XHR9XG5cdFx0aWYgKHZhbHVlSGVscEJpbmRpbmdJbmZvLnBhcmFtZXRlcnMpIHtcblx0XHRcdHZhbHVlSGVscExpc3RCaW5kaW5nLmNoYW5nZVBhcmFtZXRlcnModmFsdWVIZWxwQmluZGluZ0luZm8ucGFyYW1ldGVycyk7XG5cdFx0fVxuXG5cdFx0Ly8gY2hlY2sgaWYgdGhlcmUgaXMgYW55IGlucHV0IGluIHRoZSBmaWVsZFxuXHRcdC8vIFRoaXMgaW5mb3JtYXRpb24gaXMgdXNlZCB0byBkZXRlcm1pbmVcblx0XHQvLyBpZiB0byBzaG93IHRoZSBcIm90aGVyc1wiIHNlY3Rpb24gb3Igbm90XG5cdFx0Ly8gYW5kIGFsc28gdG8gZGV0ZXJtaW5lIGlmIHR5cGVBaGVhZCBzaG91bGQgb3BlbiBvciBub3Rcblx0XHRjb25zdCBzZWFyY2hUZXJtID0gKHZhbHVlSGVscEJpbmRpbmdJbmZvLnBhcmFtZXRlcnMgYXMgQmluZGluZ0luZm9QYXJhbWV0ZXJzKS4kc2VhcmNoO1xuXHRcdGNvbnN0IGFkZGl0aW9uYWxWYWx1ZUZpbHRlcnMgPSB0aGlzLmdldEFkZGl0aW9uYWxWYWx1ZUZpbHRlcnMocmV2ZXJzZUFkZGl0aW9uYWxWYWx1ZXMsIFtcblx0XHRcdC4uLnRoaXMuZ2V0VmFsdWVIZWxwQmluZGluZ0ZpbHRlcnModmFsdWVIZWxwQmluZGluZ0luZm8pXG5cdFx0XSk7XG5cdFx0KHZhbHVlSGVscEJpbmRpbmdJbmZvLnBhcmFtZXRlcnMgYXMgQmluZGluZ0luZm9QYXJhbWV0ZXJzKS4kc2VhcmNoID0gc2VhcmNoVGVybTtcblx0XHQvLyBhZGQgY3VzdG9tIHNvcnRlciB0byB0YWtlIGNhcmUgb2YgZ3JvdXBpbmcgdGhlIGFkZGl0aW9uYWwgdmFsdWVzXG5cdFx0Y29uc3Qgc29ydGVyOiBTb3J0ZXJbXSA9IFt0aGlzLmdldFNvcnRlcigpXTtcblx0XHRjb25zdCBhZGRpdGlvbmFsVmFsdWVzTGlzdEJpbmRpbmcgPSB2YWx1ZUhlbHBMaXN0QmluZGluZ1xuXHRcdFx0LmdldE1vZGVsKClcblx0XHRcdC5iaW5kTGlzdCh2YWx1ZUhlbHBCaW5kaW5nSW5mby5wYXRoLCB1bmRlZmluZWQsIHNvcnRlciwgYWRkaXRpb25hbFZhbHVlRmlsdGVycywgdmFsdWVIZWxwQmluZGluZ0luZm8ucGFyYW1ldGVycyk7XG5cdFx0Ly8gZ2V0IHJlY29tbWVuZGF0aW9uIGNvbnRleHRzIGZyb20gYmFja2VuZFxuXHRcdGNvbnN0IGFkZGl0aW9uYWxWYWx1ZUNvbnRleHRzOiBDb250ZXh0W10gPSBhd2FpdCBhZGRpdGlvbmFsVmFsdWVzTGlzdEJpbmRpbmcucmVxdWVzdENvbnRleHRzKCk7XG5cdFx0cmV0dXJuIGFkZGl0aW9uYWxWYWx1ZUNvbnRleHRzLm1hcCgoY29udGV4dCkgPT4gY29udGV4dC5nZXRPYmplY3QoKSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTtcblx0fSxcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgcmVzcG9uc2libGUgdG8gZmV0Y2ggdGhlIHZhbHVlaGVscCBiaW5kaW5nIGZpbHRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHBCaW5kaW5nSW5mbyBUaGUgYmluZGluZyBpbmZvIG9iamVjdCB0byBiZSB1c2VkIHRvIGJpbmQgdGhlIGxpc3QgdG8gdGhlIG1vZGVsXG5cdCAqIEByZXR1cm5zIEZpbHRlcnMgb2YgdmFsdWVoZWxwIGJpbmRpbmdcblx0ICovXG5cdGdldFZhbHVlSGVscEJpbmRpbmdGaWx0ZXJzOiBmdW5jdGlvbiAodmFsdWVIZWxwQmluZGluZ0luZm86IEFnZ3JlZ2F0aW9uQmluZGluZ0luZm8pIHtcblx0XHQvLyBnZXQgYWxsIGV4aXN0aW5nIGZpbHRlcnMgZnJvbSB0aGUgYmluZGluZyBpbmZvXG5cdFx0Ly8gdGhpcyArIGFkZGl0aW9uYWwgdmFsdWUgZmlsdGVycyB3aWxsIGJlIHVzZWQgbGF0ZXIgb24gdG8gZmV0Y2ggYWRkaXRpb25hbCB2YWx1ZXMgZnJvbSB0aGUgYmFja2VuZFxuXHRcdGlmICh2YWx1ZUhlbHBCaW5kaW5nSW5mby5maWx0ZXJzKSB7XG5cdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZUhlbHBCaW5kaW5nSW5mby5maWx0ZXJzKSkge1xuXHRcdFx0XHRyZXR1cm4gdmFsdWVIZWxwQmluZGluZ0luZm8uZmlsdGVycztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBbdmFsdWVIZWxwQmluZGluZ0luZm8uZmlsdGVyc107XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBbXTtcblx0fSxcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmVzdW1lcyB0aGUgc3VzcGVuZGVkIGxpc3QgYmluZGluZyBhbmQgdGhlbiByZXNldHMgY2hhbmdlcyBvbiBpdC5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlSGVscExpc3RCaW5kaW5nIExpc3QgYmluZGluZ1xuXHQgKi9cblx0cmVzdW1lVmFsdWVMaXN0QmluZGluZ0FuZFJlc2V0Q2hhbmdlczogYXN5bmMgZnVuY3Rpb24gKHZhbHVlSGVscExpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nKSB7XG5cdFx0aWYgKHZhbHVlSGVscExpc3RCaW5kaW5nLmlzU3VzcGVuZGVkKCkpIHtcblx0XHRcdHZhbHVlSGVscExpc3RCaW5kaW5nLnJlc3VtZSgpO1xuXHRcdH1cblx0XHQvLyBnZXQgcmlkIG9mIGV4aXN0aW5nIHRyYW5zaWVudCBjb250ZXh0cy5cblxuXHRcdC8vIGRlc3Ryb3lpbmcgY2F1c2VzIGlzc3VlcyBzb21ldGltZXMsIGNvbnRleHRzIGFyZSBub3QgYWx3YXlzIGF2YWlsYWJsZSB0byBkZXN0cm95IGJ1dCBhcHBlYXIgYWZ0ZXJ3YXJkcyBtYWdpY2FsbHlcblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdmFsdWVIZWxwTGlzdEJpbmRpbmcucmVzZXRDaGFuZ2VzKCk7XG5cdFx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdC8vV2UgZG8gbm90IGRvIGFueXRoaW5nIGhlcmUgYXMgd2Uga25vdyB0aGUgbW9kZWwgd2lsbCBhbHdheXMgdGhyb3cgYW4gZXJyb3IgYW5kIHRoaXMgd2lsbCBmaWxsIHVwIHRoZSBjb25zb2xlIHdpdGggZXJyb3JzLlxuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBzb3J0IGFuZCBmaWx0ZXIgdGhlIE90aGVycyBncm91cCB3aGljaCBjb250YWlucyBvdGhlciB2YWx1ZXMgd2hpY2ggYXJlIG5vdCBhZGRpdGlvbmFsIHZhbHVlcy5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlSGVscExpc3RCaW5kaW5nIExpc3QgQmluZGluZ1xuXHQgKiBAcGFyYW0gdmFsdWVIZWxwQmluZGluZ0luZm8gVGhlIGJpbmRpbmcgaW5mbyBvYmplY3QgdG8gYmUgdXNlZCB0byBiaW5kIHRoZSBsaXN0IHRvIHRoZSBtb2RlbFxuXHQgKiBAcGFyYW0gdW5pcXVlQWRkaXRpb25hbFZhbHVlcyBBcnJheSBvZiBhZGRpdGlvbmFsIHZhbHVlcyB3aGljaCBjb250YWluIHZhbHVlcyB3aGljaCBhcmUgdW5pcXVlIHRvIGVhY2ggZ3JvdXBcblx0ICovXG5cdHNvcnRBbmRGaWx0ZXJPdGhlcnM6IGZ1bmN0aW9uIChcblx0XHR2YWx1ZUhlbHBMaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHR2YWx1ZUhlbHBCaW5kaW5nSW5mbzogQWdncmVnYXRpb25CaW5kaW5nSW5mbyxcblx0XHR1bmlxdWVBZGRpdGlvbmFsVmFsdWVzOiBBZGRpdGlvbmFsVmFsdWVUeXBlW11cblx0KSB7XG5cdFx0Ly8gZmlsdGVyaW5nIG9uIHZhbHVlTGlzdEJpbmRpbmcgaXMgcmVxdWlyZWQgdG8gc2hvdyB0aGUgXCJPdGhlcnNcIiBzZWN0aW9uXG5cdFx0Ly8gV2Ugc2hvdWxkIG9ubHkgZmlsdGVyIG9uIHZhbHVlSGVscEJpbmRpbmcgd2hlbiB0aGVyZSBpcyBzZWFyY2ggdGVybSBlbnRlcmVkXG5cdFx0Ly8gb3RoZXJ3aXNlIHdlIGRvIG5vdCB3YW50IHRvIHNob3cgdGhlIFwiT3RoZXJzXCIgc2VjdGlvblxuXHRcdGNvbnN0IG90aGVyR3JvdXBGaWx0ZXJzID0gdGhpcy5jcmVhdGVGaWx0ZXJzRm9yT3RoZXJzR3JvdXAoXG5cdFx0XHR1bmlxdWVBZGRpdGlvbmFsVmFsdWVzLFxuXHRcdFx0dGhpcy5nZXRWYWx1ZUhlbHBCaW5kaW5nRmlsdGVycyh2YWx1ZUhlbHBCaW5kaW5nSW5mbylcblx0XHQpO1xuXHRcdHZhbHVlSGVscExpc3RCaW5kaW5nLmZpbHRlcihbb3RoZXJHcm91cEZpbHRlcnNdLCBGaWx0ZXJUeXBlLkFwcGxpY2F0aW9uKTtcblx0XHR2YWx1ZUhlbHBMaXN0QmluZGluZy5zb3J0KHRoaXMuZ2V0U29ydGVyKCkpO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbnMgY3JlYXRlcyB0aGUgZmlsdGVycyBmb3IgYWRkaXRpb25hbCB2YWx1ZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSByZXZlcnNlQWRkaXRpb25hbFZhbHVlcyBBcnJheSBvZiBhZGRpdGlvbmFsIHZhbHVlcyBpbiByZXZlcnNlIG9yZGVyXG5cdCAqIEBwYXJhbSBmaWx0ZXJzIEV4aXN0aW5nIHZhbHVlaGVscCBiaW5kaW5nIGZpbHRlcnNcblx0ICogQHJldHVybnMgQWRkaXRpb25hbCB2YWx1ZSBmaWx0ZXJzXG5cdCAqL1xuXHRnZXRBZGRpdGlvbmFsVmFsdWVGaWx0ZXJzOiBmdW5jdGlvbiAocmV2ZXJzZUFkZGl0aW9uYWxWYWx1ZXM6IEFkZGl0aW9uYWxWYWx1ZVR5cGVbXSwgZmlsdGVyczogRmlsdGVyW10pIHtcblx0XHRyZXZlcnNlQWRkaXRpb25hbFZhbHVlcy5mb3JFYWNoKChhZGRpdGlvbmFsVmFsdWUpID0+IHtcblx0XHRcdGlmIChhZGRpdGlvbmFsVmFsdWUudmFsdWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29uc3QgdmFsdWVzID0gYWRkaXRpb25hbFZhbHVlLnZhbHVlcztcblx0XHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoID0gYWRkaXRpb25hbFZhbHVlLnByb3BlcnR5UGF0aDtcblx0XHRcdFx0Ly8gYWRkIGFkZGl0aW9uYWwgdmFsdWUgZmlsdGVycyB0byBleGlzdGluZyBmaWx0ZXJzIGZyb20gdGhlIGJpbmRpbmcgaW5mb1xuXHRcdFx0XHR2YWx1ZXMuZm9yRWFjaCgodmFsdWUpID0+IHtcblx0XHRcdFx0XHQvLyB1cGRhdGUgdGhlIHZhbHVlIGhlbHAgYmluZGluZyBpbmZvIHRvIGdldCBhZGRpdGlvbmFsIHZhbHVlcyBmcm9tIHRoZSBiYWNrZW5kXG5cdFx0XHRcdFx0ZmlsdGVycy5wdXNoKFxuXHRcdFx0XHRcdFx0bmV3IEZpbHRlcih7XG5cdFx0XHRcdFx0XHRcdHBhdGg6IHByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRcdFx0dmFsdWUxOiB2YWx1ZSxcblx0XHRcdFx0XHRcdFx0b3BlcmF0b3I6IFwiRVFcIlxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gZmlsdGVycztcblx0fSxcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIGN1c3RvbSBzb3J0ZXIgd2hpY2ggd2lsbCBiZSB1c2VkIHRvIGdyb3VwIGFkZGl0aW9uYWwgdmFsdWVzIGFuZCBhbHNvIGNyZWF0ZSBPdGhlcnMgZ3JvdXAuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEN1c3RvbSBTb3J0ZXIgY29udGFpbmluZyBkaWZmZXJlbnQgZ3JvdXBzXG5cdCAqL1xuXHRnZXRTb3J0ZXI6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBUaGlzIHNvcnRlciB3aWxsIHJldHVybiBhIGN1c3RvbSBzb3J0ZXJcblx0XHRyZXR1cm4gbmV3IFNvcnRlcihcIlwiLCBmYWxzZSwgdGhpcy5nZXRTb3J0ZXJGdW5jdGlvbik7XG5cdH0sXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIGEgY2FsbGJhY2sgdG8gdGhlIGN1c3RvbSBzb3J0ZXIuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgb2YgdGhlIEZpZWxkXG5cdCAqIEByZXR1cm5zIEdyb3VwIGtleSB0aGF0IGNhbiBiZSB1c2VkIGZvciBzb3J0aW5nXG5cdCAqL1xuXHRnZXRTb3J0ZXJGdW5jdGlvbjogZnVuY3Rpb24gKGNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRjb25zdCByZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLm1hY3Jvc1wiKTtcblx0XHQvL2dldCB0aGUgY2xpZW50IHNpZGUgYW5ub3RhdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBncm91cGtleVxuXHRcdGNvbnN0IGdyb3VwS2V5ID0gY29udGV4dC5nZXRQcm9wZXJ0eShcIkAkZmUuYWRkaXRpb25hbFZhbHVlR3JvdXBLZXlcIikgYXMgc3RyaW5nO1xuXHRcdGlmIChncm91cEtleSA9PT0gQWRkaXRpb25hbFZhbHVlR3JvdXBLZXkucmVjb21tZW5kYXRpb24pIHtcblx0XHRcdHJldHVybiByZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiTV9BRERJVElPTkFMVkFMVUVIRUxQRVJfUkVDT01NRU5EQVRJT05TXCIpO1xuXHRcdH0gZWxzZSBpZiAoZ3JvdXBLZXkgPT09IEFkZGl0aW9uYWxWYWx1ZUdyb3VwS2V5LnJlY2VudFZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fQURESVRJT05BTFZBTFVFSEVMUEVSX1JFQ0VOVFZBTFVFXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk1fQURESVRJT05BTFZBTFVFSEVMUEVSX09USEVSU1wiKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gY3JlYXRlIHRyYW5zaWVudCBjb250ZXh0cyBmb3IgdGhlIGFkZGl0aW9uYWwgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gYWRkaXRpb25hbFZhbHVlQ29udGV4dERhdGEgQXJyYXkgb2YgQ29udGV4dHMgY3JlYXRlZCBmb3IgYWRkaXRpb25hbCB2YWx1ZXNcblx0ICogQHBhcmFtIHJldmVyc2VBZGRpdGlvbmFsVmFsdWVzIEFycmF5IG9mIGFkZGl0aW9uYWwgdmFsdWVzIGluIHJldmVyc2Ugb3JkZXJcblx0ICogQHBhcmFtIHZhbHVlSGVscExpc3RCaW5kaW5nIExpc3QgQmluZGluZ1xuXHQgKi9cblx0Y3JlYXRlQWRkaXRpb25hbFZhbHVlVHJhbnNpZW50Q29udGV4dHM6IGZ1bmN0aW9uIChcblx0XHRhZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YTogUmVjb3JkPHN0cmluZywgc3RyaW5nPltdLFxuXHRcdHJldmVyc2VBZGRpdGlvbmFsVmFsdWVzOiBBZGRpdGlvbmFsVmFsdWVUeXBlW10sXG5cdFx0dmFsdWVIZWxwTGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmdcblx0KSB7XG5cdFx0aWYgKGFkZGl0aW9uYWxWYWx1ZUNvbnRleHREYXRhLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vIHJlY29tbWVuZGF0aW9ucyBleGlzdCBpbiB0aGUgdmFsdWVoZWxwXG5cdFx0XHQvLyBub3cgYWRkIHRyYW5zaWVudCBjb250ZXh0IHRvIHRoZSBsaXN0IGJpbmRpbmcgcGVyIGFkZGl0aW9uYWwgdmFsdWUgZ3JvdXBcblx0XHRcdHJldmVyc2VBZGRpdGlvbmFsVmFsdWVzLmZvckVhY2goKGFkZGl0aW9uYWxWYWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCB2YWx1ZXMgPSBhZGRpdGlvbmFsVmFsdWUudmFsdWVzO1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBhZGRpdGlvbmFsVmFsdWUucHJvcGVydHlQYXRoO1xuXHRcdFx0XHRjb25zdCBncm91cEtleSA9IGFkZGl0aW9uYWxWYWx1ZS5ncm91cEtleTtcblx0XHRcdFx0Ly9zb3J0aW5nIGFuZCBsb29waW5nIHRocm91Z2ggdGhlIGFkZGl0aW9uYWxWYWx1ZUNvbnRleHREYXRhIHRvIGNyZWF0ZSB0cmFuc2llbnQgY29udGV4dHNcblx0XHRcdFx0dGhpcy5zb3J0QWRkaXRpb25hbFZhbHVlQ29udGV4dERhdGFBbmRDcmVhdGVDb250ZXh0cyhcblx0XHRcdFx0XHRhZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YSxcblx0XHRcdFx0XHR2YWx1ZXMsXG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdHZhbHVlSGVscExpc3RCaW5kaW5nLFxuXHRcdFx0XHRcdGdyb3VwS2V5XG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHVzZWQgdG8gc29ydCB0aGUgYWRkaXRpb25hbCB2YWx1ZSBjb250ZXh0IGRhdGEgYW5kIGNyZWF0ZSBjb250ZXh0cy5cblx0ICpcblx0ICogQHBhcmFtIGFkZGl0aW9uYWxWYWx1ZUNvbnRleHREYXRhIEFycmF5IG9mIENvbnRleHRzIGNyZWF0ZWQgZm9yIGFkZGl0aW9uYWwgdmFsdWVzXG5cdCAqIEBwYXJhbSB2YWx1ZXMgQXJyYXkgb2YgdmFsdWVzIHdoaWNoIGFyZSBhIHBhcnQgb2YgYWRkaXRpb25hbHZhbHVlc1xuXHQgKiBAcGFyYW0gcHJvcGVydHlQYXRoIFBhdGggcG9pbnRpbmcgdG8gdGhlIHByb3BlcnR5IG9mIHRoZSBmaWVsZFxuXHQgKiBAcGFyYW0gdmFsdWVIZWxwTGlzdEJpbmRpbmcgTGlzdCBCaW5kaW5nXG5cdCAqIEBwYXJhbSBncm91cEtleSBBZGRpdGlvbmFsVmFsdWVHcm91cEtleVxuXHQgKi9cblx0c29ydEFkZGl0aW9uYWxWYWx1ZUNvbnRleHREYXRhQW5kQ3JlYXRlQ29udGV4dHM6IGZ1bmN0aW9uIChcblx0XHRhZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YTogUmVjb3JkPHN0cmluZywgc3RyaW5nPltdLFxuXHRcdHZhbHVlczogKHN0cmluZyB8IG51bWJlcilbXSxcblx0XHRwcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0XHR2YWx1ZUhlbHBMaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRncm91cEtleTogQWRkaXRpb25hbFZhbHVlR3JvdXBLZXlcblx0KSB7XG5cdFx0Wy4uLnZhbHVlc10ucmV2ZXJzZSgpLmZvckVhY2goKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIpID0+IHtcblx0XHRcdGFkZGl0aW9uYWxWYWx1ZUNvbnRleHREYXRhLmZvckVhY2goKGNvbnRleHREYXRhOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KSA9PiB7XG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gY29udGV4dERhdGFbcHJvcGVydHlQYXRoXSkge1xuXHRcdFx0XHRcdGNvbnRleHREYXRhW1wiQCRmZS5hZGRpdGlvbmFsVmFsdWVHcm91cEtleVwiXSA9IGdyb3VwS2V5O1xuXHRcdFx0XHRcdHZhbHVlSGVscExpc3RCaW5kaW5nLmNyZWF0ZShjb250ZXh0RGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiB3aWxsIHJlbW92ZSB0aGUgZHVwbGljYXRlIHZhbHVlcyB3aGljaCBhcmUgYSBwYXJ0IG9mIGRpZmZlcmVudCBhZGRpdGlvbmFsIHZhbHVlIGdyb3Vwcy5cblx0ICpcblx0ICogQHBhcmFtIGFkZGl0aW9uYWxWYWx1ZUNvbnRleHREYXRhIEFycmF5IG9mIENvbnRleHRzIGNyZWF0ZWQgZm9yIGFkZGl0aW9uYWwgdmFsdWVzXG5cdCAqIEBwYXJhbSBhZGRpdGlvbmFsVmFsdWVzIEFycmF5IG9mIGFkZGl0aW9uYWwgdmFsdWVzXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIGFkZGl0aW9uYWwgdmFsdWVzIHdoaWNoIGNvbnRhaW4gdW5pcXVlIHZhbHVlcyBpbiBlYWNoIGdyb3VwXG5cdCAqL1xuXHRyZW1vdmVEdXBsaWNhdGVBZGRpdGlvbmFsVmFsdWVzOiBmdW5jdGlvbiAoXG5cdFx0YWRkaXRpb25hbFZhbHVlQ29udGV4dERhdGE6IFJlY29yZDxzdHJpbmcsIHN0cmluZz5bXSxcblx0XHRhZGRpdGlvbmFsVmFsdWVzOiBBZGRpdGlvbmFsVmFsdWVUeXBlW11cblx0KSB7XG5cdFx0Y29uc3QgdW5pcXVlQWRkaXRpb25hbFZhbHVlczogQWRkaXRpb25hbFZhbHVlVHlwZVtdID0gW107XG5cdFx0Ly9jcmVhdGUgYSBkZWVwIGNvcHkgdG8gbWFrZSBzdXJlIHdlIGRvbnQgYWx0ZXIgdGhlIG9yaWdpbmFsIGFkZGl0aW9uYWx2YWx1ZXNcblx0XHRhZGRpdGlvbmFsVmFsdWVzLmZvckVhY2goKGFkZGl0aW9uYWxWYWx1ZSkgPT4ge1xuXHRcdFx0Y29uc3QgdmFsdWVzID0gWy4uLmFkZGl0aW9uYWxWYWx1ZS52YWx1ZXNdO1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoID0gYWRkaXRpb25hbFZhbHVlLnByb3BlcnR5UGF0aDtcblx0XHRcdGNvbnN0IGdyb3VwS2V5ID0gYWRkaXRpb25hbFZhbHVlLmdyb3VwS2V5O1xuXHRcdFx0dW5pcXVlQWRkaXRpb25hbFZhbHVlcy5wdXNoKHsgdmFsdWVzLCBwcm9wZXJ0eVBhdGgsIGdyb3VwS2V5IH0pO1xuXHRcdH0pO1xuXHRcdC8vbG9vcCB0aHJvdWdoIHRoZSBhZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YSBhbmQgdW5pcXVlQWRkaXRpb25hbFZhbHVlcyB0byBzZWUgaWYgdGhlcmUgYXJlIGFueSBkdXBsaWNhdGVzIGFuZCB0aGVuIHJlbW92ZSB0aGVtXG5cdFx0YWRkaXRpb25hbFZhbHVlQ29udGV4dERhdGEuZm9yRWFjaCgoY29udGV4dERhdGEpID0+IHtcblx0XHRcdGxldCBkdXBsaWNhdGVGbGFnID0gZmFsc2U7XG5cdFx0XHR1bmlxdWVBZGRpdGlvbmFsVmFsdWVzLmZvckVhY2goKGFkZGl0aW9uYWxWYWx1ZSkgPT4ge1xuXHRcdFx0XHRjb25zdCB2YWx1ZXMgPSBhZGRpdGlvbmFsVmFsdWUudmFsdWVzO1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBhZGRpdGlvbmFsVmFsdWUucHJvcGVydHlQYXRoO1xuXHRcdFx0XHRpZiAodmFsdWVzLmluY2x1ZGVzKGNvbnRleHREYXRhW3Byb3BlcnR5UGF0aF0pKSB7XG5cdFx0XHRcdFx0aWYgKGR1cGxpY2F0ZUZsYWcpIHtcblx0XHRcdFx0XHRcdC8vIGlmIHdlIGZpbmQgYSBkdXBsaWNhdGUgdGhlbiByZW1vdmUgaXQgZnJvbSB0aGUgYXJyYXlcblx0XHRcdFx0XHRcdHZhbHVlcy5zcGxpY2UodmFsdWVzLmluZGV4T2YoY29udGV4dERhdGFbcHJvcGVydHlQYXRoXSksIDEpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRkdXBsaWNhdGVGbGFnID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHJldHVybiB1bmlxdWVBZGRpdGlvbmFsVmFsdWVzO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGNyZWF0ZSBmaWx0ZXJzIHRvIGZldGNoIHZhbHVlcyBvdGhlciB0aGFuIGFkZGl0aW9uYWwgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gdW5pcXVlQWRkaXRpb25hbFZhbHVlcyBBcnJheSBvZiBhZGRpdGlvbmFsIHZhbHVlcyB3aGljaCBjb250YWluIHZhbHVlcyB3aGljaCBhcmUgdW5pcXVlIHRvIGVhY2ggZ3JvdXBcblx0ICogQHBhcmFtIHZhbHVlaGVscEZpbHRlcnMgRmlsdGVycyB3aGljaCBhcmUgYWxyZWFkeSBhIHBhcnQgb2YgVmFsdWVIZWxwIEJpbmRpbmdcblx0ICogQHJldHVybnMgRmlsdGVycyBmb3IgT3RoZXJzIGdyb3VwXG5cdCAqL1xuXHRjcmVhdGVGaWx0ZXJzRm9yT3RoZXJzR3JvdXA6IGZ1bmN0aW9uICh1bmlxdWVBZGRpdGlvbmFsVmFsdWVzOiBBZGRpdGlvbmFsVmFsdWVUeXBlW10sIHZhbHVlaGVscEZpbHRlcnM6IEZpbHRlcltdKSB7XG5cdFx0Y29uc3QgZmlsdGVyczogRmlsdGVyW10gPSBbXTtcblx0XHQvL2NyZWF0ZSBmaWx0ZXJzIG5vdCBlcXVhbCB0byB0aGUgdmFsdWVzIG9mIHVuaXF1ZUFkZGl0aW9uYWxWYWx1ZXNcblx0XHR1bmlxdWVBZGRpdGlvbmFsVmFsdWVzLmZvckVhY2goKGFkZGl0aW9uYWxWYWx1ZSkgPT4ge1xuXHRcdFx0Y29uc3QgdmFsdWVzID0gYWRkaXRpb25hbFZhbHVlLnZhbHVlcztcblx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aCA9IGFkZGl0aW9uYWxWYWx1ZS5wcm9wZXJ0eVBhdGg7XG5cdFx0XHR2YWx1ZXMuZm9yRWFjaCgodmFsdWUpID0+IHtcblx0XHRcdFx0ZmlsdGVycy5wdXNoKFxuXHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogcHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiB2YWx1ZSxcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBcIk5FXCJcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0Ly9zZXQgYW5kIHRvIHRydWUgZm9yIHRoZSB1bmlxdWVBZGRpdGlvbmFsVmFsdWVzIGZpbHRlcnNcblx0XHRjb25zdCB1bmlxdWVBZGRpdGlvbmFsVmFsdWVzRmlsdGVycyA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0ZmlsdGVyczogZmlsdGVycyxcblx0XHRcdGFuZDogdHJ1ZVxuXHRcdH0pO1xuXHRcdC8vY2hlY2sgaWYgZmlsdGVycyBhcmUgYWxyZWFkeSBwcmVzZW50IG9uIHZhbHVlaGVscGJpbmRpbmcgYW5kIHB1c2ggdW5pcXVlQWRkaXRpb25hbFZhbHVlc0ZpbHRlcnMgaW50byB0aGUgdmFsdWVoZWxwYmluZGluZyBmaWx0ZXJzXG5cdFx0aWYgKHZhbHVlaGVscEZpbHRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0dmFsdWVoZWxwRmlsdGVycy5wdXNoKHVuaXF1ZUFkZGl0aW9uYWxWYWx1ZXNGaWx0ZXJzKTtcblx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0ZmlsdGVyczogdmFsdWVoZWxwRmlsdGVycyxcblx0XHRcdFx0YW5kOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9pZiBubyBwcmUgZXhpc3RpbmcgZmlsdGVycyBhcmUgcHJlc2VudCB0aGVuIHJldHVybiB1bmlxdWVBZGRpdGlvbmFsVmFsdWVzRmlsdGVyc1xuXHRcdFx0cmV0dXJuIHVuaXF1ZUFkZGl0aW9uYWxWYWx1ZXNGaWx0ZXJzO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb25zIHJldHVybnMgdGhlIHJlbGV2YW50IHJlY29tbWVuZGF0aW9ucyBmb3IgdGhlIHZhbHVlbGlzdC5cblx0ICpcblx0ICogQHBhcmFtIGRhdGEgT2JqZWN0IGNvbnRhaW5pbmcgcmVjb21tZW5kYXRpb24gbW9kZWwgZGF0YVxuXHQgKiBAcGFyYW0gYmluZGluZ0NvbnRleHQgQmluZGluZyBjb250ZXh0IG9mIHRoZSBGaWVsZFxuXHQgKiBAcGFyYW0gcHJvcGVydHlQYXRoIFByb3BlcnR5IFBhdGggb2YgdGhlIEZpZWxkXG5cdCAqIEByZXR1cm5zIFJlbGV2YW50IHJlY29tbWVuZGF0aW9ucyBmb3IgdGhlIHZhbHVlbGlzdFxuXHQgKi9cblx0Z2V0UmVsZXZhbnRSZWNvbW1lbmRhdGlvbnM6IGZ1bmN0aW9uIChkYXRhOiBJbkNvbXBsZXRlbmVzc0luZm9UeXBlIHwge30sIGJpbmRpbmdDb250ZXh0OiBDb250ZXh0LCBwcm9wZXJ0eVBhdGg6IHN0cmluZykge1xuXHRcdGNvbnN0IHZhbHVlczogQXJyYXk8c3RyaW5nIHwgbnVtYmVyPiA9IFtdO1xuXHRcdGxldCByZWxldmFudFJlY29tbWVuZGF0aW9uczogSW50ZXJuYWxQcm9wZXJ0eUFkZGl0aW9uYWxWYWx1ZTtcblx0XHRpZiAoT2JqZWN0LmtleXMoZGF0YSkubGVuZ3RoID4gMCkge1xuXHRcdFx0Ly9nZXQgdGhlIHJpZ2h0IHByb3BlcnR5IHBhdGggYnkgZWxpbWluYXRpbmcgdGhlIHN0YXJ0aW5nIC8gYW5kIGFsc28gbWFpbiBlbnRpdHlzZXQgbmFtZVxuXHRcdFx0cHJvcGVydHlQYXRoID0gdGhpcy5nZXRSZWNvbW1lbmRhdGlvblByb3BlcnR5UGF0aChwcm9wZXJ0eVBhdGgpO1xuXHRcdFx0Ly9nZXQgdGhlIHJlY29tbWVuZGF0aW9ucyBiYXNlZCBvbiBwcm9wZXJ0eSBwYXRoIGFuZCBiaW5kaW5nIGNvbnRleHQgcGFzc2VkXG5cdFx0XHRyZWxldmFudFJlY29tbWVuZGF0aW9ucyA9IHRoaXMuZ2V0QWRkaXRpb25hbFZhbHVlRnJvbVByb3BlcnR5UGF0aChcblx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRkYXRhLFxuXHRcdFx0XHRiaW5kaW5nQ29udGV4dFxuXHRcdFx0KSBhcyBJbnRlcm5hbFByb3BlcnR5QWRkaXRpb25hbFZhbHVlO1xuXHRcdFx0Ly9pZiB3ZSBnZXQgcmVjb21tZW5kYXRpb25zIHRoZW4gcHVzaCB0aGUgdmFsdWVzXG5cdFx0XHRpZiAoT2JqZWN0LmtleXMocmVsZXZhbnRSZWNvbW1lbmRhdGlvbnMpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0cmVsZXZhbnRSZWNvbW1lbmRhdGlvbnMuYWRkaXRpb25hbFZhbHVlcy5mb3JFYWNoKCh2YWx1ZURhdGE6IFJlY29tbWVuZGF0aW9uRGF0YUlubmVyT2JqZWN0VHlwZSkgPT4ge1xuXHRcdFx0XHRcdHZhbHVlcy5wdXNoKHZhbHVlRGF0YS52YWx1ZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWVzO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9pZiByZWNvbW1lbmRhdGlvbnMgYXJlIG5vdCBmb3VuZCB0aGVuIHJldHVybiBudWxsXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgcmVzcG9uc2libGUgdG8gZmV0Y2ggdGhlIGV4YWN0IG9iamVjdCBmcm9tIGFuIGFycmF5IG9mIG9iamVjdHMgdGhhdCBjb250YWlucyByZWxldmFudCByZWNvbW1lbmRhdGlvbkRhdGEgYmFzZWQgb24ga2V5cy5cblx0ICpcblx0ICogQHBhcmFtIHJlY29tbWVuZGF0aW9uRGF0YSBBcnJheSBjb250YWluaW5nIGFkZGl0aW9uYWwgdmFsdWVzXG5cdCAqIEBwYXJhbSBiaW5kaW5nQ29udGV4dCBCaW5kaW5nIGNvbnRleHQgb2YgdGhlIEZpZWxkXG5cdCAqIEByZXR1cm5zIFJlbGV2YW50IG9iamVjdCBmcm9tIGFuIGFycmF5IG9mIG9iamVjdCB0aGF0IGNvbnRhaW5zIHRoZSBhZGRpdGlvbmFsIHZhbHVlXG5cdCAqL1xuXHRnZXRBZGRpdGlvbmFsVmFsdWVGcm9tS2V5czogZnVuY3Rpb24gKHJlY29tbWVuZGF0aW9uRGF0YTogQWRkaXRpb25WYWx1ZURlZmluaXRpb24sIGJpbmRpbmdDb250ZXh0PzogQ29udGV4dCkge1xuXHRcdGNvbnN0IGNvbnRleHREYXRhID0gYmluZGluZ0NvbnRleHQ/LmdldE9iamVjdCgpIGFzIFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCB1bmRlZmluZWQ7XG5cdFx0bGV0IHJlc3VsdDogQWRkaXRpb25WYWx1ZURlZmluaXRpb24gPSB7fTtcblx0XHQvL2xvb3AgdGhyb3VnaCB0aGUgcmVjb21tZW5kYXRpb25EYXRhIGFuZCBjaGVjayBpZiB0aGUga2V5UHJvcGVydGllcyBtYXRjaCB3aXRoIHRoZSBiaW5kaW5nIGNvbnRleHQgZGF0YVxuXHRcdGlmIChiaW5kaW5nQ29udGV4dCAmJiBjb250ZXh0RGF0YSkge1xuXHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocmVjb21tZW5kYXRpb25EYXRhKSkge1xuXHRcdFx0XHQocmVjb21tZW5kYXRpb25EYXRhIGFzIFJlY29tbWVuZGF0aW9uRGF0YUZvck5hdlByb3BlcnR5VHlwZVtdKS5mb3JFYWNoKChyZWNEYXRhKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qga2V5UHJvcGVydGllcyA9IHJlY0RhdGEua2V5UHJvcGVydGllcyBhcyBLZXlQcm9wZXJ0aWVzRGF0YVR5cGU7XG5cdFx0XHRcdFx0bGV0IGFsbEtleXNNYXRjaCA9IHRydWU7XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBrZXkgaW4ga2V5UHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0aWYgKGtleVByb3BlcnRpZXNba2V5XSAhPT0gY29udGV4dERhdGFba2V5XSkge1xuXHRcdFx0XHRcdFx0XHRhbGxLZXlzTWF0Y2ggPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vaWYgZXZlcnkga2V5IHZhbHVlIG1hdGNoZXMgd2l0aCB0aGUgYmluZGluZyBjb250ZXh0IGRhdGEgdGhlbiBhc3NpZ24gaXQgdG8gcmVzdWx0IHdoaWNoIHdpbGwgYmUgcmV0dXJuZWRcblx0XHRcdFx0XHRpZiAoYWxsS2V5c01hdGNoKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgPSByZWNEYXRhIGFzIEFkZGl0aW9uVmFsdWVEZWZpbml0aW9uO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIHJlc3BvbnNpYmxlIGZvciBnZXR0aW5nIHRoZSBhZGRpdGlvbmFsIHZhbHVlIGJhc2VkIG9uIHByb3BlcnR5IHBhdGggYW5kIGJpbmRpbmcgY29udGV4dCBwYXNzZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eVBhdGggUHJvcGVydHkgcGF0aCBvZiB0aGUgZmllbGRcblx0ICogQHBhcmFtIHJlY29tbWVuZGF0aW9uRGF0YSBPYmplY3QgY29udGFpbmluZyBhZGRpdGlvbmFsIHZhbHVlXG5cdCAqIEBwYXJhbSBiaW5kaW5nQ29udGV4dCBCaW5kaW5nIGNvbnRleHQgb2YgdGhlIGZpZWxkXG5cdCAqIEByZXR1cm5zIEFkZGl0aW9uYWwgdmFsdWUgYmFzZWQgb24gcHJvcGVydHkgcGF0aCBhbmQgYmluZGluZyBjb250ZXh0IHBhc3NlZFxuXHQgKi9cblx0Z2V0QWRkaXRpb25hbFZhbHVlRnJvbVByb3BlcnR5UGF0aDogZnVuY3Rpb24gKFxuXHRcdHByb3BlcnR5UGF0aDogc3RyaW5nLFxuXHRcdHJlY29tbWVuZGF0aW9uRGF0YTogQWRkaXRpb25WYWx1ZURlZmluaXRpb24sXG5cdFx0YmluZGluZ0NvbnRleHQ6IENvbnRleHRcblx0KTogQWRkaXRpb25WYWx1ZURlZmluaXRpb24ge1xuXHRcdC8vY3JlYXRlIGEgY29weSBvZiB0aGUgcmVjb21tZW5kYXRpb25EYXRhIHRvIHN0b3JlIGl0cyBwcmV2aW91cyB2YWx1ZSBhcyBpdCB3aWxsIGNoYW5nZSBiZWNhdXNlIG9mIHRoZSByZWN1cnNpdmUgYXBwcm9hY2hcblx0XHRsZXQgb2xkRGF0YSA9IE9iamVjdC5hc3NpZ24ocmVjb21tZW5kYXRpb25EYXRhLCB7fSk7XG5cdFx0Ly9jaGVjayBpZiBwcm9wZXJ0eSBwYXRoIGV4aXN0cyBvbiB0aGUgcmVjb21tZW5kYXRpb25EYXRhIG9iamVjdCBhbmQgaWYgc28gdGhlbiByZXR1cm4gdGhlIG9iamVjdCBwb2ludGluZyB0byB0aGUgcHJvcGVydHkgcGF0aFxuXHRcdGlmIChPYmplY3Qua2V5cyhyZWNvbW1lbmRhdGlvbkRhdGEpLmluY2x1ZGVzKHByb3BlcnR5UGF0aCkpIHtcblx0XHRcdHJldHVybiAocmVjb21tZW5kYXRpb25EYXRhIGFzIEluQ29tcGxldGVuZXNzSW5mb1R5cGUpW3Byb3BlcnR5UGF0aF0gYXMgQWRkaXRpb25WYWx1ZURlZmluaXRpb247XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vaWYgcHJvcGVydHkgcGF0aCBpcyBub3QgcHJlc2VudCB0aGVuIGNoZWNrIGlmIGl0IGlzIDE6biBtYXBwaW5nIGFuZCB3ZSBuZWVkIHRvIGRvIGEgcmVjdXJzaXZlIGFwcHJvYWNoIHRvIGxhbmQgb24gdGhlIGV4YWN0IG9iamVjdCBjb250YWluaW5nIHRoZSByZWxldmFudCByZWNvbW1lbmRhdGlvbnNcblx0XHRcdC8vY29udGludWUgdGhlIHdoaWxlIGxvb3AgdGlsbCB0aGUgcHJvcGVydHkgcGF0aCBpcyBmb3VuZCBpbiB0aGUgcHJldmlvdXMgcmVjb21tZW5kYXRpb25EYXRhXG5cdFx0XHR3aGlsZSAoT2JqZWN0LmtleXMob2xkRGF0YSkubGVuZ3RoID4gMCAmJiAhT2JqZWN0LmtleXMob2xkRGF0YSkuaW5jbHVkZXMocHJvcGVydHlQYXRoKSkge1xuXHRcdFx0XHQvLyBhcyBpdCBtaWdodCBiZSAxOm4gbWFwcGluZyBzbyBmaXJzdCBzZXBlcmF0ZSB0aGUgbmF2cHJvcCBuYW1lIGFuZCBhY3R1YWwgcHJvcCBuYW1lIHRvIG1ha2Ugc3VyZSB3ZSBmaW5kIHRoZSBuYXZwcm9wIGZpcnN0IGFuZCB0aGVuIGZyb20gaXRzIHBvaW50aW5nIG9iamVjdCB3ZSBmaW5kIHRoZSBwcm9wZXJ0eSBwYXRoXG5cdFx0XHRcdC8vZWc6IF9JdGVtL01hdGVyaWFsIHdpbGwgYmUgZmlyc3QgZGl2aWRlZCBpbnRvIF9JdGVtIGFuZCB3ZSBzZWFyY2ggZm9yIGl0IGFuZCB0aGVuIGZyb20gaXRzIHJlbGV2YW50IG9iamVjdCB3ZSBzZWFyY2ggZm9yIE1hdGVyaWFsXG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aHMgPSBwcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRpZiAocHJvcGVydHlQYXRocy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0Ly9nZXR0aW5nIHRoZSBuYXZwcm9wIHBhdGhcblx0XHRcdFx0XHRjb25zdCBuYXZQcm9wUGF0aCA9IHByb3BlcnR5UGF0aHNbMF07XG5cdFx0XHRcdFx0Ly9yZW1vdmluZyB0aGUgbmF2cHJvcCBwYXRoIGZyb20gcHJvcGVydHlwYXRocyBzbyB0aGF0IHdlIG9ubHkgY2hlY2sgZm9yIGFjdHVhbCBwcm9wZXJ0eSBwYXRoXG5cdFx0XHRcdFx0cHJvcGVydHlQYXRocy5zcGxpY2UoMCwgMSk7XG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoID0gcHJvcGVydHlQYXRocy5qb2luKFwiL1wiKTtcblx0XHRcdFx0XHQvL3VzaW5nIGdldEFkZGl0aW9uYWxWYWx1ZUZyb21Qcm9wZXJ0eVBhdGggYW5kIHBhc3NpbmcgbmF2UHJvcFBhdGggd2UgZ2V0IHRoZSBleGFjdCBhcnJheSBvZiBvYmplY3RzIHBvaW50aW5nIHRvIHRoZSBuYXZQcm9wXG5cdFx0XHRcdFx0cmVjb21tZW5kYXRpb25EYXRhID0gdGhpcy5nZXRBZGRpdGlvbmFsVmFsdWVGcm9tUHJvcGVydHlQYXRoKFxuXHRcdFx0XHRcdFx0bmF2UHJvcFBhdGgsXG5cdFx0XHRcdFx0XHRyZWNvbW1lbmRhdGlvbkRhdGEsXG5cdFx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dFxuXHRcdFx0XHRcdCkgYXMgUmVjb21tZW5kYXRpb25EYXRhRm9yTmF2UHJvcGVydHlUeXBlW107XG5cdFx0XHRcdFx0Ly9ubyBwYXNzIHRoZSBhcnJheSBvZiBvYmplY3RzIG9mIG5hdlByb3AgdG8gZ2V0QWRkaXRpb25hbFZhbHVlRnJvbUtleXMgYW5kIGdldCB0aGUgZXhhY3Qgb2JqZWN0IHRoYXQgY29udGFpbnMgdGhlIHJlY29tbWVuZGF0aW9uRGF0YSBiYXNlZCBvbiBrZXlzXG5cdFx0XHRcdFx0cmVjb21tZW5kYXRpb25EYXRhID0gdGhpcy5nZXRBZGRpdGlvbmFsVmFsdWVGcm9tS2V5cyhyZWNvbW1lbmRhdGlvbkRhdGEsIGJpbmRpbmdDb250ZXh0KTtcblx0XHRcdFx0XHRpZiAoT2JqZWN0LmtleXMocmVjb21tZW5kYXRpb25EYXRhKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHQvL3NldCB0aGUgcmVjb21tZW5kYXRpb25EYXRhIHRvIG9sZERhdGEgYmVmb3JlIGFzc2lnbmluZyB0aGUgbmV3IHZhbHVlIHRvIGl0XG5cdFx0XHRcdFx0XHRvbGREYXRhID0gT2JqZWN0LmFzc2lnbihyZWNvbW1lbmRhdGlvbkRhdGEsIHt9KTtcblx0XHRcdFx0XHRcdC8vaGVyZSB3ZSBjaGVjayBmb3IgdGhlIGFjdHVhbCBwcm9wZXJ0eSBwYXRoIGZyb20gdGhlIG9iamVjdCB3ZSBmb3VuZCBmcm9tIGdldEFkZGl0aW9uYWxWYWx1ZUZyb21LZXlzXG5cdFx0XHRcdFx0XHQvL2VnOiBNYXRlcmlhbCBjYW4gYmUgZm91bmQgaW4gdGhlIG9iamVjdCB3aGljaCBpcyBwYXJ0IG9mIGFycmF5IG9mIG9iamVjdHMgb2YgX0l0ZW1cblx0XHRcdFx0XHRcdHJlY29tbWVuZGF0aW9uRGF0YSA9IHRoaXMuZ2V0QWRkaXRpb25hbFZhbHVlRnJvbVByb3BlcnR5UGF0aChwcm9wZXJ0eVBhdGgsIHJlY29tbWVuZGF0aW9uRGF0YSwgYmluZGluZ0NvbnRleHQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge307XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB7fTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHJlY29tbWVuZGF0aW9uRGF0YTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHByb3BlcnR5IHBhdGggb2YgdGhlIGZpZWxkIGJ5IHJlbW92aW5nIHRoZSBsZWFkaW5nICcvJyBhbmQgbWFpbiBlbnRpdHkgc2V0IG5hbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eVBhdGggUHJvcGVydHkgUGF0aCBvZiB0aGUgRmllbGRcblx0ICogQHJldHVybnMgUHJvcGVydHkgcGF0aCBvZiB0aGUgZmllbGQgYnkgcmVtb3ZpbmcgdGhlIGxlYWRpbmcgJy8nIGFuZCBtYWluIGVudGl0eSBzZXQgbmFtZS5cblx0ICovXG5cdGdldFJlY29tbWVuZGF0aW9uUHJvcGVydHlQYXRoOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHQvL0ZpcnN0IHdlIHNwbGl0IHRoZSBwcm9wZXJ0eSBwYXRoIGJhc2VkIG9uIC9cblx0XHRjb25zdCBwcm9wZXJ0eVBhdGhzID0gcHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHQvL05vdyByZW1vdmUgdGhlIGZpcnN0IHR3byBlbGVtZW50cyBvZiB0aGUgYXJyYXkuIEFzIGZpcnN0IGVsZW1lbnQgd2lsbCBhbHdheXMgYmUgJycgYW5kIHNlY29uZCBlbGVtZW50IHdpbGwgYmUgbWFpbiBlbnRpdHkgc2V0IG5hbWVcblx0XHRwcm9wZXJ0eVBhdGhzLnNwbGljZSgwLCAyKTtcblx0XHQvL05vdyBqb2luIHRoZSByZW1haW5pbmcgZWxlbWVudHMgdG8gY3JlYXRlIGEgbmV3IHByb3BlcnR5IHBhdGggYW5kIHJldHVybiBpdFxuXHRcdHJldHVybiBwcm9wZXJ0eVBhdGhzLmpvaW4oXCIvXCIpO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjaGVja3MgaWYgdGhlIGxpc3RiaW5kaW5nIGNvbnRhaW5zIHRyYW5zaWVudCBjb250ZXh0cyBhbmQgdGhleSBtYXRjaCB0aGUgZXhpc3RpbmcgYWRkaXRpb25hbCB2YWx1ZXMuIFRoaXMgaXMgdG8gZW5zdXJlXG5cdCAqIHdlIGRvIG5vdCBjcmVhdGUgZHVwbGljYXRlIHRyYW5zaWVudCBjb250ZXh0cy5cblx0ICpcblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIExpc3QgQmluZGluZ1xuXHQgKiBAcGFyYW0gYWRkaXRpb25hbFZhbHVlcyBBcnJheSBvZiBhZGRpdGlvbmFsIHZhbHVlcyB3aGljaCBjb250YWluIHZhbHVlcyB3aGljaCBhcmUgdW5pcXVlIHRvIGVhY2ggZ3JvdXBcblx0ICogQHJldHVybnMgQm9vbGVhbiB2YWx1ZSB3aGljaCB0ZWxscyB3aGV0aGVyIHRoZSBsaXN0IGJpbmRpbmcgY29udGFpbnMgZHVwbGljYXRlIHRyYW5zaWVudCBjb250ZXh0cyBvciBub3Rcblx0ICovXG5cdGRvZXNUcmFuc2llbnRDb250ZXh0c0FscmVhZHlFeGlzdDogZnVuY3Rpb24gKGxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLCBhZGRpdGlvbmFsVmFsdWVzOiBBZGRpdGlvbmFsVmFsdWVUeXBlW10pIHtcblx0XHRjb25zdCBjb250ZXh0cyA9IGxpc3RCaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cygpO1xuXHRcdGxldCBkb2VzVHJhbnNpZW50Q29udGV4dEV4aXN0cyA9IGZhbHNlO1xuXHRcdGFkZGl0aW9uYWxWYWx1ZXMuZm9yRWFjaCgoYWRkaXRpb25hbFZhbHVlKSA9PiB7XG5cdFx0XHRjb25zdCB2YWx1ZXMgPSBhZGRpdGlvbmFsVmFsdWUudmFsdWVzO1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoID0gYWRkaXRpb25hbFZhbHVlLnByb3BlcnR5UGF0aDtcblx0XHRcdC8vbG9vcGluZyB0aHJvdWdoIHRoZSBjb250ZXh0cyB0byBjaGVjayBpZiB0aGV5IGFyZSB0cmFuc2llbnQgYW5kIGNvbnRhaW4gdmFsdWVzXG5cdFx0XHRjb250ZXh0cy5mb3JFYWNoKChjb250ZXh0OiBDb250ZXh0KSA9PiB7XG5cdFx0XHRcdGNvbnN0IGNvbnRleHREYXRhID0gY29udGV4dC5nZXRPYmplY3QoKSBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuXHRcdFx0XHRjb25zdCBpc1RyYW5zaWVudCA9IGNvbnRleHQuaXNUcmFuc2llbnQoKTtcblx0XHRcdFx0Ly9XZSBjaGVjayBpZiB0aGUgY29udGV4dCBpcyB0cmFuc2llbnQgYW5kIGhhcyB0aGUgdmFsdWUgaW4gaXRcblx0XHRcdFx0aWYgKHZhbHVlcy5pbmNsdWRlcyhjb250ZXh0RGF0YVtwcm9wZXJ0eVBhdGhdKSAmJiBpc1RyYW5zaWVudCA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGRvZXNUcmFuc2llbnRDb250ZXh0RXhpc3RzID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdHJldHVybiBkb2VzVHJhbnNpZW50Q29udGV4dEV4aXN0cztcblx0fVxufTtcbmV4cG9ydCB7IGFkZGl0aW9uYWxWYWx1ZUhlbHBlciwgQWRkaXRpb25hbFZhbHVlR3JvdXBLZXkgfTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7TUFlS0EsdUJBQXVCO0VBQUEsV0FBdkJBLHVCQUF1QjtJQUF2QkEsdUJBQXVCO0lBQXZCQSx1QkFBdUI7RUFBQSxHQUF2QkEsdUJBQXVCLEtBQXZCQSx1QkFBdUI7RUFBQTtFQWE1QixNQUFNQyxxQkFBcUIsR0FBRztJQUM3QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLG9DQUFvQyxFQUFFLGdCQUNyQ0MsZ0JBQXVDLEVBQ3ZDQyxvQkFBc0MsRUFDdENDLG9CQUE0QyxFQUMzQztNQUNEO01BQ0EsTUFBTUMsdUJBQXVCLEdBQUcsQ0FBQyxHQUFHSCxnQkFBZ0IsQ0FBQyxDQUFDSSxPQUFPLEVBQUU7TUFDL0QsSUFBSSxDQUFDSCxvQkFBb0IsQ0FBQ0ksV0FBVyxFQUFFLEVBQUU7UUFDeENKLG9CQUFvQixDQUFDSyxPQUFPLEVBQUU7TUFDL0I7TUFDQSxJQUFJSixvQkFBb0IsQ0FBQ0ssVUFBVSxFQUFFO1FBQ3BDTixvQkFBb0IsQ0FBQ08sZ0JBQWdCLENBQUNOLG9CQUFvQixDQUFDSyxVQUFVLENBQUM7TUFDdkU7O01BRUE7TUFDQTtNQUNBO01BQ0E7TUFDQSxNQUFNRSxVQUFVLEdBQUlQLG9CQUFvQixDQUFDSyxVQUFVLENBQTJCRyxPQUFPO01BQ3JGLE1BQU1DLHNCQUFzQixHQUFHLElBQUksQ0FBQ0MseUJBQXlCLENBQUNULHVCQUF1QixFQUFFLENBQ3RGLEdBQUcsSUFBSSxDQUFDVSwwQkFBMEIsQ0FBQ1gsb0JBQW9CLENBQUMsQ0FDeEQsQ0FBQztNQUNEQSxvQkFBb0IsQ0FBQ0ssVUFBVSxDQUEyQkcsT0FBTyxHQUFHRCxVQUFVO01BQy9FO01BQ0EsTUFBTUssTUFBZ0IsR0FBRyxDQUFDLElBQUksQ0FBQ0MsU0FBUyxFQUFFLENBQUM7TUFDM0MsTUFBTUMs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
/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/type/TypeUtil", "sap/ui/mdc/field/FieldBaseDelegate", "sap/ui/mdc/odata/v4/TypeMap", "sap/ui/model/Filter"], function (Log, CommonUtils, TypeUtil, FieldBaseDelegate, ODataV4TypeMap, Filter) {
  "use strict";

  return Object.assign({}, FieldBaseDelegate, {
    apiVersion: 2,
    getTypeMap: function () {
      return ODataV4TypeMap;
    },
    /**
     * If the <code>Field</code> control is used, the used data type might come from the binding.
     * In V4-unit or currency case it might need to be formatted once.
     * To initialize the internal type later on, the currencies must be returned.
     *
     * @param field The <code>Field</code> instance
     * @param type Type from binding
     * @param value Given value
     * @returns Information needed to initialize internal type (needs to set bTypeInitialized to true if initialized)
     */
    initializeTypeFromBinding: function (field, type, value) {
      // V4 Unit and Currency types have a map with valid units and create an internal customizing for it.
      // The Field needs to keep this customizing logic when creating the internal type.
      // (As external RAW binding is used there is no formatting on parsing.)

      const result = {};
      if (type && type.isA(["sap.ui.model.odata.type.Unit", "sap.ui.model.odata.type.Currency"]) && Array.isArray(value) && value.length > 2 && value[2] !== undefined) {
        // format once to set internal customizing. Allow null as valid values for custom units
        type.formatValue(value, "string");
        result.bTypeInitialized = true;
        result.mCustomUnits = value[2]; // TODO: find a better way to provide custom units to internal type
      }

      return result;
    },
    /**
     * This function initializes the unit type.
     * If the <code>Field</code> control is used, the used data type might come from the binding.
     * If the type is a V4 unit or currency, it might need to be formatted once.
     *
     * @param field The <code>Field</code> instance
     * @param type Type from binding
     * @param typeInitialization Information needed to initialize internal type
     */
    initializeInternalUnitType: function (field, type, typeInitialization) {
      if ((typeInitialization === null || typeInitialization === void 0 ? void 0 : typeInitialization.mCustomUnits) !== undefined) {
        // if already initialized initialize new type too.
        type.formatValue([null, null, typeInitialization.mCustomUnits], "string");
      }
    },
    /**
     * This function enhances the value with unit or currency information if needed by the data type.
     *
     * @param field The <code>Field</code> instance
     * @param  values Values
     * @param  typeInitialization Information needed to initialize internal type
     * @returns Values
     */
    enhanceValueForUnit: function (field, values, typeInitialization) {
      if ((typeInitialization === null || typeInitialization === void 0 ? void 0 : typeInitialization.bTypeInitialized) === true && values.length === 2) {
        values.push(typeInitialization.mCustomUnits);
        return values;
      }
      return undefined;
    },
    /**
     * This function returns which <code>ValueHelpDelegate</code> is used
     * if a default field help (for example, for defining conditions in </code>FilterField</code>)
     * is created.
     *
     * @param field The <code>Field</code> instance
     * @returns Delegate object with name and payload
     */
    getDefaultValueHelpDelegate: function (field) {
      return {
        name: "sap/ui/mdc/odata/v4/ValueHelpDelegate",
        payload: {}
      };
    },
    getTypeUtil: function (field) {
      return TypeUtil;
    },
    /**
     * Determine all parameters in a value help that use a specific property.
     *
     * @param valueListInfo Value list info
     * @param propertyName Name of the property
     * @returns List of all found parameters
     */
    _getValueListParameter: function (valueListInfo, propertyName) {
      //determine path to value list property
      return valueListInfo.Parameters.filter(function (entry) {
        if (entry.LocalDataProperty) {
          return entry.LocalDataProperty.$PropertyPath === propertyName;
        } else {
          return false;
        }
      });
    },
    /**
     * Build filters for each relevant parameter.
     *
     * @param valueList Value list info
     * @param propertyName Name of the property
     * @param valueHelpProperty Name of the value help property
     * @param keyValue Value of the property
     * @param valuehelpPayload Payload of the value help
     * @param valuehelpConditionPayload Additional condition information for this key
     * @param bindingContext BindingContext of the field
     * @returns List of filters
     */
    _getFilter: function (valueList, propertyName, valueHelpProperty, keyValue, valuehelpPayload, valuehelpConditionPayload, bindingContext) {
      const filters = [];
      const parameters = valueList.Parameters.filter(function (parameter) {
        var _parameter$LocalDataP;
        return parameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterIn" || parameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterInOut" || ((_parameter$LocalDataP = parameter.LocalDataProperty) === null || _parameter$LocalDataP === void 0 ? void 0 : _parameter$LocalDataP.$PropertyPath) === propertyName && parameter.ValueListProperty === valueHelpProperty;
      });
      for (const parameter of parameters) {
        var _parameter$LocalDataP2;
        let filterValue;
        if (((_parameter$LocalDataP2 = parameter.LocalDataProperty) === null || _parameter$LocalDataP2 === void 0 ? void 0 : _parameter$LocalDataP2.$PropertyPath) === propertyName) {
          filterValue = keyValue;
        } else if ((valuehelpPayload === null || valuehelpPayload === void 0 ? void 0 : valuehelpPayload.isActionParameterDialog) === true) {
          var _parameter$LocalDataP3;
          const apdFieldPath = `APD_::${(_parameter$LocalDataP3 = parameter.LocalDataProperty) === null || _parameter$LocalDataP3 === void 0 ? void 0 : _parameter$LocalDataP3.$PropertyPath}`;
          const apdField = sap.ui.getCore().byId(apdFieldPath);
          filterValue = apdField === null || apdField === void 0 ? void 0 : apdField.getValue();
        } else if (valuehelpConditionPayload !== undefined) {
          var _parameter$LocalDataP4;
          const sourcePath = (_parameter$LocalDataP4 = parameter.LocalDataProperty) === null || _parameter$LocalDataP4 === void 0 ? void 0 : _parameter$LocalDataP4.$PropertyPath;
          const conditionPayload = valuehelpConditionPayload === null || valuehelpConditionPayload === void 0 ? void 0 : valuehelpConditionPayload[0];
          filterValue = sourcePath && (conditionPayload === null || conditionPayload === void 0 ? void 0 : conditionPayload[sourcePath]);
        } else if (bindingContext !== undefined) {
          var _parameter$LocalDataP5;
          // if the value help is not used try getting the filter value from the binding context
          const sourcePath = (_parameter$LocalDataP5 = parameter.LocalDataProperty) === null || _parameter$LocalDataP5 === void 0 ? void 0 : _parameter$LocalDataP5.$PropertyPath;
          filterValue = bindingContext.getObject(sourcePath);
        }
        /* Add value to the filter for the text determination */
        if (filterValue !== null && filterValue !== undefined) {
          filters.push(new Filter({
            path: parameter.ValueListProperty,
            operator: "EQ",
            value1: filterValue
          }));
        }
      }
      return filters;
    },
    /**
     * Determines the key, description, and payload of a user input.
     *
     * @param field The <code>Field</code> instance
     * @param valueHelp Value help instance
     * @param config Configuration Object
     * @returns Object containing description, key, and payload. If it is not available right now (must be requested), a <code>Promise</code> is returned
     */
    getItemForValue: function (field, valueHelp, config) {
      //BCP: 2270162887 . The MDC field should not try to get the item when the field is emptied
      // JIRA: FIORITECHP1-25361 - Improve the type-ahead behavior for missinng text annotation or constraints violations of the existing text annotation
      if (config.value === "") {
        return;
      }
      const payload = field.getPayload();
      if (config.checkDescription) {
        const valuehelpPayload = valueHelp.getPayload();
        const descriptionPath = valuehelpPayload.valueHelpDescriptionPath;
        const maxLength = valuehelpPayload === null || valuehelpPayload === void 0 ? void 0 : valuehelpPayload.maxLength;
        const valueLength = config.value !== null && config.value !== undefined ? config.value.toString().length : 0;
        if (descriptionPath === "") {
          // In case the property value help collection has no text annotation (descriptionPath is empty) the description check shouldn´t occur.
          // In such a case the method getDescription will be called by MDC and within this method a SideEffect is requested to retrieve the text from the text property of the main entity
          config.checkDescription = false;
        } else if (maxLength !== undefined && valueLength > maxLength) {
          //value length is > text proeperty length constraint
          return;
        }
      }
      return FieldBaseDelegate.getItemForValue(field, valueHelp, config);
    },
    /**
     * Determines the description for a given key.
     *
     * @param field The <code>Field</code> instance
     * @param valueHelp Field help assigned to the <code>Field</code> or <code>FilterField</code> control
     * @param key Key value of the description
     * @param _conditionIn In parameters for the key (no longer supported)
     * @param _conditionOut Out parameters for the key (no longer supported)
     * @param bindingContext BindingContext <code>BindingContext</code> of the checked field. Inside a table, the <code>FieldHelp</code> element can be connected to a different row
     * @param _ConditionModel ConditionModel</code>, if bound to one
     * @param _conditionModelName Name of the <code>ConditionModel</code>, if bound to one
     * @param conditionPayload Additional context information for this key
     * @param control Instance of the calling control
     * @param _type Type of the value
     * @returns Description for the key or object containing a description, key and payload. If the description is not available right away (it must be requested), a <code>Promise</code> is returned
     */
    getDescription: async function (field, valueHelp, key, _conditionIn, _conditionOut, bindingContext, _ConditionModel, _conditionModelName, conditionPayload, control, _type) {
      var _payload, _payload2;
      //JIRA: FIORITECHP1-22022 . The MDC field should not  tries to determine description with the initial GET of the data.
      // it should rely on the data we already received from the backend
      // But The getDescription function is also called in the FilterField case if a variant is loaded.
      // As the description text could be language dependent it is not stored in the variant, so it needs to be read on rendering.

      let payload = field === null || field === void 0 ? void 0 : field.getPayload();

      /* Retrieve text from value help, if value was set by out-parameter (BCP 2270160633) */
      if (!payload && control !== null && control !== void 0 && control.getDisplay().includes("Description")) {
        payload = {
          retrieveTextFromValueList: true
        };
      }
      if (((_payload = payload) === null || _payload === void 0 ? void 0 : _payload.retrieveTextFromValueList) === true || ((_payload2 = payload) === null || _payload2 === void 0 ? void 0 : _payload2.isFilterField) === true) {
        const dataModel = valueHelp.getModel();
        const metaModel = dataModel ? dataModel.getMetaModel() : CommonUtils.getAppComponent(valueHelp).getModel().getMetaModel();
        const valuehelpPayload = valueHelp.getPayload();
        const valuehelpConditionPayload = conditionPayload === null || conditionPayload === void 0 ? void 0 : conditionPayload[valuehelpPayload.valueHelpQualifier];
        const propertyPath = valuehelpPayload.propertyPath;
        const propertyDescriptionPath = valuehelpPayload === null || valuehelpPayload === void 0 ? void 0 : valuehelpPayload.propertyDescriptionPath;
        let textProperty;
        try {
          var _valueHelpParameters$;
          /* Request value help metadata */
          const valueListInfo = await metaModel.requestValueListInfo(propertyPath, true, bindingContext);
          const propertyName = metaModel.getObject(`${propertyPath}@sapui.name`);
          // take the first value list annotation - alternatively take the one without qualifier or the first one
          const valueList = valueListInfo[Object.keys(valueListInfo)[0]];
          const valueHelpParameters = this._getValueListParameter(valueList, propertyName);
          const valueHelpProperty = valueHelpParameters === null || valueHelpParameters === void 0 ? void 0 : (_valueHelpParameters$ = valueHelpParameters[0]) === null || _valueHelpParameters$ === void 0 ? void 0 : _valueHelpParameters$.ValueListProperty;
          if (!valueHelpProperty) {
            throw Error(`Inconsistent value help annotation for ${propertyName}`);
          }
          // get text annotation for this value list property
          const valueListModel = valueList.$model;
          const textAnnotation = valueListModel.getMetaModel().getObject(`/${valueList.CollectionPath}/${valueHelpProperty}@com.sap.vocabularies.Common.v1.Text`);
          if (textAnnotation && textAnnotation.$Path) {
            textProperty = textAnnotation.$Path;
            /* Build the filter for the relevant parameters */
            const filters = this._getFilter(valueList, propertyName, valueHelpProperty, key, valuehelpPayload, valuehelpConditionPayload, bindingContext);
            const listBinding = valueListModel.bindList(`/${valueList.CollectionPath}`, undefined, undefined, filters, {
              $select: textProperty
            });
            /* Request description for given key from value list entity */
            const contexts = await listBinding.requestContexts(0, 2);
            return contexts.length ? contexts[0].getObject(textProperty) : undefined;
          } else if (bindingContext !== undefined && propertyDescriptionPath) {
            const lastIndex = propertyDescriptionPath.lastIndexOf("/");
            const sideEffectPath = lastIndex > 0 ? propertyDescriptionPath.substring(0, lastIndex) : propertyDescriptionPath;
            const sideEffectsService = CommonUtils.getAppComponent(valueHelp).getSideEffectsService();
            await sideEffectsService.requestSideEffects([sideEffectPath], bindingContext);
            Log.warning(`RequestSideEffects is triggered because the text annotation for ${valueHelpProperty} is not defined at the CollectionPath of the value help`);
            return undefined;
          } else {
            Log.error(`Text Annotation for ${valueHelpProperty} is not defined`);
            return undefined;
          }
        } catch (error) {
          const status = error ? error.status : undefined;
          const message = error instanceof Error ? error.message : String(error);
          const msg = status === 404 ? `Metadata not found (${status}) for value help of property ${propertyPath}` : message;
          Log.error(msg);
        }
      }
      return undefined;
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPYmplY3QiLCJhc3NpZ24iLCJGaWVsZEJhc2VEZWxlZ2F0ZSIsImFwaVZlcnNpb24iLCJnZXRUeXBlTWFwIiwiT0RhdGFWNFR5cGVNYXAiLCJpbml0aWFsaXplVHlwZUZyb21CaW5kaW5nIiwiZmllbGQiLCJ0eXBlIiwidmFsdWUiLCJyZXN1bHQiLCJpc0EiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJmb3JtYXRWYWx1ZSIsImJUeXBlSW5pdGlhbGl6ZWQiLCJtQ3VzdG9tVW5pdHMiLCJpbml0aWFsaXplSW50ZXJuYWxVbml0VHlwZSIsInR5cGVJbml0aWFsaXphdGlvbiIsImVuaGFuY2VWYWx1ZUZvclVuaXQiLCJ2YWx1ZXMiLCJwdXNoIiwiZ2V0RGVmYXVsdFZhbHVlSGVscERlbGVnYXRlIiwibmFtZSIsInBheWxvYWQiLCJnZXRUeXBlVXRpbCIsIlR5cGVVdGlsIiwiX2dldFZhbHVlTGlzdFBhcmFtZXRlciIsInZhbHVlTGlzdEluZm8iLCJwcm9wZXJ0eU5hbWUiLCJQYXJhbWV0ZXJzIiwiZmlsdGVyIiwiZW50cnkiLCJMb2NhbERhdGFQcm9wZXJ0eSIsIiRQcm9wZXJ0eVBhdGgiLCJfZ2V0RmlsdGVyIiwidmFsdWVMaXN0IiwidmFsdWVIZWxwUHJvcGVydHkiLCJrZXlWYWx1ZSIsInZhbHVlaGVscFBheWxvYWQiLCJ2YWx1ZWhlbHBDb25kaXRpb25QYXlsb2FkIiwiYmluZGluZ0NvbnRleHQiLCJmaWx0ZXJzIiwicGFyYW1ldGVycyIsInBhcmFtZXRlciIsIiRUeXBlIiwiVmFsdWVMaXN0UHJvcGVydHkiLCJmaWx0ZXJWYWx1ZSIsImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nIiwiYXBkRmllbGRQYXRoIiwiYXBkRmllbGQiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJieUlkIiwiZ2V0VmFsdWUiLCJzb3VyY2VQYXRoIiwiY29uZGl0aW9uUGF5bG9hZCIsImdldE9iamVjdCIsIkZpbHRlciIsInBhdGgiLCJvcGVyYXRvciIsInZhbHVlMSIsImdldEl0ZW1Gb3JWYWx1ZSIsInZhbHVlSGVscCIsImNvbmZpZyIsImdldFBheWxvYWQiLCJjaGVja0Rlc2NyaXB0aW9uIiwiZGVzY3JpcHRpb25QYXRoIiwidmFsdWVIZWxwRGVzY3JpcHRpb25QYXRoIiwibWF4TGVuZ3RoIiwidmFsdWVMZW5ndGgiLCJ0b1N0cmluZyIsImdldERlc2NyaXB0aW9uIiwia2V5IiwiX2NvbmRpdGlvbkluIiwiX2NvbmRpdGlvbk91dCIsIl9Db25kaXRpb25Nb2RlbCIsIl9jb25kaXRpb25Nb2RlbE5hbWUiLCJjb250cm9sIiwiX3R5cGUiLCJnZXREaXNwbGF5IiwiaW5jbHVkZXMiLCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IiwiaXNGaWx0ZXJGaWVsZCIsImRhdGFNb2RlbCIsImdldE1vZGVsIiwibWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiQ29tbW9uVXRpbHMiLCJnZXRBcHBDb21wb25lbnQiLCJ2YWx1ZUhlbHBRdWFsaWZpZXIiLCJwcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0eURlc2NyaXB0aW9uUGF0aCIsInRleHRQcm9wZXJ0eSIsInJlcXVlc3RWYWx1ZUxpc3RJbmZvIiwia2V5cyIsInZhbHVlSGVscFBhcmFtZXRlcnMiLCJFcnJvciIsInZhbHVlTGlzdE1vZGVsIiwiJG1vZGVsIiwidGV4dEFubm90YXRpb24iLCJDb2xsZWN0aW9uUGF0aCIsIiRQYXRoIiwibGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsIiRzZWxlY3QiLCJjb250ZXh0cyIsInJlcXVlc3RDb250ZXh0cyIsImxhc3RJbmRleCIsImxhc3RJbmRleE9mIiwic2lkZUVmZmVjdFBhdGgiLCJzdWJzdHJpbmciLCJzaWRlRWZmZWN0c1NlcnZpY2UiLCJnZXRTaWRlRWZmZWN0c1NlcnZpY2UiLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJMb2ciLCJ3YXJuaW5nIiwiZXJyb3IiLCJzdGF0dXMiLCJtZXNzYWdlIiwiU3RyaW5nIiwibXNnIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWVsZEJhc2VEZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgVHlwZVV0aWwgZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvVHlwZVV0aWxcIjtcbmltcG9ydCB0eXBlIHtcblx0QW5ub3RhdGlvblZhbHVlTGlzdFR5cGUsXG5cdEFubm90YXRpb25WYWx1ZUxpc3RUeXBlQnlRdWFsaWZpZXIsXG5cdFZhbHVlSGVscFBheWxvYWRcbn0gZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvdmFsdWVoZWxwL1ZhbHVlTGlzdEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgQ29uZGl0aW9uTW9kZWwgZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvbk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBGaWVsZCBmcm9tIFwic2FwL3VpL21kYy9GaWVsZFwiO1xuaW1wb3J0IHR5cGUgRmllbGRCYXNlIGZyb20gXCJzYXAvdWkvbWRjL2ZpZWxkL0ZpZWxkQmFzZVwiO1xuaW1wb3J0IEZpZWxkQmFzZURlbGVnYXRlIGZyb20gXCJzYXAvdWkvbWRjL2ZpZWxkL0ZpZWxkQmFzZURlbGVnYXRlXCI7XG5pbXBvcnQgT0RhdGFWNFR5cGVNYXAgZnJvbSBcInNhcC91aS9tZGMvb2RhdGEvdjQvVHlwZU1hcFwiO1xuaW1wb3J0IHR5cGUgVmFsdWVIZWxwIGZyb20gXCJzYXAvdWkvbWRjL1ZhbHVlSGVscFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBTaW1wbGVUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvU2ltcGxlVHlwZVwiO1xuaW1wb3J0IHR5cGUgeyBDb25kaXRpb25QYXlsb2FkTWFwLCBDb25kaXRpb25QYXlsb2FkVHlwZSB9IGZyb20gXCIuLi92YWx1ZWhlbHAvVmFsdWVIZWxwRGVsZWdhdGVcIjtcbmV4cG9ydCB0eXBlIEZpZWxkUGF5bG9hZCA9IHtcblx0cmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdD86IGJvb2xlYW47XG5cdGlzRmlsdGVyRmllbGQ/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgVmFsdWUgPSBzdHJpbmcgfCBEYXRlIHwgbnVtYmVyIHwgYm9vbGVhbiB8IHVuZGVmaW5lZCB8IG51bGw7XG5cbmV4cG9ydCB0eXBlIFR5cGVJbml0aWFsaXphdGlvbiA9IHtcblx0YlR5cGVJbml0aWFsaXplZD86IGJvb2xlYW47XG5cdG1DdXN0b21Vbml0cz86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIENvbmZpZyA9IHtcblx0dmFsdWU6IFZhbHVlO1xuXHRwYXJzZWRWYWx1ZTogVmFsdWU7XG5cdGJpbmRpbmdDb250ZXh0OiBDb250ZXh0O1xuXHRjaGVja0tleTogYm9vbGVhbjtcblx0Y2hlY2tEZXNjcmlwdGlvbjogYm9vbGVhbjtcblx0Y29uZGl0aW9uTW9kZWw/OiBDb25kaXRpb25Nb2RlbDtcblx0Y29uZGl0aW9uTW9kZWxOYW1lPzogc3RyaW5nO1xuXHRjb250cm9sPzogb2JqZWN0O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmFzc2lnbih7fSwgRmllbGRCYXNlRGVsZWdhdGUsIHtcblx0YXBpVmVyc2lvbjogMixcblxuXHRnZXRUeXBlTWFwOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIE9EYXRhVjRUeXBlTWFwO1xuXHR9LFxuXHQvKipcblx0ICogSWYgdGhlIDxjb2RlPkZpZWxkPC9jb2RlPiBjb250cm9sIGlzIHVzZWQsIHRoZSB1c2VkIGRhdGEgdHlwZSBtaWdodCBjb21lIGZyb20gdGhlIGJpbmRpbmcuXG5cdCAqIEluIFY0LXVuaXQgb3IgY3VycmVuY3kgY2FzZSBpdCBtaWdodCBuZWVkIHRvIGJlIGZvcm1hdHRlZCBvbmNlLlxuXHQgKiBUbyBpbml0aWFsaXplIHRoZSBpbnRlcm5hbCB0eXBlIGxhdGVyIG9uLCB0aGUgY3VycmVuY2llcyBtdXN0IGJlIHJldHVybmVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGQgVGhlIDxjb2RlPkZpZWxkPC9jb2RlPiBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gdHlwZSBUeXBlIGZyb20gYmluZGluZ1xuXHQgKiBAcGFyYW0gdmFsdWUgR2l2ZW4gdmFsdWVcblx0ICogQHJldHVybnMgSW5mb3JtYXRpb24gbmVlZGVkIHRvIGluaXRpYWxpemUgaW50ZXJuYWwgdHlwZSAobmVlZHMgdG8gc2V0IGJUeXBlSW5pdGlhbGl6ZWQgdG8gdHJ1ZSBpZiBpbml0aWFsaXplZClcblx0ICovXG5cdGluaXRpYWxpemVUeXBlRnJvbUJpbmRpbmc6IGZ1bmN0aW9uIChmaWVsZDogRmllbGQsIHR5cGU6IFNpbXBsZVR5cGUgfCB1bmRlZmluZWQsIHZhbHVlOiBWYWx1ZSB8IFZhbHVlW10pIHtcblx0XHQvLyBWNCBVbml0IGFuZCBDdXJyZW5jeSB0eXBlcyBoYXZlIGEgbWFwIHdpdGggdmFsaWQgdW5pdHMgYW5kIGNyZWF0ZSBhbiBpbnRlcm5hbCBjdXN0b21pemluZyBmb3IgaXQuXG5cdFx0Ly8gVGhlIEZpZWxkIG5lZWRzIHRvIGtlZXAgdGhpcyBjdXN0b21pemluZyBsb2dpYyB3aGVuIGNyZWF0aW5nIHRoZSBpbnRlcm5hbCB0eXBlLlxuXHRcdC8vIChBcyBleHRlcm5hbCBSQVcgYmluZGluZyBpcyB1c2VkIHRoZXJlIGlzIG5vIGZvcm1hdHRpbmcgb24gcGFyc2luZy4pXG5cblx0XHRjb25zdCByZXN1bHQ6IFR5cGVJbml0aWFsaXphdGlvbiA9IHt9O1xuXHRcdGlmIChcblx0XHRcdHR5cGUgJiZcblx0XHRcdHR5cGUuaXNBKFtcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlVuaXRcIiwgXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5DdXJyZW5jeVwiXSkgJiZcblx0XHRcdEFycmF5LmlzQXJyYXkodmFsdWUpICYmXG5cdFx0XHR2YWx1ZS5sZW5ndGggPiAyICYmXG5cdFx0XHR2YWx1ZVsyXSAhPT0gdW5kZWZpbmVkXG5cdFx0KSB7XG5cdFx0XHQvLyBmb3JtYXQgb25jZSB0byBzZXQgaW50ZXJuYWwgY3VzdG9taXppbmcuIEFsbG93IG51bGwgYXMgdmFsaWQgdmFsdWVzIGZvciBjdXN0b20gdW5pdHNcblx0XHRcdHR5cGUuZm9ybWF0VmFsdWUodmFsdWUsIFwic3RyaW5nXCIpO1xuXHRcdFx0cmVzdWx0LmJUeXBlSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXHRcdFx0cmVzdWx0Lm1DdXN0b21Vbml0cyA9IHZhbHVlWzJdIGFzIHN0cmluZzsgLy8gVE9ETzogZmluZCBhIGJldHRlciB3YXkgdG8gcHJvdmlkZSBjdXN0b20gdW5pdHMgdG8gaW50ZXJuYWwgdHlwZVxuXHRcdH1cblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaW5pdGlhbGl6ZXMgdGhlIHVuaXQgdHlwZS5cblx0ICogSWYgdGhlIDxjb2RlPkZpZWxkPC9jb2RlPiBjb250cm9sIGlzIHVzZWQsIHRoZSB1c2VkIGRhdGEgdHlwZSBtaWdodCBjb21lIGZyb20gdGhlIGJpbmRpbmcuXG5cdCAqIElmIHRoZSB0eXBlIGlzIGEgVjQgdW5pdCBvciBjdXJyZW5jeSwgaXQgbWlnaHQgbmVlZCB0byBiZSBmb3JtYXR0ZWQgb25jZS5cblx0ICpcblx0ICogQHBhcmFtIGZpZWxkIFRoZSA8Y29kZT5GaWVsZDwvY29kZT4gaW5zdGFuY2Vcblx0ICogQHBhcmFtIHR5cGUgVHlwZSBmcm9tIGJpbmRpbmdcblx0ICogQHBhcmFtIHR5cGVJbml0aWFsaXphdGlvbiBJbmZvcm1hdGlvbiBuZWVkZWQgdG8gaW5pdGlhbGl6ZSBpbnRlcm5hbCB0eXBlXG5cdCAqL1xuXHRpbml0aWFsaXplSW50ZXJuYWxVbml0VHlwZTogZnVuY3Rpb24gKGZpZWxkOiBGaWVsZCwgdHlwZTogU2ltcGxlVHlwZSwgdHlwZUluaXRpYWxpemF0aW9uPzogVHlwZUluaXRpYWxpemF0aW9uKSB7XG5cdFx0aWYgKHR5cGVJbml0aWFsaXphdGlvbj8ubUN1c3RvbVVuaXRzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIGlmIGFscmVhZHkgaW5pdGlhbGl6ZWQgaW5pdGlhbGl6ZSBuZXcgdHlwZSB0b28uXG5cdFx0XHR0eXBlLmZvcm1hdFZhbHVlKFtudWxsLCBudWxsLCB0eXBlSW5pdGlhbGl6YXRpb24ubUN1c3RvbVVuaXRzXSwgXCJzdHJpbmdcIik7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGVuaGFuY2VzIHRoZSB2YWx1ZSB3aXRoIHVuaXQgb3IgY3VycmVuY3kgaW5mb3JtYXRpb24gaWYgbmVlZGVkIGJ5IHRoZSBkYXRhIHR5cGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWVsZCBUaGUgPGNvZGU+RmllbGQ8L2NvZGU+IGluc3RhbmNlXG5cdCAqIEBwYXJhbSAgdmFsdWVzIFZhbHVlc1xuXHQgKiBAcGFyYW0gIHR5cGVJbml0aWFsaXphdGlvbiBJbmZvcm1hdGlvbiBuZWVkZWQgdG8gaW5pdGlhbGl6ZSBpbnRlcm5hbCB0eXBlXG5cdCAqIEByZXR1cm5zIFZhbHVlc1xuXHQgKi9cblx0ZW5oYW5jZVZhbHVlRm9yVW5pdDogZnVuY3Rpb24gKGZpZWxkOiBGaWVsZCwgdmFsdWVzOiBWYWx1ZVtdLCB0eXBlSW5pdGlhbGl6YXRpb24/OiBUeXBlSW5pdGlhbGl6YXRpb24pIHtcblx0XHRpZiAodHlwZUluaXRpYWxpemF0aW9uPy5iVHlwZUluaXRpYWxpemVkID09PSB0cnVlICYmIHZhbHVlcy5sZW5ndGggPT09IDIpIHtcblx0XHRcdHZhbHVlcy5wdXNoKHR5cGVJbml0aWFsaXphdGlvbi5tQ3VzdG9tVW5pdHMpO1xuXHRcdFx0cmV0dXJuIHZhbHVlcztcblx0XHR9XG5cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIHJldHVybnMgd2hpY2ggPGNvZGU+VmFsdWVIZWxwRGVsZWdhdGU8L2NvZGU+IGlzIHVzZWRcblx0ICogaWYgYSBkZWZhdWx0IGZpZWxkIGhlbHAgKGZvciBleGFtcGxlLCBmb3IgZGVmaW5pbmcgY29uZGl0aW9ucyBpbiA8L2NvZGU+RmlsdGVyRmllbGQ8L2NvZGU+KVxuXHQgKiBpcyBjcmVhdGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gZmllbGQgVGhlIDxjb2RlPkZpZWxkPC9jb2RlPiBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBEZWxlZ2F0ZSBvYmplY3Qgd2l0aCBuYW1lIGFuZCBwYXlsb2FkXG5cdCAqL1xuXHRnZXREZWZhdWx0VmFsdWVIZWxwRGVsZWdhdGU6IGZ1bmN0aW9uIChmaWVsZDogRmllbGQpIHtcblx0XHRyZXR1cm4geyBuYW1lOiBcInNhcC91aS9tZGMvb2RhdGEvdjQvVmFsdWVIZWxwRGVsZWdhdGVcIiwgcGF5bG9hZDoge30gfTtcblx0fSxcblxuXHRnZXRUeXBlVXRpbDogZnVuY3Rpb24gKGZpZWxkOiBGaWVsZCkge1xuXHRcdHJldHVybiBUeXBlVXRpbDtcblx0fSxcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIGFsbCBwYXJhbWV0ZXJzIGluIGEgdmFsdWUgaGVscCB0aGF0IHVzZSBhIHNwZWNpZmljIHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWVMaXN0SW5mbyBWYWx1ZSBsaXN0IGluZm9cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcmV0dXJucyBMaXN0IG9mIGFsbCBmb3VuZCBwYXJhbWV0ZXJzXG5cdCAqL1xuXHRfZ2V0VmFsdWVMaXN0UGFyYW1ldGVyOiBmdW5jdGlvbiAodmFsdWVMaXN0SW5mbzogQW5ub3RhdGlvblZhbHVlTGlzdFR5cGUsIHByb3BlcnR5TmFtZTogc3RyaW5nKSB7XG5cdFx0Ly9kZXRlcm1pbmUgcGF0aCB0byB2YWx1ZSBsaXN0IHByb3BlcnR5XG5cdFx0cmV0dXJuIHZhbHVlTGlzdEluZm8uUGFyYW1ldGVycy5maWx0ZXIoZnVuY3Rpb24gKGVudHJ5KSB7XG5cdFx0XHRpZiAoZW50cnkuTG9jYWxEYXRhUHJvcGVydHkpIHtcblx0XHRcdFx0cmV0dXJuIGVudHJ5LkxvY2FsRGF0YVByb3BlcnR5LiRQcm9wZXJ0eVBhdGggPT09IHByb3BlcnR5TmFtZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIEJ1aWxkIGZpbHRlcnMgZm9yIGVhY2ggcmVsZXZhbnQgcGFyYW1ldGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWVMaXN0IFZhbHVlIGxpc3QgaW5mb1xuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5XG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHBQcm9wZXJ0eSBOYW1lIG9mIHRoZSB2YWx1ZSBoZWxwIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBrZXlWYWx1ZSBWYWx1ZSBvZiB0aGUgcHJvcGVydHlcblx0ICogQHBhcmFtIHZhbHVlaGVscFBheWxvYWQgUGF5bG9hZCBvZiB0aGUgdmFsdWUgaGVscFxuXHQgKiBAcGFyYW0gdmFsdWVoZWxwQ29uZGl0aW9uUGF5bG9hZCBBZGRpdGlvbmFsIGNvbmRpdGlvbiBpbmZvcm1hdGlvbiBmb3IgdGhpcyBrZXlcblx0ICogQHBhcmFtIGJpbmRpbmdDb250ZXh0IEJpbmRpbmdDb250ZXh0IG9mIHRoZSBmaWVsZFxuXHQgKiBAcmV0dXJucyBMaXN0IG9mIGZpbHRlcnNcblx0ICovXG5cdF9nZXRGaWx0ZXI6IGZ1bmN0aW9uIChcblx0XHR2YWx1ZUxpc3Q6IEFubm90YXRpb25WYWx1ZUxpc3RUeXBlLFxuXHRcdHByb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRcdHZhbHVlSGVscFByb3BlcnR5OiBzdHJpbmcsXG5cdFx0a2V5VmFsdWU6IHN0cmluZyxcblx0XHR2YWx1ZWhlbHBQYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLFxuXHRcdHZhbHVlaGVscENvbmRpdGlvblBheWxvYWQ6IENvbmRpdGlvblBheWxvYWRUeXBlW10gfCB1bmRlZmluZWQsXG5cdFx0YmluZGluZ0NvbnRleHQ/OiBDb250ZXh0XG5cdCkge1xuXHRcdGNvbnN0IGZpbHRlcnMgPSBbXTtcblx0XHRjb25zdCBwYXJhbWV0ZXJzID0gdmFsdWVMaXN0LlBhcmFtZXRlcnMuZmlsdGVyKGZ1bmN0aW9uIChwYXJhbWV0ZXIpIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdHBhcmFtZXRlci4kVHlwZSA9PT0gQ29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlckluIHx8XG5cdFx0XHRcdHBhcmFtZXRlci4kVHlwZSA9PT0gQ29tbW9uQW5ub3RhdGlvblR5cGVzLlZhbHVlTGlzdFBhcmFtZXRlckluT3V0IHx8XG5cdFx0XHRcdChwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHk/LiRQcm9wZXJ0eVBhdGggPT09IHByb3BlcnR5TmFtZSAmJiBwYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHkgPT09IHZhbHVlSGVscFByb3BlcnR5KVxuXHRcdFx0KTtcblx0XHR9KTtcblx0XHRmb3IgKGNvbnN0IHBhcmFtZXRlciBvZiBwYXJhbWV0ZXJzKSB7XG5cdFx0XHRsZXQgZmlsdGVyVmFsdWU7XG5cdFx0XHRpZiAocGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5Py4kUHJvcGVydHlQYXRoID09PSBwcm9wZXJ0eU5hbWUpIHtcblx0XHRcdFx0ZmlsdGVyVmFsdWUgPSBrZXlWYWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAodmFsdWVoZWxwUGF5bG9hZD8uaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2cgPT09IHRydWUpIHtcblx0XHRcdFx0Y29uc3QgYXBkRmllbGRQYXRoID0gYEFQRF86OiR7cGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5Py4kUHJvcGVydHlQYXRofWA7XG5cdFx0XHRcdGNvbnN0IGFwZEZpZWxkID0gc2FwLnVpLmdldENvcmUoKS5ieUlkKGFwZEZpZWxkUGF0aCkgYXMgRmllbGQ7XG5cdFx0XHRcdGZpbHRlclZhbHVlID0gYXBkRmllbGQ/LmdldFZhbHVlKCk7XG5cdFx0XHR9IGVsc2UgaWYgKHZhbHVlaGVscENvbmRpdGlvblBheWxvYWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25zdCBzb3VyY2VQYXRoID0gcGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5Py4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRjb25zdCBjb25kaXRpb25QYXlsb2FkID0gdmFsdWVoZWxwQ29uZGl0aW9uUGF5bG9hZD8uWzBdO1xuXHRcdFx0XHRmaWx0ZXJWYWx1ZSA9IHNvdXJjZVBhdGggJiYgY29uZGl0aW9uUGF5bG9hZD8uW3NvdXJjZVBhdGhdO1xuXHRcdFx0fSBlbHNlIGlmIChiaW5kaW5nQ29udGV4dCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdC8vIGlmIHRoZSB2YWx1ZSBoZWxwIGlzIG5vdCB1c2VkIHRyeSBnZXR0aW5nIHRoZSBmaWx0ZXIgdmFsdWUgZnJvbSB0aGUgYmluZGluZyBjb250ZXh0XG5cdFx0XHRcdGNvbnN0IHNvdXJjZVBhdGggPSBwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHk/LiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdGZpbHRlclZhbHVlID0gYmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KHNvdXJjZVBhdGgpO1xuXHRcdFx0fVxuXHRcdFx0LyogQWRkIHZhbHVlIHRvIHRoZSBmaWx0ZXIgZm9yIHRoZSB0ZXh0IGRldGVybWluYXRpb24gKi9cblx0XHRcdGlmIChmaWx0ZXJWYWx1ZSAhPT0gbnVsbCAmJiBmaWx0ZXJWYWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGZpbHRlcnMucHVzaChuZXcgRmlsdGVyKHsgcGF0aDogcGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LCBvcGVyYXRvcjogXCJFUVwiLCB2YWx1ZTE6IGZpbHRlclZhbHVlIH0pKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZpbHRlcnM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERldGVybWluZXMgdGhlIGtleSwgZGVzY3JpcHRpb24sIGFuZCBwYXlsb2FkIG9mIGEgdXNlciBpbnB1dC5cblx0ICpcblx0ICogQHBhcmFtIGZpZWxkIFRoZSA8Y29kZT5GaWVsZDwvY29kZT4gaW5zdGFuY2Vcblx0ICogQHBhcmFtIHZhbHVlSGVscCBWYWx1ZSBoZWxwIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBjb25maWcgQ29uZmlndXJhdGlvbiBPYmplY3Rcblx0ICogQHJldHVybnMgT2JqZWN0IGNvbnRhaW5pbmcgZGVzY3JpcHRpb24sIGtleSwgYW5kIHBheWxvYWQuIElmIGl0IGlzIG5vdCBhdmFpbGFibGUgcmlnaHQgbm93IChtdXN0IGJlIHJlcXVlc3RlZCksIGEgPGNvZGU+UHJvbWlzZTwvY29kZT4gaXMgcmV0dXJuZWRcblx0ICovXG5cdGdldEl0ZW1Gb3JWYWx1ZTogZnVuY3Rpb24gKGZpZWxkOiBGaWVsZCwgdmFsdWVIZWxwOiBWYWx1ZUhlbHAsIGNvbmZpZzogQ29uZmlnKSB7XG5cdFx0Ly9CQ1A6IDIyNzAxNjI4ODcgLiBUaGUgTURDIGZpZWxkIHNob3VsZCBub3QgdHJ5IHRvIGdldCB0aGUgaXRlbSB3aGVuIHRoZSBmaWVsZCBpcyBlbXB0aWVkXG5cdFx0Ly8gSklSQTogRklPUklURUNIUDEtMjUzNjEgLSBJbXByb3ZlIHRoZSB0eXBlLWFoZWFkIGJlaGF2aW9yIGZvciBtaXNzaW5uZyB0ZXh0IGFubm90YXRpb24gb3IgY29uc3RyYWludHMgdmlvbGF0aW9ucyBvZiB0aGUgZXhpc3RpbmcgdGV4dCBhbm5vdGF0aW9uXG5cdFx0aWYgKGNvbmZpZy52YWx1ZSA9PT0gXCJcIikge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHBheWxvYWQgPSBmaWVsZC5nZXRQYXlsb2FkKCkgYXMgRmllbGRQYXlsb2FkO1xuXHRcdGlmIChjb25maWcuY2hlY2tEZXNjcmlwdGlvbikge1xuXHRcdFx0Y29uc3QgdmFsdWVoZWxwUGF5bG9hZCA9IHZhbHVlSGVscC5nZXRQYXlsb2FkKCkgYXMgVmFsdWVIZWxwUGF5bG9hZDtcblx0XHRcdGNvbnN0IGRlc2NyaXB0aW9uUGF0aCA9IHZhbHVlaGVscFBheWxvYWQudmFsdWVIZWxwRGVzY3JpcHRpb25QYXRoO1xuXHRcdFx0Y29uc3QgbWF4TGVuZ3RoID0gdmFsdWVoZWxwUGF5bG9hZD8ubWF4TGVuZ3RoO1xuXHRcdFx0Y29uc3QgdmFsdWVMZW5ndGggPSBjb25maWcudmFsdWUgIT09IG51bGwgJiYgY29uZmlnLnZhbHVlICE9PSB1bmRlZmluZWQgPyBjb25maWcudmFsdWUudG9TdHJpbmcoKS5sZW5ndGggOiAwO1xuXHRcdFx0aWYgKGRlc2NyaXB0aW9uUGF0aCA9PT0gXCJcIikge1xuXHRcdFx0XHQvLyBJbiBjYXNlIHRoZSBwcm9wZXJ0eSB2YWx1ZSBoZWxwIGNvbGxlY3Rpb24gaGFzIG5vIHRleHQgYW5ub3RhdGlvbiAoZGVzY3JpcHRpb25QYXRoIGlzIGVtcHR5KSB0aGUgZGVzY3JpcHRpb24gY2hlY2sgc2hvdWxkbsK0dCBvY2N1ci5cblx0XHRcdFx0Ly8gSW4gc3VjaCBhIGNhc2UgdGhlIG1ldGhvZCBnZXREZXNjcmlwdGlvbiB3aWxsIGJlIGNhbGxlZCBieSBNREMgYW5kIHdpdGhpbiB0aGlzIG1ldGhvZCBhIFNpZGVFZmZlY3QgaXMgcmVxdWVzdGVkIHRvIHJldHJpZXZlIHRoZSB0ZXh0IGZyb20gdGhlIHRleHQgcHJvcGVydHkgb2YgdGhlIG1haW4gZW50aXR5XG5cdFx0XHRcdGNvbmZpZy5jaGVja0Rlc2NyaXB0aW9uID0gZmFsc2U7XG5cdFx0XHR9IGVsc2UgaWYgKG1heExlbmd0aCAhPT0gdW5kZWZpbmVkICYmIHZhbHVlTGVuZ3RoID4gbWF4TGVuZ3RoKSB7XG5cdFx0XHRcdC8vdmFsdWUgbGVuZ3RoIGlzID4gdGV4dCBwcm9lcGVydHkgbGVuZ3RoIGNvbnN0cmFpbnRcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gRmllbGRCYXNlRGVsZWdhdGUuZ2V0SXRlbUZvclZhbHVlKGZpZWxkLCB2YWx1ZUhlbHAsIGNvbmZpZyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERldGVybWluZXMgdGhlIGRlc2NyaXB0aW9uIGZvciBhIGdpdmVuIGtleS5cblx0ICpcblx0ICogQHBhcmFtIGZpZWxkIFRoZSA8Y29kZT5GaWVsZDwvY29kZT4gaW5zdGFuY2Vcblx0ICogQHBhcmFtIHZhbHVlSGVscCBGaWVsZCBoZWxwIGFzc2lnbmVkIHRvIHRoZSA8Y29kZT5GaWVsZDwvY29kZT4gb3IgPGNvZGU+RmlsdGVyRmllbGQ8L2NvZGU+IGNvbnRyb2xcblx0ICogQHBhcmFtIGtleSBLZXkgdmFsdWUgb2YgdGhlIGRlc2NyaXB0aW9uXG5cdCAqIEBwYXJhbSBfY29uZGl0aW9uSW4gSW4gcGFyYW1ldGVycyBmb3IgdGhlIGtleSAobm8gbG9uZ2VyIHN1cHBvcnRlZClcblx0ICogQHBhcmFtIF9jb25kaXRpb25PdXQgT3V0IHBhcmFtZXRlcnMgZm9yIHRoZSBrZXkgKG5vIGxvbmdlciBzdXBwb3J0ZWQpXG5cdCAqIEBwYXJhbSBiaW5kaW5nQ29udGV4dCBCaW5kaW5nQ29udGV4dCA8Y29kZT5CaW5kaW5nQ29udGV4dDwvY29kZT4gb2YgdGhlIGNoZWNrZWQgZmllbGQuIEluc2lkZSBhIHRhYmxlLCB0aGUgPGNvZGU+RmllbGRIZWxwPC9jb2RlPiBlbGVtZW50IGNhbiBiZSBjb25uZWN0ZWQgdG8gYSBkaWZmZXJlbnQgcm93XG5cdCAqIEBwYXJhbSBfQ29uZGl0aW9uTW9kZWwgQ29uZGl0aW9uTW9kZWw8L2NvZGU+LCBpZiBib3VuZCB0byBvbmVcblx0ICogQHBhcmFtIF9jb25kaXRpb25Nb2RlbE5hbWUgTmFtZSBvZiB0aGUgPGNvZGU+Q29uZGl0aW9uTW9kZWw8L2NvZGU+LCBpZiBib3VuZCB0byBvbmVcblx0ICogQHBhcmFtIGNvbmRpdGlvblBheWxvYWQgQWRkaXRpb25hbCBjb250ZXh0IGluZm9ybWF0aW9uIGZvciB0aGlzIGtleVxuXHQgKiBAcGFyYW0gY29udHJvbCBJbnN0YW5jZSBvZiB0aGUgY2FsbGluZyBjb250cm9sXG5cdCAqIEBwYXJhbSBfdHlwZSBUeXBlIG9mIHRoZSB2YWx1ZVxuXHQgKiBAcmV0dXJucyBEZXNjcmlwdGlvbiBmb3IgdGhlIGtleSBvciBvYmplY3QgY29udGFpbmluZyBhIGRlc2NyaXB0aW9uLCBrZXkgYW5kIHBheWxvYWQuIElmIHRoZSBkZXNjcmlwdGlvbiBpcyBub3QgYXZhaWxhYmxlIHJpZ2h0IGF3YXkgKGl0IG11c3QgYmUgcmVxdWVzdGVkKSwgYSA8Y29kZT5Qcm9taXNlPC9jb2RlPiBpcyByZXR1cm5lZFxuXHQgKi9cblx0Z2V0RGVzY3JpcHRpb246IGFzeW5jIGZ1bmN0aW9uIChcblx0XHRmaWVsZDogRmllbGQgfCBudWxsLFxuXHRcdHZhbHVlSGVscDogVmFsdWVIZWxwLFxuXHRcdGtleTogc3RyaW5nLFxuXHRcdF9jb25kaXRpb25Jbjogb2JqZWN0LFxuXHRcdF9jb25kaXRpb25PdXQ6IG9iamVjdCxcblx0XHRiaW5kaW5nQ29udGV4dDogQ29udGV4dCB8IHVuZGVmaW5lZCxcblx0XHRfQ29uZGl0aW9uTW9kZWw6IENvbmRpdGlvbk1vZGVsLFxuXHRcdF9jb25kaXRpb25Nb2RlbE5hbWU6IHN0cmluZyxcblx0XHRjb25kaXRpb25QYXlsb2FkOiBDb25kaXRpb25QYXlsb2FkTWFwLFxuXHRcdGNvbnRyb2w6IENvbnRyb2wsXG5cdFx0X3R5cGU6IHVua25vd25cblx0KSB7XG5cdFx0Ly9KSVJBOiBGSU9SSVRFQ0hQMS0yMjAyMiAuIFRoZSBNREMgZmllbGQgc2hvdWxkIG5vdCAgdHJpZXMgdG8gZGV0ZXJtaW5lIGRlc2NyaXB0aW9uIHdpdGggdGhlIGluaXRpYWwgR0VUIG9mIHRoZSBkYXRhLlxuXHRcdC8vIGl0IHNob3VsZCByZWx5IG9uIHRoZSBkYXRhIHdlIGFscmVhZHkgcmVjZWl2ZWQgZnJvbSB0aGUgYmFja2VuZFxuXHRcdC8vIEJ1dCBUaGUgZ2V0RGVzY3JpcHRpb24gZnVuY3Rpb24gaXMgYWxzbyBjYWxsZWQgaW4gdGhlIEZpbHRlckZpZWxkIGNhc2UgaWYgYSB2YXJpYW50IGlzIGxvYWRlZC5cblx0XHQvLyBBcyB0aGUgZGVzY3JpcHRpb24gdGV4dCBjb3VsZCBiZSBsYW5ndWFnZSBkZXBlbmRlbnQgaXQgaXMgbm90IHN0b3JlZCBpbiB0aGUgdmFyaWFudCwgc28gaXQgbmVlZHMgdG8gYmUgcmVhZCBvbiByZW5kZXJpbmcuXG5cblx0XHRsZXQgcGF5bG9hZCA9IGZpZWxkPy5nZXRQYXlsb2FkKCkgYXMgRmllbGRQYXlsb2FkO1xuXG5cdFx0LyogUmV0cmlldmUgdGV4dCBmcm9tIHZhbHVlIGhlbHAsIGlmIHZhbHVlIHdhcyBzZXQgYnkgb3V0LXBhcmFtZXRlciAoQkNQIDIyNzAxNjA2MzMpICovXG5cdFx0aWYgKCFwYXlsb2FkICYmIChjb250cm9sIGFzIEZpZWxkQmFzZSk/LmdldERpc3BsYXkoKS5pbmNsdWRlcyhcIkRlc2NyaXB0aW9uXCIpKSB7XG5cdFx0XHRwYXlsb2FkID0ge1xuXHRcdFx0XHRyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0OiB0cnVlXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGlmIChwYXlsb2FkPy5yZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0ID09PSB0cnVlIHx8IHBheWxvYWQ/LmlzRmlsdGVyRmllbGQgPT09IHRydWUpIHtcblx0XHRcdGNvbnN0IGRhdGFNb2RlbCA9IHZhbHVlSGVscC5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwgfCB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCBtZXRhTW9kZWwgPSBkYXRhTW9kZWxcblx0XHRcdFx0PyBkYXRhTW9kZWwuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0OiAoQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHZhbHVlSGVscCBhcyB1bmtub3duIGFzIENvbnRyb2wpXG5cdFx0XHRcdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0LmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0XHRcdGNvbnN0IHZhbHVlaGVscFBheWxvYWQgPSB2YWx1ZUhlbHAuZ2V0UGF5bG9hZCgpIGFzIFZhbHVlSGVscFBheWxvYWQ7XG5cdFx0XHRjb25zdCB2YWx1ZWhlbHBDb25kaXRpb25QYXlsb2FkID0gY29uZGl0aW9uUGF5bG9hZD8uW3ZhbHVlaGVscFBheWxvYWQudmFsdWVIZWxwUXVhbGlmaWVyXTtcblx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aCA9IHZhbHVlaGVscFBheWxvYWQucHJvcGVydHlQYXRoO1xuXHRcdFx0Y29uc3QgcHJvcGVydHlEZXNjcmlwdGlvblBhdGggPSB2YWx1ZWhlbHBQYXlsb2FkPy5wcm9wZXJ0eURlc2NyaXB0aW9uUGF0aDtcblx0XHRcdGxldCB0ZXh0UHJvcGVydHk6IHN0cmluZztcblxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0LyogUmVxdWVzdCB2YWx1ZSBoZWxwIG1ldGFkYXRhICovXG5cdFx0XHRcdGNvbnN0IHZhbHVlTGlzdEluZm8gPSAoYXdhaXQgbWV0YU1vZGVsLnJlcXVlc3RWYWx1ZUxpc3RJbmZvKFxuXHRcdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0XG5cdFx0XHRcdCkpIGFzIEFubm90YXRpb25WYWx1ZUxpc3RUeXBlQnlRdWFsaWZpZXI7XG5cblx0XHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gbWV0YU1vZGVsLmdldE9iamVjdChgJHtwcm9wZXJ0eVBhdGh9QHNhcHVpLm5hbWVgKSBhcyBzdHJpbmc7XG5cdFx0XHRcdC8vIHRha2UgdGhlIGZpcnN0IHZhbHVlIGxpc3QgYW5ub3RhdGlvbiAtIGFsdGVybmF0aXZlbHkgdGFrZSB0aGUgb25lIHdpdGhvdXQgcXVhbGlmaWVyIG9yIHRoZSBmaXJzdCBvbmVcblx0XHRcdFx0Y29uc3QgdmFsdWVMaXN0ID0gdmFsdWVMaXN0SW5mb1tPYmplY3Qua2V5cyh2YWx1ZUxpc3RJbmZvKVswXV07XG5cdFx0XHRcdGNvbnN0IHZhbHVlSGVscFBhcmFtZXRlcnMgPSB0aGlzLl9nZXRWYWx1ZUxpc3RQYXJhbWV0ZXIodmFsdWVMaXN0LCBwcm9wZXJ0eU5hbWUpO1xuXHRcdFx0XHRjb25zdCB2YWx1ZUhlbHBQcm9wZXJ0eSA9IHZhbHVlSGVscFBhcmFtZXRlcnM/LlswXT8uVmFsdWVMaXN0UHJvcGVydHk7XG5cdFx0XHRcdGlmICghdmFsdWVIZWxwUHJvcGVydHkpIHtcblx0XHRcdFx0XHR0aHJvdyBFcnJvcihgSW5jb25zaXN0ZW50IHZhbHVlIGhlbHAgYW5ub3RhdGlvbiBmb3IgJHtwcm9wZXJ0eU5hbWV9YCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gZ2V0IHRleHQgYW5ub3RhdGlvbiBmb3IgdGhpcyB2YWx1ZSBsaXN0IHByb3BlcnR5XG5cdFx0XHRcdGNvbnN0IHZhbHVlTGlzdE1vZGVsID0gdmFsdWVMaXN0LiRtb2RlbDtcblx0XHRcdFx0Y29uc3QgdGV4dEFubm90YXRpb24gPSB2YWx1ZUxpc3RNb2RlbFxuXHRcdFx0XHRcdC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0XHRcdC5nZXRPYmplY3QoYC8ke3ZhbHVlTGlzdC5Db2xsZWN0aW9uUGF0aH0vJHt2YWx1ZUhlbHBQcm9wZXJ0eX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgKTtcblx0XHRcdFx0aWYgKHRleHRBbm5vdGF0aW9uICYmIHRleHRBbm5vdGF0aW9uLiRQYXRoKSB7XG5cdFx0XHRcdFx0dGV4dFByb3BlcnR5ID0gdGV4dEFubm90YXRpb24uJFBhdGg7XG5cdFx0XHRcdFx0LyogQnVpbGQgdGhlIGZpbHRlciBmb3IgdGhlIHJlbGV2YW50IHBhcmFtZXRlcnMgKi9cblx0XHRcdFx0XHRjb25zdCBmaWx0ZXJzID0gdGhpcy5fZ2V0RmlsdGVyKFxuXHRcdFx0XHRcdFx0dmFsdWVMaXN0LFxuXHRcdFx0XHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0XHRcdFx0dmFsdWVIZWxwUHJvcGVydHksXG5cdFx0XHRcdFx0XHRrZXksXG5cdFx0XHRcdFx0XHR2YWx1ZWhlbHBQYXlsb2FkLFxuXHRcdFx0XHRcdFx0dmFsdWVoZWxwQ29uZGl0aW9uUGF5bG9hZCxcblx0XHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRjb25zdCBsaXN0QmluZGluZyA9IHZhbHVlTGlzdE1vZGVsLmJpbmRMaXN0KGAvJHt2YWx1ZUxpc3QuQ29sbGVjdGlvblBhdGh9YCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGZpbHRlcnMsIHtcblx0XHRcdFx0XHRcdCRzZWxlY3Q6IHRleHRQcm9wZXJ0eVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8qIFJlcXVlc3QgZGVzY3JpcHRpb24gZm9yIGdpdmVuIGtleSBmcm9tIHZhbHVlIGxpc3QgZW50aXR5ICovXG5cdFx0XHRcdFx0Y29uc3QgY29udGV4dHMgPSBhd2FpdCBsaXN0QmluZGluZy5yZXF1ZXN0Q29udGV4dHMoMCwgMik7XG5cdFx0XHRcdFx0cmV0dXJuIGNvbnRleHRzLmxlbmd0aCA/IGNvbnRleHRzWzBdLmdldE9iamVjdCh0ZXh0UHJvcGVydHkpIDogdW5kZWZpbmVkO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGJpbmRpbmdDb250ZXh0ICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydHlEZXNjcmlwdGlvblBhdGgpIHtcblx0XHRcdFx0XHRjb25zdCBsYXN0SW5kZXggPSBwcm9wZXJ0eURlc2NyaXB0aW9uUGF0aC5sYXN0SW5kZXhPZihcIi9cIik7XG5cdFx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdFBhdGggPSBsYXN0SW5kZXggPiAwID8gcHJvcGVydHlEZXNjcmlwdGlvblBhdGguc3Vic3RyaW5nKDAsIGxhc3RJbmRleCkgOiBwcm9wZXJ0eURlc2NyaXB0aW9uUGF0aDtcblx0XHRcdFx0XHRjb25zdCBzaWRlRWZmZWN0c1NlcnZpY2UgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodmFsdWVIZWxwIGFzIHVua25vd24gYXMgQ29udHJvbCkuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0XHRcdFx0YXdhaXQgc2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhbc2lkZUVmZmVjdFBhdGhdLCBiaW5kaW5nQ29udGV4dCk7XG5cdFx0XHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFx0XHRgUmVxdWVzdFNpZGVFZmZlY3RzIGlzIHRyaWdnZXJlZCBiZWNhdXNlIHRoZSB0ZXh0IGFubm90YXRpb24gZm9yICR7dmFsdWVIZWxwUHJvcGVydHl9IGlzIG5vdCBkZWZpbmVkIGF0IHRoZSBDb2xsZWN0aW9uUGF0aCBvZiB0aGUgdmFsdWUgaGVscGBcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKGBUZXh0IEFubm90YXRpb24gZm9yICR7dmFsdWVIZWxwUHJvcGVydHl9IGlzIG5vdCBkZWZpbmVkYCk7XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0Y29uc3Qgc3RhdHVzID0gZXJyb3IgPyAoZXJyb3IgYXMgWE1MSHR0cFJlcXVlc3QpLnN0YXR1cyA6IHVuZGVmaW5lZDtcblx0XHRcdFx0Y29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcblx0XHRcdFx0Y29uc3QgbXNnID0gc3RhdHVzID09PSA0MDQgPyBgTWV0YWRhdGEgbm90IGZvdW5kICgke3N0YXR1c30pIGZvciB2YWx1ZSBoZWxwIG9mIHByb3BlcnR5ICR7cHJvcGVydHlQYXRofWAgOiBtZXNzYWdlO1xuXHRcdFx0XHRMb2cuZXJyb3IobXNnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufSk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7U0E2Q2VBLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFQyxpQkFBaUIsRUFBRTtJQUNuREMsVUFBVSxFQUFFLENBQUM7SUFFYkMsVUFBVSxFQUFFLFlBQVk7TUFDdkIsT0FBT0MsY0FBYztJQUN0QixDQUFDO0lBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MseUJBQXlCLEVBQUUsVUFBVUMsS0FBWSxFQUFFQyxJQUE0QixFQUFFQyxLQUFzQixFQUFFO01BQ3hHO01BQ0E7TUFDQTs7TUFFQSxNQUFNQyxNQUEwQixHQUFHLENBQUMsQ0FBQztNQUNyQyxJQUNDRixJQUFJLElBQ0pBLElBQUksQ0FBQ0csR0FBRyxDQUFDLENBQUMsOEJBQThCLEVBQUUsa0NBQWtDLENBQUMsQ0FBQyxJQUM5RUMsS0FBSyxDQUFDQyxPQUFPLENBQUNKLEtBQUssQ0FBQyxJQUNwQkEsS0FBSyxDQUFDSyxNQUFNLEdBQUcsQ0FBQyxJQUNoQkwsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLTSxTQUFTLEVBQ3JCO1FBQ0Q7UUFDQVAsSUFBSSxDQUFDUSxXQUFXLENBQUNQLEtBQUssRUFBRSxRQUFRLENBQUM7UUFDakNDLE1BQU0sQ0FBQ08sZ0JBQWdCLEdBQUcsSUFBSTtRQUM5QlAsTUFBTSxDQUFDUSxZQUFZLEdBQUdULEtBQUssQ0FBQyxDQUFDLENBQVcsQ0FBQyxDQUFDO01BQzNDOztNQUVBLE9BQU9DLE1BQU07SUFDZCxDQUFDO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lB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
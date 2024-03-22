/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/TypeGuards", "sap/fe/core/type/TypeUtil", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/m/inputUtils/highlightDOMElements", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/p13n/StateUtil", "sap/ui/mdc/ValueHelpDelegate", "sap/ui/model/FilterType", "../internal/valuehelp/AdditionalValueHelper"], function (Log, CommonUtils, MetaModelConverter, TypeGuards, TypeUtil, ValueListHelper, highlightDOMElements, Condition, ConditionValidated, StateUtil, ValueHelpDelegate, FilterType, AdditionalValueHelper) {
  "use strict";

  var additionalValueHelper = AdditionalValueHelper.additionalValueHelper;
  var AdditionalValueGroupKey = AdditionalValueHelper.AdditionalValueGroupKey;
  var isPathAnnotationExpression = TypeGuards.isPathAnnotationExpression;
  var convertTypes = MetaModelConverter.convertTypes;
  const FeCoreControlsFilterBar = "sap.fe.core.controls.FilterBar";
  const MdcFilterbarFilterBarBase = "sap.ui.mdc.filterbar.FilterBarBase";
  return Object.assign({}, ValueHelpDelegate, {
    apiVersion: 2,
    /**
     * Checks if a <code>ListBinding</code> supports $Search.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param content Content element
     * @param _listBinding
     * @returns True if $search is supported
     */
    isSearchSupported: function (valueHelp, content, _listBinding) {
      return content.getFilterFields() === "$search";
    },
    /**
     * Adjustable filtering for list-based contents.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param content ValueHelp content requesting conditions configuration
     * @param bindingInfo The binding info object to be used to bind the list to the model
     */
    updateBindingInfo: function (valueHelp, content, bindingInfo) {
      ValueHelpDelegate.updateBindingInfo(valueHelp, content, bindingInfo);
      if (content.getFilterFields() === "$search") {
        const search = content.getFilterValue();
        const normalizedSearch = CommonUtils.normalizeSearchTerm(search); // adjustSearch

        if (bindingInfo.parameters) {
          bindingInfo.parameters.$search = normalizedSearch || undefined;
        }
      }
    },
    /**
     * Checks if field is recommendation relevant and calls either _updateBinding or _updateBindingForRecommendations.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param listBinding List binding
     * @param bindingInfo The binding info object to be used to bind the list to the model
     * @param content Filterable List Content
     */
    updateBinding: async function (valueHelp, listBinding, bindingInfo, content) {
      //We fetch the valuelist property from the payload to make sure we pass the right property while making a call on valuelist entity set
      const payload = valueHelp.getPayload();
      const valueListProperty = this._getValueListPropertyFromPayloadQualifier(payload);
      if (content.isTypeahead()) {
        const bindingContext = content.getBindingContext();
        const additionalValues = [];
        //get the recommendation data from the internal model
        const inputValues = content.getModel("internal").getProperty("/recommendationsData") || {};
        //Fetch the relevant recommendations based on the inputvalues and bindingcontext
        const values = additionalValueHelper.getRelevantRecommendations(inputValues, bindingContext, payload.propertyPath) || [];
        //if there are relevant recommendations then create additionalvalue structure and call _updateBindingForRecommendations
        if ((values === null || values === void 0 ? void 0 : values.length) > 0) {
          additionalValues.push({
            propertyPath: valueListProperty,
            values,
            groupKey: AdditionalValueGroupKey.recommendation
          });
          this._updateBindingForRecommendations(payload, listBinding, bindingInfo, additionalValues);
        } else {
          //call _updateBinding if there are no relevant recommendations
          this._updateBinding(listBinding, bindingInfo);
        }
      } else {
        //call _updateBinding if there are no relevant recommendations
        this._updateBinding(listBinding, bindingInfo);
      }
    },
    /**
     * Executes a filter in a <code>ListBinding</code>.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param listBinding List binding
     * @param _filter Filter
     * @param requestedItems Number of requested items
     * @returns Promise that is resolved if search is executed
     */
    executeFilter: async function (valueHelp, listBinding, _filter, requestedItems) {
      listBinding.getContexts(0, requestedItems);
      await this.checkListBindingPending(valueHelp, listBinding, requestedItems);
      return listBinding;
    },
    /**
     * Checks if the <code>ListBinding</code> is waiting for an update.
     * As long as the context has not been set for <code>ListBinding</code>,
     * <code>ValueHelp</code> needs to wait.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param listBinding ListBinding to check
     * @param requestedItems Number of requested items
     * @returns Promise that is resolved once ListBinding has been updated
     */
    checkListBindingPending: async function (valueHelp, listBinding, requestedItems) {
      const payload = valueHelp.getPayload();
      if (payload.updateBindingDonePromise) {
        return payload.updateBindingDonePromise;
      } else {
        if (!listBinding || listBinding.isSuspended()) {
          return false;
        }
        const contexts = await listBinding.requestContexts(0, requestedItems);
        return contexts.length === 0;
      }
    },
    getTypeUtil: function (valueHelp) {
      return TypeUtil;
    },
    /**
     * Requests the content of the value help.
     *
     * This function is called when the value help is opened or a key or description is requested.
     *
     * So, depending on the value help content used, all content controls and data need to be assigned.
     * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
     * Only then does the value help continue opening or reading data.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param container Container instance
     * @param contentId Id of the content shown after this call to retrieveContent
     * @returns Promise that is resolved if all content is available
     */
    retrieveContent: function (valueHelp, container, contentId) {
      const payload = valueHelp.getPayload();
      return ValueListHelper.showValueList(payload, container, contentId);
    },
    _getConditionPayloadList: function (condition) {
      const conditionPayloadMap = condition.payload || {},
        valueHelpQualifiers = Object.keys(conditionPayloadMap),
        conditionPayloadList = valueHelpQualifiers.length ? conditionPayloadMap[valueHelpQualifiers[0]] : [];
      return conditionPayloadList;
    },
    /**
     * Returns ValueListProperty from Payload based on data from payload keys and parameters.
     *
     * @param payload Payload for delegate
     * @returns ValueListProperty
     */
    _getValueListPropertyFromPayloadQualifier: function (payload) {
      const params = payload.qualifiers[payload.valueHelpQualifier].vhParameters || [];
      const keys = payload.qualifiers[payload.valueHelpQualifier].vhKeys || [];
      const propertyKeyPath = payload.valueHelpKeyPath;
      let filteredKeys = [...keys];
      const helpPaths = [];
      if (params.length > 0) {
        //create helpPaths array which will only consist of params helppath
        params.forEach(function (param) {
          helpPaths.push(param.helpPath);
        });
        //filter the keys based on helpPaths. If key is not present in helpPath then it is valuelistproperty
        filteredKeys = keys.filter(key => {
          return !helpPaths.includes(key);
        });
      }

      // from filteredKeys return the key that matches the property name
      return propertyKeyPath && filteredKeys.includes(propertyKeyPath) ? propertyKeyPath : "";
    },
    _onConditionPropagationToFilterBar: async function (filterBarVH, conditions, outParameters, filterBar) {
      try {
        const state = await StateUtil.retrieveExternalState(filterBar);
        const filterItemsVH = filterBarVH.getFilterItems();
        for (const condition of conditions) {
          const conditionPayloadList = this._getConditionPayloadList(condition);
          for (const outParameter of outParameters) {
            const filterTarget = outParameter.source.split("/").pop() || "";
            // propagate OUT parameter only if the filter field is visible in the LR filterbar
            if (
            // LR FilterBar or LR AdaptFilter
            filterItemsVH.find(item => item.getId().split("::").pop() === filterTarget)) {
              for (const conditionPayload of conditionPayloadList) {
                const newCondition = Condition.createCondition("EQ", [conditionPayload[outParameter.helpPath]], null, null, ConditionValidated.Validated);
                state.filter[filterTarget] ||= [];
                state.filter[filterTarget].push(newCondition);
              }
            }
          }
        }
        StateUtil.applyExternalState(filterBar, state);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        Log.error(`ValueHelpDelegate: ${message}`);
      }
    },
    _onConditionPropagationToBindingContext: function (conditions, outParameters, context) {
      const metaModel = context.getModel().getMetaModel();
      for (const condition of conditions) {
        const conditionPayloadList = this._getConditionPayloadList(condition),
          outValues = conditionPayloadList.length === 1 ? conditionPayloadList[0] : undefined;
        if (conditionPayloadList.length > 1) {
          Log.warning("ValueHelpDelegate: ParameterOut in multi-value-field not supported");
        }
        if (outValues) {
          this._onConditionPropagationUpdateProperty(metaModel, outValues, outParameters, context);
        }
      }
    },
    _onConditionPropagationUpdateProperty: function (metaModel, outValues, outParameters, context) {
      const convertedMetadata = convertTypes(metaModel);
      const rootPath = metaModel.getMetaContext(context.getPath()).getPath();
      const contextCanRequestSideEffects = context.isTransient() !== true && context.isInactive() !== true;
      for (const outParameter of outParameters) {
        /* Updated property via out-parameter if value changed */
        if (context.getProperty(outParameter.source) !== outValues[outParameter.helpPath]) {
          this._updatePropertyViaOutParameter(convertedMetadata, rootPath, outValues, outParameter, context, contextCanRequestSideEffects);
        }
      }
    },
    _updatePropertyViaOutParameter: function (convertedMetadata, rootPath, outValues, outParameter, context, contextCanRequestSideEffects) {
      var _targetProperty$annot, _targetProperty$annot2, _targetProperty$annot3, _targetProperty$annot4, _targetProperty$annot5, _targetProperty$annot6;
      /* Updated property via out-parameter if value changed */
      const propertyPath = `${rootPath}/${outParameter.source}`;
      const targetProperty = convertedMetadata.resolvePath(propertyPath).target;
      const fieldControl = targetProperty === null || targetProperty === void 0 ? void 0 : (_targetProperty$annot = targetProperty.annotations) === null || _targetProperty$annot === void 0 ? void 0 : (_targetProperty$annot2 = _targetProperty$annot.Common) === null || _targetProperty$annot2 === void 0 ? void 0 : _targetProperty$annot2.FieldControl;
      const dynamicReadOnly = isPathAnnotationExpression(fieldControl) ? context.getProperty(fieldControl.path) === 1 : false;
      if (dynamicReadOnly && contextCanRequestSideEffects) {
        /* Non-Transient and active context */
        const lastIndex = outParameter.source.lastIndexOf("/");
        const sideEffectPath = lastIndex > 0 ? outParameter.source.substring(0, lastIndex) : outParameter.source;
        /* We send [<propertyName>] in case of a property path without any navigation involved */
        /* In case of a path involving navigations, we send [<navigationPath>] ending with a navigation property and not with a property */
        context.requestSideEffects([sideEffectPath]);
      } else {
        /* The fast creation row (transient context) can´t have instant specific (dynamic) read-only fields, therefore we don´t need to handle/consider this case specifically */
        /* Additional infos: */
        /* The fast creation row is only used by SD */
        /* The group ID (third argument of setProperty described api documentation of the Context) is used for the PATCH request, if not specified, the update group ID for the context's binding is used, 'null' to prevent the PATCH request */
        /* The Transient context cannot request SideEffects and  cannot patch via group 'null' */
        context.setProperty(outParameter.source, outValues[outParameter.helpPath]);
      }
      /* If the key gets updated via out-parameter, then the description needs also retrieved with requestSideEffects */
      const textPath = isPathAnnotationExpression(targetProperty === null || targetProperty === void 0 ? void 0 : (_targetProperty$annot3 = targetProperty.annotations) === null || _targetProperty$annot3 === void 0 ? void 0 : (_targetProperty$annot4 = _targetProperty$annot3.Common) === null || _targetProperty$annot4 === void 0 ? void 0 : _targetProperty$annot4.Text) ? targetProperty === null || targetProperty === void 0 ? void 0 : (_targetProperty$annot5 = targetProperty.annotations) === null || _targetProperty$annot5 === void 0 ? void 0 : (_targetProperty$annot6 = _targetProperty$annot5.Common) === null || _targetProperty$annot6 === void 0 ? void 0 : _targetProperty$annot6.Text.path : undefined;
      if (textPath !== undefined && contextCanRequestSideEffects) {
        const lastIndex = textPath.lastIndexOf("/");
        const sideEffectPath = lastIndex > 0 ? textPath.substring(0, lastIndex) : textPath;
        /* The sideEffectPath can be [<propertyName>] or [<navigationPath>] */
        context.requestSideEffects([sideEffectPath]);
      }
    },
    getFilterConditions: function (valueHelp, content, _config) {
      if (this.getInitialFilterConditions) {
        return this.getInitialFilterConditions(valueHelp, content, _config && _config.control || content && content.getControl());
      }
      return {};
    },
    /**
     * Callback invoked every time a {@link sap.ui.mdc.ValueHelp ValueHelp} fires a select event or the value of the corresponding field changes
     * This callback may be used to update external fields.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param valueHelp ValueHelp control instance receiving the <code>controlChange</code>
     * @param reason Reason why the method was invoked
     * @param _config Current configuration provided by the calling control
     * @since 1.101.0
     */
    onConditionPropagation: async function (valueHelp, reason, _config) {
      if (reason !== "ControlChange") {
        // handle only ControlChange reason
        return;
      }
      const payload = valueHelp.getPayload();
      const qualifier = payload.qualifiers[payload.valueHelpQualifier];
      const outParameters = (qualifier === null || qualifier === void 0 ? void 0 : qualifier.vhParameters) !== undefined ? ValueListHelper.getOutParameters(qualifier.vhParameters) : [],
        field = valueHelp.getControl(),
        fieldParent = field.getParent();
      let conditions = field.getConditions();
      conditions = conditions.filter(function (condition) {
        const conditionPayloadMap = condition.payload || {};
        return conditionPayloadMap[payload.valueHelpQualifier];
      });
      if (fieldParent.isA(MdcFilterbarFilterBarBase)) {
        // field inside a FilterBar or AdaptationFilterBar (Settings Dialog)?
        const filterBarVH = valueHelp.getParent(); // Control e.g. FormContainer
        if (filterBarVH.isA(FeCoreControlsFilterBar)) {
          // only for LR FilterBar
          await this._onConditionPropagationToFilterBar(filterBarVH, conditions, outParameters, fieldParent);
        }
        // LR Settings Dialog or OP Settings Dialog shall not propagate value to the dialog filterfields or context
      } else {
        // Object Page
        const context = valueHelp.getBindingContext();
        if (context) {
          this._onConditionPropagationToBindingContext(conditions, outParameters, context);
        }
      }
    },
    _createInitialFilterCondition: function (value, initialValueFilterEmpty) {
      let condition;
      if (value === undefined || value === null) {
        Log.error("ValueHelpDelegate: value of the property could not be requested");
      } else if (value === "") {
        if (initialValueFilterEmpty) {
          condition = Condition.createCondition("Empty", [], null, null, ConditionValidated.Validated);
        }
      } else {
        condition = Condition.createCondition("EQ", [value], null, null, ConditionValidated.Validated);
      }
      return condition;
    },
    _getInitialFilterConditionsFromBinding: async function (inConditions, control, inParameters) {
      const propertiesToRequest = inParameters.map(inParameter => inParameter.source);
      const bindingContext = control.getBindingContext();
      if (!bindingContext) {
        Log.error("ValueHelpDelegate: No BindingContext");
        return inConditions;
      }

      // According to odata v4 api documentation for requestProperty: Property values that are not cached yet are requested from the back end
      const values = await bindingContext.requestProperty(propertiesToRequest);
      for (let i = 0; i < inParameters.length; i++) {
        const inParameter = inParameters[i];
        const condition = this._createInitialFilterCondition(values[i], inParameter.initialValueFilterEmpty);
        if (condition) {
          inConditions[inParameter.helpPath] = [condition];
        }
      }
      return inConditions;
    },
    _getInitialFilterConditionsFromFilterBar: async function (inConditions, control, inParameters) {
      const filterBar = control.getParent();
      const state = await StateUtil.retrieveExternalState(filterBar);
      for (const inParameter of inParameters) {
        const conditions = this._getConditionsFromInParameter(inParameter, state);
        if (conditions) {
          inConditions[inParameter.helpPath] = conditions;
        }
      }
      return inConditions;
    },
    /**
     * Returns the filter conditions.
     * Regarding a navigation path in the InOut parameters and disregarding prefixes in the navigation path like e.g. '$filters>/conditions/' or 'owner'.
     *
     * @param inParameter InParmeter of the filter field value help
     * @param state The external filter state
     * @returns The filter conditions
     * @since 1.114.0
     */
    _getConditionsFromInParameter: function (inParameter, state) {
      const sourceField = inParameter.source;
      const key = Object.keys(state.filter).find(key => ("/" + sourceField).endsWith("/" + key)); //additional '/' to handle heading characters in the source name if there is no path
      return key && state.filter[key];
    },
    _partitionInParameters: function (inParameters) {
      const inParameterMap = {
        constant: [],
        binding: [],
        filter: []
      };
      for (const inParameter of inParameters) {
        if (inParameter.constantValue !== undefined) {
          inParameterMap.constant.push(inParameter);
        } else if (inParameter.source.indexOf("$filter") === 0) {
          inParameterMap.filter.push(inParameter);
        } else {
          inParameterMap.binding.push(inParameter);
        }
      }
      return inParameterMap;
    },
    _tableAfterRenderDelegate: {
      onAfterRendering: function (event) {
        const table = event.srcControl,
          // m.Table
          tableCellsDomRefs = table.$().find("tbody .sapMText"),
          mdcMTable = table.getParent();
        highlightDOMElements(tableCellsDomRefs, mdcMTable.getFilterValue(), true);
      }
    },
    /**
     * Provides an initial condition configuration everytime a value help content is shown.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param content ValueHelp content requesting conditions configuration
     * @param control Instance of the calling control
     * @returns Returns a map of conditions suitable for a sap.ui.mdc.FilterBar control
     * @since 1.101.0
     */
    getInitialFilterConditions: async function (valueHelp, content, control) {
      // highlight text in ValueHelp popover
      if (content !== null && content !== void 0 && content.isA("sap.ui.mdc.valuehelp.content.MTable")) {
        const popoverTable = content.getTable();
        popoverTable === null || popoverTable === void 0 ? void 0 : popoverTable.removeEventDelegate(this._tableAfterRenderDelegate);
        popoverTable === null || popoverTable === void 0 ? void 0 : popoverTable.addEventDelegate(this._tableAfterRenderDelegate, this);
      }
      const inConditions = {};
      if (!control) {
        Log.error("ValueHelpDelegate: Control undefined");
        return inConditions;
      }
      const payload = valueHelp.getPayload();
      const qualifier = payload.qualifiers[payload.valueHelpQualifier];
      const inParameters = (qualifier === null || qualifier === void 0 ? void 0 : qualifier.vhParameters) !== undefined ? ValueListHelper.getInParameters(qualifier.vhParameters) : [];
      const inParameterMap = this._partitionInParameters(inParameters);
      const isObjectPage = control.getBindingContext();
      for (const inParameter of inParameterMap.constant) {
        const condition = this._createInitialFilterCondition(inParameter.constantValue, isObjectPage ? inParameter.initialValueFilterEmpty : false // no filter with "empty" on ListReport
        );

        if (condition) {
          inConditions[inParameter.helpPath] = [condition];
        }
      }
      if (inParameterMap.binding.length) {
        await this._getInitialFilterConditionsFromBinding(inConditions, control, inParameterMap.binding);
      }
      if (inParameterMap.filter.length) {
        await this._getInitialFilterConditionsFromFilterBar(inConditions, control, inParameterMap.filter);
      }
      return inConditions;
    },
    /**
     * Provides the possibility to convey custom data in conditions.
     * This enables an application to enhance conditions with data relevant for combined key or outparameter scenarios.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param content ValueHelp content instance
     * @param _values Description pair for the condition which is to be created
     * @param context Optional additional context
     * @returns Optionally returns a serializable object to be stored in the condition payload field
     * @since 1.101.0
     */
    createConditionPayload: function (valueHelp, content, _values, context) {
      const payload = valueHelp.getPayload();
      const qualifier = payload.qualifiers[payload.valueHelpQualifier],
        entry = {},
        conditionPayload = {};
      const control = content.getControl();
      const isMultiValueField = control === null || control === void 0 ? void 0 : control.isA("sap.ui.mdc.MultiValueField");
      if (!qualifier.vhKeys || qualifier.vhKeys.length === 1 || isMultiValueField) {
        return undefined;
      }
      qualifier.vhKeys.forEach(function (vhKey) {
        const value = context.getObject(vhKey);
        if (value != null) {
          entry[vhKey] = (value === null || value === void 0 ? void 0 : value.length) === 0 ? "" : value;
        }
      });
      if (Object.keys(entry).length) {
        /* vh qualifier as key for relevant condition */
        conditionPayload[payload.valueHelpQualifier] = [entry];
      }
      return conditionPayload;
    },
    /**
     * Provides the possibility to customize selections in 'Select from list' scenarios.
     * By default, only condition keys are considered. This may be extended with payload dependent filters.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param content ValueHelp content instance
     * @param item Entry of a given list
     * @param conditions Current conditions
     * @returns True, if item is selected
     * @since 1.101.0
     */
    isFilterableListItemSelected: function (valueHelp, content, item, conditions) {
      var _content$getConfig;
      //In value help dialogs of single value fields the row for the key shouldn´t be selected/highlight anymore BCP: 2270175246
      const payload = valueHelp.getPayload();
      if (payload.isValueListWithFixedValues !== true && ((_content$getConfig = content.getConfig()) === null || _content$getConfig === void 0 ? void 0 : _content$getConfig.maxConditions) === 1) {
        return false;
      }
      const context = item.getBindingContext();

      /* Do not consider "NotValidated" conditions */
      conditions = conditions.filter(condition => condition.validated === ConditionValidated.Validated);
      const selectedCondition = conditions.find(function (condition) {
        var _conditionPayloadMap$;
        const conditionPayloadMap = condition.payload,
          valueHelpQualifier = payload.valueHelpQualifier || "";
        if (!conditionPayloadMap && Object.keys(payload.qualifiers)[0] === valueHelpQualifier) {
          const keyPath = content.getKeyPath();
          return (context === null || context === void 0 ? void 0 : context.getObject(keyPath)) === (condition === null || condition === void 0 ? void 0 : condition.values[0]);
        }
        const conditionSelectedRow = (conditionPayloadMap === null || conditionPayloadMap === void 0 ? void 0 : (_conditionPayloadMap$ = conditionPayloadMap[valueHelpQualifier]) === null || _conditionPayloadMap$ === void 0 ? void 0 : _conditionPayloadMap$[0]) || {},
          selectedKeys = Object.keys(conditionSelectedRow);
        if (selectedKeys.length) {
          return selectedKeys.every(function (key) {
            return conditionSelectedRow[key] === (context === null || context === void 0 ? void 0 : context.getObject(key));
          });
        }
        return false;
      });
      return selectedCondition ? true : false;
    },
    /**
     * Creates contexts for additional values and resumes the list binding.
     *
     * @param payload Payload for delegate
     * @param listBinding List binding
     * @param bindingInfo The binding info object to be used to bind the list to the model
     * @param additionalValues Array of AdditionalValues
     */
    _updateBindingForRecommendations: async function (payload, listBinding, bindingInfo, additionalValues) {
      let updateBindingDonePromiseResolve;
      //create a promise to make sure checkListBindingPending is only completed once this promise is resolved
      payload.updateBindingDonePromise = new Promise(function (resolve) {
        updateBindingDonePromiseResolve = resolve;
      });
      try {
        //fetch the contexts of additionalvalues
        const additionalValueContextData = await additionalValueHelper.requestForAdditionalValueContextData(additionalValues, listBinding, bindingInfo);
        //remove duplicate values from different groups of additionalvalues
        const uniqueAdditionalValues = additionalValueHelper.removeDuplicateAdditionalValues(additionalValueContextData, [...additionalValues]);
        //sort and filter valuehelpbinding to make sure we render others group
        additionalValueHelper.sortAndFilterOthers(listBinding, bindingInfo, uniqueAdditionalValues);
        //resume the list binding and then reset the changes
        await additionalValueHelper.resumeValueListBindingAndResetChanges(listBinding);
        if (!additionalValueHelper.doesTransientContextsAlreadyExist(listBinding, uniqueAdditionalValues)) {
          // add transient context to list binding after backend query is done
          additionalValueHelper.createAdditionalValueTransientContexts(additionalValueContextData, uniqueAdditionalValues.reverse(), listBinding);
        }
      } catch (error) {
        //Do nothing as we know that reset changes would throw an error in console and this will pile up a lot of console errors
      }
      if (updateBindingDonePromiseResolve) {
        //resolve the promise as everything is completed
        updateBindingDonePromiseResolve(true);
      }
    },
    /**
     * Executes a filter in a <code>ListBinding</code> and resumes it, if suspended.
     *
     * @param listBinding List binding
     * @param bindingInfo The binding info object to be used to bind the list to the model
     */
    _updateBinding: async function (listBinding, bindingInfo) {
      const rootBinding = listBinding.getRootBinding() || listBinding;
      if (!rootBinding.isSuspended()) {
        rootBinding.suspend();
      }
      if (bindingInfo.parameters) {
        listBinding.changeParameters(bindingInfo.parameters);
      }
      listBinding.filter(bindingInfo.filters, FilterType.Application);
      listBinding.sort(bindingInfo.sorter);
      if (rootBinding.isSuspended()) {
        rootBinding.resume();
        rootBinding.resetChanges();
      }
    },
    /**
     * Returns an boolean value if additionalvalues exists which will contain different groups like recommendations.
     *
     * @param content Filterable List Content
     * @param payload Payload for delegate
     * @returns Boolean value
     */
    checkIfAdditionalValuesExists: function (content, payload) {
      const bindingContext = content.getBindingContext();
      //get the recommendation data from the internal model
      const inputValues = content.getModel("internal").getProperty("/recommendationsData") || {};
      //Fetch the relevant recommendations based on the inputvalues and bindingcontext
      const values = additionalValueHelper.getRelevantRecommendations(inputValues, bindingContext, payload.propertyPath) || [];
      if ((values === null || values === void 0 ? void 0 : values.length) > 0) {
        //if there are relevant recommendations then return true
        return true;
      }
      return false;
    },
    /**
     * Returns a boolean value which will tell whether typeahead should be opened or not.
     *
     * @param valueHelp The <code>ValueHelp</code> instance
     * @param content Filterable List Content
     * @returns Boolean value whether to show typeahead or not
     */
    showTypeahead: function (control, content) {
      if (!content.getControl().isA("sap.ui.mdc.FilterField") && !content.getControl().isA("sap.ui.mdc.MultiValueField")) {
        var _content$getControl;
        const filterValue = content === null || content === void 0 ? void 0 : content.getFilterValue();
        const vhValue = content === null || content === void 0 ? void 0 : (_content$getControl = content.getControl()) === null || _content$getControl === void 0 ? void 0 : _content$getControl.getValue();
        if (vhValue) {
          // valuehelp had some value, but user cleared the value
          // in such case we get input value as '' and we will return false
          //Note: In SDs usecase we wanted to open the typeAhead if there are recommendations and value is blank, they should pass us a flag so that we can handle this accordingly
          if (filterValue === "") {
            return false;
          } else {
            return true;
          }
        } else {
          //if valuehelp value is not there and there is filter value then user is typing and we return true else we would only open
          //if it is recommendation relevant field
          if (filterValue) {
            return true;
          }
          return this.checkIfAdditionalValuesExists(content, control.getPayload());
        }
      }
      return true;
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGZUNvcmVDb250cm9sc0ZpbHRlckJhciIsIk1kY0ZpbHRlcmJhckZpbHRlckJhckJhc2UiLCJPYmplY3QiLCJhc3NpZ24iLCJWYWx1ZUhlbHBEZWxlZ2F0ZSIsImFwaVZlcnNpb24iLCJpc1NlYXJjaFN1cHBvcnRlZCIsInZhbHVlSGVscCIsImNvbnRlbnQiLCJfbGlzdEJpbmRpbmciLCJnZXRGaWx0ZXJGaWVsZHMiLCJ1cGRhdGVCaW5kaW5nSW5mbyIsImJpbmRpbmdJbmZvIiwic2VhcmNoIiwiZ2V0RmlsdGVyVmFsdWUiLCJub3JtYWxpemVkU2VhcmNoIiwiQ29tbW9uVXRpbHMiLCJub3JtYWxpemVTZWFyY2hUZXJtIiwicGFyYW1ldGVycyIsIiRzZWFyY2giLCJ1bmRlZmluZWQiLCJ1cGRhdGVCaW5kaW5nIiwibGlzdEJpbmRpbmciLCJwYXlsb2FkIiwiZ2V0UGF5bG9hZCIsInZhbHVlTGlzdFByb3BlcnR5IiwiX2dldFZhbHVlTGlzdFByb3BlcnR5RnJvbVBheWxvYWRRdWFsaWZpZXIiLCJpc1R5cGVhaGVhZCIsImJpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJhZGRpdGlvbmFsVmFsdWVzIiwiaW5wdXRWYWx1ZXMiLCJnZXRNb2RlbCIsImdldFByb3BlcnR5IiwidmFsdWVzIiwiYWRkaXRpb25hbFZhbHVlSGVscGVyIiwiZ2V0UmVsZXZhbnRSZWNvbW1lbmRhdGlvbnMiLCJwcm9wZXJ0eVBhdGgiLCJsZW5ndGgiLCJwdXNoIiwiZ3JvdXBLZXkiLCJBZGRpdGlvbmFsVmFsdWVHcm91cEtleSIsInJlY29tbWVuZGF0aW9uIiwiX3VwZGF0ZUJpbmRpbmdGb3JSZWNvbW1lbmRhdGlvbnMiLCJfdXBkYXRlQmluZGluZyIsImV4ZWN1dGVGaWx0ZXIiLCJfZmlsdGVyIiwicmVxdWVzdGVkSXRlbXMiLCJnZXRDb250ZXh0cyIsImNoZWNrTGlzdEJpbmRpbmdQZW5kaW5nIiwidXBkYXRlQmluZGluZ0RvbmVQcm9taXNlIiwiaXNTdXNwZW5kZWQiLCJjb250ZXh0cyIsInJlcXVlc3RDb250ZXh0cyIsImdldFR5cGVVdGlsIiwiVHlwZVV0aWwiLCJyZXRyaWV2ZUNvbnRlbnQiLCJjb250YWluZXIiLCJjb250ZW50SWQiLCJWYWx1ZUxpc3RIZWxwZXIiLCJzaG93VmFsdWVMaXN0IiwiX2dldENvbmRpdGlvblBheWxvYWRMaXN0IiwiY29uZGl0aW9uIiwiY29uZGl0aW9uUGF5bG9hZE1hcCIsInZhbHVlSGVscFF1YWxpZmllcnMiLCJrZXlzIiwiY29uZGl0aW9uUGF5bG9hZExpc3QiLCJwYXJhbXMiLCJxdWFsaWZpZXJzIiwidmFsdWVIZWxwUXVhbGlmaWVyIiwidmhQYXJhbWV0ZXJzIiwidmhLZXlzIiwicHJvcGVydHlLZXlQYXRoIiwidmFsdWVIZWxwS2V5UGF0aCIsImZpbHRlcmVkS2V5cyIsImhlbHBQYXRocyIsImZvckVhY2giLCJwYXJhbSIsImhlbHBQYXRoIiwiZmlsdGVyIiwia2V5IiwiaW5jbHVkZXMiLCJfb25Db25kaXRpb25Qcm9wYWdhdGlvblRvRmlsdGVyQmFyIiwiZmlsdGVyQmFyVkgiLCJjb25kaXRpb25zIiwib3V0UGFyYW1ldGVycyIsImZpbHRlckJhciIsInN0YXRlIiwiU3RhdGVVdGlsIiwicmV0cmlldmVFeHRlcm5hbFN0YXRlIiwiZmlsdGVySXRlbXNWSCIsImdldEZpbHRlckl0ZW1zIiwib3V0UGFyYW1ldGVyIiwiZmlsdGVyVGFyZ2V0Iiwic291cmNlIiwic3BsaXQiLCJwb3AiLCJmaW5kIiwiaXRlbSIsImdldElkIiwiY29uZGl0aW9uUGF5bG9hZCIsIm5ld0NvbmRpdGlvbiIsIkNvbmRpdGlvbiIsImNyZWF0ZUNvbmRpdGlvbiIsIkNvbmRpdGlvblZhbGlkYXRlZCIsIlZhbGlkYXRlZCIsImFwcGx5RXh0ZXJuYWxTdGF0ZSIsImVyciIsIm1lc3NhZ2UiLCJFcnJvciIsIlN0cmluZyIsIkxvZyIsImVycm9yIiwiX29uQ29uZGl0aW9uUHJvcGFnYXRpb25Ub0JpbmRpbmdDb250ZXh0IiwiY29udGV4dCIsIm1ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsIm91dFZhbHVlcyIsIndhcm5pbmciLCJfb25Db25kaXRpb25Qcm9wYWdhdGlvblVwZGF0ZVByb3BlcnR5IiwiY29udmVydGVkTWV0YWRhdGEiLCJjb252ZXJ0VHlwZXMiLCJyb290UGF0aCIsImdldE1ldGFDb250ZXh0IiwiZ2V0UGF0aCIsImNvbnRleHRDYW5SZXF1ZXN0U2lkZUVmZmVjdHMiLCJpc1RyYW5zaWVudCIsImlzSW5hY3RpdmUiLCJfdXBkYXRlUHJvcGVydHlWaWFPdXRQYXJhbWV0ZXIiLCJ0YXJnZXRQcm9wZXJ0eSIsInJlc29sdmVQYXRoIiwidGFyZ2V0IiwiZmllbGRDb250cm9sIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJGaWVsZENvbnRyb2wiLCJkeW5hbWljUmVhZE9ubHkiLCJpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiIsInBhdGgiLCJsYXN0SW5kZXgiLCJsYXN0SW5kZXhPZiIsInNpZGVFZmZlY3RQYXRoIiwic3Vic3RyaW5nIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwic2V0UHJvcGVydHkiLCJ0ZXh0UGF0aCIsIlRleHQiLCJnZXRGaWx0ZXJDb25kaXRpb25zIiwiX2NvbmZpZyIsImdldEluaXRpYWxGaWx0ZXJDb25kaXRpb25zIiwiY29udHJvbCIsImdldENvbnRyb2wiLCJvbkNvbmRpdGlvblByb3BhZ2F0aW9uIiwicmVhc29uIiwicXVhbGlmaWVyIiwiZ2V0T3V0UGFyYW1ldGVycyIsImZpZWxkIiwiZmllbGRQYXJlbnQiLCJnZXRQYXJlbnQiLCJnZXRDb25kaXRpb25zIiwiaXNBIiwiX2NyZWF0ZUluaXRpYWxGaWx0ZXJDb25kaXRpb24iLCJ2YWx1ZSIsImluaXRpYWxWYWx1ZUZpbHRlckVtcHR5IiwiX2dldEluaXRpYWxGaWx0ZXJDb25kaXRpb25zRnJvbUJpbmRpbmciLCJpbkNvbmRpdGlvbnMiLCJpblBhcmFtZXRlcnMiLCJwcm9wZXJ0aWVzVG9SZXF1ZXN0IiwibWFwIiwiaW5QYXJhbWV0ZXIiLCJyZXF1ZXN0UHJvcGVydHkiLCJpIiwiX2dldEluaXRpYWxGaWx0ZXJDb25kaXRpb25zRnJvbUZpbHRlckJhciIsIl9nZXRDb25kaXRpb25zRnJvbUluUGFyYW1ldGVyIiwic291cmNlRmllbGQiLCJlbmRzV2l0aCIsIl9wYXJ0aXRpb25JblBhcmFtZXRlcnMiLCJpblBhcmFtZXRlck1hcCIsImNvbnN0YW50IiwiYmluZGluZyIsImNvbnN0YW50VmFsdWUiLCJpbmRleE9mIiwiX3RhYmxlQWZ0ZXJSZW5kZXJEZWxlZ2F0ZSIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJldmVudCIsInRhYmxlIiwic3JjQ29udHJvbCIsInRhYmxlQ2VsbHNEb21SZWZzIiwiJCIsIm1kY01UYWJsZSIsImhpZ2hsaWdodERPTUVsZW1lbnRzIiwicG9wb3ZlclRhYmxlIiwiZ2V0VGFibGUiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsImdldEluUGFyYW1ldGVycyIsImlzT2JqZWN0UGFnZSIsImNyZWF0ZUNvbmRpdGlvblBheWxvYWQiLCJfdmFsdWVzIiwiZW50cnkiLCJpc011bHRpVmFsdWVGaWVsZCIsInZoS2V5IiwiZ2V0T2JqZWN0IiwiaXNGaWx0ZXJhYmxlTGlzdEl0ZW1TZWxlY3RlZCIsImlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwiZ2V0Q29uZmlnIiwibWF4Q29uZGl0aW9ucyIsInZhbGlkYXRlZCIsInNlbGVjdGVkQ29uZGl0aW9uIiwia2V5UGF0aCIsImdldEtleVBhdGgiLCJjb25kaXRpb25TZWxlY3RlZFJvdyIsInNlbGVjdGVkS2V5cyIsImV2ZXJ5IiwidXBkYXRlQmluZGluZ0RvbmVQcm9taXNlUmVzb2x2ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiYWRkaXRpb25hbFZhbHVlQ29udGV4dERhdGEiLCJyZXF1ZXN0Rm9yQWRkaXRpb25hbFZhbHVlQ29udGV4dERhdGEiLCJ1bmlxdWVBZGRpdGlvbmFsVmFsdWVzIiwicmVtb3ZlRHVwbGljYXRlQWRkaXRpb25hbFZhbHVlcyIsInNvcnRBbmRGaWx0ZXJPdGhlcnMiLCJyZXN1bWVWYWx1ZUxpc3RCaW5kaW5nQW5kUmVzZXRDaGFuZ2VzIiwiZG9lc1RyYW5zaWVudENvbnRleHRzQWxyZWFkeUV4aXN0IiwiY3JlYXRlQWRkaXRpb25hbFZhbHVlVHJhbnNpZW50Q29udGV4dHMiLCJyZXZlcnNlIiwicm9vdEJpbmRpbmciLCJnZXRSb290QmluZGluZyIsInN1c3BlbmQiLCJjaGFuZ2VQYXJhbWV0ZXJzIiwiZmlsdGVycyIsIkZpbHRlclR5cGUiLCJBcHBsaWNhdGlvbiIsInNvcnQiLCJzb3J0ZXIiLCJyZXN1bWUiLCJyZXNldENoYW5nZXMiLCJjaGVja0lmQWRkaXRpb25hbFZhbHVlc0V4aXN0cyIsInNob3dUeXBlYWhlYWQiLCJmaWx0ZXJWYWx1ZSIsInZoVmFsdWUiLCJnZXRWYWx1ZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmFsdWVIZWxwRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb252ZXJ0ZWRNZXRhZGF0YSwgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgY29udmVydFR5cGVzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1R5cGVHdWFyZHNcIjtcbmltcG9ydCBUeXBlVXRpbCBmcm9tIFwic2FwL2ZlL2NvcmUvdHlwZS9UeXBlVXRpbFwiO1xuaW1wb3J0IHR5cGUgeyBJbk91dFBhcmFtZXRlciwgVmFsdWVIZWxwUGF5bG9hZCB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9WYWx1ZUxpc3RIZWxwZXJcIjtcbmltcG9ydCBWYWx1ZUxpc3RIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvdmFsdWVoZWxwL1ZhbHVlTGlzdEhlbHBlclwiO1xuaW1wb3J0IGhpZ2hsaWdodERPTUVsZW1lbnRzIGZyb20gXCJzYXAvbS9pbnB1dFV0aWxzL2hpZ2hsaWdodERPTUVsZW1lbnRzXCI7XG5pbXBvcnQgdHlwZSB7IEFnZ3JlZ2F0aW9uQmluZGluZ0luZm8gfSBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIHsgQ29uZGl0aW9uT2JqZWN0IH0gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IENvbmRpdGlvbiBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgQ29uZGl0aW9uVmFsaWRhdGVkIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vQ29uZGl0aW9uVmFsaWRhdGVkXCI7XG5pbXBvcnQgRmllbGQgZnJvbSBcInNhcC91aS9tZGMvRmllbGRcIjtcbmltcG9ydCB0eXBlIEZpZWxkQmFzZSBmcm9tIFwic2FwL3VpL21kYy9maWVsZC9GaWVsZEJhc2VcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhckJhc2UgZnJvbSBcInNhcC91aS9tZGMvZmlsdGVyYmFyL0ZpbHRlckJhckJhc2VcIjtcbmltcG9ydCBTdGF0ZVV0aWwgZnJvbSBcInNhcC91aS9tZGMvcDEzbi9TdGF0ZVV0aWxcIjtcbmltcG9ydCB0eXBlIFZhbHVlSGVscCBmcm9tIFwic2FwL3VpL21kYy9WYWx1ZUhlbHBcIjtcbmltcG9ydCB0eXBlIENvbnRhaW5lciBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvYmFzZS9Db250YWluZXJcIjtcbmltcG9ydCB0eXBlIENvbnRlbnQgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2Jhc2UvQ29udGVudFwiO1xuaW1wb3J0IEZpbHRlcmFibGVMaXN0Q29udGVudCBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvYmFzZS9GaWx0ZXJhYmxlTGlzdENvbnRlbnRcIjtcbmltcG9ydCB0eXBlIE1UYWJsZSBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvY29udGVudC9NVGFibGVcIjtcbmltcG9ydCBWYWx1ZUhlbHBEZWxlZ2F0ZSBmcm9tIFwic2FwL3VpL21kYy9WYWx1ZUhlbHBEZWxlZ2F0ZVwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlclR5cGUgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJUeXBlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHsgQWRkaXRpb25hbFZhbHVlR3JvdXBLZXksIGFkZGl0aW9uYWxWYWx1ZUhlbHBlciwgQWRkaXRpb25hbFZhbHVlVHlwZSB9IGZyb20gXCIuLi9pbnRlcm5hbC92YWx1ZWhlbHAvQWRkaXRpb25hbFZhbHVlSGVscGVyXCI7XG5cbmNvbnN0IEZlQ29yZUNvbnRyb2xzRmlsdGVyQmFyID0gXCJzYXAuZmUuY29yZS5jb250cm9scy5GaWx0ZXJCYXJcIjtcbmNvbnN0IE1kY0ZpbHRlcmJhckZpbHRlckJhckJhc2UgPSBcInNhcC51aS5tZGMuZmlsdGVyYmFyLkZpbHRlckJhckJhc2VcIjtcblxudHlwZSBDb25kaXRpb25PYmplY3RNYXAgPSBSZWNvcmQ8c3RyaW5nLCBDb25kaXRpb25PYmplY3RbXT47XG5cbmV4cG9ydCB0eXBlIEV4dGVybmFsU3RhdGVUeXBlID0ge1xuXHRpdGVtczogeyBuYW1lOiBzdHJpbmcgfVtdO1xuXHRmaWx0ZXI6IENvbmRpdGlvbk9iamVjdE1hcDtcbn07XG5cbmV4cG9ydCB0eXBlIENvbmRpdGlvblBheWxvYWRUeXBlID0gUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgYm9vbGVhbj47XG5cbmV4cG9ydCB0eXBlIENvbmRpdGlvblBheWxvYWRNYXAgPSBSZWNvcmQ8c3RyaW5nLCBDb25kaXRpb25QYXlsb2FkVHlwZVtdPjtcblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmFzc2lnbih7fSwgVmFsdWVIZWxwRGVsZWdhdGUsIHtcblx0YXBpVmVyc2lvbjogMixcblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGEgPGNvZGU+TGlzdEJpbmRpbmc8L2NvZGU+IHN1cHBvcnRzICRTZWFyY2guXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHAgVGhlIDxjb2RlPlZhbHVlSGVscDwvY29kZT4gaW5zdGFuY2Vcblx0ICogQHBhcmFtIGNvbnRlbnQgQ29udGVudCBlbGVtZW50XG5cdCAqIEBwYXJhbSBfbGlzdEJpbmRpbmdcblx0ICogQHJldHVybnMgVHJ1ZSBpZiAkc2VhcmNoIGlzIHN1cHBvcnRlZFxuXHQgKi9cblx0aXNTZWFyY2hTdXBwb3J0ZWQ6IGZ1bmN0aW9uICh2YWx1ZUhlbHA6IFZhbHVlSGVscCwgY29udGVudDogRmlsdGVyYWJsZUxpc3RDb250ZW50LCBfbGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcpIHtcblx0XHRyZXR1cm4gY29udGVudC5nZXRGaWx0ZXJGaWVsZHMoKSA9PT0gXCIkc2VhcmNoXCI7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkanVzdGFibGUgZmlsdGVyaW5nIGZvciBsaXN0LWJhc2VkIGNvbnRlbnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWVIZWxwIFRoZSA8Y29kZT5WYWx1ZUhlbHA8L2NvZGU+IGluc3RhbmNlXG5cdCAqIEBwYXJhbSBjb250ZW50IFZhbHVlSGVscCBjb250ZW50IHJlcXVlc3RpbmcgY29uZGl0aW9ucyBjb25maWd1cmF0aW9uXG5cdCAqIEBwYXJhbSBiaW5kaW5nSW5mbyBUaGUgYmluZGluZyBpbmZvIG9iamVjdCB0byBiZSB1c2VkIHRvIGJpbmQgdGhlIGxpc3QgdG8gdGhlIG1vZGVsXG5cdCAqL1xuXHR1cGRhdGVCaW5kaW5nSW5mbzogZnVuY3Rpb24gKHZhbHVlSGVscDogVmFsdWVIZWxwLCBjb250ZW50OiBGaWx0ZXJhYmxlTGlzdENvbnRlbnQsIGJpbmRpbmdJbmZvOiBBZ2dyZWdhdGlvbkJpbmRpbmdJbmZvKSB7XG5cdFx0VmFsdWVIZWxwRGVsZWdhdGUudXBkYXRlQmluZGluZ0luZm8odmFsdWVIZWxwLCBjb250ZW50LCBiaW5kaW5nSW5mbyk7XG5cblx0XHRpZiAoY29udGVudC5nZXRGaWx0ZXJGaWVsZHMoKSA9PT0gXCIkc2VhcmNoXCIpIHtcblx0XHRcdGNvbnN0IHNlYXJjaCA9IGNvbnRlbnQuZ2V0RmlsdGVyVmFsdWUoKTtcblx0XHRcdGNvbnN0IG5vcm1hbGl6ZWRTZWFyY2ggPSBDb21tb25VdGlscy5ub3JtYWxpemVTZWFyY2hUZXJtKHNlYXJjaCk7IC8vIGFkanVzdFNlYXJjaFxuXG5cdFx0XHRpZiAoYmluZGluZ0luZm8ucGFyYW1ldGVycykge1xuXHRcdFx0XHQoYmluZGluZ0luZm8ucGFyYW1ldGVycyBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikuJHNlYXJjaCA9IG5vcm1hbGl6ZWRTZWFyY2ggfHwgdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIGZpZWxkIGlzIHJlY29tbWVuZGF0aW9uIHJlbGV2YW50IGFuZCBjYWxscyBlaXRoZXIgX3VwZGF0ZUJpbmRpbmcgb3IgX3VwZGF0ZUJpbmRpbmdGb3JSZWNvbW1lbmRhdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHAgVGhlIDxjb2RlPlZhbHVlSGVscDwvY29kZT4gaW5zdGFuY2Vcblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIExpc3QgYmluZGluZ1xuXHQgKiBAcGFyYW0gYmluZGluZ0luZm8gVGhlIGJpbmRpbmcgaW5mbyBvYmplY3QgdG8gYmUgdXNlZCB0byBiaW5kIHRoZSBsaXN0IHRvIHRoZSBtb2RlbFxuXHQgKiBAcGFyYW0gY29udGVudCBGaWx0ZXJhYmxlIExpc3QgQ29udGVudFxuXHQgKi9cblx0dXBkYXRlQmluZGluZzogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdHZhbHVlSGVscDogVmFsdWVIZWxwLFxuXHRcdGxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLFxuXHRcdGJpbmRpbmdJbmZvOiBBZ2dyZWdhdGlvbkJpbmRpbmdJbmZvLFxuXHRcdGNvbnRlbnQ6IE1UYWJsZVxuXHQpIHtcblx0XHQvL1dlIGZldGNoIHRoZSB2YWx1ZWxpc3QgcHJvcGVydHkgZnJvbSB0aGUgcGF5bG9hZCB0byBtYWtlIHN1cmUgd2UgcGFzcyB0aGUgcmlnaHQgcHJvcGVydHkgd2hpbGUgbWFraW5nIGEgY2FsbCBvbiB2YWx1ZWxpc3QgZW50aXR5IHNldFxuXHRcdGNvbnN0IHBheWxvYWQgPSB2YWx1ZUhlbHAuZ2V0UGF5bG9hZCgpIGFzIFZhbHVlSGVscFBheWxvYWQ7XG5cdFx0Y29uc3QgdmFsdWVMaXN0UHJvcGVydHkgPSB0aGlzLl9nZXRWYWx1ZUxpc3RQcm9wZXJ0eUZyb21QYXlsb2FkUXVhbGlmaWVyKHBheWxvYWQpO1xuXHRcdGlmIChjb250ZW50LmlzVHlwZWFoZWFkKCkpIHtcblx0XHRcdGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gY29udGVudC5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0Y29uc3QgYWRkaXRpb25hbFZhbHVlczogQWRkaXRpb25hbFZhbHVlVHlwZVtdID0gW107XG5cdFx0XHQvL2dldCB0aGUgcmVjb21tZW5kYXRpb24gZGF0YSBmcm9tIHRoZSBpbnRlcm5hbCBtb2RlbFxuXHRcdFx0Y29uc3QgaW5wdXRWYWx1ZXMgPSAoY29udGVudC5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbCkuZ2V0UHJvcGVydHkoXCIvcmVjb21tZW5kYXRpb25zRGF0YVwiKSB8fCB7fTtcblx0XHRcdC8vRmV0Y2ggdGhlIHJlbGV2YW50IHJlY29tbWVuZGF0aW9ucyBiYXNlZCBvbiB0aGUgaW5wdXR2YWx1ZXMgYW5kIGJpbmRpbmdjb250ZXh0XG5cdFx0XHRjb25zdCB2YWx1ZXMgPVxuXHRcdFx0XHRhZGRpdGlvbmFsVmFsdWVIZWxwZXIuZ2V0UmVsZXZhbnRSZWNvbW1lbmRhdGlvbnMoaW5wdXRWYWx1ZXMsIGJpbmRpbmdDb250ZXh0IGFzIENvbnRleHQsIHBheWxvYWQucHJvcGVydHlQYXRoKSB8fCBbXTtcblx0XHRcdC8vaWYgdGhlcmUgYXJlIHJlbGV2YW50IHJlY29tbWVuZGF0aW9ucyB0aGVuIGNyZWF0ZSBhZGRpdGlvbmFsdmFsdWUgc3RydWN0dXJlIGFuZCBjYWxsIF91cGRhdGVCaW5kaW5nRm9yUmVjb21tZW5kYXRpb25zXG5cdFx0XHRpZiAodmFsdWVzPy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGFkZGl0aW9uYWxWYWx1ZXMucHVzaCh7IHByb3BlcnR5UGF0aDogdmFsdWVMaXN0UHJvcGVydHksIHZhbHVlcywgZ3JvdXBLZXk6IEFkZGl0aW9uYWxWYWx1ZUdyb3VwS2V5LnJlY29tbWVuZGF0aW9uIH0pO1xuXHRcdFx0XHR0aGlzLl91cGRhdGVCaW5kaW5nRm9yUmVjb21tZW5kYXRpb25zKHBheWxvYWQsIGxpc3RCaW5kaW5nLCBiaW5kaW5nSW5mbywgYWRkaXRpb25hbFZhbHVlcyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL2NhbGwgX3VwZGF0ZUJpbmRpbmcgaWYgdGhlcmUgYXJlIG5vIHJlbGV2YW50IHJlY29tbWVuZGF0aW9uc1xuXHRcdFx0XHR0aGlzLl91cGRhdGVCaW5kaW5nKGxpc3RCaW5kaW5nLCBiaW5kaW5nSW5mbyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vY2FsbCBfdXBkYXRlQmluZGluZyBpZiB0aGVyZSBhcmUgbm8gcmVsZXZhbnQgcmVjb21tZW5kYXRpb25zXG5cdFx0XHR0aGlzLl91cGRhdGVCaW5kaW5nKGxpc3RCaW5kaW5nLCBiaW5kaW5nSW5mbyk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogRXhlY3V0ZXMgYSBmaWx0ZXIgaW4gYSA8Y29kZT5MaXN0QmluZGluZzwvY29kZT4uXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHAgVGhlIDxjb2RlPlZhbHVlSGVscDwvY29kZT4gaW5zdGFuY2Vcblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIExpc3QgYmluZGluZ1xuXHQgKiBAcGFyYW0gX2ZpbHRlciBGaWx0ZXJcblx0ICogQHBhcmFtIHJlcXVlc3RlZEl0ZW1zIE51bWJlciBvZiByZXF1ZXN0ZWQgaXRlbXNcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIGlmIHNlYXJjaCBpcyBleGVjdXRlZFxuXHQgKi9cblx0ZXhlY3V0ZUZpbHRlcjogYXN5bmMgZnVuY3Rpb24gKHZhbHVlSGVscDogVmFsdWVIZWxwLCBsaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZywgX2ZpbHRlcjogRmlsdGVyLCByZXF1ZXN0ZWRJdGVtczogbnVtYmVyKSB7XG5cdFx0bGlzdEJpbmRpbmcuZ2V0Q29udGV4dHMoMCwgcmVxdWVzdGVkSXRlbXMpO1xuXG5cdFx0YXdhaXQgdGhpcy5jaGVja0xpc3RCaW5kaW5nUGVuZGluZyh2YWx1ZUhlbHAsIGxpc3RCaW5kaW5nLCByZXF1ZXN0ZWRJdGVtcyk7XG5cdFx0cmV0dXJuIGxpc3RCaW5kaW5nO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIDxjb2RlPkxpc3RCaW5kaW5nPC9jb2RlPiBpcyB3YWl0aW5nIGZvciBhbiB1cGRhdGUuXG5cdCAqIEFzIGxvbmcgYXMgdGhlIGNvbnRleHQgaGFzIG5vdCBiZWVuIHNldCBmb3IgPGNvZGU+TGlzdEJpbmRpbmc8L2NvZGU+LFxuXHQgKiA8Y29kZT5WYWx1ZUhlbHA8L2NvZGU+IG5lZWRzIHRvIHdhaXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHAgVGhlIDxjb2RlPlZhbHVlSGVscDwvY29kZT4gaW5zdGFuY2Vcblx0ICogQHBhcmFtIGxpc3RCaW5kaW5nIExpc3RCaW5kaW5nIHRvIGNoZWNrXG5cdCAqIEBwYXJhbSByZXF1ZXN0ZWRJdGVtcyBOdW1iZXIgb2YgcmVxdWVzdGVkIGl0ZW1zXG5cdCAqIEByZXR1cm5zIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvbmNlIExpc3RCaW5kaW5nIGhhcyBiZWVuIHVwZGF0ZWRcblx0ICovXG5cdGNoZWNrTGlzdEJpbmRpbmdQZW5kaW5nOiBhc3luYyBmdW5jdGlvbiAodmFsdWVIZWxwOiBWYWx1ZUhlbHAsIGxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nIHwgdW5kZWZpbmVkLCByZXF1ZXN0ZWRJdGVtczogbnVtYmVyKSB7XG5cdFx0Y29uc3QgcGF5bG9hZCA9IHZhbHVlSGVscC5nZXRQYXlsb2FkKCkgYXMgVmFsdWVIZWxwUGF5bG9hZDtcblx0XHRpZiAocGF5bG9hZC51cGRhdGVCaW5kaW5nRG9uZVByb21pc2UpIHtcblx0XHRcdHJldHVybiBwYXlsb2FkLnVwZGF0ZUJpbmRpbmdEb25lUHJvbWlzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKCFsaXN0QmluZGluZyB8fCBsaXN0QmluZGluZy5pc1N1c3BlbmRlZCgpKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgY29udGV4dHMgPSBhd2FpdCBsaXN0QmluZGluZy5yZXF1ZXN0Q29udGV4dHMoMCwgcmVxdWVzdGVkSXRlbXMpO1xuXHRcdFx0cmV0dXJuIGNvbnRleHRzLmxlbmd0aCA9PT0gMDtcblx0XHR9XG5cdH0sXG5cblx0Z2V0VHlwZVV0aWw6IGZ1bmN0aW9uICh2YWx1ZUhlbHA6IFZhbHVlSGVscCkge1xuXHRcdHJldHVybiBUeXBlVXRpbDtcblx0fSxcblxuXHQvKipcblx0ICogUmVxdWVzdHMgdGhlIGNvbnRlbnQgb2YgdGhlIHZhbHVlIGhlbHAuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIHdoZW4gdGhlIHZhbHVlIGhlbHAgaXMgb3BlbmVkIG9yIGEga2V5IG9yIGRlc2NyaXB0aW9uIGlzIHJlcXVlc3RlZC5cblx0ICpcblx0ICogU28sIGRlcGVuZGluZyBvbiB0aGUgdmFsdWUgaGVscCBjb250ZW50IHVzZWQsIGFsbCBjb250ZW50IGNvbnRyb2xzIGFuZCBkYXRhIG5lZWQgdG8gYmUgYXNzaWduZWQuXG5cdCAqIE9uY2UgdGhleSBhcmUgYXNzaWduZWQgYW5kIHRoZSBkYXRhIGlzIHNldCwgdGhlIHJldHVybmVkIDxjb2RlPlByb21pc2U8L2NvZGU+IG5lZWRzIHRvIGJlIHJlc29sdmVkLlxuXHQgKiBPbmx5IHRoZW4gZG9lcyB0aGUgdmFsdWUgaGVscCBjb250aW51ZSBvcGVuaW5nIG9yIHJlYWRpbmcgZGF0YS5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlSGVscCBUaGUgPGNvZGU+VmFsdWVIZWxwPC9jb2RlPiBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gY29udGFpbmVyIENvbnRhaW5lciBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gY29udGVudElkIElkIG9mIHRoZSBjb250ZW50IHNob3duIGFmdGVyIHRoaXMgY2FsbCB0byByZXRyaWV2ZUNvbnRlbnRcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIGlmIGFsbCBjb250ZW50IGlzIGF2YWlsYWJsZVxuXHQgKi9cblx0cmV0cmlldmVDb250ZW50OiBmdW5jdGlvbiAodmFsdWVIZWxwOiBWYWx1ZUhlbHAsIGNvbnRhaW5lcjogQ29udGFpbmVyLCBjb250ZW50SWQ6IHN0cmluZykge1xuXHRcdGNvbnN0IHBheWxvYWQgPSB2YWx1ZUhlbHAuZ2V0UGF5bG9hZCgpIGFzIFZhbHVlSGVscFBheWxvYWQ7XG5cdFx0cmV0dXJuIFZhbHVlTGlzdEhlbHBlci5zaG93VmFsdWVMaXN0KHBheWxvYWQsIGNvbnRhaW5lciwgY29udGVudElkKTtcblx0fSxcblxuXHRfZ2V0Q29uZGl0aW9uUGF5bG9hZExpc3Q6IGZ1bmN0aW9uIChjb25kaXRpb246IENvbmRpdGlvbk9iamVjdCkge1xuXHRcdGNvbnN0IGNvbmRpdGlvblBheWxvYWRNYXAgPSAoY29uZGl0aW9uLnBheWxvYWQgfHwge30pIGFzIENvbmRpdGlvblBheWxvYWRNYXAsXG5cdFx0XHR2YWx1ZUhlbHBRdWFsaWZpZXJzID0gT2JqZWN0LmtleXMoY29uZGl0aW9uUGF5bG9hZE1hcCksXG5cdFx0XHRjb25kaXRpb25QYXlsb2FkTGlzdCA9IHZhbHVlSGVscFF1YWxpZmllcnMubGVuZ3RoID8gY29uZGl0aW9uUGF5bG9hZE1hcFt2YWx1ZUhlbHBRdWFsaWZpZXJzWzBdXSA6IFtdO1xuXG5cdFx0cmV0dXJuIGNvbmRpdGlvblBheWxvYWRMaXN0O1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyBWYWx1ZUxpc3RQcm9wZXJ0eSBmcm9tIFBheWxvYWQgYmFzZWQgb24gZGF0YSBmcm9tIHBheWxvYWQga2V5cyBhbmQgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHBhcmFtIHBheWxvYWQgUGF5bG9hZCBmb3IgZGVsZWdhdGVcblx0ICogQHJldHVybnMgVmFsdWVMaXN0UHJvcGVydHlcblx0ICovXG5cdF9nZXRWYWx1ZUxpc3RQcm9wZXJ0eUZyb21QYXlsb2FkUXVhbGlmaWVyOiBmdW5jdGlvbiAocGF5bG9hZDogVmFsdWVIZWxwUGF5bG9hZCkge1xuXHRcdGNvbnN0IHBhcmFtcyA9IHBheWxvYWQucXVhbGlmaWVyc1twYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllcl0udmhQYXJhbWV0ZXJzIHx8IFtdO1xuXHRcdGNvbnN0IGtleXMgPSBwYXlsb2FkLnF1YWxpZmllcnNbcGF5bG9hZC52YWx1ZUhlbHBRdWFsaWZpZXJdLnZoS2V5cyB8fCBbXTtcblx0XHRjb25zdCBwcm9wZXJ0eUtleVBhdGggPSBwYXlsb2FkLnZhbHVlSGVscEtleVBhdGg7XG5cdFx0bGV0IGZpbHRlcmVkS2V5czogc3RyaW5nW10gPSBbLi4ua2V5c107XG5cdFx0Y29uc3QgaGVscFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGlmIChwYXJhbXMubGVuZ3RoID4gMCkge1xuXHRcdFx0Ly9jcmVhdGUgaGVscFBhdGhzIGFycmF5IHdoaWNoIHdpbGwgb25seSBjb25zaXN0IG9mIHBhcmFtcyBoZWxwcGF0aFxuXHRcdFx0cGFyYW1zLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtOiBJbk91dFBhcmFtZXRlcikge1xuXHRcdFx0XHRoZWxwUGF0aHMucHVzaChwYXJhbS5oZWxwUGF0aCk7XG5cdFx0XHR9KTtcblx0XHRcdC8vZmlsdGVyIHRoZSBrZXlzIGJhc2VkIG9uIGhlbHBQYXRocy4gSWYga2V5IGlzIG5vdCBwcmVzZW50IGluIGhlbHBQYXRoIHRoZW4gaXQgaXMgdmFsdWVsaXN0cHJvcGVydHlcblx0XHRcdGZpbHRlcmVkS2V5cyA9IGtleXMuZmlsdGVyKChrZXk6IHN0cmluZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gIWhlbHBQYXRocy5pbmNsdWRlcyhrZXkpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0Ly8gZnJvbSBmaWx0ZXJlZEtleXMgcmV0dXJuIHRoZSBrZXkgdGhhdCBtYXRjaGVzIHRoZSBwcm9wZXJ0eSBuYW1lXG5cdFx0cmV0dXJuIHByb3BlcnR5S2V5UGF0aCAmJiBmaWx0ZXJlZEtleXMuaW5jbHVkZXMocHJvcGVydHlLZXlQYXRoKSA/IHByb3BlcnR5S2V5UGF0aCA6IFwiXCI7XG5cdH0sXG5cblx0X29uQ29uZGl0aW9uUHJvcGFnYXRpb25Ub0ZpbHRlckJhcjogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdGZpbHRlckJhclZIOiBGaWx0ZXJCYXJCYXNlLFxuXHRcdGNvbmRpdGlvbnM6IENvbmRpdGlvbk9iamVjdFtdLFxuXHRcdG91dFBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW10sXG5cdFx0ZmlsdGVyQmFyOiBGaWx0ZXJCYXJCYXNlXG5cdCkge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBzdGF0ZTogRXh0ZXJuYWxTdGF0ZVR5cGUgPSBhd2FpdCBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKGZpbHRlckJhcik7XG5cdFx0XHRjb25zdCBmaWx0ZXJJdGVtc1ZIID0gZmlsdGVyQmFyVkguZ2V0RmlsdGVySXRlbXMoKTtcblx0XHRcdGZvciAoY29uc3QgY29uZGl0aW9uIG9mIGNvbmRpdGlvbnMpIHtcblx0XHRcdFx0Y29uc3QgY29uZGl0aW9uUGF5bG9hZExpc3QgPSB0aGlzLl9nZXRDb25kaXRpb25QYXlsb2FkTGlzdChjb25kaXRpb24pO1xuXHRcdFx0XHRmb3IgKGNvbnN0IG91dFBhcmFtZXRlciBvZiBvdXRQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmlsdGVyVGFyZ2V0ID0gb3V0UGFyYW1ldGVyLnNvdXJjZS5zcGxpdChcIi9cIikucG9wKCkgfHwgXCJcIjtcblx0XHRcdFx0XHQvLyBwcm9wYWdhdGUgT1VUIHBhcmFtZXRlciBvbmx5IGlmIHRoZSBmaWx0ZXIgZmllbGQgaXMgdmlzaWJsZSBpbiB0aGUgTFIgZmlsdGVyYmFyXG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0Ly8gTFIgRmlsdGVyQmFyIG9yIExSIEFkYXB0RmlsdGVyXG5cdFx0XHRcdFx0XHRmaWx0ZXJJdGVtc1ZILmZpbmQoKGl0ZW0pID0+IGl0ZW0uZ2V0SWQoKS5zcGxpdChcIjo6XCIpLnBvcCgpID09PSBmaWx0ZXJUYXJnZXQpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRmb3IgKGNvbnN0IGNvbmRpdGlvblBheWxvYWQgb2YgY29uZGl0aW9uUGF5bG9hZExpc3QpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgbmV3Q29uZGl0aW9uID0gQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcblx0XHRcdFx0XHRcdFx0XHRcIkVRXCIsXG5cdFx0XHRcdFx0XHRcdFx0W2NvbmRpdGlvblBheWxvYWRbb3V0UGFyYW1ldGVyLmhlbHBQYXRoXV0sXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdENvbmRpdGlvblZhbGlkYXRlZC5WYWxpZGF0ZWRcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0c3RhdGUuZmlsdGVyW2ZpbHRlclRhcmdldF0gfHw9IFtdO1xuXHRcdFx0XHRcdFx0XHRzdGF0ZS5maWx0ZXJbZmlsdGVyVGFyZ2V0XS5wdXNoKG5ld0NvbmRpdGlvbik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKGZpbHRlckJhciwgc3RhdGUpO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0Y29uc3QgbWVzc2FnZSA9IGVyciBpbnN0YW5jZW9mIEVycm9yID8gZXJyLm1lc3NhZ2UgOiBTdHJpbmcoZXJyKTtcblx0XHRcdExvZy5lcnJvcihgVmFsdWVIZWxwRGVsZWdhdGU6ICR7bWVzc2FnZX1gKTtcblx0XHR9XG5cdH0sXG5cblx0X29uQ29uZGl0aW9uUHJvcGFnYXRpb25Ub0JpbmRpbmdDb250ZXh0OiBmdW5jdGlvbiAoY29uZGl0aW9uczogQ29uZGl0aW9uT2JqZWN0W10sIG91dFBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW10sIGNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRjb25zdCBtZXRhTW9kZWwgPSBjb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cblx0XHRmb3IgKGNvbnN0IGNvbmRpdGlvbiBvZiBjb25kaXRpb25zKSB7XG5cdFx0XHRjb25zdCBjb25kaXRpb25QYXlsb2FkTGlzdCA9IHRoaXMuX2dldENvbmRpdGlvblBheWxvYWRMaXN0KGNvbmRpdGlvbiksXG5cdFx0XHRcdG91dFZhbHVlcyA9IGNvbmRpdGlvblBheWxvYWRMaXN0Lmxlbmd0aCA9PT0gMSA/IGNvbmRpdGlvblBheWxvYWRMaXN0WzBdIDogdW5kZWZpbmVkO1xuXG5cdFx0XHRpZiAoY29uZGl0aW9uUGF5bG9hZExpc3QubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRMb2cud2FybmluZyhcIlZhbHVlSGVscERlbGVnYXRlOiBQYXJhbWV0ZXJPdXQgaW4gbXVsdGktdmFsdWUtZmllbGQgbm90IHN1cHBvcnRlZFwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChvdXRWYWx1ZXMpIHtcblx0XHRcdFx0dGhpcy5fb25Db25kaXRpb25Qcm9wYWdhdGlvblVwZGF0ZVByb3BlcnR5KG1ldGFNb2RlbCwgb3V0VmFsdWVzLCBvdXRQYXJhbWV0ZXJzLCBjb250ZXh0KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X29uQ29uZGl0aW9uUHJvcGFnYXRpb25VcGRhdGVQcm9wZXJ0eTogZnVuY3Rpb24gKFxuXHRcdG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsXG5cdFx0b3V0VmFsdWVzOiBDb25kaXRpb25QYXlsb2FkVHlwZSxcblx0XHRvdXRQYXJhbWV0ZXJzOiBJbk91dFBhcmFtZXRlcltdLFxuXHRcdGNvbnRleHQ6IENvbnRleHRcblx0KSB7XG5cdFx0Y29uc3QgY29udmVydGVkTWV0YWRhdGEgPSBjb252ZXJ0VHlwZXMobWV0YU1vZGVsKTtcblx0XHRjb25zdCByb290UGF0aCA9IG1ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChjb250ZXh0LmdldFBhdGgoKSkuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGNvbnRleHRDYW5SZXF1ZXN0U2lkZUVmZmVjdHMgPSBjb250ZXh0LmlzVHJhbnNpZW50KCkgIT09IHRydWUgJiYgY29udGV4dC5pc0luYWN0aXZlKCkgIT09IHRydWU7XG5cdFx0Zm9yIChjb25zdCBvdXRQYXJhbWV0ZXIgb2Ygb3V0UGFyYW1ldGVycykge1xuXHRcdFx0LyogVXBkYXRlZCBwcm9wZXJ0eSB2aWEgb3V0LXBhcmFtZXRlciBpZiB2YWx1ZSBjaGFuZ2VkICovXG5cdFx0XHRpZiAoY29udGV4dC5nZXRQcm9wZXJ0eShvdXRQYXJhbWV0ZXIuc291cmNlKSAhPT0gb3V0VmFsdWVzW291dFBhcmFtZXRlci5oZWxwUGF0aF0pIHtcblx0XHRcdFx0dGhpcy5fdXBkYXRlUHJvcGVydHlWaWFPdXRQYXJhbWV0ZXIoXG5cdFx0XHRcdFx0Y29udmVydGVkTWV0YWRhdGEsXG5cdFx0XHRcdFx0cm9vdFBhdGgsXG5cdFx0XHRcdFx0b3V0VmFsdWVzLFxuXHRcdFx0XHRcdG91dFBhcmFtZXRlcixcblx0XHRcdFx0XHRjb250ZXh0LFxuXHRcdFx0XHRcdGNvbnRleHRDYW5SZXF1ZXN0U2lkZUVmZmVjdHNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cblx0X3VwZGF0ZVByb3BlcnR5VmlhT3V0UGFyYW1ldGVyOiBmdW5jdGlvbiAoXG5cdFx0Y29udmVydGVkTWV0YWRhdGE6IENvbnZlcnRlZE1ldGFkYXRhLFxuXHRcdHJvb3RQYXRoOiBzdHJpbmcsXG5cdFx0b3V0VmFsdWVzOiBDb25kaXRpb25QYXlsb2FkVHlwZSxcblx0XHRvdXRQYXJhbWV0ZXI6IEluT3V0UGFyYW1ldGVyLFxuXHRcdGNvbnRleHQ6IENvbnRleHQsXG5cdFx0Y29udGV4dENhblJlcXVlc3RTaWRlRWZmZWN0czogYm9vbGVhblxuXHQpIHtcblx0XHQvKiBVcGRhdGVkIHByb3BlcnR5IHZpYSBvdXQtcGFyYW1ldGVyIGlmIHZhbHVlIGNoYW5nZWQgKi9cblx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBgJHtyb290UGF0aH0vJHtvdXRQYXJhbWV0ZXIuc291cmNlfWA7XG5cdFx0Y29uc3QgdGFyZ2V0UHJvcGVydHkgPSBjb252ZXJ0ZWRNZXRhZGF0YS5yZXNvbHZlUGF0aDxQcm9wZXJ0eT4ocHJvcGVydHlQYXRoKS50YXJnZXQ7XG5cdFx0Y29uc3QgZmllbGRDb250cm9sID0gdGFyZ2V0UHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LkZpZWxkQ29udHJvbDtcblx0XHRjb25zdCBkeW5hbWljUmVhZE9ubHkgPSBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbihmaWVsZENvbnRyb2wpID8gY29udGV4dC5nZXRQcm9wZXJ0eShmaWVsZENvbnRyb2wucGF0aCkgPT09IDEgOiBmYWxzZTtcblx0XHRpZiAoZHluYW1pY1JlYWRPbmx5ICYmIGNvbnRleHRDYW5SZXF1ZXN0U2lkZUVmZmVjdHMpIHtcblx0XHRcdC8qIE5vbi1UcmFuc2llbnQgYW5kIGFjdGl2ZSBjb250ZXh0ICovXG5cdFx0XHRjb25zdCBsYXN0SW5kZXggPSBvdXRQYXJhbWV0ZXIuc291cmNlLmxhc3RJbmRleE9mKFwiL1wiKTtcblx0XHRcdGNvbnN0IHNpZGVFZmZlY3RQYXRoID0gbGFzdEluZGV4ID4gMCA/IG91dFBhcmFtZXRlci5zb3VyY2Uuc3Vic3RyaW5nKDAsIGxhc3RJbmRleCkgOiBvdXRQYXJhbWV0ZXIuc291cmNlO1xuXHRcdFx0LyogV2Ugc2VuZCBbPHByb3BlcnR5TmFtZT5dIGluIGNhc2Ugb2YgYSBwcm9wZXJ0eSBwYXRoIHdpdGhvdXQgYW55IG5hdmlnYXRpb24gaW52b2x2ZWQgKi9cblx0XHRcdC8qIEluIGNhc2Ugb2YgYSBwYXRoIGludm9sdmluZyBuYXZpZ2F0aW9ucywgd2Ugc2VuZCBbPG5hdmlnYXRpb25QYXRoPl0gZW5kaW5nIHdpdGggYSBuYXZpZ2F0aW9uIHByb3BlcnR5IGFuZCBub3Qgd2l0aCBhIHByb3BlcnR5ICovXG5cdFx0XHRjb250ZXh0LnJlcXVlc3RTaWRlRWZmZWN0cyhbc2lkZUVmZmVjdFBhdGhdKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0LyogVGhlIGZhc3QgY3JlYXRpb24gcm93ICh0cmFuc2llbnQgY29udGV4dCkgY2FuwrR0IGhhdmUgaW5zdGFudCBzcGVjaWZpYyAoZHluYW1pYykgcmVhZC1vbmx5IGZpZWxkcywgdGhlcmVmb3JlIHdlIGRvbsK0dCBuZWVkIHRvIGhhbmRsZS9jb25zaWRlciB0aGlzIGNhc2Ugc3BlY2lmaWNhbGx5ICovXG5cdFx0XHQvKiBBZGRpdGlvbmFsIGluZm9zOiAqL1xuXHRcdFx0LyogVGhlIGZhc3QgY3JlYXRpb24gcm93IGlzIG9ubHkgdXNlZCBieSBTRCAqL1xuXHRcdFx0LyogVGhlIGdyb3VwIElEICh0aGlyZCBhcmd1bWVudCBvZiBzZXRQcm9wZXJ0eSBkZXNjcmliZWQgYXBpIGRvY3VtZW50YXRpb24gb2YgdGhlIENvbnRleHQpIGlzIHVzZWQgZm9yIHRoZSBQQVRDSCByZXF1ZXN0LCBpZiBub3Qgc3BlY2lmaWVkLCB0aGUgdXBkYXRlIGdyb3VwIElEIGZvciB0aGUgY29udGV4dCdzIGJpbmRpbmcgaXMgdXNlZCwgJ251bGwnIHRvIHByZXZlbnQgdGhlIFBBVENIIHJlcXVlc3QgKi9cblx0XHRcdC8qIFRoZSBUcmFuc2llbnQgY29udGV4dCBjYW5ub3QgcmVxdWVzdCBTaWRlRWZmZWN0cyBhbmQgIGNhbm5vdCBwYXRjaCB2aWEgZ3JvdXAgJ251bGwnICovXG5cdFx0XHRjb250ZXh0LnNldFByb3BlcnR5KG91dFBhcmFtZXRlci5zb3VyY2UsIG91dFZhbHVlc1tvdXRQYXJhbWV0ZXIuaGVscFBhdGhdKTtcblx0XHR9XG5cdFx0LyogSWYgdGhlIGtleSBnZXRzIHVwZGF0ZWQgdmlhIG91dC1wYXJhbWV0ZXIsIHRoZW4gdGhlIGRlc2NyaXB0aW9uIG5lZWRzIGFsc28gcmV0cmlldmVkIHdpdGggcmVxdWVzdFNpZGVFZmZlY3RzICovXG5cdFx0Y29uc3QgdGV4dFBhdGggPSBpc1BhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbih0YXJnZXRQcm9wZXJ0eT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dClcblx0XHRcdD8gdGFyZ2V0UHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LlRleHQucGF0aFxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0aWYgKHRleHRQYXRoICE9PSB1bmRlZmluZWQgJiYgY29udGV4dENhblJlcXVlc3RTaWRlRWZmZWN0cykge1xuXHRcdFx0Y29uc3QgbGFzdEluZGV4ID0gdGV4dFBhdGgubGFzdEluZGV4T2YoXCIvXCIpO1xuXHRcdFx0Y29uc3Qgc2lkZUVmZmVjdFBhdGggPSBsYXN0SW5kZXggPiAwID8gdGV4dFBhdGguc3Vic3RyaW5nKDAsIGxhc3RJbmRleCkgOiB0ZXh0UGF0aDtcblx0XHRcdC8qIFRoZSBzaWRlRWZmZWN0UGF0aCBjYW4gYmUgWzxwcm9wZXJ0eU5hbWU+XSBvciBbPG5hdmlnYXRpb25QYXRoPl0gKi9cblx0XHRcdGNvbnRleHQucmVxdWVzdFNpZGVFZmZlY3RzKFtzaWRlRWZmZWN0UGF0aF0pO1xuXHRcdH1cblx0fSxcblxuXHRnZXRGaWx0ZXJDb25kaXRpb25zOiBmdW5jdGlvbiAodmFsdWVIZWxwOiBWYWx1ZUhlbHAsIGNvbnRlbnQ6IENvbnRlbnQsIF9jb25maWc6IGFueSkge1xuXHRcdGlmICh0aGlzLmdldEluaXRpYWxGaWx0ZXJDb25kaXRpb25zKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9ucyh2YWx1ZUhlbHAsIGNvbnRlbnQsIChfY29uZmlnICYmIF9jb25maWcuY29udHJvbCkgfHwgKGNvbnRlbnQgJiYgY29udGVudC5nZXRDb250cm9sKCkpKTtcblx0XHR9XG5cdFx0cmV0dXJuIHt9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBpbnZva2VkIGV2ZXJ5IHRpbWUgYSB7QGxpbmsgc2FwLnVpLm1kYy5WYWx1ZUhlbHAgVmFsdWVIZWxwfSBmaXJlcyBhIHNlbGVjdCBldmVudCBvciB0aGUgdmFsdWUgb2YgdGhlIGNvcnJlc3BvbmRpbmcgZmllbGQgY2hhbmdlc1xuXHQgKiBUaGlzIGNhbGxiYWNrIG1heSBiZSB1c2VkIHRvIHVwZGF0ZSBleHRlcm5hbCBmaWVsZHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHAgVGhlIDxjb2RlPlZhbHVlSGVscDwvY29kZT4gaW5zdGFuY2Vcblx0ICogQHBhcmFtIHZhbHVlSGVscCBWYWx1ZUhlbHAgY29udHJvbCBpbnN0YW5jZSByZWNlaXZpbmcgdGhlIDxjb2RlPmNvbnRyb2xDaGFuZ2U8L2NvZGU+XG5cdCAqIEBwYXJhbSByZWFzb24gUmVhc29uIHdoeSB0aGUgbWV0aG9kIHdhcyBpbnZva2VkXG5cdCAqIEBwYXJhbSBfY29uZmlnIEN1cnJlbnQgY29uZmlndXJhdGlvbiBwcm92aWRlZCBieSB0aGUgY2FsbGluZyBjb250cm9sXG5cdCAqIEBzaW5jZSAxLjEwMS4wXG5cdCAqL1xuXHRvbkNvbmRpdGlvblByb3BhZ2F0aW9uOiBhc3luYyBmdW5jdGlvbiAodmFsdWVIZWxwOiBWYWx1ZUhlbHAsIHJlYXNvbjogc3RyaW5nLCBfY29uZmlnOiB1bmtub3duKSB7XG5cdFx0aWYgKHJlYXNvbiAhPT0gXCJDb250cm9sQ2hhbmdlXCIpIHtcblx0XHRcdC8vIGhhbmRsZSBvbmx5IENvbnRyb2xDaGFuZ2UgcmVhc29uXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHBheWxvYWQgPSB2YWx1ZUhlbHAuZ2V0UGF5bG9hZCgpIGFzIFZhbHVlSGVscFBheWxvYWQ7XG5cdFx0Y29uc3QgcXVhbGlmaWVyID0gcGF5bG9hZC5xdWFsaWZpZXJzW3BheWxvYWQudmFsdWVIZWxwUXVhbGlmaWVyXTtcblx0XHRjb25zdCBvdXRQYXJhbWV0ZXJzID0gcXVhbGlmaWVyPy52aFBhcmFtZXRlcnMgIT09IHVuZGVmaW5lZCA/IFZhbHVlTGlzdEhlbHBlci5nZXRPdXRQYXJhbWV0ZXJzKHF1YWxpZmllci52aFBhcmFtZXRlcnMpIDogW10sXG5cdFx0XHRmaWVsZCA9IHZhbHVlSGVscC5nZXRDb250cm9sKCkgYXMgRmllbGRCYXNlLFxuXHRcdFx0ZmllbGRQYXJlbnQgPSBmaWVsZC5nZXRQYXJlbnQoKSBhcyBGaWx0ZXJCYXJCYXNlIHwgQ29udHJvbDtcblxuXHRcdGxldCBjb25kaXRpb25zID0gZmllbGQuZ2V0Q29uZGl0aW9ucygpIGFzIENvbmRpdGlvbk9iamVjdFtdO1xuXHRcdGNvbmRpdGlvbnMgPSBjb25kaXRpb25zLmZpbHRlcihmdW5jdGlvbiAoY29uZGl0aW9uKSB7XG5cdFx0XHRjb25zdCBjb25kaXRpb25QYXlsb2FkTWFwID0gKGNvbmRpdGlvbi5wYXlsb2FkIHx8IHt9KSBhcyBDb25kaXRpb25QYXlsb2FkTWFwO1xuXHRcdFx0cmV0dXJuIGNvbmRpdGlvblBheWxvYWRNYXBbcGF5bG9hZC52YWx1ZUhlbHBRdWFsaWZpZXJdO1xuXHRcdH0pO1xuXG5cdFx0aWYgKGZpZWxkUGFyZW50LmlzQTxGaWx0ZXJCYXJCYXNlPihNZGNGaWx0ZXJiYXJGaWx0ZXJCYXJCYXNlKSkge1xuXHRcdFx0Ly8gZmllbGQgaW5zaWRlIGEgRmlsdGVyQmFyIG9yIEFkYXB0YXRpb25GaWx0ZXJCYXIgKFNldHRpbmdzIERpYWxvZyk/XG5cdFx0XHRjb25zdCBmaWx0ZXJCYXJWSCA9IHZhbHVlSGVscC5nZXRQYXJlbnQoKSBhcyBGaWx0ZXJCYXJCYXNlIHwgQ29udHJvbDsgLy8gQ29udHJvbCBlLmcuIEZvcm1Db250YWluZXJcblx0XHRcdGlmIChmaWx0ZXJCYXJWSC5pc0EoRmVDb3JlQ29udHJvbHNGaWx0ZXJCYXIpKSB7XG5cdFx0XHRcdC8vIG9ubHkgZm9yIExSIEZpbHRlckJhclxuXHRcdFx0XHRhd2FpdCB0aGlzLl9vbkNvbmRpdGlvblByb3BhZ2F0aW9uVG9GaWx0ZXJCYXIoZmlsdGVyQmFyVkggYXMgRmlsdGVyQmFyQmFzZSwgY29uZGl0aW9ucywgb3V0UGFyYW1ldGVycywgZmllbGRQYXJlbnQpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gTFIgU2V0dGluZ3MgRGlhbG9nIG9yIE9QIFNldHRpbmdzIERpYWxvZyBzaGFsbCBub3QgcHJvcGFnYXRlIHZhbHVlIHRvIHRoZSBkaWFsb2cgZmlsdGVyZmllbGRzIG9yIGNvbnRleHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gT2JqZWN0IFBhZ2Vcblx0XHRcdGNvbnN0IGNvbnRleHQgPSB2YWx1ZUhlbHAuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHRcdFx0aWYgKGNvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5fb25Db25kaXRpb25Qcm9wYWdhdGlvblRvQmluZGluZ0NvbnRleHQoY29uZGl0aW9ucywgb3V0UGFyYW1ldGVycywgY29udGV4dCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9jcmVhdGVJbml0aWFsRmlsdGVyQ29uZGl0aW9uOiBmdW5jdGlvbiAodmFsdWU6IHVua25vd24sIGluaXRpYWxWYWx1ZUZpbHRlckVtcHR5OiBib29sZWFuKSB7XG5cdFx0bGV0IGNvbmRpdGlvbjogQ29uZGl0aW9uT2JqZWN0IHwgdW5kZWZpbmVkO1xuXG5cdFx0aWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcblx0XHRcdExvZy5lcnJvcihcIlZhbHVlSGVscERlbGVnYXRlOiB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgY291bGQgbm90IGJlIHJlcXVlc3RlZFwiKTtcblx0XHR9IGVsc2UgaWYgKHZhbHVlID09PSBcIlwiKSB7XG5cdFx0XHRpZiAoaW5pdGlhbFZhbHVlRmlsdGVyRW1wdHkpIHtcblx0XHRcdFx0Y29uZGl0aW9uID0gQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcIkVtcHR5XCIsIFtdLCBudWxsLCBudWxsLCBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uZGl0aW9uID0gQ29uZGl0aW9uLmNyZWF0ZUNvbmRpdGlvbihcIkVRXCIsIFt2YWx1ZV0sIG51bGwsIG51bGwsIENvbmRpdGlvblZhbGlkYXRlZC5WYWxpZGF0ZWQpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29uZGl0aW9uO1xuXHR9LFxuXG5cdF9nZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uc0Zyb21CaW5kaW5nOiBhc3luYyBmdW5jdGlvbiAoXG5cdFx0aW5Db25kaXRpb25zOiBDb25kaXRpb25PYmplY3RNYXAsXG5cdFx0Y29udHJvbDogQ29udHJvbCxcblx0XHRpblBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW11cblx0KSB7XG5cdFx0Y29uc3QgcHJvcGVydGllc1RvUmVxdWVzdCA9IGluUGFyYW1ldGVycy5tYXAoKGluUGFyYW1ldGVyKSA9PiBpblBhcmFtZXRlci5zb3VyY2UpO1xuXHRcdGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gY29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQ7XG5cblx0XHRpZiAoIWJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJWYWx1ZUhlbHBEZWxlZ2F0ZTogTm8gQmluZGluZ0NvbnRleHRcIik7XG5cdFx0XHRyZXR1cm4gaW5Db25kaXRpb25zO1xuXHRcdH1cblxuXHRcdC8vIEFjY29yZGluZyB0byBvZGF0YSB2NCBhcGkgZG9jdW1lbnRhdGlvbiBmb3IgcmVxdWVzdFByb3BlcnR5OiBQcm9wZXJ0eSB2YWx1ZXMgdGhhdCBhcmUgbm90IGNhY2hlZCB5ZXQgYXJlIHJlcXVlc3RlZCBmcm9tIHRoZSBiYWNrIGVuZFxuXHRcdGNvbnN0IHZhbHVlcyA9IGF3YWl0IGJpbmRpbmdDb250ZXh0LnJlcXVlc3RQcm9wZXJ0eShwcm9wZXJ0aWVzVG9SZXF1ZXN0KTtcblxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaW5QYXJhbWV0ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBpblBhcmFtZXRlciA9IGluUGFyYW1ldGVyc1tpXTtcblx0XHRcdGNvbnN0IGNvbmRpdGlvbiA9IHRoaXMuX2NyZWF0ZUluaXRpYWxGaWx0ZXJDb25kaXRpb24odmFsdWVzW2ldLCBpblBhcmFtZXRlci5pbml0aWFsVmFsdWVGaWx0ZXJFbXB0eSk7XG5cblx0XHRcdGlmIChjb25kaXRpb24pIHtcblx0XHRcdFx0aW5Db25kaXRpb25zW2luUGFyYW1ldGVyLmhlbHBQYXRoXSA9IFtjb25kaXRpb25dO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaW5Db25kaXRpb25zO1xuXHR9LFxuXG5cdF9nZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uc0Zyb21GaWx0ZXJCYXI6IGFzeW5jIGZ1bmN0aW9uIChcblx0XHRpbkNvbmRpdGlvbnM6IENvbmRpdGlvbk9iamVjdE1hcCxcblx0XHRjb250cm9sOiBDb250cm9sLFxuXHRcdGluUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXVxuXHQpIHtcblx0XHRjb25zdCBmaWx0ZXJCYXIgPSBjb250cm9sLmdldFBhcmVudCgpIGFzIEZpbHRlckJhckJhc2U7XG5cdFx0Y29uc3Qgc3RhdGU6IEV4dGVybmFsU3RhdGVUeXBlID0gYXdhaXQgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShmaWx0ZXJCYXIpO1xuXG5cdFx0Zm9yIChjb25zdCBpblBhcmFtZXRlciBvZiBpblBhcmFtZXRlcnMpIHtcblx0XHRcdGNvbnN0IGNvbmRpdGlvbnMgPSB0aGlzLl9nZXRDb25kaXRpb25zRnJvbUluUGFyYW1ldGVyKGluUGFyYW1ldGVyLCBzdGF0ZSk7XG5cdFx0XHRpZiAoY29uZGl0aW9ucykge1xuXHRcdFx0XHRpbkNvbmRpdGlvbnNbaW5QYXJhbWV0ZXIuaGVscFBhdGhdID0gY29uZGl0aW9ucztcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGluQ29uZGl0aW9ucztcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZmlsdGVyIGNvbmRpdGlvbnMuXG5cdCAqIFJlZ2FyZGluZyBhIG5hdmlnYXRpb24gcGF0aCBpbiB0aGUgSW5PdXQgcGFyYW1ldGVycyBhbmQgZGlzcmVnYXJkaW5nIHByZWZpeGVzIGluIHRoZSBuYXZpZ2F0aW9uIHBhdGggbGlrZSBlLmcuICckZmlsdGVycz4vY29uZGl0aW9ucy8nIG9yICdvd25lcicuXG5cdCAqXG5cdCAqIEBwYXJhbSBpblBhcmFtZXRlciBJblBhcm1ldGVyIG9mIHRoZSBmaWx0ZXIgZmllbGQgdmFsdWUgaGVscFxuXHQgKiBAcGFyYW0gc3RhdGUgVGhlIGV4dGVybmFsIGZpbHRlciBzdGF0ZVxuXHQgKiBAcmV0dXJucyBUaGUgZmlsdGVyIGNvbmRpdGlvbnNcblx0ICogQHNpbmNlIDEuMTE0LjBcblx0ICovXG5cdF9nZXRDb25kaXRpb25zRnJvbUluUGFyYW1ldGVyOiBmdW5jdGlvbiAoaW5QYXJhbWV0ZXI6IEluT3V0UGFyYW1ldGVyLCBzdGF0ZTogRXh0ZXJuYWxTdGF0ZVR5cGUpIHtcblx0XHRjb25zdCBzb3VyY2VGaWVsZCA9IGluUGFyYW1ldGVyLnNvdXJjZTtcblx0XHRjb25zdCBrZXkgPSBPYmplY3Qua2V5cyhzdGF0ZS5maWx0ZXIpLmZpbmQoKGtleSkgPT4gKFwiL1wiICsgc291cmNlRmllbGQpLmVuZHNXaXRoKFwiL1wiICsga2V5KSk7IC8vYWRkaXRpb25hbCAnLycgdG8gaGFuZGxlIGhlYWRpbmcgY2hhcmFjdGVycyBpbiB0aGUgc291cmNlIG5hbWUgaWYgdGhlcmUgaXMgbm8gcGF0aFxuXHRcdHJldHVybiBrZXkgJiYgc3RhdGUuZmlsdGVyW2tleV07XG5cdH0sXG5cblx0X3BhcnRpdGlvbkluUGFyYW1ldGVyczogZnVuY3Rpb24gKGluUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXSkge1xuXHRcdGNvbnN0IGluUGFyYW1ldGVyTWFwOiBSZWNvcmQ8c3RyaW5nLCBJbk91dFBhcmFtZXRlcltdPiA9IHtcblx0XHRcdGNvbnN0YW50OiBbXSxcblx0XHRcdGJpbmRpbmc6IFtdLFxuXHRcdFx0ZmlsdGVyOiBbXVxuXHRcdH07XG5cblx0XHRmb3IgKGNvbnN0IGluUGFyYW1ldGVyIG9mIGluUGFyYW1ldGVycykge1xuXHRcdFx0aWYgKGluUGFyYW1ldGVyLmNvbnN0YW50VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRpblBhcmFtZXRlck1hcC5jb25zdGFudC5wdXNoKGluUGFyYW1ldGVyKTtcblx0XHRcdH0gZWxzZSBpZiAoaW5QYXJhbWV0ZXIuc291cmNlLmluZGV4T2YoXCIkZmlsdGVyXCIpID09PSAwKSB7XG5cdFx0XHRcdGluUGFyYW1ldGVyTWFwLmZpbHRlci5wdXNoKGluUGFyYW1ldGVyKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGluUGFyYW1ldGVyTWFwLmJpbmRpbmcucHVzaChpblBhcmFtZXRlcik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpblBhcmFtZXRlck1hcDtcblx0fSxcblxuXHRfdGFibGVBZnRlclJlbmRlckRlbGVnYXRlOiB7XG5cdFx0b25BZnRlclJlbmRlcmluZzogZnVuY3Rpb24gKGV2ZW50OiBqUXVlcnkuRXZlbnQgJiB7IHNyY0NvbnRyb2w6IENvbnRyb2wgfSkge1xuXHRcdFx0Y29uc3QgdGFibGUgPSBldmVudC5zcmNDb250cm9sLCAvLyBtLlRhYmxlXG5cdFx0XHRcdHRhYmxlQ2VsbHNEb21SZWZzID0gdGFibGUuJCgpLmZpbmQoXCJ0Ym9keSAuc2FwTVRleHRcIiksXG5cdFx0XHRcdG1kY01UYWJsZSA9IHRhYmxlLmdldFBhcmVudCgpIGFzIE1UYWJsZTtcblxuXHRcdFx0aGlnaGxpZ2h0RE9NRWxlbWVudHModGFibGVDZWxsc0RvbVJlZnMsIG1kY01UYWJsZS5nZXRGaWx0ZXJWYWx1ZSgpLCB0cnVlKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIGFuIGluaXRpYWwgY29uZGl0aW9uIGNvbmZpZ3VyYXRpb24gZXZlcnl0aW1lIGEgdmFsdWUgaGVscCBjb250ZW50IGlzIHNob3duLlxuXHQgKlxuXHQgKiBAcGFyYW0gdmFsdWVIZWxwIFRoZSA8Y29kZT5WYWx1ZUhlbHA8L2NvZGU+IGluc3RhbmNlXG5cdCAqIEBwYXJhbSBjb250ZW50IFZhbHVlSGVscCBjb250ZW50IHJlcXVlc3RpbmcgY29uZGl0aW9ucyBjb25maWd1cmF0aW9uXG5cdCAqIEBwYXJhbSBjb250cm9sIEluc3RhbmNlIG9mIHRoZSBjYWxsaW5nIGNvbnRyb2xcblx0ICogQHJldHVybnMgUmV0dXJucyBhIG1hcCBvZiBjb25kaXRpb25zIHN1aXRhYmxlIGZvciBhIHNhcC51aS5tZGMuRmlsdGVyQmFyIGNvbnRyb2xcblx0ICogQHNpbmNlIDEuMTAxLjBcblx0ICovXG5cdGdldEluaXRpYWxGaWx0ZXJDb25kaXRpb25zOiBhc3luYyBmdW5jdGlvbiAodmFsdWVIZWxwOiBWYWx1ZUhlbHAsIGNvbnRlbnQ6IENvbnRlbnQsIGNvbnRyb2w6IENvbnRyb2wgfCB1bmRlZmluZWQpIHtcblx0XHQvLyBoaWdobGlnaHQgdGV4dCBpbiBWYWx1ZUhlbHAgcG9wb3ZlclxuXHRcdGlmIChjb250ZW50Py5pc0EoXCJzYXAudWkubWRjLnZhbHVlaGVscC5jb250ZW50Lk1UYWJsZVwiKSkge1xuXHRcdFx0Y29uc3QgcG9wb3ZlclRhYmxlID0gKGNvbnRlbnQgYXMgTVRhYmxlKS5nZXRUYWJsZSgpO1xuXHRcdFx0cG9wb3ZlclRhYmxlPy5yZW1vdmVFdmVudERlbGVnYXRlKHRoaXMuX3RhYmxlQWZ0ZXJSZW5kZXJEZWxlZ2F0ZSk7XG5cdFx0XHRwb3BvdmVyVGFibGU/LmFkZEV2ZW50RGVsZWdhdGUodGhpcy5fdGFibGVBZnRlclJlbmRlckRlbGVnYXRlLCB0aGlzKTtcblx0XHR9XG5cblx0XHRjb25zdCBpbkNvbmRpdGlvbnM6IENvbmRpdGlvbk9iamVjdE1hcCA9IHt9O1xuXG5cdFx0aWYgKCFjb250cm9sKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJWYWx1ZUhlbHBEZWxlZ2F0ZTogQ29udHJvbCB1bmRlZmluZWRcIik7XG5cdFx0XHRyZXR1cm4gaW5Db25kaXRpb25zO1xuXHRcdH1cblxuXHRcdGNvbnN0IHBheWxvYWQgPSB2YWx1ZUhlbHAuZ2V0UGF5bG9hZCgpIGFzIFZhbHVlSGVscFBheWxvYWQ7XG5cdFx0Y29uc3QgcXVhbGlmaWVyID0gcGF5bG9hZC5xdWFsaWZpZXJzW3BheWxvYWQudmFsdWVIZWxwUXVhbGlmaWVyXTtcblx0XHRjb25zdCBpblBhcmFtZXRlcnMgPSBxdWFsaWZpZXI/LnZoUGFyYW1ldGVycyAhPT0gdW5kZWZpbmVkID8gVmFsdWVMaXN0SGVscGVyLmdldEluUGFyYW1ldGVycyhxdWFsaWZpZXIudmhQYXJhbWV0ZXJzKSA6IFtdO1xuXHRcdGNvbnN0IGluUGFyYW1ldGVyTWFwID0gdGhpcy5fcGFydGl0aW9uSW5QYXJhbWV0ZXJzKGluUGFyYW1ldGVycyk7XG5cdFx0Y29uc3QgaXNPYmplY3RQYWdlID0gY29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXG5cdFx0Zm9yIChjb25zdCBpblBhcmFtZXRlciBvZiBpblBhcmFtZXRlck1hcC5jb25zdGFudCkge1xuXHRcdFx0Y29uc3QgY29uZGl0aW9uID0gdGhpcy5fY3JlYXRlSW5pdGlhbEZpbHRlckNvbmRpdGlvbihcblx0XHRcdFx0aW5QYXJhbWV0ZXIuY29uc3RhbnRWYWx1ZSxcblx0XHRcdFx0aXNPYmplY3RQYWdlID8gaW5QYXJhbWV0ZXIuaW5pdGlhbFZhbHVlRmlsdGVyRW1wdHkgOiBmYWxzZSAvLyBubyBmaWx0ZXIgd2l0aCBcImVtcHR5XCIgb24gTGlzdFJlcG9ydFxuXHRcdFx0KTtcblx0XHRcdGlmIChjb25kaXRpb24pIHtcblx0XHRcdFx0aW5Db25kaXRpb25zW2luUGFyYW1ldGVyLmhlbHBQYXRoXSA9IFtjb25kaXRpb25dO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChpblBhcmFtZXRlck1hcC5iaW5kaW5nLmxlbmd0aCkge1xuXHRcdFx0YXdhaXQgdGhpcy5fZ2V0SW5pdGlhbEZpbHRlckNvbmRpdGlvbnNGcm9tQmluZGluZyhpbkNvbmRpdGlvbnMsIGNvbnRyb2wsIGluUGFyYW1ldGVyTWFwLmJpbmRpbmcpO1xuXHRcdH1cblxuXHRcdGlmIChpblBhcmFtZXRlck1hcC5maWx0ZXIubGVuZ3RoKSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9nZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uc0Zyb21GaWx0ZXJCYXIoaW5Db25kaXRpb25zLCBjb250cm9sLCBpblBhcmFtZXRlck1hcC5maWx0ZXIpO1xuXHRcdH1cblx0XHRyZXR1cm4gaW5Db25kaXRpb25zO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyB0aGUgcG9zc2liaWxpdHkgdG8gY29udmV5IGN1c3RvbSBkYXRhIGluIGNvbmRpdGlvbnMuXG5cdCAqIFRoaXMgZW5hYmxlcyBhbiBhcHBsaWNhdGlvbiB0byBlbmhhbmNlIGNvbmRpdGlvbnMgd2l0aCBkYXRhIHJlbGV2YW50IGZvciBjb21iaW5lZCBrZXkgb3Igb3V0cGFyYW1ldGVyIHNjZW5hcmlvcy5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlSGVscCBUaGUgPGNvZGU+VmFsdWVIZWxwPC9jb2RlPiBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gY29udGVudCBWYWx1ZUhlbHAgY29udGVudCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gX3ZhbHVlcyBEZXNjcmlwdGlvbiBwYWlyIGZvciB0aGUgY29uZGl0aW9uIHdoaWNoIGlzIHRvIGJlIGNyZWF0ZWRcblx0ICogQHBhcmFtIGNvbnRleHQgT3B0aW9uYWwgYWRkaXRpb25hbCBjb250ZXh0XG5cdCAqIEByZXR1cm5zIE9wdGlvbmFsbHkgcmV0dXJucyBhIHNlcmlhbGl6YWJsZSBvYmplY3QgdG8gYmUgc3RvcmVkIGluIHRoZSBjb25kaXRpb24gcGF5bG9hZCBmaWVsZFxuXHQgKiBAc2luY2UgMS4xMDEuMFxuXHQgKi9cblx0Y3JlYXRlQ29uZGl0aW9uUGF5bG9hZDogZnVuY3Rpb24gKFxuXHRcdHZhbHVlSGVscDogVmFsdWVIZWxwLFxuXHRcdGNvbnRlbnQ6IENvbnRlbnQsXG5cdFx0X3ZhbHVlczogdW5rbm93bltdLFxuXHRcdGNvbnRleHQ6IENvbnRleHRcblx0KTogQ29uZGl0aW9uUGF5bG9hZE1hcCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgcGF5bG9hZCA9IHZhbHVlSGVscC5nZXRQYXlsb2FkKCkgYXMgVmFsdWVIZWxwUGF5bG9hZDtcblx0XHRjb25zdCBxdWFsaWZpZXIgPSBwYXlsb2FkLnF1YWxpZmllcnNbcGF5bG9hZC52YWx1ZUhlbHBRdWFsaWZpZXJdLFxuXHRcdFx0ZW50cnk6IENvbmRpdGlvblBheWxvYWRUeXBlID0ge30sXG5cdFx0XHRjb25kaXRpb25QYXlsb2FkOiBDb25kaXRpb25QYXlsb2FkTWFwID0ge307XG5cdFx0Y29uc3QgY29udHJvbCA9IGNvbnRlbnQuZ2V0Q29udHJvbCgpO1xuXHRcdGNvbnN0IGlzTXVsdGlWYWx1ZUZpZWxkID0gY29udHJvbD8uaXNBKFwic2FwLnVpLm1kYy5NdWx0aVZhbHVlRmllbGRcIik7XG5cdFx0aWYgKCFxdWFsaWZpZXIudmhLZXlzIHx8IHF1YWxpZmllci52aEtleXMubGVuZ3RoID09PSAxIHx8IGlzTXVsdGlWYWx1ZUZpZWxkKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRxdWFsaWZpZXIudmhLZXlzLmZvckVhY2goZnVuY3Rpb24gKHZoS2V5KSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IGNvbnRleHQuZ2V0T2JqZWN0KHZoS2V5KTtcblx0XHRcdGlmICh2YWx1ZSAhPSBudWxsKSB7XG5cdFx0XHRcdGVudHJ5W3ZoS2V5XSA9IHZhbHVlPy5sZW5ndGggPT09IDAgPyBcIlwiIDogdmFsdWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKGVudHJ5KS5sZW5ndGgpIHtcblx0XHRcdC8qIHZoIHF1YWxpZmllciBhcyBrZXkgZm9yIHJlbGV2YW50IGNvbmRpdGlvbiAqL1xuXHRcdFx0Y29uZGl0aW9uUGF5bG9hZFtwYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllcl0gPSBbZW50cnldO1xuXHRcdH1cblx0XHRyZXR1cm4gY29uZGl0aW9uUGF5bG9hZDtcblx0fSxcblxuXHQvKipcblx0ICogUHJvdmlkZXMgdGhlIHBvc3NpYmlsaXR5IHRvIGN1c3RvbWl6ZSBzZWxlY3Rpb25zIGluICdTZWxlY3QgZnJvbSBsaXN0JyBzY2VuYXJpb3MuXG5cdCAqIEJ5IGRlZmF1bHQsIG9ubHkgY29uZGl0aW9uIGtleXMgYXJlIGNvbnNpZGVyZWQuIFRoaXMgbWF5IGJlIGV4dGVuZGVkIHdpdGggcGF5bG9hZCBkZXBlbmRlbnQgZmlsdGVycy5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlSGVscCBUaGUgPGNvZGU+VmFsdWVIZWxwPC9jb2RlPiBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gY29udGVudCBWYWx1ZUhlbHAgY29udGVudCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gaXRlbSBFbnRyeSBvZiBhIGdpdmVuIGxpc3Rcblx0ICogQHBhcmFtIGNvbmRpdGlvbnMgQ3VycmVudCBjb25kaXRpb25zXG5cdCAqIEByZXR1cm5zIFRydWUsIGlmIGl0ZW0gaXMgc2VsZWN0ZWRcblx0ICogQHNpbmNlIDEuMTAxLjBcblx0ICovXG5cdGlzRmlsdGVyYWJsZUxpc3RJdGVtU2VsZWN0ZWQ6IGZ1bmN0aW9uICh2YWx1ZUhlbHA6IFZhbHVlSGVscCwgY29udGVudDogQ29udGVudCwgaXRlbTogQ29udHJvbCwgY29uZGl0aW9uczogQ29uZGl0aW9uT2JqZWN0W10pIHtcblx0XHQvL0luIHZhbHVlIGhlbHAgZGlhbG9ncyBvZiBzaW5nbGUgdmFsdWUgZmllbGRzIHRoZSByb3cgZm9yIHRoZSBrZXkgc2hvdWxkbsK0dCBiZSBzZWxlY3RlZC9oaWdobGlnaHQgYW55bW9yZSBCQ1A6IDIyNzAxNzUyNDZcblx0XHRjb25zdCBwYXlsb2FkID0gdmFsdWVIZWxwLmdldFBheWxvYWQoKSBhcyBWYWx1ZUhlbHBQYXlsb2FkO1xuXHRcdGlmIChwYXlsb2FkLmlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzICE9PSB0cnVlICYmIGNvbnRlbnQuZ2V0Q29uZmlnKCk/Lm1heENvbmRpdGlvbnMgPT09IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBjb250ZXh0ID0gaXRlbS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXG5cdFx0LyogRG8gbm90IGNvbnNpZGVyIFwiTm90VmFsaWRhdGVkXCIgY29uZGl0aW9ucyAqL1xuXHRcdGNvbmRpdGlvbnMgPSBjb25kaXRpb25zLmZpbHRlcigoY29uZGl0aW9uKSA9PiBjb25kaXRpb24udmFsaWRhdGVkID09PSBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkKTtcblxuXHRcdGNvbnN0IHNlbGVjdGVkQ29uZGl0aW9uID0gY29uZGl0aW9ucy5maW5kKGZ1bmN0aW9uIChjb25kaXRpb24pIHtcblx0XHRcdGNvbnN0IGNvbmRpdGlvblBheWxvYWRNYXAgPSBjb25kaXRpb24ucGF5bG9hZCBhcyBDb25kaXRpb25QYXlsb2FkTWFwIHwgdW5kZWZpbmVkLFxuXHRcdFx0XHR2YWx1ZUhlbHBRdWFsaWZpZXIgPSBwYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllciB8fCBcIlwiO1xuXHRcdFx0aWYgKCFjb25kaXRpb25QYXlsb2FkTWFwICYmIE9iamVjdC5rZXlzKHBheWxvYWQucXVhbGlmaWVycylbMF0gPT09IHZhbHVlSGVscFF1YWxpZmllcikge1xuXHRcdFx0XHRjb25zdCBrZXlQYXRoID0gY29udGVudC5nZXRLZXlQYXRoKCk7XG5cdFx0XHRcdHJldHVybiBjb250ZXh0Py5nZXRPYmplY3Qoa2V5UGF0aCkgPT09IGNvbmRpdGlvbj8udmFsdWVzWzBdO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgY29uZGl0aW9uU2VsZWN0ZWRSb3cgPSBjb25kaXRpb25QYXlsb2FkTWFwPy5bdmFsdWVIZWxwUXVhbGlmaWVyXT8uWzBdIHx8IHt9LFxuXHRcdFx0XHRzZWxlY3RlZEtleXMgPSBPYmplY3Qua2V5cyhjb25kaXRpb25TZWxlY3RlZFJvdyk7XG5cdFx0XHRpZiAoc2VsZWN0ZWRLZXlzLmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gc2VsZWN0ZWRLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0XHRyZXR1cm4gKGNvbmRpdGlvblNlbGVjdGVkUm93W2tleV0gYXMgdW5rbm93bikgPT09IGNvbnRleHQ/LmdldE9iamVjdChrZXkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBzZWxlY3RlZENvbmRpdGlvbiA/IHRydWUgOiBmYWxzZTtcblx0fSxcblx0LyoqXG5cdCAqIENyZWF0ZXMgY29udGV4dHMgZm9yIGFkZGl0aW9uYWwgdmFsdWVzIGFuZCByZXN1bWVzIHRoZSBsaXN0IGJpbmRpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSBsaXN0QmluZGluZyBMaXN0IGJpbmRpbmdcblx0ICogQHBhcmFtIGJpbmRpbmdJbmZvIFRoZSBiaW5kaW5nIGluZm8gb2JqZWN0IHRvIGJlIHVzZWQgdG8gYmluZCB0aGUgbGlzdCB0byB0aGUgbW9kZWxcblx0ICogQHBhcmFtIGFkZGl0aW9uYWxWYWx1ZXMgQXJyYXkgb2YgQWRkaXRpb25hbFZhbHVlc1xuXHQgKi9cblx0X3VwZGF0ZUJpbmRpbmdGb3JSZWNvbW1lbmRhdGlvbnM6IGFzeW5jIGZ1bmN0aW9uIChcblx0XHRwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLFxuXHRcdGxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLFxuXHRcdGJpbmRpbmdJbmZvOiBBZ2dyZWdhdGlvbkJpbmRpbmdJbmZvLFxuXHRcdGFkZGl0aW9uYWxWYWx1ZXM6IEFkZGl0aW9uYWxWYWx1ZVR5cGVbXVxuXHQpIHtcblx0XHRsZXQgdXBkYXRlQmluZGluZ0RvbmVQcm9taXNlUmVzb2x2ZTogRnVuY3Rpb24gfCB1bmRlZmluZWQ7XG5cdFx0Ly9jcmVhdGUgYSBwcm9taXNlIHRvIG1ha2Ugc3VyZSBjaGVja0xpc3RCaW5kaW5nUGVuZGluZyBpcyBvbmx5IGNvbXBsZXRlZCBvbmNlIHRoaXMgcHJvbWlzZSBpcyByZXNvbHZlZFxuXHRcdHBheWxvYWQudXBkYXRlQmluZGluZ0RvbmVQcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRcdHVwZGF0ZUJpbmRpbmdEb25lUHJvbWlzZVJlc29sdmUgPSByZXNvbHZlO1xuXHRcdH0pO1xuXHRcdHRyeSB7XG5cdFx0XHQvL2ZldGNoIHRoZSBjb250ZXh0cyBvZiBhZGRpdGlvbmFsdmFsdWVzXG5cdFx0XHRjb25zdCBhZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YSA9IGF3YWl0IGFkZGl0aW9uYWxWYWx1ZUhlbHBlci5yZXF1ZXN0Rm9yQWRkaXRpb25hbFZhbHVlQ29udGV4dERhdGEoXG5cdFx0XHRcdGFkZGl0aW9uYWxWYWx1ZXMsXG5cdFx0XHRcdGxpc3RCaW5kaW5nLFxuXHRcdFx0XHRiaW5kaW5nSW5mb1xuXHRcdFx0KTtcblx0XHRcdC8vcmVtb3ZlIGR1cGxpY2F0ZSB2YWx1ZXMgZnJvbSBkaWZmZXJlbnQgZ3JvdXBzIG9mIGFkZGl0aW9uYWx2YWx1ZXNcblx0XHRcdGNvbnN0IHVuaXF1ZUFkZGl0aW9uYWxWYWx1ZXMgPSBhZGRpdGlvbmFsVmFsdWVIZWxwZXIucmVtb3ZlRHVwbGljYXRlQWRkaXRpb25hbFZhbHVlcyhhZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YSwgW1xuXHRcdFx0XHQuLi5hZGRpdGlvbmFsVmFsdWVzXG5cdFx0XHRdKTtcblx0XHRcdC8vc29ydCBhbmQgZmlsdGVyIHZhbHVlaGVscGJpbmRpbmcgdG8gbWFrZSBzdXJlIHdlIHJlbmRlciBvdGhlcnMgZ3JvdXBcblx0XHRcdGFkZGl0aW9uYWxWYWx1ZUhlbHBlci5zb3J0QW5kRmlsdGVyT3RoZXJzKGxpc3RCaW5kaW5nLCBiaW5kaW5nSW5mbywgdW5pcXVlQWRkaXRpb25hbFZhbHVlcyk7XG5cdFx0XHQvL3Jlc3VtZSB0aGUgbGlzdCBiaW5kaW5nIGFuZCB0aGVuIHJlc2V0IHRoZSBjaGFuZ2VzXG5cdFx0XHRhd2FpdCBhZGRpdGlvbmFsVmFsdWVIZWxwZXIucmVzdW1lVmFsdWVMaXN0QmluZGluZ0FuZFJlc2V0Q2hhbmdlcyhsaXN0QmluZGluZyk7XG5cdFx0XHRpZiAoIWFkZGl0aW9uYWxWYWx1ZUhlbHBlci5kb2VzVHJhbnNpZW50Q29udGV4dHNBbHJlYWR5RXhpc3QobGlzdEJpbmRpbmcsIHVuaXF1ZUFkZGl0aW9uYWxWYWx1ZXMpKSB7XG5cdFx0XHRcdC8vIGFkZCB0cmFuc2llbnQgY29udGV4dCB0byBsaXN0IGJpbmRpbmcgYWZ0ZXIgYmFja2VuZCBxdWVyeSBpcyBkb25lXG5cdFx0XHRcdGFkZGl0aW9uYWxWYWx1ZUhlbHBlci5jcmVhdGVBZGRpdGlvbmFsVmFsdWVUcmFuc2llbnRDb250ZXh0cyhcblx0XHRcdFx0XHRhZGRpdGlvbmFsVmFsdWVDb250ZXh0RGF0YSxcblx0XHRcdFx0XHR1bmlxdWVBZGRpdGlvbmFsVmFsdWVzLnJldmVyc2UoKSxcblx0XHRcdFx0XHRsaXN0QmluZGluZ1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHQvL0RvIG5vdGhpbmcgYXMgd2Uga25vdyB0aGF0IHJlc2V0IGNoYW5nZXMgd291bGQgdGhyb3cgYW4gZXJyb3IgaW4gY29uc29sZSBhbmQgdGhpcyB3aWxsIHBpbGUgdXAgYSBsb3Qgb2YgY29uc29sZSBlcnJvcnNcblx0XHR9XG5cdFx0aWYgKHVwZGF0ZUJpbmRpbmdEb25lUHJvbWlzZVJlc29sdmUpIHtcblx0XHRcdC8vcmVzb2x2ZSB0aGUgcHJvbWlzZSBhcyBldmVyeXRoaW5nIGlzIGNvbXBsZXRlZFxuXHRcdFx0dXBkYXRlQmluZGluZ0RvbmVQcm9taXNlUmVzb2x2ZSh0cnVlKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBFeGVjdXRlcyBhIGZpbHRlciBpbiBhIDxjb2RlPkxpc3RCaW5kaW5nPC9jb2RlPiBhbmQgcmVzdW1lcyBpdCwgaWYgc3VzcGVuZGVkLlxuXHQgKlxuXHQgKiBAcGFyYW0gbGlzdEJpbmRpbmcgTGlzdCBiaW5kaW5nXG5cdCAqIEBwYXJhbSBiaW5kaW5nSW5mbyBUaGUgYmluZGluZyBpbmZvIG9iamVjdCB0byBiZSB1c2VkIHRvIGJpbmQgdGhlIGxpc3QgdG8gdGhlIG1vZGVsXG5cdCAqL1xuXHRfdXBkYXRlQmluZGluZzogYXN5bmMgZnVuY3Rpb24gKGxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLCBiaW5kaW5nSW5mbzogQWdncmVnYXRpb25CaW5kaW5nSW5mbykge1xuXHRcdGNvbnN0IHJvb3RCaW5kaW5nID0gbGlzdEJpbmRpbmcuZ2V0Um9vdEJpbmRpbmcoKSB8fCBsaXN0QmluZGluZztcblx0XHRpZiAoIXJvb3RCaW5kaW5nLmlzU3VzcGVuZGVkKCkpIHtcblx0XHRcdHJvb3RCaW5kaW5nLnN1c3BlbmQoKTtcblx0XHR9XG5cdFx0aWYgKGJpbmRpbmdJbmZvLnBhcmFtZXRlcnMpIHtcblx0XHRcdGxpc3RCaW5kaW5nLmNoYW5nZVBhcmFtZXRlcnMoYmluZGluZ0luZm8ucGFyYW1ldGVycyk7XG5cdFx0fVxuXHRcdGxpc3RCaW5kaW5nLmZpbHRlcihiaW5kaW5nSW5mby5maWx0ZXJzLCBGaWx0ZXJUeXBlLkFwcGxpY2F0aW9uKTtcblx0XHRsaXN0QmluZGluZy5zb3J0KGJpbmRpbmdJbmZvLnNvcnRlcik7XG5cblx0XHRpZiAocm9vdEJpbmRpbmcuaXNTdXNwZW5kZWQoKSkge1xuXHRcdFx0cm9vdEJpbmRpbmcucmVzdW1lKCk7XG5cdFx0XHRyb290QmluZGluZy5yZXNldENoYW5nZXMoKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGJvb2xlYW4gdmFsdWUgaWYgYWRkaXRpb25hbHZhbHVlcyBleGlzdHMgd2hpY2ggd2lsbCBjb250YWluIGRpZmZlcmVudCBncm91cHMgbGlrZSByZWNvbW1lbmRhdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBjb250ZW50IEZpbHRlcmFibGUgTGlzdCBDb250ZW50XG5cdCAqIEBwYXJhbSBwYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEByZXR1cm5zIEJvb2xlYW4gdmFsdWVcblx0ICovXG5cdGNoZWNrSWZBZGRpdGlvbmFsVmFsdWVzRXhpc3RzOiBmdW5jdGlvbiAoY29udGVudDogTVRhYmxlLCBwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkKSB7XG5cdFx0Y29uc3QgYmluZGluZ0NvbnRleHQgPSBjb250ZW50LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Ly9nZXQgdGhlIHJlY29tbWVuZGF0aW9uIGRhdGEgZnJvbSB0aGUgaW50ZXJuYWwgbW9kZWxcblx0XHRjb25zdCBpbnB1dFZhbHVlcyA9IChjb250ZW50LmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsKS5nZXRQcm9wZXJ0eShcIi9yZWNvbW1lbmRhdGlvbnNEYXRhXCIpIHx8IHt9O1xuXHRcdC8vRmV0Y2ggdGhlIHJlbGV2YW50IHJlY29tbWVuZGF0aW9ucyBiYXNlZCBvbiB0aGUgaW5wdXR2YWx1ZXMgYW5kIGJpbmRpbmdjb250ZXh0XG5cdFx0Y29uc3QgdmFsdWVzID0gYWRkaXRpb25hbFZhbHVlSGVscGVyLmdldFJlbGV2YW50UmVjb21tZW5kYXRpb25zKGlucHV0VmFsdWVzLCBiaW5kaW5nQ29udGV4dCBhcyBDb250ZXh0LCBwYXlsb2FkLnByb3BlcnR5UGF0aCkgfHwgW107XG5cdFx0aWYgKHZhbHVlcz8ubGVuZ3RoID4gMCkge1xuXHRcdFx0Ly9pZiB0aGVyZSBhcmUgcmVsZXZhbnQgcmVjb21tZW5kYXRpb25zIHRoZW4gcmV0dXJuIHRydWVcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgYm9vbGVhbiB2YWx1ZSB3aGljaCB3aWxsIHRlbGwgd2hldGhlciB0eXBlYWhlYWQgc2hvdWxkIGJlIG9wZW5lZCBvciBub3QuXG5cdCAqXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHAgVGhlIDxjb2RlPlZhbHVlSGVscDwvY29kZT4gaW5zdGFuY2Vcblx0ICogQHBhcmFtIGNvbnRlbnQgRmlsdGVyYWJsZSBMaXN0IENvbnRlbnRcblx0ICogQHJldHVybnMgQm9vbGVhbiB2YWx1ZSB3aGV0aGVyIHRvIHNob3cgdHlwZWFoZWFkIG9yIG5vdFxuXHQgKi9cblx0c2hvd1R5cGVhaGVhZDogZnVuY3Rpb24gKGNvbnRyb2w6IFZhbHVlSGVscCwgY29udGVudDogTVRhYmxlKSB7XG5cdFx0aWYgKCFjb250ZW50LmdldENvbnRyb2woKS5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpICYmICFjb250ZW50LmdldENvbnRyb2woKS5pc0EoXCJzYXAudWkubWRjLk11bHRpVmFsdWVGaWVsZFwiKSkge1xuXHRcdFx0Y29uc3QgZmlsdGVyVmFsdWUgPSBjb250ZW50Py5nZXRGaWx0ZXJWYWx1ZSgpO1xuXHRcdFx0Y29uc3QgdmhWYWx1ZSA9IChjb250ZW50Py5nZXRDb250cm9sKCkgYXMgRmllbGQpPy5nZXRWYWx1ZSgpO1xuXHRcdFx0aWYgKHZoVmFsdWUpIHtcblx0XHRcdFx0Ly8gdmFsdWVoZWxwIGhhZCBzb21lIHZhbHVlLCBidXQgdXNlciBjbGVhcmVkIHRoZSB2YWx1ZVxuXHRcdFx0XHQvLyBpbiBzdWNoIGNhc2Ugd2UgZ2V0IGlucHV0IHZhbHVlIGFzICcnIGFuZCB3ZSB3aWxsIHJldHVybiBmYWxzZVxuXHRcdFx0XHQvL05vdGU6IEluIFNEcyB1c2VjYXNlIHdlIHdhbnRlZCB0byBvcGVuIHRoZSB0eXBlQWhlYWQgaWYgdGhlcmUgYXJlIHJlY29tbWVuZGF0aW9ucyBhbmQgdmFsdWUgaXMgYmxhbmssIHRoZXkgc2hvdWxkIHBhc3MgdXMgYSBmbGFnIHNvIHRoYXQgd2UgY2FuIGhhbmRsZSB0aGlzIGFjY29yZGluZ2x5XG5cdFx0XHRcdGlmIChmaWx0ZXJWYWx1ZSA9PT0gXCJcIikge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9pZiB2YWx1ZWhlbHAgdmFsdWUgaXMgbm90IHRoZXJlIGFuZCB0aGVyZSBpcyBmaWx0ZXIgdmFsdWUgdGhlbiB1c2VyIGlzIHR5cGluZyBhbmQgd2UgcmV0dXJuIHRydWUgZWxzZSB3ZSB3b3VsZCBvbmx5IG9wZW5cblx0XHRcdFx0Ly9pZiBpdCBpcyByZWNvbW1lbmRhdGlvbiByZWxldmFudCBmaWVsZFxuXHRcdFx0XHRpZiAoZmlsdGVyVmFsdWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaGVja0lmQWRkaXRpb25hbFZhbHVlc0V4aXN0cyhjb250ZW50LCBjb250cm9sLmdldFBheWxvYWQoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG59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
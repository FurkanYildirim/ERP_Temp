import type { ConvertedMetadata, Property } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import { convertTypes } from "sap/fe/core/converters/MetaModelConverter";
import { isPathAnnotationExpression } from "sap/fe/core/helpers/TypeGuards";
import TypeUtil from "sap/fe/core/type/TypeUtil";
import type { InOutParameter, ValueHelpPayload } from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import ValueListHelper from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import highlightDOMElements from "sap/m/inputUtils/highlightDOMElements";
import type { AggregationBindingInfo } from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import Condition from "sap/ui/mdc/condition/Condition";
import ConditionValidated from "sap/ui/mdc/enum/ConditionValidated";
import Field from "sap/ui/mdc/Field";
import type FieldBase from "sap/ui/mdc/field/FieldBase";
import type FilterBarBase from "sap/ui/mdc/filterbar/FilterBarBase";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import type ValueHelp from "sap/ui/mdc/ValueHelp";
import type Container from "sap/ui/mdc/valuehelp/base/Container";
import type Content from "sap/ui/mdc/valuehelp/base/Content";
import FilterableListContent from "sap/ui/mdc/valuehelp/base/FilterableListContent";
import type MTable from "sap/ui/mdc/valuehelp/content/MTable";
import ValueHelpDelegate from "sap/ui/mdc/ValueHelpDelegate";
import Filter from "sap/ui/model/Filter";
import FilterType from "sap/ui/model/FilterType";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import { AdditionalValueGroupKey, additionalValueHelper, AdditionalValueType } from "../internal/valuehelp/AdditionalValueHelper";

const FeCoreControlsFilterBar = "sap.fe.core.controls.FilterBar";
const MdcFilterbarFilterBarBase = "sap.ui.mdc.filterbar.FilterBarBase";

type ConditionObjectMap = Record<string, ConditionObject[]>;

export type ExternalStateType = {
	items: { name: string }[];
	filter: ConditionObjectMap;
};

export type ConditionPayloadType = Record<string, string | boolean>;

export type ConditionPayloadMap = Record<string, ConditionPayloadType[]>;

export default Object.assign({}, ValueHelpDelegate, {
	apiVersion: 2,

	/**
	 * Checks if a <code>ListBinding</code> supports $Search.
	 *
	 * @param valueHelp The <code>ValueHelp</code> instance
	 * @param content Content element
	 * @param _listBinding
	 * @returns True if $search is supported
	 */
	isSearchSupported: function (valueHelp: ValueHelp, content: FilterableListContent, _listBinding: ODataListBinding) {
		return content.getFilterFields() === "$search";
	},

	/**
	 * Adjustable filtering for list-based contents.
	 *
	 * @param valueHelp The <code>ValueHelp</code> instance
	 * @param content ValueHelp content requesting conditions configuration
	 * @param bindingInfo The binding info object to be used to bind the list to the model
	 */
	updateBindingInfo: function (valueHelp: ValueHelp, content: FilterableListContent, bindingInfo: AggregationBindingInfo) {
		ValueHelpDelegate.updateBindingInfo(valueHelp, content, bindingInfo);

		if (content.getFilterFields() === "$search") {
			const search = content.getFilterValue();
			const normalizedSearch = CommonUtils.normalizeSearchTerm(search); // adjustSearch

			if (bindingInfo.parameters) {
				(bindingInfo.parameters as Record<string, unknown>).$search = normalizedSearch || undefined;
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
	updateBinding: async function (
		valueHelp: ValueHelp,
		listBinding: ODataListBinding,
		bindingInfo: AggregationBindingInfo,
		content: MTable
	) {
		//We fetch the valuelist property from the payload to make sure we pass the right property while making a call on valuelist entity set
		const payload = valueHelp.getPayload() as ValueHelpPayload;
		const valueListProperty = this._getValueListPropertyFromPayloadQualifier(payload);
		if (content.isTypeahead()) {
			const bindingContext = content.getBindingContext();
			const additionalValues: AdditionalValueType[] = [];
			//get the recommendation data from the internal model
			const inputValues = (content.getModel("internal") as JSONModel).getProperty("/recommendationsData") || {};
			//Fetch the relevant recommendations based on the inputvalues and bindingcontext
			const values =
				additionalValueHelper.getRelevantRecommendations(inputValues, bindingContext as Context, payload.propertyPath) || [];
			//if there are relevant recommendations then create additionalvalue structure and call _updateBindingForRecommendations
			if (values?.length > 0) {
				additionalValues.push({ propertyPath: valueListProperty, values, groupKey: AdditionalValueGroupKey.recommendation });
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
	executeFilter: async function (valueHelp: ValueHelp, listBinding: ODataListBinding, _filter: Filter, requestedItems: number) {
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
	checkListBindingPending: async function (valueHelp: ValueHelp, listBinding: ODataListBinding | undefined, requestedItems: number) {
		const payload = valueHelp.getPayload() as ValueHelpPayload;
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

	getTypeUtil: function (valueHelp: ValueHelp) {
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
	retrieveContent: function (valueHelp: ValueHelp, container: Container, contentId: string) {
		const payload = valueHelp.getPayload() as ValueHelpPayload;
		return ValueListHelper.showValueList(payload, container, contentId);
	},

	_getConditionPayloadList: function (condition: ConditionObject) {
		const conditionPayloadMap = (condition.payload || {}) as ConditionPayloadMap,
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
	_getValueListPropertyFromPayloadQualifier: function (payload: ValueHelpPayload) {
		const params = payload.qualifiers[payload.valueHelpQualifier].vhParameters || [];
		const keys = payload.qualifiers[payload.valueHelpQualifier].vhKeys || [];
		const propertyKeyPath = payload.valueHelpKeyPath;
		let filteredKeys: string[] = [...keys];
		const helpPaths: string[] = [];
		if (params.length > 0) {
			//create helpPaths array which will only consist of params helppath
			params.forEach(function (param: InOutParameter) {
				helpPaths.push(param.helpPath);
			});
			//filter the keys based on helpPaths. If key is not present in helpPath then it is valuelistproperty
			filteredKeys = keys.filter((key: string) => {
				return !helpPaths.includes(key);
			});
		}

		// from filteredKeys return the key that matches the property name
		return propertyKeyPath && filteredKeys.includes(propertyKeyPath) ? propertyKeyPath : "";
	},

	_onConditionPropagationToFilterBar: async function (
		filterBarVH: FilterBarBase,
		conditions: ConditionObject[],
		outParameters: InOutParameter[],
		filterBar: FilterBarBase
	) {
		try {
			const state: ExternalStateType = await StateUtil.retrieveExternalState(filterBar);
			const filterItemsVH = filterBarVH.getFilterItems();
			for (const condition of conditions) {
				const conditionPayloadList = this._getConditionPayloadList(condition);
				for (const outParameter of outParameters) {
					const filterTarget = outParameter.source.split("/").pop() || "";
					// propagate OUT parameter only if the filter field is visible in the LR filterbar
					if (
						// LR FilterBar or LR AdaptFilter
						filterItemsVH.find((item) => item.getId().split("::").pop() === filterTarget)
					) {
						for (const conditionPayload of conditionPayloadList) {
							const newCondition = Condition.createCondition(
								"EQ",
								[conditionPayload[outParameter.helpPath]],
								null,
								null,
								ConditionValidated.Validated
							);
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

	_onConditionPropagationToBindingContext: function (conditions: ConditionObject[], outParameters: InOutParameter[], context: Context) {
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

	_onConditionPropagationUpdateProperty: function (
		metaModel: ODataMetaModel,
		outValues: ConditionPayloadType,
		outParameters: InOutParameter[],
		context: Context
	) {
		const convertedMetadata = convertTypes(metaModel);
		const rootPath = metaModel.getMetaContext(context.getPath()).getPath();
		const contextCanRequestSideEffects = context.isTransient() !== true && context.isInactive() !== true;
		for (const outParameter of outParameters) {
			/* Updated property via out-parameter if value changed */
			if (context.getProperty(outParameter.source) !== outValues[outParameter.helpPath]) {
				this._updatePropertyViaOutParameter(
					convertedMetadata,
					rootPath,
					outValues,
					outParameter,
					context,
					contextCanRequestSideEffects
				);
			}
		}
	},

	_updatePropertyViaOutParameter: function (
		convertedMetadata: ConvertedMetadata,
		rootPath: string,
		outValues: ConditionPayloadType,
		outParameter: InOutParameter,
		context: Context,
		contextCanRequestSideEffects: boolean
	) {
		/* Updated property via out-parameter if value changed */
		const propertyPath = `${rootPath}/${outParameter.source}`;
		const targetProperty = convertedMetadata.resolvePath<Property>(propertyPath).target;
		const fieldControl = targetProperty?.annotations?.Common?.FieldControl;
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
		const textPath = isPathAnnotationExpression(targetProperty?.annotations?.Common?.Text)
			? targetProperty?.annotations?.Common?.Text.path
			: undefined;
		if (textPath !== undefined && contextCanRequestSideEffects) {
			const lastIndex = textPath.lastIndexOf("/");
			const sideEffectPath = lastIndex > 0 ? textPath.substring(0, lastIndex) : textPath;
			/* The sideEffectPath can be [<propertyName>] or [<navigationPath>] */
			context.requestSideEffects([sideEffectPath]);
		}
	},

	getFilterConditions: function (valueHelp: ValueHelp, content: Content, _config: any) {
		if (this.getInitialFilterConditions) {
			return this.getInitialFilterConditions(valueHelp, content, (_config && _config.control) || (content && content.getControl()));
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
	onConditionPropagation: async function (valueHelp: ValueHelp, reason: string, _config: unknown) {
		if (reason !== "ControlChange") {
			// handle only ControlChange reason
			return;
		}
		const payload = valueHelp.getPayload() as ValueHelpPayload;
		const qualifier = payload.qualifiers[payload.valueHelpQualifier];
		const outParameters = qualifier?.vhParameters !== undefined ? ValueListHelper.getOutParameters(qualifier.vhParameters) : [],
			field = valueHelp.getControl() as FieldBase,
			fieldParent = field.getParent() as FilterBarBase | Control;

		let conditions = field.getConditions() as ConditionObject[];
		conditions = conditions.filter(function (condition) {
			const conditionPayloadMap = (condition.payload || {}) as ConditionPayloadMap;
			return conditionPayloadMap[payload.valueHelpQualifier];
		});

		if (fieldParent.isA<FilterBarBase>(MdcFilterbarFilterBarBase)) {
			// field inside a FilterBar or AdaptationFilterBar (Settings Dialog)?
			const filterBarVH = valueHelp.getParent() as FilterBarBase | Control; // Control e.g. FormContainer
			if (filterBarVH.isA(FeCoreControlsFilterBar)) {
				// only for LR FilterBar
				await this._onConditionPropagationToFilterBar(filterBarVH as FilterBarBase, conditions, outParameters, fieldParent);
			}
			// LR Settings Dialog or OP Settings Dialog shall not propagate value to the dialog filterfields or context
		} else {
			// Object Page
			const context = valueHelp.getBindingContext() as Context | undefined;
			if (context) {
				this._onConditionPropagationToBindingContext(conditions, outParameters, context);
			}
		}
	},

	_createInitialFilterCondition: function (value: unknown, initialValueFilterEmpty: boolean) {
		let condition: ConditionObject | undefined;

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

	_getInitialFilterConditionsFromBinding: async function (
		inConditions: ConditionObjectMap,
		control: Control,
		inParameters: InOutParameter[]
	) {
		const propertiesToRequest = inParameters.map((inParameter) => inParameter.source);
		const bindingContext = control.getBindingContext() as Context | undefined;

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

	_getInitialFilterConditionsFromFilterBar: async function (
		inConditions: ConditionObjectMap,
		control: Control,
		inParameters: InOutParameter[]
	) {
		const filterBar = control.getParent() as FilterBarBase;
		const state: ExternalStateType = await StateUtil.retrieveExternalState(filterBar);

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
	_getConditionsFromInParameter: function (inParameter: InOutParameter, state: ExternalStateType) {
		const sourceField = inParameter.source;
		const key = Object.keys(state.filter).find((key) => ("/" + sourceField).endsWith("/" + key)); //additional '/' to handle heading characters in the source name if there is no path
		return key && state.filter[key];
	},

	_partitionInParameters: function (inParameters: InOutParameter[]) {
		const inParameterMap: Record<string, InOutParameter[]> = {
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
		onAfterRendering: function (event: jQuery.Event & { srcControl: Control }) {
			const table = event.srcControl, // m.Table
				tableCellsDomRefs = table.$().find("tbody .sapMText"),
				mdcMTable = table.getParent() as MTable;

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
	getInitialFilterConditions: async function (valueHelp: ValueHelp, content: Content, control: Control | undefined) {
		// highlight text in ValueHelp popover
		if (content?.isA("sap.ui.mdc.valuehelp.content.MTable")) {
			const popoverTable = (content as MTable).getTable();
			popoverTable?.removeEventDelegate(this._tableAfterRenderDelegate);
			popoverTable?.addEventDelegate(this._tableAfterRenderDelegate, this);
		}

		const inConditions: ConditionObjectMap = {};

		if (!control) {
			Log.error("ValueHelpDelegate: Control undefined");
			return inConditions;
		}

		const payload = valueHelp.getPayload() as ValueHelpPayload;
		const qualifier = payload.qualifiers[payload.valueHelpQualifier];
		const inParameters = qualifier?.vhParameters !== undefined ? ValueListHelper.getInParameters(qualifier.vhParameters) : [];
		const inParameterMap = this._partitionInParameters(inParameters);
		const isObjectPage = control.getBindingContext();

		for (const inParameter of inParameterMap.constant) {
			const condition = this._createInitialFilterCondition(
				inParameter.constantValue,
				isObjectPage ? inParameter.initialValueFilterEmpty : false // no filter with "empty" on ListReport
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
	createConditionPayload: function (
		valueHelp: ValueHelp,
		content: Content,
		_values: unknown[],
		context: Context
	): ConditionPayloadMap | undefined {
		const payload = valueHelp.getPayload() as ValueHelpPayload;
		const qualifier = payload.qualifiers[payload.valueHelpQualifier],
			entry: ConditionPayloadType = {},
			conditionPayload: ConditionPayloadMap = {};
		const control = content.getControl();
		const isMultiValueField = control?.isA("sap.ui.mdc.MultiValueField");
		if (!qualifier.vhKeys || qualifier.vhKeys.length === 1 || isMultiValueField) {
			return undefined;
		}
		qualifier.vhKeys.forEach(function (vhKey) {
			const value = context.getObject(vhKey);
			if (value != null) {
				entry[vhKey] = value?.length === 0 ? "" : value;
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
	isFilterableListItemSelected: function (valueHelp: ValueHelp, content: Content, item: Control, conditions: ConditionObject[]) {
		//In value help dialogs of single value fields the row for the key shouldn´t be selected/highlight anymore BCP: 2270175246
		const payload = valueHelp.getPayload() as ValueHelpPayload;
		if (payload.isValueListWithFixedValues !== true && content.getConfig()?.maxConditions === 1) {
			return false;
		}

		const context = item.getBindingContext();

		/* Do not consider "NotValidated" conditions */
		conditions = conditions.filter((condition) => condition.validated === ConditionValidated.Validated);

		const selectedCondition = conditions.find(function (condition) {
			const conditionPayloadMap = condition.payload as ConditionPayloadMap | undefined,
				valueHelpQualifier = payload.valueHelpQualifier || "";
			if (!conditionPayloadMap && Object.keys(payload.qualifiers)[0] === valueHelpQualifier) {
				const keyPath = content.getKeyPath();
				return context?.getObject(keyPath) === condition?.values[0];
			}
			const conditionSelectedRow = conditionPayloadMap?.[valueHelpQualifier]?.[0] || {},
				selectedKeys = Object.keys(conditionSelectedRow);
			if (selectedKeys.length) {
				return selectedKeys.every(function (key) {
					return (conditionSelectedRow[key] as unknown) === context?.getObject(key);
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
	_updateBindingForRecommendations: async function (
		payload: ValueHelpPayload,
		listBinding: ODataListBinding,
		bindingInfo: AggregationBindingInfo,
		additionalValues: AdditionalValueType[]
	) {
		let updateBindingDonePromiseResolve: Function | undefined;
		//create a promise to make sure checkListBindingPending is only completed once this promise is resolved
		payload.updateBindingDonePromise = new Promise(function (resolve) {
			updateBindingDonePromiseResolve = resolve;
		});
		try {
			//fetch the contexts of additionalvalues
			const additionalValueContextData = await additionalValueHelper.requestForAdditionalValueContextData(
				additionalValues,
				listBinding,
				bindingInfo
			);
			//remove duplicate values from different groups of additionalvalues
			const uniqueAdditionalValues = additionalValueHelper.removeDuplicateAdditionalValues(additionalValueContextData, [
				...additionalValues
			]);
			//sort and filter valuehelpbinding to make sure we render others group
			additionalValueHelper.sortAndFilterOthers(listBinding, bindingInfo, uniqueAdditionalValues);
			//resume the list binding and then reset the changes
			await additionalValueHelper.resumeValueListBindingAndResetChanges(listBinding);
			if (!additionalValueHelper.doesTransientContextsAlreadyExist(listBinding, uniqueAdditionalValues)) {
				// add transient context to list binding after backend query is done
				additionalValueHelper.createAdditionalValueTransientContexts(
					additionalValueContextData,
					uniqueAdditionalValues.reverse(),
					listBinding
				);
			}
		} catch (error: unknown) {
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
	_updateBinding: async function (listBinding: ODataListBinding, bindingInfo: AggregationBindingInfo) {
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
	checkIfAdditionalValuesExists: function (content: MTable, payload: ValueHelpPayload) {
		const bindingContext = content.getBindingContext();
		//get the recommendation data from the internal model
		const inputValues = (content.getModel("internal") as JSONModel).getProperty("/recommendationsData") || {};
		//Fetch the relevant recommendations based on the inputvalues and bindingcontext
		const values = additionalValueHelper.getRelevantRecommendations(inputValues, bindingContext as Context, payload.propertyPath) || [];
		if (values?.length > 0) {
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
	showTypeahead: function (control: ValueHelp, content: MTable) {
		if (!content.getControl().isA("sap.ui.mdc.FilterField") && !content.getControl().isA("sap.ui.mdc.MultiValueField")) {
			const filterValue = content?.getFilterValue();
			const vhValue = (content?.getControl() as Field)?.getValue();
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

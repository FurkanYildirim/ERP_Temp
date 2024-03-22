/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/MetaModelFunction", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/TemplateModel", "sap/fe/core/templating/FilterHelper", "sap/fe/macros/CommonHelper"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, DataVisualization, FilterBar, MetaModelConverter, MetaModelFunction, ModelHelper, StableIdHelper, TemplateModel, FilterHelper, CommonHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30;
  var _exports = {};
  var getFilterConditions = FilterHelper.getFilterConditions;
  var generate = StableIdHelper.generate;
  var getSearchRestrictions = MetaModelFunction.getSearchRestrictions;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getSelectionFields = FilterBar.getSelectionFields;
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockEvent = BuildingBlockSupport.blockEvent;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  var blockAggregation = BuildingBlockSupport.blockAggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  const setCustomFilterFieldProperties = function (childFilterField, aggregationObject) {
    aggregationObject.slotName = aggregationObject.key;
    aggregationObject.key = aggregationObject.key.replace("InlineXML_", "");
    aggregationObject.label = childFilterField.getAttribute("label");
    aggregationObject.required = childFilterField.getAttribute("required") === "true";
    return aggregationObject;
  };

  /**
   * Building block for creating a FilterBar based on the metadata provided by OData V4.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:FilterBar
   *   id="SomeID"
   *   showAdaptFiltersButton="true"
   *   p13nMode=["Item","Value"]
   *   listBindingNames = "sap.fe.tableBinding"
   *   liveMode="true"
   *   search=".handlers.onSearch"
   *   filterChanged=".handlers.onFiltersChanged"
   * /&gt;
   * </pre>
   *
   * Building block for creating a FilterBar based on the metadata provided by OData V4.
   *
   * @since 1.94.0
   */
  let FilterBarBlock = (_dec = defineBuildingBlock({
    name: "FilterBar",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    returnTypes: ["sap.fe.macros.filterBar.FilterBarAPI"]
  }), _dec2 = blockAttribute({
    type: "string",
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec5 = blockAttribute({
    type: "string"
  }), _dec6 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec7 = blockAttribute({
    type: "sap.ui.model.Context",
    isPublic: true
  }), _dec8 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec9 = blockAttribute({
    type: "string"
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "boolean"
  }), _dec12 = blockAttribute({
    type: "boolean"
  }), _dec13 = blockAttribute({
    type: "sap.ui.mdc.FilterBarP13nMode[]"
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "boolean"
  }), _dec16 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec17 = blockAttribute({
    type: "string",
    required: false
  }), _dec18 = blockAttribute({
    type: "boolean"
  }), _dec19 = blockAttribute({
    type: "boolean"
  }), _dec20 = blockAttribute({
    type: "boolean"
  }), _dec21 = blockAttribute({
    type: "string"
  }), _dec22 = blockAttribute({
    type: "string"
  }), _dec23 = blockAttribute({
    type: "boolean",
    isPublic: true
  }), _dec24 = blockAttribute({
    type: "boolean"
  }), _dec25 = blockEvent(), _dec26 = blockEvent(), _dec27 = blockEvent(), _dec28 = blockEvent(), _dec29 = blockEvent(), _dec30 = blockEvent(), _dec31 = blockAggregation({
    type: "sap.fe.macros.FilterField",
    isPublic: true,
    hasVirtualNode: true,
    processAggregations: setCustomFilterFieldProperties
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FilterBarBlock, _BuildingBlockBase);
    /**
     * ID of the FilterBar
     */

    /**
     * selectionFields to be displayed
     */

    /**
     * Displays possible errors during the search in a message box
     */

    /**
     * ID of the assigned variant management
     */

    /**
     * Don't show the basic search field
     */

    /**
     * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
     */

    /**
     * Handles visibility of the 'Adapt Filters' button on the FilterBar
     */

    /**
     * Specifies the personalization options for the filter bar.
     */

    /**
     * Specifies the Sematic Date Range option for the filter bar.
     */

    /**
     * If set the search will be automatically triggered, when a filter value was changed.
     */

    /**
     * Filter conditions to be applied to the filter bar
     */

    /**
     * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
     * a search is triggered immediately if one or more search requests have been triggered in the meantime
     * but were ignored based on the setting.
     */

    /**
     * Id of control that will allow for switching between normal and visual filter
     */

    /**
     * Handles the visibility of the 'Clear' button on the FilterBar.
     */

    /**
     * Event handler to react to the search event of the FilterBar
     */

    /**
     * Event handler to react to the filterChange event of the FilterBar
     */

    /**
     * Event handler to react to the stateChange event of the FilterBar.
     */

    /**
     * Event handler to react to the filterChanged event of the FilterBar. Exposes parameters from the MDC filter bar
     */

    /**
     * Event handler to react to the search event of the FilterBar. Exposes parameteres from the MDC filter bar
     */

    /**
     * Event handler to react to the afterClear event of the FilterBar
     */

    function FilterBarBlock(props, configuration, mSettings) {
      var _this$contextPath, _targetEntitySet$anno, _targetEntitySet$anno2, _targetEntitySet$anno3, _targetEntitySet$anno4;
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionFields", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBarDelegate", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showMessages", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantBackreference", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hideBasicSearch", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFallback", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showAdaptFiltersButton", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "p13nMode", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "propertyInfo", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useSemanticDateRange", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "liveMode", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterConditions", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "suspendSelection", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showDraftEditState", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isDraftCollaborative", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "toggleControlId", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "initialLayout", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showClearButton", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_applyIdToContent", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterChanged", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor26, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalFilterChanged", _descriptor27, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalSearch", _descriptor28, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "afterClear", _descriptor29, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterFields", _descriptor30, _assertThisInitialized(_this));
      _this.checkIfCollaborationDraftSupported = oMetaModel => {
        if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
          _this.isDraftCollaborative = true;
        }
      };
      _this.getEntityTypePath = metaPathParts => {
        return metaPathParts[0].endsWith("/") ? metaPathParts[0] : metaPathParts[0] + "/";
      };
      _this.getSearch = () => {
        if (!_this.hideBasicSearch) {
          return xml`<control:basicSearchField>
			<mdc:FilterField
				id="${generate([_this.id, "BasicSearchField"])}"
				placeholder="{sap.fe.i18n>M_FILTERBAR_SEARCH}"
				conditions="{$filters>/conditions/$search}"
				dataType="sap.ui.model.odata.type.String"
				maxConditions="1"
			/>
		</control:basicSearchField>`;
        }
        return "";
      };
      _this.processSelectionFields = () => {
        var _this$_filterFields, _this$selectionFields, _this$_filterFields2, _this$_valueHelps;
        let draftEditState = "";
        if (_this.showDraftEditState) {
          draftEditState = `<core:Fragment fragmentName="sap.fe.macros.filter.DraftEditState" type="XML" />`;
        }
        _this._valueHelps = [];
        _this._filterFields = [];
        (_this$_filterFields = _this._filterFields) === null || _this$_filterFields === void 0 ? void 0 : _this$_filterFields.push(draftEditState);
        if (!Array.isArray(_this.selectionFields)) {
          _this.selectionFields = _this.selectionFields.getObject();
        }
        (_this$selectionFields = _this.selectionFields) === null || _this$selectionFields === void 0 ? void 0 : _this$selectionFields.forEach((selectionField, selectionFieldIdx) => {
          if (selectionField.availability === "Default") {
            _this.setFilterFieldsAndValueHelps(selectionField, selectionFieldIdx);
          }
        });
        _this._filterFields = ((_this$_filterFields2 = _this._filterFields) === null || _this$_filterFields2 === void 0 ? void 0 : _this$_filterFields2.length) > 0 ? _this._filterFields : "";
        _this._valueHelps = ((_this$_valueHelps = _this._valueHelps) === null || _this$_valueHelps === void 0 ? void 0 : _this$_valueHelps.length) > 0 ? _this._valueHelps : "";
      };
      _this.setFilterFieldsAndValueHelps = (selectionField, selectionFieldIdx) => {
        if (selectionField.template === undefined && selectionField.type !== "Slot") {
          _this.pushFilterFieldsAndValueHelps(selectionField);
        } else if (Array.isArray(_this._filterFields)) {
          var _this$_filterFields3;
          (_this$_filterFields3 = _this._filterFields) === null || _this$_filterFields3 === void 0 ? void 0 : _this$_filterFields3.push(xml`<template:with path="selectionFields>${selectionFieldIdx}" var="item">
					<core:Fragment fragmentName="sap.fe.macros.filter.CustomFilter" type="XML" />
				</template:with>`);
        }
      };
      _this.pushFilterFieldsAndValueHelps = selectionField => {
        if (Array.isArray(_this._filterFields)) {
          var _this$_filterFields4;
          (_this$_filterFields4 = _this._filterFields) === null || _this$_filterFields4 === void 0 ? void 0 : _this$_filterFields4.push(xml`<internalMacro:FilterField
			idPrefix="${generate([_this.id, "FilterField", CommonHelper.getNavigationPath(selectionField.annotationPath)])}"
			vhIdPrefix="${generate([_this.id, "FilterFieldValueHelp"])}"
			property="${selectionField.annotationPath}"
			contextPath="${_this._getContextPathForFilterField(selectionField, _this._internalContextPath)}"
			useSemanticDateRange="${_this.useSemanticDateRange}"
			settings="${CommonHelper.stringifyCustomData(selectionField.settings)}"
			visualFilter="${selectionField.visualFilter}"
			/>`);
        }
        if (Array.isArray(_this._valueHelps)) {
          var _this$_valueHelps2;
          (_this$_valueHelps2 = _this._valueHelps) === null || _this$_valueHelps2 === void 0 ? void 0 : _this$_valueHelps2.push(xml`<macro:ValueHelp
			idPrefix="${generate([_this.id, "FilterFieldValueHelp"])}"
			conditionModel="$filters"
			property="${selectionField.annotationPath}"
			contextPath="${_this._getContextPathForFilterField(selectionField, _this._internalContextPath)}"
			filterFieldValueHelp="true"
			useSemanticDateRange="${_this.useSemanticDateRange}"
		/>`);
        }
      };
      if (!_this.metaPath) {
        Log.error("Context Path not available for FilterBar Macro.");
        return _assertThisInitialized(_this);
      }
      const sMetaPath = _this.metaPath.getPath();
      let entityTypePath = "";
      const _metaPathParts = (sMetaPath === null || sMetaPath === void 0 ? void 0 : sMetaPath.split("/@com.sap.vocabularies.UI.v1.SelectionFields")) || []; // [0]: entityTypePath, [1]: SF Qualifier.
      if (_metaPathParts.length > 0) {
        entityTypePath = _this.getEntityTypePath(_metaPathParts);
      }
      const sEntitySetPath = ModelHelper.getEntitySetPath(entityTypePath);
      const _oMetaModel = (_this$contextPath = _this.contextPath) === null || _this$contextPath === void 0 ? void 0 : _this$contextPath.getModel();
      _this._internalContextPath = _oMetaModel === null || _oMetaModel === void 0 ? void 0 : _oMetaModel.createBindingContext(entityTypePath);
      const sObjectPath = "@com.sap.vocabularies.UI.v1.SelectionFields";
      const annotationPath = "@com.sap.vocabularies.UI.v1.SelectionFields" + (_metaPathParts.length && _metaPathParts[1] || "");
      const oExtraParams = {};
      oExtraParams[sObjectPath] = {
        filterFields: _this.filterFields
      };
      const oVisualizationObjectPath = getInvolvedDataModelObjects(_this._internalContextPath);
      const oConverterContext = _this.getConverterContext(oVisualizationObjectPath, undefined, mSettings, oExtraParams);
      if (!_this.propertyInfo) {
        _this.propertyInfo = getSelectionFields(oConverterContext, [], annotationPath).sPropertyInfo;
      }

      //Filter Fields and values to the field are filled based on the selectionFields and this would be empty in case of macro outside the FE template
      if (!_this.selectionFields) {
        const oSelectionFields = getSelectionFields(oConverterContext, [], annotationPath).selectionFields;
        _this.selectionFields = new TemplateModel(oSelectionFields, _oMetaModel).createBindingContext("/");
        const oEntityType = oConverterContext.getEntityType(),
          oSelectionVariant = getSelectionVariant(oEntityType, oConverterContext),
          oEntitySetContext = _oMetaModel.getContext(sEntitySetPath),
          oFilterConditions = getFilterConditions(oEntitySetContext, {
            selectionVariant: oSelectionVariant
          });
        _this.filterConditions = oFilterConditions;
      }
      _this._processPropertyInfos(_this.propertyInfo);
      const targetEntitySet = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath).targetEntitySet;
      if (targetEntitySet !== null && targetEntitySet !== void 0 && (_targetEntitySet$anno = targetEntitySet.annotations) !== null && _targetEntitySet$anno !== void 0 && (_targetEntitySet$anno2 = _targetEntitySet$anno.Common) !== null && _targetEntitySet$anno2 !== void 0 && _targetEntitySet$anno2.DraftRoot || targetEntitySet !== null && targetEntitySet !== void 0 && (_targetEntitySet$anno3 = targetEntitySet.annotations) !== null && _targetEntitySet$anno3 !== void 0 && (_targetEntitySet$anno4 = _targetEntitySet$anno3.Common) !== null && _targetEntitySet$anno4 !== void 0 && _targetEntitySet$anno4.DraftNode) {
        _this.showDraftEditState = true;
        _this.checkIfCollaborationDraftSupported(_oMetaModel);
      }
      if (_this._applyIdToContent) {
        _this._apiId = _this.id + "::FilterBar";
        _this._contentId = _this.id;
      } else {
        _this._apiId = _this.id;
        _this._contentId = _this.getContentId(_this.id + "");
      }
      if (_this.hideBasicSearch !== true) {
        const oSearchRestrictionAnnotation = getSearchRestrictions(sEntitySetPath, _oMetaModel);
        _this.hideBasicSearch = Boolean(oSearchRestrictionAnnotation && !oSearchRestrictionAnnotation.Searchable);
      }
      _this.processSelectionFields();
      return _this;
    }
    _exports = FilterBarBlock;
    var _proto = FilterBarBlock.prototype;
    _proto._processPropertyInfos = function _processPropertyInfos(propertyInfo) {
      const aParameterFields = [];
      if (propertyInfo) {
        const sFetchedProperties = propertyInfo.replace(/\\{/g, "{").replace(/\\}/g, "}");
        const aFetchedProperties = JSON.parse(sFetchedProperties);
        const editStateLabel = this.getTranslatedText("FILTERBAR_EDITING_STATUS");
        aFetchedProperties.forEach(function (propInfo) {
          if (propInfo.isParameter) {
            aParameterFields.push(propInfo.name);
          }
          if (propInfo.path === "$editState") {
            propInfo.label = editStateLabel;
          }
        });
        this.propertyInfo = JSON.stringify(aFetchedProperties).replace(/\{/g, "\\{").replace(/\}/g, "\\}");
      }
      this._parameters = JSON.stringify(aParameterFields);
    };
    _proto._getContextPathForFilterField = function _getContextPathForFilterField(selectionField, filterBarContextPath) {
      let contextPath = filterBarContextPath;
      if (selectionField.isParameter) {
        // Example:
        // FilterBarContextPath: /Customer/Set
        // ParameterPropertyPath: /Customer/P_CC
        // ContextPathForFilterField: /Customer
        const annoPath = selectionField.annotationPath;
        contextPath = annoPath.substring(0, annoPath.lastIndexOf("/") + 1);
      }
      return contextPath;
    };
    _proto.getTemplate = function getTemplate() {
      var _this$_internalContex;
      const internalContextPath = (_this$_internalContex = this._internalContextPath) === null || _this$_internalContex === void 0 ? void 0 : _this$_internalContex.getPath();
      let filterDelegate = "";
      if (this.filterBarDelegate) {
        filterDelegate = this.filterBarDelegate;
      } else {
        filterDelegate = "{name:'sap/fe/macros/filterBar/FilterBarDelegate', payload: {entityTypePath: '" + internalContextPath + "'}}";
      }
      return xml`<macroFilterBar:FilterBarAPI
        xmlns:template="http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1"
        xmlns:core="sap.ui.core"
        xmlns:mdc="sap.ui.mdc"
        xmlns:control="sap.fe.core.controls"
        xmlns:macroFilterBar="sap.fe.macros.filterBar"
        xmlns:macro="sap.fe.macros"
        xmlns:internalMacro="sap.fe.macros.internal"
        xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		id="${this._apiId}"
		search="${this.search}"
		filterChanged="${this.filterChanged}"
		afterClear="${this.afterClear}"
		internalSearch="${this.internalSearch}"
		internalFilterChanged="${this.internalFilterChanged}"
		stateChange="${this.stateChange}"
	>
		<control:FilterBar
			core:require="{API: 'sap/fe/macros/filterBar/FilterBarAPI'}"
			id="${this._contentId}"
			liveMode="${this.liveMode}"
			delegate="${filterDelegate}"
			variantBackreference="${this.variantBackreference}"
			showAdaptFiltersButton="${this.showAdaptFiltersButton}"
			showClearButton="${this.showClearButton}"
			p13nMode="${this.p13nMode}"
			search="API.handleSearch($event)"
			filtersChanged="API.handleFilterChanged($event)"
			filterConditions="${this.filterConditions}"
			suspendSelection="${this.suspendSelection}"
			showMessages="${this.showMessages}"
			toggleControl="${this.toggleControlId}"
			initialLayout="${this.initialLayout}"
			propertyInfo="${this.propertyInfo}"
			customData:localId="${this.id}"
			visible="${this.visible}"
			customData:hideBasicSearch="${this.hideBasicSearch}"
			customData:showDraftEditState="${this.showDraftEditState}"
			customData:useSemanticDateRange="${this.useSemanticDateRange}"
			customData:entityType="${internalContextPath}"
			customData:parameters="${this._parameters}"
		>
			<control:dependents>
				${this._valueHelps}
			</control:dependents>
			${this.getSearch()}
			<control:filterItems>
				${this._filterFields}
			</control:filterItems>
		</control:FilterBar>
	</macroFilterBar:FilterBarAPI>`;
    };
    return FilterBarBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "selectionFields", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "filterBarDelegate", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "showMessages", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "variantBackreference", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "hideBasicSearch", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "enableFallback", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "showAdaptFiltersButton", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "p13nMode", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "Item,Value";
    }
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "propertyInfo", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "useSemanticDateRange", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "liveMode", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "filterConditions", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "suspendSelection", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "showDraftEditState", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "isDraftCollaborative", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "toggleControlId", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "initialLayout", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "compact";
    }
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "showClearButton", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "_applyIdToContent", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "internalFilterChanged", [_dec28], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "internalSearch", [_dec29], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "afterClear", [_dec30], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor30 = _applyDecoratedDescriptor(_class2.prototype, "filterFields", [_dec31], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FilterBarBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJzZXRDdXN0b21GaWx0ZXJGaWVsZFByb3BlcnRpZXMiLCJjaGlsZEZpbHRlckZpZWxkIiwiYWdncmVnYXRpb25PYmplY3QiLCJzbG90TmFtZSIsImtleSIsInJlcGxhY2UiLCJsYWJlbCIsImdldEF0dHJpYnV0ZSIsInJlcXVpcmVkIiwiRmlsdGVyQmFyQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsInJldHVyblR5cGVzIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwiaXNQdWJsaWMiLCJibG9ja0V2ZW50IiwiYmxvY2tBZ2dyZWdhdGlvbiIsImhhc1ZpcnR1YWxOb2RlIiwicHJvY2Vzc0FnZ3JlZ2F0aW9ucyIsInByb3BzIiwiY29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsImNoZWNrSWZDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJvTWV0YU1vZGVsIiwiTW9kZWxIZWxwZXIiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsImlzRHJhZnRDb2xsYWJvcmF0aXZlIiwiZ2V0RW50aXR5VHlwZVBhdGgiLCJtZXRhUGF0aFBhcnRzIiwiZW5kc1dpdGgiLCJnZXRTZWFyY2giLCJoaWRlQmFzaWNTZWFyY2giLCJ4bWwiLCJnZW5lcmF0ZSIsImlkIiwicHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyIsImRyYWZ0RWRpdFN0YXRlIiwic2hvd0RyYWZ0RWRpdFN0YXRlIiwiX3ZhbHVlSGVscHMiLCJfZmlsdGVyRmllbGRzIiwicHVzaCIsIkFycmF5IiwiaXNBcnJheSIsInNlbGVjdGlvbkZpZWxkcyIsImdldE9iamVjdCIsImZvckVhY2giLCJzZWxlY3Rpb25GaWVsZCIsInNlbGVjdGlvbkZpZWxkSWR4IiwiYXZhaWxhYmlsaXR5Iiwic2V0RmlsdGVyRmllbGRzQW5kVmFsdWVIZWxwcyIsImxlbmd0aCIsInRlbXBsYXRlIiwidW5kZWZpbmVkIiwicHVzaEZpbHRlckZpZWxkc0FuZFZhbHVlSGVscHMiLCJDb21tb25IZWxwZXIiLCJnZXROYXZpZ2F0aW9uUGF0aCIsImFubm90YXRpb25QYXRoIiwiX2dldENvbnRleHRQYXRoRm9yRmlsdGVyRmllbGQiLCJfaW50ZXJuYWxDb250ZXh0UGF0aCIsInVzZVNlbWFudGljRGF0ZVJhbmdlIiwic3RyaW5naWZ5Q3VzdG9tRGF0YSIsInNldHRpbmdzIiwidmlzdWFsRmlsdGVyIiwibWV0YVBhdGgiLCJMb2ciLCJlcnJvciIsInNNZXRhUGF0aCIsImdldFBhdGgiLCJlbnRpdHlUeXBlUGF0aCIsInNwbGl0Iiwic0VudGl0eVNldFBhdGgiLCJnZXRFbnRpdHlTZXRQYXRoIiwiY29udGV4dFBhdGgiLCJnZXRNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0Iiwic09iamVjdFBhdGgiLCJvRXh0cmFQYXJhbXMiLCJmaWx0ZXJGaWVsZHMiLCJvVmlzdWFsaXphdGlvbk9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJvQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJwcm9wZXJ0eUluZm8iLCJnZXRTZWxlY3Rpb25GaWVsZHMiLCJzUHJvcGVydHlJbmZvIiwib1NlbGVjdGlvbkZpZWxkcyIsIlRlbXBsYXRlTW9kZWwiLCJvRW50aXR5VHlwZSIsImdldEVudGl0eVR5cGUiLCJvU2VsZWN0aW9uVmFyaWFudCIsImdldFNlbGVjdGlvblZhcmlhbnQiLCJvRW50aXR5U2V0Q29udGV4dCIsImdldENvbnRleHQiLCJvRmlsdGVyQ29uZGl0aW9ucyIsImdldEZpbHRlckNvbmRpdGlvbnMiLCJzZWxlY3Rpb25WYXJpYW50IiwiZmlsdGVyQ29uZGl0aW9ucyIsIl9wcm9jZXNzUHJvcGVydHlJbmZvcyIsInRhcmdldEVudGl0eVNldCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiRHJhZnRSb290IiwiRHJhZnROb2RlIiwiX2FwcGx5SWRUb0NvbnRlbnQiLCJfYXBpSWQiLCJfY29udGVudElkIiwiZ2V0Q29udGVudElkIiwib1NlYXJjaFJlc3RyaWN0aW9uQW5ub3RhdGlvbiIsImdldFNlYXJjaFJlc3RyaWN0aW9ucyIsIkJvb2xlYW4iLCJTZWFyY2hhYmxlIiwiYVBhcmFtZXRlckZpZWxkcyIsInNGZXRjaGVkUHJvcGVydGllcyIsImFGZXRjaGVkUHJvcGVydGllcyIsIkpTT04iLCJwYXJzZSIsImVkaXRTdGF0ZUxhYmVsIiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJwcm9wSW5mbyIsImlzUGFyYW1ldGVyIiwicGF0aCIsInN0cmluZ2lmeSIsIl9wYXJhbWV0ZXJzIiwiZmlsdGVyQmFyQ29udGV4dFBhdGgiLCJhbm5vUGF0aCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0VGVtcGxhdGUiLCJpbnRlcm5hbENvbnRleHRQYXRoIiwiZmlsdGVyRGVsZWdhdGUiLCJmaWx0ZXJCYXJEZWxlZ2F0ZSIsInNlYXJjaCIsImZpbHRlckNoYW5nZWQiLCJhZnRlckNsZWFyIiwiaW50ZXJuYWxTZWFyY2giLCJpbnRlcm5hbEZpbHRlckNoYW5nZWQiLCJzdGF0ZUNoYW5nZSIsImxpdmVNb2RlIiwidmFyaWFudEJhY2tyZWZlcmVuY2UiLCJzaG93QWRhcHRGaWx0ZXJzQnV0dG9uIiwic2hvd0NsZWFyQnV0dG9uIiwicDEzbk1vZGUiLCJzdXNwZW5kU2VsZWN0aW9uIiwic2hvd01lc3NhZ2VzIiwidG9nZ2xlQ29udHJvbElkIiwiaW5pdGlhbExheW91dCIsInZpc2libGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQmFyLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5U2V0IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgeyBTZWxlY3Rpb25GaWVsZHMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQWdncmVnYXRpb24sIGJsb2NrQXR0cmlidXRlLCBibG9ja0V2ZW50LCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyBnZXRTZWxlY3Rpb25WYXJpYW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQgeyBnZXRTZWxlY3Rpb25GaWVsZHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L0ZpbHRlckJhclwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZ2V0U2VhcmNoUmVzdHJpY3Rpb25zIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTWV0YU1vZGVsRnVuY3Rpb25cIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IFRlbXBsYXRlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlTW9kZWxcIjtcbmltcG9ydCB7IEZpbHRlckNvbmRpdGlvbnMsIGdldEZpbHRlckNvbmRpdGlvbnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9GaWx0ZXJIZWxwZXJcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgeyBQcm9wZXJ0eUluZm8gfSBmcm9tIFwiLi4vRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgeyBGaWx0ZXJGaWVsZCB9IGZyb20gXCIuL0ZpbHRlckJhckFQSVwiO1xuXG5jb25zdCBzZXRDdXN0b21GaWx0ZXJGaWVsZFByb3BlcnRpZXMgPSBmdW5jdGlvbiAoY2hpbGRGaWx0ZXJGaWVsZDogRWxlbWVudCwgYWdncmVnYXRpb25PYmplY3Q6IGFueSk6IEZpbHRlckZpZWxkIHtcblx0YWdncmVnYXRpb25PYmplY3Quc2xvdE5hbWUgPSBhZ2dyZWdhdGlvbk9iamVjdC5rZXk7XG5cdGFnZ3JlZ2F0aW9uT2JqZWN0LmtleSA9IGFnZ3JlZ2F0aW9uT2JqZWN0LmtleS5yZXBsYWNlKFwiSW5saW5lWE1MX1wiLCBcIlwiKTtcblx0YWdncmVnYXRpb25PYmplY3QubGFiZWwgPSBjaGlsZEZpbHRlckZpZWxkLmdldEF0dHJpYnV0ZShcImxhYmVsXCIpO1xuXHRhZ2dyZWdhdGlvbk9iamVjdC5yZXF1aXJlZCA9IGNoaWxkRmlsdGVyRmllbGQuZ2V0QXR0cmlidXRlKFwicmVxdWlyZWRcIikgPT09IFwidHJ1ZVwiO1xuXHRyZXR1cm4gYWdncmVnYXRpb25PYmplY3Q7XG59O1xuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIEZpbHRlckJhciBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOkZpbHRlckJhclxuICogICBpZD1cIlNvbWVJRFwiXG4gKiAgIHNob3dBZGFwdEZpbHRlcnNCdXR0b249XCJ0cnVlXCJcbiAqICAgcDEzbk1vZGU9W1wiSXRlbVwiLFwiVmFsdWVcIl1cbiAqICAgbGlzdEJpbmRpbmdOYW1lcyA9IFwic2FwLmZlLnRhYmxlQmluZGluZ1wiXG4gKiAgIGxpdmVNb2RlPVwidHJ1ZVwiXG4gKiAgIHNlYXJjaD1cIi5oYW5kbGVycy5vblNlYXJjaFwiXG4gKiAgIGZpbHRlckNoYW5nZWQ9XCIuaGFuZGxlcnMub25GaWx0ZXJzQ2hhbmdlZFwiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmlsdGVyQmFyIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqXG4gKiBAc2luY2UgMS45NC4wXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJGaWx0ZXJCYXJcIixcblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0cHVibGljTmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0cmV0dXJuVHlwZXM6IFtcInNhcC5mZS5tYWNyb3MuZmlsdGVyQmFyLkZpbHRlckJhckFQSVwiXVxufSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZpbHRlckJhckJsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHQvKipcblx0ICogSUQgb2YgdGhlIEZpbHRlckJhclxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGlkPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0aXNQdWJsaWM6IHRydWVcblx0fSlcblx0dmlzaWJsZT86IHN0cmluZztcblxuXHQvKipcblx0ICogc2VsZWN0aW9uRmllbGRzIHRvIGJlIGRpc3BsYXllZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0fSlcblx0c2VsZWN0aW9uRmllbGRzPzogU2VsZWN0aW9uRmllbGRzIHwgQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGZpbHRlckJhckRlbGVnYXRlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdG1ldGFQYXRoPzogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRjb250ZXh0UGF0aD86IENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIERpc3BsYXlzIHBvc3NpYmxlIGVycm9ycyBkdXJpbmcgdGhlIHNlYXJjaCBpbiBhIG1lc3NhZ2UgYm94XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdHNob3dNZXNzYWdlczogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgYXNzaWduZWQgdmFyaWFudCBtYW5hZ2VtZW50XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dmFyaWFudEJhY2tyZWZlcmVuY2U/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERvbid0IHNob3cgdGhlIGJhc2ljIHNlYXJjaCBmaWVsZFxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRoaWRlQmFzaWNTZWFyY2g/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBFbmFibGVzIHRoZSBmYWxsYmFjayB0byBzaG93IGFsbCBmaWVsZHMgb2YgdGhlIEVudGl0eVR5cGUgYXMgZmlsdGVyIGZpZWxkcyBpZiBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHMgYXJlIG5vdCBwcmVzZW50XG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdGVuYWJsZUZhbGxiYWNrOiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdmlzaWJpbGl0eSBvZiB0aGUgJ0FkYXB0IEZpbHRlcnMnIGJ1dHRvbiBvbiB0aGUgRmlsdGVyQmFyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHNob3dBZGFwdEZpbHRlcnNCdXR0b246IGJvb2xlYW4gPSB0cnVlO1xuXG5cdC8qKlxuXHQgKiBTcGVjaWZpZXMgdGhlIHBlcnNvbmFsaXphdGlvbiBvcHRpb25zIGZvciB0aGUgZmlsdGVyIGJhci5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubWRjLkZpbHRlckJhclAxM25Nb2RlW11cIlxuXHR9KVxuXHRwMTNuTW9kZTogc3RyaW5nID0gXCJJdGVtLFZhbHVlXCI7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHByb3BlcnR5SW5mbz86IHN0cmluZztcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBTZW1hdGljIERhdGUgUmFuZ2Ugb3B0aW9uIGZvciB0aGUgZmlsdGVyIGJhci5cblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0dXNlU2VtYW50aWNEYXRlUmFuZ2U6IGJvb2xlYW4gPSB0cnVlO1xuXG5cdC8qKlxuXHQgKiBJZiBzZXQgdGhlIHNlYXJjaCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgdHJpZ2dlcmVkLCB3aGVuIGEgZmlsdGVyIHZhbHVlIHdhcyBjaGFuZ2VkLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRsaXZlTW9kZTogYm9vbGVhbiA9IGZhbHNlO1xuXG5cdC8qKlxuXHQgKiBGaWx0ZXIgY29uZGl0aW9ucyB0byBiZSBhcHBsaWVkIHRvIHRoZSBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0cmVxdWlyZWQ6IGZhbHNlXG5cdH0pXG5cdGZpbHRlckNvbmRpdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJDb25kaXRpb25zW10+O1xuXG5cdC8qKlxuXHQgKiBJZiBzZXQgdG8gPGNvZGU+dHJ1ZTwvY29kZT4sIGFsbCBzZWFyY2ggcmVxdWVzdHMgYXJlIGlnbm9yZWQuIE9uY2UgaXQgaGFzIGJlZW4gc2V0IHRvIDxjb2RlPmZhbHNlPC9jb2RlPixcblx0ICogYSBzZWFyY2ggaXMgdHJpZ2dlcmVkIGltbWVkaWF0ZWx5IGlmIG9uZSBvciBtb3JlIHNlYXJjaCByZXF1ZXN0cyBoYXZlIGJlZW4gdHJpZ2dlcmVkIGluIHRoZSBtZWFudGltZVxuXHQgKiBidXQgd2VyZSBpZ25vcmVkIGJhc2VkIG9uIHRoZSBzZXR0aW5nLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRzdXNwZW5kU2VsZWN0aW9uOiBib29sZWFuID0gZmFsc2U7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRzaG93RHJhZnRFZGl0U3RhdGU6IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdGlzRHJhZnRDb2xsYWJvcmF0aXZlOiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIElkIG9mIGNvbnRyb2wgdGhhdCB3aWxsIGFsbG93IGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBub3JtYWwgYW5kIHZpc3VhbCBmaWx0ZXJcblx0ICovXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHR0b2dnbGVDb250cm9sSWQ/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdGluaXRpYWxMYXlvdXQ6IHN0cmluZyA9IFwiY29tcGFjdFwiO1xuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSAnQ2xlYXInIGJ1dHRvbiBvbiB0aGUgRmlsdGVyQmFyLlxuXHQgKi9cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRpc1B1YmxpYzogdHJ1ZVxuXHR9KVxuXHRzaG93Q2xlYXJCdXR0b246IGJvb2xlYW4gPSBmYWxzZTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdF9hcHBseUlkVG9Db250ZW50OiBib29sZWFuID0gZmFsc2U7XG5cblx0LyoqXG5cdCAqIFRlbXBvcmFyeSB3b3JrYXJvdW5kIG9ubHlcblx0ICogcGF0aCB0byBjb250ZXh0UGF0aCB0byBiZSB1c2VkIGJ5IGNoaWxkIGZpbHRlcmZpZWxkc1xuXHQgKi9cblx0X2ludGVybmFsQ29udGV4dFBhdGghOiBDb250ZXh0O1xuXG5cdF9wYXJhbWV0ZXJzOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIHNlYXJjaCBldmVudCBvZiB0aGUgRmlsdGVyQmFyXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdHNlYXJjaD86IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgZmlsdGVyQ2hhbmdlIGV2ZW50IG9mIHRoZSBGaWx0ZXJCYXJcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0ZmlsdGVyQ2hhbmdlZD86IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgc3RhdGVDaGFuZ2UgZXZlbnQgb2YgdGhlIEZpbHRlckJhci5cblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0c3RhdGVDaGFuZ2U/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIGZpbHRlckNoYW5nZWQgZXZlbnQgb2YgdGhlIEZpbHRlckJhci4gRXhwb3NlcyBwYXJhbWV0ZXJzIGZyb20gdGhlIE1EQyBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRAYmxvY2tFdmVudCgpXG5cdGludGVybmFsRmlsdGVyQ2hhbmdlZD86IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB0byB0aGUgc2VhcmNoIGV2ZW50IG9mIHRoZSBGaWx0ZXJCYXIuIEV4cG9zZXMgcGFyYW1ldGVyZXMgZnJvbSB0aGUgTURDIGZpbHRlciBiYXJcblx0ICovXG5cdEBibG9ja0V2ZW50KClcblx0aW50ZXJuYWxTZWFyY2g/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIGFmdGVyQ2xlYXIgZXZlbnQgb2YgdGhlIEZpbHRlckJhclxuXHQgKi9cblx0QGJsb2NrRXZlbnQoKVxuXHRhZnRlckNsZWFyPzogc3RyaW5nO1xuXG5cdEBibG9ja0FnZ3JlZ2F0aW9uKHtcblx0XHR0eXBlOiBcInNhcC5mZS5tYWNyb3MuRmlsdGVyRmllbGRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRoYXNWaXJ0dWFsTm9kZTogdHJ1ZSxcblx0XHRwcm9jZXNzQWdncmVnYXRpb25zOiBzZXRDdXN0b21GaWx0ZXJGaWVsZFByb3BlcnRpZXNcblx0fSlcblx0ZmlsdGVyRmllbGRzPzogRmlsdGVyRmllbGQ7XG5cblx0X2FwaUlkOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0X2NvbnRlbnRJZDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdF92YWx1ZUhlbHBzOiBBcnJheTxzdHJpbmc+IHwgXCJcIiB8IHVuZGVmaW5lZDtcblxuXHRfZmlsdGVyRmllbGRzOiBBcnJheTxzdHJpbmc+IHwgXCJcIiB8IHVuZGVmaW5lZDtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wczogUHJvcGVydGllc09mPEZpbHRlckJhckJsb2NrPiwgY29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdHN1cGVyKHByb3BzLCBjb25maWd1cmF0aW9uLCBtU2V0dGluZ3MpO1xuXHRcdGlmICghdGhpcy5tZXRhUGF0aCkge1xuXHRcdFx0TG9nLmVycm9yKFwiQ29udGV4dCBQYXRoIG5vdCBhdmFpbGFibGUgZm9yIEZpbHRlckJhciBNYWNyby5cIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHNNZXRhUGF0aCA9IHRoaXMubWV0YVBhdGguZ2V0UGF0aCgpO1xuXHRcdGxldCBlbnRpdHlUeXBlUGF0aCA9IFwiXCI7XG5cdFx0Y29uc3QgbWV0YVBhdGhQYXJ0cyA9IHNNZXRhUGF0aD8uc3BsaXQoXCIvQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiKSB8fCBbXTsgLy8gWzBdOiBlbnRpdHlUeXBlUGF0aCwgWzFdOiBTRiBRdWFsaWZpZXIuXG5cdFx0aWYgKG1ldGFQYXRoUGFydHMubGVuZ3RoID4gMCkge1xuXHRcdFx0ZW50aXR5VHlwZVBhdGggPSB0aGlzLmdldEVudGl0eVR5cGVQYXRoKG1ldGFQYXRoUGFydHMpO1xuXHRcdH1cblx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoZW50aXR5VHlwZVBhdGgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSB0aGlzLmNvbnRleHRQYXRoPy5nZXRNb2RlbCgpO1xuXHRcdHRoaXMuX2ludGVybmFsQ29udGV4dFBhdGggPSBvTWV0YU1vZGVsPy5jcmVhdGVCaW5kaW5nQ29udGV4dChlbnRpdHlUeXBlUGF0aCkgYXMgQ29udGV4dDtcblx0XHRjb25zdCBzT2JqZWN0UGF0aCA9IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiO1xuXHRcdGNvbnN0IGFubm90YXRpb25QYXRoOiBzdHJpbmcgPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIiArICgobWV0YVBhdGhQYXJ0cy5sZW5ndGggJiYgbWV0YVBhdGhQYXJ0c1sxXSkgfHwgXCJcIik7XG5cdFx0Y29uc3Qgb0V4dHJhUGFyYW1zOiBhbnkgPSB7fTtcblx0XHRvRXh0cmFQYXJhbXNbc09iamVjdFBhdGhdID0ge1xuXHRcdFx0ZmlsdGVyRmllbGRzOiB0aGlzLmZpbHRlckZpZWxkc1xuXHRcdH07XG5cdFx0Y29uc3Qgb1Zpc3VhbGl6YXRpb25PYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMuX2ludGVybmFsQ29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IG9Db252ZXJ0ZXJDb250ZXh0ID0gdGhpcy5nZXRDb252ZXJ0ZXJDb250ZXh0KG9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aCwgdW5kZWZpbmVkLCBtU2V0dGluZ3MsIG9FeHRyYVBhcmFtcyk7XG5cdFx0aWYgKCF0aGlzLnByb3BlcnR5SW5mbykge1xuXHRcdFx0dGhpcy5wcm9wZXJ0eUluZm8gPSBnZXRTZWxlY3Rpb25GaWVsZHMob0NvbnZlcnRlckNvbnRleHQsIFtdLCBhbm5vdGF0aW9uUGF0aCkuc1Byb3BlcnR5SW5mbztcblx0XHR9XG5cblx0XHQvL0ZpbHRlciBGaWVsZHMgYW5kIHZhbHVlcyB0byB0aGUgZmllbGQgYXJlIGZpbGxlZCBiYXNlZCBvbiB0aGUgc2VsZWN0aW9uRmllbGRzIGFuZCB0aGlzIHdvdWxkIGJlIGVtcHR5IGluIGNhc2Ugb2YgbWFjcm8gb3V0c2lkZSB0aGUgRkUgdGVtcGxhdGVcblx0XHRpZiAoIXRoaXMuc2VsZWN0aW9uRmllbGRzKSB7XG5cdFx0XHRjb25zdCBvU2VsZWN0aW9uRmllbGRzID0gZ2V0U2VsZWN0aW9uRmllbGRzKG9Db252ZXJ0ZXJDb250ZXh0LCBbXSwgYW5ub3RhdGlvblBhdGgpLnNlbGVjdGlvbkZpZWxkcztcblx0XHRcdHRoaXMuc2VsZWN0aW9uRmllbGRzID0gbmV3IFRlbXBsYXRlTW9kZWwob1NlbGVjdGlvbkZpZWxkcywgb01ldGFNb2RlbCBhcyBPRGF0YU1ldGFNb2RlbCkuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHRcdFx0Y29uc3Qgb0VudGl0eVR5cGUgPSBvQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksXG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gZ2V0U2VsZWN0aW9uVmFyaWFudChvRW50aXR5VHlwZSwgb0NvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCA9IChvTWV0YU1vZGVsIGFzIE9EYXRhTWV0YU1vZGVsKS5nZXRDb250ZXh0KHNFbnRpdHlTZXRQYXRoKSxcblx0XHRcdFx0b0ZpbHRlckNvbmRpdGlvbnMgPSBnZXRGaWx0ZXJDb25kaXRpb25zKG9FbnRpdHlTZXRDb250ZXh0LCB7IHNlbGVjdGlvblZhcmlhbnQ6IG9TZWxlY3Rpb25WYXJpYW50IH0pO1xuXHRcdFx0dGhpcy5maWx0ZXJDb25kaXRpb25zID0gb0ZpbHRlckNvbmRpdGlvbnM7XG5cdFx0fVxuXHRcdHRoaXMuX3Byb2Nlc3NQcm9wZXJ0eUluZm9zKHRoaXMucHJvcGVydHlJbmZvKTtcblxuXHRcdGNvbnN0IHRhcmdldEVudGl0eVNldCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKS50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0O1xuXHRcdGlmICh0YXJnZXRFbnRpdHlTZXQ/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Um9vdCB8fCB0YXJnZXRFbnRpdHlTZXQ/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Tm9kZSkge1xuXHRcdFx0dGhpcy5zaG93RHJhZnRFZGl0U3RhdGUgPSB0cnVlO1xuXHRcdFx0dGhpcy5jaGVja0lmQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkKG9NZXRhTW9kZWwgYXMgT0RhdGFNZXRhTW9kZWwpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9hcHBseUlkVG9Db250ZW50KSB7XG5cdFx0XHR0aGlzLl9hcGlJZCA9IHRoaXMuaWQgKyBcIjo6RmlsdGVyQmFyXCI7XG5cdFx0XHR0aGlzLl9jb250ZW50SWQgPSB0aGlzLmlkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9hcGlJZCA9IHRoaXMuaWQ7XG5cdFx0XHR0aGlzLl9jb250ZW50SWQgPSB0aGlzLmdldENvbnRlbnRJZCh0aGlzLmlkICsgXCJcIik7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuaGlkZUJhc2ljU2VhcmNoICE9PSB0cnVlKSB7XG5cdFx0XHRjb25zdCBvU2VhcmNoUmVzdHJpY3Rpb25Bbm5vdGF0aW9uID0gZ2V0U2VhcmNoUmVzdHJpY3Rpb25zKHNFbnRpdHlTZXRQYXRoLCBvTWV0YU1vZGVsIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0XHRcdHRoaXMuaGlkZUJhc2ljU2VhcmNoID0gQm9vbGVhbihvU2VhcmNoUmVzdHJpY3Rpb25Bbm5vdGF0aW9uICYmICFvU2VhcmNoUmVzdHJpY3Rpb25Bbm5vdGF0aW9uLlNlYXJjaGFibGUpO1xuXHRcdH1cblx0XHR0aGlzLnByb2Nlc3NTZWxlY3Rpb25GaWVsZHMoKTtcblx0fVxuXG5cdF9wcm9jZXNzUHJvcGVydHlJbmZvcyhwcm9wZXJ0eUluZm86IHN0cmluZykge1xuXHRcdGNvbnN0IGFQYXJhbWV0ZXJGaWVsZHM6IHN0cmluZ1tdID0gW107XG5cdFx0aWYgKHByb3BlcnR5SW5mbykge1xuXHRcdFx0Y29uc3Qgc0ZldGNoZWRQcm9wZXJ0aWVzID0gcHJvcGVydHlJbmZvLnJlcGxhY2UoL1xcXFx7L2csIFwie1wiKS5yZXBsYWNlKC9cXFxcfS9nLCBcIn1cIik7XG5cdFx0XHRjb25zdCBhRmV0Y2hlZFByb3BlcnRpZXMgPSBKU09OLnBhcnNlKHNGZXRjaGVkUHJvcGVydGllcyk7XG5cdFx0XHRjb25zdCBlZGl0U3RhdGVMYWJlbCA9IHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJGSUxURVJCQVJfRURJVElOR19TVEFUVVNcIik7XG5cdFx0XHRhRmV0Y2hlZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAocHJvcEluZm86IFByb3BlcnR5SW5mbykge1xuXHRcdFx0XHRpZiAocHJvcEluZm8uaXNQYXJhbWV0ZXIpIHtcblx0XHRcdFx0XHRhUGFyYW1ldGVyRmllbGRzLnB1c2gocHJvcEluZm8ubmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHByb3BJbmZvLnBhdGggPT09IFwiJGVkaXRTdGF0ZVwiKSB7XG5cdFx0XHRcdFx0cHJvcEluZm8ubGFiZWwgPSBlZGl0U3RhdGVMYWJlbDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMucHJvcGVydHlJbmZvID0gSlNPTi5zdHJpbmdpZnkoYUZldGNoZWRQcm9wZXJ0aWVzKS5yZXBsYWNlKC9cXHsvZywgXCJcXFxce1wiKS5yZXBsYWNlKC9cXH0vZywgXCJcXFxcfVwiKTtcblx0XHR9XG5cdFx0dGhpcy5fcGFyYW1ldGVycyA9IEpTT04uc3RyaW5naWZ5KGFQYXJhbWV0ZXJGaWVsZHMpO1xuXHR9XG5cblx0Y2hlY2tJZkNvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCA9IChvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCB8IHVuZGVmaW5lZCkgPT4ge1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChvTWV0YU1vZGVsKSkge1xuXHRcdFx0dGhpcy5pc0RyYWZ0Q29sbGFib3JhdGl2ZSA9IHRydWU7XG5cdFx0fVxuXHR9O1xuXG5cdGdldEVudGl0eVR5cGVQYXRoID0gKG1ldGFQYXRoUGFydHM6IHN0cmluZ1tdKSA9PiB7XG5cdFx0cmV0dXJuIG1ldGFQYXRoUGFydHNbMF0uZW5kc1dpdGgoXCIvXCIpID8gbWV0YVBhdGhQYXJ0c1swXSA6IG1ldGFQYXRoUGFydHNbMF0gKyBcIi9cIjtcblx0fTtcblxuXHRnZXRTZWFyY2ggPSAoKSA9PiB7XG5cdFx0aWYgKCF0aGlzLmhpZGVCYXNpY1NlYXJjaCkge1xuXHRcdFx0cmV0dXJuIHhtbGA8Y29udHJvbDpiYXNpY1NlYXJjaEZpZWxkPlxuXHRcdFx0PG1kYzpGaWx0ZXJGaWVsZFxuXHRcdFx0XHRpZD1cIiR7Z2VuZXJhdGUoW3RoaXMuaWQsIFwiQmFzaWNTZWFyY2hGaWVsZFwiXSl9XCJcblx0XHRcdFx0cGxhY2Vob2xkZXI9XCJ7c2FwLmZlLmkxOG4+TV9GSUxURVJCQVJfU0VBUkNIfVwiXG5cdFx0XHRcdGNvbmRpdGlvbnM9XCJ7JGZpbHRlcnM+L2NvbmRpdGlvbnMvJHNlYXJjaH1cIlxuXHRcdFx0XHRkYXRhVHlwZT1cInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiXG5cdFx0XHRcdG1heENvbmRpdGlvbnM9XCIxXCJcblx0XHRcdC8+XG5cdFx0PC9jb250cm9sOmJhc2ljU2VhcmNoRmllbGQ+YDtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH07XG5cblx0cHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyA9ICgpID0+IHtcblx0XHRsZXQgZHJhZnRFZGl0U3RhdGUgPSBcIlwiO1xuXHRcdGlmICh0aGlzLnNob3dEcmFmdEVkaXRTdGF0ZSkge1xuXHRcdFx0ZHJhZnRFZGl0U3RhdGUgPSBgPGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5maWx0ZXIuRHJhZnRFZGl0U3RhdGVcIiB0eXBlPVwiWE1MXCIgLz5gO1xuXHRcdH1cblx0XHR0aGlzLl92YWx1ZUhlbHBzID0gW107XG5cdFx0dGhpcy5fZmlsdGVyRmllbGRzID0gW107XG5cdFx0dGhpcy5fZmlsdGVyRmllbGRzPy5wdXNoKGRyYWZ0RWRpdFN0YXRlKTtcblx0XHRpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5zZWxlY3Rpb25GaWVsZHMpKSB7XG5cdFx0XHR0aGlzLnNlbGVjdGlvbkZpZWxkcyA9IHRoaXMuc2VsZWN0aW9uRmllbGRzIS5nZXRPYmplY3QoKSBhcyBTZWxlY3Rpb25GaWVsZHM7XG5cdFx0fVxuXHRcdHRoaXMuc2VsZWN0aW9uRmllbGRzPy5mb3JFYWNoKChzZWxlY3Rpb25GaWVsZDogYW55LCBzZWxlY3Rpb25GaWVsZElkeCkgPT4ge1xuXHRcdFx0aWYgKHNlbGVjdGlvbkZpZWxkLmF2YWlsYWJpbGl0eSA9PT0gXCJEZWZhdWx0XCIpIHtcblx0XHRcdFx0dGhpcy5zZXRGaWx0ZXJGaWVsZHNBbmRWYWx1ZUhlbHBzKHNlbGVjdGlvbkZpZWxkLCBzZWxlY3Rpb25GaWVsZElkeCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0dGhpcy5fZmlsdGVyRmllbGRzID0gdGhpcy5fZmlsdGVyRmllbGRzPy5sZW5ndGggPiAwID8gdGhpcy5fZmlsdGVyRmllbGRzIDogXCJcIjtcblx0XHR0aGlzLl92YWx1ZUhlbHBzID0gdGhpcy5fdmFsdWVIZWxwcz8ubGVuZ3RoID4gMCA/IHRoaXMuX3ZhbHVlSGVscHMgOiBcIlwiO1xuXHR9O1xuXG5cdHNldEZpbHRlckZpZWxkc0FuZFZhbHVlSGVscHMgPSAoc2VsZWN0aW9uRmllbGQ6IGFueSwgc2VsZWN0aW9uRmllbGRJZHg6IG51bWJlcikgPT4ge1xuXHRcdGlmIChzZWxlY3Rpb25GaWVsZC50ZW1wbGF0ZSA9PT0gdW5kZWZpbmVkICYmIHNlbGVjdGlvbkZpZWxkLnR5cGUgIT09IFwiU2xvdFwiKSB7XG5cdFx0XHR0aGlzLnB1c2hGaWx0ZXJGaWVsZHNBbmRWYWx1ZUhlbHBzKHNlbGVjdGlvbkZpZWxkKTtcblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodGhpcy5fZmlsdGVyRmllbGRzKSkge1xuXHRcdFx0dGhpcy5fZmlsdGVyRmllbGRzPy5wdXNoKFxuXHRcdFx0XHR4bWxgPHRlbXBsYXRlOndpdGggcGF0aD1cInNlbGVjdGlvbkZpZWxkcz4ke3NlbGVjdGlvbkZpZWxkSWR4fVwiIHZhcj1cIml0ZW1cIj5cblx0XHRcdFx0XHQ8Y29yZTpGcmFnbWVudCBmcmFnbWVudE5hbWU9XCJzYXAuZmUubWFjcm9zLmZpbHRlci5DdXN0b21GaWx0ZXJcIiB0eXBlPVwiWE1MXCIgLz5cblx0XHRcdFx0PC90ZW1wbGF0ZTp3aXRoPmBcblx0XHRcdCk7XG5cdFx0fVxuXHR9O1xuXG5cdF9nZXRDb250ZXh0UGF0aEZvckZpbHRlckZpZWxkKHNlbGVjdGlvbkZpZWxkOiBhbnksIGZpbHRlckJhckNvbnRleHRQYXRoOiBDb250ZXh0KTogc3RyaW5nIHwgQ29udGV4dCB7XG5cdFx0bGV0IGNvbnRleHRQYXRoOiBzdHJpbmcgfCBDb250ZXh0ID0gZmlsdGVyQmFyQ29udGV4dFBhdGg7XG5cdFx0aWYgKHNlbGVjdGlvbkZpZWxkLmlzUGFyYW1ldGVyKSB7XG5cdFx0XHQvLyBFeGFtcGxlOlxuXHRcdFx0Ly8gRmlsdGVyQmFyQ29udGV4dFBhdGg6IC9DdXN0b21lci9TZXRcblx0XHRcdC8vIFBhcmFtZXRlclByb3BlcnR5UGF0aDogL0N1c3RvbWVyL1BfQ0Ncblx0XHRcdC8vIENvbnRleHRQYXRoRm9yRmlsdGVyRmllbGQ6IC9DdXN0b21lclxuXHRcdFx0Y29uc3QgYW5ub1BhdGggPSBzZWxlY3Rpb25GaWVsZC5hbm5vdGF0aW9uUGF0aDtcblx0XHRcdGNvbnRleHRQYXRoID0gYW5ub1BhdGguc3Vic3RyaW5nKDAsIGFubm9QYXRoLmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuXHRcdH1cblx0XHRyZXR1cm4gY29udGV4dFBhdGg7XG5cdH1cblxuXHRwdXNoRmlsdGVyRmllbGRzQW5kVmFsdWVIZWxwcyA9IChzZWxlY3Rpb25GaWVsZDogYW55KSA9PiB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodGhpcy5fZmlsdGVyRmllbGRzKSkge1xuXHRcdFx0dGhpcy5fZmlsdGVyRmllbGRzPy5wdXNoKFxuXHRcdFx0XHR4bWxgPGludGVybmFsTWFjcm86RmlsdGVyRmllbGRcblx0XHRcdGlkUHJlZml4PVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJGaWx0ZXJGaWVsZFwiLCBDb21tb25IZWxwZXIuZ2V0TmF2aWdhdGlvblBhdGgoc2VsZWN0aW9uRmllbGQuYW5ub3RhdGlvblBhdGgpXSl9XCJcblx0XHRcdHZoSWRQcmVmaXg9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIkZpbHRlckZpZWxkVmFsdWVIZWxwXCJdKX1cIlxuXHRcdFx0cHJvcGVydHk9XCIke3NlbGVjdGlvbkZpZWxkLmFubm90YXRpb25QYXRofVwiXG5cdFx0XHRjb250ZXh0UGF0aD1cIiR7dGhpcy5fZ2V0Q29udGV4dFBhdGhGb3JGaWx0ZXJGaWVsZChzZWxlY3Rpb25GaWVsZCwgdGhpcy5faW50ZXJuYWxDb250ZXh0UGF0aCl9XCJcblx0XHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlPVwiJHt0aGlzLnVzZVNlbWFudGljRGF0ZVJhbmdlfVwiXG5cdFx0XHRzZXR0aW5ncz1cIiR7Q29tbW9uSGVscGVyLnN0cmluZ2lmeUN1c3RvbURhdGEoc2VsZWN0aW9uRmllbGQuc2V0dGluZ3MpfVwiXG5cdFx0XHR2aXN1YWxGaWx0ZXI9XCIke3NlbGVjdGlvbkZpZWxkLnZpc3VhbEZpbHRlcn1cIlxuXHRcdFx0Lz5gXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRpZiAoQXJyYXkuaXNBcnJheSh0aGlzLl92YWx1ZUhlbHBzKSkge1xuXHRcdFx0dGhpcy5fdmFsdWVIZWxwcz8ucHVzaChcblx0XHRcdFx0eG1sYDxtYWNybzpWYWx1ZUhlbHBcblx0XHRcdGlkUHJlZml4PVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJGaWx0ZXJGaWVsZFZhbHVlSGVscFwiXSl9XCJcblx0XHRcdGNvbmRpdGlvbk1vZGVsPVwiJGZpbHRlcnNcIlxuXHRcdFx0cHJvcGVydHk9XCIke3NlbGVjdGlvbkZpZWxkLmFubm90YXRpb25QYXRofVwiXG5cdFx0XHRjb250ZXh0UGF0aD1cIiR7dGhpcy5fZ2V0Q29udGV4dFBhdGhGb3JGaWx0ZXJGaWVsZChzZWxlY3Rpb25GaWVsZCwgdGhpcy5faW50ZXJuYWxDb250ZXh0UGF0aCl9XCJcblx0XHRcdGZpbHRlckZpZWxkVmFsdWVIZWxwPVwidHJ1ZVwiXG5cdFx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZT1cIiR7dGhpcy51c2VTZW1hbnRpY0RhdGVSYW5nZX1cIlxuXHRcdC8+YFxuXHRcdFx0KTtcblx0XHR9XG5cdH07XG5cblx0Z2V0VGVtcGxhdGUoKSB7XG5cdFx0Y29uc3QgaW50ZXJuYWxDb250ZXh0UGF0aCA9IHRoaXMuX2ludGVybmFsQ29udGV4dFBhdGg/LmdldFBhdGgoKTtcblx0XHRsZXQgZmlsdGVyRGVsZWdhdGUgPSBcIlwiO1xuXHRcdGlmICh0aGlzLmZpbHRlckJhckRlbGVnYXRlKSB7XG5cdFx0XHRmaWx0ZXJEZWxlZ2F0ZSA9IHRoaXMuZmlsdGVyQmFyRGVsZWdhdGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZpbHRlckRlbGVnYXRlID0gXCJ7bmFtZTonc2FwL2ZlL21hY3Jvcy9maWx0ZXJCYXIvRmlsdGVyQmFyRGVsZWdhdGUnLCBwYXlsb2FkOiB7ZW50aXR5VHlwZVBhdGg6ICdcIiArIGludGVybmFsQ29udGV4dFBhdGggKyBcIid9fVwiO1xuXHRcdH1cblx0XHRyZXR1cm4geG1sYDxtYWNyb0ZpbHRlckJhcjpGaWx0ZXJCYXJBUElcbiAgICAgICAgeG1sbnM6dGVtcGxhdGU9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUudGVtcGxhdGUvMVwiXG4gICAgICAgIHhtbG5zOmNvcmU9XCJzYXAudWkuY29yZVwiXG4gICAgICAgIHhtbG5zOm1kYz1cInNhcC51aS5tZGNcIlxuICAgICAgICB4bWxuczpjb250cm9sPVwic2FwLmZlLmNvcmUuY29udHJvbHNcIlxuICAgICAgICB4bWxuczptYWNyb0ZpbHRlckJhcj1cInNhcC5mZS5tYWNyb3MuZmlsdGVyQmFyXCJcbiAgICAgICAgeG1sbnM6bWFjcm89XCJzYXAuZmUubWFjcm9zXCJcbiAgICAgICAgeG1sbnM6aW50ZXJuYWxNYWNybz1cInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIlxuICAgICAgICB4bWxuczpjdXN0b21EYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0aWQ9XCIke3RoaXMuX2FwaUlkfVwiXG5cdFx0c2VhcmNoPVwiJHt0aGlzLnNlYXJjaH1cIlxuXHRcdGZpbHRlckNoYW5nZWQ9XCIke3RoaXMuZmlsdGVyQ2hhbmdlZH1cIlxuXHRcdGFmdGVyQ2xlYXI9XCIke3RoaXMuYWZ0ZXJDbGVhcn1cIlxuXHRcdGludGVybmFsU2VhcmNoPVwiJHt0aGlzLmludGVybmFsU2VhcmNofVwiXG5cdFx0aW50ZXJuYWxGaWx0ZXJDaGFuZ2VkPVwiJHt0aGlzLmludGVybmFsRmlsdGVyQ2hhbmdlZH1cIlxuXHRcdHN0YXRlQ2hhbmdlPVwiJHt0aGlzLnN0YXRlQ2hhbmdlfVwiXG5cdD5cblx0XHQ8Y29udHJvbDpGaWx0ZXJCYXJcblx0XHRcdGNvcmU6cmVxdWlyZT1cIntBUEk6ICdzYXAvZmUvbWFjcm9zL2ZpbHRlckJhci9GaWx0ZXJCYXJBUEknfVwiXG5cdFx0XHRpZD1cIiR7dGhpcy5fY29udGVudElkfVwiXG5cdFx0XHRsaXZlTW9kZT1cIiR7dGhpcy5saXZlTW9kZX1cIlxuXHRcdFx0ZGVsZWdhdGU9XCIke2ZpbHRlckRlbGVnYXRlfVwiXG5cdFx0XHR2YXJpYW50QmFja3JlZmVyZW5jZT1cIiR7dGhpcy52YXJpYW50QmFja3JlZmVyZW5jZX1cIlxuXHRcdFx0c2hvd0FkYXB0RmlsdGVyc0J1dHRvbj1cIiR7dGhpcy5zaG93QWRhcHRGaWx0ZXJzQnV0dG9ufVwiXG5cdFx0XHRzaG93Q2xlYXJCdXR0b249XCIke3RoaXMuc2hvd0NsZWFyQnV0dG9ufVwiXG5cdFx0XHRwMTNuTW9kZT1cIiR7dGhpcy5wMTNuTW9kZX1cIlxuXHRcdFx0c2VhcmNoPVwiQVBJLmhhbmRsZVNlYXJjaCgkZXZlbnQpXCJcblx0XHRcdGZpbHRlcnNDaGFuZ2VkPVwiQVBJLmhhbmRsZUZpbHRlckNoYW5nZWQoJGV2ZW50KVwiXG5cdFx0XHRmaWx0ZXJDb25kaXRpb25zPVwiJHt0aGlzLmZpbHRlckNvbmRpdGlvbnN9XCJcblx0XHRcdHN1c3BlbmRTZWxlY3Rpb249XCIke3RoaXMuc3VzcGVuZFNlbGVjdGlvbn1cIlxuXHRcdFx0c2hvd01lc3NhZ2VzPVwiJHt0aGlzLnNob3dNZXNzYWdlc31cIlxuXHRcdFx0dG9nZ2xlQ29udHJvbD1cIiR7dGhpcy50b2dnbGVDb250cm9sSWR9XCJcblx0XHRcdGluaXRpYWxMYXlvdXQ9XCIke3RoaXMuaW5pdGlhbExheW91dH1cIlxuXHRcdFx0cHJvcGVydHlJbmZvPVwiJHt0aGlzLnByb3BlcnR5SW5mb31cIlxuXHRcdFx0Y3VzdG9tRGF0YTpsb2NhbElkPVwiJHt0aGlzLmlkfVwiXG5cdFx0XHR2aXNpYmxlPVwiJHt0aGlzLnZpc2libGV9XCJcblx0XHRcdGN1c3RvbURhdGE6aGlkZUJhc2ljU2VhcmNoPVwiJHt0aGlzLmhpZGVCYXNpY1NlYXJjaH1cIlxuXHRcdFx0Y3VzdG9tRGF0YTpzaG93RHJhZnRFZGl0U3RhdGU9XCIke3RoaXMuc2hvd0RyYWZ0RWRpdFN0YXRlfVwiXG5cdFx0XHRjdXN0b21EYXRhOnVzZVNlbWFudGljRGF0ZVJhbmdlPVwiJHt0aGlzLnVzZVNlbWFudGljRGF0ZVJhbmdlfVwiXG5cdFx0XHRjdXN0b21EYXRhOmVudGl0eVR5cGU9XCIke2ludGVybmFsQ29udGV4dFBhdGh9XCJcblx0XHRcdGN1c3RvbURhdGE6cGFyYW1ldGVycz1cIiR7dGhpcy5fcGFyYW1ldGVyc31cIlxuXHRcdD5cblx0XHRcdDxjb250cm9sOmRlcGVuZGVudHM+XG5cdFx0XHRcdCR7dGhpcy5fdmFsdWVIZWxwc31cblx0XHRcdDwvY29udHJvbDpkZXBlbmRlbnRzPlxuXHRcdFx0JHt0aGlzLmdldFNlYXJjaCgpfVxuXHRcdFx0PGNvbnRyb2w6ZmlsdGVySXRlbXM+XG5cdFx0XHRcdCR7dGhpcy5fZmlsdGVyRmllbGRzfVxuXHRcdFx0PC9jb250cm9sOmZpbHRlckl0ZW1zPlxuXHRcdDwvY29udHJvbDpGaWx0ZXJCYXI+XG5cdDwvbWFjcm9GaWx0ZXJCYXI6RmlsdGVyQmFyQVBJPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFxQkEsTUFBTUEsOEJBQThCLEdBQUcsVUFBVUMsZ0JBQXlCLEVBQUVDLGlCQUFzQixFQUFlO0lBQ2hIQSxpQkFBaUIsQ0FBQ0MsUUFBUSxHQUFHRCxpQkFBaUIsQ0FBQ0UsR0FBRztJQUNsREYsaUJBQWlCLENBQUNFLEdBQUcsR0FBR0YsaUJBQWlCLENBQUNFLEdBQUcsQ0FBQ0MsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUM7SUFDdkVILGlCQUFpQixDQUFDSSxLQUFLLEdBQUdMLGdCQUFnQixDQUFDTSxZQUFZLENBQUMsT0FBTyxDQUFDO0lBQ2hFTCxpQkFBaUIsQ0FBQ00sUUFBUSxHQUFHUCxnQkFBZ0IsQ0FBQ00sWUFBWSxDQUFDLFVBQVUsQ0FBQyxLQUFLLE1BQU07SUFDakYsT0FBT0wsaUJBQWlCO0VBQ3pCLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBcEJBLElBMkJxQk8sY0FBYyxXQU5sQ0MsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxXQUFXO0lBQ2pCQyxT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QW1CRyxLQUFLO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FLSCxLQUFLO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FLSCxLQUFLO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BYWIsU0FBUztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BU04sS0FBSztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BS0gsS0FBSztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=
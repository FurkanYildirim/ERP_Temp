/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2023 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlockBase", "sap/fe/core/buildingBlocks/BuildingBlockSupport", "sap/fe/core/buildingBlocks/BuildingBlockTemplateProcessor", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/helpers/Aggregation", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "./fragments/InteractiveBarChart", "./fragments/InteractiveChartWithError", "./fragments/InteractiveLineChart", "./InteractiveChartHelper"], function (Log, BuildingBlockBase, BuildingBlockSupport, BuildingBlockTemplateProcessor, DataVisualization, Aggregation, MetaModelConverter, ModelHelper, StableIdHelper, InteractiveBarChart, InteractiveChartWithError, InteractiveLineChart, InteractiveChartHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24;
  var _exports = {};
  var getInteractiveLineChartTemplate = InteractiveLineChart.getInteractiveLineChartTemplate;
  var getInteractiveChartWithErrorTemplate = InteractiveChartWithError.getInteractiveChartWithErrorTemplate;
  var getInteractiveBarChartTemplate = InteractiveBarChart.getInteractiveBarChartTemplate;
  var generate = StableIdHelper.generate;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getDefaultSelectionVariant = DataVisualization.getDefaultSelectionVariant;
  var xml = BuildingBlockTemplateProcessor.xml;
  var defineBuildingBlock = BuildingBlockSupport.defineBuildingBlock;
  var blockAttribute = BuildingBlockSupport.blockAttribute;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  let VisualFilterBlock = (
  /**
   * Building block for creating a VisualFilter based on the metadata provided by OData V4.
   * <br>
   * A Chart annotation is required to bring up an interactive chart
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:VisualFilter
   *   collection="{entitySet&gt;}"
   *   chartAnnotation="{chartAnnotation&gt;}"
   *   id="someID"
   *   groupId="someGroupID"
   *   title="some Title"
   * /&gt;
   * </pre>
   *
   * @private
   * @experimental
   */
  _dec = defineBuildingBlock({
    name: "VisualFilter",
    namespace: "sap.fe.macros"
  }), _dec2 = blockAttribute({
    type: "string",
    required: true
  }), _dec3 = blockAttribute({
    type: "string"
  }), _dec4 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true,
    expectedTypes: ["EntitySet", "NavigationProperty"]
  }), _dec5 = blockAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec6 = blockAttribute({
    type: "string"
  }), _dec7 = blockAttribute({
    type: "string"
  }), _dec8 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec9 = blockAttribute({
    type: "array"
  }), _dec10 = blockAttribute({
    type: "boolean"
  }), _dec11 = blockAttribute({
    type: "boolean"
  }), _dec12 = blockAttribute({
    type: "boolean"
  }), _dec13 = blockAttribute({
    type: "string"
  }), _dec14 = blockAttribute({
    type: "string"
  }), _dec15 = blockAttribute({
    type: "sap.ui.model.Context"
  }), _dec16 = blockAttribute({
    type: "boolean"
  }), _dec17 = blockAttribute({
    type: "string"
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
    type: "string"
  }), _dec24 = blockAttribute({
    type: "boolean"
  }), _dec25 = blockAttribute({
    type: "boolean"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(VisualFilterBlock, _BuildingBlockBase);
    function VisualFilterBlock(props, configuration, mSettings) {
      var _this$metaPath, _this$chartAnnotation, _this$chartAnnotation2, _this$chartAnnotation4, _this$chartAnnotation5, _this$chartAnnotation6, _this$chartAnnotation7, _visualizations$, _visualizations$$$tar, _visualizations$2, _visualizations$2$$ta, _visualizations$2$$ta2, _visualizations$2$$ta3, _aggregation$Aggregat, _aggregation$Aggregat2, _propertyAnnotations$, _aggregatableProperty, _this$chartAnnotation8, _this$contextPath;
      var _this;
      _this = _BuildingBlockBase.call(this, props, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "outParameter", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "valuelistProperty", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionVariantAnnotation", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "inParameters", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "multipleSelectionAllowed", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "required", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showOverlayInitially", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "renderLineChart", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "requiredProperties", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBarEntityType", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showError", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "chartMeasure", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "UoMHasCustomAggregate", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showValueHelp", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "customAggregate", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "groupId", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "errorMessageTitle", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "errorMessage", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "draftSupported", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isValueListWithFixedValues", _descriptor24, _assertThisInitialized(_this));
      _this.groupId = "$auto.visualFilters";
      _this.path = (_this$metaPath = _this.metaPath) === null || _this$metaPath === void 0 ? void 0 : _this$metaPath.getPath();
      const contextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
      const converterContext = _this.getConverterContext(contextObjectPath, undefined, mSettings);
      const aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
      const customAggregates = aggregationHelper.getCustomAggregateDefinitions();
      const pvAnnotation = contextObjectPath.targetObject;
      let measure;
      const visualizations = pvAnnotation && pvAnnotation.Visualizations;
      _this.getChartAnnotation(visualizations, converterContext);
      let aggregations,
        custAggMeasure = [];
      if ((_this$chartAnnotation = _this.chartAnnotation) !== null && _this$chartAnnotation !== void 0 && (_this$chartAnnotation2 = _this$chartAnnotation.Measures) !== null && _this$chartAnnotation2 !== void 0 && _this$chartAnnotation2.length) {
        custAggMeasure = customAggregates.filter(custAgg => {
          var _this$chartAnnotation3;
          return custAgg.qualifier === ((_this$chartAnnotation3 = _this.chartAnnotation) === null || _this$chartAnnotation3 === void 0 ? void 0 : _this$chartAnnotation3.Measures[0].value);
        });
        measure = custAggMeasure.length > 0 ? custAggMeasure[0].qualifier : _this.chartAnnotation.Measures[0].value;
        aggregations = aggregationHelper.getAggregatedProperties("AggregatedProperties")[0];
      }
      // if there are AggregatedProperty objects but no dynamic measures, rather there are transformation aggregates found in measures
      if (aggregations && aggregations.length > 0 && !((_this$chartAnnotation4 = _this.chartAnnotation) !== null && _this$chartAnnotation4 !== void 0 && _this$chartAnnotation4.DynamicMeasures) && custAggMeasure.length === 0 && (_this$chartAnnotation5 = _this.chartAnnotation) !== null && _this$chartAnnotation5 !== void 0 && _this$chartAnnotation5.Measures && ((_this$chartAnnotation6 = _this.chartAnnotation) === null || _this$chartAnnotation6 === void 0 ? void 0 : _this$chartAnnotation6.Measures.length) > 0) {
        Log.warning("The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly.");
      }
      //if the chart has dynamic measures, but with no other custom aggregate measures then consider the dynamic measures
      if ((_this$chartAnnotation7 = _this.chartAnnotation) !== null && _this$chartAnnotation7 !== void 0 && _this$chartAnnotation7.DynamicMeasures) {
        if (custAggMeasure.length === 0) {
          measure = converterContext.getConverterContextFor(converterContext.getAbsoluteAnnotationPath(_this.chartAnnotation.DynamicMeasures[0].value)).getDataModelObjectPath().targetObject.Name;
          aggregations = aggregationHelper.getAggregatedProperties("AggregatedProperty");
        } else {
          Log.warning("The dynamic measures have been ignored as visual filters can deal with only 1 measure and the first (custom aggregate) measure defined under Chart.Measures is considered.");
        }
      }
      if (customAggregates.some(function (custAgg) {
        return custAgg.qualifier === measure;
      })) {
        _this.customAggregate = true;
      }
      const defaultSelectionVariant = getDefaultSelectionVariant(converterContext.getEntityType());
      _this.checkSelectionVariant(defaultSelectionVariant);
      const aggregation = _this.getAggregateProperties(aggregations, measure);
      if (aggregation) {
        _this.aggregateProperties = aggregation;
      }
      const propertyAnnotations = visualizations && ((_visualizations$ = visualizations[0]) === null || _visualizations$ === void 0 ? void 0 : (_visualizations$$$tar = _visualizations$.$target) === null || _visualizations$$$tar === void 0 ? void 0 : _visualizations$$$tar.Measures) && ((_visualizations$2 = visualizations[0]) === null || _visualizations$2 === void 0 ? void 0 : (_visualizations$2$$ta = _visualizations$2.$target) === null || _visualizations$2$$ta === void 0 ? void 0 : (_visualizations$2$$ta2 = _visualizations$2$$ta.Measures[0]) === null || _visualizations$2$$ta2 === void 0 ? void 0 : (_visualizations$2$$ta3 = _visualizations$2$$ta2.$target) === null || _visualizations$2$$ta3 === void 0 ? void 0 : _visualizations$2$$ta3.annotations);
      const aggregatablePropertyAnnotations = aggregation === null || aggregation === void 0 ? void 0 : (_aggregation$Aggregat = aggregation.AggregatableProperty) === null || _aggregation$Aggregat === void 0 ? void 0 : (_aggregation$Aggregat2 = _aggregation$Aggregat.$target) === null || _aggregation$Aggregat2 === void 0 ? void 0 : _aggregation$Aggregat2.annotations;
      _this.checkIfUOMHasCustomAggregate(customAggregates, propertyAnnotations, aggregatablePropertyAnnotations);
      const propertyHidden = propertyAnnotations === null || propertyAnnotations === void 0 ? void 0 : (_propertyAnnotations$ = propertyAnnotations.UI) === null || _propertyAnnotations$ === void 0 ? void 0 : _propertyAnnotations$.Hidden;
      const aggregatablePropertyHidden = aggregatablePropertyAnnotations === null || aggregatablePropertyAnnotations === void 0 ? void 0 : (_aggregatableProperty = aggregatablePropertyAnnotations.UI) === null || _aggregatableProperty === void 0 ? void 0 : _aggregatableProperty.Hidden;
      const hiddenMeasure = _this.getHiddenMeasure(propertyHidden, aggregatablePropertyHidden, _this.customAggregate);
      const chartType = (_this$chartAnnotation8 = _this.chartAnnotation) === null || _this$chartAnnotation8 === void 0 ? void 0 : _this$chartAnnotation8.ChartType;
      _this.chartType = chartType;
      _this.showValueHelp = _this.getShowValueHelp(chartType, hiddenMeasure);
      _this.draftSupported = ModelHelper.isDraftSupported(mSettings.models.metaModel, (_this$contextPath = _this.contextPath) === null || _this$contextPath === void 0 ? void 0 : _this$contextPath.getPath());
      /**
       * If the measure of the chart is marked as 'hidden', or if the chart type is invalid, or if the data type for the line chart is invalid,
       * the call is made to the InteractiveChartWithError fragment (using error-message related APIs, but avoiding batch calls)
       */
      _this.errorMessage = _this.getErrorMessage(hiddenMeasure, measure);
      _this.chartMeasure = measure;
      _this.measureDimensionTitle = InteractiveChartHelper.getMeasureDimensionTitle(_this.chartAnnotation, _this.customAggregate, _this.aggregateProperties);
      const collection = getInvolvedDataModelObjects(_this.contextPath);
      _this.toolTip = InteractiveChartHelper.getToolTip(_this.chartAnnotation, collection, _this.path, _this.customAggregate, _this.aggregateProperties, _this.renderLineChart);
      _this.UoMVisibility = InteractiveChartHelper.getUoMVisiblity(_this.chartAnnotation, _this.showError);
      _this.scaleUoMTitle = InteractiveChartHelper.getScaleUoMTitle(_this.chartAnnotation, collection, _this.path, _this.customAggregate, _this.aggregateProperties);
      _this.filterCountBinding = InteractiveChartHelper.getfilterCountBinding(_this.chartAnnotation);
      return _this;
    }
    _exports = VisualFilterBlock;
    var _proto = VisualFilterBlock.prototype;
    _proto.checkIfUOMHasCustomAggregate = function checkIfUOMHasCustomAggregate(customAggregates, propertyAnnotations, aggregatablePropertyAnnotations) {
      const measures = propertyAnnotations === null || propertyAnnotations === void 0 ? void 0 : propertyAnnotations.Measures;
      const aggregatablePropertyMeasures = aggregatablePropertyAnnotations === null || aggregatablePropertyAnnotations === void 0 ? void 0 : aggregatablePropertyAnnotations.Measures;
      const UOM = this.getUoM(measures, aggregatablePropertyMeasures);
      if (UOM && customAggregates.some(function (custAgg) {
        return custAgg.qualifier === UOM;
      })) {
        this.UoMHasCustomAggregate = true;
      } else {
        this.UoMHasCustomAggregate = false;
      }
    };
    _proto.getChartAnnotation = function getChartAnnotation(visualizations, converterContext) {
      if (visualizations) {
        for (let i = 0; i < visualizations.length; i++) {
          const sAnnotationPath = visualizations[i] && visualizations[i].value;
          this.chartAnnotation = converterContext.getEntityTypeAnnotation(sAnnotationPath) && converterContext.getEntityTypeAnnotation(sAnnotationPath).annotation;
        }
      }
    };
    _proto.getErrorMessage = function getErrorMessage(hiddenMeasure, measure) {
      let validChartType;
      if (this.chartAnnotation) {
        if (this.chartAnnotation.ChartType === "UI.ChartType/Line" || this.chartAnnotation.ChartType === "UI.ChartType/Bar") {
          validChartType = true;
        } else {
          validChartType = false;
        }
      }
      if (typeof hiddenMeasure === "boolean" && hiddenMeasure || !validChartType || this.renderLineChart === "false") {
        this.showError = true;
        this.errorMessageTitle = hiddenMeasure || !validChartType ? this.getTranslatedText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE") : this.getTranslatedText("M_VISUAL_FILTER_LINE_CHART_INVALID_DATATYPE");
        if (hiddenMeasure) {
          return this.getTranslatedText("M_VISUAL_FILTER_HIDDEN_MEASURE", [measure]);
        } else if (!validChartType) {
          return this.getTranslatedText("M_VISUAL_FILTER_UNSUPPORTED_CHART_TYPE");
        } else {
          return this.getTranslatedText("M_VISUAL_FILTER_LINE_CHART_UNSUPPORTED_DIMENSION");
        }
      }
    };
    _proto.getShowValueHelp = function getShowValueHelp(chartType, hiddenMeasure) {
      var _this$chartAnnotation9, _this$chartAnnotation10;
      const sDimensionType = ((_this$chartAnnotation9 = this.chartAnnotation) === null || _this$chartAnnotation9 === void 0 ? void 0 : _this$chartAnnotation9.Dimensions[0]) && ((_this$chartAnnotation10 = this.chartAnnotation) === null || _this$chartAnnotation10 === void 0 ? void 0 : _this$chartAnnotation10.Dimensions[0].$target) && this.chartAnnotation.Dimensions[0].$target.type;
      if (sDimensionType === "Edm.Date" || sDimensionType === "Edm.Time" || sDimensionType === "Edm.DateTimeOffset") {
        return false;
      } else if (typeof hiddenMeasure === "boolean" && hiddenMeasure) {
        return false;
      } else if (!(chartType === "UI.ChartType/Bar" || chartType === "UI.ChartType/Line")) {
        return false;
      } else if (this.renderLineChart === "false" && chartType === "UI.ChartType/Line") {
        return false;
      } else if (this.isValueListWithFixedValues === true) {
        return false;
      } else {
        return true;
      }
    };
    _proto.checkSelectionVariant = function checkSelectionVariant(defaultSelectionVariant) {
      let selectionVariant;
      if (this.selectionVariantAnnotation) {
        var _this$metaPath2;
        const selectionVariantContext = (_this$metaPath2 = this.metaPath) === null || _this$metaPath2 === void 0 ? void 0 : _this$metaPath2.getModel().createBindingContext(this.selectionVariantAnnotation.getPath());
        selectionVariant = selectionVariantContext && getInvolvedDataModelObjects(selectionVariantContext, this.contextPath).targetObject;
      }
      if (!selectionVariant && defaultSelectionVariant) {
        selectionVariant = defaultSelectionVariant;
      }
      if (selectionVariant && selectionVariant.SelectOptions && !this.multipleSelectionAllowed) {
        for (const selectOption of selectionVariant.SelectOptions) {
          var _this$chartAnnotation11;
          if (selectOption.PropertyName.value === ((_this$chartAnnotation11 = this.chartAnnotation) === null || _this$chartAnnotation11 === void 0 ? void 0 : _this$chartAnnotation11.Dimensions[0].value)) {
            if (selectOption.Ranges.length > 1) {
              Log.error("Multiple SelectOptions for FilterField having SingleValue Allowed Expression");
            }
          }
        }
      }
    };
    _proto.getAggregateProperties = function getAggregateProperties(aggregations, measure) {
      let matchedAggregate;
      if (!aggregations) {
        return;
      }
      aggregations.some(function (aggregate) {
        if (aggregate.Name === measure) {
          matchedAggregate = aggregate;
          return true;
        }
      });
      return matchedAggregate;
    };
    _proto.getUoM = function getUoM(measures, aggregatablePropertyMeasures) {
      var _ISOCurrency, _unit;
      let ISOCurrency = measures === null || measures === void 0 ? void 0 : measures.ISOCurrency;
      let unit = measures === null || measures === void 0 ? void 0 : measures.Unit;
      if (!ISOCurrency && !unit && aggregatablePropertyMeasures) {
        ISOCurrency = aggregatablePropertyMeasures.ISOCurrency;
        unit = aggregatablePropertyMeasures.Unit;
      }
      return ((_ISOCurrency = ISOCurrency) === null || _ISOCurrency === void 0 ? void 0 : _ISOCurrency.path) || ((_unit = unit) === null || _unit === void 0 ? void 0 : _unit.path);
    };
    _proto.getHiddenMeasure = function getHiddenMeasure(propertyHidden, aggregatablePropertyHidden, customAggregate) {
      if (!customAggregate && aggregatablePropertyHidden) {
        return aggregatablePropertyHidden.valueOf();
      } else {
        return propertyHidden === null || propertyHidden === void 0 ? void 0 : propertyHidden.valueOf();
      }
    };
    _proto.getRequired = function getRequired() {
      if (this.required) {
        return xml`<Label text="" width="0.5rem" required="true">
							<layoutData>
								<OverflowToolbarLayoutData priority="Never" />
							</layoutData>
						</Label>`;
      } else {
        return "";
      }
    };
    _proto.getUoMTitle = function getUoMTitle(showErrorExpression) {
      if (this.UoMVisibility) {
        return xml`<Title
							id="${generate([this.id, "ScaleUoMTitle"])}"
							visible="{= !${showErrorExpression}}"
							text="${this.scaleUoMTitle}"
							titleStyle="H6"
							level="H3"
							width="4.15rem"
						/>`;
      } else {
        return "";
      }
    };
    _proto.getValueHelp = function getValueHelp(showErrorExpression) {
      if (this.showValueHelp) {
        return xml`<ToolbarSpacer />
						<Button
							id="${generate([this.id, "VisualFilterValueHelpButton"])}"
							type="Transparent"
							ariaHasPopup="Dialog"
							text="${this.filterCountBinding}"
							press="VisualFilterRuntime.fireValueHelp"
							enabled="{= !${showErrorExpression}}"
							customData:multipleSelectionAllowed="${this.multipleSelectionAllowed}"
						>
							<layoutData>
								<OverflowToolbarLayoutData priority="Never" />
							</layoutData>
						</Button>`;
      } else {
        return "";
      }
    };
    _proto.getInteractiveChartFragment = function getInteractiveChartFragment() {
      if (this.showError) {
        return getInteractiveChartWithErrorTemplate(this);
      } else if (this.chartType === "UI.ChartType/Bar") {
        return getInteractiveBarChartTemplate(this);
      } else if (this.chartType === "UI.ChartType/Line") {
        return getInteractiveLineChartTemplate(this);
      }
      return "";
    };
    _proto.getTemplate = function getTemplate() {
      const id = generate([this.path]);
      const showErrorExpression = "${internal>" + id + "/showError}";
      return xml`
		<control:VisualFilter
		core:require="{VisualFilterRuntime: 'sap/fe/macros/visualfilters/VisualFilterRuntime'}"
		xmlns="sap.m"
		xmlns:control="sap.fe.core.controls.filterbar"
		xmlns:customData="http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1"
		xmlns:core="sap.ui.core"
		id="${this.id}"
		height="13rem"
		width="20.5rem"
		class="sapUiSmallMarginBeginEnd"
		customData:infoPath="${generate([this.path])}"
	>
		<VBox height="2rem" class="sapUiSmallMarginBottom">
			<OverflowToolbar style="Clear">
				${this.getRequired()}
				<Title
					id="${generate([this.id, "MeasureDimensionTitle"])}"
					text="${this.measureDimensionTitle}"
					tooltip="${this.toolTip}"
					titleStyle="H6"
					level="H3"
					class="sapUiTinyMarginEnd sapUiNoMarginBegin"
				/>
				${this.getUoMTitle(showErrorExpression)}
				${this.getValueHelp(showErrorExpression)}
			</OverflowToolbar>
		</VBox>
		<VBox height="100%" width="100%">
			${this.getInteractiveChartFragment()}
		</VBox>
	</control:VisualFilter>`;
    };
    return VisualFilterBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "outParameter", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "valuelistProperty", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "selectionVariantAnnotation", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "inParameters", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "multipleSelectionAllowed", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "required", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "showOverlayInitially", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "renderLineChart", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "requiredProperties", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "filterBarEntityType", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "showError", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "chartMeasure", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "UoMHasCustomAggregate", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "showValueHelp", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "customAggregate", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "groupId", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "$auto.visualFilters";
    }
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "errorMessageTitle", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "errorMessage", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "draftSupported", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "isValueListWithFixedValues", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = VisualFilterBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXJCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiYmxvY2tBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJleHBlY3RlZFR5cGVzIiwicHJvcHMiLCJjb25maWd1cmF0aW9uIiwibVNldHRpbmdzIiwiZ3JvdXBJZCIsInBhdGgiLCJtZXRhUGF0aCIsImdldFBhdGgiLCJjb250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImNvbnRleHRQYXRoIiwiY29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJ1bmRlZmluZWQiLCJhZ2dyZWdhdGlvbkhlbHBlciIsIkFnZ3JlZ2F0aW9uSGVscGVyIiwiZ2V0RW50aXR5VHlwZSIsImN1c3RvbUFnZ3JlZ2F0ZXMiLCJnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucyIsInB2QW5ub3RhdGlvbiIsInRhcmdldE9iamVjdCIsIm1lYXN1cmUiLCJ2aXN1YWxpemF0aW9ucyIsIlZpc3VhbGl6YXRpb25zIiwiZ2V0Q2hhcnRBbm5vdGF0aW9uIiwiYWdncmVnYXRpb25zIiwiY3VzdEFnZ01lYXN1cmUiLCJjaGFydEFubm90YXRpb24iLCJNZWFzdXJlcyIsImxlbmd0aCIsImZpbHRlciIsImN1c3RBZ2ciLCJxdWFsaWZpZXIiLCJ2YWx1ZSIsImdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIiwiRHluYW1pY01lYXN1cmVzIiwiTG9nIiwid2FybmluZyIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJnZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsIk5hbWUiLCJzb21lIiwiY3VzdG9tQWdncmVnYXRlIiwiZGVmYXVsdFNlbGVjdGlvblZhcmlhbnQiLCJnZXREZWZhdWx0U2VsZWN0aW9uVmFyaWFudCIsImNoZWNrU2VsZWN0aW9uVmFyaWFudCIsImFnZ3JlZ2F0aW9uIiwiZ2V0QWdncmVnYXRlUHJvcGVydGllcyIsImFnZ3JlZ2F0ZVByb3BlcnRpZXMiLCJwcm9wZXJ0eUFubm90YXRpb25zIiwiJHRhcmdldCIsImFubm90YXRpb25zIiwiYWdncmVnYXRhYmxlUHJvcGVydHlBbm5vdGF0aW9ucyIsIkFnZ3JlZ2F0YWJsZVByb3BlcnR5IiwiY2hlY2tJZlVPTUhhc0N1c3RvbUFnZ3JlZ2F0ZSIsInByb3BlcnR5SGlkZGVuIiwiVUkiLCJIaWRkZW4iLCJhZ2dyZWdhdGFibGVQcm9wZXJ0eUhpZGRlbiIsImhpZGRlbk1lYXN1cmUiLCJnZXRIaWRkZW5NZWFzdXJlIiwiY2hhcnRUeXBlIiwiQ2hhcnRUeXBlIiwic2hvd1ZhbHVlSGVscCIsImdldFNob3dWYWx1ZUhlbHAiLCJkcmFmdFN1cHBvcnRlZCIsIk1vZGVsSGVscGVyIiwiaXNEcmFmdFN1cHBvcnRlZCIsIm1vZGVscyIsIm1ldGFNb2RlbCIsImVycm9yTWVzc2FnZSIsImdldEVycm9yTWVzc2FnZSIsImNoYXJ0TWVhc3VyZSIsIm1lYXN1cmVEaW1lbnNpb25UaXRsZSIsIkludGVyYWN0aXZlQ2hhcnRIZWxwZXIiLCJnZXRNZWFzdXJlRGltZW5zaW9uVGl0bGUiLCJjb2xsZWN0aW9uIiwidG9vbFRpcCIsImdldFRvb2xUaXAiLCJyZW5kZXJMaW5lQ2hhcnQiLCJVb01WaXNpYmlsaXR5IiwiZ2V0VW9NVmlzaWJsaXR5Iiwic2hvd0Vycm9yIiwic2NhbGVVb01UaXRsZSIsImdldFNjYWxlVW9NVGl0bGUiLCJmaWx0ZXJDb3VudEJpbmRpbmciLCJnZXRmaWx0ZXJDb3VudEJpbmRpbmciLCJtZWFzdXJlcyIsImFnZ3JlZ2F0YWJsZVByb3BlcnR5TWVhc3VyZXMiLCJVT00iLCJnZXRVb00iLCJVb01IYXNDdXN0b21BZ2dyZWdhdGUiLCJpIiwic0Fubm90YXRpb25QYXRoIiwiZ2V0RW50aXR5VHlwZUFubm90YXRpb24iLCJhbm5vdGF0aW9uIiwidmFsaWRDaGFydFR5cGUiLCJlcnJvck1lc3NhZ2VUaXRsZSIsImdldFRyYW5zbGF0ZWRUZXh0Iiwic0RpbWVuc2lvblR5cGUiLCJEaW1lbnNpb25zIiwiaXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMiLCJzZWxlY3Rpb25WYXJpYW50Iiwic2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24iLCJzZWxlY3Rpb25WYXJpYW50Q29udGV4dCIsImdldE1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJTZWxlY3RPcHRpb25zIiwibXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkIiwic2VsZWN0T3B0aW9uIiwiUHJvcGVydHlOYW1lIiwiUmFuZ2VzIiwiZXJyb3IiLCJtYXRjaGVkQWdncmVnYXRlIiwiYWdncmVnYXRlIiwiSVNPQ3VycmVuY3kiLCJ1bml0IiwiVW5pdCIsInZhbHVlT2YiLCJnZXRSZXF1aXJlZCIsInhtbCIsImdldFVvTVRpdGxlIiwic2hvd0Vycm9yRXhwcmVzc2lvbiIsImdlbmVyYXRlIiwiaWQiLCJnZXRWYWx1ZUhlbHAiLCJnZXRJbnRlcmFjdGl2ZUNoYXJ0RnJhZ21lbnQiLCJnZXRJbnRlcmFjdGl2ZUNoYXJ0V2l0aEVycm9yVGVtcGxhdGUiLCJnZXRJbnRlcmFjdGl2ZUJhckNoYXJ0VGVtcGxhdGUiLCJnZXRJbnRlcmFjdGl2ZUxpbmVDaGFydFRlbXBsYXRlIiwiZ2V0VGVtcGxhdGUiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlzdWFsRmlsdGVyLmJsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFubm90YXRpb25QYXRoLCBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IEN1c3RvbUFnZ3JlZ2F0ZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IEFnZ3JlZ2F0ZWRQcm9wZXJ0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FuYWx5dGljc1wiO1xuaW1wb3J0IHsgUHJvcGVydHlBbm5vdGF0aW9ucyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvRWRtX1R5cGVzXCI7XG5pbXBvcnQgeyBQcm9wZXJ0eUFubm90YXRpb25zX01lYXN1cmVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9NZWFzdXJlc19FZG1cIjtcbmltcG9ydCB7IENoYXJ0LCBIaWRkZW4sIFNlbGVjdGlvblZhcmlhbnQgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBCdWlsZGluZ0Jsb2NrQmFzZSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja0Jhc2VcIjtcbmltcG9ydCB7IGJsb2NrQXR0cmlidXRlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tTdXBwb3J0XCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1RlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgeyBnZXREZWZhdWx0U2VsZWN0aW9uVmFyaWFudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IHsgUGFyYW1ldGVyVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvVmlzdWFsRmlsdGVyc1wiO1xuaW1wb3J0IENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgQWdncmVnYXRpb25IZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0FnZ3JlZ2F0aW9uXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB7IGdldEludGVyYWN0aXZlQmFyQ2hhcnRUZW1wbGF0ZSB9IGZyb20gXCIuL2ZyYWdtZW50cy9JbnRlcmFjdGl2ZUJhckNoYXJ0XCI7XG5pbXBvcnQgeyBnZXRJbnRlcmFjdGl2ZUNoYXJ0V2l0aEVycm9yVGVtcGxhdGUgfSBmcm9tIFwiLi9mcmFnbWVudHMvSW50ZXJhY3RpdmVDaGFydFdpdGhFcnJvclwiO1xuaW1wb3J0IHsgZ2V0SW50ZXJhY3RpdmVMaW5lQ2hhcnRUZW1wbGF0ZSB9IGZyb20gXCIuL2ZyYWdtZW50cy9JbnRlcmFjdGl2ZUxpbmVDaGFydFwiO1xuaW1wb3J0IEludGVyYWN0aXZlQ2hhcnRIZWxwZXIgZnJvbSBcIi4vSW50ZXJhY3RpdmVDaGFydEhlbHBlclwiO1xuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIFZpc3VhbEZpbHRlciBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiA8YnI+XG4gKiBBIENoYXJ0IGFubm90YXRpb24gaXMgcmVxdWlyZWQgdG8gYnJpbmcgdXAgYW4gaW50ZXJhY3RpdmUgY2hhcnRcbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86VmlzdWFsRmlsdGVyXG4gKiAgIGNvbGxlY3Rpb249XCJ7ZW50aXR5U2V0Jmd0O31cIlxuICogICBjaGFydEFubm90YXRpb249XCJ7Y2hhcnRBbm5vdGF0aW9uJmd0O31cIlxuICogICBpZD1cInNvbWVJRFwiXG4gKiAgIGdyb3VwSWQ9XCJzb21lR3JvdXBJRFwiXG4gKiAgIHRpdGxlPVwic29tZSBUaXRsZVwiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIlZpc3VhbEZpbHRlclwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVmlzdWFsRmlsdGVyQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRpZCE6IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dGl0bGU6IHN0cmluZyA9IFwiXCI7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0ZXhwZWN0ZWRUeXBlczogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogQ29udGV4dDtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRtZXRhUGF0aCE6IENvbnRleHQ7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdG91dFBhcmFtZXRlcj86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0dmFsdWVsaXN0UHJvcGVydHk/OiBzdHJpbmc7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0fSlcblx0c2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24/OiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJhcnJheVwiXG5cdH0pXG5cdGluUGFyYW1ldGVycz86IFBhcmFtZXRlclR5cGVbXTtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdG11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRyZXF1aXJlZD86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHR9KVxuXHRzaG93T3ZlcmxheUluaXRpYWxseT86IGJvb2xlYW47XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdHJlbmRlckxpbmVDaGFydD86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0cmVxdWlyZWRQcm9wZXJ0aWVzPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdH0pXG5cdGZpbHRlckJhckVudGl0eVR5cGU/OiBDb250ZXh0O1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0c2hvd0Vycm9yPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0Y2hhcnRNZWFzdXJlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0VW9NSGFzQ3VzdG9tQWdncmVnYXRlPzogYm9vbGVhbjtcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdH0pXG5cdHNob3dWYWx1ZUhlbHA/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0Y3VzdG9tQWdncmVnYXRlOiBib29sZWFuID0gZmFsc2U7XG5cblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdH0pXG5cdGdyb3VwSWQ6IHN0cmluZyA9IFwiJGF1dG8udmlzdWFsRmlsdGVyc1wiO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIlxuXHR9KVxuXHRlcnJvck1lc3NhZ2VUaXRsZT86IHN0cmluZztcblxuXHRAYmxvY2tBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic3RyaW5nXCJcblx0fSlcblx0ZXJyb3JNZXNzYWdlPzogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0ZHJhZnRTdXBwb3J0ZWQ/OiBib29sZWFuO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0aXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXM6IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cblx0LyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHQgKiBJbnRlcm5hbCBQcm9wZXJ0aWVzXG5cdCAqICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuXHRhZ2dyZWdhdGVQcm9wZXJ0aWVzOiBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlIHwgdW5kZWZpbmVkO1xuXG5cdGNoYXJ0VHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG5cdHBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHRtZWFzdXJlRGltZW5zaW9uVGl0bGU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxuXHR0b29sVGlwOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0VW9NVmlzaWJpbGl0eTogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblxuXHRzY2FsZVVvTVRpdGxlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0ZmlsdGVyQ291bnRCaW5kaW5nOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGNoYXJ0QW5ub3RhdGlvbj86IENoYXJ0O1xuXG5cdGNvbnN0cnVjdG9yKHByb3BzOiBQcm9wZXJ0aWVzT2Y8VmlzdWFsRmlsdGVyQmxvY2s+LCBjb25maWd1cmF0aW9uOiBhbnksIG1TZXR0aW5nczogYW55KSB7XG5cdFx0c3VwZXIocHJvcHMsIGNvbmZpZ3VyYXRpb24sIG1TZXR0aW5ncyk7XG5cdFx0dGhpcy5ncm91cElkID0gXCIkYXV0by52aXN1YWxGaWx0ZXJzXCI7XG5cdFx0dGhpcy5wYXRoID0gdGhpcy5tZXRhUGF0aD8uZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGNvbnRleHRPYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHRoaXMubWV0YVBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IGNvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQoY29udGV4dE9iamVjdFBhdGgsIHVuZGVmaW5lZCwgbVNldHRpbmdzKTtcblx0XHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0Y29uc3QgY3VzdG9tQWdncmVnYXRlcyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zKCk7XG5cdFx0Y29uc3QgcHZBbm5vdGF0aW9uID0gY29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdGxldCBtZWFzdXJlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgdmlzdWFsaXphdGlvbnMgPSBwdkFubm90YXRpb24gJiYgcHZBbm5vdGF0aW9uLlZpc3VhbGl6YXRpb25zO1xuXHRcdHRoaXMuZ2V0Q2hhcnRBbm5vdGF0aW9uKHZpc3VhbGl6YXRpb25zLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRsZXQgYWdncmVnYXRpb25zLFxuXHRcdFx0Y3VzdEFnZ01lYXN1cmUgPSBbXTtcblxuXHRcdGlmICh0aGlzLmNoYXJ0QW5ub3RhdGlvbj8uTWVhc3VyZXM/Lmxlbmd0aCkge1xuXHRcdFx0Y3VzdEFnZ01lYXN1cmUgPSBjdXN0b21BZ2dyZWdhdGVzLmZpbHRlcigoY3VzdEFnZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gY3VzdEFnZy5xdWFsaWZpZXIgPT09IHRoaXMuY2hhcnRBbm5vdGF0aW9uPy5NZWFzdXJlc1swXS52YWx1ZTtcblx0XHRcdH0pO1xuXHRcdFx0bWVhc3VyZSA9IGN1c3RBZ2dNZWFzdXJlLmxlbmd0aCA+IDAgPyBjdXN0QWdnTWVhc3VyZVswXS5xdWFsaWZpZXIgOiB0aGlzLmNoYXJ0QW5ub3RhdGlvbi5NZWFzdXJlc1swXS52YWx1ZTtcblx0XHRcdGFnZ3JlZ2F0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFwiQWdncmVnYXRlZFByb3BlcnRpZXNcIilbMF07XG5cdFx0fVxuXHRcdC8vIGlmIHRoZXJlIGFyZSBBZ2dyZWdhdGVkUHJvcGVydHkgb2JqZWN0cyBidXQgbm8gZHluYW1pYyBtZWFzdXJlcywgcmF0aGVyIHRoZXJlIGFyZSB0cmFuc2Zvcm1hdGlvbiBhZ2dyZWdhdGVzIGZvdW5kIGluIG1lYXN1cmVzXG5cdFx0aWYgKFxuXHRcdFx0YWdncmVnYXRpb25zICYmXG5cdFx0XHRhZ2dyZWdhdGlvbnMubGVuZ3RoID4gMCAmJlxuXHRcdFx0IXRoaXMuY2hhcnRBbm5vdGF0aW9uPy5EeW5hbWljTWVhc3VyZXMgJiZcblx0XHRcdGN1c3RBZ2dNZWFzdXJlLmxlbmd0aCA9PT0gMCAmJlxuXHRcdFx0dGhpcy5jaGFydEFubm90YXRpb24/Lk1lYXN1cmVzICYmXG5cdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbj8uTWVhc3VyZXMubGVuZ3RoID4gMFxuXHRcdCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFwiVGhlIHRyYW5zZm9ybWF0aW9uYWwgYWdncmVnYXRlIG1lYXN1cmVzIGFyZSBjb25maWd1cmVkIGFzIENoYXJ0Lk1lYXN1cmVzIGJ1dCBzaG91bGQgYmUgY29uZmlndXJlZCBhcyBDaGFydC5EeW5hbWljTWVhc3VyZXMgaW5zdGVhZC4gUGxlYXNlIGNoZWNrIHRoZSBTQVAgSGVscCBkb2N1bWVudGF0aW9uIGFuZCBjb3JyZWN0IHRoZSBjb25maWd1cmF0aW9uIGFjY29yZGluZ2x5LlwiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHQvL2lmIHRoZSBjaGFydCBoYXMgZHluYW1pYyBtZWFzdXJlcywgYnV0IHdpdGggbm8gb3RoZXIgY3VzdG9tIGFnZ3JlZ2F0ZSBtZWFzdXJlcyB0aGVuIGNvbnNpZGVyIHRoZSBkeW5hbWljIG1lYXN1cmVzXG5cdFx0aWYgKHRoaXMuY2hhcnRBbm5vdGF0aW9uPy5EeW5hbWljTWVhc3VyZXMpIHtcblx0XHRcdGlmIChjdXN0QWdnTWVhc3VyZS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0bWVhc3VyZSA9IGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihjb252ZXJ0ZXJDb250ZXh0LmdldEFic29sdXRlQW5ub3RhdGlvblBhdGgodGhpcy5jaGFydEFubm90YXRpb24uRHluYW1pY01lYXN1cmVzWzBdLnZhbHVlKSlcblx0XHRcdFx0XHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdC5OYW1lO1xuXHRcdFx0XHRhZ2dyZWdhdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRBZ2dyZWdhdGVkUHJvcGVydGllcyhcIkFnZ3JlZ2F0ZWRQcm9wZXJ0eVwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcdFwiVGhlIGR5bmFtaWMgbWVhc3VyZXMgaGF2ZSBiZWVuIGlnbm9yZWQgYXMgdmlzdWFsIGZpbHRlcnMgY2FuIGRlYWwgd2l0aCBvbmx5IDEgbWVhc3VyZSBhbmQgdGhlIGZpcnN0IChjdXN0b20gYWdncmVnYXRlKSBtZWFzdXJlIGRlZmluZWQgdW5kZXIgQ2hhcnQuTWVhc3VyZXMgaXMgY29uc2lkZXJlZC5cIlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHRjdXN0b21BZ2dyZWdhdGVzLnNvbWUoZnVuY3Rpb24gKGN1c3RBZ2cpIHtcblx0XHRcdFx0cmV0dXJuIGN1c3RBZ2cucXVhbGlmaWVyID09PSBtZWFzdXJlO1xuXHRcdFx0fSlcblx0XHQpIHtcblx0XHRcdHRoaXMuY3VzdG9tQWdncmVnYXRlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRjb25zdCBkZWZhdWx0U2VsZWN0aW9uVmFyaWFudCA9IGdldERlZmF1bHRTZWxlY3Rpb25WYXJpYW50KGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpKTtcblx0XHR0aGlzLmNoZWNrU2VsZWN0aW9uVmFyaWFudChkZWZhdWx0U2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0Y29uc3QgYWdncmVnYXRpb24gPSB0aGlzLmdldEFnZ3JlZ2F0ZVByb3BlcnRpZXMoYWdncmVnYXRpb25zLCBtZWFzdXJlKTtcblx0XHRpZiAoYWdncmVnYXRpb24pIHtcblx0XHRcdHRoaXMuYWdncmVnYXRlUHJvcGVydGllcyA9IGFnZ3JlZ2F0aW9uO1xuXHRcdH1cblx0XHRjb25zdCBwcm9wZXJ0eUFubm90YXRpb25zID1cblx0XHRcdHZpc3VhbGl6YXRpb25zICYmIHZpc3VhbGl6YXRpb25zWzBdPy4kdGFyZ2V0Py5NZWFzdXJlcyAmJiB2aXN1YWxpemF0aW9uc1swXT8uJHRhcmdldD8uTWVhc3VyZXNbMF0/LiR0YXJnZXQ/LmFubm90YXRpb25zO1xuXHRcdGNvbnN0IGFnZ3JlZ2F0YWJsZVByb3BlcnR5QW5ub3RhdGlvbnMgPSBhZ2dyZWdhdGlvbj8uQWdncmVnYXRhYmxlUHJvcGVydHk/LiR0YXJnZXQ/LmFubm90YXRpb25zO1xuXHRcdHRoaXMuY2hlY2tJZlVPTUhhc0N1c3RvbUFnZ3JlZ2F0ZShjdXN0b21BZ2dyZWdhdGVzLCBwcm9wZXJ0eUFubm90YXRpb25zLCBhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zKTtcblx0XHRjb25zdCBwcm9wZXJ0eUhpZGRlbiA9IHByb3BlcnR5QW5ub3RhdGlvbnM/LlVJPy5IaWRkZW47XG5cdFx0Y29uc3QgYWdncmVnYXRhYmxlUHJvcGVydHlIaWRkZW4gPSBhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zPy5VST8uSGlkZGVuO1xuXHRcdGNvbnN0IGhpZGRlbk1lYXN1cmUgPSB0aGlzLmdldEhpZGRlbk1lYXN1cmUocHJvcGVydHlIaWRkZW4sIGFnZ3JlZ2F0YWJsZVByb3BlcnR5SGlkZGVuLCB0aGlzLmN1c3RvbUFnZ3JlZ2F0ZSk7XG5cdFx0Y29uc3QgY2hhcnRUeXBlID0gdGhpcy5jaGFydEFubm90YXRpb24/LkNoYXJ0VHlwZTtcblx0XHR0aGlzLmNoYXJ0VHlwZSA9IGNoYXJ0VHlwZTtcblx0XHR0aGlzLnNob3dWYWx1ZUhlbHAgPSB0aGlzLmdldFNob3dWYWx1ZUhlbHAoY2hhcnRUeXBlLCBoaWRkZW5NZWFzdXJlKTtcblx0XHR0aGlzLmRyYWZ0U3VwcG9ydGVkID0gTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChtU2V0dGluZ3MubW9kZWxzLm1ldGFNb2RlbCwgdGhpcy5jb250ZXh0UGF0aD8uZ2V0UGF0aCgpKTtcblx0XHQvKipcblx0XHQgKiBJZiB0aGUgbWVhc3VyZSBvZiB0aGUgY2hhcnQgaXMgbWFya2VkIGFzICdoaWRkZW4nLCBvciBpZiB0aGUgY2hhcnQgdHlwZSBpcyBpbnZhbGlkLCBvciBpZiB0aGUgZGF0YSB0eXBlIGZvciB0aGUgbGluZSBjaGFydCBpcyBpbnZhbGlkLFxuXHRcdCAqIHRoZSBjYWxsIGlzIG1hZGUgdG8gdGhlIEludGVyYWN0aXZlQ2hhcnRXaXRoRXJyb3IgZnJhZ21lbnQgKHVzaW5nIGVycm9yLW1lc3NhZ2UgcmVsYXRlZCBBUElzLCBidXQgYXZvaWRpbmcgYmF0Y2ggY2FsbHMpXG5cdFx0ICovXG5cdFx0dGhpcy5lcnJvck1lc3NhZ2UgPSB0aGlzLmdldEVycm9yTWVzc2FnZShoaWRkZW5NZWFzdXJlLCBtZWFzdXJlKTtcblx0XHR0aGlzLmNoYXJ0TWVhc3VyZSA9IG1lYXN1cmU7XG5cdFx0dGhpcy5tZWFzdXJlRGltZW5zaW9uVGl0bGUgPSBJbnRlcmFjdGl2ZUNoYXJ0SGVscGVyLmdldE1lYXN1cmVEaW1lbnNpb25UaXRsZShcblx0XHRcdHRoaXMuY2hhcnRBbm5vdGF0aW9uLFxuXHRcdFx0dGhpcy5jdXN0b21BZ2dyZWdhdGUsXG5cdFx0XHR0aGlzLmFnZ3JlZ2F0ZVByb3BlcnRpZXNcblx0XHQpO1xuXHRcdGNvbnN0IGNvbGxlY3Rpb24gPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHModGhpcy5jb250ZXh0UGF0aCk7XG5cdFx0dGhpcy50b29sVGlwID0gSW50ZXJhY3RpdmVDaGFydEhlbHBlci5nZXRUb29sVGlwKFxuXHRcdFx0dGhpcy5jaGFydEFubm90YXRpb24sXG5cdFx0XHRjb2xsZWN0aW9uLFxuXHRcdFx0dGhpcy5wYXRoLFxuXHRcdFx0dGhpcy5jdXN0b21BZ2dyZWdhdGUsXG5cdFx0XHR0aGlzLmFnZ3JlZ2F0ZVByb3BlcnRpZXMsXG5cdFx0XHR0aGlzLnJlbmRlckxpbmVDaGFydFxuXHRcdCk7XG5cdFx0dGhpcy5Vb01WaXNpYmlsaXR5ID0gSW50ZXJhY3RpdmVDaGFydEhlbHBlci5nZXRVb01WaXNpYmxpdHkodGhpcy5jaGFydEFubm90YXRpb24sIHRoaXMuc2hvd0Vycm9yKTtcblx0XHR0aGlzLnNjYWxlVW9NVGl0bGUgPSBJbnRlcmFjdGl2ZUNoYXJ0SGVscGVyLmdldFNjYWxlVW9NVGl0bGUoXG5cdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbixcblx0XHRcdGNvbGxlY3Rpb24sXG5cdFx0XHR0aGlzLnBhdGgsXG5cdFx0XHR0aGlzLmN1c3RvbUFnZ3JlZ2F0ZSxcblx0XHRcdHRoaXMuYWdncmVnYXRlUHJvcGVydGllc1xuXHRcdCk7XG5cdFx0dGhpcy5maWx0ZXJDb3VudEJpbmRpbmcgPSBJbnRlcmFjdGl2ZUNoYXJ0SGVscGVyLmdldGZpbHRlckNvdW50QmluZGluZyh0aGlzLmNoYXJ0QW5ub3RhdGlvbik7XG5cdH1cblxuXHRjaGVja0lmVU9NSGFzQ3VzdG9tQWdncmVnYXRlKFxuXHRcdGN1c3RvbUFnZ3JlZ2F0ZXM6IEFycmF5PEN1c3RvbUFnZ3JlZ2F0ZT4sXG5cdFx0cHJvcGVydHlBbm5vdGF0aW9uczogUHJvcGVydHlBbm5vdGF0aW9ucyxcblx0XHRhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zPzogUHJvcGVydHlBbm5vdGF0aW9uc1xuXHQpIHtcblx0XHRjb25zdCBtZWFzdXJlcyA9IHByb3BlcnR5QW5ub3RhdGlvbnM/Lk1lYXN1cmVzO1xuXHRcdGNvbnN0IGFnZ3JlZ2F0YWJsZVByb3BlcnR5TWVhc3VyZXMgPSBhZ2dyZWdhdGFibGVQcm9wZXJ0eUFubm90YXRpb25zPy5NZWFzdXJlcztcblx0XHRjb25zdCBVT00gPSB0aGlzLmdldFVvTShtZWFzdXJlcywgYWdncmVnYXRhYmxlUHJvcGVydHlNZWFzdXJlcyk7XG5cdFx0aWYgKFxuXHRcdFx0VU9NICYmXG5cdFx0XHRjdXN0b21BZ2dyZWdhdGVzLnNvbWUoZnVuY3Rpb24gKGN1c3RBZ2c6IEN1c3RvbUFnZ3JlZ2F0ZSkge1xuXHRcdFx0XHRyZXR1cm4gY3VzdEFnZy5xdWFsaWZpZXIgPT09IFVPTTtcblx0XHRcdH0pXG5cdFx0KSB7XG5cdFx0XHR0aGlzLlVvTUhhc0N1c3RvbUFnZ3JlZ2F0ZSA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuVW9NSGFzQ3VzdG9tQWdncmVnYXRlID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0Z2V0Q2hhcnRBbm5vdGF0aW9uKHZpc3VhbGl6YXRpb25zOiBBcnJheTxBbm5vdGF0aW9uUGF0aDxDaGFydD4+LCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KSB7XG5cdFx0aWYgKHZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHZpc3VhbGl6YXRpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IHNBbm5vdGF0aW9uUGF0aCA9IHZpc3VhbGl6YXRpb25zW2ldICYmIHZpc3VhbGl6YXRpb25zW2ldLnZhbHVlO1xuXHRcdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbiA9XG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihzQW5ub3RhdGlvblBhdGgpICYmXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbihzQW5ub3RhdGlvblBhdGgpLmFubm90YXRpb247XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Z2V0RXJyb3JNZXNzYWdlKGhpZGRlbk1lYXN1cmU6IE9iamVjdCwgbWVhc3VyZT86IHN0cmluZykge1xuXHRcdGxldCB2YWxpZENoYXJ0VHlwZTtcblx0XHRpZiAodGhpcy5jaGFydEFubm90YXRpb24pIHtcblx0XHRcdGlmICh0aGlzLmNoYXJ0QW5ub3RhdGlvbi5DaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0xpbmVcIiB8fCB0aGlzLmNoYXJ0QW5ub3RhdGlvbi5DaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0JhclwiKSB7XG5cdFx0XHRcdHZhbGlkQ2hhcnRUeXBlID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHZhbGlkQ2hhcnRUeXBlID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICgodHlwZW9mIGhpZGRlbk1lYXN1cmUgPT09IFwiYm9vbGVhblwiICYmIGhpZGRlbk1lYXN1cmUpIHx8ICF2YWxpZENoYXJ0VHlwZSB8fCB0aGlzLnJlbmRlckxpbmVDaGFydCA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHR0aGlzLnNob3dFcnJvciA9IHRydWU7XG5cdFx0XHR0aGlzLmVycm9yTWVzc2FnZVRpdGxlID1cblx0XHRcdFx0aGlkZGVuTWVhc3VyZSB8fCAhdmFsaWRDaGFydFR5cGVcblx0XHRcdFx0XHQ/IHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIilcblx0XHRcdFx0XHQ6IHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJNX1ZJU1VBTF9GSUxURVJfTElORV9DSEFSVF9JTlZBTElEX0RBVEFUWVBFXCIpO1xuXHRcdFx0aWYgKGhpZGRlbk1lYXN1cmUpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0VHJhbnNsYXRlZFRleHQoXCJNX1ZJU1VBTF9GSUxURVJfSElEREVOX01FQVNVUkVcIiwgW21lYXN1cmVdKTtcblx0XHRcdH0gZWxzZSBpZiAoIXZhbGlkQ2hhcnRUeXBlKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFRyYW5zbGF0ZWRUZXh0KFwiTV9WSVNVQUxfRklMVEVSX1VOU1VQUE9SVEVEX0NIQVJUX1RZUEVcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRUcmFuc2xhdGVkVGV4dChcIk1fVklTVUFMX0ZJTFRFUl9MSU5FX0NIQVJUX1VOU1VQUE9SVEVEX0RJTUVOU0lPTlwiKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRnZXRTaG93VmFsdWVIZWxwKGNoYXJ0VHlwZT86IHN0cmluZywgaGlkZGVuTWVhc3VyZT86IE9iamVjdCkge1xuXHRcdGNvbnN0IHNEaW1lbnNpb25UeXBlID1cblx0XHRcdHRoaXMuY2hhcnRBbm5vdGF0aW9uPy5EaW1lbnNpb25zWzBdICYmXG5cdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbj8uRGltZW5zaW9uc1swXS4kdGFyZ2V0ICYmXG5cdFx0XHR0aGlzLmNoYXJ0QW5ub3RhdGlvbi5EaW1lbnNpb25zWzBdLiR0YXJnZXQudHlwZTtcblx0XHRpZiAoc0RpbWVuc2lvblR5cGUgPT09IFwiRWRtLkRhdGVcIiB8fCBzRGltZW5zaW9uVHlwZSA9PT0gXCJFZG0uVGltZVwiIHx8IHNEaW1lbnNpb25UeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgaGlkZGVuTWVhc3VyZSA9PT0gXCJib29sZWFuXCIgJiYgaGlkZGVuTWVhc3VyZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAoIShjaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0JhclwiIHx8IGNoYXJ0VHlwZSA9PT0gXCJVSS5DaGFydFR5cGUvTGluZVwiKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5yZW5kZXJMaW5lQ2hhcnQgPT09IFwiZmFsc2VcIiAmJiBjaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0xpbmVcIikge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5pc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyA9PT0gdHJ1ZSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cblxuXHRjaGVja1NlbGVjdGlvblZhcmlhbnQoZGVmYXVsdFNlbGVjdGlvblZhcmlhbnQ/OiBTZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0bGV0IHNlbGVjdGlvblZhcmlhbnQ7XG5cdFx0aWYgKHRoaXMuc2VsZWN0aW9uVmFyaWFudEFubm90YXRpb24pIHtcblx0XHRcdGNvbnN0IHNlbGVjdGlvblZhcmlhbnRDb250ZXh0ID0gdGhpcy5tZXRhUGF0aD8uZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dCh0aGlzLnNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uLmdldFBhdGgoKSk7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50ID1cblx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudENvbnRleHQgJiYgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHNlbGVjdGlvblZhcmlhbnRDb250ZXh0LCB0aGlzLmNvbnRleHRQYXRoKS50YXJnZXRPYmplY3Q7XG5cdFx0fVxuXHRcdGlmICghc2VsZWN0aW9uVmFyaWFudCAmJiBkZWZhdWx0U2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudCA9IGRlZmF1bHRTZWxlY3Rpb25WYXJpYW50O1xuXHRcdH1cblx0XHRpZiAoc2VsZWN0aW9uVmFyaWFudCAmJiBzZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMgJiYgIXRoaXMubXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHNlbGVjdE9wdGlvbiBvZiBzZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMpIHtcblx0XHRcdFx0aWYgKHNlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUudmFsdWUgPT09IHRoaXMuY2hhcnRBbm5vdGF0aW9uPy5EaW1lbnNpb25zWzBdLnZhbHVlKSB7XG5cdFx0XHRcdFx0aWYgKHNlbGVjdE9wdGlvbi5SYW5nZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiTXVsdGlwbGUgU2VsZWN0T3B0aW9ucyBmb3IgRmlsdGVyRmllbGQgaGF2aW5nIFNpbmdsZVZhbHVlIEFsbG93ZWQgRXhwcmVzc2lvblwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0Z2V0QWdncmVnYXRlUHJvcGVydGllcyhhZ2dyZWdhdGlvbnM6IEFnZ3JlZ2F0ZWRQcm9wZXJ0eVR5cGVbXSwgbWVhc3VyZT86IHN0cmluZykge1xuXHRcdGxldCBtYXRjaGVkQWdncmVnYXRlOiBBZ2dyZWdhdGVkUHJvcGVydHlUeXBlIHwgdW5kZWZpbmVkO1xuXHRcdGlmICghYWdncmVnYXRpb25zKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGFnZ3JlZ2F0aW9ucy5zb21lKGZ1bmN0aW9uIChhZ2dyZWdhdGUpIHtcblx0XHRcdGlmIChhZ2dyZWdhdGUuTmFtZSA9PT0gbWVhc3VyZSkge1xuXHRcdFx0XHRtYXRjaGVkQWdncmVnYXRlID0gYWdncmVnYXRlO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gbWF0Y2hlZEFnZ3JlZ2F0ZTtcblx0fVxuXG5cdGdldFVvTShtZWFzdXJlcz86IFByb3BlcnR5QW5ub3RhdGlvbnNfTWVhc3VyZXMsIGFnZ3JlZ2F0YWJsZVByb3BlcnR5TWVhc3VyZXM/OiBQcm9wZXJ0eUFubm90YXRpb25zX01lYXN1cmVzKSB7XG5cdFx0bGV0IElTT0N1cnJlbmN5ID0gbWVhc3VyZXM/LklTT0N1cnJlbmN5O1xuXHRcdGxldCB1bml0ID0gbWVhc3VyZXM/LlVuaXQ7XG5cdFx0aWYgKCFJU09DdXJyZW5jeSAmJiAhdW5pdCAmJiBhZ2dyZWdhdGFibGVQcm9wZXJ0eU1lYXN1cmVzKSB7XG5cdFx0XHRJU09DdXJyZW5jeSA9IGFnZ3JlZ2F0YWJsZVByb3BlcnR5TWVhc3VyZXMuSVNPQ3VycmVuY3k7XG5cdFx0XHR1bml0ID0gYWdncmVnYXRhYmxlUHJvcGVydHlNZWFzdXJlcy5Vbml0O1xuXHRcdH1cblx0XHRyZXR1cm4gKElTT0N1cnJlbmN5IGFzIFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbjxTdHJpbmc+KT8ucGF0aCB8fCAodW5pdCBhcyBQYXRoQW5ub3RhdGlvbkV4cHJlc3Npb248U3RyaW5nPik/LnBhdGg7XG5cdH1cblxuXHRnZXRIaWRkZW5NZWFzdXJlKHByb3BlcnR5SGlkZGVuOiBIaWRkZW4sIGFnZ3JlZ2F0YWJsZVByb3BlcnR5SGlkZGVuPzogSGlkZGVuLCBjdXN0b21BZ2dyZWdhdGU/OiBib29sZWFuKSB7XG5cdFx0aWYgKCFjdXN0b21BZ2dyZWdhdGUgJiYgYWdncmVnYXRhYmxlUHJvcGVydHlIaWRkZW4pIHtcblx0XHRcdHJldHVybiBhZ2dyZWdhdGFibGVQcm9wZXJ0eUhpZGRlbi52YWx1ZU9mKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBwcm9wZXJ0eUhpZGRlbj8udmFsdWVPZigpO1xuXHRcdH1cblx0fVxuXG5cdGdldFJlcXVpcmVkKCkge1xuXHRcdGlmICh0aGlzLnJlcXVpcmVkKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxMYWJlbCB0ZXh0PVwiXCIgd2lkdGg9XCIwLjVyZW1cIiByZXF1aXJlZD1cInRydWVcIj5cblx0XHRcdFx0XHRcdFx0PGxheW91dERhdGE+XG5cdFx0XHRcdFx0XHRcdFx0PE92ZXJmbG93VG9vbGJhckxheW91dERhdGEgcHJpb3JpdHk9XCJOZXZlclwiIC8+XG5cdFx0XHRcdFx0XHRcdDwvbGF5b3V0RGF0YT5cblx0XHRcdFx0XHRcdDwvTGFiZWw+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHR9XG5cblx0Z2V0VW9NVGl0bGUoc2hvd0Vycm9yRXhwcmVzc2lvbjogc3RyaW5nKSB7XG5cdFx0aWYgKHRoaXMuVW9NVmlzaWJpbGl0eSkge1xuXHRcdFx0cmV0dXJuIHhtbGA8VGl0bGVcblx0XHRcdFx0XHRcdFx0aWQ9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIlNjYWxlVW9NVGl0bGVcIl0pfVwiXG5cdFx0XHRcdFx0XHRcdHZpc2libGU9XCJ7PSAhJHtzaG93RXJyb3JFeHByZXNzaW9ufX1cIlxuXHRcdFx0XHRcdFx0XHR0ZXh0PVwiJHt0aGlzLnNjYWxlVW9NVGl0bGV9XCJcblx0XHRcdFx0XHRcdFx0dGl0bGVTdHlsZT1cIkg2XCJcblx0XHRcdFx0XHRcdFx0bGV2ZWw9XCJIM1wiXG5cdFx0XHRcdFx0XHRcdHdpZHRoPVwiNC4xNXJlbVwiXG5cdFx0XHRcdFx0XHQvPmA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0fVxuXG5cdGdldFZhbHVlSGVscChzaG93RXJyb3JFeHByZXNzaW9uOiBzdHJpbmcpIHtcblx0XHRpZiAodGhpcy5zaG93VmFsdWVIZWxwKSB7XG5cdFx0XHRyZXR1cm4geG1sYDxUb29sYmFyU3BhY2VyIC8+XG5cdFx0XHRcdFx0XHQ8QnV0dG9uXG5cdFx0XHRcdFx0XHRcdGlkPVwiJHtnZW5lcmF0ZShbdGhpcy5pZCwgXCJWaXN1YWxGaWx0ZXJWYWx1ZUhlbHBCdXR0b25cIl0pfVwiXG5cdFx0XHRcdFx0XHRcdHR5cGU9XCJUcmFuc3BhcmVudFwiXG5cdFx0XHRcdFx0XHRcdGFyaWFIYXNQb3B1cD1cIkRpYWxvZ1wiXG5cdFx0XHRcdFx0XHRcdHRleHQ9XCIke3RoaXMuZmlsdGVyQ291bnRCaW5kaW5nfVwiXG5cdFx0XHRcdFx0XHRcdHByZXNzPVwiVmlzdWFsRmlsdGVyUnVudGltZS5maXJlVmFsdWVIZWxwXCJcblx0XHRcdFx0XHRcdFx0ZW5hYmxlZD1cIns9ICEke3Nob3dFcnJvckV4cHJlc3Npb259fVwiXG5cdFx0XHRcdFx0XHRcdGN1c3RvbURhdGE6bXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkPVwiJHt0aGlzLm11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZH1cIlxuXHRcdFx0XHRcdFx0PlxuXHRcdFx0XHRcdFx0XHQ8bGF5b3V0RGF0YT5cblx0XHRcdFx0XHRcdFx0XHQ8T3ZlcmZsb3dUb29sYmFyTGF5b3V0RGF0YSBwcmlvcml0eT1cIk5ldmVyXCIgLz5cblx0XHRcdFx0XHRcdFx0PC9sYXlvdXREYXRhPlxuXHRcdFx0XHRcdFx0PC9CdXR0b24+YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0fVxuXHR9XG5cblx0Z2V0SW50ZXJhY3RpdmVDaGFydEZyYWdtZW50KCkge1xuXHRcdGlmICh0aGlzLnNob3dFcnJvcikge1xuXHRcdFx0cmV0dXJuIGdldEludGVyYWN0aXZlQ2hhcnRXaXRoRXJyb3JUZW1wbGF0ZSh0aGlzKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuY2hhcnRUeXBlID09PSBcIlVJLkNoYXJ0VHlwZS9CYXJcIikge1xuXHRcdFx0cmV0dXJuIGdldEludGVyYWN0aXZlQmFyQ2hhcnRUZW1wbGF0ZSh0aGlzKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuY2hhcnRUeXBlID09PSBcIlVJLkNoYXJ0VHlwZS9MaW5lXCIpIHtcblx0XHRcdHJldHVybiBnZXRJbnRlcmFjdGl2ZUxpbmVDaGFydFRlbXBsYXRlKHRoaXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fVxuXG5cdGdldFRlbXBsYXRlKCk6IHN0cmluZyB7XG5cdFx0Y29uc3QgaWQgPSBnZW5lcmF0ZShbdGhpcy5wYXRoXSk7XG5cdFx0Y29uc3Qgc2hvd0Vycm9yRXhwcmVzc2lvbiA9IFwiJHtpbnRlcm5hbD5cIiArIGlkICsgXCIvc2hvd0Vycm9yfVwiO1xuXHRcdHJldHVybiB4bWxgXG5cdFx0PGNvbnRyb2w6VmlzdWFsRmlsdGVyXG5cdFx0Y29yZTpyZXF1aXJlPVwie1Zpc3VhbEZpbHRlclJ1bnRpbWU6ICdzYXAvZmUvbWFjcm9zL3Zpc3VhbGZpbHRlcnMvVmlzdWFsRmlsdGVyUnVudGltZSd9XCJcblx0XHR4bWxucz1cInNhcC5tXCJcblx0XHR4bWxuczpjb250cm9sPVwic2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyXCJcblx0XHR4bWxuczpjdXN0b21EYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0eG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCJcblx0XHRpZD1cIiR7dGhpcy5pZH1cIlxuXHRcdGhlaWdodD1cIjEzcmVtXCJcblx0XHR3aWR0aD1cIjIwLjVyZW1cIlxuXHRcdGNsYXNzPVwic2FwVWlTbWFsbE1hcmdpbkJlZ2luRW5kXCJcblx0XHRjdXN0b21EYXRhOmluZm9QYXRoPVwiJHtnZW5lcmF0ZShbdGhpcy5wYXRoXSl9XCJcblx0PlxuXHRcdDxWQm94IGhlaWdodD1cIjJyZW1cIiBjbGFzcz1cInNhcFVpU21hbGxNYXJnaW5Cb3R0b21cIj5cblx0XHRcdDxPdmVyZmxvd1Rvb2xiYXIgc3R5bGU9XCJDbGVhclwiPlxuXHRcdFx0XHQke3RoaXMuZ2V0UmVxdWlyZWQoKX1cblx0XHRcdFx0PFRpdGxlXG5cdFx0XHRcdFx0aWQ9XCIke2dlbmVyYXRlKFt0aGlzLmlkLCBcIk1lYXN1cmVEaW1lbnNpb25UaXRsZVwiXSl9XCJcblx0XHRcdFx0XHR0ZXh0PVwiJHt0aGlzLm1lYXN1cmVEaW1lbnNpb25UaXRsZX1cIlxuXHRcdFx0XHRcdHRvb2x0aXA9XCIke3RoaXMudG9vbFRpcH1cIlxuXHRcdFx0XHRcdHRpdGxlU3R5bGU9XCJINlwiXG5cdFx0XHRcdFx0bGV2ZWw9XCJIM1wiXG5cdFx0XHRcdFx0Y2xhc3M9XCJzYXBVaVRpbnlNYXJnaW5FbmQgc2FwVWlOb01hcmdpbkJlZ2luXCJcblx0XHRcdFx0Lz5cblx0XHRcdFx0JHt0aGlzLmdldFVvTVRpdGxlKHNob3dFcnJvckV4cHJlc3Npb24pfVxuXHRcdFx0XHQke3RoaXMuZ2V0VmFsdWVIZWxwKHNob3dFcnJvckV4cHJlc3Npb24pfVxuXHRcdFx0PC9PdmVyZmxvd1Rvb2xiYXI+XG5cdFx0PC9WQm94PlxuXHRcdDxWQm94IGhlaWdodD1cIjEwMCVcIiB3aWR0aD1cIjEwMCVcIj5cblx0XHRcdCR7dGhpcy5nZXRJbnRlcmFjdGl2ZUNoYXJ0RnJhZ21lbnQoKX1cblx0XHQ8L1ZCb3g+XG5cdDwvY29udHJvbDpWaXN1YWxGaWx0ZXI+YDtcblx0fVxufVxuIl0sIm1hcHBpbmdz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QUM5RCxPQUFPSixHQUFJO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSxJQUFJLENBQUNJLEVBQUc7QUFDaEI7QUFDQTtBQUNBO0FBQ0EseUJBQXlCRCxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUN2SCxJQUFJLENBQUMsQ0FBRTtBQUMvQztBQUNBO0FBQ0E7QUFDQSxNQUFNLElBQUksQ0FBQ21ILFdBQVcsRUFBRztBQUN6QjtBQUNBLFdBQVdJLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQ0MsRUFBRSxFQUFFLHVCQUF1QixDQUFDLENBQUU7QUFDeEQsYUFBYSxJQUFJLENBQUNuRCxxQkFBc0I7QUFDeEMsZ0JBQWdCLElBQUksQ0FBQ0ksT0FBUTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sSUFBSSxDQUFDNEMsV0FBVyxDQUFDQyxtQkFBbUIsQ0FBRTtBQUM1QyxNQUFNLElBQUksQ0FBQ0csWUFBWSxDQUFDSCxtQkFBbUIsQ0FBRTtBQUM3QztBQUNBO0FBQ0E7QUFDQSxLQUFLLElBQUksQ0FBQ0ksMkJBQTJCLEVBQUc7QUFDeEM7QUFDQSx5QkFBeUI7SUFDeEIsQ0FBQztJQUFBO0VBQUEsRUF4ZDZDSyxpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQVUvQyxFQUFFO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9Bd0ZTLEtBQUs7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQUtkLHFCQUFxQjtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=